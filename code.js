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

// 役割(URL引数)をリンク用のクエリ文字列に変換。staff/devは排他（doGetでdevはstaff未指定時のみ有効化）。
function roleSfx_(staff, dev) {
  return staff ? '&staff=1' : (dev ? '&dev=1' : '');
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action) return handleAction_(p);   // 編集依頼の受付/取り出し/結果（命令置き場API）
  var view = p.view || 'home';   // home（メニュー）／conflict（施術室被り）／lt（L⇔T予約照合・準備中）
  var base = getBaseUrl_();
  // スタッフ版（?staff=1）＝売上を見せない・「ALLスタッフ版」表示。未指定＝オーナー「なしぼ版」。
  var staff = (p.staff === '1' || p.staff === 'true');
  // 開発版（?dev=1）＝tile_settings.jsonの表示ON/OFF設定を無視して全ボタンを表示。staff指定時は無効。
  var dev = !staff && (p.dev === '1' || p.dev === 'true');
  var html, title;
  if (view === 'conflict') {
    title = '施術室被り検出';
    var withNail = (p.nail === '1' || p.nail === 'true');
    try {
      var file = getEventsFile_();
      var d = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
      var res = detect(d.events, withNail, d.date_from);
      html = renderPage_(res.conflicts, res.meta, d, withNail, base, staff, dev);
    } catch (err) {
      html = renderError_(err, base, staff, dev);
    }
  } else if (view === 'lt') {
    title = 'L⇔T予約照合';
    html = renderLT_(base, staff, dev);
  } else if (view === 'notice') {
    title = '前日お知らせ 確認';
    try {
      var nfile = getNoticeFile_();
      var nd = JSON.parse(nfile.getBlob().getDataAsString('UTF-8'));
      title = nd.title || title;
      html = nd.body_html;
    } catch (nerr) {
      html = renderError_(nerr, base, staff, dev);
    }
  } else if (view === 'uriage' && !staff) {
    title = '売上TimeTree転記';
    html = renderUriage_(base, staff, dev);
  } else if (view === 'unanswered') {
    title = 'LINE未回答＆返信待ち';
    html = renderUnanswered_(base, staff, dev);
  } else {
    title = staff ? 'TTスーパーズコApp（ALLスタッフ版）' : (dev ? 'TTスーパーズコApp（開発版）' : 'TTスーパーズコApp');
    html = renderHome_(base, staff, dev);
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

// lt_match.json / uriage.json のJSONP配信（読み取り専用・鍵不要）。
// ＝静的アプリ(ttsuperzuco.github.io/tt)がGAS専用API(DriveApp等)を直接呼べないため、
// events と同じJSONP経由でデータだけ渡し、描画は純JSの render*Page_ 側で行う。
function _ltJsonp_(p) {
  var cb = String(p.callback || 'cb').replace(/[^A-Za-z0-9_$.]/g, '');
  var payload;
  try {
    payload = JSON.parse(getLtFile_().getBlob().getDataAsString('UTF-8'));
  } catch (e) {
    payload = { error: String(e) };
  }
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(payload) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
function _uriageJsonp_(p) {
  var cb = String(p.callback || 'cb').replace(/[^A-Za-z0-9_$.]/g, '');
  var payload;
  try {
    payload = JSON.parse(getUriageFile_().getBlob().getDataAsString('UTF-8'));
  } catch (e) {
    payload = { error: String(e) };
  }
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(payload) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// unanswered.json のJSONP配信（読み取り専用・鍵不要）。事務所PCが export_unanswered_super.py で書き出す。
function _unansweredJsonp_(p) {
  var cb = String(p.callback || 'cb').replace(/[^A-Za-z0-9_$.]/g, '');
  var payload;
  try {
    payload = JSON.parse(getUnansweredFile_().getBlob().getDataAsString('UTF-8'));
  } catch (e) {
    payload = { error: String(e) };
  }
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(payload) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// タイル(ボタン)表示ON/OFF設定のJSONP配信（読み取り専用・鍵不要）。
// 事務所PC「自動監視システム」の tile_settings.py が書き出す tile_settings.json を渡すだけ。
function _tileSettingsJsonp_(p) {
  var cb = String(p.callback || 'cb').replace(/[^A-Za-z0-9_$.]/g, '');
  var payload = { tiles: getTileSettings_() };
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(payload) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function handleAction_(p) {
  if (p.action === 'events') return _eventsJsonp_(p);
  if (p.action === 'lt') return _ltJsonp_(p);
  if (p.action === 'uriage') return _uriageJsonp_(p);
  if (p.action === 'unanswered') return _unansweredJsonp_(p);
  if (p.action === 'tilesettings') return _tileSettingsJsonp_(p);
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

// ========== スマホUIから直接呼ぶ（google.script.run）＝鍵不要・同オリジン ==========
// 命令置き場は handleAction_ と同じ QUEUE_PROP を共用。事務所PCの edit_worker が
// ?action=pending でこの依頼を拾い、move_calendar 実行後 ?action=report で結果を書く。
// スマホ側はここ(uiStatus)で done/error を見に行く。EDIT_KEYはサーバ内なので露出しない。
function uiSubmitMove(cal, event, toCal, toLabel, room, title) {
  var lock = LockService.getScriptLock();
  try { lock.tryLock(10000); } catch (ig) {}
  try {
    var q = _queueGet_();
    var id = 'c' + Date.now() + Math.floor(Math.random() * 1000);
    q.push({ id: id, ts: new Date().toISOString(), op: 'movecal',
      cal: cal, event: event, to_cal: toCal, to_label: Number(toLabel),
      room: room || '', title: title || '', status: 'pending', result: '' });
    _queueSet_(q);
    return id;
  } finally {
    try { lock.releaseLock(); } catch (ig2) {}
  }
}

function uiStatus(id) {
  var q = _queueGet_();
  for (var i = 0; i < q.length; i++) {
    if (q[i].id === id) return { status: q[i].status, result: q[i].result || '' };
  }
  return { status: 'notfound', result: '' };
}

// 売上TimeTree転記ボタン（オーナー版のみ）。命令置き場に積むだけ。事務所PCの edit_worker が拾って実行→report。
// op='uriage'      … 未記入売上を記入（新規記入のみ自動・既存の値は一切触らない＝失敗しても実害ゼロ）。
// op='uriage_fix'  … 記入ミスを修正（TimeTreeの既存値を上書き。アプリ画面で新旧の値を見せた上での
//                     明示タップ＋確認ダイアログを安全弁とする＝部屋移動ボタンと同じ考え方）。
function uiSubmitUriage() {
  return _uriageSubmit_('uriage');
}
function uiSubmitUriageFix() {
  return _uriageSubmit_('uriage_fix');
}
function _uriageSubmit_(op) {
  var lock = LockService.getScriptLock();
  try { lock.tryLock(10000); } catch (ig) {}
  try {
    var q = _queueGet_();
    var id = 'u' + Date.now() + Math.floor(Math.random() * 1000);
    q.push({ id: id, ts: new Date().toISOString(), op: op,
      status: 'pending', result: '' });
    _queueSet_(q);
    return id;
  } finally {
    try { lock.releaseLock(); } catch (ig2) {}
  }
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

/** notice_compare.json のファイルを取得（前日お知らせ比較ページ。IDキャッシュはしない＝
 *  上書きのたびに毎回名前検索して最新を拾う。ファイル自体が小さく低頻度アクセスのため軽い）。 */
var NOTICE_FILENAME = 'notice_compare.json';
function getNoticeFile_() {
  var it = DriveApp.getFilesByName(NOTICE_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) {
    throw new Error('notice_compare.json がドライブに見つかりません。事務所PCから書き出してください。');
  }
  return newest;
}

/** lt_match.json のファイルを取得（L⇔T照合の結果。事務所PCが export_lt_super.py で書き出す）。 */
var LT_FILENAME = 'lt_match.json';
function getLtFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('LT_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (ignore) { /* IDが古い→探し直す */ }
  }
  var it = DriveApp.getFilesByName(LT_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) {
    throw new Error('lt_match.json がドライブに見つかりません。事務所PCで「予約照合」を実行（export_lt_super.py）し、Googleドライブの同期を待ってください。');
  }
  props.setProperty('LT_FILE_ID', newest.getId());
  return newest;
}

/** uriage.json のファイルを取得（売上表示。事務所PCが export_uriage.py で書き出す）。 */
var URIAGE_FILENAME = 'uriage.json';
function getUriageFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('URIAGE_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (ignore) { /* IDが古い→探し直す */ }
  }
  var it = DriveApp.getFilesByName(URIAGE_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) {
    throw new Error('uriage.json がドライブに見つかりません。事務所PCで export_uriage.py を実行し、Googleドライブの同期を待ってください。');
  }
  props.setProperty('URIAGE_FILE_ID', newest.getId());
  return newest;
}

/** unanswered.json のファイルを取得（LINE未回答＆返信待ち表示。
 *  事務所PCが export_unanswered_super.py で書き出す）。 */
var UNANSWERED_FILENAME = 'unanswered.json';
function getUnansweredFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('UNANSWERED_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (ignore) { /* IDが古い→探し直す */ }
  }
  var it = DriveApp.getFilesByName(UNANSWERED_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) {
    throw new Error('unanswered.json がドライブに見つかりません。事務所PCで export_unanswered_super.py を実行し、Googleドライブの同期を待ってください。');
  }
  props.setProperty('UNANSWERED_FILE_ID', newest.getId());
  return newest;
}

/** tile_settings.json のファイルを取得（ホーム画面ボタンの表示ON/OFF設定。
 *  事務所PC「自動監視システム」の tile_settings.py が書き出す）。 */
var TILE_SETTINGS_FILENAME = 'tile_settings.json';
function getTileSettingsFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('TILESET_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (ignore) { /* IDが古い→探し直す */ }
  }
  var it = DriveApp.getFilesByName(TILE_SETTINGS_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) throw new Error('tile_settings.json 未生成');
  props.setProperty('TILESET_FILE_ID', newest.getId());
  return newest;
}

// tile_settings.json が無い/壊れている時のデフォルト＝現状の挙動と同じ（売上だけスタッフに非表示）。
// ★新しいボタン(タイル)を足す時は、下のTILE_DEFS_と両方に1件ずつ追記する（idを一致させる）。
var DEFAULT_TILE_SETTINGS_ = {
  conflict:   { exec: true, staff: true },
  lt:         { exec: true, staff: true },
  uriage:     { exec: true, staff: false },
  unanswered: { exec: true, staff: true }
};

/** 現在のタイル表示設定を取得（①GAS専用＝DriveApp呼び出し。失敗時はデフォルトにフォールバック
 *  ＝設定ファイルが無くてもホーム画面が壊れないことを優先）。 */
function getTileSettings_() {
  try {
    var file = getTileSettingsFile_();
    var d = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
    if (d && d.tiles && typeof d.tiles === 'object') return d.tiles;
  } catch (ignore) {}
  return DEFAULT_TILE_SETTINGS_;
}

// ---- 表示（room_conflict_detect.py の render_html を移植。並び・色を一致させる）----

var CIRCLED = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫','⑬','⑭','⑮','⑯','⑰','⑱','⑲','⑳'];
function circled_(n) { return (n >= 1 && n <= CIRCLED.length) ? CIRCLED[n - 1] : (n + '.'); }

function roomColor_(room) {
  var p = { 'FREEDOM': '#e11d48', 'COSMOS': '#7c3aed', 'HAPPY': '#f59e0b',
            'LUCKY': '#16a34a', 'STAR/福/🇫🇷': '#0ea5e9' };
  return p[room] || '#64748b';
}

// 部屋名 → 移動先の (カレンダーID, ラベルID)。config.ROOM と同じ（部屋も揃えて移動＝B方式）。
// ★config.py の ROOM_LABELS と一致させること（片方直したら両方）。
// ★NAIL(ネイル)はうちの部屋管理の対象外（外部の間借りの方のサービス）＝共通ルールで恒久的に除外。
//   一覧・移動候補・空き部屋表示、このアプリのどこにも一切出さない。
var ROOMS_ = {
  'FREEDOM':      { cal: '73208496', label: 1 },
  'COSMOS':       { cal: '59950873', label: 2 },
  'HAPPY':        { cal: '59950855', label: 6 },
  'LUCKY':        { cal: '59950871', label: 9 },
  'STAR/福/🇫🇷': { cal: '86075789', label: 10 }
};
// ★COSMOSは常に最後（部屋移動の候補ボタン＝一番右／空き部屋状況パネル＝一番下）＝ユーザー指定の並び。
var ROOM_ORDER_ = ['FREEDOM', 'HAPPY', 'LUCKY', 'STAR/福/🇫🇷', 'COSMOS'];

// 'HH:MM' → 分。ダメなら null。
function hmToMin_(s) {
  var m = /^(\d{1,2}):(\d{2})$/.exec(String(s || ''));
  if (!m) return null;
  return (+m[1]) * 60 + (+m[2]);
}
function toHm_(min) {
  var h = Math.floor(min / 60), m = min % 60;
  return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
}
// 'HH:MM-HH:MM' → [開始分, 終了分]。ダメなら null。
function parseTimeRange_(s) {
  var parts = String(s || '').split('-');
  if (parts.length !== 2) return null;
  var a = hmToMin_(parts[0]), b = hmToMin_(parts[1]);
  return (a == null || b == null) ? null : [a, b];
}
// その部屋がその日の [s,e) の時間帯に空いているか（room_busy＝PC側がroom_availabilityモジュールで
// 計算済みの答え。GAS側では空き判定ロジックを再実装しない＝共通ルール）。
function roomIsFree_(roomBusyForDate, name, s, e) {
  var ivs = (roomBusyForDate && roomBusyForDate[name]) || [];
  for (var i = 0; i < ivs.length; i++) {
    if (ivs[i][0] < e && s < ivs[i][1]) return false;   // 重なりあり＝使用中
  }
  return true;
}

// 被りカード内「A/Bを別の空き部屋へ移す」1行（現在の部屋は候補から除く／空いてる部屋だけ表示）。
function moveRow_(side, cal, event, who, title, curRoom, roomBusyForDate, timeStr) {
  var hasId = (cal != null && cal !== '' && event != null && event !== '');
  var range = parseTimeRange_(timeStr);
  var btns = '';
  var anyFree = false;
  for (var i = 0; i < ROOM_ORDER_.length; i++) {
    var name = ROOM_ORDER_[i];
    if (name === curRoom) continue;   // 今と同じ部屋は出さない
    if (range && !roomIsFree_(roomBusyForDate, name, range[0], range[1])) continue;  // 使用中は出さない
    anyFree = true;
    var rm = ROOMS_[name];
    btns += '<button type="button" class="mvbtn"' +
      (hasId ? '' : ' disabled') +
      ' data-cal="' + esc_(cal) + '" data-ev="' + esc_(event) + '"' +
      ' data-tocal="' + rm.cal + '" data-tolabel="' + rm.label + '"' +
      ' data-room="' + esc_(name) + '" data-title="' + esc_(title) + '" data-side="' + side + '"' +
      ' style="--rc:' + roomColor_(name) + '">' + esc_(name) + '</button>';
  }
  var note = !hasId ? '<span class="mvng">IDが取れず移動不可</span>'
    : (!anyFree ? '<span class="mvng">その時間、空いている部屋がありません</span>' : '');
  return '<div class="mvrow">' +
    '<span class="mvlabel">' + side + '（' + esc_(who) + '）を以下の部屋に移す</span>' +
    '<span class="mvbtns">' + btns + note + '</span>' +
  '</div>';
}

// 表示用の営業窓（スタッフ確定シフトの最早11:00〜最遅21:00に合わせた既定値。
// 空き時間検索システム(available_slots.py)のSTAFFシフト定義と同じ範囲＝表示の目安。
var DAY_WIN_S_ = 11 * 60, DAY_WIN_E_ = 21 * 60;

// busy区間（分, ソート済み前提なしでOK）から、[winS,winE) の中の空き区間を計算。
function freeGaps_(busy, winS, winE) {
  var merged = (busy || []).slice().sort(function (a, b) { return a[0] - b[0]; })
    .reduce(function (acc, iv) {
      var s = Math.max(winS, iv[0]), e = Math.min(winE, iv[1]);
      if (e <= s) return acc;
      if (acc.length && s <= acc[acc.length - 1][1]) {
        acc[acc.length - 1][1] = Math.max(acc[acc.length - 1][1], e);
      } else {
        acc.push([s, e]);
      }
      return acc;
    }, []);
  var gaps = [], cur = winS;
  merged.forEach(function (iv) {
    if (iv[0] > cur) gaps.push([cur, iv[0]]);
    cur = Math.max(cur, iv[1]);
  });
  if (winE > cur) gaps.push([cur, winE]);
  return gaps;
}

// 「空き部屋状況を見る」パネル：その日1日の施術室別・空き時間（NAIL除外）。
// ★空きの元データ(busy)はPC側がroom_availabilityモジュールで計算した答え（room_busy）そのまま。
//   ここでやっているのは「営業窓からbusyを引いた残り」を出すだけの表示計算（判定ロジックの
//   再実装ではない）。
// このパネル内だけの表示用の短い部屋名（色・空き判定は元の正式名"STAR/福/🇫🇷"のまま行う。
// バッジ幅を詰めて時間チップを右側に収めるための表示専用の短縮＝他画面には影響しない）。
function shortRoomName_(name) {
  return name === 'STAR/福/🇫🇷' ? 'STAR/福' : name;
}

function roomStatusPanel_(date, roomBusyForDate) {
  var rows = ROOM_ORDER_.map(function (name) {
    var busy = (roomBusyForDate && roomBusyForDate[name]) || [];
    var gaps = freeGaps_(busy, DAY_WIN_S_, DAY_WIN_E_);
    var chips = gaps.length
      ? gaps.map(function (iv) { return '<span class="slot">' + toHm_(iv[0]) + '-' + toHm_(iv[1]) + '</span>'; }).join('')
      : '<span class="none">空きなし</span>';
    return '<div class="rstat"><span class="room" style="--rc:' + roomColor_(name) + '">' +
      esc_(shortRoomName_(name)) + '</span><span class="rchips">' + chips + '</span></div>';
  }).join('');
  return '<div class="rspanel" hidden><div class="rstitle">' + esc_(date) + ' の施術室別・空き時間</div>' + rows + '</div>';
}

function esc_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function renderPage_(conflicts, meta, payload, withNail, base, staff, dev) {
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
      var roomBusyForDate = (payload.room_busy && payload.room_busy[x.date]) || {};
      return '' +
      '<article class="card real">' +
        '<header class="card-h">' +
          '<span class="no">' + (idx + 1) + '</span>' +
          '<span class="date">' + esc_(x.date) + '</span>' +
          '<span class="room" style="--rc:' + rc + '">' + esc_(x.room) + '</span>' +
          (x.dup_suspect ? '<span class="dup">⚠️同一人物の疑い(二重入力?)</span>' : '') +
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
        '<div class="mv" data-room="' + esc_(x.room) + '">' +
          '<div class="mvtoprow">' +
            '<button type="button" class="mvtoggle">🔀 部屋を移して<br>被りを解消</button>' +
            '<button type="button" class="rstoggle">📋 空き部屋<br>状況を見る</button>' +
          '</div>' +
          roomStatusPanel_(x.date, roomBusyForDate) +
          '<div class="mvpanel" hidden>' +
            moveRow_('A', x.a_cal_id, x.a_event_id, [x.a_staff, x.a_code, x.a_name].filter(Boolean).join(' '), x.a_title, x.room, roomBusyForDate, x.a_time) +
            moveRow_('B', x.b_cal_id, x.b_event_id, [x.b_staff, x.b_code, x.b_name].filter(Boolean).join(' '), x.b_title, x.room, roomBusyForDate, x.b_time) +
            '<div class="mvhint">空いている施術室のみ表示しています</div>' +
          '</div>' +
          '<div class="mvstatus" hidden></div>' +
        '</div>' +
      '</article>';
    }).join('\n');
  }

  var nailNote = withNail ? '（NAIL含む）' : '';
  return '' +
'<style>' + CSS_ + '</style>' +
'<div class="wrap">' +
  '<div class="bar">' +
    '<a class="homelink" href="' + (base || '') + '?view=home' + roleSfx_(staff, dev) + '" target="_top">← 前に戻る</a>' +
    '<div class="fetched">' +
      '<span class="fline"><b>LINE取得</b> ' + esc_(payload.line_fetched_at || '—') + '</span>' +
      '<span class="fline"><b>TimeTree取得</b> ' + esc_(payload.timetree_fetched_at || '—') + '</span>' +
    '</div>' +
  '</div>' +
  '<h1>⚠️ 施術室被り検出 <span class="cnt">' + real + '件</span>' + nailNote + '</h1>' +
  cards +
'</div>' +
TTSCRIPT_ + MOVESCRIPT_;
}

