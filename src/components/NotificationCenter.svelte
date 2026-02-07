<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { sineOut, sineIn } from 'svelte/easing';
	import { click_outside } from '🍎/actions';
	import {
		notification_store,
		mark_all_read,
		remove_notification,
		clear_all,
		unread_count,
	} from '🍎/state/notifications.svelte.ts';

	let { visible = $bindable() }: { visible: boolean } = $props();

	/** Group notifications by date label: Today, Yesterday, Earlier. */
	function group_by_date(
		items: typeof notification_store.items,
	): { label: string; items: typeof notification_store.items }[] {
		const now = new Date();
		const today_start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
		const yesterday_start = today_start - 86_400_000;

		const groups: Record<string, typeof notification_store.items> = {};

		for (const n of items) {
			let label: string;
			if (n.timestamp >= today_start) {
				label = 'Today';
			} else if (n.timestamp >= yesterday_start) {
				label = 'Yesterday';
			} else {
				label = 'Earlier';
			}
			(groups[label] ??= []).push(n);
		}

		const order = ['Today', 'Yesterday', 'Earlier'];
		return order
			.filter((l) => groups[l]?.length)
			.map((label) => ({ label, items: groups[label] }));
	}

	let grouped = $derived(group_by_date(notification_store.items));

	function format_time(ts: number): string {
		const d = new Date(ts);
		return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
	}

	function hide() {
		visible = false;
	}
</script>

