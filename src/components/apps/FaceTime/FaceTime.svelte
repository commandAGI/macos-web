<script lang="ts">
	import { onMount } from 'svelte';
	import { notify } from '../../../state/notifications.svelte';

	type CallType = 'video' | 'audio';
	type CallDirection = 'incoming' | 'outgoing' | 'missed';
	type CallFilter = 'all' | 'missed';

	type Contact = {
		name: string;
		initials: string;
		color: string;
	};

	type CallEntry = {
		id: number;
		contact: Contact;
		type: CallType;
		direction: CallDirection;
		date: string;
		time: string;
		duration: string;
	};

	let is_calling = $state(false);
	let call_status = $state<'connecting' | 'connected'>('connecting');
	let active_contact = $state<Contact | null>(null);
	let active_call_type = $state<CallType>('video');
	let search_query = $state('');
	let call_filter = $state<CallFilter>('all');
	let muted = $state(false);
	let camera_off = $state(false);

	const contacts: Contact[] = [
		{ name: 'Alice Johnson', initials: 'AJ', color: '#007aff' },
		{ name: 'Bob Smith', initials: 'BS', color: '#34c759' },
		{ name: 'Carol Davis', initials: 'CD', color: '#ff9500' },
		{ name: 'David Wilson', initials: 'DW', color: '#ff3b30' },
		{ name: 'Eve Martinez', initials: 'EM', color: '#af52de' },
		{ name: 'Frank Lee', initials: 'FL', color: '#5856d6' },
		{ name: 'Grace Kim', initials: 'GK', color: '#ff2d55' },
		{ name: 'Henry Chen', initials: 'HC', color: '#00c7be' },
	];

	const call_history: CallEntry[] = [
		{ id: 1, contact: contacts[0], type: 'video', direction: 'outgoing', date: 'Today', time: '2:34 PM', duration: '12 min' },
		{ id: 2, contact: contacts[2], type: 'audio', direction: 'incoming', date: 'Today', time: '11:15 AM', duration: '5 min' },
		{ id: 3, contact: contacts[4], type: 'video', direction: 'missed', date: 'Today', time: '9:02 AM', duration: '' },
		{ id: 4, contact: contacts[1], type: 'video', direction: 'outgoing', date: 'Yesterday', time: '8:45 PM', duration: '32 min' },
		{ id: 5, contact: contacts[5], type: 'audio', direction: 'incoming', date: 'Yesterday', time: '3:20 PM', duration: '8 min' },
		{ id: 6, contact: contacts[3], type: 'video', direction: 'missed', date: 'Yesterday', time: '1:10 PM', duration: '' },
		{ id: 7, contact: contacts[6], type: 'video', direction: 'outgoing', date: 'Monday', time: '6:30 PM', duration: '45 min' },
		{ id: 8, contact: contacts[7], type: 'audio', direction: 'incoming', date: 'Monday', time: '10:00 AM', duration: '3 min' },
		{ id: 9, contact: contacts[0], type: 'audio', direction: 'missed', date: 'Sunday', time: '7:15 PM', duration: '' },
		{ id: 10, contact: contacts[2], type: 'video', direction: 'outgoing', date: 'Sunday', time: '2:00 PM', duration: '18 min' },
	];

	const filtered_calls = $derived.by(() => {
		let calls = call_history;
		if (call_filter === 'missed') {
			calls = calls.filter(c => c.direction === 'missed');
		}
		if (search_query.trim()) {
			const q = search_query.toLowerCase();
			calls = calls.filter(c => c.contact.name.toLowerCase().includes(q));
		}
		return calls;
	});

	const sidebar_contacts = $derived.by(() => {
		// Unique contacts from call history, most recent first
		const seen = new Set<string>();
		const result: { contact: Contact; last_time: string }[] = [];
		for (const entry of call_history) {
			if (!seen.has(entry.contact.name)) {
				seen.add(entry.contact.name);
				result.push({ contact: entry.contact, last_time: `${entry.date}, ${entry.time}` });
			}
		}
		return result;
	});

	function start_call(contact: Contact, type: CallType) {
		active_contact = contact;
		active_call_type = type;
		call_status = 'connecting';
		is_calling = true;
		muted = false;
		camera_off = false;

		notify({
			app_name: 'FaceTime',
			app_icon: './app-icons/facetime/256.webp',
			title: `${type === 'video' ? 'Video' : 'Audio'} Call`,
			body: `Calling ${contact.name}...`,
		});

		// Simulate connection after 2s
		setTimeout(() => {
			if (is_calling) call_status = 'connected';
		}, 2000);
	}

	function end_call() {
		is_calling = false;
		active_contact = null;
		call_status = 'connecting';
	}

	// Simulate an incoming call notification shortly after opening
	onMount(() => {
		const missed = call_history.find(c => c.direction === 'missed');
		if (missed) {
			setTimeout(() => {
				notify({
					app_name: 'FaceTime',
					app_icon: './app-icons/facetime/256.webp',
					title: 'Incoming Call',
					body: `${missed.contact.name} is calling...`,
				});
			}, 3000);
		}
	});

	function direction_icon(dir: CallDirection): string {
		if (dir === 'outgoing') return 'M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z';
		if (dir === 'incoming') return 'M20 5.41L18.59 4 7 15.59V9H5v10h10v-2H8.41z';
		return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z';
	}