function renderError_(err, base, staff, dev) {
  return '<style>' + CSS_ + '</style>' +
    '<div class="wrap"><div class="bar">' +
    '<a class="homelink" href="' + (base || '') + '?view=home' + roleSfx_(staff, dev) + '" target="_top">☰ メニュー</a>' +
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

// ホームのタイル(ボタン)定義。表示ON/OFFはコードでなく tile_settings.json（幹部用／スタッフ用）で管理する。
// ★新しいボタンを足す時はここに1件追加＋DEFAULT_TILE_SETTINGS_にも同じidで1件追加する。
var TILE_DEFS_ = [
  { id: 'conflict', cls: 'conflict', view: 'conflict',
    icon: '<span class="ticon">🛏️</span>', label: '施術室被り検出' },
  { id: 'lt', cls: 'lt', view: 'lt',
    icon: '<span class="ticon"><span class="lt2">' + LINE_LOGO_ + TT_LOGO_ + '</span></span>', label: 'L⇔T予約照合' },
  { id: 'uriage', cls: 'uriage', view: 'uriage',
    icon: '<span class="ticon">💰</span>', label: '売上TimeTree転記' },
  { id: 'unanswered', cls: 'unanswered', view: 'unanswered',
    icon: '<span class="ticon">💬</span>', label: 'LINE未回答＆返信待ち' }
];

/** ①GAS直アクセス専用のホーム画面ラッパ。tile_settings.json(Drive)を読んで renderHomePage_ に渡すだけ。 */
function renderHome_(base, staff, dev) {
  return renderHomePage_(getTileSettings_(), base, staff, dev);
}

/** ホーム画面の描画（純JS・GAS API不使用）。②静的アプリは JSONP で tile_settings を取得し、
 *  これを直接呼ぶ（renderPage_/renderLtPage_/renderUriagePage_ と同じ「取得と描画を分離」の作法）。
 *  dev=true（開発用URL）は tile_settings.json の設定を無視して全ボタンを表示する。 */
function renderHomePage_(tileSettings, base, staff, dev) {
  var settings = tileSettings || DEFAULT_TILE_SETTINGS_;
  var sfx = roleSfx_(staff, dev);
  var subtitle = staff ? 'ALLスタッフ版' : (dev ? '開発版（全ボタン表示）' : 'なしぼ版');
  var role = staff ? 'staff' : 'exec';
  var tilesHtml = TILE_DEFS_.filter(function (t) {
    if (dev) return true;
    var s = settings[t.id];
    return !s || s[role] !== false;   // 設定に無いタイル＝デフォルト表示
  }).map(function (t) {
    return '<a class="tile ' + t.cls + '" href="' + base + '?view=' + t.view + sfx + '" target="_top">' +
      t.icon + '<span class="tname">' + esc_(t.label) + '</span></a>';
  }).join('');
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' +
    '<div class="hhead"><span class="bmark">🍅</span><span class="bname">TTスーパーズコApp</span></div>' +
    '<div class="hsub">' + subtitle + '</div>' +
    '<div class="tiles">' + tilesHtml + '</div>' +
  '</div>';
}

/** L⇔T予約照合（LINEの予約 と TimeTree の予定を突き合わせた結果を表示）。
 *  事務所PCが export_lt_super.py で書き出した lt_match.json を読むだけ（GASは判定しない）。 */
function renderLT_(base, staff, dev) {
  try {
    var file = getLtFile_();
    var d = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
    return renderLtPage_(d, base, staff, dev);
  } catch (err) {
    return renderError_(err, base, staff, dev);
  }
}

// L⇔T照合の1件カード（PC版ダッシュボード build_report_web.render_card のスマホ版）。
function ltCard_(r) {
  var cls = esc_(r.cls || 'check');
  var status = esc_(r.status || '');
  var name = r.name || '（名前不明）';
  var search = esc_(((name) + ' ' + (r.code || '') + ' ' + (r.evidence || '')).toLowerCase());

  var codeHtml = r.code ? '<span class="lcode">' + esc_(r.code) + '</span>' : '';

  var chips = (r.chips || []).map(function (c) {
    return '<span class="lchip ' + (c.on ? 'on' : 'off') + '">' + esc_(c.label) + '</span>';
  }).join('');

  var evHtml = r.evidence
    ? '<div class="levi"><span class="lelab">LINE根拠</span><span>' + esc_(r.evidence) + '</span></div>'
    : '';

  var ttHtml = '<div class="ltt none">TimeTreeに該当予定なし</div>';
  if (r.tt_title || r.tt_url) {
    var link = '';
    if (r.tt_url) {
      // class="tt" ＋ data-cal/data-ev で TTSCRIPT_（Androidアプリ直起動）が効く。
      link = '<a class="tt ltlink" target="_top" rel="noopener"' +
             ' data-cal="' + esc_(r.calendar_id) + '" data-ev="' + esc_(r.event_id) + '"' +
             ' href="' + esc_(r.tt_url) + '">TimeTreeで開く ↗</a>';
    }
    var body = r.tt_body
      ? '<details class="ltbody"><summary>予定の内容を見る</summary><div>' + esc_(r.tt_body) + '</div></details>'
      : '';
    ttHtml = '<div class="ltt">' +
      '<div class="ltrow"><span class="ltlab">TimeTree</span>' +
      '<span class="lttime">' + esc_(r.tt_time || '—') + '</span>' + link + '</div>' +
      '<div class="lttitle">' + esc_(r.tt_title || '') + '</div>' + body +
    '</div>';
  }

  return '' +
  '<article class="lcard ' + cls + '" data-status="' + status + '" data-search="' + search + '">' +
    '<div class="lhead">' +
      '<span class="lbadge ' + cls + '">' + esc_(r.status_label || status) + '</span>' +
      '<span class="ldate">' + esc_(r.date || '') + '</span>' +
      '<span class="lname">' + esc_(name) + '</span>' + codeHtml +
    '</div>' +
    '<div class="ltimes">' +
      '<div class="tcol"><span class="tlab">LINE予約</span><span class="tval line">' + esc_(r.line_time || '—') + '</span></div>' +
      '<span class="arr">→</span>' +
      '<div class="tcol"><span class="tlab">TimeTree</span><span class="tval">' + esc_(r.tt_time || '—') + '</span></div>' +
    '</div>' +
    '<div class="lreason">' + esc_(r.reason_label || '') + '</div>' +
    '<div class="laction"><span class="ldo">✔</span>' + esc_(r.action || '') + '</div>' +
    '<div class="lchips">' + chips + '</div>' +
    evHtml + ttHtml +
  '</article>';
}

function renderLtPage_(d, base, staff, dev) {
  var c = d.counts || {};
  var action = d.action || [];
  var oks = d.ok || [];

  var cards = action.length
    ? action.map(ltCard_).join('\n')
    : '<div class="lempty">要対応はありません 🎉</div>';

  var okRows = oks.map(function (r) {
    var srch = esc_(((r.name || '') + ' ' + (r.time || '')).toLowerCase());
    return '<tr data-search="' + srch + '">' +
      '<td>' + esc_(r.date || '') + '</td>' +
      '<td>' + esc_(r.time || '') + '</td>' +
      '<td>' + esc_(r.name || '') + '</td>' +
      '<td class="ttc">' + esc_(r.tt_title || '') + '</td></tr>';
  }).join('\n');

  function stat(f, n, lab, kcls) {
    return '<button type="button" class="lstat" data-f="' + f + '">' +
      '<b class="' + (kcls || '') + '">' + (n || 0) + '</b><span>' + lab + '</span></button>';
  }

  return '' +
'<style>' + LTCSS_ + '</style>' +
'<div class="lwrap">' +
  '<div class="lbar">' +
    '<a class="lhome" href="' + (base || '') + '?view=home' + roleSfx_(staff, dev) + '" target="_top">← 前に戻る</a>' +
    '<span class="lgen">照合: ' + esc_(d.generated_at || '—') + '</span>' +
  '</div>' +
  '<h1>🔗 L⇔T予約照合 <span class="lcnt">要対応 ' + (c.action || 0) + '件</span></h1>' +
  '<div class="lsummary">' +
    stat('all', c.action, '要対応', '') +
    stat('time_mismatch', c.fix, '要修正', 'k-fix') +
    stat('not_found', c.add, '要追加', 'k-add') +
    stat('need_check', c.check, '要確認', 'k-chk') +
    stat('ok', c.ok, 'OK', 'k-ok') +
  '</div>' +
  '<input id="lq" type="search" placeholder="名前・番号でしぼり込み（例: 林 / M346）">' +
  '<div id="lcards">' + cards + '</div>' +
  '<details class="loksec">' +
    '<summary>OK（一致済み） ' + (c.ok || 0) + '件 ― タップで開く</summary>' +
    '<table><thead><tr><th>日付</th><th>時刻</th><th>お客様</th><th>TimeTree予定</th></tr></thead>' +
    '<tbody>' + okRows + '</tbody></table>' +
  '</details>' +
'</div>' +
TTSCRIPT_ + LTSCRIPT_;
}

// 数字にカンマ（GAS側で self-completeに。toLocaleStringに頼らない）。
function comma_(n) { return String(n == null ? '' : n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

/** 売上TimeTree転記（オーナー版のみ）。GAS(/exec)からの直アクセス用ラッパ：
 *  事務所PCが export_uriage.py で書き出した uriage.json を DriveApp で読んで renderUriagePage_ に渡す。
 *  ※静的アプリ(ttsuperzuco.github.io/tt)はDriveAppを呼べないので、こちらは使わずJSONP経由で
 *    renderUriagePage_/renderUriageError_（純JS・GAS API不使用）を直接呼ぶ（index.html側）。 */
function renderUriage_(base, staff, dev) {
  try {
    var d = JSON.parse(getUriageFile_().getBlob().getDataAsString('UTF-8'));
    return renderUriagePage_(d, base, staff, dev);
  } catch (err) {
    return renderUriageError_(err, base, staff, dev);
  }
}

// 「前に戻る」共通の土台（★ルール：戻るリンクは全画面この方式に統一＝施術室被り(.homelink)と
// 同じ「← 前に戻る」の上部バー。新しいviewを足す時もこれを使う。共通\スーパーズコApp_必読.md参照）。
function backBar_(base, staff, dev) {
  return '<div class="ubar"><a class="uhome" href="' + (base || '') + '?view=home' +
    roleSfx_(staff, dev) + '" target="_top">← 前に戻る</a></div>';
}

/** 売上ページの描画（純JS・GAS API不使用）。GAS直アクセスと静的アプリJSONPの両方から呼ばれる。 */
function renderUriagePage_(d, base, staff, dev) {
  return '<style>' + HOMECSS_ + URIAGECSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">💰</span><span class="bname">売上TimeTree転記</span></div>' +
    uriageBody_(d) +
  '</div>' +
  URIAGESCRIPT_;
}

/** 売上データが読めない時の表示（純JS）。 */
function renderUriageError_(err, base, staff, dev) {
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">💰</span><span class="bname">売上TimeTree転記</span></div>' +
    '<div class="soon">' +
      '<div class="soonic">📄</div>' +
      '<div class="soontitle" style="font-size:1.4rem">データ未生成</div>' +
      '<div class="soondesc">' + esc_(err && err.message ? err.message : err) + '</div>' +
    '</div>' +
  '</div>';
}

function uriageBody_(d) {
  var today = d.today_str || '—';
  var cum = d.cumulative_str || '—';
  var monthLabel = d.month ? ('今月（' + d.month + '月）の売上') : '今月の売上';
  var pl = d.plan || { missing_days: 0, mistake_days: 0, done_days: 0, days: [] };
  var days = pl.days || [];
  var missingDays = days.filter(function (x) { return x.status === 'missing'; });
  var mistakeDays = days.filter(function (x) { return x.status === 'mistake'; });

  // 1日ぶんの項目（当日額/累計）を「・」でつないで1行に。
  function dayLi(x) { return '<li>' + esc_(x.label) + '：' + x.items.map(esc_).join('・') + '</li>'; }
  var missList = missingDays.map(dayLi).join('');
  var mistList = mistakeDays.map(dayLi).join('');
  var perRows = (d.per_day || []).map(function (x) {
    return '<tr><td>' + esc_(x.date) + '</td><td class="num">' + comma_(x.total) + '</td></tr>';
  }).join('');

  var nMissing = pl.missing_days || 0;
  var nMistake = pl.mistake_days || 0;
  var missBtnLabel = nMissing > 0
    ? ('▶ 未記入売上を記入（' + nMissing + '日ぶん）')
    : '▶ 未記入売上を記入（対象なし）';
  var fixBtnLabel = nMistake > 0
    ? ('🔧 記入ミスを修正（' + nMistake + '日ぶん）')
    : '🔧 記入ミスを修正（対象なし）';
  var noteBox = d.note ? '<div class="unote">' + esc_(d.note) + '</div>' : '';

  return '' +
  noteBox +
  '<div class="ucards">' +
    '<div class="ucard"><div class="ul">今日の売上</div><div class="uv">' + esc_(today) + '</div></div>' +
    '<div class="ucard"><div class="ul">' + esc_(monthLabel) + '</div><div class="uv">' + esc_(cum) + '</div></div>' +
  '</div>' +
  '<button type="button" id="uperbtn" class="uperbtn">📅 各営業日の売上</button>' +
  '<div id="uperpanel" class="uperpanel" hidden>' +
    '<table class="upertbl"><thead><tr><th>日</th><th class="num">売上(元)</th></tr></thead>' +
    '<tbody>' + perRows + '</tbody></table>' +
  '</div>' +
  '<div class="uplan">' +
    '<div class="uprow">' +
      '<span class="upc"><b class="cr">' + nMissing + '</b><span>未記入</span></span>' +
      '<span class="upc"><b class="up">' + (pl.mistake_days || 0) + '</b><span>記入ミス</span></span>' +
      '<span class="upc"><b class="ok">' + (pl.done_days || 0) + '</b><span>記入完了</span></span>' +
    '</div>' +
    (missList ? '<div class="ublk"><b>未記入</b><ul>' + missList + '</ul></div>' : '') +
    (mistList ? '<div class="ublk warn"><b>記入ミス</b><ul>' + mistList + '</ul></div>' : '') +
  '</div>' +
  '<button type="button" id="ubtn" class="ubtn"' + (nMissing > 0 ? '' : ' data-empty="1"') + '>' + missBtnLabel + '</button>' +
  '<button type="button" id="ufixbtn" class="ubtn ufix"' + (nMistake > 0 ? '' : ' data-empty="1"') + '>' + fixBtnLabel + '</button>' +
  '<div id="ustatus" class="ustatus" hidden></div>' +
  '<div class="ugen">最終計算：' + esc_(d.generated_at || '—') + '</div>';
}

// 転記ボタン：命令置き場に依頼→事務所PCが処理→uiStatusでpoll表示（部屋移動と同じ仕組み）。
// ＋金額(.uv)がカード幅からはみ出す時だけ自動で文字を縮めて必ず1行に収める
// （最大100万元台＝「1,000,000元」のような桁数でも折り返さない想定）。
var URIAGESCRIPT_ =
'<script>(function(){' +
'var els=document.querySelectorAll(".uv");' +
'for(var i=0;i<els.length;i++){' +
'  var el=els[i]; var tries=0;' +
'  while(el.scrollWidth>el.clientWidth && tries<20){' +
'    var cur=parseFloat(getComputedStyle(el).fontSize);' +
'    el.style.fontSize=(cur-1)+"px"; tries++;' +
'  }' +
'}' +
'var pb=document.getElementById("uperbtn");' +
'if(pb){ pb.addEventListener("click",function(){' +
'  var pn=document.getElementById("uperpanel"); if(pn) pn.hidden=!pn.hidden;' +
'}); }' +
'var st=document.getElementById("ustatus");' +
'var missBtn=document.getElementById("ubtn");' +
'var fixBtn=document.getElementById("ufixbtn");' +
'function wireUriageBtn(btn, submitFn, emptyMsg, confirmMsg, workingMsg){' +
'  if(!btn || !st) return;' +
'  btn.addEventListener("click",function(){' +
'    var empty=btn.getAttribute("data-empty")==="1";' +
'    if(!confirm(empty?emptyMsg:confirmMsg)) return;' +
'    if(missBtn) missBtn.disabled=true; if(fixBtn) fixBtn.disabled=true;' +
'    st.hidden=false; st.className="ustatus working"; st.textContent="⏳ 事務所PCに依頼中…";' +
'    google.script.run' +
'      .withSuccessHandler(function(id){ pollU(id, workingMsg); })' +
'      .withFailureHandler(function(e){ st.className="ustatus err"; st.textContent="⚠️ 依頼に失敗："+e; enableUriageBtns(); })' +
'      [submitFn]();' +
'  });' +
'}' +
'function enableUriageBtns(){ if(missBtn) missBtn.disabled=false; if(fixBtn) fixBtn.disabled=false; }' +
'wireUriageBtn(missBtn, "uiSubmitUriage",' +
'  "追加する新規記入はありません。念のため実行しますか？",' +
'  "今日ぶんの売上をTimeTreeに記入します。よろしいですか？\\n（新規記入のみ・既存の値は変更しません）",' +
'  "⏳ 処理中…（帳簿を読んでTimeTreeに記入）");' +
'wireUriageBtn(fixBtn, "uiSubmitUriageFix",' +
'  "修正が必要な記入ミスはありません。念のため実行しますか？",' +
'  "上のリストの通りTimeTreeの既存の値を書き換えます。よろしいですか？\\n（内容をよく確認してから実行してください）",' +
'  "⏳ 処理中…（TimeTreeの値を修正）");' +
'function pollU(id, workingMsg){' +
'  st.textContent=workingMsg; var tries=0;' +
'  var timer=setInterval(function(){ tries++;' +
'    google.script.run.withSuccessHandler(function(r){' +
'      var s=(r&&r.status)||"";' +
'      if(s==="done"){ clearInterval(timer); st.className="ustatus ok"; st.textContent="✅ "+((r.result)||"完了しました")+"（画面を更新すると最新に）"; enableUriageBtns(); }' +
'      else if(s==="error"||s==="failed"){ clearInterval(timer); st.className="ustatus err"; st.textContent="⚠️ 失敗："+((r.result)||s); enableUriageBtns(); }' +
'      else if(tries>=60){ clearInterval(timer); st.className="ustatus err"; st.textContent="⚠️ 時間切れ。事務所PCの見張りが動いているか確認してください。"; enableUriageBtns(); }' +
'    }).withFailureHandler(function(e){}).uiStatus(id);' +
'  },3000);' +
'}' +
'})();</scr' + 'ipt>';

var URIAGECSS_ =
'  .ubar { display:flex; align-items:center; gap:12px; margin:0 0 14px; }' +
'  .uhome { font-size:.9rem; font-weight:700; color:var(--ink); text-decoration:none;' +
'    background:var(--card); border:1px solid var(--line); border-radius:10px; padding:10px 14px; }' +
'  .uhome:active { transform:translateY(1px); }' +
'  .unote { background:#fef9c3; color:#854d0e; border-radius:12px; padding:12px 14px;' +
'    font-weight:700; font-size:.9rem; margin-bottom:14px; }' +
'  .ucards { display:flex; gap:12px; margin-bottom:14px; }' +
'  .ucard { flex:1; background:var(--card); border:1px solid var(--line); border-radius:16px;' +
'    padding:16px 14px; text-align:center; box-shadow:0 4px 12px rgba(0,0,0,.06); }' +
'  .ucard .ul { font-size:.82rem; color:var(--sub); font-weight:700; }' +
'  .ucard .uv { font-size:1.7rem; font-weight:900; color:var(--ink); margin-top:6px;' +
'    font-variant-numeric:tabular-nums; white-space:nowrap; overflow:hidden; }' +
'  .uplan { background:var(--card); border:1px solid var(--line); border-radius:16px;' +
'    padding:14px; box-shadow:0 4px 12px rgba(0,0,0,.06); }' +
'  .uprow { display:flex; gap:8px; text-align:center; }' +
'  .upc { flex:1; display:flex; flex-direction:column; gap:2px; }' +
'  .upc b { font-size:1.5rem; font-weight:900; line-height:1; }' +
'  .upc span { font-size:.7rem; color:var(--sub); font-weight:700; }' +
'  .upc b.cr { color:#16a34a; } .upc b.up { color:#d97706; }' +
'  .upc b.mn { color:#e11d48; } .upc b.ok { color:var(--sub); }' +
'  .ublk { margin-top:12px; border-top:1px dashed var(--line); padding-top:10px; }' +
'  .ublk b { font-size:.86rem; }' +
'  .ublk.warn b { color:#b45309; }' +
'  .ublk ul { margin:6px 0 0; padding-left:1.2em; }' +
'  .ublk li { font-size:.9rem; line-height:1.5; }' +
'  .ubtn { display:block; width:100%; margin-top:16px; font-size:1.15rem; font-weight:800;' +
'    color:#fff; background:#f59e0b; border:0; border-radius:14px; padding:16px; cursor:pointer;' +
'    box-shadow:0 4px 14px rgba(245,158,11,.4); }' +
'  .ubtn:active { transform:translateY(1px); }' +
'  .ubtn:disabled { opacity:.55; }' +
'  .ubtn.ufix { background:#2563eb; box-shadow:0 4px 14px rgba(37,99,235,.4); margin-top:10px; }' +
'  .ustatus { margin-top:12px; padding:13px 14px; border-radius:12px; font-size:1rem; font-weight:700; }' +
'  .ustatus.working { background:#fef9c3; color:#854d0e; }' +
'  .ustatus.ok { background:#dcfce7; color:#166534; }' +
'  .ustatus.err { background:#fee2e2; color:#991b1b; }' +
'  .uperbtn { width:100%; text-align:center; font-size:.9rem; font-weight:700; color:var(--ink);' +
'    background:var(--card); border:1px solid var(--line); border-radius:10px; padding:11px;' +
'    cursor:pointer; margin-bottom:14px; }' +
'  .uperbtn:active { transform:translateY(1px); }' +
'  .uperpanel { background:var(--card); border:1px solid var(--line); border-radius:12px;' +
'    padding:4px 14px; margin:-8px 0 14px; }' +
'  .upertbl { width:100%; border-collapse:collapse; margin:6px 0 10px; font-size:.92rem; }' +
'  .upertbl th, .upertbl td { border-bottom:1px solid var(--line); padding:7px 8px; text-align:left; }' +
'  .upertbl .num { text-align:right; font-variant-numeric:tabular-nums; }' +
'  .ugen { text-align:center; color:rgba(255,255,255,.9); font-size:.78rem; margin-top:14px; }';

/** LINE未回答＆返信待ち（GAS(/exec)からの直アクセス用ラッパ）：
 *  事務所PCが export_unanswered_super.py で書き出した unanswered.json を DriveApp で読んで
 *  renderUnansweredPage_ に渡す。判定はPC側(line_unanswered.py/build_web.py)で完結済み・GASは表示のみ。
 *  ※静的アプリはJSONP経由でrenderUnansweredPage_を直接呼ぶ（他のview同様）。 */
function renderUnanswered_(base, staff, dev) {
  try {
    var d = JSON.parse(getUnansweredFile_().getBlob().getDataAsString('UTF-8'));
    return renderUnansweredPage_(d, base, staff, dev);
  } catch (err) {
    return renderUnansweredError_(err, base, staff, dev);
  }
}

function renderUnansweredError_(err, base, staff, dev) {
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' +
    '<div class="ubar"><a class="uhome" href="' + (base || '') + '?view=home' +
      roleSfx_(staff, dev) + '" target="_top">← 前に戻る</a></div>' +
    '<div class="hhead"><span class="bmark">💬</span><span class="bname">LINE未回答＆返信待ち</span></div>' +
    '<div class="soon">' +
      '<div class="soonic">📄</div>' +
      '<div class="soontitle" style="font-size:1.4rem">データ未生成</div>' +
      '<div class="soondesc">' + esc_(err && err.message ? err.message : err) + '</div>' +
    '</div>' +
  '</div>';
}

function unaBadge_(kind, v) {
  if (kind === 'cust') return '<span class="unabadge cust">客の質問</span>';
  if (v === '要返信・依頼') return '<span class="unabadge req">要返信・依頼</span>';
  return '<span class="unabadge q">個別質問</span>';
}
function unaReadPill_(read) {
  if (read === '未読') return '<span class="unapill unread">未読</span>';
  if (read === '既読') return '<span class="unapill read">既読</span>';
  return '';
}

// 1件のカード（build_web.py の row描画のGAS/静的アプリ版。全文モーダルは今回省略＝リンク先LINEで確認）。
function unaCard_(r, kind) {
  var name = r.nm || '🆕 新規（番号未設定）';
  var tag = [r.nat, r.sex].filter(Boolean).join('・');
  var search = esc_(((name) + ' ' + (r.q || '')).toLowerCase());
  var link = r.url
    ? '<a class="unalink" target="_blank" rel="noopener" href="' + esc_(r.url) + '">💬 LINEを開く（返信する）</a>'
    : '';
  return '' +
  '<article class="unacard ' + (kind === 'cust' ? 'cust' : 'ours') + '" data-search="' + search + '" data-days="' + (r.d || 0) + '">' +
    '<div class="unahead">' +
      unaBadge_(kind, r.v) + unaReadPill_(r.read) +
      '<span class="unaname">' + esc_(name) + '</span>' +
      (tag ? '<span class="unatag">' + esc_(tag) + '</span>' : '') +
      '<span class="unadays">待ち' + (r.d || 0) + '日</span>' +
    '</div>' +
    '<div class="unaq">' + esc_(r.q || '') + '</div>' +
    (r.th ? '<div class="unath">' + esc_(r.th) + '</div>' : '') +
    (link ? '<div class="unaactions">' + link + '</div>' : '') +
  '</article>';
}

/** LINE未回答＆返信待ちページの描画（純JS・GAS API不使用）。GAS直アクセスと静的アプリJSONPの
 *  両方から呼ばれる（他view同様「取得と描画を分離」の作法）。
 *  cust=客の質問に店が未返信（最優先）／ ours=こちらの質問・依頼に客が未回答。 */
function renderUnansweredPage_(d, base, staff, dev) {
  var cust = d.cust || [], ours = d.ours || [];
  var custCards = cust.length
    ? cust.map(function (r) { return unaCard_(r, 'cust'); }).join('\n')
    : '<div class="unaempty">当店が未返信の会話はありません 🎉</div>';
  var oursCards = ours.length
    ? ours.map(function (r) { return unaCard_(r, 'ours'); }).join('\n')
    : '<div class="unaempty">お客様の返事待ちはありません 🎉</div>';

  return '' +
'<style>' + UNACSS_ + '</style>' +
'<div class="unawrap">' +
  '<div class="unabar">' +
    '<a class="unahome" href="' + (base || '') + '?view=home' + roleSfx_(staff, dev) + '" target="_top">← 前に戻る</a>' +
    '<span class="unagen">' + esc_(d.fresh || '—') + ' 時点</span>' +
  '</div>' +
  '<h1>💬 LINE未回答＆返信待ち</h1>' +
  '<div class="unatabs">' +
    '<button type="button" class="unatab cust sel" data-v="cust">🟢 当店が未返信<span class="unac" id="unaCntCust">' + cust.length + '</span></button>' +
    '<button type="button" class="unatab ours" data-v="ours">🔵 お客様の返事待ち<span class="unac" id="unaCntOurs">' + ours.length + '</span></button>' +
  '</div>' +
  '<select id="unaperiod">' +
    '<option value="3">3日間</option>' +
    '<option value="7" selected>7日間</option>' +
    '<option value="31">1か月</option>' +
    '<option value="9999">全期間</option>' +
  '</select>' +
  '<input id="unaq" type="search" placeholder="名前・質問内容でしぼり込み">' +
  '<div id="unacust" class="unalist">' + custCards + '</div>' +
  '<div id="unaours" class="unalist unahidden">' + oursCards + '</div>' +
  '<div class="unaempty" id="unaperiodempty" hidden>この期間に該当はありません。上の期間を広げてください。</div>' +
  '<div class="unafoot">緑＝こちらが返すべき（お客様が待っている）／ 青＝お客様の返事待ち。' +
    'アフターケア確認・一斉あいさつ等の返事不要な定型は除外済み。既読/未読はLINE公式マネージャー基準。' +
    '既定は7日間表示（PC版ダッシュボードと同じ）。古い会話は「期間」を広げると出てきます。</div>' +
'</div>' +
UNASCRIPT_;
}

// タブ切替（客の質問⇔客の返事待ち）＋期間しぼり込み（既定7日間＝PC版ダッシュボードと同じ既定値）＋
// 名前・質問文でのしぼり込み（L⇔T照合の絞り込みと同じ発想）。
var UNASCRIPT_ =
'<script>(function(){' +
'var tabs=[].slice.call(document.querySelectorAll(".unatab"));' +
'var custEl=document.getElementById("unacust"), oursEl=document.getElementById("unaours");' +
'var q=document.getElementById("unaq");' +
'var per=document.getElementById("unaperiod");' +
'var cntCust=document.getElementById("unaCntCust"), cntOurs=document.getElementById("unaCntOurs");' +
'var empty=document.getElementById("unaperiodempty");' +
'function apply(){' +
'  var kw=(q&&q.value||"").trim().toLowerCase();' +
'  var pv=+(per&&per.value)||9999;' +
'  var nc=0, no=0;' +
'  [].slice.call(document.querySelectorAll(".unacard")).forEach(function(c){' +
'    var days=+(c.getAttribute("data-days")||0);' +
'    var okP=(days<=pv);' +
'    var okK=(!kw||(c.getAttribute("data-search")||"").indexOf(kw)>=0);' +
'    var show=okP&&okK;' +
'    c.classList.toggle("unahide", !show);' +
'    if(show){ if(c.classList.contains("cust")) nc++; else no++; }' +
'  });' +
'  if(cntCust) cntCust.textContent=nc;' +
'  if(cntOurs) cntOurs.textContent=no;' +
'  var activeEl=(custEl&&!custEl.classList.contains("unahidden"))?custEl:oursEl;' +
'  var activeCount=(activeEl===custEl)?nc:no;' +
'  if(empty) empty.hidden=(activeCount>0);' +
'}' +
'tabs.forEach(function(t){ t.addEventListener("click",function(){' +
'  var v=t.getAttribute("data-v");' +
'  tabs.forEach(function(x){ x.classList.toggle("sel", x===t); });' +
'  if(custEl) custEl.classList.toggle("unahidden", v!=="cust");' +
'  if(oursEl) oursEl.classList.toggle("unahidden", v!=="ours");' +
'  apply();' +
'}); });' +
'if(q) q.addEventListener("input",apply);' +
'if(per) per.addEventListener("input",apply);' +
'apply();' +
'})();</scr' + 'ipt>';

// LINE未回答＆返信待ちページ用スタイル（自己完結・ダーク/ライト対応・スマホ第一。L⇔T照合のCSSを土台にする）。
var UNACSS_ =
'  :root{ --bg:#2C7A99; --card:#ffffff; --ink:#1c2430; --sub:#667085; --line:#e6e9ef;' +
'    --cust:#0d9b6c; --req:#e5484d; --q:#4f57c4; --custbg:#e7f6ec; }' +
'  @media (prefers-color-scheme:dark){ :root{ --card:#1b2430; --ink:#e8ebf0; --sub:#9aa4b2;' +
'    --line:#2a3441; --custbg:#12331f; } }' +
'  *{ box-sizing:border-box; }' +
'  body{ margin:0; background:var(--bg); color:var(--ink);' +
'    font-family:"Segoe UI","Yu Gothic UI","Hiragino Sans",system-ui,sans-serif; line-height:1.5; }' +
'  .unawrap{ max-width:640px; margin:0 auto; padding:16px 14px 60px; }' +
'  .unabar{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px; }' +
'  .unahome{ color:#fff; text-decoration:none; font-weight:700; font-size:14px;' +
'    background:rgba(255,255,255,.16); padding:7px 12px; border-radius:10px; }' +
'  .unagen{ color:#eaf3f7; font-size:11px; opacity:.9; }' +
'  h1{ color:#fff; font-size:19px; margin:6px 0 12px; }' +
'  .unatabs{ display:flex; gap:8px; margin-bottom:12px; }' +
'  .unatab{ flex:1; background:var(--card); border:1px solid var(--line); border-radius:12px;' +
'    padding:10px 8px; cursor:pointer; text-align:center; color:var(--ink); font:inherit; font-weight:700; font-size:13px; }' +
'  .unatab .unac{ display:block; font-size:20px; font-weight:900; margin-top:2px; }' +
'  .unatab.cust.sel{ outline:2px solid var(--cust); } .unatab.ours.sel{ outline:2px solid var(--q); }' +
'  #unaperiod{ width:100%; padding:10px 12px; border:1px solid var(--line); border-radius:10px;' +
'    background:var(--card); color:var(--ink); font-size:14px; font-weight:700; margin-bottom:10px; }' +
'  #unaq{ width:100%; padding:10px 12px; border:1px solid var(--line); border-radius:10px;' +
'    background:var(--card); color:var(--ink); font-size:15px; margin-bottom:14px; }' +
'  .unahidden{ display:none!important; } .unahide{ display:none!important; }' +
'  .unalist{ display:flex; flex-direction:column; gap:10px; }' +
'  .unacard{ background:var(--card); border:1px solid var(--line); border-left:6px solid var(--sub);' +
'    border-radius:12px; padding:12px 14px; }' +
'  .unacard.cust{ border-left-color:var(--cust); background:var(--custbg); }' +
'  .unacard.ours{ border-left-color:var(--q); }' +
'  .unahead{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:6px; }' +
'  .unabadge{ font-size:11px; font-weight:800; color:#fff; padding:2px 9px; border-radius:999px; }' +
'  .unabadge.cust{ background:var(--cust); } .unabadge.req{ background:var(--req); } .unabadge.q{ background:var(--q); }' +
'  .unapill{ font-size:10.5px; font-weight:800; padding:2px 8px; border-radius:6px; }' +
'  .unapill.unread{ background:#fef9c3; color:#854d0e; } .unapill.read{ background:var(--line); color:var(--sub); }' +
'  .unaname{ font-weight:800; font-size:15px; }' +
'  .unatag{ font-size:11px; color:var(--sub); }' +
'  .unadays{ margin-left:auto; font-size:12px; color:var(--sub); font-variant-numeric:tabular-nums; }' +
'  .unaq{ font-size:14px; margin:2px 0 6px; line-height:1.45; }' +
'  .unath{ font-size:12px; color:var(--sub); border-top:1px dashed var(--line); padding-top:6px; margin-top:2px; }' +
'  .unaactions{ margin-top:9px; }' +
'  .unalink{ display:inline-block; text-decoration:none; background:#06c755; color:#fff; font-weight:700;' +
'    font-size:12.5px; padding:8px 14px; border-radius:10px; }' +
'  .unaempty{ text-align:center; color:#fff; padding:30px; font-weight:700; }' +
'  .unafoot{ margin-top:18px; color:rgba(255,255,255,.85); font-size:11px; line-height:1.6; }';

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

// 部屋付け替えのUI操作（トグル→依頼→処理中→結果）。google.script.run で同オリジン呼び出し。
var MOVESCRIPT_ =
'<script>(function(){' +
'var wrap=document.querySelector(".wrap"); if(!wrap) return;' +
'wrap.addEventListener("click",function(ev){' +
'  var t=ev.target;' +
'  if(t.classList&&t.classList.contains("rstoggle")){' +
'    var card=t; while(card&&!(card.classList&&card.classList.contains("card"))) card=card.parentNode; if(!card) return;' +
'    var pn=card.querySelector(".rspanel"); if(pn) pn.hidden=!pn.hidden; t.classList.toggle("open",!pn.hidden); return;' +
'  }' +
'  if(t.classList&&t.classList.contains("mvtoggle")){' +
'    var mvw=t; while(mvw&&!(mvw.classList&&mvw.classList.contains("mv"))) mvw=mvw.parentNode; if(!mvw) return;' +
'    var pn=mvw.querySelector(".mvpanel"); if(pn) pn.hidden=!pn.hidden; t.classList.toggle("open",!pn.hidden); return;' +
'  }' +
'  if(t.classList&&t.classList.contains("mvbtn")){' +
'    if(t.disabled) return;' +
'    var mv=t; while(mv&&!(mv.classList&&mv.classList.contains("mv"))) mv=mv.parentNode; if(!mv) return;' +
'    var cal=t.getAttribute("data-cal"), evid=t.getAttribute("data-ev");' +
'    var toCal=t.getAttribute("data-tocal"), toLabel=t.getAttribute("data-tolabel");' +
'    var room=t.getAttribute("data-room"), title=t.getAttribute("data-title"), side=t.getAttribute("data-side");' +
'    if(!cal||!evid){ alert("この予約のIDが取れず移動できません"); return; }' +
'    if(!confirm(side+"を「"+room+"」へ移動します。よろしいですか？\\n（TimeTreeを書き換えます・削除はしません）")) return;' +
'    var pn=mv.querySelector(".mvpanel"); if(pn) pn.hidden=true;' +
'    var st=mv.querySelector(".mvstatus"); st.hidden=false; st.className="mvstatus working"; st.textContent="⏳ 事務所PCに依頼中…";' +
'    google.script.run' +
'      .withSuccessHandler(function(id){ pollMove(st,id,room); })' +
'      .withFailureHandler(function(e){ st.className="mvstatus err"; st.textContent="⚠️ 依頼に失敗しました："+e; })' +
'      .uiSubmitMove(cal,evid,toCal,toLabel,room,title);' +
'  }' +
'});' +
'function pollMove(st,id,room){' +
'  st.textContent="⏳ 処理中…（"+room+"へ移動）"; var tries=0;' +
'  var timer=setInterval(function(){ tries++;' +
'    google.script.run.withSuccessHandler(function(r){' +
'      var s=(r&&r.status)||"";' +
'      if(s==="done"){ clearInterval(timer); st.className="mvstatus ok"; st.textContent="✅ "+((r.result)||(room+"へ移動しました")); }' +
'      else if(s==="error"||s==="failed"){ clearInterval(timer); st.className="mvstatus err"; st.textContent="⚠️ 失敗："+((r.result)||s); }' +
'      else if(tries>=40){ clearInterval(timer); st.className="mvstatus err"; st.textContent="⚠️ 時間切れ。事務所PCの見張りが動いているか確認してください。"; }' +
'    }).withFailureHandler(function(e){}).uiStatus(id);' +
'  },3000);' +
'}' +
'})();</scr' + 'ipt>';

// L⇔T予約照合ページ用スタイル（自己完結・ダーク/ライト対応・スマホ第一）。
var LTCSS_ =
'  :root{ --bg:#2C7A99; --card:#ffffff; --ink:#1c2430; --sub:#667085; --line:#e6e9ef;' +
'    --fix:#e5484d; --add:#d97706; --chk:#eab308; --ok:#16a34a;' +
'    --fixbg:#fff1f1; --addbg:#fff6ea; --chkbg:#fffbe6; }' +
'  @media (prefers-color-scheme:dark){ :root{ --card:#1b2430; --ink:#e8ebf0; --sub:#9aa4b2;' +
'    --line:#2a3441; --fixbg:#2a1416; --addbg:#2a1f10; --chkbg:#26230f; } }' +
'  *{ box-sizing:border-box; }' +
'  body{ margin:0; background:var(--bg); color:var(--ink);' +
'    font-family:"Segoe UI","Yu Gothic UI","Hiragino Sans",system-ui,sans-serif; line-height:1.5; }' +
'  .lwrap{ max-width:640px; margin:0 auto; padding:16px 14px 60px; }' +
'  .lbar{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px; }' +
'  .lhome{ color:#fff; text-decoration:none; font-weight:700; font-size:14px;' +
'    background:rgba(255,255,255,.16); padding:7px 12px; border-radius:10px; }' +
'  .lgen{ color:#eaf3f7; font-size:11px; opacity:.9; }' +
'  h1{ color:#fff; font-size:19px; margin:6px 0 12px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }' +
'  .lcnt{ font-size:13px; background:rgba(255,255,255,.18); padding:2px 10px; border-radius:999px; font-weight:700; }' +
'  .lsummary{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px; }' +
'  .lstat{ flex:1 1 auto; min-width:78px; background:var(--card); border:1px solid var(--line);' +
'    border-radius:12px; padding:8px 6px; cursor:pointer; text-align:center; color:var(--ink); font:inherit; }' +
'  .lstat b{ display:block; font-size:22px; line-height:1.1; }' +
'  .lstat span{ font-size:11px; color:var(--sub); }' +
'  .lstat.sel{ outline:2px solid var(--ink); }' +
'  .lstat .k-fix{ color:var(--fix); } .lstat .k-add{ color:var(--add); }' +
'  .lstat .k-chk{ color:var(--chk); } .lstat .k-ok{ color:var(--ok); }' +
'  #lq{ width:100%; padding:10px 12px; border:1px solid var(--line); border-radius:10px;' +
'    background:var(--card); color:var(--ink); font-size:15px; margin-bottom:14px; }' +
'  .lcard{ background:var(--card); border:1px solid var(--line); border-left:6px solid var(--sub);' +
'    border-radius:12px; padding:12px 14px; margin-bottom:10px; }' +
'  .lcard.fix{ border-left-color:var(--fix); background:var(--fixbg); }' +
'  .lcard.add{ border-left-color:var(--add); background:var(--addbg); }' +
'  .lcard.check{ border-left-color:var(--chk); background:var(--chkbg); }' +
'  .lhead{ display:flex; align-items:center; gap:9px; flex-wrap:wrap; }' +
'  .lbadge{ font-size:11px; font-weight:800; color:#fff; padding:2px 9px; border-radius:999px; }' +
'  .lbadge.fix{ background:var(--fix); } .lbadge.add{ background:var(--add); }' +
'  .lbadge.check{ background:var(--chk); color:#5a4a00; }' +
'  .ldate{ color:var(--sub); font-size:12px; font-variant-numeric:tabular-nums; }' +
'  .lname{ font-weight:800; font-size:15px; }' +
'  .lcode{ font-size:11px; color:var(--sub); border:1px solid var(--line); border-radius:6px; padding:0 6px; }' +
'  .ltimes{ display:flex; align-items:center; gap:12px; margin:10px 0 8px; }' +
'  .tcol{ display:flex; flex-direction:column; }' +
'  .tlab{ font-size:10px; color:var(--sub); }' +
'  .tval{ font-size:19px; font-weight:800; font-variant-numeric:tabular-nums; }' +
'  .tval.line{ color:var(--fix); }' +
'  .lcard.ok .tval.line,.lcard.check .tval.line{ color:inherit; }' +
'  .arr{ color:var(--sub); font-size:17px; }' +
'  .lreason{ font-size:12.5px; color:var(--sub); margin-bottom:5px; }' +
'  .laction{ font-size:14px; font-weight:700; display:flex; gap:7px; align-items:flex-start; margin-bottom:9px; }' +
'  .ldo{ color:var(--ok); }' +
'  .lchips{ display:flex; gap:6px; flex-wrap:wrap; margin-bottom:6px; }' +
'  .lchip{ font-size:11px; padding:2px 8px; border-radius:999px; border:1px solid var(--line); }' +
'  .lchip.on{ background:#e7f6ec; border-color:#bfe6cd; color:#137a3b; }' +
'  .lchip.off{ color:var(--sub); opacity:.5; }' +
'  @media (prefers-color-scheme:dark){ .lchip.on{ background:#12331f; border-color:#1f5133; color:#5fd08a; } }' +
'  .levi,.ltt{ background:rgba(127,127,127,.06); border:1px solid var(--line); border-radius:9px;' +
'    padding:8px 10px; margin-top:7px; font-size:12.5px; }' +
'  .lelab,.ltlab{ font-size:10px; color:var(--sub); margin-right:8px; }' +
'  .ltrow{ display:flex; align-items:center; gap:10px; margin-bottom:2px; }' +
'  .lttime{ font-weight:800; } .lttitle{ font-size:13.5px; }' +
'  .ltt.none{ color:var(--sub); }' +
'  .ltlink{ margin-left:auto; font-size:12px; color:#2563eb; text-decoration:none; font-weight:700; }' +
'  .ltbody{ margin-top:6px; } .ltbody summary{ cursor:pointer; color:var(--sub); font-size:12px; }' +
'  .ltbody div{ margin-top:6px; color:var(--sub); font-size:12px; white-space:pre-wrap; }' +
'  .lempty{ text-align:center; color:#fff; padding:26px; font-weight:700; }' +
'  .loksec{ margin-top:18px; background:var(--card); border:1px solid var(--line); border-radius:12px; padding:4px 12px; }' +
'  .loksec summary{ cursor:pointer; font-weight:800; padding:9px 0; }' +
'  .loksec table{ width:100%; border-collapse:collapse; font-size:12.5px; }' +
'  .loksec th,.loksec td{ text-align:left; padding:6px 6px; border-bottom:1px solid var(--line); vertical-align:top; }' +
'  .loksec th{ color:var(--sub); font-weight:700; } .loksec td.ttc{ color:var(--sub); }' +
'  .lhidden{ display:none!important; }';

// L⇔T照合ページの絞り込み（区分ボタン＋名前/番号の検索）。
var LTSCRIPT_ =
'<script>(function(){' +
'var q=document.getElementById("lq"); if(!q) return;' +
'var cards=[].slice.call(document.querySelectorAll(".lcard"));' +
'var stats=[].slice.call(document.querySelectorAll(".lstat"));' +
'var filter="all";' +
'function apply(){' +
'  var kw=(q.value||"").trim().toLowerCase();' +
'  cards.forEach(function(c){' +
'    var okS=(filter==="all"||c.getAttribute("data-status")===filter);' +
'    var okK=(!kw||(c.getAttribute("data-search")||"").indexOf(kw)>=0);' +
'    c.classList.toggle("lhidden",!(okS&&okK));' +
'  });' +
'}' +
'q.addEventListener("input",apply);' +
'stats.forEach(function(s){ s.addEventListener("click",function(){' +
'  var f=s.getAttribute("data-f");' +
'  if(f==="ok"){ var ok=document.querySelector(".loksec"); if(ok){ ok.open=true; ok.scrollIntoView({behavior:"smooth"}); } return; }' +
'  filter=(filter===f)?"all":f;' +
'  stats.forEach(function(x){ x.classList.toggle("sel", x.getAttribute("data-f")===filter && filter!=="all"); });' +
'  apply();' +
'}); });' +
'})();</scr' + 'ipt>';

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
'  .tile.unanswered::before { background:#0d9b6c; }' +
'  .tile:active { transform:translateY(2px); box-shadow:0 3px 10px rgba(0,0,0,.10); }' +
'  @media (hover:hover){ .tile:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(0,0,0,.12); } }' +
'  .ticon { flex:none; width:60px; height:60px; border-radius:15px; font-size:32px;' +
'    display:grid; place-items:center; }' +
'  .tile.conflict .ticon { background:rgba(225,29,72,.12); }' +
'  .tile.lt .ticon { background:rgba(148,163,184,.14); }' +
'  .tile.uriage .ticon { background:rgba(245,158,11,.16); }' +
'  .tile.unanswered .ticon { background:rgba(13,155,108,.12); }' +
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
'  .soondesc { color:var(--sub); font-size:.9rem; margin-top:8px; line-height:1.6; }';

var CSS_ =
'  :root { --bg:#f1f5f9; --card:#ffffff; --ink:#0f172a; --sub:#64748b;' +
'    --line:#e2e8f0; --real:#e11d48; --dup:#d97706; }' +
'  @media (prefers-color-scheme: dark) { :root { --bg:#0b1220; --card:#131c2e;' +
'    --ink:#e8eef7; --sub:#94a3b8; --line:#26324a; } }' +
'  * { box-sizing:border-box; }' +
'  body { margin:0; padding:0; background:#2C7A99; color:var(--ink);' +
'    font-family:"Segoe UI","Yu Gothic UI","Hiragino Sans",system-ui,sans-serif; }' +
'  .wrap { max-width:820px; margin:0 auto; padding:12px 12px 22px; }' +
'  .bar { display:flex; align-items:center; gap:10px; flex-wrap:nowrap;' +
'    background:#2C7A99; padding:4px 0 8px; margin-bottom:6px; }' +
'  .reload { font-size:1rem; font-weight:700; color:#fff; background:#2563eb; border:0;' +
'    border-radius:10px; padding:12px 18px; cursor:pointer; }' +
'  .reload:active { transform:translateY(1px); }' +
'  .fresh { font-size:.78rem; color:var(--sub); }' +
'  .fetched { flex:1 1 auto; min-width:0; display:flex; flex-direction:column; gap:2px;' +
'    font-size:.74rem; color:rgba(255,255,255,.82); }' +
'  .fetched b { font-weight:700; color:#fff; margin-right:4px; }' +
'  .homelink { flex:0 0 auto; font-size:.9rem; font-weight:700; color:var(--ink); text-decoration:none;' +
'    background:var(--card); border:1px solid var(--line); border-radius:10px; padding:10px 14px; }' +
'  .homelink:active { transform:translateY(1px); }' +
'  h1 { font-size:1.05rem; margin:4px 0 8px; color:#fff; }' +
'  h1 .cnt { color:#ff8fb3; font-size:1.6em; font-weight:900; }' +
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
'  .card { background:var(--card); border:1px solid var(--line); box-sizing:border-box;' +
'    border-left:4px solid var(--real); border-radius:12px; padding:9px 11px;' +
'    min-height:90vh; min-height:90svh;' +
'    margin-bottom:8px; box-shadow:0 1px 3px rgba(0,0,0,.06); }' +
'  .card.dup { border-left-color:var(--dup); }' +
'  .card-h { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:6px; }' +
'  .no { width:34px; height:34px; border-radius:50%; background:var(--ink); color:var(--card);' +
'    display:grid; place-items:center; font-size:1.1rem; font-weight:800; flex:none; }' +
'  .date { font-weight:900; font-size:1.55rem; }' +
'  .room { background:var(--rc); color:#fff; font-weight:800; font-size:1.05rem;' +
'    padding:4px 16px; border-radius:999px; }' +
'  .dup { font-size:.95rem; font-weight:800; color:#92400e;' +
'    background:#fde68a; padding:4px 12px; border-radius:999px; }' +
'  @media (prefers-color-scheme: dark) { .dup { color:#1c1400; background:#fbbf24; } }' +
'  .kind { font-size:.82rem; font-weight:600; }' +
'  .card.real .kind { color:var(--real); } .card.dup .kind { color:var(--dup); }' +
'  .ov { font-size:1.05rem; font-weight:800; color:var(--real);' +
'    background:rgba(225,29,72,.14); padding:4px 12px; border-radius:999px; }' +
'  .pair { display:flex; flex-direction:column; gap:0;' +
'    border-top:2px solid var(--sub); padding-top:7px; margin-top:2px; }' +
'  .side { background:var(--bg); border-radius:10px; padding:6px 10px; }' +
'  .time { display:flex; align-items:center; font-weight:600; font-size:1.3rem;' +
'    font-variant-numeric:tabular-nums; }' +
'  .ab { flex:none; display:grid; place-items:center; width:34px; height:34px; border-radius:9px;' +
'    color:#fff; font-weight:800; font-size:1.15rem; margin-right:8px; }' +
'  .abA { background:#2563eb; } .abB { background:#0d9488; }' +
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
'  .mv { margin-top:8px; }' +
'  .mvtoprow { display:flex; gap:8px; align-items:stretch; }' +
'  .mvtoggle, .rstoggle { flex:1 1 0; text-align:center; font-size:.85rem; font-weight:700;' +
'    line-height:1.4; white-space:normal; color:#fff; background:#2563eb; border:1px solid #2563eb;' +
'    border-radius:10px; padding:9px 6px; cursor:pointer; }' +
'  .mvtoggle:active, .rstoggle:active { transform:translateY(1px); }' +
'  .mvtoggle.open, .rstoggle.open { color:var(--ink); background:var(--card); border-color:var(--line);' +
'    box-shadow:inset 0 2px 5px rgba(0,0,0,.2); }' +
'  .mvpanel { margin-top:8px; background:var(--bg); border:1px solid var(--line);' +
'    border-radius:10px; padding:8px 10px; }' +
'  .mvrow { display:flex; flex-direction:column; gap:6px; padding:6px 0; }' +
'  .mvrow + .mvrow { border-top:1px dashed var(--line); }' +
'  .mvlabel { font-size:.86rem; font-weight:700; color:var(--ink); }' +
'  .mvbtns { display:flex; flex-wrap:wrap; gap:7px; }' +
'  .mvbtn { font-size:.92rem; font-weight:800; color:#fff; background:var(--rc,#64748b);' +
'    border:0; border-radius:999px; padding:9px 14px; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.18); }' +
'  .mvbtn:active { transform:translateY(1px); }' +
'  .mvbtn:disabled { opacity:.4; }' +
'  .mvng { font-size:.8rem; color:var(--sub); align-self:center; }' +
'  .mvhint { font-size:.86rem; color:var(--real); font-weight:800; margin-top:6px; line-height:1.5; }' +
'  .mvstatus { margin-top:8px; padding:11px 12px; border-radius:10px; font-size:.95rem; font-weight:700; }' +
'  .mvstatus.working { background:#fef9c3; color:#854d0e; }' +
'  .mvstatus.ok { background:#dcfce7; color:#166534; }' +
'  .mvstatus.err { background:#fee2e2; color:#991b1b; }' +
'  .rspanel { margin:8px 0 0; background:var(--bg); border:1px solid var(--line);' +
'    border-radius:10px; padding:8px 10px; }' +
'  .rstitle { font-size:.8rem; font-weight:700; color:var(--sub); margin-bottom:6px; }' +
'  .rstat { display:flex; align-items:flex-start; flex-wrap:nowrap; gap:6px; padding:4px 0; }' +
'  .rstat + .rstat { border-top:1px dashed var(--line); }' +
'  .rstat .room { flex:0 0 auto; }' +
'  .rchips { flex:1 1 auto; min-width:0; display:flex; flex-wrap:wrap; gap:5px; justify-content:flex-end; }' +
'  .rchips .slot { display:inline-block; background:var(--card); border:1px solid var(--line);' +
'    border-radius:7px; padding:2px 8px; font-size:.82rem; font-variant-numeric:tabular-nums; }' +
'  .rchips .none { color:var(--real); font-size:.82rem; font-weight:700; }' +
'';
