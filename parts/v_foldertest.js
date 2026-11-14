// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：foldertest
var FOLDERTEST_IDS_ = ['sejutsugo', 'sgline', 'shomeisho', 'insta', 'threads', 'hachimitsu', 'yoyaku', 'akijikan', 'ttapp', 'links',
  'lt', 'conflict', 'procstock', 'hanbai', 'uriage', 'zenjitsu', 'mita', 'bcast'];
function renderFolderTestPage_(base, staff, dev) {
  var byId = {};
  for (var i = 0; i < TILE_DEFS_.length; i++) byId[TILE_DEFS_[i].id] = TILE_DEFS_[i];
  var tiles = FOLDERTEST_IDS_.map(function (id) {
    var t = byId[id]; if (!t) return '';
    return '<a class="tile ' + t.cls + '" href="#" data-tid="' + esc_(id) + '" draggable="false">' + tileIcon_(t, dev) +
      '<span class="tname">' + esc_(t.label) + '</span></a>';
  }).join('');
  var home = (base || '') + '?view=home' + roleSfx_(staff, dev);
  return '<style>' + HOMECSS_ + '</style><div class="home hsort">' +
    '<div class="hhead"><img class="bmark" src="https://ttsuperzuco.github.io/tt/icons/icon-180.png" alt=""><span class="bname">TTスーパーズコ</span></div>' +
    '<div class="hsub">フォルダの試し（このスマホの中だけで変わります）</div>' +
    '<div class="group" id="group-ftest"><div class="backbar"><button type="button" class="backbtn">← 戻る</button>' +
    '<span class="hreset"><button type="button" class="hresetbtn">↺ 初期の並びに戻す</button></span></div>' +
    '<div class="grouptitle"><span>💼 スタッフ画面</span></div><div class="tiles hfold">' + tiles + '</div></div></div>' +
    '<script>(' + homeFolderBoot_.toString() + ')({"group":"#group-ftest","tile":"a.tile","idAttr":"data-tid","store":{"local":"sz_foldertest4"}});</' + 'script>' +
    '<script>(' + folderTestExtra_.toString() + ')(' + JSON.stringify(home) + ');</' + 'script>';
}
function folderTestExtra_(home) {
  var g = document.getElementById('group-ftest'); if (!g) return;
  var box = g.querySelector('.tiles.hfold'), tm = null;
  box.addEventListener('click', function (ev) {
    var a = (ev.target && ev.target.closest) ? ev.target.closest('a.tile') : null;
    if (!a || a.classList.contains('ftfolder')) return;
    ev.preventDefault();
    var t = document.getElementById('ftToast');
    if (!t) { t = document.createElement('div'); t.id = 'ftToast'; t.className = 'fttoast'; document.body.appendChild(t); }
    t.textContent = '試しの画面なので、ボタンの先は開きません😊'; t.style.display = 'block';
    clearTimeout(tm); tm = setTimeout(function () { t.style.display = 'none'; }, 2200);
  });
  var bk = g.querySelector('.backbtn');
  if (bk) bk.addEventListener('click', function () { try { window.top.location.href = home; } catch (e) { location.href = home; } });
}
