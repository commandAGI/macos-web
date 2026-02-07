<script lang="ts">
	let active_section = $state('watch-now');

	const sidebar_items = [
		{ id: 'watch-now', label: 'Watch Now' },
		{ id: 'library', label: 'Library' },
		{ id: 'originals', label: 'Apple TV+' },
		{ id: 'sports', label: 'MLS Season Pass' },
		{ id: 'store', label: 'Store' },
		{ id: 'search', label: 'Search' },
	];

	const hero = {
		title: 'The Last Frontier',
		subtitle: 'Apple TV+ Original Series',
		gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
	};

	const rows = [
		{
			title: 'Up Next',
			items: [
				{ name: 'Cosmic Journey', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
				{ name: 'Night Watch', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
				{ name: 'Desert Storm', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
				{ name: 'Ocean Deep', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
				{ name: 'Forest Trail', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
			],
		},
		{
			title: 'Trending',
			items: [
				{ name: 'City Noir', gradient: 'linear-gradient(135deg, #2c3e50, #3498db)' },
				{ name: 'Sunrise Valley', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
				{ name: 'Arctic Expedition', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
				{ name: 'Rainforest', gradient: 'linear-gradient(135deg, #84fab0, #8fd3f4)' },
				{ name: 'Mountain Peak', gradient: 'linear-gradient(135deg, #fccb90, #d57eeb)' },
			],
		},
		{
			title: 'New Releases',
			items: [
				{ name: 'Midnight Run', gradient: 'linear-gradient(135deg, #f5576c, #ff6b6b)' },
				{ name: 'Golden Age', gradient: 'linear-gradient(135deg, #f6d365, #fda085)' },
				{ name: 'Silent Echo', gradient: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)' },
				{ name: 'Iron Will', gradient: 'linear-gradient(135deg, #636e72, #b2bec3)' },
				{ name: 'Dream State', gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)' },
			],
		},
	];
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
			<div class="hero-banner" style:background={hero.gradient}>
				<div class="hero-content">
					<div class="hero-badge">NEW SERIES</div>
					<h1>{hero.title}</h1>
					<p>{hero.subtitle}</p>
					<div class="hero-actions">
						<button class="play-btn">▶ Play</button>
						<button class="info-btn">More Info</button>
					</div>
				</div>
			</div>

			{#each rows as row}
				<div class="content-row">
					<h3 class="row-title">{row.title}</h3>
					<div class="row-items">
						{#each row.items as item}
							<button class="content-card">
								<div class="card-image" style:background={item.gradient}>
									<span class="card-title">{item.name}</span>
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/each}
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
		width: 180px;
		min-width: 180px;
		background: #2c2c2e;
		border-right: 1px solid rgba(255, 255, 255, 0.06);
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.sidebar-item {
		display: block;
		width: 100%;
		padding: 6px 12px;
		border: none;
		background: none;
		font-size: 14px;
		color: rgba(255, 255, 255, 0.85);
		cursor: pointer;
		text-align: left;
		border-radius: 6px;

		&:hover {
			background: rgba(255, 255, 255, 0.06);
		}

		&.active {
			background: rgba(255, 255, 255, 0.12);
			color: white;
			font-weight: 500;
		}
	}

	.content {
		flex: 1;
		overflow-y: auto;
	}

	.hero-banner {
		height: 240px;
		position: relative;
		display: flex;
		align-items: flex-end;
		padding: 24px;
	}

	.hero-content {
		z-index: 1;
	}

	.hero-badge {
		font-size: 10px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.7);
		letter-spacing: 1.5px;
		margin-bottom: 6px;
	}

	.hero-content h1 {
		font-size: 32px;
		font-weight: 700;
		margin: 0 0 4px;
	}

	.hero-content p {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.7);
		margin: 0 0 12px;
	}

	.hero-actions {
		display: flex;
		gap: 8px;
	}

	.play-btn {
		padding: 8px 20px;
		background: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		color: #1c1c1e;
		cursor: pointer;

		&:hover {
			background: #e5e5ea;
		}
	}

	.info-btn {
		padding: 8px 20px;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10px);
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		color: white;
		cursor: pointer;

		&:hover {
			background: rgba(255, 255, 255, 0.2);
		}
	}

	.content-row {
		padding: 16px 20px 8px;
	}

	.row-title {
		font-size: 18px;
		font-weight: 700;
		margin: 0 0 12px;
	}

	.row-items {
		display: flex;
		gap: 12px;
		overflow-x: auto;
		padding-bottom: 8px;
	}

	.content-card {
		flex-shrink: 0;
		border: none;
		background: none;
		cursor: pointer;
	}

	.card-image {
		width: 160px;
		height: 90px;
		border-radius: 8px;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		padding: 8px;
		transition: transform 0.15s;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

		&:hover {
			transform: scale(1.05);
		}
	}

	.card-title {
		font-size: 12px;
		font-weight: 600;
		color: white;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
	}
</style>
