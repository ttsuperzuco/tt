// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：wifiman
var WIFIMAN_VER_ = 2;
function renderWifiManualPage_(base, staff, dev) {
  var imgs = '';
  for (var i = 0; i < 12; i++) {
    imgs += '<img class="wmimg" alt="' + (i ? i + 'ページ' : '表紙') + '"' + (i > 1 ? ' loading="lazy"' : '') +
      ' src="https://ttsuperzuco.github.io/tt/manual/wifi/p' + (i < 10 ? '0' : '') + i + '.jpg?v=' + WIFIMAN_VER_ + '">';
  }
  return '<style>' + HOMECSS_ +
    '.wmwrap{max-width:720px;margin:0 auto;padding:0 2px 30px}' +
    '.wmtitle{color:#fff;font-size:24px;font-weight:900;margin:4px 4px 14px}' +
    '.wmimg{display:block;width:100%;height:auto;border-radius:14px;margin:0 0 14px;background:#fff;box-shadow:0 3px 10px rgba(0,0,0,.18)}' +
    '</style>' +
    '<div class="home">' + backBar_(base, staff, dev) +
    '<div class="wmtitle">📶 お店のWi-Fiの設定</div>' +
    '<div class="wmwrap">' + imgs + '</div></div>';
}
