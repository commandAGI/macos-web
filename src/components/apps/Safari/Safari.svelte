<script lang="ts">
	const {
		is_being_dragged,
	}: {
		is_being_dragged: boolean;
	} = $props();

	// --- Types ---
	type Tab = {
		id: number;
		title: string;
		url: string;
		display_url: string;
		is_start_page: boolean;
		loading: boolean;
		load_progress: number;
		can_go_back: boolean;
		can_go_forward: boolean;
		history: string[];
		history_index: number;
		error: string | null;
	};

	type Favorite = {
		name: string;
		url: string;
		icon: string;
		color: string;
	};

	type BookmarkItem = {
		title: string;
		url: string;
		icon: string;
	};

	type BookmarkFolder = {
		name: string;
		items: BookmarkItem[];
	};

	// --- Constants ---
	const favorites: Favorite[] = [
		{ name: 'Apple', url: 'https://www.apple.com', icon: '', color: '#555555' },
		{ name: 'Google', url: 'https://www.google.com', icon: 'G', color: '#4285F4' },
		{ name: 'YouTube', url: 'https://www.youtube.com', icon: '>', color: '#FF0000' },
		{ name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: 'W', color: '#636466' },
		{ name: 'GitHub', url: 'https://github.com', icon: '', color: '#24292e' },
		{ name: 'Reddit', url: 'https://www.reddit.com', icon: 'r/', color: '#FF4500' },
		{ name: 'Twitter', url: 'https://twitter.com', icon: 'X', color: '#000000' },
		{ name: 'Amazon', url: 'https://www.amazon.com', icon: 'a', color: '#FF9900' },
		{ name: 'Netflix', url: 'https://www.netflix.com', icon: 'N', color: '#E50914' },
		{ name: 'LinkedIn', url: 'https://www.linkedin.com', icon: 'in', color: '#0077B5' },
		{ name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: 'SO', color: '#F48024' },
		{ name: 'MDN', url: 'https://developer.mozilla.org', icon: 'M', color: '#1B1B1B' },
	];

	const frequently_visited: Favorite[] = [
		{ name: 'GitHub - agi-inc', url: 'https://github.com/agi-inc', icon: '', color: '#24292e' },
		{ name: 'Google Docs', url: 'https://docs.google.com', icon: 'D', color: '#4285F4' },
		{ name: 'Hacker News', url: 'https://news.ycombinator.com', icon: 'Y', color: '#FF6600' },
		{ name: 'Vercel', url: 'https://vercel.com', icon: 'V', color: '#000000' },
		{ name: 'Figma', url: 'https://figma.com', icon: 'F', color: '#A259FF' },
		{ name: 'Notion', url: 'https://notion.so', icon: 'N', color: '#000000' },
	];

	const bookmark_folders: BookmarkFolder[] = [
		{
			name: 'Favorites',
			items: [
				{ title: 'Apple', url: 'https://www.apple.com', icon: '' },
				{ title: 'Google', url: 'https://www.google.com', icon: 'G' },
				{ title: 'YouTube', url: 'https://www.youtube.com', icon: '>' },
				{ title: 'Wikipedia', url: 'https://www.wikipedia.org', icon: 'W' },
				{ title: 'GitHub', url: 'https://github.com', icon: '' },
				{ title: 'Reddit', url: 'https://www.reddit.com', icon: 'r/' },
			],
		},
		{
			name: 'Reading List',
			items: [
				{ title: 'Svelte 5 Runes Guide', url: 'https://svelte.dev/docs', icon: 'S' },
				{ title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs', icon: 'TS' },
			],
		},
		{
			name: 'Work',
			items: [
				{ title: 'Linear', url: 'https://linear.app', icon: 'L' },
				{ title: 'Slack', url: 'https://slack.com', icon: 'S' },
				{ title: 'Vercel Dashboard', url: 'https://vercel.com/dashboard', icon: 'V' },
			],
		},
	];

	// --- State ---
	let next_tab_id = $state(1);
	let tabs = $state<Tab[]>([create_tab()]);
	let active_tab_id = $state(0);
	let show_sidebar = $state(false);
	let is_private_browsing = $state(false);
	let url_input_focused = $state(false);
	let url_input_value = $state('');
	let hovered_tab_id = $state<number | null>(null);
	let reader_mode_active = $state(false);

	// --- Derived ---
	const active_tab = $derived(tabs.find((t) => t.id === active_tab_id) ?? tabs[0]);
	const can_go_back = $derived(active_tab?.can_go_back ?? false);
	const can_go_forward = $derived(active_tab?.can_go_forward ?? false);

	// --- Tab management ---
	function create_tab(url?: string): Tab {
		const id = next_tab_id++;
		const is_start = !url;
		return {
			id,
			title: is_start ? 'Start Page' : extract_title(url!),
			url: url || '',
			display_url: url || '',
			is_start_page: is_start,
			loading: false,
			load_progress: 0,
			can_go_back: false,
			can_go_forward: false,
			history: url ? [url] : [],
			history_index: url ? 0 : -1,
			error: null,
		};
	}

	function extract_title(url: string): string {
		try {
			const hostname = new URL(url).hostname.replace('www.', '');
			return hostname.charAt(0).toUpperCase() + hostname.slice(1);
		} catch {
			return url;
		}
	}

	function extract_display_url(url: string): string {
		try {
			const u = new URL(url);
			return u.hostname.replace('www.', '');
		} catch {
			return url;
		}
	}

	function add_tab(url?: string) {
		const new_tab = create_tab(url);
		tabs = [...tabs, new_tab];
		active_tab_id = new_tab.id;
		url_input_value = '';
		reader_mode_active = false;
	}

	function close_tab(id: number, event?: MouseEvent) {
		if (event) {
			event.stopPropagation();
		}
		if (tabs.length <= 1) {
			// Replace with start page instead of closing last tab
			const new_tab = create_tab();
			tabs = [new_tab];
			active_tab_id = new_tab.id;
			return;
		}
		const index = tabs.findIndex((t) => t.id === id);
		tabs = tabs.filter((t) => t.id !== id);
		if (active_tab_id === id) {
			const new_index = Math.min(index, tabs.length - 1);
			active_tab_id = tabs[new_index].id;
		}
	}

	function select_tab(id: number) {
		active_tab_id = id;
		reader_mode_active = false;
		const tab = tabs.find((t) => t.id === id);
		if (tab) {
			url_input_value = tab.is_start_page ? '' : tab.display_url;
		}
	}

	// --- Navigation ---
	function navigate(input?: string) {
		const raw = input ?? url_input_value;
		if (!raw.trim()) return;

		let target = raw.trim();
		// Detect if it looks like a URL or a search query
		if (!target.includes('.') && !target.startsWith('http')) {
			target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
		} else if (!target.startsWith('http://') && !target.startsWith('https://')) {
			target = 'https://' + target;
		}

		const tab_index = tabs.findIndex((t) => t.id === active_tab_id);
		if (tab_index === -1) return;

		const tab = tabs[tab_index];
		// Truncate forward history
		const new_history = tab.history.slice(0, tab.history_index + 1);
		new_history.push(target);

		tabs[tab_index] = {
			...tab,
			url: target,
			display_url: extract_display_url(target),
			title: extract_title(target),
			is_start_page: false,
			loading: true,
			load_progress: 0,
			history: new_history,
			history_index: new_history.length - 1,
			can_go_back: new_history.length > 1,
			can_go_forward: false,
			error: null,
		};

		url_input_value = extract_display_url(target);
		url_input_focused = false;
		reader_mode_active = false;
		simulate_loading(tab_index);
	}

	function simulate_loading(tab_index: number) {
		let progress = 0;
		const interval = setInterval(() => {
			progress += Math.random() * 30 + 10;
			if (progress >= 100) {
				progress = 100;
				clearInterval(interval);
				if (tabs[tab_index]) {
					tabs[tab_index] = { ...tabs[tab_index], loading: false, load_progress: 100 };
				}
				// Reset progress after a moment
				setTimeout(() => {
					if (tabs[tab_index]) {
						tabs[tab_index] = { ...tabs[tab_index], load_progress: 0 };
					}
				}, 300);
			} else {
				if (tabs[tab_index]) {
					tabs[tab_index] = { ...tabs[tab_index], load_progress: progress };
				}
			}
		}, 200);
	}

	function go_back() {
		const tab_index = tabs.findIndex((t) => t.id === active_tab_id);
		if (tab_index === -1) return;
		const tab = tabs[tab_index];
		if (tab.history_index <= 0) return;

		const new_index = tab.history_index - 1;
		const prev_url = tab.history[new_index];

		tabs[tab_index] = {
			...tab,
			url: prev_url,
			display_url: extract_display_url(prev_url),
			title: extract_title(prev_url),
			is_start_page: false,
			loading: true,
			load_progress: 0,
			history_index: new_index,
			can_go_back: new_index > 0,
			can_go_forward: true,
			error: null,
		};
		url_input_value = extract_display_url(prev_url);
		reader_mode_active = false;
		simulate_loading(tab_index);
	}

	function go_forward() {
		const tab_index = tabs.findIndex((t) => t.id === active_tab_id);
		if (tab_index === -1) return;
		const tab = tabs[tab_index];
		if (tab.history_index >= tab.history.length - 1) return;

		const new_index = tab.history_index + 1;
		const next_url = tab.history[new_index];

		tabs[tab_index] = {
			...tab,
			url: next_url,
			display_url: extract_display_url(next_url),
			title: extract_title(next_url),
			is_start_page: false,
			loading: true,
			load_progress: 0,
			history_index: new_index,
			can_go_back: true,
			can_go_forward: new_index < tab.history.length - 1,
			error: null,
		};
		url_input_value = extract_display_url(next_url);
		reader_mode_active = false;
		simulate_loading(tab_index);
	}

	function refresh() {
		const tab_index = tabs.findIndex((t) => t.id === active_tab_id);
		if (tab_index === -1 || tabs[tab_index].is_start_page) return;

		tabs[tab_index] = {
			...tabs[tab_index],
			loading: true,
			load_progress: 0,
			error: null,
		};
		simulate_loading(tab_index);
	}

	function navigate_to_favorite(url: string) {
		const tab_index = tabs.findIndex((t) => t.id === active_tab_id);
		if (tab_index === -1) return;

		const tab = tabs[tab_index];
		const new_history = tab.history.slice(0, tab.history_index + 1);
		new_history.push(url);

		tabs[tab_index] = {
			...tab,
			url,
			display_url: extract_display_url(url),
			title: extract_title(url),
			is_start_page: false,
			loading: true,
			load_progress: 0,
			history: new_history,
			history_index: new_history.length - 1,
			can_go_back: new_history.length > 1,
			can_go_forward: false,
			error: null,
		};

		url_input_value = extract_display_url(url);
		reader_mode_active = false;
		simulate_loading(tab_index);
	}

	function handle_url_focus() {
		url_input_focused = true;
		url_input_value = active_tab?.is_start_page ? '' : (active_tab?.url ?? '');
	}

	function handle_url_blur() {
		url_input_focused = false;
		if (active_tab) {
			url_input_value = active_tab.is_start_page ? '' : active_tab.display_url;
		}
	}

	function handle_url_keydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			navigate();
			(e.target as HTMLInputElement).blur();
		} else if (e.key === 'Escape') {
			url_input_focused = false;
			if (active_tab) {
				url_input_value = active_tab.is_start_page ? '' : active_tab.display_url;
			}
			(e.target as HTMLInputElement).blur();
		}
	}

	function toggle_sidebar() {
		show_sidebar = !show_sidebar;
	}

	function toggle_reader_mode() {
		if (active_tab?.is_start_page) return;
		reader_mode_active = !reader_mode_active;
	}

	function navigate_from_bookmark(url: string) {
		navigate(url);
		show_sidebar = false;
	}
