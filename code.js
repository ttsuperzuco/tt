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
// CUR_WHO_ は doGet がリクエストごとにセットする「今の人」。メニュー↔各画面のリンクに &who= を
// 引き継がせ、移動しても本人(＝権限・ログ)が保たれるようにする（GAS実行はリクエスト毎に独立のため）。
var CUR_WHO_ = '';
function roleSfx_(staff, dev) {
  var s = staff ? '&staff=1' : (dev ? '&dev=1' : '');
  if (CUR_WHO_) s += '&who=' + encodeURIComponent(CUR_WHO_);
  return s;
}

// ★2026-07-11追加：Drive書込権限の承認を強制するテスト用関数。
//   エディタの実行ボタン横のプルダウンでこの関数(_authTest_)を選んで「実行」を押すと、
//   まだ承認していなければ「承認が必要です」ダイアログが出る→「権限を確認」→
//   Googleアカウントを選択→「許可」で完了（1回だけでよい）。
function authTestNow() {
  var f = getEventsFile_();
  f.setContent(f.getBlob().getDataAsString('UTF-8'));  // 中身は変えず書き込み権限だけ試す
  Logger.log('OK: Drive書込テスト成功');
}

// ★2026-07-11追加：events.jsonを事務所PCから直接受け取ってDriveへ書く（doPost）。
//   これまではPCがローカルに書いたファイルをWindowsの「Googleドライブ」アプリが裏で
//   拾ってアップロードするのを待つ方式で、数秒〜10分以上と読めなかった。GASはDriveApp経由で
//   直接Driveに書き込めるので、PCからそのままPOSTしてもらえば５〜10秒程度で確実に届く。
//   ペイロードが大きいのでGET(URL長制限)ではなくPOST bodyで受ける。EDIT_KEYで保護。
function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.action === 'push_events') {
    if (p.key !== EDIT_KEY) return _actionOut_({ ok: false, error: 'bad key' }, null);
    try {
      var body = (e.postData && e.postData.contents) || '';
      JSON.parse(body);  // 壊れたJSONを書き込まない安全弁
      getEventsFile_().setContent(body);
      return _actionOut_({ ok: true }, null);
    } catch (err) {
      return _actionOut_({ ok: false, error: String(err) }, null);
    }
  }
  // ★2026-07-16追加：自動監視の状態(monitor.json)を事務所PCから直接受け取ってDriveへ書く。
  //   push_events と同じ理由（Driveアプリの同期待ちは数秒〜10分以上と読めない＝監視画面は
  //   鮮度がいのちなので待てない）。事務所PCの export_monitor_super.py が1分ごとに送る。
  if (p.action === 'push_monitor') {
    if (p.key !== EDIT_KEY) return _actionOut_({ ok: false, error: 'bad key' }, null);
    try {
      var mbody = (e.postData && e.postData.contents) || '';
      JSON.parse(mbody);  // 壊れたJSONを書き込まない安全弁
      getMonitorFile_(true).setContent(mbody);
      return _actionOut_({ ok: true }, null);
    } catch (err2) {
      return _actionOut_({ ok: false, error: String(err2) }, null);
    }
  }
  // ★2026-07-17追加：ボタン表示設定(tile_settings.json)を事務所PCから直接受け取ってDriveへ書く。
  //   push_events / push_monitor と同じ理由。特にスマホ(自動監視→ボタン表示設定)から保存した時、
  //   Driveアプリの同期待ち（数十秒〜10分）だと「保存したのにアプリが変わらない」と見えるため。
  if (p.action === 'push_tiles') {
    if (p.key !== EDIT_KEY) return _actionOut_({ ok: false, error: 'bad key' }, null);
    try {
      var tbody = (e.postData && e.postData.contents) || '';
      JSON.parse(tbody);  // 壊れたJSONを書き込まない安全弁
      getTileSettingsFile_().setContent(tbody);
      return _actionOut_({ ok: true }, null);
    } catch (err3) {
      return _actionOut_({ ok: false, error: String(err3) }, null);
    }
  }
  return _actionOut_({ ok: false, error: 'unknown action' }, null);
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action) return handleAction_(p);   // 編集依頼の受付/取り出し/結果＋ログ/権限API（命令置き場API）
  var view = p.view || 'home';   // home（メニュー）／conflict（施術室被り）／lt（L⇔T予約照合）／akijikan（空き時間検索）
  var base = getBaseUrl_();
  // スタッフ版（?staff=1）＝名前を選ぶ・権限で出し分け。未指定＝社長(幹部)。?dev=1＝開発(全表示)。
  var staff = (p.staff === '1' || p.staff === 'true');
  var dev = !staff && (p.dev === '1' || p.dev === 'true');
  // 「今の人」＝スタッフが選んだ名前(who)。リンク引き継ぎ用にリクエストスコープの CUR_WHO_ にも入れる。
  var who = String(p.who || '').replace(/[^a-z]/g, '');
  var device = String(p.device || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
  CUR_WHO_ = staff ? who : '';
  // 権限（人ごと）。dev=全許可。無い/未選択は安全側＝施術被りだけ。
  var perms = getPerms_();
  var allow = personPerms_(perms, staff, dev, who);
  // 権限の無い画面へのdeep-linkはホームへ戻す。
  if (!viewAllowed_(view, allow)) view = 'home';
  // アクセスログ（①GAS直アクセス分。②静的アプリは action=hit で記録）。失敗してもページは出す。
  try { logAccess_(who, roleName_(staff, dev, who), device, view); } catch (ig) {}
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
  } else if (view === 'uriage') {
    title = '売上TimeTree転記';
    html = renderUriage_(base, staff, dev);
  } else if (view === 'unanswered') {
    title = 'LINE未回答＆返信待ち';
    html = renderUnanswered_(base, staff, dev);
  } else if (view === 'akijikan') {
    title = '空き時間検索';
    html = renderAkijikan_(base, staff, dev);
  } else if (view === 'kanshi') {
    title = '自動監視';
    html = renderKanshi_(base, staff, dev, device);   // ★登録した1台のスマホだけ（kanshiGate_）
  } else if (view === 'zenjitsu') {
    title = '前日お知らせ';
    var zd;                                             // ★開発URL(?dev=1)専用。事務所PCが作った確認画面(body_html)をそのまま出す
    try { zd = JSON.parse(getNoticeFile_().getBlob().getDataAsString('UTF-8')); }
    catch (ze) { zd = { error: String(ze) }; }
    html = renderZenjitsuPage_(zd, base, staff, dev);
  } else {
    title = staff ? 'TTスーパーズコ（スタッフ版）' : (dev ? 'TTスーパーズコ（開発版）' : 'TTスーパーズコ');
    html = renderHome_(base, staff, dev, who);
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
// callbackがあればJSONPで（②静的アプリの<script>タグ経由）、無ければ生JSONで返す
// （①のgoogle.script.run・gas_bridge.py等の既存呼び出し元との互換を保つ）。
function _actionOut_(obj, callback) {
  if (callback) {
    var cb = String(callback).replace(/[^A-Za-z0-9_$.]/g, '');
    return ContentService.createTextOutput(cb + '(' + JSON.stringify(obj) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return _jsonOut_(obj);
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

// akijikan.json のJSONP配信（読み取り専用・鍵不要）。事務所PCが export_akijikan_super.py で書き出す。
function _akijikanJsonp_(p) {
  var cb = String(p.callback || 'cb').replace(/[^A-Za-z0-9_$.]/g, '');
  var payload;
  try {
    payload = JSON.parse(getAkijikanFile_().getBlob().getDataAsString('UTF-8'));
  } catch (e) {
    payload = { error: String(e) };
  }
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(payload) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// monitor.json のJSONP配信（読み取り専用・鍵不要）。事務所PCが export_monitor_super.py で
// 1分ごとに書き出す＝自動監視（開発URLだけに出るボタン）の中身。
// ★中身は「どの自動プログラムが動いているか」の状態だけで、客の個人情報は一切入らない。
function _kanshiJsonp_(p) {
  var cb = String(p.callback || 'cb').replace(/[^A-Za-z0-9_$.]/g, '');
  var payload;
  var gate = kanshiGate_(p.device);      // ★この画面は登録した1台だけ（下の説明参照）
  if (!gate.ok) {
    payload = { error: gate.error, locked: true, groups: [] };
  } else {
    try {
      payload = JSON.parse(getMonitorFile_().getBlob().getDataAsString('UTF-8'));
    } catch (e) {
      payload = { error: String(e), groups: [] };
    }
  }
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(payload) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// ========== 自動監視画面は「登録した1台のスマホ」だけ（2026-07-17・ユーザー決定） ==========
// 【なぜ】この画面はスタッフのURL(?staff=1)の末尾を?dev=1に打ち替えるだけで開けてしまい、
//   開くこと自体には鍵が無かった。合言葉で操作だけ守っていたが、社長しか使わない画面なのに
//   毎回スタッフ用の合言葉を入れさせられるのはおかしい、という指摘。
// 【どうした】**最初に開いたスマホを持ち主として登録**し、以後そのスマホ以外は開くことも
//   操作することもできない（合言葉は一切不要になった）。名前選択の早い者勝ち(_claimJsonp_)と
//   同じ考え方。機種変時は事務所PCの「登録し直す」で解除→次に開いたスマホが新しい持ち主。
// 【置き場所】PropertiesService（tile_settings.json ではない）。理由＝あのファイルは事務所PCが
//   まるごと上書きする(push_tiles)ので、GASだけが書く値を置くと消える恐れがある。
// 【リセットの鍵】解除は EDIT_KEY(公開)だけでは通さない：**合言葉(staffPassword)を添えるか、
//   持ち主のスマホ自身**のどちらかが要る。EDIT_KEYは②の公開コードに載っている＝鍵にならず、
//   誰でも解除できると「解除→自分のスマホを登録」でいつでも乗っ取れてしまうため
//   （事務所PCは合言葉をファイルから読んで自動で添える＝人は何も入力しない）。
var KANSHI_DEV_PROP_ = 'KANSHI_DEVICE';

function kanshiOwner_() {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty(KANSHI_DEV_PROP_);
    var d = raw ? JSON.parse(raw) : null;
    return (d && d.device) ? d : null;
  } catch (e) { return null; }
}

/** この端末に見せてよいか。持ち主が居なければ、この端末を持ち主として登録する（早い者勝ち）。 */
function kanshiGate_(device) {
  device = String(device || '').trim();
  if (!device) {
    return { ok: false, error: 'スマホ用のURL（ttsuperzuco.github.io/tt/）から開いてください。' };
  }
  var lock = LockService.getScriptLock();
  try { lock.tryLock(10000); } catch (ig) {}
  try {
    var cur = kanshiOwner_();
    if (!cur) {
      PropertiesService.getScriptProperties().setProperty(KANSHI_DEV_PROP_,
        JSON.stringify({ device: device, at: new Date().toISOString() }));
      return { ok: true, claimed: true };
    }
    if (cur.device === device) return { ok: true };
    return { ok: false, error: 'この画面は、登録したスマホからだけ開けます。'
      + '（機種変した時は、事務所PCの自動監視で「登録し直す」を押してください）' };
  } finally {
    try { lock.releaseLock(); } catch (ig2) {}
  }
}

/** 持ち主の解除（事務所PC＝合言葉を自動で添える／持ち主のスマホ自身＝下取り前などに）。 */
function _kanshiDevResetJsonp_(p) {
  var cb = String(p.callback || 'cb').replace(/[^A-Za-z0-9_$.]/g, '');
  var out;
  if (!_pwRateOk_()) {
    out = { ok: false, error: '試行回数が多すぎます。少し待ってから試してください。' };
  } else {
    var cur = kanshiOwner_();
    var byPw = String(p.pw || '') === getStaffPassword_();
    var byOwner = !!(cur && cur.device && cur.device === String(p.device || '').trim());
    if (!byPw && !byOwner) {
      out = { ok: false, error: '解除できません（事務所PCか、いま登録中のスマホから押してください）。' };
    } else {
      PropertiesService.getScriptProperties().deleteProperty(KANSHI_DEV_PROP_);
      out = { ok: true, msg: '登録を解除しました。次に自動監視を開いたスマホが持ち主になります。' };
    }
  }
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(out) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/** いま誰が登録されているか（事務所PCが画面に出すために聞く。合言葉が要る＝外からは見えない）。 */
function _kanshiDevInfoJsonp_(p) {
  var cb = String(p.callback || 'cb').replace(/[^A-Za-z0-9_$.]/g, '');
  var out;
  if (!_pwRateOk_() || String(p.pw || '') !== getStaffPassword_()) {
    out = { ok: false, error: 'この情報は事務所PCからだけ見られます。' };
  } else {
    var cur = kanshiOwner_();
    out = { ok: true, device: cur ? cur.device : '', at: cur ? cur.at : '' };
  }
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(out) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// タイル(ボタン)表示ON/OFF設定のJSONP配信（読み取り専用・鍵不要）。
// 事務所PC「自動監視システム」の tile_settings.py が書き出す tile_settings.json を渡すだけ。
function _tileSettingsJsonp_(p) {
  var cb = String(p.callback || 'cb').replace(/[^A-Za-z0-9_$.]/g, '');
  // ★高速化：以前は tiles/perms/resets をそれぞれ getTileSettings_/getPerms_/getResets_ で
  //   取得しており、同じ tile_settings.json を Drive から3回読んでいた（実測 約2.7秒）。
  //   ここで1回だけ読み、純関数(_*FromCfg_)で3種を導く（＝被り画面の初期表示が速くなる）。
  var d = {};
  try { d = JSON.parse(getTileSettingsFile_().getBlob().getDataAsString('UTF-8')) || {}; } catch (ignore) { d = {}; }
  var payload = { tiles: _tilesFromCfg_(d), perms: _permsFromCfg_(d), people: _peopleFromCfg_(d),
                  labels: _labelsFromCfg_(d), resets: _resetsFromCfg_(d), claimed: _claimedFromCfg_(d),
                  order: _orderFromCfg_(d) };
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(payload) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
// 上の1回読み込み結果(d=tile_settings.jsonをパースした物)から各値を導く純関数（Drive不使用）。
function _tilesFromCfg_(d) {
  return (d && d.tiles && typeof d.tiles === 'object') ? d.tiles : DEFAULT_TILE_SETTINGS_;
}
function _permsFromCfg_(d) {
  var people = _peopleFromCfg_(d);
  var perms = defaultPerms_(people);
  var saved = d && d.perms;
  if (saved && typeof saved === 'object') {
    for (var i = 0; i < people.length; i++) {
      var pid = people[i];
      if (saved[pid] && typeof saved[pid] === 'object') {
        for (var t in perms[pid]) { if (t in saved[pid]) perms[pid][t] = !!saved[pid][t]; }
      }
    }
  }
  return perms;
}
function _resetsFromCfg_(d) {
  var r = d && d.resets;
  return (r && typeof r === 'object') ? r : {};
}
// ホーム画面のボタン並び順。保存値(d.order)を土台に、①知らないid（消えたボタン等）は捨て
// ②保存値に無い新しいid（新タイル追加直後で並び設定がまだ無い時）はデフォルト順の位置に足す。
// ＝並び設定を触っていなくても新タイルは必ずどこかに表示される（消えない）。
function _orderFromCfg_(d) {
  var known = {};
  for (var i = 0; i < DEFAULT_TILE_ORDER_.length; i++) known[DEFAULT_TILE_ORDER_[i]] = true;
  var saved = (d && Array.isArray(d.order)) ? d.order.filter(function (id) { return known[id]; }) : [];
  var seen = {};
  for (var j = 0; j < saved.length; j++) seen[saved[j]] = true;
  for (var k = 0; k < DEFAULT_TILE_ORDER_.length; k++) {
    var id = DEFAULT_TILE_ORDER_[k];
    if (!seen[id]) saved.push(id);
  }
  return saved;
}

// ========== スタッフ用URL(?staff=1)の入口合言葉（2026-07-16・簡易ゲート） ==========
// ★あくまで「知らない人が適当に開けない」程度の鍵。判定はここ(サーバー側)でだけ行い、
//   正解の合言葉そのものは②(公開コード)へは一切渡さない＝ok:true/falseだけ返す。
// 合言葉は tile_settings.json の staffPassword（自動監視メニュー4・tile_settings.py から変更可）。
var DEFAULT_STAFF_PASSWORD_ = 'ズコ';
function getStaffPassword_() {
  try {
    var file = getTileSettingsFile_();
    var d = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
    if (d && typeof d.staffPassword === 'string' && d.staffPassword) return d.staffPassword;
  } catch (ignore) {}
  return DEFAULT_STAFF_PASSWORD_;
}
// 総当たり抑止（直近60秒に10回を超えたら弾く）。PropertiesServiceに直近の試行時刻だけ持つ。
var PW_ATTEMPTS_PROP_ = 'PW_ATTEMPTS';
var PW_RATE_WINDOW_MS_ = 60000, PW_RATE_LIMIT_ = 10;
function _pwRateOk_() {
  var raw = PropertiesService.getScriptProperties().getProperty(PW_ATTEMPTS_PROP_);
  var arr = raw ? JSON.parse(raw) : [];
  var now = Date.now();
  arr = arr.filter(function (t) { return (now - t) < PW_RATE_WINDOW_MS_; });
  var ok = arr.length < PW_RATE_LIMIT_;
  arr.push(now);
  if (arr.length > 30) arr = arr.slice(arr.length - 30);
  PropertiesService.getScriptProperties().setProperty(PW_ATTEMPTS_PROP_, JSON.stringify(arr));
  return ok;
}
function _checkPwJsonp_(p) {
  var cb = String(p.callback || 'cb').replace(/[^A-Za-z0-9_$.]/g, '');
  var out;
  if (!_pwRateOk_()) {
    out = { ok: false, error: '試行回数が多すぎます。少し待ってから試してください。' };
  } else {
    out = { ok: String(p.pw || '') === getStaffPassword_() };
  }
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(out) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// ========== 部屋移動の依頼の安全弁（②静的アプリ経由でEDIT_KEYが公開されるため必須） ==========
// ①移動先が実在の施術部屋(ROOMS_)か ②その予定が「今まさに被り検出に出ている」か
// ③直近に依頼が集中していないか、をサーバー側で必ず確認してからキューに積む。
// google.script.run経由(①直リンク)・JSONP経由(②静的アプリ)のどちらから来ても同じ関門を通す。
function _validRoom_(toCal, toLabel) {
  for (var name in ROOMS_) {
    var r = ROOMS_[name];
    if (String(r.cal) === String(toCal) && String(r.label) === String(toLabel)) return true;
  }
  return false;
}
function _isCurrentConflict_(cal, eventId) {
  try {
    var file = getEventsFile_();
    var d = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
    var res = detect(d.events, true, d.date_from);   // with_nail=trueで両方の判定を包含
    var conflicts = res.conflicts || [];
    for (var i = 0; i < conflicts.length; i++) {
      var c = conflicts[i];
      if ((String(c.a_cal_id) === String(cal) && c.a_event_id === eventId) ||
          (String(c.b_cal_id) === String(cal) && c.b_event_id === eventId)) return true;
    }
  } catch (e) { /* 取得失敗時は安全側＝不許可のまま */ }
  return false;
}
var RATE_WINDOW_MS_ = 60000, RATE_LIMIT_ = 5;   // 直近60秒に5件を超えたら弾く（大量送信の抑止）
function _rateOk_(q) {
  var now = Date.now();
  var recent = q.filter(function (c) {
    var t = Date.parse(c.ts || '');
    return !isNaN(t) && (now - t) < RATE_WINDOW_MS_;
  });
  return recent.length < RATE_LIMIT_;
}
// ========== 自動監視の操作（ON/OFF・今すぐ実行）の安全弁（2026-07-16追加） ==========
// ★なぜ厳重にするか：②静的アプリ(GitHub上に公開)に EDIT_KEY が埋め込まれている＝鍵は誰でも
//   読める。自動監視の操作をそのまま公開すると、URLを知った誰かが全自動プログラムを止められる。
//   そこで「スタッフ用URLの入口合言葉」と同じ仕組みをもう一段の関門として使う（合言葉の正解値は
//   サーバー(ここ)から一切出さない＝②の公開コードに載らない）。合言葉は自動監視メニュー4で変更可。
// ★さらに、触ってよい項目(key)をここのホワイトリストで固定する。事務所PC側(monitor_ctl.apply)でも
//   同じ確認を必ずもう一度行う（鍵が公開されている前提の二重の関門）。
// ★2026-07-17：お金・電源・データ復元（PotCoin解錠／PC自動スリープ・起床／復元コピー）も
//   ここに入れた（ユーザー指示＝PC画面で押せる物はApp版でも全部押せるようにする）。
//   誤タップ対策は「見せない」ではなく「押す前に確認文を出す」方式に変更した
//   （確認文は事務所PCが monitor.json の row.confirm で配る＝PC側が唯一の出どころ）。
//   ★事務所PC側(monitor_ctl.apply)でも key と「その項目に許した操作(acts)」を再確認する。
var KANSHI_CTL_KEYS_ = [
  'db_backup', 'db_backup_full', 'course_counts', 'program_backup',
  'line_stats_timetree_check', 'ripihoryu_auto',
  'line_prefetch', 'timetree_prefetch', 'edit_worker_watchdog',
  'lt_match', 'lt_miss_watch', 'sales_timetree_transfer',
  'line_shinki_watch', 'line_yoyaku_kakutei',
  'edit_worker', 'conflict_watcher', 'super_link',
  // 必要時に実行（2026-07-17追加）
  'travel_group', 'power_schedule', 'idle_guard', 'potcoin_stake', 'restore',
  // その他の設定
  'tile_settings',   // スーパーズコApp ボタン表示設定（人ごと表示・並び順・合言葉・追加・選び直し）
  'lt_auto_verify',  // その他の設定：L⇔T予約照合 全自動AI判定（2026-07-16・PC/App同一ルールで追加）
  'ai_usage_record', // その他の設定：自動AIコスト計算（帳簿）のON/OFF（2026-07-17追加）
  'stale_cleanup',   // その他の設定：固まった残骸の掃除（2026-07-17追加）
  'kanshi_device'    // その他の設定：監視画面を使えるスマホの登録し直し（2026-07-17追加）
];
var KANSHI_CTL_ACTS_ = ['on', 'off', 'run', 'setval'];
function _validKanshiCtl_(key, act) {
  return KANSHI_CTL_KEYS_.indexOf(String(key)) >= 0 && KANSHI_CTL_ACTS_.indexOf(String(act)) >= 0;
}

// キューへ積む共通処理（handleAction_のaction=submitと、uiSubmitMoveの両方から呼ぶ）。
function _submitToQueue_(q, op, fields) {
  if (op === 'kanshi_ctl') {
    if (!_rateOk_(q)) return { ok: false, error: '依頼が集中しています。少し待ってから試してください。' };
    // ★2026-07-17：関門を「合言葉」から「登録した1台のスマホ」へ入れ替えた（kanshiGate_ の説明参照）。
    //   画面を開けているのは持ち主だけなので、ここは登録済みか(=同じ端末か)の確認だけでよい
    //   ＝社長は何も入力しない。持ち主が未登録（解除直後）の状態では操作させない
    //   （画面を開く＝kanshiGate_ が先に登録するので、通常この分岐には来ない）。
    var owner = kanshiOwner_();
    if (!owner || !owner.device || owner.device !== String(fields.device || '').trim()) {
      return { ok: false, error: 'このスマホは登録されていません。' };
    }
    if (!_validKanshiCtl_(fields.ctl_key, fields.ctl_act)) {
      return { ok: false, error: 'この項目は外からは操作できません。' };
    }
    var kid = 'k' + Date.now() + Math.floor(Math.random() * 1000);
    q.push({ id: kid, ts: new Date().toISOString(), op: op,
      ctl_key: String(fields.ctl_key), ctl_act: String(fields.ctl_act),
      ctl_val: String(fields.ctl_val || ''),
      who: fields.who || '', role: fields.role || '', device: fields.device || '',
      status: 'pending', result: '' });
    _queueSet_(q);
    return { ok: true, id: kid };
  }
  if (op === 'movecal') {
    if (!_rateOk_(q)) return { ok: false, error: '依頼が集中しています。少し待ってから試してください。' };
    if (!_validRoom_(fields.to_cal, fields.to_label)) return { ok: false, error: '移動先が不正です。' };
    if (!_isCurrentConflict_(fields.cal, fields.event)) {
      return { ok: false, error: 'この予定は現在、被り検出に出ていません。画面を更新してからもう一度お試しください。' };
    }
  } else if (!_rateOk_(q)) {
    return { ok: false, error: '依頼が集中しています。少し待ってから試してください。' };
  }
  var id = 'c' + Date.now() + Math.floor(Math.random() * 1000);
  q.push({ id: id, ts: new Date().toISOString(), op: op,
    cal: fields.cal, event: fields.event, to_cal: fields.to_cal, to_label: fields.to_label,
    room: fields.room || '', title: fields.title || '', from_room: fields.from_room || '',
    who: fields.who || '', role: fields.role || '', device: fields.device || '',
    status: 'pending', result: '' });
  _queueSet_(q);
  return { ok: true, id: id };
}

function handleAction_(p) {
  if (p.action === 'events') return _eventsJsonp_(p);
  if (p.action === 'lt') return _ltJsonp_(p);
  if (p.action === 'uriage') return _uriageJsonp_(p);
  if (p.action === 'unanswered') return _unansweredJsonp_(p);
  if (p.action === 'akijikan') return _akijikanJsonp_(p);
  if (p.action === 'kanshi') return _kanshiJsonp_(p);
  if (p.action === 'kanshi_devreset') return _kanshiDevResetJsonp_(p);
  if (p.action === 'kanshi_devinfo') return _kanshiDevInfoJsonp_(p);
  if (p.action === 'tilesettings') return _tileSettingsJsonp_(p);
  if (p.action === 'checkpw') return _checkPwJsonp_(p);
  if (p.action === 'claim') return _claimJsonp_(p);
  if (p.action === 'hit') {   // アクセスログ（②静的アプリが画面表示ごとに叩く・鍵不要・軽量）
    try {
      logAccess_(String(p.who || '').replace(/[^a-z]/g, ''), String(p.role || ''),
                 String(p.device || '').slice(0, 40), String(p.view || '').slice(0, 20));
    } catch (e) {}
    return _actionOut_({ ok: true }, p.callback);
  }
  if (p.key !== EDIT_KEY) return _actionOut_({ ok: false, error: 'bad key' }, p.callback);
  var lock = LockService.getScriptLock();
  try { lock.tryLock(10000); } catch (ig) {}
  var out;
  try {
    var q = _queueGet_();
    if (p.action === 'submit') {
      out = _submitToQueue_(q, p.op || 'movecal', {
        cal: p.cal, event: p.event, to_cal: p.to_cal, to_label: Number(p.to_label),
        room: p.room || '', title: p.title || '', from_room: p.from_room || '',
        // 自動監視の操作(op=kanshi_ctl)用。合言葉(pw)はここ(サーバー)で照合するだけで外へは出さない。
        pw: p.pw || '', ctl_key: p.ctl_key || '', ctl_act: p.ctl_act || '', ctl_val: p.ctl_val || '',
        who: String(p.who || '').replace(/[^a-z]/g, ''), role: p.role || '', device: p.device || ''
      });
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
    } else if (p.action === 'drainlog') {   // 事務所PCがアクセスログを回収→DBへ（回収後クリア）
      var propsL = PropertiesService.getScriptProperties();
      var rawL = propsL.getProperty(ACCESS_LOG_PROP_);
      var arrL = rawL ? JSON.parse(rawL) : [];
      propsL.deleteProperty(ACCESS_LOG_PROP_);
      out = { ok: true, access: arrL };
    } else {
      out = { ok: false, error: 'unknown action' };
    }
  } finally {
    try { lock.releaseLock(); } catch (ig2) {}
  }
  return _actionOut_(out, p.callback);
}

// ========== スマホUIから直接呼ぶ（google.script.run）＝①直リンク限定・同オリジン ==========
// 命令置き場は handleAction_ と同じ QUEUE_PROP を共用。事務所PCの edit_worker が
// ?action=pending でこの依頼を拾い、move_calendar 実行後 ?action=report で結果を書く。
// スマホ側はここ(uiStatus)で done/error を見に行く。
// ★②静的アプリはgoogle.script.runが使えないため、同じ安全弁(_submitToQueue_)を通る
//   action=submit（JSONP）経由でこの関数と同じキューに積む（MOVESCRIPT_のsubmitMove_参照）。
function uiSubmitMove(cal, event, toCal, toLabel, room, title, who, device, fromRoom) {
  var lock = LockService.getScriptLock();
  try { lock.tryLock(10000); } catch (ig) {}
  try {
    var q = _queueGet_();
    return _submitToQueue_(q, 'movecal', {
      cal: cal, event: event, to_cal: toCal, to_label: Number(toLabel), room: room, title: title,
      from_room: fromRoom || '', who: String(who || '').replace(/[^a-z]/g, ''), role: '', device: device || ''
    });
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
  return 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
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

/** akijikan.json のファイルを取得（空き時間検索の表示。
 *  事務所PCが export_akijikan_super.py で書き出す）。 */
var AKIJIKAN_FILENAME = 'akijikan.json';
function getAkijikanFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('AKIJIKAN_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (ignore) { /* IDが古い→探し直す */ }
  }
  var it = DriveApp.getFilesByName(AKIJIKAN_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) {
    throw new Error('akijikan.json がドライブに見つかりません。事務所PCで export_akijikan_super.py を実行し、Googleドライブの同期を待ってください。');
  }
  props.setProperty('AKIJIKAN_FILE_ID', newest.getId());
  return newest;
}

/** monitor.json のファイルを取得（自動監視の状態。事務所PCが export_monitor_super.py で
 *  1分ごとに書き出す＋doPost(push_monitor)で直接送ってくる）。
 *  createIfMissing=true の時だけ、無ければ events.json と同じフォルダに作る
 *  （＝初回のpushでいきなり書けるように。読み取り(_kanshiJsonp_)側は作らず素直に失敗させる）。 */
var MONITOR_FILENAME = 'monitor.json';
function getMonitorFile_(createIfMissing) {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('MONITOR_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (ignore) { /* IDが古い→探し直す */ }
  }
  var it = DriveApp.getFilesByName(MONITOR_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest && createIfMissing) {
    var parents = getEventsFile_().getParents();
    var folder = parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
    newest = folder.createFile(MONITOR_FILENAME, '{}', 'application/json');
  }
  if (!newest) {
    throw new Error('monitor.json がドライブに見つかりません。事務所PCで export_monitor_super.py を実行してください。');
  }
  props.setProperty('MONITOR_FILE_ID', newest.getId());
  return newest;
}

/** tile_settings.json のファイルを取得（ホーム画面ボタンの表示ON/OFF設定。
 *  事務所PC「自動監視システム」の tile_settings.py が書き出す）。 */
var TILE_SETTINGS_FILENAME = 'tile_settings.json';
// ★他ファイル(events.json等)と違い、この設定ファイルはID固定キャッシュにしない＝
//   毎回 名前検索→最新の1件、で必ず取る（2026-07-16：IDキャッシュだと万一Drive側に
//   同名の別ファイルができた時、古い方のIDを固定で読み続け「保存したのに反映されない」
//   事故になりうると判明。ボタン表示・端末リセットは正しさが最優先＝多少の速度より安全側）。
function getTileSettingsFile_() {
  var it = DriveApp.getFilesByName(TILE_SETTINGS_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) throw new Error('tile_settings.json 未生成');
  return newest;
}

// tile_settings.json が無い/壊れている時のデフォルト＝現状の挙動と同じ（売上だけスタッフに非表示）。
// ★新しいボタン(タイル)を足す時は、下のTILE_DEFS_と両方に1件ずつ追記する（idを一致させる）。
var DEFAULT_TILE_SETTINGS_ = {
  conflict:   { exec: true, staff: true },
  lt:         { exec: true, staff: true },
  uriage:     { exec: true, staff: false },
  unanswered: { exec: true, staff: true },
  akijikan:   { exec: false, staff: false },  // ★初期は開発URL(?dev=1)だけで見える（2026-07-16ユーザー指定）
  links:      { exec: true, staff: true },    // ★各種LINK＝お客様へのLINE送信で全員が使うため初期から全員に見える（2026-07-18）
  ttapp:      { exec: true, staff: true },     // ★元祖TTアプリ＝以前のalways:trueと同じ「全員に見える」を初期値として維持
  // ★kanshi(自動監視)＝開発URL(?dev=1)専用。tile_settings.py の TILES にも入れない＝
  //   人ごとの権限画面に出てこない＝誰にもONにできない＝開発URLだけに出る（2026-07-16ユーザー指定）。
  kanshi:     { exec: false, staff: false },
  // ★前日お知らせ＝社長確認用。kanshiと同じく開発URL(?dev=1)専用（tile_settings.py にも入れない）。
  zenjitsu:   { exec: false, staff: false },
  rireki:     { exec: true, staff: true }    // ★顧客履歴検索＝全員に見せる（スタッフの日常業務）
};

// ホーム画面のボタン並び順のデフォルト（tile_settings.json に order が無い時）。
// tile_settings.py の「ボタンの並びをかえれる」設定画面（2026-07-16追加）で変更できる。
var DEFAULT_TILE_ORDER_ = ['conflict', 'lt', 'uriage', 'unanswered', 'akijikan', 'links', 'ttapp', 'rireki', 'kanshi', 'zenjitsu'];

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

// ========== 人ごとの権限（誰にどのボタンを見せるか）＝ tile_settings.py と一致 ==========
// 人ID（tile_settings.py の PEOPLE と順番・IDを一致させること）。kanbu=社長, reception=お店受付。
var PEOPLE_ = ['kanbu', 'ringo', 'mikan', 'olive', 'marron', 'mango', 'coconut', 'reception'];
// 表示名（アプリの名前選択・ログで使う。絵文字つき）。
var PERSON_LABEL_ = {
  kanbu: '社長', ringo: '🍎りんご', mikan: '🍊みかん', olive: '🫒オリーブ',
  marron: '🌰マロン', mango: '🥭マンゴー', coconut: '🥥ココナッツ', reception: 'お店受付'
};
// 初期権限＝全員「施術室被り(conflict)」だけON（tile_settings.py DEFAULT と一致）。
// peopleを省略した時は base8(PEOPLE_)のみ＝壊れた時の最終フォールバック用。
function defaultPerms_(people) {
  var list = people || PEOPLE_;
  var perms = {};
  for (var i = 0; i < list.length; i++) {
    perms[list[i]] = { conflict: true, lt: false, uriage: false, unanswered: false, akijikan: false, links: true, ttapp: true, rireki: true, kanshi: false };
  }
  return perms;
}
// ========== 自動監視メニュー4で追加した「追加スタッフ」＝base8(PEOPLE_)に追記するだけ ==========
// tile_settings.json の extraPeople:[{id,label}] を読み、base8に無い人だけ足す。
// ★base8自体は書き換えない＝この仕組みが壊れてもbase8(既存スタッフ)は必ず動く設計。
function _peopleFromCfg_(d) {
  var ids = PEOPLE_.slice();
  var extra = (d && d.extraPeople && d.extraPeople.length) ? d.extraPeople : [];
  for (var i = 0; i < extra.length; i++) {
    if (extra[i] && extra[i].id && ids.indexOf(extra[i].id) < 0) ids.push(extra[i].id);
  }
  return ids;
}
function _labelsFromCfg_(d) {
  var labels = {};
  for (var k in PERSON_LABEL_) labels[k] = PERSON_LABEL_[k];
  var extra = (d && d.extraPeople && d.extraPeople.length) ? d.extraPeople : [];
  for (var i = 0; i < extra.length; i++) {
    if (extra[i] && extra[i].id) labels[extra[i].id] = extra[i].label || extra[i].id;
  }
  return labels;
}
// 誰がどの人(pid)を選択済みか＝{pid:{device,label,at}}。一度誰かが選んだ人は他端末から選べなくする
// （2026-07-16・重複選択防止）。実際の防止はサーバー側の_claimJsonp_のみ、これは読み取り専用。
function _claimedFromCfg_(d) {
  var c = d && d.claimed;
  return (c && typeof c === 'object') ? c : {};
}
// 「はい、私です」を押した端末が、その人(pid)を早い者勝ちで押さえる（書込あり・鍵不要＝read/write
// 両方とも公開度は名前選択そのものと同じ）。同じ端末が読み直した時は自分の占有として通す(idempotent)。
// ロックは①LockServiceで直近読み書きの競合を防ぐ②tile_settings.jsonへ直接書く(TimeTree/LINEでは
// ないためEDIT_KEY命令置き場は不要＝events.jsonのpush_events(doPost)と同じ「Drive直書き」枠)。
function _claimJsonp_(p) {
  var cb = String(p.callback || 'cb').replace(/[^A-Za-z0-9_$.]/g, '');
  var out;
  var lock = LockService.getScriptLock();
  try { lock.tryLock(10000); } catch (ig) {}
  try {
    var pid = String(p.pid || '').trim();
    var device = String(p.device || '').trim();
    if (!pid || !device) {
      out = { ok: false, error: '不正な要求です' };
    } else {
      var file = getTileSettingsFile_();
      var d = JSON.parse(file.getBlob().getDataAsString('UTF-8')) || {};
      var claimed = (d.claimed && typeof d.claimed === 'object') ? d.claimed : {};
      var cur = claimed[pid];
      if (cur && cur.device && cur.device !== device) {
        out = { ok: false, error: 'すでに他の人が選んでいます。画面を読み直してから選び直してください。' };
      } else {
        claimed[pid] = { device: device, label: String(p.label || ''), at: Date.now() };
        d.claimed = claimed;
        file.setContent(JSON.stringify(d));
        out = { ok: true };
      }
    }
  } catch (e) {
    out = { ok: false, error: String(e) };
  } finally {
    try { lock.releaseLock(); } catch (ig) {}
  }
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(out) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
// tile_settings.json の perms を読む（無ければ／壊れていれば初期値）。①GAS専用＝DriveApp。
function getPerms_() {
  try {
    var file = getTileSettingsFile_();
    var d = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
    return _permsFromCfg_(d);
  } catch (ignore) {
    return defaultPerms_();
  }
}
// 端末リセットの合図（人ID or 'all' → エポックms）。この時刻より前に名前を選んだ端末は選び直し。
// tile_settings.py（自動監視メニュー4）から書かれる。②アプリが起動時に自分の pick 時刻と比べて判定。
function getResets_() {
  try {
    var file = getTileSettingsFile_();
    var d = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
    var r = d && d.resets;
    return (r && typeof r === 'object') ? r : {};
  } catch (ignore) { return {}; }
}
// 役割から「その人の権限オブジェクト」を返す。dev=全許可(null)。staff=who本人。無印=社長(kanbu)。
// 不明な人(whoが空/未登録/未知のpid)は安全側＝施術被りだけ（permsに無ければ自動でこの安全側になる
// ＝追加スタッフ(extraPeople)かどうかを判定する必要が無い＝base8限定のホワイトリストは撤去済み）。
function personPerms_(perms, staff, dev, who) {
  if (dev) return null;   // null = すべて許可
  var pid = staff ? String(who || '') : 'kanbu';
  return (perms && perms[pid]) || { conflict: true, lt: false, uriage: false, unanswered: false, akijikan: false, links: false, rireki: true, kanshi: false };
}
// そのviewを見る権限があるか（home/notice は常に可）。allow=null(dev)は常に可。
function viewAllowed_(view, allow) {
  if (view === 'home' || view === 'notice') return true;
  if (!allow) return true;   // dev
  return allow[view] === true;
}

// ========== ログ（アクセス＝画面表示 / 操作＝書込） ==========
// 外部スコープ(スプレッドシート書込等)を増やさないため、GASは一旦Propertiesに貯めるだけにし、
// 事務所PCが action=drainlog で回収して shared_store.sqlite へ移す（GASは drive.readonly のまま）。
// 操作ログ（誰がどのデータをどう変えたか）は who を積んだキュー項目を edit_worker が実行時にDBへ記録する。
var ACCESS_LOG_PROP_ = 'ACCESS_LOG';
function roleName_(staff, dev, who, labels) {
  if (dev) return '開発';
  if (!staff) return '社長(幹部)';
  var L = labels || PERSON_LABEL_;
  return L[who] || ('スタッフ(' + (who || '未選択') + ')');
}
function logAccess_(who, role, device, view) {
  var props = PropertiesService.getScriptProperties();
  var raw = props.getProperty(ACCESS_LOG_PROP_);
  var arr = raw ? JSON.parse(raw) : [];
  arr.push({ ts: new Date().toISOString(), who: who || '', role: role || '',
             device: device || '', view: view || '' });
  if (arr.length > 300) arr = arr.slice(arr.length - 300);   // 回収前でも上限で守る
  props.setProperty(ACCESS_LOG_PROP_, JSON.stringify(arr));
}

// ---- 表示（room_conflict_detect.py の render_html を移植。並び・色を一致させる）----

var CIRCLED = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫','⑬','⑭','⑮','⑯','⑰','⑱','⑲','⑳'];
function circled_(n) { return (n >= 1 && n <= CIRCLED.length) ? CIRCLED[n - 1] : (n + '.'); }

// ★部屋の色＝TimeTree本体が実際に使っている色（2026-07-17ユーザー決定：「みんなタイムツリーでの
//   色に慣れてる」。それまでは自作の配色だった）。見栄えで勝手に決め直さないこと。
// ★唯一の置き場は 共通\room_colors.py。ここはその「写し」＝Apps ScriptからPythonを読めないため
//   同じ値を持つしかない。★色を変える時は必ず両方直す（片方だけ直さない＝共通ルール）。
//   出どころ：TimeTreeのAPI(/api/v1/calendar/<id>/labels)のcolor。取り直しは ラベル一覧確認.py。
function roomColor_(room) {
  var p = { 'FREEDOM': '#2ecc87', 'COSMOS': '#3dc2c8', 'HAPPY': '#e73b3b',
            'LUCKY': '#fdc02d', 'STAR/福/🇫🇷': '#b38bdc' };
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
// ★COSMOSは部屋移動の候補ボタン・空き部屋状況パネルに出さない（ユーザー指定の恒久ルール）。
//   COSMOSは新規カウンセリング専用の部屋で、施術室被りの移動先候補にはならないため。
//   ROOMS_（カレンダー/ラベルの対応表）自体はCOSMOSを残す（他機能が参照する可能性への配慮）。
var ROOM_ORDER_ = ['FREEDOM', 'HAPPY', 'LUCKY', 'STAR/福/🇫🇷'];

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
function moveRow_(cal, event, who, title, curRoom, roomBusyForDate, timeStr, whoShort) {
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
      ' data-room="' + esc_(name) + '" data-title="' + esc_(title) + '"' +
      ' data-who="' + esc_(who) + '" data-fromroom="' + esc_(curRoom) + '"' +
      ' data-whoshort="' + esc_(whoShort || who) + '"' +   // 確認ポップアップ用＝通し番号を抜いた「🍊 名前様」
      ' data-time="' + esc_(timeStr || '') + '"' +
      ' data-fromcolor="' + roomColor_(curRoom) + '" data-fromshort="' + esc_(shortRoomName_(curRoom)) + '"' +
      ' data-toshort="' + esc_(shortRoomName_(name)) + '"' +   // 確認ポップアップの色付きマーク用（部屋名の色・短縮名は他の一覧と統一）
      ' style="--rc:' + roomColor_(name) + '">' + esc_(name) + '</button>';
  }
  var note = !hasId ? '<span class="mvng">IDが取れず移動不可</span>'
    : (!anyFree ? '<span class="mvng">その時間、空いている部屋がありません</span>' : '');
  return '<div class="mvrow">' +
    '<div class="mvlabel fit1line">移動先の部屋を選んでね(下のボタンを押す）</div>' +
    '<div class="mvhint fit1line">※空いている施術室のみ表示しています</div>' +
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
  return '<div class="rspanel" hidden><div class="rstitle">' + esc_(jpMonthDay_(date)) + 'の空いてる時間帯</div>' + rows + '</div>';
}

function esc_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// お知らせに書く「コース第N次」（来店回数とは別・体験オフセット適用済み。共有DBの
// reservation_course_count 由来。夜間バッチがお知らせの build_one で算出）を、events.jsonの
// payload.course_counts から event_id で引いて表示する。要確認/未算出は⚠️（[[project_course_count_unified]]）。
// "2026-07-19" → "7月19日(日)"（曜日は現地の年月日で計算＝タイムゾーンずれ対策でnew Date(y,m-1,d)を使う）。
function jpDateWeekday_(iso) {
  var p = String(iso || '').split('-').map(Number);
  if (p.length !== 3 || !p[0]) return String(iso || '');
  var w = ['日', '月', '火', '水', '木', '金', '土'][new Date(p[0], p[1] - 1, p[2]).getDay()];
  return p[1] + '月' + p[2] + '日(' + w + ')';
}
// "2026-07-19" → "7月19日"（曜日なし・空き部屋状況タイトル用）。
function jpMonthDay_(iso) {
  var p = String(iso || '').split('-').map(Number);
  if (p.length !== 3 || !p[0]) return String(iso || '');
  return p[1] + '月' + p[2] + '日';
}

function renderPage_(conflicts, meta, payload, withNail, base, staff, dev) {
  var real = conflicts.length;
  function menu_(m) {
    m = (m || '').trim();
    if (!m) return '';
    var items = m.split('／').filter(function (s) { return s.trim(); })
      .map(function (s) { return '<li>' + esc_(s.trim()) + '</li>'; }).join('');
    // ★施術内容の左に縦書きの見出しマーク（薄い色の縦長楕円）を添える（2026-07-16ユーザー要望）。
    return '<div class="menuwrap"><span class="menutag">施術内容</span>' +
      '<ul class="menu">' + items + '</ul></div>';
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
          '<div class="cline">' +
            '<div class="clineDate fit1line">' + esc_(jpDateWeekday_(x.date)) + ' ' + esc_(x.overlap_time) + '</div>' +
            '<div class="clineRoom fit1line">' +
              '<span class="room" style="--rc:' + rc + '">' + esc_(x.room) + '</span>' +
              ' に以下の二つの予約が入ってます' +
            '</div>' +
          '</div>' +
          (x.dup_suspect ? '<span class="dup">⚠️同一人物の疑い(二重入力?)</span>' : '') +
        '</header>' +
        '<div class="pair">' +
          '<div class="side">' +
            '<div class="time"><span class="ab">' + esc_(x.a_staff || 'A') + '</span>' + esc_(x.a_time) + '</div>' +
            '<div class="who">' +
              '<span class="code">' + esc_(x.a_code) + '</span>' +
              '<span class="name">' + esc_(x.a_name) + '</span></div>' +
            menu_(x.a_menu) +
          '</div>' +
          '<div class="vs"></div>' +
          '<div class="side">' +
            '<div class="time"><span class="ab">' + esc_(x.b_staff || 'B') + '</span>' + esc_(x.b_time) + '</div>' +
            '<div class="who">' +
              '<span class="code">' + esc_(x.b_code) + '</span>' +
              '<span class="name">' + esc_(x.b_name) + '</span></div>' +
            menu_(x.b_menu) +
          '</div>' +
        '</div>' +
        '<div class="mv" data-room="' + esc_(x.room) + '">' +
          '<div class="mvtoprow">' +
            '<button type="button" class="mvtoggle" data-side="A">この予約の<br>部屋を移動</button>' +
            '<button type="button" class="mvtoggle" data-side="B">この予約の<br>部屋を移動</button>' +
          '</div>' +
          '<div class="mvpanel" data-side="A" hidden>' +
            moveRow_(x.a_cal_id, x.a_event_id, [x.a_staff, x.a_code, x.a_name].filter(Boolean).join(' '), x.a_title, x.room, roomBusyForDate, x.a_time,
                     [x.a_staff, x.a_name].filter(Boolean).join(' ')) +
            '<button type="button" class="rstoggle fit1line">📋 念のため、この日の部屋状況を見る</button>' +
            roomStatusPanel_(x.date, roomBusyForDate) +
          '</div>' +
          '<div class="mvpanel" data-side="B" hidden>' +
            moveRow_(x.b_cal_id, x.b_event_id, [x.b_staff, x.b_code, x.b_name].filter(Boolean).join(' '), x.b_title, x.room, roomBusyForDate, x.b_time,
                     [x.b_staff, x.b_name].filter(Boolean).join(' ')) +
            '<button type="button" class="rstoggle fit1line">📋 念のため、この日の部屋状況を見る</button>' +
            roomStatusPanel_(x.date, roomBusyForDate) +
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
  '<h1 class="fit1line">⚠️ 施術室被り検出 <span class="cnt">' + real + '件</span>' + nailNote + '</h1>' +
  cards +
'</div>' +
identScript_(staff, dev) + TTSCRIPT_ + MOVESCRIPT_ + FIT1LINE_SCRIPT_;
}

// ①GAS直アクセス時の操作者識別子をページに注入（②静的アプリは localStorage の値が優先される）。
// これで①でスタッフURL(?who=)から部屋移動しても、その who が操作ログに残る。
function identScript_(staff, dev) {
  var who = CUR_WHO_ || '';
  var role = roleName_(staff, dev, who);
  return '<scr' + 'ipt>window.__SZ_WHO_=' + JSON.stringify(who) +
         ';window.__SZ_ROLE_=' + JSON.stringify(role) +
         ';window.__SZ_DEVICE_="";</scr' + 'ipt>';
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
// ★ラベルの\nは狙った位置での改行（大きい文字で2行に収めるため・2026-07-16ユーザー指定）。
//   esc_()は\nをエスケープしないので、.tname(white-space:pre-line)でそのまま改行になる。
var TILE_DEFS_ = [
  { id: 'conflict', cls: 'conflict', view: 'conflict',
    icon: '<span class="ticon">🛏️</span>', label: '施術室\n被り検出' },
  { id: 'lt', cls: 'lt', view: 'lt',
    icon: '<span class="ticon"><span class="lt2">' + LINE_LOGO_ + TT_LOGO_ + '</span></span>', label: 'L⇔T\n予約照合' },
  { id: 'uriage', cls: 'uriage', view: 'uriage',
    icon: '<span class="ticon">💰</span>', label: '売上転記\nTimeTree' },
  { id: 'unanswered', cls: 'unanswered', view: 'unanswered',
    icon: '<span class="ticon">💬</span>', label: 'LINE未回答\n＆返信待ち' },
  { id: 'akijikan', cls: 'akijikan', view: 'akijikan',
    icon: '<span class="ticon">🕑</span>', label: '空き時間\n検索' },
  { id: 'links', cls: 'links', view: 'links',
    icon: '<span class="ticon">🔗</span>', label: '各種\nLINK' },
  // ★元祖TTアプリ＝外部サイトへのリンクだけのボタン（GAS内のviewではない）。
  //   2026-07-16：他のボタンと同じく人ごとのON/OFF対象に変更（以前はalways:trueで常時表示
  //   固定だったが、ユーザー要望で「人ごとに見せる/見せない」を選べるようにした。初期値は
  //   全員ON＝これまでの「常に表示」と見た目上は変わらない。tile_settings.py の TILES にも追加済み）。
  { id: 'ttapp', cls: 'ttapp', url: 'https://x.gd/eaxgF',
    icon: '<span class="ticon">🗓️</span>', label: '元祖TT\nアプリ' },
  // ★自動監視＝開発URL(?dev=1)専用（DEFAULT_TILE_SETTINGS_のコメント参照）。
  { id: 'kanshi', cls: 'kanshi', view: 'kanshi',
    icon: '<span class="ticon">📟</span>', label: '自動監視\n（開発用）' },
  // ★前日お知らせ＝社長確認用の内部ツール。開発URL(?dev=1)専用（PC版と並びをそろえる・2026-07-19）。
  //   実際の確認作業は事務所PCで動くので、この画面は要点と案内だけ（renderZenjitsuPage_）。
  { id: 'zenjitsu', cls: 'zenjitsu', view: 'zenjitsu',
    icon: '<span class="ticon">🔔</span>', label: '前日\nお知らせ' },
  // ★顧客履歴検索＝番号/氏名で客を探し、今回の予約と過去予約(メモ込み)を見る。事務所PCが検索
  //   （op=cust_search）＝日中(事務所PC稼働中)に使える。PC版スーパーズコと並びをそろえる(2026-07-19)。
  { id: 'rireki', cls: 'rireki', view: 'rireki',
    icon: '<span class="ticon">🔎</span>', label: '顧客履歴\n検索' }
];

/** ①GAS直アクセス専用のホーム画面ラッパ。tile_settings.json(Drive)を1回だけ読んで
 *  perms/labels(追加スタッフ込み)を renderHomePage_ に渡す。 */
function renderHome_(base, staff, dev, who) {
  var d = {};
  try { d = JSON.parse(getTileSettingsFile_().getBlob().getDataAsString('UTF-8')) || {}; } catch (ignore) {}
  return renderHomePage_({ perms: _permsFromCfg_(d), labels: _labelsFromCfg_(d), order: _orderFromCfg_(d) },
                          base, staff, dev, who);
}

/** ホーム画面の描画（純JS・GAS API不使用）。②静的アプリは JSONP で tile_settings を取得し、
 *  これを直接呼ぶ（renderPage_/renderLtPage_/renderUriagePage_ と同じ「取得と描画を分離」の作法）。
 *  dev=true（開発用URL）は tile_settings.json の設定を無視して全ボタンを表示する。 */
function renderHomePage_(cfg, base, staff, dev, who) {
  var perms = (cfg && cfg.perms) || defaultPerms_();
  var labels = (cfg && cfg.labels) || PERSON_LABEL_;
  var allow = personPerms_(perms, staff, dev, who);   // null=dev(全許可)
  var sfx = roleSfx_(staff, dev);
  var subtitle = dev ? '開発版（全ボタン表示）'
    : (staff ? (labels[who] || 'スタッフ') : 'TOMATOさん版');
  // 並び順：自動監視メニュー4「ボタンの並びをかえれる」設定（tile_settings.py）で変更可能。
  // TILE_DEFS_ 自体の並びは変えず、order に従って並べ替えるだけ（元の配列は他の用途でも使うため）。
  var order = (cfg && cfg.order) || DEFAULT_TILE_ORDER_;
  var byId = {};
  for (var oi = 0; oi < TILE_DEFS_.length; oi++) byId[TILE_DEFS_[oi].id] = TILE_DEFS_[oi];
  var orderedDefs = [];
  var placed = {};
  for (var oj = 0; oj < order.length; oj++) {
    if (byId[order[oj]] && !placed[order[oj]]) { orderedDefs.push(byId[order[oj]]); placed[order[oj]] = true; }
  }
  for (var ok = 0; ok < TILE_DEFS_.length; ok++) {   // orderに無い(消し忘れ等)ものは元の並びで末尾に足す
    if (!placed[TILE_DEFS_[ok].id]) orderedDefs.push(TILE_DEFS_[ok]);
  }
  var tilesHtml = orderedDefs.filter(function (t) {
    if (t.always) return true;        // 外部リンクだけのボタン等＝権限に関係なく常に表示
    if (!allow) return true;          // dev＝全部
    return allow[t.id] === true;      // 明示ONのボタンだけ表示（初期は施術室被りのみ）
  }).map(function (t) {
    // url指定＝外部サイトへのリンク（新しいタブで開く）。無指定＝アプリ内view遷移（従来通り）。
    var href = t.url ? t.url : (base + '?view=' + t.view + sfx);
    var target = t.url ? '_blank' : '_top';
    var rel = t.url ? ' rel="noopener"' : '';
    return '<a class="tile ' + t.cls + '" href="' + href + '" target="' + target + '"' + rel + '>' +
      t.icon + '<span class="tname">' + esc_(t.label) + '</span></a>';
  }).join('');
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' +
    '<div class="hhead"><img class="bmark" src="https://ttsuperzuco.github.io/tt/icons/icon-180.png" alt=""><span class="bname">TTスーパーズコ</span></div>' +
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

  // AI判定（会話全文を読んだ結果。事務所PC ai_verify_step.py が書いた ai_verdicts.json 由来）。
  var aiHtml = '';
  if (r.ai_verdict) {
    aiHtml = '<div class="lai laiv-' + esc_(r.ai_verdict === '真陽性' ? 'true' : (r.ai_verdict === '偽陽性' ? 'false' : 'check')) + '">' +
      '<span class="lailab">AI判定：' + esc_(r.ai_verdict) + '</span>' +
      (r.ai_true ? '<span class="laitrue">本当の予約：' + esc_(r.ai_true) + '</span>' : '') +
      (r.ai_reason ? '<div class="laireason">' + esc_(r.ai_reason) + '</div>' : '') +
    '</div>';
  }

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
    aiHtml + evHtml + ttHtml +
  '</article>';
}

function renderLtPage_(d, base, staff, dev) {
  var c = d.counts || {};
  var action = d.action || [];
  var oks = d.ok || [];
  var dismissed = d.dismissed || [];

  var cards = action.length
    ? action.map(ltCard_).join('\n')
    : '<div class="lempty">要対応はありません 🎉</div>';

  var dismissedRows = dismissed.length
    ? dismissed.map(ltCard_).join('\n')
    : '<div class="lempty">対応不要になった案件はありません</div>';

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
    '<summary>AI除外（対応不要） ' + (c.dismissed || 0) + '件 ― タップで開く</summary>' +
    dismissedRows +
  '</details>' +
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

// 前日お知らせ画面の枠のCSS＋高さ自動調整スクリプト。中身は事務所PCが作ったHTMLを
// そのまま枠(iframe)に流し込む＝PC版とまったく同じ見た目にする（描画を二重に持たない）。
var ZENJITSUCSS_ =
  '  .zjframe { width:100%; min-height:70vh; border:0; border-radius:14px; background:#fff;' +
  '    box-shadow:0 6px 18px rgba(0,0,0,.14); display:block; }' +
  '  .zjnote { color:rgba(255,255,255,.9); font-size:12.5px; text-align:center; margin:8px 4px 0; line-height:1.6; }';
var ZENJITSUSCRIPT_ =
  '<script>(function(){var f=document.getElementById("zjframe");if(!f)return;' +
  'function fit(){try{var h=f.contentDocument.documentElement.scrollHeight;if(h)f.style.height=(h+24)+"px";}catch(e){}}' +
  'f.addEventListener("load",fit);setTimeout(fit,300);setTimeout(fit,1200);setTimeout(fit,2500);})();</script>';

/** 前日お知らせ（社長確認用・開発URL専用）。事務所PCが作った確認画面のHTML(body_html)を
 *  そのまま枠(iframe)に入れて表示する＝PC版とまったく同じ画面。データは notice_compare.json
 *  （PCが `export_zenjitsu_super.py`／確認画面作成時に書き出し）。まだ無い時は案内を出す。 */
function renderZenjitsuPage_(d, base, staff, dev) {
  var bar = '<div class="ubar"><a class="uhome" href="' + (base || '') + '?view=home' +
    roleSfx_(staff, dev) + '" target="_top">← 前に戻る</a>' +
    '<span class="ugen2">' + (d && d.generated_at ? '最終作成: ' + esc_(d.generated_at) : '') + '</span></div>';
  if (d && d.body_html) {
    return '<style>' + HOMECSS_ + ZENJITSUCSS_ + '</style>' +
      '<div class="home">' + bar +
        '<iframe id="zjframe" class="zjframe" srcdoc="' + esc_(d.body_html) + '"></iframe>' +
        '<div class="zjnote">この画面は事務所PCが作った確認内容をそのまま表示しています（お客様には送りません）。</div>' +
      '</div>' + ZENJITSUSCRIPT_;
  }
  return '<style>' + HOMECSS_ + '</style>' +
    '<div class="home">' + bar +
      '<div class="hhead"><span class="bmark">🔔</span><span class="bname">前日お知らせ</span></div>' +
      '<div class="soon">' +
        '<div class="soonic">🔔</div>' +
        '<div class="soontitle" style="font-size:1.3rem">まだ作られていません</div>' +
        '<div class="soondesc">' + esc_((d && d.error) ? d.error : '確認画面がまだ作られていません。') +
          '<br><br>事務所PCの「前日お知らせ」ボタンで確認画面を作ると、ここに<b>PCとまったく同じ画面</b>が出ます' +
          '（明日ご来店のお客様の施術・回数を、送る前に一人ずつ確認できます。お客様には送りません＝見てコピーするだけ）。</div>' +
      '</div>' +
    '</div>';
}

// ★顧客履歴検索：番号 or 氏名（一部一致OK）で客を探し、今回の予約と過去予約(メモ込み)を見る。
//   検索は事務所PCが実行（op=cust_search）＝依頼を命令置き場に積み、結果は custsearch_<端末>.json
//   としてDriveに置かれる（events.json と同じ「Driveのjsonをアプリが読む」方式）。書き込みは無い。
//   ★事務所PCが動いている時間だけ結果が返る（止まっていれば「時間切れ」を出す）。
var RIREKI_CSS_ =
  '.rk{max-width:760px;margin:0 auto;padding:6px 12px 60px;}' +
  '.rksearch{display:flex;gap:8px;position:sticky;top:0;background:var(--bg,#2C7A99);padding:8px 0 12px;z-index:5;}' +
  '#rkq{flex:1;font-size:1.05rem;padding:12px 14px;border-radius:12px;border:0;}' +
  '#rkgo{font-size:1rem;font-weight:800;padding:12px 20px;border:0;border-radius:12px;background:#2563eb;color:#fff;}' +
  '.rkstatus{color:#eaf3f7;font-size:.9rem;margin:2px 2px 12px;min-height:1.2em;}' +
  '.rkcust{background:#fff;color:#0f172a;border-radius:14px;padding:14px 16px;margin-bottom:16px;box-shadow:0 5px 16px rgba(0,0,0,.15);}' +
  '.rkwho{font-size:1.15rem;font-weight:800;}' +
  '.rkcode{color:#2563eb;font-weight:800;margin-right:8px;}' +
  '.rkph{color:#64748b;font-weight:400;font-size:.86rem;margin-left:8px;}' +
  '.rkmeta{color:#64748b;font-size:.84rem;margin:4px 0 10px;}' +
  '.rksec>.rklbl{font-weight:800;font-size:.96rem;margin:12px 0 7px;padding-left:8px;border-left:4px solid #2563eb;}' +
  '.rksec.past>.rklbl{border-left-color:#94a3b8;}' +
  '.rkrec{padding:9px 0;border-top:1px dashed #e2e8f0;}' +
  '.rkdd{font-weight:800;}' +
  '.rktt{color:#64748b;font-size:.82rem;margin-left:8px;}' +
  '.rkbadge{display:inline-block;padding:1px 9px;border-radius:10px;color:#fff;font-weight:700;font-size:.78rem;}' +
  '.rkroom{display:inline-block;border:1px solid #e2e8f0;border-radius:7px;padding:1px 8px;font-size:.78rem;margin-left:6px;color:#64748b;}' +
  '.rkkind{font-size:.74rem;color:#94a3b8;margin-left:6px;}' +
  '.rkcname{font-weight:700;font-size:.9rem;margin-top:3px;}' +
  '.rktreat{margin-top:3px;font-size:.93rem;line-height:1.5;}' +
  '.rktreat.empty{color:#94a3b8;}' +
  '.rkttl{display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:.78rem;padding:3px 11px;border-radius:8px;margin-top:6px;}' +
  '.rkmemo{margin-top:5px;}' +
  '.rkmemo summary{cursor:pointer;color:#2563eb;font-size:.78rem;font-weight:700;list-style:none;}' +
  '.rkmemo summary::-webkit-details-marker{display:none;}' +
  '.rkfull{white-space:pre-wrap;word-break:break-word;margin:5px 0 0;padding:9px 11px;background:#f1f5f9;border-radius:8px;font-size:.84rem;line-height:1.5;}' +
  '.rknone{color:#94a3b8;font-size:.84rem;padding:4px 0;}' +
  '.rkpick{display:block;width:100%;text-align:left;background:#fff;color:#0f172a;border:0;border-radius:12px;padding:13px 15px;margin-bottom:10px;font-size:1rem;font-weight:700;box-shadow:0 3px 10px rgba(0,0,0,.12);}';

function renderRirekiPage_(base, staff, dev) {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var script =
  '<script>(function(){' +
  'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
  'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
  'var slot=(idn.device||"d0").toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,32)||"default";' +
  'var STAFFCOLOR={"\\uD83E\\uDED2":"#4b8b3b","\\uD83C\\uDF4A":"#e08a1e","\\uD83C\\uDF45":"#d1443c","\\uD83E\\uDD6D":"#c9a227"};' +
  'var qEl=document.getElementById("rkq"),goEl=document.getElementById("rkgo"),stEl=document.getElementById("rkstatus"),resEl=document.getElementById("rkres");' +
  'function esc(s){return (s==null?"":String(s)).replace(/[&<>\\"\\x27]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\\x27":"&#39;"}[c];});}' +
  'function jsonp(params,onR){var cb="__rk"+Date.now()+Math.floor(Math.random()*1000);window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
  'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
  'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
  'function recHtml(r){var color=STAFFCOLOR[r.se]||"#999";' +
  'var badge=r.se?("<span class=\\"rkbadge\\" style=\\"background:"+color+"\\">"+esc(r.se)+esc(r.sn)+"</span>"):"<span class=\\"rkbadge\\" style=\\"background:#999\\">担当不明</span>";' +
  'var tspan=r.s?(esc(r.s)+(r.e?"–"+esc(r.e):"")+(r.du?"（"+r.du+"分）":"")):"";' +
  'var room=r.rm?("<span class=\\"rkroom\\">"+esc(r.rm)+"</span>"):"";' +
  'var cname=r.cu?("<div class=\\"rkcname\\">"+esc(r.cu)+"</div>"):"";' +
  'var treat=r.tr?("<div class=\\"rktreat\\">"+esc(r.tr)+"</div>"):"<div class=\\"rktreat empty\\">（施術内容メモなし）</div>";' +
  'var link=r.tt?("<div><a class=\\"rkttl\\" href=\\""+esc(r.tt)+"\\" target=\\"_blank\\" rel=\\"noopener\\">TimeTreeで開く ↗</a></div>"):"";' +
  'var memo=r.no?("<details class=\\"rkmemo\\"><summary>メモ全文を見る</summary><pre class=\\"rkfull\\">"+esc(r.no)+"</pre></details>"):"";' +
  'return "<div class=\\"rkrec\\"><div><span class=\\"rkdd\\">"+esc(r.d)+"（"+esc(r.w)+"）</span><span class=\\"rktt\\">"+tspan+"</span></div>"+' +
  'badge+room+"<span class=\\"rkkind\\">"+esc(r.ki)+"</span>"+cname+treat+link+memo+"</div>";}' +
  'function custHtml(c){var up=[],pa=[],i;for(i=0;i<(c.recs||[]).length;i++){(c.recs[i].up?up:pa).push(c.recs[i]);}' +
  'var ph=c.ph?("<span class=\\"rkph\\">"+esc(c.ph)+"</span>"):"";' +
  'var head="<div class=\\"rkwho\\"><span class=\\"rkcode\\">"+esc(c.code)+"</span>"+esc(c.name||"（名前メモなし）")+ph+"</div>"+' +
  '"<div class=\\"rkmeta\\">来店 "+c.v+" 回 ／ 初回 "+esc(c.f)+" ／ 最終 "+esc(c.l)+"</div>";' +
  'var upB=up.length?up.map(recHtml).join(""):"<div class=\\"rknone\\">今日以降の予約はありません。</div>";' +
  'var paB=pa.length?pa.map(recHtml).join(""):"<div class=\\"rknone\\">過去の予約はありません。</div>";' +
  'return "<div class=\\"rkcust\\">"+head+"<div class=\\"rksec\\"><div class=\\"rklbl\\">🔔 今回の予約（今日以降）</div>"+upB+"</div>"+' +
  '"<div class=\\"rksec past\\"><div class=\\"rklbl\\">🕘 前回までの予約一覧</div>"+paB+"</div></div>";}' +
  'function pickHtml(c){return "<button type=\\"button\\" class=\\"rkpick\\" data-code=\\""+esc(c.code)+"\\"><span class=\\"rkcode\\">"+esc(c.code)+"</span>"+esc(c.name||"（名前メモなし）")+" ・ 来店"+c.v+"回</button>";}' +
  'function render(res){if(!res||!res.ok){stEl.textContent="エラー："+((res&&res.error)||"不明");return;}' +
  'var cs=res.customers||[];if(!cs.length){stEl.textContent="一致する客が見つかりませんでした。";resEl.innerHTML="";return;}' +
  'if(res.multi){stEl.textContent=cs.length+" 人ヒット（タップで詳しく）";resEl.innerHTML=cs.map(pickHtml).join("");' +
  'var bs=resEl.querySelectorAll(".rkpick");for(var i=0;i<bs.length;i++){bs[i].addEventListener("click",function(){doSearch(this.getAttribute("data-code"));});}return;}' +
  'stEl.textContent=cs.length+" 人ヒット";resEl.innerHTML=cs.map(custHtml).join("");}' +
  'var polls=0;function poll(id){polls++;if(polls>30){stEl.textContent="時間切れです。事務所PCが動いているかご確認のうえ、もう一度お試しください。";return;}' +
  'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){stEl.textContent="エラー："+((r&&r.error)||"不明");return;}' +
  'if(r.status==="pending"){setTimeout(function(){poll(id);},1200);return;}' +
  'if(r.status!=="done"){stEl.textContent="検索に失敗しました："+esc(r.result||r.status);return;}' +
  'jsonp({action:"data",name:"custsearch_"+slot+".json"},function(d){render(d);});});}' +
  'function doSearch(q){q=(q||qEl.value||"").trim();if(!q){stEl.textContent="番号か氏名を入れてください。";return;}' +
  'stEl.textContent="事務所PCで検索中…（数秒）";resEl.innerHTML="";polls=0;' +
  'jsonp({action:"submit",key:KEY,op:"cust_search",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({q:q,slot:slot})},' +
  'function(r){if(!r||!r.ok||!r.id){stEl.textContent="依頼を送れませんでした："+((r&&r.error)||"不明");return;}setTimeout(function(){poll(r.id);},1000);});}' +
  'goEl.addEventListener("click",function(){doSearch();});' +
  'qEl.addEventListener("keydown",function(ev){if(ev.key==="Enter")doSearch();});' +
  '})();</script>';
  return '<style>' + HOMECSS_ + RIREKI_CSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">🔎</span><span class="bname">顧客履歴検索</span></div>' +
    '<div class="rk">' +
      '<div class="rksearch">' +
        '<input id="rkq" type="search" placeholder="F227 / 227 / 小森 …" autocomplete="off">' +
        '<button id="rkgo" type="button">検索</button>' +
      '</div>' +
      '<div class="rkstatus" id="rkstatus">顧客番号（例 F227・数字だけ 227 でも可）か、お名前の一部で検索。</div>' +
      '<div id="rkres"></div>' +
    '</div>' +
  '</div>' +
  script;
}

/** 売上ページの描画（純JS・GAS API不使用）。GAS直アクセスと静的アプリJSONPの両方から呼ばれる。 */
function renderUriagePage_(d, base, staff, dev) {
  return '<style>' + HOMECSS_ + URIAGECSS_ + '</style>' +
  '<div class="home">' +
    '<div class="ubar"><a class="uhome" href="' + (base || '') + '?view=home' + roleSfx_(staff, dev) + '" target="_top">← 前に戻る</a>' +
      '<span class="ugen2">最終計算: ' + esc_(d.generated_at || '—') + '</span>' +
    '</div>' +
    '<div class="hhead uttight"><span class="bmark">💰</span><span class="bname">売上転記TimeTree</span></div>' +
    uriageBody_(d, dev) +
  '</div>' +
  URIAGESCRIPT_;
}

/** 売上データが読めない時の表示（純JS）。 */
function renderUriageError_(err, base, staff, dev) {
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">💰</span><span class="bname">売上転記TimeTree</span></div>' +
    '<div class="soon">' +
      '<div class="soonic">📄</div>' +
      '<div class="soontitle" style="font-size:1.4rem">データ未生成</div>' +
      '<div class="soondesc">' + esc_(err && err.message ? err.message : err) + '</div>' +
    '</div>' +
  '</div>';
}

function uriageBody_(d, dev) {
  var today = d.today_str || '—';
  var cum = d.cumulative_str || '—';
  var monthLabel = d.month ? ('今月（' + d.month + '月）の売上') : '今月の売上';
  var perRows = (d.per_day || []).map(function (x) {
    return '<tr><td>' + esc_(x.date) + '</td><td class="num">' + comma_(x.total) + '</td></tr>';
  }).join('');
  var noteBox = d.note ? '<div class="unote">' + esc_(d.note) + '</div>' : '';

  // ★2026-07-16：未記入/記入ミスの内訳欄は廃止（実行時は必ず最新を読み直すため、事前の
  //   件数表示は目安に過ぎず不要とユーザー判断）。ボタンも1つに統合＝「帳簿売上をTimeTreeに記録」
  //   （中身は新規記入＋上書き修正＋プロセル転記の3つをまとめて実行）。
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
  '<button type="button" id="uallbtn" class="ubtn uall">帳簿売上をTimeTreeに記録</button>' +
  // ★開発者の画面(dev)にだけ、このボタンが実際に何をするかを①②③で全部出す（2026-07-19ユーザー要望）。
  //   スタッフ用の画面には出さない（ボタン内の「含：…」の一行も廃止）。
  (dev ? '<div class="udev"><div class="udevt">🛠 このボタンを押すと実行する内容（開発者向け）</div>' +
    '<ol class="udevl">' +
      '<li>帳簿の「まだTimeTreeに書いていない売上」を、TimeTreeに新しく記入する（すでに入っている値は触らない）。</li>' +
      '<li>TimeTreeにすでに入っている売上に記入ミスがあれば、帳簿の正しい金額に上書きして直す。</li>' +
      '<li>プロセルの売上表（在庫管理シート）にも、同じ売上を書き写す（転記する）。</li>' +
    '</ol></div>' : '');
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
// ★2026-07-16修正：旧実装はgoogle.script.runを直接呼んでおり、電話(静的アプリ)には
//   google.script.runが存在しないため実は動いていなかった（GAS直リンクでしか動かない隠れた不具合）。
//   JSONP(action=submit/status)に統一し、電話でも動くようにした。
'var EXEC_U0_="https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec";' +
'var EKEY_U0_="kx7Q2p9mVt4Zr8";' +
'function jsonpU0_(params, onResult){' +
'  var cb="__uu0"+Date.now()+Math.floor(Math.random()*1000);' +
'  window[cb]=function(r){ try{ delete window[cb]; }catch(ig){} onResult(r||{}); };' +
'  var qs="callback="+cb; for(var k in params){ qs+="&"+k+"="+encodeURIComponent(params[k]); }' +
'  var sc=document.createElement("script"); sc.src=EXEC_U0_+"?"+qs;' +
'  sc.onerror=function(){ onResult({ok:false,error:"通信エラー"}); };' +
'  document.body.appendChild(sc);' +
'}' +
// ブラウザ標準confirmは「ttsuperzuco.github.io の内容」のようにドメイン名を強制表示してしまい
// 消せないため（部屋被り画面のccPopup_と同じ理由）、自前のポップアップ（ドメイン名なし）で代用する。
'function uConfirm_(msg, onYes){' +
'  var mask=document.createElement("div");' +
'  mask.style.cssText="position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:20px;";' +
'  var box=document.createElement("div");' +
'  box.style.cssText="background:#fff;border-radius:16px;padding:24px 20px;max-width:360px;width:100%;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.3);";' +
'  var msgEl=document.createElement("div");' +
'  msgEl.style.cssText="font-size:21px;font-weight:800;line-height:1.6;color:#222;white-space:pre-line;margin-bottom:22px;";' +
'  msgEl.textContent=msg;' +
'  var btns=document.createElement("div");' +
'  btns.style.cssText="display:flex;gap:10px;justify-content:center;";' +
'  var noBtn=document.createElement("button"); noBtn.type="button"; noBtn.textContent="キャンセル";' +
'  noBtn.style.cssText="flex:1;border:0;border-radius:12px;padding:17px;font-size:19px;font-weight:800;background:#e5e7eb;color:#333;";' +
'  var yesBtn=document.createElement("button"); yesBtn.type="button"; yesBtn.textContent="OK";' +
'  yesBtn.style.cssText="flex:1;border:0;border-radius:12px;padding:17px;font-size:19px;font-weight:800;background:#16a34a;color:#fff;";' +
'  btns.appendChild(noBtn); btns.appendChild(yesBtn);' +
'  box.appendChild(msgEl); box.appendChild(btns); mask.appendChild(box);' +
'  document.body.appendChild(mask);' +
'  yesBtn.addEventListener("click",function(){ document.body.removeChild(mask); if(onYes) onYes(); });' +
'  noBtn.addEventListener("click",function(){ document.body.removeChild(mask); });' +
'}' +
'function enableUriageBtns(){ if(allBtn) allBtn.disabled=false; }' +
// ★処理中～完了/失敗の見せ方は、部屋被り(mvOverlay_/showDoneOverlay_)と同じ「全画面」に統一する
//   共通ルール（2026-07-16）。新しい画面を作る時もこの3関数(szOverlay_/szOverlayHide_/szOverlayResult_)
//   と同じ考え方＝①処理中は全画面で待たせる②完了/失敗も全画面で見せる③一定時間 or タップで消す、
//   をコピーして使う。
'function szOverlay_(bg, iconHtml, titleHtml, subHtml){' +
'  var ov=document.getElementById("szFullOverlay");' +
'  if(!ov){ ov=document.createElement("div"); ov.id="szFullOverlay"; document.body.appendChild(ov); }' +
'  ov.style.cssText="position:fixed;inset:0;z-index:9999;background:"+bg+";display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center;";' +
'  ov.innerHTML="<div style=\\"font-size:66px;margin-bottom:20px;\\">"+iconHtml+"</div>"+' +
'    "<div style=\\"color:#fff;font-size:26px;font-weight:800;line-height:1.5;margin-bottom:16px;\\">"+titleHtml+"</div>"+' +
'    (subHtml?"<div style=\\"color:#eaf3f7;font-size:17px;line-height:1.8;max-width:440px;white-space:pre-line;\\">"+subHtml+"</div>":"");' +
'  return ov;' +
'}' +
'function szOverlayHide_(){ var ov=document.getElementById("szFullOverlay"); if(ov&&ov.parentNode) ov.parentNode.removeChild(ov); }' +
// 完了(緑)/失敗(赤)を全画面で見せ、タップで消せるようにする（結果が長文でも読み切れるように自動では消さない）。
'function szOverlayResult_(ok, titleHtml, subHtml){' +
'  var ov=szOverlay_(ok?"#16a34a":"#b91c1c", ok?"✓":"⚠️", titleHtml, (subHtml||"")+"<div style=\\"margin-top:18px;font-size:14px;opacity:.85;\\">（タップで閉じます）</div>");' +
'  ov.style.cursor="pointer";' +
'  ov.addEventListener("click", szOverlayHide_);' +
'}' +
'var allBtn=document.getElementById("uallbtn");' +
'if(allBtn){ allBtn.addEventListener("click",function(){' +
'  uConfirm_("実行します。この処理には数分かかります。", function(){' +
'    allBtn.disabled=true;' +
'    szOverlay_("#2C7A99","⏳","処理中です","売上の記入・ミス修正・プロセル転記を\\nまとめて実行しています。数分かかることがあります。\\n完了したら自動で切り替わります。");' +
'    jsonpU0_({action:"submit",op:"run_all",key:EKEY_U0_},function(r){' +
'      if(!r||!r.ok||!r.id){ szOverlayResult_(false,"依頼に失敗しました",(r&&r.error)||"不明"); allBtn.disabled=false; enableUriageBtns(); return; }' +
'      pollUAll(r.id);' +
'    });' +
'  });' +
'}); }' +
'function pollUAll(id){' +
'  var tries=0;' +
'  var timer=setInterval(function(){ tries++;' +
'    jsonpU0_({action:"status",key:EKEY_U0_,id:id},function(r){' +
'      var s=(r&&r.status)||"";' +
'      if(s==="done"){ clearInterval(timer); szOverlayResult_(true,"完了しました",(r.result)||""); allBtn.disabled=false; enableUriageBtns();' +
'        try{ if(window.__refreshUriageView){ window.__refreshUriageView(); } }catch(e3){} }' +
'      else if(s==="error"||s==="failed"){ clearInterval(timer); szOverlayResult_(false,"失敗しました",(r.result)||s); allBtn.disabled=false; enableUriageBtns(); }' +
'      else if(tries>=120){ clearInterval(timer); szOverlayResult_(false,"時間切れです","事務所PCの見張りが動いているか確認してください。"); allBtn.disabled=false; enableUriageBtns(); }' +
'    });' +
'  },3000);' +
'}' +
'})();</scr' + 'ipt>';

var URIAGECSS_ =
'  .ubar { display:flex; align-items:center; gap:12px; margin:0 0 4px; }' +
'  .uhome { flex:0 0 auto; font-size:.9rem; font-weight:700; color:var(--ink); text-decoration:none;' +
'    background:var(--card); border:1px solid var(--line); border-radius:10px; padding:10px 14px; }' +
'  .uhome:active { transform:translateY(1px); }' +
'  .hhead.uttight { margin-top:2px; }' +
'  .unote { background:#fef9c3; color:#854d0e; border-radius:12px; padding:12px 14px;' +
'    font-weight:700; font-size:.9rem; margin-bottom:14px; }' +
'  .ucards { display:flex; gap:12px; margin-bottom:14px; }' +
'  .ucard { flex:1; background:var(--card); border:1px solid var(--line); border-radius:16px;' +
'    padding:16px 14px; text-align:center; box-shadow:0 4px 12px rgba(0,0,0,.06); }' +
'  .ucard .ul { font-size:1.05rem; color:var(--sub); font-weight:700; }' +
'  .ucard .uv { font-size:2.1rem; font-weight:900; color:var(--ink); margin-top:6px;' +
'    font-variant-numeric:tabular-nums; white-space:nowrap; overflow:hidden; }' +
'  .ubtn { display:block; width:100%; margin-top:16px; font-size:1.15rem; font-weight:800;' +
'    color:#fff; background:#f59e0b; border:0; border-radius:14px; padding:16px; cursor:pointer;' +
'    box-shadow:0 4px 14px rgba(245,158,11,.4); }' +
'  .ubtn:active { transform:translateY(1px); }' +
'  .ubtn:disabled { opacity:.55; }' +
'  .ubtn.uall { background:#16a34a; box-shadow:0 4px 14px rgba(22,163,74,.4); font-size:1.55rem; }' +
'  .uallsub { display:block; font-size:.55em; font-weight:600; opacity:.92; margin-top:8px; line-height:1.4; }' +
'  .udev { margin-top:12px; background:var(--card); border:1px dashed var(--line);' +
'    border-radius:12px; padding:12px 14px; }' +
'  .udevt { font-size:.92rem; font-weight:800; color:var(--sub); margin-bottom:6px; }' +
'  .udevh { font-size:.9rem; font-weight:800; color:var(--ink); margin:10px 0 2px; }' +
'  .udevl { margin:0; padding-left:1.4em; }' +
'  .udevl li { font-size:.95rem; font-weight:600; color:var(--ink); line-height:1.55; margin:4px 0; }' +
'  .uperbtn { width:100%; text-align:center; font-size:1.45rem; font-weight:800; color:#fff;' +
'    background:#2563eb; border:0; border-radius:14px; padding:18px;' +
'    cursor:pointer; margin-bottom:14px; box-shadow:0 4px 14px rgba(37,99,235,.4); }' +
'  .uperbtn:active { transform:translateY(1px); }' +
'  .uperpanel { background:var(--card); border:1px solid var(--line); border-radius:12px;' +
'    padding:4px 14px; margin:-8px 0 14px; }' +
'  .upertbl { width:100%; border-collapse:collapse; margin:6px 0 10px; font-size:.92rem; }' +
'  .upertbl th, .upertbl td { border-bottom:1px solid var(--line); padding:7px 8px; text-align:left; }' +
'  .upertbl .num { text-align:right; font-variant-numeric:tabular-nums; }' +
'  .ugen2 { flex:1; text-align:right; color:var(--sub); font-size:.85rem; font-weight:700; }';

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

function unaReadPill_(read) {
  if (read === '未読') return '<span class="unapill unread">未読</span>';
  if (read === '既読') return '<span class="unapill read">既読</span>';
  return '';
}
// "YYYY-MM-DD HH:MM" → "M月D日 HH:MM"（最近メッセージが来た月日時分を分かりやすく表示）
function unaWhen_(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(s || '');
  if (!m) return s || '';
  return (+m[2]) + '月' + (+m[3]) + '日 ' + m[4] + ':' + m[5];
}

// 1件のカード（build_web.py の row描画のGAS/静的アプリ版）。
// 「🔍 詳細（内容を見る）」＝PC版ダッシュボードと同じく、その会話の末尾数件(r.full)を
// モーダルでその場に表示する（LINEに触れない＝既読を付けずに内容確認できる）。
// 詳細でいつでも中身を見られるので、カード上部の要約は短く（.unaq は2行でクランプ・
// 直近のやりとり.unath は詳細と重複するので省略）＝PC版の行と同じ見せ方に揃える。
function unaCard_(r, kind) {
  var name = r.nm || '🆕 新規（番号未設定）';
  var tag = [r.nat, r.sex].filter(Boolean).join('・');
  var search = esc_(((name) + ' ' + (r.q || '')).toLowerCase());
  var sub = [tag, (r.read && r.read !== '—') ? r.read : '', '待ち' + (r.d || 0) + '日']
    .filter(Boolean).join('　/　');
  var full = esc_(JSON.stringify(r.full || []));
  var when = unaWhen_((r.full && r.full.length) ? r.full[r.full.length - 1].t : r.t);
  var detail = '<button type="button" class="unadetail" data-nm="' + esc_(name) +
    '" data-sub="' + esc_(sub) + '" data-full="' + full + '">🔍 詳細（内容を見る）</button>';
  var link = r.url
    ? '<a class="unalink" target="_blank" rel="noopener" href="' + esc_(r.url) + '">💬 LINEを開く（返信する）</a>'
    : '';
  // ★アプリの中から直接LINEを返す欄（事務所PCが reply:true を立てたカードにだけ出す）。
  //   いま立つのは練習用カード（宛先＝オーナー本人）だけ。本物のお客さんのカードへ広げるのは
  //   練習で確かめてから。送ってよい相手かの判断は事務所PC(send_reply.py)が単独で保証する。
  var box = (r.reply && r.cid)
    ? '<div class="unareply" data-cid="' + esc_(r.cid) + '" data-nm="' + esc_(name) + '">' +
        '<textarea class="unartext" rows="3" maxlength="1000" placeholder="ここに返信を打つと、お店の公式LINEから送ります"></textarea>' +
        '<div class="unastamps"></div>' +
        '<div class="unarrow">' +
          '<span class="unarnote"></span>' +
          '<button type="button" class="unaremoji">😊 絵文字</button>' +
          '<button type="button" class="unarpicker">😀 スタンプ</button>' +
          '<button type="button" class="unarsend">送る</button>' +
        '</div>' +
      '</div>'
    : '';
  return '' +
  '<article class="unacard ' + (kind === 'cust' ? 'cust' : 'ours') + (r.reply ? ' prac' : '') + '" data-search="' + search + '" data-days="' + (r.d || 0) + '">' +
    '<div class="unahead">' +
      '<div class="unarow1">' +
        unaReadPill_(r.read) +
        (when ? '<span class="unawhentag">' + esc_(when) + '</span>' : '') +
        '<span class="unadays">待ち' + (r.d || 0) + '日</span>' +
      '</div>' +
      '<div class="unarow2">' +
        '<span class="unaname">' + esc_(name) + '</span>' +
        (tag ? '<span class="unatag">' + esc_(tag) + '</span>' : '') +
      '</div>' +
    '</div>' +
    '<div class="unaq">' + esc_(r.q || '') + '</div>' +
    '<div class="unaactions">' + detail + link + '</div>' + box +
  '</article>';
}

/** LINE未回答＆返信待ちページの描画（純JS・GAS API不使用）。GAS直アクセスと静的アプリJSONPの
 *  両方から呼ばれる（他view同様「取得と描画を分離」の作法）。
 *  cust=客の質問に店が未返信（最優先）／ ours=こちらの質問・依頼に客が未回答。 */
function unaSortAsc_(arr) {
  // 待ち日数が少ない＝最近の分を上に（PC版ダッシュボードの並び順と揃える）
  return (arr || []).slice().sort(function (a, b) { return (a.d || 0) - (b.d || 0); });
}
function renderUnansweredPage_(d, base, staff, dev) {
  var cust = unaSortAsc_(d.cust), ours = unaSortAsc_(d.ours);
  // ★練習用カード（宛先＝オーナー本人）はスタッフには見せない（2026-07-17ユーザー指示）。
  //   スタッフ用URL(?staff=1)では隠す＝オーナーの検証用の物が現場の邪魔をしないように。
  //   ※これは「見せない」だけ。仮に見えて押されても、事務所PCの送信役が練習モード中は
  //     オーナー本人以外へ送らないので事故にはならない（守りは二重）。
  if (staff) {
    cust = cust.filter(function (r) { return !r.reply; });
    ours = ours.filter(function (r) { return !r.reply; });
  }
  // ★2026-07-17：タブが丸ごと0件の時の「🎉」お祝い文言は廃止。空の時は下の#unaperiodempty
  //   （期間で絞って0件の時と同じ見せ方）に一本化する＝空の理由（期間で絞ったせいか、そもそも
  //   0件か）を分けて出し分けない。カードを1枚も置かなければ apply() の集計(nc/no)が自然に0に
  //   なり、#unaperiodempty が自動で表示される（JS側の変更は不要）。
  var custCards = cust.length
    ? cust.map(function (r) { return unaCard_(r, 'cust'); }).join('\n')
    : '';
  var oursCards = ours.length
    ? ours.map(function (r) { return unaCard_(r, 'ours'); }).join('\n')
    : '';

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
    '<button type="button" class="unatab ours" data-v="ours">🔵 お客様の返事待<span class="unac" id="unaCntOurs">' + ours.length + '</span></button>' +
  '</div>' +
  '<select id="unaperiod">' +
    '<option value="3">3日間</option>' +
    '<option value="7" selected>7日間</option>' +
    '<option value="14">2週間</option>' +
  '</select>' +
  '<div id="unacust" class="unalist">' + custCards + '</div>' +
  '<div id="unaours" class="unalist unahidden">' + oursCards + '</div>' +
  '<div class="unaempty unaemptybig" id="unaperiodempty" hidden>この期間に該当はありません。<br>上の期間を広げてください。</div>' +
'</div>' +
// 詳細モーダル（LINEに触れずに会話の中身をここで確認＝PC版ダッシュボードと同じ）
'<div class="unamask" id="unamask" role="dialog" aria-modal="true">' +
  '<div class="unamodal">' +
    '<div class="unamh">' +
      '<div><div class="unamnm" id="unaMnm"></div><div class="unamsub" id="unaMsub"></div></div>' +
      '<button type="button" class="unamx" id="unaMx" aria-label="閉じる">&times;</button>' +
    '</div>' +
    '<div class="unamlog" id="unaMlog"></div>' +
  '</div>' +
'</div>' +
UNASCRIPT_;
}

// タブ切替（客の質問⇔客の返事待ち）＋期間しぼり込み（既定7日間＝PC版ダッシュボードと同じ既定値）＋
// 名前・質問文でのしぼり込み（L⇔T照合の絞り込みと同じ発想）。
var UNASCRIPT_ =
'<script>(function(){' +
'var tabs=[].slice.call(document.querySelectorAll(".unatab"));' +
'var custEl=document.getElementById("unacust"), oursEl=document.getElementById("unaours");' +
'var per=document.getElementById("unaperiod");' +
'var cntCust=document.getElementById("unaCntCust"), cntOurs=document.getElementById("unaCntOurs");' +
'var empty=document.getElementById("unaperiodempty");' +
'function apply(){' +
'  var pv=+(per&&per.value)||9999;' +
'  var nc=0, no=0;' +
'  [].slice.call(document.querySelectorAll(".unacard")).forEach(function(c){' +
'    var days=+(c.getAttribute("data-days")||0);' +
'    var show=(days<=pv);' +
'    c.classList.toggle("unahide", !show);' +
'    if(show){ if(c.classList.contains("cust")) nc++; else no++; }' +
'  });' +
'  if(cntCust) cntCust.textContent=nc;' +
'  if(cntOurs) cntOurs.textContent=no;' +
'  var isCust=(custEl&&!custEl.classList.contains("unahidden"));' +
'  var activeCount=isCust?nc:no;' +
'  if(empty) empty.hidden=(activeCount>0);' +
'}' +
'tabs.forEach(function(t){ t.addEventListener("click",function(){' +
'  var v=t.getAttribute("data-v");' +
'  tabs.forEach(function(x){ x.classList.toggle("sel", x===t); });' +
'  if(custEl) custEl.classList.toggle("unahidden", v!=="cust");' +
'  if(oursEl) oursEl.classList.toggle("unahidden", v!=="ours");' +
'  apply();' +
'}); });' +
'if(per) per.addEventListener("input",apply);' +
// ―― 詳細モーダル（LINEに触れず全文をここで確認＝PC版ダッシュボードと同じ）――
'var mask=document.getElementById("unamask");' +
'var mlog=document.getElementById("unaMlog"),mnm=document.getElementById("unaMnm"),msub=document.getElementById("unaMsub");' +
'function escH(s){return String(s==null?"":s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];});}' +
'function openDetail(btn){' +
'  if(!mask||!mlog)return;' +
'  var full=[]; try{ full=JSON.parse(btn.getAttribute("data-full")||"[]"); }catch(e){ full=[]; }' +
'  if(mnm) mnm.textContent=btn.getAttribute("data-nm")||"";' +
'  if(msub) msub.textContent=btn.getAttribute("data-sub")||"";' +
'  mlog.innerHTML=full.length? full.map(function(m){' +
'    return "<div class=\\"unamsg "+(m.w==="客"?"cli":"shop")+"\\">"+escH(m.x)+"<span class=\\"unats\\">"+escH(m.w)+" "+escH(m.t)+"</span></div>";' +
'  }).join(""):"<div class=\\"unamnote\\">本文がありません（画像・スタンプのみ等）。</div>";' +
'  mask.classList.add("on");' +
'  setTimeout(function(){ mlog.scrollTop=mlog.scrollHeight; },0);' +
'}' +
'function closeDetail(){ if(mask) mask.classList.remove("on"); }' +
'document.addEventListener("click",function(e){' +
'  var b=e.target&&e.target.closest?e.target.closest(".unadetail"):null;' +
'  if(b){ openDetail(b); }' +
'});' +
'if(mask) mask.addEventListener("click",function(e){ if(e.target===mask) closeDetail(); });' +
'var mx=document.getElementById("unaMx"); if(mx) mx.addEventListener("click",closeDetail);' +
'document.addEventListener("keydown",function(e){ if(e.key==="Escape") closeDetail(); });' +
// ―― アプリの中からLINEを返す（打つ→確認→事務所PCが送る→結果を出す）――
// Google側は中身を判断しない窓口なので、op と中身(fields)に分けて命令置き場へ積むだけ。
// 本当に送ってよい相手かは、事務所PCの送信役(send_reply.py)が単独で判断する。
'var EXEC_UNA_="https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec";' +
'var KEY_UNA_="kx7Q2p9mVt4Zr8";' +
'function unaCall_(params,onResult){' +
'  var cb="__ur"+Date.now()+Math.floor(Math.random()*1000);' +
'  window[cb]=function(r){ try{ delete window[cb]; }catch(ig){} onResult(r); };' +
'  var qs="key="+encodeURIComponent(KEY_UNA_)+"&callback="+cb;' +
'  for(var k in params){ qs+="&"+k+"="+encodeURIComponent(params[k]); }' +
'  var sc=document.createElement("script"); sc.src=EXEC_UNA_+"?"+qs;' +
'  sc.onerror=function(){ onResult({ok:false,error:"通信エラー"}); };' +
'  document.body.appendChild(sc);' +
'}' +
'function unaIdent_(){ var w="",r="",d=""; try{ w=localStorage.getItem("sz_who")||""; r=localStorage.getItem("sz_role")||""; d=localStorage.getItem("sz_device")||""; }catch(e){}' +
'  return {who:w,role:r,device:d}; }' +
'function unaAsk_(nm,text,onYes){' +
'  var mask=document.createElement("div"); mask.className="unaask";' +
'  var box=document.createElement("div"); box.className="unaaskbox";' +
'  var h=document.createElement("div"); h.className="unaaskh"; h.textContent="この内容で送ります";' +
'  var to=document.createElement("div"); to.className="unaaskto"; to.textContent="宛先： "+nm;' +
'  var bd=document.createElement("div"); bd.className="unaaskbd"; bd.textContent=text;' +
'  var bt=document.createElement("div"); bt.className="unaaskbt";' +
'  var no=document.createElement("button"); no.type="button"; no.className="unaaskno"; no.textContent="やめる";' +
'  var ok=document.createElement("button"); ok.type="button"; ok.className="unaaskok"; ok.textContent="送る";' +
'  bt.appendChild(no); bt.appendChild(ok); box.appendChild(h); box.appendChild(to); box.appendChild(bd); box.appendChild(bt);' +
'  mask.appendChild(box); document.body.appendChild(mask);' +
'  function cls(){ try{ document.body.removeChild(mask); }catch(ig){} }' +
'  no.addEventListener("click",cls);' +
'  ok.addEventListener("click",function(){ cls(); onYes(); });' +
'  mask.addEventListener("click",function(e){ if(e.target===mask) cls(); });' +
'}' +
'function unaSend_(wrap){' +
'  var ta=wrap.querySelector(".unartext"), btn=wrap.querySelector(".unarsend");' +
'  var note=wrap.querySelector(".unarnote");' +
'  var cid=wrap.getAttribute("data-cid")||"", nm=wrap.getAttribute("data-nm")||"";' +
'  var text=(ta&&ta.value||"").trim();' +
'  if(!text){ if(note){ note.className="unarnote ng"; note.textContent="本文を打ってください。"; } return; }' +
'  unaAsk_(nm,text,function(){' +
'    btn.disabled=true; if(note){ note.className="unarnote"; note.textContent="送信中…"; }' +
'    var idn=unaIdent_();' +
'    unaCall_({action:"submit",op:"line_reply",who:idn.who,role:idn.role,device:idn.device,' +
'      fields:JSON.stringify({chat:cid,text:text,title:nm})},' +
'      function(r){' +
'        if(!r||!r.ok){ btn.disabled=false;' +
'          if(note){ note.className="unarnote ng"; note.textContent=(r&&r.error)||"送れませんでした。"; } return; }' +
'        var tries=0;' +
'        (function poll(){' +
'          tries++;' +
'          unaCall_({action:"status",id:r.id},function(st){' +
'            if(st&&st.status==="done"){ btn.disabled=false; if(ta) ta.value="";' +
'              if(note){ note.className="unarnote ok"; note.textContent=st.result||"送りました。"; } return; }' +
'            if(st&&st.status==="error"){ btn.disabled=false;' +
'              if(note){ note.className="unarnote ng"; note.textContent=st.result||"送れませんでした。"; } return; }' +
'            if(tries>40){ btn.disabled=false;' +
'              if(note){ note.className="unarnote ng"; note.textContent="事務所のパソコンから返事がありません（見張りが動いているか確認してください）。"; } return; }' +
'            setTimeout(poll,3000);' +
'          });' +
'        })();' +
'      });' +
'  });' +
'}' +
'document.addEventListener("click",function(e){' +
'  var b=e.target&&e.target.closest?e.target.closest(".unarsend"):null;' +
'  if(!b) return;' +
'  var w=b.closest(".unareply"); if(w) unaSend_(w);' +
'});' +
// ―― スタンプ（自作の画像）を送る ――
'var STAMPS_=null, STAMPS_WAIT_=[];' +
'function loadStamps_(cb){' +
'  if(STAMPS_){ cb(STAMPS_); return; }' +
'  STAMPS_WAIT_.push(cb);' +
'  if(STAMPS_WAIT_.length>1) return;' +
'  fetch("stamps.json?cb="+Date.now()).then(function(r){return r.json();}).then(function(d){' +
'    STAMPS_=Array.isArray(d)?d:[]; STAMPS_WAIT_.forEach(function(f){f(STAMPS_);}); STAMPS_WAIT_=[];' +
'  }).catch(function(){ STAMPS_=[]; STAMPS_WAIT_.forEach(function(f){f(STAMPS_);}); STAMPS_WAIT_=[]; });' +
'}' +
'function paintStamps_(){' +
'  var boxes=[].slice.call(document.querySelectorAll(".unastamps"));' +
'  if(!boxes.length) return;' +
'  loadStamps_(function(list){' +
'    boxes.forEach(function(box){' +
'      if(box.getAttribute("data-done")) return; box.setAttribute("data-done","1");' +
'      if(!list.length){ return; }' +
'      list.forEach(function(st){' +
'        var b=document.createElement("button"); b.type="button"; b.className="unastamp";' +
'        b.setAttribute("data-key",st.key); b.title=st.label||st.key;' +
'        var img=document.createElement("img"); img.src=st.img; img.alt=st.label||st.key;' +
'        b.appendChild(img); box.appendChild(b);' +
'      });' +
'    });' +
'  });' +
'}' +
'function unaAskStamp_(nm,imgsrc,onYes){' +
'  var mask=document.createElement("div"); mask.className="unaask";' +
'  var box=document.createElement("div"); box.className="unaaskbox";' +
'  var h=document.createElement("div"); h.className="unaaskh"; h.textContent="このスタンプを送ります";' +
'  var to=document.createElement("div"); to.className="unaaskto"; to.textContent="宛先： "+nm;' +
'  var im=document.createElement("img"); im.className="unaaskimg"; im.src=imgsrc;' +
'  var bt=document.createElement("div"); bt.className="unaaskbt";' +
'  var no=document.createElement("button"); no.type="button"; no.className="unaaskno"; no.textContent="やめる";' +
'  var ok=document.createElement("button"); ok.type="button"; ok.className="unaaskok"; ok.textContent="送る";' +
'  bt.appendChild(no); bt.appendChild(ok); box.appendChild(h); box.appendChild(to); box.appendChild(im); box.appendChild(bt);' +
'  mask.appendChild(box); document.body.appendChild(mask);' +
'  function cls(){ try{ document.body.removeChild(mask); }catch(ig){} }' +
'  no.addEventListener("click",cls); ok.addEventListener("click",function(){ cls(); onYes(); });' +
'  mask.addEventListener("click",function(e){ if(e.target===mask) cls(); });' +
'}' +
'function unaSendStamp_(wrap, key, imgsrc){' +
'  var note=wrap.querySelector(".unarnote");' +
'  var cid=wrap.getAttribute("data-cid")||"", nm=wrap.getAttribute("data-nm")||"";' +
'  unaAskStamp_(nm, imgsrc, function(){' +
'    if(note){ note.className="unarnote"; note.textContent="送信中…"; }' +
'    var idn=unaIdent_();' +
'    unaCall_({action:"submit",op:"line_reply",who:idn.who,role:idn.role,device:idn.device,' +
'      fields:JSON.stringify({chat:cid,stamp:key})},' +
'      function(r){' +
'        if(!r||!r.ok){ if(note){ note.className="unarnote ng"; note.textContent=(r&&r.error)||"送れませんでした。"; } return; }' +
'        var tries=0;' +
'        (function poll(){' +
'          tries++;' +
'          unaCall_({action:"status",id:r.id},function(st){' +
'            if(st&&st.status==="done"){ if(note){ note.className="unarnote ok"; note.textContent=st.result||"送りました。"; } return; }' +
'            if(st&&st.status==="error"){ if(note){ note.className="unarnote ng"; note.textContent=st.result||"送れませんでした。"; } return; }' +
'            if(tries>40){ if(note){ note.className="unarnote ng"; note.textContent="事務所のパソコンから返事がありません。"; } return; }' +
'            setTimeout(poll,3000);' +
'          });' +
'        })();' +
'      });' +
'  });' +
'}' +
'document.addEventListener("click",function(e){' +
'  var b=e.target&&e.target.closest?e.target.closest(".unastamp"):null;' +
'  if(!b) return;' +
'  var w=b.closest(".unareply"); if(!w) return;' +
'  var img=b.querySelector("img");' +
'  unaSendStamp_(w, b.getAttribute("data-key"), img?img.src:"");' +
'});' +
// ―― 本物のLINEスタンプを選ぶ（オーナー本人が持っている物。2026-07-18追加）――
// 一覧はGoogle側の窓口から読む(action=data&name=line_stickers.json)。買い足せば次に開いた時
// 自動で増える＝静的ファイルに書き出さない。束(パッケージ)ごとにタブを分け、押すと確認→送信。
'var REALSTICKERS_=null, REALSTICKERS_WAIT_=[];' +
'function loadRealStickers_(cb){' +
'  if(REALSTICKERS_){ cb(REALSTICKERS_); return; }' +
'  REALSTICKERS_WAIT_.push(cb);' +
'  if(REALSTICKERS_WAIT_.length>1) return;' +
'  unaCall_({action:"data",name:"line_stickers.json"},function(d){' +
'    REALSTICKERS_=(d&&d.packs)||[]; REALSTICKERS_WAIT_.forEach(function(f){f(REALSTICKERS_);}); REALSTICKERS_WAIT_=[];' +
'  });' +
'}' +
'function unaStickerPanel_(wrap){' +
'  var mask=document.createElement("div"); mask.className="unaask";' +
'  var box=document.createElement("div"); box.className="unaaskbox unastkbox";' +
'  var h=document.createElement("div"); h.className="unaaskh"; h.textContent="スタンプを選ぶ";' +
'  var tabs=document.createElement("div"); tabs.className="unastktabs";' +
'  var grid=document.createElement("div"); grid.className="unastkgrid"; grid.textContent="読み込み中…";' +
'  var no=document.createElement("button"); no.type="button"; no.className="unaaskno"; no.textContent="閉じる";' +
'  var bt=document.createElement("div"); bt.className="unaaskbt"; bt.appendChild(no);' +
'  box.appendChild(h); box.appendChild(tabs); box.appendChild(grid); box.appendChild(bt);' +
'  mask.appendChild(box); document.body.appendChild(mask);' +
'  function close(){ try{ document.body.removeChild(mask); }catch(ig){} }' +
'  no.addEventListener("click",close);' +
'  mask.addEventListener("click",function(e){ if(e.target===mask) close(); });' +
'  function paintPack(pack){' +
'    grid.innerHTML="";' +
'    pack.stickers.forEach(function(st){' +
'      var b=document.createElement("button"); b.type="button"; b.className="unastkitem";' +
'      var img=document.createElement("img"); img.src=st.thumb; img.loading="lazy";' +
'      b.appendChild(img);' +
'      b.addEventListener("click",function(){' +
'        close();' +
'        unaSendRealSticker_(wrap, pack.packageId, st.stickerId, st.thumb);' +
'      });' +
'      grid.appendChild(b);' +
'    });' +
'  }' +
'  loadRealStickers_(function(packs){' +
'    if(!packs.length){ grid.textContent="スタンプが見つかりません。"; return; }' +
'    tabs.innerHTML="";' +
'    packs.forEach(function(pack,i){' +
'      var t=document.createElement("button"); t.type="button"; t.className="unastktab"+(i===0?" sel":"");' +
'      var timg=document.createElement("img"); timg.src=pack.stickers[0].thumb;' +
'      t.appendChild(timg);' +
'      t.addEventListener("click",function(){' +
'        [].slice.call(tabs.children).forEach(function(x){ x.classList.remove("sel"); });' +
'        t.classList.add("sel"); paintPack(pack);' +
'      });' +
'      tabs.appendChild(t);' +
'    });' +
'    paintPack(packs[0]);' +
'  });' +
'}' +
'function unaSendRealSticker_(wrap, packageId, stickerId, imgsrc){' +
'  var note=wrap.querySelector(".unarnote");' +
'  var cid=wrap.getAttribute("data-cid")||"", nm=wrap.getAttribute("data-nm")||"";' +
'  unaAskStamp_(nm, imgsrc, function(){' +
'    if(note){ note.className="unarnote"; note.textContent="送信中…（少し時間がかかります）"; }' +
'    var idn=unaIdent_();' +
'    unaCall_({action:"submit",op:"line_reply",who:idn.who,role:idn.role,device:idn.device,' +
'      fields:JSON.stringify({chat:cid,package_id:packageId,sticker_id:stickerId})},' +
'      function(r){' +
'        if(!r||!r.ok){ if(note){ note.className="unarnote ng"; note.textContent=(r&&r.error)||"送れませんでした。"; } return; }' +
'        var tries=0;' +
'        (function poll(){' +
'          tries++;' +
'          unaCall_({action:"status",id:r.id},function(st){' +
'            if(st&&st.status==="done"){ if(note){ note.className="unarnote ok"; note.textContent=st.result||"送りました。"; } return; }' +
'            if(st&&st.status==="error"){ if(note){ note.className="unarnote ng"; note.textContent=st.result||"送れませんでした。"; } return; }' +
'            if(tries>60){ if(note){ note.className="unarnote ng"; note.textContent="事務所のパソコンから返事がありません。"; } return; }' +
'            setTimeout(poll,3000);' +
'          });' +
'        })();' +
'      });' +
'  });' +
'}' +
'document.addEventListener("click",function(e){' +
'  var b=e.target&&e.target.closest?e.target.closest(".unarpicker"):null;' +
'  if(!b) return;' +
'  var w=b.closest(".unareply"); if(w) unaStickerPanel_(w);' +
'});' +
// ―― 文章に絵文字を差し込む（送信はしない・打つだけ。2026-07-18追加）――
'var EMOJI_LIST_=["😊","😀","😄","😁","😆","🙂","😉","😍","🥰","🤣","😂","😢","😭","🙏","👍",' +
'"👌","💪","🎉","❤","💦","😅","🤔","😴","🙇","✨","🌸","☀","🌧","😱","😳"];' +
'function unaEmojiPanel_(wrap){' +
'  var mask=document.createElement("div"); mask.className="unaask";' +
'  var box=document.createElement("div"); box.className="unaaskbox unastkbox";' +
'  var h=document.createElement("div"); h.className="unaaskh"; h.textContent="絵文字を選ぶ";' +
'  var grid=document.createElement("div"); grid.className="unaemgrid";' +
'  var no=document.createElement("button"); no.type="button"; no.className="unaaskno"; no.textContent="閉じる";' +
'  var bt=document.createElement("div"); bt.className="unaaskbt"; bt.appendChild(no);' +
'  EMOJI_LIST_.forEach(function(em){' +
'    var b=document.createElement("button"); b.type="button"; b.className="unaemitem"; b.textContent=em;' +
'    b.addEventListener("click",function(){' +
'      var ta=wrap.querySelector(".unartext"); if(!ta) return;' +
'      var s=ta.selectionStart==null?ta.value.length:ta.selectionStart;' +
'      var e2=ta.selectionEnd==null?ta.value.length:ta.selectionEnd;' +
'      ta.value=ta.value.slice(0,s)+em+ta.value.slice(e2);' +
'      var pos=s+em.length; ta.focus(); ta.setSelectionRange(pos,pos);' +
'      close();' +
'    });' +
'    grid.appendChild(b);' +
'  });' +
'  box.appendChild(h); box.appendChild(grid); box.appendChild(bt);' +
'  mask.appendChild(box); document.body.appendChild(mask);' +
'  function close(){ try{ document.body.removeChild(mask); }catch(ig){} }' +
'  no.addEventListener("click",close);' +
'  mask.addEventListener("click",function(e){ if(e.target===mask) close(); });' +
'}' +
'document.addEventListener("click",function(e){' +
'  var b=e.target&&e.target.closest?e.target.closest(".unaremoji"):null;' +
'  if(!b) return;' +
'  var w=b.closest(".unareply"); if(w) unaEmojiPanel_(w);' +
'});' +
'paintStamps_();' +
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
'  .unagen{ color:#eaf3f7; font-size:15px; font-weight:700; opacity:.95; }' +
'  h1{ color:#fff; font-size:16px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin:6px 0 12px; }' +
'  .unatabs{ display:flex; gap:8px; margin-bottom:12px; }' +
'  .unatab{ flex:1; background:var(--card); border:1px solid var(--line); border-radius:12px;' +
'    padding:10px 8px; cursor:pointer; text-align:center; color:var(--ink); font:inherit; font-weight:800;' +
'    font-size:clamp(17px,5vw,22px); }' +
'  .unatab .unac{ display:block; font-size:clamp(26px,9vw,38px); font-weight:900; margin-top:2px; }' +
'  .unatab.cust.sel{ background:var(--cust); border-color:var(--cust); color:#fff; }' +
'  .unatab.ours.sel{ background:var(--q); border-color:var(--q); color:#fff; }' +
'  .unatab.sel .unac{ color:#fff; }' +
'  #unaperiod{ width:100%; padding:16px 16px; border:1px solid var(--line); border-radius:10px;' +
'    background:var(--card); color:var(--ink); font-size:19px; font-weight:800; margin-bottom:10px; }' +
'  #unaq{ width:100%; padding:10px 12px; border:1px solid var(--line); border-radius:10px;' +
'    background:var(--card); color:var(--ink); font-size:15px; margin-bottom:14px; }' +
'  .unahidden{ display:none!important; } .unahide{ display:none!important; }' +
'  .unalist{ display:flex; flex-direction:column; gap:10px; }' +
'  .unacard{ background:var(--card); border:1px solid var(--line); border-left:6px solid var(--sub);' +
'    border-radius:12px; padding:12px 14px; }' +
// 練習用カード（相手＝オーナー本人）は、本物のお客さんのカードと一目で区別が付くよう破線＋別色。
'  .unacard.prac{ border:2px dashed var(--q); background:var(--card); }' +
'  .unareply{ margin-top:10px; border-top:1px solid var(--line); padding-top:10px; }' +
'  .unartext{ width:100%; padding:10px 12px; border:1px solid var(--line); border-radius:10px;' +
'    background:var(--card); color:var(--ink); font:inherit; font-size:16px; resize:vertical; }' +
'  .unarrow{ display:flex; align-items:center; gap:10px; margin-top:8px; }' +
'  .unarnote{ flex:1; font-size:13px; font-weight:700; color:var(--sub); }' +
'  .unarnote.ok{ color:var(--cust); } .unarnote.ng{ color:var(--req); }' +
'  .unastamps{ display:flex; flex-wrap:wrap; gap:8px; margin:8px 0 2px; }' +
'  .unastamp{ background:var(--card); border:1px solid var(--line); border-radius:12px; padding:4px;' +
'    cursor:pointer; width:64px; height:64px; display:flex; align-items:center; justify-content:center; }' +
'  .unastamp img{ max-width:100%; max-height:100%; }' +
'  .unaaskimg{ display:block; margin:6px auto 2px; max-width:180px; max-height:180px; }' +
'  .unarsend{ background:var(--cust); color:#fff; border:0; border-radius:10px; padding:11px 22px;' +
'    font:inherit; font-weight:800; font-size:16px; cursor:pointer; }' +
'  .unarsend:disabled{ opacity:.5; }' +
'  .unarpicker{ background:var(--card); border:1px solid var(--line); color:var(--ink); border-radius:10px;' +
'    padding:11px 16px; font:inherit; font-weight:700; font-size:15px; cursor:pointer; }' +
'  .unaremoji{ background:var(--card); border:1px solid var(--line); color:var(--ink); border-radius:10px;' +
'    padding:11px 16px; font:inherit; font-weight:700; font-size:15px; cursor:pointer; }' +
'  .unaemgrid{ display:grid; grid-template-columns:repeat(6,1fr); gap:6px; max-height:260px; overflow-y:auto; }' +
'  .unaemitem{ background:var(--custbg); border:1px solid var(--line); border-radius:10px;' +
'    font-size:24px; padding:6px; cursor:pointer; aspect-ratio:1; }' +
'  .unastkbox{ max-width:520px; }' +
'  .unastktabs{ display:flex; flex-wrap:wrap; gap:6px; max-height:110px; overflow-y:auto; margin-bottom:10px;' +
'    padding-bottom:8px; border-bottom:1px solid var(--line); }' +
'  .unastktab{ width:40px; height:40px; padding:2px; border-radius:8px; border:2px solid transparent;' +
'    background:var(--custbg); cursor:pointer; display:flex; align-items:center; justify-content:center; }' +
'  .unastktab img{ max-width:100%; max-height:100%; }' +
'  .unastktab.sel{ border-color:var(--cust); }' +
'  .unastkgrid{ display:grid; grid-template-columns:repeat(5,1fr); gap:8px; max-height:280px; overflow-y:auto; }' +
'  .unastkitem{ background:var(--custbg); border:1px solid var(--line); border-radius:10px; padding:4px;' +
'    cursor:pointer; aspect-ratio:1; display:flex; align-items:center; justify-content:center; }' +
'  .unastkitem img{ max-width:100%; max-height:100%; }' +
'  .unaask{ position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center;' +
'    justify-content:center; padding:18px; z-index:60; }' +
'  .unaaskbox{ background:var(--card); border-radius:14px; padding:16px; max-width:420px; width:100%; }' +
'  .unaaskh{ font-weight:900; font-size:17px; margin-bottom:8px; }' +
'  .unaaskto{ font-size:14px; color:var(--sub); font-weight:700; margin-bottom:8px; }' +
'  .unaaskbd{ background:var(--custbg); border-radius:10px; padding:10px 12px; font-size:15px;' +
'    white-space:pre-wrap; max-height:40vh; overflow:auto; }' +
'  .unaaskbt{ display:flex; gap:10px; justify-content:flex-end; margin-top:14px; }' +
'  .unaaskno{ background:transparent; border:1px solid var(--line); color:var(--ink); }' +
'  .unaaskok{ background:var(--cust); border:0; color:#fff; }' +
'  .unaaskbt button{ border-radius:10px; padding:11px 22px; font:inherit; font-weight:800; font-size:15px; cursor:pointer; }' +
'  .unacard.cust{ border-left-color:var(--cust); background:var(--custbg); }' +
'  .unacard.ours{ border-left-color:var(--q); }' +
'  .unahead{ display:flex; flex-direction:column; gap:5px; margin-bottom:6px; }' +
'  .unarow1{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }' +
'  .unarow2{ display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; }' +
'  .unapill{ font-size:clamp(18px,5vw,24px); font-weight:800; padding:3px 10px; border-radius:8px; }' +
'  .unapill.unread{ background:#fef9c3; color:#854d0e; } .unapill.read{ background:var(--line); color:var(--sub); }' +
'  .unawhentag{ font-size:clamp(26px,7.2vw,32px); font-weight:800; color:var(--sub); font-variant-numeric:tabular-nums; }' +
'  .unaname{ font-weight:800; font-size:clamp(20px,5.6vw,26px); }' +
'  .unatag{ font-size:clamp(14px,4vw,18px); color:var(--sub); }' +
'  .unadays{ font-size:clamp(20px,5.5vw,26px); font-weight:700; color:var(--sub); font-variant-numeric:tabular-nums; }' +
'  .unaq{ font-size:clamp(15px,4.2vw,19px); margin:2px 0 6px; line-height:1.5;' +
'    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }' +
'  .unath{ font-size:12px; color:var(--sub); border-top:1px dashed var(--line); padding-top:6px; margin-top:2px; }' +
'  .unaactions{ margin-top:9px; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }' +
'  .unadetail{ appearance:none; font:inherit; font-size:12.5px; font-weight:700; cursor:pointer;' +
'    padding:8px 14px; border-radius:10px; border:1px solid var(--q); background:var(--card); color:var(--q); }' +
'  .unalink{ display:inline-block; text-decoration:none; background:#06c755; color:#fff; font-weight:700;' +
'    font-size:12.5px; padding:8px 14px; border-radius:10px; }' +
'  .unaempty{ text-align:center; color:#fff; padding:30px; font-weight:700; }' +
'  .unaemptybig{ font-size:clamp(17px,5vw,22px); line-height:1.7; }' +
// 詳細モーダル（LINEに触れず会話の中身をその場で確認）
'  .unamask{ position:fixed; inset:0; background:rgba(0,0,0,.5); display:none;' +
'    align-items:center; justify-content:center; padding:16px; z-index:60; }' +
'  .unamask.on{ display:flex; }' +
'  .unamodal{ background:var(--card); border:1px solid var(--line); border-radius:16px;' +
'    max-width:560px; width:100%; max-height:82vh; display:flex; flex-direction:column;' +
'    box-shadow:0 24px 60px rgba(0,0,0,.4); }' +
'  .unamh{ padding:14px 16px; border-bottom:1px solid var(--line); display:flex;' +
'    justify-content:space-between; gap:10px; align-items:flex-start; }' +
'  .unamnm{ font-weight:800; font-size:20px; color:var(--ink); }' +
'  .unamsub{ font-size:14px; color:var(--sub); margin-top:3px; }' +
'  .unamx{ appearance:none; border:0; background:none; font-size:28px; line-height:1;' +
'    color:var(--sub); cursor:pointer; padding:2px 6px; }' +
'  .unamlog{ overflow-y:auto; padding:14px 16px; display:flex; flex-direction:column; gap:10px; }' +
'  .unamsg{ max-width:85%; padding:11px 14px; border-radius:12px; font-size:17px; line-height:1.6;' +
'    white-space:pre-wrap; overflow-wrap:anywhere; word-break:normal; color:var(--ink); }' +
'  .unamsg.cli{ align-self:flex-start; background:var(--line); }' +
'  .unamsg.shop{ align-self:flex-end; background:var(--custbg); border:1px solid var(--cust); }' +
'  .unats{ display:block; font-size:12.5px; color:var(--sub); opacity:.85; margin-top:6px; }' +
'  .unamnote{ color:var(--sub); font-size:15px; padding:8px; }';

/** 空き時間検索（スタッフの手空きから予約可能な時間を探す）。
 *  事務所PCが export_akijikan_super.py で書き出した akijikan.json を読むだけ（GASは計算しない＝
 *  判定ロジックの実体はPC版 空き時間検索\available_slots.py の build_report() 1つ）。 */
function renderAkijikan_(base, staff, dev) {
  try {
    var d = JSON.parse(getAkijikanFile_().getBlob().getDataAsString('UTF-8'));
    return renderAkijikanPage_(d, base, staff, dev);
  } catch (err) {
    return renderAkijikanError_(err, base, staff, dev);
  }
}

function renderAkijikanError_(err, base, staff, dev) {
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">🕑</span><span class="bname">空き時間検索</span></div>' +
    '<div class="soon">' +
      '<div class="soonic">📄</div>' +
      '<div class="soontitle" style="font-size:1.4rem">データ未生成</div>' +
      '<div class="soondesc">' + esc_(err && err.message ? err.message : err) + '</div>' +
    '</div>' +
  '</div>';
}

function akiStaffColor_(emoji) {
  var p = { '🫒': '#4b8b3b', '🍊': '#e08a1e', '🍅': '#d1443c', '🥭': '#c9a227' };
  return p[emoji] || '#666';
}

// 1件ぶんの空き枠チップ（開始-終了(長さ分)）。data-durは長さボタンでの絞り込み用（2026-07-17追加）。
function akiSlotChip_(sl) {
  return '<span class="akislot" data-dur="' + sl.dur + '">' + esc_(sl.s) + '-' + esc_(sl.e) + '<b>(' + sl.dur + '分)</b></span>';
}

// 「各時間帯別」＝1枠1行（PC版available_slots.pyのconsole/HTML表示と同じ形式・並び順）。
// data-durは長さボタンでの絞り込み用（2026-07-17追加）。
function akiTimeRows_(slots) {
  if (!slots || !slots.length) return '<div class="akinone">空きなし</div>';
  return slots.map(function (sl) {
    var badge = '<span class="akibadge" style="background:' + akiStaffColor_(sl.emoji) + '">' +
      esc_(sl.emoji) + ' ' + esc_(sl.name) + '</span>';
    var rooms = (sl.rooms || []).length
      ? sl.rooms.map(function (r) {
          return '<span class="akiroom" style="background:' + roomColor_(r) + '">' + esc_(r) + '</span>';
        }).join('')
      : '<span class="akinorooms">空き部屋なし</span>';
    return '<div class="akirow" data-dur="' + sl.dur + '">' +
      '<span class="akitime">' + esc_(sl.s) + '-' + esc_(sl.e) + '</span>' +
      '<span class="akidur">' + sl.dur + '分</span>' + badge +
      '<span class="akirooms">' + rooms + '</span>' +
    '</div>';
  }).join('');
}

// 「スタッフ別」＝担当ごとに出勤時間＋空き枠チップ。
function akiStaffRows_(staffList) {
  if (!staffList || !staffList.length) return '<div class="akinone">出勤スタッフなし</div>';
  return staffList.map(function (s) {
    var badge = '<span class="akibadge" style="background:' + akiStaffColor_(s.emoji) + '">' +
      esc_(s.emoji) + ' ' + esc_(s.name) + '</span>';
    var chips = (s.slots || []).length
      ? s.slots.map(akiSlotChip_).join('')
      : '<span class="akinone">空きなし</span>';
    return '<div class="akirow">' + badge +
      '<span class="akishift">出勤' + esc_(s.shift) + esc_(s.note || '') + '</span>' + chips +
    '</div>';
  }).join('');
}

// 「施術室別」＝部屋ごとに空き枠チップ。
function akiRoomRows_(roomsFree) {
  if (!roomsFree || !roomsFree.length) return '<div class="akinone">データなし</div>';
  return roomsFree.map(function (r) {
    var badge = '<span class="akiroom lg" style="background:' + roomColor_(r.room) + '">' + esc_(r.room) + '</span>';
    var chips = (r.slots || []).length
      ? r.slots.map(akiSlotChip_).join('')
      : '<span class="akinone">空きなし</span>';
    return '<div class="akirow">' + badge + chips + '</div>';
  }).join('');
}

// 1日ぶんのカード。data-date（ISO日付）を持たせて日にち検索の絞り込みに使う。
function akiDayCard_(day) {
  var dattr = ' data-date="' + esc_(day.date || '') + '"';
  if (day.kind === 'closed') {
    return '<div class="akiday"' + dattr + '><div class="akidh">📅 ' + esc_(day.dh) + '</div>' +
      '<div class="akiclosed">' + esc_(day.label) + '</div></div>';
  }
  if (day.empty) {
    return '<div class="akiday"' + dattr + '><div class="akidh">📅 ' + esc_(day.dh) + '</div>' +
      '<div class="akinone">（出勤スタッフなし）</div></div>';
  }
  return '<div class="akiday"' + dattr + '>' +
    '<div class="akidh">📅 ' + esc_(day.dh) + '</div>' +
    '<div class="akisec akisec-time" data-sec="time">' +
      akiTimeRows_(day.time_slots) +
    '</div>' +
    '<div class="akisec akisec-staff akihidden" data-sec="staff">' +
      akiStaffRows_(day.staff) +
    '</div>' +
    '<div class="akisec akisec-rooms akihidden" data-sec="rooms">' +
      akiRoomRows_(day.rooms_free) +
    '</div>' +
  '</div>';
}

/** 空き時間検索ページの描画（純JS・GAS API不使用）。GAS直アクセスと静的アプリJSONPの
 *  両方から呼ばれる（他view同様「取得と描画を分離」の作法）。
 *  表示は3つ（各時間帯別／スタッフ別／施術室別）をチップで独立にON/OFF（PC版GUIと同じ操作感・
 *  既定は各時間帯別だけON）。データは全部JSONに入っているので、切替に読み直しは不要。 */
function renderAkijikanPage_(d, base, staff, dev) {
  var days = d.days || [];
  var cards = days.length
    ? days.map(akiDayCard_).join('\n')
    : '<div class="akinone">データがありません</div>';

  return '' +
'<style>' + AKICSS_ + '</style>' +
'<div class="akiwrap">' +
  '<div class="akibar">' +
    '<a class="akihome" href="' + (base || '') + '?view=home' + roleSfx_(staff, dev) + '" target="_top">← 前に戻る</a>' +
    '<span class="akigen">生成: ' + esc_(d.generated_at || '—') + '</span>' +
  '</div>' +
  '<h1>🕑 空き時間検索</h1>' +
  '<div class="akidatebar">' +
    // ★2026-07-17ユーザー指示：期間(from〜to)選択をやめ、カレンダーで日付を好きなだけ複数選ぶ
    //   方式に変更。終わりの日付BOXは廃止＝日付BOXは1個だけ（押すと複数選択カレンダーが開く）。
    //   日付BOX＋今日/明日/今・来週/全期間を1行に収める（今日/明日はやや小さめ）。
    '<div class="akidaterow">' +
      '<input type="text" readonly class="akidate" id="akiFrom" placeholder="日付で選ぶ"' +
        ' min="' + esc_(d.date_from || '') + '" max="' + esc_(d.date_to || '') + '">' +
      '<button type="button" class="akipreset sm" data-preset="today">今日</button>' +
      '<button type="button" class="akipreset sm" data-preset="tomorrow">明日</button>' +
      '<button type="button" class="akipreset on" data-preset="thisnext">今・来週</button>' +
      '<button type="button" class="akipreset" data-preset="all">全期間</button>' +
    '</div>' +
    // 曜日で絞り込み（定休日の月・日は元々出ないので対象外＝2026-07-17ユーザー指示）。
    // 既定は「全て」＝制限なし。個別の曜日を押すと複数選択でき、その時点で「全て」は外れる。
    '<div class="akiwdrow">' +
      '<button type="button" class="akiwd on" data-wd="all">全て</button>' +
      '<button type="button" class="akiwd" data-wd="2">火</button>' +
      '<button type="button" class="akiwd" data-wd="3">水</button>' +
      '<button type="button" class="akiwd" data-wd="4">木</button>' +
      '<button type="button" class="akiwd" data-wd="5">金</button>' +
      '<button type="button" class="akiwd" data-wd="6">土</button>' +
    '</div>' +
    // 空き時間の長さで絞り込み（2026-07-17ユーザー指示・以上ロジックに変更）。単一選択＝1つだけON。
    // 30分＝30分以上を全部／60分＝60分以上を全部／120分＝120分以上を全部（すべて同じ「以上」ロジック）。
    '<div class="akidurrow">' +
      '<button type="button" class="akidurbtn on" data-dur="all">全部</button>' +
      '<button type="button" class="akidurbtn" data-dur="30">30分</button>' +
      '<button type="button" class="akidurbtn" data-dur="60">60分</button>' +
      '<button type="button" class="akidurbtn" data-dur="120">120分</button>' +
    '</div>' +
  '</div>' +
  '<div class="akichips">' +
    '<button type="button" class="akichip on" data-sec="time">各時間帯別</button>' +
    '<button type="button" class="akichip" data-sec="staff">スタッフ別</button>' +
    '<button type="button" class="akichip" data-sec="rooms">施術室別</button>' +
  '</div>' +
  '<div id="akidays">' + cards + '</div>' +
  '<div class="akinone" id="akiDateEmpty" hidden>この期間には表示できるデータがありません。期間を変えてください。</div>' +
'</div>' +
AKISCRIPT_;
}

// 表示チップ（各時間帯別／スタッフ別／施術室別）のON/OFFで全日カードのセクションを一括切替。
// ＋日にち検索：<input type=date>2つ＋プリセットで、90日ぶん既に取得済みのデータを
//   その場で絞り込むだけ（PCに問い合わせ直さない＝一瞬で切り替わる。[[project_superzuko_app]]方針）。
var AKISCRIPT_ =
'<script>(function(){' +
'var chips=[].slice.call(document.querySelectorAll(".akichip"));' +
'chips.forEach(function(c){ c.addEventListener("click",function(){' +
'  var sec=c.getAttribute("data-sec");' +
'  chips.forEach(function(x){ x.classList.toggle("on", x===c); });' +
'  ["time","staff","rooms"].forEach(function(s){' +
'    [].slice.call(document.querySelectorAll(".akisec-"+s)).forEach(function(el){' +
'      el.classList.toggle("akihidden", s!==sec);' +
'    });' +
'  });' +
'}); });' +
'' +
'var fromEl=document.getElementById("akiFrom");' +
'var minD=fromEl?fromEl.min:"", maxD=fromEl?fromEl.max:"";' +
'var days=[].slice.call(document.querySelectorAll("#akidays .akiday"));' +
'var emptyMsg=document.getElementById("akiDateEmpty");' +
// ★2026-07-17ユーザー指示：期間(from〜to)選択をやめ、カレンダーで日付を好きなだけ複数選ぶ方式に。
//   manualDates=null の時はプリセット(今日/明日/今・来週/全期間)の範囲(rangeFrom〜rangeTo)を使い、
//   manualDates に配列が入っている時はその日付だけを表示する（プリセットとは排他）。
'var manualDates=null;' +
'function updateDateBoxLabel_(){' +
'  if(!fromEl) return;' +
'  var active = manualDates&&manualDates.length;' +
'  fromEl.classList.toggle("on", !!active);' +   // 日付が選ばれている時は他のボタンと同じ色に（2026-07-17ユーザー指示）
'  if(!active){ fromEl.value=""; return; }' +
'  var mp=manualDates[0].slice(5).split("-");' +
'  var f=Number(mp[0])+"/"+Number(mp[1]);' +   // 先頭の0を消して"7/18"のように表示
'  fromEl.value = manualDates.length===1 ? f : (f+" 他"+(manualDates.length-1)+"件");' +
'}' +
'function openAkiCal_(input){' +
'  var picks=new Set(manualDates||[]);' +
'  var initD=(manualDates&&manualDates[0])||minD;' +
'  var cur=new Date((initD||minD)+"T00:00:00");' +
'  var y=cur.getFullYear(), m=cur.getMonth();' +
'  var mask=document.createElement("div"); mask.className="akicalmask";' +
'  var box=document.createElement("div"); box.className="akicalbox";' +
'  mask.appendChild(box); document.body.appendChild(mask);' +
'  function pad2(n){ return String(n).padStart(2,"0"); }' +
'  function draw(){' +
'    box.innerHTML="";' +
'    var hdr=document.createElement("div"); hdr.className="akicalhdr";' +
'    var prev=document.createElement("button"); prev.type="button"; prev.textContent="◀";' +
'    var lbl=document.createElement("span"); lbl.textContent=y+"年 "+(m+1)+"月";' +
'    var next=document.createElement("button"); next.type="button"; next.textContent="▶";' +
'    prev.addEventListener("click",function(){ m--; if(m<0){m=11;y--;} draw(); });' +
'    next.addEventListener("click",function(){ m++; if(m>11){m=0;y++;} draw(); });' +
'    hdr.appendChild(prev); hdr.appendChild(lbl); hdr.appendChild(next);' +
'    box.appendChild(hdr);' +
'    var note=document.createElement("div"); note.className="akicalnote";' +
'    note.textContent="いくつでも選べます（もう一度押すと外れます）";' +
'    box.appendChild(note);' +
'    var wk=document.createElement("div"); wk.className="akicalwk";' +
'    ["月","火","水","木","金","土","日"].forEach(function(w,i){' +
'      var s=document.createElement("span"); s.textContent=w;' +
'      if(i===5) s.className="aki6"; if(i===6) s.className="aki0";' +
'      wk.appendChild(s);' +
'    });' +
'    box.appendChild(wk);' +
'    var grid=document.createElement("div"); grid.className="akicalgrid";' +
'    var first=new Date(y,m,1); var startWd=(first.getDay()+6)%7;' +
'    var daysInMonth=new Date(y,m+1,0).getDate();' +
'    for(var i=0;i<startWd;i++){ grid.appendChild(document.createElement("span")); }' +
'    for(var dnum=1; dnum<=daysInMonth; dnum++){' +
'      var iso0 = y+"-"+pad2(m+1)+"-"+pad2(dnum);' +
'      var b=document.createElement("button"); b.type="button"; b.textContent=String(dnum);' +
'      if((minD&&iso0<minD)||(maxD&&iso0>maxD)){ b.disabled=true; }' +
'      if(picks.has(iso0)){ b.classList.add("sel"); }' +
'      b.addEventListener("click",(function(iso1){ return function(){' +
'        if(picks.has(iso1)) picks.delete(iso1); else picks.add(iso1); draw();' +
'      }; })(iso0));' +
'      grid.appendChild(b);' +
'    }' +
'    box.appendChild(grid);' +
'    var ftr=document.createElement("div"); ftr.className="akicalftr";' +
'    var cancel=document.createElement("button"); cancel.type="button"; cancel.textContent="キャンセル"; cancel.className="akicalcancel";' +
'    var ok=document.createElement("button"); ok.type="button"; ok.textContent="設定"; ok.className="akicalok";' +
'    cancel.addEventListener("click",function(){ document.body.removeChild(mask); });' +
'    ok.addEventListener("click",function(){' +
'      var arr=Array.from(picks).sort();' +   // ★Set.prototype.sliceは無い＝Array.fromで配列化する（Array.prototype.slice.callだと空配列になるバグを実機検証で発見）
'      manualDates = arr.length ? arr : null;' +
'      updateDateBoxLabel_();' +
'      if(manualDates) clearPresetSel();' +
'      setAllWd_();' +   // 日付を選び直したら曜日絞り込みは必ず「全て」に戻す（2026-07-17ユーザー指示）
'      document.body.removeChild(mask);' +
'    });' +
'    ftr.appendChild(cancel); ftr.appendChild(ok);' +
'    box.appendChild(ftr);' +
'  }' +
'  draw();' +
'}' +
'function iso(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }' +
'function addDays(iso0,n){ var d=new Date(iso0+"T00:00:00"); d.setDate(d.getDate()+n); return iso(d); }' +
'function clamp(v){ if(minD&&v<minD)return minD; if(maxD&&v>maxD)return maxD; return v; }' +
'function endOfThisWeek(iso0){ var d=new Date(iso0+"T00:00:00"); var wd=(d.getDay()+6)%7; return addDays(iso0,6-wd); }' +
'var selectedWd=null;' +   // null=「全て」＝曜日での絞り込み無し。配列の時はその曜日番号(getDay())だけ表示。
'function wdVisible_(dt){ if(!selectedWd) return true; var d=new Date(dt+"T00:00:00"); return selectedWd.indexOf(d.getDay())>-1; }' +
'var rangeFrom=minD, rangeTo=minD;' +   // プリセット(今日/明日/今・来週/全期間)が使う範囲
'function applyFilter(){' +
'  var shown=0;' +
'  days.forEach(function(el){' +
'    var dt=el.getAttribute("data-date")||"";' +
'    var vis;' +
'    if(manualDates&&manualDates.length){ vis = manualDates.indexOf(dt)>-1 && wdVisible_(dt); }' +
'    else { vis = dt && dt>=rangeFrom && dt<=rangeTo && wdVisible_(dt); }' +
'    el.classList.toggle("akidatehide", !vis);' +
'    if(vis) shown++;' +
'  });' +
'  if(emptyMsg) emptyMsg.hidden = shown>0;' +
'}' +
'function setRange(f,t){ rangeFrom=clamp(f); rangeTo=clamp(t); manualDates=null; updateDateBoxLabel_(); applyFilter(); }' +
'function setSingle_(f){ setRange(f,f); }' +
'var presets=[].slice.call(document.querySelectorAll(".akipreset"));' +
'function clearPresetSel(){ presets.forEach(function(b){ b.classList.remove("on"); }); }' +
'if(fromEl){' +
'  fromEl.addEventListener("click",function(){ openAkiCal_(fromEl); });' +
'  presets.forEach(function(b){ b.addEventListener("click",function(){' +
'    presets.forEach(function(x){ x.classList.toggle("on", x===b); });' +
'    var kind=b.getAttribute("data-preset");' +
'    var today=minD;' +
'    setAllWd_();' +   // 今日/明日/今・来週/全期間を選んだら曜日絞り込みは必ず「全て」に戻す（2026-07-17ユーザー指示）
'    if(kind==="today") setSingle_(today);' +
'    else if(kind==="tomorrow") setSingle_(addDays(today,1));' +
'    else if(kind==="thisnext") setRange(today, addDays(endOfThisWeek(today),7));' +
'    else if(kind==="all") setRange(minD, maxD);' +
'  }); });' +
// 曜日ボタン（2026-07-17ユーザー指示）：既定は「全て」。個別の曜日は複数選択でき、押した瞬間
// 「全て」は外れる。個別選択を全部外すと「全て」に自動で戻す（何も表示されない状態を作らない）。
'  var wdBtns=[].slice.call(document.querySelectorAll(".akiwd"));' +
'  function setAllWd_(){ selectedWd=null; wdBtns.forEach(function(b){ b.classList.toggle("on", b.getAttribute("data-wd")==="all"); }); applyFilter(); }' +
'  wdBtns.forEach(function(b){ b.addEventListener("click",function(){' +
'    var wd=b.getAttribute("data-wd");' +
'    if(wd==="all"){ setAllWd_(); return; }' +
'    if(!selectedWd) selectedWd=[];' +
'    var n=Number(wd), idx=selectedWd.indexOf(n);' +
'    if(idx>-1) selectedWd.splice(idx,1); else selectedWd.push(n);' +
'    if(!selectedWd.length){ setAllWd_(); return; }' +
'    wdBtns[0].classList.remove("on"); b.classList.toggle("on", idx===-1);' +
// ★曜日を新しく選んだ時は、期間を「全期間」にする（2026-07-17ユーザー指示）。
//   「全期間の中のその曜日」を見るための機能なので、「今日」等の狭い期間のままだと
//   該当日が無く「表示できるデータがありません」になってしまう。
'    if(idx===-1){ setRange(minD, maxD); presets.forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-preset")==="all"); }); }' +
'    applyFilter();' +
'  }); });' +
// 長さボタン（2026-07-17ユーザー指示・「以上」ロジックに変更）：単一選択。
// 30分＝30分以上を全部／60分＝60分以上を全部／120分＝120分以上を全部（すべて同じロジック）。
// 対象は各時間帯別の1行(.akirow[data-dur])とスタッフ別/施術室別の枠チップ(.akislot[data-dur])。
'  var durBtns=[].slice.call(document.querySelectorAll(".akidurbtn"));' +
'  var durRows=[].slice.call(document.querySelectorAll(".akirow[data-dur], .akislot[data-dur]"));' +
'  durBtns.forEach(function(b){ b.addEventListener("click",function(){' +
'    durBtns.forEach(function(x){ x.classList.toggle("on", x===b); });' +
'    var kind=b.getAttribute("data-dur");' +
'    var lo = kind==="all" ? 0 : Number(kind);' +
'    durRows.forEach(function(el){' +
'      var dur=Number(el.getAttribute("data-dur"));' +
'      el.classList.toggle("akidurhide", dur<lo);' +
'    });' +
'  }); });' +
'  setRange(minD, addDays(endOfThisWeek(minD),7));' +   // 初期表示＝今・来週（2026-07-16ユーザー指定で今日ピンポイントから変更）
'}' +
'})();</scr' + 'ipt>';

var AKICSS_ =
'  :root{ --akibg:#16141e; --akicard:#211f2c; --akiink:#f1eef8; --akisub:#9a95a9; --akiline:#34313f;' +
'    --akiprimary:#a79fff; }' +
'  @media (prefers-color-scheme:light){ :root{ --akibg:#eef1f6; --akicard:#ffffff; --akiink:#1f2937;' +
'    --akisub:#6b7280; --akiline:#d7dee8; --akiprimary:#2563eb; } }' +
'  body{ background:var(--akibg); }' +
'  .akiwrap{ max-width:760px; margin:0 auto; padding:14px 14px 40px; font-family:"Yu Gothic UI","Hiragino Sans",sans-serif; color:var(--akiink); }' +
'  .akibar{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }' +
// 施術室被り検出画面の「← 前に戻る」(.homelink)と同じ見た目に統一（2026-07-17ユーザー指示）。
'  .akihome{ flex:0 0 auto; font-size:.9rem; font-weight:700; color:var(--akiink); text-decoration:none;' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:10px; padding:10px 14px; }' +
'  .akihome:active{ transform:translateY(1px); }' +
'  .akigen{ flex:0 0 auto; color:var(--akisub); font-size:16px; font-weight:700; text-align:right; }' +
'  .akiwrap h1{ font-size:22px; margin:2px 0 2px; }' +
'  .akidatebar{ display:flex; flex-direction:column; gap:8px; margin-bottom:12px; }' +
// ★日付BOX＋今日/明日/今・来週/全期間を1行に収める（2026-07-17ユーザー指示）。
//   幅が本当に足りない端末だけ横スクロールで逃がす（折り返して2行にはしない）。
'  .akidaterow{ display:flex; align-items:center; gap:5px; flex-wrap:nowrap; width:100%; overflow-x:auto; }' +
'  .akidate{ font-family:inherit; font-size:13px; font-weight:700; color:var(--akiink);' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:9px;' +
'    padding:9px 6px; flex:1 1 64px; min-width:64px; text-align:center; cursor:pointer; caret-color:transparent; }' +
'  .akidate::placeholder{ color:var(--akisub); font-weight:700; }' +
'  .akidate.on{ color:#fff; background:var(--akiprimary); border-color:var(--akiprimary); }' +
'  .akidate.on::placeholder{ color:#fff; }' +
'  .akicalmask{ position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex;' +
'    align-items:center; justify-content:center; z-index:9999; padding:16px; }' +
'  .akicalbox{ background:var(--akicard); border:1px solid var(--akiline); border-radius:16px;' +
'    padding:14px; width:100%; max-width:340px; }' +
'  .akicalhdr{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }' +
'  .akicalhdr span{ font-weight:800; font-size:16px; color:var(--akiink); }' +
'  .akicalhdr button{ font-family:inherit; font-size:15px; font-weight:700; color:var(--akiink);' +
'    background:transparent; border:1px solid var(--akiline); border-radius:8px; padding:4px 10px; cursor:pointer; }' +
'  .akicalnote{ color:var(--akisub); font-size:12px; margin-bottom:6px; }' +
'  .akicalwk{ display:grid; grid-template-columns:repeat(7,1fr); text-align:center;' +
'    color:var(--akisub); font-size:13px; font-weight:700; margin-bottom:4px; }' +
'  .akicalwk .aki6{ color:#4d8fe0; } .akicalwk .aki0{ color:#e05a5a; }' +
'  .akicalgrid{ display:grid; grid-template-columns:repeat(7,1fr); gap:4px; }' +
'  .akicalgrid button{ font-family:inherit; font-size:14px; font-weight:700; color:var(--akiink);' +
'    background:transparent; border:1px solid transparent; border-radius:8px; padding:8px 0; cursor:pointer; }' +
'  .akicalgrid button:disabled{ color:var(--akisub); opacity:.35; cursor:default; }' +
'  .akicalgrid button.sel{ background:var(--akiprimary); color:#fff; }' +
'  .akicalftr{ display:flex; gap:8px; margin-top:12px; }' +
'  .akicalftr button{ flex:1 1 0; font-family:inherit; font-size:15px; font-weight:700;' +
'    border-radius:10px; padding:10px 0; cursor:pointer; }' +
'  .akicalcancel{ background:transparent; color:var(--akisub); border:1px solid var(--akiline); }' +
'  .akicalok{ background:var(--akiprimary); color:#fff; border:1px solid var(--akiprimary); }' +
// ★1行に収めるため縮小（2026-07-17ユーザー指示）。今日/明日は.smでさらに一段小さく。
'  .akipreset{ flex:0 0 auto; white-space:nowrap; font-family:inherit; font-size:13px; font-weight:700;' +
'    color:var(--akisub); background:var(--akicard); border:1px solid var(--akiline); border-radius:9px;' +
'    padding:9px 11px; cursor:pointer; }' +
'  .akipreset.sm{ font-size:12px; padding:8px 9px; }' +
'  .akipreset.on{ color:#fff; background:var(--akiprimary); border-color:var(--akiprimary); }' +
'  .akiwdrow{ display:flex; gap:8px; flex-wrap:wrap; width:100%; margin-top:8px; }' +
'  .akiwd{ font-family:inherit; font-size:16px; font-weight:700; color:var(--akisub);' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:10px;' +
'    padding:11px 16px; cursor:pointer; }' +
'  .akiwd.on{ color:#fff; background:var(--akiprimary); border-color:var(--akiprimary); }' +
'  .akidurrow{ display:flex; gap:8px; flex-wrap:wrap; width:100%; margin-top:8px; }' +
'  .akidurbtn{ font-family:inherit; font-size:16px; font-weight:700; color:var(--akisub);' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:10px;' +
'    padding:11px 16px; cursor:pointer; }' +
'  .akidurbtn.on{ color:#fff; background:var(--akiprimary); border-color:var(--akiprimary); }' +
'  .akirow.akidurhide, .akislot.akidurhide{ display:none; }' +
'  .akiday.akidatehide{ display:none; }' +
'  .akichips{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }' +
'  .akichip{ font-family:inherit; font-size:17px; font-weight:700; color:var(--akisub);' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:10px;' +
'    padding:10px 16px; cursor:pointer; }' +
'  .akichip.on{ color:#fff; background:var(--akiprimary); border-color:var(--akiprimary); }' +
'  .akiday{ background:var(--akicard); border:1px solid var(--akiline); border-radius:14px;' +
'    padding:12px 14px; margin-bottom:12px; }' +
'  .akidh{ font-weight:800; font-size:25px; border-bottom:1px solid var(--akiline);' +
'    padding-bottom:6px; margin-bottom:8px; }' +
'  .akiclosed{ color:#c33; font-weight:700; font-size:16px; }' +
'  .akisec.akihidden{ display:none; }' +
'  .akisl{ font-size:15px; font-weight:800; color:var(--akiprimary); margin:8px 0 6px; }' +
'  .akirow{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:8px 0;' +
'    border-bottom:1px solid var(--akiline); font-size:17px; }' +
'  .akirow:last-child{ border-bottom:none; }' +
'  .akitime{ font-weight:800; font-size:24px; min-width:142px; font-variant-numeric:tabular-nums; }' +
'  .akidur{ color:var(--akisub); font-size:24px; font-weight:700; min-width:56px; }' +
'  .akisep{ color:var(--akisub); font-weight:800; }' +
'  .akibadge{ display:inline-block; color:#fff; font-weight:700; font-size:19px;' +
'    padding:4px 12px; border-radius:999px; white-space:nowrap; }' +
'  .akishift{ color:var(--akisub); font-size:14.5px; font-weight:700; }' +
'  .akirooms{ display:flex; flex-wrap:nowrap; gap:1px; flex:1 1 auto; min-width:0;' +
'    overflow-x:auto; -webkit-overflow-scrolling:touch; padding-bottom:2px; }' +
'  .akiroom{ display:inline-block; flex:0 0 auto; color:#fff; font-weight:700; font-size:14px;' +
'    padding:1px 2px; border-radius:999px; white-space:nowrap; }' +
'  .akiroom.lg{ font-size:16px; padding:4px 13px; }' +
'  .akinorooms{ color:#c33; font-size:14.5px; white-space:nowrap; }' +
'  .akislot{ display:inline-block; background:var(--akibg); border:1px solid var(--akiline);' +
'    border-radius:8px; padding:5px 12px; font-size:19px; font-weight:700; font-variant-numeric:tabular-nums; }' +
'  .akislot b{ font-weight:700; color:var(--akisub); margin-left:3px; font-size:15px; }' +
'  .akinone{ color:#c33; font-size:15px; padding:4px 0; }';

function renderLinksError_(err, base, staff, dev) {
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">🔗</span><span class="bname">各種LINK</span></div>' +
    '<div class="soon">' +
      '<div class="soonic">📄</div>' +
      '<div class="soontitle" style="font-size:1.4rem">データ未生成</div>' +
      '<div class="soondesc">' + esc_(err && err.message ? err.message : err) + '</div>' +
    '</div>' +
  '</div>';
}

/** 各種LINKページの描画（純JS・GAS API不使用）。②静的アプリのJSONP経由から呼ばれる
 *  （データは事務所PCが Googleシート「ズコLINK」タブを読んで links.json に書き出したもの＝
 *  export_links_super.py。GASは計算しない＝描くだけ）。
 *  2段階の画面：①案内名の大きなボタン一覧 → ②押した案内の言語ボタン一覧（押すとURLを
 *  クリップボードにコピーし、そのままLINEの入力欄に貼り付けて送る想定）。どちらも大きな文字・
 *  大きなボタンにして遠目にも読める見た目にする（2026-07-18ユーザー指摘：見にくい→修正）。 */
function renderLinksPage_(d, base, staff, dev) {
  var topics = (d && d.topics) || [];
  var list = topics.length
    ? topics.map(lkTopicItem_).join('')
    : '<div class="lknone">まだ案内リンクが登録されていません。</div>';
  var panes = topics.map(lkLangPane_).join('');

  return '' +
'<style>' + LKCSS_ + '</style>' +
'<div class="lkwrap">' +
  '<div class="lkbar">' +
    '<a class="lkhome" href="' + (base || '') + '?view=home' + roleSfx_(staff, dev) + '" target="_top">← TOPに戻る</a>' +
    '<span class="lkgen">生成: ' + esc_(d.generated_at || '—') + '</span>' +
  '</div>' +
  '<h1>🔗 各種LINK</h1>' +
  '<div id="lklist">' +
    '<div class="lkhint">送りたい案内を選んでください</div>' +
    list +
  '</div>' +
  panes +
'</div>' +
LKSCRIPT_;
}

// ①一覧画面のボタン＝案内名だけの大きなボタン（押すと②へ切り替わる）。
function lkTopicItem_(topic, idx) {
  return '<button type="button" class="lkitem" data-idx="' + idx + '">' +
    '<span class="lkitemname">' + esc_(topic.name || '') + '</span>' +
    '<span class="lkchev">›</span>' +
  '</button>';
}

// ②言語選択画面（案内ごとに1枚・既定は隠す。①のボタンを押した時だけJSで表示切替）。
function lkLangPane_(topic, idx) {
  var btns = (topic.links || []).map(lkLinkBtn_).join('');
  return '<div class="lklangpane" data-idx="' + idx + '" hidden>' +
    '<button type="button" class="lkback">‹ LINK一覧へ戻る</button>' +
    '<div class="lktitle">' + esc_(topic.name || '') + '</div>' +
    '<div class="lkhint">言語を選ぶとURLがコピーされます</div>' +
    '<div class="lklangbtns">' + btns + '</div>' +
  '</div>';
}

function lkLinkBtn_(lk) {
  return '<button type="button" class="lkbtn" data-url="' + esc_(lk.url || '') + '">' +
    '<span class="lklang">' + esc_(lk.lang || '') + '</span>' +
    '<span class="lkcopy">タップして<br>URLをコピー</span>' +
  '</button>';
}

// クリップボードへのコピー＝navigator.clipboard（httpsのみ有効）優先、使えない端末は
// textarea+execCommandへ自動で切り替える（LINE内ブラウザ等の古い実装向けフォールバック）。
// ＋①案内一覧⇄②言語選択の画面切替（同じページ内でhidden属性を付け外しするだけ・再取得なし）。
var LKSCRIPT_ =
'<script>(function(){' +
'function fallbackCopy_(text){' +
'  var ta=document.createElement("textarea"); ta.value=text;' +
'  ta.style.position="fixed"; ta.style.opacity="0";' +
'  document.body.appendChild(ta); ta.focus(); ta.select();' +
'  var ok=false; try{ ok=document.execCommand("copy"); }catch(e){}' +
'  document.body.removeChild(ta); return ok;' +
'}' +
'function copyText_(text, done){' +
'  if(navigator.clipboard && navigator.clipboard.writeText){' +
'    navigator.clipboard.writeText(text).then(function(){ done(true); }, function(){ done(fallbackCopy_(text)); });' +
'  } else { done(fallbackCopy_(text)); }' +
'}' +
'var list=document.getElementById("lklist");' +
'var panes=[].slice.call(document.querySelectorAll(".lklangpane"));' +
'function showList_(){ if(list) list.hidden=false; panes.forEach(function(p){ p.hidden=true; }); window.scrollTo(0,0); }' +
'function showPane_(idx){ if(list) list.hidden=true; panes.forEach(function(p){ p.hidden = p.getAttribute("data-idx")!==String(idx); }); window.scrollTo(0,0); }' +
'[].slice.call(document.querySelectorAll(".lkitem")).forEach(function(btn){' +
'  btn.addEventListener("click", function(){ showPane_(btn.getAttribute("data-idx")); });' +
'});' +
'panes.forEach(function(p){' +
'  var back=p.querySelector(".lkback");' +
'  if(back) back.addEventListener("click", showList_);' +
'});' +
'[].slice.call(document.querySelectorAll(".lkbtn")).forEach(function(btn){' +
'  btn.addEventListener("click", function(){' +
'    var url=btn.getAttribute("data-url")||"";' +
'    var label=btn.querySelector(".lkcopy");' +
'    copyText_(url, function(ok){' +
'      var prev=label.innerHTML;' +
'      label.textContent = ok ? "✅ コピーしました" : "コピー失敗";' +
'      btn.classList.toggle("lkok", ok);' +
'      setTimeout(function(){ label.innerHTML=prev; btn.classList.remove("lkok"); }, 1500);' +
'    });' +
'  });' +
'}); ' +
'})();</scr' + 'ipt>';

// ★見やすさ最優先（2026-07-18ユーザー指摘で全面拡大）：一覧ボタン・言語ボタンとも大きな文字・
//   大きなタップ域にする（自動監視の「文字サイズ拡大（老眼対応）」と同じ考え方）。
//   :root の色変数はAKICSS_と同じ値を持たせている（このページはAKICSS_を読み込まないため自前で持つ）。
var LKCSS_ =
'  :root{ --akibg:#16141e; --akicard:#211f2c; --akiink:#f1eef8; --akisub:#9a95a9; --akiline:#34313f;' +
'    --akiprimary:#a79fff; }' +
'  @media (prefers-color-scheme:light){ :root{ --akibg:#eef1f6; --akicard:#ffffff; --akiink:#1f2937;' +
'    --akisub:#6b7280; --akiline:#d7dee8; --akiprimary:#2563eb; } }' +
'  .lkwrap{ max-width:760px; margin:0 auto; padding:14px 14px 40px;' +
'    font-family:"Yu Gothic UI","Hiragino Sans",sans-serif; color:var(--akiink); }' +
'  .lkbar{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }' +
'  .lkhome{ flex:0 0 auto; font-size:.9rem; font-weight:700; color:var(--akiink); text-decoration:none;' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:10px; padding:10px 14px; }' +
'  .lkhome:active{ transform:translateY(1px); }' +
'  .lkgen{ flex:0 0 auto; color:var(--akisub); font-size:15px; font-weight:700; text-align:right; }' +
'  .lkwrap h1{ font-size:24px; margin:2px 0 10px; }' +
'  .lkhint{ color:var(--akisub); font-size:16px; margin-bottom:14px; font-weight:700; }' +
// ①案内一覧＝1件1行、大きな文字・大きなタップ域（フルワイド）。
'  .lkitem{ appearance:none; -webkit-appearance:none; display:flex; align-items:center;' +
'    justify-content:space-between; width:100%;' +
'    font-family:inherit; font-size:22px; font-weight:800; color:var(--akiink); text-align:left;' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:16px;' +
'    padding:22px 22px; margin-bottom:14px; cursor:pointer; box-shadow:0 4px 14px rgba(0,0,0,.06); }' +
'  .lkitem:active{ transform:translateY(2px); }' +
'  .lkitemname{ font-size:33px; font-weight:800; color:#2563eb; }' +
'  .lkchev{ color:#2563eb; font-size:30px; font-weight:800; margin-left:10px; }' +
// ②言語選択＝案内名を大見出しにし、言語ボタンは横並び（2026-07-18ユーザー指摘で縦積み→横並びに変更）。
'  .lkback{ appearance:none; -webkit-appearance:none; font-family:inherit; font-size:16px;' +
'    font-weight:700; color:var(--akiink);' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:10px;' +
'    padding:10px 16px; margin-bottom:16px; cursor:pointer; }' +
'  .lkback:active{ transform:translateY(1px); }' +
'  .lktitle{ font-size:28px; font-weight:800; margin-bottom:4px; line-height:1.3; color:#fff; }' +
'  .lklangbtns{ display:flex; flex-direction:row; flex-wrap:wrap; gap:14px; margin-top:10px; }' +
// ★言語ボタンは白背景＋濃い青文字（2026-07-18ユーザー指定＝白ベースにしてほしい）。
//   `appearance:none`（＋Safari/LINE内蔵ブラウザ向けに`-webkit-appearance:none`）は端末標準の
//   ボタン装飾を消して指定した色を確実に出すためのもの（既存の`.unadetail`等と同じ作法）。
'  .lkbtn{ appearance:none; -webkit-appearance:none; font-family:inherit; display:flex;' +
'    flex-direction:column; align-items:center;' +
'    justify-content:center; gap:6px; flex:1 1 140px; min-width:140px; color:#1d4ed8; background:#ffffff;' +
'    border:1px solid #d7dee8; border-radius:18px; padding:26px 14px; cursor:pointer;' +
'    box-shadow:0 4px 14px rgba(0,0,0,.18); }' +
'  .lkbtn:active{ transform:translateY(2px); }' +
'  .lklang{ font-size:30px; font-weight:800; }' +
'  .lkcopy{ font-size:16px; font-weight:800; color:#6b7280; text-align:center; line-height:1.4; }' +
'  .lkbtn.lkok{ background:#eafff1; border-color:#16a34a; }' +
'  .lkbtn.lkok .lklang, .lkbtn.lkok .lkcopy{ color:#16a34a; }' +
'  .lknone{ color:#c33; font-size:16px; padding:8px 0; }';

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

// .fit1line の文字を、はみ出さなくなるまで1pxずつ縮めて必ず1行に収める
// （URIAGESCRIPT_の金額(.uv)自動縮小と同じ手法）。
// ★隠れている要素(hidden)は幅が0のため縮小計算ができない＝開いた瞬間にもう一度かける必要がある。
//   そのため window.szFit1Line_ として公開し、MOVESCRIPT_のパネル開閉時にも呼ぶ（2026-07-16）。
var FIT1LINE_SCRIPT_ =
'<script>(function(){' +
'window.szFit1Line_=function(root){' +
'  var els=(root||document).querySelectorAll(".fit1line");' +
'  for(var i=0;i<els.length;i++){' +
'    var el=els[i];' +
'    if(!el.clientWidth) continue;' +            // 隠れている間は測れないので飛ばす
'    if(!el.dataset.baseFont){ el.dataset.baseFont=getComputedStyle(el).fontSize; }' +
'    el.style.fontSize=el.dataset.baseFont;' +   // 毎回いちばん大きい状態から測り直す
'    var tries=0;' +
'    while(el.scrollWidth>el.clientWidth && tries<40){' +
'      var cur=parseFloat(getComputedStyle(el).fontSize);' +
'      el.style.fontSize=(cur-1)+"px"; tries++;' +
'    }' +
'  }' +
// ★.mvlabel(移動先の部屋を選んでね)と.mvhint(※空いている施術室のみ...)は文字数が違うため、
//   上のループで別々に縮めると文章の長さ次第で大きさがズレる（2026-07-17ユーザー指摘）。
//   同じ.mvrow内のペアだけ、縮んだ結果の小さい方に両方合わせて必ず同じ大きさにする。
'  var rows=(root||document).querySelectorAll(".mvrow");' +
'  for(var j=0;j<rows.length;j++){' +
'    var lb=rows[j].querySelector(".mvlabel"), hn=rows[j].querySelector(".mvhint");' +
'    if(!lb||!hn||!lb.clientWidth||!hn.clientWidth) continue;' +
'    var min=Math.min(parseFloat(getComputedStyle(lb).fontSize), parseFloat(getComputedStyle(hn).fontSize));' +
'    lb.style.fontSize=min+"px"; hn.style.fontSize=min+"px";' +
'  }' +
'};' +
'window.szFit1Line_();' +
'})();</scr' + 'ipt>';

// 部屋付け替えのUI操作（トグル→依頼→処理中→結果）。google.script.run で同オリジン呼び出し。
var MOVESCRIPT_ =
'<script>(function(){' +
'var wrap=document.querySelector(".wrap"); if(!wrap) return;' +
// ①直リンク(google.script.runが使える)・②静的アプリ(使えない→JSONPで代用)のどちらでも
// 同じ見た目・同じ安全弁(サーバー側_submitToQueue_)で部屋移動できるようにする共通呼び出し口。
// ★EDIT_KEY_CLIENT_はページソースに公開される前提（②で使うため）。サーバー側で
//   「今まさに被り検出に出ている予定か」「直近の依頼数」を必ずチェックする安全弁と対にしてある。
'var EXEC_URL_="https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec";' +
'var EDIT_KEY_CLIENT_="kx7Q2p9mVt4Zr8";' +
'function callGas_(fnName, args, actionName, extraParams, onResult){' +
'  if(typeof google!=="undefined" && google.script && google.script.run){' +
'    var runner=google.script.run' +
'      .withSuccessHandler(function(r){ onResult(r); })' +
'      .withFailureHandler(function(e){ onResult({ok:false,error:String(e)}); });' +
'    runner[fnName].apply(runner, args);' +
'    return;' +
'  }' +
'  var cb="__cc"+Date.now()+Math.floor(Math.random()*1000);' +
'  window[cb]=function(r){ try{ delete window[cb]; }catch(ig){} onResult(r); };' +
'  var qs="action="+actionName+"&key="+encodeURIComponent(EDIT_KEY_CLIENT_)+"&callback="+cb;' +
'  for(var k in extraParams){ qs+="&"+k+"="+encodeURIComponent(extraParams[k]); }' +
'  var s=document.createElement("script");' +
'  s.src=EXEC_URL_+"?"+qs;' +
'  s.onerror=function(){ onResult({ok:false,error:"通信エラー"}); };' +
'  document.body.appendChild(s);' +
'}' +
// 操作者(who)＝端末で選んだ名前(localStorage)を優先。無ければ①GAS-direct用のURL由来(window.__SZ_*)。
'function szIdent_(){ var w="",r="",d=""; try{ w=localStorage.getItem("sz_who")||""; r=localStorage.getItem("sz_role")||""; d=localStorage.getItem("sz_device")||""; }catch(e){}' +
'  if(!w&&window.__SZ_WHO_)w=window.__SZ_WHO_; if(!r&&window.__SZ_ROLE_)r=window.__SZ_ROLE_; if(!d&&window.__SZ_DEVICE_)d=window.__SZ_DEVICE_; return {who:w,role:r,device:d}; }' +
'function submitMove_(cal,evid,toCal,toLabel,room,title,fromRoom,onDone){' +
'  var idn=szIdent_();' +
'  callGas_("uiSubmitMove",[cal,evid,toCal,toLabel,room,title,idn.who,idn.device,fromRoom],"submit",' +
'    {op:"movecal",who:idn.who,role:idn.role,device:idn.device,' +
'     fields:JSON.stringify({cal:cal,event:evid,to_cal:toCal,to_label:toLabel,room:room,' +
'       title:title,from_room:fromRoom})}, onDone);' +
'}' +
'function statusCheck_(id,onDone){' +
'  callGas_("uiStatus",[id],"status",{id:id}, onDone);' +
'}' +
// ブラウザ標準confirm/alertは「ttsuperzuco.github.io says」のようにドメイン名を強制表示して
// しまい消せない（ブラウザのセキュリティ機能）ため、自前のポップアップ（ドメイン名なし）で代用する。
// isHtml=true の時だけ msg をタグ付きで差し込む（部屋の色付きマーク表示用）。呼び出し元が
// 組み立てた固定文言のみに使い、ユーザー入力をそのまま渡さない（esc_ 済みの値のみ埋め込む）。
'function ccPopup_(msg, showCancel, onYes, isHtml){' +
'  var mask=document.createElement("div"); mask.className="ccmask";' +
'  mask.innerHTML="<div class=\\"ccbox\\"><div class=\\"ccmsg\\"></div><div class=\\"ccbtns\\">"+' +
'    (showCancel?"<button type=\\"button\\" class=\\"ccno\\">キャンセル</button>":"")+' +
'    "<button type=\\"button\\" class=\\"ccyes\\">OK</button></div></div>";' +
'  if(isHtml) mask.querySelector(".ccmsg").innerHTML=msg; else mask.querySelector(".ccmsg").textContent=msg;' +
'  document.body.appendChild(mask);' +
'  mask.querySelector(".ccyes").addEventListener("click",function(){ document.body.removeChild(mask); if(onYes) onYes(); });' +
'  var no=mask.querySelector(".ccno"); if(no) no.addEventListener("click",function(){ document.body.removeChild(mask); });' +
'}' +
// 部屋名を確認ポップアップ用の色付きマークにする（施術室被りの他画面(.room)と同じ見た目）。
'function ccH_(s){ return String(s==null?"":s).replace(/[&<>"\']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\'":"&#39;"}[c]; }); }' +
'function ccRoomBadge_(name,color){ return "<span class=\\"ccroom\\" style=\\"--rc:"+ccH_(color)+"\\">"+ccH_(name)+"</span>"; }' +
'wrap.addEventListener("click",function(ev){' +
'  var t=ev.target;' +
'  if(t.classList&&t.classList.contains("mvtoggle")){' +
'    var mvw=t; while(mvw&&!(mvw.classList&&mvw.classList.contains("mv"))) mvw=mvw.parentNode; if(!mvw) return;' +
'    var side=t.getAttribute("data-side");' +
'    var pn=mvw.querySelector(\'.mvpanel[data-side="\'+side+\'"]\'); if(!pn) return;' +
'    var willOpen=pn.hidden;' +
// ★A/B同時に開けない（2026-07-17ユーザー指摘）：片方を移動する準備中にもう片方も
//   開けてしまうと、被りが解消したはずの時間帯がその場でズレて分かりにくくなる。
//   押した方を開く時は、もう片方の枠を必ず閉じる（枠自体は2つとも常に表示されたまま）。
'    Array.prototype.forEach.call(mvw.querySelectorAll(".mvpanel"),function(p){ p.hidden=true; });' +
'    Array.prototype.forEach.call(mvw.querySelectorAll(".mvtoggle"),function(b){ b.classList.remove("open"); });' +
'    if(willOpen){ pn.hidden=false; t.classList.add("open"); }' +
'    if(!pn.hidden&&window.szFit1Line_) window.szFit1Line_(pn);' +   // 開いた瞬間に1行へ収める
// ★移動先を選ぶ準備中は、氏名・施術内容を隠して詰める（2026-07-17ユーザー指示）。
//   もう決まっている情報（誰の予約か）を毎回見返す必要はない＝隠すだけで下のボタンが
//   自動的に上へ詰まる（display:noneなので特別なアニメーション処理は不要）。
'    var crd=mvw; while(crd&&!(crd.classList&&crd.classList.contains("card"))) crd=crd.parentNode;' +
'    if(crd) crd.classList.toggle("moving",willOpen);' +
'    return;' +
'  }' +
'  if(t.classList&&t.classList.contains("rstoggle")){' +
'    var pnl=t; while(pnl&&!(pnl.classList&&pnl.classList.contains("mvpanel"))) pnl=pnl.parentNode; if(!pnl) return;' +
'    var pn=pnl.querySelector(".rspanel"); if(pn) pn.hidden=!pn.hidden; t.classList.toggle("open",!pn.hidden); return;' +
'  }' +
'  if(t.classList&&t.classList.contains("mvbtn")){' +
'    if(t.disabled) return;' +
'    var mv=t; while(mv&&!(mv.classList&&mv.classList.contains("mv"))) mv=mv.parentNode; if(!mv) return;' +
'    var cal=t.getAttribute("data-cal"), evid=t.getAttribute("data-ev");' +
'    var toCal=t.getAttribute("data-tocal"), toLabel=t.getAttribute("data-tolabel");' +
'    var room=t.getAttribute("data-room"), title=t.getAttribute("data-title");' +
'    var who=t.getAttribute("data-who")||"", fromRoom=t.getAttribute("data-fromroom")||"", mtime=t.getAttribute("data-time")||"";' +
'    var whoShort=t.getAttribute("data-whoshort")||who;' +
'    var fromShort=t.getAttribute("data-fromshort")||fromRoom, toShort=t.getAttribute("data-toshort")||room;' +
'    var fromColor=t.getAttribute("data-fromcolor")||"#64748b", toColor=t.style.getPropertyValue("--rc")||"#64748b";' +
'    if(!cal||!evid){ ccPopup_("この予約のIDが取れず移動できません", false); return; }' +
'    ccPopup_(ccH_(whoShort)+"の予約を<br>"+ccRoomBadge_(fromShort,fromColor)+"から<br>"+' +
'      ccRoomBadge_(toShort,toColor)+"へ<br>移動します。<br>よろしいですか？", true, function(){' +
// ★押した瞬間に全画面「移動中」を出し、TimeTreeへの書き込みが本当に完了するまで出したまま。
//   完了したら全画面「✓完了」を0.5秒見せてから、被りが消えた一覧へ戻す（見た目の先行なし＝正確）。
'      mvOverlay_(who,mtime,fromRoom,room);' +
'      submitMove_(cal,evid,toCal,toLabel,room,title,fromRoom,function(r){' +
'        if(r && r.ok){ waitDoneThenFinish_(r.id,evid,room); }' +
'        else { mvOverlayHide_(); ccPopup_("⚠️ 移動できませんでした："+((r&&r.error)||"依頼に失敗")+"。もう一度お試しください。", false); }' +
'      });' +
'    }, true);' +
'  }' +
'});' +
// 「移動中」の説明文＝何を動かしているか（担当者マーク＋番号＋名前 と 時刻の予約）を明示（2026-07-12
//   ユーザー要望）。who="🍅 M375 蘇文宏様" 等、mtime="13:30-14:00" 等（開始時刻だけ使う）。
'function mvDesc_(who,mtime,fromRoom,room){ var t=(mtime||"").split("-")[0];' +
'  return (who?who+" ":"")+(t?t+"の予約を、":"")+"「"+fromRoom+"」から「"+room+"」へ移動中です"; }' +
'function movingHtml_(who,mtime,fromRoom,room){ return "⏳ "+mvDesc_(who,mtime,fromRoom,room)+' +
'  "<div style=\\"font-size:.82rem;font-weight:normal;margin-top:6px;line-height:1.5;\\">タイムツリーへの書き込みが完了したら自動で画面が切り替わりますので、しばらくお待ちください。</div>"; }' +
// ★待機は画面いっぱいのオーバーレイで出す（2026-07-12 ユーザー要望）。移動開始〜検出画面へ戻るまで
//   全画面で覆う。完了時の再描画で index.html 側が #mvWaitOverlay を消す（失敗時は mvOverlayHide_）。
'function mvOverlay_(who,mtime,fromRoom,room){ var ov=document.getElementById("mvWaitOverlay");' +
'  if(!ov){ ov=document.createElement("div"); ov.id="mvWaitOverlay";' +
'    ov.style.cssText="position:fixed;inset:0;z-index:9999;background:#2C7A99;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center;";' +
'    document.body.appendChild(ov); }' +
'  var t=(mtime||"").split("-")[0];' +
'  ov.innerHTML="<div style=\\"font-size:66px;margin-bottom:20px;\\">⏳</div>"+' +
'    "<div style=\\"color:#eaf3f7;font-size:22px;line-height:1.6;margin-bottom:14px;\\">"+(who?who:"")+(t?"　"+t+"の予約":"")+"</div>"+' +
'    "<div style=\\"color:#fff;font-size:33px;font-weight:800;line-height:1.5;margin-bottom:22px;\\">「"+fromRoom+"」から「"+room+"」へ<br>移動中です</div>"+' +
'    "<div style=\\"color:#eaf3f7;font-size:20px;line-height:1.8;max-width:420px;\\">タイムツリーへの書き込みが完了したら自動で画面が切り替わりますので、しばらくお待ちください。</div>";' +
'  return ov; }' +
'function mvOverlayHide_(){ var ov=document.getElementById("mvWaitOverlay"); if(ov&&ov.parentNode) ov.parentNode.removeChild(ov); }' +
// ★完了まで全画面のまま待ち、本当に完了したら全画面「✓完了」を0.5秒→被りを消して一覧へ戻す。
//   確認間隔はGoogleの応答速度が下限のため詰められる範囲で最短(0.25秒間隔)にしている。
// ★「完了しました」は自動で消えず、押すまで画面に残す（2026-07-17ユーザー指示）。
//   裏側のデータはこの時点で既に doneRefreshFast_ 済みなので、押した瞬間に最新の一覧が見える。
'function showDoneOverlay_(room){ var ov=document.getElementById("mvWaitOverlay");' +
'  if(!ov){ ov=document.createElement("div"); ov.id="mvWaitOverlay"; document.body.appendChild(ov); }' +
'  ov.style.cssText="position:fixed;inset:0;z-index:9999;background:#16a34a;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center;";' +
'  ov.innerHTML="<div style=\\"font-size:92px;margin-bottom:16px;\\">✓</div>"+' +
'    "<div style=\\"color:#fff;font-size:35px;font-weight:800;line-height:1.5;margin-bottom:26px;\\">「"+room+"」へ<br>移動が完了しました</div>"+' +
'    "<button type=\\"button\\" id=\\"mvBackBtn\\" style=\\"font:inherit;font-size:1.3rem;font-weight:800;color:#16a34a;background:#fff;border:0;border-radius:12px;padding:14px 26px;cursor:pointer;\\">施術室被り検出画面に戻る</button>";' +
'  document.getElementById("mvBackBtn").addEventListener("click",function(){' +
'    try{ window.__keepMvOverlay=false; }catch(e3){} mvOverlayHide_();' +
'  });' +
'  return ov; }' +
'function waitDoneThenFinish_(id,evid,room){ var tries=0;' +
'  function chk(){ tries++;' +
'    statusCheck_(id,function(r){ var s=(r&&r.status)||"";' +
'      if(s==="done"){ try{ window.__movedOut=window.__movedOut||{}; window.__movedOut[evid]=1; }catch(e){} showDoneOverlay_(room);' +
'        try{ window.__keepMvOverlay=true; }catch(e2){} doneRefreshFast_(); }' +
'      else if(s==="error"||s==="failed"){ mvOverlayHide_(); ccPopup_("⚠️ 移動できませんでした："+((r.result)||s)+"。もう一度お試しください。", false); }' +
'      else if(tries>=90){ mvOverlayHide_(); ccPopup_("⚠️ 処理が時間切れで失敗しました。Ryuさんに連絡してください", false); }' +
'      else { setTimeout(chk,250); } });' +
'  }' +
'  setTimeout(chk,250); }' +
// ★（旧・楽観的更新の部品。現在は未使用だが残置）小さなトースト＋裏での確定確認＋失敗時のロールバック。
'function mvToast_(msg){ var el=document.getElementById("mvToast");' +
'  if(!el){ el=document.createElement("div"); el.id="mvToast";' +
'    el.style.cssText="position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:9999;max-width:90%;background:#2C7A99;color:#fff;padding:12px 18px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.3);font-size:14px;line-height:1.5;text-align:center;";' +
'    document.body.appendChild(el); }' +
'  el.textContent=msg; el.style.background="#2C7A99"; return el; }' +
'function mvToastDone_(msg){ var el=document.getElementById("mvToast")||mvToast_(msg); el.textContent=msg; el.style.background="#16a34a";' +
'  setTimeout(function(){ try{ if(el&&el.parentNode) el.parentNode.removeChild(el); }catch(e){} },2500); }' +
'function mvToastHide_(){ var el=document.getElementById("mvToast"); if(el&&el.parentNode) el.parentNode.removeChild(el); }' +
// 裏で状態を確認：done=移動確定→トーストを✓に。error/timeout=移動失敗→被りを画面に戻して警告。
'function confirmMove_(id,evid,side,who,room){ var tries=0;' +
'  function chk(){ tries++;' +
'    statusCheck_(id,function(r){ var s=(r&&r.status)||"";' +
'      if(s==="done"){ mvToastDone_("✓ "+(who?who+"を":"")+"「"+room+"」へ移動しました"); }' +
'      else if(s==="error"||s==="failed"){ rollbackMove_(evid,(r.result)||s,side,who,room); }' +
'      else if(tries>=60){ rollbackMove_(evid,"時間切れ（事務所PCの見張りを確認）",side,who,room); }' +
'      else { setTimeout(chk,400); } });' +
'  }' +
'  setTimeout(chk,400); }' +
'function rollbackMove_(evid,reason,side,who,room){ try{ if(window.__movedOut) delete window.__movedOut[evid]; }catch(e){}' +
'  mvToastHide_(); doneRefreshFast_();' +
'  ccPopup_("⚠️ 移動できませんでした："+reason+"。画面に被りを戻しました。もう一度お試しください。", false); }' +
// 完了後の画面更新：★リロード画面を出さず、検出画面(showConflict)を直接再描画し、最上部へスクロールする
//   （2026-07-12）。静的アプリが window.__refreshConflictView を公開している時はそれを使う。
//   無い場合(GAS直アクセス等)だけ従来どおり location.reload() にフォールバック。
'function doneRefresh_(){ try{ window.scrollTo(0,0); }catch(e){}' +
'  try{ if(window.__refreshConflictView){ window.__refreshConflictView(); return; } }catch(e2){}' +
'  location.reload(); }' +
// ★完了時の即時描画：重いevents.jsonの再生成・再取得を待たず、手元データから動かした予約を
//   除外して即描画する（__renderConflictFromCache）。静的アプリに無ければ従来の再取得/リロードへ。
'function doneRefreshFast_(){ try{ window.scrollTo(0,0); }catch(e){}' +
'  try{ if(window.__renderConflictFromCache){ window.__renderConflictFromCache(); return; } }catch(e0){}' +
'  try{ if(window.__refreshConflictView){ window.__refreshConflictView(); return; } }catch(e2){}' +
'  location.reload(); }' +
'function pollMove(st,id,room,fromRoom,evid){' +
'  var tries=0;' +
'  function chk(){ tries++;' +
'    statusCheck_(id,function(r){' +
'      var s=(r&&r.status)||"";' +
'      if(s==="done"){ st.className="mvstatus ok"; try{ window.__movedOut=window.__movedOut||{}; window.__movedOut[evid]=1; }catch(e0){} doneRefreshFast_(); }' +
'      else if(s==="error"||s==="failed"){ mvOverlayHide_(); st.className="mvstatus err"; st.textContent="⚠️ 失敗："+((r.result)||s); }' +
'      else if(tries>=60){ mvOverlayHide_(); st.className="mvstatus err"; st.textContent="⚠️ 時間切れ。事務所PCの見張りが動いているか確認してください。"; }' +
'      else { setTimeout(chk,400); }' +
'    });' +
'  }' +
'  setTimeout(chk,400);' +
'}' +
// 移動完了後：★「解消しました／更新しています」の別画面は出さず（2026-07-12 ユーザー要望）、
//   移動中の待機案内（movingHtml_）を出したまま、移動したevent_idがevents.jsonから消えるのを
//   待って、消えたら doneRefresh_() で直接 検出画面へ戻す（リロード画面なし・最上部へスクロール）。
// 【なぜ待つ】反映には数秒〜最大1分の時間差がある。すぐ再描画すると古いevents.jsonで被りが復活
//   して見えるため、当該event_idが消えたのを確認してから戻す。最大約60秒でタイムアウト後も戻す。
'function showMoveDone_(st,msg,evid){' +
'  try{ st.className="mvstatus working"; }catch(e){}' +
'  var tries=0;' +
'  function chk(){ tries++;' +
'    var cb="__cd"+Date.now()+Math.floor(Math.random()*100000); var fired=false;' +
'    window[cb]=function(d){ if(fired) return; fired=true; try{delete window[cb];}catch(e){}' +
'      var gone=true; try{ var evs=(d&&d.events)||[]; for(var i=0;i<evs.length;i++){ if(evs[i].event_id===evid){ gone=false; break; } } }catch(e2){}' +
'      if(gone||tries>=60){ doneRefresh_(); } else { setTimeout(chk,1000); } };' +
'    var s=document.createElement("script"); s.src=EXEC_URL_+"?action=events&callback="+cb+"&cb="+Date.now();' +
'    s.onerror=function(){ if(fired) return; fired=true; if(tries>=60){ doneRefresh_(); } else { setTimeout(chk,1000); } };' +
'    document.body.appendChild(s); }' +
'  setTimeout(chk,1000);' +
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
'  .lai{ border-radius:9px; padding:8px 10px; margin-top:7px; font-size:12.5px; border:1px solid var(--line); }' +
'  .lai.laiv-true{ background:#fff7e6; border-color:#f0dca3; }' +
'  .lai.laiv-false{ background:rgba(127,127,127,.06); opacity:.75; }' +
'  .lai.laiv-check{ background:#eef4ff; border-color:#c9dcfa; }' +
'  @media (prefers-color-scheme:dark){' +
'    .lai.laiv-true{ background:#3a2f10; border-color:#5c4a1a; }' +
'    .lai.laiv-check{ background:#152238; border-color:#233a5c; }' +
'  }' +
'  .lailab{ font-weight:700; margin-right:8px; }' +
'  .laitrue{ color:var(--sub); }' +
'  .laireason{ margin-top:4px; color:var(--sub); }' +
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
'  img.bmark { width:66px; height:66px; border-radius:50%; object-fit:cover; }' +
'  .bname { font-size:2.05rem; font-weight:900; letter-spacing:.01em; color:#fb8c44; }' +
'  .hsub { text-align:center; color:#fff; font-weight:800; font-size:1.02rem;' +
'    letter-spacing:.06em; opacity:.92; margin:0 0 28px; }' +
// タイルは2列グリッドのまま、各タイル内を左アイコン／右文字の横並びに変更（2026-07-16）。
// 文字は最大2行まで自動折返し（-webkit-line-clamp:2）。1行に収まる短い文言はそのまま1行で出る。
'  .tiles { display:grid; grid-template-columns:1fr 1fr; gap:12px; }' +
'  .tile { display:flex; flex-direction:row; align-items:center; justify-content:flex-start;' +
'    gap:2px; text-align:left; text-decoration:none; color:var(--ink);' +
'    background:var(--card); border:1px solid var(--line); border-radius:16px; padding:10px 2px 10px 3px;' +
'    box-shadow:0 6px 18px rgba(0,0,0,.07); position:relative; overflow:hidden;' +
'    transition:transform .12s ease, box-shadow .12s ease; }' +
'  .tile::before { content:""; position:absolute; left:0; top:0; bottom:0; width:6px; height:auto; }' +
// ★タイルの色は全部見分けが付くように離した色相を使う（共通ルール・新タイル追加時も守る）：
//   rose #e11d48(350°)／indigo #6366f1(239°)／amber #f59e0b(38°)／emerald #0d9b6c(160°)／
//   sky #0ea5e9(199°)。新しく足す時は上の5色と色相が近い色（±30°以内）を避けて選ぶこと
//   （2026-07-16：akijikanの紫がindigoの紫と被って見えると指摘があり、skyに変更した実例）。
'  .tile.conflict::before { background:#e11d48; }' +
'  .tile.lt::before { background:#6366f1; }' +
'  .tile.uriage::before { background:#f59e0b; }' +
'  .tile.unanswered::before { background:#0d9b6c; }' +
'  .tile.akijikan::before { background:#0ea5e9; }' +
'  .tile.links::before { background:#65a30d; }' +
'  .tile.ttapp::before { background:#c026d3; }' +
'  .tile.zenjitsu::before { background:#db2777; }' +
'  .tile:active { transform:translateY(2px); box-shadow:0 3px 10px rgba(0,0,0,.10); }' +
'  @media (hover:hover){ .tile:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(0,0,0,.12); } }' +
'  .ticon { flex:none; width:36px; height:36px; border-radius:9px; font-size:21px;' +
'    display:grid; place-items:center; overflow:hidden; }' +
'  .ticon svg { width:100%; height:100%; display:block; }' +
'  .tile.conflict .ticon { background:rgba(225,29,72,.12); }' +
'  .tile.lt .ticon { background:rgba(148,163,184,.14); }' +
'  .tile.uriage .ticon { background:rgba(245,158,11,.16); }' +
'  .tile.unanswered .ticon { background:rgba(13,155,108,.12); }' +
'  .tile.akijikan .ticon { background:rgba(14,165,233,.16); }' +
'  .tile.links .ticon { background:rgba(101,163,13,.16); }' +
'  .tile.ttapp .ticon { background:rgba(192,38,211,.14); }' +
'  .tile.zenjitsu .ticon { background:rgba(219,39,119,.14); }' +
'  .lt2 { display:flex; flex-direction:column; align-items:center; justify-content:center;' +
'    gap:1px; width:100%; height:100%; }' +
'  .lt2 svg { height:16px; width:16px; flex:none; }' +
'  .tname { flex:1; min-width:0; font-size:1.3rem; font-weight:800; text-align:left; white-space:pre-line; line-height:1.18;' +
'    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }' +
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
'    background:#2C7A99; padding:4px 0 0; margin-bottom:0; }' +   // 「← 前に戻る」とタイトルの間を詰める（2026-07-17ユーザー指示・さらに詰めた）
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
'  h1 { font-size:2.1rem; line-height:1.1; margin:0 0 8px; color:#fff; }' +   // 大きい文字の余白分も詰める
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
// ★2026-07-16：以前は1件1画面(min-height:90vh)で必ず画面いっぱいに広げていたが、
//   移動ボタンが閉じている時に下が大きく空いて次の被りが見えないため、中身の高さに合わせる方式へ変更
//   （ユーザー指示：閉じている時は次の被りをすぐ下に、開いたら押し下がる）。
'  .card { background:var(--card); border:1px solid var(--line); box-sizing:border-box;' +
'    border-left:4px solid var(--real); border-radius:12px; padding:9px 11px;' +
'    margin-bottom:40px; box-shadow:0 1px 3px rgba(0,0,0,.06); }' +   // 1件と次の1件の境目が分かるよう「部屋を移動ボタン」の半分の高さ空ける（2026-07-17ユーザー指示。実測80pxの半分）
'  .card.dup { border-left-color:var(--dup); }' +
'  .card-h { display:flex; align-items:flex-start; gap:8px; flex-wrap:wrap; margin-bottom:6px; }' +
// ★2026-07-16：日付+時刻／施術室名+説明文の2行を、それぞれ横幅いっぱいまで大きく見せる。
//   .fit1lineは開始時にわざと大きめのfont-sizeを振っておき、下のFIT_ONE_LINE_JS_が
//   はみ出さなくなるまで1pxずつ縮めて「1行に収まる範囲で最大」を実現する（.uvの金額縮小と同じ手法）。
// ★flexboxは既定でmin-width:autoのため、白抜き(white-space:nowrap)の長い文字が
//   親幅を無視してカードの外にはみ出す不具合があった（2026-07-16実機で発覚）。
//   min-width:0＋flex-basis:100%で必ず親幅に収まらせてから、JSの縮小ループで文字を詰める。
'  .cline { display:flex; flex-direction:column; gap:2px; min-width:0; flex:1 1 100%; }' +
'  .fit1line { white-space:nowrap; overflow:hidden; min-width:0; }' +
'  .clineDate { font-weight:900; font-size:2.3rem; }' +
'  .clineRoom { font-weight:900; font-size:1.9rem; }' +
'  .room { background:var(--rc); color:#fff; font-weight:800; font-size:1.05rem;' +
'    padding:4px 16px; border-radius:999px; }' +
'  .dup { font-size:.95rem; font-weight:800; color:#92400e;' +
'    background:#fde68a; padding:4px 12px; border-radius:999px; }' +
'  @media (prefers-color-scheme: dark) { .dup { color:#1c1400; background:#fbbf24; } }' +
'  .kind { font-size:.82rem; font-weight:600; }' +
'  .card.real .kind { color:var(--real); } .card.dup .kind { color:var(--dup); }' +
'  .pair { display:grid; grid-template-columns:1fr auto 1fr; align-items:start; gap:8px;' +
'    border-top:2px solid var(--sub); padding-top:7px; margin-top:2px; }' +
'  .side { background:var(--bg); border-radius:10px; padding:6px 10px; min-width:0; }' +
'  .time { display:flex; align-items:center; font-weight:600; font-size:1.3rem;' +
'    font-variant-numeric:tabular-nums; }' +
// ★担当者を文字(A/B)でなく、TimeTreeのタイトル先頭から取れる果物マーク(x.a_staff/b_staff)で
//   大きく見せる（2026-07-16・「そっちのほうがわかりやすい」との要望で変更）。
//   ★同日追加要望：四角い背景は要らず、果物そのものだけをできるだけ大きく。
'  .ab { flex:none; display:grid; place-items:center; font-size:3.2rem; line-height:1; margin-right:6px; }' +
'  .who { margin:4px 0 2px; font-size:1rem; }' +
'  .who .code { color:var(--sub); font-weight:600; margin:0 4px; }' +
'  .who .name { font-weight:500; }' +
'  .menuwrap { display:flex; align-items:stretch; gap:8px; margin:6px 0 4px; }' +
// ★移動先を選んでいる間だけ、氏名・施術内容を隠して詰める（2026-07-17ユーザー指示）。
'  .card.moving .who .code, .card.moving .who .name, .card.moving .menuwrap { display:none; }' +
'  .menutag { flex:none; writing-mode:vertical-rl; text-orientation:upright;' +
'    background:#e0e7ff; color:#4338ca; font-size:1.08rem; font-weight:800;' +
'    padding:6px 3px; border-radius:999px; letter-spacing:.05em; }' +
'  @media (prefers-color-scheme: dark) { .menutag { background:#312e81; color:#c7d2fe; } }' +
'  .menu { list-style:none; margin:0; padding:0; flex:1 1 auto; min-width:0; }' +
'  .menu li { font-size:.9rem; font-weight:700; line-height:1.35; padding-left:1.15em; position:relative; }' +
'  .menu li::before { content:"◉"; position:absolute; left:0; color:var(--real); font-size:.7em; top:.28em; }' +
'  .cal { font-size:.72rem; color:var(--sub); }' +
'  .tt { display:block; margin-top:8px; text-align:center; text-decoration:none;' +
'    background:#4caf7d; color:#fff; font-weight:700; font-size:.85rem;' +
'    padding:9px; border-radius:10px; }' +
'  .tt:active { transform:translateY(1px); }' +
'  .vs { border-left:2px dashed var(--sub); align-self:stretch; opacity:.85; }' +
'  .empty { background:var(--card); border:1px solid var(--line); border-radius:12px;' +
'    padding:40px; text-align:center; font-size:1.15rem; color:#16a34a; }' +
'  .mv { margin-top:8px; }' +
'  .mvtoprow { display:flex; gap:8px; align-items:stretch; }' +
'  .mvtoggle { flex:1 1 0; text-align:center; font-size:1.35rem; font-weight:700;' +
'    line-height:1.4; white-space:normal; color:#fff; background:#2563eb; border:1px solid #2563eb;' +
'    border-radius:10px; padding:9px 6px; cursor:pointer; }' +
'  .mvtoggle:active { transform:translateY(1px); }' +
'  .mvtoggle.open { color:var(--ink); background:var(--card); border-color:var(--line);' +
'    box-shadow:inset 0 2px 5px rgba(0,0,0,.2); }' +
'  .mvpanel { margin-top:8px; background:var(--bg); border:1px solid var(--line);' +
'    border-radius:10px; padding:8px 10px; }' +
// ★空き部屋一覧(.rspanel)は最初は畳んでおき、この専用ボタンを押した時だけ広げる
//   （2026-07-16ユーザー選択①：常時表示だと情報が多すぎるため）。
'  .rstoggle { display:block; width:100%; text-align:center; font-size:1.25rem; font-weight:700;' +
'    color:#fff; background:#2563eb; border:1px solid #2563eb; margin-top:16px;' +   // 部屋ボタンの列との間を空ける（2026-07-17ユーザー：ボタン1個分は戻した）
'    border-radius:10px; padding:11px 6px; cursor:pointer; }' +
'  .rstoggle:active { transform:translateY(1px); }' +
'  .rstoggle.open { box-shadow:inset 0 2px 5px rgba(0,0,0,.3); }' +
'  .mvrow { display:flex; flex-direction:column; gap:6px; padding:6px 0; }' +
'  .mvrow + .mvrow { border-top:1px dashed var(--line); }' +
'  .mvlabel { font-size:1.7rem; font-weight:800; color:#ec4899; }' +
// ※空いている施術室のみ...の行はラベルの真下・同じ文字サイズで黒に（2026-07-17ユーザー指示。
// 色は元々ラベルとヒントで逆だったのを入れ替え、目立たせたい方＝ラベルをピンクにした）。
'  .mvhint { font-size:1.7rem; color:var(--ink); font-weight:700; margin-top:2px; line-height:1.4; }' +
// 部屋マークは横に流さず、必ず2個ずつで改行する（4個なら上2つ・下2つ）＝2026-07-17ユーザー指示。
'  .mvbtns { display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-top:8px; }' +
'  .mvbtn { font-size:.92rem; font-weight:800; color:#fff; background:var(--rc,#64748b);' +
'    border:0; border-radius:999px; padding:9px 14px; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.18); }' +
'  .mvbtn:active { transform:translateY(1px); }' +
'  .mvbtn:disabled { opacity:.4; }' +
'  .mvng { grid-column:1/-1; font-size:.8rem; color:var(--sub); align-self:center; }' +
'  .mvstatus { margin-top:8px; padding:11px 12px; border-radius:10px; font-size:.95rem; font-weight:700; }' +
'  .mvstatus.working { background:#fef9c3; color:#854d0e; }' +
'  .mvstatus.ok { background:#dcfce7; color:#166534; }' +
'  .mvstatus.err { background:#fee2e2; color:#991b1b; }' +
'  .rspanel { margin:8px 0 0; background:var(--bg); border:1px solid var(--line);' +
'    border-radius:10px; padding:8px 10px; }' +
'  .rstitle { font-size:.8rem; font-weight:700; color:var(--sub); margin-bottom:6px; }' +
'  .rstat { display:flex; align-items:flex-start; flex-wrap:nowrap; gap:6px; padding:4px 0; }' +
'  .rstat + .rstat { border-top:1px dashed var(--line); }' +
// ★部屋名の長さ(FREEDOM/HAPPY/LUCKY/STAR/福)がバラバラで幅が揃わず、右の空き時間の
//   開始位置が行ごとにズレていた不具合を修正（2026-07-16・「時間が左右バラバラ」との指摘）。
//   幅を固定して、どの部屋名でも右側(.rchips)が必ず同じ位置から始まるようにする。
'  .rstat .room { flex:0 0 auto; width:92px; text-align:center; padding:4px 6px; box-sizing:border-box; }' +
// ★2個目以降の空き時間が右端の列まで飛んで離れて見えていた不具合を修正（2026-07-16再指摘）。
//   grid(2列固定)だと2個目が「残り幅の半分の位置」まで飛ぶ→flexにして隣に詰めて並べるだけにする。
'  .rchips { flex:1 1 auto; min-width:0; display:flex; flex-wrap:wrap; gap:5px; }' +
'  .rchips .slot { display:inline-block; background:var(--card); border:1px solid var(--line);' +
'    border-radius:7px; padding:2px 8px; font-size:.82rem; font-variant-numeric:tabular-nums;' +
'    white-space:nowrap; }' +
'  .rchips .none { color:var(--real); font-size:.82rem; font-weight:700; }' +
// 自前の確認ポップアップ（ブラウザ標準confirm/alertの代わり＝ドメイン名を表示しない）。
'  .ccmask { position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex;' +
'    align-items:center; justify-content:center; z-index:200; padding:20px; }' +
// 文字は2倍（2026-07-17ユーザー指示。4倍は大きすぎたので半分に）。大きい分だけ箱も広げ、
// はみ出す時は箱の中で縦スクロール。
'  .ccbox { background:var(--card); border-radius:16px; padding:20px; max-width:720px; width:100%;' +
'    max-height:88vh; overflow:auto; box-shadow:0 12px 40px rgba(0,0,0,.35); }' +
'  .ccmsg { font-size:2rem; line-height:1.9; color:var(--ink); margin-bottom:18px; white-space:pre-wrap;' +
'    overflow-wrap:anywhere; }' +
// 部屋名を文字でなく色付きマークにする（他画面の.roomと同じ見た目・確認ポップアップは文字が
// 大きいのでパディング・角丸をやや控えめにして行の中に収める）。
'  .ccmsg .ccroom { display:inline-block; background:var(--rc); color:#fff; font-weight:800;' +
'    padding:2px 18px; border-radius:999px; }' +
'  .ccbtns { display:flex; gap:10px; }' +
// font:inherit を font-size より後に書くと大きさが打ち消される＝先に書く。
'  .ccno, .ccyes { flex:1; font:inherit; padding:12px; border-radius:10px; border:0; font-weight:700;' +
'    font-size:1.4rem; cursor:pointer; }' +
'  .ccno { background:var(--bg); color:var(--ink); border:1px solid var(--line); }' +
'  .ccyes { background:#2563eb; color:#fff; }' +
'  .ccno:active, .ccyes:active { transform:translateY(1px); }' +
'';

// ================== 自動監視（view=kanshi・開発URL専用／2026-07-16追加） ==================
// 事務所PCの「自動監視システム」の画面と同じ中身を、外・スマホから見る＋ON/OFF・今すぐ実行を押す。
//
// ★作法（共通\スーパーズコApp_必読.md）どおり「取得」と「描画」を分離：
//   renderKanshi_     … ①GAS直アクセス専用（DriveApp で monitor.json を読む薄いラッパ）
//   renderKanshiPage_ … 純JS・GAS API不使用（②静的アプリはJSONPで取ったデータでこれを直接呼ぶ）
// ★状態の判定・組み立ては一切ここでやらない（PC側 monitor_snapshot.py が唯一の真実で、
//   monitor.json には「答え」が入っている）＝PC/GASの二重管理を作らない。
// ★操作(ON/OFF・今すぐ実行)は必ずサーバー側の関門(_submitToQueue_ の op='kanshi_ctl')を通す
//   ＝登録した1台のスマホか(kanshiGate_)と、触ってよい項目かの確認はサーバーだけが行う。
// ★2026-07-17：**この画面は登録した1台のスマホだけが開ける**（合言葉は廃止）。詳細は kanshiGate_。
function renderKanshi_(base, staff, dev, device) {
  var gate = kanshiGate_(device);
  if (!gate.ok) return renderKanshiLocked_(gate.error, base, staff, dev);
  var d;
  try {
    d = JSON.parse(getMonitorFile_().getBlob().getDataAsString('UTF-8'));
  } catch (err) {
    return renderKanshiError_(err, base, staff, dev);
  }
  return renderKanshiPage_(d, base, staff, dev);
}

/** 登録した1台のスマホ以外がこの画面を開いた時（＝データが届いていないのとは別物なので、
 *  「状態が届いていません」ではなく専用の説明を出す。2026-07-17）。 */
function renderKanshiLocked_(msg, base, staff, dev) {
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">📟</span><span class="bname">自動監視</span></div>' +
    '<div class="soon">' +
      '<div class="soonic">🔒</div>' +
      '<div class="soontitle" style="font-size:1.4rem">このスマホでは使えません</div>' +
      '<div class="soondesc">' + esc_(msg) + '</div>' +
    '</div>' +
  '</div>';
}

function renderKanshiError_(err, base, staff, dev) {
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">📟</span><span class="bname">自動監視</span></div>' +
    '<div class="soon">' +
      '<div class="soonic">📄</div>' +
      '<div class="soontitle" style="font-size:1.4rem">状態が届いていません</div>' +
      '<div class="soondesc">' + esc_(err && err.message ? err.message : err) + '</div>' +
    '</div>' +
  '</div>';
}

/** 自動監視ページの描画（純JS・GAS API不使用）。
 *  中身の組み立てはブラウザ側(KANSHISCRIPT_)に任せ、ここでは器と初期データを置くだけ
 *  ＝30秒ごとの自動更新・操作後の再描画も同じ1本のコードで行える（描画を2重に持たない）。 */
function renderKanshiPage_(d, base, staff, dev) {
  return '<style>' + KANSHICSS_ + '</style>' +
  '<div class="kwrap">' +
    '<div class="kbar">' +
      '<a class="khome" href="' + (base || '') + '?view=home' + roleSfx_(staff, dev) + '" target="_top">← 前に戻る</a>' +
      '<button type="button" class="kref" id="kRef">更新</button>' +
    '</div>' +
    '<h1>📟 自動監視</h1>' +
    '<div class="kfresh" id="kFresh"></div>' +
    '<div id="kList"></div>' +
    '<div class="kfoot">🟢＝動いている ／ 🔴＝止まっている疑い ／ ⚪＝OFF（止めてある）。' +
      '各行を押すと中身が開きます。この画面は登録したスマホ（最初に開いた1台）だけが使えます。' +
      'この画面は事務所PCが1分ごとに送ってきた状態を見ています。</div>' +
  '</div>' +
  '<script>window.__KANSHI_DATA__=' + JSON.stringify(d) + ';<' + '/script>' +
  KANSHISCRIPT_;
}

var KANSHICSS_ =
'  :root{ --bg:#2b3440; --card:#ffffff; --ink:#1c2430; --sub:#667085; --line:#e6e9ef;' +
'    --ok:#0d9b6c; --ng:#e5484d; --off:#98a2b3; }' +
'  @media (prefers-color-scheme:dark){ :root{ --card:#1b2430; --ink:#e8ebf0; --sub:#9aa4b2; --line:#2a3441; } }' +
'  *{ box-sizing:border-box; }' +
'  body{ margin:0; background:var(--bg); color:var(--ink);' +
'    font-family:"Segoe UI","Yu Gothic UI","Hiragino Sans",system-ui,sans-serif; line-height:1.5; }' +
'  .kwrap{ max-width:640px; margin:0 auto; padding:16px 14px 60px; }' +
'  .kbar{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px; }' +
// ★2026-07-17ユーザー指摘（老眼で全部読めない）：この画面の文字は軒並み小さすぎたので全体的に拡大。
'  .khome{ color:#fff; text-decoration:none; font-weight:700; font-size:17px;' +
'    background:rgba(255,255,255,.16); padding:9px 14px; border-radius:10px; }' +
'  .kref{ background:rgba(255,255,255,.16); color:#fff; border:0; border-radius:10px; padding:9px 14px;' +
'    font:inherit; font-weight:700; font-size:17px; cursor:pointer; }' +
'  h1{ color:#fff; font-size:22px; margin:6px 0 10px; }' +
'  .kfresh{ font-size:15px; color:#dfe6ee; margin-bottom:12px; }' +
'  .kfresh.old{ background:var(--ng); color:#fff; font-weight:700; padding:10px 12px; border-radius:10px; }' +
'  .kcard{ background:var(--card); border:1px solid var(--line); border-radius:12px;' +
'    padding:12px 14px; margin-bottom:10px; }' +
'  .khead{ display:flex; align-items:flex-start; gap:8px; cursor:pointer; }' +
'  .kmark{ font-size:19px; line-height:1.4; }' +
'  .klabel{ font-weight:700; font-size:18px; flex:1; }' +
'  .kdetail{ color:var(--sub); font-size:15px; margin-top:3px; font-weight:400; }' +
'  .karrow{ color:var(--sub); font-size:15px; }' +
'  .kmembers{ margin-top:10px; border-top:1px solid var(--line); padding-top:8px; }' +
'  .kmembers[hidden]{ display:none; }' +
'  .krow{ border-bottom:1px solid var(--line); padding:9px 0; }' +
'  .krow:last-child{ border-bottom:0; }' +
'  .krowhead{ display:flex; align-items:flex-start; gap:7px; }' +
'  .krowlabel{ flex:1; font-size:16px; font-weight:600; }' +
'  .kbtns{ display:flex; flex-wrap:wrap; gap:6px; margin-top:7px; align-items:center; }' +
'  .kbtn{ border:1px solid var(--line); background:var(--card); color:var(--ink); border-radius:8px;' +
'    padding:8px 13px; font:inherit; font-size:15px; font-weight:700; cursor:pointer; }' +
'  .kbtn.on{ background:var(--ok); color:#fff; border-color:var(--ok); }' +
'  .kbtn.off{ background:var(--off); color:#fff; border-color:var(--off); }' +
'  .kbtn:active{ transform:translateY(1px); }' +
'  .kval{ width:88px; padding:8px 10px; border:1px solid var(--line); border-radius:8px;' +
'    background:var(--card); color:var(--ink); font:inherit; font-size:15px; }' +
'  .kunit{ font-size:14px; color:var(--sub); }' +
'  .ksub{ margin:8px 0 0 14px; border-left:2px solid var(--line); padding-left:10px; }' +
'  .kfoot{ color:#dfe6ee; font-size:14px; margin-top:14px; }' +
'  .ktoast{ position:fixed; left:50%; transform:translateX(-50%); bottom:22px; z-index:60;' +
'    background:#111a24; color:#fff; padding:11px 16px; border-radius:10px; font-size:16px; max-width:88%; }' +
'  .kmask{ position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center;' +
'    justify-content:center; z-index:70; padding:20px; }' +
'  .kbox{ background:var(--card); border-radius:14px; padding:18px; width:100%; max-width:330px; }' +
'  .kbox h3{ margin:0 0 10px; font-size:19px; }' +
'  .kbox input{ width:100%; padding:11px; border:1px solid var(--line); border-radius:9px;' +
'    background:var(--card); color:var(--ink); font:inherit; font-size:18px; margin-bottom:12px; }' +
'  .kboxbtns{ display:flex; gap:8px; }' +
'  .kboxbtns button{ flex:1; padding:12px; border-radius:9px; border:0; font:inherit; font-weight:700;' +
'    font-size:16px; cursor:pointer; }' +
'  .kno{ background:var(--bg); color:#fff; } .kyes{ background:#2563eb; color:#fff; }' +
// ボタン表示設定の編集画面（2026-07-17・事務所PCの設定画面と同じことをスマホでもできるように）
'  .kbox.kwide{ max-width:520px; max-height:86vh; overflow-y:auto; }' +
'  .knote{ font-size:15px; color:var(--sub); margin-bottom:10px; line-height:1.6; }' +
'  .ksec{ font-size:16px; font-weight:800; margin:18px 0 8px; padding-top:12px;' +
'    border-top:1px solid var(--line); }' +
'  .ktrow{ padding:9px 0; border-bottom:1px solid var(--line); }' +
'  .ktname{ display:flex; align-items:center; gap:7px; font-size:16px; font-weight:700; margin-bottom:6px; }' +
'  .kacc{ width:5px; height:16px; border-radius:3px; flex:0 0 auto; }' +
'  .kord{ display:flex; gap:2px; margin-left:auto; }' +
'  .kord button{ width:28px; height:26px; padding:0; border:1px solid var(--line); background:var(--card);' +
'    color:var(--sub); border-radius:6px; font-size:12px; cursor:pointer; }' +
'  .kchips{ display:flex; flex-wrap:wrap; gap:5px; }' +
'  .kchip{ border:1px solid var(--line); background:var(--card); color:var(--sub); border-radius:999px;' +
'    padding:8px 13px; font:inherit; font-size:15px; font-weight:700; cursor:pointer; }' +
'  .kchip.on{ background:var(--ok); border-color:var(--ok); color:#fff; }' +
'  .kchip .kused{ font-size:11px; opacity:.75; margin-left:3px; }' +
'  .kdevnote{ font-size:14px; color:var(--sub); }' +
'  .krow2{ display:flex; gap:7px; }' +
'  .krow2 input{ flex:1; margin-bottom:0; }' +
'';

// ブラウザ側の全処理（描画・30秒ごとの自動更新・操作の依頼）。①②どちらでも同じこれが動く。
// ★JSONPだけで完結させる（①でしか使えない google.script.run に依存しない＝分岐を持たない）。
var KANSHISCRIPT_ =
'<script>(function(){' +
'var EXEC_="https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec";' +
'var KEY_="kx7Q2p9mVt4Zr8";' +
'var STALE_SEC_=180;' +
// ★2026-07-17（ユーザー決定）：合言葉は**完全に廃止**し、「登録した1台のスマホだけ」に変えた
//   （経緯と理由は上の kanshiGate_ の説明。社長は何も入力しない）。
//   端末の見分け＝②静的アプリが作る `sz_device`（index.html と**同じ鍵**を読む＝同じスマホなら
//   名前選択と同じIDになる）。①GAS直リンクで開いた時のために、無ければここで作る。
'function devId_(){' +
'  try{' +
'    var v=window.__SZ_DEVICE_||localStorage.getItem("sz_device");' +
'    if(!v){ v="d"+Date.now().toString(36)+Math.random().toString(36).slice(2,8); localStorage.setItem("sz_device", v); }' +
'    return v;' +
'  }catch(e){ return ""; }' +
'}' +
'var DEV_=devId_();' +
'var data_=window.__KANSHI_DATA__||{groups:[]};' +
'var open_={};' +
'var CONFIRM_={};' +   // 押す前に出す確認文（事務所PCが monitor.json の row.confirm で配る）
'var TILEROW_=null;' + // ボタン表示設定の行（ボタンの一覧・色を持っている＝一覧をここに書き写さない）

'function esc(s){ var d=document.createElement("div"); d.textContent=(s==null?"":String(s)); return d.innerHTML; }' +
'function jsonp_(params, onDone){' +
'  var cb="__k"+Date.now()+Math.floor(Math.random()*1000);' +
'  window[cb]=function(r){ try{ delete window[cb]; }catch(ig){} onDone(r); };' +
'  var qs="callback="+cb; for(var k in params){ qs+="&"+k+"="+encodeURIComponent(params[k]); }' +
'  var s=document.createElement("script"); s.src=EXEC_+"?"+qs+"&cb="+Date.now();' +
'  s.onerror=function(){ onDone({ok:false,error:"通信エラー"}); };' +
'  document.body.appendChild(s);' +
'}' +
'function toast_(msg){' +
'  var t=document.createElement("div"); t.className="ktoast"; t.textContent=msg;' +
'  document.body.appendChild(t);' +
'  setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 3200);' +
'}' +
'function mark_(st){ return st==="ok"?"🟢":(st==="off"?"⚪":(st==="unknown"?"🟡":"🔴")); }' +
'function agoSec_(s){' +
'  if(!s) return null;' +
'  var t=Date.parse(String(s).replace(" ","T"));' +
'  if(isNaN(t)) return null;' +
'  return Math.floor((Date.now()-t)/1000);' +
'}' +
'function renderFresh_(){' +
'  var el=document.getElementById("kFresh"); if(!el) return;' +
'  var sec=agoSec_(data_.generated_at);' +
'  if(sec===null||sec>STALE_SEC_){' +
'    el.className="kfresh old";' +
'    el.textContent="⚠ 事務所PCから状態が届いていません（最後に届いたのは "+(data_.generated_at||"不明")+"）。下の表示は古い可能性があります。";' +
'  } else {' +
'    el.className="kfresh"; el.textContent=(data_.generated_at||"")+" 時点の状態です（1分ごとに自動更新）。";' +
'  }' +
'}' +
// 1行に出すボタンは、事務所PCが決めた acts（その項目に許した操作）だけにする。
// ★以前は全行に「ON/OFF」「今すぐ実行」「保存」を機械的に出していたので、押しても意味の無い
//   ボタン（例＝L⇔T全自動AI判定の「今すぐ実行」）まで並んでいた。2026-07-17に acts 方式へ変更。
// ★confirm（押す前の確認文）も事務所PCが配る。お金・電源・データ復元の項目に付いている。
'function ctlBtns_(m){' +
'  if(!m.ctl) return "";' +
'  var acts=m.acts||["on","off","run","setval"];' +
'  var has=function(a){ return acts.indexOf(a)>=0; };' +
'  if(m.confirm) CONFIRM_[m.key]=m.confirm;' +
'  var h="<div class=\\"kbtns\\">";' +
'  if(m.editor==="tiles"){' +
'    TILEROW_=m;' +
'    h+="<button type=\\"button\\" class=\\"kbtn\\" data-editor=\\"tiles\\">ひらいて設定する</button>";' +
'  }' +
'  if(has(m.on?"off":"on")){' +
'    h+="<button type=\\"button\\" class=\\"kbtn "+(m.on?"on":"off")+"\\" data-act=\\""+(m.on?"off":"on")+"\\" data-key=\\""+esc(m.key)+"\\">"+(m.on?"ONにしてある → OFFにする":"OFFにしてある → ONにする")+"</button>";' +
'  }' +
'  if(has("run")){' +
'    h+="<button type=\\"button\\" class=\\"kbtn\\" data-act=\\"run\\" data-key=\\""+esc(m.key)+"\\">今すぐ実行</button>";' +
'  }' +
'  if(has("setval")&&m.value!==""&&m.value!==undefined&&m.value!==null){' +
'    h+="<input class=\\"kval\\" type=\\"text\\" value=\\""+esc(m.value)+"\\" data-val=\\""+esc(m.key)+"\\">";' +
'    h+="<span class=\\"kunit\\">"+esc(m.unit||m.schedule_label||"")+"</span>";' +
'    h+="<button type=\\"button\\" class=\\"kbtn\\" data-act=\\"setval\\" data-key=\\""+esc(m.key)+"\\">保存</button>";' +
'  }' +
'  h+="</div>"; return h;' +
'}' +
'function rowHtml_(m){' +
'  var h="<div class=\\"krow\\"><div class=\\"krowhead\\"><span class=\\"kmark\\">"+mark_(m.status)+"</span>";' +
'  h+="<span class=\\"krowlabel\\">"+esc(m.label)+"<div class=\\"kdetail\\">"+esc(m.detail||"")+"</div></span></div>";' +
'  h+=ctlBtns_(m);' +
'  if(m.members&&m.members.length){' +
'    h+="<div class=\\"ksub\\">"+m.members.map(rowHtml_).join("")+"</div>";' +
'  }' +
'  h+="</div>"; return h;' +
'}' +
'function render_(){' +
'  renderFresh_();' +
'  var list=document.getElementById("kList"); if(!list) return;' +
'  var gs=data_.groups||[];' +
'  if(!gs.length){ list.innerHTML="<div class=\\"kcard\\">状態が空です。事務所PCをご確認ください。</div>"; return; }' +
'  list.innerHTML=gs.map(function(g,i){' +
'    var body=(g.members&&g.members.length)?g.members.map(rowHtml_).join(""):"";' +
'    return "<div class=\\"kcard\\"><div class=\\"khead\\" data-g=\\""+i+"\\">"+' +
'      "<span class=\\"kmark\\">"+mark_(g.status)+"</span>"+' +
'      "<span class=\\"klabel\\">"+esc(g.label)+"<div class=\\"kdetail\\">"+esc(g.detail||"")+"</div></span>"+' +
'      (body?"<span class=\\"karrow\\">"+(open_[i]?"▲":"▼")+"</span>":"")+"</div>"+' +
'      (body?"<div class=\\"kmembers\\" data-m=\\""+i+"\\""+(open_[i]?"":" hidden")+">"+body+"</div>":"")+' +
'    "</div>";' +
'  }).join("");' +
'}' +
'function reload_(onDone){' +
'  jsonp_({action:"kanshi", device:DEV_}, function(r){' +
'    if(r&&r.locked){' +   // 登録が別のスマホへ移った（事務所PCで「登録し直す」等）＝その場で見せるのをやめる
'      var l=document.getElementById("kList");' +
'      if(l) l.innerHTML="<div class=\\"kcard\\">"+esc(r.error||"この画面は登録したスマホからだけ開けます。")+"</div>";' +
'      var f=document.getElementById("kFresh"); if(f) f.textContent="";' +
'      if(onDone) onDone();' +
'      return;' +
'    }' +
'    if(r&&!r.error){ data_=r; render_(); }' +
'    if(onDone) onDone();' +
'  });' +
'}' +
'function poll_(id, tries){' +
'  jsonp_({action:"status", key:KEY_, id:id}, function(r){' +
'    if(r&&r.ok&&(r.status==="done"||r.status==="error")){' +
'      toast_((r.status==="done"?"✅ ":"⚠ ")+(r.result||""));' +
'      reload_();' +
'      return;' +
'    }' +
'    if(tries<=0){ toast_("時間切れです。事務所PCの状態をご確認ください。"); return; }' +
'    setTimeout(function(){ poll_(id, tries-1); }, 5000);' +
'  });' +
'}' +
// ========== ボタン表示設定の編集画面（2026-07-17・事務所PCの設定画面と同じことをスマホで） ==========
// ★作法どおり「判定・保存はPC側」：ここは表を描いて、押された結果を1つの依頼にして送るだけ。
//   保存の実処理は事務所PCの tile_settings.save_perms/set_password/add_person/reset_device
//   （＝PCの設定画面が呼ぶのと同じ関数）が行う＝PC版とApp版で結果が食い違わない。
// ★合言葉だけは「今の値」を画面に出さない（②静的アプリは誰でも開けるURLのため。変える事はできる）。
'var EP_={}, EO_=[], EPEOPLE_=[], ELAB_={}, ECLAIM_={};' +
'function tileDefs_(){' +
'  var r=TILEROW_||{}; var out=[];' +
'  var a=r.tiles||[], b=r.dev_tiles||[];' +
'  for(var i=0;i<a.length;i++) out.push({id:a[i].id,label:a[i].label,color:a[i].color,dev:false});' +
'  for(var j=0;j<b.length;j++) out.push({id:b[j].id,label:b[j].label,color:b[j].color,dev:true});' +
'  return out;' +
'}' +
'function openTiles_(){' +
'  toast_("設定を読み込んでいます…");' +
'  jsonp_({action:"tilesettings"}, function(r){' +
'    if(!r||r.error){ toast_("⚠ 設定を読めませんでした"); return; }' +
'    EPEOPLE_=r.people||[]; ELAB_=r.labels||{}; ECLAIM_=r.claimed||{}; EO_=(r.order||[]).slice();' +
'    EP_={};' +
'    for(var i=0;i<EPEOPLE_.length;i++){' +
'      var pid=EPEOPLE_[i]; EP_[pid]={};' +
'      var src=(r.perms&&r.perms[pid])||{};' +
'      for(var t in src) EP_[pid][t]=!!src[t];' +
'    }' +
'    drawTiles_();' +
'  });' +
'}' +
'function tileRowsHtml_(){' +
'  var defs=tileDefs_(), byId={};' +
'  for(var i=0;i<defs.length;i++) byId[defs[i].id]=defs[i];' +
'  var order=EO_.filter(function(id){ return byId[id]; });' +
'  for(var j=0;j<defs.length;j++){ if(order.indexOf(defs[j].id)<0) order.push(defs[j].id); }' +
'  EO_=order;' +
'  return order.map(function(tid){' +
'    var d=byId[tid];' +
'    var h="<div class=\\"ktrow\\" data-tid=\\""+esc(tid)+"\\"><div class=\\"ktname\\">"+' +
'      "<span class=\\"kacc\\" style=\\"background:"+esc(d.color||"#94a3b8")+"\\"></span>"+esc(d.label)+' +
'      "<span class=\\"kord\\"><button type=\\"button\\" data-mv=\\"-1\\" data-tid=\\""+esc(tid)+"\\">▲</button>"+' +
'      "<button type=\\"button\\" data-mv=\\"1\\" data-tid=\\""+esc(tid)+"\\">▼</button></span></div>";' +
'    if(d.dev){' +
'      h+="<div class=\\"kdevnote\\">開発用URLだけに出るボタンです（人ごとの設定はありません。並び順だけ変えられます）</div>";' +
'    } else {' +
'      h+="<div class=\\"kchips\\">"+EPEOPLE_.map(function(pid){' +
'        var on=!!(EP_[pid]&&EP_[pid][tid]);' +
'        var used=(pid!=="kanbu"&&ECLAIM_[pid])?"<span class=\\"kused\\">使用中</span>":"";' +
'        return "<button type=\\"button\\" class=\\"kchip"+(on?" on":"")+"\\" data-pid=\\""+esc(pid)+"\\" data-tid=\\""+esc(tid)+"\\">"+' +
'          esc(ELAB_[pid]||pid)+used+"</button>";' +
'      }).join("")+"</div>";' +
'    }' +
'    return h+"</div>";' +
'  }).join("");' +
'}' +
'function drawTiles_(){' +
'  var old=document.getElementById("kTiles"); if(old&&old.parentNode) old.parentNode.removeChild(old);' +
'  var mask=document.createElement("div"); mask.className="kmask"; mask.id="kTiles";' +
'  var resets=EPEOPLE_.filter(function(p){ return p!=="kanbu"; }).map(function(pid){' +
'    return "<button type=\\"button\\" class=\\"kchip\\" data-reset=\\""+esc(pid)+"\\">"+esc(ELAB_[pid]||pid)+"</button>";' +
'  }).join("")+"<button type=\\"button\\" class=\\"kchip\\" data-reset=\\"all\\">⚠ 全員</button>";' +
'  mask.innerHTML="<div class=\\"kbox kwide\\"><h3>スーパーズコApp ボタン表示設定</h3>"+' +
'    "<div class=\\"knote\\">それぞれのボタンを、誰に見せるかを選びます。名前を押すとON（緑）／OFF（灰色）が切り替わります。▲▼はホーム画面の並び順です。最後に「保存する」を押してください（事務所PCが受け取ってから反映まで最大1分）。</div>"+' +
'    "<div id=\\"kTileRows\\">"+tileRowsHtml_()+"</div>"+' +
'    "<div class=\\"ksec\\">新しいユーザーを追加</div>"+' +
'    "<div class=\\"knote\\">新しいスタッフや、同じ人の別の名前（例：りんご2）を足します。</div>"+' +
'    "<div class=\\"krow2\\"><input type=\\"text\\" id=\\"kAdd\\" placeholder=\\"例：りんご2\\">"+' +
'    "<button type=\\"button\\" class=\\"kbtn\\" id=\\"kAddBtn\\">追加</button></div>"+' +
'    "<div class=\\"ksec\\">スタッフ用URLの合言葉</div>"+' +
'    "<div class=\\"knote\\">今の合言葉は、安全のためこの画面には出しません。変えたい時だけ新しい合言葉を入れてください。</div>"+' +
'    "<div class=\\"krow2\\"><input type=\\"text\\" id=\\"kPw2\\" placeholder=\\"新しい合言葉\\">"+' +
'    "<button type=\\"button\\" class=\\"kbtn\\" id=\\"kPwBtn\\">変更</button></div>"+' +
'    "<div class=\\"ksec\\">名前を選び直させる（スマホごと）</div>"+' +
'    "<div class=\\"knote\\">押した人のスマホは、次にアプリを開いた時「名前をえらぶ」画面からやり直しになります。その名前はまた選べるようになります。</div>"+' +
'    "<div class=\\"kchips\\">"+resets+"</div>"+' +
'    "<div class=\\"kboxbtns\\" style=\\"margin-top:18px;\\"><button type=\\"button\\" class=\\"kno\\" id=\\"kTilesClose\\">とじる</button>"+' +
'    "<button type=\\"button\\" class=\\"kyes\\" id=\\"kTilesSave\\">保存する</button></div></div>";' +
'  document.body.appendChild(mask);' +
'}' +
'function closeTiles_(){ var m=document.getElementById("kTiles"); if(m&&m.parentNode) m.parentNode.removeChild(m); }' +
'function moveTile_(tid, dir){' +
'  var i=EO_.indexOf(tid), j=i+dir;' +
'  if(i<0||j<0||j>=EO_.length) return;' +
'  var tmp=EO_[i]; EO_[i]=EO_[j]; EO_[j]=tmp;' +
'  var box=document.getElementById("kTileRows"); if(box) box.innerHTML=tileRowsHtml_();' +
'}' +
'function saveTiles_(){' +
'  var p={};' +   // ONの物だけの一覧で送る（依頼はURLで届くので短くする必要がある）
'  for(var i=0;i<EPEOPLE_.length;i++){' +
'    var pid=EPEOPLE_[i], on=[];' +
'    for(var t in (EP_[pid]||{})){ if(EP_[pid][t]) on.push(t); }' +
'    p[pid]=on;' +
'  }' +
'  send_("tile_settings","setval", JSON.stringify({t:"save", o:EO_, p:p}));' +
'  closeTiles_();' +
'}' +
'function tilesClick_(ev){' +
'  var t=ev.target.closest?ev.target:null; if(!t) return false;' +
'  var chip=t.closest(".kchip");' +
'  if(chip&&chip.getAttribute("data-pid")){' +
'    var pid=chip.getAttribute("data-pid"), tid=chip.getAttribute("data-tid");' +
'    if(!EP_[pid]) EP_[pid]={};' +
'    EP_[pid][tid]=!EP_[pid][tid];' +
'    chip.classList.toggle("on", !!EP_[pid][tid]);' +
'    return true;' +
'  }' +
'  if(chip&&chip.getAttribute("data-reset")){' +
'    var rid=chip.getAttribute("data-reset");' +
'    if(confirm("「"+(rid==="all"?"全員":(ELAB_[rid]||rid))+"」を名前の選び直しにします。よろしいですか？")){' +
'      send_("tile_settings","setval", JSON.stringify({t:"reset", v:rid}));' +
'    }' +
'    return true;' +
'  }' +
'  var mv=t.closest("[data-mv]");' +
'  if(mv){ moveTile_(mv.getAttribute("data-tid"), Number(mv.getAttribute("data-mv"))); return true; }' +
'  if(t.closest("#kAddBtn")){' +
'    var v=(document.getElementById("kAdd").value||"").trim();' +
'    if(!v){ toast_("名前を入れてください"); return true; }' +
'    send_("tile_settings","setval", JSON.stringify({t:"add", v:v}));' +
'    document.getElementById("kAdd").value="";' +
'    return true;' +
'  }' +
'  if(t.closest("#kPwBtn")){' +
'    var pw=(document.getElementById("kPw2").value||"").trim();' +
'    if(!pw){ toast_("新しい合言葉を入れてください"); return true; }' +
'    if(confirm("スタッフ用URLの合言葉を「"+pw+"」に変えます。よろしいですか？")){' +
'      send_("tile_settings","setval", JSON.stringify({t:"pw", v:pw}));' +
'    }' +
'    return true;' +
'  }' +
'  if(t.closest("#kTilesClose")){ closeTiles_(); return true; }' +
'  if(t.closest("#kTilesSave")){ saveTiles_(); return true; }' +
'  return false;' +
'}' +
// 依頼を送る。合言葉は無い＝**登録した1台のスマホ**であることをサーバー側が見る（kanshiGate_）。
'function send_(key, act, val){' +
'  toast_("受け付けました。事務所PCが実行します（最大1分）…");' +
'  jsonp_({action:"submit", key:KEY_, op:"kanshi_ctl", device:DEV_,' +
'    fields:JSON.stringify({ctl_key:key, ctl_act:act, ctl_val:(val||"")})},' +
'    function(r){' +
'      if(!r||!r.ok){ toast_("⚠ "+((r&&r.error)||"依頼できませんでした")); return; }' +
'      poll_(r.id, 16);' +
'    });' +
'}' +
'document.addEventListener("click", function(ev){' +
'  if(!ev.target.closest) return;' +
'  if(ev.target.closest("#kTiles")){ if(tilesClick_(ev)) return; }' +
'  var ed=ev.target.closest("[data-editor]");' +
'  if(ed){ openTiles_(); return; }' +
'  var h=ev.target.closest(".khead");' +
'  if(h){ var i=h.getAttribute("data-g"); open_[i]=!open_[i]; render_(); return; }' +
'  var b=ev.target.closest(".kbtn");' +
'  if(!b) return;' +
'  var key=b.getAttribute("data-key"), act=b.getAttribute("data-act");' +
'  if(!key||!act) return;' +
'  var val="";' +
'  if(act==="setval"){' +
'    var input=document.querySelector(".kval[data-val=\\""+key+"\\"]");' +
'    val=input?input.value:"";' +
'  }' +
'  if(CONFIRM_[key]&&!confirm(CONFIRM_[key])) return;' +   // お金・電源・データ復元は押す前に必ず確認
'  send_(key, act, val);' +
'});' +
'var ref=document.getElementById("kRef");' +
'if(ref) ref.addEventListener("click", function(){ toast_("最新を取りに行っています…"); reload_(); });' +
'render_();' +
'setInterval(function(){ reload_(); }, 30000);' +
'})();<' + '/script>';
