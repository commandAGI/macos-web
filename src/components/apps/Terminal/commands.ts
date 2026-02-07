// Command implementations for the Terminal app

import {
	type FSNode,
	resolve_path,
	get_parent_dir,
	format_size,
	format_date_short,
	display_path,
} from './virtual-fs';

// ANSI-style color tags that get rendered as HTML spans
// We use a simple tag system: <c:color>text</c>
// Colors: red, green, blue, cyan, magenta, yellow, white, gray, bold, dim
export function colorize(text: string, color: string): string {
	return `<c:${color}>${text}</c>`;
}

export interface TerminalState {
	cwd: string;
	fs_root: Map<string, FSNode>;
	history: string[];
	env: Record<string, string>;
}

export interface CommandResult {
	lines: string[];
	new_cwd?: string;
	clear?: boolean;
}

type CommandFn = (args: string[], state: TerminalState) => CommandResult;

function cmd_ls(args: string[], state: TerminalState): CommandResult {
	const show_all = args.includes('-a') || args.includes('-la') || args.includes('-al');
	const show_long = args.includes('-l') || args.includes('-la') || args.includes('-al');

	// Find path argument (non-flag)
	const path_arg = args.find(a => !a.startsWith('-')) || '.';
	const target = path_arg === '.' ? state.cwd : path_arg;
	const { node, absolute_path } = resolve_path(state.fs_root, state.cwd, target);

	if (!node) {
		return { lines: [`ls: ${path_arg}: No such file or directory`] };
	}

	if (node.type === 'file') {
		if (show_long) {
			return { lines: [format_long_entry(node)] };
		}
		return { lines: [node.name] };
	}

	if (node.type !== 'dir' || !node.children) {
		return { lines: [] };
	}

	let entries = Array.from(node.children.values());

	if (!show_all) {
		entries = entries.filter(e => !e.name.startsWith('.'));
	}

	entries.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

	if (show_long) {
		const total = entries.reduce((sum, e) => sum + Math.ceil(e.size / 512), 0);
		const lines = [`total ${total}`];

		if (show_all) {
			// Add . and ..
			lines.push(format_long_entry({
				type: 'dir', name: '.', permissions: 'drwxr-xr-x',
				owner: 'user', group: 'staff', size: 64,
				modified: node.modified,
			}));
			lines.push(format_long_entry({
				type: 'dir', name: '..', permissions: 'drwxr-xr-x',
				owner: 'user', group: 'staff', size: 64,
				modified: node.modified,
			}));
		}

		for (const entry of entries) {
			lines.push(format_long_entry(entry));
		}
		return { lines };
	}

	// Short format: colorized columns
	const items = entries.map(e => colorize_entry_name(e));
	if (items.length === 0) return { lines: [] };

	// Lay out in columns
	const lines = layout_columns(items, entries);
	return { lines };
}

function format_long_entry(entry: FSNode): string {
	const links = entry.type === 'dir' ? ' 3' : ' 1';
	const owner = entry.owner.padEnd(6);
	const group = entry.group.padEnd(6);
	const size = String(entry.size).padStart(8);
	const date = format_date_short(entry.modified);
	const name = colorize_entry_name(entry);
	return `${entry.permissions}${links} ${owner} ${group} ${size} ${date} ${name}`;
}

function colorize_entry_name(entry: FSNode): string {
	if (entry.type === 'dir') {
		return colorize(entry.name, 'blue');
	}
	if (entry.type === 'symlink') {
		return colorize(entry.name, 'magenta') + ' -> ' + (entry.target || '');
	}
	if (entry.permissions?.includes('x')) {
		return colorize(entry.name, 'red');
	}
	// Colorize by extension
	const ext = entry.name.split('.').pop()?.toLowerCase();
	if (ext && ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'ico'].includes(ext)) {
		return colorize(entry.name, 'magenta');
	}
	if (ext && ['zip', 'tar', 'gz', 'bz2', 'xz', 'dmg', 'iso'].includes(ext)) {
		return colorize(entry.name, 'red');
	}
	if (ext && ['pdf', 'doc', 'docx', 'xlsx'].includes(ext)) {
		return colorize(entry.name, 'green');
	}
	return entry.name;
}

function layout_columns(colored_items: string[], entries: FSNode[]): string[] {
	// For simplicity, use a 2-4 column layout based on count
	if (entries.length <= 4) {
		return [colored_items.join('    ')];
	}

	// Calculate raw name lengths (without color tags)
	const raw_lengths = entries.map(e => e.name.length);
	const max_len = Math.max(...raw_lengths) + 4;
	const cols = Math.max(1, Math.floor(80 / max_len));

	const lines: string[] = [];
	for (let i = 0; i < colored_items.length; i += cols) {
		const row_items: string[] = [];
		for (let j = 0; j < cols && i + j < colored_items.length; j++) {
			const idx = i + j;
			const padding = max_len - raw_lengths[idx];
			row_items.push(colored_items[idx] + ' '.repeat(Math.max(1, padding)));
		}
		lines.push(row_items.join(''));
	}
	return lines;
}

function cmd_cd(args: string[], state: TerminalState): CommandResult {
	const target = args[0] || '~';

	if (target === '-') {
		const old = state.env['OLDPWD'] || state.cwd;
		return { lines: [], new_cwd: old };
	}

	const { node, absolute_path } = resolve_path(state.fs_root, state.cwd, target);

	if (!node) {
		return { lines: [`cd: no such file or directory: ${target}`] };
	}

	if (node.type !== 'dir') {
		return { lines: [`cd: not a directory: ${target}`] };
	}

	return { lines: [], new_cwd: absolute_path };
}

function cmd_pwd(_args: string[], state: TerminalState): CommandResult {
	return { lines: [state.cwd] };
}

