// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：hanbai、uriagebook、yoyaku_henkou、yoyaku_kizon、yoyaku_sejutsugo
var szName_ = (function () {
  var EXEC = 'https://script.google.com/macros/s/AKfycbzSxho3e4CHyAuoymGlzcVwGnLshGoCg53zY18laLrHMq5Cun_pBv8XgRsNxKMDxlKwUA/exec';
  var LS = 'sz_customer_names', N = null, fresh = false, asked = false, waits = [], shown = [];
  try { var c = JSON.parse(localStorage.getItem(LS) || 'null'); if (c && c.names) N = c.names; } catch (e) {}
  function key(s) { var v = String(s || '').toUpperCase().replace(/\s/g, ''), m = v.match(/^([FMD])0*(\d+)$/); return m ? m[1] + parseInt(m[2], 10) : v; }
  function fire() { var w = waits; waits = []; for (var i = 0; i < w.length; i++) { try { w[i](); } catch (e) {} } redraw(); }
  function ask() {
    if (asked) return; asked = true;
    var n = '__szn' + Date.now() + Math.floor(Math.random() * 1000);
    window[n] = function (p) {
      try { delete window[n]; } catch (e) {}
      if (p && p.names) { N = p.names; fresh = true; try { localStorage.setItem(LS, JSON.stringify({ names: N })); } catch (e) {} }
      fire();
    };
    var s = document.createElement('script');
    s.src = EXEC + '?action=data&name=customer_names.json&callback=' + n + '&cb=' + Date.now();
    s.onerror = function () { fire(); };
    (document.body || document.documentElement).appendChild(s);
  }
  function css() {
    if (document.getElementById('sznameCss')) return;
    var st = document.createElement('style'); st.id = 'sznameCss';
    st.textContent = '.szname{margin:8px 0 0;border-radius:10px;padding:8px 12px;font-weight:900;font-size:15px;text-align:left;}' +
      '.szname.ok{background:#e0f2fe;color:#0c4a6e;}.szname.ng{background:#fee2e2;color:#b91c1c;}';
    (document.head || document.documentElement).appendChild(st);
  }
  function of(num) { var k = key(num); return (k && N && N[k]) || ''; }
  function paint(el, num) {
    if (!el) return;
    var k = key(num);
    if (!k || !/\d/.test(k)) { el.style.display = 'none'; el.textContent = ''; return; }
    css();
    var nm = of(num);
    if (nm) { el.className = 'szname ok'; el.textContent = '顧客名：' + nm; el.style.display = ''; }
    else if (N) { el.className = 'szname ng'; el.textContent = '該当する顧客が存在しません'; el.style.display = ''; }
    else { el.style.display = 'none'; }        
  }
  function redraw() { for (var i = 0; i < shown.length; i++) paint(shown[i].el, shown[i].num); }
  function show(el, num) {
    if (!el) return;
    ask();
    var hit = false;
    for (var i = 0; i < shown.length; i++) if (shown[i].el === el) { shown[i].num = num; hit = true; }
    if (!hit) shown.push({ el: el, num: num });
    paint(el, num);
  }
  return {
    key: key, of: of, show: show,
    ready: function () { return !!N; },
    load: function (cb) { ask(); if (fresh) { if (cb) cb(); } else if (cb) waits.push(cb); }
  };
})();
