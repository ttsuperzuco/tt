// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：yoyaku
function renderReservationHomePage_(base, staff, dev) {
  var sfx = roleSfx_(staff, dev);
  var head = '<div class="hhead"><span class="bmark">📅</span><span class="bname">予約入力</span></div>' +
             '<div class="hsub">TaiwanTomato</div>';
  var ex = dev ?
      ('<a class="rolebtn kaihatsu" href="' + base + '?view=yoyaku_kizon' + sfx + '" target="_top">' +
        '<span class="ricon">📅</span><span class="rname">既存の予約</span></a>' +
      '<a class="rolebtn kanri" href="' + base + '?view=yoyaku_henkou' + sfx + '" target="_top">' +
        '<span class="ricon"><img alt="" src="https://ttsuperzuco.github.io/tt/icons/henkou-orange-128.png" style="width:34px;height:34px;display:block"></span><span class="rname">既存の変更</span></a>') : '';
  var _sgAllow = (typeof window !== 'undefined') && window.__SZ_ALLOW_;
  var rp = (dev || !!(_sgAllow && _sgAllow.sejutsugo === true)) ?
      ('<a class="rolebtn kaihatsu" href="' + base + '?view=yoyaku_sejutsugo&mode=repeat' + sfx + '" target="_top">' +
        '<span class="ricon">🔁</span><span class="rname">リピート入力</span></a>') : '';
  var menu =
    '<div class="rolemenu">' +
      '<a class="rolebtn jitsumu" href="' + base + '?view=yoyaku_new' + sfx + '" target="_top">' +
        '<span class="ricon">' + (dev ? '🆕' : '📝') + '</span><span class="rname">新規の予約</span></a>' +
      ex + rp +
    '</div>';
  return '<style>' + HOMECSS_ + '</style>' +
    '<div class="home">' + backBar_(base, staff, dev) + head + menu + '</div>';
}
