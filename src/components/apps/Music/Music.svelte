<script lang="ts">
	let active_section = $state('songs');
	let is_playing = $state(false);
	let current_song = $state({ title: 'Midnight Drive', artist: 'Neon Waves', album: 'Electric Dreams' });

	const sidebar_items = [
		{ section: 'Apple Music', items: ['Listen Now', 'Browse', 'Radio'] },
		{ section: 'Library', items: ['Recently Added', 'Songs', 'Albums', 'Artists', 'Playlists'] },
	];

	const songs = [
		{ title: 'Midnight Drive', artist: 'Neon Waves', album: 'Electric Dreams', duration: '3:42' },
		{ title: 'Sunset Boulevard', artist: 'Crystal Echoes', album: 'Golden Hour', duration: '4:15' },
		{ title: 'Digital Rain', artist: 'Synth Horizon', album: 'Byte Patterns', duration: '3:58' },
		{ title: 'Ocean Breeze', artist: 'Calm Tides', album: 'Waves', duration: '5:02' },
		{ title: 'City Lights', artist: 'Urban Pulse', album: 'Downtown', duration: '3:31' },
		{ title: 'Morning Coffee', artist: 'Jazz Cats', album: 'Cafe Sessions', duration: '4:44' },
		{ title: 'Stargazer', artist: 'Cosmic Drift', album: 'Nebula', duration: '6:12' },
		{ title: 'Rainy Day', artist: 'Lo-Fi Dreams', album: 'Chill Beats', duration: '3:18' },
	];

	const album_colors = [
		'linear-gradient(135deg, #667eea, #764ba2)',
		'linear-gradient(135deg, #f093fb, #f5576c)',
		'linear-gradient(135deg, #4facfe, #00f2fe)',
		'linear-gradient(135deg, #43e97b, #38f9d7)',
		'linear-gradient(135deg, #fa709a, #fee140)',
		'linear-gradient(135deg, #a18cd1, #fbc2eb)',
	];

	function play_song(song: typeof songs[0]) {
		current_song = song;
		is_playing = true;
	}
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar"></header>

	<div class="main">
		<aside class="sidebar">
			{#each sidebar_items as group}
				<div class="sidebar-section">
					<div class="sidebar-section-title">{group.section}</div>
					{#each group.items as item}
						<button
							class="sidebar-item"
							class:active={active_section === item.toLowerCase().replace(' ', '-')}
							onclick={() => active_section = item.toLowerCase().replace(' ', '-')}
						>
							{item}
						</button>
					{/each}
				</div>
			{/each}
		</aside>

		<div class="content">
			<div class="content-header">
				<h1>Songs</h1>
			</div>

			<div class="album-row">
				{#each album_colors as color, i}
					<button class="album-card">
						<div class="album-art" style:background={color}></div>
						<div class="album-title">{songs[i]?.album || 'Album'}</div>
						<div class="album-artist">{songs[i]?.artist || 'Artist'}</div>
					</button>
				{/each}
			</div>

			<div class="song-list">
				<div class="song-header-row">
					<span class="song-num">#</span>
					<span class="song-title-col">Title</span>
					<span class="song-artist-col">Artist</span>
					<span class="song-album-col">Album</span>
					<span class="song-duration-col">Time</span>
				</div>
				{#each songs as song, i}
					<button
						class="song-row"
						class:playing={current_song.title === song.title}
						onclick={() => play_song(song)}
					>
						<span class="song-num">{current_song.title === song.title && is_playing ? '♫' : i + 1}</span>
						<span class="song-title-col">{song.title}</span>
						<span class="song-artist-col">{song.artist}</span>
						<span class="song-album-col">{song.album}</span>
						<span class="song-duration-col">{song.duration}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>

	<div class="now-playing">
		<div class="np-info">
			<div class="np-art" style:background={album_colors[0]}></div>
			<div class="np-details">
				<div class="np-title">{current_song.title}</div>
				<div class="np-artist">{current_song.artist}</div>
			</div>
		</div>
		<div class="np-controls">
			<button class="np-btn">⏮</button>
			<button class="np-btn play-btn" onclick={() => is_playing = !is_playing}>
				{is_playing ? '⏸' : '▶'}
			</button>
			<button class="np-btn">⏭</button>
		</div>
		<div class="np-progress">
			<div class="progress-bar">
				<div class="progress-fill" style:width="35%"></div>
			</div>
			<div class="progress-times">
				<span>1:18</span>
				<span>-2:24</span>
			</div>
		</div>
	</div>
</section>

<style>
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

	.titlebar {
		padding: 12px;
		min-height: 36px;
		background: linear-gradient(to bottom, #f6f6f6, #ededef);
		border-bottom: 1px solid #d1d1d6;

		:global(body.dark) & {
			background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
			border-bottom-color: #1c1c1e;
		}
	}

	.main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.sidebar {
		width: 200px;
		min-width: 200px;
		background: #f2f2f7;
		border-right: 1px solid #d1d1d6;
		padding: 8px 0;
		overflow-y: auto;

		:global(body.dark) & {
			background: #1c1c1e;
			border-right-color: #38383a;
		}
	}

	.sidebar-section {
		margin-bottom: 12px;
	}

	.sidebar-section-title {
		font-size: 11px;
		font-weight: 700;
		color: #86868b;
		text-transform: uppercase;
		padding: 4px 16px;
		letter-spacing: 0.3px;
	}

	.sidebar-item {
		display: block;
		width: 100%;
		padding: 5px 16px;
		border: none;
		background: none;
		font-size: 13px;
		color: var(--system-color-light-contrast);
		cursor: pointer;
		text-align: left;

		&:hover {
			background: rgba(0, 0, 0, 0.04);
		}

		&.active {
			background: #fa2d48;
			color: white;
			font-weight: 500;
		}
	}

	.content {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
	}

	.content-header h1 {
		font-size: 24px;
		font-weight: 700;
		margin: 0 0 16px;
	}

	.album-row {
		display: flex;
		gap: 16px;
		overflow-x: auto;
		padding-bottom: 16px;
		margin-bottom: 16px;
	}

	.album-card {
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		flex-shrink: 0;
	}

	.album-art {
		width: 120px;
		height: 120px;
		border-radius: 8px;
		margin-bottom: 6px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.album-title {
		font-size: 13px;
		font-weight: 600;
		color: var(--system-color-light-contrast);
	}

	.album-artist {
		font-size: 12px;
		color: #86868b;
	}

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

		&:hover {
			background: rgba(0, 0, 0, 0.03);
		}

		&.playing {
			color: #fa2d48;
		}
	}

	.song-num {
		width: 30px;
		text-align: center;
		flex-shrink: 0;
	}

	.song-title-col {
		flex: 2;
		font-weight: 500;
	}

	.song-artist-col {
		flex: 1.5;
		color: #86868b;
	}

	.song-album-col {
		flex: 1.5;
		color: #86868b;
	}

	.song-duration-col {
		width: 50px;
		text-align: right;
		color: #86868b;
	}

	.now-playing {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 8px 16px;
		height: 56px;
		background: #f9f9f9;
		border-top: 1px solid #d1d1d6;

		:global(body.dark) & {
			background: #1c1c1e;
			border-top-color: #38383a;
		}
	}

	.np-info {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 200px;
	}

	.np-art {
		width: 40px;
		height: 40px;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.np-details {
		min-width: 0;
	}

	.np-title {
		font-size: 13px;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.np-artist {
		font-size: 11px;
		color: #86868b;
	}

	.np-controls {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.np-btn {
		background: none;
		border: none;
		font-size: 16px;
		cursor: pointer;
		color: var(--system-color-light-contrast);
		padding: 4px;

		&:hover {
			opacity: 0.7;
		}
	}

	.play-btn {
		font-size: 20px;
	}

	.np-progress {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.progress-bar {
		width: 100%;
		height: 4px;
		background: rgba(0, 0, 0, 0.1);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: #fa2d48;
		border-radius: 2px;
	}

	.progress-times {
		display: flex;
		justify-content: space-between;
		font-size: 10px;
		color: #86868b;
	}
</style>
