/**
 * 施術室被り 判定コア（detect_core.py の JS 移植 / GAS・Node 両対応）
 *
 * ★これは detect_core.py の“写し”。片方を直したら両方直すこと。
 *   照合テスト parity_check.js が Python版と出力一致を自動確認する。
 *
 * GAS では function 宣言がそのままグローバル関数になる。
 * Node では末尾の module.exports で読み出す（GASでは module 未定義なのでスキップ）。
 * GAS API（DriveApp等）は一切使わない純ロジック。
 */

// label_id → 部屋名（全カレンダー共通の体系）。施術部屋のみ。
var ROOM_LABELS = { 1: 'FREEDOM', 2: 'COSMOS', 6: 'HAPPY', 9: 'LUCKY', 10: 'STAR/福/🇫🇷' };
var NAIL_LABEL = { 7: 'NAIL' };
// 4=予約変更 5=当日キャンセル 3,8=空 → 部屋でないので対象外

var IGNORE_STAFF = '🥝';   // うちのスタッフじゃない → 無視
var RESERVE_MARK = '預約';  // これを含むタイトルだけを予約とみなす
var SPLIT_MARK = '分施';    // 分施＝意図的な同時進行＝被りではない
// 担当マーク(タイトル先頭の果物) → 名前。config.STAFF の写し（施術者被りの表示名用）。
var STAFF_NAMES = { '🍅': 'トマト', '🍊': 'みかん', '🫒': 'オリーブ', '🥭': 'マンゴー', '🍍': 'パイン' };
// label_id → 部屋名（施術室＋NAILも含む。施術者被りは部屋を問わないので各予約の部屋名表示に使う）。
var ALL_ROOM_LABELS = { 1: 'FREEDOM', 2: 'COSMOS', 6: 'HAPPY', 9: 'LUCKY', 10: 'STAR/福/🇫🇷', 7: 'NAIL' };

// ★デザイン眉・まつエク専用カレンダー（担当パイン🍍・2026-07-31追加／同日 実態に合わせ改訂）。config.py の写し（片方直したら両方）。
//   このカレンダーの予約は「部屋を取らない（どの施術室も占有しない）」＝被り検出の対象外。
//   パインに専用部屋は無く必ず施術室を借りるが、その“借りた部屋”は本物の部屋カレンダーに別枠で
//   記入される（例：ラッキーに「エクステ使用中」）＝そちらが部屋を占有する。タイトルの「◯◯使います」はメモ。
var DESIGN_MAYU_CAL = '1070077942';
var ROOM_NAME_TO_LABEL = {  // 現在 roomLabelOf では未使用（将来の照合用に残す）。config.py と対。
  'フリーダム': 1, 'コスモス': 2, 'ハッピー': 6, 'ラッキー': 9, 'スター': 10,
  'FREEDOM': 1, 'COSMOS': 2, 'HAPPY': 6, 'LUCKY': 9, 'STAR': 10
};
// 予定の“実際の部屋ラベル”（部屋でなければ null）。config.room_label_of の写し。
function roomLabelOf(calendarId, labelId, title, roomLabels) {
  var labels = roomLabels || ROOM_LABELS;
  if (String(calendarId) === DESIGN_MAYU_CAL) {
    return null;   // パイン用カレンダーの予約は部屋を取らない（別枠の本物の部屋記入が部屋を担う）。
  }
  return (labelId in labels) ? labelId : null;
}

var CODE_RE = /([MFDNP])\s?0?(\d{1,4})/;
var CODE_RE_G = /([MFDNP])\s?0?(\d{1,4})/g;
var PHONE_RE = /\d[\d\-\s]{7,13}\d/;
// Python STAFF_HEAD_RE と同じ：先頭の絵文字は1つだけ担当スタッフとして拾う（VS16(FE0F)は同じ絵文字の一部として許容）。
// ★以前は+(1つ以上)で欲張りに複数の絵文字をまとめて拾っており、誤入力等でタイトル先頭に絵文字が
//   2つ並ぶと2つ目まで担当スタッフの表示に混ざってしまうバグがあった（2026-07-17発覚）。
var STAFF_HEAD_RE = /^\s*([☀-➿\u{1F300}-\u{1FAFF}]️?)/u;

