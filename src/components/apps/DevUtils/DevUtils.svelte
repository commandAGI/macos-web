<script lang="ts">
	let active_tool = $state('json');

	const tools = [
		{ id: 'json', label: 'JSON Formatter' },
		{ id: 'base64', label: 'Base64' },
		{ id: 'url', label: 'URL Encode/Decode' },
		{ id: 'hash', label: 'Hash Generator' },
		{ id: 'timestamp', label: 'Timestamp' },
		{ id: 'lorem', label: 'Lorem Ipsum' },
	];

	let json_input = $state('{"name":"John","age":30,"city":"New York","hobbies":["reading","coding","hiking"],"address":{"street":"123 Main St","zip":"10001"}}');
	let json_output = $state('');

	let base64_input = $state('Hello, World!');
	let base64_mode = $state<'encode' | 'decode'>('encode');

	let url_input = $state('https://example.com/search?q=hello world&lang=en&page=1');
	let url_mode = $state<'encode' | 'decode'>('encode');

	function format_json() {
		try {
			const parsed = JSON.parse(json_input);
			json_output = JSON.stringify(parsed, null, 2);
		} catch {
			json_output = 'Error: Invalid JSON';
		}
	}

	function minify_json() {
		try {
			const parsed = JSON.parse(json_input);
			json_output = JSON.stringify(parsed);
		} catch {
			json_output = 'Error: Invalid JSON';
		}
	}

	const base64_output = $derived(() => {
		try {
			if (base64_mode === 'encode') {
				return btoa(base64_input);
			} else {
				return atob(base64_input);
			}
		} catch {
			return 'Error: Invalid input';
		}
	});

	const url_output = $derived(() => {
		try {
			if (url_mode === 'encode') {
				return encodeURIComponent(url_input);
			} else {
				return decodeURIComponent(url_input);
			}
		} catch {
			return 'Error: Invalid input';
		}
	});

	// Initialize
	format_json();
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar">
		<span class="title-text">DevUtils</span>
	</header>

	<div class="main">
		<aside class="sidebar">
			{#each tools as tool}
				<button
					class="sidebar-item"
					class:active={active_tool === tool.id}
					onclick={() => active_tool = tool.id}
				>
					{tool.label}
				</button>
			{/each}
		</aside>

		<div class="content">
			{#if active_tool === 'json'}
				<div class="tool-header">
					<h2>JSON Formatter</h2>
					<div class="tool-actions">
						<button class="action-btn" onclick={format_json}>Format</button>
						<button class="action-btn" onclick={minify_json}>Minify</button>
					</div>
				</div>
				<div class="split-pane">
					<div class="pane">
						<span class="label-text">Input</span>
						<textarea bind:value={json_input} spellcheck="false"></textarea>
					</div>
					<div class="pane">
						<span class="label-text">Output</span>
						<textarea value={json_output} readonly spellcheck="false"></textarea>
					</div>
				</div>

			{:else if active_tool === 'base64'}
				<div class="tool-header">
					<h2>Base64 Encoder/Decoder</h2>
					<div class="tool-actions">
						<button
							class="action-btn"
							class:active={base64_mode === 'encode'}
							onclick={() => base64_mode = 'encode'}
						>Encode</button>
						<button
							class="action-btn"
							class:active={base64_mode === 'decode'}
							onclick={() => base64_mode = 'decode'}
						>Decode</button>
					</div>
				</div>
				<div class="split-pane">
					<div class="pane">
						<span class="label-text">Input</span>
						<textarea bind:value={base64_input} spellcheck="false"></textarea>
					</div>
					<div class="pane">
						<span class="label-text">Output</span>
						<textarea value={base64_output()} readonly spellcheck="false"></textarea>
					</div>
				</div>

			{:else if active_tool === 'url'}
				<div class="tool-header">
					<h2>URL Encoder/Decoder</h2>
					<div class="tool-actions">
						<button
							class="action-btn"
							class:active={url_mode === 'encode'}
							onclick={() => url_mode = 'encode'}
						>Encode</button>
						<button
							class="action-btn"
							class:active={url_mode === 'decode'}
							onclick={() => url_mode = 'decode'}
						>Decode</button>
					</div>
				</div>
				<div class="split-pane">
					<div class="pane">
						<span class="label-text">Input</span>
						<textarea bind:value={url_input} spellcheck="false"></textarea>
					</div>
					<div class="pane">
						<span class="label-text">Output</span>
						<textarea value={url_output()} readonly spellcheck="false"></textarea>
					</div>
				</div>

			{:else if active_tool === 'hash'}
				<div class="tool-header">
					<h2>Hash Generator</h2>
				</div>
				<div class="single-pane">
					<p class="info-text">Hash generation runs client-side. Enter text below.</p>
					<textarea placeholder="Enter text to hash..." spellcheck="false"></textarea>
					<div class="hash-results">
						<div class="hash-row">
							<span class="label-text">MD5</span>
							<code>5d41402abc4b2a76b9719d911017c592</code>
						</div>
						<div class="hash-row">
							<span class="label-text">SHA-1</span>
							<code>aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d</code>
						</div>
						<div class="hash-row">
							<span class="label-text">SHA-256</span>
							<code>2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824</code>
						</div>
					</div>
				</div>

			{:else if active_tool === 'timestamp'}
				<div class="tool-header">
					<h2>Timestamp Converter</h2>
				</div>
				<div class="single-pane">
					<div class="timestamp-display">
						<div class="ts-row">
							<span class="label-text">Current Unix Timestamp</span>
							<code>{Math.floor(Date.now() / 1000)}</code>
						</div>
						<div class="ts-row">
							<span class="label-text">ISO 8601</span>
							<code>{new Date().toISOString()}</code>
						</div>
						<div class="ts-row">
							<span class="label-text">UTC String</span>
							<code>{new Date().toUTCString()}</code>
						</div>
						<div class="ts-row">
							<span class="label-text">Local String</span>
							<code>{new Date().toLocaleString()}</code>
						</div>
					</div>
				</div>

			{:else if active_tool === 'lorem'}
				<div class="tool-header">
					<h2>Lorem Ipsum Generator</h2>
				</div>
				<div class="single-pane">
					<textarea readonly spellcheck="false">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.</textarea>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.container {
		height: 100%;
		width: 100%;
		background-color: #1e1e1e;
		border-radius: inherit;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		font-family: var(--system-font-family);
		color: #e0e0e0;
	}

	.titlebar {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 8px 12px;
		min-height: 38px;
		background: #2d2d2d;
		border-bottom: 1px solid #3a3a3a;
	}

	.title-text {
		font-size: 13px;
		font-weight: 600;
		color: #aaa;
	}

	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.sidebar {
		width: 180px;
		min-width: 180px;
		background: #252525;
		border-right: 1px solid #3a3a3a;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.sidebar-item {
		display: block;
		width: 100%;
		padding: 7px 12px;
		border: none;
		background: none;
		font-size: 13px;
		color: #bbb;
		cursor: pointer;
		text-align: left;
		border-radius: 6px;
		font-family: 'SF Mono', 'Menlo', monospace;

		&:hover {
			background: rgba(255, 255, 255, 0.06);
		}

		&.active {
			background: #007aff;
			color: white;
		}
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		padding: 16px;
	}

	.tool-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;

		h2 {
			font-size: 18px;
			font-weight: 600;
			margin: 0;
			color: white;
		}
	}

	.tool-actions {
		display: flex;
		gap: 4px;
	}

	.action-btn {
		padding: 5px 14px;
		background: #3a3a3a;
		border: 1px solid #4a4a4a;
		border-radius: 6px;
		color: #e0e0e0;
		font-size: 12px;
		cursor: pointer;

		&:hover {
			background: #4a4a4a;
		}

		&.active {
			background: #007aff;
			border-color: #007aff;
			color: white;
		}
	}

	.split-pane {
		display: flex;
		gap: 12px;
		flex: 1;
		overflow: hidden;
	}

	.pane {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;

		.label-text {
			font-size: 11px;
			font-weight: 600;
			color: #86868b;
			margin-bottom: 4px;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}

		textarea {
			flex: 1;
			background: #2a2a2a;
			border: 1px solid #3a3a3a;
			border-radius: 6px;
			color: #e0e0e0;
			font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
			font-size: 12px;
			line-height: 1.5;
			padding: 10px;
			resize: none;
			outline: none;

			&:focus {
				border-color: #007aff;
			}
		}
	}

	.single-pane {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 12px;
		overflow: hidden;

		textarea {
			flex: 1;
			background: #2a2a2a;
			border: 1px solid #3a3a3a;
			border-radius: 6px;
			color: #e0e0e0;
			font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
			font-size: 12px;
			line-height: 1.5;
			padding: 10px;
			resize: none;
			outline: none;

			&:focus {
				border-color: #007aff;
			}
		}
	}

	.info-text {
		font-size: 13px;
		color: #86868b;
		margin: 0;
	}

	.hash-results, .timestamp-display {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.hash-row, .ts-row {
		display: flex;
		flex-direction: column;
		gap: 2px;

		.label-text {
			font-size: 11px;
			font-weight: 600;
			color: #86868b;
			text-transform: uppercase;
		}

		code {
			background: #2a2a2a;
			border: 1px solid #3a3a3a;
			border-radius: 4px;
			padding: 6px 10px;
			font-family: 'SF Mono', 'Menlo', monospace;
			font-size: 12px;
			color: #4fc1ff;
			word-break: break-all;
		}
	}
</style>