{#if visible}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="backdrop" transition:fade={{ duration: 200 }} onmousedown={hide}></div>

	<aside
		class="panel"
		use:click_outside={hide}
		transition:fly={{ x: 340, duration: 300, easing: sineOut }}
	>
		<header class="panel-header">
			<h2>Notifications</h2>
			<div class="header-actions">
				{#if unread_count() > 0}
					<button class="header-btn" onclick={mark_all_read}>Mark All Read</button>
				{/if}
				{#if notification_store.items.length > 0}
					<button class="header-btn" onclick={clear_all}>Clear All</button>
				{/if}
			</div>
		</header>

		<div class="panel-body">
			{#if notification_store.items.length === 0}
				<div class="empty-state">
					<p class="empty-title">No Notifications</p>
					<p class="empty-subtitle">You're all caught up.</p>
				</div>
			{:else}
				{#each grouped as group}
					<div class="date-group">
						<h3 class="date-label">{group.label}</h3>
						{#each group.items as n (n.id)}
							<div class="notification-card" class:unread={!n.read}>
								<img class="card-icon" src={n.app_icon} alt="{n.app_name} icon" />
								<div class="card-content">
									<div class="card-header">
										<span class="card-app-name">{n.app_name}</span>
										<span class="card-time">{format_time(n.timestamp)}</span>
									</div>
									<p class="card-title">{n.title}</p>
									{#if n.body}
										<p class="card-body">{n.body}</p>
									{/if}
								</div>
								<button
									class="dismiss-btn"
									onclick={(e) => {
										e.stopPropagation();
										remove_notification(n.id);
									}}
									aria-label="Dismiss notification"
								>
									&times;
								</button>
							</div>
						{/each}
					</div>
				{/each}
			{/if}
		</div>
	</aside>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 149;

		background-color: hsla(0, 0%, 0%, 0.15);
	}

	.panel {
		position: fixed;
		top: 1.8rem;
		right: 0;
		bottom: 0;

		width: 22rem;

		z-index: 150;

		display: flex;
		flex-direction: column;

		background-color: hsla(var(--system-color-light-hsl), 0.4);
		backdrop-filter: blur(40px) saturate(180%);

		box-shadow:
			-2px 0 20px hsla(0, 0%, 0%, 0.12),
			inset 1px 0 0 hsla(var(--system-color-light-hsl), 0.3);

		user-select: none;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;

		padding: 0.9rem 1rem 0.6rem;

		border-bottom: 0.5px solid hsla(var(--system-color-dark-hsl), 0.1);

		h2 {
			font-size: 1rem;
			font-weight: 700;
			font-family: var(--system-font-family);

			color: var(--system-color-light-contrast);
		}
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	.header-btn {
		font-size: 0.72rem;
		font-weight: 500;
		font-family: var(--system-font-family);

		color: var(--system-color-primary);

		padding: 0.25rem 0.5rem;

		border-radius: 0.3rem;

		transition: background-color 100ms ease;

		&:hover {
			background-color: hsla(var(--system-color-primary-hsl), 0.1);
		}
	}

	.panel-body {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;

		padding: 0.5rem 0.75rem 1rem;

		/* Thin scrollbar to match macOS */
		&::-webkit-scrollbar {
			width: 6px;
		}

		&::-webkit-scrollbar-thumb {
			background-color: hsla(var(--system-color-dark-hsl), 0.2);
			border-radius: 3px;
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		padding: 4rem 1rem;

		gap: 0.35rem;
	}

	.empty-title {
		font-size: 1rem;
		font-weight: 600;
		font-family: var(--system-font-family);

		color: var(--system-color-light-contrast);

		opacity: 0.7;
	}

	.empty-subtitle {
		font-size: 0.8rem;
		font-family: var(--system-font-family);

		color: var(--system-color-light-contrast);

		opacity: 0.4;
	}

	.date-group {
		margin-bottom: 0.75rem;
	}

	.date-label {
		font-size: 0.75rem;
		font-weight: 700;
		font-family: var(--system-font-family);

		color: var(--system-color-light-contrast);

		opacity: 0.5;

		text-transform: uppercase;
		letter-spacing: 0.5px;

		padding: 0.5rem 0.25rem 0.35rem;
	}

	.notification-card {
		display: flex;
		align-items: flex-start;
		gap: 0.6rem;

		padding: 0.6rem 0.65rem;
		margin-bottom: 0.35rem;

		background-color: hsla(var(--system-color-light-hsl), 0.45);
		backdrop-filter: blur(8px);

		border-radius: 0.75rem;

		box-shadow:
			0 1px 4px hsla(0, 0%, 0%, 0.06),
			inset 0 0 0 0.5px hsla(var(--system-color-light-hsl), 0.3);

		position: relative;

		transition: background-color 100ms ease;

		&:hover {
			background-color: hsla(var(--system-color-light-hsl), 0.65);

			.dismiss-btn {
				opacity: 1;
			}
		}

		&.unread {
			background-color: hsla(var(--system-color-primary-hsl), 0.08);

			&:hover {
				background-color: hsla(var(--system-color-primary-hsl), 0.13);
			}
		}
	}

	.card-icon {
		width: 2rem;
		height: 2rem;

		border-radius: 0.4rem;

		flex-shrink: 0;

		margin-top: 0.1rem;
	}

	.card-content {
		flex: 1;
		min-width: 0;

		display: flex;
		flex-direction: column;
		gap: 0.05rem;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.card-app-name {
		font-size: 0.7rem;
		font-weight: 600;
		font-family: var(--system-font-family);

		color: var(--system-color-light-contrast);

		opacity: 0.55;

		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.card-time {
		font-size: 0.65rem;
		font-family: var(--system-font-family);

		color: var(--system-color-light-contrast);

		opacity: 0.35;
	}

	.card-title {
		font-size: 0.8rem;
		font-weight: 600;
		font-family: var(--system-font-family);

		color: var(--system-color-light-contrast);

		line-height: 1.3;

		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.card-body {
		font-size: 0.75rem;
		font-weight: 400;
		font-family: var(--system-font-family);

		color: var(--system-color-light-contrast);

		opacity: 0.65;

		line-height: 1.35;

		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.dismiss-btn {
		position: absolute;
		top: 0.35rem;
		right: 0.4rem;

		width: 1.2rem;
		height: 1.2rem;

		display: flex;
		align-items: center;
		justify-content: center;

		font-size: 0.85rem;
		font-weight: 500;
		line-height: 1;

		color: var(--system-color-light-contrast);
		opacity: 0;

		border-radius: 50%;

		background-color: hsla(var(--system-color-dark-hsl), 0.15);

		transition: opacity 100ms ease, background-color 100ms ease;

		&:hover {
			background-color: hsla(var(--system-color-dark-hsl), 0.25);
		}
	}
</style>
