// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：uriagebook
var UBCSS_ =
  '.ub{width:100%;box-sizing:border-box;max-width:1200px;margin:0 auto;padding:0 6px 70px;text-align:left;}' +
  '.home.ubhome{max-width:1200px;padding-top:6px;}' +
  '.ubtop{display:flex;align-items:center;flex-wrap:wrap;gap:6px 12px;margin:0 2px 6px;}' +
  '.ubtop .ubar{margin:0;}' +
  '.ubtop .uhome{padding:7px 12px;}' +
  '.ubttl{font-size:20px;line-height:1.2;margin:0;}' +
  '.ubwhen{color:#eaf6fb;font-weight:800;font-size:15px;}' +
  '.ubtop2{display:flex;align-items:center;flex-wrap:wrap;gap:6px 12px;margin:0 2px 6px;}' +
  '.ubtop2 .ubhint{font-size:15px;margin:0;}' +
  '.ubtop2 .ubadd{padding:7px 14px;margin-left:auto;}' +
  '#ubMenu,#ubNoInv,#ubAdd,#ubOther,#ubCoins{max-width:560px;margin:0 auto;}' +
  '@media (min-width:700px){.ubtbl table{table-layout:auto;font-size:14px;}.ubtbl col{width:auto!important;}' +
  '.ubtbl th,.ubtbl td{white-space:nowrap;padding-left:8px;padding-right:8px;}.ubtbl th br{display:none;}.ubtbl td.d{white-space:normal;width:100%;}}' +
  '.ubinfo2{display:flex;align-items:center;gap:8px;color:#eaf6fb;font-weight:800;font-size:15px;margin:2px 4px 8px;}' +
  '.ubsm{background:#fff;color:#2C7A99;border:0;border-radius:8px;padding:4px 10px;font:inherit;font-size:13px;font-weight:900;cursor:pointer;}' +
  '.ubhrow{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:12px 4px 6px;}' +
  '.ubhrow .ubh{margin:0;}' +
  '.ubadd{flex:0 0 auto;background:#16a34a;color:#fff;border:0;border-radius:10px;padding:8px 14px;font:inherit;font-size:15px;font-weight:900;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.18);}' +
  '.ubtime{display:flex;gap:8px;align-items:center;}' +
  '.ubu{color:#fff;font-weight:900;font-size:18px;}' +
  '.ubbox{display:flex;align-items:center;min-height:50px;box-sizing:border-box;background:#fff;color:#0f172a;border-radius:12px;padding:8px 14px;font-size:24px;font-weight:900;letter-spacing:.04em;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.12);}' +
  '.ubbox:empty::before{content:attr(data-ph);color:#94a3b8;font-size:15px;font-weight:700;letter-spacing:normal;}' +
  '.ubbox.t{width:76px;justify-content:center;padding:8px 4px;}' +
  '.ubbox.sel{outline:4px solid #fde047;}' +
  '.ubnumrow{display:flex;gap:8px;align-items:center;}' +
  '.ubnumrow .ubbox{flex:1 1 auto;min-width:0;}' +
  '.ubok{flex:0 0 auto;min-height:50px;background:#16a34a;color:#fff;border:0;border-radius:12px;padding:0 20px;font:inherit;font-size:18px;font-weight:900;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.18);}' +
  '.ubkp{margin:12px 0 0;}' +
  '.ubkp .expad{margin:0 0 6px;}' +
  '.exseg{position:relative;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;background:rgba(255,255,255,.16);border-radius:16px;padding:6px;margin:0 0 10px;overflow:hidden;}' +
  '.exseg .thumb{position:absolute;top:6px;bottom:6px;left:6px;width:calc((100% - 12px)/3);background:#fff;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,.18);transition:transform .22s;}' +
  '.exseg button{position:relative;z-index:1;background:none;border:0;padding:14px 4px;font-size:19px;font-weight:800;color:#eaf6fb;cursor:pointer;}' +
  '.exseg button[aria-pressed="true"]{color:#0f172a;}' +
  '.exseg.two .thumb{width:calc((100% - 12px)/2);}' +
  '.ubpick .ubbox{border:2px solid #cbd5e1;box-shadow:none;}' +
  '.ubpick .exseg{background:#2C7A99;}' +
  '.ubpick .expad{gap:8px;}' +
  '.ubpick .expad button{background:#f1f5f9;box-shadow:none;font-size:26px;padding:6px 0;}' +
  '.ubpick .expad button.util{background:#fde2e4;}' +
  '.ubnow{flex:0 0 auto;background:#fff;color:#2C7A99;border:0;border-radius:12px;padding:0 18px;min-height:50px;font:inherit;font-size:17px;font-weight:900;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.12);}' +
  '.ubtest{background:#fde047;color:#7c2d12;font-weight:900;font-size:15px;border-radius:12px;padding:8px 12px;margin:4px 0 10px;text-align:center;}' +
  '.ubinfo{color:#eaf6fb;font-weight:800;font-size:15px;margin:2px 4px 8px;display:flex;justify-content:space-between;align-items:center;gap:8px;}' +
  '.ubinfo button{background:#fff;color:#2C7A99;border:0;border-radius:10px;padding:8px 12px;font:inherit;font-size:14px;font-weight:900;cursor:pointer;}' +
  '.ubsum{background:#fff;border-radius:14px;padding:10px 12px;margin:6px 0 12px;color:#0f172a;box-shadow:0 4px 14px rgba(0,0,0,.15);}' +
  '.ubsum .r{display:flex;justify-content:space-between;font-weight:800;font-size:16px;padding:3px 0;}' +
  '.ubsum .r.t{border-top:2px solid #0f172a;margin-top:4px;padding-top:6px;font-size:18px;font-weight:900;}' +
  '.ubsum .r.w{color:#b91c1c;}' +
  '.ubh{color:#fff;font-weight:900;font-size:19px;margin:16px 4px 6px;}' +
  '.ubtbl{background:#fff;border-radius:12px;overflow:hidden;margin:0 0 10px;box-shadow:0 3px 10px rgba(0,0,0,.14);}' +
  '.ubtbl table{width:100%;border-collapse:collapse;color:#0f172a;font-size:12px;table-layout:fixed;}' +
  '.ubtbl td.w{white-space:nowrap;word-break:normal;letter-spacing:-.02em;}' +
  '.ubtbl th{background:#fff2cc;color:#0f172a;font-weight:800;font-size:12px;padding:6px 3px;border-bottom:1px solid #cbd5e1;}' +
  '.ubtbl td{border-bottom:1px solid #e2e8f0;padding:7px 2px;vertical-align:top;font-weight:700;word-break:break-all;}' +
  '.ubtbl td.e{cursor:pointer;}' +
  '.ubtbl tr.pend td{opacity:.5;}' +
  '.ubtbl tr.del td{text-decoration:line-through;}' +
  '.ubtbl tbody tr:nth-child(even) td{background:#d8e4ee;}' +   
  '@media (hover:hover){.ubtbl tbody tr:hover td{background:#aed8fb;}}' +
  '.ubtbl td.e:active{background:#bfdbfe;}' +
  '.ubtbl td.xc{text-align:center;padding:4px 1px;}' +
  '.ubtbl tfoot td{font-weight:900;font-size:15px;padding:9px 8px;background:#fff2cc;border-top:2px solid #cbd5e1;}' +
  '.ubtbl td.ubnone{padding:14px;text-align:center;color:#64748b;}' +
  '.ubtbl th{text-align:left;}.ubtbl th.c{text-align:center;}.ubtbl th.r{text-align:right;}' +
  '.ubx{background:#fee2e2;color:#b91c1c;border:0;border-radius:8px;width:28px;height:28px;font:inherit;font-weight:900;font-size:17px;line-height:1;cursor:pointer;}' +
  '.ubpick input,.ubpick textarea{display:block;width:100%;box-sizing:border-box;border:2px solid #cbd5e1;border-radius:10px;padding:10px;font:inherit;font-size:18px;color:#0f172a;margin:4px 0 10px;}' +
  '.ubpick .go{display:block;width:100%;background:#16a34a;color:#fff;border:0;border-radius:10px;padding:14px;font:inherit;font-size:17px;font-weight:900;cursor:pointer;}' +
  '.ubtbl td.n{text-align:right;white-space:nowrap;}' +
  '.ubtbl td.d{white-space:pre-wrap;font-weight:600;}' +
  '.ubtbl td.p{text-align:center;font-weight:800;font-size:12px;}' +
  '.ubtbl td.p.np{background:#fde68a;color:#9a3412;}' +
  '.ubmask{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;}' +
  '.ubpick{background:#fff;border-radius:16px;padding:16px;width:100%;max-width:420px;color:#0f172a;box-shadow:0 8px 24px rgba(0,0,0,.3);}' +
  '.ubpick .h{font-weight:900;font-size:18px;margin-bottom:4px;}' +
  '.ubpick .s{font-weight:700;font-size:14px;color:#475569;margin-bottom:12px;white-space:pre-wrap;}' +
  '.ubpick .ubpay button{padding:16px 2px;font-size:16px;}' +
  '.ubpick .x{display:block;width:100%;margin-top:12px;background:#f1f5f9;border:0;border-radius:10px;padding:12px;font:inherit;font-size:16px;font-weight:800;color:#0f172a;cursor:pointer;}' +
  '.ubpay{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}' +
  '.ubpay button{border:2px solid #cbd5e1;background:#f8fafc;color:#0f172a;border-radius:10px;padding:10px 2px;font:inherit;font-size:14px;font-weight:900;cursor:pointer;}' +
  '.ubpay button.on{background:#2C7A99;border-color:#2C7A99;color:#fff;}' +
  '.ubdel{display:block;margin:8px 0 0 auto;background:none;border:0;color:#b91c1c;font:inherit;font-size:14px;font-weight:800;cursor:pointer;text-decoration:underline;}' +
  '.ubnone{color:#eaf6fb;font-weight:800;font-size:17px;text-align:center;margin:14px 0;}' +
  '.ubmenu{display:grid;grid-template-columns:1fr;gap:10px;margin:14px 0;}' +
  '.ubmenu button{background:#fff;color:#0f172a;border:0;border-radius:14px;padding:16px 10px;font:inherit;font-size:19px;font-weight:900;cursor:pointer;box-shadow:0 3px 8px rgba(0,0,0,.15);}' +
  '.ubf label{display:block;color:#fff;font-weight:800;font-size:16px;margin:10px 4px 4px;}' +
  '.ubf input{display:block;width:100%;box-sizing:border-box;border:0;border-radius:12px;padding:12px;font:inherit;font-size:19px;color:#0f172a;box-shadow:0 3px 8px rgba(0,0,0,.12);}' +
  '.ubf input.sel{outline:4px solid #fde047;}' +
  '.ubnamerow{display:flex;align-items:center;gap:8px;}.ubnamerow input{flex:1 1 auto;min-width:0;}' +
  '.ubcoin{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px 8px;margin-top:4px;}' +
  '.ubcell .lab{color:#fff;font-weight:800;font-size:15px;margin:0 2px 4px;}' +
  '.ubcell .ubbox{justify-content:center;}' +
  '#ubCoins .ubkp{margin-top:12px;}' +
  '.uboth{background:#fff;border-radius:14px;overflow:hidden;margin:4px 0 10px;color:#0f172a;}' +
  '.uboth .r{display:flex;justify-content:space-between;padding:9px 12px;border-top:1px solid #e2e8f0;font-weight:800;font-size:16px;}' +
  '.uboth .r:first-child{border-top:0;}';
