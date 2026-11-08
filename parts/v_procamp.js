// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：procamp
var PROCAMPCSS_ =
  '.home{max-width:1100px;}' +    
  '.pcamp{background:#fff;border-radius:14px;padding:8px;color:#1a2429;text-align:left;}' +
  '.pcampscroll{overflow-x:auto;}' +
  '.pcamp table{border-collapse:collapse;width:100%;min-width:720px;font-size:13px;line-height:1.35;}' +
  '.pcamp th,.pcamp td{border:1px solid #d5dde1;padding:4px 6px;vertical-align:middle;text-align:left;}' +
  '.pcamp th{background:#2C7A99;color:#fff;font-weight:700;white-space:nowrap;}' +
  '.pcamp tbody tr:nth-child(even) td{background:#f4f8f9;}' +
  '.pcamp td.nw{white-space:nowrap;}' +
  '.pcopt{display:inline-flex;border:1px solid #c9d3d8;border-radius:6px;overflow:hidden;white-space:nowrap;}' +
  '.pcopt button{font:inherit;font-size:12px;padding:5px 7px;border:0;border-left:1px solid #c9d3d8;background:#fff;color:#5f6f76;cursor:pointer;}' +
  '.pcopt button:first-child{border-left:0;}' +
  '.pcopt button.on[data-v="n"]{background:#6b7780;color:#fff;font-weight:700;}' +
  '.pcopt button.on[data-v="y"]{background:#1f8a5b;color:#fff;font-weight:700;}' +
  '.pcopt button.on[data-v="t"]{background:#b8661c;color:#fff;font-weight:700;}' +
  '.pcampfoot{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 2px 2px;}' +
  '.pcampsend{font:inherit;font-weight:800;font-size:15px;padding:9px 22px;border-radius:999px;border:0;background:#2C7A99;color:#fff;cursor:pointer;}' +
  '.pcampsend:disabled{opacity:.5;}' +
  '.pcampst{font-size:13px;color:#5f6f76;}' +
  '.pcampst.ok{color:#1f8a5b;font-weight:700;}.pcampst.err{color:#b42318;font-weight:700;}';
function renderProcampPage_(list, choice, base, staff, dev) {
  list = list || {};
  choice = choice || {};
  var head = '<div class="hhead"><span class="bmark">💈</span><span class="bname">プロセル頭キャリスト</span></div>';
  var rows = list.rows || [];
  if (list.error || !rows.length) {
    return '<style>' + HOMECSS_ + '</style>' +
      '<div class="home">' + backBar_(base, staff, dev) + head +
      '<div class="soon"><div class="soonic">📄</div>' +
      '<div class="soontitle" style="font-size:1.4rem">一覧を読み込めませんでした</div>' +
      '<div class="soondesc">' + esc_(list.error || 'まだ一覧が作られていません。') + '</div></div></div>';
  }
  var body = '';
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    body += '<tr data-id="' + esc_(r.id) + '">' +
      '<td class="nw"><span class="pcopt">' +
        '<button type="button" data-v="n">しない</button>' +
        '<button type="button" data-v="y">する</button>' +
        '<button type="button" data-v="t">旅人タグにする</button>' +
      '</span></td>' +
      '<td class="nw">' + esc_(r.id + ' ' + r.name) + '</td>' +
      '<td class="nw">' + esc_(r.dates) + '</td>' +
      '<td>' + esc_(r.bought) + '</td></tr>';
  }
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var script =
  '<script>(function(){' +
  'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
  'var PREV=' + JSON.stringify(choice.picks || {}).replace(/</g, '\\u003c') + ';' +
  'var PREVAT=' + JSON.stringify(choice.submitted_at || '').replace(/</g, '\\u003c') + ';' +
  'var idn={who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""};' +
  'var picks={};var trs=[].slice.call(document.querySelectorAll(".pcamp tbody tr"));' +
  'var st=document.getElementById("pcampst"),btn=document.getElementById("pcampsend");' +
  'function setSt(t,k){st.textContent=t;st.className="pcampst"+(k?" "+k:"");}' +
  'function paint(tr){var v=picks[tr.getAttribute("data-id")];[].forEach.call(tr.querySelectorAll(".pcopt button"),function(b){b.classList.toggle("on",b.getAttribute("data-v")===v);});}' +
  'trs.forEach(function(tr){var id=tr.getAttribute("data-id");if(PREV[id])picks[id]=PREV[id];paint(tr);' +
  '[].forEach.call(tr.querySelectorAll(".pcopt button"),function(b){b.addEventListener("click",function(){picks[id]=b.getAttribute("data-v");paint(tr);});});});' +
  'if(PREVAT)setSt("前回の登録："+PREVAT);' +
  'function jsonp(p,cb){var n="__pcamp"+Date.now()+Math.floor(Math.random()*1000);window[n]=function(r){try{delete window[n];}catch(e){}cb(r);};' +
  'var q="callback="+n;for(var k in p)q+="&"+k+"="+encodeURIComponent(p[k]);' +
  'var s=document.createElement("script");s.src=EXEC+"?"+q+"&cb="+Date.now();s.onerror=function(){cb({ok:false,error:"通信エラーです"});};document.body.appendChild(s);}' +
  'function fail(msg){btn.disabled=false;setSt("");if(typeof szPopup_==="function")szPopup_(msg);else setSt(msg,"err");}' +
  'var polls=0;function poll(id){polls++;if(polls>LIMITS.tries("procamp_save",1000)){fail("時間切れです。もう一度登録してください🙇");return;}' +
  'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){fail("登録できませんでした："+((r&&r.error)||"不明"));return;}' +
  'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){poll(id);},1000);return;}' +
  'if(r.status!=="done"){fail("登録できませんでした："+(r.result||r.status));return;}' +
  'btn.disabled=false;var d=new Date();setSt("登録しました（"+(d.getMonth()+1)+"/"+d.getDate()+" "+("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2)+"）","ok");});}' +
  'function send(){btn.disabled=true;polls=0;setSt("登録しています…");' +
  'jsonp({action:"submit",key:KEY,op:"procamp_save",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({picks:picks})},' +
  'function(r){if(!r||!r.ok||!r.id){fail("登録できませんでした："+((r&&r.error)||"不明"));return;}setTimeout(function(){poll(r.id);},1000);});}' +
  'btn.addEventListener("click",function(){var left=trs.length-Object.keys(picks).length;' +
  'if(left>0&&typeof szPopup_==="function"){szPopup_("まだ選択していない方が "+left+" 人います。このまま登録しますか？😊",{cancel:true,icon:"",onYes:send});return;}send();});' +
  '})();<\/script>';
  return '<style>' + HOMECSS_ + PROCAMPCSS_ + '</style>' +
    '<div class="home">' + backBar_(base, staff, dev) + head +
    '<div class="pcamp"><div class="pcampscroll"><table>' +
      '<thead><tr><th>キャ案内する？</th><th>番号・お名前</th><th>最後に来た日／次の予約</th><th>購入済みプロセル頭皮の内容</th></tr></thead>' +
      '<tbody>' + body + '</tbody></table></div>' +
      '<div class="pcampfoot"><button type="button" class="pcampsend" id="pcampsend">登録</button>' +
      '<span class="pcampst" id="pcampst"></span></div>' +
    '</div></div>' + script;
}
