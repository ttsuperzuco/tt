// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：dokuritsu
function renderDokuritsuPage_(base, staff, dev) {
  return '<style>' + HOMECSS_ +
    '.dkwrap{max-width:720px;margin:0 auto;padding:0 2px 40px}' +
    '.dkttl{color:#fff;font-size:24px;font-weight:900;margin:4px 4px 6px}' +
    '.dknote{color:#fff;font-weight:800;font-size:17px;line-height:1.6;margin:0 4px 14px}' +
    '.dknote b{background:#2C7A99;border:2px solid #fff;border-radius:999px;padding:1px 10px;white-space:nowrap}' +
    '.dkfold{background:#131C2E;border-radius:18px;padding:12px;margin:0 0 14px}' +
    '.dkfname{color:#fff;font-size:20px;font-weight:900;margin:2px 4px 10px}' +
    '.dkgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '.dktile{position:relative;display:flex;align-items:center;gap:10px;background:#fff;border-radius:14px;padding:10px;min-height:58px;border:3px solid transparent}' +
    '.dktile.own{border-color:#38bdf8}' +
    '.dktile .ic{flex:0 0 auto;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:30px}' +
    '.dktile .ic img{width:40px;height:40px;border-radius:9px;display:block}' +
    '.dktile .ic .ticon{font-size:30px}' +
    '.dktile .nm{font-weight:900;color:#12303c;font-size:15px;line-height:1.3}' +
    '.dktile .bd{position:absolute;right:-4px;top:-10px;background:#2C7A99;color:#fff;border:2px solid #fff;border-radius:999px;font-size:12px;font-weight:900;padding:1px 8px}' +
    '.dkmsg{color:#fff;font-weight:700;margin:10px 4px}' +
    '</style>' +
    '<div class="home">' + backBarUnlessSolo_(base, staff, dev) + '<div class="dkwrap">' +
      '<div class="dkttl">🪟 独立画面</div>' +
      '<div class="dknote"><b>🪟 独立画面</b> が付いているボタンは、パソコン版ズコで押すと独立画面で開きます。<br>付いていないボタンは、ズコの画面の中で開きます。</div>' +
      '<div id="dkBody"><div class="dkmsg">読み込み中…</div></div>' +
    '</div></div>' +
    '<script>(' + dokuritsuScript_.toString() + ')();<\/script>';
}
function dokuritsuScript_() {
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var box = document.getElementById('dkBody');
  var defs = {};
  try { (typeof TILE_DEFS_ !== 'undefined' ? TILE_DEFS_ : []).forEach(function (t) { defs[t.id] = t; }); } catch (e) {}
  fetch('https://ttsuperzuco.github.io/tt/dokuritsu.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (d) {
    var byId = {};
    ((d && d.rows) || []).forEach(function (x) { byId[x.id] = x; });
    box.innerHTML = ((d && d.folders) || []).map(function (f) {
      return '<div class="dkfold"><div class="dkfname">📁 ' + esc(f.name) + '</div><div class="dkgrid">' + f.items.map(function (id) {
        var x = byId[id] || {}, t = defs[id] || {};
        var ic = t.iconDev || t.icon || '<span class="ticon">▫️</span>';
        return '<div class="dktile' + (x.own ? ' own' : '') + '"><span class="ic">' + ic + '</span><span class="nm">' + esc(x.label || id) + '</span>' +
          (x.own ? '<span class="bd">🪟 独立画面</span>' : '') + '</div>';
      }).join('') + '</div></div>';
    }).join('');
  }).catch(function () {
    box.innerHTML = '<div class="dkmsg">一覧を読み込めませんでした。少し待ってから、もう一度開いてください😊</div>';
  });
}
