// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// どの画面でも要る部品（と、部品の間の文を元の順番のまま）

var EVENTS_FILENAME = 'events.json';
var CUR_WHO_ = '';
function roleSfx_(staff, dev) {
  var s = staff ? '&staff=1' : (dev ? '&dev=1' : '');
  if (CUR_WHO_) s += '&who=' + encodeURIComponent(CUR_WHO_);
  return s;
}
function authTestNow() {
  var f = getEventsFile_();
  f.setContent(f.getBlob().getDataAsString('UTF-8'));  
  Logger.log('OK: Drive書込テスト成功');
}
function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.action === 'push_events') {
    if (p.key !== EDIT_KEY) return _actionOut_({ ok: false, error: 'bad key' }, null);
    try {
      var body = (e.postData && e.postData.contents) || '';
      JSON.parse(body);  
      getEventsFile_().setContent(body);
      return _actionOut_({ ok: true }, null);
    } catch (err) {
      return _actionOut_({ ok: false, error: String(err) }, null);
    }
  }
  if (p.action === 'push_monitor') {
    if (p.key !== EDIT_KEY) return _actionOut_({ ok: false, error: 'bad key' }, null);
    try {
      var mbody = (e.postData && e.postData.contents) || '';
      JSON.parse(mbody);  
      getMonitorFile_(true).setContent(mbody);
      return _actionOut_({ ok: true }, null);
    } catch (err2) {
      return _actionOut_({ ok: false, error: String(err2) }, null);
    }
  }
  if (p.action === 'push_tiles') {
    if (p.key !== EDIT_KEY) return _actionOut_({ ok: false, error: 'bad key' }, null);
    try {
      var tbody = (e.postData && e.postData.contents) || '';
      JSON.parse(tbody);  
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
  if (p.action) return handleAction_(p);   
  var view = p.view || 'home';   
  var base = getBaseUrl_();
  var staff = (p.staff === '1' || p.staff === 'true');
  var dev = !staff && (p.dev === '1' || p.dev === 'true');
  var who = String(p.who || '').replace(/[^a-z]/g, '');
  var device = String(p.device || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
  CUR_WHO_ = staff ? who : '';
  var perms = getPerms_();
  var allow = personPerms_(perms, staff, dev, who);
  if (!viewAllowed_(view, allow)) view = 'home';
  try { logAccess_(who, roleName_(staff, dev, who), device, view); } catch (ig) {}
  var html, title;
  if (view === 'conflict') {
    title = '部屋＆担当 被り検出';
    var withNail = (p.nail === '1' || p.nail === 'true');
    try {
      var file = getEventsFile_();
      var d = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
      var res = detect(d.events, withNail, d.date_from);
      var sres = detectStaff(d.events, d.date_from);   
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
    title = 'プロセル 残り本数';                         
    html = renderProcell_(base, staff, dev);
  } else if (view === 'pcstatus') {
    title = '自宅PC';                                   
    html = renderPcStatus_(base, staff, dev);
  } else if (view === 'claudechat') {
    title = 'Claudeに聞く';                            
    html = renderClaudeChatPage_(base, staff, dev);
  } else if (view === 'shophist') {
    title = 'T＆Tショップ履歴';                        
    html = renderShopHistPage_({ error: 'スーパーズコのアプリから開いてください😊' }, base, staff, dev);
  } else if (view === 'kanshi') {
    title = '自動監視';
    html = renderKanshi_(base, staff, dev, device);   
  } else if (view === 'zenjitsu') {
    title = '前日お知らせ';                             
    html = renderZenjitsuPage_(base, staff, dev);
  } else if (view === 'cost') {
    title = '台湾トマト 売上・コスト';                    
    html = renderCostPage_(base, staff, dev);
  } else if (view === 'koukoku') {
    title = '広告費管理';                                
    html = renderKoukoku_(base, staff, dev);
  } else if (view === 'honyaku') {
    title = '翻訳 日→台湾中国語';                        
    html = renderHonyakuPage_(base, staff, dev);
  } else if (view === 'timedsend') {
    title = '時間指定LINE送信';                          
    html = renderTimedSendPage_(base, staff, dev);
  } else if (view === 'bcast') {
    title = 'LINE一斉配信設定';                          
    html = renderBroadcastPage_(base, staff, dev);
  } else if (view === 'yoyaku') {
    title = '予約入力';                                  
    html = renderReservationHomePage_(base, staff, dev);
  } else if (view === 'procstock') {
    title = 'プロセル在庫';                             
    html = renderProcStockPage_(base, staff, dev);
  } else if (view === 'uriagebook') {
    title = 'TT売上帳簿';                               
    html = renderUriageBookPage_(base, staff, dev);
  } else if (view === 'shomeisho') {
    title = '購入証明書作成';                                 
    html = renderShomeishoPage_(base, staff, dev);
  } else if (view === 'mita') {
    title = 'お知らせ見てくれた？';                       
    html = renderMitaPage_({ error: 'スーパーズコのアプリから開いてください😊' }, base, staff, dev);
  } else if (view === 'facebook') {
    title = 'Facebook';                                       
    html = renderFacebookPage_(base, staff, dev);
  } else if (view === 'insta') {
    title = 'インスタ';                                       
    html = renderInstaPage_(base, staff, dev);
  } else if (view === 'threads') {
    title = 'Threads投稿';                                   
    html = renderThreadsPage_(base, staff, dev);
  } else if (view === 'hanbai') {
    title = 'No31 販売管理';                                 
    html = renderHanbaiPage_(base, staff, dev);
  } else if (view === 'procamp') {
    title = 'プロセル頭キャリスト';                     
    html = renderProcampPage_({ error: 'スーパーズコのアプリから開いてください😊' }, {}, base, staff, dev);
  } else if (view === 'yoyaku_sejutsugo') {
    title = '施術後の予約';                              
    html = renderAfterTreatmentPage_(base, staff, dev, who);
  } else if (view === 'yoyaku_new') {
    title = '新規予約入力';                              
    html = renderNewReservationPage_(base, staff, dev);
  } else if (view === 'yoyaku_kizon') {
    title = '既存の予約';                                
    html = renderExistingPage_(base, staff, dev, '予約');
  } else if (view === 'yoyaku_henkou') {
    title = '既存の変更';                                
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
var EDIT_KEY = 'kx7Q2p9mVt4Zr8';
var QUEUE_PROP = 'EDIT_QUEUE';
function _jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
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
  if (q.length > 50) q = q.slice(q.length - 50);   
  PropertiesService.getScriptProperties().setProperty(QUEUE_PROP, JSON.stringify(q));
}
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
function _kanshiJsonp_(p) {
  var cb = String(p.callback || 'cb').replace(/[^A-Za-z0-9_$.]/g, '');
  var payload;
  var gate = kanshiGate_(p.device);      
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
var KANSHI_DEV_PROP_ = 'KANSHI_DEVICE';
function kanshiOwner_() {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty(KANSHI_DEV_PROP_);
    var d = raw ? JSON.parse(raw) : null;
    return (d && d.device) ? d : null;
  } catch (e) { return null; }
}
function kanshiGate_(device) {
  device = String(device || '').trim();
  if (!device) {
    return { ok: false, error: 'スマホ用のURL（ttsuperzuco.github.io/tt/）から開いてください😊' };
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
      + '（機種変更した時は、自宅PCの自動監視で「登録し直す」を押してください😊）' };
  } finally {
    try { lock.releaseLock(); } catch (ig2) {}
  }
}
function _kanshiDevResetJsonp_(p) {
  var cb = String(p.callback || 'cb').replace(/[^A-Za-z0-9_$.]/g, '');
  var out;
  if (!_pwRateOk_()) {
    out = { ok: false, error: '試行回数が多すぎます。少し待ってから試してください🙇' };
  } else {
    var cur = kanshiOwner_();
    var byPw = String(p.pw || '') === getStaffPassword_();
    var byOwner = !!(cur && cur.device && cur.device === String(p.device || '').trim());
    if (!byPw && !byOwner) {
      out = { ok: false, error: '解除できません（自宅PCか、いま登録中のスマホから押してください🙇）。' };
    } else {
      PropertiesService.getScriptProperties().deleteProperty(KANSHI_DEV_PROP_);
      out = { ok: true, msg: '登録を解除しました。次に自動監視を開いたスマホが持ち主になります。' };
    }
  }
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(out) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
function _kanshiDevInfoJsonp_(p) {
  var cb = String(p.callback || 'cb').replace(/[^A-Za-z0-9_$.]/g, '');
  var out;
  if (!_pwRateOk_() || String(p.pw || '') !== getStaffPassword_()) {
    out = { ok: false, error: 'この情報は自宅PCからだけ見られます。' };
  } else {
    var cur = kanshiOwner_();
    out = { ok: true, device: cur ? cur.device : '', at: cur ? cur.at : '' };
  }
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(out) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
function _tileSettingsJsonp_(p) {
  var cb = String(p.callback || 'cb').replace(/[^A-Za-z0-9_$.]/g, '');
  var d = {};
  try { d = JSON.parse(getTileSettingsFile_().getBlob().getDataAsString('UTF-8')) || {}; } catch (ignore) { d = {}; }
  var payload = { tiles: _tilesFromCfg_(d), perms: _permsFromCfg_(d), people: _peopleFromCfg_(d),
                  labels: _labelsFromCfg_(d), resets: _resetsFromCfg_(d), claimed: _claimedFromCfg_(d),
                  order: _orderFromCfg_(d),
                  pcHidden: (Array.isArray(d.pcHidden) ? d.pcHidden : []) };
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(payload) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
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
        for (var t in saved[pid]) perms[pid][t] = !!saved[pid][t];
      }
    }
  }
  return perms;
}
function _resetsFromCfg_(d) {
  var r = d && d.resets;
  return (r && typeof r === 'object') ? r : {};
}

var DEFAULT_STAFF_PASSWORD_ = 'ズコ';
function getStaffPassword_() {
  try {
    var file = getTileSettingsFile_();
    var d = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
    if (d && typeof d.staffPassword === 'string' && d.staffPassword) return d.staffPassword;
  } catch (ignore) {}
  return DEFAULT_STAFF_PASSWORD_;
}
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
    out = { ok: false, error: '試行回数が多すぎます。少し待ってから試してください🙇' };
  } else {
    out = { ok: String(p.pw || '') === getStaffPassword_() };
  }
  return ContentService.createTextOutput(cb + '(' + JSON.stringify(out) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
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
    var res = detect(d.events, true, d.date_from);   
    var conflicts = res.conflicts || [];
    for (var i = 0; i < conflicts.length; i++) {
      var c = conflicts[i];
      if ((String(c.a_cal_id) === String(cal) && c.a_event_id === eventId) ||
          (String(c.b_cal_id) === String(cal) && c.b_event_id === eventId)) return true;
    }
  } catch (e) {   }
  return false;
}
var RATE_WINDOW_MS_ = 60000, RATE_LIMIT_ = 5;
function _rateOk_(q) {
  var now = Date.now();
  var recent = q.filter(function (c) {
    var t = Date.parse(c.ts || '');
    return !isNaN(t) && (now - t) < RATE_WINDOW_MS_;
  });
  return recent.length < RATE_LIMIT_;
}
var KANSHI_CTL_KEYS_ = [
  'db_backup', 'db_backup_full', 'program_backup',
  'line_stats_timetree_check', 'ripihoryu_auto',
  'line_prefetch', 'timetree_prefetch', 'edit_worker_watchdog',
  'lt_match', 'lt_miss_watch', 'sales_timetree_transfer',
  'line_shinki_watch', 'line_yoyaku_kakutei',
  'edit_worker', 'conflict_watcher', 'super_link',
  'travel_group', 'power_schedule', 'idle_guard', 'potcoin_stake', 'restore',
  'tile_settings',   
  'lt_auto_verify',  
  'ai_usage_record', 
  'stale_cleanup',   
  'kanshi_device'    
];
var KANSHI_CTL_ACTS_ = ['on', 'off', 'run', 'setval'];
function _validKanshiCtl_(key, act) {
  return KANSHI_CTL_KEYS_.indexOf(String(key)) >= 0 && KANSHI_CTL_ACTS_.indexOf(String(act)) >= 0;
}
function _submitToQueue_(q, op, fields) {
  if (op === 'kanshi_ctl') {
    if (!_rateOk_(q)) return { ok: false, error: '依頼が集中しています。少し待ってから試してください🙇' };
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
    if (!_rateOk_(q)) return { ok: false, error: '依頼が集中しています。少し待ってから試してください🙇' };
    if (!_validRoom_(fields.to_cal, fields.to_label)) return { ok: false, error: '移動先が不正です。' };
    if (!_isCurrentConflict_(fields.cal, fields.event)) {
      return { ok: false, error: 'この予定は現在、被り検出に出ていません。画面を更新してからもう一度試してもらえると嬉しいです🙇' };
    }
  } else if (!_rateOk_(q)) {
    return { ok: false, error: '依頼が集中しています。少し待ってから試してください🙇' };
  }
  var id = 'c' + Date.now() + Math.floor(Math.random() * 1000);
  q.push({ id: id, ts: new Date().toISOString(), op: op,
    cal: fields.cal, event: fields.event, to_cal: fields.to_cal, to_label: fields.to_label,
    room: fields.room || '', title: fields.title || '', from_room: fields.from_room || '',
    new_fruit: fields.new_fruit || '',   
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
  if (p.action === 'hit') {   
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
        new_fruit: p.new_fruit || '',   
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
    } else if (p.action === 'drainlog') {   
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
function getBaseUrl_() {
  try {
    var u = ScriptApp.getService().getUrl();
    if (u) return u;
  } catch (e) {}
  return 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
}
function getEventsFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('EVENTS_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (ignore) {   }
  }
  var it = DriveApp.getFilesByName(EVENTS_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) {
    throw new Error('events.json がドライブに見つかりません。自宅PCで export_events.py を実行し、Googleドライブの同期を待ってください🙇');
  }
  props.setProperty('EVENTS_FILE_ID', newest.getId());
  return newest;
}
var NOTICE_FILENAME = 'notice_compare.json';
function getNoticeFile_() {
  var it = DriveApp.getFilesByName(NOTICE_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) {
    throw new Error('notice_compare.json がドライブに見つかりません。自宅PCから書き出してください🙇');
  }
  return newest;
}
var LT_FILENAME = 'lt_match.json';
function getLtFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('LT_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (ignore) {   }
  }
  var it = DriveApp.getFilesByName(LT_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) {
    throw new Error('lt_match.json がドライブに見つかりません。自宅PCで「予約照合」を実行（export_lt_super.py）し、Googleドライブの同期を待ってください🙇');
  }
  props.setProperty('LT_FILE_ID', newest.getId());
  return newest;
}
var URIAGE_FILENAME = 'uriage.json';
function getUriageFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('URIAGE_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (ignore) {   }
  }
  var it = DriveApp.getFilesByName(URIAGE_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) {
    throw new Error('uriage.json がドライブに見つかりません。自宅PCで export_uriage.py を実行し、Googleドライブの同期を待ってください🙇');
  }
  props.setProperty('URIAGE_FILE_ID', newest.getId());
  return newest;
}
var UNANSWERED_FILENAME = 'unanswered.json';
function getUnansweredFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('UNANSWERED_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (ignore) {   }
  }
  var it = DriveApp.getFilesByName(UNANSWERED_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) {
    throw new Error('unanswered.json がドライブに見つかりません。自宅PCで export_unanswered_super.py を実行し、Googleドライブの同期を待ってください🙇');
  }
  props.setProperty('UNANSWERED_FILE_ID', newest.getId());
  return newest;
}
var AKIJIKAN_FILENAME = 'akijikan.json';
var PROCELL_FILENAME = 'procell.json';
function getProcellFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('PROCELL_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (ignore) {   }
  }
  var it = DriveApp.getFilesByName(PROCELL_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) throw new Error(PROCELL_FILENAME + ' が見つかりません（自宅PCで書き出してください🙇）。');
  props.setProperty('PROCELL_FILE_ID', newest.getId());
  return newest;
}
var PCSTATUS_FILENAME = 'pc_status.json';
function getPcStatusFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('PCSTATUS_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (ignore) {   }
  }
  var it = DriveApp.getFilesByName(PCSTATUS_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) throw new Error(PCSTATUS_FILENAME + ' が見つかりません（自宅PCで書き出してください🙇）。');
  props.setProperty('PCSTATUS_FILE_ID', newest.getId());
  return newest;
}
function getAkijikanFile_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('AKIJIKAN_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (ignore) {   }
  }
  var it = DriveApp.getFilesByName(AKIJIKAN_FILENAME);
  var newest = null;
  while (it.hasNext()) {
    var f = it.next();
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) {
    throw new Error('akijikan.json がドライブに見つかりません。自宅PCで export_akijikan_super.py を実行し、Googleドライブの同期を待ってください🙇');
  }
  props.setProperty('AKIJIKAN_FILE_ID', newest.getId());
  return newest;
}
var MONITOR_FILENAME = 'monitor.json';
function getMonitorFile_(createIfMissing) {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('MONITOR_FILE_ID');
  if (id) {
    try { return DriveApp.getFileById(id); } catch (ignore) {   }
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
    throw new Error('monitor.json がドライブに見つかりません。自宅PCで export_monitor_super.py を実行してください🙇');
  }
  props.setProperty('MONITOR_FILE_ID', newest.getId());
  return newest;
}
var TILE_SETTINGS_FILENAME = 'tile_settings.json';
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
var DEFAULT_TILE_SETTINGS_ = {
  conflict:   { exec: true, staff: true },
  lt:         { exec: true, staff: true },
  uriage:     { exec: true, staff: false },
  unanswered: { exec: true, staff: true },
  akijikan:   { exec: false, staff: false },  
  links:      { exec: true, staff: true },    
  ttapp:      { exec: true, staff: true },     
  kanshi:     { exec: false, staff: false },
  zenjitsu:   { exec: true, staff: true },
  rireki:     { exec: false, staff: false },   
  cost:       { exec: false, staff: false },
  koukoku:    { exec: false, staff: false },
  instadm:    { exec: false, staff: false },
  igdm:       { exec: false, staff: false },
  claudetools: { exec: false, staff: false },
  procell:    { exec: false, staff: false },
  pcstatus:   { exec: false, staff: false },
  bcast:      { exec: false, staff: false },
  sejutsugo:  { exec: true, staff: true },
  sgline:     { exec: true, staff: true },
  kizon:      { exec: false, staff: false },
  timetree:   { exec: false, staff: false },
  shophist:   { exec: false, staff: false },
  procstock:  { exec: false, staff: false },
  uriagebook: { exec: false, staff: false },
  hanbai:     { exec: true, staff: true },
  claudechat: { exec: false, staff: false },
  threads:    { exec: false, staff: false },
  insta:      { exec: false, staff: false },
  facebook:   { exec: false, staff: false },
  mita:       { exec: true, staff: true },
  shomeisho:  { exec: false, staff: false }
};
var DEFAULT_TILE_ORDER_ = ['conflict', 'lt', 'uriage', 'unanswered', 'akijikan', 'links', 'ttapp', 'rireki', 'kanshi', 'zenjitsu', 'cost', 'koukoku', 'igdm', 'instadm', 'claudetools', 'bcast', 'yoyaku', 'procell', 'pcstatus', 'sejutsugo', 'sgline', 'kizon', 'timetree', 'shophist', 'procstock', 'hanbai', 'claudechat', 'threads', 'insta', 'facebook', 'mita', 'uriagebook', 'shomeisho'];
function getTileSettings_() {
  try {
    var file = getTileSettingsFile_();
    var d = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
    if (d && d.tiles && typeof d.tiles === 'object') return d.tiles;
  } catch (ignore) {}
  return DEFAULT_TILE_SETTINGS_;
}
var PEOPLE_ = ['kanbu', 'ringo', 'mikan', 'olive', 'mango', 'coconut', 'pine', 'reception', 'reception_sp'];
var PERSON_LABEL_ = {
  kanbu: '🍅トマト', ringo: '🍎りんご', mikan: '🍊みかん', olive: '🫒オリーブ',
  mango: '🥭マンゴー', coconut: '🥥ココナッツ', pine: '🍍パイン',
  reception: 'お店受付PC', reception_sp: 'お店スマホ'
};
function defaultPerms_(people) {
  var list = people || PEOPLE_;
  var perms = {};
  for (var i = 0; i < list.length; i++) {
    perms[list[i]] = { conflict: true, lt: false, uriage: false, unanswered: false, akijikan: false, links: true, ttapp: true, rireki: false, kanshi: false, zenjitsu: true, yoyaku: true, sejutsugo: true, sgline: true, procstock: false, hanbai: true, mita: true };   
  }
  return perms;
}
function _peopleFromCfg_(d) {
  var ids = PEOPLE_.slice();
  var extra = (d && d.extraPeople && d.extraPeople.length) ? d.extraPeople : [];
  for (var i = 0; i < extra.length; i++) {
    if (extra[i] && extra[i].id && ids.indexOf(extra[i].id) < 0) ids.push(extra[i].id);
  }
  return ids;
}

