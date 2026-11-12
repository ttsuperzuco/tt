// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：lt
function ltCard_(r) {
  var cls = esc_(r.cls || 'add');
  var name = r.name || '（名前不明）';
  var search = esc_(((name) + ' ' + (r.code || '')).toLowerCase());
  var codeHtml = (r.code && name.indexOf(r.code) < 0)
    ? '<span class="lcode">' + esc_(r.code) + '</span>' : '';

  var treatHtml = r.treatment
    ? '<div class="lmeta"><span class="ltag">予約<br>内容</span><span class="ltxt">' + esc_(r.treatment) + '</span></div>'
    : '';

  var conv = r.conv || [];
  var MARK = {'[スタンプ]': 1, '[画像]': 1, '[動画]': 1, '[ファイル]': 1, '[送信取消]': 1};
  var st = 0;
  while (st < conv.length && MARK[conv[st].text]) st++;
  conv = conv.slice(st);

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

  var _ttHas = r.tt_time && r.tt_time !== '—' && r.tt_time !== '';
  var ttStart = (r.tt_time || '').split(/[–—〜~-]/)[0].trim();
  var _diff = (r.status === 'time_mismatch') ? ' ldtdiff' : '';
  var dateStr = esc_(jpDateWeekday_(r.date));
  var _isNext = (r.status === 'next_notice_mismatch');
  var ttDateStr = (_isNext && r.tt_date) ? esc_(jpDateWeekday_(r.tt_date)) : dateStr;
  if (_isNext) _diff = ' ldtdiff';

  var _isDel = (r.status === 'need_delete');
  var lineInner = _isDel
    ? '<span class="ldtdt"><span class="ldtd">' + dateStr + '</span><span class="ldtt ldtnone">キャンセル</span></span>'
    : '<span class="ldtdt"><span class="ldtd">' + dateStr + '</span><span class="ldtt' + _diff + '">' + esc_(r.line_time || '') + '</span></span>';
  var lineCell =
    '<div class="ldtcell">' +
      '<span class="lbadge2 line"><span class="b1">LINE</span><span class="b2">予約</span></span>' +
      lineInner +
    '</div>';
  var ttInner = r.room_undecided
    ? '<span class="ldtdt"><span class="ldtd">' + dateStr + '</span><span class="ldtt ltroomx">部屋未定</span></span>'
    : (_ttHas
      ? '<span class="ldtdt"><span class="ldtd">' + ttDateStr + '</span><span class="ldtt' + _diff + '">' + esc_(ttStart) + '</span></span>'
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
    (_isNext && r.action ? '<div class="lnextact">' + esc_(r.action) + '</div>' : '') +
    treatHtml +
    '<div class="lconv">' +
      '<div class="lconvh"><span class="lconvlab">根拠のLINE会話</span>' + lineBtn + '</div>' +
      '<div class="lconvb">' + bubbles + '</div>' +
    '</div>' +
  '</article>';
}
function ltGmapSection_(g) {
  var list = (g && g.unreplied) || [];
  if (!list.length) return '';
  var when = String(g.checked_at || '').replace(/^\d{4}-(\d{2})-(\d{2}) (\d{2}:\d{2}).*$/, '$1/$2 $3');
  var cardsHtml = list.map(function (u) {
    var n = parseInt(u.stars, 10);
    var stars = (n >= 1 && n <= 5)
      ? '<span class="lgmstar">' + '★★★★★'.slice(0, n) + '<span class="lgmoff">' + '★★★★★'.slice(n) + '</span></span>' : '';
    var body = u.text
      ? esc_(u.text).replace(/\n/g, '<br>')
      : '<span class="lgmnone">（星だけで、文は書かれていません）</span>';
    return '' +
    '<article class="lcard lgm">' +
      '<div class="lhead"><span class="lname">' + esc_(u.name || '（名前なし）') + '</span></div>' +
      '<div class="lmeta"><span class="ltag">書いた<br>時期</span><span class="ltxt">' + esc_(u.when || '') + stars + '</span></div>' +
      '<div class="lgmbox">' +
        '<div class="lgmh"><span class="lgmlab">口コミの本文</span>' +
          '<a class="lgmbtn" href="' + esc_(g.reply_url || 'https://business.google.com/reviews') + '" target="_blank" rel="noopener">グーグルで<br>返信する ↗</a></div>' +
        '<div class="lgmb">' + body + '</div>' +
      '</div>' +
    '</article>';
  }).join('\n');
  return '<h1>⚠️ GGMAP書き込み未返信 <span class="lcnt">' + list.length + '件</span></h1>' +
         '<div class="lgmwhen">口コミを確認した時刻：' + esc_(when) + '</div>' +
         '<div class="lcards">' + cardsHtml + '</div>';
}
function ltKaeshiSection_(k, base, staff, dev) {
  var list = (k && k.items) || [];
  if (!list.length) return '';
  var cardsHtml = list.map(function (u) {
    var md = String(u.date || '').replace(/^\d{4}-0?(\d+)-0?(\d+)$/, '$1/$2');
    var pd = String(u.prev_date || '').replace(/^\d{4}-0?(\d+)-0?(\d+)$/, '$1/$2');
    var who = (u.staff || '') + (u.staff_name || '') + (pd ? '（' + pd + 'の担当）' : '');
    var what = u.kind === '書き方の確認'
      ? '🔁は書いてありますが、ズコが読めない書き方です：' + esc_(u.line || '')
      : '🔁がまだ書かれていません';
    return '' +
    '<article class="lcard">' +
      '<div class="lhead"><span class="lname">' + esc_(u.name || '') + ' ' + esc_(u.code || '') + '</span></div>' +
      '<div class="lmeta"><span class="ltag">最終回</span><span class="ltxt">' + esc_(md + '(' + (u.youbi || '') + ') ' + (u.time || '')) + '</span></div>' +
      '<div class="lmeta"><span class="ltag">施術</span><span class="ltxt">' + esc_(u.parts || '') + '<br>' + esc_(u.count || '') + '</span></div>' +
      '<div class="lmeta"><span class="ltag">書く人</span><span class="ltxt">' + esc_(who) + '</span></div>' +
      '<div class="lmeta"><span class="ltag">内容</span><span class="ltxt">' + what + '</span></div>' +
      (u.code ? '<a class="lkaeshigo" href="' + base + '?view=yoyaku_sejutsugo&mode=repeat&num=' +
        encodeURIComponent(u.code) + '&mk=' + encodeURIComponent(u.staff || '') + roleSfx_(staff, dev) +
        '" target="_top">🔁 リピート入力へ飛ぶ →</a>' : '') +
    '</article>';
  }).join('\n');
  return '<style>.lkaeshigo{display:block;margin:12px 0 2px;padding:14px;border-radius:14px;background:#fff;' +
         'color:#2C7A99;box-shadow:0 3px 0 #0b3a4c;font-weight:800;font-size:17px;text-align:center;text-decoration:none}</style>' +
         '<h1>⚠️ 🔁記入漏れ（おまとめ最終回） <span class="lcnt">' + list.length + '件</span></h1>' +
         '<div class="lcards">' + cardsHtml + '</div>';
}
function ltRefreshBtn_(r) {
  var pend = (typeof window !== 'undefined') && window.__ltRefRid &&
             (!r || r.rid !== window.__ltRefRid) && (Date.now() - (window.__ltRefAt || 0) < 180000);
  var busy = (r && r.running) || pend;
  var note = '';
  if (busy) {
    note = '数分かかります。少し待っててくださいね🥺';
  } else if (r && r.finished_at && r.rid && (typeof window !== 'undefined') && r.rid === window.__ltRefRid) {
    note = r.ok === false
      ? '一部を更新できませんでした。もう一度試してもらえると嬉しいです🙇'
      : '更新しました ' + String(r.finished_at).replace(/^\d{4}-(\d{2})-(\d{2}) (\d{2}:\d{2}).*$/, '$1/$2 $3');
  }
  return '<button type="button" class="lrefbtn"' + (busy ? ' disabled' : '') +
         ' onclick="if(window.ltRefresh)window.ltRefresh()">' + (busy ? '⏳ 更新中…' : '🔄 最新に更新') + '</button>' +
         (note ? '<span class="lrefnote">' + esc_(note) + '</span>' : '');
}
function renderLtPage_(d, base, staff, dev) {
  var c = d.counts || {};
  var action = d.action || [];
  var oks = d.ok || [];
  var dismissed = d.dismissed || [];

  var LTGROUPS = [
    { st: 'not_found',      title: '記入もれ' },
    { st: 'next_notice_mismatch', title: 'TT：次回予約のお知らせの不一致' },
    { st: 'time_mismatch',  title: 'TimeTree予約ズレ' },
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
  cards += ltKaeshiSection_(d.kaeshi, base, staff, dev);
  cards += ltGmapSection_(d.gmap);

  var dismRows = dismissed.length
    ? dismissed.map(function (r) {
        return '<tr data-search="' + esc_(((r.name || '') + ' ' + (r.code || '')).toLowerCase()) + '">' +
          '<td>' + esc_(r.date || '') + '</td><td>' + esc_(r.line_time || '') + '</td>' +
          '<td>' + esc_(r.name || '') + '</td></tr>';
      }).join('\n')
    : '<tr><td colspan="3">なし</td></tr>';

  var rbtn = ltRefreshBtn_(d.refresh);   
  return '' +
'<style>' + LTCSS_ + '</style>' +
'<div class="lwrap">' +
  '<div class="lbar">' +
    '<a class="lhome" href="' + (base || '') + '?view=home' + roleSfx_(staff, dev) + '" target="_top">← 戻る</a>' +
    (rbtn
      ? '<div class="lbarr">' + rbtn + '<span class="lgen">照合: ' + esc_(d.matched_at || d.generated_at || '—') + '</span></div>'
      : '<span class="lgen">照合: ' + esc_(d.matched_at || d.generated_at || '—') + '</span>') +
  '</div>' +
  cards +
'</div>' + LTFIT_SCRIPT_;
}
var LTCSS_ =
'  :root{ --card:#ffffff; --ink:#0f172a; --sub:#64748b; --line:#e2e8f0; --add:#d97706; }' +
'  @media (prefers-color-scheme:dark){ :root{ --card:#131c2e; --ink:#e8eef7; --sub:#94a3b8; --line:#26324a; } }' +
'  *{ box-sizing:border-box; }' +
'  body{ margin:0; background:#2C7A99; color:var(--ink);' +
'    font-family:"Segoe UI","Yu Gothic UI","Hiragino Sans",system-ui,sans-serif; line-height:1.5; }' +
'  .lwrap{ max-width:640px; margin:0 auto; padding:12px 12px 40px; }' +
'  .lbar{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:6px; }' +
'  .lhome{ flex:0 0 auto; color:#0f172a; text-decoration:none; font-weight:700; font-size:14px;' +
'    background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:9px 14px; }' +
'  .lgen{ color:rgba(255,255,255,.85); font-size:12px; }' +
'  .lbarr{ display:flex; flex-direction:column; align-items:flex-end; gap:3px; text-align:right; }' +
'  .lrefbtn{ color:#0f172a; background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:9px 14px;' +
'    font-weight:800; font-size:14px; cursor:pointer; font-family:inherit; }' +
'  .lrefbtn:disabled{ background:#e2e8f0; color:#475569; cursor:default; }' +
'  .lrefnote{ color:#fff; font-size:12px; font-weight:700; }' +
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
'  .lnextact{ margin-top:8px; font-size:1.1rem; font-weight:800; color:#ff5fa2; }' +
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
'  .lcard.lgm{ border-left-color:#4285F4; }' +
'  .lgmwhen{ color:rgba(255,255,255,.85); font-size:12px; margin:-8px 0 12px; }' +
'  .lgmstar{ margin-left:10px; color:#f59e0b; font-size:1.3rem; letter-spacing:1px; } .lgmoff{ color:#cbd5e1; }' +
'  .lgmbox{ border:2px solid #4285F4; border-radius:12px; overflow:hidden; margin-top:6px; }' +
'  .lgmh{ display:flex; align-items:center; justify-content:space-between; gap:10px; background:#fff; padding:9px 10px; }' +
'  .lgmlab{ font-size:1.33rem; font-weight:900; color:#4285F4; }' +
'  .lgmbtn{ flex:0 0 auto; text-align:center; background:#4285F4; color:#fff; font-weight:800;' +
'    font-size:1.2rem; line-height:1.25; text-decoration:none; border-radius:11px; padding:11px 15px; }' +
'  .lgmb{ background:#f8fafc; color:#0f172a; font-size:1.12rem; padding:11px 13px; white-space:normal; }' +
'  .lgmnone{ color:#64748b; }' +
'  .loksec{ margin-top:14px; background:var(--card); border:1px solid var(--line); border-radius:12px; padding:4px 12px; }' +
'  .loksec summary{ cursor:pointer; font-weight:800; padding:10px 0; }' +
'  .loksec table{ width:100%; border-collapse:collapse; font-size:12.5px; }' +
'  .loksec th,.loksec td{ text-align:left; padding:6px 6px; border-bottom:1px solid var(--line); vertical-align:top; }' +
'  .loksec th{ color:var(--sub); font-weight:700; } .loksec td.ttc{ color:var(--sub); }' +
'  .lhidden{ display:none!important; }';
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
