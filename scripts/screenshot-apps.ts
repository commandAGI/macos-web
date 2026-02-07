/**
 * Headless screenshot script for macOS simulator apps.
 *
 * Takes screenshots of each app in its default state, then EXPLORES the app
 * by clicking sidebar items, switching views, and navigating to different sections.
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

import { chromium, type Page, type ElementHandle } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const SCREENSHOT_DIR = join(import.meta.dirname ?? '.', '..', 'screenshots');
const BASE_URL = process.env.BASE_URL || 'http://localhost:4199';
const VIEWPORT = { width: 1440, height: 900 };

/** Time to wait after opening an app (ms) */
const OPEN_WAIT = 2000;
/** Time to wait after clicking a sidebar/nav item (ms) */
const NAV_WAIT = 1000;

const ALL_APPS = [
  'finder', 'safari', 'terminal', 'notes', 'messages', 'mail',
  'photos', 'music', 'maps', 'system-preferences', 'facetime',
  'reminders', 'news', 'podcasts', 'tv', 'contacts', 'keynote',
  'launchpad', 'calculator', 'calendar',
];

// ---------------------------------------------------------------------------
// Exploration configs per app
// ---------------------------------------------------------------------------

type ExploreStep = {
  /** Screenshot suffix, e.g. "documents" => "01-finder-documents.png" */
  name: string;
  /** Action to perform before taking the screenshot */
  action: (page: Page, windowEl: ElementHandle | null) => Promise<void>;
};

/**
 * For each app, define the exploration steps beyond the default screenshot.
 * If an app is not listed here, only the default screenshot is taken.
 */
