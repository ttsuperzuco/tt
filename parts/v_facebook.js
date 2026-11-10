// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：facebook
var FBCSS_ =
  '.fbw{width:100%;box-sizing:border-box;max-width:560px;margin:0 auto;padding:0 6px 60px;text-align:left;}' +
  '.fbacct{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:6px 0 10px;}' +
  '.fbacct button{background:#fff;color:#0f172a;border:3px solid transparent;border-radius:14px;padding:14px 4px;font:inherit;font-size:18px;font-weight:900;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.15);}' +
  '.fbacct button.on{background:#16a34a;color:#fff;border-color:#15803d;}' +
  '.fbacct.one{grid-template-columns:1fr;}' +
  '.fbstat{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#eaf6fb;font-size:14px;font-weight:700;margin:0 4px 8px;}' +
  '.fbstat button{background:#fff;color:#0f172a;border:0;border-radius:999px;padding:6px 12px;font:inherit;font-size:14px;font-weight:800;cursor:pointer;}' +
  '.fbapp{background:#c9ccd1;color:#080809;border-radius:16px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI Historic","Segoe UI","Hiragino Sans","Hiragino Kaku Gothic ProN",Roboto,"Noto Sans JP",Helvetica,Arial,sans-serif;font-size:15px;line-height:1.34;-webkit-font-smoothing:antialiased;}' +
  '.fbapp svg{display:block;}' +
  '.fbapp button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;}' +
  '.fbsec{background:#fff;margin-bottom:8px;}' +
  '.fbtop{display:grid;grid-template-columns:40px 1fr 40px;align-items:center;height:48px;padding:0 8px;background:#fff;border-bottom:1px solid #e4e6eb;}' +
  '.fbtop .t{text-align:center;font-size:17px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
  '.fbtop button{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:none;border:0;cursor:pointer;color:#080809;}' +
  '.fbcover{position:relative;width:100%;aspect-ratio:16/9;background:#e4e6eb;}' +
  '.fbcover img{width:100%;height:100%;object-fit:cover;display:block;}' +
  '.fbav{position:relative;margin:-64px 0 0 16px;width:128px;height:128px;}' +
  '.fbav img{width:128px;height:128px;border-radius:50%;object-fit:cover;border:4px solid #fff;background:#e4e6eb;box-sizing:border-box;display:block;}' +
  '.fbhead{padding:8px 16px 16px;}' +
  '.fbhead .nm{font-size:24px;font-weight:700;line-height:1.2;word-break:break-word;}' +
  '.fbhead .nm .vf{display:inline-block;vertical-align:middle;margin-left:4px;}' +
  '.fbhead .fl{margin-top:6px;color:#65686c;font-size:15px;}' +
  '.fbhead .fl b{color:#080809;font-weight:700;}' +
  '.fbhead .ab{margin-top:10px;white-space:pre-wrap;word-break:break-word;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}' +
  '.fbbtns{display:flex;gap:8px;margin-top:14px;}' +
  '.fbbtns button{height:36px;border-radius:6px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:4px;font-size:15px;white-space:nowrap;min-width:0;}' +
  '.fbapp .fbbtns .msg{flex:1;background:#0866ff;color:#fff;}' +
  '.fbapp .fbbtns .fol{flex:1;background:#e2e5e9;color:#080809;}' +
  '.fbapp .fbbtns .more{width:44px;flex:0 0 44px;background:#e2e5e9;color:#080809;}' +
  '.fbtabs{display:flex;gap:4px;padding:8px 12px;overflow-x:auto;border-top:1px solid #e4e6eb;}' +
  '.fbapp .fbtabs button{padding:8px 14px;border-radius:18px;font-size:15px;font-weight:600;color:#65686c;white-space:nowrap;}' +
  '.fbapp .fbtabs button.on{background:#ebf5ff;color:#0064d1;}' +
  '.fbh2{display:flex;align-items:center;justify-content:space-between;padding:12px 16px 4px;}' +
  '.fbh2 b{font-size:20px;font-weight:700;}' +
  '.fbh2 span{color:#0064d1;font-size:15px;}' +
  '.fbinfo{padding:4px 16px 12px;}' +
  '.fbinfo .row{display:flex;gap:12px;align-items:flex-start;padding:8px 0;word-break:break-word;}' +
  '.fbinfo .row .ic{flex:0 0 20px;color:#65686c;margin-top:1px;}' +
  '.fbinfo .row a{color:#080809;text-decoration:none;font-weight:600;}' +
  '.fbinfo .row .sub{display:block;color:#65686c;font-size:13px;font-weight:400;}' +
  '.fbphotos{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;padding:0 16px 12px;}' +
  '.fbphotos button{aspect-ratio:1/1;background:#e4e6eb;overflow:hidden;}' +
  '.fbphotos.big{padding:0;}' +
  '.fbphotos img{width:100%;height:100%;object-fit:cover;display:block;}' +
  '.fbapp .fbseeall{display:block;margin:0 16px 14px;width:calc(100% - 32px);height:36px;border-radius:6px;background:#e2e5e9;font-weight:600;}' +
  '.fbreels{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;}' +
  '.fbreels button{position:relative;aspect-ratio:9/16;background:#000;overflow:hidden;}' +
  '.fbreels img{width:100%;height:100%;object-fit:cover;display:block;}' +
  '.fbreels .v{position:absolute;left:6px;bottom:6px;color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;gap:3px;text-shadow:0 1px 3px rgba(0,0,0,.6);}' +
  '.fbpost{background:#fff;margin-bottom:8px;padding-top:12px;}' +
  '.fbph{display:flex;gap:8px;padding:0 16px;align-items:flex-start;}' +
  '.fbph img{width:40px;height:40px;border-radius:50%;object-fit:cover;flex:0 0 40px;background:#e4e6eb;}' +
  '.fbph .who{flex:1;min-width:0;}' +
  '.fbph .who .n{font-size:15px;line-height:1.3;}' +
  '.fbph .who .n b{font-weight:600;}' +
  '.fbph .who .d{color:#65686c;font-size:13px;display:flex;align-items:center;gap:4px;margin-top:2px;}' +
  '.fbph .dots{color:#65686c;width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:none;border:0;cursor:pointer;}' +
  '.fbtx{padding:8px 16px 0;white-space:pre-wrap;word-break:break-word;}' +
  '.fbtx.cl{display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden;}' +
  '.fbmore{padding:0 16px;color:#65686c;font-weight:600;cursor:pointer;}' +
  '.fbmedia{margin-top:10px;display:grid;gap:2px;background:#fff;}' +
  '.fbmedia.n1{grid-template-columns:1fr;}' +
  '.fbmedia.n2,.fbmedia.n3,.fbmedia.n4{grid-template-columns:1fr 1fr;}' +
  '.fbmedia.n3 button:first-child{grid-column:1/3;}' +
  '.fbmedia button{position:relative;background:#e4e6eb;overflow:hidden;border:0;padding:0;cursor:pointer;}' +
  '.fbmedia.n1 button img{width:100%;max-height:560px;object-fit:cover;display:block;}' +
  '.fbmedia.n2 button,.fbmedia.n3 button,.fbmedia.n4 button{aspect-ratio:1/1;}' +
  '.fbmedia.n3 button:first-child{aspect-ratio:2/1;}' +
  '.fbmedia button img{width:100%;height:100%;object-fit:cover;display:block;}' +
  '.fbmedia .plus{position:absolute;inset:0;background:rgba(0,0,0,.45);color:#fff;font-size:30px;font-weight:700;display:flex;align-items:center;justify-content:center;}' +
  '.fbmedia .play{position:absolute;left:50%;top:50%;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;background:rgba(0,0,0,.55);border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;box-sizing:border-box;}' +
  '.fblink{margin-top:10px;background:#f0f2f5;padding:10px 16px;}' +
  '.fblink .u{color:#65686c;font-size:13px;text-transform:uppercase;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
  '.fblink .t{font-weight:600;}' +
  '.fblink .s{color:#65686c;font-size:14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;white-space:pre-wrap;}' +
  '.fbcnt{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;color:#65686c;font-size:15px;}' +
  '.fbcnt .rx{display:flex;align-items:center;gap:4px;}' +
  '.fbcnt .rx i{width:18px;height:18px;border-radius:50%;background:#0866ff;display:inline-flex;align-items:center;justify-content:center;}' +
  '.fbact{display:grid;grid-template-columns:1fr 1fr 1fr;border-top:1px solid #e4e6eb;margin:0 12px;padding:2px 0;}' +
  '.fbact button{display:flex;align-items:center;justify-content:center;gap:4px;height:40px;color:#65686c;font-weight:600;font-size:14px;border-radius:6px;background:none;border:0;cursor:pointer;white-space:nowrap;min-width:0;}' +
  '.fbempty{background:#fff;padding:40px 16px;text-align:center;color:#65686c;font-size:15px;}' +
  '.fbov{position:fixed;inset:0;z-index:9000;background:#fff;overflow-y:auto;-webkit-overflow-scrolling:touch;text-align:left;}' +
  '.fbov .in{max-width:560px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI Historic","Segoe UI","Hiragino Sans",Roboto,"Noto Sans JP",Helvetica,Arial,sans-serif;font-size:15px;line-height:1.34;color:#080809;}' +
  '.fbov .fbpost{margin:0;}' +
  '.fbov svg{display:block;}' +
  '.fbcm{padding:4px 16px 24px;}' +
  '.fbcm .c{display:flex;gap:8px;margin-top:10px;}' +
  '.fbcm .c.rp{margin-left:44px;}' +
  '.fbcm .c .a{flex:0 0 32px;width:32px;height:32px;border-radius:50%;background:#e4e6eb;color:#65686c;font-weight:700;display:flex;align-items:center;justify-content:center;overflow:hidden;}' +
  '.fbcm .c .a img{width:100%;height:100%;object-fit:cover;}' +
  '.fbcm .c .bb{background:#f0f2f5;border-radius:18px;padding:8px 12px;display:inline-block;max-width:100%;box-sizing:border-box;word-break:break-word;white-space:pre-wrap;}' +
  '.fbcm .c .bb b{display:block;font-size:13px;font-weight:600;white-space:normal;}' +
  '.fbcm .c .ft{color:#65686c;font-size:12px;font-weight:600;margin:4px 0 0 12px;display:flex;gap:14px;}' +
  '.fbcm .c img.ci{display:block;max-width:200px;border-radius:12px;margin-top:6px;}' +
  '.fbcm .none{color:#65686c;padding:16px 0;text-align:center;}' +
  '.fbpv{position:fixed;inset:0;z-index:9100;background:#000;display:flex;align-items:center;justify-content:center;}' +
  '.fbpv img{max-width:100%;max-height:100%;object-fit:contain;}' +
  '.fbpv button{position:absolute;top:12px;left:12px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.18);color:#fff;border:0;font-size:22px;cursor:pointer;}';
