# -*- coding: utf-8 -*-
"""
スーパーズコApp：本体(code.js)を「どの画面でも要る部品」と「その画面だけの部品」に自動で分ける。

【なぜ有る】2026-11-08 まるちゃん決定（「①やる」）。
  本体 code.js は 9/15 の 87万字から 11/8 の 142万字まで太り続け、スマホは**どの画面を開いても全部**を読み込んでいた。
  開いてから画面が出るまで（スタッフのスマホの真ん中の値）＝10月中旬 0.46秒 → 11月第1週 0.74秒。
  しかも直して出すたびに、スタッフのスマホは約400KB（縮めた後）を全部取り直していた（1日10回以上直す日もある）。
  増えた分の多くは、まだ開発者しか開けない画面（売上帳簿・お知らせ見てくれた？等）。
  → **開いた画面に要る部品だけを読む**ようにする。ホームは本体の約1割で済む。
    ある画面を直しても、他の画面の部品は取り直さなくてよい。

【大事な決まり】
  ・**人（AI）が直すのは今までどおり code.js だけ。** parts/ の中は機械が作る物＝手で直さない。
    （直しても次のコミットで上書きされる。ほかの会話・点検の道具・パソコン版の比較もこれまでどおり code.js を見る）
  ・コミットの直前（.githooks/pre-commit）に毎回これが動いて parts/ と入口(index.html)の一覧を作り直す。
    押し出す直前（pre-push）と見張り（共通\スーパーズコApp_版の番号の見張り.py）は --check で食い違いを止める／直す。
  ・**分け方を間違えたら安全側に倒れる**：
      - 分けた結果をnode（JavaScriptの実行役）で確かめ、少しでもおかしければ「全部を読む」形の一覧を書く。
      - 入口は、一覧に無い画面・前に部品が足りなかった端末では、今までどおり code.js を丸ごと読む。
      - 動いている最中に部品が足りないと分かったら（「〜が見つからない」）、その場で code.js を丸ごと読み足し、
        その端末は次から丸ごと読む（版が変わるまで）。

【分け方】
  1. code.js の一番外側の `function 名前(…) {…}` を1つの部品とする（中の字句を数えて正しい終わりを探す）。
     部品と部品の間にある文（var …＝読み込んだ時に動く物）は全部「どの画面でも要る部品」に、元の順番のまま残す。
  2. 部品の中に出てくる名前（文字列の中も含める＝ボタンの onclick 等も拾う）を「使っている」とみなす。
  3. 入口(index.html)の各画面の show〜() の中から使われる物＝その画面の部品。
     入口のそれ以外の所・他のファイル・部品の間の文から使われる物＝どの画面でも要る部品。
  4. どこからも使われていない部品（グーグル側で動いていた時の名残り等）も念のため「どの画面でも要る部品」に置く。
  5. 2つ以上の画面で使う部品は、使う画面の組ごとに1つのファイルにまとめる。

実行：python -X utf8 .githooks/zuko_split.py          （作り直す・変わった時だけ書く）
      python -X utf8 .githooks/zuko_split.py --check  （作り直した結果と食い違えば 1 で終わる。何も書かない）
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

TOP = Path(__file__).resolve().parent.parent
CODE = TOP / "code.js"
INDEX = TOP / "index.html"
PARTS = TOP / "parts"
BEGIN = "/*SZ-PARTS-BEGIN（機械が作る・手で直さない＝.githooks/zuko_split.py）*/"
END = "/*SZ-PARTS-END*/"
IDENT = re.compile(r"[A-Za-z_$][A-Za-z0-9_$]*")


# ── JavaScript の字句をざっくり読む（文字列・注意書き・正規表現を飛ばして、括弧の深さを数える）──
_REGEX_PREV_WORDS = {"return", "typeof", "instanceof", "in", "of", "new", "delete", "void", "throw",
                     "case", "do", "else", "yield", "await"}


def _tpl(src: str, j: int, stack: list, depth: int) -> int:
    """テンプレート文字列の続きを読む。閉じた `の次の位置を返す。${ に入った時は、その次の位置を負の数で返す。"""
    n = len(src)
    while j < n:
        ch = src[j]
        if ch == "\\":
            j += 2; continue
        if ch == "`":
            return j + 1
        if src.startswith("${", j):
            stack.append(depth)
            return -(j + 2)
        j += 1
    raise ValueError("テンプレート文字列が閉じていません")