const EXPLORATIONS: Record<string, ExploreStep[]> = {
  finder: [
    {
      name: 'documents',
      action: async (page, win) => {
        await clickSidebarItem(page, win, 'Documents');
      },
    },
    {
      name: 'desktop',
      action: async (page, win) => {
        await clickSidebarItem(page, win, 'Desktop');
      },
    },
    {
      name: 'icons-view',
      action: async (page, win) => {
        // Click the icon-view button in the toolbar (first view-btn)
        const scope = win ?? page;
        const iconViewBtn = await findElement(scope, '.view-btn[title="Icon view"]');
        if (iconViewBtn) {
          await iconViewBtn.click();
          await page.waitForTimeout(NAV_WAIT);
        }
      },
    },
  ],

  safari: [
    {
      name: 'bookmarks-sidebar',
      action: async (page, win) => {
        // Click the sidebar toggle button (nav-btn with "Toggle sidebar" aria-label)
        const scope = win ?? page;
        const toggleBtn = await findElement(scope, 'button[aria-label="Toggle sidebar"]');
        if (toggleBtn) {
          await toggleBtn.click();
          await page.waitForTimeout(NAV_WAIT);
        }
      },
    },
  ],

  terminal: [
    {
      name: 'ls-command',
      action: async (page, _win) => {
        // Type a command in the terminal input
        await page.keyboard.type('ls -la', { delay: 50 });
        await page.keyboard.press('Enter');
        await page.waitForTimeout(NAV_WAIT);
      },
    },
  ],

  notes: [
    {
      name: 'second-note',
      action: async (page, win) => {
        // Click the second note-card in the note list
        const scope = win ?? page;
        const noteCards = await findAllElements(scope, '.note-card');
        if (noteCards.length >= 2) {
          await noteCards[1].click();
          await page.waitForTimeout(NAV_WAIT);
        }
      },
    },
  ],

  music: [
    {
      name: 'artists',
      action: async (page, win) => {
        await clickSidebarItem(page, win, 'Artists');
      },
    },
    {
      name: 'albums',
      action: async (page, win) => {
        await clickSidebarItem(page, win, 'Albums');
      },
    },
  ],

  'system-preferences': [
    {
      name: 'wifi',
      action: async (page, win) => {
        await clickSidebarItem(page, win, 'Wi-Fi');
      },
    },
    {
      name: 'general',
      action: async (page, win) => {
        await clickSidebarItem(page, win, 'General');
      },
    },
    {
      name: 'desktop-dock',
      action: async (page, win) => {
        await clickSidebarItem(page, win, 'Desktop & Dock');
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Find a single element scoped to a parent (ElementHandle or Page).
 */
async function findElement(
  scope: ElementHandle | Page,
  selector: string,
): Promise<ElementHandle<Element> | null> {
  if ('$' in scope) {
    return scope.$(selector);
  }
  return null;
}

/**
 * Find all elements scoped to a parent (ElementHandle or Page).
 */
async function findAllElements(
  scope: ElementHandle | Page,
  selector: string,
): Promise<ElementHandle<Element>[]> {
  if ('$$' in scope) {
    return scope.$$(selector);
  }
  return [];
}

/**
 * Click a sidebar item by its text label, scoped to a window element.
 * Searches for buttons with class "sidebar-item" or "folder-item"
 * that contain the given text.
 */
async function clickSidebarItem(
  page: Page,
  windowEl: ElementHandle | null,
  label: string,
): Promise<boolean> {
  // Try to find the button within the window scope
  const scope = windowEl ?? page;
  const buttons = await findAllElements(scope, 'button.sidebar-item, button.folder-item');

  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && text.trim().includes(label)) {
      await btn.click();
      await page.waitForTimeout(NAV_WAIT);
      return true;
    }
  }

  // Fallback: use page-level locator with text matching
  try {
    const locator = page.locator(
      `button.sidebar-item:has-text("${label}"), button.folder-item:has-text("${label}")`,
    );
    if (await locator.count() > 0) {
      await locator.first().click();
      await page.waitForTimeout(NAV_WAIT);
      return true;
    }
  } catch {
    // ignore
  }

  console.log(`    (sidebar item "${label}" not found)`);
  return false;
}

/**
 * Get the window section element for a given app by finding the
 * .tl-container.{appId} and walking up to the parent <section>.
 */
async function getWindowElement(
  page: Page,
  appId: string,
): Promise<ElementHandle | null> {
  const tlEl = await page.$(`.tl-container.${appId}`);
  if (!tlEl) return null;

  const windowSection = await tlEl.evaluateHandle((el: Element) => {
    let node = el.parentElement;
    while (node && node.tagName !== 'SECTION') {
      node = node.parentElement;
    }
    return node || el.parentElement;
  });

  return windowSection.asElement();
}

/**
 * Take a window-cropped screenshot for an app.
 * For launchpad, takes a full-page screenshot instead.
 */
async function takeAppScreenshot(
  page: Page,
  appId: string,
  filePath: string,
): Promise<void> {
  if (appId === 'launchpad') {
    // Launchpad is a full-screen overlay, screenshot entire viewport
    await page.screenshot({ path: filePath });
    return;
  }

  const windowEl = await getWindowElement(page, appId);
  if (windowEl) {
    await (windowEl as any).screenshot({ path: filePath });
  } else {
    // Fallback to full page screenshot
    await page.screenshot({ path: filePath });
  }
}

/**
 * Open an app by clicking its dock button.
 */
async function openApp(page: Page, appId: string): Promise<void> {
  const dockBtn = page.locator(`button.${appId}`);

  if (await dockBtn.count() > 0) {
    await dockBtn.click();
  } else {
    // Fallback: try finding by class on dock-open-app-button
    await page.evaluate((id: string) => {
      const allBtns = document.querySelectorAll('button.dock-open-app-button');
      for (const btn of allBtns) {
        if (btn.classList.contains(id)) {
          (btn as HTMLElement).click();
          return;
        }
      }
    }, appId);
  }

  await page.waitForTimeout(OPEN_WAIT);
}

/**
 * Close an app by hovering the traffic lights and clicking the close button.
 */
async function closeApp(page: Page, appId: string): Promise<void> {
  try {
    const tlContainer = await page.$(`.tl-container.${appId}`);
    if (tlContainer) {
      await tlContainer.hover();
      await page.waitForTimeout(300);
      const closeBtn = await page.$(`.tl-container.${appId} button:first-child`);
      if (closeBtn) {
        await closeBtn.click();
      }
    }
  } catch {
    // Ignore close errors
  }
  await page.waitForTimeout(500);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

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
      // 1. Open the app
      await openApp(page, appId);

      // 2. Take default screenshot
      const defaultPath = join(SCREENSHOT_DIR, `${prefix}-${appId}-default.png`);
      await takeAppScreenshot(page, appId, defaultPath);
      console.log(`  default -> ${prefix}-${appId}-default.png`);

      // 3. Explore the app (if exploration steps are defined)
      const steps = EXPLORATIONS[appId];
      if (steps && steps.length > 0) {
        for (const step of steps) {
          console.log(`  exploring: ${step.name}`);
          try {
            // Get the window element (re-fetch for each step in case DOM changed)
            const windowEl = await getWindowElement(page, appId);

            // Perform the exploration action
            await step.action(page, windowEl);

            // Take the exploration screenshot
            const stepPath = join(SCREENSHOT_DIR, `${prefix}-${appId}-${step.name}.png`);
            await takeAppScreenshot(page, appId, stepPath);
            console.log(`  ${step.name} -> ${prefix}-${appId}-${step.name}.png`);
          } catch (err) {
            console.log(`  (explore step "${step.name}" failed: ${err})`);
          }
        }
      }

      // 4. Close the app
      await closeApp(page, appId);
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
