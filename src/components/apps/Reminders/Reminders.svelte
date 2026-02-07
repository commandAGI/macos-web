<script lang="ts">
	type Reminder = { id: number; text: string; completed: boolean; flagged: boolean };

	let active_list = $state('all');

	const lists = [
		{ id: 'today', name: 'Today', icon: '📅', color: '#007aff' },
		{ id: 'scheduled', name: 'Scheduled', icon: '📆', color: '#ff3b30' },
		{ id: 'all', name: 'All', icon: '📋', color: '#636366' },
		{ id: 'flagged', name: 'Flagged', icon: '🚩', color: '#ff9500' },
	];

	let reminders = $state<Reminder[]>([
		{ id: 1, text: 'Buy groceries', completed: false, flagged: true },
		{ id: 2, text: 'Schedule dentist appointment', completed: false, flagged: false },
		{ id: 3, text: 'Review pull request #275', completed: true, flagged: false },
		{ id: 4, text: 'Call Mom', completed: false, flagged: true },
		{ id: 5, text: 'Update project documentation', completed: false, flagged: false },
		{ id: 6, text: 'Pay electricity bill', completed: true, flagged: false },
		{ id: 7, text: 'Prepare slides for Friday meeting', completed: false, flagged: false },
		{ id: 8, text: 'Order birthday gift', completed: false, flagged: true },
	]);

	let new_reminder = $state('');

	const visible_reminders = $derived(
		active_list === 'flagged'
			? reminders.filter(r => r.flagged)
			: active_list === 'today'
				? reminders.filter(r => !r.completed)
				: reminders
	);

	function toggle_reminder(id: number) {
		reminders = reminders.map(r =>
			r.id === id ? { ...r, completed: !r.completed } : r
		);
	}

	function add_reminder() {
		if (new_reminder.trim() === '') return;
		reminders = [...reminders, {
			id: Date.now(),
			text: new_reminder,
			completed: false,
			flagged: false,
		}];
		new_reminder = '';
	}
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar"></header>

	<div class="main">
		<aside class="sidebar">
			{#each lists as list}
				<button
					class="list-item"
					class:active={active_list === list.id}
					onclick={() => active_list = list.id}
				>
					<span class="list-icon" style:color={list.color}>{list.icon}</span>
					<span class="list-name">{list.name}</span>
					<span class="list-count">
						{#if list.id === 'flagged'}
							{reminders.filter(r => r.flagged).length}
						{:else if list.id === 'today'}
							{reminders.filter(r => !r.completed).length}
						{:else}
							{reminders.length}
						{/if}
					</span>
				</button>
			{/each}
		</aside>

		<div class="content">
			<div class="content-header">
				<h1>{lists.find(l => l.id === active_list)?.name}</h1>
				<button class="add-btn" onclick={() => document.querySelector<HTMLInputElement>('.reminder-input')?.focus()}>+</button>
			</div>

			<div class="reminder-list">
				{#each visible_reminders as reminder}
					<div class="reminder-item" class:completed={reminder.completed}>
						<button
							class="checkbox"
							class:checked={reminder.completed}
							onclick={() => toggle_reminder(reminder.id)}
						>
							{#if reminder.completed}✓{/if}
						</button>
						<span class="reminder-text">{reminder.text}</span>
						{#if reminder.flagged}
							<span class="flag">🚩</span>
						{/if}
					</div>
				{/each}
			</div>

			<div class="add-reminder">
				<input
					class="reminder-input"
					type="text"
					bind:value={new_reminder}
					placeholder="Add Reminder..."
					onkeydown={(e) => { if (e.key === 'Enter') add_reminder(); }}
				/>
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
		width: 200px;
		min-width: 200px;
		background: #f2f2f7;
		border-right: 1px solid #d1d1d6;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;

		:global(body.dark) & {
			background: #1c1c1e;
			border-right-color: #38383a;
		}
	}

	.list-item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 8px 10px;
		border: none;
		background: none;
		font-size: 14px;
		color: var(--system-color-light-contrast);
		cursor: pointer;
		text-align: left;
		border-radius: 6px;

		&:hover {
			background: rgba(0, 0, 0, 0.04);
		}

		&.active {
			background: #007aff;
			color: white;
		}
	}

	.list-icon {
		font-size: 18px;
	}

	.list-name {
		flex: 1;
		font-weight: 500;
	}

	.list-count {
		font-size: 13px;
		color: #86868b;
		font-weight: 600;
	}

	.list-item.active .list-count {
		color: rgba(255, 255, 255, 0.7);
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		padding: 16px;
	}

	.content-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;

		h1 {
			font-size: 24px;
			font-weight: 700;
			margin: 0;
			color: #007aff;
		}
	}

	.add-btn {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: none;
		background: #007aff;
		color: white;
		font-size: 18px;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		line-height: 1;

		&:hover {
			background: #0066d6;
		}
	}

	.reminder-list {
		flex: 1;
		overflow-y: auto;
	}

	.reminder-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);

		&.completed .reminder-text {
			text-decoration: line-through;
			color: #86868b;
		}

		:global(body.dark) & {
			border-bottom-color: rgba(255, 255, 255, 0.04);
		}
	}

	.checkbox {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: 2px solid #d1d1d6;
		background: none;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 12px;
		color: white;
		flex-shrink: 0;

		&.checked {
			background: #007aff;
			border-color: #007aff;
		}
	}

	.reminder-text {
		flex: 1;
		font-size: 14px;
	}

	.flag {
		font-size: 12px;
	}

	.add-reminder {
		margin-top: 8px;
		padding-top: 8px;
		border-top: 1px solid rgba(0, 0, 0, 0.06);

		:global(body.dark) & {
			border-top-color: rgba(255, 255, 255, 0.04);
		}

		input {
			width: 100%;
			padding: 8px 0;
			border: none;
			background: none;
			font-size: 14px;
			color: var(--system-color-light-contrast);
			outline: none;

			&::placeholder {
				color: #86868b;
			}
		}
	}
</style>
