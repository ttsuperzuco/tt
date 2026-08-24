/* ★自動で作っているファイルです。手で書き換えないでください。
 *   もとの正本＝AI自動プログラム\共通\business_day.py（お店の営業日の決まり）。
 *   作り直す＝python -X utf8 共通\画面\スマホへ配る.py
 *   いまの定休日＝日曜・月曜。
 */
(function (root) {
  'use strict';
  var SHOP = {};
  /* 定休日（日曜=0 … 土曜=6）。 */
  SHOP.closedWeekdays = [0,1];
  SHOP.isBusinessDay = function (d) {
    return SHOP.closedWeekdays.indexOf(d.getDay()) < 0;
  };
  /* base の**次の**営業日（base 自身は含まない）。 */
  SHOP.nextBusinessDay = function (base) {
    var d = new Date(base ? base.getTime() : Date.now());
    do { d.setDate(d.getDate() + 1); } while (!SHOP.isBusinessDay(d));
    return d;
  };
  SHOP.nextBusinessDayISO = function (base) {
    var d = SHOP.nextBusinessDay(base), m = d.getMonth() + 1, x = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (x < 10 ? '0' : '') + x;
  };
  root.SHOP = SHOP;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
