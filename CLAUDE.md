# Yuuna Tachihara ポートフォリオ — 引き継ぎメモ

UX/UI デザイナー Yuuna Tachihara のポートフォリオサイト。React 19 + Vite 6 の小さな SPA で、
各ページはデザインキャンバスから書き出した「ボード」（HTML + CSS）をそのまま表示している。

- 公開 URL: https://yuuna-portfolio.vercel.app
- GitHub: https://github.com/yuunatatihara-droid/yuuna-portfolio （非公開、ブランチ `main`）
- Vercel は `main` への push で自動デプロイ（反映まで約15秒）。Vercel CLI は PC 名が日本語のため使えない（ByteString エラー）。デプロイは必ず GitHub 経由。

## ユーザーについて・進め方
- 依頼は日本語と英語の両方で来る。**依頼と同じ言語で返答する**。
- 変更は「確認 → コミット → push → 公開サイトで反映確認」まで一続きで行うのが定着している。
- コミットは GitHub の noreply アドレス（`342170833+yuunatatihara-droid@users.noreply.github.com`）で記録済み。本当のメールは使わない。
- 文字や見た目を変えるときは **日本語版と英語版の両方**、**PC（1440px ボード）とスマホ（390px ボード）の両方** に反映する。

## 守るべき決定事項
- **チームメンバーの名前を一切出さない。** Figma ファイル名に名前が入っているので Figma の埋め込みは使わない（プロトタイプは動画で見せる）。名前が写ったスライド画像も使わない。
- **プロジェクト種別（個人制作／チーム制作）はホームの Selected Projects のメモにだけ表示。** ケーススタディ側（上部ラベル、ヒーローの丸ステッカー、MUSE の情報欄）からは削除済み。
- 言語切り替えは文字だけ（EN | JA）、メニューと同じ半透明の白い角丸。アイコンなし。
- タイポグラフィ: 見出し・数字 = Bagel Fat One、本文 = Zen Maru Gothic、筆記体 = Meow Script。日本語ページは MUSE 日本語版の和文ルール（見出しの日本語は Zen Maru Gothic 太字にフォールバック、行間 1.35、字間、`line-break:strict`）に合わせる。
- 主な色: 濃い緑 `#1F3B24`、クリーム `#F6EFC4`、空色 `#BAD9EE` / `#D4EAF7`、ピンク `#C2345A`。
- アニメーションはすべて `prefers-reduced-motion` で止まるようにする。

## ローカルで動かす（Windows）
```
npm.cmd install
npm.cmd run dev      # http://localhost:5173
npm.cmd run build
```
- PowerShell の実行ポリシーで `npm` が止まるので `npm.cmd` を使う。Node は `C:\Program Files\nodejs`。
- git / gh はインストール済み。git の認証は `gh auth setup-git` で GitHub CLI を使う設定（push 時にサインイン画面が出ないように `GCM_INTERACTIVE=never`）。
- 元ファイルのバックアップ: `C:\Users\yuuna\Downloads\yuuna-portfolio-backup-2026-10-22`

## ページとルート（`src/App.jsx`）
| 日本語 | 英語 | ボード |
| --- | --- | --- |
| `/` | `/en` | `home-hero(-en)` + `home-works(-en)` + `home-footer(-en)` |
| `/about` | `/en/about` | `about` / `about-en` |
| `/works/muse` | `/en/works/muse` | `muse-ja` / `muse-en` |
| `/works/maplenest` | `/en/works/maplenest` | `maplenest-ja` / `maplenest-en`（**生成ファイル**） |

`/works/muse/ja` は旧 URL として残している。未知の URL はその言語のホームを表示。

## 仕組み
- `src/components/Board.jsx`: ボードを Shadow DOM に描画。クリックで内部リンクを `navigate()`、`hreflang` 付きリンクは言語の選択を保存、`data-href` 付きの要素（ホームの作品カード全体）もリンクとして扱う。
  - スクロール演出: `board.reveal`（`{ kind: selector }`）に一致する要素へ `data-reveal="kind"` を付け、要素の上端が画面の 85% を過ぎたら `.in` を付ける（スクロールごとに判定。IntersectionObserver は clip-path で隠した要素を検知できないので使わない）。
