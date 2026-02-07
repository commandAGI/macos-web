<script lang="ts">
	import { wallpapers_config, type WallpaperID } from '🍎/configs/wallpapers/wallpaper.config.ts';
	import { colors } from '🍎/configs/theme/colors.config.ts';
	import { preferences } from '🍎/state/preferences.svelte.ts';

	// --- Sidebar sections ---
	type Section = { id: string; name: string; icon: string; group?: string };

	const sections: Section[] = [
		{ id: 'apple-id', name: 'Apple ID', icon: 'person-circle', group: 'top' },
		{ id: 'wi-fi', name: 'Wi-Fi', icon: 'wifi', group: 'connectivity' },
		{ id: 'bluetooth', name: 'Bluetooth', icon: 'bluetooth', group: 'connectivity' },
		{ id: 'network', name: 'Network', icon: 'globe', group: 'connectivity' },
		{ id: 'notifications', name: 'Notifications', icon: 'bell', group: 'alerts' },
		{ id: 'sound', name: 'Sound', icon: 'speaker-wave', group: 'alerts' },
		{ id: 'focus', name: 'Focus', icon: 'moon', group: 'alerts' },
		{ id: 'screen-time', name: 'Screen Time', icon: 'hourglass', group: 'alerts' },
		{ id: 'general', name: 'General', icon: 'gear', group: 'main' },
		{ id: 'appearance', name: 'Appearance', icon: 'paintbrush', group: 'main' },
		{ id: 'accessibility', name: 'Accessibility', icon: 'accessibility', group: 'main' },
		{ id: 'control-center', name: 'Control Center', icon: 'sliders', group: 'main' },
		{ id: 'siri', name: 'Siri & Spotlight', icon: 'sparkles', group: 'main' },
		{ id: 'privacy', name: 'Privacy & Security', icon: 'hand-raised', group: 'main' },
		{ id: 'desktop-dock', name: 'Desktop & Dock', icon: 'dock', group: 'display' },
		{ id: 'displays', name: 'Displays', icon: 'display', group: 'display' },
		{ id: 'wallpaper', name: 'Wallpaper', icon: 'photo', group: 'display' },
		{ id: 'screen-saver', name: 'Screen Saver', icon: 'sparkle', group: 'display' },
		{ id: 'battery', name: 'Battery', icon: 'battery-100', group: 'system' },
		{ id: 'lock-screen', name: 'Lock Screen', icon: 'lock', group: 'system' },
		{ id: 'users', name: 'Users & Groups', icon: 'person-2', group: 'system' },
		{ id: 'keyboard', name: 'Keyboard', icon: 'keyboard', group: 'input' },
		{ id: 'trackpad', name: 'Trackpad', icon: 'hand-draw', group: 'input' },
		{ id: 'mouse', name: 'Mouse', icon: 'computermouse', group: 'input' },
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

	// Group filtered sections
	const grouped_sections = $derived(() => {
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

	// --- SF Symbols-style icons (inline SVG paths for each icon) ---
	function get_icon_bg(id: string): string {
		const map: Record<string, string> = {
			'apple-id': '#007AFF',
			'wi-fi': '#007AFF',
			bluetooth: '#007AFF',
			network: '#007AFF',
			notifications: '#FF3B30',
			sound: '#FF2D55',
			focus: '#5856D6',
			'screen-time': '#5856D6',
			general: '#8E8E93',
			appearance: '#007AFF',
			accessibility: '#007AFF',
			'control-center': '#8E8E93',
			siri: '#BF5AF2',
			privacy: '#007AFF',
			'desktop-dock': '#007AFF',
			displays: '#007AFF',
			wallpaper: '#34C759',
			'screen-saver': '#FF9500',
			battery: '#34C759',
			'lock-screen': '#8E8E93',
			users: '#8E8E93',
			keyboard: '#8E8E93',
			trackpad: '#8E8E93',
			mouse: '#8E8E93',
		};
		return map[id] || '#8E8E93';
	}

	function get_icon_symbol(id: string): string {
		const map: Record<string, string> = {
			'apple-id': '\uD83D\uDC64',
			'wi-fi': '\uD83D\uDCF6',
			bluetooth: '\uD83D\uDD35',
			network: '\uD83C\uDF10',
			notifications: '\uD83D\uDD14',
			sound: '\uD83D\uDD0A',
			focus: '\uD83C\uDF19',
			'screen-time': '\u23F3',
			general: '\u2699\uFE0F',
			appearance: '\uD83C\uDFA8',
			accessibility: '\u267F',
			'control-center': '\uD83C\uDF9B\uFE0F',
			siri: '\u2728',
			privacy: '\uD83E\uDD1A',
			'desktop-dock': '\uD83D\uDDA5\uFE0F',
			displays: '\uD83D\uDCBB',
			wallpaper: '\uD83D\uDDBC\uFE0F',
			'screen-saver': '\u2728',
			battery: '\uD83D\uDD0B',
			'lock-screen': '\uD83D\uDD12',
			users: '\uD83D\uDC65',
			keyboard: '\u2328\uFE0F',
			trackpad: '\uD83D\uDD90\uFE0F',
			mouse: '\uD83D\uDDB1\uFE0F',
		};
		return map[id] || '\u2699\uFE0F';
	}

	// --- Appearance section state ---
	const appearance_modes = ['Light', 'Dark', 'Auto'] as const;
	let selected_appearance = $derived(
		preferences.theme.scheme === 'light' ? 'Light' : 'Dark'
	);

	function set_appearance(mode: string) {
		if (mode === 'Light') preferences.theme.scheme = 'light';
		else if (mode === 'Dark') preferences.theme.scheme = 'dark';
		else preferences.theme.scheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	const accent_colors = [
		{ name: 'Multicolor', color: 'linear-gradient(135deg, #FF2D55, #FF9500, #FFCC00, #34C759, #007AFF, #5856D6)', value: 'blue' },
		{ name: 'Blue', color: '#007AFF', value: 'blue' },
		{ name: 'Purple', color: '#5856D6', value: 'purple' },
		{ name: 'Pink', color: '#FF2D55', value: 'pink' },
		{ name: 'Red', color: '#FF3B30', value: 'pink' },
		{ name: 'Orange', color: '#FF9500', value: 'orange' },
		{ name: 'Yellow', color: '#FFCC00', value: 'orange' },
		{ name: 'Green', color: '#34C759', value: 'green' },
		{ name: 'Graphite', color: '#8E8E93', value: 'cyan' },
	];

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

	function get_signal_bars(signal: number): string {
		if (signal >= 3) return '\u2581\u2583\u2585\u2587';
		if (signal === 2) return '\u2581\u2583\u2585\u2007';
		return '\u2581\u2583\u2007\u2007';
	}
</script>

<section class="container">
	<!-- Sidebar -->
	<aside class="sidebar app-window-drag-handle">
		<div class="sidebar-search">
			<svg class="search-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
				<circle cx="5" cy="5" r="4" stroke="currentColor" stroke-width="1.2"/>
				<line x1="8" y1="8" x2="11" y2="11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
			</svg>
			<input
				type="text"
				bind:value={search_query}
				placeholder="Search"
			/>
		</div>

		<nav class="sidebar-nav">
			{#each grouped_sections() as group}
				<div class="sidebar-group">
					{#each group.items as section}
						<button
							class="sidebar-item"
							class:active={selected_section === section.id}
							onclick={() => selected_section = section.id}
						>
							<span class="sidebar-icon" style="background: {get_icon_bg(section.id)}">
								<span class="icon-emoji">{get_icon_symbol(section.id)}</span>
							</span>
							<span class="sidebar-label">{section.name}</span>
						</button>
					{/each}
				</div>
			{/each}
		</nav>
	</aside>

	<!-- Content pane -->
	<main class="content-pane">
		{#if selected_section === 'appearance'}
			<div class="section-content">
				<h1 class="section-title">Appearance</h1>

				<!-- Appearance mode -->
				<div class="setting-card">
					<div class="setting-row-label">Appearance</div>
					<div class="appearance-modes">
						{#each appearance_modes as mode}
							<button
								class="appearance-option"
								class:active={selected_appearance === mode || (mode === 'Auto' && false)}
								onclick={() => set_appearance(mode)}
							>
								<div class="appearance-preview" class:dark-preview={mode === 'Dark'} class:auto-preview={mode === 'Auto'}>
									<div class="preview-titlebar">
										<div class="preview-dots">
											<span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
										</div>
									</div>
									<div class="preview-sidebar"></div>
									<div class="preview-content">
										<div class="preview-line"></div>
										<div class="preview-line short"></div>
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
							{#each accent_colors as ac}
								<button
									class="accent-swatch"
									class:active={preferences.theme.primaryColor === ac.value && ac.name !== 'Multicolor'}
									style="background: {ac.color};"
									title={ac.name}
									onclick={() => {
										if (ac.value in colors) {
											preferences.theme.primaryColor = ac.value as keyof typeof colors;
										}
									}}
								>
									{#if preferences.theme.primaryColor === ac.value && (ac.name === 'Blue' || (ac.name !== 'Multicolor' && accent_colors.findIndex(a => a.value === ac.value && a.name !== 'Multicolor') === accent_colors.indexOf(ac)))}
										<svg width="10" height="8" viewBox="0 0 10 8" fill="none">
											<path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
										</svg>
									{/if}
								</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Highlight color -->
				<div class="setting-card">
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
						<span class="setting-row-label">Allow wallpaper tinting in windows</span>
						<button class="toggle on" onclick={(e) => {
							const el = e.currentTarget as HTMLElement;
							el.classList.toggle('on');
						}}>
							<span class="toggle-knob"></span>
						</button>
					</div>
				</div>
			</div>

		{:else if selected_section === 'wallpaper'}
			<div class="section-content">
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
					<div class="setting-section-header">Dynamic Wallpapers</div>
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
					<div class="setting-section-header">Wallpapers</div>
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
			</div>

		{:else if selected_section === 'desktop-dock'}
			<div class="section-content">
				<h1 class="section-title">Desktop & Dock</h1>

				<div class="setting-card">
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
						<span class="setting-row-label">Automatically hide and show the Dock</span>
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
					<div class="setting-section-header">Windows</div>
					<div class="setting-row">
						<span class="setting-row-label">Double-click a window's title bar to</span>
						<div class="select-wrapper">
							<select class="mac-select">
								<option>Zoom</option>
								<option>Minimize</option>
								<option>Do Nothing</option>
							</select>
						</div>
					</div>
					<div class="setting-divider"></div>
					<div class="setting-row">
						<span class="setting-row-label">Minimize windows into application icon</span>
						<button class="toggle" onclick={(e) => (e.currentTarget as HTMLElement).classList.toggle('on')}>
							<span class="toggle-knob"></span>
						</button>
					</div>
				</div>
			</div>

		{:else if selected_section === 'displays'}
			<div class="section-content">
				<h1 class="section-title">Displays</h1>

				<div class="setting-card">
					<div class="display-visual">
						<div class="display-frame">
							<div class="display-screen">
								<span class="display-res-label">Built-in Display</span>
							</div>
							<div class="display-stand"></div>
							<div class="display-base"></div>
						</div>
					</div>
				</div>

				<div class="setting-card">
					<div class="setting-row">
						<span class="setting-row-label">Brightness</span>
						<div class="slider-container wide">
							<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" opacity="0.5">
								<circle cx="7" cy="7" r="3"/>
							</svg>
							<input type="range" class="mac-slider" min="0" max="100" bind:value={display_brightness} />
							<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" opacity="0.8">
								<circle cx="8" cy="8" r="3.5"/>
								<line x1="8" y1="1" x2="8" y2="3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
								<line x1="8" y1="13" x2="8" y2="15" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
								<line x1="1" y1="8" x2="3" y2="8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
								<line x1="13" y1="8" x2="15" y2="8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
							</svg>
						</div>
					</div>
					<div class="setting-divider"></div>
					<div class="setting-row">
						<span class="setting-row-label">True Tone</span>
						<button class="toggle" class:on={true_tone} onclick={() => true_tone = !true_tone}>
							<span class="toggle-knob"></span>
						</button>
					</div>
				</div>

				<div class="setting-card">
					<div class="setting-section-header">Resolution</div>
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
						<span class="setting-row-label">Night Shift</span>
						<button class="toggle" class:on={night_shift} onclick={() => night_shift = !night_shift}>
							<span class="toggle-knob"></span>
						</button>
					</div>
					<p class="setting-description">Night Shift adjusts the display to use warmer colors after dark.</p>
				</div>
			</div>

		{:else if selected_section === 'sound'}
			<div class="section-content">
				<h1 class="section-title">Sound</h1>

				<div class="setting-card">
					<div class="setting-section-header">Output</div>
					<div class="device-list">
						{#each output_devices as device}
							<button
								class="device-item"
								class:active={selected_output === device.name}
								onclick={() => selected_output = device.name}
							>
								<span class="device-icon">
									{#if device.type === 'Built-in'}🔊{:else if device.type === 'Headphones'}🎧{:else}🎵{/if}
								</span>
								<span class="device-info">
									<span class="device-name">{device.name}</span>
									<span class="device-type">{device.type}</span>
								</span>
								{#if selected_output === device.name}
									<svg class="check-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
										<path d="M2 7L5.5 10.5L12 3.5" stroke="#007AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
							<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" opacity="0.5">
								<path d="M2 5h2l3-3v10L4 9H2a1 1 0 01-1-1V6a1 1 0 011-1z"/>
							</svg>
							<input type="range" class="mac-slider" min="0" max="100" bind:value={output_volume} />
							<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" opacity="0.8">
								<path d="M2 5.5h2l3-3v11l-3-3H2a1 1 0 01-1-1v-3a1 1 0 011-1z"/>
								<path d="M10 4c1.5 1 2.5 2.5 2.5 4s-1 3-2.5 4" stroke="currentColor" fill="none" stroke-width="1.2" stroke-linecap="round"/>
								<path d="M11.5 2c2 1.5 3.5 3.5 3.5 6s-1.5 4.5-3.5 6" stroke="currentColor" fill="none" stroke-width="1.2" stroke-linecap="round"/>
							</svg>
						</div>
					</div>
				</div>

				<div class="setting-card">
					<div class="setting-section-header">Input</div>
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
					<div class="setting-section-header">Sound Effects</div>
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
						<span class="setting-row-label">Play sound on startup</span>
						<button class="toggle" class:on={play_feedback} onclick={() => play_feedback = !play_feedback}>
							<span class="toggle-knob"></span>
						</button>
					</div>
				</div>
			</div>

		{:else if selected_section === 'wi-fi'}
			<div class="section-content">
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
						<div class="setting-section-header">Known Networks</div>
						<div class="network-list">
							{#each networks.filter(n => n.connected) as network}
								<div class="network-item connected">
									<span class="network-icon">
										<span class="signal-bars">{get_signal_bars(network.signal)}</span>
									</span>
									<span class="network-info">
										<span class="network-name">{network.name}</span>
										<span class="network-status">Connected</span>
									</span>
									{#if network.secured}
										<span class="network-lock">🔒</span>
									{/if}
								</div>
							{/each}
						</div>
					</div>

					<div class="setting-card">
						<div class="setting-section-header">Other Networks</div>
						<div class="network-list">
							{#each networks.filter(n => !n.connected) as network}
								<button class="network-item" onclick={() => connect_wifi(network.name)}>
									<span class="network-icon">
										<span class="signal-bars">{get_signal_bars(network.signal)}</span>
									</span>
									<span class="network-info">
										<span class="network-name">{network.name}</span>
									</span>
									{#if network.secured}
										<span class="network-lock">🔒</span>
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
			</div>

		{:else}
			<!-- Generic placeholder for unimplemented sections -->
			<div class="section-content">
				<h1 class="section-title">{sections.find(s => s.id === selected_section)?.name || ''}</h1>
				<div class="setting-card">
					<div class="placeholder-content">
						<span class="placeholder-icon">{get_icon_symbol(selected_section)}</span>
						<p class="placeholder-text">Settings for {sections.find(s => s.id === selected_section)?.name || 'this section'} would appear here.</p>
					</div>
				</div>
			</div>
		{/if}
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

	/* ===== Sidebar ===== */
	.sidebar {
		width: 240px;
		min-width: 240px;
		background: rgba(245, 245, 247, 0.85);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-right: 1px solid rgba(0, 0, 0, 0.12);
		display: flex;
		flex-direction: column;
		overflow: hidden;

		:global(body.dark) & {
			background: rgba(44, 44, 46, 0.85);
			border-right-color: rgba(255, 255, 255, 0.08);
		}
	}

	.sidebar-search {
		padding: 52px 12px 8px;
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

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.08);
		}

		&::placeholder {
			color: #86868b;
		}

		&:focus {
			box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.4);
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
			background: rgba(0, 0, 0, 0.15);
			border-radius: 3px;
		}
	}

	.sidebar-group {
		margin-bottom: 2px;
		padding-bottom: 2px;

		&:not(:last-child) {
			border-bottom: 1px solid rgba(0, 0, 0, 0.06);
			margin-bottom: 4px;
			padding-bottom: 4px;

			:global(body.dark) & {
				border-bottom-color: rgba(255, 255, 255, 0.06);
			}
		}
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

		&:hover {
			background: rgba(0, 0, 0, 0.04);
			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.06);
			}
		}

		&.active {
			background: var(--system-color-primary);
			color: white;
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
	}

	.icon-emoji {
		font-size: 12px;
		filter: brightness(0) invert(1);
	}

	.sidebar-label {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-weight: 400;
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
			background: rgba(0, 0, 0, 0.15);
			border-radius: 4px;
			border: 2px solid transparent;
			background-clip: content-box;
		}
	}

	.section-content {
		padding: 52px 24px 24px;
		max-width: 600px;
	}

	.section-title {
		font-size: 22px;
		font-weight: 700;
		margin: 0 0 16px;
		letter-spacing: -0.2px;
	}

	/* ===== Setting cards ===== */
	.setting-card {
		background: white;
		border-radius: 10px;
		padding: 0;
		margin-bottom: 16px;
		box-shadow: 0 0.5px 1px rgba(0, 0, 0, 0.04);

		:global(body.dark) & {
			background: #3a3a3c;
		}
	}

	.setting-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 16px;
		min-height: 40px;
		gap: 12px;
	}

	.setting-row-label {
		font-size: 13px;
		font-weight: 400;
		padding: 10px 16px;
		flex-shrink: 0;
	}

	.setting-row .setting-row-label {
		padding: 0;
	}

	.setting-divider {
		height: 0.5px;
		background: rgba(0, 0, 0, 0.08);
		margin-left: 16px;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.08);
		}
	}

	.setting-section-header {
		font-size: 13px;
		font-weight: 600;
		color: #86868b;
		padding: 10px 16px 4px;
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.setting-description {
		font-size: 11px;
		color: #86868b;
		padding: 4px 16px 12px;
		margin: 0;
		line-height: 1.4;
	}

	/* ===== Toggle switch ===== */
	.toggle {
		width: 36px;
		height: 22px;
		border-radius: 11px;
		background: #d1d1d6;
		border: none;
		position: relative;
		cursor: pointer;
		transition: background 0.2s ease;
		flex-shrink: 0;

		&.on {
			background: #34c759;
		}
	}

	.toggle-knob {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: white;
		position: absolute;
		top: 2px;
		left: 2px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 0 0 0.5px rgba(0, 0, 0, 0.04);
		transition: transform 0.2s ease;
		pointer-events: none;
	}

	.toggle.on .toggle-knob {
		transform: translateX(14px);
	}

	/* ===== Slider ===== */
	.slider-container {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		max-width: 280px;

		&.wide {
			max-width: 320px;
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
			width: 16px;
			height: 16px;
			border-radius: 50%;
			background: white;
			box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2), 0 0 0 0.5px rgba(0, 0, 0, 0.08);
			cursor: pointer;
		}
	}

	/* ===== Segmented control ===== */
	.segmented-control {
		display: flex;
		background: rgba(0, 0, 0, 0.06);
		border-radius: 7px;
		padding: 2px;
		gap: 1px;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.08);
		}
	}

	.segment {
		padding: 4px 14px;
		border: none;
		background: none;
		border-radius: 5px;
		font-size: 12px;
		cursor: pointer;
		color: var(--system-color-light-contrast);
		transition: all 0.15s;

		&.active {
			background: white;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

			:global(body.dark) & {
				background: #636366;
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
		background-image: url("data:image/svg+xml,%3Csvg width='8' height='5' viewBox='0 0 8 5' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L4 4L7 1' stroke='%2386868b' stroke-width='1.2' stroke-linecap='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 8px center;

		:global(body.dark) & {
			background-color: #48484a;
			border-color: rgba(255, 255, 255, 0.1);
		}
	}

	/* ===== Appearance section ===== */
	.appearance-modes {
		display: flex;
		gap: 16px;
		padding: 12px 16px 16px;
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
		width: 96px;
		height: 64px;
		border-radius: 8px;
		background: #f5f5f7;
		border: 2px solid transparent;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		transition: border-color 0.15s;

		.appearance-option.active & {
			border-color: #007aff;
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
		height: 10px;
		background: #e8e8ed;
		display: flex;
		align-items: center;
		padding: 0 4px;
	}

	.preview-dots {
		display: flex;
		gap: 2px;
	}

	.preview-dots .dot {
		width: 4px;
		height: 4px;
		border-radius: 50%;
	}
	.dot.red { background: #ff5f57; }
	.dot.yellow { background: #fdbc40; }
	.dot.green { background: #33c748; }

	.preview-sidebar {
		width: 24px;
		height: 100%;
		background: #ececf0;
		float: left;
	}

	.preview-content {
		flex: 1;
		padding: 6px;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.preview-line {
		height: 3px;
		background: #d1d1d6;
		border-radius: 1px;
	}
	.preview-line.short {
		width: 60%;
	}

	.appearance-label {
		font-size: 12px;
		color: var(--system-color-light-contrast);
	}

	.appearance-option.active .appearance-label {
		color: #007aff;
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
		border: 2px solid transparent;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.1s;
		box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.15);

		&:hover {
			transform: scale(1.15);
		}

		&.active {
			border-color: rgba(0, 0, 0, 0.2);
		}
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
		grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
		gap: 10px;
		padding: 8px 16px 16px;

		&.wide {
			grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
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
			box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.4);
		}

		&.active img {
			box-shadow: 0 0 0 3px #007aff;
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
		padding: 20px 16px;
	}

	.display-frame {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.display-screen {
		width: 180px;
		height: 110px;
		background: linear-gradient(135deg, #1c1c1e, #2c2c2e);
		border-radius: 8px;
		border: 2px solid #48484a;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.display-res-label {
		font-size: 11px;
		color: #86868b;
	}

	.display-stand {
		width: 40px;
		height: 16px;
		background: linear-gradient(to bottom, #c8c8cc, #b0b0b4);
		clip-path: polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%);
	}

	.display-base {
		width: 70px;
		height: 4px;
		background: #b0b0b4;
		border-radius: 0 0 2px 2px;
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
		border: 2px solid transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: border-color 0.15s;

		:global(body.dark) & {
			background: #48484a;
		}

		&.selected {
			border-color: #007aff;
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

	.device-icon {
		font-size: 18px;
		width: 28px;
		text-align: center;
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
		width: 24px;
		text-align: center;
	}

	.signal-bars {
		font-size: 12px;
		letter-spacing: -2px;
		color: #007aff;
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

	.network-lock {
		font-size: 11px;
		opacity: 0.5;
	}

	.wifi-off-message {
		padding: 32px 16px;
		text-align: center;
		color: #86868b;
		font-size: 14px;
	}

	/* ===== Placeholder section ===== */
	.placeholder-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40px 16px;
		gap: 12px;
	}

	.placeholder-icon {
		font-size: 40px;
		opacity: 0.4;
	}

	.placeholder-text {
		font-size: 14px;
		color: #86868b;
		text-align: center;
		margin: 0;
	}
</style>
