/* 「施術後の予約」の画面『出し入れの判断』＝パソコン版とスマホ版で共有する唯一の正本。
 *
 * ★まるちゃん決定（2026-08-24）：パソコン版とスマホ版の画面は同じにする。
 *   判断を2か所に手書きすると必ずズレる（実際に同じ日に3回ズレた）。
 *   → **判断だけをこの1本にまとめ、パソコンもスマホも必ずここに聞く。**
 *
 * 【この画面は何のためか】（まるちゃん 2026-09-11）
 *   施術が終わったあと、施術者がその場でそのお客様の次回の予約を入れるための入口。
 *   担当を選ぶのは「その担当の予約（＝お客様）をしぼりこむため」。お客様の予約のための機能。
 *
 * 【担当を選ぶ画面の決まり】（まるちゃん 2026-09-11）
 *   ・ボタンは「マーク＋呼び方」（🍅トマト など）。
 *   ・**施術時間順**に並ぶ（いま施術中の担当がいちばん上）。
 *   ・**いまの施術がはじめから選ばれている**。
 *   ・**自分のスマホ（施術者本人）なら、その施術者がいちばん上で、はじめから選ばれている。**
 *   ・**いちばん下は「全施術者」**（＝すべての施術者という意味）。
 *
 * 【この置き場の決まり】
 *  ・ここは**画面を触らない**（純粋な判断だけ）。「何を出す・どれを選ぶ・どう並べる」を答えで返す。
 *  ・**判断を各画面に書き写さない。** 直す時はこのファイルだけを直す。
 *  ・正本＝`AI自動プログラム\共通\画面\施術後の予約_判断.js`。
 *    スマホ版へは `共通\画面\スマホへ配る.py` が写して配る（手で写さない）。
 *
 * 呼び方＝どちらの画面からも `SG.〇〇(...)`。
 */
(function (root) {
  'use strict';
  var SG = {};

  /* ── 施術者の一覧（マーク→呼び方）。`共通\config.py` の STAFF と同じ中身 ──────
     ★ここを増やす時は config.py の STAFF も必ず一緒に直す（施術者は5人）。 */
  SG.STAFF = [
    { mark: '🍅', name: 'トマト' },
    { mark: '🍊', name: 'みかん' },
    { mark: '🫒', name: 'オリーブ' },
    { mark: '🥭', name: 'マンゴー' },
    { mark: '🍍', name: 'パイン' }
  ];

  /* 「全施術者」を表す合い言葉（どの担当でもない、という意味の値）。 */
  SG.ALL = 'ALL';

  /* ── スマホで選んだ名前 → 施術者のマーク ─────────────────
     施術者でない名前（🍎りんご・🥥ココナッツ・お店受付PC・お店スマホ）は '' を返す。
     ＝'' の時が「施術者じゃないスマホ」＝いま施術中の担当がはじめから選ばれる側。 */
  SG.WHO_TO_MARK = {
    kanbu: '🍅',      /* 🍅トマト */
    mikan: '🍊',      /* 🍊みかん */
    olive: '🫒',      /* 🫒オリーブ */
    mango: '🥭',      /* 🥭マンゴー */
    pine:  '🍍'       /* 🍍パイン */
  };
  SG.markOfWho = function (who) {
    return (who && SG.WHO_TO_MARK[who]) ? SG.WHO_TO_MARK[who] : '';
  };

  SG.nameOfMark = function (mark) {
    for (var i = 0; i < SG.STAFF.length; i++) {
      if (SG.STAFF[i].mark === mark) return SG.STAFF[i].name;
    }
    return '';
  };
  SG.labelOfMark = function (mark) {
    if (mark === SG.ALL) return '全施術者';
    var n = SG.nameOfMark(mark);
    return n ? (mark + n) : mark;
  };

  /* ── 担当ごとの「代表の予約」がどの段階か ──────────────────
     0＝いま施術中／1＝これから／2＝今日はもう終わった。
     この段階の順、同じ段階なら施術の時間が早い順に並べる。 */
  function bucketOf(b, nowMs) {
    if (b.start <= nowMs && nowMs < b.end) return 0;   /* いま施術中 */
    if (b.start > nowMs) return 1;                     /* これから */
    return 2;                                          /* もう終わった */
  }

  /* ── ★本体：担当ボタンの並びと、はじめから選ばれる担当を決める ──────────
     bookings … 今日の予約の配列 [{ mark, start, end }]（start/end はミリ秒）。
                 うちの施術者でない印（🥝など）は呼ぶ側で外しておく。
     who      … このスマホで選んでいる名前（'mikan' など）。無ければ ''。
     nowMs    … いまの時刻（ミリ秒）。
     返り     … { list:[{mark,name,label,count,bucket,start,mine}], selected:'マーク' }
                 list の最後に「全施術者」は入れない（画面がいちばん下に足す）。 */
  SG.staffOrder = function (bookings, who, nowMs) {
    var now = nowMs || Date.now();
    var myMark = SG.markOfWho(who);

    /* 担当ごとにまとめる（施術者5人以外の印は捨てる）。 */
    var byMark = {};
    var list = bookings || [];
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      if (!b || !b.mark) continue;
      if (!SG.nameOfMark(b.mark)) continue;            /* うちの施術者でない印は出さない */
      if (!byMark[b.mark]) byMark[b.mark] = [];
      byMark[b.mark].push({ start: Number(b.start) || 0, end: Number(b.end) || 0 });
    }

    var rows = [];
    for (var mark in byMark) {
      if (!Object.prototype.hasOwnProperty.call(byMark, mark)) continue;
      var arr = byMark[mark];
      arr.sort(function (x, y) { return x.start - y.start; });
      /* 代表の予約＝いま施術中の物。無ければ次に始まる物。無ければ最後にやった物。 */
      var rep = null;
      for (var j = 0; j < arr.length; j++) {
        if (bucketOf(arr[j], now) === 0) { rep = arr[j]; break; }
      }
      if (!rep) {
        for (var k = 0; k < arr.length; k++) {
          if (arr[k].start > now) { rep = arr[k]; break; }
        }
      }
      if (!rep) rep = arr[arr.length - 1];
      rows.push({
        mark: mark,
        name: SG.nameOfMark(mark),
        label: SG.labelOfMark(mark),
        count: arr.length,
        bucket: bucketOf(rep, now),
        start: rep.start,
        mine: (mark === myMark)
      });
    }

    /* 並び＝①自分のスマホなら自分がいちばん上 ②いま施術中→これから→終わった
             ③同じ段階なら施術の時間が早い順 */
    rows.sort(function (a, b2) {
      if (a.mine !== b2.mine) return a.mine ? -1 : 1;
      if (a.bucket !== b2.bucket) return a.bucket - b2.bucket;
      if (a.start !== b2.start) return a.start - b2.start;
      return a.mark < b2.mark ? -1 : 1;
    });

    /* はじめから選ばれる担当＝自分のスマホなら自分。そうでなければいちばん上（＝いまの施術）。
       今日ひとつも予約が無ければ「全施術者」。 */
    var selected = SG.ALL;
    if (rows.length) selected = rows[0].mark;
    return { list: rows, selected: selected };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SG;
  root.SG = SG;
})(typeof window !== 'undefined' ? window : this);
