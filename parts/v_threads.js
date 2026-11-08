// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：threads
var THREADSCSS_ =
  '.thw{width:100%;box-sizing:border-box;max-width:560px;margin:0 auto;padding:0 6px 60px;text-align:left;}' +
  '.thacct{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:6px 0 12px;}' +
  '.thacct button,.thseg button{background:#fff;color:#0f172a;border:3px solid transparent;border-radius:14px;padding:14px 4px;font:inherit;font-size:18px;font-weight:900;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.15);}' +
  '.thacct button.on,.thseg button.on{background:#16a34a;color:#fff;border-color:#15803d;}' +
  '.thacct.one{grid-template-columns:1fr;}' +
  '.thname{color:#fde047;font-size:15px;font-weight:800;margin:-4px 4px 10px;}' +
  '.thcnt{color:#eaf6fb;font-weight:800;font-size:15px;text-align:right;margin:-6px 4px 10px;}' +
  '.thcnt.over{color:#fca5a5;}' +
  '.thtools{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 12px;}' +
  '.thtools button,.thtools label{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:6px;background:#fff;color:#0f172a;border:3px solid transparent;border-radius:12px;padding:12px 4px;font:inherit;font-size:16px;font-weight:900;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.15);}' +
  '.thtools .on{background:#fde047;border-color:#eab308;}' +
  '.thtools input{position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer;}' +
  '.thbox{background:rgba(255,255,255,.14);border-radius:14px;padding:10px 10px 4px;margin:0 0 12px;}' +
  '.thbox .hblb{margin-top:0;}' +
  '.thbox .hbin{font-size:18px;padding:12px;}' +
  '.thseg{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:4px 0 10px;}' +
  '.thseg button{font-size:15px;padding:12px 4px;}' +
  '.thchk{display:flex;align-items:center;gap:10px;color:#fff;font-weight:800;font-size:17px;margin:6px 4px 10px;}' +
  '.thchk input{width:24px;height:24px;}' +
  '.ththumbs{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:0 0 12px;}' +
  '.ththumbs div{position:relative;}' +
  '.ththumbs img,.ththumbs .v{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:10px;display:block;}' +
  '.ththumbs .v{background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:30px;}' +
  '.ththumbs button{position:absolute;top:-6px;right:-6px;width:28px;height:28px;border-radius:50%;border:0;background:#0f172a;color:#fff;font-size:16px;font-weight:900;cursor:pointer;}' +
  '.thchain{position:relative;}' +
  '.thchain .x{position:absolute;top:2px;right:2px;border:0;background:#0f172a;color:#fff;border-radius:50%;width:28px;height:28px;font-weight:900;cursor:pointer;}' +
  '.thlist{margin:22px 0 0;}' +
  '.thlh{color:#fff;font-weight:900;font-size:20px;margin:8px 4px 8px;}' +
  '.thpost{background:#fff;color:#0f172a;border-radius:14px;padding:12px 14px;margin:0 0 10px;box-shadow:0 3px 8px rgba(0,0,0,.15);}' +
  '.thpost .m{font-size:13px;color:#475569;font-weight:700;margin-bottom:4px;}' +
  '.thpost .t{font-size:16px;line-height:1.5;white-space:pre-wrap;word-break:break-word;}' +
  '.thpost .b{display:flex;gap:10px;margin-top:10px;}' +
  '.thpost .b a,.thpost .b button{flex:1;text-align:center;border-radius:10px;padding:10px 4px;font:inherit;font-size:16px;font-weight:900;text-decoration:none;cursor:pointer;}' +
  '.thpost .b a{background:#e0f2fe;color:#0369a1;}' +
  '.thpost .b button{background:#fee2e2;color:#b91c1c;border:0;}' +
  '.thempty{color:#eaf6fb;font-weight:800;margin:4px;}' +
  '.themos{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;background:#fff;border-radius:14px;padding:10px;margin:0 0 12px;box-shadow:0 3px 8px rgba(0,0,0,.15);}' +
  '.themos button{border:0;background:transparent;font-size:26px;line-height:1.3;padding:4px 0;cursor:pointer;border-radius:8px;}' +
  '.themos button:active{background:#e2e8f0;}' +
  '.thshow{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;box-sizing:border-box;background:#101010;color:#fff;border:0;border-radius:14px;padding:14px;font:inherit;font-size:19px;font-weight:900;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.2);margin:-2px 0 14px;}' +
  '.thf{background:#101010;color:#f3f5f7;border-radius:18px;padding:16px 14px 6px;margin:4px 0 14px;box-shadow:0 4px 14px rgba(0,0,0,.25);font-family:system-ui,-apple-system,"Segoe UI",sans-serif;}' +
  '.thf .ph{display:flex;gap:12px;align-items:flex-start;}' +
  '.thf .ph .nm{flex:1;min-width:0;}' +
  '.thf .ph .n{font-size:21px;font-weight:800;line-height:1.3;word-break:break-word;}' +
  '.thf .ph .u{font-size:14px;color:#f3f5f7;margin-top:2px;}' +
  '.thf .ph img{width:64px;height:64px;border-radius:50%;object-fit:cover;flex:none;background:#333;}' +
  '.thf .bio{white-space:pre-wrap;font-size:15px;line-height:1.5;margin:10px 0 6px;}' +
  '.thf .fl{color:#999;font-size:14px;margin:6px 0 12px;}' +
  '.thf .tabs{display:flex;border-bottom:1px solid #333;margin:0 -14px;}' +
  '.thf .tabs div{flex:1;text-align:center;padding:10px 0;color:#777;font-weight:700;font-size:15px;}' +
  '.thf .tabs div.on{color:#f3f5f7;border-bottom:2px solid #f3f5f7;}' +
  '.thf .po{display:flex;gap:10px;padding:14px 0;border-bottom:1px solid #2a2a2a;}' +
  '.thf .po:last-child{border-bottom:0;}' +
  '.thf .po .av{width:36px;height:36px;border-radius:50%;object-fit:cover;flex:none;background:#333;}' +
  '.thf .po .bd{flex:1;min-width:0;}' +
  '.thf .po .hd{font-size:15px;}' +
  '.thf .po .hd b{font-weight:700;}' +
  '.thf .po .hd span{color:#777;margin-left:6px;}' +
  '.thf .po .hd i{font-style:normal;margin-left:6px;background:#16a34a;color:#fff;border-radius:6px;padding:0 6px;font-size:12px;}' +
  '.thf .po .tx{white-space:pre-wrap;word-break:break-word;font-size:15px;line-height:1.55;margin:4px 0 6px;}' +
  '.thf .po .md{display:flex;gap:6px;overflow-x:auto;margin:6px 0;}' +
  '.thf .po .md img,.thf .po .md video{max-height:320px;max-width:100%;border-radius:10px;border:1px solid #333;flex:none;}' +
  '.thf .po .md.many img,.thf .po .md.many video{height:220px;max-width:none;}' +
  '.thf .po .st{display:flex;gap:16px;color:#ccc;font-size:14px;margin-top:6px;flex-wrap:wrap;}' +
  '.thf .po .st a{color:#9bd3ff;text-decoration:none;margin-left:auto;}' +
  '.thf .more{display:block;width:100%;background:#262626;color:#fff;border:0;border-radius:12px;padding:12px;font:inherit;font-weight:800;margin:10px 0;cursor:pointer;}' +
  '.thf .cmb{background:#262626;color:#fff;border:0;border-radius:10px;padding:8px 12px;font:inherit;font-size:14px;font-weight:800;cursor:pointer;margin-top:8px;}' +
  '.thf .cms{margin-top:8px;border-left:2px solid #333;padding-left:10px;}' +
  '.thf .cm{padding:8px 0;border-bottom:1px solid #222;}' +
  '.thf .cm.sub{margin-left:18px;}' +
  '.thf .cm.hid{opacity:.45;}' +
  '.thf .cm .h{font-size:14px;}' +
  '.thf .cm .h b{font-weight:700;}' +
  '.thf .cm .h span{color:#777;margin-left:6px;}' +
  '.thf .cm .h em{font-style:normal;margin-left:6px;background:#444;color:#fff;border-radius:6px;padding:0 6px;font-size:12px;}' +
  '.thf .cm .x{white-space:pre-wrap;word-break:break-word;font-size:15px;line-height:1.5;margin:2px 0 4px;}' +
  '.thf .cm img{max-width:60%;border-radius:8px;margin:4px 0;}' +
  '.thf .cm .a{display:flex;gap:8px;flex-wrap:wrap;}' +
  '.thf .cm .a button{background:#1f2937;color:#e5e7eb;border:1px solid #374151;border-radius:8px;padding:6px 10px;font:inherit;font-size:13px;font-weight:800;cursor:pointer;}' +
  '.thf .cm .a button.ok{background:#14532d;border-color:#16a34a;}' +
  '.thf .cm .a button.ng{background:#3f1d1d;border-color:#b91c1c;}' +
  '.thf .rpbox{margin:6px 0;}' +
  '.thf .rpbox textarea{width:100%;box-sizing:border-box;min-height:80px;border-radius:10px;border:1px solid #444;background:#181818;color:#fff;padding:10px;font:inherit;font-size:15px;}' +
  '.thf .rpbox .r{display:flex;gap:8px;align-items:center;margin-top:6px;}' +
  '.thf .rpbox .r span{color:#999;font-size:13px;margin-right:auto;}' +
  '.thf .rpbox .r button{background:#fff;color:#000;border:0;border-radius:10px;padding:8px 14px;font:inherit;font-weight:900;cursor:pointer;}' +
  '.thf .pd{color:#fde047;font-weight:800;font-size:14px;margin:6px 0 2px;}' +
  '.thf .lk{font-weight:700;font-size:15px;margin:2px 0 8px;}' +
  '.thf .lk a{color:#f3f5f7;text-decoration:none;}' +
  '.thf .flrow{display:flex;align-items:center;gap:8px;margin:6px 0 12px;}' +
  '.thf .flrow .fc{display:flex;cursor:pointer;align-items:center;gap:8px;}' +
  '.thf .flrow .fc img{width:20px;height:20px;border-radius:50%;border:2px solid #101010;margin-left:-6px;object-fit:cover;}' +
  '.thf .flrow .fc img:first-child{margin-left:0;}' +
  '.thf .flrow .fc span{color:#999;font-size:15px;}' +
  '.thf .flrow a.ig{margin-left:auto;color:#f3f5f7;font-size:22px;text-decoration:none;}' +
  '.thf .pbtns{display:flex;gap:8px;margin:0 0 14px;}' +
  '.thf .pbtns button{flex:1;background:transparent;color:#f3f5f7;border:1px solid #444;border-radius:10px;padding:9px 4px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;}' +
  '.thf .ttl{font-size:20px;font-weight:800;margin:0 0 12px;}' +
  '.thf .flh{display:flex;border-bottom:1px solid #333;margin:0 -14px 4px;}' +
  '.thf .flh div{flex:1;text-align:center;padding:10px 0;font-weight:700;color:#777;}' +
  '.thf .flh div.on{color:#f3f5f7;border-bottom:2px solid #f3f5f7;}' +
  '.thf .flh b{display:block;font-size:13px;color:#999;font-weight:600;}' +
  '.thf .fr{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #222;}' +
  '.thf .fr img,.thf .fr .noimg{width:40px;height:40px;border-radius:50%;object-fit:cover;background:#333;flex:none;}' +
  '.thf .fr .w{flex:1;min-width:0;}' +
  '.thf .fr .w a{color:#f3f5f7;font-weight:700;text-decoration:none;}' +
  '.thf .fr .w div{color:#999;font-size:14px;}' +
  '.thf .fr .b{border:1px solid #444;border-radius:10px;padding:6px 12px;font-size:13px;font-weight:700;color:#f3f5f7;}' +
  '.thf .per{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 14px;}' +
  '.thf .per button{background:#1f1f1f;color:#ccc;border:1px solid #333;border-radius:999px;padding:7px 12px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;}' +
  '.thf .per button.on{background:#f3f5f7;color:#101010;}' +
  '.thf .sec{border:1px solid #2a2a2a;border-radius:14px;padding:14px;margin:0 0 14px;}' +
  '.thf .sec h3{margin:0 0 10px;font-size:17px;}' +
  '.thf .cards{display:grid;grid-template-columns:1fr 1fr;gap:8px;}' +
  '.thf .card{border:1px solid #333;border-radius:12px;padding:10px;}' +
  '.thf .card .k{color:#999;font-size:13px;}' +
  '.thf .card .v{font-size:22px;font-weight:800;margin-top:4px;}' +
  '.thf .card .p{color:#999;font-size:12px;margin-top:2px;}' +
  '.thf .big{font-size:34px;font-weight:800;}' +
  '.thf .sub{color:#999;font-size:13px;margin:2px 0 10px;}' +
  '.thf svg text{fill:#888;font-size:10px;}' +
  '.thf .note{color:#777;font-size:12px;margin:-6px 0 10px;}' +
  '.thf .top{display:flex;align-items:center;gap:14px;font-weight:800;font-size:19px;margin:0 0 12px;}' +
  '.thf .top span{flex:1;}' +
  '.thf .top button{background:none;border:0;color:#f3f5f7;font:inherit;font-size:18px;cursor:pointer;padding:0;}' +
  '.thf .pbtns button.off{color:#888;}' +
  '.thf .tabs div{cursor:pointer;}' +
  '.thf .cmp{display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid #2a2a2a;cursor:pointer;}' +
  '.thf .cmp img,.thf .cmp .av0{width:36px;height:36px;border-radius:50%;object-fit:cover;background:#333;}' +
  '.thf .cmp span{flex:1;color:#777;font-size:15px;}' +
  '.thf .cmp button{background:transparent;color:#f3f5f7;border:1px solid #444;border-radius:10px;padding:7px 14px;font:inherit;font-weight:800;cursor:pointer;}' +
  '.thf .po .hd{display:flex;align-items:center;}' +
  '.thf .po .hd .dots{margin-left:auto;background:none;border:0;color:#999;font-size:18px;cursor:pointer;padding:0 4px;}' +
  '.thf .pmenu{background:#262626;border-radius:12px;padding:4px;margin:6px 0;}' +
  '.thf .pmenu a,.thf .pmenu button{display:block;width:100%;text-align:left;background:none;border:0;color:#f3f5f7;font:inherit;font-size:15px;padding:10px 12px;text-decoration:none;cursor:pointer;border-radius:8px;}' +
  '.thf .pmenu .del{color:#ff4d4f;font-weight:800;}' +
  '.thf .po .hd .tp{color:#f3f5f7;margin-left:4px;font-weight:600;}' +
  '.thf .po .tx a{color:#5ea4ff;text-decoration:none;}' +
  '.thf .lcard{display:block;border:1px solid #333;border-radius:12px;overflow:hidden;margin:6px 0;text-decoration:none;color:#f3f5f7;max-width:420px;}' +
  '.thf .lcard img{display:block;width:100%;max-height:260px;object-fit:cover;}' +
  '.thf .lcard .d{color:#999;font-size:13px;padding:8px 12px 0;}' +
  '.thf .lcard .t{font-size:15px;font-weight:600;padding:2px 12px 10px;line-height:1.4;}' +
  '.thf .po .st{gap:22px;color:#ccc;}' +
  '.thf .po .st span{min-width:30px;}' +
  '.thcomp{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:60;overflow:auto;padding:24px 8px;box-sizing:border-box;}' +
  '.thsheet{background:#181818;color:#f3f5f7;border:1px solid #333;border-radius:18px;max-width:640px;margin:0 auto;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;}' +
  '.thsheet .tsh{display:flex;align-items:center;padding:14px 16px;border-bottom:1px solid #2a2a2a;}' +
  '.thsheet .tsh button{background:none;border:0;color:#f3f5f7;font:inherit;font-size:16px;cursor:pointer;padding:0;}' +
  '.thsheet .tsh b{flex:1;text-align:center;font-size:16px;}' +
  '.thsheet .tsh span{width:70px;}' +
  '.thsheet .tsb{padding:14px 16px 4px;}' +
  '.thsheet .trow{display:flex;gap:12px;}' +
  '.thsheet .trow.add{align-items:center;color:#777;cursor:pointer;margin:6px 0 12px;}' +
  '.thsheet .tav{width:40px;height:40px;border-radius:50%;object-fit:cover;background:#333;flex:none;}' +
  '.thsheet .tav.sm{width:22px;height:22px;margin:0 9px;}' +
  '.thsheet .tmain{flex:1;min-width:0;}' +
  '.thsheet .tun{display:flex;align-items:center;gap:6px;font-size:15px;}' +
  '.thsheet .tun button{background:none;border:0;color:#999;font:inherit;font-size:15px;cursor:pointer;padding:0;}' +
  '.thsheet .tta{width:100%;box-sizing:border-box;background:transparent;border:0;color:#f3f5f7;font:inherit;font-size:16px;line-height:1.5;min-height:60px;resize:vertical;outline:none;padding:4px 0;}' +
  '.thsheet .tta::placeholder{color:#777;}' +
  '.thsheet .ticons{display:flex;gap:4px;flex-wrap:wrap;margin:4px 0;}' +
  '.thsheet .tic{position:relative;overflow:hidden;background:none;border:0;color:#bbb;font:inherit;font-size:19px;min-width:34px;height:34px;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;}' +
  '.thsheet .tic.on{background:#333;color:#fff;}' +
  '.thsheet .tic.off{color:#555;}' +
  '.thsheet .tic input{position:absolute;inset:0;opacity:0;cursor:pointer;}' +
  '.thsheet .thbox{background:#222;border-radius:12px;padding:8px;margin:6px 0;}' +
  '.thsheet .thbox .hbin{background:#2b2b2b;color:#fff;box-shadow:none;font-size:15px;padding:10px;margin:4px 0;}' +
  '.thsheet .thbox .hblb{color:#ddd;font-size:14px;margin:2px 2px 6px;}' +
  '.thsheet .thcnt{color:#888;font-size:13px;margin:0 2px 6px;}' +
  '.thsheet .thchk{color:#ddd;font-size:15px;}' +
  '.thsheet .thseg button{font-size:13px;padding:10px 4px;}' +
  '.thsheet .thchain .hbin{background:transparent;color:#fff;box-shadow:none;border:0;font-size:15px;}' +
  '.thsheet .themos{background:#222;box-shadow:none;}' +
  '.thsheet .tsf{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-top:1px solid #2a2a2a;}' +
  '.thsheet .tsf #thOptBtn{background:none;border:0;color:#bbb;font:inherit;font-size:15px;font-weight:700;cursor:pointer;}' +
  '.thsheet .tsf #thOptBtn.on{color:#fff;}' +
  '.thsheet .tsf #thGo{background:#f3f5f7;color:#101010;border:0;border-radius:10px;padding:9px 18px;font:inherit;font-weight:800;cursor:pointer;}';
