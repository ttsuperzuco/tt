/* 前日お知らせの画面「出し入れの判断」＝パソコン版とスマホ版で共有する唯一の正本。
 *
 * ★まるちゃん決定（2026-08-24）：画面の判断は共通の1本だけが持ち、各画面は答えを当てはめるだけ。
 *   前日お知らせで**2か所に手書きされていた決まり**＝「最初から入っている日付＝翌営業日
 *   （定休の日曜・月曜は飛ばす）」。パソコン版は共通の `business_day.py` を見ていたのに、
 *   スマホ版は同じ決まりを自分で書いていた（＝定休日を変えたらスマホだけ古いまま残る）。
 *
 * 【この置き場の決まり】
 *  ・ここは**画面を触らない**（純粋な判断だけ）。「何を出す・どの日を入れる」を**答えで返す**。
 *  ・**定休日そのものは持たない**＝`共通\business_day.py`（Pythonの正本）から自動で作られる
 *    `お店の決まり_自動生成.js`（`SHOP`）に聞く。**この2つを手で書き写さない。**
 *  ・スマホ版へは `共通\画面\スマホへ配る.py` が写して配る。ズレは
 *    `共通\パソコン版とスマホ版のずれ点検.py` の⑤が見る。
 */
(function (root) {
  'use strict';
  var ZJ = {};

  /* ── ① 画面を開いた時に最初から入っている日付＝翌営業日 ──────────
     base＝きょう（省略可）。定休日は SHOP（お店の決まり）に聞く＝パソコン版と必ず同じ答え。 */
  ZJ.defaultDateISO = function (base) {
    var S = root.SHOP;
    if (S && typeof S.nextBusinessDayISO === "function") return S.nextBusinessDayISO(base);
    return "";      // お店の決まりが読めない時は空（画面は人に選ばせる＝勝手な日を入れない）
  };

  /* ── ② どのボタンを出すか ─────────────────────────────
     ★まるちゃん決定（2026-08-24）：スタッフにも社長にも**「全員分を作成」の1つだけ**を見せる。
       「未送信の分だけ作成」は**開発の時だけ**出す（試せる場所は残す）。
     返り：{ all:出すか, unsent:出すか, hint:下に出す一言 } */
  ZJ.optionsShown = function (isDev) {
    var dev = !!isDev;
    return {
      all: true,
      unsent: dev,
      hint: "日付を選んで、" + (dev ? "どちらかのボタン" : "ボタン") + "を押すとお知らせが作成されます。"
    };
  };

  /* ── ③ 作り終わったあとに出す一言 ───────────────────────
     d＝事務所パソコンの答え {ok, error, count, mode, generated_at, body_html}。
     返り：{ text:出す文, kind:"ok"/"err", showBody:中身を出すか } */
  ZJ.resultText = function (d) {
    if (!d || !d.body_html) {
      return (d && d.error)
        ? { text: "エラー：" + d.error, kind: "err", showBody: false }
        : { text: "この日は予約がありませんでした。", kind: "ok", showBody: false };
    }
    if (d.count === 0 && d.mode === "unsent") {
      return { text: "まだ送っていない人はいません（この日は全員へ送信済みです）。",
               kind: "ok", showBody: false };
    }
    return {
      text: "できました（" + ((d.count != null) ? d.count : "?") + "件"
            + ((d.mode === "unsent") ? "・まだ送っていない人の分だけ" : "") + "）／作成 "
            + (d.generated_at || ""),
      kind: "ok", showBody: true
    };
  };

  root.ZJ = ZJ;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));
