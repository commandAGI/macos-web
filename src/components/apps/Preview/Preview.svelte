<script lang="ts">
	import { consume_pending_file } from '../../../state/file-opener.svelte';

	// ── Types ──
	type Page = {
		id: number;
		title: string;
		render: 'title' | 'summary' | 'financials' | 'team' | 'outlook';
	};

	type ViewMode = 'single' | 'continuous' | 'two-page';
	type MarkupTool = 'none' | 'text' | 'shapes' | 'signature' | 'highlight';

	// ── File opener integration ──
	type OpenedFile = { path: string; content?: string } | null;
	let opened_file = $state<OpenedFile>(null);

	// On mount, check if a file was opened via the file-opener service
	const pending = consume_pending_file();
	if (pending) {
		opened_file = pending;
	}

	/** Determine whether the opened file is an image by extension. */
	function is_image_ext(path: string): boolean {
		const ext = path.slice(path.lastIndexOf('.')).toLowerCase();
		return ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.ico', '.svg', '.heic', '.tiff'].includes(ext);
	}

	// ── Data ──
	const default_pages: Page[] = [
		{ id: 1, title: 'Cover', render: 'title' },
		{ id: 2, title: 'Executive Summary', render: 'summary' },
		{ id: 3, title: 'Financial Highlights', render: 'financials' },
		{ id: 4, title: 'Team', render: 'team' },
		{ id: 5, title: 'Outlook', render: 'outlook' },
	];

	const team_members = [
		{ name: 'Sarah Chen', role: 'CEO', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
		{ name: 'James Park', role: 'CTO', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
		{ name: 'Maria Lopez', role: 'CFO', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
		{ name: 'David Kim', role: 'COO', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
		{ name: 'Emily Zhang', role: 'VP Engineering', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
		{ name: 'Alex Rivera', role: 'VP Design', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
		{ name: 'Rachel Nguyen', role: 'VP Sales', gradient: 'linear-gradient(135deg, #f5af19, #f12711)' },
		{ name: 'Tom Wilson', role: 'VP Marketing', gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)' },
	];

	const financial_data = [
		{ label: 'Q1', revenue: 42, expenses: 31 },
		{ label: 'Q2', revenue: 58, expenses: 35 },
		{ label: 'Q3', revenue: 65, expenses: 38 },
		{ label: 'Q4', revenue: 78, expenses: 42 },
	];

	// ── Derived: use opened file or default demo content ──
	const pages = $derived(opened_file ? [] as Page[] : default_pages);

	// ── State ──
	let zoom_level = $state(100);
	let active_page = $state(0);
	let view_mode = $state<ViewMode>('continuous');
	let active_markup = $state<MarkupTool>('none');
	let sidebar_visible = $state(true);
	let sidebar_view = $state<'thumbnails' | 'toc'>('thumbnails');
	let search_query = $state('');
	let search_visible = $state(false);

	const doc_title = $derived(
		opened_file ? opened_file.path.split('/').pop() ?? 'Untitled' : 'Annual Report 2024.pdf'
	);
	const total_pages = $derived(opened_file ? 1 : pages.length);

	// ── Derived ──
	let page_label = $derived(`Page ${active_page + 1} of ${total_pages}`);

	// ── Functions ──
	function zoom_in() {
		if (zoom_level < 400) zoom_level = Math.min(400, zoom_level + 25);
	}

	function zoom_out() {
		if (zoom_level > 25) zoom_level = Math.max(25, zoom_level - 25);
	}

	function zoom_actual() {
		zoom_level = 100;
	}

	function zoom_fit() {
		zoom_level = 75;
	}

	function go_prev() {
		if (active_page > 0) active_page--;
	}

	function go_next() {
		if (active_page < total_pages - 1) active_page++;
	}

	function toggle_sidebar() {
		sidebar_visible = !sidebar_visible;
	}

	function set_view(mode: ViewMode) {
		view_mode = mode;
	}

	function set_markup(tool: MarkupTool) {
		active_markup = active_markup === tool ? 'none' : tool;
	}

	function toggle_search() {
		search_visible = !search_visible;
		if (!search_visible) search_query = '';
	}

	function scroll_to_page(index: number) {
		active_page = index;
		const el = document.getElementById(`preview-page-${index}`);
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function handle_scroll(e: Event) {
		if (view_mode !== 'continuous') return;
		const container = e.target as HTMLElement;
		const scroll_top = container.scrollTop;
		const page_elements = container.querySelectorAll('.document-page');
		for (let i = 0; i < page_elements.length; i++) {
			const el = page_elements[i] as HTMLElement;
			const top = el.offsetTop - container.offsetTop;
			const bottom = top + el.offsetHeight;
			if (scroll_top >= top - 60 && scroll_top < bottom - 60) {
				active_page = i;
				break;
			}
		}
	}

	function max_bar(data: typeof financial_data): number {
		let m = 0;
		for (const d of data) {
			if (d.revenue > m) m = d.revenue;
			if (d.expenses > m) m = d.expenses;
		}
		return m;
	}
</script>

<section class="container">
	<!-- Toolbar -->
	<header class="app-window-drag-handle toolbar">
		<div class="toolbar-group">
			<button class="tool-btn" title="Toggle Sidebar" onclick={toggle_sidebar}>
				<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1" y="2" width="14" height="12" rx="1.5"/><line x1="5.5" y1="2" x2="5.5" y2="14"/></svg>
			</button>
			<span class="toolbar-sep"></span>
			<button class="tool-btn" title="Previous" onclick={go_prev} disabled={active_page === 0}>
				<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="10,3 5,8 10,13"/></svg>
			</button>
			<button class="tool-btn" title="Next" onclick={go_next} disabled={active_page === total_pages - 1}>
				<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,3 11,8 6,13"/></svg>
			</button>
		</div>

		<div class="toolbar-group">
			<button class="tool-btn" title="Zoom Out" onclick={zoom_out}>
				<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/><line x1="5" y1="7" x2="9" y2="7"/></svg>
			</button>
			<span class="zoom-label">{zoom_level}%</span>
			<button class="tool-btn" title="Zoom In" onclick={zoom_in}>
				<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/><line x1="5" y1="7" x2="9" y2="7"/><line x1="7" y1="5" x2="7" y2="9"/></svg>
			</button>
			<span class="toolbar-sep"></span>
			<button class="tool-btn text-btn" title="Actual Size" onclick={zoom_actual}>Actual</button>
			<button class="tool-btn text-btn" title="Fit to Window" onclick={zoom_fit}>Fit</button>
		</div>

		<div class="toolbar-group">
			<button class="tool-btn" class:active={view_mode === 'single'} title="Single Page" onclick={() => set_view('single')}>
				<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="1" width="10" height="14" rx="1"/></svg>
			</button>
			<button class="tool-btn" class:active={view_mode === 'continuous'} title="Continuous" onclick={() => set_view('continuous')}>
				<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="0.5" width="10" height="6" rx="1"/><rect x="3" y="9.5" width="10" height="6" rx="1"/></svg>
			</button>
			<button class="tool-btn" class:active={view_mode === 'two-page'} title="Two Page" onclick={() => set_view('two-page')}>
				<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="0.5" y="2" width="6.5" height="12" rx="1"/><rect x="9" y="2" width="6.5" height="12" rx="1"/></svg>
			</button>
		</div>

		<div class="toolbar-group">
			<button class="tool-btn" class:active={active_markup === 'text'} title="Text" onclick={() => set_markup('text')}>
				<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><text x="3" y="13" font-size="13" font-weight="600" font-family="serif">A</text></svg>
			</button>
			<button class="tool-btn" class:active={active_markup === 'shapes'} title="Shapes" onclick={() => set_markup('shapes')}>
				<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2" y="2" width="12" height="12" rx="1"/></svg>
			</button>
			<button class="tool-btn" class:active={active_markup === 'signature'} title="Signature" onclick={() => set_markup('signature')}>
				<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2 12c2-4 3-7 5-7s2 5 4 5 2-3 3-3"/></svg>
			</button>
			<button class="tool-btn" class:active={active_markup === 'highlight'} title="Highlight" onclick={() => set_markup('highlight')}>
				<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M10 2l4 4-8 8H2v-4z"/><line x1="8" y1="4" x2="12" y2="8"/></svg>
			</button>
		</div>

		<div class="toolbar-group toolbar-right">
			{#if search_visible}
				<input
					class="search-input"
					type="text"
					placeholder="Search..."
					bind:value={search_query}
				/>
			{/if}
			<button class="tool-btn" class:active={search_visible} title="Search" onclick={toggle_search}>
				<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6.5" cy="6.5" r="4.5"/><line x1="10" y1="10" x2="14" y2="14" stroke-linecap="round"/></svg>
			</button>
		</div>
	</header>

	<!-- Main area -->
	<div class="main">
		<!-- Sidebar -->
		{#if sidebar_visible}
			<aside class="sidebar">
				<div class="sidebar-tabs">
					<button
						class="sidebar-tab"
						class:active={sidebar_view === 'thumbnails'}
						onclick={() => sidebar_view = 'thumbnails'}
					>Thumbnails</button>
					<button
						class="sidebar-tab"
						class:active={sidebar_view === 'toc'}
						onclick={() => sidebar_view = 'toc'}
					>Contents</button>
				</div>

				{#if sidebar_view === 'thumbnails'}
					<div class="thumbnail-list">
						{#each pages as page, i}
							<button
								class="thumbnail-item"
								class:active={active_page === i}
								onclick={() => scroll_to_page(i)}
							>
								<div class="thumbnail-page">
									<div class="thumbnail-inner">
										{#if page.render === 'title'}
											<div class="thumb-cover">
												<div class="thumb-cover-bar"></div>
												<span class="thumb-title-text">Annual Report</span>
											</div>
										{:else if page.render === 'summary'}
											<div class="thumb-lines">
												<div class="thumb-heading"></div>
												<div class="thumb-line"></div>
												<div class="thumb-line"></div>
												<div class="thumb-line short"></div>
												<div class="thumb-line"></div>
											</div>
										{:else if page.render === 'financials'}
											<div class="thumb-chart">
												<div class="thumb-heading"></div>
												<div class="thumb-bars">
													<div class="thumb-bar" style:height="40%"></div>
													<div class="thumb-bar" style:height="55%"></div>
													<div class="thumb-bar" style:height="65%"></div>
													<div class="thumb-bar" style:height="80%"></div>
												</div>
											</div>
										{:else if page.render === 'team'}
											<div class="thumb-team">
												<div class="thumb-heading"></div>
												<div class="thumb-avatars">
													<div class="thumb-avatar"></div>
													<div class="thumb-avatar"></div>
													<div class="thumb-avatar"></div>
													<div class="thumb-avatar"></div>
												</div>
											</div>
										{:else}
											<div class="thumb-lines">
												<div class="thumb-heading"></div>
												<div class="thumb-bullet"></div>
												<div class="thumb-bullet"></div>
												<div class="thumb-bullet"></div>
											</div>
										{/if}
									</div>
								</div>
								<span class="thumbnail-label">{i + 1}</span>
							</button>
						{/each}
					</div>
				{:else}
					<div class="toc-list">
						{#each pages as page, i}
							<button
								class="toc-item"
								class:active={active_page === i}
								onclick={() => scroll_to_page(i)}
							>
								<span class="toc-title">{page.title}</span>
								<span class="toc-page">{i + 1}</span>
							</button>
						{/each}
					</div>
				{/if}
			</aside>
		{/if}

		<!-- Document Area -->
		<div
			class="document-area"
			class:two-page={view_mode === 'two-page'}
			onscroll={handle_scroll}
		>
			<div
				class="document-scroll"
				style:transform="scale({zoom_level / 100})"
				style:transform-origin="top center"
			>
				{#if opened_file}
					<!-- Opened file content -->
					<div class="document-page">
						<div class="page-paper">
							{#if is_image_ext(opened_file.path)}
								<div class="opened-file-image">
									<div class="image-placeholder">
										<svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
											<rect x="2" y="2" width="20" height="20" rx="2"/>
											<circle cx="8.5" cy="8.5" r="2.5"/>
											<path d="m21 15-5-5L5 21"/>
										</svg>
										<span class="image-filename">{opened_file.path.split('/').pop()}</span>
									</div>
								</div>
							{:else if opened_file.content}
								<div class="opened-file-text">
									<pre class="file-content-pre">{opened_file.content}</pre>
								</div>
							{:else}
								<div class="opened-file-image">
									<div class="image-placeholder">
										<svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
											<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
											<polyline points="14 2 14 8 20 8"/>
										</svg>
										<span class="image-filename">{opened_file.path.split('/').pop()}</span>
									</div>
								</div>
							{/if}
							<div class="page-number">1</div>
						</div>
					</div>
				{:else if view_mode === 'single'}
					<!-- Single page mode -->
					<div class="document-page" id="preview-page-{active_page}">
						{@render page_content(pages[active_page])}
					</div>
				{:else if view_mode === 'two-page'}
					<!-- Two page mode -->
					{#each { length: Math.ceil(total_pages / 2) } as _, pair_idx}
						{@const left_idx = pair_idx * 2}
						{@const right_idx = pair_idx * 2 + 1}
						<div class="page-pair">
							<div class="document-page" id="preview-page-{left_idx}">
								{@render page_content(pages[left_idx])}
							</div>
							{#if right_idx < total_pages}
								<div class="document-page" id="preview-page-{right_idx}">
									{@render page_content(pages[right_idx])}
								</div>
							{/if}
						</div>
					{/each}
				{:else}
					<!-- Continuous mode -->
					{#each pages as page, i}
						<div class="document-page" id="preview-page-{i}">
							{@render page_content(page)}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>

	<!-- Info bar -->
	<div class="info-bar">
		<span class="info-title">{doc_title}</span>
		<span class="info-page">{page_label}</span>
	</div>
</section>

<!-- Page content snippets -->
{#snippet page_content(page: Page)}
	<div class="page-paper">
		{#if page.render === 'title'}
			<div class="page-cover">
				<div class="cover-header-bar"></div>
				<div class="cover-content">
					<div class="cover-year">2024</div>
					<h1 class="cover-title">Annual Report</h1>
					<div class="cover-subtitle">Innovating for the future</div>
					<div class="cover-divider"></div>
					<div class="cover-company">Apex Technologies Inc.</div>
					<div class="cover-date">Published January 2025</div>
				</div>
				<div class="cover-footer">
					<span>Confidential</span>
					<span>NYSE: APEX</span>
				</div>
			</div>
		{:else if page.render === 'summary'}
			<div class="page-body">
				<h2 class="section-title">Executive Summary</h2>
				<div class="section-rule"></div>
				<p class="body-text">
					Fiscal year 2024 represented a transformative period for Apex Technologies. The company delivered record revenue growth of 34% year-over-year, driven by strong demand across our enterprise software and cloud infrastructure divisions. Our strategic investments in artificial intelligence and machine learning capabilities have begun to yield measurable returns, with AI-powered products now contributing 28% of total revenue.
				</p>
				<p class="body-text">
					Operating margins expanded to 22.4%, reflecting improved operational efficiency and disciplined cost management. We successfully completed three strategic acquisitions that strengthen our position in key growth markets, including data analytics and cybersecurity.
				</p>
				<p class="body-text">
					Customer retention rates reached an all-time high of 96.2%, and our net promoter score improved by 12 points to 72. The launch of our next-generation platform in Q3 attracted over 1,200 new enterprise clients within the first 90 days.
				</p>
				<div class="summary-highlights">
					<div class="highlight-card">
						<div class="highlight-value">$2.4B</div>
						<div class="highlight-label">Revenue</div>
					</div>
					<div class="highlight-card">
						<div class="highlight-value">34%</div>
						<div class="highlight-label">YoY Growth</div>
					</div>
					<div class="highlight-card">
						<div class="highlight-value">96.2%</div>
						<div class="highlight-label">Retention</div>
					</div>
					<div class="highlight-card">
						<div class="highlight-value">4,800+</div>
						<div class="highlight-label">Employees</div>
					</div>
				</div>
			</div>
		{:else if page.render === 'financials'}
			<div class="page-body">
				<h2 class="section-title">Financial Highlights</h2>
				<div class="section-rule"></div>
				<p class="body-text">
					The following table and chart summarize our quarterly financial performance for fiscal year 2024. Revenue growth accelerated through each successive quarter, while expense growth remained controlled.
				</p>
				<div class="chart-container">
					<div class="chart-title">Quarterly Revenue vs. Expenses (in $M)</div>
					<div class="bar-chart">
						{#each financial_data as q}
							<div class="bar-group">
								<div class="bars-wrapper">
									<div
										class="bar revenue-bar"
										style:height="{(q.revenue / max_bar(financial_data)) * 100}%"
										title="Revenue: ${q.revenue}M"
									></div>
									<div
										class="bar expense-bar"
										style:height="{(q.expenses / max_bar(financial_data)) * 100}%"
										title="Expenses: ${q.expenses}M"
									></div>
								</div>
								<div class="bar-label">{q.label}</div>
							</div>
						{/each}
					</div>
					<div class="chart-legend">
						<span class="legend-item"><span class="legend-dot revenue"></span> Revenue</span>
						<span class="legend-item"><span class="legend-dot expense"></span> Expenses</span>
					</div>
				</div>
				<table class="data-table">
					<thead>
						<tr>
							<th>Quarter</th>
							<th>Revenue ($M)</th>
							<th>Expenses ($M)</th>
							<th>Net Income ($M)</th>
							<th>Margin</th>
						</tr>
					</thead>
					<tbody>
						{#each financial_data as q}
							<tr>
								<td>{q.label} 2024</td>
								<td>${q.revenue}M</td>
								<td>${q.expenses}M</td>
								<td>${q.revenue - q.expenses}M</td>
								<td>{((1 - q.expenses / q.revenue) * 100).toFixed(1)}%</td>
							</tr>
						{/each}
						<tr class="total-row">
							<td>Full Year</td>
							<td>${financial_data.reduce((a, q) => a + q.revenue, 0)}M</td>
							<td>${financial_data.reduce((a, q) => a + q.expenses, 0)}M</td>
							<td>${financial_data.reduce((a, q) => a + q.revenue - q.expenses, 0)}M</td>
							<td>{((1 - financial_data.reduce((a, q) => a + q.expenses, 0) / financial_data.reduce((a, q) => a + q.revenue, 0)) * 100).toFixed(1)}%</td>
						</tr>
					</tbody>
				</table>
			</div>
		{:else if page.render === 'team'}
			<div class="page-body">
				<h2 class="section-title">Leadership Team</h2>
				<div class="section-rule"></div>
				<p class="body-text">
					Our leadership team brings decades of combined experience across technology, finance, and operations. Their vision and commitment continue to drive our company forward.
				</p>
				<div class="team-grid">
					{#each team_members as member}
						<div class="team-card">
							<div class="team-avatar" style:background={member.gradient}>
								<span class="avatar-initials">
									{member.name.split(' ').map(n => n[0]).join('')}
								</span>
							</div>
							<div class="team-name">{member.name}</div>
							<div class="team-role">{member.role}</div>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="page-body">
				<h2 class="section-title">2025 Outlook</h2>
				<div class="section-rule"></div>
				<p class="body-text">
					Looking ahead, Apex Technologies is well-positioned to continue its growth trajectory. We anticipate the following strategic priorities will define our direction:
				</p>
				<ul class="outlook-list">
					<li>
						<strong>AI-First Product Strategy:</strong> Expanding our AI and machine learning capabilities across all product lines, targeting 40% of revenue from AI-powered products by end of 2025.
					</li>
					<li>
						<strong>Global Market Expansion:</strong> Entering the Asia-Pacific enterprise market with localized offerings and dedicated regional support teams.
					</li>
					<li>
						<strong>Platform Ecosystem Growth:</strong> Growing our third-party developer ecosystem to over 5,000 active partners through enhanced APIs and marketplace features.
					</li>
					<li>
						<strong>Sustainability Goals:</strong> Achieving carbon-neutral operations by Q4 2025 and publishing our first comprehensive ESG report.
					</li>
					<li>
						<strong>Talent Investment:</strong> Expanding our global workforce by 20% with an emphasis on AI research, security engineering, and customer success.
					</li>
					<li>
						<strong>Revenue Target:</strong> Projecting full-year revenue between $3.1B and $3.3B, representing 29-38% year-over-year growth.
					</li>
				</ul>
				<div class="outlook-note">
					<em>This document contains forward-looking statements that involve risks and uncertainties. Actual results may differ materially from those projected.</em>
				</div>
			</div>
		{/if}
		<div class="page-number">{page.id}</div>
	</div>
{/snippet}

<style>
	/* ── Container ── */
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
		gap: 6px;
		padding: 6px 12px;
		min-height: 40px;
		background: linear-gradient(to bottom, #f6f6f6, #e8e8e8);
		border-bottom: 1px solid #c8c8c8;
		flex-shrink: 0;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
			border-bottom-color: #1c1c1e;
		}
	}

	.toolbar-group {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.toolbar-right {
		margin-left: auto;
	}

	.toolbar-sep {
		width: 1px;
		height: 18px;
		background: #d1d1d6;
		margin: 0 4px;

		:global(body.dark) & {
			background: #48484a;
		}
	}

	.tool-btn {
		padding: 4px 6px;
		background: none;
		border: none;
		color: #6e6e73;
		cursor: pointer;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 26px;
		min-height: 26px;

		&:hover {
			background: rgba(0, 0, 0, 0.06);
		}

		&.active {
			background: rgba(0, 122, 255, 0.12);
			color: #007aff;
		}

		&:disabled {
			opacity: 0.35;
			cursor: default;
		}

		:global(body.dark) & {
			color: #98989d;

			&:hover {
				background: rgba(255, 255, 255, 0.08);
			}

			&.active {
				background: rgba(10, 132, 255, 0.2);
				color: #0a84ff;
			}
		}
	}

	.text-btn {
		font-size: 11px;
		font-weight: 600;
		padding: 4px 8px;
	}

	.zoom-label {
		font-size: 11px;
		color: #86868b;
		min-width: 36px;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	.search-input {
		width: 140px;
		height: 24px;
		padding: 0 8px;
		font-size: 12px;
		border: 1px solid #c8c8c8;
		border-radius: 6px;
		background: white;
		outline: none;

		&:focus {
			border-color: #007aff;
			box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
		}

		:global(body.dark) & {
			background: #1c1c1e;
			border-color: #48484a;
			color: #e5e5ea;

			&:focus {
				border-color: #0a84ff;
				box-shadow: 0 0 0 2px rgba(10, 132, 255, 0.25);
			}
		}
	}

	/* ── Main layout ── */
	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* ── Sidebar ── */
	.sidebar {
		width: 180px;
		min-width: 180px;
		background: #f2f2f7;
		border-right: 1px solid #d1d1d6;
		display: flex;
		flex-direction: column;
		overflow: hidden;

		:global(body.dark) & {
			background: #2c2c2e;
			border-right-color: #38383a;
		}
	}

	.sidebar-tabs {
		display: flex;
		padding: 8px 8px 0;
		gap: 0;
		border-bottom: 1px solid #d1d1d6;

		:global(body.dark) & {
			border-bottom-color: #38383a;
		}
	}

	.sidebar-tab {
		flex: 1;
		padding: 6px 4px;
		font-size: 11px;
		font-weight: 500;
		color: #86868b;
		background: none;
		border: none;
		cursor: pointer;
		border-bottom: 2px solid transparent;

		&.active {
			color: #007aff;
			border-bottom-color: #007aff;
		}

		:global(body.dark) &.active {
			color: #0a84ff;
			border-bottom-color: #0a84ff;
		}
	}

	.thumbnail-list {
		flex: 1;
		overflow-y: auto;
		padding: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}

	.thumbnail-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		border: none;
		background: none;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		width: 100%;

		&.active {
			background: rgba(0, 122, 255, 0.12);
		}

		&:hover:not(.active) {
			background: rgba(0, 0, 0, 0.04);
		}
	}

	.thumbnail-page {
		width: 120px;
		height: 156px;
		background: white;
		border-radius: 3px;
		border: 1px solid rgba(0, 0, 0, 0.12);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		overflow: hidden;

		:global(body.dark) & {
			background: #3a3a3c;
			border-color: rgba(255, 255, 255, 0.1);
		}
	}

	.thumbnail-inner {
		width: 100%;
		height: 100%;
		padding: 8px;
		display: flex;
		flex-direction: column;
	}

	.thumb-cover {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.thumb-cover-bar {
		width: 80%;
		height: 6px;
		border-radius: 3px;
		background: linear-gradient(90deg, #007aff, #5856d6);
	}

	.thumb-title-text {
		font-size: 8px;
		font-weight: 700;
		color: #1d1d1f;

		:global(body.dark) & {
			color: #e5e5ea;
		}
	}

	.thumb-lines {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.thumb-heading {
		width: 60%;
		height: 5px;
		background: #1d1d1f;
		border-radius: 2px;
		margin-bottom: 4px;

		:global(body.dark) & {
			background: #e5e5ea;
		}
	}

	.thumb-line {
		width: 100%;
		height: 3px;
		background: #d1d1d6;
		border-radius: 1.5px;

		&.short {
			width: 65%;
		}

		:global(body.dark) & {
			background: #48484a;
		}
	}

	.thumb-bullet {
		width: 90%;
		height: 3px;
		background: #d1d1d6;
		border-radius: 1.5px;
		margin-left: 8px;

		:global(body.dark) & {
			background: #48484a;
		}
	}

	.thumb-chart {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.thumb-bars {
		display: flex;
		align-items: flex-end;
		gap: 6px;
		flex: 1;
		padding-top: 8px;
	}

	.thumb-bar {
		flex: 1;
		background: #007aff;
		border-radius: 2px 2px 0 0;
		min-height: 4px;
	}

	.thumb-team {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.thumb-avatars {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		padding-top: 8px;
		justify-content: center;
	}

	.thumb-avatar {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #d1d1d6;

		:global(body.dark) & {
			background: #48484a;
		}
	}

	.thumbnail-label {
		font-size: 10px;
		color: #86868b;
	}

	/* ── Table of Contents ── */
	.toc-list {
		flex: 1;
		overflow-y: auto;
		padding: 4px 0;
	}

	.toc-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 8px 12px;
		font-size: 12px;
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;

		&.active {
			background: rgba(0, 122, 255, 0.12);
		}

		&:hover:not(.active) {
			background: rgba(0, 0, 0, 0.04);
		}
	}

	.toc-title {
		color: #1d1d1f;
		font-weight: 500;

		:global(body.dark) & {
			color: #e5e5ea;
		}
	}

	.toc-page {
		color: #86868b;
		font-size: 11px;
	}

	/* ── Document area ── */
	.document-area {
		flex: 1;
		overflow: auto;
		background: #96969b;
		display: flex;
		justify-content: center;
		padding: 20px;

		:global(body.dark) & {
			background: #1c1c1e;
		}

		&.two-page {
			align-items: flex-start;
		}
	}

	.document-scroll {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		transition: transform 0.15s ease;
	}

	.page-pair {
		display: flex;
		gap: 20px;
	}

	/* ── Document pages ── */
	.document-page {
		flex-shrink: 0;
	}

	.page-paper {
		width: 540px;
		min-height: 700px;
		background: white;
		border-radius: 2px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
		position: relative;
		overflow: hidden;

		:global(body.dark) & {
			background: #f8f8f8;
		}
	}

	.page-number {
		position: absolute;
		bottom: 20px;
		right: 30px;
		font-size: 11px;
		color: #86868b;
	}

	/* ── Cover page ── */
	.page-cover {
		height: 700px;
		display: flex;
		flex-direction: column;
	}

	.cover-header-bar {
		height: 120px;
		background: linear-gradient(135deg, #007aff 0%, #5856d6 50%, #af52de 100%);
	}

	.cover-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px;
		text-align: center;
	}

	.cover-year {
		font-size: 16px;
		font-weight: 600;
		color: #007aff;
		letter-spacing: 4px;
		text-transform: uppercase;
		margin-bottom: 8px;
	}

	.cover-title {
		font-size: 36px;
		font-weight: 700;
		color: #1d1d1f;
		margin: 0 0 8px;
		line-height: 1.2;
	}

	.cover-subtitle {
		font-size: 16px;
		color: #6e6e73;
		font-style: italic;
		margin-bottom: 24px;
	}

	.cover-divider {
		width: 60px;
		height: 3px;
		background: linear-gradient(90deg, #007aff, #5856d6);
		border-radius: 2px;
		margin-bottom: 24px;
	}

	.cover-company {
		font-size: 14px;
		font-weight: 600;
		color: #1d1d1f;
		margin-bottom: 4px;
	}

	.cover-date {
		font-size: 12px;
		color: #86868b;
	}

	.cover-footer {
		display: flex;
		justify-content: space-between;
		padding: 16px 30px;
		font-size: 10px;
		color: #86868b;
		border-top: 1px solid #e5e5ea;
	}

	/* ── Body pages ── */
	.page-body {
		padding: 40px 45px 60px;
	}

	.section-title {
		font-size: 22px;
		font-weight: 700;
		color: #1d1d1f;
		margin: 0 0 4px;
	}

	.section-rule {
		width: 40px;
		height: 3px;
		background: #007aff;
		border-radius: 2px;
		margin-bottom: 20px;
	}

	.body-text {
		font-size: 12.5px;
		line-height: 1.7;
		color: #3a3a3c;
		margin: 0 0 14px;
	}

	/* ── Summary highlights ── */
	.summary-highlights {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
		margin-top: 24px;
	}

	.highlight-card {
		text-align: center;
		padding: 16px 8px;
		border-radius: 8px;
		background: #f2f2f7;
		border: 1px solid #e5e5ea;
	}

	.highlight-value {
		font-size: 20px;
		font-weight: 700;
		color: #007aff;
	}

	.highlight-label {
		font-size: 10px;
		color: #86868b;
		margin-top: 4px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* ── Chart ── */
	.chart-container {
		margin: 20px 0;
		padding: 16px;
		background: #f9f9fb;
		border-radius: 8px;
		border: 1px solid #e5e5ea;
	}

	.chart-title {
		font-size: 12px;
		font-weight: 600;
		color: #1d1d1f;
		margin-bottom: 16px;
		text-align: center;
	}

	.bar-chart {
		display: flex;
		justify-content: center;
		gap: 24px;
		height: 140px;
		align-items: flex-end;
		padding-bottom: 4px;
	}

	.bar-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}

	.bars-wrapper {
		display: flex;
		gap: 4px;
		align-items: flex-end;
		height: 120px;
	}

	.bar {
		width: 28px;
		border-radius: 3px 3px 0 0;
		transition: height 0.3s ease;
	}

	.revenue-bar {
		background: linear-gradient(to top, #007aff, #5ac8fa);
	}

	.expense-bar {
		background: linear-gradient(to top, #ff3b30, #ff9500);
	}

	.bar-label {
		font-size: 11px;
		font-weight: 600;
		color: #6e6e73;
	}

	.chart-legend {
		display: flex;
		justify-content: center;
		gap: 20px;
		margin-top: 12px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		color: #6e6e73;
	}

	.legend-dot {
		width: 10px;
		height: 10px;
		border-radius: 2px;
	}

	.legend-dot.revenue {
		background: #007aff;
	}

	.legend-dot.expense {
		background: #ff3b30;
	}

	/* ── Data table ── */
	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 11.5px;
		margin-top: 16px;
	}

	.data-table th {
		padding: 8px 10px;
		text-align: left;
		font-weight: 600;
		color: #1d1d1f;
		border-bottom: 2px solid #d1d1d6;
		font-size: 11px;
	}

	.data-table td {
		padding: 8px 10px;
		color: #3a3a3c;
		border-bottom: 1px solid #e5e5ea;
	}

	.total-row td {
		font-weight: 700;
		color: #1d1d1f;
		border-top: 2px solid #1d1d1f;
		border-bottom: none;
	}

	/* ── Team grid ── */
	.team-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20px;
		margin-top: 24px;
	}

	.team-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.team-avatar {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8px;
	}

	.avatar-initials {
		font-size: 16px;
		font-weight: 700;
		color: white;
	}

	.team-name {
		font-size: 12px;
		font-weight: 600;
		color: #1d1d1f;
	}

	.team-role {
		font-size: 10px;
		color: #86868b;
		margin-top: 2px;
	}

	/* ── Outlook ── */
	.outlook-list {
		font-size: 12.5px;
		line-height: 1.7;
		color: #3a3a3c;
		padding-left: 20px;
		margin: 0 0 20px;
	}

	.outlook-list li {
		margin-bottom: 12px;
	}

	.outlook-list strong {
		color: #1d1d1f;
	}

	.outlook-note {
		font-size: 10.5px;
		color: #86868b;
		padding: 12px 16px;
		background: #f2f2f7;
		border-radius: 6px;
		border-left: 3px solid #d1d1d6;
	}

	/* ── Info bar ── */
	.info-bar {
		display: flex;
		justify-content: space-between;
		padding: 4px 16px;
		font-size: 11px;
		color: #86868b;
		background: #f2f2f7;
		border-top: 1px solid #d1d1d6;
		flex-shrink: 0;

		:global(body.dark) & {
			background: #2c2c2e;
			border-top-color: #38383a;
		}
	}

	.info-title {
		font-weight: 500;
	}

	/* ── Opened file content ── */
	.opened-file-image {
		width: 540px;
		min-height: 700px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.image-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 40px;
	}

	.image-filename {
		font-size: 14px;
		font-weight: 500;
		color: #6e6e73;
		max-width: 400px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: center;
	}

	.opened-file-text {
		padding: 30px 35px 60px;
		min-height: 700px;
	}

	.file-content-pre {
		font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
		font-size: 12px;
		line-height: 1.6;
		color: #1d1d1f;
		white-space: pre-wrap;
		word-wrap: break-word;
		margin: 0;
		tab-size: 4;
	}
</style>
