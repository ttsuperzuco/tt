// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：yoyaku_new
function renderNewReservationPage_(base, staff, dev) {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var STAFF = [['2', '🍊', 'みかん'], ['3', '🫒', 'オリーブ'], ['1', '🍅', 'トマト'], ['5', '🍍', 'パイン']];
  var ROOMS = [['FREEDOM', 'FREEDOM'], ['HAPPY', 'HAPPY'], ['LUCKY', 'LUCKY'], ['STAR', 'STAR/福/🇫🇷']];
  var DURS = [15, 20, 30, 40, 45, 50, 60, 70, 80, 90, 120, 150];
  function staffPills(grp, defVal, ids) {
    var h = '';
    for (var i = 0; i < STAFF.length; i++) {
      var s = STAFF[i];
      if (ids && ids.indexOf(s[0]) < 0) continue;   
      h += '<button type="button" class="nrpill' + (s[0] === defVal ? ' sel' : '') + '" data-grp="' + grp +
        '" data-val="' + s[0] + '" style="background:' + staffColor_(s[1]) + '">' + s[1] + ' ' + s[2] + '</button>';
    }
    return h;
  }
  var roomPills = '';
  for (var ri = 0; ri < ROOMS.length; ri++) {
    roomPills += '<button type="button" class="nrpill' + (ri === 0 ? ' sel' : '') + '" data-grp="room" data-val="' +
      esc_(ROOMS[ri][1]) + '" style="background:' + roomColor_(ROOMS[ri][1]) + '">' + esc_(ROOMS[ri][0]) + '</button>';
  }
  var durPills = '';
  for (var di = 0; di < DURS.length; di++) {
    durPills += '<button type="button" class="nrpill plain' + (DURS[di] === 60 ? ' sel' : '') +
      '" data-grp="dur" data-val="' + DURS[di] + '">' + DURS[di] + '</button>';
  }
  var genderPills = '<button type="button" class="nrpill" data-grp="gender" data-val="M" style="background:#2563eb">男</button>' +
    '<button type="button" class="nrpill" data-grp="gender" data-val="F" style="background:#db2777">女</button>';
  var natPills = '<button type="button" class="nrpill" data-grp="tw" data-val="0" style="background:#64748b">日本</button>' +
    '<button type="button" class="nrpill" data-grp="tw" data-val="1" style="background:#0d9b6c">台湾 🇹🇼</button>';
  var css = '.nr{max-width:560px;margin:0 auto;padding:0 6px 60px;text-align:left;}' +
    '.nrnote{background:#fff3cd;color:#5b4a00;padding:12px 14px;border-radius:12px;font-weight:800;font-size:16px;line-height:1.6;margin:6px 4px 6px;}' +
    '.nrsec{font-weight:900;margin:18px 4px 8px;font-size:20px;color:#fff;}' +
    '.nr textarea{width:100%;box-sizing:border-box;font-size:17px;padding:12px;border-radius:12px;border:1px solid #cbd5e1;background:#fff;color:#123;min-height:120px;}' +
    '.nrpills{display:flex;flex-wrap:wrap;gap:8px;}' +
    '.nrpill{border:0;border-radius:999px;padding:12px 18px;font-weight:800;font-size:15px;color:#fff;opacity:.6;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.15);}' +
    '.nrdur .nrpill{flex:0 0 calc((100% - 40px)/6);padding:12px 2px;text-align:center;box-sizing:border-box;}' +    
    '.nrpill.plain{background:#475569;}' +
    '.nrslot{border:2px solid rgba(255,255,255,.28);border-radius:14px;padding:4px 12px 12px;margin:14px 0;}' +
    '.nrsub{font-weight:800;margin:12px 2px 6px;font-size:15px;color:#dbeafe;}' +
    '.nrnote2{color:#cfe6ef;font-size:14px;margin:0 2px 8px;}' +
    '.nrcoswarn{background:#fde2e4;color:#9b1c31;padding:12px 14px;border-radius:12px;font-weight:900;line-height:1.6;margin:8px 0;white-space:pre-line;}' +
    '.nrfixrow{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin:6px 0 8px;}' +
    '.nrfixred{flex:1 1 auto;background:#fde2e4;color:#b3121f;padding:12px 14px;border-radius:12px;font-weight:900;font-size:19px;line-height:1.7;}' +
    '.nrrawbtn{flex:0 0 auto;margin-left:auto;border:0;border-radius:999px;padding:12px 20px;font-size:16px;font-weight:800;color:#2C7A99;background:#fff;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.20);}' +
    '.nrrawrow{display:flex;margin:10px 0 4px;}' +
    '.nrslot.nrlock .nrpills,.nrslot.nrlock .nrsub{display:none;}' +
    '.nrorow{display:flex;align-items:center;gap:10px;background:#fff;color:#123;border-radius:12px;padding:12px 14px;margin:8px 0;font-size:17px;font-weight:900;}' +
    '.nrono{background:#2C7A99;color:#fff;border-radius:999px;min-width:32px;text-align:center;padding:2px 8px;}' +
    '.nroname{flex:1;}' +
    '.nroup{border:0;border-radius:999px;background:#2C7A99;color:#fff;font-weight:900;font-size:15px;padding:10px 14px;}' +
    '.nrpill.sel{opacity:1;outline:3px solid #fff;outline-offset:-3px;}' +
    '.nrgo{display:block;width:100%;margin:24px 0 8px;padding:18px;font-size:21px;font-weight:800;border:0;border-radius:16px;background:#16a34a;color:#fff;box-shadow:0 4px 10px rgba(0,0,0,.18);}' +
    '.nrgo:disabled{opacity:.5;}' +
    '.nrread{display:block;width:100%;margin:12px 0 4px;padding:14px;font-size:17px;font-weight:800;border:0;border-radius:14px;background:#2563eb;color:#fff;box-shadow:0 3px 8px rgba(0,0,0,.16);}' +
    '.nrread:disabled{opacity:.5;}' +
    '#nrprev{width:100%;box-sizing:border-box;min-height:120px;font-size:19px;padding:12px;border-radius:12px;border:1px solid #cbd5e1;background:#fff;color:#123;line-height:1.7;overflow:hidden;}' +
    '.nrstatus{font-weight:900;min-height:0;margin:16px 4px;font-size:23px;line-height:1.5;'
    + 'white-space:pre-line;border-radius:12px;padding:0;}' +
    '.nrstatus.on{background:#fff;color:#0f172a;padding:14px 16px;'
    + 'box-shadow:0 2px 6px rgba(0,0,0,.12);}' +
    '.nrstatus.ng{background:#7f1d1d;color:#fecaca;padding:14px 16px;}';
  var script = '<script>(function(){' +
    'var EXEC="' + EXEC + '",KEY="' + KEY + '";' +
    'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
    'var sel={dur:"60",staff:"2",counsel:"2",needc:"yes",room:"FREEDOM",gender:"",tw:""};' +   
    'var stEl=document.getElementById("nrstatus"),goEl=document.getElementById("nrgo"),txtEl=document.getElementById("nrtext");' +
    'var prevEl=document.getElementById("nrprev"),prevWrap=document.getElementById("nrprevwrap"),readEl=document.getElementById("nrread");' +
    'window.__nrSteps=["paste"];window.__nrStepI=0;' +
    'function nrShowStep(i){var L=window.__nrSteps||["paste"];if(i<0)i=0;if(i>=L.length)i=L.length-1;' +
    'window.__nrStepI=i;var v=NR.stepView(L[i]),b;' +
    'b=document.getElementById("nrStep1");if(b)b.style.display=v.paste?"":"none";' +
    'b=document.getElementById("nrStepProcell");if(b)b.style.display=v.procell?"":"none";' +
    'b=document.getElementById("nrStepCouns");if(b)b.style.display=v.couns?"":"none";' +
    'if(prevWrap)prevWrap.style.display=v.memo?"":"none";' +
    'b=document.getElementById("nrStep3");if(b)b.style.display=v.time?"":"none";' +
    'b=document.getElementById("nrrest");if(b)b.style.display=v.rest?"":"none";' +
    'b=document.getElementById("nrStepGender");if(b)b.style.display=v.gender?"":"none";' +
    'b=document.getElementById("nrStepTitle");if(b)b.style.display=v.title?"":"none";' +
    'b=document.getElementById("nrStepNeedc");if(b)b.style.display=v.needc?"":"none";' +
    'b=document.getElementById("nrStepOrder");if(b)b.style.display=v.order?"":"none";' +
    'b=document.getElementById("nrStepDur");if(b)b.style.display=v.dur?"":"none";' +
    'b=document.getElementById("nrStepSlot");if(b)b.style.display=(v.slot>=0)?"":"none";' +
    'if(v.slot>=0)nrShowOneSlot(v.slot);' +
    'if(v.rest)nrShowRestHead();' +
    'if(v.memo&&prevEl){prevEl.style.height="auto";prevEl.style.height=(prevEl.scrollHeight+6)+"px";}' +
    'if(v.rest||v.slot>=0)nrAvailWaitSync();else nrAvailWaitHide();' +
    'nrGoCheck();try{window.scrollTo({top:0,behavior:"smooth"});}catch(e){window.scrollTo(0,0);}}' +
    'var _avBox=null;' +
    'function nrAvailWaitHide(){if(_avBox&&_avBox.parentNode)_avBox.parentNode.removeChild(_avBox);_avBox=null;}' +
    'function nrAvailWaitSync(){' +
    'var v=NR.availWaitView(window.__nrAvPending,window.__nrTimeChecking);' +
    'var _nm0=((window.__nrSteps||[])[window.__nrStepI||0])||"";' +
    'var onRest=(_nm0==="rest")||/^slot\d+$/.test(_nm0);' +
    'if(v.shown&&onRest){if(!_avBox)_avBox=szPopup_(v.msg,{icon:"⏳",noButtons:true});}' +
    'else nrAvailWaitHide();}' +
    'window.__nrAvailWaitSync=nrAvailWaitSync;' +
    'var _slBox=null;' +
    'function nrSlotsWaitHide(){if(_slBox&&_slBox.parentNode)_slBox.parentNode.removeChild(_slBox);_slBox=null;}' +
    'function nrSlotsWaitShow(){if(!_slBox)_slBox=szPopup_(NR.slotsWaitView(true).msg,{icon:"⏳",noButtons:true});}' +
    'var nrSlPolls=0;' +
    'function nrMemoNext(){var m=(prevEl?prevEl.value:"")||"";' +
    'if(m===(window.__nrSlotsMemo||"")){nrNext();return;}' +          
    'nrSlotsWaitShow();var d0=window.__rvdt||{};' +
    'var need=(!!window.__nrNeedCounsel&&sel.needc!=="no")?"1":"0";' +
    'jsonp({action:"submit",key:KEY,op:"new_slots",who:idn.who,role:idn.role,device:idn.device,' +
    'fields:JSON.stringify({memo:m,service:(window.__nrService||""),date:(window.__nrDate||""),' +
    'start_min:(Number(d0.hh||0)*60+Number(d0.mi||0)),gender:(sel.gender||window.__nrReadGender||""),' +
    'tw:(sel.tw||window.__nrReadTw||""),is_new:(window.__nrIsNew?"1":"0"),need_counsel:need})},' +
    'function(r){if(!r||!r.ok||!r.id){nrSlotsWaitHide();window.__nrSlotsMemo=m;nrNext();return;}' +
    'nrSlPolls=0;setTimeout(function(){nrSlPoll(r.id,m);},700);});}' +
    'function nrSlPoll(id,m){nrSlPolls++;' +
    'if(nrSlPolls>LIMITS.tries("new_slots",700)){nrSlotsWaitHide();window.__nrSlotsMemo=m;nrNext();return;}' +
    'jsonp({action:"status",key:KEY,id:id},function(r){' +
    'if(!r||!r.ok){nrSlotsWaitHide();window.__nrSlotsMemo=m;nrNext();return;}' +
    'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){nrSlPoll(id,m);},700);return;}' +
    'var d=null;try{d=JSON.parse(r.result||"{}");}catch(e){d=null;}' +
    'nrSlotsWaitHide();window.__nrSlotsMemo=m;' +
    'if(d&&d.ok&&d.slots&&d.slots.length){' +
    'window.__nrSlotsBase=[];for(var b=0;b<d.slots.length;b++){var o={},s0=d.slots[b];for(var k in s0){o[k]=s0[k];}window.__nrSlotsBase.push(o);}' +
    'buildSlotUI(d.slots);window.__nrCounsSlots((window.__nrCouns||{}).kind);nrApplyNeedC();applyAvail(d);' +
    'if(window.__nrSchedTitle){titleEdited=false;window.__nrSchedTitle("staff");}' +
    'if(window.__nrRebuildSteps)window.__nrRebuildSteps();nrScheduleAvail();}' +
    'nrNext();});}' +
    'function nrSlotHeadOf(i){var S=window.__nrSlots||[],d=window.__rvdt||{};' +
    'var durs=[];for(var q=0;q<S.length;q++)durs.push(sel["dur#"+q]);' +
    'var ps=NR.slotStarts(S,durs,(Number(d.hh)*60+Number(d.mi)),sel.needc);' +
    'var lb=(S[i]&&S[i].label)||((S[i]&&S[i].kind==="counsel")?"カウンセリング":"施術");' +
    'return NR.slotHeadText(NR.dateText(window.__rvdt,window.__nrWd),(ps[i]?NR.hhmm(ps[i].startMin):""),lb);}' +
    'function nrSlotBoxOf(n){var S=window.__nrSlots||[],durs=[];' +
    'for(var q=0;q<S.length;q++)durs.push(sel["dur#"+q]);' +
    'var ps=NR.slotStarts(S,durs,0,sel.needc),c=0;' +
    'for(var i=0;i<S.length;i++){if(ps[i]&&ps[i].skip)continue;if(c===n)return i;c++;}return -1;}' +
    'function nrShowOneSlot(n){var bx=document.querySelectorAll("#nrSlotWrap .nrslot");' +
    'var i=nrSlotBoxOf(n);if(i<0)i=n;' +
    'for(var k=0;k<bx.length;k++){bx[k].style.display=(k===i)?"":"none";}' +
    'var hd=document.getElementById("nrSlotHead");if(hd)hd.textContent=nrSlotHeadOf(i);' +
    'window.__nrSlotNow=i;nrGoCheck();}' +
    'function nrShowRestHead(){var hd=document.getElementById("nrRestHead");if(!hd)return;' +
    'var S=window.__nrSlots||[],lb=(S[0]&&S[0].label)||"施術";' +
    'hd.textContent=NR.slotHeadText(NR.dateText(window.__rvdt,window.__nrWd),' +
    'NR.hhmm(Number((window.__rvdt||{}).hh)*60+Number((window.__rvdt||{}).mi)),lb);}' +
    'function nrStepOpts(){var S=window.__nrSlots||[];' +
    'var nv=NR.needCounselView(S,window.__nrNeedCounsel,sel.needc);' +
    'var n=0;if(NR.perSlot(S)){var durs=[];for(var q=0;q<S.length;q++)durs.push(sel["dur#"+q]);' +
    'var ps=NR.slotStarts(S,durs,0,sel.needc);' +
    'for(var i=0;i<S.length;i++){if(!ps[i].skip)n++;}}' +
    'return {needcShown:!!nv.needCSec, orderShown:!!NR.orderRows(S).shown, slotCount:n};}' +
    'function nrRebuildSteps(){var L=window.__nrSteps||[],now=L[window.__nrStepI||0];' +
    'window.__nrSteps=NR.stepList(window.__nrHasProcell,window.__nrHasCouns,' +
    'NR.needGenderStep((window.__nrReadGender||""),(window.__nrReadTw||"")),nrStepOpts());' +
    'var j=window.__nrSteps.indexOf(now);nrShowStep(j>=0?j:(window.__nrStepI||0));}' +
    'window.__nrRebuildSteps=nrRebuildSteps;' +
    'function nrNext(){nrShowStep((window.__nrStepI||0)+1);}' +
    'function nrPrev(){nrShowStep((window.__nrStepI||0)-1);}' +
    'function status(t,err){stEl.textContent=t;stEl.className="nrstatus"+(t?(err?" ng":" on"):"");}' +
    'function esc(s){return (s==null?"":String(s));}' +
    'function selVal(g,v){if(!v)return;sel[g]=String(v);var sib=document.querySelectorAll(".nrpill[data-grp=\\""+g+"\\"]");for(var j=0;j<sib.length;j++)sib[j].classList.toggle("sel",sib[j].getAttribute("data-val")===String(v));}' +
    'function nrHideBusy(g,list){var pl=document.querySelectorAll(".nrpill[data-grp=\\""+g+"\\"]"),vals=[];' + 'for(var i=0;i<pl.length;i++){vals.push(pl[i].getAttribute("data-val"));}' + 'var r=NR.hideBusy(vals,list,sel[g]);' + 'for(var k=0;k<pl.length;k++){pl[k].style.display=r.hidden[k]?"none":"";}' + 'if(r.sel!==sel[g]){sel[g]=r.sel;for(var m=0;m<pl.length;m++){pl[m].classList.toggle("sel",pl[m].getAttribute("data-val")===r.sel);}}}' +
    'function nrMayuVis(){var v=NR.mayuView(window.__nrMayu,window.__nrSat,window.__nrSlots),o=NR.outerSectionsShown(window.__nrSlots);' +
    'var sp=document.querySelectorAll(".nrpill[data-grp=\\"staff\\"]");for(var k=0;k<sp.length;k++){var pine=sp[k].getAttribute("data-val")==="5";if(v.pineOnly){sp[k].style.display=pine?"":"none";}else if(pine){sp[k].style.display="none";}}' +
    'var rw=document.getElementById("nrRoomWrap");if(rw)rw.style.display=v.roomWrapShown?"":"none";' +
    'var sw2=document.getElementById("secStaffWrap");if(sw2&&!o.staff)sw2.style.display="none";' +
    'var dw2=document.getElementById("secDurWrap");if(dw2&&!o.dur)dw2.style.display="none";' +
    'if(v.forceStaff){selVal("staff",v.forceStaff);}' +
    'if(v.pickFirstFreeRoom){var rp=document.querySelectorAll(".nrpill[data-grp=\\"room\\"]"),rf=null;for(var m=0;m<rp.length;m++){if(rp[m].style.display!=="none"&&!rf){rf=rp[m];}}if(rf){sel.room=rf.getAttribute("data-val");for(var n=0;n<rp.length;n++){rp[n].classList.toggle("sel",rp[n]===rf);}}}else if(v.clearRoom){sel.room="";}}' +
    'function nrShowNone(g,id){var el=document.getElementById(id);if(!el)return;var pl=document.querySelectorAll(".nrpill[data-grp=\\""+g+"\\"]"),h=[];' +
    'for(var i=0;i<pl.length;i++){h.push(pl[i].style.display==="none");}el.style.display=NR.noneLeft(h)?"inline":"none";}' +
    'function applyAvail(av){if(!av)return;var cw=document.getElementById("cosmosWarn");' +
    'if(cw)cw.style.display=NR.cosmosWarnOutside(av,window.__nrSlots,window.__nrNeedCounsel,sel.needc)?"":"none";' +
    'if(cw){var _d1=window.__rvdt||{};cw.textContent=NR.cosmosBusyText(NR.hhmm(Number(_d1.hh||0)*60+Number(_d1.mi||0)),av.cosmos_busy_text);}' +
    
    'nrHideBusy("room",av.occ_rooms);nrHideBusy("staff",av.busy_staff);nrHideBusy("counsel",av.busy_counsel_staff);nrMayuVis();' +
    'nrShowNone("counsel","noneCounsel");nrShowNone("staff","noneStaff");nrShowNone("room","noneRoom");nrSlotAvail();nrGoCheck();}' +
    'function nrSlotAvail(){var S=window.__nrSlots;if(!NR.perSlot(S))return;var d=window.__rvdt;if(!d||!window.__nrDate)return;' +
    'var durs=[];for(var q=0;q<S.length;q++){durs.push(sel["dur#"+q]);}' +
    'var PLAN=NR.slotStarts(S,durs,Number(d.hh)*60+Number(d.mi),sel.needc);' +
    'window.__nrAvFailSlot="";window.__nrAvPending=true;nrGoCheck();nrAvailWaitSync();' +          

    'function hhmm(m){var h=Math.floor(m/60),i2=m%60;return h+"時"+(i2<10?"0":"")+i2+"分";}' +
    'function step(i,pos){if(i>=S.length){window.__nrAvPending=false;nrGoCheck();nrAvailWaitSync();if(window.__nrAvFailSlot)nrAvRetry();return;}' +
    'var pp=PLAN[i];var isC=pp.isCounsel,du=pp.dur;pos=pp.startMin;' +
    'if(pp.skip){step(i+1,pos);return;}' +
    'jsonp({action:"submit",key:KEY,op:"new_availability",who:idn.who,role:idn.role,device:idn.device,' +
    'fields:JSON.stringify({date:window.__nrDate,start_min:pos,dur:du,need_counsel:(isC?"1":"0")})},function(r){' +
    'if(!r||!r.ok||!r.id){window.__nrAvFailSlot="送れませんでした";step(i+1,pos+du);return;}var n=0;' +
    '(function pw(){n++;if(n>LIMITS.tries("new_availability",700)){window.__nrAvFailSlot="時間がかかりすぎました";step(i+1,pos+du);return;}' +
    'jsonp({action:"status",key:KEY,id:r.id},function(x){if(!x||!x.ok){setTimeout(pw,700);return;}' +
    'if(x.status==="pending"||x.status==="running"||x.status==="queued"||x.status===""){setTimeout(pw,700);return;}' +
    'if(x.status==="done"){var av={};try{av=JSON.parse(x.result||"{}");}catch(e){}' +
    'if(av&&av.ok){if(isC){var bx=document.querySelectorAll("#nrSlotWrap .nrslot")[i],w=document.getElementById("cosWarn"+i);' +
    'if(w){w.textContent=NR.cosmosBusyText(NR.hhmm(pos),av.cosmos_busy_text);' +
    'w.style.display=av.cosmos_busy?"":"none";}' +
    'if(bx){if(av.cosmos_busy){bx.classList.add("nrlock");}else{bx.classList.remove("nrlock");}}' +
    'nrHideBusy("staff#"+i,av.busy_counsel_staff);nrShowNone("staff#"+i,"noneStaff"+i);}' +
    'else{nrHideBusy("room#"+i,av.occ_rooms);nrHideBusy("staff#"+i,av.busy_staff);' +
    'nrShowNone("staff#"+i,"noneStaff"+i);nrShowNone("room#"+i,"noneRoom"+i);}}nrGoCheck();}' +
    'if(x.status!=="done"||!(av&&av.ok))window.__nrAvFailSlot="空きの答えが来ませんでした";step(i+1,pos+du);});})();});}' +
    'step(0,0);}' +
    'function nrApplyNeedC(){var v=NR.needCounselView(window.__nrSlots,window.__nrNeedCounsel,sel.needc);' +
    'var sn=document.getElementById("secNeedC");if(sn)sn.style.display=v.needCSec?"":"none";' +
    'var sc=document.getElementById("secCounsel");if(sc)sc.style.display=v.counselSec?"":"none";' +
    'if(v.rebuildOrder){var S=window.__nrSlots||[],rows=document.querySelectorAll("#nrSlotWrap .nrslot");' +
    'for(var y=0;y<S.length;y++){if(S[y].kind==="counsel"&&rows[y])rows[y].style.display=v.counselSlotShown?"":"none";}' +
    'buildOrderUI();}' +
    'if(!v.counselSec&&!v.rebuildOrder){var cw2=document.getElementById("cosmosWarn");if(cw2)cw2.style.display="none";}}' +
    'function nrStartText(){return NR.startText(window.__rvdt,window.__nrWd,!!window.__nrTimeMissing);}' +
    'function nrShownPills(g){var a=document.querySelectorAll(".nrpill[data-grp=\\""+g+"\\"]"),o=[];for(var i=0;i<a.length;i++){if(a[i].style.display!=="none")o.push(a[i]);}return o;}' +
    'function nrAnySel(g){var a=nrShownPills(g);for(var i=0;i<a.length;i++){if(a[i].classList.contains("sel"))return true;}return false;}' +
    'function nrGoCheck(){var btn=document.getElementById("nrgo"),ngbox=document.getElementById("nrGoNg");if(!btn)return;' +
    'var S=window.__nrSlots||[],rows=[];' +
    'if(NR.perSlot(S)){var bx=document.querySelectorAll("#nrSlotWrap .nrslot");' +
    'for(var i=0;i<S.length;i++){if(S[i].kind==="counsel"&&sel.needc==="no")continue;' +
    'var b=bx[i];if(b&&b.style.display==="none")continue;' +
    'rows.push({name:(i+1)+"つ目："+(S[i].label||"施術"),locked:!!(b&&b.className.indexOf("nrlock")>=0),' +
    'staffOk:nrAnySel("staff#"+i),roomNeeded:(S[i].kind!=="counsel"),roomOk:nrAnySel("room#"+i)});}}' +
    'else{var needC=(window.__nrNeedCounsel&&sel.needc!=="no");' +
    'if(needC)rows.push({name:"カウンセリング",locked:false,staffOk:nrAnySel("counsel"),roomNeeded:false,roomOk:true});' +
    'rows.push({name:"施術",locked:false,staffOk:nrAnySel("staff"),roomNeeded:!window.__nrMayu,roomOk:nrAnySel("room")});}' +
    'var r=NR.canRegister(rows,!!window.__nrAvPending,!!window.__nrTimeMissing,(prevEl?prevEl.value:""),{gender:!sel.gender,tw:!sel.tw,avFail:(window.__nrAvFailMain||window.__nrAvFailSlot||"")});window.__nrCanReg=r;btn.disabled=!r.ok;' +
    'if(ngbox){ngbox.textContent=r.msg;ngbox.style.display=r.ok?"none":"";}' +
    'var rRest=NR.canRegister(rows,!!window.__nrAvPending,!!window.__nrTimeMissing,(prevEl?prevEl.value:""),{gender:false,tw:false,avFail:(window.__nrAvFailMain||window.__nrAvFailSlot||"")});' +
    'var _rb=document.getElementById("nrRestOk");if(_rb)_rb.disabled=!rRest.ok;' +
    'var _rng=document.getElementById("nrRestNg");if(_rng){_rng.textContent=rRest.msg;_rng.style.display=rRest.ok?"none":"";}' +
    'var _si=window.__nrSlotNow,_sb=document.getElementById("nrSlotOk"),_sng=document.getElementById("nrSlotNg");' +
    'if(_sb&&typeof _si==="number"&&_si>=0){var _S2=window.__nrSlots||[],_isC2=(_S2[_si]&&_S2[_si].kind==="counsel");' +
    'var _need=[];if(!nrAnySel("staff#"+_si))_need.push("担当");' +
    'if(!_isC2&&!nrAnySel("room#"+_si))_need.push("部屋");' +
    'var _wait=!!window.__nrAvPending;' +
    'var _bx2=document.querySelectorAll("#nrSlotWrap .nrslot")[_si];' +
    'var _lk2=!!(_bx2&&_bx2.className.indexOf("nrlock")>=0);' +
    'var _sg=NR.slotGo(_need,_wait,_lk2);' +
    '_sb.disabled=!!_sg.disabled;' +
    'if(_sng){_sng.textContent=_sg.msg;_sng.style.display=_sg.msg?"":"none";}}' +
    'var _dh=document.getElementById("nrDurHead1");' +
    'if(_dh){var _S3=window.__nrSlots||[];_dh.textContent=NR.durHeadText((_S3[0]&&_S3[0].label)||"施術");}' +
    'var _cok2=NR.counselOk((window.__nrCouns||{}).kind),_cb2=document.getElementById("nrCounsOk");' +
    'if(_cb2)_cb2.disabled=!_cok2.ok;' +
    'var _gok=NR.genderOk(sel.gender,sel.tw),_gb=document.getElementById("nrGenderOk");if(_gb)_gb.disabled=!_gok.ok;' +
    'var _gng=document.getElementById("nrGenderNg");if(_gng){_gng.textContent=_gok.msg;_gng.style.display=_gok.ok?"none":"";}' +
    'var _memo=(prevEl?prevEl.value:""),_fn=NR.fixNotice(_memo);' +
    'var _frow=document.getElementById("nrFixRow"),_fr=document.getElementById("nrFixRed");' +
    'if(_frow&&_fr){if(_fn.red){_fr.textContent=_fn.red;_frow.style.display="";}else{_frow.style.display="none";}}' +
    'var _mok=NR.memoOk(_memo),_mb=document.getElementById("nrMemoOk");if(_mb)_mb.disabled=!_mok.ok;' +
    'var _pok=NR.procellOk(_memo),_pb=document.getElementById("nrProcellOk");if(_pb)_pb.disabled=!_pok.ok;' +
    'var _png=document.getElementById("nrProcellNg");' +
    'if(_png){_png.textContent=_pok.msg;_png.style.display=_pok.ok?"none":"";}' +
    'var _tok=NR.timeOk(!!window.__nrTimeMissing,(!!window.__nrTimeChecking||!!window.__nrAvPending)),_tb=document.getElementById("nrTimeOk");if(_tb)_tb.disabled=!_tok.ok;' +
    'var _tng=document.getElementById("nrTimeNg");' +
    'if(_tng){_tng.textContent=_tok.msg;_tng.style.display=_tok.ok?"none":"";}' +
    'var tv=NR.titleView(r),tsec=document.getElementById("secTitle");' +
    'if(tsec&&!tv.shown)tsec.style.display="none";' +
    'if(tv.shown&&!titleEdited&&!_titleErr&&!document.querySelector(".nrTitleIn"))refreshTitles();' +
    'if(_titleKeep&&tv.shown){var _k=_titleKeep;_titleKeep=null;fillTitles(_k.t,_k.d);return;}' +
    'if(_titleErr){btn.disabled=true;if(ngbox){ngbox.textContent="タイトルを作成できませんでした（"+_titleErr+"）。「← 戻る」で予約メモや担当・部屋を確認してね😊";ngbox.style.display="";}}' +
    'else if(titleStale){btn.disabled=true;if(ngbox){ngbox.textContent="タイトルを作っています。少し待っててくださいね🥺";ngbox.style.display="";}}}' +
    'function nrShowStart(){var e=document.getElementById("nrStartDisp");if(e)e.textContent=nrStartText();}' +
    'var nrAvTimer=null;function nrScheduleAvail(){nrAvRetried=0;if(nrAvTimer)clearTimeout(nrAvTimer);nrAvTimer=setTimeout(function(){nrRecheckAvail();},300);}' +
    'var nrAvRetried=0;function nrAvRetry(){if(nrAvRetried>=1){nrGoCheck();return;}nrAvRetried++;setTimeout(function(){nrRecheckAvail();},3000);}' +
    'function nrAvFailMain(msg){window.__nrAvFailMain=msg;nrGoCheck();nrAvRetry();}' +
    'var nrAvPolls=0;function nrRecheckAvail(done){var d=window.__rvdt;if(!d||!window.__nrDate){if(done)done();return;}' +
    'var need=(!!window.__nrNeedCounsel&&sel.needc!=="no")?"1":"0";' +
    'jsonp({action:"submit",key:KEY,op:"new_availability",who:idn.who,role:idn.role,device:idn.device,' +
    'fields:JSON.stringify({date:window.__nrDate,start_min:(Number(d.hh)*60+Number(d.mi)),dur:Number(sel.dur||60),need_counsel:need})},' +
    'function(r){if(!r||!r.ok||!r.id){if(done)done();nrAvFailMain("送れませんでした");return;}nrAvPolls=0;setTimeout(function(){nrAvPoll(r.id,done);},700);});}' +
    'function nrAvPoll(id,done){nrAvPolls++;if(nrAvPolls>LIMITS.tries("new_availability",700)){if(done)done();nrAvFailMain("時間がかかりすぎました");return;}' +
    'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){setTimeout(function(){nrAvPoll(id,done);},700);return;}' +
    'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){nrAvPoll(id,done);},700);return;}' +
    'if(r.status!=="done"){if(done)done();nrAvFailMain("途中で止まりました");return;}var av={};try{av=JSON.parse(r.result||"{}");}catch(e){}' +
    'if(av&&av.ok){window.__nrAvFailMain="";applyAvail(av);if(window.__nrSchedTitle)window.__nrSchedTitle("staff");}else{nrAvFailMain("空きの答えが来ませんでした");}if(done)done();nrAvailWaitSync();});}' +
    'function nrStartEditInit(){var row=document.getElementById("nrStartRow"),ed=document.getElementById("nrStartEdit");' +
    'var bFix=document.getElementById("btnStartFix"),bOk=document.getElementById("btnStartOk"),bNo=document.getElementById("btnStartCancel");' +
    'function gv(id){return document.getElementById(id);}' +
    'function open(){var d=window.__rvdt||{};gv("nrEdMM").value=(d.mm||"");gv("nrEdDD").value=(d.dd||"");gv("nrEdHH").value=(d.hh==null?"":d.hh);gv("nrEdMI").value=(d.mi==null?"":d.mi);' +
    'if(ed)ed.style.display="flex";if(row)row.style.display="none";}' +
    'function close(){if(ed)ed.style.display="none";if(row)row.style.display="flex";}' +
    'if(bFix)bFix.addEventListener("click",open);if(bNo)bNo.addEventListener("click",close);' +
    'if(bOk)bOk.addEventListener("click",function(){var mm=Number(gv("nrEdMM").value),dd=Number(gv("nrEdDD").value),hh=Number(gv("nrEdHH").value),mi=Number(gv("nrEdMI").value);' +
    'if(!(mm>=1&&mm<=12)||!(dd>=1&&dd<=31)||!(hh>=0&&hh<=23)||!(mi>=0&&mi<=59)){szPopup_("月日時分を正しく入力してね😊");return;}' +
    'var y=window.__nrDate?Number(window.__nrDate.slice(0,4)):(new Date()).getFullYear();var dt=new Date(y,mm-1,dd);var today=new Date();today.setHours(0,0,0,0);' +
    'if((today-dt)>31*24*3600*1000){y+=1;dt=new Date(y,mm-1,dd);}' +
    'if(dt.getMonth()!==mm-1){szPopup_("その日付はありません。");return;}' +
    'window.__rvdt={mm:mm,dd:dd,hh:hh,mi:mi};window.__nrTimeMissing=false;' +
    'window.__nrDate=y+"-"+(mm<10?"0":"")+mm+"-"+(dd<10?"0":"")+dd;' +
    'window.__nrWd="日月火水木金土".charAt(dt.getDay());window.__nrSat=(dt.getDay()===6);' +
    'close();nrShowStart();window.__nrTimeChecking=true;nrGoCheck();' +
    'nrRecheckAvail(function(){window.__nrTimeChecking=false;nrGoCheck();nrAvailWaitSync();});' +
    'if(window.__nrSchedTitle){titleEdited=false;window.__nrSchedTitle("staff");}});}' +
    'document.addEventListener("click",function(ev){var b=(ev.target&&ev.target.closest)?ev.target.closest(".nrpill"):null;if(!b)return;' +
    'var g=b.getAttribute("data-grp"),v=b.getAttribute("data-val");if(!g)return;sel[g]=v;' +
    'var sib=document.querySelectorAll(".nrpill[data-grp=\\"" + g + "\\"]");for(var j=0;j<sib.length;j++)sib[j].classList.remove("sel");b.classList.add("sel");if(window.__nrSchedTitle)window.__nrSchedTitle(g);' +
    'if(g==="needc"){nrApplyNeedC();nrScheduleAvail();if(window.__nrRebuildSteps)window.__nrRebuildSteps();}' +
    'else if(g==="dur"||g.indexOf("dur#")===0){nrScheduleAvail();}nrGoCheck();});' +
    'function buildSlotUI(slots){var wrap=document.getElementById("nrSlotWrap");' +
    'var dw=document.getElementById("secDurWrap"),sw=document.getElementById("secStaffWrap"),rw=document.getElementById("nrRoomWrap");' +
    'window.__nrSlots=slots||[];if(!wrap)return;' +
    'var o=NR.outerSectionsShown(window.__nrSlots);' +
    'if(dw)dw.style.display=o.dur?"":"none";if(sw)sw.style.display=o.staff?"":"none";if(rw)rw.style.display=o.room?"":"none";' +
    'if(!NR.perSlot(window.__nrSlots)){wrap.style.display="none";wrap.innerHTML="";return;}' +
    'var DU=[15,20,30,40,45,50,60,70,80,90,120,150];' +
    'var ST=[["2","🍊 みかん","#e08a1e"],["3","🫒 オリーブ","#4b8b3b"],["1","🍅 トマト","#d1443c"]];' +
    'var RM=[["FREEDOM","FREEDOM","#2ecc87"],["HAPPY","HAPPY","#e73b3b"],["LUCKY","LUCKY","#fdc02d"],["STAR/福/🇫🇷","STAR/福","#b38bdc"]];' +
    'function pl(g,v,l,c,on){var o=(c?" style=\\"background:"+c+"\\"":"");return "<button type=\\"button\\" class=\\"nrpill"+(c?"":" plain")+(on?" sel":"")+"\\" data-grp=\\""+g+"\\" data-val=\\""+v+"\\""+o+">"+l+"</button>";}' +
    'var h="",hd="";for(var i=0;i<slots.length;i++){var s=slots[i];' +
    'sel["dur#"+i]=String(s.dur||"30");sel["staff#"+i]=String(s.staff||"2");sel["room#"+i]=String(s.room||"FREEDOM");' +
    'var isC=(s.kind==="counsel");' +
    'var dp="";for(var a=0;a<DU.length;a++){dp+=pl("dur#"+i,DU[a],DU[a],"",String(DU[a])===String(s.dur));}' +
    'var STC=NR.slotStaffChoices(ST,isC);var sp="";for(var b2=0;b2<STC.length;b2++){sp+=pl("staff#"+i,STC[b2][0],STC[b2][1],STC[b2][2],STC[b2][0]===String(s.staff));}' +
    'var rp="";for(var c2=0;c2<RM.length;c2++){rp+=pl("room#"+i,RM[c2][0],RM[c2][1],RM[c2][2],RM[c2][0]===String(s.room));}' +
    'var ns="<span style=\\"display:none;margin-left:10px;color:#ff9b9b;font-weight:900;font-size:14px\\"";' +
    'hd+="<div class=\\"nrdurrow\\" data-di=\\""+i+"\\"><div class=\\"nrsec\\">"+esc(NR.durHeadText(s.label||(isC?"カウンセリング":"施術")))+"</div>"' +
    '+"<div class=\\"nrpills nrdur\\">"+dp+"</div></div>";' +
    'h+="<div class=\\"nrslot\\" data-si=\\""+i+"\\">"+(isC?("<div class=\\"nrcoswarn\\" id=\\"cosWarn"+i+"\\" style=\\"display:none\\"></div>"):"")' +
    '+"<div class=\\"nrsub\\">"+(isC?"カウンセリング担当":"施術担当")+ns+" id=\\"noneStaff"+i+"\\">その時間は担当者が空いていません</span></div><div class=\\"nrpills\\">"+sp+"</div>"' +
    '+(isC?"":("<div class=\\"nrsub\\">部屋"+ns+" id=\\"noneRoom"+i+"\\">その時間は部屋が空いていません</span></div><div class=\\"nrpills\\">"+rp+"</div>"))+"</div>";}' +
    'wrap.innerHTML=h;wrap.style.display="";' +
    'var dl=document.getElementById("nrDurList");if(dl)dl.innerHTML=hd;' +
    'buildOrderUI();}' +
    'function buildOrderUI(){var sec=document.getElementById("secOrder"),lst=document.getElementById("nrOrderList");'  +
    'if(!sec||!lst)return;var o=NR.orderRows(window.__nrSlots);' +
    'if(!o.shown){sec.style.display="none";return;}sec.style.display="";' +
    'var h="";for(var i=0;i<o.rows.length;i++){var rr=o.rows[i];h+="<div class=\\"nrorow\\"><span class=\\"nrono\\">"+rr.no+"</span><span class=\\"nroname\\">"+esc(rr.name)+"</span>"' +
    '+(rr.canUp?("<button type=\\"button\\" class=\\"nroup\\" data-up=\\""+(rr.no-1)+"\\">↑ 上へ</button>"):"")+"</div>";}lst.innerHTML=h;' +
    'var bs=lst.querySelectorAll(".nroup");for(var j=0;j<bs.length;j++){bs[j].addEventListener("click",function(){' +
    'var _y2=window.scrollY||0;' +
'var i=Number(this.getAttribute("data-up")),S2=window.__nrSlots,keep=[];' +
    'for(var k=0;k<S2.length;k++){keep.push({dur:sel["dur#"+k],staff:sel["staff#"+k],room:sel["room#"+k]});}' +
    'var mv=NR.moveUp(S2,keep,i);window.__nrSlots=mv.slots;' +
    'buildSlotUI(window.__nrSlots);if(window.__nrSchedTitle)window.__nrSchedTitle("staff");nrScheduleAvail();' +
'try{window.scrollTo(0,_y2);setTimeout(function(){window.scrollTo(0,_y2);},0);}catch(e3){}});}}' +
    'nrStartEditInit();' +
    'function jsonp(params,onR){var cb="__nr"+Date.now()+Math.floor(Math.random()*1000);window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};' +
    'var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}' +
    'var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
    'var polls=0;function poll(id){polls++;if(polls>350){szOvHide_();goEl.disabled=false;szPopup_("エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇");return;}' +
    'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){szOvHide_();goEl.disabled=false;szPopup_("エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇");return;}' +
    'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){poll(id);},600);return;}' +
    'if(r.status!=="done"){szOvHide_();goEl.disabled=false;szPopup_(esc(r.result)||"エラーが発生しました。りゅうさんに伝えてください🙇");return;}' +
    'var _tt=(String(r.result||"").match(/https?:\\/\\/\\S+/)||[""])[0];' +
    'goEl.disabled=false;txtEl.value="";szOvShow_(szDoneHtml_("予約を登録しました","予約入力に戻る",_tt),"#16a34a");var _bb=document.getElementById("szDoneBack");if(_bb){_bb.addEventListener("click",function(){location.href="' + base + '?view=yoyaku' + roleSfx_(staff, dev) + '";});}});}' +
    'var ppolls=0,prevT0=0;function pollPrev(id){ppolls++;' +
    'if(prevT0&&(Date.now()-prevT0)>210000){status("読み取りに時間がかかりすぎました。もう一度試してもらえると嬉しいです🙇",true);readEl.disabled=false;return;}' +
    'jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){status("エラー："+((r&&r.error)||"不明"),true);readEl.disabled=false;return;}' +
    'if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){' +
    'var _es=prevT0?Math.round((Date.now()-prevT0)/1000):0;' +
    'var _mg=(_es<15)?"変換中です。通常は10秒以内に終わります。"' +
    ':(_es<100)?"変換中です（"+_es+"秒）。貼り付けた内容が読み取りにくいため、AIで確認しています。数十秒かかる場合があります。"' +
    ':"変換中です（"+_es+"秒）。時間がかかっています。終わらなければ、もう一度試してもらえると嬉しいです🙇";' +
    'status(_mg,false);' +
    'setTimeout(function(){pollPrev(id);},700);return;}readEl.disabled=false;' +
    'if(r.status!=="done"){status(esc(r.result||"エラーが発生しました。"),true);return;}' +
    'var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}' +
    'if(!d.ok){status("読み取れませんでした："+esc(d.error||"日付・時刻が見つかりません"),true);return;}' +
    'var _fx=NR.fixNotice(d.memo||"");' +
    'prevEl.value=_fx.memo;selVal("dur",d.dur);if(d.staff)selVal("staff",d.staff);if(d.room)selVal("room",d.room);window.__rvdt={mm:d.mm,dd:d.dd,hh:d.hh,mi:d.mi};' +
    'window.__nrHasProcell=NR.procellAsk(_fx.memo).ask;window.__procellWord=d.procell_face_word||"トライアル";var _pp=document.querySelector(\'[data-procell="顔プロセルPro"]\');if(_pp)_pp.textContent="顔プロセルPro "+window.__procellWord;var _pm=document.querySelector(\'[data-procell="顔プロセルMD"]\');if(_pm)_pm.textContent="顔プロセルMD "+window.__procellWord;window.__nrCouns=d.counseling||{kind:"3",hint:false,memos:{}};' +
    'var _cv=NR.counselingView(window.__nrCouns.kind,window.__nrCouns.hint,window.__nrCouns.has_hair);' +
    'window.__nrHasCouns=_cv.shown;window.__nrApplyCouns(_cv);' +
    'window.__nrReadGender=d.gender||"";window.__nrReadTw=d.tw||"";' +
    'var sg=document.getElementById("secGender"),stw=document.getElementById("secTw");' +
    'if(d.gender){selVal("gender",d.gender);if(sg)sg.style.display="none";}else if(sg)sg.style.display="";' +  
    'if(d.tw){selVal("tw",d.tw);if(stw)stw.style.display="none";}else if(stw)stw.style.display="";' +          
    'var scn=document.getElementById("secCounsel");if(scn)scn.style.display=d.datsumo?"":"none";' +            
    'window.__nrDate=d.date||"";window.__nrWd=d.weekday||"";window.__nrNeedCounsel=!!d.need_counsel;window.__nrTimeMissing=!!d.time_missing;' +
    'window.__nrService=d.service||"";window.__nrIsNew=!!d.is_new;window.__nrSlotsMemo=_fx.memo;' +
    'window.__nrMayu=(d.service_kind==="mayu"||d.service_kind==="matsuek");window.__nrSat=d.date?(new Date(d.date+"T00:00:00").getDay()===6):false;' +
    'window.__nrSlotsBase=[];for(var _b=0;_b<((d.slots||[]).length);_b++){var _o={},_s0=d.slots[_b];for(var _k0 in _s0){_o[_k0]=_s0[_k0];}window.__nrSlotsBase.push(_o);}' +
    'selVal("needc","yes");nrShowStart();buildSlotUI(d.slots);window.__nrCounsSlots(window.__nrCouns.kind);nrApplyNeedC();applyAvail(d);' +   

    'var _shown=false;function _showAll(){if(_shown)return;_shown=true;nrApplyNeedC();' +
    'window.__nrSteps=NR.stepList(window.__nrHasProcell,window.__nrHasCouns,NR.needGenderStep(d.gender,d.tw),nrStepOpts());nrShowStep(1);' +
    'status("",false);}' +                                                           
    'titleEdited=false;'+'if(d.titles&&d.titles.length){fillTitles(d.titles,d.disps||[]);_showAll();}'+'else{setTimeout(_showAll,20000);refreshTitles(_showAll);}});}' +
    'prevEl.addEventListener("input",function(){prevEl.style.height="auto";prevEl.style.height=(prevEl.scrollHeight+6)+"px";nrGoCheck();});' +
    'var _ob=["nrProcellOk","nrTimeOk","nrRestOk","nrGenderOk","nrNeedcOk","nrOrderOk","nrDurOk","nrSlotOk"];' +
    "var _cok=document.getElementById(\"nrCounsOk\");if(_cok)_cok.addEventListener(\"click\",nrNext);" +
    "var _mok=document.getElementById(\"nrMemoOk\");if(_mok)_mok.addEventListener(\"click\",nrMemoNext);" +
    'for(var _oi=0;_oi<_ob.length;_oi++){var _o=document.getElementById(_ob[_oi]);if(_o)_o.addEventListener("click",nrNext);}' +
    'var _rbs=document.querySelectorAll("[data-raw]");' +
    'for(var _ri=0;_ri<_rbs.length;_ri++){_rbs[_ri].addEventListener("click",function(){szPopup_((txtEl.value||"").trim()||"貼り付けた内容がありません。",{icon:"📄"});});}' +
    'var _bk=document.getElementById("nrBack");' +
    'if(_bk)_bk.addEventListener("click",function(ev){if((window.__nrStepI||0)>0){ev.preventDefault();nrPrev();}});' +
    'window.__nrApplyCouns=function(v){var box=document.getElementById("nrCounsAsk");if(!box)return;var lb=document.getElementById("nrCounsLabel");if(lb)lb.textContent=v.label;' +
    'var bs=document.querySelectorAll("[data-couns]");for(var i=0;i<bs.length;i++){if(bs[i].getAttribute("data-couns")===String(v.sel))bs[i].classList.add("sel");else bs[i].classList.remove("sel");}};' +
    'window.__nrCounsSlots=function(kind){if(!window.__nrSlotsBase)return;var B=[];for(var _i2=0;_i2<window.__nrSlotsBase.length;_i2++){var _o2={},_s2=window.__nrSlotsBase[_i2];for(var _k2 in _s2){_o2[_k2]=_s2[_k2];}B.push(_o2);}buildSlotUI(NR.counselingSlots(B,kind));nrApplyNeedC();nrSlotAvail();};' +
    'var _cab=document.querySelectorAll("[data-couns]");for(var _j=0;_j<_cab.length;_j++){_cab[_j].addEventListener("click",function(){var k=this.getAttribute("data-couns"),c=window.__nrCouns||{memos:{}};prevEl.value=NR.counselingMemo(c.memos,k,prevEl.value);prevEl.style.height="auto";prevEl.style.height=(prevEl.scrollHeight+6)+"px";c.kind=k;window.__nrApplyCouns(NR.counselingView(k,true,(window.__nrCouns?window.__nrCouns.has_hair:true)));window.__nrCounsSlots(k);window.__nrSlotsMemo=prevEl.value;if(window.__nrRebuildSteps)window.__nrRebuildSteps();nrGoCheck();if(window.__nrSchedTitle){titleEdited=false;window.__nrSchedTitle("staff");}});}' +
    'var _pab=document.querySelectorAll("[data-procell]");for(var _i=0;_i<_pab.length;_i++){_pab[_i].addEventListener("click",function(){var base=this.getAttribute("data-procell");var tw=(base==="頭皮プロセル")?"トライアル":(window.__procellWord||"トライアル");var sh=(base==="頭皮プロセル")?"プロ頭":(base==="顔プロセルPro"?"プロ肌Pro":"プロ肌MD");var full=sh+" "+tw.replace("キャンペーン","キャ").replace("トライアル","トラ");var lines=prevEl.value.split("\\n");for(var k=0;k<lines.length;k++){lines[k]=lines[k].replace(/(?:(?:顔|頭皮)?プロセル(?:セラピーズ)?|procell|プロ肌|プロ頭|プロ(?!グラム))(?:[ \\u3000]*(?:キャンペーントライアル|トライアル|キャトラ|トラ))?/gi,full);}prevEl.value=lines.join("\\n");prevEl.style.height="auto";prevEl.style.height=(prevEl.scrollHeight+6)+"px";' +
    'for(var _q=0;_q<_pab.length;_q++){_pab[_q].classList.toggle("sel",_pab[_q]===this);}' +
    'window.__nrSlotsMemo=prevEl.value;' +          
    'nrGoCheck();if(window.__nrSchedTitle){titleEdited=false;window.__nrSchedTitle("staff");}});}' +
    'function readGo(){var text=(txtEl.value||"").trim();if(!text){status("先に予約フォームを貼り付けてね😊",true);return;}' +
    'readEl.disabled=true;prevT0=Date.now();status("変換中です。通常は10秒以内に終わります。",false);' +
    'jsonp({action:"submit",key:KEY,op:"preview_reservation",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({text:text})},' +
    'function(r){if(!r||!r.ok||!r.id){status("依頼を送れませんでした："+((r&&r.error)||"不明"),true);readEl.disabled=false;return;}setTimeout(function(){pollPrev(r.id);},400);});}' +
    'readEl.addEventListener("click",readGo);' +
    'function buildFields(extra){var sl=null,S=window.__nrSlots;' +
    'if(S&&S.length>=2){sl=[];for(var q=0;q<S.length;q++){if(S[q].kind==="counsel"&&sel.needc==="no")continue;' +
    'sl.push({kind:(S[q].kind||"treat"),mark:(S[q].mark||""),label:(S[q].label||""),dur:sel["dur#"+q],staff:sel["staff#"+q],room:sel["room#"+q]});}if(sl.length<2)sl=null;}' +
    'var t0=null;if(sl){for(var w=0;w<sl.length;w++){if(sl[w].kind!=="counsel"){t0=sl[w];break;}}if(!t0)t0=sl[0];}' +
    'var _cs=(sel.needc==="no")?"":(NR.onlyCounselSlot(S)?(sel["staff#0"]||sel.counsel):sel.counsel);' +
    'var f={text:(txtEl.value||"").trim(),memo:(prevEl.value||""),dur:(t0?t0.dur:sel.dur),staff:(t0?t0.staff:sel.staff),counsel:_cs,room:(t0?t0.room:sel.room),gender:sel.gender,tw:sel.tw,rvdt:(window.__rvdt||null)};' +
    'if(sl)f.slots=JSON.stringify(sl);' +
    'if(extra){for(var k in extra){f[k]=extra[k];}}return f;}' +
    'var titleEdited=false,titleReq=0,_titleTimer=null,titleStale=false,_titleKeep=null,_titleErr="";' +
    'function fillTitles(titles,disps){var wrap=document.getElementById("nrTitleWrap"),sec=document.getElementById("secTitle");if(!wrap||!sec)return;' +
    'if(!NR.titleView(window.__nrCanReg).shown){_titleKeep={t:titles,d:disps};sec.style.display="none";titleStale=false;nrGoCheck();return;}' +
    '_titleKeep=null;' +
    'var rows="";for(var i=0;i<titles.length;i++){rows+=\'<div style="color:#eaf3f7;font-weight:800;font-size:14px;margin:8px 2px 2px">\'+esc(disps[i]||("枠"+(i+1)))+\'</div><input class="nrTitleIn" value="\'+esc(titles[i]).replace(/"/g,"&quot;")+\'" style="width:100%;box-sizing:border-box;font:inherit;font-size:18px;font-weight:800;color:#0f172a;background:#fff;border:0;border-radius:12px;padding:14px 14px;margin:6px 0;box-shadow:0 2px 6px rgba(0,0,0,.12)">\';}wrap.innerHTML=rows;sec.style.display="";titleStale=false;var ins=wrap.querySelectorAll(".nrTitleIn");for(var j=0;j<ins.length;j++){ins[j].addEventListener("input",function(){titleEdited=true;});}nrGoCheck();}' +
    'var _titleBusy=false,_titleAgain=false,_titleCbs=[];' +
    'function _titleDone(cb){_titleBusy=false;if(cb)cb();var cs=_titleCbs;_titleCbs=[];for(var i=0;i<cs.length;i++){try{cs[i]();}catch(e){}}if(_titleAgain){_titleAgain=false;refreshTitles();}}' +
    'function _titleFail(myReq,msg){if(myReq===titleReq&&!titleEdited){_titleErr=msg;titleStale=false;nrGoCheck();}}' +
    'function pollTitles(id,myReq,cb,n){n=(n||0)+1;if(n>LIMITS.tries("preview_new_titles",400)){_titleFail(myReq,"時間がかかりすぎました");_titleDone(cb);return;}jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok||r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollTitles(id,myReq,cb,n);},400);return;}if(r.status!=="done"){_titleFail(myReq,"途中で止まりました");_titleDone(cb);return;}var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}if(!d||!d.ok){_titleFail(myReq,(d&&d.error)?String(d.error):"わけが分かりません");_titleDone(cb);return;}if(myReq!==titleReq||titleEdited){_titleDone(cb);return;}window.__nrPlanPrev=d;fillTitles(d.titles||[],d.disps||[]);_titleDone(cb);});}' +
    'function refreshTitles(cb,force){if(titleEdited){if(cb)cb();return;}var text=(txtEl.value||"").trim();if(!text&&!(prevEl.value||"").trim()){if(cb)cb();return;}if(_titleBusy){if(cb)_titleCbs.push(cb);if(force){_titleAgain=true;++titleReq;}return;}_titleBusy=true;var myReq=++titleReq;jsonp({action:"submit",key:KEY,op:"preview_new_titles",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(buildFields())},function(r){if(!r||!r.ok||!r.id){_titleFail(myReq,"送れませんでした");_titleDone(cb);return;}setTimeout(function(){pollTitles(r.id,myReq,cb,0);},400);});}' +
    'function markTitleStale(){titleStale=true;_titleKeep=null;_titleErr="";window.__nrPlanPrev=null;var w=document.getElementById("nrTitleWrap");' +
    'if(w)w.innerHTML=\'<div class="nrnote2">タイトルを作っています…</div>\';' +
    'var s=document.getElementById("secTitle");if(s&&NR.titleView(window.__nrCanReg).shown)s.style.display="";' +
    'nrGoCheck();}' +
    'function scheduleTitleRefresh(g){var k=String(g||"").split("#")[0];' +
    'if(["staff","counsel","gender","tw","room"].indexOf(k)<0)return;markTitleStale();' +
    'if(_titleTimer)clearTimeout(_titleTimer);_titleTimer=setTimeout(function(){refreshTitles(null,true);},350);}' +
    'window.__nrSchedTitle=scheduleTitleRefresh;' +
    'function go(){var text=(txtEl.value||"").trim();if(!text){status("予約フォームを貼り付けてね😊",true);return;}' +
    'var ins=document.querySelectorAll(".nrTitleIn"),ts=[];for(var j=0;j<ins.length;j++){ts.push(ins[j].value);}' +
    'goEl.disabled=true;szOvShow_(szBusyHtml_("予約を登録中です"),"#2C7A99");' +
    'jsonp({action:"submit",key:KEY,op:"new_reservation",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(buildFields(ins.length?{titles:JSON.stringify(ts)}:null))},' +
    'function(r){if(!r||!r.ok||!r.id){szOvHide_();goEl.disabled=false;szPopup_("エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇");return;}setTimeout(function(){poll(r.id);},1200);});}' +
    'function esch(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}' +
    'function nrRoomName(k){if(!k)return "";if(String(k).toUpperCase()==="COSMOS")return "コスモス";' +
    'var b=document.querySelector(".nrpill[data-grp=\\"room\\"][data-val=\\""+k+"\\"]");return b?b.textContent:k;}' +
    'function nrConfirm(d){var ins=document.querySelectorAll(".nrTitleIn"),sl=d.slots||[],out=[NR.dateText(window.__rvdt,window.__nrWd)];' +
    'if(!sl.length){for(var q=0;q<(d.titles||[]).length;q++)sl.push({disp:(d.disps||[])[q]});}' +   
    'for(var j=0;j<sl.length;j++){var x=sl[j];out.push("");' +
    'out.push("■ "+(x.start?(x.start+"～"+(x.end||"")+"　"):"")+(x.disp||("枠"+(j+1))));' +
    'out.push("タイトル："+(ins[j]?ins[j].value:((d.titles||[])[j]||"")));' +
    'var rn=nrRoomName(x.room);if(rn)out.push("部屋："+rn);}' +
    'szPopup_("<div style=\\"font-size:1.15rem;line-height:1.5;font-weight:800\\">以下の内容を、タイムツリーに登録してよろしいでしょうか？😊</div>"' +
    '+"<div style=\\"font-size:.95rem;line-height:1.6;text-align:left;margin-top:14px;white-space:pre-wrap;font-weight:700\\">"+esch(out.join("\\n"))+"</div>"' +
    '+(d.memo?("<div style=\\"font-size:.9rem;text-align:left;margin-top:12px;font-weight:800\\">■ 予約メモ（タイムツリーのメモ欄に入ります）</div>"' +
    '+"<div style=\\"font-size:.85rem;line-height:1.5;text-align:left;margin-top:4px;white-space:pre-wrap;max-height:32vh;overflow:auto;background:rgba(255,255,255,.08);border-radius:8px;padding:8px 10px\\">"+esch(d.memo)+"</div>"):""),' +
    '{icon:"",isHtml:true,yesLabel:"OK",noLabel:"やめる",cancel:true,onYes:go});}' +
    'function nrAskPlan(){szOvShow_(szBusyHtml_("登録する内容を確認しています"),"#2C7A99");' +
    'jsonp({action:"submit",key:KEY,op:"preview_new_titles",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(buildFields())},function(r){' +
    'if(!r||!r.ok||!r.id){szOvHide_();szPopup_("登録する内容を確認できませんでした（送れませんでした）。もう一度試してもらえると嬉しいです🙇");return;}var n=0;' +
    '(function pp(){n++;if(n>LIMITS.tries("preview_new_titles",700)){szOvHide_();szPopup_("登録する内容を確認できませんでした（時間がかかりすぎました）。もう一度試してもらえると嬉しいです🙇");return;}' +
    'jsonp({action:"status",key:KEY,id:r.id},function(x){if(!x||!x.ok||x.status==="pending"||x.status==="running"||x.status==="queued"||x.status===""){setTimeout(pp,700);return;}' +
    'var d={};try{d=JSON.parse(x.result||"{}");}catch(e){}szOvHide_();' +
    'if(x.status!=="done"||!d||!d.ok){szPopup_("登録する内容を確認できませんでした（"+esch((d&&d.error)||"途中で止まりました")+"）。もう一度試してもらえると嬉しいです🙇");return;}' +
    'window.__nrPlanPrev=d;nrConfirm(d);});})();});}' +
    'goEl.addEventListener("click",function(){var d=window.__nrPlanPrev;' +
    'if(d&&d.slots&&!titleStale){nrConfirm(d);return;}nrAskPlan();});' +
    '})();</script>';
  return '<style>' + HOMECSS_ + css + '</style>' +
    '<div class="home">' +
    '<div class="ubar"><a class="uhome" id="nrBack" href="' + base + '?view=yoyaku' + roleSfx_(staff, dev) + '" target="_top">← 戻る</a></div>' +
    '<div class="hhead"><span class="bmark">📝</span><span class="bname">新規予約入力</span></div>' +
    '<div class="nr">' +
      '<div id="nrStep1">' +
        '<div class="nrnote">お客様から送られた"お客様情報"を、下の欄にそのまま貼って完了ボタンを押すと、自動で予約メモの形式に変換されます</div>' +
        '<div class="nrsec">予約フォームを貼る</div>' +
        '<textarea id="nrtext" placeholder="予約フォームの内容をここに貼り付け"></textarea>' +
        '<button type="button" class="nrread" id="nrread">貼り付け完了（読み取る）</button>' +
      '</div>' +
      '<div id="nrStepProcell" style="display:none">' +
        '<div id="nrProcellAsk">' +
          '<div style="background:#7f1d1d;color:#fecaca;padding:12px 14px;border-radius:12px;font-weight:900;line-height:1.6;margin:6px 0">プロセルは どれですか？　下から選択してね😊</div>' +
          '<div class="nrpills">' +
            '<button type="button" class="nrpill" data-procell="顔プロセルPro" style="background:#2563eb">顔プロセルPro</button>' +
            '<button type="button" class="nrpill" data-procell="顔プロセルMD" style="background:#0891b2">顔プロセルMD</button>' +
            '<button type="button" class="nrpill" data-procell="頭皮プロセル" style="background:#7c3aed">頭皮プロセル</button>' +
          '</div>' +
        '</div>' +
        '<div id="nrProcellNg" class="nrwarn" style="display:none"></div>' +
        '<button type="button" class="nrgo" id="nrProcellOk">これでOK</button>' +
      '</div>' +
      '<div id="nrStepCouns" style="display:none">' +
        '<div id="nrCounsAsk">' +
          '<div id="nrCounsLabel" class="nrsec"></div>' +
          '<div class="nrpills">' +
            '<button type="button" class="nrpill plain" data-couns="1">①カウンセリングのみ（施術なし）</button>' +
            '<button type="button" class="nrpill plain" data-couns="2">②カウンセリング後に決める</button>' +
            '<button type="button" class="nrpill plain" data-couns="3">③施術もやる</button>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="nrgo" id="nrCounsOk">これでOK</button>' +
      '</div>' +
      '<div id="nrprevwrap" style="display:none">' +
        '<div class="nrsec">以下の予約メモで間違いがないか確認してね😊 メモは直接編集可能です。</div>' +
        '<div id="nrFixRow" class="nrfixrow" style="display:none">' +
          '<div id="nrFixRed" class="nrfixred"></div>' +
          '<button type="button" class="nrrawbtn" data-raw="1">お客様情報を確認</button>' +
        '</div>' +
        '<textarea id="nrprev"></textarea>' +
        '<button type="button" class="nrgo" id="nrMemoOk">予約メモはこれでOK</button>' +
      '</div>' +
      '<div id="nrStep3" style="display:none">' +
        '<div class="nrsec">開始時間</div>' +
        '<div id="nrStartRow" style="display:flex;align-items:center;gap:12px;background:#fff;color:#123;border-radius:12px;padding:12px 14px;font-size:19px;font-weight:900;margin:2px 0 6px">' +
          '<span id="nrStartDisp">―</span>' +
          '<button type="button" id="btnStartFix" style="border:0;border-radius:999px;padding:9px 18px;font-size:15px;font-weight:800;color:#fff;background:#2C7A99">修正</button>' +
        '</div>' +
        '<div id="nrStartEdit" style="display:none;align-items:center;gap:6px;flex-wrap:wrap;background:#fff;border-radius:12px;padding:12px 14px;margin:2px 0 6px">' +
          '<input type="number" id="nrEdMM" min="1" max="12" placeholder="月" style="width:70px;font-size:18px;font-weight:800;padding:8px;border-radius:10px;border:1px solid #cbd5e1;text-align:center"><span style="color:#123;font-weight:900;margin-right:6px">月</span>' +
          '<input type="number" id="nrEdDD" min="1" max="31" placeholder="日" style="width:70px;font-size:18px;font-weight:800;padding:8px;border-radius:10px;border:1px solid #cbd5e1;text-align:center"><span style="color:#123;font-weight:900;margin-right:6px">日</span>' +
          '<input type="number" id="nrEdHH" min="0" max="23" placeholder="時" style="width:70px;font-size:18px;font-weight:800;padding:8px;border-radius:10px;border:1px solid #cbd5e1;text-align:center"><span style="color:#123;font-weight:900;margin-right:6px">時</span>' +
          '<input type="number" id="nrEdMI" min="0" max="59" step="5" placeholder="分" style="width:70px;font-size:18px;font-weight:800;padding:8px;border-radius:10px;border:1px solid #cbd5e1;text-align:center"><span style="color:#123;font-weight:900;margin-right:6px">分</span>' +
          '<button type="button" id="btnStartOk" style="border:0;border-radius:999px;padding:9px 18px;font-size:15px;font-weight:800;color:#fff;background:#16a34a">決定</button>' +
          '<button type="button" id="btnStartCancel" style="border:0;border-radius:999px;padding:9px 18px;font-size:15px;font-weight:800;color:#fff;background:#64748b">やめる</button>' +
        '</div>' +
        '<div id="nrTimeNg" class="nrwarn" style="display:none"></div>' +
        '<div class="nrrawrow"><button type="button" class="nrrawbtn" data-raw="1">お客様情報を確認</button></div>' +
        '<button type="button" class="nrgo" id="nrTimeOk">この時間でOK</button>' +
      '</div>' +
      '<div id="nrStepNeedc" style="display:none">' +
        '<div id="secNeedC"><div class="nrsec">カウンセリングの必要</div><div class="nrpills">' +
          '<button type="button" class="nrpill sel" data-grp="needc" data-val="yes" style="background:#16a34a">必要あり</button>' +
          '<button type="button" class="nrpill" data-grp="needc" data-val="no" style="background:#475569">必要なし</button>' + '</div></div>' +
        '<button type="button" class="nrgo" id="nrNeedcOk">これでOK</button>' +
      '</div>' +
      '<div id="nrStepOrder" style="display:none">' +
        '<div id="secOrder"><div class="nrsec">やる順番（上から順にやります）</div>' +
        '<div class="nrnote2">順番を変更したい項目の「↑ 上へ」を押してね😊</div><div id="nrOrderList"></div></div>' +
        '<button type="button" class="nrgo" id="nrOrderOk">これでOK</button>' +
      '</div>' +
      '<div id="nrStepDur" style="display:none">' +
        '<div id="secDurWrap"><div class="nrsec" id="nrDurHead1">所要時間（分）</div><div class="nrpills nrdur">' + durPills + '</div></div>' +
        '<div id="nrDurList"></div>' +
        '<button type="button" class="nrgo" id="nrDurOk">これでOK</button>' +
      '</div>' +
      '<div id="nrStepSlot" style="display:none">' +
        '<div class="nrsec" id="nrSlotHead"></div>' +
        '<div id="nrSlotWrap"></div>' +
        '<div id="nrSlotNg" class="nrwarn" style="display:none"></div>' +
        '<button type="button" class="nrgo" id="nrSlotOk">これでOK</button>' +
      '</div>' +
      '<div id="nrrest" style="display:none">' +
        '<div class="nrsec" id="nrRestHead"></div>' +
        '<div id="secCounsel" style="display:none"><div class="nrsec">カウンセリング担当' +
          '<span id="noneCounsel" style="display:none;margin-left:12px;color:#ff9b9b;font-weight:900;font-size:15px">その時間は担当者が空いていません</span></div>' +
          '<div class="nrpills">' + staffPills('counsel', '2', ['1', '2']) + '</div></div>' +
        '<div id="cosmosWarn" style="display:none;background:#fde2e4;color:#9b1c31;padding:12px 14px;border-radius:12px;font-weight:900;line-height:1.6;margin:2px 0 6px;white-space:pre-line"></div>' +
        '<div id="secStaffWrap"><div class="nrsec">施術担当<span id="noneStaff" style="display:none;margin-left:12px;color:#ff9b9b;font-weight:900;font-size:15px">その時間は担当者が空いていません</span></div><div class="nrpills">' + staffPills('staff', '2') + '</div></div>' +
        '<div id="nrRoomWrap"><div class="nrsec">部屋<span id="noneRoom" style="display:none;margin-left:12px;color:#ff9b9b;font-weight:900;font-size:15px">その時間は部屋が空いていません</span></div><div class="nrpills">' + roomPills + '</div></div>' +
        '<div id="nrRestNg" class="nrwarn" style="display:none"></div>' +
        '<button type="button" class="nrgo" id="nrRestOk">これでOK</button>' +
      '</div>' +
      '<div id="nrStepGender" style="display:none">' +
        '<div id="secGender"><div class="nrsec">性別（タイトルに入ります）</div><div class="nrpills">' + genderPills + '</div></div>' +
        '<div id="secTw"><div class="nrsec">国籍</div><div class="nrpills">' + natPills + '</div></div>' +
        '<div id="nrGenderNg" class="nrwarn" style="display:none"></div>' +
        '<button type="button" class="nrgo" id="nrGenderOk">これでOK</button>' +
      '</div>' +
      '<div id="nrStepTitle" style="display:none">' +
        '<div id="secTitle" style="display:none"><div class="nrsec">タイムツリーに登録されるタイトル（修正できます）</div><div id="nrTitleWrap"></div></div>' +
        '<div id="nrGoNg" class="nrwarn" style="display:none"></div>' +
        '<button type="button" class="nrgo" id="nrgo">タイムツリーに登録する</button>' +
      '</div>' +
      '<div class="nrstatus" id="nrstatus"></div>' +
    '</div>' +
  '</div>' +
  script;
}
