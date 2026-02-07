<script lang="ts">
	let active_tab = $state('all');

	const tabs = [
		{ id: 'all', label: 'All Photos' },
		{ id: 'favorites', label: 'Favorites' },
		{ id: 'albums', label: 'Albums' },
	];

	const gradients = [
		'linear-gradient(135deg, #667eea, #764ba2)',
		'linear-gradient(135deg, #f093fb, #f5576c)',
		'linear-gradient(135deg, #4facfe, #00f2fe)',
		'linear-gradient(135deg, #43e97b, #38f9d7)',
		'linear-gradient(135deg, #fa709a, #fee140)',
		'linear-gradient(135deg, #a18cd1, #fbc2eb)',
		'linear-gradient(135deg, #fccb90, #d57eeb)',
		'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
		'linear-gradient(135deg, #f5576c, #ff9a9e)',
		'linear-gradient(135deg, #667eea, #764ba2)',
		'linear-gradient(135deg, #89f7fe, #66a6ff)',
		'linear-gradient(135deg, #fddb92, #d1fdff)',
		'linear-gradient(135deg, #9890e3, #b1f4cf)',
		'linear-gradient(135deg, #ebc0fd, #d9ded8)',
		'linear-gradient(135deg, #f6d365, #fda085)',
		'linear-gradient(135deg, #84fab0, #8fd3f4)',
		'linear-gradient(135deg, #cfd9df, #e2ebf0)',
		'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
		'linear-gradient(135deg, #ffecd2, #fcb69f)',
		'linear-gradient(135deg, #ff9a9e, #fecfef)',
		'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
		'linear-gradient(135deg, #fdcbf1, #e6dee9)',
		'linear-gradient(135deg, #a6c0fe, #f68084)',
		'linear-gradient(135deg, #fccb90, #d57eeb)',
	];

	const favorites = [0, 3, 7, 11, 15, 19];

	const albums = [
		{ name: 'Vacation 2024', count: 48 },
		{ name: 'Family', count: 156 },
		{ name: 'Screenshots', count: 89 },
		{ name: 'Selfies', count: 34 },
	];

	const visible_photos = $derived(
		active_tab === 'favorites'
			? gradients.filter((_, i) => favorites.includes(i))
			: gradients
	);
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
		{#if active_tab === 'albums'}
			<div class="albums-grid">
				{#each albums as album, i}
					<button class="album-card">
						<div class="album-cover" style:background={gradients[i * 3]}></div>
						<div class="album-info">
							<span class="album-name">{album.name}</span>
							<span class="album-count">{album.count}</span>
						</div>
					</button>
				{/each}
			</div>
		{:else}
			<div class="photo-grid">
				{#each visible_photos as gradient, i}
					<button class="photo-tile" style:background={gradient}>
						{#if active_tab === 'all' && favorites.includes(i)}
							<span class="favorite-badge">♥</span>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
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

	.tabs {
		display: flex;
		background: rgba(0, 0, 0, 0.06);
		border-radius: 6px;
		padding: 2px;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.1);
		}
	}

	.tab-btn {
		padding: 4px 14px;
		border: none;
		background: none;
		font-size: 12px;
		color: #6e6e73;
		cursor: pointer;
		border-radius: 5px;
		font-weight: 500;

		&.active {
			background: white;
			color: var(--system-color-light-contrast);
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		}

		:global(body.dark) &.active {
			background: #636366;
			color: white;
		}
	}

	.content {
		flex: 1;
		overflow-y: auto;
		padding: 12px;
	}

	.photo-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 2px;
	}

	.photo-tile {
		aspect-ratio: 1;
		border: none;
		border-radius: 0;
		cursor: pointer;
		position: relative;
		transition: transform 0.1s;

		&:hover {
			transform: scale(1.02);
			z-index: 1;
		}
	}

	.favorite-badge {
		position: absolute;
		bottom: 4px;
		left: 6px;
		color: white;
		font-size: 12px;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.albums-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 16px;
		padding: 8px;
	}

	.album-card {
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
	}

	.album-cover {
		aspect-ratio: 1;
		border-radius: 10px;
		margin-bottom: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.album-info {
		display: flex;
		flex-direction: column;
	}

	.album-name {
		font-size: 14px;
		font-weight: 600;
		color: var(--system-color-light-contrast);
	}

	.album-count {
		font-size: 12px;
		color: #86868b;
	}
</style>
