<script lang="ts">
	type Podcast = {
		id: number;
		title: string;
		author: string;
		gradient: string;
		episodes: number;
		category: string;
	};

	type Episode = {
		id: number;
		podcast_id: number;
		title: string;
		duration: string;
		date: string;
	};

	let active_section = $state('listen-now');
	let is_playing = $state(false);

	const podcasts: Podcast[] = [
		{ id: 1, title: 'The Daily Brief', author: 'Global News Network', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', episodes: 892, category: 'News' },
		{ id: 2, title: 'Syntax FM', author: 'Wes Bos & Scott Tolinski', gradient: 'linear-gradient(135deg, #f6d365, #fda085)', episodes: 734, category: 'Technology' },
		{ id: 3, title: 'Casefile True Crime', author: 'Casefile Presents', gradient: 'linear-gradient(135deg, #1a1a2e, #e94560)', episodes: 312, category: 'True Crime' },
		{ id: 4, title: 'How I Built This', author: 'Guy Raz / NPR', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', episodes: 445, category: 'Business' },
		{ id: 5, title: 'Radiolab', author: 'WNYC Studios', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', episodes: 623, category: 'Science' },
		{ id: 6, title: 'Conan Needs a Friend', author: 'Team Coco', gradient: 'linear-gradient(135deg, #fa709a, #fee140)', episodes: 287, category: 'Comedy' },
		{ id: 7, title: 'Huberman Lab', author: 'Andrew Huberman', gradient: 'linear-gradient(135deg, #84fab0, #8fd3f4)', episodes: 198, category: 'Health' },
		{ id: 8, title: 'Design Matters', author: 'Debbie Millman', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', episodes: 456, category: 'Design' },
		{ id: 9, title: 'Hardcore History', author: 'Dan Carlin', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', episodes: 78, category: 'History' },
		{ id: 10, title: 'The Vergecast', author: 'The Verge', gradient: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)', episodes: 534, category: 'Technology' },
		{ id: 11, title: 'Planet Money', author: 'NPR', gradient: 'linear-gradient(135deg, #fccb90, #d57eeb)', episodes: 812, category: 'Business' },
		{ id: 12, title: 'Darknet Diaries', author: 'Jack Rhysider', gradient: 'linear-gradient(135deg, #0c3483, #a2b6df)', episodes: 167, category: 'Technology' },
		{ id: 13, title: 'On Purpose', author: 'Jay Shetty', gradient: 'linear-gradient(135deg, #96fbc4, #f9f586)', episodes: 389, category: 'Health' },
		{ id: 14, title: 'Freakonomics Radio', author: 'Freakonomics Network', gradient: 'linear-gradient(135deg, #f5576c, #ff6b6b)', episodes: 567, category: 'Society' },
		{ id: 15, title: 'SmartLess', author: 'Bateman, Arnett, Hayes', gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)', episodes: 213, category: 'Comedy' },
	];

	const episodes: Episode[] = [
		{ id: 1, podcast_id: 1, title: 'Global Markets React to Policy Shift', duration: '24 min', date: 'Today' },
		{ id: 2, podcast_id: 2, title: 'TypeScript 6.0 Deep Dive', duration: '1 hr 12 min', date: 'Today' },
		{ id: 3, podcast_id: 3, title: 'Case 298: The Missing Heiress', duration: '58 min', date: 'Yesterday' },
		{ id: 4, podcast_id: 4, title: 'Stripe: Building Global Payments', duration: '42 min', date: 'Yesterday' },
		{ id: 5, podcast_id: 5, title: 'The Expanding Universe of Sound', duration: '51 min', date: '2 days ago' },
		{ id: 6, podcast_id: 6, title: 'Paul Rudd Returns', duration: '1 hr 5 min', date: '2 days ago' },
		{ id: 7, podcast_id: 7, title: 'Sleep Optimization Protocols', duration: '2 hr 8 min', date: '3 days ago' },
		{ id: 8, podcast_id: 8, title: 'Jony Ive on Simplicity', duration: '48 min', date: '3 days ago' },
	];

	let current_podcast = $state(podcasts[0]);
	let current_episode = $state(episodes[0]);

	const recently_played = $derived(podcasts.slice(0, 6));
	const recommended = $derived(podcasts.slice(6, 12));
	const recent_episodes = $derived(episodes.slice(0, 8));

	const top_charts = $derived(
		[...podcasts].sort((a, b) => b.episodes - a.episodes)
	);

	const displayed_content = $derived.by(() => {
		if (active_section === 'browse') return podcasts;
		if (active_section === 'top-charts') return top_charts;
		if (active_section === 'shows') return podcasts.slice(0, 8);
		if (active_section === 'downloaded') return podcasts.slice(2, 5);
		return [];
	});

	const view_title = $derived.by(() => {
		if (active_section === 'listen-now') return 'Listen Now';
		if (active_section === 'browse') return 'Browse';
		if (active_section === 'top-charts') return 'Top Charts';
		if (active_section === 'shows') return 'Shows';
		if (active_section === 'episodes') return 'Episodes';
		if (active_section === 'downloaded') return 'Downloaded';
		if (active_section === 'stations') return 'Stations';
		return 'Listen Now';
	});

	function play_podcast(podcast: Podcast) {
		current_podcast = podcast;
		const ep = episodes.find(e => e.podcast_id === podcast.id);
		if (ep) current_episode = ep;
		is_playing = true;
	}

	function play_episode(episode: Episode) {
		current_episode = episode;
		const podcast = podcasts.find(p => p.id === episode.podcast_id);
		if (podcast) current_podcast = podcast;
		is_playing = true;
	}
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar">
		<div class="titlebar-text">Podcasts</div>
	</header>

	<div class="main">
		<aside class="sidebar">
			<div class="sidebar-section">
				<button
					class="sidebar-item"
					class:active={active_section === 'listen-now'}
					onclick={() => active_section = 'listen-now'}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
					</span>
					Listen Now
				</button>
				<button
					class="sidebar-item"
					class:active={active_section === 'browse'}
					onclick={() => active_section = 'browse'}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>
					</span>
					Browse
				</button>
				<button
					class="sidebar-item"
					class:active={active_section === 'top-charts'}
					onclick={() => active_section = 'top-charts'}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
					</span>
					Top Charts
				</button>
			</div>

			<div class="sidebar-section">
				<div class="sidebar-section-title">Library</div>
				<button
					class="sidebar-item"
					class:active={active_section === 'shows'}
					onclick={() => active_section = 'shows'}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
					</span>
					Shows
				</button>
				<button
					class="sidebar-item"
					class:active={active_section === 'episodes'}
					onclick={() => active_section = 'episodes'}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
					</span>
					Episodes
				</button>
				<button
					class="sidebar-item"
					class:active={active_section === 'downloaded'}
					onclick={() => active_section = 'downloaded'}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
					</span>
					Downloaded
				</button>
				<button
					class="sidebar-item"
					class:active={active_section === 'stations'}
					onclick={() => active_section = 'stations'}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8c0-1.1-.9-2-2-2H8.3l8.26-3.34L15.88 1 3.24 6.15zM7 20c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>
					</span>
					Stations
				</button>
			</div>
		</aside>

		<div class="content">
			{#if active_section === 'listen-now'}
				<div class="content-header">
					<h1>Listen Now</h1>
				</div>

				<div class="subsection">
					<h3 class="subsection-title">Recently Played</h3>
					<div class="podcast-grid">
						{#each recently_played as podcast}
							<button class="podcast-card" onclick={() => play_podcast(podcast)}>
								<div class="podcast-art" style:background={podcast.gradient}>
									<span class="podcast-initial">{podcast.title.charAt(0)}</span>
								</div>
								<div class="podcast-title">{podcast.title}</div>
								<div class="podcast-author">{podcast.author}</div>
							</button>
						{/each}
					</div>
				</div>

				<div class="subsection">
					<h3 class="subsection-title">You Might Like</h3>
					<div class="podcast-grid">
						{#each recommended as podcast}
							<button class="podcast-card" onclick={() => play_podcast(podcast)}>
								<div class="podcast-art" style:background={podcast.gradient}>
									<span class="podcast-initial">{podcast.title.charAt(0)}</span>
								</div>
								<div class="podcast-title">{podcast.title}</div>
								<div class="podcast-author">{podcast.author}</div>
							</button>
						{/each}
					</div>
				</div>

				<div class="subsection">
					<h3 class="subsection-title">Latest Episodes</h3>
					<div class="episodes-list">
						{#each recent_episodes as episode}
							{@const podcast = podcasts.find(p => p.id === episode.podcast_id)}
							<button class="episode-row" onclick={() => play_episode(episode)}>
								<div class="episode-art" style:background={podcast?.gradient ?? 'linear-gradient(135deg, #ccc, #999)'}>
									<span>{podcast?.title.charAt(0) ?? '?'}</span>
								</div>
								<div class="episode-info">
									<div class="episode-title">{episode.title}</div>
									<div class="episode-meta">{podcast?.title ?? 'Unknown'} &middot; {episode.duration}</div>
								</div>
								<div class="episode-date">{episode.date}</div>
							</button>
						{/each}
					</div>
				</div>

			{:else if active_section === 'episodes'}
				<div class="content-header">
					<h1>Episodes</h1>
				</div>
				<div class="episodes-list">
					{#each episodes as episode}
						{@const podcast = podcasts.find(p => p.id === episode.podcast_id)}
						<button class="episode-row" onclick={() => play_episode(episode)}>
							<div class="episode-art" style:background={podcast?.gradient ?? 'linear-gradient(135deg, #ccc, #999)'}>
								<span>{podcast?.title.charAt(0) ?? '?'}</span>
							</div>
							<div class="episode-info">
								<div class="episode-title">{episode.title}</div>
								<div class="episode-meta">{podcast?.title ?? 'Unknown'} &middot; {episode.duration}</div>
							</div>
							<div class="episode-date">{episode.date}</div>
						</button>
					{/each}
				</div>

			{:else if active_section === 'stations'}
				<div class="content-header">
					<h1>Stations</h1>
				</div>
				<div class="empty-state">
					<p>Create a station from your favorite podcasts to listen to a curated mix of episodes.</p>
				</div>

			{:else}
				<div class="content-header">
					<h1>{view_title}</h1>
				</div>
				{#if active_section === 'top-charts'}
					<div class="charts-list">
						{#each displayed_content as podcast, i}
							<button class="chart-row" onclick={() => play_podcast(podcast)}>
								<span class="chart-rank">{i + 1}</span>
								<div class="chart-art" style:background={podcast.gradient}>
									<span>{podcast.title.charAt(0)}</span>
								</div>
								<div class="chart-info">
									<div class="chart-title">{podcast.title}</div>
									<div class="chart-author">{podcast.author}</div>
								</div>
								<span class="chart-category">{podcast.category}</span>
							</button>
						{/each}
					</div>
				{:else}
					<div class="podcast-grid">
						{#each displayed_content as podcast}
							<button class="podcast-card" onclick={() => play_podcast(podcast)}>
								<div class="podcast-art" style:background={podcast.gradient}>
									<span class="podcast-initial">{podcast.title.charAt(0)}</span>
								</div>
								<div class="podcast-title">{podcast.title}</div>
								<div class="podcast-author">{podcast.author}</div>
							</button>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	</div>

	<div class="now-playing">
		<div class="np-info">
			<div class="np-art" style:background={current_podcast.gradient}>
				<span>{current_podcast.title.charAt(0)}</span>
			</div>
			<div class="np-details">
				<div class="np-title">{current_episode.title}</div>
				<div class="np-podcast">{current_podcast.title}</div>
			</div>
		</div>
		<div class="np-controls">
			<button class="np-btn" onclick={() => {}}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
			</button>
			<button class="np-btn rewind-btn" onclick={() => {}}>
				<span class="skip-label">15</span>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
			</button>
			<button class="np-btn play-btn" onclick={() => is_playing = !is_playing}>
				{#if is_playing}
					<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
				{:else}
					<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
				{/if}
			</button>
			<button class="np-btn forward-btn" onclick={() => {}}>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="transform: scaleX(-1)"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
				<span class="skip-label">30</span>
			</button>
			<button class="np-btn" onclick={() => {}}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
			</button>
		</div>
		<div class="np-progress">
			<div class="progress-bar">
				<div class="progress-fill" style:width="35%"></div>
			</div>
			<div class="progress-times">
				<span>18:42</span>
				<span>-34:16</span>
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
		color: var(--system-color-light-contrast);
		font-size: 13px;

		:global(body.dark) & {
			background-color: #1c1c1e;
		}
	}

	.titlebar {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 8px 12px;
		min-height: 42px;
		background: linear-gradient(to bottom, #f6f6f6, #ededef);
		border-bottom: 1px solid #d1d1d6;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
			border-bottom-color: #1c1c1e;
		}
	}

	.titlebar-text {
		font-size: 13px;
		font-weight: 600;
		color: var(--system-color-light-contrast);
	}

	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.sidebar {
		width: 200px;
		min-width: 200px;
		background: #f2f2f7;
		border-right: 1px solid #d1d1d6;
		padding: 8px 0;
		display: flex;
		flex-direction: column;
		overflow-y: auto;

		:global(body.dark) & {
			background: #1c1c1e;
			border-right-color: #38383a;
		}
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
		gap: 8px;
		width: calc(100% - 8px);
		margin: 0 4px;
		padding: 3px 6px;
		border: none;
		background: none;
		font-size: 13px;
		color: var(--system-color-light-contrast);
		cursor: pointer;
		text-align: left;
		border-radius: 6px;
		transition: background 0.1s;
		height: 28px;
		box-sizing: border-box;

		&:hover {
			background: rgba(0, 0, 0, 0.04);

			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.06);
			}
		}

		&.active {
			background: #8e44ad;
			color: white;
			font-weight: 500;

			:global(body.dark) & {
				background: #8e44ad;
			}
		}
	}

	.sidebar-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	.content {
		flex: 1;
		overflow-y: auto;
		padding: 16px 20px;
	}

	.content-header h1 {
		font-size: 24px;
		font-weight: 700;
		margin: 0 0 16px;
	}

	.subsection {
		margin-bottom: 28px;
	}

	.subsection-title {
		font-size: 18px;
		font-weight: 700;
		margin: 0 0 14px;
	}

	.podcast-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		gap: 16px;
	}

	.podcast-card {
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		display: flex;
		flex-direction: column;
		transition: transform 0.15s;

		&:hover {
			transform: translateY(-2px);
		}
	}

	.podcast-art {
		aspect-ratio: 1;
		border-radius: 12px;
		margin-bottom: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.podcast-initial {
		font-size: 36px;
		font-weight: 800;
		color: rgba(255, 255, 255, 0.9);
	}

	.podcast-title {
		font-size: 13px;
		font-weight: 600;
		color: var(--system-color-light-contrast);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.podcast-author {
		font-size: 12px;
		color: #86868b;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.episodes-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.episode-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 10px;
		border: none;
		background: none;
		border-radius: 8px;
		cursor: pointer;
		text-align: left;
		width: 100%;
		box-sizing: border-box;

		&:hover {
			background: rgba(0, 0, 0, 0.04);

			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.06);
			}
		}
	}

	.episode-art {
		width: 44px;
		height: 44px;
		border-radius: 8px;
		flex-shrink: 0;
		display: flex;
		justify-content: center;
		align-items: center;

		span {
			font-size: 18px;
			font-weight: 800;
			color: rgba(255, 255, 255, 0.9);
		}
	}

	.episode-info {
		flex: 1;
		min-width: 0;
	}

	.episode-title {
		font-size: 13px;
		font-weight: 600;
		color: var(--system-color-light-contrast);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.episode-meta {
		font-size: 12px;
		color: #86868b;
	}

	.episode-date {
		font-size: 11px;
		color: #86868b;
		flex-shrink: 0;
	}

	.charts-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.chart-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 10px;
		border: none;
		background: none;
		border-radius: 8px;
		cursor: pointer;
		text-align: left;
		width: 100%;
		box-sizing: border-box;

		&:hover {
			background: rgba(0, 0, 0, 0.04);

			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.06);
			}
		}
	}

	.chart-rank {
		font-size: 18px;
		font-weight: 700;
		color: #86868b;
		width: 28px;
		text-align: center;
		flex-shrink: 0;
	}

	.chart-art {
		width: 52px;
		height: 52px;
		border-radius: 10px;
		flex-shrink: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

		span {
			font-size: 22px;
			font-weight: 800;
			color: rgba(255, 255, 255, 0.9);
		}
	}

	.chart-info {
		flex: 1;
		min-width: 0;
	}

	.chart-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--system-color-light-contrast);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chart-author {
		font-size: 12px;
		color: #86868b;
	}

	.chart-category {
		font-size: 11px;
		font-weight: 500;
		color: #8e44ad;
		background: rgba(142, 68, 173, 0.1);
		padding: 2px 8px;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.empty-state {
		text-align: center;
		padding: 40px 20px;
		color: #86868b;
		font-size: 14px;
	}

	.now-playing {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 8px 16px;
		height: 60px;
		background: #f9f9f9;
		border-top: 1px solid #d1d1d6;
		flex-shrink: 0;

		:global(body.dark) & {
			background: #2c2c2e;
			border-top-color: #38383a;
		}
	}

	.np-info {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 200px;
		flex-shrink: 0;
	}

	.np-art {
		width: 40px;
		height: 40px;
		border-radius: 8px;
		flex-shrink: 0;
		display: flex;
		justify-content: center;
		align-items: center;

		span {
			font-size: 18px;
			font-weight: 800;
			color: rgba(255, 255, 255, 0.9);
		}
	}

	.np-details {
		min-width: 0;
	}

	.np-title {
		font-size: 12px;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.np-podcast {
		font-size: 11px;
		color: #86868b;
	}

	.np-controls {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.np-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--system-color-light-contrast);
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;

		&:hover {
			opacity: 0.7;
		}
	}

	.play-btn {
		width: 36px;
		height: 36px;
	}

	.rewind-btn,
	.forward-btn {
		position: relative;
		display: flex;
		align-items: center;
		gap: 1px;
	}

	.skip-label {
		font-size: 9px;
		font-weight: 700;
	}

	.np-progress {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.progress-bar {
		width: 100%;
		height: 4px;
		background: rgba(0, 0, 0, 0.1);
		border-radius: 2px;
		overflow: hidden;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.1);
		}
	}

	.progress-fill {
		height: 100%;
		background: #8e44ad;
		border-radius: 2px;
	}

	.progress-times {
		display: flex;
		justify-content: space-between;
		font-size: 10px;
		color: #86868b;
	}
</style>
