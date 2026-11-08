// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：unanswered
function renderUnansweredError_(err, base, staff, dev) {
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' +
    '<div class="ubar"><a class="uhome" href="' + (base || '') + '?view=home' +
      roleSfx_(staff, dev) + '" target="_top">← 戻る</a></div>' +
    '<div class="hhead"><span class="bmark">💬</span><span class="bname">LINE未回答＆返信待ち</span></div>' +
    '<div class="soon">' +
      '<div class="soonic">📄</div>' +
      '<div class="soontitle" style="font-size:1.4rem">データ未生成</div>' +
      '<div class="soondesc">' + esc_(err && err.message ? err.message : err) + '</div>' +
    '</div>' +
  '</div>';
}
function unaReadPill_(read) {
  if (read === '未読') return '<span class="unapill unread">未読</span>';
  if (read === '既読') return '<span class="unapill read">既読</span>';
  return '';
}
function unaWhen_(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(s || '');
  if (!m) return s || '';
  return (+m[2]) + '月' + (+m[3]) + '日 ' + m[4] + ':' + m[5];
}
function unaCard_(r, kind, dev) {
  var name = r.nm || '🆕 新規（番号未設定）';
  var tag = [r.nat, r.sex].filter(Boolean).join('・');
  var search = esc_(((name) + ' ' + (r.q || '')).toLowerCase());
  var sub = [tag, (r.read && r.read !== '—') ? r.read : '', '待ち' + (r.d || 0) + '日']
    .filter(Boolean).join('　/　');
  var full = esc_(JSON.stringify(r.full || []));
  var when = unaWhen_((r.full && r.full.length) ? r.full[r.full.length - 1].t : r.t);
  var canR = (r.reply && r.cid && dev) ? '1' : '';
  var detail = '<button type="button" class="unadetail" data-nm="' + esc_(name) +
    '" data-sub="' + esc_(sub) + '" data-full="' + full +
    '" data-cid="' + esc_(r.cid || '') + '" data-reply="' + canR +
    '" data-sex="' + esc_(r.sex || '') + '">🔍 詳細（内容を見る）</button>';
  var link = r.url
    ? '<a class="unalink" target="_blank" rel="noopener" href="' + esc_(r.url) + '">💬 LINEを開く（返信する）</a>'
    : '';
  var box = (r.reply && r.cid && dev)
    ? '<div class="unareply" data-cid="' + esc_(r.cid) + '" data-nm="' + esc_(name) + '">' +
        '<textarea class="unartext" rows="3" maxlength="1000" placeholder="ここに返信を打つと、お店の公式LINEから送ります"></textarea>' +
        '<div class="unastamps"></div>' +
        '<div class="unarrow">' +
          '<span class="unarnote"></span>' +
          '<button type="button" class="unaremoji">😊 絵文字</button>' +
          '<button type="button" class="unarpicker">😀 スタンプ</button>' +
          '<button type="button" class="unarsend">送る</button>' +
        '</div>' +
      '</div>'
    : '';
  return '' +
  '<article class="unacard ' + (kind === 'cust' ? 'cust' : 'ours') + (r.reply ? ' prac' : '') + '" data-search="' + search + '" data-days="' + (r.d || 0) + '">' +
    '<div class="unahead">' +
      '<div class="unarow1">' +
        unaReadPill_(r.read) +
        (when ? '<span class="unawhentag">' + esc_(when) + '</span>' : '') +
        '<span class="unadays">待ち' + (r.d || 0) + '日</span>' +
      '</div>' +
      '<div class="unarow2">' +
        '<span class="unaname">' + esc_(name) + '</span>' +
        (tag ? '<span class="unatag">' + esc_(tag) + '</span>' : '') +
      '</div>' +
    '</div>' +
    '<div class="unaq">' + esc_(r.q || '') + '</div>' +
    '<div class="unaactions">' + detail + link + '</div>' + box +
  '</article>';
}
function unaSortAsc_(arr) {
  return (arr || []).slice().sort(function (a, b) { return (a.d || 0) - (b.d || 0); });
}
function renderUnansweredPage_(d, base, staff, dev) {
  var cust = unaSortAsc_(d.cust), ours = unaSortAsc_(d.ours);
  if (staff) {
    cust = cust.filter(function (r) { return !r.reply; });
    ours = ours.filter(function (r) { return !r.reply; });
  }
  var custCards = cust.length
    ? cust.map(function (r) { return unaCard_(r, 'cust', dev); }).join('\n')
    : '';
  var oursCards = ours.length
    ? ours.map(function (r) { return unaCard_(r, 'ours', dev); }).join('\n')
    : '';

  return '' +
'<style>' + UNACSS_ + '</style>' +
'<div class="unawrap">' +
  '<div class="unabar">' +
    '<a class="unahome" href="' + (base || '') + '?view=home' + roleSfx_(staff, dev) + '" target="_top">← 戻る</a>' +
    '<span class="unagen">' + esc_(d.fresh || '—') + ' 時点</span>' +
  '</div>' +
  '<h1>💬 LINE未回答＆返信待ち</h1>' +
  '<div class="unatabs">' +
    '<button type="button" class="unatab cust sel" data-v="cust">🟢 当店が未返信<span class="unac" id="unaCntCust">' + cust.length + '</span></button>' +
    '<button type="button" class="unatab ours" data-v="ours">🔵 お客様の返事待<span class="unac" id="unaCntOurs">' + ours.length + '</span></button>' +
  '</div>' +
  '<select id="unaperiod">' +
    '<option value="3">3日間</option>' +
    '<option value="7" selected>7日間</option>' +
    '<option value="14">2週間</option>' +
  '</select>' +
  '<div id="unacust" class="unalist">' + custCards + '</div>' +
  '<div id="unaours" class="unalist unahidden">' + oursCards + '</div>' +
  '<div class="unaempty unaemptybig" id="unaperiodempty" hidden>この期間に該当はありません。<br>上の期間を広げてね😊</div>' +
'</div>' +
'<div class="unamask" id="unamask" role="dialog" aria-modal="true">' +
  '<div class="unamodal">' +
    '<div class="unamh">' +
      '<div><div class="unamnm" id="unaMnm"></div><div class="unamsub" id="unaMsub"></div></div>' +
      '<div class="unamhr">' +
        '<div class="unafs">' +
          '<button type="button" class="unafsb" data-fs="sm">小</button>' +
          '<button type="button" class="unafsb" data-fs="md">中</button>' +
          '<button type="button" class="unafsb" data-fs="lg">大</button>' +
          '<button type="button" class="unafsb" data-fs="xl">特</button>' +
        '</div>' +
        '<button type="button" class="unamx" id="unaMx" aria-label="閉じる">&times;</button>' +
      '</div>' +
    '</div>' +
    '<div class="unamlog" id="unaMlog"></div>' +
    '<div class="unamreply" id="unaMreply"></div>' +
  '</div>' +
'</div>' +
UNASCRIPT_;
}
var UNASCRIPT_ =
'<script>(function(){' +
'var tabs=[].slice.call(document.querySelectorAll(".unatab"));' +
'var custEl=document.getElementById("unacust"), oursEl=document.getElementById("unaours");' +
'var per=document.getElementById("unaperiod");' +
'var cntCust=document.getElementById("unaCntCust"), cntOurs=document.getElementById("unaCntOurs");' +
'var empty=document.getElementById("unaperiodempty");' +
'function apply(){' +
'  var pv=+(per&&per.value)||9999;' +
'  var nc=0, no=0;' +
'  [].slice.call(document.querySelectorAll(".unacard")).forEach(function(c){' +
'    var days=+(c.getAttribute("data-days")||0);' +
'    var show=(days<=pv);' +
'    c.classList.toggle("unahide", !show);' +
'    if(show){ if(c.classList.contains("cust")) nc++; else no++; }' +
'  });' +
'  if(cntCust) cntCust.textContent=nc;' +
'  if(cntOurs) cntOurs.textContent=no;' +
'  var isCust=(custEl&&!custEl.classList.contains("unahidden"));' +
'  var activeCount=isCust?nc:no;' +
'  if(empty) empty.hidden=(activeCount>0);' +
'}' +
'tabs.forEach(function(t){ t.addEventListener("click",function(){' +
'  var v=t.getAttribute("data-v");' +
'  tabs.forEach(function(x){ x.classList.toggle("sel", x===t); });' +
'  if(custEl) custEl.classList.toggle("unahidden", v!=="cust");' +
'  if(oursEl) oursEl.classList.toggle("unahidden", v!=="ours");' +
'  apply();' +
'}); });' +
'if(per) per.addEventListener("input",apply);' +
'var mask=document.getElementById("unamask");' +
'var mlog=document.getElementById("unaMlog"),mnm=document.getElementById("unaMnm"),msub=document.getElementById("unaMsub");' +
'var mreply=document.getElementById("unaMreply");' +
'var UNA_FS_KEY="sz_una_fs";' +
'function unaGetFs(){ try{ var v=localStorage.getItem(UNA_FS_KEY); return (v==="sm"||v==="lg"||v==="xl")?v:"md"; }catch(e){ return "md"; } }' +
'function unaApplyFs(sz){ if(sz!=="sm"&&sz!=="lg"&&sz!=="xl") sz="md";' +
'  if(mlog) mlog.setAttribute("data-fs",sz);' +
'  var bs=document.querySelectorAll(".unafsb");' +
'  for(var i=0;i<bs.length;i++){ bs[i].classList.toggle("on", bs[i].getAttribute("data-fs")===sz); } }' +
'document.addEventListener("click",function(e){' +
'  var b=e.target&&e.target.closest?e.target.closest(".unafsb"):null; if(!b) return;' +
'  var sz=b.getAttribute("data-fs"); try{ localStorage.setItem(UNA_FS_KEY,sz); }catch(ig){}' +
'  unaApplyFs(sz);' +
'});' +
'function unaGrow(t){ if(!t) return; t.style.height="auto"; t.style.height=Math.min(t.scrollHeight,340)+"px"; }' +
'document.addEventListener("input",function(e){' +
'  var t=e.target; if(t&&t.classList&&t.classList.contains("unartext")) unaGrow(t); });' +
'document.addEventListener("click",function(e){' +
'  var b=e.target&&e.target.closest?e.target.closest(".unartrans"):null; if(!b) return;' +
'  var wrap=b.closest(".unareply"); if(!wrap) return;' +
'  var ta=wrap.querySelector(".unartext"), box=wrap.querySelector(".unartrbox"), zt=wrap.querySelector(".unartrtext");' +
'  var note=wrap.querySelector(".unarnote");' +
'  var text=(ta&&ta.value||"").trim();' +
'  if(!text){ if(note){ note.className="unarnote ng"; note.textContent="先に日本語を入力してね😊"; } return; }' +
'  if(box) box.style.display="block";' +
'  if(zt){ zt.value="翻訳中…少し待っててくださいね🥺"; unaGrow(zt); }' +
'  var idn=unaIdent_();' +
'  unaCall_({action:"submit",op:"translate",who:idn.who,role:idn.role,device:idn.device,' +
'    fields:JSON.stringify({text:text,gender:(wrap.getAttribute("data-sex")||"")})},' +
'    function(r){' +
'      if(!r||!r.ok){ if(zt){ zt.value=(r&&r.error)||"翻訳できませんでした。"; unaGrow(zt); } return; }' +
'      var tries=0;' +
'      (function poll(){ tries++;' +
'        unaCall_({action:"status",id:r.id},function(st){' +
'          if(st&&st.status==="done"){ if(zt){ zt.value=st.result||""; unaGrow(zt); } return; }' +
'          if(st&&st.status==="error"){ if(zt){ zt.value=st.result||"翻訳できませんでした。"; unaGrow(zt); } return; }' +
'          if(tries>60){ if(zt){ zt.value="返事がありません。もう一度試してもらえると嬉しいです🙇"; unaGrow(zt); } return; }' +
'          setTimeout(poll,1200); }); })();' +
'    });' +
'});' +
'document.addEventListener("click",function(e){' +
'  var b=e.target&&e.target.closest?e.target.closest(".unartrsend"):null; if(!b) return;' +
'  var wrap=b.closest(".unareply"); if(!wrap) return;' +
'  var ta=wrap.querySelector(".unartext"), zt=wrap.querySelector(".unartrtext"), box=wrap.querySelector(".unartrbox");' +
'  var zh=(zt&&zt.value||"").trim();' +
'  if(!zh||zh.indexOf("翻訳中")===0){ return; }' +
'  if(ta){ ta.value=zh; unaGrow(ta); }' +
'  if(box) box.style.display="none";' +
'  unaSend_(wrap);' +
'});' +
'function escH(s){return String(s==null?"":s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];});}' +
'function openDetail(btn){' +
'  if(!mask||!mlog)return;' +
'  var full=[]; try{ full=JSON.parse(btn.getAttribute("data-full")||"[]"); }catch(e){ full=[]; }' +
'  if(mnm) mnm.textContent=btn.getAttribute("data-nm")||"";' +
'  if(msub) msub.textContent=btn.getAttribute("data-sub")||"";' +
'  var lastShop=-1; for(var li=0;li<full.length;li++){ if(full[li].w!=="客") lastShop=li; }' +
'  mlog.innerHTML=full.length? full.map(function(m,idx){' +
'    var side=(m.w==="客"?"cli":"shop");' +
'    var seen=(idx===lastShop&&m.seen)?"<span class=\\"unaseen\\">既読</span>":"";' +
'    return "<div class=\\"unamsgrow "+side+"\\">"+' +
'      "<div class=\\"unamsg "+side+"\\">"+escH(m.x)+"</div>"+' +
'      "<span class=\\"unats\\">"+seen+escH(m.t)+"</span></div>";' +
'  }).join(""):"<div class=\\"unamnote\\">本文がありません（画像・スタンプのみ等）。</div>";' +
'  if(mreply){' +
'    var canR=(btn.getAttribute("data-reply")==="1"), cid=btn.getAttribute("data-cid")||"", nm=btn.getAttribute("data-nm")||"", sex=btn.getAttribute("data-sex")||"";' +
'    mreply.innerHTML=(canR&&cid)?' +
'      "<div class=\\"unareply\\" data-cid=\\""+escH(cid)+"\\" data-nm=\\""+escH(nm)+"\\" data-sex=\\""+escH(sex)+"\\">"+' +
'        "<textarea class=\\"unartext\\" rows=\\"2\\" maxlength=\\"1000\\" placeholder=\\"ここに返信を打つと、お店の公式LINEから送ります\\"></textarea>"+' +
'        "<div class=\\"unastamps\\"></div>"+' +
'        "<div class=\\"unarrow\\">"+' +
'          "<button type=\\"button\\" class=\\"unartrans\\">🀄 中文翻訳</button>"+' +
'          "<span class=\\"unarnote\\"></span>"+' +
'          "<button type=\\"button\\" class=\\"unaremoji\\">😊 絵文字</button>"+' +
'          "<button type=\\"button\\" class=\\"unarpicker\\">😀 スタンプ</button>"+' +
'          "<button type=\\"button\\" class=\\"unarsend\\">送る</button></div>"+' +
'        "<div class=\\"unartrbox\\" style=\\"display:none\\">"+' +
'          "<textarea class=\\"unartrtext\\" readonly placeholder=\\"ここに中国語訳が出ます\\"></textarea>"+' +
'          "<button type=\\"button\\" class=\\"unartrsend\\">この中文を送る</button></div>"+' +
'      "</div>":"";' +
'    if(canR&&cid) paintStamps_();' +
'  }' +
'  unaApplyFs(unaGetFs());' +   
'  mask.classList.add("on");' +
'  setTimeout(function(){ mlog.scrollTop=mlog.scrollHeight; },0);' +
'}' +
'function closeDetail(){ if(mask) mask.classList.remove("on"); }' +
'document.addEventListener("click",function(e){' +
'  var b=e.target&&e.target.closest?e.target.closest(".unadetail"):null;' +
'  if(b){ openDetail(b); }' +
'});' +
'if(mask) mask.addEventListener("click",function(e){ if(e.target===mask) closeDetail(); });' +
'var mx=document.getElementById("unaMx"); if(mx) mx.addEventListener("click",closeDetail);' +
'document.addEventListener("keydown",function(e){ if(e.key==="Escape") closeDetail(); });' +
'var EXEC_UNA_="https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec";' +
'var KEY_UNA_="kx7Q2p9mVt4Zr8";' +
'function unaCall_(params,onResult){' +
'  var cb="__ur"+Date.now()+Math.floor(Math.random()*1000);' +
'  window[cb]=function(r){ try{ delete window[cb]; }catch(ig){} onResult(r); };' +
'  var qs="key="+encodeURIComponent(KEY_UNA_)+"&callback="+cb;' +
'  for(var k in params){ qs+="&"+k+"="+encodeURIComponent(params[k]); }' +
'  var sc=document.createElement("script"); sc.src=EXEC_UNA_+"?"+qs;' +
'  sc.onerror=function(){ onResult({ok:false,error:"通信エラー"}); };' +
'  document.body.appendChild(sc);' +
'}' +
'function unaIdent_(){ var w="",r="",d=""; try{ w=localStorage.getItem("sz_who")||""; r=localStorage.getItem("sz_role")||""; d=localStorage.getItem("sz_device")||""; }catch(e){}' +
'  return {who:w,role:r,device:d}; }' +
'function unaAsk_(nm,text,onYes){' +
'  var mask=document.createElement("div"); mask.className="unaask";' +
'  var box=document.createElement("div"); box.className="unaaskbox";' +
'  var h=document.createElement("div"); h.className="unaaskh"; h.textContent="この内容で送ります";' +
'  var to=document.createElement("div"); to.className="unaaskto"; to.textContent="宛先： "+nm;' +
'  var bd=document.createElement("div"); bd.className="unaaskbd"; bd.textContent=text;' +
'  var bt=document.createElement("div"); bt.className="unaaskbt";' +
'  var no=document.createElement("button"); no.type="button"; no.className="unaaskno"; no.textContent="やめる";' +
'  var ok=document.createElement("button"); ok.type="button"; ok.className="unaaskok"; ok.textContent="送る";' +
'  bt.appendChild(no); bt.appendChild(ok); box.appendChild(h); box.appendChild(to); box.appendChild(bd); box.appendChild(bt);' +
'  mask.appendChild(box); document.body.appendChild(mask);' +
'  function cls(){ try{ document.body.removeChild(mask); }catch(ig){} }' +
'  no.addEventListener("click",cls);' +
'  ok.addEventListener("click",function(){ cls(); onYes(); });' +
'  mask.addEventListener("click",function(e){ if(e.target===mask) cls(); });' +
'}' +
'function unaSend_(wrap){' +
'  var ta=wrap.querySelector(".unartext"), btn=wrap.querySelector(".unarsend");' +
'  var note=wrap.querySelector(".unarnote");' +
'  var cid=wrap.getAttribute("data-cid")||"", nm=wrap.getAttribute("data-nm")||"";' +
'  var text=(ta&&ta.value||"").trim();' +
'  if(!text){ if(note){ note.className="unarnote ng"; note.textContent="本文を入力してね😊"; } return; }' +
'  unaAsk_(nm,text,function(){' +
'    if(note){ note.className="unarnote"; note.textContent="送信中…"; }' +
'    var idn=unaIdent_();' +
'    var rw=null, lg=document.getElementById("unaMlog");' +
'    if(lg && wrap.closest && wrap.closest(".unamodal")){' +
'      rw=document.createElement("div"); rw.className="unamsgrow shop";' +
'      rw.innerHTML="<div class=\\"unamsg shop\\">"+escH(text)+"</div><span class=\\"unats\\"><span class=\\"unasend0\\">送信中…</span></span>";' +
'      lg.appendChild(rw); lg.scrollTop=lg.scrollHeight; }' +
'    if(ta){ ta.value=""; unaGrow(ta); }' +
'    function mark(t,c){ if(!rw) return; var s=rw.querySelector(".unats"); if(s) s.innerHTML=c?("<span class=\\""+c+"\\">"+t+"</span>"):t; }' +
'    unaCall_({action:"submit",op:"line_reply",who:idn.who,role:idn.role,device:idn.device,' +
'      fields:JSON.stringify({chat:cid,text:text,title:nm})},' +
'      function(r){' +
'        if(!r||!r.ok){ if(note){ note.className="unarnote ng"; note.textContent=(r&&r.error)||"送れませんでした。"; } mark("送れませんでした","unafail"); return; }' +
'        var tries=0;' +
'        (function poll(){' +
'          tries++;' +
'          unaCall_({action:"status",id:r.id},function(st){' +
'            if(st&&st.status==="done"){' +
'              if(note){ note.className="unarnote ok"; note.textContent=st.result||"送りました。"; } mark("送信済み・たった今",""); return; }' +
'            if(st&&st.status==="error"){' +
'              if(note){ note.className="unarnote ng"; note.textContent=st.result||"送れませんでした。"; } mark("送れませんでした","unafail"); return; }' +
'            if(tries>60){' +
'              if(note){ note.className="unarnote ng"; note.textContent="返事がありません。もう一度試してもらえると嬉しいです🙇"; } mark("未確認","unafail"); return; }' +
'            setTimeout(poll,1200);' +
'          });' +
'        })();' +
'      });' +
'  });' +
'}' +
'document.addEventListener("click",function(e){' +
'  var b=e.target&&e.target.closest?e.target.closest(".unarsend"):null;' +
'  if(!b) return;' +
'  var w=b.closest(".unareply"); if(w) unaSend_(w);' +
'});' +
'var STAMPS_=null, STAMPS_WAIT_=[];' +
'function loadStamps_(cb){' +
'  if(STAMPS_){ cb(STAMPS_); return; }' +
'  STAMPS_WAIT_.push(cb);' +
'  if(STAMPS_WAIT_.length>1) return;' +
'  fetch("stamps.json?cb="+Date.now()).then(function(r){return r.json();}).then(function(d){' +
'    STAMPS_=Array.isArray(d)?d:[]; STAMPS_WAIT_.forEach(function(f){f(STAMPS_);}); STAMPS_WAIT_=[];' +
'  }).catch(function(){ STAMPS_=[]; STAMPS_WAIT_.forEach(function(f){f(STAMPS_);}); STAMPS_WAIT_=[]; });' +
'}' +
'function paintStamps_(){' +
'  var boxes=[].slice.call(document.querySelectorAll(".unastamps"));' +
'  if(!boxes.length) return;' +
'  loadStamps_(function(list){' +
'    boxes.forEach(function(box){' +
'      if(box.getAttribute("data-done")) return; box.setAttribute("data-done","1");' +
'      if(!list.length){ return; }' +
'      list.forEach(function(st){' +
'        var b=document.createElement("button"); b.type="button"; b.className="unastamp";' +
'        b.setAttribute("data-key",st.key); b.title=st.label||st.key;' +
'        var img=document.createElement("img"); img.src=st.img; img.alt=st.label||st.key;' +
'        b.appendChild(img); box.appendChild(b);' +
'      });' +
'    });' +
'  });' +
'}' +
'function unaAskStamp_(nm,imgsrc,onYes){' +
'  var mask=document.createElement("div"); mask.className="unaask";' +
'  var box=document.createElement("div"); box.className="unaaskbox";' +
'  var h=document.createElement("div"); h.className="unaaskh"; h.textContent="このスタンプを送ります";' +
'  var to=document.createElement("div"); to.className="unaaskto"; to.textContent="宛先： "+nm;' +
'  var im=document.createElement("img"); im.className="unaaskimg"; im.src=imgsrc;' +
'  var bt=document.createElement("div"); bt.className="unaaskbt";' +
'  var no=document.createElement("button"); no.type="button"; no.className="unaaskno"; no.textContent="やめる";' +
'  var ok=document.createElement("button"); ok.type="button"; ok.className="unaaskok"; ok.textContent="送る";' +
'  bt.appendChild(no); bt.appendChild(ok); box.appendChild(h); box.appendChild(to); box.appendChild(im); box.appendChild(bt);' +
'  mask.appendChild(box); document.body.appendChild(mask);' +
'  function cls(){ try{ document.body.removeChild(mask); }catch(ig){} }' +
'  no.addEventListener("click",cls); ok.addEventListener("click",function(){ cls(); onYes(); });' +
'  mask.addEventListener("click",function(e){ if(e.target===mask) cls(); });' +
'}' +
'function unaSendStamp_(wrap, key, imgsrc){' +
'  var note=wrap.querySelector(".unarnote");' +
'  var cid=wrap.getAttribute("data-cid")||"", nm=wrap.getAttribute("data-nm")||"";' +
'  unaAskStamp_(nm, imgsrc, function(){' +
'    if(note){ note.className="unarnote"; note.textContent="送信中…"; }' +
'    var idn=unaIdent_();' +
'    unaCall_({action:"submit",op:"line_reply",who:idn.who,role:idn.role,device:idn.device,' +
'      fields:JSON.stringify({chat:cid,stamp:key})},' +
'      function(r){' +
'        if(!r||!r.ok){ if(note){ note.className="unarnote ng"; note.textContent=(r&&r.error)||"送れませんでした。"; } return; }' +
'        var tries=0;' +
'        (function poll(){' +
'          tries++;' +
'          unaCall_({action:"status",id:r.id},function(st){' +
'            if(st&&st.status==="done"){ if(note){ note.className="unarnote ok"; note.textContent=st.result||"送りました。"; } return; }' +
'            if(st&&st.status==="error"){ if(note){ note.className="unarnote ng"; note.textContent=st.result||"送れませんでした。"; } return; }' +
'            if(tries>40){ if(note){ note.className="unarnote ng"; note.textContent="返事がありません。もう一度試してもらえると嬉しいです🙇"; } return; }' +
'            setTimeout(poll,3000);' +
'          });' +
'        })();' +
'      });' +
'  });' +
'}' +
'document.addEventListener("click",function(e){' +
'  var b=e.target&&e.target.closest?e.target.closest(".unastamp"):null;' +
'  if(!b) return;' +
'  var w=b.closest(".unareply"); if(!w) return;' +
'  var img=b.querySelector("img");' +
'  unaSendStamp_(w, b.getAttribute("data-key"), img?img.src:"");' +
'});' +
'var REALSTICKERS_=null, REALSTICKERS_WAIT_=[];' +
'function loadRealStickers_(cb){' +
'  if(REALSTICKERS_){ cb(REALSTICKERS_); return; }' +
'  REALSTICKERS_WAIT_.push(cb);' +
'  if(REALSTICKERS_WAIT_.length>1) return;' +
'  unaCall_({action:"data",name:"line_stickers.json"},function(d){' +
'    REALSTICKERS_=(d&&d.packs)||[]; REALSTICKERS_WAIT_.forEach(function(f){f(REALSTICKERS_);}); REALSTICKERS_WAIT_=[];' +
'  });' +
'}' +
'function unaStickerPanel_(wrap){' +
'  var mask=document.createElement("div"); mask.className="unaask";' +
'  var box=document.createElement("div"); box.className="unaaskbox unastkbox";' +
'  var h=document.createElement("div"); h.className="unaaskh"; h.textContent="スタンプを選ぶ";' +
'  var tabs=document.createElement("div"); tabs.className="unastktabs";' +
'  var grid=document.createElement("div"); grid.className="unastkgrid"; grid.textContent="読み込み中…";' +
'  var no=document.createElement("button"); no.type="button"; no.className="unaaskno"; no.textContent="閉じる";' +
'  var bt=document.createElement("div"); bt.className="unaaskbt"; bt.appendChild(no);' +
'  box.appendChild(h); box.appendChild(tabs); box.appendChild(grid); box.appendChild(bt);' +
'  mask.appendChild(box); document.body.appendChild(mask);' +
'  function close(){ try{ document.body.removeChild(mask); }catch(ig){} }' +
'  no.addEventListener("click",close);' +
'  mask.addEventListener("click",function(e){ if(e.target===mask) close(); });' +
'  function paintPack(pack){' +
'    grid.innerHTML="";' +
'    pack.stickers.forEach(function(st){' +
'      var b=document.createElement("button"); b.type="button"; b.className="unastkitem";' +
'      var img=document.createElement("img"); img.src=st.thumb; img.loading="lazy";' +
'      b.appendChild(img);' +
'      b.addEventListener("click",function(){' +
'        close();' +
'        unaSendRealSticker_(wrap, pack.packageId, st.stickerId, st.thumb);' +
'      });' +
'      grid.appendChild(b);' +
'    });' +
'  }' +
'  loadRealStickers_(function(packs){' +
'    if(!packs.length){ grid.textContent="スタンプが見つかりません。"; return; }' +
'    tabs.innerHTML="";' +
'    packs.forEach(function(pack,i){' +
'      var t=document.createElement("button"); t.type="button"; t.className="unastktab"+(i===0?" sel":"");' +
'      var timg=document.createElement("img"); timg.src=pack.stickers[0].thumb;' +
'      t.appendChild(timg);' +
'      t.addEventListener("click",function(){' +
'        [].slice.call(tabs.children).forEach(function(x){ x.classList.remove("sel"); });' +
'        t.classList.add("sel"); paintPack(pack);' +
'      });' +
'      tabs.appendChild(t);' +
'    });' +
'    paintPack(packs[0]);' +
'  });' +
'}' +
'function unaSendRealSticker_(wrap, packageId, stickerId, imgsrc){' +
'  var note=wrap.querySelector(".unarnote");' +
'  var cid=wrap.getAttribute("data-cid")||"", nm=wrap.getAttribute("data-nm")||"";' +
'  unaAskStamp_(nm, imgsrc, function(){' +
'    if(note){ note.className="unarnote"; note.textContent="送信中…（少し時間がかかります）"; }' +
'    var idn=unaIdent_();' +
'    unaCall_({action:"submit",op:"line_reply",who:idn.who,role:idn.role,device:idn.device,' +
'      fields:JSON.stringify({chat:cid,package_id:packageId,sticker_id:stickerId})},' +
'      function(r){' +
'        if(!r||!r.ok){ if(note){ note.className="unarnote ng"; note.textContent=(r&&r.error)||"送れませんでした。"; } return; }' +
'        var tries=0;' +
'        (function poll(){' +
'          tries++;' +
'          unaCall_({action:"status",id:r.id},function(st){' +
'            if(st&&st.status==="done"){ if(note){ note.className="unarnote ok"; note.textContent=st.result||"送りました。"; } return; }' +
'            if(st&&st.status==="error"){ if(note){ note.className="unarnote ng"; note.textContent=st.result||"送れませんでした。"; } return; }' +
'            if(tries>60){ if(note){ note.className="unarnote ng"; note.textContent="返事がありません。もう一度試してもらえると嬉しいです🙇"; } return; }' +
'            setTimeout(poll,3000);' +
'          });' +
'        })();' +
'      });' +
'  });' +
'}' +
'document.addEventListener("click",function(e){' +
'  var b=e.target&&e.target.closest?e.target.closest(".unarpicker"):null;' +
'  if(!b) return;' +
'  var w=b.closest(".unareply"); if(w) unaStickerPanel_(w);' +
'});' +
'var EMOJI_LIST_=["😊","😀","😄","😁","😆","🙂","😉","😍","🥰","🤣","😂","😢","😭","🙏","👍",' +
'"👌","💪","🎉","❤","💦","😅","🤔","😴","🙇","✨","🌸","☀","🌧","😱","😳"];' +
'function unaEmojiPanel_(wrap){' +
'  var mask=document.createElement("div"); mask.className="unaask";' +
'  var box=document.createElement("div"); box.className="unaaskbox unastkbox";' +
'  var h=document.createElement("div"); h.className="unaaskh"; h.textContent="絵文字を選ぶ";' +
'  var grid=document.createElement("div"); grid.className="unaemgrid";' +
'  var no=document.createElement("button"); no.type="button"; no.className="unaaskno"; no.textContent="閉じる";' +
'  var bt=document.createElement("div"); bt.className="unaaskbt"; bt.appendChild(no);' +
'  EMOJI_LIST_.forEach(function(em){' +
'    var b=document.createElement("button"); b.type="button"; b.className="unaemitem"; b.textContent=em;' +
'    b.addEventListener("click",function(){' +
'      var ta=wrap.querySelector(".unartext"); if(!ta) return;' +
'      var s=ta.selectionStart==null?ta.value.length:ta.selectionStart;' +
'      var e2=ta.selectionEnd==null?ta.value.length:ta.selectionEnd;' +
'      ta.value=ta.value.slice(0,s)+em+ta.value.slice(e2);' +
'      var pos=s+em.length; ta.focus(); ta.setSelectionRange(pos,pos);' +
'      close();' +
'    });' +
'    grid.appendChild(b);' +
'  });' +
'  box.appendChild(h); box.appendChild(grid); box.appendChild(bt);' +
'  mask.appendChild(box); document.body.appendChild(mask);' +
'  function close(){ try{ document.body.removeChild(mask); }catch(ig){} }' +
'  no.addEventListener("click",close);' +
'  mask.addEventListener("click",function(e){ if(e.target===mask) close(); });' +
'}' +
'document.addEventListener("click",function(e){' +
'  var b=e.target&&e.target.closest?e.target.closest(".unaremoji"):null;' +
'  if(!b) return;' +
'  var w=b.closest(".unareply"); if(w) unaEmojiPanel_(w);' +
'});' +
'paintStamps_();' +
'apply();' +
'})();</scr' + 'ipt>';
var UNACSS_ =
'  :root{ --bg:#2C7A99; --card:#ffffff; --ink:#1c2430; --sub:#667085; --line:#e6e9ef;' +
'    --cust:#0d9b6c; --req:#e5484d; --q:#4f57c4; --custbg:#e7f6ec; }' +
'  @media (prefers-color-scheme:dark){ :root{ --card:#1b2430; --ink:#e8ebf0; --sub:#9aa4b2;' +
'    --line:#2a3441; --custbg:#12331f; } }' +
'  *{ box-sizing:border-box; }' +
'  body{ margin:0; background:var(--bg); color:var(--ink);' +
'    font-family:"Segoe UI","Yu Gothic UI","Hiragino Sans",system-ui,sans-serif; line-height:1.5; }' +
'  .unawrap{ max-width:640px; margin:0 auto; padding:16px 14px 60px; }' +
'  .unabar{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px; }' +
'  .unahome{ color:#fff; text-decoration:none; font-weight:700; font-size:14px;' +
'    background:rgba(255,255,255,.16); padding:7px 12px; border-radius:10px; }' +
'  .unagen{ color:#eaf3f7; font-size:15px; font-weight:700; opacity:.95; }' +
'  h1{ color:#fff; font-size:16px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin:6px 0 12px; }' +
'  .unatabs{ display:flex; gap:8px; margin-bottom:12px; }' +
'  .unatab{ flex:1; background:var(--card); border:1px solid var(--line); border-radius:12px;' +
'    padding:10px 8px; cursor:pointer; text-align:center; color:var(--ink); font:inherit; font-weight:800;' +
'    font-size:clamp(17px,5vw,22px); }' +
'  .unatab .unac{ display:block; font-size:clamp(26px,9vw,38px); font-weight:900; margin-top:2px; }' +
'  .unatab.cust.sel{ background:var(--cust); border-color:var(--cust); color:#fff; }' +
'  .unatab.ours.sel{ background:var(--q); border-color:var(--q); color:#fff; }' +
'  .unatab.sel .unac{ color:#fff; }' +
'  #unaperiod{ width:100%; padding:16px 16px; border:1px solid var(--line); border-radius:10px;' +
'    background:var(--card); color:var(--ink); font-size:19px; font-weight:800; margin-bottom:10px; }' +
'  #unaq{ width:100%; padding:10px 12px; border:1px solid var(--line); border-radius:10px;' +
'    background:var(--card); color:var(--ink); font-size:15px; margin-bottom:14px; }' +
'  .unahidden{ display:none!important; } .unahide{ display:none!important; }' +
'  .unalist{ display:flex; flex-direction:column; gap:10px; }' +
'  .unacard{ background:var(--card); border:1px solid var(--line); border-left:6px solid var(--sub);' +
'    border-radius:12px; padding:12px 14px; }' +
'  .unacard.prac{ border:2px dashed var(--q); background:var(--card); }' +
'  .unareply{ margin-top:10px; border-top:1px solid var(--line); padding-top:10px; }' +
'  .unartext{ width:100%; padding:10px 12px; border:1px solid var(--line); border-radius:10px;' +
'    background:var(--card); color:var(--ink); font:inherit; font-size:16px; resize:none;' +
'    box-sizing:border-box; min-height:52px; max-height:340px; overflow-y:auto; }' +
'  .unarrow{ display:flex; align-items:center; gap:10px; margin-top:8px; }' +
'  .unarnote{ flex:1; font-size:13px; font-weight:700; color:var(--sub); }' +
'  .unartrans{ appearance:none; border:1px solid #b45309; background:#fffbeb; color:#b45309; font:inherit;' +
'    font-weight:800; font-size:14px; padding:8px 12px; border-radius:10px; cursor:pointer; }' +
'  .unartrbox{ margin-top:8px; }' +
'  .unartrtext{ width:100%; box-sizing:border-box; min-height:60px; max-height:300px; overflow-y:auto;' +
'    padding:10px 12px; border:1px solid #06c755; border-radius:10px; background:#f0fff4; color:#111;' +
'    font:inherit; font-size:16px; font-weight:700; resize:none; }' +
'  .unartrsend{ appearance:none; border:0; background:#06c755; color:#fff; font:inherit; font-weight:800;' +
'    font-size:15px; padding:11px 20px; border-radius:10px; cursor:pointer; margin-top:8px; }' +
'  .unarnote.ok{ color:var(--cust); } .unarnote.ng{ color:var(--req); }' +
'  .unastamps{ display:flex; flex-wrap:wrap; gap:8px; margin:8px 0 2px; }' +
'  .unastamp{ background:var(--card); border:1px solid var(--line); border-radius:12px; padding:4px;' +
'    cursor:pointer; width:64px; height:64px; display:flex; align-items:center; justify-content:center; }' +
'  .unastamp img{ max-width:100%; max-height:100%; }' +
'  .unaaskimg{ display:block; margin:6px auto 2px; max-width:180px; max-height:180px; }' +
'  .unarsend{ background:var(--cust); color:#fff; border:0; border-radius:10px; padding:11px 22px;' +
'    font:inherit; font-weight:800; font-size:16px; cursor:pointer; }' +
'  .unarsend:disabled{ opacity:.5; }' +
'  .unarpicker{ background:var(--card); border:1px solid var(--line); color:var(--ink); border-radius:10px;' +
'    padding:11px 16px; font:inherit; font-weight:700; font-size:15px; cursor:pointer; }' +
'  .unaremoji{ background:var(--card); border:1px solid var(--line); color:var(--ink); border-radius:10px;' +
'    padding:11px 16px; font:inherit; font-weight:700; font-size:15px; cursor:pointer; }' +
'  .unaemgrid{ display:grid; grid-template-columns:repeat(6,1fr); gap:6px; max-height:260px; overflow-y:auto; }' +
'  .unaemitem{ background:var(--custbg); border:1px solid var(--line); border-radius:10px;' +
'    font-size:24px; padding:6px; cursor:pointer; aspect-ratio:1; }' +
'  .unastkbox{ max-width:520px; }' +
'  .unastktabs{ display:flex; flex-wrap:wrap; gap:6px; max-height:110px; overflow-y:auto; margin-bottom:10px;' +
'    padding-bottom:8px; border-bottom:1px solid var(--line); }' +
'  .unastktab{ width:40px; height:40px; padding:2px; border-radius:8px; border:2px solid transparent;' +
'    background:var(--custbg); cursor:pointer; display:flex; align-items:center; justify-content:center; }' +
'  .unastktab img{ max-width:100%; max-height:100%; }' +
'  .unastktab.sel{ border-color:var(--cust); }' +
'  .unastkgrid{ display:grid; grid-template-columns:repeat(5,1fr); gap:8px; max-height:280px; overflow-y:auto; }' +
'  .unastkitem{ background:var(--custbg); border:1px solid var(--line); border-radius:10px; padding:4px;' +
'    cursor:pointer; aspect-ratio:1; display:flex; align-items:center; justify-content:center; }' +
'  .unastkitem img{ max-width:100%; max-height:100%; }' +
'  .unaask{ position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center;' +
'    justify-content:center; padding:18px; z-index:60; }' +
'  .unaaskbox{ background:var(--card); border-radius:14px; padding:16px; max-width:420px; width:100%; }' +
'  .unaaskh{ font-weight:900; font-size:17px; margin-bottom:8px; }' +
'  .unaaskto{ font-size:14px; color:var(--sub); font-weight:700; margin-bottom:8px; }' +
'  .unaaskbd{ background:var(--custbg); border-radius:10px; padding:10px 12px; font-size:15px;' +
'    white-space:pre-wrap; max-height:40vh; overflow:auto; }' +
'  .unaaskbt{ display:flex; gap:10px; justify-content:flex-end; margin-top:14px; }' +
'  .unaaskno{ background:transparent; border:1px solid var(--line); color:var(--ink); }' +
'  .unaaskok{ background:var(--cust); border:0; color:#fff; }' +
'  .unaaskbt button{ border-radius:10px; padding:11px 22px; font:inherit; font-weight:800; font-size:15px; cursor:pointer; }' +
'  .unacard.cust{ border-left-color:var(--cust); background:var(--custbg); }' +
'  .unacard.ours{ border-left-color:var(--q); }' +
'  .unahead{ display:flex; flex-direction:column; gap:5px; margin-bottom:6px; }' +
'  .unarow1{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }' +
'  .unarow2{ display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; }' +
'  .unapill{ font-size:clamp(18px,5vw,24px); font-weight:800; padding:3px 10px; border-radius:8px; }' +
'  .unapill.unread{ background:#fef9c3; color:#854d0e; } .unapill.read{ background:var(--line); color:var(--sub); }' +
'  .unawhentag{ font-size:clamp(26px,7.2vw,32px); font-weight:800; color:var(--sub); font-variant-numeric:tabular-nums; }' +
'  .unaname{ font-weight:800; font-size:clamp(20px,5.6vw,26px); }' +
'  .unatag{ font-size:clamp(14px,4vw,18px); color:var(--sub); }' +
'  .unadays{ font-size:clamp(20px,5.5vw,26px); font-weight:700; color:var(--sub); font-variant-numeric:tabular-nums; }' +
'  .unaq{ font-size:clamp(15px,4.2vw,19px); margin:2px 0 6px; line-height:1.5;' +
'    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }' +
'  .unath{ font-size:12px; color:var(--sub); border-top:1px dashed var(--line); padding-top:6px; margin-top:2px; }' +
'  .unaactions{ margin-top:9px; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }' +
'  .unadetail{ appearance:none; font:inherit; font-size:12.5px; font-weight:700; cursor:pointer;' +
'    padding:8px 14px; border-radius:10px; border:1px solid var(--q); background:var(--card); color:var(--q); }' +
'  .unalink{ display:inline-block; text-decoration:none; background:#06c755; color:#fff; font-weight:700;' +
'    font-size:12.5px; padding:8px 14px; border-radius:10px; }' +
'  .unaempty{ text-align:center; color:#fff; padding:30px; font-weight:700; }' +
'  .unaemptybig{ font-size:clamp(17px,5vw,22px); line-height:1.7; }' +
'  .unamask{ position:fixed; inset:0; background:rgba(0,0,0,.5); display:none;' +
'    align-items:center; justify-content:center; padding:16px; z-index:60; }' +
'  .unamask.on{ display:flex; }' +
'  .unamodal{ background:var(--card); border:1px solid var(--line); border-radius:16px;' +
'    max-width:560px; width:100%; max-height:82vh; display:flex; flex-direction:column;' +
'    box-shadow:0 24px 60px rgba(0,0,0,.4); }' +
'  .unamh{ padding:14px 16px; border-bottom:1px solid var(--line); display:flex;' +
'    justify-content:space-between; gap:10px; align-items:flex-start; }' +
'  .unamnm{ font-weight:800; font-size:20px; color:var(--ink); }' +
'  .unamsub{ font-size:14px; color:var(--sub); margin-top:3px; }' +
'  .unamx{ appearance:none; border:0; background:none; font-size:28px; line-height:1;' +
'    color:var(--sub); cursor:pointer; padding:2px 6px; }' +
'  .unamhr{ display:flex; align-items:center; gap:8px; flex:none; }' +
'  .unafs{ display:flex; gap:2px; background:var(--line); border-radius:9px; padding:2px; }' +
'  .unafsb{ appearance:none; border:0; background:none; font:inherit; font-weight:800; cursor:pointer;' +
'    padding:5px 10px; border-radius:7px; color:var(--sub); font-size:14px; line-height:1; }' +
'  .unafsb.on{ background:var(--card); color:var(--ink); box-shadow:0 1px 2px rgba(0,0,0,.15); }' +
'  .unamlog{ overflow-y:auto; padding:14px 16px; display:flex; flex-direction:column; gap:10px;' +
'    background:var(--bg); }' +
'  .unamsgrow{ display:flex; flex-direction:column; max-width:82%; }' +
'  .unamsgrow.cli{ align-self:flex-start; align-items:flex-start; }' +
'  .unamsgrow.shop{ align-self:flex-end; align-items:flex-end; }' +
'  .unamsg{ max-width:100%; padding:11px 14px; border-radius:16px; font-size:17px; line-height:1.55;' +
'    white-space:pre-wrap; overflow-wrap:anywhere; word-break:normal; color:var(--ink); }' +
'  .unamlog[data-fs="sm"] .unamsg{ font-size:14px; }' +
'  .unamlog[data-fs="md"] .unamsg{ font-size:17px; }' +
'  .unamlog[data-fs="lg"] .unamsg{ font-size:21px; }' +
'  .unamlog[data-fs="xl"] .unamsg{ font-size:26px; }' +
'  .unamsg{ color:#111 !important; font-weight:700; }' +
'  .unamsg.cli{ background:#ffffff; border:1px solid #d7dbe3; border-bottom-left-radius:5px; }' +
'  .unamsg.shop{ background:#d6f5c8; border-bottom-right-radius:5px; }' +
'  .unats{ display:block; font-size:11.5px; color:var(--sub); opacity:.8; margin:3px 4px 0; }' +
'  .unaseen{ color:#06c755; font-weight:700; margin-right:5px; }' +
'  .unasend0{ color:var(--sub); }' +
'  .unafail{ color:#e5484d; font-weight:700; }' +
'  .unamnote{ color:var(--sub); font-size:15px; padding:8px; }' +
'  .unamreply{ padding:0 16px 12px; }' +
'  .unamreply .unareply{ margin-top:0; }';
