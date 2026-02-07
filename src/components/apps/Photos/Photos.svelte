<script lang="ts">
	// ── Types ──
	type Photo = {
		id: number;
		date: string;
		date_label: string;
		favorite: boolean;
		albums: string[];
		gradient: [string, string];
		aspect: 'landscape' | 'portrait' | 'square';
		media_type?: 'video' | 'selfie' | 'live' | 'panorama' | 'screenshot';
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
	let selected_photo_id = $state<number | null>(null);

	// ── Sidebar ──
	const sidebar_sections: SidebarSection[] = [
		{
			title: 'Library',
			items: [
				{ id: 'photos', label: 'Photos', icon: 'photos' },
				{ id: 'favorites', label: 'Favorites', icon: 'favorites' },
				{ id: 'recents', label: 'Recents', icon: 'recents' },
				{ id: 'imports', label: 'Imports', icon: 'imports' },
			],
		},
		{
			title: 'Albums',
			items: [
				{ id: 'album-vacations', label: 'Vacations', icon: 'album' },
				{ id: 'album-family', label: 'Family', icon: 'album' },
				{ id: 'album-pets', label: 'Pets', icon: 'album' },
				{ id: 'album-screenshots', label: 'Screenshots', icon: 'album' },
				{ id: 'album-selfies', label: 'Selfies', icon: 'album' },
			],
		},
		{
			title: 'Media Types',
			items: [
				{ id: 'media-videos', label: 'Videos', icon: 'video' },
				{ id: 'media-selfies', label: 'Selfies', icon: 'selfie' },
				{ id: 'media-live', label: 'Live Photos', icon: 'live' },
				{ id: 'media-panoramas', label: 'Panoramas', icon: 'panorama' },
				{ id: 'media-screenshots', label: 'Screenshots', icon: 'screenshot' },
			],
		},
	];

	// ── Photo Data ──
	const photos: Photo[] = [
		// Today
		{ id: 1, date: '2024-01-15', date_label: 'Today', favorite: true, albums: ['Vacations'], gradient: ['#ff6b6b', '#ee5a24'], aspect: 'landscape' },
		{ id: 2, date: '2024-01-15', date_label: 'Today', favorite: false, albums: ['Family'], gradient: ['#0abde3', '#48dbfb'], aspect: 'square' },
		{ id: 3, date: '2024-01-15', date_label: 'Today', favorite: false, albums: [], gradient: ['#10ac84', '#1dd1a1'], aspect: 'portrait' },
		{ id: 4, date: '2024-01-15', date_label: 'Today', favorite: true, albums: ['Vacations', 'Family'], gradient: ['#f368e0', '#ff9ff3'], aspect: 'landscape', media_type: 'live' },
		{ id: 5, date: '2024-01-15', date_label: 'Today', favorite: false, albums: ['Selfies'], gradient: ['#ff9f43', '#feca57'], aspect: 'square', media_type: 'selfie' },
		{ id: 6, date: '2024-01-15', date_label: 'Today', favorite: false, albums: [], gradient: ['#5f27cd', '#a55eea'], aspect: 'landscape', media_type: 'video' },

		// January 2024
		{ id: 7, date: '2024-01-10', date_label: 'January 2024', favorite: false, albums: ['Pets'], gradient: ['#01a3a4', '#00d2d3'], aspect: 'square' },
		{ id: 8, date: '2024-01-10', date_label: 'January 2024', favorite: true, albums: ['Pets'], gradient: ['#e58e26', '#f7d794'], aspect: 'landscape' },
		{ id: 9, date: '2024-01-09', date_label: 'January 2024', favorite: false, albums: ['Screenshots'], gradient: ['#d63031', '#e17055'], aspect: 'portrait', media_type: 'screenshot' },
		{ id: 10, date: '2024-01-08', date_label: 'January 2024', favorite: false, albums: ['Family'], gradient: ['#6c5ce7', '#a29bfe'], aspect: 'landscape' },
		{ id: 11, date: '2024-01-07', date_label: 'January 2024', favorite: true, albums: ['Vacations'], gradient: ['#00b894', '#55efc4'], aspect: 'square', media_type: 'live' },
		{ id: 12, date: '2024-01-06', date_label: 'January 2024', favorite: false, albums: [], gradient: ['#fdcb6e', '#e17055'], aspect: 'portrait' },
		{ id: 13, date: '2024-01-05', date_label: 'January 2024', favorite: false, albums: ['Family'], gradient: ['#e84393', '#fd79a8'], aspect: 'landscape' },
		{ id: 14, date: '2024-01-04', date_label: 'January 2024', favorite: false, albums: [], gradient: ['#0984e3', '#74b9ff'], aspect: 'square', media_type: 'video' },
		{ id: 15, date: '2024-01-03', date_label: 'January 2024', favorite: true, albums: ['Selfies'], gradient: ['#636e72', '#b2bec3'], aspect: 'portrait', media_type: 'selfie' },

		// December 2023
		{ id: 16, date: '2023-12-25', date_label: 'December 2023', favorite: true, albums: ['Family', 'Vacations'], gradient: ['#c0392b', '#e74c3c'], aspect: 'landscape' },
		{ id: 17, date: '2023-12-25', date_label: 'December 2023', favorite: true, albums: ['Family'], gradient: ['#27ae60', '#2ecc71'], aspect: 'square' },
		{ id: 18, date: '2023-12-24', date_label: 'December 2023', favorite: false, albums: ['Family'], gradient: ['#2980b9', '#3498db'], aspect: 'portrait' },
		{ id: 19, date: '2023-12-23', date_label: 'December 2023', favorite: false, albums: [], gradient: ['#8e44ad', '#9b59b6'], aspect: 'landscape', media_type: 'panorama' },
		{ id: 20, date: '2023-12-20', date_label: 'December 2023', favorite: false, albums: ['Pets'], gradient: ['#d35400', '#e67e22'], aspect: 'square' },
		{ id: 21, date: '2023-12-18', date_label: 'December 2023', favorite: true, albums: ['Vacations'], gradient: ['#16a085', '#1abc9c'], aspect: 'landscape' },
		{ id: 22, date: '2023-12-15', date_label: 'December 2023', favorite: false, albums: [], gradient: ['#f39c12', '#f1c40f'], aspect: 'portrait', media_type: 'live' },
		{ id: 23, date: '2023-12-12', date_label: 'December 2023', favorite: false, albums: ['Screenshots'], gradient: ['#2c3e50', '#34495e'], aspect: 'landscape', media_type: 'screenshot' },

		// November 2023
		{ id: 24, date: '2023-11-28', date_label: 'November 2023', favorite: false, albums: ['Family'], gradient: ['#e056fd', '#be2edd'], aspect: 'square' },
		{ id: 25, date: '2023-11-25', date_label: 'November 2023', favorite: true, albums: ['Vacations'], gradient: ['#22a6b3', '#7ed6df'], aspect: 'landscape' },
		{ id: 26, date: '2023-11-22', date_label: 'November 2023', favorite: false, albums: [], gradient: ['#eb4d4b', '#ff7979'], aspect: 'portrait', media_type: 'video' },
		{ id: 27, date: '2023-11-18', date_label: 'November 2023', favorite: false, albums: ['Pets'], gradient: ['#6ab04c', '#badc58'], aspect: 'landscape' },
		{ id: 28, date: '2023-11-15', date_label: 'November 2023', favorite: true, albums: ['Selfies'], gradient: ['#4834d4', '#686de0'], aspect: 'square', media_type: 'selfie' },
		{ id: 29, date: '2023-11-10', date_label: 'November 2023', favorite: false, albums: [], gradient: ['#f9ca24', '#f0932b'], aspect: 'portrait' },
		{ id: 30, date: '2023-11-05', date_label: 'November 2023', favorite: false, albums: ['Family'], gradient: ['#30336b', '#535c68'], aspect: 'landscape' },

		// October 2023
		{ id: 31, date: '2023-10-30', date_label: 'October 2023', favorite: false, albums: [], gradient: ['#e55039', '#f8c291'], aspect: 'square', media_type: 'panorama' },
		{ id: 32, date: '2023-10-25', date_label: 'October 2023', favorite: true, albums: ['Vacations'], gradient: ['#3c6382', '#60a3bc'], aspect: 'landscape' },
		{ id: 33, date: '2023-10-20', date_label: 'October 2023', favorite: false, albums: ['Pets'], gradient: ['#b71540', '#eb2f06'], aspect: 'portrait' },
		{ id: 34, date: '2023-10-15', date_label: 'October 2023', favorite: false, albums: [], gradient: ['#0c2461', '#1e3799'], aspect: 'landscape', media_type: 'video' },
		{ id: 35, date: '2023-10-10', date_label: 'October 2023', favorite: true, albums: ['Selfies'], gradient: ['#e58e26', '#fa983a'], aspect: 'square', media_type: 'selfie' },
		{ id: 36, date: '2023-10-05', date_label: 'October 2023', favorite: false, albums: ['Screenshots'], gradient: ['#079992', '#38ada9'], aspect: 'portrait', media_type: 'screenshot' },

		// September 2023
		{ id: 37, date: '2023-09-28', date_label: 'September 2023', favorite: false, albums: ['Family'], gradient: ['#c44569', '#f78fb3'], aspect: 'landscape', media_type: 'live' },
		{ id: 38, date: '2023-09-20', date_label: 'September 2023', favorite: true, albums: ['Vacations'], gradient: ['#574b90', '#786fa6'], aspect: 'square' },
		{ id: 39, date: '2023-09-15', date_label: 'September 2023', favorite: false, albums: [], gradient: ['#e15f41', '#f19066'], aspect: 'portrait' },
		{ id: 40, date: '2023-09-10', date_label: 'September 2023', favorite: false, albums: ['Pets'], gradient: ['#303952', '#596275'], aspect: 'landscape' },
		{ id: 41, date: '2023-09-05', date_label: 'September 2023', favorite: true, albums: [], gradient: ['#1B9CFC', '#25CCF7'], aspect: 'square' },
		{ id: 42, date: '2023-09-01', date_label: 'September 2023', favorite: false, albums: ['Family'], gradient: ['#FD7272', '#FC427B'], aspect: 'portrait', media_type: 'video' },
	];

	// ── Derived ──
	const current_title = $derived.by(() => {
		if (active_item === 'photos') return 'Photos';
		if (active_item === 'favorites') return 'Favorites';
		if (active_item === 'recents') return 'Recents';
		if (active_item === 'imports') return 'Imports';
		if (active_item.startsWith('album-')) {
			const album_name = active_item.replace('album-', '');
			const section = sidebar_sections.find(s => s.title === 'Albums');
			return section?.items.find(i => i.id === active_item)?.label ?? album_name;
		}
		if (active_item.startsWith('media-')) {
			const section = sidebar_sections.find(s => s.title === 'Media Types');
			return section?.items.find(i => i.id === active_item)?.label ?? 'Media';
		}
		return 'Photos';
	});

	const filtered_photos = $derived.by(() => {
		let result = photos;

		// Search filter
		if (search_query.trim()) {
			const q = search_query.toLowerCase();
			result = result.filter(p =>
				p.date_label.toLowerCase().includes(q) ||
				p.albums.some(a => a.toLowerCase().includes(q)) ||
				(p.media_type && p.media_type.toLowerCase().includes(q))
			);
		}

		// Section filter
		if (active_item === 'favorites') {
			result = result.filter(p => p.favorite);
		} else if (active_item === 'recents') {
			result = result.slice(0, 15);
		} else if (active_item === 'imports') {
			result = result.slice(0, 8);
		} else if (active_item.startsWith('album-')) {
			const album_name = sidebar_sections
				.find(s => s.title === 'Albums')
				?.items.find(i => i.id === active_item)?.label;
			if (album_name) {
				result = result.filter(p => p.albums.includes(album_name));
			}
		} else if (active_item === 'media-videos') {
			result = result.filter(p => p.media_type === 'video');
		} else if (active_item === 'media-selfies') {
			result = result.filter(p => p.media_type === 'selfie');
		} else if (active_item === 'media-live') {
			result = result.filter(p => p.media_type === 'live');
		} else if (active_item === 'media-panoramas') {
			result = result.filter(p => p.media_type === 'panorama');
		} else if (active_item === 'media-screenshots') {
			result = result.filter(p => p.media_type === 'screenshot');
		}

		return result;
	});

	const grouped_photos = $derived.by(() => {
		const groups: { label: string; photos: Photo[] }[] = [];
		const group_map = new Map<string, Photo[]>();

		for (const photo of filtered_photos) {
			const existing = group_map.get(photo.date_label);
			if (existing) {
				existing.push(photo);
			} else {
				const arr = [photo];
				group_map.set(photo.date_label, arr);
				groups.push({ label: photo.date_label, photos: arr });
			}
		}

		return groups;
	});

	const photo_count = $derived(filtered_photos.length);

	function get_aspect_style(aspect: Photo['aspect']): string {
		switch (aspect) {
			case 'landscape':
				return 'grid-column: span 1; aspect-ratio: 4/3;';
			case 'portrait':
				return 'grid-column: span 1; aspect-ratio: 3/4;';
			case 'square':
			default:
				return 'grid-column: span 1; aspect-ratio: 1;';
		}
	}

	function get_gradient_style(photo: Photo): string {
		return `background: linear-gradient(135deg, ${photo.gradient[0]}, ${photo.gradient[1]});`;
	}

</script>

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
							onclick={() => { active_item = item.id; selected_photo_id = null; }}
						>
							<span class="sidebar-icon">
								{#if item.icon === 'photos'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
								{:else if item.icon === 'favorites'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
								{:else if item.icon === 'recents'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
								{:else if item.icon === 'imports'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
								{:else if item.icon === 'album'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/></svg>
								{:else if item.icon === 'video'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
								{:else if item.icon === 'selfie'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
								{:else if item.icon === 'live'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3.2"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
								{:else if item.icon === 'panorama'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 18V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zM8.5 12.5l2.5 3.01L14.5 11l4.5 6H5l3.5-4.5z"/></svg>
								{:else if item.icon === 'screenshot'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>
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
						{:else if active_item === 'favorites'}
							You haven't marked any photos as favorites yet
						{:else if active_item === 'imports'}
							No recently imported photos
						{:else}
							No photos in this collection
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
							{#each group.photos as photo (photo.id)}
								<button
									class="photo-tile"
									class:selected={selected_photo_id === photo.id}
									style="{get_gradient_style(photo)} {get_aspect_style(photo.aspect)}"
									onclick={() => selected_photo_id = selected_photo_id === photo.id ? null : photo.id}
								>
									{#if photo.favorite}
										<span class="favorite-badge">
											<svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
										</span>
									{/if}
									{#if photo.media_type === 'video'}
										<span class="media-badge video-badge">
											<svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
										</span>
									{:else if photo.media_type === 'live'}
										<span class="media-badge live-badge">LIVE</span>
									{:else if photo.media_type === 'panorama'}
										<span class="media-badge pano-badge">
											<svg width="14" height="10" viewBox="0 0 24 16" fill="white"><path d="M23 14V2c0-.55-.45-1-1-1H2c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h20c.55 0 1-.45 1-1zM8 10l2.5 3L14 9l4.5 6H3l5-5z"/></svg>
										</span>
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
						<span class="list-col-name">Date</span>
						<span class="list-col-album">Albums</span>
						<span class="list-col-type">Type</span>
						<span class="list-col-fav"></span>
					</div>
					{#each filtered_photos as photo (photo.id)}
						<button
							class="list-row"
							class:selected={selected_photo_id === photo.id}
							onclick={() => selected_photo_id = selected_photo_id === photo.id ? null : photo.id}
						>
							<span class="list-col-thumb">
								<span class="list-thumb" style="{get_gradient_style(photo)}"></span>
							</span>
							<span class="list-col-name">{photo.date_label} - {photo.date}</span>
							<span class="list-col-album">{photo.albums.join(', ') || '--'}</span>
							<span class="list-col-type">{photo.media_type ?? 'photo'}</span>
							<span class="list-col-fav">
								{#if photo.favorite}
									<svg width="12" height="12" viewBox="0 0 24 24" fill="#ff2d55"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
								{/if}
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
		gap: 2px;
	}

	.photo-tile {
		border: none;
		border-radius: 2px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		transition: transform 0.1s, box-shadow 0.15s;

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
</style>
