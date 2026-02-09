<script lang="ts">
	import { ls, rm, vfs_version, format_size } from '../../../state/vfs.svelte';
	import { copy_files } from '../../../state/clipboard.svelte';
	import { consume_pending_file } from '../../../state/file-opener.svelte';
	import { notify } from '../../../state/notifications.svelte';

	// ── Constants ──
	const PICTURES_DIR = '/Users/user/Pictures';
	const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']);

	// ── Types ──
	type PhotoEntry = {
		name: string;
		path: string;
		size: number;
		modified: Date;
		subfolder: string; // '' for root, else subfolder name
	};

	type SidebarItem = {
		id: string;
		label: string;
		icon: string;
	};

	type SidebarSection = {
		title: string;
		items: SidebarItem[];
	};

	type ViewMode = 'grid' | 'list';

	// ── State ──
	let active_item = $state('photos');
	let view_mode = $state<ViewMode>('grid');
	let zoom_level = $state(120);
	let search_query = $state('');
	let selected_photo_path = $state<string | null>(null);

	// ── File opener integration ──
	// On mount, check if a file was opened via the file-opener service.
	// If so, select that image and navigate to the appropriate sidebar section.
	const pending_photo = consume_pending_file();
	if (pending_photo) {
		selected_photo_path = pending_photo.path;
		// Determine the subfolder relative to Pictures to activate the right sidebar item
		if (pending_photo.path.startsWith(PICTURES_DIR + '/')) {
			const relative = pending_photo.path.slice(PICTURES_DIR.length + 1);
			const parts = relative.split('/');
			if (parts.length > 1) {
				// File is in a subfolder, navigate to that folder view
				active_item = `folder-${parts[0]}`;
			} else {
				// File is at root of Pictures, stay on main photos view
				active_item = 'photos';
			}
		}
	}

	// ── Helpers ──

	/** Get the lowercase extension including the dot. */
	function get_extension(name: string): string {
		const idx = name.lastIndexOf('.');
		if (idx < 0) return '';
		return name.slice(idx).toLowerCase();
	}

	/** Check whether a filename looks like a supported image. */
	function is_image_file(name: string): boolean {
		return IMAGE_EXTENSIONS.has(get_extension(name));
	}

	/** Deterministic hash of a string into a number. */
	function hash_string(s: string): number {
		let h = 0;
		for (let i = 0; i < s.length; i++) {
			h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
		}
		return h >>> 0; // unsigned
	}

	/** Generate a pair of HSL colours from a filename for a gradient placeholder. */
	function gradient_from_name(name: string): [string, string] {
		const h = hash_string(name);
		const hue1 = h % 360;
		const hue2 = (hue1 + 40 + (h >> 10) % 60) % 360;
		const sat1 = 55 + (h >> 4) % 30;
		const sat2 = 55 + (h >> 8) % 30;
		return [
			`hsl(${hue1}, ${sat1}%, 55%)`,
			`hsl(${hue2}, ${sat2}%, 45%)`,
		];
	}

	/** Format a Date as a human-friendly month-year label. */
	function date_label(d: Date): string {
		const now = new Date();
		if (
			d.getFullYear() === now.getFullYear() &&
			d.getMonth() === now.getMonth() &&
			d.getDate() === now.getDate()
		) {
			return 'Today';
		}
		return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
	}

	/** Recursively gather image files from a directory. */
	function gather_images(dir_path: string, subfolder: string): PhotoEntry[] {
		const entries: PhotoEntry[] = [];
		const children = ls(dir_path);
		for (const child of children) {
			if (child.type === 'file' && is_image_file(child.name)) {
				entries.push({
					name: child.name,
					path: `${dir_path}/${child.name}`,
					size: child.size,
					modified: child.modified,
					subfolder,
				});
			} else if (child.type === 'dir') {
				// Skip non-image directories like .photoslibrary
				if (child.name.endsWith('.photoslibrary')) continue;
				const sub_label = subfolder ? `${subfolder}/${child.name}` : child.name;
				entries.push(...gather_images(`${dir_path}/${child.name}`, sub_label));
			}
		}
		return entries;
	}

	// ── Sidebar ──
	const static_sidebar: SidebarSection[] = [
		{
			title: 'Library',
			items: [
				{ id: 'photos', label: 'Photos', icon: 'photos' },
				{ id: 'recents', label: 'Recents', icon: 'recents' },
			],
		},
	];

	/** Build the sidebar dynamically from the folder names found in VFS. */
	const sidebar_sections = $derived.by(() => {
		void vfs_version.value; // subscribe to reactivity
		const folders: SidebarItem[] = [];
		const children = ls(PICTURES_DIR);
		for (const child of children) {
			if (child.type === 'dir' && !child.name.endsWith('.photoslibrary')) {
				folders.push({
					id: `folder-${child.name}`,
					label: child.name,
					icon: 'album',
				});
			}
		}
		if (folders.length === 0) return static_sidebar;
		return [
			...static_sidebar,
			{ title: 'Folders', items: folders },
		];
	});

	// ── Photo Data (derived from VFS) ──
	const all_photos = $derived.by((): PhotoEntry[] => {
		void vfs_version.value; // subscribe to reactivity
		const entries = gather_images(PICTURES_DIR, '');
		// Sort newest first
		entries.sort((a, b) => b.modified.getTime() - a.modified.getTime());
		return entries;
	});

	// ── Derived ──
	const current_title = $derived.by(() => {
		if (active_item === 'photos') return 'Photos';
		if (active_item === 'recents') return 'Recents';
		if (active_item.startsWith('folder-')) {
			return active_item.replace('folder-', '');
		}
		return 'Photos';
	});

	const filtered_photos = $derived.by(() => {
		let result = all_photos;

		// Search filter
		if (search_query.trim()) {
			const q = search_query.toLowerCase();
			result = result.filter(
				(p) =>
					p.name.toLowerCase().includes(q) ||
					p.subfolder.toLowerCase().includes(q),
			);
		}

		// Section filter
		if (active_item === 'recents') {
			result = result.slice(0, 15);
		} else if (active_item.startsWith('folder-')) {
			const folder_name = active_item.replace('folder-', '');
			result = result.filter(
				(p) => p.subfolder === folder_name || p.subfolder.startsWith(folder_name + '/'),
			);
		}

		return result;
	});

	const grouped_photos = $derived.by(() => {
		const groups: { label: string; photos: PhotoEntry[] }[] = [];
		const group_map = new Map<string, PhotoEntry[]>();

		for (const photo of filtered_photos) {
			const label = date_label(photo.modified);
			const existing = group_map.get(label);
			if (existing) {
				existing.push(photo);
			} else {
				const arr = [photo];
				group_map.set(label, arr);
				groups.push({ label, photos: arr });
			}
		}

		return groups;
	});

	const photo_count = $derived(filtered_photos.length);

	// ── Actions ──
	function delete_photo(path: string): void {
		const filename = path.split('/').pop() ?? 'Photo';
		rm(path);
		if (selected_photo_path === path) {
			selected_photo_path = null;
		}
		notify({
			app_name: 'Photos',
			app_icon: './app-icons/photos/256.webp',
			title: '1 Photo Deleted',
			body: filename,
		});
	}

	function handle_photos_keydown(e: KeyboardEvent) {
		const meta = e.metaKey || e.ctrlKey;
		if (meta && e.key === 'c' && selected_photo_path) {
			e.preventDefault();
			copy_files([selected_photo_path], 'copy');
		}
	}

	function get_gradient_style(photo: PhotoEntry): string {
		const [c1, c2] = gradient_from_name(photo.name);
		return `background: linear-gradient(135deg, ${c1}, ${c2});`;
	}

