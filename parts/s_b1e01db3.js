// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：linereply、manual、shomeiman、ubman、wifiman
var MANUALS_ = [
  { key: 'shomeisho', icon: '🧾', title: '購入証明書の使い方' },
  { key: 'uriagebook', icon: '📒', title: 'TT売上帳簿の使い方' },   
  { key: 'linereply_all', icon: '💬', title: 'LINEにすぐ返信できない' }   
];
function renderManualPage_(base, staff, dev, only) {
  var C = { root: 'https://ttsuperzuco.github.io/tt/manual/', list: only ? [only] : MANUALS_, only: !!only };
  return '<style>' + HOMECSS_ +
    '.mnwrap{max-width:720px;margin:0 auto;padding:0 2px 40px}' +
    '.mntitle{color:#fff;font-size:24px;font-weight:900;margin:4px 4px 14px}' +
    '.mnbtn{display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;border:0;border-radius:18px;background:#131C2E;color:#fff;' +
      'font-size:21px;font-weight:900;padding:18px 18px;margin:0 0 12px;text-align:left;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.12)}' +
    '.mnbtn .mi{font-size:30px}' +
    '.mnbook{display:none}' +
    '.mncover{position:relative}' +
    '.mncover a{position:absolute;display:block;border-radius:14px}' +
    '.mncover a:active{background:rgba(255,23,68,.18)}' +
    '.mnimg{display:block;width:100%;height:auto;aspect-ratio:auto 4/5;border-radius:14px;margin:0 0 14px;background:#fff;box-shadow:0 3px 10px rgba(0,0,0,.18);scroll-margin-top:10px}' +
    '.mncover .mnimg{margin:0}' +
    '.mncoverbox{margin:0 0 14px}' +
    '.mntop{position:fixed;right:14px;bottom:18px;z-index:50;display:none;border:0;border-radius:999px;background:#131C2E;color:#fff;' +
      'font-size:16px;font-weight:900;padding:12px 16px;box-shadow:0 6px 18px rgba(0,0,0,.25);cursor:pointer}' +
    '.mnmsg{color:#fff;font-weight:700;margin:10px 4px}' +
    '</style>' +
    '<div class="home">' +
      '<div id="mnList"' + (only ? ' style="display:none"' : '') + '>' + backBar_(base, staff, dev) +
        '<div class="mntitle">📖 マニュアル</div><div class="mnwrap" id="mnBtns"></div></div>' +
      '<div id="mnBook" class="mnbook">' +
        (only ? backBar_(base, staff, dev) : '<div class="ubar"><a class="uhome" id="mnBack" href="javascript:void(0)">← 戻る</a></div>') +
        '<div class="mntitle" id="mnTitle"></div><div class="mnwrap" id="mnPages"></div></div>' +
      '<button type="button" class="mntop" id="mnTop">↑ 表紙へ</button>' +
    '</div>' +
    '<script>(' + manualScript_.toString() + ')(' + JSON.stringify(C).replace(/</g, '\\u003c') + ');<\/script>';
}
function manualScript_(C) {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var btns = '';
  C.list.forEach(function (m, i) {
    btns += '<button type="button" class="mnbtn" data-i="' + i + '"><span class="mi">' + m.icon + '</span>' + esc(m.title) + '</button>';
  });
  $('mnBtns').innerHTML = btns;
  Array.prototype.forEach.call(document.querySelectorAll('.mnbtn'), function (b) {
    b.onclick = function () { open(C.list[Number(b.getAttribute('data-i'))]); };
  });
  function jump(n) {
    var e = $('mnP' + n);
    if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function open(m) {
    $('mnList').style.display = 'none'; $('mnBook').style.display = 'block';
    $('mnTitle').textContent = m.icon + ' ' + m.title;
    $('mnTitle').style.display = 'none';
    $('mnPages').innerHTML = '<div class="mnmsg">読み込み中…</div>';
    window.scrollTo(0, 0);
    var dir = C.root + m.key + '/';
    fetch(dir + 'index.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (info) {
      var src = function (i) { return dir + 'p' + (i < 10 ? '0' : '') + i + '.jpg?v=' + info.ver; };
      var links = (info.links || []).map(function (l) {
        return '<a href="javascript:void(0)" data-p="' + l.page + '" style="left:' + (l.x * 100) + '%;top:' + (l.y * 100) + '%;width:' +
          (l.w * 100) + '%;height:' + (l.h * 100) + '%" aria-label="' + l.page + 'ページへ"></a>';
      }).join('');
      var h = '<div class="mncoverbox" id="mnP0"><div class="mncover"><img class="mnimg" alt="表紙" src="' + src(0) + '">' + links + '</div></div>';
      for (var i = 1; i < info.pages; i++) {
        h += '<img class="mnimg" id="mnP' + i + '" alt="' + i + 'ページ"' + (i > 2 ? ' loading="lazy"' : '') + ' src="' + src(i) + '">';
      }
      $('mnPages').innerHTML = h;
      Array.prototype.forEach.call(document.querySelectorAll('.mncover a'), function (a) {
        a.onclick = function () { jump(Number(a.getAttribute('data-p'))); };
      });
    }).catch(function () {
      $('mnPages').innerHTML = '<div class="mnmsg">マニュアルを読み込めませんでした。少し待ってから、もう一度開いてください😊</div>';
    });
  }
  if ($('mnBack')) $('mnBack').onclick = function () {
    $('mnBook').style.display = 'none'; $('mnList').style.display = 'block'; $('mnTop').style.display = 'none';
    $('mnPages').innerHTML = ''; window.scrollTo(0, 0);
  };
  $('mnTop').onclick = function () { jump(0); };
  window.addEventListener('scroll', function () {
    var on = $('mnBook').style.display === 'block' && window.scrollY > 600;
    $('mnTop').style.display = on ? 'block' : 'none';
  }, { passive: true });
  if (C.only) open(C.list[0]);   
}