function _claimedFromCfg_(d) {
  var c = d && d.claimed;
  return (c && typeof c === 'object') ? c : {};
}
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
        out = { ok: false, error: 'すでに他の人が選択しています。再読込してから、もう一度選択してください🙇' };
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
function getPerms_() {
  try {
    var file = getTileSettingsFile_();
    var d = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
    return _permsFromCfg_(d);
  } catch (ignore) {
    return defaultPerms_();
  }
}
function getResets_() {
  try {
    var file = getTileSettingsFile_();
    var d = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
    var r = d && d.resets;
    return (r && typeof r === 'object') ? r : {};
  } catch (ignore) { return {}; }
}
function personPerms_(perms, staff, dev, who) {
  if (dev) return null;   
  var pid = staff ? String(who || '') : 'kanbu';
  return (perms && perms[pid]) || { conflict: true, lt: false, uriage: false, unanswered: false, akijikan: false, links: false, rireki: false, kanshi: false, zenjitsu: true };
}
function viewAllowed_(view, allow) {
  if (view === 'home' || view === 'notice') return true;
  if (!allow) return true;   
  if (view === 'yoyaku' || view === 'yoyaku_new') return allow['yoyaku'] === true;
  if (view === 'yoyaku_sejutsugo' && typeof location !== 'undefined' && /[?&]mode=line(&|$)/.test(location.search))
    return allow['sgline'] === true;
  if (view === 'yoyaku_sejutsugo') return allow['sejutsugo'] === true;
  if (view === 'yoyaku_kizon') return allow['kizon'] === true;
  return allow[view] === true;
}
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
  if (arr.length > 300) arr = arr.slice(arr.length - 300);   
  props.setProperty(ACCESS_LOG_PROP_, JSON.stringify(arr));
}
var CIRCLED = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫','⑬','⑭','⑮','⑯','⑰','⑱','⑲','⑳'];
function circled_(n) { return (n >= 1 && n <= CIRCLED.length) ? CIRCLED[n - 1] : (n + '.'); }
var ROOM_COLORS_ = { 'FREEDOM': '#2ecc87', 'COSMOS': '#3dc2c8', 'HAPPY': '#e73b3b',
                     'LUCKY': '#fdc02d', 'STAR/福/🇫🇷': '#b38bdc' };
