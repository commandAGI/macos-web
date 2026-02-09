<script lang="ts">
	type Show = {
		id: number;
		name: string;
		gradient: string;
		genre: string;
		year: number;
		type: 'movie' | 'series';
	};

	let active_section = $state('watch-now');

	const hero = {
		title: 'Severance',
		subtitle: 'Season 2 Now Streaming',
		description: 'Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.',
		gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
		badge: 'APPLE TV+ ORIGINAL',
	};

	const shows: Show[] = [
		{ id: 1, name: 'Cosmic Wanderers', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', genre: 'Sci-Fi', year: 2025, type: 'series' },
		{ id: 2, name: 'The Iron Coast', gradient: 'linear-gradient(135deg, #2c3e50, #3498db)', genre: 'Drama', year: 2025, type: 'series' },
		{ id: 3, name: 'Neon Pulse', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', genre: 'Action', year: 2024, type: 'movie' },
		{ id: 4, name: 'Midnight Garden', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', genre: 'Mystery', year: 2025, type: 'series' },
		{ id: 5, name: 'Frozen Horizon', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', genre: 'Thriller', year: 2024, type: 'movie' },
		{ id: 6, name: 'Desert Kings', gradient: 'linear-gradient(135deg, #f6d365, #fda085)', genre: 'Adventure', year: 2025, type: 'series' },
		{ id: 7, name: 'Glass City', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', genre: 'Drama', year: 2024, type: 'movie' },
		{ id: 8, name: 'Signal Lost', gradient: 'linear-gradient(135deg, #1a1a2e, #e94560)', genre: 'Sci-Fi', year: 2025, type: 'series' },
		{ id: 9, name: 'The Last Ember', gradient: 'linear-gradient(135deg, #fa709a, #fee140)', genre: 'Fantasy', year: 2024, type: 'movie' },
		{ id: 10, name: 'Deep Current', gradient: 'linear-gradient(135deg, #84fab0, #8fd3f4)', genre: 'Thriller', year: 2025, type: 'series' },
		{ id: 11, name: 'Rust Valley', gradient: 'linear-gradient(135deg, #fccb90, #d57eeb)', genre: 'Western', year: 2024, type: 'movie' },
		{ id: 12, name: 'Echo Chamber', gradient: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)', genre: 'Drama', year: 2025, type: 'series' },
		{ id: 13, name: 'Shadow Protocol', gradient: 'linear-gradient(135deg, #0c3483, #a2b6df)', genre: 'Action', year: 2024, type: 'movie' },
		{ id: 14, name: 'Wildflower', gradient: 'linear-gradient(135deg, #96fbc4, #f9f586)', genre: 'Romance', year: 2025, type: 'movie' },
		{ id: 15, name: 'Binary Star', gradient: 'linear-gradient(135deg, #7f7fd5, #86a8e7)', genre: 'Sci-Fi', year: 2025, type: 'series' },
		{ id: 16, name: 'Crimson Peak', gradient: 'linear-gradient(135deg, #f5576c, #ff6b6b)', genre: 'Horror', year: 2024, type: 'movie' },
		{ id: 17, name: 'Paper Trail', gradient: 'linear-gradient(135deg, #c471f5, #fa71cd)', genre: 'Crime', year: 2025, type: 'series' },
		{ id: 18, name: 'Starfall', gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)', genre: 'Sci-Fi', year: 2024, type: 'movie' },
		{ id: 19, name: 'The Clearing', gradient: 'linear-gradient(135deg, #f12711, #f5af19)', genre: 'Mystery', year: 2025, type: 'series' },
		{ id: 20, name: 'Stone Bridge', gradient: 'linear-gradient(135deg, #636e72, #b2bec3)', genre: 'Drama', year: 2024, type: 'movie' },
		{ id: 21, name: 'Aurora', gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)', genre: 'Fantasy', year: 2025, type: 'series' },
		{ id: 22, name: 'Voltage', gradient: 'linear-gradient(135deg, #d4fc79, #96e6a1)', genre: 'Action', year: 2024, type: 'movie' },
	];

	const up_next = $derived(shows.slice(0, 6));
	const trending = $derived(shows.slice(6, 12));
	const new_releases = $derived(shows.filter(s => s.year === 2025).slice(0, 6));
	const popular_movies = $derived(shows.filter(s => s.type === 'movie').slice(0, 6));
	const originals = $derived(shows.filter(s => s.type === 'series'));
	const all_movies = $derived(shows.filter(s => s.type === 'movie'));
	const all_series = $derived(shows.filter(s => s.type === 'series'));

	const content_rows = $derived.by(() => {
		if (active_section === 'watch-now') {
			return [
				{ title: 'Up Next', items: up_next },
				{ title: 'Trending', items: trending },
				{ title: 'New Releases', items: new_releases },
				{ title: 'Popular Movies', items: popular_movies },
			];
		}
		if (active_section === 'originals') {
			return [
				{ title: 'Apple TV+ Originals', items: originals },
			];
		}
		if (active_section === 'store') {
			return [
				{ title: 'Featured', items: shows.slice(0, 6) },
				{ title: 'New & Noteworthy', items: shows.slice(8, 14) },
			];
		}
		if (active_section === 'movies') {
			return [
				{ title: 'All Movies', items: all_movies },
			];
		}
		if (active_section === 'tv-shows') {
			return [
				{ title: 'All TV Shows', items: all_series },
			];
		}
		if (active_section === 'genres') {
			const genres = [...new Set(shows.map(s => s.genre))];
			return genres.slice(0, 4).map(genre => ({
				title: genre,
				items: shows.filter(s => s.genre === genre),
			}));
		}
		return [];
	});

	const show_hero = $derived(active_section === 'watch-now');

	const view_title = $derived.by(() => {
		if (active_section === 'watch-now') return 'Watch Now';
		if (active_section === 'originals') return 'Originals';
		if (active_section === 'mls') return 'MLS Season Pass';
		if (active_section === 'store') return 'Store';
		if (active_section === 'movies') return 'Movies';
		if (active_section === 'tv-shows') return 'TV Shows';
		if (active_section === 'genres') return 'Genres';
		return 'Watch Now';
	});
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar"></header>

	<div class="main">
		<aside class="sidebar">
			<div class="sidebar-section">
				<button
					class="sidebar-item"
					class:active={active_section === 'watch-now'}
					onclick={() => active_section = 'watch-now'}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/></svg>
					</span>
					Watch Now
				</button>
				<button
					class="sidebar-item"
					class:active={active_section === 'originals'}
					onclick={() => active_section = 'originals'}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>
					</span>
					Originals
				</button>
				<button
					class="sidebar-item"
					class:active={active_section === 'mls'}
					onclick={() => active_section = 'mls'}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
					</span>
					MLS Season Pass
				</button>
				<button
					class="sidebar-item"
					class:active={active_section === 'store'}
					onclick={() => active_section = 'store'}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4v2l1 1v13h2v-5h4v5h8V7l1-1V4zm-6 10h-2v-2h2v2zm4 0h-2v-2h2v2zm0-4h-2V8h2v2zm-4 0h-2V8h2v2z"/></svg>
					</span>
					Store
				</button>
			</div>

			<div class="sidebar-section">
				<div class="sidebar-section-title">Library</div>
				<button
					class="sidebar-item"
					class:active={active_section === 'movies'}
					onclick={() => active_section = 'movies'}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>
					</span>
					Movies
				</button>
				<button
					class="sidebar-item"
					class:active={active_section === 'tv-shows'}
					onclick={() => active_section = 'tv-shows'}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/></svg>
					</span>
					TV Shows
				</button>
				<button
					class="sidebar-item"
					class:active={active_section === 'genres'}
					onclick={() => active_section = 'genres'}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>
					</span>
					Genres
				</button>
			</div>
		</aside>

		<div class="content">
			{#if show_hero}
				<div class="hero-banner" style:background={hero.gradient}>
					<div class="hero-overlay"></div>
					<div class="hero-content">
						<div class="hero-badge">{hero.badge}</div>
						<h1 class="hero-title">{hero.title}</h1>
						<p class="hero-subtitle">{hero.subtitle}</p>
						<p class="hero-description">{hero.description}</p>
						<div class="hero-actions">
							<button class="play-btn">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
								Play
							</button>
							<button class="info-btn">More Info</button>
						</div>
					</div>
				</div>
			{:else if active_section === 'mls'}
				<div class="mls-hero" style:background="linear-gradient(135deg, #1a472a, #2d6a4f)">
					<div class="hero-content">
						<div class="hero-badge">MLS SEASON PASS</div>
						<h1 class="hero-title">Major League Soccer</h1>
						<p class="hero-subtitle">Every match, live and on demand</p>
						<div class="hero-actions">
							<button class="play-btn">Subscribe</button>
						</div>
					</div>
				</div>
			{:else}
				<div class="content-header">
					<h1>{view_title}</h1>
				</div>
			{/if}

			{#each content_rows as row}
				<div class="content-row">
					<h3 class="row-title">{row.title}</h3>
					<div class="row-scroll">
						<div class="row-items">
							{#each row.items as item}
								<button class="content-card">
									<div class="card-image" style:background={item.gradient}>
										<div class="card-overlay">
											<span class="card-title">{item.name}</span>
										</div>
									</div>
									<div class="card-meta">
										<span class="card-genre">{item.genre}</span>
										<span class="card-year">{item.year}</span>
									</div>
								</button>
							{/each}
						</div>
					</div>
				</div>
			{/each}

			{#if active_section === 'mls' && content_rows.length === 0}
				<div class="content-row">
					<h3 class="row-title">Upcoming Matches</h3>
					<div class="empty-state">
						<p>Subscribe to MLS Season Pass to watch every match live.</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.container {
		height: 100%;
		width: 100%;
		background-color: #1c1c1e;
		border-radius: inherit;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		font-family: var(--system-font-family);
		color: white;
	}

	.titlebar {
		padding: 12px;
		min-height: 36px;
		background: rgba(28, 28, 30, 0.95);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.sidebar {
		width: 200px;
		min-width: 200px;
		background: #2c2c2e;
		border-right: 1px solid rgba(255, 255, 255, 0.06);
		padding: 8px 0;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	.sidebar-section {
		margin-bottom: 4px;
	}

	.sidebar-section-title {
		font-size: 11px;
		font-weight: 600;
		color: #86868b;
		padding: 10px 16px 4px;
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.sidebar-item {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 8px;
		width: calc(100% - 8px);
		margin: 0 4px;
		padding: 3px 12px;
		border: none;
		background: none;
		font-size: 13px;
		color: rgba(255, 255, 255, 0.85);
		cursor: pointer;
		text-align: left;
		border-radius: 6px;
		transition: background 0.1s;
		height: 28px;
		box-sizing: border-box;

		&:hover {
			background: rgba(255, 255, 255, 0.06);
		}

		&.active {
			background: rgba(255, 255, 255, 0.12);
			color: white;
			font-weight: 500;
		}
	}

	.sidebar-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		flex-shrink: 0;
		opacity: 0.8;
	}

	.content {
		flex: 1;
		overflow-y: auto;
	}

	.content-header {
		padding: 20px 20px 0;

		h1 {
			font-size: 28px;
			font-weight: 700;
			margin: 0 0 8px;
		}
	}

	.hero-banner {
		height: 280px;
		position: relative;
		display: flex;
		align-items: flex-end;
		padding: 28px;
		overflow: hidden;
	}

	.hero-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 60%);
	}

	.mls-hero {
		height: 200px;
		position: relative;
		display: flex;
		align-items: flex-end;
		padding: 28px;
	}

	.hero-content {
		z-index: 1;
		max-width: 480px;
	}

	.hero-badge {
		font-size: 10px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.6);
		letter-spacing: 1.5px;
		margin-bottom: 6px;
	}

	.hero-title {
		font-size: 36px;
		font-weight: 700;
		margin: 0 0 4px;
		line-height: 1.1;
	}

	.hero-subtitle {
		font-size: 15px;
		color: rgba(255, 255, 255, 0.8);
		margin: 0 0 6px;
	}

	.hero-description {
		font-size: 13px;
		color: rgba(255, 255, 255, 0.55);
		margin: 0 0 14px;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.hero-actions {
		display: flex;
		gap: 8px;
	}

	.play-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 22px;
		background: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		color: #1c1c1e;
		cursor: pointer;
		transition: background 0.15s;

		&:hover {
			background: #e5e5ea;
		}
	}

	.info-btn {
		padding: 8px 22px;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		color: white;
		cursor: pointer;
		transition: background 0.15s;

		&:hover {
			background: rgba(255, 255, 255, 0.22);
		}
	}

	.content-row {
		padding: 20px 20px 8px;
	}

	.row-title {
		font-size: 18px;
		font-weight: 700;
		margin: 0 0 12px;
	}

	.row-scroll {
		overflow-x: auto;
		margin: 0 -20px;
		padding: 0 20px;

		&::-webkit-scrollbar {
			height: 0;
		}
	}

	.row-items {
		display: flex;
		gap: 12px;
		padding-bottom: 8px;
	}

	.content-card {
		flex-shrink: 0;
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		transition: transform 0.15s;

		&:hover {
			transform: translateY(-3px);

			.card-image {
				box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
			}
		}
	}

	.card-image {
		width: 175px;
		height: 100px;
		border-radius: 8px;
		position: relative;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		transition: box-shadow 0.15s;
	}

	.card-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, transparent 50%);
		display: flex;
		align-items: flex-end;
		padding: 8px 10px;
	}

	.card-title {
		font-size: 12px;
		font-weight: 600;
		color: white;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
	}

	.card-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 6px;
	}

	.card-genre {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.6);
		background: rgba(255, 255, 255, 0.1);
		padding: 1px 6px;
		border-radius: 3px;
	}

	.card-year {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.45);
	}

	.empty-state {
		text-align: center;
		padding: 40px 20px;
		color: rgba(255, 255, 255, 0.45);
		font-size: 14px;
	}
</style>