</script>

<section class="container" class:private={is_private_browsing}>
	<!-- Tab Bar -->
	<header class="app-window-drag-handle tab-bar-area">
		<div class="tab-strip">
			{#each tabs as tab (tab.id)}
				<button
					class="tab"
					class:active={active_tab_id === tab.id}
					onclick={() => select_tab(tab.id)}
					onmouseenter={() => hovered_tab_id = tab.id}
					onmouseleave={() => hovered_tab_id = null}
				>
					{#if tab.loading}
						<span class="tab-spinner"></span>
					{:else}
						<span class="tab-favicon">
							{#if tab.is_start_page}
								<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
									<path d="M8 1L1 6v8.5A1.5 1.5 0 002.5 16h3a.5.5 0 00.5-.5V10h4v5.5a.5.5 0 00.5.5h3a1.5 1.5 0 001.5-1.5V6L8 1z"/>
								</svg>
							{:else}
								<span class="tab-favicon-letter">{tab.title.charAt(0)}</span>
							{/if}
						</span>
					{/if}
					<span class="tab-title">{tab.title}</span>
					{#if tabs.length > 1 && (hovered_tab_id === tab.id || active_tab_id === tab.id)}
						<!-- svelte-ignore node_invalid_placement_ssr -->
						<span
							class="tab-close"
							role="button"
							tabindex="-1"
							onclick={(e) => close_tab(tab.id, e)}
							onkeydown={(e) => { if (e.key === 'Enter') close_tab(tab.id); }}
							aria-label="Close tab"
						>
							<svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
								<path d="M1.172 1.172a.5.5 0 01.707 0L4 3.293l2.121-2.121a.5.5 0 11.707.707L4.707 4l2.121 2.121a.5.5 0 01-.707.707L4 4.707 1.879 6.828a.5.5 0 01-.707-.707L3.293 4 1.172 1.879a.5.5 0 010-.707z"/>
							</svg>
						</span>
					{/if}
				</button>
			{/each}
			<button class="tab-add" onclick={() => add_tab()} aria-label="New tab">
				<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
					<path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
				</svg>
			</button>
		</div>
	</header>

	<!-- Navigation Bar -->
	<div class="nav-bar">
		<div class="nav-left">
			<!-- Sidebar toggle -->
			<button
				class="nav-btn"
				class:active-toggle={show_sidebar}
				onclick={toggle_sidebar}
				aria-label="Toggle sidebar"
			>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" opacity="0.7">
					<rect x="1" y="2" width="14" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/>
					<line x1="5.5" y1="2" x2="5.5" y2="14" stroke="currentColor" stroke-width="1.2"/>
				</svg>
			</button>

			<!-- Back / Forward -->
			<button
				class="nav-btn nav-arrow"
				class:disabled={!can_go_back}
				onclick={go_back}
				disabled={!can_go_back}
				aria-label="Go back"
			>
				<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
					<path d="M7.5 1.5L3 6l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
			<button
				class="nav-btn nav-arrow"
				class:disabled={!can_go_forward}
				onclick={go_forward}
				disabled={!can_go_forward}
				aria-label="Go forward"
			>
				<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
					<path d="M4.5 1.5L9 6l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
		</div>

		<!-- URL Bar -->
		<div class="url-bar-wrapper">
			<div class="url-bar" class:focused={url_input_focused} class:loading={active_tab?.loading}>
				{#if active_tab?.loading}
					<div class="url-bar-progress" style="width: {active_tab.load_progress}%"></div>
				{/if}
				{#if !url_input_focused && !active_tab?.is_start_page}
					<span class="url-lock">
						<svg width="10" height="10" viewBox="0 0 10 10" fill="#86868b">
							<path d="M3 4V3a2 2 0 114 0v1h.5A1.5 1.5 0 019 5.5v3A1.5 1.5 0 017.5 10h-5A1.5 1.5 0 011 8.5v-3A1.5 1.5 0 012.5 4H3zm1-1a1 1 0 112 0v1H4V3z"/>
						</svg>
					</span>
				{/if}
				<input
					type="text"
					bind:value={url_input_value}
					onfocus={handle_url_focus}
					onblur={handle_url_blur}
					onkeydown={handle_url_keydown}
					placeholder="Search or enter website name"
					class:centered={!url_input_focused}
					spellcheck="false"
				/>
				{#if !url_input_focused && active_tab && !active_tab.is_start_page}
					<button
						class="url-reader-btn"
						class:active-reader={reader_mode_active}
						onclick={toggle_reader_mode}
						aria-label="Toggle reader mode"
					>
						<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" opacity="0.5">
							<path d="M2 3h12v1H2zm0 3h12v1H2zm0 3h8v1H2zm0 3h10v1H2z"/>
						</svg>
					</button>
				{/if}
			</div>
		</div>

		<div class="nav-right">
			<!-- Share button -->
			<button class="nav-btn" aria-label="Share">
				<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" opacity="0.7">
					<path d="M8 1v8M5 4l3-3 3 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M3 8v5a2 2 0 002 2h6a2 2 0 002-2V8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				</svg>
			</button>

			<!-- Add bookmark -->
			<button class="nav-btn" aria-label="Add bookmark">
				<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.7">
					<path d="M8 2l1.796 3.64L14 6.236l-3 2.924.708 4.13L8 11.236 4.292 13.29 5 9.16 2 6.236l4.204-.596z" stroke-linejoin="round"/>
				</svg>
			</button>

			<!-- New tab -->
			<button class="nav-btn" onclick={() => add_tab()} aria-label="New tab">
				<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" opacity="0.7">
					<rect x="2" y="2" width="12" height="12" rx="2"/>
					<line x1="8" y1="5" x2="8" y2="11"/>
					<line x1="5" y1="8" x2="11" y2="8"/>
				</svg>
			</button>
		</div>
	</div>

	{#if is_private_browsing}
		<div class="private-indicator">
			<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
				<path d="M8 2C4 2 1 8 1 8s3 6 7 6 7-6 7-6-3-6-7-6zm0 10a4 4 0 110-8 4 4 0 010 8zm0-6a2 2 0 100 4 2 2 0 000-4z"/>
			</svg>
			Private Browsing
		</div>
	{/if}

	<!-- Main Content Area -->
	<div class="main-area">
		<!-- Bookmarks Sidebar -->
		{#if show_sidebar}
			<aside class="sidebar">
				<div class="sidebar-header">
					<span class="sidebar-title">Bookmarks</span>
				</div>
				<div class="sidebar-content">
					{#each bookmark_folders as folder}
						<div class="sidebar-folder">
							<div class="sidebar-folder-name">
								<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" opacity="0.5">
									<path d="M3 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
								{folder.name}
							</div>
							{#each folder.items as item}
								<button
									class="sidebar-bookmark"
									onclick={() => navigate_from_bookmark(item.url)}
								>
									<span class="sidebar-bookmark-icon">{item.icon}</span>
									<span class="sidebar-bookmark-title">{item.title}</span>
								</button>
							{/each}
						</div>
					{/each}
				</div>
			</aside>
		{/if}

		<!-- Page Content -->
		<div class="content">
			{#if active_tab?.is_start_page}
				<!-- Start Page -->
				<div class="start-page">
					<div class="start-page-inner">
						<!-- Favorites Section -->
						<section class="start-section">
							<h2 class="start-section-title">Favorites</h2>
							<div class="favorites-grid">
								{#each favorites as fav}
									<button
										class="favorite-item"
										onclick={() => navigate_to_favorite(fav.url)}
									>
										<div class="favorite-icon" style="background-color: {fav.color}">
											{#if fav.icon === ''}
												<svg width="20" height="20" viewBox="0 0 20 20" fill="white">
													<path d="M15.07 13.633c-.263.16-.437.47-.437.816 0 1.368 1.072 2.197 2.16 2.753-.186.476-.556 1.28-.917 1.77-.555.745-1.13 1.49-2.04 1.505-.89.015-1.177-.527-2.196-.527-1.02 0-1.34.512-2.19.542-.877.03-1.543-.807-2.104-1.548-1.143-1.513-2.016-4.277-0.844-6.142.58-.92 1.618-1.503 2.744-1.52 0.858-.016 1.67.578 2.195.578.526 0 1.512-.715 2.548-.61.434.019 1.654.176 2.437 1.323-.063.04-1.454.85-1.44 2.535l.084.525zm-2.83-4.947c.464-.562.777-1.343.692-2.122-.669.027-1.477.446-1.957 1.008-.43.497-.806 1.293-.706 2.056.747.058 1.508-.38 1.971-.942z" transform="scale(0.82) translate(1, 1)"/>
												</svg>
											{:else}
												<span class="favorite-letter">{fav.icon}</span>
											{/if}
										</div>
										<span class="favorite-name">{fav.name}</span>
									</button>
								{/each}
							</div>
						</section>

						<!-- Frequently Visited Section -->
						<section class="start-section">
							<h2 class="start-section-title">Frequently Visited</h2>
							<div class="frequently-grid">
								{#each frequently_visited as site}
									<button
										class="frequent-item"
										onclick={() => navigate_to_favorite(site.url)}
									>
										<div class="frequent-thumbnail">
											<div class="frequent-icon" style="background-color: {site.color}">
												{#if site.icon === ''}
													<svg width="16" height="16" viewBox="0 0 20 20" fill="white">
														<path d="M15.07 13.633c-.263.16-.437.47-.437.816 0 1.368 1.072 2.197 2.16 2.753-.186.476-.556 1.28-.917 1.77-.555.745-1.13 1.49-2.04 1.505-.89.015-1.177-.527-2.196-.527-1.02 0-1.34.512-2.19.542-.877.03-1.543-.807-2.104-1.548-1.143-1.513-2.016-4.277-0.844-6.142.58-.92 1.618-1.503 2.744-1.52 0.858-.016 1.67.578 2.195.578.526 0 1.512-.715 2.548-.61.434.019 1.654.176 2.437 1.323-.063.04-1.454.85-1.44 2.535l.084.525zm-2.83-4.947c.464-.562.777-1.343.692-2.122-.669.027-1.477.446-1.957 1.008-.43.497-.806 1.293-.706 2.056.747.058 1.508-.38 1.971-.942z" transform="scale(0.82) translate(1, 1)"/>
													</svg>
												{:else}
													<span class="frequent-letter">{site.icon}</span>
												{/if}
											</div>
										</div>
										<span class="frequent-name">{site.name}</span>
									</button>
								{/each}
							</div>
						</section>
					</div>
				</div>
			{:else if reader_mode_active}
				<!-- Reader Mode View -->
				<div class="reader-mode">
					<article class="reader-content">
						<h1 class="reader-title">{active_tab?.title ?? ''}</h1>
						<p class="reader-url">{active_tab?.display_url ?? ''}</p>
						<div class="reader-body">
							<p>Reader mode provides a simplified view of web page content, removing ads, navigation, and other distractions for a cleaner reading experience.</p>
							<p>This is a simulated reader view for <strong>{active_tab?.display_url ?? ''}</strong>. In a real browser, this would extract and display the main article content from the page.</p>
							<p>Safari's Reader mode automatically detects articles on web pages and reformats them with clean typography, removing clutter and ads for a better reading experience.</p>
						</div>
					</article>
				</div>
			{:else if active_tab?.error}
				<!-- Error Page -->
				<div class="error-page">
					<div class="error-content">
						<div class="error-icon">
							<svg width="48" height="48" viewBox="0 0 48 48" fill="#86868b">
								<circle cx="24" cy="24" r="20" fill="none" stroke="#86868b" stroke-width="2"/>
								<path d="M24 14v12M24 30v4" stroke="#86868b" stroke-width="3" stroke-linecap="round"/>
							</svg>
						</div>
						<h2 class="error-title">Safari Can't Open the Page</h2>
						<p class="error-message">{active_tab.error}</p>
					</div>
				</div>
			{:else if !is_being_dragged}
				<!-- iframe content -->
				<iframe
					src={active_tab?.url ?? 'about:blank'}
					title="Safari Browser"
					sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
				></iframe>
			{:else}
				<div class="drag-overlay">
					<p>{active_tab?.display_url ?? ''}</p>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	/* --- Container --- */
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

	.container.private {
		--safari-chrome-bg: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
		--safari-tab-active-bg: #48484a;
	}

	/* --- Tab Bar --- */
	.tab-bar-area {
		background: linear-gradient(to bottom, #e8e8ed, #dcdce1);
		border-bottom: 1px solid #c5c5c7;
		padding: 8px 80px 0;
		min-height: 36px;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3a3a3c, #323234);
			border-bottom-color: #1c1c1e;
		}
	}

	.tab-strip {
		display: flex;
		align-items: flex-end;
		gap: 0;
		overflow-x: auto;
		scrollbar-width: none;

		&::-webkit-scrollbar {
			display: none;
		}
	}

	.tab {
		position: relative;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 5px 28px 5px 10px;
		background: rgba(0, 0, 0, 0.04);
		border: none;
		border-radius: 8px 8px 0 0;
		font-size: 11.5px;
		color: #6e6e73;
		cursor: default;
		max-width: 200px;
		min-width: 100px;
		height: 28px;
		flex-shrink: 0;
		transition: background-color 100ms ease;

		&:hover {
			background: rgba(0, 0, 0, 0.06);
		}

		&.active {
			background: #f5f5f7;
			color: var(--system-color-light-contrast);
			box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.08);
		}

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.04);
			color: #98989d;

			&:hover {
				background: rgba(255, 255, 255, 0.06);
			}

			&.active {
				background: #48484a;
				color: #f5f5f7;
				box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.3);
			}
		}
	}

	.tab-favicon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		color: #86868b;
		font-size: 10px;
	}

	.tab-favicon-letter {
		font-size: 10px;
		font-weight: 600;
		color: #86868b;
	}

	.tab-spinner {
		width: 12px;
		height: 12px;
		border: 1.5px solid rgba(0, 0, 0, 0.15);
		border-top-color: #007aff;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		flex-shrink: 0;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.tab-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
		text-align: left;
	}

	.tab-close {
		position: absolute;
		right: 6px;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		padding: 0;
		border: none;
		background: none;
		border-radius: 3px;
		color: #86868b;
		cursor: pointer;
		opacity: 0.6;

		&:hover {
			background: rgba(0, 0, 0, 0.1);
			opacity: 1;
		}

		:global(body.dark) &:hover {
			background: rgba(255, 255, 255, 0.15);
		}
	}

	.tab-add {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		background: none;
		border: none;
		border-radius: 6px;
		color: #86868b;
		cursor: pointer;
		flex-shrink: 0;

		&:hover {
			background: rgba(0, 0, 0, 0.06);
			color: var(--system-color-light-contrast);
		}

		:global(body.dark) &:hover {
			background: rgba(255, 255, 255, 0.08);
		}
	}

	/* --- Navigation Bar --- */
	.nav-bar {
		display: flex;
		align-items: center;
		padding: 6px 10px;
		gap: 6px;
		background: #f5f5f7;
		border-bottom: 1px solid #d1d1d6;

		:global(body.dark) & {
			background: #2c2c2e;
			border-bottom-color: #1c1c1e;
		}
	}

	.nav-left,
	.nav-right {
		display: flex;
		align-items: center;
		gap: 2px;
		flex-shrink: 0;
	}

	.nav-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		color: var(--system-color-light-contrast);
		padding: 4px 6px;
		border-radius: 5px;
		cursor: pointer;
		min-width: 28px;
		height: 28px;

		&:hover {
			background: rgba(0, 0, 0, 0.06);
		}

		&.disabled {
			opacity: 0.3;
			cursor: default;

			&:hover {
				background: none;
			}
		}

		&.active-toggle {
			background: rgba(0, 122, 255, 0.12);
			color: #007aff;
		}

		:global(body.dark) & {
			color: #e5e5e7;

			&:hover {
				background: rgba(255, 255, 255, 0.08);
			}

			&.active-toggle {
				background: rgba(10, 133, 255, 0.2);
				color: #0a85ff;
			}
		}
	}

	.nav-arrow {
		padding: 4px 4px;
		min-width: 24px;
	}

	/* --- URL Bar --- */
	.url-bar-wrapper {
		flex: 1;
		max-width: 600px;
		margin: 0 auto;
		min-width: 200px;
	}

	.url-bar {
		position: relative;
		display: flex;
		align-items: center;
		background: rgba(0, 0, 0, 0.06);
		border-radius: 8px;
		overflow: hidden;
		height: 30px;

		&.focused {
			outline: 2px solid #007aff;
			outline-offset: -1px;
			background: white;
		}

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.08);

			&.focused {
				background: #1c1c1e;
				outline-color: #0a85ff;
			}
		}
	}

	.url-bar-progress {
		position: absolute;
		top: 0;
		left: 0;
		height: 2px;
		background: #007aff;
		border-radius: 0 1px 1px 0;
		transition: width 200ms ease;
		z-index: 2;
	}

	.url-lock {
		display: flex;
		align-items: center;
		padding-left: 10px;
		flex-shrink: 0;
	}

	.url-bar input {
		width: 100%;
		height: 100%;
		padding: 0 10px;
		border: none;
		background: none;
		font-size: 13px;
		color: var(--system-color-light-contrast);
		outline: none;
		font-family: var(--system-font-family);

		&.centered {
			text-align: center;
			padding-left: 0;
		}

		&::placeholder {
			color: #86868b;
			text-align: center;
		}

		:global(body.dark) & {
			color: #f5f5f7;
		}
	}

	.url-reader-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px 8px;
		border: none;
		background: none;
		border-radius: 4px;
		cursor: pointer;
		flex-shrink: 0;
		color: var(--system-color-light-contrast);

		&:hover {
			background: rgba(0, 0, 0, 0.06);
		}

		&.active-reader {
			background: rgba(0, 122, 255, 0.15);
			color: #007aff;
		}
	}

	/* --- Private Browsing Indicator --- */
	.private-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 3px 0;
		background: #4a3b69;
		color: white;
		font-size: 11px;
		font-weight: 500;
	}

	/* --- Main Content Area --- */
	.main-area {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	/* --- Sidebar --- */
	.sidebar {
		width: 220px;
		min-width: 220px;
		background: #f2f2f7;
		border-right: 1px solid #d1d1d6;
		display: flex;
		flex-direction: column;
		overflow: hidden;

		:global(body.dark) & {
			background: #1c1c1e;
			border-right-color: #38383a;
		}
	}

	.sidebar-header {
		padding: 10px 14px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);

		:global(body.dark) & {
			border-bottom-color: rgba(255, 255, 255, 0.06);
		}
	}

	.sidebar-title {
		font-size: 13px;
		font-weight: 700;
		color: var(--system-color-light-contrast);
	}

	.sidebar-content {
		flex: 1;
		overflow-y: auto;
		padding: 6px 0;
	}

	.sidebar-folder {
		margin-bottom: 4px;
	}

	.sidebar-folder-name {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 14px;
		font-size: 12px;
		font-weight: 600;
		color: #86868b;
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.sidebar-bookmark {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 5px 14px 5px 30px;
		border: none;
		background: none;
		font-size: 13px;
		color: var(--system-color-light-contrast);
		cursor: pointer;
		text-align: left;

		&:hover {
			background: rgba(0, 0, 0, 0.04);
		}

		:global(body.dark) &:hover {
			background: rgba(255, 255, 255, 0.06);
		}
	}

	.sidebar-bookmark-icon {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #007aff;
		border-radius: 3px;
		font-size: 8px;
		font-weight: 700;
		color: white;
		flex-shrink: 0;
	}

	.sidebar-bookmark-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* --- Content --- */
	.content {
		flex: 1;
		overflow: hidden;
		position: relative;
	}

	iframe {
		width: 100%;
		height: 100%;
		border: none;
		background: white;

		:global(body.dark) & {
			background: #1c1c1e;
		}
	}

	.drag-overlay {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background: var(--system-color-light);
		color: #86868b;
		font-size: 14px;
	}

	/* --- Start Page --- */
	.start-page {
		width: 100%;
		height: 100%;
		overflow-y: auto;
		background: linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%);

		:global(body.dark) & {
			background: linear-gradient(180deg, #1c1c1e 0%, #2c2c2e 100%);
		}
	}

	.start-page-inner {
		max-width: 720px;
		margin: 0 auto;
		padding: 40px 24px;
	}

	.start-section {
		margin-bottom: 36px;
	}

	.start-section-title {
		font-size: 20px;
		font-weight: 700;
		margin: 0 0 16px;
		color: var(--system-color-light-contrast);
	}

	.favorites-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
		gap: 16px;
	}

	.favorite-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 8px 4px;
		border: none;
		background: none;
		cursor: pointer;
		border-radius: 8px;

		&:hover {
			background: rgba(0, 0, 0, 0.04);
		}

		:global(body.dark) &:hover {
			background: rgba(255, 255, 255, 0.06);
		}
	}

	.favorite-icon {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 0 0 0.5px rgba(0, 0, 0, 0.08);
	}

	.favorite-letter {
		font-size: 20px;
		font-weight: 700;
		color: white;
	}

	.favorite-name {
		font-size: 11px;
		color: #86868b;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 72px;
	}

	.frequently-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 12px;
	}

	.frequent-item {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 0;
		border: none;
		background: none;
		cursor: pointer;
		border-radius: 8px;
		overflow: hidden;

		&:hover .frequent-thumbnail {
			box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
		}
	}

	.frequent-thumbnail {
		width: 100%;
		aspect-ratio: 16 / 10;
		border-radius: 8px;
		background: white;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08), 0 0 0 0.5px rgba(0, 0, 0, 0.06);
		transition: box-shadow 150ms ease;

		:global(body.dark) & {
			background: #3a3a3c;
		}
	}

	.frequent-icon {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.frequent-letter {
		font-size: 14px;
		font-weight: 700;
		color: white;
	}

	.frequent-name {
		font-size: 11px;
		color: #86868b;
		padding: 0 4px 6px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* --- Reader Mode --- */
	.reader-mode {
		width: 100%;
		height: 100%;
		overflow-y: auto;
		background: #fafafa;

		:global(body.dark) & {
			background: #1c1c1e;
		}
	}

	.reader-content {
		max-width: 600px;
		margin: 0 auto;
		padding: 48px 24px;
	}

	.reader-title {
		font-size: 28px;
		font-weight: 700;
		line-height: 1.2;
		margin: 0 0 8px;
		color: var(--system-color-light-contrast);
	}

	.reader-url {
		font-size: 13px;
		color: #86868b;
		margin: 0 0 32px;
	}

	.reader-body {
		font-size: 18px;
		line-height: 1.7;
		color: var(--system-color-light-contrast);

		p {
			margin: 0 0 20px;
		}

		strong {
			font-weight: 600;
		}
	}

	/* --- Error Page --- */
	.error-page {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--system-color-light);
	}

	.error-content {
		text-align: center;
		max-width: 400px;
		padding: 24px;
	}

	.error-icon {
		margin-bottom: 16px;
	}

	.error-title {
		font-size: 18px;
		font-weight: 600;
		margin: 0 0 8px;
		color: var(--system-color-light-contrast);
	}

	.error-message {
		font-size: 13px;
		color: #86868b;
		margin: 0;
		line-height: 1.5;
	}
</style>
