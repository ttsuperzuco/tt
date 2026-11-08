// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：mita
var MITACSS_ = ''
+ '.mtTabs{display:flex;gap:6px;margin:0 0 12px}'
+ '.mtTab{flex:1 1 0;min-width:0;padding:10px 4px;border-radius:999px;border:2px solid rgba(255,255,255,.7);'
+   'background:transparent;color:#fff;font-weight:800;font-size:1rem;cursor:pointer}'
+ '.mtTab.on{background:#fff;color:#2C7A99;border-color:#fff}'
+ '.mtTabN{display:block;font-size:.72rem;font-weight:600;opacity:.85;margin-top:1px}'
+ '.mtSum{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}'
+ '.mtS{flex:1 1 30%;min-width:96px;background:var(--card);color:var(--ink);border:1px solid var(--line);'
+   'border-radius:12px;padding:8px 8px;border-left:6px solid #64748b}'
+ '.mtS b{display:block;font-size:1.5rem;line-height:1.1}'
+ '.mtS b span{font-size:.8rem;margin-left:2px}'
+ '.mtS > span{font-size:.78rem;opacity:.85}'
+ '.mtR{background:var(--card);color:var(--ink);border:1px solid var(--line);border-left:6px solid #64748b;'
+   'border-radius:12px;padding:10px 12px;margin:0 0 8px}'
+ '.mtHd{display:flex;flex-wrap:wrap;align-items:center;gap:6px}'
+ '.mtTm{font-weight:800;font-size:1.05rem}'
+ '.mtNm{font-weight:800;font-size:1.05rem}'
+ '.mtCd{font-size:.82rem;opacity:.7}'
+ '.mtBd{margin-left:auto;font-size:.78rem;font-weight:800;color:#fff;padding:2px 9px;border-radius:999px;white-space:nowrap}'
+ '.mtLn{font-size:.86rem;line-height:1.55;margin-top:4px}'
+ '.mtLn .k{display:inline-block;font-weight:700;margin-right:4px}'
+ '.mtDim{opacity:.7}'
+ '.mtOut{opacity:.6}'
+ '.mtDay{background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:12px;margin:0 0 8px;padding:0 12px}'
+ '.mtDay summary{cursor:pointer;padding:10px 0;font-weight:800}'
+ '.mtDay summary small{font-weight:600;opacity:.8;margin-left:8px;font-size:.8rem}'
+ '.mtDay[open]{padding-bottom:6px}'
+ '.mtFoot{font-size:.78rem;opacity:.85;margin:12px 4px;line-height:1.6;color:#fff}'
+ '.mtGs{display:flex;gap:8px;margin:0 0 12px}'
+ '.mtG{flex:1 1 0;min-width:0;background:var(--card);color:var(--ink);border:3px solid transparent;border-radius:14px;'
+   'padding:10px 8px;cursor:pointer;text-align:center;font-weight:800;font-size:1rem;opacity:.6}'
+ '.mtG b{display:block;font-size:1.7rem;line-height:1.15}'
+ '.mtG b small{font-size:.85rem;margin-left:2px}'
+ '.mtG.on{opacity:1}'
+ '.mtG.no.on{border-color:#dc2626}'
+ '.mtG.ok.on{border-color:#16a34a}'
+ '.mtRd{font-size:.8rem;font-weight:800;padding:2px 9px;border-radius:999px;white-space:nowrap}'
+ '.mtRd.y{background:#2563eb;color:#fff}'
+ '.mtRd.n{background:transparent;color:#f87171;border:2px solid #f87171}'
+ '.mtBody{display:flex;gap:10px;align-items:flex-start}'
+ '.mtMain{flex:1 1 auto;min-width:0}'
+ '.mtSide{flex:0 0 auto;text-align:right;font-size:.78rem;line-height:1.6;opacity:.7;margin-top:4px;white-space:nowrap}'
+ '.mtSub{font-size:.8rem;color:#fff;opacity:.9;margin:14px 4px 6px;font-weight:700}';
var MITA_CAT_ = {
  notice: { ic: '✅', t: 'お知らせで反応', c: '#16a34a' },
  r1:     { ic: '🔗', t: '1回目の確認リンクで確認', c: '#2C7A99' },
  r2:     { ic: '🌅', t: '当日朝の確認リンクで確認', c: '#d97706' },
  none:   { ic: '⚠️', t: '反応なし', c: '#dc2626' },
  wait:   { ic: '⏳', t: 'まだ反応なし', c: '#64748b' },
  out:    { ic: '・', t: '対象外', c: '#94a3b8' }
};
var MITA_ORDER_ = ['notice', 'r1', 'r2', 'none', 'wait', 'out'];
function mitaTab_(b) {
  var t = b.getAttribute('data-t');
  [].slice.call(document.querySelectorAll('.mtTab')).forEach(function (x) { x.classList.toggle('on', x === b); });
  [].slice.call(document.querySelectorAll('.mtPane')).forEach(function (x) { x.style.display = x.getAttribute('data-t') === t ? '' : 'none'; });
}
function mitaSeenText_(r) {
  var what = r.sent2 ? '当日朝の確認リンク' : (r.sent1 ? '1回目の確認リンク' : 'お知らせ');
  var t = r.seen === '既読' ? what + 'を送り、既読になっていますが、まだ反応はありません'
                           : what + 'を送りましたが、まだ既読になっていません';
  return t + (r.seen_at ? '（この方が最後にメッセージを読んだ時間 ' + r.seen_at + '）' : '');
}
function mitaRow_(r) {
  var c = MITA_CAT_[r.cat] || MITA_CAT_.out;
  var ln = [];
  if (r.clicked) ln.push('<span class="k">👆 URLを押した</span>' + esc_(r.clicked));   
  if (r.replied) ln.push('<span class="k">💬 返事</span>' + esc_(r.replied) + (r.reply ? '「' + esc_(r.reply) + '」' : ''));
  var side = ['🔔 お知らせ ' + esc_(r.notice || '')];
  if (r.sent1) side.push('🔗 確認リンク1回目 ' + esc_(r.sent1));
  if (r.sent2) side.push('🔗 確認リンク当日朝 ' + esc_(r.sent2));
  return '<div class="mtR' + (r.cat === 'out' ? ' mtOut' : '') + '" style="border-left-color:' + c.c + '">' +
    '<div class="mtHd">' + (r.seen ? '<span class="mtRd ' + (r.seen === '既読' ? 'y' : 'n') + '">' + esc_(r.seen) + '</span>' : '') +
    '<span class="mtTm">' + esc_(r.start || '--:--') + '</span>' +
    '<span class="mtNm">' + esc_(r.name || '') + '</span>' +
    (r.code ? '<span class="mtCd">' + esc_(r.code) + '</span>' : '') +
    '<span class="mtBd" style="background:' + c.c + '">' + c.ic + ' ' + esc_(c.t) + '</span></div>' +
    '<div class="mtBody"><div class="mtMain">' +
    (ln.length ? '<div class="mtLn">' + ln.join('<br>') + '</div>' : '') +
    (r.seen ? '<div class="mtLn mtDim">' + esc_(mitaSeenText_(r)) + '</div>' :
      (r.why ? '<div class="mtLn mtDim">' + esc_(r.why) + '</div>' : '')) +
    '</div><div class="mtSide">' + side.join('<br>') + '</div></div></div>';
}
var MITA_NO_ = { wait: 1, none: 1 }, MITA_OK_ = { notice: 1, r1: 1, r2: 1 };
function mitaGrp_(b) {
  var box = b.parentNode.parentNode, g = b.getAttribute('data-g');
  [].slice.call(box.querySelectorAll(':scope > .mtGs > .mtG')).forEach(function (x) { x.classList.toggle('on', x === b); });
  [].slice.call(box.querySelectorAll(':scope > .mtGp')).forEach(function (x) { x.style.display = x.getAttribute('data-g') === g ? '' : 'none'; });
}
function mitaDay_(day) {
  var rows = (day && day.rows) || [];
  var no = rows.filter(function (r) { return MITA_NO_[r.cat]; });
  var ok = rows.filter(function (r) { return MITA_OK_[r.cat]; });
  var out = rows.filter(function (r) { return !MITA_NO_[r.cat] && !MITA_OK_[r.cat]; });
  var first = no.length ? 'no' : 'ok';
  function btn(g, t, n) {
    return '<button type="button" class="mtG ' + g + (g === first ? ' on' : '') + '" data-g="' + g + '" onclick="mitaGrp_(this)">' +
      '<b>' + n + '<small>人</small></b>' + t + '</button>';
  }
  function list(arr, empty) { return arr.length ? arr.map(mitaRow_).join('') : '<div class="mtR mtDim">' + empty + '</div>'; }
  return '<div class="mtGs">' + btn('no', '⏳ まだ反応なし', no.length) + btn('ok', '✅ リアクション済', ok.length) + '</div>' +
    '<div class="mtGp" data-g="no"' + (first === 'no' ? '' : ' style="display:none"') + '>' + list(no, 'まだ反応のない方はいません') +
    (out.length ? '<div class="mtSub">対象外（取り消し・当日のご予約など）</div>' + out.map(mitaRow_).join('') : '') + '</div>' +
    '<div class="mtGp" data-g="ok"' + (first === 'ok' ? '' : ' style="display:none"') + '>' + list(ok, 'まだリアクションのある方はいません') + '</div>';
}
function mitaCnt_(day) {
  var n = 0, c = (day && day.count) || {};
  for (var k in c) n += c[k];
  return n;
}
function renderMitaPage_(d, base, staff, dev) {
  d = d || {};
  var head = '<style>' + HOMECSS_ + MITACSS_ + '</style>' +
    '<div class="home">' + backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">👀</span><span class="bname">お知らせ見てくれた？</span></div>';
  if (d.error || !d.days) {
    return head + '<div class="soon"><div class="soonic">📄</div>' +
      '<div class="soontitle" style="font-size:1.4rem">まだ記録がありません</div>' +
      '<div class="soondesc">' + esc_(d.error || '前日お知らせを送ると、ここに出てきます。') + '</div></div></div>';
  }
  var days = d.days || [], today = null, tomorrow = null, past = [];
  days.forEach(function (x) {
    if (x.when === 'today') today = x;
    else if (x.when === 'tomorrow') tomorrow = x;
    else if (x.when === 'past') past.push(x);
  });
  function pane(day, empty) {
    if (!day || !day.rows || !day.rows.length) {
      return '<div class="mtR mtDim">' + esc_(empty) + '</div>';
    }
    return '<div>' + mitaDay_(day) + '</div>';
  }
  var first = ((today && (today.count || {}).wait) || !tomorrow) ? 'today' : 'tomorrow';
  function wd(day) { return day ? ' ' + String(day.label || '').replace(/^\d+\/\d+/, '') : ''; }
  var TABS = [
    ['today', '今日予約', today, '今日のご予約のお知らせはありません'],
    ['tomorrow', '明日予約', tomorrow, '明日のご予約のお知らせはまだ送っていません'],
    ['past', '過去の履歴', null, '']
  ];
  var tabs = '<div class="mtTabs">' + TABS.map(function (x) {
    var n = x[0] === 'past' ? past.length + '日分' : ((x[2] ? x[2].label + '・' + mitaCnt_(x[2]) : '0') + '人');
    return '<button type="button" class="mtTab' + (x[0] === first ? ' on' : '') + '" data-t="' + x[0] + '" onclick="mitaTab_(this)">' +
      esc_(x[1]) + '<span class="mtTabN">' + n + '</span></button>';
  }).join('') + '</div>';
  var panes = TABS.map(function (x) {
    var inner;
    if (x[0] === 'past') {
      inner = past.length ? past.map(function (day) {
        var c = day.count || {};
        var mini = MITA_ORDER_.filter(function (k) { return c[k]; }).map(function (k) { return MITA_CAT_[k].ic + c[k]; }).join(' ');
        return '<details class="mtDay"><summary>' + esc_(day.label) + '<small>' + mitaCnt_(day) + '人　' + esc_(mini) + '</small></summary>' +
          '<div>' + mitaDay_(day) + '</div></details>';
      }).join('') : '<div class="mtR mtDim">まだ履歴はありません</div>';
    } else {
      inner = pane(x[2], x[3]);
    }
    return '<div class="mtPane" data-t="' + x[0] + '"' + (x[0] === first ? '' : ' style="display:none"') + '>' + inner + '</div>';
  }).join('');
  var foot = d.generated_at ? '<div class="mtFoot">' + esc_(d.generated_at) + ' 時点（5分ごとに新しくなります）</div>' : '';
  return head + tabs + panes + foot + '</div>';
}
