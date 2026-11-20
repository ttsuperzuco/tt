// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。
// この画面だけで使う部品：hanbai、procstock、uriagebook
var SZSTAFF_ = {
  DEV: '🐉Ryu',
  cfg: function () { try { return JSON.parse(localStorage.getItem('sz_cfg') || '{}') || {}; } catch (e) { return {}; } },
  labels: function () { return _labelsFromCfg_(SZSTAFF_.cfg()); },
  needPick: function () { var w = window.__SZ_WHO_ || ''; return w === 'reception' || w === 'reception_sp'; },
  auto: function () {
    if (SZSTAFF_.needPick()) return '';
    var w = window.__SZ_WHO_ || '', r = window.__SZ_ROLE_ || '', L = SZSTAFF_.labels();
    if (w && L[w]) return L[w];
    if (r === '社長(幹部)') return L.kanbu || '🍅トマト';
    if (r === '開発') return SZSTAFF_.DEV;
    return '';
  },
  ORDER: ['kanbu', 'mikan', 'olive', 'pine', 'ringo', 'coconut', 'mango'],
  EVERYONE: ['kanbu', 'olive', 'mikan', 'reception', 'reception_sp'],
  isEveryone: function () {
    var w = window.__SZ_WHO_ || '', r = window.__SZ_ROLE_ || '';
    if (r === '開発' || r === '社長(幹部)') return true;
    return SZSTAFF_.EVERYONE.indexOf(w) >= 0;
  },
  choices: function () {
    var ids = _peopleFromCfg_(SZSTAFF_.cfg()), L = SZSTAFF_.labels(), O = SZSTAFF_.ORDER, out = [], i;
    for (i = 0; i < O.length; i++) if (ids.indexOf(O[i]) >= 0) out.push(L[O[i]] || O[i]);
    for (i = 0; i < ids.length; i++) {
      if (ids[i] === 'reception' || ids[i] === 'reception_sp' || O.indexOf(ids[i]) >= 0) continue;
      out.push(L[ids[i]] || ids[i]);
    }
    return out;
  }
};
