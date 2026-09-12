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
  } else if (view === 'procell') {
    title = 'プロセル 残り本数';                         // ★開発URL(?dev=1)専用。美容液を何本注文するかの数
    html = renderProcell_(base, staff, dev);
  } else if (view === 'pcstatus') {
    title = '自宅PC';                                   // ★開発URL(?dev=1)専用。事務所PCの生き死にと止まった理由
    html = renderPcStatus_(base, staff, dev);
  } else if (view === 'kanshi') {
    title = '自動監視';
    html = renderKanshi_(base, staff, dev, device);   // ★登録した1台のスマホだけ（kanshiGate_）
  } else if (view === 'zenjitsu') {
    title = '前日お知らせ';                             // ★2026-09-08からスタッフも全機能。日付を選ぶ→PCが作る→枠で表示
    html = renderZenjitsuPage_(base, staff, dev);
  } else if (view === 'cost') {
    title = '台湾トマト 売上・コスト';                    // ★開発URL(?dev=1)専用。「月間コスト計算」を押すとコスト表を出す（純JS）
    html = renderCostPage_(base, staff, dev);
  } else if (view === 'koukoku') {
    title = '広告費管理';                                // ★開発URL(?dev=1)専用。自動で読み取った広告ごとの実額・成果
    html = renderKoukoku_(base, staff, dev);
  } else if (view === 'honyaku') {
    title = '翻訳 日→台湾中国語';                        // ★開発URL(?dev=1)専用。訳すのは事務所パソコン（パソコン版と同じ訳し方）
    html = renderHonyakuPage_(base, staff, dev);
  } else if (view === 'timedsend') {
    title = '時間指定LINE送信';                          // ★開発URL(?dev=1)専用。決めた時刻に文章＋画像を送る予約（純JS）
    html = renderTimedSendPage_(base, staff, dev);
  } else if (view === 'bcast') {
    title = 'LINE一斉配信設定';                          // ★開発URL(?dev=1)専用。相手のまとまりごとに文章＋画像を置く（純JS）
    html = renderBroadcastPage_(base, staff, dev);
  } else if (view === 'yoyaku') {
    title = '予約入力';                                  // ★予約入力のトップ画面（新規／既存／変更の3ボタン・PC版と同じ見た目）
    html = renderReservationHomePage_(base, staff, dev);
  } else if (view === 'yoyaku_sejutsugo') {
    title = '施術後の予約';                              // ★施術者がその場で次回の予約を入れる入口（中身はこれから）
    html = renderAfterTreatmentPage_(base, staff, dev, who);
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
// ★プロセルの残り本数（2026-08-20 まるちゃん決定）＝事務所PCが毎晩そろえて置き場へ書き出す。
var PROCELL_FILENAME = 'procell.json';
function getProcellFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('PROCELL_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (ignore) { /* IDが古い→探し直す */ }
  }
  var it = DriveApp.getFilesByName(PROCELL_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) throw new Error(PROCELL_FILENAME + ' が見つかりません（事務所PCで書き出してください）。');
  props.setProperty('PROCELL_FILE_ID', newest.getId());
  return newest;
}

// ★自宅PCの生き死に（2026-08-24 まるちゃん決定）＝事務所PCが1分ごとに置き場へ送る。
var PCSTATUS_FILENAME = 'pc_status.json';
function getPcStatusFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('PCSTATUS_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (ignore) { /* IDが古い→探し直す */ }
  }
  var it = DriveApp.getFilesByName(PCSTATUS_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) throw new Error(PCSTATUS_FILENAME + ' が見つかりません（事務所PCで書き出してください）。');
  props.setProperty('PCSTATUS_FILE_ID', newest.getId());
  return newest;
}

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
  // ★前日お知らせ＝2026-08-24 まるちゃん決定でスタッフにも見せる（それまでは開発URL専用だった）。
  //   人ごとのON/OFF対象＝tile_settings.py の STAFF_ASSIGNABLE にも入れてある。
  //   ★「未送信の分だけ作成」のボタンは、まだ隠しておく＝スタッフ版も社長版も出さない
  //     （開発版(?dev=1)だけ出す。renderZenjitsuPage_ で出し分け）。
  zenjitsu:   { exec: true, staff: true },
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
  claudetools: { exec: false, staff: false },
  // ★プロセル残り本数＝オーナー(開発者)専用。kanshi/costと同じく開発URL(?dev=1)専用
  //   （tile_settings.py の TILES にも入れない＝誰もONにできない・共通ルール16）。
  procell:    { exec: false, staff: false },
  // ★自宅PC＝事務所PCが今動いているか／止まっているなら何が起きたか。オーナー(開発者)専用＝
  //   開発URL(?dev=1)だけに出る（tile_settings.py の TILES にも入れない・共通ルール16）。2026-08-24。
  pcstatus:   { exec: false, staff: false },
  // ★LINE一斉配信予約＝オーナー(開発者)専用。timedsend/cost と同じく開発URL(?dev=1)専用
  //   （tile_settings.py の TILES にも入れない＝誰もONにできない・共通ルール16）。2026-09-05。
  bcast:      { exec: false, staff: false },
  // ★施術後の予約＝作りかけ。**まるちゃんの画面（社長版・開発版）には出す**が、スタッフには出さない
  //   （まるちゃん指示 2026-09-12「開発者のスマホにも出そう」＝どちらの住所で開いても出るように）。
  //   tile_settings.py の TILES には入れない＝スタッフの人ごとの表示でONにはできない。
  sejutsugo:  { exec: true, staff: false }
};

// ホーム画面のボタン並び順のデフォルト（tile_settings.json に order が無い時）。
// tile_settings.py の「ボタンの並びをかえれる」設定画面（2026-07-16追加）で変更できる。
var DEFAULT_TILE_ORDER_ = ['conflict', 'lt', 'uriage', 'unanswered', 'akijikan', 'links', 'ttapp', 'rireki', 'kanshi', 'zenjitsu', 'cost', 'koukoku', 'igdm', 'instadm', 'claudetools', 'bcast', 'yoyaku', 'procell', 'pcstatus', 'sejutsugo'];

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
// 人ID（tile_settings.py の PEOPLE と順番・IDを一致させること）。kanbu=社長, reception=お店受付PC。
// ★2026-09-09 まるちゃん決定：🌰マロンを削除／「お店受付」→「お店受付PC」に改名（IDは reception の
//   ままにする＝すでにその名前を選んでいる端末が選び直しにならないため）／「お店スマホ」(reception_sp)
//   を追加（権限はお店受付PCと同じ）。
// ★2026-09-09 まるちゃん決定：🍍パイン(pine)を追加。権限は🍊みかんと同じ中身を写した。
var PEOPLE_ = ['kanbu', 'ringo', 'mikan', 'olive', 'mango', 'coconut', 'pine', 'reception', 'reception_sp'];
// 表示名（アプリの名前選択・ログで使う。絵文字つき）。
var PERSON_LABEL_ = {
  kanbu: '🍅トマト', ringo: '🍎りんご', mikan: '🍊みかん', olive: '🫒オリーブ',
  mango: '🥭マンゴー', coconut: '🥥ココナッツ', pine: '🍍パイン',
  reception: 'お店受付PC', reception_sp: 'お店スマホ'
};
// 初期権限＝全員「施術室被り(conflict)」だけON（tile_settings.py DEFAULT と一致）。
// peopleを省略した時は base8(PEOPLE_)のみ＝壊れた時の最終フォールバック用。
function defaultPerms_(people) {
  var list = people || PEOPLE_;
  var perms = {};
  for (var i = 0; i < list.length; i++) {
    // ★yoyaku(予約入力)＝2026-09-11 まるちゃん決定で**全スタッフ**に開放（前は幹部だけ）。中は新規の予約だけ(viewAllowed_)。
    // ★zenjitsu(前日お知らせ)＝2026-08-24 まるちゃん決定で全員ON（スタッフにも見せる）。
    // ★sejutsugo(施術後の予約)＝2026-09-12 まるちゃん指示で「まるちゃんのスマホ(無印の住所)にも出す」。
    //   作りかけなのでスタッフには出さない＝kanbu(無印)だけON（新規ボタンは開発者だけ、の決まりの範囲内）。
    perms[list[i]] = { conflict: true, lt: false, uriage: false, unanswered: false, akijikan: false, links: true, ttapp: true, rireki: false, kanshi: false, zenjitsu: true, yoyaku: true, sejutsugo: (list[i] === 'kanbu') };
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
  return (perms && perms[pid]) || { conflict: true, lt: false, uriage: false, unanswered: false, akijikan: false, links: false, rireki: false, kanshi: false, zenjitsu: true };
}
// そのviewを見る権限があるか（home/notice は常に可）。allow=null(dev)は常に可。
function viewAllowed_(view, allow) {
  if (view === 'home' || view === 'notice') return true;
  if (!allow) return true;   // dev
  // ★予約入力：'yoyaku' が付いている人は、トップ画面と「新規の予約」だけ許可（既存/変更は開発者専用）。
  //   2026-09-11 まるちゃん決定で全スタッフに開放したので、ここを通るのはスタッフ全員になる。
  if (view === 'yoyaku' || view === 'yoyaku_new') return allow['yoyaku'] === true;
  // ★施術後の予約：ボタンのidは 'sejutsugo'、画面のviewは 'yoyaku_sejutsugo'。
  //   ボタンが出る人は画面も開ける、で合わせる（ここを書かないとボタンから飛んでも弾かれる）。
  if (view === 'yoyaku_sejutsugo') return allow['sejutsugo'] === true;
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
var STAFF_COLORS_ = { '🍅': '#d1443c', '🍊': '#e08a1e', '🫒': '#4b8b3b', '🥭': '#c9a227', '🍍': '#c98a3c' };
function staffColor_(fruit) {
  return STAFF_COLORS_[fruit] || '#64748b';
}

// ★共通ルール(2026-08-05まるちゃん)：書き込み系ボタンは全部〈全画面で処理中→完了〉表示に統一。
//   どのページのスクリプトからも window.szOvShow_/szOvHide_/szBusyHtml_/szDoneHtml_ で呼べる。
//   処理中＝青緑(#2C7A99)・⏳／成功＝緑(#16a34a)・✓＋戻る／失敗＝小さな警告(ccPopup_)＋事務所PCがRYUへ通知。
function szOvShow_(html, bg) {
  var ov = document.getElementById('szBusyOv');
  if (!ov) { ov = document.createElement('div'); ov.id = 'szBusyOv'; document.body.appendChild(ov); }
  ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:' + bg + ';display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center;';
  ov.innerHTML = html;
  return ov;
}
function szOvHide_() { var ov = document.getElementById('szBusyOv'); if (ov && ov.parentNode) ov.parentNode.removeChild(ov); }
function szBusyHtml_(title, sub) {
  // sub＝下の説明文。書かなければ今まで通りタイムツリー書き込み用の文（部屋移動・担当異動など）。
  return "<div style='font-size:66px;margin-bottom:20px;'>⏳</div>" +
    "<div style='color:#fff;font-size:33px;font-weight:800;line-height:1.5;margin-bottom:22px;'>" + title + "</div>" +
    "<div style='color:#eaf3f7;font-size:20px;line-height:1.8;max-width:420px;'>" +
    (sub || "タイムツリーへの書き込みが完了したら自動で切り替わりますので、しばらくお待ちください。") + "</div>";
}
function szDoneHtml_(title, backLabel, openUrl) {
  // ★openUrl＝あれば「タイムツリーを確認」ボタンを戻るの下に出す（2026-08-23 まるちゃん）。
  //   見た目・文言・並びはパソコン版（gui.py の .ov-b2）とまったく同じにそろえる＝勝手に作り直さない。
  var extra = openUrl
    ? "<a id='szDoneOpen' href='" + openUrl + "' target='_blank' rel='noopener' " +
      "style='display:block;margin:0 auto 16px;font:inherit;font-size:1.3rem;font-weight:800;color:#16a34a;" +
      "background:#fff;border:0;border-radius:12px;padding:14px 26px;text-decoration:none;" +
      "box-shadow:0 4px 10px rgba(0,0,0,.18);'>タイムツリーを確認</a>"
    : "";
  return "<div style='font-size:92px;margin-bottom:16px;'>✓</div>" +
    "<div style='color:#fff;font-size:35px;font-weight:800;line-height:1.5;margin-bottom:26px;'>" + title + "</div>" +
    extra +
    "<button type='button' id='szDoneBack' style='font:inherit;font-size:1.3rem;font-weight:800;color:#16a34a;background:#fff;border:0;border-radius:12px;padding:14px 26px;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.18);'>" + (backLabel || '戻る') + "</button>";
}
// ★共通ルール(2026-08-05まるちゃん)：知らせ・警告・確認の小窓は、どのページでも必ずこのスーパーズコの
//   見た目にそろえる。素っ気ない標準の警告(alert/confirm)を使わない。どのページのスクリプトからも
//   window.szPopup_ で呼べる（自前でCSS変数に頼らず全部この関数の中で見た目を作るので、どの画面でも同じ形）。
//   使い方：szPopup_("メッセージ")／確認は szPopup_("…しますか？", {cancel:true, onYes:fn})。
function szPopup_(msg, opts) {
  opts = opts || {};
  var mask = document.createElement('div');
  mask.className = 'szpopmask';
  mask.style.cssText = 'position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:20px;';
  var icon = ('icon' in opts) ? opts.icon : '⚠️';
  var yesLabel = opts.yesLabel || 'OK';
  mask.innerHTML =
    "<div style='background:#12303c;border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:26px 24px;max-width:560px;width:100%;max-height:88vh;overflow:auto;box-shadow:0 14px 44px rgba(0,0,0,.45);text-align:center;'>" +
      (icon ? "<div style='font-size:56px;line-height:1;margin-bottom:14px;'>" + icon + "</div>" : "") +
      "<div class='szpopmsg' style='color:#fff;font-size:1.5rem;font-weight:700;line-height:1.9;white-space:pre-wrap;overflow-wrap:anywhere;margin-bottom:22px;'></div>" +
      "<div style='display:flex;gap:12px;'>" +
        (opts.cancel ? "<button type='button' class='szpopno' style='flex:1;font:inherit;font-size:1.2rem;font-weight:800;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,.25);background:transparent;color:#eaf3f7;cursor:pointer;'>" + (opts.noLabel || 'キャンセル') + "</button>" : "") +
        "<button type='button' class='szpopyes' style='flex:1;font:inherit;font-size:1.2rem;font-weight:800;padding:14px;border-radius:12px;border:0;background:#2C7A99;color:#fff;cursor:pointer;'>" + yesLabel + "</button>" +
      "</div>" +
    "</div>";
  if (opts.isHtml) mask.querySelector('.szpopmsg').innerHTML = msg; else mask.querySelector('.szpopmsg').textContent = msg;
  document.body.appendChild(mask);
  mask.querySelector('.szpopyes').addEventListener('click', function () { if (mask.parentNode) mask.parentNode.removeChild(mask); if (opts.onYes) opts.onYes(); });
  var no = mask.querySelector('.szpopno'); if (no) no.addEventListener('click', function () { if (mask.parentNode) mask.parentNode.removeChild(mask); if (opts.onNo) opts.onNo(); });
  return mask;
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
  // ★前日お知らせ＝2026-08-24 まるちゃん決定でスタッフにも見せる（それまでは開発URL専用）。
  //   実際の作成は事務所PCが行い、この画面は日付を選んで頼むだけ（renderZenjitsuPage_）。
  //   ★2026-08-25 まるちゃん決定：「未送信の分だけ作成」も**誰が開いても出す**
  //     （スタッフのスマホにも🍅トマトのスマホにも出す＝事務所パソコンの画面と同じ2つ）。
  //     どのボタンを出すかの判断は共通の1本＝zj_rules.js の ZJ.optionsShown が持つ。
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
  // ★翻訳（日本語→台湾中国語）＝配信文を作る時に使う。開発URL(?dev=1)専用＝**開発者のスマホだけ**
  //   （まるちゃん決定 2026-08-24。tile_settings.py に入れないので他の人には出ない）。
  //   訳すのは事務所パソコン（受付係の op=translate に quality を付けて頼む）＝パソコン版と同じ訳し方。
  { id: 'honyaku', cls: 'honyaku', view: 'honyaku',
    icon: '<span class="ticon">🀄</span>', label: '翻訳\n日→台湾中国語' },
  // ★2026-09-09 まるちゃん決定：「時間指定LINE送信」のボタンは画面から外した（PC版とそろえる）。
  //   仕組みは今までどおり動いている＝前日お知らせは今もこれに乗せて送っており、1分ごとの見張りもON。
  //   人が手で登録することが無くなったので、裏で動けばよい＝ボタンだけ消した。
  //   画面そのもの（view=timedsend）は消していないので、住所を直に開けば今までどおり見られる。
  // ★LINE一斉配信予約＝相手のまとまり（新規/既存×日本/台湾×男女の8通り）ごとに文章と画像を決めて、
  //   公式LINEの一斉配信として置く。送るのはLINEのサーバー＝パソコンが止まっていても届く。
  //   開発URL(?dev=1)専用（tile_settings.py に入れないので開発者だけに出る・共通ルール16）。
  { id: 'bcast', cls: 'bcast', view: 'bcast',
    icon: '<span class="ticon">📣</span>', label: 'LINE\n一斉配信' },
  // ★予約入力＝貼って選ぶだけで新規予約を1件作る。開発URL(?dev=1)専用（kanshi/zenjitsu/costと同じ＝
  //   tile_settings.py に入れないので開発者だけに出る）。登録は事務所PC(edit_worker op=new_reservation)が実行。
  // ★プロセル残り本数＝美容液を何本注文するかの数（頭皮用・顔MD用・顔Pro用）。開発URL(?dev=1)専用。
  //   事務所PCが毎晩そろえた procell.json を読んで出すだけ（計算はPC側・2026-08-20）。
  { id: 'procell', cls: 'procell', view: 'procell',
    icon: '<span class="ticon">🧴</span>', label: 'プロセル\n残り本数' },
  // ★自宅PC＝事務所PCが今動いているか／止まっているなら何が起きたか（2026-08-24 まるちゃん決定）。
  //   開発URL(?dev=1)専用。事務所PCが1分ごとに送る pc_status.json を読むだけ。
  { id: 'pcstatus', cls: 'pcstatus', view: 'pcstatus',
    icon: '<span class="ticon">🖥️</span>', label: '自宅\nPC' },
  { id: 'yoyaku', cls: 'yoyaku', view: 'yoyaku',
    icon: '<span class="ticon">📝</span>', label: '予約\n入力' },
  // ★施術後の予約＝施術者が施術のあと、その場でそのお客様の次回の予約を入れる入口（作りかけ）。
  //   まるちゃん依頼 2026-09-11「開発中の機能は、ここにもいれて。すぐに呼び出せるように」。
  //   予約入力の中からも入れるが、すぐ呼べるようにホームにも置く。開発URL(?dev=1)専用
  //   （tile_settings.py の TILES に入れないので開発者だけに出る・共通ルール16）。
  { id: 'sejutsugo', cls: 'sejutsugo', view: 'yoyaku_sejutsugo',
    icon: '<span class="ticon">💆</span>', label: '施術後の\n予約' }
];

// ★2026-08-02 まるちゃん決定：開発版(?dev=1)とPC版のホームは、まず「管理者用／実務者用／開発者用」の
//   3つの大ボタンを出し、押すとその仲間だけを見せる（上の「← 戻る」で3ボタンに戻る）。普通のスタッフ版・
//   社長版は今まで通り一覧のまま。どのボタンがどの部屋か（ここに無いidは実務者用）＝PC版 super_pc.py の
//   GROUP_OF と一致させる（片方直したら必ず両方）。
// ★2026-08-19 まるちゃん決定：売上転記(uriage)は実務者用へ移した。
// ★2026-09-09 まるちゃん決定：売上転記(uriage)とプロセル残り本数(procell)は管理者用へ戻し、
//   LINE一斉配信(bcast)は実務者用へ移した（ここに書かない＝実務者用）。bcastが見えるのは
//   開発者だけのまま＝部屋(管理/実務/開発)と「誰に見せるか」は別の話（人ごとの表示で決まる）。
var TILE_GROUP_ = {
  kanshi: 'kanri', mushitori: 'kanri', cost: 'kanri', koukoku: 'kanri', imglink: 'kanri',
  instadm: 'kanri', igdm: 'kanri', claudetools: 'kanri', pcstatus: 'kanri',
  uriage: 'kanri', procell: 'kanri',
  formconv: 'kaihatsu', honyaku: 'kaihatsu', sejutsugo: 'kaihatsu'
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

// 外部サイトへ飛ぶボタン（元祖TTアプリ等）を、スマホのホーム画面から開いた時にも必ず開けるようにする。
//   【なぜ有る】2026-08-17・まるちゃん報告「スマホで元祖TTアプリが開かない・パソコンは大丈夫」。
//   原因＝これらのボタンは target="_blank"（新しいタブで開く）だが、ホーム画面のアイコンから
//   開いた時のスーパーズコは「タブの無いアプリの姿」で動いており、新しいタブを作れない
//   （特にiPhoneは押しても何も起きない）。パソコンのブラウザにはタブがあるので今まで通り開く。
//   【やり方】アプリの姿で動いている時だけ、その場で飛ぶ（同じ画面で開く）に切り替える。
//   パソコン（普通のブラウザのタブ）では今まで通り新しいタブで開く＝動きを変えない。
//   ★2026-08-17・まるちゃん指示「押してる間・開いてる間はズコの散歩を出せ」：その場で飛ぶ時は
//     飛ぶ直前に「ズコがお散歩中...」の待ち画面へ差し替える（押しても無反応に見える時間を無くす）。
//     見た目は index.html のボタン後の待ち画面とまったく同じ物（同じ文言・同じ絵・同じ飾り）。
var EXTLINK_SCRIPT_ =
'<script>(function(){' +
'var app=false;' +
'try{app=(window.navigator.standalone===true)||(window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches);}catch(e){}' +
'if(!app)return;' +
'var a=document.querySelectorAll(\'a.tile[target="_blank"]\');' +
'for(var i=0;i<a.length;i++){(function(el){el.addEventListener("click",function(ev){' +
'var u=el.getAttribute("href");if(!u)return;ev.preventDefault();' +
'var r=document.getElementById("root");' +
'if(r)r.innerHTML=\'<div class="boot"><div class="bootText">ズコがお散歩中...</div>\'+' +
'\'<img src="icons/zuko-boot.png" alt="" class="bootIcon" onload="this.className+=&quot; ok&quot;"></div>\';' +
'window.location.href=u;' +
'});})(a[i]);}' +
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
      '</div>' + ROLEMENU_SCRIPT_ + EXTLINK_SCRIPT_;
  }
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' + head +
    '<div class="tiles">' + shown.map(tileA_).join('') + '</div>' +
  '</div>' + EXTLINK_SCRIPT_;
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

// 前日お知らせ画面のCSS。カードの中に「日付を選ぶ」＋作るボタン＋知らせの帯、その下に確認画面の枠。
// ★★見た目はパソコン版の同じ画面（LINE前日お知らせ送信\programs\notice_home.py）と同じにそろえる。
//   ★2026-08-24 まるちゃん指示「スマホもパソコン版の色合いに」：パソコンの画面は濃い色の設定で使われて
//     いるので、そこで出ている色（濃い紺のカード・薄い灰色の見出し・明るい文字）をそのまま写した。
//     見出しの文字もパソコンと同じ白にする（このボタンの画面だけ・他の画面の橙色はそのまま）。
//   ★どちらかの見た目を直したら、必ずもう片方も同じに直す（PC版とスマホ版は常に同じ）。
var ZENJITSUCSS_ =
  /* ★2026-09-08：スマホの開発版でも、パソコン版と同じことができるようにした画面の見た目。
     色は台湾トマトの形にそろえる（青緑の地・白い角丸カード・白い丸の戻る）。 */
  '  .zjbox { position:fixed; inset:0; z-index:90; overflow:auto; background:#2C7A99; padding:14px; }' +
  '  .zjbox-in { max-width:900px; margin:0 auto; background:#101a2b; border:1px solid #26324a;' +
  '    border-radius:14px; padding:16px; color:#e8eef7; }' +
  '  .zjbox h2 { font-size:1.5rem; font-weight:900; margin:10px 0 8px; }' +
  '  .zjbox h3 { font-size:1.25rem; font-weight:800; margin:16px 0 6px; }' +
  '  .zjback { font:inherit; font-size:1.05rem; font-weight:800; background:#fff; color:#0f172a;' +
  '    border:0; border-radius:999px; padding:10px 20px; cursor:pointer; }' +
  '  .zjnote { font-size:1rem; line-height:1.6; color:#cbd5e1; margin:8px 0; }' +
  '  .zjnote.prac { background:#3a3410; color:#f6d98f; border-radius:9px; padding:10px 12px; }' +
  '  .zjnote.real { background:#4a1414; color:#fecaca; border-radius:9px; padding:10px 12px; }' +
  '  .zjlabel { font-size:1.1rem; font-weight:800; color:#94a3b8; margin:12px 0 6px; }' +
  '  .zjinput { width:100%; box-sizing:border-box; background:#0b1220; color:#e8eef7; color-scheme:dark;' +
  '    border:2px solid #2563eb; border-radius:10px; padding:12px; font:inherit; font-size:1.3rem; font-weight:800; }' +
  '  .zjrow2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px; }' +
  '  .zjgo { font:inherit; font-size:1.15rem; font-weight:800; color:#fff; background:#0f766e;' +
  '    border:0; border-radius:10px; padding:14px 10px; cursor:pointer; margin-top:12px; width:100%; }' +
  '  .zjnow { font:inherit; font-size:1.15rem; font-weight:800; color:#fff; background:#b91c1c;' +
  '    border:0; border-radius:10px; padding:14px 10px; cursor:pointer; }' +
  '  .zjrow2 .zjgo { margin-top:0; }' +
  '  .zjlist { margin-top:14px; }' +
  '  .zjli { padding:8px 0; border-bottom:1px solid #26324a; font-size:1rem; }' +
  '  .zjpick { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:10px; margin:10px 0; }' +
  '  .zjpi { font:inherit; background:#0b1220; color:#e8eef7; border:2px solid #26324a; border-radius:12px;' +
  '    padding:10px 8px; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:6px;' +
  '    font-size:.95rem; font-weight:700; opacity:.45; }' +
  '  .zjpi.on { opacity:1; border-color:#22c55e; }' +
  '  .zjpi img { width:100%; max-width:120px; border-radius:6px; }' +
  '  .zjkikan { font-size:.85rem; font-weight:700; color:#a7f3d0; }' +
  '  .zjbigimg { width:100%; border-radius:10px; margin-top:10px; }' +
  '  .zjcase { border-top:1px solid #26324a; padding-top:10px; margin-top:14px; }' +
  '  .zjwide { display:block; width:100%; font:inherit; font-size:1.2rem; font-weight:800; color:#fff;' +
  '    background:#0f766e; border:0; border-radius:10px; padding:15px 10px; margin-top:10px; cursor:pointer; }' +
  '  .zjwide.plan { background:#7c3aed; }' +
  '  .zjtabs { display:flex; gap:8px; flex-wrap:wrap; margin:12px 0; }' +
  '  .zjtab { font:inherit; font-size:1rem; font-weight:800; color:#e8eef7; background:#0b1220;' +
  '    border:1px solid #26324a; border-radius:999px; padding:10px 18px; cursor:pointer; }' +
  '  .zjtab.on { background:#7c3aed; border-color:#7c3aed; color:#fff; }' +
  '  .zjpl { border:1px solid #26324a; border-left:4px solid #7c3aed; border-radius:10px;' +
  '    padding:12px; margin-top:10px; }' +
  '  .zjplh { display:flex; gap:8px; align-items:center; flex-wrap:wrap; font-weight:800; }' +
  '  .zjcancel { font:inherit; font-weight:800; background:#fee2e2; color:#991b1b; border:0;' +
  '    border-radius:8px; padding:8px 16px; cursor:pointer; margin-left:auto; }' +
  '  .zjcancel:disabled { opacity:.4; cursor:default; }' +
  '  .zjask { position:fixed; inset:0; z-index:95; display:flex; align-items:center; justify-content:center;' +
  '    background:rgba(0,0,0,.55); padding:16px; }' +
  '  .zjask-in { background:#101a2b; border:2px solid #7c3aed; border-radius:14px; padding:22px;' +
  '    max-width:520px; text-align:center; color:#e8eef7; }' +
  '  .zjaskmsg { font-size:1.2rem; font-weight:800; line-height:1.6; }' +
  '  .zjasksub { font-size:.95rem; font-weight:600; color:#cbd5e1; }' +
  '  .zjaskrow { display:flex; gap:12px; justify-content:center; margin-top:16px; }' +
  '  .zjaskyes { font:inherit; font-size:1.05rem; font-weight:800; color:#fff; background:#7c3aed;' +
  '    border:0; border-radius:9px; padding:12px 28px; cursor:pointer; }' +
  '  .zjaskno { font:inherit; font-size:1.05rem; font-weight:800; color:#e8eef7; background:#0b1220;' +
  '    border:1px solid #26324a; border-radius:9px; padding:12px 28px; cursor:pointer; }' +
  '  .zjallcancel { display:block; width:100%; font:inherit; font-size:1.1rem; font-weight:800;' +
  '    color:#fff; background:#b91c1c; border:0; border-radius:10px; padding:14px 10px; cursor:pointer; }' +
  '  .zjhead .bname { color:#fff; }' +
  '  .zjcard { background:#131c2e; border:1px solid #26324a; border-left:4px solid #2563eb;' +
  '    border-radius:12px; padding:16px 16px 18px; box-shadow:0 1px 3px rgba(0,0,0,.06); margin-top:6px; }' +
  '  .zjlabel { font-size:1.37rem; font-weight:800; color:#94a3b8; margin-bottom:8px; }' +
  /* ★日付は「押して選べる」と分かる見た目に（青い枠＋右端に大きなカレンダーの絵・2026-08-21まるちゃん） */
  '  .zjdatebox { display:flex; align-items:center; gap:10px; background:#0b1220; color-scheme:dark;' +
  '    border:2px solid #2563eb; border-radius:10px; padding:6px 12px 6px 6px; cursor:pointer; }' +
  '  .zjdatepick { font-size:1.8rem; line-height:1; pointer-events:none; }' +
  /* ★横幅は「残りに合わせる」（100%にすると右のカレンダーの絵が枠から押し出される）。 */
  '  #zjdate { flex:1 1 0; min-width:0; width:auto; background:transparent; color:#e8eef7; border:0;' +
  '    padding:10px 6px; font:inherit; font-size:2rem; font-weight:900; cursor:pointer;' +
  '    font-variant-numeric:tabular-nums; letter-spacing:.02em; }' +
  '  #zjdate:focus { outline:none; }' +
  /* ★2026-08-24 まるちゃん指摘「カレンダーが二つにずれてる」：日付欄が自分で出すカレンダーの絵を
     消して、こちらで置いた絵（📅）1つだけにする。枠のどこを押してもカレンダーは開く。 */
  '  #zjdate::-webkit-calendar-picker-indicator { -webkit-appearance:none; appearance:none;' +
  '    display:none; opacity:0; width:0; padding:0; margin:0; border:0; }' +
  /* ★左右に必ず並べる（狭い画面でも縦積みにしない・2026-08-21まるちゃん） */
  '  .zjopts { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:14px; }' +
  /* ボタンが1つだけの時（スタッフ版＝未送信の分だけ作成を出さない）は横いっぱいに広げる。 */
  '  .zjopts.one { grid-template-columns:1fr; }' +
  '  .zjopt { font:inherit; font-size:1.35rem; font-weight:700; line-height:1.4; color:#fff;' +
  '    background:#2563eb; border:1px solid #2563eb; border-radius:10px; padding:16px 8px; cursor:pointer; }' +
  '  .zjopt:active { transform:translateY(1px); }' +
  '  .zjopt:disabled { opacity:.4; cursor:default; }' +
  /* 幅が狭い時も左右のままにして、文字だけ少し小さくする（縦積みにしない）。 */
  '  @media (max-width:480px) { .zjopt { font-size:1.05rem; padding:14px 6px; } }' +
  /* 何も起きていない時の案内文＝濃いカードの上なので明るい文字にする（下の3色が付いた時は
     それぞれの色が上書きするので、そのまま濃い文字で読める）。 */
  '  .zjstatus { margin-top:12px; padding:12px 14px; border-radius:10px; font-size:1.05rem;' +
  '    font-weight:700; line-height:1.5; color:#e8eef7; }' +
  '  .zjstatus.wait { background:#fef9c3; color:#854d0e; }' +
  '  .zjstatus.ok { background:#dcfce7; color:#166534; }' +
  '  .zjstatus.err { background:#fee2e2; color:#991b1b; }' +
  /* できあがったお知らせを入れる枠＝中の紙と同じ黒っぽい色にする（白い縁が見えないように）。 */
  '  .zjframe { width:100%; min-height:60vh; border:0; border-radius:14px; background:#161210;' +
  '    box-shadow:0 6px 18px rgba(0,0,0,.14); display:block; margin-top:12px; }' +
  /* ★2026-09-08まるちゃん指示：「はい、復元する」を押したあとでも、いつでも機械が作ったままに戻せる。 */
  '  .zjfreshbar { display:flex; justify-content:flex-end; margin:12px 2px 0; }' +
  '  .zjfreshbar[hidden] { display:none; }' +
  '  .zjfreshbtn { font:inherit; font-size:1.05rem; font-weight:800; color:#fca5a5; background:#0b1220;' +
  '    border:2px solid #f87171; border-radius:10px; padding:11px 20px; cursor:pointer; }';

/** 前日お知らせ（社長確認用・開発URL専用）。PC版と同じ「来店日を選ぶ」入口。
 *  日付を選んで押す→事務所PCへ依頼(op=zenjitsu)→PCが確認画面HTMLを notice_<端末>.json に書き出す
 *  →それを枠(iframe)に入れて表示＝PC版とまったく同じ画面。顧客履歴検索(cust_search)と同じ往復方式。 */
function renderZenjitsuPage_(base, staff, dev) {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var script =
  '<script>(function(){' +
  'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
  /* ★2026-09-08まるちゃん指示：**スタッフにも前日お知らせの全機能を出す**。
     ここで開発版かどうかを見分けるのはやめた（誰が開いても同じ物が届く）。 */
  'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
  'var slot=(idn.device||"d0").toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,32)||"default";' +
  'var dEl=document.getElementById("zjdate"),stEl=document.getElementById("zjstatus"),resEl=document.getElementById("zjres");' +
  'var btns=[].slice.call(document.querySelectorAll(".zjopt"));' +
  'function lock(b){btns.forEach(function(x){x.disabled=b;});}' +
  'function setSt(t,c){stEl.textContent=t;stEl.className="zjstatus "+(c||"");}' +
  'function esc(s){return (s==null?"":String(s)).replace(/[&<>\\"\\x27]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\\x27":"&#39;"}[c];});}' +
  'function jsonp(params,onR){var cb="__zj"+Date.now()+Math.floor(Math.random()*1000);window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
  'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
  'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
  'function fit(f){try{f.style.height="0";var h=f.contentDocument.documentElement.scrollHeight;if(h)f.style.height=(h+24)+"px";}catch(e){}}' +
  /* ★2026-09-08まるちゃん指示：「はい、復元する」を押したあとでも、いつでも
     **機械が作ったままの状態に戻せる**ようにする。作り直し（数十秒）を待たず、
     さっき作ったお知らせの中身をそのまま入れ直すだけ＝一瞬で戻る。 */
  'var zjLastBody="";' +
  'function zjRender(html){' +
  'resEl.innerHTML="<div class=\\"zjfreshbar\\" id=\\"zjfreshbar\\" hidden><button type=\\"button\\" id=\\"zjfreshbtn\\" class=\\"zjfreshbtn\\">↩ まっさらに戻す</button></div>"' +
  '+"<iframe id=\\"zjframe\\" class=\\"zjframe\\" srcdoc=\\""+esc(html)+"\\"></iframe>";' +
  'var fb=document.getElementById("zjfreshbtn");if(fb)fb.onclick=zjFresh;' +
  'var f=document.getElementById("zjframe");f.addEventListener("load",function(){fit(f);});' +
  'setTimeout(function(){fit(f);},600);setTimeout(function(){fit(f);},1600);setTimeout(function(){fit(f);},3200);}' +
  /* ★2026-09-08まるちゃん指示：**覚えている作業がある時だけ**出す（無い時は出さない）。
     数え方は「復元しますか？」と同じ＝確認済にした人と、文を直した人の合計。 */
  'function zjFreshShow(on){var b=document.getElementById("zjfreshbar");if(b)b.hidden=!on;}' +
  'function zjWipHas(st){return !!st&&((st.done||[]).length+Object.keys(st.text||{}).length)>0;}' +
  'function zjFresh(){if(!zjLastBody)return;' +
  'var b=document.createElement("div");b.className="zjask";' +
  'b.innerHTML="<div class=\\"zjask-in\\"><div class=\\"zjaskmsg\\">確認済・直した文をすべて消して、<br>機械が作ったままの状態に戻します。よろしいですか？</div>"' +
  '+"<div class=\\"zjaskrow\\"><button type=\\"button\\" class=\\"zjaskyes\\">はい、まっさらに戻す</button>"' +
  '+"<button type=\\"button\\" class=\\"zjaskno\\">やめる</button></div></div>";' +
  'document.body.appendChild(b);' +
  'b.querySelector(".zjaskno").onclick=function(){b.remove();};' +
  'b.querySelector(".zjaskyes").onclick=function(){b.remove();' +
  'var old=document.getElementById("zjrestask");if(old)old.remove();' +
  'zjClearLocal(zjCurDate);zjRender(zjLastBody);zjFreshShow(false);};}' +
  'function showResult(d){var t=ZJ.resultText(d);' +
  'setSt(t.text,t.kind);' +
  'if(!t.showBody){resEl.innerHTML="";zjLastBody="";return;}' +
  'zjLastBody=d.body_html;zjRender(zjLastBody);}' +
  'window.addEventListener("resize",function(){var f=document.getElementById("zjframe");if(f)fit(f);});' +
  // ★2026-09-04：あきらめるまでの回数を**自分で決めない**。事務所パソコンが許している秒数
  //   （受付係のコードから機械で写した op_limits.js）に聞く＝LIMITS.tries("zenjitsu",1300)。
  //   前は「1.3秒×160回＝208秒」と手で書いており、事務所側を伸ばしても画面が先にあきらめる形だった。
  //   （元の数字は2026-08-24に「お知らせ作りは実データで最長45秒」の前提で決めた物。
  //     その後8/25に下ごしらえ（最新化＋やること一覧の作り直し）が入って中身が重くなっている。）
  'var polls=0;function poll(id){polls++;if(polls>LIMITS.tries("zenjitsu",1300)){setSt("時間切れです。事務所PCが動いているかご確認のうえ、もう一度お試しください。","err");lock(false);return;}' +
  'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){setSt("エラー："+((r&&r.error)||"不明"),"err");lock(false);return;}' +
  /* ★待っている間、何秒たったかを出す（パソコンの窓と同じ）。長くかかる時に固まったように見えないため。 */
  'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){' +
  'setSt(waitMsg+"（"+Math.round((Date.now()-startedAt)/1000)+"秒）","wait");' +
  'setTimeout(function(){poll(id);},1300);return;}' +
  'lock(false);' +
  'if(r.status!=="done"){setSt("作成に失敗しました："+esc(r.result||r.status),"err");return;}' +
  'jsonp({action:"data",name:"notice_"+slot+".json"},function(d){showResult(d);setTimeout(function(){zjAskRestore(zjCurDate);},900);});});}' +
  /* ★押したボタンの方で作る（mode="all"＝全員分／"unsent"＝まだLINEで送っていない人の分だけ）。
     依頼の中身は必ず fields のひとまとめ箱に入れる＝Google側の窓口は中身を判断せず素通しするだけ。 */
  'var waitMsg="",startedAt=0;' +
  'function run(mode){var date=(dEl.value||"").trim();if(!date){setSt("来店日を選んでください。","err");return;}' +
  'zjCurDate=date;' +
  'waitMsg=(mode==="unsent")?"まだ送っていない人の分を事務所PCで作成中…":"全員分を事務所PCで作成中…";startedAt=Date.now();' +
  'lock(true);setSt(waitMsg+"（通常、数十秒かかります）","wait");' +
  'resEl.innerHTML="";polls=0;' +
  'jsonp({action:"submit",key:KEY,op:"zenjitsu",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({date:date,slot:slot,mode:mode})},' +
  'function(r){if(!r||!r.ok||!r.id){setSt("依頼を送れませんでした："+((r&&r.error)||"不明"),"err");lock(false);return;}setTimeout(function(){poll(r.id);},1000);});}' +
  /* ★最初から入っている日付＝翌営業日。**決まりは共通の1本に聞く**（2026-08-24 まるちゃん）。
     定休日そのものは 共通\business_day.py（Pythonの正本）から自動で作られる shop_rules.js が持つ。
     ★ここに定休日を書き写さないこと。 */
  'var _zjd=(typeof ZJ!=="undefined")?ZJ.defaultDateISO():"";if(_zjd)dEl.value=_zjd;' +
  /* ★画面を開いただけでは作らない＝押した時だけ作る（2026-08-21まるちゃん「自動はやめて」）。
     パソコンの窓と同じ動き。日付を変えただけでも作らない。 */
  /* 日付の枠のどこを押してもカレンダーが開く（押せると分かりやすくするため）。 */
  'var dbox=document.getElementById("zjdatebox");' +
  'if(dbox){dbox.addEventListener("click",function(){try{dEl.showPicker();}catch(e){dEl.focus();}});}' +
  'btns.forEach(function(b){b.addEventListener("click",function(){run(b.getAttribute("data-mode"));});});' +
  'zjSweepLocal();' +   /* 開いた時に、ご来店の日が過ぎた分の覚えを捨てる */
  'var _pb=document.getElementById("zjplanbtn");if(_pb)_pb.onclick=zjPlans;' +
  'var _ib=document.getElementById("zjimgsetbtn");if(_ib)_ib.onclick=zjImgSet;' +
  /* ★2026-09-07：枠の中の確認画面（開発版はボタン付き）から届く合図を受ける。
     fit＝カードが減って高さが変わった／scrollto＝そのカードの所まで動かしてほしい。
     画像の入れ替えと送る日時は事務所パソコンの窓でしかできないので、枠の中で隠してある。 */
  /* ★2026-09-08まるちゃん決定：**開発版のスマホを100%パソコン版と同じにする。**
     用事は事務所パソコンへ丸投げし（zenjitsu_act）、答えをそのまま画面に出す。
     中身の判断はパソコンの窓の1本が持つ＝スマホ側に写しを作らない。 */
  /* ★★2026-09-09まるちゃん決定：**大きい依頼は住所（URL）に詰めず、別の入口へ丸ごと預ける。**
     なぜ＝依頼の中身を全部住所に詰めていたので、確認済が3人ほどになると長すぎて
     **事務所パソコンに一件も届かなかった**（9/9に8人ぶん＝住所が51,282文字で門前払い）。
     実測の限り＝住所は12,093文字まで／窓口が受け取る中身は8,000文字まで。
     判断は共通の1本（共通\画面\大きい依頼_別送.js＝bigsend.js）だけが持つ＝ここでは数えない。
     短い依頼は今までと1文字も変わらない形で飛ぶ。 */
  'function zjAsk(job,payload,onDone,onFail){' +
  'var F={job:job,payload:payload||{}};' +
  'var go=function(ft){' +
  'jsonp({action:"submit",key:KEY,op:"zenjitsu_act",who:idn.who,role:idn.role,device:idn.device,' +
  'fields:ft},function(r){' +
  /* ★2026-09-08：ここで「送れませんでした」と**言い切らない**。事務所パソコンは受け取って
     やり終えているのに、返事だけが戻ってこないことがあるため（9/8に実際に発生）。 */
  'if(!r||!r.ok||!r.id){(onFail||function(){})("事務所のパソコンとつながりませんでした。");return;}' +
  'var n=0;(function poll(){n++;if(n>LIMITS.tries("zenjitsu_act",700)){(onFail||function(){})("時間がかかりすぎました。");return;}' +
  'jsonp({action:"status",key:KEY,id:r.id},function(s){if(!s||!s.ok){(onFail||function(){})("通信に失敗しました。");return;}' +
  'if(s.status==="pending"||s.status==="running"||s.status==="queued"||s.status===""){setTimeout(poll,700);return;}' +
  'if(s.status!=="done"){(onFail||function(){})(String(s.result||"うまくいきませんでした。"));return;}' +
  'var d=null;try{d=JSON.parse(s.result);}catch(e){d={ok:false,error:String(s.result||"")};}' +
  'onDone(d);});})();});};' +
  'if(typeof BIG==="undefined"){go(JSON.stringify(F));return;}' +
  'BIG.prepare({exec:EXEC,key:KEY,slot:slot,op:"zenjitsu_act",tag:job,' +
  'who:idn.who,role:idn.role,device:idn.device,fields:F},go,' +
  'function(e){(onFail||function(){})(e);});}' +
  /* 枠の中（確認画面）から届く合図を受ける。 */
  'window.addEventListener("message",function(ev){var m=ev.data||{};if(!m.zj)return;' +
  'var f=document.getElementById("zjframe");' +
  'if(m.zj==="fit"){if(f)setTimeout(function(){fit(f);},60);return;}' +
  'if(m.zj==="scrollto"){if(f)setTimeout(function(){fit(f);' +
  'try{var y=f.getBoundingClientRect().top+window.pageYOffset+(m.top||0)-12;' +
  'window.scrollTo({top:y,behavior:"smooth"});}catch(e){}},80);return;}' +
  'if(m.zj==="sendplan"){zjSendPlan(m.rows||[]);return;}' +
  'if(m.zj==="preview"){zjBigImage(m.key,m.lang);return;}' +
  'if(m.zj==="imgfix"){zjPersonImg(m.id,m.info||{});return;}' +
  'if(m.zj==="imgset"){zjImgSet();return;}' +
  /* ★2026-09-08まるちゃん決定：途中までの作業を**この端末の中だけ**に覚え、次に作り直した時に戻す。 */
  'if(m.zj==="state"){zjSaveLocal(zjCurDate,m.state);zjFreshShow(zjWipHas(m.state));return;}' +
  '});' +
  /* ── 送信を設定する（パソコン版の『送る日時を決める』と同じ流れ） ───────── */
  'var zjRows=[];var zjCurDate="";' +
  /* ── 途中までの作業を、この端末に覚える／読む（他の人には影響しない） ── */
  /* ★2026-09-08：途中までの作業は**事務所のパソコンに、この端末の分だけ**を分けてしまう。
     （パソコンの窓では端末に記憶できないと分かったので、スマホも同じ道にそろえる＝食い違わない） */
  'function zjSaveLocal(day,st){if(!day||!st)return;zjAsk("wip_save",{device:slot,date:day,state:st},function(){},function(){});}' +
  'function zjClearLocal(day){if(!day)return;zjAsk("wip_clear",{device:slot,date:day},function(){},function(){});}' +
  'function zjLoadLocal(day,onGot){zjAsk("wip_load",{device:slot,date:day},function(r){onGot((r&&r.ok)?(r.state||null):null);},function(){onGot(null);});}' +
  'function zjSweepLocal(){}' +
  /* 作り直したあと、途中までの作業があれば「復元しますか？」と聞く。 */
  'function zjAskRestore(day){zjLoadLocal(day,function(st){if(!st)return;' +
  'var n=(st.done||[]).length+Object.keys(st.text||{}).length;if(!n)return;' +
  'var b=document.createElement("div");b.className="zjask";b.id="zjrestask";' +
  'b.innerHTML="<div class=\\"zjask-in\\"><div class=\\"zjaskmsg\\">既に作業した確認済・修正済を復元しますか？<br>"' +
  '+"<span class=\\"zjasksub\\">（確認済 "+(st.done||[]).length+" 人ぶん・直した文 "+Object.keys(st.text||{}).length+" 人ぶん）</span></div>"' +
  '+"<div class=\\"zjaskrow\\"><button type=\\"button\\" class=\\"zjaskyes\\">はい、復元する</button>"' +
  '+"<button type=\\"button\\" class=\\"zjaskno\\">いいえ、まっさらから始める</button></div></div>";' +
  'document.body.appendChild(b);' +
  'b.querySelector(".zjaskno").onclick=function(){b.remove();zjClearLocal(day);zjFreshShow(false);};' +
  'b.querySelector(".zjaskyes").onclick=function(){b.remove();zjFreshShow(true);' +
  'var f=document.getElementById("zjframe");' +
  'var go=function(){try{f.contentWindow.postMessage({zj:"restore",state:st},"*");}catch(e){}};' +
  'go();setTimeout(go,700);setTimeout(go,1800);};});}' +
  'function zjBox(html){var b=document.getElementById("zjbox");' +
  'if(!b){b=document.createElement("div");b.id="zjbox";b.className="zjbox";document.body.appendChild(b);}' +
  'b.innerHTML=html;b.hidden=false;window.scrollTo(0,0);return b;}' +
  'function zjBoxClose(){var b=document.getElementById("zjbox");if(b){b.hidden=true;b.innerHTML="";}}' +
  'function zjTwo(n){return (n<10?"0":"")+n;}' +
  'function zjSendPlan(rows){zjRows=rows||[];' +
  'var d=new Date();d.setDate(d.getDate()+0);' +
  'var 既定="";try{var p=(zjRows[0]&&zjRows[0].date)||"";}catch(e){}' +
  'var b=zjBox("<div class=\\"zjbox-in\\"><button type=\\"button\\" class=\\"zjback\\" id=\\"zjbk\\">← 前に戻る</button>"' +
  '+"<h2>📤 確認済 "+zjRows.length+" 人のお知らせの送信を設定する</h2>"' +
  '+"<div id=\\"zjmode\\" class=\\"zjnote\\">読み込んでいます…</div>"' +
  '+"<div class=\\"zjlabel\\">送る日時</div>"' +
  '+"<input type=\\"datetime-local\\" id=\\"zjat\\" class=\\"zjinput\\">"' +
  '+"<div class=\\"zjrow2\\"><button type=\\"button\\" class=\\"zjgo\\" id=\\"zjput\\">この日時で送信の予約をする</button>"' +
  '+"<button type=\\"button\\" class=\\"zjnow\\" id=\\"zjnow\\">⚡ 今すぐ送る</button></div>"' +
  '+"<div id=\\"zjmsg\\" class=\\"zjnote\\"></div>"' +
  '+"<div id=\\"zjlist\\" class=\\"zjlist\\"></div></div>");' +
  'document.getElementById("zjbk").onclick=zjBoxClose;' +
  'var now=new Date();now.setMinutes(now.getMinutes()+5);' +
  'document.getElementById("zjat").value=now.getFullYear()+"-"+zjTwo(now.getMonth()+1)+"-"+zjTwo(now.getDate())+"T"+zjTwo(now.getHours())+":"+zjTwo(now.getMinutes());' +
  'document.getElementById("zjlist").innerHTML=zjRows.map(function(r){' +
  'return "<div class=\\"zjli\\"><b>"+esc(r.time)+"</b> "+esc(r.name)+"　"+esc(r.fnum||"新規")' +
  '+"／"+esc(r.lang)+"／画像 "+((r.images||[]).length)+"枚"' +
  '+(((r.chat||"").indexOf("U")===0)?"":"　⛔LINEが分かりません")+"</div>";}).join("");' +
  /* ★2026-09-09まるちゃん指示：**本番の時は何も出さない**（当たり前のことを毎回出さない）。
     練習中の時だけ出す＝そこは知らないと困るから。 */
  'zjAsk("send_status",{},function(d){' +
  'var el=document.getElementById("zjmode");if(!el)return;' +
  'if(!d.practice){el.style.display="none";el.innerHTML="";return;}' +
  'el.style.display="";' +
  'el.innerHTML="🧪 <b>練習モードです。</b>誰を選んでも、まるちゃん本人にだけ届きます。";' +
  'el.className="zjnote prac";},function(e){});' +
  'document.getElementById("zjput").onclick=function(){zjPut(false);};' +
  'document.getElementById("zjnow").onclick=function(){zjPut(true);};}' +
  'function zjPut(sugu){' +
  'var msg=document.getElementById("zjmsg");' +
  'var at=(document.getElementById("zjat").value||"").replace("T"," ");' +
  'if(sugu){var n=new Date();n.setSeconds(n.getSeconds()-30);' +
  'at=n.getFullYear()+"-"+zjTwo(n.getMonth()+1)+"-"+zjTwo(n.getDate())+" "+zjTwo(n.getHours())+":"+zjTwo(n.getMinutes());}' +
  'if(!at){msg.textContent="⛔ 日時を決めてください";return;}' +
  'var 日=(zjRows[0]&&zjRows[0].date)||(document.getElementById("zjdate")||{}).value||"";' +
  'msg.textContent=sugu?"⏳ 送信しています…":"⏳ 送信の予約をしています…";' +
  'zjAsk("put_sends",{date:日,at:at,rows:zjRows,now:!!sugu},function(d){' +
  'if(!d.ok){msg.textContent="⛔ "+(d.error||"送れませんでした");return;}' +
  'if(d.put){zjClearLocal(日);zjFreshShow(false);}' +   /* ★送信を設定したら、覚えていた途中の作業は消す */
  /* ★2026-09-09まるちゃん指示：**「予約できた」のか「送った」のかを、はっきり書き分ける。**
     押したボタンで意味がまるで違うのに、前は同じ曖昧な文だった。 */
  'var t=sugu?("✅ "+d.put+"人に今から送信します。")' +
  ':("✅ "+d.put+"人ぶんの送信の予約を設定しました。まだ送信していません。"+at+" になったら自動で送ります。");' +
  'if(d.ng&&d.ng.length)t+="／できなかった人："+d.ng.join("／");' +
  'if(d.notes&&d.notes.length)t+="／前の続きから送ります："+d.notes.join("／");' +
  'msg.textContent=t;' +
  'if(sugu&&d.put)zjWatch(d.ids||[],d.put);' +
  /* ★2026-09-09：別の入口へ預けられなかった端末では、今までの道に自動で戻り、
     住所に入る人数ずつに分けて置く（黙って落とさない＝最後に必ず結果を出す）。 */
  '},function(e){if(String(e).indexOf("大きい依頼を預けられませんでした")===0){zjPutWakete(日,at,sugu);return;}' +
  'zjPutTashikame(日,at,e,sugu);});}' +
  /* 住所に入る大きさで、何人ずつの束にするかを決める（数え方は共通の1本に聞く）。 */
  'function zjTaba(rows){var out=[],cur=[];' +
  'var d={exec:EXEC,key:KEY,op:"zenjitsu_act",who:idn.who,role:idn.role,device:idn.device};' +
  'for(var i=0;i<rows.length;i++){' +
  'var t=cur.concat([rows[i]]);' +
  'var f=JSON.stringify({job:"put_sends",payload:{date:"0000-00-00",at:"0000-00-00 00:00",rows:t,now:false}});' +
  'if(cur.length&&typeof BIG!=="undefined"&&!BIG.fits(d,f)){out.push(cur);cur=[rows[i]];}' +
  'else{cur.push(rows[i]);}}' +
  'if(cur.length)out.push(cur);return out;}' +
  /* 最後の束だけ「今すぐ」の合図を付ける＝全員置き終わってから見張りが動く（取り残さない）。 */
  'function zjPutWakete(日,at,sugu){' +
  'var msg=document.getElementById("zjmsg");' +
  'var 束=zjTaba(zjRows);var i=0,put=0,ng=[],notes=[],ids=[];' +
  '(function next(){' +
  'if(i>=束.length){' +
  'if(put){zjClearLocal(日);zjFreshShow(false);}' +
  'var t=put?(sugu?("✅ "+put+"人に今から送信します。")' +
  ':("✅ "+put+"人ぶんの送信の予約を設定しました。まだ送信していません。"+at+" になったら自動で送ります。"))' +
  ':(sugu?"⛔ 全員の送信が失敗しました。":"⛔ 全員の送信の予約が失敗しました。");' +
  'if(ng.length)t+="／できなかった人："+ng.join("／");' +
  'if(notes.length)t+="／前の続きから送ります："+notes.join("／");' +
  'msg.textContent=t;' +
  'if(sugu&&put)zjWatch(ids,put);return;}' +
  'var 最後=(i===束.length-1);' +
  'msg.textContent=(sugu?"⏳ 送信しています…（":"⏳ 送信の予約をしています…（")+(i+1)+"／"+束.length+"）";' +
  'zjAsk("put_sends",{date:日,at:at,rows:束[i],now:(最後&&!!sugu)},function(d){' +
  'if(d&&d.ok){put+=(d.put||0);ng=ng.concat(d.ng||[]);notes=notes.concat(d.notes||[]);ids=ids.concat(d.ids||[]);}' +
  'else{ng.push("この分は置けませんでした（"+((d&&d.error)||"不明")+"）");}' +
  'i++;next();},function(e2){ng.push("この分は届きませんでした（"+e2+"）");i++;next();});})();}' +
  /* ★2026-09-08まるちゃん指示：返事が戻ってこなかった時に「⛔依頼を送れませんでした」と
     **言い切らない**。事務所パソコンは置けているのに返事だけが消えることがあるため
     （9/8に実際に発生＝2人ぶん置けていて、お客様にもちゃんと届いていたのに赤字が出た）。
     → 必ず「本当に置けたか」を聞き直してから出す。置けていたら成功として見せる。
     ★聞くのは**読むだけ**の用事（put_check）＝依頼をもう一度投げない
       （お客様に届く操作を二度投げるより安全。二重置きは事務所パソコン側でも止めている）。 */
  /* ★2026-09-09まるちゃん指示：**この3つの文が意味不明だった**ので書き直した。
     「うまく通じませんでした（届いているかもしれません）。確かめましたが、まだ置けていません」は、
     届いたのか届いていないのか読んでも分からない（言っていることが逆に見える）。
     → **今どうなっているのか**と**次に何をすればよいか**だけを、はっきり1つずつ書く。
     つないでいた理由の文（機械の言い分）は出さない＝スタッフには意味が無いため。 */
  /* ★2026-09-09まるちゃん指示で全部書き直した。前の文は
     「予約できたのか送ったのかどっち？」「画面に返事が…とは？」「事務所のパソコンはスタッフに関係ない」
     「もう一度何を押すの？」「載っていなければ、とは何が？」と、どれも意味が伝わらなかった。
     → ①予約か送信かをはっきり書く ②裏の話はいっさい書かない
       ③押すボタンの名前をそのまま書く ④どこで何を見るかを名前で書く。 */
  'function zjPutTashikame(日,at,理由,sugu){' +
  'var msg=document.getElementById("zjmsg");' +
  'var ボタン=sugu?"⚡ 今すぐ送る":"この日時で送信の予約をする";' +
  'msg.textContent=sugu?"⏳ 送信できたか確かめています…":"⏳ 送信の予約ができたか確かめています…";' +
  'var eids=zjRows.map(function(r){return r.id;});' +
  'zjAsk("put_check",{date:日,event_ids:eids},function(d){' +
  'if(d&&d.ok&&d.put>0){zjClearLocal(日);zjFreshShow(false);' +
  'msg.textContent=(sugu?("✅ "+d.put+"人に今から送信します。")' +
  ':("✅ "+d.put+"人ぶんの送信の予約を設定しました。まだ送信していません。"+at+" になったら自動で送ります。"))' +
  '+"「"+ボタン+"」をもう一度押さないでください。";' +
  'if(sugu&&(d.ids||[]).length)zjWatch(d.ids,d.put);return;}' +
  'msg.textContent=(sugu?"⛔ 全員の送信が失敗しました。":"⛔ 全員の送信の予約が失敗しました。")' +
  '+"「"+ボタン+"」をもう一度押してください。";' +
  '},function(e2){msg.textContent=(sugu?"⛔ 送信が完了したか分かりません。"' +
  ':"⛔ 送信の予約の設定が完了したか分かりません。")' +
  '+"「← 前に戻る」で戻り、「📨 予約送信の設定完了したお知らせ一覧」を開いてください。'
  + 'この"+zjRows.length+"人が全員、一覧に並んでいれば"' +
  '+(sugu?"送信されています。":"送信の予約が完了しています。")' +
  '+"リストになければ、ここへ戻って「"+ボタン+"」をもう一度押してください。";});}' +
  'function zjWatch(ids,zenbu){var msg=document.getElementById("zjmsg");var t0=Date.now();var n=0;' +
  '(function tick(){n++;if(n>80){msg.textContent="⏳ まだ送っています。一覧でご確認ください。";return;}' +
  'zjAsk("send_progress",{ids:ids},function(s){' +
  'var 秒=Math.round((Date.now()-t0)/1000);' +
  'if(!s.ok||s.busy>0){msg.textContent="⏳ 送っています…（"+((s.done||0)+(s.ng||0))+"／"+zenbu+"人・"+秒+"秒）";setTimeout(tick,3000);return;}' +
  'var t=(s.ng?"⚠️ ":"✅ ")+s.done+"人に送りました";' +
  'if(s.ng)t+="／"+s.ng+"人は送れませんでした："+(s.msgs||[]).join("／");' +
  'msg.textContent=t;},function(e){setTimeout(tick,3000);});})();}' +
  /* ── 画像を大きく見る ─────────────────────────────── */
  'function zjBigImage(key,lang){' +
  'zjBox("<div class=\\"zjbox-in\\"><button type=\\"button\\" class=\\"zjback\\" id=\\"zjbk2\\">← 前に戻る</button>"' +
  '+"<div id=\\"zjbig\\" class=\\"zjnote\\">読み込んでいます…</div></div>");' +
  'document.getElementById("zjbk2").onclick=zjBoxClose;' +
  'zjAsk("big_image",{key:key,lang:lang||"日"},function(d){' +
  'var el=document.getElementById("zjbig");if(!el)return;' +
  'el.innerHTML=d.ok?("<h2>"+esc(d.name)+"</h2><img class=\\"zjbigimg\\" src=\\""+d.src+"\\" alt=\\"\\">")' +
  ':("⛔ "+esc(d.error||"出せませんでした"));},function(e){' +
  'var el=document.getElementById("zjbig");if(el)el.textContent="⛔ "+e;});}' +
  /* ── その方に付く画像を修正する ─────────────────────── */
  'function zjPersonImg(eid,info){' +
  'zjBox("<div class=\\"zjbox-in\\"><button type=\\"button\\" class=\\"zjback\\" id=\\"zjbk3\\">← 前に戻る</button>"' +
  '+"<h2>🖼 "+esc((info&&info.name)||"")+" のお知らせに添付する画像</h2>"' +
  '+"<div class=\\"zjnote\\">押して入切します。決めたら『この画像で決定』を押してください。</div>"' +
  '+"<div id=\\"zjpick\\" class=\\"zjpick\\">読み込んでいます…</div>"' +
  '+"<button type=\\"button\\" class=\\"zjgo\\" id=\\"zjpicksave\\">この画像で決定</button></div>");' +
  'document.getElementById("zjbk3").onclick=zjBoxClose;' +
  'var 日=(info&&info.date)||"";var いま=(info&&info.keys)||[];' +
  'zjAsk("image_choices",{date:日,event_id:eid,now_keys:いま},function(d){' +
  'var el=document.getElementById("zjpick");if(!el)return;' +
  'if(!d.ok){el.textContent="⛔ "+(d.error||"読み込めませんでした");return;}' +
  'var 選=(d.now||[]).map(function(x){return x.key;});' +
  'el.innerHTML=(d.all||[]).map(function(x){' +
  'var on=選.indexOf(x.key)>=0;' +
  'return "<button type=\\"button\\" class=\\"zjpi"+(on?" on":"")+"\\" data-key=\\""+esc(x.key)+"\\">"' +
  '+(x.thumb?("<img src=\\""+x.thumb+"\\" alt=\\"\\">"):"")+"<span>"+esc(x.name)+"</span></button>";}).join("");' +
  'el.querySelectorAll(".zjpi").forEach(function(b){b.onclick=function(){b.classList.toggle("on");};});' +
  'document.getElementById("zjpicksave").onclick=function(){' +
  /* 枠の中のカードが待っている形（setimgs＋絵つき）でそのまま返す。 */
  'var pics=[];el.querySelectorAll(".zjpi.on").forEach(function(b){' +
  'var k=b.dataset.key;var src="";var nm=k;' +
  '(d.all||[]).forEach(function(x){if(x.key===k){src=x.thumb||"";nm=x.name||k;}});' +
  'pics.push({key:k,name:nm,src:src,lang:(info&&info.lang)||"日"});});' +
  'var f=document.getElementById("zjframe");' +
  'if(f&&f.contentWindow)f.contentWindow.postMessage({zj:"setimgs",id:eid,pics:pics},"*");' +
  'zjBoxClose();};' +
  '},function(e){var el=document.getElementById("zjpick");if(el)el.textContent="⛔ "+e;});}' +
  /* ── 画像送信セッティング ───────────────────────────── */
  'function zjImgSet(){' +
  'zjBox("<div class=\\"zjbox-in\\"><button type=\\"button\\" class=\\"zjback\\" id=\\"zjbk4\\">← 前に戻る</button>"' +
  '+"<h2>📷 画像送信セッティング</h2>"' +
  '+"<div class=\\"zjnote\\">お知らせ文のあとに、この順番で画像を送信します。送信したくない画像は「送る」をオフにしてください。</div>"' +
  '+"<div id=\\"zjcases\\">読み込んでいます…</div>"' +
  '+"<button type=\\"button\\" class=\\"zjgo\\" id=\\"zjcasesave\\">この内容で保存</button>"' +
  '+"<div id=\\"zjcasemsg\\" class=\\"zjnote\\"></div></div>");' +
  'document.getElementById("zjbk4").onclick=zjBoxClose;' +
  'zjAsk("image_settings",{},function(d){' +
  'var el=document.getElementById("zjcases");if(!el)return;' +
  'if(!d.ok){el.textContent="⛔ "+(d.error||"読み込めませんでした");return;}' +
  'el.innerHTML=(d.cases||[]).map(function(c){' +
  'var items=(c.items||[]).map(function(it,i){' +
  'return "<button type=\\"button\\" class=\\"zjpi"+(it.on!==false?" on":"")+"\\" data-case=\\""+esc(c.key)+"\\" data-key=\\""+esc(it.key)+"\\">"' +
  '+(it.ja_thumb?("<img src=\\""+it.ja_thumb+"\\" alt=\\"\\">"):"")+"<span>"+(i+1)+". "+esc(it.name)+"</span>"' +
  '+(it.kikan?("<span class=\\"zjkikan\\">📅 "+esc(it.kikan)+"</span>"):"")+"</button>";}).join("");' +
  'return "<div class=\\"zjcase\\"><h3>"+esc(c.no+" "+c.name)+"</h3><div class=\\"zjnote\\">"+esc(c.note||"")+"</div>"' +
  '+"<div class=\\"zjpick\\">"+(items||"（送る画像はありません）")+"</div></div>";}).join("");' +
  'el.querySelectorAll(".zjpi").forEach(function(b){b.onclick=function(){b.classList.toggle("on");};});' +
  'document.getElementById("zjcasesave").onclick=function(){' +
  'var picked={};(d.cases||[]).forEach(function(c){picked[c.key]=[];});' +
  'el.querySelectorAll(".zjpi.on").forEach(function(b){picked[b.dataset.case].push(b.dataset.key);});' +
  'var m=document.getElementById("zjcasemsg");m.textContent="保存しています…";' +
  'zjAsk("save_image_settings",{picked:picked},function(r){' +
  'm.textContent=r.ok?"✅ 保存しました":("⛔ "+(r.error||"保存できませんでした"));},' +
  'function(e){m.textContent="⛔ "+e;});};' +
  '},function(e){var el=document.getElementById("zjcases");if(el)el.textContent="⛔ "+e;});}' +
  /* ── 予約送信の設定完了したお知らせ一覧（パソコン版と同じ・日付のタブ＋取り消し） ── */
  'var zjPlanDay="";' +
  'function zjPlans(){' +
  'zjBox("<div class=\\"zjbox-in\\"><button type=\\"button\\" class=\\"zjback\\" id=\\"zjbk5\\">← 前に戻る</button>"' +
  '+"<h2>📨 予約送信の設定完了したお知らせ一覧</h2>"' +
  '+"<div class=\\"zjnote\\">設定時刻に自動で送信されます。未送信分は取り消せます。</div>"' +
  '+"<div id=\\"zjplmsg\\" class=\\"zjnote\\"></div>"' +
  '+"<div id=\\"zjpltabs\\" class=\\"zjtabs\\"></div>"' +
  '+"<button type=\\"button\\" class=\\"zjallcancel\\" id=\\"zjplall\\" hidden></button>"' +
  '+"<div id=\\"zjpllist\\">読み込んでいます…</div></div>");' +
  'document.getElementById("zjbk5").onclick=zjBoxClose;' +
  'zjPlansDraw();}' +
  'function zjPlansDraw(){' +
  'var box=document.getElementById("zjpllist");if(!box)return;' +
  'zjAsk("sent_plans",{},function(d){' +
  'if(!d.ok){box.textContent="⛔ 読み込めませんでした";return;}' +
  'var rows=d.rows||[];' +
  'if(!rows.length){document.getElementById("zjpltabs").innerHTML="";' +
  'document.getElementById("zjplall").hidden=true;' +
  'box.textContent="現在、送信が設定されたお知らせはありません";return;}' +
  'var 曜=["日","月","火","水","木","金","土"];' +
  'var days=[];rows.forEach(function(x){if(days.indexOf(x.send_day)<0)days.push(x.send_day);});' +
  'if(!zjPlanDay||days.indexOf(zjPlanDay)<0)zjPlanDay=days[0];' +
  'var 名=function(s){var p=s.split("-");return (+p[1])+"/"+(+p[2])+"（"+曜[new Date(+p[0],+p[1]-1,+p[2]).getDay()]+"）送信分";};' +
  'document.getElementById("zjpltabs").innerHTML=days.map(function(dd){' +
  'return "<button type=\\"button\\" class=\\"zjtab"+(dd===zjPlanDay?" on":"")+"\\" data-day=\\""+dd+"\\">"' +
  '+名(dd)+" "+rows.filter(function(x){return x.send_day===dd;}).length+"</button>";}).join("");' +
  'document.getElementById("zjpltabs").querySelectorAll(".zjtab").forEach(function(b){' +
  'b.onclick=function(){zjPlanDay=b.dataset.day;zjPlansDraw();};});' +
  'var 未=rows.filter(function(x){return x.send_day===zjPlanDay&&x.status==="pending";});' +
  'var ac=document.getElementById("zjplall");' +
  'ac.hidden=(未.length===0);ac.textContent="🚫 全ての送信予約を取り消す（"+未.length+"件）";' +
  'ac.onclick=function(){zjCancelMany(未);};' +
  'box.innerHTML=rows.filter(function(x){return x.send_day===zjPlanDay;}).map(function(x){' +
  'return "<div class=\\"zjpl\\"><div class=\\"zjplh\\">"+esc(x.send_at)+"　"+esc(x.name)+"　"' +
  '+esc(x.fnum||"新規")+"　"+esc(x.status_ja)' +
  '+"<button type=\\"button\\" class=\\"zjcancel\\" data-id=\\""+esc(x.id)+"\\""+(x.can_cancel?"":" disabled")+">"+esc(x.cancel_label||"取り消す")+"</button></div>"' +
  /* ★2026-09-09まるちゃん指示：「画像3枚」だけでは何を送ったか分からないので、呼び名も出す。 */
  '+"<div class=\\"zjnote\\">"+esc(x.date)+" ご来店分／画像 "+x.images+"枚"+((x.img_names&&x.img_names.length)?("："+esc(x.img_names.join("／"))):"")+(x.note?("　"+esc(x.note)):"")+"</div>"' +
  '+(x.warn?("<div class=\\"zjnote real\\">⚠️ "+esc(x.warn)+"</div>"):"")+"</div>";}).join("");' +
  'box.querySelectorAll(".zjcancel").forEach(function(b){if(b.disabled)return;' +
  'b.onclick=function(){var もとの文字=b.textContent;b.disabled=true;b.textContent="消しています…";' +
  'zjAsk("cancel_plan",{id:b.dataset.id},function(r){' +
  'document.getElementById("zjplmsg").textContent=r.ok?"✅ 消しました":("⛔ "+(r.error||""));' +
  'zjPlansDraw();},function(e){b.disabled=false;b.textContent=もとの文字;});};});' +
  '},function(e){box.textContent="⛔ "+e;});}' +
  'function zjCancelMany(list){' +
  'var m=document.getElementById("zjplmsg");var i=0;' +
  '(function next(){if(i>=list.length){m.textContent="✅ "+list.length+"件を取り消しました";zjPlansDraw();return;}' +
  'm.textContent="取り消しています…（"+(i+1)+"／"+list.length+"）";' +
  'zjAsk("cancel_plan",{id:list[i].id},function(){i++;next();},function(){i++;next();});})();}' +
  '})();</script>';
  return '<style>' + HOMECSS_ + ZENJITSUCSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead zjhead"><span class="bmark">🔔</span><span class="bname">前日お知らせ</span></div>' +
    '<div class="zjcard">' +
      '<div class="zjlabel">日付を選ぶ</div>' +
      '<div class="zjdatebox" id="zjdatebox">' +
        '<input type="date" id="zjdate">' +
        '<span class="zjdatepick">📅</span>' +
      '</div>' +
      /* ★2026-08-24 まるちゃん決定：「未送信の分だけ作成」はまだ隠しておく。
           スタッフ版も社長版も同じ見た目にそろえる＝「全員分を作成」の1つだけ。
           試せる場所を残すため、開発版(?dev=1)だけは今までどおり2つとも出る。 */
      '<div class="zjopts' + (ZJ.optionsShown(dev).unsent ? '' : ' one') + '">' +
        '<button type="button" class="zjopt" data-mode="all">全員分を作成</button>' +
        (ZJ.optionsShown(dev).unsent ? '<button type="button" class="zjopt" data-mode="unsent">未送信の分だけ作成</button>' : '') +
      '</div>' +
      /* ★2026-08-24 まるちゃん指示：「（お客様には送りません＝見るだけ）」の一言は消した
           （パソコン版の窓の同じ一言も一緒に消してある）。 */
      '<div class="zjstatus" id="zjstatus">' + ZJ.optionsShown(dev).hint + '</div>' +
      /* ★2026-09-08まるちゃん指示：パソコン版と同じ2つの長いボタンを**誰にでも**出す。
         （前はここのつなぎ方を書き間違えていて、この下の「できたお知らせを出す場所」ごと
           消えていた＝スマホでボタンを押しても何も出なかった。） */
      '<button type="button" class="zjwide plan" id="zjplanbtn">📨 予約送信の設定完了したお知らせ一覧</button>' +
      '<button type="button" class="zjwide" id="zjimgsetbtn">📷 画像送信セッティング</button>' +
    '</div>' +
    '<div id="zjres"></div>' +
  '</div>' + script;
}

// ====== 台湾トマト 売上・コスト（view=cost・開発URL専用／2026-07-25追加） ======
// ★開発URL(?dev=1)専用＝オーナー(開発者)だけが見られる内部ツール（kanshi/zenjitsuと同じ）。
//   tile_settings.py の TILES には入れない＝人ごとの権限画面に出ない＝誰もONにできない。
// ★数字は**事務所パソコンが作った物をそのまま出す**（2026-08-24 まるちゃん決定）。
//   以前はここに費目を1件ずつ書き写す作りだったが、空っぽのままで**押しても何も出なかった**。
//   パソコン版（台湾トマト経営\programs\cost_view.py）が作る表を、受付係の op=cost で
//   そのまま受け取って枠に出す＝**写しを持たない＝ずれない**（前日お知らせと同じやり方）。

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
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var script =
    '<script>(function(){' +
    'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
    'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
    'var slot=(idn.device||"d0").toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,32)||"default";' +
    'var b=document.getElementById("cgo"),st=document.getElementById("cstatus"),res=document.getElementById("cres");' +
    'function esc(s){return (s==null?"":String(s)).replace(/[&<>\\"\\x27]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\\x27":"&#39;"}[c];});}' +
    'function jsonp(params,onR){var cb="__ct"+Date.now()+Math.floor(Math.random()*1000);' +
    'window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
    'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
    'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();' +
    'sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
    'function fit(f){try{f.style.height="0";var h=f.contentDocument.documentElement.scrollHeight;if(h)f.style.height=(h+24)+"px";}catch(e){}}' +
    'function show(html){res.innerHTML="<iframe id=\\"cframe\\" class=\\"cframe\\" srcdoc=\\""+esc(html)+"\\"></iframe>";' +
    'var f=document.getElementById("cframe");f.addEventListener("load",function(){fit(f);});' +
    'setTimeout(function(){fit(f);},600);setTimeout(function(){fit(f);},1800);}' +
    'var polls=0;function poll(id){polls++;if(polls>LIMITS.tries("cost",700)){st.textContent="時間がかかりすぎました。もう一度お試しください。";b.disabled=false;return;}' +
    'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){st.textContent="エラー："+((r&&r.error)||"不明");b.disabled=false;return;}' +
    'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){poll(id);},700);return;}' +
    'b.disabled=false;' +
    'if(r.status!=="done"){st.textContent=String(r.result||"出せませんでした。");return;}' +
    // ★大きな表は答えに載せられないので、事務所パソコンが置き場所へ置いた物を読みに行く
    //   （前日お知らせと同じやり方・2026-08-24）。
    'st.textContent="受け取っています…";' +
    'jsonp({action:"data",name:"cost_"+slot+".json"},function(x){' +
    'var d=(x&&x.data)?x.data:x;' +
    'if(!d||!d.ok||!d.body_html){st.textContent="出せませんでした："+((d&&d.error)||"中身が空です");return;}' +
    'st.textContent="";show(d.body_html);});});}' +
    'if(b){b.addEventListener("click",function(){b.disabled=true;res.innerHTML="";' +
    'st.textContent="事務所パソコンで計算しています…（少し待ってください）";polls=0;' +
    'jsonp({action:"submit",key:KEY,op:"cost",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({part:"cost",slot:slot})},' +
    'function(r){if(!r||!r.ok||!r.id){st.textContent="依頼を送れませんでした："+((r&&r.error)||"不明");b.disabled=false;return;}' +
    'setTimeout(function(){poll(r.id);},1000);});});}' +
    '})();</script>';
  return '<style>' + HOMECSS_ + COSTCSS_ +
      '.cframe{width:100%;border:0;background:#0b2a36;border-radius:14px;}' +
      '.cstatus{color:#eaf3f7;font-weight:800;margin:10px 4px;font-size:15px;text-align:center;}' +
    '</style>' +
    '<div class="home">' +
      backBar_(base, staff, dev) +
      '<div class="hhead"><span class="bmark">🍅</span><span class="bname">台湾トマト</span></div>' +
      '<div class="hsub" style="color:#fff;text-align:center;font-weight:700;margin:0 0 6px;letter-spacing:.06em;">売上・コスト</div>' +
      '<div class="ctwrap">' +
        '<div class="cbtnrow"><button id="cgo" type="button">月間コスト計算</button></div>' +
        '<div class="cstatus" id="cstatus">ボタンを押すと、事務所パソコンが今の数字で計算します。</div>' +
        '<div id="cres"></div>' +
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
  '  .kkacclbl { color:var(--sub,#64748b); font-size:.72rem; font-weight:800; margin-bottom:3px; }' +
  '  .kksub { color:#fff; opacity:.92; font-weight:800; font-size:.9rem; margin:14px 2px 8px; padding-left:10px; border-left:3px solid #94a3b8; }' +
  '  .kksub small { opacity:.8; font-weight:600; font-size:.72rem; margin-left:6px; }' +
  '  .kkpseg { display:flex; flex-wrap:wrap; gap:6px; margin:8px 2px; }' +
  '  .kkpseg button { border:0; background:var(--card,#fff); color:var(--sub,#64748b); font-size:.9rem; font-weight:800; padding:8px 14px; border-radius:999px; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.12); }' +
  '  .kkpseg button.on { background:#e0533d; color:#fff; }' +
  '  .kkpnote { color:rgba(255,255,255,.82); font-size:.74rem; margin:0 2px 10px; }' +
  '  .kkpc { background:var(--card,#fff); color:var(--ink,#0f172a); border-radius:14px; padding:12px; margin-bottom:12px; display:flex; gap:12px; box-shadow:0 4px 14px rgba(0,0,0,.12); }' +
  '  .kkpth { width:96px; height:96px; border-radius:10px; object-fit:cover; flex:none; }' +
  '  .kkpth.ph { background:var(--line,#e2e8f0); display:flex; align-items:center; justify-content:center; color:var(--sub,#64748b); font-size:.7rem; }' +
  '  .kkpbody { flex:1; min-width:0; }' +
  '  .kkptitle { font-weight:800; font-size:1.05rem; }' +
  '  .kkprun { display:inline-block; margin-left:8px; font-size:.72rem; font-weight:800; color:#0ea5e9; background:rgba(14,165,233,.14); padding:2px 9px; border-radius:999px; vertical-align:middle; }' +
  '  .kkpbudget { float:right; margin-left:8px; font-size:.82rem; font-weight:800; color:#d97706; background:rgba(217,119,6,.16); padding:2px 10px; border-radius:999px; }' +
  '  .kkpgoal { color:var(--sub,#64748b); font-size:.8rem; margin:1px 0 8px; }' +
  '  .kkpmx { display:flex; flex-wrap:wrap; gap:9px 16px; margin-bottom:9px; }' +
  '  .kkpmi { display:flex; flex-direction:column; }' +
  '  .kkpmi small { color:var(--sub,#64748b); font-size:.72rem; font-weight:700; }' +
  '  .kkpmi b { font-size:1.15rem; font-weight:900; color:#16a34a; }' +
  '  .kkpmi .kkpu { font-style:normal; color:var(--sub,#64748b); font-size:.7rem; font-weight:700; margin-top:1px; min-height:.9em; }' +
  '  .kkpmoney { background:rgba(148,163,184,.12); border-radius:10px; padding:8px 10px; font-size:.86rem; line-height:1.55; }' +
  '  .kkpmoney b { color:var(--ink,#0f172a); font-weight:900; }' +
  '  .kkpsince { color:var(--sub,#64748b); font-size:.72rem; margin:5px 0 0; }' +
  '  .kkpdemo { margin-top:8px; font-size:.8rem; color:var(--ink,#0f172a); line-height:1.7; }' +
  '  .kkpdemo .kkpdk { display:inline-block; min-width:5.6em; color:var(--sub,#64748b); font-weight:700; }' +
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
        return idmWithinMonth_(x.t.last_ts) && !x.t.resolved && !idmLocHide_('t', locRes[kk], x.t.last_ts || '');
      });
      var reqsShown = reqs.filter(function (r) {
        var kk = 'r:' + a.key + ':' + idmStripNum_(r.name);
        return idmWithinMonth_(r.ts) && !r.resolved && !idmLocHide_('r', locRes[kk], idmReqSig_(r));
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
          var rSig = idmReqSig_(reqsShown[r]);
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
// 追いつくまでの間も、再表示で隠れたままにするため。相手から新しいやり取りが来た時だけ戻る。
function idmResGet_() { try { return JSON.parse(localStorage.getItem('idm_resolved') || '{}') || {}; } catch (e) { return {}; } }
function idmResAdd_(key, sig) { try { var m = idmResGet_(); m[key] = sig; localStorage.setItem('idm_resolved', JSON.stringify(m)); } catch (e) {} }
function idmResDel_(key) { try { var m = idmResGet_(); delete m[key]; localStorage.setItem('idm_resolved', JSON.stringify(m)); } catch (e) {} }

// 初めての人の「今の状態」の合図＝最初の一言＋未読かどうか。
// ★一覧に出る時刻（「2日」「4週間」＝今から何日前か）は日が経つと必ず変わるので合図に入れない。
//   入れると、新しいメッセージが来ていないのに解決済みが勝手に解けて一覧へ戻ってしまう
//   （2026-08-24 まるちゃん「解決済みをおしたらもう出ないようにして」の原因のひとつ）。
function idmReqSig_(r) { return (r.preview || '') + '|u' + (r.unread ? '1' : '0'); }

// 解決済みの印が今も有効か（＝一覧から隠すか）。事務所PC側 read_dms.py の _resolved_hide と同じ判定。
// 片方だけ直さない（両方そろえる）。
function idmLocHide_(kind, stored, now) {
  if (!stored) return false;
  if (kind === 't') {
    // 会話＝最後のやり取りの時刻。「YYYY/MM/DD HH:MM」はそのまま文字の大小で新旧が分かる。
    // 印を付けた時より新しいやり取りが来た時だけ表示に戻す。
    if (!now) return true;
    return String(now) <= String(stored);
  }
  var a = idmReqSplit_(stored), b = idmReqSplit_(now);
  if (a.prev !== b.prev) return false;                 // 最初の一言が変わった＝新しいメッセージ
  if (a.unread === false && b.unread === true) return false;  // 既読だったのに未読に戻った＝新着
  return true;
}
// 合図を「最初の一言」と「未読か」に分ける（古い形＝末尾が相対時刻の物は時刻を捨てる）。
function idmReqSplit_(sig) {
  var s = String(sig || ''), m = s.match(/\|u([01])$/);
  if (m) return { prev: s.slice(0, s.length - m[0].length), unread: m[1] === '1' };
  var i = s.lastIndexOf('|');
  return { prev: i >= 0 ? s.slice(0, i) : s, unread: null };
}

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
  // ★送り終わったあとの後片付け（2026-09-05 まるちゃん「おくったあとも前のメッセージが残ってる」）。
  //   送れたら入力欄を空にして返信欄を閉じる＝打った文が残っていると、もう一度押して
  //   同じ文が二重に届く事故のもと。送れなかった時だけ文を残す（そのまま送り直せる）。
  function idmDone_(m) {
    btn.disabled = false;
    var ms = '' + (m || '');
    if (st) st.textContent = ms;
    if (ms.indexOf('送りました') >= 0) {
      if (ta) ta.value = '';
      if (box) box.style.display = 'none';
      szPopup_(ms, { icon: '✓' });
    }
  }
  function idmGo_(waitMsg, fn) {
    btn.disabled = true;                       // 返事が来るまで二度押しできないようにする
    if (st) st.textContent = waitMsg;
    if (fn) fn(); else { btn.disabled = false; if (st) st.textContent = 'この画面からは送れません。'; }
  }
  if (kind === 't') {
    var thId = card.getAttribute('data-rid') || '';
    szPopup_('このお客さんに送りますか？\n\n' + txt, { icon: '✉️', cancel: true, yesLabel: '送る', onYes: function () {
      idmGo_('送信中…', window.igdmReply && function () { window.igdmReply(acc, thId, txt, idmDone_); });
    } });
  } else if (kind === 'r') {
    var name = card.getAttribute('data-rname') || '';
    var occ = parseInt(card.getAttribute('data-rocc') || '0', 10) || 0;
    szPopup_('この初めての人「' + name + '」を承認して、返信を送りますか？\n\n' + txt,
      { icon: '✉️', cancel: true, yesLabel: '承認して送る', onYes: function () {
        idmGo_('承認して送信中…', window.igdmApproveReply && function () { window.igdmApproveReply(acc, name, occ, txt, idmDone_); });
      } });
  }
}

// 「✓ 解決済」＝この相手を未返信一覧から隠す（削除はしない・全員で共有）。新しいメッセージが来たら戻る。
// ★2026-08-24 まるちゃん「解決済みをおしたら、もうここには出ないようにして」で作り直した：
//   ①確認はスーパーズコの小窓（共通ルール。ブラウザ標準の窓は使わない）
//   ②押したらその場ですぐ消す＋この端末に覚えさせる（事務所PCの返事は30秒ほどかかるので、
//     待っている間「押しても何も起きない」ように見えていた＝これが「消えない」の正体）
//   ③事務所PCに書けなかった時だけ、小さな警告を出して行を戻す（黙って失敗しない）
function idmResolve(btn) {
  if (!btn) return;
  var key = btn.getAttribute('data-key') || '';
  var sig = btn.getAttribute('data-sig') || '';
  if (!key) return;
  var card = btn;
  for (var k = 0; k < 4 && card && !(card.className && ('' + card.className).indexOf('idmcard') >= 0); k++) card = card.parentElement;
  szPopup_('この相手を「解決済み」にして一覧から隠しますか？\n（消しません。相手から新しいメッセージが来たら、その時だけまた出ます）',
    { icon: '✓', cancel: true, yesLabel: '解決済みにする', onYes: function () {
      idmResAdd_(key, sig);                       // 先に覚える＝開き直しても消えたまま
      if (card) { card.style.transition = 'opacity .3s'; card.style.opacity = '0';
        setTimeout(function () { if (card) card.style.display = 'none'; }, 300); }
      if (!window.igdmResolve) return;
      window.igdmResolve(key, sig, function (m) {
        if (m && ('' + m).indexOf('解決済み') >= 0) return;   // 事務所PCにも書けた＝そのまま
        // 書けなかった＝この端末だけ隠れている状態。行を戻して知らせる。
        idmResDel_(key);
        if (card) { card.style.display = ''; card.style.opacity = '1'; }
        szPopup_('うまくいきませんでした。もう一度押してください。\n（' + ('' + (m || 'つながりませんでした')) + '）');
      });
    } });
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
  // 待っている間、何秒たったかを出す（止まって見えないように・2026-08-24 まるちゃん）。
  var t0 = new Date().getTime(), tick = null;
  function stop() { if (tick) { clearInterval(tick); tick = null; } }
  if (st) {
    st.textContent = '削除を依頼中… 0秒';
    tick = setInterval(function () {
      if (!st) return stop();
      st.textContent = '削除を依頼中… ' + Math.round((new Date().getTime() - t0) / 1000) + '秒';
    }, 1000);
  }
  if (!window.igdmDelete) stop();
  if (window.igdmDelete) window.igdmDelete(acc, name, prev, occ, function (m) {
    stop();
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
    szPopup_((title || '') + '\n\n' + msgs.map(function (m) { return (m.me ? '自分: ' : '相手: ') + m.text; }).join('\n'), { icon: '' });
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
  // ★2026-08-24 まるちゃん「時間がかかりすぎ」：待っている間、何秒たったかを出して動いていると分かるように
  //   する（止まって見えるのが一番長く感じる）。読み終わったら数えるのをやめる。
  var t0 = new Date().getTime(), tick = null;
  function stop() { if (tick) { clearInterval(tick); tick = null; } }
  if (st) {
    st.textContent = '中身を読んでいます… 0秒（開くので既読が付きます）';
    tick = setInterval(function () {
      if (!st) return stop();
      st.textContent = '中身を読んでいます… ' + Math.round((new Date().getTime() - t0) / 1000) + '秒（開くので既読が付きます）';
    }, 1000);
  }
  if (window.idmReqDetail) window.idmReqDetail(acc, name, prev, occ,
    function (m) { stop(); if (st) st.textContent = m; },
    function (d) { stop(); if (st) st.textContent = ''; idmShowMsgs(d.title, d.msgs); });
  else stop();
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
    // occ＝同じ名前の中で上から何番目か（0始まり）。名前がかぶった時に事務所PCが1件を狙うのに要る。
    items.push({ req: true, title: q.name, occ: idmOccOf_(reqs, q), unread: q.unread, waiting: true, spam: q.spam,
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
    // ★初めての人にも返信できる（2026-09-05 まるちゃん「返信できないよ？できるようにして」）。
    //   初めての人はまだ会話が始まっていないので、事務所PCが先に「承認」を押してから送る
    //   （＝IGのDM画面の「承認して返信」とまったく同じ道＝instadm_approve_reply）。
    body += '<div class="igdmreply">' +
      '<textarea id="igdmReplyTxt" class="igdmrtxt" placeholder="返信を入力（承認してからお客さんに届きます）"></textarea>' +
      '<div class="igdmrrow"><button type="button" class="igdmrsend" onclick="igdmDoApproveReply()">承認して送る</button>' +
      '<span class="igdmrstatus" id="igdmRStatus"></span></div>' +
    '</div>';
    // ★初めての人（スパムが来る所）＝中身を見た上で「削除」できる。押した1件だけ・確認あり・戻せない。
    body += '<div class="igdmreply">' +
      '<button type="button" class="igdmdel" onclick="igdmDoDelete()">🚫 この初めての人を削除</button>' +
      '<div class="igdmrstatus" id="igdmDStatus" style="margin-top:8px;"></div>' +
    '</div>';
  }
  pane.innerHTML = body;
  var pn = document.getElementById('igdmPane'); if (pn) pn.classList.add('showthread');
  var lg = pane.querySelector('.igdmth-log'); if (lg) lg.scrollTop = lg.scrollHeight;
}

// 送った結果の見せ方（書き込み系ボタンの共通ルール＝処理中は全画面／成功は緑の全画面／
//   失敗は小さな警告だけ出して事務所PC側からりゅうさんへ知らせが飛ぶ）。返信2種で共有する。
function igdmSendResult_(m) {
  var ms = '' + (m || '');
  if (ms.indexOf('送りました') >= 0) {
    var ta = document.getElementById('igdmReplyTxt'); if (ta) ta.value = '';
    szOvShow_(szDoneHtml_(ms.indexOf('承認') >= 0 ? '承認して送りました' : '送りました', '会話に戻る'), '#16a34a');
    var b = document.getElementById('szDoneBack');
    if (b) b.addEventListener('click', function () { szOvHide_(); });
  } else {
    szOvHide_();
    szPopup_(ms || 'エラーが発生しました。りゅうさんにお伝えください。');
  }
}

// 返信を送る（本物の会話だけ）。確認してから、事務所PCへ送信を依頼し、結果を出す。
function igdmDoReply() {
  var t = (IGDM_STATE_.items || [])[IGDM_STATE_.sel]; if (!t || t.req || !t.id) return;
  var ta = document.getElementById('igdmReplyTxt'); var txt = ta ? ta.value.trim() : '';
  if (!txt) { szPopup_('本文が空です。'); return; }
  var acc = (igdmAccs_()[IGDM_STATE_.ai] || {}).key || '';
  szPopup_('このお客さんに送りますか？\n\n' + txt, { icon: '✉️', cancel: true, yesLabel: '送る', onYes: function () {
    szOvShow_(szBusyHtml_('送っています', 'インスタへの書き込みが終わったら自動で切り替わりますので、しばらくお待ちください。'), '#2C7A99');
    if (window.igdmReply) window.igdmReply(acc, t.id, txt, igdmSendResult_);
    else { szOvHide_(); szPopup_('この画面からは送れません。りゅうさんにお伝えください。'); }
  } });
}

// 初めての人へ返信する＝先に「承認」を押してから送る（インスタの決まり。承認すると相手が
//   ふつうの会話に入る＝戻せない）。事務所PCが人と同じように画面を操作して送る。
function igdmDoApproveReply() {
  var t = (IGDM_STATE_.items || [])[IGDM_STATE_.sel]; if (!t || !t.req) return;
  var ta = document.getElementById('igdmReplyTxt'); var txt = ta ? ta.value.trim() : '';
  if (!txt) { szPopup_('本文が空です。'); return; }
  var acc = (igdmAccs_()[IGDM_STATE_.ai] || {}).key || '';
  var nm = t.title || '', occ = t.occ || 0;
  szPopup_('この初めての人「' + nm + '」を承認して、この返信を送りますか？\n\n' + txt,
    { icon: '✉️', cancel: true, yesLabel: '承認して送る', onYes: function () {
      szOvShow_(szBusyHtml_('承認して送っています', 'インスタへの書き込みが終わったら自動で切り替わりますので、しばらくお待ちください。'), '#2C7A99');
      if (window.igdmApproveReply) window.igdmApproveReply(acc, nm, occ, txt, igdmSendResult_);
      else { szOvHide_(); szPopup_('この画面からは送れません。りゅうさんにお伝えください。'); }
    } });
}

// 初めての人（スパム）を削除する。中身を見た上で、押した1件だけ・確認してから。戻せない。
function igdmDoDelete() {
  var t = (IGDM_STATE_.items || [])[IGDM_STATE_.sel]; if (!t || !t.req) return;
  szPopup_('この初めての人「' + (t.title || '') + '」を削除しますか？\n消すと元に戻せません。',
    { cancel: true, yesLabel: '削除する', onYes: function () { igdmDoDeleteGo_(t); } });
}
function igdmDoDeleteGo_(t) {
  var acc = (igdmAccs_()[IGDM_STATE_.ai] || {}).key || '';
  szOvShow_(szBusyHtml_('削除しています'), '#2C7A99');   // 部屋かぶりと同じ全画面表示（共通ルール）
  if (window.igdmDelete) window.igdmDelete(acc, t.title, t.last_text, t.occ || 0, function (m) {
    var ms = '' + (m || '');
    if (ms.indexOf('エラー') >= 0 || ms.indexOf('失敗') >= 0 || ms.indexOf('できません') >= 0 || ms.indexOf('つながり') >= 0 || ms.indexOf('時間がかかって') >= 0) {
      szOvHide_(); szPopup_(ms || 'エラーが発生しました。りゅうさんにお伝えください。');
    } else {
      szOvShow_(szDoneHtml_('削除しました', '一覧に戻る'), '#16a34a');
      var b = document.getElementById('szDoneBack');
      if (b) b.addEventListener('click', function () { szOvHide_(); if (window.igdmBackList) igdmBackList(); });
    }
  });
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

  // 広告1件のカード（男女の印つき）。showAcc=trueで、どのアカウントの広告かの見出しも小さく出す。
  function adCard(a, showAcc) {
    var live = (a.status === '配信中');
    var st = '<span class="kkst ' + (live ? 'kklive2' : 'kkstop') + '">' + esc_(a.status || '') + '</span>';
    var sex = a.sex ? '<span class="kksex" style="background:' + SEXCOL[a.sex] + '22;color:' + SEXCOL[a.sex] + '">' + SEXLBL[a.sex] + '向け</span>' : '';
    var day = a.day_budget ? '　1日 ' + esc_(_costYen_(a.day_budget)) : '';
    var acc = (showAcc && a._label) ? '<div class="kkacclbl">' + esc_(a._label) + '</div>' : '';
    var img = a.image_data ? '<img class="kkth" src="' + a.image_data + '" alt="">' : '<div class="kkth ph">画像</div>';
    return '<div class="kkad">' + img +
      '<div class="kkinfo">' + acc +
        '<div class="kkr1">' + st + sex +
          '<span class="kkspend">' + esc_(_costYen_(a.spend_ntd)) + ' <small>使った実額' + day + '</small></span></div>' +
        '<div class="kkkv">見られた <b>' + fig(a.views) + '</b>　プロフィール来訪 <b>' + fig(a.profile_visits) + '</b></div>' +
      '</div></div>';
  }

  // 配信中の広告1件の「成績カード」（期間で切り替え＝見本の形）。
  //   期間ごとの増えたぶんは data-perf に全期間ぶん入れておき、下のスクリプトで切り替える。
  function mxItem(label, key) {
    return '<span class="kkpmi"><small>' + label + '</small><b class="kkp-' + key + '">-</b>' +
      '<i class="kkpu kkpu-' + key + '"></i></span>';
  }
  function perfCard(a) {
    var natJa = (a.nat === 'jp') ? '日本' : (a.nat === 'tw' ? '台湾' : '');
    var sexJa = a.sex ? SEXLBL[a.sex] + '向け' : '';
    var title = ((natJa ? natJa + ' ' : '') + sexJa) || '広告';
    var img = a.image_data ? '<img class="kkpth" src="' + a.image_data + '" alt="">' : '<div class="kkpth ph">画像</div>';
    var perf = a.perf || {};
    var initFollows = (perf['1w'] && perf['1w'].follows) || (perf['all'] && perf['all'].follows) || 0;
    var demoHtml = demoBlock(a);
    var acc = a._label ? '<div class="kkacclbl">' + esc_(a._label) + '</div>' : '';
    return '<div class="kkpc" data-follows="' + initFollows + '" data-sort="' + initFollows + '" data-perf="' + esc_(JSON.stringify(perf)) + '">' +
      img +
      '<div class="kkpbody">' + acc +
        '<div class="kkptitle">' +
          (a.day_budget ? '<span class="kkpbudget">1日 ' + esc_(_costYen_(a.day_budget)) + '</span>' : '') +
          esc_(title) +
          (a.run_days != null ? '<span class="kkprun">走らせて ' + esc_(a.run_days) + '日</span>' : '') + '</div>' +
        '<div class="kkpgoal">目的：プロフィールを見てもらう</div>' +
        '<div class="kkpmx">' +
          mxItem('フォロワー', 'follows') + mxItem('保存', 'saves') + mxItem('外部リンク', 'external_taps') +
          mxItem('いいね', 'likes') + mxItem('シェア', 'shares') +
        '</div>' +
        '<div class="kkpmoney">この<b class="kkp-plabel">1週間</b>でかけた金額 <b class="kkp-spend">-</b>' +
          '　／　プロフィールを見てもらう1回あたり <b class="kkp-cpv">-</b>（訪問 <b class="kkp-pv">-</b>）</div>' +
        '<div class="kkpsince"></div>' +
        demoHtml +
      '</div></div>';
  }

  // 男女・年齢・場所の内訳ブロック（成績カードと通算カードで共用）。
  function demoBlock(a) {
    var demo = a.demo || {};
    function pctline(arr) { return (arr || []).map(function (x) { return esc_(x[0]) + ' ' + esc_(x[1]); }).join(' / '); }
    var hasDemo = (demo.sex && demo.sex.length) || (demo.age && demo.age.length) || (demo.region && demo.region.length);
    if (!hasDemo) return '';
    return '<div class="kkpdemo">' +
      (demo.sex && demo.sex.length ? '<div><span class="kkpdk">見た人の男女</span>' + esc_(demo.sex.map(function (x) { return x[0] + ' ' + x[1]; }).join('・')) + '</div>' : '') +
      (demo.age && demo.age.length ? '<div><span class="kkpdk">年齢</span>' + pctline(demo.age) + '</div>' : '') +
      (demo.region && demo.region.length ? '<div><span class="kkpdk">場所</span>' + pctline(demo.region) + '</div>' : '') +
      '</div>';
  }

  // 桁区切りのみ（万でまるめない）。
  function numc(n) {
    n = Number(n) || 0; var neg = n < 0; n = Math.abs(n);
    var t = String(n), o = '', c = 0, i;
    for (i = t.length - 1; i >= 0; i--) { o = t.charAt(i) + o; if (++c % 3 === 0 && i > 0) o = ',' + o; }
    return (neg ? '-' : '') + o;
  }

  // 止めている広告用：全期間（通算）の成績カード（期間切替なし＝トータルだけ）。
  function perfTotalCard(a, showAcc) {
    var all = a.perf && a.perf.all;
    if (!all) return adCard(a, showAcc);   // 成績が無ければ従来の簡易カード
    var natJa = (a.nat === 'jp') ? '日本' : (a.nat === 'tw' ? '台湾' : '');
    var sexJa = a.sex ? SEXLBL[a.sex] + '向け' : '';
    var title = ((natJa ? natJa + ' ' : '') + sexJa) || '広告';
    var img = a.image_data ? '<img class="kkpth" src="' + a.image_data + '" alt="">' : '<div class="kkpth ph">画像</div>';
    var run = (a.run_days != null) ? '<span class="kkprun">走らせて ' + esc_(a.run_days) + '日</span>' : '';
    var st = '<span class="kkst kkstop" style="margin-left:8px;">' + esc_(a.status || '') + '</span>';
    function mi(label, v) {
      var cost = (all.spend > 0 && v > 0) ? '(1つ ' + numc(Math.round(all.spend / v)) + ' 元)' : '';
      return '<span class="kkpmi"><small>' + label + '</small><b>' + numc(v) + '</b><i class="kkpu">' + cost + '</i></span>';
    }
    var acc = (showAcc && a._label) ? '<div class="kkacclbl">' + esc_(a._label) + '</div>' : '';
    return '<div class="kkpc">' + img +
      '<div class="kkpbody">' + acc +
        '<div class="kkptitle">' + esc_(title) + run + st + '</div>' +
        '<div class="kkpgoal">目的：プロフィールを見てもらう</div>' +
        '<div class="kkpmx">' +
          mi('フォロワー', all.follows) + mi('保存', all.saves) + mi('外部リンク', all.external_taps) +
          mi('いいね', all.likes) + mi('シェア', all.shares) +
        '</div>' +
        '<div class="kkpmoney">全期間でかけた金額 <b>' + numc(all.spend) + ' 元</b>' +
          '　／　プロフィールを見てもらう1回あたり <b>' + (all.cpv != null ? esc_(all.cpv) + ' 元' : '—') + '</b>' +
          '（訪問 ' + numc(all.profile_visits) + '回）</div>' +
        demoBlock(a) +
      '</div></div>';
  }

  // 「配信中（今 動いている広告）」を3アカウントぶんまとめて上に（成績カード＝期間で切替）。
  // 「停止中（今は止めている広告）」はその下に、アカウントごとにまとめる（全期間の通算成績で表示）。
  var totalAds = allads.length, list;
  if (allads.length) {
    var liveAds = allads.filter(function (a) { return a.status === '配信中'; });
    var stopAds = allads.filter(function (a) { return a.status !== '配信中'; });
    liveAds.sort(function (a, b) { return (Number(b.day_budget) || 0) - (Number(a.day_budget) || 0); });
    var liveDay = 0; liveAds.forEach(function (a) { liveDay += Number(a.day_budget) || 0; });

    var liveHead = '<div class="kkacc" style="border-left-color:#16a34a;">🟢 今 配信中の広告' +
      '<small>' + liveAds.length + '件・1日 合計 ' + esc_(_costYen_(liveDay)) + '</small></div>';
    var liveBody;
    if (liveAds.length) {
      var pers = (d.periods && d.periods.length) ? d.periods : [{ key: '1w', label: '1週間' }];
      var segBtns = pers.map(function (p) {
        return '<button type="button" data-p="' + esc_(p.key) + '"' + (p.key === '1w' ? ' class="on"' : '') + '>' + esc_(p.label) + '</button>';
      }).join('');
      liveBody = '<div class="kkpseg">' + segBtns + '</div>' +
        '<div class="kkpnote">選んだ期間で「増えたぶん」を、フォロワーが増えた順に並べています。</div>' +
        '<div id="kkp-list">' + liveAds.map(perfCard).join('') + '</div>';
    } else {
      liveBody = '<div class="kkempty2">今 配信中の広告はありません。</div>';
    }

    var stopBody = '';
    if (stopAds.length) {
      var groups = '';
      if (accounts.length) {
        groups = accounts.map(function (acc) {
          var s = (acc.ads || []).filter(function (a) { return a.status !== '配信中'; });
          if (!s.length) return '';
          return '<div class="kksub">' + esc_(acc.label || '') + '<small>@' + esc_(acc.handle || '') + '・' + s.length + '件</small></div>' +
            s.map(function (a) { return perfTotalCard(a, false); }).join('');
        }).join('');
      } else {
        groups = stopAds.map(function (a) { return perfTotalCard(a, true); }).join('');
      }
      stopBody = '<div class="kkacc" style="border-left-color:#94a3b8;">⏸ 今は止めている広告' +
        '<small>' + stopAds.length + '件</small></div>' + groups;
    }

    // 読み取れなかったアカウント（0件＝ログイン切れ等）は分かるように注記を残す。
    var emptyWarn = '';
    if (accounts.length) {
      accounts.forEach(function (acc) {
        if (!(acc.ads || []).length) {
          emptyWarn += '<div class="kkempty2">' + esc_(acc.label || '') + '（@' + esc_(acc.handle || '') + '）は読み取れませんでした（ログイン切れ等の疑い）。</div>';
        }
      });
    }
    list = liveHead + liveBody + stopBody + emptyWarn;
  } else {
    list = '<div class="kkempty">まだ読み取っていません。<br>毎日1回、自動でインスタから読み取ります。</div>';
  }
  var when = d.read_at ? '最終読み取り：' + esc_(d.read_at) + '　／　広告 ' + totalAds + '件' : '広告 ' + totalAds + '件';

  var script = '<script>(function(){var mode="day";function apply(){var xs=document.querySelectorAll(".kkval");' +
    'for(var i=0;i<xs.length;i++){var t=xs[i].getAttribute("data-"+mode);if(t!=null)xs[i].innerHTML=t;}' +
    'var bd=document.getElementById("kk-day"),bm=document.getElementById("kk-month");' +
    'if(bd)bd.className=(mode==="day"?"on":"");if(bm)bm.className=(mode==="month"?"on":"");}' +
    'var bd=document.getElementById("kk-day"),bm=document.getElementById("kk-month");' +
    'if(bd)bd.addEventListener("click",function(){mode="day";apply();});' +
    'if(bm)bm.addEventListener("click",function(){mode="month";apply();});})();</script>';

  // 成績カードの期間切り替え＆フォロワーが増えた順の並べ替え（全期間ぶんの数字は各カードのdata-perfに入れてある）。
  var pscript = '<script>(function(){' +
    'var seg=document.querySelector(".kkpseg");if(!seg)return;' +
    'var LBL={},bs=seg.querySelectorAll("button"),i;' +
    'for(i=0;i<bs.length;i++){LBL[bs[i].getAttribute("data-p")]=bs[i].textContent;}' +
    'var period="1w";' +
    'function nf(n){n=Number(n)||0;var neg=n<0;n=Math.abs(n);var s=""+n,o="",c=0,j;' +
      'for(j=s.length-1;j>=0;j--){o=s.charAt(j)+o;if(++c%3===0&&j>0)o=","+o;}' +
      'return (neg?"-":"")+o;}' +
    'function sg(n){n=Number(n)||0;if(period==="all")return nf(n);return (n<0?"":"+")+nf(n);}' +
    'function apply(){var cards=document.querySelectorAll("#kkp-list .kkpc"),arr=[],k;' +
      'for(k=0;k<cards.length;k++)arr.push(cards[k]);' +
      'for(k=0;k<arr.length;k++){(function(cc){var p={};try{p=JSON.parse(cc.getAttribute("data-perf")||"{}");}catch(e){}' +
        'var dd=p[period]||{};function set(cl,v){var el=cc.querySelector(".kkp-"+cl);if(el)el.innerHTML=v;}' +
        'function pu(cl,cnt){var el=cc.querySelector(".kkpu-"+cl);if(!el)return;var sp=Number(dd.spend)||0,n=Number(cnt)||0;' +
          'el.innerHTML=(sp>0&&n>0)?("(1つ "+nf(Math.round(sp/n))+" 元)"):"";}' +
        'set("follows",sg(dd.follows));set("saves",sg(dd.saves));set("external_taps",sg(dd.external_taps));' +
        'set("likes",sg(dd.likes));set("shares",sg(dd.shares));' +
        'pu("follows",dd.follows);pu("saves",dd.saves);pu("external_taps",dd.external_taps);pu("likes",dd.likes);pu("shares",dd.shares);' +
        'set("spend",(dd.spend!=null?nf(dd.spend)+" 元":"—"));' +
        'set("cpv",(dd.cpv!=null?dd.cpv+" 元":"—"));' +
        'set("pv",(dd.profile_visits!=null?sg(dd.profile_visits)+"回":"—"));' +
        'set("plabel",LBL[period]||period);' +
        'var sc=cc.querySelector(".kkpsince");if(sc){if(period==="all"){sc.innerHTML="全期間（この広告の通算）";}' +
          'else{var sd=dd.since?dd.since.slice(5).replace("-","/"):"";sc.innerHTML=(sd?sd+" から今日まで":"")+(dd.is_full===false?"（記録はここまで）":"");}}' +
        'cc.setAttribute("data-sort",(dd.follows!=null?dd.follows:-1));})(arr[k]);}' +
      'var box=document.getElementById("kkp-list");' +
      'if(box){arr.sort(function(a,b){return (Number(b.getAttribute("data-sort"))||0)-(Number(a.getAttribute("data-sort"))||0);});for(k=0;k<arr.length;k++)box.appendChild(arr[k]);}' +
      'for(k=0;k<bs.length;k++){bs[k].className=(bs[k].getAttribute("data-p")===period?"on":"");}}' +
    'for(i=0;i<bs.length;i++){bs[i].addEventListener("click",function(){period=this.getAttribute("data-p");apply();});}' +
    'apply();})();</script>';

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
    '</div>' + script + pscript;
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
  '.rkpick{background:#0d1117;color:#fff;font-size:1.5rem;}' +
  /* ―― 💰これまでの購入とお金（2026-08-21：パソコン版と同じ中身をスマホにも） ―― */
  '.rksec.money>.rklbl{border-left-color:#f6c945;}' +
  '.rksubh{font-weight:800;font-size:1.3rem;margin:14px 0 6px;padding-left:8px;border-left:4px solid #f6c945;}' +
  '.rkuline{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-top:1px dashed rgba(255,255,255,.18);font-size:1.3rem;}' +
  '.rkuline .un{font-weight:700;}' +
  '.rkuline .ur{color:#7cffa0;font-weight:800;white-space:nowrap;}' +
  '.rknone2{color:#cbd5e1;font-size:1.2rem;padding:3px 0;}' +
  '.rkparts{margin:6px 0 10px;display:flex;flex-wrap:wrap;gap:8px;}' +
  '.rkpchip{display:inline-block;background:rgba(124,192,255,.16);border:1px solid rgba(124,192,255,.35);color:#dbeafe;border-radius:999px;padding:3px 12px;font-size:1.2rem;font-weight:700;}' +
  '.rktotal{font-size:1.5rem;margin:2px 0 8px;}' +
  '.rktotal b{color:#ffd400;}' +
  '.rkmnote{color:#cbd5e1;font-size:1.05rem;margin-left:8px;}' +
  '.rkbuy{padding:6px 0;border-top:1px dashed rgba(255,255,255,.18);font-size:1.25rem;line-height:1.55;}' +
  '.rkbuy .bn{font-weight:800;}' +
  '.rkbuy .bp{color:#ffd400;font-weight:800;margin-left:8px;}' +
  '.rkbuy .bc{color:#cbd5e1;margin-left:6px;}' +
  '.rkbuy .bd{color:#94a3b8;font-size:1.05rem;}';

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
  'function money_(n){return Number(n).toLocaleString("ja-JP")+"元";}' +
  /* ★2026-08-21まるちゃん：スマホ版とパソコン版は常に同じにする（掟）。'
     パソコン版の顧客履歴と同じ「💰これまでの購入とお金」をここでも出す。 */
  'function moneyHtml_(p){' +
  'if(!p||!p.found){return "<div class=\\"rksec money\\"><div class=\\"rklbl\\">\\uD83D\\uDCB0 これまでの購入とお金</div><div class=\\"rknone\\">購入の記録がありません（昔のお客様は未整理のことがあります）。</div></div>";}' +
  'var remain=(p.courses||[]).filter(function(c){return c.remaining>0;}).map(function(c){' +
  'return "<div class=\\"rkuline\\"><span class=\\"un\\">"+esc(c.name)+"</span><span class=\\"ur\\">全"+c.total_count+"回・済"+c.used+"回・残り"+c.remaining+"回</span></div>";}).join("");' +
  'var pre=(p.prepaid||[]).map(function(c){var day=c.bought_date?("　払った日 "+esc(c.bought_date)):"";' +
  'return "<div class=\\"rkuline\\"><span class=\\"un\\">"+esc(c.name)+"</span><span class=\\"ur\\">次回分 "+c.remaining+"回分 お支払い済み"+day+"</span></div>";}).join("");' +
  'var parts=(p.parts||[]).map(function(pt){return "<span class=\\"rkpchip\\">"+esc(pt.name)+" "+pt.done+"回</span>";}).join("");' +
  'var total=(p.total_spent==null)?"記録なし":money_(p.total_spent);' +
  'var tn=p.has_missing_price?"<span class=\\"rkmnote\\">（一部は金額の記録なし）</span>":"";' +
  'var buys=(p.contracts||[]).map(function(c){var price=(c.price==null)?"金額の記録なし":money_(c.price);var cnt="";' +
  'if(c.total_count!=null){var ext=(c.extra&&c.extra>0)?(" ＋都度"+c.extra+"回 継続中"):"";cnt="（"+c.total_count+"回コース・済"+c.used+"回・残り"+c.remaining+"回）"+ext;}' +
  'else if(c.used){cnt="（済"+c.used+"回）";}' +
  'var day=c.bought_date?("　買った日 "+esc(c.bought_date)):"";' +
  'return "<div class=\\"rkbuy\\"><span class=\\"bn\\">"+esc(c.name)+"</span><span class=\\"bp\\">"+price+"</span><span class=\\"bc\\">"+cnt+"</span><span class=\\"bd\\">"+day+"</span></div>";}).join("");' +
  'var h="<div class=\\"rksec money\\"><div class=\\"rklbl\\">\\uD83D\\uDCB0 これまでの購入とお金</div>";' +
  'h+="<div class=\\"rksubh\\">未消化コース回数</div>"+(remain||"<div class=\\"rknone2\\">未消化のコースはありません</div>");' +
  'if(pre){h+="<div class=\\"rksubh\\">次回分お支払い済み</div>"+pre;}' +
  'h+="<div class=\\"rksubh\\">各施術回数合計</div><div class=\\"rkparts\\">"+(parts||"<span class=\\"rknone2\\">施術の記録なし</span>")+"</div>";' +
  'h+="<div class=\\"rksubh\\">購入履歴</div><div class=\\"rktotal\\">お支払い合計 <b>"+total+"</b>"+tn+"</div><div>"+buys+"</div>";' +
  'return h+"</div>";}' +
  'function custHtml(c){var up=[],pa=[],i;for(i=0;i<(c.recs||[]).length;i++){(c.recs[i].up?up:pa).push(c.recs[i]);}' +
  'var ph=c.ph?("<span class=\\"rkph\\">"+esc(c.ph)+"</span>"):"";' +
  'var head="<div class=\\"rkwho\\"><span class=\\"rkcode\\">"+esc(c.code)+"</span>"+esc(c.name||"（名前メモなし）")+ph+"</div>"+' +
  '"<div class=\\"rkmeta\\">来店 "+c.v+" 回 ／ 初回 "+esc(c.f)+" ／ 最終 "+esc(c.l)+"</div>";' +
  'var upB=up.length?up.map(recHtml).join(""):"<div class=\\"rknone\\">今日以降の予約はありません。</div>";' +
  'var paB=pa.length?pa.map(recHtml).join(""):"<div class=\\"rknone\\">過去の予約はありません。</div>";' +
  'return "<div class=\\"rkcust\\">"+head+moneyHtml_(c.purchase)+"<div class=\\"rksec\\"><div class=\\"rklbl\\">🔔 今回の予約（今日以降）</div>"+upB+"</div>"+' +
  '"<div class=\\"rksec past\\"><div class=\\"rklbl\\">🕘 前回までの予約一覧</div>"+paB+"</div></div>";}' +
  'function pickHtml(c){return "<button type=\\"button\\" class=\\"rkpick\\" data-code=\\""+esc(c.code)+"\\"><span class=\\"rkcode\\">"+esc(c.code)+"</span>"+esc(c.name||"（名前メモなし）")+" ・ 来店"+c.v+"回</button>";}' +
  'function toTop(){setTimeout(function(){try{stEl.scrollIntoView({behavior:"smooth",block:"start"});}catch(e){stEl.scrollIntoView();}},80);}' +
  'function render(res){if(!res||!res.ok){stEl.textContent="エラー："+((res&&res.error)||"不明");return;}' +
  'var cs=res.customers||[];if(!cs.length){stEl.textContent="一致する客が見つかりませんでした。";resEl.innerHTML="";toTop();return;}' +
  'if(res.multi){stEl.textContent=cs.length+" 人ヒット（タップで詳しく）";resEl.innerHTML=cs.map(pickHtml).join("");' +
  'var bs=resEl.querySelectorAll(".rkpick");for(var i=0;i<bs.length;i++){bs[i].addEventListener("click",function(){doSearch(this.getAttribute("data-code"));});}toTop();return;}' +
  'stEl.textContent=cs.length+" 人ヒット";resEl.innerHTML=cs.map(custHtml).join("");toTop();}' +
  // ★2026-08-24：あきらめるまでを 36秒 → 210秒（1.2秒×175回）。事務所パソコンが混んでいる時に
  //   出来ているのに「時間切れ」と出ていた。
  'var polls=0;function poll(id){polls++;if(polls>175){stEl.textContent="時間切れです。事務所PCが動いているかご確認のうえ、もう一度お試しください。";return;}' +
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
// ====== 翻訳 日本語→台湾中国語（view=honyaku・開発URL専用／2026-08-24 まるちゃん決定） ======
// ★パソコン版の「🀄翻訳」と同じ物をスマホでも使えるようにした（開発者のスマホだけ）。
//   訳し方・用語・回数の上限・覚えた訳は 共通\translate_core.py が持つ＝**両方まったく同じ答え**。
//   スマホは事務所パソコンの受付係に op=translate（quality付き＝質優先）で頼むだけ。
function renderHonyakuPage_(base, staff, dev) {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var css = '.hy{max-width:560px;margin:0 auto;padding:0 6px 48px;text-align:left;}' +
    '.hylbl{font-weight:800;margin:16px 4px 6px;font-size:16px;}' +
    '.hy textarea{width:100%;box-sizing:border-box;font-size:17px;padding:12px;border-radius:12px;' +
    'border:1px solid #cbd5e1;background:#fff;color:#123;min-height:120px;}' +
    '.hygo{display:block;width:100%;margin:18px 0 8px;padding:18px;font-size:21px;font-weight:800;' +
    'border:0;border-radius:16px;background:#0f766e;color:#fff;box-shadow:0 4px 10px rgba(0,0,0,.18);}' +
    '.hygo:disabled{opacity:.5;}' +
    '.hystatus{font-weight:800;margin:10px 4px;font-size:15px;}' +
    '.hystatus.err{color:#ff9b9b;}.hystatus.wait{color:#eaf3f7;}.hystatus.ok{color:#86efac;}' +
    '.hyseg{display:flex;gap:8px;margin:4px 4px 0;}' +
    '.hyseg button{flex:1;padding:12px;border:0;border-radius:12px;font-weight:800;font-size:15px;' +
    'background:rgba(255,255,255,.16);color:#eaf3f7;}' +
    '.hyseg button.sel{background:#2C7A99;color:#fff;}' +
    '.hysub{display:block;width:100%;margin:10px 0 4px;padding:12px;font-size:16px;font-weight:800;' +
    'border:0;border-radius:12px;background:rgba(255,255,255,.16);color:#eaf3f7;}' +
    '.hysub:disabled{opacity:.5;}' +
    '.hyrow{display:flex;gap:8px;}' +
    '.hyrow input{flex:1;box-sizing:border-box;font-size:16px;padding:12px;border-radius:12px;' +
    'border:1px solid #cbd5e1;background:#fff;color:#123;}';
  var script =
  '<script>(function(){' +
  'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
  'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
  'var srcEl=document.getElementById("hysrc"),dstEl=document.getElementById("hydst");' +
  'var goEl=document.getElementById("hygo"),stEl=document.getElementById("hystatus");' +
  'var gender="共通";' +
  'function setSt(t,c){stEl.textContent=t;stEl.className="hystatus "+(c||"");}' +
  'function jsonp(params,onR){var cb="__hy"+Date.now()+Math.floor(Math.random()*1000);' +
  'window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
  'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
  'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();' +
  'sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
  'var segs=[].slice.call(document.querySelectorAll(".hyseg button"));' +
  'segs.forEach(function(b){b.addEventListener("click",function(){' +
  'gender=b.getAttribute("data-g");segs.forEach(function(x){x.classList.remove("sel");});b.classList.add("sel");});});' +
  // ★あきらめるまで＝事務所パソコン側の制限(180秒)より長くする（短いと答えが出ても画面が止まる）。
  'var polls=0;function poll(id){polls++;if(polls>LIMITS.tries("translate",700)){setSt("時間がかかりすぎました。もう一度お試しください。","err");goEl.disabled=false;return;}' +
  'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){setSt("エラー："+((r&&r.error)||"不明"),"err");goEl.disabled=false;return;}' +
  'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setSt("訳しています…（少し待ってください）","wait");setTimeout(function(){poll(id);},700);return;}' +
  'goEl.disabled=false;' +
  'if(r.status!=="done"){setSt(String(r.result||"訳せませんでした。"),"err");return;}' +
  'dstEl.value=String(r.result||"");setSt("訳しました（なぞってコピーできます）","ok");});}' +
  'function go(){var t=(srcEl.value||"").trim();if(!t){setSt("日本語を入れてください。","err");return;}' +
  'goEl.disabled=true;dstEl.value="";setSt("訳しています…（少し待ってください）","wait");' +
  'jsonp({action:"submit",key:KEY,op:"translate",who:idn.who,role:idn.role,device:idn.device,' +
  'fields:JSON.stringify({text:t,gender:gender,quality:"1"})},' +
  'function(r){if(!r||!r.ok||!r.id){setSt("依頼を送れませんでした："+((r&&r.error)||"不明"),"err");goEl.disabled=false;return;}' +
  'polls=0;setTimeout(function(){poll(r.id);},1000);});}' +
  'goEl.addEventListener("click",go);' +
  // ★覚えさせる／用語を足す＝どちらも事務所パソコンの同じ道（op=translate）に頼む。
  //   覚え方・用語の当て方は translate_core の1本＝パソコン版とまったく同じ答えになる。
  'var remEl=document.getElementById("hyrem"),termEl=document.getElementById("hyterm");' +
  'var tjaEl=document.getElementById("hytja"),tzhEl=document.getElementById("hytzh");' +
  'var sPolls=0;function pollSub(id,btn){sPolls++;if(sPolls>LIMITS.tries("translate",600)){setSt("時間がかかりすぎました。","err");btn.disabled=false;return;}' +
  'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){setSt("エラー："+((r&&r.error)||"不明"),"err");btn.disabled=false;return;}' +
  'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollSub(id,btn);},600);return;}' +
  'btn.disabled=false;setSt(String(r.result||""),(r.status==="done")?"ok":"err");});}' +
  'function ask(fields,btn){btn.disabled=true;setSt("事務所パソコンに伝えています…","wait");sPolls=0;' +
  'jsonp({action:"submit",key:KEY,op:"translate",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(fields)},' +
  'function(r){if(!r||!r.ok||!r.id){setSt("依頼を送れませんでした。","err");btn.disabled=false;return;}' +
  'setTimeout(function(){pollSub(r.id,btn);},900);});}' +
  'if(remEl){remEl.addEventListener("click",function(){' +
  'var t=(srcEl.value||"").trim(),d=(dstEl.value||"").trim();' +
  'if(!t||!d){setSt("日本語と、覚えさせたい中国語の両方が要ります。","err");return;}' +
  'ask({text:t,gender:gender,remember:d},remEl);});}' +
  'if(termEl){termEl.addEventListener("click",function(){' +
  'var a=(tjaEl.value||"").trim(),b=(tzhEl.value||"").trim();' +
  'if(!a||!b){setSt("日本語と中国語の両方を入れてください。","err");return;}' +
  'ask({text:a,gender:gender,term_ja:a,term_zh:b},termEl);});}' +
  '})();</script>';
  return '<style>' + HOMECSS_ + css + '</style>' +
    '<div class="home">' + backBar_(base, staff, dev) +
    '<h2 class="htitle">翻訳（日本語 → 台湾中国語）</h2>' +
    '<div class="hy">' +
      '<div class="hylbl">お客様（訳し分け）</div>' +
      '<div class="hyseg">' +
        '<button type="button" data-g="共通" class="sel">共通</button>' +
        '<button type="button" data-g="女">女性</button>' +
        '<button type="button" data-g="男">男性</button>' +
      '</div>' +
      '<div class="hylbl">日本語（ここに貼る）</div>' +
      '<textarea id="hysrc" placeholder="配信したい日本語をそのまま貼ってください"></textarea>' +
      '<button type="button" class="hygo" id="hygo">訳す</button>' +
      '<div class="hystatus" id="hystatus">日本語を入れて「訳す」を押してください。</div>' +
      '<div class="hylbl">台湾中国語（なぞってコピー・直せます）</div>' +
      '<textarea id="hydst" placeholder=""></textarea>' +
      // ★パソコン版と同じ「覚えさせる」機能（2026-08-24 まるちゃん）。
      '<button type="button" class="hysub" id="hyrem">この訳で覚える</button>' +
      '<div class="hylbl" style="margin-top:22px">用語を登録（次の翻訳から効きます）</div>' +
      '<div class="hyrow">' +
        '<input type="text" id="hytja" placeholder="日本語（例 プロセル）">' +
        '<input type="text" id="hytzh" placeholder="中国語（例 Procell）">' +
      '</div>' +
      '<button type="button" class="hysub" id="hyterm">用語を登録</button>' +
    '</div>' +
  '</div>' + script;
}

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
    '.tsstatus{font-weight:800;min-height:0;margin:10px 4px;font-size:15px;border-radius:12px;padding:0;}.tsstatus.on{background:#fff;color:#0f172a;padding:10px 14px;box-shadow:0 2px 6px rgba(0,0,0,.12);}.tsstatus.ng{background:#7f1d1d;color:#fecaca;padding:10px 14px;}' +
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
  'function status(t,err){stEl.textContent=t;stEl.className="tsstatus"+(t?(err?" ng":" on"):"");}' +
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
  /* ★2026-09-09まるちゃん決定：本番の時は帯を出さない（当たり前のことを毎回出さない）。 */
  'else if(d){banEl.style.display="none";banEl.textContent="";}});' +
  // ★2026-08-24：あきらめるまでを 18秒 → 210秒（0.6秒×350回）。18秒では、送信の予約が出来ているのに
  //   「失敗しました」と出て、押し直すと二重に予約してしまう危険があった。
  'var polls=0;function poll(id){polls++;if(polls>350){szOvHide_();goEl.disabled=false;szPopup_("エラーが発生しました。通信に失敗しました。もう一度お試しください。");return;}' +
  'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){szOvHide_();goEl.disabled=false;szPopup_("エラーが発生しました。通信に失敗しました。もう一度お試しください。");return;}' +
  'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){poll(id);},600);return;}' +
  'if(r.status!=="done"){szOvHide_();goEl.disabled=false;szPopup_(esc(r.result)||"エラーが発生しました。りゅうさんにお伝えください。");return;}' +
  'goEl.disabled=false;msgEl.value="";imgs=[];fileEl.value="";renderThumbs();codesEl.value="";szOvShow_(szDoneHtml_("送信を予約しました","戻る"),"#16a34a");var _b=document.getElementById("szDoneBack");if(_b){_b.addEventListener("click",function(){szOvHide_();});}});}' +
  'function go(){var msg=(msgEl.value||"").trim();if(!msg&&!imgs.length){status("文章か画像のどちらかは必要です。",true);return;}' +
  'var dv=dateEl.value,tv=timeEl.value;if(!dv||!tv){status("送る日と時刻を入れてください。",true);return;}var send_at=dv+" "+tv;' +
  'var mode=getMode(),target;' +
  'if(mode==="person"){var codes=(codesEl.value||"").split(/[\\s,\\u3001\\uFF0C]+/).filter(Boolean);if(!codes.length){status("番号を入れてください（例 M123）。",true);return;}target={type:"person",codes:codes};}' +
  'else if(mode==="group"){var val=groupEl.value;if(!val){status("グループを選んでください。",true);return;}var g=GROUPS[val];target={type:"tag",tag_id:val,tag_name:g?g.name:""};}' +
  'else if(mode==="all"){target={type:"all"};}else{target={type:"owner"};}' +
  'goEl.disabled=true;szOvShow_(szBusyHtml_("送信を予約中です"),"#2C7A99");' +
  'var names=[],ups=imgs.map(function(o){var n=rnd();names.push(n);return pushImage(n,o);});' +
  'Promise.all(ups).then(function(){' +
  'jsonp({action:"submit",key:KEY,op:"timed_line_send",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({message:msg,send_at:send_at,target:target,images:names})},' +
  'function(r){if(!r||!r.ok||!r.id){szOvHide_();goEl.disabled=false;szPopup_("エラーが発生しました。通信に失敗しました。もう一度お試しください。");return;}setTimeout(function(){poll(r.id);},1000);});' +
  '}).catch(function(){szOvHide_();goEl.disabled=false;szPopup_("エラーが発生しました。画像の送信でつまずきました。もう一度お試しください。");});}' +
  // ★登録した送信の一覧＝パソコン版と同じ1本（sends_view.py）が作った物をそのまま並べる。
  //   状態の言い方・相手の書き方は事務所パソコンが決める＝スマホ側に写しを持たない（2026-08-24）。
  'var listEl=document.getElementById("tslist");' +
  'function drawSends(rows){if(!listEl)return;if(!rows||!rows.length){listEl.innerHTML="<div class=\\"tssub\\">（まだありません）</div>";return;}' +
  'var h="";for(var i=0;i<rows.length;i++){var r=rows[i];' +
  'h+="<div style=\\"background:#fff;color:#0f172a;border-radius:12px;padding:10px 12px;margin:8px 0;\\">"' +
  '+"<div style=\\"font-weight:800\\">"+esc(r.st)+"　"+esc(r.at)+"</div>"' +
  '+"<div style=\\"font-size:14px;margin-top:2px\\">"+esc(r.who)+"　"+esc(r.head)+(r.imgs?("　画像"+r.imgs+"枚"):"")+"</div>"' +
  '+(r.note?("<div style=\\"font-size:13px;color:#7f1d1d;margin-top:2px\\">"+esc(r.note)+"</div>"):"")' +
  /* ★2026-09-08：途中でつまずいた話は、やり直して成功していても出す（後から原因を追えるように） */
  '+(r.trouble?("<div style=\\"font-size:13px;color:#b45309;margin-top:2px\\">⚠ "+esc(r.trouble)+"</div>"):"")' +
  '+(r.cancelable?("<button type=\\"button\\" class=\\"tscancel\\" data-id=\\""+esc(r.id)+"\\" style=\\"margin-top:8px;font:inherit;font-weight:800;color:#fff;background:#b91c1c;border:0;border-radius:10px;padding:8px 14px;\\">取り消し</button>"):"")' +
  '+"</div>";}' +
  'listEl.innerHTML=h;' +
  'var cbs=listEl.querySelectorAll(".tscancel");for(var j=0;j<cbs.length;j++){cbs[j].addEventListener("click",function(){' +
  'var id=this.getAttribute("data-id");szPopup_("この送信を取り消しますか？",{cancel:true,onYes:function(){askSends("timedsend_cancel",id);}});});}}' +
  'var tsPolls=0;function pollSends(qid){tsPolls++;if(tsPolls>LIMITS.tries("timedsend_list",700)){listEl.textContent="読み込めませんでした。";return;}' +
  'jsonp({action:"status",key:KEY,id:qid},function(r){if(!r||!r.ok){listEl.textContent="読み込めませんでした。";return;}' +
  'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollSends(qid);},700);return;}' +
  'if(r.status!=="done"){listEl.textContent=String(r.result||"読み込めませんでした。");return;}' +
  'var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}' +
  'if(d.note){status(d.note,!d.ok);}' +
  'drawSends(d.sends||[]);});}' +
  'function askSends(op,id){if(listEl)listEl.textContent="読み込み中…";tsPolls=0;' +
  'jsonp({action:"submit",key:KEY,op:op,who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(id?{id:id}:{})},' +
  'function(r){if(!r||!r.ok||!r.id){if(listEl)listEl.textContent="読み込めませんでした。";return;}' +
  'setTimeout(function(){pollSends(r.id);},900);});}' +
  'askSends("timedsend_list");' +
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
      '<label class="tsmode"><input type="radio" name="tsmode" value="person" checked> 個人（番号）</label>' +
      '<div class="tssub"><input type="text" id="tscodes" placeholder="M123, F45（カンマや空白で複数可）"></div>' +
      '<label class="tsmode"><input type="radio" name="tsmode" value="group"> グループ</label>' +
      '<div class="tssub"><select id="tsgroup"><option value="">（グループ一覧を読み込み中…）</option></select></div>' +
      '<label class="tsmode"><input type="radio" name="tsmode" value="all"> やり取りのある全員（多いので上限あり）</label>' +
      '<label class="tsmode"><input type="radio" name="tsmode" value="owner"> 本人（練習）</label>' +
      '<button type="button" class="tsgo" id="tsgo">この内容で登録する</button>' +
      '<div class="tsstatus" id="tsstatus">決めた時刻に、選んだ相手へ自動で送ります。</div>' +
          '<div class="tslbl" style="margin-top:26px">登録した送信（新しい順）</div>' +
      '<div id="tslist">読み込み中…</div>' +
'</div>' +
  '</div>' +
  script;
}

/** LINE一斉配信予約（スーパーズコ）＝送る対象ごとに、吹き出しを1つずつ作って進む画面。
 *  ★まるちゃんの決まり（2026-09-05）：
 *    ①①新規 日本男性から**1つずつ設定して次へ進む**（一度に全部出さない）
 *    ②吹き出しは**3つまで**（文章500文字で1つぶん／画像1枚で1つぶん）＝LINEの決まり
 *    ③1つ目が画像でも文章でもよい（**順番は人が決める**）
 *    ④画像は**よく使う画像**（プロセル・チャレンジ4の日本語/中文）から選べる＋別の画像も選べる
 *    ⑤**送る日時はいちばん最後**に決める／使わない対象は飛ばせる
 *    ⑥言い方は「相手」ではなく**「対象」**
 *    ⑦**「予約可能枠の画像を作る」は配信内容の下に目立つ色で置き、押すと専用の画面へ飛ぶ**。
 *      その画面は「日時入力欄」の右に【自動入力】があり、**入力欄は最初は空**。
 *      自分で入れる（または自動入力を押す）→【画像を作る】でAIが作る。
 *      できた絵は各対象の「画像を入れる」の先頭に並ぶ＝好きな対象に入れられる。
 *  ★見た目は**部屋＆担当被り検出とそろえる**（カード #131C2E ／ 中の小箱 #0B1220 ／ 文字 #E8EEF7 ／
 *    添え字 #94A3B8 ／ 枠 #26324A ／ 主要ボタン #2563EB）。**白いカードにしない。**
 *  ★型・安全弁・予約する処理・絵を作る処理は全部事務所パソコン側＝ここは集めて渡すだけ。
 *  開発URL(?dev=1)専用。 */
function renderBroadcastPage_(base, staff, dev) {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var css =
    '.uhome{background:#131C2E;border:1px solid #26324A;color:#E8EEF7;border-radius:10px;' +
    'padding:10px 14px;font-size:.9rem;font-weight:700;box-shadow:none;}' +
    '.bc{max-width:560px;margin:0 auto;width:100%;box-sizing:border-box;' +
    'padding:0 4px 44px;text-align:left;}' +
    '.bcbanner{padding:11px 14px;border-radius:12px;font-weight:800;margin:4px 0 12px;' +
    'font-size:14px;color:#0f172a;line-height:1.5;}' +
    '.bctop{display:flex;align-items:center;gap:10px;margin:0 2px 10px;flex-wrap:wrap;}' +
    '.bctop .lb{font-size:13px;color:#B9CCDA;font-weight:700;}' +
    '.bctop b{background:#131C2E;border:1px solid #26324A;color:#E8EEF7;border-radius:999px;' +
    'padding:7px 15px;font-size:14.5px;font-weight:800;}' +
    '.bctop .no{margin-left:auto;font-size:13px;color:#B9CCDA;font-weight:800;}' +
    // ★配信内容の下に置く「予約可能枠の画像を作る」＝目立つ色（まるちゃん指示）
    '.bcmake{display:block;width:100%;margin:0 0 14px;padding:15px;font-size:17px;font-weight:800;' +
    'border:0;border-radius:12px;background:#D97706;color:#fff;box-shadow:0 3px 10px rgba(0,0,0,.22);}' +
    // ★配信内容の下に置く「予約可能時間文を生成」＝目立つ色（まるちゃん指示 2026-09-08）
    '.bctxt{display:block;width:100%;margin:0 0 14px;padding:15px;font-size:17px;font-weight:800;' +
    'border:0;border-radius:12px;background:#7C3AED;color:#fff;box-shadow:0 3px 10px rgba(0,0,0,.22);}' +
    // 予約可能時間文を生成する画面
    '.bckind{display:block;width:100%;margin:0 0 14px;padding:22px;font-size:19px;' +
    'font-weight:800;border:0;border-radius:12px;background:#2563EB;color:#fff;' +
    'box-shadow:0 3px 10px rgba(0,0,0,.22);}' +
    // ★帯の右はし＝「男女版も作成」の入切（まるちゃん指示 2026-09-09）
    '.bcsplit{display:flex;align-items:center;gap:7px;font-size:14px;font-weight:800;' +
    'color:#E8EEF7;white-space:nowrap;cursor:pointer;}' +
    '.bcsplit input{width:19px;height:19px;accent-color:#2563EB;cursor:pointer;}' +
    '.bcper{display:grid;grid-template-columns:1fr 1fr;gap:10px;}' +
    '.bcper button{padding:16px 8px;font-size:16px;font-weight:800;border:0;border-radius:12px;' +
    'background:#2563EB;color:#fff;}' +
    '.bcper button:disabled{background:#0B1220;color:#5B6B85;}' +
    // ★押されたボタンが一目で分かるように（まるちゃん指示 2026-09-09）＝
    //   明るい緑のまま・白い枠・チェックを付ける。押せない間もこの色を保つ。
    '.bcper button.bcon,.bcper button.bcon:disabled{background:#16A34A;color:#fff;' +
    'box-shadow:0 0 0 3px #fff inset;}' +
    '.bcper button.bcon::before{content:"✓ ";}' +
    '.bcper button.bcrestore{grid-column:1 / -1;background:#7C3AED;}' +
    '.bcper button.bcrestore:disabled{background:#0B1220;color:#5B6B85;}' +
    '.bccard.bcwide{margin-left:-22px;margin-right:-22px;padding:14px 9px 16px;}' +
    '.bc textarea.bcmtx{min-height:200px;font-size:16px;line-height:1.8;padding:9px;}' +
    '.bcstop{display:flex;align-items:baseline;gap:10px;margin:0 0 12px;}' +
    '.bcsttl{font-size:22px;font-weight:900;color:#fff;}' +
    '.bcsno{margin-left:auto;font-size:13px;font-weight:800;color:#DCE7F2;}' +
    '.bcagain{margin:0 0 12px;text-align:left;}' +
    '.bcagainbtn{font:inherit;font-size:13px;font-weight:800;color:#cbd5e1;background:#131C2E;' +
    'border:1px solid #26324A;border-radius:999px;padding:9px 15px;}' +
    '.bcsame{background:#0B1220;border:1px solid #7C3AED;color:#E8EEF7;border-radius:10px;' +
    'padding:12px 14px;font-size:15px;font-weight:800;margin:0 0 16px;' +
    'display:flex;align-items:center;justify-content:space-between;gap:12px;}' +
    '.bcsame.bckage{visibility:hidden;background:transparent;border-color:transparent;}' +
    '.bcout{background:#0B1220;border:1px solid #26324A;border-radius:10px;padding:11px 12px;margin:0 0 10px;}' +
    '.bcouth{display:flex;align-items:center;gap:10px;margin:0 0 8px;}' +
    '.bcouth b{flex:1;font-size:15px;font-weight:800;color:#E8EEF7;}' +
    '.bccopy{border:0;border-radius:9px;padding:9px 15px;font-size:13px;font-weight:800;' +
    'background:#2563EB;color:#fff;white-space:nowrap;}' +
    '.bcouttx{white-space:pre-wrap;font-size:14px;line-height:1.75;color:#E8EEF7;}' +
    '.bc textarea.bcotx{min-height:120px;line-height:1.9;padding:9px;' +
    'overflow-y:hidden;resize:none;white-space:pre;}' +
    '.bcnum{font-size:12px;font-weight:800;color:#94A3B8;margin-top:7px;}' +
    '.bcnum.over{color:#fca5a5;}' +
    // 途中までの作業を復元しますか？（前日お知らせと同じ見た目）
    '.bcask{position:fixed;inset:0;z-index:95;display:flex;align-items:center;justify-content:center;' +
    'background:rgba(8,14,26,.72);padding:18px;}' +
    '.bcask-in{background:#101a2b;border:2px solid #7c3aed;border-radius:14px;padding:22px;' +
    'max-width:520px;text-align:center;color:#E8EEF7;}' +
    '.bcaskmsg{font-size:1.2rem;font-weight:800;line-height:1.6;}' +
    '.bcaskrow{display:flex;gap:12px;justify-content:center;margin-top:16px;flex-wrap:wrap;}' +
    '.bcaskyes{font:inherit;font-size:1.05rem;font-weight:800;color:#fff;background:#7c3aed;' +
    'border:0;border-radius:12px;padding:13px 20px;}' +
    '.bcaskno{font:inherit;font-size:1.05rem;font-weight:800;color:#e8eef7;background:#0b1220;' +
    'border:1px solid #26324A;border-radius:12px;padding:13px 20px;}' +
    '.bcfreshbar{margin:0 0 12px;text-align:right;}' +
    '.bcfreshbtn{font:inherit;font-size:13px;font-weight:800;color:#cbd5e1;background:#131C2E;' +
    'border:1px solid #26324A;border-radius:999px;padding:9px 15px;}' +
    '.bccard{background:#131C2E;border-radius:12px;padding:16px 16px 18px;margin:0 0 12px;' +
    'box-shadow:0 1px 3px rgba(0,0,0,.06);color:#E8EEF7;}' +
    '.bcname{font-size:26px;font-weight:900;line-height:1.25;}' +
    '.bcwho{font-size:13px;color:#94A3B8;margin-top:6px;line-height:1.5;}' +
    '.bchr{border-top:1px solid #26324A;margin:14px 0 12px;}' +
    '.bcpart{display:flex;align-items:center;gap:10px;background:#0B1220;border-radius:10px;' +
    'padding:9px 10px;margin:0 0 8px;}' +
    '.bcpart img{width:42px;height:42px;object-fit:cover;border-radius:8px;flex:0 0 auto;}' +
    '.bcpno{background:#26324A;color:#E8EEF7;border-radius:999px;padding:5px 10px;' +
    'font-size:12px;font-weight:800;white-space:nowrap;flex:0 0 auto;}' +
    '.bcptx{flex:1;min-width:0;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
    // ★配信待ち／配信済みのタブ（まるちゃん指示 2026-09-09）
    '.bctab{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 14px;}' +
    '.bctab button{border:1px solid #26324A;background:#131C2E;color:#9FB3C8;' +
    'border-radius:12px;padding:13px;font-size:16px;font-weight:800;cursor:pointer;}' +
    '.bctab button.on{background:#2563EB;color:#fff;border-color:#2563EB;}' +
    // ★名前の行＝右はしに「タグを変更」（まるちゃん指示 2026-09-09）
    '.bcnamerow{display:flex;align-items:center;gap:10px;}' +
    '.bcnamerow .bcname{flex:1;min-width:0;}' +
    // ★送り先をえらぶ並び
    '.bctaglist{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 4px;}' +
    '.bctaglist button{border:1px solid #26324A;background:#131C2E;color:#E8EEF7;' +
    'border-radius:999px;padding:9px 13px;font-size:14px;font-weight:800;cursor:pointer;}' +
    '.bctaglist button.on{background:#16A34A;color:#fff;border-color:#16A34A;}' +
    // ★並べ替え・直しの小さなボタン（まるちゃん指示 2026-09-09）
    '.bcmv{border:1px solid #26324A;background:#131C2E;color:#E8EEF7;border-radius:9px;' +
    'padding:6px 9px;font-size:13px;font-weight:800;flex:0 0 auto;cursor:pointer;}' +
    '.bcdel{border:1px solid #7f1d1d;background:#2a1214;color:#fca5a5;border-radius:9px;' +
    'padding:7px 11px;font-size:12.5px;font-weight:800;flex:0 0 auto;}' +
    '.bcempty{font-size:14px;color:#94A3B8;padding:2px 0 4px;}' +
    '.bcleft{font-size:13px;color:#94A3B8;font-weight:700;margin:0 0 8px;}' +
    '.bcadd{display:flex;gap:10px;}' +
    '.bcadd button{flex:1;padding:16px 8px;font-size:16.5px;font-weight:800;border:0;' +
    'border-radius:12px;background:#2563EB;color:#fff;}' +
    '.bcadd button:disabled{background:#26324A;color:#94A3B8;}' +
    '.bcgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}' +
    '.bcpick{background:#0B1220;border:1px solid #26324A;border-radius:12px;padding:8px;text-align:center;position:relative;}' +
    '.bcpick .sel{display:block;width:100%;border:0;background:transparent;padding:0;}' +
    '.bczoom{display:block;width:100%;margin-top:6px;border:1px solid #26324A;background:#131C2E;' +
    'color:#B9CCDA;border-radius:9px;padding:7px 4px;font-size:12px;font-weight:800;}' +
    '.bcpick.new{border-color:#D97706;}' +
    '.bcpick img{width:100%;border-radius:8px;display:block;}' +
    '.bcpick span{display:block;font-size:12.5px;font-weight:800;color:#E8EEF7;margin-top:7px;}' +
    '.bc input[type=file]{color:#E8EEF7;font-size:13px;}' +
    '.bc textarea,.bc input[type=date],.bc input[type=time],.bc select{width:100%;box-sizing:border-box;' +
    'font-size:16.5px;padding:12px;border-radius:10px;border:1px solid #26324A;background:#fff;color:#0f172a;}' +
    '.bc textarea{min-height:150px;line-height:1.6;}' +
    '.bccount{font-size:13px;font-weight:800;margin:8px 2px 10px;color:#94A3B8;}' +
    '.bccount.over{color:#fca5a5;}' +
    // 予約可能枠の画像を作る画面
    '.bcwhead{display:flex;align-items:center;gap:10px;margin:0 0 10px;}' +
    '.bcwhead .lb{flex:1;font-size:14px;color:#E8EEF7;font-weight:800;}' +
    '.bcwauto{border:0;border-radius:10px;padding:11px 16px;font-size:14px;font-weight:800;' +
    'background:#D97706;color:#fff;white-space:nowrap;}' +
    '.bcwrow{display:flex;gap:8px;margin:0 0 8px;}' +
    '.bcwrow input{box-sizing:border-box;font-size:15px;padding:10px;border-radius:9px;' +
    'border:1px solid #26324A;background:#fff;color:#0f172a;}' +
    '.bcwrow .d{flex:0 0 128px;text-align:center;}' +
    '.bcwrow .t{flex:1;min-width:0;}' +
    '.bcseg{display:flex;gap:8px;margin:0 0 12px;}' +
    '.bcseg button{flex:1;padding:12px 6px;font-size:14.5px;font-weight:800;border:1px solid #26324A;' +
    'border-radius:10px;background:#0B1220;color:#94A3B8;}' +
    '.bcseg button.on{background:#2563EB;color:#fff;border-color:#2563EB;}' +
    '.bcwimg{width:100%;border-radius:12px;display:block;margin:12px 0 0;}' +
    // ★入力欄の下に出す「【時間】」（なぞってコピーできる・まるちゃん指示 2026-09-09）
    // ★配信する文そのものを見せる白い枠（まるちゃん指示 2026-09-09）
    '.bcotxv{background:#fff;color:#111;border-radius:10px;padding:12px 13px;' +
    'font-size:16px;line-height:1.7;white-space:pre-wrap;word-break:break-word;' +
    'user-select:text;-webkit-user-select:text;}' +
    '.bcinstx{margin-left:auto;padding:7px 11px;border:0;border-radius:9px;' +
    'background:#0B1220;color:#fff;font-size:15px;font-weight:800;cursor:pointer;' +
    'user-select:text;-webkit-user-select:text;white-space:nowrap;}' +
    '.bcgo{display:block;width:100%;margin:0 0 10px;padding:17px;font-size:19px;font-weight:800;' +
    'border:0;border-radius:12px;background:#2563EB;color:#fff;}' +
    '.bcghost{display:block;width:100%;margin:0 0 10px;padding:14px;font-size:15px;font-weight:800;' +
    'border:1px solid #26324A;border-radius:12px;background:#131C2E;color:#E8EEF7;}' +
    '.bcmini{display:block;width:100%;margin:2px 0 8px;padding:10px;font-size:13.5px;font-weight:700;' +
    'border:0;background:transparent;color:#B9CCDA;text-decoration:underline;}' +
    '.bcsum{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;' +
    'border-bottom:1px solid #26324A;font-size:15px;}' +
    '.bcsum:last-child{border-bottom:0;}.bcsum b{font-weight:800;}' +
    '.bcsum span{color:#94A3B8;white-space:nowrap;font-size:13.5px;}' +
    '.bcsum span.on{color:#7dd3a0;font-weight:800;}' +
    '.bcdt{display:flex;gap:10px;margin:0 0 12px;}.bcdt>div{flex:1;}' +
    '.bclbl{font-size:13px;color:#B9CCDA;font-weight:800;margin:16px 2px 8px;}' +
    '.bcitem{background:#131C2E;border-radius:11px;padding:11px 13px;margin:0 0 8px;color:#E8EEF7;}' +
    '.bcit1{font-weight:800;font-size:14px;}' +
    '.bcit2{font-size:12.5px;color:#94A3B8;margin-top:4px;}' +
    '.bccx{margin-top:9px;font-size:12.5px;padding:7px 13px;border-radius:9px;' +
    'border:1px solid #7f1d1d;background:#2a1214;color:#fca5a5;font-weight:800;}' +
    '.bcstatus{font-weight:800;margin:10px 2px;font-size:14.5px;border-radius:11px;padding:0;}' +
    '.bcstatus.on{background:#131C2E;color:#E8EEF7;padding:11px 14px;}' +
    '.bcstatus.ng{background:#2a1214;color:#fca5a5;padding:11px 14px;}';
  var script =
  '<script>(function(){' +
  'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
  'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
  // ★はじめは「配信の種類をえらぶ」画面（まるちゃん指示 2026-09-08）
  'var TPL=[],PRE=[],MADE=[],CAT="",MAXP=3,MAXT=500,DATA=[],step=0,mode="",page="k";' +
  'var WTEXT="",WDONE=[],WBUSY=false,WMSG="";' +
  'var SPER="",SRES=null,SBUSY=false;' +
  'var MSTEP=0,MBODY="",MJA=[],MZH=[],MBUSY=false,MMSG="";' +
  // ★配信文は区分ごとに違う＝本文も区分ごとに持つ（まるちゃん指示 2026-09-08）
  'var MBODYS=["","","",""],MIDX=0;' +
  // ★自分で入れる中国語の文（まるちゃん指示 2026-09-09）
  'var MZBODYS=["","","",""];' +
  // ★最後の確認＝""はボタン2つ／"at"は日時を決める画面（まるちゃん指示 2026-09-08）
  'var LMODE="";' +
  'var box=document.getElementById("bcbody"),stEl=document.getElementById("bcstatus"),banEl=document.getElementById("bcbanner");' +
  'var catEl=document.getElementById("bccatname"),noEl=document.getElementById("bcno");' +
  'var ttlEl=document.getElementById("bctitle"),topEl=document.getElementById("bctoprow");' +
  'var SIDX=0;' +
  // ★直している中身の番号（-1＝新しく入れる・まるちゃん指示 2026-09-09）
  'var EDI=-1;' +
  // ★予約の一覧＝どちらのタブか／読んだ一覧／戻せる分があるか
  'var LTAB="wait",LPOSTS=null,LBATCH=0;' +
  // ★対象の画面へ、どの画面から来たか（0＝日本語の入力／1＝自分で中国語／2＝中国語版の確認）
  //   「← 前に戻る」でここへ戻す（まるちゃん指摘 2026-09-09）
  'var MBACK=0;' +
  // ★対象ごとに選び直した送り先（空＝もとの決まりのまま）と、選べる送り先の一覧
  'var TAGS=[],TAGLIST=[],TAGBUSY=false;' +
  // ★まるちゃんが入口から先へ進んだか（進んだあとに、遅れて届いた返事で画面を戻さない）
  'var MOVED=false;' +
  'function esc(s){return (s==null?"":String(s)).replace(/[&<>\\"\\x27]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\\x27":"&#39;"}[c];});}' +
  'function status(t,err){stEl.textContent=t;stEl.className="bcstatus"+(t?(err?" ng":" on"):"");}' +
  'function jsonp(params,onR){var cb="__bc"+Date.now()+Math.floor(Math.random()*1000);window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
  'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
  'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
  'function pushImage(name,obj){return fetch(EXEC+"?action=push&key="+KEY+"&name="+name,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(obj)});}' +
  'function rnd(){var s="bc_img_",c="abcdefghijklmnopqrstuvwxyz0123456789",i;for(i=0;i<12;i++)s+=c[Math.floor(Math.random()*36)];return s+".json";}' +
  'function ask(op,fields,onDone,onFail){' +
  'var f=fields||{};var p={action:"submit",key:KEY,op:op,who:idn.who,role:idn.role,device:idn.device};' +
  'for(var k in f)p[k]=f[k];' +
  'jsonp(p,function(r){if(!r||!r.ok||!r.id){(onFail||function(){})("依頼を送れませんでした。");return;}' +
  'var lim=(window.LIMITS&&LIMITS.tries)?LIMITS.tries(op,700):500;' +
  'var n=0;(function poll(){n++;if(n>lim){(onFail||function(){})("時間がかかりすぎました。");return;}' +
  'jsonp({action:"status",key:KEY,id:r.id},function(s){if(!s||!s.ok){(onFail||function(){})("通信に失敗しました。");return;}' +
  'if(s.status==="pending"||s.status==="running"||s.status==="queued"||s.status===""){setTimeout(poll,700);return;}' +
  'if(s.status!=="done"){(onFail||function(){})(String(s.result||"うまくいきませんでした。"));return;}' +
  'var d=null;try{d=JSON.parse(s.result);}catch(e){d={ok:true,note:String(s.result||"")};}' +
  'onDone(d);});})();});}' +
  // ── 中身の言い方 ──────────────────────────────────────
  'function picks(){return MADE.concat(PRE);}' +
  'function preOf(key){var a=picks();for(var i=0;i<a.length;i++)if(a[i].key===key)return a[i];return null;}' +
  'function partLabel(p){if(p.kind==="text")return "文章 "+p.text.length+"文字　"+p.text.replace(/\\n/g," ").slice(0,22);' +
  'if((p.src||"").indexOf("made:")===0)return "予約可能枠の画像";' +
  'var pr=preOf((p.src||"").replace(/^(preset|made):/,""));return pr?pr.label:"その場で選んだ写真";}' +
  'function partThumb(p){if(p.kind==="text")return "";' +
  'var pr=preOf((p.src||"").replace(/^(preset|made):/,""));return pr?pr.thumb:(p.thumb||"");}' +
  'function filled(i){return (DATA[i]&&DATA[i].parts||[]).length;}' +
  // ★中身が入っている対象だけを並べる（まるちゃん指示 2026-09-09＝
  //   本文を作らなかった対象は送らないので、確認の画面にも出さない）
  'function tLive(){var a=[],i;for(i=0;i<TPL.length;i++)if(filled(i))a.push(i);return a;}' +
  'function nextLive(from){var a=tLive(),i;' +
  'for(i=0;i<a.length;i++)if(a[i]>from)return a[i];return TPL.length;}' +
  'function prevLive(from){var a=tLive(),i;' +
  'for(i=a.length-1;i>=0;i--)if(a[i]<from)return a[i];return -1;}' +
  // ── 画面を描く ────────────────────────────────────────
  // ★途中までの作業は「置き場」に覚える（端末の記憶はパソコンの窓では使えないため）。
  // ★★名前に端末を入れてはいけない（2026-09-08 実際に作業が消えた）＝パソコンの窓は
  //   「記憶を残さない」設定で開くので、**開くたびに別の端末と見なされて名前が変わり**、
  //   前に覚えた分を二度と見つけられなくなる。この画面は開発者ひとりしか使わないので
  //   名前は1つに固定する＝パソコンで作ってスマホで続きもできる。
  'var WIPNAME="bc_wip.json";' +
  'var WIPON=false,WIPT=null,WIPMAX=1200000,FRESH=false;' +
  // ★その場で選んだ写真も覚える（2026-09-05 まるちゃん指摘で実測＝端末は11.7MB以上入る）。
  //   入りきらない時だけ写真をあきらめる（他の中身は必ず残す）。
  'function partsFor(x,withPhoto){return (x.parts||[]).filter(function(p){return withPhoto||!p.b64;})' +
  '.map(function(p){return p.kind==="text"?{kind:"text",text:p.text,g:p.g}:{kind:"image",src:p.src,b64:p.b64};});}' +
  'function packNow(withPhoto){return {t:Date.now(),step:step,text:WTEXT,body:MBODY,' +
  'per:SPER,waku:SRES,sidx:SIDX,page:page,bodies:MBODYS,zbodies:MZBODYS,' +
  'ja:MJA,zh:MZH,tags:TAGS,mback:MBACK,' +
  'midx:MIDX,mstep:MSTEP,' +
  'data:DATA.map(function(x){return {parts:partsFor(x,withPhoto)};})};}' +
  'function saveNow(){if(!WIPON)return;' +
  'if(WIPT)clearTimeout(WIPT);' +
  'WIPT=setTimeout(function(){WIPT=null;' +
  'var o=packNow(true);' +
  // ★★空っぽの状態を、覚えてある作業の上に書かない（2026-09-09 これで実際に消えた）。
  //   まっさらに戻す時は wipClear が別に空っぽを書くので、そちらは今までどおり効く。
  'if(!wipAny(o))return;' +
  'try{if(JSON.stringify(o).length>WIPMAX)o=packNow(false);}catch(e){}' +
  'try{pushImage(WIPNAME,o);}catch(e2){}},1200);}' +
  'function wipClear(){if(WIPT){clearTimeout(WIPT);WIPT=null;}' +
  'try{pushImage(WIPNAME,{t:Date.now(),data:[]});}catch(e){}}' +
  'function wipCount(s){var k=0;for(var i=0;i<((s&&s.data)||[]).length;i++)' +
  'if(((s.data[i]||{}).parts||[]).length)k++;return k;}' +
  // ★途中の作業があるか＝対象の中身・予約可能時間文・配信文の本文のどれかがあれば「ある」
  'function wipAny(s){if(!s)return false;' +
  // ★聞くのは「人が書いた文」か「対象に入れた中身」がある時だけ（まるちゃん指摘 2026-09-08）。
  //   時刻の一覧はいつでも作り直せるので、それだけのために聞かない。
  'var bs=(s.bodies||[]).join("");' +
  'return !!(wipCount(s)||String(bs).trim()||String(s.body||"").trim());}' +
  // ★覚えていた続きの画面へ飛ぶ
  'function goSaved(s){applySaved(s);FRESH=true;' +
  'var pg=s.page;if(pg!=="s"&&pg!=="m"&&pg!=="w"&&pg!=="t")' +
  'pg=((SRES&&SRES.groups||[]).length)?"s":"t";' +
  'page=pg;mode="";}' +
  'function applySaved(s){' +
  'for(var i=0;i<TPL.length;i++){var ps=((s.data[i]||{}).parts)||[];' +
  'DATA[i].parts=ps.slice(0,MAXP).map(function(p){' +
  'if(p.kind==="image"&&p.b64&&!p.thumb)p.thumb="data:image/jpeg;base64,"+p.b64;return p;});}' +
  'WTEXT=s.text||"";MBODY=s.body||"";SPER=s.per||"";SIDX=s.sidx||0;' +
  'if(s.bodies&&s.bodies.length)MBODYS=s.bodies;' +
  'if(s.zbodies&&s.zbodies.length)MZBODYS=s.zbodies;' +
  'if(s.ja&&s.ja.length)MJA=s.ja;if(s.zh&&s.zh.length)MZH=s.zh;' +
  'if(s.tags&&s.tags.length)TAGS=s.tags;' +
  'if(s.mback===0||s.mback===1||s.mback===2)MBACK=s.mback;' +
  'MIDX=s.midx||0;' +
  'if(s.mstep===0||s.mstep===1||s.mstep===2)MSTEP=s.mstep;else MSTEP=0;' +
  'if(s.waku&&s.waku.groups){SRES=s.waku;fixWaku();}' +
  'if(typeof s.step==="number"&&s.step>=0&&s.step<=TPL.length)step=s.step;}' +
  // ★大きく見る（押した1枚だけ、事務所パソコンから大きい見本をもらう）
  'function bigView(src,name){' +
  'function show(u){szOvShow_(\'<div style="padding:14px;text-align:center">\'+' +
  '\'<img src="\'+u+\'" style="max-width:92vw;max-height:74vh;border-radius:12px;display:block;margin:0 auto">\'+' +
  '\'<div style="color:#E8EEF7;font-size:13px;margin-top:10px">\'+' +
  '(u===src?"はっきりした絵を出しています…（15秒ほど）":"")+\'</div>\'+' +
  '\'<button type="button" id="bcbigx" style="margin:16px auto 0;display:block;border:0;border-radius:12px;\'+' +
  '\'padding:14px 34px;font-size:17px;font-weight:800;background:#2563EB;color:#fff">閉じる</button></div>\',"#2C7A99");' +
  'setTimeout(function(){var b=document.getElementById("bcbigx");if(b)b.onclick=function(){szOvHide_();};},80);}' +
  'show(src);' +
  'if(!name)return;' +
  // ★大きい絵は答えに載せられない（窓口を通らない）ので、事務所パソコンが置き場へ置き、
  //   こちらは置き場から読む（前日お知らせ・コストと同じやり方）。
  'var slot=(idn.device||"x").replace(/[^a-z0-9_]/g,"").slice(0,20)||"d";' +
  'ask("bc_wakuimg",{fields:JSON.stringify({mode:"big",name:name,slot:slot})},' +
  'function(r){if(!r||!r.ok||!document.getElementById("bcbigx"))return;' +
  'jsonp({action:"data",name:"bc_big_"+(r.slot||slot)+".json"},function(d){' +
  'if(d&&d.big&&d.name===name&&document.getElementById("bcbigx"))show(d.big);});},function(){});}' +
  'function freshBar(){return FRESH?' +
  '\'<div class="bcfreshbar"><button type="button" class="bcfreshbtn" id="bcfresh">\'+' +
  '\'↩ まっさらに戻す</button></div>\':"";}' +
  'function bindFresh(){var b=document.getElementById("bcfresh");if(!b)return;' +
  'b.onclick=function(){szPopup_("入れた中身を全部消して、まっさらから始めますか？",{cancel:true,' +
  'onYes:function(){wipClear();DATA=TPL.map(function(){return {parts:[]};});' +
  'WTEXT="";MBODY="";SPER="";SRES=null;MJA=[];MZH=[];MSTEP=0;MMSG="";' +
  'step=0;page="k";mode="";FRESH=false;status("まっさらに戻しました。");draw();}});};}' +
  'function draw(){saveNow();' +
  'if(page==="k"){drawKind();}else if(page==="l"){drawSent();}' +
  'else if(page==="w"){drawWaku();}' +
  'else if(page==="s"){drawText();}else if(page==="m"){drawMake();}' +
  'else{if(step<TPL.length&&!filled(step))step=nextLive(step-1);' +
  'if(step<TPL.length){drawOne();}else{drawLast();}}' +
  'noEl.textContent=(page==="k")?"":((page==="w")?"画像づくり":((page==="s")?"文づくり":' +
  '((page==="m")?"配信文づくり":' +
  '((step<TPL.length)?("対象 "+(step+1)+" / "+TPL.length):"最終確認"))));' +
  // ★上の行（配信内容／予約可能枠案内／…）はどの画面でも出さない。題も入口だけ
  //   （まるちゃん指示 2026-09-09＝前の画面と同じにする）。
  'var slim=((page==="k")||(page==="s"))?"none":"";' +
  'if(topEl)topEl.style.display="none";' +
  'if(ttlEl)ttlEl.style.display=(page==="k")?"":"none";' +
  'banEl.style.display=slim;}' +
  // ── 予約可能枠の画像を作る（専用の画面）──────────────────
  'function drawWaku(){' +
  'var h=\'<div class="bccard"><div class="bcname">予約可能枠の画像を作る</div>\'+' +
  '\'<div class="bchr"></div>\'+' +
  '\'<div class="bcwhead"><span class="lb">日時入力欄</span>\'+' +
  '\'<button type="button" class="bcwauto" id="bcwauto">自動入力</button></div>\'+' +
  '\'<textarea id="bcwtxt" style="min-height:260px;font-size:14px" \'+' +
  '\'placeholder="ここに空き時間検索の出力を貼るか、自分で書いてください。&#10;&#10;'+
  '新規&#10;9/8（火）&#10;16:30&#10;9/9（水）&#10;11:00 / 12:00">\'+esc(WTEXT)+\'</textarea>\';' +
  'if(WDONE.length){h+=\'<div class="bchr"></div><div class="bcleft">できた画像</div><div class="bcgrid">\'+' +
  'WDONE.map(function(x){return \'<div class="bcpick new"><img src="\'+x.thumb+\'" data-bigw="\'+esc(x.name||"")+\'" style="cursor:zoom-in"><span>\'+' +
  'esc(x.label)+\'</span></div>\';}).join("")+\'</div>\';}' +
  'h+=\'</div>\';' +
  'h+=\'<button type="button" class="bcgo" id="bcwmake"\'+(WBUSY?" disabled":"")+\'>\'+' +
  '(WBUSY?"画像を生成しています...":"この内容で画像を作る")+\'</button>\';' +
  'if(WMSG)h+=\'<div class="bcstatus on">\'+esc(WMSG)+\'</div>\';' +
  'box.innerHTML=freshBar()+h;bindWaku();bindFresh();}' +
  'function bindWaku(){' +
  'var ta=document.getElementById("bcwtxt");' +
  'if(ta)ta.oninput=function(){WTEXT=ta.value;};' +
  '[].slice.call(box.querySelectorAll("[data-bigw]")).forEach(function(b){b.onclick=function(){' +
  'bigView(b.getAttribute("src"),b.getAttribute("data-bigw"));};});' +
  'document.getElementById("bcwauto").onclick=function(){' +
  'var b=document.getElementById("bcwauto");b.disabled=true;status("今週の空き枠を数えています…");' +
  'ask("bc_wakuimg",{fields:JSON.stringify({mode:"auto"})},' +
  'function(r){b.disabled=false;WTEXT=(r&&r.text)||"";status(WTEXT?"空き枠を入れました。直せます。":"空き枠がありませんでした。",!WTEXT);draw();},' +
  'function(m){b.disabled=false;status(m,true);});};' +
  'document.getElementById("bcwmake").onclick=function(){' +
  'if(ta)WTEXT=ta.value;' +
  'if(!(WTEXT||"").trim()){status("日時入力欄が空です。貼るか「自動入力」を押してください。",true);return;}' +
  'WBUSY=true;WDONE=[];WMSG="";status("");draw();' +
  'runMake(WTEXT,function(i,tot,label){WMSG=(i+1)+"枚目 / "+tot+"枚　"+label;draw();},' +
  'function(done,err){WBUSY=false;' +
  'if(err){WMSG="";status(err,true);}' +
  'else WMSG="できました。"+done+"枚を、それぞれの対象の1つ目に入れました。";' +
  'draw();});};}' +
  'function runMake(text,onStep,onDone){' +
  'ask("bc_wakuimg",{fields:JSON.stringify({mode:"plan",text:text})},' +
  'function(r){if(!r||!r.ok||!r.jobs||!r.jobs.length){onDone(0,(r&&r.note)||"読み取れませんでした。");return;}' +
  'var jobs=r.jobs,i=0,done=0;' +
  '(function next(){if(i>=jobs.length){onDone(done,"");return;}' +
  'var j=jobs[i];onStep(i,jobs.length,j.label);' +
  'ask("bc_wakuimg",{fields:JSON.stringify({mode:"make",kind:j.kind,days:j.days})},' +
  'function(g){if(g&&g.ok&&g.name){WDONE.push({label:j.label,thumb:g.thumb,name:g.name});' +
  'putIntoTargets(j.targets,g.name,g.thumb);done++;}i++;next();},' +
  'function(m2){onDone(done,"「"+j.label+"」で止まりました："+m2);});})();},' +
  'function(m){onDone(0,m);});}' +
  // できた絵を、その対象の1つ目に入れる（前に入れた予約可能枠の絵は取り替える）
  // ★空っぽの区分（送らない区分）には絵も入れない（まるちゃん指示 2026-09-09）
  'var SENDN=null;' +
  'function putIntoTargets(names,name,thumb){' +
  '(names||[]).forEach(function(nm){' +
  'if(SENDN&&SENDN.indexOf(nm)<0)return;' +
  'for(var i=0;i<TPL.length;i++){if(TPL[i].name!==nm)continue;' +
  'var ps=DATA[i].parts;' +
  'for(var k=ps.length-1;k>=0;k--){if(ps[k].kind==="image"&&(ps[k].src||"").indexOf("made:")===0)ps.splice(k,1);}' +
  'ps.unshift({kind:"image",src:"made:"+name,thumb:thumb});' +
  'while(ps.length>MAXP)ps.pop();}});}' +
  // ── 予約可能時間文を生成（専用の画面・2026-09-08 まるちゃんの決めた形）──────
  //   4つのボタンで期間を選ぶと、空き時間検索と同じ答えを事務所パソコンが出す。
  //   男性と女性がずっと同じ時刻なら男女に分けず、一番上に「新規と既存の二種類だけ作成」と出す。
  //   ★直せるのは日本語だけ。中国語版は曜日を入れ替えてその場で作る＝直した瞬間に必ずそろう
  //     （曜日の対応表は事務所パソコンがくれる＝共通\予約可能枠.py の1本だけが持つ）。
  'function zhOf(s){var w=(SRES&&SRES.wd)||{};' +
  'return String(s||"").replace(/（([月火水木金土日])）/g,function(m,d){return "（"+(w[d]||d)+"）";});}' +
  // ★期間のボタンは4つやめて1つにした（まるちゃん指示 2026-09-08）。
  //   算出するのは「今週」＝今日から今度の土曜日まで。
  //   ★台湾のお客様向けの下書きは画面に出さない（裏では作っていて、配信文づくりで使う）。
  // ★最初は期間の4つのボタン。算出したあとの画面には4つを出さない（まるちゃん指示 2026-09-08）。
  //   選び直したい時は「↩ 期間を選び直す」で最初に戻る。
  //   ★台湾のお客様向けの下書きは画面に出さない（裏では作っていて、配信文づくりで使う）。
  // ★算出したあとは**1個ずつ**見せる（まるちゃん指示 2026-09-08）。
  //   ・上の帯（題・練習モードの案内・配信内容の行）は出さない＝文の欄を大きく使う
  //   ・「予約可能時間文を生成」は白字で黒い枠の上に出す
  //   ・文の欄は中身が全部見える高さ（`fitTx`）・字も大きい
  //   ・下のボタン＝どの区分でも「この内容でOK」→次へ（まるちゃん指示 2026-09-09）
  // ★中身が全部見える高さにする。1回だと折り返しが変わって足りないことがあるので
  //   落ち着くまで数回はかり直す（実測で1回目346px→本当は401px必要だった）。
  // ★字は「一番長い行が折り返さずに収まる、いちばん大きい大きさ」にする（10〜22px）。
  //   まるちゃん「文字ももっとおおきく。でも一日の時間は全部一行内で表示」。
  'function fitTx(a){if(!a)return;' +
  // ★どの区分でも同じ大きさにするため、全部の区分の中で一番長い行に合わせる
  'var gs=(SRES&&SRES.groups)||[],lg="",i,j,lines;' +
  'for(j=0;j<gs.length;j++){lines=String(gs[j].text||"").split("\\n");' +
  'for(i=0;i<lines.length;i++)if(lines[i].length>lg.length)lg=lines[i];}' +
  'if(!gs.length){lines=String(a.value||"").split("\\n");' +
  'for(i=0;i<lines.length;i++)if(lines[i].length>lg.length)lg=lines[i];}' +
  'var cs=getComputedStyle(a);' +
  'var w=a.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-2;' +
  'if(w>0&&lg){var pr=document.createElement("span");' +
  'pr.style.cssText="position:absolute;left:-9999px;top:0;white-space:pre;visibility:hidden;";' +
  'pr.style.fontFamily=cs.fontFamily;pr.style.fontWeight=cs.fontWeight;' +
  'pr.textContent=lg;document.body.appendChild(pr);' +
  'var f=22;for(;f>10;f--){pr.style.fontSize=f+"px";' +
  'if(pr.getBoundingClientRect().width<=w)break;}' +
  'pr.parentNode.removeChild(pr);a.style.fontSize=f+"px";}' +
  'function go(){a.style.height="0px";a.style.height=(a.scrollHeight+10)+"px";}' +
  'go();setTimeout(go,0);setTimeout(go,150);}' +
  // ★配信の種類をえらぶ画面（入口）。いまは「予約可能枠案内」の1つだけ。
  //   下に「設定した配信の予約を確認する」も置く（まるちゃん指示 2026-09-09）。
  'function drawKind(){' +
  'var h=\'<button type="button" class="bckind" id="bckind1">予約可能枠案内</button>\'+' +
  '\'<button type="button" class="bctxt" id="bcseelist">設定した配信の予約を確認する</button>\';' +
  'box.innerHTML=freshBar()+h;bindFresh();' +
  'document.getElementById("bckind1").onclick=function(){MOVED=true;page="s";status("");draw();};' +
  'var sl=document.getElementById("bcseelist");' +
  'if(sl)sl.onclick=function(){MOVED=true;page="l";status("");draw();};}' +
  // ★設定した配信の予約を確かめる画面（まるちゃん指示 2026-09-09）。
  //   「配信待ち」と「配信済み」に分ける。配信済みは昨日までの分だけ。
  'function drawSent(){' +
  'var h=\'<div class="bcstop"><span class="bcsttl">設定した配信の予約</span></div>\'+' +
  '\'<div class="bctab"><button type="button" id="bctab1" class="\'+' +
  '((LTAB==="wait")?"on":"")+\'">配信待ち</button>\'+' +
  '\'<button type="button" id="bctab2" class="\'+' +
  '((LTAB==="done")?"on":"")+\'">配信済み</button></div>\'+' +
  '\'<div id="bclist"><div class="bcouttx">読んでいます…</div></div>\';' +
  'box.innerHTML=h;' +
  'document.getElementById("bctab1").onclick=function(){LTAB="wait";status("");draw();};' +
  'document.getElementById("bctab2").onclick=function(){LTAB="done";status("");draw();};' +
  'if(LPOSTS){drawList(LPOSTS);}else{loadList();}}' +
  'function drawText(){' +
  'var P=[["今週","今週"],["明日","明日"],["今日明日","今日・明日"],["一週間","今日から一週間"]];' +
  'var gs=(SRES&&SRES.groups)||[];var h;' +
  'if(!gs.length){' +
  'h=\'<div class="bcstop"><span class="bcsttl">予約可能時間を自動生成</span></div>\'+' +
  '\'<div class="bccard">\'+' +
  '\'<div class="bcper">\'+P.map(function(x){return \'<button type="button" data-per="\'+x[0]+\'"\'+' +
  '((x[0]===SPER)?\' class="bcon"\':"")+(SBUSY?" disabled":"")+\'>\'+x[1]+\'</button>\';}).join("")+' +
  '\'<button type="button" class="bcrestore" id="bcrest"\'+(SBUSY?" disabled":"")+\'>\'+' +
  '\'作業中のデータを復元する</button></div>\';' +
  'if(SRES)h+=\'<div class="bchr"></div><div class="bcempty">\'+' +
  'esc(SRES.note||"この期間に空いている枠がありませんでした。")+\'</div>\';' +
  'h+=\'</div>\';' +
  'box.innerHTML=freshBar()+h;bindText();bindFresh();return;}' +
  'if(SIDX>=gs.length)SIDX=gs.length-1;if(SIDX<0)SIDX=0;' +
  'var g=gs[SIDX];' +
  // ★ここから先は出来た文を直す画面なので見出しも「修正」（まるちゃん指示 2026-09-09）
  'h=\'<div class="bcstop"><span class="bcsttl">予約可能時間を修正</span>\'+' +
  '\'<span class="bcsno">\'+(SIDX+1)+\' / \'+gs.length+\'</span></div>\'+' +
  '\'\';' +
  // ★2枚目からは中身を見せないが、帯そのものは同じ大きさで置く。
  //   消すと下の欄が上にずれてしまうため（まるちゃん指示 2026-09-09）。
  'h+=\'<div class="bcsame\'+((SIDX===0)?"":" bckage")+\'"><span>\'+' +
  '(SRES.split?"新規・既存を男女に分けて作成":"新規と既存の二種類だけ作成")+\'</span>\'+' +
  '\'<label class="bcsplit"><input type="checkbox" id="bcsplitcb"\'+' +
  '(SRES.split?" checked":"")+\'>男女版も作成</label></div>\';' +
  'h+=\'<div class="bccard bcwide"><div class="bcouth"><b>\'+esc(g.label)+\'</b>\'+' +
  '\'<button type="button" class="bccopy" data-cp="\'+SIDX+\'">コピー</button></div>\'+' +
  '\'<textarea class="bcotx" wrap="off" data-ed="\'+SIDX+\'">\'+esc(g.text)+\'</textarea></div>\';' +
  'h+=\'<button type="button" class="bcgo" id="bcsnext">この内容でOK</button>\';' +
  'box.innerHTML=freshBar()+h;bindText();bindFresh();' +
  'fitTx(box.querySelector(".bcotx"));}' +
  'function bindText(){' +

  'var e=document.getElementById("bcagain");' +
  'if(e)e.onclick=function(){SRES=null;SPER="";SIDX=0;status("");draw();};' +
  'e=document.getElementById("bcrest");' +
  'if(e)e.onclick=function(){status("作業中のデータを探しています…");' +
  'jsonp({action:"data",name:WIPNAME},function(d){' +
  'var s=(d&&d.data&&d.data.length===TPL.length)?d:null;' +
  'if(!wipAny(s)){status("作業中のデータはありません。",true);return;}' +
  'goSaved(s);status("作業中のデータを復元しました。");draw();});};' +
  // ★ここは専用の入れ物にする。e は下でほかの部品に入れ替わるので、
  //   e のまま覚えると押した時に別の部品を見てしまう（2026-09-09の不具合）。
  'var cb=document.getElementById("bcsplitcb");' +
  'if(cb)cb.onchange=function(){splitOn(cb.checked);};' +
  'if(cb)cb.onclick=function(){splitOn(cb.checked);};' +
  'e=document.getElementById("bcsnext");' +
  'if(e)e.onclick=function(){var gs=(SRES&&SRES.groups)||[];' +
  'if(SIDX>=gs.length-1){page="m";MSTEP=0;MMSG="";status("");draw();return;}' +
  'SIDX++;status("");draw();};' +
  '[].slice.call(box.querySelectorAll("[data-per]")).forEach(function(b){b.onclick=function(){' +
  'var k=b.getAttribute("data-per");SPER=k;SRES=null;SIDX=0;SBUSY=true;' +
  'status("空き時間を算出しています…");draw();' +
  'ask("bc_waku",{fields:JSON.stringify({period:k})},function(r){SBUSY=false;' +
  'if(!r||!r.ok){status((r&&r.note)||"算出できませんでした。",true);draw();return;}' +
  'setWaku(r);SIDX=0;status("");draw();},function(m){SBUSY=false;status(m,true);draw();});};});' +
  '[].slice.call(box.querySelectorAll("[data-ed]")).forEach(function(a){a.oninput=function(){' +
  'var i=a.getAttribute("data-ed")*1;if(!SRES||!SRES.groups[i])return;' +
  'SRES.groups[i].text=a.value;' +
  'var kk=SRES.groups[i].k;if(SRES.all&&SRES.all[kk])SRES.all[kk].text=a.value;' +
  'fitTx(a);saveNow();};});' +
  '[].slice.call(box.querySelectorAll("[data-cp]")).forEach(function(b){b.onclick=function(){' +
  'var g=((SRES&&SRES.groups)||[])[b.getAttribute("data-cp")*1];if(g)bcCopy(g.text,b);};});}' +
  'function bcCopy(s,b){if(!s)return;var old=b.textContent;' +
  'function done(){b.textContent="コピーしました";setTimeout(function(){b.textContent=old;},1500);}' +
  'if(navigator.clipboard&&navigator.clipboard.writeText){' +
  'navigator.clipboard.writeText(s).then(done,function(){bcFallCopy(s,done);});}else bcFallCopy(s,done);}' +
  'function bcFallCopy(s,cb){var ta=document.createElement("textarea");ta.value=s;' +
  'ta.style.position="fixed";ta.style.left="-9999px";document.body.appendChild(ta);ta.select();' +
  'try{document.execCommand("copy");cb();}catch(e){}document.body.removeChild(ta);}' +
  // ★空っぽなら何も作らない＝その区分は送らない（まるちゃん指示 2026-09-09）
  'function joinBody(body,times){body=String(body||"");' +
  'if(!body.replace(/^\\s+|\\s+$/g,""))return "";' +
  'if(body.indexOf("【時間】")>=0)return body.replace(/【時間】/g,times);' +
  'return body.replace(/\\s+$/,"")+"\\n\\n"+times;}' +
  'function tgtNames(atama,sei,lang){var out=[];' +
  'for(var i=0;i<TPL.length;i++){var nm=TPL[i].name;' +
  'if(nm.indexOf(atama)<0)continue;' +
  'if(nm.indexOf(lang==="ja"?"日本":"台湾")<0)continue;' +
  'if(sei&&nm.indexOf(sei)<0)continue;out.push(nm);}return out;}' +
  'function putTextInto(names,txt){' +
  'var has=!!String(txt||"").replace(/^\\s+|\\s+$/g,"");' +
  '(names||[]).forEach(function(nm){' +
  'for(var i=0;i<TPL.length;i++){if(TPL[i].name!==nm)continue;var ps=DATA[i].parts;' +
  'for(var k=ps.length-1;k>=0;k--){if(ps[k].kind==="text"&&ps[k].g)ps.splice(k,1);}' +
  'if(!has)continue;' +
  'if(ps.length>=MAXP)ps.pop();ps.push({kind:"text",text:txt,g:1});}});}' +
  // ★配信文は8通り全部わける（時刻が男女同じでも文は8つ作る・まるちゃん指示 2026-09-08）。
  //   並びは 🇯🇵新規男性→既存男性→新規女性→既存女性 → 🇹🇼同じ順（画像づくりの自動入力と同じ順）。
  'var BORDER=[["新規","男性"],["既存","男性"],["新規","女性"],["既存","女性"]];' +
  // ★事務所パソコンからは いつも男女に分けた4つ が来る（2026-09-09）。
  //   「男女版も作成」を切っている時は、男性のものだけを 新規／既存 として見せる。
  'function setWaku(r){SRES=r;' +
  'SRES.all=(r.groups||[]).slice();' +
  'SRES.split=!r.same;buildG();}' +
  'function buildG(){var a=(SRES&&SRES.all)||[];' +
  'if(SRES.split){SRES.groups=a.map(function(g,k){' +
  'return {atama:g.atama,sei:g.sei,label:g.label,text:g.text,k:k};});return;}' +
  'SRES.groups=[];' +
  'for(var k=0;k<a.length;k++){if(a[k].sei!=="男性")continue;' +
  'SRES.groups.push({atama:a[k].atama,sei:"",label:a[k].atama,text:a[k].text,k:k});}}' +
  // 古い保存（男女に分ける前の形）から戻した時も動くようにする
  'function fixWaku(){if(!SRES||!SRES.groups||SRES.all)return;' +
  'var g=SRES.groups;SRES.split=!!(g.length&&g[0].sei);' +
  'SRES.all=g.map(function(x){return {atama:x.atama,sei:x.sei||"男性",' +
  'label:x.label,text:x.text};});buildG();}' +
  // 男女が同じ時に「分ける」へ切り替えたら、女性側へ男性側の中身をそのまま写す
  'function splitOn(on){if(!SRES)return;' +
  'if(on&&!SRES.split&&SRES.same){var a=SRES.all,i,j;' +
  'for(i=0;i<a.length;i++){if(a[i].sei!=="女性")continue;' +
  'for(j=0;j<a.length;j++)if(a[j].sei==="男性"&&a[j].atama===a[i].atama)a[i].text=a[j].text;}}' +
  'SRES.split=!!on;SIDX=0;buildG();saveNow();status("");draw();}' +
  'function timesOf(atama,sei){var gs=(SRES&&SRES.groups)||[],i;' +
  'for(i=0;i<gs.length;i++)if(gs[i].atama===atama&&gs[i].sei===sei)return gs[i].text;' +
  'for(i=0;i<gs.length;i++)if(gs[i].atama===atama&&!gs[i].sei)return gs[i].text;' +
  'return "";}' +
  'function tooLong(a){for(var i=0;i<a.length;i++)if((a[i].text||"").length>MAXT)return a[i].label;' +
  'return "";}' +
  'function cardsOf(a){return a.map(function(x){var over=(x.text||"").length>MAXT;' +
  'return \'<div class="bcout"><div class="bcouth"><b>\'+esc(x.label)+\'</b></div>\'+' +
  '\'<div class="bcouttx">\'+esc(x.text)+\'</div>\'+' +
  '\'<div class="bcnum\'+(over?" over":"")+\'">\'+(x.text||"").length+\'文字\'+' +
  '(over?("　※"+MAXT+"文字を超えています。短くしてください"):"")+\'</div></div>\';}).join("");}' +
  // ── 配信文を作る（専用の画面・2026-09-08 まるちゃんの決めた順）──────────
  //   ①日本語の文章を入れる →②時間が入った文を確かめる →③台湾版（自動で訳す）を確かめる
  //   →④8つの対象に文を入れ、続けて予約可能枠の画像も作って1つ目に入れる。
  // ★配信文は**1個ずつ**（まるちゃん指示 2026-09-08「全員違う文章だから1個ずつ入力して画面移動」）。
  //   並びは 🇯🇵新規男性→既存男性→新規女性→既存女性。入力欄の下に「できあがり」を出す。
  'function ordLabel(i,zh){var x=BORDER[i];return (zh?"🇹🇼":"🇯🇵")+x[0]+x[1];}' +
  // ★これから送る区分の名前を並べる（空欄は入れない・まるちゃん指示 2026-09-09）
  'function sendNames(){var a=[],i;' +
  'for(i=0;i<BORDER.length;i++)' +
  'if(String((MJA[i]||{}).text||"").replace(/^\\s+|\\s+$/g,""))a.push(ordLabel(i,false));' +
  'for(i=0;i<BORDER.length;i++)' +
  'if(String((MZH[i]||{}).text||"").replace(/^\\s+|\\s+$/g,""))a.push(ordLabel(i,true));' +
  'return a;}' +
  // ★最後のボタンの文＝何種類のどれを作るかを書く
  'function makeBtn(id){var a=sendNames();' +
  'if(!a.length)return \'<div class="bcstatus ng">送る区分がありません。\'+' +
  '\'「← 前に戻る」で文を入れてください。</div>\';' +
  'return \'<button type="button" class="bctxt" id="\'+id+\'">以上の内容で、\'+' +
  'a.length+\'種類（\'+esc(a.join("・"))+\'）の予約可能枠画像を生成する</button>\'+' +
  // ★絵を作らずに中身の確認へ進む道（まるちゃん指示 2026-09-09）
  '\'<button type="button" class="bcgo" id="\'+id+\'n">\'+' +
  '\'画像は生成せず配信内容の最終確認をする</button>\';}' +
  // ★中身のある区分の番号だけを並べる（空欄は数にも入れない・まるちゃん指示 2026-09-09）
  'function zLive(){var a=[],i;for(i=0;i<BORDER.length;i++)' +
  'if(String((MZH[i]||{}).text||"").replace(/^\\s+|\\s+$/g,""))a.push(i);return a;}' +
  'function drawMake(){var h,N=BORDER.length;' +
  'if(MIDX>=N)MIDX=N-1;if(MIDX<0)MIDX=0;' +
  'if(MSTEP===0){' +
  'var x=BORDER[MIDX],last=(MIDX===N-1);' +
  'var body=MBODYS[MIDX]||"",done=joinBody(body,timesOf(x[0],x[1]));' +
  'var over=done.length>MAXT;' +
  'h=\'<div class="bcstop"><span class="bcsttl">配信文を作成</span>\'+' +
  '\'<span class="bcsno">\'+(MIDX+1)+\' / \'+N+\'</span></div>\';' +
  // ★「【時間】」は区分の名前の右はし（まるちゃん指示 2026-09-09）。押すとそのまま写せる。
  'h+=\'<div class="bccard bcwide"><div class="bcouth"><b>\'+esc(ordLabel(MIDX,false))+\'</b>\'+' +
  '\'<button type="button" class="bcinstx" id="bcinscp">【時間】</button></div>\'+' +
  '\'<textarea id="bcmbody" class="bcmtx" placeholder="ここに、この対象へ送る日本語の文章を入れてください。&#10;&#10;\'+' +
  '\'「【時間】」と書いた所に予約可能時間が入ります。書かなければ文の最後に入ります。">\'+' +
  'esc(body)+\'</textarea>\';' +
  'h+=\'<div class="bcouttx" id="bcmprev" style="margin-top:13px">\'+' +
  'esc(body.replace(/^\\s+|\\s+$/g,"")?done:' +
  '("空欄のため、"+ordLabel(MIDX,false)+"には配信しません"))+\'</div>\'+' +
  '\'<div class="bcnum\'+(over?" over":"")+\'" id="bcmnum">\'+(body?(done.length+"文字"):"")+\'\'+' +
  '(over?("　※"+MAXT+"文字を超えています。短くしてください"):"")+\'</div>\';' +
  'h+=\'</div>\';' +
  // ★最後の区分では、中国語版の作り方を3つから選ぶ（まるちゃん指示 2026-09-09）
  'if(!MBUSY){h+=over?(\'<div class="bcstatus ng">長すぎます。短くしてください。</div>\')' +
  // ★自動で訳す1つ目だけ紫（まるちゃん指示 2026-09-09）
  ':(last?(\'<button type="button" class="bctxt" id="bcmok">\'+' +
  '\'以上の内容を翻訳し自動で中国語版を作成する</button>\'+' +
  '\'<button type="button" class="bcgo" id="bcmman">\'+' +
  '\'翻訳せずに手動で中国語版を作成する</button>\'+' +
  '\'<button type="button" class="bcgo" id="bcmnozh">\'+' +
  '\'中国語版は配信しない</button>\')' +
  ':\'<button type="button" class="bcgo" id="bcmok">この内容でOK</button>\');' +
  '\'\';}}' +
  // ★自分で中国語を入れる画面（まるちゃん指示 2026-09-09）。日本語の画面と同じ作り。
  'else if(MSTEP===1){' +
  'var zx=BORDER[MIDX],zlast=(MIDX===N-1);' +
  'var zb=MZBODYS[MIDX]||"",zdone=joinBody(zb,zhOf(timesOf(zx[0],zx[1])));' +
  'var zov=zdone.length>MAXT;' +
  'h=\'<div class="bcstop"><span class="bcsttl">中国語版を作成</span>\'+' +
  '\'<span class="bcsno">\'+(MIDX+1)+\' / \'+N+\'</span></div>\';' +
  'h+=\'<div class="bccard bcwide"><div class="bcouth"><b>\'+esc(ordLabel(MIDX,true))+\'</b>\'+' +
  '\'<button type="button" class="bcinstx" id="bcinscp">【時間】</button></div>\'+' +
  '\'<textarea id="bcmzbody" class="bcmtx" placeholder="ここに、この対象へ送る中国語の文章を入れてください。&#10;&#10;\'+' +
  '\'「【時間】」と書いた所に予約可能時間が入ります。書かなければ文の最後に入ります。">\'+' +
  'esc(zb)+\'</textarea>\';' +
  'h+=\'<div class="bcouttx" id="bcmzprev" style="margin-top:13px">\'+' +
  'esc(zb.replace(/^\\s+|\\s+$/g,"")?zdone:' +
  '("空欄のため、"+ordLabel(MIDX,true)+"には配信しません"))+\'</div>\'+' +
  '\'<div class="bcnum\'+(zov?" over":"")+\'" id="bcmznum">\'+(zb?(zdone.length+"文字"):"")+\'\'+' +
  '(zov?("　※"+MAXT+"文字を超えています。短くしてください"):"")+\'</div>\';' +
  'h+=\'</div>\';' +
  'if(!MBUSY){h+=zov?(\'<div class="bcstatus ng">長すぎます。短くしてください。</div>\')' +
  ':(zlast?makeBtn("bcmzok3")' +
  ':\'<button type="button" class="bcgo" id="bcmzok">この内容でOK</button>\');' +
  '\'\';}}' +
  'else if(MSTEP===2){' +
  // ★中身のある区分だけを順に見せる。数え方もその数だけ（まるちゃん指示 2026-09-09）
  'var lv=zLive(),pos=lv.indexOf(MIDX);' +
  'if(pos<0&&lv.length){MIDX=lv[0];pos=0;}' +
  'var z=MZH[MIDX]||{text:""},lastz=(pos<0||pos===lv.length-1),ov2=(z.text||"").length>MAXT;' +
  'h=\'<div class="bcstop"><span class="bcsttl">中国語版の配信分の確認</span>\'+' +
  '\'<span class="bcsno">\'+(lv.length?((pos+1)+\' / \'+lv.length):\'0 / 0\')+\'</span></div>\';' +
  'h+=\'<div class="bccard bcwide"><div class="bcouth"><b>\'+esc(ordLabel(MIDX,true))+\'</b></div>\'+' +
  // ★配信する文は白い欄に入れて、ここで直せるようにする（まるちゃん指示 2026-09-09）
  '\'<textarea id="bcmzedit" class="bcmtx" placeholder="\'+' +
  'esc("空欄のため、"+ordLabel(MIDX,true)+"には配信しません")+\'">\'+' +
  'esc(z.text||"")+\'</textarea>\'+' +
  '\'<div class="bcnum\'+(ov2?" over":"")+\'" id="bcmznum2">\'+(z.text||"").length+\'文字\'+' +
  '(ov2?("　※"+MAXT+"文字を超えています"):"")+\'</div></div>\';' +
  'if(!MBUSY){h+=ov2?(\'<div class="bcstatus ng">長すぎます。日本語の文を短くしてください。</div>\')' +
  ':(lastz?makeBtn("bcmok3")' +
  ':\'<button type="button" class="bcgo" id="bcmoknext">つぎへ</button>\');' +
  '\'\';}}' +
  'else{h=\'<div class="bccard"><div class="bcname">配信文を作成</div><div class="bchr"></div>\'+' +
  '\'<div class="bcouttx">\'+esc(MMSG)+\'</div></div>\';' +
  'if(!MBUSY)h+=\'<button type="button" class="bcgo" id="bcmdone">対象の設定を見る</button>\';}' +
  'if(MMSG&&MSTEP<3)h+=\'<div class="bcstatus on">\'+esc(MMSG)+\'</div>\';' +
  'box.innerHTML=freshBar()+h;bindMake();bindFresh();}' +
  'function bindMake(){' +
  'var ta=document.getElementById("bcmbody");' +
  // ★打っている間は画面を描き直さない（描き直すとボタンが作り直されて押せなくなる）
  'if(ta)ta.oninput=function(){MBODYS[MIDX]=ta.value;MBODY=ta.value;' +
  'var x=BORDER[MIDX],done=joinBody(ta.value,timesOf(x[0],x[1]));' +
  'var pv=document.getElementById("bcmprev");' +
  'if(pv)pv.textContent=ta.value.replace(/^\\s+|\\s+$/g,"")?done:' +
  '("空欄のため、"+ordLabel(MIDX,false)+"には配信しません");' +
  'var nm=document.getElementById("bcmnum");' +
  'if(nm){var ov=done.length>MAXT;nm.textContent=ta.value?(done.length+"文字"+' +
  '(ov?("　※"+MAXT+"文字を超えています。短くしてください"):"")):"";' +
  'nm.className="bcnum"+(ov?" over":"");}' +
  'saveNow();};' +
  'var e=document.getElementById("bcmedit");' +
  'if(e)e.onclick=function(){MSTEP=0;MIDX=0;MMSG="";status("");draw();};' +
  'e=document.getElementById("bcmprev2");' +
  'if(e)e.onclick=function(){MIDX--;status("");draw();};' +
  // ★中国語版の確認の画面で直した中身を、その場で覚える
  'var zed=document.getElementById("bcmzedit");' +
  'if(zed)zed.oninput=function(){' +
  'if(!MZH[MIDX])MZH[MIDX]={label:ordLabel(MIDX,true),' +
  'atama:BORDER[MIDX][0],sei:BORDER[MIDX][1],text:""};' +
  'MZH[MIDX].text=zed.value;' +
  'var zn=document.getElementById("bcmznum2");' +
  'if(zn){var zo=zed.value.length>MAXT;' +
  'zn.textContent=zed.value.length+"文字"+(zo?("　※"+MAXT+"文字を超えています"):"");' +
  'zn.className="bcnum"+(zo?" over":"");}' +
  'saveNow();};' +
  'e=document.getElementById("bcmoknext");' +
  'if(e)e.onclick=function(){var lv=zLive(),q=lv.indexOf(MIDX);' +
  'MIDX=(q>=0&&q+1<lv.length)?lv[q+1]:MIDX;status("");draw();};' +
  'e=document.getElementById("bcmdone");' +
  'if(e)e.onclick=function(){page="t";step=0;MMSG="";status("");draw();};' +
  // ★専用の入れ物にする（e は下で別の部品に入れ替わるため）
  'var ins=document.getElementById("bcinscp");' +
  'if(ins)ins.onclick=function(){bcCopy("【時間】",ins);};' +
  // 日本語の4つを、時間を入れた文にまとめる
  'function bldJa(){MJA=BORDER.map(function(x,k){' +
  'return {label:ordLabel(k,false),atama:x[0],sei:x[1],' +
  'text:joinBody(MBODYS[k]||"",timesOf(x[0],x[1]))};});}' +
  'var ok1=document.getElementById("bcmok");' +
  'if(ok1)ok1.onclick=function(){if(ta)MBODYS[MIDX]=ta.value;' +
  'if(MIDX<BORDER.length-1){MIDX++;status("");draw();return;}' +
  'bldJa();makeZh();};' +
  // ②自分で中国語を入れる
  'var ok2=document.getElementById("bcmman");' +
  'if(ok2)ok2.onclick=function(){if(ta)MBODYS[MIDX]=ta.value;' +
  'bldJa();MSTEP=1;MIDX=0;MMSG="";status("");draw();};' +
  // ③中国語版は配信しない＝中国語の4区分は空っぽにする
  'var ok3=document.getElementById("bcmnozh");' +
  'if(ok3)ok3.onclick=function(){if(ta)MBODYS[MIDX]=ta.value;' +
  'bldJa();MZH=BORDER.map(function(x,k){' +
  'return {label:ordLabel(k,true),atama:x[0],sei:x[1],text:""};});' +
  // ★勝手に絵づくりを始めない（まるちゃん指示 2026-09-09）。中身の確認へ進む。
  'MBACK=0;applyAll(false);};' +
  // 自分で入れる中国語の欄
  'var zta=document.getElementById("bcmzbody");' +
  'if(zta)zta.oninput=function(){MZBODYS[MIDX]=zta.value;' +
  'var zx=BORDER[MIDX],zdone=joinBody(zta.value,zhOf(timesOf(zx[0],zx[1])));' +
  'var zpv=document.getElementById("bcmzprev");' +
  'if(zpv)zpv.textContent=zta.value.replace(/^\\s+|\\s+$/g,"")?zdone:' +
  '("空欄のため、"+ordLabel(MIDX,true)+"には配信しません");' +
  'var znm=document.getElementById("bcmznum");' +
  'if(znm){var zov=zdone.length>MAXT;znm.textContent=zta.value?(zdone.length+"文字"+' +
  '(zov?("　※"+MAXT+"文字を超えています。短くしてください"):"")):"";' +
  'znm.className="bcnum"+(zov?" over":"");}' +
  'saveNow();};' +
  'var zok=document.getElementById("bcmzok");' +
  'if(zok)zok.onclick=function(){if(zta)MZBODYS[MIDX]=zta.value;' +
  'MIDX++;status("");draw();};' +
  'function bldZhMan(){MZH=BORDER.map(function(x,k){' +
  'return {label:ordLabel(k,true),atama:x[0],sei:x[1],' +
  'text:joinBody(MZBODYS[k]||"",zhOf(timesOf(x[0],x[1])))};});}' +
  'var zok3=document.getElementById("bcmzok3");' +
  'if(zok3)zok3.onclick=function(){if(zta)MZBODYS[MIDX]=zta.value;' +
  'MBACK=1;bldZhMan();applyAll(true);};' +
  'var zok3n=document.getElementById("bcmzok3n");' +
  'if(zok3n)zok3n.onclick=function(){if(zta)MZBODYS[MIDX]=zta.value;' +
  'MBACK=1;bldZhMan();applyAll(false);};' +
  'var ok4=document.getElementById("bcmok3");' +
  'if(ok4)ok4.onclick=function(){MBACK=2;applyAll(true);};' +
  'var ok4n=document.getElementById("bcmok3n");' +
  'if(ok4n)ok4n.onclick=function(){MBACK=2;applyAll(false);};}' +
  // ★台湾版＝区分ごとに本文を訳し、時間の表は訳さず曜日を入れ替えて差し込む
  // ★男女を渡す＝男性向けは VIO脱毛 が VBO になる（メニューの表に男性だけの言い方がある）
  'function transOne(s,g,cb,onErr){if(!String(s||"").trim()){cb("");return;}' +
  'ask("translate",{fields:JSON.stringify({text:s,gender:(g||"共通"),quality:"1"})},' +
  'function(r){var v=(r&&typeof r==="object")?((r.note!==undefined)?r.note:(r.result||"")):r;' +
  'cb(String(v==null?"":v));},onErr);}' +
  // ★訳す側に「【時間】」を見せない（見せると「これは空欄です」と独り言を書くことがある＝実測）。
  //   前半と後半のあいだに飾りの線を入れて1回で訳し、その線の所へ時間の表を差し込む。
  'var ZSEP="＝＝＝＝＝＝＝＝";' +
  'function zsplit(s){var m=String(s||"").split(/[＝=]{5,}/);' +
  'return (m.length>=2)?[m[0],m.slice(1).join("")]:null;}' +
  // ★訳すのは中身のある区分だけ。数え方もその数（まるちゃん指示 2026-09-09）
  'function makeZh(){var N=BORDER.length,zs=[],i=0,lost=0;' +
  'var need=[],w;for(w=0;w<N;w++)' +
  'if(String(MBODYS[w]||"").replace(/^\\s+|\\s+$/g,""))need.push(w);' +
  'var nn=need.length,dn=0;' +
  'MBUSY=true;MMSG="台湾のお客様向けに訳しています…（1つ1分ほど）";draw();' +
  'function ng(m){MBUSY=false;MMSG="";status("訳せませんでした："+m,true);draw();}' +
  '(function next(){' +
  'if(i>=N){' +
  'MZH=BORDER.map(function(x,k){var tt=zhOf(timesOf(x[0],x[1])),g=zs[k]||{z:"",had:false};' +
  'var z=String(g.z||"").replace(/^\\s+|\\s+$/g,""),s;' +
  'var pair=g.had?zsplit(z):null;' +
  'if(pair){var a=pair[0].replace(/^\\s+|\\s+$/g,""),b=pair[1].replace(/^\\s+|\\s+$/g,"");' +
  's=(a?(a+"\\n\\n"):"")+tt+(b?("\\n\\n"+b):"");}' +
  'else{z=z.replace(/[＝=]{5,}/g,"").replace(/^\\s+|\\s+$/g,"");' +
  's=z?(z+"\\n\\n"+tt):"";}' +
  'return {label:ordLabel(k,true),atama:x[0],sei:x[1],text:s};});' +
  'MBUSY=false;MSTEP=2;MIDX=(zLive()[0]===undefined)?0:zLive()[0];status("");' +
  'MMSG=lost?("※"+lost+"つで、時間を入れる場所の目印が訳の中に残らなかったので、"+' +
  '"時間は文の最後に入れました。"):"";' +
  'draw();return;}' +
  'var b0=String(MBODYS[i]||"").replace(/^\\s+|\\s+$/g,"");' +
  'if(!b0){zs[i]={z:"",had:false};i++;next();return;}' +
  'dn++;MMSG=dn+" / "+nn+"　「"+ordLabel(i,false)+"」を訳しています…";draw();' +
  'var k0=b0.indexOf("【時間】"),had=(k0>=0);' +
  'var send=had?(b0.slice(0,k0).replace(/\\s+$/,"")+"\\n\\n"+ZSEP+"\\n\\n"+' +
  'b0.slice(k0+4).replace(/^\\s+/,"")):b0;' +
  'var sei=(BORDER[i][1]==="男性")?"男":"女";' +
  'var same=-1,q;for(q=0;q<i;q++)' +
  'if(String(MBODYS[q]||"").replace(/^\\s+|\\s+$/g,"")===b0&&BORDER[q][1]===BORDER[i][1])same=q;' +
  'if(same>=0){zs[i]=zs[same];i++;next();return;}' +
  'transOne(send,sei,function(z){var zz=String(z||"").replace(/^\\s+|\\s+$/g,"");' +
  'if(had&&!zsplit(zz))lost++;' +
  'zs[i]={z:zz,had:had};i++;next();},ng);' +
  '})();}' +
  // ★mkimg＝絵も作るか（まるちゃん指示 2026-09-09。作らない道を足した）
  'function applyAll(mkimg){MBUSY=true;MMSG="対象に文を入れています…";draw();' +
  'SENDN=[];' +
  'MJA.concat(MZH).forEach(function(x){' +
  'if(!String(x.text||"").replace(/^\\s+|\\s+$/g,""))return;' +
  'var lg=(MJA.indexOf(x)>=0)?"ja":"zh";' +
  'tgtNames(x.atama,x.sei,lg).forEach(function(nm){' +
  'if(SENDN.indexOf(nm)<0)SENDN.push(nm);});});' +
  'MJA.forEach(function(x){putTextInto(tgtNames(x.atama,x.sei,"ja"),x.text);});' +
  'MZH.forEach(function(x){putTextInto(tgtNames(x.atama,x.sei,"zh"),x.text);});' +
  'TPL.forEach(function(tp,i){if(SENDN.indexOf(tp.name)>=0)return;' +
  'var ps=DATA[i].parts;' +
  'for(var k=ps.length-1;k>=0;k--)' +
  'if(ps[k].kind==="image"&&(ps[k].src||"").indexOf("made:")===0)ps.splice(k,1);});' +
  'if(!mkimg){MBUSY=false;MMSG="";page="t";step=0;mode="";' +
  'status("");draw();return;}' +
  'var src=((SRES&&SRES.groups)||[]).map(function(g){return g.label+"\\n"+g.text;}).join("\\n\\n");' +
  'WDONE=[];' +
  'runMake(src,function(i,tot,label){' +
  'MMSG="画像を生成しています… "+(i+1)+"枚目 / "+tot+"枚　"+label;draw();},' +
  'function(done,err){MBUSY=false;MSTEP=3;' +
  'MMSG=err?("文は入れました。画像で止まりました："+err)' +
  ':("できました。文を入れ、画像を"+done+"枚それぞれの対象の1つ目に入れました。");' +
  'draw();});}' +
  // ── 対象1つぶんの設定 ────────────────────────────────
  'function drawOne(){' +
  'var t=TPL[step],d=DATA[step],n=d.parts.length,left=MAXP-n;' +
  // ★上の行を消したので、何番目かはここに出す（まるちゃん指示 2026-09-09）
  // ★「対象」の字は出さない（まるちゃん指示 2026-09-09）。番号だけ残す。
  //   数えるのは「送る対象」だけ（本文を作らなかった対象は出さない）。
  'var lv=tLive(),pos=lv.indexOf(step);' +
  'var h=\'<div class="bcstop"><span class="bcsttl"></span>\'+' +
  '\'<span class="bcsno">\'+(pos+1)+\' / \'+lv.length+\'</span></div>\'+' +
  // ★送り先を選び直せる（まるちゃん指示 2026-09-09）。選んでいなければ元の決まりのまま。
  '\'<div class="bccard"><div class="bcnamerow"><div class="bcname">\'+esc(t.name)+\'</div>\'+' +
  '\'<button type="button" class="bcmv" id="bctag">タグを変更</button></div>\'+' +
  '\'<div class="bcwho">\'+esc((TAGS[step]&&TAGS[step].length)?' +
  '("送り先："+TAGS[step].join("＋")):t.who)+\'</div><div class="bchr"></div>\';' +
  // ★並べ替えと、文の直し（まるちゃん指示 2026-09-09）
  'if(n){h+=d.parts.map(function(p,i){var th=partThumb(p);' +
  'return \'<div class="bcpart"><span class="bcpno">\'+(i+1)+\'つ目</span>\'+' +
  '(th?(\'<img src="\'+th+\'" data-big="\'+i+\'" style="cursor:zoom-in">\'):"")+' +
  '\'<span class="bcptx">\'+esc(partLabel(p))+\'</span>\'+' +
  '(i>0?(\'<button type="button" class="bcmv" data-up="\'+i+\'">▲</button>\'):"")+' +
  '((i<n-1)?(\'<button type="button" class="bcmv" data-dn="\'+i+\'">▼</button>\'):"")+' +
  '((p.kind==="text")?(\'<button type="button" class="bcmv" data-edit="\'+i+\'">直す</button>\'):"")+' +
  '\'<button type="button" class="bcdel" data-del="\'+i+\'">消す</button></div>\';}).join("");}' +
  // ★「まだ何も入っていません…」は出さない（まるちゃん指示 2026-09-08）
  'else{h+="";}' +
  'if(mode==="img"){' +
  'h+=\'<div class="bchr"></div><div class="bcleft">画像を選ぶ</div><div class="bcgrid">\'+' +
  'picks().map(function(p){return \'<div class="bcpick\'+(p.made?" new":"")+\'">\'+' +
  '\'<button type="button" class="sel" data-pre="\'+esc(p.key)+\'">\'+' +
  '\'<img src="\'+p.thumb+\'"><span>\'+esc(p.label)+\'</span></button>\'+' +
  '\'<button type="button" class="bczoom" data-zoom="\'+esc(p.key)+\'">🔍 大きく見る</button></div>\';' +
  '}).join("")+\'</div>\'+' +
  '\'<div class="bcleft" style="margin-top:14px">別の画像を選ぶ</div><input type="file" accept="image/*" id="bcfile">\'+' +
  '\'</div><button type="button" class="bcghost" id="bccancel">やめる</button>\';}' +
  'else if(mode==="tag"){' +
  'var cur=TAGS[step]||[];' +
  'h+=\'<div class="bchr"></div><div class="bcleft">送り先をえらぶ（いくつでも）</div>\';' +
  'if(TAGBUSY){h+=\'<div class="bcouttx">送り先の一覧を読んでいます…</div>\';}' +
  'else if(!TAGLIST.length){h+=\'<div class="bcouttx">送り先の一覧を読めませんでした。</div>\';}' +
  'else{h+=\'<div class="bctaglist">\'+TAGLIST.map(function(x){' +
  'return \'<button type="button" data-tag="\'+esc(x)+\'" class="\'+' +
  '((cur.indexOf(x)>=0)?"on":"")+\'">\'+esc(x)+\'</button>\';}).join("")+\'</div>\';}' +
  'h+=\'</div>\';' +
  'h+=\'<button type="button" class="bcgo" id="bctagok">この送り先にする</button>\'+' +
  '\'<button type="button" class="bcmini" id="bctagdef">もとの決まりにもどす</button>\'+' +
  '\'<button type="button" class="bcghost" id="bccancel">やめる</button>\';}' +
  'else if(mode==="txt"){' +
  'var old=(EDI>=0&&d.parts[EDI])?(d.parts[EDI].text||""):"";' +
  'h+=\'<div class="bchr"></div><div class="bcleft">\'+((EDI>=0)?"文章を直す":"文章を入れる")+' +
  '\'（\'+MAXT+\'文字まで）</div>\'+' +
  '\'<textarea id="bctxt" placeholder="この対象へ送る文章">\'+esc(old)+\'</textarea>\'+' +
  '\'<div class="bccount" id="bccnt">\'+old.length+\' / \'+MAXT+\' 文字</div></div>\'+' +
  '\'<button type="button" class="bcgo" id="bcaddtxt">\'+' +
  '((EDI>=0)?"この文章に直す":"この文章を入れる")+\'</button>\'+' +
  '\'<button type="button" class="bcghost" id="bccancel">やめる</button>\';}' +
  'else{' +
  // ★「あと ◯ つ入れられます」も出さない（まるちゃん指示 2026-09-08）
  'h+=\'<div class="bchr"></div>\'+' +
  '\'<div class="bcadd"><button type="button" id="bcimg"\'+(left?"":" disabled")+\'>🖼 画像を入れる</button>\'+' +
  '\'<button type="button" id="bctx"\'+(left?"":" disabled")+\'>✍ 文章を入れる</button></div></div>\';' +
  'if(n)h+=\'<button type="button" class="bcgo" id="bcnext">この内容でOK</button>\';' +
  'h+=\'<button type="button" class="bcmini" id="bcskip">この対象は送らない（飛ばす）</button>\';' +
  '\'\';}' +
  'box.innerHTML=freshBar()+h;bindOne();bindFresh();}' +
  'function bindOne(){' +
  'var d=DATA[step];' +
  '[].slice.call(box.querySelectorAll("[data-del]")).forEach(function(b){b.onclick=function(){' +
  'd.parts.splice(+b.getAttribute("data-del"),1);draw();};});' +
  '[].slice.call(box.querySelectorAll("[data-up]")).forEach(function(b){b.onclick=function(){' +
  'var i=+b.getAttribute("data-up");if(i<1)return;' +
  'var v=d.parts[i];d.parts[i]=d.parts[i-1];d.parts[i-1]=v;saveNow();draw();};});' +
  '[].slice.call(box.querySelectorAll("[data-dn]")).forEach(function(b){b.onclick=function(){' +
  'var i=+b.getAttribute("data-dn");if(i>=d.parts.length-1)return;' +
  'var v=d.parts[i];d.parts[i]=d.parts[i+1];d.parts[i+1]=v;saveNow();draw();};});' +
  '[].slice.call(box.querySelectorAll("[data-edit]")).forEach(function(b){b.onclick=function(){' +
  'EDI=+b.getAttribute("data-edit");mode="txt";draw();};});' +
  '[].slice.call(box.querySelectorAll("[data-big]")).forEach(function(b){b.onclick=function(){' +
  'var p=d.parts[+b.getAttribute("data-big")];if(!p)return;' +
  'var nm=((p.src||"").indexOf("made:")===0)?p.src.slice(5):"";' +
  'bigView(partThumb(p),nm);};});' +
  'var e;' +
  'if(e=document.getElementById("bcimg"))e.onclick=function(){mode="img";draw();};' +
  'if(e=document.getElementById("bctx"))e.onclick=function(){EDI=-1;mode="txt";draw();};' +
  // ★送り先を選び直す（一覧は初めて開いた時に1回だけ事務所パソコンから取る）
  'if(e=document.getElementById("bctag"))e.onclick=function(){mode="tag";' +
  'if(!TAGLIST.length&&!TAGBUSY){TAGBUSY=true;draw();' +
  'ask("bc_tags",{},function(r){TAGBUSY=false;' +
  'TAGLIST=((r&&r.tags)||[]);if(!TAGLIST.length&&r&&r.note)status(r.note,true);draw();},' +
  'function(m){TAGBUSY=false;status(m,true);draw();});return;}' +
  'draw();};' +
  '[].slice.call(box.querySelectorAll("[data-tag]")).forEach(function(b){b.onclick=function(){' +
  'var x=b.getAttribute("data-tag"),a=(TAGS[step]||[]).slice(),k=a.indexOf(x);' +
  'if(k>=0)a.splice(k,1);else a.push(x);TAGS[step]=a;saveNow();draw();};});' +
  'if(e=document.getElementById("bctagok"))e.onclick=function(){mode="";saveNow();' +
  'status((TAGS[step]&&TAGS[step].length)?"送り先を変えました。":"");draw();};' +
  'if(e=document.getElementById("bctagdef"))e.onclick=function(){TAGS[step]=[];mode="";' +
  'saveNow();status("もとの決まりにもどしました。");draw();};' +
  'if(e=document.getElementById("bccancel"))e.onclick=function(){EDI=-1;mode="";draw();};' +
  'if(e=document.getElementById("bcnext"))e.onclick=function(){' +
  'step=nextLive(step);mode="";status("");draw();};' +
  'if(e=document.getElementById("bcskip"))e.onclick=function(){' +
  'var q=nextLive(step);d.parts=[];step=q;mode="";status("");saveNow();draw();};' +
  'if(e=document.getElementById("bcprev"))e.onclick=function(){step--;mode="";status("");draw();};' +
  '[].slice.call(box.querySelectorAll("[data-pre]")).forEach(function(b){b.onclick=function(){' +
  'var k=b.getAttribute("data-pre");var pr=preOf(k);' +
  'd.parts.push({kind:"image",src:(pr&&pr.made?"made:":"preset:")+k});mode="";draw();};});' +
  '[].slice.call(box.querySelectorAll("[data-zoom]")).forEach(function(b){b.onclick=function(ev){' +
  'ev.stopPropagation();var k=b.getAttribute("data-zoom");var pr=preOf(k);if(!pr)return;' +
  'bigView(pr.thumb, pr.made?k:"");};});' +
  'var fe=document.getElementById("bcfile");' +
  'if(fe)fe.onchange=function(){var f=fe.files&&fe.files[0];if(!f||!/^image\\//.test(f.type))return;' +
  'var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){' +
  'var mx=1280,w=im.width,h=im.height;if(w>mx||h>mx){if(w>=h){h=Math.round(h*mx/w);w=mx;}else{w=Math.round(w*mx/h);h=mx;}}' +
  'var cv=document.createElement("canvas");cv.width=w;cv.height=h;cv.getContext("2d").drawImage(im,0,0,w,h);' +
  'var durl=cv.toDataURL("image/jpeg",0.82);' +
  'd.parts.push({kind:"image",src:"",b64:durl.split(",")[1],thumb:durl});mode="";draw();};im.src=fr.result;};fr.readAsDataURL(f);};' +
  'var ta=document.getElementById("bctxt"),cnt=document.getElementById("bccnt"),ad=document.getElementById("bcaddtxt");' +
  'if(ta){ta.focus();ta.oninput=function(){var L=ta.value.length;cnt.textContent=L+" / "+MAXT+" 文字"+(L>MAXT?"（長すぎます）":"");' +
  'cnt.className="bccount"+(L>MAXT?" over":"");};' +
  'ad.onclick=function(){var v=(ta.value||"").trim();' +
  'if(!v){status("文章が空です。",true);return;}' +
  'if(v.length>MAXT){status("文章は"+MAXT+"文字までです（いまは"+v.length+"文字）。",true);return;}' +
  'if(EDI>=0&&d.parts[EDI]){d.parts[EDI].text=v;}else{d.parts.push({kind:"text",text:v});}' +
  'EDI=-1;mode="";status("");saveNow();draw();};}}' +
  // ── 最後（確認＋日時）────────────────────────────────
  // ★この画面には「まっさらに戻す」を出さない（送信の直前で押し間違えると全部消えるため・
  //   まるちゃん指示 2026-09-09）。ほかの画面では今までどおり出す。
  'function drawLast(){' +
  'function two(n){return ("0"+n).slice(-2);}' +
  'var t=new Date();t.setDate(t.getDate()+1);var m=0;' +
  'var h=\'<div class="bccard"><div class="bcname">最終確認</div><div class="bchr"></div>\';' +
  // ★送る対象だけを出す（まるちゃん指示 2026-09-09）
  'TPL.forEach(function(x,i){var n=filled(i);if(!n)return;m++;' +
  'h+=\'<div class="bcsum"><b>\'+esc(x.name)+\'</b><span class="on">\'+' +
  '(n+"つ入り")+\'</span></div>\';});' +
  'h+=\'</div>\';' +
  'if(!m)h+=\'<div class="bcstatus on">中身を入れた対象がありません。\'+' +
  '\'左上の「← 前に戻る」から入れてください。</div>\';' +
  'else if(LMODE!=="at"){' +
  // ★「今すぐ送信する」は下（上だとすぐ押してしまって危ない・まるちゃん指示 2026-09-09）
  'h+=\'<button type="button" class="bcgo" id="bcplan">送信の予約を設定する</button>\'+' +
  '\'<button type="button" class="bctxt" id="bcnow">今すぐ送信する</button>\';}' +
  'else{' +
  'h+=\'<div class="bccard"><div class="bcleft">送る日時\'+' +
  '((m>1)?"（1本目。2本目からは少しずつ後ろへずらします）":"")+\'</div>\'+' +
  '\'<div class="bcdt"><div><input type="date" id="bcdate" value="\'+t.getFullYear()+"-"+' +
  'two(t.getMonth()+1)+"-"+two(t.getDate())+\'"></div>\'+' +
  '\'<div><input type="time" id="bctime" value="11:00"></div></div></div>\'+' +
  '\'<button type="button" class="bcgo" id="bcplace">この内容で \'+m+\'通り 予約する</button>\'+' +
  '\'\';}' +
  // ★予約した配信の一覧も「まっさらに戻す」も、この画面には出さない（まるちゃん指示 2026-09-09）
  'box.innerHTML=h;' +
  'var e=document.getElementById("bcplan");' +
  'if(e)e.onclick=function(){LMODE="at";status("");draw();};' +
  'e=document.getElementById("bcnoat");' +
  'if(e)e.onclick=function(){LMODE="";status("");draw();};' +
  'e=document.getElementById("bcnow");if(e)e.onclick=function(){doPlace(true);};' +
  'e=document.getElementById("bcplace");if(e)e.onclick=function(){doPlace(false);};}' +
  // ── 予約する ────────────────────────────────────────
  'function doPlace(now){' +
  'var dateEl=document.getElementById("bcdate"),timeEl=document.getElementById("bctime");' +
  'var d0=now?"":(dateEl?dateEl.value:""),t0=now?"":(timeEl?timeEl.value:"");' +
  'var items=[],n=0;' +
  'TPL.forEach(function(t,i){var ps=DATA[i].parts;if(!ps.length)return;n++;' +
  'items.push({name:t.name,tags:(TAGS[i]||[]),' +
  'parts:ps.map(function(p){return p.kind==="text"?{kind:"text",text:p.text}:{kind:"image",src:p.src,b64:p.b64};})});});' +
  'if(!n){status("文章か画像を入れた対象が1つもありません。",true);return;}' +
  'szPopup_(now?("いますぐ "+n+"通りの配信を送ります。よろしいですか？")' +
  ':(d0+" "+t0+" から、"+n+"通りの配信を予約します。よろしいですか？"),{cancel:true,onYes:function(){try{' +
  // ★押したボタンを見る（今すぐ=bcnow／予約=bcplace）。前は予約用だけを探して、
  //   今すぐを押した時に見つからず止まっていた（2026-09-08 実機で発生）。
  'var go=document.getElementById(now?"bcnow":"bcplace");if(go)go.disabled=true;' +
  'szOvShow_(szBusyHtml_(now?"配信を送っています":"配信を予約しています"),"#2C7A99");' +
  'var jobs=[];items.forEach(function(it){it.parts.forEach(function(p){' +
  'if(p.kind==="image"&&p.b64){var nm=rnd();p.src="upload:"+nm;jobs.push(pushImage(nm,{b64:p.b64,mime:"image/jpeg"}));}' +
  'delete p.b64;});});' +
  // ★中身は住所に載せない＝長すぎて窓口まで届かない（実測19,573文字／上限は約8,000）。
  //   画像と同じく置き場へ本文として預け、頼む時は預けた名前だけを渡す。
  'var itemsName="bc_items_"+((idn.device||"x").replace(/[^a-z0-9_]/g,"").slice(0,20)||"d")+".json";' +
  'jobs.push(pushImage(itemsName,{items:items}));' +
  'Promise.all(jobs).catch(function(){}).then(function(){setTimeout(function(){' +
  'ask("line_broadcast",{fields:JSON.stringify({category:CAT,date:d0,' +
  'time:t0,now:(now?1:0),items_from:itemsName,who:idn.who})},' +
  'function(d){if(go)go.disabled=false;szOvHide_();' +
  'status(d.note||(now?"送りました。":"予約しました。"),!d.ok);' +
  // ★送り終わったら**全部**まっさらにする。前は対象の中身だけ消していたので、
  //   本文と予約可能時間文が残り、次に開いた時「復元しますか？」が出ていた（実機で発生）。
  'if(d.ok){DATA=TPL.map(function(){return {parts:[]};});' +
  'MJA=[];MZH=[];MSTEP=0;MIDX=0;MMSG="";MBODY="";MBODYS=["","","",""];' +
  'MZBODYS=["","","",""];TAGS=[];' +
  'WTEXT="";SRES=null;SPER="";SIDX=0;FRESH=false;LMODE="";' +
  // ★送ったあとは空っぽの最終確認に戻さず、予約の一覧を見せる（まるちゃん指示 2026-09-09）
  'wipClear();step=0;page="l";mode="";draw();}},' +
  'function(m2){if(go)go.disabled=false;szOvHide_();status(m2,true);});},1200);});' +
  '}catch(err){var g2=document.getElementById(now?"bcnow":"bcplace");' +
  'if(g2)g2.disabled=false;try{szOvHide_();}catch(e2){}' +
  'status((now?"送れませんでした：":"予約できませんでした：")+' +
  '(err&&err.message?err.message:err),true);}}});}' +
  // ── 予約した配信の一覧（中身があるときだけ出す）──────────────
  'function loadList(){var el=document.getElementById("bclist");if(!el)return;' +
  'ask("bc_list",{},function(d){LPOSTS=d.posts||[];' +
  'LBATCH=((d.batch&&d.batch.n)||0);drawList(LPOSTS);},' +
  'function(m){el.innerHTML=\'<div class="bcouttx">読めませんでした。</div>\';status(m,true);});}' +
  // ★昨日までかどうか（配信済みは昨日までの分だけ出す・まるちゃん指示 2026-09-09）
  'function isYest(at){var s=String(at||"").slice(0,10);if(!s)return false;' +
  'var d=new Date();var y=d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+' +
  '("0"+d.getDate()).slice(-2);return s<y;}' +
  'function drawList(posts){var el=document.getElementById("bclist");if(!el)return;' +
  'LPOSTS=posts||LPOSTS;' +
  // ★タブで仕分ける。配信待ち＝まだ送っていない分。配信済み＝昨日までの送った分。
  'var wait=(posts||[]).filter(function(r){' +
  'return r.state==="placed"||r.state==="draft";});' +
  'var done=(posts||[]).filter(function(r){' +
  'return r.state==="sent"&&isYest(r.at);});' +
  'var use=(LTAB==="done")?done:wait;' +
  'var top="";' +
  'if(LTAB==="wait"){' +
  'if(wait.length)top+=\'<button type="button" class="bctxt" id="bcallcx">\'+' +
  '\'全部配信をキャンセルする（\'+wait.length+\'本）</button>\';' +
  'if(LBATCH)top+=\'<button type="button" class="bcgo" id="bcundo">\'+' +
  '\'予約キャンセルした配信を戻す（\'+LBATCH+\'本）</button>\';}' +
  'if(!use.length){el.innerHTML=top+\'<div class="bcouttx">\'+' +
  '((LTAB==="done")?"昨日までに送った配信はありません。":"配信待ちはありません。")+' +
  '\'</div>\';bindList();return;}' +
  'el.innerHTML=top+use.map(function(r){' +
  'return \'<div class="bcitem"><div class="bcit1">\'+esc(r.st)+"　"+esc(r.at)+"　"+esc(r.template_name)+\'</div>\'+' +
  '\'<div class="bcit2">画像\'+r.imgs+\'枚　「\'+esc(r.head)+\'」\'+(r.note?("　"+esc(r.note)):"")+\'</div>\'+' +
  '(r.cancelable?(\'<button type="button" class="bccx" data-cx="\'+r.broadcast_id+\'">取り消し</button>\'):"")+' +
  '\'</div>\';}).join("");' +
  '[].slice.call(el.querySelectorAll("[data-cx]")).forEach(function(b){b.onclick=function(){' +
  'szPopup_("この配信を取り消しますか？",{cancel:true,onYes:function(){status("取り消しています…");' +
  'ask("bc_cancel",{fields:JSON.stringify({bid:b.getAttribute("data-cx")})},function(d){' +
  'status(d.note||"取り消しました。",!d.ok);LBATCH=((d.batch&&d.batch.n)||LBATCH);' +
  'drawList(d.posts);},function(m3){status(m3,true);});}});};});' +
  'bindList();}' +
  // ★全部取り消す／戻す（まるちゃん指示 2026-09-09）
  'function bindList(){' +
  'var a=document.getElementById("bcallcx");' +
  'if(a)a.onclick=function(){szPopup_("配信待ちを全部取り消しますか？\\n"+' +
  '"（中身は控えに残るので、あとで戻せます）",{cancel:true,onYes:function(){' +
  'a.disabled=true;status("取り消しています…");' +
  'ask("bc_cancel_all",{},function(d){status(d.note||"取り消しました。",!d.ok);' +
  'LBATCH=((d.batch&&d.batch.n)||0);drawList(d.posts);},' +
  'function(m){a.disabled=false;status(m,true);});}});};' +
  'var u=document.getElementById("bcundo");' +
  'if(u)u.onclick=function(){szPopup_("取り消した配信を元に戻しますか？",{cancel:true,' +
  'onYes:function(){u.disabled=true;status("戻しています…");' +
  'ask("bc_restore",{},function(d){status(d.note||"戻しました。",!d.ok);' +
  'LBATCH=((d.batch&&d.batch.n)||0);drawList(d.posts);},' +
  'function(m){u.disabled=false;status(m,true);});}});};}' +
  // ── 立ち上がり ────────────────────────────────────────

  // ★窓の幅を変えたら字の大きさを測り直す（パソコンの窓は大きさを変えられるため）
  'var rsT=null;window.addEventListener("resize",function(){' +
  'if(rsT)clearTimeout(rsT);rsT=setTimeout(function(){rsT=null;' +
  'fitTx(box.querySelector(".bcotx"));},200);});' +

  // ★「← 前に戻る」だけで、どの画面からも1つ前に戻る（まるちゃん指示 2026-09-09）。
  //   画面の中に「◀ ○○にもどる」を置かない。入口にいる時だけホームへ（パソコンは窓が閉じる）。
  // ★対象・最終確認から、来た画面（日本語の入力／自分で中国語／中国語版の確認）へ戻す
  'function goBackFromT(){page="m";mode="";MSTEP=MBACK;' +
  'if(MBACK===2){var zl=zLive();MIDX=zl.length?zl[zl.length-1]:0;}' +
  'else{MIDX=BORDER.length-1;}}' +
  'function backOne(){' +
  'if(page==="k")return false;' +
  'if(page==="l"){page="k";return true;}' +
  'if(page==="w"){page="s";return true;}' +
  'if(page==="s"){var gs=(SRES&&SRES.groups)||[];' +
  'if(!gs.length){page="k";return true;}' +
  'if(SIDX>0){SIDX--;return true;}' +
  'SRES=null;SPER="";SIDX=0;return true;}' +
  // ★配信文づくりの中＝1つずつ前へ。一番前まで来たら予約可能時間の画面へ。
  'if(page==="m"){MMSG="";' +
  'if(MSTEP===3){goBackFromT();return true;}' +
  'if(MSTEP===1){if(MIDX>0){MIDX--;}else{MSTEP=0;MIDX=BORDER.length-1;}return true;}' +
  'if(MSTEP===2){var zl2=zLive(),zp=zl2.indexOf(MIDX);' +
  'if(zp>0){MIDX=zl2[zp-1];return true;}' +
  'MSTEP=0;MIDX=BORDER.length-1;return true;}' +
  'if(MIDX>0){MIDX--;return true;}' +
  'page="s";return true;}' +
  // ★最終確認＝送る対象があれば最後の対象へ。1つも無ければ配信文づくりへ戻す
  //   （前は同じ画面に戻っていて、押しても動かなかった＝まるちゃん指摘 2026-09-09）
  'if(step>=TPL.length){if(LMODE==="at"){LMODE="";return true;}' +
  'var lv0=tLive();' +
  'if(!lv0.length){goBackFromT();return true;}' +
  'step=lv0[lv0.length-1];mode="";return true;}' +
  'if(mode){mode="";return true;}' +
  'var pq=prevLive(step);if(pq>=0){step=pq;return true;}' +
  'goBackFromT();return true;}' +
  'var uh=document.querySelector(".uhome");' +
  'if(uh)uh.onclick=function(ev){if(!backOne())return true;' +
  'ev.preventDefault();status("");draw();return false;};' +
  // ★待たずに先に入口を出す（ボタン1つだけなので一瞬で出る）
  'draw();' +
  'ask("bc_templates",{},function(d){' +
  'if(!d||!d.templates){status("型を読み込めませんでした。",true);return;}' +
  'CAT=d.category||"";TPL=d.templates;PRE=d.presets||[];MAXP=d.max_parts||3;MAXT=d.max_text||500;' +
    'DATA=TPL.map(function(){return {parts:[]};});' +
  // ★開き直した時に「途中までの作業を復元しますか？」と聞く（前日お知らせと同じ）
  // ★開いたら必ず最初の画面から（まるちゃん指示 2026-09-09）。
  //   続きから始めたい時は「作業中のデータを復元する」を押してもらう。
  'WIPON=true;' +
  // ★最近作った絵は別便で取る（templates の答えに載せると大きすぎて窓口を通らない）
  'var rslot=(idn.device||"x").replace(/[^a-z0-9_]/g,"").slice(0,20)||"d";' +
  'ask("bc_wakuimg",{fields:JSON.stringify({mode:"recent",slot:rslot})},function(r){' +
  'if(!r||!r.ok)return;' +
  'jsonp({action:"data",name:"bc_recent_"+(r.slot||rslot)+".json"},function(d2){' +
  'MADE=((d2&&d2.recent)||[]).map(function(x){return {key:x.key,label:x.label,thumb:x.thumb,made:true};});' +
  'if(page!=="s"&&page!=="m")draw();});},function(){});' +
  'catEl.textContent=CAT;' +
  // ★本番モードの帯は出さない（まるちゃん指示 2026-09-08）。
  //   練習・テスト送信・止まっている時は必ず出す＝「届きません」は大事な知らせなので消さない。
  'if(d.banner&&d.banner.kind==="live"){banEl.style.display="none";}' +
  'else if(d.banner){banEl.style.display="";banEl.textContent=d.banner.text;' +
  // 帯の色＝止まっている(赤)／練習(黄)／テスト送信(橙)／本番(緑)
  'banEl.style.background=(d.banner.kind==="off")?"#f8d7da":' +
  '((d.banner.kind==="practice")?"#fff3cd":((d.banner.kind==="test")?"#ffe0b2":"#d1e7dd"));}' +
  'status("");draw();' +
  '},function(m4){status(m4,true);});' +
  '})();</script>';
  return '<style>' + HOMECSS_ + css + '</style>' +
    '<div class="home">' + backBar_(base, staff, dev) +
    '<h2 class="htitle" id="bctitle">LINE一斉配信設定</h2>' +
    '<div class="bc">' +
      '<div class="bcbanner" id="bcbanner"></div>' +
      '<div class="bctop" id="bctoprow" style="display:none">'+'<span class="lb">配信内容</span><b id="bccatname"></b>' +
        '<span class="no" id="bcno"></span></div>' +

      '<div id="bcbody"></div>' +
      '<div class="bcstatus" id="bcstatus"></div>' +
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
  // ★スタッフ・幹部は「新規の予約」だけ表示。既存の予約・既存の変更は開発者(?dev=1)だけに出す
  //   （2026-08-11 まるちゃん決定。2026-09-11 に予約入力そのものを全スタッフへ開放したが、中は新規だけのまま）。
  var ex = dev ?
      ('<a class="rolebtn kaihatsu" href="' + base + '?view=yoyaku_kizon' + sfx + '" target="_top">' +
        '<span class="ricon">📖</span><span class="rname">既存の予約</span></a>' +
      '<a class="rolebtn kanri" href="' + base + '?view=yoyaku_henkou' + sfx + '" target="_top">' +
        '<span class="ricon">✏️</span><span class="rname">既存の変更</span></a>') : '';
  // ★2026-09-11 まるちゃん指示：一番上に「施術後の予約」＝施術者がその場でそのお客様の次回を入れる入口。
  //   中身はこれから作る（今は準備中の画面）。新しいボタンなので既定は開発者(?dev=1)だけに出す。
  var sg = dev ?
      ('<a class="rolebtn sejutsugo" href="' + base + '?view=yoyaku_sejutsugo' + sfx + '" target="_top">' +
        '<span class="ricon">💆</span><span class="rname">施術後の予約</span></a>') : '';
  var menu =
    '<div class="rolemenu">' +
      sg +
      '<a class="rolebtn jitsumu" href="' + base + '?view=yoyaku_new' + sfx + '" target="_top">' +
        '<span class="ricon">📝</span><span class="rname">新規の予約</span></a>' +
      ex +
    '</div>';
  return '<style>' + HOMECSS_ + '</style>' +
    '<div class="home">' + backBar_(base, staff, dev) + head + menu + '</div>';
}

/** 「施術後の予約」＝施術者が施術のあと、その場でそのお客様の次回の予約を入れる入口。
 *  ★2026-09-11 まるちゃん指示。画面は**4枚**（同じ画面に混ぜない）。
 *    1枚目＝施術者をえらぶ。マーク＋呼び方／施術時間順／いまの施術がはじめから選ばれている／
 *           自分のスマホなら自分がいちばん上／いちばん下は「全施術者」／はじめの選び先の下は1個ぶん空ける。
 *    2枚目＝「お客様の選択」＝その施術者の今日の予約。いま施術中の方が一番上に来た形で開く。
 *    3枚目＝「次の予約希望の日時を選択」＝今月から3か月ぶんの月のボタン（縦）。
 *    4枚目＝その月のカレンダー（曜日つき）。日にちを押すとその日の空き状況へ。
 *    5枚目＝その日の空き状況（空き時間検索の「完全版」と同じ物）。空きの帯を押すと次へ。
 *    6枚目＝予約時間設定（開始・長さ・終了・施術室）。「この時間と部屋で決定」で次へ。
 *    7枚目＝予約メモの修正。今日の予約メモをそのまま出して直してもらい、
 *           「この予約メモの内容で確定」で次の予約日のタイムツリーに1件作る
 *           （作るのは事務所パソコンの受付係＝op=sejutsugo_reservation）。
 *  ★並び・はじめの選択・カウンセリングの出し分けは書き写さない＝共通の1本 `SG`（sg_rules.js）に聞く。 */
function renderAfterTreatmentPage_(base, staff, dev, who) {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  /* ★2026-09-11 まるちゃん「ここのたいわんとまとの文字いらない」＝見出しの下の店名は出さない。 */
  var head = '<div class="hhead"><span class="bmark">💆</span><span class="bname">施術後の予約</span></div>';
  var css =
    '.sg{max-width:560px;width:100%;min-width:0;margin:0 auto;padding:0 6px 60px;text-align:left;}' +
    '.sgstep{color:#eaf6fb;font-weight:800;letter-spacing:.06em;font-size:15px;margin:2px 4px 10px;}' +
    '.sgstaff{display:flex;flex-direction:column;gap:12px;margin:0 0 22px;}' +
    '.sgbtn{display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;text-align:left;' +
      'background:#fff;color:#0f172a;border:0;border-radius:18px;padding:18px 18px;cursor:pointer;' +
      'box-shadow:0 6px 18px rgba(0,0,0,.12);position:relative;overflow:hidden;}' +
    '.sgbtn::before{content:"";position:absolute;left:0;top:0;bottom:0;width:8px;background:#0ea5e9;}' +
    '.sgbtn.sel{outline:4px solid #fb8c44;outline-offset:-4px;}' +
    '.sgbtn.dflt{margin-bottom:88px;}' +
    '.sgbtn .sgmk{flex:none;width:52px;height:52px;border-radius:13px;font-size:30px;display:grid;' +
      'place-items:center;background:rgba(14,165,233,.16);}' +
    '.sgbtn .sgnm{flex:1;min-width:0;font-size:1.5rem;font-weight:900;}' +
    '.sgbtn .sgsub{flex:none;color:#475569;font-weight:800;font-size:.95rem;}' +
    '.sgbtn.all::before{background:#64748b;}' +
    '.sgbtn.all .sgmk{background:rgba(100,116,139,.16);}' +
    '.sgwho{color:#fff;font-weight:900;font-size:30px;line-height:1.25;margin:4px 4px 14px;}' +
    /* 長い見出し（次の予約希望の日時を選択）は1行に収まる大きさにする（横375pxで実測）。 */
    '.sgwho.long{font-size:25px;}' +
    '#sgbackbar{position:sticky;top:0;z-index:5;background:#2C7A99;padding:8px 0 10px;margin:0;}' +
    '.sglist{display:flex;flex-direction:column;gap:12px;margin:6px 0 8px;min-width:0;max-width:100%;}' +
    '.sgrow{display:block;width:100%;max-width:100%;min-width:0;box-sizing:border-box;text-align:left;' +
      'background:#fff;color:#0f172a;border:0;border-radius:16px;padding:16px 18px;cursor:pointer;' +
      'box-shadow:0 4px 12px rgba(0,0,0,.12);}' +
    '.sgl1{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}' +
    '.sgtm{font-weight:900;font-size:23px;}' +
    '.sgroom{display:inline-block;color:#fff;border-radius:10px;padding:2px 11px;font-weight:900;font-size:17px;}' +
    '.sgnow{display:inline-block;background:#16a34a;color:#fff;border-radius:10px;padding:2px 12px;' +
      'font-weight:900;font-size:17px;}' +
    '.sgl2{display:flex;align-items:baseline;gap:10px;margin-top:8px;min-width:0;max-width:100%;}' +
    '.sgmk2{flex:none;font-size:26px;}' +
    '.sgnm2{flex:1;min-width:0;font-weight:900;font-size:34px;line-height:1.25;' +
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.sgcd2{flex:none;color:#475569;font-weight:900;font-size:22px;}' +
    '.sgstatus{color:#fff;font-weight:800;font-size:18px;margin:10px 4px;min-height:24px;line-height:1.6;}' +
    /* ── 6枚目：予約時間設定（まるちゃん指示 2026-09-11） ── */
    '.sgtimebox{background:rgba(255,255,255,.14);border-radius:16px;padding:14px 16px;margin:0 2px 14px;}' +
    '.sgtlab{color:#eaf6fb;font-weight:800;font-size:15px;margin-bottom:6px;}' +
    /* ★左右に「1時間」「5分」を縦2つずつ（まるちゃん 2026-09-11）。
       1行に4つ並べると時刻の字が小さくなり、下に段を足すと画面が縦に伸びるので、この形にした。 */
    '.sgtrow{display:flex;align-items:stretch;gap:10px;}' +
    '.sgtcol{flex:none;width:78px;display:flex;flex-direction:column;gap:8px;}' +
    '.sgtval{flex:1;min-width:0;background:#fff;color:#0f172a;border-radius:14px;' +
      'display:flex;align-items:center;justify-content:center;' +
      'font-size:40px;font-weight:900;padding:10px 4px;letter-spacing:.04em;}' +
    '.sgtpm{flex:1;width:100%;min-height:46px;border:0;border-radius:14px;background:#fff;color:#0f172a;' +
      'font-size:16px;font-weight:900;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.15);}' +
    '.sgtpm:active{transform:translateY(2px);}' +
    '.sgdur{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0;}' +
    '.sgdurb{background:#fff;color:#0f172a;border:0;border-radius:14px;padding:18px 4px;' +
      'font-size:22px;font-weight:900;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.14);}' +
    '.sgdurb.sel{outline:4px solid #fb8c44;outline-offset:-4px;}' +
    /* ★上の1行（施術者と空きの時間）は1行に収まる最大の大きさにする（まるちゃん 2026-09-12）。
       大きさは画面の幅に合わせてその場で測って決める（fitLine）。 */
    '.sgtwho1{color:#fff;font-weight:900;font-size:22px;line-height:1.3;margin:0 4px 14px;' +
      'white-space:nowrap;overflow:hidden;}' +
    /* 施術室のボタン（空いている部屋だけ出す） */
    '.sgrooms{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0;}' +
    '.sgroomb{color:#fff;border:0;border-radius:14px;padding:16px 4px;font-size:17px;font-weight:900;' +
      'cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.16);text-shadow:0 1px 2px rgba(0,0,0,.35);}' +
    '.sgroomb.sel{outline:4px solid #fb8c44;outline-offset:-4px;}' +
    '.sgroomnone{background:#fee2e2;color:#991b1b;border-radius:14px;padding:12px 14px;margin:0;' +
      'font-weight:900;font-size:17px;line-height:1.6;}' +
    '.sgerr{background:#fee2e2;color:#991b1b;border-radius:14px;padding:12px 14px;margin:0 2px 14px;' +
      'font-weight:900;font-size:17px;line-height:1.6;display:none;}' +
    '.sggo{display:block;width:100%;margin:6px 2px 0;padding:20px;font-size:21px;font-weight:900;' +
      'border:0;border-radius:16px;background:#16a34a;color:#fff;cursor:pointer;' +
      'box-shadow:0 4px 10px rgba(0,0,0,.18);}' +
    '.sggo:disabled{opacity:.45;}' +
    /* ── 7枚目：予約メモの修正（まるちゃん指示 2026-09-12） ── */
    '.sgmnote{color:#eaf6fb;font-weight:700;font-size:15px;line-height:1.8;margin:-8px 4px 16px;}' +
    '.sgmin{display:block;width:100%;box-sizing:border-box;font:inherit;font-size:20px;font-weight:800;' +
      'color:#0f172a;background:#fff;border:0;border-radius:12px;padding:14px;}' +
    /* ★予約メモは全部見えるように、中身の長さに合わせて縦に伸ばす（中で別にスクロールさせない）。 */
    '.sgmtx{display:block;width:100%;box-sizing:border-box;font:inherit;font-size:17px;line-height:1.8;' +
      'color:#0f172a;background:#fff;border:0;border-radius:12px;padding:14px;overflow:hidden;resize:none;}' +
    '.sgmwait{color:#fff;background:rgba(255,255,255,.18);border-radius:14px;padding:12px 14px;' +
      'margin:0 2px 10px;font-weight:800;font-size:16px;line-height:1.6;}' +
    /* 回数を進めたお知らせ＝白い欄のすぐ下。数字だけ目立たせる。 */
    '.sgmdone{margin:10px 0 0;color:#eaf6fb;font-weight:800;font-size:15px;line-height:1.7;}' +
    '.sgmdone div{margin-top:4px;}' +
    '.sgmdone b{color:#ffd27a;font-size:17px;}' +
    '.sgtest{display:none;background:#fde68a;color:#78350f;font-weight:900;font-size:14px;' +
      'border-radius:12px;padding:8px 12px;margin:0 4px 10px;line-height:1.5;}' +
    /* ── 3枚目：月えらび ── */
    '.sgmonths{display:flex;flex-direction:column;gap:14px;margin:6px 0 8px;}' +
    '.sgmon{display:block;width:100%;box-sizing:border-box;text-align:center;background:#fff;color:#0f172a;' +
      'border:0;border-radius:18px;padding:26px 12px;font-size:34px;font-weight:900;cursor:pointer;' +
      'box-shadow:0 6px 18px rgba(0,0,0,.12);}' +
    '.sgmon:active{transform:translateY(2px);}' +
    /* ── 4枚目：日にちえらび（既存の予約の暦と同じ見た目にそろえる） ── */
    '.sgct{font-size:24px;font-weight:900;color:#fff;margin:2px 4px 14px;}' +
    '.sggrid{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;}' +
    '.sgwd{text-align:center;font-size:14px;color:#eaf6fb;font-weight:800;}' +
    '.sgwd.sat{color:#bfe3ff;}.sgwd.sun{color:#ffc9c9;}' +
    '.sgday{aspect-ratio:1/1.5;display:grid;place-items:center;background:#fff;color:#0f172a;border:0;' +
      'border-radius:12px;font-size:20px;font-weight:800;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.12);}' +
    '.sgday.sat{color:#1d6fb8;}.sgday.sun{color:#c0392b;}' +
    '.sgday.today{outline:2px solid #fb8c44;outline-offset:-2px;}' +
    '.sgday.blank{visibility:hidden;box-shadow:none;background:transparent;}' +
    '.sgday.past{opacity:.35;pointer-events:none;}';
  /* 4枚の画面。出すのは1枚だけ。 */
  var body =
    '<div class="sg" id="sgPick">' +
      '<div class="sgstep">施術者を選んでください</div>' +
      '<div class="sgstaff" id="sgstaff"></div>' +
      '<div class="sgstatus" id="sgstatus">今日の予約を読んでいます...</div>' +
    '</div>' +
    '<div class="sg" id="sgList" style="display:none">' +
      '<div class="sgwho" id="sglisthead"></div>' +
      '<div class="sglist" id="sglist"></div>' +
      '<div class="sgstatus" id="sgstatus2"></div>' +
    '</div>' +
    '<div class="sg" id="sgMonth" style="display:none">' +
      '<div class="sgwho long">次の予約希望の日時を選択</div>' +
      '<div class="sgmonths" id="sgmonths"></div>' +
    '</div>' +
    '<div class="sg" id="sgDay" style="display:none">' +
      '<div class="sgct" id="sgct"></div>' +
      '<div class="sggrid" id="sggrid"></div>' +
    '</div>' +
    /* 5枚目＝その日の空き状況。空き時間検索の「完全版」とまったく同じ物を出す
       （書き写さず akiFullCard_ をそのまま呼ぶ・まるちゃん 2026-09-11）。 */
    '<div class="sg" id="sgFree" style="display:none">' +
      '<div class="sgct" id="sgfct"></div>' +
      '<div id="sgfree"></div>' +
      '<div class="sgstatus" id="sgstatus3"></div>' +
    '</div>' +
    /* 6枚目＝予約時間設定。空きの帯を押すとここへ来る（まるちゃん 2026-09-11）。 */
    '<div class="sg" id="sgTime" style="display:none">' +
      '<div class="sgwho">予約時間設定</div>' +
      '<div class="sgct" id="sgtday"></div>' +
      '<div class="sgtwho1" id="sgtwho"></div>' +
      '<div class="sgtimebox">' +
        '<div class="sgtlab">開始時間</div>' +
        '<div class="sgtrow">' +
          '<span class="sgtcol">' +
            '<button type="button" class="sgtpm" data-t="s" data-d="-60">− 1時間</button>' +
            '<button type="button" class="sgtpm" data-t="s" data-d="-5">− 5分</button>' +
          '</span>' +
          '<span class="sgtval" id="sgtS">—</span>' +
          '<span class="sgtcol">' +
            '<button type="button" class="sgtpm" data-t="s" data-d="60">＋ 1時間</button>' +
            '<button type="button" class="sgtpm" data-t="s" data-d="5">＋ 5分</button>' +
          '</span>' +
        '</div>' +
      '</div>' +
      '<div class="sgtimebox">' +
        '<div class="sgtlab">施術の長さ（押すと終了時間が決まります）</div>' +
        '<div class="sgdur" id="sgdur"></div>' +
      '</div>' +
      '<div class="sgtimebox">' +
        '<div class="sgtlab">終了時間</div>' +
        '<div class="sgtrow">' +
          '<span class="sgtcol">' +
            '<button type="button" class="sgtpm" data-t="e" data-d="-60">− 1時間</button>' +
            '<button type="button" class="sgtpm" data-t="e" data-d="-5">− 5分</button>' +
          '</span>' +
          '<span class="sgtval" id="sgtE">—</span>' +
          '<span class="sgtcol">' +
            '<button type="button" class="sgtpm" data-t="e" data-d="60">＋ 1時間</button>' +
            '<button type="button" class="sgtpm" data-t="e" data-d="5">＋ 5分</button>' +
          '</span>' +
        '</div>' +
      '</div>' +
      '<div class="sgtimebox">' +
        '<div class="sgtlab">施術室（この時間に空いている部屋だけ出ます）</div>' +
        '<div class="sgrooms" id="sgrooms"></div>' +
        '<div class="sgroomnone" id="sgroomnone" style="display:none"></div>' +
      '</div>' +
      '<div class="sgerr" id="sgterr"></div>' +
      '<button type="button" class="sggo" id="sgtgo">この時間と部屋で決定</button>' +
    '</div>' +
    /* 7枚目＝予約メモの修正。今日の予約メモをそのまま出し、次回用に直してもらう
       （そのままタイムツリーの次回の予約メモになる・まるちゃん 2026-09-12）。 */
    '<div class="sg" id="sgMemo" style="display:none">' +
      '<div class="sgwho">予約メモの修正</div>' +
      '<div class="sgmnote">下に本日の予約メモを表示しています。次回の予約用にメモを修正してください。' +
        '次回の予約日の予約メモとしてタイムツリーに保存されます。</div>' +
      '<div class="sgtimebox">' +
        '<div class="sgtlab">予約メモのタイトル</div>' +
        '<input type="text" class="sgmin" id="sgmtitle">' +
      '</div>' +
      '<div class="sgtimebox">' +
        '<div class="sgtlab">予約メモ</div>' +
        '<textarea class="sgmtx" id="sgmtext" rows="8"></textarea>' +
        /* ★回数を進めた時は、欄のすぐ下に「何回目を何回目にしたか」を出す（まるちゃん 2026-09-12）。 */
        '<div class="sgmdone" id="sgmdone" style="display:none"></div>' +
      '</div>' +
      '<div class="sgmwait" id="sgmwait" style="display:none"></div>' +
      '<button type="button" class="sggo" id="sgmgo">この予約メモの内容で確定</button>' +
    '</div>';
  var backTop = backBar_(base, staff, dev);          /* 1枚目の戻る＝ホームへ */
  var backList = '<div class="backbar" id="sgbackbar" style="display:none">' +
    '<a class="backbtn" id="sgback" href="javascript:void(0)">← 前に戻る</a></div>';
  var script =
    '<script>(function(){' +
    'var EXEC=' + JSON.stringify(EXEC) + ',WHO=' + JSON.stringify(who || '') + ';' +
    'var KEY=' + JSON.stringify(KEY) + ';' +
    /* 誰が・どの端末から頼んだか（操作の記録用。他の画面とまったく同じ形）。 */
    'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",' +
      'device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
    'function jsonp(params,onR){var cb="__sg"+Date.now()+Math.floor(Math.random()*1000);' +
      'window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
      'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
      'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();' +
      'sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
    'var pick=null,dflt=null,BK=[],ALLEV=[],LIST=[],step=1,CUST=null,MY=null;' +
    /* 空き状況の材料。画面を開いた時に予約と**同時に**取りに行く（並びで待つので待ち時間は増えない）。 */
    'var AKI=null,AKIERR=false,AKIWAIT=null,PICKDATE=null,SLOT=null,TS=0,TE=0,ROOM=null,DAYROOMS=[];' +
    /* 次回用に回数を1つ進めた予約メモ（事務所パソコンが作る）。お客様を選んだ時に先に頼んでおく。 */
    'var NEXTMEMO=null,NEXTCHG=null,NEXTFOR=null,MEMOTOUCHED=false;' +
    /* ★画面が切り替わった時刻。切り替わった直後の押しは受け付けない（下の tapOK）。 */
    'var SWAP=0;' +
    /* ★★画面を切り替えた直後、指がまだ同じ場所にあると、新しい画面のボタンが続けて押される。
       まるちゃん 2026-09-12「前に戻るを押すとこの二つの画面をループする」の正体がこれ。
       ＝画面が変わってすぐの押しは捨てる（人が押し直せばよい）。全部のボタンがこれを通る。 */
    'function tapOK(){return (Date.now()-SWAP)>450;}' +
    'function $(i){return document.getElementById(i);}' +
    'function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){' +
      'return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[c];});}' +
    /* ★お試し用（開発URL ?dev=1 のときだけ効く・まるちゃん 2026-09-11）。
       &time=13:00 で「いまは13時」／&as=olive で「オリーブのスマホ」として動かす。 */
    'var DEVMODE=' + (dev ? 'true' : 'false') + ',TESTMS=0,TESTWHO="";' +
    'if(DEVMODE){try{var qs=new URLSearchParams(location.search);' +
      'var tt=qs.get("time")||"";' +
      'if(/^\\d{1,2}:\\d{2}$/.test(tt)){var pp=tt.split(":");var dd=new Date();' +
        'dd.setHours(parseInt(pp[0],10),parseInt(pp[1],10),0,0);TESTMS=dd.getTime();}' +
      'TESTWHO=qs.get("as")||"";if(TESTWHO)WHO=TESTWHO;}catch(e){}}' +
    'function NOW(){return TESTMS||Date.now();}' +
    'function showTestNote(){' +
      'if(!TESTMS&&!TESTWHO)return;' +
      'var d=new Date(NOW());' +
      'var hm=("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2);' +
      'var nm=(typeof SG!=="undefined"&&SG.markOfWho(TESTWHO))?' +
        '(SG.markOfWho(TESTWHO)+SG.nameOfMark(SG.markOfWho(TESTWHO))):TESTWHO;' +
      'var t="お試し中：";' +
      'if(TESTMS)t+="いまは "+(d.getMonth()+1)+"月"+d.getDate()+"日 "+hm+" として動かしています";' +
      'if(TESTMS&&TESTWHO)t+="／";' +
      'if(TESTWHO)t+=nm+"のスマホとして動かしています";' +
      'var el=$("sgtest");el.textContent=t;el.style.display="block";}' +
    /* 今日の予約を受け取る（先読みがあればそれ、無ければ自分で取りに行く） */
    'function need(cb){' +
      'var e=window.__PF_&&window.__PF_["yoyaku_sejutsugo"];' +
      'if(e){' +
        'if(e.cached){cb(e.cached);}' +
        'if(e.payload!==undefined){cb(e.payload);return;}' +
        'e.waiter=function(p){cb(p);};return;}' +
      'var nm="__sgGot_"+Date.now();window[nm]=function(p){cb(p);};' +
      'var s=document.createElement("script");' +
      's.src=EXEC+"?action=data&name=events.json&callback="+nm+"&cb="+Date.now();' +
      's.onerror=function(){cb({error:"net"});};document.body.appendChild(s);}' +
    /* 受け取った予定から「今日・うちの施術者の分」だけ取り出す */
    'function build(p){' +
      'if(!p||p.error||!p.events){$("sgstatus").textContent="今日の予約を読めませんでした。通信環境をご確認ください。";return;}' +
      'var today=p.date_from||"";ALLEV=[];BK=[];' +
      'var day=[];' +
      'for(var i=0;i<p.events.length;i++){var e=p.events[i];if(e.date!==today)continue;' +
        'var mk=(typeof staffOf==="function")?staffOf(e.title||""):"";' +
        /* ★部屋は入れ物の名前でなく色（ラベル）で決まる＝被り検出と同じ共通のやり方に聞く。 */
        'var rm=(typeof roomLabelOf==="function")?' +
          'roomLabelOf(e.calendar_id,e.label_id,e.title||"",ALL_ROOM_LABELS):null;' +
        'var rn=(rm!=null&&typeof ALL_ROOM_LABELS!=="undefined")?ALL_ROOM_LABELS[rm]:(e.calendar_name||"");' +
        'day.push({mark:mk,start:e.start_at_ms,end:e.end_at_ms,title:e.title||"",note:e.note||"",' +
          'room:rn,st:e.start_time||"",et:e.end_time||""});}' +
      /* ★カウンセリングの枠を出すかどうかは共通の1本にきく（同じ日に施術もある人の相談は出さない）。 */
      'var vis=SG.visibleBookings(day);' +
      'for(var v=0;v<vis.length;v++){var x=vis[v];' +
        'if(!SG.nameOfMark(x.mark))continue;' +
        'ALLEV.push(x);BK.push({mark:x.mark,start:x.start,end:x.end});}' +
      'drawPick();}' +
    /* ── 画面の出し入れ（1枚だけ出す） ── */
    'function show(){' +
      'SWAP=Date.now();' +
      '$("sgPick").style.display=step===1?"":"none";' +
      '$("sgList").style.display=step===2?"":"none";' +
      '$("sgMonth").style.display=step===3?"":"none";' +
      '$("sgDay").style.display=step===4?"":"none";' +
      '$("sgFree").style.display=step===5?"":"none";' +
      '$("sgTime").style.display=step===6?"":"none";' +
      '$("sgMemo").style.display=step===7?"":"none";' +
      '$("sgbackbar").style.display=step===1?"none":"";' +
      'var tb=$("sgtopbar");if(tb)tb.style.display=step===1?"":"none";' +
      'var hd=$("sghead");if(hd)hd.style.display=step===1?"":"none";}' +
    'function goPick(){step=1;show();drawPick();window.scrollTo(0,0);}' +
    'function goList(){step=2;show();window.scrollTo(0,0);drawList();scrollToNow();}' +
    'function goMonth(){step=3;show();drawMonths();window.scrollTo(0,0);}' +
    'function goDay(){step=4;show();drawCal();window.scrollTo(0,0);}' +
    /* ★7枚目から戻る時は、せっかく決めた時間と部屋をそのまま残す（goTimeだと選び直しになる）。 */
    'function back(){if(step===7){step=6;show();drawTime();window.scrollTo(0,0);}' +
      'else if(step===6){goFree();}else if(step===5){goDay();}' +
      'else if(step===4){goMonth();}else if(step===3){goList();}else{goPick();}}' +
    /* ── 1枚目：施術者をえらぶ ── */
    'function drawPick(){' +
      'var r=SG.staffOrder(BK,WHO,NOW());' +
      'if(pick===null)pick=r.selected;' +
      'if(dflt===null)dflt=r.selected;' +
      'var h="";' +
      'for(var i=0;i<r.list.length;i++){var x=r.list[i];' +
        'h+="<button type=\\"button\\" class=\\"sgbtn"+(pick===x.mark?" sel":"")+(dflt===x.mark?" dflt":"")+"\\" data-mk=\\""+esc(x.mark)+"\\">"+' +
          '"<span class=\\"sgmk\\">"+esc(x.mark)+"</span>"+' +
          '"<span class=\\"sgnm\\">"+esc(x.name)+"</span>"+' +
          '"<span class=\\"sgsub\\">"+x.count+"件</span></button>";}' +
      'h+="<button type=\\"button\\" class=\\"sgbtn all"+(pick===SG.ALL?" sel":"")+(dflt===SG.ALL?" dflt":"")+"\\" data-mk=\\""+SG.ALL+"\\">"+' +
        '"<span class=\\"sgmk\\">👥</span><span class=\\"sgnm\\">全施術者</span></button>";' +
      '$("sgstaff").innerHTML=h;' +
      '$("sgstatus").textContent=r.list.length?"":"今日は予約がありません。";' +
      'var bs=$("sgstaff").getElementsByClassName("sgbtn");' +
      'for(var b=0;b<bs.length;b++){bs[b].onclick=function(){' +
        'if(!tapOK())return;' +
        'pick=this.getAttribute("data-mk");goList();};}}' +
    /* ── 2枚目：お客様の選択 ── */
    'function drawList(){' +
      'var now=NOW();' +
      'var list=ALLEV.filter(function(e){return pick===SG.ALL||e.mark===pick;});' +
      'list.sort(function(a,b){return a.start-b.start;});' +
      'LIST=list;' +
      '$("sglisthead").textContent="お客様の選択";' +
      'if(!list.length){$("sglist").innerHTML="";' +
        '$("sgstatus2").textContent="この施術者の今日の予約はありません。";return;}' +
      '$("sgstatus2").textContent="";' +
      'var h="";' +
      'for(var i=0;i<list.length;i++){var e=list[i];' +
        'var cd=(typeof codeOf==="function")?codeOf(e.title):"";' +
        'var nm=(typeof customerLine==="function")?(customerLine(e.note).name||""):"";' +
        'var col=(typeof roomColor_==="function")?roomColor_(e.room):"#64748b";' +
        'var rnm=(typeof shortRoomName_==="function")?shortRoomName_(e.room):e.room;' +
        'var live=(e.start<=now&&now<e.end)?"<span class=\\"sgnow\\">いま施術中</span>":"";' +
        'h+="<button type=\\"button\\" class=\\"sgrow\\" data-id=\\""+i+"\\">"+' +
          '"<span class=\\"sgl1\\"><span class=\\"sgtm\\">"+esc(e.st)+"〜"+esc(e.et)+"</span>"+' +
            '"<span class=\\"sgroom\\" style=\\"background:"+col+"\\">"+esc(rnm)+"</span>"+live+"</span>"+' +
          '"<span class=\\"sgl2\\"><span class=\\"sgmk2\\">"+esc(e.mark)+"</span>"+' +
            '"<span class=\\"sgnm2\\">"+esc(nm||"お名前なし")+"</span>"+' +
            '"<span class=\\"sgcd2\\">"+esc(cd)+"</span></span>"+' +
          '"</button>";}' +
      '$("sglist").innerHTML=h;' +
      'fitNames();' +
      'var rs=$("sglist").getElementsByClassName("sgrow");' +
      'for(var k=0;k<rs.length;k++){rs[k].onclick=function(){' +
        'if(!tapOK())return;' +
        'CUST=LIST[parseInt(this.getAttribute("data-id"),10)];' +
        'askNextMemo();goMonth();};}}' +
    /* ★お名前が2行にならないように、入りきらないカードだけ字を小さくする。
       ふつうの長さ（実データの85%）はいちばん大きい34pxのまま。 */
    'function fitNames(){' +
      'var BIG=34,MIN=16;' +
      'var ns=$("sglist").getElementsByClassName("sgnm2");' +
      'for(var i=0;i<ns.length;i++){var el=ns[i];' +
        'el.style.fontSize=BIG+"px";' +
        'var have=el.clientWidth,need=el.scrollWidth;' +
        'if(!have||need<=have)continue;' +
        'var fs=Math.floor(BIG*(have-2)/need);' +
        'if(fs<MIN)fs=MIN;if(fs>BIG)fs=BIG;' +
        'el.style.fontSize=fs+"px";' +
        'for(var t=0;t<4&&fs>MIN&&el.scrollWidth>el.clientWidth;t++){fs--;el.style.fontSize=fs+"px";}}}' +
    /* ★いま施術しているお客様が画面の一番上に来るように開く。
       無ければ、いまより前で一番あとに終わった予約（＝1つ前。施術がのびていることがあるため）。 */
    'function scrollToNow(){' +
      'var now=NOW(),rows=$("sglist").getElementsByClassName("sgrow");' +
      'if(!rows.length)return;' +
      'var idx=-1;' +
      'for(var i=0;i<LIST.length;i++){if(LIST[i].start<=now&&now<LIST[i].end){idx=i;break;}}' +
      'if(idx<0){var best=-1;' +
        'for(var j=0;j<LIST.length;j++){if(LIST[j].end<=now&&(best<0||LIST[j].end>LIST[best].end))best=j;}' +
        'idx=best;}' +
      'if(idx<0||!rows[idx])return;' +
      'var bar=$("sgbackbar");var off=bar?bar.offsetHeight:0;' +
      'var el=$("sglist");el.style.paddingBottom="0px";' +
      'var y=Math.max(0,rows[idx].getBoundingClientRect().top+window.pageYOffset-off-6);' +
      'var mx=document.documentElement.scrollHeight-window.innerHeight;' +
      'if(y>mx)el.style.paddingBottom=(y-mx)+"px";' +
      'window.scrollTo(0,y);}' +
    /* ── 3枚目：月をえらぶ（今月から3か月ぶん・縦に並べる／まるちゃん 2026-09-11） ── */
    'function drawMonths(){' +
      'var base=new Date(NOW());base.setDate(1);' +
      'var h="";' +
      'for(var i=0;i<3;i++){' +
        'var d=new Date(base.getFullYear(),base.getMonth()+i,1);' +
        'h+="<button type=\\"button\\" class=\\"sgmon\\" data-y=\\""+d.getFullYear()+"\\" data-m=\\""+d.getMonth()+"\\">"+' +
          '(d.getMonth()+1)+"月</button>";}' +
      '$("sgmonths").innerHTML=h;' +
      'var bs=$("sgmonths").getElementsByClassName("sgmon");' +
      'for(var b=0;b<bs.length;b++){bs[b].onclick=function(){' +
        'if(!tapOK())return;' +
        'MY={y:parseInt(this.getAttribute("data-y"),10),m:parseInt(this.getAttribute("data-m"),10)};' +
        'goDay();};}}' +
    /* ── 4枚目：日にちをえらぶ（曜日つきの暦・既存の予約と同じ見た目） ── */
    'function drawCal(){' +
      'if(!MY)return;' +
      'var y=MY.y,m=MY.m;' +
      '$("sgct").textContent=y+"年 "+(m+1)+"月";' +
      'var wd=["月","火","水","木","金","土","日"];' +
      'var h="";' +
      'for(var i=0;i<7;i++){h+="<div class=\\"sgwd"+(i===5?" sat":i===6?" sun":"")+"\\">"+wd[i]+"</div>";}' +
      'var first=new Date(y,m,1);var off=(first.getDay()+6)%7;' +
      'var dim=new Date(y,m+1,0).getDate();' +
      'for(var b=0;b<off;b++){h+="<div class=\\"sgday blank\\"></div>";}' +
      'var n=new Date(NOW());var t0=new Date(n.getFullYear(),n.getMonth(),n.getDate());' +
      'for(var d=1;d<=dim;d++){var dow=(off+d-1)%7;var cls="sgday";' +
        'if(dow===5)cls+=" sat";if(dow===6)cls+=" sun";' +
        'var cur=new Date(y,m,d);' +
        'if(cur.getTime()===t0.getTime())cls+=" today";' +
        'if(cur<t0)cls+=" past";' +   /* 過ぎた日は選べない */
        'h+="<button type=\\"button\\" class=\\""+cls+"\\" data-d=\\""+d+"\\">"+d+"</button>";}' +
      '$("sggrid").innerHTML=h;' +
      'var ds=$("sggrid").getElementsByClassName("sgday");' +
      'for(var k=0;k<ds.length;k++){if(ds[k].getAttribute("data-d")){ds[k].onclick=function(){' +
        'if(!tapOK())return;' +
        'PICKDATE=MY.y+"-"+("0"+(MY.m+1)).slice(-2)+"-"+("0"+this.getAttribute("data-d")).slice(-2);' +
        'goFree();};}}}' +
    /* ── 5枚目：その日の空き状況（空き時間検索の「完全版」と同じ物） ── */
    'function goFree(){step=5;show();drawFree();window.scrollTo(0,0);}' +
    'function drawFree(){' +
      'var wd=["日","月","火","水","木","金","土"];' +
      'var d=new Date(PICKDATE+"T00:00:00");' +
      '$("sgfct").textContent=(d.getMonth()+1)+"月"+d.getDate()+"日（"+wd[d.getDay()]+"）の空き状況";' +
      'if(!AKI&&!AKIERR){$("sgstatus3").textContent="空き状況を読んでいます...";' +
        '$("sgfree").innerHTML="";AKIWAIT=function(){if(step===5)drawFree();};return;}' +
      'if(AKIERR){$("sgstatus3").textContent="空き状況を読めませんでした。通信環境をご確認ください。";' +
        '$("sgfree").innerHTML="";return;}' +
      'var day=null;' +
      'for(var i=0;i<AKI.days.length;i++){if(AKI.days[i].date===PICKDATE){day=AKI.days[i];break;}}' +
      'if(!day){$("sgstatus3").textContent="この日の空き状況はまだ出せません（先の日は近づくと出ます）。";' +
        '$("sgfree").innerHTML="";return;}' +
      'if(day.kind==="closed"){$("sgstatus3").textContent=day.label||"この日はお休みです。";' +
        '$("sgfree").innerHTML="";return;}' +
      '$("sgstatus3").textContent="";' +
      'DAYROOMS=day.rooms_free||[];' +
      '$("sgfree").innerHTML=akiFullCard_(day);' +
      /* 空きの帯を押すと「予約時間設定」へ */
      'var fs=$("sgfree").getElementsByClassName("akffree");' +
      'for(var f=0;f<fs.length;f++){fs[f].style.cursor="pointer";fs[f].onclick=function(){' +
        'if(!tapOK())return;' +
        'SLOT={s:hm2m(this.getAttribute("data-s")),e:hm2m(this.getAttribute("data-e")),' +
          'kind:this.getAttribute("data-kind"),who:this.getAttribute("data-who")};' +
        'goTime();};}}' +
    /* ── 6枚目：予約時間設定 ── */
    'function hm2m(t){var p=String(t||"").split(":");' +
      'return (parseInt(p[0],10)||0)*60+(parseInt(p[1],10)||0);}' +
    'function m2hm(m){return Math.floor(m/60)+":"+("0"+(m%60)).slice(-2);}' +
    'var DURS=[15,30,40,60,90,120];' +
    'function goTime(){step=6;show();' +
      'var wd=["日","月","火","水","木","金","土"];' +
      'var d=new Date(PICKDATE+"T00:00:00");' +
      '$("sgtday").textContent=(d.getMonth()+1)+"月"+d.getDate()+"日（"+wd[d.getDay()]+"）";' +
      'TS=SLOT.s;' +
      /* はじめの終了時間＝30分。入りきらなければ空きの終わりまで。 */
      'TE=Math.min(SLOT.s+30,SLOT.e);' +
      /* 施術室の帯を押した時は、その部屋がはじめから選ばれている。 */
      'ROOM=(SLOT.kind==="room")?SLOT.who:null;' +
      'drawTime();window.scrollTo(0,0);}' +
    /* ★上の1行は1行に収まる最大の大きさにする（まるちゃん 2026-09-12）。 */
    'function fitLine(el,big,min){' +
      'el.style.fontSize=big+"px";' +
      'var have=el.clientWidth,need=el.scrollWidth;' +
      'if(!have||need<=have)return;' +
      'var fs=Math.floor(big*(have-2)/need);' +
      'if(fs<min)fs=min;if(fs>big)fs=big;' +
      'el.style.fontSize=fs+"px";' +
      'for(var t=0;t<4&&fs>min&&el.scrollWidth>el.clientWidth;t++){fs--;el.style.fontSize=fs+"px";}}' +
    /* ★その時間にまるごと空いている施術室だけ返す（事務所PCが出した空きの区間から見る）。 */
    'function freeRooms(a,b){' +
      'var out=[];' +
      'for(var i=0;i<DAYROOMS.length;i++){' +
        'var r=DAYROOMS[i],ok=false;' +
        'for(var j=0;j<(r.slots||[]).length;j++){' +
          'if(hm2m(r.slots[j].s)<=a&&b<=hm2m(r.slots[j].e)){ok=true;break;}}' +
        'if(ok)out.push(r.room);}' +
      /* 並びは時間割と同じ（コスモスがフリーダムの左） */
      'out.sort(function(x,y){var ix=AKI_ROOM_ORDER_.indexOf(x),iy=AKI_ROOM_ORDER_.indexOf(y);' +
        'if(ix<0)ix=99;if(iy<0)iy=99;return ix-iy;});' +
      'return out;}' +
    'function drawTime(){' +
      /* ★開始を動かしたら終了も同じだけ動く（長さは変えない・まるちゃん 2026-09-12）。
         そのぶん「終了が開始より前」は起きないので、その知らせは出さない。 */
      'if(TS<SLOT.s)TS=SLOT.s;' +
      'if(TS>SLOT.e-5)TS=SLOT.e-5;' +
      'if(TE<TS+5)TE=TS+5;' +
      '$("sgtS").textContent=m2hm(TS);$("sgtE").textContent=m2hm(TE);' +
      '$("sgtwho").textContent=(SLOT.kind==="staff"?"施術者 ":"施術室 ")+SLOT.who+"　空き "+' +
        'm2hm(SLOT.s)+"〜"+m2hm(SLOT.e);' +
      'fitLine($("sgtwho"),26,13);' +
      'var h="";' +
      'for(var i=0;i<DURS.length;i++){' +
        'h+="<button type=\\"button\\" class=\\"sgdurb"+((TE-TS)===DURS[i]?" sel":"")+"\\" data-m=\\""+DURS[i]+"\\">"+DURS[i]+"分</button>";}' +
      '$("sgdur").innerHTML=h;' +
      'var bs=$("sgdur").getElementsByClassName("sgdurb");' +
      'for(var b=0;b<bs.length;b++){bs[b].onclick=function(){' +
        'if(!tapOK())return;' +
        'TE=TS+parseInt(this.getAttribute("data-m"),10);drawTime();};}' +
      /* ★施術室＝この時間に空いている部屋だけ。時間を変えるとその場で作り直す。 */
      'var fr=freeRooms(TS,TE);' +
      'if(ROOM&&fr.indexOf(ROOM)<0&&fr.indexOf(shortRoomName_(ROOM))<0)ROOM=null;' +
      'var rh="";' +
      'for(var k=0;k<fr.length;k++){' +
        'var nm=shortRoomName_(fr[k]);' +
        'rh+="<button type=\\"button\\" class=\\"sgroomb"+((ROOM===fr[k]||ROOM===nm)?" sel":"")+"\\"" +' +
          '" data-r=\\""+esc(fr[k])+"\\" style=\\"background:"+roomColor_(fr[k])+"\\">"+esc(nm)+"</button>";}' +
      '$("sgrooms").innerHTML=rh;' +
      'var rs=$("sgrooms").getElementsByClassName("sgroomb");' +
      'for(var m=0;m<rs.length;m++){rs[m].onclick=function(){' +
        'if(!tapOK())return;' +
        'ROOM=this.getAttribute("data-r");drawTime();};}' +
      'var none=$("sgroomnone");' +
      'if(fr.length){none.style.display="none";none.textContent="";}' +
      'else{none.style.display="block";none.textContent="この時間に空いている施術室がありません。";}' +
      /* 空きをはみ出していないか見る（まるちゃん指定の文をそのまま出す） */
      'var over=(TE>SLOT.e);' +
      'var er=$("sgterr");' +
      'if(over){er.style.display="block";' +
        'er.innerHTML="その時間は空いていません。<br>入力し直してください。";}' +
      'else{er.style.display="none";er.textContent="";}' +
      '$("sgtgo").disabled=over||!fr.length||!ROOM;}' +
    /* ── 7枚目：予約メモの修正 ──
       今日の予約メモ（タイトルと本文）をそのまま出す＝予約するとは、前の予約メモを写して
       次の予約日のタイムツリーに入れること（まるちゃん 2026-09-11）。 */
    /* ★お客様を選んだ時点で、事務所パソコンに「次回用のメモ」を作ってもらっておく。
       日にちや時間を選んでいる間に出来上がるので、メモの画面では待ち時間が出ない。
       ★回数の数え方は共通の1本（事務所パソコンの treatment_memo）だけが知っている＝
       画面では数えない（書き写すと必ずずれる・CLAUDE.mdの決まり）。 */
    'var MEMOCACHE={};' +
    'function askNextMemo(){' +
      'var note=(CUST&&CUST.note)||"";' +
      'NEXTMEMO=null;NEXTCHG=null;NEXTFOR=note;MEMOTOUCHED=false;' +
      'if(!note)return;' +
      /* 一度聞いた分は覚えておく＝同じお客様を選び直しても、もう頼まない。 */
      'if(MEMOCACHE[note]){NEXTMEMO=MEMOCACHE[note].memo;NEXTCHG=MEMOCACHE[note].changed;return;}' +
      /* ★回数がどこにも書いていないメモは、進める所が無い＝頼まずにそのまま使う（待ち時間ゼロ）。 */
      'if(note.indexOf("回目")<0){NEXTMEMO=note;NEXTCHG=[];MEMOCACHE[note]={memo:note,changed:[]};return;}' +
      'var mine=note;' +
      'jsonp({action:"submit",key:KEY,op:"sejutsugo_next_memo",who:idn.who,role:idn.role,' +
        'device:idn.device,fields:JSON.stringify({memo:note})},' +
      'function(r){if(!r||!r.ok||!r.id)return;setTimeout(function(){pollNextMemo(r.id,mine,0);},900);});}' +
    'function pollNextMemo(id,mine,n){' +
      'if(n>200||NEXTFOR!==mine)return;' +
      'jsonp({action:"status",key:KEY,id:id},function(r){' +
        'if(!r||!r.ok||NEXTFOR!==mine)return;' +
        'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){' +
          'setTimeout(function(){pollNextMemo(id,mine,n+1);},600);return;}' +
        'if(r.status!=="done")return;' +
        'var d=null;try{d=JSON.parse(r.result||"{}");}catch(e){return;}' +
        'if(!d||!d.ok||!d.memo)return;' +
        'NEXTMEMO=d.memo;NEXTCHG=d.changed||[];MEMOCACHE[mine]={memo:d.memo,changed:NEXTCHG};' +
        /* まだ画面に出ていない／人がまだ触っていなければ、出来上がった物に差し替える。 */
        'if(step===7&&!MEMOTOUCHED){$("sgmtext").value=NEXTMEMO;growMemo();}' +
        'memoReady();});}' +
    /* ★回数を進めた時だけ、欄の下に「何回目を何回目にしたか」を出す（まるちゃん 2026-09-12）。
       進めていない時（最終回・前回なし・回数の無いメモ）は何も出さない。 */
    'function drawMemoDone(){var el=$("sgmdone");' +
      'if(!NEXTCHG||!NEXTCHG.length){el.style.display="none";el.innerHTML="";return;}' +
      'var h="";' +
      'for(var i=0;i<NEXTCHG.length;i++){var c=NEXTCHG[i];' +
        'h+="<div>今日の予約メモ <b>"+esc(c["前"])+"回目</b>を、次回用に、<b>"+' +
          'esc(c["後"])+"回目</b>に変更済みです</div>";}' +
      'el.innerHTML=h;el.style.display="block";}' +
    /* ★下書きが出来るまでは「確定」を押せなくする＝1つ前の回数のまま保存してしまうのを防ぐ。
       お客様を選んだ時点で頼んであるので、ふつうはここへ来た時にはもう出来ている。 */
    'function memoReady(){var w=$("sgmwait");if(w){w.style.display="none";w.textContent="";}' +
      'if(step===7){$("sgmgo").disabled=false;drawMemoDone();}}' +
    'function memoWait(){var w=$("sgmwait");drawMemoDone();' +
      'if(NEXTMEMO||!((CUST&&CUST.note)||"")){memoReady();return;}' +
      'w.style.display="block";w.textContent="回数を1つ進めた下書きを作っています…";' +
      '$("sgmgo").disabled=true;' +
      /* いつまでも待たせない＝25秒で今日のメモのまま進めるようにする（回数は手で直せる）。 */
      'setTimeout(function(){if(step===7&&!NEXTMEMO){' +
        'w.textContent="回数を進められませんでした。回数は手で直してください。";' +
        '$("sgmgo").disabled=false;}},25000);}' +
    'function goMemo(){step=7;show();' +
      '$("sgmtitle").value=(CUST&&CUST.title)||"";' +
      'MEMOTOUCHED=false;' +
      '$("sgmtext").value=NEXTMEMO||((CUST&&CUST.note)||"");' +
      /* ★字の形が届くまでの間に測ると横幅が出ず、とんでもなく縦長になる。少し置いて測り直す。 */
      'growMemo();setTimeout(growMemo,0);setTimeout(growMemo,300);' +
      'memoWait();window.scrollTo(0,0);}' +
    /* 予約メモが全部見えるように、中身の高さに合わせて伸ばす。 */
    'function growMemo(){var t=$("sgmtext");' +
      'if(!t.clientWidth)return;' +            /* まだ出ていない＝測っても意味がない */
      't.style.height="auto";t.style.height=(t.scrollHeight+4)+"px";}' +
    /* ── タイムツリーへ書き込む（事務所パソコンの受付係にお願いする） ── */
    'var sending=false,mpolls=0;' +
    'function memoFail(msg){szOvHide_();sending=false;$("sgmgo").disabled=false;' +
      'szPopup_(msg||"エラーが発生しました。通信に失敗しました。もう一度お試しください。");}' +
    'function sendMemo(){' +
      'if(sending)return;' +
      'var ti=($("sgmtitle").value||"").trim();' +
      'if(!ti){szPopup_("予約メモのタイトルを入れてください。");return;}' +
      'if(!PICKDATE||!ROOM){szPopup_("予約の日時と施術室が決まっていません。前に戻ってやり直してください。");return;}' +
      'var f={date:PICKDATE,start:m2hm(TS),end:m2hm(TE),room:ROOM,title:ti,memo:$("sgmtext").value||""};' +
      'sending=true;mpolls=0;$("sgmgo").disabled=true;' +
      'szOvShow_(szBusyHtml_("次回の予約を登録中です"),"#2C7A99");' +
      /* ★予約メモは長いことがあるので、住所に入りきらない時は別の入口へ預ける（共通のBIG）。 */
      'var req={exec:EXEC,key:KEY,slot:idn.device,tag:"sejutsugo",op:"sejutsugo_reservation",' +
        'who:idn.who,role:idn.role,device:idn.device,fields:f};' +
      'var send=function(ft){' +
        'jsonp({action:"submit",key:KEY,op:"sejutsugo_reservation",who:idn.who,role:idn.role,' +
          'device:idn.device,fields:ft},' +
        'function(r){if(!r||!r.ok||!r.id){memoFail();return;}' +
          'setTimeout(function(){pollMemo(r.id);},1200);});};' +
      'if(typeof BIG==="undefined"){send(JSON.stringify(f));return;}' +
      'BIG.prepare(req,send,function(){memoFail();});}' +
    /* 事務所パソコンが書き終えるまで待つ（新規の予約と同じ＝0.6秒おきに350回＝210秒）。 */
    'function pollMemo(id){mpolls++;if(mpolls>350){memoFail();return;}' +
      'jsonp({action:"status",key:KEY,id:id},function(r){' +
        'if(!r||!r.ok){memoFail();return;}' +
        'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){' +
          'setTimeout(function(){pollMemo(id);},600);return;}' +
        'if(r.status!=="done"){memoFail(esc(r.result)||"エラーが発生しました。りゅうさんにお伝えください。");return;}' +
        'var u=(String(r.result||"").match(/https?:\\/\\/\\S+/)||[""])[0];' +
        'sending=false;$("sgmgo").disabled=false;' +
        'szOvShow_(szDoneHtml_("次回の予約を登録しました","お客様の選択に戻る",u),"#16a34a");' +
        'var bb=document.getElementById("szDoneBack");' +
        'if(bb)bb.addEventListener("click",function(){szOvHide_();goList();});});}' +
    /* 空き状況の材料を取りに行く（この画面用に1回だけ） */
    '(function(){var nm="__sgAki_"+Date.now();' +
      'window[nm]=function(p){AKI=(p&&p.days)?p:null;AKIERR=!AKI;' +
        'var w=AKIWAIT;AKIWAIT=null;if(w)w();};' +
      'var s=document.createElement("script");' +
      's.src=EXEC+"?action=data&name=akijikan.json&callback="+nm+"&cb="+Date.now();' +
      's.onerror=function(){AKIERR=true;var w=AKIWAIT;AKIWAIT=null;if(w)w();};' +
      'document.body.appendChild(s);})();' +
    '$("sgback").onclick=function(){if(!tapOK())return;back();};' +
    '(function(){var ps=document.getElementsByClassName("sgtpm");' +
      'for(var i=0;i<ps.length;i++){ps[i].onclick=function(){' +
        'if(!tapOK())return;' +
        'var d=parseInt(this.getAttribute("data-d"),10);' +
        /* ★開始を動かしたら終了も同じだけ動く＝長さはそのまま（まるちゃん 2026-09-12）。 */
        'if(this.getAttribute("data-t")==="s"){TS+=d;TE+=d;}else{TE+=d;}' +
        'drawTime();};}' +
      '$("sgtgo").onclick=function(){if(!tapOK())return;goMemo();};' +
      '$("sgmgo").onclick=function(){if(!tapOK())return;sendMemo();};' +
      '$("sgmtext").addEventListener("input",function(){MEMOTOUCHED=true;growMemo();});})();' +
    /* 窓の大きさを変えた時も、お名前が2行にならないように測り直す（パソコンの窓用）。 */
    'window.addEventListener("resize",function(){if(step===2)fitNames();' +
      'if(step===6)fitLine($("sgtwho"),26,13);if(step===7)growMemo();});' +
    'showTestNote();' +
    'need(build);' +
    '})();<' + '/script>';
  return '<style>' + HOMECSS_ + css + AKFCSS_ + '</style>' +
    '<div class="home">' +
      '<span id="sgtopbar">' + backTop + '</span>' + backList +
      '<div class="sgtest" id="sgtest"></div>' +
      '<span id="sghead">' + head + '</span>' + body +
    '</div>' + script;
}

function renderNewReservationPage_(base, staff, dev) {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  // 表示の並び順＝みかん・オリーブ・トマト・マンゴー（2026-08-03 まるちゃん指定）。
  //   5=パイン🍍＝デザイン眉・まつエク専用（既定は隠し、デザ眉/まつエクの時だけ出す）。
  var STAFF = [['2', '🍊', 'みかん'], ['3', '🫒', 'オリーブ'], ['1', '🍅', 'トマト'], ['4', '🥭', 'マンゴー'], ['5', '🍍', 'パイン']];
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
    '.nrslot{border:2px solid rgba(255,255,255,.28);border-radius:14px;padding:4px 12px 12px;margin:14px 0;}' +
    '.nrsub{font-weight:800;margin:12px 2px 6px;font-size:15px;color:#dbeafe;}' +
    '.nrnote2{color:#cfe6ef;font-size:14px;margin:0 2px 8px;}' +
    '.nrcoswarn{background:#fde2e4;color:#9b1c31;padding:12px 14px;border-radius:12px;font-weight:900;line-height:1.6;margin:8px 0;}' +
    '.nrslot.nrlock .nrpills,.nrslot.nrlock .nrsub{display:none;}' +
    '.nrorow{display:flex;align-items:center;gap:10px;background:#fff;color:#123;border-radius:12px;padding:12px 14px;margin:8px 0;font-size:17px;font-weight:900;}' +
    '.nrono{background:#2C7A99;color:#fff;border-radius:999px;min-width:32px;text-align:center;padding:2px 8px;}' +
    '.nroname{flex:1;}' +
    '.nroup{border:0;border-radius:999px;background:#2C7A99;color:#fff;font-weight:900;font-size:15px;padding:10px 14px;}' +
    '.nrpill.sel{opacity:1;outline:3px solid #fff;outline-offset:-3px;}' +
    '.nrgo{display:block;width:100%;margin:24px 0 8px;padding:18px;font-size:21px;font-weight:800;border:0;border-radius:16px;background:#16a34a;color:#fff;box-shadow:0 4px 10px rgba(0,0,0,.18);}' +
    '.nrgo:disabled{opacity:.5;}' +
    '.nrread{display:block;width:100%;margin:12px 0 4px;padding:14px;font-size:17px;font-weight:800;border:0;border-radius:14px;background:#2563eb;color:#fff;box-shadow:0 3px 8px rgba(0,0,0,.16);}' +
    '.nrread:disabled{opacity:.5;}' +
    '#nrprev{width:100%;box-sizing:border-box;min-height:120px;font-size:19px;padding:12px;border-radius:12px;border:1px solid #cbd5e1;background:#fff;color:#123;line-height:1.7;overflow:hidden;}' +
    // ★2026-08-24 まるちゃん指摘「変換中です の文字が背景とかぶって見にくい・色がかぶってる」。
    //   文字に色を付けるだけだったので、明るい画面では下地に溶けていた（スマホの明るさ設定で背景が
    //   白っぽくも黒っぽくも変わるのに、文字だけ緑で固定していたのが原因）。
    //   → お店の他の画面と同じ「箱に入れる」形にする。色はこの画面に元からある物にそろえる
    //     （ふつう＝白い箱＋濃い文字＝題名の入力欄と同じ／うまくいかなかった時＝濃い赤 #7f1d1d＋
    //      薄い赤の文字＝この画面のプロセルの問いかけと同じ）。
    //   ★この画面の背景そのものが青緑(#2C7A99)なので、青緑の箱は使えない（＝まるちゃんの
    //     「色がかぶってる」はこれ）。何も出ていない時は箱ごと消す。
    '.nrstatus{font-weight:900;min-height:0;margin:16px 4px;font-size:23px;line-height:1.5;'
    + 'border-radius:12px;padding:0;}' +
    '.nrstatus.on{background:#fff;color:#0f172a;padding:14px 16px;'
    + 'box-shadow:0 2px 6px rgba(0,0,0,.12);}' +
    '.nrstatus.ng{background:#7f1d1d;color:#fecaca;padding:14px 16px;}';
  var script = '<script>(function(){' +
    'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
    'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
    'var sel={dur:"60",staff:"2",counsel:"1",needc:"yes",room:"FREEDOM",gender:"",tw:""};' +
    'var stEl=document.getElementById("nrstatus"),goEl=document.getElementById("nrgo"),txtEl=document.getElementById("nrtext");' +
    'var prevEl=document.getElementById("nrprev"),prevWrap=document.getElementById("nrprevwrap"),readEl=document.getElementById("nrread");' +
    // 文字だけでなく箱ごと出す（何も無い時は箱を消す）＝どの明るさの画面でも読める。
    'function status(t,err){stEl.textContent=t;stEl.className="nrstatus"+(t?(err?" ng":" on"):"");}' +
    'function esc(s){return (s==null?"":String(s));}' +
    'function selVal(g,v){if(!v)return;sel[g]=String(v);var sib=document.querySelectorAll(".nrpill[data-grp=\\""+g+"\\"]");for(var j=0;j<sib.length;j++)sib[j].classList.toggle("sel",sib[j].getAttribute("data-val")===String(v));}' +
    // ★空いていない部屋・担当のボタンを消す（埋まっている所は選べないように）。パソコン版と同じ考え方。
    'function nrHideBusy(g,list){var pl=document.querySelectorAll(".nrpill[data-grp=\\""+g+"\\"]"),vals=[];' + 'for(var i=0;i<pl.length;i++){vals.push(pl[i].getAttribute("data-val"));}' + 'var r=NR.hideBusy(vals,list,sel[g]);' + 'for(var k=0;k<pl.length;k++){pl[k].style.display=r.hidden[k]?"none":"";}' + 'if(r.sel!==sel[g]){sel[g]=r.sel;for(var m=0;m<pl.length;m++){pl[m].classList.toggle("sel",pl[m].getAttribute("data-val")===r.sel);}}}' +
    // ★デザイン眉・まつエク＝パイン🍍だけ選べる（他4人は隠す）・部屋は取らない（土曜だけ部屋欄を出す）。
    // ★判断は共通の1本（NR）に聞く。ここは答えを画面に当てはめるだけ（2026-08-24）。
    'function nrMayuVis(){var v=NR.mayuView(window.__nrMayu,window.__nrSat,window.__nrSlots),o=NR.outerSectionsShown(window.__nrSlots);' +
    'var sp=document.querySelectorAll(".nrpill[data-grp=\\"staff\\"]");for(var k=0;k<sp.length;k++){var pine=sp[k].getAttribute("data-val")==="5";if(v.pineOnly){sp[k].style.display=pine?"":"none";}else if(pine){sp[k].style.display="none";}}' +
    'var rw=document.getElementById("nrRoomWrap");if(rw)rw.style.display=v.roomWrapShown?"":"none";' +
    'var sw2=document.getElementById("secStaffWrap");if(sw2&&!o.staff)sw2.style.display="none";' +
    'var dw2=document.getElementById("secDurWrap");if(dw2&&!o.dur)dw2.style.display="none";' +
    'if(v.forceStaff){selVal("staff",v.forceStaff);}' +
    'if(v.pickFirstFreeRoom){var rp=document.querySelectorAll(".nrpill[data-grp=\\"room\\"]"),rf=null;for(var m=0;m<rp.length;m++){if(rp[m].style.display!=="none"&&!rf){rf=rp[m];}}if(rf){sel.room=rf.getAttribute("data-val");for(var n=0;n<rp.length;n++){rp[n].classList.toggle("sel",rp[n]===rf);}}}else if(v.clearRoom){sel.room="";}}' +
    // ★空きの結果を画面に反映（開始時間・所要時間・カウンセリングの有無を変えるたびに呼ぶ）。
    // ★選べる物が1つも無くなったら、見出しの右に赤い知らせを出す（2026-08-21 まるちゃん）。
    'function nrShowNone(g,id){var el=document.getElementById(id);if(!el)return;var pl=document.querySelectorAll(".nrpill[data-grp=\\""+g+"\\"]"),h=[];' +
    'for(var i=0;i<pl.length;i++){h.push(pl[i].style.display==="none");}el.style.display=NR.noneLeft(h)?"inline":"none";}' +
    'function applyAvail(av){if(!av)return;var cw=document.getElementById("cosmosWarn"),cwho=document.getElementById("cosmosWho");' +
    // ★カウンセリングの部屋（コスモス）がふさがっている時は、1つ目のカウンセリングの枠の中に知らせを出し、
    //   その枠の所要時間・担当を選べないようにする（2026-08-23 まるちゃん）。
    // ★枠ごとに選ぶ形の時、コスモスの空きは「カウンセリングの枠が実際に始まる時刻」で見る（下の nrSlotAvail）。
    'if(cw)cw.style.display=NR.cosmosWarnOutside(av,window.__nrSlots,window.__nrNeedCounsel,sel.needc)?"":"none";' + 'if(cwho)cwho.textContent=av.cosmos_busy_text?("（"+av.cosmos_busy_text+"）"):"";' +
    // ★2026-08-24 まるちゃん「コスモスが埋まってますの知らせが、1つ目の枠の中と一番下の2か所に出る」。
    //   原因＝この2行が逆さまだった（先に「枠があるから出さない」と隠したのに、次の行が
    //   埋まり具合でまた出し直していた）。パソコン版と同じ「出し入れを決めたあとに隠す」順番にそろえる。
    //   ★この2行の順番を入れ替えないこと。
    
    'nrHideBusy("room",av.occ_rooms);nrHideBusy("staff",av.busy_staff);nrHideBusy("counsel",av.busy_counsel_staff);nrMayuVis();' +
    'nrShowNone("counsel","noneCounsel");nrShowNone("staff","noneStaff");nrShowNone("room","noneRoom");nrSlotAvail();nrGoCheck();}' +
    // ★枠ごとに「その枠の時間に空いている担当・部屋」だけを出す（2つ目の枠は1つ目の後に始まる）。
    'function nrSlotAvail(){var S=window.__nrSlots;if(!NR.perSlot(S))return;var d=window.__rvdt;if(!d||!window.__nrDate)return;' +
    // ★枠ごとの「始まる時刻」の積み上げは共通の1本（NR）に聞く＝パソコン版と必ず同じ答えになる。
    'var durs=[];for(var q=0;q<S.length;q++){durs.push(sel["dur#"+q]);}' +
    'var PLAN=NR.slotStarts(S,durs,Number(d.hh)*60+Number(d.mi),sel.needc);' +
    'window.__nrAvPending=true;nrGoCheck();' +          // ★答えが揃うまでは押させない

    'function hhmm(m){var h=Math.floor(m/60),i2=m%60;return h+"時"+(i2<10?"0":"")+i2+"分";}' +
    'function step(i,pos){if(i>=S.length){window.__nrAvPending=false;nrGoCheck();return;}' +
    'var pp=PLAN[i];var isC=pp.isCounsel,du=pp.dur;pos=pp.startMin;' +
    'if(pp.skip){step(i+1,pos);return;}' +
    'jsonp({action:"submit",key:KEY,op:"new_availability",who:idn.who,role:idn.role,device:idn.device,' +
    'fields:JSON.stringify({date:window.__nrDate,start_min:pos,dur:du,need_counsel:(isC?"1":"0")})},function(r){' +
    'if(!r||!r.ok||!r.id){step(i+1,pos+du);return;}var n=0;' +
    // ★2026-08-24 まるちゃん：あきらめるまでを 30回(約54秒)→100回(約3分)に伸ばした。
    //   事務所パソコン側は空きの計算に120秒まで許しているので、30回で先にあきらめると
    //   答えが出ているのにその枠だけ「埋まっている担当・部屋を消す」処理が抜け落ちる（黙って抜ける）。
    //   ★片方だけ短いままにしないこと（8/24の「変換中のまま止まる」と同じ種類の穴）。
    '(function pw(){n++;if(n>100){step(i+1,pos+du);return;}' +
    'jsonp({action:"status",key:KEY,id:r.id},function(x){if(!x||!x.ok){step(i+1,pos+du);return;}' +
    'if(x.status==="pending"||x.status==="running"||x.status==="queued"||x.status===""){setTimeout(pw,700);return;}' +
    'if(x.status==="done"){var av={};try{av=JSON.parse(x.result||"{}");}catch(e){}' +
    'if(av&&av.ok){if(isC){var bx=document.querySelectorAll("#nrSlotWrap .nrslot")[i],w=document.getElementById("cosWarn"+i);' +
    'if(w){w.textContent="⚠ この時間（"+hhmm(pos)+"〜）、カウンセリングの部屋（コスモス）がうまっています。"' +
    '+(av.cosmos_busy_text?("（"+av.cosmos_busy_text+"）"):"")+" 上の「開始時間」を変えるか、やる順番を変えてください。";' +
    'w.style.display=av.cosmos_busy?"":"none";}' +
    'if(bx){if(av.cosmos_busy){bx.classList.add("nrlock");}else{bx.classList.remove("nrlock");}}' +
    'nrHideBusy("staff#"+i,av.busy_counsel_staff);nrShowNone("staff#"+i,"noneStaff"+i);}' +
    'else{nrHideBusy("room#"+i,av.occ_rooms);nrHideBusy("staff#"+i,av.busy_staff);' +
    'nrShowNone("staff#"+i,"noneStaff"+i);nrShowNone("room#"+i,"noneRoom"+i);}}nrGoCheck();}' +
    'step(i+1,pos+du);});})();});}' +
    'step(0,0);}' +
    // ★カウンセリングの必要（④）で、カウンセリング担当（⑤）の出し入れをする。
    // ★判断は共通の1本（NR）に聞く。ここは答えを画面に当てはめるだけ（2026-08-24）。
    'function nrApplyNeedC(){var v=NR.needCounselView(window.__nrSlots,window.__nrNeedCounsel,sel.needc);' +
    'var sn=document.getElementById("secNeedC");if(sn)sn.style.display=v.needCSec?"":"none";' +
    'var sc=document.getElementById("secCounsel");if(sc)sc.style.display=v.counselSec?"":"none";' +
    'if(v.rebuildOrder){var S=window.__nrSlots||[],rows=document.querySelectorAll("#nrSlotWrap .nrslot");' +
    'for(var y=0;y<S.length;y++){if(S[y].kind==="counsel"&&rows[y])rows[y].style.display=v.counselSlotShown?"":"none";}' +
    'buildOrderUI();}' +
    'if(!v.counselSec&&!v.rebuildOrder){var cw2=document.getElementById("cosmosWarn");if(cw2)cw2.style.display="none";}}' +
    // ★開始時間「〇月〇日（水）〇時〇分」を出す。
    'function nrStartText(){return NR.startText(window.__rvdt,window.__nrWd,!!window.__nrTimeMissing);}' +
    // ★決まっていない枠があれば「この内容で登録する」を押せなくする（2026-08-24 まるちゃん決定）。
    //   ＝登録の処理は空き具合を見ないので、押せると同じ部屋に二重で予約が入ってしまう。
    //   何が決まっていないかの判断は共通の1本（NR.canRegister）に聞く＝パソコン版と必ず同じ。
    'function nrShownPills(g){var a=document.querySelectorAll(".nrpill[data-grp=\\""+g+"\\"]"),o=[];for(var i=0;i<a.length;i++){if(a[i].style.display!=="none")o.push(a[i]);}return o;}' +
    'function nrAnySel(g){var a=nrShownPills(g);for(var i=0;i<a.length;i++){if(a[i].classList.contains("sel"))return true;}return false;}' +
    'function nrGoCheck(){var btn=document.getElementById("nrgo"),ngbox=document.getElementById("nrGoNg");if(!btn)return;' +
    'var S=window.__nrSlots||[],rows=[];' +
    'if(NR.perSlot(S)){var bx=document.querySelectorAll("#nrSlotWrap .nrslot");' +
    'for(var i=0;i<S.length;i++){if(S[i].kind==="counsel"&&sel.needc==="no")continue;' +
    'var b=bx[i];if(b&&b.style.display==="none")continue;' +
    'rows.push({name:(i+1)+"つ目："+(S[i].label||"施術"),locked:!!(b&&b.className.indexOf("nrlock")>=0),' +
    'staffOk:nrAnySel("staff#"+i),roomNeeded:(S[i].kind!=="counsel"),roomOk:nrAnySel("room#"+i)});}}' +
    'else{var needC=(window.__nrNeedCounsel&&sel.needc!=="no");' +
    'if(needC)rows.push({name:"カウンセリング",locked:false,staffOk:nrAnySel("counsel"),roomNeeded:false,roomOk:true});' +
    'rows.push({name:"施術",locked:false,staffOk:nrAnySel("staff"),roomNeeded:!window.__nrMayu,roomOk:nrAnySel("room")});}' +
    'var r=NR.canRegister(rows,!!window.__nrAvPending,!!window.__nrTimeMissing,(prevEl?prevEl.value:""),{gender:!sel.gender,tw:!sel.tw});window.__nrCanReg=r;btn.disabled=!r.ok;' +
    'if(ngbox){ngbox.textContent=r.msg;ngbox.style.display=r.ok?"none":"";}' +
    // ★担当か部屋が決まらない＝中身が確定しないので、タイトルは出さない（判断は共通の1本に聞く）。
    'var tv=NR.titleView(r),tsec=document.getElementById("secTitle");' +
    'if(tsec&&!tv.shown)tsec.style.display="none";' +
    'if(tv.shown&&!titleEdited)refreshTitles();}' +
    'function nrShowStart(){var e=document.getElementById("nrStartDisp");if(e)e.textContent=nrStartText();}' +
    // ★開始時間・所要時間・カウンセリングの有無が変わったら、空きを見直す（事務所PCに聞く）。
    'var nrAvTimer=null;function nrScheduleAvail(){if(nrAvTimer)clearTimeout(nrAvTimer);nrAvTimer=setTimeout(function(){nrRecheckAvail();},300);}' +
    'var nrAvPolls=0;function nrRecheckAvail(done){var d=window.__rvdt;if(!d||!window.__nrDate){if(done)done();return;}' +
    'var need=(!!window.__nrNeedCounsel&&sel.needc!=="no")?"1":"0";' +
    'jsonp({action:"submit",key:KEY,op:"new_availability",who:idn.who,role:idn.role,device:idn.device,' +
    'fields:JSON.stringify({date:window.__nrDate,start_min:(Number(d.hh)*60+Number(d.mi)),dur:Number(sel.dur||60),need_counsel:need})},' +
    'function(r){if(!r||!r.ok||!r.id){if(done)done();return;}nrAvPolls=0;setTimeout(function(){nrAvPoll(r.id,done);},700);});}' +
        // ★2026-08-24（再点検で見つけた穴）：30回×0.7秒＝約54秒であきらめていたが、
    //   事務所パソコンは空きの計算に120秒まで許している＝**答えが出ているのに先にあきらめ**、
    //   その枠の「埋まっている担当・部屋を消す」が黙って抜け落ちていた（＝埋まっている人を選べる）。
    //   200回×0.7秒＝約6分に伸ばして、事務所パソコンより先にあきらめないようにした。
    //   ★事務所パソコン側の制限を伸ばす時は、ここも必ず一緒に伸ばすこと。
    'function nrAvPoll(id,done){nrAvPolls++;if(nrAvPolls>LIMITS.tries("new_availability",700)){if(done)done();return;}' +
    'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){if(done)done();return;}' +
    'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){nrAvPoll(id,done);},700);return;}' +
    'if(r.status!=="done"){if(done)done();return;}var av={};try{av=JSON.parse(r.result||"{}");}catch(e){}' +
    'if(av&&av.ok)applyAvail(av);if(done)done();});}' +
    // ★開始時間の「修正」＝月日時分を直して、空きと登録日時をやり直す。
    'function nrStartEditInit(){var row=document.getElementById("nrStartRow"),ed=document.getElementById("nrStartEdit");' +
    'var bFix=document.getElementById("btnStartFix"),bOk=document.getElementById("btnStartOk"),bNo=document.getElementById("btnStartCancel");' +
    'function gv(id){return document.getElementById(id);}' +
    'function open(){var d=window.__rvdt||{};gv("nrEdMM").value=(d.mm||"");gv("nrEdDD").value=(d.dd||"");gv("nrEdHH").value=(d.hh==null?"":d.hh);gv("nrEdMI").value=(d.mi==null?"":d.mi);' +
    'if(ed)ed.style.display="flex";if(row)row.style.display="none";}' +
    'function close(){if(ed)ed.style.display="none";if(row)row.style.display="flex";}' +
    'if(bFix)bFix.addEventListener("click",open);if(bNo)bNo.addEventListener("click",close);' +
    'if(bOk)bOk.addEventListener("click",function(){var mm=Number(gv("nrEdMM").value),dd=Number(gv("nrEdDD").value),hh=Number(gv("nrEdHH").value),mi=Number(gv("nrEdMI").value);' +
    'if(!(mm>=1&&mm<=12)||!(dd>=1&&dd<=31)||!(hh>=0&&hh<=23)||!(mi>=0&&mi<=59)){szPopup_("月日時分を正しく入れてください。");return;}' +
    'var y=window.__nrDate?Number(window.__nrDate.slice(0,4)):(new Date()).getFullYear();var dt=new Date(y,mm-1,dd);var today=new Date();today.setHours(0,0,0,0);' +
    'if((today-dt)>31*24*3600*1000){y+=1;dt=new Date(y,mm-1,dd);}' +
    'if(dt.getMonth()!==mm-1){szPopup_("その日付はありません。");return;}' +
    'window.__rvdt={mm:mm,dd:dd,hh:hh,mi:mi};window.__nrTimeMissing=false;' +
    'window.__nrDate=y+"-"+(mm<10?"0":"")+mm+"-"+(dd<10?"0":"")+dd;' +
    'window.__nrWd="日月火水木金土".charAt(dt.getDay());window.__nrSat=(dt.getDay()===6);' +
    'close();nrShowStart();nrRecheckAvail();if(window.__nrSchedTitle){titleEdited=false;window.__nrSchedTitle("staff");}});}' +
    // ★あとから作るボタン（枠ごとの所要時間・担当・部屋）も効くように、押した場所から拾う形にする。
    'document.addEventListener("click",function(ev){var b=(ev.target&&ev.target.closest)?ev.target.closest(".nrpill"):null;if(!b)return;' +
    'var g=b.getAttribute("data-grp"),v=b.getAttribute("data-val");if(!g)return;sel[g]=v;' +
    'var sib=document.querySelectorAll(".nrpill[data-grp=\\"" + g + "\\"]");for(var j=0;j<sib.length;j++)sib[j].classList.remove("sel");b.classList.add("sel");if(window.__nrSchedTitle)window.__nrSchedTitle(g);' +
    'if(g==="needc"){nrApplyNeedC();nrScheduleAvail();}else if(g==="dur"||g.indexOf("dur#")===0){nrScheduleAvail();}nrGoCheck();});' +
    // ★枠ごとの選び欄を作る（施術が2つ以上の時だけ）。
    'function buildSlotUI(slots){var wrap=document.getElementById("nrSlotWrap");' +
    'var dw=document.getElementById("secDurWrap"),sw=document.getElementById("secStaffWrap"),rw=document.getElementById("nrRoomWrap");' +
    'window.__nrSlots=slots||[];if(!wrap)return;' +
    // ★全体の③⑥⑦を出すかは共通の1本（NR）に聞く（2026-08-24）。
    'var o=NR.outerSectionsShown(window.__nrSlots);' +
    'if(dw)dw.style.display=o.dur?"":"none";if(sw)sw.style.display=o.staff?"":"none";if(rw)rw.style.display=o.room?"":"none";' +
    'if(!NR.perSlot(window.__nrSlots)){wrap.style.display="none";wrap.innerHTML="";return;}' +
    'var DU=[15,20,30,40,45,50,60,70,80,90,120,150];' +
    'var ST=[["2","🍊 みかん","#e08a1e"],["3","🫒 オリーブ","#4b8b3b"],["1","🍅 トマト","#d1443c"],["4","🥭 マンゴー","#c9a227"]];' +
    'var RM=[["FREEDOM","FREEDOM","#2ecc87"],["HAPPY","HAPPY","#e73b3b"],["LUCKY","LUCKY","#fdc02d"],["STAR/福/🇫🇷","STAR/福","#b38bdc"]];' +
    'function pl(g,v,l,c,on){var o=(c?" style=\\"background:"+c+"\\"":"");return "<button type=\\"button\\" class=\\"nrpill"+(c?"":" plain")+(on?" sel":"")+"\\" data-grp=\\""+g+"\\" data-val=\\""+v+"\\""+o+">"+l+"</button>";}' +
    'var h="";for(var i=0;i<slots.length;i++){var s=slots[i];' +
    'sel["dur#"+i]=String(s.dur||"30");sel["staff#"+i]=String(s.staff||"2");sel["room#"+i]=String(s.room||"FREEDOM");' +
    'var isC=(s.kind==="counsel");' +
    'var dp="";for(var a=0;a<DU.length;a++){dp+=pl("dur#"+i,DU[a],DU[a],"",String(DU[a])===String(s.dur));}' +
    'var STC=NR.slotStaffChoices(ST,isC);var sp="";for(var b2=0;b2<STC.length;b2++){sp+=pl("staff#"+i,STC[b2][0],STC[b2][1],STC[b2][2],STC[b2][0]===String(s.staff));}' +
    'var rp="";for(var c2=0;c2<RM.length;c2++){rp+=pl("room#"+i,RM[c2][0],RM[c2][1],RM[c2][2],RM[c2][0]===String(s.room));}' +
    'var ns="<span style=\\"display:none;margin-left:10px;color:#ff9b9b;font-weight:900;font-size:14px\\"";' +
    'h+="<div class=\\"nrslot\\"><div class=\\"nrsec\\">"+(i+1)+"つ目："+esc(s.label||"施術")+(isC?"（コスモス）":"")+"</div>"+(isC?("<div class=\\"nrcoswarn\\" id=\\"cosWarn"+i+"\\" style=\\"display:none\\"></div>"):"")' +
    '+"<div class=\\"nrsub\\">所要時間（分）</div><div class=\\"nrpills nrdur\\">"+dp+"</div>"' +
    '+"<div class=\\"nrsub\\">"+(isC?"カウンセリング担当":"施術担当")+ns+" id=\\"noneStaff"+i+"\\">その時間は担当者が空いていません</span></div><div class=\\"nrpills\\">"+sp+"</div>"' +
    '+(isC?"":("<div class=\\"nrsub\\">部屋"+ns+" id=\\"noneRoom"+i+"\\">その時間は部屋が空いていません</span></div><div class=\\"nrpills\\">"+rp+"</div>"))+"</div>";}' +
    'wrap.innerHTML=h;wrap.style.display="";buildOrderUI();}' +
    // ★やる順番（カウンセリングも含む）。上から順に登録される。「↑ 上へ」で入れ替える。
    'function buildOrderUI(){var sec=document.getElementById("secOrder"),lst=document.getElementById("nrOrderList");'  +
    // ★並べ方・入れ替え方の判断は共通の1本（NR）に聞く（2026-08-24）。
    'if(!sec||!lst)return;var o=NR.orderRows(window.__nrSlots);' +
    'if(!o.shown){sec.style.display="none";return;}sec.style.display="";' +
    'var h="";for(var i=0;i<o.rows.length;i++){var rr=o.rows[i];h+="<div class=\\"nrorow\\"><span class=\\"nrono\\">"+rr.no+"</span><span class=\\"nroname\\">"+esc(rr.name)+"</span>"' +
    '+(rr.canUp?("<button type=\\"button\\" class=\\"nroup\\" data-up=\\""+(rr.no-1)+"\\">↑ 上へ</button>"):"")+"</div>";}lst.innerHTML=h;' +
    'var bs=lst.querySelectorAll(".nroup");for(var j=0;j<bs.length;j++){bs[j].addEventListener("click",function(){' +
    'var i=Number(this.getAttribute("data-up")),S2=window.__nrSlots,keep=[];' +
    'for(var k=0;k<S2.length;k++){keep.push({dur:sel["dur#"+k],staff:sel["staff#"+k],room:sel["room#"+k]});}' +
    'var mv=NR.moveUp(S2,keep,i);window.__nrSlots=mv.slots;' +
    'buildSlotUI(window.__nrSlots);if(window.__nrSchedTitle)window.__nrSchedTitle("staff");nrScheduleAvail();});}}' +
    'nrStartEditInit();' +
    'function jsonp(params,onR){var cb="__nr"+Date.now()+Math.floor(Math.random()*1000);window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
    'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
    'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
    // ★★2026-08-24 まるちゃん決定：登録をあきらめるまでを 24秒 → 210秒 に伸ばした。
    //   0.6秒おきに40回＝24秒しか待っていなかったが、実データでは登録に最長66秒かかっている。
    //   24秒で「通信に失敗しました」と出すと、実際は登録が進んでいるのにスタッフが押し直し、
    //   **同じ予約を二重に作る**危険があった（0.6秒×350回＝210秒に変更）。
    'var polls=0;function poll(id){polls++;if(polls>350){szOvHide_();goEl.disabled=false;szPopup_("エラーが発生しました。通信に失敗しました。もう一度お試しください。");return;}' +
    'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){szOvHide_();goEl.disabled=false;szPopup_("エラーが発生しました。通信に失敗しました。もう一度お試しください。");return;}' +
    'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){poll(id);},600);return;}' +
    'if(r.status!=="done"){szOvHide_();goEl.disabled=false;szPopup_(esc(r.result)||"エラーが発生しました。りゅうさんにお伝えください。");return;}' +
    // ★事務所パソコンが返す文の後ろに、作った予約の住所が付いてくる＝「タイムツリーで見る」に使う（2026-08-23 まるちゃん）。
    'var _tt=(String(r.result||"").match(/https?:\\/\\/\\S+/)||[""])[0];' +
    'goEl.disabled=false;txtEl.value="";szOvShow_(szDoneHtml_("予約を登録しました","予約入力に戻る",_tt),"#16a34a");var _bb=document.getElementById("szDoneBack");if(_bb){_bb.addEventListener("click",function(){location.href="' + base + '?view=yoyaku' + roleSfx_(staff, dev) + '";});}});}' +
    // ★2026-08-24 まるちゃん決定：あきらめるまでの時間を60秒→210秒に伸ばした。
    //   事務所パソコン側の読み取りの制限が180秒（edit_worker.PREVIEW_TIMEOUT_SEC）なので、
    //   それより先にスマホがあきらめると、答えが出ているのに画面が「変換中」のまま止まる。
    //   ★片方だけ変えないこと（60秒のままだったのが8/24の詰まりの正体）。
    //   あわせて、待っている間は経過秒数を出す＝スタッフが「止まった」と思わずに済む。
    'var ppolls=0,prevT0=0;function pollPrev(id){ppolls++;' +
    'if(prevT0&&(Date.now()-prevT0)>210000){status("読み取りに時間がかかりすぎました。もう一度お試しください。",true);readEl.disabled=false;return;}' +
    'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){status("エラー："+((r&&r.error)||"不明"),true);readEl.disabled=false;return;}' +
    // ★2026-08-24 まるちゃん「処理中に予測時間を表示するのはむずかしい？」への答え。
    //   実績（読み取り34件）＝半分は9秒以内・4分の3は15秒以内・1割ほどが1分を超える。
    //   その実績どおりの見込みを、経過に合わせて出す（黙って待たせない）。
    'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){' +
    'var _es=prevT0?Math.round((Date.now()-prevT0)/1000):0;' +
    // ★2026-08-24 まるちゃん指定の言い回し。「用紙」では何を指すか分からないので「貼った内容」。
    'var _mg=(_es<15)?"変換中です。通常は10秒以内に終わります。"' +
    ':(_es<100)?"変換中です（"+_es+"秒）。貼った内容が読み取りにくいので、AIに問合せて調べています。数十秒かかる場合があります。"' +
    ':"変換中です（"+_es+"秒）。時間がかかっています。終わらなければ、もう一度お試しください。";' +
    'status(_mg,false);' +
    'setTimeout(function(){pollPrev(id);},700);return;}readEl.disabled=false;' +
    'if(r.status!=="done"){status(esc(r.result||"エラーが発生しました。"),true);return;}' +
    'var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}' +
    'if(!d.ok){status("読み取れませんでした："+esc(d.error||"日付・時刻が見つかりません"),true);return;}' +
    'prevEl.value=d.memo||"";selVal("dur",d.dur);if(d.staff)selVal("staff",d.staff);if(d.room)selVal("room",d.room);window.__rvdt={mm:d.mm,dd:d.dd,hh:d.hh,mi:d.mi};' +
    'var _mm=d.memo||"",_hasPro=(/procell/i.test(_mm)||/プロセル/.test(_mm)||/プロ肌|プロ頭|プロ(?!グラム)/.test(_mm)),_hasF=(/顔プロセル/.test(_mm)||/プロ肌/.test(_mm)),_hasS=(/頭皮プロセル/.test(_mm)||/プロ頭/.test(_mm));var _pa=document.getElementById("nrProcellAsk");if(_pa)_pa.style.display=(_hasPro&&!_hasF&&!_hasS)?"":"none";window.__procellWord=d.procell_face_word||"トライアル";var _pp=document.querySelector(\'[data-procell="顔プロセルPro"]\');if(_pp)_pp.textContent="顔プロセルPro "+window.__procellWord;var _pm=document.querySelector(\'[data-procell="顔プロセルMD"]\');if(_pm)_pm.textContent="顔プロセルMD "+window.__procellWord;window.__nrCouns=d.counseling||{kind:"3",hint:false,memos:{}};window.__nrApplyCouns(NR.counselingView(window.__nrCouns.kind,window.__nrCouns.hint,window.__nrCouns.has_hair));' +
    // ★2026-08-24 まるちゃん指摘「タイトルが後から表示される」＝ここではまだ画面に出さない。
    //   タイトルまで作り終えてから、下の refreshTitles の答えが返った所でまとめて1回だけ出す。
    'var sg=document.getElementById("secGender"),stw=document.getElementById("secTw");' +
    'if(d.gender){selVal("gender",d.gender);if(sg)sg.style.display="none";}else if(sg)sg.style.display="";' +  // 読めたら性別欄は隠す
    'if(d.tw){selVal("tw",d.tw);if(stw)stw.style.display="none";}else if(stw)stw.style.display="";' +          // 読めたら国籍欄は隠す
    'var scn=document.getElementById("secCounsel");if(scn)scn.style.display=d.datsumo?"":"none";' +            // カウンセリング担当は脱毛のときだけ
    // ★開始時間の欄に出す材料を覚える（2026-08-21 まるちゃん）。パソコン版と同じ作り。
    'window.__nrDate=d.date||"";window.__nrWd=d.weekday||"";window.__nrNeedCounsel=!!d.need_counsel;window.__nrTimeMissing=!!d.time_missing;' +
    'window.__nrMayu=(d.service_kind==="mayu"||d.service_kind==="matsuek");window.__nrSat=d.date?(new Date(d.date+"T00:00:00").getDay()===6):false;' +
    // ★2026-08-24 まるちゃん指摘「スマホだけ⑤カウンセリング担当が出る。1つ目でカウンセリング担当を
    //   選ぶので重複」。原因＝出す/隠すの判断(nrApplyNeedC)を、枠を組み立てる前にやっていたので
    //   「カウンセリングの枠がある」ことをまだ知らず、外の⑤を出してしまっていた。
    //   → パソコン版と同じ「枠を作ってから判断する」順番にそろえる。
    // ★読み取ったままの枠を覚えておく（①②③を押し直すたびに、ここから作り直す・2026-09-11 まるちゃん）。
    'window.__nrSlotsBase=[];for(var _b=0;_b<((d.slots||[]).length);_b++){var _o={},_s0=d.slots[_b];for(var _k0 in _s0){_o[_k0]=_s0[_k0];}window.__nrSlotsBase.push(_o);}' +
    'selVal("needc","yes");nrShowStart();buildSlotUI(d.slots);window.__nrCounsSlots(window.__nrCouns.kind);nrApplyNeedC();applyAvail(d);' +   // 開始時間を出す／埋まっている部屋・担当を消す／コスモスの注意書き

    // ★タイトルまで作り終えてから、まとめて1回だけ画面に出す（2026-08-24 まるちゃん）。
    //   タイトルが作れなかった時も必ずここへ来る＝画面が出ないままにはならない。
        // ★2026-08-24 まるちゃん「スマホだけ⑤カウンセリング担当がまだ出る」への保険。
    //   出す/隠すの判断を**画面を出す直前にもう一度**やる＝途中の順番や、あとから届く
    //   空きの答えで狂っても、出た瞬間の姿は必ず正しくなる（枠の中で選ぶ時は外の⑤を出さない）。
    'var _shown=false;function _showAll(){if(_shown)return;_shown=true;nrApplyNeedC();' +
    'prevWrap.style.display="";var rest=document.getElementById("nrrest");if(rest)rest.style.display="";' +
    'prevEl.style.height="auto";prevEl.style.height=(prevEl.scrollHeight+6)+"px";' +   // 全文が見えるよう欄を伸ばす
    'nrGoCheck();prevWrap.scrollIntoView({behavior:"smooth",block:"start"});' +                     // 変換後を画面の一番上へ
    'status("",false);}' +                                                             // 読み取り後の一言は出さない
    // ★万一タイトルの返事が返ってこなくても、20秒たったら他の欄だけは出す（画面が出ないままにしない）。
    'titleEdited=false;'+'if(d.titles&&d.titles.length){fillTitles(d.titles,d.disps||[]);_showAll();}'+'else{setTimeout(_showAll,20000);refreshTitles(_showAll);}});}' +
    'prevEl.addEventListener("input",function(){prevEl.style.height="auto";prevEl.style.height=(prevEl.scrollHeight+6)+"px";nrGoCheck();});' +
    'window.__nrApplyCouns=function(v){var box=document.getElementById("nrCounsAsk");if(!box)return;box.style.display=v.shown?"":"none";var lb=document.getElementById("nrCounsLabel");if(lb)lb.textContent=v.label;var wy=document.getElementById("nrCounsWhy"),why=(window.__nrCouns&&window.__nrCouns.why)||"";var _wt=NR.counselingWhy(why);if(wy){wy.textContent=_wt;wy.style.display=_wt?"":"none";}var bs=document.querySelectorAll("[data-couns]");for(var i=0;i<bs.length;i++){if(bs[i].getAttribute("data-couns")===String(v.sel))bs[i].classList.add("sel");else bs[i].classList.remove("sel");}};' +
    // ★①②③に合わせて枠を作り直す（判断は共通の1本 NR.counselingSlots・2026-09-11 まるちゃん決定）。
    //   ②相談してから決める＝相談の枠のあとに施術の枠も押さえる／①相談だけ＝施術の枠は作らない。
    'window.__nrCounsSlots=function(kind){if(!window.__nrSlotsBase)return;var B=[];for(var _i2=0;_i2<window.__nrSlotsBase.length;_i2++){var _o2={},_s2=window.__nrSlotsBase[_i2];for(var _k2 in _s2){_o2[_k2]=_s2[_k2];}B.push(_o2);}buildSlotUI(NR.counselingSlots(B,kind));nrApplyNeedC();nrSlotAvail();};' +
    'var _cab=document.querySelectorAll("[data-couns]");for(var _j=0;_j<_cab.length;_j++){_cab[_j].addEventListener("click",function(){var k=this.getAttribute("data-couns"),c=window.__nrCouns||{memos:{}};prevEl.value=NR.counselingMemo(c.memos,k,prevEl.value);prevEl.style.height="auto";prevEl.style.height=(prevEl.scrollHeight+6)+"px";c.kind=k;window.__nrApplyCouns(NR.counselingView(k,true,(window.__nrCouns?window.__nrCouns.has_hair:true)));window.__nrCounsSlots(k);nrGoCheck();if(window.__nrSchedTitle){titleEdited=false;window.__nrSchedTitle("staff");}});}' +
    'var _pab=document.querySelectorAll("[data-procell]");for(var _i=0;_i<_pab.length;_i++){_pab[_i].addEventListener("click",function(){var base=this.getAttribute("data-procell");var tw=(base==="頭皮プロセル")?"トライアル":(window.__procellWord||"トライアル");var sh=(base==="頭皮プロセル")?"プロ頭":(base==="顔プロセルPro"?"プロ肌Pro":"プロ肌MD");var full=sh+" "+tw.replace("キャンペーン","キャ").replace("トライアル","トラ");var lines=prevEl.value.split("\\n");for(var k=0;k<lines.length;k++){lines[k]=lines[k].replace(/(?:(?:顔|頭皮)?プロセル(?:セラピーズ)?|procell|プロ肌|プロ頭|プロ(?!グラム))(?:[ \\u3000]*(?:キャンペーントライアル|トライアル|キャトラ|トラ))?/gi,full);}prevEl.value=lines.join("\\n");prevEl.style.height="auto";prevEl.style.height=(prevEl.scrollHeight+6)+"px";var _pa=document.getElementById("nrProcellAsk");if(_pa)_pa.style.display="none";nrGoCheck();if(window.__nrSchedTitle){titleEdited=false;window.__nrSchedTitle("staff");}});}' +
    'function readGo(){var text=(txtEl.value||"").trim();if(!text){status("先に予約フォームを貼ってください。",true);return;}' +
    'readEl.disabled=true;prevT0=Date.now();status("変換中です。通常は10秒以内に終わります。",false);' +
    'jsonp({action:"submit",key:KEY,op:"preview_reservation",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({text:text})},' +
    'function(r){if(!r||!r.ok||!r.id){status("依頼を送れませんでした："+((r&&r.error)||"不明"),true);readEl.disabled=false;return;}setTimeout(function(){pollPrev(r.id);},400);});}' +
    'readEl.addEventListener("click",readGo);' +
    // 送る中身（貼った文＋選んだ担当/部屋/所要/性別/国籍。extra でタイトルの差し替えを足せる）。
    // ★「カウンセリング無し」を選んだ時は、カウンセリング担当を空で渡す＝枠を作らない（2026-08-21 まるちゃん）。
    'function buildFields(extra){var sl=null,S=window.__nrSlots;' +
    'if(S&&S.length>=2){sl=[];for(var q=0;q<S.length;q++){if(S[q].kind==="counsel"&&sel.needc==="no")continue;' +
    'sl.push({kind:(S[q].kind||"treat"),mark:(S[q].mark||""),label:(S[q].label||""),dur:sel["dur#"+q],staff:sel["staff#"+q],room:sel["room#"+q]});}if(sl.length<2)sl=null;}' +
    'var t0=null;if(sl){for(var w=0;w<sl.length;w++){if(sl[w].kind!=="counsel"){t0=sl[w];break;}}if(!t0)t0=sl[0];}' +
    // ★①相談だけ＝カウンセリングの枠が1つだけ残る。この時の担当は枠の中で選んだ人を渡す（2026-09-11）。
    'var _cs=(sel.needc==="no")?"":(NR.onlyCounselSlot(S)?(sel["staff#0"]||sel.counsel):sel.counsel);' +
    'var f={text:(txtEl.value||"").trim(),memo:(prevEl.value||""),dur:(t0?t0.dur:sel.dur),staff:(t0?t0.staff:sel.staff),counsel:_cs,room:(t0?t0.room:sel.room),gender:sel.gender,tw:sel.tw,rvdt:(window.__rvdt||null)};' +
    'if(sl)f.slots=JSON.stringify(sl);' +
    'if(extra){for(var k in extra){f[k]=extra[k];}}return f;}' +
    // 画面のタイトル欄に、いま登録されるタイトルを出す（人が手で直したら自動で上書きしない）。
    'var titleEdited=false,titleReq=0,_titleTimer=null;' +
    'function fillTitles(titles,disps){var wrap=document.getElementById("nrTitleWrap"),sec=document.getElementById("secTitle");if(!wrap||!sec)return;' +
    // ★担当・部屋が決まっていない間はタイトルを出さない（まるちゃん2026-08-25）。
    'if(!NR.titleView(window.__nrCanReg).shown){sec.style.display="none";return;}' +
    'var rows="";for(var i=0;i<titles.length;i++){rows+=\'<div style="color:#eaf3f7;font-weight:800;font-size:14px;margin:8px 2px 2px">\'+esc(disps[i]||("枠"+(i+1)))+\'</div><input class="nrTitleIn" value="\'+esc(titles[i]).replace(/"/g,"&quot;")+\'" style="width:100%;box-sizing:border-box;font:inherit;font-size:18px;font-weight:800;color:#0f172a;background:#fff;border:0;border-radius:12px;padding:14px 14px;margin:6px 0;box-shadow:0 2px 6px rgba(0,0,0,.12)">\';}wrap.innerHTML=rows;sec.style.display="";var ins=wrap.querySelectorAll(".nrTitleIn");for(var j=0;j<ins.length;j++){ins[j].addEventListener("input",function(){titleEdited=true;});}}' +
    // ★cb＝タイトルの答えが出た（または出せなかった）時に必ず1回呼ぶ後始末。読み取り直後は
    //   これで「まとめて1回だけ画面に出す」＝タイトルが後から出てこない（2026-08-24 まるちゃん）。
    //   どの終わり方（返事なし・失敗・待ちすぎ）でも呼ぶこと。呼び忘れると画面が出ないままになる。
    'var tpolls=0;function pollTitles(id,myReq,cb){tpolls++;if(tpolls>LIMITS.tries("preview_new_titles",400)){if(cb)cb();return;}jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){if(cb)cb();return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollTitles(id,myReq,cb);},400);return;}if(r.status!=="done"){if(cb)cb();return;}var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}if(!d||!d.ok){if(cb)cb();return;}if(myReq!==titleReq||titleEdited){if(cb)cb();return;}fillTitles(d.titles||[],d.disps||[]);if(cb)cb();});}' +
    'function refreshTitles(cb){if(titleEdited){if(cb)cb();return;}var text=(txtEl.value||"").trim();if(!text&&!(prevEl.value||"").trim()){if(cb)cb();return;}var myReq=++titleReq;tpolls=0;jsonp({action:"submit",key:KEY,op:"preview_new_titles",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(buildFields())},function(r){if(!r||!r.ok||!r.id){if(cb)cb();return;}setTimeout(function(){pollTitles(r.id,myReq,cb);},400);});}' +
    'function scheduleTitleRefresh(g){if(["staff","counsel","gender","tw","room"].indexOf(g)<0)return;if(_titleTimer)clearTimeout(_titleTimer);_titleTimer=setTimeout(function(){refreshTitles();},350);}' +
    'window.__nrSchedTitle=scheduleTitleRefresh;' +
    // 登録＝画面に出ている（人が直せる）タイトルをそのまま使う。
    'function go(){var text=(txtEl.value||"").trim();if(!text){status("予約フォームを貼ってください。",true);return;}' +
    'var ins=document.querySelectorAll(".nrTitleIn"),ts=[];for(var j=0;j<ins.length;j++){ts.push(ins[j].value);}' +
    'goEl.disabled=true;szOvShow_(szBusyHtml_("予約を登録中です"),"#2C7A99");' +
    'jsonp({action:"submit",key:KEY,op:"new_reservation",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(buildFields(ins.length?{titles:JSON.stringify(ts)}:null))},' +
    'function(r){if(!r||!r.ok||!r.id){szOvHide_();goEl.disabled=false;szPopup_("エラーが発生しました。通信に失敗しました。もう一度お試しください。");return;}setTimeout(function(){poll(r.id);},1200);});}' +
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
        '<div id="nrProcellAsk" style="display:none">' +
          '<div style="background:#7f1d1d;color:#fecaca;padding:12px 14px;border-radius:12px;font-weight:900;line-height:1.6;margin:6px 0">プロセルは どれですか？　下から選んでください。</div>' +
          '<div class="nrpills">' +
            '<button type="button" class="nrpill" data-procell="顔プロセルPro" style="background:#2563eb">顔プロセルPro</button>' +
            '<button type="button" class="nrpill" data-procell="顔プロセルMD" style="background:#0891b2">顔プロセルMD</button>' +
            '<button type="button" class="nrpill" data-procell="頭皮プロセル" style="background:#7c3aed">頭皮プロセル</button>' +
          '</div>' +
        '</div>' +
        // ★相談（カウンセリング）の回か＝AIが読んだ答えを初期値に出し、スタッフが押して直せる（2026-08-25 まるちゃん）
        '<div id="nrCounsAsk" style="display:none">' +
          '<div id="nrCounsLabel" style="background:#1e3a8a;color:#dbeafe;padding:12px 14px;border-radius:12px;font-weight:900;line-height:1.6;margin:6px 0"></div>' +
          '<div id="nrCounsWhy" style="display:none;color:#cbd5e1;font-size:14px;line-height:1.5;margin:0 2px 6px"></div>' +
          '<div class="nrpills">' +
            '<button type="button" class="nrpill" data-couns="1">①カウンセリングのみ（施術なし）</button>' +
            '<button type="button" class="nrpill" data-couns="2">②カウンセリング後に決める</button>' +
            '<button type="button" class="nrpill" data-couns="3">③施術もやる</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="nrrest" style="display:none">' +
        // ★開始時間の欄（2026-08-21 まるちゃん）＝「〇月〇日（水）〇時〇分」＋修正ボタン。パソコン版と同じ。
        '<div class="nrsec">② 開始時間</div>' +
        '<div id="nrStartRow" style="display:flex;align-items:center;gap:12px;background:#fff;color:#123;border-radius:12px;padding:12px 14px;font-size:19px;font-weight:900;margin:2px 0 6px">' +
          '<span id="nrStartDisp">―</span>' +
          '<button type="button" id="btnStartFix" style="border:0;border-radius:999px;padding:9px 18px;font-size:15px;font-weight:800;color:#fff;background:#2C7A99">修正</button>' +
        '</div>' +
        '<div id="nrStartEdit" style="display:none;align-items:center;gap:6px;flex-wrap:wrap;background:#fff;border-radius:12px;padding:12px 14px;margin:2px 0 6px">' +
          '<input type="number" id="nrEdMM" min="1" max="12" placeholder="月" style="width:70px;font-size:18px;font-weight:800;padding:8px;border-radius:10px;border:1px solid #cbd5e1;text-align:center"><span style="color:#123;font-weight:900;margin-right:6px">月</span>' +
          '<input type="number" id="nrEdDD" min="1" max="31" placeholder="日" style="width:70px;font-size:18px;font-weight:800;padding:8px;border-radius:10px;border:1px solid #cbd5e1;text-align:center"><span style="color:#123;font-weight:900;margin-right:6px">日</span>' +
          '<input type="number" id="nrEdHH" min="0" max="23" placeholder="時" style="width:70px;font-size:18px;font-weight:800;padding:8px;border-radius:10px;border:1px solid #cbd5e1;text-align:center"><span style="color:#123;font-weight:900;margin-right:6px">時</span>' +
          '<input type="number" id="nrEdMI" min="0" max="59" step="5" placeholder="分" style="width:70px;font-size:18px;font-weight:800;padding:8px;border-radius:10px;border:1px solid #cbd5e1;text-align:center"><span style="color:#123;font-weight:900;margin-right:6px">分</span>' +
          '<button type="button" id="btnStartOk" style="border:0;border-radius:999px;padding:9px 18px;font-size:15px;font-weight:800;color:#fff;background:#16a34a">決定</button>' +
          '<button type="button" id="btnStartCancel" style="border:0;border-radius:999px;padding:9px 18px;font-size:15px;font-weight:800;color:#fff;background:#64748b">やめる</button>' +
        '</div>' +
        // ★並び（2026-08-23 まるちゃん）＝先にカウンセリングの要不要 → 次に順番 → 最後に枠ごとの中身
        '<div id="secNeedC" style="display:none"><div class="nrsec">③ カウンセリングの必要</div><div class="nrpills">' +
        // ★カウンセリングが必要かどうかの2択（2026-08-21 まるちゃん）。既定＝必要あり。
          '<button type="button" class="nrpill sel" data-grp="needc" data-val="yes" style="background:#16a34a">必要あり</button>' +
          '<button type="button" class="nrpill" data-grp="needc" data-val="no" style="background:#475569">必要なし</button>' + '</div></div>' +
        '<div id="secOrder" style="display:none"><div class="nrsec">④ やる順番（上から順にやります）</div>' +
        '<div class="nrnote2">順番を変えたい物の「↑ 上へ」を押してください</div><div id="nrOrderList"></div></div>' +
        '<div id="secDurWrap"><div class="nrsec">③ 所要時間（分）</div><div class="nrpills nrdur">' + durPills + '</div></div>' +
        '<div id="nrSlotWrap" style="display:none"></div>' +
        '<div id="secCounsel" style="display:none"><div class="nrsec">⑤ カウンセリング担当' +
          '<span id="noneCounsel" style="display:none;margin-left:12px;color:#ff9b9b;font-weight:900;font-size:15px">その時間は担当者が空いていません</span></div>' +
          '<div class="nrpills">' + staffPills('counsel', '1', ['1', '2']) + '</div></div>' +
        '<div id="cosmosWarn" style="display:none;background:#fde2e4;color:#9b1c31;padding:12px 14px;border-radius:12px;font-weight:900;line-height:1.6;margin:2px 0 6px">⚠ カウンセリングの部屋（コスモス）が、この時間ふさがっています。<span id="cosmosWho"></span></div>' +
        '<div id="secStaffWrap"><div class="nrsec">⑥ 施術担当<span id="noneStaff" style="display:none;margin-left:12px;color:#ff9b9b;font-weight:900;font-size:15px">その時間は担当者が空いていません</span></div><div class="nrpills">' + staffPills('staff', '2') + '</div></div>' +
        '<div id="nrRoomWrap"><div class="nrsec">⑦ 部屋<span id="noneRoom" style="display:none;margin-left:12px;color:#ff9b9b;font-weight:900;font-size:15px">その時間は部屋が空いていません</span></div><div class="nrpills">' + roomPills + '</div></div>' +
        '<div id="secGender"><div class="nrsec">性別（タイトルに入ります）</div><div class="nrpills">' + genderPills + '</div></div>' +
        '<div id="secTw"><div class="nrsec">国籍</div><div class="nrpills">' + natPills + '</div></div>' +
        '<div id="secTitle" style="display:none"><div class="nrsec">タイムツリーに登録されるタイトル（直せます）</div><div id="nrTitleWrap"></div></div>' +
        '<div id="nrGoNg" class="nrwarn" style="display:none"></div>' +
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
  // 既存の予約（新規登録）画面用の担当・部屋・所要ボタン（別グループ rv* ＝変更画面の選択と混ざらない）。
  var rvDurP = '', rvStaffP = '', rvRoomP = '';
  for (var _rd = 0; _rd < DURS2.length; _rd++) { rvDurP += exp_('rvdur', DURS2[_rd], DURS2[_rd], '', true); }
  for (var _rs = 0; _rs < STAFF2.length; _rs++) { rvStaffP += exp_('rvstaff', STAFF2[_rs][0], STAFF2[_rs][1], STAFF2[_rs][2], false); }
  for (var _rr = 0; _rr < ROOMS2.length; _rr++) { rvRoomP += exp_('rvroom', ROOMS2[_rr][0], ROOMS2[_rr][1], ROOMS2[_rr][2], false); }
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
    '.rvbusy{color:#fecaca;background:#7f1d1d;border-radius:10px;padding:8px 12px;font-weight:800;font-size:15px;margin:6px 2px 0;}' +
    '.exp{border:0;border-radius:999px;padding:12px 18px;font-weight:800;font-size:16px;color:#fff;opacity:.6;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.15);}' +
    '.exp.plain{background:#475569;}' +
    '.exp.sel{opacity:1;outline:3px solid #fff;outline-offset:-3px;}' +
    '.exdur .exp{flex:0 0 calc((100% - 40px)/6);padding:12px 2px;text-align:center;box-sizing:border-box;}' +
    '.exmlist{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px;}' +
    '.exmbtn{display:block;width:100%;text-align:center;background:#fff;color:#0f172a;border:0;border-radius:14px;padding:16px 8px;font-size:19px;font-weight:900;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.12);}' +
    '.exmbtn:active{transform:translateY(1px);}' +
    '.exsum{background:rgba(255,255,255,.14);border-radius:12px;padding:12px 14px;margin:2px 0 12px;}' +
    '.exsumrow{color:#fff;font-size:16px;font-weight:800;line-height:1.6;margin:3px 0;}' +
    '.exsumrow b{display:inline-block;min-width:3.4em;color:#cfe6f0;font-weight:900;margin-right:6px;}' +
    '.exsumroom{display:inline-block;color:#fff;font-weight:900;font-size:15px;padding:2px 14px;border-radius:999px;vertical-align:middle;}' +
    '.exsummemo{color:#fff;font-size:14px;line-height:1.5;white-space:pre-wrap;background:rgba(0,0,0,.20);border-radius:8px;padding:8px 10px;margin-top:4px;max-height:110px;overflow:auto;}' +
    '.exmh{color:#fff;font-weight:900;font-size:19px;margin:6px 4px 8px;}' +
    '.exallday{display:block;width:100%;box-sizing:border-box;text-align:center;margin:14px 0 4px;background:#c0392b;color:#fff;border:0;border-radius:14px;padding:18px 10px;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.15);}' +
    '.exallday:active{transform:translateY(1px);}' +
    '#exmemobox{text-align:left;font-size:20px;line-height:1.6;height:300px;overflow:auto;resize:vertical;-webkit-overflow-scrolling:touch;}' +
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
    '.exdone{color:#fff;font-weight:800;font-size:20px;line-height:1.6;background:rgba(255,255,255,.14);border-radius:14px;padding:18px;margin-top:16px;}' +
    '.expk{display:block;width:100%;text-align:center;background:#fff;color:#0f172a;border:0;border-radius:16px;padding:22px 12px;font-size:26px;font-weight:900;margin:10px 0;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.12);white-space:nowrap;}' +
    '.expk.keep{font-size:22px;}' +
    '.expkroomS{display:inline-block;color:#fff;font-weight:900;font-size:20px;padding:5px 18px;border-radius:999px;vertical-align:middle;text-shadow:0 1px 2px rgba(0,0,0,.35);}' +
    '.expk:active{transform:translateY(1px);}' +
    '.expk.keep{background:#eafcf0;color:#166534;border:2px solid #16a34a;}' +
    '.expk.dis{opacity:.45;pointer-events:none;}' +
    '.expknote{color:#ffdede;font-size:16px;font-weight:800;line-height:1.6;margin:2px 0 12px;text-align:center;}' +
    '.extop{color:#fff;font-size:20px;font-weight:900;line-height:1.5;background:rgba(255,255,255,.16);border-radius:10px;padding:9px 13px;margin:2px 0 12px;}' +
    '.expkemo{font-size:1.5em;vertical-align:middle;margin-right:10px;}' +
    '.expkroom{display:inline-block;color:#fff;font-weight:900;font-size:26px;padding:8px 30px;border-radius:999px;vertical-align:middle;text-shadow:0 1px 2px rgba(0,0,0,.35);}' +
    '.exq{color:#fff;font-size:28px;font-weight:900;line-height:1.5;margin:14px 0 10px;background:#e0592b;border-radius:12px;padding:14px 14px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,.2);}' +
    '.exnone{color:#fff;font-size:23px;font-weight:900;line-height:1.6;margin:14px 0;background:#b91c1c;border-radius:12px;padding:20px 16px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,.2);}' +
    '.rvcard{background:#fff;color:#0f172a;border-radius:14px;padding:14px;margin:10px 0;box-shadow:0 4px 12px rgba(0,0,0,.12);}' +
    '.rvname{font-size:20px;font-weight:900;margin-bottom:10px;}' +
    '.rvbtns{display:flex;gap:8px;margin-bottom:10px;}' +
    '.rvb{flex:1;border:2px solid #cbd5e1;background:#f1f5f9;color:#334155;border-radius:10px;padding:12px 4px;font-size:15px;font-weight:900;cursor:pointer;}' +
    '.rvb.on{background:#16a34a;color:#fff;border-color:#16a34a;}' +
    '.rvcnt{display:flex;align-items:center;justify-content:center;gap:14px;}' +
    '.rvstep{width:46px;height:46px;border:0;border-radius:10px;background:#e2e8f0;color:#0f172a;font-size:24px;font-weight:900;cursor:pointer;}' +
    '.rvcv{font-size:20px;font-weight:900;min-width:110px;text-align:center;}' +
    '.rvcv.need{color:#e0592b;}' +
    '.exrvtitle{background:#fff;color:#0f172a;border-radius:12px;padding:14px;font-size:20px;font-weight:900;line-height:1.5;word-break:break-all;box-shadow:0 4px 12px rgba(0,0,0,.12);}' +
    'textarea.exrvtitleedit{width:100%;box-sizing:border-box;border:2px solid #93c5fd;resize:vertical;min-height:60px;font-family:inherit;}' +
    '.rvprevmemo{background:#f1f5f9;color:#0f172a;border:1px solid #cbd5e1;border-radius:12px;padding:12px 14px;font-size:15px;line-height:1.6;white-space:pre-wrap;word-break:break-word;max-height:220px;overflow-y:auto;}' +
    'textarea.rvmemoedit{width:100%;box-sizing:border-box;height:260px;max-height:none;resize:vertical;border:2px solid #93c5fd;font-family:inherit;}' +
    '.rvslot{background:rgba(255,255,255,.06);border:2px solid #334155;border-radius:14px;padding:12px 14px;margin:10px 0;}' +
    '.rvslottop{color:#fff;font-weight:900;font-size:19px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,.15);}' +
    '.rvslotk{color:#cbd5e1;font-weight:800;font-size:15px;margin:10px 2px 6px;}' +
    '.rvsug{display:block;width:100%;text-align:left;background:#eff6ff;color:#1e3a8a;border:2px solid #93c5fd;border-radius:12px;padding:12px 14px;font-size:17px;font-weight:900;margin:6px 0;cursor:pointer;}' +
    '.rvwhy{display:block;color:#475569;font-size:13px;font-weight:700;margin-top:4px;}';
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
      (isChange ? '<button class="exgo" id="exNewCust" style="background:#7c3aed;margin-top:8px">新規のお客様（番号なし）から選ぶ</button>' : '') +
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
      '<div class="extop"></div>' +
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
      '<div class="extop"></div>' +
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
      '<div class="extop"></div>' +
      '<div class="hhead"><span class="bmark">✏️</span><span class="bname">変更内容</span></div>' +
      '<div class="exwho1" id="exeditwho"></div>' +
      '<div id="secDur"><div class="exsec">施術時間（分）</div><div class="expills exdur" id="edur">' + durP + '</div></div>' +
      '<div id="secStaff"><div class="exsec">施術担当</div><div class="expills" id="estaff">' + staffP + '</div></div>' +
      '<div id="secRoom"><div class="exsec">部屋</div><div class="expills" id="eroom">' + roomP + '</div></div>' +
      '<div class="exnone" id="exeditnone" style="display:none"></div>' +
      '<button class="exgo" id="exEditGo">この内容に変更する→</button>' +
      '<div class="exdone" id="exdone3" style="display:none"></div>' +
    '</div>';
  var menuSec =
    '<div id="exMenu" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackMenu" href="javascript:void(0)">← 前に戻る</a></div>' +
      '<div class="extop"></div>' +
      '<div class="exsum" id="exmsum"></div>' +
      '<div class="exmh">変更する内容を選択</div>' +
      '<div class="exmlist">' +
        '<button class="exmbtn" data-chg="dt">日付＆時間</button>' +
        '<button class="exmbtn" data-chg="t">時間（同日内）</button>' +
        '<button class="exmbtn" data-chg="staff">担当</button>' +
        '<button class="exmbtn" data-chg="room">部屋</button>' +
        '<button class="exmbtn" data-chg="dur">施術時間</button>' +
        '<button class="exmbtn" data-chg="memo">予約メモ</button>' +
      '</div>' +
      '<button class="exallday" id="exAllDay">この予約を終日にする</button>' +
    '</div>';
  var memoSec =
    '<div id="exMemo" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackMemo" href="javascript:void(0)">← 前に戻る</a></div>' +
      '<div class="extop"></div>' +
      '<div class="hhead"><span class="bmark">📝</span><span class="bname">予約メモを変更</span></div>' +
      '<div class="exwho1" id="exmemowho"></div>' +
      '<textarea class="exbox" id="exmemobox" rows="6"></textarea>' +
      '<button class="exgo" id="exMemoGo">この内容に変更する→</button>' +
      '<div class="exdone" id="exdone4" style="display:none"></div>' +
    '</div>';
  // 日付・時刻を移す時だけ出す「担当を変更しますか？」「部屋を変更しますか？」画面（押したらすぐ次へ進む）。
  var staffPickSec =
    '<div id="exStaffPick" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackStaffPick" href="javascript:void(0)">← 前に戻る</a></div>' +
      '<div class="extop"></div>' +
      '<div class="exwho1" id="exspwho"></div>' +
      '<div id="exsplist"></div>' +
    '</div>';
  var roomPickSec =
    '<div id="exRoomPick" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackRoomPick" href="javascript:void(0)">← 前に戻る</a></div>' +
      '<div class="extop"></div>' +
      '<div class="exwho1" id="exrpwho"></div>' +
      '<div id="exrplist"></div>' +
    '</div>';
  // 既存の予約（既存客の次回予約＝前回コピー）の入力画面。
  var resvSec =
    '<div id="exResv" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackResv" href="javascript:void(0)">← 前に戻る</a></div>' +
      '<div class="exwho1" id="exrvwho"></div>' +
      '<div id="exrvprev"></div>' +
      '<div class="exmh">今回の施術内容</div>' +
      '<div id="exrvitems"></div>' +
      '<div id="exrvsuggest"></div>' +
      '<div id="exrvnew"></div>' +
      '<button type="button" class="exgo" id="exrvAddBtn" style="background:#2563eb;margin:8px 0 4px">＋ 別の施術を足す</button>' +
      '<div id="exrvsingle">' +
        '<div class="exsec">施術担当</div><div class="mvng" id="exrvstaffnone" style="display:none">その時間に空いている担当がいません</div><div class="rvbusy" id="exrvstaffbusy" style="display:none">前回と同じ担当はこの時間は空いていません。空いている人から選んでください。</div><div class="expills" id="exrvstaff">' + rvStaffP + '</div>' +
        '<div class="exsec">部屋</div><div class="mvng" id="exrvroomnone" style="display:none">その時間に空いている部屋がありません</div><div class="rvbusy" id="exrvroombusy" style="display:none">前回と同じ部屋はこの時間は空いていません。空いている部屋から選んでください。</div><div class="expills" id="exrvroom">' + rvRoomP + '</div>' +
        '<div class="exsec">施術時間（分）</div><div class="expills exdur" id="exrvdur">' + rvDurP + '</div>' +
      '</div>' +
      '<div class="exsec">タイトルの印</div><div class="expills" id="exrvmarks"></div>' +
      '<div class="exsec">末尾</div><div class="expills" id="exrvsuf">' +
        '<button type="button" class="exp" data-suf="__none" style="background:#475569">なし</button>' +
        '<button type="button" class="exp" data-suf="dochi" style="background:#475569">都度</button>' +
        '<button type="button" class="exp" data-suf="eyelight" style="background:#475569">イーライト</button>' +
      '</div>' +
      '<div id="exrvslots" style="display:none"></div>' +
      '<div class="exsec">タイトル（実際に付く名前・手で直せます）</div><textarea class="exrvtitle exrvtitleedit" id="exrvtitle"></textarea>' +
      '<div class="exsec">今回のメモ（登録される実際のメモ・手で直せます）</div><textarea class="rvprevmemo rvmemoedit" id="exrvnowmemo">（作成中…）</textarea>' +
      '<button class="exgo" id="exResvGo">この内容で登録する</button>' +
    '</div>';
  // 「別の施術を足す」で開く、決まったメニュー一覧から選ぶ画面。
  var resvMenuSec =
    '<div id="exrvMenu" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exrvMenuBack" href="javascript:void(0)">← 前に戻る</a></div>' +
      '<div class="hhead"><span class="bmark">➕</span><span class="bname">足す施術を選ぶ</span></div>' +
      '<input class="exbox" id="exrvMenuSearch" style="font-size:20px;text-align:left;letter-spacing:normal" placeholder="さがす（例：ハイドラ）">' +
      '<div id="exrvMenuList"></div>' +
    '</div>';
  var script = '<script>(function(){' +
    'var TITLE=' + JSON.stringify(title) + ';' +
    'var prefix="M",digits="";' +
    'var today=new Date();var calY=today.getFullYear(),calM=today.getMonth(),picked=null;' +
    'var ISCHANGE=' + (isChange ? 'true' : 'false') + ';var EXEC="' + EXEC + '",KEY="' + KEY + '";var chosen=null;' +
    'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
    'function esc(s){return (s==null?"":String(s));}' +
    'function jsonp(params,onR){var cb="__ck"+Date.now()+Math.floor(Math.random()*1000);window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
    // ★2026-08-24：あきらめるまでを 24秒 → 210秒（0.6秒×350回）。事務所パソコンが混んでいる時に
    //   出来ているのに「時間切れ」と出ていた。
    'var lpolls=0;function pollPicks(id){lpolls++;if(lpolls>350){document.getElementById("expickst").textContent="時間切れです。事務所パソコンが動いているかご確認ください。";return;}jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){document.getElementById("expickst").textContent="エラー："+((r&&r.error)||"不明");return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollPicks(id);},600);return;}if(r.status!=="done"){document.getElementById("expickst").textContent=esc(r.result||"エラー");return;}var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}renderPicks((d.reservations)||[]);});}' +
    'function loadPicks(){isNewCust=false;document.getElementById("exNum").style.display="none";document.getElementById("exPick").style.display="";document.getElementById("expickwho").textContent="「"+disp()+"」の予約";document.getElementById("expicklist").innerHTML="";document.getElementById("expickst").textContent="予約をさがしています…（10秒ほどかかります）";window.scrollTo(0,0);jsonp({action:"submit",key:KEY,op:"customer_reservations",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({number:disp()})},function(r){if(!r||!r.ok||!r.id){document.getElementById("expickst").textContent="依頼を送れませんでした："+((r&&r.error)||"不明");return;}setTimeout(function(){pollPicks(r.id);},500);});}' +
    'function renderPicks(list){var el=document.getElementById("expicklist");document.getElementById("expickst").textContent=list.length?"":(isNewCust?"番号なしの新規のお客様の予約が見つかりません。":"この番号の予約が見つかりません。");document.getElementById("expickwho").textContent=isNewCust?"新規のお客様（番号なし）":("「"+disp()+"」"+((list.length&&list[0].name)?list[0].name+"様":"の予約"));var h="";for(var i=0;i<list.length;i++){var r=list[i];var pm=(r.parts||[]).join("・")||"—";var past=r.is_past?"（過去）":"";var rk=roomVal(r.room);var rc=(typeof roomColor_==="function")?roomColor_(rk):"#64748b";var rn=(typeof shortRoomName_==="function")?shortRoomName_(rk):rk;var nameLine=isNewCust?("<span class=\\"pname\\" style=\\"font-weight:900\\">お名前："+esc(r.name||"?")+"</span>"):"";h+="<button class=\\"expickrow\\" data-i=\\""+i+"\\">"+nameLine+"<span class=\\"pd\\">"+past+r.date+" "+r.start_hm+" "+(r.dur_min||"")+"分</span><span class=\\"pm\\">担当 "+esc(r.staff_emoji||"?")+"　<span class=\\"proom\\" style=\\"background:"+rc+"\\">"+esc(rn)+"</span></span><span class=\\"ppart\\">施術部位："+esc(pm)+"</span></button>";}el.innerHTML=h;window.__PICKS=list;var rows=el.querySelectorAll(".expickrow");for(var j=0;j<rows.length;j++){(function(k){rows[k].addEventListener("click",function(){chosen=window.__PICKS[k];showMenu();});})(j);}}' +
    'var isNewCust=false;' +
    'function loadNewPicks(){isNewCust=true;document.getElementById("exNum").style.display="none";document.getElementById("exPick").style.display="";document.getElementById("expickwho").textContent="新規のお客様（番号なし）";document.getElementById("expicklist").innerHTML="";document.getElementById("expickst").textContent="新規のお客様の予約をさがしています…（10秒ほどかかります）";window.scrollTo(0,0);jsonp({action:"submit",key:KEY,op:"new_customer_reservations",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({})},function(r){if(!r||!r.ok||!r.id){document.getElementById("expickst").textContent="依頼を送れませんでした："+((r&&r.error)||"不明");return;}setTimeout(function(){pollPicks(r.id);},500);});}' +
    'function goDate(){hideSteps();document.getElementById("exDate").style.display="";document.getElementById("exwho").textContent="日付を選んでください";calY=today.getFullYear();calM=today.getMonth();drawCal();window.scrollTo(0,0);}' +
    'function disp(){return (prefix||"")+digits;}' +
    'function upd(){document.getElementById("exdisp").value=disp();}' +
    'var seg=document.getElementById("exseg"),sb=seg.querySelectorAll("button"),thumb=seg.querySelector(".thumb");' +
    'function selSeg(i){for(var j=0;j<sb.length;j++)sb[j].setAttribute("aria-pressed",j===i);thumb.style.transform="translateX("+(i*100)+"%)";prefix=sb[i].getAttribute("data-v");upd();}' +
    'for(var i=0;i<sb.length;i++){(function(k){sb[k].addEventListener("click",function(){selSeg(k);});})(i);}' +
    'document.getElementById("expad").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;var k=b.getAttribute("data-k");if(k==="clr"){digits="";selSeg(2);return;}if(k==="del"){if(digits){digits=digits.slice(0,-1);}else{selSeg(2);return;}}else if(/^[0-9]$/.test(b.textContent)&&digits.length<4){digits+=b.textContent;}upd();});' +
    'var box=document.getElementById("exdisp");' +   /* 白BOX＝貼り付けもでき、パッド入力も表示する */
    'box.addEventListener("input",function(){var m=(box.value||"").toUpperCase().replace(/\\s/g,"").match(/^([MF]?)([0-9]{0,4})/);if(!m){return;}digits=m[2];selSeg(m[1]==="M"?0:(m[1]==="F"?1:2));});' +
    'function drawCal(){var wd=["月","火","水","木","金","土","日"];document.getElementById("exct").textContent=calY+"年 "+(calM+1)+"月";var h="";for(var i=0;i<7;i++){h+="<div class=\\"exwd"+(i===5?" sat":i===6?" sun":"")+"\\">"+wd[i]+"</div>";}var first=new Date(calY,calM,1);var off=(first.getDay()+6)%7;var dim=new Date(calY,calM+1,0).getDate();for(var b=0;b<off;b++){h+="<div class=\\"exday blank\\"></div>";}var t0=new Date(today.getFullYear(),today.getMonth(),today.getDate());for(var d=1;d<=dim;d++){var dow=(off+d-1)%7;var cls="exday";if(dow===5){cls+=" sat";}if(dow===6){cls+=" sun";}var cur=new Date(calY,calM,d);if(calY===today.getFullYear()&&calM===today.getMonth()&&d===today.getDate()){cls+=" today";}if(cur<t0){cls+=" past";}if(picked&&picked.getFullYear()===calY&&picked.getMonth()===calM&&picked.getDate()===d){cls+=" picked";}h+="<button class=\\""+cls+"\\" data-d=\\""+d+"\\">"+d+"</button>";}document.getElementById("exgrid").innerHTML=h;}' +
    'document.getElementById("exToDate").addEventListener("click",function(){if(!digits){szPopup_("お客様番号を入れてください");return;}if(ISCHANGE){loadPicks();}else{goDate();}});' +
    '(function(){var _nc=document.getElementById("exNewCust");if(_nc)_nc.addEventListener("click",function(){loadNewPicks();});})();' +
    'document.getElementById("exbackPick").addEventListener("click",function(){document.getElementById("exPick").style.display="none";document.getElementById("exNum").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exbackDate").addEventListener("click",function(){document.getElementById("exDate").style.display="none";document.getElementById(ISCHANGE?"exMenu":"exNum").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exprev").addEventListener("click",function(){calM--;if(calM<0){calM=11;calY--;}drawCal();});' +
    'document.getElementById("exnext").addEventListener("click",function(){calM++;if(calM>11){calM=0;calY++;}drawCal();});' +
    'document.getElementById("exgrid").addEventListener("click",function(e){var b=e.target.closest("button.exday");if(!b||b.className.indexOf("blank")>=0)return;var d=parseInt(b.getAttribute("data-d"),10);picked=new Date(calY,calM,d);drawCal();document.getElementById("exDate").style.display="none";document.getElementById("exTime").style.display="";var wd=["日","月","火","水","木","金","土"][picked.getDay()];document.getElementById("exwhen").innerHTML="<div class=\\"exwd2\\">"+(calM+1)+"月"+d+"日（"+wd+"）</div>";tdig=initTdig_();tupd();window.scrollTo(0,0);});' +
    'var tdig="";' +
    'function initTdig_(){if(!ISCHANGE)return "";var t0=String((chosen&&chosen.start_hm)||"").replace(":","");return /^[0-9]{4}$/.test(t0)?t0:"";}' +
    'function tdisp(){if(!tdig){return "";}if(tdig.length<4){return tdig;}return tdig.slice(0,2)+":"+tdig.slice(2);}' +
    'function tupd(){document.getElementById("extime").value=tdisp();}' +
    'document.getElementById("extpad").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;var k=b.getAttribute("data-k");if(k==="clr"){tdig="";}else if(k==="del"){tdig=tdig.slice(0,-1);}else if(/^[0-9]$/.test(b.textContent)&&tdig.length<4){tdig+=b.textContent;}tupd();});' +
    'document.getElementById("exbackTime").addEventListener("click",function(){document.getElementById("exTime").style.display="none";document.getElementById(chgtype==="t"?"exMenu":"exDate").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exToDone").addEventListener("click",function(){if(tdig.length<4){szPopup_("時刻を4ケタで入れてください（例 1230）");return;}if(ISCHANGE){startPickFlow();}else{startExistingReserve();}});' +
    // ── 既存の予約（新規登録＝前回コピー）：材料を取り込み→内容を選んで→登録 ──
    'var rvctx=null,rvitems=[],rvsel={staff:"",room:"",dur:""};' +
    'function startExistingReserve(){var nd=picked;var ymd=nd.getFullYear()+"-"+("0"+(nd.getMonth()+1)).slice(-2)+"-"+("0"+nd.getDate()).slice(-2);var tm=tdig.slice(0,2)+":"+tdig.slice(2);exOvShow_(szBusyHtml_("前回の予約を読み込み中です"),"#2C7A99");jsonp({action:"submit",key:KEY,op:"existing_build_ctx",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({number:disp(),date:ymd,time:tm})},function(r){if(!r||!r.ok||!r.id){exOvHide_();szPopup_("エラーが発生しました。通信に失敗しました。もう一度お試しください。");return;}pollBuildCtx(r.id,ymd,tm);});}' +
    'function pollBuildCtx(id,ymd,tm){jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){exOvHide_();szPopup_("エラーが発生しました。もう一度お試しください。");return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollBuildCtx(id,ymd,tm);},700);return;}if(r.status!=="done"){exOvHide_();szPopup_(esc(r.result)||"エラーが発生しました。りゅうさんにお伝えください。");return;}var p={};try{p=JSON.parse(r.result||"{}");}catch(e){}if(!p.ctx_name){exOvHide_();szPopup_("材料を受け取れませんでした。もう一度お試しください。");return;}jsonp({action:"data",name:p.ctx_name},function(ctx){exOvHide_();if(!ctx||!ctx.found){szPopup_("「"+disp()+"」の前回の予約が見つかりません。");return;}rvctx=ctx;rvctx._ymd=ymd;rvctx._tm=tm;showResvEdit();});});}' +
    'var rvMarkOv={},rvEyeOv=null,rvDochi=false,rvNewItems=[],rvTitleOv=null,rvMemoOv=null;' +
    'var _rvcat="",_rvsub="";' +
    'function showResvEdit(){hideSteps();document.getElementById("exResv").style.display="";document.getElementById("exrvwho").innerHTML="「"+disp()+"」"+(rvctx.name?rvctx.name+"様":"")+"<br>"+rvctx._ymd+" "+rvctx._tm+" に予約";var _pe=document.getElementById("exrvprev");if(_pe){var _pn=rvctx.prev_note||"";_pe.innerHTML=_pn?("<div class=\\"exsec\\">前回の予約メモ"+(rvctx.prev_date?("（"+esc(rvctx.prev_date)+" "+esc(rvctx.prev_time||"")+"）"):"")+"</div><div class=\\"rvprevmemo\\">"+esc(_pn)+"</div>"):"";}rvitems=(rvctx.items||[]).map(function(it){return {line_no:it.line_no,name:it.name,arinashi:it.arinashi,count:(it.proposed!=null?it.proposed:it.count),orig:it.count,do:true,finish:false,mark:it.mark||""};});rvMarkOv={};rvEyeOv=null;rvNewItems=[];rvSlotCfg={};rvTitleOv=null;rvMemoOv=null;rvDochi=((rvctx.prev_title||"").indexOf("都度")>=0);drawRvItems();rvDrawSuggest();rvDrawNew();rvsel.staff=staffNum(rvctx.prev_staff||"");rvsel.room=roomVal(rvctx.prev_room||"");rvsel.dur=String(nearDur(rvctx.prev_dur||30));rvSelPill("rvstaff",rvsel.staff);rvSelPill("rvroom",rvsel.room);rvSelPill("rvdur",rvsel.dur);rvDrawMarks();rvLoadAvail();window.scrollTo(0,0);}' +
    'function rvDoingTexts(){var a=[];for(var i=0;i<rvitems.length;i++){if(rvitems[i].do&&!rvitems[i].finish)a.push(rvitems[i].name);}for(var k=0;k<rvNewItems.length;k++){var n=rvNewItems[k];a.push((n==="ハイドラ"&&!rvDidPart("hydra"))?"ハイドラ トライアル":n);}return a;}' +
    'function rvBookingTexts(){var a=[];for(var i=0;i<rvitems.length;i++){if(rvitems[i].do&&!rvitems[i].finish)a.push(rvitems[i].name);}for(var k=0;k<rvNewItems.length;k++){var n=rvNewItems[k];a.push((n==="ハイドラ"&&!rvDidPart("hydra"))?"ハイドラ トライアル":n);}return a;}' +
    'function rvDrawSuggest(){var sg=(rvctx.suggest||[]);var h="";for(var i=0;i<sg.length;i++){var nm=sg[i].name;if(rvNewItems.indexOf(nm)>=0)continue;h+="<button type=\\"button\\" class=\\"rvsug\\" data-sug=\\""+esc(nm)+"\\">＋ "+esc(nm)+"<span class=\\"rvwhy\\">LINE："+esc((sg[i].why||"").slice(0,40))+"</span></button>";}var el=document.getElementById("exrvsuggest");el.innerHTML=h?("<div class=\\"exsec\\">LINEでのご希望</div>"+h):"";}' +
    'function rvDrawNew(){var h="";for(var i=0;i<rvNewItems.length;i++){h+="<div class=\\"rvcard\\"><div class=\\"rvname\\">◉ "+esc(rvNewItems[i])+"（今回から）</div><button type=\\"button\\" class=\\"rvb\\" data-newdel=\\""+i+"\\" style=\\"background:#fde2e4;color:#9b1c31;border-color:#f3b4bd\\">やめる</button></div>";}var el=document.getElementById("exrvnew");el.innerHTML=h?("<div class=\\"exsec\\">今回から始める施術</div>"+h):"";}' +
    'function rvAddItem(nm){if(!nm)return;if(rvNewItems.indexOf(nm)<0)rvNewItems.push(nm);rvDrawSuggest();rvDrawNew();rvDrawMarks();}' +
    'document.getElementById("exrvsuggest").addEventListener("click",function(e){var b=e.target.closest("[data-sug]");if(!b)return;rvAddItem(b.getAttribute("data-sug"));});' +
    'document.getElementById("exrvnew").addEventListener("click",function(e){var b=e.target.closest("[data-newdel]");if(!b)return;rvNewItems.splice(parseInt(b.getAttribute("data-newdel"),10),1);rvDrawSuggest();rvDrawNew();rvDrawMarks();});' +
    'document.getElementById("exrvAddBtn").addEventListener("click",function(){showRvMenu("");});' +
    'function showRvMenu(q){hideSteps();_rvcat="";_rvsub="";document.getElementById("exrvMenu").style.display="";document.getElementById("exrvMenuSearch").value=q||"";drawRvMenuList(q||"");window.scrollTo(0,0);}' +
    'function rvDidPart(pc){return (((rvctx&&rvctx.ledger_parts)||[]).indexOf(pc)>=0);}' +
    'function rvAutoName(a){if(a==="parisienne")return rvDidPart("lash")?"パリジェンヌラッシュリフトリペア":"パリジェンヌラッシュリフト";if(a==="hydra")return "ハイドラ";return "";}' +
    'function rvAutoHint(a){if(a==="parisienne")return rvDidPart("lash")?"リペア":"初回";if(a==="hydra")return rvDidPart("hydra")?"通常":"トライアル";return "";}' +
    'function rvItemBtnH(nm){return "<button type=\\"button\\" class=\\"pickrow\\" data-mn=\\""+esc(nm)+"\\" style=\\"text-align:left;font-size:19px\\">"+esc(nm)+"</button>";}' +
    'function drawRvMenuList(q){q=(q||"").toLowerCase();var bk=document.getElementById("exrvMenuBack");var cats=(rvctx.menu_cats||[]);var el=document.getElementById("exrvMenuList");var h="";' +
      'if(q){var ms=(rvctx.menus||[]);for(var i=0;i<ms.length;i++){var nm=ms[i].name;if(nm.toLowerCase().indexOf(q)<0)continue;h+=rvItemBtnH(nm);}if(bk)bk.textContent="← 前に戻る";el.innerHTML=h||"<div class=\\"exhint\\">見つかりません</div>";return;}' +
      'if(!_rvcat){for(var c=0;c<cats.length;c++){h+="<button type=\\"button\\" class=\\"pickrow\\" data-rvcat=\\""+esc(cats[c].key)+"\\" style=\\"text-align:left;font-size:21px;font-weight:700\\">"+esc(cats[c].label)+"</button>";}if(bk)bk.textContent="← 前に戻る";el.innerHTML=h;return;}' +
      'var cc=null;for(var c2=0;c2<cats.length;c2++){if(cats[c2].key===_rvcat){cc=cats[c2];break;}}if(!cc){_rvcat="";drawRvMenuList("");return;}' +
      'if(cc.groups){if(!_rvsub){for(var g=0;g<cc.groups.length;g++){var gg=cc.groups[g];h+="<button type=\\"button\\" class=\\"pickrow\\" data-rvsub=\\""+esc(gg.label)+"\\" style=\\"text-align:left;font-size:20px;font-weight:700\\">"+esc(gg.label)+"<span style=\\"color:#94a3b8;font-size:14px;margin-left:8px\\">"+gg.items.length+"件</span></button>";}if(bk)bk.textContent="← カテゴリー";el.innerHTML=h;return;}var gsel=null;for(var g2=0;g2<cc.groups.length;g2++){if(cc.groups[g2].label===_rvsub){gsel=cc.groups[g2];break;}}if(!gsel){_rvsub="";drawRvMenuList("");return;}for(var it=0;it<gsel.items.length;it++){h+=rvItemBtnH(gsel.items[it]);}if(bk)bk.textContent="← "+cc.label;el.innerHTML=h;return;}' +
      'if(cc.auto){var nm2=rvAutoName(cc.auto);var hint=rvAutoHint(cc.auto);h="<button type=\\"button\\" class=\\"pickrow\\" data-mn=\\""+esc(nm2)+"\\" style=\\"text-align:left;font-size:20px\\">"+esc(cc.label)+"<span style=\\"color:#22c55e;font-size:15px;margin-left:10px\\">（"+esc(hint)+"）</span></button>";if(bk)bk.textContent="← カテゴリー";el.innerHTML=h;return;}' +
      'var items=(cc.items||[]);for(var i2=0;i2<items.length;i2++){h+=rvItemBtnH(items[i2]);}if(bk)bk.textContent="← カテゴリー";el.innerHTML=h;}' +
    'document.getElementById("exrvMenuSearch").addEventListener("input",function(){drawRvMenuList(this.value);});' +
    'document.getElementById("exrvMenuList").addEventListener("click",function(e){var cb=e.target.closest("[data-rvcat]");if(cb){_rvcat=cb.getAttribute("data-rvcat");_rvsub="";drawRvMenuList("");return;}var sb=e.target.closest("[data-rvsub]");if(sb){_rvsub=sb.getAttribute("data-rvsub");drawRvMenuList("");return;}var b=e.target.closest("[data-mn]");if(!b)return;rvAddItem(b.getAttribute("data-mn"));_rvcat="";_rvsub="";hideSteps();document.getElementById("exResv").style.display="";window.scrollTo(0,document.body.scrollHeight);});' +
    'document.getElementById("exrvMenuBack").addEventListener("click",function(){var sq=document.getElementById("exrvMenuSearch");if(sq&&sq.value){sq.value="";drawRvMenuList("");return;}if(_rvsub){_rvsub="";drawRvMenuList("");return;}if(_rvcat){_rvcat="";drawRvMenuList("");return;}hideSteps();document.getElementById("exResv").style.display="";window.scrollTo(0,0);});' +
    'function rvAutoMarkOn(mk){for(var k=0;k<rvitems.length;k++){if(rvitems[k].do&&!rvitems[k].finish&&rvitems[k].mark===mk)return true;}var tm=(rvctx.title_marks||[]);var words=[];for(var i=0;i<tm.length;i++){if(tm[i][0]===mk){words=tm[i][1]||[];break;}}var doing=rvDoingTexts().join(" ");for(var j=0;j<words.length;j++){if(doing.indexOf(words[j])>=0)return true;}return false;}' +
    'function rvMarkOn(mk){return (mk in rvMarkOv)?rvMarkOv[mk]:rvAutoMarkOn(mk);}' +
    'function rvEffMarks(){var tm=(rvctx.title_marks||[]);var out=[];for(var i=0;i<tm.length;i++){if(rvMarkOn(tm[i][0]))out.push(tm[i][0]);}return out;}' +
    'function rvAutoEye(){return false;}' +
    'function rvEyeOn(){return (rvEyeOv==null)?rvAutoEye():rvEyeOv;}' +
    'function rvSuffix(){return (rvDochi?"都度":"")+(rvEyeOn()?"イーライト":"");}' +
    'function rvStripHead(h){h=String(h||"");var managed=["🇫🇷","🍯","🌿","👑","福:","福：","福"];for(var i=0;i<managed.length;i++){h=h.split(managed[i]).join("");}h=h.replace(/[\\u2600-\\u27bf\\ufe0f\\u200d]/g,"").replace(/[\\u{1F300}-\\u{1FAFF}]/gu,"");return h.replace(/^[\\s:：]+/,"").replace(/[\\s:：]+$/,"");}' +
    'function rvTitle(){var t=(rvctx.prev_title||"").split("新規").join("");var a=t.indexOf("預約");if(a<0&&disp())a=t.indexOf(disp());if(a<0)a=t.length;var head=rvStripHead(t.slice(0,a));var rest=t.slice(a);return (SEMO_[rvsel.staff]||"")+rvEffMarks().join("")+head+rest+rvSuffix();}' +
    'function rvDrawMarks(){var tm=(rvctx.title_marks||[]);var h="<button type=\\"button\\" class=\\"exp"+((rvEffMarks().length===0)?" sel":"")+"\\" data-mark=\\"__none\\" style=\\"background:#475569\\">なし</button>";for(var i=0;i<tm.length;i++){var mk=tm[i][0];if(mk==="🌿")continue;h+="<button type=\\"button\\" class=\\"exp"+(rvMarkOn(mk)?" sel":"")+"\\" data-mark=\\""+esc(mk)+"\\" style=\\"background:#475569\\">"+esc(mk)+"</button>";}document.getElementById("exrvmarks").innerHTML=h;var sf=document.querySelectorAll("#exrvsuf .exp");for(var j=0;j<sf.length;j++){var k=sf[j].getAttribute("data-suf");sf[j].classList.toggle("sel",(k==="__none")?(!rvDochi&&!rvEyeOn()):((k==="dochi")?rvDochi:rvEyeOn()));}var tt=document.getElementById("exrvtitle");if(tt&&rvTitleOv==null)tt.value=rvTitle();rvDrawSlots();rvUpdateNowMemo();}' +
    'var _nowMemoT=null;function rvUpdateNowMemo(){if(_nowMemoT)clearTimeout(_nowMemoT);_nowMemoT=setTimeout(rvUpdateNowMemoDo,700);}' +
    'function rvUpdateNowMemoDo(){var el=document.getElementById("exrvnowmemo");if(!el||!rvctx)return;var decisions=[];for(var i=0;i<rvitems.length;i++){var it=rvitems[i];decisions.push({line_no:it.line_no,do:it.do,count:it.count,finish:it.finish});}var fields={new_memo:rvctx.new_memo||"",decisions:decisions,new_items:rvNewItems.slice(),date:rvctx._ymd,time:rvctx._tm,booking_services:rvBookingTexts()};jsonp({action:"submit",key:KEY,op:"existing_apply_memo",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(fields)},function(r){if(!r||!r.ok||!r.id){return;}var tries=0;(function pll(){tries++;if(tries>60){var el3=document.getElementById("exrvnowmemo");if(el3&&rvMemoOv==null)el3.value="（時間がかかっています。もう一度お試しください）";return;}jsonp({action:"status",key:KEY,id:r.id},function(st){if(!st||!st.ok)return;if(st.status==="pending"||st.status==="running"||st.status==="queued"||st.status===""){setTimeout(pll,500);return;}if(st.status!=="done")return;var d={};try{d=JSON.parse(st.result||"{}");}catch(e){}var el2=document.getElementById("exrvnowmemo");if(el2&&rvMemoOv==null)el2.value=(d&&d.ok)?(d.memo||""):"（メモを作れませんでした）";});})();});}' +
    // ★複数枠：印が2つ以上なら印ごとに1枠。枠ごとに部屋・担当・分を選び、時間は続けて自動で並べる。
    'var rvSlotCfg={},rvLastSlotCount=0;' +
    'function rvSlotCfg_(mk){if(!rvSlotCfg[mk])rvSlotCfg[mk]={room:rvsel.room,staff:rvsel.staff,dur:rvsel.dur};return rvSlotCfg[mk];}' +
    'function rvSlotTitle_(mk,st){var t=(rvctx.prev_title||"").split("新規").join("");var a=t.indexOf("預約");if(a<0&&disp())a=t.indexOf(disp());if(a<0)a=t.length;var head=rvStripHead(t.slice(0,a));var rest=t.slice(a);return (SEMO_[st]||"")+(mk||"")+head+rest+rvSuffix();}' +
    'function rvDrawSlots(){var effM=rvEffMarks();var multi=(effM.length>=2);var single=document.getElementById("exrvsingle");var slotsEl=document.getElementById("exrvslots");var titleEl=document.getElementById("exrvtitle");var go=document.getElementById("exResvGo");if(!slotsEl)return;if(!multi){if(single)single.style.display="";slotsEl.style.display="none";slotsEl.innerHTML="";if(titleEl)titleEl.style.display="";if(go)go.textContent="この内容で登録する";return;}if(single)single.style.display="none";if(titleEl)titleEl.style.display="none";var SC={"1":"#d1443c","2":"#e08a1e","3":"#4b8b3b","4":"#c9a227"};var SORD=["2","3","1","4"];var RORD=["FREEDOM","HAPPY","LUCKY","STAR/福/🇫🇷"];var DUR=[15,20,30,40,45,50,60,70,80,90,120,150];var tmp=(rvctx._tm||"00:00").split(":");var acc=parseInt(tmp[0],10)*60+parseInt(tmp[1],10);var h="<div class=\\"exsec\\">枠を分けて登録（印ごとに1枠・時間は続けて自動で並びます）</div>";for(var i=0;i<effM.length;i++){var mk=effM[i];var cf=rvSlotCfg_(mk);var hh=Math.floor(acc/60),mm=acc%60;var stt=("0"+hh).slice(-2)+":"+("0"+mm).slice(-2);var rp="";for(var r=0;r<RORD.length;r++){var rk=RORD[r];rp+="<button type=\\"button\\" class=\\"exp"+(rk===cf.room?" sel":"")+"\\" data-rvslot=\\""+esc(mk)+"\\" data-rvsg=\\"room\\" data-rvsv=\\""+esc(rk)+"\\" style=\\"background:"+roomColor_(rk)+"\\">"+shortRoomName_(rk)+"</button>";}var sp="";for(var s=0;s<SORD.length;s++){var sn=SORD[s];sp+="<button type=\\"button\\" class=\\"exp"+(sn===cf.staff?" sel":"")+"\\" data-rvslot=\\""+esc(mk)+"\\" data-rvsg=\\"staff\\" data-rvsv=\\""+sn+"\\" style=\\"background:"+SC[sn]+"\\">"+SEMO_[sn]+" "+SNM_[sn]+"</button>";}var dp="";for(var d=0;d<DUR.length;d++){dp+="<button type=\\"button\\" class=\\"exp plain"+(String(DUR[d])===String(cf.dur)?" sel":"")+"\\" data-rvslot=\\""+esc(mk)+"\\" data-rvsg=\\"dur\\" data-rvsv=\\""+DUR[d]+"\\">"+DUR[d]+"</button>";}h+="<div class=\\"rvslot\\"><div class=\\"rvslottop\\">"+(i+1)+"枠目　印「"+esc(mk)+"」　開始 "+stt+(i>0?"（自動）":"")+"</div><div class=\\"rvslotk\\">部屋</div><div class=\\"expills\\">"+rp+"</div><div class=\\"rvslotk\\">担当</div><div class=\\"expills\\">"+sp+"</div><div class=\\"rvslotk\\">施術時間（分）</div><div class=\\"expills exdur\\">"+dp+"</div><div class=\\"exrvtitle\\" style=\\"margin-top:8px\\">"+(i+1)+"枠目："+esc(rvSlotTitle_(mk,cf.staff))+"</div></div>";acc+=parseInt(cf.dur,10)||30;}slotsEl.innerHTML=h;slotsEl.style.display="";if(go)go.textContent="この内容で"+effM.length+"枠を登録する";}' +
    'document.getElementById("exrvslots").addEventListener("click",function(e){var b=e.target.closest("[data-rvslot]");if(!b)return;var cf=rvSlotCfg_(b.getAttribute("data-rvslot"));cf[b.getAttribute("data-rvsg")]=String(b.getAttribute("data-rvsv"));rvDrawSlots();});' +
    'document.getElementById("exrvmarks").addEventListener("click",function(e){var b=e.target.closest(".exp");if(!b)return;rvTitleOv=null;var mk=b.getAttribute("data-mark");if(mk==="__none"){var tm=(rvctx.title_marks||[]);for(var i=0;i<tm.length;i++){rvMarkOv[tm[i][0]]=false;}}else{rvMarkOv[mk]=!rvMarkOn(mk);}rvDrawMarks();});' +
    'document.getElementById("exrvsuf").addEventListener("click",function(e){var b=e.target.closest(".exp");if(!b)return;rvTitleOv=null;var k=b.getAttribute("data-suf");if(k==="__none"){rvDochi=false;rvEyeOv=false;}else if(k==="dochi"){rvDochi=!rvDochi;}else{rvEyeOv=!rvEyeOn();}rvDrawMarks();});' +
    'function drawRvItems(){var h="";for(var i=0;i<rvitems.length;i++){var it=rvitems[i];var cv=(it.do?it.count:it.orig);var cnt=(cv==null?"【要確認】":cv+"回目");h+="<div class=\\"rvcard\\" data-i=\\""+i+"\\"><div class=\\"rvname\\">"+esc(it.name)+"</div><div class=\\"rvbtns\\"><button class=\\"rvb"+((it.do&&!it.finish)?" on":"")+"\\" data-act=\\"do\\">今回やる</button><button class=\\"rvb"+((!it.do&&!it.finish)?" on":"")+"\\" data-act=\\"skip\\">今回やらない</button><button class=\\"rvb"+(it.finish?" on":"")+"\\" data-act=\\"fin\\">終わった</button></div><div class=\\"rvcnt\\"><button class=\\"rvstep\\" data-act=\\"dec\\">−</button><span class=\\"rvcv"+(cv==null?" need":"")+"\\">"+cnt+"</span><button class=\\"rvstep\\" data-act=\\"inc\\">＋</button></div></div>";}if(!rvitems.length){h="<div class=\\"exnone\\" style=\\"background:rgba(255,255,255,.14)\\">前回のメモに施術が見つかりません</div>";}document.getElementById("exrvitems").innerHTML=h;}' +
    'function rvSelPill(g,v){var pl=document.querySelectorAll(".exp[data-eg=\\""+g+"\\"]");for(var i=0;i<pl.length;i++){pl[i].classList.toggle("sel",pl[i].getAttribute("data-ev")===String(v));}}' +
    // ★前回コピーでも担当・部屋は「その時間に空いている人・部屋だけ」出す（二重予約防止・まるちゃん2026-08-08）。
    'var rvAvail=null;' +
    'function rvStartMin_(){var t=(rvctx._tm||"00:00").split(":");return parseInt(t[0],10)*60+parseInt(t[1],10);}' +
    'function rvLoadAvail(){rvAvail=null;var dur=parseInt(rvsel.dur,10)||30;jsonp({action:"submit",key:KEY,op:"availability",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({date:rvctx._ymd,start_min:rvStartMin_(),dur:dur,exclude_number:disp()})},function(r){if(!r||!r.ok||!r.id)return;rvPollAvail(r.id);});}' +
    'function rvPollAvail(id){jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok)return;if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){rvPollAvail(id);},600);return;}if(r.status!=="done")return;var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}if(d&&d.ok){rvAvail={free_staff:(d.free_staff||[]).map(String),free_rooms:(d.free_rooms||[]).map(String)};rvFilterAvail();}});}' +
    'function rvStaffFree_(n){return !rvAvail||rvAvail.free_staff.indexOf(String(n))>=0;}' +
    'function rvRoomFree_(k){return !rvAvail||rvAvail.free_rooms.indexOf(String(k))>=0;}' +
    'function rvFilterAvail(){if(!rvAvail)return;var fs=rvAvail.free_staff,fr=rvAvail.free_rooms;var sp=document.querySelectorAll("#exrvstaff .exp");for(var i=0;i<sp.length;i++){sp[i].style.display=(fs.indexOf(sp[i].getAttribute("data-ev"))<0)?"none":"";}var rp=document.querySelectorAll("#exrvroom .exp");for(var j=0;j<rp.length;j++){rp[j].style.display=(fr.indexOf(rp[j].getAttribute("data-ev"))<0)?"none":"";}var sn=document.getElementById("exrvstaffnone");if(sn)sn.style.display=(fs.length===0)?"":"none";var rn=document.getElementById("exrvroomnone");if(rn)rn.style.display=(fr.length===0)?"":"none";var sb=document.getElementById("exrvstaffbusy");if(sb)sb.style.display=(fs.length>0&&!rvStaffFree_(rvsel.staff))?"":"none";var rb=document.getElementById("exrvroombusy");if(rb)rb.style.display=(fr.length>0&&!rvRoomFree_(rvsel.room))?"":"none";}' +
    'document.getElementById("exrvitems").addEventListener("click",function(e){var card=e.target.closest(".rvcard");if(!card)return;var i=parseInt(card.getAttribute("data-i"),10);var it=rvitems[i];var act=e.target.getAttribute("data-act");if(!act)return;if(act==="do"){it.do=true;it.finish=false;}else if(act==="skip"){it.do=false;it.finish=false;}else if(act==="fin"){it.finish=true;it.do=false;}else if(act==="dec"){it.count=(it.count==null?1:Math.max(1,it.count-1));}else if(act==="inc"){it.count=(it.count==null?1:it.count+1);}rvTitleOv=null;drawRvItems();rvDrawMarks();});' +
    'document.getElementById("exrvstaff").addEventListener("click",function(e){var b=e.target.closest(".exp");if(!b)return;rvTitleOv=null;rvsel.staff=b.getAttribute("data-ev");rvSelPill("rvstaff",rvsel.staff);rvDrawMarks();});' +
    'document.getElementById("exrvtitle").addEventListener("input",function(){rvTitleOv=this.value;});' +
    'document.getElementById("exrvnowmemo").addEventListener("input",function(){rvMemoOv=this.value;});' +
    'document.getElementById("exrvroom").addEventListener("click",function(e){var b=e.target.closest(".exp");if(!b)return;rvsel.room=b.getAttribute("data-ev");rvSelPill("rvroom",rvsel.room);});' +
    'document.getElementById("exrvdur").addEventListener("click",function(e){var b=e.target.closest(".exp");if(!b)return;rvsel.dur=b.getAttribute("data-ev");rvSelPill("rvdur",rvsel.dur);rvLoadAvail();});' +
    'document.getElementById("exbackResv").addEventListener("click",function(){hideSteps();document.getElementById("exTime").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exResvGo").addEventListener("click",function(){if(rvEffMarks().length>=2){doRegisterMulti();}else{doRegister();}});' +
    'function doRegister(){if(rvAvail&&(!rvStaffFree_(rvsel.staff)||!rvRoomFree_(rvsel.room))){szPopup_("その時間に空いている担当・部屋を選んでください。");return;}var decisions=[];for(var i=0;i<rvitems.length;i++){var it=rvitems[i];decisions.push({line_no:it.line_no,do:it.do,count:it.count,finish:it.finish});}var doing=rvDoingTexts();var roomKey=(rvsel.room==="STAR/福/🇫🇷")?"STAR":rvsel.room;var fields={number:disp(),date:rvctx._ymd,time:rvctx._tm,dur:parseInt(rvsel.dur,10)||30,room_key:roomKey,prev_title:rvctx.prev_title||"",staff_emoji:SEMO_[rvsel.staff]||"",doing_texts:doing,suffix:rvSuffix(),marks:rvEffMarks(),new_memo:rvctx.new_memo||"",decisions:decisions,new_items:rvNewItems.slice(),booking_services:rvBookingTexts(),title_override:(rvTitleOv!=null?rvTitleOv:""),memo_override:(rvMemoOv!=null?rvMemoOv:"")};exOvShow_(szBusyHtml_("予約を登録中です"),"#2C7A99");jsonp({action:"submit",key:KEY,op:"existing_create",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(fields)},function(r){if(!r||!r.ok||!r.id){exOvHide_();szPopup_("エラーが発生しました。通信に失敗しました。もう一度お試しください。");return;}pollRegister(r.id,roomKey);});}' +
    'function pollRegister(id,roomKey){jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){exOvHide_();szPopup_("エラーが発生しました。もう一度お試しください。");return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollRegister(id,roomKey);},500);return;}if(r.status!=="done"){exOvHide_();szPopup_(esc(r.result)||"エラーが発生しました。りゅうさんにお伝えください。");return;}var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}var _al=ttAlias_(roomKey),_tt=_al?("https://timetreeapp.com/calendars/"+_al+"/events/"+(d.event_id||"")):"";exOvShow_("<div style=\\"font-size:92px;margin-bottom:16px;\\">✓</div><div style=\\"color:#fff;font-size:32px;font-weight:900;line-height:1.5;margin-bottom:24px;\\">予約を登録しました</div><button type=\\"button\\" id=\\"rvBack\\" style=\\"font:inherit;font-size:1.3rem;font-weight:800;color:#16a34a;background:#fff;border:0;border-radius:12px;padding:14px 26px;cursor:pointer;\\">予約入力に戻る</button>"+(_tt?"<button type=\\"button\\" id=\\"rvTt\\" style=\\"display:block;margin:14px auto 0;font:inherit;font-size:1.05rem;font-weight:800;color:#fff;background:rgba(255,255,255,.18);border:2px solid #fff;border-radius:12px;padding:12px 24px;cursor:pointer;\\">タイムツリーを確認</button>":""),"#16a34a");var bb=document.getElementById("rvBack");if(bb){bb.addEventListener("click",function(){location.href=TOPHREF;});}var tb=document.getElementById("rvTt");if(tb){tb.addEventListener("click",function(){window.open(_tt,"_blank");});}});}' +
    'function doRegisterMulti(){var decisions=[];for(var i=0;i<rvitems.length;i++){var it=rvitems[i];decisions.push({line_no:it.line_no,do:it.do,count:it.count,finish:it.finish});}var effM=rvEffMarks();var slots=[];for(var m=0;m<effM.length;m++){var mk=effM[m];var cf=rvSlotCfg_(mk);var rk=(cf.room==="STAR/福/🇫🇷")?"STAR":cf.room;slots.push({mark:mk,room_key:rk,staff_emoji:(SEMO_[cf.staff]||""),dur:parseInt(cf.dur,10)||30});}rvLastSlotCount=slots.length;var fields={number:disp(),date:rvctx._ymd,time:rvctx._tm,prev_title:rvctx.prev_title||"",staff_emoji:SEMO_[rvsel.staff]||"",suffix:rvSuffix(),new_memo:rvctx.new_memo||"",decisions:decisions,new_items:rvNewItems.slice(),booking_services:rvBookingTexts(),memo_override:(rvMemoOv!=null?rvMemoOv:""),slots:slots};exOvShow_(szBusyHtml_(slots.length+"枠の予約を登録中です"),"#2C7A99");jsonp({action:"submit",key:KEY,op:"existing_create_multi",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(fields)},function(r){if(!r||!r.ok||!r.id){exOvHide_();szPopup_("エラーが発生しました。通信に失敗しました。もう一度お試しください。");return;}pollRegisterMulti(r.id);});}' +
    'function pollRegisterMulti(id){jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){exOvHide_();szPopup_("エラーが発生しました。もう一度お試しください。");return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollRegisterMulti(id);},500);return;}if(r.status!=="done"){exOvHide_();szPopup_(esc(r.result)||"エラーが発生しました。りゅうさんにお伝えください。");return;}var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}var cnt=(d.count||rvLastSlotCount);exOvShow_("<div style=\\"font-size:92px;margin-bottom:16px;\\">✓</div><div style=\\"color:#fff;font-size:32px;font-weight:900;line-height:1.5;margin-bottom:24px;\\">"+cnt+"枠の予約を登録しました</div><button type=\\"button\\" id=\\"rvBack\\" style=\\"font:inherit;font-size:1.3rem;font-weight:800;color:#16a34a;background:#fff;border:0;border-radius:12px;padding:14px 26px;cursor:pointer;\\">予約入力に戻る</button>","#16a34a");var bb=document.getElementById("rvBack");if(bb){bb.addEventListener("click",function(){location.href=TOPHREF;});}});}' +
    // 日付・時刻を移す前に、移し先でこの予約の担当・部屋が別の予約と重ならないか確認する（自分自身は番号で除く）。
    // 日付・時刻を移す時の流れ：移し先の空きを調べる→担当を選ぶ→部屋を選ぶ→書き込む。
    'var pickStaff="",pickRoom="",availData=null,newYmd="",newSm=0;' +
    'var SNM_={"1":"トマト","2":"みかん","3":"オリーブ","4":"マンゴー"};' +
    'var SEMO_={"1":"🍅","2":"🍊","3":"🫒","4":"🥭"};' +
    'var RMAP_={"FREEDOM":{cal:"73208496",label:1},"HAPPY":{cal:"59950855",label:6},"LUCKY":{cal:"59950871",label:9},"STAR/福/🇫🇷":{cal:"86075789",label:10}};' +
    'function startPickFlow(){var hh=parseInt(tdig.slice(0,2),10),mm=parseInt(tdig.slice(2),10);var nd=(chgtype==="t")?new Date(chosen.date+"T00:00:00"):picked;newYmd=nd.getFullYear()+"-"+("0"+(nd.getMonth()+1)).slice(-2)+"-"+("0"+nd.getDate()).slice(-2);newSm=hh*60+mm;pickStaff="";pickRoom="";availData=null;var dur=(chosen.dur_min||30);exOvShow_("<div style=\\"font-size:66px;margin-bottom:20px;\\">⏳</div><div style=\\"color:#fff;font-size:33px;font-weight:800;line-height:1.5;margin-bottom:22px;\\">空きを確認しています</div><div style=\\"color:#eaf3f7;font-size:20px;line-height:1.8;max-width:420px;\\">その時間に空いている担当・部屋を調べています。しばらくお待ちください。</div>","#2C7A99");jsonp({action:"submit",key:KEY,op:"availability",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({date:newYmd,start_min:newSm,dur:dur,exclude_number:disp()})},function(r){if(!r||!r.ok||!r.id){exOvHide_();szPopup_("エラーが発生しました。通信に失敗しました。もう一度お試しください。");return;}pickFlowPoll(r.id);});}' +
    'function pickFlowPoll(id){jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){exOvHide_();szPopup_("エラーが発生しました。もう一度お試しください。");return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pickFlowPoll(id);},600);return;}if(r.status!=="done"){exOvHide_();szPopup_("エラーが発生しました。もう一度お試しください。");return;}var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}availData={free_staff:(d.free_staff||[]).map(String),free_rooms:(d.free_rooms||[]).map(String)};exOvHide_();showStaffPick();});}' +
    'function showStaffPick(){hideSteps();document.getElementById("exStaffPick").style.display="";var cur=staffNum(chosen.staff_emoji||"");var fs=(availData&&availData.free_staff)||[];document.getElementById("exspwho").innerHTML="移す先："+newYmd+" "+tdisp()+"<br>現在の担当："+(SEMO_[cur]||"")+" "+(SNM_[cur]||"?")+"<div class=\\"exq\\">担当を変更しますか？</div>";if(fs.length===0){document.getElementById("exsplist").innerHTML="<div class=\\"exnone\\">その時間は、担当の空きがありません</div>";window.scrollTo(0,0);return;}var curBusy=(cur&&fs.indexOf(cur)<0);var h="<button class=\\"expk keep"+(curBusy?" dis":"")+"\\" data-v=\\"__keep\\">変更なし（<span class=\\"expkemo\\">"+(SEMO_[cur]||"")+"</span>"+(SNM_[cur]||"?")+"）</button>";if(curBusy){h+="<div class=\\"expknote\\">その時間「"+(SNM_[cur]||"")+"」は空いていないので、下の空いている担当から選んでください。</div>";}var order=["2","3","1","4"];for(var i=0;i<order.length;i++){var n=order[i];if(n===cur)continue;if(fs.indexOf(n)<0)continue;h+="<button class=\\"expk\\" data-v=\\""+n+"\\"><span class=\\"expkemo\\">"+SEMO_[n]+"</span>"+SNM_[n]+"</button>";}document.getElementById("exsplist").innerHTML=h;window.scrollTo(0,0);}' +
    'function roomBadge_(rk,small){var c=(typeof roomColor_==="function")?roomColor_(rk):"#64748b";var nm=(typeof shortRoomName_==="function")?shortRoomName_(rk):rk;return "<span class=\\""+(small?"expkroomS":"expkroom")+"\\" style=\\"background:"+c+"\\">"+nm+"</span>";}' +
    'function showRoomPick(){hideSteps();document.getElementById("exRoomPick").style.display="";var cur=roomVal(chosen.room||"");var fr=(availData&&availData.free_rooms)||[];document.getElementById("exrpwho").innerHTML="移す先："+newYmd+" "+tdisp()+"<br>現在の部屋："+roomBadge_(cur,true)+"<div class=\\"exq\\">部屋を変更しますか？</div>";if(fr.length===0){document.getElementById("exrplist").innerHTML="<div class=\\"exnone\\">その時間は部屋が空いていません</div>";window.scrollTo(0,0);return;}var curBusy=(cur&&fr.indexOf(cur)<0);var h="<button class=\\"expk keep"+(curBusy?" dis":"")+"\\" data-v=\\"__keep\\">変更なし（"+roomBadge_(cur,true)+"）</button>";if(curBusy){h+="<div class=\\"expknote\\">その時間この部屋は空いていないので、下の空いている部屋から選んでください。</div>";}var order=["FREEDOM","HAPPY","LUCKY","STAR/福/🇫🇷"];for(var i=0;i<order.length;i++){var rm=order[i];if(rm===cur)continue;if(fr.indexOf(rm)<0)continue;h+="<button class=\\"expk\\" data-v=\\""+rm+"\\">"+roomBadge_(rm)+"</button>";}document.getElementById("exrplist").innerHTML=h;window.scrollTo(0,0);}' +
    'document.getElementById("exsplist").addEventListener("click",function(e){var b=e.target.closest(".expk");if(!b||b.className.indexOf("dis")>=0)return;var v=b.getAttribute("data-v");pickStaff=(v==="__keep")?"":v;showRoomPick();});' +
    'document.getElementById("exrplist").addEventListener("click",function(e){var b=e.target.closest(".expk");if(!b||b.className.indexOf("dis")>=0)return;var v=b.getAttribute("data-v");pickRoom=(v==="__keep")?"":v;realChange(document.getElementById("exdone2"));});' +
    'document.getElementById("exbackStaffPick").addEventListener("click",function(){hideSteps();document.getElementById("exTime").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exbackRoomPick").addEventListener("click",function(){showStaffPick();});' +
    'function pickExtra(){var x="";if(pickStaff){x+="／担当を"+(SNM_[pickStaff]||"")+"へ";}if(pickRoom){x+="／部屋を"+pickRoom+"へ";}return x;}' +
    'var esel={dur:"",staff:"",room:""};' +
    'function selE(g,v){esel[g]=String(v);var pl=document.querySelectorAll(".exp[data-eg=\\""+g+"\\"]");for(var i=0;i<pl.length;i++){pl[i].classList.toggle("sel",pl[i].getAttribute("data-ev")===String(v));}}' +
    'function nearDur(v){v=parseInt(v,10)||30;var arr=[15,20,30,40,45,50,60,70,80,90,120,150],best=arr[0];for(var i=0;i<arr.length;i++){if(Math.abs(arr[i]-v)<Math.abs(best-v)){best=arr[i];}}return best;}' +
    'function roomVal(r){r=String(r||"").toLowerCase();if(r.indexOf("freedom")>=0){return "FREEDOM";}if(r.indexOf("happy")>=0){return "HAPPY";}if(r.indexOf("lucky")>=0){return "LUCKY";}if(r.indexOf("スター")>=0||r.indexOf("star")>=0||r.indexOf("福")>=0){return "STAR/福/🇫🇷";}return "FREEDOM";}' +
    'function staffNum(e){e=String(e||"");if(e.indexOf("🍅")>=0){return "1";}if(e.indexOf("🍊")>=0){return "2";}if(e.indexOf("🫒")>=0){return "3";}if(e.indexOf("🥭")>=0){return "4";}return "2";}' +
    'var epills=document.querySelectorAll(".exp");for(var _p=0;_p<epills.length;_p++){epills[_p].addEventListener("click",function(){selE(this.getAttribute("data-eg"),this.getAttribute("data-ev"));});}' +
    'var chgtype="dt";' +
    'function nameSuffix(){return (chosen&&chosen.name)?chosen.name+"様":"";}' +
    'var avail=null;' +
    'function loadAvail(){avail=null;jsonp({action:"submit",key:KEY,op:"availability",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({date:chosen.date,start_min:(chosen.start_min!=null?chosen.start_min:0),dur:(chosen.dur_min||30),exclude_number:disp()})},function(r){if(!r||!r.ok||!r.id){return;}pollAvail(r.id);});}' +
    'function pollAvail(id){jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollAvail(id);},600);return;}if(r.status!=="done"){return;}var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}if(d&&d.ok){avail=d;var ed=document.getElementById("exEdit");if(ed&&ed.style.display!=="none"&&(chgtype==="staff"||chgtype==="room")){filterAvail();}}});}' +
    'function filterAvail(){if(!avail)return;var fs=(avail.free_staff||[]).map(String),fr=(avail.free_rooms||[]).map(String);var sp=document.querySelectorAll("#estaff .exp");for(var i=0;i<sp.length;i++){sp[i].style.display=(fs.indexOf(sp[i].getAttribute("data-ev"))>=0)?"":"none";}var rp=document.querySelectorAll("#eroom .exp");for(var j=0;j<rp.length;j++){rp[j].style.display=(fr.indexOf(rp[j].getAttribute("data-ev"))>=0)?"":"none";}var none=document.getElementById("exeditnone"),go=document.getElementById("exEditGo");if(chgtype==="staff"||chgtype==="room"){var empty=(chgtype==="staff")?(fs.length===0):(fr.length===0);var sec=document.getElementById(chgtype==="staff"?"secStaff":"secRoom");if(empty){if(none){none.style.display="";none.textContent=(chgtype==="staff")?"その時間は、担当の空きがありません":"その時間は部屋が空いていません";}if(sec)sec.style.display="none";if(go)go.style.display="none";}else{if(none)none.style.display="none";if(sec)sec.style.display="";if(go)go.style.display="";}}}' +
    'function hideSteps(){var ids=["exNum","exPick","exMenu","exDate","exTime","exEdit","exMemo","exStaffPick","exRoomPick","exResv","exrvMenu"];for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el)el.style.display="none";}setExTop();}' +
    // タイトル（時刻入力など）の上に「番号＋お名前様 の予約変更」を毎画面出す。
    'function setExTop(){var nm=(chosen&&chosen.name)?chosen.name+"様":"";var t=disp()?("「"+disp()+"」"+nm+" の"+TITLE):"";var els=document.querySelectorAll(".extop");for(var i=0;i<els.length;i++){els[i].textContent=t;els[i].style.display=t?"":"none";}}' +
    'function exSumHtml(){var wd=["日","月","火","水","木","金","土"][new Date(chosen.date+"T00:00:00").getDay()];var cn=staffNum(chosen.staff_emoji||"");var rk=roomVal(chosen.room||"");var rc=(typeof roomColor_==="function")?roomColor_(rk):"#64748b";var rn=(typeof shortRoomName_==="function")?shortRoomName_(rk):rk;var parts=(chosen.parts||[]).join("・")||"—";var note=esc(chosen.note||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");var h="<div class=\\"exsumrow\\"><b>日時</b>"+chosen.date+"（"+wd+"） "+chosen.start_hm+"　"+(chosen.dur_min||"?")+"分</div>";h+="<div class=\\"exsumrow\\"><b>担当</b>"+(SEMO_[cn]||chosen.staff_emoji||"")+" "+(SNM_[cn]||"")+"</div>";h+="<div class=\\"exsumrow\\"><b>部屋</b><span class=\\"exsumroom\\" style=\\"background:"+rc+"\\">"+rn+"</span></div>";h+="<div class=\\"exsumrow\\"><b>部位</b>"+esc(parts)+"</div>";h+="<div class=\\"exsumrow\\"><b>メモ</b></div><div class=\\"exsummemo\\">"+(note||"（メモなし）")+"</div>";return h;}' +
    'function showMenu(){hideSteps();document.getElementById("exMenu").style.display="";document.getElementById("exmsum").innerHTML=exSumHtml();loadAvail();window.scrollTo(0,0);}' +
    'function goTime(){hideSteps();document.getElementById("exTime").style.display="";var wd=["日","月","火","水","木","金","土"][picked.getDay()];document.getElementById("exwhen").innerHTML="<div class=\\"exwd2\\">"+(picked.getMonth()+1)+"月"+picked.getDate()+"日（"+wd+"）</div>";tdig=initTdig_();tupd();window.scrollTo(0,0);}' +
    'function enterEdit(){hideSteps();document.getElementById("exEdit").style.display="";var _en=document.getElementById("exeditnone");if(_en)_en.style.display="none";var _eg=document.getElementById("exEditGo");if(_eg)_eg.style.display="";document.getElementById("secDur").style.display=(chgtype==="dur")?"":"none";document.getElementById("secStaff").style.display=(chgtype==="staff")?"":"none";document.getElementById("secRoom").style.display=(chgtype==="room")?"":"none";var lbl={dur:"施術時間",staff:"担当",room:"部屋"}[chgtype]||"";document.getElementById("exeditwho").innerHTML=lbl+"を変更";selE("dur",nearDur(chosen?chosen.dur_min:30));selE("staff",staffNum(chosen?chosen.staff_emoji:""));selE("room",roomVal(chosen?chosen.room:""));if(chgtype==="staff"||chgtype==="room"){filterAvail();}window.scrollTo(0,0);}' +
    'function enterMemo(){hideSteps();document.getElementById("exMemo").style.display="";document.getElementById("exmemowho").innerHTML="予約メモを変更";document.getElementById("exmemobox").value=(chosen&&chosen.note)||"";window.scrollTo(0,0);}' +
    'function summaryText(){var sn={"1":"トマト","2":"みかん","3":"オリーブ","4":"マンゴー"};var b="練習：この予約を ";var tail="（練習なので本物のタイムツリーには書き込んでいません）";if(chgtype==="dt"){return b+(picked.getMonth()+1)+"月"+picked.getDate()+"日 "+tdisp()+" に変更しました"+tail;}if(chgtype==="t"){return b+"時刻 "+tdisp()+"（同じ日）に変更しました"+tail;}if(chgtype==="staff"){return b+"担当を "+(sn[esel.staff]||"")+" に変更しました"+tail;}if(chgtype==="room"){return b+"部屋を "+esel.room+" に変更しました"+tail;}if(chgtype==="dur"){return b+"施術時間を "+esel.dur+"分 に変更しました"+tail;}if(chgtype==="memo"){return b+"予約メモを変更しました"+tail;}return "";}' +
    'function _p2(n){return (n<10?"0":"")+n;}function _iso(dt){return dt.getFullYear()+"-"+_p2(dt.getMonth()+1)+"-"+_p2(dt.getDate())+"T"+_p2(dt.getHours())+":"+_p2(dt.getMinutes())+":00";}' +
    'function doneMsg(){if(chgtype==="dur"){return "施術時間 "+esel.dur+"分 へ";}if(chgtype==="memo"){return "予約メモを";}if(chgtype==="staff"){return "担当を"+(SEMO_[esel.staff]||"")+" "+(SNM_[esel.staff]||"")+"へ";}if(chgtype==="room"){return "部屋を"+roomBadge_(esel.room,true)+"へ";}var lines=[];if(chgtype==="dt"){lines.push((picked.getMonth()+1)+"月"+picked.getDate()+"日 "+tdisp()+" へ");}else if(chgtype==="t"){lines.push("時刻を"+tdisp()+"（同じ日）へ");}if(pickStaff){lines.push("／担当を"+(SEMO_[pickStaff]||"")+" "+(SNM_[pickStaff]||"")+"へ");}if(pickRoom){lines.push("／部屋を"+roomBadge_(pickRoom,true)+"へ");}return lines.join("<br>");}' +
    'var TOPHREF="' + topHref + '";' +
    'function exOvShow_(html,bg){var ov=document.getElementById("exOverlay");if(!ov){ov=document.createElement("div");ov.id="exOverlay";document.body.appendChild(ov);}ov.style.cssText="position:fixed;inset:0;z-index:9999;background:"+bg+";display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center;";ov.innerHTML=html;return ov;}' +
    'function exOvHide_(){var ov=document.getElementById("exOverlay");if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);}' +
    'function realChange(doneEl){var fields={cal:chosen.calendar_id,event:chosen.event_id};if(chgtype==="dt"||chgtype==="t"){var hh=parseInt(tdig.slice(0,2),10),mm=parseInt(tdig.slice(2),10);var sd=new Date(picked.getFullYear(),picked.getMonth(),picked.getDate(),hh,mm,0,0);var ed=new Date(sd.getTime()+((chosen.dur_min||30)*60000));fields.start=_iso(sd);fields.end=_iso(ed);if(pickStaff){fields.new_fruit=SEMO_[pickStaff];}if(pickRoom&&RMAP_[pickRoom]){fields.to_cal=RMAP_[pickRoom].cal;fields.to_label=RMAP_[pickRoom].label;}}else if(chgtype==="dur"){var hm=(chosen.start_hm||"13:00").split(":");var sd=new Date(chosen.date+"T00:00:00");sd.setHours(parseInt(hm[0],10),parseInt(hm[1],10),0,0);var ed=new Date(sd.getTime()+(parseInt(esel.dur,10)*60000));fields.start=_iso(sd);fields.end=_iso(ed);}else if(chgtype==="memo"){fields.note=document.getElementById("exmemobox").value;}else if(chgtype==="staff"){if(!esel.staff){szPopup_("担当を選んでください。");return;}fields.new_fruit=SEMO_[esel.staff];}else if(chgtype==="room"){if(!esel.room||!RMAP_[esel.room]){szPopup_("部屋を選んでください。");return;}fields.to_cal=RMAP_[esel.room].cal;fields.to_label=RMAP_[esel.room].label;}else{szPopup_("この項目はまだ準備中です。");return;}exOvShow_("<div style=\\"font-size:66px;margin-bottom:20px;\\">⏳</div><div style=\\"color:#fff;font-size:33px;font-weight:800;line-height:1.5;margin-bottom:22px;\\">予約を変更中です</div><div style=\\"color:#eaf3f7;font-size:20px;line-height:1.8;max-width:420px;\\">タイムツリーへの書き込みが完了したら自動で画面が切り替わりますので、しばらくお待ちください。</div>","#2C7A99");jsonp({action:"submit",key:KEY,op:"change_reservation",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(fields)},function(r){if(!r||!r.ok||!r.id){exOvHide_();szPopup_("エラーが発生しました。通信に失敗しました。もう一度お試しください。");return;}pollChange(r.id);});}' +
    'function ttAlias_(room){var r=(""+room).toLowerCase();if(r.indexOf("freedom")>=0)return"2AfH2fMvqXEH";if(r.indexOf("happy")>=0)return"eavbC5WSuUs6";if(r.indexOf("lucky")>=0)return"GPapusGepg5P";if(r.indexOf("cosmos")>=0)return"ojzXKACEbghC";if(r.indexOf("スター")>=0||r.indexOf("star")>=0||r.indexOf("福")>=0)return"KMkTNuLk3Qif";return"";}' +
    'function pollChange(id){jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){exOvHide_();szPopup_("エラーが発生しました。通信に失敗しました。もう一度お試しください。");return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollChange(id);},400);return;}if(r.status!=="done"){exOvHide_();szPopup_(esc(r.result)||"エラーが発生しました。りゅうさんにお伝えください。");return;}var _d2={};try{_d2=JSON.parse(r.result||"{}");}catch(e){}var _fev=(_d2&&_d2.new_event)||chosen.event_id;var _froom=chosen.room;if((chgtype==="dt"||chgtype==="t")&&pickRoom){_froom=pickRoom;}else if(chgtype==="room"&&esel.room){_froom=esel.room;}var _al=ttAlias_(_froom),_tt=_al?("https://timetreeapp.com/calendars/"+_al+"/events/"+_fev):"";exOvShow_("<div style=\\"font-size:92px;margin-bottom:16px;\\">✓</div><div style=\\"color:#fff;font-size:23px;font-weight:800;line-height:1.7;margin-bottom:10px;white-space:nowrap;\\">"+doneMsg()+"</div><div style=\\"color:#fff;font-size:30px;font-weight:900;margin-bottom:24px;\\">変更が完了しました</div><button type=\\"button\\" id=\\"exBackBtn\\" style=\\"font:inherit;font-size:1.3rem;font-weight:800;color:#16a34a;background:#fff;border:0;border-radius:12px;padding:14px 26px;cursor:pointer;\\">予約入力に戻る</button>"+(_tt?"<button type=\\"button\\" id=\\"exTtBtn\\" style=\\"display:block;margin:14px auto 0;font:inherit;font-size:1.15rem;font-weight:800;color:#fff;background:rgba(255,255,255,.18);border:2px solid #fff;border-radius:12px;padding:12px 24px;cursor:pointer;\\">タイムツリーを確認</button>":""),"#16a34a");var bb=document.getElementById("exBackBtn");if(bb){bb.addEventListener("click",function(){location.href=TOPHREF;});}var tb=document.getElementById("exTtBtn");if(tb){tb.addEventListener("click",function(){window.open(_tt,"_blank");});}});}' +
    'var mbtns=document.querySelectorAll(".exmbtn");for(var _mb=0;_mb<mbtns.length;_mb++){mbtns[_mb].addEventListener("click",function(){chgtype=this.getAttribute("data-chg");if(chgtype==="dt"){picked=null;goDate();}else if(chgtype==="t"){picked=new Date(chosen.date+"T00:00:00");goTime();}else if(chgtype==="memo"){enterMemo();}else{enterEdit();}});}' +
    // この予約を終日にする＝この店ではキャンセル/保留（部屋と時間が空く・名前とメモは残る）。
    'document.getElementById("exAllDay").addEventListener("click",function(){szPopup_("この予約を終日（キャンセル・保留）にしますか？\\n部屋と時間が空きます。名前とメモは残ります。",{cancel:true,yesLabel:"終日にする",onYes:doAllday});});' +
    'function doAllday(){exOvShow_(szBusyHtml_("終日にしています"),"#2C7A99");jsonp({action:"submit",key:KEY,op:"make_allday",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({cal:chosen.calendar_id,event:chosen.event_id})},function(r){if(!r||!r.ok||!r.id){exOvHide_();szPopup_("エラーが発生しました。通信に失敗しました。もう一度お試しください。");return;}pollAllday(r.id);});}' +
    'function pollAllday(id){jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){exOvHide_();szPopup_("エラーが発生しました。もう一度お試しください。");return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollAllday(id);},400);return;}if(r.status!=="done"){exOvHide_();szPopup_(esc(r.result)||"エラーが発生しました。りゅうさんにお伝えください。");return;}exOvShow_(szDoneHtml_("終日にしました（部屋が空きました）","予約入力に戻る"),"#16a34a");var b=document.getElementById("szDoneBack");if(b){b.addEventListener("click",function(){location.href=TOPHREF;});}});}' +
    'document.getElementById("exbackMenu").addEventListener("click",function(){hideSteps();document.getElementById("exPick").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exbackMemo").addEventListener("click",function(){showMenu();});' +
    'document.getElementById("exMemoGo").addEventListener("click",function(){realChange(document.getElementById("exdone4"));window.scrollTo(0,document.body.scrollHeight);});' +
    'document.getElementById("exbackEdit").addEventListener("click",function(){document.getElementById("exEdit").style.display="none";document.getElementById("exMenu").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exEditGo").addEventListener("click",function(){realChange(document.getElementById("exdone3"));window.scrollTo(0,document.body.scrollHeight);});' +
    '})();</script>';
  return '<style>' + HOMECSS_ + css + '</style>' +
    '<div class="home"><div class="ex">' + numSec + pickSec + menuSec + dateSec + timeSec + editSec + memoSec + staffPickSec + roomPickSec + resvSec + resvMenuSec + '</div></div>' + script;
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
// ========== プロセル 残り本数（2026-08-20 まるちゃん決定・開発URL専用） ==========
// 事務所PCが毎晩そろえた procell.json を読んで出すだけ（計算はPC側＝共通の決まり）。
function renderProcell_(base, staff, dev) {
  try {
    var d = JSON.parse(getProcellFile_().getBlob().getDataAsString('UTF-8'));
    return renderProcellPage_(d, base, staff, dev);
  } catch (err) {
    return '<style>' + HOMECSS_ + '</style>' +
      '<div class="home">' + backBar_(base, staff, dev) +
      '<div class="hhead"><span class="bmark">🧴</span><span class="bname">プロセル 残り本数</span></div>' +
      '<div class="soon"><div class="soonic">📄</div>' +
      '<div class="soontitle" style="font-size:1.4rem">まだ作られていません</div>' +
      '<div class="soondesc">' + esc_(err && err.message ? err.message : err) + '</div></div></div>';
  }
}

// GAS側から開いた時用（静的アプリは index.html が窓口から取って renderPcStatusPage_ を直接呼ぶ）。
function renderPcStatus_(base, staff, dev) {
  try {
    return renderPcStatusPage_(
      JSON.parse(getPcStatusFile_().getBlob().getDataAsString('UTF-8')), base, staff, dev);
  } catch (err) {
    return renderPcStatusPage_({ error: (err && err.message) ? err.message : String(err) }, base, staff, dev);
  }
}

function renderProcellPage_(d, base, staff, dev) {
  var o = d.order || {}, r = d.rest || {}, k = d.expired || {};
  var kinds = [['頭皮', '頭皮用'], ['顔MD', '顔MD用'], ['顔Pro', '顔Pro用']];
  var cards = '';
  for (var i = 0; i < kinds.length; i++) {
    var key = kinds[i][0], nm = kinds[i][1];
    cards +=
      '<div class="pcCard">' +
        '<div class="pcName">' + esc_(nm) + '</div>' +
        '<div class="pcNum">' + (o[key] || 0) + '<span class="pcUnit">本</span></div>' +
        '<div class="pcSub">残り ' + (r[key] || 0) + '本' +
          ((k[key] || 0) ? '（うち期限切れ ' + k[key] + '本を除く）' : '') + '</div>' +
      '</div>';
  }
  var people = d.people || [];
  people.sort(function (a, b) { return (b['残り'] - b['期限切れ']) - (a['残り'] - a['期限切れ']); });
  var rows = '';
  for (var j = 0; j < people.length; j++) {
    var p = people[j];
    var nokori = (p['残り'] || 0) - (p['期限切れ'] || 0);
    if (nokori <= 0) continue;
    rows +=
      '<tr>' +
        '<td class="pcL">' + esc_(p['番号'] || '') + '</td>' +
        '<td class="pcL">' + esc_(p['名前'] || '') + '</td>' +
        '<td class="pcL">' + esc_(p['種類'] || '') + '</td>' +
        '<td class="pcR">' + nokori + '</td>' +
        '<td class="pcL pcDim">' + esc_(p['最後の来店'] || '') + '</td>' +
      '</tr>';
  }
  return '<style>' + HOMECSS_ + PROCELLCSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">🧴</span><span class="bname">プロセル 残り本数</span></div>' +
    '<div class="pcLead">お金をいただいてあって、まだ受けていない回数です。これから注文する本数の目安になります。</div>' +
    '<div class="pcCards">' + cards + '</div>' +
    '<div class="pcTitle">お客様ごとの残り</div>' +
    '<div class="pcTableWrap"><table class="pcTable">' +
      '<tr><th class="pcL">番号</th><th class="pcL">お名前</th><th class="pcL">種類</th>' +
      '<th class="pcR">残り</th><th class="pcL">最後のご来店</th></tr>' + rows +
    '</table></div>' +
    '<div class="pcFoot">そろえた時刻：' + esc_(d.generated_at || '') + '（毎晩そろえます）</div>' +
  '</div>';
}

// ========== 自宅PC（2026-08-24 まるちゃん決定・開発URL専用） ==========
// 事務所PCが1分ごとに送る pc_status.json を読んで「今動いているか／止まっているなら何が起きたか」を出す。
//
// ★ここだけ画面側で判定する理由（＝ふだんの決まり「判定はPC側で完結」の唯一の例外）：
//   知りたいのは「事務所PCが止まっていないか」。止まっている時、そのPCは何も送れないので、
//   PC側に判定させることが原理的にできない（死人は口をきけない）。そこでPC側は材料だけ渡す
//   ＝「最後に送った時刻」「何分で止まったと見なすか(stale_min)」。引き算はここで行う。
//   ★これは「判定ロジックを2か所に書く」ことではない（PC側に同じ判定は無い）。
//
// ★理由が確定するのは2段階（まるちゃんに説明済み）：
//   ①止まっている最中 … 自分で切った予告がある時だけ「まるちゃんが切りました」と確実に言える。
//     予告なしで途絶えた時は、停電・異常終了・固まったのどれかまでしか言えない（正直に3つ並べる）。
//   ②立ち上がり直した時 … PCがWindowsの日記を読んで確定させ、last_end に入れて送ってくる。
function renderPcStatusPage_(d, base, staff, dev) {
  d = d || {};
  var err = d.error || (!d.sent_at ? 'まだ事務所PCから届いていません。' : '');
  if (err) {
    return '<style>' + HOMECSS_ + PCSTCSS_ + '</style>' +
      '<div class="home">' + backBar_(base, staff, dev) +
      '<div class="hhead"><span class="bmark">🖥️</span><span class="bname">自宅PC</span></div>' +
      '<div class="soon"><div class="soonic">📄</div>' +
      '<div class="soontitle" style="font-size:1.4rem">まだ分かりません</div>' +
      '<div class="soondesc">' + esc_(err) + '</div></div></div>';
  }

  var staleMin = d.stale_min || 5;
  var mins = pcstMinutesSince_(d.sent_at);
  var alive = (mins !== null && mins < staleMin);

  // 止まっている時の理由。予告があればそれが最優先（＝確実に分かる唯一の場合）。
  var why = '', whySub = '';
  if (!alive) {
    if (d.shutdown_notice_at) {
      why = 'まるちゃんが自分で切りました';
      whySub = '切る直前に「今から切ります」と届いています（' + esc_(pcstFmt_(d.shutdown_notice_at)) + '）。心配は要りません。';
    } else {
      why = '予告なしで止まりました';
      whySub = '停電・眠っている（スリープ）・異常終了（青い画面など）・固まった、のどれかです。'
             + '<br>どれだったかは、パソコンが戻ってきた時にここへ必ず出ます'
             + '（パソコン自身がWindowsの日記を読んで確かめます）。';
    }
  }

  var le = d.last_end || {};
  // ★「前に止まった時は何だったか」＝復帰したあとにパソコンが日記から確定させた理由
  //   （シャットダウン／スリープ／停電／合図だけ止まった の4つを見分ける・2026-08-24 まるちゃん）。
  var gp = d.last_gap;
  var gapRow = '';
  if (gp && gp.label) {
    gapRow = pcstRow_('前に止まった時は',
      esc_(gp.label) +
      '<span class="pcstDim">' +
        (gp.minutes ? ('およそ' + gp.minutes + '分間') : '') +
        (gp.from ? '（' + esc_(pcstFmt_(gp.from)) + ' から）' : '') +
      '</span>');
  }
  var rows =
    pcstRow_('続けて動いている時間', (d.uptime_hours === null || d.uptime_hours === undefined)
              ? '—' : (d.uptime_hours + ' 時間')) +
    gapRow +
    pcstRow_('前に立ち上がった時刻', pcstFmt_(d.boot_at)) +
    pcstRow_('その前はどう終わったか', esc_(le.label || '—')
              + (le.at ? '<span class="pcstDim">' + esc_(pcstFmt_(le.at)) + '</span>' : '')) +
    pcstRow_('最後に届いた時刻', pcstFmt_(d.sent_at)
              + (mins === null ? '' : '<span class="pcstDim">' + pcstAgo_(mins) + '</span>')) +
    pcstRow_('パソコンの名前', esc_(d.host || '—'));

  return '<style>' + HOMECSS_ + PCSTCSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">🖥️</span><span class="bname">自宅PC</span></div>' +
    '<div class="pcstBig ' + (alive ? 'ok' : 'ng') + '">' +
      '<div class="pcstIc">' + (alive ? '🟢' : '🔴') + '</div>' +
      '<div class="pcstMain">' + (alive ? '動いています' : '止まっています') + '</div>' +
      '<div class="pcstSub">' +
        (alive ? ('最後の合図は ' + pcstAgo_(mins) + '（' + staleMin + '分おきに見ています）')
               : (pcstAgo_(mins) + 'から合図が届いていません')) +
      '</div>' +
    '</div>' +
    (alive ? '' :
      '<div class="pcstWhy">' +
        '<div class="pcstWhyT">' + esc_(why) + '</div>' +
        '<div class="pcstWhyS">' + whySub + '</div>' +
      '</div>') +
    '<div class="pcstTable">' + rows + '</div>' +
    '<div class="pcFoot">事務所PCが1分ごとに合図を送っています。この画面は開くたびに最新を取り直します。</div>' +
  '</div>';
}

function pcstRow_(k, v) {
  return '<div class="pcstR"><div class="pcstK">' + esc_(k) + '</div><div class="pcstV">' + v + '</div></div>';
}
/** 文字列の時刻から今までの分数（分からなければ null）。 */
function pcstMinutesSince_(s) {
  if (!s) return null;
  var t = new Date(String(s).replace(' ', 'T'));
  if (isNaN(t.getTime())) return null;
  return Math.floor((new Date().getTime() - t.getTime()) / 60000);
}
function pcstAgo_(m) {
  if (m === null || m === undefined) return '—';
  if (m < 1) return 'たった今';
  if (m < 60) return m + '分前';
  var h = Math.floor(m / 60);
  if (h < 24) return h + '時間' + (m % 60) + '分前';
  return Math.floor(h / 24) + '日' + (h % 24) + '時間前';
}
function pcstFmt_(s) {
  if (!s) return '—';
  var t = String(s).replace('T', ' ');
  return t.length > 16 ? t.slice(0, 16) : t;
}

// ★色は必ず共通の決め方（--card＝箱の色／--ink＝文字の色／--line＝境目）を使う。
//   2026-08-24、ここに濃い紺 #16283a を直接書き、文字色を決めなかったため、**明るい画面設定の人には
//   濃い背景の上に濃い文字が出て真っ暗で読めなかった**（まるちゃん指摘）。色を直に書かない＝共通に従う。
//   緑・赤の大きな枠だけは、どちらの設定でも濃い色なので文字を白に決め打ちする（これは意図した固定）。
// ★文字の大きさ（2026-08-24 まるちゃん指摘「それぞれの文字が小さすぎて見えない」で全部大きくした）：
//   この画面は外出先でとっさに「動いてる？止まってる？」を見る物なので、
//   細かい注釈でも 1.1rem 以上にする。項目名と値は狭い画面では横に並べず縦に積む（大きくすると窮屈なため）。
var PCSTCSS_ = ''
+ '.pcstBig{border-radius:18px;padding:28px 16px;text-align:center;margin:10px 0 16px;color:#fff}'
+ '.pcstBig.ok{background:#15803d;border:1px solid #1f9d54}'
+ '.pcstBig.ng{background:#b91c1c;border:1px solid #dc2626}'
+ '.pcstIc{font-size:3.2rem;line-height:1}'
+ '.pcstMain{font-size:2.3rem;font-weight:900;margin:8px 0 8px;color:#fff;line-height:1.25}'
+ '.pcstSub{font-size:1.2rem;line-height:1.55;color:rgba(255,255,255,.95)}'
+ '.pcstWhy{background:var(--card);color:var(--ink);border:1px solid var(--line);'
+   'border-radius:14px;padding:18px 16px;margin-bottom:16px}'
+ '.pcstWhyT{font-size:1.5rem;font-weight:800;margin-bottom:10px;color:var(--ink);line-height:1.35}'
+ '.pcstWhyS{font-size:1.2rem;line-height:1.7;color:var(--ink);opacity:.9}'
+ '.pcstTable{background:var(--card);color:var(--ink);border:1px solid var(--line);'
+   'border-radius:14px;overflow:hidden}'
+ '.pcstR{display:flex;gap:12px;padding:16px 16px;border-bottom:1px solid var(--line);align-items:baseline}'
+ '.pcstR:last-child{border-bottom:none}'
+ '.pcstK{flex:0 0 42%;font-size:1.15rem;color:var(--sub);line-height:1.5}'
+ '.pcstV{flex:1 1 auto;font-size:1.35rem;font-weight:700;color:var(--ink);line-height:1.45;word-break:break-word}'
+ '.pcstDim{display:block;font-weight:400;color:var(--sub);margin:3px 0 0;font-size:1.15rem}'
+ '.pcFoot{margin-top:14px;font-size:1.1rem;color:rgba(255,255,255,.92);text-align:center;line-height:1.7}'
// 狭い画面（スマホ）では、項目名の下に値を置く＝1行が窮屈にならない。
+ '@media (max-width:480px){'
+   '.pcstR{flex-direction:column;gap:4px;padding:15px 16px}'
+   '.pcstK{flex:none;font-size:1.1rem}'
+   '.pcstV{font-size:1.4rem}'
+ '}';

var PROCELLCSS_ = ''
+ '.pcLead{margin:10px 4px 14px;font-size:1rem;line-height:1.6;opacity:.9}'
+ '.pcCards{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}'
// ★2026-08-24：濃い紺を直に書いて文字色を決めていなかったので、**明るい画面設定の人には
//   濃い背景に濃い文字が出て読めなかった**（自宅PCの画面で同じ間違いをして発覚・同じ書き方がここに2か所）。
//   共通の決め方（--card＝箱の色／--ink＝文字の色）に直した。
+ '.pcCard{flex:1 1 30%;min-width:150px;background:var(--card);color:var(--ink);'
+   'border:1px solid var(--line);border-radius:14px;padding:14px 12px;text-align:center}'
+ '.pcName{font-size:1rem;opacity:.85;margin-bottom:6px}'
+ '.pcNum{font-size:2.4rem;font-weight:800;line-height:1.1;color:#7ad0ff}'
+ '.pcUnit{font-size:1rem;font-weight:600;margin-left:3px;opacity:.85}'
+ '.pcSub{font-size:.85rem;opacity:.75;margin-top:6px}'
+ '.pcTitle{font-weight:700;font-size:1.1rem;margin:6px 4px 8px}'
+ '.pcTableWrap{overflow-x:auto}'
+ '.pcTable{width:100%;border-collapse:collapse;font-size:.95rem}'
+ '.pcTable th{background:var(--card);color:var(--ink);padding:8px 10px;white-space:nowrap}'
+ '.pcTable td{border-bottom:1px solid rgba(255,255,255,.12);padding:8px 10px;white-space:nowrap}'
+ '.pcL{text-align:left}.pcR{text-align:right;font-weight:700}'
+ '.pcDim{opacity:.7}'
+ '.pcFoot{margin:14px 4px;font-size:.85rem;opacity:.7}';

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

// 「予約可能枠」＝新規男性／既存男性／新規女性／既存女性の4区分で、案内できる来店時刻。
// 中身の計算は事務所PCの 共通\予約可能枠.py が唯一の判断。ここは描くだけ（判断を書き写さない）。
// 見せ方＝区分ごとにひとまとまり（中は日付順）＋区分ごとに【コピー】（まるちゃん指示 2026-09-05）。
var AKI_WAKU_KINDS_ = ['新規男性', '既存男性', '新規女性', '既存女性'];
function akiWakuColor_(kind) {
  if (kind === '新規男性') return '#2563eb';
  if (kind === '既存男性') return '#1e3a8a';
  if (kind === '新規女性') return '#db2777';
  return '#831843';
}

// 1日ぶんのカード。data-date（ISO日付）を持たせて日にち検索の絞り込みに使う。
/** ★2026-09-11 まるちゃん指示「完全版」＝その日1日の時間割。
 *  縦が時間、横が「施術者」と「施術室」の列（間は太い線で分ける）。
 *  ・空きの帯には**始まりと終わりの時刻を直接書く**（左の目盛りと見比べなくてよい）。
 *  ・1時間ごとに横線（30分は点線）。
 *  ・色は必ず共通の正本（部屋＝roomColor_／担当＝staffColor_）。自作の配色は作らない。
 *  ・施術者の並びはオリーブ→みかん→トマト→マンゴー。**パインは出さない**（まるちゃん指示）。
 *    マンゴーはその日出勤していれば出る（出勤していない人はデータに入らない）。
 *  材料は akijikan.json にすでに入っている物だけ（事務所PC側は変えていない）。 */
/** ★2026-09-11 まるちゃん指示：狭い列の見出しは**決まった位置で折り返す**（自動まかせにしない）。
 *  施術者＝「マーク＋名前の1文字目」で折り返す（🍊み／かん・🍅ト／マト）。
 *  施術室＝FREE／DOM・COS／MOS・STAR／/福。HAPPY・LUCKYはそのまま1行。 */
var AKI_ROOM_WRAP_ = { 'FREEDOM': ['FREE', 'DOM'], 'COSMOS': ['COS', 'MOS'], 'STAR/福': ['STAR', '/福'] };
function akiStaffTag_(emoji, name) {
  var cs = Array.from(String(name || ''));
  if (cs.length <= 1) return esc_(emoji) + esc_(name);
  return esc_(emoji) + esc_(cs[0]) + '<br>' + esc_(cs.slice(1).join(''));
}
function akiRoomTag_(room) {
  var nm = (typeof shortRoomName_ === 'function') ? shortRoomName_(room) : room;
  var w = AKI_ROOM_WRAP_[nm];
  return w ? (esc_(w[0]) + '<br>' + esc_(w[1])) : esc_(nm);
}

var AKI_STAFF_ORDER_ = ['🫒', '🍊', '🍅', '🥭'];   // パイン🍍は出さない
// ★施術室の並び（まるちゃん指示 2026-09-11）＝コスモスはフリーダムの左。
var AKI_ROOM_ORDER_ = ['COSMOS', 'FREEDOM', 'HAPPY', 'LUCKY', 'STAR/福/🇫🇷'];
var AKI_PX_ = 1.7;                                  // 1分あたりの高さ

function akiHm_(m) { return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); }
function akiMin_(hm) {
  var p = String(hm || '').split(':');
  return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
}
/** 枠（空き）の外側＝埋まっている所を出す。 */
function akiBusy_(ws, we, slots) {
  var out = [], cur = ws, i;
  var ss = (slots || []).slice().sort(function (a, b) { return akiMin_(a.s) - akiMin_(b.s); });
  for (i = 0; i < ss.length; i++) {
    var a = akiMin_(ss[i].s), b = akiMin_(ss[i].e);
    if (a > cur) out.push([cur, a]);
    cur = Math.max(cur, b);
  }
  if (cur < we) out.push([cur, we]);
  return out;
}
function akiFullCard_(day) {
  var st = (day.staff || []).filter(function (x) {
    return AKI_STAFF_ORDER_.indexOf(x.emoji) >= 0;     // パインを外す
  }).sort(function (a, b) {
    return AKI_STAFF_ORDER_.indexOf(a.emoji) - AKI_STAFF_ORDER_.indexOf(b.emoji);
  });
  // 部屋は決まった順に並べる（データの入っている順に左右されない）。知らない部屋はうしろ。
  var rm = (day.rooms_free || []).slice().sort(function (a, b) {
    var ia = AKI_ROOM_ORDER_.indexOf(a.room), ib = AKI_ROOM_ORDER_.indexOf(b.room);
    if (ia < 0) ia = 99; if (ib < 0) ib = 99;
    return ia - ib;
  });
  if (!st.length && !rm.length) return '<div class="akinone">（この日は出せる予定がありません）</div>';

  // 画面に出す時間の幅＝その日の出勤と部屋の空きが収まる範囲
  var lo = 24 * 60, hi = 0, i, j, k;
  for (i = 0; i < st.length; i++) {
    var sh = String(st[i].shift || '').split('-');
    if (sh.length === 2) { lo = Math.min(lo, akiMin_(sh[0])); hi = Math.max(hi, akiMin_(sh[1])); }
    for (j = 0; j < (st[i].slots || []).length; j++) {
      lo = Math.min(lo, akiMin_(st[i].slots[j].s)); hi = Math.max(hi, akiMin_(st[i].slots[j].e));
    }
  }
  for (i = 0; i < rm.length; i++) {
    for (j = 0; j < (rm[i].slots || []).length; j++) {
      lo = Math.min(lo, akiMin_(rm[i].slots[j].s)); hi = Math.max(hi, akiMin_(rm[i].slots[j].e));
    }
  }
  if (hi <= lo) return '<div class="akinone">（この日は出せる予定がありません）</div>';
  lo = Math.floor(lo / 60) * 60; hi = Math.ceil(hi / 60) * 60;
  var H = Math.round((hi - lo) * AKI_PX_);

  // ★空きの帯には「いつからいつまで・誰の列か」を持たせる（押せるようにするため・2026-09-11）。
  //   空き時間検索では押しても何も起きない（押す仕掛けを付けるのは施術後の予約の側）。
  function blk(cls, a, b, color, withTime, kind, who) {
    var top = Math.round((a - lo) * AKI_PX_), h = Math.round((b - a) * AKI_PX_);
    var dat = kind ? (' data-s="' + akiHm_(a) + '" data-e="' + akiHm_(b) + '"' +
                      ' data-kind="' + kind + '" data-who="' + esc_(who || '') + '"') : '';
    return '<div class="akfblk ' + cls + '" style="top:' + top + 'px;height:' + h + 'px' +
      (color ? ';background:' + color : '') + '"' + dat + '>' +
      (withTime ? '<span class="akfa">' + akiHm_(a) + '</span>' +
                  '<span class="akfb">' + akiHm_(b) + '</span>' : '') + '</div>';
  }
  function lines() {
    var o = '', t = lo;
    while (t <= hi) {
      o += '<div class="akfline" style="top:' + Math.round((t - lo) * AKI_PX_) + 'px"></div>';
      if (t + 30 <= hi) o += '<div class="akfline half" style="top:' +
        Math.round((t + 30 - lo) * AKI_PX_) + 'px"></div>';
      t += 60;
    }
    return o;
  }

  var head = '<div class="akfhead"><div class="akfx"></div>';
  for (i = 0; i < st.length; i++) {
    head += '<div class="akfhc"><span class="akftag" style="background:' + staffColor_(st[i].emoji) +
      '">' + akiStaffTag_(st[i].emoji, st[i].name) + '</span></div>';
  }
  head += '<div class="akfsep"></div>';
  for (i = 0; i < rm.length; i++) {
    head += '<div class="akfhc"><span class="akftag" style="background:' + roomColor_(rm[i].room) +
      '">' + akiRoomTag_(rm[i].room) + '</span></div>';
  }
  head += '</div>';

  var body = '<div class="akfboard"><div class="akfaxis" style="height:' + H + 'px">';
  for (var t = lo; t <= hi; t += 60) {
    body += '<div class="akft" style="top:' + Math.round((t - lo) * AKI_PX_) + 'px">' + akiHm_(t) + '</div>';
  }
  body += '</div><div class="akfcols" style="height:' + H + 'px">';
  for (i = 0; i < st.length; i++) {
    var sh2 = String(st[i].shift || '').split('-');
    var ws = sh2.length === 2 ? akiMin_(sh2[0]) : lo, we = sh2.length === 2 ? akiMin_(sh2[1]) : hi;
    var col = '<div class="akfcol">' + lines();
    if (ws > lo) col += blk('akfoff', lo, ws, '', false);
    if (we < hi) col += blk('akfoff', we, hi, '', false);
    var bs = akiBusy_(ws, we, st[i].slots);
    for (k = 0; k < bs.length; k++) col += blk('akfbusy', bs[k][0], bs[k][1], '', false);
    for (k = 0; k < (st[i].slots || []).length; k++) {
      col += blk('akffree', akiMin_(st[i].slots[k].s), akiMin_(st[i].slots[k].e),
                 staffColor_(st[i].emoji), true, 'staff', st[i].emoji + st[i].name);
    }
    body += col + '</div>';
  }
  body += '<div class="akfsep2"></div>';
  for (i = 0; i < rm.length; i++) {
    var col2 = '<div class="akfcol">' + lines();
    var bs2 = akiBusy_(lo, hi, rm[i].slots);
    for (k = 0; k < bs2.length; k++) col2 += blk('akfbusy', bs2[k][0], bs2[k][1], '', false);
    for (k = 0; k < (rm[i].slots || []).length; k++) {
      col2 += blk('akffree', akiMin_(rm[i].slots[k].s), akiMin_(rm[i].slots[k].e),
                  roomColor_(rm[i].room), true, 'room', shortRoomName_(rm[i].room));
    }
    body += col2 + '</div>';
  }
  body += '</div></div>';
  return '<div class="akfull">' + head + body + '</div>';
}

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
    '<div class="akisec akisec-full" data-sec="full">' +
      akiFullCard_(day) +
    '</div>' +
    '<div class="akisec akisec-time akihidden" data-sec="time">' +
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
 *  既定は完全版だけON＝まるちゃん指示 2026-09-11）。データは全部JSONに入っているので、切替に読み直しは不要。 */
function renderAkijikanPage_(d, base, staff, dev) {
  var days = d.days || [];
  var cards = days.length
    ? days.map(akiDayCard_).join('\n')
    : '<div class="akinone">データがありません</div>';
  // 予約可能枠は日付の絞り込みに合わせてその場で組み直すので、素の材料をページに載せておく。
  // ★開発者だけに出す（まるちゃん指示 2026-09-05／新しいボタンは既定で開発者のみ＝共通の決まり）。
  //   スタッフ・幹部にはボタンも材料も渡さない（画面のもとを見ても中身が分からない）。
  var wakuOn = !!dev && !staff;
  var wakuData = wakuOn
    ? '<script>var AKIWAKU_=' + JSON.stringify(d.waku || []) + ';</scr' + 'ipt>'
    : '';

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
    // ★完全版＝その日1日の時間割（まるちゃん指示 2026-09-11）。各時間帯別の左に置く。
    '<button type="button" class="akichip on" data-sec="full">完全版</button>' +
    '<button type="button" class="akichip" data-sec="time">各時間帯別</button>' +
    '<button type="button" class="akichip" data-sec="staff">スタッフ別</button>' +
    '<button type="button" class="akichip" data-sec="rooms">施術室別</button>' +
    (wakuOn ? '<button type="button" class="akichip akiwakubtn" data-sec="waku">予約可能枠出力</button>' : '') +
  '</div>' +
  '<div id="akidays">' + cards + '</div>' +
  (wakuOn ? '<div id="akiwakubox" class="akiwakubox akihidden"></div>' : '') +
  '<div class="akinone" id="akiDateEmpty" hidden>この期間には表示できるデータがありません。期間を変えてください。</div>' +
'</div>' +
wakuData +
AKISCRIPT_;
}

// 表示チップ（各時間帯別／スタッフ別／施術室別）のON/OFFで全日カードのセクションを一括切替。
// ＋日にち検索：<input type=date>2つ＋プリセットで、90日ぶん既に取得済みのデータを
//   その場で絞り込むだけ（PCに問い合わせ直さない＝一瞬で切り替わる。[[project_superzuko_app]]方針）。
var AKISCRIPT_ =
'<script>(function(){' +
'var chips=[].slice.call(document.querySelectorAll(".akichip"));' +
// ★予約可能枠（2026-09-05 まるちゃん指示）＝区分ごとにひとまとまり（中は日付順）＋区分ごとに
//   【コピー】。日付・曜日の絞り込みに合わせてその場で組み直す。枠が1つも無い日は入れない。
'var wakuBox=document.getElementById("akiwakubox");' +
'var daysBox=document.getElementById("akidays");' +
'var WKINDS=["新規男性","既存男性","新規女性","既存女性"];' +
'var WCOL={"新規男性":"#2563eb","既存男性":"#1e3a8a","新規女性":"#db2777","既存女性":"#831843"};' +
// 日本のお客様向け（🇯🇵・9/8（火））を4つ出したあと、台湾のお客様向け（🇹🇼・9/8（二））を4つ出す。
// 曜日の書き分けは事務所PCが両方の形で渡してくる（dh／dh_zh）＝画面で作らない。
'var WGROUPS=[{flag:"🇯🇵",zh:false},{flag:"🇹🇼",zh:true}];' +
'function wakuText_(kind,zh){' +
'  var out=[];' +
'  (window.AKIWAKU_||[]).forEach(function(w){' +
'    if(!dateVisible_(w.date)) return;' +
'    var list=(w["枠"]||{})[kind]||[];' +
'    if(!list.length) return;' +
'    out.push(zh ? (w.dh_zh||w.dh) : w.dh); out.push(list.join(" / "));' +
'  });' +
'  return out.join("\\n");' +
'}' +
'function drawWaku_(){' +
'  if(!wakuBox) return;' +
'  var html="";' +
'  WGROUPS.forEach(function(g){' +
'    html += WKINDS.map(function(k){' +
'      var txt=wakuText_(k,g.zh);' +
'      var lines=txt? txt.split("\\n") : [];' +
'      var body="";' +
'      for(var i=0;i<lines.length;i+=2){' +
'        body+= \'<div class="akiwdh">\'+lines[i]+\'</div><div class="akiwtimes">\'+lines[i+1]+\'</div>\';' +
'      }' +
'      if(!body) body=\'<div class="akinone">この期間に案内できる時間はありません</div>\';' +
'      var za=\' data-zh="\'+(g.zh?"1":"0")+\'"\';' +
'      return \'<div class="akiwsec" data-kind="\'+k+\'"\'+za+\'>\'+' +
'        \'<div class="akiwhead"><span class="akiwk" style="background:\'+WCOL[k]+\'">\'+' +
'          \'<span class="akiwflag">\'+g.flag+\'</span>\'+k+\'</span>\'+' +
'        \'<button type="button" class="akiwcopy" data-kind="\'+k+\'"\'+za+\'>コピー</button></div>\'+body+\'</div>\';' +
'    }).join("");' +
'  });' +
'  wakuBox.innerHTML = html;' +
'  [].slice.call(wakuBox.querySelectorAll(".akiwcopy")).forEach(function(b){' +
'    b.addEventListener("click",function(){ copyWaku_(b); });' +
'  });' +
'}' +
'function copyWaku_(btn){' +
'  var txt=wakuText_(btn.getAttribute("data-kind"), btn.getAttribute("data-zh")==="1");' +
'  if(!txt){ btn.textContent="なし"; setTimeout(function(){ btn.textContent="コピー"; },1200); return; }' +
'  function done(){ btn.textContent="コピーしました"; btn.classList.add("done");' +
'    setTimeout(function(){ btn.textContent="コピー"; btn.classList.remove("done"); },1500); }' +
'  if(navigator.clipboard&&navigator.clipboard.writeText){' +
'    navigator.clipboard.writeText(txt).then(done,function(){ fallbackCopy_(txt,done); });' +
'  } else { fallbackCopy_(txt,done); }' +
'}' +
'function fallbackCopy_(txt,cb){' +
'  var ta=document.createElement("textarea"); ta.value=txt;' +
'  ta.style.position="fixed"; ta.style.left="-9999px"; document.body.appendChild(ta);' +
'  ta.select(); try{ document.execCommand("copy"); cb(); }catch(e){}' +
'  document.body.removeChild(ta);' +
'}' +
'chips.forEach(function(c){ c.addEventListener("click",function(){' +
'  var sec=c.getAttribute("data-sec");' +
'  chips.forEach(function(x){ x.classList.toggle("on", x===c); });' +
'  var isWaku=(sec==="waku");' +
'  if(daysBox) daysBox.classList.toggle("akihidden", isWaku);' +
'  if(wakuBox) wakuBox.classList.toggle("akihidden", !isWaku);' +
'  if(isWaku){ drawWaku_(); return; }' +
'  ["full","time","staff","rooms"].forEach(function(s){' +
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
// その日を出すか（期間＋曜日の絞り込み）。日カードも予約可能枠も同じこの1つで決める
// ＝2つに書き写すと必ずズレるため（2026-09-05）。
'function dateVisible_(dt){' +
'  if(!dt) return false;' +
'  if(manualDates&&manualDates.length) return manualDates.indexOf(dt)>-1 && wdVisible_(dt);' +
'  return dt>=rangeFrom && dt<=rangeTo && wdVisible_(dt);' +
'}' +
'function applyFilter(){' +
'  var shown=0;' +
'  days.forEach(function(el){' +
'    var vis=dateVisible_(el.getAttribute("data-date")||"");' +
'    el.classList.toggle("akidatehide", !vis);' +
'    if(vis) shown++;' +
'  });' +
'  if(wakuBox&&!wakuBox.classList.contains("akihidden")) drawWaku_();' +
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

// ★時間割（完全版）の見た目。空き時間検索と「施術後の予約」の**両方が使う**ので1本にまとめた
//   （書き写さない・2026-09-11）。時刻の字の色は、置かれた画面に合わせて外から決められる
//   （空き時間検索は --akiink／施術後の予約は青緑の地なので白に落ちる）。
var AKFCSS_ =
// ★下の端の時刻（18:00など）は目盛りの線の真横に出すため半分はみ出す。
//   はみ出した分の逃げ場を下に作らないと切れる（まるちゃん指摘 2026-09-11）。
// ★時間割の箱だけ黒い地にする（まるちゃん指示 2026-09-11）。色の帯がはっきり浮く。
//   まわり（各時間帯別・スタッフ別・施術室別）は今までどおり。
'  .akfull{ overflow:hidden; background:#0d0d0d; color:#fff; border-radius:12px;' +
'    padding:10px 8px 14px; }' +
'  .akfhead{ display:flex; padding:2px 0 6px; }' +
'  .akfx{ width:40px; flex:none; }' +
'  .akfhc{ flex:1; min-width:0; text-align:center; padding:0 1px; }' +
'  .akftag{ display:block; width:100%; box-sizing:border-box; color:#fff; border-radius:8px;' +
'    padding:3px 1px; text-align:center;' +
'    font-size:10px; font-weight:900; line-height:1.15; overflow-wrap:anywhere;' +
'    text-shadow:0 1px 2px rgba(0,0,0,.35); }' +
'  .akfsep{ flex:none; width:10px; }' +
'  .akfboard{ display:flex; }' +
'  .akfaxis{ width:40px; flex:none; position:relative; }' +
'  .akft{ position:absolute; right:3px; font-size:11px; font-weight:800; color:#fff;' +
'    transform:translateY(-50%); }' +
'  .akfcols{ flex:1; min-width:0; display:flex; position:relative;' +
'    background:rgba(127,127,127,.10); border-radius:10px; }' +
'  .akfcol{ flex:1; min-width:0; position:relative; border-right:1px solid rgba(127,127,127,.22); }' +
'  .akfcol:last-child{ border-right:0; }' +
'  .akfsep2{ flex:none; width:10px; }' +
'  .akfline{ position:absolute; left:0; right:0; border-top:1px solid rgba(127,127,127,.35); }' +
'  .akfline.half{ border-top:1px dotted rgba(127,127,127,.20); }' +
'  .akfblk{ position:absolute; left:2px; right:2px; border-radius:7px; overflow:hidden; }' +
'  .akfbusy{ background:rgba(127,127,127,.32); }' +
'  .akfoff{ background:repeating-linear-gradient(45deg,rgba(127,127,127,.30) 0 6px,transparent 6px 12px); }' +
'  .akffree{ box-shadow:0 2px 6px rgba(0,0,0,.20); }' +
'  .akfa,.akfb{ position:absolute; left:3px; font-size:10px; font-weight:900; color:#fff;' +
'    text-shadow:0 1px 2px rgba(0,0,0,.55); }' +
'  .akfa{ top:2px; } .akfb{ bottom:2px; }' +
'';

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
AKFCSS_ +
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
// 予約可能枠（新規男性／既存男性／新規女性／既存女性）＝区分ごとにひとまとまり＋コピー。
// ★予約可能枠を選んでいる間は日ごとのカードを丸ごと隠す（この1行が無いと両方出てしまう）。
'  #akidays.akihidden{ display:none; }' +
'  .akiwakubox.akihidden{ display:none; }' +
'  .akiwsec{ background:var(--akicard); border:1px solid var(--akiline); border-radius:14px;' +
'    padding:12px clamp(8px,3.6vw,14px); margin-bottom:12px; }' +
'  .akiwhead{ display:flex; align-items:center; justify-content:space-between; gap:10px;' +
'    border-bottom:1px solid var(--akiline); padding-bottom:9px; margin-bottom:9px; }' +
'  .akiwk{ display:inline-flex; align-items:center; gap:7px; color:#fff; font-weight:800;' +
'    font-size:clamp(15px,5vw,19px); padding:7px 14px; border-radius:11px; }' +
'  .akiwflag{ font-size:clamp(17px,5.6vw,21px); line-height:1; }' +
'  .akiwcopy{ font-family:inherit; font-size:clamp(13px,4.2vw,16px); font-weight:800; color:#fff;' +
'    background:var(--akiprimary); border:1px solid var(--akiprimary); border-radius:10px;' +
'    padding:9px clamp(10px,4vw,16px); cursor:pointer; white-space:nowrap; }' +
'  .akiwcopy:active{ transform:translateY(1px); }' +
'  .akiwcopy.done{ background:#16a34a; border-color:#16a34a; }' +
'  .akiwdh{ font-weight:800; font-size:clamp(15px,5vw,19px); color:var(--akisub); margin-top:8px; }' +
'  .akiwdh:first-of-type{ margin-top:0; }' +
'  .akiwtimes{ font-weight:800; font-variant-numeric:tabular-nums; line-height:1.6;' +
'    font-size:clamp(16px,5.4vw,21px); color:var(--akiink); margin:2px 0 4px; }' +
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
  // t=画面に出す名前／d=説明／c=コピーする合言葉（省略時は t をコピー）。
  var KOTOBA = [
    { t: 'インスタを操作したい',
      d: 'インスタのDM返信・投稿・ストーリーズ・投稿のアーカイブなどを操作（3アカウント／ログイン使い回し）' },
    { t: '画像のURLをつくりたい',
      d: '画像（料金表・お支払い方法など）を、お客様がそのまま開ける短いリンク（x.gd/〇〇）に変える' },
    { t: '画像からAIタグ除去',
      d: 'ChatGPT等で作った画像をSNSに上げると付く「AI情報／AIで作成」の札を消す。画像に埋め込まれた"AIが作った"記録だけを抜き、絵（色・大きさ）は元と完全に同じまま。画像を貼って「AIタグ除去」と言うだけ' },
    { t: '家計簿操作ツール', c: '家計簿',
      d: '「家計簿」と貼るだけで、話した日々の出費を家計簿に記入。例：「きのう うーばー 206」→ 昨日のUberEats 206元を記入（一人の食事＝ノーマル／それ以外は確認、クレカ払いはカードにも反映）' },
    { t: '画像リンクに画像を追加', c: '画像リンクに追加',
      d: '画像を渡すと、縦横（縦横の長さ）はそのまま・スマホで軽く見れる重さに縮めて、各種LINKの「画像リンク」に新しいボタンとして足す。渡す時に「どの並び・ボタン名で出すか」（例：イーライト後／頭皮ケア 日本語）も伝える。画像を貼って「画像リンクに追加」と言うだけ' }
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
    var copyText = k.c || k.t;   // コピーする合言葉（無ければ表示名をそのまま）
    cards += '<div class="cttcard" onclick="cttCopy(this)" data-t="' + esc_(copyText) + '">' +
      '<div class="cttt">' + esc_(k.t) + '</div>' +
      '<div class="cttd">' + esc_(k.d) + '</div>' +
      '<div class="cttrow"><button type="button" class="cttcopy" onclick="event.stopPropagation();cttCopy(this)" data-t="' + esc_(copyText) + '">📋 コピー</button>' +
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
// ★元データのGoogleシート「ズコLINK」タブ（オーナーが直接編集する表）。開発者ボタンの飛び先。
var LK_SHEET_URL_ = 'https://docs.google.com/spreadsheets/d/16ta_ciEX_uPUxfy7eXq5aqrlKQyTmskB57pGxXyiXNY/edit?gid=2000945592';
// ★画像リンクの元データ「ズコ画像」タブ（オーナーが直接編集）。開発者ボタンの飛び先。
var LK_IMG_SHEET_URL_ = 'https://docs.google.com/spreadsheets/d/16ta_ciEX_uPUxfy7eXq5aqrlKQyTmskB57pGxXyiXNY/edit?gid=961471682';

// ★2026-08-12（まるちゃん）：各種LINKの入口を「URLリンク／画像リンク」の2択にした。
//   URLリンク＝今まで通りの案内リンク集（ズコLINKタブ）。画像リンク＝イーライト後などの
//   画像案内（ズコ画像タブ）。画像は押すとその場で送る／保存／コピーができる（機種で出し分け）。
//   見た目はスーパーズコのまま。d=links.json、imgs=images.json。
function renderLinksPage_(d, base, staff, dev) {
  var topics = (d && d.topics) || [];
  var list = topics.length
    ? topics.map(lkTopicBlock_).join('')
    : '<div class="lknone">まだ案内リンクが登録されていません。</div>';
  var homeHref = (base || '') + '?view=home' + roleSfx_(staff, dev);

  return '' +
'<style>' + LKCSS_ + LKIMGCSS_ + '</style>' +
'<div class="lkwrap">' +
  '<div class="lkbar">' +
    '<a class="lkhome" href="' + homeHref + '" target="_top">← TOPに戻る</a>' +
    '<span class="lkgen">生成: ' + esc_((d && d.generated_at) || '—') + '</span>' +
  '</div>' +
  '<div class="lkhead"><h1>🔗 各種LINK</h1></div>' +
  // 入口＝URLリンク／画像リンクの2択。押すと下の各セクションに切り替わる（同じページ内・再取得なし）。
  '<div id="lkhub" class="lkhub">' +
    '<button type="button" class="lkhubbtn" id="lkGoUrl"><span class="lkhubico">🔗</span><span>URLリンク</span></button>' +
    '<button type="button" class="lkhubbtn" id="lkGoImg"><span class="lkhubico">🖼️</span><span>画像リンク</span></button>' +
  '</div>' +
  // ── URLリンク（元の各種LINK） ──
  '<div id="lkurlsec" class="lksec" hidden>' +
    '<button type="button" class="lkback2" id="lkUrlBack">← 前に戻る</button>' +
    '<div class="lkhead2"><span class="lkhint">言語を選ぶとURLがコピーされます</span></div>' +
    // ★開発者(?dev=1)だけに出る「リンクを編集」「今すぐ反映」（共通ルール16）。ズコLINKタブが開く。
    (dev ? '<div class="lkdevbar">' +
      '<a class="lkedit" href="' + LK_SHEET_URL_ + '" target="_blank" rel="noopener">🔧 リンクを編集（追加・削除）</a>' +
      '<button type="button" class="lkrefresh" id="lkRefreshBtn">🔄 今すぐ反映</button>' +
    '</div>' : '') +
    '<div id="lklist">' + list + '</div>' +
  '</div>' +
  // ── 画像リンク（イーライト後などの画像案内） ──
  '<div id="lkimgsec" class="lksec" hidden>' +
    '<button type="button" class="lkback2" id="lkImgBack">← 前に戻る</button>' +
    '<div id="lkimgbody"></div>' +
  '</div>' +
'</div>' +
LKSCRIPT_ +
(dev ? lkDevScript_() : '') +
lkImgScript_(base || '');
}

// 画像リンクの中身（純JS・GAS API不使用）。入口の2択の切り替え＋「分類→ラベル→画像」の
// 行き来＋画像の送る/保存/コピー（機種で出し分け）を全部この埋め込みスクリプトで行う。
// スーパーズコは外枠(iframe)の中ではない静的ページなので、コピー/共有/保存はそのまま効く。
function lkImgScript_(base) {
  return '<script>(function(){' +
    'var BASE="' + base + '";' +   // ★名前リスト(images.json)はアプリと同じ速い置き場から取る（グーグル窓口の2〜3秒を避ける）
    'var CATS=null,imgLoading=false;' +   // ★画像データ。各種LINKを開いた瞬間に裏で先に取り始める（URL表示は待たない）
    'var hub=document.getElementById("lkhub");' +
    'var urlsec=document.getElementById("lkurlsec");' +
    'var imgsec=document.getElementById("lkimgsec");' +
    'var body=document.getElementById("lkimgbody");' +
    'var goUrl=document.getElementById("lkGoUrl"),goImg=document.getElementById("lkGoImg");' +
    'var urlBack=document.getElementById("lkUrlBack"),imgBack=document.getElementById("lkImgBack");' +
    'var level="cats",curCat=null,curGroup=null;' +   // ★curGroup＝いま開いている"まとめ"（無ければnull）
    'function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\\"/g,"&quot;");}' +
    'function showHub(){hub.hidden=false;urlsec.hidden=true;imgsec.hidden=true;}' +
    'function showUrl(){hub.hidden=true;urlsec.hidden=false;imgsec.hidden=true;}' +
    'function showImg(){hub.hidden=true;urlsec.hidden=true;imgsec.hidden=false;}' +
    // 画像データを取りに行く。1回の通信が失敗しても自動でもう数回やり直す（グーグル窓口の一時的なエラー対策）。
    'function tryFetch(n,done){' +
      'fetch(BASE+"images.json?cb="+Date.now(),{cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.json();})' +
        '.then(function(j){done(true,j);})' +
        '.catch(function(){if(n>1){setTimeout(function(){tryFetch(n-1,done);},600);}else{done(false);}});}' +
    'function loadImages(){if(imgLoading||CATS)return;imgLoading=true;' +
      'tryFetch(4,function(ok,r){imgLoading=false;' +
        'if(ok){CATS=(r&&r.cats)||[];if(!imgsec.hidden)renderCats();}' +
        'else if(!imgsec.hidden){body.innerHTML="<div class=\\"lknone\\">画像の読み込みに失敗しました。もう一度お試しください。</div>";}' +
      '});}' +
    // 画像リンクを押した時：もう手元にあれば即出す。取得中なら「読み込み中」、まだなら取りに行く。
    'function openImg(){showImg();if(CATS){renderCats();return;}' +
      'body.innerHTML="<div class=\\"lkimgmsg\\">読み込み中…</div>";if(!imgLoading)loadImages();}' +
    'if(goUrl)goUrl.addEventListener("click",function(){showUrl();});' +
    'if(goImg)goImg.addEventListener("click",openImg);' +
    'loadImages();' +   // ★各種LINKを開いた瞬間に裏で先読み（押した時にはもう手元にある＝速い・失敗しにくい）

    'if(urlBack)urlBack.addEventListener("click",function(){showHub();});' +
    'if(imgBack)imgBack.addEventListener("click",function(){' +
      'if(level==="image"){renderItems(curCat);}else if(level==="items"){if(curCat&&curCat.group){renderGroup(curCat.group);}else{renderCats();}}' +
      'else if(level==="group"){renderCats();}else{showHub();}' +
    '});' +
    // 一番上の並び：まとめ名が付いた分類は"まとめボタン"1つにたたみ、付いていない分類はそのまま並べる（表のA列で決まる）。
    'function renderCats(){level="cats";curCat=null;curGroup=null;' +
      'if(!CATS.length){body.innerHTML="<div class=\\"lknone\\">まだ画像の案内が登録されていません。</div>";return;}' +
      'var rows=[],seen={};' +
      'for(var i=0;i<CATS.length;i++){var g=CATS[i].group||"";' +
        'if(g){if(!seen[g]){seen[g]=1;rows.push({group:g});}}else{rows.push({cat:CATS[i]});}}' +
      'var h="<div class=\\"lkimgcats\\">";' +
      'for(var j=0;j<rows.length;j++){h+="<button type=\\"button\\" class=\\"lkcatbtn\\" data-i=\\""+j+"\\">"+esc(rows[j].group||rows[j].cat.name)+"</button>";}' +
      'h+="</div>";' +
      'body.innerHTML=h;var bs=body.querySelectorAll(".lkcatbtn");' +
      'for(var k=0;k<bs.length;k++){(function(idx){bs[idx].addEventListener("click",function(){' +
        'if(rows[idx].group){renderGroup(rows[idx].group);}else{renderItems(rows[idx].cat);}' +
      '});})(k);}' +
    '}' +
    // まとめボタンを押した時：そのまとめに入っている分類だけを並べる。
    'function renderGroup(g){level="group";curGroup=g;curCat=null;' +
      'var list=[];for(var i=0;i<CATS.length;i++){if((CATS[i].group||"")===g)list.push(CATS[i]);}' +
      'var h="<div class=\\"lkimgtitle\\">"+esc(g)+"</div><div class=\\"lkimgcats\\">";' +
      'for(var j=0;j<list.length;j++){h+="<button type=\\"button\\" class=\\"lkcatbtn\\" data-i=\\""+j+"\\">"+esc(list[j].name)+"</button>";}h+="</div>";' +
      'body.innerHTML=h;var bs=body.querySelectorAll(".lkcatbtn");' +
      'for(var k=0;k<bs.length;k++){(function(idx){bs[idx].addEventListener("click",function(){renderItems(list[idx]);});})(k);}' +
    '}' +
    'function renderItems(cat){level="items";curCat=cat;var items=(cat&&cat.items)||[];' +
      'var h="<div class=\\"lkimgtitle\\">"+esc(cat.name)+"</div><div class=\\"lkimgcats\\">";' +
      'for(var i=0;i<items.length;i++){h+="<button type=\\"button\\" class=\\"lkcatbtn\\" data-i=\\""+i+"\\">"+esc(items[i].label)+"</button>";}h+="</div>";' +
      'body.innerHTML=h;var bs=body.querySelectorAll(".lkcatbtn");for(var k=0;k<bs.length;k++){(function(idx){bs[idx].addEventListener("click",function(){renderImage(items[idx]);});})(k);}' +
    '}' +
    'function renderImage(item){level="image";var u=item.url;var ua=navigator.userAgent||"";' +
      'var isIOS=/iPhone|iPad|iPod/i.test(ua)||(/Macintosh/.test(ua)&&"ontouchend" in document);var isAndroid=/Android/i.test(ua);' +
      'var h="<div class=\\"lkimgtitle\\">"+esc(item.label)+"</div>";' +
      'if(!isIOS&&!isAndroid){h+="<button type=\\"button\\" class=\\"lkimgbtn\\" id=\\"lkCopy\\">📋 この画像をコピーする（LINEに貼り付け）</button>";}' +
      'h+="<button type=\\"button\\" class=\\"lkimgbtn"+((!isIOS&&!isAndroid)?" lksub":"")+"\\" id=\\"lkSave\\">"+((!isIOS&&!isAndroid)?"うまくいかない時（ダウンロードに保存）":"📷 この画像を保存する")+"</button>";' +
      'h+="<div class=\\"lkimgmsg\\" id=\\"lkMsg\\"></div>";' +
      'h+="<div class=\\"lkimgwrap\\"><img src=\\""+esc(u)+"\\" alt=\\""+esc(item.label)+"\\"></div>";' +
      'body.innerHTML=h;var msg=document.getElementById("lkMsg");' +
      'function directSave(){if(msg)msg.textContent="保存しています…";fetch(u).then(function(r){return r.blob();}).then(function(b){var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=(u.split("/").pop()||"image.jpg");document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},4000);if(msg)msg.textContent=(isAndroid?"保存しました。「ダウンロード」フォルダ（写真アプリの「ダウンロード」）に入ります。":"保存しました。「ダウンロード」フォルダに入ります。");}).catch(function(){if(msg)msg.textContent="";window.open(u,"_blank");});}' +
      'function iosSave(){if(!(navigator.canShare&&navigator.share)){directSave();return;}if(msg)msg.textContent="準備しています…";fetch(u).then(function(r){return r.blob();}).then(function(b){var f=new File([b],(u.split("/").pop()||"image.jpg"),{type:b.type||"image/jpeg"});if(!navigator.canShare({files:[f]}))throw new Error("no");if(msg)msg.textContent="出てきたメニューで「画像を保存」を押すと写真に入ります（LINEを押せばそのまま送れます）。";return navigator.share({files:[f]});}).catch(function(e){if(e&&e.name==="AbortError"){if(msg)msg.textContent="";return;}directSave();});}' +
      'function toPng(blob){return new Promise(function(res,rej){var im=new Image();var ou=URL.createObjectURL(blob);im.onload=function(){var c=document.createElement("canvas");c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext("2d").drawImage(im,0,0);URL.revokeObjectURL(ou);c.toBlob(function(pb){pb?res(pb):rej(new Error("x"));},"image/png");};im.onerror=function(){URL.revokeObjectURL(ou);rej(new Error("x"));};im.src=ou;});}' +
      'function pcCopy(){if(!(navigator.clipboard&&navigator.clipboard.write&&window.ClipboardItem)){directSave();return;}if(msg)msg.textContent="コピーしています…";fetch(u).then(function(r){return r.blob();}).then(function(b){return toPng(b);}).then(function(png){return navigator.clipboard.write([new ClipboardItem({"image/png":png})]);}).then(function(){if(msg)msg.textContent="コピーしました。LINEの入力らんで貼り付け（Ctrl+V）してください。";}).catch(function(){if(msg)msg.textContent="コピーできなかったので、保存にします…";directSave();});}' +
      'var cp=document.getElementById("lkCopy"),sv=document.getElementById("lkSave");' +
      'if(cp)cp.addEventListener("click",pcCopy);' +
      'if(sv)sv.addEventListener("click",function(){if(isIOS)iosSave();else directSave();});' +
    '}' +
  '})();</scr' + 'ipt>';
}

// ★開発者だけの「今すぐ反映」ボタンの中身（2026-08-06）。押すと事務所PCへ命令(op=links_refresh)を送り、
//   Googleシートを読み直して各種LINKを最新にする。処理中・成功・失敗の見せ方は他の書き込みボタンと同じ
//   共通の全画面表示(szOvShow_/szBusyHtml_/szDoneHtml_)・小窓(szPopup_)にそろえる（共通ルール）。
function lkDevScript_() {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  return '<script>(function(){' +
    'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
    'var DEV="";try{DEV=localStorage.getItem("sz_device")||"";}catch(e){}' +
    'function jsonp(params,onR){var cb="__lk"+Date.now()+Math.floor(Math.random()*1000);' +
      'window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
      'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
      'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();' +
      'sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
    'function poll(id,n){n=n||0;if(n>40){szOvHide_();szPopup_("エラーが発生しました。通信に失敗しました。もう一度お試しください。");return;}' +
      'jsonp({action:"status",key:KEY,id:id},function(r){' +
        'if(!r||!r.ok){szOvHide_();szPopup_("エラーが発生しました。もう一度お試しください。");return;}' +
        'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){poll(id,n+1);},700);return;}' +
        'if(r.status!=="done"){szOvHide_();szPopup_((r.result)||"エラーが発生しました。りゅうさんにお伝えください。");return;}' +
        'szOvShow_(szDoneHtml_("最新のリンクに反映しました","更新する"),"#16a34a");' +
        'var b=document.getElementById("szDoneBack");if(b){b.addEventListener("click",function(){location.reload();});}' +
      '});}' +
    'var btn=document.getElementById("lkRefreshBtn");' +
    'if(btn){btn.addEventListener("click",function(){' +
      'szOvShow_("<div style=\\"font-size:66px;margin-bottom:20px;\\">⏳</div>' +
        '<div style=\\"color:#fff;font-size:33px;font-weight:800;line-height:1.5;margin-bottom:22px;\\">最新のリンクを反映しています</div>' +
        '<div style=\\"color:#eaf3f7;font-size:20px;line-height:1.8;max-width:420px;\\">お店の一覧表を読み直しています。少しお待ちください。</div>","#2C7A99");' +
      'jsonp({action:"submit",key:KEY,op:"links_refresh",who:"",role:"",device:DEV,fields:JSON.stringify({})},function(r){' +
        'if(!r||!r.ok||!r.id){szOvHide_();szPopup_("エラーが発生しました。通信に失敗しました。もう一度お試しください。");return;}' +
        'poll(r.id,0);' +
      '});' +
    '});}' +
  '})();</scr' + 'ipt>';
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
// ★2026-08-13：シートのC列は「URL1本だけ」とは限らず、案内文＋URL（複数行・URL複数本）が
//   まるごと入ることがある（オーナー運用）。大きいボタンは中身を"そのまま丸ごと"コピーする
//   のが正しいので、改行が消えないよう属性値に &#10; で残す。
//   プレビューは href に中身をそのまま入れていたため、文章混じりだと相対パス扱いになり
//   GitHub Pagesの404ページが開いていた（スタッフ報告）。中からURLだけを取り出して開き、
//   URLが1本も無い時はプレビュー自体を出さない。
// ★2026-08-18：1つの枠に案内が2つ（URL2本）入る運用になったのに、プレビューが最初の1本しか
//   開けず「画像しか出ない」と指摘を受けた。枠の中のURLを全部拾い、1本ごとにプレビューを出す。
//   2本以上ある時だけ「プレビュー①②…」と番号を付ける（順番＝枠の中に出てくる順）。
function lkLinkBtn_(lk) {
  var raw = String(lk.url == null ? '' : lk.url);
  var data = esc_(raw).replace(/\r\n|\r|\n/g, '&#10;');
  var urls = raw.match(/https?:\/\/[^\s"'<>]+/g) || [];
  var marks = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];
  var prevs = urls.map(function (u, i) {
    var label = urls.length > 1 ? 'プレビュー' + (marks[i] || (i + 1)) : 'プレビュー';
    return '<a class="lkprev" href="' + esc_(u) + '" target="_blank" rel="noopener">' + label + '</a>';
  }).join('');
  return '<div class="lkcell">' +
    '<button type="button" class="lkbtn" data-url="' + data + '">' +
      '<span class="lklang">' + esc_(lk.lang || '') + '</span>' +
      '<span class="lkcopy"></span>' +
    '</button>' +
    prevs +
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
// ★開発者だけに出る操作ボタン（編集＝緑・今すぐ反映＝青緑）。目立つ固定色（テーマ変数に頼らない）。
'  .lkdevbar{ display:flex; flex-wrap:wrap; gap:10px; margin:0 0 20px; }' +
'  .lkedit,.lkrefresh{ flex:1 1 160px; text-align:center; font-size:18px; font-weight:800; color:#fff;' +
'    text-decoration:none; border-radius:14px; padding:12px 14px; box-shadow:0 4px 14px rgba(0,0,0,.18);' +
'    font-family:inherit; cursor:pointer; appearance:none; -webkit-appearance:none; }' +
'  .lkedit{ background:#16a34a; border:1px solid #15803d; }' +
'  .lkrefresh{ background:#2C7A99; border:1px solid #256781; }' +
'  .lkedit:active,.lkrefresh:active{ transform:translateY(2px); }' +
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

// 画像リンク（URLリンク／画像リンクの入口＋画像の分類・ラベル・画像の見た目）。スーパーズコの見た目に合わせる。
var LKIMGCSS_ =
'  .lkhub{ display:flex; gap:14px; flex-wrap:wrap; margin:6px 0 20px; }' +
'  .lkhubbtn{ appearance:none; -webkit-appearance:none; font-family:inherit; cursor:pointer;' +
'    flex:1 1 160px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;' +
'    padding:26px 14px; font-size:24px; font-weight:800; color:#fff; background:#2C7A99;' +
'    border:1px solid #256781; border-radius:18px; box-shadow:0 4px 14px rgba(0,0,0,.18); }' +
'  .lkhubbtn:active{ transform:translateY(2px); }' +
'  .lkhubico{ font-size:40px; }' +
'  .lkback2{ appearance:none; -webkit-appearance:none; font-family:inherit; cursor:pointer;' +
'    font-size:.95rem; font-weight:800; color:var(--akiink); background:var(--akicard);' +
'    border:1px solid var(--akiline); border-radius:10px; padding:10px 16px; margin:0 0 16px; }' +
'  .lkback2:active{ transform:translateY(1px); }' +
'  .lkhead2{ margin:0 0 14px; }' +
'  .lkimgcats{ display:flex; flex-direction:column; gap:14px; }' +
'  .lkcatbtn{ appearance:none; -webkit-appearance:none; font-family:inherit; cursor:pointer;' +
'    display:block; width:100%; text-align:center; font-size:26px; font-weight:800; color:#1d4ed8;' +
'    background:#ffffff; border:1px solid #d7dee8; border-radius:18px; padding:20px 14px;' +
'    box-shadow:0 4px 14px rgba(0,0,0,.18); }' +
'  .lkcatbtn:active{ transform:translateY(2px); }' +
'  .lkimgtitle{ font-size:26px; font-weight:800; color:#fff; margin:2px 0 16px; line-height:1.3; }' +
'  .lkimgbtn{ appearance:none; -webkit-appearance:none; font-family:inherit; cursor:pointer;' +
'    display:block; width:100%; box-sizing:border-box; font-size:22px; font-weight:800; color:#fff;' +
'    background:#16a34a; border:1px solid #15803d; border-radius:16px; padding:16px 12px; margin:0 0 10px;' +
'    box-shadow:0 4px 14px rgba(0,0,0,.18); }' +
'  .lkimgbtn:active{ transform:translateY(2px); }' +
'  .lkimgbtn.lksub{ background:#ffffff; color:#16a34a; border:2px solid #16a34a; font-size:17px; box-shadow:none; }' +
'  .lkimgmsg{ color:#16a34a; font-weight:800; font-size:16px; margin:2px 0 10px; min-height:20px; }' +
'  @media (prefers-color-scheme:dark){ .lkimgmsg{ color:#7CFFB2; } }' +
'  .lkimgwrap img{ width:100%; display:block; border-radius:14px; box-shadow:0 4px 14px rgba(0,0,0,.25); background:#fff; }';

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
// ★2026-09-11：暗い色の設定だと濃い紺になって青緑の地に沈むので、白地＋濃い字に固定（戻るは全部同じ）。
'  .lhome{ flex:0 0 auto; color:#0f172a; text-decoration:none; font-weight:700; font-size:14px;' +
'    background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:9px 14px; }' +
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
// ★同じ理由（2026-09-11）＝こちらは白地なのに字の色だけ端末まかせだったので、
//   暗い色の設定だと**白地に白い字**になって読めなかった。字も濃い色に固定する。
'  .uhome { flex:0 0 auto; font-size:1rem; font-weight:800; color:#0f172a; text-decoration:none;' +
'    background:#fff; border:1px solid #e2e8f0; border-radius:999px; padding:11px 20px;' +
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
'  .rolebtn.sejutsugo::before { background:#0ea5e9; }' +
'  .rolebtn:active { transform:translateY(2px); }' +
'  @media (hover:hover){ .rolebtn:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(0,0,0,.14); } }' +
'  .ricon { flex:none; width:52px; height:52px; border-radius:13px; font-size:30px; display:grid; place-items:center; }' +
'  .rolebtn.kanri .ricon { background:rgba(245,158,11,.16); }' +
'  .rolebtn.jitsumu .ricon { background:rgba(22,163,74,.15); }' +
'  .rolebtn.kaihatsu .ricon { background:rgba(99,102,241,.15); }' +
'  .rolebtn.sejutsugo .ricon { background:rgba(14,165,233,.16); }' +
'  .rname { flex:1; min-width:0; font-size:1.6rem; font-weight:900; }' +
'  .rcount { flex:none; color:var(--sub); font-size:.95rem; font-weight:700; }' +
'  .backbar { margin:0 0 16px; }' +
// ★2026-09-11 まるちゃん「もどるがみえない」＝端末が暗い色の設定だと、戻るボタンが
//   濃い紺（--card）になって青緑の地に沈み、ほとんど見えなかった（パソコンの窓で発生）。
//   台湾トマトフォーマットの決まりは「白い丸ボタン」なので、端末の明暗に関係なく
//   **白地＋濃い字**に固定する（色を端末まかせにしない）。
'  .backbtn { display:inline-flex; align-items:center; gap:6px; cursor:pointer; background:#fff;' +
'    color:#0f172a; border:1px solid #e2e8f0; border-radius:999px; padding:9px 18px;' +
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
'  .tile.sejutsugo::before { background:#0ea5e9; }' +
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
'  .tile.sejutsugo .ticon { background:rgba(14,165,233,.16); }' +
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
// ★2026-09-11：暗い色の設定だと濃い紺になって青緑の地に沈むので、白地＋濃い字に固定（戻るは全部同じ）。
'  .homelink { flex:0 0 auto; font-size:.9rem; font-weight:700; color:#0f172a; text-decoration:none;' +
'    background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:10px 14px; }' +
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
// busy＝{title:"保存中です", done:"保存が完了しました"} を渡すと、全画面の〈処理中→完了〉表示にする
// （共通ルール2026-08-05／パソコンの同じ画面ともそろえる・2026-08-19まるちゃん指摘）。
'function poll_(id, tries, busy){' +
'  jsonp_({action:"status", key:KEY_, id:id}, function(r){' +
'    if(r&&r.ok&&(r.status==="done"||r.status==="error")){' +
'      if(busy){' +
'        if(r.status==="done"){' +
'          szOvShow_(szDoneHtml_(busy.done||"完了しました","戻る"),"#16a34a");' +
'          var _b=document.getElementById("szDoneBack");' +
'          if(_b) _b.addEventListener("click", function(){ szOvHide_(); });' +
'        } else { szOvHide_(); szPopup_("エラーが発生しました。"+(r.result||"")); }' +
'      } else { toast_((r.status==="done"?"✅ ":"⚠ ")+(r.result||"")); }' +
'      reload_();' +
'      return;' +
'    }' +
'    if(tries<=0){' +
'      if(busy){ szOvHide_(); szPopup_("時間切れです。事務所PCの状態をご確認ください。"); }' +
'      else { toast_("時間切れです。事務所PCの状態をご確認ください。"); }' +
'      return;' +
'    }' +
'    setTimeout(function(){ poll_(id, tries-1, busy); }, 5000);' +
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
'  send_("tile_settings","setval", JSON.stringify({t:"save", o:EO_, p:p, ph:EPCHIDDEN_}),' +
'    {title:"保存中です", done:"保存が完了しました"});' +
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
'      send_("tile_settings","setval", JSON.stringify({t:"reset", v:rid}),' +
'        {title:"選び直しにしています", done:"選び直しにしました"});' +
'    }' +
'    return true;' +
'  }' +
'  var mv=t.closest("[data-mv]");' +
'  if(mv){ moveTile_(mv.getAttribute("data-tid"), Number(mv.getAttribute("data-mv"))); return true; }' +
'  if(t.closest("#kAddBtn")){' +
'    var v=(document.getElementById("kAdd").value||"").trim();' +
'    if(!v){ toast_("名前を入れてください"); return true; }' +
'    send_("tile_settings","setval", JSON.stringify({t:"add", v:v}),' +
'      {title:"ユーザーを追加しています", done:"ユーザーを追加しました"});' +
'    document.getElementById("kAdd").value="";' +
'    return true;' +
'  }' +
'  if(t.closest("#kPwBtn")){' +
'    var pw=(document.getElementById("kPw2").value||"").trim();' +
'    if(!pw){ toast_("新しい合言葉を入れてください"); return true; }' +
'    if(confirm("スタッフ用URLの合言葉を「"+pw+"」に変えます。よろしいですか？")){' +
'      send_("tile_settings","setval", JSON.stringify({t:"pw", v:pw}),' +
'        {title:"合言葉を変えています", done:"合言葉を変えました"});' +
'    }' +
'    return true;' +
'  }' +
'  if(t.closest("#kTilesClose")){ closeTiles_(); return true; }' +
'  if(t.closest("#kTilesSave")){ saveTiles_(); return true; }' +
'  return false;' +
'}' +
// 依頼を送る。合言葉は無い＝**登録した1台のスマホ**であることをサーバー側が見る（kanshiGate_）。
'function send_(key, act, val, busy){' +
'  if(busy){ szOvShow_(szBusyHtml_(busy.title, "事務所のパソコンが受け取って書き終わったら自動で切り替わりますので、しばらくお待ちください。"),"#2C7A99"); }' +
'  else { toast_("受け付けました。事務所PCが実行します（最大1分）…"); }' +
'  jsonp_({action:"submit", key:KEY_, op:"kanshi_ctl", device:DEV_,' +
'    fields:JSON.stringify({ctl_key:key, ctl_act:act, ctl_val:(val||"")})},' +
'    function(r){' +
'      if(!r||!r.ok){' +
'        if(busy){ szOvHide_(); szPopup_("エラーが発生しました。"+((r&&r.error)||"依頼できませんでした")); }' +
'        else { toast_("⚠ "+((r&&r.error)||"依頼できませんでした")); }' +
'        return;' +
'      }' +
'      poll_(r.id, 16, busy);' +
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
