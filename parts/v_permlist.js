// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：permlist
var PERMLIST_CSS_ =
  '.plw { --pc:#ffffff; --pi:#0f172a; --ps:#64748b; --pl:#e2e8f0; position:fixed; inset:0; background:#2C7A99;' +
  '  display:flex; flex-direction:column; font-family:"Segoe UI","Yu Gothic UI","Hiragino Sans",system-ui,sans-serif; }' +
  '@media (prefers-color-scheme: dark) { .plw { --pc:#151e30; --pi:#e8eef7; --ps:#94a3b8; --pl:#26324a; } }' +
  '.plin { flex:1; min-height:0; width:100%; max-width:1000px; margin:0 auto; padding:14px 12px 0; display:flex; flex-direction:column; }' +
  '.plw .ubar { margin:0 0 10px; }' +
  '.pltitle { color:#fff; font-size:1.3rem; font-weight:900; margin:0 0 4px; }' +
  '.plhint { color:#e6f2f7; font-size:.84rem; line-height:1.7; margin:0 0 10px; }' +
  '.plhint .plc { width:24px; height:19px; font-size:.75rem; vertical-align:-4px; cursor:default; border-radius:6px; }' +
  '.plwrap { flex:1; min-height:0; overflow:auto; background:var(--pc); border-radius:14px; box-shadow:0 6px 18px rgba(0,0,0,.14); }' +
  '.plload { padding:40px 16px; text-align:center; color:var(--ps); font-weight:800; }' +
  '.pltab { border-collapse:separate; border-spacing:0; width:100%; font-size:.88rem; color:var(--pi); }' +
  '.pltab thead th { position:sticky; top:0; z-index:3; background:var(--pc); border-bottom:2px solid var(--pl);' +
  '  padding:8px 3px 6px; text-align:center; vertical-align:bottom; }' +
  '.pltab thead th.pllab0 { left:0; z-index:4; text-align:left; padding-left:10px; color:var(--ps); font-size:.78rem; }' +
  '.plm { font-size:23px; line-height:1.15; }' +
  '.plm.plmt { font-size:.7rem; font-weight:900; line-height:1.3; white-space:nowrap; background:#111827; color:#fff;' +
  '  border-radius:8px; padding:3px 5px; display:inline-block; }' +
  '.pln { font-size:.7rem; font-weight:800; color:var(--ps); margin-top:2px; white-space:nowrap; }' +
  '.plk { font-size:.72rem; font-weight:900; color:#16a34a; margin-top:2px; white-space:nowrap; }' +
  '.plz { font-size:.62rem; color:#94a3b8; white-space:nowrap; }' +
  '.plunused .plm { opacity:.5; }' +
  '.plroom td { background:rgba(44,122,153,.14); color:var(--pi); font-weight:900; font-size:.92rem;' +
  '  padding:9px 10px; border-bottom:1px solid var(--pl); text-align:left; }' +
  '.plrin { display:inline-block; margin-right:6px; }' +
  '.plrin img { height:1.3em; width:auto; vertical-align:-.3em; }' +
  '.pllab { position:sticky; left:0; z-index:2; background:var(--pc); text-align:left; font-weight:800;' +
  '  padding:5px 6px 5px 8px; border-bottom:1px solid var(--pl); }' +
  '.pllw { display:flex; align-items:center; gap:7px; min-width:0; }' +
  '.pllw .plt { white-space:nowrap; }' +
  '.plic { flex:none; width:28px; height:28px; display:grid; place-items:center; }' +
  '.plic .ticon { width:28px !important; height:28px !important; border-radius:7px; font-size:17px; overflow:hidden; display:grid; place-items:center; }' +
  '.plic .ticon img, .plic .ticon svg { width:100%; height:100%; display:block; object-fit:cover; }' +
  '.pltab td { text-align:center; padding:5px 2px; border-bottom:1px solid var(--pl); }' +
  '.pltab tbody tr:not(.plroom):hover th, .pltab tbody tr:not(.plroom):hover td { background:rgba(44,122,153,.07); }' +
  '.plc { width:38px; height:32px; border-radius:10px; font:inherit; font-size:1.1rem; font-weight:900; cursor:pointer;' +
  '  border:2px solid transparent; display:inline-grid; place-items:center; padding:0; }' +
  '.plc.on { background:#16a34a; color:#fff; }' +
  '.plc.off { background:rgba(148,163,184,.10); color:transparent; border:2px dashed rgba(148,163,184,.7); }' +
  '.plc.chg { box-shadow:0 0 0 3px #f59e0b; }' +
  '.plc.lk { opacity:.55; cursor:default; }' +
  '.pldev { color:#94a3b8; font-size:.78rem; font-weight:700; text-align:left !important; padding-left:8px !important; white-space:nowrap; }' +
  '.plopt { color:#fff; font-size:.84rem; font-weight:700; margin:10px 2px; display:flex; align-items:center; gap:8px; cursor:pointer; }' +
  '.plfoot { flex:none; background:#123244; padding:12px 12px calc(12px + env(safe-area-inset-bottom)); display:flex; align-items:center; gap:8px; }' +
  '.plcnt { color:#fff; font-weight:800; margin-right:auto; font-size:.9rem; }' +
  '.plfoot.has .plcnt { color:#fbbf24; }' +
  '.plundo, .plsave { font:inherit; font-weight:900; border:0; border-radius:12px; cursor:pointer; white-space:nowrap; }' +
  '.plundo { font-size:.92rem; color:#fff; background:#64748b; padding:11px 14px; }' +
  '.plsave { font-size:1.02rem; color:#fff; background:#16a34a; padding:11px 20px; }' +
  '.plundo:disabled, .plsave:disabled { opacity:.4; cursor:default; }' +
  '@media (max-width:520px) { .pllw .plt { white-space:normal; max-width:7.5em; line-height:1.25; font-size:.8rem; } .plc { width:34px; } }';
