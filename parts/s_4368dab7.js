// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：bcast、claudechat、hanbai、igdm、insta、kanshi、threads、timedsend、timetree、yoyaku_henkou、yoyaku_kizon、yoyaku_new、yoyaku_sejutsugo
function szBusyHtml_(title, sub) {
  return "<div style='font-size:66px;margin-bottom:20px;'>⏳</div>" +
    "<div style='color:#fff;font-size:33px;font-weight:800;line-height:1.5;margin-bottom:22px;'>" + title + "</div>" +
    (sub === false ? "" : "<div style='color:#eaf3f7;font-size:20px;line-height:1.8;max-width:420px;'>" +
    (sub || "タイムツリーへの書き込みが完了したら自動で切り替わりますので、少し待っててくださいね🥺") + "</div>");
}