def scan(src: str):
    """一番外側の function 宣言の (名前, 始まり, 終わり)、注意書き（コメント）の範囲、
    一番外側の var 文の ([名前…], 始まり, 終わり) の一覧を返す。"""
    i, n = 0, len(src)
    depth = 0
    funcs, comments, vars_ = [], [], []
    vu = None             # 今読んでいる一番外側の var 文（[名前…], 始まり, 次に名前が来るか）
    stack = []            # テンプレート文字列 `${ … }` の中の深さを覚える
    prev = ""             # 直前の意味のある字句（正規表現かどうかの見分けに使う）
    cur = None            # 今読んでいる一番外側の function（名前, 始まり, 本体の深さ）
    while i < n:
        c = src[i]
        if c in " \t\r\n":
            i += 1
            continue
        if c == "/" and src.startswith("//", i):
            j = src.find("\n", i)
            j = n if j < 0 else j
            comments.append((i, j)); i = j
            continue
        if c == "/" and src.startswith("/*", i):
            j = src.find("*/", i + 2)
            if j < 0:
                raise ValueError("注意書き /* が閉じていません")
            comments.append((i, j + 2)); i = j + 2
            continue
        if c in "'\"":
            j = i + 1
            while j < n and src[j] != c:
                if src[j] == "\\":
                    j += 1
                elif src[j] == "\n":
                    raise ValueError(f"文字列が行の途中で終わっています（{src.count(chr(10), 0, i) + 1}行目）")
                j += 1
            i = j + 1; prev = "str"
            continue
        if c == "`":
            i = _tpl(src, i + 1, stack, depth)
            if i < 0:
                i = -i; depth += 1; prev = "("
            else:
                prev = "str"
            continue
        if c == "/":
            regex_ok = (prev == "" or prev in _REGEX_PREV_WORDS or
                        (len(prev) == 1 and prev in "(,=:[!&|?{};+-*%<>~^"))
            if regex_ok:
                j = i + 1; cls = False
                while j < n:
                    ch = src[j]
                    if ch == "\\":
                        j += 2; continue
                    if ch == "\n":
                        raise ValueError(f"正規表現が行の途中で終わっています（{src.count(chr(10), 0, i) + 1}行目）")
                    if cls:
                        if ch == "]":
                            cls = False
                    elif ch == "[":
                        cls = True
                    elif ch == "/":
                        break
                    j += 1
                j += 1
                while j < n and (src[j].isalnum() or src[j] == "_"):
                    j += 1
                i = j; prev = "str"
                continue
            i += 1; prev = "/"
            continue
        if c.isalpha() or c in "_$":
            m = IDENT.match(src, i)
            w = m.group(0)
            at_line_start = (i == 0 or src[i - 1] == "\n")
            if depth == 0 and cur is None:
                if at_line_start and w in ("var", "let", "const", "function") and vu is not None:
                    vars_.append((vu[0], vu[1], i)); vu = None      # ; の無い var 文の終わり
                if w == "function":
                    m2 = re.compile(r"function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(").match(src, i)
                    if m2 and at_line_start:
                        cur = [m2.group(1), i, None]
                elif w in ("var", "let", "const") and at_line_start:
                    vu = [[], i, True]
                elif vu is not None and vu[2]:
                    vu[0].append(w); vu[2] = False
            i = m.end(); prev = w
            continue
        if c.isdigit():
            m = re.compile(r"[0-9][0-9A-Za-z_.]*").match(src, i)
            i = m.end(); prev = "num"
            continue
        if c in "([{":
            if c == "{" and cur is not None and cur[2] is None and depth == 0:
                cur[2] = 1        # 本体の { に入った
            depth += 1
            i += 1; prev = c
            continue
        if c in ")]}":
            if c == "}" and stack and depth - 1 == stack[-1]:
                # テンプレート文字列の ${ … } が閉じた＝文字列の続きを読む
                depth = stack.pop()
                i = _tpl(src, i + 1, stack, depth)
                if i < 0:
                    i = -i; depth += 1; prev = "("
                else:
                    prev = "str"
                continue
            depth -= 1
            if depth < 0:
                raise ValueError(f"閉じ括弧が多すぎます（{src.count(chr(10), 0, i) + 1}行目）")
            i += 1; prev = c
            if c == "}" and depth == 0 and cur is not None and cur[2] == 1:
                funcs.append((cur[0], cur[1], i)); cur = None
            continue
        if depth == 0 and vu is not None:
            if c == ",":
                vu[2] = True
            elif c == ";":
                vars_.append((vu[0], vu[1], i + 1)); vu = None
        i += 1; prev = c
    if depth != 0 or stack:
        raise ValueError("括弧の数が合いません（最後まで読んでも閉じていない）")
    if vu is not None:
        vars_.append((vu[0], vu[1], n))
    return funcs, comments, vars_


