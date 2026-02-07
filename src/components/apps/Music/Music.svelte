<script lang="ts">
	// ── Types ──
	type Song = {
		id: number;
		title: string;
		artist: string;
		album: string;
		album_id: number;
		duration: number; // seconds
		track_number: number;
	};

	type Album = {
		id: number;
		title: string;
		artist: string;
		year: number;
		gradient: string;
		genre: string;
	};

	type Playlist = {
		id: number;
		title: string;
		description: string;
		gradient: string;
		song_ids: number[];
	};

	// ── Data ──
	const albums: Album[] = [
		{ id: 1, title: 'Electric Dreams', artist: 'Neon Waves', year: 2024, gradient: 'linear-gradient(135deg, #667eea, #764ba2)', genre: 'Synthwave' },
		{ id: 2, title: 'Golden Hour', artist: 'Crystal Echoes', year: 2024, gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', genre: 'Indie Pop' },
		{ id: 3, title: 'Byte Patterns', artist: 'Synth Horizon', year: 2023, gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', genre: 'Electronic' },
		{ id: 4, title: 'Cafe Sessions', artist: 'Jazz Cats', year: 2023, gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', genre: 'Jazz' },
		{ id: 5, title: 'Nebula', artist: 'Cosmic Drift', year: 2024, gradient: 'linear-gradient(135deg, #fa709a, #fee140)', genre: 'Ambient' },
	];

	const songs: Song[] = [
		// Electric Dreams - Neon Waves
		{ id: 1, title: 'Midnight Drive', artist: 'Neon Waves', album: 'Electric Dreams', album_id: 1, duration: 222, track_number: 1 },
		{ id: 2, title: 'Neon City', artist: 'Neon Waves', album: 'Electric Dreams', album_id: 1, duration: 198, track_number: 2 },
		{ id: 3, title: 'Chrome Hearts', artist: 'Neon Waves', album: 'Electric Dreams', album_id: 1, duration: 245, track_number: 3 },
		{ id: 4, title: 'Retrograde', artist: 'Neon Waves', album: 'Electric Dreams', album_id: 1, duration: 267, track_number: 4 },
		// Golden Hour - Crystal Echoes
		{ id: 5, title: 'Sunset Boulevard', artist: 'Crystal Echoes', album: 'Golden Hour', album_id: 2, duration: 255, track_number: 1 },
		{ id: 6, title: 'Tangerine Sky', artist: 'Crystal Echoes', album: 'Golden Hour', album_id: 2, duration: 213, track_number: 2 },
		{ id: 7, title: 'Warm Glow', artist: 'Crystal Echoes', album: 'Golden Hour', album_id: 2, duration: 189, track_number: 3 },
		{ id: 8, title: 'Daylight Fades', artist: 'Crystal Echoes', album: 'Golden Hour', album_id: 2, duration: 302, track_number: 4 },
		// Byte Patterns - Synth Horizon
		{ id: 9, title: 'Digital Rain', artist: 'Synth Horizon', album: 'Byte Patterns', album_id: 3, duration: 238, track_number: 1 },
		{ id: 10, title: 'Binary Sunset', artist: 'Synth Horizon', album: 'Byte Patterns', album_id: 3, duration: 194, track_number: 2 },
		{ id: 11, title: 'Pixel Dreams', artist: 'Synth Horizon', album: 'Byte Patterns', album_id: 3, duration: 221, track_number: 3 },
		// Cafe Sessions - Jazz Cats
		{ id: 12, title: 'Morning Coffee', artist: 'Jazz Cats', album: 'Cafe Sessions', album_id: 4, duration: 284, track_number: 1 },
		{ id: 13, title: 'Smooth Afternoon', artist: 'Jazz Cats', album: 'Cafe Sessions', album_id: 4, duration: 316, track_number: 2 },
		{ id: 14, title: 'Espresso Blues', artist: 'Jazz Cats', album: 'Cafe Sessions', album_id: 4, duration: 258, track_number: 3 },
		{ id: 15, title: 'Last Call', artist: 'Jazz Cats', album: 'Cafe Sessions', album_id: 4, duration: 342, track_number: 4 },
		// Nebula - Cosmic Drift
		{ id: 16, title: 'Stargazer', artist: 'Cosmic Drift', album: 'Nebula', album_id: 5, duration: 372, track_number: 1 },
		{ id: 17, title: 'Dark Matter', artist: 'Cosmic Drift', album: 'Nebula', album_id: 5, duration: 298, track_number: 2 },
		{ id: 18, title: 'Supernova', artist: 'Cosmic Drift', album: 'Nebula', album_id: 5, duration: 265, track_number: 3 },
		{ id: 19, title: 'Event Horizon', artist: 'Cosmic Drift', album: 'Nebula', album_id: 5, duration: 410, track_number: 4 },
	];

	const playlists: Playlist[] = [
		{ id: 1, title: 'Chill Vibes', description: 'Wind down with these mellow tracks', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', song_ids: [1, 5, 12, 16, 7] },
		{ id: 2, title: 'Focus Flow', description: 'Deep work, deep beats', gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)', song_ids: [9, 3, 17, 11, 14] },
		{ id: 3, title: 'Night Drive', description: 'Perfect for late drives', gradient: 'linear-gradient(135deg, #2c3e50, #4ca1af)', song_ids: [1, 2, 9, 16, 18] },
		{ id: 4, title: 'Morning Energy', description: 'Start your day right', gradient: 'linear-gradient(135deg, #f5af19, #f12711)', song_ids: [5, 6, 12, 10, 4] },
	];

	// ── State ──
	let active_section = $state('listen-now');
	let is_playing = $state(false);
	let current_song_id = $state<number | null>(null);
	let queue: number[] = $state([]);
	let play_history: number[] = $state([]);
	let shuffle_on = $state(false);
	let repeat_mode = $state<'off' | 'all' | 'one'>('off');
	let volume = $state(75);
	let progress = $state(0); // 0-100
	let is_dragging_progress = $state(false);
	let is_dragging_volume = $state(false);
	let show_queue = $state(false);
	let search_query = $state('');
	let selected_album_id = $state<number | null>(null);
	let selected_playlist_id = $state<number | null>(null);
	let progress_interval: ReturnType<typeof setInterval> | null = null;
	let progress_track_el: HTMLElement | null = $state(null);

	// ── Derived ──
	let current_song = $derived(current_song_id ? songs.find(s => s.id === current_song_id) ?? null : null);
	let current_album = $derived(current_song ? albums.find(a => a.id === current_song.album_id) ?? null : null);

	let selected_album = $derived(selected_album_id ? albums.find(a => a.id === selected_album_id) ?? null : null);
	let selected_album_songs = $derived(selected_album_id ? songs.filter(s => s.album_id === selected_album_id).sort((a, b) => a.track_number - b.track_number) : []);

	let selected_playlist = $derived(selected_playlist_id ? playlists.find(p => p.id === selected_playlist_id) ?? null : null);
	let selected_playlist_songs = $derived(selected_playlist ? selected_playlist.song_ids.map(id => songs.find(s => s.id === id)!).filter(Boolean) : []);

	let search_results = $derived.by(() => {
		if (!search_query.trim()) return { songs: [], albums: [], artists: [] };
		const q = search_query.toLowerCase();
		const matched_songs = songs.filter(s =>
			s.title.toLowerCase().includes(q) ||
			s.artist.toLowerCase().includes(q) ||
			s.album.toLowerCase().includes(q)
		);
		const matched_albums = albums.filter(a =>
			a.title.toLowerCase().includes(q) ||
			a.artist.toLowerCase().includes(q)
		);
		const artist_names = [...new Set(songs.map(s => s.artist))];
		const matched_artists = artist_names.filter(a => a.toLowerCase().includes(q));
		return { songs: matched_songs, albums: matched_albums, artists: matched_artists };
	});

	let has_search_results = $derived(
		search_results.songs.length > 0 ||
		search_results.albums.length > 0 ||
		search_results.artists.length > 0
	);

	let current_time_display = $derived.by(() => {
		if (!current_song) return { current: '0:00', remaining: '-0:00' };
		const elapsed = Math.floor((progress / 100) * current_song.duration);
		const remaining = current_song.duration - elapsed;
		return {
			current: format_time(elapsed),
			remaining: '-' + format_time(remaining),
		};
	});

	let queue_songs = $derived(queue.map(id => songs.find(s => s.id === id)!).filter(Boolean));

	let recently_played_albums = $derived.by(() => {
		const seen = new Set<number>();
		const result: Album[] = [];
		for (const song_id of play_history) {
			const song = songs.find(s => s.id === song_id);
			if (song && !seen.has(song.album_id)) {
				seen.add(song.album_id);
				const album = albums.find(a => a.id === song.album_id);
				if (album) result.push(album);
			}
		}
		return result.length > 0 ? result : albums.slice(0, 4);
	});

	// Featured hero albums for Listen Now
	const featured_albums = [albums[0], albums[4], albums[1]];

	// Artists derived from songs
	let all_artists = $derived.by(() => {
		const map = new Map<string, { name: string; album_count: number; song_count: number; gradient: string }>();
		for (const song of songs) {
			if (!map.has(song.artist)) {
				const artist_album = albums.find(a => a.artist === song.artist);
				map.set(song.artist, {
					name: song.artist,
					album_count: albums.filter(a => a.artist === song.artist).length,
					song_count: songs.filter(s => s.artist === song.artist).length,
					gradient: artist_album?.gradient ?? 'linear-gradient(135deg, #667eea, #764ba2)',
				});
			}
		}
		return [...map.values()];
	});

	// Total duration helper for album/playlist
	let selected_album_duration = $derived.by(() => {
		return selected_album_songs.reduce((sum, s) => sum + s.duration, 0);
	});

	let selected_playlist_duration = $derived.by(() => {
		return selected_playlist_songs.reduce((sum, s) => sum + s.duration, 0);
	});

	// ── Helpers ──
	function format_time(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	function format_duration(seconds: number): string {
		return format_time(seconds);
	}

	function format_total_duration(seconds: number): string {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		if (h > 0) return `${h} hr ${m} min`;
		return `${m} min`;
	}

	function get_album_for_song(song: Song): Album | undefined {
		return albums.find(a => a.id === song.album_id);
	}

	// ── Playback ──
	function play_song(song: Song, context_songs?: Song[]) {
		if (current_song_id !== null) {
			play_history = [current_song_id, ...play_history.filter(id => id !== current_song_id)].slice(0, 50);
		}
		current_song_id = song.id;
		is_playing = true;
		progress = 0;

		// Build queue from context
		if (context_songs) {
			const idx = context_songs.findIndex(s => s.id === song.id);
			if (idx !== -1) {
				queue = context_songs.slice(idx + 1).map(s => s.id);
			}
		}

		start_progress();
	}

	function toggle_play() {
		if (!current_song_id && songs.length > 0) {
			play_song(songs[0], songs);
			return;
		}
		is_playing = !is_playing;
		if (is_playing) {
			start_progress();
		} else {
			stop_progress();
		}
	}

	function next_song() {
		if (repeat_mode === 'one' && current_song) {
			progress = 0;
			is_playing = true;
			start_progress();
			return;
		}

		if (shuffle_on) {
			const available = songs.filter(s => s.id !== current_song_id);
			if (available.length > 0) {
				const random = available[Math.floor(Math.random() * available.length)];
				play_song(random);
			}
			return;
		}

		if (queue.length > 0) {
			const next_id = queue[0];
			queue = queue.slice(1);
			const next = songs.find(s => s.id === next_id);
			if (next) {
				if (current_song_id !== null) {
					play_history = [current_song_id, ...play_history.filter(id => id !== current_song_id)].slice(0, 50);
				}
				current_song_id = next.id;
				progress = 0;
				is_playing = true;
				start_progress();
			}
		} else if (repeat_mode === 'all') {
			// Restart all songs
			play_song(songs[0], songs);
		} else {
			// No more songs, stop
			is_playing = false;
			stop_progress();
		}
	}

	function prev_song() {
		if (progress > 5) {
			// If we're more than 5% in, restart current song
			progress = 0;
			return;
		}
		if (play_history.length > 0) {
			const prev_id = play_history[0];
			play_history = play_history.slice(1);
			if (current_song_id !== null) {
				queue = [current_song_id, ...queue];
			}
			current_song_id = prev_id;
			progress = 0;
			is_playing = true;
			start_progress();
		}
	}

	function start_progress() {
		stop_progress();
		progress_interval = setInterval(() => {
			if (is_playing && !is_dragging_progress && current_song) {
				const increment = (100 / current_song.duration) * 0.25; // update every 250ms
				progress = Math.min(progress + increment, 100);
				if (progress >= 100) {
					next_song();
				}
			}
		}, 250);
	}

	function stop_progress() {
		if (progress_interval) {
			clearInterval(progress_interval);
			progress_interval = null;
		}
	}

	function handle_progress_mousedown(e: MouseEvent) {
		is_dragging_progress = true;
		update_progress_from_event(e);

		const handle_move = (ev: MouseEvent) => {
			update_progress_from_event(ev);
		};

		const handle_up = () => {
			is_dragging_progress = false;
			window.removeEventListener('mousemove', handle_move);
			window.removeEventListener('mouseup', handle_up);
		};

		window.addEventListener('mousemove', handle_move);
		window.addEventListener('mouseup', handle_up);
	}

	function update_progress_from_event(e: MouseEvent) {
		if (!progress_track_el) return;
		const rect = progress_track_el.getBoundingClientRect();
		const x = e.clientX - rect.left;
		progress = Math.max(0, Math.min(100, (x / rect.width) * 100));
	}

	function handle_volume_mousedown(e: MouseEvent) {
		is_dragging_volume = true;
		update_volume_from_event(e);

		const handle_move = (ev: MouseEvent) => {
			update_volume_from_event(ev);
		};

		const handle_up = () => {
			is_dragging_volume = false;
			window.removeEventListener('mousemove', handle_move);
			window.removeEventListener('mouseup', handle_up);
		};

		window.addEventListener('mousemove', handle_move);
		window.addEventListener('mouseup', handle_up);
	}

	function update_volume_from_event(e: MouseEvent) {
		const track = (e.target as HTMLElement).closest('.volume-track') as HTMLElement
			?? document.querySelector('.volume-track') as HTMLElement;
		if (!track) return;
		const rect = track.getBoundingClientRect();
		const x = e.clientX - rect.left;
		volume = Math.max(0, Math.min(100, (x / rect.width) * 100));
	}

	function toggle_shuffle() {
		shuffle_on = !shuffle_on;
	}

	function toggle_repeat() {
		if (repeat_mode === 'off') repeat_mode = 'all';
		else if (repeat_mode === 'all') repeat_mode = 'one';
		else repeat_mode = 'off';
	}

	function open_album(album_id: number) {
		selected_album_id = album_id;
		selected_playlist_id = null;
		active_section = 'album-detail';
	}

	function open_playlist(playlist_id: number) {
		selected_playlist_id = playlist_id;
		selected_album_id = null;
		active_section = 'playlist-detail';
	}

	function open_artist(artist_name: string) {
		// Show first album by that artist
		const artist_album = albums.find(a => a.artist === artist_name);
		if (artist_album) {
			open_album(artist_album.id);
		}
	}

	function remove_from_queue(index: number) {
		queue = [...queue.slice(0, index), ...queue.slice(index + 1)];
	}

	function play_album(album: Album) {
		const album_songs = songs.filter(s => s.album_id === album.id).sort((a, b) => a.track_number - b.track_number);
		if (album_songs.length > 0) {
			play_song(album_songs[0], album_songs);
		}
	}

	function play_playlist(playlist: Playlist) {
		const pl_songs = playlist.song_ids.map(id => songs.find(s => s.id === id)!).filter(Boolean);
		if (pl_songs.length > 0) {
			play_song(pl_songs[0], pl_songs);
		}
	}

	// Sidebar items with icons (SVG paths)
	const sidebar_sections = [
		{
			title: 'Apple Music',
			items: [
				{ id: 'listen-now', label: 'Listen Now', icon: 'listen' },
				{ id: 'browse', label: 'Browse', icon: 'browse' },
				{ id: 'radio', label: 'Radio', icon: 'radio' },
			]
		},
		{
			title: 'Library',
			items: [
				{ id: 'recently-added', label: 'Recently Added', icon: 'recent' },
				{ id: 'artists', label: 'Artists', icon: 'artists' },
				{ id: 'albums', label: 'Albums', icon: 'albums' },
				{ id: 'songs', label: 'Songs', icon: 'songs' },
				{ id: 'playlists', label: 'Playlists', icon: 'playlists' },
			]
		}
	];

	// Cleanup on destroy
	$effect(() => {
		return () => {
			stop_progress();
		};
	});
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar">
		<div class="titlebar-controls">
			<div class="search-container">
				<svg class="search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
				</svg>
				<input
					type="text"
					class="search-input"
					placeholder="Search"
					bind:value={search_query}
					onfocus={() => { if (search_query) active_section = 'search'; }}
					oninput={() => { if (search_query) active_section = 'search'; }}
				/>
				{#if search_query}
					<button class="search-clear" onclick={() => { search_query = ''; active_section = 'listen-now'; }}>
						<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
					</button>
				{/if}
			</div>
		</div>
	</header>

	<div class="main">
		<aside class="sidebar">
			{#each sidebar_sections as group}
				<div class="sidebar-section">
					<div class="sidebar-section-title">{group.title}</div>
					{#each group.items as item}
						<button
							class="sidebar-item"
							class:active={active_section === item.id}
							class:apple-music-item={group.title === 'Apple Music'}
							onclick={() => {
								active_section = item.id;
								selected_album_id = null;
								selected_playlist_id = null;
								search_query = '';
							}}
						>
							<span class="sidebar-icon">
								{#if item.icon === 'listen'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
								{:else if item.icon === 'browse'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>
								{:else if item.icon === 'radio'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8c0-1.1-.9-2-2-2H8.3l8.26-3.34L15.88 1 3.24 6.15zM7 20c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-8h-2v-2h-2v2H4v-2h14v2z"/></svg>
								{:else if item.icon === 'recent'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
								{:else if item.icon === 'artists'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
								{:else if item.icon === 'albums'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>
								{:else if item.icon === 'songs'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
								{:else if item.icon === 'playlists'}
									<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>
								{/if}
							</span>
							{item.label}
						</button>
					{/each}
				</div>
			{/each}
		</aside>

		<div class="content" class:queue-open={show_queue}>
			<!-- Search View -->
			{#if active_section === 'search' && search_query}
				<div class="view-enter">
					<div class="content-header">
						<h1>Search Results</h1>
					</div>

					{#if !has_search_results}
						<div class="empty-state">
							<div class="empty-icon">
								<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
									<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
								</svg>
							</div>
							<p>No results for "{search_query}"</p>
						</div>
					{:else}
						{#if search_results.artists.length > 0}
							<div class="section-title">Artists</div>
							<div class="search-artists-row">
								{#each search_results.artists as artist_name}
									{@const artist_data = all_artists.find(a => a.name === artist_name)}
									<button class="artist-pill" onclick={() => open_artist(artist_name)}>
										<div class="artist-pill-avatar" style:background={artist_data?.gradient ?? ''}></div>
										<span>{artist_name}</span>
									</button>
								{/each}
							</div>
						{/if}

						{#if search_results.albums.length > 0}
							<div class="section-title">Albums</div>
							<div class="album-row">
								{#each search_results.albums as album}
									<button class="album-card" onclick={() => open_album(album.id)}>
										<div class="album-art" style:background={album.gradient}>
											<span class="album-art-letter">{album.title.charAt(0)}</span>
										</div>
										<div class="album-card-title">{album.title}</div>
										<div class="album-card-artist">{album.artist}</div>
									</button>
								{/each}
							</div>
						{/if}

						{#if search_results.songs.length > 0}
							<div class="section-title">Songs</div>
							<div class="song-list">
								{#each search_results.songs as song, i}
									<button
										class="song-row"
										class:playing={current_song_id === song.id}
										class:odd={i % 2 === 1}
										onclick={() => play_song(song, search_results.songs)}
									>
										<span class="song-num">
											{#if current_song_id === song.id && is_playing}
												<span class="equalizer">
													<span class="eq-bar"></span>
													<span class="eq-bar"></span>
													<span class="eq-bar"></span>
												</span>
											{:else}
												{i + 1}
											{/if}
										</span>
										<div class="song-info-cell">
											<div class="song-art-mini" style:background={get_album_for_song(song)?.gradient ?? ''}></div>
											<div>
												<div class="song-cell-title">{song.title}</div>
												<div class="song-cell-artist">{song.artist}</div>
											</div>
										</div>
										<span class="song-album-col">{song.album}</span>
										<span class="song-duration-col">{format_duration(song.duration)}</span>
									</button>
								{/each}
							</div>
						{/if}
					{/if}
				</div>

			<!-- Listen Now View -->
			{:else if active_section === 'listen-now'}
				<div class="view-enter">
					<div class="content-header">
						<h1>Listen Now</h1>
					</div>

					<!-- Hero Cards -->
					<div class="hero-row">
						{#each featured_albums as album}
							<button class="hero-card" onclick={() => open_album(album.id)}>
								<div class="hero-art" style:background={album.gradient}>
									<div class="hero-overlay">
										<div class="hero-genre">{album.genre}</div>
										<div class="hero-title">{album.title}</div>
										<div class="hero-artist">{album.artist}</div>
									</div>
								</div>
							</button>
						{/each}
					</div>

					<!-- Recently Played -->
					<div class="section-title">Recently Played</div>
					<div class="album-row">
						{#each recently_played_albums as album}
							<button class="album-card" onclick={() => open_album(album.id)}>
								<div class="recent-album-art" style:background={album.gradient}>
									<div class="recent-album-overlay">
										<div class="recent-album-title">{album.title}</div>
									</div>
								</div>
								<div class="album-card-title">{album.title}</div>
								<div class="album-card-artist">{album.artist}</div>
							</button>
						{/each}
					</div>

					<!-- Made For You -->
					<div class="section-title">Made For You</div>
					<div class="playlist-row">
						{#each playlists as playlist}
							<button class="playlist-card" onclick={() => open_playlist(playlist.id)}>
								<div class="playlist-art" style:background={playlist.gradient}>
									<span class="playlist-art-icon">
										<svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>
									</span>
								</div>
								<div class="playlist-card-title">{playlist.title}</div>
								<div class="playlist-card-desc">{playlist.description}</div>
							</button>
						{/each}
					</div>
				</div>

			<!-- Browse View -->
			{:else if active_section === 'browse'}
				<div class="view-enter">
					<div class="content-header">
						<h1>Browse</h1>
					</div>

					<div class="section-title">Top Picks</div>
					<div class="hero-row">
						{#each albums.slice(0, 3) as album}
							<button class="hero-card" onclick={() => open_album(album.id)}>
								<div class="hero-art" style:background={album.gradient}>
									<div class="hero-overlay">
										<div class="hero-genre">{album.genre}</div>
										<div class="hero-title">{album.title}</div>
										<div class="hero-artist">{album.artist}</div>
									</div>
								</div>
							</button>
						{/each}
					</div>

					<div class="section-title">New Releases</div>
					<div class="album-row">
						{#each albums as album}
							<button class="album-card" onclick={() => open_album(album.id)}>
								<div class="album-art" style:background={album.gradient}>
									<span class="album-art-letter">{album.title.charAt(0)}</span>
								</div>
								<div class="album-card-title">{album.title}</div>
								<div class="album-card-artist">{album.artist}</div>
							</button>
						{/each}
					</div>
				</div>

			<!-- Radio View -->
			{:else if active_section === 'radio'}
				<div class="view-enter">
					<div class="content-header">
						<h1>Radio</h1>
					</div>

					<div class="section-title">Featured Stations</div>
					<div class="radio-grid">
						{#each [
							{ name: 'Hits Station', desc: 'Today\'s biggest hits', gradient: 'linear-gradient(135deg, #fa2d48, #a10d2b)' },
							{ name: 'Chill Station', desc: 'Relax and unwind', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
							{ name: 'Indie Station', desc: 'Discover new artists', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
							{ name: 'Jazz Station', desc: 'Smooth jazz all day', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
						] as station}
							<button class="radio-card" onclick={() => { play_song(songs[Math.floor(Math.random() * songs.length)], songs); }}>
								<div class="radio-art" style:background={station.gradient}>
									<svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)"><path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8c0-1.1-.9-2-2-2H8.3l8.26-3.34L15.88 1 3.24 6.15zM7 20c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-8h-2v-2h-2v2H4v-2h14v2z"/></svg>
								</div>
								<div class="radio-name">{station.name}</div>
								<div class="radio-desc">{station.desc}</div>
							</button>
						{/each}
					</div>
				</div>

			<!-- Album Detail View -->
			{:else if active_section === 'album-detail' && selected_album}
				<div class="view-enter">
					<div class="album-detail">
						<button class="back-btn" onclick={() => { active_section = 'albums'; selected_album_id = null; }}>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
							Back
						</button>
						<div class="album-detail-header">
							<div class="album-detail-art" style:background={selected_album.gradient}>
								<span class="album-detail-letter">{selected_album.title.charAt(0)}</span>
							</div>
							<div class="album-detail-info">
								<div class="album-detail-title">{selected_album.title}</div>
								<div class="album-detail-artist">{selected_album.artist}</div>
								<div class="album-detail-meta">{selected_album.genre} &middot; {selected_album.year} &middot; {selected_album_songs.length} songs, {format_total_duration(selected_album_duration)}</div>
								<div class="album-detail-actions">
									<button class="play-album-btn" onclick={() => play_album(selected_album)}>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
										Play
									</button>
									<button class="shuffle-album-btn" onclick={() => { shuffle_on = true; play_album(selected_album); }}>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
										Shuffle
									</button>
								</div>
							</div>
						</div>

						<div class="song-list album-song-list">
							{#each selected_album_songs as song, i}
								<button
									class="song-row"
									class:playing={current_song_id === song.id}
									class:odd={i % 2 === 1}
									onclick={() => play_song(song, selected_album_songs)}
								>
									<span class="song-num">
										{#if current_song_id === song.id && is_playing}
											<span class="equalizer">
												<span class="eq-bar"></span>
												<span class="eq-bar"></span>
												<span class="eq-bar"></span>
											</span>
										{:else if current_song_id === song.id}
											<span class="paused-indicator">
												<svg width="10" height="10" viewBox="0 0 24 24" fill="#fa2d48"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
											</span>
										{:else}
											{song.track_number}
										{/if}
									</span>
									<span class="song-title-col">{song.title}</span>
									<span class="song-duration-col">{format_duration(song.duration)}</span>
								</button>
							{/each}
						</div>
					</div>
				</div>

			<!-- Playlist Detail View -->
			{:else if active_section === 'playlist-detail' && selected_playlist}
				<div class="view-enter">
					<div class="album-detail">
						<button class="back-btn" onclick={() => { active_section = 'playlists'; selected_playlist_id = null; }}>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
							Back
						</button>
						<div class="album-detail-header">
							<div class="album-detail-art" style:background={selected_playlist.gradient}>
								<svg width="48" height="48" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>
							</div>
							<div class="album-detail-info">
								<div class="album-detail-title">{selected_playlist.title}</div>
								<div class="album-detail-meta">{selected_playlist.description}</div>
								<div class="album-detail-meta">{selected_playlist_songs.length} songs, {format_total_duration(selected_playlist_duration)}</div>
								<div class="album-detail-actions">
									<button class="play-album-btn" onclick={() => play_playlist(selected_playlist)}>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
										Play
									</button>
									<button class="shuffle-album-btn" onclick={() => { shuffle_on = true; play_playlist(selected_playlist); }}>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
										Shuffle
									</button>
								</div>
							</div>
						</div>

						<div class="song-list">
							{#each selected_playlist_songs as song, i}
								<button
									class="song-row"
									class:playing={current_song_id === song.id}
									class:odd={i % 2 === 1}
									onclick={() => play_song(song, selected_playlist_songs)}
								>
									<span class="song-num">
										{#if current_song_id === song.id && is_playing}
											<span class="equalizer">
												<span class="eq-bar"></span>
												<span class="eq-bar"></span>
												<span class="eq-bar"></span>
											</span>
										{:else if current_song_id === song.id}
											<span class="paused-indicator">
												<svg width="10" height="10" viewBox="0 0 24 24" fill="#fa2d48"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
											</span>
										{:else}
											{i + 1}
										{/if}
									</span>
									<div class="song-info-cell">
										<div class="song-art-mini" style:background={get_album_for_song(song)?.gradient ?? ''}></div>
										<div>
											<div class="song-cell-title">{song.title}</div>
											<div class="song-cell-artist">{song.artist}</div>
										</div>
									</div>
									<span class="song-album-col">{song.album}</span>
									<span class="song-duration-col">{format_duration(song.duration)}</span>
								</button>
							{/each}
						</div>
					</div>
				</div>

			<!-- Recently Added View -->
			{:else if active_section === 'recently-added'}
				<div class="view-enter">
					<div class="content-header">
						<h1>Recently Added</h1>
					</div>

					<div class="album-grid">
						{#each [...albums].reverse() as album}
							<button class="album-card" onclick={() => open_album(album.id)}>
								<div class="album-art" style:background={album.gradient}>
									<span class="album-art-letter">{album.title.charAt(0)}</span>
								</div>
								<div class="album-card-title">{album.title}</div>
								<div class="album-card-artist">{album.artist}</div>
							</button>
						{/each}
					</div>
				</div>

			<!-- Artists View -->
			{:else if active_section === 'artists'}
				<div class="view-enter">
					<div class="content-header">
						<h1>Artists</h1>
					</div>

					<div class="artists-list">
						{#each all_artists as artist}
							<button class="artist-row" onclick={() => open_artist(artist.name)}>
								<div class="artist-avatar" style:background={artist.gradient}>
									<span>{artist.name.charAt(0)}</span>
								</div>
								<div class="artist-info">
									<div class="artist-name">{artist.name}</div>
									<div class="artist-meta">{artist.album_count} album{artist.album_count !== 1 ? 's' : ''} &middot; {artist.song_count} songs</div>
								</div>
							</button>
						{/each}
					</div>
				</div>

			<!-- Albums View -->
			{:else if active_section === 'albums'}
				<div class="view-enter">
					<div class="content-header">
						<h1>Albums</h1>
					</div>

					<div class="album-grid">
						{#each albums as album}
							<button class="album-card" onclick={() => open_album(album.id)}>
								<div class="album-art" style:background={album.gradient}>
									<span class="album-art-letter">{album.title.charAt(0)}</span>
								</div>
								<div class="album-card-title">{album.title}</div>
								<div class="album-card-artist">{album.artist}</div>
							</button>
						{/each}
					</div>
				</div>

			<!-- Songs View -->
			{:else if active_section === 'songs'}
				<div class="view-enter">
					<div class="content-header">
						<h1>Songs</h1>
					</div>

					<div class="song-list">
						<div class="song-header-row">
							<span class="song-num">#</span>
							<span class="song-title-col">Title</span>
							<span class="song-artist-col">Artist</span>
							<span class="song-album-col">Album</span>
							<span class="song-duration-col">
								<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" opacity="0.5"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
							</span>
						</div>
						{#each songs as song, i}
							<button
								class="song-row"
								class:playing={current_song_id === song.id}
								class:odd={i % 2 === 1}
								onclick={() => play_song(song, songs)}
							>
								<span class="song-num">
									{#if current_song_id === song.id && is_playing}
										<span class="equalizer">
											<span class="eq-bar"></span>
											<span class="eq-bar"></span>
											<span class="eq-bar"></span>
										</span>
									{:else if current_song_id === song.id}
										<span class="paused-indicator">
											<svg width="10" height="10" viewBox="0 0 24 24" fill="#fa2d48"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
										</span>
									{:else}
										{i + 1}
									{/if}
								</span>
								<span class="song-title-col">{song.title}</span>
								<span class="song-artist-col">{song.artist}</span>
								<span class="song-album-col">{song.album}</span>
								<span class="song-duration-col">{format_duration(song.duration)}</span>
							</button>
						{/each}
					</div>
				</div>

			<!-- Playlists View -->
			{:else if active_section === 'playlists'}
				<div class="view-enter">
					<div class="content-header">
						<h1>Playlists</h1>
					</div>

					<div class="album-grid">
						{#each playlists as playlist}
							<button class="playlist-card-large" onclick={() => open_playlist(playlist.id)}>
								<div class="playlist-art-large" style:background={playlist.gradient}>
									<svg width="36" height="36" viewBox="0 0 24 24" fill="rgba(255,255,255,0.85)"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>
								</div>
								<div class="playlist-card-title">{playlist.title}</div>
								<div class="playlist-card-desc">{playlist.description}</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Queue Panel (slide-out) -->
			{#if show_queue}
				<div class="queue-panel">
					<div class="queue-header">
						<h2>Up Next</h2>
						<button class="queue-close" onclick={() => show_queue = false}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
						</button>
					</div>

					{#if current_song}
						<div class="queue-now-playing-label">Now Playing</div>
						<div class="queue-item queue-current">
							<div class="queue-item-art" style:background={current_album?.gradient ?? ''}></div>
							<div class="queue-item-info">
								<div class="queue-item-title">{current_song.title}</div>
								<div class="queue-item-artist">{current_song.artist}</div>
							</div>
							<span class="queue-item-duration">{format_duration(current_song.duration)}</span>
						</div>
					{/if}

					{#if queue_songs.length > 0}
						<div class="queue-up-next-label">Queue</div>
						{#each queue_songs as song, i}
							<div class="queue-item">
								<div class="queue-item-art" style:background={get_album_for_song(song)?.gradient ?? ''}></div>
								<div class="queue-item-info">
									<div class="queue-item-title">{song.title}</div>
									<div class="queue-item-artist">{song.artist}</div>
								</div>
								<button class="queue-remove" onclick={() => remove_from_queue(i)}>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
								</button>
							</div>
						{/each}
					{:else}
						<div class="queue-empty">
							<p>No songs in queue</p>
							<p class="queue-empty-hint">Play a song or album to start</p>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<!-- Now Playing Bar -->
	<div class="now-playing" class:has-song={current_song !== null}>
		<div class="np-left">
			{#if current_song}
				<div class="np-art" style:background={current_album?.gradient ?? ''}>
					<span class="np-art-letter">{current_song.title.charAt(0)}</span>
				</div>
				<div class="np-details">
					<div class="np-title">{current_song.title}</div>
					<div class="np-artist">{current_song.artist}</div>
				</div>
			{:else}
				<div class="np-art np-art-empty"></div>
				<div class="np-details">
					<div class="np-title np-placeholder">Not Playing</div>
				</div>
			{/if}
		</div>

		<div class="np-center">
			<div class="np-controls">
				<button class="np-ctrl-btn" class:active={shuffle_on} onclick={toggle_shuffle} title="Shuffle">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
				</button>
				<button class="np-ctrl-btn np-skip-btn" onclick={prev_song} title="Previous">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
				</button>
				<button class="np-play-btn" onclick={toggle_play} title={is_playing ? 'Pause' : 'Play'}>
					{#if is_playing}
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
					{:else}
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
					{/if}
				</button>
				<button class="np-ctrl-btn np-skip-btn" onclick={next_song} title="Next">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
				</button>
				<button class="np-ctrl-btn" class:active={repeat_mode !== 'off'} onclick={toggle_repeat} title="Repeat">
					{#if repeat_mode === 'one'}
						<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>
					{:else}
						<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
					{/if}
				</button>
			</div>

			<div class="np-progress-row">
				<span class="np-time">{current_time_display.current}</span>
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="progress-track"
					class:dragging={is_dragging_progress}
					bind:this={progress_track_el}
					onmousedown={handle_progress_mousedown}
				>
					<div class="progress-fill" style:width="{progress}%">
						<div class="progress-thumb"></div>
					</div>
				</div>
				<span class="np-time">{current_time_display.remaining}</span>
			</div>
		</div>

		<div class="np-right">
			<button class="np-ctrl-btn" onclick={() => show_queue = !show_queue} class:active={show_queue} title="Up Next">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>
			</button>

			<div class="volume-container">
				<svg class="volume-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
					{#if volume === 0}
						<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
					{:else if volume < 50}
						<path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
					{:else}
						<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
					{/if}
				</svg>
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="volume-track" onmousedown={handle_volume_mousedown}>
					<div class="volume-fill" style:width="{volume}%">
						<div class="volume-thumb"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/* ── Container ── */
	.container {
		height: 100%;
		width: 100%;
		background-color: var(--system-color-light);
		border-radius: inherit;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		font-family: var(--system-font-family);
		color: var(--system-color-light-contrast);
		font-size: 13px;
	}

	/* ── Titlebar ── */
	.titlebar {
		padding: 8px 12px;
		min-height: 36px;
		background: linear-gradient(to bottom, #f6f6f6, #ededef);
		border-bottom: 1px solid #d1d1d6;
		display: flex;
		align-items: center;
		justify-content: center;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
			border-bottom-color: #1c1c1e;
		}
	}

	.titlebar-controls {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		justify-content: center;
	}

	/* ── Search ── */
	.search-container {
		position: relative;
		max-width: 260px;
		width: 100%;
	}

	.search-icon {
		position: absolute;
		left: 8px;
		top: 50%;
		transform: translateY(-50%);
		color: #86868b;
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 5px 28px 5px 28px;
		border: none;
		border-radius: 6px;
		font-size: 12px;
		background: rgba(0, 0, 0, 0.06);
		color: var(--system-color-light-contrast);
		outline: none;
		font-family: inherit;
		transition: background 0.2s;

		&::placeholder {
			color: #86868b;
		}

		&:focus {
			background: rgba(0, 0, 0, 0.09);
			box-shadow: 0 0 0 2px rgba(250, 45, 72, 0.3);
		}

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.1);

			&:focus {
				background: rgba(255, 255, 255, 0.14);
			}
		}
	}

	.search-clear {
		position: absolute;
		right: 6px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		cursor: pointer;
		color: #86868b;
		display: flex;
		padding: 2px;

		&:hover {
			color: var(--system-color-light-contrast);
		}
	}

	/* ── Main Layout ── */
	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
		position: relative;
	}

	/* ── Sidebar ── */
	.sidebar {
		width: 240px;
		min-width: 240px;
		background: rgba(242, 242, 247, 0.85);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-right: 1px solid #d1d1d6;
		padding: 8px 0;
		overflow-y: auto;

		:global(body.dark) & {
			background: rgba(28, 28, 30, 0.85);
			border-right-color: #38383a;
		}
	}

	.sidebar-section {
		margin-bottom: 4px;
	}

	.sidebar-section-title {
		font-size: 11px;
		font-weight: 700;
		color: #86868b;
		text-transform: uppercase;
		padding: 8px 16px 4px;
		letter-spacing: 0.3px;
	}

	.sidebar-item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: calc(100% - 16px);
		margin: 1px 8px;
		padding: 5px 10px;
		border: none;
		background: none;
		font-size: 13px;
		color: var(--system-color-light-contrast);
		cursor: pointer;
		text-align: left;
		border-radius: 6px;
		transition: background 0.1s;
		height: 30px;
		box-sizing: border-box;

		&:hover {
			background: rgba(0, 0, 0, 0.04);

			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.06);
			}
		}

		&.active {
			background: rgba(250, 45, 72, 0.12);
			color: #fa2d48;
			font-weight: 500;

			:global(body.dark) & {
				background: rgba(250, 45, 72, 0.2);
				color: #ff4d6a;
			}
		}

		&.apple-music-item {
			.sidebar-icon {
				color: #fa2d48;
			}
		}
	}

	.sidebar-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		flex-shrink: 0;
		opacity: 0.65;

		.active & {
			opacity: 1;
			color: #fa2d48;
		}
	}

	/* ── Content ── */
	.content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 20px 24px;
		position: relative;
		transition: margin-right 0.25s ease;

		&.queue-open {
			margin-right: 260px;
		}
	}

	/* ── View transitions ── */
	.view-enter {
		animation: view-fade-in 0.2s ease;
	}

	@keyframes view-fade-in {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.content-header h1 {
		font-size: 26px;
		font-weight: 700;
		margin: 0 0 20px;
	}

	.section-title {
		font-size: 20px;
		font-weight: 700;
		margin: 24px 0 12px;

		&:first-child {
			margin-top: 0;
		}
	}

	/* ── Hero Cards ── */
	.hero-row {
		display: flex;
		gap: 16px;
		overflow-x: auto;
		padding-bottom: 4px;
		scrollbar-width: none;
	}

	.hero-row::-webkit-scrollbar {
		display: none;
	}

	.hero-card {
		flex: 1;
		min-width: 180px;
		border: none;
		background: none;
		cursor: pointer;
		border-radius: 12px;
		overflow: hidden;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

		&:hover {
			transform: scale(1.02);
			box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
		}

		&:active {
			transform: scale(0.99);
		}
	}

	.hero-art {
		width: 100%;
		aspect-ratio: 16 / 9;
		border-radius: 12px;
		position: relative;
		display: flex;
		align-items: flex-end;
	}

	.hero-overlay {
		padding: 16px;
		width: 100%;
		background: linear-gradient(transparent 0%, rgba(0, 0, 0, 0.55) 100%);
		border-radius: 0 0 12px 12px;
	}

	.hero-genre {
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 1.5px;
		color: rgba(255, 255, 255, 0.8);
		text-shadow: 0 1px 3px rgba(0,0,0,0.5);
	}

	.hero-title {
		font-size: 18px;
		font-weight: 700;
		color: white;
		margin-top: 2px;
	}

	.hero-artist {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.8);
		margin-top: 2px;
	}

	/* ── Album Cards ── */
	.album-row {
		display: flex;
		gap: 16px;
		overflow-x: auto;
		padding-bottom: 8px;
		scrollbar-width: none;
	}

	.album-row::-webkit-scrollbar {
		display: none;
	}

	.album-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 20px;
	}

	.album-card {
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		flex-shrink: 0;
		transition: transform 0.2s ease;

		&:hover {
			transform: scale(1.03);

			.album-art {
				box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
			}
		}

		&:active {
			transform: scale(0.98);
		}
	}

	.album-art {
		width: 140px;
		height: 140px;
		border-radius: 8px;
		margin-bottom: 6px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: box-shadow 0.2s ease;

		.album-grid & {
			width: 100%;
			height: auto;
			aspect-ratio: 1;
		}
	}

	.album-art-letter {
		font-size: 36px;
		font-weight: 800;
		color: rgba(255, 255, 255, 0.85);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	}

	/* ── Recently Played Album Art (gradient + title overlay) ── */
	.recent-album-art {
		width: 140px;
		height: 140px;
		border-radius: 8px;
		margin-bottom: 6px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		display: flex;
		align-items: flex-end;
		position: relative;
		overflow: hidden;
		transition: box-shadow 0.2s ease;
	}

	.album-card:hover .recent-album-art {
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
	}

	.recent-album-overlay {
		width: 100%;
		padding: 10px;
		background: linear-gradient(transparent 0%, rgba(0, 0, 0, 0.55) 100%);
	}

	.recent-album-title {
		font-size: 13px;
		font-weight: 700;
		color: white;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.album-card-title {
		font-size: 13px;
		font-weight: 600;
		color: var(--system-color-light-contrast);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 140px;

		.album-grid & {
			max-width: 100%;
		}
	}

	.album-card-artist {
		font-size: 12px;
		color: #86868b;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* ── Playlist Cards ── */
	.playlist-row {
		display: flex;
		gap: 16px;
		overflow-x: auto;
		padding-bottom: 8px;
		scrollbar-width: none;
	}

	.playlist-row::-webkit-scrollbar {
		display: none;
	}

	.playlist-card {
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		flex-shrink: 0;
		transition: transform 0.2s ease;

		&:hover {
			transform: scale(1.03);

			.playlist-art {
				box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
			}
		}
	}

	.playlist-art {
		width: 160px;
		height: 160px;
		border-radius: 8px;
		margin-bottom: 6px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: box-shadow 0.2s ease;
	}

	.playlist-art-icon {
		display: flex;
	}

	.playlist-card-title {
		font-size: 13px;
		font-weight: 600;
		color: var(--system-color-light-contrast);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 160px;
	}

	.playlist-card-desc {
		font-size: 12px;
		color: #86868b;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 160px;
	}

	.playlist-card-large {
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		transition: transform 0.2s ease;

		&:hover {
			transform: scale(1.03);

			.playlist-art-large {
				box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
			}
		}
	}

	.playlist-art-large {
		width: 100%;
		aspect-ratio: 1;
		border-radius: 8px;
		margin-bottom: 6px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: box-shadow 0.2s ease;
	}

	/* ── Radio ── */
	.radio-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 16px;
	}

	.radio-card {
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		transition: transform 0.2s ease;

		&:hover {
			transform: scale(1.02);

			.radio-art {
				box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
			}
		}
	}

	.radio-art {
		width: 100%;
		aspect-ratio: 16 / 9;
		border-radius: 12px;
		margin-bottom: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: box-shadow 0.2s ease;
	}

	.radio-name {
		font-size: 14px;
		font-weight: 600;
		color: var(--system-color-light-contrast);
	}

	.radio-desc {
		font-size: 12px;
		color: #86868b;
	}

	/* ── Artists ── */
	.artists-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.artist-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px;
		border: none;
		background: none;
		cursor: pointer;
		width: 100%;
		text-align: left;
		border-radius: 8px;
		transition: background 0.1s;

		&:hover {
			background: rgba(0, 0, 0, 0.03);

			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.04);
			}
		}
	}

	.artist-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);

		span {
			font-size: 20px;
			font-weight: 700;
			color: rgba(255, 255, 255, 0.9);
		}
	}

	.artist-info {
		min-width: 0;
	}

	.artist-name {
		font-size: 14px;
		font-weight: 600;
		color: var(--system-color-light-contrast);
	}

	.artist-meta {
		font-size: 12px;
		color: #86868b;
	}

	.search-artists-row {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
		margin-bottom: 8px;
	}

	.artist-pill {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 14px 6px 6px;
		border: none;
		background: rgba(0, 0, 0, 0.04);
		border-radius: 20px;
		cursor: pointer;
		font-size: 13px;
		font-weight: 500;
		color: var(--system-color-light-contrast);
		transition: background 0.15s;

		&:hover {
			background: rgba(0, 0, 0, 0.08);
		}

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.08);

			&:hover {
				background: rgba(255, 255, 255, 0.12);
			}
		}
	}

	.artist-pill-avatar {
		width: 28px;
		height: 28px;
		border-radius: 50%;
	}

	/* ── Album Detail ── */
	.album-detail {
		/* no special styling needed */
	}

	.back-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		border: none;
		background: none;
		cursor: pointer;
		color: #fa2d48;
		font-size: 13px;
		font-weight: 500;
		padding: 0;
		margin-bottom: 16px;

		&:hover {
			opacity: 0.8;
		}
	}

	.album-detail-header {
		display: flex;
		gap: 20px;
		margin-bottom: 24px;
		align-items: flex-end;
	}

	.album-detail-art {
		width: 180px;
		height: 180px;
		border-radius: 10px;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.album-detail-letter {
		font-size: 54px;
		font-weight: 800;
		color: rgba(255, 255, 255, 0.85);
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
	}

	.album-detail-info {
		min-width: 0;
		padding-bottom: 4px;
	}

	.album-detail-title {
		font-size: 22px;
		font-weight: 700;
		color: var(--system-color-light-contrast);
	}

	.album-detail-artist {
		font-size: 22px;
		font-weight: 500;
		color: #fa2d48;
		margin-top: 2px;
	}

	.album-detail-meta {
		font-size: 13px;
		color: #86868b;
		margin-top: 4px;
	}

	.album-detail-actions {
		display: flex;
		gap: 10px;
		margin-top: 12px;
	}

	.play-album-btn, .shuffle-album-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 7px 18px;
		border: none;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s, transform 0.1s;

		&:hover {
			opacity: 0.85;
		}

		&:active {
			transform: scale(0.96);
		}
	}

	.play-album-btn {
		background: #fa2d48;
		color: white;
	}

	.shuffle-album-btn {
		background: rgba(0, 0, 0, 0.06);
		color: #fa2d48;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.1);
		}
	}

	.album-song-list .song-row {
		.song-title-col {
			flex: 1;
		}
	}

	/* ── Song List ── */
	.song-list {
		border-top: 1px solid #d1d1d6;

		:global(body.dark) & {
			border-top-color: #38383a;
		}
	}

	.song-header-row {
		display: flex;
		align-items: center;
		padding: 8px 8px;
		font-size: 11px;
		font-weight: 600;
		color: #86868b;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		border-bottom: 1px solid #d1d1d6;

		:global(body.dark) & {
			border-bottom-color: #38383a;
		}
	}

	.song-row {
		display: flex;
		align-items: center;
		padding: 6px 8px;
		width: 100%;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 13px;
		color: var(--system-color-light-contrast);
		text-align: left;
		transition: background 0.1s;
		border-bottom: 1px solid transparent;

		&.odd {
			background: rgba(0, 0, 0, 0.02);

			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.02);
			}
		}

		&:hover {
			background: rgba(0, 0, 0, 0.05);

			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.06);
			}
		}

		&.playing {
			color: #fa2d48;
		}

		&.playing .song-cell-title {
			color: #fa2d48;
		}
	}

	.song-num {
		width: 30px;
		text-align: center;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		color: #86868b;

		.playing & {
			color: #fa2d48;
		}
	}

	.paused-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.song-title-col {
		flex: 2;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.song-artist-col {
		flex: 1.5;
		color: #86868b;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;

		.playing & {
			color: #fa2d48;
			opacity: 0.7;
		}
	}

	.song-album-col {
		flex: 1.5;
		color: #86868b;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.song-duration-col {
		width: 50px;
		text-align: right;
		color: #86868b;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}

	.song-info-cell {
		flex: 2;
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
	}

	.song-art-mini {
		width: 32px;
		height: 32px;
		border-radius: 4px;
		flex-shrink: 0;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.song-cell-title {
		font-size: 13px;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.song-cell-artist {
		font-size: 11px;
		color: #86868b;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* ── Equalizer Animation ── */
	.equalizer {
		display: flex;
		align-items: flex-end;
		gap: 1.5px;
		height: 12px;
	}

	.eq-bar {
		width: 2.5px;
		background: #fa2d48;
		border-radius: 1px;
		will-change: height;

		&:nth-child(1) {
			animation: eq-bounce-1 0.45s ease-in-out infinite alternate;
		}

		&:nth-child(2) {
			animation: eq-bounce-2 0.55s ease-in-out infinite alternate;
		}

		&:nth-child(3) {
			animation: eq-bounce-3 0.5s ease-in-out infinite alternate;
		}
	}

	@keyframes eq-bounce-1 {
		0% { height: 3px; }
		100% { height: 12px; }
	}

	@keyframes eq-bounce-2 {
		0% { height: 8px; }
		50% { height: 3px; }
		100% { height: 10px; }
	}

	@keyframes eq-bounce-3 {
		0% { height: 5px; }
		100% { height: 12px; }
	}

	/* ── Queue Panel ── */
	.queue-panel {
		position: absolute;
		top: 0;
		right: 0;
		width: 260px;
		height: 100%;
		background: rgba(249, 249, 249, 0.95);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border-left: 1px solid #d1d1d6;
		padding: 16px;
		overflow-y: auto;
		animation: slide-in-right 0.25s ease;

		:global(body.dark) & {
			background: rgba(28, 28, 30, 0.95);
			border-left-color: #38383a;
		}
	}

	@keyframes slide-in-right {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	.queue-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;

		h2 {
			font-size: 18px;
			font-weight: 700;
			margin: 0;
		}
	}

	.queue-close {
		background: none;
		border: none;
		cursor: pointer;
		color: #86868b;
		padding: 4px;
		display: flex;
		border-radius: 4px;

		&:hover {
			background: rgba(0, 0, 0, 0.05);
			color: var(--system-color-light-contrast);
		}
	}

	.queue-now-playing-label, .queue-up-next-label {
		font-size: 11px;
		font-weight: 700;
		color: #86868b;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		margin-bottom: 6px;
	}

	.queue-up-next-label {
		margin-top: 16px;
	}

	.queue-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);

		:global(body.dark) & {
			border-bottom-color: rgba(255, 255, 255, 0.05);
		}
	}

	.queue-current {
		background: rgba(250, 45, 72, 0.06);
		border-radius: 6px;
		padding: 8px 6px;
		margin-bottom: 4px;
		border-bottom: none;
	}

	.queue-item-art {
		width: 36px;
		height: 36px;
		border-radius: 4px;
		flex-shrink: 0;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.queue-item-info {
		flex: 1;
		min-width: 0;
	}

	.queue-item-title {
		font-size: 13px;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.queue-item-artist {
		font-size: 11px;
		color: #86868b;
	}

	.queue-item-duration {
		font-size: 11px;
		color: #86868b;
		flex-shrink: 0;
	}

	.queue-remove {
		background: none;
		border: none;
		cursor: pointer;
		color: #86868b;
		padding: 4px;
		display: flex;
		flex-shrink: 0;
		border-radius: 4px;
		opacity: 0;
		transition: opacity 0.15s;

		.queue-item:hover & {
			opacity: 1;
		}

		&:hover {
			color: #fa2d48;
		}
	}

	.queue-empty {
		text-align: center;
		padding: 40px 0;
		color: #86868b;

		p {
			margin: 0;
			font-size: 14px;
		}
	}

	.queue-empty-hint {
		font-size: 12px !important;
		margin-top: 4px !important;
		opacity: 0.6;
	}

	/* ── Empty State ── */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 20px;
		color: #86868b;

		p {
			margin: 12px 0 0;
			font-size: 15px;
		}
	}

	.empty-icon {
		display: flex;
	}

	/* ── Now Playing Bar ── */
	.now-playing {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 16px;
		height: 64px;
		background: rgba(250, 250, 250, 0.9);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border-top: 1px solid rgba(0, 0, 0, 0.08);
		flex-shrink: 0;

		:global(body.dark) & {
			background: rgba(28, 28, 30, 0.9);
			border-top-color: rgba(255, 255, 255, 0.08);
		}
	}

	.np-left {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 220px;
		flex-shrink: 0;
		min-width: 0;
	}

	.np-art {
		width: 40px;
		height: 40px;
		border-radius: 6px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.np-art-empty {
		background: rgba(0, 0, 0, 0.06);
		box-shadow: none;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.08);
		}
	}

	.np-art-letter {
		font-size: 16px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
	}

	.np-details {
		min-width: 0;
		flex: 1;
	}

	.np-title {
		font-size: 13px;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.np-placeholder {
		color: #86868b;
		font-weight: 400;
	}

	.np-artist {
		font-size: 11px;
		color: #86868b;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* ── Now Playing Center ── */
	.np-center {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		max-width: 500px;
		margin: 0 auto;
	}

	.np-controls {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.np-ctrl-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--system-color-light-contrast);
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		opacity: 0.5;
		transition: opacity 0.15s, color 0.15s;

		&:hover {
			opacity: 0.85;
		}

		&.active {
			color: #fa2d48;
			opacity: 1;
		}
	}

	.np-skip-btn {
		opacity: 0.7;

		&:hover {
			opacity: 1;
		}
	}

	.np-play-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--system-color-light-contrast);
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		width: 36px;
		height: 36px;
		transition: transform 0.1s;

		&:hover {
			transform: scale(1.1);
		}

		&:active {
			transform: scale(0.92);
		}
	}

	/* ── Progress Bar ── */
	.np-progress-row {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
	}

	.np-time {
		font-size: 10px;
		color: #86868b;
		min-width: 36px;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	.progress-track {
		flex: 1;
		height: 4px;
		background: rgba(0, 0, 0, 0.1);
		border-radius: 2px;
		cursor: pointer;
		position: relative;
		transition: height 0.15s ease;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.12);
		}

		&:hover,
		&.dragging {
			height: 6px;

			.progress-thumb {
				opacity: 1;
				transform: translateY(-50%) scale(1);
			}
		}
	}

	.progress-fill {
		height: 100%;
		background: #fa2d48;
		border-radius: 2px;
		position: relative;
		/* No transition on width to avoid jitter during drag and playback */
	}

	.progress-thumb {
		position: absolute;
		right: -5px;
		top: 50%;
		transform: translateY(-50%) scale(0.5);
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #fa2d48;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
		opacity: 0;
		transition: opacity 0.15s, transform 0.15s;
	}

	/* ── Volume ── */
	.np-right {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 180px;
		flex-shrink: 0;
		justify-content: flex-end;
	}

	.volume-container {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.volume-icon {
		opacity: 0.5;
		flex-shrink: 0;
	}

	.volume-track {
		width: 80px;
		height: 4px;
		background: rgba(0, 0, 0, 0.1);
		border-radius: 2px;
		cursor: pointer;
		position: relative;
		transition: height 0.15s ease;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.12);
		}

		&:hover {
			height: 6px;

			.volume-thumb {
				opacity: 1;
				transform: translateY(-50%) scale(1);
			}
		}
	}

	.volume-fill {
		height: 100%;
		background: var(--system-color-light-contrast);
		border-radius: 2px;
		opacity: 0.4;
		position: relative;
	}

	.volume-thumb {
		position: absolute;
		right: -4px;
		top: 50%;
		transform: translateY(-50%) scale(0.5);
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--system-color-light-contrast);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		opacity: 0;
		transition: opacity 0.15s, transform 0.15s;
	}
</style>
