// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：pcstatus
function renderPcStatusPage_(d, base, staff, dev) {
  d = d || {};
  var err = d.error || (!d.sent_at ? 'まだ自宅PCから届いていません。' : '');
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
    '<div class="pcFoot">自宅PCが1分ごとに合図を送っています。この画面は開くたびに最新の状態を取得します。</div>' +
  '</div>';
}
function pcstRow_(k, v) {
  return '<div class="pcstR"><div class="pcstK">' + esc_(k) + '</div><div class="pcstV">' + v + '</div></div>';
}
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
+ '@media (max-width:480px){'
+   '.pcstR{flex-direction:column;gap:4px;padding:15px 16px}'
+   '.pcstK{flex:none;font-size:1.1rem}'
+   '.pcstV{font-size:1.4rem}'
+ '}';
