/** Shared clipboard for text and files across all macOS apps. */

export interface ClipboardState {
	type: 'text' | 'files';
	text?: string;
	file_paths?: string[];
	action?: 'copy' | 'cut';
	timestamp: number;
}

/** Wrapper object so we never reassign the exported $state (Svelte 5 module constraint). */
export const clipboard_store = $state<{ current: ClipboardState | null }>({
	current: null,
});

/** Copy text to the shared clipboard. */
export function copy_text(text: string): void {
	clipboard_store.current = {
		type: 'text',
		text,
		timestamp: Date.now(),
	};
}

/** Copy file paths to the shared clipboard. */
export function copy_files(paths: string[], action: 'copy' | 'cut' = 'copy'): void {
	clipboard_store.current = {
		type: 'files',
		file_paths: [...paths],
		action,
		timestamp: Date.now(),
	};
}

/** Read clipboard text. Returns null if clipboard is empty or not text. */
export function paste_text(): string | null {
	if (!clipboard_store.current || clipboard_store.current.type !== 'text') return null;
	return clipboard_store.current.text ?? null;
}

/** Read clipboard file paths. Returns null if clipboard is empty or not files. */
export function paste_files(): { paths: string[]; action: 'copy' | 'cut' } | null {
	const c = clipboard_store.current;
	if (!c || c.type !== 'files' || !c.file_paths) return null;
	const result = { paths: [...c.file_paths], action: c.action ?? ('copy' as const) };
	if (c.action === 'cut') {
		clipboard_store.current = null;
	}
	return result;
}

/** Clear the clipboard. */
export function clear_clipboard(): void {
	clipboard_store.current = null;
}
