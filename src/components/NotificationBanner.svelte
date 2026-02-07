<script lang="ts">
	import { fly } from 'svelte/transition';
	import { sineOut } from 'svelte/easing';
	import { notification_store, dismiss_banner } from '🍎/state/notifications.svelte.ts';
</script>

{#if notification_store.banner_items.length > 0}
	<div class="banner-stack">
		{#each notification_store.banner_items as banner (banner.id)}
			<button
				class="banner"
				in:fly={{ x: 360, duration: 350, easing: sineOut }}
				out:fly={{ x: 360, duration: 250, easing: sineOut }}
				onclick={() => dismiss_banner(banner.id)}
			>
				<img class="app-icon" src={banner.app_icon} alt="{banner.app_name} icon" />
				<div class="banner-content">
					<div class="banner-header">
						<span class="app-name">{banner.app_name}</span>
						<span class="now-label">now</span>
					</div>
					<p class="banner-title">{banner.title}</p>
					{#if banner.body}
						<p class="banner-body">{banner.body}</p>
					{/if}
				</div>
			</button>
		{/each}
	</div>
{/if}

<style>
	.banner-stack {
		position: fixed;
		top: 2.4rem;
		right: 0.75rem;

		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		z-index: 200;

		pointer-events: none;
	}

	.banner {
		pointer-events: auto;

		display: flex;
		align-items: flex-start;
		gap: 0.65rem;

		width: 22rem;

		padding: 0.7rem 0.85rem;

		text-align: left;

		background-color: hsla(var(--system-color-light-hsl), 0.55);
		backdrop-filter: blur(40px) saturate(180%);

		border-radius: 1rem;

		box-shadow:
			0 4px 24px hsla(0, 0%, 0%, 0.15),
			0 1px 3px hsla(0, 0%, 0%, 0.08),
			inset 0 0 0 0.5px hsla(var(--system-color-light-hsl), 0.4);

		cursor: default;

		transition: opacity 150ms ease;

		&:hover {
			opacity: 0.85;
		}

		&:active {
			opacity: 0.7;
		}
	}

	.app-icon {
		width: 2.25rem;
		height: 2.25rem;

		border-radius: 0.5rem;

		flex-shrink: 0;

		margin-top: 0.1rem;
	}

	.banner-content {
		flex: 1;
		min-width: 0;

		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.banner-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.app-name {
		font-size: 0.75rem;
		font-weight: 600;
		font-family: var(--system-font-family);

		color: var(--system-color-light-contrast);

		opacity: 0.65;

		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.now-label {
		font-size: 0.7rem;
		font-family: var(--system-font-family);

		color: var(--system-color-light-contrast);

		opacity: 0.4;
	}

	.banner-title {
		font-size: 0.85rem;
		font-weight: 600;
		font-family: var(--system-font-family);

		color: var(--system-color-light-contrast);

		line-height: 1.3;

		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.banner-body {
		font-size: 0.8rem;
		font-weight: 400;
		font-family: var(--system-font-family);

		color: var(--system-color-light-contrast);

		opacity: 0.75;

		line-height: 1.35;

		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
