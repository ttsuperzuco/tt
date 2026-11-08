// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：igdm、kanshi、threads、timedsend、timetree、yoyaku_henkou、yoyaku_kizon、yoyaku_new、yoyaku_sejutsugo
function szDoneHtml_(title, backLabel, openUrl) {
  var extra = openUrl
    ? "<a id='szDoneOpen' href='" + openUrl + "' target='_blank' rel='noopener' " +
      "style='display:block;margin:0 auto 16px;font:inherit;font-size:1.3rem;font-weight:800;color:#16a34a;" +
      "background:#fff;border:0;border-radius:12px;padding:14px 26px;text-decoration:none;" +
      "box-shadow:0 4px 10px rgba(0,0,0,.18);'>タイムツリーを確認</a>"
    : "";
  return "<div style='font-size:92px;margin-bottom:16px;'>✓</div>" +
    "<div style='color:#fff;font-size:35px;font-weight:800;line-height:1.5;margin-bottom:26px;'>" + title + "</div>" +
    extra +
    "<button type='button' id='szDoneBack' style='font:inherit;font-size:1.3rem;font-weight:800;color:#16a34a;background:#fff;border:0;border-radius:12px;padding:14px 26px;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.18);'>" + (backLabel || '戻る') + "</button>";
}
