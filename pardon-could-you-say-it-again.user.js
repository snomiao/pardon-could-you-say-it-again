// ==UserScript==
// @name        Pardon, could you say it again?
// @name:fr     Pardonnez-moi, pouvez-vous le répéter?
// @name:de     Entschuldigung, könnten Sie es noch einmal sagen?
// @name:es     Perdón, ¿puedes decirlo otra vez?
// @name:zh-CN  不好意思，你能再说一遍吗？
// @name:ja     すみません、もう一度言っていただけますか？
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       none
// @version     1.2.1
// @description Press . or , to replay the last sentence slowly at 0.6x speed in any video/audio site like YouTube, Bilibili, or Spotify. This is useful when you're learning a language and want to ensure you understand every sentence correctly. Or learning instruments and want to replay a section at a slower speed.
// @description:fr Appuyez sur . ou , pour rejouer la dernière phrase lentement à 0.6x de vitesse sur n'importe quel site vidéo/audio comme YouTube, Bilibili ou Spotify. C'est utile lorsque vous apprenez une langue et que vous voulez vous assurer de bien comprendre chaque phrase. Ou lorsque vous apprenez des instruments et que vous voulez rejouer une section à une vitesse plus lente.
// @description:de Drücken Sie . oder , um den letzten Satz langsam mit 0,6-facher Geschwindigkeit auf jeder Video-/Audio-Seite wie YouTube, Bilibili oder Spotify erneut abzuspielen. Dies ist nützlich, wenn Sie eine Sprache lernen und sicherstellen möchten, dass Sie jeden Satz korrekt verstehen. Oder wenn Sie Instrumente lernen und einen Abschnitt in langsamer Geschwindigkeit wiederholen möchten.
// @description:es Presiona . o , para reproducir la última oración lentamente a 0.6x de velocidad en cualquier sitio de video/audio como YouTube, Bilibili o Spotify. Esto es útil cuando estás aprendiendo un idioma y quieres asegurarte de entender cada frase correctamente. O aprendiendo instrumentos y deseas reproducir una sección a una velocidad más lenta.
// @description:zh-CN 按下 . 或 , 可以在任何视频/音频网站上以 0.6 倍速度慢放重播最后一句话，例如 YouTube、Bilibili 或 Spotify。 这在你学习一门语言并希望确保自己准确理解每一句话时非常有用。 或者在学习乐器并希望以较慢的速度重播某个部分时也很有用。
// @description:ja . または , を押すと、YouTube、Bilibili、Spotifyなどの任意のビデオ/オーディオサイトで、最後の文を0.6倍速でゆっくり再生します。 これは、言語を学んでいるときに、すべての文を正しく理解するために役立ちます。 または、楽器を学んでいて、特定の部分を遅い速度で再生したいときに便利です。
// @run-at      document-end
// ==/UserScript==

const $$ = (sel) => [...document.querySelectorAll(sel)];
const tryIt = (fn) => {
  try {
    fn();
  } catch (e) {}
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stop = (e) => (e.preventDefault(), e.stopPropagation());
async function pardon(dt = 0, speed = 1, wait = 0) {
  const vs = $$("video,audio");
  const v = vs.filter((e) => !e.paused)[0];
  if (!v) return vs[0].click();
  if (dt !== 0) v.currentTime += dt;
  if (speed !== 1) v.playbackRate *= speed;
  if (wait) await sleep(wait);
  return true;
}

window.addEventListener(
  "keydown",
  async (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (document?.activeElement?.isContentEditable)
      return;
    if (["INPUT", "TEXTAREA"].includes(document?.activeElement?.tagName))
      return;
    if (e.code === "Comma") (await pardon(-3, 0.8)) && stop(e);
    if (e.code === "Period") (await pardon(0, 1.2)) && stop(e);
    if (e.code === "ArrowLeft") (await pardon(-1, 1)) && stop(e);
    if (e.code === "ArrowRight")
      (await pardon(0, 4, 4)) && (await pardon(0, 1 / 4)) && stop(e);
  },
  { capture: true }
);
