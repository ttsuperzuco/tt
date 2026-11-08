// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：hanbai、threads
var HANBAICSS_ =
  '.hb{width:100%;box-sizing:border-box;max-width:560px;margin:0 auto;padding:0 6px 60px;text-align:left;}' +
  '.hbbig{display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;margin:12px 0;padding:22px 18px;border:0;border-radius:18px;background:#fff;color:#0f172a;font:inherit;font-size:24px;font-weight:900;text-align:left;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.15);}' +
  '.hbbig .i{font-size:30px;}' +
  '.hbhint{color:#eaf6fb;font-weight:800;font-size:17px;line-height:1.5;margin:6px 4px 10px;}' +
  '.hbsum{background:rgba(255,255,255,.16);color:#fff;border-radius:12px;padding:8px 12px;margin:2px 0 12px;font-weight:800;font-size:16px;line-height:1.5;}' +
  '.hbsum:empty{display:none;}' +
  '.hbpay .hbbig{justify-content:center;font-size:28px;padding:26px 18px;}' +
  '.hbpay .hbbig.on{background:#16a34a;color:#fff;}' +
  '.hbwho{display:flex;align-items:center;gap:10px;color:#fff;font-weight:800;font-size:17px;margin:0 4px 8px;}' +
  '.hbwho b{font-size:22px;color:#fde047;}' +
  '.hbwho button{margin-left:auto;background:#fff;color:#0f172a;border:0;border-radius:10px;padding:8px 14px;font:inherit;font-size:15px;font-weight:800;cursor:pointer;}' +
  '.hbtbl td.wm{font-size:20px;color:#94a3b8;}' +
  '.hbtbl .rp{font-size:12px;font-weight:800;color:#0e7490;}' +
  '.hbtbl td.one{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;word-break:normal;}' +
  '.hbtbl .gf{font-size:12px;margin-left:2px;}' +
  '.hbtbl tbody tr{cursor:pointer;}' +
  '.hbcust{color:#fde047;font-size:28px;font-weight:900;line-height:1.3;margin:4px 0 2px;word-break:break-all;text-shadow:0 2px 6px rgba(0,0,0,.3);}' +
  '.hbcust .no{display:inline-block;background:#fde047;color:#0f172a;border-radius:10px;padding:1px 10px;margin-right:10px;text-shadow:none;}' +
  '.hbdate{background:#fff;color:#0f172a;border-radius:16px;text-align:center;font-size:34px;font-weight:900;padding:16px 8px;margin:6px 0 14px;box-shadow:0 4px 14px rgba(0,0,0,.15);}' +
  '.hb3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:0 0 6px;}' +
  '.hb3 button,.hbqty button,.hbseg button{background:#fff;color:#0f172a;border:3px solid transparent;border-radius:14px;padding:16px 4px;font:inherit;font-size:19px;font-weight:900;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.15);}' +
  '.hb3 button.on,.hbqty button.on,.hbseg button.on{background:#16a34a;color:#fff;border-color:#15803d;}' +
  '.hb4{grid-template-columns:repeat(4,1fr);gap:8px;}' +
  '.hb4 button{font-size:17px;padding:16px 2px;}' +
  '.hbcal{position:relative;overflow:hidden;}' +
  '.hbcal input{position:absolute;inset:0;opacity:0;width:100%;height:100%;cursor:pointer;}' +
  '.hbin{display:block;width:100%;box-sizing:border-box;border:0;border-radius:14px;padding:16px;font:inherit;font-size:26px;font-weight:800;color:#0f172a;margin:4px 0 12px;box-shadow:0 4px 14px rgba(0,0,0,.15);}' +
  '.hblb{color:#fff;font-weight:900;font-size:20px;margin:8px 4px 2px;}' +
  'textarea.hbin{font-size:20px;min-height:130px;resize:vertical;}' +
  '.hbkana{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin:6px 0 10px;}' +
  '.hbkana button{background:#fff;color:#0f172a;border:0;border-radius:12px;padding:12px 0;font:inherit;font-size:26px;font-weight:900;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.15);}' +
  '.hbkana span{display:block;}' +
  '.hbqty{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;margin:6px 0 12px;}' +
  '.hbqty button{font-size:28px;padding:14px 0;}' +
  '.hbqty button.wide{grid-column:1 / -1;font-size:20px;}' +
  '.hbqty button.wide .qn{font-size:34px;}' +
  '.hbqty.more button:not(.wide){display:none;}' +
  '.hbqty.more button.none{display:none;}' +
  '.hbrows{background:#fff;border-radius:14px;overflow:hidden;margin:6px 0 4px;box-shadow:0 4px 14px rgba(0,0,0,.15);}' +
  '.hbrows button{display:flex;width:100%;align-items:center;justify-content:space-between;gap:10px;background:#fff;color:#0f172a;border:0;border-top:1px solid #e2e8f0;padding:14px 16px;font:inherit;font-size:21px;font-weight:900;cursor:pointer;text-align:left;}' +
  '.hbrows button:first-child{border-top:0;}' +
  '.hbrows button:nth-child(even){background:#f4f8f9;}' +
  '.hbrows .s{font-size:14px;font-weight:700;color:#475569;white-space:nowrap;}' +
  '.hbbighint{color:#fde047;font-weight:900;font-size:26px;line-height:1.4;text-align:center;margin:8px 4px 14px;text-shadow:0 2px 6px rgba(0,0,0,.35);}' +
  '.hbcards{background:none;box-shadow:none;border-radius:0;overflow:visible;}' +
  '.hbcards button,.hbcards button:nth-child(even){background:#fff;border:0;border-radius:14px;margin:0 0 10px;padding:16px;box-shadow:0 3px 10px rgba(0,0,0,.18);}' +
  '.hbcards button:first-child{border-top:0;}' +
  '.hbcards .mk{flex:0 0 auto;font-size:28px;line-height:1;min-width:1.1em;}' +
  '.hbcards .nm{flex:1;min-width:0;word-break:break-all;}' +
  '.hbcards .s{text-align:right;line-height:1.4;font-size:15px;}' +
  '.hbseg{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:4px 0 12px;}' +
  '.hbconf{background:#fff;color:#0f172a;border-radius:14px;overflow:hidden;margin:6px 0;box-shadow:0 4px 14px rgba(0,0,0,.15);}' +
  '.hbconf div{display:flex;gap:10px;padding:12px 14px;border-top:1px solid #e2e8f0;font-size:19px;font-weight:900;}' +
  '.hbconf div:first-child{border-top:0;}' +
  '.hbconf b{flex:0 0 5.2em;color:#475569;font-size:15px;font-weight:800;padding-top:3px;}' +
  '.hbconf span{flex:1;word-break:break-all;white-space:pre-wrap;}' +
  '.hbq{color:#fff;font-weight:900;font-size:24px;text-align:center;margin:16px 4px 4px;}' +
  '.hbst{color:#eaf6fb;font-weight:800;font-size:16px;margin:8px 4px;min-height:1.4em;}' +
  '.hbok{background:#16a34a;color:#fff;border-radius:14px;padding:12px 14px;margin:4px 0 6px;font-weight:900;font-size:18px;line-height:1.5;box-shadow:0 4px 12px rgba(0,0,0,.15);}' +
  '.hbdone{background:#fff;color:#0f172a;border-radius:16px;padding:22px 16px;text-align:center;font-weight:900;font-size:24px;line-height:1.5;margin:10px 0;}' +
  '.hbmon{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;margin:4px 0 10px;}' +
  '.hbmon button{background:#fff;color:#0f172a;border:0;border-radius:12px;padding:10px 14px;font:inherit;font-size:18px;font-weight:900;cursor:pointer;}' +
  '.hbmon button:disabled{opacity:.35;}' +
  '.hbmon div{color:#fff;text-align:center;font-weight:900;font-size:22px;}' +
  '.hbtot{background:#fff;color:#0f172a;border-radius:14px;padding:12px 14px;margin:0 0 10px;font-weight:900;font-size:18px;display:flex;justify-content:space-around;flex-wrap:wrap;gap:6px;}' +
  '.hbtbl{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,.15);}' +
  '.hbtbl table{width:100%;border-collapse:collapse;table-layout:fixed;color:#0f172a;font-size:15px;}' +
  '.hbseg.sm button{padding:10px 4px;font-size:16px;}' +
  '.hbtbl .py{font-size:11px;font-weight:700;color:#64748b;line-height:1.1;}' +
  '.hbtbl small.sp{color:#ea580c;font-weight:900;}' +
  '.hbtbl.all col.c1{width:3.4em;}' +
  '.hbtbl col.c1{width:2.6em;}.hbtbl col.c3{width:2.2em;}.hbtbl col.c4{width:3.6em;}.hbtbl col.c5{width:4.6em;}' +
  '.hbtbl th{background:#2C7A99;color:#fff;font-weight:800;font-size:13px;line-height:1.25;padding:8px 4px;vertical-align:middle;white-space:nowrap;}' +
  '.hbtbl td{border-top:1px solid #e2e8f0;padding:10px 4px;font-weight:700;vertical-align:middle;word-break:break-all;}' +
  '.hbtbl tbody tr:nth-child(even) td{background:#eef6f9;}' +
  '.hbtbl tbody tr.sp td{background:#fff4ea;}' +
  '.hbtbl tbody tr.sp td.d{box-shadow:inset 4px 0 0 #ea580c;}' +
  '.hbtbl tbody tr.sh td{background:#e8edff;}' +
  '.hbtbl tbody tr.sh td.d{box-shadow:inset 4px 0 0 #1d4ed8;}' +
  '.hbseg.sm button.on[data-v="shopee"]{background:#ea580c;border-color:#c2410c;}' +
  '.hbseg.sm button.on[data-v="shop"]{background:#1d4ed8;border-color:#1e3a8a;}' +
  '.hbtbl .l{text-align:left;}.hbtbl .c{text-align:center;}.hbtbl .r{text-align:right;white-space:nowrap;}' +
  '.hbtbl td.d{white-space:nowrap;}' +
  '.hbtbl .nt{font-size:12px;color:#475569;font-weight:600;}' +
  '.hbempty{color:#eaf6fb;font-weight:800;font-size:18px;text-align:center;margin:20px 0;}';
