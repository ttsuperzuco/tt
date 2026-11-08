// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：rireki
var RIREKI_CSS_ =
  '.rk{max-width:760px;margin:0 auto;padding:6px 12px 60px;}' +
  '.ubar{display:flex;align-items:center;gap:12px;margin:0 0 4px;}' +
  '.uhome{flex:0 0 auto;font-size:.9rem;font-weight:700;color:var(--ink);text-decoration:none;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 14px;}' +
  '.uhome:active{transform:translateY(1px);}' +
  '.rksearch{display:flex;gap:8px;background:var(--bg,#2C7A99);padding:8px 0 12px;}' +
  '#rkq{flex:1;font-size:1.05rem;padding:12px 14px;border-radius:12px;border:0;}' +
  '#rkgo{font-size:1rem;font-weight:800;padding:12px 20px;border:0;border-radius:12px;background:#2563eb;color:#fff;}' +
  '.rkstatus{color:#eaf3f7;font-size:.9rem;margin:2px 2px 12px;min-height:1.2em;}' +
  '.rkcust{background:#fff;color:#0f172a;border-radius:14px;padding:14px 16px;margin-bottom:16px;box-shadow:0 5px 16px rgba(0,0,0,.15);}' +
  '.rkwho{font-size:1.15rem;font-weight:800;}' +
  '.rkcode{color:#2563eb;font-weight:800;margin-right:8px;}' +
  '.rkph{color:#64748b;font-weight:400;font-size:.86rem;margin-left:8px;}' +
  '.rkmeta{color:#64748b;font-size:.84rem;margin:4px 0 10px;}' +
  '.rksec>.rklbl{font-weight:800;font-size:.96rem;margin:12px 0 7px;padding-left:8px;border-left:4px solid #2563eb;}' +
  '.rksec.past>.rklbl{border-left-color:#94a3b8;}' +
  '.rkrec{padding:9px 0;border-top:1px dashed #e2e8f0;}' +
  '.rkdd{font-weight:800;}' +
  '.rktt{color:#64748b;font-size:.82rem;margin-left:8px;}' +
  '.rkbadge{display:inline-block;padding:1px 9px;border-radius:10px;color:#fff;font-weight:700;font-size:.78rem;}' +
  '.rkroom{display:inline-block;border:1px solid #e2e8f0;border-radius:7px;padding:1px 8px;font-size:.78rem;margin-left:6px;color:#64748b;}' +
  '.rkkind{font-size:.74rem;color:#94a3b8;margin-left:6px;}' +
  '.rkcname{font-weight:700;font-size:.9rem;margin-top:3px;}' +
  '.rktreat{margin-top:3px;font-size:.93rem;line-height:1.5;}' +
  '.rktreat.empty{color:#94a3b8;}' +
  '.rkttl{display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:.78rem;padding:3px 11px;border-radius:8px;margin-top:6px;}' +
  '.rkmemo{margin-top:5px;}' +
  '.rkmemo summary{cursor:pointer;color:#2563eb;font-size:.78rem;font-weight:700;list-style:none;}' +
  '.rkmemo summary::-webkit-details-marker{display:none;}' +
  '.rkfull{white-space:pre-wrap;word-break:break-word;margin:5px 0 0;padding:9px 11px;background:#f1f5f9;border-radius:8px;font-size:.84rem;line-height:1.5;}' +
  '.rknone{color:#94a3b8;font-size:.84rem;padding:4px 0;}' +
  '.rkpick{display:block;width:100%;text-align:left;background:#fff;color:#0f172a;border:0;border-radius:12px;padding:13px 15px;margin-bottom:10px;font-size:1rem;font-weight:700;box-shadow:0 3px 10px rgba(0,0,0,.12);}' +
  '.rkstep{color:#fff;font-weight:800;font-size:1.25rem;margin:0 2px 10px;}' +
  '.rkstep2{margin-top:28px;}' +
  '.rkkp{max-width:340px;margin:2px auto 18px;}' +
  '.rkpfx{display:flex;gap:8px;margin:2px 0 14px;}' +
  '.rkpfx button{flex:1;font-size:.9rem;font-weight:800;padding:11px 6px;border-radius:999px;border:0;background:rgba(255,255,255,.90);color:#0f172a;cursor:pointer;white-space:nowrap;transition:transform .06s,background .15s,color .15s,box-shadow .15s;}' +
  '.rkpfx button:active{transform:translateY(1px);}' +
  '.rkpfx button.on{background:#2563eb;color:#fff;box-shadow:0 5px 14px rgba(0,0,0,.28);}' +
  '.rkgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}' +
  '.rkgrid button{font-size:1.25rem;font-weight:800;padding:11px 0;border-radius:14px;border:0;background:#fff;color:#0f172a;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.16);transition:transform .06s,box-shadow .12s,background .12s;}' +
  '.rkgrid button:active{transform:translateY(2px) scale(.97);box-shadow:0 1px 4px rgba(0,0,0,.18);}' +
  '.rkgrid button.del,.rkgrid button.clr{background:#ffe6e4;color:#d1443c;}' +
  '.rkgrid button.del{font-size:1.05rem;}' +
  '.rkecho{margin:14px 0 2px;padding:14px;border-radius:14px;background:#0f2b38;color:#ffd400;font-size:2.1rem;font-weight:900;letter-spacing:.06em;text-align:center;min-height:1.4em;box-shadow:0 4px 14px rgba(0,0,0,.28);}' +
  '.rkecho.empty{background:rgba(255,255,255,.10);color:rgba(255,255,255,.5);font-weight:600;font-size:1.15rem;box-shadow:none;}' +
  '.rkgo2{display:block;width:100%;margin:12px 0 2px;font-size:1.15rem;font-weight:800;padding:15px;border:0;border-radius:14px;background:#2563eb;color:#fff;cursor:pointer;box-shadow:0 5px 14px rgba(0,0,0,.22);}' +
  '.rkgo2:active{transform:translateY(1px);}' +
  '.rkcust{background:#0d1117;color:#fff;box-shadow:0 5px 16px rgba(0,0,0,.45);}' +
  '.rkwho{font-size:1.72rem;}' +
  '.rkcode{color:#7cc0ff;}' +
  '.rkph{color:#cbd5e1;font-size:1.3rem;}' +
  '.rkmeta{color:#cbd5e1;font-size:1.26rem;}' +
  '.rksec>.rklbl{font-size:1.44rem;}' +
  '.rksec.past>.rklbl{border-left-color:#cbd5e1;}' +
  '.rkrec{border-top-color:rgba(255,255,255,.18);}' +
  '.rkdd{font-size:1.5rem;}' +
  '.rktt{color:#cbd5e1;font-size:1.23rem;}' +
  '.rkbadge{font-size:1.17rem;}' +
  '.rkroom{color:#fff;border:0;font-weight:700;padding:2px 10px;font-size:1.17rem;}' +
  '.rkmemo2{margin-top:8px;}' +
  '.rkmemo2 summary{cursor:pointer;color:#7cc0ff;font-weight:800;font-size:1.2rem;list-style:none;margin-bottom:4px;}' +
  '.rkmemo2 summary::-webkit-details-marker{display:none;}' +
  '.rkmemo2 summary::before{content:"\\25BC ";font-size:.85em;}' +
  '.rkmemo2:not([open]) summary::before{content:"\\25B6 ";}' +
  '.rkkind{color:#cbd5e1;font-size:1.11rem;}' +
  '.rkcname{font-size:1.35rem;}' +
  '.rktreat{font-size:1.4rem;}' +
  '.rktreat.empty{color:#cbd5e1;}' +
  '.rkfull{background:rgba(255,255,255,.08);color:#fff;font-size:1.26rem;}' +
  '.rknone{color:#cbd5e1;font-size:1.26rem;}' +
  '.rkpick{background:#0d1117;color:#fff;font-size:1.5rem;}' +
  '.rksec.money>.rklbl{border-left-color:#f6c945;}' +
  '.rksubh{font-weight:800;font-size:1.3rem;margin:14px 0 6px;padding-left:8px;border-left:4px solid #f6c945;}' +
  '.rkuline{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-top:1px dashed rgba(255,255,255,.18);font-size:1.3rem;}' +
  '.rkuline .un{font-weight:700;}' +
  '.rkuline .ur{color:#7cffa0;font-weight:800;white-space:nowrap;}' +
  '.rknone2{color:#cbd5e1;font-size:1.2rem;padding:3px 0;}' +
  '.rkparts{margin:6px 0 10px;display:flex;flex-wrap:wrap;gap:8px;}' +
  '.rkpchip{display:inline-block;background:rgba(124,192,255,.16);border:1px solid rgba(124,192,255,.35);color:#dbeafe;border-radius:999px;padding:3px 12px;font-size:1.2rem;font-weight:700;}' +
  '.rktotal{font-size:1.5rem;margin:2px 0 8px;}' +
  '.rktotal b{color:#ffd400;}' +
  '.rkmnote{color:#cbd5e1;font-size:1.05rem;margin-left:8px;}' +
  '.rkbuy{padding:6px 0;border-top:1px dashed rgba(255,255,255,.18);font-size:1.25rem;line-height:1.55;}' +
  '.rkbuy .bn{font-weight:800;}' +
  '.rkbuy .bp{color:#ffd400;font-weight:800;margin-left:8px;}' +
  '.rkbuy .bc{color:#cbd5e1;margin-left:6px;}' +
  '.rkbuy .bd{color:#94a3b8;font-size:1.05rem;}';
