<script lang="ts">
	type FileEntry = {
		name: string;
		kind: string;
		size: string;
		modified: string;
		icon?: string;
	};

	type ViewMode = 'icons' | 'list' | 'columns' | 'gallery';

	// Navigation state
	let path_stack = $state<string[]>(['Home']);
	let forward_stack = $state<string[]>([]);
	let selected_files = $state<Set<string>>(new Set());
	let view_mode = $state<ViewMode>('list');
	let clipboard = $state<{ action: 'copy' | 'cut'; files: string[] } | null>(null);
	let sort_by = $state<'name' | 'modified' | 'size' | 'kind'>('name');
	let sort_asc = $state(true);
	let search_query = $state('');

	// Context menu state
	let ctx_visible = $state(false);
	let ctx_x = $state(0);
	let ctx_y = $state(0);
	let ctx_target_file = $state<string | null>(null);

	// Rename state
	let renaming_file = $state<string | null>(null);
	let rename_value = $state('');

	const current_folder = $derived(path_stack[path_stack.length - 1]);

	const sidebar_favorites = [
		{ name: 'AirDrop', icon: 'airdrop' },
		{ name: 'Recents', icon: 'recents' },
		{ name: 'Applications', icon: 'applications' },
		{ name: 'Desktop', icon: 'desktop' },
		{ name: 'Documents', icon: 'documents' },
		{ name: 'Downloads', icon: 'downloads' },
		{ name: 'Home', icon: 'home' },
	];

	const sidebar_locations = [
		{ name: 'Macintosh HD', icon: 'disk' },
		{ name: 'Network', icon: 'network' },
	];

	const sidebar_tags = [
		{ name: 'Red', color: '#ff3b30' },
		{ name: 'Orange', color: '#ff9500' },
		{ name: 'Yellow', color: '#ffcc00' },
		{ name: 'Green', color: '#34c759' },
		{ name: 'Blue', color: '#007aff' },
		{ name: 'Purple', color: '#af52de' },
	];

	function get_sidebar_svg(icon: string): string {
		switch (icon) {
			case 'airdrop':
				return '<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="5" r="2"/><path d="M4 13c0-2.2 1.8-4 4-4s4 1.8 4 4"/><path d="M1 14c0-3.9 3.1-7 7-7s7 3.1 7 7" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
			case 'recents':
				return '<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 4v4.5l3 1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
			case 'applications':
				return '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>';
			case 'desktop':
				return '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="10" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5 14h6M8 12v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
			case 'documents':
				return '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 1h7l3 3v11H3V1z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M10 1v3h3" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M5 7h6M5 9h6M5 11h4" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>';
			case 'downloads':
				return '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 2v8M5 7l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
			case 'home':
				return '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 8l6-6 6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 7v6a1 1 0 001 1h8a1 1 0 001-1V7" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
			case 'disk':
				return '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="4" width="14" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="8" r="1"/><path d="M1 10h14" stroke="currentColor" stroke-width="0.8"/></svg>';
			case 'network':
				return '<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.3"/><ellipse cx="8" cy="8" rx="3" ry="6" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M2 8h12M3 5h10M3 11h10" stroke="currentColor" stroke-width="0.8"/></svg>';
			default:
				return '';
		}
	}

	const files: Record<string, FileEntry[]> = {
		Home: [
			{ name: 'Desktop', kind: 'Folder', size: '--', modified: 'Jan 15, 2024' },
			{ name: 'Documents', kind: 'Folder', size: '--', modified: 'Jan 14, 2024' },
			{ name: 'Downloads', kind: 'Folder', size: '--', modified: 'Jan 15, 2024' },
			{ name: 'Movies', kind: 'Folder', size: '--', modified: 'Dec 20, 2023' },
			{ name: 'Music', kind: 'Folder', size: '--', modified: 'Nov 10, 2023' },
			{ name: 'Pictures', kind: 'Folder', size: '--', modified: 'Jan 12, 2024' },
			{ name: 'Public', kind: 'Folder', size: '--', modified: 'Oct 1, 2023' },
			{ name: '.zshrc', kind: 'Unix Executable', size: '4 KB', modified: 'Jan 10, 2024' },
		],
		Desktop: [
			{ name: 'Projects', kind: 'Folder', size: '--', modified: 'Jan 15, 2024' },
			{ name: 'Screenshot 2024-01-15.png', kind: 'PNG Image', size: '2.4 MB', modified: 'Jan 15, 2024' },
			{ name: 'Screenshot 2024-01-14.png', kind: 'PNG Image', size: '1.8 MB', modified: 'Jan 14, 2024' },
			{ name: 'Project Notes.txt', kind: 'Plain Text', size: '12 KB', modified: 'Jan 14, 2024' },
			{ name: 'report-final.pdf', kind: 'PDF Document', size: '1.8 MB', modified: 'Jan 12, 2024' },
			{ name: 'design-mockup.sketch', kind: 'Sketch Document', size: '34 MB', modified: 'Jan 11, 2024' },
			{ name: 'todo.md', kind: 'Markdown', size: '2 KB', modified: 'Jan 10, 2024' },
		],
		Projects: [
			{ name: 'my-app', kind: 'Folder', size: '--', modified: 'Jan 15, 2024' },
			{ name: 'website-redesign', kind: 'Folder', size: '--', modified: 'Jan 12, 2024' },
			{ name: 'README.md', kind: 'Markdown', size: '8 KB', modified: 'Jan 15, 2024' },
		],
		'my-app': [
			{ name: 'src', kind: 'Folder', size: '--', modified: 'Jan 15, 2024' },
			{ name: 'node_modules', kind: 'Folder', size: '--', modified: 'Jan 14, 2024' },
			{ name: 'package.json', kind: 'JSON', size: '2 KB', modified: 'Jan 15, 2024' },
			{ name: 'tsconfig.json', kind: 'JSON', size: '1 KB', modified: 'Jan 10, 2024' },
			{ name: '.gitignore', kind: 'Plain Text', size: '1 KB', modified: 'Jan 10, 2024' },
		],
		Documents: [
			{ name: 'Work', kind: 'Folder', size: '--', modified: 'Jan 14, 2024' },
			{ name: 'Personal', kind: 'Folder', size: '--', modified: 'Jan 10, 2024' },
			{ name: 'Resume.docx', kind: 'Word Document', size: '45 KB', modified: 'Jan 10, 2024' },
			{ name: 'Budget 2024.xlsx', kind: 'Spreadsheet', size: '128 KB', modified: 'Jan 8, 2024' },
			{ name: 'Meeting Notes.txt', kind: 'Plain Text', size: '6 KB', modified: 'Jan 5, 2024' },
			{ name: 'Contracts', kind: 'Folder', size: '--', modified: 'Dec 20, 2023' },
			{ name: 'Tax Returns 2023.pdf', kind: 'PDF Document', size: '2.1 MB', modified: 'Dec 15, 2023' },
		],
		Work: [
			{ name: 'Q1 Report.pdf', kind: 'PDF Document', size: '3.2 MB', modified: 'Jan 14, 2024' },
			{ name: 'Presentation.key', kind: 'Keynote', size: '18 MB', modified: 'Jan 12, 2024' },
			{ name: 'Sprint Planning.docx', kind: 'Word Document', size: '32 KB', modified: 'Jan 10, 2024' },
		],
		Personal: [
			{ name: 'Journal.txt', kind: 'Plain Text', size: '24 KB', modified: 'Jan 10, 2024' },
			{ name: 'Recipes', kind: 'Folder', size: '--', modified: 'Dec 28, 2023' },
		],
		Contracts: [
			{ name: 'NDA-2024.pdf', kind: 'PDF Document', size: '156 KB', modified: 'Dec 20, 2023' },
			{ name: 'Employment Agreement.pdf', kind: 'PDF Document', size: '420 KB', modified: 'Nov 15, 2023' },
		],
		Downloads: [
			{ name: 'node-v20.10.0.pkg', kind: 'Installer Package', size: '45.2 MB', modified: 'Jan 15, 2024' },
			{ name: 'Visual Studio Code.dmg', kind: 'Disk Image', size: '198 MB', modified: 'Jan 14, 2024' },
			{ name: 'photo-album.zip', kind: 'ZIP Archive', size: '230 MB', modified: 'Jan 13, 2024' },
			{ name: 'presentation.key', kind: 'Keynote', size: '18 MB', modified: 'Jan 11, 2024' },
			{ name: 'Slack-4.35.dmg', kind: 'Disk Image', size: '165 MB', modified: 'Jan 8, 2024' },
			{ name: 'invoice-december.pdf', kind: 'PDF Document', size: '89 KB', modified: 'Jan 5, 2024' },
			{ name: 'vacation-photo.jpg', kind: 'JPEG Image', size: '4.2 MB', modified: 'Jan 3, 2024' },
		],
		Applications: [
			{ name: 'App Store.app', kind: 'Application', size: '15 MB', modified: 'Oct 1, 2023' },
			{ name: 'Calculator.app', kind: 'Application', size: '4.2 MB', modified: 'Oct 1, 2023' },
			{ name: 'Calendar.app', kind: 'Application', size: '12 MB', modified: 'Oct 1, 2023' },
			{ name: 'FaceTime.app', kind: 'Application', size: '8.5 MB', modified: 'Oct 1, 2023' },
			{ name: 'Finder.app', kind: 'Application', size: '6.1 MB', modified: 'Oct 1, 2023' },
			{ name: 'Mail.app', kind: 'Application', size: '15 MB', modified: 'Oct 1, 2023' },
			{ name: 'Maps.app', kind: 'Application', size: '22 MB', modified: 'Oct 1, 2023' },
			{ name: 'Messages.app', kind: 'Application', size: '10 MB', modified: 'Oct 1, 2023' },
			{ name: 'Music.app', kind: 'Application', size: '35 MB', modified: 'Oct 1, 2023' },
			{ name: 'Notes.app', kind: 'Application', size: '8 MB', modified: 'Oct 1, 2023' },
			{ name: 'Photos.app', kind: 'Application', size: '45 MB', modified: 'Oct 1, 2023' },
			{ name: 'Safari.app', kind: 'Application', size: '22 MB', modified: 'Oct 1, 2023' },
			{ name: 'System Preferences.app', kind: 'Application', size: '3 MB', modified: 'Oct 1, 2023' },
			{ name: 'Terminal.app', kind: 'Application', size: '5 MB', modified: 'Oct 1, 2023' },
			{ name: 'TextEdit.app', kind: 'Application', size: '4 MB', modified: 'Oct 1, 2023' },
			{ name: 'Visual Studio Code.app', kind: 'Application', size: '380 MB', modified: 'Jan 14, 2024' },
			{ name: 'Xcode.app', kind: 'Application', size: '12.4 GB', modified: 'Dec 10, 2023' },
		],
		Recents: [
			{ name: 'Screenshot 2024-01-15.png', kind: 'PNG Image', size: '2.4 MB', modified: 'Jan 15, 2024' },
			{ name: 'node-v20.10.0.pkg', kind: 'Installer Package', size: '45.2 MB', modified: 'Jan 15, 2024' },
			{ name: 'Project Notes.txt', kind: 'Plain Text', size: '12 KB', modified: 'Jan 14, 2024' },
			{ name: 'Q1 Report.pdf', kind: 'PDF Document', size: '3.2 MB', modified: 'Jan 14, 2024' },
			{ name: 'Resume.docx', kind: 'Word Document', size: '45 KB', modified: 'Jan 10, 2024' },
		],
		AirDrop: [],
		'Macintosh HD': [
			{ name: 'Applications', kind: 'Folder', size: '--', modified: 'Jan 15, 2024' },
			{ name: 'Library', kind: 'Folder', size: '--', modified: 'Jan 15, 2024' },
			{ name: 'System', kind: 'Folder', size: '--', modified: 'Oct 1, 2023' },
			{ name: 'Users', kind: 'Folder', size: '--', modified: 'Jan 15, 2024' },
			{ name: 'private', kind: 'Folder', size: '--', modified: 'Oct 1, 2023' },
			{ name: 'tmp', kind: 'Folder', size: '--', modified: 'Jan 15, 2024' },
			{ name: 'var', kind: 'Folder', size: '--', modified: 'Jan 15, 2024' },
		],
		Network: [],
		Movies: [
			{ name: 'vacation-2023.mov', kind: 'QuickTime Movie', size: '1.2 GB', modified: 'Dec 20, 2023' },
		],
		Music: [
			{ name: 'Music Library.musiclibrary', kind: 'Music Library', size: '3.4 GB', modified: 'Nov 10, 2023' },
		],
		Pictures: [
			{ name: 'Photos Library.photoslibrary', kind: 'Photos Library', size: '28 GB', modified: 'Jan 12, 2024' },
			{ name: 'Wallpapers', kind: 'Folder', size: '--', modified: 'Dec 5, 2023' },
		],
	};

	function get_file_icon_svg(file: FileEntry): string {
		const ext = file.name.split('.').pop()?.toLowerCase() || '';
		const kind = file.kind;

		if (kind === 'Folder') {
			return '<svg viewBox="0 0 40 34" fill="none"><path d="M2 6C2 4.34 3.34 3 5 3h10l3 4h17c1.66 0 3 1.34 3 3v18c0 1.66-1.34 3-3 3H5c-1.66 0-3-1.34-3-3V6z" fill="#64B5F6"/><path d="M2 10h36v18c0 1.66-1.34 3-3 3H5c-1.66 0-3-1.34-3-3V10z" fill="#42A5F5"/></svg>';
		}

		if (kind === 'Application' || ext === 'app') {
			return '<svg viewBox="0 0 40 40" fill="none"><rect x="4" y="4" width="32" height="32" rx="8" fill="#E0E0E0" stroke="#BDBDBD" stroke-width="1"/><rect x="8" y="8" width="24" height="24" rx="4" fill="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"/><rect x="8" y="8" width="24" height="24" rx="4" fill="#667eea"/><path d="M16 16h8v8h-8z" fill="white" opacity="0.8"/></svg>';
		}

		if (kind === 'PDF Document' || ext === 'pdf') {
			return '<svg viewBox="0 0 34 40" fill="none"><path d="M2 4c0-1.1.9-2 2-2h18l10 10v24c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4z" fill="white" stroke="#E0E0E0" stroke-width="1.5"/><path d="M22 2v8h10" fill="#E0E0E0"/><rect x="6" y="22" width="22" height="6" rx="1" fill="#FF3B30"/><text x="17" y="27" text-anchor="middle" fill="white" font-size="5" font-weight="bold" font-family="sans-serif">PDF</text></svg>';
		}

		if (kind.includes('Image') || ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif' || ext === 'webp') {
			return '<svg viewBox="0 0 34 40" fill="none"><path d="M2 4c0-1.1.9-2 2-2h18l10 10v24c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4z" fill="white" stroke="#E0E0E0" stroke-width="1.5"/><path d="M22 2v8h10" fill="#E0E0E0"/><rect x="6" y="16" width="22" height="14" rx="1" fill="#E8F5E9"/><circle cx="12" cy="21" r="2" fill="#66BB6A"/><path d="M6 28l6-5 4 3 5-6 7 8H6z" fill="#43A047"/></svg>';
		}

		if (kind === 'Plain Text' || ext === 'txt' || ext === 'md') {
			return '<svg viewBox="0 0 34 40" fill="none"><path d="M2 4c0-1.1.9-2 2-2h18l10 10v24c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4z" fill="white" stroke="#E0E0E0" stroke-width="1.5"/><path d="M22 2v8h10" fill="#E0E0E0"/><path d="M8 16h18M8 20h18M8 24h14M8 28h10" stroke="#BDBDBD" stroke-width="1.5" stroke-linecap="round"/></svg>';
		}

		if (kind === 'Word Document' || ext === 'docx' || ext === 'doc') {
			return '<svg viewBox="0 0 34 40" fill="none"><path d="M2 4c0-1.1.9-2 2-2h18l10 10v24c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4z" fill="white" stroke="#E0E0E0" stroke-width="1.5"/><path d="M22 2v8h10" fill="#E0E0E0"/><rect x="6" y="22" width="22" height="6" rx="1" fill="#2B579A"/><text x="17" y="27" text-anchor="middle" fill="white" font-size="5" font-weight="bold" font-family="sans-serif">DOC</text></svg>';
		}

		if (kind === 'Spreadsheet' || ext === 'xlsx' || ext === 'xls') {
			return '<svg viewBox="0 0 34 40" fill="none"><path d="M2 4c0-1.1.9-2 2-2h18l10 10v24c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4z" fill="white" stroke="#E0E0E0" stroke-width="1.5"/><path d="M22 2v8h10" fill="#E0E0E0"/><rect x="6" y="22" width="22" height="6" rx="1" fill="#217346"/><text x="17" y="27" text-anchor="middle" fill="white" font-size="5" font-weight="bold" font-family="sans-serif">XLS</text></svg>';
		}

		if (kind === 'Disk Image' || ext === 'dmg') {
			return '<svg viewBox="0 0 40 34" fill="none"><rect x="2" y="4" width="36" height="26" rx="4" fill="#F5F5F5" stroke="#BDBDBD" stroke-width="1.5"/><circle cx="20" cy="17" r="8" fill="none" stroke="#9E9E9E" stroke-width="1.5"/><circle cx="20" cy="17" r="3" fill="#9E9E9E"/></svg>';
		}

		if (kind === 'ZIP Archive' || ext === 'zip') {
			return '<svg viewBox="0 0 34 40" fill="none"><path d="M2 4c0-1.1.9-2 2-2h18l10 10v24c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4z" fill="white" stroke="#E0E0E0" stroke-width="1.5"/><path d="M22 2v8h10" fill="#E0E0E0"/><rect x="14" y="4" width="6" height="3" fill="#9E9E9E"/><rect x="14" y="10" width="6" height="3" fill="#9E9E9E"/><rect x="14" y="16" width="6" height="3" fill="#9E9E9E"/><rect x="13" y="22" width="8" height="6" rx="1" fill="#9E9E9E"/><rect x="15" y="24" width="4" height="2" rx="0.5" fill="white"/></svg>';
		}

		if (kind === 'Installer Package' || ext === 'pkg') {
			return '<svg viewBox="0 0 40 40" fill="none"><rect x="4" y="8" width="32" height="24" rx="3" fill="#F5F5F5" stroke="#BDBDBD" stroke-width="1.5"/><path d="M4 14h32" stroke="#BDBDBD" stroke-width="1"/><circle cx="20" cy="23" r="5" fill="#42A5F5"/><path d="M18 23l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
		}

		if (kind === 'Keynote' || ext === 'key') {
			return '<svg viewBox="0 0 34 40" fill="none"><path d="M2 4c0-1.1.9-2 2-2h18l10 10v24c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4z" fill="white" stroke="#E0E0E0" stroke-width="1.5"/><path d="M22 2v8h10" fill="#E0E0E0"/><rect x="6" y="22" width="22" height="6" rx="1" fill="#007AFF"/><text x="17" y="27" text-anchor="middle" fill="white" font-size="5" font-weight="bold" font-family="sans-serif">KEY</text></svg>';
		}

		if (ext === 'json') {
			return '<svg viewBox="0 0 34 40" fill="none"><path d="M2 4c0-1.1.9-2 2-2h18l10 10v24c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4z" fill="white" stroke="#E0E0E0" stroke-width="1.5"/><path d="M22 2v8h10" fill="#E0E0E0"/><text x="17" y="26" text-anchor="middle" fill="#FFA000" font-size="7" font-weight="bold" font-family="monospace">{}</text></svg>';
		}

		if (ext === 'sketch') {
			return '<svg viewBox="0 0 40 40" fill="none"><path d="M20 4l16 12-16 20L4 16z" fill="#FDB300"/><path d="M20 4l16 12H4z" fill="#FDD231"/><path d="M4 16l16 20 16-20" fill="#FDAD00"/></svg>';
		}

		if (ext === 'mov' || ext === 'mp4' || ext === 'avi') {
			return '<svg viewBox="0 0 34 40" fill="none"><path d="M2 4c0-1.1.9-2 2-2h18l10 10v24c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4z" fill="white" stroke="#E0E0E0" stroke-width="1.5"/><path d="M22 2v8h10" fill="#E0E0E0"/><path d="M13 18v10l9-5z" fill="#9E9E9E"/></svg>';
		}

		// Default document icon
		return '<svg viewBox="0 0 34 40" fill="none"><path d="M2 4c0-1.1.9-2 2-2h18l10 10v24c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4z" fill="white" stroke="#E0E0E0" stroke-width="1.5"/><path d="M22 2v8h10" fill="#E0E0E0"/></svg>';
	}

	function get_sorted_files(file_list: FileEntry[]): FileEntry[] {
		let filtered = file_list;
		if (search_query.trim()) {
			const q = search_query.toLowerCase();
			filtered = file_list.filter(f => f.name.toLowerCase().includes(q));
		}
		return [...filtered].sort((a, b) => {
			// Folders always first
			if (a.kind === 'Folder' && b.kind !== 'Folder') return -1;
			if (a.kind !== 'Folder' && b.kind === 'Folder') return 1;

			let cmp = 0;
			switch (sort_by) {
				case 'name':
					cmp = a.name.localeCompare(b.name);
					break;
				case 'modified':
					cmp = a.modified.localeCompare(b.modified);
					break;
				case 'size':
					cmp = parse_size(a.size) - parse_size(b.size);
					break;
				case 'kind':
					cmp = a.kind.localeCompare(b.kind);
					break;
			}
			return sort_asc ? cmp : -cmp;
		});
	}

	function parse_size(s: string): number {
		if (s === '--') return 0;
		const num = parseFloat(s);
		if (s.includes('GB')) return num * 1024 * 1024;
		if (s.includes('MB')) return num * 1024;
		if (s.includes('KB')) return num;
		return num;
	}

	const current_files = $derived(get_sorted_files(files[current_folder] || []));

	function navigate_to(folder: string, from_sidebar = false) {
		if (from_sidebar) {
			path_stack = [folder];
		} else {
			path_stack = [...path_stack, folder];
		}
		forward_stack = [];
		selected_files = new Set();
		renaming_file = null;
		search_query = '';
	}

	function go_back() {
		if (path_stack.length > 1) {
			const current = path_stack[path_stack.length - 1];
			forward_stack = [current, ...forward_stack];
			path_stack = path_stack.slice(0, -1);
			selected_files = new Set();
			renaming_file = null;
		}
	}

	function go_forward() {
		if (forward_stack.length > 0) {
			const next = forward_stack[0];
			path_stack = [...path_stack, next];
			forward_stack = forward_stack.slice(1);
			selected_files = new Set();
			renaming_file = null;
		}
	}

	function handle_file_click(file: FileEntry, event: MouseEvent) {
		renaming_file = null;
		if (event.shiftKey) {
			const new_set = new Set(selected_files);
			if (new_set.has(file.name)) {
				new_set.delete(file.name);
			} else {
				new_set.add(file.name);
			}
			selected_files = new_set;
		} else if (event.metaKey) {
			const new_set = new Set(selected_files);
			if (new_set.has(file.name)) {
				new_set.delete(file.name);
			} else {
				new_set.add(file.name);
			}
			selected_files = new_set;
		} else {
			selected_files = new Set([file.name]);
		}
	}

	function handle_file_dblclick(file: FileEntry) {
		if (file.kind === 'Folder' && files[file.name]) {
			navigate_to(file.name);
		}
	}

	function handle_context_menu(event: MouseEvent, file_name: string | null) {
		event.preventDefault();
		event.stopPropagation();

		const rect = (event.currentTarget as HTMLElement).closest('.content-area')?.getBoundingClientRect();
		if (rect) {
			ctx_x = event.clientX - rect.left;
			ctx_y = event.clientY - rect.top;
		} else {
			ctx_x = event.clientX;
			ctx_y = event.clientY;
		}

		ctx_target_file = file_name;
		if (file_name && !selected_files.has(file_name)) {
			selected_files = new Set([file_name]);
		}
		ctx_visible = true;
	}

	function close_context_menu() {
		ctx_visible = false;
	}

	function ctx_action(action: string) {
		switch (action) {
			case 'new-folder':
				// Add a new folder to current directory
				if (files[current_folder]) {
					files[current_folder] = [
						{ name: 'untitled folder', kind: 'Folder', size: '--', modified: 'Today' },
						...files[current_folder],
					];
					renaming_file = 'untitled folder';
					rename_value = 'untitled folder';
					selected_files = new Set(['untitled folder']);
				}
				break;
			case 'get-info':
				// No-op for demo
				break;
			case 'copy':
				clipboard = { action: 'copy', files: [...selected_files] };
				break;
			case 'cut':
				clipboard = { action: 'cut', files: [...selected_files] };
				break;
			case 'paste':
				// No-op for demo
				break;
			case 'rename':
				if (selected_files.size === 1) {
					const name = [...selected_files][0];
					renaming_file = name;
					rename_value = name;
				}
				break;
			case 'duplicate':
				if (files[current_folder] && selected_files.size > 0) {
					const dupes: FileEntry[] = [];
					for (const fname of selected_files) {
						const f = files[current_folder].find(x => x.name === fname);
						if (f) {
							dupes.push({ ...f, name: f.name + ' copy' });
						}
					}
					files[current_folder] = [...files[current_folder], ...dupes];
				}
				break;
			case 'move-to-trash':
				if (files[current_folder]) {
					files[current_folder] = files[current_folder].filter(f => !selected_files.has(f.name));
					selected_files = new Set();
				}
				break;
			case 'select-all':
				selected_files = new Set(current_files.map(f => f.name));
				break;
		}
		close_context_menu();
	}

	function finish_rename() {
		if (renaming_file && rename_value.trim() && files[current_folder]) {
			const idx = files[current_folder].findIndex(f => f.name === renaming_file);
			if (idx >= 0) {
				files[current_folder][idx] = { ...files[current_folder][idx], name: rename_value.trim() };
				selected_files = new Set([rename_value.trim()]);
			}
		}
		renaming_file = null;
	}

	function handle_rename_keydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			finish_rename();
		} else if (event.key === 'Escape') {
			renaming_file = null;
		}
	}

	function handle_sort(column: 'name' | 'modified' | 'size' | 'kind') {
		if (sort_by === column) {
			sort_asc = !sort_asc;
		} else {
			sort_by = column;
			sort_asc = true;
		}
	}

	function clear_selection_on_empty(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			selected_files = new Set();
			renaming_file = null;
		}
	}

	function breadcrumb_segments(): string[] {
		return path_stack;
	}

	function navigate_to_breadcrumb(index: number) {
		path_stack = path_stack.slice(0, index + 1);
		forward_stack = [];
		selected_files = new Set();
		renaming_file = null;
	}

	const item_count_text = $derived(() => {
		const count = current_files.length;
		return `${count} item${count !== 1 ? 's' : ''}`;
	});

	const available_text = $derived(() => {
		return '142.8 GB available';
	});

	function get_sort_indicator(col: string): string {
		if (sort_by !== col) return '';
		return sort_asc ? ' \u25B4' : ' \u25BE';
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<section class="container" onclick={close_context_menu}>
	<!-- Toolbar -->
	<header class="app-window-drag-handle toolbar">
		<div class="toolbar-nav">
			<button
				class="nav-btn"
				onclick={go_back}
				disabled={path_stack.length <= 1}
				title="Back"
			>
				<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
					<path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
			<button
				class="nav-btn"
				onclick={go_forward}
				disabled={forward_stack.length === 0}
				title="Forward"
			>
				<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
					<path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
		</div>

		<div class="toolbar-title">{current_folder}</div>

		<div class="toolbar-right">
			<div class="view-buttons">
				<button
					class="view-btn"
					class:active={view_mode === 'icons'}
					onclick={() => view_mode = 'icons'}
					title="Icon view"
				>
					<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
						<rect x="1" y="1" width="5" height="5" rx="1"/>
						<rect x="8" y="1" width="5" height="5" rx="1"/>
						<rect x="1" y="8" width="5" height="5" rx="1"/>
						<rect x="8" y="8" width="5" height="5" rx="1"/>
					</svg>
				</button>
				<button
					class="view-btn"
					class:active={view_mode === 'list'}
					onclick={() => view_mode = 'list'}
					title="List view"
				>
					<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
						<rect x="1" y="1.5" width="12" height="2" rx="0.5"/>
						<rect x="1" y="6" width="12" height="2" rx="0.5"/>
						<rect x="1" y="10.5" width="12" height="2" rx="0.5"/>
					</svg>
				</button>
				<button
					class="view-btn"
					class:active={view_mode === 'columns'}
					onclick={() => view_mode = 'columns'}
					title="Column view"
				>
					<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
						<rect x="1" y="1" width="3.5" height="12" rx="0.5"/>
						<rect x="5.5" y="1" width="3.5" height="12" rx="0.5"/>
						<rect x="10" y="1" width="3.5" height="12" rx="0.5"/>
					</svg>
				</button>
				<button
					class="view-btn"
					class:active={view_mode === 'gallery'}
					onclick={() => view_mode = 'gallery'}
					title="Gallery view"
				>
					<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
						<rect x="1" y="1" width="12" height="9" rx="1"/>
						<rect x="1" y="11.5" width="3" height="1.5" rx="0.5"/>
						<rect x="5.5" y="11.5" width="3" height="1.5" rx="0.5"/>
						<rect x="10" y="11.5" width="3" height="1.5" rx="0.5"/>
					</svg>
				</button>
			</div>

			<div class="toolbar-separator"></div>

			<button class="action-btn" title="Group items">
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
					<rect x="2" y="2" width="4" height="4" rx="1" stroke="currentColor" stroke-width="1.3"/>
					<rect x="8" y="2" width="4" height="4" rx="1" stroke="currentColor" stroke-width="1.3"/>
					<rect x="2" y="8" width="4" height="4" rx="1" stroke="currentColor" stroke-width="1.3"/>
					<rect x="8" y="8" width="4" height="4" rx="1" stroke="currentColor" stroke-width="1.3"/>
				</svg>
			</button>

			<button class="action-btn" title="Share">
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
					<path d="M7 1v8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
					<path d="M4 4l3-3 3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M2 9v3a1 1 0 001 1h8a1 1 0 001-1V9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
				</svg>
			</button>

			<div class="toolbar-separator"></div>

			<div class="search-wrapper">
				<svg class="search-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
					<circle cx="5" cy="5" r="3.5" stroke="currentColor" stroke-width="1.3"/>
					<path d="M7.5 7.5L10 10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
				</svg>
				<input
					class="search-input"
					type="text"
					placeholder="Search"
					bind:value={search_query}
				/>
			</div>
		</div>
	</header>

	<!-- Breadcrumb / path bar -->
	<div class="path-bar">
		{#each breadcrumb_segments() as segment, i}
			{#if i > 0}
				<span class="path-separator">
					<svg width="7" height="10" viewBox="0 0 7 10" fill="none">
						<path d="M1 1l4 4-4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</span>
			{/if}
			<button
				class="path-segment"
				class:current={i === path_stack.length - 1}
				onclick={() => navigate_to_breadcrumb(i)}
			>
				{segment}
			</button>
		{/each}
	</div>

	<div class="main">
		<!-- Sidebar -->
		<aside class="sidebar">
			<div class="sidebar-section">
				<div class="sidebar-section-title">Favorites</div>
				{#each sidebar_favorites as item}
					<button
						class="sidebar-item"
						class:active={current_folder === item.name && path_stack.length === 1}
						onclick={() => navigate_to(item.name, true)}
					>
						<span class="sidebar-icon" style="color: {item.name === current_folder && path_stack.length === 1 ? 'white' : '#6e6e73'}">
							{@html get_sidebar_svg(item.icon)}
						</span>
						<span class="sidebar-label">{item.name}</span>
					</button>
				{/each}
			</div>

			<div class="sidebar-section">
				<div class="sidebar-section-title">Locations</div>
				{#each sidebar_locations as item}
					<button
						class="sidebar-item"
						class:active={current_folder === item.name && path_stack.length === 1}
						onclick={() => navigate_to(item.name, true)}
					>
						<span class="sidebar-icon" style="color: {item.name === current_folder && path_stack.length === 1 ? 'white' : '#6e6e73'}">
							{@html get_sidebar_svg(item.icon)}
						</span>
						<span class="sidebar-label">{item.name}</span>
					</button>
				{/each}
			</div>

			<div class="sidebar-section">
				<div class="sidebar-section-title">Tags</div>
				{#each sidebar_tags as tag}
					<button class="sidebar-item tag-item">
						<span class="tag-dot" style="background-color: {tag.color}"></span>
						<span class="sidebar-label">{tag.name}</span>
					</button>
				{/each}
			</div>
		</aside>

		<!-- Content area -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="content-area"
			oncontextmenu={(e) => handle_context_menu(e, null)}
			onclick={clear_selection_on_empty}
		>
			{#if view_mode === 'list'}
				<!-- List view -->
				<div class="column-headers">
					<button class="col-header col-name" onclick={() => handle_sort('name')}>
						Name{get_sort_indicator('name')}
					</button>
					<button class="col-header col-modified" onclick={() => handle_sort('modified')}>
						Date Modified{get_sort_indicator('modified')}
					</button>
					<button class="col-header col-size" onclick={() => handle_sort('size')}>
						Size{get_sort_indicator('size')}
					</button>
					<button class="col-header col-kind" onclick={() => handle_sort('kind')}>
						Kind{get_sort_indicator('kind')}
					</button>
				</div>

				<div class="file-list">
					{#if current_files.length === 0}
						<div class="empty-folder">
							{#if search_query}
								No items match your search.
							{:else}
								This folder is empty.
							{/if}
						</div>
					{/if}
					{#each current_files as file (file.name)}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="file-row"
							class:selected={selected_files.has(file.name)}
							onclick={(e) => handle_file_click(file, e)}
							ondblclick={() => handle_file_dblclick(file)}
							oncontextmenu={(e) => handle_context_menu(e, file.name)}
							role="button"
							tabindex="0"
						>
							<span class="col-name">
								<span class="file-icon-wrapper list-icon">
									{@html get_file_icon_svg(file)}
								</span>
								{#if renaming_file === file.name}
									<input
										class="rename-input"
										type="text"
										bind:value={rename_value}
										onblur={finish_rename}
										onkeydown={handle_rename_keydown}
									/>
								{:else}
									<span class="file-name-text">{file.name}</span>
								{/if}
							</span>
							<span class="col-modified">{file.modified}</span>
							<span class="col-size">{file.size}</span>
							<span class="col-kind">{file.kind}</span>
						</div>
					{/each}
				</div>

			{:else if view_mode === 'icons'}
				<!-- Icon view -->
				<div class="icon-grid">
					{#if current_files.length === 0}
						<div class="empty-folder">
							{#if search_query}
								No items match your search.
							{:else}
								This folder is empty.
							{/if}
						</div>
					{/if}
					{#each current_files as file (file.name)}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="icon-item"
							class:selected={selected_files.has(file.name)}
							onclick={(e) => handle_file_click(file, e)}
							ondblclick={() => handle_file_dblclick(file)}
							oncontextmenu={(e) => handle_context_menu(e, file.name)}
							role="button"
							tabindex="0"
						>
							<div class="icon-image">
								{@html get_file_icon_svg(file)}
							</div>
							{#if renaming_file === file.name}
								<input
									class="rename-input icon-rename"
									type="text"
									bind:value={rename_value}
									onblur={finish_rename}
									onkeydown={handle_rename_keydown}
								/>
							{:else}
								<div class="icon-label" class:selected-label={selected_files.has(file.name)}>
									{file.name}
								</div>
							{/if}
						</div>
					{/each}
				</div>

			{:else if view_mode === 'columns'}
				<!-- Column view -->
				<div class="column-view">
					<div class="column-pane">
						{#each current_files as file (file.name)}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="column-row"
								class:selected={selected_files.has(file.name)}
								onclick={(e) => handle_file_click(file, e)}
								ondblclick={() => handle_file_dblclick(file)}
								oncontextmenu={(e) => handle_context_menu(e, file.name)}
								role="button"
								tabindex="0"
							>
								<span class="file-icon-wrapper column-icon">
									{@html get_file_icon_svg(file)}
								</span>
								<span class="column-file-name">{file.name}</span>
								{#if file.kind === 'Folder'}
									<span class="column-arrow">
										<svg width="6" height="10" viewBox="0 0 6 10" fill="none">
											<path d="M1 1l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
										</svg>
									</span>
								{/if}
							</div>
						{/each}
						{#if current_files.length === 0}
							<div class="empty-column">Empty</div>
						{/if}
					</div>
					<!-- Preview column for selected file -->
					{#if selected_files.size === 1}
						{@const sel_name = [...selected_files][0]}
						{@const sel_file = current_files.find(f => f.name === sel_name)}
						{#if sel_file}
							<div class="column-pane preview-column">
								<div class="preview-icon">
									{@html get_file_icon_svg(sel_file)}
								</div>
								<div class="preview-name">{sel_file.name}</div>
								<div class="preview-details">
									<div class="preview-detail-row">
										<span class="preview-label">Kind</span>
										<span class="preview-value">{sel_file.kind}</span>
									</div>
									<div class="preview-detail-row">
										<span class="preview-label">Size</span>
										<span class="preview-value">{sel_file.size}</span>
									</div>
									<div class="preview-detail-row">
										<span class="preview-label">Modified</span>
										<span class="preview-value">{sel_file.modified}</span>
									</div>
								</div>
							</div>
						{/if}
					{/if}
				</div>

			{:else if view_mode === 'gallery'}
				<!-- Gallery view -->
				<div class="gallery-view">
					<div class="gallery-preview-area">
						{#if selected_files.size === 1}
							{@const sel_name = [...selected_files][0]}
							{@const sel_file = current_files.find(f => f.name === sel_name)}
							{#if sel_file}
								<div class="gallery-large-icon">
									{@html get_file_icon_svg(sel_file)}
								</div>
								<div class="gallery-file-name">{sel_file.name}</div>
								<div class="gallery-file-info">{sel_file.kind} - {sel_file.size}</div>
							{/if}
						{:else}
							<div class="gallery-placeholder">Select a file to preview</div>
						{/if}
					</div>
					<div class="gallery-strip">
						{#each current_files as file (file.name)}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="gallery-thumb"
								class:selected={selected_files.has(file.name)}
								onclick={(e) => handle_file_click(file, e)}
								ondblclick={() => handle_file_dblclick(file)}
								oncontextmenu={(e) => handle_context_menu(e, file.name)}
								role="button"
								tabindex="0"
							>
								<span class="gallery-thumb-icon">
									{@html get_file_icon_svg(file)}
								</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Context menu -->
			{#if ctx_visible}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="context-menu"
					style="left: {ctx_x}px; top: {ctx_y}px;"
					onclick={(e) => e.stopPropagation()}
				>
					{#if ctx_target_file}
						<button class="ctx-item" onclick={() => ctx_action('get-info')}>
							<span class="ctx-text">Get Info</span>
							<span class="ctx-shortcut">&#8984;I</span>
						</button>
						<button class="ctx-item" onclick={() => ctx_action('rename')}>
							<span class="ctx-text">Rename</span>
						</button>
						<div class="ctx-divider"></div>
						<button class="ctx-item" onclick={() => ctx_action('copy')}>
							<span class="ctx-text">Copy</span>
							<span class="ctx-shortcut">&#8984;C</span>
						</button>
						<button class="ctx-item" onclick={() => ctx_action('duplicate')}>
							<span class="ctx-text">Duplicate</span>
							<span class="ctx-shortcut">&#8984;D</span>
						</button>
						<div class="ctx-divider"></div>
						<button class="ctx-item" onclick={() => ctx_action('move-to-trash')}>
							<span class="ctx-text">Move to Trash</span>
							<span class="ctx-shortcut">&#8984;&#9003;</span>
						</button>
					{:else}
						<button class="ctx-item" onclick={() => ctx_action('new-folder')}>
							<span class="ctx-text">New Folder</span>
							<span class="ctx-shortcut">&#8984;&#8679;N</span>
						</button>
						<div class="ctx-divider"></div>
						<button class="ctx-item" onclick={() => ctx_action('get-info')}>
							<span class="ctx-text">Get Info</span>
							<span class="ctx-shortcut">&#8984;I</span>
						</button>
						<div class="ctx-divider"></div>
						{#if clipboard}
							<button class="ctx-item" onclick={() => ctx_action('paste')}>
								<span class="ctx-text">Paste Item</span>
								<span class="ctx-shortcut">&#8984;V</span>
							</button>
							<div class="ctx-divider"></div>
						{/if}
						<button class="ctx-item" onclick={() => ctx_action('select-all')}>
							<span class="ctx-text">Select All</span>
							<span class="ctx-shortcut">&#8984;A</span>
						</button>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<!-- Status bar -->
	<div class="status-bar">
		<span>{item_count_text()}</span>
		<span>{available_text()}</span>
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
		-webkit-font-smoothing: antialiased;
		user-select: none;
	}

	/* ===== Toolbar ===== */
	.toolbar {
		display: flex;
		align-items: center;
		padding: 6px 12px;
		background: linear-gradient(to bottom, #f6f6f6, #e2e2e2);
		border-bottom: 1px solid #c8c8c8;
		gap: 8px;
		min-height: 38px;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3c3c3e, #2c2c2e);
			border-bottom-color: #1c1c1e;
		}
	}

	.toolbar-nav {
		display: flex;
		gap: 2px;
	}

	.nav-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 24px;
		background: none;
		border: none;
		color: #4a4a4a;
		border-radius: 4px;
		cursor: pointer;
		padding: 0;

		&:hover:not(:disabled) {
			background-color: rgba(0, 0, 0, 0.06);
		}

		&:disabled {
			opacity: 0.3;
			cursor: default;
		}

		:global(body.dark) & {
			color: #b0b0b0;

			&:hover:not(:disabled) {
				background-color: rgba(255, 255, 255, 0.08);
			}
		}
	}

	.toolbar-title {
		flex: 1;
		text-align: center;
		font-weight: 600;
		font-size: 13px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.view-buttons {
		display: flex;
		background: rgba(0, 0, 0, 0.06);
		border-radius: 5px;
		padding: 1px;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.08);
		}
	}

	.view-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 22px;
		background: none;
		border: none;
		color: #6e6e73;
		border-radius: 4px;
		cursor: pointer;
		padding: 0;

		&.active {
			background: white;
			color: #1c1c1e;
			box-shadow: 0 0.5px 1px rgba(0,0,0,0.15), 0 0 0.5px rgba(0,0,0,0.1);
		}

		&:hover:not(.active) {
			color: #3c3c3c;
		}

		:global(body.dark) & {
			color: #8e8e93;

			&.active {
				background: #5a5a5c;
				color: white;
				box-shadow: 0 0.5px 1px rgba(0,0,0,0.3);
			}
		}
	}

	.toolbar-separator {
		width: 1px;
		height: 16px;
		background: rgba(0, 0, 0, 0.12);
		margin: 0 2px;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.12);
		}
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 24px;
		background: none;
		border: none;
		color: #6e6e73;
		border-radius: 4px;
		cursor: pointer;
		padding: 0;

		&:hover {
			background: rgba(0, 0, 0, 0.06);
		}

		:global(body.dark) & {
			color: #8e8e93;

			&:hover {
				background: rgba(255, 255, 255, 0.08);
			}
		}
	}

	.search-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 6px;
		color: #8e8e93;
		pointer-events: none;
	}

	.search-input {
		width: 140px;
		height: 22px;
		padding: 0 6px 0 22px;
		border: none;
		border-radius: 5px;
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
			box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
		}

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.08);

			&:focus {
				background: rgba(255, 255, 255, 0.1);
			}
		}
	}

	/* ===== Path bar / breadcrumb ===== */
	.path-bar {
		display: flex;
		align-items: center;
		padding: 4px 12px;
		background: rgba(0, 0, 0, 0.02);
		border-bottom: 1px solid #d1d1d6;
		min-height: 24px;
		gap: 2px;
		overflow-x: auto;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.02);
			border-bottom-color: #38383a;
		}
	}

	.path-separator {
		display: flex;
		align-items: center;
		color: #8e8e93;
		flex-shrink: 0;
	}

	.path-segment {
		background: none;
		border: none;
		padding: 2px 6px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 12px;
		color: #636366;
		white-space: nowrap;
		font-family: inherit;

		&:hover {
			background: rgba(0, 0, 0, 0.06);
			color: #1c1c1e;
		}

		&.current {
			font-weight: 600;
			color: var(--system-color-light-contrast);
		}

		:global(body.dark) & {
			color: #8e8e93;

			&:hover {
				background: rgba(255, 255, 255, 0.06);
				color: white;
			}

			&.current {
				color: white;
			}
		}
	}

	/* ===== Main layout ===== */
	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* ===== Sidebar ===== */
	.sidebar {
		width: 170px;
		min-width: 170px;
		background-color: #f2f2f7;
		border-right: 1px solid #d1d1d6;
		overflow-y: auto;
		padding: 4px 0;

		:global(body.dark) & {
			background-color: rgba(30, 30, 32, 0.95);
			border-right-color: #38383a;
		}
	}

	.sidebar-section {
		margin-bottom: 4px;
	}

	.sidebar-section-title {
		font-size: 11px;
		font-weight: 700;
		color: #86868b;
		text-transform: uppercase;
		padding: 6px 14px 2px;
		letter-spacing: 0.3px;
	}

	.sidebar-item {
		display: flex;
		align-items: center;
		gap: 6px;
		width: calc(100% - 12px);
		margin: 0 6px;
		padding: 3px 8px;
		border: none;
		background: none;
		font-size: 13px;
		color: var(--system-color-light-contrast);
		cursor: pointer;
		text-align: left;
		border-radius: 5px;
		font-family: inherit;

		&:hover {
			background-color: rgba(0, 0, 0, 0.05);
		}

		&.active {
			background-color: #007aff;
			color: white;
		}

		:global(body.dark) &:hover {
			background-color: rgba(255, 255, 255, 0.06);
		}

		:global(body.dark) &.active {
			background-color: #0a84ff;
		}
	}

	.sidebar-icon {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;

		:global(svg) {
			width: 14px;
			height: 14px;
		}
	}

	.sidebar-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tag-item {
		gap: 8px;
	}

	.tag-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	/* ===== Content area ===== */
	.content-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
	}

	/* ===== List view ===== */
	.column-headers {
		display: flex;
		padding: 0 12px;
		border-bottom: 1px solid #d1d1d6;
		font-size: 11px;
		font-weight: 500;
		color: #86868b;
		background-color: rgba(0, 0, 0, 0.02);
		min-height: 22px;

		:global(body.dark) & {
			border-bottom-color: #38383a;
			background-color: rgba(255, 255, 255, 0.02);
		}
	}

	.col-header {
		display: flex;
		align-items: center;
		background: none;
		border: none;
		border-right: 1px solid rgba(0, 0, 0, 0.08);
		padding: 3px 8px;
		font-size: 11px;
		font-weight: 500;
		color: #86868b;
		cursor: pointer;
		font-family: inherit;
		white-space: nowrap;

		&:last-child {
			border-right: none;
		}

		&:hover {
			color: #4a4a4a;
			background: rgba(0, 0, 0, 0.03);
		}

		:global(body.dark) & {
			border-right-color: rgba(255, 255, 255, 0.06);

			&:hover {
				color: #ccc;
				background: rgba(255, 255, 255, 0.03);
			}
		}
	}

	.col-name {
		flex: 2.5;
		display: flex;
		align-items: center;
		gap: 6px;
		min-width: 0;
	}

	.col-modified {
		flex: 1;
		min-width: 0;
	}

	.col-size {
		width: 80px;
		text-align: right;
		flex-shrink: 0;
		justify-content: flex-end;
	}

	.col-kind {
		flex: 1;
		text-align: right;
		justify-content: flex-end;
		min-width: 0;
	}

	.file-list {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.file-row {
		display: flex;
		padding: 2px 12px;
		background: none;
		width: 100%;
		font-size: 13px;
		color: var(--system-color-light-contrast);
		cursor: default;
		text-align: left;
		align-items: center;
		border-bottom: 1px solid rgba(0, 0, 0, 0.04);
		min-height: 24px;
		outline: none;

		&:hover:not(.selected) {
			background-color: rgba(0, 0, 0, 0.03);
		}

		&.selected {
			background-color: #007aff;
			color: white;
		}

		:global(body.dark) & {
			border-bottom-color: rgba(255, 255, 255, 0.04);

			&:hover:not(.selected) {
				background-color: rgba(255, 255, 255, 0.04);
			}

			&.selected {
				background-color: #0a84ff;
			}
		}
	}

	.file-icon-wrapper {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;

		:global(svg) {
			display: block;
		}
	}

	.list-icon {
		width: 18px;
		height: 18px;

		:global(svg) {
			width: 18px;
			height: 18px;
		}
	}

	.file-name-text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
	}

	.rename-input {
		background: white;
		border: 2px solid #007aff;
		border-radius: 3px;
		padding: 1px 4px;
		font-size: 13px;
		font-family: inherit;
		color: #1c1c1e;
		outline: none;
		width: 200px;
		min-width: 100px;
	}

	/* ===== Icon view ===== */
	.icon-grid {
		flex: 1;
		display: flex;
		flex-wrap: wrap;
		align-content: flex-start;
		gap: 4px;
		padding: 16px;
		overflow-y: auto;
	}

	.icon-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 90px;
		padding: 8px 4px;
		border-radius: 6px;
		cursor: default;
		outline: none;

		&:hover:not(.selected) {
			background: rgba(0, 0, 0, 0.04);
		}

		&.selected {
			background: rgba(0, 122, 255, 0.1);
		}

		:global(body.dark) &:hover:not(.selected) {
			background: rgba(255, 255, 255, 0.04);
		}

		:global(body.dark) &.selected {
			background: rgba(10, 132, 255, 0.2);
		}
	}

	.icon-image {
		width: 56px;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 4px;

		:global(svg) {
			width: 52px;
			height: 52px;
		}
	}

	.icon-label {
		font-size: 11px;
		text-align: center;
		line-height: 1.3;
		max-width: 84px;
		word-break: break-word;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		padding: 1px 4px;
		border-radius: 3px;
	}

	.selected-label {
		background: #007aff;
		color: white;

		:global(body.dark) & {
			background: #0a84ff;
		}
	}

	.icon-rename {
		width: 80px;
		text-align: center;
		min-width: 60px;
	}

	/* ===== Column view ===== */
	.column-view {
		flex: 1;
		display: flex;
		overflow-x: auto;
	}

	.column-pane {
		min-width: 220px;
		max-width: 280px;
		border-right: 1px solid #d1d1d6;
		overflow-y: auto;
		flex-shrink: 0;

		:global(body.dark) & {
			border-right-color: #38383a;
		}
	}

	.column-row {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 3px 8px;
		cursor: default;
		outline: none;
		min-height: 22px;

		&:hover:not(.selected) {
			background: rgba(0, 0, 0, 0.04);
		}

		&.selected {
			background: #007aff;
			color: white;
		}

		:global(body.dark) &.selected {
			background: #0a84ff;
		}
	}

	.column-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;

		:global(svg) {
			width: 16px;
			height: 16px;
		}
	}

	.column-file-name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 12px;
	}

	.column-arrow {
		color: #8e8e93;
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.column-row.selected .column-arrow {
		color: white;
	}

	.empty-column {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #8e8e93;
		font-size: 12px;
	}

	.preview-column {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 24px 16px;
		min-width: 200px;
		background: rgba(0, 0, 0, 0.01);

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.01);
		}
	}

	.preview-icon {
		width: 64px;
		height: 64px;
		margin-bottom: 8px;

		:global(svg) {
			width: 64px;
			height: 64px;
		}
	}

	.preview-name {
		font-size: 13px;
		font-weight: 600;
		text-align: center;
		margin-bottom: 16px;
		word-break: break-word;
	}

	.preview-details {
		width: 100%;
	}

	.preview-detail-row {
		display: flex;
		justify-content: space-between;
		padding: 3px 0;
		font-size: 11px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);

		:global(body.dark) & {
			border-bottom-color: rgba(255, 255, 255, 0.05);
		}
	}

	.preview-label {
		color: #8e8e93;
	}

	.preview-value {
		font-weight: 500;
	}

	/* ===== Gallery view ===== */
	.gallery-view {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.gallery-preview-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 24px;
		background: rgba(0, 0, 0, 0.01);

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.01);
		}
	}

	.gallery-large-icon {
		width: 128px;
		height: 128px;
		margin-bottom: 12px;

		:global(svg) {
			width: 128px;
			height: 128px;
		}
	}

	.gallery-file-name {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 4px;
		text-align: center;
	}

	.gallery-file-info {
		font-size: 12px;
		color: #8e8e93;
	}

	.gallery-placeholder {
		font-size: 14px;
		color: #8e8e93;
	}

	.gallery-strip {
		display: flex;
		overflow-x: auto;
		padding: 8px 12px;
		gap: 6px;
		border-top: 1px solid #d1d1d6;
		background: rgba(0, 0, 0, 0.02);
		min-height: 60px;

		:global(body.dark) & {
			border-top-color: #38383a;
			background: rgba(255, 255, 255, 0.02);
		}
	}

	.gallery-thumb {
		width: 48px;
		height: 48px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 5px;
		cursor: default;
		outline: none;
		border: 2px solid transparent;

		&:hover:not(.selected) {
			background: rgba(0, 0, 0, 0.05);
		}

		&.selected {
			border-color: #007aff;
			background: rgba(0, 122, 255, 0.08);
		}

		:global(body.dark) &.selected {
			border-color: #0a84ff;
		}
	}

	.gallery-thumb-icon {
		width: 32px;
		height: 32px;

		:global(svg) {
			width: 32px;
			height: 32px;
		}
	}

	/* ===== Context menu ===== */
	.context-menu {
		position: absolute;
		min-width: 200px;
		padding: 4px;
		background: rgba(246, 246, 246, 0.95);
		backdrop-filter: blur(20px);
		border-radius: 6px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 0 0 0 0.5px rgba(0, 0, 0, 0.1);
		z-index: 100;

		:global(body.dark) & {
			background: rgba(44, 44, 46, 0.95);
			box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 0.5px rgba(255, 255, 255, 0.1);
		}
	}

	.ctx-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 4px 10px;
		background: none;
		border: none;
		border-radius: 4px;
		font-size: 13px;
		color: var(--system-color-light-contrast);
		cursor: default;
		text-align: left;
		font-family: inherit;
		gap: 16px;

		&:hover {
			background: #007aff;
			color: white;
		}

		:global(body.dark) &:hover {
			background: #0a84ff;
		}
	}

	.ctx-text {
		white-space: nowrap;
	}

	.ctx-shortcut {
		font-size: 12px;
		opacity: 0.5;
		white-space: nowrap;
	}

	.ctx-item:hover .ctx-shortcut {
		opacity: 0.8;
	}

	.ctx-divider {
		height: 1px;
		background: rgba(0, 0, 0, 0.1);
		margin: 4px 8px;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.1);
		}
	}

	/* ===== Empty / status ===== */
	.empty-folder {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		min-height: 120px;
		color: #86868b;
		font-size: 14px;
		flex: 1;
	}

	.status-bar {
		display: flex;
		justify-content: space-between;
		padding: 3px 12px;
		border-top: 1px solid #d1d1d6;
		font-size: 11px;
		color: #86868b;
		background: rgba(0, 0, 0, 0.01);
		min-height: 18px;

		:global(body.dark) & {
			border-top-color: #38383a;
			background: rgba(255, 255, 255, 0.01);
		}
	}
</style>
