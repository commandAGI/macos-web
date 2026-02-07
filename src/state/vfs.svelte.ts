// Shared reactive Virtual File System state for all apps (Terminal, Finder, etc.)
// Wraps the existing Terminal virtual-fs logic in Svelte 5 reactive state.

import type { FSNode } from '../components/apps/Terminal/virtual-fs';
import {
	create_default_fs,
	resolve_path,
	get_parent_dir,
	format_size,
	format_date_short,
	display_path,
} from '../components/apps/Terminal/virtual-fs';

export type { FSNode };
export { format_size, format_date_short, display_path };

// ---------------------------------------------------------------------------
// Internal helpers (mirrors the factory helpers in virtual-fs.ts)
// ---------------------------------------------------------------------------

function make_dir(
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
		modified: modified ?? new Date(),
		children,
	};
}

function make_file(
	name: string,
	content: string = '',
	size?: number,
	modified?: Date,
): FSNode {
	return {
		type: 'file',
		name,
		permissions: '-rw-r--r--',
		owner: 'user',
		group: 'staff',
		size: size ?? content.length,
		modified: modified ?? new Date(),
		content,
	};
}

// ---------------------------------------------------------------------------
// Merge Finder-specific data into the default VFS tree
// ---------------------------------------------------------------------------

function merge_finder_extras(root: Map<string, FSNode>): void {
	// Additional .app entries the Finder knows about but the Terminal VFS doesn't
	const apps_node = root.get('Applications');
	if (apps_node?.children) {
		const extra_apps: [string, Date][] = [
			['App Store.app', new Date(2024, 9, 1)],
			['FaceTime.app', new Date(2024, 9, 1)],
			['Photos.app', new Date(2024, 9, 1)],
			['TextEdit.app', new Date(2024, 9, 1)],
		];
		for (const [name, mod] of extra_apps) {
			if (!apps_node.children.has(name)) {
				apps_node.children.set(name, make_dir(name, new Map(), mod));
			}
		}
	}

	// Ensure ~/Desktop has extra Finder content
	const home = resolve_path(root, '/', '/Users/user').node;
	if (home?.children) {
		const desktop = home.children.get('Desktop');
		if (desktop?.children) {
			if (!desktop.children.has('Projects')) {
				desktop.children.set(
					'Projects',
					make_dir(
						'Projects',
						new Map([
							[
								'my-app',
								make_dir(
									'my-app',
									new Map([
										['src', make_dir('src', new Map(), new Date(2024, 0, 15))],
										['node_modules', make_dir('node_modules', new Map(), new Date(2024, 0, 14))],
										[
											'package.json',
											make_file(
												'package.json',
												'{\n  "name": "my-app",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  }\n}\n',
												undefined,
												new Date(2024, 0, 15),
											),
										],
										[
											'tsconfig.json',
											make_file(
												'tsconfig.json',
												'{\n  "compilerOptions": {\n    "target": "ES2020",\n    "module": "ESNext"\n  }\n}\n',
												undefined,
												new Date(2024, 0, 10),
											),
										],
										[
											'.gitignore',
											make_file('.gitignore', 'node_modules\ndist\n.env\n', undefined, new Date(2024, 0, 10)),
										],
									]),
									new Date(2024, 0, 15),
								),
							],
							['website-redesign', make_dir('website-redesign', new Map(), new Date(2024, 0, 12))],
							[
								'README.md',
								make_file(
									'README.md',
									'# Projects\n\nWorkspace for development projects.\n',
									undefined,
									new Date(2024, 0, 15),
								),
							],
						]),
						new Date(2024, 0, 15),
					),
				);
			}
			if (!desktop.children.has('Project Notes.txt')) {
				desktop.children.set(
					'Project Notes.txt',
					make_file(
						'Project Notes.txt',
						'Project planning notes for Q1.\nReview design specs.\nSchedule kickoff meeting.\n',
						undefined,
						new Date(2024, 0, 14),
					),
				);
			}
			if (!desktop.children.has('report-final.pdf')) {
				desktop.children.set(
					'report-final.pdf',
					make_file('report-final.pdf', '', 1887436, new Date(2024, 0, 12)),
				);
			}
			if (!desktop.children.has('design-mockup.sketch')) {
				desktop.children.set(
					'design-mockup.sketch',
					make_file('design-mockup.sketch', '', 35651584, new Date(2024, 0, 11)),
				);
			}
			if (!desktop.children.has('todo.md')) {
				desktop.children.set(
					'todo.md',
					make_file(
						'todo.md',
						'# TODO\n\n- [ ] Finish homepage design\n- [ ] Write unit tests\n- [x] Set up CI pipeline\n',
						undefined,
						new Date(2024, 0, 10),
					),
				);
			}
		}

		// Ensure ~/Documents has extra Finder content
		const documents = home.children.get('Documents');
		if (documents?.children) {
			if (!documents.children.has('Contracts')) {
				documents.children.set(
					'Contracts',
					make_dir(
						'Contracts',
						new Map([
							['NDA-2024.pdf', make_file('NDA-2024.pdf', '', 159744, new Date(2023, 11, 20))],
							[
								'Employment Agreement.pdf',
								make_file('Employment Agreement.pdf', '', 430080, new Date(2023, 10, 15)),
							],
						]),
						new Date(2023, 11, 20),
					),
				);
			}
			if (!documents.children.has('Tax Returns 2023.pdf')) {
				documents.children.set(
					'Tax Returns 2023.pdf',
					make_file('Tax Returns 2023.pdf', '', 2202009, new Date(2023, 11, 15)),
				);
			}
			// Finder calls the subdirectory "Work" (capitalized), VFS has "work" (lowercase).
			// Add Work as an alias if it doesn't exist.
			if (!documents.children.has('Work') && documents.children.has('work')) {
				// Already present as lowercase -- leave as-is; Finder will find it.
			} else if (!documents.children.has('Work') && !documents.children.has('work')) {
				documents.children.set(
					'Work',
					make_dir(
						'Work',
						new Map([
							['Q1 Report.pdf', make_file('Q1 Report.pdf', '', 3355443, new Date(2024, 0, 14))],
							[
								'Presentation.key',
								make_file('Presentation.key', '', 18874368, new Date(2024, 0, 12)),
							],
							[
								'Sprint Planning.docx',
								make_file('Sprint Planning.docx', '', 32768, new Date(2024, 0, 10)),
							],
						]),
						new Date(2024, 0, 14),
					),
				);
			}
			// Ensure Personal subdirectory has Recipes folder
			const personal = documents.children.get('personal') ?? documents.children.get('Personal');
			if (personal?.children && !personal.children.has('Recipes')) {
				personal.children.set(
					'Recipes',
					make_dir('Recipes', new Map(), new Date(2023, 11, 28)),
				);
			}
		}

		// Ensure ~/Downloads has extra Finder content
		const downloads = home.children.get('Downloads');
		if (downloads?.children) {
			const extras: [string, FSNode][] = [
				[
					'node-v20.10.0.pkg',
					make_file('node-v20.10.0.pkg', '', 47395635, new Date(2024, 0, 15)),
				],
				[
					'Visual Studio Code.dmg',
					make_file('Visual Studio Code.dmg', '', 207618048, new Date(2024, 0, 14)),
				],
				[
					'photo-album.zip',
					make_file('photo-album.zip', '', 241172480, new Date(2024, 0, 13)),
				],
				[
					'Slack-4.35.dmg',
					make_file('Slack-4.35.dmg', '', 173015040, new Date(2024, 0, 8)),
				],
				[
					'invoice-december.pdf',
					make_file('invoice-december.pdf', '', 91136, new Date(2024, 0, 5)),
				],
				[
					'vacation-photo.jpg',
					make_file('vacation-photo.jpg', '', 4404019, new Date(2024, 0, 3)),
				],
			];
			for (const [name, node] of extras) {
				if (!downloads.children.has(name)) {
					downloads.children.set(name, node);
				}
			}
		}

		// Ensure ~/Movies has content
		const movies = home.children.get('Movies');
		if (movies?.children && movies.children.size === 0) {
			movies.children.set(
				'vacation-2023.mov',
				make_file('vacation-2023.mov', '', 1288490188, new Date(2023, 11, 20)),
			);
		}

		// Ensure ~/Music has content
		const music = home.children.get('Music');
		if (music?.children) {
			if (!music.children.has('Music Library.musiclibrary')) {
				music.children.set(
					'Music Library.musiclibrary',
					make_file('Music Library.musiclibrary', '', 3650722201, new Date(2023, 10, 10)),
				);
			}
		}

		// Ensure ~/Pictures has extra content
		const pictures = home.children.get('Pictures');
		if (pictures?.children) {
			if (!pictures.children.has('Photos Library.photoslibrary')) {
				pictures.children.set(
					'Photos Library.photoslibrary',
					make_file('Photos Library.photoslibrary', '', 30064771072, new Date(2024, 0, 12)),
				);
			}
			if (!pictures.children.has('Wallpapers')) {
				pictures.children.set(
					'Wallpapers',
					make_dir(
						'Wallpapers',
						new Map([
							['monterey.jpg', make_file('monterey.jpg', '', 5242880, new Date(2023, 11, 5))],
							['sequoia.png', make_file('sequoia.png', '', 8388608, new Date(2023, 11, 5))],
							['ventura.jpg', make_file('ventura.jpg', '', 6291456, new Date(2023, 10, 20))],
						]),
						new Date(2023, 11, 5),
					),
				);
			}
			// Add sample photos directly in ~/Pictures
			const picture_extras: [string, number, Date][] = [
				['family-dinner.jpg', 4718592, new Date(2024, 0, 15)],
				['golden-gate.png', 6815744, new Date(2024, 0, 14)],
				['birthday-party.jpg', 3932160, new Date(2024, 0, 12)],
				['garden-flowers.jpeg', 2621440, new Date(2024, 0, 10)],
				['morning-coffee.jpg', 1572864, new Date(2024, 0, 8)],
				['city-skyline.png', 7340032, new Date(2024, 0, 5)],
				['hiking-trail.jpg', 5505024, new Date(2023, 11, 28)],
				['snow-mountains.webp', 4194304, new Date(2023, 11, 25)],
				['autumn-leaves.jpg', 3407872, new Date(2023, 10, 15)],
				['cat-sleeping.gif', 2097152, new Date(2023, 10, 10)],
				['concert-night.jpg', 4456448, new Date(2023, 9, 20)],
				['cooking-pasta.jpeg', 2883584, new Date(2023, 9, 5)],
				['lake-reflection.png', 8912896, new Date(2023, 8, 28)],
				['old-library.jpg', 5767168, new Date(2023, 8, 15)],
				['rainy-window.bmp', 11534336, new Date(2023, 7, 22)],
				['selfie-paris.jpg', 3145728, new Date(2023, 7, 10)],
			];
			for (const [name, size, mod] of picture_extras) {
				if (!pictures.children.has(name)) {
					pictures.children.set(name, make_file(name, '', size, mod));
				}
			}
			// Add photos into ~/Pictures/vacation
			const vacation = pictures.children.get('vacation');
			if (vacation?.children) {
				const vacation_extras: [string, number, Date][] = [
					['palm-trees.jpg', 4980736, new Date(2024, 7, 16)],
					['snorkeling.png', 6029312, new Date(2024, 7, 15)],
					['hotel-pool.jpeg', 3670016, new Date(2024, 7, 14)],
					['island-aerial.jpg', 7602176, new Date(2024, 7, 13)],
				];
				for (const [name, size, mod] of vacation_extras) {
					if (!vacation.children.has(name)) {
						vacation.children.set(name, make_file(name, '', size, mod));
					}
				}
			}
			// Add photos into ~/Pictures/screenshots
			const screenshots = pictures.children.get('screenshots');
			if (screenshots?.children) {
				const screenshot_extras: [string, number, Date][] = [
					['Screenshot 2024-01-15.png', 1048576, new Date(2024, 0, 15)],
					['Screenshot 2024-01-10.png', 921600, new Date(2024, 0, 10)],
					['Screenshot 2023-12-20.png', 786432, new Date(2023, 11, 20)],
				];
				for (const [name, size, mod] of screenshot_extras) {
					if (!screenshots.children.has(name)) {
						screenshots.children.set(name, make_file(name, '', size, mod));
					}
				}
			}
		}
	}
}