function renderFacebookPage_(base, staff, dev) {
  var head = '<div class="hhead"><span class="bmark">📘</span><span class="bname">Facebook</span></div>';
  var C = {
    exec: 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec',
    key: 'kx7Q2p9mVt4Zr8'
  };
  return '<style>' + HOMECSS_ + FBCSS_ + '</style>' +
    '<div class="home">' + backBar_(base, staff, dev) +
    '<div class="fbw">' + head +
      '<div class="hbhint" id="fbLoad">読み込み中です…</div>' +
      '<div id="fbMain" style="display:none">' +
        '<div class="fbacct" id="fbAcct"></div>' +
        '<div class="fbstat"><span id="fbWhen"></span><button type="button" id="fbReload">⟳ 最新にする</button></div>' +
        '<div class="fbapp" id="fbApp"></div>' +
      '</div>' +
    '</div></div>' +
    '<script>(' + fbScript_.toString() + ')(' + JSON.stringify(C).replace(/</g, '\\u003c') + ');<\/script>';
}
function fbScript_(C) {
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var warn = function (m) { if (typeof szPopup_ === 'function') szPopup_(m); else alert(m); };
  var ACCTS = [], CUR = '', DATA = null, TAB = 'posts', BUSY = {}, AGAIN = {};
  var SOON = 'この機能は準備中です😊';

  var S = function (d, w, fill) {
    return '<svg width="' + (w || 20) + '" height="' + (w || 20) + '" viewBox="0 0 24 24" fill="' + (fill || 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  };
  var IC = {
    back: S('<path d="M15 5l-7 7 7 7"/>', 24),
    search: S('<circle cx="11" cy="11" r="7"/><path d="M20.5 20.5L16 16"/>', 22),
    msgr: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.1 2 11.2c0 2.9 1.4 5.5 3.7 7.2V22l3.4-1.9c.9.3 1.9.4 2.9.4 5.5 0 10-4.1 10-9.2S17.5 2 12 2zm1 12.4l-2.5-2.7-5 2.7 5.5-5.8 2.6 2.7 4.9-2.7-5.5 5.8z"/></svg>',
    follow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 100 10 5 5 0 000-10zM4 21c0-4 3.6-7 8-7 1 0 1.9.1 2.8.4A6 6 0 0013 18c0 1.1.3 2.1.8 3z"/><path d="M19 14v3h3v2h-3v3h-2v-3h-3v-2h3v-3z"/></svg>',
    dots: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
    globe: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg>',
    like: S('<path d="M7 11v9H4a1 1 0 01-1-1v-7a1 1 0 011-1zM7 11l4-8a2.5 2.5 0 012.5 2.5V9h5.2a2 2 0 012 2.3l-1.2 7A2 2 0 0117.5 20H7"/>', 20),
    comment: S('<path d="M21 11.5a8.4 8.4 0 01-12.2 7.5L3 21l2-5.3A8.4 8.4 0 1121 11.5z"/>', 20),
    share: S('<path d="M14 4l7 7-7 7v-4c-5 0-8.5 1.5-11 5 1-5 4-10 11-11z"/>', 20),
    thumb: '<svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M2 21h4V9H2zm20-11a2 2 0 00-2-2h-6.3l1-4.6v-.3a1.5 1.5 0 00-.5-1L13.1 1 6.6 7.6A2 2 0 006 9v10a2 2 0 002 2h9a2 2 0 001.8-1.2l3-7.1a2 2 0 00.2-.7z"/></svg>',
    play: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    playS: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    info: S('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>', 20),
    link: S('<path d="M10 14a4.5 4.5 0 006.4 0l2.6-2.6a4.5 4.5 0 00-6.4-6.4L11.5 6"/><path d="M14 10a4.5 4.5 0 00-6.4 0L5 12.6a4.5 4.5 0 006.4 6.4l1.1-1"/>', 20),
    mail: S('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', 20),
    phone: S('<path d="M5 3h4l2 5-2.5 1.5a11 11 0 006 6L16 13l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z"/>', 20),
    pin: S('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>', 20),
    star: S('<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>', 20),
    ig: S('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>', 20),
    verified: '<svg width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#0866ff"/><path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  function when(t) {
    if (!t) return '';
    var s = Date.now() / 1000 - t;
    if (s < 60) return 'たった今';
    if (s < 3600) return Math.floor(s / 60) + '分';
    if (s < 86400) return Math.floor(s / 3600) + '時間';
    var d = new Date(t * 1000), y = new Date().getFullYear();
    return (d.getFullYear() === y ? '' : d.getFullYear() + '年') + (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }
  function num(n) { n = Number(n || 0); return n >= 10000 ? (Math.floor(n / 1000) / 10).toString().replace(/\.0$/, '') + '万' : n.toLocaleString('en-US'); }
  function shortUrl(u) { return String(u || '').replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, ''); }
  function openUrl(u) { try { window.open(u, '_blank', 'noopener'); } catch (e) {} }
  function img(u) { return u ? '<img src="' + esc(u) + '" loading="lazy" referrerpolicy="no-referrer" alt="">' : ''; }

  function jsonp(p, cb) {
    var n = '__fb' + Date.now() + Math.floor(Math.random() * 1000), fin = false;
    var end = function (r) { if (fin) return; fin = true; try { delete window[n]; } catch (e) {} cb(r); };
    window[n] = function (r) { end(r); };
    var q = 'callback=' + n; for (var k in p) q += '&' + k + '=' + encodeURIComponent(p[k]);
    var s = document.createElement('script'); s.src = C.exec + '?' + q + '&cb=' + Date.now();
    s.onerror = function () { end({ ok: false, error: '通信エラーです。もう一度試してもらえると嬉しいです🙇' }); }; document.body.appendChild(s);
    if (p.action === 'status' || p.action === 'data') {
      setTimeout(function () { if (!fin) { end({ ok: false, error: '通信エラーです。もう一度試してもらえると嬉しいです🙇' }); try { s.remove(); } catch (e) {} window[n] = function () {}; } }, 20000);
    }
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
  function ask(fields, done) {
    devKey(function (ex) {
      for (var k in ex) fields[k] = ex[k];
      jsonp({ action: 'submit', key: C.key, op: 'facebook', who: window.__SZ_WHO_ || '', role: window.__SZ_ROLE_ || '', device: window.__SZ_DEVICE_ || '', fields: JSON.stringify(fields) },
        function (r) {
          if (!r || !r.ok || !r.id) { done((r && r.error) || '通信に失敗しました。もう一度試してもらえると嬉しいです🙇'); return; }
          var n = 0;
          var tick = function () {
            n++; if (n > 120) { done('時間切れです。もう一度試してもらえると嬉しいです🙇'); return; }
            jsonp({ action: 'status', key: C.key, id: r.id }, function (x) {
              if (!x || !x.ok) { done((x && x.error) || '通信に失敗しました。もう一度試してもらえると嬉しいです🙇'); return; }
              if (x.status === 'pending' || x.status === 'running' || x.status === 'queued' || x.status === '') { setTimeout(tick, 1000); return; }
              if (x.status !== 'done') { done(x.result || 'エラーが発生しました。りゅうさんに連絡しました。'); return; }
              var d = null; try { d = JSON.parse(x.result || '{}'); } catch (e) {}
              if (d && d.__bigres) {   
                jsonp({ action: 'data', key: C.key, name: d.__bigres }, function (y) {
                  var v = null; try { v = JSON.parse(y && y.result); } catch (e) {}
                  if (!v) { done('答えを読み込めませんでした。もう一度試してもらえると嬉しいです🙇'); return; }
                  done(null, v);
                });
                return;
              }
              done(null, d || {});
            });
          };
          setTimeout(tick, 1200);
        });
    });
  }

  function drawAcct() {
    $('fbAcct').innerHTML = ACCTS.map(function (a) {
      return '<button type="button" data-a="' + esc(a.acct) + '"' + (a.acct === CUR ? ' class="on"' : '') + '>' + esc(a.label) + '</button>';
    }).join('');
    $('fbAcct').className = 'fbacct' + (ACCTS.length === 1 ? ' one' : '');
    $('fbAcct').style.gridTemplateColumns = 'repeat(' + Math.max(1, ACCTS.length) + ',1fr)';
  }
  $('fbAcct').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    CUR = b.getAttribute('data-a'); TAB = 'posts';
    drawAcct(); drawApp(); window.scrollTo(0, 0);
    if (DATA) { DATA.cur = CUR; cacheSet(DATA); }
    loadWeb(CUR, false);
  });
  $('fbReload').addEventListener('click', function () { loadWeb(CUR, true); });

  function drawWhen() {
    var v = DATA && DATA.views && DATA.views[CUR];
    var t = '';
    if (BUSY[CUR]) t = 'Facebookから読み込み中です…';
    else if (v && v.read_at) {
      var m = Math.max(0, Math.round((Date.now() / 1000 - v.read_at) / 60));
      t = m < 1 ? 'たった今の内容です' : (m < 60 ? m + '分前の内容です' : Math.round(m / 60) + '時間前の内容です');
    }
    if (v && v.stale_error) t += '（最新を読み込めませんでした）';
    $('fbWhen').textContent = t;
  }

  function postCard(p, pf, full) {
    var name = esc(pf.name || '');
    var st = p.story || '';
    var hd = '<b>' + name + '</b>';
    if (st && pf.name && st.indexOf(pf.name) === 0) hd = '<b>' + name + '</b>' + esc(st.slice(pf.name.length));
    else if (st) hd = esc(st);
    var h = '<div class="fbpost"' + (full ? '' : ' data-post="' + esc(p.id) + '"') + '>' +
      '<div class="fbph">' + img(pf.pic) + '<div class="who"><div class="n">' + hd + '</div>' +
      '<div class="d">' + esc(when(p.at)) + ' · ' + IC.globe + '</div></div><button type="button" class="dots" data-soon="1">' + IC.dots + '</button></div>';
    if (p.msg) {
      h += '<div class="fbtx' + (full ? '' : ' cl') + '">' + esc(p.msg) + '</div>';
      if (!full && (p.msg.split('\n').length > 5 || p.msg.length > 180)) h += '<div class="fbmore">もっと見る</div>';
    }
    var pics = p.pics || [];
    if (p.k === 'link' && p.link && (p.link.t || p.link.d)) {
      h += '<div class="fblink"><div class="u">' + esc(shortUrl(p.link.u).split('/')[0]) + '</div>' +
        (p.link.t ? '<div class="t">' + esc(p.link.t) + '</div>' : '') + (p.link.d ? '<div class="s">' + esc(p.link.d) + '</div>' : '') + '</div>';
    } else if (pics.length) {
      var n = Math.min(pics.length, 4);
      h += '<div class="fbmedia n' + n + '">' + pics.slice(0, 4).map(function (u, i) {
        return '<button type="button" data-pic="' + esc(u) + '">' + img(u) +
          (p.k === 'video' && i === 0 ? '<span class="play">' + IC.play + '</span>' : '') +
          (i === 3 && pics.length > 4 ? '<span class="plus">+' + (pics.length - 4) + '</span>' : '') + '</button>';
      }).join('') + '</div>';
    }
    var right = [];
    if (p.c) right.push('コメント' + num(p.c) + '件');
    if (p.s) right.push('シェア' + num(p.s) + '件');
    if (p.r || right.length) {
      h += '<div class="fbcnt"><span class="rx">' + (p.r ? '<i>' + IC.thumb + '</i>' + num(p.r) : '') + '</span><span>' + right.join('　') + '</span></div>';
    } else h += '<div style="height:10px"></div>';
    h += '<div class="fbact"><button type="button" data-soon="1">' + IC.like + 'いいね！</button><button type="button"' + (full ? ' data-soon="1"' : ' data-post="' + esc(p.id) + '"') + '>' + IC.comment + 'コメントする</button><button type="button" data-soon="1">' + IC.share + 'シェア</button></div>';
    return h + '</div>';
  }

  function infoRows(pf, all) {
    var r = [];
    var row = function (ic, html) { r.push('<div class="row"><span class="ic">' + ic + '</span><div>' + html + '</div></div>'); };
    if (pf.cats && pf.cats.length) row(IC.info, '<b>ページ</b> · ' + esc(pf.cats.join(' · ')));
    if (pf.ig) row(IC.ig, '<a href="https://www.instagram.com/' + esc(pf.ig) + '/" target="_blank" rel="noopener">' + esc(pf.ig) + '</a>');
    (pf.web || []).forEach(function (u) { row(IC.link, '<a href="' + esc(/^https?:/.test(u) ? u : 'https://' + u) + '" target="_blank" rel="noopener">' + esc(shortUrl(u).replace(/\?.*$/, '')) + '</a>'); });
    if (all) {
      if (pf.addr) row(IC.pin, esc(pf.addr) + '<span class="sub">住所</span>');
      if (pf.phone) row(IC.phone, esc(pf.phone) + '<span class="sub">携帯</span>');
      (pf.emails || []).forEach(function (m) { row(IC.mail, esc(m) + '<span class="sub">メールアドレス</span>'); });
    }
    row(IC.star, pf.rcount ? ('評価' + esc(pf.rating) + '（レビュー' + num(pf.rcount) + '件）') : 'まだ評価はありません(レビュー0件)');
    return r.join('');
  }

  function drawApp() {
    drawWhen();
    var v = DATA && DATA.views && DATA.views[CUR];
    var A = $('fbApp');
    if (!v) { A.innerHTML = '<div class="fbempty">' + (BUSY[CUR] ? 'Facebookから読み込み中です…' : '') + '</div>'; return; }
    if (v.nokey) { A.innerHTML = '<div class="fbempty">このページは準備中です😊</div>'; return; }
    var pf = v.prof || {};
    var h = '<div class="fbsec">' +
      '<div class="fbtop"><button type="button" data-soon="1">' + IC.back + '</button><div class="t">' + esc(pf.name) + '</div><button type="button" data-soon="1">' + IC.search + '</button></div>' +
      '<div class="fbcover">' + (pf.cover ? '<button type="button" data-pic="' + esc(pf.cover) + '" style="display:block;width:100%;height:100%">' + img(pf.cover) + '</button>' : '') + '</div>' +
      '<div class="fbav">' + (pf.pic ? '<button type="button" data-pic="' + esc(pf.pic) + '">' + img(pf.pic) + '</button>' : '') + '</div>' +
      '<div class="fbhead"><div class="nm">' + esc(pf.name) + (pf.verified ? '<span class="vf">' + IC.verified + '</span>' : '') + '</div>' +
        '<div class="fl">フォロワー<b>' + num(pf.followers) + '人</b> • フォロー中<b>0人</b></div>' +
        (pf.about ? '<div class="ab">' + esc(pf.about) + '</div>' : '') +
        '<div class="fbbtns"><button type="button" class="msg" data-soon="1">' + IC.msgr + 'メッセージ</button><button type="button" class="fol" data-soon="1">' + IC.follow + 'フォローする</button><button type="button" class="more" data-soon="1">' + IC.dots + '</button></div>' +
      '</div>' +
      '<div class="fbtabs">' + [['posts', '投稿'], ['about', '基本データ'], ['reels', 'リール'], ['photos', '写真']].map(function (t) {
        return '<button type="button" data-tab="' + t[0] + '"' + (TAB === t[0] ? ' class="on"' : '') + '>' + t[1] + '</button>';
      }).join('') + '</div></div>';
    var posts = v.posts || [], photos = v.photos || [], reels = v.reels || [];
    if (TAB === 'posts') {
      h += '<div class="fbsec"><div class="fbh2"><b>詳細</b></div><div class="fbinfo">' + infoRows(pf, false) + '</div></div>';
      if (photos.length) {
        h += '<div class="fbsec"><div class="fbh2"><b>写真</b></div><div class="fbphotos">' + photos.slice(0, 6).map(function (x) {
          return '<button type="button" data-pic="' + esc(x.th) + '">' + img(x.th) + '</button>';
        }).join('') + '</div><button type="button" class="fbseeall" data-tab="photos">すべての写真を見る</button></div>';
      }
      h += '<div class="fbsec"><div class="fbh2" style="padding-bottom:12px"><b>投稿</b><span>フィルター</span></div></div>';
      h += posts.length ? posts.map(function (p) { return postCard(p, pf, false); }).join('') : '<div class="fbempty">まだ投稿はありません</div>';
    } else if (TAB === 'about') {
      h += '<div class="fbsec"><div class="fbh2"><b>基本データ</b></div><div class="fbinfo">' + infoRows(pf, true) + '</div>' +
        (pf.about ? '<div class="fbh2"><b>自己紹介</b></div><div class="fbinfo"><div class="row" style="white-space:pre-wrap">' + esc(pf.about) + '</div></div>' : '') + '</div>';
    } else if (TAB === 'reels') {
      h += '<div class="fbsec">' + (reels.length ? '<div class="fbreels">' + reels.map(function (x) {
        return '<button type="button" data-url="' + esc(x.url) + '">' + img(x.th) + (x.vw != null ? '<span class="v">' + IC.playS + num(x.vw) + '</span>' : '') + '</button>';
      }).join('') + '</div>' : '<div class="fbempty">リールはまだありません</div>') + '</div>';
    } else if (TAB === 'photos') {
      h += '<div class="fbsec">' + (photos.length ? '<div class="fbphotos big">' + photos.map(function (x) {
        return '<button type="button" data-pic="' + esc(x.th) + '">' + img(x.th) + '</button>';
      }).join('') + '</div>' : '<div class="fbempty">写真はまだありません</div>') + '</div>';
    }
    A.innerHTML = h;
  }

  $('fbApp').addEventListener('click', function (e) {
    var t = e.target;
    var tb = t.closest('[data-tab]'); if (tb) { TAB = tb.getAttribute('data-tab'); drawApp(); return; }
    var pc = t.closest('[data-pic]'); if (pc) { showPic(pc.getAttribute('data-pic')); return; }
    var ur = t.closest('[data-url]'); if (ur) { openUrl(ur.getAttribute('data-url')); return; }
    if (t.closest('[data-soon]')) { warn(SOON); return; }
    var po = t.closest('[data-post]'); if (po) openPost(po.getAttribute('data-post'));
  });

  function showPic(u) {
    if (!u) return;
    var d = document.createElement('div'); d.className = 'fbpv';
    d.innerHTML = '<img src="' + esc(u) + '" referrerpolicy="no-referrer" alt=""><button type="button">✕</button>';
    d.addEventListener('click', function () { d.remove(); });
    document.body.appendChild(d);
  }

  var CM = {};
  function openPost(id) {
    var v = DATA && DATA.views && DATA.views[CUR]; if (!v) return;
    var p = (v.posts || []).filter(function (x) { return x.id === id; })[0]; if (!p) return;
    var pf = v.prof || {};
    var d = document.createElement('div'); d.className = 'fbov';
    var draw = function () {
      var cm = CM[id];
      var body = cm == null ? '<div class="none">コメントを読み込み中です…</div>' :
        (!cm.length ? '<div class="none">まだコメントはありません</div>' : cm.map(function (c) {
          var av = c.page ? img(pf.pic) : esc((c.who || '?').slice(0, 1));
          return '<div class="c' + (c.parent ? ' rp' : '') + '"><div class="a">' + av + '</div><div style="min-width:0">' +
            '<div class="bb"><b>' + esc(c.page ? pf.name : (c.who || 'Facebookユーザー')) + '</b>' + esc(c.msg) + '</div>' +
            (c.img ? '<img class="ci" src="' + esc(c.img) + '" referrerpolicy="no-referrer" alt="">' : '') +
            '<div class="ft"><span>' + esc(when(c.at)) + '</span><span>いいね！' + (c.lk ? ' ' + num(c.lk) : '') + '</span><span>返信する</span></div></div></div>';
        }).join(''));
      d.innerHTML = '<div class="in"><div class="fbtop"><button type="button" data-close="1">' + IC.back + '</button><div class="t">' + esc(pf.name) + 'さんの投稿</div><span></span></div>' +
        postCard(p, pf, true) + '<div class="fbcm">' + body + '</div></div>';
    };
    if (!p.c) CM[id] = CM[id] || [];
    draw();
    d.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest('[data-close]')) { d.remove(); return; }
      var pc = t.closest('[data-pic]'); if (pc) { showPic(pc.getAttribute('data-pic')); return; }
      if (t.closest('[data-soon]')) warn(SOON);
    });
    document.body.appendChild(d);
    if (p.c) {
      ask({ kind: 'detail', acct: CUR, post: id }, function (err, r) {
        if (err) { CM[id] = CM[id] || []; warn(err); } else CM[id] = (r && r.comments) || [];
        if (document.body.contains(d)) draw();
      });
    }
  }

  function loadWeb(acct, force) {
    if (!acct) return;
    if (BUSY[acct]) { if (force) AGAIN[acct] = true; return; }
    BUSY[acct] = true; if (acct === CUR) drawWhen();
    if (acct === CUR && !(DATA && DATA.views && DATA.views[acct])) drawApp();
    ask({ kind: 'web', acct: acct, force: !!force }, function (err, d) {
      BUSY[acct] = false;
      if (AGAIN[acct]) { delete AGAIN[acct]; setTimeout(function () { loadWeb(acct, true); }, 0); }
      if (err) { if (acct === CUR) { drawWhen(); warn(err); } return; }
      if (!DATA) DATA = { accounts: ACCTS, views: {} };
      DATA.views = DATA.views || {};
      DATA.views[acct] = d; cacheSet(DATA);
      if (acct === CUR) drawApp();
    });
  }

  var CKEY = 'fb_cache_v1_' + (window.__SZ_ROLE_ || '') + '_' + (window.__SZ_WHO_ || '');
  function cacheGet() { try { return JSON.parse(localStorage.getItem(CKEY) || 'null'); } catch (e) { return null; } }
  function cacheSet(d) { try { localStorage.setItem(CKEY, JSON.stringify(d)); } catch (e) {} }
  function apply(d, fresh) {
    var keep = DATA && DATA.views;
    DATA = d; DATA.views = DATA.views || {};
    if (keep) for (var k in keep) { if (!DATA.views[k] || (keep[k].read_at || 0) > (DATA.views[k].read_at || 0)) DATA.views[k] = keep[k]; }
    ACCTS = (d && d.accounts) || [];
    if (!ACCTS.length) {
      if (fresh) { $('fbMain').style.display = 'none'; $('fbLoad').style.display = ''; $('fbLoad').textContent = 'この端末から表示できるページがありません。'; }
      return;
    }
    if (!ACCTS.some(function (a) { return a.acct === CUR; })) CUR = (d.cur && ACCTS.some(function (a) { return a.acct === d.cur; })) ? d.cur : ACCTS[0].acct;
    $('fbLoad').style.display = 'none'; $('fbMain').style.display = '';
    drawAcct(); drawApp();
  }
  var first = cacheGet();
  if (first && first.accounts && first.accounts.length) apply(first, false);
  ask({ kind: 'open' }, function (err, d) {
    if (err) { if (!DATA) $('fbLoad').textContent = err; return; }
    d.cur = CUR; apply(d, true); cacheSet(DATA);
    loadWeb(CUR, false);
  });
  setInterval(drawWhen, 30000);
}
