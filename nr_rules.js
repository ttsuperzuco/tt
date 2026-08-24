/* 新規予約入力の画面「出し入れの判断」＝パソコン版とスマホ版で共有する唯一の正本。
 *
 * ★まるちゃん決定（2026-08-24）：パソコン版とスマホ版の画面は同じにする。
 *   ところが中身は2か所に別々に手書きされていて、同じ日に3回もズレた
 *   （スマホが先にあきらめて止まる／⑤カウンセリング担当が二重に出る／
 *     「コスモスが埋まってます」が2か所に出る）。
 *   ★どれも「書いてある内容は同じだが順番が逆」で、文字を見比べる点検では見つからなかった。
 *   → **判断だけをこの1本にまとめ、パソコンもスマホも必ずここに聞く。**
 *
 * 【この置き場の決まり】
 *  ・ここは**画面を触らない**（純粋な判断だけ）。「何を出す・何を隠す・どれを選ぶ」を**答えで返す**。
 *    画面の作り（HTMLの組み立て・見た目・名前の付け方）は、パソコン版とスマホ版それぞれのままでよい。
 *  ・**判断を各画面に書き写さない。** 直す時はこのファイルだけを直す。
 *  ・正本＝`AI自動プログラム\共通\画面\新規予約入力_判断.js`。
 *    スマホ版へは `共通\画面\スマホへ配る.py` が同じ中身を写して配る（手で写さない）。
 *    写しがズレていないかは `共通\パソコン版とスマホ版のずれ点検.py` が見る。
 *
 * 呼び方＝どちらの画面からも `NR.〇〇(...)`。
 */
