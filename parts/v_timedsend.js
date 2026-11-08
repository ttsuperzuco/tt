// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：timedsend
function renderTimedSendPage_(base, staff, dev) {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var css = '.ts{max-width:560px;margin:0 auto;padding:0 6px 48px;text-align:left;}' +
    '.tslbl{font-weight:800;margin:16px 4px 6px;font-size:16px;}' +
    '.ts textarea,.ts input[type=text],.ts input[type=date],.ts input[type=time],.ts select{' +
    'width:100%;box-sizing:border-box;font-size:17px;padding:12px;border-radius:12px;border:1px solid #cbd5e1;background:#fff;color:#123;}' +
    '.ts textarea{min-height:96px;}' +
    '.tsrow{display:flex;gap:10px;}.tsrow>div{flex:1;}' +
    '.tsmode{display:block;margin:10px 0 2px;font-size:16px;font-weight:700;}' +
    '.tssub{margin:0 0 6px 26px;}' +
    '.tsbanner{padding:10px 12px;border-radius:12px;font-weight:800;margin:6px 4px 4px;font-size:14px;}' +
    '.tsthumb{margin:8px 2px 0;}.tsthumb img{height:70px;border-radius:8px;margin:0 8px 8px 0;vertical-align:top;box-shadow:0 1px 4px rgba(0,0,0,.2);}' +
    '.tsgo{display:block;width:100%;margin:22px 0 8px;padding:18px;font-size:21px;font-weight:800;border:0;border-radius:16px;background:#0f766e;color:#fff;box-shadow:0 4px 10px rgba(0,0,0,.18);}' +
    '.tsgo:disabled{opacity:.5;}' +
    '.tsstatus{font-weight:800;min-height:0;margin:10px 4px;font-size:15px;border-radius:12px;padding:0;}.tsstatus.on{background:#fff;color:#0f172a;padding:10px 14px;box-shadow:0 2px 6px rgba(0,0,0,.12);}.tsstatus.ng{background:#7f1d1d;color:#fecaca;padding:10px 14px;}' +
    '.tsclr{font-size:13px;padding:6px 12px;border-radius:10px;border:1px solid #cbd5e1;background:#fff;margin-top:6px;}';
  var script =
  '<script>(function(){' +
  'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
  'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
  'var imgs=[],GROUPS={};' +
  'var msgEl=document.getElementById("tsmsg"),fileEl=document.getElementById("tsfile"),thumbEl=document.getElementById("tsthumb");' +
  'var dateEl=document.getElementById("tsdate"),timeEl=document.getElementById("tstime"),codesEl=document.getElementById("tscodes");' +
  'var groupEl=document.getElementById("tsgroup"),stEl=document.getElementById("tsstatus"),goEl=document.getElementById("tsgo"),banEl=document.getElementById("tsbanner");' +
  'function esc(s){return (s==null?"":String(s)).replace(/[&<>\\"\\x27]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\\x27":"&#39;"}[c];});}' +
  'function status(t,err){stEl.textContent=t;stEl.className="tsstatus"+(t?(err?" ng":" on"):"");}' +
  'function jsonp(params,onR){var cb="__ts"+Date.now()+Math.floor(Math.random()*1000);window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
  'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
  'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
  'function pushImage(name,obj){return fetch(EXEC+"?action=push&key="+KEY+"&name="+name,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(obj)});}' +
  'function rnd(){var s="timedsend_img_",c="abcdefghijklmnopqrstuvwxyz0123456789",i;for(i=0;i<12;i++)s+=c[Math.floor(Math.random()*36)];return s+".json";}' +
  'function two(n){return ("0"+n).slice(-2);}' +
  'var now=new Date();dateEl.value=now.getFullYear()+"-"+two(now.getMonth()+1)+"-"+two(now.getDate());timeEl.value=two((now.getHours()+1)%24)+":00";' +
  'function renderThumbs(){thumbEl.innerHTML=imgs.map(function(o){return "<img src=\\"data:"+o.mime+";base64,"+o.b64+"\\">";}).join("")+(imgs.length?"<div><button type=\\"button\\" class=\\"tsclr\\" id=\\"tsimgclr\\">画像を削除</button></div>":"");' +
  'var cl=document.getElementById("tsimgclr");if(cl)cl.addEventListener("click",function(){imgs=[];fileEl.value="";renderThumbs();});}' +
  'function addFiles(files){Array.prototype.slice.call(files).forEach(function(f){if(!/^image\\//.test(f.type))return;var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){var mx=1280,w=im.width,h=im.height;if(w>mx||h>mx){if(w>=h){h=Math.round(h*mx/w);w=mx;}else{w=Math.round(w*mx/h);h=mx;}}var cv=document.createElement("canvas");cv.width=w;cv.height=h;cv.getContext("2d").drawImage(im,0,0,w,h);var durl=cv.toDataURL("image/jpeg",0.82);imgs.push({b64:durl.split(",")[1],mime:"image/jpeg"});renderThumbs();};im.src=fr.result;};fr.readAsDataURL(f);});}' +
  'fileEl.addEventListener("change",function(){addFiles(fileEl.files);});' +
  'function getMode(){var r=document.querySelectorAll("input[name=tsmode]");for(var i=0;i<r.length;i++)if(r[i].checked)return r[i].value;return "person";}' +
  'function setMode(m){var r=document.querySelectorAll("input[name=tsmode]");for(var i=0;i<r.length;i++)r[i].checked=(r[i].value===m);}' +
  'codesEl.addEventListener("focus",function(){setMode("person");});' +
  'groupEl.addEventListener("focus",function(){setMode("group");});' +
  'jsonp({action:"data",name:"timedsend_groups.json"},function(d){' +
  'if(d&&d.groups){var o="";for(var i=0;i<d.groups.length;i++){GROUPS[d.groups[i].id]=d.groups[i];o+="<option value=\\""+esc(d.groups[i].id)+"\\">"+esc(d.groups[i].name)+"（"+d.groups[i].count+"人）</option>";}groupEl.innerHTML=o;}' +
  'if(d&&d.enabled===false){banEl.style.background="#f8d7da";banEl.textContent="いま送信はOFFです。自動監視でONにするまで、予約しても送られません。";}' +
  'else if(d&&d.practice){banEl.style.background="#fff3cd";banEl.textContent="いまは練習モードです。誰を選んでも、実際にはまるちゃん本人にしか送りません。";}' +
  'else if(d){banEl.style.display="none";banEl.textContent="";}});' +
  'var polls=0;function poll(id){polls++;if(polls>350){szOvHide_();goEl.disabled=false;szPopup_("エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇");return;}' +
  'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){szOvHide_();goEl.disabled=false;szPopup_("エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇");return;}' +
  'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){poll(id);},600);return;}' +
  'if(r.status!=="done"){szOvHide_();goEl.disabled=false;szPopup_(esc(r.result)||"エラーが発生しました。りゅうさんに伝えてください🙇");return;}' +
  'goEl.disabled=false;msgEl.value="";imgs=[];fileEl.value="";renderThumbs();codesEl.value="";szOvShow_(szDoneHtml_("送信を予約しました","戻る"),"#16a34a");var _b=document.getElementById("szDoneBack");if(_b){_b.addEventListener("click",function(){szOvHide_();});}});}' +
  'function go(){var msg=(msgEl.value||"").trim();if(!msg&&!imgs.length){status("文章か画像のどちらかは必要です。",true);return;}' +
  'var dv=dateEl.value,tv=timeEl.value;if(!dv||!tv){status("送信日と時刻を入力してください😊",true);return;}var send_at=dv+" "+tv;' +
  'var mode=getMode(),target;' +
  'if(mode==="person"){var codes=(codesEl.value||"").split(/[\\s,\\u3001\\uFF0C]+/).filter(Boolean);if(!codes.length){status("番号を入力してください😊 （例 M123）",true);return;}target={type:"person",codes:codes};}' +
  'else if(mode==="group"){var val=groupEl.value;if(!val){status("グループを選択してください😊",true);return;}var g=GROUPS[val];target={type:"tag",tag_id:val,tag_name:g?g.name:""};}' +
  'else if(mode==="all"){target={type:"all"};}else{target={type:"owner"};}' +
  'goEl.disabled=true;szOvShow_(szBusyHtml_("送信を予約中です","送信の予約が終わったら自動で切り替わりますので、少し待っててくださいね🥺"),"#2C7A99");' +
  'var names=[],ups=imgs.map(function(o){var n=rnd();names.push(n);return pushImage(n,o);});' +
  'Promise.all(ups).then(function(){' +
  'jsonp({action:"submit",key:KEY,op:"timed_line_send",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({message:msg,send_at:send_at,target:target,images:names})},' +
  'function(r){if(!r||!r.ok||!r.id){szOvHide_();goEl.disabled=false;szPopup_("エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇");return;}setTimeout(function(){poll(r.id);},1000);});' +
  '}).catch(function(){szOvHide_();goEl.disabled=false;szPopup_("エラーが発生しました。画像の送信でつまずきました。もう一度試してもらえると嬉しいです🙇");});}' +
  'var listEl=document.getElementById("tslist");' +
  'function drawSends(rows){if(!listEl)return;if(!rows||!rows.length){listEl.innerHTML="<div class=\\"tssub\\">（まだありません）</div>";return;}' +
  'var h="";for(var i=0;i<rows.length;i++){var r=rows[i];' +
  'h+="<div style=\\"background:#fff;color:#0f172a;border-radius:12px;padding:10px 12px;margin:8px 0;\\">"' +
  '+"<div style=\\"font-weight:800\\">"+esc(r.st)+"　"+esc(r.at)+"</div>"' +
  '+"<div style=\\"font-size:14px;margin-top:2px\\">"+esc(r.who)+"　"+esc(r.head)+(r.imgs?("　画像"+r.imgs+"枚"):"")+"</div>"' +
  '+(r.note?("<div style=\\"font-size:13px;color:#7f1d1d;margin-top:2px\\">"+esc(r.note)+"</div>"):"")' +
  '+(r.trouble?("<div style=\\"font-size:13px;color:#b45309;margin-top:2px\\">⚠ "+esc(r.trouble)+"</div>"):"")' +
  '+(r.cancelable?("<button type=\\"button\\" class=\\"tscancel\\" data-id=\\""+esc(r.id)+"\\" style=\\"margin-top:8px;font:inherit;font-weight:800;color:#fff;background:#b91c1c;border:0;border-radius:10px;padding:8px 14px;\\">取り消し</button>"):"")' +
  '+"</div>";}' +
  'listEl.innerHTML=h;' +
  'var cbs=listEl.querySelectorAll(".tscancel");for(var j=0;j<cbs.length;j++){cbs[j].addEventListener("click",function(){' +
  'var id=this.getAttribute("data-id");szPopup_("この送信を取り消しますか？😊",{cancel:true,onYes:function(){askSends("timedsend_cancel",id);}});});}}' +
  'var tsPolls=0;function pollSends(qid){tsPolls++;if(tsPolls>LIMITS.tries("timedsend_list",700)){listEl.textContent="読み込めませんでした。";return;}' +
  'jsonp({action:"status",key:KEY,id:qid},function(r){if(!r||!r.ok){listEl.textContent="読み込めませんでした。";return;}' +
  'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollSends(qid);},700);return;}' +
  'if(r.status!=="done"){listEl.textContent=String(r.result||"読み込めませんでした。");return;}' +
  'var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}' +
  'if(d.note){status(d.note,!d.ok);}' +
  'drawSends(d.sends||[]);});}' +
  'function askSends(op,id){if(listEl)listEl.textContent="読み込み中…";tsPolls=0;' +
  'jsonp({action:"submit",key:KEY,op:op,who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(id?{id:id}:{})},' +
  'function(r){if(!r||!r.ok||!r.id){if(listEl)listEl.textContent="読み込めませんでした。";return;}' +
  'setTimeout(function(){pollSends(r.id);},900);});}' +
  'askSends("timedsend_list");' +
  'goEl.addEventListener("click",go);' +
  '})();</script>';
  return '<style>' + HOMECSS_ + css + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">⏰</span><span class="bname">時間指定LINE送信</span></div>' +
    '<div class="ts">' +
      '<div class="tsbanner" id="tsbanner">読み込み中…</div>' +
      '<div class="tslbl">送る文章（画像だけ送る時は空でもOK）</div>' +
      '<textarea id="tsmsg" placeholder="お客様へのメッセージ"></textarea>' +
      '<div class="tslbl">送る画像</div>' +
      '<input type="file" id="tsfile" accept="image/*" multiple>' +
      '<div class="tsthumb" id="tsthumb"></div>' +
      '<div class="tslbl">送る日時</div>' +
      '<div class="tsrow"><div><input type="date" id="tsdate"></div><div><input type="time" id="tstime"></div></div>' +
      '<div class="tslbl">送る相手</div>' +
      '<label class="tsmode"><input type="radio" name="tsmode" value="person" checked> 個人（番号）</label>' +
      '<div class="tssub"><input type="text" id="tscodes" placeholder="M123, F45（カンマや空白で複数可）"></div>' +
      '<label class="tsmode"><input type="radio" name="tsmode" value="group"> グループ</label>' +
      '<div class="tssub"><select id="tsgroup"><option value="">（グループ一覧を読み込み中…）</option></select></div>' +
      '<label class="tsmode"><input type="radio" name="tsmode" value="all"> やり取りのある全員（多いので上限あり）</label>' +
      '<label class="tsmode"><input type="radio" name="tsmode" value="owner"> 本人（練習）</label>' +
      '<button type="button" class="tsgo" id="tsgo">この内容で登録する</button>' +
      '<div class="tsstatus" id="tsstatus">指定した時刻に、選択した相手へ自動で送信します。</div>' +
          '<div class="tslbl" style="margin-top:26px">登録した送信（新しい順）</div>' +
      '<div id="tslist">読み込み中…</div>' +
'</div>' +
  '</div>' +
  script;
}
