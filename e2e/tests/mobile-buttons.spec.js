// @ts-check
const { test, expect } = require('@playwright/test');
const { loadPage, mockPlayingVideo, getVideoState } = require('../helpers/setup');

// ── Visibility on non-touch (desktop) ─────────────────────────────────────────

test.describe('Buttons hidden on non-touch desktop', () => {
  test.use({ hasTouch: false });

  test('floating buttons are not visible on desktop', async ({ page }) => {
    await loadPage(page);
    const pardonBtn = page.locator('button').filter({ hasText: 'Pardon' });
    await expect(pardonBtn).toBeHidden();
  });

  test('floating buttons become visible after first touchstart event', async ({ page }) => {
    await loadPage(page);
    const pardonBtn = page.locator('button').filter({ hasText: 'Pardon' });
    await expect(pardonBtn).toBeHidden();

    // Simulate a touchstart event on document (the once-listener watches for this)
    await page.evaluate(() => document.dispatchEvent(new Event('touchstart')));

    await expect(pardonBtn).toBeVisible();
  });
});

// ── Visibility and actions on touch device ─────────────────────────────────────

test.describe('Touch device buttons', () => {
  test.use({ hasTouch: true });

  test.beforeEach(async ({ page }) => {
    await loadPage(page);
  });

  test('⏪ Pardon button is visible on touch device', async ({ page }) => {
    const btn = page.locator('button').filter({ hasText: 'Pardon' });
    await expect(btn).toBeVisible();
  });

  test('⏩ Faster button is visible on touch device', async ({ page }) => {
    const btn = page.locator('button').filter({ hasText: 'Faster' });
    await expect(btn).toBeVisible();
  });

  test('button labels are "⏪ Pardon" and "⏩ Faster"', async ({ page }) => {
    const buttons = page.locator('button');
    await expect(buttons.filter({ hasText: '⏪ Pardon' })).toBeVisible();
    await expect(buttons.filter({ hasText: '⏩ Faster' })).toBeVisible();
  });

  test('both buttons are rendered side-by-side (flex row)', async ({ page }) => {
    const pardonBox = await page.locator('button').filter({ hasText: 'Pardon' }).boundingBox();
    const fasterBox = await page.locator('button').filter({ hasText: 'Faster' }).boundingBox();
    // Same vertical center (same row)
    expect(Math.abs(pardonBox.y - fasterBox.y)).toBeLessThan(5);
    // Pardon is to the left of Faster
    expect(pardonBox.x).toBeLessThan(fasterBox.x);
  });

  test('container is positioned near the bottom of the viewport', async ({ page }) => {
    const viewportHeight = page.viewportSize().height;
    const container = page
      .locator('button')
      .filter({ hasText: 'Pardon' })
      .locator('xpath=..');
    const box = await container.boundingBox();
    // Bottom of container should be within 200px from bottom of viewport
    expect(box.y + box.height).toBeGreaterThan(viewportHeight - 200);
  });

  test('container is horizontally centered on the viewport', async ({ page }) => {
    const viewportWidth = page.viewportSize().width;
    const container = page
      .locator('button')
      .filter({ hasText: 'Pardon' })
      .locator('xpath=..');
    const box = await container.boundingBox();
    const centerX = box.x + box.width / 2;
    expect(Math.abs(centerX - viewportWidth / 2)).toBeLessThan(20);
  });

  // ── Button actions ───────────────────────────────────────────────────────────

  test('⏪ Pardon button rewinds currentTime by 3 seconds', async ({ page }) => {
    await mockPlayingVideo(page, 10);
    await page.locator('button').filter({ hasText: 'Pardon' }).click();
    const { currentTime } = await getVideoState(page);
    expect(currentTime).toBeCloseTo(7, 1);
  });

  test('⏪ Pardon button multiplies playbackRate by 0.8', async ({ page }) => {
    await mockPlayingVideo(page, 10);
    await page.locator('button').filter({ hasText: 'Pardon' }).click();
    const { playbackRate } = await getVideoState(page);
    expect(playbackRate).toBeCloseTo(0.8, 3);
  });

  test('⏩ Faster button multiplies playbackRate by 1.2', async ({ page }) => {
    await mockPlayingVideo(page, 10);
    await page.locator('button').filter({ hasText: 'Faster' }).click();
    const { playbackRate } = await getVideoState(page);
    expect(playbackRate).toBeCloseTo(1.2, 3);
  });

  test('⏩ Faster button does not change currentTime', async ({ page }) => {
    await mockPlayingVideo(page, 10);
    await page.locator('button').filter({ hasText: 'Faster' }).click();
    const { currentTime } = await getVideoState(page);
    expect(currentTime).toBeCloseTo(10, 2);
  });

  test('multiple Pardon clicks compound speed reduction', async ({ page }) => {
    await mockPlayingVideo(page, 10);
    const pardonBtn = page.locator('button').filter({ hasText: 'Pardon' });
    await pardonBtn.click();
    await pardonBtn.click();
    const { playbackRate } = await getVideoState(page);
    expect(playbackRate).toBeCloseTo(0.64, 2);
  });
});
