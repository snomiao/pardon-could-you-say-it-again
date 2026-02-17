const fs = require('fs');
const path = require('path');

const USERSCRIPT_PATH = path.resolve(__dirname, '../../pardon-could-you-say-it-again.user.js');

const TEST_HTML = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Pardon Test Page</title></head>
<body>
  <video id="video" width="320" height="240"></video>
  <input id="input" type="text" placeholder="Input field">
  <textarea id="textarea" placeholder="Textarea"></textarea>
  <div id="editable" contenteditable="true">Editable content</div>
</body>
</html>`;

/**
 * Load the test page and inject the userscript.
 * Clicks the body to ensure the page has keyboard focus.
 */
async function loadPage(page) {
  await page.setContent(TEST_HTML);
  const scriptContent = fs.readFileSync(USERSCRIPT_PATH, 'utf8');
  await page.addScriptTag({ content: scriptContent });
  // Ensure keyboard events reach window listener
  await page.click('body');
}

/**
 * Mock the video element to appear as currently playing
 * and with settable currentTime / playbackRate.
 * Real canvas streams don't allow setting currentTime,
 * so we shadow the properties on the element instance.
 */
async function mockPlayingVideo(page, initialTime = 10) {
  await page.evaluate((t) => {
    const video = document.querySelector('video');
    let _ct = t, _pr = 1;
    Object.defineProperty(video, 'paused', {
      get: () => false,
      configurable: true,
    });
    Object.defineProperty(video, 'currentTime', {
      get: () => _ct,
      set: (v) => { _ct = v; },
      configurable: true,
    });
    Object.defineProperty(video, 'playbackRate', {
      get: () => _pr,
      set: (v) => { _pr = v; },
      configurable: true,
    });
  }, initialTime);
}

/** Return a snapshot of the video element's state. */
async function getVideoState(page) {
  return page.evaluate(() => {
    const v = document.querySelector('video');
    return {
      currentTime: v.currentTime,
      playbackRate: v.playbackRate,
      paused: v.paused,
    };
  });
}

/**
 * Sets up a MutationObserver that resolves with the text content of
 * the next element appended directly to <body>.  Must be called
 * BEFORE the action that creates the tooltip.
 */
async function nextBodyChildText(page) {
  return page.evaluate(
    () =>
      new Promise((resolve) => {
        const timer = setTimeout(() => resolve(null), 2000);
        const ob = new MutationObserver((mutations) => {
          for (const m of mutations) {
            for (const node of m.addedNodes) {
              if (node.nodeType === 1) {
                clearTimeout(timer);
                ob.disconnect();
                resolve(node.textContent);
              }
            }
          }
        });
        ob.observe(document.body, { childList: true });
      }),
  );
}

/** Force-show the floating button container (useful on non-touch desktops). */
async function forceShowButtons(page) {
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const pardonBtn = buttons.find((b) => b.textContent.includes('Pardon'));
    if (pardonBtn) pardonBtn.closest('div').style.display = 'flex';
  });
}

module.exports = { loadPage, mockPlayingVideo, getVideoState, nextBodyChildText, forceShowButtons };
