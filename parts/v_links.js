// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：links
function renderLinksError_(err, base, staff, dev) {
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">🔗</span><span class="bname">各種LINK</span></div>' +
    '<div class="soon">' +
      '<div class="soonic">📄</div>' +
      '<div class="soontitle" style="font-size:1.4rem">データ未生成</div>' +
      '<div class="soondesc">' + esc_(err && err.message ? err.message : err) + '</div>' +
    '</div>' +
  '</div>';
}
function renderLinksPage_(d, base, staff, dev) {
  var topics = (d && d.topics) || [];
  var list = '<div id="lktopics">' +
      '<div class="lkimgtitle" id="lktopicshead"></div>' +
      '<div class="lkimgcats">' +
        topics.map(function (t, i) {
          var k = (t.kind === '商品' || t.kind === 'オンラインショップ') ? t.kind : 'キャンペーン';
          return '<button type="button" class="lkcatbtn lktopicbtn" data-t="' + i + '" data-k="' + k + '">' + esc_(t.name || '') + '</button>';
        }).join('') +
      '</div>' +
      '<div class="lknone" id="lktopicsnone" hidden>まだ案内リンクが登録されていません。</div>' +
    '</div>' +
    topics.map(lkTopicBlock_).join('');
  var homeHref = (base || '') + '?view=home' + roleSfx_(staff, dev);

  return '' +
'<style>' + LKCSS_ + LKIMGCSS_ + '</style>' +
'<div class="lkwrap">' +
  '<div class="lkbar">' +
    '<a class="lkhome" href="' + homeHref + '" target="_top">← 戻る</a>' +
    '<span class="lkgen">生成: ' + esc_((d && d.generated_at) || '—') + '</span>' +
  '</div>' +
  '<div class="lkhead"><h1>🔗 各種LINK</h1></div>' +
  '<div id="lkhub" class="lkhub">' +
    '<button type="button" class="lkhubbtn lkgotopics" data-k="キャンペーン"><span class="lkhubico">🎁</span><span>キャンペーン</span></button>' +
    '<button type="button" class="lkhubbtn" id="lkGoImg"><span class="lkhubico">🖼️</span><span>施術前＆後の画像</span></button>' +
    '<button type="button" class="lkhubbtn lkgotopics" data-k="商品"><span class="lkhubico">🛍️</span><span>商品</span></button>' +
    '<button type="button" class="lkhubbtn lkgotopics" data-k="オンラインショップ"><span class="lkhubico">🛒</span><span>オンラインショップ</span></button>' +
  '</div>' +
  '<div id="lkurlsec" class="lksec" hidden>' +
    '<button type="button" class="lkback2" id="lkUrlBack">← 戻る</button>' +
    '<div id="lklist">' + list + '</div>' +
  '</div>' +
  '<div id="lkimgsec" class="lksec" hidden>' +
    '<button type="button" class="lkback2" id="lkImgBack">← 戻る</button>' +
    '<div id="lkimgbody"></div>' +
  '</div>' +
'</div>' +
LKSCRIPT_ +
lkImgScript_(base || '');
}
function lkImgScript_(base) {
  return '<script>(function(){' +
    'var BASE="' + base + '";' +   
    'var CATS=null,imgLoading=false;' +   
    'var hub=document.getElementById("lkhub");' +
    'var urlsec=document.getElementById("lkurlsec");' +
    'var imgsec=document.getElementById("lkimgsec");' +
    'var body=document.getElementById("lkimgbody");' +
    'var goUrl=document.getElementById("lkGoUrl"),goImg=document.getElementById("lkGoImg");' +
    'var urlBack=document.getElementById("lkUrlBack"),imgBack=document.getElementById("lkImgBack");' +
    'var level="cats",curCat=null,curGroup=null;' +   
    'function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\\"/g,"&quot;");}' +
    'function showHub(){hub.hidden=false;urlsec.hidden=true;imgsec.hidden=true;}' +
    'function showUrl(){hub.hidden=true;urlsec.hidden=false;imgsec.hidden=true;}' +
    'function showImg(){hub.hidden=true;urlsec.hidden=true;imgsec.hidden=false;}' +
    'function tryFetch(n,done){' +
      'fetch(BASE+"images.json?cb="+Date.now(),{cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.json();})' +
        '.then(function(j){done(true,j);})' +
        '.catch(function(){if(n>1){setTimeout(function(){tryFetch(n-1,done);},600);}else{done(false);}});}' +
    'function loadImages(){if(imgLoading||CATS)return;imgLoading=true;' +
      'tryFetch(4,function(ok,r){imgLoading=false;' +
        'if(ok){CATS=(r&&r.cats)||[];if(!imgsec.hidden)renderCats();}' +
        'else if(!imgsec.hidden){body.innerHTML="<div class=\\"lknone\\">画像の読み込みに失敗しました。もう一度試してもらえると嬉しいです🙇</div>";}' +
      '});}' +
    'function openImg(){showImg();if(CATS){renderCats();return;}' +
      'body.innerHTML="<div class=\\"lkimgmsg\\">読み込み中…</div>";if(!imgLoading)loadImages();}' +
    'var tlist=document.getElementById("lktopics"),tblocks=urlsec?urlsec.querySelectorAll(".lktopic"):[],curTopic=-1,curKind="キャンペーン";' +
    'var tbtns=[].slice.call(document.querySelectorAll(".lktopicbtn")),thead=document.getElementById("lktopicshead"),tnone=document.getElementById("lktopicsnone");' +
    'function showTopics(k){if(k)curKind=k;curTopic=-1;if(tlist)tlist.hidden=false;for(var i=0;i<tblocks.length;i++)tblocks[i].hidden=true;' +
      'var n=0;tbtns.forEach(function(b){var on=b.getAttribute("data-k")===curKind;b.hidden=!on;if(on)n++;});' +
      'if(thead)thead.textContent=curKind;if(tnone)tnone.hidden=n>0;window.scrollTo(0,0);}' +
    'function openTopic(i){curTopic=i;if(tlist)tlist.hidden=true;for(var j=0;j<tblocks.length;j++)tblocks[j].hidden=(j!==i);window.scrollTo(0,0);fitSubs(tblocks[i]);}' +
    'function fitSubs(bl){if(!bl)return;var a=bl.querySelectorAll(".lklangsub"),k,mn=99;' +
    'for(k=0;k<a.length;k++){var el=a[k],f=22;el.style.fontSize=f+"px";' +
    'while(el.clientWidth&&el.scrollWidth>el.clientWidth&&f>10){f--;el.style.fontSize=f+"px";}if(el.clientWidth&&f<mn)mn=f;}' +
    'if(mn<99)for(k=0;k<a.length;k++)a[k].style.fontSize=mn+"px";}' +
    'window.addEventListener("resize",function(){if(curTopic>=0&&tblocks[curTopic]&&!tblocks[curTopic].hidden)fitSubs(tblocks[curTopic]);});' +
    'tbtns.forEach(function(b){b.addEventListener("click",function(){openTopic(+b.getAttribute("data-t"));});});' +
    'var oneDirect=false;' +
    '[].slice.call(document.querySelectorAll(".lkgotopics")).forEach(function(b){b.addEventListener("click",function(){var k=b.getAttribute("data-k");showUrl();showTopics(k);' +
      'var only=tbtns.filter(function(x){return x.getAttribute("data-k")===k;});oneDirect=only.length===1;if(oneDirect)openTopic(+only[0].getAttribute("data-t"));});});' +
    'if(goImg)goImg.addEventListener("click",openImg);' +
    'loadImages();' +   

    'if(urlBack)urlBack.addEventListener("click",function(){if(curTopic>=0&&!oneDirect){showTopics();}else{oneDirect=false;showHub();}});' +
    'if(imgBack)imgBack.addEventListener("click",function(){' +
      'if(level==="image"){renderItems(curCat);}else if(level==="items"){if(curCat&&curCat.group){renderGroup(curCat.group);}else{renderCats();}}' +
      'else if(level==="group"){renderCats();}else{showHub();}' +
    '});' +
    'function renderCats(){level="cats";curCat=null;curGroup=null;' +
      'if(!CATS.length){body.innerHTML="<div class=\\"lknone\\">まだ画像の案内が登録されていません。</div>";return;}' +
      'var rows=[],seen={};' +
      'for(var i=0;i<CATS.length;i++){var g=CATS[i].group||"";' +
        'if(g){if(!seen[g]){seen[g]=1;rows.push({group:g});}}else{rows.push({cat:CATS[i]});}}' +
      'var h="<div class=\\"lkimgcats\\">";' +
      'for(var j=0;j<rows.length;j++){h+="<button type=\\"button\\" class=\\"lkcatbtn\\" data-i=\\""+j+"\\">"+esc(rows[j].group||rows[j].cat.name)+"</button>";}' +
      'h+="</div>";' +
      'body.innerHTML=h;var bs=body.querySelectorAll(".lkcatbtn");' +
      'for(var k=0;k<bs.length;k++){(function(idx){bs[idx].addEventListener("click",function(){' +
        'if(rows[idx].group){renderGroup(rows[idx].group);}else{renderItems(rows[idx].cat);}' +
      '});})(k);}' +
    '}' +
    'function renderGroup(g){level="group";curGroup=g;curCat=null;' +
      'var list=[];for(var i=0;i<CATS.length;i++){if((CATS[i].group||"")===g)list.push(CATS[i]);}' +
      'var h="<div class=\\"lkimgtitle\\">"+esc(g)+"</div><div class=\\"lkimgcats\\">";' +
      'for(var j=0;j<list.length;j++){h+="<button type=\\"button\\" class=\\"lkcatbtn\\" data-i=\\""+j+"\\">"+esc(list[j].name)+"</button>";}h+="</div>";' +
      'body.innerHTML=h;var bs=body.querySelectorAll(".lkcatbtn");' +
      'for(var k=0;k<bs.length;k++){(function(idx){bs[idx].addEventListener("click",function(){renderItems(list[idx]);});})(k);}' +
    '}' +
    'function renderItems(cat){level="items";curCat=cat;var items=(cat&&cat.items)||[];' +
      'var h="<div class=\\"lkimgtitle\\">"+esc(cat.name)+"</div><div class=\\"lkimgcats\\">";' +
      'for(var i=0;i<items.length;i++){h+="<button type=\\"button\\" class=\\"lkcatbtn\\" data-i=\\""+i+"\\">"+esc(items[i].label)+"</button>";}h+="</div>";' +
      'body.innerHTML=h;var bs=body.querySelectorAll(".lkcatbtn");for(var k=0;k<bs.length;k++){(function(idx){bs[idx].addEventListener("click",function(){renderImage(items[idx]);});})(k);}' +
    '}' +
    'function renderImage(item){level="image";var u=item.url;var ua=navigator.userAgent||"";' +
      'var isIOS=/iPhone|iPad|iPod/i.test(ua)||(/Macintosh/.test(ua)&&"ontouchend" in document);var isAndroid=/Android/i.test(ua);' +
      'var h="<div class=\\"lkimgtitle\\">"+esc(item.label)+"</div>";' +
      'if(!isIOS&&!isAndroid){h+="<button type=\\"button\\" class=\\"lkimgbtn\\" id=\\"lkCopy\\">📋 この画像をコピーする（LINEに貼り付け）</button>";}' +
      'h+="<button type=\\"button\\" class=\\"lkimgbtn"+((!isIOS&&!isAndroid)?" lksub":"")+"\\" id=\\"lkSave\\">"+((!isIOS&&!isAndroid)?"うまくいかない時（ダウンロードに保存）":"📷 この画像を保存する")+"</button>";' +
      'h+="<div class=\\"lkimgmsg\\" id=\\"lkMsg\\"></div>";' +
      'h+="<div class=\\"lkimgwrap\\"><img src=\\""+esc(u)+"\\" alt=\\""+esc(item.label)+"\\"></div>";' +
      'body.innerHTML=h;var msg=document.getElementById("lkMsg");' +
      'function directSave(){if(msg)msg.textContent="保存しています…";fetch(u).then(function(r){return r.blob();}).then(function(b){var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=(u.split("/").pop()||"image.jpg");document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},4000);if(msg)msg.textContent=(isAndroid?"保存しました。「ダウンロード」フォルダ（写真アプリの「ダウンロード」）に入ります。":"保存しました。「ダウンロード」フォルダに入ります。");}).catch(function(){if(msg)msg.textContent="";window.open(u,"_blank");});}' +
      'function iosSave(){if(!(navigator.canShare&&navigator.share)){directSave();return;}if(msg)msg.textContent="準備しています…";fetch(u).then(function(r){return r.blob();}).then(function(b){var f=new File([b],(u.split("/").pop()||"image.jpg"),{type:b.type||"image/jpeg"});if(!navigator.canShare({files:[f]}))throw new Error("no");if(msg)msg.textContent="出てきたメニューで「画像を保存」を押すと写真に入ります（LINEを押せばそのまま送れます）。";return navigator.share({files:[f]});}).catch(function(e){if(e&&e.name==="AbortError"){if(msg)msg.textContent="";return;}directSave();});}' +
      'function toPng(blob){return new Promise(function(res,rej){var im=new Image();var ou=URL.createObjectURL(blob);im.onload=function(){var c=document.createElement("canvas");c.width=im.naturalWidth;c.height=im.naturalHeight;c.getContext("2d").drawImage(im,0,0);URL.revokeObjectURL(ou);c.toBlob(function(pb){pb?res(pb):rej(new Error("x"));},"image/png");};im.onerror=function(){URL.revokeObjectURL(ou);rej(new Error("x"));};im.src=ou;});}' +
      'function pcCopy(){if(!(navigator.clipboard&&navigator.clipboard.write&&window.ClipboardItem)){directSave();return;}if(msg)msg.textContent="コピーしています…";fetch(u).then(function(r){return r.blob();}).then(function(b){return toPng(b);}).then(function(png){return navigator.clipboard.write([new ClipboardItem({"image/png":png})]);}).then(function(){if(msg)msg.textContent="コピーしました。LINEの入力らんで貼り付け（Ctrl+V）してね😊";}).catch(function(){if(msg)msg.textContent="コピーできなかったので、保存にします…";directSave();});}' +
      'var cp=document.getElementById("lkCopy"),sv=document.getElementById("lkSave");' +
      'if(cp)cp.addEventListener("click",pcCopy);' +
      'if(sv)sv.addEventListener("click",function(){if(isIOS)iosSave();else directSave();});' +
    '}' +
  '})();</scr' + 'ipt>';
}
function lkTopicBlock_(topic) {
  var links = topic.links || [];
  var btns = links.map(lkLinkBtn_).join('');
  var nText = links.filter(function (l) { return lkHasText_(l.url); }).length;
  var hint = nText === 0 ? '言語を選ぶとURLがコピーされます'
    : nText === links.length ? '言語を選ぶと文章とURLがまとめてコピーされます'
    : '言語を選ぶとURL（または文章とURL）がコピーされます';
  return '<div class="lktopic" hidden>' +
    '<div class="lktitle">' + esc_(topic.name || '') + '</div>' +
    '<div class="lkhead2"><span class="lkhint">' + hint + '</span></div>' +
    '<div class="lklangbtns">' + btns + '</div>' +
  '</div>';
}
function lkHasText_(v) {
  return String(v == null ? '' : v).replace(/https?:\/\/[^\s"'<>]+/g, '').replace(/\s+/g, '') !== '';
}
function lkLinkBtn_(lk) {
  var raw = String(lk.url == null ? '' : lk.url);
  var data = esc_(raw).replace(/\r\n|\r|\n/g, '&#10;');
  var urls = raw.match(/https?:\/\/[^\s"'<>]+/g) || [];
  var hasText = lkHasText_(raw);
  var marks = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'];
  var prevs = hasText
    ? '<button type="button" class="lkprev lkprevfull" data-full="' + data + '">プレビュー</button>'
    : urls.map(function (u, i) {
    var label = urls.length > 1 ? 'プレビュー' + (marks[i] || (i + 1)) : 'プレビュー';
    return '<a class="lkprev" href="' + esc_(u) + '" target="_blank" rel="noopener">' + label + '</a>';
  }).join('');
  var lm = /^([^（(]+)([（(].*)$/.exec(String(lk.lang || ''));
  var langHtml = lm
    ? '<span class="lklang">' + esc_(lm[1].replace(/\s+$/, '')) + '</span><span class="lklangsub">' + esc_(lm[2]) + '</span>'
    : '<span class="lklang">' + esc_(lk.lang || '') + '</span>';
  return '<div class="lkcell">' +
    '<button type="button" class="lkbtn" data-url="' + data + '">' +
      langHtml +
      '<span class="lkcopy"></span>' +
    '</button>' +
    prevs +
  '</div>';
}
var LKSCRIPT_ =
'<script>(function(){' +
'function fallbackCopy_(text){' +
'  var ta=document.createElement("textarea"); ta.value=text;' +
'  ta.style.position="fixed"; ta.style.opacity="0";' +
'  document.body.appendChild(ta); ta.focus(); ta.select();' +
'  var ok=false; try{ ok=document.execCommand("copy"); }catch(e){}' +
'  document.body.removeChild(ta); return ok;' +
'}' +
'function copyText_(text, done){' +
'  if(navigator.clipboard && navigator.clipboard.writeText){' +
'    navigator.clipboard.writeText(text).then(function(){ done(true); }, function(){ done(fallbackCopy_(text)); });' +
'  } else { done(fallbackCopy_(text)); }' +
'}' +
'[].slice.call(document.querySelectorAll(".lkbtn")).forEach(function(btn){' +
'  btn.addEventListener("click", function(){' +
'    var url=btn.getAttribute("data-url")||"";' +
'    var label=btn.querySelector(".lkcopy");' +
'    copyText_(url, function(ok){' +
'      var prev=label.innerHTML;' +
'      label.textContent = ok ? "✅ コピーしました" : "コピー失敗";' +
'      btn.classList.toggle("lkok", ok);' +
'      setTimeout(function(){ label.innerHTML=prev; btn.classList.remove("lkok"); }, 1500);' +
'    });' +
'  });' +
'}); ' +
'function escH_(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }' +
'[].slice.call(document.querySelectorAll(".lkprevfull")).forEach(function(b){' +
'  b.addEventListener("click", function(){' +
'    var t=b.getAttribute("data-full")||"";' +
'    var h=escH_(t).replace(/https?:\\/\\/[^\\s"<>]+/g, function(u){ return "<a href=\\""+u+"\\" target=\\"_blank\\" rel=\\"noopener\\" style=\\"color:#7dd3fc;word-break:break-all;\\">"+u+"</a>"; });' +
'    szPopup_("<div style=\\"text-align:left;font-size:1.05rem;font-weight:600;line-height:1.75;\\">"+h+"</div>", {isHtml:true, icon:"", yesLabel:"閉じる"});' +
'  });' +
'}); ' +
'})();</scr' + 'ipt>';
var LKCSS_ =
'  :root{ --akibg:#16141e; --akicard:#211f2c; --akiink:#f1eef8; --akisub:#9a95a9; --akiline:#34313f;' +
'    --akiprimary:#a79fff; }' +
'  @media (prefers-color-scheme:light){ :root{ --akibg:#eef1f6; --akicard:#ffffff; --akiink:#1f2937;' +
'    --akisub:#6b7280; --akiline:#d7dee8; --akiprimary:#2563eb; } }' +
'  .lkwrap{ max-width:760px; margin:0 auto; padding:14px 14px 40px;' +
'    font-family:"Yu Gothic UI","Hiragino Sans",sans-serif; color:var(--akiink); }' +
'  .lkbar{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }' +
'  .lkhome{ flex:0 0 auto; font-size:.9rem; font-weight:800; color:var(--akiink); text-decoration:none;' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:10px; padding:10px 14px; }' +
'  .lkhome:active{ transform:translateY(1px); }' +
'  .lkgen{ flex:0 0 auto; color:var(--akisub); font-size:15px; font-weight:800; text-align:right; }' +
'  .lkhead{ display:flex; align-items:baseline; flex-wrap:wrap; gap:12px; margin-bottom:14px; }' +
'  .lkwrap h1{ font-size:24px; margin:2px 0; font-weight:800; }' +
'  .lkhint{ color:#ffb3d9; font-size:16px; font-weight:800; }' +
'  .lktopic{ margin-bottom:28px; }' +
'  .lkcell{ display:flex; flex-direction:column; gap:8px; flex:1 1 140px; min-width:140px; }' +
'  .lkprev{ display:block; text-align:center; font-size:15px; font-weight:800; color:#1d4ed8;' +
'    text-decoration:none; background:#ffffff; border:1px solid #d7dee8; border-radius:12px;' +
'    padding:6px 10px; }' +
'  button.lkprev{ appearance:none; -webkit-appearance:none; font-family:inherit; width:100%; cursor:pointer; }' +
'  .lkprev:active{ transform:translateY(1px); }' +
'  .lktitle{ font-size:28px; font-weight:800; margin-bottom:4px; line-height:1.3; color:#fff; }' +
'  .lklangbtns{ display:flex; flex-direction:row; flex-wrap:wrap; gap:14px; margin-top:10px; }' +
'  .lkbtn{ appearance:none; -webkit-appearance:none; font-family:inherit; display:flex;' +
'    flex-direction:column; align-items:center; font-weight:800;' +
'    justify-content:center; gap:2px; width:100%; color:#1d4ed8; background:#ffffff;' +
'    border:1px solid #d7dee8; border-radius:18px; padding:8px 10px; cursor:pointer;' +
'    box-shadow:0 4px 14px rgba(0,0,0,.18); }' +
'  .lkbtn:active{ transform:translateY(2px); }' +
'  .lklang{ font-size:30px; font-weight:800; }' +
'  .lklangsub{ display:block; align-self:stretch; text-align:center; white-space:nowrap; overflow:hidden;' +
'    font-size:22px; font-weight:800; line-height:1.3; }' +
'  .lkcopy{ font-size:15px; font-weight:800; color:#6b7280; text-align:center; line-height:1.3; white-space:nowrap; }' +
'  .lkcopy:empty{ display:none; }' +
'  .lkbtn.lkok{ background:#eafff1; border-color:#16a34a; }' +
'  .lkbtn.lkok .lklang, .lkbtn.lkok .lkcopy{ color:#16a34a; }' +
'  .lknone{ color:#c33; font-size:16px; font-weight:800; padding:8px 0; }';
var LKIMGCSS_ =
'  .lkwrap [hidden]{ display:none !important; }' +
'  .lkhub{ display:grid; grid-template-columns:1fr 1fr; gap:14px; margin:6px 0 20px; }' +
'  .lkhubbtn{ appearance:none; -webkit-appearance:none; font-family:inherit; cursor:pointer;' +
'    min-width:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; text-align:center;' +
'    padding:26px 14px; font-size:24px; font-weight:800; color:#fff; background:#2C7A99;' +
'    border:1px solid #256781; border-radius:18px; box-shadow:0 4px 14px rgba(0,0,0,.18); }' +
'  .lkhubbtn:active{ transform:translateY(2px); }' +
'  .lkhubico{ font-size:40px; }' +
'  .lkback2{ appearance:none; -webkit-appearance:none; font-family:inherit; cursor:pointer;' +
'    font-size:.95rem; font-weight:800; color:var(--akiink); background:var(--akicard);' +
'    border:1px solid var(--akiline); border-radius:10px; padding:10px 16px; margin:0 0 16px; }' +
'  .lkback2:active{ transform:translateY(1px); }' +
'  .lkhead2{ margin:0 0 14px; }' +
'  .lkimgcats{ display:flex; flex-direction:column; gap:14px; }' +
'  .lkcatbtn{ appearance:none; -webkit-appearance:none; font-family:inherit; cursor:pointer;' +
'    display:block; width:100%; text-align:center; font-size:26px; font-weight:800; color:#1d4ed8;' +
'    background:#ffffff; border:1px solid #d7dee8; border-radius:18px; padding:20px 14px;' +
'    box-shadow:0 4px 14px rgba(0,0,0,.18); }' +
'  .lkcatbtn:active{ transform:translateY(2px); }' +
'  .lkimgtitle{ font-size:26px; font-weight:800; color:#fff; margin:2px 0 16px; line-height:1.3; }' +
'  .lkimgbtn{ appearance:none; -webkit-appearance:none; font-family:inherit; cursor:pointer;' +
'    display:block; width:100%; box-sizing:border-box; font-size:22px; font-weight:800; color:#fff;' +
'    background:#16a34a; border:1px solid #15803d; border-radius:16px; padding:16px 12px; margin:0 0 10px;' +
'    box-shadow:0 4px 14px rgba(0,0,0,.18); }' +
'  .lkimgbtn:active{ transform:translateY(2px); }' +
'  .lkimgbtn.lksub{ background:#ffffff; color:#16a34a; border:2px solid #16a34a; font-size:17px; box-shadow:none; }' +
'  .lkimgmsg{ color:#16a34a; font-weight:800; font-size:16px; margin:2px 0 10px; min-height:20px; }' +
'  @media (prefers-color-scheme:dark){ .lkimgmsg{ color:#7CFFB2; } }' +
'  .lkimgwrap img{ width:100%; display:block; border-radius:14px; box-shadow:0 4px 14px rgba(0,0,0,.25); background:#fff; }';
