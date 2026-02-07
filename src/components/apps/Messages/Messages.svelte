<script lang="ts">
	type Message = { text: string; sent: boolean; time: string };
	type Conversation = { name: string; avatar: string; messages: Message[]; lastMessage: string; lastTime: string };

	const conversations: Conversation[] = [
		{
			name: 'Alice Johnson',
			avatar: 'AJ',
			lastMessage: 'Sounds great! See you there.',
			lastTime: '2:34 PM',
			messages: [
				{ text: 'Hey! Are you coming to the meetup tonight?', sent: true, time: '2:30 PM' },
				{ text: 'Yes! What time does it start?', sent: false, time: '2:31 PM' },
				{ text: 'It starts at 7 PM at the downtown venue', sent: true, time: '2:32 PM' },
				{ text: 'Sounds great! See you there.', sent: false, time: '2:34 PM' },
			],
		},
		{
			name: 'Bob Smith',
			avatar: 'BS',
			lastMessage: 'I\'ll send over the files tomorrow',
			lastTime: '1:15 PM',
			messages: [
				{ text: 'Did you finish the report?', sent: true, time: '1:10 PM' },
				{ text: 'Almost done, just need to add the graphs', sent: false, time: '1:12 PM' },
				{ text: 'No rush, take your time', sent: true, time: '1:13 PM' },
				{ text: 'I\'ll send over the files tomorrow', sent: false, time: '1:15 PM' },
			],
		},
		{
			name: 'Team Chat',
			avatar: 'TC',
			lastMessage: 'Meeting rescheduled to 3 PM',
			lastTime: '11:45 AM',
			messages: [
				{ text: 'Good morning team!', sent: false, time: '9:00 AM' },
				{ text: 'Morning! Ready for the standup?', sent: true, time: '9:05 AM' },
				{ text: 'Let me grab my coffee first', sent: false, time: '9:06 AM' },
				{ text: 'Meeting rescheduled to 3 PM', sent: false, time: '11:45 AM' },
			],
		},
		{
			name: 'Mom',
			avatar: 'M',
			lastMessage: 'Love you! Call me later ❤️',
			lastTime: 'Yesterday',
			messages: [
				{ text: 'Hi sweetie, how are you?', sent: false, time: 'Yesterday' },
				{ text: 'I\'m good! Just busy with work', sent: true, time: 'Yesterday' },
				{ text: 'Don\'t forget to eat properly!', sent: false, time: 'Yesterday' },
				{ text: 'I won\'t, thanks Mom!', sent: true, time: 'Yesterday' },
				{ text: 'Love you! Call me later ❤️', sent: false, time: 'Yesterday' },
			],
		},
	];

	let selected = $state(0);
	let new_message = $state('');

	function send_message() {
		if (new_message.trim() === '') return;
		conversations[selected].messages = [...conversations[selected].messages, {
			text: new_message,
			sent: true,
			time: 'Now',
		}];
		conversations[selected].lastMessage = new_message;
		conversations[selected].lastTime = 'Now';
		new_message = '';
	}
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar"></header>

	<div class="main">
		<aside class="sidebar">
			<div class="search-bar">
				<input type="text" placeholder="Search" />
			</div>
			<div class="conversation-list">
				{#each conversations as convo, i}
					<button
						class="conversation"
						class:active={selected === i}
						onclick={() => selected = i}
					>
						<div class="avatar" style:background-color={['#007aff', '#34c759', '#ff9500', '#ff3b30'][i]}>
							{convo.avatar}
						</div>
						<div class="convo-info">
							<div class="convo-header">
								<span class="convo-name">{convo.name}</span>
								<span class="convo-time">{convo.lastTime}</span>
							</div>
							<div class="convo-preview">{convo.lastMessage}</div>
						</div>
					</button>
				{/each}
			</div>
		</aside>

		<div class="chat-area">
			<div class="chat-header">
				<div class="chat-avatar" style:background-color={['#007aff', '#34c759', '#ff9500', '#ff3b30'][selected]}>
					{conversations[selected].avatar}
				</div>
				<span class="chat-name">{conversations[selected].name}</span>
			</div>

			<div class="messages">
				{#each conversations[selected].messages as msg}
					<div class="message" class:sent={msg.sent} class:received={!msg.sent}>
						<div class="bubble">{msg.text}</div>
						<div class="msg-time">{msg.time}</div>
					</div>
				{/each}
			</div>

			<div class="input-area">
				<input
					type="text"
					bind:value={new_message}
					placeholder="iMessage"
					onkeydown={(e) => { if (e.key === 'Enter') send_message(); }}
				/>
				<button class="send-btn" onclick={send_message}>↑</button>
			</div>
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
	}

	.titlebar {
		padding: 12px;
		min-height: 36px;
		background: linear-gradient(to bottom, #f6f6f6, #ededef);
		border-bottom: 1px solid #d1d1d6;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
			border-bottom-color: #1c1c1e;
		}
	}

	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.sidebar {
		width: 240px;
		min-width: 240px;
		border-right: 1px solid #d1d1d6;
		display: flex;
		flex-direction: column;
		background: #f2f2f7;

		:global(body.dark) & {
			background: #1c1c1e;
			border-right-color: #38383a;
		}
	}

	.search-bar {
		padding: 8px;

		input {
			width: 100%;
			padding: 6px 10px;
			border: none;
			border-radius: 8px;
			background: rgba(0, 0, 0, 0.06);
			font-size: 13px;
			color: var(--system-color-light-contrast);

			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.08);
			}
		}
	}

	.conversation-list {
		flex: 1;
		overflow-y: auto;
	}

	.conversation {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 10px 12px;
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		color: var(--system-color-light-contrast);
		border-bottom: 1px solid rgba(0, 0, 0, 0.04);

		&:hover {
			background: rgba(0, 0, 0, 0.04);
		}

		&.active {
			background: #007aff;
			color: white;
		}
	}

	.avatar, .chat-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		color: white;
		font-size: 13px;
		font-weight: 600;
		flex-shrink: 0;
	}

	.chat-avatar {
		width: 28px;
		height: 28px;
		font-size: 11px;
	}

	.convo-info {
		flex: 1;
		min-width: 0;
	}

	.convo-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.convo-name {
		font-size: 14px;
		font-weight: 600;
	}

	.convo-time {
		font-size: 11px;
		color: #86868b;
	}

	.conversation.active .convo-time {
		color: rgba(255, 255, 255, 0.7);
	}

	.convo-preview {
		font-size: 13px;
		color: #86868b;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.conversation.active .convo-preview {
		color: rgba(255, 255, 255, 0.7);
	}

	.chat-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.chat-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		border-bottom: 1px solid #d1d1d6;
		background: rgba(0, 0, 0, 0.02);

		:global(body.dark) & {
			border-bottom-color: #38383a;
			background: rgba(255, 255, 255, 0.02);
		}
	}

	.chat-name {
		font-size: 14px;
		font-weight: 600;
	}

	.messages {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.message {
		display: flex;
		flex-direction: column;
		max-width: 70%;

		&.sent {
			align-self: flex-end;
			align-items: flex-end;
		}

		&.received {
			align-self: flex-start;
			align-items: flex-start;
		}
	}

	.bubble {
		padding: 8px 14px;
		border-radius: 18px;
		font-size: 14px;
		line-height: 1.4;
		word-wrap: break-word;
	}

	.sent .bubble {
		background: #007aff;
		color: white;
		border-bottom-right-radius: 6px;
	}

	.received .bubble {
		background: #e9e9eb;
		color: #1c1c1e;
		border-bottom-left-radius: 6px;

		:global(body.dark) & {
			background: #3a3a3c;
			color: white;
		}
	}

	.msg-time {
		font-size: 11px;
		color: #86868b;
		margin-top: 2px;
		padding: 0 6px;
	}

	.input-area {
		display: flex;
		gap: 8px;
		padding: 10px 16px;
		border-top: 1px solid #d1d1d6;
		background: rgba(0, 0, 0, 0.02);

		:global(body.dark) & {
			border-top-color: #38383a;
			background: rgba(255, 255, 255, 0.02);
		}

		input {
			flex: 1;
			padding: 8px 14px;
			border: 1px solid #d1d1d6;
			border-radius: 20px;
			font-size: 14px;
			color: var(--system-color-light-contrast);
			background: var(--system-color-light);
			outline: none;

			&:focus {
				border-color: #007aff;
			}

			:global(body.dark) & {
				border-color: #48484a;
				background: #2c2c2e;
			}
		}
	}

	.send-btn {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: none;
		background: #007aff;
		color: white;
		font-size: 16px;
		font-weight: 700;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;

		&:hover {
			background: #0066d6;
		}
	}
</style>
