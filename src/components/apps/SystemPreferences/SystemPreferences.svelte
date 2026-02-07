<script lang="ts">
	import { wallpapers_config, type WallpaperID } from '🍎/configs/wallpapers/wallpaper.config.ts';
	import { colors } from '🍎/configs/theme/colors.config.ts';
	import { preferences } from '🍎/state/preferences.svelte.ts';

	// --- Sidebar sections ---
	type Section = { id: string; name: string; icon: string; iconBg: string; group: string };

	const sections: Section[] = [
		{ id: 'apple-id', name: 'Apple ID', icon: 'person', iconBg: '#007AFF', group: 'top' },
		{ id: 'wi-fi', name: 'Wi-Fi', icon: 'wifi', iconBg: '#007AFF', group: 'connectivity' },
		{ id: 'bluetooth', name: 'Bluetooth', icon: 'bluetooth', iconBg: '#007AFF', group: 'connectivity' },
		{ id: 'network', name: 'Network', icon: 'globe', iconBg: '#007AFF', group: 'connectivity' },
		{ id: 'notifications', name: 'Notifications', icon: 'bell', iconBg: '#FF3B30', group: 'alerts' },
		{ id: 'sound', name: 'Sound', icon: 'speaker', iconBg: '#FF2D55', group: 'alerts' },
		{ id: 'focus', name: 'Focus', icon: 'moon', iconBg: '#5856D6', group: 'alerts' },
		{ id: 'screen-time', name: 'Screen Time', icon: 'hourglass', iconBg: '#5856D6', group: 'alerts' },
		{ id: 'general', name: 'General', icon: 'gear', iconBg: '#8E8E93', group: 'main' },
		{ id: 'appearance', name: 'Appearance', icon: 'paintbrush', iconBg: '#007AFF', group: 'main' },
		{ id: 'accessibility', name: 'Accessibility', icon: 'accessibility', iconBg: '#007AFF', group: 'main' },
		{ id: 'control-center', name: 'Control Center', icon: 'sliders', iconBg: '#8E8E93', group: 'main' },
		{ id: 'siri', name: 'Siri & Spotlight', icon: 'sparkles', iconBg: '#BF5AF2', group: 'main' },
		{ id: 'privacy', name: 'Privacy & Security', icon: 'shield', iconBg: '#007AFF', group: 'main' },
		{ id: 'desktop-dock', name: 'Desktop & Dock', icon: 'dock', iconBg: '#007AFF', group: 'display' },
		{ id: 'displays', name: 'Displays', icon: 'display', iconBg: '#007AFF', group: 'display' },
		{ id: 'wallpaper', name: 'Wallpaper', icon: 'photo', iconBg: '#34C759', group: 'display' },
		{ id: 'screen-saver', name: 'Screen Saver', icon: 'sparkle', iconBg: '#FF9500', group: 'display' },
		{ id: 'battery', name: 'Battery', icon: 'battery', iconBg: '#34C759', group: 'display' },
		{ id: 'lock-screen', name: 'Lock Screen', icon: 'lock', iconBg: '#8E8E93', group: 'display' },
		{ id: 'users', name: 'Users & Groups', icon: 'users', iconBg: '#8E8E93', group: 'input' },
		{ id: 'keyboard', name: 'Keyboard', icon: 'keyboard', iconBg: '#8E8E93', group: 'input' },
		{ id: 'trackpad', name: 'Trackpad', icon: 'trackpad', iconBg: '#8E8E93', group: 'input' },
		{ id: 'mouse', name: 'Mouse', icon: 'mouse', iconBg: '#8E8E93', group: 'input' },
	];

	let search_query = $state('');
	let selected_section = $state('appearance');

	const filtered_sections = $derived(
		search_query
			? sections.filter(s =>
				s.name.toLowerCase().includes(search_query.toLowerCase())
			)
			: sections
	);

	const grouped_sections = $derived.by(() => {
		const groups: { group: string; items: Section[] }[] = [];
		let last_group = '';
		for (const s of filtered_sections) {
			const g = s.group || '';
			if (g !== last_group) {
				groups.push({ group: g, items: [] });
				last_group = g;
			}
			groups[groups.length - 1].items.push(s);
		}
		return groups;
	});

	// --- SVG icon paths (SF Symbol style) ---
	function get_icon_svg(icon: string): string {
		const paths: Record<string, string> = {
			person: '<path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z"/>',
			wifi: '<path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>',
			bluetooth: '<path d="M17 7l-5-5v7.59L7.41 5 6 6.41 10.59 11 6 15.59 7.41 17 12 12.41V20l5-5-3.59-3.59L17 7zm-4-1.17L14.17 7 13 8.17V5.83zm0 10.34V13.83L14.17 15 13 16.17z"/>',
			globe: '<circle cx="12" cy="12" r="9.5" fill="none" stroke="white" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="4" ry="9.5" fill="none" stroke="white" stroke-width="1.3"/><line x1="2.5" y1="12" x2="21.5" y2="12" stroke="white" stroke-width="1.3"/><line x1="4" y1="7" x2="20" y2="7" stroke="white" stroke-width="1"/><line x1="4" y1="17" x2="20" y2="17" stroke="white" stroke-width="1"/>',
			bell: '<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>',
			speaker: '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>',
			moon: '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>',
			hourglass: '<path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z"/>',
			gear: '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>',
			paintbrush: '<path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 000-1.41z"/>',
			accessibility: '<circle cx="12" cy="4" r="2"/><path d="M19 13v-2c-1.54.02-3.09-.75-4.07-1.83l-1.29-1.43c-.17-.19-.38-.34-.61-.45-.01 0-.01-.01-.02-.01H13c-.35-.2-.75-.3-1.19-.26C10.76 7.11 10 8.04 10 9.09V15c0 1.1.9 2 2 2h5v5h2v-5.5c0-1.1-.9-2-2-2h-3v-3.45c1.29 1.07 3.25 1.94 5 1.95zm-6.17 5c-.41 1.16-1.52 2-2.83 2-1.66 0-3-1.34-3-3 0-1.31.84-2.41 2-2.83V12.1c-2.28.46-4 2.48-4 4.9 0 2.76 2.24 5 5 5 2.42 0 4.44-1.72 4.9-4h-2.07z"/>',
			sliders: '<path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>',
			sparkles: '<path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z"/>',
			shield: '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>',
			dock: '<rect x="2" y="6" width="20" height="12" rx="2" fill="none" stroke="white" stroke-width="1.8"/><line x1="2" y1="14" x2="22" y2="14" stroke="white" stroke-width="1.5"/><rect x="5" y="15.5" width="2" height="1.5" rx="0.3" fill="white" opacity="0.7"/><rect x="8.5" y="15.5" width="2" height="1.5" rx="0.3" fill="white" opacity="0.7"/><rect x="12" y="15.5" width="2" height="1.5" rx="0.3" fill="white" opacity="0.7"/>',
			display: '<rect x="2" y="3" width="20" height="14" rx="2" fill="none" stroke="white" stroke-width="1.8"/><line x1="8" y1="21" x2="16" y2="21" stroke="white" stroke-width="1.8" stroke-linecap="round"/><line x1="12" y1="17" x2="12" y2="21" stroke="white" stroke-width="1.8"/>',
			photo: '<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="white" stroke-width="1.8"/><circle cx="8.5" cy="8.5" r="1.5" fill="white"/><path d="M21 15l-5-5L5 21" stroke="white" stroke-width="1.5" fill="none"/>',
			sparkle: '<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/>',
			battery: '<rect x="2" y="7" width="18" height="10" rx="2" fill="none" stroke="white" stroke-width="1.8"/><rect x="4" y="9" width="12" height="6" rx="1" fill="white" opacity="0.8"/><path d="M22 11v2" stroke="white" stroke-width="2" stroke-linecap="round"/>',
			lock: '<rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="white" stroke-width="1.8"/><path d="M8 11V7c0-2.21 1.79-4 4-4s4 1.79 4 4v4" fill="none" stroke="white" stroke-width="1.8"/><circle cx="12" cy="16" r="1.5" fill="white"/>',
			users: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
			keyboard: '<rect x="2" y="5" width="20" height="14" rx="2.5" fill="none" stroke="white" stroke-width="1.6"/><line x1="6" y1="9" x2="8" y2="9" stroke="white" stroke-width="1.2" stroke-linecap="round"/><line x1="11" y1="9" x2="13" y2="9" stroke="white" stroke-width="1.2" stroke-linecap="round"/><line x1="16" y1="9" x2="18" y2="9" stroke="white" stroke-width="1.2" stroke-linecap="round"/><line x1="6" y1="12.5" x2="8" y2="12.5" stroke="white" stroke-width="1.2" stroke-linecap="round"/><line x1="11" y1="12.5" x2="13" y2="12.5" stroke="white" stroke-width="1.2" stroke-linecap="round"/><line x1="16" y1="12.5" x2="18" y2="12.5" stroke="white" stroke-width="1.2" stroke-linecap="round"/><line x1="8" y1="16" x2="16" y2="16" stroke="white" stroke-width="1.2" stroke-linecap="round"/>',
			trackpad: '<rect x="4" y="2" width="16" height="20" rx="3" fill="none" stroke="white" stroke-width="1.8"/><line x1="4" y1="16" x2="20" y2="16" stroke="white" stroke-width="1.2"/>',
			mouse: '<rect x="7" y="2" width="10" height="20" rx="5" fill="none" stroke="white" stroke-width="1.8"/><line x1="12" y1="2" x2="12" y2="10" stroke="white" stroke-width="1.2"/>',
		};
		return paths[icon] || paths.gear;
	}

	// --- Appearance section state ---
	const appearance_modes = ['Light', 'Dark', 'Auto'] as const;
	let auto_mode = $state(false);
	let selected_appearance = $derived(
		auto_mode ? 'Auto' : preferences.theme.scheme === 'light' ? 'Light' : 'Dark'
	);

	function set_appearance(mode: string) {
		if (mode === 'Light') {
			auto_mode = false;
			preferences.theme.scheme = 'light';
		} else if (mode === 'Dark') {
			auto_mode = false;
			preferences.theme.scheme = 'dark';
		} else {
			auto_mode = true;
			preferences.theme.scheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
	}

	const accent_colors = [
		{ name: 'Multicolor', color: 'linear-gradient(135deg, #FF2D55, #FF9500, #FFCC00, #34C759, #007AFF, #5856D6)', value: 'blue' as const, multi: true },
		{ name: 'Blue', color: '#007AFF', value: 'blue' as const, multi: false },
		{ name: 'Purple', color: '#5856D6', value: 'purple' as const, multi: false },
		{ name: 'Pink', color: '#FF2D55', value: 'pink' as const, multi: false },
		{ name: 'Red', color: '#FF3B30', value: 'pink' as const, multi: false },
		{ name: 'Orange', color: '#FF9500', value: 'orange' as const, multi: false },
		{ name: 'Yellow', color: '#FFCC00', value: 'orange' as const, multi: false },
		{ name: 'Green', color: '#34C759', value: 'green' as const, multi: false },
		{ name: 'Graphite', color: '#8E8E93', value: 'cyan' as const, multi: false },
	];

	let selected_accent_index = $state(1); // default to Blue

	function select_accent(index: number) {
		const ac = accent_colors[index];
		selected_accent_index = index;
		if (ac.value in colors) {
			preferences.theme.primaryColor = ac.value;
		}
	}

	// --- Wallpaper section state ---
	const all_wallpapers = Object.entries(wallpapers_config);
	let selected_wallpaper_id = $derived(preferences.wallpaper.id);

	function change_wallpaper(id: WallpaperID) {
		preferences.wallpaper.id = id;
	}

	// --- Desktop & Dock state ---
	let dock_size = $state(48);
	let dock_magnification = $state(true);
	let dock_position = $state<'Bottom' | 'Left' | 'Right'>('Bottom');
	let minimize_effect = $state<'Genie' | 'Scale'>('Genie');
	let auto_hide_dock = $state(false);
	let show_recent_apps = $state(true);
	let minimize_into_icon = $state(false);
	let double_click_titlebar = $state('Zoom');

	// --- Displays state ---
	let display_brightness = $state(75);
	let night_shift = $state(false);
	let selected_resolution = $state('default');
	let true_tone = $state(true);

	// --- Sound state ---
	let output_volume = $state(65);
	let input_volume = $state(50);
	let selected_output = $state('MacBook Pro Speakers');
	let selected_alert = $state('Purr');
	let alert_volume = $state(70);
	let play_feedback = $state(true);
	let play_ui_sounds = $state(true);

	const output_devices = [
		{ name: 'MacBook Pro Speakers', type: 'Built-in' },
		{ name: 'External Headphones', type: 'Headphones' },
		{ name: 'AirPods Pro', type: 'Bluetooth' },
	];

	const alert_sounds = ['Basso', 'Blow', 'Bottle', 'Frog', 'Funk', 'Glass', 'Hero', 'Morse', 'Ping', 'Pop', 'Purr', 'Sosumi', 'Submarine', 'Tink'];

	// --- Wi-Fi state ---
	let wifi_enabled = $state(true);

	type Network = { name: string; signal: number; secured: boolean; connected: boolean };
	let networks = $state<Network[]>([
		{ name: 'Home Network', signal: 3, secured: true, connected: true },
		{ name: 'Neighbor_5G', signal: 2, secured: true, connected: false },
		{ name: 'CoffeeShop_Free', signal: 2, secured: false, connected: false },
		{ name: 'Office-Guest', signal: 1, secured: true, connected: false },
		{ name: 'xfinitywifi', signal: 1, secured: false, connected: false },
	]);

	function connect_wifi(name: string) {
		networks = networks.map(n => ({ ...n, connected: n.name === name }));
	}

	// --- Appearance toggles ---
	let wallpaper_tinting = $state(true);
	let scroll_bar_mode = $state('auto');
	let scroll_click_mode = $state('page');

	// --- General "About" data ---
	const about_info = {
		name: 'macOS Sonoma',
		version: '14.3.1',
		chip: 'Apple M3 Pro',
		memory: '18 GB',
		serial: 'FVFH40EXAMPLE',
		startup_disk: 'Macintosh HD',
		model: 'MacBook Pro (14-inch, Nov 2023)',
	};
</script>

<section class="container">
	<!-- Sidebar -->
	<aside class="sidebar app-window-drag-handle">
		<div class="sidebar-search">
			<svg class="search-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
				<circle cx="5" cy="5" r="3.5" stroke="currentColor" stroke-width="1.3"/>
				<line x1="7.8" y1="7.8" x2="10.5" y2="10.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
			</svg>
			<input
				type="text"
				bind:value={search_query}
				placeholder="Search"
			/>
		</div>

		<nav class="sidebar-nav">
			{#each grouped_sections as group, gi}
				<div class="sidebar-group">
					{#each group.items as section}
						<button
							class="sidebar-item"
							class:active={selected_section === section.id}
							onclick={() => selected_section = section.id}
						>
							<span class="sidebar-icon" style="background: {section.iconBg}">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="white">
									{@html get_icon_svg(section.icon)}
								</svg>
							</span>
							<span class="sidebar-label">{section.name}</span>
						</button>
					{/each}
				</div>
				{#if gi < grouped_sections.length - 1}
					<div class="sidebar-gap"></div>
				{/if}
			{/each}
		</nav>
	</aside>

	<!-- Content pane -->
	<main class="content-pane">
		{#key selected_section}
		<div class="section-content" class:fade-in={true}>

		{#if selected_section === 'general'}
			<h1 class="section-title">General</h1>

			<!-- Compact About This Mac header -->
			<div class="setting-card">
				<div class="about-header-compact">
					<div class="about-mac-icon-compact">
						<svg width="36" height="36" viewBox="0 0 24 24" fill="none">
							<rect x="3" y="2" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
							<line x1="8" y1="20" x2="16" y2="20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
							<line x1="12" y1="16" x2="12" y2="20" stroke="currentColor" stroke-width="1.5"/>
						</svg>
					</div>
					<div class="about-mac-info-compact">
						<span class="about-mac-name-compact">{about_info.name}</span>
						<span class="about-mac-model-compact">{about_info.model}</span>
					</div>
				</div>
			</div>

			<!-- General navigation items -->
			<div class="setting-card">
				<button class="general-nav-row">
					<span class="general-nav-icon" style="background: #8E8E93;">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="9" fill="none" stroke="white" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="13" stroke="white" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1.2" fill="white"/></svg>
					</span>
					<span class="general-nav-label">About</span>
					<svg class="chevron" width="7" height="12" viewBox="0 0 7 12" fill="none">
						<path d="M1 1l5 5-5 5" stroke="#C7C7CC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
				<div class="setting-divider"></div>
				<button class="general-nav-row">
					<span class="general-nav-icon" style="background: #8E8E93;">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
					</span>
					<span class="general-nav-label">Software Update</span>
					<svg class="chevron" width="7" height="12" viewBox="0 0 7 12" fill="none">
						<path d="M1 1l5 5-5 5" stroke="#C7C7CC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
				<div class="setting-divider"></div>
				<button class="general-nav-row">
					<span class="general-nav-icon" style="background: #8E8E93;">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="white" stroke-width="2"/><line x1="4" y1="10" x2="20" y2="10" stroke="white" stroke-width="1.5"/><line x1="4" y1="14" x2="20" y2="14" stroke="white" stroke-width="1.5"/></svg>
					</span>
					<span class="general-nav-label">Storage</span>
					<svg class="chevron" width="7" height="12" viewBox="0 0 7 12" fill="none">
						<path d="M1 1l5 5-5 5" stroke="#C7C7CC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
			</div>

			<div class="setting-card">
				<button class="general-nav-row">
					<span class="general-nav-icon" style="background: #007AFF;">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2L6.5 11h3.5v5l5.5-9h-3.5V2z"/></svg>
					</span>
					<span class="general-nav-label">AirDrop & Handoff</span>
					<svg class="chevron" width="7" height="12" viewBox="0 0 7 12" fill="none">
						<path d="M1 1l5 5-5 5" stroke="#C7C7CC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
				<div class="setting-divider"></div>
				<button class="general-nav-row">
					<span class="general-nav-icon" style="background: #8E8E93;">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M3 5h18v2H3V5zm0 4h18v2H3V9zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/></svg>
					</span>
					<span class="general-nav-label">Login Items</span>
					<svg class="chevron" width="7" height="12" viewBox="0 0 7 12" fill="none">
						<path d="M1 1l5 5-5 5" stroke="#C7C7CC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
			</div>

			<div class="setting-card">
				<button class="general-nav-row">
					<span class="general-nav-icon" style="background: #007AFF;">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" stroke-width="2"/><ellipse cx="12" cy="12" rx="3.5" ry="9" stroke="white" stroke-width="1.5"/><line x1="3" y1="12" x2="21" y2="12" stroke="white" stroke-width="1.5"/></svg>
					</span>
					<span class="general-nav-label">Language & Region</span>
					<svg class="chevron" width="7" height="12" viewBox="0 0 7 12" fill="none">
						<path d="M1 1l5 5-5 5" stroke="#C7C7CC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
				<div class="setting-divider"></div>
				<button class="general-nav-row">
					<span class="general-nav-icon" style="background: #007AFF;">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="9" fill="none" stroke="white" stroke-width="2"/><line x1="12" y1="6" x2="12" y2="12" stroke="white" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="12" x2="16" y2="14" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
					</span>
					<span class="general-nav-label">Date & Time</span>
					<svg class="chevron" width="7" height="12" viewBox="0 0 7 12" fill="none">
						<path d="M1 1l5 5-5 5" stroke="#C7C7CC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
				<div class="setting-divider"></div>
				<button class="general-nav-row">
					<span class="general-nav-icon" style="background: #007AFF;">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
					</span>
					<span class="general-nav-label">Sharing</span>
					<svg class="chevron" width="7" height="12" viewBox="0 0 7 12" fill="none">
						<path d="M1 1l5 5-5 5" stroke="#C7C7CC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
			</div>

			<div class="setting-card">
				<button class="general-nav-row">
					<span class="general-nav-icon" style="background: #34C759;">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="9" fill="none" stroke="white" stroke-width="2"/><polyline points="12,6 12,12 16,14" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 4.5L2 7" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"/><path d="M19.5 4.5L22 7" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>
					</span>
					<span class="general-nav-label">Time Machine</span>
					<svg class="chevron" width="7" height="12" viewBox="0 0 7 12" fill="none">
						<path d="M1 1l5 5-5 5" stroke="#C7C7CC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
			</div>

			<div class="setting-card">
				<button class="general-nav-row">
					<span class="general-nav-icon" style="background: #8E8E93;">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/></svg>
					</span>
					<span class="general-nav-label">Transfer or Reset</span>
					<svg class="chevron" width="7" height="12" viewBox="0 0 7 12" fill="none">
						<path d="M1 1l5 5-5 5" stroke="#C7C7CC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
				<div class="setting-divider"></div>
				<button class="general-nav-row">
					<span class="general-nav-icon" style="background: #8E8E93;">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="white" stroke-width="1.5"/></svg>
					</span>
					<span class="general-nav-label">Startup Disk</span>
					<svg class="chevron" width="7" height="12" viewBox="0 0 7 12" fill="none">
						<path d="M1 1l5 5-5 5" stroke="#C7C7CC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
			</div>

		{:else if selected_section === 'appearance'}
			<h1 class="section-title">Appearance</h1>

			<!-- Appearance mode -->
			<div class="setting-card">
				<div class="card-label">Appearance</div>
				<div class="appearance-modes">
					{#each appearance_modes as mode}
						<button
							class="appearance-option"
							class:active={selected_appearance === mode}
							onclick={() => set_appearance(mode)}
						>
							<div class="appearance-preview" class:dark-preview={mode === 'Dark'} class:auto-preview={mode === 'Auto'}>
								<div class="preview-titlebar">
									<div class="preview-dots">
										<span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
									</div>
								</div>
								<div class="preview-body">
									<div class="preview-sidebar"></div>
									<div class="preview-content">
										<div class="preview-line"></div>
										<div class="preview-line short"></div>
									</div>
								</div>
							</div>
							<span class="appearance-label">{mode}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Accent color -->
			<div class="setting-card">
				<div class="setting-row">
					<span class="setting-row-label">Accent color</span>
					<div class="accent-colors">
						{#each accent_colors as ac, i}
							<button
								class="accent-swatch"
								class:active={selected_accent_index === i}
								style="background: {ac.color};"
								title={ac.name}
								onclick={() => select_accent(i)}
							>
								{#if selected_accent_index === i && !ac.multi}
									<svg width="10" height="8" viewBox="0 0 10 8" fill="none">
										<path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				</div>
				<div class="setting-divider"></div>
				<div class="setting-row">
					<span class="setting-row-label">Highlight color</span>
					<div class="select-wrapper">
						<select class="mac-select">
							<option>Accent Color</option>
							<option>Blue</option>
							<option>Purple</option>
							<option>Pink</option>
							<option>Red</option>
							<option>Orange</option>
							<option>Yellow</option>
							<option>Green</option>
							<option>Graphite</option>
						</select>
					</div>
				</div>
			</div>

			<!-- Sidebar icon size -->
			<div class="setting-card">
				<div class="setting-row">
					<span class="setting-row-label">Sidebar icon size</span>
					<div class="select-wrapper">
						<select class="mac-select">
							<option>Small</option>
							<option selected>Medium</option>
							<option>Large</option>
						</select>
					</div>
				</div>
			</div>

			<!-- Allow wallpaper tinting -->
			<div class="setting-card">
				<div class="setting-row">
					<div class="setting-label-group">
						<span class="setting-row-label">Allow wallpaper tinting in windows</span>
						<span class="setting-row-desc">Windows and the sidebar will be slightly tinted based on your wallpaper</span>
					</div>
					<button class="toggle" class:on={wallpaper_tinting} onclick={() => wallpaper_tinting = !wallpaper_tinting}>
						<span class="toggle-knob"></span>
					</button>
				</div>
			</div>

			<!-- Show scroll bars -->
			<div class="setting-card">
				<div class="radio-group-header">Show scroll bars</div>
				<div class="radio-group-options">
					<label class="radio-option" onclick={() => scroll_bar_mode = 'auto'}>
						<span class="radio-circle" class:selected={scroll_bar_mode === 'auto'}>
							{#if scroll_bar_mode === 'auto'}
								<span class="radio-circle-inner"></span>
							{/if}
						</span>
						<span class="radio-label">Automatically based on mouse or trackpad</span>
					</label>
					<label class="radio-option" onclick={() => scroll_bar_mode = 'scrolling'}>
						<span class="radio-circle" class:selected={scroll_bar_mode === 'scrolling'}>
							{#if scroll_bar_mode === 'scrolling'}
								<span class="radio-circle-inner"></span>
							{/if}
						</span>
						<span class="radio-label">When scrolling</span>
					</label>
					<label class="radio-option" onclick={() => scroll_bar_mode = 'always'}>
						<span class="radio-circle" class:selected={scroll_bar_mode === 'always'}>
							{#if scroll_bar_mode === 'always'}
								<span class="radio-circle-inner"></span>
							{/if}
						</span>
						<span class="radio-label">Always</span>
					</label>
				</div>
			</div>

			<!-- Click in the scroll bar to -->
			<div class="setting-card">
				<div class="radio-group-header">Click in the scroll bar to</div>
				<div class="radio-group-options">
					<label class="radio-option" onclick={() => scroll_click_mode = 'page'}>
						<span class="radio-circle" class:selected={scroll_click_mode === 'page'}>
							{#if scroll_click_mode === 'page'}
								<span class="radio-circle-inner"></span>
							{/if}
						</span>
						<span class="radio-label">Jump to the next page</span>
					</label>
					<label class="radio-option" onclick={() => scroll_click_mode = 'spot'}>
						<span class="radio-circle" class:selected={scroll_click_mode === 'spot'}>
							{#if scroll_click_mode === 'spot'}
								<span class="radio-circle-inner"></span>
							{/if}
						</span>
						<span class="radio-label">Jump to the spot that's clicked</span>
					</label>
				</div>
			</div>

		{:else if selected_section === 'wallpaper'}
			<h1 class="section-title">Wallpaper</h1>

			<div class="setting-card wallpaper-card">
				<div class="current-wallpaper-preview">
					<div class="wallpaper-thumb-large" style="background-image: url({preferences.wallpaper.image})"></div>
					<div class="current-wallpaper-info">
						<span class="wallpaper-current-name">{wallpapers_config[preferences.wallpaper.id]?.name || 'Unknown'}</span>
						<span class="wallpaper-current-type">{wallpapers_config[preferences.wallpaper.id]?.type || ''} wallpaper</span>
					</div>
				</div>
			</div>

			<div class="setting-card">
				<div class="card-label">Dynamic Desktop</div>
				<div class="wallpaper-grid">
					{#each all_wallpapers.filter(([, w]) => w.type === 'dynamic') as [id, wp]}
						<button
							class="wallpaper-item"
							class:active={selected_wallpaper_id === id}
							onclick={() => change_wallpaper(id as WallpaperID)}
						>
							<img src={wp.thumbnail} alt={wp.name} />
							<span class="wallpaper-name">{wp.name}</span>
						</button>
					{/each}
				</div>
			</div>

			<div class="setting-card">
				<div class="card-label">Wallpapers</div>
				<div class="wallpaper-grid wide">
					{#each all_wallpapers.filter(([, w]) => w.type === 'standalone') as [id, wp]}
						<button
							class="wallpaper-item"
							class:active={selected_wallpaper_id === id}
							onclick={() => change_wallpaper(id as WallpaperID)}
						>
							<img src={wp.thumbnail} alt={wp.name} />
							<span class="wallpaper-name">{wp.name}</span>
						</button>
					{/each}
				</div>
			</div>

		{:else if selected_section === 'desktop-dock'}
			<h1 class="section-title">Desktop & Dock</h1>

			<div class="setting-card">
				<div class="card-label">Dock</div>
				<div class="setting-row">
					<span class="setting-row-label">Size</span>
					<div class="slider-container">
						<span class="slider-label-sm">Small</span>
						<input type="range" class="mac-slider" min="16" max="128" bind:value={dock_size} />
						<span class="slider-label-sm">Large</span>
					</div>
				</div>
				<div class="setting-divider"></div>
				<div class="setting-row">
					<span class="setting-row-label">Magnification</span>
					<button class="toggle" class:on={dock_magnification} onclick={() => dock_magnification = !dock_magnification}>
						<span class="toggle-knob"></span>
					</button>
				</div>
				<div class="setting-divider"></div>
				<div class="setting-row">
					<span class="setting-row-label">Position on screen</span>
					<div class="segmented-control">
						{#each ['Left', 'Bottom', 'Right'] as pos}
							<button
								class="segment"
								class:active={dock_position === pos}
								onclick={() => dock_position = pos as typeof dock_position}
							>{pos}</button>
						{/each}
					</div>
				</div>
				<div class="setting-divider"></div>
				<div class="setting-row">
					<span class="setting-row-label">Minimize windows using</span>
					<div class="select-wrapper">
						<select class="mac-select" bind:value={minimize_effect}>
							<option value="Genie">Genie Effect</option>
							<option value="Scale">Scale Effect</option>
						</select>
					</div>
				</div>
				<div class="setting-divider"></div>
				<div class="setting-row">
					<div class="setting-label-group">
						<span class="setting-row-label">Automatically hide and show the Dock</span>
						<span class="setting-row-desc">The Dock will disappear when not in use</span>
					</div>
					<button class="toggle" class:on={auto_hide_dock} onclick={() => auto_hide_dock = !auto_hide_dock}>
						<span class="toggle-knob"></span>
					</button>
				</div>
				<div class="setting-divider"></div>
				<div class="setting-row">
					<span class="setting-row-label">Show recent applications in Dock</span>
					<button class="toggle" class:on={show_recent_apps} onclick={() => show_recent_apps = !show_recent_apps}>
						<span class="toggle-knob"></span>
					</button>
				</div>
			</div>

			<div class="setting-card">
				<div class="card-label">Windows</div>
				<div class="setting-row">
					<span class="setting-row-label">Double-click a window's title bar to</span>
					<div class="select-wrapper">
						<select class="mac-select" bind:value={double_click_titlebar}>
							<option>Zoom</option>
							<option>Minimize</option>
							<option>Do Nothing</option>
						</select>
					</div>
				</div>
				<div class="setting-divider"></div>
				<div class="setting-row">
					<span class="setting-row-label">Minimize windows into application icon</span>
					<button class="toggle" class:on={minimize_into_icon} onclick={() => minimize_into_icon = !minimize_into_icon}>
						<span class="toggle-knob"></span>
					</button>
				</div>
			</div>

		{:else if selected_section === 'displays'}
			<h1 class="section-title">Displays</h1>

			<div class="setting-card">
				<div class="display-visual">
					<div class="display-frame">
						<div class="display-screen">
							<div class="display-inner-screen" style="filter: brightness({display_brightness / 100})">
								<div class="display-wallpaper-mini" style="background-image: url({preferences.wallpaper.image})"></div>
							</div>
						</div>
						<div class="display-chin"></div>
						<div class="display-stand"></div>
						<div class="display-base"></div>
					</div>
				</div>
				<div class="display-info-label">Built-in Liquid Retina XDR Display</div>
			</div>

			<div class="setting-card">
				<div class="setting-row">
					<span class="setting-row-label">Brightness</span>
					<div class="slider-container wide">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.4">
							<circle cx="12" cy="12" r="5"/>
						</svg>
						<input type="range" class="mac-slider" min="0" max="100" bind:value={display_brightness} />
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
							<circle cx="12" cy="12" r="5"/>
							<line x1="12" y1="1" x2="12" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							<line x1="12" y1="20" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							<line x1="1" y1="12" x2="4" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							<line x1="20" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							<line x1="4.2" y1="4.2" x2="6.3" y2="6.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							<line x1="17.7" y1="17.7" x2="19.8" y2="19.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							<line x1="4.2" y1="19.8" x2="6.3" y2="17.7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							<line x1="17.7" y1="6.3" x2="19.8" y2="4.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						</svg>
					</div>
				</div>
				<div class="setting-divider"></div>
				<div class="setting-row">
					<div class="setting-label-group">
						<span class="setting-row-label">True Tone</span>
						<span class="setting-row-desc">Automatically adapt display to ambient lighting conditions</span>
					</div>
					<button class="toggle" class:on={true_tone} onclick={() => true_tone = !true_tone}>
						<span class="toggle-knob"></span>
					</button>
				</div>
			</div>

			<div class="setting-card">
				<div class="card-label">Text Size</div>
				<div class="resolution-options">
					{#each [
						{ id: 'larger-text', label: 'Larger Text' },
						{ id: 'default', label: 'Default' },
						{ id: 'more-space', label: 'More Space' },
					] as res}
						<label class="resolution-option">
							<input type="radio" name="resolution" value={res.id} bind:group={selected_resolution} />
							<span class="resolution-box" class:selected={selected_resolution === res.id}>
								<span class="resolution-icon">
									{#if res.id === 'larger-text'}
										<span style="font-size: 16px; font-weight: 600;">Aa</span>
									{:else if res.id === 'default'}
										<span style="font-size: 13px; font-weight: 600;">Aa</span>
									{:else}
										<span style="font-size: 10px; font-weight: 600;">Aa</span>
									{/if}
								</span>
							</span>
							<span class="resolution-label">{res.label}</span>
						</label>
					{/each}
				</div>
			</div>

			<div class="setting-card">
				<div class="setting-row">
					<div class="setting-label-group">
						<span class="setting-row-label">Night Shift</span>
						<span class="setting-row-desc">Adjusts display to warmer colors after dark</span>
					</div>
					<button class="toggle" class:on={night_shift} onclick={() => night_shift = !night_shift}>
						<span class="toggle-knob"></span>
					</button>
				</div>
			</div>

		{:else if selected_section === 'sound'}
			<h1 class="section-title">Sound</h1>

			<div class="setting-card">
				<div class="card-label">Output</div>
				<div class="device-list">
					{#each output_devices as device}
						<button
							class="device-item"
							class:active={selected_output === device.name}
							onclick={() => selected_output = device.name}
						>
							<span class="device-icon-wrap">
								{#if device.type === 'Built-in'}
									<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
								{:else if device.type === 'Headphones'}
									<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/></svg>
								{:else}
									<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H18V3h-6z"/></svg>
								{/if}
							</span>
							<span class="device-info">
								<span class="device-name">{device.name}</span>
								<span class="device-type">{device.type}</span>
							</span>
							{#if selected_output === device.name}
								<svg class="check-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
									<path d="M2 7L5.5 10.5L12 3.5" stroke="var(--system-color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<div class="setting-card">
				<div class="setting-row">
					<span class="setting-row-label">Output volume</span>
					<div class="slider-container wide">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.4">
							<path d="M3 9v6h4l5 5V4L7 9H3z"/>
						</svg>
						<input type="range" class="mac-slider" min="0" max="100" bind:value={output_volume} />
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
							<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
						</svg>
					</div>
				</div>
			</div>

			<div class="setting-card">
				<div class="card-label">Input</div>
				<div class="setting-row">
					<span class="setting-row-label">Input volume</span>
					<div class="slider-container wide">
						<input type="range" class="mac-slider" min="0" max="100" bind:value={input_volume} />
					</div>
				</div>
				<div class="input-level">
					<span class="setting-row-label-sm">Input level</span>
					<div class="level-meter">
						<div class="level-fill" style="width: {input_volume * 0.6}%"></div>
					</div>
				</div>
			</div>

			<div class="setting-card">
				<div class="card-label">Sound Effects</div>
				<div class="setting-row">
					<span class="setting-row-label">Alert sound</span>
					<div class="select-wrapper">
						<select class="mac-select" bind:value={selected_alert}>
							{#each alert_sounds as sound}
								<option value={sound}>{sound}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="setting-divider"></div>
				<div class="setting-row">
					<span class="setting-row-label">Alert volume</span>
					<div class="slider-container">
						<input type="range" class="mac-slider" min="0" max="100" bind:value={alert_volume} />
					</div>
				</div>
				<div class="setting-divider"></div>
				<div class="setting-row">
					<div class="setting-label-group">
						<span class="setting-row-label">Play sound on startup</span>
					</div>
					<button class="toggle" class:on={play_feedback} onclick={() => play_feedback = !play_feedback}>
						<span class="toggle-knob"></span>
					</button>
				</div>
				<div class="setting-divider"></div>
				<div class="setting-row">
					<div class="setting-label-group">
						<span class="setting-row-label">Play user interface sound effects</span>
						<span class="setting-row-desc">Plays sounds for actions like moving items to the Trash</span>
					</div>
					<button class="toggle" class:on={play_ui_sounds} onclick={() => play_ui_sounds = !play_ui_sounds}>
						<span class="toggle-knob"></span>
					</button>
				</div>
			</div>

		{:else if selected_section === 'wi-fi'}
			<h1 class="section-title">Wi-Fi</h1>

			<div class="setting-card">
				<div class="setting-row">
					<span class="setting-row-label">Wi-Fi</span>
					<button class="toggle" class:on={wifi_enabled} onclick={() => wifi_enabled = !wifi_enabled}>
						<span class="toggle-knob"></span>
					</button>
				</div>
			</div>

			{#if wifi_enabled}
				<div class="setting-card">
					<div class="card-label">Known Networks</div>
					<div class="network-list">
						{#each networks.filter(n => n.connected) as network}
							<div class="network-item connected">
								<span class="network-icon">
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
										<path d="M1 5.5c4.14-4 9.86-4 14 0" stroke={network.signal >= 1 ? 'var(--system-color-primary)' : '#C7C7CC'} stroke-width="1.5" stroke-linecap="round" opacity={network.signal >= 3 ? 1 : 0.3}/>
										<path d="M3.5 8c2.76-2.67 6.24-2.67 9 0" stroke={network.signal >= 2 ? 'var(--system-color-primary)' : '#C7C7CC'} stroke-width="1.5" stroke-linecap="round" opacity={network.signal >= 2 ? 1 : 0.3}/>
										<path d="M6 10.5c1.38-1.33 3.62-1.33 5 0" stroke="var(--system-color-primary)" stroke-width="1.5" stroke-linecap="round"/>
										<circle cx="8.5" cy="13" r="1" fill="var(--system-color-primary)"/>
									</svg>
								</span>
								<span class="network-info">
									<span class="network-name">{network.name}</span>
									<span class="network-status">Connected</span>
								</span>
								{#if network.secured}
									<svg class="network-lock-icon" width="12" height="12" viewBox="0 0 24 24" fill="#86868b">
										<rect x="5" y="11" width="14" height="10" rx="2"/>
										<path d="M8 11V7c0-2.21 1.79-4 4-4s4 1.79 4 4v4" fill="none" stroke="#86868b" stroke-width="2"/>
									</svg>
								{/if}
							</div>
						{/each}
					</div>
				</div>

				<div class="setting-card">
					<div class="card-label">Other Networks</div>
					<div class="network-list">
						{#each networks.filter(n => !n.connected) as network}
							<button class="network-item" onclick={() => connect_wifi(network.name)}>
								<span class="network-icon">
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
										<path d="M1 5.5c4.14-4 9.86-4 14 0" stroke={network.signal >= 3 ? '#86868b' : '#C7C7CC'} stroke-width="1.5" stroke-linecap="round" opacity={network.signal >= 3 ? 1 : 0.3}/>
										<path d="M3.5 8c2.76-2.67 6.24-2.67 9 0" stroke={network.signal >= 2 ? '#86868b' : '#C7C7CC'} stroke-width="1.5" stroke-linecap="round" opacity={network.signal >= 2 ? 1 : 0.3}/>
										<path d="M6 10.5c1.38-1.33 3.62-1.33 5 0" stroke="#86868b" stroke-width="1.5" stroke-linecap="round"/>
										<circle cx="8.5" cy="13" r="1" fill="#86868b"/>
									</svg>
								</span>
								<span class="network-info">
									<span class="network-name">{network.name}</span>
								</span>
								{#if network.secured}
									<svg class="network-lock-icon" width="12" height="12" viewBox="0 0 24 24" fill="#C7C7CC">
										<rect x="5" y="11" width="14" height="10" rx="2"/>
										<path d="M8 11V7c0-2.21 1.79-4 4-4s4 1.79 4 4v4" fill="none" stroke="#C7C7CC" stroke-width="2"/>
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{:else}
				<div class="setting-card">
					<p class="wifi-off-message">Wi-Fi is turned off</p>
				</div>
			{/if}

		{:else if selected_section === 'apple-id'}
			<h1 class="section-title">Apple ID</h1>

			<div class="setting-card apple-id-card">
				<div class="apple-id-header">
					<div class="apple-id-avatar">
						<svg width="40" height="40" viewBox="0 0 24 24" fill="#C7C7CC">
							<circle cx="12" cy="8" r="4"/>
							<path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6"/>
						</svg>
					</div>
					<div class="apple-id-info">
						<span class="apple-id-name">User</span>
						<span class="apple-id-email">user@icloud.com</span>
					</div>
				</div>
			</div>

			<div class="setting-card">
				<div class="setting-row">
					<div class="setting-label-group">
						<span class="setting-row-label">iCloud</span>
						<span class="setting-row-desc">Manage iCloud storage and sync settings</span>
					</div>
					<svg class="chevron" width="7" height="12" viewBox="0 0 7 12" fill="none">
						<path d="M1 1l5 5-5 5" stroke="#C7C7CC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<div class="setting-divider"></div>
				<div class="setting-row">
					<div class="setting-label-group">
						<span class="setting-row-label">Media & Purchases</span>
						<span class="setting-row-desc">Manage subscriptions, purchases, and payment methods</span>
					</div>
					<svg class="chevron" width="7" height="12" viewBox="0 0 7 12" fill="none">
						<path d="M1 1l5 5-5 5" stroke="#C7C7CC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<div class="setting-divider"></div>
				<div class="setting-row">
					<div class="setting-label-group">
						<span class="setting-row-label">Sign-In & Security</span>
						<span class="setting-row-desc">Password, two-factor authentication, recovery</span>
					</div>
					<svg class="chevron" width="7" height="12" viewBox="0 0 7 12" fill="none">
						<path d="M1 1l5 5-5 5" stroke="#C7C7CC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
			</div>

		{:else}
			<!-- Generic placeholder for unimplemented sections -->
			<h1 class="section-title">{sections.find(s => s.id === selected_section)?.name || ''}</h1>
			<div class="setting-card">
				<div class="placeholder-content">
					<svg class="placeholder-svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.25">
						{@html get_icon_svg(sections.find(s => s.id === selected_section)?.icon || 'gear')}
					</svg>
					<p class="placeholder-text">Settings for {sections.find(s => s.id === selected_section)?.name || 'this section'} would appear here.</p>
				</div>
			</div>
		{/if}

		</div>
		{/key}
	</main>
</section>

<style>
	/* ===== Container ===== */
	.container {
		height: 100%;
		width: 100%;
		border-radius: inherit;
		display: flex;
		overflow: hidden;
		font-family: var(--system-font-family);
		color: var(--system-color-light-contrast);
		font-size: 13px;
		background-color: #f2f2f7;

		:global(body.dark) & {
			background-color: #1c1c1e;
		}
	}

	/* ===== Fade in transition for panel switching ===== */
	.fade-in {
		animation: fadeIn 0.15s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(4px); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* ===== Sidebar ===== */
	.sidebar {
		width: 240px;
		min-width: 240px;
		background: rgba(245, 245, 247, 0.92);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-right: 0.5px solid rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		overflow: hidden;

		:global(body.dark) & {
			background: rgba(44, 44, 46, 0.92);
			border-right-color: rgba(255, 255, 255, 0.1);
		}
	}

	.sidebar-search {
		padding: 52px 12px 6px;
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 20px;
		color: #86868b;
		pointer-events: none;
	}

	.sidebar-search input {
		width: 100%;
		padding: 5px 8px 5px 26px;
		border: none;
		border-radius: 6px;
		background: rgba(0, 0, 0, 0.06);
		font-size: 12px;
		color: var(--system-color-light-contrast);
		outline: none;
		font-family: inherit;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.1);
		}

		&::placeholder {
			color: #86868b;
		}

		&:focus {
			box-shadow: 0 0 0 2.5px hsla(var(--system-color-primary-hsl), 0.4);
		}
	}

	.sidebar-nav {
		flex: 1;
		overflow-y: auto;
		padding: 4px 8px 12px;

		&::-webkit-scrollbar {
			width: 6px;
		}
		&::-webkit-scrollbar-thumb {
			background: rgba(0, 0, 0, 0.12);
			border-radius: 3px;
		}
	}

	.sidebar-group {
		/* no bottom border -- macOS Sonoma uses spacing not lines */
	}

	.sidebar-gap {
		height: 12px;
	}

	.sidebar-item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 4px 8px;
		border: none;
		background: none;
		border-radius: 6px;
		cursor: pointer;
		text-align: left;
		color: var(--system-color-light-contrast);
		font-size: 13px;
		height: 32px;
		transition: background 0.1s;

		&:hover {
			background: rgba(0, 0, 0, 0.04);
			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.06);
			}
		}

		&.active {
			background: var(--system-color-primary);
			color: white;

			& .sidebar-icon {
				background: rgba(255, 255, 255, 0.25) !important;
			}

			& .sidebar-icon svg {
				fill: white;
			}
		}
	}

	.sidebar-icon {
		width: 22px;
		height: 22px;
		border-radius: 5px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;

		& svg {
			fill: white;
		}
	}

	.sidebar-label {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-weight: 400;
		line-height: 1;
	}

	/* ===== Content pane ===== */
	.content-pane {
		flex: 1;
		overflow-y: auto;
		background: #f2f2f7;

		:global(body.dark) & {
			background: #2c2c2e;
		}

		&::-webkit-scrollbar {
			width: 8px;
		}
		&::-webkit-scrollbar-thumb {
			background: rgba(0, 0, 0, 0.12);
			border-radius: 4px;
			border: 2px solid transparent;
			background-clip: content-box;
		}
	}

	.section-content {
		padding: 52px 24px 24px;
		max-width: 620px;
	}

	.section-title {
		font-size: 22px;
		font-weight: 700;
		margin: 0 0 16px;
		letter-spacing: -0.3px;
	}

	/* ===== Setting cards ===== */
	.setting-card {
		background: white;
		border-radius: 10px;
		padding: 0;
		margin-bottom: 16px;
		box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.04), 0 0.5px 1.5px rgba(0, 0, 0, 0.06);

		:global(body.dark) & {
			background: #3a3a3c;
			box-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.05);
		}
	}

	.setting-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 16px;
		min-height: 44px;
		gap: 12px;
	}

	.setting-row-label {
		font-size: 13px;
		font-weight: 400;
		flex-shrink: 0;
	}

	.setting-row-value {
		font-size: 13px;
		color: #86868b;
	}

	.setting-label-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
		min-width: 0;
	}

	.setting-row-desc {
		font-size: 11px;
		color: #86868b;
		line-height: 1.35;
	}

	.setting-divider {
		height: 0.5px;
		background: rgba(0, 0, 0, 0.08);
		margin-left: 16px;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.08);
		}
	}

	.card-label {
		font-size: 13px;
		font-weight: 600;
		color: #86868b;
		padding: 12px 16px 4px;
	}

	.chevron {
		flex-shrink: 0;
	}

	/* ===== Toggle switch ===== */
	.toggle {
		width: 31px;
		height: 19px;
		border-radius: 9.5px;
		background: #d1d1d6;
		border: none;
		position: relative;
		cursor: pointer;
		transition: background 0.2s ease;
		flex-shrink: 0;

		:global(body.dark) & {
			background: #48484a;
		}

		&.on {
			background: #34c759;
		}
	}

	.toggle-knob {
		width: 15px;
		height: 15px;
		border-radius: 50%;
		background: white;
		position: absolute;
		top: 2px;
		left: 2px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15), 0 0 0 0.5px rgba(0, 0, 0, 0.04);
		transition: transform 0.2s ease;
		pointer-events: none;
	}

	.toggle.on .toggle-knob {
		transform: translateX(12px);
	}

	/* ===== Slider ===== */
	.slider-container {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		max-width: 260px;

		&.wide {
			max-width: 300px;
		}
	}

	.slider-label-sm {
		font-size: 11px;
		color: #86868b;
		white-space: nowrap;
	}

	.mac-slider {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 4px;
		border-radius: 2px;
		background: #d1d1d6;
		outline: none;

		:global(body.dark) & {
			background: #636366;
		}

		&::-webkit-slider-thumb {
			-webkit-appearance: none;
			appearance: none;
			width: 18px;
			height: 18px;
			border-radius: 50%;
			background: white;
			box-shadow: 0 0.5px 4px rgba(0, 0, 0, 0.15), 0 0 0 0.5px rgba(0, 0, 0, 0.06);
			cursor: pointer;
			transition: box-shadow 0.15s;
		}

		&::-webkit-slider-thumb:hover {
			box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 0 0 0.5px rgba(0, 0, 0, 0.08);
		}

		&:focus::-webkit-slider-thumb {
			box-shadow: 0 0.5px 4px rgba(0, 0, 0, 0.15), 0 0 0 0.5px rgba(0, 0, 0, 0.06), var(--system-focus-outline);
		}
	}

	/* ===== Segmented control ===== */
	.segmented-control {
		display: flex;
		background: rgba(0, 0, 0, 0.06);
		border-radius: 7px;
		padding: 2px;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.1);
		}
	}

	.segment {
		padding: 4px 16px;
		border: none;
		background: none;
		border-radius: 5px;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		color: var(--system-color-light-contrast);
		transition: all 0.15s;
		font-family: inherit;

		&.active {
			background: white;
			box-shadow: 0 0.5px 2px rgba(0, 0, 0, 0.12), 0 0 0 0.5px rgba(0, 0, 0, 0.04);
			font-weight: 500;

			:global(body.dark) & {
				background: #636366;
			}
		}

		&:not(.active):hover {
			background: rgba(0, 0, 0, 0.03);
			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.05);
			}
		}
	}

	/* ===== Select ===== */
	.select-wrapper {
		position: relative;
	}

	.mac-select {
		padding: 4px 24px 4px 10px;
		border: 0.5px solid rgba(0, 0, 0, 0.12);
		border-radius: 6px;
		background: white;
		font-size: 12px;
		color: var(--system-color-light-contrast);
		cursor: pointer;
		-webkit-appearance: none;
		appearance: none;
		font-family: inherit;
		background-image: url("data:image/svg+xml,%3Csvg width='8' height='5' viewBox='0 0 8 5' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L4 4L7 1' stroke='%2386868b' stroke-width='1.2' stroke-linecap='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 8px center;

		:global(body.dark) & {
			background-color: #48484a;
			border-color: rgba(255, 255, 255, 0.1);
		}

		&:focus {
			box-shadow: var(--system-focus-outline);
			outline: none;
		}
	}

	/* ===== Appearance section ===== */
	.appearance-modes {
		display: flex;
		gap: 16px;
		padding: 8px 16px 16px;
	}

	.appearance-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		border: none;
		background: none;
		cursor: pointer;
		padding: 0;
	}

	.appearance-preview {
		width: 160px;
		height: 100px;
		border-radius: 8px;
		background: #f5f5f7;
		border: 2.5px solid transparent;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		transition: border-color 0.15s;

		.appearance-option.active & {
			border-color: var(--system-color-primary);
		}

		.appearance-option:not(.active):hover & {
			border-color: rgba(0, 0, 0, 0.15);
		}
	}

	.appearance-preview.dark-preview {
		background: #1c1c1e;

		.preview-titlebar { background: #3a3a3c; }
		.preview-sidebar { background: #2c2c2e; }
		.preview-content { background: #1c1c1e; }
		.preview-line { background: #48484a; }
	}

	.appearance-preview.auto-preview {
		background: linear-gradient(135deg, #f5f5f7 50%, #1c1c1e 50%);

		.preview-titlebar { background: linear-gradient(90deg, #e8e8ed 50%, #3a3a3c 50%); }
		.preview-sidebar { background: linear-gradient(180deg, #ececf0 50%, #2c2c2e 50%); }
		.preview-content { background: transparent; }
		.preview-line { background: linear-gradient(90deg, #d1d1d6 50%, #48484a 50%); }
	}

	.preview-titlebar {
		height: 14px;
		background: #e8e8ed;
		display: flex;
		align-items: center;
		padding: 0 6px;
		flex-shrink: 0;
	}

	.preview-dots {
		display: flex;
		gap: 3px;
	}

	.preview-dots .dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
	}
	.dot.red { background: #ff5f57; }
	.dot.yellow { background: #fdbc40; }
	.dot.green { background: #33c748; }

	.preview-body {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	.preview-sidebar {
		width: 36px;
		background: #ececf0;
		flex-shrink: 0;
	}

	.preview-content {
		flex: 1;
		padding: 10px;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.preview-line {
		height: 4px;
		background: #d1d1d6;
		border-radius: 2px;
	}
	.preview-line.short {
		width: 60%;
	}

	.appearance-label {
		font-size: 12px;
		color: var(--system-color-light-contrast);
	}

	.appearance-option.active .appearance-label {
		color: var(--system-color-primary);
		font-weight: 500;
	}

	/* ===== Accent colors ===== */
	.accent-colors {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.accent-swatch {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.1s;
		box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.15);
		padding: 0;

		&:hover {
			transform: scale(1.15);
		}

		&.active {
			box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.15), 0 0 0 2px white, 0 0 0 3.5px rgba(0, 0, 0, 0.2);

			:global(body.dark) & {
				box-shadow: inset 0 0 0 0.5px rgba(255, 255, 255, 0.15), 0 0 0 2px #3a3a3c, 0 0 0 3.5px rgba(255, 255, 255, 0.3);
			}
		}
	}

	/* ===== Radio group (macOS-style) ===== */
	.radio-group-header {
		font-size: 13px;
		font-weight: 600;
		color: #86868b;
		padding: 12px 16px 4px;
	}

	.radio-group-options {
		padding: 4px 16px 12px;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.radio-option {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 0;
		cursor: pointer;
		user-select: none;
	}

	.radio-circle {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 1.5px solid #c7c7cc;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		background: white;
		transition: border-color 0.15s;

		:global(body.dark) & {
			border-color: #636366;
			background: #2c2c2e;
		}

		&.selected {
			border-color: var(--system-color-primary);
			background: var(--system-color-primary);
		}
	}

	.radio-circle-inner {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: white;
	}

	.radio-label {
		font-size: 13px;
		color: var(--system-color-light-contrast);
	}

	/* ===== Wallpaper section ===== */
	.wallpaper-card {
		padding: 16px;
	}

	.current-wallpaper-preview {
		display: flex;
		gap: 16px;
		align-items: center;
	}

	.wallpaper-thumb-large {
		width: 160px;
		height: 100px;
		border-radius: 8px;
		background-size: cover;
		background-position: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		flex-shrink: 0;
	}

	.current-wallpaper-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.wallpaper-current-name {
		font-size: 15px;
		font-weight: 600;
	}

	.wallpaper-current-type {
		font-size: 12px;
		color: #86868b;
		text-transform: capitalize;
	}

	.wallpaper-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
		gap: 10px;
		padding: 8px 16px 16px;

		&.wide {
			grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
		}
	}

	.wallpaper-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		border: none;
		background: none;
		cursor: pointer;
		padding: 4px;
		border-radius: 8px;

		&:hover img {
			box-shadow: 0 0 0 2px hsla(var(--system-color-primary-hsl), 0.4);
		}

		&.active img {
			box-shadow: 0 0 0 3px var(--system-color-primary);
		}

		img {
			width: 100%;
			aspect-ratio: 16 / 10;
			object-fit: cover;
			border-radius: 6px;
			transition: box-shadow 0.15s;
		}
	}

	.wallpaper-name {
		font-size: 10px;
		color: var(--system-color-light-contrast);
		text-align: center;
		line-height: 1.2;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* ===== Display section ===== */
	.display-visual {
		display: flex;
		justify-content: center;
		padding: 24px 16px 8px;
	}

	.display-frame {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.display-screen {
		width: 200px;
		height: 125px;
		background: #1a1a1a;
		border-radius: 10px;
		border: 2px solid #48484a;
		overflow: hidden;
		position: relative;
	}

	.display-inner-screen {
		width: 100%;
		height: 100%;
		transition: filter 0.3s;
	}

	.display-wallpaper-mini {
		width: 100%;
		height: 100%;
		background-size: cover;
		background-position: center;
	}

	.display-chin {
		width: 200px;
		height: 3px;
		background: #48484a;
		border-radius: 0 0 2px 2px;
	}

	.display-stand {
		width: 36px;
		height: 18px;
		background: linear-gradient(to bottom, #c8c8cc, #aaa);
		clip-path: polygon(18% 0%, 82% 0%, 100% 100%, 0% 100%);
	}

	.display-base {
		width: 72px;
		height: 5px;
		background: linear-gradient(to bottom, #b8b8bc, #a0a0a4);
		border-radius: 0 0 3px 3px;
	}

	.display-info-label {
		text-align: center;
		font-size: 12px;
		color: #86868b;
		padding: 8px 16px 16px;
	}

	.resolution-options {
		display: flex;
		gap: 12px;
		padding: 8px 16px 16px;
		justify-content: center;
	}

	.resolution-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		cursor: pointer;

		input[type="radio"] {
			display: none;
		}
	}

	.resolution-box {
		width: 56px;
		height: 40px;
		border-radius: 6px;
		background: #e8e8ed;
		border: 2.5px solid transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: border-color 0.15s;

		:global(body.dark) & {
			background: #48484a;
		}

		&.selected {
			border-color: var(--system-color-primary);
		}
	}

	.resolution-icon {
		color: var(--system-color-light-contrast);
	}

	.resolution-label {
		font-size: 11px;
		color: var(--system-color-light-contrast);
	}

	/* ===== Sound section ===== */
	.device-list {
		padding: 4px 0;
	}

	.device-item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 8px 16px;
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		color: var(--system-color-light-contrast);
		font-family: inherit;

		&:hover {
			background: rgba(0, 0, 0, 0.03);
			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.04);
			}
		}

		&.active {
			background: rgba(0, 122, 255, 0.06);
		}
	}

	.device-icon-wrap {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #86868b;
	}

	.device-info {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.device-name {
		font-size: 13px;
		font-weight: 500;
	}

	.device-type {
		font-size: 11px;
		color: #86868b;
	}

	.check-icon {
		flex-shrink: 0;
	}

	.input-level {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px 12px;
	}

	.setting-row-label-sm {
		font-size: 11px;
		color: #86868b;
		white-space: nowrap;
	}

	.level-meter {
		flex: 1;
		height: 4px;
		background: #d1d1d6;
		border-radius: 2px;
		overflow: hidden;

		:global(body.dark) & {
			background: #48484a;
		}
	}

	.level-fill {
		height: 100%;
		background: #34c759;
		border-radius: 2px;
		transition: width 0.3s;
	}

	/* ===== Wi-Fi section ===== */
	.network-list {
		padding: 4px 0;
	}

	.network-item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 8px 16px;
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		color: var(--system-color-light-contrast);
		font-family: inherit;

		&:hover {
			background: rgba(0, 0, 0, 0.03);
			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.04);
			}
		}

		&.connected {
			cursor: default;
		}
	}

	.network-icon {
		width: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.network-lock-icon {
		flex-shrink: 0;
		opacity: 0.5;
	}

	.network-info {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.network-name {
		font-size: 13px;
		font-weight: 500;
	}

	.network-status {
		font-size: 11px;
		color: #34c759;
		font-weight: 500;
	}

	.wifi-off-message {
		padding: 32px 16px;
		text-align: center;
		color: #86868b;
		font-size: 14px;
	}

	/* ===== General / About section (compact header) ===== */
	.about-header-compact {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
	}

	.about-mac-icon-compact {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #86868b;
		flex-shrink: 0;
	}

	.about-mac-info-compact {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.about-mac-name-compact {
		font-size: 15px;
		font-weight: 600;
		letter-spacing: -0.1px;
	}

	.about-mac-model-compact {
		font-size: 12px;
		color: #86868b;
	}

	/* ===== General navigation rows ===== */
	.general-nav-row {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 10px 16px;
		min-height: 44px;
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		color: var(--system-color-light-contrast);
		font-family: inherit;
		font-size: 13px;
		transition: background 0.1s;

		&:hover {
			background: rgba(0, 0, 0, 0.03);
			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.04);
			}
		}

		&:active {
			background: rgba(0, 0, 0, 0.06);
			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.08);
			}
		}
	}

	.general-nav-icon {
		width: 28px;
		height: 28px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.general-nav-label {
		flex: 1;
		font-weight: 400;
	}

	/* ===== Apple ID section ===== */
	.apple-id-card {
		overflow: hidden;
	}

	.apple-id-header {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 16px;
	}

	.apple-id-avatar {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: #e8e8ed;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;

		:global(body.dark) & {
			background: #48484a;
		}
	}

	.apple-id-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.apple-id-name {
		font-size: 18px;
		font-weight: 600;
	}

	.apple-id-email {
		font-size: 12px;
		color: #86868b;
	}

	/* ===== Placeholder section ===== */
	.placeholder-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40px 16px;
		gap: 12px;
	}

	.placeholder-svg {
		color: var(--system-color-light-contrast);
	}

	.placeholder-text {
		font-size: 14px;
		color: #86868b;
		text-align: center;
		margin: 0;
	}
</style>
