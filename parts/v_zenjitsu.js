// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：zenjitsu
var ZENJITSUCSS_ =
  '  .zjbox { position:fixed; inset:0; z-index:90; overflow:auto; background:#2C7A99; padding:14px; }' +
  '  .zjbox-in { max-width:900px; margin:0 auto; background:#101a2b; border:1px solid #26324a;' +
  '    border-radius:14px; padding:16px; color:#e8eef7; }' +
  '  .zjbox h2 { font-size:1.5rem; font-weight:900; margin:10px 0 8px; }' +
  '  .zjbox h3 { font-size:1.25rem; font-weight:800; margin:16px 0 6px; }' +
  '  .zjback { font:inherit; font-size:1.05rem; font-weight:800; background:#fff; color:#0f172a;' +
  '    border:0; border-radius:999px; padding:10px 20px; cursor:pointer; }' +
  '  .zjnote { font-size:1rem; line-height:1.6; color:#cbd5e1; margin:8px 0; }' +
  '  .zjnote.prac { background:#3a3410; color:#f6d98f; border-radius:9px; padding:10px 12px; }' +
  '  .zjnote.real { background:#4a1414; color:#fecaca; border-radius:9px; padding:10px 12px; }' +
  '  .zjlabel { font-size:1.1rem; font-weight:800; color:#94a3b8; margin:12px 0 6px; }' +
  '  .zjinput { width:100%; box-sizing:border-box; background:#0b1220; color:#e8eef7; color-scheme:dark;' +
  '    border:2px solid #2563eb; border-radius:10px; padding:12px; font:inherit; font-size:1.3rem; font-weight:800; }' +
  '  .zjrow2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px; }' +
  '  .zjgo { font:inherit; font-size:1.15rem; font-weight:800; color:#fff; background:#0f766e;' +
  '    border:0; border-radius:10px; padding:14px 10px; cursor:pointer; margin-top:12px; width:100%; }' +
  '  .zjnow { font:inherit; font-size:1.15rem; font-weight:800; color:#fff; background:#b91c1c;' +
  '    border:0; border-radius:10px; padding:14px 10px; cursor:pointer; }' +
  '  .zjrow2 .zjgo { margin-top:0; }' +
  '  .zjlist { margin-top:14px; }' +
  '  .zjli { padding:8px 0; border-bottom:1px solid #26324a; font-size:1rem; }' +
  '  .zjpick { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:10px; margin:10px 0; }' +
  '  .zjpi { font:inherit; background:#0b1220; color:#e8eef7; border:2px solid #26324a; border-radius:12px;' +
  '    padding:10px 8px; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:6px;' +
  '    font-size:.95rem; font-weight:700; opacity:.45; }' +
  '  .zjpi.on { opacity:1; border-color:#22c55e; }' +
  '  .zjpi img { width:100%; max-width:120px; border-radius:6px; }' +
  '  .zjkikan { font-size:.85rem; font-weight:700; color:#a7f3d0; }' +
  '  .zjbigimg { width:100%; border-radius:10px; margin-top:10px; }' +
  '  .zjcase { border-top:1px solid #26324a; padding-top:10px; margin-top:14px; }' +
  '  .zjwide { display:block; width:100%; font:inherit; font-size:1.2rem; font-weight:800; color:#fff;' +
  '    background:#0f766e; border:0; border-radius:10px; padding:15px 10px; margin-top:10px; cursor:pointer; }' +
  '  .zjwide.plan { background:#7c3aed; }' +
  '  .zjtabs { display:flex; gap:8px; flex-wrap:wrap; margin:12px 0; }' +
  '  .zjtab { font:inherit; font-size:1rem; font-weight:800; color:#e8eef7; background:#0b1220;' +
  '    border:1px solid #26324a; border-radius:999px; padding:10px 18px; cursor:pointer; }' +
  '  .zjtab.on { background:#7c3aed; border-color:#7c3aed; color:#fff; }' +
  '  .zjpl { border:1px solid #26324a; border-left:4px solid #7c3aed; border-radius:10px;' +
  '    padding:12px; margin-top:10px; }' +
  '  .zjplh { display:flex; gap:8px; align-items:center; flex-wrap:wrap; font-weight:800; }' +
  '  .zjcancel { font:inherit; font-weight:800; background:#fee2e2; color:#991b1b; border:0;' +
  '    border-radius:8px; padding:8px 16px; cursor:pointer; margin-left:auto; }' +
  '  .zjcancel:disabled { opacity:.4; cursor:default; }' +
  '  .zjask { position:fixed; inset:0; z-index:95; display:flex; align-items:center; justify-content:center;' +
  '    background:rgba(0,0,0,.55); padding:16px; }' +
  '  .zjask-in { background:#101a2b; border:2px solid #7c3aed; border-radius:14px; padding:22px;' +
  '    max-width:520px; text-align:center; color:#e8eef7; }' +
  '  .zjaskmsg { font-size:1.2rem; font-weight:800; line-height:1.6; }' +
  '  .zjasksub { font-size:.95rem; font-weight:600; color:#cbd5e1; }' +
  '  .zjaskrow { display:flex; gap:12px; justify-content:center; margin-top:16px; }' +
  '  .zjaskyes { font:inherit; font-size:1.05rem; font-weight:800; color:#fff; background:#7c3aed;' +
  '    border:0; border-radius:9px; padding:12px 28px; cursor:pointer; }' +
  '  .zjaskno { font:inherit; font-size:1.05rem; font-weight:800; color:#e8eef7; background:#0b1220;' +
  '    border:1px solid #26324a; border-radius:9px; padding:12px 28px; cursor:pointer; }' +
  '  .zjallcancel { display:block; width:100%; font:inherit; font-size:1.1rem; font-weight:800;' +
  '    color:#fff; background:#b91c1c; border:0; border-radius:10px; padding:14px 10px; cursor:pointer; }' +
  '  .zjhead .bname { color:#fff; }' +
  '  .zjcard { background:#131c2e; border:1px solid #26324a; border-left:4px solid #2563eb;' +
  '    border-radius:12px; padding:16px 16px 18px; box-shadow:0 1px 3px rgba(0,0,0,.06); margin-top:6px; }' +
  '  .zjlabel { font-size:1.37rem; font-weight:800; color:#94a3b8; margin-bottom:8px; }' +
  '  .zjdatebox { display:flex; align-items:center; gap:10px; background:#0b1220; color-scheme:dark;' +
  '    border:2px solid #2563eb; border-radius:10px; padding:6px 12px 6px 6px; cursor:pointer; }' +
  '  .zjdatepick { font-size:1.8rem; line-height:1; pointer-events:none; }' +
  '  #zjdate { flex:1 1 0; min-width:0; width:auto; background:transparent; color:#e8eef7; border:0;' +
  '    padding:10px 6px; font:inherit; font-size:2rem; font-weight:900; cursor:pointer;' +
  '    font-variant-numeric:tabular-nums; letter-spacing:.02em; }' +
  '  #zjdate:focus { outline:none; }' +
  '  #zjdate::-webkit-calendar-picker-indicator { -webkit-appearance:none; appearance:none;' +
  '    display:none; opacity:0; width:0; padding:0; margin:0; border:0; }' +
  '  .zjopts { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:14px; }' +
  '  .zjopts.one { grid-template-columns:1fr; }' +
  '  .zjopt { font:inherit; font-size:1.35rem; font-weight:700; line-height:1.4; color:#fff;' +
  '    background:#2563eb; border:1px solid #2563eb; border-radius:10px; padding:16px 8px; cursor:pointer; }' +
  '  .zjopt:active { transform:translateY(1px); }' +
  '  .zjopt:disabled { opacity:.4; cursor:default; }' +
  '  @media (max-width:480px) { .zjopt { font-size:1.05rem; padding:14px 6px; } }' +
  '  .zjstatus { margin-top:12px; padding:12px 14px; border-radius:10px; font-size:1.05rem;' +
  '    font-weight:700; line-height:1.5; color:#e8eef7; }' +
  '  .zjstatus.wait { background:#fef9c3; color:#854d0e; }' +
  '  .zjstatus.ok { background:#dcfce7; color:#166534; }' +
  '  .zjstatus.err { background:#fee2e2; color:#991b1b; }' +
  '  .zjframe { width:100%; min-height:60vh; border:0; border-radius:14px; background:#161210;' +
  '    box-shadow:0 6px 18px rgba(0,0,0,.14); display:block; margin-top:12px; }' +
  '  .zjfreshbar { display:flex; justify-content:flex-end; margin:12px 2px 0; }' +
  '  .zjfreshbar[hidden] { display:none; }' +
  '  .zjfreshbtn { font:inherit; font-size:1.05rem; font-weight:800; color:#fca5a5; background:#0b1220;' +
  '    border:2px solid #f87171; border-radius:10px; padding:11px 20px; cursor:pointer; }';
