#!/bin/sh
# ─────────────────────────────────────────────────────────────
# スーパーズコApp：版の番号を「本体の中身」から自動で作って入口(index.html)に書き込む。
#
# 【なぜ有る】2026-08-20・まるちゃん依頼。
#   スマホは本体(code.js / detect_core.js)を手元に保存して使う（sw.js の手元優先）。
#   新しい版が届くかどうかは、入口が指す住所の末尾 ?v=… が変わるかどうかだけで決まる。
#   ＝**この番号を上げ忘れると、スタッフのスマホが古い画面のままずっと直らない。**
#   人が手で上げる決まりにしていたが、上げ忘れが何度も起きた（決まり書きに何度も注意が書いてある）。
#   → **中身から自動で作る**ことにした。中身が1文字でも変われば番号が自動で変わるので、
#     上げ忘れが起きようがない。同じ中身なら番号も同じ＝無駄な取り直しも起きない。
#
# 【使い方】
#   .githooks/pre-commit  … コミットの直前に自動で入口を書き直す（人は何もしなくてよい）
#   .githooks/pre-push    … 押し出す直前にもう一度確かめ、ズレていたら止める（二重の安全網）
#   手で確かめたい時＝ sh .githooks/version-stamp.sh --check
#
# 【この仕組みを効かせる設定（clone し直した時だけ1回）】
#   cd /c/Users/User/source/repos/tt && git config core.hooksPath .githooks
#
# 【番号の作り方】git が中身から作る印の先頭10文字。改行の違いは git が吸収するので、
#   別のパソコンで作業しても同じ中身なら同じ番号になる。
# ─────────────────────────────────────────────────────────────

top=$(git rev-parse --show-toplevel) || exit 1
cd "$top" || exit 1

mode="$1"
rc=0

for f in code.js detect_core.js; do
  [ -f "$f" ] || continue
  sum=$(git hash-object "$f" | cut -c1-10)
  cur=$(sed -n "s|.*src=\"$f?v=\([^\"]*\)\".*|\1|p" index.html | head -1)

  if [ -z "$cur" ]; then
    echo "！入口(index.html)に $f の読み込み行が見つかりません。書き方を変えたなら、この道具も直してください。" >&2
    rc=1
    continue
  fi

  [ "$cur" = "$sum" ] && continue

  if [ "$mode" = "--check" ]; then
    echo "！版の番号がズレています： $f  入口=$cur  本体=$sum" >&2
    rc=1
  else
    sed -i "s|src=\"$f?v=[^\"]*\"|src=\"$f?v=$sum\"|" index.html
    echo "版の番号を自動で直しました： $f  $cur → $sum"
    [ $rc -eq 0 ] && rc=2
  fi
done

exit $rc
