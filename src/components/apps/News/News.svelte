<script lang="ts">
	let active_section = $state('for-you');
	let active_channel = $state<string | null>(null);

	type Article = {
		id: number;
		title: string;
		source: string;
		time: string;
		category: string;
		gradient: string;
		featured: boolean;
		saved: boolean;
	};

	const channels = [
		{ id: 'apple-news', label: 'Apple News', color: '#fa2d48' },
		{ id: 'reuters', label: 'Reuters', color: '#ff8200' },
		{ id: 'bloomberg', label: 'Bloomberg', color: '#472a91' },
		{ id: 'techcrunch', label: 'TechCrunch', color: '#0a9e1a' },
		{ id: 'the-verge', label: 'The Verge', color: '#e8503a' },
		{ id: 'wired', label: 'Wired', color: '#1a1a1a' },
	];

	const articles: Article[] = $state([
		{ id: 1, title: 'Apple Unveils Next-Gen M5 Chip With Breakthrough Neural Engine', source: 'TechCrunch', time: '14m ago', category: 'Technology', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', featured: true, saved: false },
		{ id: 2, title: 'Federal Reserve Signals Potential Rate Cut Amid Cooling Inflation', source: 'Bloomberg', time: '32m ago', category: 'Business', gradient: 'linear-gradient(135deg, #f6d365, #fda085)', featured: true, saved: false },
		{ id: 3, title: 'SpaceX Starship Completes First Orbital Refueling Test', source: 'Reuters', time: '1h ago', category: 'Science', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', featured: false, saved: false },
		{ id: 4, title: 'New Study Links Ultra-Processed Foods to Accelerated Cognitive Decline', source: 'Apple News', time: '1h ago', category: 'Health', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', featured: false, saved: false },
		{ id: 5, title: 'OpenAI Announces GPT-5 With Real-Time Multimodal Reasoning', source: 'The Verge', time: '2h ago', category: 'Technology', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', featured: false, saved: false },
		{ id: 6, title: 'Global EV Sales Surpass Combustion Vehicles for First Time', source: 'Reuters', time: '2h ago', category: 'Business', gradient: 'linear-gradient(135deg, #84fab0, #8fd3f4)', featured: false, saved: false },
		{ id: 7, title: 'Record-Breaking Heat Wave Grips Southern Europe for Third Week', source: 'Apple News', time: '3h ago', category: 'Environment', gradient: 'linear-gradient(135deg, #fa709a, #fee140)', featured: false, saved: false },
		{ id: 8, title: 'Microsoft Acquires Leading Robotics Startup for $4.2 Billion', source: 'Bloomberg', time: '3h ago', category: 'Technology', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', featured: false, saved: false },
		{ id: 9, title: 'Champions League Final Draws 800 Million Viewers Worldwide', source: 'Apple News', time: '4h ago', category: 'Sports', gradient: 'linear-gradient(135deg, #fccb90, #d57eeb)', featured: false, saved: false },
		{ id: 10, title: 'NASA Confirms Water Ice Deposits in Permanently Shadowed Lunar Craters', source: 'Wired', time: '4h ago', category: 'Science', gradient: 'linear-gradient(135deg, #0c3483, #a2b6df)', featured: false, saved: false },
		{ id: 11, title: 'Senate Passes Landmark Digital Privacy Protection Act', source: 'Reuters', time: '5h ago', category: 'Politics', gradient: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)', featured: false, saved: false },
		{ id: 12, title: 'Indie Film "Meridian" Sweeps Cannes With Four Awards', source: 'Apple News', time: '5h ago', category: 'Entertainment', gradient: 'linear-gradient(135deg, #f5576c, #ff6b6b)', featured: false, saved: false },
		{ id: 13, title: 'Autonomous Delivery Drones Get FAA Approval for Urban Routes', source: 'TechCrunch', time: '6h ago', category: 'Technology', gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)', featured: false, saved: false },
		{ id: 14, title: 'CRISPR Gene Therapy Shows Promise in Treating Sickle Cell Disease', source: 'Wired', time: '6h ago', category: 'Health', gradient: 'linear-gradient(135deg, #96fbc4, #f9f586)', featured: false, saved: false },
		{ id: 15, title: 'Major Banks Report Record Profits in Q4 Earnings Season', source: 'Bloomberg', time: '7h ago', category: 'Business', gradient: 'linear-gradient(135deg, #2c3e50, #4ca1af)', featured: false, saved: false },
		{ id: 16, title: 'Quantum Internet Breakthrough: First Long-Distance Entanglement Network', source: 'The Verge', time: '7h ago', category: 'Science', gradient: 'linear-gradient(135deg, #7f7fd5, #86a8e7)', featured: false, saved: false },
		{ id: 17, title: 'World Cup 2026 Host Cities Announce Stadium Renovation Plans', source: 'Reuters', time: '8h ago', category: 'Sports', gradient: 'linear-gradient(135deg, #f12711, #f5af19)', featured: false, saved: false },
		{ id: 18, title: 'Streaming Wars Heat Up as Netflix Launches Live Sports Tier', source: 'The Verge', time: '8h ago', category: 'Entertainment', gradient: 'linear-gradient(135deg, #c471f5, #fa71cd)', featured: false, saved: false },
	]);

	const featured_articles = $derived(articles.filter(a => a.featured));

	const displayed_articles = $derived.by(() => {
		if (active_section === 'saved') {
			return articles.filter(a => a.saved);
		}
		if (active_section === 'trending') {
			return articles.filter(a => !a.featured).slice(0, 8);
		}
		if (active_section === 'top-stories') {
			return articles.filter(a => !a.featured).slice(0, 10);
		}
		if (active_channel) {
			const ch = channels.find(c => c.id === active_channel);
			if (ch) return articles.filter(a => a.source === ch.label);
		}
		return articles.filter(a => !a.featured);
	});

	const view_title = $derived.by(() => {
		if (active_section === 'saved') return 'Saved Stories';
		if (active_section === 'trending') return 'Trending';
		if (active_section === 'top-stories') return 'Top Stories';
		if (active_channel) {
			const ch = channels.find(c => c.id === active_channel);
			return ch ? ch.label : 'For You';
		}
		return 'For You';
	});

	const show_featured = $derived(active_section === 'for-you' && !active_channel);

	function toggle_saved(id: number) {
		const article = articles.find(a => a.id === id);
		if (article) article.saved = !article.saved;
	}

	function select_section(id: string) {
		active_section = id;
		active_channel = null;
	}

	function select_channel(id: string) {
		active_channel = id;
		active_section = 'for-you';
	}
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar">
		<div class="titlebar-text">News</div>
	</header>

	<div class="main">
		<aside class="sidebar">
			<div class="sidebar-section">
				<button
					class="sidebar-item"
					class:active={active_section === 'for-you' && !active_channel}
					onclick={() => select_section('for-you')}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
					</span>
					For You
				</button>
				<button
					class="sidebar-item"
					class:active={active_section === 'top-stories' && !active_channel}
					onclick={() => select_section('top-stories')}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>
					</span>
					Top Stories
				</button>
				<button
					class="sidebar-item"
					class:active={active_section === 'trending' && !active_channel}
					onclick={() => select_section('trending')}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
					</span>
					Trending
				</button>
				<button
					class="sidebar-item"
					class:active={active_section === 'saved' && !active_channel}
					onclick={() => select_section('saved')}
				>
					<span class="sidebar-icon">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
					</span>
					Saved
				</button>
			</div>

			<div class="sidebar-section">
				<div class="sidebar-section-title">Channels</div>
				{#each channels as channel}
					<button
						class="sidebar-item"
						class:active={active_channel === channel.id}
						onclick={() => select_channel(channel.id)}
					>
						<span class="channel-dot" style:background={channel.color}></span>
						{channel.label}
					</button>
				{/each}
			</div>
		</aside>

		<div class="content">
			{#if show_featured}
				<div class="featured-section">
					{#each featured_articles as article}
						<button class="featured-card" onclick={() => toggle_saved(article.id)}>
							<div class="featured-image" style:background={article.gradient}>
								<span class="featured-category">{article.category}</span>
							</div>
							<div class="featured-info">
								<h2>{article.title}</h2>
								<div class="featured-meta">
									<span class="source-name">{article.source}</span>
									<span class="time-ago">{article.time}</span>
								</div>
							</div>
						</button>
					{/each}
				</div>
			{/if}

			<div class="articles-section">
				<h3 class="section-title">{view_title}</h3>
				{#if displayed_articles.length === 0}
					<div class="empty-state">
						{#if active_section === 'saved'}
							<p>No saved stories yet. Tap an article to save it.</p>
						{:else}
							<p>No articles found.</p>
						{/if}
					</div>
				{:else}
					<div class="articles-grid">
						{#each displayed_articles as article}
							<button class="article-card" onclick={() => toggle_saved(article.id)}>
								<div class="article-thumb" style:background={article.gradient}></div>
								<div class="article-info">
									<span class="article-category">{article.category}</span>
									<h4>{article.title}</h4>
									<div class="article-footer">
										<span class="article-meta">{article.source} &middot; {article.time}</span>
										{#if article.saved}
											<span class="saved-badge">Saved</span>
										{/if}
									</div>
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>

<style>
	.container {
		height: 100%;
		width: 100%;
		background-color: #f2f2f7;
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

	.titlebar {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 8px 12px;
		min-height: 42px;
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid #d1d1d6;

		:global(body.dark) & {
			background: rgba(44, 44, 46, 0.85);
			border-bottom-color: #38383a;
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
		background: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(20px);
		border-right: 1px solid #d1d1d6;
		padding: 8px 0;
		overflow-y: auto;
		display: flex;
		flex-direction: column;

		:global(body.dark) & {
			background: rgba(28, 28, 30, 0.85);
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
			background: #fa2d48;
			color: white;
			font-weight: 500;

			:global(body.dark) & {
				background: #fa2d48;
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

	.channel-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.content {
		flex: 1;
		overflow-y: auto;
		padding: 16px 20px;
	}

	.featured-section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
		margin-bottom: 28px;
	}

	.featured-card {
		border: none;
		background: white;
		border-radius: 14px;
		overflow: hidden;
		cursor: pointer;
		text-align: left;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
		transition: transform 0.2s, box-shadow 0.2s;

		&:hover {
			transform: translateY(-3px);
			box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
		}

		:global(body.dark) & {
			background: #2c2c2e;
			box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);

			&:hover {
				box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
			}
		}
	}

	.featured-image {
		height: 150px;
		position: relative;
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;
		padding: 10px;
	}

	.featured-category {
		font-size: 10px;
		font-weight: 700;
		color: white;
		background: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(8px);
		padding: 3px 8px;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.featured-info {
		padding: 14px;

		h2 {
			font-size: 15px;
			font-weight: 700;
			margin: 0 0 8px;
			line-height: 1.35;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}
	}

	.featured-meta {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.source-name {
		font-size: 11px;
		font-weight: 600;
		color: #fa2d48;
	}

	.time-ago {
		font-size: 11px;
		color: #86868b;
	}

	.articles-section {
		margin-bottom: 16px;
	}

	.section-title {
		font-size: 20px;
		font-weight: 700;
		margin: 0 0 14px;
	}

	.empty-state {
		text-align: center;
		padding: 40px 20px;
		color: #86868b;
		font-size: 14px;
	}

	.articles-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.article-card {
		display: flex;
		gap: 12px;
		border: none;
		background: white;
		border-radius: 12px;
		padding: 12px;
		cursor: pointer;
		text-align: left;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
		transition: transform 0.15s, box-shadow 0.15s;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		}

		:global(body.dark) & {
			background: #2c2c2e;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

			&:hover {
				background: #3a3a3c;
				box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
			}
		}
	}

	.article-thumb {
		width: 80px;
		height: 80px;
		border-radius: 10px;
		flex-shrink: 0;
	}

	.article-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-width: 0;

		h4 {
			font-size: 13px;
			font-weight: 600;
			margin: 3px 0 5px;
			line-height: 1.35;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}
	}

	.article-category {
		font-size: 11px;
		font-weight: 600;
		color: #fa2d48;
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.article-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
	}

	.article-meta {
		font-size: 11px;
		color: #86868b;
	}

	.saved-badge {
		font-size: 10px;
		font-weight: 600;
		color: #fa2d48;
		background: rgba(250, 45, 72, 0.1);
		padding: 1px 6px;
		border-radius: 4px;
	}
</style>
