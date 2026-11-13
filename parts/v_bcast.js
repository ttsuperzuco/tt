// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：bcast
function renderBroadcastPage_(base, staff, dev) {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var css =
    '.uhome{background:#131C2E;border:1px solid #26324A;color:#E8EEF7;border-radius:10px;' +
    'padding:10px 14px;font-size:.9rem;font-weight:700;box-shadow:none;}' +
    '.bc{max-width:560px;margin:0 auto;width:100%;box-sizing:border-box;' +
    'padding:0 4px 44px;text-align:left;}' +
    '.bcbanner{padding:11px 14px;border-radius:12px;font-weight:800;margin:4px 0 12px;' +
    'font-size:14px;color:#0f172a;line-height:1.5;}' +
    '.bctop{display:flex;align-items:center;gap:10px;margin:0 2px 10px;flex-wrap:wrap;}' +
    '.bctop .lb{font-size:13px;color:#B9CCDA;font-weight:700;}' +
    '.bctop b{background:#131C2E;border:1px solid #26324A;color:#E8EEF7;border-radius:999px;' +
    'padding:7px 15px;font-size:14.5px;font-weight:800;}' +
    '.bctop .no{margin-left:auto;font-size:13px;color:#B9CCDA;font-weight:800;}' +
    '.bcmake{display:block;width:100%;margin:0 0 14px;padding:15px;font-size:17px;font-weight:800;' +
    'border:0;border-radius:12px;background:#D97706;color:#fff;box-shadow:0 3px 10px rgba(0,0,0,.22);}' +
    '.bctxt{display:block;width:100%;margin:0 0 14px;padding:15px;font-size:17px;font-weight:800;' +
    'border:0;border-radius:12px;background:#7C3AED;color:#fff;box-shadow:0 3px 10px rgba(0,0,0,.22);}' +
    '.bckind{display:block;width:100%;margin:0 0 14px;padding:22px;font-size:19px;' +
    'font-weight:800;border:0;border-radius:12px;background:#2563EB;color:#fff;' +
    'box-shadow:0 3px 10px rgba(0,0,0,.22);}' +
    '.bcsplit{display:flex;align-items:center;gap:7px;font-size:14px;font-weight:800;' +
    'color:#E8EEF7;white-space:nowrap;cursor:pointer;}' +
    '.bcsplit input{width:19px;height:19px;accent-color:#2563EB;cursor:pointer;}' +
    '.bcsplitb{flex:0 0 auto;padding:9px 14px;font-size:14px;font-weight:800;border:0;border-radius:10px;' +
    'background:#2563EB;color:#fff;white-space:nowrap;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.25);}' +
    '.bcper{display:grid;grid-template-columns:1fr 1fr;gap:10px;}' +
    '.bcper button{padding:16px 8px;font-size:16px;font-weight:800;border:0;border-radius:12px;' +
    'background:#2563EB;color:#fff;}' +
    '.bcper button:disabled{background:#0B1220;color:#5B6B85;}' +
    '.bcper button.bcon,.bcper button.bcon:disabled{background:#16A34A;color:#fff;' +
    'box-shadow:0 0 0 3px #fff inset;}' +
    '.bcper button.bcon::before{content:"✓ ";}' +
    '.bcper button.bcrestore{grid-column:1 / -1;background:#7C3AED;}' +
    '.bcper button.bcwide2{grid-column:1 / -1;}' +
    '.bcnovio{grid-column:1 / -1;display:flex;align-items:center;justify-content:center;gap:12px;' +
    'padding:12px 0 6px;font-size:21px;font-weight:800;color:#E8EEF7;cursor:pointer;}' +
    '.bcnovio input{width:30px;height:30px;accent-color:#2563EB;cursor:pointer;flex:none;}' +
    '.bcrestout{display:block;width:100%;margin:14px 0 0;padding:16px 8px;font-size:16px;font-weight:800;' +
    'border:0;border-radius:12px;background:#7C3AED;color:#fff;box-shadow:0 3px 10px rgba(0,0,0,.22);}' +
    '.bcrestout:disabled{background:#0B1220;color:#5B6B85;}' +
    '.bcper button.bcrestore:disabled{background:#0B1220;color:#5B6B85;}' +
    '.bccard.bcwide{margin-left:-22px;margin-right:-22px;padding:14px 9px 16px;}' +
    '.bc textarea.bcmtx{min-height:200px;font-size:16px;line-height:1.8;padding:9px;}' +
    '.bcstop{display:flex;align-items:baseline;gap:10px;margin:0 0 12px;}' +
    '.bcsttl{font-size:22px;font-weight:900;color:#fff;}' +
    '.bcstopbtn{display:block;width:100%;margin:12px 0;padding:15px;font-size:17px;font-weight:800;border:0;border-radius:12px;' +
    'background:#DC2626;color:#fff;box-shadow:0 3px 10px rgba(0,0,0,.25);cursor:pointer;}' +
    '.bcstopbtn:disabled{background:#64748B;color:#E2E8F0;box-shadow:none;cursor:default;}' +
    '.bcsubnote{font-size:13.5px;font-weight:700;color:#DCEAF2;margin:-6px 0 12px;}' +
    '.bcsno{margin-left:auto;font-size:13px;font-weight:800;color:#DCE7F2;}' +
    '#bcreload{margin-left:auto;align-self:center;padding:9px 18px;font-size:14px;font-weight:800;}' +
    '.bcagain{margin:0 0 12px;text-align:left;}' +
    '.bcagainbtn{font:inherit;font-size:13px;font-weight:800;color:#cbd5e1;background:#131C2E;' +
    'border:1px solid #26324A;border-radius:999px;padding:9px 15px;}' +
    '.bcsame{background:#0B1220;border:1px solid #7C3AED;color:#E8EEF7;border-radius:10px;' +
    'padding:12px 14px;font-size:15px;font-weight:800;margin:0 0 16px;' +
    'display:flex;align-items:center;justify-content:space-between;gap:12px;}' +
    '.bcsame.bckage{visibility:hidden;background:transparent;border-color:transparent;}' +
    '.bcout{background:#0B1220;border:1px solid #26324A;border-radius:10px;padding:11px 12px;margin:0 0 10px;}' +
    '.bcouth{display:flex;align-items:center;gap:10px;margin:0 0 8px;}' +
    '.bcouth b{flex:1;font-size:15px;font-weight:800;color:#E8EEF7;}' +
    '.bccopy{border:0;border-radius:9px;padding:9px 15px;font-size:13px;font-weight:800;' +
    'background:#2563EB;color:#fff;white-space:nowrap;}' +
    '.bcouttx{white-space:pre-wrap;font-size:14px;line-height:1.75;color:#E8EEF7;}' +
    '.bc .bcbub{display:table;max-width:100%;box-sizing:content-box;background:#9CE594;color:#111827;border-radius:18px;' +
    'padding:10px 14px;margin:0 0 14px;font-size:16px;line-height:1.55;white-space:pre;' +
    'font-family:-apple-system,"Hiragino Sans","Noto Sans JP","Noto Sans TC",sans-serif;}' +
    '.bcbubcap{font-size:12px;color:#94A3B8;margin:13px 0 5px;}' +
    '.bc textarea.bcotx{min-height:120px;line-height:1.9;padding:9px;' +
    'overflow-y:hidden;resize:none;white-space:pre;}' +
    '.bcnum{font-size:12px;font-weight:800;color:#94A3B8;margin-top:7px;}' +
    '.bcnum.over{color:#fca5a5;}' +
    '.bcask{position:fixed;inset:0;z-index:95;display:flex;align-items:center;justify-content:center;' +
    'background:rgba(8,14,26,.72);padding:18px;}' +
    '.bcask-in{background:#101a2b;border:2px solid #7c3aed;border-radius:14px;padding:22px;' +
    'max-width:520px;text-align:center;color:#E8EEF7;}' +
    '.bcaskmsg{font-size:1.2rem;font-weight:800;line-height:1.6;}' +
    '.bcaskrow{display:flex;gap:12px;justify-content:center;margin-top:16px;flex-wrap:wrap;}' +
    '.bcaskyes{font:inherit;font-size:1.05rem;font-weight:800;color:#fff;background:#7c3aed;' +
    'border:0;border-radius:12px;padding:13px 20px;}' +
    '.bcaskno{font:inherit;font-size:1.05rem;font-weight:800;color:#e8eef7;background:#0b1220;' +
    'border:1px solid #26324A;border-radius:12px;padding:13px 20px;}' +
    '.bcfreshbar{margin:0 0 12px;text-align:right;}' +
    '.bcfreshbtn{font:inherit;font-size:13px;font-weight:800;color:#cbd5e1;background:#131C2E;' +
    'border:1px solid #26324A;border-radius:999px;padding:9px 15px;}' +
    '.bccard{background:#131C2E;border-radius:12px;padding:16px 16px 18px;margin:0 0 12px;' +
    'box-shadow:0 1px 3px rgba(0,0,0,.06);color:#E8EEF7;}' +
    '.bcname{font-size:26px;font-weight:900;line-height:1.25;}' +
    '.bcwho{font-size:13px;color:#94A3B8;margin-top:6px;line-height:1.5;}' +
    '.bchr{border-top:1px solid #26324A;margin:14px 0 12px;}' +
    '.bcpart{display:flex;align-items:center;gap:10px;background:#0B1220;border-radius:10px;' +
    'padding:9px 10px;margin:0 0 8px;}' +
    '.bcpart img{width:42px;height:42px;object-fit:cover;border-radius:8px;flex:0 0 auto;}' +
    '.bcpno{background:#26324A;color:#E8EEF7;border-radius:999px;padding:5px 10px;' +
    'font-size:12px;font-weight:800;white-space:nowrap;flex:0 0 auto;}' +
    '.bcptx{flex:1 1 110px;min-width:0;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
    '.bcpart{flex-wrap:wrap;}' +
    '.bcpbtns{display:flex;gap:6px;margin-left:auto;flex-wrap:wrap;justify-content:flex-end;}' +
    '.bcseetx{background:#0B1220;border-radius:10px;padding:12px 14px;margin-top:6px;}' +
    '.bcpvtx{white-space:pre-wrap;word-break:break-word;background:#fff;color:#111827;border-radius:12px;' +
    'padding:12px 14px;font-size:15px;line-height:1.7;margin:0 0 14px;}' +
    '.bc img.bcpvimg{display:block;width:auto;max-width:100%;max-height:420px;border-radius:10px;margin:0 0 14px;cursor:zoom-in;}' +
    '.bctab{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 14px;}' +
    '.bctab button{border:1px solid #26324A;background:#131C2E;color:#9FB3C8;' +
    'border-radius:12px;padding:13px;font-size:16px;font-weight:800;cursor:pointer;}' +
    '.bctab button.on{background:#2563EB;color:#fff;border-color:#2563EB;}' +
    '.bcnamerow{display:flex;align-items:center;gap:10px;}' +
    '.bcnamerow .bcname{flex:1;min-width:0;}' +
    '.bctaglist{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 4px;}' +
    '.bctaglist button{border:1px solid #26324A;background:#131C2E;color:#E8EEF7;' +
    'border-radius:999px;padding:9px 13px;font-size:14px;font-weight:800;cursor:pointer;}' +
    '.bctaglist button.on{background:#16A34A;color:#fff;border-color:#16A34A;}' +
    '.bctaglist.bcx button.on{background:#DC2626;border-color:#DC2626;}' +
    '.bcwho .bcxw{color:#FCA5A5;font-weight:800;}' +
    '.bcmv{border:1px solid #26324A;background:#131C2E;color:#E8EEF7;border-radius:9px;' +
    'padding:6px 9px;font-size:13px;font-weight:800;flex:0 0 auto;cursor:pointer;}' +
    '.bcdel{border:1px solid #7f1d1d;background:#2a1214;color:#fca5a5;border-radius:9px;' +
    'padding:7px 11px;font-size:12.5px;font-weight:800;flex:0 0 auto;}' +
    '.bcempty{font-size:14px;color:#94A3B8;padding:2px 0 4px;}' +
    '.bcleft{font-size:13px;color:#94A3B8;font-weight:700;margin:0 0 8px;}' +
    '.bcadd{display:flex;gap:10px;}' +
    '.bcaddslot{display:flex;align-items:center;gap:8px;flex-wrap:wrap;border:2px dashed #3B4A66;border-radius:10px;' +
    'padding:9px 10px;margin:0 0 8px;}' +
    '.bcaddslot button{flex:1 1 120px;padding:13px 8px;font-size:15.5px;font-weight:800;border:0;border-radius:10px;' +
    'background:#2563EB;color:#fff;cursor:pointer;}' +
    '.bcadd button{flex:1;padding:16px 8px;font-size:16.5px;font-weight:800;border:0;' +
    'border-radius:12px;background:#2563EB;color:#fff;}' +
    '.bcadd button:disabled{background:#26324A;color:#94A3B8;}' +
    '.bcgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}' +
    '.bcpick{background:#0B1220;border:1px solid #26324A;border-radius:12px;padding:8px;text-align:center;position:relative;}' +
    '.bcpick .sel{display:block;width:100%;border:0;background:transparent;padding:0;}' +
    '.bczoom{display:block;width:100%;margin-top:6px;border:1px solid #26324A;background:#131C2E;' +
    'color:#B9CCDA;border-radius:9px;padding:7px 4px;font-size:12px;font-weight:800;}' +
    '.bcpick.new{border-color:#D97706;}' +
    '.bcpick img{width:100%;border-radius:8px;display:block;}' +
    '.bcpick span{display:block;font-size:12.5px;font-weight:800;color:#E8EEF7;margin-top:7px;}' +
    '.bc input[type=file]{color:#E8EEF7;font-size:13px;}' +
    '.bc textarea,.bc input[type=date],.bc input[type=time],.bc select{width:100%;box-sizing:border-box;' +
    'font-size:16.5px;padding:12px;border-radius:10px;border:1px solid #26324A;background:#fff;color:#0f172a;}' +
    '.bc textarea{min-height:150px;line-height:1.6;}' +
    '.bccount{font-size:13px;font-weight:800;margin:8px 2px 10px;color:#94A3B8;}' +
    '.bccount.over{color:#fca5a5;}' +
    '.bcwhead{display:flex;align-items:center;gap:10px;margin:0 0 10px;}' +
    '.bcwhead .lb{flex:1;font-size:14px;color:#E8EEF7;font-weight:800;}' +
    '.bcwauto{border:0;border-radius:10px;padding:11px 16px;font-size:14px;font-weight:800;' +
    'background:#D97706;color:#fff;white-space:nowrap;}' +
    '.bcwrow{display:flex;gap:8px;margin:0 0 8px;}' +
    '.bcwrow input{box-sizing:border-box;font-size:15px;padding:10px;border-radius:9px;' +
    'border:1px solid #26324A;background:#fff;color:#0f172a;}' +
    '.bcwrow .d{flex:0 0 128px;text-align:center;}' +
    '.bcwrow .t{flex:1;min-width:0;}' +
    '.bcseg{display:flex;gap:8px;margin:0 0 12px;}' +
    '.bcseg button{flex:1;padding:12px 6px;font-size:14.5px;font-weight:800;border:1px solid #26324A;' +
    'border-radius:10px;background:#0B1220;color:#94A3B8;}' +
    '.bcseg button.on{background:#2563EB;color:#fff;border-color:#2563EB;}' +
    '.bcwimg{width:100%;border-radius:12px;display:block;margin:12px 0 0;}' +
    '.bcotxv{background:#fff;color:#111;border-radius:10px;padding:12px 13px;' +
    'font-size:16px;line-height:1.7;white-space:pre-wrap;word-break:break-word;' +
    'user-select:text;-webkit-user-select:text;}' +
    '.bcinstx{margin-left:auto;padding:7px 11px;border:0;border-radius:9px;' +
    'background:#0B1220;color:#fff;font-size:15px;font-weight:800;cursor:pointer;' +
    'user-select:text;-webkit-user-select:text;white-space:nowrap;}' +
    '.bcgo{display:block;width:100%;margin:0 0 10px;padding:17px;font-size:19px;font-weight:800;' +
    'border:0;border-radius:12px;background:#2563EB;color:#fff;}' +
    '.bcghost{display:block;width:100%;margin:0 0 10px;padding:14px;font-size:15px;font-weight:800;' +
    'border:1px solid #26324A;border-radius:12px;background:#131C2E;color:#E8EEF7;}' +
    '.bcmini{display:block;width:100%;margin:2px 0 8px;padding:10px;font-size:13.5px;font-weight:700;' +
    'border:0;background:transparent;color:#B9CCDA;text-decoration:underline;}' +
    '.bcsum{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;' +
    'border-bottom:1px solid #26324A;font-size:15px;}' +
    '.bcsum:last-child{border-bottom:0;}.bcsum b{font-weight:800;flex:1;min-width:0;}' +
    '.bcsum{flex-wrap:wrap;}.bcseeall{white-space:nowrap;}' +
    '.bcsum span{color:#94A3B8;white-space:nowrap;font-size:13.5px;}' +
    '.bcsum span.on{color:#7dd3a0;font-weight:800;}' +
    '.bcdt{display:flex;gap:10px;margin:0 0 12px;}.bcdt>div{flex:1;}' +
    '.bclbl{font-size:13px;color:#B9CCDA;font-weight:800;margin:16px 2px 8px;}' +
    '.bcitem{background:#131C2E;border-radius:11px;padding:11px 13px;margin:0 0 8px;color:#E8EEF7;}' +
    '.bcit1{font-weight:800;font-size:14px;}' +
    '.bcit2{font-size:12.5px;color:#94A3B8;margin-top:4px;}' +
    '.bccx{margin-top:9px;font-size:12.5px;padding:7px 13px;border-radius:9px;' +
    'border:1px solid #7f1d1d;background:#2a1214;color:#fca5a5;font-weight:800;}' +
    '.bcstatus{font-weight:800;margin:10px 2px;font-size:14.5px;border-radius:11px;padding:0;}' +
    '.bcstatus.on{background:transparent;color:#F0FFF4;border-left:4px solid #22C55E;border-radius:0;padding:6px 12px;}' +
    '.bcstatus.ng{background:transparent;color:#FECACA;border-left:4px solid #EF4444;border-radius:0;padding:6px 12px;}' +
    '.bcwaitmsg{text-align:center;font-weight:800;font-size:17px;color:#E8EEF7;padding:14px 6px 6px;}' +
    '.bccamph{font-size:17px;font-weight:900;color:#fff;margin:14px 2px 10px;}' +
    '.bccampkinds{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 6px;}' +
    '.bccampkind{padding:16px 8px;font-size:16px;font-weight:800;border:0;border-radius:12px;' +
    'background:#2563EB;color:#fff;line-height:1.35;word-break:break-all;box-shadow:0 3px 10px rgba(0,0,0,.22);cursor:pointer;}' +
    '.bccampkind.on{background:#16A34A;box-shadow:0 0 0 3px #fff inset;}' +
    '.bccampkind.on::before{content:"✓ ";}' +
    '.bccamptab{margin:12px 0 14px;}' +
    '.bcpick.bccampon{border-color:#16A34A;box-shadow:0 0 0 2px #16A34A inset;}' +
    '.bcpick.bccampon span{color:#7dd3a0;}' +
    '.bcslot{background:#0B1220;border:1px solid #26324A;border-radius:12px;padding:10px 10px 12px;margin:0 0 10px;}' +
    '.bcslothead{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 10px;}';
  var script =
  '<script>(function(){' +
  'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
  'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
  'var TPL=[],PRE=[],MADE=[],CAT="",MAXP=3,MAXT=500,DATA=[],step=0,mode="",page="k";' +
  'var WTEXT="",WDONE=[],WBUSY=false,WMSG="";' +
  'var SPER="",SRES=null,SBUSY=false,SBUSYAT=0,SNOVIO=false;' +
  'var MSTEP=0,MBODY="",MJA=[],MZH=[],MBUSY=false,MMSG="";' +
  'var MBODYS=["","","",""],MIDX=0;' +
  'var MBUSYAT=0,WBUSYAT=0,M6FROM=2,LASTSCR="";' +
  'document.addEventListener("click",function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest("[data-imgstop]");' +
  'if(!b)return;MKSTOP=true;b.disabled=true;b.textContent="中止しています…";' +
  'try{ask("bc_wakuimg",{fields:JSON.stringify({mode:"stop"})},function(){},function(){});}catch(e2){}},true);' +
  'function secTag(t){return \'<span class="bcsec" data-t="\'+t+\'">（\'+Math.round((Date.now()-t)/1000)+\'秒）</span>\';}' +
  'setInterval(function(){[].slice.call(document.querySelectorAll(".bcsec")).forEach(function(e){' +
  'e.textContent="（"+Math.round((Date.now()-(+e.getAttribute("data-t")))/1000)+"秒）";});},1000);' +
  'function autoH(el){if(!el)return;el.style.height="0px";el.style.height=(el.scrollHeight+10)+"px";}' +
  'var MZBODYS=["","","",""];' +
  'var LMODE="";' +
  'var box=document.getElementById("bcbody"),stEl=document.getElementById("bcstatus"),banEl=document.getElementById("bcbanner");' +
  'var catEl=document.getElementById("bccatname"),noEl=document.getElementById("bcno");' +
  'var ttlEl=document.getElementById("bctitle"),topEl=document.getElementById("bctoprow");' +
  'var SIDX=0;' +
  'var EDI=-1;' +
  'var LTAB="wait",LPOSTS=null,LBATCH=0;' +
  'var MBACK=0;' +
  'var TAGS=[],TAGLIST=[],TAGBUSY=false,ADDAT=-1,TAGSNAP=[],XTAGS=[],XTAGSNAP=[];' +
  'function defTags(t){return String((t&&t.who)||"").split("　（外す")[0].split("＋").filter(function(x){return x;});}' +
  'function defX(t){var s=String((t&&t.who)||""),k=s.indexOf("（外す：");if(k<0)return [];' +
  'return s.slice(k+4).replace(/）\\s*$/,"").split("＋").filter(function(x){return x;});}' +
  'function xOf(i){return Array.isArray(XTAGS[i])?XTAGS[i]:defX(TPL[i]);}' +
  'function sendX(i){return Array.isArray(XTAGS[i])?XTAGS[i]:((TAGS[i]&&TAGS[i].length)?defX(TPL[i]):[]);}' +
  'function whoTxt(i,t){var a=(TAGS[i]&&TAGS[i].length)?TAGS[i]:defTags(t),x=xOf(i);' +
  'return "タグ："+esc(a.join("＋"))+(x.length?(\'　<span class="bcxw">除く：\'+esc(x.join("＋"))+"</span>"):"");}' +
  'function sameSet(a,b){a=(a||[]).slice().sort();b=(b||[]).slice().sort();return a.join("|")===b.join("|");}' +
  'var MOVED=false;' +
  'function esc(s){return (s==null?"":String(s)).replace(/[&<>\\"\\x27]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","\\x27":"&#39;"}[c];});}' +
  'function status(t,err){stEl.textContent=t;stEl.className="bcstatus"+(t?(err?" ng":" on"):"");}' +
  'function jsonp(params,onR){var cb="__bc"+Date.now()+Math.floor(Math.random()*1000);window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
  'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
  'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
  'function pushImage(name,obj){return fetch(EXEC+"?action=push&key="+KEY+"&name="+name,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(obj)});}' +
  'function rnd(){var s="bc_img_",c="abcdefghijklmnopqrstuvwxyz0123456789",i;for(i=0;i<12;i++)s+=c[Math.floor(Math.random()*36)];return s+".json";}' +
  'function ask(op,fields,onDone,onFail,iv){iv=iv||700;' +
  'var f=fields||{};var p={action:"submit",key:KEY,op:op,who:idn.who,role:idn.role,device:idn.device};' +
  'for(var k in f)p[k]=f[k];' +
  'jsonp(p,function(r){if(!r||!r.ok||!r.id){(onFail||function(){})("依頼を送れませんでした。");return;}' +
  'var lim=(window.LIMITS&&LIMITS.tries)?LIMITS.tries(op,iv):500;' +
  'var n=0;(function poll(){n++;if(n>lim){(onFail||function(){})("時間がかかりすぎました。");return;}' +
  'jsonp({action:"status",key:KEY,id:r.id},function(s){if(!s||!s.ok){(onFail||function(){})("通信に失敗しました。");return;}' +
  'if(s.status==="pending"||s.status==="running"||s.status==="queued"||s.status===""){setTimeout(poll,iv);return;}' +
  'if(s.status!=="done"){(onFail||function(){})(String(s.result||"うまくいきませんでした。"));return;}' +
  'var d=null;try{d=JSON.parse(s.result);}catch(e){d={ok:true,note:String(s.result||"")};}' +
  'onDone(d);});})();});}' +
  'function picks(){return MADE.concat(PRE);}' +
  'function preOf(key){var a=picks();for(var i=0;i<a.length;i++)if(a[i].key===key)return a[i];return null;}' +
  'function partLabel(p){if(p.kind==="text")return "文章 "+ulen(p.text)+"文字　"+p.text.replace(/\\n/g," ").slice(0,22);' +
  'if((p.src||"").indexOf("made:")===0)return "予約可能枠の画像";' +
  'var pr=preOf((p.src||"").replace(/^(preset|made):/,""));return pr?pr.label:"その場で選んだ写真";}' +
  'function partThumb(p){if(p.kind==="text")return "";' +
  'var pr=preOf((p.src||"").replace(/^(preset|made):/,""));return pr?pr.thumb:(p.thumb||"");}' +
  'function filled(i){return (DATA[i]&&DATA[i].parts||[]).length;}' +
  'function tLive(){var a=[],i;for(i=0;i<TPL.length;i++)if(filled(i))a.push(i);return a;}' +
  'function nextLive(from){var a=tLive(),i;' +
  'for(i=0;i<a.length;i++)if(a[i]>from)return a[i];return TPL.length;}' +
  'function prevLive(from){var a=tLive(),i;' +
  'for(i=a.length-1;i>=0;i--)if(a[i]<from)return a[i];return -1;}' +
  'var WIPNAME="bc_wip.json";' +
  'var WIPON=false,WIPT=null,WIPMAX=1200000,FRESH=false;' +
  'function partsFor(x,withPhoto){return (x.parts||[]).filter(function(p){return withPhoto||!p.b64;})' +
  '.map(function(p){return p.kind==="text"?{kind:"text",text:p.text,g:p.g}:{kind:"image",src:p.src,b64:p.b64};});}' +
  'function packNow(withPhoto){return {t:Date.now(),step:step,text:WTEXT,body:MBODY,' +
  'per:SPER,waku:SRES,sidx:SIDX,page:page,bodies:MBODYS,zbodies:MZBODYS,' +
  'ja:MJA,zh:MZH,tags:TAGS,xtags:XTAGS,mback:MBACK,' +
  'midx:MIDX,mstep:MSTEP,m6from:M6FROM,names:TPL.map(function(t){return t.name;}),' +
  'data:DATA.map(function(x){return {parts:partsFor(x,withPhoto)};})};}' +
  'var OLDNAMES=["新規 日本男性","新規 日本女性","既存 日本男性","既存 日本女性","新規 台湾男性","新規 台湾女性","既存 台湾男性","既存 台湾女性"];' +
  'function nkey(n){return String(n||"").replace(/^[\\u2460-\\u2473]\\s*/,"").replace(/^\\s+|\\s+$/g,"");}' +
  'function savedIdx(s,i){var src=(s.names&&s.names.length)?s.names:(CAT==="予約可能枠案内"?OLDNAMES:null);' +
  'if(!src)return i;var k=nkey(TPL[i].name);for(var j=0;j<src.length;j++)if(nkey(src[j])===k)return j;return -1;}' +
  'function saveNow(){if(CMODE){campSave();return;}if(!WIPON)return;' +
  'if(WIPT)clearTimeout(WIPT);' +
  'WIPT=setTimeout(function(){WIPT=null;' +
  'var o=packNow(true);' +
  'if(!wipAny(o))return;' +
  'try{if(JSON.stringify(o).length>WIPMAX)o=packNow(false);}catch(e){}' +
  'try{pushImage(WIPNAME,o);}catch(e2){}},1200);}' +
  'function wipClear(){if(WIPT){clearTimeout(WIPT);WIPT=null;}' +
  'try{pushImage(WIPNAME,{t:Date.now(),data:[]});}catch(e){}}' +
  'function wipCount(s){var k=0;for(var i=0;i<((s&&s.data)||[]).length;i++)' +
  'if(((s.data[i]||{}).parts||[]).length)k++;return k;}' +
  'function wipAny(s){if(!s)return false;' +
  'var bs=(s.bodies||[]).join("");' +
  'return !!(wipCount(s)||String(bs).trim()||String(s.body||"").trim());}' +
  'function goSaved(s){applySaved(s);FRESH=true;' +
  'var pg=s.page;if(pg!=="s"&&pg!=="m"&&pg!=="w"&&pg!=="t")' +
  'pg=((SRES&&SRES.groups||[]).length)?"s":"t";' +
  'page=pg;mode="";}' +
  'function applySaved(s){' +
  'var oldTags=(s.tags&&s.tags.length)?s.tags:null,oldStep=s.step;' +
  'for(var i=0;i<TPL.length;i++){var si=savedIdx(s,i);var ps=(si>=0&&((s.data[si]||{}).parts))||[];' +
  'if(oldTags){TAGS[i]=(si>=0&&oldTags[si])||[];}' +
  'if(s.xtags&&s.xtags.length){XTAGS[i]=(si>=0&&Array.isArray(s.xtags[si]))?s.xtags[si]:null;}' +
  'if(typeof oldStep==="number"&&si>=0&&si===oldStep)s.__step=i;' +
  'DATA[i].parts=ps.slice(0,MAXP).map(function(p){' +
  'if(p.kind==="image"&&p.b64&&!p.thumb)p.thumb="data:image/jpeg;base64,"+p.b64;return p;});}' +
  'WTEXT=s.text||"";MBODY=s.body||"";SPER=s.per||"";SIDX=s.sidx||0;' +
  'if(s.bodies&&s.bodies.length)MBODYS=s.bodies;' +
  'if(s.zbodies&&s.zbodies.length)MZBODYS=s.zbodies;' +
  'if(s.ja&&s.ja.length)MJA=s.ja;if(s.zh&&s.zh.length)MZH=s.zh;' +
  'if(s.mback===0||s.mback===1||s.mback===2||s.mback===5||s.mback===6)MBACK=s.mback;if(s.m6from===1||s.m6from===2||s.m6from===5)M6FROM=s.m6from;' +
  'MIDX=s.midx||0;' +
  'if(s.mstep===0||s.mstep===1||s.mstep===2||s.mstep===5||s.mstep===6)MSTEP=s.mstep;else MSTEP=0;' +
  'if(s.waku&&s.waku.groups){SRES=s.waku;fixWaku();if(SRES.all)buildG();}' +
  'if(typeof s.step==="number"&&s.step>=0&&s.step<=TPL.length)' +
  'step=(typeof s.__step==="number")?s.__step:s.step;}' +
  'function bigView(src,name){' +
  'function show(u){szOvShow_(\'<div style="padding:14px;text-align:center">\'+' +
  '\'<img src="\'+u+\'" style="max-width:92vw;max-height:74vh;border-radius:12px;display:block;margin:0 auto">\'+' +
  '\'<div style="color:#E8EEF7;font-size:13px;margin-top:10px">\'+' +
  '(u===src?"はっきりした絵を出しています…":"")+\'</div>\'+' +
  '\'<button type="button" id="bcbigx" style="margin:16px auto 0;display:block;border:0;border-radius:12px;\'+' +
  '\'padding:14px 34px;font-size:17px;font-weight:800;background:#2563EB;color:#fff">閉じる</button></div>\',"#2C7A99");' +
  'setTimeout(function(){var b=document.getElementById("bcbigx");if(b)b.onclick=function(){szOvHide_();};},80);}' +
  'show(src);' +
  'if(!name)return;' +
  'var stem=String(name).replace(/\\.[a-z]+$/i,"").replace(/[^A-Za-z0-9_]/g,"");' +
  'jsonp({action:"data",name:"bc_big_n_"+stem+".json"},function(d0){' +
  'if(d0&&d0.big&&d0.name===name){if(document.getElementById("bcbigx"))show(d0.big);return;}' +
  'var slot=(idn.device||"x").replace(/[^a-z0-9_]/g,"").slice(0,20)||"d";' +
  'ask("bc_wakuimg",{fields:JSON.stringify({mode:"big",name:name,slot:slot})},' +
  'function(r){if(!r||!r.ok||!document.getElementById("bcbigx"))return;' +
  'jsonp({action:"data",name:"bc_big_"+(r.slot||slot)+".json"},function(d){' +
  'if(d&&d.big&&d.name===name&&document.getElementById("bcbigx"))show(d.big);});},function(){});});}' +
  'function freshBar(){return FRESH?' +
  '\'<div class="bcfreshbar"><button type="button" class="bcfreshbtn" id="bcfresh">\'+' +
  '\'↩ 初期状態に戻す</button></div>\':"";}' +
  'function bindFresh(){var b=document.getElementById("bcfresh");if(!b)return;' +
  'b.onclick=function(){szPopup_("入力した内容をすべて削除して、最初から始めますか？😊",{cancel:true,' +
  'onYes:function(){wipClear();DATA=TPL.map(function(){return {parts:[]};});' +
  'WTEXT="";MBODY="";SPER="";SRES=null;MJA=[];MZH=[];MSTEP=0;MMSG="";' +
  'step=0;page="k";mode="";FRESH=false;status("最初の状態に戻しました。");draw();}});};}' +
  'function draw(){saveNow();' +
  'if(page==="k"){drawKind();}else if(page==="l"){drawSent();}' +
  'else if(page==="c"){drawCampKind();}else if(page==="ce"){drawCampEdit();}' +
  'else if(page==="w"){drawWaku();}' +
  'else if(page==="s"){drawText();}else if(page==="m"){drawMake();}' +
  'else{if(step<TPL.length&&!filled(step))step=nextLive(step-1);' +
  'if(step<TPL.length){drawOne();}else{drawLast();}}' +
  'noEl.textContent=(page==="k")?"":((page==="w")?"画像づくり":((page==="s")?"文づくり":' +
  '((page==="m")?"配信文づくり":' +
  '((step<TPL.length)?("対象 "+(step+1)+" / "+TPL.length):"最終確認"))));' +
  'var slim=((page==="k")||(page==="s"))?"none":"";' +
  'if(topEl)topEl.style.display="none";' +
  'if(ttlEl)ttlEl.style.display=(page==="k")?"":"none";' +
  'banEl.style.display=slim;' +
  'var sk2=[page,step,MSTEP,MIDX,SIDX,mode,(typeof CGI!=="undefined"?CGI:"")].join("|");' +
  'if(sk2!==LASTSCR){LASTSCR=sk2;try{window.scrollTo(0,0);}catch(e){}}}' +
  'function drawWaku(){' +
  'var h=\'<div class="bccard"><div class="bcname">予約可能枠の画像を作る</div>\'+' +
  '\'<div class="bchr"></div>\'+' +
  '\'<div class="bcwhead"><span class="lb">日時入力欄</span>\'+' +
  '\'<button type="button" class="bcwauto" id="bcwauto">自動入力</button></div>\'+' +
  '\'<textarea id="bcwtxt" style="min-height:260px;font-size:14px" \'+' +
  '\'placeholder="ここに空き時間検索の出力を貼るか、自分で入力してください😊&#10;&#10;'+
  '新規&#10;9/8（火）&#10;16:30&#10;9/9（水）&#10;11:00 / 12:00">\'+esc(WTEXT)+\'</textarea>\';' +
  'if(WDONE.length){h+=\'<div class="bchr"></div><div class="bcleft">できた画像</div><div class="bcgrid">\'+' +
  'WDONE.map(function(x){return \'<div class="bcpick new"><img src="\'+x.thumb+\'" data-bigw="\'+esc(x.name||"")+\'" style="cursor:zoom-in"><span>\'+' +
  'esc(x.label)+\'</span></div>\';}).join("")+\'</div>\';}' +
  'h+=\'</div>\';' +
  'h+=\'<button type="button" class="bcgo" id="bcwmake"\'+(WBUSY?" disabled":"")+\'>\'+' +
  '(WBUSY?"画像を生成しています...":"この内容で画像を作る")+\'</button>\';' +
  'if(WBUSY&&!WBUSYAT)WBUSYAT=Date.now();if(!WBUSY)WBUSYAT=0;' +
  'if(WBUSY&&MKRUN&&!MKSTOP)h+=\'<button type="button" class="bcstopbtn" data-imgstop="1">画像生成を中止する</button>\';' +
  'if(WMSG||WBUSY)h+=\'<div class="bcstatus on">\'+esc(WMSG||"画像を作っています…")+(WBUSY?secTag(WBUSYAT):"")+\'</div>\';' +
  'box.innerHTML=freshBar()+h;bindWaku();bindFresh();}' +
  'function bindWaku(){' +
  'var ta=document.getElementById("bcwtxt");' +
  'if(ta)ta.oninput=function(){WTEXT=ta.value;};' +
  '[].slice.call(box.querySelectorAll("[data-bigw]")).forEach(function(b){b.onclick=function(){' +
  'bigView(b.getAttribute("src"),b.getAttribute("data-bigw"));};});' +
  'document.getElementById("bcwauto").onclick=function(){' +
  'var b=document.getElementById("bcwauto");b.disabled=true;status("今週の空き枠を数えています…");' +
  'ask("bc_wakuimg",{fields:JSON.stringify({mode:"auto"})},' +
  'function(r){b.disabled=false;WTEXT=(r&&r.text)||"";status(WTEXT?"空き枠を入力しました。修正できます。":"空き枠がありませんでした。",!WTEXT);draw();},' +
  'function(m){b.disabled=false;status(m,true);});};' +
  'document.getElementById("bcwmake").onclick=function(){' +
  'if(ta)WTEXT=ta.value;' +
  'if(!(WTEXT||"").trim()){status("日時入力欄が空です。貼るか「自動入力」を押してください😊",true);return;}' +
  'WBUSY=true;WDONE=[];WMSG="";SENDN=null;status("");draw();' +
  'runMake(WTEXT,function(i,tot,label){WMSG=i+"枚できました（全"+tot+"枚）　作成中："+label;draw();},' +
  'function(done,err){WBUSY=false;' +
  'if(err){WMSG="";status(err,true);}' +
  'else WMSG="できました。"+done+"枚を、それぞれの対象の1つ目に追加しました。";' +
  'draw();});};}' +
  'var MKSTOP=false,MKRUN=false;' +
  'function runMake(text,onStep,onDone){MKSTOP=false;MKRUN=true;var _od=onDone;onDone=function(a,b){MKRUN=false;_od(a,b);};' +
  'ask("bc_wakuimg",{fields:JSON.stringify({mode:"plan",text:text})},' +
  'function(r){if(!r||!r.ok||!r.jobs||!r.jobs.length){onDone(0,(r&&r.note)||"読み取れませんでした。");return;}' +
  'var jobs=r.jobs,i=0,done=0;' +
  'if(SENDN)jobs=jobs.filter(function(j){return (j.targets||[]).some(function(nm){return SENDN.indexOf(nm)>=0;});});' +
  'if(!jobs.length){onDone(0,"");return;}' +
  'var got=[],run=0,fin=false,err="",PAR=4;' +
  'function finish(){if(fin)return;fin=true;for(var q=0;q<jobs.length;q++){if(got[q])putIntoTargets(jobs[q].targets,got[q].name,got[q].thumb);}' +
  'onDone(done,MKSTOP?"中止":err);}' +
  'function step(){var lb=[];for(var q=0;q<jobs.length;q++)if(jobs[q]._on)lb.push(jobs[q].label);onStep(done,jobs.length,lb.join("・"));}' +
  'function pump(){if(fin)return;while(!MKSTOP&&!err&&run<PAR&&i<jobs.length){(function(k){var j=jobs[k];j._on=true;run++;' +
  'ask("bc_wakuimg",{fields:JSON.stringify({mode:"make",kind:j.kind,days:j.days})},' +
  'function(g){run--;j._on=false;if(g&&g.ok&&g.name&&!MKSTOP){got[k]={name:g.name,thumb:g.thumb};WDONE.push({label:j.label,thumb:g.thumb,name:g.name});done++;}' +
  'if(run===0&&(MKSTOP||err||i>=jobs.length))finish();else{step();pump();}},' +
  'function(m2){run--;j._on=false;if(!err&&!MKSTOP)err="「"+j.label+"」で止まりました："+m2;if(run===0)finish();},2000);})(i);i++;}' +
  'step();if(run===0)finish();}' +
  'pump();},' +
  'function(m){onDone(0,m);});}' +
  'var SENDN=null;' +
  'function putIntoTargets(names,name,thumb){' +
  '(names||[]).forEach(function(nm){' +
  'if(SENDN&&SENDN.indexOf(nm)<0)return;' +
  'for(var i=0;i<TPL.length;i++){if(TPL[i].name!==nm)continue;' +
  'var ps=DATA[i].parts;' +
  'for(var k=ps.length-1;k>=0;k--){if(ps[k].kind==="image"&&(ps[k].src||"").indexOf("made:")===0)ps.splice(k,1);}' +
  'ps.unshift({kind:"image",src:"made:"+name,thumb:thumb});' +
  'while(ps.length>MAXP)ps.pop();}});}' +
  'function zhOf(s){var w=(SRES&&SRES.wd)||{};' +
  'return String(s||"").replace(/（([月火水木金土日])）/g,function(m,d){return "（"+(w[d]||d)+"）";});}' +
  'function fitTx(a){if(!a)return;' +
  'var gs=(SRES&&SRES.groups)||[],lg="",i,j,lines;' +
  'for(j=0;j<gs.length;j++){lines=String(gs[j].text||"").split("\\n");' +
  'for(i=0;i<lines.length;i++)if(lines[i].length>lg.length)lg=lines[i];}' +
  'if(!gs.length){lines=String(a.value||"").split("\\n");' +
  'for(i=0;i<lines.length;i++)if(lines[i].length>lg.length)lg=lines[i];}' +
  'var cs=getComputedStyle(a);' +
  'var w=a.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-2;' +
  'if(w>0&&lg){var pr=document.createElement("span");' +
  'pr.style.cssText="position:absolute;left:-9999px;top:0;white-space:pre;visibility:hidden;";' +
  'pr.style.fontFamily=cs.fontFamily;pr.style.fontWeight=cs.fontWeight;' +
  'pr.textContent=lg;document.body.appendChild(pr);' +
  'var f=22;for(;f>10;f--){pr.style.fontSize=f+"px";' +
  'if(pr.getBoundingClientRect().width<=w)break;}' +
  'pr.parentNode.removeChild(pr);a.style.fontSize=f+"px";}' +
  'function go(){a.style.height="0px";a.style.height=(a.scrollHeight+10)+"px";}' +
  'go();setTimeout(go,0);setTimeout(go,150);}' +
  'function drawKind(){' +
  'var h=\'<button type="button" class="bckind" id="bckind1">予約可能枠案内</button>\'+' +
  '\'<button type="button" class="bckind" id="bckind2">キャンペーン・商品の紹介</button>\'+' +
  '\'<button type="button" class="bctxt" id="bcseelist">設定した配信の予約を確認する</button>\';' +
  'box.innerHTML=freshBar()+h;bindFresh();' +
  'document.getElementById("bckind1").onclick=function(){MOVED=true;page="s";status("");draw();};' +
  'document.getElementById("bckind2").onclick=function(){MOVED=true;campEnter();};' +
  'var sl=document.getElementById("bcseelist");' +
  'if(sl)sl.onclick=function(){MOVED=true;page="l";LPOSTS=null;status("");draw();};}' +
  'function drawSent(){' +
  'var h=\'<div class="bcstop"><span class="bcsttl">設定した配信の予約</span>\'+' +
  '\'<button type="button" class="bcmv" id="bcreload">更新</button></div>\'+' +
  '\'<div class="bctab"><button type="button" id="bctab1" class="\'+' +
  '((LTAB==="wait")?"on":"")+\'">配信待ち</button>\'+' +
  '\'<button type="button" id="bctab2" class="\'+' +
  '((LTAB==="done")?"on":"")+\'">配信済み</button></div>\'+' +
  '\'<div id="bclist"><div class="bcouttx">読んでいます…</div></div>\';' +
  'box.innerHTML=h;' +
  'document.getElementById("bctab1").onclick=function(){LTAB="wait";status("");draw();};' +
  'document.getElementById("bctab2").onclick=function(){LTAB="done";status("");draw();};' +
  'document.getElementById("bcreload").onclick=function(){LPOSTS=null;status("");draw();};' +
  'if(LPOSTS){drawList(LPOSTS);}else{loadList();}}' +
  'function drawText(){' +
  'var P=[["今週","今週"],["来週","来週"],["今週来週","今週＆来週"],["一週間","今日から一週間"]];' +
  'var gs=(SRES&&SRES.groups)||[];var h;' +
  'if(!gs.length){' +
  'h=\'<div class="bcstop"><span class="bcsttl">予約可能時間を自動生成</span></div>\'+' +
  '\'<div class="bccard">\'+' +
  '\'<div class="bcper">\'+P.map(function(x){if(SBUSY&&x[0]!==SPER)return "";' +
  'return \'<button type="button" data-per="\'+x[0]+\'"\'+' +
  '\' class="\'+((x[0]===SPER)?"bcon":"")+((SBUSY)?" bcwide2":"")+\'"\'+(SBUSY?" disabled":"")+\'>\'+x[1]+\'</button>\';}).join("")+' +
  '\'<label class="bcnovio"><input type="checkbox" id="bcnoviocb"\'+(SNOVIO?" checked":"")+(SBUSY?" disabled":"")+\'>「男性VIO以外」を含める</label>\'+' +
  '\'</div>\';' +
  'if(SBUSY)h+=\'<div class="bchr"></div><div class="bcwaitmsg" id="bcwaitmsg">データ読み込み中です（\'+Math.round((Date.now()-SBUSYAT)/1000)+\'秒）</div>\';' +
  'if(SRES)h+=\'<div class="bchr"></div><div class="bcempty">\'+' +
  'esc(SRES.note||"この期間に空いている枠がありませんでした。")+\'</div>\';' +
  'h+=\'</div>\';' +
  'if(!SBUSY)h+=\'<button type="button" class="bcrestore bcrestout" id="bcrest">\'+' +
  '\'作業中のデータを復元する</button>\';' +
  'box.innerHTML=freshBar()+h;bindText();bindFresh();return;}' +
  'if(SIDX>=gs.length)SIDX=gs.length-1;if(SIDX<0)SIDX=0;' +
  'var g=gs[SIDX];' +
  'h=\'<div class="bcstop"><span class="bcsttl">予約可能時間を修正</span>\'+' +
  '\'<span class="bcsno">\'+(SIDX+1)+\' / \'+gs.length+\'</span></div>\'+' +
  '\'\';' +
  'var SCAN=!!(SRES.same||!SRES.split);' +
  'h+=\'<div class="bcsame\'+((SIDX===0)?"":" bckage")+\'"><span>\'+' +
  '(SCAN?(SRES.split?"新規・既存を男女に分けて作成します":"新規・既存を男女に分けずに作成します"):' +
  '"男性と女性で時間が違うので、男女に分けて作成します")+\'</span>\'+' +
  '(SCAN?(\'<button type="button" class="bcsplitb" id="bcsplitbtn">\'+' +
  '(SRES.split?"男女を分けない":"男女に分ける")+\'</button>\'):"")+\'</div>\';' +
  'h+=\'<div class="bccard bcwide"><div class="bcouth"><b>\'+esc(g.label)+\'</b>\'+' +
  '\'<button type="button" class="bccopy" data-cp="\'+SIDX+\'">コピー</button></div>\'+' +
  '\'<textarea class="bcotx" wrap="off" data-ed="\'+SIDX+\'">\'+esc(g.text)+\'</textarea></div>\';' +
  'h+=\'<button type="button" class="bcgo" id="bcsnext">この内容でOK</button>\';' +
  'box.innerHTML=freshBar()+h;bindText();bindFresh();' +
  'fitTx(box.querySelector(".bcotx"));}' +
  'function bindText(){' +

  'var e=document.getElementById("bcagain");' +
  'if(e)e.onclick=function(){SRES=null;SPER="";SIDX=0;status("");draw();};' +
  'e=document.getElementById("bcrest");' +
  'if(e)e.onclick=function(){status("作業中のデータを検索しています…");' +
  'jsonp({action:"data",name:WIPNAME},function(d){' +
  'var s=(d&&d.data&&d.data.length===TPL.length)?d:null;' +
  'if(!wipAny(s)){status("作業中のデータはありません。",true);return;}' +
  'goSaved(s);status("作業中のデータを復元しました。");draw();});};' +
  'var nv=document.getElementById("bcnoviocb");' +
  'if(nv)nv.onchange=function(){SNOVIO=nv.checked;};' +
  'var cb=document.getElementById("bcsplitbtn");' +
  'if(cb)cb.onclick=function(){splitOn(!(SRES&&SRES.split));};' +
  'e=document.getElementById("bcsnext");' +
  'if(e)e.onclick=function(){var gs=(SRES&&SRES.groups)||[];' +
  'if(SIDX>=gs.length-1){page="m";MSTEP=0;MMSG="";status("");draw();return;}' +
  'SIDX++;status("");draw();};' +
  '[].slice.call(box.querySelectorAll("[data-per]")).forEach(function(b){b.onclick=function(){' +
  'var k=b.getAttribute("data-per");SPER=k;SRES=null;SIDX=0;SBUSY=true;SBUSYAT=Date.now();' +
  'status("");draw();' +
  'var wt=setInterval(function(){var el=document.getElementById("bcwaitmsg");' +
  'if(!SBUSY){clearInterval(wt);return;}' +
  'if(el)el.textContent="データ読み込み中です（"+Math.round((Date.now()-SBUSYAT)/1000)+"秒）";},1000);' +
  'ask("bc_waku",{fields:JSON.stringify({period:k,novio:SNOVIO?"1":""})},function(r){SBUSY=false;clearInterval(wt);' +
  'if(!r||!r.ok){status((r&&r.note)||"算出できませんでした。",true);draw();return;}' +
  'setWaku(r);SIDX=0;status("");draw();},function(m){SBUSY=false;status(m,true);draw();});};});' +
  '[].slice.call(box.querySelectorAll("[data-ed]")).forEach(function(a){a.oninput=function(){' +
  'var i=a.getAttribute("data-ed")*1;if(!SRES||!SRES.groups[i])return;' +
  'SRES.groups[i].text=a.value;' +
  'var kk=SRES.groups[i].k,src=SRES.groups[i].z?SRES.zall:SRES.all;if(src&&src[kk])src[kk].text=a.value;' +
  'fitTx(a);saveNow();};});' +
  '[].slice.call(box.querySelectorAll("[data-cp]")).forEach(function(b){b.onclick=function(){' +
  'var g=((SRES&&SRES.groups)||[])[b.getAttribute("data-cp")*1];if(g)bcCopy(g.text,b);};});}' +
  'function bcCopy(s,b){if(!s)return;var old=b.textContent;' +
  'function done(){b.textContent="コピーしました";setTimeout(function(){b.textContent=old;},1500);}' +
  'if(navigator.clipboard&&navigator.clipboard.writeText){' +
  'navigator.clipboard.writeText(s).then(done,function(){bcFallCopy(s,done);});}else bcFallCopy(s,done);}' +
  'function bcFallCopy(s,cb){var ta=document.createElement("textarea");ta.value=s;' +
  'ta.style.position="fixed";ta.style.left="-9999px";document.body.appendChild(ta);ta.select();' +
  'try{document.execCommand("copy");cb();}catch(e){}document.body.removeChild(ta);}' +
  'var BDRE=/^\\s*\\d{1,2}\\/\\d{1,2}\\s*[（(][^）)]{1,2}[）)]\\s*$/,BTRE=/^[\\s\\d:：\\/／,、]*\\d{1,2}[:：]\\d{2}[\\s\\d:：\\/／,、]*$/;' +
  'function oldTimes(body){var L=String(body||"").split("\\n"),out=[],at=-1,n=0,i=0;' +
  'while(i<L.length){if(BDRE.test(L[i])&&i+1<L.length&&BTRE.test(L[i+1])){' +
  'if(at<0)at=out.length;n++;i++;while(i<L.length&&BTRE.test(L[i]))i++;' +
  'while(i<L.length&&!L[i].replace(/\\s+/g,"")&&i+1<L.length&&BDRE.test(L[i+1]))i++;continue;}' +
  'out.push(L[i]);i++;}return {lines:out,at:at,n:n};}' +
  'function joinBody(body,times){body=String(body||"");' +
  'if(!body.replace(/^\\s+|\\s+$/g,""))return "";' +
  'var o=oldTimes(body);' +
  'if(body.indexOf("【時間】")>=0)return o.lines.join("\\n").replace(/【時間】/g,times);' +
  'if(o.at>=0){o.lines.splice(o.at,0,times);return o.lines.join("\\n");}' +
  'return body.replace(/\\s+$/,"")+"\\n\\n"+times;}' +
  'function numMsg(n){if(!n)return "";' +
  'return (n>MAXT)?("今"+n+"文字です。"+MAXT+"文字までなので、あと"+(n-MAXT)+"文字減らしてください😊"):("今"+n+"文字です（"+MAXT+"文字まで）");}' +
  'function tgtNames(atama,sei,lang){var out=[];' +
  'for(var i=0;i<TPL.length;i++){var nm=TPL[i].name;' +
  'if(nm.indexOf(atama)<0)continue;' +
  'if(nm.indexOf(lang==="ja"?"日本":"台湾")<0)continue;' +
  'if(sei&&nm.indexOf(sei)<0)continue;out.push(nm);}return out;}' +
  'function putTextInto(names,txt){' +
  'var has=!!String(txt||"").replace(/^\\s+|\\s+$/g,"");' +
  '(names||[]).forEach(function(nm){' +
  'for(var i=0;i<TPL.length;i++){if(TPL[i].name!==nm)continue;var ps=DATA[i].parts;' +
  'for(var k=ps.length-1;k>=0;k--){if(ps[k].kind==="text"&&ps[k].g)ps.splice(k,1);}' +
  'if(!has)continue;' +
  'if(ps.length>=MAXP)ps.pop();ps.push({kind:"text",text:txt,g:1});}});}' +
  'var BORDER=[["新規","男性"],["既存","男性"],["新規","女性"],["既存","女性"]];' +
  'function setWaku(r){SRES=r;' +
  'SRES.all=(r.groups||[]).slice();' +
  'SRES.zall=(r.zgroups||[]).map(function(z){var d=true;' +
  'for(var i=0;i<SRES.all.length;i++)if(SRES.all[i].atama===z.atama&&SRES.all[i].sei===z.sei)d=(SRES.all[i].text!==z.text);' +
  'return {atama:z.atama,sei:z.sei,label:z.label,text:z.text,diff:d};});' +
  'SRES.split=!r.same;buildG();}' +
  'function zOf(atama,sei){var z=(SRES&&SRES.zall)||[];' +
  'for(var i=0;i<z.length;i++)if(z[i].diff&&z[i].atama===atama&&z[i].sei===sei)return i;return -1;}' +
  'function buildG(){var a=(SRES&&SRES.all)||[];' +
  'SRES.groups=[];' +
  'for(var k=0;k<a.length;k++){if(!SRES.split&&a[k].sei!=="男性")continue;' +
  'var sei=SRES.split?a[k].sei:"",lab=SRES.split?a[k].label:a[k].atama;' +
  'var zi=zOf(a[k].atama,a[k].sei);' +
  'SRES.groups.push({atama:a[k].atama,sei:sei,label:lab+(zi>=0?"（日本人）":"（日本人＆台湾人）"),text:a[k].text,k:k});' +
  'if(zi>=0)SRES.groups.push({atama:a[k].atama,sei:sei,label:lab+"（台湾人）",text:SRES.zall[zi].text,k:zi,z:1});}}' +
  'function fixWaku(){if(!SRES||!SRES.groups||SRES.all)return;' +
  'var g=SRES.groups;SRES.split=!!(g.length&&g[0].sei);' +
  'SRES.all=g.map(function(x){return {atama:x.atama,sei:x.sei||"男性",' +
  'label:x.label,text:x.text};});buildG();}' +
  'function splitOn(on){if(!SRES)return;if(!on&&!SRES.same&&SRES.split)return;' +
  'if(on&&!SRES.split&&SRES.same){var a=SRES.all,i,j;' +
  'for(i=0;i<a.length;i++){if(a[i].sei!=="女性")continue;' +
  'for(j=0;j<a.length;j++)if(a[j].sei==="男性"&&a[j].atama===a[i].atama)a[i].text=a[j].text;}' +
  'a=SRES.zall||[];' +
  'for(i=0;i<a.length;i++){if(a[i].sei!=="女性")continue;' +
  'for(j=0;j<a.length;j++)if(a[j].sei==="男性"&&a[j].atama===a[i].atama){a[i].text=a[j].text;a[i].diff=a[j].diff;}}}' +
  'SRES.split=!!on;SIDX=0;buildG();saveNow();status("");draw();}' +
  'function timesOf(atama,sei,zh){var gs=(SRES&&SRES.groups)||[],i,pass,want;' +
  'for(pass=0;pass<2;pass++){want=(zh&&pass===0)?1:0;' +
  'for(i=0;i<gs.length;i++)if(!!gs[i].z===!!want&&gs[i].atama===atama&&gs[i].sei===sei)return gs[i].text;' +
  'for(i=0;i<gs.length;i++)if(!!gs[i].z===!!want&&gs[i].atama===atama&&!gs[i].sei)return gs[i].text;}' +
  'return "";}' +
  'function tooLong(a){for(var i=0;i<a.length;i++)if(ulen(a[i].text)>MAXT)return a[i].label;' +
  'return "";}' +
  'function cardsOf(a){return a.map(function(x){var over=ulen(x.text)>MAXT;' +
  'return \'<div class="bcout"><div class="bcouth"><b>\'+esc(x.label)+\'</b></div>\'+' +
  '\'<div class="bcouttx">\'+esc(x.text)+\'</div>\'+' +
  '\'<div class="bcnum\'+(over?" over":"")+\'">\'+esc(numMsg(ulen(x.text)))+' +
  '\'</div></div>\';}).join("");}' +
  'function ordLabel(i,zh){var x=BORDER[i];return (zh?"🇹🇼":"🇯🇵")+x[0]+x[1];}' +
  'function sendNames(){var a=[],i;' +
  'for(i=0;i<BORDER.length;i++)' +
  'if(String((MJA[i]||{}).text||"").replace(/^\\s+|\\s+$/g,""))a.push(ordLabel(i,false));' +
  'for(i=0;i<BORDER.length;i++)' +
  'if(String((MZH[i]||{}).text||"").replace(/^\\s+|\\s+$/g,""))a.push(ordLabel(i,true));' +
  'return a;}' +
  'function makeBtn(id){var a=sendNames();' +
  'if(!a.length)return \'<div class="bcstatus ng">送る区分がありません。\'+' +
  '\'「← 戻る」で文章を入力してください😊</div>\';' +
  'return \'<button type="button" class="bctxt" id="\'+id+\'">以上\'+a.length+\'種類の画像を生成する</button>\'+' +
  '\'<button type="button" class="bcgo" id="\'+id+\'n">\'+' +
  '\'画像は生成せず配信内容の最終確認をする</button>\';}' +
  'function zLive(){var a=[],i;for(i=0;i<BORDER.length;i++)' +
  'if(String((MZH[i]||{}).text||"").replace(/^\\s+|\\s+$/g,""))a.push(i);return a;}' +
  'function btnHtml(){var N=BORDER.length,LNG=\'<div class="bcstatus ng">長すぎます。上の文を短くしてください😊 （短くするとボタンが出ます）。</div>\';' +
  'if(MSTEP===0){var x=BORDER[MIDX],last=(MIDX===N-1);' +
  'if(ulen(joinBody(MBODYS[MIDX]||"",timesOf(x[0],x[1])))>MAXT)return LNG;' +
  'return \'<button type="button" class="bcgo" id="bcmok">この内容でOK</button>\';}' +
  'if(MSTEP===5)return \'<button type="button" class="bctxt" id="bcmauto">今までの日本語文を全て翻訳し、中国語版を作成する</button>\'+' +
  '\'<button type="button" class="bcgo" id="bcmman">翻訳せずに手動で中国語版を作成する</button>\'+' +
  '\'<button type="button" class="bcgo" id="bcmnozh">中国語版は配信しない</button>\';' +
  'if(MSTEP===1){var zx=BORDER[MIDX],zlast=(MIDX===N-1);' +
  'if(ulen(joinBody(MZBODYS[MIDX]||"",zhOf(timesOf(zx[0],zx[1],true))))>MAXT)return LNG;' +
  'return \'<button type="button" class="bcgo" id="\'+(zlast?"bcmzok6":"bcmzok")+\'">この内容でOK</button>\';}' +
  'if(MSTEP===2){var lv=zLive(),pos=lv.indexOf(MIDX),z=MZH[MIDX]||{text:""};' +
  'var lastz=(pos<0||pos===lv.length-1);' +
  'if(ulen(z.text)>MAXT)return LNG;' +
  'return lastz?\'<button type="button" class="bcgo" id="bcmok6">この内容でOK</button>\':\'<button type="button" class="bcgo" id="bcmoknext">つぎへ</button>\';}' +
  'if(MSTEP===6)return makeBtn("bcmok3");' +
  'return "";}' +
  'function refreshBtns(){var bb=document.getElementById("bcmbtns");' +
  'if(bb){bb.innerHTML=btnHtml();bindMake();}}' +
  'function drawMake(){var h,N=BORDER.length;' +
  'if(MIDX>=N)MIDX=N-1;if(MIDX<0)MIDX=0;' +
  'if(MSTEP===0){' +
  'var x=BORDER[MIDX],last=(MIDX===N-1);' +
  'var body=MBODYS[MIDX]||"",done=joinBody(body,timesOf(x[0],x[1]));' +
  'var over=ulen(done)>MAXT;' +
  'h=\'<div class="bcstop"><span class="bcsttl">配信文を作成</span>\'+' +
  '\'<span class="bcsno">\'+(MIDX+1)+\' / \'+N+\'</span></div>\';' +
  'h+=\'<div class="bccard bcwide"><div class="bcouth"><b>\'+esc(ordLabel(MIDX,false))+\'</b>\'+' +
  '\'<button type="button" class="bcinstx" id="bcinscp">【時間】</button></div>\'+' +
  '\'<textarea id="bcmbody" class="bcmtx" placeholder="ここに、この対象へ送る日本語の文章を入力してください😊&#10;&#10;\'+' +
  '\'「【時間】」と書いた所に予約可能時間が入ります。書かなければ文の最後に入ります。">\'+' +
  'esc(body)+\'</textarea>\';' +
  'h+=\'<div class="bcbubcap">お客様のスマホでの見え方（文字の大きさ＝中）</div><div class="bcouttx bcbub" id="bcmprev">\'+' +
  'esc(body.replace(/^\\s+|\\s+$/g,"")?bcLineWrap_(done):' +
  '("空欄のため、"+ordLabel(MIDX,false)+"には配信しません"))+\'</div>\'+' +
  '\'<div class="bcnum\'+(over?" over":"")+\'" id="bcmnum">\'+(body?numMsg(ulen(done)):"")+' +
  '\'</div>\';' +
  'h+=\'</div>\';' +
  'if(!MBUSY)h+=\'<div id="bcmbtns">\'+btnHtml()+\'</div>\';}' +
  'else if(MSTEP===5){' +
  'var ja5=MJA.filter(function(x){return String(x.text||"").replace(/^\\s+|\\s+$/g,"");});' +
  'h=\'<div class="bcstop"><span class="bcsttl">中国語版の作成方法を選択</span></div>\'+' +
  '(ja5.length?"":\'<div class="bcstatus ng">日本語の文がありません。「← 戻る」で文章を入力してください😊</div>\');' +
  'if(!MBUSY&&ja5.length)h+=\'<div id="bcmbtns">\'+btnHtml()+\'</div>\';}' +
  'else if(MSTEP===6){var nm6=sendNames();' +
  'h=\'<div class="bcstop"><span class="bcsttl">予約可能枠の画像を作りますか？😊</span></div>\'+' +
  '\'<div class="bccard bcwide"><div class="bcouth"><b>画像生成の対象（以下の\'+nm6.length+\'種類）</b></div>\'+' +
  '\'<div class="bcouttx">\'+esc(nm6.join("\\n"))+\'</div></div>\';' +
  'if(!MBUSY)h+=\'<div id="bcmbtns">\'+btnHtml()+\'</div>\';}' +
  'else if(MSTEP===1){' +
  'var zx=BORDER[MIDX],zlast=(MIDX===N-1);' +
  'var zb=MZBODYS[MIDX]||"",zdone=joinBody(zb,zhOf(timesOf(zx[0],zx[1],true)));' +
  'var zov=ulen(zdone)>MAXT;' +
  'h=\'<div class="bcstop"><span class="bcsttl">中国語版を作成</span>\'+' +
  '\'<span class="bcsno">\'+(MIDX+1)+\' / \'+N+\'</span></div>\';' +
  'h+=\'<div class="bccard bcwide"><div class="bcouth"><b>\'+esc(ordLabel(MIDX,true))+\'</b>\'+' +
  '\'<button type="button" class="bcinstx" id="bcinscp">【時間】</button></div>\'+' +
  '\'<textarea id="bcmzbody" class="bcmtx" placeholder="ここに、この対象へ送る中国語の文章を入力してください😊&#10;&#10;\'+' +
  '\'「【時間】」と書いた所に予約可能時間が入ります。書かなければ文の最後に入ります。">\'+' +
  'esc(zb)+\'</textarea>\';' +
  'h+=\'<div class="bcbubcap">お客様のスマホでの見え方（文字の大きさ＝中）</div><div class="bcouttx bcbub" id="bcmzprev">\'+' +
  'esc(zb.replace(/^\\s+|\\s+$/g,"")?bcLineWrap_(zdone):' +
  '("空欄のため、"+ordLabel(MIDX,true)+"には配信しません"))+\'</div>\'+' +
  '\'<div class="bcnum\'+(zov?" over":"")+\'" id="bcmznum">\'+(zb?numMsg(ulen(zdone)):"")+' +
  '\'</div>\';' +
  'h+=\'</div>\';' +
  'if(!MBUSY)h+=\'<div id="bcmbtns">\'+btnHtml()+\'</div>\';}' +
  'else if(MSTEP===2){' +
  'var lv=zLive(),pos=lv.indexOf(MIDX);' +
  'if(pos<0&&lv.length){MIDX=lv[0];pos=0;}' +
  'var z=MZH[MIDX]||{text:""},lastz=(pos<0||pos===lv.length-1),ov2=ulen(z.text)>MAXT;' +
  'h=\'<div class="bcstop"><span class="bcsttl">中国語版の配信分の確認</span>\'+' +
  '\'<span class="bcsno">\'+(lv.length?((pos+1)+\' / \'+lv.length):\'0 / 0\')+\'</span></div>\';' +
  'h+=\'<div class="bccard bcwide"><div class="bcouth"><b>\'+esc(ordLabel(MIDX,true))+\'</b></div>\'+' +
  '\'<textarea id="bcmzedit" class="bcmtx" placeholder="\'+' +
  'esc("空欄のため、"+ordLabel(MIDX,true)+"には配信しません")+\'">\'+' +
  'esc(z.text||"")+\'</textarea>\'+' +
  '\'<div class="bcnum\'+(ov2?" over":"")+\'" id="bcmznum2">\'+numMsg(ulen(z.text))+\'</div>\'+' +
  '\'<div class="bcbubcap">お客様のスマホでの見え方（文字の大きさ＝中）</div>\'+' +
  '\'<div class="bcouttx bcbub" id="bcmzbub">\'+esc(bcLineWrap_(z.text||""))+\'</div></div>\';' +
  'if(!MBUSY)h+=\'<div id="bcmbtns">\'+btnHtml()+\'</div>\';}' +
  'else{h=\'<div class="bccard"><div class="bcname">配信文を作成</div><div class="bchr"></div>\'+' +
  '\'<div class="bcouttx">\'+esc(MMSG)+(MBUSY?secTag(MBUSYAT||(MBUSYAT=Date.now())):"")+\'</div></div>\';' +
  'if(!MBUSY)h+=\'<button type="button" class="bcgo" id="bcmdone">対象の設定を見る</button>\';' +
  '}' +
  'if(MBUSY&&!MBUSYAT)MBUSYAT=Date.now();if(!MBUSY)MBUSYAT=0;' +
  'if(MBUSY&&MKRUN&&!MKSTOP)h+=\'<button type="button" class="bcstopbtn" data-imgstop="1">画像生成を中止する</button>\';' +
  'if(MMSG&&(MSTEP<3||MSTEP===5||MSTEP===6))h+=\'<div class="bcstatus on">\'+esc(MMSG)+(MBUSY?secTag(MBUSYAT):"")+\'</div>\';' +
  'box.innerHTML=freshBar()+h;bindMake();bindFresh();}' +
  'function bindMake(){' +
  '["bcmbody","bcmzbody","bcmzedit"].forEach(function(i){var t=document.getElementById(i);' +
  'if(t){autoH(t);if(!t.__ah){t.__ah=1;t.addEventListener("input",function(){autoH(t);});}}});' +
  'var ta=document.getElementById("bcmbody");' +
  'if(ta)ta.oninput=function(){MBODYS[MIDX]=ta.value;MBODY=ta.value;' +
  'var x=BORDER[MIDX],done=joinBody(ta.value,timesOf(x[0],x[1]));' +
  'var pv=document.getElementById("bcmprev");' +
  'if(pv)pv.textContent=ta.value.replace(/^\\s+|\\s+$/g,"")?bcLineWrap_(done):' +
  '("空欄のため、"+ordLabel(MIDX,false)+"には配信しません");' +
  'var nm=document.getElementById("bcmnum");' +
  'if(nm){var ov=ulen(done)>MAXT;nm.textContent=ta.value?numMsg(ulen(done)):"";' +
  'nm.className="bcnum"+(ov?" over":"");}' +
  'saveNow();refreshBtns();};' +
  'var e=document.getElementById("bcmedit");' +
  'if(e)e.onclick=function(){MSTEP=0;MIDX=0;MMSG="";status("");draw();};' +
  'e=document.getElementById("bcmprev2");' +
  'if(e)e.onclick=function(){MIDX--;status("");draw();};' +
  'var zed=document.getElementById("bcmzedit");' +
  'if(zed)zed.oninput=function(){' +
  'if(!MZH[MIDX])MZH[MIDX]={label:ordLabel(MIDX,true),' +
  'atama:BORDER[MIDX][0],sei:BORDER[MIDX][1],text:""};' +
  'MZH[MIDX].text=zed.value;' +
  'var zbb=document.getElementById("bcmzbub");if(zbb)zbb.textContent=bcLineWrap_(zed.value);' +
  'var zn=document.getElementById("bcmznum2");' +
  'if(zn){var zo=ulen(zed.value)>MAXT;' +
  'zn.textContent=numMsg(ulen(zed.value));' +
  'zn.className="bcnum"+(zo?" over":"");}' +
  'saveNow();refreshBtns();};' +
  'e=document.getElementById("bcmoknext");' +
  'if(e)e.onclick=function(){var lv=zLive(),q=lv.indexOf(MIDX);' +
  'MIDX=(q>=0&&q+1<lv.length)?lv[q+1]:MIDX;status("");draw();};' +
  'e=document.getElementById("bcmdone");' +
  'if(e)e.onclick=function(){page="t";step=0;MMSG="";status("");draw();};' +
  'var ins=document.getElementById("bcinscp");' +
  'if(ins)ins.onclick=function(){bcCopy("【時間】",ins);};' +
  'function bldJa(){MJA=BORDER.map(function(x,k){' +
  'return {label:ordLabel(k,false),atama:x[0],sei:x[1],' +
  'text:joinBody(MBODYS[k]||"",timesOf(x[0],x[1]))};});}' +
  'var ok1=document.getElementById("bcmok");' +
  'if(ok1)ok1.onclick=function(){if(ta)MBODYS[MIDX]=ta.value;' +
  'if(MIDX<BORDER.length-1){MIDX++;status("");draw();return;}' +
  'bldJa();MSTEP=5;MMSG="";status("");draw();};' +
  'var oka=document.getElementById("bcmauto");' +
  'if(oka)oka.onclick=function(){bldJa();makeZh();};' +
  'var ok2=document.getElementById("bcmman");' +
  'if(ok2)ok2.onclick=function(){if(ta)MBODYS[MIDX]=ta.value;' +
  'bldJa();MSTEP=1;MIDX=0;MMSG="";status("");draw();};' +
  'var ok3=document.getElementById("bcmnozh");' +
  'if(ok3)ok3.onclick=function(){if(ta)MBODYS[MIDX]=ta.value;' +
  'bldJa();MZH=BORDER.map(function(x,k){' +
  'return {label:ordLabel(k,true),atama:x[0],sei:x[1],text:""};});' +
  'M6FROM=5;MSTEP=6;MMSG="";status("");saveNow();draw();};' +
  'var zta=document.getElementById("bcmzbody");' +
  'if(zta)zta.oninput=function(){MZBODYS[MIDX]=zta.value;' +
  'var zx=BORDER[MIDX],zdone=joinBody(zta.value,zhOf(timesOf(zx[0],zx[1],true)));' +
  'var zpv=document.getElementById("bcmzprev");' +
  'if(zpv)zpv.textContent=zta.value.replace(/^\\s+|\\s+$/g,"")?bcLineWrap_(zdone):' +
  '("空欄のため、"+ordLabel(MIDX,true)+"には配信しません");' +
  'var znm=document.getElementById("bcmznum");' +
  'if(znm){var zov=ulen(zdone)>MAXT;znm.textContent=zta.value?numMsg(ulen(zdone)):"";' +
  'znm.className="bcnum"+(zov?" over":"");}' +
  'saveNow();refreshBtns();};' +
  'var zok=document.getElementById("bcmzok");' +
  'if(zok)zok.onclick=function(){if(zta)MZBODYS[MIDX]=zta.value;' +
  'MIDX++;status("");draw();};' +
  'function bldZhMan(){MZH=BORDER.map(function(x,k){' +
  'return {label:ordLabel(k,true),atama:x[0],sei:x[1],' +
  'text:joinBody(MZBODYS[k]||"",zhOf(timesOf(x[0],x[1],true)))};});}' +
  'var zok3=document.getElementById("bcmzok3");' +
  'if(zok3)zok3.onclick=function(){if(zta)MZBODYS[MIDX]=zta.value;' +
  'MBACK=1;bldZhMan();applyAll(true);};' +
  'var z6=document.getElementById("bcmzok6");' +
  'if(z6)z6.onclick=function(){if(zta)MZBODYS[MIDX]=zta.value;bldZhMan();M6FROM=1;MSTEP=6;MMSG="";status("");saveNow();draw();};' +
  'var o6=document.getElementById("bcmok6");' +
  'if(o6)o6.onclick=function(){M6FROM=2;MSTEP=6;MMSG="";status("");saveNow();draw();};' +
  'var zok3n=document.getElementById("bcmzok3n");' +
  'if(zok3n)zok3n.onclick=function(){if(zta)MZBODYS[MIDX]=zta.value;' +
  'MBACK=1;bldZhMan();applyAll(false);};' +
  'var ok4=document.getElementById("bcmok3");' +
  'if(ok4)ok4.onclick=function(){MBACK=6;applyAll(true);};' +
  'var ok4n=document.getElementById("bcmok3n");' +
  'if(ok4n)ok4n.onclick=function(){MBACK=6;applyAll(false);};' +
  'var rt=document.getElementById("bcmretr");' +
  'if(rt)rt.onclick=function(){var k=MIDX;MBUSY=true;' +
  'MMSG="「"+ordLabel(k,true)+"」を再翻訳しています…（1分ほど）";status("");draw();' +
  'transIdx(k,true,function(s,lst){' +
  'MZH[k]={label:ordLabel(k,true),atama:BORDER[k][0],sei:BORDER[k][1],text:s};' +
  'MBUSY=false;MMSG=lst?"※翻訳文の中に時間の挿入位置が残らなかったため、時間は文の最後に追加しました。":"";' +
  'saveNow();draw();},' +
  'function(m){MBUSY=false;MMSG="";status("訳せませんでした："+m,true);draw();});};}' +
  'function transOne(s,g,cb,onErr,force){if(!String(s||"").trim()){cb("");return;}' +
  'var fd={text:s,gender:(g||"共通"),quality:"1"};if(force)fd.force="1";' +
  'ask("translate",{fields:JSON.stringify(fd)},' +
  'function(r){var v=(r&&typeof r==="object")?((r.note!==undefined)?r.note:(r.result||"")):r;' +
  'cb(String(v==null?"":v));},onErr);}' +
  'var ZSEP="＝＝＝＝＝＝＝＝";' +
  'function zsplit(s){var m=String(s||"").split(/[＝=]{5,}/);' +
  'return (m.length>=2)?[m[0],m.slice(1).join("")]:null;}' +
  'function zhCompose(k,z0,had){var x=BORDER[k],tt=zhOf(timesOf(x[0],x[1],true));' +
  'var z=String(z0||"").replace(/^\\s+|\\s+$/g,""),s;' +
  'var pair=had?zsplit(z):null;' +
  'if(pair){var a=pair[0].replace(/^\\s+|\\s+$/g,""),b=pair[1].replace(/^\\s+|\\s+$/g,"");' +
  's=(a?(a+"\\n\\n"):"")+tt+(b?("\\n\\n"+b):"");}' +
  'else{z=z.replace(/[＝=]{5,}/g,"").replace(/^\\s+|\\s+$/g,"");' +
  's=z?(z+"\\n\\n"+tt):"";}' +
  'return s;}' +
  'function zhSend(k){var b0=String(MBODYS[k]||"").replace(/^\\s+|\\s+$/g,"");' +
  'var k0=b0.indexOf("【時間】"),had=(k0>=0);' +
  'return {b0:b0,had:had,send:had?(b0.slice(0,k0).replace(/\\s+$/,"")+"\\n\\n"+ZSEP+"\\n\\n"+' +
  'b0.slice(k0+4).replace(/^\\s+/,"")):b0,sei:(BORDER[k][1]==="男性")?"男":"女"};}' +
  'function transIdx(k,force,cb,onErr){var o=zhSend(k);' +
  'transOne(o.send,o.sei,function(z){var zz=String(z||"").replace(/^\\s+|\\s+$/g,"");' +
  'cb(zhCompose(k,zz,o.had),o.had&&!zsplit(zz));},onErr,force);}' +
  'function makeZh(){var N=BORDER.length,zs=[],i=0,lost=0;' +
  'var need=[],w;for(w=0;w<N;w++)' +
  'if(String(MBODYS[w]||"").replace(/^\\s+|\\s+$/g,""))need.push(w);' +
  'var nn=need.length,dn=0;' +
  'MBUSY=true;MMSG="台湾のお客様向けに訳しています…（1つ1分ほど）";draw();' +
  'function ng(m){MBUSY=false;MMSG="";status("訳せませんでした："+m,true);draw();}' +
  '(function next(){' +
  'if(i>=N){' +
  'MZH=BORDER.map(function(x,k){var g=zs[k]||{z:"",had:false};' +
  'return {label:ordLabel(k,true),atama:x[0],sei:x[1],text:zhCompose(k,g.z,g.had)};});' +
  'MBUSY=false;MSTEP=2;MIDX=(zLive()[0]===undefined)?0:zLive()[0];status("");' +
  'MMSG=lost?("※"+lost+"つで、翻訳文の中に時間の挿入位置が残らなかったため、"+' +
  '"時間は文の最後に追加しました。"):"";' +
  'draw();return;}' +
  'var o=zhSend(i),b0=o.b0,had=o.had,send=o.send,sei=o.sei;' +
  'if(!b0){zs[i]={z:"",had:false};i++;next();return;}' +
  'dn++;MMSG=dn+" / "+nn+"　「"+ordLabel(i,false)+"」を訳しています…";draw();' +
  'var same=-1,q;for(q=0;q<i;q++)' +
  'if(String(MBODYS[q]||"").replace(/^\\s+|\\s+$/g,"")===b0&&BORDER[q][1]===BORDER[i][1])same=q;' +
  'if(same>=0){zs[i]=zs[same];i++;next();return;}' +
  'transOne(send,sei,function(z){var zz=String(z||"").replace(/^\\s+|\\s+$/g,"");' +
  'if(had&&!zsplit(zz))lost++;' +
  'zs[i]={z:zz,had:had};i++;next();},ng);' +
  '})();}' +
  'function applyAll(mkimg){MBUSY=true;MMSG="対象に文章を追加しています…";draw();' +
  'SENDN=[];' +
  'MJA.concat(MZH).forEach(function(x){' +
  'if(!String(x.text||"").replace(/^\\s+|\\s+$/g,""))return;' +
  'var lg=(MJA.indexOf(x)>=0)?"ja":"zh";' +
  'tgtNames(x.atama,x.sei,lg).forEach(function(nm){' +
  'if(SENDN.indexOf(nm)<0)SENDN.push(nm);});});' +
  'MJA.forEach(function(x){putTextInto(tgtNames(x.atama,x.sei,"ja"),x.text);});' +
  'MZH.forEach(function(x){putTextInto(tgtNames(x.atama,x.sei,"zh"),x.text);});' +
  'TPL.forEach(function(tp,i){if(SENDN.indexOf(tp.name)>=0)return;' +
  'var ps=DATA[i].parts;' +
  'for(var k=ps.length-1;k>=0;k--)' +
  'if(ps[k].kind==="image"&&(ps[k].src||"").indexOf("made:")===0)ps.splice(k,1);});' +
  'if(!mkimg){MBUSY=false;MMSG="";page="t";step=0;mode="";' +
  'status("");draw();return;}' +
  'var gsA=(SRES&&SRES.groups)||[];' +
  'var src=gsA.map(function(g){var twin=false;' +
  'gsA.forEach(function(o){if(o.z&&!g.z&&o.atama===g.atama&&o.sei===g.sei)twin=true;});' +
  'var head=g.atama+(g.sei||"");' +
  'return (g.z?"🇹🇼\\n":(twin?"🇯🇵\\n":""))+head+"\\n"+g.text;}).join("\\n\\n");' +
  'WDONE=[];' +
  'runMake(src,function(i,tot,label){' +
  'MMSG="画像を生成しています… "+i+"枚できました（全"+tot+"枚）　作成中："+label;draw();},' +
  'function(done,err){MBUSY=false;MSTEP=3;MMSG="";page="t";step=0;mode="";' +
  'status((err==="中止")?"画像生成を中止しました。":(err?("画像を作成できませんでした："+err):""),!!(err&&err!=="中止"));' +
  'draw();});}' +
  'function drawOne(){' +
  'var t=TPL[step],d=DATA[step],n=d.parts.length,left=MAXP-n;' +
  'var lv=tLive(),pos=lv.indexOf(step);' +
  'var mt=(mode==="tag")?"タグを変更":(mode==="img")?((ADDAT>=0?(ADDAT+1)+"つ目に":"")+"追加する画像を選ぶ")' +
  ':(mode==="txt")?((EDI>=0)?"文章を修正":((ADDAT>=0?(ADDAT+1)+"つ目に":"")+"文章を追加")):(mode==="see")?"文章を見る":"最終確認";' +
  'var h=\'<div class="bcstop"><span class="bcsttl">\'+mt+\'</span>\'+' +
  '\'<span class="bcsno">\'+(pos+1)+\' / \'+lv.length+\'</span></div>\'+' +
  '(mode?"":\'<div class="bcsubnote">※画像や文章を追加できます</div>\')+' +
  '\'<div class="bccard"><div class="bcnamerow"><div class="bcname">\'+esc(t.name)+\'</div>\'+' +
  '(mode==="tag"?"":\'<button type="button" class="bcmv" id="bctag">タグを変更</button>\')+\'</div>\'+' +
  '\'<div class="bcwho">\'+whoTxt(step,t)+\'</div><div class="bchr"></div>\';' +
  'if(n&&n<MAXP&&!mode)h+=\'<div class="bcaddslot"><span class="bcpno">1つ目の前に追加</span>\'+' +
  '\'<button type="button" data-addimg="0">🖼️ 画像を追加</button>\'+' +
  '\'<button type="button" data-addtx="0">✍ 文章を追加</button></div>\';' +
  'if(n&&!mode){h+=d.parts.map(function(p,i){var th=partThumb(p);' +
  'return \'<div class="bcpart"><span class="bcpno">\'+(i+1)+\'つ目</span>\'+' +
  '(th?(\'<img src="\'+th+\'" data-big="\'+i+\'" style="cursor:zoom-in">\'):"")+' +
  '\'<span class="bcptx">\'+esc(partLabel(p))+\'</span>\'+' +
  '\'<span class="bcpbtns">\'+' +
  '(i>0?(\'<button type="button" class="bcmv" data-up="\'+i+\'">▲</button>\'):"")+' +
  '((i<n-1)?(\'<button type="button" class="bcmv" data-dn="\'+i+\'">▼</button>\'):"")+' +
  '\'<button type="button" class="bcmv" data-edit="\'+i+\'">修正</button>\'+' +
  '\'<button type="button" class="bcdel" data-del="\'+i+\'">消去</button></span></div>\'+' +
  '(p.kind==="text"?(\'<div class="bcbubcap">お客様のスマホでの見え方（文字の大きさ＝中）</div><div class="bcpvtx bcbub">\'+esc(bcLineWrap_(p.text||""))+\'</div>\')' +
  ':(th?(\'<img class="bcpvimg" src="\'+th+\'" data-big="\'+i+\'">\'):""));}).join("");' +
  'h+=\'<input type="file" accept="image/*" id="bcrepfile" style="display:none">\';}' +
  'if(!mode){for(var sk=n;sk<MAXP;sk++){' +
  'h+=\'<div class="bcaddslot"><span class="bcpno">\'+(sk+1)+\'つ目</span>\'+' +
  '\'<button type="button" data-addimg="\'+sk+\'">🖼️ 画像を追加</button>\'+' +
  '\'<button type="button" data-addtx="\'+sk+\'">✍ 文章を追加</button></div>\';}' +
  'if(n>=MAXP)h+=\'<div class="bcwho">\'+MAXP+\'つまで送れます（いっぱいです）。\'+' +
  '\'入れ替える時は「消去」してから追加してください😊</div>\';}' +
  'if(mode==="img"){' +
  'h+=\'<div class="bchr"></div><div class="bcleft">\'+(ADDAT+1)+\'つ目に追加する画像を選ぶ</div><div class="bcgrid">\'+' +
  'picks().map(function(p){return \'<div class="bcpick\'+(p.made?" new":"")+\'">\'+' +
  '\'<button type="button" class="sel" data-pre="\'+esc(p.key)+\'">\'+' +
  '\'<img src="\'+p.thumb+\'"><span>\'+esc(p.label)+\'</span></button>\'+' +
  '\'<button type="button" class="bczoom" data-zoom="\'+esc(p.key)+\'">🔍 大きく見る</button></div>\';' +
  '}).join("")+\'</div>\'+' +
  '\'<div class="bcleft" style="margin-top:14px">別の画像を選ぶ</div><input type="file" accept="image/*" id="bcfile">\'+' +
  '\'</div><button type="button" class="bcghost" id="bccancel">やめる</button>\';}' +
  'else if(mode==="tag"){' +
  'var cur=(TAGS[step]&&TAGS[step].length)?TAGS[step]:defTags(t);' +
  'h+=\'<div class="bchr"></div><div class="bcleft">送るタグをえらぶ（いくつでも選べます。もう一度押すと外れます）</div>\';' +
  'if(TAGBUSY){h+=\'<div class="bcouttx">タグの一覧を読んでいます…</div>\';}' +
  'else if(!TAGLIST.length){h+=\'<div class="bcouttx">タグの一覧を読み込めませんでした。</div>\';}' +
  'else{h+=\'<div class="bctaglist">\'+TAGLIST.map(function(x){' +
  'return \'<button type="button" data-tag="\'+esc(x)+\'" class="\'+' +
  '((cur.indexOf(x)>=0)?"on":"")+\'">\'+esc(x)+\'</button>\';}).join("")+\'</div>\';' +
  'var curx=xOf(step);' +
  'h+=\'<div class="bchr"></div><div class="bcleft">送らないタグ（このタグが付いている人には送りません。いくつでも選べます）</div>\'+' +
  '\'<div class="bctaglist bcx">\'+TAGLIST.map(function(x){' +
  'return \'<button type="button" data-xtag="\'+esc(x)+\'" class="\'+' +
  '((curx.indexOf(x)>=0)?"on":"")+\'">\'+esc(x)+\'</button>\';}).join("")+\'</div>\';}' +
  'h+=\'</div>\';' +
  'h+=\'<button type="button" class="bcgo" id="bctagok">このタグで送る</button>\'+' +
  '\'<button type="button" class="bcghost" id="bctagdef">最初のタグに戻す（\'+esc(t.who)+\'）</button>\'+' +
  '\'<button type="button" class="bcghost" id="bctagcancel">タグを変更せずに戻る</button>\';}' +
  'else if(mode==="see"){' +
  'var sp=d.parts[EDI]||{text:""};' +
  'h+=\'<div class="bchr"></div><div class="bcleft">\'+(EDI+1)+\'つ目の文章（\'+ulen(sp.text)+\'文字）</div>\'+' +
  '\'<div class="bcouttx bcseetx">\'+esc(sp.text||"")+\'</div></div>\'+' +
  '\'<button type="button" class="bcgo" id="bcseeedit">この文章を修正する</button>\'+' +
  '\'<button type="button" class="bcghost" id="bccancel">閉じる</button>\';}' +
  'else if(mode==="txt"){' +
  'var old=(EDI>=0&&d.parts[EDI])?(d.parts[EDI].text||""):"";' +
  'h+=\'<div class="bchr"></div><div class="bcleft">\'+((EDI>=0)?"文章を修正":((ADDAT+1)+"つ目に文章を追加"))+' +
  '\'（\'+MAXT+\'文字まで）</div>\'+' +
  '\'<textarea id="bctxt" placeholder="この対象へ送る文章">\'+esc(old)+\'</textarea>\'+' +
  '\'<div class="bccount" id="bccnt">\'+ulen(old)+\' / \'+MAXT+\' 文字</div></div>\'+' +
  '\'<button type="button" class="bcgo" id="bcaddtxt">\'+' +
  '((EDI>=0)?"この文章に修正する":"この文章を追加")+\'</button>\'+' +
  '\'<button type="button" class="bcghost" id="bccancel">\'+((EDI>=0)?"修正はしない":"追加はしない")+\'</button>\';}' +
  'else{' +
  'h+=\'</div>\';' +
  'if(n)h+=\'<button type="button" class="bcgo" id="bcnext">この内容でOK</button>\';' +
  'h+=\'<button type="button" class="bcmini" id="bcskip">この対象は送らない（飛ばす）</button>\';' +
  '\'\';}' +
  'box.innerHTML=freshBar()+h;bindOne();bindFresh();}' +
  'function readImg(f,cb){if(!f||!/^image\\//.test(f.type)){cb(null);return;}' +
  'var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){' +
  'var mx=1280,w=im.width,h=im.height;if(w>mx||h>mx){if(w>=h){h=Math.round(h*mx/w);w=mx;}else{w=Math.round(w*mx/h);h=mx;}}' +
  'var cv=document.createElement("canvas");cv.width=w;cv.height=h;cv.getContext("2d").drawImage(im,0,0,w,h);' +
  'var durl=cv.toDataURL("image/jpeg",0.82);' +
  'cb({kind:"image",src:"",b64:durl.split(",")[1],thumb:durl});};im.src=fr.result;};fr.readAsDataURL(f);}' +
  'function addAt(d,obj){if(d.parts.length>=MAXP){status(MAXP+"つまでです。",true);return;}' +
  'var at=(ADDAT<0||ADDAT>d.parts.length)?d.parts.length:ADDAT;d.parts.splice(at,0,obj);ADDAT=-1;}' +
  'function bindOne(){' +
  'var d=DATA[step];' +
  '[].slice.call(box.querySelectorAll("[data-del]")).forEach(function(b){b.onclick=function(){' +
  'd.parts.splice(+b.getAttribute("data-del"),1);draw();};});' +
  '[].slice.call(box.querySelectorAll("[data-up]")).forEach(function(b){b.onclick=function(){' +
  'var i=+b.getAttribute("data-up");if(i<1)return;' +
  'var v=d.parts[i];d.parts[i]=d.parts[i-1];d.parts[i-1]=v;saveNow();draw();};});' +
  '[].slice.call(box.querySelectorAll("[data-dn]")).forEach(function(b){b.onclick=function(){' +
  'var i=+b.getAttribute("data-dn");if(i>=d.parts.length-1)return;' +
  'var v=d.parts[i];d.parts[i]=d.parts[i+1];d.parts[i+1]=v;saveNow();draw();};});' +
  'var rep=document.getElementById("bcrepfile"),REPI=-1;' +
  '[].slice.call(box.querySelectorAll("[data-edit]")).forEach(function(b){b.onclick=function(){' +
  'var i=+b.getAttribute("data-edit"),p=d.parts[i];if(!p)return;' +
  'if(p.kind==="text"){EDI=i;mode="txt";draw();return;}' +
  'if(rep){REPI=i;rep.value="";rep.click();}};});' +
  'if(rep)rep.onchange=function(){var f=rep.files&&rep.files[0];if(!f||REPI<0)return;' +
  'readImg(f,function(obj){if(!obj)return;d.parts[REPI]=obj;REPI=-1;saveNow();status("画像を入れ替えました。");draw();});};' +
  '[].slice.call(box.querySelectorAll("[data-see]")).forEach(function(b){b.onclick=function(){' +
  'var i=+b.getAttribute("data-see"),p=d.parts[i];if(!p)return;' +
  'if(p.kind==="text"){EDI=i;mode="see";draw();return;}' +
  'var nm=((p.src||"").indexOf("made:")===0)?p.src.slice(5):"";bigView(partThumb(p),nm);};});' +
  'var se=document.getElementById("bcseeedit");' +
  'if(se)se.onclick=function(){mode="txt";draw();};' +
  '[].slice.call(box.querySelectorAll("[data-big]")).forEach(function(b){b.onclick=function(){' +
  'var p=d.parts[+b.getAttribute("data-big")];if(!p)return;' +
  'var nm=((p.src||"").indexOf("made:")===0)?p.src.slice(5):"";' +
  'bigView(partThumb(p),nm);};});' +
  'var e;' +
  'if(e=document.getElementById("bcimg"))e.onclick=function(){ADDAT=-1;mode="img";draw();};' +
  '[].slice.call(box.querySelectorAll("[data-addimg]")).forEach(function(b){b.onclick=function(){' +
  'ADDAT=+b.getAttribute("data-addimg");mode="img";status("");draw();};});' +
  '[].slice.call(box.querySelectorAll("[data-addtx]")).forEach(function(b){b.onclick=function(){' +
  'ADDAT=+b.getAttribute("data-addtx");EDI=-1;mode="txt";status("");draw();};});' +
  'if(e=document.getElementById("bctx"))e.onclick=function(){ADDAT=-1;EDI=-1;mode="txt";draw();};' +
  'if(e=document.getElementById("bctag"))e.onclick=function(){mode="tag";TAGSNAP=(TAGS[step]||[]).slice();XTAGSNAP=Array.isArray(XTAGS[step])?XTAGS[step].slice():null;status("");' +
  'if(!TAGLIST.length&&!TAGBUSY){TAGBUSY=true;draw();' +
  'ask("bc_tags",{},function(r){TAGBUSY=false;' +
  'TAGLIST=((r&&r.tags)||[]);if(!TAGLIST.length&&r&&r.note)status(r.note,true);draw();},' +
  'function(m){TAGBUSY=false;status(m,true);draw();});return;}' +
  'draw();};' +
  '[].slice.call(box.querySelectorAll("[data-tag]")).forEach(function(b){b.onclick=function(){' +
  'var x=b.getAttribute("data-tag"),a=((TAGS[step]&&TAGS[step].length)?TAGS[step]:defTags(TPL[step])).slice(),k=a.indexOf(x);' +
  'if(k>=0)a.splice(k,1);else{a.push(x);' +
  'var xa=xOf(step).slice(),xk=xa.indexOf(x);if(xk>=0){xa.splice(xk,1);XTAGS[step]=xa;}}' +
  'TAGS[step]=a;saveNow();draw();};});' +
  '[].slice.call(box.querySelectorAll("[data-xtag]")).forEach(function(b){b.onclick=function(){' +
  'var x=b.getAttribute("data-xtag"),a=xOf(step).slice(),k=a.indexOf(x);' +
  'if(k>=0)a.splice(k,1);else{a.push(x);' +
  'var ia=((TAGS[step]&&TAGS[step].length)?TAGS[step]:defTags(TPL[step])).slice(),ik=ia.indexOf(x);' +
  'if(ik>=0){ia.splice(ik,1);TAGS[step]=ia;}}' +
  'XTAGS[step]=a;saveNow();draw();};});' +
  'if(e=document.getElementById("bctagok"))e.onclick=function(){' +
  'if(!((TAGS[step]&&TAGS[step].length)?TAGS[step]:defTags(TPL[step])).length){status("タグを1つ以上選択してください😊",true);return;}' +
  'if(sameSet(TAGS[step],defTags(TPL[step])))TAGS[step]=[];' +
  'if(sameSet(xOf(step),defX(TPL[step])))XTAGS[step]=null;' +
  'mode="";saveNow();status("タグを確定しました。");draw();};' +
  'if(e=document.getElementById("bctagdef"))e.onclick=function(){TAGS[step]=[];XTAGS[step]=null;saveNow();status("");draw();};' +
  'if(e=document.getElementById("bctagcancel"))e.onclick=function(){TAGS[step]=(TAGSNAP||[]).slice();XTAGS[step]=XTAGSNAP?XTAGSNAP.slice():null;mode="";saveNow();status("");draw();};' +
  'if(e=document.getElementById("bccancel"))e.onclick=function(){EDI=-1;mode="";draw();};' +
  'if(e=document.getElementById("bcnext"))e.onclick=function(){' +
  'step=nextLive(step);mode="";status("");draw();};' +
  'if(e=document.getElementById("bcskip"))e.onclick=function(){' +
  'var q=nextLive(step);d.parts=[];step=q;mode="";status("");saveNow();draw();};' +
  'if(e=document.getElementById("bcprev"))e.onclick=function(){step--;mode="";status("");draw();};' +
  '[].slice.call(box.querySelectorAll("[data-pre]")).forEach(function(b){b.onclick=function(){' +
  'var k=b.getAttribute("data-pre");var pr=preOf(k);' +
  'addAt(d,{kind:"image",src:(pr&&pr.made?"made:":"preset:")+k});mode="";saveNow();draw();};});' +
  '[].slice.call(box.querySelectorAll("[data-zoom]")).forEach(function(b){b.onclick=function(ev){' +
  'ev.stopPropagation();var k=b.getAttribute("data-zoom");var pr=preOf(k);if(!pr)return;' +
  'bigView(pr.thumb, pr.made?k:"");};});' +
  'var fe=document.getElementById("bcfile");' +
  'if(fe)fe.onchange=function(){var f=fe.files&&fe.files[0];if(!f)return;' +
  'readImg(f,function(obj){if(!obj)return;addAt(d,obj);mode="";saveNow();draw();});};' +
  'var ta=document.getElementById("bctxt"),cnt=document.getElementById("bccnt"),ad=document.getElementById("bcaddtxt");' +
  'function growTa(){if(!ta)return;ta.style.height="0px";ta.style.height=(ta.scrollHeight+12)+"px";}' +
  'if(ta){ta.focus();growTa();setTimeout(growTa,0);setTimeout(growTa,200);' +
  'ta.oninput=function(){var L=ulen(ta.value.replace(/^\\s+|\\s+$/g,""));cnt.textContent=L+" / "+MAXT+" 文字"+(L>MAXT?("（あと"+(L-MAXT)+"文字減らしてください😊）"):"");' +
  'cnt.className="bccount"+(L>MAXT?" over":"");growTa();};' +
  'ad.onclick=function(){var v=(ta.value||"").trim();' +
  'if(!v){status("文章が空です。",true);return;}' +
  'if(ulen(v)>MAXT){status("文章は"+MAXT+"文字までです（いまは"+ulen(v)+"文字）。",true);return;}' +
  'if(EDI>=0&&d.parts[EDI]){d.parts[EDI].text=v;}else{addAt(d,{kind:"text",text:v});}' +
  'EDI=-1;mode="";status("");saveNow();draw();};}}' +
  'function drawLast(){' +
  'function two(n){return ("0"+n).slice(-2);}' +
  'var t=new Date();t.setDate(t.getDate()+1);var m=0;' +
  'var h=\'<div class="bccard"><div class="bcname">最終確認</div><div class="bchr"></div>\';' +
  'TPL.forEach(function(x,i){var n=filled(i);if(!n)return;m++;' +
  'h+=\'<div class="bcsum"><b>\'+esc(x.name)+\'</b><span class="on">\'+esc(bcSumOf(i))+\'</span>\'+' +
  '\'<button type="button" class="bcmv bcseeall" data-seeall="\'+i+\'">内容を確認</button></div>\'+' +
  '\'<div class="bcwho" style="margin:0 0 8px">\'+whoTxt(i,x)+\'</div>\';});' +
  'h+=\'</div>\';' +
  'if(!m)h+=\'<div class="bcstatus on">内容を入力した対象がありません。\'+' +
  '\'左上の「← 戻る」から入力してください😊</div>\';' +
  'else if(LMODE!=="at"){' +
  'h+=\'<button type="button" class="bcgo" id="bcplan">送信の予約を設定する</button>\'+' +
  '\'<button type="button" class="bctxt" id="bcnow">今すぐ送信する</button>\';}' +
  'else{' +
  'h+=\'<div class="bccard"><div class="bcleft">送る日時\'+' +
  '((m>1)?"（1本目。2本目からは少しずつ後ろへずらします）":"")+\'</div>\'+' +
  '\'<div class="bcdt"><div><input type="date" id="bcdate" value="\'+t.getFullYear()+"-"+' +
  'two(t.getMonth()+1)+"-"+two(t.getDate())+\'"></div>\'+' +
  '\'<div><input type="time" id="bctime" value="11:00"></div></div></div>\'+' +
  '\'<button type="button" class="bcgo" id="bcplace">この内容で \'+m+\'通り 予約する</button>\'+' +
  '\'\';}' +
  'box.innerHTML=h;' +
  '[].slice.call(box.querySelectorAll("[data-seeall]")).forEach(function(b){b.onclick=function(){bcSeeAll(+b.getAttribute("data-seeall"));};});' +
  'var e=document.getElementById("bcplan");' +
  'if(e)e.onclick=function(){LMODE="at";status("");draw();};' +
  'e=document.getElementById("bcnoat");' +
  'if(e)e.onclick=function(){LMODE="";status("");draw();};' +
  'e=document.getElementById("bcnow");if(e)e.onclick=function(){doPlace(true);};' +
  'e=document.getElementById("bcplace");if(e)e.onclick=function(){doPlace(false);};}' +
  'function doPlace(now){' +
  'var dateEl=document.getElementById("bcdate"),timeEl=document.getElementById("bctime");' +
  'var d0=now?"":(dateEl?dateEl.value:""),t0=now?"":(timeEl?timeEl.value:"");' +
  'var items=[],n=0;' +
  'TPL.forEach(function(t,i){var ps=DATA[i].parts;if(!ps.length)return;n++;' +
  'items.push({name:t.name,tags:(TAGS[i]||[]),exclude_tags:sendX(i),' +
  'parts:ps.map(function(p){return p.kind==="text"?{kind:"text",text:p.text}:{kind:"image",src:p.src,b64:p.b64};})});});' +
  'if(!n){status("文章か画像を入力した対象が1つもありません。",true);return;}' +
  'szPopup_(now?("いますぐ "+n+"通りの配信を送ります。よろしいでしょうか？😊")' +
  ':(d0+" "+t0+" から、"+n+"通りの配信を予約します。よろしいでしょうか？😊"),{cancel:true,onYes:function(){try{' +
  'var go=document.getElementById(now?"bcnow":"bcplace");if(go)go.disabled=true;' +
  'szOvShow_(szBusyHtml_(now?"配信を送っています":"配信を予約しています","LINEへの登録が終わったら自動で切り替わります。少し待っててくださいね🥺"),"#2C7A99");' +
  'var jobs=[];items.forEach(function(it){it.parts.forEach(function(p){' +
  'if(p.kind==="image"&&p.b64){var nm=rnd();p.src="upload:"+nm;jobs.push(pushImage(nm,{b64:p.b64,mime:"image/jpeg"}));}' +
  'delete p.b64;});});' +
  'var itemsName="bc_items_"+((idn.device||"x").replace(/[^a-z0-9_]/g,"").slice(0,20)||"d")+".json";' +
  'jobs.push(pushImage(itemsName,{items:items}));' +
  'Promise.all(jobs).catch(function(){}).then(function(){setTimeout(function(){' +
  'ask("line_broadcast",{fields:JSON.stringify({category:CAT,date:d0,' +
  'time:t0,now:(now?1:0),items_from:itemsName,who:idn.who})},' +
  'function(d){if(go)go.disabled=false;szOvHide_();' +
  'status(d.note||(now?"送りました。":"予約しました。"),!d.ok);' +
  'if(d.ok&&CMODE){campDone();step=0;page="l";mode="";LPOSTS=null;draw();}' +
  'else if(d.ok){DATA=TPL.map(function(){return {parts:[]};});' +
  'MJA=[];MZH=[];MSTEP=0;MIDX=0;MMSG="";MBODY="";MBODYS=["","","",""];' +
  'MZBODYS=["","","",""];TAGS=[];' +
  'WTEXT="";SRES=null;SPER="";SIDX=0;FRESH=false;LMODE="";' +
  'wipClear();step=0;page="l";mode="";draw();}},' +
  'function(m2){if(go)go.disabled=false;szOvHide_();status(m2,true);});},1200);});' +
  '}catch(err){var g2=document.getElementById(now?"bcnow":"bcplace");' +
  'if(g2)g2.disabled=false;try{szOvHide_();}catch(e2){}' +
  'status((now?"送れませんでした：":"予約できませんでした：")+' +
  '(err&&err.message?err.message:err),true);}}});}' +
  'function postsOf(d,cb){if(d&&d.posts_file){jsonp({action:"data",name:d.posts_file},function(x){' +
  'cb((x&&x.posts)||[]);});return;}cb((d&&d.posts)||[]);}' +
  'function loadList(){var el=document.getElementById("bclist");if(!el)return;' +
  'ask("bc_list",{},function(d){' +
  'LBATCH=((d.batch&&d.batch.n)||0);postsOf(d,function(p){LPOSTS=p;drawList(LPOSTS);});},' +
  'function(m){el.innerHTML=\'<div class="bcouttx">読み込めませんでした。</div>\';status(m,true);});}' +
  'function drawList(posts){var el=document.getElementById("bclist");if(!el)return;' +
  'LPOSTS=posts||LPOSTS;' +
  'var wait=(posts||[]).filter(function(r){' +
  'return r.state==="placed"||r.state==="draft";});' +
  'var done=(posts||[]).filter(function(r){' +
  'return r.state==="sent";});' +
  'var use=(LTAB==="done")?done:wait;' +
  'var top="";' +
  'if(LTAB==="wait"){' +
  'if(wait.length)top+=\'<button type="button" class="bctxt" id="bcallcx">\'+' +
  '\'全部配信をキャンセルする（\'+wait.length+\'本）</button>\';' +
  'if(LBATCH)top+=\'<button type="button" class="bcgo" id="bcundo">\'+' +
  '\'予約キャンセルした配信を戻す（\'+LBATCH+\'本）</button>\';}' +
  'if(!use.length){el.innerHTML=top+\'<div class="bcouttx">\'+' +
  '((LTAB==="done")?"送った配信はありません。":"配信待ちはありません。")+' +
  '\'</div>\';bindList();return;}' +
  'el.innerHTML=top+use.map(function(r){' +
  'return \'<div class="bcitem"><div class="bcit1">\'+esc(r.st)+"　"+esc(r.at)+"　"+esc(r.template_name)+\'</div>\'+' +
  '\'<div class="bcit2">画像\'+r.imgs+\'枚　「\'+esc(r.head)+\'」\'+(r.note?("　"+esc(r.note)):"")+\'</div>\'+' +
  '(r.cancelable?(\'<button type="button" class="bccx" data-cx="\'+r.broadcast_id+\'">取り消し</button>\'):"")+' +
  '\'</div>\';}).join("");' +
  '[].slice.call(el.querySelectorAll("[data-cx]")).forEach(function(b){b.onclick=function(){' +
  'szPopup_("この配信を取り消しますか？😊",{cancel:true,onYes:function(){status("取り消しています…");' +
  'ask("bc_cancel",{fields:JSON.stringify({bid:b.getAttribute("data-cx")})},function(d){' +
  'status(d.note||"取り消しました。",!d.ok);LBATCH=((d.batch&&d.batch.n)||LBATCH);' +
  'postsOf(d,drawList);},function(m3){status(m3,true);});}});};});' +
  'bindList();}' +
  'function bindList(){' +
  'var a=document.getElementById("bcallcx");' +
  'if(a)a.onclick=function(){szPopup_("配信待ちを全部取り消しますか？😊\\n"+' +
  '"（内容は控えに残るため、後で元に戻せます）",{cancel:true,onYes:function(){' +
  'a.disabled=true;status("取り消しています…");' +
  'ask("bc_cancel_all",{},function(d){status(d.note||"取り消しました。",!d.ok);' +
  'LBATCH=((d.batch&&d.batch.n)||0);postsOf(d,drawList);},' +
  'function(m){a.disabled=false;status(m,true);});}});};' +
  'var u=document.getElementById("bcundo");' +
  'if(u)u.onclick=function(){szPopup_("取り消した配信を元に戻しますか？😊",{cancel:true,' +
  'onYes:function(){u.disabled=true;status("戻しています…");' +
  'ask("bc_restore",{},function(d){status(d.note||"戻しました。",!d.ok);' +
  'LBATCH=((d.batch&&d.batch.n)||0);postsOf(d,drawList);},' +
  'function(m){u.disabled=false;status(m,true);});}});};}' +
  bcCampSrc_() +

  'var rsT=null;window.addEventListener("resize",function(){' +
  'if(rsT)clearTimeout(rsT);rsT=setTimeout(function(){rsT=null;' +
  'fitTx(box.querySelector(".bcotx"));},200);});' +

  'function goBackFromT(){page="m";mode="";MSTEP=MBACK;' +
  'if(MBACK===2){var zl=zLive();MIDX=zl.length?zl[zl.length-1]:0;}' +
  'else{MIDX=BORDER.length-1;}}' +
  'function backOne(){' +
  'if(page==="k")return false;' +
  'if(CMODE&&page!=="l")return campBack();' +
  'if(page==="l"){page="k";return true;}' +
  'if(page==="w"){page="s";return true;}' +
  'if(page==="s"){var gs=(SRES&&SRES.groups)||[];' +
  'if(!gs.length){page="k";return true;}' +
  'if(SIDX>0){SIDX--;return true;}' +
  'SRES=null;SPER="";SIDX=0;return true;}' +
  'if(page==="m"){MMSG="";' +
  'if(MSTEP===3){goBackFromT();return true;}' +
  'if(MSTEP===5){MSTEP=0;MIDX=BORDER.length-1;return true;}' +
  'if(MSTEP===6){if(M6FROM===5){MSTEP=5;}else if(M6FROM===1){MSTEP=1;MIDX=BORDER.length-1;}else{MSTEP=2;var l6=zLive();MIDX=l6.length?l6[l6.length-1]:0;}return true;}' +
  'if(MSTEP===1){if(MIDX>0){MIDX--;}else{MSTEP=5;}return true;}' +
  'if(MSTEP===2){var zl2=zLive(),zp=zl2.indexOf(MIDX);' +
  'if(zp>0){MIDX=zl2[zp-1];return true;}' +
  'MSTEP=5;return true;}' +
  'if(MIDX>0){MIDX--;return true;}' +
  'page="s";return true;}' +
  'if(step>=TPL.length){if(LMODE==="at"){LMODE="";return true;}' +
  'var lv0=tLive();' +
  'if(!lv0.length){goBackFromT();return true;}' +
  'step=lv0[lv0.length-1];mode="";return true;}' +
  'if(mode){mode="";return true;}' +
  'var pq=prevLive(step);if(pq>=0){step=pq;return true;}' +
  'goBackFromT();return true;}' +
  'var uh=document.querySelector(".uhome");' +
  'if(uh)uh.onclick=function(ev){if(!backOne())return true;' +
  'ev.preventDefault();status("");draw();return false;};' +
  'draw();' +
  'ask("bc_templates",{},function(d){' +
  'if(!d||!d.templates){status("型を読み込めませんでした。",true);return;}' +
  'CAT=d.category||"";TPL=d.templates;PRE=d.presets||[];MAXP=d.max_parts||3;MAXT=d.max_text||500;' +
    'DATA=TPL.map(function(){return {parts:[]};});' +
  'WIPON=true;' +
  'var rslot=(idn.device||"x").replace(/[^a-z0-9_]/g,"").slice(0,20)||"d";' +
  'ask("bc_wakuimg",{fields:JSON.stringify({mode:"recent",slot:rslot})},function(r){' +
  'if(!r||!r.ok)return;' +
  'jsonp({action:"data",name:"bc_recent_"+(r.slot||rslot)+".json"},function(d2){' +
  'MADE=((d2&&d2.recent)||[]).map(function(x){return {key:x.key,label:x.label,thumb:x.thumb,made:true};});' +
  'if(page!=="s"&&page!=="m")draw();});},function(){});' +
  'catEl.textContent=CAT;' +
  'if(d.banner&&d.banner.kind==="live"){banEl.style.display="none";}' +
  'else if(d.banner){banEl.style.display="";banEl.textContent=d.banner.text;' +
  'banEl.style.background=(d.banner.kind==="off")?"#f8d7da":' +
  '((d.banner.kind==="practice")?"#fff3cd":((d.banner.kind==="test")?"#ffe0b2":"#d1e7dd"));}' +
  'status("");draw();' +
  '},function(m4){status(m4,true);});' +
  '})();</script>';
  return '<style>' + HOMECSS_ + css + '</style>' +
    '<div class="home">' + backBar_(base, staff, dev) +
    '<h2 class="htitle" id="bctitle">LINE一斉配信設定</h2>' +
    '<div class="bc">' +
      '<div class="bcbanner" id="bcbanner"></div>' +
      '<div class="bctop" id="bctoprow" style="display:none">'+'<span class="lb">配信内容</span><b id="bccatname"></b>' +
        '<span class="no" id="bcno"></span></div>' +

      '<div id="bcbody"></div>' +
      '<div class="bcstatus" id="bcstatus"></div>' +
    '</div>' +
  '</div>' +
  script;
}
function bcCampCode_() {
  function ulen(t) { return Array.from(String(t == null ? '' : t)).length; }
  var CAMPCAT = 'キャンペーン・商品の紹介', CAMPWIP = 'bc_wip_camp.json';
  var CGROUPS = [['日本男性', '男', '日本語'], ['日本女性', '女', '日本語'], ['台湾男性', '男', '中文'], ['台湾女性', '女', '中文']];
  var CMODE = false, CTPL = [], CDATA = {}, CLINKS = null, CLINKERR = '', CKIND = '', CGI = 0, CTAB = 0, CORIG = null, CWIPT = null;
  var CTPLBUSY = false, CWAITLAST = false;

  function campName(gi) { return CGROUPS[gi][0]; }
  function campGi(name) { for (var q = 0; q < CGROUPS.length; q++) if (campName(q) === name) return q; return -1; }
  var CTAGMODE = false, CTAGSNAP = null;
  function campTpl(gi) { for (var ti = 0; ti < CTPL.length; ti++) if (CTPL[ti].name === campName(gi)) return CTPL[ti]; return null; }
  function campInc(gi) { var c = campCell(gi); return (c.tags && c.tags.length) ? c.tags : defTags(campTpl(gi)); }
  function campExc(gi) { var c = campCell(gi); return Array.isArray(c.xtags) ? c.xtags : defX(campTpl(gi)); }
  function campDefImgs(gi) { return CLINKS ? campImages(CGROUPS[gi][2], CGROUPS[gi][1]).slice(0, MAXP - 1) : []; }
  function campCell(gi) {
    var k = campName(gi);
    if (!CDATA[k]) {
      var o1 = CDATA[k + ' 未来店'], o2 = CDATA[k + ' 来店済'];
      function hasTx(o) {
        if (!o) return false;
        if (String(o.text || '').replace(/^\s+|\s+$/g, '')) return true;
        return (o.parts || []).some(function (x) { return x.k === 'txt' && String(x.text || '').replace(/^\s+|\s+$/g, ''); });
      }
      var src = hasTx(o1) ? o1 : (hasTx(o2) ? o2 : (o1 || o2));
      CDATA[k] = src ? JSON.parse(JSON.stringify(src)) : { parts: null, set: false };
      delete CDATA[k + ' 未来店']; delete CDATA[k + ' 来店済'];
    }
    var c = CDATA[k];
    if (!c.parts) {                       
      var ps = [];
      var im = c.imgsSet ? (c.imgs || []) : campDefImgs(gi);
      im.forEach(function (u) { ps.push({ k: 'img', url: u }); });
      ps.push({ k: 'txt', text: c.text || '' });
      c.parts = ps.slice(0, MAXP); c.set = !!c.imgsSet;
      delete c.text; delete c.imgs; delete c.imgsSet;
    }
    if (!c.set && CLINKS) {               
      var txts = c.parts.filter(function (x) { return x.k === 'txt'; });
      if (!txts.length) txts = [{ k: 'txt', text: '' }];
      c.parts = campDefImgs(gi).map(function (u) { return { k: 'img', url: u }; }).concat(txts).slice(0, MAXP);
    }
    return c;
  }
  function campText(c) {
    return ((c && c.parts) || []).filter(function (x) { return x.k === 'txt' && String(x.text || '').replace(/^\s+|\s+$/g, ''); });
  }
  function campFilled(c) { return campText(c).length > 0; }
  function campAny() { for (var k in CDATA) if (campFilled(CDATA[k])) return true; return false; }
  function campTopic() {
    var ts = (CLINKS && CLINKS.topics) || [];
    for (var i = 0; i < ts.length; i++) if (ts[i].name === CKIND) return ts[i];
    return null;
  }
  function campImages(lang, sei) {
    var t = campTopic(), out = [];
    ((t && t.links) || []).forEach(function (l) {
      var nm = String(l.lang || '');
      if (nm.indexOf(lang) !== 0) return;
      if (sei === '男' && nm.indexOf('女性') >= 0) return;
      if (sei === '女' && nm.indexOf('男性') >= 0) return;
      (l.images || []).forEach(function (u) { if (out.indexOf(u) < 0) out.push(u); });
    });
    return out;
  }

  function campLoadLinks() {
    var base = location.origin + location.pathname.replace(/[^/]*$/, '');
    CLINKERR = '';
    fetch(base + 'links.json?cb=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) { CLINKS = d || { topics: [] }; if (CMODE) draw(); })
      .catch(function () { CLINKERR = '各種LINKを読み込めませんでした。通信環境を確認して、もう一度開いてください🙇'; if (CMODE) draw(); });
  }
  function campLoadTpl() {
    if (CTPLBUSY) return;
    CTPLBUSY = true;
    ask('bc_templates', { fields: JSON.stringify({ category: CAMPCAT }) }, function (d) {
      CTPLBUSY = false;
      if (!d || d.category !== CAMPCAT || !d.templates) { CWAITLAST = false; status('送り先の決まりを読み込めませんでした。', true); return; }
      CTPL = d.templates;
      if (CWAITLAST && CMODE && page === 'ce') { CWAITLAST = false; campToLast(); return; }
      if (CMODE && page === 'c') draw();
    }, function (m) { CTPLBUSY = false; CWAITLAST = false; status(m, true); });
  }
  function campEnter() {
    CMODE = true; page = 'c'; mode = ''; status('');
    if (!CLINKS) campLoadLinks();
    if (!CTPL.length) campLoadTpl();
    draw();
  }
  function campUnswap() {
    if (!CORIG) return;
    TPL = CORIG.tpl; DATA = CORIG.data; CAT = CORIG.cat; TAGS = CORIG.tags; XTAGS = CORIG.xtags || []; CORIG = null;
  }
  function campLeave() { campUnswap(); CMODE = false; }

  function campSave() {
    if (!WIPON) return;
    if (CWIPT) clearTimeout(CWIPT);
    CWIPT = setTimeout(function () {
      CWIPT = null;
      if (!campAny()) return;
      try { pushImage(CAMPWIP, { t: Date.now(), kind: CKIND, gi: CGI, tab: CTAB, page: page, data: CDATA }); } catch (e) {}
    }, 1200);
  }
  function campWipClear() {
    if (CWIPT) { clearTimeout(CWIPT); CWIPT = null; }
    try { pushImage(CAMPWIP, { t: Date.now(), data: {} }); } catch (e) {}
  }

  function drawCampKind() {
    var h = '<div class="bcstop"><span class="bcsttl">キャンペーン・商品の紹介</span></div>';
    if (CLINKERR) {
      h += '<div class="bcstatus ng">' + esc(CLINKERR) + '</div>';
    } else if (!CLINKS) {
      h += '<div class="bccard"><div class="bcouttx">各種LINKを読んでいます…</div></div>';
    } else {
      var ts = CLINKS.topics || [];
      ['キャンペーン', '商品', 'オンラインショップ', 'サービス'].forEach(function (k) {
        var list = ts.filter(function (t) { return ((t.kind === '商品' || t.kind === 'オンラインショップ' || t.kind === 'サービス') ? t.kind : 'キャンペーン') === k; });
        if ((k === 'オンラインショップ' || k === 'サービス') && !list.length) return;
        h += '<div class="bccamph">' + (k === '商品' ? '🛍️ 商品' : k === 'オンラインショップ' ? '🛒 オンラインショップ' : k === 'サービス' ? '🛎️ サービス' : '🎁 キャンペーン') + '</div>';
        if (!list.length) { h += '<div class="bccard"><div class="bcempty">各種LINKに登録がありません。</div></div>'; return; }
        h += '<div class="bccampkinds">' + list.map(function (t) {
          return '<button type="button" class="bccampkind' + (t.name === CKIND ? ' on' : '') + '" data-ck="' + esc(t.name) + '">' +
            esc(t.name) + '</button>';
        }).join('') + '</div>';
      });
    }
    h += '<button type="button" class="bctxt" id="bccrest" style="margin-top:6px">作業中のデータを復元する</button>';
    box.innerHTML = h;
    [].slice.call(box.querySelectorAll('[data-ck]')).forEach(function (b) {
      b.onclick = function () {
        var nm = b.getAttribute('data-ck');
        function go() { if (nm !== CKIND) { CDATA = {}; } CKIND = nm; CGI = 0; CTAB = 0; page = 'ce'; status(''); draw(); }
        if (CKIND && nm !== CKIND && campAny()) {
          szPopup_('入力した内容を削除して「' + nm + '」に切り替えますか？😊', { cancel: true, onYes: go });
          return;
        }
        go();
      };
    });
    var rs = document.getElementById('bccrest');
    if (rs) rs.onclick = function () {
      status('作業中のデータを検索しています…');
      jsonp({ action: 'data', name: CAMPWIP }, function (d) {
        var s = (d && d.data && typeof d.data === 'object') ? d : null;
        var any = false;
        if (s) for (var k in s.data) if (campFilled(s.data[k])) any = true;
        if (!any || !s.kind) { status('作業中のデータはありません。', true); return; }
        CDATA = s.data; CKIND = s.kind;
        CGI = (s.gi >= 0 && s.gi < CGROUPS.length) ? s.gi : 0; CTAB = s.tab ? 1 : 0;
        page = 'ce'; status('作業中のデータを復元しました。'); draw();
      });
    };
  }

  function drawCampTag(h, c, tp, inc, exc) {
    function list(cls, attr, cur) {
      return '<div class="bctaglist' + cls + '">' + TAGLIST.map(function (x) {
        return '<button type="button" ' + attr + '="' + esc(x) + '" class="' + (cur.indexOf(x) >= 0 ? 'on' : '') + '">' + esc(x) + '</button>';
      }).join('') + '</div>';
    }
    h += '<div class="bcleft">送るタグを選択（いくつでも選べます。もう一度押すと外れます）</div>';
    if (TAGBUSY) h += '<div class="bcouttx">タグの一覧を読んでいます…</div>';
    else if (!TAGLIST.length) h += '<div class="bcouttx">タグの一覧を読み込めませんでした。</div>';
    else {
      h += list('', 'data-ctag', inc) + '<div class="bchr"></div>' +
        '<div class="bcleft">送らないタグ（このタグが付いている人には送りません。いくつでも選べます）</div>' +
        list(' bcx', 'data-cxtag', exc);
    }
    h += '</div>' +
      '<button type="button" class="bcgo" id="bcctagok">このタグで送る</button>' +
      '<button type="button" class="bcghost" id="bcctagdef">最初のタグに戻す（' + esc(tp.who) + '）</button>' +
      '<button type="button" class="bcghost" id="bcctagcancel">タグを変更せずに戻る</button>';
    box.innerHTML = h;
    function del(a, x) { var k = a.indexOf(x); if (k >= 0) a.splice(k, 1); return a; }
    [].slice.call(box.querySelectorAll('[data-ctag]')).forEach(function (b) {
      b.onclick = function () {
        var x = b.getAttribute('data-ctag'), a = campInc(CGI).slice();
        if (a.indexOf(x) >= 0) del(a, x);
        else { a.push(x); if (campExc(CGI).indexOf(x) >= 0) c.xtags = del(campExc(CGI).slice(), x); }   
        c.tags = a; saveNow(); draw();
      };
    });
    [].slice.call(box.querySelectorAll('[data-cxtag]')).forEach(function (b) {
      b.onclick = function () {
        var x = b.getAttribute('data-cxtag'), a = campExc(CGI).slice();
        if (a.indexOf(x) >= 0) del(a, x);
        else { a.push(x); if (campInc(CGI).indexOf(x) >= 0) c.tags = del(campInc(CGI).slice(), x); }
        c.xtags = a; saveNow(); draw();
      };
    });
    var ok = document.getElementById('bcctagok');
    if (ok) ok.onclick = function () {
      if (!campInc(CGI).length) { status('タグを1つ以上選択してください😊', true); return; }
      if (sameSet(c.tags || [], defTags(tp))) c.tags = [];
      if (sameSet(campExc(CGI), defX(tp))) c.xtags = null;
      CTAGMODE = false; saveNow(); status('タグを確定しました。'); draw();
    };
    var df = document.getElementById('bcctagdef');
    if (df) df.onclick = function () { c.tags = []; c.xtags = null; saveNow(); status(''); draw(); };
    var cc = document.getElementById('bcctagcancel');
    if (cc) cc.onclick = function () {
      if (CTAGSNAP) { c.tags = CTAGSNAP.tags; c.xtags = CTAGSNAP.xtags; }
      CTAGMODE = false; saveNow(); status(''); draw();
    };
  }

  function drawCampEdit() {
    var g = CGROUPS[CGI], c = campCell(CGI), imgs = campImages(g[2], g[1]);
    var tp = null;
    for (var ti = 0; ti < CTPL.length; ti++) if (CTPL[ti].name === g[0]) tp = CTPL[ti];
    var last = (CGI === CGROUPS.length - 1), n = c.parts.length;
    var h = '<div class="bcstop"><span class="bcsttl">' + esc(CKIND) + '</span>' +
      '<span class="bcsno">' + (CGI + 1) + ' / ' + CGROUPS.length + '</span></div>';
    var inc = campInc(CGI), exc = campExc(CGI);
    h += '<div class="bccard"><div class="bcnamerow"><div class="bcname">' + esc(g[0]) + '</div>' +
      ((CTAGMODE || !tp) ? '' : '<button type="button" class="bcmv" id="bcctag">タグを変更</button>') + '</div>' +
      '<div class="bcwho">送り先：' + esc(tp ? inc.join('＋') : ('未来店 ' + g[0] + '＋' + g[0] + ' 来店済')) +
      (exc.length ? '　<span class="bcxw">除く：' + esc(exc.join('＋')) + '</span>' : '') + '（同じ内容を送ります）</div>' +
      '<div class="bchr"></div>';
    if (CTAGMODE && tp) { drawCampTag(h, c, tp, inc, exc); return; }
    h += '<div class="bcleft">上から順に送ります（' + MAXP + 'つまで）</div>';
    c.parts.forEach(function (x, i) {
      var kind = x.k === 'img' ? '画像' : (x.k === 'txt' ? '文章' : '画像か文章を選ぶ');
      h += '<div class="bcslot"><div class="bcslothead"><span class="bcpno">' + (i + 1) + 'つ目　' + kind + '</span>' +
        '<span class="bcpbtns">' +
        (i > 0 ? '<button type="button" class="bcmv" data-su="' + i + '">▲ 上へ</button>' : '') +
        (i < n - 1 ? '<button type="button" class="bcmv" data-sd="' + i + '">▼ 下へ</button>' : '') +
        '<button type="button" class="bcdel" data-sx="' + i + '">削除</button></span></div>';
      if (x.k === 'img') {
        if (!imgs.length) {
          h += '<div class="bcempty">この案内の' + esc(g[2]) + 'には、各種LINKに画像がありません。</div>';
        } else {
          h += '<div class="bcgrid">' + imgs.map(function (u, j) {
            var on = x.url === u;
            return '<div class="bcpick' + (on ? ' bccampon' : '') + '">' +
              '<button type="button" class="sel" data-sp="' + i + ':' + j + '"><img src="' + esc(u) + '">' +
              '<span>' + (on ? '✓ この画像を送る' : 'この画像にする') + '</span></button>' +
              '<button type="button" class="bczoom" data-cz="' + j + '">🔍 大きく見る</button></div>';
          }).join('') + '</div>';
        }
      } else if (x.k === 'txt') {
        h += '<textarea data-st="' + i + '" placeholder="' + esc(g[0]) + 'のお客様へ送る文章">' + esc(x.text || '') + '</textarea>' +
          '<div class="bccount" data-sc="' + i + '"></div>';
      } else {
        h += '<div class="bcadd"><button type="button" data-sk="' + i + ':img">🖼️ 画像にする</button>' +
          '<button type="button" data-sk="' + i + ':txt">✍ 文章にする</button></div>';
      }
      h += '</div>';
    });
    if (n < MAXP) h += '<button type="button" class="bcghost" id="bccadd">＋ 欄を追加（あと' + (MAXP - n) + 'つ）</button>';
    h += '<div class="bcempty" style="margin-top:12px">文章を入力した種類だけ配信します。</div></div>';
    h += '<button type="button" class="bcgo" id="bccnext">' + (last ? '配信内容の最終確認をする' : 'この内容でOK') + '</button>';
    box.innerHTML = h;

    function trimLen(t) { return ulen(String(t || '').replace(/^\s+|\s+$/g, '')); }
    function markTab() {}
    function changed() { c.set = true; status(''); saveNow(); draw(); }
    [].slice.call(box.querySelectorAll('[data-st]')).forEach(function (ta) {
      var i = +ta.getAttribute('data-st'), cnt = box.querySelector('[data-sc="' + i + '"]');
      function count() {
        var L = trimLen(ta.value), over = L > MAXT;
        cnt.textContent = L ? (L + ' / ' + MAXT + ' 文字' + (over ? '（あと' + (L - MAXT) + '文字減らしてください😊）' : '')) : '';
        cnt.className = 'bccount' + (over ? ' over' : '');
      }
      function grow() { ta.style.height = '0px'; ta.style.height = (ta.scrollHeight + 12) + 'px'; }
      count(); grow(); setTimeout(grow, 0);
      ta.oninput = function () { c.parts[i].text = ta.value; count(); grow(); markTab(); saveNow(); };
    });
    [].slice.call(box.querySelectorAll('[data-ct]')).forEach(function (b) {
      b.onclick = function () { CTAB = +b.getAttribute('data-ct'); status(''); saveNow(); draw(); };
    });
    [].slice.call(box.querySelectorAll('[data-su]')).forEach(function (b) {
      b.onclick = function () { var i = +b.getAttribute('data-su'), v = c.parts[i]; c.parts[i] = c.parts[i - 1]; c.parts[i - 1] = v; changed(); };
    });
    [].slice.call(box.querySelectorAll('[data-sd]')).forEach(function (b) {
      b.onclick = function () { var i = +b.getAttribute('data-sd'), v = c.parts[i]; c.parts[i] = c.parts[i + 1]; c.parts[i + 1] = v; changed(); };
    });
    [].slice.call(box.querySelectorAll('[data-sx]')).forEach(function (b) {
      b.onclick = function () {
        var i = +b.getAttribute('data-sx'), x = c.parts[i];
        function go() { c.parts.splice(i, 1); changed(); }
        if (x.k === 'txt' && trimLen(x.text)) { szPopup_(i + 1 + 'つ目の文章を削除しますか？😊', { cancel: true, onYes: go }); return; }
        go();
      };
    });
    [].slice.call(box.querySelectorAll('[data-sk]')).forEach(function (b) {
      b.onclick = function () {
        var a = b.getAttribute('data-sk').split(':'), i = +a[0];
        c.parts[i] = (a[1] === 'img') ? { k: 'img', url: imgs[0] || '' } : { k: 'txt', text: '' };
        changed();
      };
    });
    [].slice.call(box.querySelectorAll('[data-sp]')).forEach(function (b) {
      b.onclick = function () { var a = b.getAttribute('data-sp').split(':'); c.parts[+a[0]].url = imgs[+a[1]]; changed(); };
    });
    [].slice.call(box.querySelectorAll('[data-cz]')).forEach(function (b) {
      b.onclick = function () { bigView(imgs[+b.getAttribute('data-cz')], ''); };
    });
    var ad = document.getElementById('bccadd');
    if (ad) ad.onclick = function () { if (c.parts.length >= MAXP) return; c.parts.push({ k: 'new' }); changed(); };
    var ct = document.getElementById('bcctag');
    if (ct) ct.onclick = function () {
      CTAGMODE = true; status('');
      CTAGSNAP = { tags: (c.tags || []).slice(), xtags: Array.isArray(c.xtags) ? c.xtags.slice() : null };
      if (!TAGLIST.length && !TAGBUSY) {
        TAGBUSY = true; draw();
        ask('bc_tags', {}, function (r) {
          TAGBUSY = false; TAGLIST = ((r && r.tags) || []);
          if (!TAGLIST.length && r && r.note) status(r.note, true);
          draw();
        }, function (m) { TAGBUSY = false; status(m, true); draw(); });
        return;
      }
      draw();
    };
    document.getElementById('bccnext').onclick = function () {
      for (var i = 0; i < c.parts.length; i++) {
        if (c.parts[i].k === 'txt' && trimLen(c.parts[i].text) > MAXT) {
          status((i + 1) + 'つ目の文章は' + MAXT + '文字までです。', true); return;
        }
      }
      saveNow();
      if (!last) { CGI++; CTAB = 0; status(''); draw(); return; }
      campToLast();
    };
  }

  function campToLast() {
    if (!campAny()) { status('文章を入力したタブがありません。', true); return; }
    if (!CTPL.length) { CWAITLAST = true; status('送り先の決まりを読み込んでいます。終わったら自動で最終確認に進みます…'); campLoadTpl(); return; }
    if (!CORIG) CORIG = { tpl: TPL, data: DATA, cat: CAT, tags: TAGS, xtags: XTAGS };
    TPL = CTPL; CAT = CAMPCAT;
    TAGS = CTPL.map(function (t) { var gi = campGi(t.name); return gi < 0 ? [] : ((campCell(gi).tags || []).slice()); });
    XTAGS = CTPL.map(function (t) { var gi = campGi(t.name), c = gi < 0 ? null : campCell(gi); return (c && Array.isArray(c.xtags)) ? c.xtags.slice() : null; });
    DATA = CTPL.map(function (t) {
      var gi = -1;
      for (var q = 0; q < CGROUPS.length; q++) if (campName(q) === t.name) gi = q;
      if (gi < 0) return { parts: [] };
      var x = campCell(gi), ps = [];
      if (!campFilled(x)) return { parts: [] };          
      x.parts.forEach(function (sl) {
        if (sl.k === 'img' && sl.url) ps.push({ kind: 'image', src: 'link:' + sl.url, thumb: sl.url });
        var tx = (sl.k === 'txt') ? String(sl.text || '').replace(/^\s+|\s+$/g, '') : '';
        if (tx) ps.push({ kind: 'text', text: tx });
      });
      return { parts: ps };
    });
    step = TPL.length; LMODE = ''; mode = ''; page = 't'; status(''); draw();
  }
  function campDone() {
    CDATA = {}; CKIND = ''; CGI = 0; CTAB = 0; LMODE = '';
    campWipClear(); campLeave();
  }
  function bcSumOf(i) {
    var ps = (DATA[i] && DATA[i].parts) || [], ni = 0, nt = 0;
    ps.forEach(function (p) { if (p.kind === 'text') nt++; else ni++; });
    var a = [];
    if (ni) a.push('画像' + ni + '枚');
    if (nt) a.push('文章' + nt + 'つ');
    return a.join('、');
  }
  function bcSeeAll(i) {
    var t = TPL[i], ps = (DATA[i] && DATA[i].parts) || [];
    var h = '<div style="padding:16px;max-width:560px;margin:0 auto;text-align:left">' +
      '<div style="color:#fff;font-size:20px;font-weight:900;margin:0 0 12px">' + esc(t ? t.name : '') + '</div>';
    ps.forEach(function (p, k) {
      h += '<div style="color:#DCE7F2;font-size:13px;font-weight:800;margin:10px 0 6px">' + (k + 1) + 'つ目（' + (p.kind === 'text' ? '文章' : '画像') + '）</div>';
      if (p.kind === 'text') {
        h += '<div class="bcotxv">' + esc(p.text || '') + '</div>';
      } else {
        var th = partThumb(p);
        h += th ? '<img src="' + esc(th) + '" style="width:100%;max-width:420px;display:block;border-radius:12px">'
                : '<div style="color:#fff">（画像）</div>';
      }
    });
    h += '<button type="button" id="bcseeallx" style="margin:18px auto 6px;display:block;border:0;border-radius:12px;' +
      'padding:14px 34px;font-size:17px;font-weight:800;background:#2563EB;color:#fff">閉じる</button></div>';
    var ov = szOvShow_(h, '#2C7A99');
    ov.style.overflowY = 'auto'; ov.style.justifyContent = 'flex-start'; ov.style.alignItems = 'stretch'; ov.style.padding = '0';
    setTimeout(function () { var b = document.getElementById('bcseeallx'); if (b) b.onclick = function () { szOvHide_(); }; }, 80);
  }
  function campBack() {
    if (page === 'c') { campLeave(); page = 'k'; return true; }
    if (page === 'ce' && CTAGMODE) {                     
      var cc = campCell(CGI);
      if (CTAGSNAP) { cc.tags = CTAGSNAP.tags; cc.xtags = CTAGSNAP.xtags; }
      CTAGMODE = false; return true;
    }
    if (page === 'ce') { if (CGI > 0) { CGI--; CTAB = 0; } else { page = 'c'; } return true; }
    if (LMODE === 'at') { LMODE = ''; return true; }
    campUnswap(); page = 'ce'; CGI = CGROUPS.length - 1; step = 0; return true;
  }
}
function bcCampSrc_() {
  var s = String(bcCampCode_);
  return s.slice(s.indexOf('{') + 1, s.lastIndexOf('}'));
}
