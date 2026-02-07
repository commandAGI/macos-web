/** File type registry: maps file extensions to the macOS app that opens them. */

import type { AppID } from './apps.svelte';

export interface FileTypeInfo {
	appId: AppID | null;
	typeLabel: string;
	icon: string;
}

const registry: Record<string, FileTypeInfo> = {
	// Text files → Notes
	'.txt': { appId: 'notes', typeLabel: 'Plain Text', icon: '📄' },
	'.md': { appId: 'notes', typeLabel: 'Markdown', icon: '📄' },
	'.log': { appId: 'notes', typeLabel: 'Log File', icon: '📄' },
	'.json': { appId: 'notes', typeLabel: 'JSON', icon: '📄' },
	'.js': { appId: 'notes', typeLabel: 'JavaScript', icon: '📄' },
	'.ts': { appId: 'notes', typeLabel: 'TypeScript', icon: '📄' },
	'.css': { appId: 'notes', typeLabel: 'CSS', icon: '📄' },
	'.html': { appId: 'notes', typeLabel: 'HTML', icon: '📄' },
	'.xml': { appId: 'notes', typeLabel: 'XML', icon: '📄' },
	'.csv': { appId: 'notes', typeLabel: 'CSV', icon: '📄' },
	'.yml': { appId: 'notes', typeLabel: 'YAML', icon: '📄' },
	'.yaml': { appId: 'notes', typeLabel: 'YAML', icon: '📄' },
	'.env': { appId: 'notes', typeLabel: 'Environment File', icon: '📄' },
	'.sh': { appId: 'notes', typeLabel: 'Shell Script', icon: '📄' },
	'.py': { appId: 'notes', typeLabel: 'Python Script', icon: '📄' },
	'.ini': { appId: 'notes', typeLabel: 'Configuration', icon: '📄' },
	'.zshrc': { appId: 'notes', typeLabel: 'Zsh Config', icon: '📄' },
	'.gitconfig': { appId: 'notes', typeLabel: 'Git Config', icon: '📄' },
	'.vimrc': { appId: 'notes', typeLabel: 'Vim Config', icon: '📄' },

	// Images → Photos
	'.png': { appId: 'photos', typeLabel: 'PNG Image', icon: '🖼️' },
	'.jpg': { appId: 'photos', typeLabel: 'JPEG Image', icon: '🖼️' },
	'.jpeg': { appId: 'photos', typeLabel: 'JPEG Image', icon: '🖼️' },
	'.gif': { appId: 'photos', typeLabel: 'GIF Image', icon: '🖼️' },
	'.bmp': { appId: 'photos', typeLabel: 'Bitmap Image', icon: '🖼️' },
	'.webp': { appId: 'photos', typeLabel: 'WebP Image', icon: '🖼️' },
	'.ico': { appId: 'photos', typeLabel: 'Icon File', icon: '🖼️' },
	'.svg': { appId: 'photos', typeLabel: 'SVG Image', icon: '🖼️' },
	'.heic': { appId: 'photos', typeLabel: 'HEIC Image', icon: '🖼️' },
	'.tiff': { appId: 'photos', typeLabel: 'TIFF Image', icon: '🖼️' },

	// PDF → Preview
	'.pdf': { appId: 'preview', typeLabel: 'PDF Document', icon: '📕' },

	// Applications
	'.app': { appId: null, typeLabel: 'Application', icon: '📦' },

	// Archives
	'.zip': { appId: null, typeLabel: 'ZIP Archive', icon: '📦' },
	'.tar': { appId: null, typeLabel: 'TAR Archive', icon: '📦' },
	'.gz': { appId: null, typeLabel: 'GZip Archive', icon: '📦' },
	'.dmg': { appId: null, typeLabel: 'Disk Image', icon: '💿' },
	'.rar': { appId: null, typeLabel: 'RAR Archive', icon: '📦' },

	// Media
	'.mp3': { appId: 'music', typeLabel: 'MP3 Audio', icon: '🎵' },
	'.wav': { appId: 'music', typeLabel: 'WAV Audio', icon: '🎵' },
	'.flac': { appId: 'music', typeLabel: 'FLAC Audio', icon: '🎵' },
	'.aac': { appId: 'music', typeLabel: 'AAC Audio', icon: '🎵' },
	'.m3u': { appId: 'music', typeLabel: 'Playlist', icon: '🎵' },
	'.mp4': { appId: null, typeLabel: 'MPEG-4 Video', icon: '🎬' },
	'.mov': { appId: null, typeLabel: 'QuickTime Movie', icon: '🎬' },
	'.avi': { appId: null, typeLabel: 'AVI Video', icon: '🎬' },
	'.mkv': { appId: null, typeLabel: 'MKV Video', icon: '🎬' },

	// Office
	'.docx': { appId: null, typeLabel: 'Word Document', icon: '📝' },
	'.xlsx': { appId: null, typeLabel: 'Excel Spreadsheet', icon: '📊' },
	'.pptx': { appId: null, typeLabel: 'PowerPoint', icon: '📊' },
	'.pages': { appId: null, typeLabel: 'Pages Document', icon: '📝' },
	'.numbers': { appId: null, typeLabel: 'Numbers Spreadsheet', icon: '📊' },
	'.key': { appId: 'keynote', typeLabel: 'Keynote Presentation', icon: '📊' },
};

export function get_file_extension(filename: string): string {
	const dot = filename.lastIndexOf('.');
	if (dot === -1 || dot === 0) return '';
	return filename.slice(dot).toLowerCase();
}

export function lookup_file_type(filename: string): FileTypeInfo {
	const ext = get_file_extension(filename);
	return registry[ext] ?? { appId: null, typeLabel: 'Document', icon: '📄' };
}

export function get_app_for_file(filename: string): AppID | null {
	return lookup_file_type(filename).appId;
}

export function get_file_icon(filename: string): string {
	return lookup_file_type(filename).icon;
}

export function get_file_type_label(filename: string): string {
	return lookup_file_type(filename).typeLabel;
}
