// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：dokuritsu
function renderDokuritsuPage_(base, staff, dev) {
  return '<style>' + HOMECSS_ +
    '.dkwrap{max-width:720px;margin:0 auto;padding:0 2px 40px}' +
    '.dkttl{color:#fff;font-size:24px;font-weight:900;margin:4px 4px 6px}' +
    '.dknote{color:#fff;font-weight:700;line-height:1.6;margin:0 4px 14px}' +
    '.dksec{color:#fff;font-size:20px;font-weight:900;margin:18px 4px 8px}' +
    '.dkcard{background:#fff;border-radius:16px;padding:6px 14px;box-shadow:0 3px 10px rgba(0,0,0,.18)}' +
    '.dkrow{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:10px 0;border-bottom:1px solid #e3edf2}' +
    '.dkrow:last-child{border-bottom:0}' +
    '.dkrow .n{flex:1 1 auto;font-weight:900;color:#12303c;font-size:17px}' +
    '.dkrow .r{flex:0 0 auto;font-size:13px;font-weight:800;color:#5b7a88;background:#eef4f7;border-radius:999px;padding:3px 10px}' +
    '.dkrow .h{flex:0 0 auto;font-size:13px;font-weight:800;color:#fff;border-radius:999px;padding:3px 10px}' +
    '.dkrow .h.own{background:#2C7A99}.dkrow .h.in{background:#8a9aa3}' +
    '.dkmsg{color:#fff;font-weight:700;margin:10px 4px}' +
    '</style>' +
    '<div class="home">' + backBarUnlessSolo_(base, staff, dev) + '<div class="dkwrap">' +
      '<div class="dkttl">🪟 独立画面</div>' +
      '<div class="dknote">パソコン版ズコでボタンを押した時の開き方です。スマホでは、どのボタンもズコの中で開きます。</div>' +
      '<div id="dkBody"><div class="dkmsg">読み込み中…</div></div>' +
    '</div></div>' +
    '<script>(' + dokuritsuScript_.toString() + ')();<\/script>';
}
function dokuritsuScript_() {
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var box = document.getElementById('dkBody');
  fetch('https://ttsuperzuco.github.io/tt/dokuritsu.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (d) {
    var rows = (d && d.rows) || [];
    var part = function (own, title) {
      var list = rows.filter(function (x) { return !!x.own === own; });
      return '<div class="dksec">' + title + '（' + list.length + '個）</div><div class="dkcard">' + (list.map(function (x) {
        return '<div class="dkrow"><span class="n">' + esc(x.label) + '</span><span class="r">' + esc(x.room) + '</span>' +
          '<span class="h ' + (own ? 'own' : 'in') + '">' + esc(x.how) + '</span></div>';
      }).join('') || '<div class="dkrow"><span class="n">ありません</span></div>') + '</div>';
    };
    box.innerHTML = part(true, '独立した窓で開くボタン') + part(false, '独立した窓で開かないボタン') +
      '<div class="dknote" style="margin-top:14px">一覧を作った日時：' + esc(d.made || '') + '</div>';
  }).catch(function () {
    box.innerHTML = '<div class="dkmsg">一覧を読み込めませんでした。少し待ってから、もう一度開いてください😊</div>';
  });
}
