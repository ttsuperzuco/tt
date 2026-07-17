// TTスーパーズコApp ―― ホーム画面から開いた時の表示を速くするための保管係。
//
// 【なぜ有る】2026-07-17・ユーザー要望「ホーム画面から開いてトップが出るまでを極限まで短く」。
//   以前はここは空っぽ（ホーム画面に置けるようにするための最小限の置物）で、毎回
//   index.html(29KB)・code.js(214KB)・detect_core.js(8.7KB)をGitHubから取り直していた。
//   → **一度取った物はスマホの中に保存し、次からはそこから出す**（＝ネットを待たない）。
//
// 【やり方＝「まず手元の物を出す。裏で新しいのを取って保存しておく」】
//   ・画面は手元の物で即出る（速い）。
//   ・新しい版は裏で保存され、**次にアプリを開いた時**から効く（1回遅れ）。
//     ★code.js等はURLの末尾 ?v=... が版ごとに変わる作りなので、index.htmlが新しくなれば
//       その中の新しいURLは手元に無い＝必ず取りに行く＝ちぐはぐな組み合わせにならない。
//   ・GAS(script.google.com)への問い合わせ＝**一切触らない**（データは常に最新でないと困る）。
//
// 【困った時】アプリが古いまま直らない等があれば、この保管を丸ごと捨てればよい
//   （下の CACHE の名前を変えて配る＝古い保管は自動で消える）。
var CACHE = 'ttzuko-shell-v4';

self.addEventListener('install', function (e) {
  self.skipWaiting();   // 新しい保管係にすぐ交代する
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.map(function (n) {
        return (n === CACHE) ? null : caches.delete(n);   // 古い名前の保管は捨てる
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;   // ★GAS等の外部＝素通り（常に最新）

  var isNav = (req.mode === 'navigate');   // ?view=... が付くので、保存する時は付けずに1つにまとめる
  var key = isNav ? new Request(url.origin + url.pathname) : req;

  e.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(key).then(function (hit) {
        var net = fetch(req).then(function (res) {
          if (res && res.ok && res.type === 'basic') {
            try { cache.put(key, res.clone()); } catch (err2) {}
          }
          return res;
        }).catch(function () { return hit; });
        return hit || net;   // 手元にあれば即返す（取りに行くのは裏で続ける）
      });
    })
  );
});
