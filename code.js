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
    title = '部屋＆担当 被り検出';
    var withNail = (p.nail === '1' || p.nail === 'true');
    try {
      var file = getEventsFile_();
      var d = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
      var res = detect(d.events, withNail, d.date_from);
      var sres = detectStaff(d.events, d.date_from);   // 施術者(担当)被りも同じ画面に出す
      html = renderPage_(res.conflicts, res.meta, d, withNail, base, staff, dev, sres.conflicts);
    } catch (err) {
      html = renderError_(err, base, staff, dev);
    }
  } else if (view === 'lt') {
    title = 'TimeTree予約記入漏れ';
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
    title = '前日お知らせ';                             // ★開発URL(?dev=1)専用。日付を選ぶ→PCが作る→枠で表示（対話式・純JS）
    html = renderZenjitsuPage_(base, staff, dev);
  } else if (view === 'cost') {
    title = '台湾トマト 売上・コスト';                    // ★開発URL(?dev=1)専用。「月間コスト計算」を押すとコスト表を出す（純JS）
    html = renderCostPage_(base, staff, dev);
  } else if (view === 'koukoku') {
    title = '広告費管理';                                // ★開発URL(?dev=1)専用。自動で読み取った広告ごとの実額・成果
    html = renderKoukoku_(base, staff, dev);
  } else if (view === 'timedsend') {
    title = '時間指定LINE送信';                          // ★開発URL(?dev=1)専用。決めた時刻に文章＋画像を送る予約（純JS）
    html = renderTimedSendPage_(base, staff, dev);
  } else if (view === 'yoyaku') {
    title = '予約入力';                                  // ★予約入力のトップ画面（新規／既存／変更の3ボタン・PC版と同じ見た目）
    html = renderReservationHomePage_(base, staff, dev);
  } else if (view === 'yoyaku_new') {
    title = '新規予約入力';                              // ★「新規の予約」を押した先＝貼って選ぶ→事務所PCが新規予約を作る（純JS）
    html = renderNewReservationPage_(base, staff, dev);
  } else if (view === 'yoyaku_kizon') {
    title = '既存の予約';                                // ★既存客の予約＝番号入力→日付選択（PC版と同じ・日付選択まで）
    html = renderExistingPage_(base, staff, dev, '予約');
  } else if (view === 'yoyaku_henkou') {
    title = '既存の変更';                                // ★既存客の変更＝番号入力→日付選択（PC版と同じ・日付選択まで）
    html = renderExistingPage_(base, staff, dev, '変更');
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

// ★2026-07-22：ここに開発用の一時開放スイッチを置いたが、実際の関門はGoogle側(GAS)の
//   同名関数で動いており、この静的アプリ側を変えても効かないと判明したため撤去。
//   画面を直しながら見たい時は、手元で monitor.json を読ませて renderKanshiPage_ を
//   そのまま呼ぶ確認用ページを作る（Google側の版を消費しない・登録も奪わない）。
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
                  order: _orderFromCfg_(d),
                  pcHidden: (Array.isArray(d.pcHidden) ? d.pcHidden : []) };
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
  'db_backup', 'db_backup_full', 'program_backup',
  'line_stats_timetree_check', 'ripihoryu_auto',
  'line_prefetch', 'timetree_prefetch', 'edit_worker_watchdog',
  'lt_match', 'lt_miss_watch', 'sales_timetree_transfer',
  'line_shinki_watch', 'line_yoyaku_kakutei',
  'edit_worker', 'conflict_watcher', 'super_link',
  // 必要時に実行（2026-07-17追加）
  'travel_group', 'power_schedule', 'idle_guard', 'potcoin_stake', 'restore',
  // ★2026-07-21：旧「その他の設定」＝いまは「必要時に実行」の中／「スーパーズコApp関連」の中
  'tile_settings',   // スーパーズコApp ボタン表示設定（人ごと表示・並び順・合言葉・追加・選び直し）
  'lt_auto_verify',  // 必要時に実行：L⇔T予約照合 全自動AI判定（2026-07-16・PC/App同一ルールで追加）
  'ai_usage_record', // 必要時に実行：自動AIコスト計算（帳簿）のON/OFF（2026-07-17追加）
  'stale_cleanup',   // 必要時に実行：固まった残骸の掃除（2026-07-17追加）
  'kanshi_device'    // スーパーズコApp関連：監視画面を使えるスマホの登録し直し（2026-07-17追加）
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
    new_fruit: fields.new_fruit || '',   // 担当の異動(op=movestaff)＝誰に変えるか（果物マーク）
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
        new_fruit: p.new_fruit || '',   // 担当の異動(op=movestaff)
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

// 担当の異動（①GAS直リンク用）。②静的アプリは action=submit(JSONP)＋op=movestaff で同じキューに積む。
// アプリからは「誰に変えるか(new_fruit)」だけ受け取り、実際のタイトル差し替えは事務所PCのedit_workerが行う
// （被り中の予約か・正しい担当かをPC側で確認＝部屋移動と同じ安全側）。
function uiSubmitMoveStaff(cal, event, newFruit, who, device) {
  var lock = LockService.getScriptLock();
  try { lock.tryLock(10000); } catch (ig) {}
  try {
    var q = _queueGet_();
    return _submitToQueue_(q, 'movestaff', {
      cal: cal, event: event, new_fruit: newFruit,
      who: String(who || '').replace(/[^a-z]/g, ''), role: '', device: device || ''
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
  rireki:     { exec: false, staff: false },   // ★顧客履歴検索＝初期は開発URL(?dev=1)だけ（共通ルール16＝新ボタンは既定で開発者だけ表示。自動監視からONにして開放）
  // ★台湾トマト 売上・コスト＝オーナー(開発者)専用の内部ツール。kanshi/zenjitsuと同じく
  //   開発URL(?dev=1)専用（tile_settings.py の TILES にも入れない＝誰もONにできない）。
  cost:       { exec: false, staff: false },
  // ★広告費管理＝オーナー専用。cost と同じく開発URL(?dev=1)専用（tile_settings.py に入れない）。
  koukoku:    { exec: false, staff: false },
  // ★IGのDM／DM再現＝オーナー専用。koukoku と同じく開発URL(?dev=1)専用（tile_settings.py に入れない）。
  instadm:    { exec: false, staff: false },
  igdm:       { exec: false, staff: false },
  // ★自作Claudeツール＝合言葉の一覧（タップでコピー）。オーナー専用＝開発URL(?dev=1)だけに出る。
  claudetools: { exec: false, staff: false }
};

// ホーム画面のボタン並び順のデフォルト（tile_settings.json に order が無い時）。
// tile_settings.py の「ボタンの並びをかえれる」設定画面（2026-07-16追加）で変更できる。
var DEFAULT_TILE_ORDER_ = ['conflict', 'lt', 'uriage', 'unanswered', 'akijikan', 'links', 'ttapp', 'rireki', 'kanshi', 'zenjitsu', 'cost', 'koukoku', 'igdm', 'instadm', 'claudetools', 'timedsend', 'yoyaku'];

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
  kanbu: '🍅トマト', ringo: '🍎りんご', mikan: '🍊みかん', olive: '🫒オリーブ',
  marron: '🌰マロン', mango: '🥭マンゴー', coconut: '🥥ココナッツ', reception: 'お店受付'
};
// 初期権限＝全員「施術室被り(conflict)」だけON（tile_settings.py DEFAULT と一致）。
// peopleを省略した時は base8(PEOPLE_)のみ＝壊れた時の最終フォールバック用。
function defaultPerms_(people) {
  var list = people || PEOPLE_;
  var perms = {};
  for (var i = 0; i < list.length; i++) {
    perms[list[i]] = { conflict: true, lt: false, uriage: false, unanswered: false, akijikan: false, links: true, ttapp: true, rireki: false, kanshi: false };
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
  return (perms && perms[pid]) || { conflict: true, lt: false, uriage: false, unanswered: false, akijikan: false, links: false, rireki: false, kanshi: false };
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
var ROOM_COLORS_ = { 'FREEDOM': '#2ecc87', 'COSMOS': '#3dc2c8', 'HAPPY': '#e73b3b',
                     'LUCKY': '#fdc02d', 'STAR/福/🇫🇷': '#b38bdc' };
function roomColor_(room) {
  return ROOM_COLORS_[room] || '#64748b';
}

// 担当スタッフの色（果物マーク別）。TimeTree側に対応物が無いので自前定義
// ＝room_conflict_detect.py の _STAFF_COLOR と同じ値にすること（PC版⇔アプリの二重メンテ）。
var STAFF_COLORS_ = { '🍅': '#d1443c', '🍊': '#e08a1e', '🫒': '#4b8b3b', '🥭': '#c9a227' };
function staffColor_(fruit) {
  return STAFF_COLORS_[fruit] || '#64748b';
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
    : (!anyFree ? '<span class="mvng">空いている部屋がありません</span>' : '');
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
      ? gaps.map(function (iv) { return '<span class="slot free">空き ' + toHm_(iv[0]) + '-' + toHm_(iv[1]) + '</span>'; }).join('')
      : '<span class="none">空きなし</span>';
    return '<div class="rstat"><span class="room" style="--rc:' + roomColor_(name) + '">' +
      esc_(shortRoomName_(name)) + '</span><span class="rchips">' + chips + '</span></div>';
  }).join('');
  return '<div class="rspanel" hidden><div class="rstitle">' + esc_(jpMonthDay_(date)) + 'の部屋の空き状況</div>' + rows + '</div>';
}

function esc_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ★2026-07-21：夜間バッチが別に算出していた「コース第N次」(course_counts)は廃止。
// 施術内容も回数も契約台帳(treatment_db)一本に統一した（2026-07-19の台帳移行で実際には
// もう描画していなかった＝このコメントだけが残っていた。オーナー指示で元も止めた）。
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

// ―― 担当（施術者）の異動：候補ボタンと「この日の担当状況」（payload.staff_free を使う）――
function staffMoveRow_(cal, event, title, oldFruit, oldName, timeStr, who, dayStaff) {
  var hasId = !!cal && !!event;
  var range = parseTimeRange_(timeStr);
  var btns = '', anyFree = false;
  (dayStaff || []).forEach(function (row) {
    var f = row[0], name = row[1], slots = row[3] || [];
    if (f === oldFruit) return;
    if (f === '🍍') return;   // ★脱毛をやらない担当(パイン🍍=眉/マツエク専門)は付け替え候補に出さない(2026-07-30オーナー・PC版room_conflict_detectと同内容)
    if (range && !slots.some(function (iv) { return iv[0] <= range[0] && range[1] <= iv[1]; })) return;
    anyFree = true;
    btns += '<button type="button" class="smvbtn"' + (hasId ? '' : ' disabled') +
      ' data-cal="' + esc_(cal || '') + '" data-ev="' + esc_(event || '') + '"' +
      ' data-newfruit="' + esc_(f) + '" data-name="' + esc_(name) + '"' +
      ' data-oldfruit="' + esc_(oldFruit || '') + '" data-oldname="' + esc_(oldName || '') + '"' +
      ' data-who="' + esc_(who || '') + '" data-time="' + esc_(timeStr || '') + '"' +
      ' style="--sc:' + staffColor_(f) + '">' + esc_(f) + esc_(name) + '</button>';
  });
  var note = !hasId ? '<span class="mvng">IDが取れず異動できません</span>'
    : (anyFree ? '' : '<span class="mvng">空いている担当がいません</span>');
  return '<div class="mvrow"><div class="mvlabel fit1line">異動先の担当を選んでね（下のボタンを押す）</div>' +
    '<div class="mvhint fit1line">※その時間に空いている担当のみ表示しています</div>' +
    '<span class="mvbtns">' + btns + note + '</span></div>';
}

function staffStatusPanel_(date, dayStaff) {
  var rows = (dayStaff || []).map(function (row) {
    var f = row[0], name = row[1], shift = row[2], slots = row[3] || [];
    var chips = slots.length
      ? slots.map(function (iv) { return '<span class="slot free">空き ' + toHm_(iv[0]) + '-' + toHm_(iv[1]) + '</span>'; }).join('')
      : '<span class="none">空きなし</span>';
    return '<div class="rstat"><span class="staffpill" style="--sc:' + staffColor_(f) + '">' + esc_(f) + esc_(name) + '</span>' +
      '<span class="rchips"><span class="slot" style="opacity:.7">勤務 ' + esc_(shift) + '</span>' + chips + '</span></div>';
  }).join('');
  if (!rows) rows = '<div class="rstat"><span class="none">この日の出勤者の情報がありません</span></div>';
  return '<div class="rspanel" hidden><div class="rstitle">' + esc_(jpMonthDay_(date)) + 'の担当の空き状況</div>' + rows + '</div>';
}

function renderPage_(conflicts, meta, payload, withNail, base, staff, dev, staffConflicts) {
  var real = conflicts.length;
  staffConflicts = staffConflicts || [];
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

  var items = [];   // 部屋かぶり・人かぶりを混ぜて時刻順の1リストで出す（2026-07-25まるちゃん指示）。
  conflicts.forEach(function (x, idx) {
      var rc = roomColor_(x.room);
      var roomBusyForDate = (payload.room_busy && payload.room_busy[x.date]) || {};
      var h = '' +
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
    items.push({ key: [x.date || '', x.overlap_time || '', 0], html: h });
  });

  // ―― 施術者（担当スタッフ）被り：同じ担当なので各予約の左は担当マークでなく『部屋マーク』を出す ――
  staffConflicts.forEach(function (x) {
      var sc = staffColor_(x.staff);
      var pill = ((x.staff || '') + (x.staff_name || '')).trim() || '担当';
      var dayStaff = (payload.staff_free && payload.staff_free[x.date]) || [];
      function side_(ab) {
        var room = x[ab + '_room'] || '';
        var roomMark = '<span class="lroom" style="--rc:' + roomColor_(room || '') + '">' +
          esc_(room ? shortRoomName_(room) : ab.toUpperCase()) + '</span>';
        return '<div class="side">' +
          '<div class="time">' + roomMark + esc_(x[ab + '_time']) + '</div>' +
          '<div class="who"><span class="code">' + esc_(x[ab + '_code']) + '</span>' +
          '<span class="name">' + esc_(x[ab + '_name']) + '</span></div>' +
          menu_(x[ab + '_menu']) +
        '</div>';
      }
      var h = '' +
      '<article class="card staff" style="--sc:' + sc + '">' +
        '<header class="card-h">' +
          '<div class="cline">' +
            '<div class="clineDate fit1line">' + esc_(jpDateWeekday_(x.date)) + ' ' + esc_(x.overlap_time) + '</div>' +
            '<div class="clineRoom staffLine">' +
              '<span class="staffpill" style="--sc:' + sc + '">' + esc_(pill) + '</span>' +
              '<span class="cmsg">が同じ時間に2件を掛け持ちしています</span>' +
            '</div>' +
          '</div>' +
          (x.dup_suspect ? '<span class="dup">⚠️同一人物の疑い(二重入力?)</span>' : '') +
        '</header>' +
        '<div class="pair">' + side_('a') + '<div class="vs"></div>' + side_('b') + '</div>' +
        '<div class="mv">' +
          '<div class="mvtoprow">' +
            '<button type="button" class="mvtoggle" data-side="A">この予約の<br>担当を異動</button>' +
            '<button type="button" class="mvtoggle" data-side="B">この予約の<br>担当を異動</button>' +
          '</div>' +
          '<div class="mvpanel" data-side="A" hidden>' +
            staffMoveRow_(x.a_cal_id, x.a_event_id, x.a_title || '', x.staff, x.staff_name || '', x.a_time, [x.a_code, x.a_name].filter(Boolean).join(' '), dayStaff) +
            '<button type="button" class="rstoggle fit1line">📋 念のため、この日の担当状況を見る</button>' +
            staffStatusPanel_(x.date, dayStaff) +
          '</div>' +
          '<div class="mvpanel" data-side="B" hidden>' +
            staffMoveRow_(x.b_cal_id, x.b_event_id, x.b_title || '', x.staff, x.staff_name || '', x.b_time, [x.b_code, x.b_name].filter(Boolean).join(' '), dayStaff) +
            '<button type="button" class="rstoggle fit1line">📋 念のため、この日の担当状況を見る</button>' +
            staffStatusPanel_(x.date, dayStaff) +
          '</div>' +
          '<div class="mvstatus" hidden></div>' +
        '</div>' +
      '</article>';
      items.push({ key: [x.date || '', x.overlap_time || '', 1], html: h });
  });

  items.sort(function (a, b) {
    for (var i = 0; i < 3; i++) { if (a.key[i] < b.key[i]) return -1; if (a.key[i] > b.key[i]) return 1; }
    return 0;
  });
  var total = real + staffConflicts.length;
  var bodyCards = items.length
    ? items.map(function (it) { return it.html; }).join('\n')
    : '<div class="empty">✅ 施術室・施術者の被りはありませんでした</div>';

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
  '<h1 class="fit1line">⚠️ 部屋＆担当 被り検出 <span class="cnt">' + (real + staffConflicts.length) + '件</span>' + nailNote + '</h1>' +
  bodyCards +
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
    icon: '<span class="ticon">🛏️</span>', label: '部屋＆担当\n被り検出' },
  { id: 'lt', cls: 'lt', view: 'lt',
    icon: '<span class="ticon"><span class="lt2">' + LINE_LOGO_ + TT_LOGO_ + '</span></span>', label: 'TimeTree\n予約記入漏れ' },
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
    icon: '<span class="ticon">🔎</span>', label: '顧客履歴\n検索' },
  // ★台湾トマト 売上・コスト＝オーナー(開発者)専用の内部ツール。開発URL(?dev=1)専用
  //   （kanshi/zenjitsuと同じ。tile_settings.py にも入れない）。押すと「月間コスト計算」ボタン→コスト表。
  { id: 'cost', cls: 'cost', view: 'cost',
    icon: '<span class="ticon">🍅</span>', label: '台湾トマト\n売上・コスト' },
  // ★広告費管理＝オーナー(開発者)専用の内部ツール。開発URL(?dev=1)専用（cost/kanshiと同じ＝
  //   tile_settings.py に入れないので開発者だけに出る）。国籍×性別で広告費を見る＋広告ごとの明細。
  { id: 'koukoku', cls: 'koukoku', view: 'koukoku',
    icon: '<span class="ticon">📣</span>', label: '広告費\n管理' },
  // ★DM再現＝インスタのDM画面をそっくり再現（左に一覧・右にやり取り全文）。開発URL(?dev=1)専用。2026-08-02。
  { id: 'igdm', cls: 'igdm', view: 'igdm',
    icon: '<span class="ticon">📱</span>', label: 'DM\n再現' },
  // ★IGのDM＝3つのインスタに来たDMを読む（既読を付けずに一覧だけ）。開発URL(?dev=1)専用
  //   （koukoku/kanshiと同じ＝tile_settings.py に入れないので開発者だけに出る）。2026-08-02 第一弾。
  { id: 'instadm', cls: 'instadm', view: 'instadm',
    icon: '<span class="ticon">📩</span>', label: 'IGの\nDM' },
  // ★自作Claudeツール＝Claudeに言う「合言葉」を並べる。タップでコピー→別のチャットに貼るだけ。開発URL(?dev=1)専用。
  { id: 'claudetools', cls: 'claudetools', view: 'claudetools',
    icon: '<span class="ticon">🤖</span>', label: '自作Claude\nツール' },
  // ★時間指定LINE送信＝決めた時刻に文章＋画像を公式LINEから送る予約画面。開発URL(?dev=1)専用
  //   （kanshi/zenjitsu/costと同じ＝tile_settings.pyに入れないので開発者だけに出る）。PC版と並びをそろえる。
  { id: 'timedsend', cls: 'timedsend', view: 'timedsend',
    icon: '<span class="ticon">⏰</span>', label: '時間指定\nLINE送信' },
  // ★予約入力＝貼って選ぶだけで新規予約を1件作る。開発URL(?dev=1)専用（kanshi/zenjitsu/costと同じ＝
  //   tile_settings.py に入れないので開発者だけに出る）。登録は事務所PC(edit_worker op=new_reservation)が実行。
  { id: 'yoyaku', cls: 'yoyaku', view: 'yoyaku',
    icon: '<span class="ticon">📝</span>', label: '予約\n入力' }
];

// ★2026-08-02 まるちゃん決定：開発版(?dev=1)とPC版のホームは、まず「管理者用／実務者用／開発者用」の
//   3つの大ボタンを出し、押すとその仲間だけを見せる（上の「← 戻る」で3ボタンに戻る）。普通のスタッフ版・
//   社長版は今まで通り一覧のまま。どのボタンがどの部屋か（ここに無いidは実務者用）＝PC版 super_pc.py の
//   GROUP_OF と一致させる（片方直したら必ず両方）。
var TILE_GROUP_ = {
  uriage: 'kanri', kanshi: 'kanri', mushitori: 'kanri', cost: 'kanri', koukoku: 'kanri', imglink: 'kanri',
  instadm: 'kanri', igdm: 'kanri', claudetools: 'kanri',
  formconv: 'kaihatsu', honyaku: 'kaihatsu', timedsend: 'kaihatsu'
};
var ROLE_DEFS_ = [
  { id: 'kanri', icon: '🛠️', title: '管理者用' },
  { id: 'jitsumu', icon: '💼', title: '実務者用' },
  { id: 'kaihatsu', icon: '🧑‍💻', title: '開発者用' }
];
function tileGroup_(id) { return TILE_GROUP_[id] || 'jitsumu'; }

// 3つの大ボタン⇔仲間の切り替え（差し込んだ<script>はrunScriptsで実行される）。
var ROLEMENU_SCRIPT_ =
'<script>(function(){' +
'var menu=document.getElementById("rolemenu");if(!menu)return;' +
'function showMenu(){menu.style.display="";var g=document.querySelectorAll(".group");for(var i=0;i<g.length;i++)g[i].style.display="none";window.scrollTo(0,0);}' +
'function showGroup(id){menu.style.display="none";var g=document.querySelectorAll(".group");for(var i=0;i<g.length;i++)g[i].style.display=(g[i].id==="group-"+id)?"":"none";window.scrollTo(0,0);}' +
'var rb=menu.querySelectorAll(".rolebtn");for(var i=0;i<rb.length;i++){(function(b){b.addEventListener("click",function(){showGroup(b.getAttribute("data-role"));});})(rb[i]);}' +
'var bb=document.querySelectorAll(".backbtn");for(var j=0;j<bb.length;j++){bb[j].addEventListener("click",showMenu);}' +
'})();</script>';

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
  var shown = orderedDefs.filter(function (t) {
    if (t.always) return true;        // 外部リンクだけのボタン等＝権限に関係なく常に表示
    if (!allow) return true;          // dev＝全部
    return allow[t.id] === true;      // 明示ONのボタンだけ表示（初期は施術室被りのみ）
  });
  function tileA_(t) {
    // url指定＝外部サイトへのリンク（新しいタブで開く）。無指定＝アプリ内view遷移（従来通り）。
    var href = t.url ? t.url : (base + '?view=' + t.view + sfx);
    var target = t.url ? '_blank' : '_top';
    var rel = t.url ? ' rel="noopener"' : '';
    return '<a class="tile ' + t.cls + '" href="' + href + '" target="' + target + '"' + rel + '>' +
      t.icon + '<span class="tname">' + esc_(t.label) + '</span></a>';
  }
  var head =
    '<div class="hhead"><img class="bmark" src="https://ttsuperzuco.github.io/tt/icons/icon-180.png" alt=""><span class="bname">TTスーパーズコ</span></div>' +
    '<div class="hsub">' + subtitle + '</div>';
  // 開発版(?dev=1)＝まず3つの大ボタン、押すとその仲間だけ表示（PC版と同じ見せ方）。それ以外は今まで通り一覧。
  if (dev) {
    var byG = { kanri: [], jitsumu: [], kaihatsu: [] };
    for (var gi = 0; gi < shown.length; gi++) { (byG[tileGroup_(shown[gi].id)] || byG.jitsumu).push(shown[gi]); }
    var menuHtml = '', groupsHtml = '';
    for (var ri = 0; ri < ROLE_DEFS_.length; ri++) {
      var R = ROLE_DEFS_[ri], list = byG[R.id] || [];
      menuHtml += '<button type="button" class="rolebtn ' + R.id + '" data-role="' + R.id + '">' +
        '<span class="ricon">' + R.icon + '</span><span class="rname">' + R.title + '</span>' +
        '<span class="rcount">' + list.length + '個</span></button>';
      groupsHtml += '<div class="group" id="group-' + R.id + '" style="display:none">' +
        '<div class="backbar"><button type="button" class="backbtn">← 戻る</button></div>' +
        '<div class="grouptitle">' + R.icon + ' ' + R.title + '</div>' +
        '<div class="tiles">' + list.map(tileA_).join('') + '</div></div>';
    }
    return '<style>' + HOMECSS_ + '</style>' +
      '<div class="home">' + head +
        '<div class="rolemenu" id="rolemenu">' + menuHtml + '</div>' +
        groupsHtml +
      '</div>' + ROLEMENU_SCRIPT_;
  }
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' + head +
    '<div class="tiles">' + shown.map(tileA_).join('') + '</div>' +
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

// TimeTree予約記入漏れの1件カード（スタッフが一目で分かる形。2026-07-30作り替え）。
//   出す物＝通し番号＋氏名／予約日時／予約内容／根拠のLINE会話(吹き出し・抜粋)＋その客のLINEへ飛ぶボタン。
//   ★システム内部の言葉（AI判定名・再照合・一致マーク・別人の予定）は出さない（スタッフに不要）。
function ltCard_(r) {
  var cls = esc_(r.cls || 'add');
  var name = r.name || '（名前不明）';
  var search = esc_(((name) + ' ' + (r.code || '')).toLowerCase());
  // 氏名(display_name)は既に「F758廣田貴絵様」のように番号を含むことが多い。
  // 含む時は番号チップを重ねて出さない（"F758 F758廣田様"の二重表示を防ぐ）。
  var codeHtml = (r.code && name.indexOf(r.code) < 0)
    ? '<span class="lcode">' + esc_(r.code) + '</span>' : '';

  // 予約内容（契約台帳）。無い時は出さない。ラベルは2行「予約／内容」。
  var treatHtml = r.treatment
    ? '<div class="lmeta"><span class="ltag">予約<br>内容</span><span class="ltxt">' + esc_(r.treatment) + '</span></div>'
    : '';

  // 会話の頭がスタンプ/画像などで始まる時は、その並びを飛ばす（頭にスタンプが並ぶのを消す）。
  var conv = r.conv || [];
  var MARK = {'[スタンプ]': 1, '[画像]': 1, '[動画]': 1, '[ファイル]': 1, '[送信取消]': 1};
  var st = 0;
  while (st < conv.length && MARK[conv[st].text]) st++;
  conv = conv.slice(st);

  // 根拠のLINE会話（予約日周辺の抜粋）を吹き出しで再現。店＝右(緑)／客＝左(白)。
  var bubbles = conv.map(function (m) {
    var shop = (m.who === '店');
    var who = shop ? 'TaiwanTomato' : esc_(name);
    var t = esc_(m.t || '');
    var meta = shop ? (who + '　' + t) : (t + '　' + who);
    var side = shop ? 's' : 'c';
    return '<div class="lqt ' + side + '">' + meta + '</div>' +
           '<div class="lqrow ' + side + '"><span class="lqb ' + side + '">' + esc_(m.text || '') + '</span></div>';
  }).join('');
  if (!bubbles) bubbles = '<div class="lqnone">会話の記録が見つかりませんでした</div>';

  var lineBtn = r.line_url
    ? '<a class="lqline" href="' + esc_(r.line_url) + '" target="_top" rel="noopener">このお客様の<br>LINEに飛ぶ ↗</a>'
    : '';

  // ★2026-07-31：日時を「LINE予約」「TimeTree予約」の2行にする（どちらが正か一目で分かるように）。
  //   タイムツリーに予約が無い時は「TimeTree予約　記入なし」と出す。
  var _ttHas = r.tt_time && r.tt_time !== '—' && r.tt_time !== '';
  // TimeTreeは終わりの時刻を出さない＝始まりの時刻だけにする（「12:00–13:20」→「12:00」）。
  var ttStart = (r.tt_time || '').split(/[–—〜~-]/)[0].trim();
  // LINEとTimeTreeで時刻がズレている時（要修正）は、両方の時刻をピンクで強調する。
  var _diff = (r.status === 'time_mismatch') ? ' ldtdiff' : '';
  var dateStr = esc_(jpDateWeekday_(r.date));

  // ★削除もれ＝お客様はLINEでキャンセル済み。LINE側は時刻でなく「キャンセル」と出す
  //   （普通の予約に見えないように＝やることは"消す"）。
  var _isDel = (r.status === 'need_delete');
  var lineInner = _isDel
    ? '<span class="ldtdt"><span class="ldtd">' + dateStr + '</span><span class="ldtt ldtnone">キャンセル</span></span>'
    : '<span class="ldtdt"><span class="ldtd">' + dateStr + '</span><span class="ldtt' + _diff + '">' + esc_(r.line_time || '') + '</span></span>';
  var lineCell =
    '<div class="ldtcell">' +
      '<span class="lbadge2 line"><span class="b1">LINE</span><span class="b2">予約</span></span>' +
      lineInner +
    '</div>';
  // ★予約自体はパインのカレンダーに有るが、お店の部屋の枠が未確保＝「部屋未定」（2026-08-01オーナー）。
  var ttInner = r.room_undecided
    ? '<span class="ldtdt"><span class="ldtd">' + dateStr + '</span><span class="ldtt ltroomx">部屋未定</span></span>'
    : (_ttHas
      ? '<span class="ldtdt"><span class="ldtd">' + dateStr + '</span><span class="ldtt' + _diff + '">' + esc_(ttStart) + '</span></span>'
      : '<span class="ldtdt"><span class="ldtt ldtnone">記入なし</span></span>');
  var ttCell =
    '<div class="ldtcell">' +
      '<span class="lbadge2 tt"><span class="b1">TimeTree</span><span class="b2">予約</span></span>' +
      ttInner +
    '</div>';

  return '' +
  '<article class="lcard ' + cls + '" data-search="' + search + '">' +
    '<div class="lhead">' + codeHtml + '<span class="lname">' + esc_(name) + '</span></div>' +
    '<div class="ldtwrap"><div class="ldtin">' + lineCell + ttCell + '</div></div>' +
    treatHtml +
    '<div class="lconv">' +
      '<div class="lconvh"><span class="lconvlab">根拠のLINE会話</span>' + lineBtn + '</div>' +
      '<div class="lconvb">' + bubbles + '</div>' +
    '</div>' +
  '</article>';
}

// 下にまとめる「まだ予約前・対応不要」の1行の状態ラベル（記入漏れではない物）。
function ltDismLabel_(r) {
  var rc = r.recheck_disposition || '';
  if (rc === 'awaiting_reply') return 'まだ予約前（客の返事待ち）';
  if (rc === 'confirmed_ok') return 'もう入っている';
  return '対応不要';
}

