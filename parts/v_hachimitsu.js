// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：hachimitsu
var CHATCSS_ =
  '.cc{width:100%;box-sizing:border-box;max-width:620px;margin:0 auto;padding:0 6px 60px;text-align:left;}' +
  '.cclog{display:flex;flex-direction:column;gap:10px;margin:6px 0 14px;}' +
  '.ccq,.cca{border-radius:16px;padding:12px 14px;font-size:17px;line-height:1.6;white-space:pre-wrap;word-break:break-word;box-shadow:0 3px 10px rgba(0,0,0,.15);}' +
  '.ccq{align-self:flex-end;max-width:85%;background:#fde047;color:#0f172a;font-weight:700;}' +
  '.cca{align-self:flex-start;max-width:92%;background:#fff;color:#0f172a;}' +
  '.cct{font-size:12px;color:#64748b;font-weight:700;margin-top:4px;}' +
  '.ccnone{color:#eaf6fb;font-weight:800;font-size:17px;text-align:center;margin:14px 0;}' +
  '.ccin{display:block;width:100%;box-sizing:border-box;border:0;border-radius:14px;padding:14px;font:inherit;font-size:19px;color:#0f172a;min-height:120px;resize:vertical;margin:4px 0 10px;box-shadow:0 4px 14px rgba(0,0,0,.15);}';
var HONEYCSS_ =
  '.hnimg{display:block;width:100%;max-width:420px;border-radius:12px;margin-top:8px;background:#e2e8f0;min-height:120px;}' +
  '.hnqimg{display:block;width:120px;border-radius:10px;margin-top:6px;background:#e2e8f0;min-height:60px;}' +
  '.hnsave{display:inline-block;margin-top:6px;font-size:14px;font-weight:800;color:#0e7490;}' +
  '.hnbar{display:flex;gap:8px;margin:0 0 10px;}' +
  '.hnbar button.on{background:#dc2626;color:#fff;}' +
  '.home.hnhome{padding-bottom:10px;}' +
  '.hnhome .cc{padding-bottom:0;}' +
  '.hnhome #hnSend{margin-bottom:0;}' +
  '.hntop{position:sticky;top:0;z-index:30;background:#2C7A99;display:flex;align-items:center;gap:6px;margin:-34px -18px 10px;padding:10px 12px 8px;}' +
  '.hntop .ubar{margin:0;flex:0 0 auto;}' +
  '.hntop .uhome{padding:8px 11px;font-size:.95rem;}' +
  '.hnttl{flex:1 1 auto;min-width:0;font-size:1rem;font-weight:900;color:#fb8c44;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
  '.hnico{width:1.6em;height:1.6em;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:5px;}' +
  '.hnreset{flex:0 0 auto;background:#fff;color:#0f172a;border:1px solid #e2e8f0;border-radius:999px;padding:8px 10px;font:inherit;font-size:.85rem;font-weight:800;white-space:nowrap;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.10);}' +
  '.hnreset:active{transform:translateY(1px);}' +
  '.hnsw{flex:0 0 auto;display:flex;background:#fff;border:1px solid #e2e8f0;border-radius:999px;padding:2px;box-shadow:0 4px 12px rgba(0,0,0,.10);}' +
  '.hnsw button{border:0;background:transparent;color:#475569;border-radius:999px;padding:6px 8px;font:inherit;font-size:.78rem;font-weight:800;white-space:nowrap;cursor:pointer;}' +
  '.hnsw button.on{background:#2C7A99;color:#fff;}' +
  '.hntop.sw .hntxt{display:none;}' +      
  '.hnbar #hnMic,.hnbar #hnPick{padding:20px 6px;font-size:17px;}' +
  '.hnbar button{flex:1;background:#fff;color:#0f172a;border:0;border-radius:12px;padding:12px 6px;font:inherit;font-size:16px;font-weight:800;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.15);}' +
  '.hnbox{background:#fff;border-radius:14px;margin:4px 0 10px;box-shadow:0 4px 14px rgba(0,0,0,.15);overflow:hidden;}' +
  '.hnbox .ccin{margin:0;box-shadow:none;border-radius:0;background:transparent;}' +
  '.hnbox .hnthumbs{padding:14px 14px 0;margin:0;}' +
  '.hnthumbs{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 8px;}' +
  '.hnthumbs:empty{display:none;}' +
  '.hnth{position:relative;}' +
  '.hnth img{display:block;width:76px;height:76px;object-fit:cover;border-radius:10px;}' +
  '.hnth button{position:absolute;top:-6px;right:-6px;width:24px;height:24px;border:0;border-radius:50%;background:#0f172a;color:#fff;font-size:14px;line-height:24px;padding:0;cursor:pointer;}';
