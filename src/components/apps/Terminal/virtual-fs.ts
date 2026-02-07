// Virtual filesystem for the Terminal app

export interface FSNode {
	type: 'file' | 'dir' | 'symlink';
	name: string;
	permissions: string;
	owner: string;
	group: string;
	size: number;
	modified: Date;
	content?: string; // for files
	target?: string; // for symlinks
	children?: Map<string, FSNode>; // for directories
}

function dir(
	name: string,
	children: Map<string, FSNode> = new Map(),
	modified?: Date,
): FSNode {
	return {
		type: 'dir',
		name,
		permissions: 'drwxr-xr-x',
		owner: 'user',
		group: 'staff',
		size: 64,
		modified: modified ?? new Date(2024, 11, 15, 10, 30),
		children,
	};
}

function file(
	name: string,
	content: string = '',
	size?: number,
	modified?: Date,
	permissions?: string,
): FSNode {
	return {
		type: 'file',
		name,
		permissions: permissions ?? '-rw-r--r--',
		owner: 'user',
		group: 'staff',
		size: size ?? content.length,
		modified: modified ?? new Date(2024, 11, 15, 10, 30),
		content,
	};
}

function executable(name: string, content: string = '', size?: number): FSNode {
	return file(name, content, size ?? 128, new Date(2024, 8, 20), '-rwxr-xr-x');
}

function symlink(name: string, target: string): FSNode {
	return {
		type: 'symlink',
		name,
		permissions: 'lrwxr-xr-x',
		owner: 'root',
		group: 'wheel',
		size: target.length,
		modified: new Date(2024, 8, 20),
		target,
	};
}

