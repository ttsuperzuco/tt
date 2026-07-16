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
    html = renderKanshi_(base, staff, dev);
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
  try {
    payload = JSON.parse(getMonitorFile_().getBlob().getDataAsString('UTF-8'));
  } catch (e) {
    payload = { error: String(e), groups: [] };
  }
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(payload) + ');')
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
// ★お金・電源・データ復元に関わるもの（PotCoin解錠／PC自動スリープ／復元コピー）は入れない
//   ＝外からは見るだけ（スマホの誤タップで動くと取り返しがつかないため）。
var KANSHI_CTL_KEYS_ = [
  'db_backup', 'db_backup_full', 'course_counts', 'program_backup',
  'line_stats_timetree_check', 'ripihoryu_auto',
  'line_prefetch', 'timetree_prefetch', 'edit_worker_watchdog',
  'line_shinki_watch', 'line_yoyaku_kakutei',
  'edit_worker', 'conflict_watcher', 'super_link',
  'lt_auto_verify'   // その他の設定：L⇔T予約照合 全自動AI判定（2026-07-16・PC/App同一ルールで追加）
];
var KANSHI_CTL_ACTS_ = ['on', 'off', 'run', 'setval'];
function _validKanshiCtl_(key, act) {
  return KANSHI_CTL_KEYS_.indexOf(String(key)) >= 0 && KANSHI_CTL_ACTS_.indexOf(String(act)) >= 0;
}

