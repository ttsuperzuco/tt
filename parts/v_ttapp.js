// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：ttapp
var TEIKEICSS_ =
  '.tk{max-width:560px;width:100%;margin:0 auto;padding:0 6px 60px;text-align:left;box-sizing:border-box;}' +
  '.tkbar{position:sticky;top:0;z-index:5;background:#2C7A99;padding:8px 0 8px;}' +
  '.tkback{border:0;cursor:pointer;font:inherit;}' +
  '.tk .bmark{font-size:40px;}' +
  '.tkcrumb{color:#fff;font-weight:900;font-size:19px;line-height:1.45;margin:10px 4px 14px;text-align:center;word-break:break-all;}' +
  '.tkcrumb:empty{display:none;}' +
  '.tkopts{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px;}' +
  '.tkopt{appearance:none;-webkit-appearance:none;font-family:inherit;cursor:pointer;position:relative;overflow:hidden;' +
    'display:flex;align-items:center;justify-content:center;text-align:center;min-height:76px;box-sizing:border-box;' +
    'padding:12px 10px 12px 16px;background:#fff;color:#0f172a;border:1px solid #e2e8f0;border-radius:16px;' +
    'font-size:20px;font-weight:900;line-height:1.3;word-break:break-all;box-shadow:0 6px 18px rgba(0,0,0,.09);}' +
  '.tkopt::before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;background:#c026d3;}' +
  '.tkopt:active{transform:translateY(2px);box-shadow:0 3px 10px rgba(0,0,0,.10);}' +
  '.tkmsg{color:#fff;font-weight:900;font-size:17px;line-height:1.5;margin:0 4px 10px;min-height:24px;}' +
  '.tkmsg:empty{display:none;}' +
  '.tkcopy{appearance:none;-webkit-appearance:none;font-family:inherit;cursor:pointer;display:block;width:100%;box-sizing:border-box;' +
    'border:0;border-radius:16px;background:#16a34a;color:#fff;font-size:20px;font-weight:900;padding:16px 12px;margin:0 0 12px;' +
    'box-shadow:0 4px 12px rgba(0,0,0,.18);}' +
  '.tkcopy:active{transform:translateY(2px);}' +
  '.tkcopy.sub{background:#fff;color:#16a34a;border:2px solid #16a34a;font-size:16px;box-shadow:none;}' +
  '.tkcard{background:#fff;color:#0f172a;border-radius:16px;padding:16px;box-shadow:0 4px 14px rgba(0,0,0,.14);margin:0 0 10px;}' +
  '.tktext{white-space:pre-wrap;word-break:break-word;font-size:17px;line-height:1.7;}' +
  '.tktext a{color:#1d4ed8;text-decoration:underline;word-break:break-all;}' +
  '.tknote{color:#eaf6fb;font-size:14px;font-weight:700;margin:0 4px 14px;}' +
  '.tkimgs img{width:100%;display:block;margin:10px 0;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,.2);background:#fff;}' +
  '.tknone{background:#fff;color:#b91c1c;border-radius:16px;padding:16px;font-weight:800;font-size:16px;line-height:1.7;white-space:pre-wrap;}';
