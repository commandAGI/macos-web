<script lang="ts">
	let search_query = $state('');
	let selected_pane = $state<string | null>(null);

	const preference_panes = [
		{ name: 'General', icon: '⚙️' },
		{ name: 'Desktop & Screensaver', icon: '🖼️' },
		{ name: 'Dock & Menu Bar', icon: '▪️' },
		{ name: 'Mission Control', icon: '🔲' },
		{ name: 'Siri', icon: '🎤' },
		{ name: 'Spotlight', icon: '🔍' },
		{ name: 'Language & Region', icon: '🌐' },
		{ name: 'Notifications', icon: '🔔' },
		{ name: 'Internet Accounts', icon: '🌎' },
		{ name: 'Passwords', icon: '🔑' },
		{ name: 'Wallet & Apple Pay', icon: '💳' },
		{ name: 'Users & Groups', icon: '👥' },
		{ name: 'Accessibility', icon: '♿' },
		{ name: 'Screen Time', icon: '⏱️' },
		{ name: 'Security & Privacy', icon: '🔒' },
		{ name: 'Software Update', icon: '🔄' },
		{ name: 'Network', icon: '📶' },
		{ name: 'Bluetooth', icon: '🔵' },
		{ name: 'Sound', icon: '🔊' },
		{ name: 'Printers & Scanners', icon: '🖨️' },
		{ name: 'Keyboard', icon: '⌨️' },
		{ name: 'Trackpad', icon: '🖱️' },
		{ name: 'Mouse', icon: '🖲️' },
		{ name: 'Displays', icon: '🖥️' },
		{ name: 'Energy Saver', icon: '🔋' },
		{ name: 'Date & Time', icon: '📅' },
		{ name: 'Sharing', icon: '📤' },
		{ name: 'Time Machine', icon: '⏰' },
		{ name: 'Startup Disk', icon: '💿' },
	];

	const filtered_panes = $derived(
		search_query
			? preference_panes.filter(p =>
				p.name.toLowerCase().includes(search_query.toLowerCase())
			)
			: preference_panes
	);

	function go_back() {
		selected_pane = null;
	}
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar">
		{#if selected_pane}
			<button class="back-btn" onclick={go_back}>‹ Show All</button>
		{/if}
		<div class="search-bar">
			<input
				type="text"
				bind:value={search_query}
				placeholder="Search"
			/>
		</div>
	</header>

	<div class="content">
		{#if selected_pane}
			<div class="pane-detail">
				<div class="pane-icon-large">
					{preference_panes.find(p => p.name === selected_pane)?.icon}
				</div>
				<h2>{selected_pane}</h2>
				<p class="pane-placeholder">Preferences for {selected_pane} would appear here.</p>

				<div class="pane-options">
					<label class="option-row">
						<span>Enable {selected_pane}</span>
						<div class="toggle on">
							<div class="toggle-knob"></div>
						</div>
					</label>
					<label class="option-row">
						<span>Show in Menu Bar</span>
						<div class="toggle">
							<div class="toggle-knob"></div>
						</div>
					</label>
					<label class="option-row">
						<span>Allow Notifications</span>
						<div class="toggle on">
							<div class="toggle-knob"></div>
						</div>
					</label>
				</div>
			</div>
		{:else}
			<div class="pane-grid">
				{#each filtered_panes as pane}
					<button class="pane-item" onclick={() => selected_pane = pane.name}>
						<div class="pane-icon">{pane.icon}</div>
						<div class="pane-name">{pane.name}</div>
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
		background-color: #f2f2f7;
		border-radius: inherit;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		font-family: var(--system-font-family);
		color: var(--system-color-light-contrast);

		:global(body.dark) & {
			background-color: #2c2c2e;
		}
	}

	.titlebar {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 12px;
		min-height: 42px;
		background: linear-gradient(to bottom, #f6f6f6, #ededef);
		border-bottom: 1px solid #d1d1d6;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
			border-bottom-color: #1c1c1e;
		}
	}

	.back-btn {
		background: none;
		border: none;
		color: #007aff;
		font-size: 13px;
		cursor: pointer;
		padding: 4px 8px;
		border-radius: 4px;
		white-space: nowrap;

		&:hover {
			background: rgba(0, 122, 255, 0.08);
		}
	}

	.search-bar {
		flex: 1;
		max-width: 240px;
		margin-left: auto;

		input {
			width: 100%;
			padding: 5px 10px;
			border: none;
			border-radius: 6px;
			background: rgba(0, 0, 0, 0.06);
			font-size: 12px;
			color: var(--system-color-light-contrast);

			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.08);
			}
		}
	}

	.content {
		flex: 1;
		overflow-y: auto;
		padding: 20px;
	}

	.pane-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
		gap: 16px;
		justify-items: center;
	}

	.pane-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		border: none;
		background: none;
		cursor: pointer;
		padding: 10px;
		border-radius: 8px;
		width: 90px;

		&:hover {
			background: rgba(0, 0, 0, 0.05);
		}
	}

	.pane-icon {
		font-size: 32px;
		width: 48px;
		height: 48px;
		display: flex;
		justify-content: center;
		align-items: center;
		background: linear-gradient(to bottom, #e8e8ec, #d8d8dc);
		border-radius: 10px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

		:global(body.dark) & {
			background: linear-gradient(to bottom, #48484a, #3a3a3c);
		}
	}

	.pane-name {
		font-size: 11px;
		text-align: center;
		color: var(--system-color-light-contrast);
		line-height: 1.2;
	}

	.pane-detail {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 20px;
	}

	.pane-icon-large {
		font-size: 48px;
		margin-bottom: 12px;
	}

	.pane-detail h2 {
		font-size: 20px;
		font-weight: 600;
		margin: 0 0 8px;
	}

	.pane-placeholder {
		font-size: 13px;
		color: #86868b;
		margin-bottom: 24px;
	}

	.pane-options {
		width: 100%;
		max-width: 400px;
		display: flex;
		flex-direction: column;
		gap: 1px;
		background: white;
		border-radius: 10px;
		overflow: hidden;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

		:global(body.dark) & {
			background: #3a3a3c;
		}
	}

	.option-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		font-size: 14px;
		background: white;
		cursor: pointer;

		:global(body.dark) & {
			background: #3a3a3c;
		}
	}

	.toggle {
		width: 40px;
		height: 24px;
		border-radius: 12px;
		background: #d1d1d6;
		position: relative;
		transition: background 0.2s;

		&.on {
			background: #34c759;
		}
	}

	.toggle-knob {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: white;
		position: absolute;
		top: 2px;
		left: 2px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		transition: transform 0.2s;
	}

	.toggle.on .toggle-knob {
		transform: translateX(16px);
	}
</style>