function roomColor_(room) {
  return ROOM_COLORS_[room] || '#64748b';
}
var STAFF_COLORS_ = { '🍅': '#d1443c', '🍊': '#e08a1e', '🫒': '#4b8b3b', '🥭': '#c9a227', '🍍': '#c98a3c' };
function staffColor_(fruit) {
  return STAFF_COLORS_[fruit] || '#64748b';
}





function szSentenceBreak_(t) {
  return t.replace(/([。？！])(?=[^\s。？！」』）)\]\uD800-\uDFFF\u2600-\u27BF\uFE0F])/g, '$1\n');
}
function szPopup_(msg, opts) {
  opts = opts || {};
  var mask = document.createElement('div');
  mask.className = 'szpopmask';
  mask.style.cssText = 'position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:20px;';
  var icon = ('icon' in opts) ? opts.icon : '⚠️';
  var yesLabel = opts.yesLabel || 'OK';
  mask.innerHTML =
    "<div style='background:#12303c;border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:26px 24px;max-width:560px;width:100%;max-height:88vh;display:flex;flex-direction:column;box-sizing:border-box;box-shadow:0 14px 44px rgba(0,0,0,.45);text-align:center;'>" +
      (icon ? "<div style='flex:0 0 auto;font-size:56px;line-height:1;margin-bottom:14px;'>" + icon + "</div>" : "") +
      "<div class='szpopmsg' style='flex:1 1 auto;min-height:0;overflow-x:hidden;overflow-y:auto;color:#fff;font-size:1.5rem;font-weight:700;line-height:1.9;white-space:pre-wrap;word-break:auto-phrase;overflow-wrap:break-word;text-wrap:pretty;margin-bottom:22px;'></div>" +
      (opts.noButtons ? "" :
      "<div style='flex:0 0 auto;display:flex;gap:12px;'>" +
        (opts.cancel ? "<button type='button' class='szpopno' style='flex:1;font:inherit;font-size:1.2rem;font-weight:800;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,.25);background:transparent;color:#eaf3f7;cursor:pointer;'>" + (opts.noLabel || 'キャンセル') + "</button>" : "") +
        "<button type='button' class='szpopyes' style='flex:1;font:inherit;font-size:1.2rem;font-weight:800;padding:14px;border-radius:12px;border:0;background:#2C7A99;color:#fff;cursor:pointer;'>" + yesLabel + "</button>" +
      "</div>") +
    "</div>";
  if (opts.isHtml) mask.querySelector('.szpopmsg').innerHTML = msg;
  else mask.querySelector('.szpopmsg').textContent = szSentenceBreak_(String(msg));
  document.body.appendChild(mask);
  var yes = mask.querySelector('.szpopyes');
  if (yes) yes.addEventListener('click', function () { if (mask.parentNode) mask.parentNode.removeChild(mask); if (opts.onYes) opts.onYes(); });
  var no = mask.querySelector('.szpopno'); if (no) no.addEventListener('click', function () { if (mask.parentNode) mask.parentNode.removeChild(mask); if (opts.onNo) opts.onNo(); });
  return mask;
}
var ROOMS_ = {
  'FREEDOM':      { cal: '73208496', label: 1 },
  'COSMOS':       { cal: '59950873', label: 2 },
  'HAPPY':        { cal: '59950855', label: 6 },
  'LUCKY':        { cal: '59950871', label: 9 },
  'STAR/福/🇫🇷': { cal: '86075789', label: 10 }
};
var ROOM_ORDER_ = ['FREEDOM', 'HAPPY', 'LUCKY', 'STAR/福/🇫🇷'];
function hmToMin_(s) {
  var m = /^(\d{1,2}):(\d{2})$/.exec(String(s || ''));
  if (!m) return null;
  return (+m[1]) * 60 + (+m[2]);
}
function toHm_(min) {
  var h = Math.floor(min / 60), m = min % 60;
  return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
}
function parseTimeRange_(s) {
  var parts = String(s || '').split('-');
  if (parts.length !== 2) return null;
  var a = hmToMin_(parts[0]), b = hmToMin_(parts[1]);
  return (a == null || b == null) ? null : [a, b];
}
function roomIsFree_(roomBusyForDate, name, s, e) {
  var ivs = (roomBusyForDate && roomBusyForDate[name]) || [];
  for (var i = 0; i < ivs.length; i++) {
    if (ivs[i][0] < e && s < ivs[i][1]) return false;   
  }
  return true;
}
function moveRow_(cal, event, who, title, curRoom, roomBusyForDate, timeStr, whoShort) {
  var hasId = (cal != null && cal !== '' && event != null && event !== '');
  var range = parseTimeRange_(timeStr);
  var btns = '';
  var anyFree = false;
  for (var i = 0; i < ROOM_ORDER_.length; i++) {
    var name = ROOM_ORDER_[i];
    if (name === curRoom) continue;   
    if (range && !roomIsFree_(roomBusyForDate, name, range[0], range[1])) continue;  
    anyFree = true;
    var rm = ROOMS_[name];
    btns += '<button type="button" class="mvbtn"' +
      (hasId ? '' : ' disabled') +
      ' data-cal="' + esc_(cal) + '" data-ev="' + esc_(event) + '"' +
      ' data-tocal="' + rm.cal + '" data-tolabel="' + rm.label + '"' +
      ' data-room="' + esc_(name) + '" data-title="' + esc_(title) + '"' +
      ' data-who="' + esc_(who) + '" data-fromroom="' + esc_(curRoom) + '"' +
      ' data-whoshort="' + esc_(whoShort || who) + '"' +   
      ' data-time="' + esc_(timeStr || '') + '"' +
      ' data-fromcolor="' + roomColor_(curRoom) + '" data-fromshort="' + esc_(shortRoomName_(curRoom)) + '"' +
      ' data-toshort="' + esc_(shortRoomName_(name)) + '"' +   
      ' style="--rc:' + roomColor_(name) + '">' + esc_(name) + '</button>';
  }
  var note = !hasId ? '<span class="mvng">IDが取れず移動不可</span>'
    : (!anyFree ? '<span class="mvng">空いている部屋がありません</span>' : '');
  return '<div class="mvrow">' +
    '<div class="mvlabel fit1line">移動先の部屋を選択してください😊 （下のボタンを押す）</div>' +
    '<div class="mvhint fit1line">※空いている施術室のみ表示しています</div>' +
    '<span class="mvbtns">' + btns + note + '</span>' +
  '</div>';
}
var DAY_WIN_S_ = 11 * 60, DAY_WIN_E_ = 21 * 60;
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
function jpDateWeekday_(iso) {
  var p = String(iso || '').split('-').map(Number);
  if (p.length !== 3 || !p[0]) return String(iso || '');
  var w = ['日', '月', '火', '水', '木', '金', '土'][new Date(p[0], p[1] - 1, p[2]).getDay()];
  return p[1] + '月' + p[2] + '日(' + w + ')';
}
function jpMonthDay_(iso) {
  var p = String(iso || '').split('-').map(Number);
  if (p.length !== 3 || !p[0]) return String(iso || '');
  return p[1] + '月' + p[2] + '日';
}
function staffMoveRow_(cal, event, title, oldFruit, oldName, timeStr, who, dayStaff) {
  var hasId = !!cal && !!event;
  var range = parseTimeRange_(timeStr);
  var btns = '', anyFree = false;
  (dayStaff || []).forEach(function (row) {
    var f = row[0], name = row[1], slots = row[3] || [];
    if (f === oldFruit) return;
    if (f === '🍍') return;   
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
  return '<div class="mvrow"><div class="mvlabel fit1line">変更先の担当を選択してください😊 （下のボタンを押す）</div>' +
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
    return '<div class="menuwrap"><span class="menutag">施術内容</span>' +
      '<ul class="menu">' + items + '</ul></div>';
  }
  var scope = '今日以降（' + esc_(payload.date_from) + '）';
  var roomsStr = meta.rooms_list.join('・');

  var items = [];   
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
    '<a class="homelink" href="' + (base || '') + '?view=home' + roleSfx_(staff, dev) + '" target="_top">← 戻る</a>' +
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
var LINE_LOGO_ = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">' +
  '<rect width="24" height="24" rx="7" fill="#06C755"/>' +
  '<path d="M12 6.2c-3.3 0-6 2.1-6 4.7 0 2.3 2 4.2 4.8 4.6.5.1.4.35.3.85l-.08.5c-.05.3.2.42.48.3 1.9-.8 4-2.55 5.3-4.05.68-.8 1.2-1.6 1.2-2.7 0-2.6-2.7-4.7-6-4.7z" fill="#fff"/></svg>';
var TT_LOGO_ = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">' +
  '<rect width="24" height="24" rx="7" fill="#2bad6f"/>' +
  '<rect x="5.5" y="7.4" width="13" height="10.6" rx="2" fill="#fff"/>' +
  '<rect x="5.5" y="7.4" width="13" height="3.3" rx="2" fill="#12864e"/>' +
  '<rect x="8" y="5.3" width="1.7" height="3.6" rx=".85" fill="#12864e"/>' +
  '<rect x="14.3" y="5.3" width="1.7" height="3.6" rx=".85" fill="#12864e"/></svg>';
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
  { id: 'ttapp', cls: 'ttapp', view: 'ttapp',
    icon: '<span class="ticon">🗓️</span>', label: '元祖TT\nアプリ' },
  { id: 'kanshi', cls: 'kanshi', view: 'kanshi',
    icon: '<span class="ticon">📟</span>', label: '自動監視\n（開発用）' },
  { id: 'zenjitsu', cls: 'zenjitsu', view: 'zenjitsu',
    icon: '<span class="ticon">🔔</span>', label: '前日\nお知らせ' },
  { id: 'rireki', cls: 'rireki', view: 'rireki',
    icon: '<span class="ticon">🔎</span>', label: '顧客履歴\n検索' },
  { id: 'cost', cls: 'cost', view: 'cost',
    icon: '<span class="ticon">🍅</span>', label: '台湾トマト\n売上・コスト' },
  { id: 'koukoku', cls: 'koukoku', view: 'koukoku',
    icon: '<span class="ticon">📣</span>', label: '広告費\n管理' },
  { id: 'igdm', cls: 'igdm', view: 'igdm',
    icon: '<span class="ticon">📱</span>', label: 'DM\n再現' },
  { id: 'instadm', cls: 'instadm', view: 'instadm',
    icon: '<span class="ticon">📩</span>', label: 'IGの\nDM' },
  { id: 'claudetools', cls: 'claudetools', view: 'claudetools',
    icon: '<span class="ticon">🤖</span>', label: '自作Claude\nツール' },
  { id: 'honyaku', cls: 'honyaku', view: 'honyaku',
    icon: '<span class="ticon">🀄</span>', label: '翻訳\n日→台湾中国語' },
  { id: 'bcast', cls: 'bcast', view: 'bcast',
    icon: '<span class="ticon">📣</span>', label: 'LINE\n一斉配信' },
  { id: 'procell', cls: 'procell', view: 'procell',
    icon: '<span class="ticon">🧴</span>', label: 'プロセル\n残り本数' },
  { id: 'pcstatus', cls: 'pcstatus', view: 'pcstatus',
    icon: '<span class="ticon">🖥️</span>', label: '自宅\nPC' },
  { id: 'yoyaku', cls: 'yoyaku', view: 'yoyaku',
    icon: '<span class="ticon">📝</span>', label: '予約\n入力' },
  { id: 'sejutsugo', cls: 'sejutsugo', view: 'yoyaku_sejutsugo',
    icon: '<span class="ticon">💆</span>', label: '施術後の\n予約' },
  { id: 'sgline', cls: 'sgline', view: 'yoyaku_sejutsugo&mode=line',
    icon: '<span class="ticon">💌</span>', label: '施術後の\nLINE送信' },
  { id: 'kizon', cls: 'kizon', view: 'yoyaku_kizon',
    icon: '<span class="ticon">📖</span>', label: '既存の\n予約' },
  { id: 'timetree', cls: 'timetree', view: 'timetree',
    icon: '<span class="ticon">' + TT_LOGO_ + '</span>', label: 'Time\nTree' },
  { id: 'shophist', cls: 'shophist', view: 'shophist',
    icon: '<span class="ticon">🛍️</span>', label: 'T＆Tショップ\n履歴' },
  { id: 'procstock', cls: 'procstock', view: 'procstock',
    icon: '<span class="ticon">📦</span>', label: 'プロセル\n在庫' },
  { id: 'uriagebook', cls: 'uriagebook', view: 'uriagebook',
    icon: '<span class="ticon">📒</span>', label: 'TT売上\n帳簿' },
  { id: 'hanbai', cls: 'hanbai', view: 'hanbai',
    icon: '<span class="ticon">🛒</span>', label: 'No31\n販売管理' },
  { id: 'claudechat', cls: 'claudechat', view: 'claudechat',
    icon: '<span class="ticon">💬</span>', label: 'Claudeに\n聞く' },
  { id: 'threads', cls: 'threads', view: 'threads',
    icon: '<span class="ticon">🧵</span>', label: 'Threads\n投稿' },
  { id: 'insta', cls: 'insta', view: 'insta',
    icon: '<span class="ticon">📸</span>', label: 'インスタ' },
  { id: 'facebook', cls: 'facebook', view: 'facebook',
    icon: '<span class="ticon">📘</span>', label: 'Facebook' },
  { id: 'mita', cls: 'mita', view: 'mita',
    icon: '<span class="ticon">👀</span>', label: 'お知らせ\n見てくれた？' },
  { id: 'shomeisho', cls: 'shomeisho', view: 'shomeisho',
    icon: '<span class="ticon">🧾</span>', label: '購入証明書\n作成' }
];
var TILE_GROUP_ = {
  kanshi: 'kanri', mushitori: 'kanri', cost: 'keiei', koukoku: 'keiei', imglink: 'kanri',
  instadm: 'kanri', igdm: 'kanri', claudetools: 'kanri', pcstatus: 'kanri',
  procell: 'keiei', shophist: 'keiei',
  uriage: 'tomato',
  shomeisho: 'tomato',   
  unanswered: 'kaihatsu', rireki: 'kaihatsu', timetree: 'kaihatsu', kizon: 'kaihatsu',
  formconv: 'kaihatsu', honyaku: 'kaihatsu', claudechat: 'kaihatsu', threads: 'kaihatsu', insta: 'kaihatsu', facebook: 'kaihatsu', uriagebook: 'kaihatsu'
};
var ROLE_DEFS_ = [
  { id: 'jitsumu', icon: '💼', title: 'スタッフ画面' },
  { id: 'keiei', icon: '📊', title: 'りゅう（経営管理ツール）' },
  { id: 'kanri', icon: '🛠️', title: 'りゅう（便利ツール）' },
  { id: 'kaihatsu', icon: '🧑‍💻', title: '開発中の機能' }
];
function tileGroup_(id) { return TILE_GROUP_[id] || 'jitsumu'; }
var BLANK_AFTER_ = { jitsumu: ['bcast'] };
function tilesGap_(list, gaps, draw) {   
  var n = 0;
  return list.map(function (t) {
    var h = draw(t); n++;
    if ((gaps || []).indexOf(t.id) >= 0 && n % 2 === 1) { h += '<div class="tilegap"></div>'; n++; }
    return h;
  }).join('');
}
var SUB_ROLES_ = { jitsumu: [{ id: 'tomato', icon: '🍅', title: 'TOMATO画面' }] };
var ROLEMENU_SCRIPT_ =
'<script>(function(){' +
'var menu=document.getElementById("rolemenu");if(!menu)return;' +
'function remember(id){try{if(id)sessionStorage.setItem("sz_home_group",id);else sessionStorage.removeItem("sz_home_group");}catch(e){}}' +
'function showMenu(){remember("");menu.style.display="";var g=document.querySelectorAll(".group");for(var i=0;i<g.length;i++)g[i].style.display="none";window.scrollTo(0,0);}' +
'function showGroup(id){remember(id);menu.style.display="none";var g=document.querySelectorAll(".group");for(var i=0;i<g.length;i++)g[i].style.display=(g[i].id==="group-"+id)?"":"none";window.scrollTo(0,0);}' +
'var rb=menu.querySelectorAll(".rolebtn");for(var i=0;i<rb.length;i++){(function(b){b.addEventListener("click",function(){showGroup(b.getAttribute("data-role"));});})(rb[i]);}' +
'var bb=document.querySelectorAll(".backbtn");for(var j=0;j<bb.length;j++){bb[j].addEventListener("click",showMenu);}' +
'try{var sg=sessionStorage.getItem("sz_home_group");if(sg&&document.getElementById("group-"+sg)){menu.style.display="none";var g2=document.querySelectorAll(".group");for(var k=0;k<g2.length;k++)g2[k].style.display=(g2[k].id==="group-"+sg)?"":"none";}}catch(e){}' +
'})();</script>';
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
function renderHome_(base, staff, dev, who) {
  var d = {};
  try { d = JSON.parse(getTileSettingsFile_().getBlob().getDataAsString('UTF-8')) || {}; } catch (ignore) {}
  return renderHomePage_({ perms: _permsFromCfg_(d), labels: _labelsFromCfg_(d), order: _orderFromCfg_(d) },
                          base, staff, dev, who);
}
function renderHomePage_(cfg, base, staff, dev, who) {
  var perms = (cfg && cfg.perms) || defaultPerms_();
  var labels = (cfg && cfg.labels) || PERSON_LABEL_;
  var allow = personPerms_(perms, staff, dev, who);   
  var sfx = roleSfx_(staff, dev);
  var subtitle = dev ? '開発版（全ボタン表示）'
    : (staff ? (labels[who] || 'スタッフ') : 'TOMATOさん版');
  var order = (cfg && cfg.order) || DEFAULT_TILE_ORDER_;
  var byId = {};
  for (var oi = 0; oi < TILE_DEFS_.length; oi++) byId[TILE_DEFS_[oi].id] = TILE_DEFS_[oi];
  var orderedDefs = [];
  var placed = {};
  for (var oj = 0; oj < order.length; oj++) {
    if (byId[order[oj]] && !placed[order[oj]]) { orderedDefs.push(byId[order[oj]]); placed[order[oj]] = true; }
  }
  for (var ok = 0; ok < TILE_DEFS_.length; ok++) {   
    if (!placed[TILE_DEFS_[ok].id]) orderedDefs.push(TILE_DEFS_[ok]);
  }
  var shown = orderedDefs.filter(function (t) {
    if (t.always) return true;        
    if (!allow) return true;          
    return allow[t.id] === true;      
  });
  function tileA_(t) {
    var href = t.url ? t.url : (base + '?view=' + t.view + sfx);
    var target = t.url ? '_blank' : '_top';
    var rel = t.url ? ' rel="noopener"' : '';
    return '<a class="tile ' + t.cls + '" href="' + href + '" target="' + target + '"' + rel + '>' +
      t.icon + '<span class="tname">' + esc_(t.label) + '</span></a>';
  }
  var head =
    '<div class="hhead"><img class="bmark" src="https://ttsuperzuco.github.io/tt/icons/icon-180.png" alt=""><span class="bname">TTスーパーズコ</span></div>' +
    '<div class="hsub">' + subtitle + '</div>';
  if (dev) {
    var byG = { keiei: [], kanri: [], jitsumu: [], kaihatsu: [], tomato: [] };
    for (var gi = 0; gi < shown.length; gi++) { (byG[tileGroup_(shown[gi].id)] || byG.jitsumu).push(shown[gi]); }
    var menuHtml = '', groupsHtml = '';
    for (var ri = 0; ri < ROLE_DEFS_.length; ri++) {
      var R = ROLE_DEFS_[ri], list = byG[R.id] || [], subs = SUB_ROLES_[R.id] || [], nsub = 0;
      for (var si = 0; si < subs.length; si++) nsub += (byG[subs[si].id] || []).length;
      menuHtml += '<button type="button" class="rolebtn ' + R.id + '" data-role="' + R.id + '">' +
        '<span class="ricon">' + R.icon + '</span><span class="rname">' + R.title + '</span>' +
        '<span class="rcount">' + (list.length + nsub) + '個</span></button>';
      groupsHtml += '<div class="group" id="group-' + R.id + '" style="display:none">' +
        '<div class="backbar"><button type="button" class="backbtn">← 戻る</button></div>' +
        '<div class="grouptitle">' + R.icon + ' ' + R.title + '</div>' +
        '<div class="tiles">' + tilesGap_(list, BLANK_AFTER_[R.id], tileA_) + '</div>' + subs.map(function (S) {
          var sl = byG[S.id] || [];
          return sl.length ? ('<div class="grouptitle" style="margin-top:22px">' + S.icon + ' ' + S.title + '</div>' +
            '<div class="tiles">' + sl.map(tileA_).join('') + '</div>') : '';
        }).join('') + '</div>';
    }
    return '<style>' + HOMECSS_ + '</style>' +
      '<div class="home">' + head +
        '<div class="rolemenu" id="rolemenu">' + menuHtml + '</div>' +
        groupsHtml +
      '</div>' + ROLEMENU_SCRIPT_ + EXTLINK_SCRIPT_;
  }
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' + head +
    '<div class="tiles">' + tilesGap_(shown, staff ? BLANK_AFTER_.jitsumu : [], tileA_) + '</div>' +
  '</div>' + EXTLINK_SCRIPT_;
}
function renderLT_(base, staff, dev) {
  try {
    var file = getLtFile_();
    var d = JSON.parse(file.getBlob().getDataAsString('UTF-8'));
    return renderLtPage_(d, base, staff, dev);
  } catch (err) {
    return renderError_(err, base, staff, dev);
  }
}



function ltDismLabel_(r) {
  var rc = r.recheck_disposition || '';
  if (rc === 'awaiting_reply') return 'まだ予約前（客の返事待ち）';
  if (rc === 'confirmed_ok') return 'もう入っている';
  return '対応不要';
}

function comma_(n) { return String(n == null ? '' : n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function renderUriage_(base, staff, dev) {
  try {
    var d = JSON.parse(getUriageFile_().getBlob().getDataAsString('UTF-8'));
    return renderUriagePage_(d, base, staff, dev);
  } catch (err) {
    return renderUriageError_(err, base, staff, dev);
  }
}
function backBar_(base, staff, dev) {
  return '<div class="ubar"><a class="uhome" href="' + (base || '') + '?view=home' +
    roleSfx_(staff, dev) + '" target="_top">← 戻る</a></div>';
}






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
'    if(!ms.length){ log.innerHTML = "<div class=\\"idmempty\\">この会話の内容はまだ取得できていません。</div>"; }' +
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
function idmWithinMonth_(ts) {
  ts = (ts || '').trim();
  if (!ts) return true;
  var m = ts.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (m) {
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return (Date.now() - d.getTime()) <= 31 * 24 * 3600 * 1000;
  }
  if (/ヶ月|か月|个月|年/.test(ts)) return false;          
  var w = ts.match(/(\d+)\s*(週間|週|周)/);
  if (w && +w[1] >= 5) return false;                        
  return true;                                              
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
    body = '<div class="idmempty">まだ読み取っていません。<br>少し待ってから、もう一度開いてください😊</div>';
  } else {
    for (var i = 0; i < accounts.length; i++) {
      var a = accounts[i], threads = a.threads || [], reqs = a.requests || [];
      var waiting = [], done = [];
      for (var k = 0; k < threads.length; k++) {
        var item = { t: threads[k], j: k };
        (threads[k].waiting ? waiting : done).push(item);
      }
      var locRes = idmResGet_();
      waiting = waiting.filter(function (x) {
        var kk = 't:' + a.key + ':' + (x.t.id || '');
        return idmWithinMonth_(x.t.last_ts) && !x.t.resolved && !idmLocHide_('t', locRes[kk], x.t.last_ts || '');
      });
      var reqsShown = reqs.filter(function (r) {
        var kk = 'r:' + a.key + ':' + idmStripNum_(r.name);
        return idmWithinMonth_(r.ts) && !r.resolved && !idmLocHide_('r', locRes[kk], idmReqSig_(r));
      });
      body += '<div class="idmacc">📷 ' + esc_(a.label || '') +
        ' <span class="idmbadge">当店が未返信 ' + (waiting.length + reqsShown.length) + '</span></div>';
      body += '<div class="idmsec">✉️ 当店が未返信</div>';
      if (waiting.length + reqsShown.length) {
        for (var w = 0; w < waiting.length; w++) {
          var tw = waiting[w].t;
          var tKey = 't:' + a.key + ':' + (tw.id || '');
          body += tcard(i, waiting[w].j, tw.title, tw.last_text, tw.last_ts, 'wait',
                        '<span class="idmtag wait">返事待ち</span>', tKey, tw.last_ts || '', a.key, tw.id || '');
        }
        for (var r = 0; r < reqsShown.length; r++) {
          var un = reqsShown[r].unread ? '<span class="idmtag new">未読</span>' : '<span class="idmtag done">既読</span>';
          var sp = reqsShown[r].spam ? '<span class="idmtag spam">🚫 スパムかも</span>' : '';
          var occ = idmOccOf_(reqs, reqsShown[r]);   
          var rKey = 'r:' + a.key + ':' + idmStripNum_(reqsShown[r].name);
          var rSig = idmReqSig_(reqsShown[r]);
          body += rcard(a.key, reqsShown[r].name, reqsShown[r].preview, reqsShown[r].ts, sp + un, occ, rKey, rSig);
        }
      } else { body += '<div class="idmempty">1ヶ月以内に未返信はありません。</div>'; }
    }
  }
  return '<style>' + INSTADM_CSS_ + '</style>' +
    backBar_(base, staff, dev) +
    '<div class="idmwrap">' +
      '<h1>📩 IGのDM<span class="idmgen">' + esc_(d.read_at || '—') + ' 時点</span>' +
        '<span class="idmchg" onclick="if(window.idmClear)window.idmClear()">パスワードを変更</span></h1>' +
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
function idmNorm_(s) {
  try { return String(s || '').normalize('NFKC').trim().toLowerCase(); }
  catch (e) { return String(s || '').trim().toLowerCase(); }
}
function idmOccOf_(reqs, item) {
  var nm = idmNorm_(item.name), idx = reqs.indexOf(item), c = 0;
  for (var i = 0; i < reqs.length && i < idx; i++) { if (idmNorm_(reqs[i].name) === nm) c++; }
  return c;
}
function idmStripNum_(s) { return idmNorm_(s).replace(/\s*\d+\s*$/, '').trim(); }
function idmResGet_() { try { return JSON.parse(localStorage.getItem('idm_resolved') || '{}') || {}; } catch (e) { return {}; } }
function idmResAdd_(key, sig) { try { var m = idmResGet_(); m[key] = sig; localStorage.setItem('idm_resolved', JSON.stringify(m)); } catch (e) {} }
function idmResDel_(key) { try { var m = idmResGet_(); delete m[key]; localStorage.setItem('idm_resolved', JSON.stringify(m)); } catch (e) {} }
function idmReqSig_(r) { return (r.preview || '') + '|u' + (r.unread ? '1' : '0'); }
function idmLocHide_(kind, stored, now) {
  if (!stored) return false;
  if (kind === 't') {
    if (!now) return true;
    return String(now) <= String(stored);
  }
  var a = idmReqSplit_(stored), b = idmReqSplit_(now);
  if (a.prev !== b.prev) return false;                 
  if (a.unread === false && b.unread === true) return false;  
  return true;
}
function idmReqSplit_(sig) {
  var s = String(sig || ''), m = s.match(/\|u([01])$/);
  if (m) return { prev: s.slice(0, s.length - m[0].length), unread: m[1] === '1' };
  var i = s.lastIndexOf('|');
  return { prev: i >= 0 ? s.slice(0, i) : s, unread: null };
}
function idmReplyBox_() {
  return '<div class="idmreplybox" style="display:none" onclick="event.stopPropagation()">' +
    '<textarea class="idmrtxt" placeholder="返信を入力（送るとお客さんに届きます）"></textarea>' +
    '<div class="idmrrow"><button type="button" class="idmrsend" onclick="event.stopPropagation();idmSendReply(this)">送る</button>' +
    '<span class="idmrst"></span></div></div>';
}
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
    btn.disabled = true;                       
    if (st) st.textContent = waitMsg;
    if (fn) fn(); else { btn.disabled = false; if (st) st.textContent = 'この画面からは送れません。'; }
  }
  if (kind === 't') {
    var thId = card.getAttribute('data-rid') || '';
    szPopup_('このお客さんに送りますか？😊\n\n' + txt, { icon: '✉️', cancel: true, yesLabel: '送る', onYes: function () {
      idmGo_('送信中…', window.igdmReply && function () { window.igdmReply(acc, thId, txt, idmDone_); });
    } });
  } else if (kind === 'r') {
    var name = card.getAttribute('data-rname') || '';
    var occ = parseInt(card.getAttribute('data-rocc') || '0', 10) || 0;
    szPopup_('この初めての人「' + name + '」を承認して、返信を送りますか？😊\n\n' + txt,
      { icon: '✉️', cancel: true, yesLabel: '承認して送る', onYes: function () {
        idmGo_('承認して送信中…', window.igdmApproveReply && function () { window.igdmApproveReply(acc, name, occ, txt, idmDone_); });
      } });
  }
}
function idmResolve(btn) {
  if (!btn) return;
  var key = btn.getAttribute('data-key') || '';
  var sig = btn.getAttribute('data-sig') || '';
  if (!key) return;
  var card = btn;
  for (var k = 0; k < 4 && card && !(card.className && ('' + card.className).indexOf('idmcard') >= 0); k++) card = card.parentElement;
  szPopup_('この相手を「解決済み」にして一覧から隠しますか？😊\n（削除はしません。相手から新しいメッセージが来たら、その時だけまた出ます）',
    { icon: '✓', cancel: true, yesLabel: '解決済みにする', onYes: function () {
      idmResAdd_(key, sig);                       
      if (card) { card.style.transition = 'opacity .3s'; card.style.opacity = '0';
        setTimeout(function () { if (card) card.style.display = 'none'; }, 300); }
      if (!window.igdmResolve) return;
      window.igdmResolve(key, sig, function (m) {
        if (m && ('' + m).indexOf('解決済み') >= 0) return;   
        idmResDel_(key);
        if (card) { card.style.display = ''; card.style.opacity = '1'; }
        szPopup_('うまくいきませんでした。もう一度押してください🙇\n（' + ('' + (m || 'つながりませんでした')) + '）');
      });
    } });
}
function idmDelReq(btn) {
  if (!btn) return;
  var acc = btn.getAttribute('data-acc') || '';
  var name = btn.getAttribute('data-name') || '';
  var prev = btn.getAttribute('data-prev') || '';
  var occ = parseInt(btn.getAttribute('data-occ') || '0', 10) || 0;
  if (!confirm('この初めての人「' + name + '」を削除しますか？😊\n元に戻せません。')) return;
  var card = btn;
  for (var k = 0; k < 4 && card && !(card.className && card.className.indexOf('idmcard') >= 0); k++) card = card.parentElement;
  var st = card ? card.querySelector('.idmdelst') : null;
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
    if (m && m.indexOf('削除しました') >= 0 && card && card.parentNode) {
      card.style.transition = 'opacity .4s';
      card.style.opacity = '0';
      setTimeout(function () { if (card.parentNode) card.parentNode.removeChild(card); }, 400);
    }
  });
}
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
  if (!msgs.length) log.innerHTML = '<div class="idmempty">内容がありませんでした。</div>';
  msgs.forEach(function (m) {
    var row = document.createElement('div'); row.className = 'idmmsg ' + (m.me ? 'me' : 'them');
    row.innerHTML = '<div class="idmbub">' + esc_(m.text) + '</div><div class="idmmt">' + esc_(m.ts || '') + '</div>';
    log.appendChild(row);
  });
  mask.classList.add('show'); log.scrollTop = log.scrollHeight;
}
function idmDoReqDetail(btn) {
  if (!btn) return;
  var acc = btn.getAttribute('data-acc') || '', name = btn.getAttribute('data-name') || '', prev = btn.getAttribute('data-prev') || '';
  var occ = parseInt(btn.getAttribute('data-occ') || '0', 10) || 0;
  var card = btn;
  for (var k = 0; k < 5 && card && !(card.className && ('' + card.className).indexOf('idmcard') >= 0); k++) card = card.parentElement;
  var st = card ? card.querySelector('.idmdelst') : null;
  var t0 = new Date().getTime(), tick = null;
  function stop() { if (tick) { clearInterval(tick); tick = null; } }
  if (st) {
    st.textContent = '内容を読み込んでいます… 0秒（開くので既読が付きます）';
    tick = setInterval(function () {
      if (!st) return stop();
      st.textContent = '内容を読み込んでいます… ' + Math.round((new Date().getTime() - t0) / 1000) + '秒（開くので既読が付きます）';
    }, 1000);
  }
  if (window.idmReqDetail) window.idmReqDetail(acc, name, prev, occ,
    function (m) { stop(); if (st) st.textContent = m; },
    function (d) { stop(); if (st) st.textContent = ''; idmShowMsgs(d.title, d.msgs); });
  else stop();
}
function renderInstaDmGate_(msg, base, staff, dev) {
  return '<style>' + INSTADM_CSS_ + '</style>' +
    backBar_(base, staff, dev) +
    '<div class="idmwrap">' +
      '<h1>📩 IGのDM</h1>' +
      '<div class="idmgate">' +
        '<div class="idmgt">🔒 パスワードを入力してください😊</div>' +
        '<div class="idmgm">この画面にはお客さまとの会話が入っています。パスワードを知っている端末だけ開けます。' +
          '一度入力すると、この端末では次回から入力不要です。</div>' +
        (msg ? '<div class="idmgerr">' + esc_(msg) + '</div>' : '') +
        '<input id="idmPw" type="password" class="idmginput" placeholder="パスワード" autocomplete="off" />' +
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



















var KOUKOKU_FILENAME = 'koukoku.json';
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






















function renderUriagePage_(d, base, staff, dev) {
  return '<style>' + HOMECSS_ + URIAGECSS_ + '</style>' +
  '<div class="home">' +
    '<div class="ubar"><a class="uhome" href="' + (base || '') + '?view=home' + roleSfx_(staff, dev) + '" target="_top">← 戻る</a>' +
      '<span class="ugen2">最終計算: ' + esc_(d.generated_at || '—') + '</span>' +
    '</div>' +
    '<div class="hhead uttight"><span class="bmark">💰</span><span class="bname">売上転記TimeTree</span></div>' +
    uriageBody_(d, dev) +
  '</div>' +
  URIAGESCRIPT_;
}
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
  var uyear_ = parseInt(String(d.today || '').slice(0, 4), 10) || (new Date()).getFullYear();
  var UWD_ = ['日', '月', '火', '水', '木', '金', '土'];
  var TW_HOL_ = {
    2026: ['1/1', '2/16', '2/17', '2/18', '2/19', '2/20', '2/28',
           '4/4', '4/5', '5/1', '6/19', '9/25', '10/10']
  };
  var holList = TW_HOL_[uyear_] || [];
  var perRows = (d.per_day || []).map(function (x) {
    var p = String(x.date).split('/');
    var wd = '';
    var mark = false;   
    if (p.length === 2) {
      var dt = new Date(uyear_, parseInt(p[0], 10) - 1, parseInt(p[1], 10));
      wd = '（' + UWD_[dt.getDay()] + '）';
      mark = (dt.getDay() === 6) || (holList.indexOf(x.date) >= 0);
    }
    return '<tr' + (mark ? ' class="sat"' : '') + '><td>' + esc_(x.date) + wd + '</td><td class="num">' + comma_(x.total) + '</td></tr>';
  }).join('');
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
  '<button type="button" id="uallbtn" class="ubtn uall">帳簿売上をTimeTreeに記録</button>' +
  (dev ? '<div class="udev"><div class="udevt">🛠 このボタンを押すと実行する内容（開発者向け）</div>' +
    '<ol class="udevl">' +
      '<li>帳簿の「まだTimeTreeに書いていない売上」を、TimeTreeに新しく記入する（すでに入っている値は触らない）。</li>' +
      '<li>TimeTreeにすでに入っている売上に記入ミスがあれば、帳簿の正しい金額に上書きして修正する。</li>' +
      '<li>プロセルの売上表（在庫管理シート）にも、同じ売上を書き写す（転記する）。</li>' +
      '<li>今月の初日がまだTimeTreeに書かれていなければ、TimeTreeとプロセルの先月ぶんに記入ミス・書き漏れがないか全部確認し、あれば修正する。</li>' +
      '<li>プロセル表・TimeTreeへの記入や修正が自動で判断できないときは、開発者のLINEに通知が飛ぶ。</li>' +
    '</ol></div>' : '');
}
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
'      else if(tries>=120){ clearInterval(timer); szOverlayResult_(false,"時間切れです","もう一度試してもらえると嬉しいです🙇"); allBtn.disabled=false; enableUriageBtns(); }' +
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
function renderUnanswered_(base, staff, dev) {
  try {
    var d = JSON.parse(getUnansweredFile_().getBlob().getDataAsString('UTF-8'));
    return renderUnansweredPage_(d, base, staff, dev);
  } catch (err) {
    return renderUnansweredError_(err, base, staff, dev);
  }
}








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