</script>

<section class="container">
	{#if is_calling && active_contact}
		<!-- Call view -->
		<div class="call-view">
			<div class="call-bg">
				<!-- Blurred background gradient -->
				<div class="call-gradient" style:background="linear-gradient(135deg, {active_contact.color}, {active_contact.color}88, #1a1a2e)"></div>

				<!-- Main caller display -->
				<div class="caller-display">
					<div class="caller-avatar-large" style:background-color={active_contact.color}>
						{active_contact.initials}
					</div>
					<p class="caller-name-large">{active_contact.name}</p>
					<p class="call-status-text">
						{#if call_status === 'connecting'}
							Connecting...
						{:else}
							FaceTime {active_call_type === 'video' ? 'Video' : 'Audio'}
						{/if}
					</p>
				</div>

				<!-- PIP (self view) -->
				{#if active_call_type === 'video' && !camera_off}
					<div class="pip-view">
						<div class="pip-content">
							<span class="pip-text">You</span>
						</div>
					</div>
				{/if}
			</div>

			<!-- Controls bar -->
			<div class="call-controls">
				<div class="controls-row">
					<button
						class="control-btn"
						class:active={muted}
						onclick={() => muted = !muted}
						title="Mute"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							{#if muted}
								<path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
							{:else}
								<path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
							{/if}
						</svg>
						<span class="control-label">Mute</span>
					</button>

					<button class="control-btn end-call-btn" onclick={end_call} title="End Call">
						<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
						</svg>
					</button>

					<button
						class="control-btn"
						class:active={camera_off}
						onclick={() => camera_off = !camera_off}
						title="Camera"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							{#if camera_off}
								<path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/>
							{:else}
								<path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
							{/if}
						</svg>
						<span class="control-label">Camera</span>
					</button>

					<button class="control-btn" title="Share Screen">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
						</svg>
						<span class="control-label">Share</span>
					</button>
				</div>
			</div>
		</div>
	{:else}
		<!-- Main view (no active call) -->
		<header class="app-window-drag-handle titlebar">
			<div class="titlebar-left">
				<span class="title-text">FaceTime</span>
			</div>
			<div class="titlebar-right">
				<button class="create-link-btn">
					<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
						<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
					</svg>
					Create Link
				</button>
			</div>
		</header>

		<div class="main-layout">
			<!-- Sidebar -->
			<aside class="sidebar">
				<div class="filter-tabs">
					<button
						class="filter-tab"
						class:active={call_filter === 'all'}
						onclick={() => call_filter = 'all'}
					>All</button>
					<button
						class="filter-tab"
						class:active={call_filter === 'missed'}
						onclick={() => call_filter = 'missed'}
					>Missed</button>
				</div>

				<div class="sidebar-contacts">
					{#each sidebar_contacts as entry}
						<button
							class="sidebar-contact"
							onclick={() => start_call(entry.contact, 'video')}
						>
							<div class="sidebar-avatar" style:background-color={entry.contact.color}>
								{entry.contact.initials}
							</div>
							<div class="sidebar-contact-info">
								<span class="sidebar-contact-name">{entry.contact.name}</span>
								<span class="sidebar-contact-time">{entry.last_time}</span>
							</div>
						</button>
					{/each}
				</div>
			</aside>

			<!-- Main content -->
			<div class="content-area">
				<div class="content-header">
					<h1 class="new-facetime-title">New FaceTime</h1>
					<div class="contact-search">
						<svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
							<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
						</svg>
						<input
							type="text"
							bind:value={search_query}
							placeholder="Enter a name, email, or number"
						/>
					</div>
				</div>

				<div class="calls-section">
					<h2 class="section-title">Recent Calls</h2>
					<div class="calls-grid">
						<!-- svelte-ignore a11y_no_static_element_interactions -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					{#each filtered_calls as call}
							<div
								class="call-entry"
								class:missed={call.direction === 'missed'}
								onclick={() => start_call(call.contact, call.type)}
							>
								<div class="call-avatar" style:background-color={call.contact.color}>
									{call.contact.initials}
								</div>
								<div class="call-details">
									<span class="call-contact-name" class:missed-text={call.direction === 'missed'}>
										{call.contact.name}
									</span>
									<div class="call-meta">
										<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="direction-icon" class:missed-icon={call.direction === 'missed'}>
											<path d={direction_icon(call.direction)}/>
										</svg>
										<span class="call-type-text">FaceTime {call.type === 'video' ? 'Video' : 'Audio'}</span>
									</div>
								</div>
								<div class="call-time-info">
									<span class="call-date">{call.date}</span>
									<span class="call-time">{call.time}</span>
									{#if call.duration}
										<span class="call-duration">{call.duration}</span>
									{/if}
								</div>
								<div class="call-actions">
									<button class="call-action-btn" onclick={(e) => { e.stopPropagation(); start_call(call.contact, 'video'); }} title="Video">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
										</svg>
									</button>
									<button class="call-action-btn" onclick={(e) => { e.stopPropagation(); start_call(call.contact, 'audio'); }} title="Audio">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
											<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
										</svg>
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
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

	/* ── Titlebar ── */
	.titlebar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 16px;
		min-height: 42px;
		background: rgba(44, 44, 46, 0.9);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		z-index: 10;
	}

	.titlebar-left {
		display: flex;
		align-items: center;
	}

	.titlebar-right {
		display: flex;
		align-items: center;
	}

	.title-text {
		font-size: 13px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.85);
	}

	.create-link-btn {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 5px 12px;
		background: rgba(255, 255, 255, 0.1);
		border: none;
		border-radius: 6px;
		color: #34c759;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;

		&:hover {
			background: rgba(255, 255, 255, 0.15);
		}
	}

	/* ── Main layout ── */
	.main-layout {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* ── Sidebar ── */
	.sidebar {
		width: 240px;
		min-width: 240px;
		background: #2c2c2e;
		border-right: 1px solid rgba(255, 255, 255, 0.06);
		display: flex;
		flex-direction: column;
	}

	.filter-tabs {
		display: flex;
		padding: 10px 12px;
		gap: 2px;
		background: rgba(0, 0, 0, 0.2);
	}

	.filter-tab {
		flex: 1;
		padding: 5px 0;
		border: none;
		background: rgba(255, 255, 255, 0.06);
		color: rgba(255, 255, 255, 0.6);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		border-radius: 6px;
		transition: all 0.15s;

		&.active {
			background: rgba(255, 255, 255, 0.15);
			color: white;
		}

		&:hover:not(.active) {
			background: rgba(255, 255, 255, 0.1);
		}
	}

	.sidebar-contacts {
		flex: 1;
		overflow-y: auto;
		padding: 4px 0;
	}

	.sidebar-contact {
		display: flex;
		align-items: center;
		gap: 10px;
		width: calc(100% - 8px);
		margin: 0 4px;
		padding: 8px 8px;
		border: none;
		background: none;
		cursor: pointer;
		color: white;
		text-align: left;
		border-radius: 8px;
		transition: background 0.1s;

		&:hover {
			background: rgba(255, 255, 255, 0.06);
		}
	}

	.sidebar-avatar {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 12px;
		font-weight: 600;
		flex-shrink: 0;
	}

	.sidebar-contact-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.sidebar-contact-name {
		font-size: 13px;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sidebar-contact-time {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.4);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ── Content area ── */
	.content-area {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	.content-header {
		padding: 20px 24px 12px;
	}

	.new-facetime-title {
		font-size: 28px;
		font-weight: 700;
		margin: 0 0 14px;
		color: white;
	}

	.contact-search {
		position: relative;

		.search-icon {
			position: absolute;
			left: 10px;
			top: 50%;
			transform: translateY(-50%);
			color: rgba(255, 255, 255, 0.4);
			pointer-events: none;
		}

		input {
			width: 100%;
			padding: 10px 12px 10px 32px;
			border: none;
			border-radius: 10px;
			background: rgba(255, 255, 255, 0.08);
			font-size: 14px;
			color: white;
			box-sizing: border-box;

			&:focus {
				outline: 2px solid #007aff;
			}

			&::placeholder {
				color: rgba(255, 255, 255, 0.35);
			}
		}
	}

	.calls-section {
		flex: 1;
		padding: 8px 24px 24px;
	}

	.section-title {
		font-size: 11px;
		font-weight: 600;
		color: #86868b;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		margin: 0 0 8px;
	}

	.calls-grid {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.call-entry {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 12px;
		background: rgba(255, 255, 255, 0.04);
		border-radius: 10px;
		cursor: pointer;
		color: white;
		transition: background 0.1s;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
		}

		&.missed {
			background: rgba(255, 59, 48, 0.06);

			&:hover {
				background: rgba(255, 59, 48, 0.1);
			}
		}
	}

	.call-avatar {
		width: 38px;
		height: 38px;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 13px;
		font-weight: 600;
		flex-shrink: 0;
	}

	.call-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.call-contact-name {
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;

		&.missed-text {
			color: #ff3b30;
		}
	}

	.call-meta {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.direction-icon {
		color: rgba(255, 255, 255, 0.4);
		flex-shrink: 0;

		&.missed-icon {
			color: #ff3b30;
		}
	}

	.call-type-text {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.5);
	}

	.call-time-info {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 1px;
		flex-shrink: 0;
	}

	.call-date {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.5);
	}

	.call-time {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.35);
	}

	.call-duration {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.3);
	}

	.call-actions {
		display: flex;
		gap: 4px;
		flex-shrink: 0;
	}

	.call-action-btn {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: none;
		background: rgba(255, 255, 255, 0.08);
		color: #007aff;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;

		&:hover {
			background: rgba(255, 255, 255, 0.15);
		}
	}

	/* ── Call view ── */
	.call-view {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.call-bg {
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	.call-gradient {
		position: absolute;
		inset: 0;
		opacity: 0.3;
	}

	.caller-display {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 12px;
		z-index: 2;
	}

	.caller-avatar-large {
		width: 96px;
		height: 96px;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 34px;
		font-weight: 600;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}

	.caller-name-large {
		font-size: 24px;
		font-weight: 600;
		margin: 0;
	}

	.call-status-text {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.6);
		margin: 0;
	}

	.pip-view {
		position: absolute;
		bottom: 16px;
		right: 16px;
		width: 120px;
		height: 160px;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
		z-index: 5;
	}

	.pip-content {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background: linear-gradient(135deg, #2c3e50, #3498db);
	}

	.pip-text {
		font-size: 13px;
		color: rgba(255, 255, 255, 0.4);
	}

	/* ── Call controls ── */
	.call-controls {
		padding: 16px 24px;
		background: rgba(28, 28, 30, 0.95);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}

	.controls-row {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		gap: 20px;
	}

	.control-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		padding: 0;

		& > svg {
			width: 48px;
			height: 48px;
			padding: 14px;
			border-radius: 50%;
			background: rgba(255, 255, 255, 0.15);
			box-sizing: border-box;
			transition: background 0.15s;
		}

		&:hover > svg {
			background: rgba(255, 255, 255, 0.22);
		}

		&.active > svg {
			background: white;
			color: #1c1c1e;
		}
	}

	.control-label {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.7);
	}

	.end-call-btn {
		& > svg {
			background: #ff3b30;
			padding: 13px;
			width: 56px;
			height: 56px;
		}

		&:hover > svg {
			background: #ff2d20;
		}
	}
</style>
