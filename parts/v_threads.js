// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：threads
var THREADS_LOGO_ = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">' +
  '<rect width="24" height="24" rx="5.4" fill="#101010"/>' +
  '<path transform="translate(4.56 4.56) scale(.62)" fill="#fff" d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"/></svg>';
var THREADSCSS_ =
  '.thw{width:100%;box-sizing:border-box;max-width:560px;margin:0 auto;padding:0 6px 60px;text-align:left;}' +
  '.thteaser{margin:18vh 0 0;text-align:center;color:#fff;font-weight:900;font-size:2.1rem;line-height:1.6;letter-spacing:.02em;text-shadow:0 3px 10px rgba(0,0,0,.25);}' +
  '.thteaser span{display:block;}.thteaser span.s{font-size:1.3rem;font-weight:800;white-space:nowrap;}' +
  '.thacct{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:6px 0 12px;}' +
  '.thacct button,.thseg button{background:#fff;color:#0f172a;border:3px solid transparent;border-radius:14px;padding:14px 4px;font:inherit;font-size:18px;font-weight:900;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.15);}' +
  '.thacct button.on,.thseg button.on{background:#16a34a;color:#fff;border-color:#15803d;}' +
  '.thacct.one{grid-template-columns:1fr;}' +
  '.thacct button small{display:block;font-size:11px;font-weight:700;line-height:1.15;opacity:.85;}' +
  '.thf .ronote{background:#262626;color:#f3f5f7;border-radius:10px;padding:9px 12px;font-size:13px;font-weight:700;line-height:1.5;margin:12px 0 2px;}' +
  '.thw .hhead{margin:0 0 3px;gap:4px;}.thw .hhead .bmark{font-size:12px;}.thw .hhead .bmark svg{width:16px;height:16px;display:block;}.thw .hhead .bname{font-size:.85rem;}' +
  '.thacct{gap:8px;margin:2px 0 8px;}' +
  '.thacct button{padding:3px 4px;font-size:15px;border-width:2px;border-radius:10px;box-shadow:0 2px 5px rgba(0,0,0,.15);}' +
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
  '.thsheet{position:relative;background:#181818;color:#f3f5f7;border:1px solid rgba(243,245,247,.15);border-radius:16px;box-shadow:0 12px 24px rgba(0,0,0,.08);max-width:620px;margin:0 auto;font-family:system-ui,-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:21px;}' +
  '.thsheet button{font-family:inherit;}' +
  '.thsheet .tsh{display:flex;align-items:center;height:56px;padding:0 22px 0 24px;border-bottom:1px solid rgba(243,245,247,.15);box-sizing:border-box;}' +
  '.thsheet .tsh .tcx,.thsheet .tsh .tdone{background:none;border:0;color:#f3f5f7;font-size:17px;cursor:pointer;padding:0;}' +
  '.thsheet .tsh .tdone{color:#777;cursor:default;}' +
  '.thsheet .tsh .tdone.ok{color:#f3f5f7;cursor:pointer;}' +
  '.thsheet .tsh .tl,.thsheet .tsh .tshr{flex:0 0 88px;display:flex;align-items:center;}' +
  '.thsheet .tsh .tshr{justify-content:flex-end;gap:17px;}' +
  '.thsheet .tsh b{flex:1;text-align:center;font-size:16px;font-weight:700;}' +
  '.thsheet .tib{background:none;border:0;color:#f3f5f7;padding:0;cursor:pointer;display:inline-flex;}' +
  '.thsheet .tsb{padding:20px 24px 0;}' +
  '.thsheet .tblk{display:flex;gap:12px;}' +
  '.thsheet #thChain .tblk{margin-top:8px;}' +
  '.thsheet .tleft{width:36px;flex:none;display:flex;flex-direction:column;align-items:center;}' +
  '.thsheet .tav{width:36px;height:36px;border-radius:50%;object-fit:cover;background:#0a0a0a;display:block;flex:none;}' +
  '.thsheet .tav.sm{width:16px;height:16px;}' +
  '.thsheet .tline{flex:1;width:2px;min-height:12px;background:#333638;border-radius:2px;margin-top:11px;}' +
  '.thsheet .tmain{flex:1;min-width:0;padding-bottom:8px;}' +
  '.thsheet .tun{display:flex;align-items:center;height:21px;margin-top:-4px;}' +
  '.thsheet .tun b{font-weight:600;white-space:nowrap;}' +
  '.thsheet .tchev{color:#777;display:inline-flex;transform:rotate(-90deg);margin:0 4px 0 6px;flex:none;}' +
  '.thsheet .ttopic{flex:1;min-width:0;background:transparent;border:0;outline:none;color:#f3f5f7;font:inherit;font-weight:600;padding:0;margin:0;field-sizing:content;}' +
  '.thsheet .ttopic::placeholder{color:#777;font-weight:400;}' +
  '.thsheet .tpg{flex:none;margin-left:12px;font-size:12px;line-height:20px;color:#999;background:#262626;border-radius:10px;padding:0 7px;}' +
  '.thsheet .tblk .tx{margin-left:auto;background:none;border:0;color:#777;padding:0 0 0 8px;cursor:pointer;display:inline-flex;}' +
  '.thsheet .tta{display:block;width:100%;box-sizing:border-box;background:transparent;border:0;color:#f3f5f7;font:inherit;font-size:15px;line-height:21px;height:21px;resize:none;outline:none;padding:0;margin:0;overflow:hidden;}' +
  '.thsheet .tta::placeholder{color:#777;}' +
  '.thsheet .ticons{display:flex;align-items:center;gap:16px;margin-top:12px;color:#777;}' +
  '.thsheet .tic{position:relative;overflow:hidden;background:none;border:0;color:#777;padding:0;height:20px;min-width:20px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;font-size:15px;}' +
  '.thsheet .tic input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;}' +
  '.thsheet .tmed{position:relative;margin-top:8px;}' +
  '.thsheet .tmed.many{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;}' +
  '.thsheet .tmed.many::-webkit-scrollbar{display:none;}' +
  '.thsheet .tmi{position:relative;flex:none;}' +
  '.thsheet .tmi img,.thsheet .tmi .v{display:block;width:100%;max-height:420px;object-fit:cover;border-radius:8px;}' +
  '.thsheet .tmed.many .tmi img,.thsheet .tmed.many .tmi .v{width:auto;height:220px;max-width:260px;}' +
  '.thsheet .tmi .v{background:#0a0a0a;color:#f3f5f7;display:flex;align-items:center;justify-content:center;font-size:40px;aspect-ratio:16/9;}' +
  '.thsheet .tmed.many .tmi .v{width:190px;}' +
  '.thsheet .tmed.sp .tmi img,.thsheet .tmed.sp .tmi .v{filter:blur(18px);}' +
  '.thsheet .tmi .rm,.thsheet .tmi .mo{position:absolute;border:0;border-radius:50%;background:rgba(0,0,0,.4);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;}' +
  '.thsheet .tmi .rm{top:8px;right:8px;width:24px;height:24px;}' +
  '.thsheet .tmi .mo{bottom:10px;left:10px;width:28px;height:28px;font-size:16px;font-weight:900;letter-spacing:1px;}' +
  '.thsheet .tpoll input{display:block;width:100%;box-sizing:border-box;height:46px;margin-top:8px;background:transparent;border:1px solid rgba(243,245,247,.15);border-radius:12px;padding:0 14px;color:#f3f5f7;font:inherit;outline:none;}' +
  '.thsheet .tpoll input.add{border-style:dashed;}' +
  '.thsheet .tpoll input::placeholder{color:#777;}' +
  '.thsheet .tpf{display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:13px;color:#777;}' +
  '.thsheet .tpf button{background:none;border:0;color:#999;font-size:13px;cursor:pointer;padding:0;}' +
  '.thsheet .tlongc{position:relative;margin-top:8px;border:1px solid rgba(243,245,247,.15);border-radius:12px;padding:10px 36px 10px 14px;color:#ccc;white-space:pre-wrap;cursor:pointer;max-height:84px;overflow:hidden;}' +
  '.thsheet .tlongc .rm{position:absolute;top:10px;right:10px;background:none;border:0;color:#777;padding:0;cursor:pointer;display:inline-flex;}' +
  '.thsheet .themos{display:grid;grid-template-columns:repeat(8,1fr);gap:4px;background:#262626;border-radius:16px;padding:8px;margin-top:8px;box-shadow:none;}' +
  '.thsheet .themos button{border:0;background:transparent;font-size:24px;line-height:1.3;padding:4px 0;cursor:pointer;border-radius:8px;}' +
  '.thsheet .tadd{display:flex;gap:12px;align-items:center;padding-top:10px;opacity:.4;}' +
  '.thsheet .tadd.on{opacity:1;cursor:pointer;}' +
  '.thsheet .tadd span{color:#777;}' +
  '.thsheet .tsf{display:flex;align-items:center;justify-content:space-between;padding:29px 24px 24px;}' +
  '.thsheet #thOptBtn{background:none;border:0;color:#777;font-size:15px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:0;}' +
  '.thsheet .tsfr{display:flex;align-items:center;gap:16px;}' +
  '.thsheet .tcnt{color:#777;}' +
  '.thsheet .tcnt.neg{color:#ff3040;}' +
  '.thsheet #thGo{background:transparent;color:#f3f5f7;border:1px solid rgba(243,245,247,.15);border-radius:10px;width:64px;height:36px;font-size:15px;font-weight:600;cursor:pointer;padding:0;}' +
  '.thsheet #thGo:disabled{opacity:.3;cursor:default;}' +
  '.thsheet .tmenu{position:absolute;z-index:3;background:#262626;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.35);overflow:hidden;width:280px;max-width:calc(100% - 16px);}' +
  '.thsheet .tmenu .h{padding:20px 20px 0;font-size:13px;line-height:18px;font-weight:600;color:#777;}' +
  '.thsheet .tmenu .s{border-bottom:1px solid #333638;}' +
  '.thsheet .tmenu .s:last-child{border-bottom:0;}' +
  '.thsheet .tmenu button{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;box-sizing:border-box;min-height:38px;background:none;border:0;color:#f3f5f7;font-size:15px;font-weight:600;text-align:left;padding:8px 20px;cursor:pointer;}' +
  '.thsheet .tmenu .s>button:first-child,.thsheet .tmenu .h+button{margin-top:6px;}' +
  '.thsheet .tmenu .s>button:last-child{margin-bottom:6px;}' +
  '.thsheet .tmenu .r{color:#777;font-weight:400;display:inline-flex;align-items:center;gap:6px;}' +
  '.thsheet #thRc .r{color:#f3f5f7;}' +
  '.thsheet .tmenu .sw{flex:none;position:relative;width:40px;height:24px;border-radius:16px;background:#323539;}' +
  '.thsheet .tmenu .sw i{position:absolute;top:1px;left:1px;width:22px;height:22px;border-radius:14px;background:#0a0a0a;border:1px solid rgba(243,245,247,.15);box-sizing:border-box;transition:left .15s;}' +
  '.thsheet .tmenu .sw.on{background:#f3f5f7;}' +
  '.thsheet .tmenu .sw.on i{left:17px;}' +
  '.thsheet #thMoreMenu{top:50px;right:16px;}' +
  '.thsheet #thOpt{left:8px;bottom:64px;width:340px;}' +
  '.thsheet .tmi .tmenu{left:4px;bottom:44px;width:240px;}' +
  '.thsheet #thDraftList{min-height:60vh;}' +
  '.thsheet .tempty{min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#777;text-align:center;}' +
  '.thsheet .tempty svg{color:#777;margin-bottom:24px;}' +
  '.thsheet .tempty b{color:#999;font-weight:600;}' +
  '.thsheet .tdr{display:flex;gap:12px;padding:16px 24px;border-bottom:1px solid #333638;cursor:pointer;}' +
  '.thsheet .tdr .w{flex:1;min-width:0;}' +
  '.thsheet .tdr .t{white-space:pre-wrap;max-height:63px;overflow:hidden;}' +
  '.thsheet .tdr .d{color:#777;font-size:13px;margin-top:2px;}' +
  '.thsheet .tdr .rm{background:none;border:0;color:#777;padding:0;cursor:pointer;display:inline-flex;align-self:flex-start;}' +
  '.thsheet .tlta{display:block;width:100%;box-sizing:border-box;min-height:60vh;background:transparent;border:0;outline:none;resize:none;color:#f3f5f7;font:inherit;padding:24px;}' +
  '.thsheet .tlta::placeholder{color:#777;}' +
  '.thsheet .tfmt{display:flex;justify-content:center;gap:32px;padding:16px 0 20px;}' +
  '.thsheet .tfmt button{background:none;border:0;color:#f3f5f7;font-size:15px;font-weight:700;padding:0;cursor:pointer;min-width:20px;}' +
  '.thsheet #thGifBox .tmi img{width:auto;max-width:100%;max-height:300px;object-fit:contain;}' +
  '.thsheet .tgs{padding:4px 24px 12px;}' +
  '.thsheet .tgs input{display:block;width:100%;box-sizing:border-box;height:40px;background:#0a0a0a;border:1px solid rgba(243,245,247,.15);border-radius:16px;padding:0 16px;color:#f3f5f7;font:inherit;outline:none;}' +
  '.thsheet .tgs input::placeholder{color:#777;}' +
  '.thsheet .tgg{padding:0 24px;height:60vh;overflow-y:auto;}' +
  '.thsheet .tgc{columns:2;column-gap:4px;}' +
  '.thsheet .tgg img{display:block;width:100%;height:auto;margin:0 0 4px;border-radius:4px;cursor:pointer;background:#262626;break-inside:avoid;}' +
  '.thsheet .tgl{color:#777;text-align:center;padding:48px 0;}' +
  '.thsheet .tgp{text-align:center;color:#777;font-size:12px;padding:10px 0 16px;}' +
  '.thcomp .task{position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;}' +
  '.thcomp .taskb{background:#181818;color:#f3f5f7;border:1px solid rgba(243,245,247,.15);border-radius:16px;width:280px;max-width:100%;text-align:center;overflow:hidden;font-family:system-ui,-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;font-size:15px;}' +
  '.thcomp .taskb b{display:block;padding:24px 20px 0;font-size:16px;font-weight:700;}' +
  '.thcomp .taskb p{margin:12px 20px 20px;color:#999;font-size:14px;line-height:20px;}' +
  '.thcomp .taskb button{display:block;width:100%;height:54px;background:none;border:0;border-top:1px solid #333638;color:#f3f5f7;font-size:15px;font-weight:700;cursor:pointer;}' +
  '.thcomp .taskb button.red{color:#ff3040;font-weight:400;}' +
  '@media (max-width:460px){.thsheet .tsh,.thsheet .tsf{padding-left:16px;padding-right:16px;}.thsheet .tsb{padding:16px 16px 0;}.thsheet .ticons{gap:12px;}.thsheet .tdr{padding:14px 16px;}}';