var UB_PEND_KEY_ = 'sz_ub_pending';
var UB_EXEC_ = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
var UB_KEY_ = 'kx7Q2p9mVt4Zr8';
var UB_FAIL_ = 'スプレッドシートの売上帳簿への書き込みが失敗しました。りゅうさんに連絡してください🙇';
var ubWatchTimer_ = null, ubPopQ_ = [], ubChecking_ = {};
function ubPendList_() { try { return JSON.parse(localStorage.getItem(UB_PEND_KEY_) || '[]'); } catch (e) { return []; } }
function ubPendSave_(a) { try { localStorage.setItem(UB_PEND_KEY_, JSON.stringify(a)); } catch (e) {} }

function ubPendDrop_(id) { ubPendSave_(ubPendList_().filter(function (x) { return x.id !== id; })); }
function ubJsonp_(p, cb) {
  var n = '__ubw' + Date.now() + Math.floor(Math.random() * 1000);
  window[n] = function (r) { try { delete window[n]; } catch (e) {} cb(r); };
  var q = 'callback=' + n; for (var k in p) q += '&' + k + '=' + encodeURIComponent(p[k]);
  var s = document.createElement('script'); s.src = UB_EXEC_ + '?' + q + '&cb=' + Date.now();
  s.onerror = function () { cb(null); }; (document.body || document.documentElement).appendChild(s);
}
function ubShowNextPop_() {
  if (!ubPopQ_.length || typeof szPopup_ !== 'function') return;
  if (document.querySelector('.szpopmask') || document.getElementById('ubMask')) return;   
  var m = ubPopQ_.shift();
  szPopup_(m.html || m.text, { icon: m.icon, isHtml: !!m.html, onYes: function () { setTimeout(ubShowNextPop_, 200); } });
}
function ubDone_(o, ok, text) {
  ubPendDrop_(o.id);
  var t2 = String(text || '').trim(); if (t2 && !/[。！？]$/.test(t2)) t2 += '。';
  var e2 = function (v) { return String(v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  ubPopQ_.push(ok ? { icon: '✅', html: '<div style="white-space:nowrap;font-size:min(1.5rem,4.2vw)">売上帳簿への書き込みが終わりました。</div>' + (t2 ? '<div>' + e2(t2) + '</div>' : '') }
                  : { icon: '⚠️', text: text || UB_FAIL_ });
  try { window.dispatchEvent(new CustomEvent('ubdone', { detail: { id: o.id, ok: ok } })); } catch (e) {}
  ubShowNextPop_();
}
function ubWatchTick_() {
  var a = ubPendList_();
  ubShowNextPop_();
  if (!a.length && !ubPopQ_.length) { clearInterval(ubWatchTimer_); ubWatchTimer_ = null; return; }
  a.forEach(function (o) {
    if (ubChecking_[o.id]) return;
    if (Date.now() - (o.at || 0) > 30 * 60 * 1000) { ubDone_(o, false, ''); return; }
    ubChecking_[o.id] = 1;
    ubJsonp_({ action: 'status', key: UB_KEY_, id: o.id }, function (s) {
      delete ubChecking_[o.id];
      if (!s || !s.ok || s.status === 'pending' || s.status === 'running' || s.status === 'queued' || s.status === '') return;
      if (s.status === 'done') ubDone_(o, true, s.result); else ubDone_(o, false, s.result);
    });
  });
}
function ubWatch_() { if (ubWatchTimer_) return; ubWatchTimer_ = setInterval(ubWatchTick_, 2500); ubWatchTick_(); }



try { if (typeof localStorage !== 'undefined' && typeof document !== 'undefined' && ubPendList_().length) setTimeout(ubWatch_, 1500); } catch (e) {}























function renderPcStatus_(base, staff, dev) {
  try {
    return renderPcStatusPage_(
      JSON.parse(getPcStatusFile_().getBlob().getDataAsString('UTF-8')), base, staff, dev);
  } catch (err) {
    return renderPcStatusPage_({ error: (err && err.message) ? err.message : String(err) }, base, staff, dev);
  }
}

















function mitaSum_(cnt) {
  return '<div class="mtSum">' + MITA_ORDER_.filter(function (k) { return (cnt || {})[k]; }).map(function (k) {
    var c = MITA_CAT_[k];
    return '<div class="mtS" style="border-left-color:' + c.c + '"><b>' + cnt[k] + '<span>人</span></b><span>' + c.ic + ' ' + esc_(c.t) + '</span></div>';
  }).join('') + '</div>';
}









function renderAkijikan_(base, staff, dev) {
  try {
    var d = JSON.parse(getAkijikanFile_().getBlob().getDataAsString('UTF-8'));
    return renderAkijikanPage_(d, base, staff, dev);
  } catch (err) {
    return renderAkijikanError_(err, base, staff, dev);
  }
}






var AKI_WAKU_KINDS_ = ['新規男性', '既存男性', '新規女性', '既存女性'];
function akiWakuColor_(kind) {
  if (kind === '新規男性') return '#2563eb';
  if (kind === '既存男性') return '#1e3a8a';
  if (kind === '新規女性') return '#db2777';
  return '#831843';
}



























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
var FIT1LINE_SCRIPT_ =
'<script>(function(){' +
'window.szFit1Line_=function(root){' +
'  var els=(root||document).querySelectorAll(".fit1line");' +
'  for(var i=0;i<els.length;i++){' +
'    var el=els[i];' +
'    if(!el.clientWidth) continue;' +            
'    if(!el.dataset.baseFont){ el.dataset.baseFont=getComputedStyle(el).fontSize; }' +
'    el.style.fontSize=el.dataset.baseFont;' +   
'    var tries=0;' +
'    while(el.scrollWidth>el.clientWidth && tries<40){' +
'      var cur=parseFloat(getComputedStyle(el).fontSize);' +
'      el.style.fontSize=(cur-1)+"px"; tries++;' +
'    }' +
'  }' +
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
var MOVESCRIPT_ =
'<script>(function(){' +
'var wrap=document.querySelector(".wrap"); if(!wrap) return;' +
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
'function ccH_(s){ return String(s==null?"":s).replace(/[&<>"\']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\'":"&#39;"}[c]; }); }' +
'function ccRoomBadge_(name,color){ return "<span class=\\"ccroom\\" style=\\"--rc:"+ccH_(color)+"\\">"+ccH_(name)+"</span>"; }' +
'wrap.addEventListener("click",function(ev){' +
'  var t=ev.target;' +
'  if(t.classList&&t.classList.contains("mvtoggle")){' +
'    var mvw=t; while(mvw&&!(mvw.classList&&mvw.classList.contains("mv"))) mvw=mvw.parentNode; if(!mvw) return;' +
'    var side=t.getAttribute("data-side");' +
'    var pn=mvw.querySelector(\'.mvpanel[data-side="\'+side+\'"]\'); if(!pn) return;' +
'    var willOpen=pn.hidden;' +
'    Array.prototype.forEach.call(mvw.querySelectorAll(".mvpanel"),function(p){ p.hidden=true; });' +
'    Array.prototype.forEach.call(mvw.querySelectorAll(".mvtoggle"),function(b){ b.classList.remove("open"); });' +
'    if(willOpen){ pn.hidden=false; t.classList.add("open"); }' +
'    if(!pn.hidden&&window.szFit1Line_) window.szFit1Line_(pn);' +   
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
'      ccRoomBadge_(toShort,toColor)+"へ<br>移動します。<br>よろしいでしょうか？😊", true, function(){' +
'      mvOverlay_(who,mtime,fromRoom,room);' +
'      submitMove_(cal,evid,toCal,toLabel,room,title,fromRoom,function(r){' +
'        if(r && r.ok){ waitDoneThenFinish_(r.id,evid,room); }' +
'        else { mvOverlayHide_(); ccPopup_("⚠️ 移動できませんでした："+((r&&r.error)||"依頼に失敗")+"。もう一度試してもらえると嬉しいです🙇", false); }' +
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
'    if(!cal||!evid){ ccPopup_("この予約のIDが取得できず担当を変更できません", false); return; }' +
'    ccPopup_(ccH_(swho)+"の予約の担当を<br>"+ccRoomBadge_(of+onm, staffColor_(of))+"から<br>"+ccRoomBadge_(nf+nm, staffColor_(nf))+"へ<br>変更します。<br>よろしいでしょうか？😊", true, function(){' +
'      mvStaffOverlay_(swho,stime,of,onm,nf,nm);' +
'      submitMoveStaff_(cal,evid,nf,function(r){' +
'        if(r && r.ok){ waitStaffDoneFinish_(r.id,evid,nf,nm); }' +
'        else { mvOverlayHide_(); ccPopup_("⚠️ 担当を変更できませんでした：もう一度試してもらえると嬉しいです🙇 二度続けてこのエラーがでた場合は、Ryuさんに連絡してください🙇", false); }' +
'      });' +
'    }, true);' +
'  }' +
'});' +
'function mvDesc_(who,mtime,fromRoom,room){ var t=(mtime||"").split("-")[0];' +
'  return (who?who+" ":"")+(t?t+"の予約を、":"")+"「"+fromRoom+"」から「"+room+"」へ移動中です"; }' +
'function movingHtml_(who,mtime,fromRoom,room){ return "⏳ "+mvDesc_(who,mtime,fromRoom,room)+' +
'  "<div style=\\"font-size:.82rem;font-weight:normal;margin-top:6px;line-height:1.5;\\">タイムツリーへの書き込みが完了したら自動で画面が切り替わりますので、少し待っててくださいね🥺</div>"; }' +
'function mvOverlay_(who,mtime,fromRoom,room){ var ov=document.getElementById("mvWaitOverlay");' +
'  if(!ov){ ov=document.createElement("div"); ov.id="mvWaitOverlay";' +
'    ov.style.cssText="position:fixed;inset:0;z-index:9999;background:#2C7A99;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center;";' +
'    document.body.appendChild(ov); }' +
'  var t=(mtime||"").split("-")[0];' +
'  ov.innerHTML="<div style=\\"font-size:66px;margin-bottom:20px;\\">⏳</div>"+' +
'    "<div style=\\"color:#eaf3f7;font-size:22px;line-height:1.6;margin-bottom:14px;\\">"+(who?who:"")+(t?"　"+t+"の予約":"")+"</div>"+' +
'    "<div style=\\"color:#fff;font-size:33px;font-weight:800;line-height:1.5;margin-bottom:22px;\\">「"+fromRoom+"」から「"+room+"」へ<br>移動中です</div>"+' +
'    "<div style=\\"color:#eaf3f7;font-size:20px;line-height:1.8;max-width:420px;\\">タイムツリーへの書き込みが完了したら自動で画面が切り替わりますので、少し待っててくださいね🥺</div>";' +
'  return ov; }' +
'function mvOverlayHide_(){ var ov=document.getElementById("mvWaitOverlay"); if(ov&&ov.parentNode) ov.parentNode.removeChild(ov); }' +
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
'      else if(s==="error"||s==="failed"){ mvOverlayHide_(); ccPopup_("⚠️ 移動できませんでした："+((r.result)||s)+"。もう一度試してもらえると嬉しいです🙇", false); }' +
'      else if(tries>=90){ mvOverlayHide_(); ccPopup_("⚠️ 移動できませんでした（時間切れ）：もう一度試してもらえると嬉しいです🙇", false); }' +
'      else { setTimeout(chk,250); } });' +
'  }' +
'  setTimeout(chk,250); }' +
'function mvStaffOverlay_(who,mtime,of,onm,nf,nm){ var ov=document.getElementById("mvWaitOverlay");' +
'  if(!ov){ ov=document.createElement("div"); ov.id="mvWaitOverlay";' +
'    ov.style.cssText="position:fixed;inset:0;z-index:9999;background:#2C7A99;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center;";' +
'    document.body.appendChild(ov); }' +
'  var t=(mtime||"").split("-")[0];' +
'  ov.innerHTML="<div style=\\"font-size:66px;margin-bottom:20px;\\">⏳</div>"+' +
'    "<div style=\\"color:#eaf3f7;font-size:22px;line-height:1.6;margin-bottom:14px;\\">"+(who?who:"")+(t?"　"+t+"の予約":"")+"</div>"+' +
'    "<div style=\\"color:#fff;font-size:33px;font-weight:800;line-height:1.5;margin-bottom:22px;\\">担当を「"+of+onm+"」から「"+nf+nm+"」へ<br>変更中です</div>"+' +
'    "<div style=\\"color:#eaf3f7;font-size:20px;line-height:1.8;max-width:420px;\\">タイムツリーへの書き込みが完了したら自動で画面が切り替わりますので、少し待っててくださいね🥺</div>";' +
'  return ov; }' +
'function showStaffDoneOverlay_(nf,nm){ var ov=document.getElementById("mvWaitOverlay");' +
'  if(!ov){ ov=document.createElement("div"); ov.id="mvWaitOverlay"; document.body.appendChild(ov); }' +
'  ov.style.cssText="position:fixed;inset:0;z-index:9999;background:#16a34a;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center;";' +
'  ov.innerHTML="<div style=\\"font-size:92px;margin-bottom:16px;\\">✓</div>"+' +
'    "<div style=\\"color:#fff;font-size:35px;font-weight:800;line-height:1.5;margin-bottom:26px;\\">担当を「"+nf+nm+"」へ<br>変更が完了しました</div>"+' +
'    "<button type=\\"button\\" id=\\"mvBackBtn\\" style=\\"font:inherit;font-size:1.3rem;font-weight:800;color:#16a34a;background:#fff;border:0;border-radius:12px;padding:14px 26px;cursor:pointer;\\">被り検出画面に戻る</button>";' +
'  document.getElementById("mvBackBtn").addEventListener("click",function(){ try{ window.__keepMvOverlay=false; }catch(e3){} mvOverlayHide_(); });' +
'  return ov; }' +
'function waitStaffDoneFinish_(id,evid,nf,nm){ var tries=0;' +
'  function chk(){ tries++;' +
'    statusCheck_(id,function(r){ var s=(r&&r.status)||"";' +
'      if(s==="done"){ try{ window.__movedOut=window.__movedOut||{}; window.__movedOut[evid]=1; }catch(e){} showStaffDoneOverlay_(nf,nm);' +
'        try{ window.__keepMvOverlay=true; }catch(e2){} doneRefreshFast_(); }' +
'      else if(s==="error"||s==="failed"){ mvOverlayHide_(); ccPopup_("⚠️ 担当を変更できませんでした：もう一度試してもらえると嬉しいです🙇 二度続けてこのエラーがでた場合は、Ryuさんに連絡してください🙇", false); }' +
'      else if(tries>=90){ mvOverlayHide_(); ccPopup_("⚠️ 処理が時間切れで失敗しました。Ryuさんに連絡してください🙇", false); }' +
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
'function confirmMove_(id,evid,side,who,room){ var tries=0;' +
'  function chk(){ tries++;' +
'    statusCheck_(id,function(r){ var s=(r&&r.status)||"";' +
'      if(s==="done"){ mvToastDone_("✓ "+(who?who+"を":"")+"「"+room+"」へ移動しました"); }' +
'      else if(s==="error"||s==="failed"){ rollbackMove_(evid,(r.result)||s,side,who,room); }' +
'      else if(tries>=60){ rollbackMove_(evid,"時間切れ（もう一度試してもらえると嬉しいです🙇）",side,who,room); }' +
'      else { setTimeout(chk,400); } });' +
'  }' +
'  setTimeout(chk,400); }' +
'function rollbackMove_(evid,reason,side,who,room){ try{ if(window.__movedOut) delete window.__movedOut[evid]; }catch(e){}' +
'  mvToastHide_(); doneRefreshFast_();' +
'  ccPopup_("⚠️ 移動できませんでした："+reason+"。画面に被りを戻しました。もう一度試してもらえると嬉しいです🙇", false); }' +
'function doneRefresh_(){ try{ window.scrollTo(0,0); }catch(e){}' +
'  try{ if(window.__refreshConflictView){ window.__refreshConflictView(); return; } }catch(e2){}' +
'  location.reload(); }' +
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
'      else if(tries>=60){ mvOverlayHide_(); st.className="mvstatus err"; st.textContent="⚠️ 時間切れ。もう一度試してもらえると嬉しいです🙇"; }' +
'      else { setTimeout(chk,400); }' +
'    });' +
'  }' +
'  setTimeout(chk,400);' +
'}' +
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
'  .ubar { display:flex; align-items:center; gap:12px; margin:6px 0 10px; }' +
'  .uhome { flex:0 0 auto; font-size:1rem; font-weight:800; color:#0f172a; text-decoration:none;' +
'    background:#fff; border:1px solid #e2e8f0; border-radius:999px; padding:11px 20px;' +
'    box-shadow:0 4px 12px rgba(0,0,0,.10); }' +
'  .uhome:active { transform:translateY(1px); }' +
'  .rolemenu { display:flex; flex-direction:column; gap:14px; }' +
'  .rolebtn { display:flex; flex-direction:row; align-items:center; gap:14px; text-align:left;' +
'    color:var(--ink); cursor:pointer; background:var(--card); border:1px solid var(--line);' +
'    border-radius:18px; padding:22px 18px; box-shadow:0 6px 18px rgba(0,0,0,.09); position:relative;' +
'    overflow:hidden; width:100%; transition:transform .12s ease, box-shadow .12s ease; }' +
'  .rolebtn::before { content:""; position:absolute; left:0; top:0; bottom:0; width:8px; }' +
'  .rolebtn.keiei::before { background:#dc2626; }' +
'  .rolebtn.kanri::before { background:#f59e0b; }' +
'  .rolebtn.jitsumu::before { background:#16a34a; }' +
'  .rolebtn.kaihatsu::before { background:#6366f1; }' +
'  .rolebtn.sejutsugo::before { background:#0ea5e9; }' +
'  .rolebtn:active { transform:translateY(2px); }' +
'  @media (hover:hover){ .rolebtn:hover { transform:translateY(-2px); box-shadow:0 12px 28px rgba(0,0,0,.14); } }' +
'  .ricon { flex:none; width:52px; height:52px; border-radius:13px; font-size:30px; display:grid; place-items:center; }' +
'  .rolebtn.keiei .ricon { background:rgba(220,38,38,.14); }' +
'  .rolebtn.kanri .ricon { background:rgba(245,158,11,.16); }' +
'  .rolebtn.jitsumu .ricon { background:rgba(22,163,74,.15); }' +
'  .rolebtn.kaihatsu .ricon { background:rgba(99,102,241,.15); }' +
'  .rolebtn.sejutsugo .ricon { background:rgba(14,165,233,.16); }' +
'  .rname { flex:1; min-width:0; font-size:1.6rem; font-weight:900; }' +
'  .rcount { flex:none; color:var(--sub); font-size:.95rem; font-weight:700; }' +
'  .backbar { margin:0 0 16px; }' +
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
'  .tile.claudechat::before { background:#d97757; }' +
'  .tile.threads::before { background:#101010; }' +
'  .tile.insta::before { background:#d62976; }' +
'  .tile.facebook::before { background:#0866ff; }' +
'  .tile.mita::before { background:#0f766e; }' +
'  .tile.yoyaku::before { background:#16a34a; }' +
'  .tile.sejutsugo::before { background:#0ea5e9; }' +
'  .tile.kizon::before { background:#7c3aed; }' +
'  .tile.sgline::before { background:#06c755; }' +
'  .tile.timetree::before { background:#2bad6f; }' +
'  .tile.shophist::before { background:#22707f; }' +
'  .tile.procamp::before { background:#9333ea; }' +
'  .tile.procstock::before { background:#7a5c2e; }' +
'  .tile.uriagebook::before { background:#0f766e; }' +
'  .tile.shomeisho::before { background:#b5757e; }' +   
'  .tile.hanbai::before { background:#0e7490; }' +
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
'  .tile.kizon .ticon { background:rgba(124,58,237,.16); }' +
'  .tile.sgline .ticon { background:rgba(6,199,85,.16); }' +
'  .tile.timetree .ticon { background:rgba(43,173,111,.16); }' +
'  .tile.shophist .ticon { background:rgba(34,112,127,.16); }' +
'  .tile.procamp .ticon { background:rgba(147,51,234,.14); }' +
'  .tile.procstock .ticon { background:rgba(122,92,46,.16); }' +
'  .tile.uriagebook .ticon { background:rgba(15,118,110,.16); }' +
'  .tile.shomeisho .ticon { background:rgba(181,117,126,.18); }' +
'  .tile.hanbai .ticon { background:rgba(14,116,144,.16); }' +
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
'    background:#2C7A99; padding:4px 0 0; margin-bottom:0; }' +   
'  .reload { font-size:1rem; font-weight:700; color:#fff; background:#2563eb; border:0;' +
'    border-radius:10px; padding:12px 18px; cursor:pointer; }' +
'  .reload:active { transform:translateY(1px); }' +
'  .fresh { font-size:.78rem; color:var(--sub); }' +
'  .fetched { flex:1 1 auto; min-width:0; display:flex; flex-direction:column; gap:2px;' +
'    font-size:.74rem; color:rgba(255,255,255,.82); }' +
'  .fetched b { font-weight:700; color:#fff; margin-right:4px; }' +
'  .homelink { flex:0 0 auto; font-size:.9rem; font-weight:700; color:#0f172a; text-decoration:none;' +
'    background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:10px 14px; }' +
'  .homelink:active { transform:translateY(1px); }' +
'  h1 { font-size:2.1rem; line-height:1.1; margin:0 0 8px; color:#fff; }' +   
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
'    margin-bottom:40px; box-shadow:0 1px 3px rgba(0,0,0,.06); }' +   
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
'  .lroom { flex:none; margin-right:8px; background:var(--rc,#64748b); color:#fff; font-weight:800;' +
'    font-size:1rem; padding:13px 14px; border-radius:999px; white-space:nowrap;' +
'    display:inline-flex; align-items:center; line-height:1; }' +
'  .card-h { display:flex; align-items:flex-start; gap:8px; flex-wrap:wrap; margin-bottom:6px; }' +
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
'  .ab { flex:none; display:grid; place-items:center; font-size:3.2rem; line-height:1; margin-right:6px; }' +
'  .who { margin:4px 0 2px; font-size:1rem; }' +
'  .who .code { color:var(--sub); font-weight:600; margin:0 4px; }' +
'  .who .name { font-weight:500; }' +
'  .menuwrap { display:flex; align-items:stretch; gap:8px; margin:6px 0 4px; }' +
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
'  .rstoggle { display:block; width:100%; text-align:center; font-size:1.25rem; font-weight:700;' +
'    color:#fff; background:#2563eb; border:1px solid #2563eb; margin-top:16px;' +   
'    border-radius:10px; padding:11px 6px; cursor:pointer; }' +
'  .rstoggle:active { transform:translateY(1px); }' +
'  .rstoggle.open { box-shadow:inset 0 2px 5px rgba(0,0,0,.3); }' +
'  .mvrow { display:flex; flex-direction:column; gap:6px; padding:6px 0; }' +
'  .mvrow + .mvrow { border-top:1px dashed var(--line); }' +
'  .mvlabel { font-size:1.7rem; font-weight:800; color:#ec4899; }' +
'  .mvhint { font-size:1.7rem; color:var(--ink); font-weight:700; margin-top:2px; line-height:1.4; }' +
'  .mvbtns { display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-top:8px; }' +
'  .mvbtn { font-size:.92rem; font-weight:800; color:#fff; background:var(--rc,#64748b);' +
'    border:0; border-radius:999px; padding:24px 14px; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.18); }' +
'  .mvbtn:active { transform:translateY(1px); }' +
'  .mvbtn:disabled { opacity:.4; }' +
'  .smvbtn { font-size:1.6rem; font-weight:800; color:#fff; background:var(--sc,#7c3aed);' +    
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
'  .rstat .room { flex:0 0 auto; width:92px; text-align:center; padding:4px 6px; box-sizing:border-box;' +
'    font-size:.95rem; display:inline-block; }' +
'  .rchips { flex:1 1 auto; min-width:0; display:flex; flex-direction:column; align-items:flex-start; gap:5px; }' +    
'  .rchips .slot { display:inline-block; background:var(--card); border:1px solid var(--line);' +
'    border-radius:7px; padding:3px 9px; font-size:1.39rem; font-weight:800; font-variant-numeric:tabular-nums;' +
'    white-space:nowrap; }' +
'  .rchips .slot.free { background:#0a1740; color:#fff; border-color:#1e2f66; }' +    
'  .rchips .none { color:var(--real); font-size:1.39rem; font-weight:800; }' +
'  .ccmask { position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex;' +
'    align-items:center; justify-content:center; z-index:200; padding:20px; }' +
'  .ccbox { background:var(--card); border-radius:16px; padding:20px; max-width:720px; width:100%;' +
'    max-height:88vh; overflow:auto; box-shadow:0 12px 40px rgba(0,0,0,.35); }' +
'  .ccmsg { font-size:2rem; line-height:1.9; color:var(--ink); margin-bottom:18px; white-space:pre-wrap;' +
'    overflow-wrap:anywhere; }' +
'  .ccmsg .ccroom { display:inline-block; background:var(--rc); color:#fff; font-weight:800;' +
'    padding:2px 18px; border-radius:999px; }' +
'  .ccbtns { display:flex; gap:10px; }' +
'  .ccno, .ccyes { flex:1; font:inherit; padding:12px; border-radius:10px; border:0; font-weight:700;' +
'    font-size:1.4rem; cursor:pointer; }' +
'  .ccno { background:var(--bg); color:var(--ink); border:1px solid var(--line); }' +
'  .ccyes { background:#2563eb; color:#fff; }' +
'  .ccno:active, .ccyes:active { transform:translateY(1px); }' +
'';
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