function renderRirekiPage_(base, staff, dev) {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var script =
  '<script>(function(){' +
  'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
  'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
  'var slot=(idn.device||"d0").toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,32)||"default";' +
  'var STAFFCOLOR={"\\uD83E\\uDED2":"#4b8b3b","\\uD83C\\uDF4A":"#e08a1e","\\uD83C\\uDF45":"#d1443c","\\uD83E\\uDD6D":"#c9a227"};' +
  'var RCOLOR=' + JSON.stringify(ROOM_COLORS_) + ';' +
  'var qEl=document.getElementById("rkq"),goEl=document.getElementById("rkgo"),stEl=document.getElementById("rkstatus"),resEl=document.getElementById("rkres");' +
  'function esc(s){return (s==null?"":String(s)).replace(/[&<>\\"\\x27]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\\x27":"&#39;"}[c];});}' +
  'function jsonp(params,onR){var cb="__rk"+Date.now()+Math.floor(Math.random()*1000);window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
  'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
  'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
  'function trimNote(n){if(!n)return "";var i=n.indexOf("現在進行中");if(i<0)return n;var ls=n.lastIndexOf("\\n",i);return n.slice(ls>=0?ls+1:0);}' +
  'function recHtml(r){var color=STAFFCOLOR[r.se]||"#999";' +
  'var badge=r.se?("<span class=\\"rkbadge\\" style=\\"background:"+color+"\\">"+esc(r.se)+esc(r.sn)+"</span>"):"<span class=\\"rkbadge\\" style=\\"background:#999\\">担当不明</span>";' +
  'var tspan=r.s?(esc(r.s)+(r.e?"–"+esc(r.e):"")):"";' +
  'var room=r.rm?("<span class=\\"rkroom\\" style=\\"background:"+(RCOLOR[r.rm]||"#64748b")+"\\">"+esc(r.rm)+"</span>"):"";' +
  'var nt=trimNote(r.no);' +
  'var memo=nt?("<details class=\\"rkmemo2\\" open><summary>予約メモ</summary><pre class=\\"rkfull\\">"+esc(nt)+"</pre></details>"):"<div class=\\"rktreat empty\\">（予約メモなし）</div>";' +
  'return "<div class=\\"rkrec\\"><div><span class=\\"rkdd\\">"+esc(r.d)+"（"+esc(r.w)+"）</span><span class=\\"rktt\\">"+tspan+"</span></div>"+' +
  'badge+room+memo+"</div>";}' +
  'function money_(n){return Number(n).toLocaleString("ja-JP")+"元";}' +
  'function moneyHtml_(p){' +
  'if(!p||!p.found){return "<div class=\\"rksec money\\"><div class=\\"rklbl\\">\\uD83D\\uDCB0 これまでの購入とお金</div><div class=\\"rknone\\">購入の記録がありません（昔のお客様は未整理のことがあります）。</div></div>";}' +
  'var remain=(p.courses||[]).filter(function(c){return c.remaining>0;}).map(function(c){' +
  'return "<div class=\\"rkuline\\"><span class=\\"un\\">"+esc(c.name)+"</span><span class=\\"ur\\">全"+c.total_count+"回・済"+c.used+"回・残り"+c.remaining+"回</span></div>";}).join("");' +
  'var pre=(p.prepaid||[]).map(function(c){var day=c.bought_date?("　払った日 "+esc(c.bought_date)):"";' +
  'return "<div class=\\"rkuline\\"><span class=\\"un\\">"+esc(c.name)+"</span><span class=\\"ur\\">次回分 "+c.remaining+"回分 お支払い済み"+day+"</span></div>";}).join("");' +
  'var parts=(p.parts||[]).map(function(pt){return "<span class=\\"rkpchip\\">"+esc(pt.name)+" "+pt.done+"回</span>";}).join("");' +
  'var total=(p.total_spent==null)?"記録なし":money_(p.total_spent);' +
  'var tn=p.has_missing_price?"<span class=\\"rkmnote\\">（一部は金額の記録なし）</span>":"";' +
  'var buys=(p.contracts||[]).map(function(c){var price=(c.price==null)?"金額の記録なし":money_(c.price);var cnt="";' +
  'if(c.total_count!=null){var ext=(c.extra&&c.extra>0)?(" ＋都度"+c.extra+"回 継続中"):"";cnt="（"+c.total_count+"回コース・済"+c.used+"回・残り"+c.remaining+"回）"+ext;}' +
  'else if(c.used){cnt="（済"+c.used+"回）";}' +
  'var day=c.bought_date?("　買った日 "+esc(c.bought_date)):"";' +
  'return "<div class=\\"rkbuy\\"><span class=\\"bn\\">"+esc(c.name)+"</span><span class=\\"bp\\">"+price+"</span><span class=\\"bc\\">"+cnt+"</span><span class=\\"bd\\">"+day+"</span></div>";}).join("");' +
  'var h="<div class=\\"rksec money\\"><div class=\\"rklbl\\">\\uD83D\\uDCB0 これまでの購入とお金</div>";' +
  'h+="<div class=\\"rksubh\\">未消化コース回数</div>"+(remain||"<div class=\\"rknone2\\">未消化のコースはありません</div>");' +
  'if(pre){h+="<div class=\\"rksubh\\">次回分お支払い済み</div>"+pre;}' +
  'h+="<div class=\\"rksubh\\">各施術回数合計</div><div class=\\"rkparts\\">"+(parts||"<span class=\\"rknone2\\">施術の記録なし</span>")+"</div>";' +
  'h+="<div class=\\"rksubh\\">購入履歴</div><div class=\\"rktotal\\">お支払い合計 <b>"+total+"</b>"+tn+"</div><div>"+buys+"</div>";' +
  'return h+"</div>";}' +
  'function custHtml(c){var up=[],pa=[],i;for(i=0;i<(c.recs||[]).length;i++){(c.recs[i].up?up:pa).push(c.recs[i]);}' +
  'var ph=c.ph?("<span class=\\"rkph\\">"+esc(c.ph)+"</span>"):"";' +
  'var head="<div class=\\"rkwho\\"><span class=\\"rkcode\\">"+esc(c.code)+"</span>"+esc(c.name||"（名前メモなし）")+ph+"</div>"+' +
  '"<div class=\\"rkmeta\\">来店 "+c.v+" 回 ／ 初回 "+esc(c.f)+" ／ 最終 "+esc(c.l)+"</div>";' +
  'var upB=up.length?up.map(recHtml).join(""):"<div class=\\"rknone\\">今日以降の予約はありません。</div>";' +
  'var paB=pa.length?pa.map(recHtml).join(""):"<div class=\\"rknone\\">過去の予約はありません。</div>";' +
  'return "<div class=\\"rkcust\\">"+head+moneyHtml_(c.purchase)+"<div class=\\"rksec\\"><div class=\\"rklbl\\">🔔 今回の予約（今日以降）</div>"+upB+"</div>"+' +
  '"<div class=\\"rksec past\\"><div class=\\"rklbl\\">🕘 前回までの予約一覧</div>"+paB+"</div></div>";}' +
  'function pickHtml(c){return "<button type=\\"button\\" class=\\"rkpick\\" data-code=\\""+esc(c.code)+"\\"><span class=\\"rkcode\\">"+esc(c.code)+"</span>"+esc(c.name||"（名前メモなし）")+" ・ 来店"+c.v+"回</button>";}' +
  'function toTop(){setTimeout(function(){try{stEl.scrollIntoView({behavior:"smooth",block:"start"});}catch(e){stEl.scrollIntoView();}},80);}' +
  'function render(res){if(!res||!res.ok){stEl.textContent="エラー："+((res&&res.error)||"不明");return;}' +
  'var cs=res.customers||[];if(!cs.length){stEl.textContent="一致する客が見つかりませんでした。";resEl.innerHTML="";toTop();return;}' +
  'if(res.multi){stEl.textContent=cs.length+" 人ヒット（タップで詳しく）";resEl.innerHTML=cs.map(pickHtml).join("");' +
  'var bs=resEl.querySelectorAll(".rkpick");for(var i=0;i<bs.length;i++){bs[i].addEventListener("click",function(){doSearch(this.getAttribute("data-code"));});}toTop();return;}' +
  'stEl.textContent=cs.length+" 人ヒット";resEl.innerHTML=cs.map(custHtml).join("");toTop();}' +
  'var polls=0;function poll(id){polls++;if(polls>175){stEl.textContent="時間切れです。もう一度試してもらえると嬉しいです🙇";return;}' +
  'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){stEl.textContent="エラー："+((r&&r.error)||"不明");return;}' +
  'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){poll(id);},1200);return;}' +
  'if(r.status!=="done"){stEl.textContent="検索に失敗しました："+esc(r.result||r.status);return;}' +
  'jsonp({action:"data",name:"custsearch_"+slot+".json"},function(d){render(d);});});}' +
  'function doSearch(q){q=(q||qEl.value||"").trim();if(!q){stEl.textContent="番号か氏名を入力してね😊";return;}' +
  'stEl.textContent="検索中…（数秒）";resEl.innerHTML="";polls=0;' +
  'jsonp({action:"submit",key:KEY,op:"cust_search",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({q:q,slot:slot})},' +
  'function(r){if(!r||!r.ok||!r.id){stEl.textContent="依頼を送れませんでした："+((r&&r.error)||"不明");return;}setTimeout(function(){poll(r.id);},1000);});}' +
  'goEl.addEventListener("click",function(){doSearch();});' +
  'qEl.addEventListener("keydown",function(ev){if(ev.key==="Enter")doSearch();});' +
  'var kpPrefix="M",kpDigits="",kpTimer=null;var rkechoEl=document.getElementById("rkecho");' +
  'function kpValue(){return kpPrefix+kpDigits;}' +
  'function kpEcho(){if(!rkechoEl)return;var v=kpValue();rkechoEl.textContent=v||"—";if(v){rkechoEl.classList.remove("empty");}else{rkechoEl.classList.add("empty");}}' +
  'function kpRenderPrefix(){var bs=document.querySelectorAll(".rkpfx button");for(var i=0;i<bs.length;i++){if((bs[i].getAttribute("data-pfx")||"")===kpPrefix){bs[i].classList.add("on");}else{bs[i].classList.remove("on");}}}' +
  'function kpRefresh(){kpRenderPrefix();kpEcho();}' +
  'var pfxBtns=document.querySelectorAll(".rkpfx button");for(var pi=0;pi<pfxBtns.length;pi++){pfxBtns[pi].addEventListener("click",function(){kpPrefix=this.getAttribute("data-pfx")||"";kpRefresh();});}' +
  'var gridBtns=document.querySelectorAll(".rkgrid button");for(var gi=0;gi<gridBtns.length;gi++){gridBtns[gi].addEventListener("click",function(){var d=this.getAttribute("data-d"),act=this.getAttribute("data-act");if(d!=null){kpDigits+=d;}else if(act==="del"){kpDigits=kpDigits.slice(0,-1);}else if(act==="clr"){kpDigits="";}kpRefresh();});}' +
  'kpRenderPrefix();kpEcho();' +
  'var go2El=document.getElementById("rkgo2");if(go2El){go2El.addEventListener("click",function(){doSearch(kpValue());});}' +
  '})();</script>';
  return '<style>' + HOMECSS_ + RIREKI_CSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">🔎</span><span class="bname">顧客履歴検索</span></div>' +
    '<div class="rk">' +
      '<div class="rkstep">① 検索文字を入力</div>' +
      '<div class="rksearch">' +
        '<input id="rkq" type="search" placeholder="F227 / 227 / お名前 …" autocomplete="off">' +
        '<button id="rkgo" type="button">検索</button>' +
      '</div>' +
      '<div class="rkkp">' +
        '<div class="rkstep rkstep2">② ボタンで顧客番号を検索</div>' +
        '<div class="rkpfx">' +
          '<button type="button" data-pfx="M">M（男）</button>' +
          '<button type="button" data-pfx="F">F（女）</button>' +
          '<button type="button" data-pfx="">頭文字なし</button>' +
        '</div>' +
        '<div class="rkgrid">' +
          '<button type="button" data-d="1">1</button>' +
          '<button type="button" data-d="2">2</button>' +
          '<button type="button" data-d="3">3</button>' +
          '<button type="button" data-d="4">4</button>' +
          '<button type="button" data-d="5">5</button>' +
          '<button type="button" data-d="6">6</button>' +
          '<button type="button" data-d="7">7</button>' +
          '<button type="button" data-d="8">8</button>' +
          '<button type="button" data-d="9">9</button>' +
          '<button type="button" class="del" data-act="del">&#10008;</button>' +
          '<button type="button" data-d="0">0</button>' +
          '<button type="button" class="clr" data-act="clr">C</button>' +
        '</div>' +
        '<div id="rkecho" class="rkecho empty">—</div>' +
        '<button id="rkgo2" type="button" class="rkgo2">🔎 この番号で検索</button>' +
      '</div>' +
      '<div class="rkstatus" id="rkstatus">顧客番号（例 F227・数字だけ 227 でも可）か、お名前の一部で検索。</div>' +
      '<div id="rkres"></div>' +
    '</div>' +
  '</div>' +
  script;
}