// ---------------------------------------------------------------------------
// Shared reactive VFS instance
// ---------------------------------------------------------------------------

function create_merged_fs(): Map<string, FSNode> {
	const root = create_default_fs();
	merge_finder_extras(root);
	return root;
}

export const vfs_root = $state(create_merged_fs());

/** Wrapper object so we never reassign the exported $state (Svelte 5 module constraint). */
const _vfs_ver = $state({ value: 0 });

/** Reactive version counter -- increment on every VFS mutation so watchers can re-derive. */
export const vfs_version = {
	get value() {
		return _vfs_ver.value;
	},
};

// ---------------------------------------------------------------------------
// Deep-clone a node (and all children for directories)
// ---------------------------------------------------------------------------

function deep_clone_node(node: FSNode, new_name?: string): FSNode {
	const cloned: FSNode = {
		...node,
		name: new_name ?? node.name,
		modified: new Date(node.modified.getTime()),
	};
	if (node.type === 'dir' && node.children) {
		const cloned_children = new Map<string, FSNode>();
		for (const [key, child] of node.children) {
			cloned_children.set(key, deep_clone_node(child));
		}
		cloned.children = cloned_children;
	}
	return cloned;
}

// ---------------------------------------------------------------------------
// Path utilities (internal)
// ---------------------------------------------------------------------------

