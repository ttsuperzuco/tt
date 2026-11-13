// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：foldertest
var FOLDERTEST_START_ = ['sejutsugo', 'yoyaku', 'akijikan', 'links', 'ttapp',
  { f: 'LINE送信', items: ['zenjitsu', 'mita', 'bcast', 'sgline'] },
  { f: 'チェック', items: ['conflict', 'lt'] },
  { f: 'SNS', items: ['threads', 'insta'] },
  { f: '販売・在庫', items: ['procstock', 'hanbai', 'shomeisho'] }];
function renderFolderTestPage_(base, staff, dev) {
  var tiles = {};
  var want = [];
  FOLDERTEST_START_.forEach(function (x) { if (typeof x === 'string') want.push(x); else want = want.concat(x.items); });
  var byId = {};
  for (var i = 0; i < TILE_DEFS_.length; i++) byId[TILE_DEFS_[i].id] = TILE_DEFS_[i];
  want.forEach(function (id) { var t = byId[id]; if (t) tiles[id] = { icon: t.icon, label: t.label, cls: t.cls }; });
  var D = { tiles: tiles, start: FOLDERTEST_START_, home: (base || '') + '?view=home' + roleSfx_(staff, dev) };
  return '<style>' + HOMECSS_ + FOLDERTESTCSS_ + '</style><div class="home hsort" id="ftHome"></div>' +
    '<script>(' + folderTestBoot_.toString() + ')(' + JSON.stringify(D).replace(/</g, '\\u003c') + ');</' + 'script>';
}
var FOLDERTESTCSS_ =
  '  .tile.foldertest::before { background:#94a3b8; }' +
  '  .tile.ftfolder::before { background:#94a3b8; }' +
  '  #ftHome .tiles { grid-auto-rows:1fr; }' +
  '  .ftmini { flex:none; width:48px; height:48px; border-radius:11px; background:rgba(148,163,184,.22); display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:2px; padding:3px; box-sizing:border-box; margin-right:4px; }' +
  '  .ftmini .ticon { width:20px; height:20px; font-size:16px; border-radius:5px; background:transparent!important; margin:auto; }' +
  '  .ftmini .ticon img { width:20px; height:20px; }' +
  '  .ftmini .ftmore { font-size:12px; font-weight:900; color:#475569; display:grid; place-items:center; }' +
  '  .ftcount { display:block; font-size:.78rem; font-weight:800; opacity:.75; margin-top:2px; }' +
  '  .tile.ftdropto { outline:3px solid #fbbf24; outline-offset:-3px; }' +
  '  .fttoast { position:fixed; left:50%; bottom:24px; transform:translateX(-50%); background:#fff; color:#12303c; font-weight:800; border-radius:14px; padding:12px 16px; box-shadow:0 6px 20px rgba(0,0,0,.25); display:none; z-index:10002; font-size:.95rem; max-width:90vw; text-align:center; }' +
  '  .ftmbtn { display:block; width:100%; font:inherit; font-size:1.2rem; font-weight:800; padding:14px; margin:0 0 10px; border-radius:12px; border:0; background:#fff; color:#12303c; cursor:pointer; }' +
  '  .ftmtitle { font-size:1.3rem; font-weight:900; margin-bottom:14px; }' +
  '  .ftname { width:100%; box-sizing:border-box; font:inherit; font-size:1.3rem; font-weight:800; padding:12px 14px; border-radius:12px; border:0; color:#12303c; }';