function norm(t) {
  return (t || '').normalize('NFKC').toUpperCase();
}

function staffOf(title) {
  // タイトル先頭の絵文字1つ＝担当スタッフ。先頭に絵文字が2つ連続していても(誤入力等で)、
  // 担当を表すのは最初の1つだけなので2つ目以降は拾わない。
  var m = (title || '').match(STAFF_HEAD_RE);
  return m ? m[1] : '';
}

function codeOf(title) {
  var m = norm(title).match(CODE_RE);
  return m ? (m[1] + String(parseInt(m[2], 10))) : '';
}

function codesIn(text) {
  // テキスト中の通し番号を全部（M0402→M402 に正規化）。Set 相当。
  var out = {};
  var s = norm(text);
  var m;
  CODE_RE_G.lastIndex = 0;
  while ((m = CODE_RE_G.exec(s)) !== null) {
    out[m[1] + String(parseInt(m[2], 10))] = true;
  }
  return out;
}

function relatedParty(a, b) {
  var aCode = codeOf(a.title), bCode = codeOf(b.title);
  var aText = codesIn((a.title || '') + ' ' + (a.note || ''));
  var bText = codesIn((b.title || '') + ' ' + (b.note || ''));
  if (aCode && bText[aCode]) return true;
  if (bCode && aText[bCode]) return true;
  return false;
}

function customerLine(note) {
  note = note || '';
  var name = '';
  var lines = note.split(/\r\n|\r|\n/);
  for (var i = 0; i < lines.length; i++) {
    var ln = lines[i].trim();
    if (ln) { name = ln; break; }
  }
  var pm = note.match(PHONE_RE);
  var phone = pm ? pm[0].replace(/\D/g, '') : '';
  return { name: Array.from(name).slice(0, 24).join(''), phone: phone };
}

