// @ts-check
const { test, expect } = require('@playwright/test');
const { loadPage, mockPlayingVideo, getVideoState, nextBodyChildText } = require('../helpers/setup');

test.describe('Keyboard shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await loadPage(page);
    await mockPlayingVideo(page, 10);
  });

  // ── Comma (,) ──────────────────────────────────────────────────────────────

  test('comma rewinds currentTime by 3 seconds', async ({ page }) => {
    await page.keyboard.press(',');
    const { currentTime } = await getVideoState(page);
    expect(currentTime).toBeCloseTo(7, 1);
  });

  test('comma multiplies playbackRate by 0.8', async ({ page }) => {
    await page.keyboard.press(',');
    const { playbackRate } = await getVideoState(page);
    expect(playbackRate).toBeCloseTo(0.8, 3);
  });

  test('pressing comma twice compounds speed reduction (0.8 × 0.8)', async ({ page }) => {
    await page.keyboard.press(',');
    await page.keyboard.press(',');
    const { playbackRate } = await getVideoState(page);
    expect(playbackRate).toBeCloseTo(0.64, 2);
  });

  // ── Period (.) ─────────────────────────────────────────────────────────────

  test('period multiplies playbackRate by 1.2', async ({ page }) => {
    await page.keyboard.press('.');
    const { playbackRate } = await getVideoState(page);
    expect(playbackRate).toBeCloseTo(1.2, 3);
  });

  test('period does not change currentTime', async ({ page }) => {
    await page.keyboard.press('.');
    const { currentTime } = await getVideoState(page);
    expect(currentTime).toBeCloseTo(10, 2);
  });

  test('pressing period twice compounds speed increase (1.2 × 1.2)', async ({ page }) => {
    await page.keyboard.press('.');
    await page.keyboard.press('.');
    const { playbackRate } = await getVideoState(page);
    expect(playbackRate).toBeCloseTo(1.44, 2);
  });

  // ── ArrowLeft ──────────────────────────────────────────────────────────────

  test('arrowLeft rewinds currentTime by 1 second', async ({ page }) => {
    await page.keyboard.press('ArrowLeft');
    const { currentTime } = await getVideoState(page);
    expect(currentTime).toBeCloseTo(9, 1);
  });

  test('arrowLeft does not change playbackRate', async ({ page }) => {
    await page.keyboard.press('ArrowLeft');
    const { playbackRate } = await getVideoState(page);
    expect(playbackRate).toBeCloseTo(1, 3);
  });

  // ── ArrowRight ─────────────────────────────────────────────────────────────

  test('arrowRight immediately bursts playbackRate to 4×', async ({ page }) => {
    // Intercept the setter so we capture the burst the instant it is written,
    // independent of any fake-clock or timing interaction with getVideoState.
    await page.evaluate(() => {
      const video = document.querySelector('video');
      const desc = Object.getOwnPropertyDescriptor(video, 'playbackRate');
      window.__burstSpeed = null;
      Object.defineProperty(video, 'playbackRate', {
        get: desc.get,
        set(v) { desc.set.call(this, v); if (v > 1.5) window.__burstSpeed = v; },
        configurable: true,
      });
    });

    await page.keyboard.press('ArrowRight');

    const burst = await page.evaluate(() => window.__burstSpeed);
    expect(burst).toBeCloseTo(4, 1);
  });

  test('arrowRight resets playbackRate to 1× after 4-second burst', async ({ page }) => {
    // Install fake clock so we can fast-forward the 4-second sleep
    await page.clock.install();

    page.keyboard.press('ArrowRight');

    // Wait for the 4× speed to be applied (real time)
    await page.waitForFunction(() => document.querySelector('video').playbackRate >= 3.9);

    // Fast-forward browser clock past the 4-second wait
    await page.clock.fastForward(5000);

    // Poll until speed resets
    await page.waitForFunction(() => document.querySelector('video').playbackRate <= 1.1);

    const { playbackRate } = await getVideoState(page);
    expect(playbackRate).toBeCloseTo(1, 1);
  });

  test('arrowRight does not change currentTime', async ({ page }) => {
    page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.querySelector('video').playbackRate >= 3.9);
    const { currentTime } = await getVideoState(page);
    expect(currentTime).toBeCloseTo(10, 1);
  });

  // ── Modifier-key exclusions ────────────────────────────────────────────────

  test('Alt+comma is ignored (no video change)', async ({ page }) => {
    await page.keyboard.press('Alt+,');
    const state = await getVideoState(page);
    expect(state.currentTime).toBeCloseTo(10, 2);
    expect(state.playbackRate).toBeCloseTo(1, 3);
  });

  test('Ctrl+period is ignored (no video change)', async ({ page }) => {
    await page.keyboard.press('Control+.');
    const state = await getVideoState(page);
    expect(state.playbackRate).toBeCloseTo(1, 3);
  });

  test('Meta+ArrowLeft is ignored (no video change)', async ({ page }) => {
    await page.keyboard.press('Meta+ArrowLeft');
    const state = await getVideoState(page);
    expect(state.currentTime).toBeCloseTo(10, 2);
  });

  // ── Input-field exclusions ─────────────────────────────────────────────────

  test('comma is ignored when an <input> has focus', async ({ page }) => {
    await page.focus('#input');
    await page.keyboard.press(',');
    const state = await getVideoState(page);
    expect(state.currentTime).toBeCloseTo(10, 2);
    expect(state.playbackRate).toBeCloseTo(1, 3);
  });

  test('period is ignored when a <textarea> has focus', async ({ page }) => {
    await page.focus('#textarea');
    await page.keyboard.press('.');
    const state = await getVideoState(page);
    expect(state.playbackRate).toBeCloseTo(1, 3);
  });

  test('arrowLeft is ignored when a contenteditable element has focus', async ({ page }) => {
    await page.click('#editable');
    await page.keyboard.press('ArrowLeft');
    const state = await getVideoState(page);
    expect(state.currentTime).toBeCloseTo(10, 2);
  });

  // ── Tooltip feedback ───────────────────────────────────────────────────────

  test('comma press shows tooltip with "<-" direction indicator', async ({ page }) => {
    const textPromise = nextBodyChildText(page);
    await page.keyboard.press(',');
    const text = await textPromise;
    expect(text).toContain('<-');
  });

  test('period press shows tooltip with "->" direction indicator', async ({ page }) => {
    const textPromise = nextBodyChildText(page);
    await page.keyboard.press('.');
    const text = await textPromise;
    expect(text).toContain('->');
  });

  test('tooltip contains hh:mm:ss formatted time', async ({ page }) => {
    const textPromise = nextBodyChildText(page);
    await page.keyboard.press(',');
    const text = await textPromise;
    expect(text).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  test('tooltip contains playbackRate in "x0.00" format', async ({ page }) => {
    const textPromise = nextBodyChildText(page);
    await page.keyboard.press(',');
    const text = await textPromise;
    expect(text).toMatch(/x\d+\.\d+/);
  });

  test('tooltip disappears after ~500 ms', async ({ page }) => {
    await page.keyboard.press(',');
    // Wait for the fixed-position tooltip (not the contenteditable div) to appear
    await page.waitForFunction(
      () => [...document.body.querySelectorAll('div')].some(
        (d) => d.style.position === 'fixed' && d.style.top === '50%'
      ),
      { timeout: 500 },
    );
    // Then wait for it to be removed (flashElement removes it after 500 ms)
    await page.waitForFunction(
      () => ![...document.body.querySelectorAll('div')].some(
        (d) => d.style.position === 'fixed' && d.style.top === '50%'
      ),
      { timeout: 1500 },
    );
  });

  // ── No active video fallback ───────────────────────────────────────────────

  test('clicking first video when nothing is playing (no mock)', async ({ page }) => {
    // Override the "playing" mock so the video appears paused again.
    // This avoids double-loading the page which would lose existing mock state.
    await page.evaluate(() => {
      const video = document.querySelector('video');
      Object.defineProperty(video, 'paused', { get: () => true, configurable: true });
      window._videoClicked = false;
      video.addEventListener('click', () => { window._videoClicked = true; }, { once: true });
    });

    // element.click() inside pardon() is synchronous, so the flag is set by
    // the time keyboard.press() resolves.
    await page.keyboard.press(',');

    const wasClicked = await page.evaluate(() => window._videoClicked);
    expect(wasClicked).toBe(true);
  });
});