// キューへ積む共通処理（handleAction_のaction=submitと、uiSubmitMoveの両方から呼ぶ）。
function _submitToQueue_(q, op, fields) {
  if (op === 'kanshi_ctl') {
    if (!_rateOk_(q)) return { ok: false, error: '依頼が集中しています。少し待ってから試してください。' };
    if (!_pwRateOk_()) return { ok: false, error: '試行回数が多すぎます。少し待ってから試してください。' };
    if (String(fields.pw || '') !== getStaffPassword_()) return { ok: false, error: '合言葉が違います。' };
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
  ttapp:      { exec: true, staff: true },     // ★元祖TTアプリ＝以前のalways:trueと同じ「全員に見える」を初期値として維持
  // ★kanshi(自動監視)＝開発URL(?dev=1)専用。tile_settings.py の TILES にも入れない＝
  //   人ごとの権限画面に出てこない＝誰にもONにできない＝開発URLだけに出る（2026-07-16ユーザー指定）。
  kanshi:     { exec: false, staff: false }
};

// ホーム画面のボタン並び順のデフォルト（tile_settings.json に order が無い時）。
// tile_settings.py の「ボタンの並びをかえれる」設定画面（2026-07-16追加）で変更できる。
var DEFAULT_TILE_ORDER_ = ['conflict', 'lt', 'uriage', 'unanswered', 'akijikan', 'ttapp', 'kanshi'];

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
    perms[list[i]] = { conflict: true, lt: false, uriage: false, unanswered: false, akijikan: false, ttapp: true, kanshi: false };
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
  return (perms && perms[pid]) || { conflict: true, lt: false, uriage: false, unanswered: false, akijikan: false, kanshi: false };
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
      ' data-who="' + esc_(who) + '" data-fromroom="' + esc_(curRoom) + '"' +
      ' data-time="' + esc_(timeStr || '') + '"' +
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
            '<div class="time"><span class="ab abA">' + esc_(x.a_staff || 'A') + '</span>' + esc_(x.a_time) + '</div>' +
            '<div class="who">' +
              '<span class="code">' + esc_(x.a_code) + '</span>' +
              '<span class="name">' + esc_(x.a_name) + '</span></div>' +
            menu_(x.a_menu) +
          '</div>' +
          '<div class="vs"></div>' +
          '<div class="side">' +
            '<div class="time"><span class="ab abB">' + esc_(x.b_staff || 'B') + '</span>' + esc_(x.b_time) + '</div>' +
            '<div class="who">' +
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
  // ★元祖TTアプリ＝外部サイトへのリンクだけのボタン（GAS内のviewではない）。
  //   2026-07-16：他のボタンと同じく人ごとのON/OFF対象に変更（以前はalways:trueで常時表示
  //   固定だったが、ユーザー要望で「人ごとに見せる/見せない」を選べるようにした。初期値は
  //   全員ON＝これまでの「常に表示」と見た目上は変わらない。tile_settings.py の TILES にも追加済み）。
  { id: 'ttapp', cls: 'ttapp', url: 'https://x.gd/eaxgF',
    icon: '<span class="ticon">🗓️</span>', label: '元祖TT\nアプリ' },
  // ★自動監視＝開発URL(?dev=1)専用（DEFAULT_TILE_SETTINGS_のコメント参照）。
  { id: 'kanshi', cls: 'kanshi', view: 'kanshi',
    icon: '<span class="ticon">📟</span>', label: '自動監視\n（開発用）' }
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
  '<button type="button" id="uallbtn" class="ubtn uall">帳簿売上をTimeTreeに記録' +
    '<span class="uallsub">（含：記載ミス修正、プロセル売上表に転記）</span></button>' +
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
// ★2026-07-16修正：旧実装はgoogle.script.runを直接呼んでおり、電話(静的アプリ)には
//   google.script.runが存在しないため実は動いていなかった（GAS直リンクでしか動かない隠れた不具合）。
//   JSONP(action=submit/status)に統一し、電話でも動くようにした。
'var EXEC_U0_="https://script.google.com/macros/s/AKfycbwEpGPZhvGCbea6qoft-_TRCgvp5t0ieNf5kDCuFs9-1VYJi7r5RPgTPBM7AEBqPPLL4A/exec";' +
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
'  .ubtn { display:block; width:100%; margin-top:16px; font-size:1.15rem; font-weight:800;' +
'    color:#fff; background:#f59e0b; border:0; border-radius:14px; padding:16px; cursor:pointer;' +
'    box-shadow:0 4px 14px rgba(245,158,11,.4); }' +
'  .ubtn:active { transform:translateY(1px); }' +
'  .ubtn:disabled { opacity:.55; }' +
'  .ubtn.uall { background:#16a34a; box-shadow:0 4px 14px rgba(22,163,74,.4); font-size:1.55rem; }' +
'  .uallsub { display:block; font-size:.55em; font-weight:600; opacity:.92; margin-top:8px; line-height:1.4; }' +
'  .uperbtn { width:100%; text-align:center; font-size:1.45rem; font-weight:800; color:#fff;' +
'    background:#2563eb; border:0; border-radius:14px; padding:18px;' +
'    cursor:pointer; margin-bottom:14px; box-shadow:0 4px 14px rgba(37,99,235,.4); }' +
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
  return '' +
  '<article class="unacard ' + (kind === 'cust' ? 'cust' : 'ours') + '" data-search="' + search + '" data-days="' + (r.d || 0) + '">' +
    '<div class="unahead">' +
      unaBadge_(kind, r.v) + unaReadPill_(r.read) +
      '<span class="unaname">' + esc_(name) + '</span>' +
      (tag ? '<span class="unatag">' + esc_(tag) + '</span>' : '') +
      '<span class="unadays">待ち' + (r.d || 0) + '日</span>' +
    '</div>' +
    (when ? '<div class="unawhen">🕒 最新メッセージ ' + esc_(when) + '</div>' : '') +
    '<div class="unaq">' + esc_(r.q || '') + '</div>' +
    '<div class="unaactions">' + detail + link + '</div>' +
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
  '<div id="unacust" class="unalist">' + custCards + '</div>' +
  '<div id="unaours" class="unalist unahidden">' + oursCards + '</div>' +
  '<div class="unaempty" id="unaperiodempty" hidden>この期間に該当はありません。上の期間を広げてください。</div>' +
  '<div class="unafoot">緑＝こちらが返すべき（お客様が待っている）／ 青＝お客様の返事待ち。' +
    'アフターケア確認・一斉あいさつ等の返事不要な定型は除外済み。既読/未読はLINE公式マネージャー基準。' +
    '既定は7日間表示（PC版ダッシュボードと同じ）。古い会話は「期間」を広げると出てきます。</div>' +
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
'  h1{ color:#fff; font-size:16px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin:6px 0 12px; }' +
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
'  .unawhen{ font-size:12px; color:var(--sub); font-weight:700; margin:2px 0 4px;' +
'    font-variant-numeric:tabular-nums; }' +
'  .unaq{ font-size:14px; margin:2px 0 6px; line-height:1.45;' +
'    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }' +
'  .unath{ font-size:12px; color:var(--sub); border-top:1px dashed var(--line); padding-top:6px; margin-top:2px; }' +
'  .unaactions{ margin-top:9px; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }' +
'  .unadetail{ appearance:none; font:inherit; font-size:12.5px; font-weight:700; cursor:pointer;' +
'    padding:8px 14px; border-radius:10px; border:1px solid var(--q); background:var(--card); color:var(--q); }' +
'  .unalink{ display:inline-block; text-decoration:none; background:#06c755; color:#fff; font-weight:700;' +
'    font-size:12.5px; padding:8px 14px; border-radius:10px; }' +
'  .unaempty{ text-align:center; color:#fff; padding:30px; font-weight:700; }' +
'  .unafoot{ margin-top:18px; color:rgba(255,255,255,.85); font-size:11px; line-height:1.6; }' +
// 詳細モーダル（LINEに触れず会話の中身をその場で確認）
'  .unamask{ position:fixed; inset:0; background:rgba(0,0,0,.5); display:none;' +
'    align-items:center; justify-content:center; padding:16px; z-index:60; }' +
'  .unamask.on{ display:flex; }' +
'  .unamodal{ background:var(--card); border:1px solid var(--line); border-radius:16px;' +
'    max-width:560px; width:100%; max-height:82vh; display:flex; flex-direction:column;' +
'    box-shadow:0 24px 60px rgba(0,0,0,.4); }' +
'  .unamh{ padding:14px 16px; border-bottom:1px solid var(--line); display:flex;' +
'    justify-content:space-between; gap:10px; align-items:flex-start; }' +
'  .unamnm{ font-weight:800; font-size:16px; color:var(--ink); }' +
'  .unamsub{ font-size:12px; color:var(--sub); margin-top:3px; }' +
'  .unamx{ appearance:none; border:0; background:none; font-size:24px; line-height:1;' +
'    color:var(--sub); cursor:pointer; padding:2px 6px; }' +
'  .unamlog{ overflow-y:auto; padding:14px 16px; display:flex; flex-direction:column; gap:8px; }' +
'  .unamsg{ max-width:85%; padding:9px 12px; border-radius:12px; font-size:13.5px; line-height:1.55;' +
'    white-space:pre-wrap; word-break:break-word; color:var(--ink); }' +
'  .unamsg.cli{ align-self:flex-start; background:var(--line); }' +
'  .unamsg.shop{ align-self:flex-end; background:var(--custbg); border:1px solid var(--cust); }' +
'  .unats{ display:block; font-size:10px; color:var(--sub); opacity:.85; margin-top:5px; }' +
'  .unamnote{ color:var(--sub); font-size:12.5px; padding:8px; }';

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

// 1件ぶんの空き枠チップ（開始-終了(長さ分)）。
function akiSlotChip_(sl) {
  return '<span class="akislot">' + esc_(sl.s) + '-' + esc_(sl.e) + '<b>(' + sl.dur + '分)</b></span>';
}

// 「各時間帯別」＝1枠1行（PC版available_slots.pyのconsole/HTML表示と同じ形式・並び順）。
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
    return '<div class="akirow">' +
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
      '<div class="akisl">各時間帯の空き</div>' + akiTimeRows_(day.time_slots) +
    '</div>' +
    '<div class="akisec akisec-staff akihidden" data-sec="staff">' +
      '<div class="akisl">スタッフ別の空き</div>' + akiStaffRows_(day.staff) +
    '</div>' +
    '<div class="akisec akisec-rooms akihidden" data-sec="rooms">' +
      '<div class="akisl">施術室別の空き</div>' + akiRoomRows_(day.rooms_free) +
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
    '<span class="akigen">' + esc_(d.cond || '') + '</span>' +
  '</div>' +
  '<h1>🕑 空き時間検索</h1>' +
  '<div class="akisub">' + esc_(d.date_from || '') + ' 〜 ' + esc_(d.date_to || '') +
    '　生成: ' + esc_(d.generated_at || '—') + '</div>' +
  '<div class="akidatebar">' +
    '<div class="akidaterow">' +
      '<input type="text" readonly class="akidate" id="akiFrom" min="' + esc_(d.date_from || '') + '" max="' + esc_(d.date_to || '') + '">' +
      '<span class="akitilde">〜</span>' +
      '<input type="text" readonly class="akidate" id="akiTo" min="' + esc_(d.date_from || '') + '" max="' + esc_(d.date_to || '') + '">' +
    '</div>' +
    '<div class="akipresets">' +
      '<button type="button" class="akipreset" data-preset="today">今日</button>' +
      '<button type="button" class="akipreset" data-preset="tomorrow">明日</button>' +
      '<button type="button" class="akipreset on" data-preset="thisnext">今・来週</button>' +
      '<button type="button" class="akipreset" data-preset="month">1か月</button>' +
      '<button type="button" class="akipreset" data-preset="all">全期間</button>' +
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
'var fromEl=document.getElementById("akiFrom"), toEl=document.getElementById("akiTo");' +
'var minD=fromEl?fromEl.min:"", maxD=fromEl?fromEl.max:"";' +
'var days=[].slice.call(document.querySelectorAll("#akidays .akiday"));' +
'var emptyMsg=document.getElementById("akiDateEmpty");' +
'function openAkiCal_(input){' +
'  var pick=input.value||minD;' +
'  var cur=new Date((pick||minD)+"T00:00:00");' +
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
'      if(iso0===pick){ b.classList.add("sel"); }' +
'      b.addEventListener("click",(function(iso1){ return function(){ pick=iso1; draw(); }; })(iso0));' +
'      grid.appendChild(b);' +
'    }' +
'    box.appendChild(grid);' +
'    var ftr=document.createElement("div"); ftr.className="akicalftr";' +
'    var cancel=document.createElement("button"); cancel.type="button"; cancel.textContent="キャンセル"; cancel.className="akicalcancel";' +
'    var ok=document.createElement("button"); ok.type="button"; ok.textContent="設定"; ok.className="akicalok";' +
'    cancel.addEventListener("click",function(){ document.body.removeChild(mask); });' +
'    ok.addEventListener("click",function(){' +
'      input.value=pick; input.dispatchEvent(new Event("change"));' +
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
'function applyFilter(){' +
'  var f=fromEl.value||minD;' +
'  var toRaw=toEl.value;' +
'  var t=toRaw?toRaw:f;' +
'  if(t<f){ var tmp=f; f=t; t=tmp; }' +
'  var shown=0;' +
'  days.forEach(function(el){' +
'    var dt=el.getAttribute("data-date")||"";' +
'    var vis = dt && dt>=f && dt<=t;' +
'    el.classList.toggle("akidatehide", !vis);' +
'    if(vis) shown++;' +
'  });' +
'  if(emptyMsg) emptyMsg.hidden = shown>0;' +
'}' +
'function setRange(f,t){ fromEl.value=clamp(f); toEl.value=clamp(t); applyFilter(); }' +
'function setSingle_(f){ fromEl.value=clamp(f); toEl.value=""; applyFilter(); }' +
'if(fromEl&&toEl){' +
'  fromEl.addEventListener("click",function(){ openAkiCal_(fromEl); });' +
'  toEl.addEventListener("click",function(){ openAkiCal_(toEl); });' +
'  fromEl.addEventListener("change",function(){ clearPresetSel(); applyFilter(); });' +
'  toEl.addEventListener("change",function(){ clearPresetSel(); applyFilter(); });' +
'  var presets=[].slice.call(document.querySelectorAll(".akipreset"));' +
'  function clearPresetSel(){ presets.forEach(function(b){ b.classList.remove("on"); }); }' +
'  presets.forEach(function(b){ b.addEventListener("click",function(){' +
'    presets.forEach(function(x){ x.classList.toggle("on", x===b); });' +
'    var kind=b.getAttribute("data-preset");' +
'    var today=minD;' +
'    if(kind==="today") setSingle_(today);' +
'    else if(kind==="tomorrow") setSingle_(addDays(today,1));' +
'    else if(kind==="thisnext") setRange(today, addDays(endOfThisWeek(today),7));' +
'    else if(kind==="month") setRange(today, addDays(today,29));' +
'    else if(kind==="all") setRange(minD, maxD);' +
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
'  .akihome{ color:var(--akiprimary); text-decoration:none; font-weight:700; font-size:14px; }' +
'  .akigen{ color:var(--akisub); font-size:14px; font-weight:700; }' +
'  .akiwrap h1{ font-size:22px; margin:2px 0 2px; }' +
'  .akisub{ color:var(--akisub); font-size:15px; margin-bottom:12px; line-height:1.6; }' +
'  .akidatebar{ display:flex; flex-direction:column; gap:8px; margin-bottom:12px; }' +
'  .akidaterow{ display:flex; align-items:center; gap:8px; flex-wrap:nowrap; width:100%; }' +
'  .akidate{ font-family:inherit; font-size:16px; font-weight:700; color:var(--akiink);' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:10px;' +
'    padding:9px 10px; flex:1 1 0; min-width:0; cursor:pointer; caret-color:transparent; }' +
'  .akitilde{ color:var(--akisub); font-weight:800; flex:0 0 auto; }' +
'  .akicalmask{ position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex;' +
'    align-items:center; justify-content:center; z-index:9999; padding:16px; }' +
'  .akicalbox{ background:var(--akicard); border:1px solid var(--akiline); border-radius:16px;' +
'    padding:14px; width:100%; max-width:340px; }' +
'  .akicalhdr{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }' +
'  .akicalhdr span{ font-weight:800; font-size:16px; color:var(--akiink); }' +
'  .akicalhdr button{ font-family:inherit; font-size:15px; font-weight:700; color:var(--akiink);' +
'    background:transparent; border:1px solid var(--akiline); border-radius:8px; padding:4px 10px; cursor:pointer; }' +
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
'  .akipresets{ display:flex; gap:6px; flex-wrap:wrap; width:100%; }' +
'  .akipreset{ font-family:inherit; font-size:13.5px; font-weight:700; color:var(--akisub);' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:9px;' +
'    padding:7px 12px; cursor:pointer; }' +
'  .akipreset.on{ color:#fff; background:var(--akiprimary); border-color:var(--akiprimary); }' +
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
'    border-radius:8px; padding:3px 10px; font-size:15px; font-variant-numeric:tabular-nums; }' +
'  .akislot b{ font-weight:700; color:var(--akisub); margin-left:2px; }' +
'  .akinone{ color:#c33; font-size:15px; padding:4px 0; }';

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

// 被りカードの見出し2行(.fit1line＝日付+時刻／施術室名+説明文)を、はみ出さなくなるまで
// 1pxずつ文字を縮めて必ず1行に収める（URIAGESCRIPT_の金額(.uv)自動縮小と同じ手法）。
var FIT1LINE_SCRIPT_ =
'<script>(function(){' +
'var els=document.querySelectorAll(".fit1line");' +
'for(var i=0;i<els.length;i++){' +
'  var el=els[i]; var tries=0;' +
'  while(el.scrollWidth>el.clientWidth && tries<30){' +
'    var cur=parseFloat(getComputedStyle(el).fontSize);' +
'    el.style.fontSize=(cur-1)+"px"; tries++;' +
'  }' +
'}' +
'})();</scr' + 'ipt>';

// 部屋付け替えのUI操作（トグル→依頼→処理中→結果）。google.script.run で同オリジン呼び出し。
var MOVESCRIPT_ =
'<script>(function(){' +
'var wrap=document.querySelector(".wrap"); if(!wrap) return;' +
// ①直リンク(google.script.runが使える)・②静的アプリ(使えない→JSONPで代用)のどちらでも
// 同じ見た目・同じ安全弁(サーバー側_submitToQueue_)で部屋移動できるようにする共通呼び出し口。
// ★EDIT_KEY_CLIENT_はページソースに公開される前提（②で使うため）。サーバー側で
//   「今まさに被り検出に出ている予定か」「直近の依頼数」を必ずチェックする安全弁と対にしてある。
'var EXEC_URL_="https://script.google.com/macros/s/AKfycbwEpGPZhvGCbea6qoft-_TRCgvp5t0ieNf5kDCuFs9-1VYJi7r5RPgTPBM7AEBqPPLL4A/exec";' +
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
'    {op:"movecal",cal:cal,event:evid,to_cal:toCal,to_label:toLabel,room:room,title:title,' +
'     from_room:fromRoom,who:idn.who,role:idn.role,device:idn.device}, onDone);' +
'}' +
'function statusCheck_(id,onDone){' +
'  callGas_("uiStatus",[id],"status",{id:id}, onDone);' +
'}' +
// ブラウザ標準confirm/alertは「ttsuperzuco.github.io says」のようにドメイン名を強制表示して
// しまい消せない（ブラウザのセキュリティ機能）ため、自前のポップアップ（ドメイン名なし）で代用する。
'function ccPopup_(msg, showCancel, onYes){' +
'  var mask=document.createElement("div"); mask.className="ccmask";' +
'  mask.innerHTML="<div class=\\"ccbox\\"><div class=\\"ccmsg\\"></div><div class=\\"ccbtns\\">"+' +
'    (showCancel?"<button type=\\"button\\" class=\\"ccno\\">キャンセル</button>":"")+' +
'    "<button type=\\"button\\" class=\\"ccyes\\">OK</button></div></div>";' +
'  mask.querySelector(".ccmsg").textContent=msg;' +
'  document.body.appendChild(mask);' +
'  mask.querySelector(".ccyes").addEventListener("click",function(){ document.body.removeChild(mask); if(onYes) onYes(); });' +
'  var no=mask.querySelector(".ccno"); if(no) no.addEventListener("click",function(){ document.body.removeChild(mask); });' +
'}' +
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
'    var who=t.getAttribute("data-who")||"", fromRoom=t.getAttribute("data-fromroom")||"", mtime=t.getAttribute("data-time")||"";' +
'    if(!cal||!evid){ ccPopup_("この予約のIDが取れず移動できません", false); return; }' +
'    ccPopup_(side+" "+who+"を「"+fromRoom+"」から「"+room+"」へ移動します。よろしいですか？", true, function(){' +
// ★押した瞬間に全画面「移動中」を出し、TimeTreeへの書き込みが本当に完了するまで出したまま。
//   完了したら全画面「✓完了」を0.5秒見せてから、被りが消えた一覧へ戻す（見た目の先行なし＝正確）。
'      mvOverlay_(who,mtime,fromRoom,room);' +
'      submitMove_(cal,evid,toCal,toLabel,room,title,fromRoom,function(r){' +
'        if(r && r.ok){ waitDoneThenFinish_(r.id,evid,room); }' +
'        else { mvOverlayHide_(); ccPopup_("⚠️ 移動できませんでした："+((r&&r.error)||"依頼に失敗")+"。もう一度お試しください。", false); }' +
'      });' +
'    });' +
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
'function showDoneOverlay_(room){ var ov=document.getElementById("mvWaitOverlay");' +
'  if(!ov){ ov=document.createElement("div"); ov.id="mvWaitOverlay"; document.body.appendChild(ov); }' +
'  ov.style.cssText="position:fixed;inset:0;z-index:9999;background:#16a34a;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center;";' +
'  ov.innerHTML="<div style=\\"font-size:92px;margin-bottom:16px;\\">✓</div>"+' +
'    "<div style=\\"color:#fff;font-size:35px;font-weight:800;line-height:1.5;\\">「"+room+"」へ<br>移動が完了しました</div>"; }' +
'function waitDoneThenFinish_(id,evid,room){ var tries=0;' +
'  function chk(){ tries++;' +
'    statusCheck_(id,function(r){ var s=(r&&r.status)||"";' +
'      if(s==="done"){ try{ window.__movedOut=window.__movedOut||{}; window.__movedOut[evid]=1; }catch(e){} showDoneOverlay_(room);' +
'        try{ window.__keepMvOverlay=true; }catch(e2){} doneRefreshFast_();' +
'        setTimeout(function(){ try{ window.__keepMvOverlay=false; }catch(e3){} mvOverlayHide_(); },2000); }' +
'      else if(s==="error"||s==="failed"){ mvOverlayHide_(); ccPopup_("⚠️ 移動できませんでした："+((r.result)||s)+"。もう一度お試しください。", false); }' +
'      else if(tries>=90){ mvOverlayHide_(); ccPopup_("⚠️ 時間切れ。事務所PCの見張りが動いているか確認してください。", false); }' +
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
'  .tile.ttapp::before { background:#c026d3; }' +
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
'  .tile.ttapp .ticon { background:rgba(192,38,211,.14); }' +
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
'  .ab { flex:none; display:grid; place-items:center; width:56px; height:56px; border-radius:14px;' +
'    color:#fff; font-weight:800; font-size:1.9rem; margin-right:8px; }' +
'  .abA { background:#2563eb; } .abB { background:#0d9488; }' +
'  .who { margin:4px 0 2px; font-size:1rem; }' +
'  .who .code { color:var(--sub); font-weight:600; margin:0 4px; }' +
'  .who .name { font-weight:500; }' +
'  .menu { list-style:none; margin:6px 0 4px; padding:0; }' +
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
'  .rchips { flex:1 1 auto; min-width:0; display:grid;' +
'    grid-template-columns:repeat(2,minmax(0,1fr)); justify-items:start; gap:5px; }' +
'  .rchips .slot { display:inline-block; background:var(--card); border:1px solid var(--line);' +
'    border-radius:7px; padding:2px 8px; font-size:.82rem; font-variant-numeric:tabular-nums;' +
'    white-space:nowrap; }' +
'  .rchips .none { color:var(--real); font-size:.82rem; font-weight:700; }' +
// 自前の確認ポップアップ（ブラウザ標準confirm/alertの代わり＝ドメイン名を表示しない）。
'  .ccmask { position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex;' +
'    align-items:center; justify-content:center; z-index:200; padding:20px; }' +
'  .ccbox { background:var(--card); border-radius:16px; padding:20px; max-width:340px; width:100%;' +
'    box-shadow:0 12px 40px rgba(0,0,0,.35); }' +
'  .ccmsg { font-size:1rem; line-height:1.55; color:var(--ink); margin-bottom:18px; white-space:pre-wrap; }' +
'  .ccbtns { display:flex; gap:10px; }' +
'  .ccno, .ccyes { flex:1; padding:12px; border-radius:10px; border:0; font-weight:700;' +
'    font-size:.95rem; cursor:pointer; font:inherit; }' +
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
//   ＝合言葉の照合と、触ってよい項目かの確認はサーバーだけが行う。
function renderKanshi_(base, staff, dev) {
  var d;
  try {
    d = JSON.parse(getMonitorFile_().getBlob().getDataAsString('UTF-8'));
  } catch (err) {
    return renderKanshiError_(err, base, staff, dev);
  }
  return renderKanshiPage_(d, base, staff, dev);
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
      '各行を押すと中身が開きます。ON/OFF・今すぐ実行は合言葉を1回入れると押せます。' +
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
'  .khome{ color:#fff; text-decoration:none; font-weight:700; font-size:14px;' +
'    background:rgba(255,255,255,.16); padding:7px 12px; border-radius:10px; }' +
'  .kref{ background:rgba(255,255,255,.16); color:#fff; border:0; border-radius:10px; padding:7px 12px;' +
'    font:inherit; font-weight:700; font-size:14px; cursor:pointer; }' +
'  h1{ color:#fff; font-size:16px; margin:6px 0 10px; }' +
'  .kfresh{ font-size:12px; color:#dfe6ee; margin-bottom:12px; }' +
'  .kfresh.old{ background:var(--ng); color:#fff; font-weight:700; padding:10px 12px; border-radius:10px; }' +
'  .kcard{ background:var(--card); border:1px solid var(--line); border-radius:12px;' +
'    padding:12px 14px; margin-bottom:10px; }' +
'  .khead{ display:flex; align-items:flex-start; gap:8px; cursor:pointer; }' +
'  .kmark{ font-size:15px; line-height:1.4; }' +
'  .klabel{ font-weight:700; font-size:14px; flex:1; }' +
'  .kdetail{ color:var(--sub); font-size:12px; margin-top:3px; font-weight:400; }' +
'  .karrow{ color:var(--sub); font-size:12px; }' +
'  .kmembers{ margin-top:10px; border-top:1px solid var(--line); padding-top:8px; }' +
'  .kmembers[hidden]{ display:none; }' +
'  .krow{ border-bottom:1px solid var(--line); padding:9px 0; }' +
'  .krow:last-child{ border-bottom:0; }' +
'  .krowhead{ display:flex; align-items:flex-start; gap:7px; }' +
'  .krowlabel{ flex:1; font-size:13px; font-weight:600; }' +
'  .kbtns{ display:flex; flex-wrap:wrap; gap:6px; margin-top:7px; align-items:center; }' +
'  .kbtn{ border:1px solid var(--line); background:var(--card); color:var(--ink); border-radius:8px;' +
'    padding:6px 10px; font:inherit; font-size:12px; font-weight:700; cursor:pointer; }' +
'  .kbtn.on{ background:var(--ok); color:#fff; border-color:var(--ok); }' +
'  .kbtn.off{ background:var(--off); color:#fff; border-color:var(--off); }' +
'  .kbtn:active{ transform:translateY(1px); }' +
'  .kval{ width:74px; padding:6px 8px; border:1px solid var(--line); border-radius:8px;' +
'    background:var(--card); color:var(--ink); font:inherit; font-size:12px; }' +
'  .kunit{ font-size:11px; color:var(--sub); }' +
'  .ksub{ margin:8px 0 0 14px; border-left:2px solid var(--line); padding-left:10px; }' +
'  .kfoot{ color:#dfe6ee; font-size:11px; margin-top:14px; }' +
'  .ktoast{ position:fixed; left:50%; transform:translateX(-50%); bottom:22px; z-index:60;' +
'    background:#111a24; color:#fff; padding:11px 16px; border-radius:10px; font-size:13px; max-width:88%; }' +
'  .kmask{ position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center;' +
'    justify-content:center; z-index:70; padding:20px; }' +
'  .kbox{ background:var(--card); border-radius:14px; padding:18px; width:100%; max-width:330px; }' +
'  .kbox h3{ margin:0 0 10px; font-size:15px; }' +
'  .kbox input{ width:100%; padding:11px; border:1px solid var(--line); border-radius:9px;' +
'    background:var(--card); color:var(--ink); font:inherit; font-size:16px; margin-bottom:12px; }' +
'  .kboxbtns{ display:flex; gap:8px; }' +
'  .kboxbtns button{ flex:1; padding:11px; border-radius:9px; border:0; font:inherit; font-weight:700; cursor:pointer; }' +
'  .kno{ background:var(--bg); color:#fff; } .kyes{ background:#2563eb; color:#fff; }' +
'';

// ブラウザ側の全処理（描画・30秒ごとの自動更新・操作の依頼）。①②どちらでも同じこれが動く。
// ★JSONPだけで完結させる（①でしか使えない google.script.run に依存しない＝分岐を持たない）。
var KANSHISCRIPT_ =
'<script>(function(){' +
'var EXEC_="https://script.google.com/macros/s/AKfycbwEpGPZhvGCbea6qoft-_TRCgvp5t0ieNf5kDCuFs9-1VYJi7r5RPgTPBM7AEBqPPLL4A/exec";' +
'var KEY_="kx7Q2p9mVt4Zr8";' +
'var STALE_SEC_=180;' +
'var PW_="";' +
'var data_=window.__KANSHI_DATA__||{groups:[]};' +
'var open_={};' +
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
'function ctlBtns_(m){' +
'  if(!m.ctl) return "";' +
'  var h="<div class=\\"kbtns\\">";' +
'  h+="<button type=\\"button\\" class=\\"kbtn "+(m.on?"on":"off")+"\\" data-act=\\""+(m.on?"off":"on")+"\\" data-key=\\""+esc(m.key)+"\\">"+(m.on?"ONにしてある → OFFにする":"OFFにしてある → ONにする")+"</button>";' +
'  h+="<button type=\\"button\\" class=\\"kbtn\\" data-act=\\"run\\" data-key=\\""+esc(m.key)+"\\">今すぐ実行</button>";' +
'  if(m.value!==""&&m.value!==undefined&&m.value!==null){' +
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
'  jsonp_({action:"kanshi"}, function(r){' +
'    if(r&&!r.error){ data_=r; render_(); }' +
'    if(onDone) onDone();' +
'  });' +
'}' +
'function askPw_(onOk){' +
'  if(PW_){ onOk(); return; }' +
'  var mask=document.createElement("div"); mask.className="kmask";' +
'  mask.innerHTML="<div class=\\"kbox\\"><h3>合言葉を入れてください</h3>"+' +
'    "<input type=\\"password\\" id=\\"kPwIn\\" autocomplete=\\"off\\">"+' +
'    "<div class=\\"kboxbtns\\"><button type=\\"button\\" class=\\"kno\\">やめる</button>"+' +
'    "<button type=\\"button\\" class=\\"kyes\\">OK</button></div></div>";' +
'  document.body.appendChild(mask);' +
'  var input=mask.querySelector("#kPwIn"); try{ input.focus(); }catch(e){}' +
'  function close_(){ if(mask.parentNode) mask.parentNode.removeChild(mask); }' +
'  mask.querySelector(".kno").addEventListener("click", close_);' +
'  mask.querySelector(".kyes").addEventListener("click", function(){' +
'    var v=input.value||"";' +
'    jsonp_({action:"checkpw", pw:v}, function(r){' +
'      if(r&&r.ok){ PW_=v; close_(); onOk(); }' +
'      else { toast_((r&&r.error)||"合言葉が違います。"); }' +
'    });' +
'  });' +
'  input.addEventListener("keydown", function(e){ if(e.key==="Enter") mask.querySelector(".kyes").click(); });' +
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
'function send_(key, act, val){' +
'  askPw_(function(){' +
'    toast_("受け付けました。事務所PCが実行します（最大1分）…");' +
'    jsonp_({action:"submit", key:KEY_, op:"kanshi_ctl", pw:PW_, ctl_key:key, ctl_act:act, ctl_val:(val||"")},' +
'      function(r){' +
'        if(!r||!r.ok){ if(r&&r.error==="合言葉が違います。") PW_=""; toast_("⚠ "+((r&&r.error)||"依頼できませんでした")); return; }' +
'        poll_(r.id, 16);' +
'      });' +
'  });' +
'}' +
'document.addEventListener("click", function(ev){' +
'  var h=ev.target.closest?ev.target.closest(".khead"):null;' +
'  if(h){ var i=h.getAttribute("data-g"); open_[i]=!open_[i]; render_(); return; }' +
'  var b=ev.target.closest?ev.target.closest(".kbtn"):null;' +
'  if(!b) return;' +
'  var key=b.getAttribute("data-key"), act=b.getAttribute("data-act");' +
'  if(!key||!act) return;' +
'  var val="";' +
'  if(act==="setval"){' +
'    var input=document.querySelector(".kval[data-val=\\""+key+"\\"]");' +
'    val=input?input.value:"";' +
'  }' +
'  send_(key, act, val);' +
'});' +
'var ref=document.getElementById("kRef");' +
'if(ref) ref.addEventListener("click", function(){ toast_("最新を取りに行っています…"); reload_(); });' +
'render_();' +
'setInterval(function(){ reload_(); }, 30000);' +
'})();<' + '/script>';
