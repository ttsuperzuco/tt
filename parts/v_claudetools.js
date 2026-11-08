// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：claudetools
function renderClaudeToolsPage_(base, staff, dev) {
  var KOTOBA = [
    { t: 'インスタを操作したい',
      d: 'インスタのDM返信・投稿・ストーリーズ・投稿のアーカイブなどを操作（3アカウント／ログイン使い回し）' },
    { t: '画像のURLをつくりたい',
      d: '画像（料金表・お支払い方法など）を、お客様がそのまま開ける短いリンク（x.gd/〇〇）に変換する' },
    { t: '画像からAIタグ除去',
      d: 'ChatGPT等で作った画像をSNSに上げると付く「AI情報／AIで作成」の表示を削除する。画像に埋め込まれた"AIが作った"記録だけを削除し、絵（色・大きさ）は元と完全に同じまま。画像を貼って「AIタグ除去」と言うだけ' },
    { t: '家計簿操作ツール', c: '家計簿',
      d: '「家計簿」と貼るだけで、話した日々の出費を家計簿に記入。例：「きのう うーばー 206」→ 昨日のUberEats 206元を記入（一人の食事＝ノーマル／それ以外は確認、クレカ払いはカードにも反映）' },
    { t: '画像リンクに画像を追加', c: '画像リンクに追加',
      d: '画像を渡すと、縦横（縦横の長さ）はそのまま・スマホで軽く見れる重さに縮めて、各種LINKの「画像リンク」に新しいボタンとして追加する。渡す時に「どの並び・ボタン名で出すか」（例：イーライト後／頭皮ケア 日本語）も伝える。画像を貼って「画像リンクに追加」と言うだけ' },
    { t: 'キャンペーン設定ツール', c: 'キャンペーン設定',
      d: '新しいキャンペーンを始める時に、各種LINK・公式LINEのあいさつの自動応答文・前日お知らせの文と画像への登録を1つずつ手伝う。終わった翌日の朝9時に、LINK・応答文・インスタのキャンペーン投稿を自動で片づける（失敗したら4時間ごとに3回まで、だめならLINEで知らせる）。延長の時も「キャンペーン設定」と言うだけ' },
    { t: 'Visit Japan Web登録', c: 'VJW登録',
      d: '日本へ行く前の入国の手続き（Visit Japan Web）を自動で入力する。ログインと最後の「登録」ボタンだけ自分で押す。「VJW登録」と貼って、日本に着く日と便名を言うだけ（着く6時間前までに）' }
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
    var copyText = k.c || k.t;   
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
      'function fb(){ try{ var ta=document.createElement("textarea"); ta.value=t; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); done(); }catch(e2){ if(ok) ok.textContent="コピーできませんでした（長押しで選択してください🙇）"; } }' +
      'try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(done,fb); } else { fb(); } }catch(e){ fb(); }' +
    '};' +
  '})();';
  return '<style>' + CSS + '</style>' +
    backBar_(base, staff, dev) +
    '<div class="cttwrap">' +
      '<h1>🤖 自作Claudeツール</h1>' +
      '<div class="cttnote">Claudeに言う「合言葉」です。タップ（またはコピー）で写して、別のチャットのClaudeにそのまま貼り付けてね😊 説明なしでその作業ができます。</div>' +
      cards +
    '</div>' +
    '<script>' + script + '<\/script>';
}