/** Extract the basename from an absolute path. */
function basename(path: string): string {
	const parts = path.split('/').filter(Boolean);
	return parts[parts.length - 1] ?? '';
}

/** Normalize an absolute path (resolve . and .., remove trailing slash). */
function normalize(path: string): string {
	if (path === '/') return '/';
	const parts = path.split('/').filter(Boolean);
	const resolved: string[] = [];
	for (const part of parts) {
		if (part === '.') continue;
		if (part === '..') {
			resolved.pop();
		} else {
			resolved.push(part);
		}
	}
	return '/' + resolved.join('/');
}

// ---------------------------------------------------------------------------
// High-level API functions that mutate the shared tree
// ---------------------------------------------------------------------------

/** Resolve a path relative to `cwd`. Returns the node (or null) and the absolute path. */
export function resolve(
	cwd: string,
	path: string,
): { node: FSNode | null; absolute_path: string } {
	return resolve_path(vfs_root, cwd, path);
}

/** Read the content of a file at an absolute path. Returns null if not found or not a file. */
export function read_file(path: string): string | null {
	const { node } = resolve_path(vfs_root, '/', path);
	if (!node || node.type !== 'file') return null;
	return node.content ?? '';
}

/** Create or overwrite a file at `path` with `content`. Creates parent dirs if they exist. */
export function write_file(path: string, content: string): boolean {
	const abs = normalize(path);
	const name = basename(abs);
	if (!name) return false;

	const { parent, parent_path: _ } = get_parent_dir(vfs_root, abs);
	if (!parent || parent.type !== 'dir' || !parent.children) return false;

	const existing = parent.children.get(name);
	if (existing && existing.type !== 'file') return false; // can't overwrite a dir

	const now = new Date();
	if (existing) {
		existing.content = content;
		existing.size = content.length;
		existing.modified = now;
	} else {
		parent.children.set(name, make_file(name, content, content.length, now));
	}
	parent.modified = now;
	_vfs_ver.value++;
	return true;
}

