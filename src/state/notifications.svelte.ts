/** Notification center for the macOS simulation. */

export interface Notification {
	id: number;
	app_name: string;
	app_icon: string;
	title: string;
	body: string;
	timestamp: number;
	read: boolean;
	action?: () => void;
}

let next_id = 1;

/**
 * Reactive notification store.
 * Properties are mutated in-place so the exported $state object is never reassigned
 * (Svelte 5 module constraint).
 */
export const notification_store = $state<{
	items: Notification[];
	banner_items: Notification[];
}>({
	items: [],
	banner_items: [],
});

/** Convenience reactive getters that components can import directly. */
export function get_notifications(): Notification[] {
	return notification_store.items;
}

export function get_banners(): Notification[] {
	return notification_store.banner_items;
}

/** Send a notification. Shows a banner that auto-dismisses, and adds to notification center. */
export function notify(opts: {
	app_name: string;
	app_icon: string;
	title: string;
	body: string;
	action?: () => void;
}): number {
	const id = next_id++;
	const notification: Notification = {
		id,
		app_name: opts.app_name,
		app_icon: opts.app_icon,
		title: opts.title,
		body: opts.body,
		timestamp: Date.now(),
		read: false,
		action: opts.action,
	};

	notification_store.items = [notification, ...notification_store.items];
	notification_store.banner_items = [...notification_store.banner_items, notification];

	// Auto-dismiss banner after 5 seconds
	setTimeout(() => {
		dismiss_banner(id);
	}, 5000);

	return id;
}

/** Dismiss a banner (remove from visible banner queue). */
export function dismiss_banner(id: number): void {
	notification_store.banner_items = notification_store.banner_items.filter((b) => b.id !== id);
}

/** Mark a notification as read. */
export function mark_read(id: number): void {
	const n = notification_store.items.find((n) => n.id === id);
	if (n) n.read = true;
}

/** Mark all notifications as read. */
export function mark_all_read(): void {
	for (const n of notification_store.items) {
		n.read = true;
	}
}

/** Remove a single notification. */
export function remove_notification(id: number): void {
	notification_store.items = notification_store.items.filter((n) => n.id !== id);
}

/** Clear all notifications. */
export function clear_all(): void {
	notification_store.items = [];
}

/** Get count of unread notifications. */
export function unread_count(): number {
	return notification_store.items.filter((n) => !n.read).length;
}
