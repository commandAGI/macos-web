<script lang="ts">
	let active_section = $state('library');
	let is_playing = $state(false);

	const sidebar_items = [
		{ id: 'listen-now', label: 'Listen Now' },
		{ id: 'browse', label: 'Browse' },
		{ id: 'charts', label: 'Top Charts' },
		{ id: 'library', label: 'Library' },
	];

	const podcasts = [
		{ title: 'Tech Talk Weekly', author: 'TechMedia', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', episodes: 245 },
		{ title: 'Science Explained', author: 'ScienceHub', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', episodes: 189 },
		{ title: 'True Crime Stories', author: 'CrimePod', gradient: 'linear-gradient(135deg, #f5576c, #ff6b6b)', episodes: 312 },
		{ title: 'Business Minds', author: 'BizNetwork', gradient: 'linear-gradient(135deg, #fccb90, #d57eeb)', episodes: 156 },
		{ title: 'Comedy Hour', author: 'LaughFactory', gradient: 'linear-gradient(135deg, #fa709a, #fee140)', episodes: 423 },
		{ title: 'History Uncovered', author: 'HistoryChannel', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', episodes: 98 },
		{ title: 'Mindful Living', author: 'WellnessWave', gradient: 'linear-gradient(135deg, #84fab0, #8fd3f4)', episodes: 67 },
		{ title: 'Design Thinking', author: 'CreativeHub', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', episodes: 134 },
	];

	let current_podcast = $state(podcasts[0]);
	let current_episode = $state('Episode 245: The Future of AI');
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar"></header>

	<div class="main">
		<aside class="sidebar">
			{#each sidebar_items as item}
				<button
					class="sidebar-item"
					class:active={active_section === item.id}
					onclick={() => active_section = item.id}
				>
					{item.label}
				</button>
			{/each}
		</aside>

		<div class="content">
			<div class="content-header">
				<h1>Library</h1>
			</div>

			<div class="podcast-grid">
				{#each podcasts as podcast}
					<button class="podcast-card" onclick={() => { current_podcast = podcast; }}>
						<div class="podcast-art" style:background={podcast.gradient}>
							<span class="podcast-initial">{podcast.title.charAt(0)}</span>
						</div>
						<div class="podcast-title">{podcast.title}</div>
						<div class="podcast-author">{podcast.author}</div>
					</button>
				{/each}
			</div>
		</div>
	</div>

	<div class="now-playing">
		<div class="np-info">
			<div class="np-art" style:background={current_podcast.gradient}>
				<span>{current_podcast.title.charAt(0)}</span>
			</div>
			<div class="np-details">
				<div class="np-title">{current_episode}</div>
				<div class="np-podcast">{current_podcast.title}</div>
			</div>
		</div>
		<div class="np-controls">
			<button class="np-btn">⏪ 15</button>
			<button class="np-btn play-btn" onclick={() => is_playing = !is_playing}>
				{is_playing ? '⏸' : '▶'}
			</button>
			<button class="np-btn">15 ⏩</button>
		</div>
		<div class="np-progress">
			<div class="progress-bar">
				<div class="progress-fill" style:width="22%"></div>
			</div>
			<div class="progress-times">
				<span>12:34</span>
				<span>-43:28</span>
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
	}

	.titlebar {
		padding: 12px;
		min-height: 36px;
		background: linear-gradient(to bottom, #f6f6f6, #ededef);
		border-bottom: 1px solid #d1d1d6;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
			border-bottom-color: #1c1c1e;
		}
	}

	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.sidebar {
		width: 180px;
		min-width: 180px;
		background: #f2f2f7;
		border-right: 1px solid #d1d1d6;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;

		:global(body.dark) & {
			background: #1c1c1e;
			border-right-color: #38383a;
		}
	}

	.sidebar-item {
		display: block;
		width: 100%;
		padding: 6px 12px;
		border: none;
		background: none;
		font-size: 14px;
		color: var(--system-color-light-contrast);
		cursor: pointer;
		text-align: left;
		border-radius: 6px;

		&:hover {
			background: rgba(0, 0, 0, 0.04);
		}

		&.active {
			background: #8e44ad;
			color: white;
			font-weight: 500;
		}
	}

	.content {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
	}

	.content-header h1 {
		font-size: 24px;
		font-weight: 700;
		margin: 0 0 16px;
	}

	.podcast-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 16px;
	}

	.podcast-card {
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
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
	}

	.now-playing {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 8px 16px;
		height: 56px;
		background: #f9f9f9;
		border-top: 1px solid #d1d1d6;

		:global(body.dark) & {
			background: #1c1c1e;
			border-top-color: #38383a;
		}
	}

	.np-info {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 220px;
	}

	.np-art {
		width: 40px;
		height: 40px;
		border-radius: 6px;
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
		gap: 8px;
	}

	.np-btn {
		background: none;
		border: none;
		font-size: 12px;
		cursor: pointer;
		color: var(--system-color-light-contrast);
		padding: 4px;

		&:hover {
			opacity: 0.7;
		}
	}

	.play-btn {
		font-size: 20px;
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