/** Create a directory at `path`. Parent directory must already exist. */
export function mkdir(path: string): boolean {
	const abs = normalize(path);
	const name = basename(abs);
	if (!name) return false;

	const { parent } = get_parent_dir(vfs_root, abs);
	if (!parent || parent.type !== 'dir' || !parent.children) return false;
	if (parent.children.has(name)) return false; // already exists

	const now = new Date();
	parent.children.set(name, make_dir(name, new Map(), now));
	parent.modified = now;
	_vfs_ver.value++;
	return true;
}

/** Remove a file or directory. If the target is a non-empty directory, `recursive` must be true. */
export function rm(path: string, recursive?: boolean): boolean {
	const abs = normalize(path);
	const name = basename(abs);
	if (!name) return false; // can't remove root

	const { parent } = get_parent_dir(vfs_root, abs);
	if (!parent || parent.type !== 'dir' || !parent.children) return false;

	const target = parent.children.get(name);
	if (!target) return false;

	if (target.type === 'dir' && target.children && target.children.size > 0 && !recursive) {
		return false; // directory not empty and non-recursive
	}

	parent.children.delete(name);
	parent.modified = new Date();
	_vfs_ver.value++;
	return true;
}

/** Move or rename a node from `src` to `dest`. */
export function mv(src: string, dest: string): boolean {
	const abs_src = normalize(src);
	const abs_dest = normalize(dest);
	const src_name = basename(abs_src);
	if (!src_name) return false;

	// Resolve source parent and node
	const { parent: src_parent } = get_parent_dir(vfs_root, abs_src);
	if (!src_parent || !src_parent.children) return false;
	const src_node = src_parent.children.get(src_name);
	if (!src_node) return false;

	// Determine destination: if dest is an existing directory, move inside it
	const { node: dest_node } = resolve_path(vfs_root, '/', abs_dest);
	let dest_parent: FSNode | null;
	let dest_name: string;

	if (dest_node && dest_node.type === 'dir') {
		// Move into existing directory, keeping original name
		dest_parent = dest_node;
		dest_name = src_name;
	} else {
		// Treat dest as the new full path (rename or move+rename)
		const result = get_parent_dir(vfs_root, abs_dest);
		dest_parent = result.parent;
		dest_name = basename(abs_dest);
	}

	if (!dest_parent || dest_parent.type !== 'dir' || !dest_parent.children) return false;
	if (dest_parent.children.has(dest_name)) return false; // collision

	const now = new Date();
	// Remove from source
	src_parent.children.delete(src_name);
	src_parent.modified = now;

	// Add to destination with updated name
	src_node.name = dest_name;
	src_node.modified = now;
	dest_parent.children.set(dest_name, src_node);
	dest_parent.modified = now;

	_vfs_ver.value++;
	return true;
}