function folderTestBoot_(D) {
  var T = D.tiles, KEY = 'sz_foldertest', HOLD = 450, SLOP = 10;
  var home = document.getElementById('ftHome');
  if (!home) return;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function lbl(id) { return String(T[id].label).replace(/\n/g, ''); }
  function clean(list) {
    var out = [], seen = {};
    (list || []).forEach(function (x) {
      if (typeof x === 'string') { if (T[x] && !seen[x]) { out.push(x); seen[x] = 1; } }
      else if (x && x.items) {
        var it = x.items.filter(function (y) { if (!T[y] || seen[y]) return false; seen[y] = 1; return true; });
        if (it.length) out.push({ f: String(x.f || 'フォルダ'), items: it });
      }
    });
    for (var id in T) if (!seen[id]) out.push(id);
    return out;
  }
  function load() { try { var s = localStorage.getItem(KEY); if (s) return clean(JSON.parse(s)); } catch (e) {} return clean(D.start); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }
  var items = load(), openF = null;

  function tileHtml(id) {
    return '<a class="tile ' + T[id].cls + '" href="#" data-id="' + id + '" draggable="false">' + T[id].icon + '<span class="tname">' + esc(T[id].label) + '</span></a>';
  }
  function folderHtml(F, i) {
    var n = F.items.length, cells = '', show = n > 4 ? 3 : n;
    for (var k = 0; k < show; k++) cells += T[F.items[k]].icon;
    if (n > 4) cells += '<span class="ftmore">+' + (n - 3) + '</span>';
    return '<a class="tile ftfolder" href="#" data-folder="' + i + '" draggable="false"><span class="ftmini">' + cells + '</span>' +
      '<span class="tname">' + esc(F.f) + '<span class="ftcount">' + n + '個</span></span></a>';
  }
  function render() {
    if (openF && items.indexOf(openF) < 0) openF = null;
    var h = '<div class="hhead"><img class="bmark" src="https://ttsuperzuco.github.io/tt/icons/icon-180.png" alt=""><span class="bname">TTスーパーズコ</span></div>' +
      '<div class="hsub">フォルダの試し（長押しでメニューが出ます😊）</div>';
    if (!openF) {
      h += '<div class="backbar"><button type="button" class="backbtn" id="ftBack">← 戻る</button>' +
        '<span class="hreset"><button type="button" class="hresetbtn" id="ftReset">↺ 初期の並びに戻す</button></span></div>' +
        '<div class="grouptitle">💼 スタッフ画面（' + items.length + '個）</div>' +
        '<div class="tiles" id="ftBox">' + items.map(function (x, i) { return typeof x === 'string' ? tileHtml(x) : folderHtml(x, i); }).join('') + '</div>';
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
      items.splice(pos, 0, { f: nm, items: [id] }); dropEmpty();
      done('新しいフォルダ「' + nm + '」を作成しました');
    });
  }
  function pickFolder(id) {
    var cur = where(id), btns = [];
    items.forEach(function (x) {
      if (typeof x !== 'string' && x !== cur) btns.push({ label: '📂 ' + esc(x.f), fn: function () { moveToFolder(id, x); } });
    });
    btns.push({ label: '＋ 新しいフォルダを作成', fn: function () { newFolder(id); } });
    sheet('「' + esc(lbl(id)) + '」を<br>どのフォルダに移動しますか？😊', btns);
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
    var fi = el.getAttribute('data-folder');
    if (fi != null) {
      var F = items[+fi];
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
    var id = el.getAttribute('data-id');
    if (!openF) sheet('「' + esc(lbl(id)) + '」', [{ label: '📂 フォルダに移動', fn: function () { pickFolder(id); } }]);
    else sheet('「' + esc(lbl(id)) + '」', [
      { label: '⬆️ トップに移動', fn: function () { toTop(id); } },
      { label: '📂 ほかのフォルダに移動', fn: function () { pickFolder(id); } }
    ]);
  }

  var st = null, lastUp = 0, lastTouchAt = 0;
  function down(el, x, y) { st = { el: el, x0: x, y0: y, drag: false, moved: false, target: null, outside: false }; st.timer = setTimeout(lift, HOLD); }
  function lift() {
    if (!st) return;
    st.drag = true; st.el.classList.add('tdrag'); home.classList.add('hsorting');
    try { if (navigator.vibrate) navigator.vibrate(25); } catch (e) {}
  }
  function move(x, y, ev) {
    if (!st) return;
    if (!st.drag) { if (Math.abs(x - st.x0) > SLOP || Math.abs(y - st.y0) > SLOP) { clearTimeout(st.timer); unbind(st); st = null; } return; }
    if (ev && ev.cancelable) ev.preventDefault();   
    if (Math.abs(x - st.x0) > SLOP || Math.abs(y - st.y0) > SLOP) st.moved = true;
    st.el.style.transform = 'translate(' + (x - st.x0) + 'px,' + (y - st.y0) + 'px) scale(1.05)';
    var u = document.elementFromPoint(x, y), t = (u && u.closest) ? u.closest('a.tile') : null;
    if (st.target && st.target !== t) st.target.classList.remove('ftdropto');
    st.target = (t && t !== st.el && st.el.hasAttribute('data-id')) ? t : null;
    st.outside = !(u && u.closest && u.closest('#ftBox'));
    if (st.target && !openF) st.target.classList.add('ftdropto');
  }
  function unbind(s) {
    if (s.tm) { s.el.removeEventListener('touchmove', s.tm); s.el.removeEventListener('touchend', s.te); s.el.removeEventListener('touchcancel', s.te); }
    if (s.mm) { document.removeEventListener('mousemove', s.mm); document.removeEventListener('mouseup', s.mu); }
  }
  function up(ev) {
    if (!st) return;
    clearTimeout(st.timer);
    var s = st; st = null; unbind(s);
    if (!s.drag) return;
    if (ev && ev.cancelable) ev.preventDefault();
    lastUp = Date.now();
    s.el.classList.remove('tdrag'); home.classList.remove('hsorting'); s.el.style.transform = '';
    if (s.target) s.target.classList.remove('ftdropto');
    if (!s.moved) { menuFor(s.el); return; }   
    var did = s.el.getAttribute('data-id');
    if (!did) { render(); return; }
    if (openF) {   
      if (s.outside) toTop(did); else render();
      return;
    }
    if (s.target) {
      var tf = s.target.getAttribute('data-folder');
      if (tf != null) { moveToFolder(did, items[+tf]); return; }
      var tid = s.target.getAttribute('data-id'), ti = items.indexOf(tid);
      takeOut(did); ti = items.indexOf(tid);
      items[ti] = { f: '新しいフォルダ', items: [tid, did] };
      done('新しいフォルダができました（名前は長押しで変更できます😊）');
      return;
    }
    render();
  }
  function bind() {
    var bk = document.getElementById('ftBack');
    if (bk) bk.onclick = function () {
      if (openF) { openF = null; render(); window.scrollTo(0, 0); return; }
      try { window.top.location.href = D.home; } catch (e) { location.href = D.home; }
    };
    var rs = document.getElementById('ftReset');
    if (rs) rs.onclick = function () { try { localStorage.removeItem(KEY); } catch (e) {} items = clean(D.start); openF = null; render(); toast('初期の並びに戻しました'); };
    var box = document.getElementById('ftBox');
    if (!box) return;
    function tileOf(t) { var a = (t && t.closest) ? t.closest('a.tile') : null; return (a && a.parentNode === box) ? a : null; }
    box.addEventListener('touchstart', function (ev) {
      lastTouchAt = Date.now();
      if (ev.touches.length !== 1 || st) return;
      var a = tileOf(ev.target); if (!a) return;
      var p = ev.touches[0];
      down(a, p.clientX, p.clientY);
      st.tm = function (e) { var q = e.touches[0]; if (q) move(q.clientX, q.clientY, e); };
      st.te = function (e) { lastTouchAt = Date.now(); up(e); };
      a.addEventListener('touchmove', st.tm, { passive: false });
      a.addEventListener('touchend', st.te);
      a.addEventListener('touchcancel', st.te);
    }, { passive: true });
    box.addEventListener('mousedown', function (ev) {
      if (ev.button !== 0 || st || Date.now() - lastTouchAt < 1200) return;
      var a = tileOf(ev.target); if (!a) return;
      ev.preventDefault();
      down(a, ev.clientX, ev.clientY);
      st.mm = function (e) { move(e.clientX, e.clientY, e); };
      st.mu = function (e) { up(e); };
      document.addEventListener('mousemove', st.mm);
      document.addEventListener('mouseup', st.mu);
    });
    box.addEventListener('click', function (ev) {
      var a = tileOf(ev.target); if (!a) return;
      ev.preventDefault();
      if (Date.now() - lastUp < 700) return;   
      var fi = a.getAttribute('data-folder');
      if (fi != null) { openF = items[+fi]; render(); window.scrollTo(0, 0); }
      else toast('試しの画面なので、ボタンの先は開きません😊');
    });
    box.addEventListener('contextmenu', function (ev) { if (tileOf(ev.target)) ev.preventDefault(); });
    box.addEventListener('dragstart', function (ev) { if (tileOf(ev.target)) ev.preventDefault(); });
  }
  render();
}
