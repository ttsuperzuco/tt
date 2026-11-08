// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：akijikan
function renderAkijikanError_(err, base, staff, dev) {
  return '<style>' + HOMECSS_ + '</style>' +
  '<div class="home">' +
    backBar_(base, staff, dev) +
    '<div class="hhead"><span class="bmark">🕑</span><span class="bname">空き時間検索</span></div>' +
    '<div class="soon">' +
      '<div class="soonic">📄</div>' +
      '<div class="soontitle" style="font-size:1.4rem">データ未生成</div>' +
      '<div class="soondesc">' + esc_(err && err.message ? err.message : err) + '</div>' +
    '</div>' +
  '</div>';
}
function akiStaffColor_(emoji) {
  var p = { '🫒': '#4b8b3b', '🍊': '#e08a1e', '🍅': '#d1443c', '🥭': '#c9a227' };
  return p[emoji] || '#666';
}
function akiSlotChip_(sl) {
  return '<span class="akislot" data-dur="' + sl.dur + '">' + esc_(sl.s) + '-' + esc_(sl.e) + '<b>(' + sl.dur + '分)</b></span>';
}
function akiTimeRows_(slots) {
  if (!slots || !slots.length) return '<div class="akinone">空きなし</div>';
  return slots.map(function (sl) {
    var badge = '<span class="akibadge" style="background:' + akiStaffColor_(sl.emoji) + '">' +
      esc_(sl.emoji) + ' ' + esc_(sl.name) + '</span>';
    var rooms = (sl.rooms || []).length
      ? sl.rooms.map(function (r) {
          return '<span class="akiroom" style="background:' + roomColor_(r) + '">' + esc_(r) + '</span>';
        }).join('')
      : '<span class="akinorooms">空き部屋なし</span>';
    return '<div class="akirow" data-dur="' + sl.dur + '">' +
      '<span class="akitime">' + esc_(sl.s) + '-' + esc_(sl.e) + '</span>' +
      '<span class="akidur">' + sl.dur + '分</span>' + badge +
      '<span class="akirooms">' + rooms + '</span>' +
    '</div>';
  }).join('');
}
function akiStaffRows_(staffList) {
  if (!staffList || !staffList.length) return '<div class="akinone">出勤スタッフなし</div>';
  return staffList.map(function (s) {
    var badge = '<span class="akibadge" style="background:' + akiStaffColor_(s.emoji) + '">' +
      esc_(s.emoji) + ' ' + esc_(s.name) + '</span>';
    var chips = (s.slots || []).length
      ? s.slots.map(akiSlotChip_).join('')
      : '<span class="akinone">空きなし</span>';
    return '<div class="akirow">' + badge +
      '<span class="akishift">出勤' + esc_(s.shift) + esc_(s.note || '') + '</span>' + chips +
    '</div>';
  }).join('');
}
function akiRoomRows_(roomsFree) {
  if (!roomsFree || !roomsFree.length) return '<div class="akinone">データなし</div>';
  return roomsFree.map(function (r) {
    var badge = '<span class="akiroom lg" style="background:' + roomColor_(r.room) + '">' + esc_(r.room) + '</span>';
    var chips = (r.slots || []).length
      ? r.slots.map(akiSlotChip_).join('')
      : '<span class="akinone">空きなし</span>';
    return '<div class="akirow">' + badge + chips + '</div>';
  }).join('');
}
function akiDayCard_(day) {
  var dattr = ' data-date="' + esc_(day.date || '') + '"';
  if (day.kind === 'closed') {
    return '<div class="akiday"' + dattr + '><div class="akidh">📅 ' + esc_(day.dh) + '</div>' +
      '<div class="akiclosed">' + esc_(day.label) + '</div></div>';
  }
  if (day.empty) {
    return '<div class="akiday"' + dattr + '><div class="akidh">📅 ' + esc_(day.dh) + '</div>' +
      '<div class="akinone">（出勤スタッフなし）</div></div>';
  }
  return '<div class="akiday"' + dattr + '>' +
    '<div class="akidh">📅 ' + esc_(day.dh) + '</div>' +
    '<div class="akisec akisec-full" data-sec="full">' +
      akiFullCard_(day) +
    '</div>' +
    '<div class="akisec akisec-time akihidden" data-sec="time">' +
      akiTimeRows_(day.time_slots) +
    '</div>' +
    '<div class="akisec akisec-staff akihidden" data-sec="staff">' +
      akiStaffRows_(day.staff) +
    '</div>' +
    '<div class="akisec akisec-rooms akihidden" data-sec="rooms">' +
      akiRoomRows_(day.rooms_free) +
    '</div>' +
  '</div>';
}
function renderAkijikanPage_(d, base, staff, dev) {
  var days = d.days || [];
  var cards = days.length
    ? days.map(akiDayCard_).join('\n')
    : '<div class="akinone">データがありません</div>';
  var wakuOn = !!dev && !staff;
  var wakuData = wakuOn
    ? '<script>var AKIWAKU_=' + JSON.stringify(d.waku || []) + ';</scr' + 'ipt>'
    : '';

  return '' +
'<style>' + AKICSS_ + '</style>' +
'<div class="akiwrap">' +
  '<div class="akibar">' +
    '<a class="akihome" href="' + (base || '') + '?view=home' + roleSfx_(staff, dev) + '" target="_top">← 戻る</a>' +
    '<span class="akigen">生成: ' + esc_(d.generated_at || '—') + '</span>' +
  '</div>' +
  '<h1>🕑 空き時間検索</h1>' +
  '<div class="akidatebar">' +
    '<div class="akidaterow">' +
      '<input type="text" readonly class="akidate" id="akiFrom" placeholder="日付で選ぶ"' +
        ' min="' + esc_(d.date_from || '') + '" max="' + esc_(d.date_to || '') + '">' +
      '<button type="button" class="akipreset on" data-preset="thisweek">今週</button>' +
      '<button type="button" class="akipreset" data-preset="thisnext">今・来週</button>' +
      '<button type="button" class="akipreset" data-preset="all">全期間</button>' +
    '</div>' +
    '<div class="akiwdrow">' +
      '<button type="button" class="akiwd on" data-wd="all">全て</button>' +
      '<button type="button" class="akiwd" data-wd="2">火</button>' +
      '<button type="button" class="akiwd" data-wd="3">水</button>' +
      '<button type="button" class="akiwd" data-wd="4">木</button>' +
      '<button type="button" class="akiwd" data-wd="5">金</button>' +
      '<button type="button" class="akiwd" data-wd="6">土</button>' +
    '</div>' +
    '<div class="akidurrow">' +
      '<button type="button" class="akidurbtn on" data-dur="all">全部</button>' +
      '<button type="button" class="akidurbtn" data-dur="30">30分</button>' +
      '<button type="button" class="akidurbtn" data-dur="60">60分</button>' +
      '<button type="button" class="akidurbtn" data-dur="120">120分</button>' +
    '</div>' +
  '</div>' +
  '<div class="akichips">' +
    '<button type="button" class="akichip on" data-sec="full">完全版</button>' +
    '<button type="button" class="akichip" data-sec="time">各時間帯別</button>' +
    '<button type="button" class="akichip" data-sec="staff">スタッフ別</button>' +
    '<button type="button" class="akichip" data-sec="rooms">施術室別</button>' +
    (wakuOn ? '<button type="button" class="akichip akiwakubtn" data-sec="waku">予約枠出力（全）</button>' +
      '<button type="button" class="akichip akiwakubtn" data-sec="wakunv">予約枠出力（VIO以外を除く）</button>' : '') +
  '</div>' +
  '<div id="akidays">' + cards + '</div>' +
  (wakuOn ? '<div id="akiwakubox" class="akiwakubox akihidden"></div>' : '') +
  '<div class="akinone" id="akiDateEmpty" hidden>この期間には表示できるデータがありません。期間を変更してね😊</div>' +
'</div>' +
wakuData +
AKISCRIPT_;
}
var AKISCRIPT_ =
'<script>(function(){' +
'var chips=[].slice.call(document.querySelectorAll(".akichip"));' +
'var wakuBox=document.getElementById("akiwakubox");' +
'var daysBox=document.getElementById("akidays");' +
'var WKINDS=["新規男性","既存男性","新規女性","既存女性"];' +
'var WCOL={"新規男性":"#2563eb","既存男性":"#1e3a8a","新規女性":"#db2777","既存女性":"#831843"};' +
'var WGROUPS=[{flag:"🇯🇵",zh:false},{flag:"🇹🇼",zh:true}];' +
'function wakuLines_(list){' +
'  var lines=[], cur=null;' +
'  list.forEach(function(x){' +
'    var m=String(x).match(/^(\\d{1,2}:\\d{2})(.*)$/); var t=m?m[1]:String(x), tag=m?m[2]:"";' +
'    if(cur&&cur.tag===tag) cur.ts.push(t); else { cur={tag:tag,ts:[t]}; lines.push(cur); }' +
'  });' +
'  return lines.map(function(g){ return g.ts.join(" / ")+g.tag; });' +
'}' +
'var wakuNoVio=false;' +
'function wakuToday_(){var n=new Date();return n.getFullYear()+"-"+("0"+(n.getMonth()+1)).slice(-2)+"-"+("0"+n.getDate()).slice(-2);}' +
'function wakuList_(w,kind,zh){' +
'  var src=zh ? (w["枠_zh"]||w["枠"]) : w["枠"];' +
'  var list=(src||{})[kind]||[];' +
'  if(wakuNoVio){' +
'    var vs=zh ? w["枠_zh_VIO"] : w["枠_VIO"];' +
'    if(vs && vs[kind]) list=vs[kind];' +
'    else list=list.filter(function(x){ return !/（VIO以外）|（VBO除外）/.test(String(x)); });' +
'  }' +
'  if(w.date===wakuToday_()){' +
'    var n=new Date(), cut=n.getHours()*60+n.getMinutes();' +
'    list=list.filter(function(x){ var m=String(x).match(/^(\\d{1,2}):(\\d{2})/); return !m || (m[1]*60+(+m[2]))>=cut; });' +
'  }' +
'  return list;' +
'}' +
'function wakuRows_(kind,zh){' +
'  var out=[];' +
'  (window.AKIWAKU_||[]).forEach(function(w){' +
'    if(!dateVisible_(w.date)) return;' +
'    var list=wakuList_(w,kind,zh);' +
'    if(!list.length) return;' +
'    out.push({dh:(zh ? (w.dh_zh||w.dh) : w.dh), lines:wakuLines_(list)});' +
'  });' +
'  return out;' +
'}' +
'function wakuText_(kind,zh){' +
'  return wakuRows_(kind,zh).map(function(r){ return r.dh+"\\n"+r.lines.join("\\n"); }).join("\\n");' +
'}' +
'function wakuKey_(kind,zh){' +
'  var out=[];' +
'  (window.AKIWAKU_||[]).forEach(function(w){' +
'    if(!dateVisible_(w.date)) return;' +
'    var list=wakuList_(w,kind,zh);' +
'    if(list.length) out.push(w.date+"="+list.join(","));' +
'  });' +
'  return out.join("|");' +
'}' +
'function drawWaku_(){' +
'  if(!wakuBox) return;' +
'  var html="";' +
'  var packs=[];' +
'  WKINDS.forEach(function(k){' +
'    WGROUPS.forEach(function(g){' +
'      var key=wakuKey_(k,g.zh);' +
'      var hit=null; packs.forEach(function(p){ if(p.key===key) hit=p; });' +
'      var m={k:k,zh:g.zh,flag:g.flag};' +
'      if(hit) hit.mem.push(m); else packs.push({key:key,mem:[m]});' +
'    });' +
'  });' +
'  html = packs.map(function(p){' +
'    var ja=null, zh=null;' +
'    p.mem.forEach(function(m){ if(!m.zh&&!ja) ja=m; if(m.zh&&!zh) zh=m; });' +
'    var first=ja||zh;' +
'    var body="";' +
'    wakuRows_(first.k,first.zh).forEach(function(r){' +
'      body+= \'<div class="akiwdh">\'+r.dh+\'</div>\'+r.lines.map(function(l){ return \'<div class="akiwtimes">\'+l+\'</div>\'; }).join("");' +
'    });' +
'    if(!body) body=\'<div class="akinone">この期間に案内できる時間はありません</div>\';' +
'    function headOf(zh){ return (zh?"台湾人":"日本人")+p.mem.filter(function(m){ return m.zh===zh; }).map(function(m){ return m.k; }).join("・"); }' +
'    function cbtn(m,label){ return \'<button type="button" class="akiwcopy" data-kind="\'+m.k+\'" data-zh="\'+(m.zh?"1":"0")+\'" data-head="\'+headOf(m.zh)+\'">\'+label+\'</button>\'; }' +
'    var btns=(ja&&zh) ? cbtn(ja,"日本語でコピー")+cbtn(zh,"中文でコピー") : cbtn(first,"コピー");' +
'    return \'<div class="akiwsec">\'+' +
'      \'<div class="akiwhead"><span class="akiwks">\'+p.mem.map(function(m){' +
'        return \'<span class="akiwk" style="background:\'+WCOL[m.k]+\'"><span class="akiwflag">\'+m.flag+\'</span>\'+m.k+\'</span>\';' +
'      }).join("")+\'</span><span class="akiwbtns">\'+btns+\'</span></div>\'+body+\'</div>\';' +
'  }).join("");' +
'  html = \'<button type="button" class="akiwcopy akiwall" data-all="1">全コピー</button>\'+html;' +
'  wakuBox.innerHTML = html;' +
'  [].slice.call(wakuBox.querySelectorAll(".akiwcopy")).forEach(function(b){' +
'    b.addEventListener("click",function(){ copyWaku_(b); });' +
'  });' +
'}' +
'function wakuOneText_(btn){' +
'  var t=wakuText_(btn.getAttribute("data-kind"), btn.getAttribute("data-zh")==="1");' +
'  if(t&&btn.getAttribute("data-head")) t=btn.getAttribute("data-head")+"\\n"+t;' +
'  return t;' +
'}' +
'function copyWaku_(btn){' +
'  var txt = btn.getAttribute("data-all")==="1"' +
'    ? [].slice.call(wakuBox.querySelectorAll(".akiwcopy:not(.akiwall)")).map(wakuOneText_).filter(Boolean).join("\\n\\n")' +
'    : wakuOneText_(btn);' +
'  var lab=btn.getAttribute("data-lab")||btn.textContent; btn.setAttribute("data-lab",lab);' +
'  if(!txt){ btn.textContent="なし"; setTimeout(function(){ btn.textContent=lab; },1200); return; }' +
'  function done(){ btn.textContent="コピーしました"; btn.classList.add("done");' +
'    setTimeout(function(){ btn.textContent=lab; btn.classList.remove("done"); },1500); }' +
'  if(navigator.clipboard&&navigator.clipboard.writeText){' +
'    navigator.clipboard.writeText(txt).then(done,function(){ fallbackCopy_(txt,done); });' +
'  } else { fallbackCopy_(txt,done); }' +
'}' +
'function fallbackCopy_(txt,cb){' +
'  var ta=document.createElement("textarea"); ta.value=txt;' +
'  ta.style.position="fixed"; ta.style.left="-9999px"; document.body.appendChild(ta);' +
'  ta.select(); try{ document.execCommand("copy"); cb(); }catch(e){}' +
'  document.body.removeChild(ta);' +
'}' +
'chips.forEach(function(c){ c.addEventListener("click",function(){' +
'  var sec=c.getAttribute("data-sec");' +
'  chips.forEach(function(x){ x.classList.toggle("on", x===c); });' +
'  var isWaku=(sec==="waku"||sec==="wakunv");' +
'  wakuNoVio=(sec==="wakunv");' +
'  if(daysBox) daysBox.classList.toggle("akihidden", isWaku);' +
'  if(wakuBox) wakuBox.classList.toggle("akihidden", !isWaku);' +
'  if(isWaku){ drawWaku_(); return; }' +
'  ["full","time","staff","rooms"].forEach(function(s){' +
'    [].slice.call(document.querySelectorAll(".akisec-"+s)).forEach(function(el){' +
'      el.classList.toggle("akihidden", s!==sec);' +
'    });' +
'  });' +
'}); });' +
'' +
'var fromEl=document.getElementById("akiFrom");' +
'var minD=fromEl?fromEl.min:"", maxD=fromEl?fromEl.max:"";' +
'var days=[].slice.call(document.querySelectorAll("#akidays .akiday"));' +
'var emptyMsg=document.getElementById("akiDateEmpty");' +
'var manualDates=null;' +
'function updateDateBoxLabel_(){' +
'  if(!fromEl) return;' +
'  var active = manualDates&&manualDates.length;' +
'  fromEl.classList.toggle("on", !!active);' +   
'  if(!active){ fromEl.value=""; return; }' +
'  var mp=manualDates[0].slice(5).split("-");' +
'  var f=Number(mp[0])+"/"+Number(mp[1]);' +   
'  fromEl.value = manualDates.length===1 ? f : (f+" 他"+(manualDates.length-1)+"件");' +
'}' +
'function openAkiCal_(input){' +
'  var picks=new Set(manualDates||[]);' +
'  var initD=(manualDates&&manualDates[0])||minD;' +
'  var cur=new Date((initD||minD)+"T00:00:00");' +
'  var y=cur.getFullYear(), m=cur.getMonth();' +
'  var mask=document.createElement("div"); mask.className="akicalmask";' +
'  var box=document.createElement("div"); box.className="akicalbox";' +
'  mask.appendChild(box); document.body.appendChild(mask);' +
'  function pad2(n){ return String(n).padStart(2,"0"); }' +
'  function draw(){' +
'    box.innerHTML="";' +
'    var hdr=document.createElement("div"); hdr.className="akicalhdr";' +
'    var prev=document.createElement("button"); prev.type="button"; prev.textContent="◀";' +
'    var lbl=document.createElement("span"); lbl.textContent=y+"年 "+(m+1)+"月";' +
'    var next=document.createElement("button"); next.type="button"; next.textContent="▶";' +
'    prev.addEventListener("click",function(){ m--; if(m<0){m=11;y--;} draw(); });' +
'    next.addEventListener("click",function(){ m++; if(m>11){m=0;y++;} draw(); });' +
'    hdr.appendChild(prev); hdr.appendChild(lbl); hdr.appendChild(next);' +
'    box.appendChild(hdr);' +
'    var note=document.createElement("div"); note.className="akicalnote";' +
'    note.textContent="いくつでも選べます（もう一度押すと外れます）";' +
'    box.appendChild(note);' +
'    var wk=document.createElement("div"); wk.className="akicalwk";' +
'    ["月","火","水","木","金","土","日"].forEach(function(w,i){' +
'      var s=document.createElement("span"); s.textContent=w;' +
'      if(i===5) s.className="aki6"; if(i===6) s.className="aki0";' +
'      wk.appendChild(s);' +
'    });' +
'    box.appendChild(wk);' +
'    var grid=document.createElement("div"); grid.className="akicalgrid";' +
'    var first=new Date(y,m,1); var startWd=(first.getDay()+6)%7;' +
'    var daysInMonth=new Date(y,m+1,0).getDate();' +
'    for(var i=0;i<startWd;i++){ grid.appendChild(document.createElement("span")); }' +
'    for(var dnum=1; dnum<=daysInMonth; dnum++){' +
'      var iso0 = y+"-"+pad2(m+1)+"-"+pad2(dnum);' +
'      var b=document.createElement("button"); b.type="button"; b.textContent=String(dnum);' +
'      if((minD&&iso0<minD)||(maxD&&iso0>maxD)){ b.disabled=true; }' +
'      if(picks.has(iso0)){ b.classList.add("sel"); }' +
'      b.addEventListener("click",(function(iso1){ return function(){' +
'        if(picks.has(iso1)) picks.delete(iso1); else picks.add(iso1); draw();' +
'      }; })(iso0));' +
'      grid.appendChild(b);' +
'    }' +
'    box.appendChild(grid);' +
'    var ftr=document.createElement("div"); ftr.className="akicalftr";' +
'    var cancel=document.createElement("button"); cancel.type="button"; cancel.textContent="キャンセル"; cancel.className="akicalcancel";' +
'    var ok=document.createElement("button"); ok.type="button"; ok.textContent="設定"; ok.className="akicalok";' +
'    cancel.addEventListener("click",function(){ document.body.removeChild(mask); });' +
'    ok.addEventListener("click",function(){' +
'      var arr=Array.from(picks).sort();' +   
'      manualDates = arr.length ? arr : null;' +
'      updateDateBoxLabel_();' +
'      if(manualDates) clearPresetSel();' +
'      setAllWd_();' +   
'      document.body.removeChild(mask);' +
'    });' +
'    ftr.appendChild(cancel); ftr.appendChild(ok);' +
'    box.appendChild(ftr);' +
'  }' +
'  draw();' +
'}' +
'function iso(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }' +
'function addDays(iso0,n){ var d=new Date(iso0+"T00:00:00"); d.setDate(d.getDate()+n); return iso(d); }' +
'function clamp(v){ if(minD&&v<minD)return minD; if(maxD&&v>maxD)return maxD; return v; }' +
'function endOfThisWeek(iso0){ var d=new Date(iso0+"T00:00:00"); var wd=(d.getDay()+6)%7; return addDays(iso0,6-wd); }' +
'function thisWeekEnd_(iso0){ var e=endOfThisWeek(iso0); return e===iso0 ? addDays(iso0,7) : e; }' +
'var selectedWd=null;' +   
'function wdVisible_(dt){ if(!selectedWd) return true; var d=new Date(dt+"T00:00:00"); return selectedWd.indexOf(d.getDay())>-1; }' +
'var rangeFrom=minD, rangeTo=minD;' +   
'function dateVisible_(dt){' +
'  if(!dt) return false;' +
'  if(manualDates&&manualDates.length) return manualDates.indexOf(dt)>-1 && wdVisible_(dt);' +
'  return dt>=rangeFrom && dt<=rangeTo && wdVisible_(dt);' +
'}' +
'function applyFilter(){' +
'  var shown=0;' +
'  days.forEach(function(el){' +
'    var vis=dateVisible_(el.getAttribute("data-date")||"");' +
'    el.classList.toggle("akidatehide", !vis);' +
'    if(vis) shown++;' +
'  });' +
'  if(wakuBox&&!wakuBox.classList.contains("akihidden")) drawWaku_();' +
'  if(emptyMsg) emptyMsg.hidden = shown>0;' +
'}' +
'function setRange(f,t){ rangeFrom=clamp(f); rangeTo=clamp(t); manualDates=null; updateDateBoxLabel_(); applyFilter(); }' +
'var presets=[].slice.call(document.querySelectorAll(".akipreset"));' +
'function clearPresetSel(){ presets.forEach(function(b){ b.classList.remove("on"); }); }' +
'if(fromEl){' +
'  fromEl.addEventListener("click",function(){ openAkiCal_(fromEl); });' +
'  presets.forEach(function(b){ b.addEventListener("click",function(){' +
'    presets.forEach(function(x){ x.classList.toggle("on", x===b); });' +
'    var kind=b.getAttribute("data-preset");' +
'    var today=minD;' +
'    setAllWd_();' +   
'    if(kind==="thisweek") setRange(today, thisWeekEnd_(today));' +
'    else if(kind==="thisnext") setRange(today, addDays(endOfThisWeek(today),7));' +
'    else if(kind==="all") setRange(minD, maxD);' +
'  }); });' +
'  var wdBtns=[].slice.call(document.querySelectorAll(".akiwd"));' +
'  function setAllWd_(){ selectedWd=null; wdBtns.forEach(function(b){ b.classList.toggle("on", b.getAttribute("data-wd")==="all"); }); applyFilter(); }' +
'  wdBtns.forEach(function(b){ b.addEventListener("click",function(){' +
'    var wd=b.getAttribute("data-wd");' +
'    if(wd==="all"){ setAllWd_(); return; }' +
'    if(!selectedWd) selectedWd=[];' +
'    var n=Number(wd), idx=selectedWd.indexOf(n);' +
'    if(idx>-1) selectedWd.splice(idx,1); else selectedWd.push(n);' +
'    if(!selectedWd.length){ setAllWd_(); return; }' +
'    wdBtns[0].classList.remove("on"); b.classList.toggle("on", idx===-1);' +
'    if(idx===-1){ setRange(minD, maxD); presets.forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-preset")==="all"); }); }' +
'    applyFilter();' +
'  }); });' +
'  var durBtns=[].slice.call(document.querySelectorAll(".akidurbtn"));' +
'  var durRows=[].slice.call(document.querySelectorAll(".akirow[data-dur], .akislot[data-dur]"));' +
'  durBtns.forEach(function(b){ b.addEventListener("click",function(){' +
'    durBtns.forEach(function(x){ x.classList.toggle("on", x===b); });' +
'    var kind=b.getAttribute("data-dur");' +
'    var lo = kind==="all" ? 0 : Number(kind);' +
'    durRows.forEach(function(el){' +
'      var dur=Number(el.getAttribute("data-dur"));' +
'      el.classList.toggle("akidurhide", dur<lo);' +
'    });' +
'  }); });' +
'  setRange(minD, thisWeekEnd_(minD));' +   
'}' +
'})();</scr' + 'ipt>';
var AKICSS_ =
'  :root{ --akibg:#16141e; --akicard:#211f2c; --akiink:#f1eef8; --akisub:#9a95a9; --akiline:#34313f;' +
'    --akiprimary:#a79fff; }' +
'  @media (prefers-color-scheme:light){ :root{ --akibg:#eef1f6; --akicard:#ffffff; --akiink:#1f2937;' +
'    --akisub:#6b7280; --akiline:#d7dee8; --akiprimary:#2563eb; } }' +
'  body{ background:var(--akibg); overflow-x:hidden; }' +
'  .akiwrap{ max-width:760px; margin:0 auto; padding:14px clamp(8px,3.6vw,14px) 40px; font-family:"Yu Gothic UI","Hiragino Sans",sans-serif; color:var(--akiink); overflow-x:hidden; }' +
'  .akibar{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; flex-wrap:wrap; }' +
'  .akihome{ flex:0 0 auto; font-size:.9rem; font-weight:700; color:var(--akiink); text-decoration:none;' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:10px; padding:10px 14px; }' +
'  .akihome:active{ transform:translateY(1px); }' +
'  .akigen{ flex:1 1 auto; min-width:0; color:var(--akisub); font-size:clamp(12px,4.2vw,16px); font-weight:700; text-align:right; }' +
'  .akiwrap h1{ font-size:clamp(18px,5.8vw,22px); margin:2px 0 2px; }' +
'  .akidatebar{ display:flex; flex-direction:column; gap:8px; margin-bottom:12px; }' +
'  .akidaterow{ display:flex; align-items:center; gap:clamp(2px,1.1vw,5px); flex-wrap:nowrap; width:100%; }' +
'  .akidate{ font-family:inherit; font-size:clamp(11px,3.4vw,13px); font-weight:700; color:var(--akiink);' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:9px;' +
'    padding:9px 4px; flex:1 1 44px; min-width:44px; text-align:center; cursor:pointer; caret-color:transparent; }' +
'  .akidate::placeholder{ color:var(--akisub); font-weight:700; }' +
'  .akidate.on{ color:#fff; background:var(--akiprimary); border-color:var(--akiprimary); }' +
'  .akidate.on::placeholder{ color:#fff; }' +
'  .akicalmask{ position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex;' +
'    align-items:center; justify-content:center; z-index:9999; padding:16px; }' +
'  .akicalbox{ background:var(--akicard); border:1px solid var(--akiline); border-radius:16px;' +
'    padding:14px; width:100%; max-width:340px; }' +
'  .akicalhdr{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }' +
'  .akicalhdr span{ font-weight:800; font-size:16px; color:var(--akiink); }' +
'  .akicalhdr button{ font-family:inherit; font-size:15px; font-weight:700; color:var(--akiink);' +
'    background:transparent; border:1px solid var(--akiline); border-radius:8px; padding:4px 10px; cursor:pointer; }' +
'  .akicalnote{ color:var(--akisub); font-size:12px; margin-bottom:6px; }' +
'  .akicalwk{ display:grid; grid-template-columns:repeat(7,1fr); text-align:center;' +
'    color:var(--akisub); font-size:13px; font-weight:700; margin-bottom:4px; }' +
'  .akicalwk .aki6{ color:#4d8fe0; } .akicalwk .aki0{ color:#e05a5a; }' +
'  .akicalgrid{ display:grid; grid-template-columns:repeat(7,1fr); gap:4px; }' +
'  .akicalgrid button{ font-family:inherit; font-size:14px; font-weight:700; color:var(--akiink);' +
'    background:transparent; border:1px solid transparent; border-radius:8px; padding:8px 0; cursor:pointer; }' +
'  .akicalgrid button:disabled{ color:var(--akisub); opacity:.35; cursor:default; }' +
'  .akicalgrid button.sel{ background:var(--akiprimary); color:#fff; }' +
'  .akicalftr{ display:flex; gap:8px; margin-top:12px; }' +
'  .akicalftr button{ flex:1 1 0; font-family:inherit; font-size:15px; font-weight:700;' +
'    border-radius:10px; padding:10px 0; cursor:pointer; }' +
'  .akicalcancel{ background:transparent; color:var(--akisub); border:1px solid var(--akiline); }' +
'  .akicalok{ background:var(--akiprimary); color:#fff; border:1px solid var(--akiprimary); }' +
'  .akipreset{ flex:0 1 auto; white-space:nowrap; font-family:inherit; font-size:clamp(11px,3.4vw,13px); font-weight:700;' +
'    color:var(--akisub); background:var(--akicard); border:1px solid var(--akiline); border-radius:9px;' +
'    padding:9px clamp(4px,2.6vw,11px); cursor:pointer; }' +
'  .akipreset.sm{ font-size:clamp(10px,3.2vw,12px); padding:8px clamp(3px,2.2vw,9px); }' +
'  .akipreset.on{ color:#fff; background:var(--akiprimary); border-color:var(--akiprimary); }' +
'  .akiwdrow{ display:flex; gap:8px; flex-wrap:wrap; width:100%; margin-top:8px; }' +
'  .akiwd{ font-family:inherit; font-size:clamp(13px,4.2vw,16px); font-weight:700; color:var(--akisub);' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:10px;' +
'    padding:11px clamp(9px,4.2vw,16px); cursor:pointer; }' +
'  .akiwd.on{ color:#fff; background:var(--akiprimary); border-color:var(--akiprimary); }' +
'  .akidurrow{ display:flex; gap:8px; flex-wrap:wrap; width:100%; margin-top:8px; }' +
'  .akidurbtn{ font-family:inherit; font-size:clamp(13px,4.2vw,16px); font-weight:700; color:var(--akisub);' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:10px;' +
'    padding:11px clamp(9px,4.2vw,16px); cursor:pointer; }' +
'  .akidurbtn.on{ color:#fff; background:var(--akiprimary); border-color:var(--akiprimary); }' +
'  .akirow.akidurhide, .akislot.akidurhide{ display:none; }' +
'  .akiday.akidatehide{ display:none; }' +
AKFCSS_ +
'  .akichips{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }' +
'  .akichip{ font-family:inherit; font-size:clamp(13px,4.5vw,17px); font-weight:700; color:var(--akisub);' +
'    background:var(--akicard); border:1px solid var(--akiline); border-radius:10px;' +
'    padding:10px clamp(8px,4.2vw,16px); cursor:pointer; }' +
'  .akichip.on{ color:#fff; background:var(--akiprimary); border-color:var(--akiprimary); }' +
'  .akiday{ background:var(--akicard); border:1px solid var(--akiline); border-radius:14px;' +
'    padding:12px clamp(8px,3.6vw,14px); margin-bottom:12px; }' +
'  .akidh{ font-weight:800; font-size:clamp(19px,6.6vw,25px); border-bottom:1px solid var(--akiline);' +
'    padding-bottom:6px; margin-bottom:8px; }' +
'  .akiclosed{ color:#c33; font-weight:700; font-size:16px; }' +
'  .akisec.akihidden{ display:none; }' +
'  #akidays.akihidden{ display:none; }' +
'  .akiwakubox.akihidden{ display:none; }' +
'  .akiwsec{ background:var(--akicard); border:1px solid var(--akiline); border-radius:14px;' +
'    padding:12px clamp(8px,3.6vw,14px); margin-bottom:12px; }' +
'  .akiwhead{ display:flex; align-items:center; justify-content:space-between; gap:10px;' +
'    border-bottom:1px solid var(--akiline); padding-bottom:9px; margin-bottom:9px; }' +
'  .akiwk{ display:inline-flex; align-items:center; gap:7px; color:#fff; font-weight:800;' +
'    font-size:clamp(15px,5vw,19px); padding:7px 14px; border-radius:11px; }' +
'  .akiwflag{ font-size:clamp(17px,5.6vw,21px); line-height:1; }' +
'  .akiwks{ display:flex; flex-wrap:wrap; gap:6px; min-width:0; }' +
'  .akiwbtns{ display:flex; flex-direction:column; gap:6px; flex-shrink:0; }' +
'  .akiwcopy{ font-family:inherit; font-size:clamp(13px,4.2vw,16px); font-weight:800; color:#fff;' +
'    background:var(--akiprimary); border:1px solid var(--akiprimary); border-radius:10px;' +
'    padding:9px clamp(10px,4vw,16px); cursor:pointer; white-space:nowrap; }' +
'  .akiwcopy:active{ transform:translateY(1px); }' +
'  .akiwcopy.done{ background:#16a34a; border-color:#16a34a; }' +
'  .akiwall{ display:block; width:100%; margin-bottom:12px; padding:12px; font-size:clamp(15px,5vw,19px); }' +
'  .akiwdh{ font-weight:800; font-size:clamp(15px,5vw,19px); color:var(--akisub); margin-top:8px; }' +
'  .akiwdh:first-of-type{ margin-top:0; }' +
'  .akiwtimes{ font-weight:800; font-variant-numeric:tabular-nums; line-height:1.6;' +
'    font-size:clamp(16px,5.4vw,21px); color:var(--akiink); margin:2px 0 4px; }' +
'  .akisl{ font-size:15px; font-weight:800; color:var(--akiprimary); margin:8px 0 6px; }' +
'  .akirow{ display:flex; align-items:center; gap:clamp(5px,2.1vw,8px); flex-wrap:wrap; padding:8px 0;' +
'    border-bottom:1px solid var(--akiline); font-size:clamp(13px,4.5vw,17px); }' +
'  .akirow:last-child{ border-bottom:none; }' +
'  .akitime{ font-weight:800; font-size:clamp(18px,6.3vw,24px); min-width:clamp(100px,37.4vw,142px); font-variant-numeric:tabular-nums; }' +
'  .akidur{ color:var(--akisub); font-size:clamp(18px,6.3vw,24px); font-weight:700; min-width:clamp(40px,14.7vw,56px); }' +
'  .akisep{ color:var(--akisub); font-weight:800; }' +
'  .akibadge{ display:inline-block; color:#fff; font-weight:700; font-size:clamp(14px,5vw,19px);' +
'    padding:4px clamp(7px,3.2vw,12px); border-radius:999px; white-space:nowrap; }' +
'  .akishift{ color:var(--akisub); font-size:clamp(12px,3.8vw,14.5px); font-weight:700; }' +
'  .akirooms{ display:flex; flex-wrap:wrap; gap:2px; flex:1 1 auto; min-width:0; padding-bottom:2px; }' +
'  .akiroom{ display:inline-block; flex:0 1 auto; color:#fff; font-weight:700; font-size:clamp(12px,3.7vw,14px);' +
'    padding:1px 2px; border-radius:999px; white-space:nowrap; max-width:100%; overflow:hidden; text-overflow:ellipsis; }' +
'  .akiroom.lg{ font-size:clamp(13px,4.2vw,16px); padding:4px clamp(8px,3.4vw,13px); }' +
'  .akinorooms{ color:#c33; font-size:clamp(12px,3.8vw,14.5px); white-space:nowrap; }' +
'  .akislot{ display:inline-block; background:var(--akibg); border:1px solid var(--akiline);' +
'    border-radius:8px; padding:5px clamp(7px,3.2vw,12px); font-size:clamp(14px,5vw,19px); font-weight:700; font-variant-numeric:tabular-nums; }' +
'  .akislot b{ font-weight:700; color:var(--akisub); margin-left:3px; font-size:clamp(12px,3.9vw,15px); }' +
'  .akinone{ color:#c33; font-size:clamp(12px,3.9vw,15px); padding:4px 0; }';
