<script lang="ts">
	let selected_folder = $state('Desktop');
	let selected_file = $state<string | null>(null);

	const sidebar_items = [
		{ section: 'Favorites', items: ['AirDrop', 'Recents', 'Applications', 'Desktop', 'Documents', 'Downloads'] },
		{ section: 'iCloud', items: ['iCloud Drive'] },
		{ section: 'Locations', items: ['Macintosh HD', 'Network'] },
	];

	type FileEntry = { name: string; kind: string; size: string; modified: string };

	const files: Record<string, FileEntry[]> = {
		Desktop: [
			{ name: 'Screenshot 2024-01-15.png', kind: 'PNG Image', size: '2.4 MB', modified: 'Jan 15, 2024' },
			{ name: 'Project Notes.txt', kind: 'Plain Text', size: '12 KB', modified: 'Jan 14, 2024' },
			{ name: 'report-final.pdf', kind: 'PDF Document', size: '1.8 MB', modified: 'Jan 12, 2024' },
		],
		Documents: [
			{ name: 'Resume.docx', kind: 'Word Document', size: '45 KB', modified: 'Jan 10, 2024' },
			{ name: 'Budget 2024.xlsx', kind: 'Excel Spreadsheet', size: '128 KB', modified: 'Jan 8, 2024' },
			{ name: 'Meeting Notes', kind: 'Folder', size: '--', modified: 'Jan 5, 2024' },
			{ name: 'Contracts', kind: 'Folder', size: '--', modified: 'Dec 20, 2023' },
		],
		Downloads: [
			{ name: 'node-v20.10.0.pkg', kind: 'Installer', size: '45.2 MB', modified: 'Jan 15, 2024' },
			{ name: 'photo-album.zip', kind: 'ZIP Archive', size: '230 MB', modified: 'Jan 13, 2024' },
			{ name: 'presentation.key', kind: 'Keynote', size: '18 MB', modified: 'Jan 11, 2024' },
		],
		Applications: [
			{ name: 'Calculator.app', kind: 'Application', size: '4.2 MB', modified: 'Oct 1, 2023' },
			{ name: 'Calendar.app', kind: 'Application', size: '12 MB', modified: 'Oct 1, 2023' },
			{ name: 'FaceTime.app', kind: 'Application', size: '8.5 MB', modified: 'Oct 1, 2023' },
			{ name: 'Finder.app', kind: 'Application', size: '6.1 MB', modified: 'Oct 1, 2023' },
			{ name: 'Mail.app', kind: 'Application', size: '15 MB', modified: 'Oct 1, 2023' },
			{ name: 'Safari.app', kind: 'Application', size: '22 MB', modified: 'Oct 1, 2023' },
		],
		Recents: [
			{ name: 'Screenshot 2024-01-15.png', kind: 'PNG Image', size: '2.4 MB', modified: 'Jan 15, 2024' },
			{ name: 'node-v20.10.0.pkg', kind: 'Installer', size: '45.2 MB', modified: 'Jan 15, 2024' },
			{ name: 'Project Notes.txt', kind: 'Plain Text', size: '12 KB', modified: 'Jan 14, 2024' },
		],
		AirDrop: [],
		'iCloud Drive': [
			{ name: 'Shared Documents', kind: 'Folder', size: '--', modified: 'Jan 14, 2024' },
			{ name: 'Photos Backup', kind: 'Folder', size: '--', modified: 'Jan 10, 2024' },
		],
		'Macintosh HD': [
			{ name: 'Applications', kind: 'Folder', size: '--', modified: 'Jan 15, 2024' },
			{ name: 'Library', kind: 'Folder', size: '--', modified: 'Jan 15, 2024' },
			{ name: 'System', kind: 'Folder', size: '--', modified: 'Oct 1, 2023' },
			{ name: 'Users', kind: 'Folder', size: '--', modified: 'Jan 15, 2024' },
		],
		Network: [],
	};

	function get_file_icon(kind: string): string {
		if (kind === 'Folder') return '📁';
		if (kind === 'Application') return '📦';
		if (kind.includes('Image') || kind.includes('PNG')) return '🖼️';
		if (kind.includes('PDF')) return '📄';
		if (kind.includes('Text')) return '📝';
		if (kind.includes('ZIP') || kind.includes('Archive')) return '🗜️';
		if (kind.includes('Installer')) return '📀';
		return '📄';
	}

	const current_files = $derived(files[selected_folder] || []);
</script>

