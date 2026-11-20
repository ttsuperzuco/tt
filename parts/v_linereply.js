// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：linereply
var LINEREPLY_MANUAL_ = { key: 'linereply', icon: '💬', title: 'LINEにすぐ返信できない' };
function renderLineReplyManualPage_(base, staff, dev) {
  return renderManualPage_(base, staff, dev, LINEREPLY_MANUAL_);
}
