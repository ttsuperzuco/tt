// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：claudeconn
function renderClaudeConnPage_(base, staff, dev) {
  var C = {
    exec: 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec',
    key: 'kx7Q2p9mVt4Zr8'
  };
  return '<style>' + HOMECSS_ +
    '.ccwrap{max-width:720px;margin:0 auto;padding:0 2px 40px}' +
    '.ccttl{color:#fff;font-size:24px;font-weight:900;margin:4px 4px 6px}' +
    '.ccnote{color:#fff;font-weight:800;font-size:17px;line-height:1.6;margin:0 4px 14px}' +
    '.cclist{display:flex;flex-direction:column;gap:10px}' +
    '.ccrow{display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;background:#fff;border:3px solid transparent;border-radius:14px;padding:12px 14px;text-align:left;font:inherit;cursor:pointer}' +
    '.ccrow.on{border-color:#38bdf8}' +
    '.ccrow .tt{flex:1 1 auto;min-width:0;font-weight:900;color:#12303c;font-size:17px;line-height:1.35;overflow-wrap:anywhere}' +
    '.ccrow .tm{display:block;font-weight:700;color:#5b7480;font-size:13px;margin-top:2px}' +
    '.ccrow .bd{flex:0 0 auto;background:#2C7A99;color:#fff;border-radius:999px;font-size:12px;font-weight:900;padding:2px 9px;white-space:nowrap}' +
    '.ccmsg{color:#fff;font-weight:700;margin:10px 4px;line-height:1.7}' +
    '.ccre{display:block;margin:16px auto 0;font:inherit;font-size:16px;font-weight:900;color:#12303c;background:#fff;border:0;border-radius:999px;padding:10px 22px;cursor:pointer}' +
    '</style>' +
    '<div class="home">' + backBarUnlessSolo_(base, staff, dev) + '<div class="ccwrap">' +
      '<div class="ccttl">🔗 Claudeと接続</div>' +
      '<div class="ccnote">会話を押すと、スマホのClaudeアプリからその会話に話しかけられるようになります。<br>自宅PCを再起動すると、つないだ会話は全部切れます。</div>' +
      '<div id="ccBody"><div class="ccmsg">読み込み中…</div></div>' +
      '<button type="button" class="ccre" id="ccReload">🔄 一覧を読み直す</button>' +
    '</div></div>' +
    '<script>(' + claudeConnScript_.toString() + ')(' + JSON.stringify(C).replace(/</g, '\\u003c') + ');<\/script>';
}
function claudeConnScript_(C) {
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function popup(msg) { if (typeof szPopup_ === 'function') szPopup_(msg); else alert(msg); }
  var box = document.getElementById('ccBody'), busy = false;
  function jsonp(p, cb) {
    var n = '__ccc' + Date.now() + Math.floor(Math.random() * 1000);
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
  function ask(fields, maxSec, done) {
    devKey(function (ex) {
      for (var k in ex) fields[k] = ex[k];
      jsonp({ action: 'submit', key: C.key, op: 'claude_connect', who: window.__SZ_WHO_ || '', role: window.__SZ_ROLE_ || '',
              device: window.__SZ_DEVICE_ || '', fields: JSON.stringify(fields) }, function (r) {
        if (!r || !r.ok || !r.id) { done((r && r.error) || '通信に失敗しました。もう一度試してもらえると嬉しいです🙇'); return; }
        var t0 = Date.now();
        var tick = function () {
          if (Date.now() - t0 > maxSec * 1000) { done('時間切れです。もう一度試してもらえると嬉しいです🙇'); return; }
          jsonp({ action: 'status', key: C.key, id: r.id }, function (x) {
            if (!x || !x.ok || x.status === 'pending' || x.status === 'running' || x.status === 'queued' || x.status === '') { setTimeout(tick, 1500); return; }
            if (x.status !== 'done') { done(x.result || 'エラーが発生しました。もう一度試してもらえると嬉しいです🙇'); return; }
            var d = null; try { d = JSON.parse(x.result || '{}'); } catch (e) {}
            if (!d || !d.ok) { done((d && d.error) || '答えを読み込めませんでした。もう一度試してもらえると嬉しいです🙇'); return; }
            done(null, d);
          });
        };
        setTimeout(tick, 1500);
      });
    });
  }
  function when(ms) {
    var d = new Date(ms), now = new Date();
    var hm = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    return (d.toDateString() === now.toDateString()) ? '今日 ' + hm : (d.getMonth() + 1) + '/' + d.getDate() + ' ' + hm;
  }
  function draw(rows) {
    if (!rows.length) { box.innerHTML = '<div class="ccmsg">会話がありません。</div>'; return; }
    box.innerHTML = '<div class="cclist">' + rows.map(function (x, i) {
      return '<button type="button" class="ccrow' + (x.rc ? ' on' : '') + '" data-i="' + i + '"><span class="tt">' + esc(x.title) +
        '<span class="tm">' + esc(when(x.last)) + '</span></span>' + (x.rc ? '<span class="bd">📱 つながっています</span>' : '') + '</button>';
    }).join('') + '</div>';
    var bs = box.querySelectorAll('.ccrow');
    for (var j = 0; j < bs.length; j++) bs[j].addEventListener('click', function () { connect(rows[+this.getAttribute('data-i')]); });
  }
  function load() {
    box.innerHTML = '<div class="ccmsg">読み込み中…</div>';
    ask({ act: 'list' }, 40, function (err, d) {
      if (err) { box.innerHTML = '<div class="ccmsg">' + esc(err) + '</div>'; return; }
      draw(d.rows || []);
    });
  }
  function connect(x) {
    if (busy || !x) return;
    busy = true;
    if (typeof szOvShow_ === 'function') szOvShow_(szBusyHtml_('「' + esc(x.title) + '」をつないでいます', '30秒ほどかかります。少し待っててくださいね🥺'), '#2C7A99');
    ask({ act: 'connect', sid: x.id }, 150, function (err, d) {
      busy = false;
      if (err) { if (typeof szOvHide_ === 'function') szOvHide_(); popup(err); return; }
      var note = "<div style='color:#fff;font-size:18px;font-weight:700;line-height:1.7;margin:0 auto 22px;max-width:420px;word-break:auto-phrase;text-wrap:pretty'>" +
        'スマホのClaudeアプリの一覧から、<wbr>この会話を開いてください😊</div>';
      szOvShow_(szDoneHtml_('「' + esc(d.title) + '」がスマホとつながりました', '一覧に戻る').replace("<button type='button' id='szDoneBack'", note + "<button type='button' id='szDoneBack'"), '#16a34a');
      var b = document.getElementById('szDoneBack');
      if (b) b.addEventListener('click', function () { szOvHide_(); load(); });
    });
  }
  document.getElementById('ccReload').addEventListener('click', function () { if (!busy) load(); });
  load();
}
