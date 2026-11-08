// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：shophist
var SHOPHCSS_ = ''
+ '.shCards{flex-wrap:nowrap;gap:6px}'
+ '.shCards .pcCard{flex:1 1 0;min-width:0;padding:8px 4px}'
+ '.shCards .pcName{font-size:.85rem;margin-bottom:2px}'
+ '.shCards .pcNum{font-size:1.6rem}'
+ '.shCards .pcSub{font-size:.68rem;line-height:1.35}'
+ '.shSec{background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin:0 0 14px}'
+ '.shSecT{font-weight:800;font-size:1.05rem;margin:0 0 8px}'
+ '.shSecT small{font-weight:400;font-size:.8rem;opacity:.7;margin-left:6px}'
+ '.shBar{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:.92rem}'
+ '.shBarL{width:8.6em;flex:0 0 8.6em;font-size:.88rem;line-height:1.3}'
+ '.shBarT{flex:1;height:14px;background:rgba(127,127,127,.18);border-radius:7px;overflow:hidden}'
+ '.shBarF{display:block;height:100%;background:#2C7A99;border-radius:7px}'
+ '.shBarF.g{background:#16a34a}'
+ '.shBarN{flex:0 0 5.4em;text-align:right;font-weight:700;white-space:nowrap}'
+ '.shBarN small{opacity:.7;font-weight:400}'
+ '.shBar.shHead{font-size:.75rem;opacity:.7;margin-bottom:2px}'
+ '.shBarT0{flex:1;text-align:right;padding-right:4px}'
+ '.shBarC{flex:0 0 2.2em;text-align:right;font-weight:700}'
+ '.shNote{font-size:.75rem;opacity:.7;margin-top:8px;line-height:1.5}'
+ '.shIt{padding:8px 0;border-top:1px dashed var(--line)}'
+ '.shIt:first-of-type{border-top:0}'
+ '.shItN{font-weight:700}'
+ '.shItS{font-size:.85rem;opacity:.85;margin-top:2px;line-height:1.6}'
+ '.shP{background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin:0 0 12px}'
+ '.shP.buy{border-left:6px solid #16a34a}'
+ '.shHd{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-bottom:4px}'
+ '.shNm{font-weight:800;font-size:1.05rem;margin-right:4px}'
+ '.shNm.anon{opacity:.75}'
+ '.shChip{font-size:.76rem;padding:2px 8px;border-radius:999px;border:1px solid var(--line);white-space:nowrap}'
+ '.shChip.buy{background:#16a34a;color:#fff;border-color:#16a34a;font-weight:700}'
+ '.shWhen{font-size:.82rem;opacity:.7;margin:2px 0 6px}'
+ '.shRow{display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-top:1px dashed var(--line)}'
+ '.shRow.step{padding-left:1.7em}'
+ '.shIc{flex:0 0 1.4em;text-align:center}'
+ '.shT{flex:1;min-width:0;line-height:1.45}'
+ '.shN{display:block;font-size:.8rem;opacity:.75}'
+ '.shD{flex:0 0 auto;font-weight:700;white-space:nowrap}'
+ '.shRow.buyrow .shT{color:#16a34a;font-weight:800}'
+ '.shOld{margin-top:8px}'
+ '.shOld summary{cursor:pointer;font-size:.88rem;opacity:.85;padding:4px 0}'
+ '.shOldV{margin-top:6px;padding-top:4px;border-top:1px solid var(--line)}'
+ '.shNone{opacity:.6;font-size:.9rem;padding:6px 0}'
+ '.shTabs{display:flex;gap:6px;margin:0 0 14px}'
+ '.shTab{flex:1 1 0;min-width:0;padding:10px 4px;border-radius:999px;border:2px solid rgba(255,255,255,.7);'
+   'background:transparent;color:#fff;font-weight:800;font-size:.95rem;cursor:pointer;white-space:nowrap}'
+ '.shTab.on{background:#fff;color:#2C7A99;border-color:#fff}'
+ '.shTabN{display:block;font-size:.72rem;font-weight:600;opacity:.85;margin-top:1px}';
function shTab_(b) {
  var t = b.getAttribute('data-t');
  [].slice.call(document.querySelectorAll('.shTab')).forEach(function (x) { x.classList.toggle('on', x === b); });
  [].slice.call(document.querySelectorAll('.shPane')).forEach(function (x) { x.style.display = x.getAttribute('data-t') === t ? '' : 'none'; });
}
function shIcon_(k) {
  return { perm: '🔓', lang: '🌐', film: '🎬', list: '📋', item: '🧴', step: '↳', cart: '🛒', click: '👆', buy: '✅' }[k] || '・';
}
function shDur_(sec) {
  sec = Math.round(sec || 0);
  return sec >= 60 ? (Math.floor(sec / 60) + '分' + (sec % 60) + '秒') : (sec + '秒');
}
function shBars_(rows, unit, lastGreen) {
  var max = 0;
  rows.forEach(function (r) { if (r.n > max) max = r.n; });
  return rows.map(function (r, i) {
    var w = max ? Math.round(r.n * 100 / max) : 0;
    return '<div class="shBar"><span class="shBarL">' + esc_(r.t) + '</span>' +
      '<span class="shBarT"><span class="shBarF' + (lastGreen && i === rows.length - 1 ? ' g' : '') +
      '" style="width:' + w + '%"></span></span>' +
      '<span class="shBarN">' + r.n + unit + (r.pct != null ? '<small> ' + r.pct + '%</small>' : '') + '</span></div>';
  }).join('');
}
function shVisit_(v) {
  var rows = ((v && v.steps) || []).map(function (s) {
    var t = s.t;
    if (s.kind === 'step' && t.indexOf('：') >= 0) t = t.slice(t.indexOf('：') + 1);   
    return '<div class="shRow ' + esc_(s.kind) + (s.kind === 'buy' ? ' buyrow' : '') + '">' +
      '<span class="shIc">' + shIcon_(s.kind) + '</span>' +
      '<span class="shT">' + esc_(t) + (s.note ? '<span class="shN">' + esc_(s.note) + '</span>' : '') + '</span>' +
      '<span class="shD">' + esc_(s.dur || '') + '</span></div>';
  }).join('');
  return rows || '<div class="shNone">開いただけ</div>';
}
function renderShopHistPage_(d, base, staff, dev) {
  d = d || {};
  var head = '<style>' + HOMECSS_ + PROCELLCSS_ + SHOPHCSS_ + '</style>' +
    '<div class="home">' + backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">🛍️</span><span class="bname">T＆Tショップ履歴</span></div>';
  if (d.error || !d.summary) {
    return head + '<div class="soon"><div class="soonic">📄</div>' +
      '<div class="soontitle" style="font-size:1.4rem">まだ記録がありません</div>' +
      '<div class="soondesc">' + esc_(d.error || 'ショップが開かれると、ここに出てきます。') + '</div></div></div>';
  }
  function shPart(dd) {
  var sm = dd.summary || {}, st = dd.stats || {};
  var cards = [['today', '今日'], ['d7', '7日'], ['d30', '30日'], ['all', 'これまで']].map(function (k) {
    var v = sm[k[0]] || {};
    return '<div class="pcCard"><div class="pcName">' + k[1] + '</div>' +
      '<div class="pcNum">' + (v.people || 0) + '<span class="pcUnit">人</span></div>' +
      '<div class="pcSub">来店' + (v.visits || 0) + '回<br>注文' + (v.orders || 0) + '件</div></div>';
  }).join('');
  var cl = st.close || [], cmax = 0;
  cl.forEach(function (r) { if (r.n > cmax) cmax = r.n; });
  var secFunnel = cmax ? '<div class="shSec"><div class="shSecT">どこで画面を閉じたか<small>30日・来店の回数</small></div>' +
    '<div class="shBar shHead"><span class="shBarL"></span><span class="shBarT0">来た</span><span class="shBarN">ここで閉じた</span></div>' +
    cl.map(function (r) {
      var w = Math.round(r.n * 100 / cmax), buy = r.k === 10;
      return '<div class="shBar"><span class="shBarL">' + esc_(r.t) + '</span>' +
        '<span class="shBarT"><span class="shBarF' + (buy ? ' g' : '') + '" style="width:' + w + '%"></span></span>' +
        '<span class="shBarC">' + r.n + '</span>' +
        '<span class="shBarN">' + (buy ? '<b style="color:#16a34a">注文 ' + r.n + '</b>' :
          (r.closed ? '<b style="color:#dc2626">' + r.closed + '</b>' : '<span style="opacity:.4">0</span>')) + '</span></div>';
    }).join('') +
    '<div class="shNote">※「メッセージ許可」の画面はLINEが出す画面なので、そこで閉じた人は数えられません（押した人だけ）。' +
    '許可と言語選択は、LINEのリッチメニューから初めて開いた人だけが通ります。</div></div>' : '';
  var fl = st.film || {};
  var secFilm = fl.n ? '<div class="shSec"><div class="shSecT">トップの映像はどこまで見られたか' +
    '<small>30日・' + fl.n + '回・平均' + esc_(fl.avg || '') + '</small></div>' +
    shBars_(fl.reach || [], '回', false) + '</div>' : '';
  var its = (st.items || []).map(function (it) {
    var s = ['見た ' + it.people + '人'];
    if (it.avg) s.push('平均 ' + it.avg);
    s.push('購入へ ' + it.go + '人');
    if (it.secret) s.push('📖秘密 ' + it.secret + '人');
    if (it.use) s.push('💧使い方 ' + it.use + '人');
    return '<div class="shIt"><div class="shItN">' + esc_(it.name) + '</div><div class="shItS">' + esc_(s.join('　')) + '</div></div>';
  }).join('');
  var secItems = its ? '<div class="shSec"><div class="shSecT">商品ごと<small>30日</small></div>' + its + '</div>' : '';
  var rtRows = [['today', '今日'], ['d7', '7日'], ['d30', '30日'], ['all', 'これまで']].map(function (k) {
    var rs = (sm[k[0]] || {}).routes || [];
    if (!rs.length) return '';
    return '<div class="shIt"><div class="shItN">' + k[1] + '</div><div class="shItS">' +
      esc_(rs.map(function (r) { return r.name + ' ' + r.n; }).join('　')) + '</div></div>';
  }).join('');
  var secRoute = rtRows ? '<div class="shSec"><div class="shSecT">どこから入ったか<small>来店1回＝1つ</small></div>' +
    rtRows + '<div class="shNote">※「入口の前で閉じた」「LINE（ふつうのリンク）」は、' +
    'LINEの本人確認が終わる前に閉じた方＝どちらのボタンか分からなかった回です。</div></div>' : '';
  var ppl = (dd.people || []).map(function (p) {
    var vis = p.vis || [];
    var v0 = vis[0] || {};
    var chips = [];
    if (p.orders) chips.push('<span class="shChip buy">注文 ' + p.orders + '件</span>');
    chips.push('<span class="shChip">来店 ' + (p.visits || 0) + '回</span>');
    if (v0.route) chips.push('<span class="shChip">' + esc_(v0.route) + '</span>');
    if (v0.lang) chips.push('<span class="shChip">' + esc_(v0.lang) + '</span>');
    var old = vis.slice(1).map(function (v) {
      return '<div class="shOldV"><div class="shWhen">' + esc_(v.at) + '・' + esc_(v.route || '') +
        (v.sec ? '・合計 ' + esc_(shDur_(v.sec)) : '') + '</div>' + shVisit_(v) + '</div>';
    }).join('');
    return '<div class="shP' + (p.orders ? ' buy' : '') + '">' +
      '<div class="shHd"><span class="shNm' + (p.known ? '' : ' anon') + '">' + esc_(p.name) + '</span>' + chips.join('') + '</div>' +
      '<div class="shWhen">' + esc_(v0.at || p.last || '') + (v0.sec ? '・合計 ' + esc_(shDur_(v0.sec)) : '') + '</div>' +
      shVisit_(v0) +
      (old ? '<details class="shOld"><summary>前の来店（' + (vis.length - 1) + '回）を見る</summary>' + old + '</details>' : '') +
    '</div>';
  }).join('');
  return '<div class="pcCards shCards">' + cards + '</div>' +
    secRoute + secFunnel + secFilm + secItems +
    '<div class="pcTitle">お客様ごと（新しい順）</div>' +
    (ppl || '<div class="shNone">まだありません</div>');
  }
  var tabs = d.tabs || {};
  var TABS = [['all', '全体', d], ['ja', '日本人', tabs.ja || {}], ['zh', '台湾人', tabs.zh || {}]];
  return head +
    '<div class="pcLead">ネットショップを開いた人の記録です。お名前が出るのは注文した方だけです（注文の文と突き合わせて分かります）。' +
    '日本人か台湾人かは、その方が最初に選んだ言葉（日本語／中文）で分けています。</div>' +
    '<div class="shTabs">' + TABS.map(function (x, i) {
      var n = ((x[2].summary || {}).all || {}).people || 0;
      return '<button type="button" class="shTab' + (i ? '' : ' on') + '" data-t="' + x[0] + '" onclick="shTab_(this)">' +
        x[1] + '<span class="shTabN">' + n + '人</span></button>';
    }).join('') + '</div>' +
    TABS.map(function (x, i) {
      return '<div class="shPane" data-t="' + x[0] + '"' + (i ? ' style="display:none"' : '') + '>' + shPart(x[2]) + '</div>';
    }).join('') +
    '<div class="pcFoot">まとめた時刻：' + esc_(d.generated_at || '') + '（新しい記録が届くと1分以内に再集計します）。' +
    '秒数・映像の場面・押した物は 2026-09-19 22時22分より後の来店から記録しています。半年より古い記録は自動で消えます。</div>' +
  '</div>';
}
