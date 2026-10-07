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
    mango: '🥭'       /* 🥭マンゴー */
    /* ★🍍パインは上の一覧から外したので、ここにも入れない（入れると名前だけ出て中身が空になる）。 */
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
  SG.isBooking = function (title) {
    var t = String(title || '');
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
  SG.KAESHI_OPTS = [
    ['5回おまとめ', 'お5回'], ['8回おまとめ', 'お8回'], ['5回も8回も', 'お5回8回'],
    ['都度', '都度'], ['なし', 'なし']
  ];
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

  if (typeof module !== 'undefined' && module.exports) module.exports = SG;
  root.SG = SG;
})(typeof window !== 'undefined' ? window : this);
