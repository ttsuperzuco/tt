// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：kanshi
function _orderFromCfg_(d) {
  var known = {};
  for (var i = 0; i < DEFAULT_TILE_ORDER_.length; i++) known[DEFAULT_TILE_ORDER_[i]] = true;
  var saved = (d && Array.isArray(d.order)) ? d.order.filter(function (id) { return known[id]; }) : [];
  var seen = {};
  for (var j = 0; j < saved.length; j++) seen[saved[j]] = true;
  for (var k = 0; k < DEFAULT_TILE_ORDER_.length; k++) {
    var id = DEFAULT_TILE_ORDER_[k];
    if (!seen[id]) saved.push(id);
  }
  return saved;
}
function renderKanshiLocked_(msg, base, staff, dev) {
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">📟</span><span class="bname">自動監視</span></div>' +
    '<div class="soon">' +
      '<div class="soonic">🔒</div>' +
      '<div class="soontitle" style="font-size:1.4rem">このスマホでは使えません</div>' +
      '<div class="soondesc">' + esc_(msg) + '</div>' +
    '</div>' +
  '</div>';
}
function renderKanshiError_(err, base, staff, dev) {
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">📟</span><span class="bname">自動監視</span></div>' +
    '<div class="soon">' +
      '<div class="soonic">📄</div>' +
      '<div class="soontitle" style="font-size:1.4rem">状態が届いていません</div>' +
      '<div class="soondesc">' + esc_(err && err.message ? err.message : err) + '</div>' +
    '</div>' +
  '</div>';
}
function renderKanshiPage_(d, base, staff, dev) {
  return '<style>' + KANSHICSS_ + '</style>' +
  '<div class="kwrap">' +
    '<div class="kbar">' +
      '<a class="khome" href="' + (base || '') + '?view=home' + roleSfx_(staff, dev) + '" target="_top">← 戻る</a>' +
      '<button type="button" class="kref" id="kRef">今すぐ更新</button>' +
    '</div>' +
    '<h1>📟 自動監視</h1>' +
    '<div class="kfresh" id="kFresh"></div>' +
    '<div id="kList"></div>' +
    '<div class="kfoot">🟢＝動いている ／ 🔴＝止まっている疑い ／ ⚪＝OFF（止めてある）。' +
      'カードの「⚙ 設定」で内容の一覧へ、さらに各行の「詳細」でその項目の画面へ進みます' +
      '（上の「← 戻る」で戻れます）。入切や実行はいちばん奥の画面にあります（自宅PCの自動監視と同じ場所）。' +
      'この画面は登録したスマホ（最初に開いた1台）だけが使えます。' +
      'この画面は自宅PCが1分ごとに送ってきた状態を見ています。</div>' +
  '</div>' +
  '<script>window.__KANSHI_DATA__=' + JSON.stringify(d) + ';<' + '/script>' +
  KANSHISCRIPT_;
}
var KANSHICSS_ =
'  :root{ --bg:#2b3440; --card:#ffffff; --ink:#1c2430; --sub:#667085; --line:#e6e9ef;' +
'    --ok:#0d9b6c; --ng:#e5484d; --off:#98a2b3; }' +
'  @media (prefers-color-scheme:dark){ :root{ --card:#1b2430; --ink:#e8ebf0; --sub:#9aa4b2; --line:#2a3441; } }' +
'  *{ box-sizing:border-box; }' +
'  body{ margin:0; background:var(--bg); color:var(--ink);' +
'    font-family:"Segoe UI","Yu Gothic UI","Hiragino Sans",system-ui,sans-serif; line-height:1.5; }' +
'  .kwrap{ max-width:640px; margin:0 auto; padding:16px 14px 60px; }' +
'  .kbar{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px; }' +
'  .khome{ color:#fff; text-decoration:none; font-weight:700; font-size:17px;' +
'    background:rgba(255,255,255,.16); padding:9px 14px; border-radius:10px; }' +
'  .kref{ background:rgba(255,255,255,.16); color:#fff; border:0; border-radius:10px; padding:9px 14px;' +
'    font:inherit; font-weight:700; font-size:17px; cursor:pointer; }' +
'  h1{ color:#fff; font-size:22px; margin:6px 0 10px; }' +
'  .kfresh{ font-size:15px; color:#dfe6ee; margin-bottom:12px; }' +
'  .kfresh.old{ background:var(--ng); color:#fff; font-weight:700; padding:10px 12px; border-radius:10px; }' +
'  .kcard{ background:var(--card); border:1px solid var(--line); border-radius:12px;' +
'    padding:12px 14px; margin-bottom:10px; }' +
'  .ksec{ font-size:13px; letter-spacing:.12em; color:var(--sub); font-weight:800;' +
'    margin:22px 2px 10px; }' +
'  .ksecnote{ font-size:14px; color:var(--sub); margin:-6px 2px 10px; line-height:1.6; }' +
'  .kcard.kwatch{ background:transparent; border-style:dashed; }' +
'  .kcard.kwatch .klabel{ font-weight:600; }' +
'  .khead{ display:flex; align-items:flex-start; gap:8px; cursor:pointer; }' +
'  .khead.nohit{ cursor:default; }' +
'  .kback{ margin-bottom:10px; }' +
'  .kback .kbtn{ font-size:16px; padding:9px 14px; }' +
'  .kmark{ font-size:19px; line-height:1.4; }' +
'  .klabel{ font-weight:700; font-size:18px; flex:1; }' +
'  .kdetail{ color:var(--sub); font-size:15px; margin-top:3px; font-weight:400; }' +
'  .karrow{ color:var(--sub); font-size:15px; }' +
'  .kslabel{ font-size:15px; font-weight:600; margin-top:2px; color:var(--ok); }' +
'  .kslabel.k_stale,.kslabel.k_error{ color:var(--ng); }' +
'  .kslabel.k_off,.kslabel.k_unknown{ color:var(--off); }' +
'  .kgear{ flex-shrink:0; align-self:center; font-size:15px; font-weight:700; color:var(--ink);' +
'    background:var(--line); border-radius:10px; padding:9px 13px; white-space:nowrap; }' +
'  .kmembers{ margin-top:10px; border-top:1px solid var(--line); padding-top:8px; }' +
'  .kmembers[hidden]{ display:none; }' +
'  .krow{ background:var(--card); border:1px solid var(--line); border-radius:12px;' +
'    padding:12px 14px; margin-bottom:10px; }' +
'  .krow:last-child{ margin-bottom:0; }' +
'  .krowhead{ display:flex; align-items:flex-start; gap:8px; }' +
'  .krowlabel{ flex:1; font-size:18px; font-weight:700; }' +
'  .kbtns{ display:flex; flex-wrap:wrap; gap:6px; margin-top:7px; align-items:center; }' +
'  .kbtn{ border:1px solid var(--line); background:var(--card); color:var(--ink); border-radius:8px;' +
'    padding:8px 13px; font:inherit; font-size:15px; font-weight:700; cursor:pointer; }' +
'  .kbtn.on{ background:var(--ok); color:#fff; border-color:var(--ok); }' +
'  .kbtn.off{ background:var(--off); color:#fff; border-color:var(--off); }' +
'  .kbtn:active{ transform:translateY(1px); }' +
'  .kval{ width:88px; padding:8px 10px; border:1px solid var(--line); border-radius:8px;' +
'    background:var(--card); color:var(--ink); font:inherit; font-size:15px; }' +
'  .kunit{ font-size:14px; color:var(--sub); }' +
'  .ksub{ margin:10px 0 0; border:1px solid var(--line); border-radius:10px; padding:10px 10px 1px; }' +
'  .kfoot{ color:#dfe6ee; font-size:14px; margin-top:14px; }' +
'  .ktoast{ position:fixed; left:50%; transform:translateX(-50%); bottom:22px; z-index:60;' +
'    background:#111a24; color:#fff; padding:11px 16px; border-radius:10px; font-size:16px; max-width:88%; }' +
'  .kmask{ position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center;' +
'    justify-content:center; z-index:70; padding:20px; }' +
'  .kbox{ background:var(--card); border-radius:14px; padding:18px; width:100%; max-width:330px; }' +
'  .kbox h3{ margin:0 0 10px; font-size:19px; }' +
'  .kbox input{ width:100%; padding:11px; border:1px solid var(--line); border-radius:9px;' +
'    background:var(--card); color:var(--ink); font:inherit; font-size:18px; margin-bottom:12px; }' +
'  .kboxbtns{ display:flex; gap:8px; }' +
'  .kboxbtns button{ flex:1; padding:12px; border-radius:9px; border:0; font:inherit; font-weight:700;' +
'    font-size:16px; cursor:pointer; }' +
'  .kno{ background:var(--bg); color:#fff; } .kyes{ background:#2563eb; color:#fff; }' +
'  .kbox.kwide{ max-width:520px; max-height:86vh; overflow-y:auto; }' +
'  .knote{ font-size:15px; color:var(--sub); margin-bottom:10px; line-height:1.6; }' +
'  .ksec{ font-size:16px; font-weight:800; margin:18px 0 8px; padding-top:12px;' +
'    border-top:1px solid var(--line); }' +
'  .kroom{ font-size:16px; font-weight:800; color:#f59e0b; margin:16px 0 8px; padding-top:12px; border-top:1px solid var(--line); }' +
'  .kchip .kexec{ font-size:11px; color:#ec4899; font-weight:800; margin-left:3px; }' +
'  .ktrow{ padding:9px 0; border-bottom:1px solid var(--line); }' +
'  .ktname{ display:flex; align-items:center; gap:7px; font-size:16px; font-weight:700; margin-bottom:6px; }' +
'  .kacc{ width:5px; height:16px; border-radius:3px; flex:0 0 auto; }' +
'  .kord{ display:flex; gap:2px; margin-left:auto; }' +
'  .kord button{ width:28px; height:26px; padding:0; border:1px solid var(--line); background:var(--card);' +
'    color:var(--sub); border-radius:6px; font-size:12px; cursor:pointer; }' +
'  .kchips{ display:flex; flex-wrap:wrap; gap:5px; }' +
'  .kchip{ border:1px solid var(--line); background:var(--card); color:var(--sub); border-radius:999px;' +
'    padding:8px 13px; font:inherit; font-size:15px; font-weight:700; cursor:pointer; }' +
'  .kchip.on{ background:var(--ok); border-color:var(--ok); color:#fff; }' +
'  .kchip .kused{ font-size:11px; opacity:.75; margin-left:3px; }' +
'  .kdevnote{ font-size:14px; color:var(--sub); }' +
'  .krow2{ display:flex; gap:7px; }' +
'  .krow2 input{ flex:1; margin-bottom:0; }' +
'';
var KANSHISCRIPT_ =
'<script>(function(){' +
'var EXEC_="https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec";' +
'var KEY_="kx7Q2p9mVt4Zr8";' +
'var STALE_SEC_=180;' +
'function devId_(){' +
'  try{' +
'    var v=window.__SZ_DEVICE_||localStorage.getItem("sz_device");' +
'    if(!v){ v="d"+Date.now().toString(36)+Math.random().toString(36).slice(2,8); localStorage.setItem("sz_device", v); }' +
'    return v;' +
'  }catch(e){ return ""; }' +
'}' +
'var DEV_=devId_();' +
'var data_=window.__KANSHI_DATA__||{groups:[]};' +
'var item_=null;' +    
'var cur_=null;' +
'var CONFIRM_={};' +   
'var TILEROW_=null;' + 

