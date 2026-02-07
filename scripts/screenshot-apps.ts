/**
 * Headless screenshot script for macOS simulator apps.
 *
 * Usage:
 *   # In one terminal: npm run preview -- --port 4199
 *   # In another:
 *   npx tsx scripts/screenshot-apps.ts [app1] [app2] ...
 *   npx tsx scripts/screenshot-apps.ts          # screenshots all apps
 *   npx tsx scripts/screenshot-apps.ts finder terminal safari
 *
 * Set BASE_URL env var to override default (http://localhost:4199).
 * Outputs PNG screenshots to screenshots/ directory.
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const SCREENSHOT_DIR = join(import.meta.dirname ?? '.', '..', 'screenshots');
const BASE_URL = process.env.BASE_URL || 'http://localhost:4199';
const VIEWPORT = { width: 1440, height: 900 };

const ALL_APPS = [
  'finder', 'safari', 'terminal', 'notes', 'messages', 'mail',
  'photos', 'music', 'maps', 'system-preferences', 'facetime',
  'reminders', 'news', 'podcasts', 'tv', 'contacts', 'keynote',
  'launchpad', 'devutils', 'preview',
];

async function screenshotApps(appIds: string[]) {
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  console.log(`Launching headless Chromium...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log(`Navigating to ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  // Wait for SvelteKit hydration + boot animation
  await page.waitForTimeout(4000);

  // Take a desktop screenshot
  const desktopPath = join(SCREENSHOT_DIR, '00-desktop.png');
  await page.screenshot({ path: desktopPath });
  console.log(`  [desktop] -> 00-desktop.png`);

  for (let i = 0; i < appIds.length; i++) {
    const appId = appIds[i];
    const prefix = String(i + 1).padStart(2, '0');
    console.log(`\n[${prefix}] Opening: ${appId}`);

    try {
      // Open app via dock button click
      const cssId = appId; // dock buttons have class matching app_id
      const dockBtn = page.locator(`button.${cssId}`);

      if (await dockBtn.count() > 0) {
        await dockBtn.click();
      } else {
        console.log(`  (dock button not found, trying JS)`);
        // Fallback: directly set state
        await page.evaluate((id: string) => {
          // Walk the Svelte component tree to find apps state
          const allBtns = document.querySelectorAll('button.dock-open-app-button');
          for (const btn of allBtns) {
            if (btn.classList.contains(id)) {
              (btn as HTMLElement).click();
              return;
            }
          }
        }, appId);
      }

      await page.waitForTimeout(2000);

      // Full desktop screenshot
      const fullPath = join(SCREENSHOT_DIR, `${prefix}-${appId}-full.png`);
      await page.screenshot({ path: fullPath });
      console.log(`  full   -> ${prefix}-${appId}-full.png`);

      // Try to get just the window
      try {
        // The window wrapper is a <section> and the traffic-light container has .tl-container.{app_id}
        // The section parent of tl-container is the window
        const tlEl = await page.$(`.tl-container.${cssId}`);
        if (tlEl) {
          const windowSection = await tlEl.evaluateHandle((el: Element) => {
            // Walk up to find the section element (window wrapper)
            let node = el.parentElement;
            while (node && node.tagName !== 'SECTION') {
              node = node.parentElement;
            }
            return node || el.parentElement;
          });
          if (windowSection) {
            const windowPath = join(SCREENSHOT_DIR, `${prefix}-${appId}-window.png`);
            await (windowSection as any).screenshot({ path: windowPath });
            console.log(`  window -> ${prefix}-${appId}-window.png`);
          }
        }
      } catch {
        console.log(`  (window crop skipped)`);
      }

      // Close app: hover traffic lights then click close button
      try {
        const tlContainer = await page.$(`.tl-container.${cssId}`);
        if (tlContainer) {
          await tlContainer.hover();
          await page.waitForTimeout(300);
          const closeBtn = await page.$(`.tl-container.${cssId} button:first-child`);
          if (closeBtn) {
            await closeBtn.click();
          }
        }
      } catch {
        // Ignore close errors
      }

      await page.waitForTimeout(500);
    } catch (err) {
      console.error(`  ERROR: ${err}`);
      const errPath = join(SCREENSHOT_DIR, `${prefix}-${appId}-error.png`);
      await page.screenshot({ path: errPath });
    }
  }

  await browser.close();
  console.log(`\nDone! Screenshots in: ${SCREENSHOT_DIR}`);
}

const requestedApps = process.argv.slice(2);
const appsToScreenshot = requestedApps.length > 0
  ? requestedApps.filter(a => ALL_APPS.includes(a))
  : ALL_APPS;

if (appsToScreenshot.length === 0) {
  console.error(`No valid app IDs. Available: ${ALL_APPS.join(', ')}`);
  process.exit(1);
}

screenshotApps(appsToScreenshot).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