def strip_ranges(src: str, ranges, a: int = 0, b: int | None = None) -> str:
    """src[a:b] から注意書きの範囲を空白に置き換えた文字列（位置はずらさない）。"""
    b = len(src) if b is None else b
    out, pos = [], a
    for s, e in ranges:
        if e <= a or s >= b:
            continue
        s, e = max(s, a), min(e, b)
        out.append(src[pos:s]); out.append(" "); pos = e
    out.append(src[pos:b])
    return "".join(out)


def drop_comments(src: str, ranges, a: int, b: int) -> str:
    """src[a:b] から注意書きを取り除く（スマホへ送る量を減らす・動きは変わらない）。
    注意書きだけの行は行ごと消す。文字列の中は触らない（注意書きの範囲は字句を読んで求めた物だけ）。"""
    out, pos = [], a
    for s, e in ranges:
        if e <= pos or s >= b:
            continue
        if s < pos:
            continue
        ls = src.rfind("\n", a, s) + 1
        if ls < pos:
            ls = pos
        whole = src[ls:s].strip() == ""
        if src.startswith("//", s):
            if whole:
                end = e + 1 if e < len(src) and src[e] == "\n" else e
                out.append(src[pos:ls]); pos = min(end, b)
            else:
                out.append(src[pos:s]); pos = e
        else:
            after = src[e:src.find("\n", e) if src.find("\n", e) >= 0 else len(src)]
            if whole and after.strip() == "":
                nl_at = src.find("\n", e)
                end = nl_at + 1 if nl_at >= 0 else len(src)
                out.append(src[pos:ls]); pos = min(end, b)
            else:
                out.append(src[pos:s]); out.append(" "); pos = e
    out.append(src[pos:b])
    return "".join(out)


def js_without_comments(src: str) -> str:
    try:
        com = scan(src)[1]
        return strip_ranges(src, com)
    except Exception:      # noqa: BLE001  読めない時は注意書きも残す（＝使っていると多めに数える＝安全側）
        return src


def html_without_comments(html: str) -> str:
    html = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    def fix(m):
        return m.group(1) + js_without_comments(m.group(2)) + m.group(3)
    return re.sub(r"(<script\b[^>]*>)(.*?)(</script>)", fix, html, flags=re.S | re.I)


def blob_id(data: bytes) -> str:
    """git の「中身の印」と同じ作り方（改行はLFにそろえてから）。先頭10文字を版の名札に使う。"""
    data = data.replace(b"\r\n", b"\n")
    return hashlib.sha1(b"blob %d\0" % len(data) + data).hexdigest()[:10]