/** Copy a file or directory from `src` to `dest` (deep clone for directories). */
export function cp(src: string, dest: string): boolean {
	const abs_src = normalize(src);
	const abs_dest = normalize(dest);

	const { node: src_node } = resolve_path(vfs_root, '/', abs_src);
	if (!src_node) return false;

	// Determine destination
	const { node: dest_node } = resolve_path(vfs_root, '/', abs_dest);
	let dest_parent: FSNode | null;
	let dest_name: string;

	if (dest_node && dest_node.type === 'dir') {
		dest_parent = dest_node;
		dest_name = basename(abs_src);
	} else {
		const result = get_parent_dir(vfs_root, abs_dest);
		dest_parent = result.parent;
		dest_name = basename(abs_dest);
	}

	if (!dest_parent || dest_parent.type !== 'dir' || !dest_parent.children) return false;
	if (dest_parent.children.has(dest_name)) return false; // collision

	const cloned = deep_clone_node(src_node, dest_name);
	cloned.modified = new Date();
	dest_parent.children.set(dest_name, cloned);
	dest_parent.modified = new Date();

	_vfs_ver.value++;
	return true;
}

/** List the immediate children of a directory at `path`. */
export function ls(path: string): FSNode[] {
	const { node } = resolve_path(vfs_root, '/', path);
	if (!node || node.type !== 'dir' || !node.children) return [];
	return Array.from(node.children.values());
}

/** Check whether a node exists at `path`. */
export function exists(path: string): boolean {
	const { node } = resolve_path(vfs_root, '/', path);
	return node !== null;
}

/** Get the FSNode at `path`, or null if it doesn't exist. */
export function stat(path: string): FSNode | null {
	const { node } = resolve_path(vfs_root, '/', path);
	return node;
}

/** Create an empty file (if it doesn't exist) or update its modified timestamp. */
export function touch(path: string): boolean {
	const abs = normalize(path);
	const name = basename(abs);
	if (!name) return false;

	const { node: existing } = resolve_path(vfs_root, '/', abs);
	const now = new Date();

	if (existing) {
		existing.modified = now;
		_vfs_ver.value++;
		return true;
	}

	// File doesn't exist -- create it
	const { parent } = get_parent_dir(vfs_root, abs);
	if (!parent || parent.type !== 'dir' || !parent.children) return false;

	parent.children.set(name, make_file(name, '', 0, now));
	parent.modified = now;
	_vfs_ver.value++;
	return true;
}
