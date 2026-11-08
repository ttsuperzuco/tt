// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：procstock
var PROCSTOCK_ITEMS_ = ['Tip0.25', 'Tip0.5', 'Hairセラム', 'Proセラム', 'MDセラム', 'マスク',
  'アフターTryPro', 'アフターTryMD', 'アフターFullPro', 'アフターFullMD'];
function procStockScript_(C) {
  var ITEMS = C.items;
  function $(id) { return document.getElementById(id); }
  var SECS = ['psMenu', 'psWho', 'psItem', 'psList', 'psDone'];
  function show(id) {
    for (var i = 0; i < SECS.length; i++) $(SECS[i]).style.display = (SECS[i] === id) ? '' : 'none';
    window.scrollTo(0, 0);
  }
  var vals = {}, cur = 0, fromList = false, digits = '', staffLabel = '', sending = false;
  function cfg() { try { return JSON.parse(localStorage.getItem('sz_cfg') || '{}'); } catch (e) { return {}; } }
  function labels() { return (typeof _labelsFromCfg_ === 'function') ? _labelsFromCfg_(cfg()) : {}; }
  function needPick() {
    var w = window.__SZ_WHO_ || '';
    return !!window.pywebview || w === 'reception' || w === 'reception_sp';
  }
  function autoLabel() {
    var w = window.__SZ_WHO_ || '', r = window.__SZ_ROLE_ || '', L = labels();
    if (w && L[w]) return L[w];
    if (r === '社長(幹部)') return L.kanbu || '🍅トマト';
    if (r === '開発') return 'Ryu';
    return r || '不明';
  }
  function popup(msg) { if (typeof szPopup_ === 'function') szPopup_(msg); else alert(msg); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function drawPeople() {
    var ids = (typeof _peopleFromCfg_ === 'function') ? _peopleFromCfg_(cfg()) : [];
    var L = labels(), h = '';
    for (var i = 0; i < ids.length; i++) {
      if (ids[i] === 'reception' || ids[i] === 'reception_sp') continue;
      h += '<button type="button" data-lb="' + esc(L[ids[i]] || ids[i]) + '">' + esc(L[ids[i]] || ids[i]) + '</button>';
    }
    $('psPeople').innerHTML = h;
  }
  $('psPeople').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    staffLabel = b.getAttribute('data-lb'); vals = {}; openItem(0, false);
  });

  function drawBox() {
    $('psBox').innerHTML = digits ? esc(digits) + '<span class="u">個</span>' : '<span class="ph">数字を入力してください😊</span>';
  }
  function openItem(i, back) {
    cur = i; fromList = !!back; digits = (vals[i] !== undefined) ? String(vals[i]) : '';
    $('psStep').textContent = (i + 1) + ' / ' + ITEMS.length;
    $('psName').textContent = ITEMS[i];
    $('psWho1').textContent = '入力する人：' + staffLabel;
    $('psOk').textContent = fromList ? 'これでOK → 一覧へもどる' : (i === ITEMS.length - 1 ? 'これでOK → 一覧へ' : 'これでOK → 次へ');
    drawBox(); show('psItem');
  }
  function press(k) {
    if (k === 'clr') digits = '';
    else if (k === 'del') digits = digits.slice(0, -1);
    else if (/^[0-9]$/.test(k) && digits.length < 4) digits = (digits === '0') ? k : digits + k;
    drawBox();
  }
  $('psPad').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    press(b.getAttribute('data-k') || b.textContent);
  });
  function ok() {
    if (digits === '') { popup('数量を入力してください😊 （無い時は 0）'); return; }
    vals[cur] = parseInt(digits, 10);
    if (fromList || cur === ITEMS.length - 1) openList(); else openItem(cur + 1, false);
  }
  $('psOk').addEventListener('click', ok);
  document.addEventListener('keydown', function (e) {
    if ($('psItem').style.display === 'none') return;
    if (/^[0-9]$/.test(e.key)) { press(e.key); e.preventDefault(); }
    else if (e.key === 'Backspace') { press('del'); e.preventDefault(); }
    else if (e.key === 'Enter') { ok(); e.preventDefault(); }
  });
  $('psBackItem').addEventListener('click', function (e) {
    e.preventDefault();
    if (fromList) openList();
    else if (cur > 0) openItem(cur - 1, false);
    else if (needPick()) show('psWho');
    else show('psMenu');
  });

  function openList() {
    var h = '';
    for (var i = 0; i < ITEMS.length; i++) {
      h += '<button type="button" data-i="' + i + '"><span>' + esc(ITEMS[i]) + '</span><span class="q">' + vals[i] + ' 個</span></button>';
    }
    $('psRows').innerHTML = h;
    $('psWho2').textContent = '入力する人：' + staffLabel;
    $('psSt').textContent = '';
    $('psSend').disabled = false;
    show('psList');
  }
  $('psRows').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || sending) return;
    openItem(parseInt(b.getAttribute('data-i'), 10), true);
  });
  $('psBackList').addEventListener('click', function (e) {
    e.preventDefault(); if (sending) return; openItem(ITEMS.length - 1, false);
  });

  function two(n) { return ('0' + n).slice(-2); }
  function stamp(d) { return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate()) + ' ' + two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds()); }
  function jsonp(p, cb) {
    var n = '__pstock' + Date.now() + Math.floor(Math.random() * 1000);
    window[n] = function (r) { try { delete window[n]; } catch (e) {} cb(r); };
    var q = 'callback=' + n; for (var k in p) q += '&' + k + '=' + encodeURIComponent(p[k]);
    var s = document.createElement('script'); s.src = C.exec + '?' + q + '&cb=' + Date.now();
    s.onerror = function () { cb({ ok: false, error: '通信エラーです' }); }; document.body.appendChild(s);
  }
  function fail(msg) { sending = false; $('psSend').disabled = false; $('psSt').textContent = ''; popup(msg); }
  var polls = 0, doneAt = '';
  function poll(id) {
    polls++;
    if (polls > LIMITS.tries('procell_stock_save', 1000)) { fail('時間切れです。もう一度「これで在庫を登録」を押してください🙇'); return; }
    jsonp({ action: 'status', key: C.key, id: id }, function (r) {
      if (!r || !r.ok) { fail('登録できませんでした：' + ((r && r.error) || '不明')); return; }
      if (r.status === 'pending' || r.status === 'running' || r.status === 'queued' || r.status === '') { setTimeout(function () { poll(id); }, 1000); return; }
      if (r.status !== 'done') { fail('登録できませんでした：' + (r.result || r.status)); return; }
      sending = false;
      $('psDoneMsg').innerHTML = '在庫を登録しました<small>' + esc(doneAt.slice(0, 16).replace(/-/g, '/')) + '　' + esc(staffLabel) + '</small>';
      drawTable(r.result);
      show('psDone');
    });
  }
  function drawTable(res) {
    var t; try { t = JSON.parse(res || ''); } catch (e) { t = null; }
    if (!t || !t.rows) { $('psTbl').innerHTML = ''; return; }
    var md = (doneAt || '').slice(5, 10).split('-');
    var h = '<div class="pstitle">' + (md.length === 2 ? (+md[0]) + '月' + (+md[1]) + '日<br>' : '') + 'プロセル在庫の補充必要数</div>' +
      '<div class="pstbl"><table><thead><tr><th>品物</th><th>今の<br>お店在庫</th><th>1か月の<br>予約分</th><th>余裕分</th><th class="o">必要<br>補充数</th></tr></thead><tbody>';
    for (var i = 0; i < t.rows.length; i++) {
      var x = t.rows[i];
      h += '<tr><td class="n">' + esc(x[0]) + '</td><td>' + x[1] + '</td><td>' + x[2] + '</td><td>' + x[3] + '</td>' +
        '<td class="o' + (x[4] ? '' : ' z') + '">' + x[4] + '</td></tr>';
    }
    h += '</tbody></table></div>';
    var any = false;
    for (var k = 0; k < t.rows.length; k++) if (t.rows[k][4]) any = true;
    if (!any) h += '<div class="psnone">今回は補充は必要ありません</div>';
    for (var j = 0; j < (t.notes || []).length; j++) h += '<div class="pstnote">※' + esc(t.notes[j]) + '</div>';
    $('psTbl').innerHTML = h;
  }
  $('psSend').addEventListener('click', function () {
    if (sending) return;
    var counts = {};
    for (var i = 0; i < ITEMS.length; i++) {
      if (vals[i] === undefined) { popup(ITEMS[i] + ' の数がまだ入っていません'); return; }
      counts[ITEMS[i]] = vals[i];
    }
    sending = true; polls = 0; doneAt = stamp(new Date());
    $('psSend').disabled = true; $('psSt').textContent = '登録しています…';
    jsonp({ action: 'submit', key: C.key, op: 'procell_stock_save',
            who: window.__SZ_WHO_ || '', role: window.__SZ_ROLE_ || '', device: window.__SZ_DEVICE_ || '',
            fields: JSON.stringify({ staff: staffLabel, at: doneAt, counts: counts }) },
      function (r) {
        if (!r || !r.ok || !r.id) { fail('登録できませんでした：' + ((r && r.error) || '不明')); return; }
        setTimeout(function () { poll(r.id); }, 1000);
      });
  });

  $('psStart').addEventListener('click', function () {
    vals = {};
    if (needPick()) { staffLabel = ''; drawPeople(); show('psWho'); }
    else { staffLabel = autoLabel(); openItem(0, false); }
  });
  $('psBackWho').addEventListener('click', function (e) { e.preventDefault(); show('psMenu'); });
  $('psClose').addEventListener('click', function () {
    var a = document.querySelector('.home > .ubar a.uhome');
    if (a) a.click(); else location.href = '?view=home';
  });

  try {
    var qs = new URLSearchParams(location.search), q = qs.get('pstbl');
    if (q) {
      doneAt = qs.get('at') || '';
      show('psDone');
      $('psDoneMsg').style.display = 'none';
      $('psClose').style.display = 'none';
      var hd = document.querySelectorAll('.hhead, .ubar');
      for (var hi = 0; hi < hd.length; hi++) hd[hi].style.display = 'none';
      $('psTbl').style.padding = '6px 8px 14px';
      drawTable(q);
    }
  } catch (e) {}
}
function renderProcStockPage_(base, staff, dev) {
  var head = function (icon, name) {
    return '<div class="hhead"><span class="bmark">' + icon + '</span><span class="bname">' + name + '</span></div>';
  };
  var inBack = function (id) {
    return '<div class="ubar"><a class="uhome" id="' + id + '" href="javascript:void(0)">← 戻る</a></div>';
  };
  var C = {
    items: PROCSTOCK_ITEMS_,
    exec: 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec',
    key: 'kx7Q2p9mVt4Zr8'
  };
  return '<style>' + HOMECSS_ + EXPADCSS_ + PROCSTOCKCSS_ + '</style>' +
    '<div class="home">' + backBar_(base, staff, dev) +
    '<div class="ps">' +
      '<div id="psMenu">' + head('📦', 'プロセル在庫') +
        '<button type="button" class="exgo" id="psStart">現在庫入力</button>' +
      '</div>' +
      '<div id="psWho" style="display:none">' + inBack('psBackWho') + head('🙋', '入力する人') +
        '<div class="pshint">入力する人を選択してください😊</div>' +
        '<div class="pspeople" id="psPeople"></div>' +
      '</div>' +
      '<div id="psItem" style="display:none">' + inBack('psBackItem') + head('📦', '現在庫入力') +
        '<div class="psstep" id="psStep"></div>' +
        '<div class="psname" id="psName"></div>' +
        '<div class="exbox psbox" id="psBox"></div>' +
        '<div class="expad" id="psPad">' + EXPADHTML_ + '</div>' +
        '<button type="button" class="exgo" id="psOk">これでOK → 次へ</button>' +
        '<div class="pswho" id="psWho1"></div>' +
      '</div>' +
      '<div id="psList" style="display:none">' + inBack('psBackList') + head('📋', '入力した在庫') +
        '<div class="pswho" id="psWho2"></div>' +
        '<div class="pshint">修正したい品物は、押すと入力し直せます</div>' +
        '<div class="pslist" id="psRows"></div>' +
        '<button type="button" class="exgo" id="psSend">これで在庫を登録</button>' +
        '<div class="psst" id="psSt"></div>' +
      '</div>' +
      '<div id="psDone" style="display:none">' + head('✅', 'プロセル在庫') +
        '<div class="psdone" id="psDoneMsg"></div>' +
        '<div id="psTbl"></div>' +
        '<button type="button" class="exgo" id="psClose">確認しました。画面を閉じる</button>' +
      '</div>' +
    '</div></div>' +
    '<script>(' + procStockScript_.toString() + ')(' + JSON.stringify(C).replace(/</g, '\\u003c') + ');<\/script>';
}
