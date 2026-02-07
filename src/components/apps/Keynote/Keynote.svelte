<script lang="ts">
	type Slide = { id: number; title: string; subtitle: string; bg: string };

	let selected_slide = $state(0);

	const slides: Slide[] = [
		{ id: 1, title: 'Quarterly Business Review', subtitle: 'Q1 2024 Results', bg: '#1a1a2e' },
		{ id: 2, title: 'Revenue Overview', subtitle: '$12.4M Total Revenue', bg: '#ffffff' },
		{ id: 3, title: 'Key Metrics', subtitle: '40% Growth YoY', bg: '#ffffff' },
		{ id: 4, title: 'Product Roadmap', subtitle: 'Q2 2024 Priorities', bg: '#ffffff' },
		{ id: 5, title: 'Team Updates', subtitle: '3 New Hires', bg: '#ffffff' },
		{ id: 6, title: 'Next Steps', subtitle: 'Action Items', bg: '#ffffff' },
	];

	const current_slide = $derived(slides[selected_slide]);
</script>

<section class="container">
	<header class="app-window-drag-handle toolbar">
		<div class="toolbar-left">
			<button class="tool-btn">+</button>
		</div>
		<div class="toolbar-center">
			<button class="tool-btn">T</button>
			<button class="tool-btn">▢</button>
			<button class="tool-btn">○</button>
			<button class="tool-btn">△</button>
			<button class="tool-btn">—</button>
			<button class="tool-btn">🖼️</button>
		</div>
		<div class="toolbar-right">
			<button class="play-btn-toolbar">▶ Play</button>
		</div>
	</header>

	<div class="main">
		<aside class="slide-panel">
			{#each slides as slide, i}
				<button
					class="slide-thumb"
					class:active={selected_slide === i}
					onclick={() => selected_slide = i}
				>
					<span class="slide-number">{i + 1}</span>
					<div
						class="thumb-preview"
						class:dark-slide={slide.bg === '#1a1a2e'}
						style:background-color={slide.bg}
					>
						<div class="thumb-title">{slide.title}</div>
					</div>
				</button>
			{/each}
		</aside>

		<div class="canvas-area">
			<div class="slide-canvas" style:background-color={current_slide.bg}>
				{#if current_slide.bg === '#1a1a2e'}
					<div class="slide-content dark-content">
						<h1>{current_slide.title}</h1>
						<p>{current_slide.subtitle}</p>
						<div class="slide-decoration">
							<div class="deco-line"></div>
						</div>
					</div>
				{:else}
					<div class="slide-content">
						<h1>{current_slide.title}</h1>
						<p>{current_slide.subtitle}</p>
						<div class="slide-body">
							<div class="placeholder-box"></div>
							<div class="placeholder-text">
								<div class="text-line" style:width="80%"></div>
								<div class="text-line" style:width="60%"></div>
								<div class="text-line" style:width="70%"></div>
							</div>
						</div>
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
		background-color: #e5e5ea;
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

	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 12px;
		min-height: 40px;
		background: linear-gradient(to bottom, #f6f6f6, #e8e8e8);
		border-bottom: 1px solid #c8c8c8;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
			border-bottom-color: #1c1c1e;
		}
	}

	.toolbar-left, .toolbar-right {
		display: flex;
		gap: 4px;
	}

	.toolbar-center {
		display: flex;
		gap: 2px;
		background: rgba(0, 0, 0, 0.04);
		padding: 2px;
		border-radius: 6px;
	}

	.tool-btn {
		padding: 4px 10px;
		background: none;
		border: none;
		font-size: 14px;
		color: #6e6e73;
		cursor: pointer;
		border-radius: 4px;

		&:hover {
			background: rgba(0, 0, 0, 0.06);
		}
	}

	.play-btn-toolbar {
		padding: 5px 14px;
		background: #34c759;
		border: none;
		border-radius: 6px;
		color: white;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;

		&:hover {
			background: #2db84d;
		}
	}

	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.slide-panel {
		width: 160px;
		min-width: 160px;
		background: #f2f2f7;
		border-right: 1px solid #d1d1d6;
		overflow-y: auto;
		padding: 8px;

		:global(body.dark) & {
			background: #2c2c2e;
			border-right-color: #38383a;
		}
	}

	.slide-thumb {
		display: flex;
		align-items: flex-start;
		gap: 6px;
		width: 100%;
		padding: 4px;
		border: none;
		background: none;
		cursor: pointer;
		margin-bottom: 4px;
		border-radius: 4px;

		&.active {
			background: rgba(0, 122, 255, 0.1);
		}

		&:hover:not(.active) {
			background: rgba(0, 0, 0, 0.03);
		}
	}

	.slide-number {
		font-size: 10px;
		color: #86868b;
		min-width: 14px;
		text-align: right;
		margin-top: 4px;
	}

	.thumb-preview {
		flex: 1;
		aspect-ratio: 16 / 10;
		border-radius: 3px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 4px;

		&.dark-slide {
			border-color: rgba(255, 255, 255, 0.1);
		}
	}

	.thumb-title {
		font-size: 6px;
		text-align: center;
		color: #1c1c1e;
		font-weight: 600;
	}

	.dark-slide .thumb-title {
		color: white;
	}

	.canvas-area {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 24px;
		overflow: hidden;
	}

	.slide-canvas {
		width: 100%;
		max-width: 640px;
		aspect-ratio: 16 / 10;
		border-radius: 4px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
	}

	.slide-content {
		text-align: center;
		padding: 32px;
		width: 100%;

		h1 {
			font-size: 28px;
			font-weight: 700;
			margin: 0 0 8px;
			color: #1c1c1e;
		}

		p {
			font-size: 16px;
			color: #86868b;
			margin: 0 0 24px;
		}
	}

	.dark-content {
		h1 {
			color: white;
			font-size: 36px;
		}

		p {
			color: rgba(255, 255, 255, 0.6);
			font-size: 18px;
		}
	}

	.slide-decoration {
		display: flex;
		justify-content: center;
	}

	.deco-line {
		width: 60px;
		height: 3px;
		background: #007aff;
		border-radius: 2px;
	}

	.slide-body {
		display: flex;
		gap: 20px;
		align-items: flex-start;
	}

	.placeholder-box {
		width: 120px;
		height: 80px;
		background: linear-gradient(135deg, #e8e8ed, #d1d1d6);
		border-radius: 6px;
		flex-shrink: 0;
	}

	.placeholder-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-top: 4px;
	}

	.text-line {
		height: 8px;
		background: #e8e8ed;
		border-radius: 4px;
	}
</style>