function renderTeikeiPage_(d, base, staff, dev) {
  return '<style>' + HOMECSS_ + TEIKEICSS_ + '</style>' +
    '<div class="home">' +
      '<div class="tk">' +
        '<div class="tkbar" id="tkbar">' + backBar_(base, staff, dev) + '</div>' +
        '<div class="hhead"><span class="bmark">🗓️</span><span class="bname">元祖TTアプリ</span></div>' +
        '<div class="tkcrumb" id="tkcrumb"></div>' +
        '<div id="tkbody"></div>' +
      '</div>' +
    '</div>';
}
function renderTeikeiError_(msg, base, staff, dev) {
  return '<style>' + HOMECSS_ + TEIKEICSS_ + '</style>' +
    '<div class="home"><div class="tk">' +
      '<div class="tkbar">' + backBar_(base, staff, dev) + '</div>' +
      '<div class="hhead"><span class="bmark">🗓️</span><span class="bname">元祖TTアプリ</span></div>' +
      '<div class="tknone">' + esc_(msg) + '</div>' +
    '</div></div>';
}
function teikeiStart_(rows) {
  rows = rows || [];
  var bar = document.getElementById('tkbar');
  var crumb = document.getElementById('tkcrumb');
  var body = document.getElementById('tkbody');
  if (!bar || !body) return;
  var homeBar = bar.innerHTML;
  var cur = [];
  var IMG_LINE = /^https?:\/\/\S+\.(?:jpg|jpeg|png|webp|gif)$/i;
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
  var isAndroid = /Android/i.test(ua);

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  function linkify(t) {
    return esc(t).replace(/(https?:\/\/[^\s<]+)/g, function (u) {
      return '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + u + '</a>';
    });
  }
  function starts(p, pre) {
    if (pre.length > p.length) return false;
    for (var i = 0; i < pre.length; i++) { if (p[i] !== pre[i]) return false; }
    return true;
  }
  function leaf() {
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].path.length === cur.length && starts(rows[i].path, cur)) return rows[i];
    }
    return null;
  }
  function options() {
    var seen = {}, out = [], depth = cur.length;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.path.length > depth && starts(r.path, cur)) {
        var v = r.path[depth];
        if (v && !seen[v]) { seen[v] = 1; out.push(v); }
      }
    }
    return out;
  }
  function split(text) {
    var lines = String(text == null ? '' : text).split(/\r?\n/), imgs = [], rest = [];
    for (var i = 0; i < lines.length; i++) {
      var t = lines[i].trim();
      if (IMG_LINE.test(t)) imgs.push(t); else rest.push(lines[i]);
    }
    return { imgs: imgs, text: rest.join('\n').replace(/^\s+|\s+$/g, '') };
  }
  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '-1000px';
      document.body.appendChild(ta); ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }
  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
    } else { done(fallbackCopy(text)); }
  }
  function setBar() {
    if (!cur.length) { bar.innerHTML = homeBar; return; }
    bar.innerHTML = '<div class="ubar"><button type="button" class="uhome tkback" id="tkbackbtn">← 戻る</button></div>';
    document.getElementById('tkbackbtn').onclick = function () { cur.pop(); render(); };
  }

  function showLeaf(r) {
    var p = split(r.body);
    var h = '';
    if (p.text) {
      h += '<div class="tkmsg" id="tkmsg">コピーしています…</div>' +
           '<button type="button" class="tkcopy" id="tkcopybtn">📋 本文をもう一度コピーする</button>' +
           '<div class="tkcard"><div class="tktext">' + linkify(p.text) + '</div></div>' +
           '<div class="tknote">※ ボタンを押した時に本文を自動でコピーしています。URLは押すと開けます。</div>';
    }
    if (p.imgs.length) {
      h += '<button type="button" class="tkcopy" id="tkimgcopy" style="display:none">📋 この画像をコピーする（LINEに貼り付け）</button>' +
           '<button type="button" class="tkcopy" id="tkimgsave">📷 この画像を保存する</button>' +
           '<div class="tkmsg" id="tkimgmsg"></div>' +
           '<div class="tkimgs">' + p.imgs.map(function (u, i) {
             return '<img src="' + esc(u) + '" alt="' + (i + 1) + '枚目">';
           }).join('') + '</div>';
    }
    body.innerHTML = h;
    if (p.text) {
      var msg = document.getElementById('tkmsg');
      var doCopy = function () {
        copyText(p.text, function (ok) {
          msg.textContent = ok ? '✅ コピーしました。LINEに貼り付けてね😊'
                               : '⚠️ コピーできませんでした。下のボタンをもう一度押してください🙇';
        });
      };
      document.getElementById('tkcopybtn').onclick = doCopy;
      doCopy();
    }
    if (p.imgs.length) imageButtons(p.imgs);
  }

  function imageButtons(imgs) {
    var sm = document.getElementById('tkimgmsg');
    var sb = document.getElementById('tkimgsave');
    var cb = document.getElementById('tkimgcopy');
    var name = function (u, i) { return u.split('/').pop() || ('image' + (i + 1) + '.jpg'); };
    function directSave() {
      sm.textContent = '保存しています…';
      imgs.forEach(function (u, i) {
        fetch(u).then(function (r) { return r.blob(); }).then(function (b) {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(b); a.download = name(u, i);
          document.body.appendChild(a); a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
          sm.textContent = isAndroid ? '保存しました。「ダウンロード」フォルダ（写真アプリの「ダウンロード」）に入ります。'
                                     : '保存しました。「ダウンロード」フォルダに入ります。';
        }).catch(function () { sm.textContent = ''; window.open(u, '_blank'); });
      });
    }
    function iosSave() {
      if (!(navigator.canShare && navigator.share)) { directSave(); return; }
      sm.textContent = '準備しています…';
      Promise.all(imgs.map(function (u, i) {
        return fetch(u).then(function (r) { return r.blob(); }).then(function (b) {
          return new File([b], name(u, i), { type: b.type || 'image/jpeg' });
        });
      })).then(function (files) {
        if (!navigator.canShare({ files: files })) throw new Error('cannot share');
        sm.textContent = '出てきたメニューで「画像を保存」を押すと写真に入ります（LINEを押せばそのまま送れます）。';
        return navigator.share({ files: files });
      }).catch(function (e) {
        if (e && e.name === 'AbortError') { sm.textContent = ''; return; }
        directSave();
      });
    }
    function toPng(blob) {
      return new Promise(function (resolve, reject) {
        var img = new Image(), url = URL.createObjectURL(blob);
        img.onload = function () {
          var c = document.createElement('canvas');
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          c.getContext('2d').drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          c.toBlob(function (pb) { if (pb) resolve(pb); else reject(new Error('toBlob')); }, 'image/png');
        };
        img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('img')); };
        img.src = url;
      });
    }
    function pcCopy() {
      if (!(navigator.clipboard && navigator.clipboard.write && window.ClipboardItem)) { directSave(); return; }
      sm.textContent = 'コピーしています…';
      fetch(imgs[0]).then(function (r) { return r.blob(); }).then(toPng)
        .then(function (png) { return navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]); })
        .then(function () { sm.textContent = 'コピーしました。LINEの入力らんで貼り付け（Ctrl+V）してね😊'; })
        .catch(function () { sm.textContent = 'コピーできなかったので、保存にします…'; directSave(); });
    }
    if (isIOS || isAndroid) {
      sb.onclick = function () { if (isIOS) iosSave(); else directSave(); };
    } else {
      cb.style.display = '';
      cb.onclick = pcCopy;
      sb.className = 'tkcopy sub';
      sb.textContent = 'コピーがうまくいかないとき（ダウンロードフォルダに保存する）';
      sb.onclick = directSave;
    }
  }

  function render() {
    setBar();
    crumb.textContent = cur.join(' › ');
    window.scrollTo(0, 0);
    var r = leaf();
    if (r) { showLeaf(r); return; }
    var opts = options();
    if (!opts.length) {
      body.innerHTML = '<div class="tknone">' + esc(rows.length
        ? '❌ この階層に表示できるデータがありません。\n\n・本文が右端の列に入っているか\n・階層（A,B,C…）が空になっていないか\nを確認してね😊'
        : 'まだ定型文が登録されていません。') + '</div>';
      return;
    }
    body.innerHTML = '<div class="tkopts">' + opts.map(function (v) {
      return '<button type="button" class="tkopt">' + esc(v) + '</button>';
    }).join('') + '</div>';
    var btns = body.querySelectorAll('.tkopt');
    for (var k = 0; k < btns.length; k++) {
      btns[k].onclick = (function (v) { return function () { cur.push(v); render(); }; })(opts[k]);
    }
  }
  render();
}
