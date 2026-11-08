// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：cost
var COSTCSS_ =
  '  .ctwrap { max-width:640px; margin:0 auto; }' +
  '  .cbtnrow { text-align:center; margin:20px 0 4px; }' +
  '  #cgo { font-size:1.28rem; font-weight:900; padding:17px 32px; border:0; border-radius:16px;' +
  '    background:#e0533d; color:#fff; cursor:pointer; box-shadow:0 6px 18px rgba(224,83,61,.42); letter-spacing:.04em; }' +
  '  #cgo:active { transform:translateY(2px); box-shadow:0 3px 10px rgba(224,83,61,.32); }' +
  '  .costcard { background:var(--card,#fff); color:var(--ink,#0f172a); border-radius:16px; overflow:hidden;' +
  '    box-shadow:0 6px 18px rgba(0,0,0,.14); margin-top:16px; }' +
  '  .costcard.hidden { display:none; }' +
  '  .ctitle { font-size:1.18rem; font-weight:900; padding:16px 18px 4px; }' +
  '  .csub { color:var(--sub,#64748b); font-size:.86rem; padding:0 18px 10px; }' +
  '  table.ctab { width:100%; border-collapse:collapse; }' +
  '  table.ctab th { color:var(--sub,#64748b); font-size:.82rem; font-weight:700; text-align:left; padding:8px 18px; }' +
  '  table.ctab td { padding:14px 18px; text-align:left; border-top:1px solid var(--line,#e2e8f0); vertical-align:top; }' +
  '  table.ctab th.amt, table.ctab td.amt { text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }' +
  '  table.ctab td.cname { font-weight:700; }' +
  '  table.ctab .cnote { color:var(--sub,#64748b); font-size:.78rem; font-weight:400; margin-top:3px; }' +
  '  table.ctab tr.total td { border-top:2px solid var(--ink,#0f172a); font-weight:900; font-size:1.16rem;' +
  '    background:rgba(224,83,61,.09); }' +
  '  .cempty { padding:36px 22px; text-align:center; color:var(--sub,#64748b); line-height:1.8; font-size:.96rem; }';
function renderCostPage_(base, staff, dev) {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var script =
    '<script>(function(){' +
    'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
    'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
    'var slot=(idn.device||"d0").toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,32)||"default";' +
    'var b=document.getElementById("cgo"),st=document.getElementById("cstatus"),res=document.getElementById("cres");' +
    'function esc(s){return (s==null?"":String(s)).replace(/[&<>\\"\\x27]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\\x27":"&#39;"}[c];});}' +
    'function jsonp(params,onR){var cb="__ct"+Date.now()+Math.floor(Math.random()*1000);' +
    'window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
    'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
    'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();' +
    'sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
    'function fit(f){try{f.style.height="0";var h=f.contentDocument.documentElement.scrollHeight;if(h)f.style.height=(h+24)+"px";}catch(e){}}' +
    'function show(html){res.innerHTML="<iframe id=\\"cframe\\" class=\\"cframe\\" srcdoc=\\""+esc(html)+"\\"></iframe>";' +
    'var f=document.getElementById("cframe");f.addEventListener("load",function(){fit(f);});' +
    'setTimeout(function(){fit(f);},600);setTimeout(function(){fit(f);},1800);}' +
    'var polls=0;function poll(id){polls++;if(polls>LIMITS.tries("cost",700)){st.textContent="時間がかかりすぎました。もう一度試してもらえると嬉しいです🙇";b.disabled=false;return;}' +
    'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){st.textContent="エラー："+((r&&r.error)||"不明");b.disabled=false;return;}' +
    'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){poll(id);},700);return;}' +
    'b.disabled=false;' +
    'if(r.status!=="done"){st.textContent=String(r.result||"表示できませんでした。");return;}' +
    'st.textContent="受け取っています…";' +
    'jsonp({action:"data",name:"cost_"+slot+".json"},function(x){' +
    'var d=(x&&x.data)?x.data:x;' +
    'if(!d||!d.ok||!d.body_html){st.textContent="表示できませんでした："+((d&&d.error)||"内容が空です");return;}' +
    'st.textContent="";show(d.body_html);});});}' +
    'if(b){b.addEventListener("click",function(){b.disabled=true;res.innerHTML="";' +
    'st.textContent="計算しています…（少し待っててくださいね🥺）";polls=0;' +
    'jsonp({action:"submit",key:KEY,op:"cost",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({part:"cost",slot:slot})},' +
    'function(r){if(!r||!r.ok||!r.id){st.textContent="依頼を送れませんでした："+((r&&r.error)||"不明");b.disabled=false;return;}' +
    'setTimeout(function(){poll(r.id);},1000);});});}' +
    '})();</script>';
  return '<style>' + HOMECSS_ + COSTCSS_ +
      '.cframe{width:100%;border:0;background:#0b2a36;border-radius:14px;}' +
      '.cstatus{color:#eaf3f7;font-weight:800;margin:10px 4px;font-size:15px;text-align:center;}' +
    '</style>' +
    '<div class="home">' +
      backBar_(base, staff, dev) +
      '<div class="hhead"><span class="bmark">🍅</span><span class="bname">台湾トマト</span></div>' +
      '<div class="hsub" style="color:#fff;text-align:center;font-weight:700;margin:0 0 6px;letter-spacing:.06em;">売上・コスト</div>' +
      '<div class="ctwrap">' +
        '<div class="cbtnrow"><button id="cgo" type="button">月間コスト計算</button></div>' +
        '<div class="cstatus" id="cstatus">ボタンを押すと、今の数字で計算します。</div>' +
        '<div id="cres"></div>' +
      '</div>' +
    '</div>' + script;
}
