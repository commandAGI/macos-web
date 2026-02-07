import type { apps_config } from '🍎/configs/apps/apps-config';

export type AppID = keyof typeof apps_config;

export const apps = $state({
	open: {
		finder: false,
		safari: false,
		terminal: false,
		notes: false,
		messages: false,
		mail: false,
		photos: false,
		music: false,
		maps: false,
		'system-preferences': false,
		facetime: false,
		reminders: false,
		news: false,
		podcasts: false,
		tv: false,
		contacts: false,
		keynote: false,
		launchpad: false,
		devutils: false,
		preview: false,

		wallpapers: false,
		calculator: false,
		calendar: false,
		vscode: false,
		appstore: false,

		'purus-twitter': false,
		'view-source': true,

		vercel: true,
	} as Record<AppID, boolean>,

	active: 'finder' satisfies AppID,

	/**
	 * Maximum zIndex for the active app
	 * Initialize with -2, so that it becomes 0 when initialised
	 */
	active_z_index: -2,

	z_indices: {
		finder: 0,
		safari: 0,
		terminal: 0,
		notes: 0,
		messages: 0,
		mail: 0,
		photos: 0,
		music: 0,
		maps: 0,
		'system-preferences': 0,
		facetime: 0,
		reminders: 0,
		news: 0,
		podcasts: 0,
		tv: 0,
		contacts: 0,
		keynote: 0,
		launchpad: 0,
		devutils: 0,
		preview: 0,

		wallpapers: 0,
		calculator: 0,
		calendar: 0,
		vscode: 0,
		appstore: 0,

		'purus-twitter': 0,
		'view-source': 0,

		vercel: 0,
	} as Record<AppID, number>,

	is_being_dragged: false as boolean,

	fullscreen: {
		finder: false,
		safari: false,
		terminal: false,
		notes: false,
		messages: false,
		mail: false,
		photos: false,
		music: false,
		maps: false,
		'system-preferences': false,
		facetime: false,
		reminders: false,
		news: false,
		podcasts: false,
		tv: false,
		contacts: false,
		keynote: false,
		launchpad: false,
		devutils: false,
		preview: false,

		wallpapers: false,
		calculator: false,
		calendar: false,
		vscode: false,
		appstore: false,

		'purus-twitter': false,
		'view-source': false,

		vercel: false,
	} as Record<AppID, boolean>,
});
