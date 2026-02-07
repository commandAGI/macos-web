<script lang="ts">
	type SlideType = 'title' | 'bullets' | 'chart' | 'image-text' | 'quote' | 'thankyou';
	type ToolbarTab = 'format' | 'animate' | 'transition';

	type Slide = {
		id: number;
		type: SlideType;
		bg: string;
		dark: boolean;
	};

	type BarData = {
		label: string;
		value: number;
		color: string;
	};

	let selected_slide = $state(0);
	let active_tab = $state<ToolbarTab>('format');
	let zoom_pct = $state(75);
	let is_presenting = $state(false);

	const slides: Slide[] = [
		{ id: 1, type: 'title', bg: '#1a1a2e', dark: true },
		{ id: 2, type: 'bullets', bg: '#ffffff', dark: false },
		{ id: 3, type: 'chart', bg: '#ffffff', dark: false },
		{ id: 4, type: 'image-text', bg: '#ffffff', dark: false },
		{ id: 5, type: 'quote', bg: '#f0f0f5', dark: false },
		{ id: 6, type: 'thankyou', bg: 'linear-gradient(135deg, #667eea, #764ba2)', dark: true },
	];

	const chart_data: BarData[] = [
		{ label: 'Q1', value: 65, color: '#007aff' },
		{ label: 'Q2', value: 80, color: '#34c759' },
		{ label: 'Q3', value: 55, color: '#ff9500' },
		{ label: 'Q4', value: 92, color: '#ff3b30' },
	];

	const current_slide = $derived(slides[selected_slide]);

	function add_slide() {
		// Noop for UI demo
	}

	function start_presentation() {
		is_presenting = true;
	}

	function stop_presentation() {
		is_presenting = false;
	}

	function next_slide() {
		if (selected_slide < slides.length - 1) selected_slide += 1;
	}

	function prev_slide() {
		if (selected_slide > 0) selected_slide -= 1;
	}

	function handle_presentation_key(e: KeyboardEvent) {
		if (e.key === 'Escape') stop_presentation();
		else if (e.key === 'ArrowRight' || e.key === ' ') next_slide();
		else if (e.key === 'ArrowLeft') prev_slide();
	}
</script>

