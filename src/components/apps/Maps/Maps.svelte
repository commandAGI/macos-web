<script lang="ts">
	let search_query = $state('');
	let zoom_level = $state(12);

	function zoom_in() {
		if (zoom_level < 20) zoom_level += 1;
	}

	function zoom_out() {
		if (zoom_level > 1) zoom_level -= 1;
	}
</script>

<section class="container">
	<header class="app-window-drag-handle titlebar">
		<div class="search-container">
			<input
				type="text"
				bind:value={search_query}
				placeholder="Search Maps"
			/>
		</div>
	</header>

	<div class="map-area">
		<div class="map-grid">
			{#each Array(20) as _, row}
				{#each Array(20) as _, col}
					<div
						class="grid-cell"
						class:road-h={(row === 5 || row === 10 || row === 15)}
						class:road-v={(col === 5 || col === 10 || col === 15)}
						class:park={row >= 7 && row <= 9 && col >= 7 && col <= 9}
						class:water={row >= 12 && row <= 14 && col >= 2 && col <= 5}
						class:building={(row + col) % 7 === 0 && row !== 5 && row !== 10 && row !== 15 && col !== 5 && col !== 10 && col !== 15}
					></div>
				{/each}
			{/each}

			<div class="center-pin">
				<div class="pin-marker">📍</div>
				<div class="pin-label">Current Location</div>
			</div>
		</div>

		<div class="zoom-controls">
			<button class="zoom-btn" onclick={zoom_in}>+</button>
			<button class="zoom-btn" onclick={zoom_out}>−</button>
		</div>

		<div class="map-info">
			<span>Zoom: {zoom_level}x</span>
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
	}

	.titlebar {
		display: flex;
		justify-content: center;
		padding: 8px 12px;
		min-height: 42px;
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		z-index: 10;
	}

	.search-container {
		width: 300px;

		input {
			width: 100%;
			padding: 6px 12px;
			border: none;
			border-radius: 8px;
			background: rgba(0, 0, 0, 0.06);
			font-size: 13px;
			color: #1c1c1e;
			text-align: center;

			&:focus {
				outline: 2px solid #007aff;
				text-align: left;
			}

			&::placeholder {
				color: #86868b;
			}
		}
	}

	.map-area {
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	.map-grid {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: grid;
		grid-template-columns: repeat(20, 1fr);
		grid-template-rows: repeat(20, 1fr);
	}

	.grid-cell {
		background-color: #f0e8df;
		border: 0.5px solid rgba(0, 0, 0, 0.03);
	}

	.road-h {
		background-color: #ffffff !important;
		border-top: 1px solid #d1d1d6;
		border-bottom: 1px solid #d1d1d6;
	}

	.road-v {
		background-color: #ffffff !important;
		border-left: 1px solid #d1d1d6;
		border-right: 1px solid #d1d1d6;
	}

	.park {
		background-color: #b8dfa9 !important;
	}

	.water {
		background-color: #a8d4f0 !important;
	}

	.building {
		background-color: #e0d8cf;
	}

	.center-pin {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 5;
	}

	.pin-marker {
		font-size: 28px;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.pin-label {
		background: white;
		padding: 4px 10px;
		border-radius: 12px;
		font-size: 11px;
		font-weight: 600;
		color: #1c1c1e;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		white-space: nowrap;
		margin-top: -4px;
	}

	.zoom-controls {
		position: absolute;
		right: 12px;
		bottom: 40px;
		display: flex;
		flex-direction: column;
		gap: 1px;
		z-index: 10;
	}

	.zoom-btn {
		width: 36px;
		height: 36px;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		font-size: 18px;
		font-weight: 300;
		cursor: pointer;
		color: #1c1c1e;
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
	}

	.map-info {
		position: absolute;
		bottom: 8px;
		left: 12px;
		font-size: 11px;
		color: rgba(0, 0, 0, 0.5);
		z-index: 10;
	}
</style>
