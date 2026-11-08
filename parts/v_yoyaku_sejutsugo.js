// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：yoyaku_sejutsugo
function renderAfterTreatmentPage_(base, staff, dev, who, mode) {
  var REP = (mode === 'repeat');
  var LN = (mode === 'line');
  var EXEC ='https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var head = REP ? '<div class="hhead"><span class="bmark">🔁</span><span class="bname">リピート入力</span></div>'
           : LN ? '<div class="hhead"><span class="bmark">💌</span><span class="bname">施術後のLINE送信</span></div>'
                 : '<div class="hhead"><span class="bmark">💆</span><span class="bname">施術後の予約</span></div>';
  var css = sgCss_();
  var body =
    '<div class="sg" id="sgPick">' +
      '<div class="sgstep" id="sgpickhead" style="display:none">施術者を選択してね😊</div>' +
      '<div class="sgstaff" id="sgstaff"></div>' +
      '<div class="sgstatus" id="sgstatus">今日の予約を読んでいます...</div>' +
    '</div>' +
    '<div class="sg" id="sgList" style="display:none">' +
      '<div class="sgwho" id="sglisthead"></div>' +
      '<div class="sglist" id="sglist"></div>' +
      '<div class="sgstatus" id="sgstatus2"></div>' +
    '</div>' +
    (REP ?
    '<div class="sg" id="sgRChoose" style="display:none">' +
      '<div class="sgwho" id="sgrwho">お客様の選択</div>' +
      '<button type="button" class="sgrbig" id="sgrtoday"><span class="sgrbi">📅</span>今日の予約のお客様</button>' +
      '<button type="button" class="sgrbig" id="sgrnum"><span class="sgrbi">🔢</span>お客様番号から検索</button>' +
    '</div>' +
    '<div class="sg" id="sgRNum" style="display:none">' +
      '<div class="sgwho">お客様番号から検索</div>' +
      '<div class="exbox" id="sgrdisp"></div>' +
      '<div class="ktmode" id="sgrseg"><button type="button" data-v="M" class="on">M（男）</button>' +
        '<button type="button" data-v="F">F（女）</button></div>' +
      '<div class="expad" id="sgrpad">' + EXPADHTML_ + '</div>' +
      '<button type="button" class="exgo" id="sgrgo">🔁 リピート入力へ →</button>' +
    '</div>' : '') +
    sgStepsHtml_() +
    '<div class="sg" id="sgElight" style="display:none">' +
      '<div class="sgwho">本日イーライトをやりましたか？</div>' +
      '<div class="sgmnote" id="sgelparts"></div>' +
      '<button type="button" class="sgrbig sgel" data-k="vio"><span class="sgrbi">⚡</span>YES（VIOのみイーライトをやった）</button>' +
      '<button type="button" class="sgrbig sgel" data-k="both"><span class="sgrbi">⚡</span>YES（VIO＋髭等【VIO以外の部位】のイーライトをやった）</button>' +
      '<button type="button" class="sgrbig sgel" data-k="other"><span class="sgrbi">⚡</span>YES（髭等【VIO以外の部位】のイーライトをやった）</button>' +
      '<button type="button" class="sgrbig sgel" data-k="no"><span class="sgrbi">🙅</span>NO（イーライトをやっていない）</button>' +
    '</div>' +
    '<div class="sg" id="sgFirst" style="display:none">' +
      '<div class="sgwho" id="sgfdq">本日が当店はじめての脱毛の施術でしたか？</div>' +
      '<div class="sgmnote" id="sgfdhint" style="display:none"></div>' +
      '<button type="button" class="sgrbig sgfd" data-k="yes"><span class="sgrbi">🌱</span>YES（初めての脱毛の施術でした）</button>' +
      '<button type="button" class="sgrbig sgfd" data-k="no"><span class="sgrbi">🔁</span>NO（過去に当店で脱毛履歴がありました）</button>' +
      '<button type="button" class="sgrbig sgfd" data-k="counsel"><span class="sgrbi">💬</span>NO（今日はカウンセリングだけで施術しなかった）</button>' +
    '</div>' +
    '<div class="sg" id="sgLash" style="display:none">' +
      '<div class="sgwho">本日パリジェンヌをやりましたか？</div>' +
      '<button type="button" class="sgrbig sglh" data-k="yes"><span class="sgrbi">👁️</span>YES（パリジェンヌをやった）</button>' +
      '<button type="button" class="sgrbig sglh" data-k="no"><span class="sgrbi">🙅</span>NO（パリジェンヌをやっていない）</button>' +
    '</div>' +
    '<div class="sg" id="sgPF" style="display:none">' +
      '<div class="sgwho">本日、顔のプロセルをやりましたか？</div>' +
      '<button type="button" class="sgrbig sgpf" data-k="yes"><span class="sgrbi">✨</span>YES（顔のプロセルをやった）</button>' +
      '<button type="button" class="sgrbig sgpf" data-k="no"><span class="sgrbi">🙅</span>NO（顔のプロセルをやっていない）</button>' +
    '</div>' +
    '<div class="sg" id="sgPH" style="display:none">' +
      '<div class="sgwho">本日、頭皮のプロセルをやりましたか？</div>' +
      '<button type="button" class="sgrbig sgph" data-k="yes"><span class="sgrbi">💆</span>YES（頭皮のプロセルをやった）</button>' +
      '<button type="button" class="sgrbig sgph" data-k="no"><span class="sgrbi">🙅</span>NO（頭皮のプロセルをやっていない）</button>' +
    '</div>' +
    '<div class="sg" id="sgCheck" style="display:none">' +
      '<div class="sgwho">ここからは、お客様が退店された後に行ってください。</div>' +
      '<div class="sgmnote">まず、このお客様を担当した施術者に以下の確認をしてください</div>' +
      '<div class="sgcklist" id="sgcklist"></div>' +
      '<button type="button" class="sggo" id="sgckgo">全て確認しました</button>' +
    '</div>' +
    '<div class="sg" id="sgAfter" style="display:none">' +
      '<div class="sgwho">このお客様は以下に当てはまりますか？😊 （複数選択可）</div>' +
      '<div class="sgmnote" id="sgtahint" style="display:none"></div>' +
      '<button type="button" class="sgrbig" id="sgtanone"><span class="sgrbi">🙅</span>どれも当てはまらない</button>' +
      '<button type="button" class="sgrbig sgta" data-k="procell_face"><span class="sgrbi">✨</span>顔プロセルを行った</button>' +
      '<button type="button" class="sgrbig sgta" data-k="procell_scalp"><span class="sgrbi">💆</span>頭皮プロセルを行った</button>' +
      '<button type="button" class="sggo" id="sgtago" disabled>上記の内容で確定</button>' +
    '</div>' +
    '<div class="sg" id="sgMemo" style="display:none">' +
      '<div class="sgwho">予約メモの修正</div>' +
      '<div class="sgmnote">下に本日の予約メモを表示しています。次回の予約用にメモを修正してね😊' +
        '次回の予約日の予約メモとしてタイムツリーに保存されます。</div>' +
      '<div class="sgtimebox">' +
        '<div class="sgtlab">予約メモのタイトル</div>' +
        '<input type="text" class="sgmin" id="sgmtitle">' +
      '</div>' +
      '<div class="sgtimebox">' +
        '<div class="sgtlab">予約メモ</div>' +
        '<textarea class="sgmtx" id="sgmtext" rows="8"></textarea>' +
        '<div class="sgmdone" id="sgmdone" style="display:none"></div>' +
      '</div>' +
      '<div class="sgmwait" id="sgmwait" style="display:none"></div>' +
      '<button type="button" class="sggo" id="sgmgo">この予約メモの内容で確定</button>' +
    '</div>' +
    '<div class="sg" id="sgKaeshi" style="display:none">' +
      '<div class="sgwho">お知らせのおすすめ</div>' +
      '<div class="sgmnote" id="sgrinfo" style="display:none"></div>' +
      '<div id="sgkcards"></div>' +
      '<div class="sgtimebox">' +
        '<div class="sgtlab">次回の予約メモ（ボタンを押すと🔁の行が入ります）</div>' +
        '<pre class="sgkpre" id="sgkpre"></pre>' +
      '</div>' +
      '<div class="ktwarn" id="sgkwarn"></div>' +
      '<button type="button" class="sggo" id="sgkgo">' + (REP ? 'この内容で🔁を書き込む' : 'この内容で予約を登録') + '</button>' +
    '</div>';
  var backTop = backBar_(base, staff, dev);           
  if (!who && !staff && !dev) who = 'kanbu';
  var backList = '<div class="backbar" id="sgbackbar" style="display:none">' +
    '<a class="backbtn" id="sgback" href="javascript:void(0)">← 戻る</a></div>';
  var script =
    '<script>(function(){' +
    'var EXEC=' + JSON.stringify(EXEC) + ',WHO=' + JSON.stringify(who || '') + ';' +
    'var KEY=' + JSON.stringify(KEY) + ';' +
    'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",' +
      'device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
    'function jsonp(params,onR){var cb="__sg"+Date.now()+Math.floor(Math.random()*1000);' +
      'window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
      'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
      'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();' +
      'sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
    'var pick=null,dflt=null,BK=[],ALLEV=[],LIST=[],step=1,CUST=null,MY=null;' +
    'var REP=' + (REP ? 'true' : 'false') + ',RB=null,RFROM=2,RPRE="M",RDIG="";' +
    'var LN=' + (LN ? 'true' : 'false') + ';' +
    'var RNUM=(location.search.match(/[?&]num=([MF][0-9]{1,4})(&|$)/)||[])[1]||"";' +
    'var RMK="";try{RMK=decodeURIComponent((location.search.match(/[?&]mk=([^&]*)/)||[])[1]||"");}catch(e){}' +
    'var TODAY="";' +
    'var AKI=null,AKIERR=false,AKIWAIT=null,PICKDATE=null,SLOT=null,TS=0,TE=0,ROOM=null,DAYROOMS=[];' +
    'var NEXTMEMO=null,NEXTCHG=null,NEXTFOR=null,MEMOTOUCHED=false,PAYLINE="";' +
    'var FINALS=null,KT=[],kchk=0;' +
    'var ASK=false;' +
    'var ACQ=[],ACNAME={lash:"パリジェンヌ",procell_face:"顔プロセル",procell_scalp:"頭皮プロセル"};' +
    'var TA={},ELJ={ask:false,parts:[]},FIRSTDAT=null,TAORDER=["lash","procell_face","procell_scalp"];' +
    'var DT=false,FDANS=null,FDASK=null,FDMAP={},NXC={};' +
    'var SEQ=[],LASHANS=null,PFANS=null,PHANS=null;' +
    'var ELANS=null;' +
    'var PAID=null;' +
    'var AHEAD={},PAIDAUTO="",PAYREMOVED=[];' +
    'var SWAP=0;' +
    'function tapOK(){return (Date.now()-SWAP)>450;}' +
    'function $(i){return document.getElementById(i);}' +
    'function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){' +
      'return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[c];});}' +
    'var DEVMODE=' + (dev ? 'true' : 'false') + ',TESTMS=0,TESTWHO="";' +
    'if(DEVMODE){try{var qs=new URLSearchParams(location.search);' +
      'var tt=qs.get("time")||"";' +
      'if(/^\\d{1,2}:\\d{2}$/.test(tt)){var pp=tt.split(":");var dd=new Date();' +
        'dd.setHours(parseInt(pp[0],10),parseInt(pp[1],10),0,0);TESTMS=dd.getTime();}' +
      'TESTWHO=qs.get("as")||"";if(TESTWHO)WHO=TESTWHO;}catch(e){}}' +
    'function NOW(){return TESTMS||Date.now();}' +
    'function showTestNote(){' +
      'if(!TESTMS&&!TESTWHO)return;' +
      'var d=new Date(NOW());' +
      'var hm=("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2);' +
      'var nm=(typeof SG!=="undefined"&&SG.markOfWho(TESTWHO))?' +
        '(SG.markOfWho(TESTWHO)+SG.nameOfMark(SG.markOfWho(TESTWHO))):TESTWHO;' +
      'var t="お試し中：";' +
      'if(TESTMS)t+="いまは "+(d.getMonth()+1)+"月"+d.getDate()+"日 "+hm+" として動かしています";' +
      'if(TESTMS&&TESTWHO)t+="／";' +
      'if(TESTWHO)t+=nm+"のスマホとして動かしています";' +
      'var el=$("sgtest");el.textContent=t;el.style.display="block";}' +
    'function need(cb){' +
      'if(typeof window.__szShowPrefetchable_==="function"){window.__szShowPrefetchable_("yoyaku_sejutsugo",cb);return;}' +
      'var e=window.__PF_&&window.__PF_["yoyaku_sejutsugo"];' +
      'if(e){' +
        'if(e.cached){cb(e.cached);}' +
        'if(e.payload!==undefined){cb(e.payload);return;}' +
        'e.waiter=function(p){cb(p);};return;}' +
      'var nm="__sgGot_"+Date.now();window[nm]=function(p){cb(p);};' +
      'var s=document.createElement("script");' +
      's.src=EXEC+"?action=data&name=events.json&callback="+nm+"&cb="+Date.now();' +
      's.onerror=function(){cb({error:"net"});};document.body.appendChild(s);}' +
    'function build(p){' +
      'if(!p||p.error||!p.events){$("sgstatus").textContent="今日の予約を読み込めませんでした。通信環境をご確認くださいませ🙇";return;}' +
      'var today=p.date_from||"";TODAY=today;ALLEV=[];BK=[];FDMAP=p.first_dat||{};NXC={};' +
      'var day=[];' +
      'for(var i=0;i<p.events.length;i++){var e=p.events[i];' +
        'if(e.date>today&&typeof codeOf==="function"){var c0=codeOf(e.title||"");if(c0)NXC[c0]=1;}' +
        'if(e.date!==today)continue;' +
        'var mk=(typeof staffOf==="function")?staffOf(e.title||""):"";' +
        'var rm=(typeof roomLabelOf==="function")?' +
          'roomLabelOf(e.calendar_id,e.label_id,e.title||"",ALL_ROOM_LABELS):null;' +
        'var rn=(rm!=null&&typeof ALL_ROOM_LABELS!=="undefined")?ALL_ROOM_LABELS[rm]:(e.calendar_name||"");' +
        'day.push({mark:mk,start:e.start_at_ms,end:e.end_at_ms,title:e.title||"",note:e.note||"",' +
          'room:rn,st:e.start_time||"",et:e.end_time||"",id:e.event_id||""});}' +
      'var vis=SG.visibleBookings(day);' +
      'for(var v=0;v<vis.length;v++){var x=vis[v];' +
        'if(!SG.nameOfMark(x.mark))continue;' +
        'ALLEV.push(x);BK.push({mark:x.mark,start:x.start,end:x.end});}' +
      'drawPick();}' +
    'function show(){' +
      'SWAP=Date.now();' +
      '$("sgPick").style.display=step===1?"":"none";' +
      '$("sgList").style.display=step===2?"":"none";' +
      '$("sgMonth").style.display=step===3?"":"none";' +
      '$("sgDay").style.display=step===4?"":"none";' +
      '$("sgFree").style.display=step===5?"":"none";' +
      '$("sgTime").style.display=step===6?"":"none";' +
      '$("sgMemo").style.display=step===7?"":"none";' +
      '$("sgKaeshi").style.display=step===8?"":"none";' +
      '$("sgElight").style.display=step===9?"":"none";' +
      '$("sgAfter").style.display=step===10?"":"none";' +
      '$("sgFirst").style.display=step===11?"":"none";' +
      '$("sgLash").style.display=step===12?"":"none";' +
      '$("sgPF").style.display=step===13?"":"none";' +
      '$("sgPH").style.display=step===14?"":"none";' +
      '$("sgCheck").style.display=step===15?"":"none";' +
      'if(REP){$("sgRChoose").style.display=step===21?"":"none";$("sgRNum").style.display=step===22?"":"none";}' +
      '$("sgbackbar").style.display=step===1?"none":"";' +
      'var tb=$("sgtopbar");if(tb)tb.style.display=step===1?"":"none";' +
      'var hd=$("sghead");if(hd)hd.style.display=step===1?"":"none";}' +
    'function goPick(){step=1;show();drawPick();window.scrollTo(0,0);}' +
    'function goList(){step=2;show();window.scrollTo(0,0);drawList();scrollToNow();}' +
    'function back(){if(REP&&repBack())return;' +
      'if(rcp()&&step===8){var sv8=seqv();if(sv8.length){goStep(sv8[sv8.length-1]);}else{goCheck();}return;}' +
      'if(rcp()&&step===15){step=7;show();growMemo();window.scrollTo(0,0);return;}' +
      'if(rcp()&&step===3){goList();return;}' +
      'if(rcp()&&step>=9&&step<=14){if(!prevOf(step))goCheck();return;}' +
      'if(step===8){step=7;show();growMemo();window.scrollTo(0,0);}' +
      'else if(step===7){step=6;show();drawTime();window.scrollTo(0,0);}' +
      'else if(step===6){goFree();}else if(step===5){goDay();}' +
      'else if(step===4){goMonth();}else if(step===3&&!REP&&!LN&&seqv().length){goStep(seqv()[seqv().length-1]);}' +
      'else if(step===3&&!REP&&!LN){goList();}' +
      'else if(SEQ.indexOf(step)>0&&prevOf(step)){}' +
      'else if(step===3||(step>=9&&step<=14)){goList();}else{goPick();}}' +
    'function drawPick(){' +
      'var r=SG.staffOrder(BK,WHO,NOW());' +
      'if(pick===null)pick=r.selected;' +
      'if(dflt===null)dflt=r.selected;' +
      'var h="";' +
      'for(var i=0;i<r.list.length;i++){var x=r.list[i];' +
        'h+="<button type=\\"button\\" class=\\"sgbtn"+(pick===x.mark?" sel":"")+(dflt===x.mark?" dflt":"")+"\\" data-mk=\\""+esc(x.mark)+"\\">"+' +
          '"<span class=\\"sgmk\\">"+esc(x.mark)+"</span>"+' +
          '"<span class=\\"sgnm\\">"+esc(x.name)+"</span>"+' +
          '"<span class=\\"sgsub\\">"+x.count+"件</span></button>";}' +
      'h+="<button type=\\"button\\" class=\\"sgbtn all"+(pick===SG.ALL?" sel":"")+(dflt===SG.ALL?" dflt":"")+"\\" data-mk=\\""+SG.ALL+"\\">"+' +
        '"<span class=\\"sgmk\\">👥</span><span class=\\"sgnm\\">全施術者</span></button>";' +
      '$("sgstaff").innerHTML=h;' +
      '$("sgpickhead").style.display="";' +
      '$("sgstatus").textContent=r.list.length?"":"今日は予約がありません。";' +
      'var bs=$("sgstaff").getElementsByClassName("sgbtn");' +
      'for(var b=0;b<bs.length;b++){bs[b].onclick=function(){' +
        'if(!tapOK())return;' +
        'pick=this.getAttribute("data-mk");if(REP){goRChoose();}else{goList();}};}}' +
    'function drawList(){' +
      'var now=NOW();' +
      'var list=ALLEV.filter(function(e){return pick===SG.ALL||e.mark===pick;});' +
      'list.sort(function(a,b){return a.start-b.start;});' +
      'if(!REP&&!LN){var sm=pick===SG.ALL?"🍅":pick;list.push({mark:sm,start:0,end:0,room:"",st:"ダミー",et:"",id:"DUMMY:sg1",dname:"RYU（試し）",dummy:true,fdask:true,firstdat:true,title:sm+"🇫🇷預約M999",note:"RYU様\\n0900000000\\n\\n⭐️現在進行中\\n◉イーライト VIO＋脇 5回コース：全5回の4回目 あり\\n◉🇫🇷パリジェンヌリペア あり\\n\\n💰お支払い状況\\n◉イーライト VIO＋脇 5回コース：支払い済み"});}/*TEMPDUMMY*/' +
      'LIST=list;' +
      '$("sglisthead").textContent="お客様の選択";' +
      'if(!list.length){$("sglist").innerHTML="";' +
        '$("sgstatus2").textContent="この施術者の今日の予約はありません。";return;}' +
      '$("sgstatus2").textContent="";' +
      'var h="";' +
      'for(var i=0;i<list.length;i++){var e=list[i];' +
        'var cd=(typeof codeOf==="function")?codeOf(e.title):"";' +
        'var nm=e.dname||((typeof customerLine==="function")?(customerLine(e.note).name||""):"");' +
        'var col=(typeof roomColor_==="function")?roomColor_(e.room):"#64748b";' +
        'var rnm=(typeof shortRoomName_==="function")?shortRoomName_(e.room):e.room;' +
        'var live=(e.start<=now&&now<e.end)?"<span class=\\"sgnow\\">いま施術中</span>":"";' +
        'h+="<button type=\\"button\\" class=\\"sgrow\\" data-id=\\""+i+"\\">"+' +
          '"<span class=\\"sgl1\\"><span class=\\"sgtm\\">"+esc(e.st)+"〜"+esc(e.et)+"</span>"+' +
            '"<span class=\\"sgroom\\" style=\\"background:"+col+"\\">"+esc(rnm)+"</span>"+live+"</span>"+' +
          '"<span class=\\"sgl2\\"><span class=\\"sgmk2\\">"+esc(e.mark)+"</span>"+' +
            '"<span class=\\"sgnm2\\">"+esc(nm||"お名前なし")+"</span>"+' +
            '"<span class=\\"sgcd2\\">"+esc(cd)+"</span></span>"+' +
          '"</button>";}' +
      '$("sglist").innerHTML=h;' +
      'fitNames();gapAfterNow();' +
      'var rs=$("sglist").getElementsByClassName("sgrow");' +
      'for(var k=0;k<rs.length;k++){rs[k].onclick=function(){' +
        'if(!tapOK())return;' +
        'CUST=LIST[parseInt(this.getAttribute("data-id"),10)];' +
        'NEXTMEMO=null;NEXTCHG=null;NEXTFOR=null;PAID=null;ASK=false;AHEAD={};PAIDAUTO="";PAYREMOVED=[];' +
        'ACQ=(!REP&&SG.aftercareAsk)?SG.aftercareAsk((CUST&&CUST.title)||"",(CUST&&CUST.note)||""):[];TA={};FIRSTDAT=null;FDANS=null;FDASK=null;' +
        'if(REP){RFROM=2;repOpen("today",(typeof codeOf==="function")?(codeOf(CUST.title)||""):"",CUST.id||"");return;}' +
        'if(!LN)askNextMemo();' +
        'ELJ=(!REP&&SG.elightAsk)?SG.elightAsk((CUST&&CUST.title)||"",(CUST&&CUST.note)||""):{ask:false,parts:[]};' +
        'DT=!REP&&SG.datsumoToday?SG.datsumoToday((CUST&&CUST.title)||"",(CUST&&CUST.note)||""):false;' +
        'if(CUST&&CUST.dummy&&CUST.fdask!==undefined){FDASK=CUST.fdask;FIRSTDAT=CUST.firstdat;}' +
        'else if(FDASK==null&&CUST&&FDMAP[CUST.id]){FIRSTDAT=FDMAP[CUST.id][0];FDASK=FDMAP[CUST.id][1];}' +
        'ELANS=null;LASHANS=null;PFANS=null;PHANS=null;SEQ=[];if(ELJ.ask)SEQ.push(9);if(DT&&!(LN&&lnHasNext()))SEQ.push(11);' +
        'if(ACQ.indexOf("lash")>=0)SEQ.push(12);if(ACQ.indexOf("procell_face")>=0)SEQ.push(13);if(ACQ.indexOf("procell_scalp")>=0)SEQ.push(14);' +
        'if(seqv().length&&!rcp()){goStep(seqv()[0]);}else if(LN){lnFinish();}else{goMonth();}};}}' +
    'function fitNames(){' +
      'var BIG=34,MIN=16;' +
      'var ns=$("sglist").getElementsByClassName("sgnm2");' +
      'for(var i=0;i<ns.length;i++){var el=ns[i];' +
        'el.style.fontSize=BIG+"px";' +
        'var have=el.clientWidth,need=el.scrollWidth;' +
        'if(!have||need<=have)continue;' +
        'var fs=Math.floor(BIG*(have-2)/need);' +
        'if(fs<MIN)fs=MIN;if(fs>BIG)fs=BIG;' +
        'el.style.fontSize=fs+"px";' +
        'for(var t=0;t<4&&fs>MIN&&el.scrollWidth>el.clientWidth;t++){fs--;el.style.fontSize=fs+"px";}}}' +
    'function nowIndex(){' +
      'var now=NOW(),idx=-1;' +
      'for(var i=0;i<LIST.length;i++){if(LIST[i].start<=now&&now<LIST[i].end){idx=i;break;}}' +
      'if(idx<0){var best=-1;' +
        'for(var j=0;j<LIST.length;j++){if(!LIST[j].dname&&LIST[j].end<=now&&(best<0||LIST[j].end>LIST[best].end))best=j;}' +
        'idx=best;}' +
      'return idx;}' +
    'function gapAfterNow(){' +
      'var rows=$("sglist").getElementsByClassName("sgrow");' +
      'for(var i=0;i<rows.length;i++)rows[i].style.marginBottom="";' +
      'var idx=nowIndex();' +
      'if(idx<0||idx>=rows.length-1)return;' +
      'if(LIST[idx]&&LIST[idx].dname)return;' +
      'rows[idx].style.marginBottom=rows[idx].offsetHeight+"px";}' +
    'function scrollToNow(){' +
      'var rows=$("sglist").getElementsByClassName("sgrow");' +
      'if(!rows.length)return;' +
      'var idx=nowIndex();' +
      'if(idx<0||!rows[idx])return;' +
      'var bar=$("sgbackbar");var barH=bar?bar.offsetHeight:0;' +
      'var hd=$("sglisthead");hd.style.top=barH+"px";' +
      'var off=barH+(hd?hd.offsetHeight:0);' +
      'var el=$("sglist");el.style.paddingBottom="0px";' +
      'var y=Math.max(0,rows[idx].getBoundingClientRect().top+window.pageYOffset-off-6);' +
      'var mx=document.documentElement.scrollHeight-window.innerHeight;' +
      'if(y>mx)el.style.paddingBottom=(y-mx)+"px";' +
      'window.scrollTo(0,y);}' +
    'var MEMOCACHE={};' +
    'function askNextMemo(){' +
      'var note=(CUST&&CUST.note)||"";' +
      'var key=note+"\u0001"+(PICKDATE||"")+"\u0001"+String(PAID);' +
      'NEXTMEMO=null;NEXTCHG=null;PAYLINE="";NEXTFOR=key;MEMOTOUCHED=false;FINALS=null;' +
      'if(!note)return;' +
      'if(MEMOCACHE[key]){NEXTMEMO=MEMOCACHE[key].memo;NEXTCHG=MEMOCACHE[key].changed;' +
        'PAYLINE=MEMOCACHE[key].payline||"";ASK=!!MEMOCACHE[key].ask;' +
        'AHEAD=MEMOCACHE[key].ahead||{};PAYREMOVED=MEMOCACHE[key].removed||[];' +
        'FINALS=MEMOCACHE[key].finals||[];FDASK=MEMOCACHE[key].fdask;FIRSTDAT=MEMOCACHE[key].firstdat;return;}' +
      'var mine=key;' +
      'var cd=(typeof codeOf==="function"&&CUST)?(codeOf(CUST.title)||""):"";' +
      'jsonp({action:"submit",key:KEY,op:"sejutsugo_next_memo",who:idn.who,role:idn.role,' +
        'device:idn.device,fields:JSON.stringify({memo:note,date:PICKDATE||"",' +
          'paid:(PAID===1?"1":(PAID===0?"0":"")),fnum:cd,today:TODAY,title:(CUST&&CUST.title)||""})},' +
      'function(r){if(!r||!r.ok||!r.id)return;setTimeout(function(){pollNextMemo(r.id,mine,0);},900);});}' +
    'function pollNextMemo(id,mine,n){' +
      'if(n>200||NEXTFOR!==mine)return;' +
      'jsonp({action:"status",key:KEY,id:id},function(r){' +
        'if(!r||!r.ok||NEXTFOR!==mine)return;' +
        'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){' +
          'setTimeout(function(){pollNextMemo(id,mine,n+1);},600);return;}' +
        'if(r.status!=="done")return;' +
        'var d=null;try{d=JSON.parse(r.result||"{}");}catch(e){return;}' +
        'if(CUST&&CUST.dummy&&CUST.fdask!==undefined)return;' +
        'if(d&&d.ok&&(d.ask_first===true||d.ask_first===false))FDASK=d.ask_first;' +
        'if(d&&d.ok&&(d.first_dat===true||d.first_dat===false)){FIRSTDAT=d.first_dat;if(step===11)goFirst();}' +
        'if(step===11&&FDASK===false&&!FDANS)nextOf(11);' +
        'if(!d||!d.ok||!d.memo)return;' +
        'NEXTMEMO=d.memo;NEXTCHG=d.changed||[];PAYLINE=d.payline||"";ASK=!!d.ask;' +
        'AHEAD=d.ahead||{};PAYREMOVED=d.removed||[];FINALS=d.finals||[];' +
        'MEMOCACHE[mine]={memo:d.memo,changed:NEXTCHG,payline:PAYLINE,ask:ASK,ahead:AHEAD,removed:PAYREMOVED,finals:FINALS,fdask:FDASK,firstdat:FIRSTDAT};' +
        'if(step===6)drawTime();' +
        'if(step===7&&!MEMOTOUCHED){$("sgmtext").value=NEXTMEMO;growMemo();}' +
        'memoReady();});}' +
    'function drawMemoDone(){var el=$("sgmdone");' +
      'var h="";' +
      'if(NEXTCHG){for(var i=0;i<NEXTCHG.length;i++){var c=NEXTCHG[i];' +
        'h+="<div>今日の予約メモ <b>"+esc(c["前"])+"回目</b>を、次回用に、<b>"+' +
          'esc(c["後"])+"回目</b>に変更済みです</div>";}}' +
      'if(PAYLINE){h+="<div>お支払い状況に <b>"+esc(PAYLINE)+"</b> を追加しました</div>";}' +
      'for(var r=0;r<PAYREMOVED.length;r++){h+="<div>お支払い状況から <b>"+esc(PAYREMOVED[r])+"</b> を削除しました</div>";}' +
      'if(!h){el.style.display="none";el.innerHTML="";return;}' +
      'el.innerHTML=h;el.style.display="block";}' +
    'function memoReady(){var w=$("sgmwait");if(w){w.style.display="none";w.textContent="";}' +
      'if(step===7){$("sgmgo").disabled=false;drawMemoDone();}}' +
    'function memoWait(){var w=$("sgmwait");drawMemoDone();' +
      'if(NEXTMEMO||!((CUST&&CUST.note)||"")){memoReady();return;}' +
      'w.style.display="block";w.textContent="次回用の予約メモを作っています…";' +
      '$("sgmgo").disabled=true;' +
      'setTimeout(function(){if(step===7&&!NEXTMEMO){' +
        'w.textContent="次回用の下書きを作成できませんでした。回数とお支払いは手動で修正してください🙇";' +
        '$("sgmgo").disabled=false;}},25000);}' +
    'function goElight(){step=9;show();' +
      '$("sgelparts").textContent="本日の部位："+((ELJ&&ELJ.parts)||[]).join("・");' +
      'var top=SG.elightTop((ELJ&&ELJ.parts)||[]),ord=["vio","both","other","no"],box=$("sgElight");' +
      'if(top)ord=[top].concat(ord.filter(function(k){return k!==top;}));' +
      'for(var j=0;j<ord.length;j++){var b=box.querySelector(".sgel[data-k=\\""+ord[j]+"\\"]");if(b)box.appendChild(b);}' +
      'var bs=$("sgElight").getElementsByClassName("sgel");' +
      'for(var i=0;i<bs.length;i++)bs[i].classList.toggle("sel",bs[i].getAttribute("data-k")===(ELANS||top));' +
      'window.scrollTo(0,0);}' +
    'function goToday(){step=10;show();taDraw();window.scrollTo(0,0);}' +
    'function goStep(n){if(n===9)goElight();else if(n===11)goFirst();else if(n===12)goLash();' +
      'else if(n===13)goYN(13,"sgPF","sgpf",PFANS||"yes");else if(n===14)goYN(14,"sgPH","sgph",PHANS||"yes");else goToday();}' +
    'function goYN(n,id,cls,ans){step=n;show();var bs=$(id).getElementsByClassName(cls);' +
      'for(var i=0;i<bs.length;i++)bs[i].classList.toggle("sel",bs[i].getAttribute("data-k")===ans);window.scrollTo(0,0);}' +
    'function seqShown(n){return n!==11||FDASK!==false;}' +
    'function dummyAnswers(){var EN={vio:"YES（VIOのみ）",both:"YES（VIO＋髭等）",other:"YES（髭等）",no:"NO"},' +
      'FN={yes:"YES（初回の脱毛施術を行った）",no:"NO（過去に当店脱毛歴がある）",counsel:"NO（カウンセリングだけ）"},' +
      'YN={yes:"YES",no:"NO"},o=[];' +
      'o.push("イーライト："+(SEQ.indexOf(9)>=0?(EN[ELANS]||"-"):"（聞いていない）"));' +
      'o.push("はじめての脱毛："+(seqv().indexOf(11)>=0?(FN[FDANS]||"-"):"（聞いていない）"));' +
      'o.push("パリジェンヌ："+(SEQ.indexOf(12)>=0?(YN[LASHANS]||"-"):"（聞いていない）"));' +
      'o.push("顔プロセル："+(SEQ.indexOf(13)>=0?(YN[PFANS]||"-"):"（聞いていない）"));' +
      'o.push("頭皮プロセル："+(SEQ.indexOf(14)>=0?(YN[PHANS]||"-"):"（聞いていない）"));' +
      'var adds=[];if(ELANS&&ELANS!=="no")adds.push("イーライト");if(LASHANS==="yes")adds.push("パリジェンヌ");' +
      'if(PFANS==="yes")adds.push("顔プロセル");if(PHANS==="yes")adds.push("頭皮プロセル");' +
      'o.push("→ 送る文："+(FDANS==="yes"?"脱毛の長いお礼文（次回の日時入り）":"☆次回の短い文")+(adds.length?"＋"+adds.join("・")+"の注意事項":""));' +
      'return o.join("<br>");}' +
    'function noCheck(what,go){szPopup_("予約メモには、"+what+"を施術する、と記入されています。今日本当に、"+what+"はやりませんでしたか？",' +
      '{cancel:true,noLabel:"選び直す",yesLabel:"はい、やりませんでした",onYes:go});}' +
    'function sgAns(){var el=(ELANS==="vio"||ELANS==="both"||ELANS==="other")?ELANS:"";' +
      'return {el:el,el_parts:el==="vio"?"VIO":(el==="both"?"VIO,その他":(el==="other"?"その他":"")),' +
        'first:FDANS==="yes",' +
        'after:[LASHANS==="yes"?"lash":"",PFANS==="yes"?"procell_face":"",' +
          'PHANS==="yes"?"procell_scalp":""].filter(function(x){return x;})};}' +
    'function seqv(){return SEQ.filter(seqShown);}' +
    'function nextOf(n){var i=SEQ.indexOf(n);for(var j=i+1;i>=0&&j<SEQ.length;j++){if(seqShown(SEQ[j])){goStep(SEQ[j]);return;}}if(LN){lnFinish();return;}if(rcp()){rcpFinish();return;}goMonth();}' +
    'function rcp(){return DEVMODE&&!REP&&!LN&&typeof SG.asksAfterMemo==="function"&&SG.asksAfterMemo(WHO);}' +
    'function goCheck(){step=15;show();' +
      'var it=SG.checkItems(seqv(),(ELJ&&ELJ.parts)||[],KT),NB="①②③④⑤⑥⑦⑧⑨",h="";' +
      'for(var i=0;i<it.length;i++)h+="<div class=\\"sgckrow\\"><span class=\\"sgckn\\">"+(NB.charAt(i)||"・")+"</span><span>"+esc(it[i])+"</span></div>";' +
      '$("sgcklist").innerHTML=h;window.scrollTo(0,0);}' +
    'function rcpFinish(){if(KT.length){step=8;show();drawKaeshi();window.scrollTo(0,0);return;}sendMemo();}' +
    'function prevOf(n){var i=SEQ.indexOf(n);for(var j=i-1;j>=0;j--){if(seqShown(SEQ[j])){goStep(SEQ[j]);return true;}}return false;}' +
    'function afterElight(){nextOf(9);}' +
    'function goLash(){step=12;show();' +
      'var bs=$("sgLash").getElementsByClassName("sglh");' +
      'for(var i=0;i<bs.length;i++)bs[i].classList.toggle("sel",bs[i].getAttribute("data-k")===(LASHANS||"yes"));' +
      'window.scrollTo(0,0);}' +
    'function goFirst(){step=11;show();fdHint();' +
      'var fn=((typeof customerLine==="function")?(customerLine((CUST&&CUST.note)||"").name||""):"")||((CUST&&CUST.dname)||"");' +
      'if(fn&&!/様$/.test(fn))fn+="様";$("sgfdq").textContent=(fn?fn+"は":"")+"本日が当店はじめての脱毛の施術でしたか？";' +
      'var bs=$("sgFirst").getElementsByClassName("sgfd");' +
      'for(var i=0;i<bs.length;i++)bs[i].classList.toggle("sel",bs[i].getAttribute("data-k")===(FDANS||(FIRSTDAT===true?"yes":(FIRSTDAT===false?"no":""))));' +
      'window.scrollTo(0,0);}' +
    'function fdHint(){var el=$("sgfdhint");' +
      'var t=FIRSTDAT===true?"記録では：当店で初めての脱毛です":(FIRSTDAT===false?"記録では：過去に当店の脱毛歴があります":"");' +
      'el.textContent=t;el.style.display="none";}' +
    'function taPicked(){return TAORDER.filter(function(k){return TA[k]===true;});}' +
    'function taDraw(){var bs=$("sgAfter").getElementsByClassName("sgta");' +
      'for(var i=0;i<bs.length;i++)bs[i].classList.toggle("sel",TA[bs[i].getAttribute("data-k")]===true);' +
      '$("sgtago").disabled=!taPicked().length;taHint();}' +
    'function taGuess(){var o=[];' +
      'for(var i=0;i<ACQ.length;i++)if(ACQ[i]!=="lash")o.push(ACNAME[ACQ[i]]);return o;}' +
    'function taHint(){var g=taGuess(),el=$("sgtahint");' +
      'el.textContent=g.length?"予約メモでは："+g.join("／"):"";el.style.display=g.length?"":"none";}' +
    'function taDiff(){var d=[];' +
      'var ks=["procell_face","procell_scalp"];' +
      'for(var i=0;i<ks.length;i++){var on=ACQ.indexOf(ks[i])>=0;' +
        'if(TA[ks[i]]===true&&!on)d.push("予約メモに"+ACNAME[ks[i]]+"がありません");' +
        'if(TA[ks[i]]!==true&&on)d.push("予約メモに"+ACNAME[ks[i]]+"があります");}' +
      'return d;}' +
    'function taNext(){var d=taDiff();if(!d.length){goMonth();return;}' +
      'szPopup_("予約メモと違うところがあります。\\n\\n・"+d.join("\\n・")+"\\n\\nこの内容で確定しますか？😊",' +
        '{cancel:true,noLabel:"選び直す",yesLabel:"確定する",onYes:function(){goMonth();}});}' +
    'function goMemo(){step=7;show();' +
      '$("sgmtitle").value=(CUST&&CUST.title)||"";' +
      'MEMOTOUCHED=false;' +
      '$("sgmtext").value=NEXTMEMO||((CUST&&CUST.note)||"");' +
      'growMemo();setTimeout(growMemo,0);setTimeout(growMemo,300);' +
      'memoWait();window.scrollTo(0,0);}' +
    'function growMemo(){var t=$("sgmtext");' +
      'if(!t.clientWidth)return;' +             
      't.style.height="auto";t.style.height=(t.scrollHeight+4)+"px";}' +
    'var sending=false,mpolls=0;' +
    'function memoFail(msg){szOvHide_();sending=false;$("sgmgo").disabled=false;$("sgkgo").disabled=false;' +
      'szPopup_(msg||"エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇");}' +
    'function sendMemo(){' +
      'if(sending)return;' +
      'var ti=($("sgmtitle").value||"").trim();' +
      'if(!ti){szPopup_("予約メモのタイトルを入力してね😊");return;}' +
      'if(!PICKDATE||!ROOM){szPopup_("予約の日時と施術室が決まっていません。前に戻ってやり直してください🙇");return;}' +
      'var f={date:PICKDATE,start:m2hm(TS),end:m2hm(TE),room:ROOM,title:ti,memo:$("sgmtext").value||""};' +
      'if(!REP&&!LN){f.ta=1;f.today_title=(CUST&&CUST.title)||"";' +
        'var a=sgAns();f.elight=a.el?1:0;f.el_parts=a.el_parts;f.first_dat=a.first?1:0;f.after_kinds=a.after.join(",");}' +
      'if(CUST&&CUST.dummy){var dn=new Date(Date.now()+15*60000),dla=dn.getHours()+":"+("0"+dn.getMinutes()).slice(-2);' +
        'szOvShow_(szDoneHtml_("次回の予約を登録しました"+"<div style=\\"font-size:22px;font-weight:700;line-height:1.6;margin-top:12px;color:#ecfdf5;\\">サンキューLINEを"+dla+"に自動送信します</div>"+' +
          '"<div style=\\"font-size:16px;line-height:1.7;margin-top:12px;color:#ecfdf5;text-align:left;\\">【選んだ答え】<br>"+dummyAnswers()+"</div>"+' +
          '"<div style=\\"font-size:16px;line-height:1.6;margin-top:10px;color:#ecfdf5;\\">（ダミーの試し：タイムツリーには書いていません・LINEも送りません）</div>","TOP画面に戻る"),"#16a34a");' +
        'var db=document.getElementById("szDoneBack");' +
        'if(db)db.addEventListener("click",function(){szOvHide_();var ta=document.querySelector("#sgtopbar a");if(ta){ta.click();}else{goPick();}});return;}' +
      'sending=true;mpolls=0;$("sgmgo").disabled=true;$("sgkgo").disabled=true;' +
      'szOvShow_(szBusyHtml_("次回の予約を登録中です"),"#2C7A99");' +
      'var req={exec:EXEC,key:KEY,slot:idn.device,tag:"sejutsugo",op:"sejutsugo_reservation",' +
        'who:idn.who,role:idn.role,device:idn.device,fields:f};' +
      'var send=function(ft){' +
        'jsonp({action:"submit",key:KEY,op:"sejutsugo_reservation",who:idn.who,role:idn.role,' +
          'device:idn.device,fields:ft},' +
        'function(r){if(!r||!r.ok||!r.id){memoFail();return;}' +
          'setTimeout(function(){pollMemo(r.id);},1200);});};' +
      'if(typeof BIG==="undefined"){send(JSON.stringify(f));return;}' +
      'BIG.prepare(req,send,function(){memoFail();});}' +
    'function pollMemo(id){mpolls++;if(mpolls>350){memoFail();return;}' +
      'jsonp({action:"status",key:KEY,id:id},function(r){' +
        'if(!r||!r.ok){memoFail();return;}' +
        'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){' +
          'setTimeout(function(){pollMemo(id);},600);return;}' +
        'if(r.status!=="done"){memoFail(esc(r.result)||"エラーが発生しました。りゅうさんに伝えてください🙇");return;}' +
        'var u=(String(r.result||"").match(/https?:\\/\\/\\S+/)||[""])[0];' +
        'var la=(String(r.result||"").match(/LINE送信:(\\d{1,2}:\\d{2})/)||["",""])[1];' +
        'sending=false;$("sgmgo").disabled=false;$("sgkgo").disabled=false;' +
        'szOvShow_(szDoneHtml_("次回の予約を登録しました"+(la?"<div style=\\"font-size:22px;font-weight:700;line-height:1.6;margin-top:12px;color:#ecfdf5;\\">サンキューLINEを"+la+"に自動送信します</div>":""),"TOP画面に戻る",u),"#16a34a");' +
        'var bb=document.getElementById("szDoneBack");' +
        'if(bb)bb.addEventListener("click",function(){szOvHide_();var ta=document.querySelector("#sgtopbar a");' +
          'if(ta){ta.click();}else{goPick();}});});}' +
    'function goRChoose(){step=21;show();$("sgrwho").textContent=((pick&&pick!==SG.ALL)?SG.labelOfMark(pick)+"　":"")+"お客様の選択";window.scrollTo(0,0);}' +
    'function goRNum(){step=22;show();rUpd();window.scrollTo(0,0);}' +
    'var RLOADED=false;' +
    'var LNNAME={new_nobook:"新規脱毛（次回予約なし）",elight_vio:"イーライト（VIOのみ）",elight_both:"イーライト（VIO＋髭等）",elight_other:"イーライト（髭等）",lash:"パリジェンヌ",procell_face:"プロセル顔",procell_scalp:"プロセル頭皮"},lsending=false;' +
    'function lnHasNext(){var c=(typeof codeOf==="function")?(codeOf((CUST&&CUST.title)||"")||""):"";return !!(c&&NXC[c]);}' +
    'function lnKinds(){var a=sgAns(),o=[];if(a.first)o.push("new_nobook");if(a.el)o.push("elight_"+a.el);return o.concat(a.after);}' +
    'function lnFinish(){var ks=lnKinds();' +
      'var nm=CUST.dname||((typeof customerLine==="function")?(customerLine(CUST.note).name||""):"");' +
      'if(!ks.length){szPopup_((nm||"このお客様")+"に送る施術後のLINEはありません。",{icon:"",onYes:function(){goList();}});return;}' +
      'var names=ks.map(function(k){return "「"+LNNAME[k]+"」";}).join("");' +
      'szPopup_((nm||"このお客様")+"へ"+names+"の施術後フォローLINE文を送りますか？😊",{cancel:true,icon:"",yesLabel:"送る",onYes:function(){lnSend(ks);}});}' +
    'function lnFail(m){lsending=false;szOvHide_();szPopup_(m||"エラーが発生しました。りゅうさんに連絡しました。");}' +
    'function lnSend(k){if(lsending)return;lsending=true;' +
      'szOvShow_(szBusyHtml_("LINEを送る準備をしています","準備が終わったら自動で切り替わりますので、少し待っててくださいね🥺"),"#2C7A99");var n=0;' +
      'jsonp({action:"submit",key:KEY,op:"sgline_send",who:idn.who,role:idn.role,device:idn.device,' +
        'fields:JSON.stringify({event:CUST.id||"",title:CUST.title||"",kinds:k.join(","),who:idn.who||WHO||""})},' +
      'function(r){if(!r||!r.ok||!r.id){lnFail();return;}' +
        'var poll=function(){n++;if(n>LIMITS.tries("sgline_send",600)){lnFail("時間切れです。もう一度試してもらえると嬉しいです🙇");return;}' +
          'jsonp({action:"status",key:KEY,id:r.id},function(x){' +
            'if(!x||!x.ok){lnFail();return;}' +
            'if(x.status==="pending"||x.status==="running"||x.status==="queued"||x.status===""){setTimeout(poll,600);return;}' +
            'if(x.status!=="done"){lnFail();return;}' +
            'var d=null;try{d=JSON.parse(x.result||"{}");}catch(e){}' +
            'if(!d||!d.ok){lnFail((d&&d.reason)||"送れませんでした。");return;}' +
            'lsending=false;' +
            'var at=String(d.send_at||"").slice(11,16);' +
            'szOvShow_(szDoneHtml_("自動送信をセットしました。"+(d.practice?"（練習）":"")+"<br>"+(at?at+"に送信されます。":"15分後に送信されます。"),"TOP画面に戻る"),"#16a34a");' +
            'var bb=document.getElementById("szDoneBack");' +
            'if(bb)bb.addEventListener("click",function(){szOvHide_();var ta=document.querySelector("#sgtopbar a");' +
              'if(ta){ta.click();}else{goPick();}});});};' +
        'setTimeout(poll,900);});}' +
    'function repStart(){var d=new Date(),p2=function(n){return (n<10?"0":"")+n;};' +
      'TODAY=d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate());' +
      'if(pick===null&&RMK){for(var q=0;q<SG.STAFF.length;q++){if(SG.STAFF[q].mark===RMK)pick=RMK;}}' +
      'if(pick===null){var my=SG.markOfWho(WHO);pick=my||null;}' +
      'var h="";for(var i=0;i<SG.STAFF.length;i++){var x=SG.STAFF[i];' +
        'h+="<button type=\\"button\\" class=\\"sgbtn"+(pick===x.mark?" sel":"")+"\\" data-mk=\\""+esc(x.mark)+"\\">"+' +
          '"<span class=\\"sgmk\\">"+esc(x.mark)+"</span><span class=\\"sgnm\\">"+esc(x.name)+"</span></button>";}' +
      'h+="<button type=\\"button\\" class=\\"sgbtn all"+(pick===SG.ALL?" sel":"")+"\\" data-mk=\\""+SG.ALL+"\\">"+' +
        '"<span class=\\"sgmk\\">👥</span><span class=\\"sgnm\\">全施術者</span></button>";' +
      '$("sgstaff").innerHTML=h;$("sgpickhead").style.display="";$("sgstatus").textContent="";' +
      'var bs=$("sgstaff").getElementsByClassName("sgbtn");' +
      'for(var b=0;b<bs.length;b++){bs[b].onclick=function(){if(!tapOK())return;' +
        'pick=this.getAttribute("data-mk");' +
        'if(RNUM){var nn=RNUM;RNUM="";RPRE=nn.charAt(0);RDIG=nn.slice(1);' +
          'var sg2=$("sgrseg").querySelectorAll("button");for(var j=0;j<sg2.length;j++)sg2[j].className=(sg2[j].getAttribute("data-v")===RPRE?"on":"");' +
          'RFROM=22;repOpen("number",nn,"");return;}' +
        'goRChoose();};}}' +
    'function repLoadToday(cb){if(RLOADED){cb();return;}' +
      'szOvShow_(szBusyHtml_("今日の予約を読んでいます"),"#2C7A99");' +
      'need(function(p){szOvHide_();var keep=pick;build(p);pick=keep;' +
        'if(!p||p.error||!p.events){szPopup_("今日の予約を読み込めませんでした。通信環境をご確認くださいませ🙇");return;}' +
        'if(RLOADED){if(step===2)drawList();return;}RLOADED=true;cb();});}' +
    'function repBack(){if(step===8){if(RFROM===22){goRNum();}else{goList();}return true;}' +
      'if(step===2||step===22){goRChoose();return true;}if(step===21){goPick();return true;}return false;}' +
    'function rUpd(){$("sgrdisp").textContent=RDIG?(RPRE+RDIG):"番号を入力してね😊";}' +
    'function repBind(){' +
      '$("sgrtoday").onclick=function(){if(!tapOK())return;repLoadToday(goList);};' +
      '$("sgrnum").onclick=function(){if(!tapOK())return;goRNum();};' +
      'var sb=$("sgrseg").querySelectorAll("button");' +
      'for(var i=0;i<sb.length;i++){sb[i].onclick=function(){' +
        'for(var j=0;j<sb.length;j++)sb[j].className=(sb[j]===this?"on":"");RPRE=this.getAttribute("data-v");rUpd();};}' +
      '$("sgrpad").onclick=function(e){var b=e.target.closest("button");if(!b)return;var k=b.getAttribute("data-k");' +
        'if(k==="clr"){RDIG="";}else if(k==="del"){RDIG=RDIG.slice(0,-1);}' +
        'else if(/^[0-9]$/.test(b.textContent)&&RDIG.length<4){RDIG+=b.textContent;}rUpd();};' +
      '$("sgrgo").onclick=function(){if(!tapOK())return;if(!RDIG){szPopup_("お客様番号を入力してね😊");return;}' +
        'RFROM=22;repOpen("number",RPRE+RDIG,"");};}' +
    'function repOpen(md,fnum,ev){if(!fnum){szPopup_("お客様番号が分かりません。");return;}' +
      'szOvShow_(szBusyHtml_("予約を検索しています"),"#2C7A99");var n=0;' +
      'var fail=function(m){szOvHide_();szPopup_(m||"エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇");};' +
      'jsonp({action:"submit",key:KEY,op:"kaeshi_booking",who:idn.who,role:idn.role,device:idn.device,' +
        'fields:JSON.stringify({fnum:fnum,today:TODAY,mode:md,event:ev||""})},' +
      'function(r){if(!r||!r.ok||!r.id){fail();return;}' +
        'var poll=function(){n++;if(n>350){fail();return;}' +
          'jsonp({action:"status",key:KEY,id:r.id},function(x){' +
            'if(!x||!x.ok){fail();return;}' +
            'if(x.status==="pending"||x.status==="running"||x.status==="queued"||x.status===""){setTimeout(poll,600);return;}' +
            'if(x.status!=="done"){fail();return;}' +
            'var d=null;try{d=JSON.parse(x.result||"{}");}catch(e){}' +
            'szOvHide_();' +
            'if(!d||!d.ok){szPopup_((d&&d.reason)||"🔁を書く予約が見つかりません。");return;}' +
            'RB=d;$("sgmtext").value=d.note||"";KT=[];KPICK={};' +
            'for(var i=0;i<(d.finals||[]).length;i++){if(SG.kaeshiLineOf(d.note||"",d.finals[i])!==null)KT.push(d.finals[i]);}' +
            'if(!KT.length){szPopup_("次の予約で最終回になる施術はありません。");return;}' +
            'var dt=String(d.date||"").split("-"),wk=["日","月","火","水","木","金","土"];' +
            'var w=wk[new Date(+dt[0],(+dt[1])-1,+dt[2]).getDay()]||"";' +
            'var ri=$("sgrinfo");ri.style.display="block";' +
            'ri.innerHTML="🔁を書く予約：<b>"+esc(+dt[1]+"/"+(+dt[2])+"（"+w+"）"+(d.start||""))+"</b>"+' +
              '(d.kind==="before"?"<br>（最終回の1つ前の予約です。最終回の予約は、このメモを写して作られます）":"<br>（最終回の予約です）");' +
            'step=8;show();drawKaeshi();window.scrollTo(0,0);});};' +
        'setTimeout(poll,900);});}' +
    'function repSend(){if(sending||!RB)return;sending=true;$("sgkgo").disabled=true;' +
      'szOvShow_(szBusyHtml_("予約メモに🔁を書き込み中です"),"#2C7A99");repSubmit($("sgmtext").value||"",RB.note||"",0);}' +
    'function repSubmit(note,expect,tries){var n=0;' +
      'jsonp({action:"submit",key:KEY,op:"change_reservation",who:idn.who,role:idn.role,device:idn.device,' +
        'fields:JSON.stringify({cal:RB.cal,event:RB.event_id,note:note,expect_note:expect})},' +
      'function(r){if(!r||!r.ok||!r.id){memoFail();return;}' +
        'var poll=function(){n++;if(n>350){memoFail();return;}' +
          'jsonp({action:"status",key:KEY,id:r.id},function(x){' +
            'if(!x||!x.ok){memoFail();return;}' +
            'if(x.status==="pending"||x.status==="running"||x.status==="queued"||x.status===""){setTimeout(poll,600);return;}' +
            'if(x.status!=="done"){memoFail("エラーが発生しました。りゅうさんに連絡しました。");return;}' +
            'var d=null;try{d=JSON.parse(x.result||"{}");}catch(e){}' +
            'if(d&&d.ok){sending=false;$("sgkgo").disabled=false;RB.note=note;' +
              'szOvShow_(szDoneHtml_("🔁を書き込みました","TOP画面に戻る"),"#16a34a");' +
              'var bb=document.getElementById("szDoneBack");' +
              'if(bb)bb.addEventListener("click",function(){szOvHide_();var ta=document.querySelector("#sgtopbar a");' +
                'if(ta){ta.click();}else{goPick();}});return;}' +
            'if(d&&d.conflict&&tries<1){var live=String(d.note||""),t2=live;' +
              'for(var i=0;i<KT.length;i++){var ln=SG.kaeshiSetLine(KT[i],kPick(KT[i]),kMark());if(ln)t2=SG.kaeshiPutLine(t2,KT[i],ln);}' +
              'RB.note=live;$("sgmtext").value=t2;repSubmit(t2,live,tries+1);return;}' +
            'memoFail("予約メモが他の端末で修正されていました。もう一度お客様を選択してください🙇");});};' +
        'setTimeout(poll,1200);});}' +
    'function kMark(){if(REP&&pick&&pick!==SG.ALL)return pick;' +       
      'var m=(typeof staffOf==="function"&&CUST)?staffOf(CUST.title||""):"";' +
      'if(!m&&pick&&pick!==SG.ALL)m=pick;return m||"";}' +
    'function kDecide(list){' +
      'var old=(typeof SG.kaeshiLineOf!=="function"||typeof SG.kaeshiSetLine!=="function");KT=[];' +
      'if(!old){var tx=$("sgmtext").value||"";' +
        'for(var i=0;i<(list||[]).length;i++){if(SG.kaeshiLineOf(tx,list[i])!==null)KT.push(list[i]);}}' +
      'if(rcp()){if(KT.length||seqv().length){goCheck();}else{sendMemo();}return;}' +
      'if(old||!KT.length){sendMemo();return;}' +
      'step=8;show();drawKaeshi();window.scrollTo(0,0);}' +
    'var KPICK={};' +
    'function kPick(t){var key=t.head||"";if(!KPICK[key])KPICK[key]={};return KPICK[key];}' +
    'function kOpts(k,pw,cur){var h="<div class=\\"ktopts\\">";' +
      'for(var o=0;o<SG.KAESHI_OPTS.length;o++){var w=SG.KAESHI_OPTS[o][1];' +
        'h+="<button type=\\"button\\" data-k=\\""+k+"\\" data-p=\\""+esc(pw)+"\\" data-v=\\""+esc(w)+"\\" class=\\""+' +
          '(cur===w?"on":"")+"\\">"+esc(SG.KAESHI_OPTS[o][0])+"</button>";}' +
      'return h+"</div>";}' +
    'function kApply(t){var line=SG.kaeshiSetLine(t,kPick(t),kMark());' +
      '$("sgmtext").value=line?SG.kaeshiPutLine($("sgmtext").value||"",t,line):SG.kaeshiRemove($("sgmtext").value||"",t);}' +
    'function drawKaeshi(){var tx=$("sgmtext").value||"",h="";' +
      'for(var k=0;k<KT.length;k++){var ln=SG.kaeshiLineOf(tx,KT[k]);if(ln===null)continue;' +
        'var pk=kPick(KT[k]),ps=SG.kaeshiParts(KT[k]);' +
        'h+="<div class=\\"ktcard"+(ln?" done":"")+"\\"><div class=\\"ktlast\\">⚠️ 次が最終回です</div>"+' +
          '"<h4>"+esc(KT[k].name||KT[k].head)+"</h4><div class=\\"q\\">お知らせのおすすめは？</div>";' +
        'if(!ps.length){h+=kOpts(k,"__all",pk.all||"");}' +
        'else{h+="<div class=\\"ktmode\\"><button type=\\"button\\" data-k=\\""+k+"\\" data-mode=\\"same\\" class=\\""+' +
            '(pk.mode==="same"?"on":"")+"\\">全部位が<br>同じおすすめ</button><button type=\\"button\\" data-k=\\""+k+' +
            '"\\" data-mode=\\"diff\\" class=\\""+(pk.mode==="diff"?"on":"")+"\\">部位によって<br>おすすめが違う</button></div>";' +
          'if(pk.mode==="same"){h+=kOpts(k,"__all",pk.all||"");}' +
          'else if(pk.mode==="diff"){var ea=pk.each||{};for(var q=0;q<ps.length;q++){' +
            'h+="<div class=\\"pl\\">"+esc(ps[q].word)+"</div>"+kOpts(k,ps[q].word,ea[ps[q].word]||"");}}}' +
        'h+="<div class=\\"ktline\\">"+(ln?"入っている行： "+esc(ln):"")+"</div></div>";}' +
      '$("sgkcards").innerHTML=h;$("sgkpre").textContent=tx;' +
      'var mb=$("sgkcards").querySelectorAll(".ktmode button");' +
      'for(var m=0;m<mb.length;m++)mb[m].onclick=function(){if(sending)return;' +
        'var t=KT[parseInt(this.getAttribute("data-k"),10)],md=this.getAttribute("data-mode");' +
        'if(kPick(t).mode===md)return;KPICK[t.head||""]={mode:md,all:"",each:{}};kApply(t);drawKaeshi();};' +
      'var bs=$("sgkcards").querySelectorAll(".ktopts button");' +
      'for(var j=0;j<bs.length;j++)bs[j].onclick=function(){if(sending)return;' +
        'var t=KT[parseInt(this.getAttribute("data-k"),10)],pk=kPick(t),pw=this.getAttribute("data-p");' +
        'if(pw==="__all"){pk.all=this.getAttribute("data-v");if(!pk.mode)pk.mode="same";}' +
        'else{pk.each=pk.each||{};pk.each[pw]=this.getAttribute("data-v");}' +
        'kApply(t);drawKaeshi();};' +
      'var n=SG.kaeshiMissing(tx,KT);$("sgkgo").disabled=n>0||sending;' +
      '$("sgkwarn").textContent=n>0?"🔁を選択していない施術があと"+n+"つあります":"";}' +
    'function memoNext(){if(sending)return;' +
      'if(!($("sgmtitle").value||"").trim()){szPopup_("予約メモのタイトルを入力してね😊");return;}' +
      'if(!MEMOTOUCHED||!(CUST&&CUST.note)){kDecide(FINALS||[]);return;}' +
      'var my=++kchk,cd=(typeof codeOf==="function"&&CUST)?(codeOf(CUST.title)||""):"";' +
      'szOvShow_(szBusyHtml_("予約メモを確認しています"),"#2C7A99");' +
      'var done=function(list){if(my!==kchk)return;kchk++;szOvHide_();kDecide(list);};' +
      'setTimeout(function(){done(FINALS||[]);},20000);' +
      'jsonp({action:"submit",key:KEY,op:"sejutsugo_next_memo",who:idn.who,role:idn.role,device:idn.device,' +
        'fields:JSON.stringify({memo:$("sgmtext").value||"",date:PICKDATE||"",fnum:cd,today:TODAY,' +
          'title:(CUST&&CUST.title)||"",check_only:"1",prev:CUST.note})},' +
      'function(r){if(!r||!r.ok||!r.id){done(FINALS||[]);return;}var n=0;' +
        'var poll=function(){if(my!==kchk)return;n++;' +
          'jsonp({action:"status",key:KEY,id:r.id},function(x){if(my!==kchk)return;' +
            'if(x&&x.ok&&(x.status==="pending"||x.status==="running"||x.status==="queued"||x.status==="")){' +
              'if(n<30){setTimeout(poll,600);return;}}' +
            'var d=null;try{d=JSON.parse((x&&x.result)||"{}");}catch(e){}' +
            'done((d&&d.ok&&d.finals)?d.finals:(FINALS||[]));});};' +
        'setTimeout(poll,900);});}' +
    SG_STEPS_JS_ +
    '$("sgback").onclick=function(){if(!tapOK())return;back();};' +
    '(function(){sgBindSteps();' +
      '$("sgtgo").onclick=function(){if(!tapOK())return;askNextMemo();goMemo();};' +
      'if(!REP){' +
        '$("sgtanone").onclick=function(){if(!tapOK())return;TA={};taDraw();taNext();};' +
        'var tb=$("sgAfter").getElementsByClassName("sgta");' +
        'for(var ti=0;ti<tb.length;ti++){tb[ti].onclick=function(){if(!tapOK())return;' +
          'var k=this.getAttribute("data-k");TA[k]=TA[k]!==true;taDraw();};}' +
        '$("sgtago").onclick=function(){if(!tapOK())return;if(!taPicked().length)return;taNext();};' +
        'var eb=$("sgElight").getElementsByClassName("sgel");' +
        'for(var ei=0;ei<eb.length;ei++){eb[ei].onclick=function(){if(!tapOK())return;' +
          'var k=this.getAttribute("data-k");' +
          'if(k==="no"){noCheck("イーライト",function(){ELANS="no";afterElight();});return;}' +
          'var top=SG.elightTop((ELJ&&ELJ.parts)||[]),EN={vio:"VIOのみ",both:"VIO＋髭等【VIO以外の部位】",other:"髭等【VIO以外の部位】"};' +
          'if(top&&k!==top){szPopup_("予約メモには、"+EN[top]+"のイーライトを施術する、と記入されています。今日本当に、"+EN[k]+"のイーライトをやりましたか？",' +
            '{cancel:true,noLabel:"選び直す",yesLabel:"はい、やりました",onYes:function(){ELANS=k;afterElight();}});return;}' +
          'if(/イーライト/.test((CUST&&CUST.title)||"")){ELANS=k;afterElight();return;}' +
          '(window.szPopup_||szPopup_)("タイムツリーの予約タイトルには、イーライトの言葉が入っていませんが、本日、本当にイーライトをやりましたか？",' +
            '{cancel:true,noLabel:"NO<br><span style=white-space:nowrap;font-size:.8em>（やってない）</span>",' +
            'yesLabel:"YES<br><span style=white-space:nowrap;font-size:.8em>（やりました）</span>",' +
            'onNo:function(){ELANS="no";afterElight();},onYes:function(){ELANS=k;afterElight();}});};}' +
        'var fb=$("sgFirst").getElementsByClassName("sgfd");' +
        'for(var fi=0;fi<fb.length;fi++){fb[fi].onclick=function(){if(!tapOK())return;' +
          'var k=this.getAttribute("data-k"),m="";' +
          'if(k==="yes"&&FIRSTDAT===false)m="記録では、このお客様は過去に当店で脱毛をしています。「初めての脱毛の施術でした」で、本当によろしいでしょうか？😊";' +
          'if(k==="no"&&FIRSTDAT===true)m="記録では、このお客様は本日が当店はじめての脱毛のようです。「過去に当店で脱毛履歴がありました」で、本当によろしいでしょうか？😊";' +
          'if(k==="counsel"&&(ELANS==="vio"||ELANS==="both"||ELANS==="other"))' +
            'm="前の画面で、イーライトをやったと選択しています。「今日はカウンセリングだけで施術しなかった」で、本当によろしいでしょうか？😊";' +
          'if(!m){FDANS=k;nextOf(11);return;}' +
          'szPopup_(m,{cancel:true,noLabel:"選び直す",yesLabel:"はい、大丈夫です",onYes:function(){if(k==="counsel")ELANS="no";FDANS=k;nextOf(11);}});};}' +
        'var lb=$("sgLash").getElementsByClassName("sglh");' +
        'for(var li=0;li<lb.length;li++){lb[li].onclick=function(){if(!tapOK())return;var k=this.getAttribute("data-k"),go=function(){LASHANS=k;nextOf(12);};' +
          'if(k==="no"){noCheck("パリジェンヌ",go);return;}go();};}' +
        'var pb=$("sgPF").getElementsByClassName("sgpf");' +
        'for(var pi=0;pi<pb.length;pi++){pb[pi].onclick=function(){if(!tapOK())return;var k=this.getAttribute("data-k"),go=function(){PFANS=k;nextOf(13);};' +
          'if(k==="no"){noCheck("顔のプロセル",go);return;}go();};}' +
        'var hb=$("sgPH").getElementsByClassName("sgph");' +
        'for(var hi=0;hi<hb.length;hi++){hb[hi].onclick=function(){if(!tapOK())return;var k=this.getAttribute("data-k"),go=function(){PHANS=k;nextOf(14);};' +
          'if(k==="no"){noCheck("頭皮のプロセル",go);return;}go();};}}' +
      '$("sgmgo").onclick=function(){if(!tapOK())return;memoNext();};' +
      '$("sgckgo").onclick=function(){if(!tapOK())return;var sv=seqv();if(sv.length){goStep(sv[0]);}else{rcpFinish();}};' +
      '$("sgkgo").onclick=function(){if(!tapOK())return;' +
        'if(SG.kaeshiMissing($("sgmtext").value||"",KT)>0)return;if(REP){repSend();}else{sendMemo();}};' +
      'if(REP)repBind();' +
      '$("sgmtext").addEventListener("input",function(){MEMOTOUCHED=true;growMemo();});})();' +
    'window.addEventListener("resize",function(){if(step===2){fitNames();gapAfterNow();}' +
      'if(step===6)fitLine($("sgtwho"),26,13);if(step===7)growMemo();});' +
    'showTestNote();' +
    'if(REP){repStart();}else{need(build);}' +
    '})();<' + '/script>';
  return '<style>' + HOMECSS_ + css + AKFCSS_ + KAESHICSS_ + (REP ? EXPADCSS_ : '') + (true ?
    '.sgrbig{display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;margin:12px 0;padding:22px 18px;border:0;border-radius:18px;background:#fff;color:#0f172a;font:inherit;font-size:24px;font-weight:900;text-align:left;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.15);}' +
    '.sgrbig .sgrbi{font-size:30px;}' +
    '.sgrbig.sel{outline:4px solid #fb8c44;outline-offset:-4px;}' +
    '.sgrbig.sel::after{content:"✔";margin-left:auto;color:#fb8c44;font-size:28px;}' +
    '#sglgo:disabled{opacity:.45;}' +
    '.sgcklist{margin:12px 0 18px;}' +
    '.sgckrow{display:flex;gap:12px;align-items:flex-start;margin:12px 0;padding:18px;border-radius:18px;background:#fff;color:#0f172a;font-size:22px;font-weight:900;line-height:1.5;box-shadow:0 4px 14px rgba(0,0,0,.15);}' +
    '.sgckn{flex:none;font-size:26px;color:#2C7A99;}' +
    '#sgrdisp{text-align:center;font-size:34px;font-weight:900;min-height:1.35em;}' : '') +
    '.sgkpre{white-space:pre-wrap;word-break:break-all;background:#fff;color:#0f172a;border-radius:12px;padding:12px;margin:0;font:inherit;font-size:15px;line-height:1.5;}' +
    '</style>' +
    '<div class="home">' +
      '<span id="sgtopbar">' + backTop + '</span>' + backList +
      '<div class="sgtest" id="sgtest"></div>' +
      '<span id="sghead">' + head + '</span>' + body +
    '</div>' + script;
}
var KAESHICSS_ =
  '.ktcard{background:#fff;color:#0f172a;border-radius:16px;padding:14px;margin:10px 0;box-shadow:0 4px 14px rgba(0,0,0,.15);border-left:8px solid #f97316;}' +
  '.ktcard.done{border-left-color:#16a34a;}' +
  '.ktlast{background:#dc2626;color:#fff;font-size:26px;font-weight:900;text-align:center;border-radius:12px;padding:12px 8px;margin:0 0 12px;letter-spacing:.02em;}' +
  '.ktcard.done .ktlast{background:#16a34a;}' +
  '.ktcard h4{margin:0 0 6px;font-size:17px;font-weight:800;color:#334155;}' +
  '.ktcard .q{font-size:20px;font-weight:900;color:#0f172a;margin:4px 0 10px;}' +
  '.ktcard .pl{font-size:16px;font-weight:900;margin:12px 0 6px;}' +
  '.ktopts{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}' +
  '.ktopts button{background:#f1f5f9;color:#0f172a;border:3px solid transparent;border-radius:12px;padding:12px 2px;font:inherit;font-size:15px;font-weight:800;cursor:pointer;}' +
  '.ktopts button.on{background:#16a34a;color:#fff;border-color:#15803d;}' +
  '.ktmode{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:2px 0 12px;}' +
  '.ktmode button{background:#e2e8f0;color:#0f172a;border:3px solid transparent;border-radius:12px;padding:12px 4px;font:inherit;font-size:15px;font-weight:900;line-height:1.35;cursor:pointer;}' +
  '.ktmode button.on{background:#2C7A99;color:#fff;border-color:#1e5a73;}' +
  '.ktline{margin-top:10px;font-size:16px;font-weight:900;color:#15803d;min-height:1.3em;}' +
  '.ktwarn{color:#fde047;font-weight:900;font-size:16px;margin:10px 4px 0;min-height:1.3em;}';
