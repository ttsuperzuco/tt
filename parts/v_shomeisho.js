// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：shomeisho
var SMCSS_ =
  '.smwrap{position:fixed;left:0;top:0;right:0;bottom:0;background:#2C7A99;z-index:5;}' +
  '.smwrap iframe{position:absolute;left:0;top:0;width:100%;height:100%;border:0;background:#2C7A99;}' +
  '#smCertBox{display:none;position:absolute;left:0;top:0;right:0;bottom:0;background:#2C7A99;}' +
  '#smCertBox .smbar{position:absolute;left:0;right:0;top:0;height:58px;display:flex;align-items:center;padding:0 10px;box-sizing:border-box;}' +
  '#smCertBox .smbar .ubar{margin:0;}' +
  '.smzoom{margin-left:auto;background:#fff;color:#2C7A99;border:0;border-radius:999px;padding:9px 16px;font:inherit;font-weight:900;font-size:15px;cursor:pointer;}' +
  '.smprint{margin-left:8px;background:#16a34a;color:#fff;border:0;border-radius:999px;padding:9px 16px;font:inherit;font-weight:900;font-size:15px;cursor:pointer;white-space:nowrap;}' +
  '#smCertPane{position:absolute;left:0;right:0;top:58px;bottom:0;overflow:auto;-webkit-overflow-scrolling:touch;}' +
  '#smCertSizer{position:relative;overflow:hidden;margin:0 auto;}' +
  '#smCertSizer iframe{position:absolute;left:0;top:0;width:1180px;height:1000px;transform-origin:0 0;background:#fff;}' +
  '.smmsg{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
  'padding:30px;box-sizing:border-box;text-align:center;color:#fff;font-weight:800;font-size:20px;line-height:1.7;}' +
  '.smmsg button{margin-top:16px;background:#fff;color:#2C7A99;border:0;border-radius:999px;padding:10px 22px;font:inherit;font-weight:900;cursor:pointer;}';
