// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：yoyaku_henkou、yoyaku_kizon
function renderExistingPage_(base, staff, dev, mode) {
  var title = (mode === '変更') ? '予約変更' : '予約';             
  var head = (mode === '変更') ? '既存の予約変更' : '既存の予約';   
  var isChange = (mode === '変更');
  var topHref = base + '?view=yoyaku' + roleSfx_(staff, dev);
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var KEY = 'kx7Q2p9mVt4Zr8';
  var DURS2 = [15, 20, 30, 40, 45, 50, 60, 70, 80, 90, 120, 150];
  var STAFF2 = [['2', '🍊 みかん', '#e08a1e'], ['3', '🫒 オリーブ', '#4b8b3b'], ['1', '🍅 トマト', '#d1443c']];
  var ROOMS2 = [['FREEDOM', 'FREEDOM', '#2ecc87'], ['HAPPY', 'HAPPY', '#e73b3b'], ['LUCKY', 'LUCKY', '#fdc02d'], ['STAR/福/🇫🇷', 'STAR/福', '#b38bdc']];
  function exp_(grp, val, label, color, plain) {
    return '<button type="button" class="exp' + (plain ? ' plain' : '') + '" data-eg="' + grp + '" data-ev="' + esc_(val) + '"' + (color ? ' style="background:' + color + '"' : '') + '>' + label + '</button>';
  }
  var durP = '', staffP = '', roomP = '';
  for (var _di = 0; _di < DURS2.length; _di++) { durP += exp_('dur', DURS2[_di], DURS2[_di], '', true); }
  for (var _si = 0; _si < STAFF2.length; _si++) { staffP += exp_('staff', STAFF2[_si][0], STAFF2[_si][1], STAFF2[_si][2], false); }
  for (var _ri = 0; _ri < ROOMS2.length; _ri++) { roomP += exp_('room', ROOMS2[_ri][0], ROOMS2[_ri][1], ROOMS2[_ri][2], false); }
  var rvDurP = '', rvStaffP = '', rvRoomP = '';
  for (var _rd = 0; _rd < DURS2.length; _rd++) { rvDurP += exp_('rvdur', DURS2[_rd], DURS2[_rd], '', true); }
  for (var _rs = 0; _rs < STAFF2.length; _rs++) { rvStaffP += exp_('rvstaff', STAFF2[_rs][0], STAFF2[_rs][1], STAFF2[_rs][2], false); }
  for (var _rr = 0; _rr < ROOMS2.length; _rr++) { rvRoomP += exp_('rvroom', ROOMS2[_rr][0], ROOMS2[_rr][1], ROOMS2[_rr][2], false); }
  var css = EXPADCSS_ +    
    '.ex{max-width:560px;margin:0 auto;padding:0 6px 60px;text-align:left;}' +
    '.exstep{color:#eaf6fb;font-weight:800;letter-spacing:.06em;font-size:14px;margin:2px 4px 8px;}' +
    '#exwho{font-size:28px;color:#fff;font-weight:900;margin:2px 4px 14px;}' +    
    '.exseg{position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;background:rgba(255,255,255,.16);border-radius:16px;padding:6px;margin:0 0 14px;overflow:hidden;}' +
    '.exseg .thumb{position:absolute;top:6px;bottom:6px;left:6px;width:calc((100% - 12px)/3);background:#fff;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,.18);transition:transform .22s;}' +
    '.exseg button{position:relative;z-index:1;background:none;border:0;padding:14px 4px;font-size:19px;font-weight:800;color:#eaf6fb;cursor:pointer;}' +
    '.exseg button[aria-pressed="true"]{color:#0f172a;}' +
    '.expaste{background:rgba(255,255,255,.14);border-radius:14px;padding:12px 14px;margin:2px 0 4px;}' +
    '.expl{color:#eaf6fb;font-weight:800;font-size:15px;margin-bottom:8px;}' +
    '.expaste input{width:100%;box-sizing:border-box;border:0;border-radius:10px;padding:14px;font-size:20px;font-weight:800;color:#0f172a;background:#fff;}' +
    '.exhint{color:#eaf6fb;font-weight:700;font-size:16px;line-height:1.5;margin:2px 4px 12px;}' +
    '.exwho1{color:#fff;font-weight:900;font-size:24px;margin:2px 4px 4px;}' +
    '.exwd2{color:#fff;font-weight:900;font-size:40px;line-height:1.2;margin:0 4px 14px;}' +
    stepTimeCss_('ext') +
    '.extrow{margin:6px 0 16px;}' +
    '.extrow .exbox{flex:1;min-width:0;margin:0;padding:16px 4px;font-size:40px;}' +
    '#expickwho{color:#fff;font-weight:900;font-size:36px;line-height:1.25;margin:8px 4px 12px;}' +
    '.exstatus{color:#fff;font-weight:800;font-size:18px;margin:8px 4px;min-height:24px;}' +
    '.expick{display:flex;flex-direction:column;gap:12px;margin:6px 0 8px;}' +
    '.expickrow{display:block;width:100%;text-align:left;background:#fff;color:#0f172a;border:0;border-radius:16px;padding:16px 18px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.12);}' +
    '.expickrow.sel{outline:3px solid #fb8c44;outline-offset:-3px;}' +
    '.expickrow .pn{display:block;font-weight:900;font-size:26px;color:#0f172a;margin-bottom:4px;}' +
    '.expickrow .pd{display:block;font-weight:900;font-size:30px;}' +
    '.expickrow .pm{color:#475569;font-weight:800;font-size:25px;display:block;margin-top:8px;line-height:1.5;}' +
    '.expickrow .proom{display:inline-block;color:#fff;border-radius:10px;padding:3px 14px;font-weight:900;font-size:23px;margin-right:8px;}' +
    '.expickrow .ppart{display:block;color:#0f172a;font-weight:800;font-size:25px;margin-top:8px;}' +
    '#expickmode{display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;background:#fff;color:#0f172a;font-size:21px;padding:14px 16px;margin:6px 0 4px;box-shadow:0 4px 14px rgba(0,0,0,.25);}' +
    '#expickmode.on{outline:4px solid #16a34a;outline-offset:-4px;}' +
    '.exsw{flex:none;width:66px;height:38px;border-radius:999px;background:#cbd5e1;position:relative;transition:background .2s;}' +
    '.exswk{position:absolute;top:4px;left:4px;width:30px;height:30px;border-radius:50%;background:#fff;box-shadow:0 2px 5px rgba(0,0,0,.3);transition:left .2s;}' +
    '#expickmode.on .exsw{background:#16a34a;}' +
    '#expickmode.on .exswk{left:32px;}' +
    '.exswtxt{display:block;font-size:15px;font-weight:800;color:#64748b;margin-top:2px;}' +
    '#expickmode.on .exswtxt{color:#16a34a;}' +
    '.expickhint{color:#fff;background:rgba(0,0,0,.22);border-radius:10px;padding:10px 12px;font-size:18px;font-weight:800;line-height:1.5;margin:6px 0 4px;}' +
    '.expickrow.msel{outline:5px solid #fb8c44;outline-offset:-5px;background:#fff7ed;}' +
    '.expickrow.msel::before{content:"✓ 選択中";display:block;color:#e0592b;font-weight:900;font-size:22px;margin-bottom:4px;}' +
    '.expick.mmode .expickrow.mno{opacity:.35;}' +
    '#expickmulti{position:sticky;bottom:12px;background:#fb8c44;box-shadow:0 6px 16px rgba(0,0,0,.3);}' +
    '.exmultih{color:#fff;font-weight:900;font-size:19px;margin:4px 2px 8px;}' +
    '.exmultisep{border-top:2px dashed rgba(255,255,255,.35);margin:10px 0;}' +
    '.exsec{color:#fff;font-weight:900;font-size:20px;margin:16px 4px 8px;}' +
    '.expills{display:flex;flex-wrap:wrap;gap:8px;}' +
    '.rvbusy{color:#fecaca;background:#7f1d1d;border-radius:10px;padding:8px 12px;font-weight:800;font-size:15px;margin:6px 2px 0;}' +
    '.exp{border:0;border-radius:999px;padding:12px 18px;font-weight:800;font-size:16px;color:#fff;opacity:.6;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.15);}' +
    '.exp.plain{background:#475569;}' +
    '.exp.sel{opacity:1;outline:3px solid #fff;outline-offset:-3px;}' +
    '.exp.pick{background:#fff;color:#0f172a;opacity:.45;box-shadow:0 4px 12px rgba(0,0,0,.12);}' +
    '.exp.pick.sel{background:#fff7ed;color:#0f172a;opacity:1;outline:3px solid #fb8c44;outline-offset:-3px;}' +
    '.exdur .exp{flex:0 0 calc((100% - 40px)/6);padding:12px 2px;text-align:center;box-sizing:border-box;}' +
    '.exmlist{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px;}' +
    '.exmbtn{display:block;width:100%;text-align:center;background:#fff;color:#0f172a;border:0;border-radius:14px;padding:16px 8px;font-size:19px;font-weight:900;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.12);}' +
    '.exmbtn:active{transform:translateY(1px);}' +
    '.exsum{background:rgba(255,255,255,.14);border-radius:12px;padding:12px 14px;margin:2px 0 12px;}' +
    '.exsumrow{color:#fff;font-size:16px;font-weight:800;line-height:1.6;margin:3px 0;}' +
    '.exsumrow b{display:inline-block;min-width:3.4em;color:#cfe6f0;font-weight:900;margin-right:6px;}' +
    '.exsumroom{display:inline-block;color:#fff;font-weight:900;font-size:15px;padding:2px 14px;border-radius:999px;vertical-align:middle;}' +
    '.exsummemo{color:#fff;font-size:14px;line-height:1.5;white-space:pre-wrap;background:rgba(0,0,0,.20);border-radius:8px;padding:8px 10px;margin-top:4px;max-height:110px;overflow:auto;}' +
    '.exmh{color:#fff;font-weight:900;font-size:19px;margin:6px 4px 8px;}' +
    '.exmhrow{display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;}' +
    '.exmhsub{color:#dff1f8;font-weight:800;font-size:15px;margin:6px 4px 8px;white-space:nowrap;}' +
    '.exallday{display:block;width:100%;box-sizing:border-box;text-align:center;margin:14px 0 4px;background:#c0392b;color:#fff;border:0;border-radius:14px;padding:18px 10px;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.15);}' +
    '.exallday:active{transform:translateY(1px);}' +
    '#exmemobox{text-align:left;font-size:20px;line-height:1.6;height:300px;overflow:auto;resize:vertical;-webkit-overflow-scrolling:touch;}' +
    '.exch{display:flex;align-items:center;justify-content:center;gap:16px;margin:6px 0 16px;}' +
    '.exnav{width:48px;height:48px;border-radius:12px;border:0;background:#fff;color:#0f172a;font-size:20px;font-weight:800;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.15);}' +
    '.exct{font-size:24px;font-weight:900;width:170px;text-align:center;color:#fff;}' +
    '.exgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;}' +
    '.exwd{text-align:center;font-size:14px;color:#eaf6fb;font-weight:800;}' +
    '.exwd.sat{color:#bfe3ff;}.exwd.sun{color:#ffc9c9;}' +
    '.exday{aspect-ratio:1/1.5;display:grid;place-items:center;background:#fff;color:#0f172a;border:0;border-radius:12px;font-size:20px;font-weight:800;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.12);}' +
    '.exday.sat{color:#1d6fb8;}.exday.sun{color:#c0392b;}' +
    '.exday.today{outline:2px solid #fb8c44;outline-offset:-2px;}' +
    '.exday.picked{background:#fb8c44;color:#fff;}' +
    '.exday.blank{visibility:hidden;box-shadow:none;background:transparent;}' +
    '.exday.past{opacity:.4;}' +
    '.exdone{color:#fff;font-weight:800;font-size:20px;line-height:1.6;background:rgba(255,255,255,.14);border-radius:14px;padding:18px;margin-top:16px;}' +
    '.expk{display:block;width:100%;text-align:center;background:#fff;color:#0f172a;border:0;border-radius:16px;padding:22px 12px;font-size:26px;font-weight:900;margin:10px 0;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.12);white-space:nowrap;}' +
    '.expk.keep{font-size:22px;}' +
    '.expkroomS{display:inline-block;color:#fff;font-weight:900;font-size:20px;padding:5px 18px;border-radius:999px;vertical-align:middle;text-shadow:0 1px 2px rgba(0,0,0,.35);}' +
    '.expk:active{transform:translateY(1px);}' +
    '.expk.keep{background:#eafcf0;color:#166534;border:2px solid #16a34a;}' +
    '.expk.dis{opacity:.45;pointer-events:none;}' +
    '.expknote{color:#ffdede;font-size:16px;font-weight:800;line-height:1.6;margin:2px 0 12px;text-align:center;}' +
    '.extop{color:#fff;font-size:20px;font-weight:900;line-height:1.5;background:rgba(255,255,255,.16);border-radius:10px;padding:9px 13px;margin:2px 0 12px;}' +
    '.expkemo{font-size:1.5em;vertical-align:middle;margin-right:10px;}' +
    '.expkroom{display:inline-block;color:#fff;font-weight:900;font-size:26px;padding:8px 30px;border-radius:999px;vertical-align:middle;text-shadow:0 1px 2px rgba(0,0,0,.35);}' +
    '.exq{color:#fff;font-size:26px;font-weight:900;line-height:1.5;margin:16px 2px 8px;text-align:left;}' +
    '.expk.one{white-space:normal;font-size:22px;line-height:1.5;}' +
    '.exonly{color:#fff;font-size:24px;font-weight:900;line-height:1.6;margin:16px 2px 10px;border-left:6px solid #fbbf24;padding:4px 0 4px 12px;text-align:left;}' +
    '.exnone{color:#fff;font-size:23px;font-weight:900;line-height:1.6;margin:14px 0;background:#b91c1c;border-radius:12px;padding:20px 16px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,.2);}' +
    '.rvcard{background:#fff;color:#0f172a;border-radius:14px;padding:14px;margin:10px 0;box-shadow:0 4px 12px rgba(0,0,0,.12);}' +
    '.rvname{font-size:20px;font-weight:900;margin-bottom:10px;}' +
    '.rvbtns{display:flex;gap:8px;margin-bottom:10px;}' +
    '.rvb{flex:1;border:2px solid #cbd5e1;background:#f1f5f9;color:#334155;border-radius:10px;padding:12px 4px;font-size:15px;font-weight:900;cursor:pointer;}' +
    '.rvb.on{background:#16a34a;color:#fff;border-color:#16a34a;}' +
    '.rvcnt{display:flex;align-items:center;justify-content:center;gap:14px;}' +
    '.rvstep{width:46px;height:46px;border:0;border-radius:10px;background:#e2e8f0;color:#0f172a;font-size:24px;font-weight:900;cursor:pointer;}' +
    '.rvcv{font-size:20px;font-weight:900;min-width:110px;text-align:center;}' +
    '.rvcv.need{color:#e0592b;}' +
    '.exrvtitle{background:#fff;color:#0f172a;border-radius:12px;padding:14px;font-size:20px;font-weight:900;line-height:1.5;word-break:break-all;box-shadow:0 4px 12px rgba(0,0,0,.12);}' +
    'textarea.exrvtitleedit{width:100%;box-sizing:border-box;border:2px solid #93c5fd;resize:vertical;min-height:60px;font-family:inherit;}' +
    '.rvprevmemo{background:#f1f5f9;color:#0f172a;border:1px solid #cbd5e1;border-radius:12px;padding:12px 14px;font-size:15px;line-height:1.6;white-space:pre-wrap;word-break:break-word;max-height:220px;overflow-y:auto;}' +
    '.rvnowall{max-height:none;overflow:visible;font-size:17px;}' +
    'textarea.rvmemoedit{width:100%;box-sizing:border-box;min-height:260px;height:auto;max-height:none;overflow:hidden;resize:vertical;border:2px solid #93c5fd;font-family:inherit;}' +
    '.rvslot{background:rgba(255,255,255,.06);border:2px solid #334155;border-radius:14px;padding:12px 14px;margin:10px 0;}' +
    '.rvslottop{color:#fff;font-weight:900;font-size:19px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,.15);}' +
    '.rvslotk{color:#cbd5e1;font-weight:800;font-size:15px;margin:10px 2px 6px;}' +
    '.rvsug{display:block;width:100%;text-align:left;background:#eff6ff;color:#1e3a8a;border:2px solid #93c5fd;border-radius:12px;padding:12px 14px;font-size:17px;font-weight:900;margin:6px 0;cursor:pointer;}' +
    '.rvwhy{display:block;color:#475569;font-size:13px;font-weight:700;margin-top:4px;}';
  var numSec =
    '<div id="exNum">' +
      '<div class="ubar"><a class="uhome" href="' + topHref + '" target="_top">← 戻る</a></div>' +
      '<div class="hhead"><span class="bmark">📝</span><span class="bname">' + head + '</span></div>' +
      '<textarea class="exbox" id="exdisp" rows="2" placeholder="ここにお客様番号を貼り付けるか、下のボタンでお客様番号を入力する"></textarea>' +
      '<div class="exseg" id="exseg"><span class="thumb"></span>' +
        '<button data-v="M" aria-pressed="true">M（男）</button>' +
        '<button data-v="F">F（女）</button>' +
        '<button data-v="">文字なし</button></div>' +
      '<div class="expad" id="expad">' + EXPADHTML_ + '</div>' +
      '<button class="exgo" id="exToDate">' + (isChange ? '予約をさがす→' : '日付入力へ→') + '</button>' +
      (isChange ? '<button class="exgo" id="exNewCust" style="background:#7c3aed;margin-top:8px">新規のお客様（番号なし）から選ぶ</button>' : '') +
    '</div>';
  var pickSec =
    '<div id="exPick" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackPick" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="hhead"><span class="bmark">📖</span><span class="bname">変更する予約を選択</span></div>' +
      '<div id="expickwho"></div>' +
      '<div class="exstatus" id="expickst"></div>' +
      '<button class="exgo" id="expickmode" style="display:none"><span>複数の予約枠を同時に移動する<span class="exswtxt" id="expickswtxt"></span></span><span class="exsw"><span class="exswk"></span></span></button>' +
      '<div class="expickhint" id="expickhint" style="display:none">同じ日の予約を選択しています。外す・追加する時はその予約をタップしてください😊 1件だけ変更する時は上のスイッチをオフにしてください😊</div>' +
      '<div class="expick" id="expicklist"></div>' +
      '<button class="exgo" id="expickmulti" style="display:none"></button>' +
    '</div>';
  var dateSec =
    '<div id="exDate" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackDate" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="extop"></div>' +
      '<div class="hhead"><span class="bmark">📅</span><span class="bname">日付入力</span></div>' +
      '<div class="exstep" id="exwho">' + title + '</div>' +
      '<div class="exch"><button class="exnav" id="exprev">◀</button><div class="exct" id="exct"></div><button class="exnav" id="exnext">▶</button></div>' +
      '<div class="exgrid" id="exgrid"></div>' +
      '<div class="exdone" id="exdone" style="display:none"></div>' +
    '</div>';
  var padHtml = EXPADHTML_;
  var timeSec =
    '<div id="exTime" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackTime" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="extop"></div>' +
      '<div class="hhead"><span class="bmark">🕐</span><span class="bname">時刻入力</span></div>' +
      '<div class="exstep" id="exwhen"></div>' +
      '<div class="extrow">' +
        '<span class="extcol">' +
          '<button type="button" class="extpm" data-d="-60">− 1時間</button>' +
          '<button type="button" class="extpm" data-d="-5">− 5分</button>' +
        '</span>' +
        '<input class="exbox" id="extime" readonly placeholder="__ : __">' +
        '<span class="extcol">' +
          '<button type="button" class="extpm" data-d="60">＋ 1時間</button>' +
          '<button type="button" class="extpm" data-d="5">＋ 5分</button>' +
        '</span>' +
      '</div>' +
      '<div class="exhint">例：9時→0900 ／ 12時10分→1210（4桁で入力してください😊）</div>' +
      '<div class="expad" id="extpad">' + padHtml + '</div>' +
      '<button class="exgo" id="exToDone">この内容で進む→</button>' +
      '<div class="exdone" id="exdone2" style="display:none"></div>' +
    '</div>';
  var editSec =
    '<div id="exEdit" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackEdit" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="extop"></div>' +
      '<div class="hhead"><span class="bmark">✏️</span><span class="bname">変更内容</span></div>' +
      '<div class="exwho1" id="exeditwho"></div>' +
      '<div id="secDur"><div class="exsec">施術時間（分）</div><div class="expills exdur" id="edur">' + durP + '</div></div>' +
      '<div id="secStaff"><div class="exsec">施術担当</div><div class="expills" id="estaff">' + staffP + '</div></div>' +
      '<div id="secRoom"><div class="exsec">部屋</div><div class="expills" id="eroom">' + roomP + '</div></div>' +
      '<div class="exnone" id="exeditnone" style="display:none"></div>' +
      '<button class="exgo" id="exEditGo">この内容に変更する→</button>' +
      '<div class="exdone" id="exdone3" style="display:none"></div>' +
    '</div>';
  var menuSec =
    '<div id="exMenu" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackMenu" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="extop"></div>' +
      '<div class="exsum" id="exmsum"></div>' +
      '<div class="exmh">変更する内容を選択</div>' +
      '<div class="exmlist">' +
        '<button class="exmbtn" data-chg="dt">日付＆時間</button>' +
        '<button class="exmbtn" data-chg="t">時間（同日内）</button>' +
        '<button class="exmbtn" data-chg="staff">担当</button>' +
        '<button class="exmbtn" data-chg="room">部屋</button>' +
        '<button class="exmbtn" data-chg="dur">施術時間</button>' +
        '<button class="exmbtn" data-chg="memo">予約メモ</button>' +
      '</div>' +
      '<button class="exallday" id="exAllDay">この予約を終日にする</button>' +
    '</div>';
  var memoSec =
    '<div id="exMemo" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackMemo" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="extop"></div>' +
      '<div class="hhead"><span class="bmark">📝</span><span class="bname">予約メモを変更</span></div>' +
      '<div class="exwho1" id="exmemowho"></div>' +
      '<textarea class="exbox" id="exmemobox" rows="6"></textarea>' +
      '<button class="exgo" id="exMemoGo">この内容に変更する→</button>' +
      '<div class="exdone" id="exdone4" style="display:none"></div>' +
    '</div>';
  var staffPickSec =
    '<div id="exStaffPick" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackStaffPick" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="extop"></div>' +
      '<div class="exwho1" id="exspwho"></div>' +
      '<div id="exsplist"></div>' +
    '</div>';
  var roomPickSec =
    '<div id="exRoomPick" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackRoomPick" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="extop"></div>' +
      '<div class="exwho1" id="exrpwho"></div>' +
      '<div id="exrplist"></div>' +
    '</div>';
  var resvSec =
    '<div id="exResv" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackResv" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="exwho1" id="exrvwho"></div>' +
      '<div id="exrvprev"></div>' +
      '<div class="exmh" id="exrvhead" style="display:none"></div>' +
      '<div id="exrvA">' +
      '<div class="exmh" id="exrvitemsh">今回の施術内容</div>' +
      '<div id="exrvitems"></div>' +
      '<div id="exrvsuggest"></div>' +
      '<div id="exrvnew"></div>' +
      '<button type="button" class="exgo" id="exrvAddBtn" style="background:#2563eb;margin:8px 0 4px">＋ 別の施術を追加</button>' +
      '<div id="exrvsingle">' +
        '<div id="exrvstaffwrap"><div class="exsec">施術担当</div><div class="mvng" id="exrvstaffnone" style="display:none">その時間に空いている担当がいません</div><div class="rvbusy" id="exrvstaffbusy" style="display:none">前回と同じ担当はこの時間は空いていません。空いている人から選択してください😊</div><div class="expills" id="exrvstaff">' + rvStaffP + '</div></div>' +
        '<div id="exrvroomdurwrap"><div class="exsec">部屋</div><div class="mvng" id="exrvroomnone" style="display:none">その時間に空いている部屋がありません</div><div class="rvbusy" id="exrvroombusy" style="display:none">前回と同じ部屋はこの時間は空いていません。空いている部屋から選択してください😊</div><div class="expills" id="exrvroom">' + rvRoomP + '</div>' +
        '<div class="exsec">施術時間（分）</div><div class="expills exdur" id="exrvdur">' + rvDurP + '</div></div>' +
      '</div>' +
      '<div class="exsec" id="exrvmarksh">タイトルの印<span style="font-weight:600;font-size:13px;opacity:.85">（施術から自動で選択しています）</span></div>' + '<div class="expills" id="exrvmarks"></div>' +
      '<div id="exrvsufwrap"><div class="exsec">末尾</div><div class="expills" id="exrvsuf">' +
        '<button type="button" class="exp" data-suf="__none" style="background:#475569">なし</button>' +
        '<button type="button" class="exp" data-suf="dochi" style="background:#475569">都度</button>' +
        '<button type="button" class="exp" data-suf="eyelight" style="background:#475569">イーライト</button>' +
      '</div></div>' +
      '<div id="exrvpaynow" style="display:none;margin:10px 2px 0;font-size:16px;line-height:1.6;border-radius:12px;padding:10px 12px;font-weight:700"></div>' +
      '<div id="exrvslots" style="display:none"></div>' +
      '<div class="exsec" id="exrvtitleh">タイトル（修正可能）</div><textarea class="exrvtitle exrvtitleedit" id="exrvtitle"></textarea>' +
      '<button class="exgo" id="exToConfirm" style="display:none">確認画面へ→</button>' +
      '</div>' +
      '<div id="exrvB">' +
      '<div class="exsec" id="exrvcnth" style="display:none">回数（修正できます）</div>' +
      '<div id="exrvcntbox"></div>' +
      '<div class="exsec">TTに登録される予約メモです。間違いがないか確認してください😊 （修正可能）</div><textarea class="rvprevmemo rvmemoedit" id="exrvnowmemo">（作成中…）</textarea>' +
      '<button class="exgo" id="exResvGo">この内容でTimeTreeに登録する</button>' +
      '</div>' +
    '</div>';
  var askSec =
    '<div id="exAsk" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackAsk" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="exwho1" id="exaskwho"></div>' +
      '<div id="exaskprev"></div>' +
      '<div class="exmh" id="exaskq">今回も同じ施術をやりますか？😊</div>' +
      '<button type="button" class="exgo" id="exaskyes">はい</button>' +
      '<button type="button" class="exgo" id="exaskno" style="background:#475569;margin-top:8px">いいえ</button>' +
    '</div>';
  var pickItemsSec =
    '<div id="exPickItems" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackPickItems" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="exmh">今回やる施術を選択してください😊</div>' +
      '<div id="expkitems"></div>' +
      '<div id="expknew"></div>' +
      '<button type="button" class="exgo" id="expkGo">これで決定→</button>' +
      '<button type="button" class="exgo" id="expkAdd" style="background:#2563eb;margin-top:8px">＋ メニューから追加</button>' +
    '</div>';
  var addSec =
    '<div id="exAdd" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackAdd" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="exmh" id="exaddq"></div>' +
      '<div id="exaddlist"></div>' +
      '<button type="button" class="exgo" id="exaddno">ない（このメニューだけ）</button>' +
      '<button type="button" class="exgo" id="exaddyes" style="background:#2563eb;margin-top:8px">ある（追加メニューあり）</button>' +
    '</div>';
  var splitSec =
    '<div id="exSplit" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackSplit" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="exmh">今回の施術</div>' +
      '<div id="exspunits"></div>' +
      '<div class="exmh">担当者・部屋を分けますか？😊</div>' +
      '<button type="button" class="exgo" id="exsplitsame">全部同じ担当＆部屋</button>' +
      '<button type="button" class="exgo" id="exsplitdiv" style="background:#2563eb;margin-top:8px">担当者か部屋を分ける</button>' +
    '</div>';
  var groupSec =
    '<div id="exGroup" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackGroup" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="exmh">同じ担当＆部屋にする施術には、同じ番号を選択してください😊</div>' +
      '<div id="exgrplist"></div>' +
      '<button type="button" class="exgo" id="exgrpGo">これで決定→</button>' +
    '</div>';
  var staffSelSec =
    '<div id="exStaffSel" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackStaffSel" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="exmh">担当を選択してください😊</div>' +
      '<div id="exstflist"></div>' +
      '<button type="button" class="exgo" id="exstfGo" style="display:none">これで決定→</button>' +
    '</div>';
  var durSec =
    '<div id="exDur" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackDur" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="exmhrow"><div class="exmh">施術時間を選択してください😊</div>' +
        '<div class="exmhsub" id="exdurprev"></div></div>' +
      '<div id="exdurlist"></div>' +
      '<button type="button" class="exgo" id="exdurGo">日付をえらぶ→</button>' +
    '</div>';
  var orderSec =
    '<div id="exOrder" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackOrder" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="exmh">やる順番（上から順にやります）</div>' +
      '<div class="exmhsub" style="white-space:normal">順番を変更したい項目の「↑ 上へ」を押してください😊</div>' +
      '<div id="exorderlist"></div>' +
      '<button type="button" class="exgo" id="exorderGo">これでOK</button>' +
    '</div>';
  var slotPickSec =
    '<div id="exSlotPick" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exbackSlotPick" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="sgtslot" id="exspkhead"></div>' +
      '<div class="exsec">担当</div><div class="expills" id="exspkstaff"></div><div id="exspkng"></div>' +
      '<div class="exsec">部屋</div><div class="expills" id="exspkroom"></div>' +
      '<div class="sgroomtip" id="exspktip" style="display:none"></div>' +
      '<button type="button" class="exgo" id="exspkGo">次へ→</button>' +
    '</div>';
  var resvMenuSec =
    '<div id="exrvMenu" style="display:none">' +
      '<div class="ubar"><a class="uhome" id="exrvMenuBack" href="javascript:void(0)">← 戻る</a></div>' +
      '<div class="hhead"><span class="bmark">➕</span><span class="bname">追加する施術を選択</span></div>' +
      '<input class="exbox" id="exrvMenuSearch" style="font-size:20px;text-align:left;letter-spacing:normal" placeholder="さがす（例：ハイドラ）">' +
      '<div id="exrvMenuList"></div>' +
    '</div>';
  var script = '<script>(function(){' +
    'var TITLE=' + JSON.stringify(title) + ';' +
    'var prefix="M",digits="";' +
    'var today=new Date();var calY=today.getFullYear(),calM=today.getMonth(),picked=null;' +
    'var ISCHANGE=' + (isChange ? 'true' : 'false') + ';var EXEC="' + EXEC + '",KEY="' + KEY + '";var chosen=null;' +
    'var idn=(window.__SZ_WHO_!==undefined)?{who:window.__SZ_WHO_||"",role:window.__SZ_ROLE_||"",device:window.__SZ_DEVICE_||""}:{who:"",role:"",device:""};' +
    'function esc(s){return (s==null?"":String(s));}' +
    'function jsonp(params,onR){var cb="__ck"+Date.now()+Math.floor(Math.random()*1000);window[cb]=function(r){try{delete window[cb];}catch(e){}onR(r||{});};var qs="callback="+cb;for(var k in params){qs+="&"+k+"="+encodeURIComponent(params[k]);}var sc=document.createElement("script");sc.src=EXEC+"?"+qs+"&cb="+Date.now();sc.onerror=function(){onR({ok:false,error:"通信エラー"});};document.body.appendChild(sc);}' +
    'var lpolls=0;function pollPicks(id){lpolls++;if(lpolls>350){document.getElementById("expickst").textContent="時間切れです。もう一度試してもらえると嬉しいです🙇";return;}jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){document.getElementById("expickst").textContent="エラー："+((r&&r.error)||"不明");return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollPicks(id);},600);return;}if(r.status!=="done"){document.getElementById("expickst").textContent=esc(r.result||"エラー");return;}var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}renderPicks((d.reservations)||[]);});}' +
    'function loadPicks(){isNewCust=false;document.getElementById("exNum").style.display="none";document.getElementById("exPick").style.display="";document.getElementById("expickwho").textContent="「"+disp()+"」の予約";document.getElementById("expicklist").innerHTML="";document.getElementById("expickst").textContent="予約を検索しています…（10秒ほどかかります）";window.scrollTo(0,0);jsonp({action:"submit",key:KEY,op:"customer_reservations",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({number:disp()})},function(r){if(!r||!r.ok||!r.id){document.getElementById("expickst").textContent="依頼を送れませんでした："+((r&&r.error)||"不明");return;}setTimeout(function(){pollPicks(r.id);},500);});}' +
    'function renderPicks(list){var el=document.getElementById("expicklist");document.getElementById("expickst").textContent=list.length?"":(isNewCust?"番号なしの新規のお客様の予約が見つかりません。":"この番号の予約が見つかりません。");document.getElementById("expickwho").textContent=isNewCust?"新規のお客様（番号なし）":("「"+disp()+"」"+((list.length&&list[0].name)?list[0].name+"様":"の予約"));var h="";var dayCnt={};for(var q=0;q<list.length;q++){if(!list[q].is_past){dayCnt[list[q].date]=(dayCnt[list[q].date]||0)+1;}}for(var i=0;i<list.length;i++){var r=list[i];var pm=(r.parts||[]).join("・")||"—";var past=r.is_past?"（過去）":"";var rk=roomVal(r.room);var rc=(typeof roomColor_==="function")?roomColor_(rk):"#64748b";var rn=(typeof shortRoomName_==="function")?shortRoomName_(rk):rk;var nameLine=isNewCust?("<span class=\\"pname\\" style=\\"font-weight:900\\">お名前："+esc(r.name||"?")+"</span>"):"";var btn="<button class=\\"expickrow\\" data-i=\\""+i+"\\">"+nameLine+"<span class=\\"pd\\">"+past+r.date+" "+r.start_hm+" "+(r.dur_min||"")+"分</span><span class=\\"pm\\">担当 "+esc(r.staff_emoji||"?")+"　<span class=\\"proom\\" style=\\"background:"+rc+"\\">"+esc(rn)+"</span></span><span class=\\"ppart\\">施術部位："+esc(pm)+"</span></button>";h+=btn;}el.innerHTML=h;window.__PICKS=list;MSEL=[];MULTI_=null;MMODE=false;MOK=[];var anyM=false;for(var z=0;z<list.length;z++){MOK[z]=(!list[z].is_past&&dayCnt[list[z].date]>=2);if(MOK[z])anyM=true;}document.getElementById("expickmode").style.display=anyM?"":"none";MMODE=anyM;exMultiPre_();exMultiDraw();var rows=el.querySelectorAll(".expickrow");for(var j=0;j<rows.length;j++){(function(k){rows[k].addEventListener("click",function(){if(MMODE&&MOK[k]){exMultiToggle(k);return;}MULTI_=null;chosen=window.__PICKS[k];showMenu();});})(j);}}' +
    'var MSEL=[],MULTI_=null,MMODE=false,MOK=[];' +
    'function exMultiToggle(k){var P=window.__PICKS||[];var at=MSEL.indexOf(k);if(at>=0){MSEL.splice(at,1);}else{if(MSEL.length&&P[MSEL[0]].date!==P[k].date){MSEL=[];}MSEL.push(k);}exMultiDraw();}' +
    'function exMultiDraw(){var rows=document.querySelectorAll("#expicklist .expickrow");for(var i=0;i<rows.length;i++){rows[i].classList.toggle("msel",MMODE&&MSEL.indexOf(i)>=0);rows[i].classList.toggle("mno",!MOK[i]);}document.getElementById("expicklist").classList.toggle("mmode",MMODE);var md=document.getElementById("expickmode");md.classList.toggle("on",MMODE);document.getElementById("expickswtxt").textContent=MMODE?"オン（同じ日の予約をまとめて選択しています）":"オフ（1件ずつ変更します）";document.getElementById("expickhint").style.display=MMODE?"":"none";var mb=document.getElementById("expickmulti");if(mb){mb.style.display=(MMODE&&MSEL.length>=2)?"":"none";mb.textContent="選んだ"+MSEL.length+"件をまとめて変更→";}}' +
    'document.getElementById("expickmode").addEventListener("click",function(){MMODE=!MMODE;MSEL=[];if(MMODE)exMultiPre_();exMultiDraw();});' +
    'function exMultiPre_(){var P=window.__PICKS||[];var best="";for(var i=0;i<P.length;i++){if(MOK[i]&&(!best||P[i].date<best))best=P[i].date;}MSEL=[];if(!best)return;for(var j=0;j<P.length;j++){if(MOK[j]&&P[j].date===best)MSEL.push(j);}}' +
    'document.getElementById("expickmulti").addEventListener("click",function(){var P=window.__PICKS||[];if(MSEL.length<2)return;MULTI_=MSEL.map(function(k){return P[k];}).sort(function(a,b){return exSm_(a)-exSm_(b);});chosen=MULTI_[0];showMenu();});' +
    'function exSm_(r){var p=String((r&&r.start_hm)||"").split(":");if(p.length===2&&/^[0-9]+$/.test(p[0])&&/^[0-9]+$/.test(p[1])){return parseInt(p[0],10)*60+parseInt(p[1],10);}return (r&&r.start_min!=null)?Number(r.start_min):0;}' +
    'var isNewCust=false;' +
    'function loadNewPicks(){isNewCust=true;document.getElementById("exNum").style.display="none";document.getElementById("exPick").style.display="";document.getElementById("expickwho").textContent="新規のお客様（番号なし）";document.getElementById("expicklist").innerHTML="";document.getElementById("expickst").textContent="新規のお客様の予約を検索しています…（10秒ほどかかります）";window.scrollTo(0,0);jsonp({action:"submit",key:KEY,op:"new_customer_reservations",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({})},function(r){if(!r||!r.ok||!r.id){document.getElementById("expickst").textContent="依頼を送れませんでした："+((r&&r.error)||"不明");return;}setTimeout(function(){pollPicks(r.id);},500);});}' +
    'function goDate(){hideSteps();document.getElementById("exDate").style.display="";document.getElementById("exwho").textContent="日付を選択してください😊";calY=today.getFullYear();calM=today.getMonth();drawCal();window.scrollTo(0,0);}' +
    'function disp(){return (prefix||"")+digits;}' +
    'function upd(){document.getElementById("exdisp").value=disp();}' +
    'var seg=document.getElementById("exseg"),sb=seg.querySelectorAll("button"),thumb=seg.querySelector(".thumb");' +
    'function selSeg(i){for(var j=0;j<sb.length;j++)sb[j].setAttribute("aria-pressed",j===i);thumb.style.transform="translateX("+(i*100)+"%)";prefix=sb[i].getAttribute("data-v");upd();}' +
    'for(var i=0;i<sb.length;i++){(function(k){sb[k].addEventListener("click",function(){selSeg(k);});})(i);}' +
    'document.getElementById("expad").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;var k=b.getAttribute("data-k");if(k==="clr"){digits="";selSeg(2);return;}if(k==="del"){if(digits){digits=digits.slice(0,-1);}else{selSeg(2);return;}}else if(/^[0-9]$/.test(b.textContent)&&digits.length<4){digits+=b.textContent;}upd();});' +
    'var box=document.getElementById("exdisp");' +    
    'box.addEventListener("input",function(){var m=(box.value||"").toUpperCase().replace(/\\s/g,"").match(/^([MF]?)([0-9]{0,4})/);if(!m){return;}digits=m[2];selSeg(m[1]==="M"?0:(m[1]==="F"?1:2));});' +
    'function drawCal(){var wd=["月","火","水","木","金","土","日"];document.getElementById("exct").textContent=calY+"年 "+(calM+1)+"月";var h="";for(var i=0;i<7;i++){h+="<div class=\\"exwd"+(i===5?" sat":i===6?" sun":"")+"\\">"+wd[i]+"</div>";}var first=new Date(calY,calM,1);var off=(first.getDay()+6)%7;var dim=new Date(calY,calM+1,0).getDate();for(var b=0;b<off;b++){h+="<div class=\\"exday blank\\"></div>";}var t0=new Date(today.getFullYear(),today.getMonth(),today.getDate());for(var d=1;d<=dim;d++){var dow=(off+d-1)%7;var cls="exday";if(dow===5){cls+=" sat";}if(dow===6){cls+=" sun";}var cur=new Date(calY,calM,d);if(calY===today.getFullYear()&&calM===today.getMonth()&&d===today.getDate()){cls+=" today";}if(cur<t0){cls+=" past";}if(picked&&picked.getFullYear()===calY&&picked.getMonth()===calM&&picked.getDate()===d){cls+=" picked";}h+="<button class=\\""+cls+"\\" data-d=\\""+d+"\\">"+d+"</button>";}document.getElementById("exgrid").innerHTML=h;}' +
    'document.getElementById("exToDate").addEventListener("click",function(){if(!digits){szPopup_("お客様番号を入力してください😊");return;}' +
      'if(ISCHANGE){loadPicks();return;}' +
      'PREF=null;EXSEL=null;EXFLOW=null;EXSTAFF="";SGX.setNeed(0);SGX.setRoomTip("");exWaitCtx(exShowAsk);});' +
    '(function(){var _nc=document.getElementById("exNewCust");if(_nc)_nc.addEventListener("click",function(){loadNewPicks();});})();' +
    'document.getElementById("exbackPick").addEventListener("click",function(){document.getElementById("exPick").style.display="none";document.getElementById("exNum").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exbackDate").addEventListener("click",function(){document.getElementById("exDate").style.display="none";document.getElementById(ISCHANGE?"exMenu":"exNum").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exprev").addEventListener("click",function(){calM--;if(calM<0){calM=11;calY--;}drawCal();});' +
    'document.getElementById("exnext").addEventListener("click",function(){calM++;if(calM>11){calM=0;calY++;}drawCal();});' +
    'document.getElementById("exgrid").addEventListener("click",function(e){var b=e.target.closest("button.exday");if(!b||b.className.indexOf("blank")>=0)return;var d=parseInt(b.getAttribute("data-d"),10);picked=new Date(calY,calM,d);drawCal();document.getElementById("exDate").style.display="none";document.getElementById("exTime").style.display="";var wd=["日","月","火","水","木","金","土"][picked.getDay()];document.getElementById("exwhen").innerHTML="<div class=\\"exwd2\\">"+(calM+1)+"月"+d+"日（"+wd+"）</div>";tdig=initTdig_();tupd();window.scrollTo(0,0);});' +
    'var tdig="";' +
    'function initTdig_(){if(!ISCHANGE)return "";var t0=String((chosen&&chosen.start_hm)||"").replace(":","");return /^[0-9]{4}$/.test(t0)?t0:"";}' +
    'function tdisp(){if(!tdig){return "";}if(tdig.length<4){return tdig;}return tdig.slice(0,2)+":"+tdig.slice(2);}' +
    'function tupd(){document.getElementById("extime").value=tdisp();}' +
    'var _tpm=document.querySelectorAll(".extpm");for(var _ti=0;_ti<_tpm.length;_ti++){_tpm[_ti].addEventListener("click",function(){var d=parseInt(this.getAttribute("data-d"),10);var t=(tdig.length===4)?tdig:(initTdig_()||"1000");var m=parseInt(t.slice(0,2),10)*60+parseInt(t.slice(2),10)+d;if(m<0)m=0;if(m>23*60+55)m=23*60+55;tdig=("0"+Math.floor(m/60)).slice(-2)+("0"+(m%60)).slice(-2);tupd();});}' +
    'document.getElementById("extpad").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;var k=b.getAttribute("data-k");if(k==="clr"){tdig="";}else if(k==="del"){tdig=tdig.slice(0,-1);}else if(/^[0-9]$/.test(b.textContent)&&tdig.length<4){tdig+=b.textContent;}tupd();});' +
    'document.getElementById("exbackTime").addEventListener("click",function(){document.getElementById("exTime").style.display="none";document.getElementById(chgtype==="t"?"exMenu":"exDate").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exToDone").addEventListener("click",function(){if(tdig.length<4){szPopup_("時刻を4桁で入力してください😊 （例 1230）");return;}if(ISCHANGE){if(MULTI_){startMultiMove();}else{startPickFlow();}}else{startExistingReserve();}});' +
    'var rvctx=null,rvitems=[],rvsel={staff:"",room:"",dur:""};' +
    'function startExistingReserve(){var nd=picked;var ymd=nd.getFullYear()+"-"+("0"+(nd.getMonth()+1)).slice(-2)+"-"+("0"+nd.getDate()).slice(-2);var tm=tdig.slice(0,2)+":"+tdig.slice(2);exOvShow_(szBusyHtml_("前回の予約を読み込み中です","読み終わったら自動で切り替わりますので、少し待っててくださいね🥺"),"#2C7A99");jsonp({action:"submit",key:KEY,op:"existing_build_ctx",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({number:disp(),date:ymd,time:tm})},function(r){if(!r||!r.ok||!r.id){exOvHide_();szPopup_("エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇");return;}pollBuildCtx(r.id,ymd,tm);});}' +
    'function pollBuildCtx(id,ymd,tm){var nm="exctx_"+String(id).toLowerCase().replace(/[^a-z0-9_]/g,"")+".json",n=0,fin=false;function got(ctx){if(fin)return;fin=true;exOvHide_();if(!ctx||!ctx.found){szPopup_("「"+disp()+"」の前回の予約が見つかりません。");return;}rvctx=ctx;rvctx._ymd=ymd;rvctx._tm=tm;showResvEdit();}function fail(m){if(fin)return;fin=true;exOvHide_();szPopup_(m);}function tryData(){if(fin)return;n++;jsonp({action:"data",name:nm},function(ctx){if(fin)return;if(ctx&&ctx.ok){got(ctx);return;}if(n%3===0){jsonp({action:"status",key:KEY,id:id},function(r){if(fin)return;if(!r||!r.ok){setTimeout(tryData,700);return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""||r.status==="done"){setTimeout(tryData,r.status==="done"?0:700);return;}fail(esc(r.result)||"エラーが発生しました。りゅうさんに伝えてください🙇");});return;}setTimeout(tryData,700);});}tryData();}' +
    'var rvMarkOv={},rvEyeOv=null,rvDochi=false,rvNewItems=[],rvTitleOv=null,rvMemoOv=null;' +
    'var _rvcat="",_rvsub="";' +
    'function showResvEdit(){hideSteps();document.getElementById("exResv").style.display="";document.getElementById("exrvwho").innerHTML="「"+disp()+"」"+(rvctx.name?rvctx.name+"様":"")+"<br>"+rvctx._ymd+" "+rvctx._tm+" に予約";var _pe=document.getElementById("exrvprev");if(_pe){var _pn=rvctx.prev_note||"";_pe.innerHTML=_pn?("<div class=\\"exsec\\">前回の予約メモ"+(rvctx.prev_date?("（"+esc(rvctx.prev_date)+" "+esc(rvctx.prev_time||"")+"）"):"")+"</div><div class=\\"rvprevmemo\\">"+esc(_pn)+"</div>"):"";}EXMENUBACK="exResv";' +
      'if(!EXFLOW){rvitems=(rvctx.items||[]).map(function(it){return {line_no:it.line_no,name:it.name,arinashi:it.arinashi,count:(it.proposed!=null?it.proposed:it.count),orig:it.count,do:(String(it.arinashi||"")!=="なし"),finish:false,mark:it.mark||"",parts:(it.parts||[])};});rvMarkOv={};rvEyeOv=null;rvNewItems=[];rvSlotCfg={};rvTitleOv=null;rvMemoOv=null;rvDochi=rvDochiDefault();}' +
      'drawRvItems();rvDrawSuggest();rvDrawNew();rvsel.staff=staffNum(rvctx.prev_staff||"");rvsel.room=roomVal(rvctx.prev_room||"");rvsel.dur=String(nearDur(rvctx.prev_dur||30));if(EXSEL){rvsel.staff=EXSEL.staff;rvsel.room=EXSEL.room;rvsel.dur=EXSEL.dur;}var _sw=document.getElementById("exrvstaffwrap"),_rw=document.getElementById("exrvroomdurwrap");if(_rw)_rw.style.display=EXSEL?"none":"";if(_sw)_sw.style.display=EXSEL?"none":"";rvSelPill("rvstaff",rvsel.staff);rvSelPill("rvroom",rvsel.room);rvSelPill("rvdur",rvsel.dur);rvDrawMarks();if(!(EXSEL&&EXSEL.toku))rvLoadAvail();if(EXSEL&&EXSEL.freeStaff){rvAvail={free_staff:EXSEL.freeStaff,free_rooms:[String(rvsel.room)]};rvFilterAvail();}window.scrollTo(0,0);}' +
    'function rvDoingTexts(){var a=[];for(var i=0;i<rvitems.length;i++){if(rvitems[i].do&&!rvitems[i].finish)a.push(rvitems[i].name);}for(var k=0;k<rvNewItems.length;k++){var n=rvNewItems[k];a.push((n==="ハイドラ"&&!rvDidPart("hydra"))?"ハイドラ トライアル":n);}return a;}' +
    'function rvBookingTexts(){var a=[];for(var i=0;i<rvitems.length;i++){if(rvitems[i].do&&!rvitems[i].finish)a.push(rvitems[i].name);}for(var k=0;k<rvNewItems.length;k++){var n=rvNewItems[k];a.push((n==="ハイドラ"&&!rvDidPart("hydra"))?"ハイドラ トライアル":n);}return a;}' +
    'function rvDrawSuggest(){var sg=(rvctx.suggest||[]);var h="";for(var i=0;i<sg.length;i++){var nm=sg[i].name;if(rvNewItems.indexOf(nm)>=0)continue;h+="<button type=\\"button\\" class=\\"rvsug\\" data-sug=\\""+esc(nm)+"\\">＋ "+esc(nm)+"<span class=\\"rvwhy\\">LINE："+esc((sg[i].why||"").slice(0,40))+"</span></button>";}var el=document.getElementById("exrvsuggest");el.innerHTML=h?("<div class=\\"exsec\\">LINEでのご希望</div>"+h):"";}' +
    'function rvDrawNew(){var h="";for(var i=0;i<rvNewItems.length;i++){h+="<div class=\\"rvcard\\"><div class=\\"rvname\\">◉ "+esc(rvNewItems[i])+"（今回から）</div><button type=\\"button\\" class=\\"rvb\\" data-newdel=\\""+i+"\\" style=\\"background:#fde2e4;color:#9b1c31;border-color:#f3b4bd\\">やめる</button></div>";}var el=document.getElementById("exrvnew");el.innerHTML=h?("<div class=\\"exsec\\">今回から始める施術</div>"+h):"";}' +
    'function rvAddItem(nm){if(!nm)return;if(rvNewItems.indexOf(nm)<0)rvNewItems.push(nm);rvDrawSuggest();rvDrawNew();rvDrawMarks();}' +
    'document.getElementById("exrvsuggest").addEventListener("click",function(e){var b=e.target.closest("[data-sug]");if(!b)return;rvAddItem(b.getAttribute("data-sug"));});' +
    'document.getElementById("exrvnew").addEventListener("click",function(e){var b=e.target.closest("[data-newdel]");if(!b)return;rvNewItems.splice(parseInt(b.getAttribute("data-newdel"),10),1);rvDrawSuggest();rvDrawNew();rvDrawMarks();});' +
    'document.getElementById("exrvAddBtn").addEventListener("click",function(){showRvMenu("");});' +
    'function showRvMenu(q){hideSteps();_rvcat="";_rvsub="";document.getElementById("exrvMenu").style.display="";document.getElementById("exrvMenuSearch").value=q||"";drawRvMenuList(q||"");window.scrollTo(0,0);}' +
    'function rvDidPart(pc){return (((rvctx&&rvctx.ledger_parts)||[]).indexOf(pc)>=0);}' +
    'function rvAutoName(a){if(a==="parisienne")return rvDidPart("lash")?"パリジェンヌラッシュリフトリペア":"パリジェンヌラッシュリフト";if(a==="hydra")return "ハイドラ";return "";}' +
    'function rvAutoHint(a){if(a==="parisienne")return rvDidPart("lash")?"リペア":"初回";if(a==="hydra")return rvDidPart("hydra")?"通常":"トライアル";return "";}' +
    'function rvItemBtnH(nm){return "<button type=\\"button\\" class=\\"pickrow\\" data-mn=\\""+esc(nm)+"\\" style=\\"text-align:left;font-size:19px\\">"+esc(nm)+"</button>";}' +
    'function drawRvMenuList(q){q=(q||"").toLowerCase();var bk=document.getElementById("exrvMenuBack");var cats=(rvctx.menu_cats||[]);var el=document.getElementById("exrvMenuList");var h="";' +
      'if(q){var ms=(rvctx.menus||[]);for(var i=0;i<ms.length;i++){var nm=ms[i].name;if(nm.toLowerCase().indexOf(q)<0)continue;h+=rvItemBtnH(nm);}if(bk)bk.textContent="← 戻る";el.innerHTML=h||"<div class=\\"exhint\\">見つかりません</div>";return;}' +
      'if(!_rvcat){for(var c=0;c<cats.length;c++){h+="<button type=\\"button\\" class=\\"pickrow\\" data-rvcat=\\""+esc(cats[c].key)+"\\" style=\\"text-align:left;font-size:21px;font-weight:700\\">"+esc(cats[c].label)+"</button>";}if(bk)bk.textContent="← 戻る";el.innerHTML=h;return;}' +
      'var cc=null;for(var c2=0;c2<cats.length;c2++){if(cats[c2].key===_rvcat){cc=cats[c2];break;}}if(!cc){_rvcat="";drawRvMenuList("");return;}' +
      'if(cc.groups){if(!_rvsub){for(var g=0;g<cc.groups.length;g++){var gg=cc.groups[g];h+="<button type=\\"button\\" class=\\"pickrow\\" data-rvsub=\\""+esc(gg.label)+"\\" style=\\"text-align:left;font-size:20px;font-weight:700\\">"+esc(gg.label)+"<span style=\\"color:#94a3b8;font-size:14px;margin-left:8px\\">"+gg.items.length+"件</span></button>";}if(bk)bk.textContent="← 戻る";el.innerHTML=h;return;}var gsel=null;for(var g2=0;g2<cc.groups.length;g2++){if(cc.groups[g2].label===_rvsub){gsel=cc.groups[g2];break;}}if(!gsel){_rvsub="";drawRvMenuList("");return;}for(var it=0;it<gsel.items.length;it++){h+=rvItemBtnH(gsel.items[it]);}if(bk)bk.textContent="← "+cc.label;el.innerHTML=h;return;}' +
      'if(cc.auto){var nm2=rvAutoName(cc.auto);var hint=rvAutoHint(cc.auto);h="<button type=\\"button\\" class=\\"pickrow\\" data-mn=\\""+esc(nm2)+"\\" style=\\"text-align:left;font-size:20px\\">"+esc(cc.label)+"<span style=\\"color:#22c55e;font-size:15px;margin-left:10px\\">（"+esc(hint)+"）</span></button>";if(bk)bk.textContent="← 戻る";el.innerHTML=h;return;}' +
      'var items=(cc.items||[]);for(var i2=0;i2<items.length;i2++){h+=rvItemBtnH(items[i2]);}if(bk)bk.textContent="← 戻る";el.innerHTML=h;}' +
    'document.getElementById("exrvMenuSearch").addEventListener("input",function(){drawRvMenuList(this.value);});' +
    'document.getElementById("exrvMenuList").addEventListener("click",function(e){var cb=e.target.closest("[data-rvcat]");if(cb){_rvcat=cb.getAttribute("data-rvcat");_rvsub="";drawRvMenuList("");return;}var sb=e.target.closest("[data-rvsub]");if(sb){_rvsub=sb.getAttribute("data-rvsub");drawRvMenuList("");return;}var b=e.target.closest("[data-mn]");if(!b)return;rvAddItem(b.getAttribute("data-mn"));_rvcat="";_rvsub="";' +
      'if(EXMENUBACK==="exPickItems"){exShowPick();return;}if(EXMENUBACK==="exAdd"){exShowAdd();return;}' +
      'hideSteps();document.getElementById("exResv").style.display="";window.scrollTo(0,document.body.scrollHeight);});' +
    'document.getElementById("exrvMenuBack").addEventListener("click",function(){var sq=document.getElementById("exrvMenuSearch");if(sq&&sq.value){sq.value="";drawRvMenuList("");return;}if(_rvsub){_rvsub="";drawRvMenuList("");return;}if(_rvcat){_rvcat="";drawRvMenuList("");return;}' +
      'if(EXMENUBACK==="exPickItems"){exShowPick();return;}if(EXMENUBACK==="exAdd"){exShowAdd();return;}' +
      'hideSteps();document.getElementById("exResv").style.display="";window.scrollTo(0,0);});' +
    'function rvAutoMarkOn(mk){for(var k=0;k<rvitems.length;k++){if(rvitems[k].do&&!rvitems[k].finish&&rvitems[k].mark===mk)return true;}var tm=(rvctx.title_marks||[]);var words=[];for(var i=0;i<tm.length;i++){if(tm[i][0]===mk){words=tm[i][1]||[];break;}}var doing=rvDoingTexts().join(" ");for(var j=0;j<words.length;j++){if(doing.indexOf(words[j])>=0)return true;}return false;}' +
    'function rvMarkOn(mk){return (mk in rvMarkOv)?rvMarkOv[mk]:rvAutoMarkOn(mk);}' +
    'function rvEffMarks(){var tm=(rvctx.title_marks||[]);var out=[];for(var i=0;i<tm.length;i++){if(rvMarkOn(tm[i][0]))out.push(tm[i][0]);}return out;}' +
    'function rvAutoEye(){return false;}' +
    'function rvEyeOn(){return (rvEyeOv==null)?rvAutoEye():rvEyeOv;}' +
    'function rvSuffix(){return (rvDochi?"都度":"")+(rvEyeOn()?"イーライト":"");}' +
    'function rvDochiDefault(){if(typeof rvctx.dochi_default==="boolean")return rvctx.dochi_default;return ((rvctx.prev_title||"").indexOf("都度")>=0)||(rvctx.items||[]).some(function(it){return String(it.name||"").indexOf("都度")>=0;});}' +
    'function rvStripHead(h){h=String(h||"");var managed=["🇫🇷","🍯","🌿","👑","福:","福：","福"];for(var i=0;i<managed.length;i++){h=h.split(managed[i]).join("");}h=h.replace(/[\\u2600-\\u27bf\\ufe0f\\u200d]/g,"").replace(/[\\u{1F300}-\\u{1FAFF}]/gu,"");return h.replace(/^[\\s:：]+/,"").replace(/[\\s:：]+$/,"");}' +
    'function rvStripSuf(r){var w=["イーライト","都度"];for(var n=0;n<4;n++){var b=String(r).replace(/[ 　]+$/,"");var hit=false;' + 'for(var i=0;i<w.length;i++){if(b.slice(-w[i].length)===w[i]){b=b.slice(0,b.length-w[i].length);hit=true;break;}}' + 'if(!hit)return b;r=b;}return r;}' +
    'function rvTitle(){var t=(rvctx.prev_title||"").split("新規").join("");var a=t.indexOf("預約");if(a<0&&disp())a=t.indexOf(disp());if(a<0)a=t.length;var head=rvStripHead(t.slice(0,a));var rest=rvStripSuf(t.slice(a));return (SEMO_[rvsel.staff]||"")+rvEffMarks().join("")+head+rest+rvSuffix();}' +
    'function rvDrawMarks(){var tm=(rvctx.title_marks||[]);var h="<button type=\\"button\\" class=\\"exp"+((rvEffMarks().length===0)?" sel":"")+"\\" data-mark=\\"__none\\" style=\\"background:#475569\\">なし</button>";for(var i=0;i<tm.length;i++){var mk=tm[i][0];if(mk==="🌿")continue;h+="<button type=\\"button\\" class=\\"exp"+(rvMarkOn(mk)?" sel":"")+"\\" data-mark=\\""+esc(mk)+"\\" style=\\"background:#475569\\">"+esc(mk)+"</button>";}document.getElementById("exrvmarks").innerHTML=h;var sf=document.querySelectorAll("#exrvsuf .exp");for(var j=0;j<sf.length;j++){var k=sf[j].getAttribute("data-suf");sf[j].classList.toggle("sel",(k==="__none")?(!rvDochi&&!rvEyeOn()):((k==="dochi")?rvDochi:rvEyeOn()));}var tt=document.getElementById("exrvtitle");if(tt&&rvTitleOv==null)tt.value=rvTitle();rvDrawSlots();rvUpdateNowMemo();}' +
    'function exGoBusy_(on){var b=document.getElementById("exResvGo");if(!b)return;' +
      'var B=document.getElementById("exrvB");' +
      'if(on){if(!B||B.style.display==="none")return;' +
      'if(!b.getAttribute("data-txt"))b.setAttribute("data-txt",b.textContent);' +
      'b.disabled=true;b.style.opacity="0.45";b.style.cursor="default";b.textContent="メモを作成中です…";}' +
      'else{b.disabled=false;b.style.opacity="";b.style.cursor="";' +
      'var t=b.getAttribute("data-txt");if(t){b.textContent=t;b.removeAttribute("data-txt");}}}' +
    'var _nowMemoT=null;function rvUpdateNowMemo(){exGoBusy_(true);if(_nowMemoT)clearTimeout(_nowMemoT);_nowMemoT=setTimeout(rvUpdateNowMemoDo,700);}' +
    'var EXFLOW=null,EXMENUBACK="exResv";' +
    'var EXDURS=[15,20,30,40,45,50,60,70,80,90,120,150];' +
    'function exEl(i){return document.getElementById(i);}' +
    'function exOpen(id){hideSteps();var e=exEl(id);if(e)e.style.display="";window.scrollTo(0,0);}' +
    'function exWaitCtx(cb){if(!PREF||PREF.err)exPrefetch("");var me=PREF;' +
      'if(me.err){var m=me.err;PREF=null;szPopup_(m);return;}' +
      'if(!me.ctx){exOvShow_(szBusyHtml_("前回の予約を読み込み中です","読み終わったら自動で切り替わりますので、少し待っててくださいね🥺"),"#2C7A99");' +
        'me.wait=function(){exOvHide_();exWaitCtx(cb);};return;}' +
      'if(!me.ctx.found){szPopup_("「"+disp()+"」の前回の予約が見つかりません。");return;}' +
      'rvctx=JSON.parse(JSON.stringify(me.ctx));' +
      'rvitems=(rvctx.items||[]).map(function(it){return {line_no:it.line_no,name:it.name,arinashi:it.arinashi,' +
      'count:(it.proposed!=null?it.proposed:it.count),orig:it.count,do:(String(it.arinashi||"")!=="なし"),finish:false,mark:it.mark||"",parts:(it.parts||[])};});' +
      'rvNewItems=[];rvSlotCfg={};rvMarkOv={};rvEyeOv=null;rvTitleOv=null;rvMemoOv=null;EXASKSNAP=null;EXADDFROM="exAsk";EXHIDE={};' +
      'rvDochi=rvDochiDefault();cb();}' +
    'function exShort(n){var s=String(n||"");' +
      's=s.replace(/[ 　]*[（(][^（()）]*[@＠][0-9０-９][^（()）]*[)）]/g,"");' +
      's=s.replace(/[ 　]*全[0-9０-９]+回.*$/,"");' +
      's=s.replace(/[ 　]*[0-9０-９]+回目.*$/,"");' +
      's=s.replace(/[ 　]*[@＠][0-9０-９,]+.*$/,"");' +
      'for(var k=0;k<2;k++){var t=s.replace(/[ 　:：・,、]*(あり|なし|有り|無し)[ 　。．]*$/,"").replace(/[ 　:：・,、]+$/,"");if(t===s)break;s=t;}' +
      'return s.replace(/[ 　:：・,、]+$/,"")||String(n||"");}' +
    'function exAskName(n){var s=exShort(n);var K="一二三四五六七八九十〇零壱弐参";' +
      's=s.replace(new RegExp("[ 　]*[（(][^（()）]*(?:有効期限|期限|使用期限)[^（()）]*[)）]","g"),"");' +
      's=s.replace(new RegExp("[ 　]*[＋+][0-9０-９"+K+"]+回?(?:フリー|プレゼント|プレ|🎁)?","g"),"");' +
      's=s.replace(new RegExp("[ 　]*全?[0-9０-９"+K+"]+回[ 　]*(?:おまとめ|まとめ|コース|分|パック|セット)","g"),"");' +
      's=s.replace(new RegExp("[ 　]*(?:おまとめ|まとめ|お|御)[0-9０-９"+K+"]+回","g"),"");' +
      's=s.replace(/[ 　]*(?:おまとめ|まとめ買い)/g,"");' +
      's=s.replace(/[ 　]*都度(?:払い)?/g,"");' +
      's=s.replace(/[ 　]*購入(?:済み|済)?/g,"");' +
      's=s.replace(/メンキャ|キャンペーン/g,"").replace(/キャ(?!ンセル)/g,"").replace(/[①-⑳]/g,"");' +
      's=s.replace(new RegExp("[ 　]*[0-9０-９"+K+"]+回(?![目])","g"),"");' +
      's=s.replace(/[ 　]*[（(][ 　]*[)）]/g,"");' +
      'function cnt(x,ch){return x.split(ch).length-1;}' +
      'while(cnt(s,")")>cnt(s,"(")&&s.indexOf(")")>=0)s=s.replace(")","");' +
      'while(cnt(s,"）")>cnt(s,"（")&&s.indexOf("）")>=0)s=s.replace("）","");' +
      'while(cnt(s,"(")>cnt(s,")")&&s.lastIndexOf("(")>=0){var i1=s.lastIndexOf("(");s=s.slice(0,i1)+s.slice(i1+1);}' +
      'while(cnt(s,"（")>cnt(s,"）")&&s.lastIndexOf("（")>=0){var i2=s.lastIndexOf("（");s=s.slice(0,i2)+s.slice(i2+1);}' +
      's=s.replace(/[ 　]{2,}/g," ").replace(/^[ 　:：;；・,、_]+/,"").replace(/[ 　:：;；・,、_]+$/,"");' +
      'return s||exShort(n);}' +
    'function exChosen(){var a=[];for(var i=0;i<rvitems.length;i++){if(rvitems[i].do&&!rvitems[i].finish)a.push(rvitems[i].name);}' +
      'for(var k=0;k<rvNewItems.length;k++)a.push(rvNewItems[k]);return a;}' +
    'function exUnits(){var a=[],mi={};' +
      'function put(n){var k=exShort(n).replace(/[ 　:：・]/g,"");if(k&&mi[k])return;if(k)mi[k]=1;a.push(n);}' +
      'for(var i=0;i<rvitems.length;i++){var it=rvitems[i];if(!it.do||it.finish)continue;' +
      'var ps=it.parts||[];if(ps.length>=2){for(var j=0;j<ps.length;j++)put(ps[j]);}else put(it.name);}' +
      'for(var k=0;k<rvNewItems.length;k++)put(rvNewItems[k]);return a;}' +
    'function exGroupsOf(t){var gs=rvctx.dur_groups||[];var seen={},out=[],i=0;t=String(t||"").toUpperCase();' +
      'while(i<t.length){var hit="";' +
        'for(var j=0;j<gs.length;j++){if(t.substr(i,gs[j][0].length)===gs[j][0]){hit=gs[j][0];' +
          'if(!seen[gs[j][1]]){seen[gs[j][1]]=1;out.push(gs[j][1]);}break;}}' +
        'if(hit)i+=hit.length;else i++;}' +
      'if(seen["ハイドラ"]&&seen["ナノカレント"])out=out.filter(function(x){return x!=="ナノカレント";});' +
      'return out;}' +
    'function exRoomTip(names){var ru=rvctx.room_use||{};var gs=exGroupsOf((names||[]).join(" "));' +
      'var cnt={},tot=0;for(var i=0;i<gs.length;i++){var m=ru[gs[i]]||{};' +
        'for(var r in m){cnt[r]=(cnt[r]||0)+m[r];tot+=m[r];}}' +
      'if(tot<10)return "";' +
      'var rs=Object.keys(cnt).sort(function(a,b){return cnt[b]-cnt[a];});' +
      'var pc=function(r){return Math.round(cnt[r]*100/tot);};' +
      'var h="💡 この施術（"+esc(gs.join("・"))+"）は "+esc(shortRoomName_(rs[0]))+" の使用が最も多い（"+pc(rs[0])+"%）";' +
      'var al=[];for(var k=1;k<rs.length;k++){if(pc(rs[k])>=15)al.push(esc(shortRoomName_(rs[k]))+"（"+pc(rs[k])+"%）");}' +
      'if(al.length)h+="、"+al.join("・")+"も使うことがある";' +
      'return h;}' +
    'function exDurGroup(t){var gs=rvctx.dur_groups||[];var seen={},n=0,last="",i=0;' +
      'while(i<t.length){var hit="";' +
        'for(var j=0;j<gs.length;j++){if(t.substr(i,gs[j][0].length)===gs[j][0]){hit=gs[j][0];' +
          'if(!seen[gs[j][1]]){seen[gs[j][1]]=1;n++;last=gs[j][1];}break;}}' +
        'if(hit)i+=hit.length;else i++;}' +
      'if(seen["ハイドラ"]&&seen["ナノカレント"]){n--;last="ハイドラ";}' +
      'return (n===1)?last:"";}' +
    'function exDurOf(ns){var t=ns.join(" ").toUpperCase();var best=0;' +
      'var sv=(rvctx.dur_solo||{})[exDurGroup(t)];' +
      'if(sv)best=sv;else{var w=rvctx.dur_words||{};' +
      'for(var k in w){if(w.hasOwnProperty(k)&&t.indexOf(k.toUpperCase())>=0&&w[k]>best)best=w[k];}}' +
      'if(t.indexOf("プロセル")>=0||t.indexOf("プロ肌")>=0||t.indexOf("プロ頭")>=0)best=rvctx.dur_procell||70;' +
      'return best||rvctx.dur_default||30;}' +
    'function exMarkOfNames(ns){var t=ns.join(" ");var tm=(rvctx.title_marks||[]);' +
      'for(var k=0;k<rvitems.length;k++){if(rvitems[k].mark&&ns.indexOf(rvitems[k].name)>=0)return rvitems[k].mark;}' +
      'for(var i=0;i<tm.length;i++){var w=tm[i][1]||[];for(var j=0;j<w.length;j++){if(t.indexOf(w[j])>=0)return tm[i][0];}}' +
      'return "";}' +
    'function exNowBlock(note){var s=String(note||"");var i=s.indexOf("現在進行中");if(i<0)return "";' +
      'var ls=s.slice(i).split("\\n"),out=[];' +
      'for(var k=1;k<ls.length;k++){var t=ls[k];' +
        'if(t.indexOf("お支払い状況")>=0||t.indexOf("終了")>=0||t.replace(/\\s/g,"").indexOf("ーー")===0)break;' +
        'out.push(t);}' +
      'while(out.length&&!String(out[out.length-1]).trim())out.pop();' +
      'return out.join("\\n");}' +
    'function exShowAsk(){exOpen("exAsk");' +
      'exEl("exaskwho").innerHTML="「"+esc(disp())+"」"+(rvctx.name?esc(rvctx.name)+"様":"");' +
      'var _nb=exNowBlock(rvctx.prev_note||"");' +
      'exEl("exaskprev").innerHTML=(rvctx.prev_date?("<div class=\\"exsec\\">前回の予約（"+esc(rvctx.prev_date)+" "+esc(rvctx.prev_time||"")+"）"+(_nb?"の⭐️現在進行中":"")+"</div>"):"")+' +
        '"<div class=\\"rvprevmemo'+'"+(_nb?" rvnowall":"")+"'+'\\">"+esc(_nb||(rvctx.prev_note||""))+"</div>";' +
      'var ns=[];for(var i=0;i<rvitems.length;i++){if(!rvitems[i].do)continue;var _an=exAskName(rvitems[i].name);if(_an&&ns.indexOf(_an)<0)ns.push(_an);}' +
      'var MRU_=["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩"];' +
      'var KAZ_=["","","両方","三つとも","四つとも","五つとも","六つとも","七つとも","八つとも","九つとも","十とも"];' +
      'var _q="今回やる施術を選択してください😊";' +
      'if(ns.length===1){_q="今回も「"+ns[0]+"」をやりますか？😊";}' +
      'else if(ns.length>=2){var _t=[];for(var _i=0;_i<ns.length;_i++){_t.push((MRU_[_i]||("("+(_i+1)+")"))+ns[_i]);}' +
      'var _k=KAZ_[ns.length]||(ns.length+"つとも");' +
      '_q="今回も「"+_t.join("　")+"」を、"+_k+"やりますか？😊";}' +
      'exEl("exaskq").textContent=_q;' +
      'exEl("exaskyes").style.display=ns.length?"":"none";}' +
    'function exShowPick(){exOpen("exPickItems");exDrawPick();}' +
    'function exDrawPick(){var h="",hid=0;' +
      'for(var i=0;i<rvitems.length;i++){if(EXHIDE[i]){hid++;continue;}h+="<button type=\\"button\\" class=\\"exp pick"+(rvitems[i].do?" sel":"")+"\\" data-expk=\\""+i+"\\" style=\\"display:block;width:100%;text-align:left;margin:6px 0;padding:14px 12px;font-size:19px\\">"+(rvitems[i].do?"✓ ":"　")+esc(exAskName(rvitems[i].name))+"</button>";}' +
      'exEl("expkitems").innerHTML=h||(hid?"<div class=\\"exnone\\">下の「＋ メニューから追加」から、今回やる施術を選択してください😊</div>":"<div class=\\"exnone\\">前回の施術がありません</div>");' +
      'exEl("expkGo").style.display=exChosen().length?"":"none";' +
      'var n="";for(var k=0;k<rvNewItems.length;k++){n+="<div class=\\"rvcard\\"><div class=\\"rvname\\">◉ "+esc(rvNewItems[k])+"（今回から）</div><button type=\\"button\\" class=\\"rvb\\" data-expknew=\\""+k+"\\" style=\\"background:#fde2e4;color:#9b1c31;border-color:#f3b4bd\\">やめる</button></div>";}' +
      'exEl("expknew").innerHTML=n;' +
      'exEl("expkGo").textContent=rvNewItems.length?"追加メニューはこれだけ":"これで決定→";}' +
    'function exShowAdd(){exOpen("exAdd");var ns=exChosen();' +
      'exEl("exaddq").textContent="「"+ns.map(exAskName).join("＋")+"」以外にやるメニューはありますか？😊";' +
      'var n="";for(var k=0;k<rvNewItems.length;k++){n+="<div class=\\"rvcard\\"><div class=\\"rvname\\">◉ "+esc(rvNewItems[k])+"（今回から）</div><button type=\\"button\\" class=\\"rvb\\" data-exaddel=\\""+k+"\\" style=\\"background:#fde2e4;color:#9b1c31;border-color:#f3b4bd\\">やめる</button></div>";}' +
      'exEl("exaddlist").innerHTML=n;}' +
    'function exAfterItems(){var ns=exChosen();var us=exUnits();' +
      'if(!ns.length){szPopup_("今回やる施術を1つ以上選択してください😊");return;}' +
      'if(us.length<2){exSetGroups([ns]);exShowStaff();return;}' +
      'exOpen("exSplit");' +
      'var h="";for(var i=0;i<us.length;i++)h+="<div class=\\"rvcard\\"><div class=\\"rvname\\">◉ "+esc(exAskName(us[i]))+"</div></div>";' +
      'exEl("exspunits").innerHTML=h;}' +
    'function exSameAsPrev(){if(rvNewItems.length)return false;' +
      'var hasAri=false;' +
      'for(var i=0;i<rvitems.length;i++){if(String(rvitems[i].arinashi||"")==="あり")hasAri=true;}' +
      'for(var k=0;k<rvitems.length;k++){var it=rvitems[k];' +
        'if(it.finish)return false;' +
        'var mk=String(it.arinashi||"");' +
        'var zen=hasAri?(mk==="あり"):(mk!=="なし");' +
        'if(zen!==!!it.do)return false;}' +
      'return true;}' +
    'function exSetGroups(list){var g=[];for(var i=0;i<list.length;i++){if(!list[i].length)continue;' +
      'var _bd=exDurOf(list[i]);g.push({key:"g"+g.length,names:list[i],mark:exMarkOfNames(list[i]),dur:_bd,baseDur:_bd});}' +
      'EXFLOW={groups:g,split:(g.length>=2)};' +
      'for(var j=0;j<g.length;j++){rvSlotCfg[g[j].key]={room:roomVal(rvctx.prev_room||""),staff:staffNum(rvctx.prev_staff||""),dur:String(g[j].dur)};}}' +
    'var EXSTAFF="";' +
    'function exStaffDur(sn){var m=(rvctx&&rvctx.prev_dur_by_staff)||{};var v=m[SEMO_[sn]||""];' +
      'return (v&&parseInt(v.dur,10)>0)?v:null;}' +
    'function exMd(d){var p=String(d||"").split("-");return p.length===3?(parseInt(p[1],10)+"/"+parseInt(p[2],10)):"";}' +
    'function exShowStaff(){exOpen("exStaffSel");if(!EXSTAFF)EXSTAFF=staffNum(rvctx.prev_staff||"");exDrawStaff();}' +
    'function exSplitStaff(){var g=(EXFLOW&&EXFLOW.groups)||[];return g.length>=2;}' +
    'function exDrawStaff(){var SC={"1":"#d1443c","2":"#e08a1e","3":"#4b8b3b"};var SORD=["2","3","1"];var h="";' +
      'exEl("exstfGo").style.display=exSplitStaff()?"":"none";' +
      'if(exSplitStaff()){var g=EXFLOW.groups;' +
        'for(var gi=0;gi<g.length;gi++){var cs=rvSlotCfg_(g[gi].key).staff;var b="";' +
          'for(var q2=0;q2<SORD.length;q2++){var s2=SORD[q2];' +
            'b+="<button type=\\"button\\" class=\\"exp"+((s2===cs)?" sel":"")+"\\" data-exstfi=\\""+gi+"\\" data-exstfn=\\""+s2+"\\" style=\\"background:"+SC[s2]+"\\">"+SEMO_[s2]+" "+SNM_[s2]+"</button>";}' +
          'h+="<div class=\\"rvslot\\"><div class=\\"rvslottop\\">"+(gi+1)+"枠目　"+esc(g[gi].names.map(exAskName).join("＋"))+"</div><div class=\\"expills\\">"+b+"</div></div>";}' +
        'exEl("exstflist").innerHTML=h;return;}' +
      'var _si=SORD.indexOf(EXSTAFF);if(_si>0){SORD.splice(_si,1);SORD.unshift(EXSTAFF);}' +
      'for(var q=0;q<SORD.length;q++){var sn=SORD[q];var v=exStaffDur(sn);' +
        'var sub=v?("前回 "+v.dur+"分（"+exMd(v.date)+"）"):"前回の担当なし";' +
        'h+="<button type=\\"button\\" class=\\"exp"+((sn===EXSTAFF)?" sel":"")+"\\" data-exstf=\\""+sn+"\\" style=\\"display:block;width:100%;margin:10px 0;padding:16px 12px;font-size:21px;background:"+SC[sn]+"\\">"' +
          '+SEMO_[sn]+" "+SNM_[sn]+"<div style=\\"font-size:15px;font-weight:700;margin-top:4px\\">"+sub+"</div></button>";}' +
      'exEl("exstflist").innerHTML=h;}' +
    'function exApplyStaff(sn){EXSTAFF=sn;var g=(EXFLOW&&EXFLOW.groups)||[];' +
      'for(var j=0;j<g.length;j++){g[j].dur=g[j].baseDur;rvSlotCfg_(g[j].key).staff=sn;}' +
      'var _fx=(rvctx.dur_fixed||{})[g.length===1?exDurGroup(g[0].names.join(" ").toUpperCase()):""];' +
      'var v=exStaffDur(sn);if(g.length===1&&v&&!_fx&&exSameAsPrev())g[0].dur=nearDur(v.dur);}' +
    'function sgStaffOK(who){return !EXSTAFF||staffNum(who)===EXSTAFF;}' +
    'function sgStaffNote(){return EXSTAFF?("押せるのは "+SEMO_[EXSTAFF]+SNM_[EXSTAFF]+" の空きだけです"):"";}' +
    'function exShowGroup(){exOpen("exGroup");var ns=exUnits();EXGRP=[];' +
      'for(var i=0;i<ns.length;i++)EXGRP.push(i+1);exDrawGroup();}' +
    'var EXGRP=[];' +
    'function exDrawGroup(){var ns=exUnits();var h="";' +
      'for(var i=0;i<ns.length;i++){var b="";' +
        'for(var n=1;n<=ns.length;n++){b+="<button type=\\"button\\" class=\\"exp plain"+(EXGRP[i]===n?" sel":"")+"\\" data-exgi=\\""+i+"\\" data-exgn=\\""+n+"\\">"+n+"</button>";}' +
        'h+="<div class=\\"rvslot\\"><div class=\\"rvname\\">◉ "+esc(exAskName(ns[i]))+"</div><div class=\\"expills\\">"+b+"</div></div>";}' +
      'exEl("exgrplist").innerHTML=h;}' +
    'function exShowOrder(){var g=(EXFLOW&&EXFLOW.groups)||[];' +
      'if(g.length<2){exShowStaff();return;}exOpen("exOrder");exDrawOrder();}' +
    'function exDrawOrder(){var g=(EXFLOW&&EXFLOW.groups)||[];var h="";' +
      'for(var i=0;i<g.length;i++){' +
        'h+="<div class=\\"rvslot\\"><div class=\\"rvslottop\\">"+(i+1)+"枠目　"+esc(g[i].names.map(exAskName).join("＋"))+"</div>"' +
        '+(i>0?("<button type=\\"button\\" class=\\"exp plain\\" data-exup=\\""+i+"\\">↑ 上へ</button>"):"")+"</div>";}' +
      'exEl("exorderlist").innerHTML=h;}' +
    'var EXSLOTI=1;' +
    'function exSlotStart(i){var g=(EXFLOW&&EXFLOW.groups)||[];' +
      'var t=(rvctx._tm||"00:00").split(":");var acc=parseInt(t[0],10)*60+parseInt(t[1],10);' +
      'for(var k=0;k<i&&k<g.length;k++){var c=rvSlotCfg_(g[k].key);acc+=parseInt(c.dur,10)||30;}' +
      'return exP2(Math.floor(acc/60))+":"+exP2(acc%60);}' +
    'function exShowSlotPick(i){var g=(EXFLOW&&EXFLOW.groups)||[];' +
      'if(i>=g.length){exShowTitle();return;}' +
      'EXSLOTI=i;exOpen("exSlotPick");exDrawSlotPick();}' +
    'function exDrawSlotPick(){var g=(EXFLOW&&EXFLOW.groups)||[];var i=EXSLOTI;if(i>=g.length)return;' +
      'var mk=g[i].key;var cf=rvSlotCfg_(mk);' +
      'exEl("exspkhead").textContent=(i+1)+"枠目　"+exSlotLabel(mk)+"　開始 "+exSlotStart(i)+"（自動）";' +
      'var SC={"1":"#d1443c","2":"#e08a1e","3":"#4b8b3b","4":"#c9a227"};' +
      'var RORD=["FREEDOM","HAPPY","LUCKY","STAR/福/🇫🇷"],SORD=["2","3","1","4"];' +
      'var rh="";for(var r=0;r<RORD.length;r++){var rk=RORD[r];' +
        'rh+="<button type=\\"button\\" class=\\"exp"+((rk===cf.room)?" sel":"")+"\\" data-spkr=\\""+esc(rk)+"\\" style=\\"background:"+roomColor_(rk)+"\\">"+esc(shortRoomName_(rk))+"</button>";}' +
      'exEl("exspkroom").innerHTML=rh;' +
      'var _tp=exRoomTip(g[i].names);var _te=exEl("exspktip");_te.innerHTML=_tp;_te.style.display=_tp?"":"none";' +
      'var fr=exSlotFree(i);' +
      'var sh="";for(var q=0;q<SORD.length;q++){var sn=SORD[q];var ng=fr&&fr.indexOf(sn)<0;' +
        'sh+="<button type=\\"button\\" class=\\"exp"+((sn===cf.staff)?" sel":"")+"\\" data-spks=\\""+sn+"\\""+(ng?" data-spkng=\\"1\\"":"")+" style=\\"background:"+SC[sn]+(ng?";opacity:0.3;cursor:default":"")+"\\">"+SEMO_[sn]+" "+SNM_[sn]+"</button>";}' +
      'var nt="";' +
      'if(fr&&fr.indexOf(cf.staff)<0)nt="<div class=\\"sgtokunote\\">"+esc(SEMO_[cf.staff]||"")+esc(SNM_[cf.staff]||"")+"さんはこの時間に予約があります。空いている担当を選ぶか、← 戻るで時間を選択し直してください😊</div>";' +
      'else if(fr)nt="<div class=\\"exmhsub\\" style=\\"white-space:normal\\">薄い担当はこの時間に予約があるので選べません</div>";' +
      'exEl("exspkstaff").innerHTML=sh;exEl("exspkng").innerHTML=nt;}' +
    'function exSlotFree(i){if(EXSEL&&EXSEL.toku)return null;var g=(EXFLOW&&EXFLOW.groups)||[];if(!g[i])return null;' +
      'var p=exSlotStart(i).split(":");var a=parseInt(p[0],10)*60+parseInt(p[1],10);' +
      'var b=a+(parseInt(rvSlotCfg_(g[i].key).dur,10)||30);' +
      'var f=SGX.freeAt(a,b);return Array.isArray(f)?f:null;}' +
    'function exShowDur(){exOpen("exDur");' +
      'var pv=document.getElementById("exdurprev");' +
      'var pv2=EXSTAFF?exStaffDur(EXSTAFF):null;' +
      'if(pv)pv.textContent=(pv2?(SEMO_[EXSTAFF]+SNM_[EXSTAFF]+"の前回："+pv2.dur+"分"):"");' +
      'exDrawDur();}' +
    'function exDrawDur(){var g=(EXFLOW&&EXFLOW.groups)||[];var h="";' +
      'for(var i=0;i<g.length;i++){var p="";' +
        'for(var d=0;d<EXDURS.length;d++){p+="<button type=\\"button\\" class=\\"exp plain"+(String(EXDURS[d])===String(g[i].dur)?" sel":"")+"\\" data-exdi=\\""+i+"\\" data-exdv=\\""+EXDURS[d]+"\\">"+EXDURS[d]+"</button>";}' +
        'h+="<div class=\\"rvslot\\"><div class=\\"rvslottop\\">"+(g.length>1?((i+1)+"枠目　"):"")+esc(g[i].names.map(exAskName).join("＋"))+"</div><div class=\\"expills exdur\\">"+p+"</div></div>";}' +
      'var tot=exTotalMin();h+="<div class=\\"exsec\\">合計 "+tot+"分</div>";' +
      'exEl("exdurlist").innerHTML=h;}' +
    'function exTotalMin(){var g=(EXFLOW&&EXFLOW.groups)||[];var t=0;for(var i=0;i<g.length;i++)t+=(parseInt(g[i].dur,10)||30);return t;}' +
    'function exDurDone(){var g=(EXFLOW&&EXFLOW.groups)||[];' +
      'for(var i=0;i<g.length;i++){rvSlotCfg[g[i].key]=rvSlotCfg[g[i].key]||{};rvSlotCfg[g[i].key].dur=String(g[i].dur);}' +
      'if(g.length===1)rvsel.dur=String(g[0].dur);' +
      'var _g=(EXFLOW&&EXFLOW.groups)||[];' +
      'SGX.setSlot1(_g.length>=2?("1枠目　"+_g[0].names.map(exAskName).join("＋")):"");' +
      'SGX.setRoomTip(_g.length?exRoomTip(_g[0].names):"");' +
      'SGX.setNeed(exNeed1());SGX.goMonth();}' +
    'function exNeed1(){var g=(EXFLOW&&EXFLOW.groups)||[];if(!g.length)return exTotalMin();' +
      'var s0=rvSlotCfg_(g[0].key).staff,t=0;' +
      'for(var i=0;i<g.length;i++){if(i>0&&rvSlotCfg_(g[i].key).staff!==s0)break;t+=(parseInt(g[i].dur,10)||30);}' +
      'return t;}' +
    'function exSlotKeys(){if(EXFLOW&&EXFLOW.groups&&EXFLOW.groups.length>=2){var a=[];for(var i=0;i<EXFLOW.groups.length;i++)a.push(EXFLOW.groups[i].key);return a;}return rvEffMarks();}' +
    'function exSlotGroup(k){var g=(EXFLOW&&EXFLOW.groups)||[];for(var i=0;i<g.length;i++){if(g[i].key===k)return g[i];}return null;}' +
    'function exSlotMark(k){var g=exSlotGroup(k);return g?g.mark:k;}' +
    'function exSlotLabel(k){var g=exSlotGroup(k);return g?g.names.map(exAskName).join("＋"):("印「"+k+"」");}' +
    'var EXASKSNAP=null,EXADDFROM="exAsk",EXHIDE={};' +
    'exEl("exaskyes").onclick=function(){EXADDFROM="exAsk";exShowAdd();};' +
    'exEl("exaskno").onclick=function(){EXASKSNAP={d:rvitems.map(function(x){return x.do;}),n:rvNewItems.slice()};' +
      'var asked=[];EXHIDE={};for(var j=0;j<rvitems.length;j++){if(!rvitems[j].do)continue;var an=exAskName(rvitems[j].name);if(an&&asked.indexOf(an)<0)asked.push(an);}' +
      'if(asked.length===1){for(var k=0;k<rvitems.length;k++){if(rvitems[k].do)EXHIDE[k]=1;}}' +
      'for(var i=0;i<rvitems.length;i++)rvitems[i].do=false;exShowPick();};' +
    'exEl("exbackAsk").onclick=function(){hideSteps();exEl("exNum").style.display="";window.scrollTo(0,0);};' +
    'exEl("exbackPickItems").onclick=function(){if(EXASKSNAP&&EXASKSNAP.d.length===rvitems.length){' +
      'for(var i=0;i<rvitems.length;i++)rvitems[i].do=EXASKSNAP.d[i];rvNewItems=EXASKSNAP.n.slice();}' +
      'EXASKSNAP=null;EXHIDE={};exShowAsk();};' +
    'exEl("expkitems").addEventListener("click",function(e){var b=e.target.closest("[data-expk]");if(!b)return;' +
      'var i=parseInt(b.getAttribute("data-expk"),10);rvitems[i].do=!rvitems[i].do;exDrawPick();});' +
    'exEl("expknew").addEventListener("click",function(e){var b=e.target.closest("[data-expknew]");if(!b)return;' +
      'rvNewItems.splice(parseInt(b.getAttribute("data-expknew"),10),1);exDrawPick();});' +
    'exEl("expkAdd").onclick=function(){EXMENUBACK="exPickItems";showRvMenu("");};' +
    'function exBackToItems(){if(EXADDFROM==="exPickItems")exShowPick();else exShowAdd();}' +
    'exEl("expkGo").onclick=function(){if(!exChosen().length){szPopup_("今回やる施術を1つ以上選択してください😊");return;}EXADDFROM="exPickItems";exAfterItems();};' +
    'exEl("exbackAdd").onclick=function(){if(EXADDFROM==="exPickItems")exShowPick();else exShowAsk();};' +
    'exEl("exaddlist").addEventListener("click",function(e){var b=e.target.closest("[data-exaddel]");if(!b)return;' +
      'rvNewItems.splice(parseInt(b.getAttribute("data-exaddel"),10),1);exShowAdd();});' +
    'exEl("exaddyes").onclick=function(){EXMENUBACK="exAdd";showRvMenu("");};' +
    'exEl("exaddno").onclick=function(){exAfterItems();};' +
    'exEl("exbackSplit").onclick=function(){exBackToItems();};' +
    'exEl("exsplitsame").onclick=function(){exSetGroups([exChosen()]);exShowStaff();};' +
    'exEl("exsplitdiv").onclick=function(){var ns=exUnits();' +
      'if(ns.length===2){exSetGroups([[ns[0]],[ns[1]]]);exShowOrder();return;}exShowGroup();};' +
    'exEl("exbackGroup").onclick=function(){exAfterItems();};' +
    'exEl("exbackOrder").onclick=function(){exAfterItems();};' +
    'exEl("exorderlist").addEventListener("click",function(e){var b=e.target.closest("[data-exup]");if(!b)return;' +
      'var _y=window.scrollY||0;' +
      'var i=parseInt(b.getAttribute("data-exup"),10);var g=EXFLOW.groups;' +
      'var t=g[i-1];g[i-1]=g[i];g[i]=t;exDrawOrder();' +
      'try{window.scrollTo(0,_y);setTimeout(function(){window.scrollTo(0,_y);},0);}catch(e2){}});' +
    'exEl("exorderGo").onclick=function(){exShowStaff();};' +
    'exEl("exbackSlotPick").onclick=function(){if(EXSLOTI>1){exShowSlotPick(EXSLOTI-1);return;}SGX.toTime();};' +
    'exEl("exspkroom").addEventListener("click",function(e){var b=e.target.closest("[data-spkr]");if(!b)return;' +
      'var g=EXFLOW.groups;rvSlotCfg_(g[EXSLOTI].key).room=b.getAttribute("data-spkr");exDrawSlotPick();});' +
    'exEl("exspkstaff").addEventListener("click",function(e){var b=e.target.closest("[data-spks]");if(!b||b.getAttribute("data-spkng"))return;' +
      'var g=EXFLOW.groups;rvSlotCfg_(g[EXSLOTI].key).staff=b.getAttribute("data-spks");exDrawSlotPick();});' +
    'exEl("exspkGo").onclick=function(){var fr=exSlotFree(EXSLOTI);var cs=rvSlotCfg_(EXFLOW.groups[EXSLOTI].key).staff;' +
      'if(fr&&fr.indexOf(cs)<0){szPopup_(SEMO_[cs]+SNM_[cs]+"さんはこの時間に予約があります。\\n空いている担当を選ぶか、← 戻るで時間を選択し直してください😊");return;}' +
      'exShowSlotPick(EXSLOTI+1);};' +
    'exEl("exgrplist").addEventListener("click",function(e){var b=e.target.closest("[data-exgi]");if(!b)return;' +
      'EXGRP[parseInt(b.getAttribute("data-exgi"),10)]=parseInt(b.getAttribute("data-exgn"),10);exDrawGroup();});' +
    'exEl("exgrpGo").onclick=function(){var ns=exUnits();var mp={},ord=[];' +
      'for(var i=0;i<ns.length;i++){var n=EXGRP[i]||1;if(!mp[n]){mp[n]=[];ord.push(n);}mp[n].push(ns[i]);}' +
      'ord.sort(function(a,b){return a-b;});var list=[];for(var k=0;k<ord.length;k++)list.push(mp[ord[k]]);' +
      'exSetGroups(list);exShowOrder();};' +
    'exEl("exbackDur").onclick=function(){exShowStaff();};' +
    'exEl("exstflist").addEventListener("click",function(e){' +
      'var bs=e.target.closest("[data-exstfi]");' +
      'if(bs){rvSlotCfg_(EXFLOW.groups[parseInt(bs.getAttribute("data-exstfi"),10)].key).staff=bs.getAttribute("data-exstfn");exDrawStaff();return;}' +
      'var b=e.target.closest("[data-exstf]");if(!b)return;' +
      'exApplyStaff(b.getAttribute("data-exstf"));exShowDur();});' +
    'exEl("exstfGo").onclick=function(){var g=EXFLOW.groups;' +
      'for(var i=0;i<g.length;i++){if(!SEMO_[rvSlotCfg_(g[i].key).staff]||rvSlotCfg_(g[i].key).staff==="4"){szPopup_((i+1)+"枠目の担当を選択してください😊");return;}g[i].dur=g[i].baseDur;}' +
      'EXSTAFF=rvSlotCfg_(g[0].key).staff;exShowDur();};' +
    'exEl("exbackStaffSel").onclick=function(){var ns=exUnits();if(ns.length<2){exBackToItems();return;}' +
      'if(EXFLOW&&EXFLOW.groups.length>=2&&ns.length>=3){exShowGroup();return;}exAfterItems();};' +
    'exEl("exdurlist").addEventListener("click",function(e){var b=e.target.closest("[data-exdi]");if(!b)return;' +
      'EXFLOW.groups[parseInt(b.getAttribute("data-exdi"),10)].dur=parseInt(b.getAttribute("data-exdv"),10);exDrawDur();});' +
    'exEl("exdurGo").onclick=function(){exDurDone();};' +
    'function exHideA_(){var ids=["exrvprev","exrvitemsh","exrvsuggest","exrvnew","exrvAddBtn","exrvsingle"];' +
      'for(var i=0;i<ids.length;i++){var e=exEl(ids[i]);if(e)e.style.display="none";}' +
      'var box=exEl("exrvcntbox"),it=exEl("exrvitems");' +
      'if(box&&it&&it.parentNode!==box){box.appendChild(it);}' +
      'var ch=exEl("exrvcnth");if(ch)ch.style.display="none";}' +
    'function exShowTitle(){exOpen("exResv");exHideA_();EXSTEP="title";' +
      'exEl("exrvA").style.display="";exEl("exrvB").style.display="none";' +
      'exEl("exToConfirm").style.display="";' +
      'var _rd=exChosen().length>0;' +
      'var _mh=exEl("exrvmarksh");if(_mh)_mh.style.display=_rd?"none":"";' +
      'var _mp=exEl("exrvmarks");if(_mp)_mp.style.display=_rd?"none":"";' +
      'var _h=exEl("exrvhead");if(_h){_h.textContent="タイトル作成";_h.style.display="";}window.scrollTo(0,0);}' +
    'function exShowConfirm(){exOpen("exResv");exHideA_();EXSTEP="confirm";' +
      'exEl("exrvA").style.display="none";exEl("exrvB").style.display="";' +
      'var _h2=exEl("exrvhead");if(_h2)_h2.style.display="none";' +
      'var _ch2=exEl("exrvcnth");if(_ch2)_ch2.style.display="none";' +
      'var _cb=exEl("exrvcntbox");if(_cb)_cb.style.display="none";' +
      'rvUpdateNowMemo();window.scrollTo(0,0);}' +
    'var EXSTEP="";' +
    'exEl("exToConfirm").onclick=function(){exShowConfirm();};' +
    'function rvUpdateNowMemoDo(){var el=document.getElementById("exrvnowmemo");if(!el||!rvctx){exGoBusy_(false);return;}var decisions=[];for(var i=0;i<rvitems.length;i++){var it=rvitems[i];decisions.push({line_no:it.line_no,do:it.do,count:it.count,finish:it.finish});}var fields={number:disp(),new_memo:rvctx.new_memo||"",decisions:decisions,new_items:rvNewItems.slice(),date:rvctx._ymd,time:rvctx._tm,booking_services:rvBookingTexts(),paid:exPaid(),pay_parts:((rvctx&&rvctx.pay_parts)||[])};exPayNow("","",true);jsonp({action:"submit",key:KEY,op:"existing_apply_memo",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(fields)},function(r){if(!r||!r.ok||!r.id){exGoBusy_(false);return;}var tries=0;(function pll(){tries++;if(tries>60){var el3=document.getElementById("exrvnowmemo");if(el3&&rvMemoOv==null)el3.value="（時間がかかっています。もう一度試してもらえると嬉しいです🙇）";exGoBusy_(false);return;}jsonp({action:"status",key:KEY,id:r.id},function(st){if(!st||!st.ok){exGoBusy_(false);return;}if(st.status==="pending"||st.status==="running"||st.status==="queued"||st.status===""){setTimeout(pll,500);return;}if(st.status!=="done"){exGoBusy_(false);return;}var d={};try{d=JSON.parse(st.result||"{}");}catch(e){}var el2=document.getElementById("exrvnowmemo");if(el2&&rvMemoOv==null)el2.value=(d&&d.ok)?(d.memo||""):"（メモを作成できませんでした）";exGrowMemo();setTimeout(exGrowMemo,0);setTimeout(exGrowMemo,300);exPayRemovedNote(el2,(d&&d.memo)||"");exPaidNote(el2,(d&&d.paid_note)||"");exPayNow((rvMemoOv!=null&&el2)?el2.value:((d&&d.memo)||""),(d&&d.paid_note)||"");exGoBusy_(false);});})();});}' +
    'var rvSlotCfg={},rvLastSlotCount=0;' +
    'function rvSlotCfg_(mk){if(!rvSlotCfg[mk])rvSlotCfg[mk]={room:rvsel.room,staff:rvsel.staff,dur:rvsel.dur};return rvSlotCfg[mk];}' +
    'function rvSlotTitle_(mk,st,cf){var t=(rvctx.prev_title||"").split("新規").join("");var a=t.indexOf("預約");if(a<0&&disp())a=t.indexOf(disp());if(a<0)a=t.length;var head=rvStripHead(t.slice(0,a));var rest=rvStripSuf(t.slice(a));return (SEMO_[st]||"")+(mk||"")+head+rest+(cf?((cf.dochi?"都度":"")+(cf.eye?"イーライト":"")):rvSuffix());}' +
    'function rvDrawSlots(){var effM=exSlotKeys();var multi=(effM.length>=2);var single=document.getElementById("exrvsingle");var slotsEl=document.getElementById("exrvslots");var titleEl=document.getElementById("exrvtitle");var go=document.getElementById("exResvGo");if(!slotsEl)return;var sufW=document.getElementById("exrvsufwrap");var titleH=document.getElementById("exrvtitleh");if(!multi){if(single)single.style.display="";if(sufW)sufW.style.display="";if(titleH)titleH.style.display="";slotsEl.style.display="none";slotsEl.innerHTML="";if(titleEl)titleEl.style.display="";if(go)go.textContent="この内容でTimeTreeに登録する";return;}if(single)single.style.display="none";if(sufW)sufW.style.display="none";if(titleH)titleH.style.display="none";if(titleEl)titleEl.style.display="none";var SC={"1":"#d1443c","2":"#e08a1e","3":"#4b8b3b","4":"#c9a227"};var SORD=["2","3","1","4"];var RORD=["FREEDOM","HAPPY","LUCKY","STAR/福/🇫🇷"];var DUR=[15,20,30,40,45,50,60,70,80,90,120,150];var tmp=(rvctx._tm||"00:00").split(":");var acc=parseInt(tmp[0],10)*60+parseInt(tmp[1],10);var h="<div class=\\"exsec\\">タイトル（修正可能）</div>";for(var i=0;i<effM.length;i++){var mk=effM[i];var cf=rvSlotCfg_(mk);var hh=Math.floor(acc/60),mm=acc%60;var stt=("0"+hh).slice(-2)+":"+("0"+mm).slice(-2);if(EXFLOW){var _sf="";var _SFS=[["__none","なし"],["dochi","都度"],["eyelight","イーライト"]];for(var _q=0;_q<_SFS.length;_q++){var _k=_SFS[_q][0];var _on=(_k==="__none")?(!cf.dochi&&!cf.eye):((_k==="dochi")?cf.dochi:cf.eye);_sf+="<button type=\\"button\\" class=\\"exp"+(_on?" sel":"")+"\\" data-sufslot=\\""+esc(mk)+"\\" data-sufv=\\""+_k+"\\" style=\\"background:#475569\\">"+_SFS[_q][1]+"</button>";}h+="<div class=\\"rvslot\\"><div class=\\"rvslottop\\">"+(i+1)+"枠目　"+esc(exSlotLabel(mk))+"　開始 "+stt+"　"+esc(cf.dur)+"分</div><div class=\\"rvslotk\\">担当 "+esc((SEMO_[cf.staff]||"")+(SNM_[cf.staff]||""))+"　部屋 "+esc(shortRoomName_(cf.room))+"（前の画面で決めました）</div><div class=\\"rvslotk\\">末尾</div><div class=\\"expills\\">"+_sf+"</div><div class=\\"exrvtitle\\" style=\\"margin-top:8px\\">"+(i+1)+"枠目："+esc(rvSlotTitle_(exSlotMark(mk),cf.staff,cf))+"</div></div>";acc+=parseInt(cf.dur,10)||30;continue;}var rp="";for(var r=0;r<RORD.length;r++){var rk=RORD[r];rp+="<button type=\\"button\\" class=\\"exp"+(rk===cf.room?" sel":"")+"\\" data-rvslot=\\""+esc(mk)+"\\" data-rvsg=\\"room\\" data-rvsv=\\""+esc(rk)+"\\" style=\\"background:"+roomColor_(rk)+"\\">"+shortRoomName_(rk)+"</button>";}var sp="";for(var s=0;s<SORD.length;s++){var sn=SORD[s];sp+="<button type=\\"button\\" class=\\"exp"+(sn===cf.staff?" sel":"")+"\\" data-rvslot=\\""+esc(mk)+"\\" data-rvsg=\\"staff\\" data-rvsv=\\""+sn+"\\" style=\\"background:"+SC[sn]+"\\">"+SEMO_[sn]+" "+SNM_[sn]+"</button>";}var dp="";for(var d=0;d<DUR.length;d++){dp+="<button type=\\"button\\" class=\\"exp plain"+(String(DUR[d])===String(cf.dur)?" sel":"")+"\\" data-rvslot=\\""+esc(mk)+"\\" data-rvsg=\\"dur\\" data-rvsv=\\""+DUR[d]+"\\">"+DUR[d]+"</button>";}h+="<div class=\\"rvslot\\"><div class=\\"rvslottop\\">"+(i+1)+"枠目　"+esc(exSlotLabel(mk))+"　開始 "+stt+(i>0?"（自動）":"")+"</div><div class=\\"rvslotk\\">部屋</div><div class=\\"expills\\">"+rp+"</div><div class=\\"rvslotk\\">担当</div><div class=\\"expills\\">"+sp+"</div>"+(EXFLOW?"":"<div class=\\"rvslotk\\">施術時間（分）</div><div class=\\"expills exdur\\">"+dp+"</div>")+"<div class=\\"exrvtitle\\" style=\\"margin-top:8px\\">"+(i+1)+"枠目："+esc(rvSlotTitle_(exSlotMark(mk),cf.staff))+"</div></div>";acc+=parseInt(cf.dur,10)||30;}slotsEl.innerHTML=h;slotsEl.style.display="";if(go)go.textContent="この内容でTimeTreeに"+effM.length+"枠を登録する";}' +
    'document.getElementById("exrvslots").addEventListener("click",function(e){' +
      'var sb=e.target.closest("[data-sufslot]");' +
      'if(sb){var cf2=rvSlotCfg_(sb.getAttribute("data-sufslot"));var v=sb.getAttribute("data-sufv");' +
        'if(v==="__none"){cf2.dochi=false;cf2.eye=false;}else if(v==="dochi"){cf2.dochi=!cf2.dochi;}else{cf2.eye=!cf2.eye;}' +
        'rvDrawSlots();return;}' +
      'var b=e.target.closest("[data-rvslot]");if(!b)return;var cf=rvSlotCfg_(b.getAttribute("data-rvslot"));cf[b.getAttribute("data-rvsg")]=String(b.getAttribute("data-rvsv"));rvDrawSlots();});' +
    'document.getElementById("exrvmarks").addEventListener("click",function(e){var b=e.target.closest(".exp");if(!b)return;rvTitleOv=null;var mk=b.getAttribute("data-mark");if(mk==="__none"){var tm=(rvctx.title_marks||[]);for(var i=0;i<tm.length;i++){rvMarkOv[tm[i][0]]=false;}}else{rvMarkOv[mk]=!rvMarkOn(mk);}rvDrawMarks();});' +
    'document.getElementById("exrvsuf").addEventListener("click",function(e){var b=e.target.closest(".exp");if(!b)return;rvTitleOv=null;var k=b.getAttribute("data-suf");if(k==="__none"){rvDochi=false;rvEyeOv=false;}else if(k==="dochi"){rvDochi=!rvDochi;}else{rvEyeOv=!rvEyeOn();}rvDrawMarks();});' +
    'function drawRvItems(){var h="";for(var i=0;i<rvitems.length;i++){var it=rvitems[i];if(EXFLOW&&(!it.do||it.finish))continue;var cv=(it.do?it.count:it.orig);var cnt=(cv==null?"【要確認】":cv+"回目");h+="<div class=\\"rvcard\\" data-i=\\""+i+"\\"><div class=\\"rvname\\">"+esc(EXFLOW?exShort(it.name):it.name)+"</div>"+(EXFLOW?"":"<div class=\\"rvbtns\\"><button class=\\"rvb"+((it.do&&!it.finish)?" on":"")+"\\" data-act=\\"do\\">今回やる</button><button class=\\"rvb"+((!it.do&&!it.finish)?" on":"")+"\\" data-act=\\"skip\\">今回やらない</button><button class=\\"rvb"+(it.finish?" on":"")+"\\" data-act=\\"fin\\">終わった</button></div>")+"<div class=\\"rvcnt\\"><button class=\\"rvstep\\" data-act=\\"dec\\">−</button><span class=\\"rvcv"+(cv==null?" need":"")+"\\">"+cnt+"</span><button class=\\"rvstep\\" data-act=\\"inc\\">＋</button></div></div>";}if(!rvitems.length){h="<div class=\\"exnone\\" style=\\"background:rgba(255,255,255,.14)\\">前回のメモに施術が見つかりません</div>";}document.getElementById("exrvitems").innerHTML=h;}' +
    'function rvSelPill(g,v){var pl=document.querySelectorAll(".exp[data-eg=\\""+g+"\\"]");for(var i=0;i<pl.length;i++){pl[i].classList.toggle("sel",pl[i].getAttribute("data-ev")===String(v));}}' +
    'var rvAvail=null;' +
    'function rvStartMin_(){var t=(rvctx._tm||"00:00").split(":");return parseInt(t[0],10)*60+parseInt(t[1],10);}' +
    'function rvLoadAvail(){rvAvail=null;var dur=parseInt(rvsel.dur,10)||30;jsonp({action:"submit",key:KEY,op:"availability",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({date:rvctx._ymd,start_min:rvStartMin_(),dur:dur,exclude_number:disp()})},function(r){if(!r||!r.ok||!r.id)return;rvPollAvail(r.id);});}' +
    'function rvPollAvail(id){jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok)return;if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){rvPollAvail(id);},600);return;}if(r.status!=="done")return;var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}if(d&&d.ok){rvAvail={free_staff:(d.free_staff||[]).map(String),free_rooms:(d.free_rooms||[]).map(String)};rvFilterAvail();}});}' +
    'function rvStaffFree_(n){return !rvAvail||rvAvail.free_staff.indexOf(String(n))>=0;}' +
    'function rvRoomFree_(k){return !rvAvail||rvAvail.free_rooms.indexOf(String(k))>=0;}' +
    'function rvFilterAvail(){if(!rvAvail)return;var fs=rvAvail.free_staff,fr=rvAvail.free_rooms;var sp=document.querySelectorAll("#exrvstaff .exp");for(var i=0;i<sp.length;i++){sp[i].style.display=(fs.indexOf(sp[i].getAttribute("data-ev"))<0)?"none":"";}var rp=document.querySelectorAll("#exrvroom .exp");for(var j=0;j<rp.length;j++){rp[j].style.display=(fr.indexOf(rp[j].getAttribute("data-ev"))<0)?"none":"";}var sn=document.getElementById("exrvstaffnone");if(sn)sn.style.display=(fs.length===0)?"":"none";var rn=document.getElementById("exrvroomnone");if(rn)rn.style.display=(fr.length===0)?"":"none";var sb=document.getElementById("exrvstaffbusy");if(sb)sb.style.display=(fs.length>0&&!rvStaffFree_(rvsel.staff))?"":"none";var rb=document.getElementById("exrvroombusy");if(rb)rb.style.display=(fr.length>0&&!rvRoomFree_(rvsel.room))?"":"none";if(EXSEL){var _sw2=document.getElementById("exrvstaffwrap");if(_sw2&&!rvStaffFree_(rvsel.staff))_sw2.style.display="";if(rb)rb.style.display="none";}}' +
    'document.getElementById("exrvitems").addEventListener("click",function(e){var card=e.target.closest(".rvcard");if(!card)return;var i=parseInt(card.getAttribute("data-i"),10);var it=rvitems[i];var act=e.target.getAttribute("data-act");if(!act)return;if(act==="do"){it.do=true;it.finish=false;}else if(act==="skip"){it.do=false;it.finish=false;}else if(act==="fin"){it.finish=true;it.do=false;}else if(act==="dec"){it.count=(it.count==null?1:Math.max(1,it.count-1));}else if(act==="inc"){it.count=(it.count==null?1:it.count+1);}rvTitleOv=null;drawRvItems();rvDrawMarks();});' +
    'document.getElementById("exrvstaff").addEventListener("click",function(e){var b=e.target.closest(".exp");if(!b)return;rvTitleOv=null;rvsel.staff=b.getAttribute("data-ev");rvSelPill("rvstaff",rvsel.staff);rvDrawMarks();});' +
    'document.getElementById("exrvtitle").addEventListener("input",function(){rvTitleOv=this.value;});' +
    'document.getElementById("exrvnowmemo").addEventListener("input",function(){rvMemoOv=this.value;exGrowMemo();});' +
    'document.getElementById("exrvroom").addEventListener("click",function(e){var b=e.target.closest(".exp");if(!b)return;rvsel.room=b.getAttribute("data-ev");rvSelPill("rvroom",rvsel.room);});' +
    'document.getElementById("exrvdur").addEventListener("click",function(e){var b=e.target.closest(".exp");if(!b)return;rvsel.dur=b.getAttribute("data-ev");rvSelPill("rvdur",rvsel.dur);rvLoadAvail();});' +
    'document.getElementById("exbackResv").addEventListener("click",function(){if(EXFLOW&&EXSTEP==="confirm"){exShowTitle();return;}if(EXSEL){SGX.toTime();return;}hideSteps();document.getElementById("exTime").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exResvGo").addEventListener("click",function(){if(exSlotKeys().length>=2){doRegisterMulti();}else{doRegister();}});' +
    'function doRegister(){if(rvAvail&&(!rvStaffFree_(rvsel.staff)||(!EXSEL&&!rvRoomFree_(rvsel.room)))){szPopup_("その時間に空いている担当・部屋を選択してください😊");return;}var decisions=[];for(var i=0;i<rvitems.length;i++){var it=rvitems[i];decisions.push({line_no:it.line_no,do:it.do,count:it.count,finish:it.finish});}var doing=rvDoingTexts();var roomKey=(rvsel.room==="STAR/福/🇫🇷")?"STAR":rvsel.room;var fields={number:disp(),date:rvctx._ymd,time:rvctx._tm,dur:parseInt(rvsel.dur,10)||30,room_key:roomKey,prev_title:rvctx.prev_title||"",staff_emoji:SEMO_[rvsel.staff]||"",doing_texts:doing,suffix:rvSuffix(),marks:rvEffMarks(),new_memo:rvctx.new_memo||"",decisions:decisions,new_items:rvNewItems.slice(),booking_services:rvBookingTexts(),paid:exPaid(),pay_parts:((rvctx&&rvctx.pay_parts)||[]),title_override:(rvTitleOv!=null?rvTitleOv:""),memo_override:(rvMemoOv!=null?rvMemoOv:"")};exOvShow_(szBusyHtml_("予約を登録中です"),"#2C7A99");jsonp({action:"submit",key:KEY,op:"existing_create",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(fields)},function(r){if(!r||!r.ok||!r.id){exOvHide_();szPopup_("エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇");return;}pollRegister(r.id,roomKey);});}' +
    'function pollRegister(id,roomKey){jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){exOvHide_();szPopup_("エラーが発生しました。もう一度試してもらえると嬉しいです🙇");return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollRegister(id,roomKey);},500);return;}if(r.status!=="done"){exOvHide_();szPopup_(esc(r.result)||"エラーが発生しました。りゅうさんに伝えてください🙇");return;}var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}var _al=ttAlias_(roomKey),_tt=_al?("https://timetreeapp.com/calendars/"+_al+"/events/"+(d.event_id||"")):"";exOvShow_("<div style=\\"font-size:92px;margin-bottom:16px;\\">✓</div><div style=\\"color:#fff;font-size:32px;font-weight:900;line-height:1.5;margin-bottom:24px;\\">予約を登録しました</div><button type=\\"button\\" id=\\"rvBack\\" style=\\"font:inherit;font-size:1.3rem;font-weight:800;color:#16a34a;background:#fff;border:0;border-radius:12px;padding:14px 26px;cursor:pointer;\\">予約入力に戻る</button>"+(_tt?"<button type=\\"button\\" id=\\"rvTt\\" style=\\"display:block;margin:14px auto 0;font:inherit;font-size:1.05rem;font-weight:800;color:#fff;background:rgba(255,255,255,.18);border:2px solid #fff;border-radius:12px;padding:12px 24px;cursor:pointer;\\">タイムツリーを確認</button>":""),"#16a34a");var bb=document.getElementById("rvBack");if(bb){bb.addEventListener("click",function(){location.href=TOPHREF;});}var tb=document.getElementById("rvTt");if(tb){tb.addEventListener("click",function(){window.open(_tt,"_blank");});}});}' +
    'function doRegisterMulti(){var decisions=[];for(var i=0;i<rvitems.length;i++){var it=rvitems[i];decisions.push({line_no:it.line_no,do:it.do,count:it.count,finish:it.finish});}var effM=exSlotKeys();var slots=[];for(var m=0;m<effM.length;m++){var mk=effM[m];var cf=rvSlotCfg_(mk);var rk=(cf.room==="STAR/福/🇫🇷")?"STAR":cf.room;slots.push({mark:exSlotMark(mk),room_key:rk,staff_emoji:(SEMO_[cf.staff]||""),dur:parseInt(cf.dur,10)||30});}rvLastSlotCount=slots.length;var fields={number:disp(),date:rvctx._ymd,time:rvctx._tm,prev_title:rvctx.prev_title||"",staff_emoji:SEMO_[rvsel.staff]||"",suffix:rvSuffix(),new_memo:rvctx.new_memo||"",decisions:decisions,new_items:rvNewItems.slice(),booking_services:rvBookingTexts(),paid:exPaid(),pay_parts:((rvctx&&rvctx.pay_parts)||[]),memo_override:(rvMemoOv!=null?rvMemoOv:""),slots:slots};exOvShow_(szBusyHtml_(slots.length+"枠の予約を登録中です"),"#2C7A99");jsonp({action:"submit",key:KEY,op:"existing_create_multi",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(fields)},function(r){if(!r||!r.ok||!r.id){exOvHide_();szPopup_("エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇");return;}pollRegisterMulti(r.id);});}' +
    'function pollRegisterMulti(id){jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){exOvHide_();szPopup_("エラーが発生しました。もう一度試してもらえると嬉しいです🙇");return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollRegisterMulti(id);},500);return;}if(r.status!=="done"){exOvHide_();szPopup_(esc(r.result)||"エラーが発生しました。りゅうさんに伝えてください🙇");return;}var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}var cnt=(d.count||rvLastSlotCount);exOvShow_("<div style=\\"font-size:92px;margin-bottom:16px;\\">✓</div><div style=\\"color:#fff;font-size:32px;font-weight:900;line-height:1.5;margin-bottom:24px;\\">"+cnt+"枠の予約を登録しました</div><button type=\\"button\\" id=\\"rvBack\\" style=\\"font:inherit;font-size:1.3rem;font-weight:800;color:#16a34a;background:#fff;border:0;border-radius:12px;padding:14px 26px;cursor:pointer;\\">予約入力に戻る</button>","#16a34a");var bb=document.getElementById("rvBack");if(bb){bb.addEventListener("click",function(){location.href=TOPHREF;});}});}' +
    'var pickStaff="",pickRoom="",availData=null,newYmd="",newSm=0;' +
    'var SNM_={"1":"トマト","2":"みかん","3":"オリーブ","4":"マンゴー"};' +
    'var SEMO_={"1":"🍅","2":"🍊","3":"🫒","4":"🥭"};' +
    'var RMAP_={"FREEDOM":{cal:"73208496",label:1},"HAPPY":{cal:"59950855",label:6},"LUCKY":{cal:"59950871",label:9},"STAR/福/🇫🇷":{cal:"86075789",label:10}};' +
    'function startPickFlow(){var hh=parseInt(tdig.slice(0,2),10),mm=parseInt(tdig.slice(2),10);var nd=(chgtype==="t")?new Date(chosen.date+"T00:00:00"):picked;newYmd=nd.getFullYear()+"-"+("0"+(nd.getMonth()+1)).slice(-2)+"-"+("0"+nd.getDate()).slice(-2);newSm=hh*60+mm;pickStaff="";pickRoom="";availData=null;var dur=(chosen.dur_min||30);exOvShow_("<div style=\\"font-size:66px;margin-bottom:20px;\\">⏳</div><div style=\\"color:#fff;font-size:33px;font-weight:800;line-height:1.5;margin-bottom:22px;\\">空きを確認しています</div><div style=\\"color:#eaf3f7;font-size:20px;line-height:1.8;max-width:420px;\\">その時間に空いている担当・部屋を調べています。少し待っててくださいね🥺</div>","#2C7A99");jsonp({action:"submit",key:KEY,op:"availability",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({date:newYmd,start_min:newSm,dur:dur,exclude_number:disp()})},function(r){if(!r||!r.ok||!r.id){exOvHide_();szPopup_("エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇");return;}pickFlowPoll(r.id);});}' +
    'function pickFlowPoll(id){jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){exOvHide_();szPopup_("エラーが発生しました。もう一度試してもらえると嬉しいです🙇");return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pickFlowPoll(id);},600);return;}if(r.status!=="done"){exOvHide_();szPopup_("エラーが発生しました。もう一度試してもらえると嬉しいです🙇");return;}var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}availData={free_staff:(d.free_staff||[]).map(String),free_rooms:(d.free_rooms||[]).map(String)};exOvHide_();showStaffPick();});}' +
    'function showStaffPick(){hideSteps();document.getElementById("exStaffPick").style.display="";var cur=staffNum(chosen.staff_emoji||"");var fs=(availData&&availData.free_staff)||[];if(fs.length===0){exNoSpace_("exspwho","exsplist","担当");return;}if(fs.length===1){exOnlyOne_("担当",fs[0],cur);return;}document.getElementById("exspwho").innerHTML="移す先："+exMoveLbl_()+"<br>現在の担当："+(SEMO_[cur]||"")+" "+(SNM_[cur]||"?")+"<div class=\\"exq\\">担当を変更しますか？😊</div>";var curBusy=(cur&&fs.indexOf(cur)<0);var h="<button class=\\"expk keep"+(curBusy?" dis":"")+"\\" data-v=\\"__keep\\">変更なし（<span class=\\"expkemo\\">"+(SEMO_[cur]||"")+"</span>"+(SNM_[cur]||"?")+"）</button>";if(curBusy){h+="<div class=\\"expknote\\">その時間「"+(SNM_[cur]||"")+"」は空いていないので、下の空いている担当から選択してください😊</div>";}var order=["2","3","1","4"];for(var i=0;i<order.length;i++){var n=order[i];if(n===cur)continue;if(fs.indexOf(n)<0)continue;h+="<button class=\\"expk\\" data-v=\\""+n+"\\"><span class=\\"expkemo\\">"+SEMO_[n]+"</span>"+SNM_[n]+"</button>";}document.getElementById("exsplist").innerHTML=h;window.scrollTo(0,0);}' +
    'function exNoSpace_(whoId,listId,what){var nm=(what==="担当")?"担当が全員うまっている":"部屋が全部うまっている";document.getElementById(whoId).innerHTML="移す先："+exMoveLbl_();document.getElementById(listId).innerHTML="<div class=\\"exnone\\">この時間は"+nm+"ので、移せません</div><button type=\\"button\\" class=\\"exgo\\" data-retime=\\"1\\">別の時間を選び直す</button>";var b=document.getElementById(listId).querySelector("[data-retime]");if(b){b.addEventListener("click",function(){hideSteps();document.getElementById("exTime").style.display="";window.scrollTo(0,0);});}window.scrollTo(0,0);}' +
    'function exOnlyOne_(what,v,cur){var isS=(what==="担当");var nm=isS?((SEMO_[v]||"")+(SNM_[v]||"?")+"さん"):roomBadge_(v,true);var who=isS?"exspwho":"exrpwho",lst=isS?"exsplist":"exrplist";document.getElementById(who).innerHTML="移す先："+exMoveLbl_()+"<div class=\\"exonly\\">この時間帯の"+(isS?"空き":"空き部屋")+"は "+nm+" だけです</div>";var keep=(v===cur);document.getElementById(lst).innerHTML="<button class=\\"expk one"+(keep?" keep":"")+"\\" data-v=\\""+(keep?"__keep":v)+"\\">"+what+(keep?"は":"を")+nm+(keep?"のまま":"にする")+"</button>";window.scrollTo(0,0);}' +
    'function roomBadge_(rk,small){var c=(typeof roomColor_==="function")?roomColor_(rk):"#64748b";var nm=(typeof shortRoomName_==="function")?shortRoomName_(rk):rk;return "<span class=\\""+(small?"expkroomS":"expkroom")+"\\" style=\\"background:"+c+"\\">"+nm+"</span>";}' +
    'function showRoomPick(){hideSteps();document.getElementById("exRoomPick").style.display="";var cur=roomVal(chosen.room||"");var fr=(availData&&availData.free_rooms)||[];if(fr.length===0){exNoSpace_("exrpwho","exrplist","部屋");return;}if(fr.length===1){exOnlyOne_("部屋",fr[0],cur);return;}document.getElementById("exrpwho").innerHTML="移す先："+exMoveLbl_()+"<br>現在の部屋："+roomBadge_(cur,true)+"<div class=\\"exq\\">部屋を変更しますか？😊</div>";var curBusy=(cur&&fr.indexOf(cur)<0);var h="<button class=\\"expk keep"+(curBusy?" dis":"")+"\\" data-v=\\"__keep\\">変更なし（"+roomBadge_(cur,true)+"）</button>";if(curBusy){h+="<div class=\\"expknote\\">その時間この部屋は空いていないので、下の空いている部屋から選択してください😊</div>";}var order=["FREEDOM","HAPPY","LUCKY","STAR/福/🇫🇷"];for(var i=0;i<order.length;i++){var rm=order[i];if(rm===cur)continue;if(fr.indexOf(rm)<0)continue;h+="<button class=\\"expk\\" data-v=\\""+rm+"\\">"+roomBadge_(rm)+"</button>";}document.getElementById("exrplist").innerHTML=h;window.scrollTo(0,0);}' +
    'document.getElementById("exsplist").addEventListener("click",function(e){var b=e.target.closest(".expk");if(!b||b.className.indexOf("dis")>=0)return;var v=b.getAttribute("data-v");pickStaff=(v==="__keep")?"":v;showRoomPick();});' +
    'document.getElementById("exrplist").addEventListener("click",function(e){var b=e.target.closest(".expk");if(!b||b.className.indexOf("dis")>=0)return;var v=b.getAttribute("data-v");pickRoom=(v==="__keep")?"":v;if(MULTI_){var p=MPLAN[MIDX];p.staff=pickStaff;p.room=pickRoom;MIDX++;exMultiPlanStep();return;}realChange(document.getElementById("exdone2"));});' +
    'var MPLAN=[],MIDX=0;' +
    'function exHm_(m){return ("0"+Math.floor(m/60)).slice(-2)+":"+("0"+(m%60)).slice(-2);}' +
    'function exMoveLbl_(){if(MULTI_&&MPLAN[MIDX]){return newYmd+" "+exHm_(MPLAN[MIDX].sm)+"（"+(MIDX+1)+"件目）";}return newYmd+" "+tdisp();}' +
    'function exPollJob_(id,cb){jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){cb(false,"通信に失敗しました。");return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){exPollJob_(id,cb);},500);return;}cb(r.status==="done",r.result||"");});}' +
    'function startMultiMove(){var hh=parseInt(tdig.slice(0,2),10),mm=parseInt(tdig.slice(2),10);var nd=(chgtype==="t")?new Date(chosen.date+"T00:00:00"):picked;newYmd=nd.getFullYear()+"-"+("0"+(nd.getMonth()+1)).slice(-2)+"-"+("0"+nd.getDate()).slice(-2);var base=hh*60+mm;var s0=exSm_(MULTI_[0]);MPLAN=MULTI_.map(function(r){return {r:r,sm:base+(exSm_(r)-s0),dur:(parseInt(r.dur_min,10)||30),staff:"",room:"",fs:[],fr:[]};});for(var i=0;i<MPLAN.length;i++){if(MPLAN[i].sm+MPLAN[i].dur>24*60){szPopup_("その時刻だと"+(i+1)+"件目が日付をまたいでしまいます。時刻を入力し直してください😊");return;}}chosen=MULTI_[0];exOvShow_(szBusyHtml_("空きを確認しています","移す先で、それぞれの予約の担当・部屋が空いているか調べています。少し待っててくださいね🥺"),"#2C7A99");exMultiAvail(0);}' +
    'function exMultiAvail(i){if(i>=MPLAN.length){exOvHide_();MIDX=0;exMultiPlanStep();return;}var p=MPLAN[i];jsonp({action:"submit",key:KEY,op:"availability",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({date:newYmd,start_min:p.sm,dur:p.dur,exclude_number:disp()})},function(r){if(!r||!r.ok||!r.id){exOvHide_();szPopup_("エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇");return;}exPollJob_(r.id,function(ok,res){if(!ok){exOvHide_();szPopup_("エラーが発生しました。もう一度試してもらえると嬉しいです🙇");return;}var d={};try{d=JSON.parse(res||"{}");}catch(e){}p.fs=(d.free_staff||[]).map(String);p.fr=(d.free_rooms||[]).map(String);exMultiAvail(i+1);});});}' +
    'function exPlanStaff_(q){return q.staff||staffNum(q.r.staff_emoji||"");}' +
    'function exPlanRoom_(q){return q.room||roomVal(q.r.room||"");}' +
    'function exMultiPlanStep(){while(MIDX<MPLAN.length){var p=MPLAN[MIDX];var fs=p.fs.slice(),fr=p.fr.slice();for(var j=0;j<MIDX;j++){var q=MPLAN[j];if(q.sm<p.sm+p.dur&&p.sm<q.sm+q.dur){var a=fs.indexOf(exPlanStaff_(q));if(a>=0)fs.splice(a,1);var b=fr.indexOf(exPlanRoom_(q));if(b>=0)fr.splice(b,1);}}chosen=p.r;availData={free_staff:fs,free_rooms:fr};newSm=p.sm;pickStaff="";pickRoom="";showStaffPick();return;}chosen=MULTI_[0];exMultiConfirm();}' +
    'function exMultiConfirm(){var t="この"+MPLAN.length+"件を移します。よろしいでしょうか？😊\\n";for(var i=0;i<MPLAN.length;i++){var p=MPLAN[i];var rk=exPlanRoom_(p);var rn=(typeof shortRoomName_==="function")?shortRoomName_(rk):rk;var sn=exPlanStaff_(p);t+="\\n"+(i+1)+"件目："+newYmd+" "+exHm_(p.sm)+"〜"+exHm_(p.sm+p.dur)+"　"+(SEMO_[sn]||"")+(SNM_[sn]||"")+"　"+rn;}szPopup_(t,{cancel:true,yesLabel:"移す",onYes:exMultiRunMove});}' +
    'function exMultiRunMove(){var p0=newYmd.split("-");var list=[];for(var i=0;i<MPLAN.length;i++){var p=MPLAN[i];var sd=new Date(parseInt(p0[0],10),parseInt(p0[1],10)-1,parseInt(p0[2],10),0,0,0,0);sd.setMinutes(p.sm);var ed=new Date(sd.getTime()+p.dur*60000);var f={cal:p.r.calendar_id,event:p.r.event_id,start:_iso(sd),end:_iso(ed)};if(p.staff){f.new_fruit=SEMO_[p.staff];}if(p.room&&RMAP_[p.room]){f.to_cal=RMAP_[p.room].cal;f.to_label=RMAP_[p.room].label;}list.push(f);}var md=parseInt(p0[1],10)+"月"+parseInt(p0[2],10)+"日 "+exHm_(MPLAN[0].sm);exMultiRun("change_reservation",list,MPLAN.length+"件を "+md+"〜 へ移しました");}' +
    'function exMultiRun(op,list,doneTitle){var i=0;function step(){if(i>=list.length){exOvShow_(szDoneHtml_(doneTitle,"予約入力に戻る"),"#16a34a");var b=document.getElementById("szDoneBack");if(b){b.addEventListener("click",function(){location.href=TOPHREF;});}return;}exOvShow_(szBusyHtml_("まとめて変更中です（"+(i+1)+"／"+list.length+"件目）"),"#2C7A99");jsonp({action:"submit",key:KEY,op:op,who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(list[i])},function(r){if(!r||!r.ok||!r.id){exMultiFail_(i);return;}exPollJob_(r.id,function(ok,res){var d={};try{d=JSON.parse(res||"{}");}catch(e){}if(!ok||(d&&d.ok===false)){exMultiFail_(i,ok?"":res);return;}i++;step();});});}step();}' +
    'function exMultiFail_(i,res){exOvHide_();szPopup_((i?(i+"件目までは変更できました。"):"")+(i+1)+"件目の変更に失敗しました。タイムツリーで確認してください🙇"+(res?("\\n"+esc(res)):""));}' +
    'document.getElementById("exbackStaffPick").addEventListener("click",function(){hideSteps();document.getElementById("exTime").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exbackRoomPick").addEventListener("click",function(){showStaffPick();});' +
    'function pickExtra(){var x="";if(pickStaff){x+="／担当を"+(SNM_[pickStaff]||"")+"へ";}if(pickRoom){x+="／部屋を"+pickRoom+"へ";}return x;}' +
    'var esel={dur:"",staff:"",room:""};' +
    'function selE(g,v){esel[g]=String(v);var pl=document.querySelectorAll(".exp[data-eg=\\""+g+"\\"]");for(var i=0;i<pl.length;i++){pl[i].classList.toggle("sel",pl[i].getAttribute("data-ev")===String(v));}}' +
    'function nearDur(v){v=parseInt(v,10)||30;var arr=[15,20,30,40,45,50,60,70,80,90,120,150],best=arr[0];for(var i=0;i<arr.length;i++){if(Math.abs(arr[i]-v)<Math.abs(best-v)){best=arr[i];}}return best;}' +
    'function roomVal(r){r=String(r||"").toLowerCase();if(r.indexOf("freedom")>=0){return "FREEDOM";}if(r.indexOf("happy")>=0){return "HAPPY";}if(r.indexOf("lucky")>=0){return "LUCKY";}if(r.indexOf("スター")>=0||r.indexOf("star")>=0||r.indexOf("福")>=0){return "STAR/福/🇫🇷";}return "FREEDOM";}' +
    'function staffNum(e){e=String(e||"");if(e.indexOf("🍅")>=0){return "1";}if(e.indexOf("🍊")>=0){return "2";}if(e.indexOf("🫒")>=0){return "3";}if(e.indexOf("🥭")>=0){return "4";}return "2";}' +
    'var epills=document.querySelectorAll(".exp");for(var _p=0;_p<epills.length;_p++){epills[_p].addEventListener("click",function(){selE(this.getAttribute("data-eg"),this.getAttribute("data-ev"));});}' +
    'var chgtype="dt";' +
    'function nameSuffix(){return (chosen&&chosen.name)?chosen.name+"様":"";}' +
    'var avail=null;' +
    'function loadAvail(){avail=null;jsonp({action:"submit",key:KEY,op:"availability",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({date:chosen.date,start_min:(chosen.start_min!=null?chosen.start_min:0),dur:(chosen.dur_min||30),exclude_number:disp()})},function(r){if(!r||!r.ok||!r.id){return;}pollAvail(r.id);});}' +
    'function pollAvail(id){jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollAvail(id);},600);return;}if(r.status!=="done"){return;}var d={};try{d=JSON.parse(r.result||"{}");}catch(e){}if(d&&d.ok){avail=d;var ed=document.getElementById("exEdit");if(ed&&ed.style.display!=="none"&&(chgtype==="staff"||chgtype==="room")){filterAvail();}}});}' +
    'function filterAvail(){if(!avail)return;var fs=(avail.free_staff||[]).map(String),fr=(avail.free_rooms||[]).map(String);var sp=document.querySelectorAll("#estaff .exp");for(var i=0;i<sp.length;i++){sp[i].style.display=(fs.indexOf(sp[i].getAttribute("data-ev"))>=0)?"":"none";}var rp=document.querySelectorAll("#eroom .exp");for(var j=0;j<rp.length;j++){rp[j].style.display=(fr.indexOf(rp[j].getAttribute("data-ev"))>=0)?"":"none";}var none=document.getElementById("exeditnone"),go=document.getElementById("exEditGo");if(chgtype==="staff"||chgtype==="room"){var empty=(chgtype==="staff")?(fs.length===0):(fr.length===0);var sec=document.getElementById(chgtype==="staff"?"secStaff":"secRoom");if(empty){if(none){none.style.display="";none.textContent=(chgtype==="staff")?"その時間は、担当の空きがありません":"その時間は部屋が空いていません";}if(sec)sec.style.display="none";if(go)go.style.display="none";}else{if(none)none.style.display="none";if(sec)sec.style.display="";if(go)go.style.display="";}}}' +
    'function hideSteps(){var ids=["exNum","exPick","exMenu","exDate","exTime","exEdit","exMemo","exStaffPick","exRoomPick","exResv","exrvMenu","exAsk","exPickItems","exAdd","exSplit","exGroup","exStaffSel","exDur","exOrder","exSlotPick","sgbackbar","sgMonth","sgDay","sgFree","sgTime"];for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el)el.style.display="none";}setExTop();}' +
    'function setExTop(){var nm=(chosen&&chosen.name)?chosen.name+"様":"";var t=disp()?("「"+disp()+"」"+nm+" の"+TITLE):"";var els=document.querySelectorAll(".extop");for(var i=0;i<els.length;i++){els[i].textContent=t;els[i].style.display=t?"":"none";}}' +
    'function exSumHtml(){if(MULTI_){var hm="<div class=\\"exmultih\\">まとめて変更する予約（"+MULTI_.length+"件）</div>";for(var i=0;i<MULTI_.length;i++){if(i)hm+="<div class=\\"exmultisep\\"></div>";hm+=exSumHtml1_(MULTI_[i]);}return hm;}return exSumHtml1_(chosen);}' +
    'function exSumHtml1_(chosen){var wd=["日","月","火","水","木","金","土"][new Date(chosen.date+"T00:00:00").getDay()];var cn=staffNum(chosen.staff_emoji||"");var rk=roomVal(chosen.room||"");var rc=(typeof roomColor_==="function")?roomColor_(rk):"#64748b";var rn=(typeof shortRoomName_==="function")?shortRoomName_(rk):rk;var parts=(chosen.parts||[]).join("・")||"—";var note=esc(chosen.note||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");var h="<div class=\\"exsumrow\\"><b>日時</b>"+chosen.date+"（"+wd+"） "+chosen.start_hm+"　"+(chosen.dur_min||"?")+"分</div>";h+="<div class=\\"exsumrow\\"><b>担当</b>"+(SEMO_[cn]||chosen.staff_emoji||"")+" "+(SNM_[cn]||"")+"</div>";h+="<div class=\\"exsumrow\\"><b>部屋</b><span class=\\"exsumroom\\" style=\\"background:"+rc+"\\">"+rn+"</span></div>";h+="<div class=\\"exsumrow\\"><b>部位</b>"+esc(parts)+"</div>";h+="<div class=\\"exsumrow\\"><b>メモ</b></div><div class=\\"exsummemo\\">"+(note||"（メモなし）")+"</div>";return h;}' +
    'function exNoteN_(s){return String(s||"").replace(/\\r\\n/g,"\\n").replace(/\\s+$/,"");}' +
    'function exMultiSameNote_(){if(!MULTI_)return true;for(var i=1;i<MULTI_.length;i++){if(exNoteN_(MULTI_[i].note)!==exNoteN_(MULTI_[0].note))return false;}return true;}' +
    'function showMenu(){hideSteps();document.getElementById("exMenu").style.display="";document.getElementById("exmsum").innerHTML=exSumHtml();var mb=document.querySelectorAll(".exmbtn");for(var i=0;i<mb.length;i++){var k=mb[i].getAttribute("data-chg");var hide=!!MULTI_&&(k==="staff"||k==="room"||k==="dur"||(k==="memo"&&!exMultiSameNote_()));mb[i].style.display=hide?"none":"";}var ad=document.getElementById("exAllDay");if(ad)ad.textContent=MULTI_?("この"+MULTI_.length+"件を終日にする"):"この予約を終日にする";if(!MULTI_)loadAvail();window.scrollTo(0,0);}' +
    'function goTime(){hideSteps();document.getElementById("exTime").style.display="";var wd=["日","月","火","水","木","金","土"][picked.getDay()];document.getElementById("exwhen").innerHTML="<div class=\\"exwd2\\">"+(picked.getMonth()+1)+"月"+picked.getDate()+"日（"+wd+"）</div>";tdig=initTdig_();tupd();window.scrollTo(0,0);}' +
    'function enterEdit(){hideSteps();document.getElementById("exEdit").style.display="";var _en=document.getElementById("exeditnone");if(_en)_en.style.display="none";var _eg=document.getElementById("exEditGo");if(_eg)_eg.style.display="";document.getElementById("secDur").style.display=(chgtype==="dur")?"":"none";document.getElementById("secStaff").style.display=(chgtype==="staff")?"":"none";document.getElementById("secRoom").style.display=(chgtype==="room")?"":"none";var lbl={dur:"施術時間",staff:"担当",room:"部屋"}[chgtype]||"";document.getElementById("exeditwho").innerHTML=lbl+"を変更";selE("dur",nearDur(chosen?chosen.dur_min:30));selE("staff",staffNum(chosen?chosen.staff_emoji:""));selE("room",roomVal(chosen?chosen.room:""));if(chgtype==="staff"||chgtype==="room"){filterAvail();}window.scrollTo(0,0);}' +
    'function enterMemo(){hideSteps();document.getElementById("exMemo").style.display="";document.getElementById("exmemowho").innerHTML="予約メモを変更";document.getElementById("exmemobox").value=(chosen&&chosen.note)||"";window.scrollTo(0,0);}' +
    'function summaryText(){var sn={"1":"トマト","2":"みかん","3":"オリーブ","4":"マンゴー"};var b="練習：この予約を ";var tail="（練習なので本物のタイムツリーには書き込んでいません）";if(chgtype==="dt"){return b+(picked.getMonth()+1)+"月"+picked.getDate()+"日 "+tdisp()+" に変更しました"+tail;}if(chgtype==="t"){return b+"時刻 "+tdisp()+"（同じ日）に変更しました"+tail;}if(chgtype==="staff"){return b+"担当を "+(sn[esel.staff]||"")+" に変更しました"+tail;}if(chgtype==="room"){return b+"部屋を "+esel.room+" に変更しました"+tail;}if(chgtype==="dur"){return b+"施術時間を "+esel.dur+"分 に変更しました"+tail;}if(chgtype==="memo"){return b+"予約メモを変更しました"+tail;}return "";}' +
    'function _p2(n){return (n<10?"0":"")+n;}function _iso(dt){return dt.getFullYear()+"-"+_p2(dt.getMonth()+1)+"-"+_p2(dt.getDate())+"T"+_p2(dt.getHours())+":"+_p2(dt.getMinutes())+":00";}' +
    'function doneMsg(){if(chgtype==="dur"){return "施術時間 "+esel.dur+"分 へ";}if(chgtype==="memo"){return "予約メモを";}if(chgtype==="staff"){return "担当を"+(SEMO_[esel.staff]||"")+" "+(SNM_[esel.staff]||"")+"へ";}if(chgtype==="room"){return "部屋を"+roomBadge_(esel.room,true)+"へ";}var lines=[];if(chgtype==="dt"){lines.push((picked.getMonth()+1)+"月"+picked.getDate()+"日 "+tdisp()+" へ");}else if(chgtype==="t"){lines.push("時刻を"+tdisp()+"（同じ日）へ");}if(pickStaff){lines.push("／担当を"+(SEMO_[pickStaff]||"")+" "+(SNM_[pickStaff]||"")+"へ");}if(pickRoom){lines.push("／部屋を"+roomBadge_(pickRoom,true)+"へ");}return lines.join("<br>");}' +
    'var TOPHREF="' + topHref + '";' +
    'function exOvShow_(html,bg){var ov=document.getElementById("exOverlay");if(!ov){ov=document.createElement("div");ov.id="exOverlay";document.body.appendChild(ov);}ov.style.cssText="position:fixed;inset:0;z-index:9999;background:"+bg+";display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center;";ov.innerHTML=html;return ov;}' +
    'function exOvHide_(){var ov=document.getElementById("exOverlay");if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);}' +
    'function realChange(doneEl){var fields={cal:chosen.calendar_id,event:chosen.event_id};if(chgtype==="dt"||chgtype==="t"){var hh=parseInt(tdig.slice(0,2),10),mm=parseInt(tdig.slice(2),10);var sd=new Date(picked.getFullYear(),picked.getMonth(),picked.getDate(),hh,mm,0,0);var ed=new Date(sd.getTime()+((chosen.dur_min||30)*60000));fields.start=_iso(sd);fields.end=_iso(ed);if(pickStaff){fields.new_fruit=SEMO_[pickStaff];}if(pickRoom&&RMAP_[pickRoom]){fields.to_cal=RMAP_[pickRoom].cal;fields.to_label=RMAP_[pickRoom].label;}}else if(chgtype==="dur"){var hm=(chosen.start_hm||"13:00").split(":");var sd=new Date(chosen.date+"T00:00:00");sd.setHours(parseInt(hm[0],10),parseInt(hm[1],10),0,0);var ed=new Date(sd.getTime()+(parseInt(esel.dur,10)*60000));fields.start=_iso(sd);fields.end=_iso(ed);}else if(chgtype==="memo"){fields.note=document.getElementById("exmemobox").value;}else if(chgtype==="staff"){if(!esel.staff){szPopup_("担当を選択してください😊");return;}fields.new_fruit=SEMO_[esel.staff];}else if(chgtype==="room"){if(!esel.room||!RMAP_[esel.room]){szPopup_("部屋を選択してください😊");return;}fields.to_cal=RMAP_[esel.room].cal;fields.to_label=RMAP_[esel.room].label;}else{szPopup_("この項目はまだ準備中です。");return;}exOvShow_("<div style=\\"font-size:66px;margin-bottom:20px;\\">⏳</div><div style=\\"color:#fff;font-size:33px;font-weight:800;line-height:1.5;margin-bottom:22px;\\">予約を変更中です</div><div style=\\"color:#eaf3f7;font-size:20px;line-height:1.8;max-width:420px;\\">タイムツリーへの書き込みが完了したら自動で画面が切り替わりますので、少し待っててくださいね🥺</div>","#2C7A99");jsonp({action:"submit",key:KEY,op:"change_reservation",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify(fields)},function(r){if(!r||!r.ok||!r.id){exOvHide_();szPopup_("エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇");return;}pollChange(r.id);});}' +
    'function ttAlias_(room){var r=(""+room).toLowerCase();if(r.indexOf("freedom")>=0)return"2AfH2fMvqXEH";if(r.indexOf("happy")>=0)return"eavbC5WSuUs6";if(r.indexOf("lucky")>=0)return"GPapusGepg5P";if(r.indexOf("cosmos")>=0)return"ojzXKACEbghC";if(r.indexOf("スター")>=0||r.indexOf("star")>=0||r.indexOf("福")>=0)return"KMkTNuLk3Qif";return"";}' +
    'function pollChange(id){jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){exOvHide_();szPopup_("エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇");return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollChange(id);},400);return;}if(r.status!=="done"){exOvHide_();szPopup_(esc(r.result)||"エラーが発生しました。りゅうさんに伝えてください🙇");return;}var _d2={};try{_d2=JSON.parse(r.result||"{}");}catch(e){}var _fev=(_d2&&_d2.new_event)||chosen.event_id;var _froom=chosen.room;if((chgtype==="dt"||chgtype==="t")&&pickRoom){_froom=pickRoom;}else if(chgtype==="room"&&esel.room){_froom=esel.room;}var _al=ttAlias_(_froom),_tt=_al?("https://timetreeapp.com/calendars/"+_al+"/events/"+_fev):"";exOvShow_("<div style=\\"font-size:92px;margin-bottom:16px;\\">✓</div><div style=\\"color:#fff;font-size:23px;font-weight:800;line-height:1.7;margin-bottom:10px;white-space:nowrap;\\">"+doneMsg()+"</div><div style=\\"color:#fff;font-size:30px;font-weight:900;margin-bottom:24px;\\">変更が完了しました</div><button type=\\"button\\" id=\\"exBackBtn\\" style=\\"font:inherit;font-size:1.3rem;font-weight:800;color:#16a34a;background:#fff;border:0;border-radius:12px;padding:14px 26px;cursor:pointer;\\">予約入力に戻る</button>"+(_tt?"<button type=\\"button\\" id=\\"exTtBtn\\" style=\\"display:block;margin:14px auto 0;font:inherit;font-size:1.15rem;font-weight:800;color:#fff;background:rgba(255,255,255,.18);border:2px solid #fff;border-radius:12px;padding:12px 24px;cursor:pointer;\\">タイムツリーを確認</button>":""),"#16a34a");var bb=document.getElementById("exBackBtn");if(bb){bb.addEventListener("click",function(){location.href=TOPHREF;});}var tb=document.getElementById("exTtBtn");if(tb){tb.addEventListener("click",function(){window.open(_tt,"_blank");});}});}' +
    'var mbtns=document.querySelectorAll(".exmbtn");for(var _mb=0;_mb<mbtns.length;_mb++){mbtns[_mb].addEventListener("click",function(){chgtype=this.getAttribute("data-chg");if(chgtype==="dt"){picked=null;goDate();}else if(chgtype==="t"){picked=new Date(chosen.date+"T00:00:00");goTime();}else if(chgtype==="memo"){enterMemo();}else{enterEdit();}});}' +
    'document.getElementById("exAllDay").addEventListener("click",function(){szPopup_((MULTI_?("この"+MULTI_.length+"件"):"この予約")+"を終日（キャンセル・保留）にしますか？😊\\n部屋と時間が空きます。名前とメモは残ります。",{cancel:true,yesLabel:"終日にする",onYes:doAllday});});' +
    'function doAllday(){if(MULTI_){exMultiRun("make_allday",MULTI_.map(function(r){return {cal:r.calendar_id,event:r.event_id};}),MULTI_.length+"件を終日にしました（部屋が空きました）");return;}exOvShow_(szBusyHtml_("終日にしています"),"#2C7A99");jsonp({action:"submit",key:KEY,op:"make_allday",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({cal:chosen.calendar_id,event:chosen.event_id})},function(r){if(!r||!r.ok||!r.id){exOvHide_();szPopup_("エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇");return;}pollAllday(r.id);});}' +
    'function pollAllday(id){jsonp({action:"status",key:KEY,id:id},function(r){if(!r||!r.ok){exOvHide_();szPopup_("エラーが発生しました。もう一度試してもらえると嬉しいです🙇");return;}if(r.status==="pending"||r.status==="running"||r.status==="queued"||r.status===""){setTimeout(function(){pollAllday(id);},400);return;}if(r.status!=="done"){exOvHide_();szPopup_(esc(r.result)||"エラーが発生しました。りゅうさんに伝えてください🙇");return;}exOvShow_(szDoneHtml_("終日にしました（部屋が空きました）","予約入力に戻る"),"#16a34a");var b=document.getElementById("szDoneBack");if(b){b.addEventListener("click",function(){location.href=TOPHREF;});}});}' +
    'document.getElementById("exbackMenu").addEventListener("click",function(){hideSteps();document.getElementById("exPick").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exbackMemo").addEventListener("click",function(){showMenu();});' +
    'document.getElementById("exMemoGo").addEventListener("click",function(){if(MULTI_){var nv=document.getElementById("exmemobox").value;exMultiRun("change_reservation",MULTI_.map(function(r){return {cal:r.calendar_id,event:r.event_id,note:nv};}),MULTI_.length+"件の予約メモを変更しました");return;}realChange(document.getElementById("exdone4"));window.scrollTo(0,document.body.scrollHeight);});' +
    'document.getElementById("exbackEdit").addEventListener("click",function(){document.getElementById("exEdit").style.display="none";document.getElementById("exMenu").style.display="";window.scrollTo(0,0);});' +
    'document.getElementById("exEditGo").addEventListener("click",function(){realChange(document.getElementById("exdone3"));window.scrollTo(0,document.body.scrollHeight);});' +
    'var EXSEL=null,PREF=null;' +
    'function exPaid(){return (EXSEL&&EXSEL.paid!=null)?String(EXSEL.paid):"";}' +
    'function exDiff_(a,b){var A=[],B=[],i,j;' +
      'for(i=0;i<a.length;i++){if(a[i].trim())A.push(a[i].trim());}' +
      'for(j=0;j<b.length;j++){if(b[j].trim())B.push(b[j].trim());}' +
      'var n=A.length,m=B.length,dp=[];' +
      'for(i=0;i<=n;i++){var row=[];for(j=0;j<=m;j++)row.push(0);dp.push(row);}' +
      'for(i=n-1;i>=0;i--)for(j=m-1;j>=0;j--)dp[i][j]=(A[i]===B[j])?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);' +
      'var out=[];i=0;j=0;' +
      'while(i<n&&j<m){if(A[i]===B[j]){i++;j++;}' +
        'else if(dp[i+1][j]>=dp[i][j+1]){out.push(["-",A[i]]);i++;}else{out.push(["+",B[j]]);j++;}}' +
      'while(i<n){out.push(["-",A[i]]);i++;}while(j<m){out.push(["+",B[j]]);j++;}return out;}' +
    'function exSay_(sign,line,line2){' +
      'var m1=line.match(/([0-9０-９]+)\\s*回目/),m2=line2?line2.match(/([0-9０-９]+)\\s*回目/):null;' +
      'if(sign==="~"&&m1&&m2&&m1[1]!==m2[1]){' +
        'var nm=line.slice(0,m1.index).replace(/^[◉●・\\s　]+/,"").replace(/[\\s　]+$/,"");' +
        'return esc(nm)+"　<b>"+esc(m1[1])+"回目</b> → <b>"+esc(m2[1])+"回目</b> にしました";}' +
      'var pay=line.match(/^[◉●・\\s　]*([0-9]{1,2}\\/[0-9]{1,2})\\s*分?\\s*[:：]\\s*(.*)$/);' +
      'if(pay&&sign!=="~"){' +
        'if(sign==="-")return "前回("+esc(pay[1])+")のお支払いの記録「"+esc(pay[2])+"」は、今回のメモには残しません";' +
        'return "お支払い状況に <b>"+esc(pay[1])+"分: "+esc(pay[2])+"</b> を追加しました";}' +
      'if(/^予約/.test(line)&&sign!=="~"){var t=line.replace(/^予約[\\s　]*/,"");' +
        'return (sign==="-")?("前回の予約の行「"+esc(t)+"」を削除しました")' +
          ':("今回の予約を書きました　<b>"+esc(t)+"</b>");}' +
      'if(sign==="~")return "<b>"+esc(line)+"</b> を <b>"+esc(line2)+"</b> に変更しました";' +
      'return "<b>"+esc(line)+"</b> を"+((sign==="-")?"削除しました":"追加しました");}' +
    'function exChangeLines_(prev,now){var d=exDiff_(String(prev||"").split("\\n"),String(now||"").split("\\n")),r=[],k=0;' +
      'while(k<d.length){var a=d[k],b=d[k+1];' +
        'if(a[0]==="-"&&b&&b[0]==="+"&&a[1].slice(0,4)===b[1].slice(0,4)){' +
          'r.push(exSay_("~",a[1],b[1]));k+=2;continue;}' +
        'r.push(exSay_(a[0],a[1],""));k++;}' +
      'return r;}' +
    'function exGrowMemo(){var t=document.getElementById("exrvnowmemo");' +
      'if(!t||!t.clientWidth)return;t.style.height="auto";t.style.height=(t.scrollHeight+6)+"px";}' +
    'function exPayRemovedNote(el,now){if(!el||!el.parentNode)return;var box=document.getElementById("exrvpayrm");' +
      'var prev=(typeof rvctx!=="undefined"&&rvctx&&rvctx.prev_note)||"";' +
      'var r=(prev&&now)?exChangeLines_(prev,now):[];' +
      'if(!r.length){if(box&&box.parentNode)box.parentNode.removeChild(box);return;}' +
      'if(!box){box=document.createElement("div");box.id="exrvpayrm";box.style.cssText="margin:8px 2px 0;font-size:15px;line-height:1.65;color:#5b4a00;background:#fff3cd;border-radius:12px;padding:10px 12px;font-weight:700;";' +
        'el.parentNode.insertBefore(box,el.nextSibling);}' +
      'var h="<div style=\\"font-weight:700;margin-bottom:2px\\">前回の予約メモからの変更点</div>";' +
      'for(var i=0;i<r.length;i++)h+="<div>・"+r[i]+"</div>";box.innerHTML=h;}' +
    'function exPaidNote(el,why){if(!el||!el.parentNode)return;var box=document.getElementById("exrvpaidnote");' +
      'if(!why){if(box&&box.parentNode)box.parentNode.removeChild(box);return;}' +
      'if(!box){box=document.createElement("div");box.id="exrvpaidnote";box.style.cssText="margin:8px 2px 0;font-size:15px;line-height:1.65;color:#14532d;background:#eaf7ee;border:1px solid #bfe3ca;border-radius:12px;padding:10px 12px;";' +
        'el.parentNode.insertBefore(box,el.nextSibling);}' +
      'box.textContent=why;}' +
    'function exPayNow(memo,why,busy){var b=document.getElementById("exrvpaynow");if(!b)return;' +
      'var ymd=String((rvctx&&rvctx._ymd)||"").split("-");' +
      'if(ymd.length!==3){b.style.display="none";return;}' +
      'var m=parseInt(ymd[1],10),d=parseInt(ymd[2],10);var md=m+"/"+d;' +
      'var G="color:#14532d;background:#eaf7ee;border:1px solid #bfe3ca",Y="color:#5b4a00;background:#fff3cd;border:1px solid #f1dc9c";' +
      'b.style.display="";' +
      'if(busy){b.style.cssText+=";"+Y;b.textContent="💰 "+md+"分のお支払い：調べています…";return;}' +
      'var re=new RegExp("(^|[^0-9])0?"+m+"/0?"+d+"分");var ls=String(memo||"").split("\\n"),hit=[],paid=0,unpaid=0;' +
      'for(var i=0;i<ls.length;i++){var t=ls[i];if(!re.test(t))continue;' +
        'if(t.indexOf("未払い")>=0)unpaid++;else if(t.indexOf("支払い済")>=0)paid++;else continue;' +
        'hit.push(t.replace(/^[\\s◉・]+/,"").trim());}' +
      'var h="";var cs=exCourseNow(memo);' +
      'if(!hit.length){if(cs.length&&!rvDochiDefault())h+="<div>💰 "+md+"分：コースで払い済み（その日のお支払いはありません）</div>";' +
        'else{h+="<div>💰 "+md+"分のお支払い：メモに書いてありません</div>";unpaid=1;}}' +
      'b.style.cssText+=";"+(unpaid?Y:G);' +
      'for(var k=0;k<hit.length;k++)h+="<div>💰 "+exHtml_(hit[k])+"</div>";' +
      'if(why)h+="<div style=\\"font-size:13px;font-weight:600;margin-top:2px\\">"+exHtml_(why)+"</div>";' +
      'if(cs.length){for(var c=0;c<cs.length;c++)h+="<div>📋 "+exHtml_(cs[c])+"</div>";}' +
      'else h+="<div>📋 今回やる施術に「全◯回の◯回目」の書き方はありません</div>";' +
      'b.innerHTML=h;}' +
    'function exCourseNow(memo){var s=String(memo||"");var i=s.indexOf("現在進行中");if(i<0)return [];' +
      'var ls=s.slice(i).split("\\n").slice(1),blk=[];' +
      'for(var k=0;k<ls.length;k++){var t=ls[k];' +
        'if(t.indexOf("お支払い状況")>=0||t.indexOf("終了")>=0||t.replace(/\\s/g,"").indexOf("ーー")===0)break;blk.push(t);}' +
      'var anyAri=blk.some(function(t){return /あり\\s*$/.test(t);});' +
      'var out=[],last="";' +
      'for(var j=0;j<blk.length;j++){var t2=String(blk[j]).trim();if(!t2)continue;' +
        'var m=t2.match(/全\\s*([0-9]+)\\s*回の\\s*([0-9]+)\\s*回目/);' +
        'var nm=t2.replace(/^[◉・\\s]+/,"");' +
        'if(!m){last=nm.replace(/[\\s:：]+$/,"");continue;}' +
        'if(anyAri&&!/あり\\s*$/.test(t2))continue;' +
        'var pre=nm.slice(0,nm.indexOf(m[0])).replace(/[\\s:：]+$/,"");' +
        'var n=parseInt(m[1],10),c=parseInt(m[2],10);' +
        'out.push((pre||last)+"：全"+n+"回の"+c+"回目"+(n>=c?"（このあと残り"+(n-c)+"回）":""));}' +
      'return out;}' +
    'function exHtml_(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[c];});}' +
    'function exP2(n){return ("0"+n).slice(-2);}' +
    'function exPrefetch(date){if(PREF&&PREF.date===date&&!PREF.err)return;var me={date:date,ctx:null,err:"",wait:null};PREF=me;' +
      'jsonp({action:"submit",key:KEY,op:"existing_build_ctx",who:idn.who,role:idn.role,device:idn.device,fields:JSON.stringify({number:disp(),date:date,time:""})},function(r){' +
        'if(PREF!==me)return;if(!r||!r.ok||!r.id){me.err="エラーが発生しました。通信に失敗しました。もう一度試してもらえると嬉しいです🙇";exPrefDone(me);return;}' +
        'var nm="exctx_"+String(r.id).toLowerCase().replace(/[^a-z0-9_]/g,"")+".json",n=0;' +
        'function tryData(){if(PREF!==me||me.ctx||me.err)return;n++;jsonp({action:"data",name:nm},function(ctx){' +
          'if(PREF!==me)return;if(ctx&&ctx.ok){me.ctx=ctx;exPrefDone(me);return;}' +
          'if(n%3===0){jsonp({action:"status",key:KEY,id:r.id},function(st){if(PREF!==me)return;' +
            'if(!st||!st.ok){setTimeout(tryData,700);return;}' +
            'if(st.status==="pending"||st.status==="running"||st.status==="queued"||st.status===""||st.status==="done"){setTimeout(tryData,st.status==="done"?0:700);return;}' +
            'me.err=esc(st.result)||"エラーが発生しました。りゅうさんに伝えてください🙇";exPrefDone(me);});return;}' +
          'setTimeout(tryData,700);});}' +
        'tryData();});}' +
    'function exPrefDone(me){if(me.ctx&&me.ctx.found){SGX.setAhead(me.ctx.paid_ahead||{});SGX.setAsk(false);}var w=me.wait;me.wait=null;if(w)w();}' +
    'function exGoMemo(st){if(!(EXFLOW&&PREF&&PREF.ctx)&&(!PREF||PREF.date!==st.date))exPrefetch(st.date);var me=PREF;' +
      'if(me.err){var m=me.err;PREF=null;szPopup_(m);return;}' +
      'if(!me.ctx){exOvShow_(szBusyHtml_("前回の予約を読み込み中です","読み終わったら自動で切り替わりますので、少し待っててくださいね🥺"),"#2C7A99");' +
        'me.wait=function(){exOvHide_();exGoMemo(SGX.state());};return;}' +
      'if(!me.ctx.found){szPopup_("「"+disp()+"」の前回の予約が見つかりません。");return;}' +
      'rvctx=JSON.parse(JSON.stringify(me.ctx));rvctx._ymd=st.date;rvctx._tm=exP2(Math.floor(st.ts/60))+":"+exP2(st.ts%60);' +
      'var stf=(st.slot&&st.slot.kind==="staff")?staffNum(st.slot.who):staffNum(rvctx.prev_staff||"");' +
      'var _tk=!!(st.slot&&st.slot.toku);' +
      'EXSEL={staff:stf,room:st.room,dur:String(st.te-st.ts),paid:st.paid,freeStaff:_tk?[stf]:(st.free||null),toku:_tk};' +
      'if(EXFLOW&&EXFLOW.groups&&EXFLOW.groups.length){var _k0=EXFLOW.groups[0].key;' +
        'var _d0=(rvSlotCfg[_k0]&&rvSlotCfg[_k0].dur)||String(EXFLOW.groups[0].dur||30);' +
        'rvSlotCfg[_k0]={room:roomVal(st.room||""),staff:stf,dur:_d0};}' +
      'showResvEdit();' +
      'if(EXFLOW&&EXFLOW.groups&&EXFLOW.groups.length>=2){exShowSlotPick(1);return;}' +
      'if(EXFLOW)exShowTitle();}' +
    'var SGX=(function(){' +
      'if(!document.getElementById("sgMonth"))return {goMonth:function(){},toTime:function(){},setAsk:function(){},setAhead:function(){},setNeed:function(){},state:function(){return {};},freeAt:function(){return null;}};' +
      'var step=0,SWAP=0,MY=null,AKI=null,AKIERR=false,AKIWAIT=null,PICKDATE=null,SLOT=null,TS=0,TE=0,ROOM=null,DAYROOMS=[],ASK=false,PAID=null,AHEAD={},PAIDAUTO="";' +
      'function tapOK(){return (Date.now()-SWAP)>450;}' +
      'function $(i){return document.getElementById(i);}' +
      'function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[c];});}' +
      'function NOW(){return Date.now();}' +
      'function show(){SWAP=Date.now();hideSteps();var m={3:"sgMonth",4:"sgDay",5:"sgFree",6:"sgTime"};' +
        'if(m[step]){$(m[step]).style.display="";$("sgbackbar").style.display="";}}' +
      'function freeStaffAt(a,b){var out=[];for(var i=0;i<DAYSTAFF.length;i++){var s=DAYSTAFF[i];for(var j=0;j<(s.slots||[]).length;j++){if(hm2m(s.slots[j].s)<=a&&b<=hm2m(s.slots[j].e)){out.push(staffNum(s.emoji));break;}}}return out;}' +
      'function sgOnDate(d){PAID=null;PAIDAUTO="";if(!(EXFLOW&&PREF&&PREF.ctx))exPrefetch(d);ASK=false;' +
        'AHEAD=(PREF&&PREF.ctx&&PREF.ctx.paid_ahead)||{};}' +
      'var SG_TOKU=true;' +
      SG_STEPS_JS_ +
      'function back(){if(step===6){goFree();}else if(step===5){goDay();}else if(step===4){goMonth();}' +
        'else{step=0;hideSteps();$("exNum").style.display="";window.scrollTo(0,0);}}' +
      '$("sgback").onclick=function(){if(!tapOK())return;back();};' +
      'sgBindSteps();' +
      '$("sgtgo").onclick=function(){if(!tapOK())return;' +
        'var _go=function(){exGoMemo({date:PICKDATE,ts:TS,te:TE,room:ROOM,slot:SLOT,paid:PAID,free:freeStaffAt(TS,TE)});};' +
        'if(SLOT&&SLOT.toku){szPopup_("特例で登録します。\\n"+SLOT.who+"さん　"+m2hm(TS)+"〜"+m2hm(TE)+"　"+shortRoomName_(ROOM)+"\\n\\n空きの外や、予約と重なる時間でも登録されます。よろしいでしょうか？😊",' +
          '{cancel:true,yesLabel:"特例で登録する",onYes:_go});return;}' +
        '_go();};' +
      'window.addEventListener("resize",function(){if(step===6)fitLine($("sgtwho"),26,13);});' +
      'return {goMonth:function(){if(!EXFLOW)PREF=null;EXSEL=null;goMonth();},' +
        'toTime:function(){step=6;show();drawTime();window.scrollTo(0,0);},' +
        'setAsk:function(a){ASK=!!a;if(step===6)drawTime();},' +
        'setNeed:function(m){NEEDMIN=parseInt(m,10)||0;},' +
        'setRoomTip:function(t){ROOMTIP=t||"";if(step===6)drawTime();},' +
        'setSlot1:function(t){var el=$("sgtslot");if(!el)return;'+
          'el.textContent=t||"";el.style.display=t?"":"none";},' +
        'setAhead:function(a){AHEAD=a||{};if(step===6)drawTime();},' +
        'state:function(){return {date:PICKDATE,ts:TS,te:TE,room:ROOM,slot:SLOT,paid:PAID,free:freeStaffAt(TS,TE)};},' +
        'freeAt:function(a,b){return freeStaffAt(a,b);}};' +
    '})();' +
    '})();</script>';
  return '<style>' + HOMECSS_ + css + (isChange ? '' : sgCss_() + AKFCSS_) + '</style>' +
    '<div class="home">' + (isChange ? '' : '<div class="backbar" id="sgbackbar" style="display:none">' +
      '<a class="backbtn" id="sgback" href="javascript:void(0)">← 戻る</a></div>' + sgStepsHtml_()) +
    '<div class="ex">' + numSec + pickSec + menuSec + dateSec + timeSec + editSec + memoSec + staffPickSec + roomPickSec +
      askSec + pickItemsSec + addSec + splitSec + groupSec + staffSelSec + durSec + orderSec + slotPickSec + resvSec + resvMenuSec + '</div></div>' + script;
}
