/**
 * 施術室被り検出 — 外から押せるWebアプリ（GAS）
 *
 * スタッフがスマホでこのWebアプリのURLを開く／「再判定」ボタンを押すと、
 * Googleドライブの events.json（事務所PCが export_events.py で書き出したもの）を読み、
 * detect_core.js で施術室被りを判定して、見やすいカードで表示する。
 *
 * 安全: TimeTree/LINE には触れない。ドライブの events.json を読むだけ（drive.readonly）。
 * 判定ロジックは detect_core.js（＝detect_core.py の写し。照合テストで一致を担保）。
 *
 * 事前準備: Script Property「EVENTS_FILE_ID」に events.json のファイルIDを入れると確実。
 *          未設定なら名前 events.json でドライブ内を探して自動採用＆キャッシュする。
 */

var EVENTS_FILENAME = 'events.json';

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action) return handleAction_(p);   // 編集依頼の受付/取り出し/結果（命令置き場API）
  var view = p.view || 'home';   // home（メニュー）／conflict（施術室被り）／lt（L⇔T予約照合・準備中）
  var base = getBaseUrl_();
  // スタッフ版（?staff=1）＝売上を見せない・「ALLスタッフ版」表示。未指定＝オーナー「なしぼ版」。
  var staff = (p.staff === '1' || p.staff === 'true');
  var html, title;
  if (view === 'conflict') {
    title = '施術室被り検出';
    var withNail = (p.nail === '1' || p.nail === 'true');
    try {
      var file = getEventsFile_();
      var d = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
      var res = detect(d.events, withNail, d.date_from);
      html = renderPage_(res.conflicts, res.meta, d, withNail, base, staff);
    } catch (err) {
      html = renderError_(err, base, staff);
    }
  } else if (view === 'lt') {
    title = 'L⇔T予約照合';
    html = renderLT_(base, staff);
  } else if (view === 'uriage' && !staff) {
    title = '売上TimeTree転記';
    html = renderUriage_(base, staff);
  } else {
    title = staff ? 'TTスーパーズコApp（ALLスタッフ版）' : 'TTスーパーズコApp';
    html = renderHome_(base, staff);
  }
  return HtmlService.createHtmlOutput(html)
    .setTitle(title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ========== 編集依頼の命令置き場（スマホ→依頼／事務所PC→取り出し・結果） ==========
// 書き込み(TimeTree編集)を伴うので、合言葉(EDIT_KEY)を知る者だけ受け付ける（簡易ゲート）。
var EDIT_KEY = 'kx7Q2p9mVt4Zr8';
var QUEUE_PROP = 'EDIT_QUEUE';

function _jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function _queueGet_() {
  var raw = PropertiesService.getScriptProperties().getProperty(QUEUE_PROP);
  return raw ? JSON.parse(raw) : [];
}
function _queueSet_(q) {
  if (q.length > 50) q = q.slice(q.length - 50);   // 直近50件だけ保持
  PropertiesService.getScriptProperties().setProperty(QUEUE_PROP, JSON.stringify(q));
}

// 施術室被りデータのJSONP配信（読み取り専用・鍵不要＝?view=conflictと同じ公開度）。
// 静的アプリ(GitHub Pages)がこれを<script>で読み、GASページを一切表示せずに描画する
// ＝Googleの「別ユーザーが作成」警告バーが原理的に出ない・全端末で動く。
function _eventsJsonp_(p) {
  var cb = String(p.callback || 'cb').replace(/[^A-Za-z0-9_$.]/g, '');
  var payload;
  try {
    var file = getEventsFile_();
    payload = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
  } catch (e) {
    payload = { error: String(e), events: [], date_from: '' };
  }
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(payload) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function handleAction_(p) {
  if (p.action === 'events') return _eventsJsonp_(p);
  if (p.key !== EDIT_KEY) return _jsonOut_({ ok: false, error: 'bad key' });
  var lock = LockService.getScriptLock();
  try { lock.tryLock(10000); } catch (ig) {}
  var out;
  try {
    var q = _queueGet_();
    if (p.action === 'submit') {
      var id = 'c' + Date.now() + Math.floor(Math.random() * 1000);
      q.push({ id: id, ts: new Date().toISOString(), op: p.op || 'movecal',
        cal: p.cal, event: p.event, to_cal: p.to_cal, to_label: Number(p.to_label),
        room: p.room || '', title: p.title || '', status: 'pending', result: '' });
      _queueSet_(q);
      out = { ok: true, id: id };
    } else if (p.action === 'pending') {
      out = { ok: true, pending: q.filter(function (c) { return c.status === 'pending'; }) };
    } else if (p.action === 'report') {
      for (var i = 0; i < q.length; i++) {
        if (q[i].id === p.id) {
          q[i].status = p.status || 'done';
          q[i].result = p.result || '';
          q[i].done_ts = new Date().toISOString();
        }
      }
      _queueSet_(q);
      out = { ok: true };
    } else if (p.action === 'status') {
      var c = null;
      for (var j = 0; j < q.length; j++) { if (q[j].id === p.id) { c = q[j]; break; } }
      out = { ok: true, status: c ? c.status : 'notfound', result: c ? c.result : '' };
    } else {
      out = { ok: false, error: 'unknown action' };
    }
  } finally {
    try { lock.releaseLock(); } catch (ig2) {}
  }
  return _jsonOut_(out);
}

/** 画面遷移リンクの土台。
 *  警告バーを隠す「中継ページ(GitHub Pages)」の中でアプリを動かすため、
 *  メニュー↔検出などの遷移も中継ページURLに向ける（中継ページが ?view= を
 *  アプリの /exec に渡す）。中継を使わず /exec 直で開いた時も動くよう自動判定。 */
function getBaseUrl_() {
  // メニュー内の遷移はこのアプリ自身(/exec)を土台にして直接GASで完結させる。
  // （短いURL sakuranew555.github.io/tt/ は“入口”で、そこはこの /exec へリダイレクトするだけ。
  //  以前はここを github.io にして iframe 埋め込みしていたが、Firefox/スマホ/LINE内ブラウザが
  //  埋め込みを弾いて開けないため、埋め込み方式は廃止した。）
  try {
    var u = ScriptApp.getService().getUrl();
    if (u) return u;
  } catch (e) {}
  return 'https://script.google.com/macros/s/AKfycbwEpGPZhvGCbea6qoft-_TRCgvp5t0ieNf5kDCuFs9-1VYJi7r5RPgTPBM7AEBqPPLL4A/exec';
}

/** events.json のファイルを取得（IDキャッシュ→なければ名前で探す）。 */
function getEventsFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('EVENTS_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (ignore) { /* IDが古い→探し直す */ }
  }
  var it = DriveApp.getFilesByName(EVENTS_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) {
    throw new Error('events.json がドライブに見つかりません。事務所PCで export_events.py を実行し、Googleドライブの同期を待ってください。');
  }
  props.setProperty('EVENTS_FILE_ID', newest.getId());
  return newest;
}

// ---- 表示（room_conflict_detect.py の render_html を移植。並び・色を一致させる）----

var CIRCLED = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫','⑬','⑭','⑮','⑯','⑰','⑱','⑲','⑳'];
function circled_(n) { return (n >= 1 && n <= CIRCLED.length) ? CIRCLED[n - 1] : (n + '.'); }

function roomColor_(room) {
  var p = { 'FREEDOM': '#e11d48', 'COSMOS': '#7c3aed', 'HAPPY': '#f59e0b',
            'LUCKY': '#16a34a', 'STAR/福/🇫🇷': '#0ea5e9', 'NAIL': '#db2777' };
  return p[room] || '#64748b';
}

function esc_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function renderPage_(conflicts, meta, payload, withNail, base, staff) {
  var real = conflicts.length;
  function menu_(m) {
    m = (m || '').trim();
    if (!m) return '';
    var items = m.split('／').filter(function (s) { return s.trim(); })
      .map(function (s) { return '<li>' + esc_(s.trim()) + '</li>'; }).join('');
    return '<ul class="menu">' + items + '</ul>';
  }
  var scope = '今日以降（' + esc_(payload.date_from) + '）';
  var roomsStr = meta.rooms_list.join('・');

  var cards;
  if (!conflicts.length) {
    cards = '<div class="empty">✅ 施術室被りはありませんでした</div>';
  } else {
    cards = conflicts.map(function (x, idx) {
      var rc = roomColor_(x.room);
      return '' +
      '<article class="card real">' +
        '<header class="card-h">' +
          '<span class="no">' + (idx + 1) + '</span>' +
          '<span class="date">' + esc_(x.date) + '</span>' +
          '<span class="room" style="--rc:' + rc + '">' + esc_(x.room) + '</span>' +
          '<span class="ov">被り時間数 ' + x.overlap_min + '分（' + esc_(x.overlap_time) + '）</span>' +
        '</header>' +
        '<div class="pair">' +
          '<div class="side">' +
            '<div class="time"><span class="ab abA">A</span>' + esc_(x.a_time) + '</div>' +
            '<div class="who"><span class="staff">' + esc_(x.a_staff) + '</span>' +
              '<span class="code">' + esc_(x.a_code) + '</span>' +
              '<span class="name">' + esc_(x.a_name) + '</span></div>' +
            menu_(x.a_menu) +
          '</div>' +
          '<div class="vs"></div>' +
          '<div class="side">' +
            '<div class="time"><span class="ab abB">B</span>' + esc_(x.b_time) + '</div>' +
            '<div class="who"><span class="staff">' + esc_(x.b_staff) + '</span>' +
              '<span class="code">' + esc_(x.b_code) + '</span>' +
              '<span class="name">' + esc_(x.b_name) + '</span></div>' +
            menu_(x.b_menu) +
          '</div>' +
        '</div>' +
        '<a class="tt" target="_top" rel="noopener"' +
          ' data-cal="' + esc_(x.a_cal_id) + '" data-ev="' + esc_(x.a_event_id) + '"' +
          ' href="https://timetreeapp.com/calendars/' + esc_(x.a_cal_id) + '/events/' + esc_(x.a_event_id) + '">' +
          '📅 TimeTree Appを開く</a>' +
      '</article>';
    }).join('\n');
  }

  var nailNote = withNail ? '（NAIL含む）' : '';
  return '' +
'<style>' + CSS_ + '</style>' +
'<div class="wrap">' +
  '<div class="bar">' +
    '<a class="homelink" href="' + (base || '') + '?view=home' + (staff ? '&staff=1' : '') + '" target="_top">← 前に戻る</a>' +
    '<div class="fetched">' +
      '<span class="fline"><b>LINE取得</b> ' + esc_(payload.line_fetched_at || '—') + '</span>' +
      '<span class="fline"><b>TimeTree取得</b> ' + esc_(payload.timetree_fetched_at || '—') + '</span>' +
    '</div>' +
  '</div>' +
  '<h1>⚠️ 施術室被り検出 <span class="cnt">' + real + '件</span>' + nailNote + '</h1>' +
  cards +
'</div>' +
TTSCRIPT_;
}

function renderError_(err, base, staff) {
  return '<style>' + CSS_ + '</style>' +
    '<div class="wrap"><div class="bar">' +
    '<a class="homelink" href="' + (base || '') + '?view=home' + (staff ? '&staff=1' : '') + '" target="_top">☰ メニュー</a>' +
    '<button class="reload" onclick="location.reload()">🔄 再読込</button></div>' +
    '<h1>⚠️ 表示できませんでした</h1>' +
    '<div class="empty" style="color:#e11d48">' + esc_(err && err.message ? err.message : err) + '</div>' +
    '</div>';
}

/** ホーム（メニュー）画面。おしゃれなタイル2つ。 */
// ボタンのミニロゴ（差し替え自由）。LINE=緑の吹き出し／TimeTree=緑のカレンダー。
var LINE_LOGO_ = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">' +
  '<rect width="24" height="24" rx="7" fill="#06C755"/>' +
  '<path d="M12 6.2c-3.3 0-6 2.1-6 4.7 0 2.3 2 4.2 4.8 4.6.5.1.4.35.3.85l-.08.5c-.05.3.2.42.48.3 1.9-.8 4-2.55 5.3-4.05.68-.8 1.2-1.6 1.2-2.7 0-2.6-2.7-4.7-6-4.7z" fill="#fff"/></svg>';
var TT_LOGO_ = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">' +
  '<rect width="24" height="24" rx="7" fill="#2bad6f"/>' +
  '<rect x="5.5" y="7.4" width="13" height="10.6" rx="2" fill="#fff"/>' +
  '<rect x="5.5" y="7.4" width="13" height="3.3" rx="2" fill="#12864e"/>' +
  '<rect x="8" y="5.3" width="1.7" height="3.6" rx=".85" fill="#12864e"/>' +
  '<rect x="14.3" y="5.3" width="1.7" height="3.6" rx=".85" fill="#12864e"/></svg>';

function renderHome_(base, staff) {
  var sfx = staff ? '&staff=1' : '';
  var subtitle = staff ? 'ALLスタッフ版' : 'なしぼ版';
  var uriageTile = staff ? '' :
      '<a class="tile uriage" href="' + base + '?view=uriage" target="_top">' +
        '<span class="ticon">💰</span>' +
        '<span class="tname">売上TimeTree転記<span class="badge">Coming Soon</span></span>' +
      '</a>';
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' +
    '<div class="hhead"><span class="bmark">🍅</span><span class="bname">TTスーパーズコApp</span></div>' +
    '<div class="hsub">' + subtitle + '</div>' +
    '<div class="tiles">' +
      '<a class="tile conflict" href="' + base + '?view=conflict' + sfx + '" target="_top">' +
        '<span class="ticon">🛏️</span>' +
        '<span class="tname">施術室被り検出</span>' +
      '</a>' +
      '<a class="tile lt" href="' + base + '?view=lt' + sfx + '" target="_top">' +
        '<span class="ticon"><span class="lt2">' + LINE_LOGO_ + TT_LOGO_ + '</span></span>' +
        '<span class="tname">L⇔T予約照合<span class="badge">Coming Soon</span></span>' +
      '</a>' +
      uriageTile +
    '</div>' +
  '</div>';
}

/** L⇔T予約照合（中身は今後。今はおしゃれな準備中ページ）。 */
function renderLT_(base, staff) {
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' +
    '<div class="hhead"><span class="bmark">🔗</span><span class="bname">L⇔T予約照合</span></div>' +
    '<div class="soon">' +
      '<div class="soonic">🚧</div>' +
      '<div class="soontitle">Coming Soon</div>' +
      '<div class="soondesc">この機能はこれから作ります。<br>もうしばらくお待ちください。</div>' +
    '</div>' +
    '<a class="backbtn" href="' + base + '?view=home' + (staff ? '&staff=1' : '') + '" target="_top">☰ メニューにもどる</a>' +
  '</div>';
}

/** 売上TimeTree転記（中身は今後。今はおしゃれな準備中ページ）。 */
function renderUriage_(base, staff) {
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' +
    '<div class="hhead"><span class="bmark">💰</span><span class="bname">売上TimeTree転記</span></div>' +
    '<div class="soon">' +
      '<div class="soonic">🚧</div>' +
      '<div class="soontitle">Coming Soon</div>' +
      '<div class="soondesc">この機能はこれから作ります。<br>もうしばらくお待ちください。</div>' +
    '</div>' +
    '<a class="backbtn" href="' + base + '?view=home' + (staff ? '&staff=1' : '') + '" target="_top">☰ メニューにもどる</a>' +
  '</div>';
}

// Androidは intent:// でTimeTreeアプリを直接起動（LINE内ブラウザからでも開く）。
// iOSは https のユニバーサルリンクのまま（Safariで開けばアプリに渡る）。
var TTSCRIPT_ =
'<script>(function(){' +
'if(!/Android/i.test(navigator.userAgent))return;' +
'var L=document.querySelectorAll("a.tt");' +
'for(var i=0;i<L.length;i++){' +
'var c=L[i].getAttribute("data-cal"),ev=L[i].getAttribute("data-ev");if(!c||!ev)continue;' +
'var w="https://timetreeapp.com/calendars/"+c+"/events/"+ev;' +
'L[i].setAttribute("href","intent://timetreeapp.com/calendars/"+c+"/events/"+ev+' +
'"#Intent;scheme=https;package=works.jubilee.timetree;S.browser_fallback_url="+encodeURIComponent(w)+";end");' +
'}})();</scr' + 'ipt>';

// メニュー／準備中ページ用のおしゃれスタイル（自己完結・ダーク/ライト対応）
var HOMECSS_ =
'  :root { --bg:#eef2f7; --card:#ffffff; --ink:#0f172a; --sub:#64748b; --line:#e2e8f0;' +
'    --grad1:#fee2e2; --grad2:#e0e7ff; }' +
'  @media (prefers-color-scheme: dark) { :root { --bg:#0b1220; --card:#151e30; --ink:#e8eef7;' +
'    --sub:#94a3b8; --line:#26324a; --grad1:#3b1220; --grad2:#161f3a; } }' +
'  * { box-sizing:border-box; }' +
'  body { margin:0; padding:0; color:var(--ink);' +
'    font-family:"Segoe UI","Yu Gothic UI","Hiragino Sans",system-ui,sans-serif;' +
'    background:#2C7A99; }' +
'  .home { max-width:560px; margin:0 auto; min-height:100vh; padding:34px 18px 48px;' +
'    display:flex; flex-direction:column; }' +
'  .hhead { display:flex; align-items:center; justify-content:center; gap:9px; margin:18px 0 4px; }' +
'  .bmark { font-size:22px; line-height:1; }' +
'  .bname { font-size:1.66rem; font-weight:800; letter-spacing:.01em; color:#fff; }' +
'  .hsub { text-align:center; color:#fff; font-weight:800; font-size:1.02rem;' +
'    letter-spacing:.06em; opacity:.92; margin:0 0 28px; }' +
'  .tiles { display:flex; flex-direction:column; gap:14px; }' +
'  .tile { display:flex; align-items:center; gap:14px; text-decoration:none; color:var(--ink);' +
'    background:var(--card); border:1px solid var(--line); border-radius:18px; padding:22px 20px;' +
'    box-shadow:0 6px 18px rgba(0,0,0,.07); position:relative; overflow:hidden;' +
'    transition:transform .12s ease, box-shadow .12s ease; }' +
'  .tile::before { content:""; position:absolute; left:0; top:0; bottom:0; width:6px; }' +
'  .tile.conflict::before { background:#e11d48; }' +
'  .tile.lt::before { background:#6366f1; }' +
'  .tile.uriage::before { background:#f59e0b; }' +
'  .tile:active { transform:translateY(2px); box-shadow:0 3px 10px rgba(0,0,0,.10); }' +
'  @media (hover:hover){ .tile:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(0,0,0,.12); } }' +
'  .ticon { flex:none; width:60px; height:60px; border-radius:15px; font-size:32px;' +
'    display:grid; place-items:center; }' +
'  .tile.conflict .ticon { background:rgba(225,29,72,.12); }' +
'  .tile.lt .ticon { background:rgba(148,163,184,.14); }' +
'  .tile.uriage .ticon { background:rgba(245,158,11,.16); }' +
'  .lt2 { display:inline-flex; align-items:center; gap:3px; }' +
'  .tname { flex:1; min-width:0; font-size:1.5rem; font-weight:800; white-space:normal;' +
'    display:flex; flex-wrap:wrap; align-items:center; gap:6px; }' +
'  .badge { display:inline-block; font-size:.9rem; font-weight:800; color:#fff; background:#f97316;' +
'    border-radius:999px; padding:4px 12px; vertical-align:middle;' +
'    letter-spacing:.03em; white-space:nowrap; box-shadow:0 2px 8px rgba(249,115,22,.45); }' +
'  .tarrow { flex:none; font-size:1.6rem; color:var(--sub); font-weight:700; }' +
'  .tile.lt { opacity:.9; }' +
'  .hfoot { margin-top:auto; padding-top:26px; text-align:center; font-size:.74rem; color:var(--sub); }' +
'  .soon { background:var(--card); border:1px solid var(--line); border-radius:18px;' +
'    padding:44px 22px; text-align:center; box-shadow:0 6px 18px rgba(0,0,0,.07); }' +
'  .soonic { font-size:60px; margin-bottom:12px; }' +
'  .soontitle { font-size:2.2rem; font-weight:900; color:#f97316; letter-spacing:.03em; }' +
'  .soondesc { color:var(--sub); font-size:.9rem; margin-top:8px; line-height:1.6; }' +
'  .backbtn { display:block; margin-top:20px; text-align:center; text-decoration:none;' +
'    font-weight:700; color:var(--ink); background:var(--card); border:1px solid var(--line);' +
'    border-radius:12px; padding:14px; }' +
'  .backbtn:active { transform:translateY(1px); }';

var CSS_ =
'  :root { --bg:#f1f5f9; --card:#ffffff; --ink:#0f172a; --sub:#64748b;' +
'    --line:#e2e8f0; --real:#e11d48; --dup:#d97706; }' +
'  @media (prefers-color-scheme: dark) { :root { --bg:#0b1220; --card:#131c2e;' +
'    --ink:#e8eef7; --sub:#94a3b8; --line:#26324a; } }' +
'  * { box-sizing:border-box; }' +
'  body { margin:0; padding:0; background:#2C7A99; color:var(--ink);' +
'    font-family:"Segoe UI","Yu Gothic UI","Hiragino Sans",system-ui,sans-serif; }' +
'  .wrap { max-width:820px; margin:0 auto; padding:12px 12px 22px; }' +
'  .bar { display:flex; align-items:center; gap:12px; flex-wrap:wrap;' +
'    background:#2C7A99; padding:4px 0 8px; margin-bottom:6px; }' +
'  .reload { font-size:1rem; font-weight:700; color:#fff; background:#2563eb; border:0;' +
'    border-radius:10px; padding:12px 18px; cursor:pointer; }' +
'  .reload:active { transform:translateY(1px); }' +
'  .fresh { font-size:.78rem; color:var(--sub); }' +
'  .fetched { display:flex; flex-direction:column; gap:2px; font-size:.82rem; color:rgba(255,255,255,.82); }' +
'  .fetched b { font-weight:700; color:#fff; margin-right:4px; }' +
'  .homelink { font-size:.9rem; font-weight:700; color:var(--ink); text-decoration:none;' +
'    background:var(--card); border:1px solid var(--line); border-radius:10px; padding:10px 14px; }' +
'  .homelink:active { transform:translateY(1px); }' +
'  h1 { font-size:1.05rem; margin:4px 0 8px; color:#fff; }' +
'  h1 .cnt { color:#ff8fb3; }' +
'  .meta { color:var(--sub); font-size:.82rem; line-height:1.6; margin-bottom:6px; }' +
'  .safe { display:inline-block; font-size:.75rem; color:#16a34a;' +
'    border:1px solid #16a34a55; border-radius:999px; padding:2px 10px; margin-bottom:16px; }' +
'  .result-line { font-size:1.05rem; font-weight:700; margin:4px 0 16px; }' +
'  .result-line .n { color:var(--real); }' +
'  .result-line .ex { font-size:.82rem; font-weight:400; color:var(--sub); }' +
'  .summary { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px; }' +
'  .stat { background:var(--card); border:1px solid var(--line); border-radius:12px;' +
'    padding:10px 16px; min-width:92px; }' +
'  .stat .n { font-size:1.6rem; font-weight:700; line-height:1; }' +
'  .stat .l { font-size:.72rem; color:var(--sub); margin-top:4px; }' +
'  .stat.real .n { color:var(--real); } .stat.dup .n { color:var(--dup); }' +
'  .card { background:var(--card); border:1px solid var(--line);' +
'    border-left:4px solid var(--real); border-radius:12px; padding:9px 11px;' +
'    margin-bottom:8px; box-shadow:0 1px 3px rgba(0,0,0,.06); }' +
'  .card.dup { border-left-color:var(--dup); }' +
'  .card-h { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:6px; }' +
'  .no { width:26px; height:26px; border-radius:50%; background:var(--ink); color:var(--card);' +
'    display:grid; place-items:center; font-size:.85rem; font-weight:700; flex:none; }' +
'  .date { font-weight:800; font-size:1.15rem; }' +
'  .room { background:var(--rc); color:#fff; font-weight:700; font-size:.85rem;' +
'    padding:2px 11px; border-radius:999px; }' +
'  .kind { font-size:.82rem; font-weight:600; }' +
'  .card.real .kind { color:var(--real); } .card.dup .kind { color:var(--dup); }' +
'  .ov { font-size:.85rem; color:var(--ink); font-weight:700; }' +
'  .pair { display:flex; flex-direction:column; gap:0;' +
'    border-top:2px solid var(--sub); padding-top:7px; margin-top:2px; }' +
'  .side { background:var(--bg); border-radius:10px; padding:6px 10px; }' +
'  .time { display:flex; align-items:center; font-weight:600; font-size:1.3rem;' +
'    font-variant-numeric:tabular-nums; }' +
'  .ab { flex:none; display:grid; place-items:center; width:34px; height:34px; border-radius:9px;' +
'    color:#fff; font-weight:800; font-size:1.15rem; margin-right:8px; }' +
'  .abA { background:#2563eb; } .abB { background:#f59e0b; }' +
'  .who { margin:4px 0 2px; font-size:1rem; }' +
'  .who .staff { font-size:1.02rem; } .who .code { color:var(--sub); font-weight:600; margin:0 4px; }' +
'  .who .name { font-weight:500; }' +
'  .menu { list-style:none; margin:6px 0 4px; padding:0; }' +
'  .menu li { font-size:.9rem; line-height:1.35; padding-left:1.15em; position:relative; }' +
'  .menu li::before { content:"◉"; position:absolute; left:0; color:var(--real); font-size:.7em; top:.28em; }' +
'  .cal { font-size:.72rem; color:var(--sub); }' +
'  .tt { display:block; margin-top:8px; text-align:center; text-decoration:none;' +
'    background:#4caf7d; color:#fff; font-weight:700; font-size:.85rem;' +
'    padding:9px; border-radius:10px; }' +
'  .tt:active { transform:translateY(1px); }' +
'  .vs { border-top:2px dashed var(--sub); margin:6px 2px; opacity:.85; }' +
'  .empty { background:var(--card); border:1px solid var(--line); border-radius:12px;' +
'    padding:40px; text-align:center; font-size:1.15rem; color:#16a34a; }' +
'';
