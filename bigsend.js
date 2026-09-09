/* ★正本はここ（AI自動プログラム\共通\画面\大きい依頼_別送.js）。
 *   スマホ版（ttsuperzuco/tt/bigsend.js）へは
 *   `python -X utf8 共通\画面\スマホへ配る.py` が機械で写す。手で書き写さないこと。
 *
 * ■これは何か（2026-09-09 まるちゃん決定）
 *   スマホからの依頼は、これまで**依頼の中身を全部、住所（URL）の中に詰めて**送っていた。
 *   ところが住所には長さの限りがあり、超えると事務所パソコンには**一件も届かない**。
 *   実測（2026-09-09・本物の窓口）：
 *     ・住所の長さ … 12,093文字は通る／12,140文字は門前払い（HTTP 400）
 *     ・中身の長さ … 窓口そのものが 8,000文字を超えると「依頼が大きすぎます」と断る
 *   前日お知らせの「送信を設定する」は、確認済の方の文章を全員分そこに詰めるので、
 *   3人ほどで超えていた（9/10の8人＝住所が51,282文字＝4倍超で門前払い）。
 *
 * ■直し方（宅配便で別に届ける）
 *   大きい依頼は、住所に詰めるのをやめて**別の入口（POST）で丸ごと預ける**。
 *   そのうえで、依頼そのものには「荷物が届いています」という薄い一枚だけを入れる。
 *   実測：日本語50万字を約5秒で預けられ、事務所パソコンが3.6秒で全部読めた（余裕25倍）。
 *
 * ■間違えない工夫
 *   ・荷物には**その場限りの引換券**を付ける。券が合わない荷物は事務所パソコンが開けない
 *     ＝前に預けた古い荷物をうっかり実行してしまうことが起きない。
 *   ・預けられなかった時は、呼んだ側が今までの道（小分けにして何回かに分ける等）へ戻れるよう、
 *     はっきり「預けられなかった」と伝える（黙って落とさない）。
 *
 * ■使い方（画面側）
 *   BIG.prepare({exec:EXEC, key:KEY, slot:"dev", op:"zenjitsu_act", tag:"put_sends",
 *                who:.., role:.., device:.., fields:{...}},
 *               function (fieldsText) { ...jsonp で submit する... },
 *               function (理由) { ...預けられなかった時... });
 *   ★tag＝用事の名前。同じ端末で別々の用事が同時に走っても置き場が混ざらないように分ける。
 *   短い依頼はそのまま（今までと1文字も変わらない形）で渡ってくる＝軽い依頼は今までどおり。
 */
(function (root) {
  'use strict';
  var BIG = {};

  /* 住所の長さの上限。実測12,093文字までは通るが、余裕をみて手前で切り替える。 */
  BIG.URL_MAX = 11000;
  /* 窓口が受け取る中身の上限。窓口の決まりは8,000文字。余裕をみて手前で切り替える。 */
  BIG.FIELDS_MAX = 7000;

  /* 荷物の置き場の名前。窓口が許す形は「小文字と数字と＿だけ ＋ .json」。
     ★2026-09-09：**用事ごとに置き場を分ける**。同じ端末で「途中までの作業を覚える」と
     「送信を設定する」が続けて起きると、同じ置き場を取り合って先の荷物が上書きされてしまう
     （引換券が合わずに断られるので事故にはならないが、押し直しになる）。 */
  BIG.parcelName = function (slot, tag) {
    var s = String(slot || 'x').toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!s) s = 'x';
    var t = String(tag || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
    return 'bigsend_' + s.slice(0, 30) + (t ? '_' + t.slice(0, 24) : '') + '.json';
  };

  /* この依頼を、今までどおり住所に詰めて送れるか。 */
  BIG.fits = function (o, fieldsText) {
    if (fieldsText.length > BIG.FIELDS_MAX) return false;
    var qs = 'callback=__x1234567890123&action=submit&key=' + encodeURIComponent(o.key || '')
      + '&op=' + encodeURIComponent(o.op || '')
      + '&who=' + encodeURIComponent(o.who || '')
      + '&role=' + encodeURIComponent(o.role || '')
      + '&device=' + encodeURIComponent(o.device || '')
      + '&fields=' + encodeURIComponent(fieldsText)
      + '&cb=1234567890123';
    return (String(o.exec || '').length + 1 + qs.length) <= BIG.URL_MAX;
  };

  /* 依頼の中身を、送れる形にして返す。大きければ先に別の入口へ預ける。 */
  BIG.prepare = function (o, onReady, onFail) {
    var fieldsText;
    try {
      fieldsText = JSON.stringify(o.fields || {});
    } catch (e) {
      (onFail || function () {})('依頼の中身を作れませんでした。');
      return;
    }
    if (BIG.fits(o, fieldsText)) { onReady(fieldsText); return; }

    var ticket = 'b' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    var name = BIG.parcelName(o.slot || o.device, o.tag);
    var url = String(o.exec) + '?action=push&key=' + encodeURIComponent(o.key || '')
      + '&name=' + encodeURIComponent(name);
    var body;
    try {
      body = JSON.stringify({ ticket: ticket, op: String(o.op || ''), fields: o.fields || {} });
    } catch (e2) {
      (onFail || function () {})('依頼の中身を作れませんでした。');
      return;
    }
    var done = false;
    var giveup = setTimeout(function () {
      if (done) return;
      done = true;
      (onFail || function () {})('大きい依頼を預けられませんでした（時間切れ）。');
    }, 90000);
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: body
    }).then(function (r) { return r.text(); }).then(function (t) {
      if (done) return;
      done = true; clearTimeout(giveup);
      var d = null;
      try { d = JSON.parse(t); } catch (e3) { d = null; }
      if (!d || !d.ok) {
        (onFail || function () {})('大きい依頼を預けられませんでした（'
          + ((d && d.error) || '返事がおかしい') + '）。');
        return;
      }
      onReady(JSON.stringify({ __big: { name: name, ticket: ticket } }));
    })['catch'](function (e4) {
      if (done) return;
      done = true; clearTimeout(giveup);
      (onFail || function () {})('大きい依頼を預けられませんでした（' + String(e4) + '）。');
    });
  };

  root.BIG = BIG;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