function shomeishoScript_(C) {
  function $(id) { return document.getElementById(id); }
  function jsonp(p, cb) {
    var n = '__smk' + Date.now() + Math.floor(Math.random() * 100000);
    window[n] = function (r) { try { delete window[n]; } catch (e) {} cb(r); };
    var q = 'callback=' + n; for (var k in p) q += '&' + k + '=' + encodeURIComponent(p[k]);
    var s = document.createElement('script'); s.src = C.exec + '?' + q + '&cb=' + Date.now();
    s.onerror = function () { cb({ ok: false, error: '通信エラーです' }); }; document.body.appendChild(s);
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
  function ask(fn, args, done) {
    devKey(function (ex) {
      var f = { fn: fn, args: args || [] }; for (var k in ex) f[k] = ex[k];
      jsonp({ action: 'submit', key: C.key, op: 'shomeisho', who: window.__SZ_WHO_ || '', role: window.__SZ_ROLE_ || '',
              device: window.__SZ_DEVICE_ || '', fields: JSON.stringify(f) }, function (r) {
        if (!r || !r.ok || !r.id) { done('通信エラーです。もう一度試してもらえると嬉しいです🙇'); return; }
        var n = 0, max = (typeof LIMITS !== 'undefined') ? LIMITS.tries('shomeisho', 700) : 300;
        (function poll() {
          n++;
          if (n > max) { done('時間切れです。もう一度試してもらえると嬉しいです🙇'); return; }
          jsonp({ action: 'status', key: C.key, id: r.id }, function (s) {
            if (!s || !s.ok || s.status === 'pending' || s.status === 'running' || s.status === 'queued' || s.status === '') { setTimeout(poll, 700); return; }
            if (s.status !== 'done') { done(s.result || 'エラーが発生しました。りゅうさんに連絡しました。'); return; }
            var d = null; try { d = JSON.parse(s.result || '{}'); } catch (e) {}
            if (d && d.__bigres) {
              jsonp({ action: 'data', key: C.key, name: d.__bigres }, function (y) {
                var v = null; try { v = JSON.parse(y && y.result); } catch (e) {}
                if (!v || !v.ok) { done('読み込みに失敗しました。もう一度試してもらえると嬉しいです🙇'); return; }
                done(null, v.result);
              });
              return;
            }
            if (!d || !d.ok) { done('エラーが発生しました。りゅうさんに連絡しました。'); return; }
            done(null, d.result);
          });
        })();
      });
    });
  }
  var frame = $('smFrame'), cert = $('smCert'), box = $('smCertBox'), sizer = $('smCertSizer'), zoom = false;
  function fit() {
    if (box.style.display !== 'block') return;
    var h = 1000;
    try { h = Math.max(600, cert.contentDocument.documentElement.scrollHeight); } catch (e) {}
    var s = zoom ? 1 : Math.min(1, ($('smCertPane').clientWidth - 8) / 1180);
    cert.style.height = h + 'px'; cert.style.transform = 'scale(' + s + ')';
    sizer.style.width = Math.ceil(1180 * s) + 'px'; sizer.style.height = Math.ceil(h * s) + 'px';
    $('smZoom').textContent = zoom ? '全体を表示' : '拡大して表示';
  }
  cert.onload = function () { setTimeout(fit, 60); setTimeout(fit, 1500); };
  window.addEventListener('resize', fit);
  $('smZoom').onclick = function () { zoom = !zoom; fit(); };
  $('smPrint').onclick = function () { try { cert.contentWindow.focus(); cert.contentWindow.print(); } catch (e) {} };
  function exit() { var a = document.querySelector('#smHome a'); if (a) a.click(); }
  var LSK = 'sz_shomeisho_page', VIEW = 'shomeisho_view.json', shown = '';
  function showPage(h) { frame.srcdoc = h; frame.style.display = ''; $('smMsg').style.display = 'none'; }
  var bundle = { done: false, err: null, res: null, waits: [] };
  function bundleSet(err, res) {
    bundle.done = true; bundle.err = err; bundle.res = res;
    var w = bundle.waits; bundle.waits = [];
    for (var i = 0; i < w.length; i++) w[i](err, res);
  }
  function bundleGet(cb) { if (bundle.done) cb(bundle.err, bundle.res); else bundle.waits.push(cb); }
  function notStarted() {
    try { return !!frame.contentWindow.eval("typeof S==='object' && (S.step==='home' || (S.step==='pick' && !S.lines.length))"); }
    catch (e) { return false; }
  }
  function readView(cb) {
    jsonp({ action: 'data', key: C.key, name: VIEW }, function (r) {
      cb((r && r.html && r.stamp && r.bundle && r.bundle.pre) ? r : null);
    });
  }
  function useView(v) { shown = v.stamp; bundleSet(null, v.bundle); showPage(v.html); }
  function failed(err) {
    $('smMsg').innerHTML = (err || '読み込みに失敗しました。') + '<br><button type="button" id="smRetry">もう一度読み込む</button>' +
      '<br><button type="button" id="smExit">← 戻る</button>';
    $('smMsg').style.display = ''; frame.style.display = 'none';
    $('smRetry').onclick = load; $('smExit').onclick = exit;
  }
  function viaClerk() {
    ask('bundle', [], bundleSet);
    ask('page', [], function (err, r) { if (err || !r || !r.html) failed(err); else showPage(r.html); });
  }
  function load() {
    try { localStorage.removeItem(LSK); } catch (e) {}     
    shown = ''; bundle = { done: false, err: null, res: null, waits: [] };
    $('smMsg').innerHTML = (typeof szBusyHtml_ === 'function')
      ? szBusyHtml_('購入証明書を準備しています', '準備が終わったら自動で切り替わりますので、少し待っててくださいね🥺')
      : '購入証明書を準備しています…<br>少し待っててくださいね🥺';
    $('smMsg').style.display = ''; frame.style.display = 'none';
    readView(function (v) {
      if (!v) { viaClerk(); return; }
      useView(v);
      ask('stamp', [], function (err, res) {
        if (err || !res || !res.stamp || res.stamp === shown) return;
        readView(function (v2) { if (v2 && v2.stamp !== shown && notStarted()) useView(v2); });
      });
    });
  }
  if (window.__smMsgH) window.removeEventListener('message', window.__smMsgH);
  window.__smMsgH = function (ev) {
    if (!frame.contentWindow || ev.source !== frame.contentWindow) return;
    var d = ev.data || {};
    if (d.szsm === 'call') {
      var reply = function (err, res) {
        try { frame.contentWindow.postMessage({ szsm: 'ret', id: d.id, ok: !err, error: err || '', result: res }, '*'); } catch (e) {}
      };
      if (d.name === 'bundle') bundleGet(reply);
      else ask(String(d.name || ''), d.args || [], reply);
    } else if (d.szsm === 'cert') {
      zoom = false; box.style.display = 'block'; cert.srcdoc = String(d.html || ''); fit();
    } else if (d.szsm === 'exit') {
      exit();
    }
  };
  window.addEventListener('message', window.__smMsgH);
  $('smCertBack').onclick = function () { box.style.display = 'none'; cert.srcdoc = ''; };
  load();
}
function renderShomeishoPage_(base, staff, dev) {
  var C = {
    exec: 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec',
    key: 'kx7Q2p9mVt4Zr8'
  };
  return '<style>' + HOMECSS_ + SMCSS_ + '</style>' +
    '<div id="smHome" style="display:none">' + backBar_(base, staff, dev) + '</div>' +
    '<div class="smwrap">' +
      '<div id="smMsg" class="smmsg"></div>' +
      '<iframe id="smFrame" title="購入証明書作成" style="display:none"></iframe>' +
      '<div id="smCertBox"><div class="smbar"><div class="ubar"><a class="uhome" id="smCertBack" href="javascript:void(0)">← 戻る</a></div>' +
          '<button type="button" class="smzoom" id="smZoom">拡大して表示</button>' +
          '<button type="button" class="smprint" id="smPrint">🖨️ 印刷する</button></div>' +
        '<div id="smCertPane"><div id="smCertSizer"><iframe id="smCert" title="購入証明書"></iframe></div></div></div>' +
    '</div>' +
    '<script>(' + shomeishoScript_.toString() + ')(' + JSON.stringify(C).replace(/</g, '\\u003c') + ');<\/script>';
}
