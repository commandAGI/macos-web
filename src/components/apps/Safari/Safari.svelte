<script lang="ts">
	const {
		is_being_dragged,
	}: {
		is_being_dragged: boolean;
	} = $props();

	let url = $state('https://www.apple.com');
	let url_input = $state('https://www.apple.com');
	let active_tab = $state(0);
	let tabs = $state([{ title: 'Apple', url: 'https://www.apple.com' }]);
	let iframe_src = $state('https://www.apple.com');

	const bookmarks = ['Apple', 'GitHub', 'Wikipedia', 'YouTube', 'Reddit'];

	function navigate() {
		let target = url_input;
		if (!target.startsWith('http://') && !target.startsWith('https://')) {
			target = 'https://' + target;
		}
		url = target;
		iframe_src = target;
		tabs[active_tab].url = target;
		tabs[active_tab].title = new URL(target).hostname;
	}

	function go_back() {
		// Placeholder
	}

	function go_forward() {
		// Placeholder
	}

	function refresh() {
		iframe_src = '';
		setTimeout(() => { iframe_src = url; }, 100);
	}

	function add_tab() {
		tabs = [...tabs, { title: 'New Tab', url: 'about:blank' }];
		active_tab = tabs.length - 1;
		url = 'about:blank';
		url_input = '';
		iframe_src = 'about:blank';
	}

	function select_tab(index: number) {
		active_tab = index;
		url = tabs[index].url;
		url_input = tabs[index].url;
		iframe_src = tabs[index].url;
	}
</script>

<section class="container">
	<header class="app-window-drag-handle chrome">
		<div class="tab-bar">
			{#each tabs as tab, i}
				<button
					class="tab"
					class:active={active_tab === i}
					onclick={() => select_tab(i)}
				>
					<span class="tab-title">{tab.title}</span>
				</button>
			{/each}
			<button class="tab-add" onclick={add_tab}>+</button>
		</div>

		<div class="nav-bar">
			<div class="nav-buttons">
				<button class="nav-btn" onclick={go_back}>‹</button>
				<button class="nav-btn" onclick={go_forward}>›</button>
			</div>

			<div class="url-bar">
				<input
					type="text"
					bind:value={url_input}
					onkeydown={(e) => { if (e.key === 'Enter') navigate(); }}
					placeholder="Search or enter website name"
				/>
			</div>

			<button class="nav-btn" onclick={refresh}>↻</button>
		</div>

		<div class="bookmarks-bar">
			{#each bookmarks as bm}
				<button class="bookmark">{bm}</button>
			{/each}
		</div>
	</header>

	<div class="content">
		{#if !is_being_dragged}
			<iframe
				src={iframe_src}
				title="Safari Browser"
				sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
			></iframe>
		{:else}
			<div class="drag-overlay">
				<p>{url}</p>
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

	.chrome {
		background: linear-gradient(to bottom, #e8e8ed, #dcdce1);
		border-bottom: 1px solid #b5b5b5;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
			border-bottom-color: #1c1c1e;
		}
	}

	.tab-bar {
		display: flex;
		align-items: flex-end;
		padding: 8px 80px 0 80px;
		gap: 1px;
	}

	.tab {
		padding: 6px 16px;
		background: rgba(0, 0, 0, 0.04);
		border: none;
		border-radius: 6px 6px 0 0;
		font-size: 12px;
		color: #6e6e73;
		cursor: pointer;
		max-width: 180px;
		min-width: 80px;

		&.active {
			background: white;
			color: var(--system-color-light-contrast);
			box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.06);
		}

		:global(body.dark) &.active {
			background: #48484a;
			color: white;
		}
	}

	.tab-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tab-add {
		padding: 4px 10px;
		background: none;
		border: none;
		font-size: 16px;
		color: #86868b;
		cursor: pointer;

		&:hover {
			color: var(--system-color-light-contrast);
		}
	}

	.nav-bar {
		display: flex;
		align-items: center;
		padding: 6px 12px;
		gap: 8px;
	}

	.nav-buttons {
		display: flex;
		gap: 2px;
	}

	.nav-btn {
		background: none;
		border: none;
		font-size: 18px;
		color: #86868b;
		padding: 2px 6px;
		cursor: pointer;
		border-radius: 4px;

		&:hover {
			background-color: rgba(0, 0, 0, 0.06);
		}
	}

	.url-bar {
		flex: 1;

		input {
			width: 100%;
			padding: 6px 12px;
			border: none;
			border-radius: 8px;
			background-color: rgba(0, 0, 0, 0.06);
			font-size: 13px;
			color: var(--system-color-light-contrast);
			text-align: center;

			&:focus {
				outline: 2px solid #007aff;
				outline-offset: -1px;
				text-align: left;
			}

			:global(body.dark) & {
				background-color: rgba(255, 255, 255, 0.1);
			}
		}
	}

	.bookmarks-bar {
		display: flex;
		padding: 4px 12px 6px;
		gap: 4px;
		border-top: 1px solid rgba(0, 0, 0, 0.06);
	}

	.bookmark {
		padding: 2px 10px;
		background: none;
		border: none;
		font-size: 12px;
		color: #007aff;
		cursor: pointer;
		border-radius: 4px;

		&:hover {
			background-color: rgba(0, 122, 255, 0.08);
		}
	}

	.content {
		flex: 1;
		overflow: hidden;
	}

	iframe {
		width: 100%;
		height: 100%;
		border: none;
		background: white;
	}

	.drag-overlay {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background: var(--system-color-light);
		color: #86868b;
		font-size: 14px;
	}
</style>