{#if is_presenting}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div class="presentation-overlay" onkeydown={handle_presentation_key} tabindex="0">
		<div class="presentation-slide" style:background={current_slide.bg}>
			{#if current_slide.type === 'title'}
				<div class="slide-inner title-slide dark-text">
					<h1>Quarterly Review</h1>
					<p class="subtitle">Q4 2024</p>
					<div class="title-deco"><div class="deco-line"></div></div>
				</div>
			{:else if current_slide.type === 'bullets'}
				<div class="slide-inner bullets-slide">
					<h2>Key Metrics</h2>
					<ul class="bullet-list">
						<li><span class="bullet-dot" style:background="#007aff"></span>Revenue grew 34% year-over-year to $18.2M</li>
						<li><span class="bullet-dot" style:background="#34c759"></span>Customer retention rate improved to 94.2%</li>
						<li><span class="bullet-dot" style:background="#ff9500"></span>New markets launched in APAC and EMEA regions</li>
						<li><span class="bullet-dot" style:background="#ff3b30"></span>Team expanded from 45 to 72 employees</li>
					</ul>
				</div>
			{:else if current_slide.type === 'chart'}
				<div class="slide-inner chart-slide">
					<h2>Revenue by Quarter</h2>
					<div class="chart-container">
						{#each chart_data as bar}
							<div class="bar-group">
								<div class="bar-wrapper">
									<div class="bar" style:height="{bar.value}%" style:background-color={bar.color}></div>
								</div>
								<span class="bar-label">{bar.label}</span>
								<span class="bar-value">${Math.round(bar.value * 0.2)}M</span>
							</div>
						{/each}
					</div>
				</div>
			{:else if current_slide.type === 'image-text'}
				<div class="slide-inner image-text-slide">
					<div class="image-placeholder">
						<div class="gradient-placeholder"></div>
					</div>
					<div class="text-content">
						<h2>Product Update</h2>
						<p>Our new platform features a redesigned dashboard with real-time analytics, improved collaboration tools, and an AI-powered assistant.</p>
						<p class="text-muted">Launching in Q1 2025</p>
					</div>
				</div>
			{:else if current_slide.type === 'quote'}
				<div class="slide-inner quote-slide">
					<div class="quote-mark">"</div>
					<p class="quote-text">Innovation distinguishes between a leader and a follower. Our team has consistently pushed the boundaries of what's possible.</p>
					<p class="quote-author">-- Sarah Chen, CEO</p>
				</div>
			{:else if current_slide.type === 'thankyou'}
				<div class="slide-inner thankyou-slide dark-text">
					<h1>Thank You</h1>
					<p class="subtitle">Questions & Discussion</p>
					<div class="contact-info">
						<span>team@company.com</span>
					</div>
				</div>
			{/if}
		</div>
		<div class="presentation-controls">
			<button class="pres-btn" onclick={prev_slide}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
			</button>
			<span class="pres-slide-num">{selected_slide + 1} / {slides.length}</span>
			<button class="pres-btn" onclick={next_slide}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
			</button>
			<button class="pres-btn exit-btn" onclick={stop_presentation}>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
				Exit
			</button>
		</div>
	</div>
{:else}
	<section class="container">
		<header class="app-window-drag-handle toolbar">
			<div class="toolbar-left">
				<button class="tool-btn add-btn" onclick={add_slide} title="Add Slide">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
						<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
					</svg>
				</button>
			</div>
			<div class="toolbar-center">
				<div class="tab-group">
					<button
						class="tab-btn"
						class:active={active_tab === 'format'}
						onclick={() => active_tab = 'format'}
					>Format</button>
					<button
						class="tab-btn"
						class:active={active_tab === 'animate'}
						onclick={() => active_tab = 'animate'}
					>Animate</button>
					<button
						class="tab-btn"
						class:active={active_tab === 'transition'}
						onclick={() => active_tab = 'transition'}
					>Transition</button>
				</div>
			</div>
			<div class="toolbar-right">
				<div class="zoom-control">
					<button class="zoom-btn" onclick={() => { if (zoom_pct > 25) zoom_pct -= 25; }}>
						<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>
					</button>
					<span class="zoom-label">{zoom_pct}%</span>
					<button class="zoom-btn" onclick={() => { if (zoom_pct < 200) zoom_pct += 25; }}>
						<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
					</button>
				</div>
				<button class="play-btn" onclick={start_presentation}>
					<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
					Play
				</button>
			</div>
		</header>

		<div class="main">
			<!-- Slide navigator -->
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
							class:dark-thumb={slide.dark}
							style:background={slide.bg}
						>
							{#if slide.type === 'title'}
								<div class="thumb-content dark-thumb-text">
									<span class="thumb-heading">Quarterly Review</span>
									<span class="thumb-sub">Q4 2024</span>
								</div>
							{:else if slide.type === 'bullets'}
								<div class="thumb-content">
									<span class="thumb-heading">Key Metrics</span>
									<div class="thumb-bullets">
										<div class="thumb-line" style:width="70%"></div>
										<div class="thumb-line" style:width="60%"></div>
										<div class="thumb-line" style:width="65%"></div>
										<div class="thumb-line" style:width="50%"></div>
									</div>
								</div>
							{:else if slide.type === 'chart'}
								<div class="thumb-content">
									<span class="thumb-heading">Revenue</span>
									<div class="thumb-chart">
										<div class="thumb-bar" style:height="65%" style:background="#007aff"></div>
										<div class="thumb-bar" style:height="80%" style:background="#34c759"></div>
										<div class="thumb-bar" style:height="55%" style:background="#ff9500"></div>
										<div class="thumb-bar" style:height="92%" style:background="#ff3b30"></div>
									</div>
								</div>
							{:else if slide.type === 'image-text'}
								<div class="thumb-content thumb-row">
									<div class="thumb-img-box"></div>
									<div class="thumb-text-box">
										<div class="thumb-line" style:width="90%"></div>
										<div class="thumb-line" style:width="70%"></div>
									</div>
								</div>
							{:else if slide.type === 'quote'}
								<div class="thumb-content">
									<span class="thumb-quote">"</span>
									<div class="thumb-line" style:width="80%"></div>
									<div class="thumb-line" style:width="60%"></div>
								</div>
							{:else if slide.type === 'thankyou'}
								<div class="thumb-content dark-thumb-text">
									<span class="thumb-heading">Thank You</span>
								</div>
							{/if}
						</div>
					</button>
				{/each}
			</aside>

			<!-- Canvas area -->
			<div class="canvas-area">
				<div
					class="slide-canvas"
					style:background={current_slide.bg}
					style:transform="scale({zoom_pct / 100})"
				>
					{#if current_slide.type === 'title'}
						<div class="slide-inner title-slide dark-text">
							<h1>Quarterly Review</h1>
							<p class="subtitle">Q4 2024</p>
							<div class="title-deco"><div class="deco-line"></div></div>
						</div>
					{:else if current_slide.type === 'bullets'}
						<div class="slide-inner bullets-slide">
							<h2>Key Metrics</h2>
							<ul class="bullet-list">
								<li><span class="bullet-dot" style:background="#007aff"></span>Revenue grew 34% year-over-year to $18.2M</li>
								<li><span class="bullet-dot" style:background="#34c759"></span>Customer retention rate improved to 94.2%</li>
								<li><span class="bullet-dot" style:background="#ff9500"></span>New markets launched in APAC and EMEA regions</li>
								<li><span class="bullet-dot" style:background="#ff3b30"></span>Team expanded from 45 to 72 employees</li>
							</ul>
						</div>
					{:else if current_slide.type === 'chart'}
						<div class="slide-inner chart-slide">
							<h2>Revenue by Quarter</h2>
							<div class="chart-container">
								{#each chart_data as bar}
									<div class="bar-group">
										<div class="bar-wrapper">
											<div class="bar" style:height="{bar.value}%" style:background-color={bar.color}></div>
										</div>
										<span class="bar-label">{bar.label}</span>
										<span class="bar-value">${Math.round(bar.value * 0.2)}M</span>
									</div>
								{/each}
							</div>
						</div>
					{:else if current_slide.type === 'image-text'}
						<div class="slide-inner image-text-slide">
							<div class="image-placeholder">
								<div class="gradient-placeholder"></div>
							</div>
							<div class="text-content">
								<h2>Product Update</h2>
								<p>Our new platform features a redesigned dashboard with real-time analytics, improved collaboration tools, and an AI-powered assistant.</p>
								<p class="text-muted">Launching in Q1 2025</p>
							</div>
						</div>
					{:else if current_slide.type === 'quote'}
						<div class="slide-inner quote-slide">
							<div class="quote-mark">"</div>
							<p class="quote-text">Innovation distinguishes between a leader and a follower. Our team has consistently pushed the boundaries of what's possible.</p>
							<p class="quote-author">-- Sarah Chen, CEO</p>
						</div>
					{:else if current_slide.type === 'thankyou'}
						<div class="slide-inner thankyou-slide dark-text">
							<h1>Thank You</h1>
							<p class="subtitle">Questions & Discussion</p>
							<div class="contact-info">
								<span>team@company.com</span>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</section>
{/if}

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

	/* ── Toolbar ── */
	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 12px;
		min-height: 40px;
		background: linear-gradient(to bottom, #f6f6f6, #e8e8e8);
		border-bottom: 1px solid #c8c8c8;
		gap: 12px;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
			border-bottom-color: #1c1c1e;
		}
	}

	.toolbar-left, .toolbar-right {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.toolbar-center {
		display: flex;
		align-items: center;
	}

	.tool-btn {
		padding: 4px 8px;
		background: none;
		border: none;
		color: #6e6e73;
		cursor: pointer;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;

		&:hover {
			background: rgba(0, 0, 0, 0.06);
		}

		:global(body.dark) & {
			color: #a1a1a6;

			&:hover {
				background: rgba(255, 255, 255, 0.08);
			}
		}
	}

	.add-btn {
		color: #007aff;
	}

	.tab-group {
		display: flex;
		background: rgba(0, 0, 0, 0.04);
		border-radius: 6px;
		padding: 2px;
		gap: 1px;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.08);
		}
	}

	.tab-btn {
		padding: 4px 14px;
		border: none;
		background: none;
		font-size: 12px;
		font-weight: 500;
		color: #6e6e73;
		cursor: pointer;
		border-radius: 4px;
		transition: all 0.15s;

		&.active {
			background: white;
			color: #1c1c1e;
			box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

			:global(body.dark) & {
				background: #48484a;
				color: #f5f5f7;
			}
		}

		&:hover:not(.active) {
			color: #1c1c1e;

			:global(body.dark) & {
				color: #f5f5f7;
			}
		}
	}

	.zoom-control {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.zoom-btn {
		width: 22px;
		height: 22px;
		padding: 0;
		background: none;
		border: none;
		color: #6e6e73;
		cursor: pointer;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;

		&:hover {
			background: rgba(0, 0, 0, 0.06);
		}

		:global(body.dark) & {
			color: #a1a1a6;
		}
	}

	.zoom-label {
		font-size: 11px;
		color: #86868b;
		width: 36px;
		text-align: center;
	}

	.play-btn {
		display: flex;
		align-items: center;
		gap: 4px;
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

	/* ── Main ── */
	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* ── Slide panel ── */
	.slide-panel {
		width: 200px;
		min-width: 200px;
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
		border: 2px solid transparent;
		background: none;
		cursor: pointer;
		margin-bottom: 4px;
		border-radius: 6px;

		&.active {
			border-color: #007aff;
			background: rgba(0, 122, 255, 0.06);
		}

		&:hover:not(.active) {
			background: rgba(0, 0, 0, 0.03);

			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.04);
			}
		}
	}

	.slide-number {
		font-size: 10px;
		color: #86868b;
		min-width: 14px;
		text-align: right;
		margin-top: 4px;
		flex-shrink: 0;
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
		overflow: hidden;
		position: relative;

		&.dark-thumb {
			border-color: rgba(255, 255, 255, 0.1);
		}
	}

	.thumb-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		width: 100%;
	}

	.thumb-heading {
		font-size: 7px;
		font-weight: 700;
		text-align: center;
		color: #1c1c1e;
	}

	.thumb-sub {
		font-size: 5px;
		color: #86868b;
	}

	.dark-thumb-text .thumb-heading {
		color: white;
	}

	.dark-thumb-text .thumb-sub {
		color: rgba(255, 255, 255, 0.6);
	}

	.thumb-bullets {
		display: flex;
		flex-direction: column;
		gap: 2px;
		width: 80%;
	}

	.thumb-line {
		height: 2px;
		background: #d1d1d6;
		border-radius: 1px;
	}

	.thumb-chart {
		display: flex;
		gap: 3px;
		height: 24px;
		align-items: flex-end;
		width: 70%;
	}

	.thumb-bar {
		flex: 1;
		border-radius: 1px;
		min-height: 2px;
	}

	.thumb-row {
		flex-direction: row;
		gap: 4px;
	}

	.thumb-img-box {
		width: 35%;
		height: 28px;
		background: linear-gradient(135deg, #c7d2fe, #a5b4fc);
		border-radius: 2px;
		flex-shrink: 0;
	}

	.thumb-text-box {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding-top: 2px;
	}

	.thumb-quote {
		font-size: 12px;
		font-weight: 700;
		color: #007aff;
		line-height: 1;
	}

	/* ── Canvas ── */
	.canvas-area {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 24px;
		overflow: hidden;
		background: #d1d1d6;

		:global(body.dark) & {
			background: #3a3a3c;
		}
	}

	.slide-canvas {
		width: 640px;
		aspect-ratio: 16 / 10;
		border-radius: 4px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		transform-origin: center center;
		transition: transform 0.15s ease;
	}

	/* ── Slide content (shared between editor + presentation) ── */
	.slide-inner {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
		box-sizing: border-box;
	}

	.dark-text {
		h1, h2 {
			color: white;
		}

		p {
			color: rgba(255, 255, 255, 0.7);
		}
	}

	/* Title slide */
	.title-slide {
		h1 {
			font-size: 42px;
			font-weight: 700;
			margin: 0 0 8px;
			text-align: center;
		}

		.subtitle {
			font-size: 20px;
			margin: 0 0 20px;
			text-align: center;
		}
	}

	.title-deco {
		display: flex;
		justify-content: center;
	}

	.deco-line {
		width: 60px;
		height: 3px;
		background: #007aff;
		border-radius: 2px;
	}

	/* Bullets slide */
	.bullets-slide {
		align-items: flex-start;
		padding: 40px 60px;

		h2 {
			font-size: 32px;
			font-weight: 700;
			color: #1c1c1e;
			margin: 0 0 24px;
		}
	}

	.bullet-list {
		list-style: none;
		padding: 0;
		margin: 0;
		width: 100%;

		li {
			display: flex;
			align-items: center;
			gap: 12px;
			font-size: 18px;
			color: #3a3a3c;
			padding: 10px 0;
			border-bottom: 1px solid #f0f0f5;

			&:last-child {
				border-bottom: none;
			}
		}
	}

	.bullet-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	/* Chart slide */
	.chart-slide {
		padding: 40px 60px;

		h2 {
			font-size: 28px;
			font-weight: 700;
			color: #1c1c1e;
			margin: 0 0 24px;
			align-self: flex-start;
		}
	}

	.chart-container {
		display: flex;
		align-items: flex-end;
		gap: 24px;
		height: 200px;
		width: 100%;
		max-width: 400px;
		padding-top: 16px;
	}

	.bar-group {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		height: 100%;
	}

	.bar-wrapper {
		flex: 1;
		width: 100%;
		display: flex;
		align-items: flex-end;
	}

	.bar {
		width: 100%;
		border-radius: 4px 4px 0 0;
		transition: height 0.3s ease;
		min-height: 4px;
	}

	.bar-label {
		font-size: 13px;
		font-weight: 600;
		color: #86868b;
	}

	.bar-value {
		font-size: 12px;
		font-weight: 500;
		color: #6e6e73;
	}

	/* Image + text slide */
	.image-text-slide {
		flex-direction: row;
		gap: 32px;
		padding: 40px 48px;
	}

	.image-placeholder {
		width: 240px;
		height: 180px;
		border-radius: 12px;
		overflow: hidden;
		flex-shrink: 0;
	}

	.gradient-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #c7d2fe, #a5b4fc, #818cf8);
	}

	.text-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;

		h2 {
			font-size: 28px;
			font-weight: 700;
			color: #1c1c1e;
			margin: 0 0 12px;
		}

		p {
			font-size: 16px;
			color: #3a3a3c;
			line-height: 1.5;
			margin: 0 0 8px;
		}

		.text-muted {
			color: #86868b;
			font-size: 14px;
			font-weight: 500;
		}
	}

	/* Quote slide */
	.quote-slide {
		padding: 60px 80px;

		.quote-mark {
			font-size: 72px;
			font-weight: 700;
			color: #007aff;
			line-height: 0.8;
			margin-bottom: 8px;
		}

		.quote-text {
			font-size: 24px;
			color: #1c1c1e;
			line-height: 1.5;
			text-align: center;
			font-style: italic;
			margin: 0 0 16px;
		}

		.quote-author {
			font-size: 16px;
			color: #86868b;
			font-weight: 500;
			margin: 0;
		}
	}

	/* Thank you slide */
	.thankyou-slide {
		h1 {
			font-size: 48px;
			font-weight: 700;
			margin: 0 0 8px;
		}

		.subtitle {
			font-size: 20px;
			margin: 0 0 24px;
		}

		.contact-info {
			display: flex;
			gap: 12px;
			font-size: 14px;
			color: rgba(255, 255, 255, 0.7);

			span {
				background: rgba(255, 255, 255, 0.15);
				padding: 6px 14px;
				border-radius: 20px;
			}
		}
	}

	/* ── Presentation overlay ── */
	.presentation-overlay {
		position: fixed;
		inset: 0;
		background: black;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		font-family: var(--system-font-family);
	}

	.presentation-slide {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.presentation-controls {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 12px;
		padding: 10px;
		background: rgba(0, 0, 0, 0.8);
	}

	.pres-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 12px;
		background: rgba(255, 255, 255, 0.1);
		border: none;
		border-radius: 6px;
		color: white;
		font-size: 12px;
		cursor: pointer;

		&:hover {
			background: rgba(255, 255, 255, 0.2);
		}
	}

	.exit-btn {
		background: rgba(255, 59, 48, 0.6);

		&:hover {
			background: rgba(255, 59, 48, 0.8);
		}
	}

	.pres-slide-num {
		font-size: 13px;
		color: rgba(255, 255, 255, 0.7);
		min-width: 50px;
		text-align: center;
	}
</style>