- `src/components/ResponsivePage.jsx`: 幅 767px 以下はスマホ用ボード（390px）、それ以上は PC 用（1440px）を画面幅に合わせて `zoom` で拡大縮小。
- `src/language.js` + `App.jsx`: 初回表示時、保存された選択 → ブラウザの言語（English と Japanese のうち先に来る方）→ 既定は英語、の順で言語を決め、もう一方の言語の URL だったら置き換える。

## ボードの編集方法
ボードファイルの形:
```
// 1行目はコメント
export default {
"desktop": { "width": 1440, "reveal"?: {...}, "css": "...", "html": "..." },
"mobile":  { "width": 390,  "reveal"?: {...}, "css": "...", "html": "..." }
};
```
- css / html は JSON 文字列（`\"` や `\n` がエスケープされている）。**sed で直接書き換えると失敗しやすい**ので、Node で `import()` して文字列を置換し、同じ形で書き戻すのが確実。
- **Maple Nest のボードは手で編集しない。** 文章は `tools/maplenest/content.mjs`（EN/JA）、追加 CSS は `tools/maplenest/styles.css`、構造は `tools/maplenest/build.mjs` を直して `node tools/maplenest/build.mjs` で再生成する。ベース CSS は MUSE のボードから取っている（MUSE の CSS を変えると Maple Nest にも影響する）。
- `tools/lang-switch.mjs`: 言語切り替えの HTML（全ページ共通のデザイン）。
- `tools/about-hero.mjs`: About のヒーロー（レースの上の手紙・封蝋・星、プロフィール写真のピンクの蔓フレーム）を JA/EN・PC/スマホに書き込む。ヒーロー部分と追加 CSS を置き換えるので何度でも再実行できる。文章はボード内の既存の文言を引き継ぐ。
- `tools/about-skills.mjs`: About の Skills の3枚（01 ピンクの切手、02 ポストカード＋消印、03 セージの切手、それぞれクリップ付き）を同じ要領で書き込む。項目は既存のボードから読み取る。**ハート型や「Postcard」「Love, Yuuna」「YUUNA」など内容に関係ない文字は入れない**（ユーザーの指示）。
- `tools/about-journey.mjs`: About の My Journey を同じ文房具調に（ピンク／セージのポストカード枠、ミシン目の切手、ストライプのマスキングテープの日付、ピンクの点線のタイムライン、入れ子カードに金のクリップ）。文章には触れない。
- `tools/project-motion.mjs`: ケーススタディのスクロール演出 CSS・reveal 設定・タイトル文字分割（MUSE と Maple Nest で共通）。

## 演出（現状）
- ホームのヒーロー: 降る星、名前の1文字ずつの登場とホバーで波打つ動き、雲の星の揺れ、バッジ回転、作品ステッカーの浮遊。下の余白は2倍に拡大済み。
- ホームの Selected Projects: Figma 風（選択枠が描かれる、カーソルが動く、120px の赤線が伸びる、ホバーで選択状態）。カード全体がクリック可能。下部は方眼紙がフッターの空にフェード。
- ケーススタディ: 見出しやカードがスクロールで現れる、アンケートの棒が伸びる、ヒーローの選択枠、タイトル文字の登場とホバー。**スマホ画面（モックアップ）は動かさない**（ユーザーの指示）。

## 未完成・確認待ちの項目
- About: 自己紹介の追加1文が仮置き（「[ここに自己紹介をもう一言…]」/「[One more line about yourself…]」）。
- MUSE の振り返り3枠が仮置き（「[Add — connect to a specific decision or experience]」/「[追加予定 — …]」）。
- メールアドレス `yuuna.tatihara@gmail.com` の綴り（名前は Tachihara）が正しいか未確認。
- Maple Nest の担当範囲・期間（2026年6月〜9月）・振り返りの文面はスライドからの推測。本人の確認待ち。
- ビルド時の「500 kB を超えるチャンク」警告はボードを1本にまとめているため。今のところ対応不要。

## 確認のコツ
- アプリ内のブラウザペインが非表示だと描画・アニメーション・スクロール判定が止まる。スクリーンショットを撮ると描画が進む。
- ボードは `zoom` で拡大縮小されているので、座標は `.board-zoom` の zoom で割ってボード上の px に直す。
- 公開版の確認は `curl -s https://yuuna-portfolio.vercel.app/ | grep -o 'index-[A-Za-z0-9_-]*\.js'` が手元の `dist/assets` と一致するのを待つ。
