// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：bcast、claudechat、facebook、hanbai、igdm、insta、kanshi、threads、timedsend、timetree、yoyaku_new、yoyaku_sejutsugo
function szOvShow_(html, bg) {
  var ov = document.getElementById('szBusyOv');
  if (!ov) { ov = document.createElement('div'); ov.id = 'szBusyOv'; document.body.appendChild(ov); }
  ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:' + bg + ';display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center;';
  ov.innerHTML = html;
  return ov;
}
function szOvHide_() { var ov = document.getElementById('szBusyOv'); if (ov && ov.parentNode) ov.parentNode.removeChild(ov); }
