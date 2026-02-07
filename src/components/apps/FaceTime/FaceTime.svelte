<script lang="ts">
	let is_calling = $state(false);
	let selected_contact = $state<string | null>(null);

	const contacts = [
		{ name: 'Alice Johnson', status: 'Available', avatar: 'AJ', color: '#007aff' },
		{ name: 'Bob Smith', status: 'Away', avatar: 'BS', color: '#34c759' },
		{ name: 'Carol Davis', status: 'Available', avatar: 'CD', color: '#ff9500' },
		{ name: 'David Wilson', status: 'Do Not Disturb', avatar: 'DW', color: '#ff3b30' },
		{ name: 'Eve Martinez', status: 'Available', avatar: 'EM', color: '#af52de' },
	];

	function start_call(name: string) {
		selected_contact = name;
		is_calling = true;
	}

	function end_call() {
		is_calling = false;
		selected_contact = null;
	}
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar">
		<span class="title-text">FaceTime</span>
	</header>

	<div class="main">
		{#if is_calling}
			<div class="call-view">
				<div class="video-main">
					<div class="video-placeholder">
						<div class="caller-avatar" style:background-color="#007aff">
							{contacts.find(c => c.name === selected_contact)?.avatar || '?'}
						</div>
						<p class="caller-name">{selected_contact}</p>
						<p class="call-status">Connecting...</p>
					</div>

					<div class="pip-view">
						<div class="pip-placeholder">You</div>
					</div>
				</div>

				<div class="call-controls">
					<button class="control-btn mute">🎤</button>
					<button class="control-btn" onclick={end_call}>
						<span class="end-call">End</span>
					</button>
					<button class="control-btn camera">📷</button>
				</div>
			</div>
		{:else}
			<div class="sidebar">
				<div class="new-call-section">
					<button class="new-call-btn">New FaceTime</button>
				</div>

				<div class="contacts-list">
					{#each contacts as contact}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<div class="contact-item" onclick={() => start_call(contact.name)}>
							<div class="contact-avatar" style:background-color={contact.color}>
								{contact.avatar}
							</div>
							<div class="contact-info">
								<span class="contact-name">{contact.name}</span>
								<span class="contact-status">{contact.status}</span>
							</div>
							<div class="call-buttons">
								<button class="call-type-btn" onclick={(e) => { e.stopPropagation(); start_call(contact.name); }}>📹</button>
								<button class="call-type-btn" onclick={(e) => { e.stopPropagation(); start_call(contact.name); }}>📞</button>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="empty-state">
				<div class="empty-icon">📹</div>
				<p>Select a contact to start a FaceTime call</p>
			</div>
		{/if}
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
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 8px 12px;
		min-height: 38px;
		background: rgba(44, 44, 46, 0.9);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.title-text {
		font-size: 13px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.85);
	}

	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.sidebar {
		width: 260px;
		min-width: 260px;
		background: #2c2c2e;
		border-right: 1px solid rgba(255, 255, 255, 0.06);
		display: flex;
		flex-direction: column;
	}

	.new-call-section {
		padding: 12px;
	}

	.new-call-btn {
		width: 100%;
		padding: 8px;
		background: #34c759;
		border: none;
		border-radius: 8px;
		color: white;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;

		&:hover {
			background: #2db84d;
		}
	}

	.contacts-list {
		flex: 1;
		overflow-y: auto;
	}

	.contact-item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 10px 12px;
		border: none;
		background: none;
		cursor: pointer;
		color: white;
		text-align: left;

		&:hover {
			background: rgba(255, 255, 255, 0.06);
		}
	}

	.contact-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 13px;
		font-weight: 600;
		flex-shrink: 0;
	}

	.contact-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.contact-name {
		font-size: 14px;
		font-weight: 500;
	}

	.contact-status {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.5);
	}

	.call-buttons {
		display: flex;
		gap: 6px;
	}

	.call-type-btn {
		background: rgba(255, 255, 255, 0.1);
		border: none;
		border-radius: 50%;
		width: 30px;
		height: 30px;
		font-size: 14px;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;

		&:hover {
			background: rgba(255, 255, 255, 0.15);
		}
	}

	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: rgba(255, 255, 255, 0.4);
		font-size: 14px;
	}

	.empty-icon {
		font-size: 48px;
		margin-bottom: 12px;
	}

	.call-view {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.video-main {
		flex: 1;
		position: relative;
		background: linear-gradient(135deg, #1a1a2e, #16213e);
	}

	.video-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 12px;
	}

	.caller-avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 28px;
		font-weight: 600;
	}

	.caller-name {
		font-size: 22px;
		font-weight: 600;
	}

	.call-status {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.6);
	}

	.pip-view {
		position: absolute;
		bottom: 16px;
		right: 16px;
		width: 120px;
		height: 160px;
		background: #2c2c2e;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
	}

	.pip-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 13px;
		color: rgba(255, 255, 255, 0.4);
		background: linear-gradient(135deg, #2c3e50, #3498db);
	}

	.call-controls {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 24px;
		padding: 16px;
		background: rgba(28, 28, 30, 0.95);
	}

	.control-btn {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: none;
		background: rgba(255, 255, 255, 0.15);
		font-size: 20px;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;

		&:hover {
			background: rgba(255, 255, 255, 0.2);
		}
	}

	.end-call {
		font-size: 12px;
		color: white;
		font-weight: 600;
	}

	.control-btn:has(.end-call) {
		width: 64px;
		border-radius: 24px;
		background: #ff3b30;

		&:hover {
			background: #ff2d20;
		}
	}
</style>