export function create_default_fs(): Map<string, FSNode> {
	const root = new Map<string, FSNode>();

	// /Users/user (home)
	const desktop = dir('Desktop', new Map([
		['Screenshot 2024-12-01.png', file('Screenshot 2024-12-01.png', '', 245830, new Date(2024, 11, 1, 14, 22))],
		['notes.txt', file('notes.txt', 'Remember to finish the project\nCall dentist tomorrow\nBuy groceries:\n- Milk\n- Eggs\n- Bread\n', 89, new Date(2024, 11, 14))],
		['project-proposal.pdf', file('project-proposal.pdf', '', 1048576, new Date(2024, 11, 10))],
	]), new Date(2024, 11, 14));

	const documents = dir('Documents', new Map([
		['resume.pdf', file('resume.pdf', '', 524288, new Date(2024, 10, 5))],
		['budget.xlsx', file('budget.xlsx', '', 35840, new Date(2024, 11, 1))],
		['work', dir('work', new Map([
			['meeting-notes.md', file('meeting-notes.md', '# Meeting Notes\n\n## Q4 Planning\n- Review roadmap\n- Assign tasks\n- Set deadlines\n\n## Action Items\n1. Update documentation\n2. Fix CI pipeline\n3. Deploy staging\n', 198, new Date(2024, 11, 12))],
			['report.txt', file('report.txt', 'Quarterly Report Q4 2024\n========================\n\nRevenue: $1.2M\nExpenses: $800K\nProfit: $400K\n\nKey highlights:\n- Launched new product line\n- Expanded to 3 new markets\n- Hired 12 new team members\n', 256, new Date(2024, 11, 13))],
		]), new Date(2024, 11, 13))],
		['personal', dir('personal', new Map([
			['journal.txt', file('journal.txt', 'Today was a good day.\nFinished the terminal simulator project.\n', 62)],
		]))],
	]), new Date(2024, 11, 13));

	const downloads = dir('Downloads', new Map([
		['installer.dmg', file('installer.dmg', '', 52428800, new Date(2024, 11, 14))],
		['photo.jpg', file('photo.jpg', '', 2097152, new Date(2024, 11, 13))],
		['archive.zip', file('archive.zip', '', 10485760, new Date(2024, 11, 12))],
		['README.md', file('README.md', '# My Project\n\nThis is a sample project README.\n\n## Installation\n\n```bash\nnpm install\nnpm start\n```\n\n## Usage\n\nRun the development server and open localhost:3000.\n', 172, new Date(2024, 11, 11))],
	]), new Date(2024, 11, 14));

	const pictures = dir('Pictures', new Map([
		['vacation', dir('vacation', new Map([
			['beach.jpg', file('beach.jpg', '', 3145728, new Date(2024, 7, 15))],
			['sunset.jpg', file('sunset.jpg', '', 4194304, new Date(2024, 7, 15))],
		]), new Date(2024, 7, 15))],
		['screenshots', dir('screenshots', new Map(), new Date(2024, 11, 1))],
	]), new Date(2024, 11, 1));

	const movies = dir('Movies', new Map(), new Date(2024, 6, 1));

	const music_dir = dir('Music', new Map([
		['playlist.m3u', file('playlist.m3u', '', 1024, new Date(2024, 10, 20))],
	]), new Date(2024, 10, 20));

	const library = dir('Library', new Map([
		['Preferences', dir('Preferences', new Map(), new Date(2024, 11, 14))],
		['Caches', dir('Caches', new Map(), new Date(2024, 11, 14))],
		['Application Support', dir('Application Support', new Map(), new Date(2024, 11, 14))],
	]), new Date(2024, 11, 14));

	const public_dir = dir('Public', new Map([
		['Drop Box', dir('Drop Box', new Map())],
	]));

	const dotfiles = new Map<string, FSNode>([
		['.zshrc', file('.zshrc', '# ~/.zshrc\nexport PATH="/usr/local/bin:$PATH"\nexport EDITOR="vim"\n\nalias ll="ls -la"\nalias gs="git status"\nalias gp="git push"\n\n# Load completions\nautoload -Uz compinit && compinit\n', 198, new Date(2024, 11, 1))],
		['.zsh_history', file('.zsh_history', 'ls\ncd Documents\ncat readme.md\ngit status\nnpm install\npython3 --version\n', 96, new Date(2024, 11, 14))],
		['.gitconfig', file('.gitconfig', '[user]\n\tname = User\n\temail = user@example.com\n[core]\n\teditor = vim\n[alias]\n\tst = status\n\tco = checkout\n\tbr = branch\n', 142, new Date(2024, 10, 1))],
		['.vimrc', file('.vimrc', 'set number\nset relativenumber\nset tabstop=4\nset shiftwidth=4\nset expandtab\nsyntax on\n', 85, new Date(2024, 9, 15))],
		['.ssh', dir('.ssh', new Map([
			['known_hosts', file('known_hosts', 'github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl\n', 98, new Date(2024, 10, 1))],
			['config', file('config', 'Host github.com\n  HostName github.com\n  User git\n  IdentityFile ~/.ssh/id_ed25519\n', 89, new Date(2024, 10, 1))],
		]), new Date(2024, 10, 1))],
	]);

	const home_children = new Map<string, FSNode>([
		['Desktop', desktop],
		['Documents', documents],
		['Downloads', downloads],
		['Pictures', pictures],
		['Movies', movies],
		['Music', music_dir],
		['Library', library],
		['Public', public_dir],
		...dotfiles,
	]);

	const home = dir('user', home_children, new Date(2024, 11, 14));

	const users = dir('Users', new Map([
		['user', home],
		['Shared', dir('Shared', new Map())],
	]));

	// /Applications
	const applications = dir('Applications', new Map([
		['Safari.app', dir('Safari.app', new Map(), new Date(2024, 8, 20))],
		['Terminal.app', dir('Terminal.app', new Map(), new Date(2024, 8, 20))],
		['Finder.app', dir('Finder.app', new Map(), new Date(2024, 8, 20))],
		['Calculator.app', dir('Calculator.app', new Map(), new Date(2024, 8, 20))],
		['Notes.app', dir('Notes.app', new Map(), new Date(2024, 8, 20))],
		['Messages.app', dir('Messages.app', new Map(), new Date(2024, 8, 20))],
		['Mail.app', dir('Mail.app', new Map(), new Date(2024, 8, 20))],
		['Photos.app', dir('Photos.app', new Map(), new Date(2024, 8, 20))],
		['Music.app', dir('Music.app', new Map(), new Date(2024, 8, 20))],
		['Maps.app', dir('Maps.app', new Map(), new Date(2024, 8, 20))],
		['Calendar.app', dir('Calendar.app', new Map(), new Date(2024, 8, 20))],
		['System Preferences.app', dir('System Preferences.app', new Map(), new Date(2024, 8, 20))],
		['Xcode.app', dir('Xcode.app', new Map(), new Date(2024, 8, 20))],
		['Visual Studio Code.app', dir('Visual Studio Code.app', new Map(), new Date(2024, 8, 20))],
		['iTerm.app', dir('iTerm.app', new Map(), new Date(2024, 8, 20))],
	]), new Date(2024, 8, 20));

	// /usr
	const usr_bin = dir('bin', new Map([
		['ls', executable('ls')],
		['cd', executable('cd')],
		['cat', executable('cat')],
		['grep', executable('grep')],
		['find', executable('find')],
		['sort', executable('sort')],
		['uniq', executable('uniq')],
		['wc', executable('wc')],
		['head', executable('head')],
		['tail', executable('tail')],
		['sed', executable('sed')],
		['awk', executable('awk')],
		['curl', executable('curl')],
		['python3', symlink('python3', '../Cellar/python@3.12/bin/python3')],
		['node', executable('node')],
		['npm', executable('npm')],
		['git', executable('git')],
		['vim', executable('vim')],
		['ssh', executable('ssh')],
		['man', executable('man')],
	]));

	const usr_local = dir('local', new Map([
		['bin', dir('bin', new Map([
			['brew', executable('brew')],
		]))],
		['Cellar', dir('Cellar', new Map())],
	]));

	const usr = dir('usr', new Map([
		['bin', usr_bin],
		['local', usr_local],
		['lib', dir('lib', new Map())],
		['share', dir('share', new Map())],
	]));

	// /etc
	const etc = dir('etc', new Map([
		['hosts', file('hosts', '##\n# Host Database\n#\n# localhost is used to configure the loopback interface\n# when the system is booting.\n##\n127.0.0.1\tlocalhost\n255.255.255.255\tbroadcasthost\n::1\t\t\tlocalhost\n', 213, new Date(2024, 8, 20), '-rw-r--r--')],
		['shells', file('shells', '/bin/bash\n/bin/csh\n/bin/dash\n/bin/ksh\n/bin/sh\n/bin/tcsh\n/bin/zsh\n', 58, new Date(2024, 8, 20))],
		['zshrc', file('zshrc', '# System-wide .zshrc\nif [ -x /usr/libexec/path_helper ]; then\n\teval `/usr/libexec/path_helper -s`\nfi\n', 86, new Date(2024, 8, 20))],
	]), new Date(2024, 8, 20));

	// /tmp
	const tmp = dir('tmp', new Map(), new Date(2024, 11, 15));

	// /var
	const var_dir = dir('var', new Map([
		['log', dir('log', new Map([
			['system.log', file('system.log', '', 1048576, new Date(2024, 11, 15))],
			['wifi.log', file('wifi.log', '', 524288, new Date(2024, 11, 15))],
		]), new Date(2024, 11, 15))],
		['tmp', dir('tmp', new Map())],
	]));

	// /bin
	const bin = dir('bin', new Map([
		['bash', executable('bash', '', 1326576)],
		['zsh', executable('zsh', '', 1377648)],
		['sh', executable('sh', '', 134736)],
		['ls', executable('ls', '', 56624)],
		['cp', executable('cp', '', 36016)],
		['mv', executable('mv', '', 36016)],
		['rm', executable('rm', '', 35504)],
		['mkdir', executable('mkdir', '', 35456)],
		['cat', executable('cat', '', 35280)],
		['echo', executable('echo', '', 35024)],
	]));

	// /sbin
	const sbin = dir('sbin', new Map([
		['mount', executable('mount')],
		['fsck', executable('fsck')],
		['ifconfig', executable('ifconfig')],
	]));

	root.set('Users', users);
	root.set('Applications', applications);
	root.set('usr', usr);
	root.set('etc', etc);
	root.set('tmp', tmp);
	root.set('var', var_dir);
	root.set('bin', bin);
	root.set('sbin', sbin);
	root.set('System', dir('System', new Map([
		['Library', dir('Library', new Map())],
	])));
	root.set('Library', dir('Library', new Map([
		['WebServer', dir('WebServer', new Map())],
	])));
	root.set('Volumes', dir('Volumes', new Map([
		['Macintosh HD', dir('Macintosh HD', new Map())],
	])));
	root.set('dev', dir('dev', new Map()));
	root.set('private', dir('private', new Map()));
	root.set('cores', dir('cores', new Map()));
	root.set('opt', dir('opt', new Map()));

	return root;
}