function renderZenjitsuPage_(base, staff, dev) {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var script =
  '<script>(function(){' +
  'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
  'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
  'var slot=(idn.device||"d0").toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,32)||"default";' +
  'var dEl=document.getElementById("zjdate"),stEl=document.getElementById("zjstatus"),resEl=document.getElementById("zjres");' +
  'var btns=[].slice.call(document.querySelectorAll(".zjopt"));' +
  'function lock(b){btns.forEach(function(x){x.disabled=b;});}' +
  'function setSt(t,c){stEl.textContent=t;stEl.className="zjstatus "+(c||"");}' +
  'function esc(s){return (s==null?"":String(s)).replace(/[&<>\\"\\x27]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\\x27":"&#39;"}[c];});}' +
  'function jsonp(params,onR){var cb="__zj"+Date.now()+Math.floor(Math.random()*1000);window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
  'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
  'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
  'function fit(f){try{f.style.height="0";var h=f.contentDocument.documentElement.scrollHeight;if(h)f.style.height=(h+24)+"px";}catch(e){}}' +
  'var zjLastBody="";' +
  'function zjRender(html){' +
  'resEl.innerHTML="<div class=\\"zjfreshbar\\" id=\\"zjfreshbar\\" hidden><button type=\\"button\\" id=\\"zjfreshbtn\\" class=\\"zjfreshbtn\\">↩ 初期状態に戻す</button></div>"' +
  '+"<iframe id=\\"zjframe\\" class=\\"zjframe\\" srcdoc=\\""+esc(html)+"\\"></iframe>";' +
  'var fb=document.getElementById("zjfreshbtn");if(fb)fb.onclick=zjFresh;' +
  'var f=document.getElementById("zjframe");f.addEventListener("load",function(){fit(f);});' +
  'setTimeout(function(){fit(f);},600);setTimeout(function(){fit(f);},1600);setTimeout(function(){fit(f);},3200);}' +
  'function zjFreshShow(on){var b=document.getElementById("zjfreshbar");if(b)b.hidden=!on;}' +
  'function zjWipHas(st){return !!st&&((st.done||[]).length+Object.keys(st.text||{}).length)>0;}' +
  'function zjFresh(){if(!zjLastBody)return;' +
  'var b=document.createElement("div");b.className="zjask";' +
  'b.innerHTML="<div class=\\"zjask-in\\"><div class=\\"zjaskmsg\\">確認済・修正した文をすべて削除して、<br>自動作成した状態に戻します。よろしいでしょうか？😊</div>"' +
  '+"<div class=\\"zjaskrow\\"><button type=\\"button\\" class=\\"zjaskyes\\">はい、初期状態に戻す</button>"' +
  '+"<button type=\\"button\\" class=\\"zjaskno\\">やめる</button></div></div>";' +
  'document.body.appendChild(b);' +
  'b.querySelector(".zjaskno").onclick=function(){b.remove();};' +
  'b.querySelector(".zjaskyes").onclick=function(){b.remove();' +
  'var old=document.getElementById("zjrestask");if(old)old.remove();' +
  'zjClearLocal(zjCurDate);zjRender(zjLastBody);zjFreshShow(false);};}' +
  'function showResult(d){var t=ZJ.resultText(d);' +
  'setSt(t.text,t.kind);' +
  'if(!t.showBody){resEl.innerHTML="";zjLastBody="";return;}' +
  'zjLastBody=d.body_html;zjRender(zjLastBody);}' +
  'window.addEventListener("resize",function(){var f=document.getElementById("zjframe");if(f)fit(f);});' +
  'var polls=0;function poll(id){polls++;if(polls>LIMITS.tries("zenjitsu",1300)){setSt("時間切れです。もう一度試してもらえると嬉しいです🙇","err");lock(false);return;}' +
  'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){setSt("エラー："+((r&&r.error)||"不明"),"err");lock(false);return;}' +
  'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){' +
  'setSt(waitMsg+"（"+Math.round((Date.now()-startedAt)/1000)+"秒）","wait");' +
  'setTimeout(function(){poll(id);},1300);return;}' +
  'lock(false);' +
  'if(r.status!=="done"){setSt("作成に失敗しました："+esc(r.result||r.status),"err");return;}' +
  'jsonp({action:"data",name:"notice_"+slot+".json"},function(d){showResult(d);setTimeout(function(){zjAskRestore(zjCurDate);},900);});});}' +
  'var waitMsg="",startedAt=0;' +
  'function run(mode){var date=(dEl.value||"").trim();if(!date){setSt("来店日を選択してください😊","err");return;}' +
  'zjCurDate=date;' +
  'waitMsg=(mode==="unsent")?"まだ送っていない人の分を作成中…":"全員分を作成中…";startedAt=Date.now();' +
  'lock(true);setSt(waitMsg+"（通常、数十秒かかります）","wait");' +
  'resEl.innerHTML="";polls=0;' +
  'jsonp({action:"submit",key:KEY,op:"zenjitsu",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({date:date,slot:slot,mode:mode})},' +
  'function(r){if(!r||!r.ok||!r.id){setSt("依頼を送れませんでした："+((r&&r.error)||"不明"),"err");lock(false);return;}setTimeout(function(){poll(r.id);},1000);});}' +
  'var _zjd=(typeof ZJ!=="undefined")?ZJ.defaultDateISO():"";if(_zjd)dEl.value=_zjd;' +
  'var dbox=document.getElementById("zjdatebox");' +
  'if(dbox){dbox.addEventListener("click",function(){try{dEl.showPicker();}catch(e){dEl.focus();}});}' +
  'btns.forEach(function(b){b.addEventListener("click",function(){run(b.getAttribute("data-mode"));});});' +
  'zjSweepLocal();' +    
  'var _pb=document.getElementById("zjplanbtn");if(_pb)_pb.onclick=zjPlans;' +
  'var _ib=document.getElementById("zjimgsetbtn");if(_ib)_ib.onclick=zjImgSet;' +
  'function zjAsk(job,payload,onDone,onFail){' +
  'var F={job:job,payload:payload||{}};' +
  'var go=function(ft){' +
  'jsonp({action:"submit",key:KEY,op:"zenjitsu_act",who:idn.who,role:idn.role,device:idn.device,' +
  'fields:ft},function(r){' +
  'if(!r||!r.ok||!r.id){(onFail||function(){})("つながりませんでした。もう一度試してもらえると嬉しいです🙇");return;}' +
  'var n=0;(function poll(){n++;if(n>LIMITS.tries("zenjitsu_act",700)){(onFail||function(){})("時間がかかりすぎました。");return;}' +
  'jsonp({action:"status",key:KEY,id:r.id},function(s){if(!s||!s.ok){(onFail||function(){})("通信に失敗しました。");return;}' +
  'if(s.status==="pending"||s.status==="running"||s.status==="queued"||s.status===""){setTimeout(poll,700);return;}' +
  'if(s.status!=="done"){(onFail||function(){})(String(s.result||"うまくいきませんでした。"));return;}' +
  'var d=null;try{d=JSON.parse(s.result);}catch(e){d={ok:false,error:String(s.result||"")};}' +
  'if(d&&d.__bigres){jsonp({action:"data",name:d.__bigres},function(x){' +
  'var v=null;try{v=JSON.parse(x&&x.result);}catch(e){v=null;}' +
  'if(!v){(onFail||function(){})("答えを読み込めませんでした。もう一度試してもらえると嬉しいです🙇");return;}' +
  'onDone(v);});return;}' +
  'onDone(d);});})();});};' +
  'if(typeof BIG==="undefined"){go(JSON.stringify(F));return;}' +
  'BIG.prepare({exec:EXEC,key:KEY,slot:slot,op:"zenjitsu_act",tag:job,' +
  'who:idn.who,role:idn.role,device:idn.device,fields:F},go,' +
  'function(e){(onFail||function(){})(e);});}' +
  'window.addEventListener("message",function(ev){var m=ev.data||{};if(!m.zj)return;' +
  'var f=document.getElementById("zjframe");' +
  'if(m.zj==="fit"){if(f)setTimeout(function(){fit(f);},60);return;}' +
  'if(m.zj==="scrollto"){if(f)setTimeout(function(){fit(f);' +
  'try{var y=f.getBoundingClientRect().top+window.pageYOffset+(m.top||0)-12;' +
  'window.scrollTo({top:y,behavior:"smooth"});}catch(e){}},80);return;}' +
  'if(m.zj==="sendplan"){zjSendPlan(m.rows||[]);return;}' +
  'if(m.zj==="preview"){zjBigImage(m.key,m.lang);return;}' +
  'if(m.zj==="imgfix"){zjPersonImg(m.id,m.info||{});return;}' +
  'if(m.zj==="imgset"){zjImgSet();return;}' +
  'if(m.zj==="state"){zjSaveLocal(zjCurDate,m.state);zjFreshShow(zjWipHas(m.state));return;}' +
  '});' +
  'var zjRows=[];var zjCurDate="";' +
  'function zjSaveLocal(day,st){if(!day||!st)return;zjAsk("wip_save",{device:slot,date:day,state:st},function(){},function(){});}' +
  'function zjClearLocal(day){if(!day)return;zjAsk("wip_clear",{device:slot,date:day},function(){},function(){});}' +
  'function zjLoadLocal(day,onGot){zjAsk("wip_load",{device:slot,date:day},function(r){onGot((r&&r.ok)?(r.state||null):null);},function(){onGot(null);});}' +
  'function zjSweepLocal(){}' +
  'function zjAskRestore(day){zjLoadLocal(day,function(st){if(!st)return;' +
  'var n=(st.done||[]).length+Object.keys(st.text||{}).length;if(!n)return;' +
  'var b=document.createElement("div");b.className="zjask";b.id="zjrestask";' +
  'b.innerHTML="<div class=\\"zjask-in\\"><div class=\\"zjaskmsg\\">既に作業した確認済・修正済を復元しますか？😊<br>"' +
  '+"<span class=\\"zjasksub\\">（確認済 "+(st.done||[]).length+" 人分・修正した文 "+Object.keys(st.text||{}).length+" 人分）</span></div>"' +
  '+"<div class=\\"zjaskrow\\"><button type=\\"button\\" class=\\"zjaskyes\\">はい、復元する</button>"' +
  '+"<button type=\\"button\\" class=\\"zjaskno\\">いいえ、最初から始める</button></div></div>";' +
  'document.body.appendChild(b);' +
  'b.querySelector(".zjaskno").onclick=function(){b.remove();zjClearLocal(day);zjFreshShow(false);};' +
  'b.querySelector(".zjaskyes").onclick=function(){b.remove();zjFreshShow(true);' +
  'var f=document.getElementById("zjframe");' +
  'var go=function(){try{f.contentWindow.postMessage({zj:"restore",state:st},"*");}catch(e){}};' +
  'go();setTimeout(go,700);setTimeout(go,1800);};});}' +
  'function zjBox(html){var b=document.getElementById("zjbox");' +
  'if(!b){b=document.createElement("div");b.id="zjbox";b.className="zjbox";document.body.appendChild(b);}' +
  'b.innerHTML=html;b.hidden=false;window.scrollTo(0,0);return b;}' +
  'function zjBoxClose(){var b=document.getElementById("zjbox");if(b){b.hidden=true;b.innerHTML="";}}' +
  'function zjTwo(n){return (n<10?"0":"")+n;}' +
  'function zjSendPlan(rows){zjRows=rows||[];' +
  'var d=new Date();d.setDate(d.getDate()+0);' +
  'var 既定="";try{var p=(zjRows[0]&&zjRows[0].date)||"";}catch(e){}' +
  'var b=zjBox("<div class=\\"zjbox-in\\"><button type=\\"button\\" class=\\"zjback\\" id=\\"zjbk\\">← 戻る</button>"' +
  '+"<h2>📤 確認済 "+zjRows.length+" 人のお知らせの送信を設定する</h2>"' +
  '+"<div id=\\"zjmode\\" class=\\"zjnote\\">読み込んでいます…</div>"' +
  '+"<div class=\\"zjlabel\\">送る日時</div>"' +
  '+"<input type=\\"datetime-local\\" id=\\"zjat\\" class=\\"zjinput\\">"' +
  '+"<div class=\\"zjrow2\\"><button type=\\"button\\" class=\\"zjgo\\" id=\\"zjput\\">この日時で送信の予約をする</button>"' +
  '+"<button type=\\"button\\" class=\\"zjnow\\" id=\\"zjnow\\">⚡ 今すぐ送る</button></div>"' +
  '+"<div id=\\"zjmsg\\" class=\\"zjnote\\"></div>"' +
  '+"<div id=\\"zjlist\\" class=\\"zjlist\\"></div></div>");' +
  'document.getElementById("zjbk").onclick=zjBoxClose;' +
  'var now=new Date();now.setMinutes(now.getMinutes()+5);' +
  'document.getElementById("zjat").value=now.getFullYear()+"-"+zjTwo(now.getMonth()+1)+"-"+zjTwo(now.getDate())+"T"+zjTwo(now.getHours())+":"+zjTwo(now.getMinutes());' +
  'document.getElementById("zjlist").innerHTML=zjRows.map(function(r){' +
  'return "<div class=\\"zjli\\"><b>"+esc(r.time)+"</b> "+esc(r.name)+"　"+esc(r.fnum||"新規")' +
  '+"／"+esc(r.lang)+"／画像 "+((r.images||[]).length)+"枚"' +
  '+(((r.chat||"").indexOf("U")===0)?"":"　⛔LINEが分かりません")+"</div>";}).join("");' +
  'zjAsk("send_status",{},function(d){' +
  'var el=document.getElementById("zjmode");if(!el)return;' +
  'if(!d.practice){el.style.display="none";el.innerHTML="";return;}' +
  'el.style.display="";' +
  'el.innerHTML="🧪 <b>練習モードです。</b>誰を選んでも、まるちゃん本人にだけ届きます。";' +
  'el.className="zjnote prac";},function(e){});' +
  'document.getElementById("zjput").onclick=function(){zjPut(false);};' +
  'document.getElementById("zjnow").onclick=function(){zjPut(true);};}' +
  'function zjPut(sugu){' +
  'var msg=document.getElementById("zjmsg");' +
  'var at=(document.getElementById("zjat").value||"").replace("T"," ");' +
  'if(sugu){var n=new Date();n.setSeconds(n.getSeconds()-30);' +
  'at=n.getFullYear()+"-"+zjTwo(n.getMonth()+1)+"-"+zjTwo(n.getDate())+" "+zjTwo(n.getHours())+":"+zjTwo(n.getMinutes());}' +
  'if(!at){msg.textContent="⛔ 日時を指定してください😊";return;}' +
  'var 日=(zjRows[0]&&zjRows[0].date)||(document.getElementById("zjdate")||{}).value||"";' +
  'msg.textContent=sugu?"⏳ 送信しています…":"⏳ 送信の予約をしています…";' +
  'zjAsk("put_sends",{date:日,at:at,rows:zjRows,now:!!sugu},function(d){' +
  'if(!d.ok){msg.textContent="⛔ "+(d.error||"送れませんでした");return;}' +
  'if(d.put){zjClearLocal(日);zjFreshShow(false);}' +    
  'var t=sugu?("✅ "+d.put+"人に今から送信します。")' +
  ':("✅ "+d.put+"人ぶんの送信の予約を設定しました。まだ送信していません。"+at+" になったら自動で送ります。");' +
  'if(d.ng&&d.ng.length)t+="／できなかった人："+d.ng.join("／");' +
  'if(d.notes&&d.notes.length)t+="／前の続きから送ります："+d.notes.join("／");' +
  'msg.textContent=t;' +
  'if(sugu&&d.put)zjWatch(d.ids||[],d.put);' +
  '},function(e){if(String(e).indexOf("大きい依頼を預けられませんでした")===0){zjPutWakete(日,at,sugu);return;}' +
  'zjPutTashikame(日,at,e,sugu);});}' +
  'function zjTaba(rows){var out=[],cur=[];' +
  'var d={exec:EXEC,key:KEY,op:"zenjitsu_act",who:idn.who,role:idn.role,device:idn.device};' +
  'for(var i=0;i<rows.length;i++){' +
  'var t=cur.concat([rows[i]]);' +
  'var f=JSON.stringify({job:"put_sends",payload:{date:"0000-00-00",at:"0000-00-00 00:00",rows:t,now:false}});' +
  'if(cur.length&&typeof BIG!=="undefined"&&!BIG.fits(d,f)){out.push(cur);cur=[rows[i]];}' +
  'else{cur.push(rows[i]);}}' +
  'if(cur.length)out.push(cur);return out;}' +
  'function zjPutWakete(日,at,sugu){' +
  'var msg=document.getElementById("zjmsg");' +
  'var 束=zjTaba(zjRows);var i=0,put=0,ng=[],notes=[],ids=[];' +
  '(function next(){' +
  'if(i>=束.length){' +
  'if(put){zjClearLocal(日);zjFreshShow(false);}' +
  'var t=put?(sugu?("✅ "+put+"人に今から送信します。")' +
  ':("✅ "+put+"人ぶんの送信の予約を設定しました。まだ送信していません。"+at+" になったら自動で送ります。"))' +
  ':(sugu?"⛔ 全員の送信が失敗しました。":"⛔ 全員の送信の予約が失敗しました。");' +
  'if(ng.length)t+="／できなかった人："+ng.join("／");' +
  'if(notes.length)t+="／前の続きから送ります："+notes.join("／");' +
  'msg.textContent=t;' +
  'if(sugu&&put)zjWatch(ids,put);return;}' +
  'var 最後=(i===束.length-1);' +
  'msg.textContent=(sugu?"⏳ 送信しています…（":"⏳ 送信の予約をしています…（")+(i+1)+"／"+束.length+"）";' +
  'zjAsk("put_sends",{date:日,at:at,rows:束[i],now:(最後&&!!sugu)},function(d){' +
  'if(d&&d.ok){put+=(d.put||0);ng=ng.concat(d.ng||[]);notes=notes.concat(d.notes||[]);ids=ids.concat(d.ids||[]);}' +
  'else{ng.push("この分は置けませんでした（"+((d&&d.error)||"不明")+"）");}' +
  'i++;next();},function(e2){ng.push("この分は届きませんでした（"+e2+"）");i++;next();});})();}' +
  'function zjPutTashikame(日,at,理由,sugu){' +
  'var msg=document.getElementById("zjmsg");' +
  'var ボタン=sugu?"⚡ 今すぐ送る":"この日時で送信の予約をする";' +
  'msg.textContent=sugu?"⏳ 送信できたか確認しています…":"⏳ 送信の予約ができたか確認しています…";' +
  'var eids=zjRows.map(function(r){return r.id;});' +
  'zjAsk("put_check",{date:日,event_ids:eids},function(d){' +
  'if(d&&d.ok&&d.put>0){zjClearLocal(日);zjFreshShow(false);' +
  'msg.textContent=(sugu?("✅ "+d.put+"人に今から送信します。")' +
  ':("✅ "+d.put+"人ぶんの送信の予約を設定しました。まだ送信していません。"+at+" になったら自動で送ります。"))' +
  '+"「"+ボタン+"」をもう一度押さないでください😊";' +
  'if(sugu&&(d.ids||[]).length)zjWatch(d.ids,d.put);return;}' +
  'msg.textContent=(sugu?"⛔ 全員の送信が失敗しました。":"⛔ 全員の送信の予約が失敗しました。")' +
  '+"「"+ボタン+"」をもう一度押してください😊";' +
  '},function(e2){msg.textContent=(sugu?"⛔ 送信が完了したか分かりません。"' +
  ':"⛔ 送信の予約の設定が完了したか分かりません。")' +
  '+"「← 戻る」で戻り、「📨 予約送信の設定完了したお知らせ一覧」を開いてください😊'
  + 'この"+zjRows.length+"人が全員、一覧に並んでいれば"' +
  '+(sugu?"送信されています。":"送信の予約が完了しています。")' +
  '+"リストになければ、ここへ戻って「"+ボタン+"」をもう一度押してください😊";});}' +
  'function zjWatch(ids,zenbu){var msg=document.getElementById("zjmsg");var t0=Date.now();var n=0;' +
  '(function tick(){n++;if(n>80){msg.textContent="⏳ まだ送っています。一覧でご確認くださいませ🙇";return;}' +
  'zjAsk("send_progress",{ids:ids},function(s){' +
  'var 秒=Math.round((Date.now()-t0)/1000);' +
  'if(!s.ok||s.busy>0){msg.textContent="⏳ 送っています…（"+((s.done||0)+(s.ng||0))+"／"+zenbu+"人・"+秒+"秒）";setTimeout(tick,3000);return;}' +
  'var t=(s.ng?"⚠️ ":"✅ ")+s.done+"人に送りました";' +
  'if(s.ng)t+="／"+s.ng+"人は送れませんでした："+(s.msgs||[]).join("／");' +
  'msg.textContent=t;},function(e){setTimeout(tick,3000);});})();}' +
  'function zjBigImage(key,lang){' +
  'zjBox("<div class=\\"zjbox-in\\"><button type=\\"button\\" class=\\"zjback\\" id=\\"zjbk2\\">← 戻る</button>"' +
  '+"<div id=\\"zjbig\\" class=\\"zjnote\\">読み込んでいます…</div></div>");' +
  'document.getElementById("zjbk2").onclick=zjBoxClose;' +
  'zjAsk("big_image",{key:key,lang:lang||"日"},function(d){' +
  'var el=document.getElementById("zjbig");if(!el)return;' +
  'el.innerHTML=d.ok?("<h2>"+esc(d.name)+"</h2><img class=\\"zjbigimg\\" src=\\""+d.src+"\\" alt=\\"\\">")' +
  ':("⛔ "+esc(d.error||"表示できませんでした"));},function(e){' +
  'var el=document.getElementById("zjbig");if(el)el.textContent="⛔ "+e;});}' +
  'function zjPersonImg(eid,info){' +
  'zjBox("<div class=\\"zjbox-in\\"><button type=\\"button\\" class=\\"zjback\\" id=\\"zjbk3\\">← 戻る</button>"' +
  '+"<h2>🖼️ "+esc((info&&info.name)||"")+" のお知らせに添付する画像</h2>"' +
  '+"<div class=\\"zjnote\\">押して入切します。決めたら『この画像で決定』を押してください😊</div>"' +
  '+"<div id=\\"zjpick\\" class=\\"zjpick\\">読み込んでいます…</div>"' +
  '+"<button type=\\"button\\" class=\\"zjgo\\" id=\\"zjpicksave\\">この画像で決定</button></div>");' +
  'document.getElementById("zjbk3").onclick=zjBoxClose;' +
  'var 日=(info&&info.date)||"";var いま=(info&&info.keys)||[];' +
  'zjAsk("image_choices",{date:日,event_id:eid,now_keys:いま},function(d){' +
  'var el=document.getElementById("zjpick");if(!el)return;' +
  'if(!d.ok){el.textContent="⛔ "+(d.error||"読み込めませんでした");return;}' +
  'var 選=(d.now||[]).map(function(x){return x.key;});' +
  'el.innerHTML=(d.all||[]).map(function(x){' +
  'var on=選.indexOf(x.key)>=0;' +
  'return "<button type=\\"button\\" class=\\"zjpi"+(on?" on":"")+"\\" data-key=\\""+esc(x.key)+"\\">"' +
  '+(x.thumb?("<img src=\\""+x.thumb+"\\" alt=\\"\\">"):"")+"<span>"+esc(x.name)+"</span></button>";}).join("");' +
  'el.querySelectorAll(".zjpi").forEach(function(b){b.onclick=function(){b.classList.toggle("on");};});' +
  'document.getElementById("zjpicksave").onclick=function(){' +
  'var pics=[];el.querySelectorAll(".zjpi.on").forEach(function(b){' +
  'var k=b.dataset.key;var src="";var nm=k;' +
  '(d.all||[]).forEach(function(x){if(x.key===k){src=x.thumb||"";nm=x.name||k;}});' +
  'pics.push({key:k,name:nm,src:src,lang:(info&&info.lang)||"日"});});' +
  'var f=document.getElementById("zjframe");' +
  'if(f&&f.contentWindow)f.contentWindow.postMessage({zj:"setimgs",id:eid,pics:pics},"*");' +
  'zjBoxClose();};' +
  '},function(e){var el=document.getElementById("zjpick");if(el)el.textContent="⛔ "+e;});}' +
  'function zjImgSet(){' +
  'zjBox("<div class=\\"zjbox-in\\"><button type=\\"button\\" class=\\"zjback\\" id=\\"zjbk4\\">← 戻る</button>"' +
  '+"<h2>📷 画像送信セッティング</h2>"' +
  '+"<div class=\\"zjnote\\">お知らせ文のあとに、この順番で画像を送信します。送信したくない画像は「送る」をオフにしてください😊</div>"' +
  '+"<div id=\\"zjcases\\">読み込んでいます…</div>"' +
  '+"<button type=\\"button\\" class=\\"zjgo\\" id=\\"zjcasesave\\">この内容で保存</button>"' +
  '+"<div id=\\"zjcasemsg\\" class=\\"zjnote\\"></div></div>");' +
  'document.getElementById("zjbk4").onclick=zjBoxClose;' +
  'zjAsk("image_settings",{},function(d){' +
  'var el=document.getElementById("zjcases");if(!el)return;' +
  'if(!d.ok){el.textContent="⛔ "+(d.error||"読み込めませんでした");return;}' +
  'el.innerHTML=(d.cases||[]).map(function(c){' +
  'var items=(c.items||[]).map(function(it,i){' +
  'return "<button type=\\"button\\" class=\\"zjpi"+(it.on!==false?" on":"")+"\\" data-case=\\""+esc(c.key)+"\\" data-key=\\""+esc(it.key)+"\\">"' +
  '+(it.ja_thumb?("<img src=\\""+it.ja_thumb+"\\" alt=\\"\\">"):"")+"<span>"+(i+1)+". "+esc(it.name)+"</span>"' +
  '+(it.kikan?("<span class=\\"zjkikan\\">📅 "+esc(it.kikan)+"</span>"):"")+"</button>";}).join("");' +
  'return "<div class=\\"zjcase\\"><h3>"+esc(c.no+" "+c.name)+"</h3><div class=\\"zjnote\\">"+esc(c.note||"")+"</div>"' +
  '+"<div class=\\"zjpick\\">"+(items||"（送る画像はありません）")+"</div></div>";}).join("");' +
  'el.querySelectorAll(".zjpi").forEach(function(b){b.onclick=function(){b.classList.toggle("on");};});' +
  'document.getElementById("zjcasesave").onclick=function(){' +
  'var picked={};(d.cases||[]).forEach(function(c){picked[c.key]=[];});' +
  'el.querySelectorAll(".zjpi.on").forEach(function(b){picked[b.dataset.case].push(b.dataset.key);});' +
  'var m=document.getElementById("zjcasemsg");m.textContent="保存しています…";' +
  'zjAsk("save_image_settings",{picked:picked},function(r){' +
  'm.textContent=r.ok?"✅ 保存しました":("⛔ "+(r.error||"保存できませんでした"));},' +
  'function(e){m.textContent="⛔ "+e;});};' +
  '},function(e){var el=document.getElementById("zjcases");if(el)el.textContent="⛔ "+e;});}' +
  'var zjPlanDay="";' +
  'function zjPlans(){' +
  'zjBox("<div class=\\"zjbox-in\\"><button type=\\"button\\" class=\\"zjback\\" id=\\"zjbk5\\">← 戻る</button>"' +
  '+"<h2>📨 予約送信の設定完了したお知らせ一覧</h2>"' +
  '+"<div class=\\"zjnote\\">設定時刻に自動で送信されます。未送信分は取り消せます。</div>"' +
  '+"<div id=\\"zjplmsg\\" class=\\"zjnote\\"></div>"' +
  '+"<div id=\\"zjpltabs\\" class=\\"zjtabs\\"></div>"' +
  '+"<button type=\\"button\\" class=\\"zjallcancel\\" id=\\"zjplall\\" hidden></button>"' +
  '+"<div id=\\"zjpllist\\">読み込んでいます…</div></div>");' +
  'document.getElementById("zjbk5").onclick=zjBoxClose;' +
  'zjPlansDraw();}' +
  'function zjPlansDraw(){' +
  'var box=document.getElementById("zjpllist");if(!box)return;' +
  'zjAsk("sent_plans",{},function(d){' +
  'if(!d.ok){box.textContent="⛔ 読み込めませんでした";return;}' +
  'var rows=d.rows||[];' +
  'if(!rows.length){document.getElementById("zjpltabs").innerHTML="";' +
  'document.getElementById("zjplall").hidden=true;' +
  'box.textContent="現在、送信が設定されたお知らせはありません";return;}' +
  'var 曜=["日","月","火","水","木","金","土"];' +
  'var days=[];rows.forEach(function(x){if(days.indexOf(x.send_day)<0)days.push(x.send_day);});' +
  'if(!zjPlanDay||days.indexOf(zjPlanDay)<0)zjPlanDay=days[0];' +
  'var 名=function(s){var p=s.split("-");return (+p[1])+"/"+(+p[2])+"（"+曜[new Date(+p[0],+p[1]-1,+p[2]).getDay()]+"）送信分";};' +
  'document.getElementById("zjpltabs").innerHTML=days.map(function(dd){' +
  'return "<button type=\\"button\\" class=\\"zjtab"+(dd===zjPlanDay?" on":"")+"\\" data-day=\\""+dd+"\\">"' +
  '+名(dd)+" "+rows.filter(function(x){return x.send_day===dd;}).length+"</button>";}).join("");' +
  'document.getElementById("zjpltabs").querySelectorAll(".zjtab").forEach(function(b){' +
  'b.onclick=function(){zjPlanDay=b.dataset.day;zjPlansDraw();};});' +
  'var 未=rows.filter(function(x){return x.send_day===zjPlanDay&&x.status==="pending";});' +
  'var ac=document.getElementById("zjplall");' +
  'ac.hidden=(未.length===0);ac.textContent="🚫 全ての送信予約を取り消す（"+未.length+"件）";' +
  'ac.onclick=function(){zjCancelMany(未);};' +
  'box.innerHTML=rows.filter(function(x){return x.send_day===zjPlanDay;}).map(function(x){' +
  'return "<div class=\\"zjpl\\"><div class=\\"zjplh\\">"+esc(x.send_at)+"　"+esc(x.name)+"　"' +
  '+esc(x.fnum||"新規")+"　"+esc(x.status_ja)' +
  '+"<button type=\\"button\\" class=\\"zjcancel\\" data-id=\\""+esc(x.id)+"\\""+(x.can_cancel?"":" disabled")+">"+esc(x.cancel_label||"取り消す")+"</button></div>"' +
  '+"<div class=\\"zjnote\\">"+esc(x.date)+" ご来店分／画像 "+x.images+"枚"+((x.img_names&&x.img_names.length)?("："+esc(x.img_names.join("／"))):"")+(x.note?("　"+esc(x.note)):"")+"</div>"' +
  '+(x.warn?("<div class=\\"zjnote real\\">⚠️ "+esc(x.warn)+"</div>"):"")+"</div>";}).join("");' +
  'box.querySelectorAll(".zjcancel").forEach(function(b){if(b.disabled)return;' +
  'b.onclick=function(){var もとの文字=b.textContent;b.disabled=true;b.textContent="削除しています…";' +
  'zjAsk("cancel_plan",{id:b.dataset.id},function(r){' +
  'document.getElementById("zjplmsg").textContent=r.ok?"✅ 削除しました":("⛔ "+(r.error||""));' +
  'zjPlansDraw();},function(e){b.disabled=false;b.textContent=もとの文字;});};});' +
  '},function(e){box.textContent="⛔ "+e;});}' +
  'function zjCancelMany(list){' +
  'var m=document.getElementById("zjplmsg");var i=0;' +
  '(function next(){if(i>=list.length){m.textContent="✅ "+list.length+"件を取り消しました";zjPlansDraw();return;}' +
  'm.textContent="取り消しています…（"+(i+1)+"／"+list.length+"）";' +
  'zjAsk("cancel_plan",{id:list[i].id},function(){i++;next();},function(){i++;next();});})();}' +
  '})();</script>';
  return '<style>' + HOMECSS_ + ZENJITSUCSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead zjhead"><span class="bmark">🔔</span><span class="bname">前日お知らせ</span></div>' +
    '<div class="zjcard">' +
      '<div class="zjlabel">日付を選ぶ</div>' +
      '<div class="zjdatebox" id="zjdatebox">' +
        '<input type="date" id="zjdate">' +
        '<span class="zjdatepick">📅</span>' +
      '</div>' +
      '<div class="zjopts' + (ZJ.optionsShown(dev).unsent ? '' : ' one') + '">' +
        '<button type="button" class="zjopt" data-mode="all">全員分を作成</button>' +
        (ZJ.optionsShown(dev).unsent ? '<button type="button" class="zjopt" data-mode="unsent">未送信の分だけ作成</button>' : '') +
      '</div>' +
      '<div class="zjstatus" id="zjstatus">' + ZJ.optionsShown(dev).hint + '</div>' +
      '<button type="button" class="zjwide plan" id="zjplanbtn">📨 予約送信の設定完了したお知らせ一覧</button>' +
      '<button type="button" class="zjwide" id="zjimgsetbtn">📷 画像送信セッティング</button>' +
    '</div>' +
    '<div id="zjres"></div>' +
  '</div>' + script;
}
