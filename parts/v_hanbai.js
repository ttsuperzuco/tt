// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：hanbai
var HANBAI_KANA_ = ['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの', 'はひふへほ',
  'まみむめも', 'や　ゆ　よ', 'らりるれろ', 'わ　　　他'];
function hanbaiScript_(C) {
  function $(id) { return document.getElementById(id); }
  var SECS = ['hbMenu', 'hbDate', 'hbJKind', 'hbJNew', 'hbKana', 'hbCands', 'hbTKind', 'hbToday', 'hbNum', 'hbShop',
    'hbQty', 'hbGift', 'hbPay', 'hbAmt', 'hbNote', 'hbConf', 'hbList', 'hbWho', 'hbStock', 'hbStockConf'];
  var hist = [], cur = 'hbMenu';
  function show(id, noPush) {
    if (!noPush && cur && cur !== id) hist.push(cur);
    cur = id;
    for (var i = 0; i < SECS.length; i++) $(SECS[i]).style.display = (SECS[i] === id) ? '' : 'none';
    var sm = document.querySelectorAll('.hbsum');
    for (var j = 0; j < sm.length; j++) sm[j].innerHTML = summary(id);
    window.scrollTo(0, 0);
  }
  function back() {
    if (sending) return;
    if (CNT[cur] && CNT[cur].isMore()) { CNT[cur].closeMore(); window.scrollTo(0, 0); return; }
    show(hist.pop() || 'hbMenu', true);
  }
  var bb = document.querySelectorAll('.hbback');
  for (var b0 = 0; b0 < bb.length; b0++) bb[b0].addEventListener('click', function (e) { e.preventDefault(); back(); });

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function popup(msg) { if (typeof szPopup_ === 'function') szPopup_(msg); else alert(msg); }
  function two(n) { return ('0' + n).slice(-2); }
  function ymd(d) { return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate()); }
  function stamp(d) { return ymd(d) + ' ' + two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds()); }
  function jpDate(s) {
    var p = String(s || '').split('-'); if (p.length !== 3) return s || '';
    var w = '日月火水木金土'.charAt(new Date(+p[0], +p[1] - 1, +p[2]).getDay());
    return (+p[1]) + '月' + (+p[2]) + '日（' + w + '）';
  }
  function yen(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function unit() { return S.country === 'JP' ? '円' : '元'; }

  var S = {};
  function reset(country) {
    S = { country: country, date: ymd(new Date()), kind: '', sei: '', mei: '', yomi: '', fnum: '', name: '',
          qty: 0, gift: 0, pay: '', amount: '', note: '' };
  }
  function custText() {
    if (S.country === 'JP') return (S.sei || S.mei) ? (S.sei + ' ' + S.mei).trim() + ' 様' : '';
    if (S.kind === 'shopee') return S.name ? S.name + '（蝦皮）' : '';
    return S.fnum ? (S.name || '') + '（' + S.fnum + '）' : '';
  }
  function summary(id) {
    if (id === 'hbMenu' || id === 'hbList' || id === 'hbConf' || id === 'hbDate' || !S.country) return '';
    var h = (S.country === 'JP' ? '🇯🇵 日本販売' : '🇹🇼 台湾販売') + '　' + esc(jpDate(S.date));
    var c = '';
    if (id !== 'hbJNew' && id !== 'hbShop') {
      if (S.country === 'JP' && (S.sei || S.mei)) c = esc((S.sei + ' ' + S.mei).trim()) + ' 様';
      if (S.country === 'TW' && S.kind === 'shopee' && S.name) c = '<span class="no">蝦皮</span>' + esc(S.name);
      else if (S.country === 'TW' && S.fnum) c = '<span class="no">' + esc(S.fnum) + '</span>' + esc(S.name || '');
    }
    if (c) h += '<div class="hbcust">' + c + '</div>';
    var t = '';
    if (S.qty && (id === 'hbGift' || id === 'hbPay' || id === 'hbAmt' || id === 'hbNote')) t += S.qty + '本';
    if (id === 'hbPay' || id === 'hbAmt' || id === 'hbNote') t += S.gift ? '（🎁' + S.gift + '本）' : '（🎁なし）';
    if (S.amount !== '' && (id === 'hbPay' || id === 'hbNote')) t += '　' + yen(S.amount) + unit();
    if (S.pay && id === 'hbNote') t += '　' + esc(S.pay);
    if (t) h += '<div>' + t + '</div>';
    return h;
  }
  var PICKED = '';
  function labels() {
    try { return (typeof _labelsFromCfg_ === 'function') ? _labelsFromCfg_(JSON.parse(localStorage.getItem('sz_cfg') || '{}')) : {}; } catch (e) { return {}; }
  }
  function needPick() {
    var w = window.__SZ_WHO_ || '';
    return w === 'reception' || w === 'reception_sp';
  }
  function who() {
    if (needPick()) return PICKED || '不明';
    var w = window.__SZ_WHO_ || '', r = window.__SZ_ROLE_ || '', L = labels();
    if (w && L[w]) return L[w];
    if (r === '社長(幹部)') return L.kanbu || '🍅トマト';
    if (r === '開発') return '🐉Ryu';
    return r || '不明';
  }
  function markOf(label) {
    var m = String(label || '').match(/^(\p{Extended_Pictographic}\uFE0F?)/u);
    return m ? m[1] : '';
  }
  function drawWho() {
    var ids = (typeof _peopleFromCfg_ === 'function') ? _peopleFromCfg_(JSON.parse(localStorage.getItem('sz_cfg') || '{}')) : [];
    var L = labels(), h = '';
    for (var i = 0; i < ids.length; i++) {
      if (ids[i] === 'reception' || ids[i] === 'reception_sp') continue;
      var lb = L[ids[i]] || ids[i];
      h += '<button type="button" data-lb="' + esc(lb) + '">' + esc(lb) + '</button>';
    }
    h += '<button type="button" data-lb="🐉Ryu">🐉Ryu</button>';
    $('hbWhoBtns').innerHTML = h;
  }
  function drawWhoLine() {
    $('hbWhoLine').style.display = needPick() ? '' : 'none';
    $('hbWhoName').textContent = PICKED;
  }

  function jsonp(p, cb) {
    var n = '__hb' + Date.now() + Math.floor(Math.random() * 1000);
    window[n] = function (r) { try { delete window[n]; } catch (e) {} cb(r); };
    var q = 'callback=' + n; for (var k in p) q += '&' + k + '=' + encodeURIComponent(p[k]);
    var s = document.createElement('script'); s.src = C.exec + '?' + q + '&cb=' + Date.now();
    s.onerror = function () { cb({ ok: false, error: '通信エラーです' }); }; document.body.appendChild(s);
  }
  function ask(fields, busy, done, sub) {
    if (typeof szOvShow_ === 'function') szOvShow_(szBusyHtml_(busy, sub || false), '#2C7A99');
    var end = function (err, d) { if (typeof szOvHide_ === 'function') szOvHide_(); done(err, d); };
    jsonp({ action: 'submit', key: C.key, op: 'hanbai',
            who: window.__SZ_WHO_ || '', role: window.__SZ_ROLE_ || '', device: window.__SZ_DEVICE_ || '',
            fields: JSON.stringify(fields) },
      function (r) {
        if (!r || !r.ok || !r.id) { end((r && r.error) || '通信に失敗しました'); return; }
        var n = 0, max = (typeof LIMITS !== 'undefined') ? LIMITS.tries('hanbai', 800) : 200;
        var poll = function () {
          n++; if (n > max) { end('時間切れです。もう一度試してもらえると嬉しいです🙇'); return; }
          jsonp({ action: 'status', key: C.key, id: r.id }, function (x) {
            if (!x || !x.ok) { end((x && x.error) || '通信に失敗しました'); return; }
            if (x.status === 'pending' || x.status === 'running' || x.status === 'queued' || x.status === '') { setTimeout(poll, 800); return; }
            if (x.status !== 'done') { end(x.result || 'エラーが発生しました'); return; }
            var d = null; try { d = JSON.parse(x.result || '{}'); } catch (e) {}
            end(null, d || {});
          });
        };
        setTimeout(poll, 900);
      });
  }

  function clearMsg() { $('hbMenuMsg').style.display = 'none'; }
  $('hbWhoBtns').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    PICKED = b.getAttribute('data-lb'); drawWhoLine(); hist = []; show('hbMenu', true);
  });
  $('hbWhoChange').addEventListener('click', function () { clearMsg(); show('hbWho'); });
  $('hbGoTW').addEventListener('click', function () { clearMsg(); reset('TW'); openDate(); });
  $('hbGoJP').addEventListener('click', function () { clearMsg(); reset('JP'); openDate(); });
  $('hbGoList').addEventListener('click', function () { clearMsg(); if (CANLIST) openList('TW', ''); });   
  var CANLIST = (window.__SZ_ROLE_ === '社長(幹部)' || window.__SZ_ROLE_ === '開発');
  $('hbGoList').style.display = CANLIST ? '' : 'none';

  var stDigits = '', stSending = false;
  function stDraw() {
    $('hbStBox').innerHTML = stDigits ? esc(stDigits) + '<span class="u">本</span>' : '<span class="ph">数字を入力してね😊</span>';
  }
  $('hbGoStock').addEventListener('click', function () {
    clearMsg();
    if (needPick() && !PICKED) { drawWho(); show('hbWho'); return; }   
    stDigits = ''; stDraw(); $('hbStWho').textContent = '入力する人：' + who(); show('hbStock');
  });
  $('hbStPad').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var k = b.getAttribute('data-k') || b.textContent;
    if (k === 'clr') stDigits = '';
    else if (k === 'del') stDigits = stDigits.slice(0, -1);
    else if (/^[0-9]$/.test(k) && stDigits.length < 4) stDigits = (stDigits === '0') ? k : stDigits + k;
    stDraw();
  });
  $('hbStOk').addEventListener('click', function () {
    if (stDigits === '') { popup('本数を入力してね😊 （無い時は 0）'); return; }
    var rows = [['品物', 'ホホバエッセンスNo31（50ml）'], ['今お店にある本数', parseInt(stDigits, 10) + ' 本'], ['入力する人', who()]];
    var h = '';
    for (var i = 0; i < rows.length; i++) h += '<div><b>' + esc(rows[i][0]) + '</b><span>' + esc(rows[i][1]) + '</span></div>';
    $('hbStRows').innerHTML = h; $('hbStSt').textContent = ''; $('hbStSend').disabled = false;
    show('hbStockConf');
  });
  $('hbStSend').addEventListener('click', function () {
    if (stSending) return;
    stSending = true; $('hbStSend').disabled = true; $('hbStSt').textContent = '登録しています…';
    var n = parseInt(stDigits, 10);
    ask({ kind: 'stock', qty: n, staff: who(), at: stamp(new Date()) }, '登録しています', function (err, d) {
      stSending = false; $('hbStSend').disabled = false; $('hbStSt').textContent = '';
      if (err || !d || !d.ok) { popup('登録できませんでした：' + (err || (d && d.reason) || '不明')); return; }
      $('hbMenuMsg').innerHTML = '✅ お店の在庫を登録しました　No31　' + n + '本';
      $('hbMenuMsg').style.display = '';
      hist = []; show('hbMenu', true);
    }, '登録が終わったら自動で画面が切り替わりますので、少し待っててくださいね🥺');
  });

  function drawDate() {
    $('hbDateBox').textContent = jpDate(S.date);
    var t = dayBack(0), y = dayBack(1), o = dayBack(2);
    $('hbToday0').className = (S.date === t) ? 'on' : '';
    $('hbYest').className = (S.date === y) ? 'on' : '';
    $('hbOto').className = (S.date === o) ? 'on' : '';
    $('hbCalBtn').className = 'hbcal' + ((S.date !== t && S.date !== y && S.date !== o) ? ' on' : '');
    $('hbCal').value = S.date;
    $('hbDateHead').textContent = (S.country === 'JP' ? '🇯🇵 日本販売入力' : '🇹🇼 台湾販売入力');
  }
  function openDate() { drawDate(); show('hbDate'); }
  function dayBack(n) { var t = new Date(); return ymd(new Date(t.getFullYear(), t.getMonth(), t.getDate() - n)); }
  $('hbToday0').addEventListener('click', function () { S.date = dayBack(0); drawDate(); });
  $('hbYest').addEventListener('click', function () { S.date = dayBack(1); drawDate(); });
  $('hbOto').addEventListener('click', function () { S.date = dayBack(2); drawDate(); });
  function calPicked() {
    var v = this.value;
    if (!v) { S.date = dayBack(0); drawDate(); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || v === S.date) return;
    S.date = v; drawDate();
  }
  ['input', 'change', 'blur'].forEach(function (ev) { $('hbCal').addEventListener(ev, calPicked); });
  $('hbCal').addEventListener('click', function () { try { if (this.showPicker) this.showPicker(); } catch (e) {} });
  $('hbDateGo').addEventListener('click', function () {
    $('hbTodayBtnTx').textContent = dayWord() + '予約のお客様';
    show(S.country === 'JP' ? 'hbJKind' : 'hbTKind');
  });

  $('hbJNewBtn').addEventListener('click', function () { S.kind = 'new'; S.sei = ''; S.mei = ''; S.yomi = ''; $('hbSei').value = ''; $('hbMei').value = ''; show('hbJNew'); });
  $('hbJRepBtn').addEventListener('click', function () { S.kind = 'repeat'; show('hbKana'); });
  $('hbJNewGo').addEventListener('click', function () {
    S.sei = $('hbSei').value.replace(/\s+/g, ' ').trim(); S.mei = $('hbMei').value.replace(/\s+/g, ' ').trim();
    if (!S.sei) { popup('氏を入力してね😊'); return; }
    S.yomi = ''; openQty();
  });

  $('hbKanaGrid').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var k = b.getAttribute('data-k'); if (!k) return;
    ask({ kind: 'cands', head: k }, '過去の購入者を検索しています', function (err, d) {
      if (err || !d || !d.ok) { popup('さがせませんでした：' + (err || (d && d.reason) || '不明')); return; }
      drawCands(k, d.list || []);
    });
  });
  function drawCands(k, list) {
    $('hbCandHead').textContent = '「' + k + '」の お客様';
    var h = '';
    for (var i = 0; i < list.length; i++) {
      var x = list[i], ld = String(x.last || '').split('-');
      h += '<button type="button" data-i="' + i + '"><span>' + esc((x.sei + ' ' + x.mei).trim()) + ' 様</span>' +
        '<span class="s">' + x.n + '回・最後 ' + (ld.length === 3 ? (+ld[1]) + '/' + (+ld[2]) : '') + '</span></button>';
    }
    $('hbCandRows').innerHTML = h;
    $('hbCandRows').style.display = list.length ? '' : 'none';
    $('hbCandNone').style.display = list.length ? 'none' : '';
    $('hbCandRows').onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var x = list[parseInt(b.getAttribute('data-i'), 10)];
      S.sei = x.sei; S.mei = x.mei; S.yomi = x.yomi || k; S.prevN = x.n || 0; S.prevQ = x.q || 0; openQty();
    };
    show('hbCands');
  }
  $('hbCandNew').addEventListener('click', function () { $('hbJNewBtn').click(); });

  var TODAY = null, DAYS = {};
  function isToday() { return S.date === ymd(new Date()); }
  function dayWord() { var p = S.date.split('-'); return isToday() ? '本日' : (+p[1]) + '月' + (+p[2]) + '日の'; }
  function ours(list) {
    var seen = {}, out = [];
    for (var i = 0; i < list.length; i++) {
      var x = list[i];
      if (typeof SG !== 'undefined' && SG.nameOfMark && !SG.nameOfMark(x.mark)) continue;
      if (!x.fnum || seen[x.fnum]) continue;
      seen[x.fnum] = 1; out.push(x);
    }
    return out;
  }
  $('hbTodayBtn').addEventListener('click', function () {
    S.kind = 'today';
    var d = S.date;
    if (DAYS[d]) { TODAY = DAYS[d]; drawToday(); return; }
    if (!isToday()) {
      ask({ kind: 'day', date: d }, dayWord() + '予約を読んでいます', function (err, r) {
        if (err || !r || !r.ok) { popup('予約を読み込めませんでした：' + (err || '不明')); return; }
        DAYS[d] = TODAY = ours(r.list || []); drawToday();
      }, '少し待っててくださいね🥺');
      return;
    }
    if (typeof szOvShow_ === 'function') szOvShow_(szBusyHtml_('本日の予約を読んでいます', '少し待っててくださいね🥺'), '#2C7A99');
    var n = '__hbev' + Date.now();
    var fin = function (p) {
      try { delete window[n]; } catch (e) {}
      if (typeof szOvHide_ === 'function') szOvHide_();
      if (!p || p.error || !p.events) { popup('本日の予約を読み込めませんでした。通信環境をご確認くださいませ🙇'); return; }
      var day = p.date_from || ymd(new Date()), out = [];
      for (var i = 0; i < p.events.length; i++) {
        var e = p.events[i]; if (e.date !== day) continue;
        out.push({ fnum: (typeof codeOf === 'function') ? codeOf(e.title || '') : '',
                   name: (typeof customerLine === 'function') ? (customerLine(e.note || '').name || '') : '',
                   mark: (typeof staffOf === 'function') ? (staffOf(e.title || '') || '') : '',
                   st: e.start_time || '', ms: e.start_at_ms || 0 });
      }
      out.sort(function (a, b) { return a.ms - b.ms; });
      DAYS[d] = TODAY = ours(out); drawToday();
    };
    window[n] = fin;
    var s = document.createElement('script');
    s.src = C.exec + '?action=data&name=events.json&callback=' + n + '&cb=' + Date.now();
    s.onerror = function () { fin({ error: 'net' }); };
    document.body.appendChild(s);
  });
  function drawToday() {
    var h = '';
    for (var i = 0; i < TODAY.length; i++) {
      var x = TODAY[i];
      h += '<button type="button" data-i="' + i + '"><span class="mk">' + esc(x.mark || '') + '</span>' +
        '<span class="nm">' + esc(x.name || 'お名前なし') + '</span>' +
        '<span class="s">' + esc(x.st) + '<br>' + esc(x.fnum) + '</span></button>';
    }
    $('hbTodayRows').innerHTML = h;
    $('hbTodayRows').style.display = TODAY.length ? '' : 'none';
    $('hbTodayNone').style.display = TODAY.length ? 'none' : '';
    $('hbTodayNone').textContent = dayWord().replace(/の$/, '') + 'の予約はありません';
    $('hbTodayHead').textContent = dayWord() + (isToday() ? '予約' : '予約') + 'のお客様';
    show('hbToday');
  }
  $('hbTodayRows').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var x = TODAY[parseInt(b.getAttribute('data-i'), 10)];
    S.fnum = x.fnum; S.name = x.name; openQty();
  });
  var NPRE = '', NDIG = '';
  function numDraw() {
    $('hbNumBox').innerHTML = (NPRE || NDIG) ? esc(NPRE + NDIG) : '<span class="ph">お客様番号を入力してね😊</span>';
    var sg = $('hbNumSeg').querySelectorAll('button');
    for (var j = 0; j < sg.length; j++) sg[j].className = (sg[j].getAttribute('data-v') === NPRE) ? 'on' : '';
  }
  $('hbNumBtn').addEventListener('click', function () { S.kind = 'number'; NPRE = ''; NDIG = ''; numDraw(); show('hbNum'); });
  $('hbShopBtn').addEventListener('click', function () {
    S.kind = 'shopee'; S.fnum = ''; S.name = ''; S.pay = ''; $('hbShopName').value = ''; show('hbShop');
  });
  $('hbShopGo').addEventListener('click', function () {
    S.name = $('hbShopName').value.replace(/\s+/g, ' ').trim();
    if (!S.name) { popup('お名前を入力してね😊'); return; }
    S.fnum = ''; S.pay = '蝦皮'; openQty();
  });
  var segs = $('hbNumSeg').querySelectorAll('button');
  for (var s0 = 0; s0 < segs.length; s0++) segs[s0].addEventListener('click', function () {
    NPRE = this.getAttribute('data-v'); numDraw();
  });
  $('hbNumPad').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var k = b.getAttribute('data-k') || b.textContent;
    if (k === 'clr') NDIG = ''; else if (k === 'del') NDIG = NDIG.slice(0, -1);
    else if (/^[0-9]$/.test(k) && NDIG.length < 4) NDIG += k;
    numDraw();
  });
  $('hbNumGo').addEventListener('click', function () {
    if (!NPRE) { popup('F（女性）か M（男性）を押してね😊'); return; }
    if (!NDIG) { popup('お客様番号を入力してね😊'); return; }
    ask({ kind: 'lookup', fnum: NPRE + NDIG }, 'お客様を検索しています', function (err, d) {
      if (err) { popup('さがせませんでした：' + err); return; }
      if (!d || !d.ok) { popup((d && d.reason) || 'お客様が見つかりません'); return; }
      S.fnum = d.fnum; S.name = d.name; openQty();
    });
  });

  var CNT = {};
  function counter(sec, key, noneLabel, next) {
    var btns = $(sec + 'Btns'), more = $(sec + 'More'), pad = $(sec + 'Pad'), go = $(sec + 'Go'), dig = '';
    function isMore() { return more.style.display !== 'none'; }
    function draw() {
      var mb = btns.querySelector('[data-q="more"]'); if (!mb) return;
      btns.className = 'hbqty' + (isMore() ? ' more' : '');
      mb.className = 'wide' + (isMore() ? ' on' : '');
      mb.innerHTML = !isMore() ? '10本以上（数字で入力）' : (dig ? '<span class="qn">' + esc(dig) + '</span> 本' : '数字ボタンで本数を入力してね😊');
    }
    function open() {
      var v = S[key], h = noneLabel ? '<button type="button" class="wide none' + (v === 0 && S[key + 'Set'] ? ' on' : '') + '" data-q="0">' + noneLabel + '</button>' : '';
      for (var i = 1; i <= 10; i++) h += '<button type="button" data-q="' + i + '"' + (v === i ? ' class="on"' : '') + '>' + i + '</button>';
      h += '<button type="button" class="wide" data-q="more">10本以上（数字で入力）</button>';
      btns.innerHTML = h;
      dig = v > 10 ? String(v) : '';
      more.style.display = v > 10 ? '' : 'none';
      draw(); show(sec);
    }
    function closeMore() { more.style.display = 'none'; dig = ''; draw(); }
    btns.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var q = b.getAttribute('data-q');
      if (q === 'more') { if (!isMore()) { more.style.display = ''; dig = ''; draw(); } return; }
      S[key] = parseInt(q, 10); S[key + 'Set'] = true; next();
    });
    pad.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var k = b.getAttribute('data-k') || b.textContent;
      if (k === 'clr') dig = ''; else if (k === 'del') dig = dig.slice(0, -1);
      else if (/^[0-9]$/.test(k) && dig.length < 3) dig = (dig === '0') ? k : dig + k;
      draw();
    });
    go.addEventListener('click', function () {
      if (dig === '') { popup('本数を入力してね😊 （無い時は 0）'); return; }
      var q = parseInt(dig, 10);
      S[key] = q; S[key + 'Set'] = true; next();
    });
    CNT[sec] = { open: open, isMore: isMore, closeMore: closeMore, pad: sec + 'Pad', go: sec + 'Go' };
    return CNT[sec];
  }
  var QTY = counter('hbQty', 'qty', '0本（プレゼントだけ）', function () { GIFT.open(); });
  var GIFT = counter('hbGift', 'gift', 'なし', function () {
    if (S.qty === 0) { S.amount = 0; S.pay = ''; $('hbNoteIn').value = S.note || ''; show('hbNote'); return; }
    openAmt();
  });
  var PAYS = { TW: ['LinePay', '街口', '現金', '振込'], JP: ['現金', '振込'] };
  function openPay() {
    var list = PAYS[S.country] || [], h = '';
    for (var i = 0; i < list.length; i++) h += '<button type="button" class="hbbig' + (S.pay === list[i] ? ' on' : '') + '" data-p="' + esc(list[i]) + '">' + esc(list[i]) + '</button>';
    $('hbPayBtns').innerHTML = h; show('hbPay');
  }
  $('hbPayBtns').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    S.pay = b.getAttribute('data-p'); $('hbNoteIn').value = S.note || ''; show('hbNote');
  });
  function openQty() { QTY.open(); }

  var ADIG = '';
  function openAmt() {
    ADIG = (S.amount === '' ? '' : String(S.amount));
    $('hbAmtHead').textContent = '販売金額（' + unit() + '）';
    aDraw(); show('hbAmt');
  }
  function aDraw() { $('hbAmtBox').innerHTML = ADIG ? esc(yen(ADIG)) + '<span class="u">' + unit() + '</span>' : '<span class="ph">金額を入力してね😊</span>'; }
  $('hbAmtPad').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var k = b.getAttribute('data-k') || b.textContent;
    if (k === 'clr') ADIG = ''; else if (k === 'del') ADIG = ADIG.slice(0, -1);
    else if (/^[0-9]$/.test(k) && ADIG.length < 8) ADIG = (ADIG === '0') ? k : ADIG + k;
    aDraw();
  });
  $('hbAmtGo').addEventListener('click', function () {
    if (ADIG === '') { popup('金額を入力してね😊'); return; }
    S.amount = parseInt(ADIG, 10);
    if (S.kind === 'shopee') { S.pay = '蝦皮'; $('hbNoteIn').value = S.note || ''; show('hbNote'); return; }   
    openPay();
  });

  document.addEventListener('keydown', function (e) {
    var pad = cur === 'hbNum' ? 'hbNumPad' : cur === 'hbAmt' ? 'hbAmtPad' : (CNT[cur] && CNT[cur].isMore()) ? CNT[cur].pad : '';
    if (!pad) return;
    var go = cur === 'hbNum' ? 'hbNumGo' : cur === 'hbAmt' ? 'hbAmtGo' : CNT[cur].go;
    var hit = function (k) { var bs = $(pad).querySelectorAll('button'); for (var i = 0; i < bs.length; i++) if ((bs[i].getAttribute('data-k') || bs[i].textContent) === k) { bs[i].click(); return; } };
    if (/^[0-9]$/.test(e.key)) { hit(e.key); e.preventDefault(); }
    else if (e.key === 'Backspace') { hit('del'); e.preventDefault(); }
    else if (e.key === 'Enter') { $(go).click(); e.preventDefault(); }
  });

  $('hbNoteGo').addEventListener('click', function () {
    S.note = $('hbNoteIn').value.trim();
    var rows = [['販売', S.country === 'JP' ? '🇯🇵 日本' : '🇹🇼 台湾'], ['販売日', jpDate(S.date)],
      ['お客様', (S.country === 'JP' ? (S.kind === 'new' ? '【新規】' : '【🔁' + ((S.prevN || 0) + 1) + '回 計' + ((S.prevQ || 0) + S.qty) + '本】') : '') + custText()],
      ['販売本数', S.qty + ' 本'], ['プレゼント', S.gift ? S.gift + ' 本' : 'なし']];
    if (S.qty === 0) rows.push(['お支払い', 'なし（プレゼントだけ）']);
    else rows.push(['販売金額', yen(S.amount) + ' ' + unit()], ['支払方法', S.pay]);
    rows.push(['備考', S.note || '（なし）']);
    var h = '';
    for (var i = 0; i < rows.length; i++) h += '<div><b>' + esc(rows[i][0]) + '</b><span>' + esc(rows[i][1]) + '</span></div>';
    $('hbConfRows').innerHTML = h; $('hbSt').textContent = ''; $('hbSend').disabled = false;
    show('hbConf');
  });

  var sending = false;
  $('hbSend').addEventListener('click', function () {
    if (sending) return;
    sending = true; $('hbSend').disabled = true; $('hbSt').textContent = '登録しています…';
    ask({ kind: 'save', country: S.country, date: S.date, cust_kind: S.kind, sei: S.sei, mei: S.mei, yomi: S.yomi,
          fnum: S.fnum, name: S.name, qty: S.qty, gift: S.gift, pay: S.pay, amount: S.amount, note: S.note, staff: who(), at: stamp(new Date()) },
      '登録しています', function (err, d) {
        sending = false; $('hbSend').disabled = false; $('hbSt').textContent = '';
        if (err || !d || !d.ok) { popup('登録できませんでした：' + (err || (d && d.reason) || '不明')); return; }
        $('hbMenuMsg').innerHTML = '✅ 登録しました　' + esc(custText()) + '　' + S.qty + '本' + (S.gift ? '（🎁' + S.gift + '本）' : '') + '　' + esc(yen(S.amount)) + unit();
        $('hbMenuMsg').style.display = '';
        hist = []; show('hbMenu', true);
        delete LCACHE[S.date.slice(0, 7)]; delete LCACHE.ALL; prefetch(thisMonth());   
      }, '登録が終わったら自動で画面が切り替わりますので、少し待っててくださいね🥺');   
  });

  var LC = 'TW', LM = '', LMM = '', LCACHE = {}, LWAIT = {};
  var SRC = { shop: true, shopee: true };   
  function thisMonth() { return ymd(new Date()).slice(0, 7); }
  function shiftMonth(m, d) { var p = m.split('-'), x = new Date(+p[0], +p[1] - 1 + d, 1); return x.getFullYear() + '-' + two(x.getMonth() + 1); }
  function prefetch(month, cb) {
    if (!CANLIST) return;   
    if (LWAIT[month]) { if (cb) LWAIT[month].push(cb); return; }
    LWAIT[month] = cb ? [cb] : [];
    jsonp({ action: 'submit', key: C.key, op: 'hanbai',
            who: window.__SZ_WHO_ || '', role: window.__SZ_ROLE_ || '', device: window.__SZ_DEVICE_ || '',
            fields: JSON.stringify({ kind: 'list', month: month }) },
      function (r) {
        var fin = function (err, d) {
          var w = LWAIT[month] || []; delete LWAIT[month];
          if (!err && d && d.ok) LCACHE[month] = d;
          for (var i = 0; i < w.length; i++) w[i](err, d);
          if (cur === 'hbList' && LM === month && LCACHE[month]) drawList();
        };
        if (!r || !r.ok || !r.id) { fin((r && r.error) || '通信に失敗しました'); return; }
        var n = 0, max = (typeof LIMITS !== 'undefined') ? LIMITS.tries('hanbai', 800) : 200;
        var poll = function () {
          n++; if (n > max) { fin('時間切れです。もう一度試してもらえると嬉しいです🙇'); return; }
          jsonp({ action: 'status', key: C.key, id: r.id }, function (x) {
            if (!x || !x.ok) { fin((x && x.error) || '通信に失敗しました'); return; }
            if (x.status === 'pending' || x.status === 'running' || x.status === 'queued' || x.status === '') { setTimeout(poll, 800); return; }
            if (x.status !== 'done') { fin(x.result || 'エラーが発生しました'); return; }
            var d = null; try { d = JSON.parse(x.result || '{}'); } catch (e) {}
            fin(null, d || {});
          });
        };
        setTimeout(poll, 900);
      });
  }
  function openList(country, month) {
    LC = country; LM = month || thisMonth();
    if (cur !== 'hbList') show('hbList');
    drawList();
  }
  function drawList() {
    var sg = $('hbListSeg').querySelectorAll('button');
    for (var i = 0; i < sg.length; i++) sg[i].className = (sg[i].getAttribute('data-v') === LC) ? 'on' : '';
    var isAll = LM === 'ALL', ss = $('hbSpanSeg').querySelectorAll('button');
    for (var s0 = 0; s0 < ss.length; s0++) ss[s0].className = (ss[s0].getAttribute('data-v') === (isAll ? 'ALL' : 'M')) ? 'on' : '';
    $('hbMonRow').style.display = isAll ? 'none' : '';
    if (!isAll) {
      var p = LM.split('-');
      $('hbMonTxt').textContent = (+p[0]) + '年' + (+p[1]) + '月';
      $('hbMonNext').disabled = LM >= thisMonth();
    }
    var all = LCACHE[LM];
    if (!all) {
      $('hbListBody').innerHTML = '<div class="hbempty">読んでいます…</div>';
      prefetch(LM, function (err) {
        if (err && cur === 'hbList') $('hbListBody').innerHTML = '<div class="hbempty">読み込めませんでした：' + esc(err) + '</div>';
      });
      return;
    }
    var d = all[LC] || { rows: [], count: 0, total_qty: 0, total_gift: 0, total_amount: 0 };
    var u = LC === 'JP' ? '円' : '元';
    var src = $('hbSrcSeg').querySelectorAll('button');
    for (var s1 = 0; s1 < src.length; s1++) src[s1].className = SRC[src[s1].getAttribute('data-v')] ? 'on' : '';
    $('hbSrcSeg').style.display = LC === 'TW' ? '' : 'none';
    var one = LC === 'TW' && SRC.shop !== SRC.shopee;
    var tt = (one && d.by) ? d.by[SRC.shop ? 'shop' : 'shopee'] : d;
    var h = '<div class="hbtot"><span>' + tt.count + '件</span><span>' + tt.total_qty + '本' +
      (tt.total_gift ? '（🎁' + tt.total_gift + '本）' : '') + '</span><span>' + yen(tt.total_amount) + u + '</span></div>';
    var shown = [];
    for (var j0 = 0; j0 < (d.rows || []).length; j0++) {
      var sp = d.rows[j0][11] === 'shopee';
      if (!one || (sp ? SRC.shopee : SRC.shop)) shown.push(j0);
    }
    if (!shown.length) h += '<div class="hbempty">' + (isAll ? 'まだ記録はありません' : 'この月の記録はありません') + '</div>';
    else {
      var thisY = thisMonth().slice(0, 4);
      h += '<div class="hbtbl' + (isAll ? ' all' : '') + '"><table><colgroup><col class="c1"><col><col class="c4"><col class="c5"></colgroup>' +
        '<thead><tr><th class="l">日</th><th class="l">お客様・担当</th><th class="r">本数</th><th class="r">金額' + u + '</th></tr></thead><tbody>';
      for (var k = 0; k < shown.length; k++) {
        var j = shown[k], r = d.rows[j], dp = String(r[0]).split('-');
        var dTxt = !isAll ? (+dp[2]) + '日' : (dp[0] !== thisY ? dp[0].slice(2) + '/' : '') + (+dp[1]) + '/' + (+dp[2]);
        h += '<tr data-i="' + j + '"' + (r[11] === 'shopee' ? ' class="sp"' : ' class="sh"') + '><td class="l d">' + dTxt + '</td><td class="l one">' + esc(r[2] || '') +
          (r[1] ? ' <small>' + esc(r[1]) + '</small>' : (r[11] === 'shopee' ? ' <small class="sp">蝦皮</small>' : '')) + (markOf(r[6]) ? ' ' + markOf(r[6]) : '') +
          (r[8] > 1 ? ' <span class="rp">🔁' + r[8] + '回計' + r[9] + '本</span>' : '') +
          (r[5] ? ' <span class="nt">📝' + esc(r[5]) + '</span>' : '') + '</td>' +
          '<td class="r">' + r[3] + (r[7] ? '<span class="gf">🎁' + r[7] + '</span>' : '') + '</td><td class="r">' + yen(r[4]) +
          (r[10] ? '<div class="py">' + esc(r[10]) + '</div>' : '') + '</td></tr>';
      }
      h += '</tbody></table></div>';
      if (d.cut) h += '<div class="hbempty" style="font-size:14px">※件数が多いため、新しい順に表示できる分だけ表示しています（合計は全件分です）</div>';
    }
    $('hbListBody').innerHTML = h;
  }
  $('hbListBody').addEventListener('click', function (e) {
    var tr = e.target.closest('tr[data-i]'); if (!tr) return;
    var all = LCACHE[LM], d = all && all[LC], r = d && d.rows[parseInt(tr.getAttribute('data-i'), 10)]; if (!r) return;
    var dp = String(r[0]).split('-'), u = LC === 'JP' ? '円' : '元';
    popup((+dp[1]) + '/' + (+dp[2]) + '　' + (r[2] || '') + (r[1] ? '（' + r[1] + '）' : (r[11] === 'shopee' ? '（蝦皮）' : '')) +
      (r[8] > 1 ? '\n🔁' + r[8] + '回 計' + r[9] + '本' : '') +
      '\n' + r[3] + '本' + (r[7] ? '（🎁' + r[7] + '本）' : '') + '　' + yen(r[4]) + u + (r[10] ? '（' + r[10] + '）' : '') +
      '\n担当：' + (r[6] || '－') + (r[5] ? '\n備考：' + r[5] : ''));
  });
  var lsg = $('hbListSeg').querySelectorAll('button');
  for (var l0 = 0; l0 < lsg.length; l0++) lsg[l0].addEventListener('click', function () { LC = this.getAttribute('data-v'); drawList(); });
  var srb = $('hbSrcSeg').querySelectorAll('button');
  for (var s2 = 0; s2 < srb.length; s2++) srb[s2].addEventListener('click', function () {
    var v = this.getAttribute('data-v'), o = v === 'shop' ? 'shopee' : 'shop';
    if (SRC[v] && !SRC[o]) return;   
    SRC[v] = !SRC[v]; drawList();
  });
  var ssg = $('hbSpanSeg').querySelectorAll('button');
  for (var s1 = 0; s1 < ssg.length; s1++) ssg[s1].addEventListener('click', function () {
    if (this.getAttribute('data-v') === 'ALL') { if (LM !== 'ALL') { LMM = LM; LM = 'ALL'; } }
    else if (LM === 'ALL') LM = LMM || thisMonth();
    drawList();
  });
  $('hbMonPrev').addEventListener('click', function () { LM = shiftMonth(LM, -1); drawList(); });
  $('hbMonNext').addEventListener('click', function () { if (LM < thisMonth()) { LM = shiftMonth(LM, 1); drawList(); } });
  prefetch(thisMonth());
  if (needPick()) { drawWho(); hist = []; show('hbWho', true); }
}
function renderHanbaiPage_(base, staff, dev) {
  var head = function (icon, name, id) {
    return '<div class="hhead"><span class="bmark">' + icon + '</span><span class="bname"' + (id ? ' id="' + id + '"' : '') + '>' + name + '</span></div>';
  };
  var inBack = '<div class="ubar"><a class="uhome hbback" href="javascript:void(0)">← 戻る</a></div>';
  var sum = '<div class="hbsum"></div>';
  var pad = function (id) { return '<div class="expad" id="' + id + '">' + EXPADHTML_ + '</div>'; };
  var count = function (id, icon, title, hint) {
    return '<div id="' + id + '" style="display:none">' + inBack + head(icon, title) + sum +
      (hint ? '<div class="hbbighint">' + hint + '</div>' : '') +
      '<div class="hbqty" id="' + id + 'Btns"></div>' +
      '<div id="' + id + 'More" style="display:none">' + pad(id + 'Pad') +
        '<button type="button" class="exgo" id="' + id + 'Go">これでOK → 次へ</button></div>' +
    '</div>';
  };
  var kana = '';
  for (var r = 0; r < HANBAI_KANA_.length; r++) {
    for (var c = 0; c < 5; c++) {
      var ch = HANBAI_KANA_[r].charAt(c);
      kana += (ch && ch !== '　') ? '<button type="button" data-k="' + ch + '">' + ch + '</button>' : '<span></span>';
    }
  }
  var C = {
    exec: 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec',
    key: 'kx7Q2p9mVt4Zr8'
  };
  return '<style>' + HOMECSS_ + EXPADCSS_ + PROCSTOCKCSS_ + HANBAICSS_ + '</style>' +
    '<div class="home">' + backBar_(base, staff, dev) +
    '<div class="hb">' +
      '<div id="hbWho" style="display:none">' + head('🙋', 'No31 販売管理') +
        '<div class="hbbighint">販売した人の名前を<br>選択してね😊</div>' +
        '<div class="pspeople" id="hbWhoBtns"></div>' +
      '</div>' +
      '<div id="hbMenu">' + head('🛒', 'No31 販売管理') +
        '<div class="hbwho" id="hbWhoLine" style="display:none">販売した人：<b id="hbWhoName"></b>' +
          '<button type="button" id="hbWhoChange">変更</button></div>' +
        '<div class="hbok" id="hbMenuMsg" style="display:none"></div>' +
        '<button type="button" class="hbbig" id="hbGoTW"><span class="i">🇹🇼</span>台湾販売入力</button>' +
        '<button type="button" class="hbbig" id="hbGoJP"><span class="i">🇯🇵</span>日本販売入力</button>' +
        '<button type="button" class="hbbig" id="hbGoStock"><span class="i">📦</span>No31 お店在庫入力</button>' +
        '<button type="button" class="hbbig" id="hbGoList"><span class="i">📋</span>販売管理表</button>' +
      '</div>' +
      '<div id="hbDate" style="display:none">' + inBack + head('📅', '', 'hbDateHead') +
        '<div class="hbhint">販売日</div>' +
        '<div class="hbdate" id="hbDateBox"></div>' +
        '<div class="hb3 hb4"><button type="button" id="hbToday0">今日</button><button type="button" id="hbYest">昨日</button><button type="button" id="hbOto">おととい</button>' +
          '<button type="button" id="hbCalBtn" class="hbcal">カレンダー<br>選択<input type="date" id="hbCal" data-own-reset></button></div>' +
        '<button type="button" class="exgo" id="hbDateGo">この日で次へ</button>' +
      '</div>' +
      '<div id="hbJKind" style="display:none">' + inBack + head('🇯🇵', '日本販売入力') + sum +
        '<button type="button" class="hbbig" id="hbJNewBtn"><span class="i">🆕</span>新規お客様</button>' +
        '<button type="button" class="hbbig" id="hbJRepBtn"><span class="i">🔁</span>お客様</button>' +
      '</div>' +
      '<div id="hbJNew" style="display:none">' + inBack + head('🆕', 'お客様氏名入力') + sum +
        '<div class="hblb">氏</div><input class="hbin" id="hbSei" autocomplete="off" placeholder="例：山田">' +
        '<div class="hblb">名</div><input class="hbin" id="hbMei" autocomplete="off" placeholder="例：花子">' +
        '<button type="button" class="exgo" id="hbJNewGo">次へ</button>' +
      '</div>' +
      '<div id="hbKana" style="display:none">' + inBack + head('🔁', 'お客様') + sum +
        '<div class="hbhint">苗字の最初の文字を選択してね😊<br><small>「ご」は「こ」、「ぱ」は「は」をえらびます。英字などは「他」</small></div>' +
        '<div class="hbkana" id="hbKanaGrid">' + kana + '</div>' +
      '</div>' +
      '<div id="hbCands" style="display:none">' + inBack + head('🔁', '', 'hbCandHead') + sum +
        '<div class="hbhint">お客様を選択してね😊</div>' +
        '<div class="hbrows hbcards" id="hbCandRows"></div>' +
        '<div class="hbempty" id="hbCandNone">前に買ったお客様が見つかりません</div>' +
        '<button type="button" class="hbbig" id="hbCandNew"><span class="i">🆕</span>新規お客様として入力</button>' +
      '</div>' +
      '<div id="hbTKind" style="display:none">' + inBack + head('🇹🇼', '台湾販売入力') + sum +
        '<button type="button" class="hbbig" id="hbTodayBtn"><span class="i">📅</span><span id="hbTodayBtnTx">本日予約のお客様</span></button>' +
        '<button type="button" class="hbbig" id="hbNumBtn"><span class="i">🔢</span>お客様番号検索</button>' +
        '<button type="button" class="hbbig" id="hbShopBtn"><span class="i">🛍️</span>蝦皮で販売</button>' +
      '</div>' +
      '<div id="hbShop" style="display:none">' + inBack + head('🛍️', '蝦皮のお客様') + sum +
        '<div class="hblb">お名前</div><input class="hbin" id="hbShopName" autocomplete="off" placeholder="例：王小明">' +
        '<button type="button" class="exgo" id="hbShopGo">次へ</button>' +
      '</div>' +
      '<div id="hbToday" style="display:none">' + inBack + head('📅', '本日予約のお客様', 'hbTodayHead') + sum +
        '<div class="hbrows hbcards" id="hbTodayRows"></div>' +
        '<div class="hbempty" id="hbTodayNone">本日の予約はありません</div>' +
      '</div>' +
      '<div id="hbNum" style="display:none">' + inBack + head('🔢', 'お客様番号検索') + sum +
        '<div class="exbox psbox" id="hbNumBox"></div>' +
        '<div class="hbseg" id="hbNumSeg"><button type="button" data-v="F">F（女性）</button><button type="button" data-v="M">M（男性）</button></div>' +
        pad('hbNumPad') +
        '<button type="button" class="exgo" id="hbNumGo">検索</button>' +
      '</div>' +
      count('hbQty', '🧴', '販売本数', '') +
      count('hbGift', '🎁', 'プレゼントの有無', '無料であげた本数を<br>選択してね😊') +
      '<div id="hbPay" style="display:none">' + inBack + head('💳', '支払方法') + sum +
        '<div class="hbpay" id="hbPayBtns"></div>' +
      '</div>' +
      '<div id="hbAmt" style="display:none">' + inBack + head('💴', '', 'hbAmtHead') + sum +
        '<div class="exbox psbox" id="hbAmtBox"></div>' + pad('hbAmtPad') +
        '<button type="button" class="exgo" id="hbAmtGo">これでOK → 次へ</button>' +
      '</div>' +
      '<div id="hbNote" style="display:none">' + inBack + head('📝', '備考入力') + sum +
        '<div class="hbhint">空欄でも可</div>' +
        '<textarea class="hbin" id="hbNoteIn" maxlength="200"></textarea>' +
        '<button type="button" class="exgo" id="hbNoteGo">次へ</button>' +
      '</div>' +
      '<div id="hbConf" style="display:none">' + inBack + head('✅', '確認') +
        '<div class="hbconf" id="hbConfRows"></div>' +
        '<div class="hbq">以上の内容で登録しますか？😊</div>' +
        '<button type="button" class="exgo" id="hbSend">登録する</button>' +
        '<div class="hbst" id="hbSt"></div>' +
      '</div>' +
      '<div id="hbStock" style="display:none">' + inBack + head('📦', 'No31 お店在庫入力') +
        '<div class="psname">今お店にある<br>ホホバエッセンスNo31<br>の本数</div>' +
        '<div class="exbox psbox" id="hbStBox"></div>' +
        '<div class="expad" id="hbStPad">' + EXPADHTML_ + '</div>' +
        '<button type="button" class="exgo" id="hbStOk">これでOK → 確認へ</button>' +
        '<div class="pswho" id="hbStWho"></div>' +
      '</div>' +
      '<div id="hbStockConf" style="display:none">' + inBack + head('📦', 'この内容で登録します') +
        '<div class="hbconf" id="hbStRows"></div>' +
        '<button type="button" class="exgo" id="hbStSend">これで在庫を登録</button>' +
        '<div class="psst" id="hbStSt"></div>' +
      '</div>' +
      '<div id="hbList" style="display:none">' + inBack + head('📋', '販売管理表') +
        '<div class="hbseg" id="hbListSeg"><button type="button" class="on" data-v="TW">🇹🇼 台湾（元）</button><button type="button" data-v="JP">🇯🇵 日本（円）</button></div>' +
        '<div class="hbseg sm" id="hbSpanSeg"><button type="button" class="on" data-v="M">📅 月ごと</button><button type="button" data-v="ALL">🗂 全期間</button></div>' +
        '<div class="hbseg sm" id="hbSrcSeg"><button type="button" class="on" data-v="shop">🏪 お店購入</button><button type="button" class="on" data-v="shopee">🛍️ 蝦皮購入</button></div>' +
        '<div class="hbmon" id="hbMonRow"><button type="button" id="hbMonPrev">◀</button><div id="hbMonTxt"></div><button type="button" id="hbMonNext">▶</button></div>' +
        '<div id="hbListBody"></div>' +
      '</div>' +
    '</div></div>' +
    '<script>(' + hanbaiScript_.toString() + ')(' + JSON.stringify(C).replace(/</g, '\\u003c') + ');<\/script>';
}
