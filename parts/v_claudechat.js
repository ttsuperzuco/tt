// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：claudechat
function claudeChatScript_(C) {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function popup(msg) { if (typeof szPopup_ === 'function') szPopup_(msg); else alert(msg); }
  var who = String(window.__SZ_WHO_ || '').replace(/[^a-z]/g, '') || 'dev';
  var sending = false;
  function jsonp(p, cb) {
    var n = '__cchat' + Date.now() + Math.floor(Math.random() * 1000);
    window[n] = function (r) { try { delete window[n]; } catch (e) {} cb(r); };
    var q = 'callback=' + n; for (var k in p) q += '&' + k + '=' + encodeURIComponent(p[k]);
    var s = document.createElement('script'); s.src = C.exec + '?' + q + '&cb=' + Date.now();
    s.onerror = function () { cb({ ok: false, error: '通信エラーです' }); }; document.body.appendChild(s);
  }
  function draw(h) {
    var items = (h && h.items) || [], out = '';
    if (!items.length) { $('ccLog').innerHTML = '<div class="ccnone">聞きたいことを下に書いて「送る」を押してください😊</div>'; return; }
    for (var i = 0; i < items.length; i++) {
      out += '<div class="ccq">' + esc(items[i].q || '') + '</div>' +
        '<div class="cca">' + esc(items[i].a || '') + '<div class="cct">' + esc(items[i].at || '') + '</div></div>';
    }
    $('ccLog').innerHTML = out;
  }
  function load(after) {
    jsonp({ action: 'data', name: 'claude_chat_' + who + '.json' }, function (r) {
      draw(r && r.items ? r : null);
      if (after) after();
    });
  }
  function fail(msg) { sending = false; if (typeof szOvHide_ === 'function') szOvHide_(); $('ccSend').disabled = false; popup(msg); }
  var polls = 0, MAX = Math.ceil(12 * 60 * 1000 / (3000 + 1100));
  function poll(id) {
    polls++;
    if (polls > MAX) { fail('時間切れです。もう一度試してもらえると嬉しいです🙇'); return; }
    jsonp({ action: 'status', key: C.key, id: id }, function (r) {
      if (!r || !r.ok) { setTimeout(function () { poll(id); }, 3000); return; }   
      if (r.status === 'pending' || r.status === 'running' || r.status === 'queued' || r.status === '') { setTimeout(function () { poll(id); }, 3000); return; }
      if (r.status !== 'done') { fail(r.result || '時間切れです。もう一度試してもらえると嬉しいです🙇'); return; }
      load(function () {
        sending = false; $('ccText').value = ''; $('ccSend').disabled = false;
        if (typeof szOvHide_ === 'function') szOvHide_();
        window.scrollTo(0, document.body.scrollHeight);
      });
    });
  }
  $('ccSend').addEventListener('click', function () {
    if (sending) return;
    var t = $('ccText').value.replace(/^\s+|\s+$/g, '');
    if (!t) { popup('聞きたいことを入力してください😊'); return; }
    if (t.length > 2000) { popup('長すぎます。2000文字までにしてください😊'); return; }
    sending = true; polls = 0; $('ccSend').disabled = true;
    if (typeof szOvShow_ === 'function') szOvShow_(szBusyHtml_('考え中…', false), '#2C7A99');
    jsonp({ action: 'submit', key: C.key, op: 'claude_chat',
            who: window.__SZ_WHO_ || '', role: window.__SZ_ROLE_ || '', device: window.__SZ_DEVICE_ || '',
            fields: JSON.stringify({ text: t }) },
      function (r) {
        if (!r || !r.ok || !r.id) { fail('送れませんでした。もう一度試してもらえると嬉しいです🙇'); return; }
        setTimeout(function () { poll(r.id); }, 3000);
      });
  });
  load();
}
function renderClaudeChatPage_(base, staff, dev) {
  var C = {
    exec: 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec',
    key: 'kx7Q2p9mVt4Zr8'
  };
  return '<style>' + HOMECSS_ + EXPADCSS_ + CLAUDECHATCSS_ + '</style>' +
    '<div class="home">' + backBar_(base, staff, dev) +
    '<div class="cc">' +
      '<div class="hhead"><span class="bmark">💬</span><span class="bname">Claudeに聞く</span></div>' +
      '<div class="cclog" id="ccLog"><div class="ccnone">読み込み中…</div></div>' +
      '<textarea class="ccin" id="ccText" placeholder="聞きたいことを入力してください😊"></textarea>' +
      '<button type="button" class="exgo" id="ccSend">送る</button>' +
    '</div></div>' +
    '<script>(' + claudeChatScript_.toString() + ')(' + JSON.stringify(C).replace(/</g, '\\u003c') + ');<\/script>';
}
