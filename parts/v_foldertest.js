// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：foldertest
var FOLDERTEST_START_ = [
  { f: '施術直後', items: ['sejutsugo', 'sgline', 'shomeisho'] },
  { f: 'SNS', items: ['insta', 'threads', 'hachimitsu'] },
  { f: '予約系', items: ['yoyaku', 'akijikan', 'ttapp', 'links', 'lt', 'conflict'] },
  { f: '在庫売上\n管理', items: ['procstock', 'hanbai', 'uriage'] },
  { f: 'お知らせ\n＆配信', items: ['zenjitsu', 'mita', 'bcast'] }];
function renderFolderTestPage_(base, staff, dev) {
  var tiles = {};
  var want = [];
  FOLDERTEST_START_.forEach(function (x) { if (typeof x === 'string') want.push(x); else want = want.concat(x.items); });
  var byId = {};
  for (var i = 0; i < TILE_DEFS_.length; i++) byId[TILE_DEFS_[i].id] = TILE_DEFS_[i];
  want.forEach(function (id) { var t = byId[id]; if (t) tiles[id] = { icon: tileIcon_(t, dev), label: t.label, cls: t.cls }; });
  var D = { tiles: tiles, start: FOLDERTEST_START_, home: (base || '') + '?view=home' + roleSfx_(staff, dev) };
  return '<style>' + HOMECSS_ + FOLDERTESTCSS_ + '</style><div class="home hsort" id="ftHome"></div>' +
    '<script>(' + folderTestBoot_.toString() + ')(' + JSON.stringify(D).replace(/</g, '\\u003c') + ');</' + 'script>';
}
var FOLDERTESTCSS_ =
  '  .tile.foldertest::before { background:#94a3b8; }' +
  '  .tile.ftfolder::before { background:#94a3b8; }' +
  '  #ftHome .tiles { grid-auto-rows:1fr; }' +
  '  .ftmini { flex:none; width:74px; height:74px; border-radius:14px; background:rgba(148,163,184,.22); display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:3px; padding:3px; box-sizing:border-box; margin-right:6px; }' +
  '  .ftmini .ticon { width:32px; height:32px; font-size:26px; border-radius:7px; background:transparent!important; margin:auto; }' +
  '  .ftmini .ticon img { width:32px; height:32px; }' +
  '  .ftmini .ftmore { font-size:16px; font-weight:900; color:#475569; display:grid; place-items:center; }' +
  '  .ftmini.ft6 { width:86px; grid-template-columns:1fr 1fr 1fr; gap:2px; }' +
  '  .ftmini.ft6 .ticon, .ftmini.ft6 .ticon img { width:25px; height:25px; font-size:20px; border-radius:6px; }' +
  '  .ftmini.ft6 .ftmore { font-size:13px; }' +
  '  .ftmini.ft6 .lt2 svg { width:12px; height:12px; }' +   
  '  .ftlab { flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center; }' +
  '  .ftlab .tname { flex:none; word-break:auto-phrase; }' +   
  '  .ftcount { display:block; font-size:.78rem; font-weight:800; opacity:.75; margin-top:2px; }' +
  '  .tile.hinto { outline:3px solid #fbbf24; outline-offset:-3px; transform:scale(1.06); transition:transform .12s ease; }' +
  '  .tile.hside { box-shadow:-7px 0 0 0 #fbbf24; }' +   
  '  .fttoast { position:fixed; left:50%; bottom:24px; transform:translateX(-50%); background:#fff; color:#12303c; font-weight:800; border-radius:14px; padding:12px 16px; box-shadow:0 6px 20px rgba(0,0,0,.25); display:none; z-index:10002; font-size:.95rem; max-width:90vw; text-align:center; }' +
  '  .ftmbtn { display:block; width:100%; font:inherit; font-size:1.2rem; font-weight:800; padding:14px; margin:0 0 10px; border-radius:12px; border:0; background:#fff; color:#12303c; cursor:pointer; }' +
  '  .ftmtitle { font-size:1.3rem; font-weight:900; margin-bottom:14px; }' +
  '  .ftname { width:100%; box-sizing:border-box; font:inherit; font-size:1.3rem; font-weight:800; padding:12px 14px; border-radius:12px; border:0; color:#12303c; }' +
  '  #ftHome, .ftbar, .fttoast { -webkit-user-select:none; user-select:none; -webkit-touch-callout:none; }' +
  '  .ftbar { position:fixed; left:0; right:0; top:0; z-index:50; display:none; background:rgba(18,48,60,.97); padding:calc(14px + env(safe-area-inset-top)) 12px 14px; border-radius:0 0 18px 18px; box-shadow:0 8px 24px rgba(0,0,0,.3); }' +
  '  .ftbhint { color:#fff; font-weight:800; font-size:.95rem; text-align:center; margin-bottom:10px; }' +
  '  .ftzones { display:flex; flex-wrap:wrap; gap:10px; max-width:640px; margin:0 auto; }' +
  '  .ftzone { flex:1 1 40%; box-sizing:border-box; background:#fff; color:#12303c; font-weight:900; font-size:1.1rem; border-radius:14px; padding:16px 12px; text-align:center; }' +
  '  .ftzone.hinto { outline:3px solid #fbbf24; outline-offset:-3px; background:#fef3c7; transform:scale(1.04); transition:transform .12s ease; }';