def find_body(text: str, start: int) -> int:
    """text[start] が '{' の所から、対応する '}' の次の位置（入口の show〜 の中身を切り出す用）。"""
    depth, i, n = 0, start, len(text)
    while i < n:
        c = text[i]
        if c in "'\"`":
            q = c; i += 1
            while i < n and text[i] != q:
                i += 2 if text[i] == "\\" else 1
        elif c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    raise ValueError("入口の画面の関数の終わりが見つかりません")


def scan_safe(text):
    try:
        return scan(text)
    except Exception:      # noqa: BLE001
        return [], [], []


# ── どこから読むか（作業中の置き場／コミットに入る分／最後のコミット）──────────────
class Source:
    """mode="work"＝置き場のファイルそのまま／"staged"＝今回のコミットに入る分（git add 済みの中身）／
    "head"＝最後のコミットの中身。★コミットの直前は staged で作る＝ほかの会話の書きかけ（まだ add していない分）を混ぜない。"""

    def __init__(self, mode: str = "work"):
        self.mode = mode

    def _git(self, *args) -> bytes:
        r = subprocess.run(["git", "-C", str(TOP), *args], capture_output=True, timeout=60)
        if r.returncode != 0:
            raise ValueError("git " + " ".join(args) + " が失敗：" + r.stderr.decode("utf-8", "replace")[-200:])
        return r.stdout

    def read_bytes(self, rel: str) -> bytes:
        if self.mode == "work":
            return (TOP / rel).read_bytes()
        return self._git("show", (":" if self.mode == "staged" else "HEAD:") + rel)

    def read_text(self, rel: str) -> str:
        return self.read_bytes(rel).decode("utf-8", errors="replace")

    def names(self, prefix: str = "") -> list:
        """一番上（prefix="parts/" ならその中）のファイル名の一覧。"""
        if self.mode == "work":
            d = TOP / prefix if prefix else TOP
            return sorted(p.name for p in d.glob("*") if p.is_file()) if d.exists() else []
        try:
            return self._names_git(prefix)
        except ValueError:
            return []

    def _names_git(self, prefix: str) -> list:
        if self.mode == "staged":
            out = self._git("-c", "core.quotepath=false", "ls-files", "--", prefix or ".").decode("utf-8", "replace").splitlines()
        else:
            if prefix:
                out = self._git("-c", "core.quotepath=false", "ls-tree", "--name-only",
                                "HEAD:" + prefix.rstrip("/")).decode("utf-8", "replace").splitlines()
                out = [prefix + x for x in out]
            else:
                out = self._git("-c", "core.quotepath=false", "ls-tree", "--name-only",
                                "HEAD").decode("utf-8", "replace").splitlines()
        res = []
        for x in out:
            x = x.strip().strip('"')
            rest = x[len(prefix):] if prefix and x.startswith(prefix) else (x if not prefix else None)
            if rest and "/" not in rest:
                res.append(rest)
        return sorted(res)


