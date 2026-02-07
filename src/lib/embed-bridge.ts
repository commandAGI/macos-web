/**
 * PostMessage communication bridge for the macos-web Svelte 5 app.
 *
 * When the app runs inside an iframe on the CommandAGI platform, this module:
 *   - Listens for messages from the parent with `source: 'commandagi-embed'`
 *   - Sends a `simulation-ready` signal on initialization
 *   - Sends periodic heartbeats every 5 seconds
 *   - Handles `screenshot-request` by capturing the page via html2canvas
 *   - Handles `event-forward` with an acknowledgement
 */

import type html2canvasModule from 'html2canvas';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Inbound message shapes sent by the parent (SimulationEmbed). */
interface ScreenshotRequestMessage {
	source: 'commandagi-embed';
	type: 'screenshot-request';
	requestId: string;
}

interface EventForwardMessage {
	source: 'commandagi-embed';
	type: 'event-forward';
	requestId?: string;
	eventType: string;
	payload: Record<string, unknown>;
}

type InboundMessage = ScreenshotRequestMessage | EventForwardMessage;

/** Outbound message shapes sent to the parent. */
interface SimulationReadyMessage {
	source: 'commandagi-simulation';
	type: 'simulation-ready';
	environmentType: 'macos-webapp';
}

interface HeartbeatMessage {
	source: 'commandagi-simulation';
	type: 'heartbeat';
}

interface ScreenshotResponseMessage {
	source: 'commandagi-simulation';
	type: 'screenshot-response';
	requestId: string;
	dataUrl?: string;
	error?: string;
}

interface EventForwardAckMessage {
	source: 'commandagi-simulation';
	type: 'event-forward-ack';
	requestId?: string;
	eventType: string;
}

type OutboundMessage =
	| SimulationReadyMessage
	| HeartbeatMessage
	| ScreenshotResponseMessage
	| EventForwardAckMessage;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function postToParent(message: OutboundMessage): void {
	try {
		window.parent.postMessage(message, '*');
	} catch {
		// Silently ignore -- the parent may not exist (standalone mode).
	}
}

function isInboundMessage(data: unknown): data is InboundMessage {
	return (
		typeof data === 'object' &&
		data !== null &&
		(data as Record<string, unknown>).source === 'commandagi-embed' &&
		typeof (data as Record<string, unknown>).type === 'string'
	);
}

// ---------------------------------------------------------------------------
// Screenshot capture
// ---------------------------------------------------------------------------

/** Lazily loaded html2canvas reference. */
let html2canvas: typeof html2canvasModule | null = null;

async function captureScreenshot(): Promise<string> {
	if (!html2canvas) {
		// Dynamic import so the library is only loaded when actually needed.
		const mod = await import('html2canvas');
		html2canvas = mod.default ?? (mod as unknown as typeof html2canvasModule);
	}

	const canvas = await html2canvas(document.body, {
		// Capture at the actual iframe dimensions, no scaling.
		scale: 1,
		useCORS: true,
		allowTaint: true,
		logging: false,
		width: window.innerWidth,
		height: window.innerHeight,
		windowWidth: window.innerWidth,
		windowHeight: window.innerHeight,
	});

	return canvas.toDataURL('image/png', 0.8);
}

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------

async function handleMessage(event: MessageEvent): Promise<void> {
	const { data } = event;

	if (!isInboundMessage(data)) {
		return;
	}

	switch (data.type) {
		case 'screenshot-request': {
			try {
				const dataUrl = await captureScreenshot();
				postToParent({
					source: 'commandagi-simulation',
					type: 'screenshot-response',
					requestId: data.requestId,
					dataUrl,
				});
			} catch (err) {
				postToParent({
					source: 'commandagi-simulation',
					type: 'screenshot-response',
					requestId: data.requestId,
					error: err instanceof Error ? err.message : String(err),
				});
			}
			break;
		}

		case 'event-forward': {
			postToParent({
				source: 'commandagi-simulation',
				type: 'event-forward-ack',
				requestId: data.requestId,
				eventType: data.eventType,
			});
			break;
		}

		default:
			// Unknown message type -- ignore.
			break;
	}
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Initialise the embed bridge.
 *
 * Safe to call in non-iframe contexts: the messages simply go nowhere.
 * Returns a cleanup function that removes listeners and stops the heartbeat.
 */
export function initEmbedBridge(): () => void {
	// Listen for parent messages.
	window.addEventListener('message', handleMessage);

	// Notify parent that the simulation is ready.
	postToParent({
		source: 'commandagi-simulation',
		type: 'simulation-ready',
		environmentType: 'macos-webapp',
	});

	// Start heartbeat (every 5 seconds).
	heartbeatTimer = setInterval(() => {
		postToParent({
			source: 'commandagi-simulation',
			type: 'heartbeat',
		});
	}, 5_000);

	// Return cleanup function.
	return () => {
		window.removeEventListener('message', handleMessage);
		if (heartbeatTimer !== null) {
			clearInterval(heartbeatTimer);
			heartbeatTimer = null;
		}
	};
}
