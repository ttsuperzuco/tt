// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：yoyaku_henkou、yoyaku_kizon、yoyaku_sejutsugo
function stepTimeCss_(p) {
  return (
    '.' + p + 'row{display:flex;align-items:stretch;gap:10px;}' +
    '.' + p + 'col{flex:none;width:78px;display:flex;flex-direction:column;gap:8px;}' +
    '.' + p + 'val{flex:1;min-width:0;background:#fff;color:#0f172a;border-radius:14px;' +
      'display:flex;align-items:center;justify-content:center;' +
      'font-size:40px;font-weight:900;padding:10px 4px;letter-spacing:.04em;}' +
    '.' + p + 'pm{flex:1;width:100%;min-height:46px;border:0;border-radius:14px;background:#fff;color:#0f172a;' +
      'font-size:16px;font-weight:900;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.15);}' +
    '.' + p + 'pm:active{transform:translateY(2px);}'
  );
}
function sgCss_() {
  return (
    '.sg{max-width:560px;width:100%;min-width:0;margin:0 auto;padding:0 6px 60px;text-align:left;}' +
    '.sgstep{color:#eaf6fb;font-weight:800;letter-spacing:.06em;font-size:15px;margin:2px 4px 10px;}' +
    '.sgstaff{display:flex;flex-direction:column;gap:12px;margin:0 0 22px;}' +
    '.sgbtn{display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;text-align:left;' +
      'background:#fff;color:#0f172a;border:0;border-radius:18px;padding:18px 18px;cursor:pointer;' +
      'box-shadow:0 6px 18px rgba(0,0,0,.12);position:relative;overflow:hidden;}' +
    '.sgbtn::before{content:"";position:absolute;left:0;top:0;bottom:0;width:8px;background:#0ea5e9;}' +
    '.sgbtn.sel{outline:4px solid #fb8c44;outline-offset:-4px;}' +
    '.sgbtn.dflt{margin-bottom:88px;}' +
    '.sgbtn .sgmk{flex:none;width:52px;height:52px;border-radius:13px;font-size:30px;display:grid;' +
      'place-items:center;background:rgba(14,165,233,.16);}' +
    '.sgbtn .sgnm{flex:1;min-width:0;font-size:1.5rem;font-weight:900;}' +
    '.sgbtn .sgsub{flex:none;color:#475569;font-weight:800;font-size:.95rem;}' +
    '.sgbtn.all::before{background:#64748b;}' +
    '.sgbtn.all .sgmk{background:rgba(100,116,139,.16);}' +
    '.sgwho{color:#fff;font-weight:900;font-size:30px;line-height:1.25;margin:4px 4px 14px;}' +
    '.sgwho.long{font-size:25px;}' +
    '#sgbackbar{position:sticky;top:0;z-index:5;background:#2C7A99;padding:8px 0 10px;margin:0;}' +
    '#sglisthead{position:sticky;z-index:4;background:#2C7A99;padding:2px 4px 10px;margin:0 0 4px;}' +
    '.sglist{display:flex;flex-direction:column;gap:12px;margin:6px 0 8px;min-width:0;max-width:100%;}' +
    '.sgrow{display:block;width:100%;max-width:100%;min-width:0;box-sizing:border-box;text-align:left;' +
      'background:#fff;color:#0f172a;border:0;border-radius:16px;padding:16px 18px;cursor:pointer;' +
      'box-shadow:0 4px 12px rgba(0,0,0,.12);}' +
    '.sgl1{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}' +
    '.sgtm{font-weight:900;font-size:23px;}' +
    '.sgroom{display:inline-block;color:#fff;border-radius:10px;padding:2px 11px;font-weight:900;font-size:17px;}' +
    '.sgnow{display:inline-block;background:#16a34a;color:#fff;border-radius:10px;padding:2px 12px;' +
      'font-weight:900;font-size:17px;}' +
    '.sgl2{display:flex;align-items:baseline;gap:10px;margin-top:8px;min-width:0;max-width:100%;}' +
    '.sgmk2{flex:none;font-size:26px;}' +
    '.sgnm2{flex:1;min-width:0;font-weight:900;font-size:34px;line-height:1.25;' +
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.sgcd2{flex:none;color:#475569;font-weight:900;font-size:22px;}' +
    '.sgstatus{color:#fff;font-weight:800;font-size:18px;margin:10px 4px;min-height:24px;line-height:1.6;}' +
    '.sgtimebox{background:rgba(255,255,255,.14);border-radius:16px;padding:14px 16px;margin:0 2px 14px;}' +
    '.sgtlab{color:#eaf6fb;font-weight:800;font-size:15px;margin-bottom:6px;}' +
    '.sgroomtip{color:#fff;font-weight:800;font-size:15px;line-height:1.6;margin-top:12px;}' +
    stepTimeCss_('sgt') +
    '.sgdur{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0;}' +
    '.sgdurb{background:#fff;color:#0f172a;border:0;border-radius:14px;padding:18px 4px;' +
      'font-size:22px;font-weight:900;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.14);}' +
    '.sgdurb.sel{outline:4px solid #fb8c44;outline-offset:-4px;}' +
    '.sgtwho1{color:#fff;font-weight:900;font-size:22px;line-height:1.3;margin:0 4px 14px;' +
      'white-space:nowrap;overflow:hidden;}' +
    '.sgrooms{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0;}' +
    '.sgtslot{background:#fff3cd;color:#5b4a00;font-weight:900;font-size:19px;border-radius:12px;padding:12px 14px;margin:0 2px 12px;box-shadow:0 4px 12px rgba(0,0,0,.14);}' +
    '.sgroomb{color:#fff;border:0;border-radius:14px;padding:16px 4px;font-size:17px;font-weight:900;' +
      'cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.16);text-shadow:0 1px 2px rgba(0,0,0,.35);}' +
    '.sgroomb.sel{outline:4px solid #fb8c44;outline-offset:-4px;}' +
    '.sgroomnone{background:#fee2e2;color:#991b1b;border-radius:14px;padding:12px 14px;margin:0;' +
      'font-weight:900;font-size:17px;line-height:1.6;}' +
    '.sgyesno{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0;}' +
    '.sgyn{background:#fff;color:#0f172a;border:0;border-radius:14px;padding:18px 4px;' +
      'font-size:22px;font-weight:900;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.14);}' +
    '.sgyn.sel{outline:4px solid #fb8c44;outline-offset:-4px;}' +
    '.sgerr{background:#fee2e2;color:#991b1b;border-radius:14px;padding:12px 14px;margin:0 2px 14px;' +
      'font-weight:900;font-size:17px;line-height:1.6;display:none;}' +
    '.sggo{display:block;width:100%;margin:6px 2px 0;padding:20px;font-size:21px;font-weight:900;' +
      'border:0;border-radius:16px;background:#16a34a;color:#fff;cursor:pointer;' +
      'box-shadow:0 4px 10px rgba(0,0,0,.18);}' +
    '.sggo:disabled{opacity:.45;}' +
    '.sgmnote{color:#eaf6fb;font-weight:700;font-size:15px;line-height:1.8;margin:-8px 4px 16px;}' +
    '.sgmin{display:block;width:100%;box-sizing:border-box;font:inherit;font-size:20px;font-weight:800;' +
      'color:#0f172a;background:#fff;border:0;border-radius:12px;padding:14px;}' +
    '.sgmtx{display:block;width:100%;box-sizing:border-box;font:inherit;font-size:17px;line-height:1.8;' +
      'color:#0f172a;background:#fff;border:0;border-radius:12px;padding:14px;overflow:hidden;resize:none;}' +
    '.sgmwait{color:#fff;background:rgba(255,255,255,.18);border-radius:14px;padding:12px 14px;' +
      'margin:0 2px 10px;font-weight:800;font-size:16px;line-height:1.6;}' +
    '.sgmdone{margin:10px 0 0;color:#eaf6fb;font-weight:800;font-size:15px;line-height:1.7;}' +
    '.sgmdone div{margin-top:4px;}' +
    '.sgmdone b{color:#ffd27a;font-size:17px;}' +
    '.sgtest{display:none;background:#fde68a;color:#78350f;font-weight:900;font-size:14px;' +
      'border-radius:12px;padding:8px 12px;margin:0 4px 10px;line-height:1.5;}' +
    '.sgmonths{display:flex;flex-direction:column;gap:14px;margin:6px 0 8px;}' +
    '.sgmon{display:block;width:100%;box-sizing:border-box;text-align:center;background:#fff;color:#0f172a;' +
      'border:0;border-radius:18px;padding:26px 12px;font-size:34px;font-weight:900;cursor:pointer;' +
      'box-shadow:0 6px 18px rgba(0,0,0,.12);}' +
    '.sgmon:active{transform:translateY(2px);}' +
    '.sgct{font-size:24px;font-weight:900;color:#fff;margin:2px 4px 14px;}' +
    '.sggrid{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;}' +
    '.sgwd{text-align:center;font-size:14px;color:#eaf6fb;font-weight:800;}' +
    '.sgwd.sat{color:#bfe3ff;}.sgwd.sun{color:#ffc9c9;}' +
    '.sgday{aspect-ratio:1/1.5;display:grid;place-items:center;background:#fff;color:#0f172a;border:0;' +
      'border-radius:12px;font-size:20px;font-weight:800;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.12);}' +
    '.sgday.sat{color:#1d6fb8;}.sgday.sun{color:#c0392b;}' +
    '.sgday.today{outline:2px solid #fb8c44;outline-offset:-2px;}' +
    '.sgday.blank{visibility:hidden;box-shadow:none;background:transparent;}' +
    '.sgday.past{opacity:.35;pointer-events:none;}' +
    '.sgtoku{margin:16px 2px 0;}' +
    '.sgtokub{display:block;width:100%;background:#fff;color:#991b1b;border:0;border-radius:16px;padding:16px;' +
      'font-size:19px;font-weight:900;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.14);}' +
    '.sgtokunote{color:#eaf6fb;font-weight:800;font-size:15px;line-height:1.7;margin:12px 4px 8px;}' +
    '.sgtokup{display:block;width:100%;margin:0 0 10px;background:#fff;color:#0f172a;border:0;border-radius:14px;' +
      'padding:16px;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.14);}');
}
function sgStepsHtml_() {
  return '' +
    '<div class="sg" id="sgMonth" style="display:none">' +
      '<div class="sgwho long">次の予約希望の日時を選択</div>' +
      '<div class="sgmonths" id="sgmonths"></div>' +
    '</div>' +
    '<div class="sg" id="sgDay" style="display:none">' +
      '<div class="sgct" id="sgct"></div>' +
      '<div class="sggrid" id="sggrid"></div>' +
    '</div>' +
    '<div class="sg" id="sgFree" style="display:none">' +
      '<div class="sgct" id="sgfct"></div>' +
      '<div id="sgfree"></div>' +
      '<div class="sgstatus" id="sgstatus3"></div>' +
    '</div>' +
    '<div class="sg" id="sgTime" style="display:none">' +
      '<div class="sgwho">予約時間設定</div>' +
      '<div class="sgtslot" id="sgtslot" style="display:none"></div>' +
      '<div class="sgtwho1" id="sgtwho"></div>' +
      '<div class="sgtimebox">' +
        '<div class="sgtlab">開始時間</div>' +
        '<div class="sgtrow">' +
          '<span class="sgtcol">' +
            '<button type="button" class="sgtpm" data-t="s" data-d="-60">− 1時間</button>' +
            '<button type="button" class="sgtpm" data-t="s" data-d="-5">− 5分</button>' +
          '</span>' +
          '<span class="sgtval" id="sgtS">—</span>' +
          '<span class="sgtcol">' +
            '<button type="button" class="sgtpm" data-t="s" data-d="60">＋ 1時間</button>' +
            '<button type="button" class="sgtpm" data-t="s" data-d="5">＋ 5分</button>' +
          '</span>' +
        '</div>' +
      '</div>' +
      '<div class="sgtimebox" id="sgdurbox">' +
        '<div class="sgtlab">施術の長さ（押すと終了時間が決まります）</div>' +
        '<div class="sgdur" id="sgdur"></div>' +
      '</div>' +
      '<div class="sgtimebox" id="sgendbox">' +
        '<div class="sgtlab">終了時間</div>' +
        '<div class="sgtrow">' +
          '<span class="sgtcol">' +
            '<button type="button" class="sgtpm" data-t="e" data-d="-60">− 1時間</button>' +
            '<button type="button" class="sgtpm" data-t="e" data-d="-5">− 5分</button>' +
          '</span>' +
          '<span class="sgtval" id="sgtE">—</span>' +
          '<span class="sgtcol">' +
            '<button type="button" class="sgtpm" data-t="e" data-d="60">＋ 1時間</button>' +
            '<button type="button" class="sgtpm" data-t="e" data-d="5">＋ 5分</button>' +
          '</span>' +
        '</div>' +
      '</div>' +
      '<div class="sgtimebox">' +
        '<div class="sgtlab">施術室（この時間に空いている部屋だけ出ます）</div>' +
        '<div class="sgrooms" id="sgrooms"></div>' +
        '<div class="sgroomnone" id="sgroomnone" style="display:none"></div>' +
        '<div class="sgroomtip" id="sgroomtip" style="display:none"></div>' +
      '</div>' +
      '<div class="sgtimebox" id="sgpaidbox" style="display:none">' +
        '<div class="sgtlab">次回の費用は支払済みですか？</div>' +
        '<div class="sgyesno">' +
          '<button type="button" class="sgyn" id="sgpaid1">はい</button>' +
          '<button type="button" class="sgyn" id="sgpaid0">いいえ</button>' +
        '</div>' +
      '</div>' +
      '<div class="sgerr" id="sgterr"></div>' +
      '<button type="button" class="sggo" id="sgtgo">この時間と部屋で決定</button>' +
    '</div>' +
    '';
}
var SG_STEPS_JS_ =
    'var DAYSTAFF=[];' +
    'var NEEDMIN=0;' +
    'var ROOMTIP="";' +
    'function goMonth(){step=3;show();drawMonths();window.scrollTo(0,0);}' +
    'function goDay(){step=4;show();drawCal();window.scrollTo(0,0);}' +
    'function drawMonths(){' +
      'var base=new Date(NOW());base.setDate(1);' +
      'var h="";' +
      'for(var i=0;i<6;i++){' +
        'var d=new Date(base.getFullYear(),base.getMonth()+i,1);' +
        'h+="<button type=\\"button\\" class=\\"sgmon\\" data-y=\\""+d.getFullYear()+"\\" data-m=\\""+d.getMonth()+"\\">"+' +
          '(d.getMonth()+1)+"月</button>";}' +
      '$("sgmonths").innerHTML=h;' +
      'var bs=$("sgmonths").getElementsByClassName("sgmon");' +
      'for(var b=0;b<bs.length;b++){bs[b].onclick=function(){' +
        'if(!tapOK())return;' +
        'MY={y:parseInt(this.getAttribute("data-y"),10),m:parseInt(this.getAttribute("data-m"),10)};' +
        'goDay();};}}' +
    'function drawCal(){' +
      'if(!MY)return;' +
      'var y=MY.y,m=MY.m;' +
      '$("sgct").textContent=y+"年 "+(m+1)+"月";' +
      'var wd=["月","火","水","木","金","土","日"];' +
      'var h="";' +
      'for(var i=0;i<7;i++){h+="<div class=\\"sgwd"+(i===5?" sat":i===6?" sun":"")+"\\">"+wd[i]+"</div>";}' +
      'var first=new Date(y,m,1);var off=(first.getDay()+6)%7;' +
      'var dim=new Date(y,m+1,0).getDate();' +
      'for(var b=0;b<off;b++){h+="<div class=\\"sgday blank\\"></div>";}' +
      'var n=new Date(NOW());var t0=new Date(n.getFullYear(),n.getMonth(),n.getDate());' +
      'for(var d=1;d<=dim;d++){var dow=(off+d-1)%7;var cls="sgday";' +
        'if(dow===5)cls+=" sat";if(dow===6)cls+=" sun";' +
        'var cur=new Date(y,m,d);' +
        'if(cur.getTime()===t0.getTime())cls+=" today";' +
        'if(cur<t0)cls+=" past";' +    
        'h+="<button type=\\"button\\" class=\\""+cls+"\\" data-d=\\""+d+"\\">"+d+"</button>";}' +
      '$("sggrid").innerHTML=h;' +
      'var ds=$("sggrid").getElementsByClassName("sgday");' +
      'for(var k=0;k<ds.length;k++){if(ds[k].getAttribute("data-d")){ds[k].onclick=function(){' +
        'if(!tapOK())return;' +
        'PICKDATE=MY.y+"-"+("0"+(MY.m+1)).slice(-2)+"-"+("0"+this.getAttribute("data-d")).slice(-2);' +
        'if(typeof sgOnDate==="function")sgOnDate(PICKDATE);' +
        'goFree();};}}}' +
    'function goFree(){step=5;show();drawFree();window.scrollTo(0,0);}' +
    'function drawFree(){' +
      'var wd=["日","月","火","水","木","金","土"];' +
      'var d=new Date(PICKDATE+"T00:00:00");' +
      '$("sgfct").textContent=(d.getMonth()+1)+"月"+d.getDate()+"日（"+wd[d.getDay()]+"）の空き状況";' +
      'if(!AKI&&!AKIERR){$("sgstatus3").textContent="空き状況を読んでいます...";' +
        '$("sgfree").innerHTML="";AKIWAIT=function(){if(step===5)drawFree();};return;}' +
      'if(AKIERR){$("sgstatus3").textContent="空き状況を読み込めませんでした。通信環境をご確認くださいませ🙇";' +
        '$("sgfree").innerHTML="";return;}' +
      'var day=null;' +
      'for(var i=0;i<AKI.days.length;i++){if(AKI.days[i].date===PICKDATE){day=AKI.days[i];break;}}' +
      'if(!day){$("sgstatus3").textContent="この日の空き状況はまだ表示できません（先の日は近づくと出ます）。";' +
        '$("sgfree").innerHTML="";return;}' +
      'if(day.kind==="closed"){$("sgstatus3").textContent=day.label||"この日はお休みです。";' +
        '$("sgfree").innerHTML="";return;}' +
      '$("sgstatus3").textContent="";' +
      'DAYROOMS=day.rooms_free||[];DAYSTAFF=day.staff||[];' +
      '$("sgfree").innerHTML=akiFullCard_(day);' +
      'var fs=$("sgfree").getElementsByClassName("akffree");' +
      'for(var f=0;f<fs.length;f++){' +
        'if(fs[f].getAttribute("data-kind")!=="staff"){fs[f].style.cursor="default";fs[f].onclick=null;continue;}' +
        'if(typeof sgStaffOK==="function"&&!sgStaffOK(fs[f].getAttribute("data-who"))){' +
          'fs[f].style.opacity="0.3";fs[f].style.cursor="default";fs[f].onclick=null;continue;}' +
        'if(NEEDMIN&&(hm2m(fs[f].getAttribute("data-e"))-hm2m(fs[f].getAttribute("data-s")))<NEEDMIN){' +
          'fs[f].style.opacity="0.3";fs[f].style.cursor="default";fs[f].onclick=null;continue;}' +
        'fs[f].style.cursor="pointer";fs[f].onclick=function(){' +
        'if(!tapOK())return;' +
        'SLOT={s:hm2m(this.getAttribute("data-s")),e:hm2m(this.getAttribute("data-e")),' +
          'kind:this.getAttribute("data-kind"),who:this.getAttribute("data-who")};' +
        'goTime();};}' +
      'if(typeof sgStaffNote==="function"){var _nt=sgStaffNote();if(_nt){var _dv=document.createElement("div");' +
        '_dv.className="sgtokunote";_dv.textContent=_nt;$("sgfree").insertBefore(_dv,$("sgfree").firstChild);}}' +
      'if(typeof SG_TOKU!=="undefined"&&SG_TOKU)sgTokuUi();}' +
    'function sgTokuUi(){' +
      'var box=document.createElement("div");box.className="sgtoku";' +
      'var L=[["🫒","オリーブ"],["🍊","みかん"],["🍅","トマト"]];' +
      'var h="<button type=\\"button\\" class=\\"sgtokub\\" id=\\"sgtokuopen\\">⚠️ 上の空き時間以外の枠に登録する（特例）</button>"+' +
        '"<div id=\\"sgtokulist\\" style=\\"display:none\\"><div class=\\"sgtokunote\\">施術者を選ぶと、空きの外の時間や、予約と重なる時間でも登録できます。</div>";' +
      'for(var i=0;i<L.length;i++){h+="<button type=\\"button\\" class=\\"sgtokup\\" data-e=\\""+L[i][0]+"\\" data-n=\\""+L[i][1]+"\\">"+L[i][0]+" "+L[i][1]+"</button>";}' +
      'h+="</div>";box.innerHTML=h;$("sgfree").appendChild(box);' +
      '$("sgtokuopen").onclick=function(){if(!tapOK())return;var l=$("sgtokulist");l.style.display=(l.style.display==="none")?"":"none";};' +
      'var ps=box.getElementsByClassName("sgtokup");' +
      'for(var k=0;k<ps.length;k++){ps[k].onclick=function(){' +
        'if(!tapOK())return;' +
        'SLOT={s:8*60,e:22*60,kind:"staff",who:this.getAttribute("data-e")+" "+this.getAttribute("data-n"),' +
          'emoji:this.getAttribute("data-e"),toku:true};' +
        'goTime();TS=11*60;TE=TS+(NEEDMIN||30);drawTime();};}}' +
    'function sgRoomsToku(a,b){' +
      'var lo=24*60,hi=0,i,j;' +
      'for(i=0;i<DAYROOMS.length;i++){for(j=0;j<(DAYROOMS[i].slots||[]).length;j++){' +
        'lo=Math.min(lo,hm2m(DAYROOMS[i].slots[j].s));hi=Math.max(hi,hm2m(DAYROOMS[i].slots[j].e));}}' +
      'var a2=Math.max(a,lo),b2=Math.min(b,hi);' +
      'var out=[];' +
      'for(i=0;i<DAYROOMS.length;i++){var r=DAYROOMS[i],ok=(a2>=b2);' +
        'if(String(r.room||"").toUpperCase().indexOf("COSMOS")>=0)continue;' +
        'for(j=0;!ok&&j<(r.slots||[]).length;j++){if(hm2m(r.slots[j].s)<=a2&&b2<=hm2m(r.slots[j].e))ok=true;}' +
        'if(ok)out.push(r.room);}' +
      'out.sort(function(x,y){var ix=AKI_ROOM_ORDER_.indexOf(x),iy=AKI_ROOM_ORDER_.indexOf(y);' +
        'if(ix<0)ix=99;if(iy<0)iy=99;return ix-iy;});' +
      'return out;}' +
    'function sgStaffFree(emoji,a,b){' +
      'for(var i=0;i<DAYSTAFF.length;i++){var s=DAYSTAFF[i];if(String(s.emoji||"")!==emoji)continue;' +
        'for(var j=0;j<(s.slots||[]).length;j++){if(hm2m(s.slots[j].s)<=a&&b<=hm2m(s.slots[j].e))return true;}}' +
      'return false;}' +
    'function hm2m(t){var p=String(t||"").split(":");' +
      'return (parseInt(p[0],10)||0)*60+(parseInt(p[1],10)||0);}' +
    'function m2hm(m){return Math.floor(m/60)+":"+("0"+(m%60)).slice(-2);}' +
    'var DURS=[20,30,40,60,90,120];' +
    'var SGDAYTXT="";' +
    'function goTime(){step=6;show();' +
      'var wd=["日","月","火","水","木","金","土"];' +
      'var d=new Date(PICKDATE+"T00:00:00");' +
      'SGDAYTXT=(d.getMonth()+1)+"/"+d.getDate()+"（"+wd[d.getDay()]+"）";' +
      'TS=SLOT.s;' +
      'TE=Math.min(SLOT.s+(NEEDMIN||30),SLOT.e);' +
      'ROOM=(SLOT.kind==="room")?SLOT.who:null;' +
      'drawTime();window.scrollTo(0,0);}' +
    'function fitLine(el,big,min){' +
      'el.style.fontSize=big+"px";' +
      'var have=el.clientWidth,need=el.scrollWidth;' +
      'if(!have||need<=have)return;' +
      'var fs=Math.floor(big*(have-2)/need);' +
      'if(fs<min)fs=min;if(fs>big)fs=big;' +
      'el.style.fontSize=fs+"px";' +
      'for(var t=0;t<4&&fs>min&&el.scrollWidth>el.clientWidth;t++){fs--;el.style.fontSize=fs+"px";}}' +
    'function freeRooms(a,b){' +
      'var out=[];' +
      'for(var i=0;i<DAYROOMS.length;i++){' +
        'var r=DAYROOMS[i],ok=false;' +
        'if(String(r.room||"").toUpperCase().indexOf("COSMOS")>=0)continue;' +
        'for(var j=0;j<(r.slots||[]).length;j++){' +
          'if(hm2m(r.slots[j].s)<=a&&b<=hm2m(r.slots[j].e)){ok=true;break;}}' +
        'if(ok)out.push(r.room);}' +
      'out.sort(function(x,y){var ix=AKI_ROOM_ORDER_.indexOf(x),iy=AKI_ROOM_ORDER_.indexOf(y);' +
        'if(ix<0)ix=99;if(iy<0)iy=99;return ix-iy;});' +
      'return out;}' +
    'function aheadPick(){' +
      'var k=PICKDATE?String(PICKDATE).slice(5).replace("-","/"):"";' +
      'if(PAIDAUTO&&PAIDAUTO!==k){PAID=null;PAIDAUTO="";}' +
      'if(!ASK||PAID!==null||!k||!AHEAD)return;' +
      'if(AHEAD[k]==="1"||AHEAD[k]==="0"){PAID=(AHEAD[k]==="1")?1:0;PAIDAUTO=k;}}' +
    'function drawTime(){' +
      'aheadPick();' +
      'if(TS<SLOT.s)TS=SLOT.s;' +
      'if(TS>SLOT.e-5)TS=SLOT.e-5;' +
      'if(TE<TS+5)TE=TS+5;' +
      '$("sgtS").textContent=m2hm(TS);$("sgtE").textContent=m2hm(TE);' +
      '$("sgtwho").textContent=SLOT.toku?("特例　施術者 "+SLOT.who+"　"+SGDAYTXT):' +
        '((SLOT.kind==="staff"?"施術者 ":"施術室 ")+SLOT.who+"　"+SGDAYTXT+"　空き "+' +
        'm2hm(SLOT.s)+"〜"+m2hm(SLOT.e));' +
      'fitLine($("sgtwho"),26,13);' +
      'var h="";' +
      'for(var i=0;i<DURS.length;i++){' +
        'h+="<button type=\\"button\\" class=\\"sgdurb"+((TE-TS)===DURS[i]?" sel":"")+"\\" data-m=\\""+DURS[i]+"\\">"+DURS[i]+"分</button>";}' +
      '$("sgdur").innerHTML=h;' +
      'var bs=$("sgdur").getElementsByClassName("sgdurb");' +
      'for(var b=0;b<bs.length;b++){bs[b].onclick=function(){' +
        'if(!tapOK())return;' +
        'TE=TS+parseInt(this.getAttribute("data-m"),10);drawTime();};}' +
      'var fr=freeRooms(TS,TE);' +
      'if(SLOT.toku)fr=sgRoomsToku(TS,TE);' +
      'if(ROOM&&fr.indexOf(ROOM)<0&&fr.indexOf(shortRoomName_(ROOM))<0)ROOM=null;' +
      'var rh="";' +
      'for(var k=0;k<fr.length;k++){' +
        'var nm=shortRoomName_(fr[k]);' +
        'rh+="<button type=\\"button\\" class=\\"sgroomb"+((ROOM===fr[k]||ROOM===nm)?" sel":"")+"\\"" +' +
          '" data-r=\\""+esc(fr[k])+"\\" style=\\"background:"+roomColor_(fr[k])+"\\">"+esc(nm)+"</button>";}' +
      '$("sgrooms").innerHTML=rh;' +
      'var rs=$("sgrooms").getElementsByClassName("sgroomb");' +
      'for(var m=0;m<rs.length;m++){rs[m].onclick=function(){' +
        'if(!tapOK())return;' +
        'ROOM=this.getAttribute("data-r");drawTime();};}' +
      'var _rt=$("sgroomtip");if(_rt){_rt.innerHTML=ROOMTIP;_rt.style.display=ROOMTIP?"":"none";}' +
      'var none=$("sgroomnone");' +
      'if(fr.length){none.style.display="none";none.textContent="";}' +
      'else{none.style.display="block";none.textContent="この時間に空いている施術室がありません。";}' +
      'var over=(TE>SLOT.e);' +
      'var er=$("sgterr");' +
      'if(over){er.style.display="block";' +
        'er.innerHTML="その時間は空いていません。<br>入力し直してください😊";}' +
      'else{er.style.display="none";er.textContent="";}' +
      'if(SLOT.toku){var w=[];' +
        'if(!sgStaffFree(SLOT.emoji,TS,TE))w.push(SLOT.who+"さんは、この時間に空きがありません（予約か勤務の外と重なります）。");' +
        'if(w.length){er.style.display="block";er.innerHTML="⚠️ 特例<br>"+w.map(esc).join("<br>");}}' +
      '$("sgtgo").textContent=SLOT.toku?"特例でこの時間と部屋で決定":"この時間と部屋で決定";' +
      'var _db=$("sgdurbox");if(_db)_db.style.display=NEEDMIN?"none":"";' +
      'var _eb=$("sgendbox");if(_eb)_eb.style.display=NEEDMIN?"none":"";' +
      '$("sgpaidbox").style.display=ASK?"":"none";' +
      '$("sgpaid1").className="sgyn"+(PAID===1?" sel":"");' +
      '$("sgpaid0").className="sgyn"+(PAID===0?" sel":"");' +
      '$("sgtgo").disabled=over||!fr.length||!ROOM||(ASK&&PAID===null);}' +
    '(function(){var nm="__sgAki_"+Date.now();' +
      'window[nm]=function(p){AKI=(p&&p.days)?p:null;AKIERR=!AKI;' +
        'var w=AKIWAIT;AKIWAIT=null;if(w)w();};' +
      'var s=document.createElement("script");' +
      's.src=EXEC+"?action=data&name=akijikan.json&callback="+nm+"&cb="+Date.now();' +
      's.onerror=function(){AKIERR=true;var w=AKIWAIT;AKIWAIT=null;if(w)w();};' +
      'document.body.appendChild(s);})();' +
    'function sgBindSteps(){var ps=document.getElementsByClassName("sgtpm");' +
      'for(var i=0;i<ps.length;i++){ps[i].onclick=function(){' +
        'if(!tapOK())return;' +
        'var d=parseInt(this.getAttribute("data-d"),10);' +
        'if(this.getAttribute("data-t")==="s"){TS+=d;TE+=d;}else{TE+=d;}' +
        'drawTime();};}' +
      '$("sgpaid1").onclick=function(){if(!tapOK())return;PAID=1;PAIDAUTO="";drawTime();};' +
      '$("sgpaid0").onclick=function(){if(!tapOK())return;PAID=0;PAIDAUTO="";drawTime();};' +
    '}' +
    '';
