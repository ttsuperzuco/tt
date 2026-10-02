/* ★LINEの吹き出しで、文がどこで折り返されるかを計算して改行を入れる（共通の正本・2026-10-02）
 *
 * なぜ要るか（まるちゃん「客にどう見えるかなんだから」）：
 *   パソコンの画面で文をそのまま折り返させると、字の形がスマホと違うので、お客様のスマホとは
 *   違う所で折り返す。そこで「実物のスマホで測った字の幅の表」と「改行の決まり」で計算して、
 *   こちらで改行を入れる。パソコンでもスマホでも、日本語でも中国語でも、毎回同じ答えになる。
 *
 * 測った端末：まるちゃんのAndroid（LINEの文字の大きさ＝中・何もいじっていない）。
 *   ふつうの人の声（知恵袋・ブログ）では普通の設定で1行13〜18文字。これは狭い方＝誰にも崩れない側。
 * 測り方と結果：共通\LINEの折り返し_必読.md（実物の画面41行のうち38行一致・ずれは英大文字だけの段落）。
 *
 * 使い方（スーパーズコのどの画面でも）：
 *   LINEWRAP.wrap("文")             … 改行を入れた文を返す（吹き出しは white-space:pre で見せる）
 *   LINEWRAP.lines("文")            … 行の配列
 *   LINEWRAP.width("文")            … その文の幅（漢字1文字＝1）
 *   bcLineWrap_("文")               … wrap と同じ（一斉配信の画面の呼び名）
 * ★正本はここだけ。スマホ版へは 共通\画面\スマホへ配る.py が tt/line_wrap.js に写す（手で写さない）。
 * ★パソコン版（Python）は 共通\line_wrap.py が同じ表を持つ。表を変えたら両方直し、
 *   python -X utf8 共通\line_wrap.py --答え合わせ で一致を確かめる。
 */
(function (root) {
  'use strict';
  var W = 13.66;                        // 1行の幅（漢字1文字＝1）
  var EM = 1.081 / 2048;                // 英数字＝Androidの標準の字（Roboto）の幅×この倍率
  var R = {a:1112,b:1148,c:1072,d:1150,e:1083,f:711,g:1149,h:1128,i:497,j:489,k:1015,l:497,m:1755,n:1130,o:1168,p:1148,q:1158,r:692,s:1056,t:669,u:1129,v:992,w:1512,x:1013,y:976,z:1013,
    A:1317,B:1257,C:1314,D:1324,E:1148,F:1116,G:1375,H:1440,I:549,J:1115,K:1267,L:1088,M:1763,N:1440,O:1388,P:1274,Q:1388,R:1242,S:1201,T:1204,U:1309,V:1285,W:1792,X:1266,Y:1212,Z:1209,
    ' ':549,'/':720,':':568,'.':538,'-':553,',':393,'!':528,'?':945,'(':684,')':695,'&':1243,'@':1796,'#':1232,'%':1466,'+':1133,'=':1101,'_':902,'~':1358,"'":349,'"':640,';':434,'*':883,'[':532,']':532};
  for (var k = 0; k < 10; k++) R[String(k)] = 1150;
  var NOSTART = "、。，．・：；？！ー」』】〕〉》）］｝〙〗’”ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ々〻‐゠–〜～…‥!?)]}.,:;%";
  var NOEND = "「『【〔〈《（［｛〘〖‘“([{";
  function cw(ch) {
    if (R[ch] !== undefined) return R[ch] * EM;
    var c = ch.codePointAt(0);
    if (c < 0x80) return 1100 * EM;                       // 表に無い半角はふつうの英字くらい
    if (c === 0xFE0F || c === 0x200D) return 0;           // 絵文字の付き添い記号
    if (c >= 0x1F000 || (c >= 0x2600 && c <= 0x27BF) || (c >= 0x2B00 && c <= 0x2BFF)) return 1.3; // 絵文字
    return 1;                                             // 漢字・かな・中国語の字・全角の記号
  }
  function asc(ch) { return /^[A-Za-z0-9]$/.test(ch); }
  function canBreak(p, c) {                               // p と c の間で改行できるか
    if (p === " ") return c !== " ";
    if (c === " ") return false;
    if (NOSTART.indexOf(c) >= 0) return false;
    if (NOEND.indexOf(p) >= 0) return false;
    if ((asc(p) || /[:.,'%&@#_=+*]/.test(p)) && (asc(c) || /[:.,'%&@#_=+*]/.test(c))) return false; // 英単語・時刻は切らない
    if ((p === "/" || p === "-") && /[0-9]/.test(c)) return false;
    if (asc(p) && (c === "/" || c === "-")) return false;
    return true;
  }
  function width(t) { var x = 0; Array.from(String(t || "")).forEach(function (q) { x += cw(q); }); return x; }
  function wrapPara(s) {
    var ch = Array.from(s), segs = [], cur = "";
    for (var i = 0; i < ch.length; i++) {
      if (i > 0 && canBreak(ch[i - 1], ch[i])) { segs.push(cur); cur = ""; }
      cur += ch[i];
    }
    if (cur) segs.push(cur);
    var out = [], line = "", lw = 0;
    segs.forEach(function (sg) {
      var body = sg.replace(/ +$/, ""), bw = width(body);
      if (line && lw + bw > W) { out.push(line.replace(/ +$/, "")); line = ""; lw = 0; }
      if (!line && bw > W) {                              // 1つの塊が1行より長い＝1文字ずつ詰める
        Array.from(sg).forEach(function (q) {
          var qw = cw(q);
          if (line && lw + qw > W && q !== " ") { out.push(line.replace(/ +$/, "")); line = ""; lw = 0; }
          line += q; lw += qw;
        });
        return;
      }
      line += sg; lw += width(sg);
    });
    out.push(line.replace(/ +$/, ""));
    return out;
  }
  function lines(text) {
    var all = [];
    String(text == null ? "" : text).split("\n").forEach(function (p) { all = all.concat(wrapPara(p)); });
    return all;
  }
  function wrap(text) { return lines(text).join("\n"); }
  var LINEWRAP = { wrap: wrap, lines: lines, width: width, LINE_WIDTH: W, MEASURED: "2026-10-02 Android 文字の大きさ=中" };
  root.LINEWRAP = LINEWRAP;
  root.bcLineWrap_ = wrap;
  if (typeof module !== "undefined" && module.exports) module.exports = LINEWRAP;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
