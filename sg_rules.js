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
 *   ・★**受付の端末（お店受付PC・お店スマホ）では、はじめから選ばれる担当は無し**（2026-11-07 まるちゃん）。
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

  /* ── 施術後の予約に出す施術者の一覧（マーク→呼び方）──────────────
     ★🍍パインは出さない（2026-09-12 まるちゃん決定）。
       理由＝パインの予約はパイン専用の予定表に入り、予約メモがお店の予約メモの「写し」になる。
       写しは日がたつほど食い違う（実データ15人で確かめた＝同じ日は一致、離れると59〜97%）。
       この画面は「今日の予約メモを写して次回に入れる」仕組みなので、
       写しの写しを増やすことになり、食い違いが広がる。だから当面は出さない。
     ★出勤の並びや部屋の決まりは今までどおり（この一覧は施術後の予約の画面だけの物）。 */
  SG.STAFF = [
    { mark: '🍅', name: 'トマト' },
    { mark: '🍊', name: 'みかん' },
    { mark: '🫒', name: 'オリーブ' },
    /* ★2026-10-07 🥭を外した → ★2026-11-11 まるちゃん「マンゴーが復帰した」＝🥭を戻した。 */
    { mark: '🥭', name: 'マンゴー' }
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
    mango: '🥭'       /* 🥭マンゴー（2026-10-07に外し、2026-11-11の復帰で戻した） */
    /* ★🍍パインは上の一覧から外したので、ここにも入れない（入れると名前だけ出て中身が空になる）。 */
  };
  SG.markOfWho = function (who) {
    return (who && SG.WHO_TO_MARK[who]) ? SG.WHO_TO_MARK[who] : '';
  };

  /* ── ★受付の端末（お店受付PC・お店スマホ）（2026-11-07 まるちゃん決定）──────────
     受付は施術者に頼まれて代わりに予約を入れるだけ＝「いまの施術者」も「自分」も無い。
     まるちゃん「受付からしたら全部同じなんだから、オレンジの枠やすき間はかえってわかりにくい」
     ＝受付の端末では**はじめから選ぶ担当を作らない**（枠もすき間も出ない・全員同じ形で縦に並ぶ）。
     施術者本人のスマホ・社長版・開発版は今までどおり。 */
  SG.RECEPTION_WHO = { reception: true, reception_sp: true };
  SG.isReception = function (who) {
    return !!(who && SG.RECEPTION_WHO[who] === true);
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

  /* ── ★カウンセリングの枠を出すか出さないか（まるちゃん 2026-09-11）──────────
     「予約する」＝**前の予約メモをコピーして、予約日のタイムツリーに入れる**こと。
     ・新規の予約で**カウンセリングと施術の両方**がある日
         → カウンセリングの予約メモはコピーしないので、**カウンセリングの枠は出さない**。
     ・**カウンセリングしかない**日（その日は施術をしない）
         → カウンセリングのをコピーするので、**カウンセリングの枠を出す**。

     見分け方（実データ2026-06-01〜09-11で確かめた）：
     ・カウンセリングの部屋は**コスモス**（`共通\config.py` の COSMOS／新規の予約を作る所も
       `COUNSELING_ROOM_KEY="COSMOS"`）。
     ・ただし**コスモスで施術をする回もある**（パリジェンヌ80分・プロセル90分の実例2件）。
       施術の印（🇫🇷🍯🌿👑福:）が付いている枠は施術なので、カウンセリング扱いにしない。
     ・同じお客様かどうかは**通し番号が同じ**（どちらかに番号があればそれで見る）。
       番号がまだ無い新規の方は、印と担当の絵文字を外した**題名の残りが同じ**かで見る
       （題名の後ろの書き足し「サマカ」「※〜と来店」で外れないよう、番号を先に見る）。
     ・結果＝コスモスの74枠のうち、印なしの72枠を判定して「出さない65／出す7」。
       出す7つは全部ほんとうに相談だけの日（うち3つは題名にも「カウンセリングのみ」と書いてある）。 */
  /* ★部屋の名前は「入れ物（カレンダー）の名前」ではなく**色（ラベル）から出した部屋名**を渡すこと。
     （被り検出と同じ＝`roomLabelOf` ＋ `ALL_ROOM_LABELS`。入れ物と色が食い違う予約が
       2026-06-01以降で1,018件中72件＝7%ある。まるちゃん指摘 2026-09-11「tt🍅カレンダーってなに？
       部屋じゃないよね？」で分かった。） */
  SG.COUNSEL_ROOM = 'COSMOS';                       /* 色から出した部屋名（コスモス） */
  SG.TREAT_MARKS = ['🇫🇷', '🍯', '🌿', '👑', '福:'];  /* 施術の印（付いていたら施術） */

  function hasTreatMark(title) {
    var t = title || '';
    for (var i = 0; i < SG.TREAT_MARKS.length; i++) {
      if (t.indexOf(SG.TREAT_MARKS[i]) >= 0) return true;
    }
    return false;
  }
  /* コスモスで、施術の印が付いていない枠＝カウンセリング。 */
  SG.isCounseling = function (ev) {
    if (!ev) return false;
    if ((ev.room || '') !== SG.COUNSEL_ROOM) return false;
    return !hasTreatMark(ev.title);
  };

  var CODE_RE = /([MF])0*(\d{1,3})/;
  var HEAD_RE = /^\s*([☀-➿\u{1F300}-\u{1FAFF}]️?)/u;
  SG.codeOfTitle = function (title) {
    var m = (title || '').match(CODE_RE);
    return m ? (m[1] + String(parseInt(m[2], 10))) : '';
  };
  /* 印と担当の絵文字を外した題名（番号が無い新規の方を見分けるため）。 */
  SG.bareTitle = function (title) {
    var s = (title || '').replace(HEAD_RE, '').replace(HEAD_RE, '');
    for (var i = 0; i < SG.TREAT_MARKS.length; i++) s = s.split(SG.TREAT_MARKS[i]).join('');
    s = s.split('🪒').join('');
    return s.replace(/\s/g, '');
  };
  SG.samePerson = function (a, b) {
    var ca = SG.codeOfTitle(a), cb = SG.codeOfTitle(b);
    if (ca || cb) return !!ca && ca === cb;
    return SG.bareTitle(a) === SG.bareTitle(b);
  };

  /* ★本体：その日の予約から「画面に出す分」だけ返す。
     ev … { mark, start, end, title, room, ... }（同じ1日ぶん）。 */
  /* ★お客様の予約か（2026-09-17 まるちゃん「お名前なし？」）。
     題名に「預約」か「予約」がある物だけがお客様の予約（お店の決まり＝部屋の空き判定・被り検出と同じ字の見方）。
     講座・会議・部屋を借りた「使用」などは出さない（13:00〜15:00「🍅シミ取りメニュー導入講座zoom」が
     お客様として「お名前なし」で出ていた）。 */
  /* ★📝の付いた予定はお店の用事（2026-10-30 まるちゃんの画面で「🍊📝今週の予約可能枠の案内配信」が
       お客様として「一斉配信」と出ていた＝題名の「予約可能枠」の字に引っかかった）。
       全期間の予定で📝付きは12件、全部お店の用事（棚卸し・休み・一斉配信）でお客様の予約は0件。 */
  SG.isBooking = function (title) {
    var t = String(title || '');
    if (t.indexOf('📝') !== -1) return false;
    return t.indexOf('預約') !== -1 || t.indexOf('予約') !== -1;
  };

  SG.visibleBookings = function (dayEvents) {
    var all = [];
    for (var a = 0; a < (dayEvents || []).length; a++) {
      if (SG.isBooking(dayEvents[a].title)) all.push(dayEvents[a]);
    }
    var out = [];
    for (var i = 0; i < all.length; i++) {
      var e = all[i];
      if (!SG.isCounseling(e)) { out.push(e); continue; }
      var hasTreat = false;
      for (var j = 0; j < all.length; j++) {
        var o = all[j];
        if (o === e) continue;
        if ((o.room || '') === SG.COUNSEL_ROOM) continue;   /* 相手は施術の枠だけ */
        if (SG.samePerson(e.title, o.title)) { hasTreat = true; break; }
      }
      if (!hasTreat) out.push(e);      /* 相談だけの日＝出す */
    }
    return out;
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
             ③同じ段階なら施術の時間が早い順。
       ★ただし「終わった」だけは**遅い順**＝いちばん最近終わった施術者がいちばん上
         （まるちゃん 2026-09-12。お客様の一覧が「時間が過ぎていたら1個前を出す」のと同じ考え。
          夕方に開いた時、朝いちばんに終わった施術者が先頭に来るのはおかしい）。 */
    rows.sort(function (a, b2) {
      if (a.mine !== b2.mine) return a.mine ? -1 : 1;
      if (a.bucket !== b2.bucket) return a.bucket - b2.bucket;
      if (a.start !== b2.start) return (a.bucket === 2) ? (b2.start - a.start) : (a.start - b2.start);
      return a.mark < b2.mark ? -1 : 1;
    });

    /* はじめから選ばれる担当＝自分のスマホなら自分。そうでなければいちばん上（＝いまの施術）。
       今日ひとつも予約が無ければ「全施術者」。 */
    var selected = SG.ALL;
    if (rows.length) selected = rows[0].mark;
    /* ★受付の端末は、はじめから選ぶ担当を作らない（''＝どれにも枠もすき間も付かない・2026-11-07）。 */
    if (SG.isReception(who)) selected = '';
    return { list: rows, selected: selected };
  };

  /* ── ★🔁（次が最終回の時の「お知らせのおすすめ」）の入れ方（まるちゃん 2026-10-06）──────────
     予約メモの修正（7枚目）の確定のあと、次が最終回の施術がある時だけ🔁の画面（8枚目）を出す。
     ・どの施術が「次が最終回」かは事務所パソコンが決めて渡す（共通\kaeshi_target.py）＝ここでは決めない。
       渡ってくるのは施術の行の文字（head＝◉を外した行）だけ。
     ・ここが決めるのは「今のメモ欄のどこに🔁の行を入れるか」だけ。
       ★人が7枚目でメモを直していてもよいように、**今の欄の中身**から施術の行を探す（直しを消さない）。
       ★入れる場所＝その施術のかたまり（◉の行＋折り返しの回数・値段・※の行）のすぐ下。
         折り返しの行の途中に入れると、値段の行（@1600 等）が施術から切り離されるため。
       ★すぐ下に🔁の行がもうあれば入れ替える（2行にしない）。
     ・ボタンの言葉はスタッフに配った🔁の書き方そのまま（骨格ルール「🔁の書き方」の正本）。
       「キャンペーン」は脱毛で効き目が無いので出さない（2026-10-06 まるちゃん決定）。
       セットの行も部位ごとに分けない（セットに都度が1つでも混ざるとセット全体が都度扱いのため）。 */
  SG.KAESHI_MARK = '🔁';
  /* 古い画面（2026-11-09より前の施術後の予約）用。新しい画面は下の SG.KAESHI_BTNS を使う。 */
  SG.KAESHI_OPTS = [
    ['5回おまとめ', 'お5回'], ['8回おまとめ', 'お8回'], ['5回も8回も', 'お5回8回'],
    ['都度', '都度'], ['なし', 'なし']
  ];
  /* ★2026-11-09 まるちゃん決定（「全部OK」）：ボタンは「5回おまとめ・8回おまとめ・都度・なし」の4つ。「5回も8回も」はなくす。
     ・5回と8回は両方押せる（複数選択）。両方押す＝「お5回8回」（今までの「5回も8回も」と同じ行）。
     ・5回か8回を押すと、都度にも自動で印が付く（お知らせは1回の値段をいつも一緒に出すため＝画面とお知らせを一致させる。
       2026-09-15の決まり「都度と回数を一緒に書けば両方出す」・手書き110行のうち4行が「都度、お5回」）。
     ・都度だけを押す＝1回の値段だけ（5回・8回の印は外れる）。なし＝ほかの印は全部外れる。
     ・予約メモに入る🔁の行の書き方は今のまま（お5回／お8回／お5回8回／都度／なし）＝お知らせの仕組みは触らない。
     cur＝今の答え（上の行の書き方・未選択は ''）。 */
  SG.KAESHI_BTNS = [['5回おまとめ', '5'], ['8回おまとめ', '8'], ['都度', '都度'], ['なし', 'なし']];
  SG.kaeshiOn = function (cur, key) {
    var c = String(cur || '');
    if (key === '5') return c.indexOf('お5回') === 0;
    if (key === '8') return c === 'お8回' || c === 'お5回8回';
    if (key === '都度') return c === '都度' || c.indexOf('お') === 0;
    if (key === 'なし') return c === 'なし';
    return false;
  };
  SG.kaeshiToggle = function (cur, key) {
    var c = String(cur || '');
    if (key === '5' || key === '8') {
      var f5 = SG.kaeshiOn(c, '5'), f8 = SG.kaeshiOn(c, '8');
      if (key === '5') f5 = !f5; else f8 = !f8;
      return f5 && f8 ? 'お5回8回' : (f5 ? 'お5回' : (f8 ? 'お8回' : ''));
    }
    if (key === '都度') return c === '都度' ? '' : '都度';
    if (key === 'なし') return c === 'なし' ? '' : 'なし';
    return c;
  };
  /* かたまりの切れ目になる行の頭（次の施術・申し送り・欄の見出し・空行） */
  var KS_STOP = ['◉', '●', '⚫', '🔁', '⭐', '💰', '⚠', '🆕'];
  function ksIsStop(s) {
    var t = String(s || '').replace(/^\s+/, '');
    if (!t) return true;
    for (var i = 0; i < KS_STOP.length; i++) if (t.indexOf(KS_STOP[i]) === 0) return true;
    return false;
  }
  function ksBare(s) {
    return String(s || '').replace(/^\s*[◉●⚫][︎️]?\s*/, '').replace(/\s+/g, '');
  }
  /* 今の欄の中で、その施術の◉の行が何行目か（見つからなければ -1）。 */
  SG.kaeshiFind = function (lines, t) {
    var want = ksBare(t && t.head);
    if (!want) return -1;
    var i;
    for (i = 0; i < lines.length; i++) if (ksBare(lines[i]) === want) return i;
    var pre = want.slice(0, 12);
    for (i = 0; i < lines.length; i++) {
      if (/^\s*[◉●⚫]/.test(lines[i]) && ksBare(lines[i]).indexOf(pre) === 0) return i;
    }
    return -1;
  };
  /* その施術のかたまりの最後の行（ここのすぐ下に🔁を入れる） */
  function ksBlockEnd(lines, i) {
    var j = i;
    while (j + 1 < lines.length && !ksIsStop(lines[j + 1])) j++;
    return j;
  }
  /* 今の欄で、その施術のすぐ下にある🔁の行。null＝施術の行が見つからない／''＝まだ無い。 */
  SG.kaeshiLineOf = function (text, t) {
    var L = String(text || '').replace(/\r\n/g, '\n').split('\n');
    var i = SG.kaeshiFind(L, t);
    if (i < 0) return null;
    var e = ksBlockEnd(L, i);
    var nx = L[e + 1];
    return (nx && nx.replace(/^\s+/, '').indexOf(SG.KAESHI_MARK) === 0) ? nx.trim() : '';
  };
  /* 1行に部位が2つ以上ある施術（t.parts＝[{code,word}]・事務所パソコンが読み戻しを確かめた言葉）だけ部位を返す。 */
  SG.kaeshiParts = function (t) {
    var p = (t && t.parts) || [];
    return p.length >= 2 ? p : [];
  };
  /* ★2026-10-07 まるちゃん（セットの選び方）：1行に部位が2つ以上ある施術は、まず
       【全部位が同じおすすめ】【部位によっておすすめが違う】の2つから選ぶ。
       ・同じ＝答えを1つ（5回／8回／5回も8回も／都度／なし）→「🔁お5回🍊」
       ・違う＝部位ごとに答えを選ぶ（なしも選べる＝やめる部位をわざわざ言わない）→「🔁VIOお5回　髭なし🍊」
         ★部位ごとに選んでも全部同じ答えなら「同じ」と同じ行にする。
     pick＝{mode:'same', all:答え} か {mode:'diff', each:{言葉:答え}}。全部そろわない時は ''。 */
  SG.kaeshiSetLine = function (t, pick, mark) {
    var ps = SG.kaeshiParts(t), pk = pick || {};
    if (!ps.length || pk.mode !== 'diff') return pk.all ? SG.KAESHI_MARK + pk.all + (mark || '') : '';
    var each = pk.each || {}, seg = [], first = null, same = true;
    for (var i = 0; i < ps.length; i++) {
      var v = each[ps[i].word];
      if (!v) return '';
      if (first === null) first = v; else if (v !== first) same = false;
      seg.push(ps[i].word + v);
    }
    return SG.KAESHI_MARK + (same ? first : seg.join('　')) + (mark || '');
  };
  /* その施術のすぐ下の🔁の行を消す（選び直しで答えがそろわなくなった時）。 */
  SG.kaeshiRemove = function (text, t) {
    var L = String(text || '').replace(/\r\n/g, '\n').split('\n');
    var i = SG.kaeshiFind(L, t);
    if (i < 0) return String(text || '');
    var e = ksBlockEnd(L, i), nx = L[e + 1];
    if (nx && nx.replace(/^\s+/, '').indexOf(SG.KAESHI_MARK) === 0) L.splice(e + 1, 1);
    return L.join('\n');
  };
  /* 組んだ🔁の行を、その施術のかたまりのすぐ下に入れる（すぐ下に🔁があれば入れ替える）。 */
  SG.kaeshiPutLine = function (text, t, line) {
    var L = String(text || '').replace(/\r\n/g, '\n').split('\n');
    var i = SG.kaeshiFind(L, t);
    if (i < 0 || !line) return String(text || '');
    var e = ksBlockEnd(L, i);
    var nx = L[e + 1];
    if (nx && nx.replace(/^\s+/, '').indexOf(SG.KAESHI_MARK) === 0) L[e + 1] = line;
    else L.splice(e + 1, 0, line);
    return L.join('\n');
  };
  /* まだ🔁が入っていない施術の数（★施術の行が見つからない物は数えない＝人が消した施術で止めない）。 */
  SG.kaeshiMissing = function (text, targets) {
    var n = 0;
    for (var k = 0; k < (targets || []).length; k++) if (SG.kaeshiLineOf(text, targets[k]) === '') n++;
    return n;
  };

  /* ── ★「本日イーライトをやりましたか？」を聞くか（2026-10-30 まるちゃん依頼・社長決定）──────────
     イーライトをする部位＝男女：VIO・脇・全身／男性だけ：髭・胸（全身＝両脇・腕・足・胸腹・背中＝脇を含む）。
     予約の題名に「イーライト」と書いていなくても当日イーライトになることがある（Wakoさん）ので、題名では決めない。
     ・見る所＝今日の予約メモの「⭐️現在進行中」の◉の行（今日やる施術）。無い時はメモ全体。
     ・男女＝題名の番号の頭（M＝男性）か「預約M」（番号がまだ無い新規）。
     返す物＝{ask:聞くか, parts:[当たった部位], male:男性か}。 */
  /* ★2026-11-01 まるちゃん「足す」：VIOの一部だけの書き方（「◉VI@2400」M36様・「へそ周IO」M151様）もVIOとして読む。
     男性は へそ・腹・乳輪 も聞く（9〜10月にイーライトの画像を送った87日で、部位の言葉が無かった3日はVI・IO・へそだった。
     過去の記録でも胸＋腹（M190・M233・M340様）・乳輪＋へそ（M248様）でイーライトをしていた。全部男性）。
     Oだけ・胸だけ・腹だけでイーライトをした日は過去の記録に無かった。 */
  /* ★同日まるちゃん「VIOはVIOの一部も含める　VI、IO、O、VBO、VBなどすべて」＝VIOの画像の仲間。
     ほかの部位（髭・脇・胸・腹・乳輪・へそ・全身）は一般の画像の仲間。
     女性は脇・全身だけ（過去の記録で女性の胸・腹・乳輪・へそにイーライトをした日は無かった。脇は90日以上ある）。 */
  var EL_COMMON = [['VIO', /VIO|ＶＩＯ|VBO|V[\s・,、+＋]*I[\s・,、+＋]*O|(^|[^A-Za-zＡ-Ｚ])(VI|IO|VO|VB|V|O|Ｖ|Ｏ)([^A-Za-zＡ-Ｚ]|$)|[VIO]ライン|チャ4|チャレンジ4|チャフォー|私密|比基尼/i],
                   ['脇', /脇|ワキ|わき|腋/], ['全身', /全身/]];
  var EL_MALE = [['髭', /髭|鬚|ひげ|ヒゲ|鬍/], ['胸', /胸/], ['腹', /腹/], ['へそ', /へそ|ヘソ|臍/], ['乳輪', /乳輪|乳頭/]];
  /* ★プラン（平日A〜D・学生・夏夏・ピカピカ・メンズキャ等）は、お客様ごとに部位を選ぶ組み合わせ
     （予約台帳で同じ「平日Bプラン」でも中身が人によって違う）＝プラン名だけでは脇・VIOが入るか決まらない。
     聞きすぎても施術者が「いいえ」を押すだけ・聞き漏らすとお知らせが届かないので、部位の書いていない
     脱毛のプランの行がある時は「聞く」側に倒す。プロセル・ハイドラ・マツヤニ・パリジェンヌ等の行は除く。 */
  var EL_PLAN = /プラン|ピカ|夏夏|学生|平日|メンズキャ|コース|おまとめ/;
  var EL_NOT_HAIR = /プロセル|プロ肌|プロ頭|ハイドラ|マツヤニ|🍯|パリ|👑|よもぎ|眉|まつ|ネイル|💅|数秘|🔮/;
  function elToday(note) {
    var L = String(note || '').replace(/\r\n/g, '\n').split('\n'), out = [], on = false;
    for (var i = 0; i < L.length; i++) {
      var t = L[i].replace(/^\s+/, '');
      if (t.indexOf('⭐') === 0) { on = true; continue; }
      if (on && (t.indexOf('💰') === 0 || t.indexOf('☑') === 0)) break;
      if (on && /^[◉●⚫]/.test(t)) out.push(t);
    }
    return out.length ? out.join('\n') : String(note || '');
  }
  SG.elightAsk = function (title, note) {
    var tt = String(title || '');
    var code = (tt.match(/([MF])\d{2,4}/) || [])[1] || (/預約\s*M/.test(tt) ? 'M' : '');
    /* 題名にだけ部位が書いてある予約（「脚、VIOイーライト脱毛」等）もあるので、題名も一緒に見る。 */
    var male = code === 'M', body = elToday(note) + '\n' + tt, hit = [];
    var rules = male ? EL_COMMON.concat(EL_MALE) : EL_COMMON;
    for (var i = 0; i < rules.length; i++) if (rules[i][1].test(body)) hit.push(rules[i][0]);
    if (!hit.length) {
      var lines = body.split('\n');
      for (var j = 0; j < lines.length; j++) {
        if (EL_PLAN.test(lines[j]) && !EL_NOT_HAIR.test(lines[j])) { hit.push('プラン（部位の書き無し）'); break; }
      }
    }
    return { ask: hit.length > 0, parts: hit, male: male };
  };

  /* ── ★今日パリジェンヌ／顔プロセル／頭皮プロセルをやる予約か（2026-11-01 まるちゃん決定＝予約メモで読む）──
     決め手は今日の予約メモの「⭐️現在進行中」の◉の行（前日お知らせを送る前に、次回の施術内容を毎回きちんと直しているため）。
     9〜10月の来店368日で、スタッフが注意事項を送った日（パリ11・プロセル5）は全部この行にあった。
     予約タイトルの印（🇫🇷・PF・PH）は付け忘れがある（F430様 9/16＝メモに「◉🇫🇷パリジェンヌリペア:あり」・タイトルに🇫🇷なし）。
     ・「なし」と書いた行（今日はやらなかった）は数えない。
     ・プロセルは行の言葉で顔か頭皮か（肌・顔・フェイシャル／頭・頭皮・発毛）。どちらも分からなければ両方。
     ・⭐️の行が1つも無い予約メモだけ、前のとおり題名の印で読む。
     返す物＝並び（"lash"・"procell_face"・"procell_scalp"）。施術後の予約の9枚目に小さく出す・食い違いの確かめに使う。 */
  /* ⭐️現在進行中の施術を1つずつ取り出す。★書き方の揺れ（9〜10月の実データで見つけた物）：
     ・「あり／なし」が次の行に続く（M191様「◉👑プロセル肌質MD :5回コース+1🎁」の次の行「全6回の4回目　なし」）
     ・行の頭が◉でなく👑（M06様「👑PFプロセル肌質→男革命6回：」） → 続きの行もつなげて1つの施術として読む。 */
  function todayLines(note) {
    var L = String(note || '').replace(/\r\n/g, '\n').split('\n'), out = [], on = false, cur = -1;
    for (var i = 0; i < L.length; i++) {
      var t = L[i].replace(/^\s+/, '');
      if (t.indexOf('⭐') === 0) { on = true; continue; }
      if (!on) continue;
      if (t.indexOf('💰') === 0 || t.indexOf('☑') === 0) break;
      if (!t) { cur = -1; continue; }
      if (/^(◉|●|⚫|•|·|👑|🇫🇷|🍯)/.test(t)) { out.push(t); cur = out.length - 1; continue; }
      /* 🔁・※・⚠ で始まる書き置き（「🔁なし」＝次回のおまとめ案内は無し）は施術の続きではない。 */
      if (cur >= 0 && !/^(※|⚠|＊|\*|🔁)/.test(t)) out[cur] += ' ' + t;
      else cur = -1;
    }
    return out;
  }
  SG.aftercareAsk = function (title, note) {
    var L = todayLines(note), lash = false, face = false, scalp = false;
    if (L.length) {
      for (var i = 0; i < L.length; i++) {
        var t = L[i];
        if (/なし/.test(t)) continue;
        if (/パリ|🇫🇷|ラッシュ/.test(t)) lash = true;
        if (/プロセル|👑|プロ肌|プロ頭|キャプロ|プロキャ|キャPro/.test(t)) {
          var f = /肌|顔|フェイシャル|フェイス/.test(t), h = /頭|髪|発毛|育毛/.test(t);
          if (f) face = true;
          if (h) scalp = true;
          if (!f && !h) { face = true; scalp = true; }
        }
      }
    } else {
      var tt = String(title || '');
      lash = /🇫🇷/.test(tt); face = /PF/.test(tt); scalp = /PH/.test(tt);
      if (/👑/.test(tt) && !face && !scalp) { face = true; scalp = true; }
    }
    var out = [];
    if (lash) out.push('lash');
    if (face) out.push('procell_face');
    if (scalp) out.push('procell_scalp');
    return out;
  };

  /* ── ★今日は脱毛をする予約か（2026-11-01 まるちゃん「本日が当店はじめての脱毛ですか？」の画面を出す日）──
     ⭐️現在進行中の施術（「なし」は除く）に、脱毛でない施術（プロセル・ハイドラ・マツヤニ・パリジェンヌ・よもぎ・眉・
     アートメイク・マツエク等）以外の行が1つでもあれば脱毛（「脱毛カウンセリング」の行も脱毛＝聞く）。
     ⭐️の行が無い予約メモは、題名に脱毛でない印（🇫🇷👑福🍯🍉）だけの時を除いて脱毛とみなす（聞き漏らすより聞く方が安全）。 */
  /* ★2026-11-13 まるちゃん「足して」：🔮数秘セッション（11/10開始）を足した。入っていなかったので、
       吉田夏美様F21（11/12パリジェンヌ＋数秘）の「◉🔮数秘セッション:初回」を脱毛と読み、題名の「新規数秘」で
       「はじめての脱毛」の送り忘れの知らせがリーダーズへ出た。★新しいサービスが始まったら、必ずここに足す
       （決まり＝AI自動プログラム\CLAUDE.md「新しいサービスが入ったら、脱毛ではない施術の一覧に必ず足す」）。 */
  var NOT_HAIR = /プロセル|プロ肌|プロ頭|プロ髪|キャプロ|プロキャ|キャPro|ハイドラ|福|マツヤニ|🍯|パリ|🇫🇷|👑|ラッシュ|よもぎ|眉|まつ|マツ|ネイル|アート|サブスク|数秘|🔮/;
  /* ⭐️現在進行中の欄の行を全部（◉の付いていない書き方＝「平日ピカピカB@2000(髭全部+脇) あり」M308様 もあるため）。
     ※・⚠・🔁で始まる注意書きの行と、【お母さま】のような見出しは除く。 */
  function sectionLines(note) {
    var L = String(note || '').replace(/\r\n/g, '\n').split('\n'), out = [], on = false;
    for (var i = 0; i < L.length; i++) {
      var t = L[i].replace(/^\s+/, '');
      if (t.indexOf('⭐') === 0) { on = true; continue; }
      if (!on) continue;
      if (t.indexOf('💰') === 0 || t.indexOf('☑') === 0) break;
      if (t && !/^[※⚠🔁【*＊(（]/.test(t)) out.push(t);
    }
    return out;
  }
  SG.datsumoToday = function (title, note) {
    var L = todayLines(note);
    if (!L.length) L = sectionLines(note);
    if (L.length) {
      for (var i = 0; i < L.length; i++) {
        if (/なし/.test(L[i])) continue;
        if (!NOT_HAIR.test(L[i])) return true;
      }
      return false;
    }
    var head = String(title || '').split('預約')[0];
    return !/🇫🇷|👑|福|🍯|🍉|🔮/.test(head);
  };

  /* ── ★イーライトの部位から、どのYESか（2026-11-01 施術後の予約の9枚目＝施術後のLINE送信も同じ画面）──
     VIOだけ→"vio"／VIO＋ほか→"both"／ほかだけ→"other"。部位の書き無しのプランだけの時は決められないので ""。 */
  SG.elightTop = function (parts) {
    var ps = (parts || []).filter(function (p) { return p.indexOf('プラン') < 0; });
    var hv = ps.indexOf('VIO') >= 0, ho = ps.some(function (p) { return p !== 'VIO'; });
    return hv && ho ? 'both' : (hv ? 'vio' : (ho ? 'other' : ''));
  };

  /* ── ★受付の端末は「予約メモの確定のあと」に確認する（2026-11-09 まるちゃん決定・今は開発版だけ）──
     まるちゃん「受付は施術をやったかわからないけど、客が予約している目の前で施術者にきくわけにもいかない」
     ＝受付の端末（SG.isReception）だけ、お客様を選んだ直後の確認の画面（イーライト・はじめての脱毛・パリジェンヌ・
       顔／頭皮プロセル）を出さず、予約メモの確定のあとに
       ①「確認の一覧」（お客様が退店された後に、担当した施術者へ聞く物を全部並べる・ボタン「全て確認しました」）
       ②各確認の画面 ③次が最終回の施術があればお知らせのおすすめ の順に出す。
     施術者のスマホは本人が施術したので今までどおり（お客様を選んだ直後に聞く）。
     ★本番に出すかどうかは画面側（開発版の時だけ）で止める。ここは「受付か」と「一覧の文」だけを決める。 */
  SG.asksAfterMemo = function (who) {
    return SG.isReception(who);
  };
  /* 確認の一覧の文。seq＝出す確認の画面の番号の並び（9イーライト・11はじめての脱毛・12パリジェンヌ・13顔プロセル・14頭皮プロセル）、
     elParts＝イーライトの部位（SG.elightAsk の parts）、finals＝次が最終回の施術（事務所パソコンの答え・{name, head, parts:[{word}]}）。
     〇〇には今日の予約の部位を全部入れる（まるちゃん「VIO、脇、〇〇 など」）。 */
  SG.checkItems = function (seq, elParts, finals) {
    var out = [], s = seq || [];
    for (var i = 0; i < s.length; i++) {
      var n = s[i];
      if (n === 9) {
        var ps = (elParts || []).filter(function (p) { return p.indexOf('プラン') < 0; });
        out.push('本日イーライト' + (ps.length ? '（' + ps.join('、') + '）' : '') + 'をやりましたか？');
      } else if (n === 11) out.push('本日が当店はじめての脱毛の施術でしたか？');
      else if (n === 12) out.push('本日パリジェンヌをやりましたか？');
      else if (n === 13) out.push('本日、顔のプロセルをやりましたか？');
      else if (n === 14) out.push('本日、頭皮のプロセルをやりましたか？');
    }
    var f = finals || [];
    for (var j = 0; j < f.length; j++) {
      var w = ((f[j] && f[j].parts) || []).map(function (p) { return p && p.word; }).filter(function (x) { return x; });
      /* 部位が1つの施術は parts が空＝見出し（name＝「脇　おまとめ：次回が全5回の5回目」2026-11-09〜）の部位の所だけ使う。 */
      var nm = w.length ? w.join('、') : String((f[j] && (f[j].name || f[j].head)) || '').split('　おまとめ：')[0].replace(/＋/g, '、');
      /* ★2026-11-09 まるちゃん「ちゃんと考えて」＝「本日」ではなく「次回の予約で」。🔁は最終回の1つ前の来店（＝今日）の担当が
         次回（最終回）のお知らせ用に決める物なので、最終回は今日ではなく次回の予約。言葉はおすすめの画面（⚠️ 次が最終回です・
         お知らせのおすすめ回数は？）とそろえ、選べる物もボタンと同じ並び（5回・8回・都度・なし）にする。 */
      out.push('次回の予約で' + nm + 'が最終回です。お知らせのおすすめ回数（5回・8回・都度・なし）はどうしますか？😊');
    }
    return out;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SG;
  root.SG = SG;
})(typeof window !== 'undefined' ? window : this);