export function resolve_path(
	root: Map<string, FSNode>,
	cwd: string,
	target: string,
): { node: FSNode | null; absolute_path: string } {
	let abs: string;

	if (target.startsWith('/')) {
		abs = target;
	} else if (target.startsWith('~')) {
		abs = '/Users/user' + target.slice(1);
	} else {
		abs = cwd === '/' ? '/' + target : cwd + '/' + target;
	}

	// Normalize path: resolve . and ..
	const parts = abs.split('/').filter(Boolean);
	const resolved: string[] = [];
	for (const part of parts) {
		if (part === '.') continue;
		if (part === '..') {
			resolved.pop();
		} else {
			resolved.push(part);
		}
	}

	abs = '/' + resolved.join('/');

	if (resolved.length === 0) {
		// Root directory - create a synthetic node
		return {
			node: {
				type: 'dir',
				name: '/',
				permissions: 'drwxr-xr-x',
				owner: 'root',
				group: 'wheel',
				size: 1024,
				modified: new Date(2024, 8, 20),
				children: root,
			},
			absolute_path: '/',
		};
	}

	let current: Map<string, FSNode> | undefined = root;
	let node: FSNode | null = null;

	for (let i = 0; i < resolved.length; i++) {
		const part = resolved[i];
		if (!current) return { node: null, absolute_path: abs };

		const found = current.get(part);
		if (!found) return { node: null, absolute_path: abs };

		if (i === resolved.length - 1) {
			node = found;
		} else {
			if (found.type !== 'dir') return { node: null, absolute_path: abs };
			current = found.children;
		}
	}

	return { node, absolute_path: abs };
}

export function get_parent_dir(
	root: Map<string, FSNode>,
	path: string,
): { parent: FSNode | null; parent_path: string } {
	const parts = path.split('/').filter(Boolean);
	if (parts.length === 0) {
		return { parent: null, parent_path: '/' };
	}
	const parent_path = '/' + parts.slice(0, -1).join('/') || '/';
	const result = resolve_path(root, '/', parent_path);
	return { parent: result.node, parent_path };
}

export function format_size(bytes: number): string {
	if (bytes === 0) return '0B';
	if (bytes < 1024) return `${bytes}B`;
	if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)}K`;
	if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)}M`;
	return `${(bytes / 1073741824).toFixed(1)}G`;
}

export function format_date_short(d: Date): string {
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const day = String(d.getDate()).padStart(2, ' ');
	const hours = String(d.getHours()).padStart(2, '0');
	const mins = String(d.getMinutes()).padStart(2, '0');
	return `${months[d.getMonth()]} ${day} ${hours}:${mins}`;
}

export function display_path(abs_path: string): string {
	if (abs_path.startsWith('/Users/user')) {
		return '~' + abs_path.slice(11);
	}
	return abs_path;
}
