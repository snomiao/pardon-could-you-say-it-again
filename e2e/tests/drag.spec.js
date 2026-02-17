// @ts-check
const { test, expect } = require('@playwright/test');
const { loadPage, mockPlayingVideo, getVideoState, forceShowButtons } = require('../helpers/setup');

// Run all drag tests with touch support so the buttons are visible by default.
test.use({ hasTouch: true });

/** Helper: get the bounding box of the floating button container. */
async function containerBox(page) {
  return page
    .locator('button')
    .filter({ hasText: 'Pardon' })
    .locator('xpath=..')
    .boundingBox();
}

test.describe('Draggable floating button container', () => {
  test.beforeEach(async ({ page }) => {
    await loadPage(page);
  });

  // ── Initial position ────────────────────────────────────────────────────────

  test('container starts near bottom-center of viewport', async ({ page }) => {
    const { width: vw, height: vh } = page.viewportSize();
    const box = await containerBox(page);

    // Horizontally centered: center of the container within ±20 px of viewport center
    const centerX = box.x + box.width / 2;
    expect(Math.abs(centerX - vw / 2)).toBeLessThan(20);

    // Vertically: container bottom within bottom 300px of viewport
    expect(box.y + box.height).toBeGreaterThan(vh - 300);
  });

  // ── Mouse drag ──────────────────────────────────────────────────────────────

  test('mouse drag moves the container', async ({ page }) => {
    const before = await containerBox(page);
    const cx = before.x + before.width / 2;
    const cy = before.y + before.height / 2;

    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 150, cy - 80, { steps: 10 });
    await page.mouse.up();

    const after = await containerBox(page);
    expect(after.x).toBeCloseTo(before.x + 150, -1); // within ±10 px
    expect(after.y).toBeCloseTo(before.y - 80, -1);
  });

  test('mouse drag over threshold prevents button click action', async ({ page }) => {
    await mockPlayingVideo(page, 10);
    const before = await containerBox(page);
    const cx = before.x + before.width / 2;
    const cy = before.y + before.height / 2;

    // Move well beyond the 6-px threshold without releasing (simulates drag)
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 80, cy + 30, { steps: 10 });
    await page.mouse.up();

    // Video state must not change (drag blocked the click)
    const state = await getVideoState(page);
    expect(state.currentTime).toBeCloseTo(10, 2);
    expect(state.playbackRate).toBeCloseTo(1, 3);
  });

  test('mouse movement under threshold (≤ 4 px) still fires button click', async ({ page }) => {
    await mockPlayingVideo(page, 10);
    const before = await containerBox(page);

    // Click the Pardon button (negligible movement – treated as tap)
    await page.locator('button').filter({ hasText: 'Pardon' }).click({ force: true });

    const state = await getVideoState(page);
    expect(state.playbackRate).toBeCloseTo(0.8, 3);
  });

  test('dragged position is maintained after drag ends', async ({ page }) => {
    const before = await containerBox(page);
    const cx = before.x + before.width / 2;
    const cy = before.y + before.height / 2;

    // Drag to a new position
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 100, cy + 50, { steps: 10 });
    await page.mouse.up();

    // Wait a moment, then verify position has not snapped back
    await page.waitForTimeout(200);
    const after = await containerBox(page);
    expect(after.x).toBeCloseTo(before.x - 100, -1);
  });

  // ── Touch drag (mobile emulation) ───────────────────────────────────────────

  test('touch drag moves the container', async ({ page }) => {
    const before = await containerBox(page);
    const cx = before.x + before.width / 2;
    const cy = before.y + before.height / 2;

    await page.touchscreen.tap(cx, cy); // initial contact
    // Simulate a drag via touch events
    await page.evaluate(
      ([x0, y0, dx, dy]) => {
        const container = document.querySelector('button').closest('div');

        const mkTouch = (x, y) => new Touch({ identifier: 1, target: container, clientX: x, clientY: y });

        container.dispatchEvent(
          new TouchEvent('touchstart', {
            bubbles: true,
            touches: [mkTouch(x0, y0)],
            changedTouches: [mkTouch(x0, y0)],
          }),
        );

        // Simulate incremental touchmove steps
        const steps = 10;
        for (let i = 1; i <= steps; i++) {
          const x = x0 + (dx * i) / steps;
          const y = y0 + (dy * i) / steps;
          container.dispatchEvent(
            new TouchEvent('touchmove', {
              bubbles: true,
              cancelable: true,
              touches: [mkTouch(x, y)],
              changedTouches: [mkTouch(x, y)],
            }),
          );
        }

        container.dispatchEvent(
          new TouchEvent('touchend', {
            bubbles: true,
            touches: [],
            changedTouches: [mkTouch(x0 + dx, y0 + dy)],
          }),
        );
      },
      [cx, cy, 120, -60],
    );

    const after = await containerBox(page);
    expect(after.x).toBeCloseTo(before.x + 120, -1);
    expect(after.y).toBeCloseTo(before.y - 60, -1);
  });

  // ── Usability after drag ─────────────────────────────────────────────────────

  test('buttons remain functional after a mouse drag', async ({ page }) => {
    await mockPlayingVideo(page, 10);
    const before = await containerBox(page);
    const cx = before.x + before.width / 2;
    const cy = before.y + before.height / 2;

    // Drag the container
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 100, cy - 40, { steps: 10 });
    await page.mouse.up();

    // After drag, clicking the Faster button should still work
    await page.locator('button').filter({ hasText: 'Faster' }).click();
    const state = await getVideoState(page);
    expect(state.playbackRate).toBeCloseTo(1.2, 3);
  });
});
