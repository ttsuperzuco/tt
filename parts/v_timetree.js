// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：timetree
function renderTimeTreePage_(base, staff, dev) {
  var css =
    'html,body{background:#fff !important;}' +
    '.home.tvhome{max-width:560px;padding:0 0 60px;min-height:100vh;background:#fff;}' +
    '.tv{width:100%;margin:0 auto;text-align:left;box-sizing:border-box;color:#333;background:#fff;' +
      'font-family:"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic UI","Segoe UI",system-ui,sans-serif;}' +
    '.tv button{font-family:inherit;}' +
    '.tvbar{position:sticky;top:0;z-index:5;background:#fff;padding:10px 12px 4px;}' +
    '.tvbar .ubar{margin:0;}' +
    '.tvback{border:1px solid #e2e8f0;cursor:pointer;font:inherit;}' +
    '.tvstatus{color:#666;font-weight:700;font-size:15px;margin:24px 16px;line-height:1.6;}' +
    '.tvmh{display:flex;align-items:center;gap:8px;padding:6px 12px 8px;}' +
    '.tvym{border:0;background:none;font-size:21px;font-weight:800;color:#222;cursor:pointer;padding:4px 2px;' +
      'display:flex;align-items:center;gap:5px;}' +
    '.tvym i{font-style:normal;font-size:11px;color:#9a9a9a;}' +
    '.tvsp{flex:1;}' +
    '.tvic{flex:none;border:0;background:#f2f2f2;color:#555;width:34px;height:34px;border-radius:50%;' +
      'font-size:20px;font-weight:700;cursor:pointer;line-height:34px;padding:0;text-align:center;}' +
    '.tvic:disabled{opacity:.3;cursor:default;}' +
    '.tvtd{flex:none;border:1px solid #ddd;background:#fff;color:#333;border-radius:999px;font-size:13px;' +
      'font-weight:700;padding:6px 12px;cursor:pointer;}' +
    '.tvchips{display:flex;gap:8px;padding:0 12px 10px;overflow-x:auto;}' +
    '.tvchip{flex:none;display:flex;align-items:center;gap:7px;border:1px solid #e3e3e3;background:#fff;color:#333;' +
      'border-radius:10px;padding:4px 11px 4px 4px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;}' +
    '.tvchip .ck{width:24px;height:24px;border-radius:7px;background:#e9e9e9;color:#fff;display:flex;' +
      'align-items:center;justify-content:center;font-size:14px;font-weight:900;}' +
    '.tvchip.sel{border-color:#cfeee0;}' +
    '.tvchip.sel .ck{background:#2bad6f;}' +
    '.tvwk{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));border-bottom:1px solid #eee;}' +
    '.tvwk div{text-align:center;font-size:11px;color:#999;padding:2px 0 5px;}' +
    '.tvwk .sat{color:#3d8ae0;}.tvwk .sun{color:#e85a5a;}' +
    '.tvweek{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));border-bottom:1px solid #eee;}' +
    '.tvc{display:flex;flex-direction:column;align-items:stretch;gap:2px;min-width:0;min-height:108px;' +
      'padding:4px 1px 5px;background:#fff;border:0;cursor:pointer;text-align:center;color:#333;}' +
    '.tvc.sel{background:#f2f2f2;}' +
    '.tvc .dn{align-self:center;width:22px;height:22px;line-height:22px;border-radius:50%;font-size:12px;' +
      'font-weight:600;color:#333;margin-bottom:1px;}' +
    '.tvc.sat .dn{color:#3d8ae0;}.tvc.sun .dn{color:#e85a5a;}' +
    '.tvc.out .dn{color:#c9c9c9;}' +
    '.tvc.today .dn{background:#222;color:#fff;font-weight:800;}' +
    '.tvb{display:block;font-size:10px;font-weight:700;line-height:15px;height:15px;border-radius:3px;padding:0 2px;' +
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center;}' +
    '.tvb.fill{color:#fff;}' +
    '.tvmore{font-size:10px;color:#999;font-weight:700;line-height:13px;}' +
    '.tvic svg{width:18px;height:18px;display:block;margin:auto;}' +
    '.tvsrch{padding:4px 14px 8px;}' +
    '.tvq{display:block;width:100%;box-sizing:border-box;border:0;background:#f2f2f2;border-radius:10px;padding:11px 12px;' +
      'font:inherit;font-size:16px;color:#222;outline:none;}' +
    '.tvscnt{font-size:12px;color:#999;font-weight:700;padding:4px 16px 2px;}' +
    '.tvsechd{font-size:13px;font-weight:800;color:#888;padding:16px 16px 2px;border-top:1px solid #eee;margin-top:8px;}' +
    '.tvdate{font-size:13px;font-weight:800;color:#555;padding:10px 16px 2px;}' +
    '.tvsmore{display:flex;flex-direction:column;align-items:center;gap:8px;padding:18px 16px 10px;font-size:12px;color:#999;}' +
    '.tvdh{display:flex;align-items:center;gap:8px;padding:6px 14px 4px;}' +
    '.tvmode{flex:none;display:flex;background:#f2f2f2;border-radius:9px;padding:2px;}' +
    '.tvmode button{border:0;background:transparent;color:#777;font-size:13px;font-weight:800;padding:5px 10px;border-radius:7px;cursor:pointer;}' +
    '.tvmode button.sel{background:#fff;color:#222;box-shadow:0 1px 3px rgba(0,0,0,.15);}' +
    '.tvwkhd{display:grid;grid-template-columns:34px repeat(7,minmax(0,1fr));border-bottom:1px solid #eee;}' +
    '.tvwkhd .d{text-align:center;padding:2px 0 4px;cursor:pointer;background:none;border:0;}' +
    '.tvwkhd .d small{display:block;font-size:11px;color:#999;}' +
    '.tvwkhd .d b{display:inline-block;width:24px;height:24px;line-height:24px;border-radius:50%;font-size:13px;font-weight:700;color:#333;}' +
    '.tvwkhd .d.sat small,.tvwkhd .d.sat b{color:#3d8ae0;}.tvwkhd .d.sun small,.tvwkhd .d.sun b{color:#e85a5a;}' +
    '.tvwkhd .d.today b{background:#222;color:#fff;}' +
    '.tvwkad{display:grid;grid-template-columns:34px repeat(7,minmax(0,1fr));border-bottom:1px solid #eee;padding:2px 0;}' +
    '.tvwkad .l{font-size:10px;color:#999;text-align:right;padding:2px 4px 0 0;}' +
    '.tvwkad .c{min-width:0;display:flex;flex-direction:column;gap:2px;padding:0 1px;}' +
    '.tvwkad .c .tvb{cursor:pointer;}' +
    '.tvwkgrid{position:relative;display:grid;grid-template-columns:34px repeat(7,minmax(0,1fr));}' +
    '.tvwkgrid .t{position:relative;}' +
    '.tvwkgrid .t span{position:absolute;right:4px;font-size:10px;color:#999;transform:translateY(-50%);}' +
    '.tvwkgrid .col{position:relative;border-left:1px solid #f0f0f0;min-width:0;}' +
    '.tvwkgrid .col.today{background:#fafafa;}' +
    '.tvwkgrid .hl{position:absolute;left:0;right:0;border-top:1px solid #f0f0f0;}' +
    '.tvwkev{position:absolute;box-sizing:border-box;border-radius:3px;border-left:3px solid;padding:1px 2px;overflow:hidden;' +
      'font-size:10px;font-weight:700;line-height:1.25;cursor:pointer;word-break:break-all;}' +
    '.tvwkev small{display:block;font-size:9px;font-weight:600;opacity:.8;}' +
    '.tvnow{position:absolute;left:0;right:0;border-top:2px solid #e85a5a;z-index:2;}' +
    '.tvdh .dt{flex:1;min-width:0;font-size:18px;font-weight:800;color:#222;}' +
    '.tvdchips{padding:0 2px 2px;}' +
    '.tvlist{padding:0 0 20px;}' +
    '.tvrow{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;text-align:left;' +
      'background:#fff;border:0;padding:4px 14px;cursor:pointer;color:#333;}' +
    '.tvrow:active{background:#f5f5f5;}' +
    '.tvrow .tm{flex:none;width:36px;text-align:right;font-size:11px;font-weight:600;color:#9a9a9a;line-height:1.3;}' +
    '.tvrow .tm b{display:block;color:#555;font-weight:700;}' +
    '.tvrow .ln{flex:none;width:3px;align-self:stretch;border-radius:2px;min-height:30px;}' +
    '.tvrow .bd{flex:1;min-width:0;}' +
    '.tvrow .ti{display:block;font-size:14px;font-weight:700;line-height:1.35;color:#222;word-break:break-all;}' +
    '.tvrow .mm{display:block;font-size:12px;font-weight:500;line-height:1.35;color:#999;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.tvrow .av{flex:none;width:26px;height:26px;border-radius:50%;background:#f1f1f1;display:flex;align-items:center;' +
      'justify-content:center;font-size:13px;font-weight:800;color:#777;}' +
    '.tvdtop{padding:8px 20px 4px;text-align:center;font-size:17px;font-weight:800;line-height:1.45;word-break:break-all;}' +
    '.tvwhen{display:flex;align-items:center;gap:6px;padding:14px 20px 16px;border-bottom:1px solid #eee;}' +
    '.tvwhen .w{flex:1;min-width:0;}' +
    '.tvwhen .w small{display:block;font-size:12px;font-weight:800;color:#333;}' +
    '.tvwhen .w b{display:block;font-size:27px;font-weight:800;color:#222;line-height:1.25;}' +
    '.tvwhen .w.r small{font-weight:600;color:#555;}.tvwhen .w.r b{font-weight:500;color:#444;}' +
    '.tvwhen .arw{flex:none;width:26px;text-align:center;font-size:26px;font-weight:400;}' +
    '.tvmemo{white-space:pre-wrap;word-break:break-all;font-size:15px;line-height:1.75;margin:0;padding:16px 20px;' +
      'color:#333;font-family:inherit;border-bottom:1px solid #eee;}' +
    '.tvnomemo{color:#aaa;font-size:14px;padding:16px 20px;border-bottom:1px solid #eee;}' +
    '.tvinfo{padding:4px 0;border-bottom:1px solid #eee;}' +
    '.tvi{display:flex;align-items:center;gap:14px;padding:10px 20px;font-size:14px;color:#333;line-height:1.5;}' +
    '.tvi .k{flex:none;width:20px;height:20px;color:#999;display:flex;align-items:center;justify-content:center;}' +
    '.tvi .k svg{width:20px;height:20px;display:block;}' +
    '.tvi .v{flex:1;min-width:0;word-break:break-all;}' +
    '.tvi .v a{color:#2b7de9;}' +
    '.tvdot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:7px;}' +
    '.tvlog{padding:14px 20px 6px;text-align:center;}' +
    '.tvlog div{font-size:12px;color:#999;margin:3px 0;line-height:1.6;}' +
    '.tvacts{padding:14px 16px 0;}' +
    '.tvedit,.tvopen{display:block;width:100%;box-sizing:border-box;text-align:center;text-decoration:none;border-radius:12px;' +
      'font-size:16px;font-weight:800;padding:14px;margin:0 0 10px;cursor:pointer;}' +
    '.tvedit{background:#fff;color:#222;border:1px solid #ddd;}' +
    '.tvopen{background:#2bad6f;color:#fff;border:0;}' +
    '.tvsec{color:#888;font-weight:800;font-size:13px;margin:14px 20px 6px;}' +
    '.tvmemotx{display:block;width:calc(100% - 32px);margin:0 16px 12px;box-sizing:border-box;font:inherit;font-size:16px;' +
      'line-height:1.75;color:#222;background:#fff;border:1px solid #ddd;border-radius:12px;padding:12px;overflow:hidden;' +
      'resize:none;min-height:200px;}' +
    '.tvsave{display:block;width:calc(100% - 32px);margin:0 16px 12px;border:0;border-radius:12px;background:#2bad6f;color:#fff;' +
      'font-size:18px;font-weight:800;padding:16px;cursor:pointer;}' +
    '.tvpmask{position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.45);display:flex;align-items:center;' +
      'justify-content:center;padding:20px;}' +
    '.tvpbox{background:#fff;color:#222;border-radius:16px;padding:16px;width:100%;max-width:400px;box-shadow:0 14px 44px rgba(0,0,0,.3);}' +
    '.tvpnav{display:flex;align-items:center;gap:8px;margin:0 0 12px;}' +
    '.tvpnav .t{flex:1;text-align:center;font-size:19px;font-weight:800;}' +
    '.tvpgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:0 0 14px;}' +
    '.tvpm{border:0;border-radius:10px;background:#f2f2f2;color:#222;font-size:16px;font-weight:700;padding:13px 0;cursor:pointer;}' +
    '.tvpm.now{box-shadow:inset 0 0 0 2px #222;}' +
    '.tvpm.sel{background:#222;color:#fff;}' +
    '.tvpm:disabled{opacity:.3;cursor:default;}' +
    '.tvpclose{display:block;width:100%;border:1px solid #ddd;border-radius:10px;background:#fff;color:#333;' +
      'font-size:16px;font-weight:700;padding:11px;cursor:pointer;}';
  return '<style>' + HOMECSS_ + css + '</style>' +
    '<div class="home tvhome">' +
      '<div class="tv">' +
        '<div class="tvbar" id="tvbar">' + backBar_(base, staff, dev) + '</div>' +
        '<div id="tvbody"><div class="tvstatus">予定を読んでいます...</div></div>' +
      '</div>' +
    '</div>';
}
function ttviewStart_(exec, base, staff, dev) {
  var KEY = 'kx7Q2p9mVt4Zr8';
  var WD = ['月', '火', '水', '木', '金', '土', '日'];     
  var JWD = ['日', '月', '火', '水', '木', '金', '土'];
  var cache = {};          
  var SICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/></svg>';
  var waiting = {};
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var st = { step: 'month', k: 0, date: '', ev: null };
  var range = null;        
  var roomOnly = false;
  try { roomOnly = localStorage.getItem('sz_tv_roomonly') === '1'; } catch (e) {}
  var body = document.getElementById('tvbody');
  var bar = document.getElementById('tvbar');
  var homeBar = bar.innerHTML;
  var idn = (window.__SZ_WHO_ !== undefined) ? { who: window.__SZ_WHO_ || '', role: window.__SZ_ROLE_ || '', device: window.__SZ_DEVICE_ || '' } : { who: '', role: '', device: '' };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pad(n) { return ('0' + n).slice(-2); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseIso(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function monthOf(k) { return new Date(today.getFullYear(), today.getMonth() + k, 1); }
  function ym(k) { var m = monthOf(k); return m.getFullYear() + pad(m.getMonth() + 1); }
  function kOfYm(s) { var p = String(s).split('-'); return (+p[0] - today.getFullYear()) * 12 + (+p[1] - 1) - today.getMonth(); }
  function kOfDate(s) { var d = parseIso(s); return (d.getFullYear() - today.getFullYear()) * 12 + d.getMonth() - today.getMonth(); }
  function jpDay(s) { var d = parseIso(s); return (d.getMonth() + 1) + '月' + d.getDate() + '日(' + JWD[d.getDay()] + ')'; }
  function jpFull(s) { var d = parseIso(s); return d.getFullYear() + '年' + jpDay(s); }
  function msText(ms) {
    if (!ms) return '';
    var d = new Date(+ms);
    return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function tint(col) { return /^#[0-9a-fA-F]{6}$/.test(col || '') ? col + '26' : 'rgba(0,0,0,.06)'; }
  function isAllDay(e, ds) { return e.a === 1 || e.a === '1' || e.a === true || e.d < ds; }
  function isFill(e) { return e.a === 1 || e.a === '1' || e.a === true || e.d !== e.e; }
  function avOf(au) {
    var s = String(au || '').trim();
    if (!s) return '';
    try { return Array.from(s)[0]; } catch (x) { return s.charAt(0); }
  }
  function inRange(k) { return range ? (k >= range.lo && k <= range.hi) : (k >= -1 && k <= 5); }
  function jsonp(params, onR) {
    var cb = '__tvj' + Date.now() + Math.floor(Math.random() * 1000);
    window[cb] = function (r) { try { delete window[cb]; } catch (e) {} onR(r || {}); };
    var q = []; for (var k in params) q.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
    var s = document.createElement('script');
    s.src = exec + '?' + q.join('&') + '&callback=' + cb + '&cb=' + Date.now();
    s.onerror = function () { onR({}); };
    document.body.appendChild(s);
  }

  function load(k, cb) {
    var name = ym(k);
    if (cache[name]) { cb(cache[name]); return; }
    if (waiting[name]) { waiting[name].push(cb); return; }
    waiting[name] = [cb];
    var done = false;
    function finish(p) {
      if (done) return; done = true;
      var m = monthOf(k);
      var want = m.getFullYear() + '-' + pad(m.getMonth() + 1);
      if (p && !p.error && p.events && p.month === want) {
        cache[name] = p;
        if (p.first && p.last) range = { lo: kOfYm(p.first), hi: kOfYm(p.last) };
      } else if (p && !p.error && p.events) p = { error: 'month' };
      var ws = waiting[name]; delete waiting[name];
      for (var i = 0; i < ws.length; i++) ws[i](cache[name] || p || { error: 'net' });
    }
    jsonp({ action: 'data', name: 'ttview_' + name + '.json' }, function (p) { finish(p && p.events ? p : (p && p.month ? p : { error: 'net' })); });
    setTimeout(function () { finish({ error: 'net' }); }, 20000);
  }
  function failText(p) {
    if (p && p.error === 'month') return '月が変わったばかりで、予定の再作成を待っています。少し待ってから、もう一度開いてください🙇';
    return 'この月の予定を読み込めませんでした。通信環境を確認して、もう一度開いてください🙇';
  }
  function visible(evs) {
    if (!roomOnly) return evs;
    return evs.filter(function (e) { return e.rm === 1 || e.rm === '1'; });
  }
  function onDay(evs, ds) {
    var list = visible(evs).filter(function (e) { return e.d <= ds && e.e >= ds; });
    var ad = [], tm = [];
    for (var i = 0; i < list.length; i++) (isAllDay(list[i], ds) ? ad : tm).push(list[i]);
    return { ad: ad, tm: tm };
  }

  function setBack(fn) {
    if (!fn) { bar.innerHTML = homeBar; return; }
    bar.innerHTML = '<div class="ubar"><button class="uhome tvback" id="tvbackbtn">← 戻る</button></div>';
    document.getElementById('tvbackbtn').onclick = fn;
  }
  function chipsHtml() {
    return '<div class="tvchips">' +
      '<button class="tvchip' + (roomOnly ? '' : ' sel') + '" data-r="0"><span class="ck">' + (roomOnly ? '' : '✓') + '</span>全部</button>' +
      '<button class="tvchip' + (roomOnly ? ' sel' : '') + '" data-r="1"><span class="ck">' + (roomOnly ? '✓' : '') + '</span>予約一覧のみ</button></div>';
  }
  function bindChips() {
    var bs = body.querySelectorAll('.tvchip');
    for (var i = 0; i < bs.length; i++) bs[i].onclick = function () {
      roomOnly = this.getAttribute('data-r') === '1';
      try { localStorage.setItem('sz_tv_roomonly', roomOnly ? '1' : '0'); } catch (e) {}
      redraw();
    };
  }
  var swipe = null, sx = 0, sy = 0;
  body.addEventListener('touchstart', function (ev) {
    if (!ev.touches || ev.touches.length !== 1) { sx = null; return; }
    sx = ev.touches[0].clientX; sy = ev.touches[0].clientY;
  }, { passive: true });
  body.addEventListener('touchend', function (ev) {
    if (sx == null || !swipe || !ev.changedTouches || !ev.changedTouches.length) return;
    var dx = ev.changedTouches[0].clientX - sx, dy = ev.changedTouches[0].clientY - sy;
    sx = null;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 50) swipe(dx < 0 ? 1 : -1);
  }, { passive: true });

  function go(next, push) {
    st = next;
    try { if (push !== false) history.pushState({ tv: next }, ''); else history.replaceState({ tv: next }, ''); } catch (e) {}
    redraw();
    window.scrollTo(0, 0);
  }
  function redraw() {
    swipe = null;
    if (st.step === 'month') drawMonth();
    else if (st.step === 'day') drawDay();
    else if (st.step === 'memo') drawMemo();
    else if (st.step === 'search') drawSearch();
    else if (st.step === 'week') drawWeek();
    else drawEvent();
  }
  function preload(k) {
    setTimeout(function () {
      if (inRange(k + 1)) load(k + 1, function () {});
      if (inRange(k - 1)) load(k - 1, function () {});
    }, 600);
  }

  function openPicker() {
    var cur = monthOf(st.k), year = cur.getFullYear();
    var lo = range ? monthOf(range.lo) : monthOf(-1), hi = range ? monthOf(range.hi) : monthOf(5);
    var mask = document.createElement('div');
    mask.className = 'tvpmask';
    function draw() {
      var h = '<div class="tvpbox"><div class="tvpnav"><button class="tvic" data-y="-1"' + (year <= lo.getFullYear() ? ' disabled' : '') + '>‹</button>' +
        '<div class="t">' + year + '年</div><button class="tvic" data-y="1"' + (year >= hi.getFullYear() ? ' disabled' : '') + '>›</button></div><div class="tvpgrid">';
      for (var m = 0; m < 12; m++) {
        var k = (year - today.getFullYear()) * 12 + m - today.getMonth();
        var sel = (k === st.k), now = (k === 0);
        h += '<button class="tvpm' + (sel ? ' sel' : '') + (now ? ' now' : '') + '" data-k="' + k + '"' + (inRange(k) ? '' : ' disabled') + '>' + (m + 1) + '月</button>';
      }
      h += '</div><button class="tvpclose">閉じる</button></div>';
      mask.innerHTML = h;
      var ys = mask.querySelectorAll('[data-y]');
      for (var i = 0; i < ys.length; i++) ys[i].onclick = function () { year += parseInt(this.getAttribute('data-y'), 10); draw(); };
      var ms = mask.querySelectorAll('[data-k]');
      for (i = 0; i < ms.length; i++) ms[i].onclick = function () { close(); go({ step: 'month', k: parseInt(this.getAttribute('data-k'), 10) }, false); };
      mask.querySelector('.tvpclose').onclick = close;
    }
    function close() { if (mask.parentNode) mask.parentNode.removeChild(mask); }
    mask.onclick = function (ev) { if (ev.target === mask) close(); };
    draw();
    document.body.appendChild(mask);
  }

  function barHtml(e, ds) {
    var t = esc(e.t || '(タイトルなし)');
    if (isFill(e)) return '<span class="tvb fill" style="background:' + esc(e.col) + '">' + t + '</span>';
    return '<span class="tvb" style="background:' + tint(e.col) + ';color:' + esc(e.col) + '">' + t + '</span>';
  }
  function drawMonth() {
    setBack();
    var k = st.k, m = monthOf(k);
    body.innerHTML = '<div class="tvmh">' +
        '<button class="tvym" id="tvpick">' + m.getFullYear() + '年' + (m.getMonth() + 1) + '月<i>▼</i></button>' +
        modeHtml('month') +
        '<span class="tvsp"></span>' +
        (k !== 0 ? '<button class="tvtd" id="tvtoday">今日</button>' : '') +
        '<button class="tvic" id="tvsearch" title="予定を検索">' + SICO + '</button>' +
        '<button class="tvic" id="tvprev"' + (inRange(k - 1) ? '' : ' disabled') + '>‹</button>' +
        '<button class="tvic" id="tvnext"' + (inRange(k + 1) ? '' : ' disabled') + '>›</button></div>' +
      chipsHtml() + '<div id="tvcal"><div class="tvstatus">予定を読んでいます...</div></div>';
    function prev() { if (inRange(st.k - 1)) go({ step: 'month', k: st.k - 1 }, false); }
    function next() { if (inRange(st.k + 1)) go({ step: 'month', k: st.k + 1 }, false); }
    document.getElementById('tvprev').onclick = prev;
    document.getElementById('tvnext').onclick = next;
    document.getElementById('tvpick').onclick = openPicker;
    document.getElementById('tvsearch').onclick = function () { go({ step: 'search', k: st.k, q: '', lo: -1 }); };
    bindMode(function () {
      var base = (st.k === 0) ? iso(today) : iso(monthOf(st.k));
      go({ step: 'week', k: kOfDate(base), date: base }, false);
    });
    var tb = document.getElementById('tvtoday'); if (tb) tb.onclick = function () { go({ step: 'month', k: 0 }, false); };
    bindChips();
    swipe = function (d) { if (d > 0) next(); else prev(); };
    load(k, function (p) {
      if (st.step !== 'month' || st.k !== k) return;
      var pv = document.getElementById('tvprev'), nx = document.getElementById('tvnext');
      if (pv) pv.disabled = !inRange(k - 1);
      if (nx) nx.disabled = !inRange(k + 1);
      var box = document.getElementById('tvcal');
      if (!p || p.error) { box.innerHTML = '<div class="tvstatus">' + esc(failText(p)) + '</div>'; return; }
      var evs = p.events;
      var h = '<div class="tvwk">';
      for (var i = 0; i < 7; i++) h += '<div class="' + (i === 5 ? 'sat' : i === 6 ? 'sun' : '') + '">' + WD[i] + '</div>';
      h += '</div>';
      var first = new Date(m.getFullYear(), m.getMonth(), 1);
      var lead = (first.getDay() + 6) % 7;
      var last = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
      var cells = Math.ceil((lead + last) / 7) * 7;
      var tiso = iso(today), MAXB = 4;
      for (var c = 0; c < cells; c++) {
        if (c % 7 === 0) h += '<div class="tvweek">';
        var d = new Date(m.getFullYear(), m.getMonth(), 1 - lead + c), ds = iso(d), wd = c % 7;
        var out = d.getMonth() !== m.getMonth();
        var bars = '';
        if (!out) {
          var od = onDay(evs, ds), list = od.ad.concat(od.tm);
          for (var j = 0; j < list.length && j < MAXB; j++) bars += barHtml(list[j], ds);
          if (list.length > MAXB) bars += '<span class="tvmore">+' + (list.length - MAXB) + '</span>';
        }
        h += '<button class="tvc' + (wd === 5 ? ' sat' : wd === 6 ? ' sun' : '') + (out ? ' out' : '') +
          (ds === tiso ? ' today sel' : '') + '" data-d="' + ds + '"><span class="dn">' + d.getDate() + '</span>' + bars + '</button>';
        if (c % 7 === 6) h += '</div>';
      }
      box.innerHTML = h;
      var ds2 = box.querySelectorAll('.tvc[data-d]');
      for (i = 0; i < ds2.length; i++) ds2[i].onclick = function () {
        var dd = this.getAttribute('data-d'), kk = kOfDate(dd);
        if (!inRange(kk)) return;
        go({ step: 'day', k: kk, date: dd });
      };
      preload(k);
    });
  }

  function modeHtml(cur) {
    return '<span class="tvmode"><button data-mode="month"' + (cur === 'month' ? ' class="sel"' : '') + '>月</button>' +
      '<button data-mode="week"' + (cur === 'week' ? ' class="sel"' : '') + '>週</button></span>';
  }
  function bindMode(toOther) {
    var bs = body.querySelectorAll('[data-mode]');
    for (var i = 0; i < bs.length; i++) bs[i].onclick = function () {
      if (this.className === 'sel') return;
      toOther();
    };
  }

  function mins(hm) { var p = String(hm || '').split(':'); return (+p[0] || 0) * 60 + (+p[1] || 0); }
  function drawWeek() {
    setBack(function () { history.back(); });
    var d0 = parseIso(st.date);
    var mon = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() - (d0.getDay() + 6) % 7);
    var days = [];
    for (var i = 0; i < 7; i++) days.push(new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i));
    var ks = [kOfDate(iso(days[0]))];
    if (kOfDate(iso(days[6])) !== ks[0]) ks.push(kOfDate(iso(days[6])));
    var prevW = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() - 7), nextW = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 7);
    var canPrev = inRange(kOfDate(iso(new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() - 1))));
    var canNext = inRange(kOfDate(iso(nextW)));
    var label = (days[0].getMonth() === days[6].getMonth())
      ? days[0].getFullYear() + '年' + (days[0].getMonth() + 1) + '月'
      : (days[0].getMonth() + 1) + '月〜' + (days[6].getMonth() + 1) + '月';
    var tiso = iso(today);
    var hasToday = tiso >= iso(days[0]) && tiso <= iso(days[6]);
    body.innerHTML = '<div class="tvmh"><button class="tvym" id="tvpick">' + label + '<i>▼</i></button>' + modeHtml('week') +
        '<span class="tvsp"></span>' +
        (hasToday ? '' : '<button class="tvtd" id="tvtoday">今日</button>') +
        '<button class="tvic" id="tvprev"' + (canPrev ? '' : ' disabled') + '>‹</button>' +
        '<button class="tvic" id="tvnext"' + (canNext ? '' : ' disabled') + '>›</button></div>' +
      chipsHtml() + '<div id="tvwk"><div class="tvstatus">予定を読んでいます...</div></div>';
    function goPrev() { if (canPrev) go({ step: 'week', k: kOfDate(iso(prevW)), date: iso(prevW) }, false); }
    function goNext() { if (canNext) go({ step: 'week', k: kOfDate(iso(nextW)), date: iso(nextW) }, false); }
    document.getElementById('tvprev').onclick = goPrev;
    document.getElementById('tvnext').onclick = goNext;
    document.getElementById('tvpick').onclick = function () { st.k = kOfDate(iso(days[0])); openPicker(); };
    var tb = document.getElementById('tvtoday'); if (tb) tb.onclick = function () { go({ step: 'week', k: 0, date: tiso }, false); };
    bindChips();
    bindMode(function () { go({ step: 'month', k: kOfDate(iso(days[0])) }, false); });
    swipe = function (dd) { if (dd > 0) goNext(); else goPrev(); };
    var got = {}, left = ks.length, myDate = st.date;
    for (var a = 0; a < ks.length; a++) (function (kk) {
      load(kk, function (p) {
        got[kk] = p;
        if (--left > 0) return;
        if (st.step !== 'week' || st.date !== myDate) return;
        paint();
      });
    })(ks[a]);
    function paint() {
      var box = document.getElementById('tvwk');
      var evs = [], seen = {};
      for (var b = 0; b < ks.length; b++) {
        var p = got[ks[b]];
        if (!p || p.error) { box.innerHTML = '<div class="tvstatus">' + esc(failText(p)) + '</div>'; return; }
        for (var c = 0; c < p.events.length; c++) { var e = p.events[c], key = e.i + '|' + e.d; if (!seen[key]) { seen[key] = 1; evs.push(e); } }
      }
      var per = [], lo = 10 * 60, hi = 21 * 60;      
      for (var j = 0; j < 7; j++) {
        var od = onDay(evs, iso(days[j]));
        per.push(od);
        for (var t = 0; t < od.tm.length; t++) {
          var s0 = mins(od.tm[t].s), f0 = od.tm[t].e === iso(days[j]) ? mins(od.tm[t].f) : 24 * 60;
          if (s0 < lo) lo = Math.floor(s0 / 60) * 60;
          if (f0 > hi) hi = Math.ceil(f0 / 60) * 60;
        }
      }
      var H = 44;                                    
      var h = '<div class="tvwkhd"><div></div>';
      for (j = 0; j < 7; j++) {
        var ds = iso(days[j]);
        h += '<button class="d' + (j === 5 ? ' sat' : j === 6 ? ' sun' : '') + (ds === tiso ? ' today' : '') + '" data-day="' + ds + '">' +
          '<small>' + WD[j] + '</small><b>' + days[j].getDate() + '</b></button>';
      }
      h += '</div>';
      var anyAd = false;
      for (j = 0; j < 7; j++) if (per[j].ad.length) anyAd = true;
      var keep = [];
      if (anyAd) {
        h += '<div class="tvwkad"><div class="l">終日</div>';
        for (j = 0; j < 7; j++) {
          h += '<div class="c">';
          var ad = per[j].ad;
          for (var x = 0; x < ad.length && x < 3; x++) { h += barHtml(ad[x], iso(days[j])).replace('<span class="tvb', '<span data-w="' + keep.length + '" class="tvb'); keep.push(ad[x]); }
          if (ad.length > 3) h += '<span class="tvmore" data-day="' + iso(days[j]) + '">+' + (ad.length - 3) + '</span>';
          h += '</div>';
        }
        h += '</div>';
      }
      var total = (hi - lo) / 60 * H;
      h += '<div class="tvwkgrid" style="height:' + total + 'px"><div class="t">';
      for (var hr = lo; hr <= hi; hr += 60) h += '<span style="top:' + ((hr - lo) / 60 * H) + 'px">' + (hr / 60) + ':00</span>';
      h += '</div>';
      for (j = 0; j < 7; j++) {
        var dsj = iso(days[j]);
        h += '<div class="col' + (dsj === tiso ? ' today' : '') + '">';
        for (hr = lo; hr < hi; hr += 60) h += '<div class="hl" style="top:' + ((hr - lo) / 60 * H) + 'px"></div>';
        var tm = per[j].tm.slice().sort(function (p1, p2) { return mins(p1.s) - mins(p2.s); });
        var items = [], grp = [], grpEnd = -1;
        var flush = function () { var n = 0; for (var g = 0; g < grp.length; g++) n = Math.max(n, grp[g].lane + 1); for (g = 0; g < grp.length; g++) grp[g].n = n; grp = []; };
        for (var q = 0; q < tm.length; q++) {
          var ev = tm[q], st0 = mins(ev.s), en0 = ev.e === dsj ? mins(ev.f) : 24 * 60;
          if (en0 <= st0) en0 = st0 + 15;
          if (st0 >= grpEnd && grp.length) flush();
          var used = {};
          for (var u = 0; u < grp.length; u++) if (grp[u].en > st0) used[grp[u].lane] = 1;
          var lane = 0; while (used[lane]) lane++;
          var it = { e: ev, st: st0, en: en0, lane: lane };
          grp.push(it); items.push(it);
          grpEnd = Math.max(grpEnd, en0);
        }
        if (grp.length) flush();
        for (q = 0; q < items.length; q++) {
          var it2 = items[q], top = (it2.st - lo) / 60 * H, ht = Math.max(14, (it2.en - it2.st) / 60 * H - 1);
          var w = 100 / it2.n;
          h += '<div class="tvwkev" data-w="' + keep.length + '" style="top:' + top + 'px;height:' + ht + 'px;left:calc(' + (w * it2.lane) + '% + 1px);width:calc(' + w + '% - 2px);' +
            'background:' + tint(it2.e.col) + ';border-color:' + esc(it2.e.col) + ';color:' + esc(it2.e.col) + '">' +
            esc(it2.e.t || '(タイトルなし)') + (ht >= 30 ? '<small>' + esc(it2.e.s) + '</small>' : '') + '</div>';
          keep.push(it2.e);
        }
        if (dsj === tiso) {
          var nw = new Date(), nm = nw.getHours() * 60 + nw.getMinutes();
          if (nm >= lo && nm <= hi) h += '<div class="tvnow" style="top:' + ((nm - lo) / 60 * H) + 'px"></div>';
        }
        h += '</div>';
      }
      h += '</div>';
      box.innerHTML = h;
      var ws = box.querySelectorAll('[data-w]');
      for (var r = 0; r < ws.length; r++) ws[r].onclick = function () {
        var e = keep[parseInt(this.getAttribute('data-w'), 10)];
        var col = this.closest('.c,.col'), ds2 = e.d;
        var idx = Array.prototype.indexOf.call(col.parentNode.children, col) - 1;
        if (idx >= 0 && idx < 7) ds2 = iso(days[idx]);
        go({ step: 'event', k: kOfDate(ds2), date: ds2, ev: e });
      };
      var dd = box.querySelectorAll('[data-day]');
      for (r = 0; r < dd.length; r++) dd[r].onclick = function () {
        var dsx = this.getAttribute('data-day');
        go({ step: 'day', k: kOfDate(dsx), date: dsx });
      };
      if (hasToday) {
        var g2 = box.querySelector('.tvnow');
        if (g2) setTimeout(function () { try { window.scrollTo(0, Math.max(0, g2.getBoundingClientRect().top + window.scrollY - 220)); } catch (x) {} }, 50);
      }
    }
  }

  function memo1(n) {
    var ls = String(n || '').split(String.fromCharCode(10));   
    for (var i = 0; i < ls.length; i++) { var t = ls[i].replace(/^\s+|\s+$/g, ''); if (t) return t; }
    return '';
  }
  function rowHtml(e, idx, ds, sub) {
    if (sub == null) sub = memo1(e.n);   
    var tm;
    if (isAllDay(e, ds)) tm = '終日';
    else tm = '<b>' + esc(e.s || '') + '</b>' + esc(e.e === ds ? (e.f || '') : '');   
    return '<button class="tvrow" data-i="' + idx + '"><span class="tm">' + tm + '</span>' +
      '<span class="ln" style="background:' + esc(e.col) + '"></span>' +
      '<span class="bd"><span class="ti">' + esc(e.t || '(タイトルなし)') + '</span>' +
      (sub ? '<span class="mm">' + esc(sub) + '</span>' : '') + '</span>' +
      (e.au ? '<span class="av" title="' + esc(e.au) + '">' + esc(avOf(e.au)) + '</span>' : '') + '</button>';
  }
  function drawDay() {
    var ds = st.date;
    setBack(function () { history.back(); });
    var d = parseIso(ds);
    var prev = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1), next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    var pk = kOfDate(iso(prev)), nk = kOfDate(iso(next));
    body.innerHTML = '<div class="tvdh"><div class="dt">' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + JWD[d.getDay()] + '曜日</div>' +
      '<button class="tvic" id="tvprev"' + (inRange(pk) ? '' : ' disabled') + '>‹</button>' +
      '<button class="tvic" id="tvnext"' + (inRange(nk) ? '' : ' disabled') + '>›</button></div>' +
      '<div class="tvdchips">' + chipsHtml() + '</div><div id="tvdaybox"><div class="tvstatus">予定を読んでいます...</div></div>';
    function goPrev() { if (inRange(pk)) go({ step: 'day', k: pk, date: iso(prev) }, false); }
    function goNext() { if (inRange(nk)) go({ step: 'day', k: nk, date: iso(next) }, false); }
    document.getElementById('tvprev').onclick = goPrev;
    document.getElementById('tvnext').onclick = goNext;
    bindChips();
    swipe = function (dd) { if (dd > 0) goNext(); else goPrev(); };
    load(st.k, function (p) {
      if (st.step !== 'day' || st.date !== ds) return;
      var box = document.getElementById('tvdaybox');
      if (!p || p.error) { box.innerHTML = '<div class="tvstatus">' + esc(failText(p)) + '</div>'; return; }
      var od = onDay(p.events, ds), ad = od.ad, tm = od.tm;
      if (!ad.length && !tm.length) { box.innerHTML = '<div class="tvstatus">この日の予定はありません。</div>'; return; }
      var h = '<div class="tvlist">', i;
      for (i = 0; i < ad.length; i++) h += rowHtml(ad[i], 'a' + i, ds);
      for (i = 0; i < tm.length; i++) h += rowHtml(tm[i], 't' + i, ds);
      h += '</div>';
      box.innerHTML = h;
      var bs = box.querySelectorAll('[data-i]');
      for (i = 0; i < bs.length; i++) bs[i].onclick = function () {
        var key = this.getAttribute('data-i');
        var e = (key.charAt(0) === 'a' ? ad : tm)[parseInt(key.slice(1), 10)];
        go({ step: 'event', k: st.k, date: ds, ev: e });
      };
    });
  }

  function norm(s) {
    s = String(s == null ? '' : s);
    try { s = s.normalize('NFKC'); } catch (x) {}
    return s.toLowerCase();
  }
  function hitLine(e, words) {
    var nt = norm(e.t);
    for (var w = 0; w < words.length; w++) {
      if (nt.indexOf(words[w]) >= 0) continue;
      var ls = String(e.n || '').split(String.fromCharCode(10));
      for (var i = 0; i < ls.length; i++) if (norm(ls[i]).indexOf(words[w]) >= 0) return ls[i].replace(/^\s+|\s+$/g, '');
    }
    return memo1(e.n);
  }
  function drawSearch() {
    setBack(function () { history.back(); });
    var lo = (st.lo == null) ? -1 : st.lo;
    if (range && lo < range.lo) lo = range.lo;
    var hi = range ? Math.min(5, range.hi) : 5;
    body.innerHTML = '<div class="tvsrch"><input class="tvq" id="tvq" type="search" enterkeyhint="search" ' +
      'placeholder="予定を検索（お名前・番号・メモ）" autocomplete="off"></div>' +
      '<div class="tvdchips">' + chipsHtml() + '</div><div id="tvsres"></div>';
    bindChips();
    var q = document.getElementById('tvq');
    q.value = st.q || '';
    var timer = null;
    q.addEventListener('input', function () {
      st.q = q.value;
      try { history.replaceState({ tv: st }, ''); } catch (x) {}
      clearTimeout(timer);
      timer = setTimeout(run, 300);
    });
    if (!st.q) setTimeout(function () { try { q.focus(); } catch (x) {} }, 50);
    function run() {
      var box = document.getElementById('tvsres');
      if (!box || st.step !== 'search') return;
      var words = norm(q.value).split(/\s+/).filter(function (w) { return w; });
      if (!words.length) { box.innerHTML = '<div class="tvstatus">お名前・番号・メモの言葉を入力してください😊</div>'; return; }
      var ks = [];
      for (var k = lo; k <= hi; k++) ks.push(k);
      var got = {}, left = ks.length;
      box.innerHTML = '<div class="tvstatus">予定を検索しています...（' + (ks.length - left) + '/' + ks.length + 'か月）</div>';
      for (var i = 0; i < ks.length; i++) (function (kk) {
        load(kk, function (p) {
          got[kk] = (p && !p.error) ? p.events : [];
          left--;
          if (st.step !== 'search') return;
          if (left > 0) {
            var b2 = document.getElementById('tvsres');
            if (b2 && b2.firstChild && b2.firstChild.className === 'tvstatus') b2.firstChild.textContent = '予定を検索しています...（' + (ks.length - left) + '/' + ks.length + 'か月）';
            return;
          }
          show(words, ks, got);
        });
      })(ks[i]);
    }
    function show(words, ks, got) {
      var box = document.getElementById('tvsres');
      if (!box || norm(q.value).split(/\s+/).filter(function (w) { return w; }).join(' ') !== words.join(' ')) return;
      var seen = {}, list = [];
      for (var a = 0; a < ks.length; a++) {
        var evs = visible(got[ks[a]] || []);
        for (var b = 0; b < evs.length; b++) {
          var e = evs[b], key = e.i + '|' + e.d;
          if (seen[key]) continue;
          var hay = norm((e.t || '') + '\n' + (e.n || '') + '\n' + (e.cn || '') + '\n' + (e.rn || ''));
          var ok = true;
          for (var w = 0; w < words.length; w++) if (hay.indexOf(words[w]) < 0) { ok = false; break; }
          if (!ok) continue;
          seen[key] = 1;
          list.push(e);
        }
      }
      var tiso = iso(today);
      var fut = list.filter(function (e) { return e.d >= tiso; }), past = list.filter(function (e) { return e.d < tiso; });
      function byTime(x, y) { return x.d < y.d ? -1 : x.d > y.d ? 1 : ((isFill(x) ? '' : x.s || '') < (isFill(y) ? '' : y.s || '') ? -1 : 1); }
      fut.sort(byTime);
      past.sort(function (x, y) { return -byTime(x, y); });
      var MAX = 200, shown = [], h = '';
      function part(arr, title) {
        if (!arr.length) return;
        if (title) h += '<div class="tvsechd">' + title + '</div>';
        var last = '';
        for (var c = 0; c < arr.length && shown.length < MAX; c++) {
          var e = arr[c];
          if (e.d !== last) {
            last = e.d;
            var dd = parseIso(e.d);
            h += '<div class="tvdate">' + (dd.getFullYear() !== today.getFullYear() ? dd.getFullYear() + '年' : '') + jpDay(e.d) + '</div>';
          }
          h += rowHtml(e, 's' + shown.length, e.d, hitLine(e, words));
          shown.push(e);
        }
      }
      if (!list.length) h = '<div class="tvstatus">見つかりませんでした。</div>';
      else {
        h = '<div class="tvscnt">' + list.length + '件' + (list.length > MAX ? '（最初の' + MAX + '件を表示しています。言葉を足して絞り込んでください😊）' : '') + '</div>';
        part(fut, '');
        part(past, '過去の予定');
      }
      var canMore = !range || lo > range.lo;
      var m0 = monthOf(lo);
      h += '<div class="tvsmore"><span>' + m0.getFullYear() + '年' + (m0.getMonth() + 1) + '月から検索しています</span>' +
        (canMore ? '<button class="tvtd" id="tvsmore">もっと前の月も検索する</button>' : '') + '</div>';
      box.innerHTML = h;
      var bs = box.querySelectorAll('[data-i]');
      for (var r = 0; r < bs.length; r++) bs[r].onclick = function () {
        var e = shown[parseInt(this.getAttribute('data-i').slice(1), 10)];
        go({ step: 'event', k: kOfDate(e.d), date: e.d, ev: e });
      };
      var mb = document.getElementById('tvsmore');
      if (mb) mb.onclick = function () {
        lo = range ? Math.max(range.lo, lo - 6) : lo - 6;
        st.lo = lo;
        try { history.replaceState({ tv: st }, ''); } catch (x) {}
        run();
      };
    }
    run();
  }

  var ICO = {
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1.4 1.4 0 0 1 0 2l-6.2 6.2a1.4 1.4 0 0 1-2 0z"/><circle cx="8" cy="8" r="1.4"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
    rep: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11V9a3 3 0 0 1 3-3h12l-3-3M20 13v2a3 3 0 0 1-3 3H5l3 3"/></svg>'
  };
  function infoRow(icon, v) { return '<div class="tvi"><span class="k">' + icon + '</span><span class="v">' + v + '</span></div>'; }
  function openHref(e) {
    if (!e.tt) return '';
    if (/Android/i.test(navigator.userAgent)) {
      var path = e.tt.replace(/^https:\/\//, '');
      return 'intent://' + path + '#Intent;scheme=https;package=works.jubilee.timetree;S.browser_fallback_url=' + encodeURIComponent(e.tt) + ';end';
    }
    return e.tt;
  }
  function drawEvent() {
    var e = st.ev;
    if (!e) { st = { step: 'month', k: 0 }; redraw(); return; }
    setBack(function () { history.back(); });
    var allDay = (e.a === 1 || e.a === '1' || e.a === true);
    var when = '<div class="tvwhen"><div class="w"><small>' + esc(jpFull(e.d)) + '</small><b>' + esc(allDay ? '終日' : e.s) + '</b></div>' +
      '<span class="arw" style="color:' + esc(e.col) + '">›</span>' +
      '<div class="w r"><small>' + esc(jpFull(e.e)) + '</small><b>' + esc(allDay ? '終日' : e.f) + '</b></div></div>';
    var h = '<div class="tvdtop" style="color:' + esc(e.col) + '">' + esc(e.t || '(タイトルなし)') + '</div>' + when;
    h += e.n ? '<pre class="tvmemo">' + esc(e.n) + '</pre>' : '<div class="tvnomemo">予約メモはありません</div>';
    var room = e.rn ? esc(e.rn) : '';
    h += '<div class="tvinfo">' +
      infoRow(ICO.cal, esc(e.cn)) +
      infoRow(ICO.tag, '<span class="tvdot" style="background:' + esc(e.col) + '"></span>' + room) +
      (e.r ? infoRow(ICO.rep, 'くり返し') : '') +
      (e.loc ? infoRow(ICO.pin, esc(e.loc)) : '') +
      (e.url ? infoRow(ICO.link, '<a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.url) + '</a>') : '') +
      '</div>';
    h += '<div class="tvlog">';
    if (e.h && e.h.length) {
      for (var hi = 0; hi < e.h.length; hi++) {
        var a = e.h[hi];
        h += '<div>' + esc(msText(a[2])) + '　' + (a[1] ? esc(a[1]) + 'が' : '') + (a[0] === 1 ? '予定を作成しました' : '予定を修正しました') + '</div>';
      }
    } else {
      if (e.cr) h += '<div>' + esc(msText(e.cr)) + '　' + (e.au ? esc(e.au) + 'が' : '') + '予定を作成しました</div>';
      else if (e.au) h += '<div>作った人：' + esc(e.au) + '</div>';
      if (e.up) h += '<div>' + esc(msText(e.up)) + '　予定を修正しました</div>';
    }
    h += '</div><div class="tvacts">';
    if (!e.r) h += '<button class="tvedit" id="tvedit">✏️ 予約メモを修正</button>';
    if (e.tt) h += '<a class="tvopen" href="' + esc(openHref(e)) + '" target="_blank" rel="noopener">実際のタイムツリーでこの予約メモを開く</a>';
    h += '</div>';
    body.innerHTML = h;
    var eb = document.getElementById('tvedit');
    if (eb) eb.onclick = function () { go({ step: 'memo', k: st.k, date: st.date, ev: e, base: e.n || '' }); };
  }

  function growMemo() {
    var t = document.getElementById('tvmemotx');
    if (!t) return;
    t.style.height = 'auto';
    t.style.height = (t.scrollHeight + 4) + 'px';
  }
  function drawMemo() {
    var e = st.ev;
    if (!e) { st = { step: 'month', k: 0 }; redraw(); return; }
    setBack(function () { history.back(); });
    var cur = (st.draft != null) ? st.draft : (st.base || '');
    var allDay = (e.a === 1 || e.a === '1' || e.a === true);
    body.innerHTML =
      '<div class="tvdtop" style="color:' + esc(e.col) + '">' + esc(e.t || '(タイトルなし)') + '</div>' +
      '<div class="tvi" style="justify-content:center;padding-top:0"><span class="v" style="flex:none">' +
        esc(allDay ? jpFull(e.d) + ' 終日' : jpFull(e.d) + ' ' + e.s + '〜' + e.f) + '</span></div>' +
      '<div class="tvsec">予約メモ</div>' +
      '<textarea class="tvmemotx" id="tvmemotx" spellcheck="false"></textarea>' +
      '<button class="tvsave" id="tvsave">この内容で保存する</button>';
    var t = document.getElementById('tvmemotx');
    t.value = cur;
    t.addEventListener('input', function () { st.draft = t.value; growMemo(); });
    growMemo();
    document.getElementById('tvsave').onclick = function () { saveMemo(t.value); };
  }
  function saveMemo(text) {
    var e = st.ev, base = st.base || '';
    if (text === base) { szPopup_('予約メモは変わっていません。', { icon: '' }); return; }
    szOvShow_(szBusyHtml_('予約メモを保存中です'), '#2C7A99');
    var fields = { cal: e.c, event: e.i, note: text, expect_note: base };
    jsonp({ action: 'submit', key: KEY, op: 'change_reservation', who: idn.who, role: idn.role, device: idn.device, fields: JSON.stringify(fields) }, function (r) {
      if (!r || !r.ok || !r.id) { szOvHide_(); szPopup_('エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇'); return; }
      poll(r.id, (typeof LIMITS !== 'undefined') ? LIMITS.tries('change_reservation', 700) : 300, text);
    });
  }
  function poll(id, left, text) {
    jsonp({ action: 'status', key: KEY, id: id }, function (r) {
      if (!r || !r.ok) {
        if (left > 0) { setTimeout(function () { poll(id, left - 1, text); }, 700); return; }
        szOvHide_(); szPopup_('エラーが発生しました。りゅうさんに連絡しました。'); return;
      }
      if (r.status === 'pending' || r.status === 'running' || r.status === 'queued' || r.status === '') {
        if (left > 0) { setTimeout(function () { poll(id, left - 1, text); }, 700); return; }
        szOvHide_(); szPopup_('時間がかかっています。少ししてからタイムツリーで確認してください🙇'); return;
      }
      if (r.status !== 'done') { szOvHide_(); szPopup_('エラーが発生しました。りゅうさんに連絡しました。'); return; }
      var d = {}; try { d = JSON.parse(r.result || '{}'); } catch (x) {}
      if (d && d.conflict) {
        szOvHide_();
        st.base = d.note || '';
        st.draft = null;
        st.ev.n = st.base;
        drawMemo();
        szPopup_('先に予約メモを修正した人がいます。\n最新の予約メモを表示しました。\nもう一度修正してから保存してください😊');
        return;
      }
      st.ev.n = text;
      st.ev.up = Date.now();
      if (st.ev.h) st.ev.h.push([2, (PERSON_LABEL_[window.__SZ_WHO_] || 'Ryu'), Date.now()]);
      szOvShow_(szDoneHtml_('予約メモを保存しました', '戻る'), '#16a34a');
      var bb = document.getElementById('szDoneBack');
      if (bb) bb.onclick = function () { szOvHide_(); history.back(); };
    });
  }

  window.addEventListener('popstate', function (ev) {
    var s = ev.state && ev.state.tv;
    st = s || { step: 'month', k: 0 };
    redraw();
  });
  try { history.replaceState({ tv: st }, ''); } catch (e) {}
  redraw();
  load(0, function () {});
}