</script>

<svelte:window onkeydown={handle_photos_keydown} />

<section class="container">
	<!-- Toolbar -->
	<header class="app-window-drag-handle toolbar">
		<div class="toolbar-left">
			<div class="view-toggle">
				<button
					class="view-btn"
					class:active={view_mode === 'grid'}
					onclick={() => view_mode = 'grid'}
					title="Grid view"
				>
					<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
						<rect x="1" y="1" width="6" height="6" rx="1"/>
						<rect x="9" y="1" width="6" height="6" rx="1"/>
						<rect x="1" y="9" width="6" height="6" rx="1"/>
						<rect x="9" y="9" width="6" height="6" rx="1"/>
					</svg>
				</button>
				<button
					class="view-btn"
					class:active={view_mode === 'list'}
					onclick={() => view_mode = 'list'}
					title="List view"
				>
					<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
						<rect x="1" y="2" width="14" height="2" rx="0.5"/>
						<rect x="1" y="7" width="14" height="2" rx="0.5"/>
						<rect x="1" y="12" width="14" height="2" rx="0.5"/>
					</svg>
				</button>
			</div>
		</div>

		<div class="toolbar-center">
			<span class="toolbar-title">{current_title}</span>
			<span class="toolbar-count">{photo_count} {photo_count === 1 ? 'Photo' : 'Photos'}</span>
		</div>

		<div class="toolbar-right">
			<div class="zoom-control">
				<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" opacity="0.5">
					<rect x="1" y="1" width="5" height="5" rx="0.5"/>
					<rect x="8" y="1" width="5" height="5" rx="0.5"/>
					<rect x="1" y="8" width="5" height="5" rx="0.5"/>
					<rect x="8" y="8" width="5" height="5" rx="0.5"/>
				</svg>
				<input
					type="range"
					min="80"
					max="200"
					bind:value={zoom_level}
					class="zoom-slider"
				/>
				<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" opacity="0.5">
					<rect x="1" y="1" width="6" height="6" rx="1"/>
					<rect x="9" y="1" width="6" height="6" rx="1"/>
					<rect x="1" y="9" width="6" height="6" rx="1"/>
					<rect x="9" y="9" width="6" height="6" rx="1"/>
				</svg>
			</div>
			<div class="search-wrapper">
				<svg class="search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
				</svg>
				<input
					type="text"
					class="search-input"
					placeholder="Search"
					bind:value={search_query}
				/>
			</div>
		</div>
	</header>

	<div class="main">
		<!-- Sidebar -->
		<aside class="sidebar">
			{#each sidebar_sections as group}
				<div class="sidebar-section">
					<div class="sidebar-section-title">{group.title}</div>
					{#each group.items as item}
						<button
							class="sidebar-item"
							class:active={active_item === item.id}
							onclick={() => { active_item = item.id; selected_photo_path = null; }}
						>
							<span class="sidebar-icon">
								{#if item.icon === 'photos'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
								{:else if item.icon === 'recents'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
								{:else if item.icon === 'album'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/></svg>
								{/if}
							</span>
							<span class="sidebar-label">{item.label}</span>
						</button>
					{/each}
				</div>
			{/each}
		</aside>

		<!-- Content area -->
		<div class="content">
			{#if filtered_photos.length === 0}
				<div class="empty-state">
					<div class="empty-icon">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
							<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
						</svg>
					</div>
					<p class="empty-text">No Photos</p>
					<p class="empty-subtext">
						{#if search_query}
							No photos match "{search_query}"
						{:else}
							No image files in {PICTURES_DIR}
						{/if}
					</p>
				</div>
			{:else if view_mode === 'grid'}
				{#each grouped_photos as group}
					<div class="date-group">
						<div class="date-header">
							<h2 class="date-title">{group.label}</h2>
							<span class="date-count">{group.photos.length}</span>
						</div>
						<div class="photo-grid" style="--thumb-size: {zoom_level}px;">
							{#each group.photos as photo (photo.path)}
								<button
									class="photo-tile"
									class:selected={selected_photo_path === photo.path}
									style="{get_gradient_style(photo)} aspect-ratio: 1;"
									onclick={() => selected_photo_path = selected_photo_path === photo.path ? null : photo.path}
									oncontextmenu={(e) => { e.preventDefault(); delete_photo(photo.path); }}
									title="{photo.name} ({format_size(photo.size)})\nRight-click to delete"
								>
									<span class="photo-name-overlay">{photo.name}</span>
									{#if photo.subfolder}
										<span class="subfolder-badge">{photo.subfolder}</span>
									{/if}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			{:else}
				<!-- List view -->
				<div class="photo-list">
					<div class="list-header">
						<span class="list-col-thumb"></span>
						<span class="list-col-name">Name</span>
						<span class="list-col-album">Folder</span>
						<span class="list-col-type">Size</span>
						<span class="list-col-fav"></span>
					</div>
					{#each filtered_photos as photo (photo.path)}
						<button
							class="list-row"
							class:selected={selected_photo_path === photo.path}
							onclick={() => selected_photo_path = selected_photo_path === photo.path ? null : photo.path}
						>
							<span class="list-col-thumb">
								<span class="list-thumb" style="{get_gradient_style(photo)}"></span>
							</span>
							<span class="list-col-name">{photo.name}</span>
							<span class="list-col-album">{photo.subfolder || '/'}</span>
							<span class="list-col-type">{format_size(photo.size)}</span>
							<span class="list-col-fav">
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<span
									class="delete-btn"
									role="button"
									tabindex="-1"
									onclick={(e) => { e.stopPropagation(); delete_photo(photo.path); }}
									onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); delete_photo(photo.path); } }}
									title="Delete"
								>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
								</span>
							</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	/* ── Container ── */
	.container {
		height: 100%;
		width: 100%;
		background-color: var(--system-color-light);
		border-radius: inherit;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		font-family: var(--system-font-family);
		color: var(--system-color-light-contrast);
	}

	/* ── Toolbar ── */
	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 12px;
		min-height: 38px;
		background: linear-gradient(to bottom, #f6f6f6, #ededef);
		border-bottom: 0.5px solid #d1d1d6;
		gap: 12px;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
			border-bottom-color: #1c1c1e;
		}
	}

	.toolbar-left {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.toolbar-center {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
		min-width: 0;
	}

	.toolbar-title {
		font-size: 13px;
		font-weight: 600;
		line-height: 1.2;
	}

	.toolbar-count {
		font-size: 11px;
		color: #86868b;
		line-height: 1.2;
	}

	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-shrink: 0;
	}

	/* View toggle */
	.view-toggle {
		display: flex;
		background: rgba(0, 0, 0, 0.06);
		border-radius: 6px;
		padding: 2px;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.1);
		}
	}

	.view-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 22px;
		border: none;
		background: none;
		color: #6e6e73;
		cursor: pointer;
		border-radius: 4px;

		&.active {
			background: white;
			color: var(--system-color-light-contrast);
			box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
		}

		:global(body.dark) &.active {
			background: #636366;
			color: white;
		}
	}

	/* Zoom control */
	.zoom-control {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.zoom-slider {
		width: 80px;
		height: 4px;
		-webkit-appearance: none;
		appearance: none;
		background: rgba(0, 0, 0, 0.12);
		border-radius: 2px;
		outline: none;
		cursor: pointer;

		&::-webkit-slider-thumb {
			-webkit-appearance: none;
			width: 12px;
			height: 12px;
			border-radius: 50%;
			background: white;
			border: 0.5px solid rgba(0, 0, 0, 0.2);
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
			cursor: pointer;
		}

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.15);

			&::-webkit-slider-thumb {
				background: #b0b0b0;
				border-color: rgba(255, 255, 255, 0.1);
			}
		}
	}

	/* Search */
	.search-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 7px;
		color: #8e8e93;
		pointer-events: none;
	}

	.search-input {
		width: 130px;
		height: 24px;
		padding: 0 8px 0 24px;
		border: none;
		border-radius: 6px;
		background: rgba(0, 0, 0, 0.06);
		font-size: 12px;
		color: var(--system-color-light-contrast);
		outline: none;
		font-family: inherit;

		&::placeholder {
			color: #8e8e93;
		}

		&:focus {
			background: rgba(0, 0, 0, 0.08);
			box-shadow: 0 0 0 2.5px rgba(0, 122, 255, 0.35);
		}

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.08);

			&:focus {
				background: rgba(255, 255, 255, 0.1);
				box-shadow: 0 0 0 2.5px rgba(10, 132, 255, 0.4);
			}
		}
	}

	/* ── Main Layout ── */
	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* ── Sidebar ── */
	.sidebar {
		width: 180px;
		min-width: 180px;
		background: rgba(244, 244, 249, 0.92);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-right: 0.5px solid #d1d1d6;
		padding: 6px 0;
		overflow-y: auto;

		:global(body.dark) & {
			background: rgba(30, 30, 32, 0.88);
			border-right-color: #38383a;
		}
	}

	.sidebar-section {
		margin-bottom: 6px;
	}

	.sidebar-section-title {
		font-size: 11px;
		font-weight: 700;
		color: #86868b;
		padding: 8px 10px 4px;
		text-align: left;
	}

	.sidebar-item {
		display: flex;
		align-items: center;
		gap: 6px;
		width: calc(100% - 8px);
		margin: 0 4px;
		padding: 3px 6px;
		height: 24px;
		border: none;
		background: none;
		font-size: 13px;
		color: var(--system-color-light-contrast);
		cursor: pointer;
		text-align: left;
		border-radius: 6px;
		font-family: inherit;

		&:hover:not(.active) {
			background-color: rgba(0, 0, 0, 0.04);
		}

		&.active {
			background-color: rgba(0, 122, 255, 0.18);
			color: var(--system-color-light-contrast);
		}

		:global(body.dark) &:hover:not(.active) {
			background-color: rgba(255, 255, 255, 0.06);
		}

		:global(body.dark) &.active {
			background-color: rgba(10, 132, 255, 0.25);
			color: white;
		}
	}

	.sidebar-icon {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: #007aff;

		:global(svg) {
			width: 15px;
			height: 15px;
		}

		:global(body.dark) & {
			color: #0a84ff;
		}
	}

	.sidebar-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		line-height: 1;
	}

	/* ── Content ── */
	.content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 12px 16px;
	}

	/* ── Date Groups ── */
	.date-group {
		margin-bottom: 20px;
	}

	.date-header {
		display: flex;
		align-items: baseline;
		gap: 8px;
		margin-bottom: 8px;
		padding: 0 2px;
	}

	.date-title {
		font-size: 17px;
		font-weight: 700;
		margin: 0;
		line-height: 1.3;
	}

	.date-count {
		font-size: 13px;
		color: #86868b;
	}

	/* ── Photo Grid ── */
	.photo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(var(--thumb-size, 120px), 1fr));
		gap: 4px;
	}

	.photo-tile {
		border: none;
		border-radius: 2px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		transition: transform 0.1s, box-shadow 0.15s;
		display: flex;
		align-items: center;
		justify-content: center;

		&:hover {
			transform: scale(1.03);
			z-index: 1;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		}

		&.selected {
			box-shadow: 0 0 0 3px #007aff;
			z-index: 2;
			border-radius: 3px;
		}

		:global(body.dark) &.selected {
			box-shadow: 0 0 0 3px #0a84ff;
		}
	}

	/* Photo name overlay on thumbnails */
	.photo-name-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 14px 4px 4px;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent);
		color: white;
		font-size: 9px;
		line-height: 1.2;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		pointer-events: none;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	/* Subfolder badge */
	.subfolder-badge {
		position: absolute;
		top: 4px;
		left: 4px;
		font-size: 8px;
		font-weight: 700;
		color: white;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(4px);
		padding: 1px 4px;
		border-radius: 3px;
		letter-spacing: 0.3px;
		pointer-events: none;
	}

	/* Photo badges */
	.favorite-badge {
		position: absolute;
		bottom: 4px;
		left: 4px;
		display: flex;
		align-items: center;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
	}

	.media-badge {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
	}

	.video-badge {
		bottom: 4px;
		right: 4px;
	}

	.live-badge {
		top: 4px;
		left: 4px;
		font-size: 8px;
		font-weight: 700;
		color: white;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(4px);
		padding: 1px 4px;
		border-radius: 3px;
		letter-spacing: 0.5px;
	}

	.pano-badge {
		bottom: 4px;
		right: 4px;
	}

	/* ── Empty State ── */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		min-height: 200px;
		gap: 8px;
	}

	.empty-icon {
		margin-bottom: 4px;
	}

	.empty-text {
		font-size: 17px;
		font-weight: 600;
		color: #86868b;
		margin: 0;
	}

	.empty-subtext {
		font-size: 13px;
		color: #aeaeb2;
		margin: 0;
		text-align: center;
		max-width: 280px;
	}

	/* ── List View ── */
	.photo-list {
		display: flex;
		flex-direction: column;
	}

	.list-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 8px;
		font-size: 11px;
		font-weight: 600;
		color: #86868b;
		border-bottom: 0.5px solid #d1d1d6;
		margin-bottom: 2px;

		:global(body.dark) & {
			border-bottom-color: #38383a;
		}
	}

	.list-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 8px;
		border: none;
		background: none;
		font-size: 13px;
		color: var(--system-color-light-contrast);
		cursor: pointer;
		text-align: left;
		border-radius: 4px;
		font-family: inherit;
		width: 100%;

		&:hover {
			background: rgba(0, 0, 0, 0.04);
		}

		&.selected {
			background: rgba(0, 122, 255, 0.18);
		}

		:global(body.dark) &:hover {
			background: rgba(255, 255, 255, 0.06);
		}

		:global(body.dark) &.selected {
			background: rgba(10, 132, 255, 0.25);
			color: white;
		}
	}

	.list-col-thumb {
		width: 32px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.list-thumb {
		width: 28px;
		height: 28px;
		border-radius: 3px;
		display: block;
	}

	.list-col-name {
		flex: 2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.list-col-album {
		flex: 1.5;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: #86868b;
		font-size: 12px;
	}

	.list-col-type {
		flex: 0.8;
		font-size: 12px;
		color: #86868b;
		text-transform: capitalize;
	}

	.list-col-fav {
		width: 20px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.delete-btn {
		border: none;
		background: none;
		color: #86868b;
		cursor: pointer;
		padding: 2px;
		border-radius: 3px;
		display: flex;
		align-items: center;
		justify-content: center;

		&:hover {
			color: #ff3b30;
			background: rgba(255, 59, 48, 0.1);
		}
	}
</style>
