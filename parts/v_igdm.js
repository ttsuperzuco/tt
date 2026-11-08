// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：igdm
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
  if (!btns) btns = '<div class="idmempty">まだ読み込んでいません。少し待ってから、もう一度開いてください🙇</div>';
  return '<style>' + INSTADM_CSS_ + IGDM_CSS_ + '</style>' +
    backBar_(base, staff, dev) +
    '<div class="idmwrap"><h1>📱 DM再現<span class="idmgen">インスタのDMをそのまま表示（読むだけ）</span>' +
      '<span class="idmchg" onclick="if(window.idmClear)window.idmClear()">パスワードを変更</span></h1>' +
      '<div class="igdmchoose">' + btns + '</div>' +
      '<div id="igdmStage"></div>' +
    '</div>';
}
function igdmBuildItems_(a) {
  var items = [], reqs = a.requests || [];
  for (var r = 0; r < reqs.length; r++) {
    var q = reqs[r];
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
      '<button type="button" class="igdmback" onclick="igdmBackAccts()">‹ アカウント変更</button>' +
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
  if (t.req) body += '<div class="idmempty">初めての人からのメッセージです。ここには最初の一言だけ出ます（全文は本物のインスタで確認してください😊）。</div>';
  if (!ms.length) body += '<div class="idmempty">内容がありません。</div>';
  for (var k = 0; k < ms.length; k++) {
    var m = ms[k];
    body += '<div class="idmmsg ' + (m.me ? 'me' : 'them') + '"><div class="idmbub">' + esc_(m.text) +
      '</div><div class="idmmt">' + esc_(m.ts) + '</div></div>';
  }
  body += '</div>';
  if (!t.req && t.id) {
    body += '<div class="igdmreply">' +
      '<textarea id="igdmReplyTxt" class="igdmrtxt" placeholder="返信を入力（送るとお客さんに届きます）"></textarea>' +
      '<div class="igdmrrow"><button type="button" class="igdmrsend" onclick="igdmDoReply()">送る</button>' +
      '<span class="igdmrstatus" id="igdmRStatus"></span></div>' +
    '</div>';
  }
  if (t.req) {
    body += '<div class="igdmreply">' +
      '<textarea id="igdmReplyTxt" class="igdmrtxt" placeholder="返信を入力（承認してからお客さんに届きます）"></textarea>' +
      '<div class="igdmrrow"><button type="button" class="igdmrsend" onclick="igdmDoApproveReply()">承認して送る</button>' +
      '<span class="igdmrstatus" id="igdmRStatus"></span></div>' +
    '</div>';
    body += '<div class="igdmreply">' +
      '<button type="button" class="igdmdel" onclick="igdmDoDelete()">🚫 この初めての人を削除</button>' +
      '<div class="igdmrstatus" id="igdmDStatus" style="margin-top:8px;"></div>' +
    '</div>';
  }
  pane.innerHTML = body;
  var pn = document.getElementById('igdmPane'); if (pn) pn.classList.add('showthread');
  var lg = pane.querySelector('.igdmth-log'); if (lg) lg.scrollTop = lg.scrollHeight;
}
function igdmSendResult_(m) {
  var ms = '' + (m || '');
  if (ms.indexOf('送りました') >= 0) {
    var ta = document.getElementById('igdmReplyTxt'); if (ta) ta.value = '';
    szOvShow_(szDoneHtml_(ms.indexOf('承認') >= 0 ? '承認して送りました' : '送りました', '会話に戻る'), '#16a34a');
    var b = document.getElementById('szDoneBack');
    if (b) b.addEventListener('click', function () { szOvHide_(); });
  } else {
    szOvHide_();
    szPopup_(ms || 'エラーが発生しました。りゅうさんに伝えてください🙇');
  }
}
function igdmDoReply() {
  var t = (IGDM_STATE_.items || [])[IGDM_STATE_.sel]; if (!t || t.req || !t.id) return;
  var ta = document.getElementById('igdmReplyTxt'); var txt = ta ? ta.value.trim() : '';
  if (!txt) { szPopup_('本文が空です。'); return; }
  var acc = (igdmAccs_()[IGDM_STATE_.ai] || {}).key || '';
  szPopup_('このお客さんに送りますか？😊\n\n' + txt, { icon: '✉️', cancel: true, yesLabel: '送る', onYes: function () {
    szOvShow_(szBusyHtml_('送っています', 'インスタへの書き込みが終わったら自動で切り替わりますので、少し待っててくださいね🥺'), '#2C7A99');
    if (window.igdmReply) window.igdmReply(acc, t.id, txt, igdmSendResult_);
    else { szOvHide_(); szPopup_('この画面からは送れません。りゅうさんに伝えてください🙇'); }
  } });
}
function igdmDoApproveReply() {
  var t = (IGDM_STATE_.items || [])[IGDM_STATE_.sel]; if (!t || !t.req) return;
  var ta = document.getElementById('igdmReplyTxt'); var txt = ta ? ta.value.trim() : '';
  if (!txt) { szPopup_('本文が空です。'); return; }
  var acc = (igdmAccs_()[IGDM_STATE_.ai] || {}).key || '';
  var nm = t.title || '', occ = t.occ || 0;
  szPopup_('この初めての人「' + nm + '」を承認して、この返信を送りますか？😊\n\n' + txt,
    { icon: '✉️', cancel: true, yesLabel: '承認して送る', onYes: function () {
      szOvShow_(szBusyHtml_('承認して送っています', 'インスタへの書き込みが終わったら自動で切り替わりますので、少し待っててくださいね🥺'), '#2C7A99');
      if (window.igdmApproveReply) window.igdmApproveReply(acc, nm, occ, txt, igdmSendResult_);
      else { szOvHide_(); szPopup_('この画面からは送れません。りゅうさんに伝えてください🙇'); }
    } });
}
function igdmDoDelete() {
  var t = (IGDM_STATE_.items || [])[IGDM_STATE_.sel]; if (!t || !t.req) return;
  szPopup_('この初めての人「' + (t.title || '') + '」を削除しますか？😊\n削除すると元に戻せません。',
    { cancel: true, yesLabel: '削除する', onYes: function () { igdmDoDeleteGo_(t); } });
}
function igdmDoDeleteGo_(t) {
  var acc = (igdmAccs_()[IGDM_STATE_.ai] || {}).key || '';
  szOvShow_(szBusyHtml_('削除しています', 'インスタでの削除が終わったら自動で切り替わりますので、少し待っててくださいね🥺'), '#2C7A99');   
  if (window.igdmDelete) window.igdmDelete(acc, t.title, t.last_text, t.occ || 0, function (m) {
    var ms = '' + (m || '');
    if (ms.indexOf('エラー') >= 0 || ms.indexOf('失敗') >= 0 || ms.indexOf('できません') >= 0 || ms.indexOf('つながり') >= 0 || ms.indexOf('時間がかかって') >= 0) {
      szOvHide_(); szPopup_(ms || 'エラーが発生しました。りゅうさんに伝えてください🙇');
    } else {
      szOvShow_(szDoneHtml_('削除しました', '一覧に戻る'), '#16a34a');
      var b = document.getElementById('szDoneBack');
      if (b) b.addEventListener('click', function () { szOvHide_(); if (window.igdmBackList) igdmBackList(); });
    }
  });
}
function igdmBackList() { var pn = document.getElementById('igdmPane'); if (pn) pn.classList.remove('showthread'); }
function igdmBackAccts() { var st = document.getElementById('igdmStage'); if (st) st.innerHTML = ''; }
