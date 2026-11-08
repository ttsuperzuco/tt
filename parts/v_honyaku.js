// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：honyaku
function renderHonyakuPage_(base, staff, dev) {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var css = '.hy{max-width:560px;margin:0 auto;padding:0 6px 48px;text-align:left;}' +
    '.hylbl{font-weight:800;margin:16px 4px 6px;font-size:16px;}' +
    '.hy textarea{width:100%;box-sizing:border-box;font-size:17px;padding:12px;border-radius:12px;' +
    'border:1px solid #cbd5e1;background:#fff;color:#123;min-height:120px;}' +
    '.hygo{display:block;width:100%;margin:18px 0 8px;padding:18px;font-size:21px;font-weight:800;' +
    'border:0;border-radius:16px;background:#0f766e;color:#fff;box-shadow:0 4px 10px rgba(0,0,0,.18);}' +
    '.hygo:disabled{opacity:.5;}' +
    '.hystatus{font-weight:800;margin:10px 4px;font-size:15px;}' +
    '.hystatus.err{color:#ff9b9b;}.hystatus.wait{color:#eaf3f7;}.hystatus.ok{color:#86efac;}' +
    '.hyseg{display:flex;gap:8px;margin:4px 4px 0;}' +
    '.hyseg button{flex:1;padding:12px;border:0;border-radius:12px;font-weight:800;font-size:15px;' +
    'background:rgba(255,255,255,.16);color:#eaf3f7;}' +
    '.hyseg button.sel{background:#2C7A99;color:#fff;}' +
    '.hysub{display:block;width:100%;margin:10px 0 4px;padding:12px;font-size:16px;font-weight:800;' +
    'border:0;border-radius:12px;background:rgba(255,255,255,.16);color:#eaf3f7;}' +
    '.hysub:disabled{opacity:.5;}' +
    '.hyrow{display:flex;gap:8px;}' +
    '.hyrow input{flex:1;box-sizing:border-box;font-size:16px;padding:12px;border-radius:12px;' +
    'border:1px solid #cbd5e1;background:#fff;color:#123;}';
  var script =
  '<script>(function(){' +
  'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
  'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
  'var srcEl=document.getElementById("hysrc"),dstEl=document.getElementById("hydst");' +
  'var goEl=document.getElementById("hygo"),stEl=document.getElementById("hystatus");' +
  'var gender="共通";' +
  'function setSt(t,c){stEl.textContent=t;stEl.className="hystatus "+(c||"");}' +
  'function jsonp(params,onR){var cb="__hy"+Date.now()+Math.floor(Math.random()*1000);' +
  'window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
  'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
  'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();' +
  'sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
  'var segs=[].slice.call(document.querySelectorAll(".hyseg button"));' +
  'segs.forEach(function(b){b.addEventListener("click",function(){' +
  'gender=b.getAttribute("data-g");segs.forEach(function(x){x.classList.remove("sel");});b.classList.add("sel");});});' +
  'var polls=0;function poll(id){polls++;if(polls>LIMITS.tries("translate",700)){setSt("時間がかかりすぎました。もう一度試してもらえると嬉しいです🙇","err");goEl.disabled=false;return;}' +
  'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){setSt("エラー："+((r&&r.error)||"不明"),"err");goEl.disabled=false;return;}' +
  'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setSt("訳しています…（少し待っててくださいね🥺）","wait");setTimeout(function(){poll(id);},700);return;}' +
  'goEl.disabled=false;' +
  'if(r.status!=="done"){setSt(String(r.result||"訳せませんでした。"),"err");return;}' +
  'dstEl.value=String(r.result||"");setSt("訳しました（なぞってコピーできます）","ok");});}' +
  'function go(){var t=(srcEl.value||"").trim();if(!t){setSt("日本語を入力してください😊","err");return;}' +
  'goEl.disabled=true;dstEl.value="";setSt("訳しています…（少し待っててくださいね🥺）","wait");' +
  'jsonp({action:"submit",key:KEY,op:"translate",who:idn.who,role:idn.role,device:idn.device,' +
  'fields:JSON.stringify({text:t,gender:gender,quality:"1"})},' +
  'function(r){if(!r||!r.ok||!r.id){setSt("依頼を送れませんでした："+((r&&r.error)||"不明"),"err");goEl.disabled=false;return;}' +
  'polls=0;setTimeout(function(){poll(r.id);},1000);});}' +
  'goEl.addEventListener("click",go);' +
  'var remEl=document.getElementById("hyrem"),termEl=document.getElementById("hyterm");' +
  'var tjaEl=document.getElementById("hytja"),tzhEl=document.getElementById("hytzh");' +
  'var sPolls=0;function pollSub(id,btn){sPolls++;if(sPolls>LIMITS.tries("translate",600)){setSt("時間がかかりすぎました。","err");btn.disabled=false;return;}' +
  'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){setSt("エラー："+((r&&r.error)||"不明"),"err");btn.disabled=false;return;}' +
  'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollSub(id,btn);},600);return;}' +
  'btn.disabled=false;setSt(String(r.result||""),(r.status==="done")?"ok":"err");});}' +
  'function ask(fields,btn){btn.disabled=true;setSt("伝えています…","wait");sPolls=0;' +
  'jsonp({action:"submit",key:KEY,op:"translate",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(fields)},' +
  'function(r){if(!r||!r.ok||!r.id){setSt("依頼を送れませんでした。","err");btn.disabled=false;return;}' +
  'setTimeout(function(){pollSub(r.id,btn);},900);});}' +
  'if(remEl){remEl.addEventListener("click",function(){' +
  'var t=(srcEl.value||"").trim(),d=(dstEl.value||"").trim();' +
  'if(!t||!d){setSt("日本語と、登録したい中国語の両方を入力してください😊","err");return;}' +
  'ask({text:t,gender:gender,remember:d},remEl);});}' +
  'if(termEl){termEl.addEventListener("click",function(){' +
  'var a=(tjaEl.value||"").trim(),b=(tzhEl.value||"").trim();' +
  'if(!a||!b){setSt("日本語と中国語の両方を入力してください😊","err");return;}' +
  'ask({text:a,gender:gender,term_ja:a,term_zh:b},termEl);});}' +
  '})();</script>';
  return '<style>' + HOMECSS_ + css + '</style>' +
    '<div class="home">' + backBar_(base, staff, dev) +
    '<h2 class="htitle">翻訳（日本語 → 台湾中国語）</h2>' +
    '<div class="hy">' +
      '<div class="hylbl">お客様（訳し分け）</div>' +
      '<div class="hyseg">' +
        '<button type="button" data-g="共通" class="sel">共通</button>' +
        '<button type="button" data-g="女">女性</button>' +
        '<button type="button" data-g="男">男性</button>' +
      '</div>' +
      '<div class="hylbl">日本語（ここに貼る）</div>' +
      '<textarea id="hysrc" placeholder="配信したい日本語をそのまま貼り付けてください😊"></textarea>' +
      '<button type="button" class="hygo" id="hygo">訳す</button>' +
      '<div class="hystatus" id="hystatus">日本語を入力して「訳す」を押してください😊</div>' +
      '<div class="hylbl">台湾中国語（選択してコピー・修正できます）</div>' +
      '<textarea id="hydst" placeholder=""></textarea>' +
      '<button type="button" class="hysub" id="hyrem">この訳で覚える</button>' +
      '<div class="hylbl" style="margin-top:22px">用語を登録（次の翻訳から効きます）</div>' +
      '<div class="hyrow">' +
        '<input type="text" id="hytja" placeholder="日本語（例 プロセル）">' +
        '<input type="text" id="hytzh" placeholder="中国語（例 Procell）">' +
      '</div>' +
      '<button type="button" class="hysub" id="hyterm">用語を登録</button>' +
    '</div>' +
  '</div>' + script;
}