function renderLtPage_(d, base, staff, dev) {
  var c = d.counts || {};
  var action = d.action || [];
  var oks = d.ok || [];
  var dismissed = d.dismissed || [];

  // ★状態ごとに見出しを分ける（時刻ズレ／記入もれ／要確認）。「⚠️ TimeTree予約ズレ ◯件」の形。
  var LTGROUPS = [
    { st: 'time_mismatch',  title: 'TimeTree予約ズレ' },
    { st: 'not_found',      title: '記入もれ' },
    { st: 'room_undecided', title: '部屋未定' },
    { st: 'need_delete',    title: '削除もれ' },
    { st: 'need_check',     title: '要確認' }
  ];
  var cards = '';
  LTGROUPS.forEach(function (g) {
    var rows = action.filter(function (r) { return r.status === g.st; });
    if (!rows.length) return;
    cards += '<h1>⚠️ ' + g.title + ' <span class="lcnt">' + rows.length + '件</span></h1>' +
             '<div class="lcards">' + rows.map(ltCard_).join('\n') + '</div>';
  });
  var _known = LTGROUPS.map(function (g) { return g.st; });
  var _others = action.filter(function (r) { return _known.indexOf(r.status) < 0; });
  if (_others.length) {
    cards += '<h1>⚠️ 要確認 <span class="lcnt">' + _others.length + '件</span></h1>' +
             '<div class="lcards">' + _others.map(ltCard_).join('\n') + '</div>';
  }
  if (!action.length) {
    cards = '<h1>TimeTree予約 記入漏れ</h1><div class="lempty">記入漏れはありません 🎉</div>';
  }

  var dismRows = dismissed.length
    ? dismissed.map(function (r) {
        return '<tr data-search="' + esc_(((r.name || '') + ' ' + (r.code || '')).toLowerCase()) + '">' +
          '<td>' + esc_(r.date || '') + '</td><td>' + esc_(r.line_time || '') + '</td>' +
          '<td>' + esc_(r.name || '') + '</td></tr>';
      }).join('\n')
    : '<tr><td colspan="3">なし</td></tr>';

  return '' +
'<style>' + LTCSS_ + '</style>' +
'<div class="lwrap">' +
  '<div class="lbar">' +
    '<a class="lhome" href="' + (base || '') + '?view=home' + roleSfx_(staff, dev) + '" target="_top">← 前に戻る</a>' +
    '<span class="lgen">照合: ' + esc_(d.matched_at || d.generated_at || '—') + '</span>' +
  '</div>' +
  cards +
'</div>' + LTFIT_SCRIPT_;
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

// 前日お知らせ画面のCSS。日付を選ぶ帯＋状態表示＋確認画面の枠(iframe)。
var ZENJITSUCSS_ =
  '  .zjbar { display:flex; gap:8px; align-items:center; flex-wrap:wrap; position:sticky; top:0;' +
  '    background:var(--bg,#2C7A99); padding:8px 0 10px; z-index:5; }' +
  '  #zjdate { font-size:1.05rem; padding:11px 12px; border-radius:12px; border:0; }' +
  '  #zjgo { font-size:1rem; font-weight:800; padding:11px 18px; border:0; border-radius:12px; background:#db2777; color:#fff; }' +
  '  #zjgo:disabled { opacity:.6; }' +
  '  .zjstatus { color:#eaf3f7; font-size:.92rem; margin:2px 2px 10px; min-height:1.2em; }' +
  '  .zjframe { width:100%; min-height:60vh; border:0; border-radius:14px; background:#fff;' +
  '    box-shadow:0 6px 18px rgba(0,0,0,.14); display:block; }';

/** 前日お知らせ（社長確認用・開発URL専用）。PC版と同じ「来店日を選ぶ」入口。
 *  日付を選んで押す→事務所PCへ依頼(op=zenjitsu)→PCが確認画面HTMLを notice_<端末>.json に書き出す
 *  →それを枠(iframe)に入れて表示＝PC版とまったく同じ画面。顧客履歴検索(cust_search)と同じ往復方式。 */
function renderZenjitsuPage_(base, staff, dev) {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var script =
  '<script>(function(){' +
  'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
  'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
  'var slot=(idn.device||"d0").toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,32)||"default";' +
  'var dEl=document.getElementById("zjdate"),goEl=document.getElementById("zjgo"),stEl=document.getElementById("zjstatus"),resEl=document.getElementById("zjres");' +
  'function esc(s){return (s==null?"":String(s)).replace(/[&<>\\"\\x27]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\\x27":"&#39;"}[c];});}' +
  'function jsonp(params,onR){var cb="__zj"+Date.now()+Math.floor(Math.random()*1000);window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
  'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
  'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
  'function fit(f){try{f.style.height="0";var h=f.contentDocument.documentElement.scrollHeight;if(h)f.style.height=(h+24)+"px";}catch(e){}}' +
  'function showResult(d){if(!d||!d.body_html){stEl.textContent=(d&&d.error)?("エラー："+d.error):"この日は予約がありませんでした。";resEl.innerHTML="";return;}' +
  'stEl.textContent="この日の確認（"+esc(d.date||"")+"・"+((d.count!=null)?d.count:"?")+"件）／作成 "+esc(d.generated_at||"");' +
  'resEl.innerHTML="<iframe id=\\"zjframe\\" class=\\"zjframe\\" srcdoc=\\""+esc(d.body_html)+"\\"></iframe>";' +
  'var f=document.getElementById("zjframe");f.addEventListener("load",function(){fit(f);});' +
  'setTimeout(function(){fit(f);},600);setTimeout(function(){fit(f);},1600);setTimeout(function(){fit(f);},3200);' +
  'window.addEventListener("resize",function(){fit(f);});}' +
  'var polls=0;function poll(id){polls++;if(polls>40){stEl.textContent="時間切れです。事務所PCが動いているかご確認のうえ、もう一度お試しください。";goEl.disabled=false;return;}' +
  'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){stEl.textContent="エラー："+((r&&r.error)||"不明");goEl.disabled=false;return;}' +
  'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){poll(id);},1300);return;}' +
  'goEl.disabled=false;' +
  'if(r.status!=="done"){stEl.textContent="作成に失敗しました："+esc(r.result||r.status);return;}' +
  'jsonp({action:"data",name:"notice_"+slot+".json"},function(d){showResult(d);});});}' +
  'function run(){var date=(dEl.value||"").trim();if(!date){stEl.textContent="来店日を選んでください。";return;}' +
  'goEl.disabled=true;stEl.textContent="事務所PCで作成中…（十数秒かかります）";resEl.innerHTML="";polls=0;' +
  'jsonp({action:"submit",key:KEY,op:"zenjitsu",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({date:date,slot:slot})},' +
  'function(r){if(!r||!r.ok||!r.id){stEl.textContent="依頼を送れませんでした："+((r&&r.error)||"不明");goEl.disabled=false;return;}setTimeout(function(){poll(r.id);},1000);});}' +
  'var t=new Date();t.setDate(t.getDate()+2);dEl.value=t.toISOString().slice(0,10);' +
  'goEl.addEventListener("click",run);dEl.addEventListener("change",run);' +
  'run();' +
  '})();</script>';
  return '<style>' + HOMECSS_ + ZENJITSUCSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">🔔</span><span class="bname">前日お知らせ</span></div>' +
    '<div class="zjbar"><label style="color:#fff;font-weight:700;">来店日 <input type="date" id="zjdate"></label>' +
      '<button id="zjgo" type="button">この日で確認</button></div>' +
    '<div class="zjstatus" id="zjstatus">来店日を選ぶと、事務所PCが確認画面を作って表示します（お客様には送りません＝見るだけ）。</div>' +
    '<div id="zjres"></div>' +
  '</div>' + script;
}

// ====== 台湾トマト 売上・コスト（view=cost・開発URL専用／2026-07-25追加） ======
// ★開発URL(?dev=1)専用＝オーナー(開発者)だけが見られる内部ツール（kanshi/zenjitsuと同じ）。
//   tile_settings.py の TILES には入れない＝人ごとの権限画面に出ない＝誰もONにできない。
// ★コストの費目・金額はオーナーから随時教わって、下の COST_ITEMS_ に1件ずつ足していく：
//     { name:'費目名', amount:金額(数字・元), note:'補足(任意・無ければ省略)' }
//   足したら必ず index.html の code.js?v= と sw.js の CACHE 名を1つ上げて push すること
//   （でないとスマホに新しい費目が届かない＝スーパーズコApp_必読.md「キャッシュ」参照）。
var COST_ITEMS_ = [
  // 例) { name:'家賃', amount:30000, note:'毎月1日引き落とし' },
];

var COSTCSS_ =
  '  .ctwrap { max-width:640px; margin:0 auto; }' +
  '  .cbtnrow { text-align:center; margin:20px 0 4px; }' +
  '  #cgo { font-size:1.28rem; font-weight:900; padding:17px 32px; border:0; border-radius:16px;' +
  '    background:#e0533d; color:#fff; cursor:pointer; box-shadow:0 6px 18px rgba(224,83,61,.42); letter-spacing:.04em; }' +
  '  #cgo:active { transform:translateY(2px); box-shadow:0 3px 10px rgba(224,83,61,.32); }' +
  '  .costcard { background:var(--card,#fff); color:var(--ink,#0f172a); border-radius:16px; overflow:hidden;' +
  '    box-shadow:0 6px 18px rgba(0,0,0,.14); margin-top:16px; }' +
  '  .costcard.hidden { display:none; }' +
  '  .ctitle { font-size:1.18rem; font-weight:900; padding:16px 18px 4px; }' +
  '  .csub { color:var(--sub,#64748b); font-size:.86rem; padding:0 18px 10px; }' +
  '  table.ctab { width:100%; border-collapse:collapse; }' +
  '  table.ctab th { color:var(--sub,#64748b); font-size:.82rem; font-weight:700; text-align:left; padding:8px 18px; }' +
  '  table.ctab td { padding:14px 18px; text-align:left; border-top:1px solid var(--line,#e2e8f0); vertical-align:top; }' +
  '  table.ctab th.amt, table.ctab td.amt { text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }' +
  '  table.ctab td.cname { font-weight:700; }' +
  '  table.ctab .cnote { color:var(--sub,#64748b); font-size:.78rem; font-weight:400; margin-top:3px; }' +
  '  table.ctab tr.total td { border-top:2px solid var(--ink,#0f172a); font-weight:900; font-size:1.16rem;' +
  '    background:rgba(224,83,61,.09); }' +
  '  .cempty { padding:36px 22px; text-align:center; color:var(--sub,#64748b); line-height:1.8; font-size:.96rem; }';

// 数字を「1,234 元」の見やすい形にする（3桁ごとに区切り＋単位）。
function _costYen_(n) {
  var s = String(Math.round(Number(n) || 0));
  var neg = (s.charAt(0) === '-'); if (neg) s = s.slice(1);
  var out = '', c = 0;
  for (var i = s.length - 1; i >= 0; i--) { out = s.charAt(i) + out; if (++c % 3 === 0 && i > 0) out = ',' + out; }
  return (neg ? '-' : '') + out + ' 元';
}

/** 台湾トマト 売上・コスト（オーナー専用・開発URL専用）。
 *  最初は「月間コスト計算」ボタンだけ。押すと COST_ITEMS_ の費目一覧＋合計の表を出す。
 *  純JS（GAS API不使用）＝①GAS直も②静的アプリも同じこの関数を呼ぶ。 */
function renderCostPage_(base, staff, dev) {
  var rows = '', total = 0;
  for (var i = 0; i < COST_ITEMS_.length; i++) {
    var it = COST_ITEMS_[i] || {}, amt = Number(it.amount) || 0;
    total += amt;
    rows += '<tr><td class="cname">' + esc_(it.name || '') +
      (it.note ? '<div class="cnote">' + esc_(it.note) + '</div>' : '') + '</td>' +
      '<td class="amt">' + esc_(_costYen_(amt)) + '</td></tr>';
  }
  var body;
  if (COST_ITEMS_.length === 0) {
    body = '<div class="cempty">まだ費目が登録されていません。<br>これから1つずつ足していきます。</div>';
  } else {
    body = '<table class="ctab"><thead><tr><th>費目</th><th class="amt">金額</th></tr></thead><tbody>' +
      rows +
      '<tr class="total"><td>月間コスト合計</td><td class="amt">' + esc_(_costYen_(total)) + '</td></tr>' +
      '</tbody></table>';
  }
  var script =
    '<script>(function(){' +
    'var b=document.getElementById("cgo"),c=document.getElementById("ccard");' +
    'if(b&&c){b.addEventListener("click",function(){c.classList.remove("hidden");' +
    'try{c.scrollIntoView({behavior:"smooth",block:"start"});}catch(e){}});}' +
    '})();</script>';
  return '<style>' + HOMECSS_ + COSTCSS_ + '</style>' +
    '<div class="home">' +
      backBar_(base, staff, dev) +
      '<div class="hhead"><span class="bmark">🍅</span><span class="bname">台湾トマト</span></div>' +
      '<div class="hsub" style="color:#fff;text-align:center;font-weight:700;margin:0 0 6px;letter-spacing:.06em;">売上・コスト</div>' +
      '<div class="ctwrap">' +
        '<div class="cbtnrow"><button id="cgo" type="button">月間コスト計算</button></div>' +
        '<div id="ccard" class="costcard hidden">' +
          '<div class="ctitle">🍅 台湾トマト 月間コスト</div>' +
          '<div class="csub">毎月かかる決まった費用の一覧です。</div>' +
          body +
        '</div>' +
      '</div>' +
    '</div>' + script;
}

// ====== 広告費管理 ／ インスタグラム広告（view=koukoku・開発URL専用／2026-07-30） ======
// ★開発URL(?dev=1)専用＝オーナー(開発者)だけが見られる内部ツール（cost/kanshiと同じ）。
// ★中身は「インスタ広告読み取り」が毎日1回、裏でインスタのダッシュボードから自動で読み取った
//   実際の数字（状態・使った実額・見られた回数・プロフィール来訪・広告画像）。事務所PCが
//   koukoku.json に書き出す（画像は写真そのものを埋め込み）→ このアプリはそれを読んで並べるだけ。
//   ・合計金額は出さない（オーナー指示・2026-07-30）。
//   ・データの元＝read_ads.py の _export_app（施術室被り検出\web\koukoku.json ＋ Google側へ push）。
//   ★見た目を直したら index.html の code.js?v= と sw.js の CACHE 名を1つ上げて push すること。
var KOUKOKUCSS_ =
  '  .kk { max-width:640px; margin:0 auto; }' +
  '  .kkbadge { display:inline-block; background:rgba(22,163,74,.16); color:#16a34a; font-size:.8rem;' +
  '    font-weight:800; padding:4px 12px; border-radius:999px; margin:2px 0 6px; }' +
  '  .kkwhen { color:#fff; opacity:.85; font-size:.82rem; margin:0 2px 16px; }' +
  '  .kkad { background:var(--card,#fff); color:var(--ink,#0f172a); border-radius:14px; padding:11px;' +
  '    margin-bottom:11px; display:flex; gap:12px; align-items:center; box-shadow:0 4px 14px rgba(0,0,0,.12); }' +
  '  .kkth { width:74px; height:74px; border-radius:10px; object-fit:cover; flex:none; }' +
  '  .kkth.ph { background:var(--line,#e2e8f0); display:flex; align-items:center; justify-content:center;' +
  '    color:var(--sub,#64748b); font-size:.7rem; }' +
  '  .kkinfo { flex:1; min-width:0; }' +
  '  .kkr1 { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:5px; }' +
  '  .kkst { font-size:.7rem; font-weight:800; padding:2px 9px; border-radius:999px; }' +
  '  .kklive2 { background:rgba(22,163,74,.16); color:#16a34a; }' +
  '  .kkstop { background:rgba(148,163,184,.22); color:#64748b; }' +
  '  .kkspend { font-weight:900; font-size:1.08rem; color:var(--ink,#0f172a); }' +
  '  .kkspend small { color:var(--sub,#64748b); font-weight:700; font-size:.7rem; }' +
  '  .kkkv { color:var(--sub,#64748b); font-size:.82rem; }' +
  '  .kkkv b { color:var(--ink,#0f172a); font-weight:700; }' +
  '  .kkempty { padding:34px 20px; text-align:center; color:#fff; opacity:.9; line-height:1.9; font-size:.98rem; }' +
  '  .kkacc { color:#fff; font-weight:800; font-size:1.02rem; margin:20px 2px 9px; padding-left:10px; border-left:4px solid #7c3aed; }' +
  '  .kkacc small { opacity:.82; font-weight:600; font-size:.76rem; margin-left:6px; }' +
  '  .kkempty2 { color:rgba(255,255,255,.85); font-size:.86rem; padding:4px 2px 12px; }' +
  '  .kkseg { display:inline-flex; background:var(--card,#fff); border:1px solid var(--line,#e2e8f0); border-radius:999px; padding:4px; gap:4px; margin:4px 0 14px; }' +
  '  .kkseg button { border:0; background:transparent; color:var(--sub,#64748b); font-size:.95rem; font-weight:800; padding:8px 18px; border-radius:999px; cursor:pointer; }' +
  '  .kkseg button.on { background:#e0533d; color:#fff; }' +
  '  .kkcard { background:var(--card,#fff); color:var(--ink,#0f172a); border-radius:16px; box-shadow:0 6px 18px rgba(0,0,0,.14); padding:14px 12px 10px; margin-bottom:16px; }' +
  '  table.kktab { width:100%; border-collapse:collapse; }' +
  '  table.kktab th, table.kktab td { padding:12px 5px; text-align:center; font-size:1.02rem; }' +
  '  table.kktab thead th { color:var(--sub,#64748b); font-size:.82rem; font-weight:700; border-bottom:1px solid var(--line,#e2e8f0); }' +
  '  table.kktab tbody th { text-align:left; color:var(--ink,#0f172a); font-weight:800; font-size:.92rem; white-space:nowrap; }' +
  '  .kkcell { border-radius:10px; font-weight:800; color:#fff; padding:11px 3px; display:block; font-variant-numeric:tabular-nums; }' +
  '  .kktot { color:#0ea5e9; font-weight:800; font-variant-numeric:tabular-nums; }' +
  '  .kkgrand { color:#f59e0b; font-weight:900; font-variant-numeric:tabular-nums; }' +
  '  table.kktab tr.kktotrow th, table.kktab tr.kktotrow td { border-top:1px solid var(--line,#e2e8f0); }' +
  '  .kkleg { color:var(--sub,#64748b); font-size:.72rem; text-align:right; margin:4px 2px 8px; }' +
  '  .kkest { margin:6px 2px 0; padding:12px 14px; border-radius:12px; background:rgba(245,158,11,.12); border:1px solid rgba(245,158,11,.35); color:var(--ink,#0f172a); font-size:.95rem; font-weight:700; line-height:1.6; text-align:center; }' +
  '  .kkest .kkestbig { color:#f59e0b; font-size:1.35rem; font-weight:900; margin:0 2px; }' +
  '  .kksex { font-size:.7rem; font-weight:800; padding:2px 9px; border-radius:999px; margin-left:6px; }' +
  '  .kknote { margin:14px 2px 0; color:rgba(255,255,255,.8); font-size:.72rem; text-align:center; line-height:1.6; }';

// ====== IGのDM（view=instadm・開発URL専用／2026-08-02 第一弾） ======
//   事務所PCが read_dms.py で3アカウントのDM一覧を読み（会話は開かない＝既読を付けない）、
//   insta_dm.json に書き出す→このアプリは窓口(action=data)で取ってきて並べるだけ（読むだけ）。
//   見た目はLINE未回答に寄せる。返信・削除は第一弾では付けない。
var INSTADM_CSS_ =
'  .ubar { display:flex; align-items:center; gap:12px; margin:0 0 4px; }' +
'  .uhome { flex:0 0 auto; font-size:.9rem; font-weight:700; color:var(--ink,#1c2430); text-decoration:none;' +
'    background:var(--card,#fff); border:1px solid var(--line,#e6e9ef); border-radius:10px; padding:10px 14px; }' +
'  .uhome:active { transform:translateY(1px); }' +
'  .idmwrap { max-width:720px; margin:0 auto; }' +
'  .idmwrap h1 { font-size:1.5rem; margin:6px 2px 12px; display:flex; align-items:baseline; gap:8px; flex-wrap:wrap; }' +
'  .idmgen { color:#cfe3ec; font-size:.92rem; font-weight:600; }' +
'  .idmacc { margin:20px 0 6px; font-size:1.32rem; font-weight:800; color:#fff;' +
'    display:flex; align-items:center; gap:8px; flex-wrap:wrap; }' +
'  .idmbadge { font-size:.9rem; font-weight:700; padding:3px 11px; border-radius:999px;' +
'    background:rgba(255,255,255,.16); color:#fff; }' +
'  .idmsec { font-size:1.1rem; font-weight:700; color:#eaf3f7; margin:14px 2px 4px; }' +
'  .idmnote { color:#cfe3ec; font-size:.98rem; background:rgba(255,255,255,.06);' +
'    border-radius:10px; padding:9px 12px; margin:4px 2px 6px; line-height:1.55; }' +
'  .idmcard { background:var(--card,#0f2f3d); border:1px solid rgba(255,255,255,.08);' +
'    border-radius:14px; padding:12px 14px; margin:8px 0; box-shadow:0 4px 12px rgba(0,0,0,.12); }' +
'  .idmcard.wait { border-left:5px solid #e1306c; }' +
'  .idmcard.tap { cursor:pointer; }' +
'  .idmcard.tap:active { transform:translateY(1px); }' +
'  @media (hover:hover){ .idmcard.tap:hover { border-color:rgba(225,48,108,.5); } }' +
'  .idmnm { font-weight:800; font-size:1.18rem; color:#fff; word-break:break-word; }' +
'  .idmpv { color:#dbe9f0; font-size:1.06rem; margin-top:4px; line-height:1.5; word-break:break-word;' +
'    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }' +
'  .idmmeta { display:flex; gap:8px; align-items:center; margin-top:7px; flex-wrap:wrap; }' +
'  .idmtag { font-size:.86rem; font-weight:700; padding:3px 10px; border-radius:999px; }' +
'  .idmtag.wait { background:#e1306c; color:#fff; }' +
'  .idmtag.done { background:rgba(255,255,255,.14); color:#cfe3ec; }' +
'  .idmtag.new  { background:#f59e0b; color:#3a2500; }' +
'  .idmtag.spam { background:#dc2626; color:#fff; }' +
'  .idmpvfull { -webkit-line-clamp:unset; display:block; overflow:visible; }' +
'  .idmdetbtn { margin-left:auto; background:rgba(255,255,255,.16); color:#fff; border:0; border-radius:999px;' +
'    padding:7px 15px; font-size:.92rem; font-weight:800; cursor:pointer; }' +
'  .idmdelbtn { background:#dc2626; color:#fff; border:0; border-radius:999px;' +
'    padding:7px 15px; font-size:.92rem; font-weight:800; cursor:pointer; }' +
'  .idmresbtn { background:#16a34a; color:#fff; border:0; border-radius:999px;' +
'    padding:7px 15px; font-size:.92rem; font-weight:800; cursor:pointer; }' +
'  .idmrepbtn { background:#2563eb; color:#fff; border:0; border-radius:999px;' +
'    padding:7px 15px; font-size:.92rem; font-weight:800; cursor:pointer; }' +
'  .idmreplybox { margin-top:10px; }' +
'  .idmrtxt { width:100%; box-sizing:border-box; min-height:64px; border-radius:12px; border:0;' +
'    padding:10px 12px; font-size:1rem; font-family:inherit; resize:vertical; }' +
'  .idmrrow { display:flex; align-items:center; gap:10px; margin-top:8px; }' +
'  .idmrsend { background:#2563eb; color:#fff; border:0; border-radius:999px;' +
'    padding:9px 20px; font-size:.95rem; font-weight:800; cursor:pointer; }' +
'  .idmrst { color:#cfe3ec; font-size:.9rem; }' +
'  .idmdelst { color:#cfe3ec; font-size:.94rem; margin-top:6px; }' +
'  .idmts { color:#9fb8c4; font-size:.92rem; }' +
'  .idmopen { margin-left:auto; color:#f0a5c0; font-size:.92rem; font-weight:700; }' +
'  .idmempty { color:#cfe3ec; text-align:center; padding:12px; font-size:1.02rem; }' +
// 全文の小窓（会話を吹き出しで・既読は付かない＝事務所PCが裏データで取った物を見るだけ）
'  .idmmask { position:fixed; inset:0; background:rgba(0,0,0,.55); display:none;' +
'    align-items:flex-end; justify-content:center; z-index:50; }' +
'  .idmmask.show { display:flex; }' +
'  .idmmodal { background:var(--bg,#123); width:100%; max-width:720px; max-height:88vh;' +
'    border-radius:18px 18px 0 0; display:flex; flex-direction:column; box-shadow:0 -6px 24px rgba(0,0,0,.4); }' +
'  .idmmh { display:flex; align-items:center; gap:10px; padding:14px 16px; border-bottom:1px solid rgba(255,255,255,.1); }' +
'  .idmmnm { font-weight:800; color:#fff; font-size:1.02rem; word-break:break-word; flex:1; }' +
'  .idmmx { background:none; border:0; color:#fff; font-size:1.7rem; line-height:1; padding:0 4px; cursor:pointer; }' +
'  .idmmlog { padding:14px 14px 20px; overflow-y:auto; display:flex; flex-direction:column; gap:8px; }' +
'  .idmmsg { max-width:82%; display:flex; flex-direction:column; }' +
'  .idmmsg.them { align-self:flex-start; align-items:flex-start; }' +
'  .idmmsg.me { align-self:flex-end; align-items:flex-end; }' +
'  .idmbub { padding:9px 12px; border-radius:14px; font-size:.96rem; line-height:1.5; white-space:pre-wrap; word-break:break-word; }' +
'  .idmmsg.them .idmbub { background:#e9eef2; color:#12222b; border-bottom-left-radius:4px; }' +
'  .idmmsg.me .idmbub { background:#e1306c; color:#fff; border-bottom-right-radius:4px; }' +
'  .idmmt { color:#9fb8c4; font-size:.72rem; margin:2px 4px; }' +
// 合言葉を入れる小画面
'  .idmgate { max-width:420px; margin:8vh auto 0; background:var(--card,#0f2f3d);' +
'    border:1px solid rgba(255,255,255,.1); border-radius:16px; padding:22px 20px;' +
'    box-shadow:0 8px 24px rgba(0,0,0,.2); text-align:center; }' +
'  .idmgt { font-size:1.15rem; font-weight:800; color:#fff; margin-bottom:8px; }' +
'  .idmgm { color:#cfe3ec; font-size:.86rem; line-height:1.55; margin-bottom:14px; }' +
'  .idmgerr { color:#ffd0d8; background:rgba(225,48,108,.18); border-radius:10px;' +
'    padding:8px 10px; font-size:.85rem; margin-bottom:12px; }' +
'  .idmginput { width:100%; box-sizing:border-box; padding:13px 14px; border-radius:12px;' +
'    border:0; font-size:1.05rem; margin-bottom:12px; }' +
'  .idmgbtn { width:100%; padding:13px; border:0; border-radius:12px; background:#e1306c;' +
'    color:#fff; font-size:1.05rem; font-weight:800; cursor:pointer; }' +
'  .idmchg { margin-left:auto; color:#f0a5c0; font-size:.78rem; font-weight:700;' +
'    text-decoration:underline; cursor:pointer; }';

// 小窓（会話の全文）を出す仕掛け。データは showInstaDm が window.__idmData に置いた物を読む。
var INSTADM_SCRIPT_ =
'(function(){' +
'  var data = window.__idmData || {accounts:[]};' +
'  var mask = document.getElementById("idmMask"); if(!mask) return;' +
'  function esc(s){ var d=document.createElement("div"); d.textContent=(s==null?"":String(s)); return d.innerHTML; }' +
'  function open(ai, th){' +
'    var a=data.accounts[ai]; if(!a) return; var t=(a.threads||[])[th]; if(!t) return;' +
'    document.getElementById("idmMnm").textContent = (a.label||"") + " ／ " + (t.title||"");' +
'    var log=document.getElementById("idmMlog"); log.innerHTML="";' +
'    var ms=t.msgs||[];' +
'    if(!ms.length){ log.innerHTML = "<div class=\\"idmempty\\">この会話の中身はまだ取れていません。</div>"; }' +
'    for(var i=0;i<ms.length;i++){ var m=ms[i];' +
'      var row=document.createElement("div"); row.className="idmmsg "+(m.me?"me":"them");' +
'      row.innerHTML = "<div class=\\"idmbub\\">"+esc(m.text)+"</div><div class=\\"idmmt\\">"+esc(m.ts)+"</div>";' +
'      log.appendChild(row);' +
'    }' +
'    mask.classList.add("show"); log.scrollTop=log.scrollHeight;' +
'  }' +
'  function close(){ mask.classList.remove("show"); }' +
'  [].slice.call(document.querySelectorAll(".idmcard.tap")).forEach(function(c){' +
'    c.addEventListener("click", function(){ open(+c.getAttribute("data-acc"), +c.getAttribute("data-th")); });' +
'  });' +
'  var x=document.getElementById("idmMx"); if(x) x.addEventListener("click", close);' +
'  mask.addEventListener("click", function(e){ if(e.target===mask) close(); });' +
'})();';

/** IGのDM（オーナー専用・開発URL専用）。3アカウントの会話を、お客さんが最後に送った物（返事待ち）を
 *  上に、既読を付けずに並べる。カードを押すと会話の全文が小窓で出る（事務所PCが裏データで取った物）。
 *  データ＝insta_dm.json（accounts[].threads[]＝全文つき／requests[]＝初めての人）。 */
// 時刻が「今から1ヶ月以内」か。会話は絶対日付(YYYY/MM/DD…)、初めての人は相対表記(◯分/◯時間/◯週間/◯ヶ月…)。
//   時刻不明は残す（安全側＝消しすぎない）。
function idmWithinMonth_(ts) {
  ts = (ts || '').trim();
  if (!ts) return true;
  var m = ts.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (m) {
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return (Date.now() - d.getTime()) <= 31 * 24 * 3600 * 1000;
  }
  if (/ヶ月|か月|个月|年/.test(ts)) return false;          // 「◯ヶ月」「◯年」＝1ヶ月超
  var w = ts.match(/(\d+)\s*(週間|週|周)/);
  if (w && +w[1] >= 5) return false;                        // 5週間以上＝1ヶ月超
  return true;                                              // 分/時間/日/週間(1〜4)＝1ヶ月以内
}

function renderInstaDmPage_(d, base, staff, dev) {
  d = d || {};
  var accounts = d.accounts || [];
  function tcard(ai, j, name, snippet, ts, cls, tagHtml, resKey, resSig, accKey, thId) {
    return '<div class="idmcard tap ' + cls + '" data-acc="' + ai + '" data-th="' + j +
      '" data-rkind="t" data-racc="' + esc_(accKey || '') + '" data-rid="' + esc_(thId || '') + '">' +
      '<div class="idmnm">' + esc_(name || '（名前不明）') + '</div>' +
      '<div class="idmpv">' + esc_(snippet || '（本文なし）') + '</div>' +
      '<div class="idmmeta">' + tagHtml + '<span class="idmts">' + esc_(ts || '') + '</span>' +
      '<button type="button" class="idmrepbtn" onclick="event.stopPropagation();idmReplyToggle(this)">↩ 返信</button>' +
      '<button type="button" class="idmresbtn" data-key="' + esc_(resKey || '') + '" data-sig="' + esc_(resSig || '') +
        '" onclick="event.stopPropagation();idmResolve(this)">✓ 解決済</button>' +
      '<span class="idmopen">タップで全文 ›</span></div>' +
      idmReplyBox_() +
    '</div>';
  }
  function rcard(accKey, name, preview, ts, tagHtml, occ, resKey, resSig) {
    // occ＝同じ名前の中で上から何番目か（0始まり）。名前がかぶっても、その1件を狙って開く・消すため。
    var oc = String(occ || 0);
    return '<div class="idmcard" data-rkind="r" data-racc="' + esc_(accKey || '') +
      '" data-rname="' + esc_(name || '') + '" data-rocc="' + oc + '">' +
      '<div class="idmnm">' + esc_(name || '（名前不明）') + '</div>' +
      '<div class="idmpv idmpvfull">' + esc_(preview || '（本文なし）') + '</div>' +
      '<div class="idmmeta">' + tagHtml + '<span class="idmts">' + esc_(ts || '') + '</span>' +
        '<button type="button" class="idmrepbtn" onclick="idmReplyToggle(this)">↩ 返信</button>' +
        '<button type="button" class="idmresbtn" data-key="' + esc_(resKey || '') + '" data-sig="' + esc_(resSig || '') +
          '" onclick="idmResolve(this)">✓ 解決済</button>' +
        '<button type="button" class="idmdetbtn" data-acc="' + esc_(accKey || '') +
          '" data-name="' + esc_(name || '') + '" data-prev="' + esc_(preview || '') +
          '" data-occ="' + oc + '" onclick="idmDoReqDetail(this)">詳細を見る</button>' +
        '<button type="button" class="idmdelbtn" data-acc="' + esc_(accKey || '') +
          '" data-name="' + esc_(name || '') + '" data-prev="' + esc_(preview || '') +
          '" data-occ="' + oc + '" onclick="idmDelReq(this)">🚫 削除</button>' +
      '</div>' +
      idmReplyBox_() +
      '<div class="idmdelst"></div>' +
    '</div>';
  }
  var body = '';
  if (!accounts.length) {
    body = '<div class="idmempty">まだ読み取っていません。<br>事務所PCの読み取りを待ってください。</div>';
  } else {
    for (var i = 0; i < accounts.length; i++) {
      var a = accounts[i], threads = a.threads || [], reqs = a.requests || [];
      var waiting = [], done = [];
      for (var k = 0; k < threads.length; k++) {
        var item = { t: threads[k], j: k };
        (threads[k].waiting ? waiting : done).push(item);
      }
      // ★IGのDMは「1ヶ月より前」を出さない（返事待ち・初めての人とも）。DM再現は全部残す（そちらは別画面）。
      //   さらに「解決済」にした相手も出さない（DM再現には出る）。事務所PCの印(resolved)に加え、
      //   この端末が覚えている解決済(locRes)でも隠す＝読み直しが追いつく前でも消えたままにする。
      var locRes = idmResGet_();
      waiting = waiting.filter(function (x) {
        var kk = 't:' + a.key + ':' + (x.t.id || '');
        return idmWithinMonth_(x.t.last_ts) && !x.t.resolved && locRes[kk] !== (x.t.last_ts || '');
      });
      var reqsShown = reqs.filter(function (r) {
        var kk = 'r:' + a.key + ':' + idmStripNum_(r.name);
        return idmWithinMonth_(r.ts) && !r.resolved && locRes[kk] !== ((r.preview || '') + '|' + (r.ts || ''));
      });
      // ★2026-08-03 まるちゃん決定：「返事待ち（既存客）」と「初めての人」は分けず、
      //   「当店が未返信」の1つにまとめる（どちらもお店がまだ返していない＝要返信で同じ）。
      body += '<div class="idmacc">📷 ' + esc_(a.label || '') +
        ' <span class="idmbadge">当店が未返信 ' + (waiting.length + reqsShown.length) + '</span></div>';
      body += '<div class="idmsec">✉️ 当店が未返信</div>';
      if (waiting.length + reqsShown.length) {
        // ①既存の会話でこちらが返していないもの
        for (var w = 0; w < waiting.length; w++) {
          var tw = waiting[w].t;
          var tKey = 't:' + a.key + ':' + (tw.id || '');
          body += tcard(i, waiting[w].j, tw.title, tw.last_text, tw.last_ts, 'wait',
                        '<span class="idmtag wait">返事待ち</span>', tKey, tw.last_ts || '', a.key, tw.id || '');
        }
        // ②初めての人（リクエスト）
        for (var r = 0; r < reqsShown.length; r++) {
          var un = reqsShown[r].unread ? '<span class="idmtag new">未読</span>' : '<span class="idmtag done">既読</span>';
          var sp = reqsShown[r].spam ? '<span class="idmtag spam">🚫 スパムかも</span>' : '';
          var occ = idmOccOf_(reqs, reqsShown[r]);   // 同じ名前の中で上から何番目か
          var rKey = 'r:' + a.key + ':' + idmStripNum_(reqsShown[r].name);
          var rSig = (reqsShown[r].preview || '') + '|' + (reqsShown[r].ts || '');
          body += rcard(a.key, reqsShown[r].name, reqsShown[r].preview, reqsShown[r].ts, sp + un, occ, rKey, rSig);
        }
      } else { body += '<div class="idmempty">1ヶ月以内に未返信はありません。</div>'; }
      // ★2026-08-02 まるちゃん決定：IGのDMには「やり取り済み（こちらが返事した会話）」は出さない
      //   （＝要対応だけにする）。全部見たい時は「DM再現」を使う。
    }
  }
  return '<style>' + INSTADM_CSS_ + '</style>' +
    backBar_(base, staff, dev) +
    '<div class="idmwrap">' +
      '<h1>📩 IGのDM<span class="idmgen">' + esc_(d.read_at || '—') + ' 時点</span>' +
        '<span class="idmchg" onclick="if(window.idmClear)window.idmClear()">合言葉を変える</span></h1>' +
      body +
    '</div>' +
    '<div class="idmmask" id="idmMask" role="dialog" aria-modal="true">' +
      '<div class="idmmodal">' +
        '<div class="idmmh"><div class="idmmnm" id="idmMnm"></div>' +
          '<button type="button" class="idmmx" id="idmMx" aria-label="閉じる">&times;</button></div>' +
        '<div class="idmmlog" id="idmMlog"></div>' +
      '</div>' +
    '</div>' +
    '<script>' + INSTADM_SCRIPT_ + '<\/script>';
}

// 名前をそろえる（飾り文字や全角を普通の文字に・前後の空白と大文字小文字を無視）。事務所PC側と同じそろえ方。
function idmNorm_(s) {
  try { return String(s || '').normalize('NFKC').trim().toLowerCase(); }
  catch (e) { return String(s || '').trim().toLowerCase(); }
}
// この初めての人が「同じ名前の中で上から何番目か」（0始まり）。名前がかぶった時に1件を狙うため。
function idmOccOf_(reqs, item) {
  var nm = idmNorm_(item.name), idx = reqs.indexOf(item), c = 0;
  for (var i = 0; i < reqs.length && i < idx; i++) { if (idmNorm_(reqs[i].name) === nm) c++; }
  return c;
}
// 名前をそろえて末尾の数字(未読件数)を外す（事務所PC側の識別名と同じ作り）。
function idmStripNum_(s) { return idmNorm_(s).replace(/\s*\d+\s*$/, '').trim(); }

// この端末が覚えている「解決済にした相手」（key→そのときの状態sig）。事務所PCの読み直しが
// 追いつくまでの間も、再表示で隠れたままにするため。新しいやり取りが来て sig が変われば自動で戻る。
function idmResGet_() { try { return JSON.parse(localStorage.getItem('idm_resolved') || '{}') || {}; } catch (e) { return {}; } }
function idmResAdd_(key, sig) { try { var m = idmResGet_(); m[key] = sig; localStorage.setItem('idm_resolved', JSON.stringify(m)); } catch (e) {} }

// 返信の入力欄（各カードの中に隠して置く。返信ボタンで開く）。
function idmReplyBox_() {
  return '<div class="idmreplybox" style="display:none" onclick="event.stopPropagation()">' +
    '<textarea class="idmrtxt" placeholder="返信を入力（送るとお客さんに届きます）"></textarea>' +
    '<div class="idmrrow"><button type="button" class="idmrsend" onclick="event.stopPropagation();idmSendReply(this)">送る</button>' +
    '<span class="idmrst"></span></div></div>';
}
// 「↩ 返信」＝そのカードの入力欄を開く／閉じる。
function idmReplyToggle(btn) {
  var card = btn;
  for (var k = 0; k < 4 && card && !(card.className && ('' + card.className).indexOf('idmcard') >= 0); k++) card = card.parentElement;
  if (!card) return;
  var box = card.querySelector('.idmreplybox');
  if (!box) return;
  var show = (box.style.display === 'none' || !box.style.display);
  box.style.display = show ? 'block' : 'none';
  if (show) { var ta = box.querySelector('.idmrtxt'); if (ta) ta.focus(); }
}
// 「送る」＝返事待ち会話はそのまま送信、初めての人は「承認してから返信」。最初は練習モードで守られる。
function idmSendReply(btn) {
  var card = btn;
  for (var k = 0; k < 5 && card && !(card.className && ('' + card.className).indexOf('idmcard') >= 0); k++) card = card.parentElement;
  if (!card) return;
  var box = card.querySelector('.idmreplybox');
  var ta = box ? box.querySelector('.idmrtxt') : null;
  var txt = ta ? ta.value.trim() : '';
  var st = box ? box.querySelector('.idmrst') : null;
  if (!txt) { if (st) st.textContent = '本文が空です。'; return; }
  var kind = card.getAttribute('data-rkind') || '';
  var acc = card.getAttribute('data-racc') || '';
  if (kind === 't') {
    var thId = card.getAttribute('data-rid') || '';
    if (!confirm('このお客さんに送りますか？\n\n' + txt)) return;
    if (st) st.textContent = '送信中…';
    if (window.igdmReply) window.igdmReply(acc, thId, txt, function (m) { if (st) st.textContent = m; });
  } else if (kind === 'r') {
    var name = card.getAttribute('data-rname') || '';
    var occ = parseInt(card.getAttribute('data-rocc') || '0', 10) || 0;
    if (!confirm('この初めての人「' + name + '」を承認して、返信を送りますか？\n\n' + txt)) return;
    if (st) st.textContent = '承認して送信中…';
    if (window.igdmApproveReply) window.igdmApproveReply(acc, name, occ, txt, function (m) { if (st) st.textContent = m; });
  }
}

// 「✓ 解決済」＝この相手を未返信一覧から隠す（削除はしない・全員で共有）。新しいメッセージが来たら戻る。
function idmResolve(btn) {
  if (!btn) return;
  var key = btn.getAttribute('data-key') || '';
  var sig = btn.getAttribute('data-sig') || '';
  if (!key) return;
  if (!confirm('この相手を「解決済み」にして一覧から隠しますか？\n（消しません。相手から新しいメッセージが来たらまた出ます）')) return;
  var card = btn;
  for (var k = 0; k < 4 && card && !(card.className && ('' + card.className).indexOf('idmcard') >= 0); k++) card = card.parentElement;
  if (window.igdmResolve) window.igdmResolve(key, sig, function (m) {
    // 隠せたら、この端末にも覚えさせて（再表示でも隠す）、その行を画面から消す。
    if (m && m.indexOf('解決済み') >= 0) {
      idmResAdd_(key, sig);
      if (card && card.parentNode) {
        card.style.transition = 'opacity .4s'; card.style.opacity = '0';
        setTimeout(function () { if (card.parentNode) card.parentNode.removeChild(card); }, 400);
      }
    }
  });
}

// IGのDMの初めての人カードの「🚫 削除」。中身（最初の一言）を見た上で、押した1件だけ・確認してから。戻せない。
function idmDelReq(btn) {
  if (!btn) return;
  var acc = btn.getAttribute('data-acc') || '';
  var name = btn.getAttribute('data-name') || '';
  var prev = btn.getAttribute('data-prev') || '';
  var occ = parseInt(btn.getAttribute('data-occ') || '0', 10) || 0;
  if (!confirm('この初めての人「' + name + '」を削除しますか？\n元に戻せません。')) return;
  var card = btn;
  for (var k = 0; k < 4 && card && !(card.className && card.className.indexOf('idmcard') >= 0); k++) card = card.parentElement;
  var st = card ? card.querySelector('.idmdelst') : null;
  if (st) st.textContent = '削除を依頼中…';
  if (window.igdmDelete) window.igdmDelete(acc, name, prev, occ, function (m) {
    if (st) st.textContent = m;
    // 消えたら、その行を画面からも取り除く（残って見える対策）。
    if (m && m.indexOf('削除しました') >= 0 && card && card.parentNode) {
      card.style.transition = 'opacity .4s';
      card.style.opacity = '0';
      setTimeout(function () { if (card.parentNode) card.parentNode.removeChild(card); }, 400);
    }
  });
}

// 会話の全文を小窓（idmMask）に出す。無ければ簡易にまとめて出す。
function idmShowMsgs(title, msgs) {
  var mask = document.getElementById('idmMask');
  var mnm = document.getElementById('idmMnm');
  var log = document.getElementById('idmMlog');
  msgs = msgs || [];
  if (!mask || !log) {
    alert((title || '') + '\n\n' + msgs.map(function (m) { return (m.me ? '自分: ' : '相手: ') + m.text; }).join('\n'));
    return;
  }
  if (mnm) mnm.textContent = title || '';
  log.innerHTML = '';
  if (!msgs.length) log.innerHTML = '<div class="idmempty">中身がありませんでした。</div>';
  msgs.forEach(function (m) {
    var row = document.createElement('div'); row.className = 'idmmsg ' + (m.me ? 'me' : 'them');
    row.innerHTML = '<div class="idmbub">' + esc_(m.text) + '</div><div class="idmmt">' + esc_(m.ts || '') + '</div>';
    log.appendChild(row);
  });
  mask.classList.add('show'); log.scrollTop = log.scrollHeight;
}

// 「詳細を見る」＝初めての人1件を開いて中身を全部読む（開くので既読が付く・まるちゃん了承）。
function idmDoReqDetail(btn) {
  if (!btn) return;
  var acc = btn.getAttribute('data-acc') || '', name = btn.getAttribute('data-name') || '', prev = btn.getAttribute('data-prev') || '';
  var occ = parseInt(btn.getAttribute('data-occ') || '0', 10) || 0;
  var card = btn;
  for (var k = 0; k < 5 && card && !(card.className && ('' + card.className).indexOf('idmcard') >= 0); k++) card = card.parentElement;
  var st = card ? card.querySelector('.idmdelst') : null;
  if (st) st.textContent = '中身を読んでいます…（開くので既読が付きます・少し待ってください）';
  if (window.idmReqDetail) window.idmReqDetail(acc, name, prev, occ,
    function (m) { if (st) st.textContent = m; },
    function (d) { idmShowMsgs(d.title, d.msgs); });
}

/** IGのDMの合言葉入力画面。合言葉を入れると showInstaDm(index.html)が秘密の置き場所を取りに行く。 */
function renderInstaDmGate_(msg, base, staff, dev) {
  return '<style>' + INSTADM_CSS_ + '</style>' +
    backBar_(base, staff, dev) +
    '<div class="idmwrap">' +
      '<h1>📩 IGのDM</h1>' +
      '<div class="idmgate">' +
        '<div class="idmgt">🔒 合言葉を入れてください</div>' +
        '<div class="idmgm">この画面にはお客さまとの会話が入っています。合言葉を知っている端末だけ開けます。' +
          '一度入れると、この端末は次から覚えています。</div>' +
        (msg ? '<div class="idmgerr">' + esc_(msg) + '</div>' : '') +
        '<input id="idmPw" type="password" class="idmginput" placeholder="合言葉" autocomplete="off" />' +
        '<button type="button" id="idmGo" class="idmgbtn">開く</button>' +
      '</div>' +
    '</div>' +
    '<script>(function(){' +
      'var i=document.getElementById("idmPw"), b=document.getElementById("idmGo");' +
      'function go(){ if(window.idmSubmit) window.idmSubmit(i?i.value:""); }' +
      'if(b) b.addEventListener("click", go);' +
      'if(i) i.addEventListener("keydown", function(e){ if(e.key==="Enter") go(); });' +
      'if(i) i.focus();' +
    '})();<\/script>';
}

// ====== DM再現（view=igdm・開発URL専用／2026-08-02）＝インスタのDM画面をそっくり再現 ======
//   左に会話の一覧、押すと右にそのやり取りの全文（パソコンは左右2画面・スマホは一覧→会話）。
//   データは IGのDM と同じ insta_dm.json（合言葉方式）を使う＝会話40件×全文が入っている。
//   一覧は20件ずつ「もっと読む」で増やす。読むだけ（返信・削除はしない）。
var IGDM_CSS_ =
'  .igdmchoose { display:flex; flex-direction:column; gap:10px; max-width:520px; margin:6px auto 14px; }' +
'  .igdmaccbtn { display:flex; flex-direction:column; gap:2px; text-align:left; padding:16px 18px;' +
'    border:0; border-radius:14px; background:#e1306c; color:#fff; font-size:1.1rem; font-weight:800; cursor:pointer; }' +
'  .igdmaccsub { font-size:.8rem; font-weight:600; opacity:.9; }' +
'  .igdmbar { display:flex; align-items:center; gap:10px; margin:6px 2px 8px; flex-wrap:wrap; }' +
'  .igdmback { background:var(--card,#0f2f3d); color:var(--ink,#eaf3f7); border:1px solid rgba(255,255,255,.15);' +
'    border-radius:999px; padding:7px 13px; font-size:.85rem; font-weight:700; cursor:pointer; }' +
'  .igdmwho { font-weight:800; color:#fff; font-size:1.02rem; }' +
'  .igdmrefresh { margin-left:auto; background:#166534; color:#fff; border:0; border-radius:999px;' +
'    padding:7px 13px; font-size:.85rem; font-weight:700; cursor:pointer; }' +
'  .igdmpane { display:flex; height:72vh; border:1px solid rgba(255,255,255,.12); border-radius:14px;' +
'    overflow:hidden; background:var(--bg,#123); }' +
'  .igdmlist { width:330px; flex:none; overflow-y:auto; border-right:1px solid rgba(255,255,255,.12); }' +
'  .igdmthread { flex:1; overflow-y:auto; display:flex; flex-direction:column; }' +
'  .igdmphold { color:#9fb8c4; text-align:center; margin:auto; padding:20px; font-size:.92rem; }' +
'  .igdmrow { padding:11px 13px; border-bottom:1px solid rgba(255,255,255,.06); cursor:pointer; }' +
'  .igdmrow:hover { background:rgba(255,255,255,.04); }' +
'  .igdmrow.sel { background:rgba(225,48,108,.16); }' +
'  .igdmrow.wait { border-left:4px solid #e1306c; }' +
'  .igdmrn { font-weight:800; color:#fff; font-size:.98rem; word-break:break-word; }' +
'  .igdmrp { color:#c7d7df; font-size:.86rem; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }' +
'  .igdmrt { color:#8fa8b4; font-size:.75rem; margin-top:3px; }' +
'  .igdmreq { display:inline-block; margin-top:4px; font-size:.72rem; font-weight:700;' +
'    padding:2px 8px; border-radius:999px; background:#f59e0b; color:#3a2500; }' +
'  .igdmsechead { padding:8px 13px; font-size:.78rem; font-weight:800; color:#cfe3ec;' +
'    background:rgba(255,255,255,.05); border-bottom:1px solid rgba(255,255,255,.08); }' +
'  .igdmmore { display:block; width:calc(100% - 20px); margin:10px; padding:11px; border:0; border-radius:10px;' +
'    background:rgba(255,255,255,.1); color:#eaf3f7; font-weight:700; font-size:.9rem; cursor:pointer; }' +
'  .igdmth-h { display:flex; align-items:center; gap:10px; padding:12px 14px; position:sticky; top:0;' +
'    background:var(--bg,#123); border-bottom:1px solid rgba(255,255,255,.1); z-index:2; }' +
'  .igdmth-nm { font-weight:800; color:#fff; word-break:break-word; }' +
'  .igdmth-back { display:none; background:none; border:0; color:#f0a5c0; font-size:1rem; font-weight:800; cursor:pointer; }' +
'  .igdmth-log { padding:14px; display:flex; flex-direction:column; gap:8px; }' +
'  .igdmreply { border-top:1px solid rgba(255,255,255,.12); padding:10px 12px; background:var(--bg,#123); }' +
'  .igdmrtxt { width:100%; box-sizing:border-box; min-height:56px; border-radius:10px; border:0;' +
'    padding:10px 12px; font-size:1rem; resize:vertical; }' +
'  .igdmrrow { display:flex; align-items:center; gap:10px; margin-top:8px; }' +
'  .igdmrsend { background:#e1306c; color:#fff; border:0; border-radius:10px; padding:10px 20px;' +
'    font-size:1rem; font-weight:800; cursor:pointer; }' +
'  .igdmdel { background:#dc2626; color:#fff; border:0; border-radius:10px; padding:11px 20px;' +
'    font-size:1rem; font-weight:800; cursor:pointer; }' +
'  .igdmrstatus { color:#cfe3ec; font-size:.86rem; }' +
'  @media (max-width:760px) {' +
'    .igdmlist { width:100%; }' +
'    .igdmthread { display:none; }' +
'    .igdmpane.showthread .igdmlist { display:none; }' +
'    .igdmpane.showthread .igdmthread { display:flex; }' +
'    .igdmth-back { display:inline; }' +
'  }';

var IGDM_STATE_ = { ai: 0, shown: 20, sel: -1 };
var IGDM_ACC_NAME_ = { jp: '🇯🇵 日本人IG', tw_men: '🇹🇼 台湾人男性IG', tw_women: '🇹🇼 台湾人女性IG' };
var IGDM_ACC_ORDER_ = ['jp', 'tw_men', 'tw_women'];

function igdmAccs_() { return (window.__idmData && window.__idmData.accounts) ? window.__idmData.accounts : []; }
function igdmAiByKey_(k) { var a = igdmAccs_(); for (var i = 0; i < a.length; i++) { if (a[i].key === k) return i; } return -1; }

/** DM再現のトップ＝3アカウントの選択ボタン。押すと igdmOpen で2画面を出す。 */
function renderIgdmHome_(d, base, staff, dev) {
  window.__idmData = d || window.__idmData || { accounts: [] };
  var accs = igdmAccs_(), btns = '';
  for (var i = 0; i < IGDM_ACC_ORDER_.length; i++) {
    var k = IGDM_ACC_ORDER_[i], ai = igdmAiByKey_(k);
    if (ai < 0) continue;
    var a = accs[ai];
    btns += '<button type="button" class="igdmaccbtn" onclick="igdmOpen(' + ai + ')">' +
      esc_(IGDM_ACC_NAME_[k] || a.label) +
      '<span class="igdmaccsub">@' + esc_(a.handle || '') + '　' + ((a.threads || []).length) + '会話' +
      ((a.requests || []).length ? '・初めての人' + a.requests.length : '') + '</span></button>';
  }
  if (!btns) btns = '<div class="idmempty">まだ読み取っていません。事務所PCの読み取りを待ってください。</div>';
  return '<style>' + INSTADM_CSS_ + IGDM_CSS_ + '</style>' +
    backBar_(base, staff, dev) +
    '<div class="idmwrap"><h1>📱 DM再現<span class="idmgen">インスタのDMをそのまま表示（読むだけ）</span>' +
      '<span class="idmchg" onclick="if(window.idmClear)window.idmClear()">合言葉を変える</span></h1>' +
      '<div class="igdmchoose">' + btns + '</div>' +
      '<div id="igdmStage"></div>' +
    '</div>';
}

// 一覧に出す並び＝上に「初めての人（リクエスト）」、その下に普通の会話（新しい順）。
//   初めての人は全文の裏入口が無いので、最初の一言だけを1つの吹き出しで持たせる。
function igdmBuildItems_(a) {
  var items = [], reqs = a.requests || [];
  for (var r = 0; r < reqs.length; r++) {
    var q = reqs[r];
    items.push({ req: true, title: q.name, unread: q.unread, waiting: true, spam: q.spam,
      last_text: q.preview, last_ts: q.ts || '',
      msgs: [{ me: false, text: q.preview || '（本文なし）', ts: q.ts || '' }] });
  }
  var ths = a.threads || [];
  for (var t = 0; t < ths.length; t++) items.push(ths[t]);
  return items;
}

function igdmOpen(ai) {
  IGDM_STATE_ = { ai: ai, shown: 20, sel: -1, items: [] };
  var st = document.getElementById('igdmStage'); if (!st) return;
  var a = igdmAccs_()[ai]; if (!a) { st.innerHTML = ''; return; }
  IGDM_STATE_.items = igdmBuildItems_(a);
  st.innerHTML =
    '<div class="igdmbar">' +
      '<button type="button" class="igdmback" onclick="igdmBackAccts()">‹ アカウント選び直し</button>' +
      '<span class="igdmwho">' + esc_(IGDM_ACC_NAME_[a.key] || a.label) + '</span>' +
      '<button type="button" class="igdmrefresh" onclick="if(window.igdmRefresh)window.igdmRefresh()">↻ 今すぐ最新にする</button>' +
    '</div>' +
    '<div class="igdmpane" id="igdmPane">' +
      '<div class="igdmlist" id="igdmList"></div>' +
      '<div class="igdmthread" id="igdmThread"><div class="igdmphold">左の会話を選ぶと、ここにやり取りが全部出ます。</div></div>' +
    '</div>';
  igdmRenderList_();
}

function igdmRenderList_() {
  var items = IGDM_STATE_.items || [], list = document.getElementById('igdmList'); if (!list) return;
  var n = Math.min(IGDM_STATE_.shown, items.length), html = '', reqHeaderDone = false, thHeaderDone = false;
  for (var i = 0; i < n; i++) {
    var t = items[i];
    if (t.req && !reqHeaderDone) { html += '<div class="igdmsechead">✉️ 初めての人（リクエスト）</div>'; reqHeaderDone = true; }
    if (!t.req && !thHeaderDone) { html += '<div class="igdmsechead">💬 これまでの会話</div>'; thHeaderDone = true; }
    html += '<div class="igdmrow' + ((t.waiting || t.req) ? ' wait' : '') + (IGDM_STATE_.sel === i ? ' sel' : '') +
      '" onclick="igdmSelect(' + i + ')">' +
      '<div class="igdmrn">' + esc_(t.title || '（名前なし）') + '</div>' +
      '<div class="igdmrp">' + esc_((t.last_text || '').slice(0, 46)) + '</div>' +
      '<div class="igdmrt">' + esc_(t.last_ts || '') + (!t.req && t.waiting ? '　・返事待ち' : '') + '</div>' +
      (t.req ? '<span class="igdmreq">初めての人' + (t.unread ? '・未読' : '') + '</span>' : '') +
      (t.req && t.spam ? '<span class="igdmreq" style="background:#dc2626;color:#fff;">🚫 スパムかも</span>' : '') +
    '</div>';
  }
  if (items.length > n) {
    html += '<button type="button" class="igdmmore" onclick="igdmMore()">もっと読む（あと' + (items.length - n) + '件）</button>';
  }
  list.innerHTML = html;
}

function igdmMore() { IGDM_STATE_.shown += 20; igdmRenderList_(); }

function igdmSelect(i) {
  IGDM_STATE_.sel = i; igdmRenderList_();
  var t = (IGDM_STATE_.items || [])[i]; if (!t) return;
  var pane = document.getElementById('igdmThread'); if (!pane) return;
  var ms = t.msgs || [], body =
    '<div class="igdmth-h"><button type="button" class="igdmth-back" onclick="igdmBackList()">‹ 一覧</button>' +
    '<span class="igdmth-nm">' + esc_(t.title || '') + (t.req ? '（初めての人）' : '') + '</span></div><div class="igdmth-log">';
  if (t.req) body += '<div class="idmempty">初めての人からのメッセージです。ここには最初の一言だけ出ます（全文は本物のインスタで確認してください）。</div>';
  if (!ms.length) body += '<div class="idmempty">中身がありません。</div>';
  for (var k = 0; k < ms.length; k++) {
    var m = ms[k];
    body += '<div class="idmmsg ' + (m.me ? 'me' : 'them') + '"><div class="idmbub">' + esc_(m.text) +
      '</div><div class="idmmt">' + esc_(m.ts) + '</div></div>';
  }
  body += '</div>';
  if (!t.req && t.id) {
    // ★返信欄（本物の会話だけ／初めての人は会話IDが無いので出さない）。送るとお客さんに届く。
    body += '<div class="igdmreply">' +
      '<textarea id="igdmReplyTxt" class="igdmrtxt" placeholder="返信を入力（送るとお客さんに届きます）"></textarea>' +
      '<div class="igdmrrow"><button type="button" class="igdmrsend" onclick="igdmDoReply()">送る</button>' +
      '<span class="igdmrstatus" id="igdmRStatus"></span></div>' +
    '</div>';
  }
  if (t.req) {
    // ★初めての人（スパムが来る所）＝中身を見た上で「削除」できる。押した1件だけ・確認あり・戻せない。
    body += '<div class="igdmreply">' +
      '<button type="button" class="igdmdel" onclick="igdmDoDelete()">🚫 この初めての人を削除</button>' +
      '<div class="igdmrstatus" id="igdmRStatus" style="margin-top:8px;"></div>' +
    '</div>';
  }
  pane.innerHTML = body;
  var pn = document.getElementById('igdmPane'); if (pn) pn.classList.add('showthread');
  var lg = pane.querySelector('.igdmth-log'); if (lg) lg.scrollTop = lg.scrollHeight;
}

// 返信を送る（本物の会話だけ）。確認してから、事務所PCへ送信を依頼し、結果を下に出す。
function igdmDoReply() {
  var t = (IGDM_STATE_.items || [])[IGDM_STATE_.sel]; if (!t || t.req || !t.id) return;
  var ta = document.getElementById('igdmReplyTxt'); var txt = ta ? ta.value.trim() : '';
  if (!txt) return;
  if (!confirm('このお客さんに送りますか？\n\n' + txt)) return;
  var acc = (igdmAccs_()[IGDM_STATE_.ai] || {}).key || '';
  var st = document.getElementById('igdmRStatus'); if (st) st.textContent = '送信中…';
  if (window.igdmReply) window.igdmReply(acc, t.id, txt, function (m) { if (st) st.textContent = m; });
}

// 初めての人（スパム）を削除する。中身を見た上で、押した1件だけ・確認してから。戻せない。
function igdmDoDelete() {
  var t = (IGDM_STATE_.items || [])[IGDM_STATE_.sel]; if (!t || !t.req) return;
  if (!confirm('この初めての人「' + (t.title || '') + '」を削除しますか？\n消すと元に戻せません。')) return;
  var acc = (igdmAccs_()[IGDM_STATE_.ai] || {}).key || '';
  var st = document.getElementById('igdmRStatus'); if (st) st.textContent = '削除を依頼中…';
  if (window.igdmDelete) window.igdmDelete(acc, t.title, t.last_text, function (m) { if (st) st.textContent = m; });
}

function igdmBackList() { var pn = document.getElementById('igdmPane'); if (pn) pn.classList.remove('showthread'); }
function igdmBackAccts() { var st = document.getElementById('igdmStage'); if (st) st.innerHTML = ''; }

var KOUKOKU_FILENAME = 'koukoku.json';

// ①GAS直アクセス専用：koukoku.json を読んで renderKoukokuPage_ に渡す薄いラッパ（DriveApp使用）。
function getKoukokuFile_() {
  var it = DriveApp.getFilesByName(KOUKOKU_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) throw new Error('koukoku.json が見つかりません');
  return newest;
}
function renderKoukoku_(base, staff, dev) {
  try {
    var d = JSON.parse(getKoukokuFile_().getBlob().getDataAsString('UTF-8'));
    return renderKoukokuPage_(d, base, staff, dev);
  } catch (err) {
    return renderKoukokuPage_({ ads: [] }, base, staff, dev);
  }
}

var KOUKOKU_MONTH_DAYS_ = 31;   // 1ヶ月＝31日で試算（オーナー指定）
// 4マスの1マス（金額が多いほど赤が濃い）。1日/1ヶ月の両方を持たせ、切替はdata-差し替え。
function _kkShade_(v, mx) { var r = mx ? v / mx : 0; return 'background:rgba(224,83,61,' + (0.16 + r * 0.62).toFixed(2) + ')'; }
function _kkCell_(v, mx, id) {
  return '<span class="kkcell kkval" id="' + id + '" style="' + _kkShade_(v, mx) + '"' +
    ' data-day="' + esc_(_costYen_(v)) + '" data-month="' + esc_(_costYen_(v * KOUKOKU_MONTH_DAYS_)) + '">' +
    esc_(_costYen_(v)) + '</span>';
}
function _kkTot_(v, id, cls) {
  return '<td class="' + cls + ' kkval" id="' + id + '"' +
    ' data-day="' + esc_(_costYen_(v)) + '" data-month="' + esc_(_costYen_(v * KOUKOKU_MONTH_DAYS_)) + '">' +
    esc_(_costYen_(v)) + '</td>';
}

/** 広告費管理（オーナー専用・開発URL専用）。国籍×性別の4マス（今出している広告の1日予算合計）＋
 *  アカウントごとの広告明細を出す。データは自動読み取りの koukoku.json（d.accounts）。 */
function renderKoukokuPage_(d, base, staff, dev) {
  d = d || {};
  function fig(n) {
    n = Number(n) || 0;
    if (n >= 10000) { var s = Math.round(n / 1000) / 10; return (s % 1 === 0 ? String(s) : s.toFixed(1)) + '万'; }
    var t = String(n), o = '', c = 0;
    for (var i = t.length - 1; i >= 0; i--) { o = t.charAt(i) + o; if (++c % 3 === 0 && i > 0) o = ',' + o; }
    return o;
  }
  var SEXCOL = { m: '#38bdf8', f: '#ec4899' }, SEXLBL = { m: '男性', f: '女性' };

  // 全広告を1つに集める（アカウント＝国籍、各広告の男女＝見た人の男女比から判定済み）。
  var allads = [];
  var accounts = d.accounts || [];
  if (accounts.length) {
    accounts.forEach(function (acc) {
      (acc.ads || []).forEach(function (a) { a._label = acc.label; a._handle = acc.handle; allads.push(a); });
    });
  } else { allads = d.ads || []; }

  // 4マス：今出している(配信中)広告の「1日の予算」を国籍×性別ごとに合算。
  var S = { jm: 0, jf: 0, tm: 0, tf: 0 }, unknown = 0;
  allads.forEach(function (a) {
    if (a.status !== '配信中') return;                 // 停止中・未配信は「今の1日支出」に入れない
    var day = Number(a.day_budget) || 0;
    if (!a.sex) { unknown += day; return; }            // 男女が読めなかった分は別に注記
    S[(a.nat === 'jp' ? 'j' : 't') + (a.sex === 'f' ? 'f' : 'm')] += day;
  });
  var mx = Math.max(S.jm, S.jf, S.tm, S.tf);
  var grand = S.jm + S.jf + S.tm + S.tf;
  var table =
    '<div class="kkcard"><table class="kktab">' +
    '<thead><tr><th></th><th>男性</th><th>女性</th><th>国籍ごと</th></tr></thead><tbody>' +
    '<tr><th>🇯🇵 日本人</th><td>' + _kkCell_(S.jm, mx, 'kc-jm') + '</td><td>' + _kkCell_(S.jf, mx, 'kc-jf') + '</td>' +
      _kkTot_(S.jm + S.jf, 'kt-jp', 'kktot') + '</tr>' +
    '<tr><th>🇹🇼 台湾人</th><td>' + _kkCell_(S.tm, mx, 'kc-tm') + '</td><td>' + _kkCell_(S.tf, mx, 'kc-tf') + '</td>' +
      _kkTot_(S.tm + S.tf, 'kt-tw', 'kktot') + '</tr>' +
    '<tr class="kktotrow"><th>性別ごと</th>' + _kkTot_(S.jm + S.tm, 'kt-m', 'kktot') +
      _kkTot_(S.jf + S.tf, 'kt-f', 'kktot') + _kkTot_(grand, 'kt-all', 'kkgrand') + '</tr>' +
    '</tbody></table>' +
    '<div class="kkleg">■ 色が濃い＝1日に使っている金額が多い</div>' +
    '<div class="kkest">🧮 このペース（1日 合計 <b>' + esc_(_costYen_(grand)) + '</b>）で' + KOUKOKU_MONTH_DAYS_ + '日つづけると＝' +
      '<b class="kkestbig">' + esc_(_costYen_(grand * KOUKOKU_MONTH_DAYS_)) + '</b>（1ヶ月の目安）</div>' +
    (unknown ? '<div class="kkleg" style="text-align:center;color:#d97706;">※ 男女を読めなかった配信中の広告 1日 ' + esc_(_costYen_(unknown)) + ' 分は4マスに入れていません</div>' : '') +
    '</div>';

  // 広告1件のカード（男女の印つき）。
  function adCard(a) {
    var live = (a.status === '配信中');
    var st = '<span class="kkst ' + (live ? 'kklive2' : 'kkstop') + '">' + esc_(a.status || '') + '</span>';
    var sex = a.sex ? '<span class="kksex" style="background:' + SEXCOL[a.sex] + '22;color:' + SEXCOL[a.sex] + '">' + SEXLBL[a.sex] + '向け</span>' : '';
    var day = a.day_budget ? '　1日 ' + esc_(_costYen_(a.day_budget)) : '';
    var img = a.image_data ? '<img class="kkth" src="' + a.image_data + '" alt="">' : '<div class="kkth ph">画像</div>';
    return '<div class="kkad">' + img +
      '<div class="kkinfo">' +
        '<div class="kkr1">' + st + sex +
          '<span class="kkspend">' + esc_(_costYen_(a.spend_ntd)) + ' <small>使った実額' + day + '</small></span></div>' +
        '<div class="kkkv">見られた <b>' + fig(a.views) + '</b>　プロフィール来訪 <b>' + fig(a.profile_visits) + '</b></div>' +
      '</div></div>';
  }

  var totalAds = 0, list;
  if (accounts.length) {
    list = accounts.map(function (acc) {
      var aads = acc.ads || [];
      totalAds += aads.length;
      var head = '<div class="kkacc">' + esc_(acc.label || '') + '<small>@' + esc_(acc.handle || '') + '・' + aads.length + '件</small></div>';
      return head + (aads.length ? aads.map(adCard).join('') : '<div class="kkempty2">読み取れませんでした（ログイン切れ等の疑い）。</div>');
    }).join('');
  } else {
    totalAds = allads.length;
    list = allads.length ? allads.map(adCard).join('') : '<div class="kkempty">まだ読み取っていません。<br>毎日1回、自動でインスタから読み取ります。</div>';
  }
  var when = d.read_at ? '最終読み取り：' + esc_(d.read_at) + '　／　広告 ' + totalAds + '件' : '広告 ' + totalAds + '件';

  var script = '<script>(function(){var mode="day";function apply(){var xs=document.querySelectorAll(".kkval");' +
    'for(var i=0;i<xs.length;i++){var t=xs[i].getAttribute("data-"+mode);if(t!=null)xs[i].innerHTML=t;}' +
    'var bd=document.getElementById("kk-day"),bm=document.getElementById("kk-month");' +
    'if(bd)bd.className=(mode==="day"?"on":"");if(bm)bm.className=(mode==="month"?"on":"");}' +
    'var bd=document.getElementById("kk-day"),bm=document.getElementById("kk-month");' +
    'if(bd)bd.addEventListener("click",function(){mode="day";apply();});' +
    'if(bm)bm.addEventListener("click",function(){mode="month";apply();});})();</script>';

  return '<style>' + HOMECSS_ + KOUKOKUCSS_ + '</style>' +
    '<div class="home">' +
      backBar_(base, staff, dev) +
      '<div class="hhead"><span class="bmark">📣</span><span class="bname">広告費管理</span></div>' +
      '<div class="hsub" style="color:#fff;text-align:center;font-weight:700;margin:0 0 8px;letter-spacing:.06em;">インスタグラム広告</div>' +
      '<div class="kk">' +
        '<div style="text-align:center;"><span class="kkbadge">✓ 毎日1回 自動で読み取り</span></div>' +
        '<div class="kkwhen">' + when + '</div>' +
        '<div class="kkseg"><button id="kk-day" class="on" type="button">1日あたり</button>' +
          '<button id="kk-month" type="button">1か月あたり</button></div>' +
        table +
        '<div class="kkacc" style="border-left-color:#7c3aed;">広告ごとの明細</div>' +
        list +
        '<div class="kknote">4マスは「今 配信中の広告の1日予算」を国籍×性別で合算。男女は各広告を見た人の割合から自動判定。金額は台湾ドル（元）。</div>' +
      '</div>' +
    '</div>' + script;
}

// ★顧客履歴検索：番号 or 氏名（一部一致OK）で客を探し、今回の予約と過去予約(メモ込み)を見る。
//   検索は事務所PCが実行（op=cust_search）＝依頼を命令置き場に積み、結果は custsearch_<端末>.json
//   としてDriveに置かれる（events.json と同じ「Driveのjsonをアプリが読む」方式）。書き込みは無い。
//   ★事務所PCが動いている時間だけ結果が返る（止まっていれば「時間切れ」を出す）。
var RIREKI_CSS_ =
  '.rk{max-width:760px;margin:0 auto;padding:6px 12px 60px;}' +
  /* 戻るボタン＝施術室被り(.homelink)と同じ箱＋枠に統一（2026-07-19ユーザー指摘） */
  '.ubar{display:flex;align-items:center;gap:12px;margin:0 0 4px;}' +
  '.uhome{flex:0 0 auto;font-size:.9rem;font-weight:700;color:var(--ink);text-decoration:none;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 14px;}' +
  '.uhome:active{transform:translateY(1px);}' +
  '.rksearch{display:flex;gap:8px;background:var(--bg,#2C7A99);padding:8px 0 12px;}' +
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
  '.rkpick{display:block;width:100%;text-align:left;background:#fff;color:#0f172a;border:0;border-radius:12px;padding:13px 15px;margin-bottom:10px;font-size:1rem;font-weight:700;box-shadow:0 3px 10px rgba(0,0,0,.12);}' +
  '.rkstep{color:#fff;font-weight:800;font-size:1.25rem;margin:0 2px 10px;}' +
  '.rkstep2{margin-top:28px;}' +
  '.rkkp{max-width:340px;margin:2px auto 18px;}' +
  '.rkpfx{display:flex;gap:8px;margin:2px 0 14px;}' +
  '.rkpfx button{flex:1;font-size:.9rem;font-weight:800;padding:11px 6px;border-radius:999px;border:0;background:rgba(255,255,255,.90);color:#0f172a;cursor:pointer;white-space:nowrap;transition:transform .06s,background .15s,color .15s,box-shadow .15s;}' +
  '.rkpfx button:active{transform:translateY(1px);}' +
  '.rkpfx button.on{background:#2563eb;color:#fff;box-shadow:0 5px 14px rgba(0,0,0,.28);}' +
  '.rkgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}' +
  '.rkgrid button{font-size:1.25rem;font-weight:800;padding:11px 0;border-radius:14px;border:0;background:#fff;color:#0f172a;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.16);transition:transform .06s,box-shadow .12s,background .12s;}' +
  '.rkgrid button:active{transform:translateY(2px) scale(.97);box-shadow:0 1px 4px rgba(0,0,0,.18);}' +
  '.rkgrid button.del,.rkgrid button.clr{background:#ffe6e4;color:#d1443c;}' +
  '.rkgrid button.del{font-size:1.05rem;}' +
  '.rkecho{margin:14px 0 2px;padding:14px;border-radius:14px;background:#0f2b38;color:#ffd400;font-size:2.1rem;font-weight:900;letter-spacing:.06em;text-align:center;min-height:1.4em;box-shadow:0 4px 14px rgba(0,0,0,.28);}' +
  '.rkecho.empty{background:rgba(255,255,255,.10);color:rgba(255,255,255,.5);font-weight:600;font-size:1.15rem;box-shadow:none;}' +
  '.rkgo2{display:block;width:100%;margin:12px 0 2px;font-size:1.15rem;font-weight:800;padding:15px;border:0;border-radius:14px;background:#2563eb;color:#fff;cursor:pointer;box-shadow:0 5px 14px rgba(0,0,0,.22);}' +
  '.rkgo2:active{transform:translateY(1px);}' +
  /* 結果表示：黒バック・白文字・文字1.5倍（2026-07-19ユーザー指示） */
  '.rkcust{background:#0d1117;color:#fff;box-shadow:0 5px 16px rgba(0,0,0,.45);}' +
  '.rkwho{font-size:1.72rem;}' +
  '.rkcode{color:#7cc0ff;}' +
  '.rkph{color:#cbd5e1;font-size:1.3rem;}' +
  '.rkmeta{color:#cbd5e1;font-size:1.26rem;}' +
  '.rksec>.rklbl{font-size:1.44rem;}' +
  '.rksec.past>.rklbl{border-left-color:#cbd5e1;}' +
  '.rkrec{border-top-color:rgba(255,255,255,.18);}' +
  '.rkdd{font-size:1.5rem;}' +
  '.rktt{color:#cbd5e1;font-size:1.23rem;}' +
  '.rkbadge{font-size:1.17rem;}' +
  '.rkroom{color:#fff;border:0;font-weight:700;padding:2px 10px;font-size:1.17rem;}' +
  '.rkmemo2{margin-top:8px;}' +
  '.rkmemo2 summary{cursor:pointer;color:#7cc0ff;font-weight:800;font-size:1.2rem;list-style:none;margin-bottom:4px;}' +
  '.rkmemo2 summary::-webkit-details-marker{display:none;}' +
  '.rkmemo2 summary::before{content:"\\25BC ";font-size:.85em;}' +
  '.rkmemo2:not([open]) summary::before{content:"\\25B6 ";}' +
  '.rkkind{color:#cbd5e1;font-size:1.11rem;}' +
  '.rkcname{font-size:1.35rem;}' +
  '.rktreat{font-size:1.4rem;}' +
  '.rktreat.empty{color:#cbd5e1;}' +
  '.rkfull{background:rgba(255,255,255,.08);color:#fff;font-size:1.26rem;}' +
  '.rknone{color:#cbd5e1;font-size:1.26rem;}' +
  '.rkpick{background:#0d1117;color:#fff;font-size:1.5rem;}';

function renderRirekiPage_(base, staff, dev) {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var script =
  '<script>(function(){' +
  'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
  'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
  'var slot=(idn.device||"d0").toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,32)||"default";' +
  'var STAFFCOLOR={"\\uD83E\\uDED2":"#4b8b3b","\\uD83C\\uDF4A":"#e08a1e","\\uD83C\\uDF45":"#d1443c","\\uD83E\\uDD6D":"#c9a227"};' +
  'var RCOLOR=' + JSON.stringify(ROOM_COLORS_) + ';' +
  'var qEl=document.getElementById("rkq"),goEl=document.getElementById("rkgo"),stEl=document.getElementById("rkstatus"),resEl=document.getElementById("rkres");' +
  'function esc(s){return (s==null?"":String(s)).replace(/[&<>\\"\\x27]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\\x27":"&#39;"}[c];});}' +
  'function jsonp(params,onR){var cb="__rk"+Date.now()+Math.floor(Math.random()*1000);window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
  'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
  'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
  'function trimNote(n){if(!n)return "";var i=n.indexOf("現在進行中");if(i<0)return n;var ls=n.lastIndexOf("\\n",i);return n.slice(ls>=0?ls+1:0);}' +
  'function recHtml(r){var color=STAFFCOLOR[r.se]||"#999";' +
  'var badge=r.se?("<span class=\\"rkbadge\\" style=\\"background:"+color+"\\">"+esc(r.se)+esc(r.sn)+"</span>"):"<span class=\\"rkbadge\\" style=\\"background:#999\\">担当不明</span>";' +
  'var tspan=r.s?(esc(r.s)+(r.e?"–"+esc(r.e):"")):"";' +
  'var room=r.rm?("<span class=\\"rkroom\\" style=\\"background:"+(RCOLOR[r.rm]||"#64748b")+"\\">"+esc(r.rm)+"</span>"):"";' +
  'var nt=trimNote(r.no);' +
  'var memo=nt?("<details class=\\"rkmemo2\\" open><summary>予約メモ</summary><pre class=\\"rkfull\\">"+esc(nt)+"</pre></details>"):"<div class=\\"rktreat empty\\">（予約メモなし）</div>";' +
  'return "<div class=\\"rkrec\\"><div><span class=\\"rkdd\\">"+esc(r.d)+"（"+esc(r.w)+"）</span><span class=\\"rktt\\">"+tspan+"</span></div>"+' +
  'badge+room+memo+"</div>";}' +
  'function custHtml(c){var up=[],pa=[],i;for(i=0;i<(c.recs||[]).length;i++){(c.recs[i].up?up:pa).push(c.recs[i]);}' +
  'var ph=c.ph?("<span class=\\"rkph\\">"+esc(c.ph)+"</span>"):"";' +
  'var head="<div class=\\"rkwho\\"><span class=\\"rkcode\\">"+esc(c.code)+"</span>"+esc(c.name||"（名前メモなし）")+ph+"</div>"+' +
  '"<div class=\\"rkmeta\\">来店 "+c.v+" 回 ／ 初回 "+esc(c.f)+" ／ 最終 "+esc(c.l)+"</div>";' +
  'var upB=up.length?up.map(recHtml).join(""):"<div class=\\"rknone\\">今日以降の予約はありません。</div>";' +
  'var paB=pa.length?pa.map(recHtml).join(""):"<div class=\\"rknone\\">過去の予約はありません。</div>";' +
  'return "<div class=\\"rkcust\\">"+head+"<div class=\\"rksec\\"><div class=\\"rklbl\\">🔔 今回の予約（今日以降）</div>"+upB+"</div>"+' +
  '"<div class=\\"rksec past\\"><div class=\\"rklbl\\">🕘 前回までの予約一覧</div>"+paB+"</div></div>";}' +
  'function pickHtml(c){return "<button type=\\"button\\" class=\\"rkpick\\" data-code=\\""+esc(c.code)+"\\"><span class=\\"rkcode\\">"+esc(c.code)+"</span>"+esc(c.name||"（名前メモなし）")+" ・ 来店"+c.v+"回</button>";}' +
  'function toTop(){setTimeout(function(){try{stEl.scrollIntoView({behavior:"smooth",block:"start"});}catch(e){stEl.scrollIntoView();}},80);}' +
  'function render(res){if(!res||!res.ok){stEl.textContent="エラー："+((res&&res.error)||"不明");return;}' +
  'var cs=res.customers||[];if(!cs.length){stEl.textContent="一致する客が見つかりませんでした。";resEl.innerHTML="";toTop();return;}' +
  'if(res.multi){stEl.textContent=cs.length+" 人ヒット（タップで詳しく）";resEl.innerHTML=cs.map(pickHtml).join("");' +
  'var bs=resEl.querySelectorAll(".rkpick");for(var i=0;i<bs.length;i++){bs[i].addEventListener("click",function(){doSearch(this.getAttribute("data-code"));});}toTop();return;}' +
  'stEl.textContent=cs.length+" 人ヒット";resEl.innerHTML=cs.map(custHtml).join("");toTop();}' +
  'var polls=0;function poll(id){polls++;if(polls>30){stEl.textContent="時間切れです。事務所PCが動いているかご確認のうえ、もう一度お試しください。";return;}' +
  'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){stEl.textContent="エラー："+((r&&r.error)||"不明");return;}' +
  'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){poll(id);},1200);return;}' +
  'if(r.status!=="done"){stEl.textContent="検索に失敗しました："+esc(r.result||r.status);return;}' +
  'jsonp({action:"data",name:"custsearch_"+slot+".json"},function(d){render(d);});});}' +
  'function doSearch(q){q=(q||qEl.value||"").trim();if(!q){stEl.textContent="番号か氏名を入れてください。";return;}' +
  'stEl.textContent="事務所PCで検索中…（数秒）";resEl.innerHTML="";polls=0;' +
  'jsonp({action:"submit",key:KEY,op:"cust_search",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({q:q,slot:slot})},' +
  'function(r){if(!r||!r.ok||!r.id){stEl.textContent="依頼を送れませんでした："+((r&&r.error)||"不明");return;}setTimeout(function(){poll(r.id);},1000);});}' +
  'goEl.addEventListener("click",function(){doSearch();});' +
  'qEl.addEventListener("keydown",function(ev){if(ev.key==="Enter")doSearch();});' +
  'var kpPrefix="M",kpDigits="",kpTimer=null;var rkechoEl=document.getElementById("rkecho");' +
  'function kpValue(){return kpPrefix+kpDigits;}' +
  'function kpEcho(){if(!rkechoEl)return;var v=kpValue();rkechoEl.textContent=v||"—";if(v){rkechoEl.classList.remove("empty");}else{rkechoEl.classList.add("empty");}}' +
  'function kpRenderPrefix(){var bs=document.querySelectorAll(".rkpfx button");for(var i=0;i<bs.length;i++){if((bs[i].getAttribute("data-pfx")||"")===kpPrefix){bs[i].classList.add("on");}else{bs[i].classList.remove("on");}}}' +
  'function kpRefresh(){kpRenderPrefix();kpEcho();}' +
  'var pfxBtns=document.querySelectorAll(".rkpfx button");for(var pi=0;pi<pfxBtns.length;pi++){pfxBtns[pi].addEventListener("click",function(){kpPrefix=this.getAttribute("data-pfx")||"";kpRefresh();});}' +
  'var gridBtns=document.querySelectorAll(".rkgrid button");for(var gi=0;gi<gridBtns.length;gi++){gridBtns[gi].addEventListener("click",function(){var d=this.getAttribute("data-d"),act=this.getAttribute("data-act");if(d!=null){kpDigits+=d;}else if(act==="del"){kpDigits=kpDigits.slice(0,-1);}else if(act==="clr"){kpDigits="";}kpRefresh();});}' +
  'kpRenderPrefix();kpEcho();' +
  'var go2El=document.getElementById("rkgo2");if(go2El){go2El.addEventListener("click",function(){doSearch(kpValue());});}' +
  '})();</script>';
  return '<style>' + HOMECSS_ + RIREKI_CSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">🔎</span><span class="bname">顧客履歴検索</span></div>' +
    '<div class="rk">' +
      '<div class="rkstep">① 検索文字を入力</div>' +
      '<div class="rksearch">' +
        '<input id="rkq" type="search" placeholder="F227 / 227 / 小森 …" autocomplete="off">' +
        '<button id="rkgo" type="button">検索</button>' +
      '</div>' +
      '<div class="rkkp">' +
        '<div class="rkstep rkstep2">② ボタンで顧客番号を検索</div>' +
        '<div class="rkpfx">' +
          '<button type="button" data-pfx="M">M（男）</button>' +
          '<button type="button" data-pfx="F">F（女）</button>' +
          '<button type="button" data-pfx="">頭文字なし</button>' +
        '</div>' +
        '<div class="rkgrid">' +
          '<button type="button" data-d="1">1</button>' +
          '<button type="button" data-d="2">2</button>' +
          '<button type="button" data-d="3">3</button>' +
          '<button type="button" data-d="4">4</button>' +
          '<button type="button" data-d="5">5</button>' +
          '<button type="button" data-d="6">6</button>' +
          '<button type="button" data-d="7">7</button>' +
          '<button type="button" data-d="8">8</button>' +
          '<button type="button" data-d="9">9</button>' +
          '<button type="button" class="del" data-act="del">&#10008;</button>' +
          '<button type="button" data-d="0">0</button>' +
          '<button type="button" class="clr" data-act="clr">C</button>' +
        '</div>' +
        '<div id="rkecho" class="rkecho empty">—</div>' +
        '<button id="rkgo2" type="button" class="rkgo2">🔎 この番号で検索</button>' +
      '</div>' +
      '<div class="rkstatus" id="rkstatus">顧客番号（例 F227・数字だけ 227 でも可）か、お名前の一部で検索。</div>' +
      '<div id="rkres"></div>' +
    '</div>' +
  '</div>' +
  script;
}

/** 時間指定LINE送信ページ（純JS・GAS API不使用）。開発URL(?dev=1)専用の内部ツール。
 *  文章・画像・送る日時・送る相手を決めて「予約」を積む。画像は窓口へ base64 で直接書き込み(no-cors)、
 *  依頼(op=timed_line_send)は JSONP で積む＝事務所PC(intake.py)が受け取り、見張り(watcher.py)が時刻に送る。 */
function renderTimedSendPage_(base, staff, dev) {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var css = '.ts{max-width:560px;margin:0 auto;padding:0 6px 48px;text-align:left;}' +
    '.tslbl{font-weight:800;margin:16px 4px 6px;font-size:16px;}' +
    '.ts textarea,.ts input[type=text],.ts input[type=date],.ts input[type=time],.ts select{' +
    'width:100%;box-sizing:border-box;font-size:17px;padding:12px;border-radius:12px;border:1px solid #cbd5e1;background:#fff;color:#123;}' +
    '.ts textarea{min-height:96px;}' +
    '.tsrow{display:flex;gap:10px;}.tsrow>div{flex:1;}' +
    '.tsmode{display:block;margin:10px 0 2px;font-size:16px;font-weight:700;}' +
    '.tssub{margin:0 0 6px 26px;}' +
    '.tsbanner{padding:10px 12px;border-radius:12px;font-weight:800;margin:6px 4px 4px;font-size:14px;}' +
    '.tsthumb{margin:8px 2px 0;}.tsthumb img{height:70px;border-radius:8px;margin:0 8px 8px 0;vertical-align:top;box-shadow:0 1px 4px rgba(0,0,0,.2);}' +
    '.tsgo{display:block;width:100%;margin:22px 0 8px;padding:18px;font-size:21px;font-weight:800;border:0;border-radius:16px;background:#0f766e;color:#fff;box-shadow:0 4px 10px rgba(0,0,0,.18);}' +
    '.tsgo:disabled{opacity:.5;}' +
    '.tsstatus{font-weight:800;color:#0a7;min-height:24px;margin:10px 4px;font-size:15px;}' +
    '.tsclr{font-size:13px;padding:6px 12px;border-radius:10px;border:1px solid #cbd5e1;background:#fff;margin-top:6px;}';
  var script =
  '<script>(function(){' +
  'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
  'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
  'var imgs=[],GROUPS={};' +
  'var msgEl=document.getElementById("tsmsg"),fileEl=document.getElementById("tsfile"),thumbEl=document.getElementById("tsthumb");' +
  'var dateEl=document.getElementById("tsdate"),timeEl=document.getElementById("tstime"),codesEl=document.getElementById("tscodes");' +
  'var groupEl=document.getElementById("tsgroup"),stEl=document.getElementById("tsstatus"),goEl=document.getElementById("tsgo"),banEl=document.getElementById("tsbanner");' +
  'function esc(s){return (s==null?"":String(s)).replace(/[&<>\\"\\x27]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\\x27":"&#39;"}[c];});}' +
  'function status(t,err){stEl.textContent=t;stEl.style.color=err?"#c0392b":"#0a7";}' +
  'function jsonp(params,onR){var cb="__ts"+Date.now()+Math.floor(Math.random()*1000);window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
  'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
  'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
  'function pushImage(name,obj){return fetch(EXEC+"?action=push&key="+KEY+"&name="+name,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(obj)});}' +
  'function rnd(){var s="timedsend_img_",c="abcdefghijklmnopqrstuvwxyz0123456789",i;for(i=0;i<12;i++)s+=c[Math.floor(Math.random()*36)];return s+".json";}' +
  'function two(n){return ("0"+n).slice(-2);}' +
  'var now=new Date();dateEl.value=now.getFullYear()+"-"+two(now.getMonth()+1)+"-"+two(now.getDate());timeEl.value=two((now.getHours()+1)%24)+":00";' +
  'function renderThumbs(){thumbEl.innerHTML=imgs.map(function(o){return "<img src=\\"data:"+o.mime+";base64,"+o.b64+"\\">";}).join("")+(imgs.length?"<div><button type=\\"button\\" class=\\"tsclr\\" id=\\"tsimgclr\\">画像を消す</button></div>":"");' +
  'var cl=document.getElementById("tsimgclr");if(cl)cl.addEventListener("click",function(){imgs=[];fileEl.value="";renderThumbs();});}' +
  'function addFiles(files){Array.prototype.slice.call(files).forEach(function(f){if(!/^image\\//.test(f.type))return;var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){var mx=1280,w=im.width,h=im.height;if(w>mx||h>mx){if(w>=h){h=Math.round(h*mx/w);w=mx;}else{w=Math.round(w*mx/h);h=mx;}}var cv=document.createElement("canvas");cv.width=w;cv.height=h;cv.getContext("2d").drawImage(im,0,0,w,h);var durl=cv.toDataURL("image/jpeg",0.82);imgs.push({b64:durl.split(",")[1],mime:"image/jpeg"});renderThumbs();};im.src=fr.result;};fr.readAsDataURL(f);});}' +
  'fileEl.addEventListener("change",function(){addFiles(fileEl.files);});' +
  'function getMode(){var r=document.querySelectorAll("input[name=tsmode]");for(var i=0;i<r.length;i++)if(r[i].checked)return r[i].value;return "person";}' +
  'function setMode(m){var r=document.querySelectorAll("input[name=tsmode]");for(var i=0;i<r.length;i++)r[i].checked=(r[i].value===m);}' +
  'codesEl.addEventListener("focus",function(){setMode("person");});' +
  'groupEl.addEventListener("focus",function(){setMode("group");});' +
  'jsonp({action:"data",name:"timedsend_groups.json"},function(d){' +
  'if(d&&d.groups){var o="";for(var i=0;i<d.groups.length;i++){GROUPS[d.groups[i].id]=d.groups[i];o+="<option value=\\""+esc(d.groups[i].id)+"\\">"+esc(d.groups[i].name)+"（"+d.groups[i].count+"人）</option>";}groupEl.innerHTML=o;}' +
  'if(d&&d.enabled===false){banEl.style.background="#f8d7da";banEl.textContent="いま送信はOFFです。事務所PCの自動監視でONにするまで、予約しても送られません。";}' +
  'else if(d&&d.practice){banEl.style.background="#fff3cd";banEl.textContent="いまは練習モードです。誰を選んでも、実際にはオーナー本人にしか送りません。";}' +
  'else if(d){banEl.style.background="#d1e7dd";banEl.textContent="いまは本番モードです。選んだ相手に実際に送られます。";}});' +
  'var polls=0;function poll(id){polls++;if(polls>30){status("時間切れです。事務所PCが動いているかご確認のうえ、もう一度お試しください。",true);goEl.disabled=false;return;}' +
  'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){status("エラー："+((r&&r.error)||"不明"),true);goEl.disabled=false;return;}' +
  'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){poll(id);},1200);return;}' +
  'if(r.status!=="done"){status("予約できませんでした："+esc(r.result||r.status),true);goEl.disabled=false;return;}' +
  'status("予約しました。"+esc(r.result||""),false);msgEl.value="";imgs=[];fileEl.value="";renderThumbs();codesEl.value="";goEl.disabled=false;});}' +
  'function go(){var msg=(msgEl.value||"").trim();if(!msg&&!imgs.length){status("文章か画像のどちらかは必要です。",true);return;}' +
  'var dv=dateEl.value,tv=timeEl.value;if(!dv||!tv){status("送る日と時刻を入れてください。",true);return;}var send_at=dv+" "+tv;' +
  'var mode=getMode(),target;' +
  'if(mode==="person"){var codes=(codesEl.value||"").split(/[\\s,\\u3001\\uFF0C]+/).filter(Boolean);if(!codes.length){status("番号を入れてください（例 M123）。",true);return;}target={type:"person",codes:codes};}' +
  'else if(mode==="group"){var val=groupEl.value;if(!val){status("グループを選んでください。",true);return;}var g=GROUPS[val];target={type:"tag",tag_id:val,tag_name:g?g.name:""};}' +
  'else if(mode==="all"){target={type:"all"};}else{target={type:"owner"};}' +
  'goEl.disabled=true;status("送っています…（画像があると少しかかります）",false);' +
  'var names=[],ups=imgs.map(function(o){var n=rnd();names.push(n);return pushImage(n,o);});' +
  'Promise.all(ups).then(function(){' +
  'jsonp({action:"submit",key:KEY,op:"timed_line_send",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({message:msg,send_at:send_at,target:target,images:names})},' +
  'function(r){if(!r||!r.ok||!r.id){status("依頼を送れませんでした："+((r&&r.error)||"不明"),true);goEl.disabled=false;return;}setTimeout(function(){poll(r.id);},1000);});' +
  '}).catch(function(){status("画像の送信でつまずきました。もう一度お試しください。",true);goEl.disabled=false;});}' +
  'goEl.addEventListener("click",go);' +
  '})();</script>';
  return '<style>' + HOMECSS_ + css + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">⏰</span><span class="bname">時間指定LINE送信</span></div>' +
    '<div class="ts">' +
      '<div class="tsbanner" id="tsbanner">読み込み中…</div>' +
      '<div class="tslbl">送る文章（画像だけ送る時は空でもOK）</div>' +
      '<textarea id="tsmsg" placeholder="お客様へのメッセージ"></textarea>' +
      '<div class="tslbl">送る画像</div>' +
      '<input type="file" id="tsfile" accept="image/*" multiple>' +
      '<div class="tsthumb" id="tsthumb"></div>' +
      '<div class="tslbl">送る日時</div>' +
      '<div class="tsrow"><div><input type="date" id="tsdate"></div><div><input type="time" id="tstime"></div></div>' +
      '<div class="tslbl">送る相手</div>' +
      '<label class="tsmode"><input type="radio" name="tsmode" value="person" checked> 個人に送る（番号 例 M123）</label>' +
      '<div class="tssub"><input type="text" id="tscodes" placeholder="M123, F45（カンマや空白で複数可）"></div>' +
      '<label class="tsmode"><input type="radio" name="tsmode" value="group"> グループに送る</label>' +
      '<div class="tssub"><select id="tsgroup"><option value="">（グループ一覧を読み込み中…）</option></select></div>' +
      '<label class="tsmode"><input type="radio" name="tsmode" value="all"> やり取りのある全員</label>' +
      '<label class="tsmode"><input type="radio" name="tsmode" value="owner"> オーナー本人だけ（練習・確認用）</label>' +
      '<button type="button" class="tsgo" id="tsgo">この内容で予約する</button>' +
      '<div class="tsstatus" id="tsstatus">決めた時刻に、選んだ相手へ自動で送ります。</div>' +
    '</div>' +
  '</div>' +
  script;
}

/** 予約入力（スマホ版）。貼って選ぶだけ→事務所PC(edit_worker op=new_reservation)が新規予約を1件作る。
 *  読み取り(性別自動判定)・予定組み立て(カウンセリング＋施術)・登録はすべて事務所PC側でPC版と同じ
 *  prep_reservation を使う（スマホは入力を集めて送るだけ）。時間指定LINE送信と同じ「依頼→poll→結果」型。 */
/** 予約入力のトップ画面＝新規／既存／変更の3ボタン（PC版と同じ見た目＝丸ロゴ＋カード型ボタン）。
 *  「新規の予約」だけ中身あり（?view=yoyaku_new）。既存・変更はまだ中身が無いので押すと「準備中です」。 */
function renderReservationHomePage_(base, staff, dev) {
  var sfx = roleSfx_(staff, dev);
  var head = '<div class="hhead"><span class="bmark">📅</span><span class="bname">予約入力</span></div>' +
             '<div class="hsub">TaiwanTomato</div>';
  var menu =
    '<div class="rolemenu">' +
      '<a class="rolebtn jitsumu" href="' + base + '?view=yoyaku_new' + sfx + '" target="_top">' +
        '<span class="ricon">📝</span><span class="rname">新規の予約</span></a>' +
      '<a class="rolebtn kaihatsu" href="' + base + '?view=yoyaku_kizon' + sfx + '" target="_top">' +
        '<span class="ricon">📖</span><span class="rname">既存の予約</span></a>' +
      '<a class="rolebtn kanri" href="' + base + '?view=yoyaku_henkou' + sfx + '" target="_top">' +
        '<span class="ricon">✏️</span><span class="rname">既存の変更</span></a>' +
    '</div>';
  return '<style>' + HOMECSS_ + '</style>' +
    '<div class="home">' + backBar_(base, staff, dev) + head + menu + '</div>';
}

function renderNewReservationPage_(base, staff, dev) {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  // 表示の並び順＝みかん・オリーブ・トマト・マンゴー（2026-08-03 まるちゃん指定）。
  var STAFF = [['2', '🍊', 'みかん'], ['3', '🫒', 'オリーブ'], ['1', '🍅', 'トマト'], ['4', '🥭', 'マンゴー']];
  var ROOMS = [['FREEDOM', 'FREEDOM'], ['HAPPY', 'HAPPY'], ['LUCKY', 'LUCKY'], ['STAR', 'STAR/福/🇫🇷']];
  var DURS = [15, 20, 30, 40, 45, 50, 60, 70, 80, 90, 120, 150];
  function staffPills(grp, defVal, ids) {
    var h = '';
    for (var i = 0; i < STAFF.length; i++) {
      var s = STAFF[i];
      if (ids && ids.indexOf(s[0]) < 0) continue;   // カウンセリングは トマト・みかん だけ
      h += '<button type="button" class="nrpill' + (s[0] === defVal ? ' sel' : '') + '" data-grp="' + grp +
        '" data-val="' + s[0] + '" style="background:' + staffColor_(s[1]) + '">' + s[1] + ' ' + s[2] + '</button>';
    }
    return h;
  }
  var roomPills = '';
  for (var ri = 0; ri < ROOMS.length; ri++) {
    roomPills += '<button type="button" class="nrpill' + (ri === 0 ? ' sel' : '') + '" data-grp="room" data-val="' +
      esc_(ROOMS[ri][1]) + '" style="background:' + roomColor_(ROOMS[ri][1]) + '">' + esc_(ROOMS[ri][0]) + '</button>';
  }
  var durPills = '';
  for (var di = 0; di < DURS.length; di++) {
    durPills += '<button type="button" class="nrpill plain' + (DURS[di] === 60 ? ' sel' : '') +
      '" data-grp="dur" data-val="' + DURS[di] + '">' + DURS[di] + '</button>';
  }
  var genderPills = '<button type="button" class="nrpill" data-grp="gender" data-val="M" style="background:#2563eb">男</button>' +
    '<button type="button" class="nrpill" data-grp="gender" data-val="F" style="background:#db2777">女</button>';
  var natPills = '<button type="button" class="nrpill" data-grp="tw" data-val="0" style="background:#64748b">日本</button>' +
    '<button type="button" class="nrpill" data-grp="tw" data-val="1" style="background:#0d9b6c">台湾 🇹🇼</button>';
  var css = '.nr{max-width:560px;margin:0 auto;padding:0 6px 60px;text-align:left;}' +
    '.nrnote{background:#fff3cd;color:#5b4a00;padding:12px 14px;border-radius:12px;font-weight:800;font-size:16px;line-height:1.6;margin:6px 4px 6px;}' +
    '.nrsec{font-weight:900;margin:18px 4px 8px;font-size:20px;color:#fff;}' +
    '.nr textarea{width:100%;box-sizing:border-box;font-size:17px;padding:12px;border-radius:12px;border:1px solid #cbd5e1;background:#fff;color:#123;min-height:120px;}' +
    '.nrpills{display:flex;flex-wrap:wrap;gap:8px;}' +
    '.nrpill{border:0;border-radius:999px;padding:12px 18px;font-weight:800;font-size:15px;color:#fff;opacity:.6;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.15);}' +
    '.nrdur .nrpill{flex:0 0 calc((100% - 40px)/6);padding:12px 2px;text-align:center;box-sizing:border-box;}' +   /* 所要時間だけ1行6個＝12個で2行に収める */
    '.nrpill.plain{background:#475569;}' +
    '.nrpill.sel{opacity:1;outline:3px solid #fff;outline-offset:-3px;}' +
    '.nrgo{display:block;width:100%;margin:24px 0 8px;padding:18px;font-size:21px;font-weight:800;border:0;border-radius:16px;background:#16a34a;color:#fff;box-shadow:0 4px 10px rgba(0,0,0,.18);}' +
    '.nrgo:disabled{opacity:.5;}' +
    '.nrread{display:block;width:100%;margin:12px 0 4px;padding:14px;font-size:17px;font-weight:800;border:0;border-radius:14px;background:#2563eb;color:#fff;box-shadow:0 3px 8px rgba(0,0,0,.16);}' +
    '.nrread:disabled{opacity:.5;}' +
    '#nrprev{width:100%;box-sizing:border-box;min-height:120px;font-size:19px;padding:12px;border-radius:12px;border:1px solid #cbd5e1;background:#fff;color:#123;line-height:1.7;overflow:hidden;}' +
    '.nrstatus{font-weight:900;color:#fff;min-height:32px;margin:16px 4px;font-size:23px;line-height:1.5;}';
  var script = '<script>(function(){' +
    'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
    'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
    'var sel={dur:"60",staff:"2",counsel:"1",room:"FREEDOM",gender:"",tw:""};' +
    'var stEl=document.getElementById("nrstatus"),goEl=document.getElementById("nrgo"),txtEl=document.getElementById("nrtext");' +
    'var prevEl=document.getElementById("nrprev"),prevWrap=document.getElementById("nrprevwrap"),readEl=document.getElementById("nrread");' +
    'function status(t,err){stEl.textContent=t;stEl.style.color=err?"#c0392b":"#0a7";}' +
    'function esc(s){return (s==null?"":String(s));}' +
    'function selVal(g,v){if(!v)return;sel[g]=String(v);var sib=document.querySelectorAll(".nrpill[data-grp=\\""+g+"\\"]");for(var j=0;j<sib.length;j++)sib[j].classList.toggle("sel",sib[j].getAttribute("data-val")===String(v));}' +
    'var pills=document.querySelectorAll(".nrpill");' +
    'for(var i=0;i<pills.length;i++){pills[i].addEventListener("click",function(){var g=this.getAttribute("data-grp"),v=this.getAttribute("data-val");sel[g]=v;' +
    'var sib=document.querySelectorAll(".nrpill[data-grp=\\"" + g + "\\"]");for(var j=0;j<sib.length;j++)sib[j].classList.remove("sel");this.classList.add("sel");});}' +
    'function jsonp(params,onR){var cb="__nr"+Date.now()+Math.floor(Math.random()*1000);window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
    'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
    'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
    'var polls=0;function poll(id){polls++;if(polls>40){status("時間切れです。事務所パソコンが動いているかご確認のうえ、もう一度お試しください。",true);goEl.disabled=false;return;}' +
    'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){status("エラー："+((r&&r.error)||"不明"),true);goEl.disabled=false;return;}' +
    'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){poll(id);},1500);return;}' +
    'if(r.status!=="done"){status(esc(r.result||"エラーが発生しました。"),true);goEl.disabled=false;return;}' +
    'status("✅ "+esc(r.result||"登録しました")+" TimeTreeで内容をご確認ください。",false);txtEl.value="";goEl.disabled=false;});}' +
    'var ppolls=0;function pollPrev(id){ppolls++;if(ppolls>40){status("時間切れです。事務所パソコンが動いているかご確認のうえ、もう一度お試しください。",true);readEl.disabled=false;return;}' +
    'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){status("エラー："+((r&&r.error)||"不明"),true);readEl.disabled=false;return;}' +
    'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollPrev(id);},1500);return;}readEl.disabled=false;' +
    'if(r.status!=="done"){status(esc(r.result||"エラーが発生しました。"),true);return;}' +
    'var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}' +
    'if(!d.ok){status("読み取れませんでした："+esc(d.error||"日付・時刻が見つかりません"),true);return;}' +
    'prevEl.value=d.memo||"";prevWrap.style.display="";selVal("dur",d.dur);if(d.staff)selVal("staff",d.staff);' +
    'var rest=document.getElementById("nrrest");if(rest)rest.style.display="";' +          // ②所要以降を読み取り後に出す
    'var sg=document.getElementById("secGender"),stw=document.getElementById("secTw");' +
    'if(d.gender){selVal("gender",d.gender);if(sg)sg.style.display="none";}else if(sg)sg.style.display="";' +  // 読めたら性別欄は隠す
    'if(d.tw){selVal("tw",d.tw);if(stw)stw.style.display="none";}else if(stw)stw.style.display="";' +          // 読めたら国籍欄は隠す
    'var scn=document.getElementById("secCounsel");if(scn)scn.style.display=d.datsumo?"":"none";' +            // カウンセリング担当は脱毛のときだけ
    'var hideBusy=function(g,list){list=(list||[]).map(String);var pl=document.querySelectorAll(".nrpill[data-grp=\\""+g+"\\"]"),selH=false,first=null;for(var i=0;i<pl.length;i++){var busy=list.indexOf(pl[i].getAttribute("data-val"))>=0;pl[i].style.display=busy?"none":"";if(!busy&&!first){first=pl[i];}if(busy&&pl[i].classList.contains("sel")){selH=true;}}if(selH&&first){sel[g]=first.getAttribute("data-val");for(var j=0;j<pl.length;j++){pl[j].classList.toggle("sel",pl[j]===first);}}};' +
    'hideBusy("room",d.occ_rooms);hideBusy("staff",d.busy_staff);' +   // 空いていない部屋・施術担当は消す


    'prevEl.style.height="auto";prevEl.style.height=(prevEl.scrollHeight+6)+"px";' +   // 全文が見えるよう欄を伸ばす
    'prevWrap.scrollIntoView({behavior:"smooth",block:"start"});' +                     // 変換後を画面の一番上へ
    'status("",false);});}' +                                                          // 読み取り後の一言は出さない
    'prevEl.addEventListener("input",function(){prevEl.style.height="auto";prevEl.style.height=(prevEl.scrollHeight+6)+"px";});' +
    'function readGo(){var text=(txtEl.value||"").trim();if(!text){status("先に予約フォームを貼ってください。",true);return;}' +
    'readEl.disabled=true;status("変換中です。しばらくお待ちください。",false);' +
    'jsonp({action:"submit",key:KEY,op:"preview_reservation",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({text:text})},' +
    'function(r){if(!r||!r.ok||!r.id){status("依頼を送れませんでした："+((r&&r.error)||"不明"),true);readEl.disabled=false;return;}setTimeout(function(){pollPrev(r.id);},1200);});}' +
    'readEl.addEventListener("click",readGo);' +
    'function go(){var text=(txtEl.value||"").trim();if(!text){status("予約フォームを貼ってください。",true);return;}' +
    'goEl.disabled=true;status("登録を事務所パソコンへ送っています…",false);' +
    'jsonp({action:"submit",key:KEY,op:"new_reservation",who:idn.who,role:idn.role,device:idn.device,' +
    'fields:JSON.stringify({text:text,memo:(prevEl.value||""),dur:sel.dur,staff:sel.staff,counsel:sel.counsel,room:sel.room,gender:sel.gender,tw:sel.tw})},' +
    'function(r){if(!r||!r.ok||!r.id){status("依頼を送れませんでした："+((r&&r.error)||"不明"),true);goEl.disabled=false;return;}setTimeout(function(){poll(r.id);},1200);});}' +
    'goEl.addEventListener("click",go);' +
    '})();</script>';
  return '<style>' + HOMECSS_ + css + '</style>' +
    '<div class="home">' +
    '<div class="ubar"><a class="uhome" href="' + base + '?view=yoyaku' + roleSfx_(staff, dev) + '" target="_top">← 前に戻る</a></div>' +
    '<div class="hhead"><span class="bmark">📝</span><span class="bname">新規予約入力</span></div>' +
    '<div class="nr">' +
      '<div class="nrnote">お客様から送られた"お客様情報"を、下の欄にそのまま貼って完了ボタンを押すと、自動で予約メモの形式に変換されます</div>' +
      '<div class="nrsec">① 予約フォームを貼る</div>' +
      '<textarea id="nrtext" placeholder="予約フォームの内容をここに貼り付け"></textarea>' +
      '<button type="button" class="nrread" id="nrread">貼り付け完了（読み取る）</button>' +
      '<div id="nrprevwrap" style="display:none">' +
        '<div class="nrsec">予約メモ形式に変換されました（白い枠内で自由に文字を編集できます）</div>' +
        '<textarea id="nrprev"></textarea>' +
      '</div>' +
      '<div id="nrrest" style="display:none">' +
        '<div class="nrsec">② 所要時間（分）</div><div class="nrpills nrdur">' + durPills + '</div>' +
        '<div id="secCounsel" style="display:none"><div class="nrsec">③ カウンセリング担当</div><div class="nrpills">' + staffPills('counsel', '1', ['1', '2']) + '</div></div>' +
        '<div class="nrsec">④ 施術担当</div><div class="nrpills">' + staffPills('staff', '2') + '</div>' +
        '<div class="nrsec">⑤ 部屋</div><div class="nrpills">' + roomPills + '</div>' +
        '<div id="secGender"><div class="nrsec">性別（タイトルに入ります）</div><div class="nrpills">' + genderPills + '</div></div>' +
        '<div id="secTw"><div class="nrsec">国籍</div><div class="nrpills">' + natPills + '</div></div>' +
        '<button type="button" class="nrgo" id="nrgo">この内容で登録する</button>' +
      '</div>' +
      '<div class="nrstatus" id="nrstatus"></div>' +
    '</div>' +
  '</div>' +
  script;
}

/** 既存の予約／既存の変更＝番号入力→日付選択の2画面（PC版と同じ青緑の見た目・日付選択まで）。
 *  ★2026-08-03：まるちゃん指示①＝まずは番号→日付の2画面だけ（予約えらび・登録は後回し）。 */
function renderExistingPage_(base, staff, dev, mode) {
  var title = (mode === '変更') ? '予約変更' : '予約';             // 日付ページの「M332の予約変更」用
  var head = (mode === '変更') ? '既存の予約変更' : '既存の予約';   // 見出しの文言（新規予約と同じマーク📝）
  var isChange = (mode === '変更');
  var topHref = base + '?view=yoyaku' + roleSfx_(staff, dev);
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var DURS2 = [15, 20, 30, 40, 45, 50, 60, 70, 80, 90, 120, 150];
  var STAFF2 = [['2', '🍊 みかん', '#e08a1e'], ['3', '🫒 オリーブ', '#4b8b3b'], ['1', '🍅 トマト', '#d1443c'], ['4', '🥭 マンゴー', '#c9a227']];
  var ROOMS2 = [['FREEDOM', 'FREEDOM', '#2ecc87'], ['HAPPY', 'HAPPY', '#e73b3b'], ['LUCKY', 'LUCKY', '#fdc02d'], ['STAR/福/🇫🇷', 'STAR/福', '#b38bdc']];
  function exp_(grp, val, label, color, plain) {
    return '<button type="button" class="exp' + (plain ? ' plain' : '') + '" data-eg="' + grp + '" data-ev="' + esc_(val) + '"' + (color ? ' style="background:' + color + '"' : '') + '>' + label + '</button>';
  }
  var durP = '', staffP = '', roomP = '';
  for (var _di = 0; _di < DURS2.length; _di++) { durP += exp_('dur', DURS2[_di], DURS2[_di], '', true); }
  for (var _si = 0; _si < STAFF2.length; _si++) { staffP += exp_('staff', STAFF2[_si][0], STAFF2[_si][1], STAFF2[_si][2], false); }
  for (var _ri = 0; _ri < ROOMS2.length; _ri++) { roomP += exp_('room', ROOMS2[_ri][0], ROOMS2[_ri][1], ROOMS2[_ri][2], false); }
  var css =
    '.ex{max-width:560px;margin:0 auto;padding:0 6px 60px;text-align:left;}' +
    '.exstep{color:#eaf6fb;font-weight:800;letter-spacing:.06em;font-size:14px;margin:2px 4px 8px;}' +
    '#exwho{font-size:28px;color:#fff;font-weight:900;margin:2px 4px 14px;}' +   /* 日付ページの「M332の既存の予約」＝2倍 */
    '.exbox{width:100%;box-sizing:border-box;background:#fff;color:#0f172a;border:0;border-radius:16px;text-align:center;letter-spacing:.08em;font-size:44px;font-weight:900;padding:16px 12px;margin:6px 0 16px;box-shadow:0 4px 14px rgba(0,0,0,.15);resize:none;overflow:hidden;line-height:1.35;font-family:inherit;}' +
    '.exbox::placeholder{color:#94a3b8;font-weight:800;font-size:23px;letter-spacing:normal;line-height:1.5;}' +
    '.exseg{position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;background:rgba(255,255,255,.16);border-radius:16px;padding:6px;margin:0 0 14px;overflow:hidden;}' +
    '.exseg .thumb{position:absolute;top:6px;bottom:6px;left:6px;width:calc((100% - 12px)/3);background:#fff;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,.18);transition:transform .22s;}' +
    '.exseg button{position:relative;z-index:1;background:none;border:0;padding:14px 4px;font-size:19px;font-weight:800;color:#eaf6fb;cursor:pointer;}' +
    '.exseg button[aria-pressed="true"]{color:#0f172a;}' +
    '.expad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 16px;}' +
    '.expad button{background:#fff;color:#0f172a;border:0;border-radius:14px;padding:8px 0;font-size:30px;font-weight:800;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.15);}' +
    '.expad button.util{background:#fde2e4;color:#9b1c31;font-size:24px;}' +
    '.expaste{background:rgba(255,255,255,.14);border-radius:14px;padding:12px 14px;margin:2px 0 4px;}' +
    '.expl{color:#eaf6fb;font-weight:800;font-size:15px;margin-bottom:8px;}' +
    '.expaste input{width:100%;box-sizing:border-box;border:0;border-radius:10px;padding:14px;font-size:20px;font-weight:800;color:#0f172a;background:#fff;}' +
    '.exgo{display:block;width:100%;margin:22px 0 6px;padding:18px;font-size:21px;font-weight:800;border:0;border-radius:16px;background:#16a34a;color:#fff;box-shadow:0 4px 10px rgba(0,0,0,.18);cursor:pointer;}' +
    '.exhint{color:#eaf6fb;font-weight:700;font-size:16px;line-height:1.5;margin:2px 4px 12px;}' +
    '.exwho1{color:#fff;font-weight:900;font-size:24px;margin:2px 4px 4px;}' +
    '.exwd2{color:#fff;font-weight:900;font-size:40px;line-height:1.2;margin:0 4px 14px;}' +
    '#expickwho{color:#fff;font-weight:900;font-size:36px;line-height:1.25;margin:8px 4px 12px;}' +
    '.exstatus{color:#fff;font-weight:800;font-size:18px;margin:8px 4px;min-height:24px;}' +
    '.expick{display:flex;flex-direction:column;gap:12px;margin:6px 0 8px;}' +
    '.expickrow{display:block;width:100%;text-align:left;background:#fff;color:#0f172a;border:0;border-radius:16px;padding:16px 18px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.12);}' +
    '.expickrow.sel{outline:3px solid #fb8c44;outline-offset:-3px;}' +
    '.expickrow .pn{display:block;font-weight:900;font-size:26px;color:#0f172a;margin-bottom:4px;}' +
    '.expickrow .pd{display:block;font-weight:900;font-size:30px;}' +
    '.expickrow .pm{color:#475569;font-weight:800;font-size:25px;display:block;margin-top:8px;line-height:1.5;}' +
    '.expickrow .proom{display:inline-block;color:#fff;border-radius:10px;padding:3px 14px;font-weight:900;font-size:23px;margin-right:8px;}' +
    '.expickrow .ppart{display:block;color:#0f172a;font-weight:800;font-size:25px;margin-top:8px;}' +
    '.exsec{color:#fff;font-weight:900;font-size:20px;margin:16px 4px 8px;}' +
    '.expills{display:flex;flex-wrap:wrap;gap:8px;}' +
    '.exp{border:0;border-radius:999px;padding:12px 18px;font-weight:800;font-size:16px;color:#fff;opacity:.6;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.15);}' +
    '.exp.plain{background:#475569;}' +
    '.exp.sel{opacity:1;outline:3px solid #fff;outline-offset:-3px;}' +
    '.exdur .exp{flex:0 0 calc((100% - 40px)/6);padding:12px 2px;text-align:center;box-sizing:border-box;}' +
    '.exmlist{display:flex;flex-direction:column;gap:12px;margin-top:10px;}' +
    '.exmbtn{display:block;width:100%;text-align:left;background:#fff;color:#0f172a;border:0;border-radius:16px;padding:20px 22px;font-size:24px;font-weight:900;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.12);}' +
    '.exmbtn:active{transform:translateY(1px);}' +
    '#exmemobox{text-align:left;font-size:20px;line-height:1.6;min-height:180px;}' +
    '.exch{display:flex;align-items:center;justify-content:center;gap:16px;margin:6px 0 16px;}' +
    '.exnav{width:48px;height:48px;border-radius:12px;border:0;background:#fff;color:#0f172a;font-size:20px;font-weight:800;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.15);}' +
    '.exct{font-size:24px;font-weight:900;width:170px;text-align:center;color:#fff;}' +
    '.exgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;}' +
    '.exwd{text-align:center;font-size:14px;color:#eaf6fb;font-weight:800;}' +
    '.exwd.sat{color:#bfe3ff;}.exwd.sun{color:#ffc9c9;}' +
    '.exday{aspect-ratio:1/1.5;display:grid;place-items:center;background:#fff;color:#0f172a;border:0;border-radius:12px;font-size:20px;font-weight:800;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.12);}' +
    '.exday.sat{color:#1d6fb8;}.exday.sun{color:#c0392b;}' +
    '.exday.today{outline:2px solid #fb8c44;outline-offset:-2px;}' +
    '.exday.picked{background:#fb8c44;color:#fff;}' +
    '.exday.blank{visibility:hidden;box-shadow:none;background:transparent;}' +
    '.exday.past{opacity:.4;}' +
    '.exdone{color:#fff;font-weight:800;font-size:20px;line-height:1.6;background:rgba(255,255,255,.14);border-radius:14px;padding:18px;margin-top:16px;}';
  var numSec =
    '<div id="exNum">' +
      '<div class="ubar"><a class="uhome" href="' + topHref + '" target="_top">← 前に戻る</a></div>' +
      '<div class="hhead"><span class="bmark">📝</span><span class="bname">' + head + '</span></div>' +
      '<textarea class="exbox" id="exdisp" rows="2" placeholder="ここにお客様番号を貼り付けるか、下の英語・番号ボタンで入力する"></textarea>' +
      '<div class="exseg" id="exseg"><span class="thumb"></span>' +
        '<button data-v="M" aria-pressed="true">M（男）</button>' +
        '<button data-v="F">F（女）</button>' +
        '<button data-v="">文字なし</button></div>' +
      '<div class="expad" id="expad">' +
        '<button>1</button><button>2</button><button>3</button>' +
        '<button>4</button><button>5</button><button>6</button>' +
        '<button>7</button><button>8</button><button>9</button>' +
        '<button class="util" data-k="del">⌫</button><button>0</button><button class="util" data-k="clr">C</button>' +
      '</div>' +
      '<button class="exgo" id="exToDate">' + (isChange ? '予約をさがす→' : '日付入力へ→') + '</button>' +
    '</div>';
  var pickSec =
    '<div id="exPick" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackPick" href="javascript:void(0)">← 前に戻る</a></div>' +
      '<div class="hhead"><span class="bmark">📖</span><span class="bname">変更する予約を選択</span></div>' +
      '<div id="expickwho"></div>' +
      '<div class="exstatus" id="expickst"></div>' +
      '<div class="expick" id="expicklist"></div>' +
    '</div>';
  var dateSec =
    '<div id="exDate" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackDate" href="javascript:void(0)">← 前に戻る</a></div>' +
      '<div class="hhead"><span class="bmark">📅</span><span class="bname">日付入力</span></div>' +
      '<div class="exstep" id="exwho">' + title + '</div>' +
      '<div class="exch"><button class="exnav" id="exprev">◀</button><div class="exct" id="exct"></div><button class="exnav" id="exnext">▶</button></div>' +
      '<div class="exgrid" id="exgrid"></div>' +
      '<div class="exdone" id="exdone" style="display:none"></div>' +
    '</div>';
  var padHtml =
    '<button>1</button><button>2</button><button>3</button>' +
    '<button>4</button><button>5</button><button>6</button>' +
    '<button>7</button><button>8</button><button>9</button>' +
    '<button class="util" data-k="del">⌫</button><button>0</button><button class="util" data-k="clr">C</button>';
  var timeSec =
    '<div id="exTime" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackTime" href="javascript:void(0)">← 前に戻る</a></div>' +
      '<div class="hhead"><span class="bmark">🕐</span><span class="bname">時刻入力</span></div>' +
      '<div class="exstep" id="exwhen"></div>' +
      '<input class="exbox" id="extime" readonly placeholder="__ : __">' +
      '<div class="exhint">例：9時→0900 ／ 12時10分→1210（4ケタで入れてね）</div>' +
      '<div class="expad" id="extpad">' + padHtml + '</div>' +
      '<button class="exgo" id="exToDone">この内容で進む→</button>' +
      '<div class="exdone" id="exdone2" style="display:none"></div>' +
    '</div>';
  var editSec =
    '<div id="exEdit" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackEdit" href="javascript:void(0)">← 前に戻る</a></div>' +
      '<div class="hhead"><span class="bmark">✏️</span><span class="bname">変更内容</span></div>' +
      '<div class="exwho1" id="exeditwho"></div>' +
      '<div id="secDur"><div class="exsec">施術時間（分）</div><div class="expills exdur" id="edur">' + durP + '</div></div>' +
      '<div id="secStaff"><div class="exsec">施術担当</div><div class="expills" id="estaff">' + staffP + '</div></div>' +
      '<div id="secRoom"><div class="exsec">部屋</div><div class="expills" id="eroom">' + roomP + '</div></div>' +
      '<button class="exgo" id="exEditGo">この内容に変更する→</button>' +
      '<div class="exdone" id="exdone3" style="display:none"></div>' +
    '</div>';
  var menuSec =
    '<div id="exMenu" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackMenu" href="javascript:void(0)">← 前に戻る</a></div>' +
      '<div class="hhead"><span class="bmark">✏️</span><span class="bname">変更する内容を選択</span></div>' +
      '<div class="exwho1" id="exmenuwho"></div>' +
      '<div class="exmlist">' +
        '<button class="exmbtn" data-chg="dt">日付＆時間</button>' +
        '<button class="exmbtn" data-chg="t">時間（同日内）</button>' +
        '<button class="exmbtn" data-chg="staff">担当</button>' +
        '<button class="exmbtn" data-chg="room">部屋</button>' +
        '<button class="exmbtn" data-chg="dur">施術時間</button>' +
        '<button class="exmbtn" data-chg="memo">予約メモ</button>' +
      '</div>' +
    '</div>';
  var memoSec =
    '<div id="exMemo" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackMemo" href="javascript:void(0)">← 前に戻る</a></div>' +
      '<div class="hhead"><span class="bmark">📝</span><span class="bname">予約メモを変更</span></div>' +
      '<div class="exwho1" id="exmemowho"></div>' +
      '<textarea class="exbox" id="exmemobox" rows="6"></textarea>' +
      '<button class="exgo" id="exMemoGo">この内容に変更する→</button>' +
      '<div class="exdone" id="exdone4" style="display:none"></div>' +
    '</div>';
  var script = '<script>(function(){' +
    'var TITLE=' + JSON.stringify(title) + ';' +
    'var prefix="M",digits="";' +
    'var today=new Date();var calY=today.getFullYear(),calM=today.getMonth(),picked=null;' +
    'var ISCHANGE=' + (isChange ? 'true' : 'false') + ';var EXEC="' + EXEC + '",KEY="' + KEY + '";var chosen=null;' +
    'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
    'function esc(s){return (s==null?"":String(s));}' +
    'function jsonp(params,onR){var cb="__ck"+Date.now()+Math.floor(Math.random()*1000);window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
    'var lpolls=0;function pollPicks(id){lpolls++;if(lpolls>40){document.getElementById("expickst").textContent="時間切れです。事務所パソコンが動いているかご確認ください。";return;}jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){document.getElementById("expickst").textContent="エラー："+((r&&r.error)||"不明");return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollPicks(id);},600);return;}if(r.status!=="done"){document.getElementById("expickst").textContent=esc(r.result||"エラー");return;}var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}renderPicks((d.reservations)||[]);});}' +
    'function loadPicks(){document.getElementById("exNum").style.display="none";document.getElementById("exPick").style.display="";document.getElementById("expickwho").textContent="「"+disp()+"」の予約";document.getElementById("expicklist").innerHTML="";document.getElementById("expickst").textContent="予約をさがしています…（10秒ほどかかります）";window.scrollTo(0,0);jsonp({action:"submit",key:KEY,op:"customer_reservations",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({number:disp()})},function(r){if(!r||!r.ok||!r.id){document.getElementById("expickst").textContent="依頼を送れませんでした："+((r&&r.error)||"不明");return;}setTimeout(function(){pollPicks(r.id);},500);});}' +
    'function renderPicks(list){var el=document.getElementById("expicklist");document.getElementById("expickst").textContent=list.length?"":"この番号の予約が見つかりません。";document.getElementById("expickwho").textContent="「"+disp()+"」"+((list.length&&list[0].name)?list[0].name+"様":"の予約");var h="";for(var i=0;i<list.length;i++){var r=list[i];var pm=(r.parts||[]).join("・")||"—";var past=r.is_past?"（過去）":"";var rk=roomVal(r.room);var rc=(typeof roomColor_==="function")?roomColor_(rk):"#64748b";var rn=(typeof shortRoomName_==="function")?shortRoomName_(rk):rk;h+="<button class=\\"expickrow\\" data-i=\\""+i+"\\"><span class=\\"pd\\">"+past+r.date+" "+r.start_hm+" "+(r.dur_min||"")+"分</span><span class=\\"pm\\">担当 "+esc(r.staff_emoji||"?")+"　<span class=\\"proom\\" style=\\"background:"+rc+"\\">"+esc(rn)+"</span></span><span class=\\"ppart\\">施術部位："+esc(pm)+"</span></button>";}el.innerHTML=h;window.__PICKS=list;var rows=el.querySelectorAll(".expickrow");for(var j=0;j<rows.length;j++){(function(k){rows[k].addEventListener("click",function(){chosen=window.__PICKS[k];showMenu();});})(j);}}' +
    'function goDate(){hideSteps();document.getElementById("exDate").style.display="";document.getElementById("exwho").textContent="「"+disp()+"」の"+TITLE;calY=today.getFullYear();calM=today.getMonth();drawCal();window.scrollTo(0,0);}' +
    'function disp(){return (prefix||"")+digits;}' +
    'function upd(){document.getElementById("exdisp").value=disp();}' +
    'var seg=document.getElementById("exseg"),sb=seg.querySelectorAll("button"),thumb=seg.querySelector(".thumb");' +
    'function selSeg(i){for(var j=0;j<sb.length;j++)sb[j].setAttribute("aria-pressed",j===i);thumb.style.transform="translateX("+(i*100)+"%)";prefix=sb[i].getAttribute("data-v");upd();}' +
    'for(var i=0;i<sb.length;i++){(function(k){sb[k].addEventListener("click",function(){selSeg(k);});})(i);}' +
    'document.getElementById("expad").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;var k=b.getAttribute("data-k");if(k==="clr"){digits="";selSeg(2);return;}if(k==="del"){if(digits){digits=digits.slice(0,-1);}else{selSeg(2);return;}}else if(/^[0-9]$/.test(b.textContent)&&digits.length<4){digits+=b.textContent;}upd();});' +
    'var box=document.getElementById("exdisp");' +   /* 白BOX＝貼り付けもでき、パッド入力も表示する */
    'box.addEventListener("input",function(){var m=(box.value||"").toUpperCase().replace(/\\s/g,"").match(/^([MF]?)([0-9]{0,4})/);if(!m){return;}digits=m[2];selSeg(m[1]==="M"?0:(m[1]==="F"?1:2));});' +
    'function drawCal(){var wd=["月","火","水","木","金","土","日"];document.getElementById("exct").textContent=calY+"年 "+(calM+1)+"月";var h="";for(var i=0;i<7;i++){h+="<div class=\\"exwd"+(i===5?" sat":i===6?" sun":"")+"\\">"+wd[i]+"</div>";}var first=new Date(calY,calM,1);var off=(first.getDay()+6)%7;var dim=new Date(calY,calM+1,0).getDate();for(var b=0;b<off;b++){h+="<div class=\\"exday blank\\"></div>";}var t0=new Date(today.getFullYear(),today.getMonth(),today.getDate());for(var d=1;d<=dim;d++){var dow=(off+d-1)%7;var cls="exday";if(dow===5){cls+=" sat";}if(dow===6){cls+=" sun";}var cur=new Date(calY,calM,d);if(calY===today.getFullYear()&&calM===today.getMonth()&&d===today.getDate()){cls+=" today";}if(cur<t0){cls+=" past";}if(picked&&picked.getFullYear()===calY&&picked.getMonth()===calM&&picked.getDate()===d){cls+=" picked";}h+="<button class=\\""+cls+"\\" data-d=\\""+d+"\\">"+d+"</button>";}document.getElementById("exgrid").innerHTML=h;}' +
    'document.getElementById("exToDate").addEventListener("click",function(){if(!digits){alert("お客様番号を入れてください");return;}if(ISCHANGE){loadPicks();}else{goDate();}});' +
    'document.getElementById("exbackPick").addEventListener("click",function(){document.getElementById("exPick").style.display="none";document.getElementById("exNum").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exbackDate").addEventListener("click",function(){document.getElementById("exDate").style.display="none";document.getElementById(ISCHANGE?"exMenu":"exNum").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exprev").addEventListener("click",function(){calM--;if(calM<0){calM=11;calY--;}drawCal();});' +
    'document.getElementById("exnext").addEventListener("click",function(){calM++;if(calM>11){calM=0;calY++;}drawCal();});' +
    'document.getElementById("exgrid").addEventListener("click",function(e){var b=e.target.closest("button.exday");if(!b||b.className.indexOf("blank")>=0)return;var d=parseInt(b.getAttribute("data-d"),10);picked=new Date(calY,calM,d);drawCal();document.getElementById("exDate").style.display="none";document.getElementById("exTime").style.display="";var wd=["日","月","火","水","木","金","土"][picked.getDay()];document.getElementById("exwhen").innerHTML="<div class=\\"exwho1\\">「"+disp()+"」の"+TITLE+"</div><div class=\\"exwd2\\">"+(calM+1)+"月"+d+"日（"+wd+"）</div>";tdig="";tupd();window.scrollTo(0,0);});' +
    'var tdig="";' +
    'function tdisp(){if(!tdig){return "";}if(tdig.length<4){return tdig;}return tdig.slice(0,2)+":"+tdig.slice(2);}' +
    'function tupd(){document.getElementById("extime").value=tdisp();}' +
    'document.getElementById("extpad").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;var k=b.getAttribute("data-k");if(k==="clr"){tdig="";}else if(k==="del"){tdig=tdig.slice(0,-1);}else if(/^[0-9]$/.test(b.textContent)&&tdig.length<4){tdig+=b.textContent;}tupd();});' +
    'document.getElementById("exbackTime").addEventListener("click",function(){document.getElementById("exTime").style.display="none";document.getElementById(chgtype==="t"?"exMenu":"exDate").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exToDone").addEventListener("click",function(){if(tdig.length<4){alert("時刻を4ケタで入れてください（例 1230）");return;}realChange(document.getElementById("exdone2"));window.scrollTo(0,document.body.scrollHeight);});' +
    'var esel={dur:"",staff:"",room:""};' +
    'function selE(g,v){esel[g]=String(v);var pl=document.querySelectorAll(".exp[data-eg=\\""+g+"\\"]");for(var i=0;i<pl.length;i++){pl[i].classList.toggle("sel",pl[i].getAttribute("data-ev")===String(v));}}' +
    'function nearDur(v){v=parseInt(v,10)||30;var arr=[15,20,30,40,45,50,60,70,80,90,120,150],best=arr[0];for(var i=0;i<arr.length;i++){if(Math.abs(arr[i]-v)<Math.abs(best-v)){best=arr[i];}}return best;}' +
    'function roomVal(r){r=String(r||"").toLowerCase();if(r.indexOf("freedom")>=0){return "FREEDOM";}if(r.indexOf("happy")>=0){return "HAPPY";}if(r.indexOf("lucky")>=0){return "LUCKY";}if(r.indexOf("スター")>=0||r.indexOf("star")>=0||r.indexOf("福")>=0){return "STAR/福/🇫🇷";}return "FREEDOM";}' +
    'function staffNum(e){e=String(e||"");if(e.indexOf("🍅")>=0){return "1";}if(e.indexOf("🍊")>=0){return "2";}if(e.indexOf("🫒")>=0){return "3";}if(e.indexOf("🥭")>=0){return "4";}return "2";}' +
    'var epills=document.querySelectorAll(".exp");for(var _p=0;_p<epills.length;_p++){epills[_p].addEventListener("click",function(){selE(this.getAttribute("data-eg"),this.getAttribute("data-ev"));});}' +
    'var chgtype="dt";' +
    'function nameSuffix(){return (chosen&&chosen.name)?chosen.name+"様":"";}' +
    'function hideSteps(){var ids=["exNum","exPick","exMenu","exDate","exTime","exEdit","exMemo"];for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el)el.style.display="none";}}' +
    'function showMenu(){hideSteps();document.getElementById("exMenu").style.display="";document.getElementById("exmenuwho").innerHTML="「"+disp()+"」"+nameSuffix()+"<br>元："+chosen.date+" "+chosen.start_hm;window.scrollTo(0,0);}' +
    'function goTime(){hideSteps();document.getElementById("exTime").style.display="";var wd=["日","月","火","水","木","金","土"][picked.getDay()];document.getElementById("exwhen").innerHTML="<div class=\\"exwho1\\">「"+disp()+"」"+nameSuffix()+"</div><div class=\\"exwd2\\">"+(picked.getMonth()+1)+"月"+picked.getDate()+"日（"+wd+"）</div>";tdig="";tupd();window.scrollTo(0,0);}' +
    'function enterEdit(){hideSteps();document.getElementById("exEdit").style.display="";document.getElementById("secDur").style.display=(chgtype==="dur")?"":"none";document.getElementById("secStaff").style.display=(chgtype==="staff")?"":"none";document.getElementById("secRoom").style.display=(chgtype==="room")?"":"none";var lbl={dur:"施術時間",staff:"担当",room:"部屋"}[chgtype]||"";document.getElementById("exeditwho").innerHTML="「"+disp()+"」"+nameSuffix()+"<br>"+lbl+"を変更";selE("dur",nearDur(chosen?chosen.dur_min:30));selE("staff",staffNum(chosen?chosen.staff_emoji:""));selE("room",roomVal(chosen?chosen.room:""));window.scrollTo(0,0);}' +
    'function enterMemo(){hideSteps();document.getElementById("exMemo").style.display="";document.getElementById("exmemowho").innerHTML="「"+disp()+"」"+nameSuffix()+"<br>予約メモを変更";document.getElementById("exmemobox").value=(chosen&&chosen.note)||"";window.scrollTo(0,0);}' +
    'function summaryText(){var sn={"1":"トマト","2":"みかん","3":"オリーブ","4":"マンゴー"};var b="練習：この予約を ";var tail="（練習なので本物のタイムツリーには書き込んでいません）";if(chgtype==="dt"){return b+(picked.getMonth()+1)+"月"+picked.getDate()+"日 "+tdisp()+" に変更しました"+tail;}if(chgtype==="t"){return b+"時刻 "+tdisp()+"（同じ日）に変更しました"+tail;}if(chgtype==="staff"){return b+"担当を "+(sn[esel.staff]||"")+" に変更しました"+tail;}if(chgtype==="room"){return b+"部屋を "+esel.room+" に変更しました"+tail;}if(chgtype==="dur"){return b+"施術時間を "+esel.dur+"分 に変更しました"+tail;}if(chgtype==="memo"){return b+"予約メモを変更しました"+tail;}return "";}' +
    'function _p2(n){return (n<10?"0":"")+n;}function _iso(dt){return dt.getFullYear()+"-"+_p2(dt.getMonth()+1)+"-"+_p2(dt.getDate())+"T"+_p2(dt.getHours())+":"+_p2(dt.getMinutes())+":00";}' +
    'function doneMsg(){var sn={"1":"トマト","2":"みかん","3":"オリーブ","4":"マンゴー"};if(chgtype==="dt"){return (picked.getMonth()+1)+"月"+picked.getDate()+"日 "+tdisp()+" に変更";}if(chgtype==="t"){return "時刻 "+tdisp()+"（同じ日）に変更";}if(chgtype==="dur"){return "施術時間を "+esel.dur+"分 に変更";}if(chgtype==="memo"){return "予約メモを変更";}if(chgtype==="staff"){return "担当を "+(sn[esel.staff]||"")+" に変更";}if(chgtype==="room"){return "部屋を "+esel.room+" に変更";}return "";}' +
    'function realChange(doneEl){var fields={cal:chosen.calendar_id,event:chosen.event_id};if(chgtype==="dt"||chgtype==="t"){var hh=parseInt(tdig.slice(0,2),10),mm=parseInt(tdig.slice(2),10);var sd=new Date(picked.getFullYear(),picked.getMonth(),picked.getDate(),hh,mm,0,0);var ed=new Date(sd.getTime()+((chosen.dur_min||30)*60000));fields.start=_iso(sd);fields.end=_iso(ed);}else if(chgtype==="dur"){var hm=(chosen.start_hm||"13:00").split(":");var sd=new Date(chosen.date+"T00:00:00");sd.setHours(parseInt(hm[0],10),parseInt(hm[1],10),0,0);var ed=new Date(sd.getTime()+(parseInt(esel.dur,10)*60000));fields.start=_iso(sd);fields.end=_iso(ed);}else if(chgtype==="memo"){fields.note=document.getElementById("exmemobox").value;}else{doneEl.style.display="";doneEl.textContent="この項目はまだ準備中です。";return;}doneEl.style.display="";doneEl.textContent="変更を事務所パソコンへ送っています…（10秒ほど）";jsonp({action:"submit",key:KEY,op:"change_reservation",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(fields)},function(r){if(!r||!r.ok||!r.id){doneEl.textContent="依頼を送れませんでした："+((r&&r.error)||"不明");return;}pollChange(r.id,doneEl);});}' +
    'function pollChange(id,doneEl){jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){doneEl.textContent="エラー："+((r&&r.error)||"不明");return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollChange(id,doneEl);},600);return;}if(r.status!=="done"){doneEl.textContent="変更できませんでした："+esc(r.result||"");return;}doneEl.textContent="✅ "+doneMsg()+" しました（タイムツリーに反映しました）";});}' +
    'var mbtns=document.querySelectorAll(".exmbtn");for(var _mb=0;_mb<mbtns.length;_mb++){mbtns[_mb].addEventListener("click",function(){chgtype=this.getAttribute("data-chg");if(chgtype==="dt"){picked=null;goDate();}else if(chgtype==="t"){picked=new Date(chosen.date+"T00:00:00");goTime();}else if(chgtype==="memo"){enterMemo();}else{enterEdit();}});}' +
    'document.getElementById("exbackMenu").addEventListener("click",function(){hideSteps();document.getElementById("exPick").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exbackMemo").addEventListener("click",function(){showMenu();});' +
    'document.getElementById("exMemoGo").addEventListener("click",function(){realChange(document.getElementById("exdone4"));window.scrollTo(0,document.body.scrollHeight);});' +
    'document.getElementById("exbackEdit").addEventListener("click",function(){document.getElementById("exEdit").style.display="none";document.getElementById("exMenu").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exEditGo").addEventListener("click",function(){if(chgtype==="dur"){realChange(document.getElementById("exdone3"));}else{var done=document.getElementById("exdone3");done.style.display="";done.textContent=summaryText();}window.scrollTo(0,document.body.scrollHeight);});' +
    '})();</script>';
  return '<style>' + HOMECSS_ + css + '</style>' +
    '<div class="home"><div class="ex">' + numSec + pickSec + menuSec + dateSec + timeSec + editSec + memoSec + '</div></div>' + script;
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
  // 各営業日の売上に曜日を添える（例「7/1（火）」）。年は表示中データの today から取り、
  // 無ければ今の年で代用（per_day の日付は「月/日」で年が入っていないため）。
  var uyear_ = parseInt(String(d.today || '').slice(0, 4), 10) || (new Date()).getFullYear();
  var UWD_ = ['日', '月', '火', '水', '木', '金', '土'];
  // 台湾の祝日（月/日）。旧正月・端午・中秋は毎年ずれるので年ごとに書く（毎年更新すること）。
  var TW_HOL_ = {
    2026: ['1/1', '2/16', '2/17', '2/18', '2/19', '2/20', '2/28',
           '4/4', '4/5', '5/1', '6/19', '9/25', '10/10']
  };
  var holList = TW_HOL_[uyear_] || [];
  var perRows = (d.per_day || []).map(function (x) {
    var p = String(x.date).split('/');
    var wd = '';
    var mark = false;   // 土曜または台湾の祝日は背景色を変えて目立たせる
    if (p.length === 2) {
      var dt = new Date(uyear_, parseInt(p[0], 10) - 1, parseInt(p[1], 10));
      wd = '（' + UWD_[dt.getDay()] + '）';
      mark = (dt.getDay() === 6) || (holList.indexOf(x.date) >= 0);
    }
    return '<tr' + (mark ? ' class="sat"' : '') + '><td>' + esc_(x.date) + wd + '</td><td class="num">' + comma_(x.total) + '</td></tr>';
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
      '<li>今月の初日がまだTimeTreeに書かれていなければ、TimeTreeとプロセルの先月ぶんに記入ミス・書き漏れがないか全部確認し、あれば直す。</li>' +
      '<li>プロセル表・TimeTreeへの記入や修正が自動で判断できないときは、開発者のLINEに通知が飛ぶ。</li>' +
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
'  .upertbl tr.sat td { background:rgba(56,132,255,.20); font-weight:700; }' +
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
function unaCard_(r, kind, dev) {
  var name = r.nm || '🆕 新規（番号未設定）';
  var tag = [r.nat, r.sex].filter(Boolean).join('・');
  var search = esc_(((name) + ' ' + (r.q || '')).toLowerCase());
  var sub = [tag, (r.read && r.read !== '—') ? r.read : '', '待ち' + (r.d || 0) + '日']
    .filter(Boolean).join('　/　');
  var full = esc_(JSON.stringify(r.full || []));
  var when = unaWhen_((r.full && r.full.length) ? r.full[r.full.length - 1].t : r.t);
  // ★2026-07-25：会話の小窓に「その場返信」を出すため、相手(cid)と「返信してよいか(canR)」を渡す。
  //   canR は開発者(dev)かつ事務所PCが返信OK(r.reply)にした会話の時だけ "1"。他の人・他の会話では空。
  var canR = (r.reply && r.cid && dev) ? '1' : '';
  var detail = '<button type="button" class="unadetail" data-nm="' + esc_(name) +
    '" data-sub="' + esc_(sub) + '" data-full="' + full +
    '" data-cid="' + esc_(r.cid || '') + '" data-reply="' + canR +
    '" data-sex="' + esc_(r.sex || '') + '">🔍 詳細（内容を見る）</button>';
  var link = r.url
    ? '<a class="unalink" target="_blank" rel="noopener" href="' + esc_(r.url) + '">💬 LINEを開く（返信する）</a>'
    : '';
  // ★アプリの中から直接LINEを返す欄（事務所PCが reply:true を立てたカードにだけ出す）。
  //   いま立つのは練習用カード（宛先＝オーナー本人）だけ。本物のお客さんのカードへ広げるのは
  //   練習で確かめてから。送ってよい相手かの判断は事務所PC(send_reply.py)が単独で保証する。
  // ★2026-07-25（ユーザー方針）：返信できる本物の画面（返信欄・絵文字・スタンプ・送るボタン）は
  //   「開発者(dev=1)だけ」に出す。スタッフ・幹部には出さず、情報を見るだけの一歩手前の画面のまま
  //   にする（これから対話式の返信画面を作り込む間、現場には押せる物を出さない）。＝dev を必須条件に足す。
  var box = (r.reply && r.cid && dev)
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
    ? cust.map(function (r) { return unaCard_(r, 'cust', dev); }).join('\n')
    : '';
  var oursCards = ours.length
    ? ours.map(function (r) { return unaCard_(r, 'ours', dev); }).join('\n')
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
      '<div class="unamhr">' +
        // ★文字の大きさ切り替え（小・中・大）。選ぶと端末に覚えて、次にどの会話を開いても同じ大きさで出す。
        '<div class="unafs">' +
          '<button type="button" class="unafsb" data-fs="sm">小</button>' +
          '<button type="button" class="unafsb" data-fs="md">中</button>' +
          '<button type="button" class="unafsb" data-fs="lg">大</button>' +
          '<button type="button" class="unafsb" data-fs="xl">特</button>' +
        '</div>' +
        '<button type="button" class="unamx" id="unaMx" aria-label="閉じる">&times;</button>' +
      '</div>' +
    '</div>' +
    '<div class="unamlog" id="unaMlog"></div>' +
    // ★2026-07-25：会話の下にその場返信欄を出す置き場所（開発者かつ返信OKの会話の時だけ中身が入る）。
    '<div class="unamreply" id="unaMreply"></div>' +
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
'var mreply=document.getElementById("unaMreply");' +
// ―― 会話の文字の大きさ（小・中・大）＝端末に覚えて、どの会話を開いても同じ大きさで出す ――
'var UNA_FS_KEY="sz_una_fs";' +
'function unaGetFs(){ try{ var v=localStorage.getItem(UNA_FS_KEY); return (v==="sm"||v==="lg"||v==="xl")?v:"md"; }catch(e){ return "md"; } }' +
'function unaApplyFs(sz){ if(sz!=="sm"&&sz!=="lg"&&sz!=="xl") sz="md";' +
'  if(mlog) mlog.setAttribute("data-fs",sz);' +
'  var bs=document.querySelectorAll(".unafsb");' +
'  for(var i=0;i<bs.length;i++){ bs[i].classList.toggle("on", bs[i].getAttribute("data-fs")===sz); } }' +
'document.addEventListener("click",function(e){' +
'  var b=e.target&&e.target.closest?e.target.closest(".unafsb"):null; if(!b) return;' +
'  var sz=b.getAttribute("data-fs"); try{ localStorage.setItem(UNA_FS_KEY,sz); }catch(ig){}' +
'  unaApplyFs(sz);' +
'});' +
// ―― 返信の箱：打つ行が増えるほど自動で下に伸ばす（打った文が全部見えるように）――
'function unaGrow(t){ if(!t) return; t.style.height="auto"; t.style.height=Math.min(t.scrollHeight,340)+"px"; }' +
'document.addEventListener("input",function(e){' +
'  var t=e.target; if(t&&t.classList&&t.classList.contains("unartext")) unaGrow(t); });' +
// ―― 中文翻訳ボタン：打った日本語を台湾中国語に訳して下の箱に出す（事務所PCで訳す・数秒）――
'document.addEventListener("click",function(e){' +
'  var b=e.target&&e.target.closest?e.target.closest(".unartrans"):null; if(!b) return;' +
'  var wrap=b.closest(".unareply"); if(!wrap) return;' +
'  var ta=wrap.querySelector(".unartext"), box=wrap.querySelector(".unartrbox"), zt=wrap.querySelector(".unartrtext");' +
'  var note=wrap.querySelector(".unarnote");' +
'  var text=(ta&&ta.value||"").trim();' +
'  if(!text){ if(note){ note.className="unarnote ng"; note.textContent="先に日本語を打ってください。"; } return; }' +
'  if(box) box.style.display="block";' +
'  if(zt){ zt.value="翻訳中…しばらくお待ちください。"; unaGrow(zt); }' +
'  var idn=unaIdent_();' +
'  unaCall_({action:"submit",op:"translate",who:idn.who,role:idn.role,device:idn.device,' +
'    fields:JSON.stringify({text:text,gender:(wrap.getAttribute("data-sex")||"")})},' +
'    function(r){' +
'      if(!r||!r.ok){ if(zt){ zt.value=(r&&r.error)||"翻訳できませんでした。"; unaGrow(zt); } return; }' +
'      var tries=0;' +
'      (function poll(){ tries++;' +
'        unaCall_({action:"status",id:r.id},function(st){' +
'          if(st&&st.status==="done"){ if(zt){ zt.value=st.result||""; unaGrow(zt); } return; }' +
'          if(st&&st.status==="error"){ if(zt){ zt.value=st.result||"翻訳できませんでした。"; unaGrow(zt); } return; }' +
'          if(tries>60){ if(zt){ zt.value="事務所のパソコンから返事がありません。"; unaGrow(zt); } return; }' +
'          setTimeout(poll,1200); }); })();' +
'    });' +
'});' +
// ―― この中文を送る：訳した中国語を、いつもの送信（押した瞬間に出す）で送る ――
'document.addEventListener("click",function(e){' +
'  var b=e.target&&e.target.closest?e.target.closest(".unartrsend"):null; if(!b) return;' +
'  var wrap=b.closest(".unareply"); if(!wrap) return;' +
'  var ta=wrap.querySelector(".unartext"), zt=wrap.querySelector(".unartrtext"), box=wrap.querySelector(".unartrbox");' +
'  var zh=(zt&&zt.value||"").trim();' +
'  if(!zh||zh.indexOf("翻訳中")===0){ return; }' +
'  if(ta){ ta.value=zh; unaGrow(ta); }' +
'  if(box) box.style.display="none";' +
'  unaSend_(wrap);' +
'});' +
'function escH(s){return String(s==null?"":s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];});}' +
'function openDetail(btn){' +
'  if(!mask||!mlog)return;' +
'  var full=[]; try{ full=JSON.parse(btn.getAttribute("data-full")||"[]"); }catch(e){ full=[]; }' +
'  if(mnm) mnm.textContent=btn.getAttribute("data-nm")||"";' +
'  if(msub) msub.textContent=btn.getAttribute("data-sub")||"";' +
'  var lastShop=-1; for(var li=0;li<full.length;li++){ if(full[li].w!=="客") lastShop=li; }' +
'  mlog.innerHTML=full.length? full.map(function(m,idx){' +
'    var side=(m.w==="客"?"cli":"shop");' +
// ★お客さんが「こちらの最後の送信」を読んでいたら、その下だけに「既読」を出す（LINEと同じ）。
'    var seen=(idx===lastShop&&m.seen)?"<span class=\\"unaseen\\">既読</span>":"";' +
'    return "<div class=\\"unamsgrow "+side+"\\">"+' +
'      "<div class=\\"unamsg "+side+"\\">"+escH(m.x)+"</div>"+' +
'      "<span class=\\"unats\\">"+seen+escH(m.t)+"</span></div>";' +
'  }).join(""):"<div class=\\"unamnote\\">本文がありません（画像・スタンプのみ等）。</div>";' +
// ★会話の下に「その場返信」欄を出す（開発者かつ返信OKの会話だけ＝data-reply=="1"）。
// カード側の返信欄と同じ .unareply なので、既存の送信処理(unaSend_)がそのまま効く。
'  if(mreply){' +
'    var canR=(btn.getAttribute("data-reply")==="1"), cid=btn.getAttribute("data-cid")||"", nm=btn.getAttribute("data-nm")||"", sex=btn.getAttribute("data-sex")||"";' +
'    mreply.innerHTML=(canR&&cid)?' +
'      "<div class=\\"unareply\\" data-cid=\\""+escH(cid)+"\\" data-nm=\\""+escH(nm)+"\\" data-sex=\\""+escH(sex)+"\\">"+' +
'        "<textarea class=\\"unartext\\" rows=\\"2\\" maxlength=\\"1000\\" placeholder=\\"ここに返信を打つと、お店の公式LINEから送ります\\"></textarea>"+' +
'        "<div class=\\"unastamps\\"></div>"+' +
'        "<div class=\\"unarrow\\">"+' +
'          "<button type=\\"button\\" class=\\"unartrans\\">🀄 中文翻訳</button>"+' +
'          "<span class=\\"unarnote\\"></span>"+' +
'          "<button type=\\"button\\" class=\\"unaremoji\\">😊 絵文字</button>"+' +
'          "<button type=\\"button\\" class=\\"unarpicker\\">😀 スタンプ</button>"+' +
'          "<button type=\\"button\\" class=\\"unarsend\\">送る</button></div>"+' +
// ★中文翻訳を押すと出る箱（中国語訳＋この中文を送る）。ふだんは隠しておく。
'        "<div class=\\"unartrbox\\" style=\\"display:none\\">"+' +
'          "<textarea class=\\"unartrtext\\" readonly placeholder=\\"ここに中国語訳が出ます\\"></textarea>"+' +
'          "<button type=\\"button\\" class=\\"unartrsend\\">この中文を送る</button></div>"+' +
'      "</div>":"";' +
// 自作スタンプ（画像）を返信欄の置き場所に並べる。カード側と同じ処理をそのまま呼ぶ。
'    if(canR&&cid) paintStamps_();' +
'  }' +
'  unaApplyFs(unaGetFs());' +   // 覚えている文字の大きさをこの会話にも当てる
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
'    if(note){ note.className="unarnote"; note.textContent="送信中…"; }' +
'    var idn=unaIdent_();' +
// ★押した瞬間に自分の吹き出しを出す（LINEと同じ＝体感すぐ）。実際に届いたら下の印を「送信済み」に変える。
'    var rw=null, lg=document.getElementById("unaMlog");' +
'    if(lg && wrap.closest && wrap.closest(".unamodal")){' +
'      rw=document.createElement("div"); rw.className="unamsgrow shop";' +
'      rw.innerHTML="<div class=\\"unamsg shop\\">"+escH(text)+"</div><span class=\\"unats\\"><span class=\\"unasend0\\">送信中…</span></span>";' +
'      lg.appendChild(rw); lg.scrollTop=lg.scrollHeight; }' +
'    if(ta){ ta.value=""; unaGrow(ta); }' +
'    function mark(t,c){ if(!rw) return; var s=rw.querySelector(".unats"); if(s) s.innerHTML=c?("<span class=\\""+c+"\\">"+t+"</span>"):t; }' +
'    unaCall_({action:"submit",op:"line_reply",who:idn.who,role:idn.role,device:idn.device,' +
'      fields:JSON.stringify({chat:cid,text:text,title:nm})},' +
'      function(r){' +
'        if(!r||!r.ok){ if(note){ note.className="unarnote ng"; note.textContent=(r&&r.error)||"送れませんでした。"; } mark("送れませんでした","unafail"); return; }' +
'        var tries=0;' +
'        (function poll(){' +
'          tries++;' +
'          unaCall_({action:"status",id:r.id},function(st){' +
'            if(st&&st.status==="done"){' +
'              if(note){ note.className="unarnote ok"; note.textContent=st.result||"送りました。"; } mark("送信済み・たった今",""); return; }' +
'            if(st&&st.status==="error"){' +
'              if(note){ note.className="unarnote ng"; note.textContent=st.result||"送れませんでした。"; } mark("送れませんでした","unafail"); return; }' +
'            if(tries>60){' +
'              if(note){ note.className="unarnote ng"; note.textContent="事務所のパソコンから返事がありません（見張りが動いているか確認してください）。"; } mark("未確認","unafail"); return; }' +
'            setTimeout(poll,1200);' +
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
'    background:var(--card); color:var(--ink); font:inherit; font-size:16px; resize:none;' +
// 打つ行が増えるほど自動で下に伸びる（打った文が全部見える）。伸びすぎたら中でスクロール。
'    box-sizing:border-box; min-height:52px; max-height:340px; overflow-y:auto; }' +
'  .unarrow{ display:flex; align-items:center; gap:10px; margin-top:8px; }' +
'  .unarnote{ flex:1; font-size:13px; font-weight:700; color:var(--sub); }' +
// 中文翻訳ボタン（絵文字の左・左寄せ）と、訳文の箱＋この中文を送る
'  .unartrans{ appearance:none; border:1px solid #b45309; background:#fffbeb; color:#b45309; font:inherit;' +
'    font-weight:800; font-size:14px; padding:8px 12px; border-radius:10px; cursor:pointer; }' +
'  .unartrbox{ margin-top:8px; }' +
'  .unartrtext{ width:100%; box-sizing:border-box; min-height:60px; max-height:300px; overflow-y:auto;' +
'    padding:10px 12px; border:1px solid #06c755; border-radius:10px; background:#f0fff4; color:#111;' +
'    font:inherit; font-size:16px; font-weight:700; resize:none; }' +
'  .unartrsend{ appearance:none; border:0; background:#06c755; color:#fff; font:inherit; font-weight:800;' +
'    font-size:15px; padding:11px 20px; border-radius:10px; cursor:pointer; margin-top:8px; }' +
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
// 文字サイズ切り替え（小・中・大）＝小窓の右上
'  .unamhr{ display:flex; align-items:center; gap:8px; flex:none; }' +
'  .unafs{ display:flex; gap:2px; background:var(--line); border-radius:9px; padding:2px; }' +
'  .unafsb{ appearance:none; border:0; background:none; font:inherit; font-weight:800; cursor:pointer;' +
'    padding:5px 10px; border-radius:7px; color:var(--sub); font-size:14px; line-height:1; }' +
'  .unafsb.on{ background:var(--card); color:var(--ink); box-shadow:0 1px 2px rgba(0,0,0,.15); }' +
'  .unamlog{ overflow-y:auto; padding:14px 16px; display:flex; flex-direction:column; gap:10px;' +
'    background:var(--bg); }' +
'  .unamsgrow{ display:flex; flex-direction:column; max-width:82%; }' +
'  .unamsgrow.cli{ align-self:flex-start; align-items:flex-start; }' +
'  .unamsgrow.shop{ align-self:flex-end; align-items:flex-end; }' +
'  .unamsg{ max-width:100%; padding:11px 14px; border-radius:16px; font-size:17px; line-height:1.55;' +
'    white-space:pre-wrap; overflow-wrap:anywhere; word-break:normal; color:var(--ink); }' +
// 覚えた文字サイズを会話の吹き出しに反映（小=14 / 中=17 / 大=21）
'  .unamlog[data-fs="sm"] .unamsg{ font-size:14px; }' +
'  .unamlog[data-fs="md"] .unamsg{ font-size:17px; }' +
'  .unamlog[data-fs="lg"] .unamsg{ font-size:21px; }' +
'  .unamlog[data-fs="xl"] .unamsg{ font-size:26px; }' +
// ★会話の文字は黒の太字＝読みやすく。黒が読めるよう吹き出しは明るい色（客=白／店=薄い緑・LINE風）。
'  .unamsg{ color:#111 !important; font-weight:700; }' +
'  .unamsg.cli{ background:#ffffff; border:1px solid #d7dbe3; border-bottom-left-radius:5px; }' +
'  .unamsg.shop{ background:#d6f5c8; border-bottom-right-radius:5px; }' +
'  .unats{ display:block; font-size:11.5px; color:var(--sub); opacity:.8; margin:3px 4px 0; }' +
'  .unaseen{ color:#06c755; font-weight:700; margin-right:5px; }' +
'  .unasend0{ color:var(--sub); }' +
'  .unafail{ color:#e5484d; font-weight:700; }' +
'  .unamnote{ color:var(--sub); font-size:15px; padding:8px; }' +
'  .unamreply{ padding:0 16px 12px; }' +
'  .unamreply .unareply{ margin-top:0; }';

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
// ★2026-07-22ユーザー指示：端末（スマホ）の画面幅に合わせて左右が必ず1画面に収まるようにする。
//   これまでは文字サイズ・余白がpx固定だったため、幅の広い端末では収まっても、幅の狭い端末では
//   はみ出して左右スクロールが必要だった。以下、幅に関わる値はすべて clamp(下限, ○vw, 従来値) に
//   して「広い端末では従来どおり／狭い端末では自動で少し縮む」形にする。vwの係数は幅380px前後で
//   従来値に達するよう決めているので、一般的な幅(390px以上)の端末では見た目が変わらない。
'  body{ background:var(--akibg); overflow-x:hidden; }' +
'  .akiwrap{ max-width:760px; margin:0 auto; padding:14px clamp(8px,3.6vw,14px) 40px; font-family:"Yu Gothic UI","Hiragino Sans",sans-serif; color:var(--akiink); overflow-x:hidden; }' +
'  .akibar{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; flex-wrap:wrap; }' +
// 施術室被り検出画面の「← 前に戻る」(.homelink)と同じ見た目に統一（2026-07-17ユーザー指示）。
'  .akihome{ flex:0 0 auto; font-size:.9rem; font-weight:700; color:var(--akiink); text-decoration:none;' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:10px; padding:10px 14px; }' +
'  .akihome:active{ transform:translateY(1px); }' +
'  .akigen{ flex:1 1 auto; min-width:0; color:var(--akisub); font-size:clamp(12px,4.2vw,16px); font-weight:700; text-align:right; }' +
'  .akiwrap h1{ font-size:clamp(18px,5.8vw,22px); margin:2px 0 2px; }' +
'  .akidatebar{ display:flex; flex-direction:column; gap:8px; margin-bottom:12px; }' +
// ★日付BOX＋今日/明日/今・来週/全期間を1行に収める（2026-07-17ユーザー指示）。
//   幅が本当に足りない端末だけ横スクロールで逃がす（折り返して2行にはしない）。
'  .akidaterow{ display:flex; align-items:center; gap:clamp(2px,1.1vw,5px); flex-wrap:nowrap; width:100%; }' +
'  .akidate{ font-family:inherit; font-size:clamp(11px,3.4vw,13px); font-weight:700; color:var(--akiink);' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:9px;' +
'    padding:9px 4px; flex:1 1 44px; min-width:44px; text-align:center; cursor:pointer; caret-color:transparent; }' +
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
'  .akipreset{ flex:0 1 auto; white-space:nowrap; font-family:inherit; font-size:clamp(11px,3.4vw,13px); font-weight:700;' +
'    color:var(--akisub); background:var(--akicard); border:1px solid var(--akiline); border-radius:9px;' +
'    padding:9px clamp(4px,2.6vw,11px); cursor:pointer; }' +
'  .akipreset.sm{ font-size:clamp(10px,3.2vw,12px); padding:8px clamp(3px,2.2vw,9px); }' +
'  .akipreset.on{ color:#fff; background:var(--akiprimary); border-color:var(--akiprimary); }' +
'  .akiwdrow{ display:flex; gap:8px; flex-wrap:wrap; width:100%; margin-top:8px; }' +
'  .akiwd{ font-family:inherit; font-size:clamp(13px,4.2vw,16px); font-weight:700; color:var(--akisub);' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:10px;' +
'    padding:11px clamp(9px,4.2vw,16px); cursor:pointer; }' +
'  .akiwd.on{ color:#fff; background:var(--akiprimary); border-color:var(--akiprimary); }' +
'  .akidurrow{ display:flex; gap:8px; flex-wrap:wrap; width:100%; margin-top:8px; }' +
'  .akidurbtn{ font-family:inherit; font-size:clamp(13px,4.2vw,16px); font-weight:700; color:var(--akisub);' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:10px;' +
'    padding:11px clamp(9px,4.2vw,16px); cursor:pointer; }' +
'  .akidurbtn.on{ color:#fff; background:var(--akiprimary); border-color:var(--akiprimary); }' +
'  .akirow.akidurhide, .akislot.akidurhide{ display:none; }' +
'  .akiday.akidatehide{ display:none; }' +
'  .akichips{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }' +
'  .akichip{ font-family:inherit; font-size:clamp(13px,4.5vw,17px); font-weight:700; color:var(--akisub);' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:10px;' +
'    padding:10px clamp(8px,4.2vw,16px); cursor:pointer; }' +
'  .akichip.on{ color:#fff; background:var(--akiprimary); border-color:var(--akiprimary); }' +
'  .akiday{ background:var(--akicard); border:1px solid var(--akiline); border-radius:14px;' +
'    padding:12px clamp(8px,3.6vw,14px); margin-bottom:12px; }' +
'  .akidh{ font-weight:800; font-size:clamp(19px,6.6vw,25px); border-bottom:1px solid var(--akiline);' +
'    padding-bottom:6px; margin-bottom:8px; }' +
'  .akiclosed{ color:#c33; font-weight:700; font-size:16px; }' +
'  .akisec.akihidden{ display:none; }' +
'  .akisl{ font-size:15px; font-weight:800; color:var(--akiprimary); margin:8px 0 6px; }' +
'  .akirow{ display:flex; align-items:center; gap:clamp(5px,2.1vw,8px); flex-wrap:wrap; padding:8px 0;' +
'    border-bottom:1px solid var(--akiline); font-size:clamp(13px,4.5vw,17px); }' +
'  .akirow:last-child{ border-bottom:none; }' +
'  .akitime{ font-weight:800; font-size:clamp(18px,6.3vw,24px); min-width:clamp(100px,37.4vw,142px); font-variant-numeric:tabular-nums; }' +
'  .akidur{ color:var(--akisub); font-size:clamp(18px,6.3vw,24px); font-weight:700; min-width:clamp(40px,14.7vw,56px); }' +
'  .akisep{ color:var(--akisub); font-weight:800; }' +
'  .akibadge{ display:inline-block; color:#fff; font-weight:700; font-size:clamp(14px,5vw,19px);' +
'    padding:4px clamp(7px,3.2vw,12px); border-radius:999px; white-space:nowrap; }' +
'  .akishift{ color:var(--akisub); font-size:clamp(12px,3.8vw,14.5px); font-weight:700; }' +
// ★2026-07-22ユーザー指示：部屋名の並びは横スクロールをやめ、入りきらない時は折り返す（左右に
//   スクロールしないと全部見えない状態を無くす）。
'  .akirooms{ display:flex; flex-wrap:wrap; gap:2px; flex:1 1 auto; min-width:0; padding-bottom:2px; }' +
'  .akiroom{ display:inline-block; flex:0 1 auto; color:#fff; font-weight:700; font-size:clamp(12px,3.7vw,14px);' +
'    padding:1px 2px; border-radius:999px; white-space:nowrap; max-width:100%; overflow:hidden; text-overflow:ellipsis; }' +
'  .akiroom.lg{ font-size:clamp(13px,4.2vw,16px); padding:4px clamp(8px,3.4vw,13px); }' +
'  .akinorooms{ color:#c33; font-size:clamp(12px,3.8vw,14.5px); white-space:nowrap; }' +
'  .akislot{ display:inline-block; background:var(--akibg); border:1px solid var(--akiline);' +
'    border-radius:8px; padding:5px clamp(7px,3.2vw,12px); font-size:clamp(14px,5vw,19px); font-weight:700; font-variant-numeric:tabular-nums; }' +
'  .akislot b{ font-weight:700; color:var(--akisub); margin-left:3px; font-size:clamp(12px,3.9vw,15px); }' +
'  .akinone{ color:#c33; font-size:clamp(12px,3.9vw,15px); padding:4px 0; }';

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

/** 自作Claudeツール＝別のチャットのClaudeに言う「合言葉」を並べる画面（純JS）。タップかコピーで写して、
 *  そのまま別のチャットに貼れば、説明なしでその作業ができる。開発URL(?dev=1)専用・管理者用グループ。
 *  ★合言葉を増やす時は下の KOTOBA 配列に1行足すだけ（t=合言葉／d=何ができるか）。 */
function renderClaudeToolsPage_(base, staff, dev) {
  var KOTOBA = [
    { t: 'インスタを操作したい',
      d: 'インスタのDM返信・投稿・ストーリーズ・投稿のアーカイブなどを操作（3アカウント／ログイン使い回し）' },
    { t: '画像のURLをつくりたい',
      d: '画像（料金表・お支払い方法など）を、お客様がそのまま開ける短いリンク（x.gd/〇〇）に変える' }
  ];
  var CSS =
    '  .ubar { display:flex; align-items:center; gap:12px; margin:0 0 4px; }' +
    '  .uhome { flex:0 0 auto; font-size:.9rem; font-weight:700; color:var(--ink,#1c2430); text-decoration:none;' +
    '    background:var(--card,#fff); border:1px solid var(--line,#e6e9ef); border-radius:10px; padding:10px 14px; }' +
    '  .uhome:active { transform:translateY(1px); }' +
    '  .cttwrap { max-width:720px; margin:0 auto; }' +
    '  .cttwrap h1 { font-size:1.5rem; margin:6px 2px 6px; color:#fff; }' +
    '  .cttnote { color:#cfe3ec; font-size:1rem; line-height:1.6; margin:0 2px 14px; }' +
    '  .cttcard { background:var(--card,#0f2f3d); border:1px solid rgba(255,255,255,.10); border-radius:16px;' +
    '    padding:14px 16px; margin:12px 0; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,.14); }' +
    '  .cttcard:active { transform:translateY(1px); }' +
    '  .cttt { font-size:1.35rem; font-weight:800; color:#fff; word-break:break-word; }' +
    '  .cttd { color:#dbe9f0; font-size:1rem; margin-top:6px; line-height:1.55; }' +
    '  .cttrow { display:flex; align-items:center; gap:10px; margin-top:10px; flex-wrap:wrap; }' +
    '  .cttcopy { background:#7c3aed; color:#fff; border:0; border-radius:999px; padding:8px 18px;' +
    '    font-size:.98rem; font-weight:800; cursor:pointer; }' +
    '  .cttok { color:#8ef0b5; font-size:.95rem; font-weight:700; }';
  var cards = '';
  for (var i = 0; i < KOTOBA.length; i++) {
    var k = KOTOBA[i];
    cards += '<div class="cttcard" onclick="cttCopy(this)" data-t="' + esc_(k.t) + '">' +
      '<div class="cttt">' + esc_(k.t) + '</div>' +
      '<div class="cttd">' + esc_(k.d) + '</div>' +
      '<div class="cttrow"><button type="button" class="cttcopy" onclick="event.stopPropagation();cttCopy(this)" data-t="' + esc_(k.t) + '">📋 コピー</button>' +
      '<span class="cttok"></span></div>' +
    '</div>';
  }
  var script = '(function(){' +
    'window.cttCopy=function(el){' +
      'var card=el; for(var k=0;k<4&&card&&!(card.className&&(""+card.className).indexOf("cttcard")>=0);k++)card=card.parentElement;' +
      'var t=(el.getAttribute&&el.getAttribute("data-t"))||(card&&card.getAttribute("data-t"))||"";' +
      'var ok=card?card.querySelector(".cttok"):null;' +
      'function done(){ if(ok){ ok.textContent="コピーしました ✓"; setTimeout(function(){ if(ok) ok.textContent=""; },2000);} }' +
      'function fb(){ try{ var ta=document.createElement("textarea"); ta.value=t; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); done(); }catch(e2){ if(ok) ok.textContent="コピーできませんでした（長押しで選んでください）"; } }' +
      'try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(done,fb); } else { fb(); } }catch(e){ fb(); }' +
    '};' +
  '})();';
  return '<style>' + CSS + '</style>' +
    backBar_(base, staff, dev) +
    '<div class="cttwrap">' +
      '<h1>🤖 自作Claudeツール</h1>' +
      '<div class="cttnote">Claudeに言う「合言葉」です。タップ（またはコピー）で写して、別のチャットのClaudeにそのまま貼ってください。説明なしでその作業ができます。</div>' +
      cards +
    '</div>' +
    '<script>' + script + '<\/script>';
}

/** 各種LINKページの描画（純JS・GAS API不使用）。②静的アプリのJSONP経由から呼ばれる
 *  （データは事務所PCが Googleシート「ズコLINK」タブを読んで links.json に書き出したもの＝
 *  export_links_super.py。GASは計算しない＝描くだけ）。
 *  ★2026-07-21：画面を1枚にした。以前は「案内名を押す→言語を選ぶ」の2段階だったが、案内名の
 *  すぐ下に言語ボタンを並べて、1画面で押せば即コピーできるようにした（ユーザー指示）。 */
function renderLinksPage_(d, base, staff, dev) {
  var topics = (d && d.topics) || [];
  var list = topics.length
    ? topics.map(lkTopicBlock_).join('')
    : '<div class="lknone">まだ案内リンクが登録されていません。</div>';

  return '' +
'<style>' + LKCSS_ + '</style>' +
'<div class="lkwrap">' +
  '<div class="lkbar">' +
    '<a class="lkhome" href="' + (base || '') + '?view=home' + roleSfx_(staff, dev) + '" target="_top">← TOPに戻る</a>' +
    '<span class="lkgen">生成: ' + esc_(d.generated_at || '—') + '</span>' +
  '</div>' +
  '<div class="lkhead"><h1>🔗 各種LINK</h1>' +
    '<span class="lkhint">言語を選ぶとURLがコピーされます</span></div>' +
  '<div id="lklist">' +
    list +
  '</div>' +
'</div>' +
LKSCRIPT_;
}

// 案内1件＝白い見出し（案内名）＋その下に言語ボタンを横並び（押すとURLをコピー）。
function lkTopicBlock_(topic) {
  var btns = (topic.links || []).map(lkLinkBtn_).join('');
  return '<div class="lktopic">' +
    '<div class="lktitle">' + esc_(topic.name || '') + '</div>' +
    '<div class="lklangbtns">' + btns + '</div>' +
  '</div>';
}

// 言語1つ＝上に大きなコピーボタン、その下に背の低い「プレビュー」（別画面で中身を確認）。
function lkLinkBtn_(lk) {
  var url = esc_(lk.url || '');
  return '<div class="lkcell">' +
    '<button type="button" class="lkbtn" data-url="' + url + '">' +
      '<span class="lklang">' + esc_(lk.lang || '') + '</span>' +
      '<span class="lkcopy"></span>' +
    '</button>' +
    '<a class="lkprev" href="' + url + '" target="_blank" rel="noopener">プレビュー</a>' +
  '</div>';
}

// クリップボードへのコピー＝navigator.clipboard（httpsのみ有効）優先、使えない端末は
// textarea+execCommandへ自動で切り替える（LINE内ブラウザ等の古い実装向けフォールバック）。
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
'  .lkhome{ flex:0 0 auto; font-size:.9rem; font-weight:800; color:var(--akiink); text-decoration:none;' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:10px; padding:10px 14px; }' +
'  .lkhome:active{ transform:translateY(1px); }' +
'  .lkgen{ flex:0 0 auto; color:var(--akisub); font-size:15px; font-weight:800; text-align:right; }' +
// 見出し「🔗 各種LINK」と、その右に説明（言語を選ぶと…）を並べる（2026-07-21ユーザー指示）。
'  .lkhead{ display:flex; align-items:baseline; flex-wrap:wrap; gap:12px; margin-bottom:14px; }' +
'  .lkwrap h1{ font-size:24px; margin:2px 0; font-weight:800; }' +
'  .lkhint{ color:#ffb3d9; font-size:16px; font-weight:800; }' +
// 案内1件のまとまり＝白い見出し＋言語ボタン（1画面に並ぶので間隔をあけて区切る）。
'  .lktopic{ margin-bottom:28px; }' +
'  .lkcell{ display:flex; flex-direction:column; gap:8px; flex:1 1 140px; min-width:140px; }' +
'  .lkprev{ display:block; text-align:center; font-size:15px; font-weight:800; color:#1d4ed8;' +
'    text-decoration:none; background:#ffffff; border:1px solid #d7dee8; border-radius:12px;' +
'    padding:6px 10px; }' +
'  .lkprev:active{ transform:translateY(1px); }' +
'  .lktitle{ font-size:28px; font-weight:800; margin-bottom:4px; line-height:1.3; color:#fff; }' +
'  .lklangbtns{ display:flex; flex-direction:row; flex-wrap:wrap; gap:14px; margin-top:10px; }' +
// ★言語ボタンは白背景＋濃い青文字（2026-07-18ユーザー指定＝白ベースにしてほしい）。
//   `appearance:none`（＋Safari/LINE内蔵ブラウザ向けに`-webkit-appearance:none`）は端末標準の
//   ボタン装飾を消して指定した色を確実に出すためのもの（既存の`.unadetail`等と同じ作法）。
'  .lkbtn{ appearance:none; -webkit-appearance:none; font-family:inherit; display:flex;' +
'    flex-direction:column; align-items:center; font-weight:800;' +
'    justify-content:center; gap:2px; width:100%; color:#1d4ed8; background:#ffffff;' +
'    border:1px solid #d7dee8; border-radius:18px; padding:8px 10px; cursor:pointer;' +
'    box-shadow:0 4px 14px rgba(0,0,0,.18); }' +
'  .lkbtn:active{ transform:translateY(2px); }' +
'  .lklang{ font-size:30px; font-weight:800; }' +
'  .lkcopy{ font-size:15px; font-weight:800; color:#6b7280; text-align:center; line-height:1.3; white-space:nowrap; }' +
'  .lkcopy:empty{ display:none; }' +
'  .lkbtn.lkok{ background:#eafff1; border-color:#16a34a; }' +
'  .lkbtn.lkok .lklang, .lkbtn.lkok .lkcopy{ color:#16a34a; }' +
'  .lknone{ color:#c33; font-size:16px; font-weight:800; padding:8px 0; }';

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
'function submitMoveStaff_(cal,evid,newFruit,onDone){' +
'  var idn=szIdent_();' +
'  callGas_("uiSubmitMoveStaff",[cal,evid,newFruit,idn.who,idn.device],"submit",' +
'    {op:"movestaff",who:idn.who,role:idn.role,device:idn.device,' +
'     fields:JSON.stringify({cal:cal,event:evid,new_fruit:newFruit})}, onDone);' +
'}' +
'function statusCheck_(id,onDone){' +
'  callGas_("uiStatus",[id],"status",{id:id}, onDone);' +
'}' +
'function waitStaffDone_(id,st,nf){ var tries=0;' +
'  var iv=setInterval(function(){ tries++;' +
'    statusCheck_(id,function(r){' +
'      if(r && r.status==="done"){ clearInterval(iv); if(st){ st.className="mvstatus ok"; st.textContent="\\u2705 "+((r.result)||("\\u62c5\\u5f53\\u3092"+nf+"\\u3078\\u5909\\u3048\\u307e\\u3057\\u305f")); } setTimeout(function(){ location.reload(); },900); }' +
'      else if(r && r.status==="error"){ clearInterval(iv); if(st){ st.className="mvstatus err"; st.textContent="\\u26a0\\ufe0f "+((r.result)||"\\u5931\\u6557\\u3057\\u307e\\u3057\\u305f"); } }' +
'      else if(tries>40){ clearInterval(iv); if(st){ st.className="mvstatus err"; st.textContent="\\u26a0\\ufe0f \\u6642\\u9593\\u5207\\u308c\\u3002\\u4e8b\\u52d9\\u6240PC\\u306e\\u5b9f\\u884c\\u4fc2\\u3092\\u78ba\\u8a8d\\u3057\\u3066\\u304f\\u3060\\u3055\\u3044\\u3002"; } }' +
'    });' +
'  }, 1500); }' +
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
'  if(t.classList&&t.classList.contains("smvbtn")){' +
'    if(t.disabled) return;' +
'    var mv=t; while(mv&&!(mv.classList&&mv.classList.contains("mv"))) mv=mv.parentNode; if(!mv) return;' +
'    var cal=t.getAttribute("data-cal"), evid=t.getAttribute("data-ev");' +
'    var nf=t.getAttribute("data-newfruit"), nm=t.getAttribute("data-name")||"";' +
'    var swho=t.getAttribute("data-who")||"", stime=t.getAttribute("data-time")||"";' +
'    var of=t.getAttribute("data-oldfruit")||"", onm=t.getAttribute("data-oldname")||"";' +
'    if(!cal||!evid){ ccPopup_("この予約のIDが取れず担当を変えられません", false); return; }' +
'    ccPopup_(ccH_(swho)+"の予約の担当を<br>"+ccRoomBadge_(of+onm, staffColor_(of))+"から<br>"+ccRoomBadge_(nf+nm, staffColor_(nf))+"へ<br>変えます。<br>よろしいですか？", true, function(){' +
'      mvStaffOverlay_(swho,stime,of,onm,nf,nm);' +
'      submitMoveStaff_(cal,evid,nf,function(r){' +
'        if(r && r.ok){ waitStaffDoneFinish_(r.id,evid,nf,nm); }' +
'        else { mvOverlayHide_(); ccPopup_("⚠️ 担当を変えられませんでした：もう一度お試しください。二度続けてこのエラーがでた場合は、Ryuさんに連絡してください。", false); }' +
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
'      else if(tries>=90){ mvOverlayHide_(); ccPopup_("⚠️ 移動できませんでした（時間切れ）：事務所のパソコンの見張りが動いているか確認して、もう一度お試しください。", false); }' +
'      else { setTimeout(chk,250); } });' +
'  }' +
'  setTimeout(chk,250); }' +
// ★（旧・楽観的更新の部品。現在は未使用だが残置）小さなトースト＋裏での確定確認＋失敗時のロールバック。
// ―― 担当の異動：部屋移動と全く同じ流れ（全画面「変更中」→完了「✓」＋戻る→最新一覧）――
'function mvStaffOverlay_(who,mtime,of,onm,nf,nm){ var ov=document.getElementById("mvWaitOverlay");' +
'  if(!ov){ ov=document.createElement("div"); ov.id="mvWaitOverlay";' +
'    ov.style.cssText="position:fixed;inset:0;z-index:9999;background:#2C7A99;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center;";' +
'    document.body.appendChild(ov); }' +
'  var t=(mtime||"").split("-")[0];' +
'  ov.innerHTML="<div style=\\"font-size:66px;margin-bottom:20px;\\">⏳</div>"+' +
'    "<div style=\\"color:#eaf3f7;font-size:22px;line-height:1.6;margin-bottom:14px;\\">"+(who?who:"")+(t?"　"+t+"の予約":"")+"</div>"+' +
'    "<div style=\\"color:#fff;font-size:33px;font-weight:800;line-height:1.5;margin-bottom:22px;\\">担当を「"+of+onm+"」から「"+nf+nm+"」へ<br>変更中です</div>"+' +
'    "<div style=\\"color:#eaf3f7;font-size:20px;line-height:1.8;max-width:420px;\\">タイムツリーへの書き込みが完了したら自動で画面が切り替わりますので、しばらくお待ちください。</div>";' +
'  return ov; }' +
'function showStaffDoneOverlay_(nf,nm){ var ov=document.getElementById("mvWaitOverlay");' +
'  if(!ov){ ov=document.createElement("div"); ov.id="mvWaitOverlay"; document.body.appendChild(ov); }' +
'  ov.style.cssText="position:fixed;inset:0;z-index:9999;background:#16a34a;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center;";' +
'  ov.innerHTML="<div style=\\"font-size:92px;margin-bottom:16px;\\">✓</div>"+' +
'    "<div style=\\"color:#fff;font-size:35px;font-weight:800;line-height:1.5;margin-bottom:26px;\\">担当を「"+nf+nm+"」へ<br>変更が完了しました</div>"+' +
'    "<button type=\\"button\\" id=\\"mvBackBtn\\" style=\\"font:inherit;font-size:1.3rem;font-weight:800;color:#16a34a;background:#fff;border:0;border-radius:12px;padding:14px 26px;cursor:pointer;\\">被り検出画面に戻る</button>";' +
'  document.getElementById("mvBackBtn").addEventListener("click",function(){ try{ window.__keepMvOverlay=false; }catch(e3){} mvOverlayHide_(); });' +
'  return ov; }' +
// ★共通ルール(2026-07-31 オーナー決定)：スーパーズコAppのエラーは「小さな警告」で統一する（大きな全画面は出さない）。
//   成功は大きな画面(緑)のままでよいが、失敗は必ず小さな警告(ccPopup_)で出す。
'function waitStaffDoneFinish_(id,evid,nf,nm){ var tries=0;' +
'  function chk(){ tries++;' +
'    statusCheck_(id,function(r){ var s=(r&&r.status)||"";' +
'      if(s==="done"){ try{ window.__movedOut=window.__movedOut||{}; window.__movedOut[evid]=1; }catch(e){} showStaffDoneOverlay_(nf,nm);' +
'        try{ window.__keepMvOverlay=true; }catch(e2){} doneRefreshFast_(); }' +
'      else if(s==="error"||s==="failed"){ mvOverlayHide_(); ccPopup_("⚠️ 担当を変えられませんでした：もう一度お試しください。二度続けてこのエラーがでた場合は、Ryuさんに連絡してください。", false); }' +
'      else if(tries>=90){ mvOverlayHide_(); ccPopup_("⚠️ 処理が時間切れで失敗しました。Ryuさんに連絡してください", false); }' +
'      else { setTimeout(chk,250); } });' +
'  }' +
'  setTimeout(chk,250); }' +
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
'    var s=document.createElement("script"); s.src=EXEC_URL_+"?action=data&name=events.json&callback="+cb+"&cb="+Date.now();' +
'    s.onerror=function(){ if(fired) return; fired=true; if(tries>=60){ doneRefresh_(); } else { setTimeout(chk,1000); } };' +
'    document.body.appendChild(s); }' +
'  setTimeout(chk,1000);' +
'}' +
'})();</scr' + 'ipt>';

// L⇔T予約照合ページ用スタイル（自己完結・ダーク/ライト対応・スマホ第一）。
var LTCSS_ =
'  :root{ --card:#ffffff; --ink:#0f172a; --sub:#64748b; --line:#e2e8f0; --add:#d97706; }' +
'  @media (prefers-color-scheme:dark){ :root{ --card:#131c2e; --ink:#e8eef7; --sub:#94a3b8; --line:#26324a; } }' +
'  *{ box-sizing:border-box; }' +
'  body{ margin:0; background:#2C7A99; color:var(--ink);' +
'    font-family:"Segoe UI","Yu Gothic UI","Hiragino Sans",system-ui,sans-serif; line-height:1.5; }' +
'  .lwrap{ max-width:640px; margin:0 auto; padding:12px 12px 40px; }' +
'  .lbar{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:6px; }' +
'  .lhome{ flex:0 0 auto; color:var(--ink); text-decoration:none; font-weight:700; font-size:14px;' +
'    background:var(--card); border:1px solid var(--line); border-radius:10px; padding:9px 14px; }' +
'  .lgen{ color:rgba(255,255,255,.85); font-size:12px; }' +
'  h1{ color:#fff; font-size:1.7rem; font-weight:900; margin:6px 0 14px; }' +
'  .lcnt{ color:#ff8fb3; font-size:1.4em; font-weight:900; }' +
'  #lq{ width:100%; padding:11px 12px; border:1px solid var(--line); border-radius:10px;' +
'    background:var(--card); color:var(--ink); font-size:15px; margin-bottom:14px; }' +
'  .lcard{ background:var(--card); border:1px solid var(--line); border-left:4px solid var(--add);' +
'    border-radius:12px; padding:11px 13px; margin-bottom:22px; box-shadow:0 1px 3px rgba(0,0,0,.15); }' +
'  .lhead{ margin-bottom:2px; }' +
'  .lcode{ color:var(--sub); font-weight:700; font-size:1.3rem; margin-right:6px; }' +
'  .lname{ font-weight:800; font-size:2rem; }' +
'  .ldtwrap{ margin-top:6px; overflow:hidden; }' +
'  .ldtin{ display:inline-flex; align-items:center; gap:8px; flex-wrap:nowrap; white-space:nowrap; transform-origin:left top; }' +
'  .ldtcell{ display:flex; align-items:center; gap:6px; }' +
'  .lbadge2{ flex:0 0 auto; display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:8px; color:#fff; padding:4px 5px; line-height:1.1; }' +
'  .lbadge2 .b1{ font-size:.9rem; font-weight:800; letter-spacing:.02em; }' +
'  .lbadge2 .b2{ font-size:.74rem; font-weight:700; }' +
'  .lbadge2.line{ background:#06c755; }' +
'  .lbadge2.tt{ background:#3b82f6; }' +
'  .ldtdt{ display:flex; flex-direction:column; line-height:1.1; }' +
'  .ldtd{ font-size:.92rem; font-weight:800; white-space:nowrap; }' +
'  .ldtt{ font-size:1.6rem; font-weight:900; letter-spacing:.02em; white-space:nowrap; }' +
'  .ldtdiff{ color:#ff5fa2; }' +
'  .ldtnone{ color:#111; background:#fff; font-size:1.2rem; font-weight:900; padding:0 6px; border-radius:7px; white-space:nowrap; }' +
'  .ltroomx{ color:#ff5fa2; font-size:1.6rem; font-weight:900; white-space:nowrap; }' +
'  .lmeta{ display:flex; align-items:stretch; gap:9px; margin:8px 0 14px; }' +
'  .ltag{ flex:0 0 auto; min-width:3.6em; background:#312e81; color:#c7d2fe; font-size:.74rem;' +
'    font-weight:700; border-radius:8px; padding:8px 6px; display:flex; align-items:center;' +
'    justify-content:center; text-align:center; line-height:1.25; letter-spacing:.04em; }' +
'  .ltxt{ flex:1 1 auto; font-size:1.5rem; font-weight:700; display:flex; align-items:center; }' +
'  .lconv{ border:2px solid #06C755; border-radius:12px; overflow:hidden; margin-top:16px; }' +
'  .lconvh{ display:flex; flex-direction:row; align-items:center; justify-content:space-between;' +
'    gap:10px; background:#fff; padding:9px 10px; }' +
'  .lconvlab{ font-size:1.33rem; font-weight:900; color:#06C755; }' +
'  .lqline{ flex:0 0 auto; text-align:center; background:#06C755; color:#fff; font-weight:800;' +
'    font-size:1.2rem; line-height:1.25; text-decoration:none; border-radius:11px; padding:11px 15px; }' +
'  .lconvb{ background:#06C755; padding:11px 10px 6px; }' +
'  .lqt{ font-size:1.15rem; color:rgba(255,255,255,.97); font-weight:700; margin:0 2px 3px; }' +
'  .lqt.s{ text-align:right; }' +
'  .lqrow{ display:flex; margin-bottom:9px; }' +
'  .lqrow.s{ justify-content:flex-end; }' +
'  .lqb{ max-width:80%; font-size:1.12rem; padding:9px 13px; }' +
'  .lqb.c{ background:#fff; color:#0f172a; border:1px solid #dbe3ea; border-radius:14px 14px 14px 3px; }' +
'  .lqb.s{ background:#0b6e3b; color:#fff; border-radius:14px 14px 3px 14px; }' +
'  .lqnone{ color:var(--sub); font-size:13px; padding:6px 2px; }' +
'  .lempty{ text-align:center; color:#fff; padding:26px; font-weight:700; }' +
'  .loksec{ margin-top:14px; background:var(--card); border:1px solid var(--line); border-radius:12px; padding:4px 12px; }' +
'  .loksec summary{ cursor:pointer; font-weight:800; padding:10px 0; }' +
'  .loksec table{ width:100%; border-collapse:collapse; font-size:12.5px; }' +
'  .loksec th,.loksec td{ text-align:left; padding:6px 6px; border-bottom:1px solid var(--line); vertical-align:top; }' +
'  .loksec th{ color:var(--sub); font-weight:700; } .loksec td.ttc{ color:var(--sub); }' +
'  .lhidden{ display:none!important; }';

// L⇔T照合ページの絞り込み（区分ボタン＋名前/番号の検索）。
var LTSCRIPT_ =
'<script>(function(){' +
'var q=document.getElementById("lq"); if(!q) return;' +
'var cards=[].slice.call(document.querySelectorAll(".lcard"));' +
'function apply(){' +
'  var kw=(q.value||"").trim().toLowerCase();' +
'  cards.forEach(function(c){' +
'    var okK=(!kw||(c.getAttribute("data-search")||"").indexOf(kw)>=0);' +
'    c.classList.toggle("lhidden",!okK);' +
'  });' +
'}' +
'q.addEventListener("input",apply);' +
'})();</scr' + 'ipt>';

// ★予約の行(LINE予約/TimeTree予約と日時)を、スマホの幅いっぱいまで自動で最大化する
//   （一行に収まる範囲で、中身の自然な幅と枠の幅を測って拡大＝どの機種でも常に最大）。
var LTFIT_SCRIPT_ =
'<script>(function(){' +
'window.szLtFit_=function(root){' +
'  var ins=(root||document).querySelectorAll(".ldtin");' +
'  for(var i=0;i<ins.length;i++){' +
'    var el=ins[i]; el.style.transform="none"; el.parentElement.style.height="";' +
'    var p=el.parentElement; if(!p.clientWidth||!el.offsetWidth) continue;' +
'    var k=p.clientWidth/el.offsetWidth; if(k>1.9)k=1.9; if(k<0.8)k=0.8;' +
'    el.style.transform="scale("+k.toFixed(3)+")";' +
'    p.style.height=Math.ceil(el.getBoundingClientRect().height)+"px";' +
'  }' +
'};' +
'window.szLtFit_();' +
'setTimeout(window.szLtFit_,60); setTimeout(window.szLtFit_,250);' +
'window.addEventListener("resize",function(){ if(window.szLtFit_) window.szLtFit_(); });' +
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
// ★戻るボタン（← 前に戻る）＝スーパーズコ全画面共通。HOMECSS_ に置いて、予約入力など
//   HOMECSS_ だけを読む画面でも必ずボタンとして見えるようにする（2026-08-01）。
'  .ubar { display:flex; align-items:center; gap:12px; margin:6px 0 10px; }' +
'  .uhome { flex:0 0 auto; font-size:1rem; font-weight:800; color:var(--ink); text-decoration:none;' +
'    background:#fff; border:1px solid var(--line); border-radius:999px; padding:11px 20px;' +
'    box-shadow:0 4px 12px rgba(0,0,0,.10); }' +
'  .uhome:active { transform:translateY(1px); }' +
// タイルは2列グリッドのまま、各タイル内を左アイコン／右文字の横並びに変更（2026-07-16）。
// 文字は最大2行まで自動折返し（-webkit-line-clamp:2）。1行に収まる短い文言はそのまま1行で出る。
// ★開発版(?dev=1)の「管理者用／実務者用／開発者用」の3つの大ボタンと、その中の戻るボタン（PC版と同じ見た目）。
'  .rolemenu { display:flex; flex-direction:column; gap:14px; }' +
'  .rolebtn { display:flex; flex-direction:row; align-items:center; gap:14px; text-align:left;' +
'    color:var(--ink); cursor:pointer; background:var(--card); border:1px solid var(--line);' +
'    border-radius:18px; padding:22px 18px; box-shadow:0 6px 18px rgba(0,0,0,.09); position:relative;' +
'    overflow:hidden; width:100%; transition:transform .12s ease, box-shadow .12s ease; }' +
'  .rolebtn::before { content:""; position:absolute; left:0; top:0; bottom:0; width:8px; }' +
'  .rolebtn.kanri::before { background:#f59e0b; }' +
'  .rolebtn.jitsumu::before { background:#16a34a; }' +
'  .rolebtn.kaihatsu::before { background:#6366f1; }' +
'  .rolebtn:active { transform:translateY(2px); }' +
'  @media (hover:hover){ .rolebtn:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(0,0,0,.14); } }' +
'  .ricon { flex:none; width:52px; height:52px; border-radius:13px; font-size:30px; display:grid; place-items:center; }' +
'  .rolebtn.kanri .ricon { background:rgba(245,158,11,.16); }' +
'  .rolebtn.jitsumu .ricon { background:rgba(22,163,74,.15); }' +
'  .rolebtn.kaihatsu .ricon { background:rgba(99,102,241,.15); }' +
'  .rname { flex:1; min-width:0; font-size:1.6rem; font-weight:900; }' +
'  .rcount { flex:none; color:var(--sub); font-size:.95rem; font-weight:700; }' +
'  .backbar { margin:0 0 16px; }' +
'  .backbtn { display:inline-flex; align-items:center; gap:6px; cursor:pointer; background:var(--card);' +
'    color:var(--ink); border:1px solid var(--line); border-radius:999px; padding:9px 18px;' +
'    font-size:1rem; font-weight:800; box-shadow:0 4px 12px rgba(0,0,0,.08); }' +
'  .backbtn:active { transform:translateY(1px); }' +
'  .grouptitle { font-size:1.15rem; font-weight:900; color:#fff; margin:2px 0 14px; letter-spacing:.02em; }' +
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
'  .tile.cost::before { background:#e0533d; }' +
'  .tile.koukoku::before { background:#7c3aed; }' +
'  .tile.instadm::before { background:#e1306c; }' +
'  .tile.igdm::before { background:#c13584; }' +
'  .tile.claudetools::before { background:#7c3aed; }' +
'  .tile.yoyaku::before { background:#16a34a; }' +
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
'  .tile.cost .ticon { background:rgba(224,83,61,.16); }' +
'  .tile.koukoku .ticon { background:rgba(124,58,237,.16); }' +
'  .tile.instadm .ticon { background:rgba(225,48,108,.16); }' +
'  .tile.igdm .ticon { background:rgba(193,53,132,.16); }' +
'  .tile.yoyaku .ticon { background:rgba(22,163,74,.16); }' +
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
'  .card.staff { border-left-color:var(--sc,#7c3aed); }' +
'  h2.sec { color:#fff; font-size:1.25rem; margin:6px 0 12px; font-weight:900;' +
'    border-bottom:2px solid rgba(255,255,255,.35); padding-bottom:5px; }' +
'  h2.sec .cnt { color:#ff8fb3; font-weight:900; }' +
'  .staffpill { flex:none; background:var(--sc,#7c3aed); color:#fff; font-weight:900; font-size:1.2rem;' +
'    padding:14px 16px; border-radius:999px; display:inline-flex; align-items:center; line-height:1; }' +
'  .staffLine { display:flex; align-items:center; gap:10px; flex-wrap:nowrap; }' +
'  .cmsg { flex:1 1 auto; min-width:0; font-weight:900; font-size:1.2rem; line-height:1.3; }' +
'  .sroom { margin-left:8px; background:var(--rc,#64748b); color:#fff; font-weight:800;' +
'    font-size:.8rem; padding:2px 10px; border-radius:999px; vertical-align:middle; }' +
// ★人かぶりカードで各予約の左に置く小さな部屋チップ（担当絵文字用の .ab は大きすぎて時間を押し出すため別に用意）。
'  .lroom { flex:none; margin-right:8px; background:var(--rc,#64748b); color:#fff; font-weight:800;' +
'    font-size:1rem; padding:13px 14px; border-radius:999px; white-space:nowrap;' +
'    display:inline-flex; align-items:center; line-height:1; }' +
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
'  .room { background:var(--rc); color:#fff; font-weight:800; font-size:1.3rem;' +
'    padding:14px 24px; border-radius:999px; display:inline-flex; align-items:center;' +
'    line-height:1; vertical-align:middle; }' +
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
'    border:0; border-radius:999px; padding:24px 14px; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.18); }' +
'  .mvbtn:active { transform:translateY(1px); }' +
'  .mvbtn:disabled { opacity:.4; }' +
'  .smvbtn { font-size:1.6rem; font-weight:800; color:#fff; background:var(--sc,#7c3aed);' +   /* ★2026-07-26 ボタンの大きさに合わせて文字・果物マークを大きく（オーナー指定） */
'    border:0; border-radius:999px; padding:24px 14px; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.18); }' +
'  .smvbtn:active { transform:translateY(1px); }' +
'  .smvbtn:disabled { opacity:.4; }' +
'  .mvng { grid-column:1/-1; font-size:1.5rem; font-weight:900; color:var(--real);' +
'    align-self:center; text-align:center; padding:8px 4px; white-space:nowrap; }' +
'  .mvstatus { margin-top:8px; padding:11px 12px; border-radius:10px; font-size:.95rem; font-weight:700; }' +
'  .mvstatus.working { background:#fef9c3; color:#854d0e; }' +
'  .mvstatus.ok { background:#dcfce7; color:#166534; }' +
'  .mvstatus.err { background:#fee2e2; color:#991b1b; }' +
'  .rspanel { margin:8px 0 0; background:var(--bg); border:1px solid var(--line);' +
'    border-radius:10px; padding:8px 10px; }' +
'  .rstitle { font-size:1.37rem; font-weight:800; color:var(--sub); margin-bottom:6px; }' +
'  .rstat { display:flex; align-items:flex-start; flex-wrap:nowrap; gap:6px; padding:4px 0; }' +
'  .rstat + .rstat { border-top:1px dashed var(--line); }' +
// ★部屋名の長さ(FREEDOM/HAPPY/LUCKY/STAR/福)がバラバラで幅が揃わず、右の空き時間の
//   開始位置が行ごとにズレていた不具合を修正（2026-07-16・「時間が左右バラバラ」との指摘）。
//   幅を固定して、どの部屋名でも右側(.rchips)が必ず同じ位置から始まるようにする。
'  .rstat .room { flex:0 0 auto; width:92px; text-align:center; padding:4px 6px; box-sizing:border-box;' +
'    font-size:.95rem; display:inline-block; }' +
// ★2個目以降の空き時間が右端の列まで飛んで離れて見えていた不具合を修正（2026-07-16再指摘）。
//   grid(2列固定)だと2個目が「残り幅の半分の位置」まで飛ぶ→flexにして隣に詰めて並べるだけにする。
'  .rchips { flex:1 1 auto; min-width:0; display:flex; flex-direction:column; align-items:flex-start; gap:5px; }' +   /* ★2026-07-26 全員たて並び（オーナー指定・横並びに揃えない） */
'  .rchips .slot { display:inline-block; background:var(--card); border:1px solid var(--line);' +
'    border-radius:7px; padding:3px 9px; font-size:1.39rem; font-weight:800; font-variant-numeric:tabular-nums;' +
'    white-space:nowrap; }' +
'  .rchips .slot.free { background:#0a1740; color:#fff; border-color:#1e2f66; }' +   /* ★2026-07-26 空きの札を濃い深いブルーに（オーナー指定・元は緑） */
'  .rchips .none { color:var(--real); font-size:1.39rem; font-weight:800; }' +
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
      '<button type="button" class="kref" id="kRef">今すぐ更新</button>' +
    '</div>' +
    '<h1>📟 自動監視</h1>' +
    '<div class="kfresh" id="kFresh"></div>' +
    '<div id="kList"></div>' +
    '<div class="kfoot">🟢＝動いている ／ 🔴＝止まっている疑い ／ ⚪＝OFF（止めてある）。' +
      'カードの「⚙ 設定」で中身の一覧へ、さらに各行の「詳細」でその項目の画面へ進みます' +
      '（上の「← 一覧に戻る」で戻れます）。入切や実行はいちばん奥の画面にあります（事務所PCと同じ場所）。' +
      'この画面は登録したスマホ（最初に開いた1台）だけが使えます。' +
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
/* ★2026-07-21：PC画面と同じ2段分け。「監視のみシステム」＝入切のつまみが無く見るだけ＝点線の枠 */
'  .ksec{ font-size:13px; letter-spacing:.12em; color:var(--sub); font-weight:800;' +
'    margin:22px 2px 10px; }' +
'  .ksecnote{ font-size:14px; color:var(--sub); margin:-6px 2px 10px; line-height:1.6; }' +
'  .kcard.kwatch{ background:transparent; border-style:dashed; }' +
'  .kcard.kwatch .klabel{ font-weight:600; }' +
'  .khead{ display:flex; align-items:flex-start; gap:8px; cursor:pointer; }' +
'  .khead.nohit{ cursor:default; }' +
'  .kback{ margin-bottom:10px; }' +
'  .kback .kbtn{ font-size:16px; padding:9px 14px; }' +
'  .kmark{ font-size:19px; line-height:1.4; }' +
'  .klabel{ font-weight:700; font-size:18px; flex:1; }' +
'  .kdetail{ color:var(--sub); font-size:15px; margin-top:3px; font-weight:400; }' +
'  .karrow{ color:var(--sub); font-size:15px; }' +
/* ★2026-07-22：PC画面(.mcard .st / .mini.gear)と同じ見え方にそろえる。 */
'  .kslabel{ font-size:15px; font-weight:600; margin-top:2px; color:var(--ok); }' +
'  .kslabel.k_stale,.kslabel.k_error{ color:var(--ng); }' +
'  .kslabel.k_off,.kslabel.k_unknown{ color:var(--off); }' +
'  .kgear{ flex-shrink:0; align-self:center; font-size:15px; font-weight:700; color:var(--ink);' +
'    background:var(--line); border-radius:10px; padding:9px 13px; white-space:nowrap; }' +
'  .kmembers{ margin-top:10px; border-top:1px solid var(--line); padding-top:8px; }' +
'  .kmembers[hidden]{ display:none; }' +
/* ★2026-07-22：PC画面は「中を開いた一覧」もトップと同じカードの形（.mcard）で出している。
   スマホ側だけ細い一行の並びで別物だったので、同じカードの形にそろえた。 */
'  .krow{ background:var(--card); border:1px solid var(--line); border-radius:12px;' +
'    padding:12px 14px; margin-bottom:10px; }' +
'  .krow:last-child{ margin-bottom:0; }' +
'  .krowhead{ display:flex; align-items:flex-start; gap:8px; }' +
'  .krowlabel{ flex:1; font-size:18px; font-weight:700; }' +
'  .kbtns{ display:flex; flex-wrap:wrap; gap:6px; margin-top:7px; align-items:center; }' +
'  .kbtn{ border:1px solid var(--line); background:var(--card); color:var(--ink); border-radius:8px;' +
'    padding:8px 13px; font:inherit; font-size:15px; font-weight:700; cursor:pointer; }' +
'  .kbtn.on{ background:var(--ok); color:#fff; border-color:var(--ok); }' +
'  .kbtn.off{ background:var(--off); color:#fff; border-color:var(--off); }' +
'  .kbtn:active{ transform:translateY(1px); }' +
'  .kval{ width:88px; padding:8px 10px; border:1px solid var(--line); border-radius:8px;' +
'    background:var(--card); color:var(--ink); font:inherit; font-size:15px; }' +
'  .kunit{ font-size:14px; color:var(--sub); }' +
'  .ksub{ margin:10px 0 0; border:1px solid var(--line); border-radius:10px; padding:10px 10px 1px; }' +
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
// ★2026-08-02：3部屋の見出し（管理者用／実務者用／開発者用）＋トマト＝ピンクの「幹部」（PC設定画面とそろえる）。
'  .kroom{ font-size:16px; font-weight:800; color:#f59e0b; margin:16px 0 8px; padding-top:12px; border-top:1px solid var(--line); }' +
'  .kchip .kexec{ font-size:11px; color:#ec4899; font-weight:800; margin-left:3px; }' +
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
/* ★2026-07-21（オーナー指示）：以前は押すとその場で下に開く形だったが、事務所PCの画面と同じ
   「押したら、その中身だけの画面に移る」形にそろえた。cur_=いま開いている枠の番号（null＝一覧）。 */
'var item_=null;' +   /* 「詳細」で開いている項目の場所（"2.0" のような文字）。null＝一覧を見ている */
'var cur_=null;' +
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
'    el.className="kfresh"; el.textContent="最終更新 "+(data_.generated_at||"");' +
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
/* ★2026-07-22（オーナー指示「PCと全部同じにして」）：一覧の行には入切のつまみを出さず、
   PC画面と同じく「詳細」ボタンだけを出す。つまみは詳細を押した先の画面（下の itemHtml_）に置く。
   ＝PCとスマホで押す場所が同じになる（両方違うと操作しづらい、という指摘による）。 */
'function rowHtml_(m, path){' +
'  var has=(m.ctl||(m.members&&m.members.length));' +
'  var h="<div class=\\"krow\\"><div class=\\"krowhead\\"><span class=\\"kmark\\">"+mark_(m.status)+"</span>";' +
'  h+="<span class=\\"krowlabel\\">"+esc(m.label)+' +
'    "<div class=\\"kslabel k_"+esc(m.status||"")+"\\">"+esc(m.slabel||"")+"</div>"+' +
'    "<div class=\\"kdetail\\">"+esc(m.detail||"")+"</div></span>";' +
'  h+=(has?"<span class=\\"kgear\\" data-item=\\""+esc(path)+"\\">詳細</span>":"");' +
'  h+="</div></div>"; return h;' +
'}' +
/* 「詳細」を押した先＝その項目1つだけの画面。つまみ・今すぐ実行・数値の保存はここに置く
   （PCの個別設定画面と同じ役割）。中にさらに項目があるものは、その一覧も下に出す。 */
'function itemHtml_(m, path){' +
'  var h="<div class=\\"kcard\\"><div class=\\"khead nohit\\"><span class=\\"kmark\\">"+mark_(m.status)+"</span>";' +
'  h+="<span class=\\"klabel\\">"+esc(m.label)+' +
'    "<div class=\\"kslabel k_"+esc(m.status||"")+"\\">"+esc(m.slabel||"")+"</div>"+' +
'    "<div class=\\"kdetail\\">"+esc(m.detail||"")+"</div></span></div>";' +
'  h+=ctlBtns_(m);' +
'  h+="</div>";' +
'  if(m.members&&m.members.length){' +
'    h+=m.members.map(function(x,j){ return rowHtml_(x, path+"."+j); }).join("");' +
'  }' +
'  return h;' +
'}' +
/* path（"2.0" のような文字）から、その項目を取り出す */
'function itemAt_(path){' +
'  var parts=String(path||"").split(".");' +
'  var g=(data_.groups||[])[Number(parts[0])]; if(!g) return null;' +
'  var cur=g.members||[];' +
'  var m=null;' +
'  for(var i=1;i<parts.length;i++){ m=cur[Number(parts[i])]; if(!m) return null; cur=m.members||[]; }' +
'  return m;' +
'}' +
'function render_(){' +
'  renderFresh_();' +
'  var list=document.getElementById("kList"); if(!list) return;' +
'  var gs=data_.groups||[];' +
'  if(!gs.length){ list.innerHTML="<div class=\\"kcard\\">状態が空です。事務所PCをご確認ください。</div>"; return; }' +
/* いま1つの枠の中を見ている＝その中身だけの画面（上に「← 一覧に戻る」） */
'  if(cur_!==null && gs[cur_]){' +
'    var g=gs[cur_];' +
'    if(item_!==null){' +
'      var im=itemAt_(item_);' +
'      if(im){' +
'        list.innerHTML="<div class=\\"kback\\"><button type=\\"button\\" class=\\"kbtn\\" id=\\"kBackItem\\">← 一覧に戻る</button></div>"+itemHtml_(im, item_);' +
'        return;' +
'      }' +
'      item_=null;' +
'    }' +
'    var body=(g.members&&g.members.length)?g.members.map(function(m,j){ return rowHtml_(m, cur_+"."+j); }).join(""):"<div class=\\"kdetail\\">中身はありません。</div>";' +
'    list.innerHTML="<div class=\\"kback\\"><button type=\\"button\\" class=\\"kbtn\\" id=\\"kBack\\">← 一覧に戻る</button></div>"+' +
'      "<div class=\\"kcard"+(g.watch_only?" kwatch":"")+"\\"><div class=\\"khead nohit\\">"+' +
'      "<span class=\\"kmark\\">"+mark_(g.status)+"</span>"+' +
'      "<span class=\\"klabel\\">"+esc(g.label)+' +
'        "<div class=\\"kslabel k_"+esc(g.status||"")+"\\">"+esc(g.slabel||"")+"</div>"+' +
'        "<div class=\\"kdetail\\">"+esc(g.detail||"")+"</div></span></div>"+' +
'      "<div class=\\"kmembers\\">"+body+"</div></div>";' +
'    return;' +
'  }' +
'  var sec_="";' +   /* ★2026-07-21：PC画面と同じく「ONOFFシステム／監視のみシステム」の見出しを出す */
'  list.innerHTML=gs.map(function(g,i){' +
'    var has=(g.members&&g.members.length)?1:0;' +
'    var head_="";' +
'    if(g.section && g.section!==sec_){' +
'      sec_=g.section;' +
'      head_="<div class=\\"ksec\\">"+esc(sec_)+"</div>";' +
'      if(g.watch_only){ head_+="<div class=\\"ksecnote\\">ここは入切のつまみがありません。うまくいっているかを見るだけの欄です（赤くなったら、予約とLINEが取り込めていません）。</div>"; }' +
'    }' +
'    return head_+"<div class=\\"kcard"+(g.watch_only?" kwatch":"")+"\\"><div class=\\"khead\\" data-g=\\""+i+"\\">"+' +
/* ★2026-07-22：PC画面と同じ形にそろえた（オーナー指示「PC版と同じにして」）。
   ①状態の日本語（正常に動作中 等）を名前の下に出す ②右端は「›」でなくPCと同じ
   「⚙ 設定」／見るだけの欄は「🔍 見る」のボタン。文言の元はPC側 monitor_snapshot の slabel。 */
'      "<span class=\\"kmark\\">"+mark_(g.status)+"</span>"+' +
'      "<span class=\\"klabel\\">"+esc(g.label)+' +
'        "<div class=\\"kslabel k_"+esc(g.status||"")+"\\">"+esc(g.slabel||"")+"</div>"+' +
'        "<div class=\\"kdetail\\">"+esc(g.detail||"")+"</div></span>"+' +
'      (has?"<span class=\\"kgear\\">"+(g.watch_only?"🔍 見る":"⚙ 設定")+"</span>":"")+"</div></div>";' +
'  }).join("");' +
'}' +
'function reload_(onDone){' +
// ★2026-07-23：初回表示(index.htmlのshowKanshi)と同じく設定ファイルを直接読む。
//   古い action=kanshi は今の窓口が知らず bad key を返す＝自動更新が効かず画面が固まっていた。
//   monitor.json は「登録した1台だけ」に見せる設定なので device を必ず添える（窓口が確認する）。
'  jsonp_({action:"data", name:"monitor.json", device:DEV_}, function(r){' +
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
'var EP_={}, EO_=[], EPEOPLE_=[], ELAB_={}, ECLAIM_={}, EPCHIDDEN_=[];' +
'function tileDefs_(){' +
'  var r=TILEROW_||{}; var out=[];' +
'  var a=r.tiles||[], b=r.dev_tiles||[];' +
'  for(var i=0;i<a.length;i++) out.push({id:a[i].id,label:a[i].label,color:a[i].color,dev:false});' +
'  for(var j=0;j<b.length;j++) out.push({id:b[j].id,label:b[j].label,color:b[j].color,dev:true});' +
'  return out;' +
'}' +
'function openTiles_(){' +
'  toast_("設定を読み込んでいます…");' +
// ★2026-07-23：窓口は「中身を問わない」方式になり、古い action=tilesettings は使えない
//   （知らない action なので bad key が返る＝「設定を読めませんでした」の原因だった）。
//   今は設定ファイルを直接読み、人・名前・権限・並び順は code.js の共通関数
//   （_peopleFromCfg_ 等＝ホーム起動と同じ導出）でこの場で組み立てる。
'  jsonp_({action:"data", name:"tile_settings.json"}, function(r){' +
'    if(!r||r.error){ toast_("⚠ 設定を読めませんでした"); return; }' +
'    EPEOPLE_=(typeof _peopleFromCfg_==="function")?_peopleFromCfg_(r):(r.people||[]);' +
'    ELAB_=(typeof _labelsFromCfg_==="function")?_labelsFromCfg_(r):(r.labels||{});' +
'    ECLAIM_=r.claimed||{};' +
'    EO_=((typeof _orderFromCfg_==="function")?_orderFromCfg_(r):(r.order||[])).slice();' +
'    EPCHIDDEN_=(r.pcHidden||[]).slice();' +
'    if(typeof _permsFromCfg_==="function"){ EP_=_permsFromCfg_(r); }' +
'    else {' +
'      EP_={};' +
'      for(var i=0;i<EPEOPLE_.length;i++){' +
'        var pid=EPEOPLE_[i]; EP_[pid]={};' +
'        var src=(r.perms&&r.perms[pid])||{};' +
'        for(var t in src) EP_[pid][t]=!!src[t];' +
'      }' +
'    }' +
'    drawTiles_();' +
'  });' +
'}' +
'function tileGrp_(id){ return (typeof tileGroup_==="function")?tileGroup_(id):"jitsumu"; }' +
'function tileRowsHtml_(){' +
'  var defs=tileDefs_(), byId={};' +
'  for(var i=0;i<defs.length;i++) byId[defs[i].id]=defs[i];' +
'  var order=EO_.filter(function(id){ return byId[id]; });' +
'  for(var j=0;j<defs.length;j++){ if(order.indexOf(defs[j].id)<0) order.push(defs[j].id); }' +
'  EO_=order;' +
'  function rowH_(tid){' +
'    var d=byId[tid];' +
'    var h="<div class=\\"ktrow\\" data-tid=\\""+esc(tid)+"\\"><div class=\\"ktname\\">"+' +
'      "<span class=\\"kacc\\" style=\\"background:"+esc(d.color||"#94a3b8")+"\\"></span>"+esc(d.label)+' +
'      "<span class=\\"kord\\"><button type=\\"button\\" data-mv=\\"-1\\" data-tid=\\""+esc(tid)+"\\">▲</button>"+' +
'      "<button type=\\"button\\" data-mv=\\"1\\" data-tid=\\""+esc(tid)+"\\">▼</button></span></div>";' +
'    if(d.dev){' +
'      h+="<div class=\\"kdevnote\\">開発画面だけに出るボタンです（オーナー専用・人ごとの設定はありません。並び順だけ変えられます）</div>";' +
'    } else {' +
'      h+="<div class=\\"kchips\\">"+EPEOPLE_.map(function(pid){' +
'        var on=!!(EP_[pid]&&EP_[pid][tid]);' +
'        var suf=(pid==="kanbu")?"<span class=\\"kexec\\">幹部</span>":((ECLAIM_[pid])?"<span class=\\"kused\\">使用中</span>":"");' +
'        return "<button type=\\"button\\" class=\\"kchip"+(on?" on":"")+"\\" data-pid=\\""+esc(pid)+"\\" data-tid=\\""+esc(tid)+"\\">"+' +
'          esc(ELAB_[pid]||pid)+suf+"</button>";' +
'      }).join("")+"</div>";' +
'    }' +
'    return h+"</div>";' +
'  }' +
'  var groups={kanri:[],jitsumu:[],kaihatsu:[]};' +
'  for(var k=0;k<order.length;k++){ var g=tileGrp_(order[k]); (groups[g]||groups.jitsumu).push(order[k]); }' +
'  var roles=(typeof ROLE_DEFS_!=="undefined")?ROLE_DEFS_:[{id:"kanri",icon:"🛠️",title:"管理者用"},{id:"jitsumu",icon:"💼",title:"実務者用"},{id:"kaihatsu",icon:"🧑‍💻",title:"開発者用"}];' +
'  var out="";' +
'  for(var r=0;r<roles.length;r++){ var R=roles[r], ids=groups[R.id]||[]; if(!ids.length) continue;' +
'    out+="<div class=\\"kroom\\">"+R.icon+" "+R.title+"</div>"+ids.map(rowH_).join(""); }' +
'  return out;' +
'}' +
// PC版スーパーズコ（事務所PCのホーム）で表示するボタン。チェック＝表示／外す＝PC版だけで隠す。
'function pcRowsHtml_(){' +
'  var defs=(TILEROW_&&TILEROW_.pc_tiles)||[];' +
'  return defs.map(function(d){' +
'    var on=(EPCHIDDEN_.indexOf(d.id)<0);' +   // 隠す一覧に居ない＝表示中
'    return "<button type=\\"button\\" class=\\"kchip pcchip"+(on?" on":"")+"\\" data-pc=\\""+esc(d.id)+"\\">"+' +
'      "<span class=\\"kacc\\" style=\\"background:"+esc(d.color||"#94a3b8")+"\\"></span>"+esc(d.label)+"</button>";' +
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
'  var g=tileGrp_(tid), i=EO_.indexOf(tid); if(i<0) return;' +
'  var j=i+dir; while(j>=0&&j<EO_.length&&tileGrp_(EO_[j])!==g) j+=dir;' +   // 同じ部屋の中だけ
'  if(j<0||j>=EO_.length) return;' +
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
'  send_("tile_settings","setval", JSON.stringify({t:"save", o:EO_, p:p, ph:EPCHIDDEN_}));' +
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
'  if(chip&&chip.getAttribute("data-pc")){' +
'    var pcid=chip.getAttribute("data-pc"), k=EPCHIDDEN_.indexOf(pcid);' +
'    if(k<0){ EPCHIDDEN_.push(pcid); chip.classList.remove("on"); }' +   // 表示→隠す
'    else { EPCHIDDEN_.splice(k,1); chip.classList.add("on"); }' +       // 隠す→表示
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
'  if(ev.target.closest("#kBackItem")){ item_=null; render_(); window.scrollTo(0,0); return; }' +
'  if(ev.target.closest("#kBack")){ cur_=null; item_=null; render_(); window.scrollTo(0,0); return; }' +
'  var it=ev.target.closest("[data-item]");' +
'  if(it){ item_=it.getAttribute("data-item"); render_(); window.scrollTo(0,0); return; }' +
'  var h=ev.target.closest(".khead");' +
'  if(h&&h.getAttribute("data-g")!==null&&h.getAttribute("data-g")!==undefined){' +
'    cur_=Number(h.getAttribute("data-g")); item_=null; render_(); window.scrollTo(0,0); return;' +
'  }' +
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
