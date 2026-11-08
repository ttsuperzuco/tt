// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：procell
function renderProcellError_(msg, base, staff, dev) {
  return '<style>' + HOMECSS_ + '</style>' +
    '<div class="home">' + backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">🧴</span><span class="bname">プロセル 残り本数</span></div>' +
    '<div class="soon"><div class="soonic">📄</div>' +
    '<div class="soontitle" style="font-size:1.4rem">まだ作られていません</div>' +
    '<div class="soondesc">' + esc_(msg) + '</div></div></div>';
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
