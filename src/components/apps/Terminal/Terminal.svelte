<script lang="ts">
	import { onMount } from 'svelte';

	let lines = $state<string[]>([
		'Last login: Mon Jan 15 09:42:13 on ttys001',
		'',
	]);

	let current_input = $state('');
	let input_el = $state<HTMLInputElement>();
	let terminal_el = $state<HTMLDivElement>();

	const prompt = 'user@macbook ~ % ';

	const commands: Record<string, () => string[]> = {
		'ls': () => ['Applications    Documents    Library    Pictures',
			'Desktop        Downloads    Movies     Public'],
		'pwd': () => ['/Users/user'],
		'whoami': () => ['user'],
		'date': () => [new Date().toString()],
		'echo': () => [''],
		'uname -a': () => ['Darwin Macbook.local 23.2.0 Darwin Kernel Version 23.2.0'],
		'clear': () => [],
		'help': () => [
			'Available commands: ls, pwd, whoami, date, echo, uname, clear, help, neofetch',
		],
		'neofetch': () => [
			'                    \'c.          user@macbook',
			'                 ,xNMM.          -----------',
			'               .OMMMMo           OS: macOS Sonoma 14.2.1',
			'               OMMM0,            Host: MacBook Pro',
			'     .;loddo:\' loolloddol;.     Kernel: 23.2.0',
			'   cKMMMMMMMMMMNWMMMMMMMMMM0:    Shell: zsh 5.9',
			'  .KMMMMMMMMMMMMMMMMMMMMMMMWd.   Terminal: macOS-web',
			'  XMMMMMMMMMMMMMMMMMMMMMMMX.     Memory: 16384MB',
			'',
		],
	};

	function handle_command() {
		const cmd = current_input.trim();
		lines = [...lines, prompt + cmd];

		if (cmd === 'clear') {
			lines = [];
		} else if (cmd === '') {
			// just add empty line
		} else if (cmd.startsWith('echo ')) {
			lines = [...lines, cmd.slice(5)];
		} else if (commands[cmd]) {
			lines = [...lines, ...commands[cmd]()];
		} else {
			lines = [...lines, `zsh: command not found: ${cmd}`];
		}

		current_input = '';

		setTimeout(() => {
			if (terminal_el) {
				terminal_el.scrollTop = terminal_el.scrollHeight;
			}
		}, 10);
	}

	function focus_input() {
		input_el?.focus();
	}

	onMount(() => {
		input_el?.focus();
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<section class="container" onclick={focus_input}>
	<header class="app-window-drag-handle titlebar">
		<span class="title-text">user@macbook — zsh — 80x24</span>
	</header>

	<div class="terminal" bind:this={terminal_el}>
		{#each lines as line}
			<div class="line">{line}</div>
		{/each}
		<div class="input-line">
			<span class="prompt">{prompt}</span>
			<input
				bind:this={input_el}
				bind:value={current_input}
				onkeydown={(e) => { if (e.key === 'Enter') handle_command(); }}
				spellcheck="false"
				autocomplete="off"
			/>
			<span class="cursor-block"></span>
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
	}

	.titlebar {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 8px 12px;
		min-height: 36px;
		background: rgba(56, 56, 58, 0.8);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.title-text {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.6);
		font-family: var(--system-font-family);
	}

	.terminal {
		flex: 1;
		padding: 8px 12px;
		overflow-y: auto;
		overflow-x: hidden;
		color: #33ff33;
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
		color: #33ff33;
		white-space: pre;
	}

	input {
		flex: 1;
		background: none;
		border: none;
		color: #33ff33;
		font-family: inherit;
		font-size: inherit;
		padding: 0;
		outline: none;
		caret-color: transparent;
	}

	.cursor-block {
		display: inline-block;
		width: 8px;
		height: 1.2em;
		background-color: #33ff33;
		animation: blink 1s step-end infinite;
		margin-left: -1px;
		vertical-align: text-bottom;
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0; }
	}
</style>
