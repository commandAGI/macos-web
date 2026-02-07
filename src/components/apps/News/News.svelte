<script lang="ts">
	let active_tab = $state('today');

	const tabs = [
		{ id: 'today', label: 'Today' },
		{ id: 'news-plus', label: 'News+' },
		{ id: 'sports', label: 'Sports' },
		{ id: 'entertainment', label: 'Entertainment' },
	];

	const headlines = [
		{
			title: 'Breakthrough in Quantum Computing Promises Faster Processing',
			source: 'TechDaily',
			time: '2h ago',
			category: 'Technology',
			gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
			featured: true,
		},
		{
			title: 'Global Climate Summit Reaches Historic Agreement',
			source: 'World News',
			time: '3h ago',
			category: 'Environment',
			gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
			featured: true,
		},
		{
			title: 'New Space Telescope Captures Stunning Galaxy Images',
			source: 'Science Today',
			time: '4h ago',
			category: 'Science',
			gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
			featured: false,
		},
		{
			title: 'Major Tech Company Announces Revolutionary AI Assistant',
			source: 'Tech Insider',
			time: '5h ago',
			category: 'Technology',
			gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
			featured: false,
		},
		{
			title: 'Championship Game Sets New Viewership Records',
			source: 'Sports Network',
			time: '6h ago',
			category: 'Sports',
			gradient: 'linear-gradient(135deg, #fa709a, #fee140)',
			featured: false,
		},
		{
			title: 'Award-Winning Director Announces Upcoming Film Project',
			source: 'Entertainment Weekly',
			time: '7h ago',
			category: 'Entertainment',
			gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
			featured: false,
		},
		{
			title: 'Innovative Startup Raises Record Funding Round',
			source: 'Business Today',
			time: '8h ago',
			category: 'Business',
			gradient: 'linear-gradient(135deg, #fccb90, #d57eeb)',
			featured: false,
		},
		{
			title: 'Medical Researchers Report Promising Vaccine Trial Results',
			source: 'Health Journal',
			time: '9h ago',
			category: 'Health',
			gradient: 'linear-gradient(135deg, #84fab0, #8fd3f4)',
			featured: false,
		},
	];

	const featured = $derived(headlines.filter(h => h.featured));
	const regular = $derived(headlines.filter(h => !h.featured));
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar">
		<div class="tabs">
			{#each tabs as tab}
				<button
					class="tab-btn"
					class:active={active_tab === tab.id}
					onclick={() => active_tab = tab.id}
				>
					{tab.label}
				</button>
			{/each}
		</div>
	</header>

	<div class="content">
		<div class="featured-section">
			{#each featured as article}
				<button class="featured-card">
					<div class="featured-image" style:background={article.gradient}></div>
					<div class="featured-info">
						<span class="article-category">{article.category}</span>
						<h2>{article.title}</h2>
						<span class="article-meta">{article.source} &middot; {article.time}</span>
					</div>
				</button>
			{/each}
		</div>

		<div class="articles-section">
			<h3 class="section-title">Top Stories</h3>
			<div class="articles-grid">
				{#each regular as article}
					<button class="article-card">
						<div class="article-thumb" style:background={article.gradient}></div>
						<div class="article-info">
							<span class="article-category">{article.category}</span>
							<h4>{article.title}</h4>
							<span class="article-meta">{article.source} &middot; {article.time}</span>
						</div>
					</button>
				{/each}
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

	.tabs {
		display: flex;
		gap: 4px;
	}

	.tab-btn {
		padding: 5px 14px;
		border: none;
		background: none;
		font-size: 13px;
		font-weight: 500;
		color: #86868b;
		cursor: pointer;
		border-radius: 6px;

		&.active {
			background: #fa2d48;
			color: white;
		}

		&:hover:not(.active) {
			background: rgba(0, 0, 0, 0.04);
		}
	}

	.content {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
	}

	.featured-section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-bottom: 24px;
	}

	.featured-card {
		border: none;
		background: white;
		border-radius: 12px;
		overflow: hidden;
		cursor: pointer;
		text-align: left;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
		transition: transform 0.15s;

		&:hover {
			transform: translateY(-2px);
		}

		:global(body.dark) & {
			background: #2c2c2e;
		}
	}

	.featured-image {
		height: 140px;
	}

	.featured-info {
		padding: 12px;

		h2 {
			font-size: 15px;
			font-weight: 700;
			margin: 4px 0 6px;
			line-height: 1.3;
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

	.article-meta {
		font-size: 11px;
		color: #86868b;
	}

	.section-title {
		font-size: 18px;
		font-weight: 700;
		margin: 0 0 12px;
	}

	.articles-grid {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.article-card {
		display: flex;
		gap: 12px;
		border: none;
		background: white;
		border-radius: 10px;
		padding: 12px;
		cursor: pointer;
		text-align: left;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);

		&:hover {
			background: #f9f9f9;
		}

		:global(body.dark) & {
			background: #2c2c2e;

			&:hover {
				background: #3a3a3c;
			}
		}
	}

	.article-thumb {
		width: 80px;
		height: 80px;
		border-radius: 8px;
		flex-shrink: 0;
	}

	.article-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;

		h4 {
			font-size: 14px;
			font-weight: 600;
			margin: 4px 0 4px;
			line-height: 1.3;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}
	}
</style>