function ubPendAdd_(o) { var a = ubPendList_(); a.push(o); ubPendSave_(a); ubWatch_(); }
function uriageBookScript_(C) {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function yen(n) { return (n == null || n === '') ? '―' : Number(n).toLocaleString('ja-JP') + '元'; }
  function popup(msg, o) { if (typeof szPopup_ === 'function') szPopup_(msg, o); else alert(msg); }
  var PAYS = ['現金', 'LINE PAY', '街口支付', '振込'];
  var SECS = ['ubMenu', 'ubInv', 'ubNoInv', 'ubAdd', 'ubOther', 'ubCoins'];
  function show(id) { for (var i = 0; i < SECS.length; i++) $(SECS[i]).style.display = (SECS[i] === id) ? '' : 'none'; window.scrollTo(0, 0); }
  var D = null, busy = false, loading = false;
  var PEND = [];          
  function pendAll() { return PEND.concat(ubPendList_()); }
  function rk(x) { return x.no ? 'n:' + x.no : 'x:' + (x.num || '') + '|' + (x.amount == null ? '' : x.amount); }
  function ok(y) { return 'o:' + (y.label || '') + '|' + (y.amount == null ? '' : y.amount); }
  function applyPend() {
    if (!D || !D.rows) return;
    for (var i2 = 0; i2 < PEND.length; i2++) {
      var g = PEND[i2]; if (g.action !== 'oedit' && g.action !== 'odelete') continue;
      for (var j2 = 0; j2 < (D.others || []).length; j2++) {
        var y = D.others[j2]; if (ok(y) !== g._k) continue;
        y._pend = true;
        if (g.action === 'odelete') y._del = true;
        else if (g.col === 'J') y.label = g.value;
        else { var n2 = parseInt(String(g.value).replace(/[^\d\-]/g, ''), 10); if (!isNaN(n2)) y.amount = n2; }
      }
    }
    for (var i = 0; i < PEND.length; i++) {
      var f = PEND[i];
      for (var j = 0; j < D.rows.length; j++) {
        var x = D.rows[j]; if (rk(x) !== f._k) continue;
        x._pend = true;
        if (f.action === 'pay') x.pay = f.value;
        else if (f.action === 'delete') x._del = true;
        else if (f.action === 'edit') {
          if (f.col === 'B') x.num = String(f.value).toUpperCase();
          else if (f.col === 'C') x.name = f.value;
          else if (f.col === 'E') x.detail = f.value;
          else if (f.col === 'F') { var n = parseInt(String(f.value).replace(/[^\d\-]/g, ''), 10); if (!isNaN(n)) x.amount = n; }
        }
      }
    }
  }
  function setWhen(t) { $('ubWhen').textContent = t; $('ubWhen2').textContent = t; $('ubWhen3').textContent = t; }
  function jsonp(p, cb) {
    var n = '__ubk' + Date.now() + Math.floor(Math.random() * 1000);
    window[n] = function (r) { try { delete window[n]; } catch (e) {} cb(r); };
    var q = 'callback=' + n; for (var k in p) q += '&' + k + '=' + encodeURIComponent(p[k]);
    var s = document.createElement('script'); s.src = C.exec + '?' + q + '&cb=' + Date.now();
    s.onerror = function () { cb({ ok: false, error: '通信エラーです' }); }; document.body.appendChild(s);
  }

  function draw() {
    if (!D || !D.rows) { $('ubList').innerHTML = '<div class="ubnone">読み込み中です…</div>'; return; }
    $('ubTest').style.display = (D.mode === 'テスト') ? '' : 'none';
    setWhen(D.tab + ' の売上表　' + String(D.at || '').slice(11, 16) + ' 時点');
    var L = '';
    if (!D.rows.length) L = '<div class="ubnone">まだ売上の行がありません</div>';
    else {
      L = '<div class="ubtbl"><table><colgroup><col style="width:11%"><col style="width:8%"><col style="width:12%"><col style="width:13%">' +
        '<col style="width:11%"><col><col style="width:14%"><col style="width:9%"></colgroup>' +
        '<thead><tr><th>時刻</th><th>發票<br>下3桁</th><th>顧客<br>番号</th><th>顧客名</th><th class="c">支払</th><th>明細</th><th class="r">合計</th><th class="c">削除</th></tr></thead><tbody>';
      for (var j = 0; j < D.rows.length; j++) {
        var x = D.rows[j];
        L += '<tr class="r' + (x._pend ? ' pend' : '') + (x._del ? ' del' : '') + '" data-j="' + j + '"><td class="w">' + esc(x.time || '') + '</td><td class="w">' + esc(x.no) + '</td>' +
          '<td class="w e" data-c="B">' + esc(x.num) + '</td><td class="e" data-c="C">' + esc(x.name) + '</td>' +
          '<td class="p e' + (x.pay ? '' : ' np') + '" data-c="D">' + esc(x.pay ? ({ '街口支付': '街口', 'LINE PAY': 'LINE' }[x.pay] || x.pay) : '未選択') + '</td>' +
          '<td class="d e" data-c="E">' + esc(x.detail) + '</td><td class="n e" data-c="F">' + (x.amount == null ? '' : Number(x.amount).toLocaleString('ja-JP')) + '</td>' +
          '<td class="xc"><button type="button" class="ubx" data-a="del" aria-label="削除">×</button></td></tr>';
      }
      L += '</tbody></table></div>';
    }
    $('ubList').innerHTML = L;
    var O = D.others || [];
    var o = '<div class="ubtbl"><table><colgroup><col><col style="width:22%"><col style="width:13%"></colgroup>' +
      '<thead><tr><th>内容</th><th class="r">金額</th><th class="c">削除</th></tr></thead><tbody>';
    if (!O.length) o += '<tr><td colspan="3" class="ubnone">まだ行がありません</td></tr>';
    for (var q = 0; q < O.length; q++) {
      var y = O[q];
      o += '<tr class="r' + (y._pend ? ' pend' : '') + (y._del ? ' del' : '') + '" data-q="' + q + '">' +
        '<td class="d e" data-c="J">' + esc(y.label) + '</td>' +
        '<td class="n e" data-c="K">' + (y.amount == null ? '' : Number(y.amount).toLocaleString('ja-JP')) + '</td>' +
        '<td class="xc"><button type="button" class="ubx" data-a="del" aria-label="削除">×</button></td></tr>';
    }
    o += '</tbody><tfoot><tr class="ubsum"><td>合計</td><td class="n">' + (D.other_total == null ? '' : Number(D.other_total).toLocaleString('ja-JP')) + '</td><td></td></tr></tfoot></table></div>';
    $('ubOthers').innerHTML = o;
  }
  function fetchData(after) {
    jsonp({ action: 'data', name: 'uriagebook.json' }, function (p) {
      if (p && p.rows) { D = p; applyPend(); draw(); if (typeof CP !== 'undefined' && !coinTouched) fillCoins(); }
      if (after) after(p);
    });
  }

  function ask(fields, title, onOk, quiet) {
    if (quiet) {
      if (loading) return;
      loading = true; setWhen('最新の売上表を読んでいます…');
    } else {
      PEND.push(fields); applyPend(); draw();
      popup('バックグラウンドで書き込みします。しばらく時間がかかります。', { icon: '📝' });
      if (onOk) onOk();
    }
    function settle() {
      if (quiet) { loading = false; return; }
      var i = PEND.indexOf(fields); if (i >= 0) PEND.splice(i, 1);
    }
    function fail(msg) {
      settle();
      if (!quiet) popup(msg || 'スプレッドシートの売上帳簿への書き込みが失敗しました。りゅうさんに連絡してください🙇');
      fetchData();
    }
    jsonp({ action: 'submit', key: C.key, op: 'uriagebook', who: window.__SZ_WHO_ || '', role: window.__SZ_ROLE_ || '',
            device: window.__SZ_DEVICE_ || '', fields: JSON.stringify(fields) }, function (r) {
      if (!r || !r.ok || !r.id) { fail(''); return; }
      if (!quiet) {
        fields.__id = r.id;
        ubPendAdd_({ id: r.id, at: Date.now(), row: fields.row || 0, action: fields.action });
        return;
      }
      var n = 0, max = (typeof LIMITS !== 'undefined') ? LIMITS.tries('uriagebook', 1000) : 300;
      (function poll() {
        n++;
        if (n > max) { fail(''); return; }
        jsonp({ action: 'status', key: C.key, id: r.id }, function (s) {
          if (!s || !s.ok || s.status === 'pending' || s.status === 'running' || s.status === 'queued' || s.status === '') { setTimeout(poll, 1000); return; }
          if (s.status !== 'done') { fail(s.result || ''); return; }
          settle(); fetchData();
        });
      })();
    });
  }

  if (window.__ubDoneH) window.removeEventListener('ubdone', window.__ubDoneH);
  window.__ubDoneH = function (ev) {
    var id = ev && ev.detail && ev.detail.id;
    for (var i = PEND.length - 1; i >= 0; i--) if (PEND[i].__id === id) PEND.splice(i, 1);
    fetchData();
  };
  window.addEventListener('ubdone', window.__ubDoneH);

  function padKit(cont, spec) {
    var V = {}, pre = {}, sign = {}, sel = '', fresh = false;
    var kp = document.createElement('div'); kp.className = 'ubkp'; kp.style.display = 'none';
    kp.innerHTML = '<div class="exseg" data-s="pre"><span class="thumb"></span><button type="button" data-v="M">M（男）</button>' +
      '<button type="button" data-v="F">F（女）</button><button type="button" data-v="">文字なし</button></div>' +
      '<div class="exseg two" data-s="sign"><span class="thumb"></span><button type="button" data-v="">プラス</button>' +
      '<button type="button" data-v="-">マイナス（経費など）</button></div>' +
      '<div class="expad">' + EXPADHTML_ + '</div>';
    function box(k) { return cont.querySelector('.ubbox[data-pk="' + k + '"]'); }
    function val(k) {
      var d = V[k] || '', t = (spec[k] || {}).kind;
      if (!d) return '';
      if (t === 'num') return (pre[k] || '') + d;
      if (t === 'sint') return (sign[k] || '') + d;
      return d;
    }
    function segs() {
      var t = sel ? spec[sel].kind : '', ss = kp.querySelectorAll('.exseg');
      for (var i = 0; i < ss.length; i++) {
        var nm = ss[i].getAttribute('data-s'), on = (nm === 'pre' && t === 'num') || (nm === 'sign' && t === 'sint');
        ss[i].style.display = on ? '' : 'none';
        if (!on) continue;
        var cur = nm === 'pre' ? (pre[sel] || '') : (sign[sel] || ''), bs = ss[i].querySelectorAll('button'), at = 0;
        for (var j = 0; j < bs.length; j++) { var o = bs[j].getAttribute('data-v') === cur; bs[j].setAttribute('aria-pressed', o ? 'true' : 'false'); if (o) at = j; }
        ss[i].querySelector('.thumb').style.transform = 'translateX(' + (at * 100) + '%)';
      }
    }
    function draw() {
      for (var k in spec) {
        var b = box(k); if (!b) continue;
        var v = val(k);
        if (spec[k].comma && V[k]) v = (spec[k].kind === 'sint' ? (sign[k] || '') : '') + Number(V[k]).toLocaleString();
        b.textContent = v;
        b.classList.toggle('sel', sel === k);
        var o = cont.querySelector('[data-pok="' + k + '"]');
        if (o) o.style.display = (sel === k) ? '' : 'none';
      }
    }
    function open(k) {
      sel = k; fresh = true;
      var b = box(k), row = b.closest('.ubrow') || b.parentNode;
      row.appendChild(kp); kp.style.display = '';
      segs(); draw();
      setTimeout(function () { try { kp.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {} }, 30);
    }
    function close() {
      if (sel && spec[sel].open) return;
      sel = ''; kp.style.display = 'none'; draw();
    }
    cont.addEventListener('click', function (e) {
      var b = e.target.closest('.ubbox[data-pk]');
      if (b) { var k = b.getAttribute('data-pk'); if (sel === k) close(); else open(k); return; }
      if (e.target.closest('[data-pok]')) close();
    });
    kp.addEventListener('click', function (e) {
      var g = e.target.closest('.exseg button');
      if (g) {
        if (g.closest('.exseg').getAttribute('data-s') === 'pre') pre[sel] = g.getAttribute('data-v') || '';
        else sign[sel] = g.getAttribute('data-v') || '';
        segs(); draw(); return;
      }
      var b = e.target.closest('.expad button'); if (!b || !sel) return;
      var k = b.getAttribute('data-k') || b.textContent, sp = spec[sel], d = V[sel] || '';
      if (k === 'clr') { d = ''; fresh = false; }
      else if (k === 'del') { d = d.slice(0, -1); fresh = false; }
      else if (/^[0-9]$/.test(k)) {
        if (fresh) { d = ''; fresh = false; }
        if (sp.max && d.length >= sp.max) return;
        var t = (d === '0' && sp.comma) ? k : d + k;
        if (sp.lim != null && parseInt(t, 10) > sp.lim) return;
        d = t;
      } else return;
      V[sel] = d;
      if (/^[0-9]$/.test(k) && sp.max && d.length >= sp.max) {
        if (sp.next) { open(sp.next); return; }
        if (sp.auto) { close(); return; }
      }
      draw();
    });
    return {
      get: val,
      raw: function (k) { return V[k] || ''; },
      set: function (k, v) {
        v = String(v == null ? '' : v).toUpperCase().replace(/[\s,]/g, '');
        var t = (spec[k] || {}).kind;
        if (t === 'num') { var m = v.match(/^([MF]?)(\d*)/); pre[k] = v ? (m ? m[1] : '') : 'M'; V[k] = m ? m[2] : ''; }
        else if (t === 'sint') { sign[k] = v.charAt(0) === '-' ? '-' : ''; V[k] = v.replace(/\D/g, ''); }
        else V[k] = v.replace(/\D/g, '');
        draw();
      },
      open: open, close: close
    };
  }

  var CNAME ={ B: '顧客番号', C: '顧客名', D: '支払方法', E: '明細', F: '合計' };
  function closePick() { var m = $('ubMask'); if (m && m.parentNode) m.parentNode.removeChild(m); }
  function openPick(x, col) {
    var head = '<div class="h">' + esc(x.no || '番号なし') + '　' + esc(x.num) + ' ' + esc(x.name) + '　' + yen(x.amount) + '</div>' +
      '<div class="s">' + CNAME[col] + 'を修正します</div>';
    var body = '';
    if (col === 'D') {
      for (var k = 0; k < PAYS.length; k++) body += '<button type="button" data-v="' + esc(PAYS[k]) + '" class="' + (x.pay === PAYS[k] ? 'on' : '') + '">' + esc(PAYS[k] === '街口支付' ? '街口' : PAYS[k]) + '</button>';
      body = '<div class="ubpay">' + body + '</div>';
    } else {
      var cur = { B: x.num, C: x.name, E: x.detail, F: (x.amount == null ? '' : String(x.amount)) }[col] || '';
      var isPad = (col === 'B' || col === 'F');   
      body = (isPad ? '<div class="ubrow"><div class="ubbox" data-pk="v" data-ph="数字を押してね😊"></div></div>'
        : col === 'E' ? '<textarea id="ubEd" rows="3"></textarea>' : '<input id="ubEd">') +
        '<button type="button" class="go" data-a="save" style="margin-top:12px">以上の内容で修正する</button>';
    }
    var m = document.createElement('div'); m.className = 'ubmask'; m.id = 'ubMask';
    m.innerHTML = '<div class="ubpick">' + head + body + '<button type="button" class="x" data-a="close">閉じる</button></div>';
    document.body.appendChild(m);
    var ed = $('ubEd'), PK = null;
    if (ed) { ed.value = cur; try { ed.focus(); } catch (e2) {} }
    if (isPad) {
      PK = padKit(m.querySelector('.ubpick'), { v: col === 'B' ? { kind: 'num', max: 4, open: true } : { kind: 'int', max: 7, comma: true, open: true } });
      PK.set('v', cur); PK.open('v');
    }
    m.addEventListener('click', function (ev) {
      if (ev.target === m) { closePick(); return; }
      var b = ev.target.closest('button'); if (!b) return;
      var a = b.getAttribute('data-a');
      if (a === 'close') { closePick(); return; }
      if (col === 'D') {
        var v = b.getAttribute('data-v'); if (!v) return;
        closePick();
        if (x.pay !== v) ask({ action: 'pay', row: x.r, no: x.no, num: x.num, amount: x.amount, _k: rk(x), value: v }, '支払方法を書いています');
        return;
      }
      if (a !== 'save') return;
      var nv = PK ? PK.get('v') : $('ubEd').value;
      if (col === 'F' && !/\d/.test(nv)) { popup('合計は数字で入力してね😊'); return; }
      closePick();
      if (nv === cur) return;
      ask({ action: 'edit', row: x.r, no: x.no, num: x.num, amount: x.amount, _k: rk(x), col: col, value: nv }, CNAME[col] + 'を修正しています');
    });
  }
  $('ubList').addEventListener('click', function (e) {
    if (busy || !D) return;
    var tr = e.target.closest('tr.r'); if (!tr) return;
    var x = D.rows[parseInt(tr.getAttribute('data-j'), 10)]; if (!x) return;
    if (x._del) { popup('この行は削除中です。'); return; }
    if (e.target.closest('button[data-a="del"]')) {
      var head1 = [x.time || '', x.no ? '發票番号' + x.no : '發票番号なし', ((x.num || '') + ' ' + (x.name || '')).trim(), yen(x.amount)]
        .filter(function (v) { return v; }).join('　');
      popup(head1 + '\n發票の入力間違いですか？\nそうであればこの行を削除します', {
        cancel: true, onYes: function () { ask({ action: 'delete', row: x.r, no: x.no, num: x.num, amount: x.amount, _k: rk(x) }, '行を削除しています'); }
      });
      return;
    }
    var td = e.target.closest('td.e'); if (!td) return;   
    openPick(x, td.getAttribute('data-c'));
  });
  $('ubReload').addEventListener('click', function () { ask({ action: 'load' }, '', null, true); });
  $('ubReload2').addEventListener('click', function () { ask({ action: 'load' }, '', null, true); });
  $('ubReload3').addEventListener('click', function () { ask({ action: 'load' }, '', null, true); });

  function openPickO(y, col) {
    var head = '<div class="h">' + esc(y.label) + '　' + yen(y.amount) + '</div>' +
      '<div class="s">' + (col === 'J' ? '内容' : '金額') + 'を修正します</div>';
    var cur = col === 'J' ? (y.label || '') : (y.amount == null ? '' : String(y.amount));
    var body = (col === 'K' ? '<div class="ubrow"><div class="ubbox" data-pk="v" data-ph="数字を押してね😊"></div></div>'
      : '<textarea id="ubEd" rows="3"></textarea>') +
      '<button type="button" class="go" data-a="save" style="margin-top:12px">以上の内容で修正する</button>';
    var m = document.createElement('div'); m.className = 'ubmask'; m.id = 'ubMask';
    m.innerHTML = '<div class="ubpick">' + head + body + '<button type="button" class="x" data-a="close">閉じる</button></div>';
    document.body.appendChild(m);
    var PK = null;
    if (col === 'J') { $('ubEd').value = cur; try { $('ubEd').focus(); } catch (e2) {} }
    else { PK = padKit(m.querySelector('.ubpick'), { v: { kind: 'sint', max: 7, comma: true, open: true } }); PK.set('v', cur); PK.open('v'); }
    m.addEventListener('click', function (ev) {
      if (ev.target === m) { closePick(); return; }
      var b = ev.target.closest('button'); if (!b) return;
      var a = b.getAttribute('data-a');
      if (a === 'close') { closePick(); return; }
      if (a !== 'save') return;
      var nv = PK ? PK.get('v') : $('ubEd').value.trim();
      if (col === 'K' && !/\d/.test(nv)) { popup('金額は数字で入力してね😊'); return; }
      if (col === 'J' && !nv) { popup('内容を入力してね😊'); return; }
      closePick();
      if (nv === cur) return;
      ask({ action: 'oedit', row: y.r, label: y.label, amount: y.amount, _k: ok(y), col: col, value: nv }, (col === 'J' ? '内容' : '金額') + 'を修正しています');
    });
  }
  $('ubOthers').addEventListener('click', function (e) {
    if (busy || !D) return;
    var tr = e.target.closest('tr.r'); if (!tr) return;
    var y = (D.others || [])[parseInt(tr.getAttribute('data-q'), 10)]; if (!y) return;
    if (y._del) { popup('この行は削除中です。'); return; }
    if (e.target.closest('button[data-a="del"]')) {
      popup(y.label + '　' + yen(y.amount) + '\nこの行を削除しますか？😊', {
        cancel: true, onYes: function () { ask({ action: 'odelete', row: y.r, label: y.label, amount: y.amount, _k: ok(y) }, '行を削除しています'); }
      });
      return;
    }
    var td = e.target.closest('td.e'); if (!td) return;
    openPickO(y, td.getAttribute('data-c'));
  });

  function p2(n) { return ('0' + n).slice(-2); }
  var AK = padKit($('ubAdd'), {
    h: { kind: 'int', max: 2, lim: 23, next: 'm' }, m: { kind: 'int', max: 2, lim: 59 }, no: { kind: 'int', max: 3, auto: true },
    num: { kind: 'num', max: 4 }, amt: { kind: 'int', max: 7, comma: true }
  });
  $('ubAddDetail').addEventListener('focus', AK.close);
  var addPay = '';
  $('ubGoAdd').addEventListener('click', function () {
    var d = new Date();
    AK.set('h', p2(d.getHours())); AK.set('m', p2(d.getMinutes())); AK.set('no', ''); AK.set('num', ''); AK.set('amt', '');
    $('ubAddDetail').value = ''; addPay = ''; drawAddPay(); AK.close(); show('ubAdd');
  });
  function drawAddPay() {
    var h = '';
    for (var k = 0; k < PAYS.length; k++) h += '<button type="button" data-v="' + esc(PAYS[k]) + '" class="' + (addPay === PAYS[k] ? 'on' : '') + '">' + esc(PAYS[k] === '街口支付' ? '街口' : PAYS[k]) + '</button>';
    $('ubAddPay').innerHTML = h;
  }
  $('ubAddPay').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; addPay = b.getAttribute('data-v'); drawAddPay(); });
  $('ubAddGo').addEventListener('click', function () {
    if (!AK.raw('amt')) { popup('金額を入力してね😊'); return; }
    if (!AK.get('num') && !$('ubAddDetail').value.trim()) { popup('顧客番号か明細を入力してね😊'); return; }
    var tm = AK.raw('h') ? p2(AK.raw('h')) + ':' + p2(AK.raw('m') || '0') : '';
    AK.close();
    ask({ action: 'add', time: tm, no: AK.raw('no'), num: AK.get('num'), detail: $('ubAddDetail').value.trim(),
          amount: parseInt(AK.raw('amt'), 10), pay: addPay }, '売上の行を追加しています', function () { show('ubInv'); });
  });
  $('ubAddBack').addEventListener('click', function (e) { e.preventDefault(); show('ubInv'); });

  var OK2 = padKit($('ubOther'), { num: { kind: 'num', max: 4 }, amt: { kind: 'sint', max: 7, comma: true } });
  $('ubOthLabel').addEventListener('focus', OK2.close);
  $('ubOthName').addEventListener('focus', OK2.close);
  $('ubGoOther').addEventListener('click', function () {
    $('ubOthLabel').value = ''; $('ubOthName').value = ''; OK2.set('num', ''); OK2.set('amt', ''); OK2.close(); show('ubOther');
  });
  $('ubOthGo').addEventListener('click', function () {
    var amt = OK2.get('amt'); OK2.close();
    var what = $('ubOthLabel').value.trim();
    if (!what || !amt) { popup('内容と金額を入力してね😊 （経費などはマイナス）'); return; }
    var nm = $('ubOthName').value.trim().replace(/\s*様$/, '');
    var who = (OK2.get('num') || '') + (nm ? nm + '様' : '');
    ask({ action: 'other', label: who ? who + '　' + what : what, amount: parseInt(amt, 10) }, 'その他を追加しています', function () { show('ubNoInv'); });
  });
  $('ubOthBack').addEventListener('click', function (e) { e.preventDefault(); show('ubNoInv'); });

  var CK = ['c100', 'c50', 'c10', 'c5', 'c1', 'bills'];
  var CP = padKit($('ubCoins'), { c100: { kind: 'int', max: 4, comma: true }, c50: { kind: 'int', max: 4, comma: true },
    c10: { kind: 'int', max: 4, comma: true }, c5: { kind: 'int', max: 4, comma: true }, c1: { kind: 'int', max: 4, comma: true },
    bills: { kind: 'int', max: 6, comma: true } });
  var coinTouched = false;    
  function fillCoins() {
    if (!CP || !D) return;
    var c = D.coins || {};
    var v = { c100: c['100'], c50: c['50'], c10: c['10'], c5: c['5'], c1: c['1'], bills: D.bills };
    for (var i = 0; i < CK.length; i++) CP.set(CK[i], v[CK[i]] == null ? '' : String(v[CK[i]]));
  }
  $('ubCoins').addEventListener('click', function (e) { if (e.target.closest('.ubkp')) coinTouched = true; });
  $('ubGoCoins').addEventListener('click', function () {
    coinTouched = false; fillCoins(); CP.close(); show('ubCoins');
  });
  $('ubCoinGo').addEventListener('click', function () {
    CP.close();
    var f = { action: 'coins' }, any = false;
    for (var i = 0; i < CK.length; i++) if (CP.raw(CK[i]) !== '') { f[CK[i]] = parseInt(CP.raw(CK[i]), 10); any = true; }
    if (!any) { popup('枚数を入力してね😊'); return; }
    ask(f, '小銭を書いています');
  });
  $('ubCoinBack').addEventListener('click', function (e) { e.preventDefault(); show('ubMenu'); });
  $('ubGoInv').addEventListener('click', function () { show('ubInv'); });
  $('ubGoNoInv').addEventListener('click', function () { show('ubNoInv'); });
  $('ubInvBack').addEventListener('click', function (e) { e.preventDefault(); show('ubMenu'); });
  $('ubNoInvBack').addEventListener('click', function (e) { e.preventDefault(); show('ubMenu'); });

  show('ubMenu'); draw();
  fetchData(function () { ask({ action: 'load' }, '', null, true); });
}
function renderUriageBookPage_(base, staff, dev) {
  var head = function (icon, name) {
    return '<div class="hhead"><span class="bmark">' + icon + '</span><span class="bname">' + name + '</span></div>';
  };
  var inBack = function (id) {
    return '<div class="ubar"><a class="uhome" id="' + id + '" href="javascript:void(0)">← 戻る</a></div>';
  };
  var C = {
    exec: 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec',
    key: 'kx7Q2p9mVt4Zr8'
  };
  return '<style>' + HOMECSS_ + EXPADCSS_ + UBCSS_ + '</style>' +
    '<div class="home ubhome">' + backBar_(base, staff, dev) +   
    '<div class="ub">' +
      '<div id="ubMenu">' + head('📒', 'TT売上帳簿') +
        '<div class="ubtest" id="ubTest" style="display:none">テスト中：本番の売上表には書きません（2026_帳簿_テスト に書きます）</div>' +
        '<div class="ubmenu">' +
          '<button type="button" id="ubGoInv">🧾 發票ありの売上</button>' +
          '<button type="button" id="ubGoNoInv">📝 發票なしの売上</button>' +
          '<button type="button" id="ubGoCoins">🪙 小銭とお札</button>' +
        '</div>' +
      '</div>' +
      '<div id="ubInv" style="display:none">' +
        '<div class="ubtop">' + inBack('ubInvBack') + '<span class="bname ubttl">🧾 發票ありの売上</span>' +
          '<span id="ubWhen" class="ubwhen"></span><button type="button" id="ubReload" class="ubsm">再読込</button>' +
        '</div>' +
        '<div class="ubtop2"><span class="ubh ubhint">各項目の枠内を押すと修正できます</span><button type="button" id="ubGoAdd" class="ubadd">売上一行追加</button></div>' +
        '<div id="ubList"></div>' +
      '</div>' +
      '<div id="ubNoInv" style="display:none">' +
        '<div class="ubtop">' + inBack('ubNoInvBack') + '<span class="bname ubttl">📝 發票なしの売上</span>' +
          '<span id="ubWhen2" class="ubwhen"></span><button type="button" id="ubReload2" class="ubsm">再読込</button>' +
        '</div>' +
        '<div class="ubtop2"><span class="ubh ubhint">各項目の枠内を押すと修正できます</span><button type="button" id="ubGoOther" class="ubadd">売上一行追加</button></div>' +
        '<div id="ubOthers"></div>' +
      '</div>' +
      '<div id="ubAdd" style="display:none">' + inBack('ubAddBack') + head('✍️', '売上を手動で追加') +
        '<div class="ubf">' +
          '<label>時刻（9時3分なら 09時03分と入力）</label><div class="ubrow"><div class="ubtime"><div class="ubbox t" data-pk="h"></div><span class="ubu">時</span>' +
            '<div class="ubbox t" data-pk="m"></div><span class="ubu">分</span></div></div>' +   
          '<label>発票番号（下3桁・無ければ空のまま）</label><div class="ubrow"><div class="ubbox" data-pk="no" data-ph="押して入力"></div></div>' +
          '<label>顧客番号</label><div class="ubrow"><div class="ubnumrow"><div class="ubbox" data-pk="num" data-ph="押して入力"></div>' +
            '<button type="button" data-pok="num" class="ubok" style="display:none">入力OK</button></div></div>' +
          '<label>明細（購入内容）</label><input id="ubAddDetail">' +
          '<label>金額（元）</label><div class="ubrow"><div class="ubnumrow"><div class="ubbox" data-pk="amt" data-ph="押して入力"></div>' +
            '<button type="button" data-pok="amt" class="ubok" style="display:none">入力OK</button></div></div>' +   
          '<label>支払方法</label><div class="ubpay" id="ubAddPay"></div>' +
        '</div>' +
        '<button type="button" class="exgo" id="ubAddGo">以上の内容で追加</button>' +
      '</div>' +
      '<div id="ubOther" style="display:none">' + inBack('ubOthBack') + head('📝', '發票なしの売上を追加') +
        '<div class="ubf">' +
          '<label>顧客番号（未記入可）</label><div class="ubrow"><div class="ubnumrow"><div class="ubbox" data-pk="num" data-ph="押して入力"></div>' +
            '<button type="button" data-pok="num" class="ubok" style="display:none">入力OK</button></div></div>' +
          '<label>氏名（未記入可）</label><div class="ubnamerow"><input id="ubOthName"><span class="ubu">様</span></div>' +
          '<label>内容（例 プロセルアフターセラム）</label><input id="ubOthLabel">' +
          '<label>金額（売上は＋　経費は－　例：ティッシュ補充　-300元）</label><div class="ubrow"><div class="ubnumrow"><div class="ubbox" data-pk="amt" data-ph="押して入力"></div>' +
            '<button type="button" data-pok="amt" class="ubok" style="display:none">入力OK</button></div></div>' +
        '</div>' +
        '<button type="button" class="exgo" id="ubOthGo">以上の内容で追加</button>' +
      '</div>' +
      '<div id="ubCoins" style="display:none">' +
        '<div class="ubtop">' + inBack('ubCoinBack') + '<span class="bname ubttl">🪙 小銭とお札</span>' +
          '<span id="ubWhen3" class="ubwhen"></span><button type="button" id="ubReload3" class="ubsm">再読込</button>' +
        '</div>' +
        '<div class="ubrow"><div class="ubcoin">' +
          [['c100', '100元（枚）'], ['c50', '50元（枚）'], ['c10', '10元（枚）'], ['c5', '5元（枚）'], ['c1', '1元（枚）'], ['bills', 'お札（元）']]
            .map(function (k) { return '<div class="ubcell"><div class="lab">' + k[1] + '</div><div class="ubbox" data-pk="' + k[0] + '" data-ph="―"></div></div>'; }).join('') +
        '</div></div>' +   
        '<button type="button" class="exgo" id="ubCoinGo">以上の内容で入力</button>' +
      '</div>' +
    '</div></div>' +
    '<script>(' + uriageBookScript_.toString() + ')(' + JSON.stringify(C).replace(/</g, '\\u003c') + ');<\/script>';
}
