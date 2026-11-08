// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：koukoku
function _costYen_(n) {
  var s = String(Math.round(Number(n) || 0));
  var neg = (s.charAt(0) === '-'); if (neg) s = s.slice(1);
  var out = '', c = 0;
  for (var i = s.length - 1; i >= 0; i--) { out = s.charAt(i) + out; if (++c % 3 === 0 && i > 0) out = ',' + out; }
  return (neg ? '-' : '') + out + ' 元';
}
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
  '  table.kkmt { width:100%; border-collapse:collapse; font-size:.76rem; margin-top:4px; }' +
  '  table.kkmt th, table.kkmt td { padding:5px 3px; text-align:right; border-bottom:1px solid var(--line,#e2e8f0); font-variant-numeric:tabular-nums; }' +
  '  table.kkmt td { white-space:nowrap; }' +
  '  table.kkmt thead th { color:var(--sub,#64748b); font-size:.66rem; font-weight:700; }' +
  '  .kkmc { flex-wrap:wrap; }' +
  '  table.kkmt tbody th { text-align:left; font-weight:800; }' +
  '  table.kkmt thead th:first-child { text-align:left; }' +
  '  table.kkmt tr.kkmsum th, table.kkmt tr.kkmsum td { font-weight:900; border-bottom:0; }' +
  '  .kkmnone { color:var(--sub,#64748b); font-size:.8rem; padding:4px 0; }' +
  '  .kkmbtn { margin-top:8px; border:1px solid var(--line,#e2e8f0); background:var(--card,#fff); color:#0ea5e9; font-weight:800; font-size:.85rem; padding:7px 14px; border-radius:999px; cursor:pointer; }' +
  '  .kkmdet { flex-basis:100%; min-width:0; margin-top:2px; border-top:1px dashed var(--line,#e2e8f0); padding-top:2px; }' +
  '  .kkmh { font-size:.82rem; font-weight:800; color:var(--ink,#0f172a); margin:12px 0 4px; }' +
  '  .kkmh b { color:#16a34a; }' +
  '  .kkmchips { display:flex; flex-wrap:wrap; gap:6px; }' +
  '  .kkmchips span { background:rgba(148,163,184,.14); border-radius:999px; padding:3px 10px; font-size:.78rem; }' +
  '  .kkmchips b { color:#16a34a; }' +
  '  .kkmday div { display:flex; align-items:center; gap:6px; font-size:.72rem; margin:2px 0; }' +
  '  .kkmday span { width:38px; flex:none; color:var(--sub,#64748b); font-variant-numeric:tabular-nums; }' +
  '  .kkmday em { flex:1; min-width:0; }' +
  '  .kkmday i { display:block; height:10px; background:#0ea5e9; border-radius:4px; min-width:2px; }' +
  '  .kkmday b { flex:none; font-weight:700; color:var(--ink,#0f172a); font-variant-numeric:tabular-nums; }' +
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
var KOUKOKU_MONTH_DAYS_ = 31;
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
var KK_PLACE_ = { instagram: 'インスタ', facebook: 'フェイスブック', threads: 'スレッズ', messenger: 'メッセンジャー', audience_network: 'その他' };
function _kkPlaces_(d) {
  var accs = (d && d.accounts) || [];
  var rows = [];
  accs.forEach(function (acc) {
    (acc.manager || []).forEach(function (r) {
      var sex = r.sex || (acc.key === 'tw_women' ? 'f' : (acc.key === 'tw_men' ? 'm' : null));
      rows.push({ r: r, nat: acc.key === 'jp' ? 'j' : 't', sex: sex, at: acc.manager_at });
    });
  });
  if (!rows.length) return '';
  var pers = (d.mgr_periods && d.mgr_periods.length) ? d.mgr_periods : [{ key: '1w', label: '1週間' }];
  var total = 0; rows.forEach(function (x) { total += Number(x.r.day_budget) || 0; });
  var GROUPS = [['j', 'm', '🇯🇵 日本人 男性'], ['j', 'f', '🇯🇵 日本人 女性'], ['t', 'm', '🇹🇼 台湾人 男性'], ['t', 'f', '🇹🇼 台湾人 女性']];
  var body = '';
  GROUPS.forEach(function (g) {
    var gs = rows.filter(function (x) { return x.nat === g[0] && x.sex === g[1]; });
    if (!gs.length) return;
    var day = 0; gs.forEach(function (x) { day += Number(x.r.day_budget) || 0; });
    body += '<div class="kksub">' + esc_(g[2]) + '<small>' + gs.length + '本・1日 ' + esc_(_costYen_(day)) + '</small></div>';
    gs.forEach(function (x) {
      var r = x.r;
      var places = (r.places || []).map(function (p) { return KK_PLACE_[p] || p; });
      var where = places.length === 1 ? places[0] + 'だけ' : places.join('＋');
      var dest = r.dest === 'line' ? '公式LINE' : (r.dest === 'profile' ? 'インスタのプロフィール' : 'ウェブ');
      var lang = r.lang === 'ja' ? '日本語のみ' : (r.lang === 'zh' ? '中国語のみ' : '言語の指定なし');
      var img = r.thumb ? '<img class="kkpth" src="' + r.thumb + '" alt="">' : '<div class="kkpth ph">画像</div>';
      body += '<div class="kkpc kkmc" data-st="' + esc_(JSON.stringify(r.stats || {})) + '"' +
          (r.detail ? ' data-dt="' + esc_(JSON.stringify(r.detail)) + '"' : '') + '>' + img +
        '<div class="kkpbody">' +
          '<div class="kkptitle">' + (r.day_budget ? '<span class="kkpbudget">1日 ' + esc_(_costYen_(r.day_budget)) + '</span>' : '') +
            esc_(where) + '</div>' +
          '<div class="kkpgoal">押した先：' + esc_(dest) + '　／　' + esc_(lang) + '</div>' +
          '<div class="kkmtab"></div>' +
          (r.detail ? '<button type="button" class="kkmbtn">詳しく見る ▼</button>' : '') +
        '</div>' + (r.detail ? '<div class="kkmdet" style="display:none"></div>' : '') + '</div>';
    });
  });
  var seg = pers.map(function (p) {
    return '<button type="button" data-p="' + esc_(p.key) + '"' + (p.key === '1w' ? ' class="on"' : '') + '>' + esc_(p.label) + '</button>';
  }).join('');
  var at = rows[0].at ? '<div class="kkpnote">広告マネージャから読んだ日時：' + esc_(rows[0].at) + '</div>' : '';
  var script = '<script>(function(){' +
    'var seg=document.getElementById("kkm-seg");if(!seg)return;var bs=seg.querySelectorAll("button"),i,period="1w";' +
    'var NM={instagram:"インスタ",facebook:"フェイスブック",threads:"スレッズ",messenger:"メッセンジャー",audience_network:"その他"};' +
    'function nf(n){n=Math.round(Number(n)||0);var s=""+n,o="",c=0,j;for(j=s.length-1;j>=0;j--){o=s.charAt(j)+o;if(++c%3===0&&j>0)o=","+o;}return o;}' +
    'function apply(){var cs=document.querySelectorAll(".kkmc"),k;for(k=0;k<cs.length;k++){var st={};' +
      'try{st=JSON.parse(cs[k].getAttribute("data-st")||"{}");}catch(e){}var p=st[period]||{},h="",ts=0,ti=0,tc=0,n=0,key;' +
      'for(key in p){var v=p[key];n++;ts+=v.spend;ti+=v.imp;tc+=v.clicks;' +
        'h+="<tr><th>"+(NM[key]||key)+"</th><td>"+nf(v.spend)+" 元</td><td>"+nf(v.imp)+"</td><td>"+nf(v.clicks)+"</td><td>"+(v.clicks>0?(Math.round(v.spend/v.clicks*10)/10)+" 元":"—")+"</td></tr>";}' +
      'if(n>1)h+="<tr class=\\"kkmsum\\"><th>合計</th><td>"+nf(ts)+" 元</td><td>"+nf(ti)+"</td><td>"+nf(tc)+"</td><td>"+(tc>0?(Math.round(ts/tc*10)/10)+" 元":"—")+"</td></tr>";' +
      'var box=cs[k].querySelector(".kkmtab");if(box)box.innerHTML=n?("<table class=\\"kkmt\\"><thead><tr><th>出た場所</th><th>使った額</th><th>表示</th><th>押された</th><th>1回あたり</th></tr></thead><tbody>"+h+"</tbody></table>"):"<div class=\\"kkmnone\\">この期間はまだ表示されていません。</div>";' +
      'var dt=cs[k].querySelector(".kkmdet");if(dt&&dt.style.display!=="none")dt.innerHTML=det(cs[k]);}' +
      'for(k=0;k<bs.length;k++){bs[k].className=(bs[k].getAttribute("data-p")===period?"on":"");}}' +
    'var POS={feed:"フィード",instagram_stories:"ストーリー",instagram_reels:"リール",instagram_explore:"発見",instagram_explore_grid_home:"発見の一覧",facebook_stories:"ストーリー",facebook_reels:"リール"};' +
    'var RG={"Taipei":"台北市","Taipei City":"台北市","New Taipei City":"新北市","Taoyuan City":"桃園市","Hsinchu":"新竹県","Hsinchu City":"新竹市","Unknown":"不明"};' +
    'var DEV={mobile_app:"スマホのアプリ",mobile_web:"スマホのブラウザ",desktop:"パソコン"},GEN={male:"男性",female:"女性",unknown:"不明"};' +
    'function cpc(s,c){return c>0?(Math.round(s/c*10)/10)+" 元":"—";}' +
    'function tb(hd,rows){if(!rows.length)return "<div class=\\"kkmnone\\">数字がありません。</div>";var h="<table class=\\"kkmt\\"><thead><tr>",x,y;' +
      'for(x=0;x<hd.length;x++)h+="<th>"+hd[x]+"</th>";h+="</tr></thead><tbody>";' +
      'for(x=0;x<rows.length;x++){h+="<tr>";for(y=0;y<rows[x].length;y++)h+=(y===0?"<th>":"<td>")+rows[x][y]+(y===0?"</th>":"</td>");h+="</tr>";}return h+"</tbody></table>";}' +
    'function det(card){var D={};try{D=JSON.parse(card.getAttribute("data-dt")||"{}");}catch(e){}var d=D[period]||{},h="",x;' +
      'var bySp=function(a,b){return b[b.length-3]-a[a.length-3];};' +
      'h+="<div class=\\"kkmh\\">届いた人 <b>"+nf(d.reach)+"人</b>　同じ人に平均 <b>"+(d.freq||0)+"回</b></div>";' +
      'var ac=d.act||{},ak=Object.keys(ac);h+="<div class=\\"kkmh\\">押された後の行動</div>";' +
      'h+=ak.length?("<div class=\\"kkmchips\\">"+ak.map(function(a){return "<span>"+a+" <b>"+nf(ac[a])+"</b></span>";}).join("")+"</div>"):"<div class=\\"kkmnone\\">この期間はまだありません。</div>";' +
      'var ps=(d.pos||[]).slice().sort(function(a,b){return b[2]-a[2];});' +
      'h+="<div class=\\"kkmh\\">出た画面</div>"+tb(["画面","使った額","表示","押された","1回あたり"],ps.map(function(p){return [(NM[p[0]]||p[0])+"の"+(POS[p[1]]||p[1]),nf(p[2])+" 元",nf(p[3]),nf(p[4]),cpc(p[2],p[4])];}));' +
      'var ag=(d.ag||[]).slice().sort(function(a,b){return b[2]-a[2];});' +
      'h+="<div class=\\"kkmh\\">年齢×男女</div>"+tb(["年齢","男女","使った額","押された","1回あたり"],ag.map(function(a){return [(a[0]==="Unknown"?"不明":a[0]),(GEN[a[1]]||a[1]),nf(a[2])+" 元",nf(a[3]),cpc(a[2],a[3])];}));' +
      'var rg=(d.rg||[]).slice().sort(function(a,b){return b[1]-a[1];});' +
      'h+="<div class=\\"kkmh\\">地域</div>"+tb(["地域","使った額","押された","1回あたり"],rg.map(function(a){return [(RG[a[0]]||a[0]),nf(a[1])+" 元",nf(a[2]),cpc(a[1],a[2])];}));' +
      'var dv=(d.dev||[]).slice().sort(function(a,b){return b[1]-a[1];});' +
      'h+="<div class=\\"kkmh\\">見た機械</div>"+tb(["機械","使った額","表示","押された"],dv.map(function(a){return [(DEV[a[0]]||a[0]),nf(a[1])+" 元",nf(a[2]),nf(a[3])];}));' +
      'var dy=D.daily||[],mx=0;for(x=0;x<dy.length;x++)mx=Math.max(mx,dy[x][2]);' +
      'h+="<div class=\\"kkmh\\">日ごとの推移（直近30日・押された回数）</div>";' +
      'if(!dy.length){h+="<div class=\\"kkmnone\\">まだありません。</div>";}else{h+="<div class=\\"kkmday\\">";' +
        'for(x=0;x<dy.length;x++){var w=mx>0?Math.round(dy[x][2]/mx*100):0;' +
          'h+="<div><span>"+dy[x][0].slice(5).replace("-","/")+"</span><em><i style=\\"width:"+w+"%\\"></i></em><b>"+nf(dy[x][2])+"回・"+nf(dy[x][1])+"元</b></div>";}h+="</div>";}' +
      'return h;}' +
    'var mb=document.querySelectorAll(".kkmbtn");for(i=0;i<mb.length;i++){mb[i].addEventListener("click",function(){' +
      'var card=this.parentNode.parentNode,dt=card.querySelector(".kkmdet");if(!dt)return;' +
      'if(dt.style.display==="none"){dt.innerHTML=det(card);dt.style.display="block";this.textContent="閉じる ▲";}' +
      'else{dt.style.display="none";this.textContent="詳しく見る ▼";}});}' +
    'for(i=0;i<bs.length;i++){bs[i].addEventListener("click",function(){period=this.getAttribute("data-p");apply();});}apply();})();</script>';
  return '<div class="kkacc" style="border-left-color:#0ea5e9;">掲載場所ごとの内訳' +
      '<small>今 動いている広告 ' + rows.length + '本・1日 合計 ' + esc_(_costYen_(total)) + '</small></div>' +
    '<div class="kkpseg" id="kkm-seg">' + seg + '</div>' +
    '<div class="kkpnote">インスタだけ・フェイスブック＋スレッズなど、分けた広告ごとに、選択した期間の掲載場所ごとの数値を表示しています。</div>' +
    body + at + script;
}
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

  var allads = [];
  var accounts = d.accounts || [];
  if (accounts.length) {
    accounts.forEach(function (acc) {
      (acc.ads || []).forEach(function (a) { a._label = acc.label; a._handle = acc.handle; allads.push(a); });
    });
  } else { allads = d.ads || []; }

  var S = { jm: 0, jf: 0, tm: 0, tf: 0 }, unknown = 0;
  var mgrKeys = {};
  accounts.forEach(function (acc) {
    if (!acc.manager) return;
    mgrKeys[acc.key] = 1;
    acc.manager.forEach(function (r) {
      var day = Number(r.day_budget) || 0;
      var sx = r.sex || (acc.key === 'tw_women' ? 'f' : (acc.key === 'tw_men' ? 'm' : null));
      if (!sx) { unknown += day; return; }
      S[(acc.key === 'jp' ? 'j' : 't') + (sx === 'f' ? 'f' : 'm')] += day;
    });
  });
  accounts.forEach(function (acc) {
    if (mgrKeys[acc.key]) return;
    (acc.ads || []).forEach(function (a) {
      if (a.status !== '配信中') return;               
      var day = Number(a.day_budget) || 0;
      if (!a.sex) { unknown += day; return; }          
      S[(a.nat === 'jp' ? 'j' : 't') + (a.sex === 'f' ? 'f' : 'm')] += day;
    });
  });
  if (!accounts.length) {
    allads.forEach(function (a) {
      if (a.status !== '配信中') return;
      var day = Number(a.day_budget) || 0;
      if (!a.sex) { unknown += day; return; }
      S[(a.nat === 'jp' ? 'j' : 't') + (a.sex === 'f' ? 'f' : 'm')] += day;
    });
  }
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
    (unknown ? '<div class="kkleg" style="text-align:center;color:#d97706;">※ 男女を読めなかった配信中の広告 1日 ' + esc_(_costYen_(unknown)) + ' 分は4マスに含めていません</div>' : '') +
    '</div>';

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

  function numc(n) {
    n = Number(n) || 0; var neg = n < 0; n = Math.abs(n);
    var t = String(n), o = '', c = 0, i;
    for (i = t.length - 1; i >= 0; i--) { o = t.charAt(i) + o; if (++c % 3 === 0 && i > 0) o = ',' + o; }
    return (neg ? '-' : '') + o;
  }

  function perfTotalCard(a, showAcc) {
    var all = a.perf && a.perf.all;
    if (!all) return adCard(a, showAcc);   
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
        '<div class="kkpnote">選択した期間の増加分を、フォロワーの増加が多い順に表示しています。</div>' +
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
        _kkPlaces_(d) +
        '<div class="kkacc" style="border-left-color:#7c3aed;">広告ごとの明細</div>' +
        list +
        '<div class="kknote">4マスは「今 動いている広告の1日予算」を国籍×性別で合算（広告マネージャから読めた分は、公式LINEへ飛ばす広告も含む）。金額は台湾ドル（元）。</div>' +
      '</div>' +
    '</div>' + script + pscript;
}