'function esc(s){ var d=document.createElement("div"); d.textContent=(s==null?"":String(s)); return d.innerHTML; }' +
'function jsonp_(params, onDone){' +
'  var cb="__k"+Date.now()+Math.floor(Math.random()*1000);' +
'  window[cb]=function(r){ try{ delete window[cb]; }catch(ig){} onDone(r); };' +
'  var qs="callback="+cb; for(var k in params){ qs+="&"+k+"="+encodeURIComponent(params[k]); }' +
'  var s=document.createElement("script"); s.src=EXEC_+"?"+qs+"&cb="+Date.now();' +
'  s.onerror=function(){ onDone({ok:false,error:"通信エラー"}); };' +
'  document.body.appendChild(s);' +
'}' +
'function toast_(msg){' +
'  var t=document.createElement("div"); t.className="ktoast"; t.textContent=msg;' +
'  document.body.appendChild(t);' +
'  setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 3200);' +
'}' +
'function mark_(st){ return st==="ok"?"🟢":(st==="off"?"⚪":(st==="unknown"?"🟡":"🔴")); }' +
'function agoSec_(s){' +
'  if(!s) return null;' +
'  var t=Date.parse(String(s).replace(" ","T"));' +
'  if(isNaN(t)) return null;' +
'  return Math.floor((Date.now()-t)/1000);' +
'}' +
'function renderFresh_(){' +
'  var el=document.getElementById("kFresh"); if(!el) return;' +
'  var sec=agoSec_(data_.generated_at);' +
'  if(sec===null||sec>STALE_SEC_){' +
'    el.className="kfresh old";' +
'    el.textContent="⚠ 自宅PCから状態が届いていません（最後に届いたのは "+(data_.generated_at||"不明")+"）。下の表示は古い可能性があります。";' +
'  } else {' +
'    el.className="kfresh"; el.textContent="最終更新 "+(data_.generated_at||"");' +
'  }' +
'}' +
'function ctlBtns_(m){' +
'  if(!m.ctl) return "";' +
'  var acts=m.acts||["on","off","run","setval"];' +
'  var has=function(a){ return acts.indexOf(a)>=0; };' +
'  if(m.confirm) CONFIRM_[m.key]=m.confirm;' +
'  var h="<div class=\\"kbtns\\">";' +
'  if(m.editor==="tiles"){' +
'    TILEROW_=m;' +
'    h+="<button type=\\"button\\" class=\\"kbtn\\" data-editor=\\"tiles\\">ひらいて設定する</button>";' +
'  }' +
'  if(has(m.on?"off":"on")){' +
'    h+="<button type=\\"button\\" class=\\"kbtn "+(m.on?"on":"off")+"\\" data-act=\\""+(m.on?"off":"on")+"\\" data-key=\\""+esc(m.key)+"\\">"+(m.on?"ONにしてある → OFFにする":"OFFにしてある → ONにする")+"</button>";' +
'  }' +
'  if(has("run")){' +
'    h+="<button type=\\"button\\" class=\\"kbtn\\" data-act=\\"run\\" data-key=\\""+esc(m.key)+"\\">今すぐ実行</button>";' +
'  }' +
'  if(has("setval")&&m.value!==""&&m.value!==undefined&&m.value!==null){' +
'    h+="<input class=\\"kval\\" type=\\"text\\" value=\\""+esc(m.value)+"\\" data-val=\\""+esc(m.key)+"\\">";' +
'    h+="<span class=\\"kunit\\">"+esc(m.unit||m.schedule_label||"")+"</span>";' +
'    h+="<button type=\\"button\\" class=\\"kbtn\\" data-act=\\"setval\\" data-key=\\""+esc(m.key)+"\\">保存</button>";' +
'  }' +
'  h+="</div>"; return h;' +
'}' +
'function rowHtml_(m, path){' +
'  var has=(m.ctl||(m.members&&m.members.length));' +
'  var h="<div class=\\"krow\\"><div class=\\"krowhead\\"><span class=\\"kmark\\">"+mark_(m.status)+"</span>";' +
'  h+="<span class=\\"krowlabel\\">"+esc(m.label)+' +
'    "<div class=\\"kslabel k_"+esc(m.status||"")+"\\">"+esc(m.slabel||"")+"</div>"+' +
'    "<div class=\\"kdetail\\">"+esc(m.detail||"")+"</div></span>";' +
'  h+=(has?"<span class=\\"kgear\\" data-item=\\""+esc(path)+"\\">詳細</span>":"");' +
'  h+="</div></div>"; return h;' +
'}' +
'function itemHtml_(m, path){' +
'  var h="<div class=\\"kcard\\"><div class=\\"khead nohit\\"><span class=\\"kmark\\">"+mark_(m.status)+"</span>";' +
'  h+="<span class=\\"klabel\\">"+esc(m.label)+' +
'    "<div class=\\"kslabel k_"+esc(m.status||"")+"\\">"+esc(m.slabel||"")+"</div>"+' +
'    "<div class=\\"kdetail\\">"+esc(m.detail||"")+"</div></span></div>";' +
'  h+=ctlBtns_(m);' +
'  h+="</div>";' +
'  if(m.members&&m.members.length){' +
'    h+=m.members.map(function(x,j){ return rowHtml_(x, path+"."+j); }).join("");' +
'  }' +
'  return h;' +
'}' +
'function itemAt_(path){' +
'  var parts=String(path||"").split(".");' +
'  var g=(data_.groups||[])[Number(parts[0])]; if(!g) return null;' +
'  var cur=g.members||[];' +
'  var m=null;' +
'  for(var i=1;i<parts.length;i++){ m=cur[Number(parts[i])]; if(!m) return null; cur=m.members||[]; }' +
'  return m;' +
'}' +
'function render_(){' +
'  renderFresh_();' +
'  var list=document.getElementById("kList"); if(!list) return;' +
'  var gs=data_.groups||[];' +
'  if(!gs.length){ list.innerHTML="<div class=\\"kcard\\">状態が空です。自宅PCをご確認くださいませ🙇</div>"; return; }' +
'  if(cur_!==null && gs[cur_]){' +
'    var g=gs[cur_];' +
'    if(item_!==null){' +
'      var im=itemAt_(item_);' +
'      if(im){' +
'        list.innerHTML="<div class=\\"kback\\"><button type=\\"button\\" class=\\"kbtn\\" id=\\"kBackItem\\">← 戻る</button></div>"+itemHtml_(im, item_);' +
'        return;' +
'      }' +
'      item_=null;' +
'    }' +
'    var body=(g.members&&g.members.length)?g.members.map(function(m,j){ return rowHtml_(m, cur_+"."+j); }).join(""):"<div class=\\"kdetail\\">内容はありません。</div>";' +
'    list.innerHTML="<div class=\\"kback\\"><button type=\\"button\\" class=\\"kbtn\\" id=\\"kBack\\">← 戻る</button></div>"+' +
'      "<div class=\\"kcard"+(g.watch_only?" kwatch":"")+"\\"><div class=\\"khead nohit\\">"+' +
'      "<span class=\\"kmark\\">"+mark_(g.status)+"</span>"+' +
'      "<span class=\\"klabel\\">"+esc(g.label)+' +
'        "<div class=\\"kslabel k_"+esc(g.status||"")+"\\">"+esc(g.slabel||"")+"</div>"+' +
'        "<div class=\\"kdetail\\">"+esc(g.detail||"")+"</div></span></div>"+' +
'      "<div class=\\"kmembers\\">"+body+"</div></div>";' +
'    return;' +
'  }' +
'  var sec_="";' +    
'  list.innerHTML=gs.map(function(g,i){' +
'    var has=(g.members&&g.members.length)?1:0;' +
'    var head_="";' +
'    if(g.section && g.section!==sec_){' +
'      sec_=g.section;' +
'      head_="<div class=\\"ksec\\">"+esc(sec_)+"</div>";' +
'      if(g.watch_only){ head_+="<div class=\\"ksecnote\\">ここは入切のつまみがありません。うまくいっているかを見るだけの欄です（赤くなったら、予約とLINEが取り込めていません）。</div>"; }' +
'    }' +
'    return head_+"<div class=\\"kcard"+(g.watch_only?" kwatch":"")+"\\"><div class=\\"khead\\" data-g=\\""+i+"\\">"+' +
'      "<span class=\\"kmark\\">"+mark_(g.status)+"</span>"+' +
'      "<span class=\\"klabel\\">"+esc(g.label)+' +
'        "<div class=\\"kslabel k_"+esc(g.status||"")+"\\">"+esc(g.slabel||"")+"</div>"+' +
'        "<div class=\\"kdetail\\">"+esc(g.detail||"")+"</div></span>"+' +
'      (has?"<span class=\\"kgear\\">"+(g.watch_only?"🔍 見る":"⚙ 設定")+"</span>":"")+"</div></div>";' +
'  }).join("");' +
'}' +
'function reload_(onDone){' +
'  jsonp_({action:"data", name:"monitor.json", device:DEV_}, function(r){' +
'    if(r&&r.locked){' +   
'      var l=document.getElementById("kList");' +
'      if(l) l.innerHTML="<div class=\\"kcard\\">"+esc(r.error||"この画面は登録したスマホからだけ開けます。")+"</div>";' +
'      var f=document.getElementById("kFresh"); if(f) f.textContent="";' +
'      if(onDone) onDone();' +
'      return;' +
'    }' +
'    if(r&&!r.error){ data_=r; render_(); }' +
'    if(onDone) onDone();' +
'  });' +
'}' +
'function poll_(id, tries, busy){' +
'  jsonp_({action:"status", key:KEY_, id:id}, function(r){' +
'    if(r&&r.ok&&(r.status==="done"||r.status==="error")){' +
'      if(busy){' +
'        if(r.status==="done"){' +
'          szOvShow_(szDoneHtml_(busy.done||"完了しました","戻る"),"#16a34a");' +
'          var _b=document.getElementById("szDoneBack");' +
'          if(_b) _b.addEventListener("click", function(){ szOvHide_(); });' +
'        } else { szOvHide_(); szPopup_("エラーが発生しました。"+(r.result||"")); }' +
'      } else { toast_((r.status==="done"?"✅ ":"⚠ ")+(r.result||"")); }' +
'      reload_();' +
'      return;' +
'    }' +
'    if(tries<=0){' +
'      if(busy){ szOvHide_(); szPopup_("時間切れです。自宅PCの状態をご確認くださいませ🙇"); }' +
'      else { toast_("時間切れです。自宅PCの状態をご確認くださいませ🙇"); }' +
'      return;' +
'    }' +
'    setTimeout(function(){ poll_(id, tries-1, busy); }, 5000);' +
'  });' +
'}' +
'var EP_={}, EO_=[], EPEOPLE_=[], ELAB_={}, ECLAIM_={}, EPCHIDDEN_=[];' +
'function tileDefs_(){' +
'  var r=TILEROW_||{}; var out=[];' +
'  var a=r.tiles||[], b=r.dev_tiles||[];' +
'  for(var i=0;i<a.length;i++) out.push({id:a[i].id,label:a[i].label,color:a[i].color,dev:false});' +
'  for(var j=0;j<b.length;j++) out.push({id:b[j].id,label:b[j].label,color:b[j].color,dev:true});' +
'  return out;' +
'}' +
'function openTiles_(){' +
'  toast_("設定を読み込んでいます…");' +
'  jsonp_({action:"data", name:"tile_settings.json"}, function(r){' +
'    if(!r||r.error){ toast_("⚠ 設定を読み込めませんでした"); return; }' +
'    EPEOPLE_=(typeof _peopleFromCfg_==="function")?_peopleFromCfg_(r):(r.people||[]);' +
'    ELAB_=(typeof _labelsFromCfg_==="function")?_labelsFromCfg_(r):(r.labels||{});' +
'    ECLAIM_=r.claimed||{};' +
'    EO_=((typeof _orderFromCfg_==="function")?_orderFromCfg_(r):(r.order||[])).slice();' +
'    EPCHIDDEN_=(r.pcHidden||[]).slice();' +
'    if(typeof _permsFromCfg_==="function"){ EP_=_permsFromCfg_(r); }' +
'    else {' +
'      EP_={};' +
'      for(var i=0;i<EPEOPLE_.length;i++){' +
'        var pid=EPEOPLE_[i]; EP_[pid]={};' +
'        var src=(r.perms&&r.perms[pid])||{};' +
'        for(var t in src) EP_[pid][t]=!!src[t];' +
'      }' +
'    }' +
'    drawTiles_();' +
'  });' +
'}' +
'function tileGrp_(id){ return (typeof tileGroup_==="function")?tileGroup_(id):"jitsumu"; }' +
'function tileRowsHtml_(){' +
'  var defs=tileDefs_(), byId={};' +
'  for(var i=0;i<defs.length;i++) byId[defs[i].id]=defs[i];' +
'  var order=EO_.filter(function(id){ return byId[id]; });' +
'  for(var j=0;j<defs.length;j++){ if(order.indexOf(defs[j].id)<0) order.push(defs[j].id); }' +
'  EO_=order;' +
'  function rowH_(tid){' +
'    var d=byId[tid];' +
'    var h="<div class=\\"ktrow\\" data-tid=\\""+esc(tid)+"\\"><div class=\\"ktname\\">"+' +
'      "<span class=\\"kacc\\" style=\\"background:"+esc(d.color||"#94a3b8")+"\\"></span>"+esc(d.label)+' +
'      "<span class=\\"kord\\"><button type=\\"button\\" data-mv=\\"-1\\" data-tid=\\""+esc(tid)+"\\">▲</button>"+' +
'      "<button type=\\"button\\" data-mv=\\"1\\" data-tid=\\""+esc(tid)+"\\">▼</button></span></div>";' +
'    if(d.dev){' +
'      h+="<div class=\\"kdevnote\\">開発画面だけに出るボタンです（オーナー専用・人ごとの設定はありません。並び順だけ変更できます）</div>";' +
'    } else {' +
'      h+="<div class=\\"kchips\\">"+EPEOPLE_.map(function(pid){' +
'        var on=!!(EP_[pid]&&EP_[pid][tid]);' +
'        var suf=(pid==="kanbu")?"<span class=\\"kexec\\">幹部</span>":((ECLAIM_[pid])?"<span class=\\"kused\\">使用中</span>":"");' +
'        return "<button type=\\"button\\" class=\\"kchip"+(on?" on":"")+"\\" data-pid=\\""+esc(pid)+"\\" data-tid=\\""+esc(tid)+"\\">"+' +
'          esc(ELAB_[pid]||pid)+suf+"</button>";' +
'      }).join("")+"</div>";' +
'    }' +
'    return h+"</div>";' +
'  }' +
'  var groups={keiei:[],kanri:[],jitsumu:[],kaihatsu:[],tomato:[]};' +
'  for(var k=0;k<order.length;k++){ var g=tileGrp_(order[k]); (groups[g]||groups.jitsumu).push(order[k]); }' +
'  var roles=(typeof ROLE_DEFS_!=="undefined")?ROLE_DEFS_.slice(0,1).concat([{id:"tomato",icon:"🍅",title:"TOMATO画面"}],ROLE_DEFS_.slice(1)):[{id:"jitsumu",icon:"💼",title:"スタッフ画面"},{id:"keiei",icon:"📊",title:"りゅう（経営管理ツール）"},{id:"kanri",icon:"🛠️",title:"りゅう（便利ツール）"},{id:"kaihatsu",icon:"🧑‍💻",title:"開発中の機能"}];' +
'  var out="";' +
'  for(var r=0;r<roles.length;r++){ var R=roles[r], ids=groups[R.id]||[]; if(!ids.length) continue;' +
'    out+="<div class=\\"kroom\\">"+R.icon+" "+R.title+"</div>"+ids.map(rowH_).join(""); }' +
'  return out;' +
'}' +
'function pcRowsHtml_(){' +
'  var defs=(TILEROW_&&TILEROW_.pc_tiles)||[];' +
'  return defs.map(function(d){' +
'    var on=(EPCHIDDEN_.indexOf(d.id)<0);' +   
'    return "<button type=\\"button\\" class=\\"kchip pcchip"+(on?" on":"")+"\\" data-pc=\\""+esc(d.id)+"\\">"+' +
'      "<span class=\\"kacc\\" style=\\"background:"+esc(d.color||"#94a3b8")+"\\"></span>"+esc(d.label)+"</button>";' +
'  }).join("");' +
'}' +
'function drawTiles_(){' +
'  var old=document.getElementById("kTiles"); if(old&&old.parentNode) old.parentNode.removeChild(old);' +
'  var mask=document.createElement("div"); mask.className="kmask"; mask.id="kTiles";' +
'  var resets=EPEOPLE_.filter(function(p){ return p!=="kanbu"; }).map(function(pid){' +
'    return "<button type=\\"button\\" class=\\"kchip\\" data-reset=\\""+esc(pid)+"\\">"+esc(ELAB_[pid]||pid)+"</button>";' +
'  }).join("")+"<button type=\\"button\\" class=\\"kchip\\" data-reset=\\"all\\">⚠ 全員</button>";' +
'  mask.innerHTML="<div class=\\"kbox kwide\\"><h3>スーパーズコApp ボタン表示設定</h3>"+' +
'    "<div class=\\"knote\\">それぞれのボタンを、誰に見せるかを選びます。名前を押すとON（緑）／OFF（灰色）が切り替わります。▲▼はホーム画面の並び順です。最後に「保存する」を押してね😊 （反映まで最大1分）。</div>"+' +
'    "<div id=\\"kTileRows\\">"+tileRowsHtml_()+"</div>"+' +
'    "<div class=\\"ksec\\">新しいユーザーを追加</div>"+' +
'    "<div class=\\"knote\\">新しいスタッフや、同じ人の別の名前（例：りんご2）を追加します。</div>"+' +
'    "<div class=\\"krow2\\"><input type=\\"text\\" id=\\"kAdd\\" placeholder=\\"例：りんご2\\">"+' +
'    "<button type=\\"button\\" class=\\"kbtn\\" id=\\"kAddBtn\\">追加</button></div>"+' +
'    "<div class=\\"ksec\\">スタッフ用URLのパスワード</div>"+' +
'    "<div class=\\"knote\\">今のパスワードは、安全のためこの画面には表示しません。変更したい時だけ新しいパスワードを入力してね😊</div>"+' +
'    "<div class=\\"krow2\\"><input type=\\"text\\" id=\\"kPw2\\" placeholder=\\"新しいパスワード\\">"+' +
'    "<button type=\\"button\\" class=\\"kbtn\\" id=\\"kPwBtn\\">変更</button></div>"+' +
'    "<div class=\\"ksec\\">名前を選び直させる（スマホごと）</div>"+' +
'    "<div class=\\"knote\\">押した人のスマホは、次にアプリを開いた時「名前をえらぶ」画面からやり直しになります。その名前はまた選べるようになります。</div>"+' +
'    "<div class=\\"kchips\\">"+resets+"</div>"+' +
'    "<div class=\\"kboxbtns\\" style=\\"margin-top:18px;\\"><button type=\\"button\\" class=\\"kno\\" id=\\"kTilesClose\\">とじる</button>"+' +
'    "<button type=\\"button\\" class=\\"kyes\\" id=\\"kTilesSave\\">保存する</button></div></div>";' +
'  document.body.appendChild(mask);' +
'}' +
'function closeTiles_(){ var m=document.getElementById("kTiles"); if(m&&m.parentNode) m.parentNode.removeChild(m); }' +
'function moveTile_(tid, dir){' +
'  var g=tileGrp_(tid), i=EO_.indexOf(tid); if(i<0) return;' +
'  var j=i+dir; while(j>=0&&j<EO_.length&&tileGrp_(EO_[j])!==g) j+=dir;' +   
'  if(j<0||j>=EO_.length) return;' +
'  var tmp=EO_[i]; EO_[i]=EO_[j]; EO_[j]=tmp;' +
'  var box=document.getElementById("kTileRows"); if(box) box.innerHTML=tileRowsHtml_();' +
'}' +
'function saveTiles_(){' +
'  var p={};' +   
'  for(var i=0;i<EPEOPLE_.length;i++){' +
'    var pid=EPEOPLE_[i], on=[];' +
'    for(var t in (EP_[pid]||{})){ if(EP_[pid][t]) on.push(t); }' +
'    p[pid]=on;' +
'  }' +
'  send_("tile_settings","setval", JSON.stringify({t:"save", o:EO_, p:p, ph:EPCHIDDEN_}),' +
'    {title:"保存中です", done:"保存が完了しました"});' +
'  closeTiles_();' +
'}' +
'function tilesClick_(ev){' +
'  var t=ev.target.closest?ev.target:null; if(!t) return false;' +
'  var chip=t.closest(".kchip");' +
'  if(chip&&chip.getAttribute("data-pid")){' +
'    var pid=chip.getAttribute("data-pid"), tid=chip.getAttribute("data-tid");' +
'    if(!EP_[pid]) EP_[pid]={};' +
'    EP_[pid][tid]=!EP_[pid][tid];' +
'    chip.classList.toggle("on", !!EP_[pid][tid]);' +
'    return true;' +
'  }' +
'  if(chip&&chip.getAttribute("data-pc")){' +
'    var pcid=chip.getAttribute("data-pc"), k=EPCHIDDEN_.indexOf(pcid);' +
'    if(k<0){ EPCHIDDEN_.push(pcid); chip.classList.remove("on"); }' +   
'    else { EPCHIDDEN_.splice(k,1); chip.classList.add("on"); }' +       
'    return true;' +
'  }' +
'  if(chip&&chip.getAttribute("data-reset")){' +
'    var rid=chip.getAttribute("data-reset");' +
'    if(confirm("「"+(rid==="all"?"全員":(ELAB_[rid]||rid))+"」を名前の選び直しにします。よろしいでしょうか？😊")){' +
'      send_("tile_settings","setval", JSON.stringify({t:"reset", v:rid}),' +
'        {title:"選び直しにしています", done:"選び直しにしました"});' +
'    }' +
'    return true;' +
'  }' +
'  var mv=t.closest("[data-mv]");' +
'  if(mv){ moveTile_(mv.getAttribute("data-tid"), Number(mv.getAttribute("data-mv"))); return true; }' +
'  if(t.closest("#kAddBtn")){' +
'    var v=(document.getElementById("kAdd").value||"").trim();' +
'    if(!v){ toast_("名前を入力してね😊"); return true; }' +
'    send_("tile_settings","setval", JSON.stringify({t:"add", v:v}),' +
'      {title:"ユーザーを追加しています", done:"ユーザーを追加しました"});' +
'    document.getElementById("kAdd").value="";' +
'    return true;' +
'  }' +
'  if(t.closest("#kPwBtn")){' +
'    var pw=(document.getElementById("kPw2").value||"").trim();' +
'    if(!pw){ toast_("新しいパスワードを入力してね😊"); return true; }' +
'    if(confirm("スタッフ用URLのパスワードを「"+pw+"」に変更します。よろしいでしょうか？😊")){' +
'      send_("tile_settings","setval", JSON.stringify({t:"pw", v:pw}),' +
'        {title:"パスワードを変更しています", done:"パスワードを変更しました"});' +
'    }' +
'    return true;' +
'  }' +
'  if(t.closest("#kTilesClose")){ closeTiles_(); return true; }' +
'  if(t.closest("#kTilesSave")){ saveTiles_(); return true; }' +
'  return false;' +
'}' +
'function send_(key, act, val, busy){' +
'  if(busy){ szOvShow_(szBusyHtml_(busy.title, "書き終わったら自動で切り替わりますので、少し待っててくださいね🥺"),"#2C7A99"); }' +
'  else { toast_("受け付けました。自宅PCが実行します（最大1分）…"); }' +
'  jsonp_({action:"submit", key:KEY_, op:"kanshi_ctl", device:DEV_,' +
'    fields:JSON.stringify({ctl_key:key, ctl_act:act, ctl_val:(val||"")})},' +
'    function(r){' +
'      if(!r||!r.ok){' +
'        if(busy){ szOvHide_(); szPopup_("エラーが発生しました。"+((r&&r.error)||"依頼できませんでした")); }' +
'        else { toast_("⚠ "+((r&&r.error)||"依頼できませんでした")); }' +
'        return;' +
'      }' +
'      poll_(r.id, 16, busy);' +
'    });' +
'}' +
'document.addEventListener("click", function(ev){' +
'  if(!ev.target.closest) return;' +
'  if(ev.target.closest("#kTiles")){ if(tilesClick_(ev)) return; }' +
'  var ed=ev.target.closest("[data-editor]");' +
'  if(ed){ openTiles_(); return; }' +
'  if(ev.target.closest("#kBackItem")){ item_=null; render_(); window.scrollTo(0,0); return; }' +
'  if(ev.target.closest("#kBack")){ cur_=null; item_=null; render_(); window.scrollTo(0,0); return; }' +
'  var it=ev.target.closest("[data-item]");' +
'  if(it){ item_=it.getAttribute("data-item"); render_(); window.scrollTo(0,0); return; }' +
'  var h=ev.target.closest(".khead");' +
'  if(h&&h.getAttribute("data-g")!==null&&h.getAttribute("data-g")!==undefined){' +
'    cur_=Number(h.getAttribute("data-g")); item_=null; render_(); window.scrollTo(0,0); return;' +
'  }' +
'  var b=ev.target.closest(".kbtn");' +
'  if(!b) return;' +
'  var key=b.getAttribute("data-key"), act=b.getAttribute("data-act");' +
'  if(!key||!act) return;' +
'  var val="";' +
'  if(act==="setval"){' +
'    var input=document.querySelector(".kval[data-val=\\""+key+"\\"]");' +
'    val=input?input.value:"";' +
'  }' +
'  if(CONFIRM_[key]&&!confirm(CONFIRM_[key])) return;' +   
'  send_(key, act, val);' +
'});' +
'var ref=document.getElementById("kRef");' +
'if(ref) ref.addEventListener("click", function(){ toast_("最新を取りに行っています…"); reload_(); });' +
'render_();' +
'setInterval(function(){ reload_(); }, 30000);' +
'})();<' + '/script>';