# ── 本体 ─────────────────────────────────────────────────────────────────
def build(S: Source = None):
    S = S or Source()
    raw = S.read_bytes("code.js")
    src = raw.decode("utf-8")
    nl = (chr(13) + chr(10)) if (chr(13) + chr(10)) in src else chr(10)
    funcs, comments, vars_ = scan(src)
    # 部品＝一番外側の function 1つ、または一番外側の var 文 1つ（名前の無い var 文は「部品の間の文」扱い）
    units = [([nm], a, b, "f") for nm, a, b in funcs] + [(ns, a, b, "v") for ns, a, b in vars_ if ns]
    units.sort(key=lambda u: u[1])
    allnames = [x for u in units for x in u[0]]
    if len(set(allnames)) != len(allnames):
        dup = sorted({x for x in allnames if allnames.count(x) > 1})
        raise ValueError("同じ名前の部品が2つあります：" + "、".join(dup[:10]))
    nameset = set(allnames)
    unit_of = {x: i for i, u in enumerate(units) for x in u[0]}

    def refs(text):
        """text の中に出てくる部品の番号（名前→部品）。"""
        return {unit_of[x] for x in set(IDENT.findall(text)) & nameset}

    uref = {i: refs(strip_ranges(src, comments, a, b)) - {i} for i, (ns, a, b, k) in enumerate(units)}

    # 部品と部品の間（読み込んだ時に動く文）＝どの画面でも要る
    gaps, pos = [], 0
    for ns, a, b, k in units:
        gaps.append((pos, a)); pos = b
    gaps.append((pos, len(src)))
    core_roots = set()
    for a, b in gaps:
        core_roots |= refs(strip_ranges(src, comments, a, b))

    # 入口：画面ごとの show〜
    idx = html_without_comments(S.read_text("index.html"))
    idx = re.sub(re.escape(BEGIN) + r".*?" + re.escape(END), " ", idx, flags=re.S)   # 機械が書いた一覧は数えない
    dispatch = dict(re.findall(r"v === '([a-z0-9_]+)'\)\s*(show[A-Za-z0-9_]+)\(\)", idx))
    if len(dispatch) < 10:
        raise ValueError("入口の画面の振り分け（v === '…') showXxx()）が読めません。書き方を変えたなら、この道具も直してください。")
    shows = {}
    for m in re.finditer(r"function (show[A-Za-z0-9_]+)\s*\([^)]*\)\s*\{", idx):
        shows[m.group(1)] = (m.start(), find_body(idx, m.end() - 1))
    view_shows = set(dispatch.values())
    missing = view_shows - set(shows)
    if missing:
        raise ValueError("入口に振り分け先の関数が見つかりません：" + "、".join(sorted(missing)))
    rest = idx
    for k in sorted(view_shows, key=lambda k: -shows[k][0]):
        a, b = shows[k]
        rest = rest[:a] + " " + rest[b:]
    rest = re.sub(r"v === '[a-z0-9_]+'\)\s*show[A-Za-z0-9_]+\(\)", " ", rest)   # 振り分けの行そのもの
    core_roots |= refs(rest)
    rest_ids = set(IDENT.findall(rest))
    always_shows = {k for k in view_shows if k in rest_ids}   # 振り分け以外からも呼ばれる画面＝どの画面でも要る
    for f in S.names():
        if not f.endswith((".js", ".html")) or f in ("code.js", "index.html", "sw.js"):
            continue
        t = S.read_text(f)
        core_roots |= refs(html_without_comments(t) if f.endswith(".html") else js_without_comments(t))
    if "doGet" in unit_of:
        core_roots.discard(unit_of["doGet"])     # グーグル側で動いていた時の入口（ブラウザでは呼ばれない）

    def closure(roots):
        seen, st = set(), list(roots)
        while st:
            x = st.pop()
            if x in seen:
                continue
            seen.add(x); st.extend(uref.get(x, ()))
        return seen

    show_ids = {k: set(IDENT.findall(idx[shows[k][0]:shows[k][1]])) for k in shows}

    def show_closure(k):
        seen, st = set(), [k]
        while st:
            x = st.pop()
            if x in seen:
                continue
            seen.add(x)
            st.extend(y for y in show_ids.get(x, ()) if y in shows and y != x)
        return seen

    def show_units(k):
        out = set()
        for s2 in show_closure(k):
            out |= {unit_of[x] for x in show_ids[s2] & nameset}
        return out

    for k in always_shows:
        core_roots |= show_units(k)
    core = closure(core_roots)
    per_view = {v: closure(show_units(k)) - core for v, k in dispatch.items()}
    used = core.union(*per_view.values())
    core |= set(range(len(units))) - used        # どこからも使われていない物＝念のため常に読む

    owners = {}
    for v, s in per_view.items():
        for u in s:
            owners.setdefault(u, set()).add(v)
    groups = {}
    for u, vs in owners.items():
        groups.setdefault(tuple(sorted(vs)), set()).add(u)

    # ファイルの中身を作る（どのファイルも元の順番のまま並べる）
    #   ★注意書き（コメント）は取り除く＝スマホへ送る量が約2割減る（動きは変わらない・正本の code.js には残る）。
    head = "// ★機械が作ったファイル（.githooks/zuko_split.py）。手で直さない＝直すのは code.js。" + nl
    files = {}
    core_txt = [head + "// どの画面でも要る部品（と、部品の間の文を元の順番のまま）" + nl]

    def text_of(a, b):
        return drop_comments(src, comments, a, b)

    for i, (ga, gb) in enumerate(gaps):
        g = text_of(ga, gb)
        core_txt.append(g if g.strip() else nl)
        if i < len(units) and i in core:
            core_txt.append(text_of(units[i][1], units[i][2]))
    files["core.js"] = "".join(core_txt)
    group_file = {}
    for key, us in sorted(groups.items()):
        if len(key) == 1:
            fname = "v_" + key[0] + ".js"
        else:
            fname = "s_" + hashlib.sha1("+".join(key).encode()).hexdigest()[:8] + ".js"
        txt = [head + "// この画面だけで使う部品：" + "、".join(key) + nl]
        for u in sorted(us):
            txt.append(text_of(units[u][1], units[u][2]) + nl)
        files[fname] = "".join(txt)
        group_file[key] = fname

    ver = {f: blob_id(t.encode("utf-8")) for f, t in files.items()}
    full_id = blob_id(raw)
    views = {}
    for v in sorted(per_view):
        # ★読む順番：使う画面が多い組から先（var 文が別の組の var を使う時、使われる側が必ず先に来る）
        ks = sorted((k for k in groups if v in k), key=lambda k: (-len(k), k))
        views[v] = ["parts/" + group_file[k] + "?v=" + ver[group_file[k]] for k in ks]
    info = {"id": full_id, "full": "code.js?v=" + full_id,
            "core": "parts/core.js?v=" + ver["core.js"], "views": views}
    sizes = {f: len(t.encode("utf-8")) for f, t in files.items()}
    return files, info, sizes, len(raw)


