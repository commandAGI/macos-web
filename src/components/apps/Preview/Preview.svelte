<script lang="ts">
	let zoom_level = $state(100);
	let active_image = $state(0);

	const images = [
		{ name: 'Mountain Landscape.png', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
		{ name: 'Sunset Beach.jpg', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
		{ name: 'Forest Path.jpg', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
	];

	function zoom_in() {
		if (zoom_level < 300) zoom_level += 25;
	}

	function zoom_out() {
		if (zoom_level > 25) zoom_level -= 25;
	}

	function zoom_fit() {
		zoom_level = 100;
	}
</script>

<section class="container">
	<header class="app-window-drag-handle toolbar">
		<div class="toolbar-left">
			<button class="tool-btn" onclick={zoom_out}>−</button>
			<span class="zoom-label">{zoom_level}%</span>
			<button class="tool-btn" onclick={zoom_in}>+</button>
			<button class="tool-btn fit-btn" onclick={zoom_fit}>Fit</button>
		</div>
		<div class="toolbar-title">{images[active_image].name}</div>
		<div class="toolbar-right">
			<button class="tool-btn">↻</button>
			<button class="tool-btn">✎</button>
			<button class="tool-btn share-btn">↗ Share</button>
		</div>
	</header>

	<div class="main">
		<aside class="thumb-sidebar">
			{#each images as img, i}
				<button
					class="thumb-item"
					class:active={active_image === i}
					onclick={() => active_image = i}
				>
					<div class="thumb-preview" style:background={img.gradient}></div>
					<span class="thumb-label">{i + 1}</span>
				</button>
			{/each}
		</aside>

		<div class="preview-area">
			<div class="image-container">
				<div
					class="image-preview"
					style:background={images[active_image].gradient}
					style:transform="scale({zoom_level / 100})"
				>
					<div class="image-content">
						<span class="image-icon">🖼️</span>
						<span class="image-name">{images[active_image].name}</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="info-bar">
		<span>{images[active_image].name}</span>
		<span>1920 x 1080 pixels</span>
		<span>2.4 MB</span>
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
		align-items: center;
		gap: 4px;
	}

	.toolbar-title {
		font-size: 13px;
		font-weight: 600;
	}

	.tool-btn {
		padding: 3px 8px;
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

	.fit-btn {
		font-size: 11px;
		font-weight: 600;
	}

	.share-btn {
		font-size: 12px;
	}

	.zoom-label {
		font-size: 11px;
		color: #86868b;
		min-width: 36px;
		text-align: center;
	}

	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.thumb-sidebar {
		width: 80px;
		min-width: 80px;
		background: #f2f2f7;
		border-right: 1px solid #d1d1d6;
		overflow-y: auto;
		padding: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;

		:global(body.dark) & {
			background: #2c2c2e;
			border-right-color: #38383a;
		}
	}

	.thumb-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		border: none;
		background: none;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;

		&.active {
			background: rgba(0, 122, 255, 0.15);
		}

		&:hover:not(.active) {
			background: rgba(0, 0, 0, 0.04);
		}
	}

	.thumb-preview {
		width: 52px;
		height: 36px;
		border-radius: 3px;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.thumb-label {
		font-size: 10px;
		color: #86868b;
	}

	.preview-area {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		background: #d1d1d6;

		:global(body.dark) & {
			background: #2c2c2e;
		}
	}

	.image-container {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.image-preview {
		width: 400px;
		height: 280px;
		border-radius: 4px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
		display: flex;
		justify-content: center;
		align-items: center;
		transition: transform 0.2s;
	}

	.image-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.image-icon {
		font-size: 48px;
	}

	.image-name {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.8);
		font-weight: 500;
	}

	.info-bar {
		display: flex;
		justify-content: center;
		gap: 16px;
		padding: 4px 12px;
		font-size: 11px;
		color: #86868b;
		background: #f2f2f7;
		border-top: 1px solid #d1d1d6;

		:global(body.dark) & {
			background: #2c2c2e;
			border-top-color: #38383a;
		}
	}
</style>