var THICO_ = {
  draft: '<path d="M12.994 15.506a1 1 0 1 1 0 2h-6a1 1 0 0 1 0-2h6z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 1a1 1 0 0 1 .707.293l10 10A1 1 0 0 1 23 12v3.6c0 1.103.001 1.991-.058 2.709-.052.637-.154 1.208-.381 1.737l-.106.224a5 5 0 0 1-2.01 2.091l-.175.094c-.593.302-1.233.428-1.961.487-.718.059-1.606.058-2.71.058H8.4c-1.103 0-1.991.001-2.709-.058-.728-.06-1.37-.185-1.962-.487a5.002 5.002 0 0 1-2.091-2.01l-.093-.175c-.302-.593-.428-1.233-.487-1.961C.999 17.59 1 16.703 1 15.599V8.4c0-1.103-.001-1.991.058-2.709.06-.728.185-1.368.487-1.96l.093-.175A5.001 5.001 0 0 1 3.73 1.545l.224-.106c.53-.227 1.1-.33 1.737-.381C6.41.999 7.297 1 8.401 1H12zM8.4 3c-1.136 0-1.929 0-2.546.05-.529.044-.862.12-1.113.228l-.103.05a3 3 0 0 0-1.196 1.104l-.115.206c-.134.263-.227.611-.276 1.216C3 6.471 3 7.264 3 8.4v7.2c0 1.136 0 1.929.05 2.545.05.606.143.954.277 1.217l.115.206a3 3 0 0 0 .99.99l.206.115.103.049c.251.108.584.184 1.113.227C6.471 21 7.264 21 8.4 21h7.2c1.136 0 1.929 0 2.545-.05.606-.05.954-.143 1.217-.277l.206-.115a3 3 0 0 0 1.105-1.196l.049-.103c.108-.251.184-.584.227-1.114.025-.308.038-.66.044-1.078L21 15.6V13h-2.6c-.456 0-.875-.002-1.261-.006a.998.998 0 0 1-.145.012h-10a1 1 0 0 1 0-2h5.012a4.975 4.975 0 0 1-.368-.562l-.093-.175c-.274-.538-.403-1.115-.469-1.763H6.994a1 1 0 0 1 0-2h4.01C11.003 6.22 11 5.919 11 5.6V3H8.4zM13 5.6c0 1.136 0 1.929.05 2.546.05.605.143.953.277 1.216l.115.206a3 3 0 0 0 .99.99l.206.115.103.049c.251.108.584.184 1.114.227.616.05 1.409.051 2.545.051h1.186L13 4.414V5.6z"/>',
  more: '<path d="M7 10.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 10.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM17 10.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 1c6.075 0 11 4.925 11 11s-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1zm0 2a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"/>',
  chev: '<path d="M3.293 9.707a1 1 0 1 1 1.414-1.414L12 15.586l7.293-7.293.076-.068a1 1 0 0 1 1.406 1.406l-.068.076-8 8a1 1 0 0 1-1.414 0l-8-8z"/>',
  media: '<path d="M7 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M15.588 1c1.103 0 1.992-.001 2.709.058.729.06 1.369.185 1.96.487a5.003 5.003 0 0 1 2.186 2.185c.302.593.428 1.233.488 1.961.058.718.057 1.606.057 2.71V15.6c0 1.103.001 1.991-.057 2.709-.06.728-.186 1.368-.488 1.96a5.003 5.003 0 0 1-2.185 2.186c-.592.302-1.232.428-1.961.487-.717.059-1.606.058-2.71.058H8.39c-1.104 0-1.992.001-2.71-.058-.728-.06-1.368-.185-1.96-.487a5.003 5.003 0 0 1-2.186-2.185c-.301-.593-.428-1.233-.487-1.961-.059-.718-.058-1.606-.058-2.71V8.4c0-1.103 0-1.991.058-2.709.06-.728.186-1.368.487-1.96A5.003 5.003 0 0 1 3.72 1.544c.592-.302 1.232-.428 1.96-.487C6.398.999 7.286 1 8.39 1h7.199zm2.766 10a6.997 6.997 0 0 0-6.508 4.435 1.001 1.001 0 0 1-1.49.461l-.096-.073-.175-.145a5.17 5.17 0 0 0-3.233-1.132 5.183 5.183 0 0 0-3.86 1.718c.001.793.007 1.393.047 1.881.05.606.142.954.276 1.217a3 3 0 0 0 1.311 1.31c.263.135.612.228 1.217.277.617.05 1.41.051 2.546.051h7.199c1.136 0 1.929 0 2.546-.05.605-.05.953-.143 1.217-.277a3 3 0 0 0 1.31-1.31c.134-.264.227-.612.276-1.218.05-.616.051-1.409.051-2.545v-4.084A6.969 6.969 0 0 0 18.354 11zM8.389 3c-1.137 0-1.93 0-2.546.05-.605.05-.954.143-1.217.277a3 3 0 0 0-1.31 1.31c-.135.264-.228.612-.277 1.217-.05.617-.05 1.41-.05 2.546v5.269a7.168 7.168 0 0 1 3.863-1.123c1.346 0 2.604.372 3.68 1.014A8.986 8.986 0 0 1 18.353 9c.916 0 1.8.137 2.634.392V8.4c0-1.136 0-1.929-.05-2.546-.05-.605-.143-.953-.277-1.216a3 3 0 0 0-1.31-1.31c-.264-.135-.612-.228-1.217-.277C17.517 3 16.724 3 15.588 3h-7.2z"/>',
  gif: '<path d="M21 8.4c0-1.136 0-1.929-.05-2.546-.05-.604-.143-.952-.277-1.215a3.004 3.004 0 0 0-1.105-1.197l-.206-.115c-.263-.134-.611-.227-1.216-.276-.309-.025-.661-.038-1.079-.044L15.6 3H8.4c-1.136 0-1.929 0-2.546.05-.529.044-.862.12-1.113.228l-.103.05a3 3 0 0 0-1.31 1.31c-.135.263-.228.612-.277 1.216C3 6.471 3 7.264 3 8.4v7.2c0 1.136 0 1.929.05 2.545.05.605.143.953.277 1.216l.115.207a3 3 0 0 0 1.196 1.105l.103.049c.251.108.584.184 1.113.227C6.471 21 7.264 21 8.4 21h7.2c1.136 0 1.929 0 2.545-.05.606-.05.954-.143 1.217-.277l.206-.115a3 3 0 0 0 1.105-1.196l.049-.103c.108-.251.184-.584.227-1.114C21 17.53 21 16.736 21 15.6V8.4zm2 7.2c0 1.103.001 1.991-.058 2.709-.052.637-.154 1.208-.381 1.737l-.106.224a4.998 4.998 0 0 1-2.01 2.091l-.175.094c-.593.302-1.233.428-1.961.487-.718.059-1.606.058-2.71.058H8.4c-1.103 0-1.991.001-2.709-.058-.637-.052-1.208-.154-1.737-.381l-.224-.106a5.001 5.001 0 0 1-2.092-2.01l-.093-.175c-.302-.593-.428-1.233-.487-1.961C.999 17.59 1 16.703 1 15.599V8.4c0-1.103-.001-1.991.058-2.709.06-.728.185-1.368.487-1.96l.093-.175a5 5 0 0 1 2.091-2.011l.225-.106c.53-.227 1.1-.33 1.737-.381C6.41.999 7.297 1 8.401 1H15.6l1.5.007c.449.007.85.021 1.209.05.728.06 1.368.186 1.96.488l.175.094a5 5 0 0 1 2.011 2.091l.106.224c.227.53.33 1.1.381 1.737.059.718.058 1.606.058 2.71V15.6z"/><path d="M7.614 17.132c-.42.004-.804-.06-1.15-.19a2.357 2.357 0 0 1-.888-.586 2.676 2.676 0 0 1-.565-.926 3.448 3.448 0 0 1-.197-1.195v-4.47c0-.582.116-1.09.346-1.525.231-.434.556-.771.974-1.012.418-.24.909-.36 1.473-.36.536 0 1.008.113 1.417.34.409.226.728.552.956.977.194.36.311.786.35 1.277l.003.078a.96.96 0 1 1-1.918.02l-.001-.09c-.018-.28-.088-.493-.211-.641-.14-.166-.33-.25-.575-.25a.79.79 0 0 0-.454.126.806.806 0 0 0-.284.353 1.28 1.28 0 0 0-.101.52v4.837c0 .152.02.29.059.416.04.124.095.23.166.318.072.088.16.155.264.202.103.046.222.069.357.069a.8.8 0 0 0 .436-.114.716.716 0 0 0 .274-.336c.062-.149.094-.331.094-.548v-1.254h-.067a.835.835 0 0 1 0-1.67H9.51c.46 0 .834.373.834.833v1.91c0 .444-.066.845-.197 1.203a2.615 2.615 0 0 1-.558.915 2.39 2.39 0 0 1-.853.575 2.989 2.989 0 0 1-1.122.198zM11.57 16.026V7.973a.974.974 0 0 1 1.948 0v8.053a.974.974 0 0 1-1.948 0zM14.778 16.026V7.79c0-.436.355-.79.791-.79h2.782a.835.835 0 1 1 0 1.67h-1.625v2.674h1.41a.835.835 0 1 1 0 1.67h-1.41v3.012a.974.974 0 0 1-1.947 0z"/>',
  emoji: '<path d="M15.188 14.416a1 1 0 1 1 1.623 1.168c-1.165 1.62-2.98 2.426-4.803 2.415H12l-.009.001c-1.822.01-3.637-.796-4.803-2.416a1 1 0 1 1 1.624-1.168c.76 1.056 1.947 1.594 3.18 1.584h.017c1.232.01 2.42-.528 3.18-1.584zM8.25 9.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM15.75 9.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 1c6.075 0 11 4.925 11 11s-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1zm0 2a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"/>',
  sticker: '<path d="M15.188 14.416a1 1 0 1 1 1.623 1.168c-1.165 1.62-2.98 2.426-4.803 2.415H12l-.009.001c-1.822.01-3.637-.796-4.803-2.416a1 1 0 1 1 1.624-1.168c.76 1.056 1.947 1.594 3.18 1.584h.017c1.232.01 2.42-.528 3.18-1.584zM8.25 9.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12.172 1a3 3 0 0 1 2.121.879l7.828 7.828A3 3 0 0 1 23 11.828V15.6c0 1.103.001 1.991-.058 2.709-.06.728-.185 1.368-.487 1.96a5 5 0 0 1-2.185 2.186c-.593.302-1.233.428-1.961.487-.718.059-1.606.058-2.71.058H8.4c-1.103 0-1.991.001-2.709-.058-.728-.06-1.368-.185-1.96-.487a5.001 5.001 0 0 1-2.186-2.185c-.302-.593-.428-1.233-.487-1.961C.999 17.59 1 16.703 1 15.599V8.4c0-1.103-.001-1.991.058-2.709.06-.728.185-1.368.487-1.96l.093-.175a5 5 0 0 1 2.091-2.011c.593-.302 1.234-.428 1.962-.487C6.41.999 7.297 1 8.401 1h3.77zM8.4 3c-1.136 0-1.929 0-2.546.05-.605.05-.953.143-1.216.277a3 3 0 0 0-1.31 1.31c-.135.264-.228.613-.277 1.217C3 6.471 3 7.264 3 8.4v7.2c0 1.136 0 1.929.05 2.545.05.605.143.953.277 1.216a3.002 3.002 0 0 0 1.31 1.312c.264.134.612.227 1.217.276C6.471 21 7.264 21 8.4 21h7.2c1.136 0 1.929 0 2.545-.05.606-.05.954-.143 1.217-.277a3 3 0 0 0 1.31-1.31c.135-.264.228-.613.277-1.218C21 17.53 21 16.736 21 15.6V12h-1.621c-1.104 0-1.992.001-2.71-.058-.728-.06-1.368-.185-1.96-.487a5 5 0 0 1-2.186-2.185c-.301-.593-.427-1.233-.487-1.961-.059-.718-.057-1.606-.057-2.71V3H8.4zm5.579 1.6c0 1.136 0 1.929.05 2.546.05.604.143.952.277 1.215a3.002 3.002 0 0 0 1.31 1.312c.264.134.612.227 1.217.276.617.05 1.41.051 2.546.051h.207l-5.607-5.607V4.6z"/>',
  poll: '<path fill-rule="evenodd" clip-rule="evenodd" d="M15 17a3 3 0 1 1 0 6H4a3 3 0 1 1 0-6h11zM4 19a1 1 0 1 0 0 2h11a1 1 0 1 0 0-2H4zM20 9a3 3 0 1 1 0 6H4a3 3 0 1 1 0-6h16zM4 11a1 1 0 1 0 0 2h16a1 1 0 1 0 0-2H4zM10 1a3 3 0 1 1 0 6H4a3 3 0 0 1 0-6h6zM4 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H4z"/>',
  quote: '<path d="M8.548 7.974c.948 0 1.785.504 2.287 1.307.434.696.94 2.125.445 3.827-.367 1.263-1.177 2.262-2.287 2.814a1 1 0 0 1-.89-1.791c.401-.2.731-.516.97-.916a2.65 2.65 0 0 1-3.17-2.595 2.65 2.65 0 0 1 2.645-2.646zM15.165 7.974c.948 0 1.784.504 2.286 1.307.434.696.941 2.125.447 3.827-.367 1.263-1.178 2.262-2.288 2.814a1 1 0 0 1-.89-1.791c.401-.2.731-.516.97-.916a2.65 2.65 0 0 1-3.17-2.595 2.65 2.65 0 0 1 2.645-2.646z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 1c6.075 0 11 4.925 11 11 0 1.62-.352 3.16-.982 4.548l.965 5.271a1.002 1.002 0 0 1-1.159 1.165l-5.312-.95c-1.378.62-2.906.966-4.512.966-6.075 0-11-4.925-11-11S5.925 1 12 1zm0 2a9 9 0 1 0 0 18 8.96 8.96 0 0 0 3.938-.904l.146-.058c.15-.046.311-.056.468-.028l4.204.752-.764-4.17a1 1 0 0 1 .087-.621l.21-.456A8.968 8.968 0 0 0 21 12a9 9 0 0 0-9-9z"/>',
  text: '<path d="M13.097 15.51a1 1 0 0 1 0 1.991l-.103.005h-5a1 1 0 0 1 0-2h5l.103.005zM16.097 11.01a1 1 0 0 1 0 1.991l-.103.005h-8a1 1 0 0 1 0-2h8l.103.005zM16.097 6.51a1 1 0 0 1 0 1.991l-.103.005h-8a1 1 0 0 1 0-2h8l.103.005z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M13.6 1c1.103 0 1.991-.001 2.709.058.728.06 1.368.185 1.96.487l.175.093a5 5 0 0 1 2.011 2.091c.302.593.428 1.234.487 1.962.059.718.058 1.606.058 2.71V15.6c0 1.103.001 1.991-.058 2.709-.06.728-.185 1.368-.487 1.96a5.001 5.001 0 0 1-2.01 2.093l-.175.093c-.593.302-1.233.428-1.961.487-.718.059-1.606.058-2.71.058H10.4c-1.103 0-1.991.001-2.709-.058-.637-.052-1.208-.154-1.737-.381l-.224-.106a4.998 4.998 0 0 1-2.091-2.01l-.094-.175c-.302-.593-.428-1.233-.487-1.961C2.999 17.59 3 16.703 3 15.599V8.4c0-1.103-.001-1.991.058-2.709.06-.728.185-1.368.487-1.96l.094-.175A5 5 0 0 1 5.73 1.545l.224-.106c.53-.227 1.1-.33 1.737-.381C8.41.999 9.297 1 10.401 1H13.6zm-3.2 2c-1.136 0-1.929 0-2.546.05-.604.05-.952.143-1.215.277a3.003 3.003 0 0 0-1.197 1.105l-.115.206c-.134.263-.227.611-.276 1.216C5 6.471 5 7.264 5 8.4v7.2c0 1.136 0 1.929.05 2.545.05.606.143.954.277 1.217l.115.206a3 3 0 0 0 1.196 1.105c.263.134.612.227 1.216.276.617.05 1.41.051 2.546.051h3.2c1.136 0 1.929 0 2.545-.05.605-.05.953-.143 1.216-.277a3.002 3.002 0 0 0 1.312-1.31l.049-.104c.108-.251.184-.584.227-1.114C19 17.53 19 16.736 19 15.6V8.4c0-1.136 0-1.929-.05-2.546-.044-.529-.12-.862-.228-1.113l-.05-.103a3 3 0 0 0-1.31-1.31c-.263-.135-.611-.228-1.216-.277C15.528 3 14.735 3 13.6 3h-3.2z"/>',
  loc: '<path d="M12 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 1c4.994 0 9 4.16 9 9.182 0 3.786-2.157 6.977-4.198 9.15a23.366 23.366 0 0 1-2.865 2.577c-.398.301-.74.538-.995.702-.126.082-.238.151-.329.203a2.328 2.328 0 0 1-.258.122c-.006.003-.093.037-.218.054L12 23c-.195 0-.347-.06-.355-.064a2.328 2.328 0 0 1-.258-.123 6.678 6.678 0 0 1-.33-.202c-.254-.165-.596-.4-.994-.702a23.36 23.36 0 0 1-2.865-2.577C5.157 17.159 3 13.968 3 10.182 3 5.159 7.006 1 12 1zm0 2c-3.843 0-7 3.217-7 7.182 0 3.031 1.746 5.749 3.655 7.78a21.35 21.35 0 0 0 2.617 2.353c.285.217.534.39.728.52.194-.13.443-.303.729-.52a21.35 21.35 0 0 0 2.616-2.352C17.255 15.93 19 13.213 19 10.182 19 6.217 15.843 3 12 3z"/>',
  music: '<path fill-rule="evenodd" clip-rule="evenodd" d="M21.783 1.023A1.001 1.001 0 0 1 23 2v13.75a4.25 4.25 0 1 1-2-3.606V8.246L9.5 10.8v7.949a4.25 4.25 0 1 1-2-3.606V5a1 1 0 0 1 .783-.977l13.5-3zM5.25 16.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5zm13.5-3a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5zM9.5 5.8v2.952L21 6.197V3.246L9.5 5.8z"/>',
  opt: '<path d="M22.455 20.27a4.998 4.998 0 0 1-2.01 2.091l-.175.094c-.593.302-1.233.428-1.961.487-.718.059-1.606.058-2.71.058H8.4c-1.103 0-1.991.001-2.709-.058-.637-.052-1.208-.154-1.737-.381l-.224-.106a5.001 5.001 0 0 1-2.185-2.185l1.782-.908a3 3 0 0 0 1.31 1.31l.104.05c.251.108.584.184 1.113.227C6.471 21 7.264 21 8.4 21h7.2c1.136 0 1.929 0 2.545-.05.606-.05.954-.143 1.217-.277l.206-.115a3 3 0 0 0 1.105-1.196l1.782.908z"/><path d="M15.6 1c1.103 0 1.991-.001 2.709.058.728.06 1.368.185 1.96.487l.175.094a5 5 0 0 1 2.011 2.091l.106.224c.227.53.33 1.1.381 1.737.059.718.058 1.606.058 2.71V15.6c0 1.103.001 1.991-.058 2.709-.06.728-.185 1.368-.487 1.96l-.89-.454-.892-.453c.134-.263.227-.611.276-1.216.05-.617.051-1.41.051-2.546V8.4c0-1.136 0-1.929-.05-2.546-.044-.529-.12-.862-.228-1.113l-.05-.102a3.004 3.004 0 0 0-1.104-1.197l-.206-.115c-.263-.134-.611-.227-1.216-.276C17.528 3 16.735 3 15.6 3H8.4c-1.136 0-1.929 0-2.546.05-.605.05-.953.143-1.216.277l-.206.115a3 3 0 0 0-1.105 1.196l-.049.103c-.108.251-.184.584-.227 1.113C3 6.471 3 7.264 3 8.4v7.2c0 1.136 0 1.929.05 2.545.05.605.143.954.277 1.217l-.891.453-.891.454c-.302-.592-.428-1.232-.487-1.96C.999 17.59 1 16.703 1 15.599V8.4c0-1.103-.001-1.991.058-2.709.06-.728.185-1.368.487-1.96l.093-.175a5 5 0 0 1 2.091-2.011c.593-.302 1.234-.428 1.962-.487C6.41.999 7.297 1 8.401 1H15.6z"/><path d="M8.006 6.006a1 1 0 0 1 1 1V13H10a1 1 0 1 1 0 2h-.994v2.006a1 1 0 0 1-2 0V15H6a1 1 0 0 1 0-2h1.006V7.006a1 1 0 0 1 1-1zM16.006 6.006a1 1 0 0 1 1 1V9H18a1 1 0 1 1 0 2h-.994v6.006a1 1 0 0 1-2 0V11H14a1 1 0 0 1 0-2h1.006V7.006a1 1 0 0 1 1-1z"/>',
  check: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7.5"/>',
  back: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M15 4l-8 8 8 8"/>',
  right: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>',
  clock: '<circle fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" cx="12" cy="12" r="10"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 6.5V12l3.5 2"/>',
  x: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18"/>',
  eyeoff: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.6 5.1A10.5 10.5 0 0 1 12 5c5 0 9 4.5 10 7-.4 1-1.3 2.4-2.6 3.7M6.6 6.6C4.4 8 2.8 10.2 2 12c1 2.5 5 7 10 7 1.9 0 3.6-.6 5.1-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  person: '<circle fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" cx="12" cy="8" r="4"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 21c1.2-4 4.4-6 8-6s6.8 2 8 6"/>',
  alt: '<rect fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" x="3" y="3" width="18" height="18" rx="3"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M8.5 16.5L12 7.5l3.5 9M9.8 13.3h4.4"/>',
  hl: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 20h7M14.5 4.5l5 5-8 8H6.5v-5z"/>'
};
function thIco_(k, sz) { return '<svg viewBox="0 0 24 24" fill="currentColor" width="' + (sz || 20) + '" height="' + (sz || 20) + '" aria-hidden="true">' + THICO_[k] + '</svg>'; }
var THREADS_TEASER_WHO_ = [];
function threadsTeaser_(staff, dev) {
  try {
    if (typeof window === 'undefined') return false;
    if (staff && THREADS_TEASER_WHO_.indexOf(String(window.__SZ_WHO_ || '')) >= 0) return true;
    if (dev && /[?&]teaser=1(&|$)/.test(location.search)) return true;
  } catch (e) {}
  return false;
}
function renderThreadsPage_(base, staff, dev) {
  var head = '<div class="hhead"><span class="bmark">' + THREADS_LOGO_ + '</span><span class="bname">スレッズコ</span></div>';
  if (threadsTeaser_(staff, dev)) {
    return '<style>' + HOMECSS_ + EXPADCSS_ + HANBAICSS_ + THREADSCSS_ + '</style>' +
      '<div class="home">' + backBarUnlessSolo_(base, staff, dev) +
      '<div class="thw">' + head +
        '<div class="thteaser"><span>本体は、</span><span>11月11日</span><span>リーダーズ会議にて</span><span>公開</span><span class="s">（を目指して頑張ってます）！</span></div>' +
      '</div></div>';
  }
  var C = {
    exec: 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec',
    key: 'kx7Q2p9mVt4Zr8',
    ico: THICO_
  };
  return '<style>' + HOMECSS_ + EXPADCSS_ + HANBAICSS_ + THREADSCSS_ + '</style>' +
    '<div class="home">' + backBarUnlessSolo_(base, staff, dev) +
    '<div class="thw">' + head +
      '<div class="hbhint" id="thLoad">読み込み中です…</div>' +
      '<div id="thMain" style="display:none">' +
        '<div class="thacct" id="thAcct"></div>' +
        '<div class="thname" id="thUser" style="display:none"></div>' +
        '<div class="thf" id="thFeed"></div>' +
      '</div>' +
      '<button type="button" id="thShow" style="display:none"></button><div id="thFeedWrap" style="display:none"><a id="thFeedBack"></a></div><div id="thList" style="display:none"></div>' +
    '</div></div>' +
    '<div class="thcomp" id="thCompose" style="display:none"><div class="thsheet" id="thSheet">' +
      '<div id="thWrite">' +
        '<div class="tsh"><div class="tl"><button type="button" class="tcx" id="thCancel">キャンセル</button></div><b>新しいスレッド</b>' +
          '<div class="tshr"><button type="button" class="tib" id="thDraftBtn" title="下書き">' + thIco_('draft', 24) + '</button>' +
          '<button type="button" class="tib" id="thMoreBtn" title="もっと見る">' + thIco_('more', 24) + '</button></div></div>' +
        '<div class="tmenu" id="thMoreMenu" style="display:none"><div class="s">' +
          '<button type="button" data-off="日時の指定">日時を指定...<span class="r">' + thIco_('clock', 20) + '</span></button></div></div>' +
        '<div class="tsb">' +
          '<div class="tblk" id="thBlk0">' +
            '<div class="tleft"><img class="tav thAvI" referrerpolicy="no-referrer"><div class="tline"></div></div>' +
            '<div class="tmain">' +
              '<div class="tun"><b class="thUN"></b><span class="tchev">' + thIco_('chev', 12) + '</span>' +
                '<input class="ttopic" id="thTopicText" maxlength="50" placeholder="コミュニティまたはトピック"><span class="tpg" style="display:none"></span></div>' +
              '<textarea class="tta" id="thText" rows="1" placeholder="最近どう？"></textarea>' +
              '<div class="tmed" id="thThumbs"></div>' +
              '<div class="tmed" id="thGifBox" style="display:none"></div>' +
              '<div class="tpoll" id="thPoll" style="display:none">' +
                '<input id="thP1" maxlength="25" placeholder="はい">' +
                '<input id="thP2" maxlength="25" placeholder="いいえ">' +
                '<input id="thP3" maxlength="25" class="add" placeholder="別の選択肢を追加">' +
                '<input id="thP4" maxlength="25" class="add" placeholder="別の選択肢を追加" style="display:none">' +
                '<div class="tpf"><span>24時間後に終了します</span><button type="button" id="thPollDel">アンケートを削除</button></div>' +
              '</div>' +
              '<div class="tlongc" id="thLongCard" style="display:none"><span id="thLongPrev"></span><button type="button" class="rm" id="thLongDel" title="削除">' + thIco_('x', 16) + '</button></div>' +
              '<div class="themos" id="thEmos" style="display:none"></div>' +
              '<div class="ticons" id="thIcons"></div>' +
            '</div></div>' +
          '<div id="thChain"></div>' +
          '<div class="tadd" id="thAddChain"><div class="tleft"><img class="tav sm thAvI" referrerpolicy="no-referrer"></div><span>スレッドに追加</span></div>' +
        '</div>' +
        '<div class="tsf"><button type="button" id="thOptBtn">' + thIco_('opt', 20) + '<span>投稿オプション</span></button>' +
          '<div class="tsfr"><span class="tcnt" id="thCnt"></span><button type="button" id="thGo" disabled>投稿</button></div></div>' +
        '<div class="tmenu" id="thOpt" style="display:none">' +
          '<div class="s"><div class="h">返信と引用ができる人</div><div id="thRc">' +
            '<button type="button" data-v="everyone">すべての人<span class="r"></span></button>' +
            '<button type="button" data-v="followers_only">フォロワー<span class="r"></span></button>' +
            '<button type="button" data-v="accounts_you_follow">フォロー中の人のプロフィール<span class="r"></span></button>' +
            '<button type="button" data-v="mentioned_only">あなたがメンションした人のプロフィール<span class="r"></span></button>' +
          '</div></div>' +
          '<div class="s"><button type="button" id="thApprove">返信を確認して承認<span class="sw"><i></i></span></button></div>' +
          '<div class="s"><div class="h">オーディエンス</div><button type="button" data-off="他のシェア先">他のシェア先...<span class="r">オフ ' + thIco_('right', 14) + '</span></button></div>' +
        '</div>' +
      '</div>' +
      '<div id="thDrafts" style="display:none">' +
        '<div class="tsh"><div class="tl"><button type="button" class="tib" id="thDraftBack" title="戻る">' + thIco_('back', 24) + '</button></div><b>下書き</b><div class="tshr"></div></div>' +
        '<div id="thDraftList"></div>' +
      '</div>' +
      '<div id="thLongView" style="display:none">' +
        '<div class="tsh"><div class="tl"><button type="button" class="tcx" id="thLongCancel">キャンセル</button></div><b>添付テキスト</b>' +
          '<div class="tshr"><button type="button" class="tdone" id="thLongDone">完了</button></div></div>' +
        '<textarea class="tlta" id="thLongText" maxlength="10000" placeholder="さらに書く..."></textarea>' +
        '<div class="tfmt"><button type="button" data-off="文字の飾り">B</button><button type="button" data-off="文字の飾り"><i>I</i></button>' +
          '<button type="button" data-off="文字の飾り"><u>U</u></button><button type="button" data-off="文字の飾り"><s>S</s></button>' +
          '<button type="button" data-off="文字の飾り">' + thIco_('hl', 18) + '</button></div>' +
      '</div>' +
      '<div id="thGifView" style="display:none">' +
        '<div class="tsh"><div class="tl"><button type="button" class="tcx" id="thGifCancel">キャンセル</button></div><b>GIF</b><div class="tshr"></div></div>' +
        '<div class="tgs"><input id="thGifQ" type="search" placeholder="GIPHYを検索" autocomplete="off"></div>' +
        '<div class="tgg" id="thGifGrid"></div>' +
        '<div class="tgp">Powered by GIPHY</div>' +
      '</div>' +
    '</div>' +
    '<div class="task" id="thAsk" style="display:none"><div class="taskb"><b>下書きに保存しますか？</b><p>後で編集・投稿できるように下書きに保存します。</p>' +
      '<button type="button" id="thAskSave">保存</button><button type="button" class="red" id="thAskNo">保存しない</button><button type="button" id="thAskCancel">キャンセル</button></div></div>' +
    '</div>' +
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
    s.onerror = function () { cb({ ok: false, error: '通信エラーです。もう一度試してもらえると嬉しいです🙇' }); }; document.body.appendChild(s);
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
        n++; if (n > max) { end('時間切れです。もう一度試してもらえると嬉しいです🙇'); return; }
        jsonp({ action: 'status', key: C.key, id: id }, function (x) {
          if (!x || !x.ok) { end((x && x.error) || '通信に失敗しました。もう一度試してもらえると嬉しいです🙇'); return; }
          if (x.status === 'pending' || x.status === 'running' || x.status === 'queued' || x.status === '') { setTimeout(tick, 1000); return; }
          if (x.status !== 'done') { end(x.result || 'エラーが発生しました。りゅうさんに連絡しました。'); return; }
          var d = null; try { d = JSON.parse(x.result || '{}'); } catch (e) {}
          if (d && d.__bigres) {
            jsonp({ action: 'data', key: C.key, name: d.__bigres }, function (y) {
              var v = null; try { v = JSON.parse(y && y.result); } catch (e) {}
              if (!v) { end('答えを読み込めませんでした。もう一度試してもらえると嬉しいです🙇'); return; }
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
          if (!r || !r.ok || !r.id) { end((r && r.error) || '通信に失敗しました。もう一度試してもらえると嬉しいです🙇'); return; }
          poll(r.id);
        });
    };
    if (typeof BIG === 'undefined') { send(JSON.stringify(fields)); return; }
    BIG.prepare({ exec: C.exec, key: C.key, slot: me.device || 'x', tag: 'threads', op: 'threads',
                  who: me.who, role: me.role, device: me.device, fields: fields },
      send, function () { end('写真・動画を送れませんでした。数を減らして、もう一度試してもらえると嬉しいです🙇'); });
  }

  function drawAcct() {
    var h = '';
    for (var i = 0; i < ACCTS.length; i++) {
      h += '<button type="button" data-a="' + esc(ACCTS[i].acct) + '"' + (ACCTS[i].acct === CUR ? ' class="on"' : '') + '>' + esc(ACCTS[i].label) + (ACCTS[i].ro ? '<small>閲覧のみ</small>' : '') + '</button>';
    }
    $('thAcct').innerHTML = h;
    $('thAcct').className = 'thacct' + (ACCTS.length === 1 ? ' one' : '');
    $('thAcct').style.gridTemplateColumns = 'repeat(' + Math.max(1, ACCTS.length) + ',1fr)';   
    var a = ACCTS.filter(function (x) { return x.acct === CUR; })[0];
    $('thUser').textContent = a && a.username ? '@' + a.username : '';
  }
  function curRo() { var a = ACCTS.filter(function (x) { return x.acct === CUR; })[0]; return !!(a && a.ro); }
  $('thAcct').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    CUR = b.getAttribute('data-a'); drawAcct();
    VIEW = 'feed'; TAB = 'th'; FEED = null;
    if (!showFeedFromData()) $('thFeed').innerHTML = '<div class="fl">読み込み中です…</div>';
    loadWeb(CUR, 30, false);
    if (DATA) { DATA.cur = CUR; cacheSet(DATA); }
  });

  var IC = function (k, sz) { return '<svg viewBox="0 0 24 24" fill="currentColor" width="' + (sz || 20) + '" height="' + (sz || 20) + '" aria-hidden="true">' + ((C.ico && C.ico[k]) || '') + '</svg>'; };
  var OFFMSG = 'は、Threadsの公式の仕組みでは使えません。Threadsのアプリから行ってください🙇';
  var CHMSG = '続きの投稿には文だけ付けられます。写真・GIF・アンケート・添付テキストは最初の投稿に付けてください😊';
  var LONG = '', APPR = false, SPOIL = false, OPEN_DRAFT = 0;
  var GIF = null;   
  function each(sel, root, fn) { Array.prototype.forEach.call((root || document).querySelectorAll(sel), fn); }
  function vals(ids) { return ids.map(function (i) { return $(i).value.trim(); }); }
  function chainBoxes() { return Array.prototype.slice.call(document.querySelectorAll('#thChain textarea')); }
  function blocks() { return [$('thText')].concat(chainBoxes()); }
  function autoH(t) { t.style.height = '21px'; t.style.height = t.scrollHeight + 'px'; }
  function showView(v) { ['thWrite', 'thDrafts', 'thLongView', 'thGifView'].forEach(function (i) { $(i).style.display = i === v ? '' : 'none'; }); closeMenus(); }
  function closeMenus() {
    $('thMoreMenu').style.display = 'none'; $('thOpt').style.display = 'none';
    each('#thThumbs .tmenu', null, function (m) { m.parentNode.removeChild(m); });
  }
  function fillWho(root) {
    var pf = (FEED && FEED.profile) || {}, a = ACCTS.filter(function (x) { return x.acct === CUR; })[0];
    var un = pf.username || (a && a.username) || '';
    each('.thUN', root, function (b) { b.textContent = un; });
    each('.thAvI', root, function (im) { if (pf.pic) im.src = pf.pic; else im.removeAttribute('src'); });
  }

  function icBtn(act, k, title, sz) { return '<button type="button" class="tic" data-act="' + act + '" title="' + title + '">' + IC(k, sz) + '</button>'; }
  function icOff(k, name, sz) { return '<button type="button" class="tic" data-off="' + name + '" title="' + name + '">' + IC(k, sz) + '</button>'; }
  function chOff(k, sz) { return '<button type="button" class="tic" data-msg="' + CHMSG + '">' + IC(k, sz) + '</button>'; }
  function mediaBtn(label) {
    return '<label class="tic" title="メディアを添付">' + IC('media') + (label ? '<span>' + label + '</span>' : '') +
      '<input type="file" class="thFile" accept="image/*,video/mp4,video/quicktime" multiple></label>';
  }
  function drawIcons() {
    var h, pollOn = $('thPoll').style.display !== 'none';
    if (MEDIA.length) h = mediaBtn('追加') + icBtn('emo', 'emoji', '絵文字を追加') + icOff('loc', '位置情報', 18);
    else if (pollOn || LONG || GIF) h = icBtn('emo', 'emoji', '絵文字を追加') + icOff('loc', '位置情報', 18);
    else h = mediaBtn('') + (gifKey() ? icBtn('gif', 'gif', 'GIFを追加') : '') + icBtn('emo', 'emoji', '絵文字を追加') + icBtn('poll', 'poll', 'アンケートを追加') +
      icOff('quote', '引用投稿') + icBtn('long', 'text', 'テキストを添付') + icOff('loc', '位置情報', 18);
    var em = $('thEmos'), tm = $('thBlk0').querySelector('.tmain');
    $('thIcons').innerHTML = h;
    if (em.parentNode === tm) tm.insertBefore(em, $('thIcons'));
  }
  function chainIcons() {
    return chOff('media') + (gifKey() ? chOff('gif') : '') + icBtn('emo', 'emoji', '絵文字を追加') + chOff('poll') +
      icOff('quote', '引用投稿') + chOff('text') + icOff('loc', '位置情報', 18);
  }

  function canPost() {
    var bs = blocks();
    if (!$('thText').value.trim() && !MEDIA.length && !GIF) return false;
    for (var i = 0; i < bs.length; i++) {
      if (tlen(bs[i].value) > MAXT) return false;
      if (i > 0 && !bs[i].value.trim()) return false;
    }
    return true;
  }
  function drawCnt() {
    var bs = blocks(), rest = MAXT;
    bs.forEach(function (t) { rest = Math.min(rest, MAXT - tlen(t.value)); });
    var c = $('thCnt');
    c.textContent = rest <= 50 ? String(rest) : '';
    c.className = 'tcnt' + (rest < 0 ? ' neg' : '');
    $('thGo').disabled = !canPost();
    var last = bs[bs.length - 1];
    var filled = !!last.value.trim() || (bs.length === 1 && (MEDIA.length > 0 || !!GIF));
    $('thAddChain').classList.toggle('on', filled && tlen(last.value) <= MAXT && bs.length - 1 < MAXCHAIN);
    var n = bs.length, p0 = $('thBlk0').querySelector('.tpg');
    p0.style.display = n > 1 ? '' : 'none'; p0.textContent = '1/' + n;
    each('#thChain .tpg', null, function (p, i) { p.textContent = (i + 2) + '/' + n; });
  }

  var EMOS = ['😊','😍','🥰','😆','🤗','🥹','😂','🙏','✨','💖','💕','❤️','🩷','🌸','🌷','💐',
              '🌿','🍀','🍅','🎉','🎁','🎀','🔥','👍','💯','✅','🆕','⚠️','📅','⏰','📍','📞',
              '💬','👉','➡️','⭐','☀️','🌙','🌈','💆‍♀️','💅','🧖‍♀️','💄','👀','😳','🤩','😎','🫶'];
  $('thEmos').innerHTML = EMOS.map(function (e) { return '<button type="button" data-e="' + e + '">' + e + '</button>'; }).join('');
  $('thEmos').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var t = (LAST && document.body.contains(LAST)) ? LAST : $('thText');
    var v = t.value, a = (t.selectionStart == null) ? v.length : t.selectionStart, z = (t.selectionEnd == null) ? a : t.selectionEnd;
    var em = b.getAttribute('data-e');
    t.value = v.slice(0, a) + em + v.slice(z);
    var p = a + em.length; try { t.setSelectionRange(p, p); } catch (x) {}
    t.dispatchEvent(new Event('input', { bubbles: true }));
  });

  function totalMB() { return MEDIA.reduce(function (s, o) { return s + o.b64.length * 3 / 4; }, 0) / 1048576; }
  function drawThumbs() {
    if (!MEDIA.length) SPOIL = false;
    var box = $('thThumbs');
    box.className = 'tmed' + (MEDIA.length > 1 ? ' many' : '') + (SPOIL ? ' sp' : '');
    box.innerHTML = MEDIA.map(function (o, i) {
      var face = o.video ? '<video class="v" src="data:' + (o.type || 'video/mp4') + ';base64,' + o.b64 + '" muted playsinline preload="metadata"></video>'
                         : '<img src="data:image/jpeg;base64,' + o.b64 + '">';
      return '<div class="tmi">' + face + '<button type="button" class="rm" data-act="rmm" data-i="' + i + '" title="削除">' + IC('x', 14) + '</button>' +
        '<button type="button" class="mo" data-act="mmo" data-i="' + i + '" title="添付ファイルに対するアクション">···</button></div>';
    }).join('');
    drawIcons(); drawCnt();
  }
  function addFiles(inp) {
    var files = Array.prototype.slice.call(inp.files || []);
    inp.value = '';
    files.forEach(function (f) {
      if (MEDIA.length >= MAXI) { warn('写真・動画は合わせて' + MAXI + '個までです。'); return; }
      if (/^video\//.test(f.type)) {
        if (f.size > VIDEO_MB * 1048576) { warn('動画は1つ' + VIDEO_MB + 'MBまでです。短い動画にしてください🙇'); return; }
        var vr = new FileReader();
        vr.onload = function () {
          var b64 = String(vr.result).split(',')[1] || '';
          if (totalMB() + b64.length * 3 / 4 / 1048576 > TOTAL_MB) { warn('写真・動画は合わせて' + TOTAL_MB + 'MBまでです。'); return; }
          MEDIA.push({ b64: b64, video: true, type: f.type }); drawThumbs();
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
  }

  function pollAdd() {
    var p3 = $('thP3'), p4 = $('thP4');
    p3.classList.toggle('add', !p3.value); p4.classList.toggle('add', !p4.value);
    if (p3.value) p4.style.display = ''; else if (!p4.value) p4.style.display = 'none';
  }
  $('thPollDel').addEventListener('click', function () {
    ['thP1', 'thP2', 'thP3', 'thP4'].forEach(function (i) { $(i).value = ''; });
    $('thPoll').style.display = 'none'; pollAdd(); drawIcons();
  });

  function drawLong() { $('thLongCard').style.display = LONG ? '' : 'none'; $('thLongPrev').textContent = LONG; drawIcons(); drawCnt(); }
  function drawLongDone() { $('thLongDone').classList.toggle('ok', !!$('thLongText').value.trim()); }
  function openLong() { $('thLongText').value = LONG; drawLongDone(); showView('thLongView'); setTimeout(function () { try { $('thLongText').focus(); } catch (e) {} }, 50); }
  $('thLongText').addEventListener('input', drawLongDone);
  $('thLongCancel').addEventListener('click', function () { showView('thWrite'); });
  $('thLongDone').addEventListener('click', function () {
    var v = $('thLongText').value.trim(); if (!v) return;
    if (tlen(v) > MAXLONG) { warn('長い文は' + MAXLONG + '文字までです。'); return; }
    LONG = v; drawLong(); showView('thWrite');
  });
  $('thLongCard').addEventListener('click', function (e) {
    if (e.target.closest('#thLongDel')) { LONG = ''; drawLong(); return; }
    openLong();
  });

  var GSEQ = 0, GTIMER = null;
  function gifKey() { return (DATA && DATA.giphy) || ''; }
  function drawGif() {
    var box = $('thGifBox');
    if (!GIF) { box.style.display = 'none'; box.innerHTML = ''; }
    else {
      box.style.display = '';
      box.innerHTML = '<div class="tmi"><img src="' + esc(GIF.big || GIF.src) + '" alt="GIF"><button type="button" class="rm" data-act="rmgif" title="削除">' + IC('x', 14) + '</button></div>';
    }
    drawIcons(); drawCnt();
  }
  function gifLoad(q) {
    var k = gifKey(), seq = ++GSEQ, grid = $('thGifGrid');
    if (!k) { grid.innerHTML = '<div class="tgl">GIFを読み込めませんでした。もう一度試してもらえると嬉しいです🙇</div>'; return; }
    grid.innerHTML = '<div class="tgl">読み込み中です…</div>';
    var u = 'https://api.giphy.com/v1/gifs/' + (q ? 'search' : 'trending') + '?api_key=' + encodeURIComponent(k) +
            '&limit=40&rating=pg-13' + (q ? '&lang=ja&q=' + encodeURIComponent(q) : '');
    fetch(u).then(function (r) { return r.json(); }).then(function (j) {
      if (seq !== GSEQ) return;
      var a = (j && j.data) || [];
      if (!a.length) { grid.innerHTML = '<div class="tgl">' + (q ? '見つかりませんでした。別の言葉で検索してください😊' : 'GIFを読み込めませんでした。もう一度試してもらえると嬉しいです🙇') + '</div>'; return; }
      grid.scrollTop = 0;
      grid.innerHTML = '<div class="tgc">' + a.map(function (g) {
        var im = g.images || {}, s = im.fixed_width || {}, b = im.downsized || im.fixed_width || {};
        var w = Number(s.width) || 200, h = Number(s.height) || 150;
        return '<img data-gid="' + esc(g.id) + '" data-big="' + esc(b.url || s.url || '') + '" src="' + esc(s.webp || s.url || '') +
          '" width="' + w + '" height="' + h + '" loading="lazy" alt="' + esc(g.title || 'GIF') + '">';
      }).join('') + '</div>';
    }).catch(function () {
      if (seq !== GSEQ) return;
      grid.innerHTML = '<div class="tgl">GIFを読み込めませんでした。もう一度試してもらえると嬉しいです🙇</div>';
    });
  }
  function openGif() {
    $('thGifQ').value = ''; showView('thGifView'); gifLoad('');
  }
  $('thGifCancel').addEventListener('click', function () { GSEQ++; showView('thWrite'); });
  $('thGifQ').addEventListener('input', function () {
    var q = this.value.trim();
    clearTimeout(GTIMER); GTIMER = setTimeout(function () { gifLoad(q); }, 400);
  });
  $('thGifGrid').addEventListener('click', function (e) {
    var im = e.target.closest('img[data-gid]'); if (!im) return;
    GIF = { id: im.getAttribute('data-gid'), src: im.getAttribute('src'), big: im.getAttribute('data-big'),
            w: Number(im.getAttribute('width')) || 0, h: Number(im.getAttribute('height')) || 0 };
    GSEQ++; showView('thWrite'); drawGif();
  });

  function addChain(text) {
    if (chainBoxes().length >= MAXCHAIN) { warn('続けて投稿できるのは' + MAXCHAIN + 'つまでです。'); return; }
    var d = document.createElement('div');
    d.className = 'tblk';
    d.innerHTML = '<div class="tleft"><img class="tav thAvI" referrerpolicy="no-referrer"><div class="tline"></div></div><div class="tmain">' +
      '<div class="tun"><b class="thUN"></b><span class="tpg"></span><button type="button" class="tx" data-act="rmchain" title="削除">' + IC('x', 16) + '</button></div>' +
      '<textarea class="tta" rows="1" placeholder="もっと書く"></textarea>' +
      '<div class="ticons">' + chainIcons() + '</div></div>';
    $('thChain').appendChild(d); fillWho(d);
    var ta = d.querySelector('textarea');
    if (text) { ta.value = text; autoH(ta); } else ta.focus();
    drawCnt();
  }
  $('thAddChain').addEventListener('click', function () { if (this.classList.contains('on')) addChain(''); });

  function drawOpt() {
    each('button', $('thRc'), function (b) { b.querySelector('.r').innerHTML = b.getAttribute('data-v') === RC ? IC('check', 20) : ''; });
    $('thApprove').querySelector('.sw').classList.toggle('on', APPR);
  }
  $('thMoreBtn').addEventListener('click', function () { var m = $('thMoreMenu'), op = m.style.display === 'none'; closeMenus(); m.style.display = op ? '' : 'none'; });
  $('thOptBtn').addEventListener('click', function () { var m = $('thOpt'), op = m.style.display === 'none'; closeMenus(); m.style.display = op ? '' : 'none'; drawOpt(); });
  $('thRc').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; RC = b.getAttribute('data-v'); drawOpt(); });
  $('thApprove').addEventListener('click', function () { APPR = !APPR; drawOpt(); });

  $('thCompose').addEventListener('click', function (e) {
    var t = e.target;
    var off = t.closest('[data-off]');
    if (off) { closeMenus(); warn(off.getAttribute('data-off') + OFFMSG); return; }
    var mg = t.closest('[data-msg]');
    if (mg) { warn(mg.getAttribute('data-msg')); return; }
    var a = t.closest('[data-act]');
    if (a) {
      var act = a.getAttribute('data-act');
      if (act === 'emo') {
        var tm = a.closest('.tmain'), em = $('thEmos'), same = em.parentNode === tm && em.style.display !== 'none';
        tm.insertBefore(em, tm.querySelector('.ticons')); em.style.display = same ? 'none' : '';
        LAST = tm.querySelector('.tta');
      } else if (act === 'poll') {
        $('thPoll').style.display = ''; pollAdd(); drawIcons(); try { $('thP1').focus(); } catch (x) {}
      } else if (act === 'long') {
        openLong();
      } else if (act === 'gif') {
        openGif();
      } else if (act === 'rmgif') {
        GIF = null; drawGif();
      } else if (act === 'rmm') {
        MEDIA.splice(Number(a.getAttribute('data-i')), 1); drawThumbs();
      } else if (act === 'mmo') {
        var had = a.parentNode.querySelector('.tmenu'); closeMenus();
        if (!had) {
          var m = document.createElement('div'); m.className = 'tmenu';
          m.innerHTML = '<div class="s"><button type="button" data-act="spoil">「ネタバレあり」' + (SPOIL ? 'を解除' : 'にする') + '<span class="r">' + IC('eyeoff') + '</span></button>' +
            '<button type="button" data-off="タグ付け">タグ付けする<span class="r">' + IC('person') + '</span></button>' +
            '<button type="button" data-off="代替テキスト">代替テキストを追加<span class="r">' + IC('alt') + '</span></button></div>';
          a.parentNode.appendChild(m);
        }
      } else if (act === 'spoil') {
        SPOIL = !SPOIL; closeMenus(); drawThumbs();
      } else if (act === 'rmchain') {
        var bk = a.closest('.tblk'), e2 = $('thEmos');
        if (bk.contains(e2)) { e2.style.display = 'none'; $('thBlk0').querySelector('.tmain').insertBefore(e2, $('thIcons')); }   
        bk.parentNode.removeChild(bk);
        drawCnt();
      }
      return;
    }
    if (!t.closest('.tmenu') && !t.closest('#thMoreBtn') && !t.closest('#thOptBtn')) closeMenus();
  });
  $('thCompose').addEventListener('input', function (e) {
    var t = e.target;
    if (t.classList.contains('tta')) { autoH(t); drawCnt(); }
    if (t.id === 'thP3' || t.id === 'thP4') pollAdd();
  });
  $('thCompose').addEventListener('change', function (e) { if (e.target.classList && e.target.classList.contains('thFile')) addFiles(e.target); });
  $('thCompose').addEventListener('focusin', function (e) {
    var t = e.target;
    if (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && t.type !== 'file')) LAST = t;
  });

  function dkey() { return 'th_drafts_v1_' + CUR; }
  function draftsGet() { try { return JSON.parse(localStorage.getItem(dkey()) || '[]') || []; } catch (e) { return []; } }
  function draftsSet(a) { try { localStorage.setItem(dkey(), JSON.stringify(a)); return true; } catch (e) { return false; } }
  function snapshot(withMedia) {
    return { at: Date.now(), text: $('thText').value, topic: $('thTopicText').value, chain: chainBoxes().map(function (t) { return t.value; }),
             poll: $('thPoll').style.display !== 'none' ? vals(['thP1', 'thP2', 'thP3', 'thP4']) : null,
             long: LONG, rc: RC, appr: APPR, spoil: SPOIL, media: withMedia ? MEDIA : [], gif: GIF };
  }
  function dropDraft(at) { if (!at) return; draftsSet(draftsGet().filter(function (d) { return d.at !== at; })); }
  function saveDraft() {
    var a = draftsGet().filter(function (d) { return d.at !== OPEN_DRAFT; });
    a.unshift(snapshot(true));
    if (draftsSet(a)) return true;
    a[0] = snapshot(false);
    if (draftsSet(a)) { warn('写真・動画は大きいため下書きに保存できませんでした。文だけ保存しました。'); return true; }
    warn('下書きを保存できませんでした。'); return false;
  }
  function loadDraft(d) {
    reset();
    $('thText').value = d.text || ''; $('thTopicText').value = d.topic || '';
    (d.chain || []).forEach(function (c) { addChain(c); });
    if (d.poll) { $('thPoll').style.display = ''; ['thP1', 'thP2', 'thP3', 'thP4'].forEach(function (i, k) { $(i).value = d.poll[k] || ''; }); pollAdd(); }
    LONG = d.long || ''; RC = d.rc || 'everyone'; APPR = !!d.appr; MEDIA = d.media || []; SPOIL = !!d.spoil; OPEN_DRAFT = d.at || 0;
    GIF = d.gif || null;
    drawLong(); drawThumbs(); drawGif(); each('#thCompose .tta', null, autoH); drawCnt();
  }
  function drawDrafts() {
    var a = draftsGet();
    if (!a.length) {
      $('thDraftList').innerHTML = '<div class="tempty">' + IC('draft', 88) + '<b>下書きはまだありません</b><div>下書きはここに表示されます。</div></div>';
      return;
    }
    $('thDraftList').innerHTML = a.map(function (d, i) {
      var t = d.text || (d.chain || [])[0] || (d.long ? d.long : '') || ((d.media && d.media.length) ? '写真・動画' : '') || (d.gif ? 'GIF' : '');
      var dt = new Date(d.at);
      return '<div class="tdr" data-di="' + i + '"><img class="tav thAvI" referrerpolicy="no-referrer"><div class="w"><b class="thUN"></b>' +
        '<div class="t">' + esc(t) + '</div><div class="d">' + (dt.getMonth() + 1) + '月' + dt.getDate() + '日 ' + ('0' + dt.getHours()).slice(-2) + ':' + ('0' + dt.getMinutes()).slice(-2) + '</div></div>' +
        '<button type="button" class="rm" data-drm="' + i + '" title="削除">' + IC('x', 16) + '</button></div>';
    }).join('');
    fillWho($('thDraftList'));
  }
  $('thDraftBtn').addEventListener('click', function () { drawDrafts(); showView('thDrafts'); });
  $('thDraftBack').addEventListener('click', function () { showView('thWrite'); });
  $('thDraftList').addEventListener('click', function (e) {
    var rm = e.target.closest('[data-drm]');
    if (rm) {
      var at = (draftsGet()[Number(rm.getAttribute('data-drm'))] || {}).at;
      szPopup_('この下書きを削除しますか？😊', { cancel: true, onYes: function () { dropDraft(at); if (at === OPEN_DRAFT) OPEN_DRAFT = 0; drawDrafts(); } });
      return;
    }
    var r = e.target.closest('[data-di]'); if (!r) return;
    var d = draftsGet()[Number(r.getAttribute('data-di'))]; if (!d) return;
    var go = function () { loadDraft(d); showView('thWrite'); };
    if (hasDraft() && OPEN_DRAFT !== d.at) szPopup_('書きかけのスレッドを破棄して、この下書きを開きますか？😊', { cancel: true, onYes: go }); else go();
  });

  function reset() {
    ['thText', 'thLongText', 'thTopicText', 'thP1', 'thP2', 'thP3', 'thP4'].forEach(function (i) { $(i).value = ''; });
    MEDIA = []; LONG = ''; SPOIL = false; APPR = false; RC = 'everyone'; OPEN_DRAFT = 0; GIF = null;
    $('thChain').innerHTML = ''; $('thPoll').style.display = 'none'; pollAdd(); drawGif();
    var em = $('thEmos'); em.style.display = 'none'; $('thBlk0').querySelector('.tmain').insertBefore(em, $('thIcons'));
    showView('thWrite'); autoH($('thText')); drawOpt();
    drawLong(); drawThumbs();
  }
  $('thGo').addEventListener('click', function () {
    if (this.disabled || curRo()) return;
    var text = $('thText').value.trim();
    var pv = vals(['thP1', 'thP2', 'thP3', 'thP4']);
    var usePoll = $('thPoll').style.display !== 'none';
    var longt = LONG;
    var topic = $('thTopicText').value.trim().replace(/^#/, '');
    var chain = chainBoxes().map(function (t) { return t.value.trim(); }).filter(function (x) { return x; });
    if (!CUR) { warn('投稿するアカウントを選択してください😊'); return; }
    if (!text && !MEDIA.length && !GIF) { warn('文か写真・動画を入力してください😊'); return; }
    if (tlen(text) > MAXT) { warn('文は' + MAXT + '文字までです。'); return; }
    if (GIF && (MEDIA.length || usePoll || longt)) { warn('GIFは、写真・動画・アンケート・長い文と一緒には投稿できません。'); return; }
    if (usePoll) {
      if (MEDIA.length || longt) { warn('投票は、写真・動画・長い文と一緒には投稿できません。'); return; }
      if (!pv[0] || !pv[1]) { warn('投票の選択肢は1つ目と2つ目を入力してください😊'); return; }
      if (!text) { warn('投票には質問の文を入力してください😊'); return; }
    }
    if (longt) {
      if (MEDIA.length) { warn('長い文は、写真・動画と一緒には投稿できません。'); return; }
      if (tlen(longt) > MAXLONG) { warn('長い文は' + MAXLONG + '文字までです。'); return; }
      if (!text) { warn('長い文には、最初に表示される文も入力してください😊'); return; }
    }
    if (topic && (tlen(topic) > 50 || /[.&]/.test(topic))) { warn('トピックは50文字まで・「.」と「&」は使えません。'); return; }
    if (chain.some(function (c) { return tlen(c) > MAXT; })) { warn('続きの文も1つ' + MAXT + '文字までです。'); return; }
    var f = { kind: 'post', acct: CUR, text: text, media: MEDIA.map(function (o) { return { b64: o.b64 }; }),
              topic: topic, long: longt, chain: chain, reply_control: RC,
              approvals: APPR, spoiler: SPOIL };
    if (usePoll) f.poll = { a: pv[0], b: pv[1], c: pv[2], d: pv[3] };
    if (GIF) f.gif = { id: GIF.id };
    var a = ACCTS.filter(function (x) { return x.acct === CUR; })[0];
    szPopup_((a ? a.label : '') + 'のThreadsに投稿しますか？😊', { icon: '', cancel: true, onYes: function () {
      ask(f, MEDIA.some(function (o) { return o.video; }) ? 'Threadsに投稿中です（動画は数分かかります）' : 'Threadsに投稿中です', function (err, d) {
        if (err) { warn(err); return; }
        dropDraft(OPEN_DRAFT);
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
    return !!($('thText').value.trim() || MEDIA.length || GIF || chainBoxes().some(function (t) { return t.value.trim(); }) || LONG ||
              $('thTopicText').value.trim() || ($('thPoll').style.display !== 'none' && vals(['thP1', 'thP2', 'thP3', 'thP4']).some(function (x) { return x; })));
  }
  function openCompose() {
    fillWho($('thCompose'));
    showView('thWrite'); $('thCompose').style.display = ''; document.body.style.overflow = 'hidden';
    drawIcons(); drawCnt(); autoH($('thText'));
    setTimeout(function () { try { $('thText').focus(); } catch (e) {} }, 50);
  }
  function closeCompose() { $('thAsk').style.display = 'none'; $('thCompose').style.display = 'none'; document.body.style.overflow = ''; }
  $('thCancel').addEventListener('click', function () {
    if (!hasDraft()) { reset(); closeCompose(); return; }
    $('thAsk').style.display = 'flex';
  });
  $('thAskSave').addEventListener('click', function () { $('thAsk').style.display = 'none'; if (saveDraft()) { reset(); closeCompose(); } });
  $('thAskNo').addEventListener('click', function () { $('thAsk').style.display = 'none'; reset(); closeCompose(); });
  $('thAskCancel').addEventListener('click', function () { $('thAsk').style.display = 'none'; });
  reset();

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
    var pf = FEED.profile || {}, h = '', isDev = myRole() === '開発', ro = curRo();
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
    h += '<div class="pbtns"><button type="button" class="off" data-off="プロフィールの編集は、公式の仕組みでは変更できません。Threadsのアプリから行ってください🙇">プロフィールを編集</button>' +
      '<button type="button" id="thInsOpen">インサイトを見る</button></div>';
    var TABS = [['th', 'スレッド'], ['rp', '返信'], ['md', 'メディア'], ['rs', '再投稿']];
    h += '<div class="tabs">' + TABS.map(function (t) { return '<div data-tab="' + t[0] + '"' + (t[0] === TAB ? ' class="on"' : '') + '>' + t[1] + '</div>'; }).join('') + '</div>';
    if (ro) h += '<div class="ronote">このアカウントは閲覧のみです😊<br>投稿・削除・返信はできません。</div>';
    if (TAB === 'th' && !ro) {
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
      var st = p.st || null, canDel = !ro && TAB !== 'rp' && (p.zuko || isDev);
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
        (TAB !== 'rp' ? '<button type="button" class="cmb" data-cm="' + esc(p.id) + '">' + (ro ? '💬 コメントを見る' : '💬 コメントを見る・返信する') + '</button>' +
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
    if (curRo()) {
      a = '';   
    } else if (pending) {
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
      if (!curRo()) h += '<div class="cm"><div class="a"><button type="button" data-rp="' + esc(mid) + '">↩ この投稿に返信</button></div><div class="rpbox" id="rb_' + esc(mid) + '" style="display:none"></div></div>';
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
    if (curRo()) return;   
    if (g('data-rp')) { openReply(g('data-rp')); return; }
    if (g('data-fdel')) {
      var dmid = g('data-fdel');
      szPopup_('この投稿をThreadsから削除しますか？😊\n（元に戻せません）', { cancel: true, onYes: function () {
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
      szPopup_('お店として返信しますか？😊', { icon: '', cancel: true, onYes: function () {
        act({ kind: 'reply', acct: CUR, to_id: to, text: txt }, '返信中です', '返信が完了しました', mid);
      } });
      return;
    }
    if (g('data-hd')) { var r1 = g('data-hd'); szPopup_('このコメントを非表示にしますか？😊\n（あとで戻せます）', { cancel: true, onYes: function () { act({ kind: 'hide', acct: CUR, reply_id: r1, hide: true }, '非表示にしています', '非表示にしました', mid); } }); return; }
    if (g('data-un')) { var r2 = g('data-un'); act({ kind: 'hide', acct: CUR, reply_id: r2, hide: false }, '表示に戻しています', '表示に戻しました', mid); return; }
    if (g('data-ap')) { var r3 = g('data-ap'); act({ kind: 'approve', acct: CUR, reply_id: r3, approve: true }, '承認しています', '承認しました', mid); return; }
    if (g('data-ig')) { var r4 = g('data-ig'); szPopup_('このコメントを無視しますか？😊\n（表示しません）', { cancel: true, onYes: function () { act({ kind: 'approve', acct: CUR, reply_id: r4, approve: false }, '処理中です', '無視しました', mid); } }); return; }
  });

  var WEB = {}, INS = {}, WEBBUSY = {}, INSBUSY = {}, VIEW = 'feed', DAYS = 30;
  var WKEY = 'th_web_v1', IKEY = 'th_ins_v1', FRESH = 30 * 60000;   
  try { WEB = JSON.parse(localStorage.getItem(WKEY) || '{}') || {}; INS = JSON.parse(localStorage.getItem(IKEY) || '{}') || {}; } catch (e) {}
  function webOf(a, d) { return WEB[a + '_' + d] || (d === 30 ? null : null); }
  function mergeNewer(mine, key) {
    var st = {};
    try { st = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (e) {}
    for (var k in st) if (st[k] && (!mine[k] || (st[k]._t || 0) > (mine[k]._t || 0))) mine[k] = st[k];
    return mine;
  }
  function saveWI() {
    try { localStorage.setItem(WKEY, JSON.stringify(mergeNewer(WEB, WKEY))); } catch (e) {}
    try { localStorage.setItem(IKEY, JSON.stringify(mergeNewer(INS, IKEY))); } catch (e) {}
  }
  function slim(r, d) { return d === 30 ? r : { ok: r.ok, ins: r.ins || {}, login: r.login || '', _t: r._t }; }
  function redrawFor(kind, a, d) {
    if (a !== CUR) return;
    if (kind === 'web' && d === 30) { redraw(); return; }
    if (VIEW === 'ins' && DAYS === d) drawIns();
  }
  function loadWeb(a, d, force, cb) {
    var k = a + '_' + d, w = WEB[k];
    if (WEBBUSY[k] || (!force && w && Date.now() - (w._t || 0) < FRESH)) { if (cb) cb(false); return; }
    WEBBUSY[k] = true;
    ask({ kind: 'web', acct: a, days: d }, '', function (err, r) {
      WEBBUSY[k] = false;
      if (err || !r) { if (cb) cb(false, err || 'x'); return; }
      r._t = Date.now(); WEB[k] = slim(r, d); saveWI(); redrawFor('web', a, d);
      if (cb) cb(true);
    });
  }
  function loadIns(a, d, cb) {
    var k = a + '_' + d;
    if (INSBUSY[k]) { if (cb) cb(false); return; }
    INSBUSY[k] = true;
    ask({ kind: 'insights', acct: a, days: d }, '', function (err, r) {
      INSBUSY[k] = false;
      if (err || !r) { if (cb) cb(false, err || 'x'); return; }
      r._t = Date.now(); INS[k] = r; saveWI(); redrawFor('ins', a, d);
      if (cb) cb(true);
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
    if (cl('[data-compose]')) { if (!curRo()) openCompose(); return; }
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
    szPopup_('この投稿をThreadsから削除しますか？😊\n（続きの投稿も一緒に消えます）', { cancel: true, onYes: function () {
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
      var old = DATA && DATA.feeds;
      for (var a in (d.feeds || {})) {
        var nf = d.feeds[a];
        if (!nf || !nf.ok) continue;
        nf.after0 = nf.after || ''; nf.n0 = (nf.posts || []).length;
        var of = old && old[a];
        if (nf.after0 && of && of.ok && of.posts && of.posts.length > nf.n0) {
          var ids = {};
          nf.posts.forEach(function (p) { ids[p.id] = 1; });
          nf.posts = nf.posts.concat(of.posts.filter(function (p) { return !ids[p.id]; }));
          nf.after = of.after || '';
        }
      }
      PF.done = {};
      if (CUR) d.cur = CUR;
      cacheSet(d); apply(d, true);
      setTimeout(pfRun, 1500);
    });
  }

  var PF = { on: false, done: {}, bad: {} };
  function pfList() {
    var order = [CUR].concat(ACCTS.map(function (x) { return x.acct; }).filter(function (a) { return a !== CUR; }));
    var L = [];
    order.forEach(function (a) {
      L.push({ t: 'more', a: a });
      [30, 7, 14, 90].forEach(function (d) { L.push({ t: 'ins', a: a, d: d }); });
      [30, 7, 14, 90].forEach(function (d) { L.push({ t: 'web', a: a, d: d }); });
    });
    return L;
  }
  function pfAge(it) {   
    if (it.t === 'more') {
      var fd = DATA && DATA.feeds && DATA.feeds[it.a];
      return (PF.done['more_' + it.a] || !fd || !fd.ok || !fd.after0) ? Date.now() : 0;
    }
    var o = (it.t === 'ins' ? INS : WEB)[it.a + '_' + it.d];
    return (o && o._t) || 0;
  }
  function pfNext() {
    var now = Date.now(), L = pfList(), miss = null, old = null;
    for (var i = 0; i < L.length; i++) {
      var it = L[i];
      if (PF.bad[it.t + '_' + it.a]) continue;
      if ((it.t === 'web' ? WEBBUSY : INSBUSY)[it.a + '_' + it.d]) continue;
      var t = pfAge(it);
      if (!t) { if (!miss) miss = it; } else if (now - t >= FRESH && !old) old = it;
    }
    return miss || old;
  }
  function pfRun() {
    if (PF.on) return;
    var it = pfNext();
    if (!it) return;
    PF.on = true;
    var fin = function (ok, err) {
      PF.on = false;
      if (!ok && err) PF.bad[it.t + '_' + it.a] = 1;
      setTimeout(pfRun, it.t === 'web' ? 20000 : 300);
    };
    if (it.t === 'more') pfMore(it.a, fin);
    else if (it.t === 'ins') loadIns(it.a, it.d, fin);
    else loadWeb(it.a, it.d, false, function (ok, err) {
      var w = WEB[it.a + '_' + it.d];   
      if (ok && w && w.login && !/入りました/.test(w.login)) PF.bad['web_' + it.a] = 1;   
      fin(ok, err);
    });
  }
  function pfMore(a, fin) {   
    var fd = DATA && DATA.feeds && DATA.feeds[a], cur = fd && fd.after0, got = [], n = 0;
    if (!cur) { PF.done['more_' + a] = 1; fin(true); return; }
    var step = function () {
      ask({ kind: 'feed', acct: a, after: cur }, '', function (err, d) {
        if (err || !d || !d.ok) { fin(false, err || 'x'); return; }
        got = got.concat(d.posts || []); cur = d.after || ''; n++;
        if (cur && n < 20) { setTimeout(step, 300); return; }
        var f2 = DATA && DATA.feeds && DATA.feeds[a];
        if (f2 && f2.after0 === fd.after0) {   
          f2.posts = f2.posts.slice(0, f2.n0).concat(got); f2.after = cur;
          cacheSet(DATA);
          if (CUR === a && VIEW === 'feed' && !(FEED && FEED.more)) showFeedFromData();
        }
        PF.done['more_' + a] = 1; fin(true);
      });
    };
    step();
  }

  var _c = cacheGet();
  if (_c) apply(_c, false);
  loadAll();
}
