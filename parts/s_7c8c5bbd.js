// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：facebook、insta、permlist、threads
function backBarUnlessSolo_(base, staff, dev) {
  var solo = false;
  try { solo = /[?&]solo=1(&|$)/.test(location.search); } catch (e) {}
  return solo ? '' : backBar_(base, staff, dev);
}
