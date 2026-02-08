<script lang="ts">
	import { onMount } from 'svelte';
	import { notify } from '../../../state/notifications.svelte';

	type Email = { id: number; from: string; subject: string; preview: string; body: string; date: string; read: boolean };

	const folders = [
		{ name: 'Inbox', icon: '📥', count: 3 },
		{ name: 'Drafts', icon: '📝', count: 1 },
		{ name: 'Sent', icon: '📤', count: 0 },
		{ name: 'Junk', icon: '🗑️', count: 0 },
		{ name: 'Trash', icon: '🗑️', count: 0 },
		{ name: 'Archive', icon: '📦', count: 0 },
	];

	const emails: Record<string, Email[]> = {
		Inbox: [
			{
				id: 1,
				from: 'Sarah Chen',
				subject: 'Project Update - Q1 Review',
				preview: 'Hi, I wanted to share the latest updates on our Q1 progress...',
				body: 'Hi,\n\nI wanted to share the latest updates on our Q1 progress. The team has made significant strides in the following areas:\n\n1. Product Development - Feature A is 85% complete\n2. Marketing - Campaign launch scheduled for Feb 1\n3. Sales - Pipeline looking strong with 40% growth\n\nLet me know if you have any questions.\n\nBest,\nSarah',
				date: 'Jan 15',
				read: false,
			},
			{
				id: 2,
				from: 'GitHub',
				subject: '[agi-inc/agents] Pull Request #275 merged',
				preview: 'Your pull request "fix: handle null response" has been merged...',
				body: 'Your pull request "fix: handle null response in session endpoint" has been successfully merged into main.\n\nCommit: abc1234\nBranch: fix/null-response\n\n---\nYou are receiving this because you authored the thread.',
				date: 'Jan 15',
				read: false,
			},
			{
				id: 3,
				from: 'Apple',
				subject: 'Your receipt from Apple',
				preview: 'Thank you for your purchase. Here is your receipt...',
				body: 'Thank you for your purchase.\n\nOrder ID: M-12345678\niCloud+ (200GB) - $2.99/month\n\nDate: January 15, 2024\nPayment Method: Visa ending in 4242\n\nIf you have questions, visit support.apple.com',
				date: 'Jan 14',
				read: true,
			},
			{
				id: 4,
				from: 'LinkedIn',
				subject: 'New connection request from Alex Rivera',
				preview: 'Alex Rivera wants to connect with you on LinkedIn...',
				body: 'Alex Rivera wants to connect with you on LinkedIn.\n\nAlex Rivera\nSenior Software Engineer at TechCorp\n\n"Hi! I enjoyed your talk at the conference last week. Would love to connect."\n\nAccept or Ignore this request.',
				date: 'Jan 13',
				read: true,
			},
		],
		Drafts: [
			{
				id: 5,
				from: 'Me',
				subject: 'Re: Meeting Follow-up',
				preview: 'Thanks for the meeting notes. I have a few additional points...',
				body: 'Thanks for the meeting notes. I have a few additional points to discuss:\n\n- Budget allocation for Q2\n- New hire onboarding timeline\n- ',
				date: 'Jan 14',
				read: true,
			},
		],
		Sent: [],
		Junk: [],
		Trash: [],
		Archive: [],
	};

	let selected_folder = $state('Inbox');
	let selected_email = $state<Email | null>(emails.Inbox[0]);

	function select_folder(name: string) {
		selected_folder = name;
		const folder_emails = emails[name] || [];
		selected_email = folder_emails.length > 0 ? folder_emails[0] : null;
	}

	const current_emails = $derived(emails[selected_folder] || []);

	onMount(() => {
		const unread = emails.Inbox.filter(e => !e.read);
		if (unread.length > 0) {
			notify({
				app_name: 'Mail',
				app_icon: './app-icons/mail/256.webp',
				title: `${unread.length} Unread Email${unread.length > 1 ? 's' : ''}`,
				body: `From: ${unread[0].from} — ${unread[0].subject}`,
			});
		}
	});
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar">
		<div class="toolbar-actions">
			<button class="toolbar-btn">✉️ New</button>
			<button class="toolbar-btn">📎</button>
			<button class="toolbar-btn">🗑️</button>
			<button class="toolbar-btn">↩️</button>
		</div>
	</header>

	<div class="main">
		<aside class="folder-sidebar">
			{#each folders as folder}
				<button
					class="folder-item"
					class:active={selected_folder === folder.name}
					onclick={() => select_folder(folder.name)}
				>
					<span class="folder-icon">{folder.icon}</span>
					<span class="folder-name">{folder.name}</span>
					{#if folder.count > 0}
						<span class="folder-badge">{folder.count}</span>
					{/if}
				</button>
			{/each}
		</aside>

		<div class="message-list">
			{#if current_emails.length === 0}
				<div class="empty-state">No messages</div>
			{/if}
			{#each current_emails as email}
				<button
					class="email-item"
					class:active={selected_email?.id === email.id}
					class:unread={!email.read}
					onclick={() => selected_email = email}
				>
					{#if !email.read}
						<div class="unread-dot"></div>
					{/if}
					<div class="email-info">
						<div class="email-header">
							<span class="email-from">{email.from}</span>
							<span class="email-date">{email.date}</span>
						</div>
						<div class="email-subject">{email.subject}</div>
						<div class="email-preview">{email.preview}</div>
					</div>
				</button>
			{/each}
		</div>

		<div class="message-preview">
			{#if selected_email}
				<div class="preview-header">
					<h2>{selected_email.subject}</h2>
					<div class="preview-meta">
						<span class="preview-from">From: <strong>{selected_email.from}</strong></span>
						<span class="preview-date">{selected_email.date}, 2024</span>
					</div>
				</div>
				<div class="preview-body">
					{selected_email.body}
				</div>
			{:else}
				<div class="no-selection">No message selected</div>
			{/if}
		</div>
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
		font-size: 13px;
	}

	.titlebar {
		display: flex;
		align-items: center;
		padding: 8px 12px;
		min-height: 38px;
		background: linear-gradient(to bottom, #f6f6f6, #e8e8e8);
		border-bottom: 1px solid #c8c8c8;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
			border-bottom-color: #1c1c1e;
		}
	}

	.toolbar-actions {
		display: flex;
		gap: 4px;
	}

	.toolbar-btn {
		background: none;
		border: none;
		color: #6e6e73;
		font-size: 12px;
		padding: 4px 8px;
		border-radius: 4px;
		cursor: pointer;

		&:hover {
			background: rgba(0, 0, 0, 0.06);
		}
	}

	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.folder-sidebar {
		width: 160px;
		min-width: 160px;
		background: #f2f2f7;
		border-right: 1px solid #d1d1d6;
		padding: 8px 0;
		overflow-y: auto;

		:global(body.dark) & {
			background: #1c1c1e;
			border-right-color: #38383a;
		}
	}

	.folder-item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 6px 12px;
		border: none;
		background: none;
		font-size: 13px;
		color: var(--system-color-light-contrast);
		cursor: pointer;
		text-align: left;

		&:hover {
			background: rgba(0, 0, 0, 0.04);
		}

		&.active {
			background: #007aff;
			color: white;
		}
	}

	.folder-icon {
		font-size: 14px;
	}

	.folder-name {
		flex: 1;
	}

	.folder-badge {
		background: #007aff;
		color: white;
		font-size: 11px;
		padding: 1px 6px;
		border-radius: 10px;
		font-weight: 600;
	}

	.folder-item.active .folder-badge {
		background: white;
		color: #007aff;
	}

	.message-list {
		width: 280px;
		min-width: 280px;
		border-right: 1px solid #d1d1d6;
		overflow-y: auto;

		:global(body.dark) & {
			border-right-color: #38383a;
		}
	}

	.email-item {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		width: 100%;
		padding: 10px 12px;
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		color: var(--system-color-light-contrast);
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);

		&:hover {
			background: rgba(0, 0, 0, 0.03);
		}

		&.active {
			background: #007aff;
			color: white;
		}
	}

	.unread-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #007aff;
		margin-top: 6px;
		flex-shrink: 0;
	}

	.email-item.active .unread-dot {
		background: white;
	}

	.email-info {
		flex: 1;
		min-width: 0;
	}

	.email-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2px;
	}

	.email-from {
		font-weight: 600;
		font-size: 13px;
	}

	.email-date {
		font-size: 11px;
		color: #86868b;
		flex-shrink: 0;
	}

	.email-item.active .email-date {
		color: rgba(255, 255, 255, 0.7);
	}

	.email-subject {
		font-size: 13px;
		font-weight: 500;
		margin-bottom: 2px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.email-preview {
		font-size: 12px;
		color: #86868b;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.email-item.active .email-preview {
		color: rgba(255, 255, 255, 0.7);
	}

	.email-item.unread .email-from {
		font-weight: 700;
	}

	.message-preview {
		flex: 1;
		overflow-y: auto;
		padding: 20px;
	}

	.preview-header {
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid #d1d1d6;

		h2 {
			font-size: 18px;
			font-weight: 600;
			margin: 0 0 8px;
		}

		:global(body.dark) & {
			border-bottom-color: #38383a;
		}
	}

	.preview-meta {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		color: #86868b;
	}

	.preview-from strong {
		color: var(--system-color-light-contrast);
	}

	.preview-body {
		font-size: 14px;
		line-height: 1.6;
		white-space: pre-wrap;
	}

	.empty-state, .no-selection {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: #86868b;
		font-size: 14px;
	}
</style>
