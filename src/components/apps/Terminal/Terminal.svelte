<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { create_default_fs, display_path, resolve_path, type FSNode } from './virtual-fs';
	import { COMMANDS, get_completions, parse_command_line, type TerminalState, type CommandResult } from './commands';

	// --- Types ---
	interface TermLine {
		id: number;
		html: string;
	}

	interface Tab {
		id: number;
		title: string;
		lines: TermLine[];
		cwd: string;
		history: string[];
		history_index: number;
		saved_input: string;
		env: Record<string, string>;
		fs_root: Map<string, FSNode>;
		line_counter: number;
	}

	// --- Color rendering ---
	const COLOR_MAP: Record<string, string> = {
		red: '#ff5f56',
		green: '#27c93f',
		blue: '#58a6ff',
		cyan: '#56d4dd',
		magenta: '#c678dd',
		yellow: '#e5c07b',
		white: '#e6e6e6',
		gray: '#808080',
		dim: '#808080',
		bold: '#ffffff',
	};

	function render_colors(text: string): string {
		// Escape HTML
		let safe = text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');

		// Now process our custom color tags that were escaped
		// Convert &lt;c:color&gt;text&lt;/c&gt; to spans
		safe = safe.replace(
			/&lt;c:(\w+)&gt;(.*?)&lt;\/c&gt;/g,
			(_match, color: string, content: string) => {
				const style = color === 'bold'
					? 'color: #ffffff; font-weight: bold;'
					: color === 'dim'
						? 'color: #808080;'
						: `color: ${COLOR_MAP[color] || '#e6e6e6'};`;
				return `<span style="${style}">${content}</span>`;
			}
		);

		return safe;
	}

	function render_prompt(cwd: string): string {
		const dir_display = display_path(cwd);
		const short_dir = dir_display === '/Users/user' ? '~' : dir_display;
		return `<span style="color: #27c93f; font-weight: bold;">user@macbook</span> <span style="color: #58a6ff; font-weight: bold;">${short_dir}</span> <span style="color: #e6e6e6;">%</span> `;
	}

	// --- Tab management ---
	let tab_counter = $state(1);
	let tabs = $state<Tab[]>([]);
	let active_tab_id = $state(1);

	function create_tab(): Tab {
		const id = tab_counter++;
		const fs = create_default_fs();
		const login_date = new Date();
		const line_counter = 2;

		return {
			id,
			title: `zsh`,
			lines: [
				{ id: 0, html: render_colors(`<c:dim>Last login: ${login_date.toDateString()} ${login_date.toTimeString().split(' ')[0]} on ttys00${id}</c>`) },
				{ id: 1, html: '' },
			],
			cwd: '/Users/user',
			history: [],
			history_index: -1,
			saved_input: '',
			env: { OLDPWD: '/Users/user' },
			fs_root: fs,
			line_counter,
		};
	}

	// Initialize first tab
	tabs = [create_tab()];

	let active_tab = $derived(tabs.find(t => t.id === active_tab_id) || tabs[0]);

	function add_tab() {
		const new_tab = create_tab();
		tabs = [...tabs, new_tab];
		active_tab_id = new_tab.id;
		tick().then(() => focus_input());
	}

	function close_tab(id: number) {
		if (tabs.length <= 1) return;
		tabs = tabs.filter(t => t.id !== id);
		if (active_tab_id === id) {
			active_tab_id = tabs[0].id;
		}
		tick().then(() => focus_input());
	}

	function switch_tab(id: number) {
		active_tab_id = id;
		tick().then(() => focus_input());
	}

	// --- Input ---
	let current_input = $state('');
	let input_el = $state<HTMLInputElement>();
	let terminal_el = $state<HTMLDivElement>();
	let cursor_position = $state(0);
	let tab_completions = $state<string[]>([]);
	let tab_completion_index = $state(-1);

	function get_state(): TerminalState {
		return {
			cwd: active_tab.cwd,
			fs_root: active_tab.fs_root,
			history: active_tab.history,
			env: active_tab.env,
		};
	}

	function add_lines(tab: Tab, new_lines: string[]) {
		const entries: TermLine[] = new_lines.map(line => ({
			id: tab.line_counter++,
			html: render_colors(line),
		}));
		tab.lines = [...tab.lines, ...entries];
	}

	function handle_command() {
		const cmd_text = current_input.trim();
		const tab = active_tab;

		// Add the prompt + input as a line
		const prompt_html = render_prompt(tab.cwd);
		const input_html = cmd_text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
		tab.lines = [...tab.lines, { id: tab.line_counter++, html: prompt_html + input_html }];

		if (cmd_text) {
			tab.history = [...tab.history, cmd_text];
		}
		tab.history_index = -1;
		tab.saved_input = '';

		if (!cmd_text) {
			current_input = '';
			scroll_to_bottom();
			return;
		}

		// Handle piped commands (very basic - just run last)
		const pipe_parts = cmd_text.split('|').map(s => s.trim());

		// Handle chained commands with && or ;
		const chain_parts = cmd_text.split(/\s*(?:&&|;)\s*/);
		if (chain_parts.length > 1) {
			for (const part of chain_parts) {
				execute_single(part.trim(), tab);
			}
			current_input = '';
			scroll_to_bottom();
			return;
		}

		execute_single(cmd_text, tab);
		current_input = '';
		scroll_to_bottom();
	}

	function execute_single(cmd_text: string, tab: Tab) {
		const { cmd, args } = parse_command_line(cmd_text);

		if (!cmd) return;

		// Handle variable expansion
		const expanded_args = args.map(a => {
			if (a.startsWith('$')) {
				const var_name = a.slice(1);
				return tab.env[var_name] || process_env_builtins(var_name, tab) || '';
			}
			return a;
		});

		// Handle redirects (basic - just strip them)
		const real_args = expanded_args.filter(a => a !== '>' && a !== '>>' && !a.startsWith('>'));

		const handler = COMMANDS[cmd];
		if (handler) {
			const state = get_state();
			const result = handler(real_args, state);

			if (result.clear) {
				tab.lines = [];
				return;
			}

			if (result.new_cwd) {
				tab.env['OLDPWD'] = tab.cwd;
				tab.cwd = result.new_cwd;
			}

			if (result.lines.length > 0) {
				add_lines(tab, result.lines);
			}
		} else if (cmd === 'exit' || cmd === 'logout') {
			if (tabs.length > 1) {
				close_tab(tab.id);
			} else {
				tab.lines = [...tab.lines, { id: tab.line_counter++, html: render_colors('<c:dim>logout</c>') }];
				tab.lines = [...tab.lines, { id: tab.line_counter++, html: '' }];
				tab.lines = [...tab.lines, { id: tab.line_counter++, html: render_colors('<c:dim>[Process completed]</c>') }];
			}
		} else if (cmd === 'sudo') {
			if (real_args.length === 0) {
				add_lines(tab, ['usage: sudo -h | -K | -k | -V']);
			} else {
				add_lines(tab, [
					'Password: ',
					`Sorry, user is not in the sudoers file. This incident will be reported.`,
				]);
			}
		} else if (cmd === 'vim' || cmd === 'nano' || cmd === 'vi') {
			add_lines(tab, [`<c:dim>(simulated - ${cmd} is not available in this terminal)</c>`]);
		} else if (cmd === 'npm') {
			if (real_args[0] === '--version' || real_args[0] === '-v') {
				add_lines(tab, ['10.2.4']);
			} else {
				add_lines(tab, ['npm: command requires a package.json']);
			}
		} else if (cmd === 'yes') {
			const text = real_args[0] || 'y';
			const lines: string[] = [];
			for (let i = 0; i < 20; i++) lines.push(text);
			lines.push('<c:dim>(output truncated)</c>');
			add_lines(tab, lines);
		} else if (cmd === 'sl') {
			add_lines(tab, [
				'      ====        ________                ___________',
				'  _D _|  |_______/        \\__I_I_____===__|_________|',
				'   |(_)---  |   H\\________/ |   |        =|___ ___|',
				'   /     |  |   H  |  |     |   |         ||_| |_||',
				'  |      |  |   H  |__--------------------| [___] |',
				'  | ________|___H__/__|_____/[][]~\\_______|       |',
				'  |/ |   |-----------I_____I [][] []  D   |=======|_',
				'',
			]);
		} else {
			add_lines(tab, [`zsh: command not found: ${cmd}`]);
		}
	}

	function process_env_builtins(name: string, tab: Tab): string {
		const builtins: Record<string, string> = {
			HOME: '/Users/user',
			USER: 'user',
			SHELL: '/bin/zsh',
			PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
			PWD: tab.cwd,
			TERM: 'xterm-256color',
		};
		return builtins[name] || '';
	}

	function handle_keydown(e: KeyboardEvent) {
		const tab = active_tab;

		// Tab completion
		if (e.key === 'Tab') {
			e.preventDefault();
			handle_tab_completion(tab);
			return;
		}

		// Reset tab completions on other keys
		if (e.key !== 'Tab') {
			tab_completions = [];
			tab_completion_index = -1;
		}

		// Command history navigation
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (tab.history.length === 0) return;

			if (tab.history_index === -1) {
				tab.saved_input = current_input;
				tab.history_index = tab.history.length - 1;
			} else if (tab.history_index > 0) {
				tab.history_index--;
			}

			current_input = tab.history[tab.history_index];
			tick().then(() => {
				if (input_el) {
					input_el.selectionStart = input_el.selectionEnd = current_input.length;
				}
			});
			return;
		}

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (tab.history_index === -1) return;

			if (tab.history_index < tab.history.length - 1) {
				tab.history_index++;
				current_input = tab.history[tab.history_index];
			} else {
				tab.history_index = -1;
				current_input = tab.saved_input;
			}

			tick().then(() => {
				if (input_el) {
					input_el.selectionStart = input_el.selectionEnd = current_input.length;
				}
			});
			return;
		}

		// Enter
		if (e.key === 'Enter') {
			e.preventDefault();
			handle_command();
			return;
		}

		// Ctrl+C
		if (e.key === 'c' && e.ctrlKey) {
			e.preventDefault();
			const prompt_html = render_prompt(tab.cwd);
			const input_html = current_input
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');
			tab.lines = [...tab.lines, { id: tab.line_counter++, html: prompt_html + input_html + '^C' }];
			current_input = '';
			scroll_to_bottom();
			return;
		}

		// Ctrl+L (clear)
		if (e.key === 'l' && e.ctrlKey) {
			e.preventDefault();
			tab.lines = [];
			return;
		}

		// Ctrl+A (beginning of line)
		if (e.key === 'a' && e.ctrlKey) {
			e.preventDefault();
			if (input_el) input_el.selectionStart = input_el.selectionEnd = 0;
			return;
		}

		// Ctrl+E (end of line)
		if (e.key === 'e' && e.ctrlKey) {
			e.preventDefault();
			if (input_el) input_el.selectionStart = input_el.selectionEnd = current_input.length;
			return;
		}

		// Ctrl+U (clear line)
		if (e.key === 'u' && e.ctrlKey) {
			e.preventDefault();
			current_input = '';
			return;
		}

		// Ctrl+W (delete word backward)
		if (e.key === 'w' && e.ctrlKey) {
			e.preventDefault();
			const pos = input_el?.selectionStart ?? current_input.length;
			const before = current_input.slice(0, pos);
			const after = current_input.slice(pos);
			const trimmed = before.replace(/\S+\s*$/, '');
			current_input = trimmed + after;
			tick().then(() => {
				if (input_el) input_el.selectionStart = input_el.selectionEnd = trimmed.length;
			});
			return;
		}

		// Ctrl+T (new tab)
		if (e.key === 't' && (e.ctrlKey || e.metaKey)) {
			// Only intercept if it seems intentional for terminal
			// Cmd+T might be browser new tab, so only do Ctrl+Shift+T
		}
	}

	function handle_tab_completion(tab: Tab) {
		const state = get_state();
		const completions = get_completions(current_input, state);

		if (completions.length === 0) return;

		if (completions.length === 1) {
			// Single match - complete it
			const parts = current_input.split(/\s+/);
			if (parts.length <= 1) {
				current_input = completions[0] + ' ';
			} else {
				parts[parts.length - 1] = completions[0];
				current_input = parts.join(' ');
				// Add trailing space for files, not for dirs (dirs end with /)
				if (!current_input.endsWith('/')) current_input += ' ';
			}
			tab_completions = [];
			tab_completion_index = -1;
		} else {
			// Multiple matches - show them
			if (tab_completions.length === 0 || JSON.stringify(tab_completions) !== JSON.stringify(completions)) {
				tab_completions = completions;
				tab_completion_index = -1;

				// Display completions as a line
				const prompt_html = render_prompt(tab.cwd);
				const input_html = current_input
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;');
				tab.lines = [...tab.lines, { id: tab.line_counter++, html: prompt_html + input_html }];
				add_lines(tab, [completions.join('  ')]);
				scroll_to_bottom();
			} else {
				// Cycle through completions
				tab_completion_index = (tab_completion_index + 1) % completions.length;
				const parts = current_input.split(/\s+/);
				if (parts.length <= 1) {
					current_input = completions[tab_completion_index];
				} else {
					parts[parts.length - 1] = completions[tab_completion_index];
					current_input = parts.join(' ');
				}
			}

			// Find common prefix and auto-fill it
			if (tab_completion_index === -1) {
				const first = completions[0];
				let common_len = first.length;
				for (const c of completions) {
					while (common_len > 0 && c.slice(0, common_len) !== first.slice(0, common_len)) {
						common_len--;
					}
				}
				if (common_len > 0) {
					const parts = current_input.split(/\s+/);
					const last = parts[parts.length - 1];
					if (first.slice(0, common_len).length > last.length) {
						parts[parts.length - 1] = first.slice(0, common_len);
						current_input = parts.join(' ');
					}
				}
			}
		}
	}

	function scroll_to_bottom() {
		tick().then(() => {
			if (terminal_el) {
				terminal_el.scrollTop = terminal_el.scrollHeight;
			}
		});
	}

	function focus_input() {
		tick().then(() => {
			input_el?.focus();
		});
	}

	// Track cursor for the block cursor
	function handle_input_change() {
		cursor_position = input_el?.selectionStart ?? current_input.length;
	}

	// Title bar text
	let title_text = $derived(() => {
		const tab = active_tab;
		const dir_display = display_path(tab.cwd);
		const short_dir = dir_display === '/Users/user' ? '~' : dir_display;
		return `user@macbook: ${short_dir} - zsh - 80x24`;
	});

	onMount(() => {
		focus_input();
	});

	// Auto-scroll when lines change
	$effect(() => {
		// Track the lines array length to trigger scroll
		const _len = active_tab.lines.length;
		scroll_to_bottom();
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<section class="container" onclick={focus_input}>
	<!-- Tab bar (only show if multiple tabs) -->
	{#if tabs.length > 1}
		<div class="tab-bar">
			{#each tabs as tab (tab.id)}
				<div
					class="tab"
					class:active={tab.id === active_tab_id}
					role="tab"
					tabindex="0"
					aria-selected={tab.id === active_tab_id}
					onclick={(e) => { e.stopPropagation(); switch_tab(tab.id); }}
					onkeydown={(e) => { if (e.key === 'Enter') switch_tab(tab.id); }}
				>
					<span class="tab-title">{tab.title} ({tab.id})</span>
					<button
						class="tab-close"
						aria-label="Close tab"
						onclick={(e) => { e.stopPropagation(); close_tab(tab.id); }}
					>
						&times;
					</button>
				</div>
			{/each}
			<button class="tab-add" onclick={(e) => { e.stopPropagation(); add_tab(); }}>+</button>
		</div>
	{/if}

	<header class="app-window-drag-handle titlebar">
		<span class="title-text">{title_text()}</span>
		{#if tabs.length <= 1}
			<button class="new-tab-btn" onclick={(e) => { e.stopPropagation(); add_tab(); }} title="New Tab">
				+
			</button>
		{/if}
	</header>

	<div class="terminal" bind:this={terminal_el}>
		{#each active_tab.lines as line (line.id)}
			<div class="line">{@html line.html || '&nbsp;'}</div>
		{/each}
		<div class="input-line">
			<span class="prompt">{@html render_prompt(active_tab.cwd)}</span>
			<div class="input-wrapper">
				<input
					bind:this={input_el}
					bind:value={current_input}
					onkeydown={handle_keydown}
					oninput={handle_input_change}
					onclick={handle_input_change}
					onkeyup={handle_input_change}
					spellcheck="false"
					autocomplete="off"
					autocapitalize="off"
				/>
				<span
					class="cursor-block"
					style:left="{(input_el?.selectionStart ?? current_input.length) * 7.8}px"
				></span>
			</div>
		</div>
	</div>
</section>

<style>
	.container {
		height: 100%;
		width: 100%;
		background-color: rgba(30, 30, 30, 0.95);
		backdrop-filter: blur(20px);
		border-radius: inherit;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
		font-size: 13px;
		line-height: 1.4;
	}

	/* Tab bar */
	.tab-bar {
		display: flex;
		align-items: stretch;
		background: rgba(40, 40, 42, 0.95);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		min-height: 30px;
		padding: 0 4px;
		gap: 1px;
		overflow-x: auto;
	}

	.tab {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 12px;
		background: rgba(50, 50, 52, 0.6);
		border: none;
		color: rgba(255, 255, 255, 0.5);
		font-family: var(--system-font-family);
		font-size: 11px;
		cursor: pointer;
		border-radius: 6px 6px 0 0;
		margin-top: 4px;
		min-width: 80px;
		max-width: 160px;
		white-space: nowrap;
		overflow: hidden;
		transition: background 0.15s;
	}

	.tab:hover {
		background: rgba(60, 60, 62, 0.8);
		color: rgba(255, 255, 255, 0.7);
	}

	.tab.active {
		background: rgba(30, 30, 30, 0.95);
		color: rgba(255, 255, 255, 0.9);
	}

	.tab-title {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.tab-close {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.3);
		font-size: 14px;
		cursor: pointer;
		padding: 0 2px;
		line-height: 1;
		border-radius: 3px;
	}

	.tab-close:hover {
		color: rgba(255, 255, 255, 0.8);
		background: rgba(255, 255, 255, 0.1);
	}

	.tab-add {
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.4);
		font-size: 16px;
		cursor: pointer;
		padding: 0 10px;
		margin-top: 4px;
	}

	.tab-add:hover {
		color: rgba(255, 255, 255, 0.8);
	}

	/* Title bar */
	.titlebar {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 8px 12px;
		min-height: 36px;
		background: rgba(56, 56, 58, 0.8);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		position: relative;
	}

	.title-text {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.6);
		font-family: var(--system-font-family);
	}

	.new-tab-btn {
		position: absolute;
		right: 12px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: rgba(255, 255, 255, 0.5);
		font-size: 14px;
		cursor: pointer;
		width: 22px;
		height: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		padding: 0;
		line-height: 1;
	}

	.new-tab-btn:hover {
		color: rgba(255, 255, 255, 0.8);
		background: rgba(255, 255, 255, 0.08);
	}

	/* Terminal area */
	.terminal {
		flex: 1;
		padding: 8px 12px;
		overflow-y: auto;
		overflow-x: hidden;
		color: #cccccc;
	}

	.terminal::-webkit-scrollbar {
		width: 8px;
	}

	.terminal::-webkit-scrollbar-track {
		background: transparent;
	}

	.terminal::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.15);
		border-radius: 4px;
	}

	.terminal::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.25);
	}

	.line {
		white-space: pre-wrap;
		word-break: break-all;
		line-height: 1.4;
		min-height: 1.4em;
	}

	.input-line {
		display: flex;
		align-items: center;
		line-height: 1.4;
	}

	.prompt {
		white-space: pre;
		flex-shrink: 0;
	}

	.input-wrapper {
		flex: 1;
		position: relative;
		display: flex;
		align-items: center;
	}

	input {
		flex: 1;
		background: none;
		border: none;
		color: #cccccc;
		font-family: inherit;
		font-size: inherit;
		padding: 0;
		outline: none;
		caret-color: transparent;
		line-height: 1.4;
	}

	.cursor-block {
		position: absolute;
		top: 1px;
		display: inline-block;
		width: 7.8px;
		height: 1.15em;
		background-color: rgba(204, 204, 204, 0.7);
		animation: blink 1s step-end infinite;
		pointer-events: none;
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0; }
	}
</style>