<section class="container">
	<header class="app-window-drag-handle toolbar">
		<div class="toolbar-buttons">
			<button class="toolbar-btn">&larr;</button>
			<button class="toolbar-btn">&rarr;</button>
		</div>
		<div class="toolbar-title">{selected_folder}</div>
		<div class="toolbar-actions">
			<button class="toolbar-btn">⊞</button>
			<button class="toolbar-btn">☰</button>
			<button class="toolbar-btn">⊟</button>
		</div>
	</header>

	<div class="main">
		<aside class="sidebar">
			{#each sidebar_items as group}
				<div class="sidebar-section">
					<div class="sidebar-section-title">{group.section}</div>
					{#each group.items as item}
						<button
							class="sidebar-item"
							class:active={selected_folder === item}
							onclick={() => { selected_folder = item; selected_file = null; }}
						>
							<span class="sidebar-icon">
								{#if item === 'AirDrop'}📡
								{:else if item === 'Recents'}🕐
								{:else if item === 'Applications'}📦
								{:else if item === 'Desktop'}🖥️
								{:else if item === 'Documents'}📁
								{:else if item === 'Downloads'}⬇️
								{:else if item === 'iCloud Drive'}☁️
								{:else if item === 'Macintosh HD'}💻
								{:else if item === 'Network'}🌐
								{:else}📁
								{/if}
							</span>
							{item}
						</button>
					{/each}
				</div>
			{/each}
		</aside>

		<div class="content">
			<div class="column-headers">
				<span class="col-name">Name</span>
				<span class="col-modified">Date Modified</span>
				<span class="col-size">Size</span>
				<span class="col-kind">Kind</span>
			</div>

			<div class="file-list">
				{#if current_files.length === 0}
					<div class="empty-folder">This folder is empty</div>
				{/if}
				{#each current_files as file}
					<button
						class="file-row"
						class:selected={selected_file === file.name}
						onclick={() => selected_file = file.name}
						ondblclick={() => { if (file.kind === 'Folder') { selected_folder = file.name; selected_file = null; } }}
					>
						<span class="col-name">
							<span class="file-icon">{get_file_icon(file.kind)}</span>
							{file.name}
						</span>
						<span class="col-modified">{file.modified}</span>
						<span class="col-size">{file.size}</span>
						<span class="col-kind">{file.kind}</span>
					</button>
				{/each}
			</div>

			<div class="status-bar">
				{current_files.length} item{current_files.length !== 1 ? 's' : ''}
			</div>
		</div>
	</div>
</section>

<style>
	.container {
		height: 100%;
		width: 100%;
		background-color: var(--system-color-light);
		border-radius: inherit;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		font-family: var(--system-font-family);
		font-size: 13px;
		color: var(--system-color-light-contrast);
	}

	.toolbar {
		display: flex;
		align-items: center;
		padding: 8px 12px;
		background: linear-gradient(to bottom, #f6f6f6, #e8e8e8);
		border-bottom: 1px solid #c8c8c8;
		gap: 12px;
		min-height: 38px;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
			border-bottom-color: #1c1c1e;
		}
	}

	.toolbar-buttons {
		display: flex;
		gap: 4px;
	}

	.toolbar-btn {
		background: none;
		border: none;
		color: #6e6e73;
		font-size: 14px;
		padding: 2px 6px;
		border-radius: 4px;
		cursor: pointer;

		&:hover {
			background-color: rgba(0, 0, 0, 0.06);
		}

		:global(body.dark) & {
			color: #98989d;
		}
	}

	.toolbar-title {
		flex: 1;
		text-align: center;
		font-weight: 600;
		font-size: 13px;
	}

	.toolbar-actions {
		display: flex;
		gap: 4px;
	}

	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.sidebar {
		width: 180px;
		min-width: 180px;
		background-color: rgba(0, 0, 0, 0.03);
		border-right: 1px solid #d1d1d6;
		overflow-y: auto;
		padding: 6px 0;

		:global(body.dark) & {
			background-color: rgba(255, 255, 255, 0.03);
			border-right-color: #38383a;
		}
	}

	.sidebar-section {
		margin-bottom: 8px;
	}

	.sidebar-section-title {
		font-size: 11px;
		font-weight: 700;
		color: #86868b;
		text-transform: uppercase;
		padding: 4px 16px;
		letter-spacing: 0.3px;
	}

	.sidebar-item {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
		padding: 4px 16px;
		border: none;
		background: none;
		font-size: 13px;
		color: var(--system-color-light-contrast);
		cursor: pointer;
		text-align: left;
		border-radius: 0;

		&:hover {
			background-color: rgba(0, 0, 0, 0.04);
		}

		&.active {
			background-color: #007aff;
			color: white;
		}

		:global(body.dark) &:hover {
			background-color: rgba(255, 255, 255, 0.06);
		}
	}

	.sidebar-icon {
		font-size: 14px;
		width: 20px;
		text-align: center;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.column-headers {
		display: flex;
		padding: 6px 12px;
		border-bottom: 1px solid #d1d1d6;
		font-size: 11px;
		font-weight: 600;
		color: #86868b;
		background-color: rgba(0, 0, 0, 0.02);

		:global(body.dark) & {
			border-bottom-color: #38383a;
			background-color: rgba(255, 255, 255, 0.02);
		}
	}

	.col-name {
		flex: 2;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.col-modified {
		flex: 1;
	}

	.col-size {
		width: 80px;
		text-align: right;
	}

	.col-kind {
		flex: 1;
		text-align: right;
	}

	.file-list {
		flex: 1;
		overflow-y: auto;
	}

	.file-row {
		display: flex;
		padding: 4px 12px;
		border: none;
		background: none;
		width: 100%;
		font-size: 13px;
		color: var(--system-color-light-contrast);
		cursor: pointer;
		text-align: left;
		align-items: center;
		border-bottom: 1px solid rgba(0, 0, 0, 0.04);

		&:hover {
			background-color: rgba(0, 0, 0, 0.03);
		}

		&.selected {
			background-color: #007aff;
			color: white;
		}
	}

	.file-icon {
		font-size: 16px;
	}

	.empty-folder {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: #86868b;
		font-size: 14px;
	}

	.status-bar {
		padding: 4px 12px;
		border-top: 1px solid #d1d1d6;
		font-size: 11px;
		color: #86868b;

		:global(body.dark) & {
			border-top-color: #38383a;
		}
	}
</style>