var PERMLIST_MARKS_ = {
  kanbu: ['🍅', 'トマト'], mikan: ['🍊', 'みかん'], olive: ['🫒', 'オリーブ'], pine: ['🍍', 'パイン'],
  reception: ['受付PC', '受付PC'], reception_sp: ['受付スマホ', '受付スマホ'],
  ringo: ['🍎', 'りんご'], mango: ['🥭', 'マンゴー'], coconut: ['🥥', 'ココナッツ']
};
function renderPermListPage_(base, staff, dev) {
  var rooms = [];
  for (var i = 0; i < ROLE_DEFS_.length; i++) {
    var R = ROLE_DEFS_[i];
    rooms.push({ id: R.id, title: R.title, icon: R.icon });
    var subs = SUB_ROLES_[R.id] || [];
    for (var s = 0; s < subs.length; s++) rooms.push({ id: subs[s].id, title: subs[s].title, icon: subs[s].icon });
  }
  var known = {};
  for (var k = 0; k < rooms.length; k++) known[rooms[k].id] = 1;
  var rows = TILE_DEFS_.map(function (t) {
    var g = tileGroup_(t.id);
    return { id: t.id, label: String(t.label || '').replace(/\n/g, ''), icon: tileIcon_(t, true), group: known[g] ? g : 'jitsumu' };
  });
  var opt = {
    exec: 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec',
    key: 'kx7Q2p9mVt4Zr8', rooms: rooms, rows: rows, people: PEOPLE_, labels: PERSON_LABEL_, marks: PERMLIST_MARKS_,
    main: HOME_AS_PEOPLE_.filter(function (p) { return p.id; }).map(function (p) { return p.id; })
  };
  return '<style>' + PERMLIST_CSS_ + '</style>' +
    '<div class="plw"><div class="plin">' + backBarUnlessSolo_(base, staff, dev) +
    '<div class="pltitle">👥 スタッフごと表示一覧</div>' +
    '<div class="plhint"><span class="plc on">✓</span> その人のズコに出ている　<span class="plc off"></span> 出ていない　' +
    '<span class="plc on chg">✓</span> 切り替えた（まだ保存していません）<br>' +
    'マスを押すと「出す／出さない」が切り替わります。最後に下の「保存する」を押すと、スタッフのズコに反映されます。</div>' +
    '<div class="plwrap" id="plGrid"><div class="plload">読み込んでいます…</div></div>' +
    '<label class="plopt" id="plOptRow" style="display:none"><input type="checkbox" id="plRest"> <span id="plOptTxt"></span></label>' +
    '</div><div class="plfoot" id="plFoot"><span class="plcnt" id="plCnt">変更はありません</span>' +
    '<button type="button" class="plundo" id="plUndo" disabled>元に戻す</button>' +
    '<button type="button" class="plsave" id="plSave" disabled>保存する</button></div></div>' +
    '<script>(' + permListBoot_.toString() + ')(' + JSON.stringify(opt).replace(/<\//g, '<\\/') + ');</' + 'script>';
}
function permListBoot_(o) {
  var D = null, ORIG = {}, CUR = {}, SHOW_REST = false;
  var grid = document.getElementById('plGrid'), cnt = document.getElementById('plCnt'), foot = document.getElementById('plFoot');
  var bSave = document.getElementById('plSave'), bUndo = document.getElementById('plUndo');
  if (!grid) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function copy(x) { return JSON.parse(JSON.stringify(x || {})); }
  function pop(msg, opts) { if (typeof szPopup_ === 'function') szPopup_(msg, opts); else { if (opts && opts.cancel) { if (confirm(msg) && opts.onYes) opts.onYes(); } else alert(msg); } }
  function jsonp(params, onR) {
    var cb = '__pl' + Date.now() + Math.floor(Math.random() * 1000);
    window[cb] = function (r) { try { delete window[cb]; } catch (e) {} onR(r || {}); };
    var qs = 'callback=' + cb; for (var k in params) qs += '&' + k + '=' + encodeURIComponent(params[k]);
    var sc = document.createElement('script'); sc.src = o.exec + '?' + qs + '&cb=' + Date.now();
    sc.onerror = function () { onR({ ok: false, error: '通信エラー' }); }; document.body.appendChild(sc);
  }
  function locked(p, t) { return p === 'kanbu' && t === 'yoyaku'; }   
  function isOn(x, p, t) { return !!((x[p] || {})[t]); }
  function changes() { var n = 0; for (var p in CUR) for (var t in CUR[p]) if (isOn(CUR, p, t) !== isOn(ORIG, p, t)) n++; return n; }
  function mark(p) { return o.marks[p] || [D.labels[p] || p, D.labels[p] || p]; }
  function mainCols() { return o.main.filter(function (p) { return D.people.indexOf(p) >= 0; }); }
  function restCols() { var m = mainCols(); return D.people.filter(function (p) { return m.indexOf(p) < 0; }); }
  function cols() { return SHOW_REST ? mainCols().concat(restCols()) : mainCols(); }
  function draw() {
    var cs = cols(), h = '<table class="pltab"><thead><tr><th class="pllab0">ボタン</th>';
    cs.forEach(function (p) {
      var m = mark(p), n = 0, txt = m[0].length > 2, used = p === 'kanbu' || D.claimed.indexOf(p) >= 0;
      D.assignable.forEach(function (t) { if (isOn(CUR, p, t)) n++; });
      h += '<th class="' + (used ? '' : 'plunused') + '"><div class="plm' + (txt ? ' plmt' : '') + '">' + esc(m[0]) + '</div>' +
        (txt ? '' : '<div class="pln">' + esc(m[1]) + '</div>') + '<div class="plk">' + n + '個</div>' +
        (used ? '' : '<div class="plz">使っていない</div>') + '</th>';
    });
    h += '</tr></thead><tbody>';
    o.rooms.forEach(function (r) {
      var rs = D.rows.filter(function (x) { return x.group === r.id; });
      if (!rs.length) return;
      h += '<tr class="plroom"><td colspan="' + (cs.length + 1) + '"><span class="plrin">' + r.icon + '</span>' + esc(r.title) + '</td></tr>';
      rs.forEach(function (row) {
        h += '<tr><th class="pllab"><div class="pllw"><span class="plic">' + row.icon + '</span><span class="plt">' + esc(row.label) + '</span></div></th>';
        if (D.assignable.indexOf(row.id) < 0) {
          h += '<td class="pldev" colspan="' + cs.length + '">🐉 りゅうだけ（スタッフには表示できません）</td>';
        } else {
          cs.forEach(function (p) {
            var on = isOn(CUR, p, row.id), lk = locked(p, row.id), ch = on !== isOn(ORIG, p, row.id);
            var tip = mark(p)[1] + '：' + row.label + (lk ? '（トマトにはいつも出します）' : (on ? 'を出しています' : 'を出していません'));
            h += '<td><button type="button" class="plc ' + (on ? 'on' : 'off') + (lk ? ' lk' : '') + (ch ? ' chg' : '') +
              '" data-p="' + esc(p) + '" data-t="' + esc(row.id) + '" title="' + esc(tip) + '">' + (on ? '✓' : '') + '</button></td>';
          });
        }
        h += '</tr>';
      });
    });
    h += '</tbody></table>';
    var top = grid.scrollTop, left = grid.scrollLeft;
    grid.innerHTML = h; grid.scrollTop = top; grid.scrollLeft = left;
    var n = changes();
    cnt.textContent = n ? ('変更 ' + n + 'か所（まだ保存していません）') : '変更はありません';
    foot.className = 'plfoot' + (n ? ' has' : '');
    bSave.disabled = !n; bUndo.disabled = !n;
  }
  function load() {
    grid.innerHTML = '<div class="plload">読み込んでいます…</div>';
    jsonp({ action: 'data', name: 'tile_settings.json' }, function (cfg) {
      if (!cfg || cfg.error || !cfg.perms) { grid.innerHTML = '<div class="plload">読み込めませんでした。再読込してください🙇</div>'; return; }
      var people = o.people.slice(), labels = copy(o.labels);
      (cfg.extraPeople || []).forEach(function (e) { if (e && e.id) { if (people.indexOf(e.id) < 0) people.push(e.id); labels[e.id] = e.label || e.id; } });
      var asg = {};
      people.forEach(function (p) { var v = cfg.perms[p]; if (v && typeof v === 'object') for (var t in v) asg[t] = 1; });
      var perms = {};
      people.forEach(function (p) { perms[p] = {}; for (var t in asg) perms[p][t] = !!((cfg.perms[p] || {})[t]); });
      var ord = cfg.order || [], idx = {};
      ord.forEach(function (id, i) { idx[id] = i; });
      var rows = o.rows.slice().sort(function (a, b) { return (a.id in idx ? idx[a.id] : 999) - (b.id in idx ? idx[b.id] : 999); });
      D = { people: people, labels: labels, assignable: Object.keys(asg), claimed: Object.keys(cfg.claimed || {}), rows: rows };
      ORIG = copy(perms); CUR = copy(perms);
      var rest = restCols();
      document.getElementById('plOptRow').style.display = rest.length ? '' : 'none';
      document.getElementById('plOptTxt').textContent = 'ほかの名前（' + rest.map(function (p) { return mark(p)[1]; }).join('・') + '）も出す';
      draw();
    });
  }
  grid.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.plc') : null; if (!b || !D) return;
    var p = b.getAttribute('data-p'), t = b.getAttribute('data-t');
    if (locked(p, t)) { pop('トマトの予約入力は、いつも出す決まりです。', { icon: '' }); return; }
    if (!CUR[p]) CUR[p] = {};
    CUR[p][t] = !isOn(CUR, p, t);
    draw();
  });
  document.getElementById('plRest').addEventListener('change', function (e) { SHOW_REST = e.target.checked; if (D) draw(); });
  bUndo.addEventListener('click', function () { CUR = copy(ORIG); draw(); });
  var back = document.querySelector('.plw .uhome');
  if (back) back.addEventListener('click', function (e) {
    var n = D ? changes() : 0; if (!n) return;
    e.preventDefault();
    var href = back.getAttribute('href');
    pop('保存していない変更が ' + n + 'か所あります。\n保存せずに戻りますか？😊', { cancel: true, yesLabel: '保存せずに戻る', noLabel: '一覧にとどまる',
      onYes: function () { location.href = href; } });
  });
  function fail(msg) { if (typeof szOvHide_ === 'function') szOvHide_(); pop(msg || '保存できませんでした。もう一度試してもらえると嬉しいです🙇'); }
  function poll(id, tries) {
    jsonp({ action: 'status', key: o.key, id: id }, function (r) {
      if (r && r.ok && r.status === 'done') {
        szOvShow_(szDoneHtml_('保存が完了しました', '一覧に戻る'), '#16a34a');
        var bk = document.getElementById('szDoneBack');
        if (bk) bk.addEventListener('click', function () { szOvHide_(); load(); });
        return;
      }
      if (r && r.ok && r.status === 'error') { fail('保存できませんでした。' + (r.result || '')); return; }
      if (tries <= 0) { fail('時間切れです。少したってから再読込して、反映されたかご確認くださいませ🙇'); return; }
      setTimeout(function () { poll(id, tries - 1); }, 3000);
    });
  }
  bSave.addEventListener('click', function () {
    if (!D || !changes()) return;
    var p = {};   
    D.people.forEach(function (pid) { p[pid] = []; for (var t in (CUR[pid] || {})) if (CUR[pid][t]) p[pid].push(t); });
    var val = JSON.stringify({ t: 'save', p: p });
    szOvShow_(szBusyHtml_('保存中です', 'スタッフのズコへ送っています。1分ほどかかりますので、少し待っててくださいね🥺'), '#2C7A99');
    function got(r) { if (r && r.ok && r.id) poll(r.id, 40); else fail('保存できませんでした。' + ((r && r.error) || '')); }
    var api = (window.pywebview && window.pywebview.api && window.pywebview.api.kanshi_ctl) ? window.pywebview.api : null;
    if (api) { api.kanshi_ctl('tile_settings', 'setval', val).then(got, function () { fail(); }); return; }   
    var dv = '';
    try { dv = window.__SZ_DEVICE_ || localStorage.getItem('sz_device') || ''; } catch (e) {}
    jsonp({ action: 'submit', key: o.key, op: 'kanshi_ctl', device: dv,
      fields: JSON.stringify({ ctl_key: 'tile_settings', ctl_act: 'setval', ctl_val: val, ctl_machine: '' }) }, got);
  });
  load();
}