function treatmentOf(note) {
  // 今回の施術内容＝『⭐️現在進行中』見出し配下の ◉/● 行。見出しが無いノートは
  // お支払い/終了の節に入る前の ◉/● 行を拾う。見出し前の ●当日施術 等は拾わない。
  note = note || '';
  var out = [];
  var started = note.indexOf('現在進行中') === -1;
  var lines = note.split(/\r\n|\r|\n/);
  for (var i = 0; i < lines.length; i++) {
    var s = lines[i].trim();
    if (!s) continue;
    if (s.indexOf('現在進行中') !== -1) { started = true; continue; }
    if (!started) continue;
    if (s.indexOf('💰') === 0 || s.indexOf('お支払い') !== -1 || s.indexOf('終了') !== -1) break;
    if (s.indexOf('◉') === 0 || s.indexOf('●') === 0) {
      out.push(s.replace(/^[◉● 　]+/, '').trim());
    }
  }
  return out.join('／');
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * 施術室被りを判定して { conflicts, meta } を返す。
 * events   : {event_id,calendar_name,label_id,title,note,date,start_time,end_time,start_at_ms,end_at_ms}
 * withNail : true で NAIL(7) も部屋対象に含める
 * dateFrom : 'YYYY-MM-DD'。この日以降だけ。falsy なら全期間。
 */
function detect(events, withNail, dateFrom) {
  var rooms = {};
  for (var k in ROOM_LABELS) rooms[k] = ROOM_LABELS[k];
  if (withNail) for (var k2 in NAIL_LABEL) rooms[k2] = NAIL_LABEL[k2];

  // --- 対象の絞り込み（detect_core.py と同じ順序・条件）---
  // ★“実際の部屋ラベル”＝roomLabelOf（デザイン眉は番号でなくタイトルの部屋名／専用スペースは null）。
  var target = [];
  for (var i = 0; i < events.length; i++) {
    var r = events[i];
    if (dateFrom && (r.date || '') < dateFrom) continue;
    var eff = roomLabelOf(r.calendar_id, r.label_id, r.title || '', rooms);
    if (eff === null) continue;
    // ★予約(預約)に加え「使用」で部屋を押さえた予定も部屋の占有として扱う（2026-08-11・detect_core.py と対）。
    //   パイン🍍のデザイン眉/まつエクやパリジェンヌは借りた部屋の本物カレンダーに「デザ眉使用中」
    //   「エクステ使用中」と入れて部屋を取る（預約の字が無い）。拾わないとその部屋に本物の予約を重ねても
    //   被り警告が出ず二重予約を止められない。担当マークが無いので施術者被りには元から乗らず部屋被りだけに効く。
    var title_ = r.title || '';
    if (title_.indexOf(RESERVE_MARK) === -1 && title_.indexOf('使用') === -1) continue;
    r._roomLabel = eff;
    target.push(r);
  }

  var events2 = [];
  for (var t = 0; t < target.length; t++) {
    if ((target[t].title || '').indexOf(IGNORE_STAFF) === -1) events2.push(target[t]);
  }
  var ignored = target.length - events2.length;

  // (部屋ラベル, 日付) ごと。Map で挿入順を Python の defaultdict と一致させる。
  var groups = new Map();
  for (var e = 0; e < events2.length; e++) {
    var ev = events2[e];
    var key = ev._roomLabel + ' ' + ev.date;
    if (!groups.has(key)) groups.set(key, { label: ev._roomLabel, date: ev.date, evs: [] });
    groups.get(key).evs.push(ev);
  }

  var conflicts = [];
  var splitExcluded = 0;
  var familyExcluded = 0;
  groups.forEach(function (g) {
    var evs = g.evs.slice().sort(function (x, y) { return x.start_at_ms - y.start_at_ms; });
    for (var i2 = 0; i2 < evs.length; i2++) {
      for (var j = i2 + 1; j < evs.length; j++) {
        var a = evs[i2], b = evs[j];
        if (b.start_at_ms >= a.end_at_ms) break;
        if (overlaps(a.start_at_ms, a.end_at_ms, b.start_at_ms, b.end_at_ms)) {
          if ((a.title || '').indexOf(SPLIT_MARK) !== -1 || (b.title || '').indexOf(SPLIT_MARK) !== -1) {
            splitExcluded++; continue;
          }
          var ca = codeOf(a.title), cb = codeOf(b.title);
          var na = customerLine(a.note), nb = customerLine(b.note);
          // 通し番号(F/M番号)か電話番号が一致＝同じ客の二重入力の疑い。区別はせず被りとして出すが印だけ付ける。
          var dupSuspect = !!((ca && cb && ca === cb) || (na.phone && nb.phone && na.phone === nb.phone));
          // 担当スタッフ(先頭の果物)が両方同じ＝1人で同時に2人は物理的に不可。
          var saStaff = staffOf(a.title), sbStaff = staffOf(b.title);
          var sameStaff = !!saStaff && saStaff === sbStaff;
          // 家族・連れ(別担当)の同室は隠さず family_same_room の印を付けて出す＝画面は「要確認（家族・同室）」。
          // 「同じ担当が同じ時間」「二重入力」は本物の被り（2026-07-25・detect_core.py と同じ）。
          var familySameRoom = relatedParty(a, b) && !sameStaff && !dupSuspect;
          if (familySameRoom) { familyExcluded++; }
          var ovMin = Math.floor((Math.min(a.end_at_ms, b.end_at_ms)
                                  - Math.max(a.start_at_ms, b.start_at_ms)) / 60000);
          var ovStart = ((a.start_time || '') > (b.start_time || '')) ? a.start_time : b.start_time;
          var ovEnd = ((a.end_time || '') < (b.end_time || '')) ? a.end_time : b.end_time;
          conflicts.push({
            kind: '施術室被り',
            dup_suspect: dupSuspect,
            family_same_room: familySameRoom,
            room: rooms[g.label] || ('label' + g.label),
            date: g.date,
            a_time: a.start_time + '-' + a.end_time, a_cal: a.calendar_name,
            a_cal_id: (a.calendar_id != null ? a.calendar_id : null),
            a_event_id: (a.event_id != null ? a.event_id : null),
            a_staff: staffOf(a.title), a_code: ca, a_name: na.name,
            a_phone: na.phone, a_menu: (a.treatment_db || treatmentOf(a.note)), a_title: (a.title || '').trim(),
            b_time: b.start_time + '-' + b.end_time, b_cal: b.calendar_name,
            b_cal_id: (b.calendar_id != null ? b.calendar_id : null),
            b_event_id: (b.event_id != null ? b.event_id : null),
            b_staff: staffOf(b.title), b_code: cb, b_name: nb.name,
            b_phone: nb.phone, b_menu: (b.treatment_db || treatmentOf(b.note)), b_title: (b.title || '').trim(),
            overlap_min: ovMin, overlap_time: ovStart + '-' + ovEnd
          });
        }
      }
    }
  });

  conflicts.sort(function (x, y) {
    if (x.date !== y.date) return x.date < y.date ? -1 : 1;
    if (x.room !== y.room) return x.room < y.room ? -1 : 1;
    if (x.a_time !== y.a_time) return x.a_time < y.a_time ? -1 : 1;
    return 0;
  });

  // 表示用の部屋名（施術部屋→NAILの順で固定。数値キーの自動昇順に依らず配列で持つ）
  var roomsList = [];
  for (var rk in ROOM_LABELS) roomsList.push(ROOM_LABELS[rk]);
  if (withNail) for (var nk in NAIL_LABEL) roomsList.push(NAIL_LABEL[nk]);

  var meta = {
    rooms_map: rooms,
    rooms_list: roomsList,
    checked: events2.length,
    ignored: ignored,
    split: splitExcluded,
    family: familyExcluded
  };
  return { conflicts: conflicts, meta: meta };
}

/**
 * 施術者（担当スタッフ）被りを判定して { conflicts, meta } を返す。
 * detect_core.py の detect_staff() の対（片方を直したら両方直し parity で一致確認）。
 *
 * 「同じ担当（タイトル先頭の果物マーク）が・同じ日で・時間帯が重なる別の予約を持つ」＝
 * 1人が同時に2件を掛け持ちしている状態を探す。部屋は問わない。除外は施術室被りと同じ
 * （NAIL＝うちのサービスでない／🥝＝自店外／分施＝意図的同時／同伴家族。
 *   同一客二重は dup_suspect の印だけ付けて出す）。
 */
function detectStaff(events, dateFrom) {
  function roomOf(r) {
    // ★“実際の部屋”＝デザイン眉はタイトルの部屋名／専用スペースは空（部屋なし）。
    var eff = roomLabelOf(r.calendar_id, r.label_id, r.title || '', ALL_ROOM_LABELS);
    var n = (eff != null) ? ALL_ROOM_LABELS[eff] : null;
    return (n != null) ? n : '';
  }

  // --- 対象の絞り込み（預約・ネイル以外・担当マークあり・🥝でない・dateFrom以降）---
  var target = [];
  for (var i = 0; i < events.length; i++) {
    var r = events[i];
    if (dateFrom && (r.date || '') < dateFrom) continue;
    if ((r.title || '').indexOf(RESERVE_MARK) === -1) continue;
    // ★ネイル(ラベル7)はうちのサービスでない＝外部の方の間借り。施術室被りが既に恒久除外して
    //   いるのと同じ理由で、施術者被りからも部屋そのもので外す（2026-08-27まるちゃん指示）。
    //   🥝の判定だけでは足りない：staffOf はタイトル「先頭の1文字」しか見ないので、
    //   「🖐🏻🦶🏻🥝💅🏻預約N240」のように🥝が先頭でない書き方だと素通りし、ネイルの二重登録が
    //   うちの担当のかけ持ちとして出てしまう（11/14 N240で実際に発生）。
    //   ★逆に「タイトルのどこかに🥝があれば外す」にしてはいけない：うちのお客様の予約にも
    //   🥝が混じる書き方が221件あり、本物の被りを隠してしまう（実データで確認済み）。
    //   ※detect_core.py の detect_staff と同じ位置・同じ判定にすること（parityで担保）。
    var effRoom_ = roomLabelOf(r.calendar_id, r.label_id, r.title || '', ALL_ROOM_LABELS);
    if (effRoom_ != null && (effRoom_ in NAIL_LABEL)) continue;
    var s = staffOf(r.title || '');
    if (!s || s === IGNORE_STAFF) continue;
    r._staff = s;
    target.push(r);
  }

  // (担当マーク, 日付) ごと。Map で挿入順を Python の defaultdict と一致させる。
  var groups = new Map();
  for (var e = 0; e < target.length; e++) {
    var ev = target[e];
    var key = ev._staff + ' ' + ev.date;
    if (!groups.has(key)) groups.set(key, { staff: ev._staff, date: ev.date, evs: [] });
    groups.get(key).evs.push(ev);
  }

  var conflicts = [];
  var splitExcluded = 0;
  var familyExcluded = 0;
  groups.forEach(function (g) {
    var evs = g.evs.slice().sort(function (x, y) { return x.start_at_ms - y.start_at_ms; });
    for (var i2 = 0; i2 < evs.length; i2++) {
      for (var j = i2 + 1; j < evs.length; j++) {
        var a = evs[i2], b = evs[j];
        if (b.start_at_ms >= a.end_at_ms) break;
        if (overlaps(a.start_at_ms, a.end_at_ms, b.start_at_ms, b.end_at_ms)) {
          if ((a.title || '').indexOf(SPLIT_MARK) !== -1 || (b.title || '').indexOf(SPLIT_MARK) !== -1) {
            splitExcluded++; continue;
          }
          var ca = codeOf(a.title), cb = codeOf(b.title);
          var na = customerLine(a.note), nb = customerLine(b.note);
          var dupSuspect = !!((ca && cb && ca === cb) || (na.phone && nb.phone && na.phone === nb.phone));
          // 施術者被りはグループ化の時点で必ず「同じ担当」＝家族連れ(relatedParty)でも1人で同時に2件は
          // 物理的に不可なので除外せず出す（detect_core.py の detect_staff と同じ。連麗惠様親子対策・2026-07-25）。
          var ovMin = Math.floor((Math.min(a.end_at_ms, b.end_at_ms)
                                  - Math.max(a.start_at_ms, b.start_at_ms)) / 60000);
          var ovStart = ((a.start_time || '') > (b.start_time || '')) ? a.start_time : b.start_time;
          var ovEnd = ((a.end_time || '') < (b.end_time || '')) ? a.end_time : b.end_time;
          conflicts.push({
            kind: '施術者被り',
            dup_suspect: dupSuspect,
            staff: g.staff,
            staff_name: (STAFF_NAMES[g.staff] || ''),
            date: g.date,
            a_time: a.start_time + '-' + a.end_time, a_cal: a.calendar_name,
            a_cal_id: (a.calendar_id != null ? a.calendar_id : null),
            a_event_id: (a.event_id != null ? a.event_id : null),
            a_room: roomOf(a),
            a_staff: staffOf(a.title), a_code: ca, a_name: na.name,
            a_phone: na.phone, a_menu: (a.treatment_db || treatmentOf(a.note)), a_title: (a.title || '').trim(),
            b_time: b.start_time + '-' + b.end_time, b_cal: b.calendar_name,
            b_cal_id: (b.calendar_id != null ? b.calendar_id : null),
            b_event_id: (b.event_id != null ? b.event_id : null),
            b_room: roomOf(b),
            b_staff: staffOf(b.title), b_code: cb, b_name: nb.name,
            b_phone: nb.phone, b_menu: (b.treatment_db || treatmentOf(b.note)), b_title: (b.title || '').trim(),
            overlap_min: ovMin, overlap_time: ovStart + '-' + ovEnd
          });
        }
      }
    }
  });

  conflicts.sort(function (x, y) {
    if (x.date !== y.date) return x.date < y.date ? -1 : 1;
    if (x.staff !== y.staff) return x.staff < y.staff ? -1 : 1;
    if (x.a_time !== y.a_time) return x.a_time < y.a_time ? -1 : 1;
    return 0;
  });

  var staffList = [];
  for (var fk in STAFF_NAMES) staffList.push(fk + STAFF_NAMES[fk]);

  var meta = {
    staff_list: staffList,
    checked: target.length,
    split: splitExcluded,
    family: familyExcluded
  };
  return { conflicts: conflicts, meta: meta };
}

// Node（照合テスト）用エクスポート。GASでは module 未定義なので無視される。
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { detect: detect, detectStaff: detectStaff, staffOf: staffOf, codeOf: codeOf, customerLine: customerLine, ROOM_LABELS: ROOM_LABELS };
}
