<script lang="ts">
	type MapType = 'map' | 'satellite' | 'hybrid';
	type FavoritePlace = { name: string; icon: string; address: string };
	type RecentSearch = { name: string; address: string };
	type Guide = { name: string; count: number; color: string };
	type Landmark = {
		name: string;
		color: string;
		text_color: string;
		x: number;
		y: number;
		w: number;
		h: number;
	};

	let search_query = $state('');
	let zoom_level = $state(12);
	let map_type = $state<MapType>('map');
	let sidebar_open = $state(true);

	const favorites: FavoritePlace[] = [
		{ name: 'Home', icon: 'house', address: '1234 Oak Street' },
		{ name: 'Work', icon: 'briefcase', address: '500 Market Street' },
		{ name: 'School', icon: 'graduation', address: '200 University Ave' },
	];

	const recents: RecentSearch[] = [
		{ name: 'Golden Gate Park', address: 'San Francisco, CA' },
		{ name: 'Ferry Building', address: 'The Embarcadero, SF' },
		{ name: 'Twin Peaks', address: 'Twin Peaks Blvd, SF' },
		{ name: 'Dolores Park', address: 'Dolores St & 19th, SF' },
		{ name: 'Fisherman\'s Wharf', address: 'Beach St, SF' },
	];

	const guides: Guide[] = [
		{ name: 'City Highlights', count: 12, color: '#ff9500' },
		{ name: 'Food & Drink', count: 8, color: '#ff3b30' },
	];

	const neighborhoods: Landmark[] = [
		{ name: 'Downtown', color: '#d1c4b0', text_color: '#6b5b4a', x: 38, y: 32, w: 18, h: 14 },
		{ name: 'Marina', color: '#c5d5c0', text_color: '#4a6b45', x: 15, y: 12, w: 16, h: 10 },
		{ name: 'Mission', color: '#d4c0c0', text_color: '#6b4a4a', x: 55, y: 60, w: 14, h: 12 },
		{ name: 'SoMa', color: '#c0c5d4', text_color: '#4a4f6b', x: 58, y: 36, w: 15, h: 10 },
	];

	// Streets data: percent positions
	const h_streets = [20, 35, 50, 65, 80];
	const v_streets = [18, 33, 48, 63, 78];

	// Major roads
	const major_h = [35, 65];
	const major_v = [48];

	const scale = $derived(0.5 + (zoom_level / 20) * 1.5);

	const map_bg = $derived.by(() => {
		if (map_type === 'satellite') return '#2a3a2a';
		if (map_type === 'hybrid') return '#3a4a3a';
		return '#f0e8df';
	});

	const road_color = $derived.by(() => {
		if (map_type === 'satellite') return 'rgba(80, 80, 80, 0.6)';
		if (map_type === 'hybrid') return 'rgba(255, 255, 255, 0.3)';
		return '#ffffff';
	});

	const road_border = $derived.by(() => {
		if (map_type === 'satellite') return 'rgba(60, 60, 60, 0.4)';
		if (map_type === 'hybrid') return 'rgba(255, 255, 255, 0.15)';
		return '#d1d1d6';
	});

	const water_color = $derived.by(() => {
		if (map_type === 'satellite') return '#1a3a5a';
		if (map_type === 'hybrid') return '#1a4a6a';
		return '#a8d4f0';
	});

	const park_color = $derived.by(() => {
		if (map_type === 'satellite') return '#1a4a1a';
		if (map_type === 'hybrid') return '#2a5a2a';
		return '#b8dfa9';
	});

	const label_color = $derived(map_type === 'map' ? '#1c1c1e' : '#ffffff');

	function zoom_in() {
		if (zoom_level < 20) zoom_level += 1;
	}

	function zoom_out() {
		if (zoom_level > 1) zoom_level -= 1;
	}

	function handle_wheel(e: WheelEvent) {
		if (e.deltaY < 0) zoom_in();
		else zoom_out();
	}

	function favorite_icon(icon: string): string {
		if (icon === 'house') return 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z';
		if (icon === 'briefcase') return 'M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 0h-4V4h4v2z';
		return 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3 1 9l11 6 9-4.91V17h2V9L12 3z';
	}
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar">
		<div class="toolbar-left">
			<button class="icon-btn" onclick={() => sidebar_open = !sidebar_open} title="Toggle sidebar">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
					<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
				</svg>
			</button>
			<div class="search-container">
				<svg class="search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
				</svg>
				<input
					type="text"
					bind:value={search_query}
					placeholder="Search Maps"
				/>
				{#if search_query}
					<button class="search-clear" onclick={() => search_query = ''}>
						<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
					</button>
				{/if}
			</div>
		</div>
		<div class="toolbar-center">
			<div class="segmented-control">
				<button
					class="segment"
					class:active={map_type === 'map'}
					onclick={() => map_type = 'map'}
				>Map</button>
				<button
					class="segment"
					class:active={map_type === 'satellite'}
					onclick={() => map_type = 'satellite'}
				>Satellite</button>
				<button
					class="segment"
					class:active={map_type === 'hybrid'}
					onclick={() => map_type = 'hybrid'}
				>Hybrid</button>
			</div>
		</div>
		<div class="toolbar-right">
			<button class="icon-btn" title="Current location">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
				</svg>
			</button>
		</div>
	</header>

	<div class="main-content">
		{#if sidebar_open}
			<aside class="sidebar">
				<div class="sidebar-section">
					<div class="sidebar-section-title">Favorites</div>
					{#each favorites as fav}
						<button class="sidebar-item">
							<span class="sidebar-icon fav-icon">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
									<path d={favorite_icon(fav.icon)}/>
								</svg>
							</span>
							<div class="sidebar-item-text">
								<span class="item-name">{fav.name}</span>
								<span class="item-detail">{fav.address}</span>
							</div>
						</button>
					{/each}
				</div>

				<div class="sidebar-section">
					<div class="sidebar-section-title">Recents</div>
					{#each recents as recent}
						<button class="sidebar-item">
							<span class="sidebar-icon recent-icon">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
									<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
								</svg>
							</span>
							<div class="sidebar-item-text">
								<span class="item-name">{recent.name}</span>
								<span class="item-detail">{recent.address}</span>
							</div>
						</button>
					{/each}
				</div>

				<div class="sidebar-section">
					<div class="sidebar-section-title">Guides</div>
					{#each guides as guide}
						<button class="sidebar-item">
							<span class="sidebar-icon guide-icon" style:background-color={guide.color}>
								<svg width="10" height="10" viewBox="0 0 24 24" fill="white">
									<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
								</svg>
							</span>
							<div class="sidebar-item-text">
								<span class="item-name">{guide.name}</span>
								<span class="item-detail">{guide.count} places</span>
							</div>
						</button>
					{/each}
				</div>
			</aside>
		{/if}

		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="map-area" onwheel={handle_wheel}>
			<div
				class="map-canvas"
				style:background-color={map_bg}
				style:transform="scale({scale})"
			>
				<!-- Grid of streets -->
				{#each h_streets as y}
					<div
						class="street h-street"
						class:major={major_h.includes(y)}
						style:top="{y}%"
						style:background-color={road_color}
						style:border-color={road_border}
					></div>
				{/each}
				{#each v_streets as x}
					<div
						class="street v-street"
						class:major={major_v.includes(x)}
						style:left="{x}%"
						style:background-color={road_color}
						style:border-color={road_border}
					></div>
				{/each}

				<!-- Water area (bay/ocean) -->
				<div class="area water-area" style:background-color={water_color}>
					{#if map_type === 'map'}
						<span class="area-label water-label">Bay</span>
					{/if}
				</div>

				<!-- Parks -->
				<div class="area park-area park-1" style:background-color={park_color}>
					{#if map_type !== 'satellite'}
						<span class="area-label park-label">Golden Gate Park</span>
					{/if}
				</div>
				<div class="area park-area park-2" style:background-color={park_color}></div>

				<!-- Neighborhoods -->
				{#each neighborhoods as hood}
					<div
						class="neighborhood"
						style:left="{hood.x}%"
						style:top="{hood.y}%"
						style:width="{hood.w}%"
						style:height="{hood.h}%"
						style:background-color={map_type === 'map' ? hood.color : 'transparent'}
						style:border-color={map_type === 'map' ? 'rgba(0,0,0,0.06)' : 'transparent'}
					>
						<span class="hood-label" style:color={map_type === 'map' ? hood.text_color : label_color}>
							{hood.name}
						</span>
					</div>
				{/each}

				<!-- Location pin (center) -->
				<div class="center-pin">
					<div class="pin-dot"></div>
					<div class="pin-ring"></div>
					<div class="pin-label" style:color={label_color}>Current Location</div>
				</div>

				<!-- Additional landmarks -->
				<div class="landmark" style:left="22%" style:top="55%">
					<div class="landmark-dot" style:background="#ff9500"></div>
					<span class="landmark-name" style:color={label_color}>Cafe Luna</span>
				</div>
				<div class="landmark" style:left="70%" style:top="25%">
					<div class="landmark-dot" style:background="#ff3b30"></div>
					<span class="landmark-name" style:color={label_color}>City Hall</span>
				</div>
				<div class="landmark" style:left="75%" style:top="70%">
					<div class="landmark-dot" style:background="#5856d6"></div>
					<span class="landmark-name" style:color={label_color}>Library</span>
				</div>
			</div>

			<!-- Zoom controls -->
			<div class="zoom-controls">
				<button class="zoom-btn" onclick={zoom_in}>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
						<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
					</svg>
				</button>
				<button class="zoom-btn" onclick={zoom_out}>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
						<path d="M19 13H5v-2h14v2z"/>
					</svg>
				</button>
			</div>

			<!-- Location button (on map) -->
			<button class="location-btn" title="Center on current location">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
					<path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/>
				</svg>
			</button>

			<!-- Map info bar -->
			<div class="map-info" class:dark-info={map_type !== 'map'}>
				<span>37.7749° N, 122.4194° W</span>
				<span class="info-sep">|</span>
				<span>Zoom {zoom_level}x</span>
				<span class="info-sep">|</span>
				<span class="map-type-label">{map_type === 'map' ? 'Standard' : map_type === 'satellite' ? 'Satellite' : 'Hybrid'}</span>
			</div>
		</div>
	</div>
</section>

<style>
	.container {
		height: 100%;
		width: 100%;
		background-color: #e8e0d8;
		border-radius: inherit;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		font-family: var(--system-font-family);
		color: #1c1c1e;

		:global(body.dark) & {
			background-color: #1c1c1e;
			color: #f5f5f7;
		}
	}

	/* ── Toolbar ── */
	.titlebar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 12px;
		min-height: 42px;
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		z-index: 10;
		gap: 12px;

		:global(body.dark) & {
			background: rgba(44, 44, 46, 0.9);
			border-bottom-color: rgba(255, 255, 255, 0.06);
		}
	}

	.toolbar-left {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		min-width: 0;
	}

	.toolbar-center {
		flex-shrink: 0;
	}

	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 6px;
		flex: 1;
		justify-content: flex-end;
	}

	.icon-btn {
		width: 30px;
		height: 30px;
		background: none;
		border: none;
		border-radius: 6px;
		color: #007aff;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-shrink: 0;

		&:hover {
			background: rgba(0, 122, 255, 0.1);
		}
	}

	.search-container {
		position: relative;
		width: 220px;
		max-width: 220px;
		flex-shrink: 0;

		.search-icon {
			position: absolute;
			left: 8px;
			top: 50%;
			transform: translateY(-50%);
			color: #86868b;
			pointer-events: none;
		}

		input {
			width: 100%;
			padding: 6px 28px 6px 26px;
			border: none;
			border-radius: 8px;
			background: rgba(0, 0, 0, 0.06);
			font-size: 13px;
			color: #1c1c1e;
			box-sizing: border-box;

			&:focus {
				outline: 2px solid #007aff;
			}

			&::placeholder {
				color: #86868b;
			}

			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.1);
				color: #f5f5f7;
			}
		}

		.search-clear {
			position: absolute;
			right: 6px;
			top: 50%;
			transform: translateY(-50%);
			background: none;
			border: none;
			color: #86868b;
			cursor: pointer;
			padding: 2px;
			display: flex;
			align-items: center;
		}
	}

	/* Segmented control */
	.segmented-control {
		display: flex;
		background: rgba(0, 0, 0, 0.06);
		border-radius: 7px;
		padding: 2px;
		gap: 1px;

		:global(body.dark) & {
			background: rgba(255, 255, 255, 0.1);
		}
	}

	.segment {
		padding: 4px 12px;
		border: none;
		background: none;
		font-size: 12px;
		font-weight: 500;
		color: #6e6e73;
		cursor: pointer;
		border-radius: 5px;
		transition: all 0.15s;

		&.active {
			background: white;
			color: #1c1c1e;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);

			:global(body.dark) & {
				background: #48484a;
				color: #f5f5f7;
			}
		}

		&:hover:not(.active) {
			color: #1c1c1e;

			:global(body.dark) & {
				color: #f5f5f7;
			}
		}
	}

	/* ── Main layout ── */
	.main-content {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* ── Sidebar ── */
	.sidebar {
		width: 240px;
		min-width: 240px;
		background: rgba(242, 242, 247, 0.92);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-right: 1px solid rgba(0, 0, 0, 0.08);
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
		font-weight: 600;
		color: #86868b;
		padding: 8px 16px 4px;
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.sidebar-item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: calc(100% - 8px);
		margin: 0 4px;
		padding: 3px 6px;
		border: none;
		background: none;
		font-size: 13px;
		color: #1c1c1e;
		cursor: pointer;
		text-align: left;
		border-radius: 6px;
		transition: background 0.1s;

		&:hover {
			background: rgba(0, 0, 0, 0.04);

			:global(body.dark) & {
				background: rgba(255, 255, 255, 0.06);
			}
		}

		:global(body.dark) & {
			color: #f5f5f7;
		}
	}

	.sidebar-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border-radius: 6px;
		flex-shrink: 0;
	}

	.fav-icon {
		background: #007aff;
		color: white;
	}

	.recent-icon {
		color: #86868b;
	}

	.guide-icon {
		border-radius: 50%;
	}

	.sidebar-item-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.item-name {
		font-size: 13px;
		font-weight: 500;
		line-height: 1.3;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-detail {
		font-size: 11px;
		color: #86868b;
		line-height: 1.3;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ── Map area ── */
	.map-area {
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	.map-canvas {
		position: absolute;
		top: -25%;
		left: -25%;
		width: 150%;
		height: 150%;
		transform-origin: center center;
		transition: transform 0.2s ease, background-color 0.3s;
	}

	/* ── Streets ── */
	.street {
		position: absolute;
		z-index: 1;
		transition: background-color 0.3s;
	}

	.h-street {
		left: 0;
		right: 0;
		height: 3px;
		border-top: 0.5px solid;
		border-bottom: 0.5px solid;

		&.major {
			height: 5px;
		}
	}

	.v-street {
		top: 0;
		bottom: 0;
		width: 3px;
		border-left: 0.5px solid;
		border-right: 0.5px solid;

		&.major {
			width: 5px;
		}
	}

	/* ── Areas ── */
	.area {
		position: absolute;
		z-index: 2;
		border-radius: 4px;
		transition: background-color 0.3s;
	}

	.water-area {
		right: 2%;
		top: 5%;
		width: 20%;
		height: 30%;
		border-radius: 8px 2px 12px 4px;
	}

	.park-area {
		border-radius: 6px;
	}

	.park-1 {
		left: 5%;
		top: 40%;
		width: 22%;
		height: 10%;
	}

	.park-2 {
		left: 62%;
		top: 72%;
		width: 10%;
		height: 8%;
	}

	.area-label {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 10px;
		font-weight: 600;
		white-space: nowrap;
		pointer-events: none;
	}

	.water-label {
		color: #3a7ab5;
		font-style: italic;
	}

	.park-label {
		color: #4a8a3a;
		font-size: 8px;
	}

	/* ── Neighborhoods ── */
	.neighborhood {
		position: absolute;
		z-index: 2;
		border-radius: 8px;
		border: 1px solid;
		display: flex;
		justify-content: center;
		align-items: center;
		transition: background-color 0.3s;
	}

	.hood-label {
		font-size: 9px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
		opacity: 0.7;
		pointer-events: none;
	}

	/* ── Center pin ── */
	.center-pin {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 5;
	}

	.pin-dot {
		width: 14px;
		height: 14px;
		background: #007aff;
		border-radius: 50%;
		border: 3px solid white;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
	}

	.pin-ring {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: rgba(0, 122, 255, 0.15);
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: -1;
	}

	.pin-label {
		background: white;
		padding: 3px 8px;
		border-radius: 10px;
		font-size: 10px;
		font-weight: 600;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		white-space: nowrap;
		margin-top: 4px;

		:global(body.dark) & {
			background: #2c2c2e;
		}
	}

	/* ── Landmarks ── */
	.landmark {
		position: absolute;
		z-index: 4;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.landmark-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		border: 1.5px solid white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		flex-shrink: 0;
	}

	.landmark-name {
		font-size: 9px;
		font-weight: 600;
		white-space: nowrap;
		text-shadow: 0 1px 3px rgba(255, 255, 255, 0.8);
	}

	/* ── Controls overlay ── */
	.zoom-controls {
		position: absolute;
		right: 12px;
		bottom: 44px;
		display: flex;
		flex-direction: column;
		gap: 1px;
		z-index: 10;
	}

	.zoom-btn {
		width: 36px;
		height: 36px;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		color: #1c1c1e;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;

		&:first-child {
			border-radius: 8px 8px 0 0;
		}

		&:last-child {
			border-radius: 0 0 8px 8px;
		}

		&:hover {
			background: rgba(255, 255, 255, 1);
		}

		:global(body.dark) & {
			background: rgba(44, 44, 46, 0.9);
			border-color: rgba(255, 255, 255, 0.1);
			color: #f5f5f7;

			&:hover {
				background: rgba(58, 58, 60, 1);
			}
		}
	}

	.location-btn {
		position: absolute;
		right: 12px;
		bottom: 128px;
		width: 36px;
		height: 36px;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		color: #007aff;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10;

		&:hover {
			background: rgba(255, 255, 255, 1);
		}

		:global(body.dark) & {
			background: rgba(44, 44, 46, 0.9);
			border-color: rgba(255, 255, 255, 0.1);

			&:hover {
				background: rgba(58, 58, 60, 1);
			}
		}
	}

	/* ── Info bar ── */
	.map-info {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 6px 12px;
		font-size: 11px;
		color: rgba(0, 0, 0, 0.55);
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 6px;

		&.dark-info {
			background: rgba(0, 0, 0, 0.5);
			color: rgba(255, 255, 255, 0.7);
		}

		:global(body.dark) & {
			background: rgba(28, 28, 30, 0.7);
			color: rgba(255, 255, 255, 0.55);
		}
	}

	.info-sep {
		opacity: 0.3;
	}

	.map-type-label {
		text-transform: capitalize;
	}
</style>
