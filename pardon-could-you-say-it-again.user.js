// ==UserScript==
// @name        Pardon, could you say it again?
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       none
// @version     1.0
// @author      -
// @description Press . or , to replay the last sentence slowly at 0.6x speed in any video/audio site like YouTube, Bilibili, or Spotify. This is useful when you're learning a language and want to ensure you understand every sentence correctly. Or learning instruments and want replay a section in slower speed.
// ==/UserScript==

const $$ = (sel) => [...document.querySelectorAll(sel)];

const pardon = (dt = -2, speed = 0.8) => {
  const vs = $$("video,audio")
  const v = vs.filter(e=>!e.paused)[0]
  if(!v) return vs[0].play()

  if(speed!==1) v.playbackRate *= speed;
  if(dt!==0)    v.currentTime  += dt;
};

window.addEventListener("keydown", (e) => {
  if (e.key === ",") pardon(-3, 0.8);
  if (e.key === ".") pardon(0, 1.2);
});