function honeyScript_(C) {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function popup(msg, o) { if (typeof szPopup_ === 'function') szPopup_(msg, o); else alert(msg); }
  var picks = [], sending = false, cache = {};
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var full = lsGet('zk_honey_full') === '1', where = lsGet('zk_honey_where') === 'pc' ? 'pc' : 'server';
  if (!full) where = 'server';
  function opName() { return (full && where === 'pc') ? 'hachimitsu_pc' : 'hachimitsu'; }
  function idn() { return { who: window.__SZ_WHO_ || '', role: window.__SZ_ROLE_ || '', device: window.__SZ_DEVICE_ || '' }; }
  function jsonp(p, cb) {
    var n = '__honey' + Date.now() + Math.floor(Math.random() * 1000);
    window[n] = function (r) { try { delete window[n]; } catch (e) {} cb(r); };
    var q = 'callback=' + n; for (var k in p) q += '&' + k + '=' + encodeURIComponent(p[k]);
    var s = document.createElement('script'); s.src = C.exec + '?' + q + '&cb=' + Date.now();
    s.onerror = function () { cb({ ok: false, error: '通信に失敗しました。もう一度試してもらえると嬉しいです🙇' }); }; document.body.appendChild(s);
  }
  function devKey(cb) {
    if ((window.__SZ_ROLE_ || '') !== '開発') { cb({}); return; }
    var dv = '', dk = '';
    try { dv = localStorage.getItem('zk_dv') || ''; dk = localStorage.getItem('zk_dk') || ''; } catch (e) {}
    if (!dv || !dk || !window.crypto || !crypto.subtle || typeof TextEncoder === 'undefined') { cb({}); return; }
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(dk)).then(function (b) {
      var h = Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
      cb({ zdv: dv, zdh: h });
    }, function () { cb({}); });
  }
  function ask(fields, busy, done) {
    devKey(function (ex) { for (var k in ex) fields[k] = ex[k]; ask0(fields, busy, done); });
  }
  function ask0(fields, busy, done) {
    if (busy && typeof szOvShow_ === 'function') szOvShow_(szBusyHtml_(busy, false), '#2C7A99');
    var end = function (err, d) { if (busy && typeof szOvHide_ === 'function') szOvHide_(); done(err, d); };
    var me = idn();
    var poll = function (id) {
      var n = 0, max = full ? 1700 : 480;    
      var tick = function () {
        n++; if (n > max) { end('時間切れです。もう一度試してもらえると嬉しいです🙇'); return; }
        jsonp({ action: 'status', key: C.key, id: id }, function (x) {
          if (!x || !x.ok) { setTimeout(tick, 2000); return; }
          if (x.status === 'pending' || x.status === 'running' || x.status === 'queued' || x.status === '') { setTimeout(tick, 1500); return; }
          if (x.status !== 'done') { end(x.result || 'エラーが発生しました。りゅうさんに連絡しました。'); return; }
          var d = null; try { d = JSON.parse(x.result || '{}'); } catch (e) {}
          if (d && d.__bigres) {
            jsonp({ action: 'data', key: C.key, name: d.__bigres }, function (y) {
              var v = null; try { v = JSON.parse(y && y.result); } catch (e) {}
              if (!v) { end('答えを読み込めませんでした。もう一度試してもらえると嬉しいです🙇'); return; }
              end(null, v);
            });
            return;
          }
          end(null, d || {});
        });
      };
      setTimeout(tick, 1200);
    };
    var send = function (ft) {
      jsonp({ action: 'submit', key: C.key, op: opName(), who: me.who, role: me.role, device: me.device, fields: ft },
        function (r) {
          if (!r || !r.ok || !r.id) { end((r && r.error) || '通信に失敗しました。もう一度試してもらえると嬉しいです🙇'); return; }
          poll(r.id);
        });
    };
    if (typeof BIG === 'undefined') { send(JSON.stringify(fields)); return; }
    BIG.prepare({ exec: C.exec, key: C.key, slot: me.device || 'x', tag: 'hachimitsu', op: opName(),
                  who: me.who, role: me.role, device: me.device, fields: fields },
      send, function () { end('写真を送信できませんでした。枚数を減らして、もう一度試してもらえると嬉しいです🙇'); });
  }
  var DBN = 'zk_honey', ST = 'img', KEEP = 30, dbp = null;      
  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (ok) {
      try {
        var rq = indexedDB.open(DBN);      
        rq.onupgradeneeded = function () { rq.result.createObjectStore(ST); };
        rq.onsuccess = function () {
          var d = rq.result;
          if (d.objectStoreNames.contains(ST)) { ok(d); return; }
          var v = d.version + 1; d.close();
          var r2 = indexedDB.open(DBN, v);
          r2.onupgradeneeded = function () { if (!r2.result.objectStoreNames.contains(ST)) r2.result.createObjectStore(ST); };
          r2.onsuccess = function () { ok(r2.result); };
          r2.onerror = function () { ok(null); };
        };
        rq.onerror = function () { ok(null); };
      } catch (e) { ok(null); }
    });
    return dbp;
  }
  function idbGet(k, cb) {
    db().then(function (d) {
      if (!d) { cb(null); return; }
      try {
        var r = d.transaction(ST).objectStore(ST).get(k);
        r.onsuccess = function () { cb(r.result && r.result.src || null); };
        r.onerror = function () { cb(null); };
      } catch (e) { cb(null); }
    });
  }
  function idbPut(k, src) {
    db().then(function (d) {
      if (!d) return;
      try {
        var os = d.transaction(ST, 'readwrite').objectStore(ST), all = [];
        os.put({ src: src, t: Date.now() }, k);
        var c = os.openCursor();
        c.onsuccess = function () {
          var cur = c.result;
          if (cur) { all.push([cur.key, (cur.value && cur.value.t) || 0]); cur.continue(); return; }
          if (all.length <= KEEP) return;
          all.sort(function (a, b) { return a[1] - b[1]; });
          for (var i = 0; i < all.length - KEEP; i++) os.delete(all[i][0]);
        };
      } catch (e) {}
    });
  }
  function fillImg(el, next) {
    next = next || function () {};
    var n = el.getAttribute('data-n'); if (!n || el.getAttribute('data-done')) { next(); return; }
    el.setAttribute('data-done', '1');
    var v = el.getAttribute('data-v') || '', k = n + '|' + v;
    var put = function (src) {
      el.src = src;
      var a = el.nextSibling;
      if (a && a.className === 'hnsave') { a.href = src; a.download = 'hachimitsu.' + (/^data:image\/png/.test(src) ? 'png' : 'jpg'); a.style.visibility = 'visible'; }
    };
    if (cache[k]) { put(cache[k]); next(); return; }
    idbGet(k, function (src) {
      if (src) { cache[k] = src; put(src); next(); return; }
      jsonp({ action: 'data', key: C.key, name: n }, function (r) {
        if (!(r && r.b64)) { el.removeAttribute('data-done'); next(); return; }
        var s2 = 'data:' + (r.mime || 'image/jpeg') + ';base64,' + r.b64;
        cache[k] = s2; put(s2);
        if (!v || r.v === v) idbPut(k, s2);    
        next();
      });
    });
  }
  var drawNo = 0;
  function fillAll() {
    var my = ++drawNo;      
    var list = Array.prototype.slice.call($('hnLog').querySelectorAll('img[data-n]')).reverse();
    (function step(i) { if (my !== drawNo || i >= list.length) return; fillImg(list[i], function () { step(i + 1); }); })(0);
  }
  function imgs(list, cls, save) {
    var h = '';
    (list || []).forEach(function (x) {
      var ar = (x.w && x.h) ? ' style="aspect-ratio:' + Number(x.w) + '/' + Number(x.h) + '"' : '';
      h += '<img class="' + cls + '" data-n="' + esc(x.n) + '" data-v="' + esc(x.v || '') + '"' + ar + ' alt="">';
      if (save) h += '<a class="hnsave" style="visibility:hidden" download="hachimitsu.jpg">画像を保存</a>';
    });
    return h;
  }
  var lastJson = '';
  function HK() { return 'zk_honey_hist' + (where === 'pc' ? '_pc' : ''); }      
  function histGet() { try { return JSON.parse(localStorage.getItem(HK()) || 'null'); } catch (e) { return null; } }
  function histPut(items) { try { localStorage.setItem(HK(), JSON.stringify(items || [])); } catch (e) {} }
  function draw(items) {
    items = items || [];
    lastJson = JSON.stringify(items);
    histPut(items);
    if (!items.length) { $('hnLog').innerHTML = ''; return; }     
    var out = '';
    items.forEach(function (x) {
      if (x.q || (x.qimg && x.qimg.length)) out += '<div class="ccq">' + esc(x.q || '') + imgs(x.qimg, 'hnqimg', false) + '</div>';
      out += '<div class="cca">' + esc(x.a || '') + imgs(x.img, 'hnimg', true) + '<div class="cct">' + esc(x.at || '') + '</div></div>';
    });
    $('hnLog').innerHTML = out;
    fillAll();
  }
  function drawPicks() {
    $('hnThumbs').innerHTML = picks.map(function (p, i) {
      return '<div class="hnth"><img src="data:image/jpeg;base64,' + p.b64 + '" alt=""><button type="button" data-i="' + i + '">×</button></div>';
    }).join('');
  }
  function addFile(f) {
    if (!/^image\//.test(f.type)) { popup('画像を選択してください😊'); return; }
    if (picks.length >= 4) { popup('写真は4枚までです😊'); return; }
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        var mx = 1600, w = im.width, h = im.height;
        if (w > mx || h > mx) { if (w >= h) { h = Math.round(h * mx / w); w = mx; } else { w = Math.round(w * mx / h); h = mx; } }
        var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(im, 0, 0, w, h);
        picks.push({ b64: cv.toDataURL('image/jpeg', 0.88).split(',')[1], mime: 'image/jpeg' });
        drawPicks();
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(f);
  }
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null;
  var lang = 'ja-JP';
  var IOS = /iPhone|iPad|iPod/.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var wantMic = false, micAt = 0, gotText = false;
  function kbHint() { popup('このiPhoneでは音声入力のボタンが止まってしまいました。入力欄を押して、キーボードの🎤（マイク）のボタンで話してください😊'); }
  function micOff() { wantMic = false; rec = null; $('hnMic').classList.remove('on'); $('hnMic').textContent = '🎤 音声入力'; $('hnText').value = $('hnText').value.replace(/[、，]$/, ''); }
  function micStop() { wantMic = false; try { if (rec) rec.stop(); } catch (e) {} if (!rec) micOff(); }
  function micStart() {
    var base = $('hnText').value, said = '';
    rec = new SR();
    rec.lang = lang; rec.interimResults = true; rec.continuous = IOS;
    micAt = Date.now(); gotText = false;
    rec.onresult = function (e) {
      var t = '';
      for (var i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      said = t;
      if (t) gotText = true;
      $('hnText').value = base + t;
    };
    rec.onerror = function (e) {
      if (e && (e.error === 'not-allowed' || e.error === 'service-not-allowed')) {
        wantMic = false;
        if (IOS) kbHint();
        else popup('マイクの使用が許可されていません。スマホの設定でマイクを許可してください🙇');
      }
    };
    rec.onend = function () {
      rec = null;
      if (!wantMic) { micOff(); return; }
      if (IOS) {      
        var quick = !gotText && Date.now() - micAt < 4000;
        micOff();
        if (quick) kbHint();
        return;
      }
      if (said && !/[\s、。,.!?！？]$/.test(said)) $('hnText').value += (lang === 'zh-TW' ? '，' : '、');
      setTimeout(function () { if (!wantMic) { micOff(); return; } try { micStart(); } catch (er) { micOff(); } }, 250);
    };
    rec.start();
  }
  $('hnMic').addEventListener('click', function () {
    if (!SR) { popup('このスマホでは音声入力のボタンを使えません。入力欄を押して、キーボードの🎤（マイク）のボタンで話してください😊'); return; }
    if (wantMic) { micStop(); return; }
    try {
      wantMic = true;
      micStart();
      $('hnMic').classList.add('on'); $('hnMic').textContent = '⏹ 止める';
    } catch (e) { micOff(); popup('音声入力を開始できませんでした。入力欄を押して、キーボードの🎤（マイク）のボタンで話してください😊'); }
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden && wantMic) micStop(); });
  $('hnPick').addEventListener('click', function () { $('hnFile').click(); });
  $('hnFile').addEventListener('change', function () { Array.prototype.slice.call(this.files || []).forEach(addFile); this.value = ''; });
  $('hnThumbs').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    picks.splice(Number(b.getAttribute('data-i')), 1); drawPicks();
  });
  var PC_OFF = '自宅PCが動いていません。自宅PCの電源を確認するか、スイッチをサーバーに切り替えてください🙇';
  function go(fields, busy, done) {
    if (opName() !== 'hachimitsu_pc') { ask(fields, busy, done); return; }
    jsonp({ action: 'data', key: C.key, name: 'honey_pc_alive.json' }, function (y) {
      var v = null;
      try { v = (y && typeof y.result === 'string') ? JSON.parse(y.result) : (y && y.at ? y : (y && y.result)); } catch (e) {}
      var age = (v && v.at) ? Date.now() / 1000 - Number(v.at) : 1e9;
      if (!(age < 150)) { done(PC_OFF); return; }
      ask(fields, busy, done);
    });
  }
  function drawSw() {
    $('hnSw').style.display = full ? '' : 'none';
    document.querySelector('.hntop').classList.toggle('sw', full);
    $('hnText').placeholder = (full ? 'りゅうさん' : 'なすさん') + 'をお助けしたいですの！相談事をここに入力してね😊';
    Array.prototype.forEach.call($('hnSw').querySelectorAll('button'), function (b) { b.classList.toggle('on', b.getAttribute('data-w') === where); });
  }
  function setFull(d) {
    if (!d || typeof d.full === 'undefined') return;
    full = !!d.full; lsSet('zk_honey_full', full ? '1' : '0');
    if (!full && where === 'pc') { where = 'server'; lsSet('zk_honey_where', 'server'); }
    drawSw();
  }
  function loadHist(busy) {
    var my = where;
    go({ act: 'history' }, busy, function (err, d) {
      if (my !== where) return;      
      if (err) { if (busy) popup(err); else if (!histGet()) $('hnLog').innerHTML = '<div class="ccnone">' + esc(err) + '</div>'; return; }
      setFull(d);
      if (JSON.stringify(d.items || []) === lastJson) return;      
      draw(d.items); stickBottom();
    });
  }
  $('hnSw').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || sending) return;
    var w = b.getAttribute('data-w'); if (w === where) return;
    where = w; lsSet('zk_honey_where', w); drawSw();
    var c = histGet(); lastJson = ''; draw(c || []); stickBottom();
    loadHist('少し待っててくださいね🥺');
  });
  drawSw();
  $('hnReset').addEventListener('click', function () {
    if (sending) return;
    popup('これまでの会話を削除して、最初から話しますか？😊', { icon: '', cancel: true, onYes: function () {
      go({ act: 'clear' }, '少し待っててくださいね🥺', function (err, d) { if (err) { popup(err); return; } setFull(d); draw(d.items); });
    } });
  });
  $('hnSend').addEventListener('click', function () {
    if (sending) return;
    var t = $('hnText').value.replace(/^\s+|\s+$/g, '');
    if (!t && !picks.length) { popup('聞きたいことを入力してください😊'); return; }
    if (t.length > 2000) { popup('長すぎます。2000文字までにしてください😊'); return; }
    if (wantMic) micStop();
    sending = true; $('hnSend').disabled = true;
    go({ act: 'send', text: t, images: picks }, 'ハチミツちゃんが作業中です🍯', function (err, d) {
      sending = false; $('hnSend').disabled = false;
      if (err) { popup(err); return; }
      setFull(d);
      $('hnText').value = ''; picks = []; drawPicks(); draw(d.items);
      stickBottom();
    });
  });
  try { history.scrollRestoration = 'manual'; } catch (e) {}
  var stick = true, autoY = -1, tries = [];
  function toBottom() {
    var de = document.documentElement;
    window.scrollTo(0, de.scrollHeight);
    autoY = window.scrollY || de.scrollTop || 0;
  }
  function stickBottom() {
    stick = true; toBottom();
    tries.forEach(clearTimeout);
    tries = [150, 500, 1200, 2500, 4500, 8000].map(function (ms) { return setTimeout(function () { if (stick) toBottom(); }, ms); });
  }
  ['touchstart', 'wheel', 'mousedown', 'keydown'].forEach(function (ev) {      
    window.addEventListener(ev, function (e) {
      if (e.target && e.target.closest && e.target.closest('.hnbox, .hnbar, #hnSend, .hntop')) return;
      stick = false;
    }, { passive: true });
  });
  if (window.ResizeObserver) new ResizeObserver(function () { if (stick) toBottom(); }).observe($('hnLog'));
  $('hnLog').addEventListener('load', function () { if (stick) toBottom(); }, true);
  var cached = histGet();
  if (cached) { draw(cached); stickBottom(); }
  loadHist('');
}
function renderHoneyPage_(base, staff, dev) {
  var C = {
    exec: 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec',
    key: 'kx7Q2p9mVt4Zr8'
  };
  return '<style>' + HOMECSS_ + EXPADCSS_ + CHATCSS_ + HONEYCSS_ + '</style>' +
    '<div class="home hnhome">' +
    '<div class="hntop">' + backBar_(base, staff, dev) +
      '<span class="hnttl"><img class="hnico" alt="" src="https://ttsuperzuco.github.io/tt/icons/hachimitsu-180.png?v=2"><span class="hntxt">ハチミツちゃん</span></span>' +
      '<div class="hnsw" id="hnSw" style="display:none"><button type="button" data-w="server">サーバー</button><button type="button" data-w="pc">自宅PC</button></div>' +
      '<button type="button" class="hnreset" id="hnReset">会話を初期化</button></div>' +
    '<div class="cc">' +
      '<div class="cclog" id="hnLog"><div class="ccnone">読み込み中です…</div></div>' +
      '<div class="hnbox"><div class="hnthumbs" id="hnThumbs"></div>' +
      '<textarea class="ccin" id="hnText" placeholder="なすさんをお助けしたいですの！相談事をここに入力してね😊"></textarea></div>' +
      '<div class="hnbar"><button type="button" id="hnMic">🎤 音声入力</button><button type="button" id="hnPick">🖼 画像選択</button></div>' +
      '<input type="file" id="hnFile" accept="image/*,application/pdf" multiple style="display:none">' +
      '<button type="button" class="exgo" id="hnSend">送信</button>' +
    '</div></div>' +
    '<script>(' + honeyScript_.toString() + ')(' + JSON.stringify(C).replace(/</g, '\\u003c') + ');<\/script>';
}
