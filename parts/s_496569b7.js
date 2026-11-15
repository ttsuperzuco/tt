// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：akijikan、yoyaku_henkou、yoyaku_kizon、yoyaku_sejutsugo
var AKI_ROOM_WRAP_ = { 'FREEDOM': ['FREE', 'DOM'], 'COSMOS': ['COS', 'MOS'], 'STAR/福': ['STAR', '/福'] };
function akiStaffTag_(emoji, name) {
  var cs = Array.from(String(name || ''));
  if (cs.length <= 1) return esc_(emoji) + esc_(name);
  return esc_(emoji) + esc_(cs[0]) + '<br>' + esc_(cs.slice(1).join(''));
}
function akiRoomTag_(room) {
  var nm = (typeof shortRoomName_ === 'function') ? shortRoomName_(room) : room;
  var w = AKI_ROOM_WRAP_[nm];
  return w ? (esc_(w[0]) + '<br>' + esc_(w[1])) : esc_(nm);
}
var AKI_STAFF_ORDER_ = ['🫒', '🍊', '🍅', '🥭'];
var AKI_ROOM_ORDER_ = ['COSMOS', 'FREEDOM', 'HAPPY', 'LUCKY', 'STAR/福/🇫🇷'];
var AKI_PX_ = 1.7;
function akiHm_(m) { return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); }
function akiMin_(hm) {
  var p = String(hm || '').split(':');
  return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
}
function akiBusy_(ws, we, slots) {
  var out = [], cur = ws, i;
  var ss = (slots || []).slice().sort(function (a, b) { return akiMin_(a.s) - akiMin_(b.s); });
  for (i = 0; i < ss.length; i++) {
    var a = akiMin_(ss[i].s), b = akiMin_(ss[i].e);
    if (a > cur) out.push([cur, a]);
    cur = Math.max(cur, b);
  }
  if (cur < we) out.push([cur, we]);
  return out;
}
function akiFullCard_(day) {
  var st = (day.staff || []).filter(function (x) {
    return AKI_STAFF_ORDER_.indexOf(x.emoji) >= 0;     
  }).sort(function (a, b) {
    return AKI_STAFF_ORDER_.indexOf(a.emoji) - AKI_STAFF_ORDER_.indexOf(b.emoji);
  });
  var rm = (day.rooms_free || []).slice().sort(function (a, b) {
    var ia = AKI_ROOM_ORDER_.indexOf(a.room), ib = AKI_ROOM_ORDER_.indexOf(b.room);
    if (ia < 0) ia = 99; if (ib < 0) ib = 99;
    return ia - ib;
  });
  if (!st.length && !rm.length) return '<div class="akinone">（この日は出せる予定がありません）</div>';

  var lo = 24 * 60, hi = 0, i, j, k;
  for (i = 0; i < st.length; i++) {
    var sh = String(st[i].shift || '').split('-');
    if (sh.length === 2) { lo = Math.min(lo, akiMin_(sh[0])); hi = Math.max(hi, akiMin_(sh[1])); }
    for (j = 0; j < (st[i].slots || []).length; j++) {
      lo = Math.min(lo, akiMin_(st[i].slots[j].s)); hi = Math.max(hi, akiMin_(st[i].slots[j].e));
    }
  }
  for (i = 0; i < rm.length; i++) {
    for (j = 0; j < (rm[i].slots || []).length; j++) {
      lo = Math.min(lo, akiMin_(rm[i].slots[j].s)); hi = Math.max(hi, akiMin_(rm[i].slots[j].e));
    }
  }
  if (hi <= lo) return '<div class="akinone">（この日は出せる予定がありません）</div>';
  lo = Math.floor(lo / 60) * 60; hi = Math.ceil(hi / 60) * 60;
  var H = Math.round((hi - lo) * AKI_PX_);

  function blk(cls, a, b, color, withTime, kind, who) {
    var top = Math.round((a - lo) * AKI_PX_), h = Math.round((b - a) * AKI_PX_);
    var dat = kind ? (' data-s="' + akiHm_(a) + '" data-e="' + akiHm_(b) + '"' +
                      ' data-kind="' + kind + '" data-who="' + esc_(who || '') + '"') : '';
    return '<div class="akfblk ' + cls + '" style="top:' + top + 'px;height:' + h + 'px' +
      (color ? ';background:' + color : '') + '"' + dat + '>' +
      (withTime ? '<span class="akfa">' + akiHm_(a) + '</span>' +
                  '<span class="akfb">' + akiHm_(b) + '</span>' : '') + '</div>';
  }
  function lines() {
    var o = '', t = lo;
    while (t <= hi) {
      o += '<div class="akfline" style="top:' + Math.round((t - lo) * AKI_PX_) + 'px"></div>';
      if (t + 30 <= hi) o += '<div class="akfline half" style="top:' +
        Math.round((t + 30 - lo) * AKI_PX_) + 'px"></div>';
      t += 60;
    }
    return o;
  }

  var head = '<div class="akfhead"><div class="akfx"></div>';
  for (i = 0; i < st.length; i++) {
    head += '<div class="akfhc"><span class="akftag" style="background:' + staffColor_(st[i].emoji) +
      '">' + akiStaffTag_(st[i].emoji, st[i].name) + '</span></div>';
  }
  head += '<div class="akfsep"></div>';
  for (i = 0; i < rm.length; i++) {
    head += '<div class="akfhc"><span class="akftag" style="background:' + roomColor_(rm[i].room) +
      '">' + akiRoomTag_(rm[i].room) + '</span></div>';
  }
  head += '</div>';

  var body = '<div class="akfboard"><div class="akfaxis" style="height:' + H + 'px">';
  for (var t = lo; t <= hi; t += 60) {
    body += '<div class="akft" style="top:' + Math.round((t - lo) * AKI_PX_) + 'px">' + akiHm_(t) + '</div>';
  }
  body += '</div><div class="akfcols" style="height:' + H + 'px">';
  for (i = 0; i < st.length; i++) {
    var sh2 = String(st[i].shift || '').split('-');
    var ws = sh2.length === 2 ? akiMin_(sh2[0]) : lo, we = sh2.length === 2 ? akiMin_(sh2[1]) : hi;
    var col = '<div class="akfcol">' + lines();
    if (ws > lo) col += blk('akfoff', lo, ws, '', false);
    if (we < hi) col += blk('akfoff', we, hi, '', false);
    var bs = akiBusy_(ws, we, st[i].slots);
    for (k = 0; k < bs.length; k++) col += blk('akfbusy', bs[k][0], bs[k][1], '', false);
    for (k = 0; k < (st[i].slots || []).length; k++) {
      col += blk('akffree', akiMin_(st[i].slots[k].s), akiMin_(st[i].slots[k].e),
                 staffColor_(st[i].emoji), true, 'staff', st[i].emoji + st[i].name);
    }
    body += col + '</div>';
  }
  body += '<div class="akfsep2"></div>';
  for (i = 0; i < rm.length; i++) {
    var col2 = '<div class="akfcol">' + lines();
    var bs2 = akiBusy_(lo, hi, rm[i].slots);
    for (k = 0; k < bs2.length; k++) col2 += blk('akfbusy', bs2[k][0], bs2[k][1], '', false);
    for (k = 0; k < (rm[i].slots || []).length; k++) {
      col2 += blk('akffree', akiMin_(rm[i].slots[k].s), akiMin_(rm[i].slots[k].e),
                  roomColor_(rm[i].room), true, 'room', shortRoomName_(rm[i].room));
    }
    body += col2 + '</div>';
  }
  body += '</div></div>';
  return '<div class="akfull">' + head + body + '</div>';
}
var AKFCSS_ =
'  .akfull{ overflow:hidden; background:#0d0d0d; color:#fff; border-radius:12px;' +
'    padding:10px 8px 14px; }' +
'  .akfhead{ display:flex; padding:2px 0 6px; }' +
'  .akfx{ width:40px; flex:none; }' +
'  .akfhc{ flex:1; min-width:0; text-align:center; padding:0 1px; }' +
'  .akftag{ display:block; width:100%; box-sizing:border-box; color:#fff; border-radius:8px;' +
'    padding:3px 1px; text-align:center;' +
'    font-size:10px; font-weight:900; line-height:1.15; overflow-wrap:anywhere;' +
'    text-shadow:0 1px 2px rgba(0,0,0,.35); }' +
'  .akfsep{ flex:none; width:10px; }' +
'  .akfboard{ display:flex; }' +
'  .akfaxis{ width:40px; flex:none; position:relative; }' +
'  .akft{ position:absolute; right:3px; font-size:11px; font-weight:800; color:#fff;' +
'    transform:translateY(-50%); }' +
'  .akfcols{ flex:1; min-width:0; display:flex; position:relative;' +
'    background:rgba(127,127,127,.10); border-radius:10px; }' +
'  .akfcol{ flex:1; min-width:0; position:relative; border-right:1px solid rgba(127,127,127,.22); }' +
'  .akfcol:last-child{ border-right:0; }' +
'  .akfsep2{ flex:none; width:10px; }' +
'  .akfline{ position:absolute; left:0; right:0; border-top:1px solid rgba(127,127,127,.35); }' +
'  .akfline.half{ border-top:1px dotted rgba(127,127,127,.20); }' +
'  .akfblk{ position:absolute; left:2px; right:2px; border-radius:7px; overflow:hidden; }' +
'  .akfbusy{ background:rgba(127,127,127,.32); }' +
'  .akfoff{ background:repeating-linear-gradient(45deg,rgba(127,127,127,.30) 0 6px,transparent 6px 12px); }' +
'  .akffree{ box-shadow:0 2px 6px rgba(0,0,0,.20); }' +
'  .akfa,.akfb{ position:absolute; left:3px; font-size:10px; font-weight:900; color:#fff;' +
'    text-shadow:0 1px 2px rgba(0,0,0,.55); }' +
'  .akfa{ top:2px; } .akfb{ bottom:2px; }' +
'';
