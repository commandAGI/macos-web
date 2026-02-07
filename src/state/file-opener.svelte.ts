/** File opener service: bridges VFS -> app launch for file opening. */

import { apps } from './apps.svelte';
import { get_app_for_file } from './file-registry';
import { read_file, stat } from './vfs.svelte';

/** Wrapper object so we never reassign the exported $state (Svelte 5 module constraint). */
export const file_opener_store = $state<{ pending: { path: string; content?: string } | null }>({
	pending: null,
});

/**
 * Open a file by path. Looks up the file type registry to determine which app handles it,
 * reads the file content from VFS, sets pending_file_open state, then launches the app.
 * The target app should call consume_pending_file() on mount/focus to receive the file.
 */
export function open_file(path: string): boolean {
	const node = stat(path);
	if (!node) return false;

	if (node.type === 'dir') {
		file_opener_store.pending = { path };
		apps.open.finder = true;
		apps.active = 'finder';
		return true;
	}

	// Check for .app directories (launch the app)
	if (node.name.endsWith('.app')) {
		const app_name = node.name.replace('.app', '').toLowerCase().replace(/\s+/g, '-');
		if (app_name in apps.open) {
			(apps.open as Record<string, boolean>)[app_name] = true;
			apps.active = app_name as typeof apps.active;
			return true;
		}
		return false;
	}

	const app_id = get_app_for_file(node.name);
	if (!app_id) return false;

	const content = read_file(path);
	file_opener_store.pending = { path, content: content ?? undefined };
	apps.open[app_id] = true;
	apps.active = app_id;
	return true;
}

/**
 * Consume the pending file open request. Returns the pending file info and clears the state.
 * Apps should call this when they mount or receive focus to check if a file was opened.
 */
export function consume_pending_file(): { path: string; content?: string } | null {
	const pending = file_opener_store.pending;
	file_opener_store.pending = null;
	return pending;
}