(function (root) {
  'use strict';
  var NR = {};

  /* ── ① 開始時間の文 ───────────────────────────────
     rvdt＝{mm,dd,hh,mi}／weekday＝"水" など。読めていなければ「―」。 */
  NR.startText = function (rvdt, weekday) {
    var d = rvdt;
    if (!d || d.mm == null) return "―";
    var wd = weekday ? ("（" + weekday + "）") : "";
    var mi = String(d.mi);
    if (mi.length < 2) mi = "0" + mi;
    return Number(d.mm) + "月" + Number(d.dd) + "日" + wd + " " +
           Number(d.hh) + "時" + mi + "分";
  };

  /* ── ② 枠が2つ以上か（＝枠ごとに選ぶ形か） ───────────── */
  NR.perSlot = function (slots) {
    return !!(slots && slots.length >= 2);
  };

  /* ── ③ カウンセリングの枠があるか ─────────────────── */
  NR.hasCounselSlot = function (slots) {
    var S = slots || [];
    for (var i = 0; i < S.length; i++) {
      if (S[i] && S[i].kind === "counsel") return true;
    }
    return false;
  };

  /* ── ④ ③カウンセリングの必要／⑤カウンセリング担当 の出し入れ ──────
     needCounsel＝この予約にカウンセリングが要るか／needcSel＝画面の選択（"no"なら要らない）。
     返り：{ needCSec:③の欄を出すか, counselSec:外の⑤を出すか,
             counselSlotShown:カウンセリングの枠を出すか, rebuildOrder:順番の欄を作り直すか }
     ★外の⑤は「カウンセリングの枠がある＝枠の中で選ぶ」時は**必ず出さない**（二重になるため）。 */
  NR.needCounselView = function (slots, needCounsel, needcSel) {
    var on = !!needCounsel && needcSel !== "no";
    var hasC = NR.hasCounselSlot(slots);
    return {
      needCSec: !!needCounsel,
      counselSec: hasC ? false : on,
      counselSlotShown: on,
      rebuildOrder: hasC
    };
  };

  /* ── ⑤ 「コスモスが埋まってます」の赤い知らせを、外（枠の外）に出すか ──
     ★2026-08-24 まるちゃん指摘の直しどころ。**枠の中に同じ知らせを出す形の時は、外には出さない**
       （出すと1つ目の枠の中と一番下の2か所に同じ物が出る）。
     ★以前スマホ版は、この判断のあとに「埋まり具合でまた出す」を書いていて打ち消していた。
       ここに1本化したので、順番を取り違えようがない。 */
  NR.cosmosWarnOutside = function (av, slots, needCounsel, needcSel) {
    if (NR.hasCounselSlot(slots)) return false;          // 枠の中に出すので外は出さない
    if (!needCounsel || needcSel === "no") return false;  // カウンセリングをやらない回は出さない
    return !!(av && av.cosmos_busy);
  };

  /* ── ⑥ 埋まっている物を選べなくする ────────────────────
     values＝並んでいる選択肢の値の並び／busy＝埋まっている値の並び／cur＝いま選んでいる値。
     返り：{ hidden:[出さない物はtrue], sel:選び直した値(変えないならcurのまま), none:選べる物が0か } */
  NR.hideBusy = function (values, busy, cur) {
    var V = (values || []).map(String);
    var B = (busy || []).map(String);
    var hidden = [], first = null;
    for (var i = 0; i < V.length; i++) {
      var isBusy = B.indexOf(V[i]) >= 0;
      hidden.push(isBusy);
      if (!isBusy && first === null) first = V[i];
    }
    var sel = String(cur == null ? "" : cur);
    var curIdx = V.indexOf(sel);
    // 選んでいた所が埋まったら、空いている先頭に選び直す
    if (curIdx >= 0 && hidden[curIdx] && first !== null) sel = first;
    return { hidden: hidden, sel: sel, none: (first === null) };
  };

  /* ── ⑥-2 「その時間は空いていません」の赤い字を出すか ──────────
     hiddenFlags＝並んでいる選択肢が「出していない」かどうかの並び。全部出していなければ true。 */
  NR.noneLeft = function (hiddenFlags) {
    var H = hiddenFlags || [];
    if (!H.length) return false;
    for (var i = 0; i < H.length; i++) {
      if (!H[i]) return false;
    }
    return true;
  };

  /* ── ⑦ デザイン眉・まつエクの時の見せ方 ──────────────────
     返り：{ pineOnly:担当をパインだけにするか, roomWrapShown:外の⑦部屋を出すか,
             forceStaff:担当を強制する値(無ければ null), clearRoom:部屋を空にするか,
             pickFirstFreeRoom:空いている先頭の部屋を選ぶか } */
  NR.mayuView = function (isMayu, isSat, slots) {
    var ps = NR.perSlot(slots);
    return {
      pineOnly: !!isMayu,
      roomWrapShown: ps ? false : (isMayu ? !!isSat : true),
      forceStaff: isMayu ? "5" : null,
      clearRoom: !!(isMayu && !isSat),
      pickFirstFreeRoom: !!(isMayu && isSat)
    };
  };

  /* ── ⑧ 枠ごとに選ぶ形の時、外の③所要時間・⑥施術担当・⑦部屋を出すか ── */
  NR.outerSectionsShown = function (slots) {
    var ps = NR.perSlot(slots);
    return { dur: !ps, staff: !ps, room: !ps };
  };

  /* ── ⑨ 枠ごとの担当の選択肢 ─────────────────────────
     all＝担当の全部（[値, 表示名, 色] の並び）。
     ★カウンセリングの枠＝トマト(1)・みかん(2)だけ。
     ★施術の枠＝パイン(5)は出さない（デザイン眉・まつエク専門で脱毛はやらないため）。
       ←パソコン版だけパインが出ていた食い違いを、ここでそろえた（2026-08-24）。 */
  NR.slotStaffChoices = function (all, isCounsel) {
    var out = [];
    for (var i = 0; i < (all || []).length; i++) {
      var v = String(all[i][0]);
      if (isCounsel) { if (v === "1" || v === "2") out.push(all[i]); }
      else if (v !== "5") out.push(all[i]);
    }
    return out;
  };

  /* ── ⑩ 枠の開始時刻の積み上げ ────────────────────────
     baseMin＝1つ目が始まる時刻（分）／durs＝枠ごとの分／needcSel＝"no"ならカウンセリングを飛ばす。
     返り：[{ i, startMin, dur, isCounsel, skip }]（skip=trueは作らない枠） */
  NR.slotStarts = function (slots, durs, baseMin, needcSel) {
    var S = slots || [], out = [], pos = Number(baseMin) || 0;
    for (var i = 0; i < S.length; i++) {
      var isC = (S[i] && S[i].kind === "counsel");
      var skip = !!(isC && needcSel === "no");
      var du = Number((durs || [])[i] || 30);
      out.push({ i: i, startMin: pos, dur: du, isCounsel: !!isC, skip: skip });
      if (!skip) pos += du;
    }
    return out;
  };

  /* ── ⑪ やる順番の欄 ───────────────────────────────
     返り：{ shown:欄を出すか, rows:[{no, name, canUp}] } */
  NR.orderRows = function (slots) {
    var S = slots || [];
    if (S.length < 2) return { shown: false, rows: [] };
    var rows = [];
    for (var i = 0; i < S.length; i++) {
      rows.push({ no: i + 1, name: (S[i].label || "施術"), canUp: i > 0 });
    }
    return { shown: true, rows: rows };
  };

  /* ── ⑪-2 登録してよいか（決まっていない枠があれば押させない） ──────
     ★まるちゃん決定（2026-08-24）：「カウンセリングと脱毛のどちらか、あるいは複数のサービスの
       どれかが**確定できない状態**のときは、登録ボタンが押せないようにする」。
       ＝登録の処理は空き具合をいっさい見ないので、押せてしまうと**同じ部屋に二重で予約が入る**。
     rows＝画面が集めた枠ごとの状態の並び：
       { name:枠の名前, locked:その時間は使えない(部屋がふさがっている等),
         staffOk:担当が決まっているか, roomNeeded:部屋が要るか, roomOk:部屋が決まっているか }
     checking＝**まだ空き具合の答えを待っている**（true の間は押させない）。
       ★これが要る理由＝枠ごとの空きは事務所パソコンに聞きに行くので数秒あとに届く。
         その間ボタンが押せると、ふさがっているのに登録できてしまう隙ができる（実測で起きた）。
     返り：{ ok:登録してよいか, ng:[{name, why}], msg:画面に出す1行 } */
  NR.canRegister = function (rows, checking) {
    if (checking) {
      return { ok: false, ng: [{ name: "", why: "確かめ中" }],
               msg: "空き具合を確かめています。少しお待ちください。" };
    }
    var R = rows || [], ng = [];
    for (var i = 0; i < R.length; i++) {
      var r = R[i] || {}, nm = r.name || ("枠" + (i + 1));
      if (r.locked) { ng.push({ name: nm, why: "その時間は部屋がふさがっています" }); continue; }
      if (!r.staffOk) { ng.push({ name: nm, why: "担当が決まっていません" }); continue; }
      if (r.roomNeeded && !r.roomOk) { ng.push({ name: nm, why: "部屋が決まっていません" }); }
    }
    var msg = "";
    if (ng.length) {
      var parts = [];
      for (var k = 0; k < ng.length; k++) parts.push(ng[k].name + "：" + ng[k].why);
      msg = "この内容では登録できません（" + parts.join("／") +
            "）。上の「開始時間」を変えるか、やる順番を変えてください。";
    }
    return { ok: (ng.length === 0), ng: ng, msg: msg };
  };

  /* ── ⑫ 順番の入れ替え（枠と、選んでいる中身を一緒に動かす） ─────
     picks＝[{dur,staff,room}...]（枠と同じ並び）。返り：{ slots, picks } */
  NR.moveUp = function (slots, picks, i) {
    var S = (slots || []).slice(), P = (picks || []).slice();
    if (i <= 0 || i >= S.length) return { slots: S, picks: P };
    var t = S[i - 1]; S[i - 1] = S[i]; S[i] = t;
    var u = P[i - 1]; P[i - 1] = P[i]; P[i] = u;
    for (var k = 0; k < S.length; k++) {
      if (!S[k] || !P[k]) continue;
      S[k].dur = P[k].dur; S[k].staff = P[k].staff; S[k].room = P[k].room;
    }
    return { slots: S, picks: P };
  };

  root.NR = NR;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));
