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

  /* ■2026-09-30 まるちゃん決定：**返す向きの別便を、どの画面でも受け取れるようにする**
   *   2026-09-23 から、事務所パソコンは長すぎる答え（約8,000文字超）を置き場に別に置き、
   *   答えには「置いた場所（__bigres）」だけを書いて返している（受付係の _report_result）。
   *   ところが、それを取りに行けるのは前日お知らせの画面だけで、ほかの画面は中身が空のまま
   *   扱っていた。実例＝予約変更の画面で M346 林子淇様（予約メモが長い）を探すと
   *   「この番号の予約が見つかりません」と出た。今後予約のある147人中76人が同じだった。
   *   → 画面ごとに直すのをやめ、**「結果を聞く」依頼の返事をここ1か所で受け止め、
   *     別便なら取りに行って、本物の答えに差し替えてから各画面へ渡す**。
   *     各画面は何も知らなくてよい（今ある三十数か所にも、これから作る画面にも効く）。
   *   ・取りに行った荷物の番号が、聞いた依頼の番号と違う時は古い荷物＝使わない（失敗として渡す）。
   *   ・取りに行けなかった時は、黙って空にせず「もう一度お試しください」を失敗として渡す。 */
  BIG.RES_FAIL = '答えを読み込めませんでした。もう一度お試しください。';

  function _param(src, key) {
    var m = String(src).match(new RegExp('[?&]' + key + '=([^&]*)'));
    if (!m) return '';
    try { return decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch (e) { return m[1]; }
  }

  function _copy(r) {
    var o = {};
    for (var k in r) { if (Object.prototype.hasOwnProperty.call(r, k)) o[k] = r[k]; }
    return o;
  }

  var _append = null;      // 元の appendChild（取りに行く時は、この仕掛けを通さずに足す）

  BIG.fetchBigres = function (exec, name, onOk, onFail) {
    var cb = '__bigres' + Date.now() + Math.floor(Math.random() * 100000);
    var el = document.createElement('script');
    var finished = false;
    var giveup = setTimeout(function () {
      if (finished) return;
      finished = true;
      try { delete root[cb]; } catch (e) { root[cb] = undefined; }
      onFail();
    }, 30000);
    root[cb] = function (x) {
      if (finished) return;
      finished = true; clearTimeout(giveup);
      try { delete root[cb]; } catch (e) { root[cb] = undefined; }
      try { el.parentNode && el.parentNode.removeChild(el); } catch (e2) {}
      if (!x || typeof x.result !== 'string') { onFail(); return; }
      onOk(x);
    };
    el.src = String(exec) + '?callback=' + cb + '&action=data&name=' + encodeURIComponent(name)
      + '&cb=' + Date.now();
    el.onerror = function () {
      if (finished) return;
      finished = true; clearTimeout(giveup);
      onFail();
    };
    (_append || Node.prototype.appendChild).call(document.head || document.documentElement, el);
  };

  /* 「結果を聞く」依頼（action=status）の返事の受け手を、差し替え付きの受け手で包む。 */
  function _wrapStatus(el) {
    try {
      if (!el || el.tagName !== 'SCRIPT') return;
      var src = String(el.src || '');
      if (src.indexOf('action=status') < 0) return;
      var cbName = _param(src, 'callback');
      if (!cbName || typeof root[cbName] !== 'function' || root[cbName].__bigWrapped) return;
      var orig = root[cbName];
      var askId = _param(src, 'id');
      var exec = src.split('?')[0];
      var wrapped = function (r) {
        var self = this;
        var d = null;
        if (r && r.status === 'done' && typeof r.result === 'string'
            && r.result.indexOf('__bigres') >= 0) {
          try { d = JSON.parse(r.result); } catch (e) { d = null; }
        }
        if (!d || !d.__bigres) { return orig.apply(self, arguments); }
        var fail = function () {
          var r2 = _copy(r); r2.status = 'error'; r2.result = BIG.RES_FAIL;
          orig.call(self, r2);
        };
        BIG.fetchBigres(exec, d.__bigres, function (x) {
          var want = String(d.id || askId || '');
          if (want && x.id && String(x.id) !== want) { fail(); return; }   // 古い荷物は使わない
          var r2 = _copy(r); r2.result = x.result;
          orig.call(self, r2);
        }, fail);
      };
      wrapped.__bigWrapped = true;
      root[cbName] = wrapped;
    } catch (e) { /* 包めなくても今までどおり動く（何もしない） */ }
  }

  if (typeof Node !== 'undefined' && Node.prototype && !Node.prototype.__bigHooked) {
    _append = Node.prototype.appendChild;
    var _insert = Node.prototype.insertBefore;
    Node.prototype.appendChild = function (el) { _wrapStatus(el); return _append.apply(this, arguments); };
    Node.prototype.insertBefore = function (el) { _wrapStatus(el); return _insert.apply(this, arguments); };
    Node.prototype.__bigHooked = true;
  }

  root.BIG = BIG;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