def verify(files: dict, full_text: str) -> str:
    """分けた結果を node で確かめる。問題なければ ""、あれば理由。node が無ければ "" （確かめずに進む）。"""
    node = shutil.which("node")
    if not node:
        return ""
    with tempfile.TemporaryDirectory() as td:
        for f, t in files.items():
            Path(td, f).write_text(t, encoding="utf-8")
        Path(td, "_full.js").write_text(full_text, encoding="utf-8")
        check = r"""
const vm=require('vm'),fs=require('fs'),path=require('path');
const dir=process.argv[process.argv.length-1];
function names(files){const ctx=vm.createContext({});
  for(const f of files){new vm.Script(fs.readFileSync(path.join(dir,f),'utf8'),{filename:f});}
  const all=new Set();
  for(const f of files){const t=fs.readFileSync(path.join(dir,f),'utf8');
    // 一番外側の function 宣言だけを数える（字句を読まずに、行頭の function を数える）
    for(const m of t.matchAll(/^function\s+([A-Za-z_$][\w$]*)\s*\(/gm)) all.add(m[1]);}
  return all;}
const parts=fs.readdirSync(dir).filter(f=>f!=='_full.js');
const a=names(['_full.js']), b=names(parts);
const miss=[...a].filter(x=>!b.has(x)), extra=[...b].filter(x=>!a.has(x));
let dupe=0; const seen=new Map();
for(const f of parts){const t=fs.readFileSync(path.join(dir,f),'utf8');
  for(const m of t.matchAll(/^function\s+([A-Za-z_$][\w$]*)\s*\(/gm)){ if(seen.has(m[1])) dupe++; seen.set(m[1],f);} }
if(miss.length||extra.length||dupe){console.log('NG miss='+miss.slice(0,5)+' extra='+extra.slice(0,5)+' dupe='+dupe);process.exit(1);}
console.log('OK');
"""
        r = subprocess.run([node, "-e", check, td], capture_output=True, text=True, encoding="utf-8",
                           errors="replace", timeout=120)
        if r.returncode != 0:
            return (r.stdout + r.stderr).strip()[-400:] or "node で確かめられませんでした"
    return ""


def render_block(info: dict) -> str:
    return BEGIN + "window.__SZ_PARTS_=" + json.dumps(info, ensure_ascii=False, separators=(",", ":")) + ";" + END


