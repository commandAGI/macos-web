<script lang="ts">
	import type { AppID } from '🍎/state/apps.svelte.ts';

	const { app_id }: { app_id: AppID } = $props();

	// ── Types ──
	type AppEntry = {
		id: number;
		name: string;
		developer: string;
		category: string;
		price: string;
		rating: number;
		gradient: string;
		tagline?: string;
		featured?: boolean;
	};

	type SidebarItem = {
		id: string;
		label: string;
		icon: string;
		badge?: number;
	};

	type SidebarSection = {
		title?: string;
		items: SidebarItem[];
	};

	// ── Data ──
	const sidebar_sections: SidebarSection[] = [
		{
			items: [
				{ id: 'discover', label: 'Discover', icon: 'star' },
				{ id: 'arcade', label: 'Arcade', icon: 'gamepad' },
				{ id: 'create', label: 'Create', icon: 'brush' },
				{ id: 'work', label: 'Work', icon: 'briefcase' },
				{ id: 'play', label: 'Play', icon: 'play' },
				{ id: 'develop', label: 'Develop', icon: 'code' },
			],
		},
		{
			title: 'Categories',
			items: [
				{ id: 'cat-games', label: 'Games', icon: 'controller' },
				{ id: 'cat-productivity', label: 'Productivity', icon: 'checklist' },
				{ id: 'cat-education', label: 'Education', icon: 'book' },
				{ id: 'cat-entertainment', label: 'Entertainment', icon: 'film' },
				{ id: 'cat-utilities', label: 'Utilities', icon: 'wrench' },
			],
		},
		{
			items: [
				{ id: 'updates', label: 'Updates', icon: 'arrow-down', badge: 3 },
				{ id: 'purchased', label: 'Purchased', icon: 'bag' },
			],
		},
	];

	const apps: AppEntry[] = [
		{ id: 1, name: 'Fantastical', developer: 'Flexibits Inc.', category: 'Productivity', price: 'Free', rating: 4.8, gradient: 'linear-gradient(135deg, #ff3b30, #ff9500)', tagline: 'Calendar & Tasks', featured: true },
		{ id: 2, name: 'Pixelmator Pro', developer: 'Pixelmator Team', category: 'Graphics', price: '$4.99', rating: 4.7, gradient: 'linear-gradient(135deg, #007aff, #5856d6)' },
		{ id: 3, name: 'Things 3', developer: 'Cultured Code', category: 'Productivity', price: '$9.99', rating: 4.9, gradient: 'linear-gradient(135deg, #5856d6, #af52de)' },
		{ id: 4, name: 'Bear', developer: 'Shiny Frog', category: 'Productivity', price: 'Free', rating: 4.6, gradient: 'linear-gradient(135deg, #ff3b30, #ff2d55)' },
		{ id: 5, name: 'Spark', developer: 'Readdle Inc.', category: 'Productivity', price: 'Free', rating: 4.5, gradient: 'linear-gradient(135deg, #007aff, #5ac8fa)' },
		{ id: 6, name: 'iStatistica Pro', developer: 'iStatistica Team', category: 'Utilities', price: '$5.99', rating: 4.3, gradient: 'linear-gradient(135deg, #34c759, #30d158)' },
		{ id: 7, name: 'Affinity Designer', developer: 'Serif Labs', category: 'Graphics', price: '$6.99', rating: 4.8, gradient: 'linear-gradient(135deg, #5ac8fa, #007aff)' },
		{ id: 8, name: 'Ulysses', developer: 'Ulysses GmbH', category: 'Productivity', price: 'Free', rating: 4.4, gradient: 'linear-gradient(135deg, #ff9500, #ffcc00)' },
		{ id: 9, name: 'DaVinci Resolve', developer: 'Blackmagic Design', category: 'Video', price: 'Free', rating: 4.7, gradient: 'linear-gradient(135deg, #1d1d1f, #48484a)' },
		{ id: 10, name: 'Sketch', developer: 'Sketch BV', category: 'Graphics', price: '$9.99', rating: 4.5, gradient: 'linear-gradient(135deg, #ffcc00, #ff9500)' },
		{ id: 11, name: 'Cardhop', developer: 'Flexibits Inc.', category: 'Productivity', price: '$2.99', rating: 4.3, gradient: 'linear-gradient(135deg, #ff2d55, #af52de)' },
		{ id: 12, name: 'Tot', developer: 'Iconfactory', category: 'Utilities', price: 'Free', rating: 4.6, gradient: 'linear-gradient(135deg, #af52de, #5856d6)' },
		{ id: 13, name: 'Nova', developer: 'Panic Inc.', category: 'Developer Tools', price: '$9.99', rating: 4.7, gradient: 'linear-gradient(135deg, #5856d6, #007aff)' },
		{ id: 14, name: 'Craft', developer: 'Luki Labs', category: 'Productivity', price: 'Free', rating: 4.8, gradient: 'linear-gradient(135deg, #007aff, #34c759)' },
		{ id: 15, name: 'MindNode', developer: 'IdeasOnCanvas', category: 'Productivity', price: 'Free', rating: 4.5, gradient: 'linear-gradient(135deg, #ff9500, #ff3b30)' },
		{ id: 16, name: 'Noir', developer: 'Jeffrey Kuber', category: 'Utilities', price: '$1.99', rating: 4.4, gradient: 'linear-gradient(135deg, #1d1d1f, #3a3a3c)' },
		{ id: 17, name: 'Notchmeister', developer: 'Flying Meat', category: 'Utilities', price: '$3.99', rating: 3.9, gradient: 'linear-gradient(135deg, #48484a, #6e6e73)' },
		{ id: 18, name: 'Transmit 5', developer: 'Panic Inc.', category: 'Utilities', price: '$7.99', rating: 4.6, gradient: 'linear-gradient(135deg, #34c759, #007aff)' },
		{ id: 19, name: 'CleanMyMac X', developer: 'MacPaw Inc.', category: 'Utilities', price: 'Free', rating: 4.7, gradient: 'linear-gradient(135deg, #5ac8fa, #34c759)' },
		{ id: 20, name: 'Lungo', developer: 'Sindre Sorhus', category: 'Utilities', price: '$0.99', rating: 4.5, gradient: 'linear-gradient(135deg, #6e4f28, #a0785a)' },
		{ id: 21, name: 'TablePlus', developer: 'TablePlus Inc.', category: 'Developer Tools', price: 'Free', rating: 4.8, gradient: 'linear-gradient(135deg, #ff9500, #af52de)' },
		{ id: 22, name: 'Amphetamine', developer: 'William Gustafson', category: 'Utilities', price: 'Free', rating: 4.9, gradient: 'linear-gradient(135deg, #007aff, #ff2d55)' },
		{ id: 23, name: 'Dato', developer: 'Sindre Sorhus', category: 'Utilities', price: '$4.99', rating: 4.6, gradient: 'linear-gradient(135deg, #ff2d55, #ff9500)' },
		{ id: 24, name: 'Raycast', developer: 'Raycast Inc.', category: 'Productivity', price: 'Free', rating: 4.9, gradient: 'linear-gradient(135deg, #ff6b6b, #ee5a24)' },
		{ id: 25, name: 'Whisper Transcription', developer: 'OpenAI', category: 'Utilities', price: 'Free', rating: 4.3, gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
		{ id: 26, name: 'Tower', developer: 'fournova GmbH', category: 'Developer Tools', price: '$6.99', rating: 4.5, gradient: 'linear-gradient(135deg, #2c3e50, #4ca1af)' },
		{ id: 27, name: 'Paw', developer: 'RapidAPI', category: 'Developer Tools', price: 'Free', rating: 4.4, gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
	];

	const featured_app = apps[0];

	let top_free = $derived(apps.filter(a => a.price === 'Free').slice(0, 8));
	let top_paid = $derived(apps.filter(a => a.price !== 'Free').slice(0, 8));
	let essential_apps = $derived([...apps].sort((a, b) => b.rating - a.rating).slice(0, 8));

	// ── State ──
	let active_section = $state('discover');

	// ── Helpers ──
	function render_stars(rating: number): string {
		const full = Math.floor(rating);
		const half = rating % 1 >= 0.3;
		let out = '';
		for (let i = 0; i < 5; i++) {
			if (i < full) out += '\u2605';
			else if (i === full && half) out += '\u2605';
			else out += '\u2606';
		}
		return out;
	}

	function get_sidebar_icon(icon: string): string {
		switch (icon) {
			case 'star':
				return '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M8 1.5l1.85 4.1L14.3 6l-3.15 2.85.85 4.15L8 10.75 3.99 13l.86-4.15L1.7 6l4.45-.4z"/></svg>';
			case 'gamepad':
				return '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1" y="4" width="14" height="8" rx="3"/><circle cx="5" cy="8" r="1.5"/><circle cx="11" cy="8" r="1.5"/></svg>';
			case 'brush':
				return '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M11 1l4 4-6 6H5v-4z"/><path d="M3 13c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/></svg>';
			case 'briefcase':
				return '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1" y="5" width="14" height="9" rx="1.5"/><path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>';
			case 'play':
				return '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M4 2.5v11l9-5.5z"/></svg>';
			case 'code':
				return '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 4L1 8l4 4M11 4l4 4-4 4"/></svg>';
			case 'controller':
				return '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 6a3 3 0 013-3h6a3 3 0 013 3v2a5 5 0 01-5 5H7a5 5 0 01-5-5V6z"/><circle cx="5.5" cy="7" r="1"/><circle cx="10.5" cy="7" r="1"/></svg>';
			case 'checklist':
				return '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 4l2 2 3-3M2 10l2 2 3-3M10 5h4M10 11h4"/></svg>';
			case 'book':
				return '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 2h5a1 1 0 011 1v11l-1-1-1 1H2V2zM14 2H9a1 1 0 00-1 1v11l1-1 1 1h4V2z"/></svg>';
			case 'film':
				return '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1" y="2" width="14" height="12" rx="1.5"/><path d="M1 5h14M1 11h14M4 2v12M12 2v12"/></svg>';
			case 'wrench':
				return '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M10.5 2a4 4 0 00-3.8 5.2L2 12l2 2 4.8-4.7A4 4 0 1010.5 2z"/></svg>';
			case 'arrow-down':
				return '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5v6M5.5 8.5L8 11l2.5-2.5"/></svg>';
			case 'bag':
				return '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 5h10l-1 9H4z"/><path d="M5.5 5V3.5a2.5 2.5 0 015 0V5"/></svg>';
			default:
				return '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><circle cx="8" cy="8" r="6"/></svg>';
		}
	}
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar">
		<div class="titlebar-left">
			<button class="nav-btn" disabled>
				<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="10,3 5,8 10,13"/></svg>
			</button>
			<button class="nav-btn" disabled>
				<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,3 11,8 6,13"/></svg>
			</button>
		</div>
		<div class="titlebar-center">
			<div class="search-box">
				<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="#86868b" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4"/><line x1="9.5" y1="9.5" x2="13" y2="13" stroke-linecap="round"/></svg>
				<span class="search-placeholder">Search</span>
			</div>
		</div>
		<div class="titlebar-right">
			<div class="account-icon">
				<svg viewBox="0 0 16 16" width="16" height="16" fill="#86868b"><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3.3 2.7-5 6-5s6 1.7 6 5"/></svg>
			</div>
		</div>
	</header>

	<div class="main">
		<aside class="sidebar">
			{#each sidebar_sections as section, si}
				{#if si > 0}
					<div class="sidebar-divider"></div>
				{/if}
				{#if section.title}
					<div class="sidebar-header">{section.title}</div>
				{/if}
				{#each section.items as item}
					<button
						class="sidebar-item"
						class:active={active_section === item.id}
						onclick={() => active_section = item.id}
					>
						<span class="sidebar-icon">{@html get_sidebar_icon(item.icon)}</span>
						<span class="sidebar-label">{item.label}</span>
						{#if item.badge}
							<span class="sidebar-badge">{item.badge}</span>
						{/if}
					</button>
				{/each}
			{/each}
		</aside>

		<div class="content">
			{#if active_section === 'discover'}
				<!-- Featured banner -->
				<div class="featured-banner" style:background={featured_app.gradient}>
					<div class="featured-content">
						<div class="featured-badge">FEATURED</div>
						<div class="featured-icon" style:background="rgba(255,255,255,0.25)">
							<svg viewBox="0 0 16 16" width="32" height="32" fill="white"><path d="M8 1.5l1.85 4.1L14.3 6l-3.15 2.85.85 4.15L8 10.75 3.99 13l.86-4.15L1.7 6l4.45-.4z"/></svg>
						</div>
						<div class="featured-text">
							<div class="featured-name">{featured_app.name}</div>
							<div class="featured-tagline">{featured_app.tagline || featured_app.category}</div>
							<div class="featured-developer">{featured_app.developer}</div>
						</div>
						<button class="featured-get-btn">Get</button>
					</div>
				</div>

				<!-- Top Free -->
				<div class="app-section">
					<div class="section-header">
						<h2 class="section-title">Top Free Apps</h2>
						<button class="see-all-btn">See All</button>
					</div>
					<div class="app-scroll">
						{#each top_free as app}
							<div class="app-card">
								<div class="app-icon" style:background={app.gradient}>
									<span class="app-icon-letter">{app.name[0]}</span>
								</div>
								<div class="app-name">{app.name}</div>
								<div class="app-category">{app.category}</div>
								<div class="app-meta">
									<span class="app-stars">{render_stars(app.rating)}</span>
									<span class="app-price">{app.price}</span>
								</div>
								<button class="get-btn">Get</button>
							</div>
						{/each}
					</div>
				</div>

				<!-- Top Paid -->
				<div class="app-section">
					<div class="section-header">
						<h2 class="section-title">Top Paid Apps</h2>
						<button class="see-all-btn">See All</button>
					</div>
					<div class="app-scroll">
						{#each top_paid as app}
							<div class="app-card">
								<div class="app-icon" style:background={app.gradient}>
									<span class="app-icon-letter">{app.name[0]}</span>
								</div>
								<div class="app-name">{app.name}</div>
								<div class="app-category">{app.category}</div>
								<div class="app-meta">
									<span class="app-stars">{render_stars(app.rating)}</span>
									<span class="app-price">{app.price}</span>
								</div>
								<button class="get-btn">{app.price}</button>
							</div>
						{/each}
					</div>
				</div>

				<!-- Essential Apps -->
				<div class="app-section">
					<div class="section-header">
						<h2 class="section-title">Essential Apps</h2>
						<button class="see-all-btn">See All</button>
					</div>
					<div class="app-scroll">
						{#each essential_apps as app}
							<div class="app-card">
								<div class="app-icon" style:background={app.gradient}>
									<span class="app-icon-letter">{app.name[0]}</span>
								</div>
								<div class="app-name">{app.name}</div>
								<div class="app-category">{app.category}</div>
								<div class="app-meta">
									<span class="app-stars">{render_stars(app.rating)}</span>
									<span class="app-price">{app.price}</span>
								</div>
								<button class="get-btn">{app.price === 'Free' ? 'Get' : app.price}</button>
							</div>
						{/each}
					</div>
				</div>
			{:else if active_section === 'updates'}
				<div class="placeholder-view">
					<div class="placeholder-header">
						<h1 class="view-title">Updates</h1>
					</div>
					<div class="update-list">
						<div class="update-item">
							<div class="update-icon" style:background="linear-gradient(135deg, #007aff, #5856d6)">
								<span class="app-icon-letter">S</span>
							</div>
							<div class="update-info">
								<div class="update-name">Spark</div>
								<div class="update-detail">Bug fixes and performance improvements</div>
								<div class="update-size">42.3 MB</div>
							</div>
							<button class="get-btn">Update</button>
						</div>
						<div class="update-item">
							<div class="update-icon" style:background="linear-gradient(135deg, #34c759, #007aff)">
								<span class="app-icon-letter">T</span>
							</div>
							<div class="update-info">
								<div class="update-name">Transmit 5</div>
								<div class="update-detail">New S3 compatible storage support</div>
								<div class="update-size">28.1 MB</div>
							</div>
							<button class="get-btn">Update</button>
						</div>
						<div class="update-item">
							<div class="update-icon" style:background="linear-gradient(135deg, #ff6b6b, #ee5a24)">
								<span class="app-icon-letter">R</span>
							</div>
							<div class="update-info">
								<div class="update-name">Raycast</div>
								<div class="update-detail">Added clipboard history and window management</div>
								<div class="update-size">51.7 MB</div>
							</div>
							<button class="get-btn">Update</button>
						</div>
					</div>
				</div>
			{:else}
				<div class="placeholder-view">
					<div class="placeholder-header">
						<h1 class="view-title">{sidebar_sections.flatMap(s => s.items).find(i => i.id === active_section)?.label ?? active_section}</h1>
					</div>
					<div class="placeholder-content">
						<svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="#d1d1d6" stroke-width="2"><rect x="8" y="8" width="48" height="48" rx="10"/><path d="M22 32h20M32 22v20" stroke-linecap="round"/></svg>
						<p class="placeholder-text">Content for this section is coming soon.</p>
					</div>
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
		background-color: #f5f5f7;
		border-radius: inherit;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		font-family: var(--system-font-family);
		color: var(--system-color-light-contrast);

		:global(body.dark) & {
			background-color: #1c1c1e;
		}
	}

	/* ── Titlebar ── */
	.titlebar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 16px;
		min-height: 44px;
		background: linear-gradient(to bottom, #f6f6f6, #ececec);
		border-bottom: 1px solid #d1d1d6;
		flex-shrink: 0;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
			border-bottom-color: #1c1c1e;
		}
	}

	.titlebar-left {
		display: flex;
		gap: 4px;
	}

	.titlebar-center {
		flex: 1;
		max-width: 240px;
	}

	.titlebar-right {
		display: flex;
		align-items: center;
	}

	.nav-btn {
		padding: 4px 6px;
		background: none;
		border: none;
		color: #86868b;
		cursor: pointer;
		border-radius: 4px;
		display: flex;
		align-items: center;

		&:hover:not(:disabled) {
			background: rgba(0, 0, 0, 0.06);
		}

		&:disabled {
			opacity: 0.35;
			cursor: default;
		}
	}

	.search-box {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 5px 10px;
		background: rgba(0, 0, 0, 0.05);
		border-radius: 6px;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.08);
		}
	}

	.search-placeholder {
		font-size: 12px;
		color: #86868b;
	}

	.account-icon {
		cursor: pointer;
		opacity: 0.7;

		&:hover {
			opacity: 1;
		}
	}

	/* ── Main layout ── */
	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* ── Sidebar ── */
	.sidebar {
		width: 200px;
		min-width: 200px;
		background: #f2f2f7;
		border-right: 1px solid #d1d1d6;
		overflow-y: auto;
		padding: 8px 0;

		:global(body.dark) & {
			background: #2c2c2e;
			border-right-color: #38383a;
		}
	}

	.sidebar-header {
		font-size: 11px;
		font-weight: 600;
		color: #86868b;
		padding: 8px 16px 4px;
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.sidebar-divider {
		height: 1px;
		background: #d1d1d6;
		margin: 6px 12px;

		:global(body.dark) & {
			background: #38383a;
		}
	}

	.sidebar-item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: calc(100% - 8px);
		margin: 0 4px;
		padding: 6px 12px;
		border: none;
		background: none;
		cursor: pointer;
		border-radius: 6px;
		font-size: 13px;
		color: #1d1d1f;
		text-align: left;

		&.active {
			background: rgba(0, 122, 255, 0.12);
			color: #007aff;
		}

		&:hover:not(.active) {
			background: rgba(0, 0, 0, 0.04);
		}

		:global(body.dark) & {
			color: #e5e5ea;

			&.active {
				background: rgba(10, 132, 255, 0.2);
				color: #0a84ff;
			}

			&:hover:not(.active) {
				background: rgba(255, 255, 255, 0.06);
			}
		}
	}

	.sidebar-icon {
		display: flex;
		align-items: center;
		color: #6e6e73;

		:global(body.dark) & {
			color: #98989d;
		}
	}

	.sidebar-item.active .sidebar-icon {
		color: #007aff;

		:global(body.dark) & {
			color: #0a84ff;
		}
	}

	.sidebar-label {
		flex: 1;
	}

	.sidebar-badge {
		background: #ff3b30;
		color: white;
		font-size: 10px;
		font-weight: 700;
		min-width: 18px;
		height: 18px;
		border-radius: 9px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 5px;
	}

	/* ── Content area ── */
	.content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 0 0 20px;
	}

	/* ── Featured banner ── */
	.featured-banner {
		margin: 16px 20px 0;
		border-radius: 12px;
		overflow: hidden;
		min-height: 180px;
		display: flex;
		align-items: center;
	}

	.featured-content {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 24px 28px;
		width: 100%;
	}

	.featured-badge {
		position: absolute;
		font-size: 10px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.7);
		letter-spacing: 1.5px;
		margin-top: -80px;
	}

	.featured-icon {
		width: 64px;
		height: 64px;
		min-width: 64px;
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.featured-text {
		flex: 1;
	}

	.featured-name {
		font-size: 22px;
		font-weight: 700;
		color: white;
	}

	.featured-tagline {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.85);
		margin-top: 2px;
	}

	.featured-developer {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.6);
		margin-top: 4px;
	}

	.featured-get-btn {
		padding: 6px 20px;
		border-radius: 14px;
		border: none;
		background: rgba(255, 255, 255, 0.25);
		color: white;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		white-space: nowrap;
		backdrop-filter: blur(10px);

		&:hover {
			background: rgba(255, 255, 255, 0.35);
		}
	}

	/* ── App sections ── */
	.app-section {
		margin-top: 28px;
		padding: 0 20px;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 14px;
	}

	.section-title {
		font-size: 20px;
		font-weight: 700;
		color: #1d1d1f;
		margin: 0;

		:global(body.dark) & {
			color: #f5f5f7;
		}
	}

	.see-all-btn {
		font-size: 13px;
		color: #007aff;
		background: none;
		border: none;
		cursor: pointer;
		font-weight: 500;

		&:hover {
			text-decoration: underline;
		}

		:global(body.dark) & {
			color: #0a84ff;
		}
	}

	.app-scroll {
		display: flex;
		gap: 16px;
		overflow-x: auto;
		padding-bottom: 8px;
		scroll-snap-type: x mandatory;

		&::-webkit-scrollbar {
			height: 6px;
		}

		&::-webkit-scrollbar-thumb {
			background: #d1d1d6;
			border-radius: 3px;
		}

		&::-webkit-scrollbar-track {
			background: transparent;
		}
	}

	.app-card {
		min-width: 140px;
		max-width: 140px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		scroll-snap-align: start;
		cursor: pointer;

		&:hover .app-icon {
			transform: scale(1.05);
		}
	}

	.app-icon {
		width: 48px;
		height: 48px;
		border-radius: 11px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8px;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
		transition: transform 0.15s ease;
	}

	.app-icon-letter {
		font-size: 20px;
		font-weight: 700;
		color: white;
	}

	.app-name {
		font-size: 12px;
		font-weight: 600;
		color: #1d1d1f;
		line-height: 1.3;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;

		:global(body.dark) & {
			color: #f5f5f7;
		}
	}

	.app-category {
		font-size: 10px;
		color: #86868b;
		margin-top: 2px;
	}

	.app-meta {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		margin-top: 4px;
	}

	.app-stars {
		font-size: 10px;
		color: #ff9500;
		letter-spacing: 1px;
	}

	.app-price {
		font-size: 10px;
		color: #86868b;
	}

	.get-btn {
		margin-top: 6px;
		padding: 3px 14px;
		border-radius: 12px;
		border: none;
		background: rgba(0, 122, 255, 0.12);
		color: #007aff;
		font-size: 11px;
		font-weight: 700;
		cursor: pointer;
		white-space: nowrap;

		&:hover {
			background: rgba(0, 122, 255, 0.2);
		}

		:global(body.dark) & {
			background: rgba(10, 132, 255, 0.2);
			color: #0a84ff;

			&:hover {
				background: rgba(10, 132, 255, 0.3);
			}
		}
	}

	/* ── Updates view ── */
	.placeholder-view {
		padding: 0 20px;
	}

	.placeholder-header {
		padding-top: 20px;
		margin-bottom: 20px;
	}

	.view-title {
		font-size: 28px;
		font-weight: 700;
		color: #1d1d1f;
		margin: 0;

		:global(body.dark) & {
			color: #f5f5f7;
		}
	}

	.update-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.update-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 0;
		border-bottom: 1px solid #e5e5ea;

		:global(body.dark) & {
			border-bottom-color: #38383a;
		}
	}

	.update-icon {
		width: 48px;
		height: 48px;
		min-width: 48px;
		border-radius: 11px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
	}

	.update-info {
		flex: 1;
		min-width: 0;
	}

	.update-name {
		font-size: 13px;
		font-weight: 600;
		color: #1d1d1f;

		:global(body.dark) & {
			color: #f5f5f7;
		}
	}

	.update-detail {
		font-size: 11px;
		color: #86868b;
		margin-top: 2px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.update-size {
		font-size: 10px;
		color: #aeaeb2;
		margin-top: 2px;
	}

	/* ── Placeholder content ── */
	.placeholder-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 20px;
		gap: 16px;
	}

	.placeholder-text {
		font-size: 14px;
		color: #86868b;
		margin: 0;
	}
</style>