function folderTestBoot_(D) {
  var T = D.tiles, KEY = 'sz_foldertest3';   
  var home = document.getElementById('ftHome');
  if (!home) return;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function lbl(id) { return String(T[id].label).replace(/\n/g, ''); }
  var seq = 0;
  function newKey() { seq++; return 'f' + Date.now().toString(36) + seq; }
  function clean(list) {
    var out = [], seen = {}, keys = {};
    (list || []).forEach(function (x) {
      if (typeof x === 'string') { if (T[x] && !seen[x]) { out.push(x); seen[x] = 1; } }
      else if (x && x.items) {
        var it = x.items.filter(function (y) { if (!T[y] || seen[y]) return false; seen[y] = 1; return true; });
        var k = (x.k && !keys[x.k]) ? String(x.k) : newKey(); keys[k] = 1;
        if (it.length) out.push({ k: k, f: String(x.f || 'フォルダ'), items: it });
      }
    });
    for (var id in T) if (!seen[id]) out.push(id);
    return out;
  }
  var RENAME = { '在庫売上管理': '在庫売上\n管理', 'お知らせ・配信': 'お知らせ\n＆配信' };
  function renamed(L) { L.forEach(function (x) { if (typeof x !== 'string' && RENAME[x.f]) x.f = RENAME[x.f]; }); return L; }
  function load() { try { var s = localStorage.getItem(KEY); if (s) return clean(renamed(JSON.parse(s))); } catch (e) {} return clean(D.start); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }
  var items = load(), openF = null;
  home.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
  function folderByKey(k) { for (var i = 0; i < items.length; i++) if (typeof items[i] !== 'string' && items[i].k === k) return items[i]; return null; }

  function tileHtml(id) {
    return '<a class="tile ' + T[id].cls + '" href="#" data-tid="' + id + '" draggable="false">' + T[id].icon + '<span class="tname">' + esc(T[id].label) + '</span></a>';
  }
  function folderHtml(F) {
    var n = F.items.length, cells = '', six = n > 4, show = n > 6 ? 5 : n;
    for (var k = 0; k < show; k++) cells += T[F.items[k]].icon;
    if (n > 6) cells += '<span class="ftmore">+' + (n - 5) + '</span>';
    return '<a class="tile ftfolder" href="#" data-tid="@' + F.k + '" draggable="false"><span class="ftmini' + (six ? ' ft6' : '') + '">' + cells + '</span>' +
      '<span class="ftlab"><span class="tname">' + esc(F.f) + '</span></span></a>';   
  }
  function render() {
    if (openF && items.indexOf(openF) < 0) openF = null;
    var h = '<div class="hhead"><img class="bmark" src="https://ttsuperzuco.github.io/tt/icons/icon-180.png" alt=""><span class="bname">TTスーパーズコ</span></div>' +
      '<div class="hsub">フォルダの試し（このスマホの中だけで変わります）</div>';
    if (!openF) {
      h += '<div class="backbar"><button type="button" class="backbtn" id="ftBack">← 戻る</button>' +
        '<span class="hreset"><button type="button" class="hresetbtn">↺ 初期の並びに戻す</button></span></div>' +
        '<div class="grouptitle">💼 スタッフ画面（' + items.length + '個）</div>' +
        '<div class="tiles" id="ftBox">' + items.map(function (x) { return typeof x === 'string' ? tileHtml(x) : folderHtml(x); }).join('') + '</div>';
    } else {
      h += '<div class="backbar"><button type="button" class="backbtn" id="ftBack">← 戻る</button></div>' +
        '<div class="grouptitle">📂 ' + esc(openF.f) + '</div>' +
        '<div class="tiles" id="ftBox">' + openF.items.map(tileHtml).join('') + '</div>';
    }
    home.innerHTML = h;
    bind();
  }
  var toastTm = null;
  function toast(m) {
    var t = document.getElementById('ftToast');
    if (!t) { t = document.createElement('div'); t.id = 'ftToast'; t.className = 'fttoast'; document.body.appendChild(t); }
    t.textContent = m; t.style.display = 'block';
    clearTimeout(toastTm); toastTm = setTimeout(function () { t.style.display = 'none'; }, 2200);
  }
  function done(m) { save(); render(); toast(m); }

  function sheet(title, btns) {
    var html = '<div class="ftmtitle">' + title + '</div>' + btns.map(function (b, i) {
      return '<button type="button" class="ftmbtn" data-k="' + i + '">' + b.label + '</button>';
    }).join('');
    var m = szPopup_(html, { isHtml: true, icon: '', yesLabel: '閉じる' });
    var bs = m.querySelectorAll('[data-k]');
    for (var i = 0; i < bs.length; i++) (function (el) {
      el.addEventListener('click', function () { if (m.parentNode) m.parentNode.removeChild(m); btns[+el.getAttribute('data-k')].fn(); });
    })(bs[i]);
  }
  function askName(title, cur, cb) {
    var inp = null;
    var m = szPopup_('<div class="ftmtitle">' + title + '</div><input type="text" class="ftname" maxlength="10" value="' + esc(cur) + '">',
      { isHtml: true, icon: '', cancel: true, yesLabel: '保存', onYes: function () { var v = String(inp.value || '').trim(); cb(v || cur || 'フォルダ'); } });
    inp = m.querySelector('.ftname');
    setTimeout(function () { try { inp.focus(); inp.select(); } catch (e) {} }, 60);
  }
  function where(id) {   
    for (var i = 0; i < items.length; i++) if (typeof items[i] !== 'string' && items[i].items.indexOf(id) >= 0) return items[i];
    return null;
  }
  function takeOut(id) {   
    var i = items.indexOf(id);
    if (i >= 0) { items.splice(i, 1); return i; }
    var F = where(id); if (F) F.items.splice(F.items.indexOf(id), 1);
    return -1;
  }
  function dropEmpty() { items = items.filter(function (x) { return typeof x === 'string' || x.items.length; }); }
  function moveToFolder(id, F) {
    takeOut(id); F.items.push(id); dropEmpty();
    done('「' + lbl(id) + '」を「' + F.f + '」に移動しました');
  }
  function newFolder(id) {
    askName('新しいフォルダの名前を入力してください😊', '新しいフォルダ', function (nm) {
      var from = where(id), pos = takeOut(id);
      if (pos < 0) pos = from ? items.indexOf(from) + 1 : items.length;
      items.splice(pos, 0, { k: newKey(), f: nm, items: [id] }); dropEmpty();
      done('新しいフォルダ「' + nm + '」を作成しました');
    });
  }
  function showBar(el) {
    var tid = el.getAttribute('data-tid') || '';
    if (!T[tid]) return;
    var z = [];
    if (!openF) z.push('<div class="ftzone" data-z="new">＋ 新しいフォルダ</div>');
    else {
      z.push('<div class="ftzone" data-z="top">⬆️ トップに出す</div>');
      items.forEach(function (x) { if (typeof x !== 'string' && x !== openF) z.push('<div class="ftzone" data-z="@' + x.k + '">📂 ' + esc(x.f) + '</div>'); });
    }
    var bar = document.getElementById('ftBar');
    if (!bar) { bar = document.createElement('div'); bar.id = 'ftBar'; bar.className = 'ftbar'; document.body.appendChild(bar); }
    bar.innerHTML = '<div class="ftbhint">行き先の上で離してください😊</div><div class="ftzones">' + z.join('') + '</div>';
    bar.style.display = 'block';
  }
  function hideBar() { var bar = document.getElementById('ftBar'); if (bar) bar.style.display = 'none'; }
  function barHeight() { var bar = document.getElementById('ftBar'); return (bar && bar.style.display !== 'none') ? bar.offsetHeight : 0; }
  function zoneAt(x, y) {
    if (!barHeight()) return null;
    var u = document.elementFromPoint(x, y);
    return (u && u.closest) ? u.closest('.ftzone') : null;
  }
  function toTop(id) {
    var F = where(id); if (!F) return;
    var pos = items.indexOf(F) + 1;
    takeOut(id); items.splice(pos, 0, id); dropEmpty();
    done('「' + lbl(id) + '」をトップに移動しました');
  }
  function ungroup(F) {
    var i = items.indexOf(F); if (i < 0) return;
    items.splice.apply(items, [i, 1].concat(F.items));
    if (openF === F) openF = null;
    done('フォルダ「' + F.f + '」を解除しました');
  }
  function menuFor(el) {
    var tid = el.getAttribute('data-tid') || '';
    if (tid.charAt(0) === '@') {
      var F = folderByKey(tid.slice(1)); if (!F) return;
      sheet('📂 ' + esc(F.f), [
        { label: '✏️ 名前を変更', fn: function () {
          askName('フォルダの名前を入力してください😊', F.f, function (nm) { F.f = nm; done('名前を「' + nm + '」に変更しました'); });
        } },
        { label: '🗂️ フォルダを解除', fn: function () {
          szPopup_('中のボタンは、すべてトップに戻ります。\nフォルダ「' + F.f + '」を解除しますか？😊',
            { icon: '', cancel: true, yesLabel: '解除する', onYes: function () { ungroup(F); } });
        } }
      ]);
      return;
    }
    toast('動かして、上の行き先かフォルダの上で離してください😊');
  }

  function sortSaved(ids) {
    if (openF) { openF.items = ids.filter(function (x) { return !!T[x]; }); save(); return; }
    items = ids.map(function (x) { return x.charAt(0) === '@' ? folderByKey(x.slice(1)) : x; }).filter(function (x) { return !!x; });
    save();
  }
  function resetAll() { try { localStorage.removeItem(KEY); } catch (e) {} items = clean(D.start); openF = null; render(); toast('初期の並びに戻しました'); }
  function bind() {
    var bk = document.getElementById('ftBack');
    if (bk) bk.onclick = function () {
      if (openF) { openF = null; render(); window.scrollTo(0, 0); return; }
      try { window.top.location.href = D.home; } catch (e) { location.href = D.home; }
    };
    var box = document.getElementById('ftBox');
    if (!box) return;
    homeSortBoot_(KEY + '_unused', {
      save: sortSaved,
      clear: function () {},
      confirm: function (msg) { szPopup_(msg, { cancel: true, icon: '', onYes: resetAll }); },
      into: function (dragEl, t, px) {
        if (openF || (dragEl.getAttribute('data-tid') || '').charAt(0) === '@' || (t.getAttribute('data-tid') || '').charAt(0) !== '@') return false;
        return px < 0.25 ? 300 : true;
      },
      dropInto: function (dragEl, t) {
        var id = dragEl.getAttribute('data-tid'); if (!T[id]) return;
        var z = t.getAttribute('data-z');
        if (z) render();   
        if (z === 'new') { newFolder(id); return; }
        if (z === 'top') { toTop(id); return; }
        var F = folderByKey((z || t.getAttribute('data-tid') || '').slice(1));
        if (F) moveToFolder(id, F);
      },
      still: function (el) { menuFor(el); },
      lift: showBar,
      end: hideBar,
      zoneAt: zoneAt,
      topGap: barHeight
    });
    box.addEventListener('click', function (ev) {
      var a = (ev.target && ev.target.closest) ? ev.target.closest('a.tile') : null;
      if (!a || a.parentNode !== box) return;
      ev.preventDefault();
      var tid = a.getAttribute('data-tid') || '';
      if (tid.charAt(0) === '@') { openF = folderByKey(tid.slice(1)); render(); window.scrollTo(0, 0); }
      else toast('試しの画面なので、ボタンの先は開きません😊');
    });
  }
  render();
}