def main() -> int:
    check = "--check" in sys.argv
    mode = "staged" if "--staged" in sys.argv else ("head" if "--head" in sys.argv else "work")
    S = Source(mode)
    try:
        files, info, sizes, full_size = build(S)
        why = verify(files, S.read_text("code.js"))
    except Exception as e:      # noqa: BLE001
        files, why, sizes, full_size = {}, str(e), {}, 0
        info = None
    if why:
        # ★安全側：分けられない時は「全部を読む」一覧にする（部品のファイルは作らない）
        print("！本体を画面ごとに分けられませんでした。今回は全部を読む形にします：" + why, file=sys.stderr)
        fid = blob_id(S.read_bytes("code.js"))
        info = {"id": fid, "full": "code.js?v=" + fid}
        files = {}

    html = S.read_text("index.html")
    pat = re.escape(BEGIN) + r".*?" + re.escape(END)
    if BEGIN not in html or END not in html:
        print("！入口(index.html)に部品の一覧を書く所（" + BEGIN + "）がありません。", file=sys.stderr)
        return 1
    new_html = re.sub(pat, lambda m: render_block(info), html, flags=re.S)

    def same(x, y):
        crlf, lf = chr(13) + chr(10), chr(10)
        return x.replace(crlf, lf) == y.replace(crlf, lf)

    have = {f: S.read_text("parts/" + f) for f in S.names("parts/") if f.endswith(".js")}
    diff = [f for f in files if f not in have or not same(have[f], files[f])]
    gone = [f for f in have if f not in files]
    html_diff = not same(new_html, html)
    if check:
        if diff or gone or html_diff:
            print("！部品が本体(code.js)と合っていません：" +
                  "、".join((diff + gone)[:8] + (["入口の一覧"] if html_diff else [])), file=sys.stderr)
            return 1
        return 0
    # 書く＝置き場の parts/ を作る物とそろえる（parts/ は機械だけが書く所）
    work_have = {p.name: p.read_text(encoding="utf-8") for p in PARTS.glob("*.js")} if PARTS.exists() else {}
    wdiff = [f for f in files if f not in work_have or not same(work_have[f], files[f])]
    wgone = [f for f in work_have if f not in files]
    if not (diff or gone or html_diff or wdiff or wgone):
        return 0
    PARTS.mkdir(exist_ok=True)
    for f in wdiff:
        (PARTS / f).write_text(files[f], encoding="utf-8", newline="")
    for f in wgone:
        (PARTS / f).unlink()
    # 入口：置き場のファイルは「一覧の所だけ」書き換える（ほかの書きかけはそのまま）
    wh = INDEX.read_text(encoding="utf-8")
    if BEGIN in wh and END in wh:
        wh2 = re.sub(pat, lambda m: render_block(info), wh, flags=re.S)
        if wh2 != wh:
            INDEX.write_text(wh2, encoding="utf-8", newline="")
    if mode == "staged" and html_diff:
        # コミットに入る入口も「一覧の所だけ」差し替える（まだ add していない書きかけを混ぜない）
        r = subprocess.run(["git", "-C", str(TOP), "hash-object", "-w", "--stdin", "--path", "index.html"],
                           input=new_html.encode("utf-8"), capture_output=True, timeout=60)
        sha = r.stdout.decode().strip()
        if r.returncode != 0 or not sha:
            print("！入口の一覧をコミットに入れられませんでした", file=sys.stderr)
            return 1
        subprocess.run(["git", "-C", str(TOP), "update-index", "--cacheinfo", "100644," + sha + ",index.html"],
                       check=True, timeout=60)
    if files:
        core = sizes.get("core.js", 0)
        print(f"本体を画面ごとに分け直しました：ホームで読む量 {core // 1024}KB（本体全部 {full_size // 1024}KB）・"
              f"作り直した部品 {len(wdiff)}・消した部品 {len(wgone)}")
    return 2


if __name__ == "__main__":
    sys.exit(main())