function renderThreadsPage_(base, staff, dev) {
  var head = '<div class="hhead"><span class="bmark">🧵</span><span class="bname">Threads投稿</span></div>';
  var C = {
    exec: 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec',
    key: 'kx7Q2p9mVt4Zr8'
  };
  var ic = function (id, label, title, off) {
    return '<button type="button" class="tic' + (off ? ' off' : '') + '"' + (id ? ' id="' + id + '"' : '') + ' title="' + title + '"' + (off ? ' data-off="' + title + '"' : '') + '>' + label + '</button>';
  };
  return '<style>' + HOMECSS_ + EXPADCSS_ + HANBAICSS_ + THREADSCSS_ + '</style>' +
    '<div class="home">' + backBar_(base, staff, dev) +
    '<div class="thw">' + head +
      '<div class="hbhint" id="thLoad">読み込み中です…</div>' +
      '<div id="thMain" style="display:none">' +
        '<div class="hblb">投稿するアカウント</div>' +
        '<div class="thacct" id="thAcct"></div>' +
        '<div class="thname" id="thUser" style="display:none"></div>' +
        '<div class="thf" id="thFeed"></div>' +
      '</div>' +
      '<button type="button" id="thShow" style="display:none"></button><div id="thFeedWrap" style="display:none"><a id="thFeedBack"></a></div><div id="thList" style="display:none"></div>' +
    '</div></div>' +
    '<div class="thcomp" id="thCompose" style="display:none"><div class="thsheet">' +
      '<div class="tsh"><button type="button" id="thCancel">キャンセル</button><b>新しいスレッド</b><span></span></div>' +
      '<div class="tsb">' +
        '<div class="trow"><img class="tav" id="thCAv" referrerpolicy="no-referrer"><div class="tmain">' +
          '<div class="tun"><b id="thCUser"></b><button type="button" id="thTopicBtn">›&nbsp;<span id="thTopicLbl">コミュニティまたはトピック</span></button></div>' +
          '<div class="thbox" id="thTopic" style="display:none"><input class="hbin" id="thTopicText" maxlength="50" placeholder="トピック（50文字まで・「.」と「&」は使えません）"></div>' +
          '<textarea class="tta" id="thText" placeholder="最近どう？"></textarea>' +
          '<div class="ththumbs" id="thThumbs"></div>' +
          '<div class="thbox" id="thPoll" style="display:none">' +
            '<input class="hbin" id="thP1" maxlength="25" placeholder="選択肢1">' +
            '<input class="hbin" id="thP2" maxlength="25" placeholder="選択肢2">' +
            '<input class="hbin" id="thP3" maxlength="25" placeholder="選択肢を追加（なくてもOK）">' +
            '<input class="hbin" id="thP4" maxlength="25" placeholder="選択肢を追加（なくてもOK）">' +
          '</div>' +
          '<div class="thbox" id="thLong" style="display:none">' +
            '<textarea class="hbin" id="thLongText" style="min-height:140px" placeholder="長い文（10000文字まで・投稿の下に付きます）"></textarea>' +
            '<div class="thcnt" id="thLongCnt">0 / 10000</div>' +
          '</div>' +
          '<div class="ticons">' +
            '<label class="tic" id="thMediaBtn" title="写真・動画">🖼<input type="file" id="thFile" accept="image/*,video/mp4,video/quicktime" multiple></label>' +
            ic('', 'GIF', 'GIF', true) + ic('thEmoBtn', '😊', '絵文字') + ic('', '▣', 'ステッカー', true) +
            ic('thPollBtn', '≡', '投票') + ic('', '❝', '引用', true) + ic('thLongBtn', '📄', '長い文') +
            ic('', '📍', '場所', true) + ic('', '♫', '音楽', true) +
          '</div>' +
          '<div class="themos" id="thEmos" style="display:none"></div>' +
          '<div class="thcnt" id="thCnt">0 / 500</div>' +
        '</div></div>' +
        '<div id="thChain"></div>' +
        '<div class="trow add" id="thAddChain"><img class="tav sm" id="thCAv2" referrerpolicy="no-referrer"><span>スレッドに追加</span></div>' +
      '</div>' +
      '<div class="thbox" id="thOpt" style="display:none;margin:0 14px 10px">' +
        '<div class="hblb">返信できる人</div>' +
        '<div class="thseg" id="thRc">' +
          '<button type="button" class="on" data-v="everyone">全員</button>' +
          '<button type="button" data-v="followers_only">フォロワー</button>' +
          '<button type="button" data-v="accounts_you_follow">フォロー中の人</button>' +
          '<button type="button" data-v="mentioned_only">@で書いた人だけ</button>' +
        '</div>' +
        '<label class="thchk"><input type="checkbox" id="thApprove">返信は承認してから投稿する</label>' +
        '<label class="thchk"><input type="checkbox" id="thSpoiler">写真・動画をぼかす（ネタバレ）</label>' +
      '</div>' +
      '<div class="tsf"><button type="button" id="thOptBtn">⚙︎ 投稿オプション</button><button type="button" id="thGo">投稿</button></div>' +
    '</div></div>' +
    '<script>(' + threadsScript_.toString() + ')(' + JSON.stringify(C).replace(/</g, '\\u003c') + ');<\/script>';
}
function threadsScript_(C) {
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var ACCTS = [], CUR = '', MEDIA = [], MAXT = 500, MAXI = 10, MAXLONG = 10000, MAXCHAIN = 5, VIDEO_MB = 18, TOTAL_MB = 18;
  var RC = 'everyone', LAST = null, DATA = null;
  var idn = function () { return { who: window.__SZ_WHO_ || '', role: window.__SZ_ROLE_ || '', device: window.__SZ_DEVICE_ || '' }; };
  var warn = function (m) { if (typeof szPopup_ === 'function') szPopup_(m); else alert(m); };
  function tlen(t) { return Array.from(t).length; }

  function jsonp(p, cb) {
    var n = '__th' + Date.now() + Math.floor(Math.random() * 1000);
    window[n] = function (r) { try { delete window[n]; } catch (e) {} cb(r); };
    var q = 'callback=' + n; for (var k in p) q += '&' + k + '=' + encodeURIComponent(p[k]);
    var s = document.createElement('script'); s.src = C.exec + '?' + q + '&cb=' + Date.now();
    s.onerror = function () { cb({ ok: false, error: '通信エラーです。もう一度お試しください。' }); }; document.body.appendChild(s);
  }
  function devKey(cb) {
    if ((window.__SZ_ROLE_ || '') !== '開発') { cb({}); return; }
    var dv = '', dk = '';
    try { dv = localStorage.getItem('zk_dv') || ''; dk = localStorage.getItem('zk_dk') || ''; } catch (e) {}
    if (!dv || !dk || !window.crypto || !crypto.subtle || typeof TextEncoder === 'undefined') { cb({}); return; }
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(dk)).then(function (b) {
      var h = Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
      cb({ zdv: dv, zdh: h });
    }, function () { cb({}); });
  }
  function ask(fields, busy, done) {
    devKey(function (ex) { for (var k in ex) fields[k] = ex[k]; ask0(fields, busy, done); });
  }
  function ask0(fields, busy, done) {
    if (busy && typeof szOvShow_ === 'function') szOvShow_(szBusyHtml_(busy, false), '#2C7A99');
    var end = function (err, d) { if (busy && typeof szOvHide_ === 'function') szOvHide_(); done(err, d); };
    var me = idn();
    var poll = function (id) {
      var n = 0, max = 300;
      var tick = function () {
        n++; if (n > max) { end('時間切れです。もう一度お試しください。'); return; }
        jsonp({ action: 'status', key: C.key, id: id }, function (x) {
          if (!x || !x.ok) { end((x && x.error) || '通信に失敗しました。もう一度お試しください。'); return; }
          if (x.status === 'pending' || x.status === 'running' || x.status === 'queued' || x.status === '') { setTimeout(tick, 1000); return; }
          if (x.status !== 'done') { end(x.result || 'エラーが発生しました。りゅうさんに連絡しました。'); return; }
          var d = null; try { d = JSON.parse(x.result || '{}'); } catch (e) {}
          if (d && d.__bigres) {
            jsonp({ action: 'data', key: C.key, name: d.__bigres }, function (y) {
              var v = null; try { v = JSON.parse(y && y.result); } catch (e) {}
              if (!v) { end('答えを読み込めませんでした。もう一度お試しください。'); return; }
              end(null, v);
            });
            return;
          }
          end(null, d || {});
        });
      };
      setTimeout(tick, 1200);
    };
    var send = function (ft) {
      jsonp({ action: 'submit', key: C.key, op: 'threads', who: me.who, role: me.role, device: me.device, fields: ft },
        function (r) {
          if (!r || !r.ok || !r.id) { end((r && r.error) || '通信に失敗しました。もう一度お試しください。'); return; }
          poll(r.id);
        });
    };
    if (typeof BIG === 'undefined') { send(JSON.stringify(fields)); return; }
    BIG.prepare({ exec: C.exec, key: C.key, slot: me.device || 'x', tag: 'threads', op: 'threads',
                  who: me.who, role: me.role, device: me.device, fields: fields },
      send, function () { end('写真・動画を送れませんでした。数を減らしてもう一度お試しください。'); });
  }

  function drawAcct() {
    var h = '';
    for (var i = 0; i < ACCTS.length; i++) {
      h += '<button type="button" data-a="' + esc(ACCTS[i].acct) + '"' + (ACCTS[i].acct === CUR ? ' class="on"' : '') + '>' + esc(ACCTS[i].label) + '</button>';
    }
    $('thAcct').innerHTML = h;
    $('thAcct').className = 'thacct' + (ACCTS.length === 1 ? ' one' : '');
    $('thAcct').style.gridTemplateColumns = 'repeat(' + Math.max(1, ACCTS.length) + ',1fr)';   
    var a = ACCTS.filter(function (x) { return x.acct === CUR; })[0];
    $('thUser').textContent = a && a.username ? '@' + a.username : '';
  }
  $('thAcct').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    CUR = b.getAttribute('data-a'); drawAcct();
    VIEW = 'feed'; TAB = 'th'; FEED = null;
    if (!showFeedFromData()) $('thFeed').innerHTML = '<div class="fl">読み込み中です…</div>';
    loadWeb(CUR, 30, false);
    if (DATA) { DATA.cur = CUR; cacheSet(DATA); }
  });

  function cnt(el, out, max) {
    var n = tlen(el.value);
    out.textContent = n + ' / ' + max;
    out.className = 'thcnt' + (n > max ? ' over' : '');
  }
  function drawCnt() { cnt($('thText'), $('thCnt'), MAXT); }
  $('thText').addEventListener('input', drawCnt);
  $('thText').addEventListener('focus', function () { LAST = this; });
  $('thLongText').addEventListener('input', function () { cnt(this, $('thLongCnt'), MAXLONG); });

  function toggle(btn, box) {
    var open = $(box).style.display === 'none';
    $(box).style.display = open ? '' : 'none';
    $(btn).classList.toggle('on', open);
  }
  $('thPollBtn').addEventListener('click', function () { toggle('thPollBtn', 'thPoll'); });
  $('thLongBtn').addEventListener('click', function () { toggle('thLongBtn', 'thLong'); });
  $('thTopicBtn').addEventListener('click', function () { toggle('thTopicBtn', 'thTopic'); });
  $('thOptBtn').addEventListener('click', function () { toggle('thOptBtn', 'thOpt'); });
  $('thRc').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    RC = b.getAttribute('data-v');
    Array.prototype.forEach.call($('thRc').children, function (x) { x.classList.toggle('on', x === b); });
  });

  var EMOS = ['😊','😍','🥰','😆','🤗','🥹','😂','🙏','✨','💖','💕','❤️','🩷','🌸','🌷','💐',
              '🌿','🍀','🍅','🎉','🎁','🎀','🔥','👍','💯','✅','🆕','⚠️','📅','⏰','📍','📞',
              '💬','👉','➡️','⭐','☀️','🌙','🌈','💆‍♀️','💅','🧖‍♀️','💄','👀','😳','🤩','😎','🫶'];
  $('thEmos').innerHTML = EMOS.map(function (e) { return '<button type="button" data-e="' + e + '">' + e + '</button>'; }).join('');
  $('thEmoBtn').addEventListener('click', function () { toggle('thEmoBtn', 'thEmos'); });
  $('thEmos').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var t = (LAST && document.body.contains(LAST)) ? LAST : $('thText');
    var v = t.value, a = (t.selectionStart == null) ? v.length : t.selectionStart, z = (t.selectionEnd == null) ? a : t.selectionEnd;
    var em = b.getAttribute('data-e');
    t.value = v.slice(0, a) + em + v.slice(z);
    var p = a + em.length; try { t.setSelectionRange(p, p); } catch (x) {}
    t.dispatchEvent(new Event('input'));
  });

  function totalMB() { return MEDIA.reduce(function (s, o) { return s + o.b64.length * 3 / 4; }, 0) / 1048576; }
  function drawThumbs() {
    $('thThumbs').innerHTML = MEDIA.map(function (o, i) {
      var face = o.video ? '<div class="v">🎬</div>' : '<img src="data:image/jpeg;base64,' + o.b64 + '">';
      return '<div>' + face + '<button type="button" data-i="' + i + '">×</button></div>';
    }).join('');
    $('thMediaBtn').classList.toggle('on', MEDIA.length > 0);
  }
  $('thThumbs').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    MEDIA.splice(Number(b.getAttribute('data-i')), 1); drawThumbs();
  });
  $('thFile').addEventListener('change', function () {
    var files = Array.prototype.slice.call(this.files || []);
    this.value = '';
    files.forEach(function (f) {
      if (MEDIA.length >= MAXI) { warn('写真・動画は合わせて' + MAXI + '個までです。'); return; }
      if (/^video\//.test(f.type)) {
        if (f.size > VIDEO_MB * 1048576) { warn('動画は1つ' + VIDEO_MB + 'MBまでです（短い動画にしてください）。'); return; }
        var vr = new FileReader();
        vr.onload = function () {
          var b64 = String(vr.result).split(',')[1] || '';
          if (totalMB() + b64.length * 3 / 4 / 1048576 > TOTAL_MB) { warn('写真・動画は合わせて' + TOTAL_MB + 'MBまでです。'); return; }
          MEDIA.push({ b64: b64, video: true }); drawThumbs();
        };
        vr.readAsDataURL(f);
        return;
      }
      if (!/^image\//.test(f.type)) return;
      var fr = new FileReader();
      fr.onload = function () {
        var im = new Image();
        im.onload = function () {
          var mx = 1280, w = im.width, h = im.height;
          if (w > mx || h > mx) { if (w >= h) { h = Math.round(h * mx / w); w = mx; } else { w = Math.round(w * mx / h); h = mx; } }
          var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(im, 0, 0, w, h);
          if (MEDIA.length >= MAXI) return;
          MEDIA.push({ b64: cv.toDataURL('image/jpeg', 0.82).split(',')[1] });
          drawThumbs();
        };
        im.src = fr.result;
      };
      fr.readAsDataURL(f);
    });
  });

  function chainBoxes() { return Array.prototype.slice.call(document.querySelectorAll('#thChain textarea')); }
  $('thAddChain').addEventListener('click', function () {
    if (chainBoxes().length >= MAXCHAIN) { warn('続けて投稿できるのは' + MAXCHAIN + 'つまでです。'); return; }
    var d = document.createElement('div');
    d.className = 'thbox thchain';
    var n = chainBoxes().length + 2;
    d.innerHTML = '<div class="hblb">➕ 続き（' + n + 'つ目の投稿）</div><button type="button" class="x">×</button>' +
      '<textarea class="hbin" placeholder="続きの文（500文字まで）"></textarea><div class="thcnt">0 / 500</div>';
    $('thChain').appendChild(d);
    var ta = d.querySelector('textarea'), ct = d.querySelector('.thcnt');
    ta.addEventListener('input', function () { cnt(ta, ct, MAXT); });
    ta.addEventListener('focus', function () { LAST = ta; });
    d.querySelector('.x').addEventListener('click', function () { d.parentNode.removeChild(d); });
    ta.focus();
  });

  function vals(ids) { return ids.map(function (i) { return $(i).value.trim(); }); }
  function reset() {
    ['thText', 'thLongText', 'thTopicText', 'thP1', 'thP2', 'thP3', 'thP4'].forEach(function (i) { $(i).value = ''; });
    MEDIA = []; drawThumbs(); drawCnt(); $('thLongCnt').textContent = '0 / ' + MAXLONG;
    $('thChain').innerHTML = ''; $('thApprove').checked = false; $('thSpoiler').checked = false;
    RC = 'everyone'; Array.prototype.forEach.call($('thRc').children, function (x) { x.classList.toggle('on', x.getAttribute('data-v') === RC); });
    ['thPoll', 'thLong', 'thTopic', 'thOpt', 'thEmos'].forEach(function (i) { $(i).style.display = 'none'; });
    ['thPollBtn', 'thLongBtn', 'thTopicBtn', 'thOptBtn', 'thEmoBtn'].forEach(function (i) { $(i).classList.remove('on'); });
  }
  $('thGo').addEventListener('click', function () {
    var text = $('thText').value.trim();
    var pv = vals(['thP1', 'thP2', 'thP3', 'thP4']);
    var usePoll = $('thPoll').style.display !== 'none' && pv.some(function (x) { return x; });
    var longt = $('thLong').style.display !== 'none' ? $('thLongText').value.trim() : '';
    var topic = $('thTopic').style.display !== 'none' ? $('thTopicText').value.trim().replace(/^#/, '') : '';
    var chain = chainBoxes().map(function (t) { return t.value.trim(); }).filter(function (x) { return x; });
    if (!CUR) { warn('投稿するアカウントをえらんでください。'); return; }
    if (!text && !MEDIA.length) { warn('文か写真・動画を入力してください😊'); return; }
    if (tlen(text) > MAXT) { warn('文は' + MAXT + '文字までです。'); return; }
    if (usePoll) {
      if (MEDIA.length || longt) { warn('投票は、写真・動画・長い文と一緒には出せません。'); return; }
      if (!pv[0] || !pv[1]) { warn('投票の選択肢は1つ目と2つ目を入力してください😊'); return; }
      if (!text) { warn('投票には質問の文を入力してください😊'); return; }
    }
    if (longt) {
      if (MEDIA.length) { warn('長い文は、写真・動画と一緒には出せません。'); return; }
      if (tlen(longt) > MAXLONG) { warn('長い文は' + MAXLONG + '文字までです。'); return; }
      if (!text) { warn('長い文には、最初に表示される文も入力してください😊'); return; }
    }
    if (topic && (tlen(topic) > 50 || /[.&]/.test(topic))) { warn('トピックは50文字まで・「.」と「&」は使えません。'); return; }
    if (chain.some(function (c) { return tlen(c) > MAXT; })) { warn('続きの文も1つ' + MAXT + '文字までです。'); return; }
    var f = { kind: 'post', acct: CUR, text: text, media: MEDIA.map(function (o) { return { b64: o.b64 }; }),
              topic: topic, long: longt, chain: chain, reply_control: RC,
              approvals: $('thApprove').checked, spoiler: $('thSpoiler').checked };
    if (usePoll) f.poll = { a: pv[0], b: pv[1], c: pv[2], d: pv[3] };
    var a = ACCTS.filter(function (x) { return x.acct === CUR; })[0];
    szPopup_((a ? a.label : '') + 'のThreadsに投稿しますか？', { icon: '', cancel: true, onYes: function () {
      ask(f, MEDIA.some(function (o) { return o.video; }) ? 'Threadsに投稿中です（動画は数分かかります）' : 'Threadsに投稿中です', function (err, d) {
        if (err) { warn(err); return; }
        reset(); closeCompose();
        szOvShow_(szDoneHtml_('投稿が完了しました'), '#16a34a');
        var db = document.getElementById('szDoneBack');
        if (db) db.addEventListener('click', function () {
          szOvHide_(); loadAll();
          if (d && d.chain_fail) warn('最初の投稿はできましたが、' + d.chain_fail);
        });
      });
    } });
  });

  function hasDraft() {
    return !!($('thText').value.trim() || MEDIA.length || chainBoxes().length || $('thLongText').value.trim() || $('thP1').value.trim());
  }
  function openCompose() {
    var pf = (FEED && FEED.profile) || {}, a = ACCTS.filter(function (x) { return x.acct === CUR; })[0];
    $('thCUser').textContent = pf.username || (a && a.username) || '';
    ['thCAv', 'thCAv2'].forEach(function (i) { if (pf.pic) $(i).src = pf.pic; else $(i).removeAttribute('src'); });
    $('thCompose').style.display = ''; document.body.style.overflow = 'hidden';
    setTimeout(function () { try { $('thText').focus(); } catch (e) {} }, 50);
  }
  function closeCompose() { $('thCompose').style.display = 'none'; document.body.style.overflow = ''; }
  $('thCancel').addEventListener('click', function () {
    if (!hasDraft()) { closeCompose(); return; }
    szPopup_('書きかけのスレッドを破棄しますか？', { cancel: true, onYes: function () { reset(); closeCompose(); } });
  });
  $('thTopicText').addEventListener('input', function () {
    var v = this.value.trim(); $('thTopicLbl').textContent = v ? v : 'コミュニティまたはトピック';
  });
  $('thCompose').addEventListener('click', function (e) {
    var off = e.target.closest && e.target.closest('[data-off]');
    if (off) warn(off.getAttribute('data-off') + 'は、Threadsの公式の仕組みでは使えません（Threadsのアプリから行ってください）。');
  });

  var FEED = null;
  function ago(iso) {
    var t = Date.parse(String(iso).replace(/\+0000$/, 'Z')); if (!t) return '';
    var d = new Date(t), m = Math.floor((Date.now() - t) / 60000);
    if (m < 60) return m + '分';
    if (m < 1440) return Math.floor(m / 60) + '時間';
    if (m < 10080) return Math.floor(m / 1440) + '日';
    return d.getFullYear() + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + ('0' + d.getDate()).slice(-2);
  }
  var TAB = 'th';
  function myRole() { return window.__SZ_ROLE_ || ''; }
  function drawFeed() {
    var pf = FEED.profile || {}, h = '', isDev = myRole() === '開発';
    h += '<div class="top"><span>' + esc(pf.username || '') + '</span><button type="button" data-reload="1" title="最新にする">⟳</button></div>';
    h += '<div class="ph"><div class="nm"><div class="n">' + esc(pf.name || '') + '</div><div class="u">' + esc(pf.username || '') + '</div></div>' +
      (pf.pic ? '<img src="' + esc(pf.pic) + '" referrerpolicy="no-referrer">' : '') + '</div>';
    if (pf.bio) h += '<div class="bio">' + esc(pf.bio) + '</div>';
    var wb = webOf(CUR, 30);
    if (wb && wb.link) h += '<div class="lk"><a href="https://' + esc(wb.link.replace(/^https?:\/\//, '')) + '" target="_blank" rel="noopener">' + esc(wb.link) + '</a></div>';
    if (pf.followers != null) {
      h += '<div class="flrow"><div class="fc" id="thFolOpen">' + ((wb && wb.avatars) || []).map(function (u) { return '<img src="' + esc(u) + '" referrerpolicy="no-referrer">'; }).join('') +
        '<span>フォロワー' + esc((wb && wb.fcount) || pf.followers) + '人</span></div>' +
        '<a class="ig" href="https://www.instagram.com/' + esc(pf.username || '') + '/" target="_blank" rel="noopener" title="Instagram">◎</a></div>';
    }
    h += '<div class="pbtns"><button type="button" class="off" data-off="プロフィールの編集はThreadsのアプリから行ってください（公式の仕組みでは変えられません）">プロフィールを編集</button>' +
      '<button type="button" id="thInsOpen">インサイトを見る</button></div>';
    var TABS = [['th', 'スレッド'], ['rp', '返信'], ['md', 'メディア'], ['rs', '再投稿']];
    h += '<div class="tabs">' + TABS.map(function (t) { return '<div data-tab="' + t[0] + '"' + (t[0] === TAB ? ' class="on"' : '') + '>' + t[1] + '</div>'; }).join('') + '</div>';
    if (TAB === 'th') {
      h += '<div class="cmp" data-compose="1">' + (pf.pic ? '<img src="' + esc(pf.pic) + '" referrerpolicy="no-referrer">' : '<div class="av0"></div>') +
        '<span>最近どう？</span><button type="button" data-compose="1">投稿</button></div>';
    }
    if (TAB === 'rs' && wb && wb.reposts) {
      if (!wb.reposts.length) h += '<div class="fl" style="padding:16px 0">まだ再投稿がありません</div>';
      wb.reposts.forEach(function (r) {
        var n = r.nums || [];
        h += '<div class="fl" style="margin:12px 0 -6px 46px">🔁 ' + esc(pf.username || '') + 'さんが再投稿しました</div>' +
          '<div class="po">' + (r.av ? '<img class="av" src="' + esc(r.av) + '" referrerpolicy="no-referrer">' : '<div class="av"></div>') +
          '<div class="bd"><div class="hd"><b>' + esc(r.user) + '</b><span>' + esc(ago(r.at)) + '</span></div>' +
          (r.text ? '<div class="tx">' + esc(r.text) + '</div>' : '') +
          (r.imgs && r.imgs.length ? '<div class="md' + (r.imgs.length > 1 ? ' many' : '') + '">' + r.imgs.map(function (u) { return '<img src="' + esc(u) + '" loading="lazy" referrerpolicy="no-referrer">'; }).join('') + '</div>' : '') +
          '<div class="st"><span>♡ ' + esc(n[0] || 0) + '</span><span>💬 ' + esc(n[1] || 0) + '</span><span>🔁 ' + esc(n[2] || 0) + '</span><span>➤ ' + esc(n[3] || 0) + '</span>' +
          (r.link ? '<a href="' + esc(r.link) + '" target="_blank" rel="noopener">Threadsで開く</a>' : '') + '</div></div></div>';
      });
      $('thFeed').innerHTML = h; return;
    }
    var list = TAB === 'rp' ? (FEED.myreplies || []) :
      FEED.posts.filter(function (p) {
        if (TAB === 'th') return p.type !== 'REPOST_FACADE';
        if (TAB === 'md') return p.media && p.media.length;
        return p.type === 'REPOST_FACADE';
      });
    if (!list.length) h += '<div class="fl" style="padding:16px 0">' + ({ th: 'まだスレッドがありません', rp: 'まだ返信がありません', md: 'まだメディアがありません', rs: 'まだ再投稿がありません' })[TAB] + '</div>';
    list.forEach(function (p) {
      var md = '';
      if (p.media && p.media.length) {
        md = '<div class="md' + (p.media.length > 1 ? ' many' : '') + '">' + p.media.map(function (m) {
          return m.t === 'VIDEO'
            ? '<video src="' + esc(m.u) + '" poster="' + esc(m.th) + '" controls playsinline preload="none"></video>'
            : '<img src="' + esc(m.u) + '" loading="lazy" referrerpolicy="no-referrer">';
        }).join('') + '</div>';
      }
      var st = p.st || null, canDel = TAB !== 'rp' && (p.zuko || isDev);
      var wp = wb && wb.posts && p.code ? wb.posts[p.code] : null;
      if ((!p.media || !p.media.length) && !p.card && wp) {
        var wm = (wp.vids && wp.vids.length) ? wp.vids.filter(function (v) { return v.u; }).map(function (v) { return { t: 'VIDEO', u: v.u, th: v.th }; })
                                             : (wp.imgs || []).map(function (u) { return { t: 'IMAGE', u: u, th: '' }; });
        if (wm.length) md = '<div class="md' + (wm.length > 1 ? ' many' : '') + '">' + wm.map(function (m) {
          return m.t === 'VIDEO' ? '<video src="' + esc(m.u) + '" poster="' + esc(m.th) + '" controls playsinline preload="none"></video>'
                                 : '<img src="' + esc(m.u) + '" loading="lazy" referrerpolicy="no-referrer">';
        }).join('') + '</div>';
      }
      var cnt4 = null;
      if (st) cnt4 = [st.likes || 0, st.replies || 0, (st.reposts || 0) + (st.quotes || 0), st.shares || 0];
      if (wp && wp.nums && wp.nums.length === 4) cnt4 = wp.nums.map(function (x) { return String(x); });
      else if (wp && wp.nums && cnt4) {
        var nzi = []; cnt4.forEach(function (v, i) { if (v) nzi.push(i); });
        if (wp.nums.length === nzi.length) { var c2 = [0, 0, 0, 0]; nzi.forEach(function (i, k) { c2[i] = String(wp.nums[k]); }); cnt4 = c2; }
        else if (!wp.nums.length) cnt4 = [0, 0, 0, 0];
      }
      var nz = function (v) { return (v && v !== '0' && v !== 0) ? esc(v) : ''; };
      var card = '';
      if (p.card) card = '<a class="lcard" href="' + esc(p.card.url) + '" target="_blank" rel="noopener">' + (p.card.img ? '<img src="' + esc(p.card.img) + '" loading="lazy" referrerpolicy="no-referrer">' : '') +
        '<div class="d">' + esc(p.card.domain || '') + '</div><div class="t">' + esc(p.card.title || p.card.url) + '</div></a>';
      var linkify = function (t) {
        return esc(t).replace(/https?:\/\/[^\s<]+/g, function (u) {
          var raw = u.replace(/&amp;/g, '&'), show = raw.replace(/^https?:\/\/(www\.)?/, '');
          if (show.length > 15) show = show.slice(0, 15) + '…';
          return '<a href="' + esc(raw) + '" target="_blank" rel="noopener">' + esc(show) + '</a>';
        });
      };
      h += '<div class="po">' + (pf.pic ? '<img class="av" src="' + esc(pf.pic) + '" referrerpolicy="no-referrer">' : '<div class="av"></div>') +
        '<div class="bd"><div class="hd"><b>' + esc(pf.username || '') + '</b>' + (p.topic ? '<span class="tp">› ' + esc(p.topic) + '</span>' : '') + '<span>' + esc(ago(p.at)) + '</span>' + (p.zuko ? '<i>ズコから</i>' : '') +
        '<button type="button" class="dots" data-menu="' + esc(p.id) + '">⋯</button></div>' +
        '<div class="pmenu" id="pm_' + esc(p.id) + '" style="display:none">' +
          (p.link ? '<a href="' + esc(p.link) + '" target="_blank" rel="noopener">Threadsで開く</a>' : '') +
          (canDel ? '<button type="button" class="del" data-fdel="' + esc(p.id) + '">削除</button>' : '') + '</div>' +
        (p.text ? '<div class="tx">' + linkify(p.text) + '</div>' : (p.type === 'REPOST_FACADE' ? '<div class="tx" style="color:#888">🔁 再投稿（内容はThreadsの画面から読み込んでいます…）</div>' : '')) + md + card +
        (cnt4 ? '<div class="st"><span>♡ ' + nz(cnt4[0]) + '</span><span>💬 ' + nz(cnt4[1]) + '</span><span>🔁 ' + nz(cnt4[2]) + '</span><span>➤ ' + nz(cnt4[3]) + '</span></div>' : '') +
        (TAB !== 'rp' ? '<button type="button" class="cmb" data-cm="' + esc(p.id) + '">💬 コメントを見る・返信する</button>' +
          '<div class="cms" id="cm_' + esc(p.id) + '" style="display:none"></div>' : '') +
        '</div></div>';
    });
    if (FEED.after && TAB !== 'rp') h += '<button type="button" class="more" id="thMore">もっと見る</button>';
    $('thFeed').innerHTML = h;
  }
  function loadFeed(after) {
    ask({ kind: 'feed', acct: CUR, after: after || '' }, after ? '' : '読み込み中です', function (err, d) {
      if (err) { warn(err); return; }
      if (after && FEED) { FEED.posts = FEED.posts.concat(d.posts || []); FEED.after = d.after || ''; FEED.more = true; }
      else FEED = { profile: d.profile || {}, posts: d.posts || [], after: d.after || '' };
      drawFeed();
    });
  }
  function showFeedFromData() {
    var fd = DATA && DATA.feeds && DATA.feeds[CUR];
    if (!fd || !fd.ok) return false;
    FEED = { profile: fd.profile || {}, posts: (fd.posts || []).slice(), after: fd.after || '', myreplies: fd.myreplies || [] };
    drawFeed(); return true;
  }
  $('thShow').addEventListener('click', function () {
    if (!CUR) return;
    FEED = null;
    $('thMain').style.display = 'none'; $('thFeedWrap').style.display = '';
    window.scrollTo(0, 0);
    VIEW = 'feed';
    if (!showFeedFromData()) $('thFeed').innerHTML = '<div class="fl">読み込み中です…</div>';
    loadWeb(CUR, 30, false);
  });
  $('thFeedBack').addEventListener('click', function () {
    if (VIEW !== 'feed') { VIEW = 'feed'; if (FEED) drawFeed(); window.scrollTo(0, 0); return; }   
    $('thFeedWrap').style.display = 'none'; $('thMain').style.display = ''; window.scrollTo(0, 0);
  });
  $('thFeed').addEventListener('click', function (e) {
    if (e.target && e.target.id === 'thMore') { e.target.disabled = true; e.target.textContent = '読み込み中です…'; loadFeed(FEED.after); }
  });

  function cmRow(r, sub, pending) {
    var a = '';
    if (pending) {
      a = '<button type="button" class="ok" data-ap="' + esc(r.id) + '">承認する</button><button type="button" class="ng" data-ig="' + esc(r.id) + '">無視する</button>';
    } else {
      a = '<button type="button" data-rp="' + esc(r.id) + '">↩ 返信</button>';
      if (!r.mine && !sub) a += r.hidden ? '<button type="button" data-un="' + esc(r.id) + '">表示に戻す</button>'
                                         : '<button type="button" class="ng" data-hd="' + esc(r.id) + '">非表示にする</button>';
    }
    return '<div class="cm' + (sub ? ' sub' : '') + (r.hidden ? ' hid' : '') + '" id="cr_' + esc(r.id) + '">' +
      '<div class="h"><b>' + esc(r.user || '') + '</b><span>' + esc(ago(r.at)) + '</span>' +
      (r.mine ? '<em>お店</em>' : '') + (r.hidden ? '<em>非表示中</em>' : '') + '</div>' +
      (r.text ? '<div class="x">' + esc(r.text) + '</div>' : '') + (r.img ? '<img src="' + esc(r.img) + '" referrerpolicy="no-referrer">' : '') +
      '<div class="a">' + a + '</div><div class="rpbox" id="rb_' + esc(r.id) + '" style="display:none"></div></div>';
  }
  function loadCm(mid, fetch) {
    var box = $('cm_' + mid); if (!box) return;
    box.style.display = '';
    var post = FEED && FEED.posts.filter(function (x) { return x.id === mid; })[0];
    if (!fetch && post && post.cm && !post.cm.err) { renderCm(mid, post.cm); return; }
    box.innerHTML = '<div class="fl">読み込み中です…</div>';
    ask({ kind: 'replies', acct: CUR, media_id: mid }, '', function (err, d) {
      if (err) { box.innerHTML = '<div class="fl">' + esc(err) + '</div>'; return; }
      if (post) post.cm = { replies: d.replies || [], pending: d.pending || [] };
      renderCm(mid, d);
    });
  }
  function renderCm(mid, d) {
    var box = $('cm_' + mid); if (!box) return;
    (function () {
      var rs = (d && d.replies) || [], pd = (d && d.pending) || [], h = '';
      if (pd.length) { h += '<div class="pd">承認待ちのコメント ' + pd.length + '件</div>' + pd.map(function (r) { return cmRow(r, false, true); }).join(''); }
      if (!rs.length && !pd.length) h += '<div class="fl">まだコメントはありません</div>';
      h += rs.map(function (r) { return cmRow(r, !!(r.to && r.to !== mid), false); }).join('');
      h += '<div class="cm"><div class="a"><button type="button" data-rp="' + esc(mid) + '">↩ この投稿に返信</button></div><div class="rpbox" id="rb_' + esc(mid) + '" style="display:none"></div></div>';
      box.innerHTML = h; box.setAttribute('data-mid', mid);
    })();
  }
  function openReply(to) {
    var rb = $('rb_' + to); if (!rb) return;
    if (rb.style.display !== 'none') { rb.style.display = 'none'; return; }
    rb.style.display = '';
    rb.innerHTML = '<textarea placeholder="返信の文（500文字まで）"></textarea><div class="r"><span>0 / 500</span><button type="button" data-send="' + esc(to) + '">返信する</button></div>';
    var ta = rb.querySelector('textarea'), sp = rb.querySelector('span');
    ta.addEventListener('input', function () { sp.textContent = tlen(ta.value) + ' / 500'; });
    ta.addEventListener('focus', function () { LAST = ta; });
    ta.focus();
  }
  function midOf(el) { var b = el.closest('.cms'); return b ? b.getAttribute('data-mid') : ''; }
  function act(fields, busy, doneTitle, mid) {
    ask(fields, busy, function (err) {
      if (err) { warn(err); return; }
      szOvShow_(szDoneHtml_(doneTitle), '#16a34a');
      var db = document.getElementById('szDoneBack');
      if (db) db.addEventListener('click', function () { szOvHide_(); loadCm(mid, true); });
    });
  }
  $('thFeed').addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    var g = function (k) { return t.getAttribute(k); };
    if (g('data-cm')) {
      var box = $('cm_' + g('data-cm'));
      if (box && box.style.display !== 'none') { box.style.display = 'none'; return; }
      loadCm(g('data-cm')); return;
    }
    if (g('data-rp')) { openReply(g('data-rp')); return; }
    if (g('data-fdel')) {
      var dmid = g('data-fdel');
      szPopup_('この投稿をThreadsから削除しますか？（元に戻せません）', { cancel: true, onYes: function () {
        ask({ kind: 'delete', acct: CUR, media_id: dmid }, '削除中です', function (err) {
          if (err) { warn(err); return; }
          if (FEED) FEED.posts = FEED.posts.filter(function (x) { return x.id !== dmid; });
          szOvShow_(szDoneHtml_('削除が完了しました'), '#16a34a');
          var db = document.getElementById('szDoneBack');
          if (db) db.addEventListener('click', function () { szOvHide_(); if (FEED) drawFeed(); loadAll(); });
        });
      } });
      return;
    }
    var mid = midOf(t);
    if (g('data-send')) {
      var to = g('data-send'), ta = $('rb_' + to).querySelector('textarea'), txt = ta.value.trim();
      if (!txt) { warn('返信の文を入力してください😊'); return; }
      if (tlen(txt) > 500) { warn('返信は500文字までです。'); return; }
      szPopup_('お店として返信しますか？', { icon: '', cancel: true, onYes: function () {
        act({ kind: 'reply', acct: CUR, to_id: to, text: txt }, '返信中です', '返信が完了しました', mid);
      } });
      return;
    }
    if (g('data-hd')) { var r1 = g('data-hd'); szPopup_('このコメントを非表示にしますか？（あとで戻せます）', { cancel: true, onYes: function () { act({ kind: 'hide', acct: CUR, reply_id: r1, hide: true }, '非表示にしています', '非表示にしました', mid); } }); return; }
    if (g('data-un')) { var r2 = g('data-un'); act({ kind: 'hide', acct: CUR, reply_id: r2, hide: false }, '表示に戻しています', '表示に戻しました', mid); return; }
    if (g('data-ap')) { var r3 = g('data-ap'); act({ kind: 'approve', acct: CUR, reply_id: r3, approve: true }, '承認しています', '承認しました', mid); return; }
    if (g('data-ig')) { var r4 = g('data-ig'); szPopup_('このコメントを無視しますか？（表示しません）', { cancel: true, onYes: function () { act({ kind: 'approve', acct: CUR, reply_id: r4, approve: false }, '処理中です', '無視しました', mid); } }); return; }
  });

  var WEB = {}, INS = {}, WEBBUSY = {}, VIEW = 'feed', DAYS = 30;
  var WKEY = 'th_web_v1', IKEY = 'th_ins_v1';
  try { WEB = JSON.parse(localStorage.getItem(WKEY) || '{}') || {}; INS = JSON.parse(localStorage.getItem(IKEY) || '{}') || {}; } catch (e) {}
  function webOf(a, d) { return WEB[a + '_' + d] || (d === 30 ? null : null); }
  function saveWI() { try { localStorage.setItem(WKEY, JSON.stringify(WEB)); localStorage.setItem(IKEY, JSON.stringify(INS)); } catch (e) {} }
  function loadWeb(a, d, force) {
    var k = a + '_' + d, w = WEB[k];
    if (WEBBUSY[k] || (!force && w && Date.now() - (w._t || 0) < 30 * 60000)) return;   
    WEBBUSY[k] = true;
    ask({ kind: 'web', acct: a, days: d }, '', function (err, r) {
      WEBBUSY[k] = false;
      if (err || !r) return;
      r._t = Date.now(); WEB[k] = r; saveWI(); redraw();
    });
  }
  function loadIns(a, d) {
    ask({ kind: 'insights', acct: a, days: d }, '', function (err, r) {
      if (err || !r) return;
      r._t = Date.now(); INS[a + '_' + d] = r; saveWI(); redraw();
    });
  }
  function redraw() {
    if (VIEW === 'feed' && FEED) drawFeed();
    else if (VIEW === 'fol') drawFol();
    else if (VIEW === 'ins') drawIns();
  }
  function drawFol() {
    var w = webOf(CUR, 30), pf = (FEED && FEED.profile) || {}, h = '';
    var list = (w && w.followers) || null;
    h += '<div class="ttl">' + esc(pf.username || '') + '</div>';
    h += '<div class="flh"><div class="on">フォロワー<b>' + esc(pf.followers != null ? pf.followers : (list ? list.length : '')) + '</b></div></div>';
    if (!list || (!list.length && w && w.login && /止め|入れません/.test(w.login))) h += '<div class="fl" style="padding:14px 0">' + (w && w.login && /止め|入れません/.test(w.login) ? 'フォロワーの一覧は、サーバーのThreadsのログインが済むと出ます' : '読み込み中です…（30秒ほどかかります）') + '</div>';
    else if (!list.length) h += '<div class="fl" style="padding:14px 0">まだフォロワーがいません</div>';
    else h += list.map(function (f) {
      return '<div class="fr">' + (f.img ? '<img src="' + esc(f.img) + '" referrerpolicy="no-referrer">' : '<div class="noimg"></div>') +
        '<div class="w"><a href="https://www.threads.com/@' + esc(f.user) + '" target="_blank" rel="noopener">' + esc(f.user) + '</a><div>' + esc(f.name || '') + '</div></div>' +
        (f.btn ? '<span class="b">' + esc(f.btn) + '</span>' : '') + '</div>';
    }).join('');
    $('thFeed').innerHTML = '<div class="top"><button type="button" data-back="1">‹</button><span>フォロワー</span></div>' + h;
  }
  function chart(series) {
    if (!series || !series.length) return '';
    var W = 320, H = 150, L = 26, B = 18, T = 8, max = 0;
    series.forEach(function (p) { if (p.v > max) max = p.v; });
    var step = 1, cand = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
    for (var ci = 0; ci < cand.length; ci++) { step = cand[ci]; if (step * 5 >= max) break; }
    var top = step * 5;
    var x = function (i) { return L + (W - L - 6) * (series.length === 1 ? 0 : i / (series.length - 1)); };
    var y = function (v) { return T + (H - T - B) * (1 - v / top); };
    var pts = series.map(function (p, i) { return x(i).toFixed(1) + ',' + y(p.v).toFixed(1); }).join(' ');
    var g = '';
    for (var k = 0; k <= 5; k++) {
      var vv = Math.round(step * k * 10) / 10, yy = y(vv).toFixed(1);
      g += '<line x1="' + L + '" x2="' + (W - 6) + '" y1="' + yy + '" y2="' + yy + '" stroke="#2a2a2a"/><text x="' + (L - 4) + '" y="' + (Number(yy) + 3) + '" text-anchor="end">' + vv + '</text>';
    }
    var area = x(0).toFixed(1) + ',' + y(0).toFixed(1) + ' ' + pts + ' ' + x(series.length - 1).toFixed(1) + ',' + y(0).toFixed(1);
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%">' + g +
      '<polygon points="' + area + '" fill="rgba(255,255,255,.08)"/><polyline points="' + pts + '" fill="none" stroke="#f3f5f7" stroke-width="2"/>' +
      '<text x="' + L + '" y="' + (H - 4) + '">' + esc(md(series[0].d)) + '</text><text x="' + (W - 6) + '" y="' + (H - 4) + '" text-anchor="end">' + esc(md(series[series.length - 1].d)) + '</text></svg>';
  }
  function md(d) { var m = String(d || '').match(/(\d+)\/(\d+)/); return m ? Number(m[1]) + '月' + Number(m[2]) + '日' : d; }
  function drawIns() {
    var k = CUR + '_' + DAYS, a = INS[k], w = WEB[k], wi = (w && w.ins) || {}, h = '';
    var card = function (label, v, p) { return '<div class="card"><div class="k">' + label + '</div><div class="v">' + esc(v == null || v === '' ? '…' : v) + '</div><div class="p">' + esc(p || '') + '</div></div>'; };
    h += '<div class="ttl">インサイト</div>';
    h += '<div class="per">' + [7, 14, 30, 90].map(function (d) { return '<button type="button" data-days="' + d + '"' + (d === DAYS ? ' class="on"' : '') + '>過去' + d + '日間</button>'; }).join('') + '</div>';
    if (a && a.from) h += '<div class="note">' + esc(md(a.from)) + ' – ' + esc(md(a.to)) + '</div>';
    h += '<div class="sec"><h3>概要</h3><div class="cards">' +
      card('閲覧数', wi.views_web || (a && a.views), wi.views_pct || (a && a.views_pct)) +
      card('閲覧者', wi.viewers, wi.viewers_pct) +
      card('純フォロワー', wi.net, wi.net_pct) +
      card('インタラクション', wi.inter_web || (a && a.inter), wi.inter_pct || (a && a.inter_pct)) + '</div>' +
      (a ? chart(a.series) : '<div class="fl">読み込み中です…</div>') + '</div>';
    h += '<div class="sec"><h3>閲覧者</h3><div class="big">' + esc(wi.viewers || '…') + '</div><div class="sub">' + esc(wi.since ? (wi.viewers_pct || '') + ' ' + wi.since : '') + '</div>' +
      '<h3 style="font-size:15px;margin-top:6px">閲覧者タイプ</h3><div class="cards">' +
      card('フォロワー', wi.type_f, wi.type_f_pct) + card('フォロワー以外', wi.type_nf, wi.type_nf_pct) + '</div></div>';
    if (!w) h += '<div class="note">閲覧者・純フォロワー・閲覧者タイプはThreadsの画面から読んでいます（30秒ほどかかります）</div>';
    else if (!wi.viewers && w.login && /止め|入れません/.test(w.login)) h += '<div class="note">閲覧者・純フォロワー・閲覧者タイプは、サーバーのThreadsのログインが済むと出ます</div>';
    $('thFeed').innerHTML = '<div class="top"><button type="button" data-back="1">‹</button><span>インサイト</span></div>' + h;
  }
  $('thFeed').addEventListener('click', function (e) {
    var t = e.target;
    var cl = function (sel) { return t.closest && t.closest(sel); };
    if (cl('[data-compose]')) { openCompose(); return; }
    if (cl('[data-back]')) { VIEW = 'feed'; if (FEED) drawFeed(); window.scrollTo(0, 0); return; }
    if (cl('[data-reload]')) { loadAll(); loadWeb(CUR, 30, true); return; }
    var tb = cl('[data-tab]');
    if (tb) { TAB = tb.getAttribute('data-tab'); drawFeed(); return; }
    var mn = cl('[data-menu]');
    if (mn) { var pm = $('pm_' + mn.getAttribute('data-menu')); if (pm) pm.style.display = pm.style.display === 'none' ? '' : 'none'; return; }
    var of = cl('[data-off]');
    if (of && !cl('#thCompose')) { warn(of.getAttribute('data-off')); return; }
    if (t.closest && t.closest('#thFolOpen')) { VIEW = 'fol'; drawFol(); window.scrollTo(0, 0); loadWeb(CUR, 30, false); return; }
    if (t.id === 'thInsOpen') { VIEW = 'ins'; drawIns(); window.scrollTo(0, 0); loadIns(CUR, DAYS); loadWeb(CUR, DAYS, false); return; }
    var dd = t.getAttribute && t.getAttribute('data-days');
    if (dd) { DAYS = Number(dd); drawIns(); loadIns(CUR, DAYS); loadWeb(CUR, DAYS, false); }
  });

  function loadList() {
    if (!$('thList') || $('thList').style.display === 'none') return;   
    if (!DATA || !DATA.lists || !DATA.lists[CUR]) { $('thList').innerHTML = '<div class="thempty">読み込み中です…</div>'; return; }
    (function (d) {
      var ps = (d && d.posts) || [];
      if (!ps.length) { $('thList').innerHTML = '<div class="thempty">まだありません</div>'; return; }
      $('thList').innerHTML = ps.map(function (p) {
        return '<div class="thpost"><div class="m">' + esc(String(p.at || '').slice(0, 16)) + '　' + esc(p.who || '') +
          (p.n ? '　📷' + p.n : '') + (p.chain ? '　➕続き' + p.chain : '') + '</div><div class="t">' + esc(p.text || '（文なし）') + '</div>' +
          '<div class="b">' + (p.link ? '<a href="' + esc(p.link) + '" target="_blank" rel="noopener">開く</a>' : '') +
          '<button type="button" data-id="' + esc(p.id) + '">削除</button></div></div>';
      }).join('');
    })({ posts: DATA.lists[CUR] });
  }
  $('thList').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-id]'); if (!b) return;
    var mid = b.getAttribute('data-id');
    szPopup_('この投稿をThreadsから削除しますか？（続きの投稿も一緒に消えます）', { cancel: true, onYes: function () {
      ask({ kind: 'delete', acct: CUR, media_id: mid }, '削除中です', function (err) {
        if (err) { warn(err); return; }
        szOvShow_(szDoneHtml_('削除が完了しました'), '#16a34a');
        var db = document.getElementById('szDoneBack');
        if (db) db.addEventListener('click', function () { szOvHide_(); loadAll(); });
      });
    } });
  });

  var CKEY = 'th_cache_v1_' + (window.__SZ_ROLE_ || '') + '_' + (window.__SZ_WHO_ || '');
  function cacheGet() { try { return JSON.parse(localStorage.getItem(CKEY) || 'null'); } catch (e) { return null; } }
  function cacheSet(d) { try { localStorage.setItem(CKEY, JSON.stringify(d)); } catch (e) {} }
  function apply(d, fresh) {
    DATA = d;
    ACCTS = (d && d.accounts) || [];
    if (!ACCTS.length) {
      if (fresh) { $('thMain').style.display = 'none'; $('thFeedWrap').style.display = 'none'; $('thLoad').style.display = ''; $('thLoad').textContent = 'この端末から投稿できるアカウントがありません。'; }
      return;
    }
    if (!ACCTS.some(function (a) { return a.acct === CUR; })) CUR = (d.cur && ACCTS.some(function (a) { return a.acct === d.cur; })) ? d.cur : ACCTS[0].acct;
    $('thLoad').style.display = 'none'; $('thMain').style.display = '';
    drawAcct(); drawCnt();
    if (VIEW === 'feed' && !(FEED && FEED.more)) { if (!showFeedFromData()) $('thFeed').innerHTML = '<div class="fl">読み込み中です…</div>'; }
    loadWeb(CUR, 30, false);
  }
  function loadAll() {
    ask({ kind: 'open' }, '', function (err, d) {
      if (err) { if (!DATA) $('thLoad').textContent = err; return; }
      d.cur = CUR; cacheSet(d); apply(d, true);
    });
  }
  var _c = cacheGet();
  if (_c) apply(_c, false);
  loadAll();
}
