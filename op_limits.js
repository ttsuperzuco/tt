/* ★自動で作っているファイルです。手で書き換えないでください。
 *   もとの正本＝AI自動プログラム\施術室被り検出\programs\edit_worker.py（用事ごとの制限時間）。
 *   作り直す＝python -X utf8 共通\画面\スマホへ配る.py
 *
 * 使い方（画面側）：待つ回数を自分で決めず、必ずこれに聞く。
 *   var n = LIMITS.tries("zenjitsu", 700);   // 700ミリ秒おきに見に行く時の、あきらめてよい回数
 * ★これで『スマホが事務所パソコンより先にあきらめる』が起きなくなる。
 */
(function (root) {
  'use strict';
  var LIMITS = {};
  /* 用事ごとに事務所パソコンが使ってよい秒数（受付係のコードから写した物）。 */
  LIMITS.sec = {
    "availability": 120,
    "cost": 180,
    "cust_search": 30,
    "customer_reservations": 120,
    "existing_apply_memo": 60,
    "existing_build_ctx": 180,
    "existing_create": 120,
    "existing_create_multi": 120,
    "instadm_approve_reply": 150,
    "instadm_delete": 120,
    "instadm_reply": 120,
    "instadm_reqdetail": 90,
    "links_refresh": 120,
    "make_allday": 180,
    "new_availability": 120,
    "new_customer_reservations": 120,
    "preview_reservation": 180,
    "run_all": 600,
    "timed_line_send": 180,
    "timedsend_cancel": 180,
    "timedsend_list": 60,
    "translate": 120,
    "zenjitsu": 180
  };
  /* 窓口との往復にかかるおよその時間（実測）。 */
  LIMITS.roundTripMs = 1100;
  /* 余裕（事務所パソコンの制限ちょうどで切らない）。 */
  LIMITS.marginSec = 30;
  /* stepMs ミリ秒おきに見に行く時、あきらめてよい回数。分からない用事は多めに待つ。 */
  LIMITS.tries = function (op, stepMs) {
    var sec = LIMITS.sec[op];
    if (!sec) sec = 180;
    var per = (Number(stepMs) || 700) + LIMITS.roundTripMs;
    return Math.ceil((sec + LIMITS.marginSec) * 1000 / per);
  };
  root.LIMITS = LIMITS;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