function cmd_cat(args: string[], state: TerminalState): CommandResult {
	if (args.length === 0) {
		return { lines: ['usage: cat [-benstuv] [file ...]'] };
	}

	const show_numbers = args.includes('-n');
	const file_args = args.filter(a => !a.startsWith('-'));
	const all_lines: string[] = [];

	for (const file_path of file_args) {
		const { node } = resolve_path(state.fs_root, state.cwd, file_path);

		if (!node) {
			all_lines.push(`cat: ${file_path}: No such file or directory`);
			continue;
		}

		if (node.type === 'dir') {
			all_lines.push(`cat: ${file_path}: Is a directory`);
			continue;
		}

		if (node.content !== undefined) {
			const lines = node.content.split('\n');
			// Remove trailing empty line from split
			if (lines[lines.length - 1] === '') lines.pop();
			if (show_numbers) {
				lines.forEach((line, i) => {
					all_lines.push(`     ${i + 1}\t${line}`);
				});
			} else {
				all_lines.push(...lines);
			}
		} else {
			all_lines.push(`cat: ${file_path}: Binary file`);
		}
	}

	return { lines: all_lines };
}

function cmd_echo(args: string[], _state: TerminalState): CommandResult {
	const text = args.join(' ')
		.replace(/^["']|["']$/g, '')
		.replace(/\\n/g, '\n')
		.replace(/\\t/g, '\t');
	return { lines: text.split('\n') };
}

function cmd_printf(args: string[], _state: TerminalState): CommandResult {
	if (args.length === 0) return { lines: ['printf: usage: printf format [arguments]'] };
	const fmt = args[0].replace(/^["']|["']$/g, '');
	const text = fmt.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
	const result_args = args.slice(1).join(' ');
	return { lines: (text + result_args).split('\n') };
}

function cmd_mkdir(args: string[], state: TerminalState): CommandResult {
	const make_parents = args.includes('-p');
	const dir_args = args.filter(a => !a.startsWith('-'));

	if (dir_args.length === 0) {
		return { lines: ['usage: mkdir [-pv] directory ...'] };
	}

	for (const dir_path of dir_args) {
		const { node } = resolve_path(state.fs_root, state.cwd, dir_path);
		if (node) {
			return { lines: [`mkdir: ${dir_path}: File exists`] };
		}

		const { parent, parent_path } = get_parent_dir(
			state.fs_root,
			resolve_path(state.fs_root, state.cwd, dir_path).absolute_path,
		);

		if (!parent || parent.type !== 'dir' || !parent.children) {
			if (!make_parents) {
				return { lines: [`mkdir: ${dir_path}: No such file or directory`] };
			}
		}

		const name = dir_path.split('/').filter(Boolean).pop()!;
		if (parent && parent.children) {
			parent.children.set(name, {
				type: 'dir',
				name,
				permissions: 'drwxr-xr-x',
				owner: 'user',
				group: 'staff',
				size: 64,
				modified: new Date(),
				children: new Map(),
			});
		}
	}

	return { lines: [] };
}

function cmd_touch(args: string[], state: TerminalState): CommandResult {
	const file_args = args.filter(a => !a.startsWith('-'));

	if (file_args.length === 0) {
		return { lines: ['usage: touch [-A [-][[hh]mm]SS] [-achm] [-r file] [-t [[CC]YY]MMDDhhmm[.SS]] file ...'] };
	}

	for (const file_path of file_args) {
		const { node } = resolve_path(state.fs_root, state.cwd, file_path);
		if (node) {
			node.modified = new Date();
			continue;
		}

		const abs_path = resolve_path(state.fs_root, state.cwd, file_path).absolute_path;
		const { parent } = get_parent_dir(state.fs_root, abs_path);

		if (!parent || parent.type !== 'dir' || !parent.children) {
			return { lines: [`touch: ${file_path}: No such file or directory`] };
		}

		const name = abs_path.split('/').filter(Boolean).pop()!;
		parent.children.set(name, {
			type: 'file',
			name,
			permissions: '-rw-r--r--',
			owner: 'user',
			group: 'staff',
			size: 0,
			modified: new Date(),
			content: '',
		});
	}

	return { lines: [] };
}

function cmd_rm(args: string[], state: TerminalState): CommandResult {
	const recursive = args.includes('-r') || args.includes('-rf') || args.includes('-R');
	const force = args.includes('-f') || args.includes('-rf');
	const file_args = args.filter(a => !a.startsWith('-'));

	if (file_args.length === 0) {
		return { lines: ['usage: rm [-f | -i] [-dIPRrvWx] file ...'] };
	}

	for (const file_path of file_args) {
		const abs_path = resolve_path(state.fs_root, state.cwd, file_path).absolute_path;
		const { node } = resolve_path(state.fs_root, state.cwd, file_path);

		if (!node) {
			if (!force) {
				return { lines: [`rm: ${file_path}: No such file or directory`] };
			}
			continue;
		}

		if (node.type === 'dir' && !recursive) {
			return { lines: [`rm: ${file_path}: is a directory`] };
		}

		const { parent } = get_parent_dir(state.fs_root, abs_path);
		if (parent && parent.children) {
			parent.children.delete(node.name);
		}
	}

	return { lines: [] };
}

function cmd_grep(args: string[], state: TerminalState): CommandResult {
	const case_insensitive = args.includes('-i');
	const show_numbers = args.includes('-n');
	const non_flag_args = args.filter(a => !a.startsWith('-'));

	if (non_flag_args.length < 2) {
		return { lines: ['usage: grep [-abcDEFGHhIiJLlMmnOopqRSsUVvwXxZz] [-A num] [-B num] [-C[num]]', '       [-e pattern] [-f file] [--binary-files=value] [--color=when]', '       [pattern] [file ...]'] };
	}

	const pattern = non_flag_args[0];
	const file_paths = non_flag_args.slice(1);
	const all_lines: string[] = [];
	const regex = new RegExp(pattern, case_insensitive ? 'gi' : 'g');
	const multi_file = file_paths.length > 1;

	for (const file_path of file_paths) {
		const { node } = resolve_path(state.fs_root, state.cwd, file_path);

		if (!node) {
			all_lines.push(`grep: ${file_path}: No such file or directory`);
			continue;
		}

		if (node.type === 'dir') {
			all_lines.push(`grep: ${file_path}: Is a directory`);
			continue;
		}

		if (node.content) {
			const lines = node.content.split('\n');
			lines.forEach((line, i) => {
				if (regex.test(line)) {
					regex.lastIndex = 0; // reset
					const highlighted = line.replace(regex, (match) => colorize(match, 'red'));
					const prefix_parts: string[] = [];
					if (multi_file) prefix_parts.push(colorize(file_path, 'magenta') + ':');
					if (show_numbers) prefix_parts.push(colorize(String(i + 1), 'green') + ':');
					all_lines.push(prefix_parts.join('') + highlighted);
				}
				regex.lastIndex = 0;
			});
		}
	}

	return { lines: all_lines };
}

function cmd_clear(_args: string[], _state: TerminalState): CommandResult {
	return { lines: [], clear: true };
}

function cmd_history(_args: string[], state: TerminalState): CommandResult {
	return {
		lines: state.history.map((cmd, i) =>
			`  ${String(i + 1).padStart(4)}  ${cmd}`
		),
	};
}

function cmd_whoami(_args: string[], _state: TerminalState): CommandResult {
	return { lines: ['user'] };
}

function cmd_hostname(_args: string[], _state: TerminalState): CommandResult {
	return { lines: ['macbook.local'] };
}

function cmd_uname(args: string[], _state: TerminalState): CommandResult {
	if (args.includes('-a')) {
		return { lines: ['Darwin macbook.local 23.2.0 Darwin Kernel Version 23.2.0: Wed Nov 15 21:54:10 PST 2023; root:xnu-10002.61.3~2/RELEASE_ARM64_T6000 arm64'] };
	}
	if (args.includes('-r')) {
		return { lines: ['23.2.0'] };
	}
	if (args.includes('-m')) {
		return { lines: ['arm64'] };
	}
	return { lines: ['Darwin'] };
}

function cmd_date(_args: string[], _state: TerminalState): CommandResult {
	const d = new Date();
	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const tz = d.toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ').pop();
	return {
		lines: [`${days[d.getDay()]} ${months[d.getMonth()]} ${String(d.getDate()).padStart(2, ' ')} ${d.toTimeString().split(' ')[0]} ${tz} ${d.getFullYear()}`],
	};
}

function cmd_uptime(_args: string[], _state: TerminalState): CommandResult {
	const d = new Date();
	const time = d.toTimeString().split(' ')[0].slice(0, 5);
	const days = Math.floor(Math.random() * 14) + 1;
	const users = 2;
	const load = [
		(Math.random() * 3 + 0.5).toFixed(2),
		(Math.random() * 2 + 0.3).toFixed(2),
		(Math.random() * 1.5 + 0.2).toFixed(2),
	];
	return {
		lines: [`${time}  up ${days} days,  3:42, ${users} users, load averages: ${load.join(' ')}`],
	};
}

function cmd_which(args: string[], _state: TerminalState): CommandResult {
	if (args.length === 0) return { lines: [] };

	const known_paths: Record<string, string> = {
		'ls': '/bin/ls', 'cd': '/usr/bin/cd', 'cat': '/bin/cat', 'grep': '/usr/bin/grep',
		'mkdir': '/bin/mkdir', 'rm': '/bin/rm', 'touch': '/usr/bin/touch',
		'echo': '/bin/echo', 'python3': '/usr/bin/python3', 'node': '/usr/local/bin/node',
		'npm': '/usr/local/bin/npm', 'git': '/usr/bin/git', 'vim': '/usr/bin/vim',
		'curl': '/usr/bin/curl', 'zsh': '/bin/zsh', 'bash': '/bin/bash',
		'ssh': '/usr/bin/ssh', 'man': '/usr/bin/man', 'brew': '/usr/local/bin/brew',
	};

	const lines: string[] = [];
	for (const cmd of args) {
		if (known_paths[cmd]) {
			lines.push(known_paths[cmd]);
		} else {
			lines.push(`${cmd} not found`);
		}
	}
	return { lines };
}

function cmd_head(args: string[], state: TerminalState): CommandResult {
	let num_lines = 10;
	const file_args: string[] = [];
	for (let i = 0; i < args.length; i++) {
		if (args[i] === '-n' && args[i + 1]) {
			num_lines = parseInt(args[i + 1], 10) || 10;
			i++;
		} else if (!args[i].startsWith('-')) {
			file_args.push(args[i]);
		}
	}

	if (file_args.length === 0) return { lines: ['usage: head [-n count] [file ...]'] };

	const all: string[] = [];
	for (const fp of file_args) {
		const { node } = resolve_path(state.fs_root, state.cwd, fp);
		if (!node) { all.push(`head: ${fp}: No such file or directory`); continue; }
		if (node.type === 'dir') { all.push(`head: ${fp}: Is a directory`); continue; }
		if (node.content) {
			const lines = node.content.split('\n');
			all.push(...lines.slice(0, num_lines));
		}
	}
	return { lines: all };
}

function cmd_tail(args: string[], state: TerminalState): CommandResult {
	let num_lines = 10;
	const file_args: string[] = [];
	for (let i = 0; i < args.length; i++) {
		if (args[i] === '-n' && args[i + 1]) {
			num_lines = parseInt(args[i + 1], 10) || 10;
			i++;
		} else if (!args[i].startsWith('-')) {
			file_args.push(args[i]);
		}
	}

	if (file_args.length === 0) return { lines: ['usage: tail [-n count] [file ...]'] };

	const all: string[] = [];
	for (const fp of file_args) {
		const { node } = resolve_path(state.fs_root, state.cwd, fp);
		if (!node) { all.push(`tail: ${fp}: No such file or directory`); continue; }
		if (node.type === 'dir') { all.push(`tail: ${fp}: Is a directory`); continue; }
		if (node.content) {
			const lines = node.content.split('\n').filter(l => l !== '');
			all.push(...lines.slice(-num_lines));
		}
	}
	return { lines: all };
}

function cmd_wc(args: string[], state: TerminalState): CommandResult {
	const file_args = args.filter(a => !a.startsWith('-'));
	if (file_args.length === 0) return { lines: ['usage: wc [-clmw] [file ...]'] };

	const all: string[] = [];
	let total_lines = 0, total_words = 0, total_bytes = 0;

	for (const fp of file_args) {
		const { node } = resolve_path(state.fs_root, state.cwd, fp);
		if (!node) { all.push(`wc: ${fp}: No such file or directory`); continue; }
		if (node.type === 'dir') { all.push(`wc: ${fp}: Is a directory`); continue; }
		const content = node.content || '';
		const l = content.split('\n').length - (content.endsWith('\n') ? 1 : 0);
		const w = content.split(/\s+/).filter(Boolean).length;
		const b = node.size || content.length;
		total_lines += l; total_words += w; total_bytes += b;
		all.push(`${String(l).padStart(8)}${String(w).padStart(8)}${String(b).padStart(8)} ${fp}`);
	}

	if (file_args.length > 1) {
		all.push(`${String(total_lines).padStart(8)}${String(total_words).padStart(8)}${String(total_bytes).padStart(8)} total`);
	}
	return { lines: all };
}

function cmd_man(args: string[], _state: TerminalState): CommandResult {
	if (args.length === 0) {
		return { lines: ['What manual page do you want?', 'For example, try \'man man\'.'] };
	}

	const manpages: Record<string, string[]> = {
		ls: [
			colorize('LS(1)', 'bold') + '                     General Commands Manual                    ' + colorize('LS(1)', 'bold'),
			'',
			colorize('NAME', 'bold'),
			'     ls -- list directory contents',
			'',
			colorize('SYNOPSIS', 'bold'),
			'     ls [-@ABCFGHILOPRSTUWabcdefghiklmnopqrstuvwxy1%,] [--color=when]',
			'        [-D format] [file ...]',
			'',
			colorize('DESCRIPTION', 'bold'),
			'     For each operand that names a file of a type other than directory, ls',
			'     displays its name as well as any requested, associated information.',
			'',
			'     -a    Include directory entries whose names begin with a dot (.).',
			'     -l    List files in the long format.',
			'     -la   Combination of -l and -a flags.',
			'',
			'     (END)',
		],
		cd: [
			colorize('CD(1)', 'bold') + '                     General Commands Manual                    ' + colorize('CD(1)', 'bold'),
			'',
			colorize('NAME', 'bold'),
			'     cd -- change the working directory',
			'',
			colorize('SYNOPSIS', 'bold'),
			'     cd [directory]',
			'',
			colorize('DESCRIPTION', 'bold'),
			'     Change the current directory to directory. The variable HOME is the',
			'     default directory.',
			'',
			'     cd -   Return to previous directory.',
			'',
			'     (END)',
		],
		grep: [
			colorize('GREP(1)', 'bold') + '                   General Commands Manual                  ' + colorize('GREP(1)', 'bold'),
			'',
			colorize('NAME', 'bold'),
			'     grep -- file pattern searcher',
			'',
			colorize('SYNOPSIS', 'bold'),
			'     grep [-i] [-n] pattern file ...',
			'',
			colorize('DESCRIPTION', 'bold'),
			'     grep searches for pattern in each file. When a match is found, the',
			'     matching line is printed.',
			'',
			'     -i    Case-insensitive search.',
			'     -n    Show line numbers.',
			'',
			'     (END)',
		],
		man: [
			colorize('MAN(1)', 'bold') + '                    General Commands Manual                   ' + colorize('MAN(1)', 'bold'),
			'',
			colorize('NAME', 'bold'),
			'     man -- format and display the on-line manual pages',
			'',
			colorize('SYNOPSIS', 'bold'),
			'     man [command]',
			'',
			colorize('DESCRIPTION', 'bold'),
			'     man formats and displays the on-line manual pages.',
			'',
			'     (END)',
		],
	};

	const page = manpages[args[0]];
	if (page) return { lines: page };

	return { lines: [`No manual entry for ${args[0]}`] };
}

function cmd_top(_args: string[], _state: TerminalState): CommandResult {
	const procs = [
		{ pid: 1, name: 'kernel_task', cpu: (Math.random() * 5).toFixed(1), mem: '1024M', user: 'root', state: 'sleeping' },
		{ pid: 127, name: 'WindowServer', cpu: (Math.random() * 15 + 5).toFixed(1), mem: '512M', user: 'root', state: 'running' },
		{ pid: 248, name: 'Safari', cpu: (Math.random() * 20 + 3).toFixed(1), mem: '896M', user: 'user', state: 'running' },
		{ pid: 302, name: 'Terminal', cpu: (Math.random() * 3).toFixed(1), mem: '64M', user: 'user', state: 'running' },
		{ pid: 355, name: 'Finder', cpu: (Math.random() * 5).toFixed(1), mem: '128M', user: 'user', state: 'running' },
		{ pid: 412, name: 'Dock', cpu: (Math.random() * 2).toFixed(1), mem: '48M', user: 'user', state: 'sleeping' },
		{ pid: 489, name: 'Spotlight', cpu: (Math.random() * 8).toFixed(1), mem: '256M', user: 'user', state: 'sleeping' },
		{ pid: 523, name: 'loginwindow', cpu: '0.0', mem: '32M', user: 'root', state: 'sleeping' },
		{ pid: 601, name: 'mds_stores', cpu: (Math.random() * 4).toFixed(1), mem: '96M', user: 'root', state: 'sleeping' },
		{ pid: 678, name: 'coreaudiod', cpu: (Math.random() * 2).toFixed(1), mem: '24M', user: 'root', state: 'sleeping' },
		{ pid: 712, name: 'SystemUIServer', cpu: (Math.random() * 1.5).toFixed(1), mem: '36M', user: 'user', state: 'sleeping' },
		{ pid: 845, name: 'Activity Monitor', cpu: (Math.random() * 6 + 1).toFixed(1), mem: '78M', user: 'user', state: 'running' },
	];

	const total_cpu = procs.reduce((s, p) => s + parseFloat(p.cpu), 0);
	const d = new Date();
	const time = d.toTimeString().split(' ')[0].slice(0, 5);

	const lines = [
		colorize(`Processes: ${procs.length} total, 4 running, ${procs.length - 4} sleeping`, 'bold'),
		colorize(`Load Avg: ${(Math.random() * 3 + 1).toFixed(2)}, ${(Math.random() * 2 + 0.5).toFixed(2)}, ${(Math.random() * 1.5 + 0.3).toFixed(2)}`, 'bold'),
		colorize(`CPU usage: ${total_cpu.toFixed(1)}% user, ${(Math.random() * 5).toFixed(1)}% sys, ${(100 - total_cpu - 5).toFixed(1)}% idle`, 'bold'),
		colorize(`PhysMem: 8192M used (4096M wired), 8192M unused.`, 'bold'),
		'',
		colorize('PID    COMMAND          %CPU  MEM     USER     STATE', 'bold'),
		...procs
			.sort((a, b) => parseFloat(b.cpu) - parseFloat(a.cpu))
			.map(p =>
				`${String(p.pid).padStart(5)}  ${p.name.padEnd(17)}${p.cpu.padStart(5)}  ${p.mem.padStart(6)}  ${p.user.padEnd(8)} ${p.state}`
			),
		'',
		colorize('(simulated output - press q to exit)', 'dim'),
	];
	return { lines };
}

function cmd_curl(args: string[], _state: TerminalState): CommandResult {
	const url = args.find(a => !a.startsWith('-')) || '';
	if (!url) {
		return { lines: ['curl: try \'curl --help\' for more information'] };
	}

	const verbose = args.includes('-v') || args.includes('--verbose');
	const lines: string[] = [];

	if (verbose) {
		lines.push(colorize(`*   Trying 93.184.216.34:443...`, 'dim'));
		lines.push(colorize(`* Connected to ${url.replace(/https?:\/\//, '').split('/')[0]} (93.184.216.34) port 443`, 'dim'));
		lines.push(colorize(`> GET / HTTP/2`, 'dim'));
		lines.push(colorize(`> Host: ${url.replace(/https?:\/\//, '').split('/')[0]}`, 'dim'));
		lines.push(colorize(`> User-Agent: curl/8.4.0`, 'dim'));
		lines.push(colorize(`> Accept: */*`, 'dim'));
		lines.push(colorize(`>`, 'dim'));
		lines.push(colorize(`< HTTP/2 200`, 'dim'));
		lines.push(colorize(`< content-type: text/html; charset=UTF-8`, 'dim'));
		lines.push(colorize(`< date: ${new Date().toUTCString()}`, 'dim'));
		lines.push(colorize(`<`, 'dim'));
	}

	lines.push('<!DOCTYPE html>');
	lines.push('<html>');
	lines.push('<head><title>Example</title></head>');
	lines.push('<body>');
	lines.push('<h1>Hello from the simulated internet!</h1>');
	lines.push('<p>This is a simulated curl response.</p>');
	lines.push('</body>');
	lines.push('</html>');

	return { lines };
}

function cmd_python3(args: string[], _state: TerminalState): CommandResult {
	if (args.includes('--version') || args.includes('-V')) {
		return { lines: ['Python 3.12.1'] };
	}
	if (args.includes('-c') && args.length > 1) {
		const code = args.slice(args.indexOf('-c') + 1).join(' ').replace(/^["']|["']$/g, '');
		if (code.includes('print')) {
			const match = code.match(/print\(["'](.*)["']\)/);
			if (match) return { lines: [match[1]] };
			const math_match = code.match(/print\((.+)\)/);
			if (math_match) {
				try {
					const result = eval(math_match[1]);
					return { lines: [String(result)] };
				} catch {
					return { lines: [`NameError: name '${math_match[1]}' is not defined`] };
				}
			}
		}
		return { lines: [] };
	}
	return { lines: [
		`Python 3.12.1 (main, Dec  7 2023, 20:45:44) [Clang 15.0.0 (clang-1500.1.0.2.5)] on darwin`,
		`Type "help", "copyright", "credits" or "license" for more information.`,
		colorize('(simulated - interactive mode not available)', 'dim'),
	] };
}

function cmd_node(args: string[], _state: TerminalState): CommandResult {
	if (args.includes('--version') || args.includes('-v')) {
		return { lines: ['v21.5.0'] };
	}
	if (args.includes('-e') && args.length > 1) {
		const code = args.slice(args.indexOf('-e') + 1).join(' ').replace(/^["']|["']$/g, '');
		if (code.includes('console.log')) {
			const match = code.match(/console\.log\(["'](.*)["']\)/);
			if (match) return { lines: [match[1]] };
			const expr_match = code.match(/console\.log\((.+)\)/);
			if (expr_match) {
				try {
					const result = eval(expr_match[1]);
					return { lines: [String(result)] };
				} catch {
					return { lines: [`ReferenceError: ${expr_match[1]} is not defined`] };
				}
			}
		}
		return { lines: [] };
	}
	return { lines: [
		'Welcome to Node.js v21.5.0.',
		'Type ".help" for more information.',
		colorize('(simulated - interactive mode not available)', 'dim'),
	] };
}

function cmd_brew(args: string[], _state: TerminalState): CommandResult {
	if (args.length === 0 || args[0] === '--version') {
		return { lines: ['Homebrew 4.2.4'] };
	}
	if (args[0] === 'install') {
		if (args.length < 2) return { lines: ['Error: This command requires a formula argument.'] };
		const pkg = args[1];
		return { lines: [
			colorize(`==>`, 'blue') + colorize(` Downloading ${pkg}...`, 'bold'),
			colorize(`==>`, 'blue') + colorize(` Installing ${pkg}`, 'bold'),
			colorize(`==>`, 'blue') + ` Pouring ${pkg}--1.0.0.arm64_sonoma.bottle.tar.gz`,
			colorize(`\u{1f37a}`, 'green') + `  /usr/local/Cellar/${pkg}/1.0.0: 42 files, 2.1MB`,
		] };
	}
	if (args[0] === 'list') {
		return { lines: ['git', 'node', 'python@3.12', 'wget', 'tree', 'jq', 'ripgrep'] };
	}
	if (args[0] === 'update') {
		return { lines: [
			colorize('==> Updating Homebrew...', 'blue'),
			'Already up-to-date.',
		] };
	}
	return { lines: [`Error: Unknown command: ${args[0]}`] };
}

function cmd_git(args: string[], state: TerminalState): CommandResult {
	if (args.length === 0 || args[0] === '--version') {
		return { lines: ['git version 2.43.0'] };
	}
	if (args[0] === 'status') {
		return { lines: [
			'On branch main',
			'Your branch is up to date with \'origin/main\'.',
			'',
			'nothing to commit, working tree clean',
		] };
	}
	if (args[0] === 'log' || args[0] === 'log --oneline') {
		return { lines: [
			colorize('a1b2c3d', 'yellow') + ' (HEAD -> main, origin/main) Initial commit',
			colorize('e4f5g6h', 'yellow') + ' Add project structure',
			colorize('i7j8k9l', 'yellow') + ' Update README',
		] };
	}
	if (args[0] === 'branch') {
		return { lines: [
			'* ' + colorize('main', 'green'),
			'  develop',
			'  feature/new-ui',
		] };
	}
	return { lines: [`git: '${args[0]}' is not a git command. See 'git --help'.`] };
}

function cmd_ssh(_args: string[], _state: TerminalState): CommandResult {
	return { lines: [
		'usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B bind_interface]',
		'           [-b bind_address] [-c cipher_spec] [-D [bind_address:]port]',
		'           [-E log_file] [-e escape_char] [-F configfile] [-I pkcs11]',
		'           [-i identity_file] [-J [user@]host[:port]] [-L address]',
		'           [-l login_name] [-m mac_spec] [-O ctl_cmd] [-o option] [-p port]',
		'           [-Q query_option] [-R address] [-S ctl_path] [-W host:port]',
		'           [-w local_tun[:remote_tun]] destination [command [argument ...]]',
	] };
}

function cmd_neofetch(_args: string[], _state: TerminalState): CommandResult {
	return { lines: [
		'                    \'c.          ' + colorize('user', 'green') + '@' + colorize('macbook', 'green'),
		'                 ,xNMM.          -----------',
		'               .OMMMMo           ' + colorize('OS:', 'bold') + ' macOS Sonoma 14.2.1 arm64',
		'               OMMM0,            ' + colorize('Host:', 'bold') + ' MacBook Pro (Apple M1 Pro)',
		'     .;loddo:\' loolloddol;.     ' + colorize('Kernel:', 'bold') + ' 23.2.0',
		'   cKMMMMMMMMMMNWMMMMMMMMMM0:    ' + colorize('Uptime:', 'bold') + ' 3 days, 14 hours',
		'  .KMMMMMMMMMMMMMMMMMMMMMMMWd.   ' + colorize('Packages:', 'bold') + ' 127 (brew)',
		'  XMMMMMMMMMMMMMMMMMMMMMMMX.     ' + colorize('Shell:', 'bold') + ' zsh 5.9',
		' ;MMMMMMMMMMMMMMMMMMMMMMMM:      ' + colorize('Resolution:', 'bold') + ' 3456x2234',
		' :MMMMMMMMMMMMMMMMMMMMMMMM:      ' + colorize('DE:', 'bold') + ' Aqua',
		' .MMMMMMMMMMMMMMMMMMMMMMMMX.     ' + colorize('WM:', 'bold') + ' Quartz Compositor',
		'  kMMMMMMMMMMMMMMMMMMMMMMMMWd.    ' + colorize('Terminal:', 'bold') + ' macOS-web',
		'  .XMMMMMMMMMMMMMMMMMMMMMMMMk    ' + colorize('CPU:', 'bold') + ' Apple M1 Pro (10) @ 3.22GHz',
		'   .XMMMMMMMMMMMMMMMMMMMMK.      ' + colorize('GPU:', 'bold') + ' Apple M1 Pro',
		'     kMMMMMMMMMMMMMMMMMMd         ' + colorize('Memory:', 'bold') + ' 8192MiB / 16384MiB',
		'      ;KMMMMMMMWXXWMMMKl.        ',
		'        .cooc,.    .,coo:.        ',
		'',
	] };
}

function cmd_tree(args: string[], state: TerminalState): CommandResult {
	const target = args.find(a => !a.startsWith('-')) || '.';
	const path = target === '.' ? state.cwd : target;
	const { node } = resolve_path(state.fs_root, state.cwd, path);

	if (!node || node.type !== 'dir' || !node.children) {
		return { lines: [`${path} [error opening dir]`] };
	}

	const lines: string[] = [colorize(target === '.' ? '.' : node.name, 'blue')];
	const entries = Array.from(node.children.values())
		.filter(e => !e.name.startsWith('.'))
		.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

	let dir_count = 0, file_count = 0;

	entries.forEach((entry, i) => {
		const is_last = i === entries.length - 1;
		const prefix = is_last ? '\u2514\u2500\u2500 ' : '\u251c\u2500\u2500 ';
		if (entry.type === 'dir') {
			dir_count++;
			lines.push(prefix + colorize(entry.name, 'blue'));
		} else {
			file_count++;
			lines.push(prefix + entry.name);
		}
	});

	lines.push('');
	lines.push(`${dir_count} directories, ${file_count} files`);
	return { lines };
}

function cmd_env(_args: string[], state: TerminalState): CommandResult {
	const env_vars: Record<string, string> = {
		HOME: '/Users/user',
		USER: 'user',
		SHELL: '/bin/zsh',
		PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
		TERM: 'xterm-256color',
		LANG: 'en_US.UTF-8',
		EDITOR: 'vim',
		PWD: state.cwd,
		LOGNAME: 'user',
		TMPDIR: '/var/folders/xx/tmp/',
		...state.env,
	};

	return { lines: Object.entries(env_vars).map(([k, v]) => `${k}=${v}`) };
}

function cmd_export(args: string[], state: TerminalState): CommandResult {
	if (args.length === 0) return cmd_env([], state);

	for (const arg of args) {
		const eq = arg.indexOf('=');
		if (eq > 0) {
			const key = arg.slice(0, eq);
			const value = arg.slice(eq + 1).replace(/^["']|["']$/g, '');
			state.env[key] = value;
		}
	}
	return { lines: [] };
}

function cmd_alias(_args: string[], _state: TerminalState): CommandResult {
	return { lines: [
		'alias ll=\'ls -la\'',
		'alias gs=\'git status\'',
		'alias gp=\'git push\'',
		'alias ..=\'cd ..\'',
		'alias ...=\'cd ../..\'',
	] };
}

function cmd_du(args: string[], state: TerminalState): CommandResult {
	const human = args.includes('-h') || args.includes('-sh');
	const summary = args.includes('-s') || args.includes('-sh');
	const target = args.find(a => !a.startsWith('-')) || '.';
	const { node } = resolve_path(state.fs_root, state.cwd, target);

	if (!node) return { lines: [`du: ${target}: No such file or directory`] };

	const size = node.size || 4096;
	const display = human ? format_size(size) : String(Math.ceil(size / 512));
	return { lines: [`${display.padStart(6)}\t${target === '.' ? '.' : node.name}`] };
}

function cmd_df(_args: string[], _state: TerminalState): CommandResult {
	return { lines: [
		'Filesystem     512-blocks      Used Available Capacity  Mounted on',
		'/dev/disk3s1   965595304 186453280 762735192    20%    /',
		'devfs                399       399         0   100%    /dev',
		'/dev/disk3s6   965595304    131128 762735192     1%    /System/Volumes/VM',
		'/dev/disk3s4   965595304  12845032 762735192     2%    /System/Volumes/Preboot',
		'map auto_home          0         0         0   100%    /System/Volumes/Data/home',
	] };
}

function cmd_ping(args: string[], _state: TerminalState): CommandResult {
	const host = args.find(a => !a.startsWith('-')) || '';
	if (!host) return { lines: ['usage: ping [-AaDdfnoQqRrv] [-c count] [-G sweepmaxsize] host'] };

	const lines: string[] = [];
	lines.push(`PING ${host} (93.184.216.34): 56 data bytes`);
	for (let i = 0; i < 4; i++) {
		const time = (Math.random() * 30 + 10).toFixed(3);
		lines.push(`64 bytes from 93.184.216.34: icmp_seq=${i} ttl=56 time=${time} ms`);
	}
	lines.push('');
	lines.push(`--- ${host} ping statistics ---`);
	lines.push('4 packets transmitted, 4 packets received, 0.0% packet loss');
	lines.push('round-trip min/avg/max/stddev = 10.123/20.456/30.789/5.432 ms');
	return { lines };
}

function cmd_ifconfig(_args: string[], _state: TerminalState): CommandResult {
	return { lines: [
		colorize('en0:', 'bold') + ' flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500',
		'\tinet 192.168.1.42 netmask 0xffffff00 broadcast 192.168.1.255',
		'\tether a4:83:e7:12:34:56',
		'\tnd6 options=201<PERFORMNUD,DAD>',
		'\tmedia: autoselect',
		'\tstatus: active',
		'',
		colorize('lo0:', 'bold') + ' flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> mtu 16384',
		'\tinet 127.0.0.1 netmask 0xff000000',
		'\tinet6 ::1 prefixlen 128',
		'\tinet6 fe80::1%lo0 prefixlen 64 scopeid 0x1',
	] };
}

function cmd_cp(args: string[], state: TerminalState): CommandResult {
	const non_flag = args.filter(a => !a.startsWith('-'));
	if (non_flag.length < 2) return { lines: ['usage: cp [-R [-H | -L | -P]] [-fi | -n] [-aclpSsvXx] source_file target_file'] };

	const src_path = non_flag[0];
	const dst_path = non_flag[1];
	const { node: src } = resolve_path(state.fs_root, state.cwd, src_path);
	if (!src) return { lines: [`cp: ${src_path}: No such file or directory`] };
	if (src.type === 'dir') return { lines: [`cp: ${src_path}: is a directory (not copied)`] };

	const dst_abs = resolve_path(state.fs_root, state.cwd, dst_path).absolute_path;
	const { parent } = get_parent_dir(state.fs_root, dst_abs);
	if (!parent || !parent.children) return { lines: [`cp: ${dst_path}: No such file or directory`] };

	const name = dst_abs.split('/').filter(Boolean).pop()!;
	parent.children.set(name, { ...src, name });
	return { lines: [] };
}

function cmd_mv(args: string[], state: TerminalState): CommandResult {
	const non_flag = args.filter(a => !a.startsWith('-'));
	if (non_flag.length < 2) return { lines: ['usage: mv [-f | -i | -n] [-hv] source target'] };

	const src_path = non_flag[0];
	const dst_path = non_flag[1];
	const src_abs = resolve_path(state.fs_root, state.cwd, src_path).absolute_path;
	const { node: src } = resolve_path(state.fs_root, state.cwd, src_path);
	if (!src) return { lines: [`mv: ${src_path}: No such file or directory`] };

	const dst_abs = resolve_path(state.fs_root, state.cwd, dst_path).absolute_path;
	const { parent: dst_parent } = get_parent_dir(state.fs_root, dst_abs);
	if (!dst_parent || !dst_parent.children) return { lines: [`mv: rename ${src_path} to ${dst_path}: No such file or directory`] };

	const { parent: src_parent } = get_parent_dir(state.fs_root, src_abs);
	if (src_parent && src_parent.children) {
		src_parent.children.delete(src.name);
	}

	const name = dst_abs.split('/').filter(Boolean).pop()!;
	dst_parent.children.set(name, { ...src, name });
	return { lines: [] };
}

function cmd_chmod(args: string[], state: TerminalState): CommandResult {
	if (args.length < 2) return { lines: ['usage: chmod [-fhv] [-R [-H | -L | -P]] mode file ...'] };
	const file_args = args.slice(1);
	for (const fp of file_args) {
		const { node } = resolve_path(state.fs_root, state.cwd, fp);
		if (!node) return { lines: [`chmod: ${fp}: No such file or directory`] };
	}
	return { lines: [] };
}

function cmd_help(_args: string[], _state: TerminalState): CommandResult {
	const cmds = [
		['ls', 'List directory contents'],
		['cd', 'Change directory'],
		['pwd', 'Print working directory'],
		['cat', 'Display file contents'],
		['echo', 'Display a line of text'],
		['grep', 'Search file contents'],
		['mkdir', 'Create directories'],
		['touch', 'Create files / update timestamps'],
		['rm', 'Remove files or directories'],
		['cp', 'Copy files'],
		['mv', 'Move/rename files'],
		['head', 'Display first lines of a file'],
		['tail', 'Display last lines of a file'],
		['wc', 'Word, line, character count'],
		['tree', 'Display directory tree'],
		['clear', 'Clear terminal screen'],
		['history', 'Show command history'],
		['man', 'Display manual pages'],
		['top', 'Display running processes'],
		['date', 'Show current date/time'],
		['uptime', 'Show system uptime'],
		['whoami', 'Print current user'],
		['hostname', 'Print hostname'],
		['uname', 'Print system information'],
		['which', 'Locate a command'],
		['env', 'Print environment variables'],
		['export', 'Set environment variables'],
		['alias', 'Show command aliases'],
		['curl', 'Transfer data from URL'],
		['ping', 'Test network connectivity'],
		['ifconfig', 'Network interface info'],
		['git', 'Version control system'],
		['python3', 'Python interpreter'],
		['node', 'Node.js runtime'],
		['brew', 'Homebrew package manager'],
		['neofetch', 'System information'],
		['df', 'Disk space usage'],
		['du', 'Directory space usage'],
		['ssh', 'Secure shell client'],
		['chmod', 'Change file permissions'],
	];

	const lines = [
		colorize('Available Commands:', 'bold'),
		'',
	];

	for (const [cmd, desc] of cmds) {
		lines.push(`  ${colorize(cmd.padEnd(12), 'cyan')} ${desc}`);
	}

	lines.push('');
	lines.push(colorize('Use "man <command>" for more details on a specific command.', 'dim'));
	return { lines };
}

export const COMMANDS: Record<string, CommandFn> = {
	ls: cmd_ls,
	cd: cmd_cd,
	pwd: cmd_pwd,
	cat: cmd_cat,
	echo: cmd_echo,
	printf: cmd_printf,
	mkdir: cmd_mkdir,
	touch: cmd_touch,
	rm: cmd_rm,
	grep: cmd_grep,
	clear: cmd_clear,
	history: cmd_history,
	whoami: cmd_whoami,
	hostname: cmd_hostname,
	uname: cmd_uname,
	date: cmd_date,
	uptime: cmd_uptime,
	which: cmd_which,
	head: cmd_head,
	tail: cmd_tail,
	wc: cmd_wc,
	man: cmd_man,
	top: cmd_top,
	curl: cmd_curl,
	python3: cmd_python3,
	python: cmd_python3,
	node: cmd_node,
	brew: cmd_brew,
	git: cmd_git,
	ssh: cmd_ssh,
	neofetch: cmd_neofetch,
	tree: cmd_tree,
	env: cmd_env,
	export: cmd_export,
	alias: cmd_alias,
	du: cmd_du,
	df: cmd_df,
	ping: cmd_ping,
	ifconfig: cmd_ifconfig,
	cp: cmd_cp,
	mv: cmd_mv,
	chmod: cmd_chmod,
	help: cmd_help,
};

// Tab completion helpers
export function get_completions(
	partial: string,
	state: TerminalState,
): string[] {
	const parts = partial.split(/\s+/);

	// Completing a command name
	if (parts.length <= 1) {
		const prefix = parts[0] || '';
		return Object.keys(COMMANDS)
			.filter(c => c.startsWith(prefix))
			.sort();
	}

	// Completing a file/directory path argument
	const last_part = parts[parts.length - 1];
	return get_path_completions(last_part, state);
}

export function get_path_completions(partial: string, state: TerminalState): string[] {
	let dir_path: string;
	let prefix: string;

	if (partial.includes('/')) {
		const last_slash = partial.lastIndexOf('/');
		dir_path = partial.slice(0, last_slash + 1) || '/';
		prefix = partial.slice(last_slash + 1);
	} else {
		dir_path = '.';
		prefix = partial;
	}

	const target = dir_path === '.' ? state.cwd : dir_path;
	const { node } = resolve_path(state.fs_root, state.cwd, target);

	if (!node || node.type !== 'dir' || !node.children) {
		return [];
	}

	const matches: string[] = [];
	for (const [name, child] of node.children) {
		if (name.startsWith(prefix)) {
			const completion = dir_path === '.' ? name : dir_path + name;
			matches.push(child.type === 'dir' ? completion + '/' : completion);
		}
	}

	return matches.sort();
}

// Parse a command line into command and arguments
export function parse_command_line(input: string): { cmd: string; args: string[] } {
	const trimmed = input.trim();
	if (!trimmed) return { cmd: '', args: [] };

	// Simple tokenizer that handles quotes
	const tokens: string[] = [];
	let current = '';
	let in_single = false;
	let in_double = false;

	for (let i = 0; i < trimmed.length; i++) {
		const ch = trimmed[i];
		if (ch === "'" && !in_double) {
			in_single = !in_single;
		} else if (ch === '"' && !in_single) {
			in_double = !in_double;
		} else if (ch === ' ' && !in_single && !in_double) {
			if (current) {
				tokens.push(current);
				current = '';
			}
		} else {
			current += ch;
		}
	}
	if (current) tokens.push(current);

	return { cmd: tokens[0] || '', args: tokens.slice(1) };
}
