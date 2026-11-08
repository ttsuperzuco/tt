// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：timetree
function renderTimeTreePage_(base, staff, dev) {
  var css =
    '.tv{max-width:560px;width:100%;margin:0 auto;padding:0 6px 60px;text-align:left;box-sizing:border-box;}' +
    '.tvbar{position:sticky;top:0;z-index:5;background:#2C7A99;padding:8px 0 8px;}' +
    '.tvback{border:0;cursor:pointer;font:inherit;}' +
    '.tvnav{display:flex;align-items:center;gap:8px;margin:4px 2px 10px;}' +
    '.tvnav .tvt{flex:1;min-width:0;text-align:center;color:#fff;font-weight:900;font-size:24px;line-height:1.25;}' +
    '.tvarw{flex:none;width:52px;height:46px;border:0;border-radius:14px;background:#fff;color:#0f172a;' +
      'font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.15);}' +
    '.tvarw:disabled{opacity:.35;}' +
    '.tvseg{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 2px 12px;}' +
    '.tvsegb{border:0;border-radius:12px;padding:10px 4px;font-size:16px;font-weight:900;cursor:pointer;' +
      'background:rgba(255,255,255,.18);color:#fff;}' +
    '.tvsegb.sel{background:#fff;color:#0f172a;}' +
    '.tvgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;}' +
    '.tvwd{text-align:center;font-size:13px;color:#eaf6fb;font-weight:800;}' +
    '.tvwd.sat{color:#bfe3ff;}.tvwd.sun{color:#ffc9c9;}' +
    '.tvday{min-height:74px;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 2px;' +
      'background:#fff;color:#0f172a;border:0;border-radius:11px;cursor:pointer;box-sizing:border-box;' +
      'box-shadow:0 2px 6px rgba(0,0,0,.12);font:inherit;}' +
    '.tvday .dn{font-size:18px;font-weight:900;line-height:1;}' +
    '.tvday.sat .dn{color:#1d6fb8;}.tvday.sun .dn{color:#c0392b;}' +
    '.tvday.today{background:#fb8c44;box-shadow:0 0 0 3px #fff,0 4px 12px rgba(0,0,0,.25);}' +
    '.tvday.today .dn,.tvday.today .cnt{color:#fff;}' +
    '.tvday.today .tvdots i{box-shadow:0 0 0 1.5px #fff;}' +
    '.tvday.blank{visibility:hidden;box-shadow:none;}' +
    '.tvday .cnt{font-size:12px;font-weight:800;color:#475569;line-height:1;}' +
    '.tvdots{display:flex;flex-wrap:wrap;justify-content:center;gap:2px;max-width:100%;}' +
    '.tvdots i{display:block;width:7px;height:7px;border-radius:50%;}' +
    '.tvstatus{color:#fff;font-weight:800;font-size:17px;margin:12px 4px;line-height:1.6;}' +
    '.tvsec{color:#eaf6fb;font-weight:800;font-size:14px;margin:12px 4px 6px;}' +
    '.tvlist{display:flex;flex-direction:column;gap:8px;}' +
    '.tvrow{display:flex;align-items:stretch;gap:10px;width:100%;box-sizing:border-box;text-align:left;' +
      'background:#fff;color:#0f172a;border:0;border-radius:14px;padding:10px 12px 10px 0;cursor:pointer;' +
      'box-shadow:0 3px 10px rgba(0,0,0,.12);font:inherit;overflow:hidden;}' +
    '.tvrow .bar{flex:none;width:7px;border-radius:0 6px 6px 0;}' +
    '.tvrow .tm{flex:none;width:58px;font-weight:900;font-size:16px;line-height:1.3;}' +
    '.tvrow .tm small{display:block;color:#64748b;font-weight:800;font-size:13px;}' +
    '.tvrow .bd{flex:1;min-width:0;}' +
    '.tvrow .ti{font-weight:900;font-size:18px;line-height:1.35;word-break:break-all;}' +
    '.tvrow .sub{color:#64748b;font-weight:700;font-size:13px;margin-top:2px;}' +
    '.tvad{display:block;width:100%;box-sizing:border-box;text-align:left;border:0;border-radius:10px;' +
      'padding:9px 12px;color:#fff;font:inherit;font-weight:900;font-size:16px;cursor:pointer;' +
      'text-shadow:0 1px 2px rgba(0,0,0,.35);box-shadow:0 2px 6px rgba(0,0,0,.12);word-break:break-all;}' +
    '.tvcard{background:#fff;color:#0f172a;border-radius:16px;padding:16px;box-shadow:0 4px 14px rgba(0,0,0,.14);' +
      'margin:0 2px 12px;position:relative;overflow:hidden;}' +
    '.tvcard .bar{position:absolute;left:0;top:0;bottom:0;width:8px;}' +
    '.tvdt{font-weight:900;font-size:23px;line-height:1.35;word-break:break-all;margin:0 0 10px 4px;}' +
    '.tvline{display:flex;gap:10px;align-items:flex-start;margin:8px 0 0 4px;font-size:16px;line-height:1.5;}' +
    '.tvline .k{flex:none;width:22px;text-align:center;}' +
    '.tvline .v{flex:1;min-width:0;font-weight:700;word-break:break-all;}' +
    '.tvchip{display:inline-block;color:#fff;border-radius:9px;padding:1px 10px;font-weight:900;font-size:14px;' +
      'margin-left:6px;text-shadow:0 1px 2px rgba(0,0,0,.3);vertical-align:1px;}' +
    '.tvmemo{white-space:pre-wrap;word-break:break-all;font-size:16px;line-height:1.75;margin:0;font:inherit;}' +
    '.tvmeta{color:#64748b;font-size:13px;font-weight:700;line-height:1.7;margin:0 6px 14px;color:#eaf6fb;}' +
    '.tvpick{background:transparent;border:0;cursor:pointer;font-family:inherit;padding:6px 0;}' +
    '.tvtoday{display:block;margin:-4px auto 10px;border:0;border-radius:999px;background:#fb8c44;color:#fff;' +
      'font:inherit;font-weight:900;font-size:15px;padding:7px 18px;cursor:pointer;}' +
    '.tvpmask{position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.55);display:flex;align-items:center;' +
      'justify-content:center;padding:20px;}' +
    '.tvpbox{background:#2C7A99;border-radius:18px;padding:16px;width:100%;max-width:420px;box-shadow:0 14px 44px rgba(0,0,0,.45);}' +
    '.tvpgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:6px 0 14px;}' +
    '.tvpm{border:0;border-radius:12px;background:#fff;color:#0f172a;font:inherit;font-weight:900;font-size:18px;' +
      'padding:14px 0;cursor:pointer;}' +
    '.tvpm.now{box-shadow:inset 0 0 0 3px #fb8c44;}' +
    '.tvpm.sel{background:#fb8c44;color:#fff;}' +
    '.tvpm:disabled{opacity:.3;}' +
    '.tvpclose{display:block;width:100%;border:0;border-radius:12px;background:rgba(255,255,255,.2);color:#fff;' +
      'font:inherit;font-weight:900;font-size:17px;padding:12px;cursor:pointer;}' +
    '.tvnomemo{color:#64748b;font-weight:700;margin-left:4px;}' +
    '.tvedit{display:block;width:calc(100% - 4px);margin:0 2px 12px;border:0;border-radius:16px;background:#fff;' +
      'color:#0f172a;font:inherit;font-size:19px;font-weight:900;padding:15px;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.14);}' +
    '.tvmemotx{display:block;width:calc(100% - 4px);margin:0 2px 12px;box-sizing:border-box;font:inherit;font-size:17px;' +
      'line-height:1.75;color:#0f172a;background:#fff;border:0;border-radius:14px;padding:14px;overflow:hidden;resize:none;min-height:200px;}' +
    '.tvsave{display:block;width:calc(100% - 4px);margin:0 2px 12px;border:0;border-radius:16px;background:#16a34a;color:#fff;' +
      'font:inherit;font-size:21px;font-weight:900;padding:18px;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.18);}' +
    '.tvopen{display:block;text-align:center;text-decoration:none;background:#2bad6f;color:#fff;border-radius:16px;' +
      'padding:16px;font-size:19px;font-weight:900;margin:0 2px 12px;box-shadow:0 4px 10px rgba(0,0,0,.18);}';
  var head = '<div class="hhead"><span class="bmark">' + TT_LOGO_ + '</span><span class="bname">TimeTree</span></div>';
  return '<style>' + HOMECSS_ + css + '</style>' +
    '<div class="home">' +
      '<div class="tv">' +
        '<div class="tvbar" id="tvbar">' + backBar_(base, staff, dev) + '</div>' +
        '<div id="tvhead">' + head + '</div>' +
        '<div id="tvbody"><div class="tvstatus">予定を読んでいます...</div></div>' +
      '</div>' +
    '</div>';
}
function ttviewStart_(exec, base, staff, dev) {
  var KEY = 'kx7Q2p9mVt4Zr8';
  var WD = ['月', '火', '水', '木', '金', '土', '日'];     
  var JWD = ['日', '月', '火', '水', '木', '金', '土'];
  var cache = {};          
  var waiting = {};
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var st = { step: 'month', k: 0, date: '', ev: null };
  var range = null;        
  var roomOnly = false;
  try { roomOnly = localStorage.getItem('sz_tv_roomonly') === '1'; } catch (e) {}
  var body = document.getElementById('tvbody');
  var bar = document.getElementById('tvbar');
  var head = document.getElementById('tvhead');
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
    return evs.filter(function (e) { return e.rm === 1; });
  }
  function onDay(evs, ds) {
    return visible(evs).filter(function (e) { return e.d <= ds && e.e >= ds; });
  }

  function setBack(fn) {
    if (!fn) { bar.innerHTML = homeBar; return; }
    bar.innerHTML = '<div class="ubar"><button class="uhome tvback" id="tvbackbtn">← 戻る</button></div>';
    document.getElementById('tvbackbtn').onclick = fn;
  }
  function segHtml() {
    return '<div class="tvseg">' +
      '<button class="tvsegb' + (roomOnly ? '' : ' sel') + '" data-r="0">全部</button>' +
      '<button class="tvsegb' + (roomOnly ? ' sel' : '') + '" data-r="1">予約一覧のみ</button></div>';
  }
  function bindSeg() {
    var bs = body.querySelectorAll('.tvsegb');
    for (var i = 0; i < bs.length; i++) bs[i].onclick = function () {
      roomOnly = this.getAttribute('data-r') === '1';
      try { localStorage.setItem('sz_tv_roomonly', roomOnly ? '1' : '0'); } catch (e) {}
      redraw();
    };
  }
  function go(next, push) {
    st = next;
    try { if (push !== false) history.pushState({ tv: next }, ''); else history.replaceState({ tv: next }, ''); } catch (e) {}
    redraw();
    window.scrollTo(0, 0);
  }
  function redraw() {
    if (st.step === 'month') drawMonth();
    else if (st.step === 'day') drawDay();
    else if (st.step === 'memo') drawMemo();
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
      var h = '<div class="tvpbox"><div class="tvnav"><button class="tvarw" data-y="-1"' + (year <= lo.getFullYear() ? ' disabled' : '') + '>◀</button>' +
        '<div class="tvt">' + year + '年</div><button class="tvarw" data-y="1"' + (year >= hi.getFullYear() ? ' disabled' : '') + '>▶</button></div><div class="tvpgrid">';
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

  function drawMonth() {
    setBack();
    head.style.display = '';
    var k = st.k, m = monthOf(k);
    var nav = '<div class="tvnav"><button class="tvarw" id="tvprev"' + (inRange(k - 1) ? '' : ' disabled') + '>◀</button>' +
      '<button class="tvt tvpick" id="tvpick">' + m.getFullYear() + '年' + (m.getMonth() + 1) + '月 ▾</button>' +
      '<button class="tvarw" id="tvnext"' + (inRange(k + 1) ? '' : ' disabled') + '>▶</button></div>';
    body.innerHTML = nav + (k !== 0 ? '<button class="tvtoday" id="tvtoday">今月にもどる</button>' : '') +
      '<div id="tvcal"><div class="tvstatus">予定を読んでいます...</div></div>';
    document.getElementById('tvprev').onclick = function () { if (inRange(st.k - 1)) go({ step: 'month', k: st.k - 1 }, false); };
    document.getElementById('tvnext').onclick = function () { if (inRange(st.k + 1)) go({ step: 'month', k: st.k + 1 }, false); };
    document.getElementById('tvpick').onclick = openPicker;
    var tb = document.getElementById('tvtoday'); if (tb) tb.onclick = function () { go({ step: 'month', k: 0 }, false); };
    load(k, function (p) {
      if (st.step !== 'month' || st.k !== k) return;
      var pv = document.getElementById('tvprev'), nx = document.getElementById('tvnext');
      if (pv) pv.disabled = !inRange(k - 1);
      if (nx) nx.disabled = !inRange(k + 1);
      var box = document.getElementById('tvcal');
      if (!p || p.error) { box.innerHTML = '<div class="tvstatus">' + esc(failText(p)) + '</div>'; return; }
      var evs = p.events;        
      var h = '<div class="tvgrid">';
      for (var i = 0; i < 7; i++) h += '<div class="tvwd' + (i === 5 ? ' sat' : i === 6 ? ' sun' : '') + '">' + WD[i] + '</div>';
      var first = new Date(m.getFullYear(), m.getMonth(), 1);
      var lead = (first.getDay() + 6) % 7;
      for (i = 0; i < lead; i++) h += '<div class="tvday blank"></div>';
      var last = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
      var tiso = iso(today);
      for (var dnum = 1; dnum <= last; dnum++) {
        var d = new Date(m.getFullYear(), m.getMonth(), dnum), ds = iso(d), wd = (d.getDay() + 6) % 7;
        var list = evs.filter(function (e) { return e.d <= ds && e.e >= ds; });
        var cols = [], dots = '';
        for (var j = 0; j < list.length && cols.length < 6; j++) if (cols.indexOf(list[j].col) < 0) cols.push(list[j].col);
        for (j = 0; j < cols.length; j++) dots += '<i style="background:' + esc(cols[j]) + '"></i>';
        h += '<button class="tvday' + (wd === 5 ? ' sat' : wd === 6 ? ' sun' : '') + (ds === tiso ? ' today' : '') + '" data-d="' + ds + '">' +
          '<span class="dn">' + dnum + '</span>' +
          '<span class="cnt">' + (list.length ? list.length + '件' : '&nbsp;') + '</span>' +
          '<span class="tvdots">' + dots + '</span></button>';
      }
      h += '</div>';
      box.innerHTML = h;
      var ds2 = box.querySelectorAll('.tvday[data-d]');
      for (i = 0; i < ds2.length; i++) ds2[i].onclick = function () { go({ step: 'day', k: st.k, date: this.getAttribute('data-d') }); };
      preload(k);
    });
  }

  function rowHtml(e, idx, ds) {
    if (e.a) {
      return '<button class="tvad" style="background:' + esc(e.col) + '" data-i="' + idx + '">' + esc(e.t || '(タイトルなし)') + '</button>';
    }
    var s = e.d === ds ? e.s : '';        
    var f = e.e === ds ? e.f : '';
    return '<button class="tvrow" data-i="' + idx + '"><span class="bar" style="background:' + esc(e.col) + '"></span>' +
      '<span class="tm">' + esc(s || '〜') + '<small>' + esc(f ? '〜' + f : '') + '</small></span>' +
      '<span class="bd"><span class="ti">' + esc(e.t || '(タイトルなし)') + '</span>' +
      '<div class="sub">' + esc(e.cn) + (e.rn && e.rn.toUpperCase() !== String(e.cn).toUpperCase() ? '・' + esc(e.rn) : '') + '</div></span></button>';
  }
  function drawDay() {
    var ds = st.date;
    setBack(function () { history.back(); });
    head.style.display = 'none';
    var d = parseIso(ds);
    var prev = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1), next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    var pk = kOfDate(iso(prev)), nk = kOfDate(iso(next));
    body.innerHTML = '<div class="tvnav"><button class="tvarw" id="tvprev"' + (inRange(pk) ? '' : ' disabled') + '>◀</button>' +
      '<div class="tvt">' + esc(jpDay(ds)) + '</div>' +
      '<button class="tvarw" id="tvnext"' + (inRange(nk) ? '' : ' disabled') + '>▶</button></div>' +
      segHtml() + '<div id="tvdaybox"><div class="tvstatus">予定を読んでいます...</div></div>';
    document.getElementById('tvprev').onclick = function () { if (inRange(pk)) go({ step: 'day', k: pk, date: iso(prev) }, false); };
    document.getElementById('tvnext').onclick = function () { if (inRange(nk)) go({ step: 'day', k: nk, date: iso(next) }, false); };
    bindSeg();
    load(st.k, function (p) {
      if (st.step !== 'day' || st.date !== ds) return;
      var box = document.getElementById('tvdaybox');
      if (!p || p.error) { box.innerHTML = '<div class="tvstatus">' + esc(failText(p)) + '</div>'; return; }
      var list = onDay(p.events, ds);
      if (!list.length) { box.innerHTML = '<div class="tvstatus">この日の予定はありません。</div>'; return; }
      var ad = [], tm = [];
      for (var i = 0; i < list.length; i++) (list[i].a || list[i].d < ds ? ad : tm).push(list[i]);
      var h = '';
      if (ad.length) {
        h += '<div class="tvsec">終日</div><div class="tvlist">';
        for (i = 0; i < ad.length; i++) h += rowHtml(ad[i], 'a' + i, ds);
        h += '</div>';
      }
      if (tm.length) {
        h += '<div class="tvsec">' + list.length + '件</div><div class="tvlist">';
        for (i = 0; i < tm.length; i++) h += rowHtml(tm[i], 't' + i, ds);
        h += '</div>';
      }
      box.innerHTML = h;
      var bs = box.querySelectorAll('[data-i]');
      for (i = 0; i < bs.length; i++) bs[i].onclick = function () {
        var key = this.getAttribute('data-i');
        var e = (key.charAt(0) === 'a' ? ad : tm)[parseInt(key.slice(1), 10)];
        go({ step: 'event', k: st.k, date: ds, ev: e });
      };
    });
  }

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
    head.style.display = 'none';
    var when;
    if (e.a) when = (e.d === e.e ? jpFull(e.d) : jpFull(e.d) + ' 〜 ' + jpDay(e.e)) + ' 終日';
    else if (e.d === e.e) when = jpFull(e.d) + ' ' + e.s + '〜' + e.f;
    else when = jpFull(e.d) + ' ' + e.s + ' 〜 ' + jpDay(e.e) + ' ' + e.f;
    var h = '<div class="tvcard"><span class="bar" style="background:' + esc(e.col) + '"></span>' +
      '<div class="tvdt">' + esc(e.t || '(タイトルなし)') + '</div>' +
      '<div class="tvline"><span class="k">🕒</span><span class="v">' + esc(when) + (e.r ? '<span class="tvchip" style="background:#64748b">くり返し</span>' : '') + '</span></div>' +
      '<div class="tvline"><span class="k">📅</span><span class="v">' + esc(e.cn) +
        '<span class="tvchip" style="background:' + esc(e.col) + '">' +
          (e.rn && e.rn.toUpperCase() !== String(e.cn).toUpperCase() ? esc(e.rn) : '&nbsp;') + '</span></span></div>' +
      (e.loc ? '<div class="tvline"><span class="k">📍</span><span class="v">' + esc(e.loc) + '</span></div>' : '') +
      (e.url ? '<div class="tvline"><span class="k">🔗</span><span class="v"><a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.url) + '</a></span></div>' : '') +
      '</div>';
    h += '<div class="tvcard"><span class="bar" style="background:' + esc(e.col) + '"></span>' +
      (e.n ? '<pre class="tvmemo">' + esc(e.n) + '</pre>' : '<div class="tvnomemo">予約メモはありません</div>') + '</div>';
    if (!e.r) h += '<button class="tvedit" id="tvedit">✏️ 予約メモを修正</button>';
    if (e.h && e.h.length) {
      h += '<div class="tvmeta">';
      for (var hi = 0; hi < e.h.length; hi++) {
        var a = e.h[hi];
        h += (a[0] === 1 ? '作った日：' : '修正日：') + esc(msText(a[2])) + (a[1] ? '　' + esc(a[1]) : '') + '<br>';
      }
      h += '</div>';
    } else {
      h += '<div class="tvmeta">' +
        (e.cr ? '作った日：' + esc(msText(e.cr)) + (e.au ? '　' + esc(e.au) : '') + '<br>' : (e.au ? '作った人：' + esc(e.au) + '<br>' : '')) +
        (e.up ? '修正日：' + esc(msText(e.up)) : '') + '</div>';
    }
    if (e.tt) h += '<a class="tvopen" href="' + esc(openHref(e)) + '" target="_blank" rel="noopener">実際のタイムツリーでこの予約メモを開く</a>';
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
    head.style.display = 'none';
    var cur = (st.draft != null) ? st.draft : (st.base || '');
    body.innerHTML =
      '<div class="tvcard"><span class="bar" style="background:' + esc(e.col) + '"></span>' +
        '<div class="tvdt" style="font-size:19px;margin-bottom:4px">' + esc(e.t || '(タイトルなし)') + '</div>' +
        '<div class="tvline" style="margin-top:0"><span class="k">🕒</span><span class="v">' + esc(e.a ? jpFull(e.d) + ' 終日' : jpFull(e.d) + ' ' + e.s + '〜' + e.f) + '</span></div></div>' +
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
