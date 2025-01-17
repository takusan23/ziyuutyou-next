---
title: Vite 6 と React 19 移行メモ
created_at: 2025-01-01
tags:
- JavaScript
- TypeScript
- Vite
- React
---
あけましておめでとうございます。  

# 最新バージョンに追従していく
`Vite / React / Tailwind CSS / esbuild`を使ってるプロジェクトの現状です。  
`Vite`で何か怒られています。もうついでに`Vite 6`にして解決させようと。あと`React 19`が出ててこれもやらなきゃなんだよな。

```plaintext
PS C:\Users\takusan23\Desktop\Dev\FigmaPlugin\yajirushi-mode> npm run build

> yajirushi-mode@1.0.0 build
> npm run build:ui && npm run build:plugin -- --minify


> yajirushi-mode@1.0.0 build:ui
> npx vite build --minify esbuild --emptyOutDir=false

The CJS build of Vite's Node API is deprecated. See https://vitejs.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.
vite v5.1.4 building for production...
transforming (2) ..\vite\modulepreload-polyfill.jsBrowserslist: caniuse-lite is outdated. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
✓ 75 modules transformed.
rendering chunks (1)...

Inlining: index-CH6DdFSF.js
Inlining: style-Na_izZ1e.css
../dist/index.html  267.46 kB │ gzip: 74.19 kB
✓ built in 2.20s

> yajirushi-mode@1.0.0 build:plugin
> esbuild src-plugin/code.ts --bundle --target=es2015 --outfile=dist/code.js --minify


  dist\code.js  4.2kb

Done in 44ms
PS C:\Users\takusan23\Desktop\Dev\FigmaPlugin\yajirushi-mode> 
```

なんかヤバそうな文章が  

```plaintext
The CJS build of Vite's Node API is deprecated. See https://vitejs.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.
```

# 環境
このプロジェクトは`Figma`のプラグインなんですが、`Figma`関係ないところの作業なんですよね。  
https://www.figma.com/community/plugin/1344710416431362546

ライブラリ。重要そうなところを抜粋  
移行前の`package.json`を全部見たい場合は↓  
https://github.com/takusan23/yajirushi-mode/blob/6c818ffd4757e5e2ef1c2f678314517a88fb0b03/package.json#L1


```json
"i18next": "^23.10.0"
"react": "^18.2.0"
"react-dom": "^18.2.0"
"react-i18next": "^14.0.5"

"esbuild": "0.20.1"

"vite": "^5.1.4"
"vite-plugin-singlefile": "^2.0.0"
"vite-plugin-svgr": "^4.2.0"

"postcss": "^8.4.35"
"tailwindcss": "^3.4.1"
"autoprefixer": "^10.4.17"

"typescript": "^5.3.2"
```

# あんまり影響無さそうなライブラリアップデート
`esbuild`、`TypeScript`、`Tailwind CSS`を上げた。  
ビルドできるしスタイリングもされてそう。

# Vite 6 にした
https://vite.dev/blog/announcing-vite6

```shell
npm install -D vite
```

なんか普通にビルドできる。リンク先を見ると`Vite 6`で削除ってあるけど、なんかビルドできている。。。  

```plaintext
The CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.
vite v6.0.6 building for production...
✓ 72 modules transformed.
rendering chunks (1)...
```

## Vite の警告に対応するため type module
https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated

- `vite.config.ts`は`ESM 構文`か
    - `export default`なので`CJS`じゃなく`ESM`っぽいんだよな
- `package.json`に`"type": "module"`を追加するか、該当ファイルを`.mjs`、`.mts`の拡張子に変更する

わからん...  
そもそも`CJS`時代を知らんから`ESM`なはずなんだよな（よくわからん）

```diff
{
  "name": "yajirushi-mode",
  "version": "1.0.0",
  "description": "自分のFigmaプラグイン",
  "main": "code.js",
+ "type": "module",
  "scripts": {
```

とりあえず`"type": "module"`を足してみる

ちなみに`CJS`が`CommonJS`、`ESM`が`ES Modules`の略で  
`CJS`だと`require() / module.exports = ...`、`ESM`だと`import / export default ...`みたいな書き方を言うそうです。  

なんで2つもあるんって話は調べてもらえば分かるのですが、ブラウザだと`<script src="...">`でライブラリを追加できたのが、`Node.js`だとそもそも`html`を書かないのでライブラリを読み込ませる手段がないってことで作られたそう。  
のちに言語仕様として逆輸入されるのですがその際は後者の構文が採用されました（なんで`CJS`が採用されんかったのかは追えてない）。  

`ESM`をわざわざ作ったのは多分この辺に書いてありそう
- https://blog.jxck.io/entries/2017-08-15/universal-mjs-ecosystem.html
- https://news.ycombinator.com/item?id=36538189

## 動かない

```plaintext
vite v6.0.6 building for production...
✓ 5 modules transformed.
x Build failed in 108ms
error during build:
[vite:css] Failed to load PostCSS config (searchPath: C:/Users/takusan23/Desktop/Dev/FigmaPlugin/yajirushi-mode/src-ui): [ReferenceError] module is not defined in ES module scope
```

`PostCSS`は`Tailwind CSS`で使ってるやつですね、で  
`Failed to load PostCSS config`はなんだろう。`Vite + Tailwind CSS`のセットアップをミスったか

https://github.com/QwikDev/qwik/issues/836

## Tailwind CSS と PostCSS を ESM の書き方にする
どうやら`tailwind.config.js`と`postcss.config.js`が`CJS`の書き方なのに、`package.json`に`"type": "module"`を足したことにより全てが`ESM`として扱われ、`CJS`が読み込めなくなってそう。  
最短ルートとしては、`tailwind.config.js`と`postcss.config.js`が`CJS`であることを示すため拡張子を`.cjs`にするのが早そう？

と思ったら`Tailwind CSS`が`ESM`でセットアップできるようになってそう  
よくわからんけど`ESM`で書けるならこっちにしておくか  
- https://github.com/tailwindlabs/tailwindcss/pull/10785
- https://tailwindcss.com/blog/tailwindcss-v3-3#esm-and-typescript-support
    - 公式アナウンス

`npx tailwind init`コマンドが`ESM`に対応して、`package.json`で`"type": "module"`を使ってると認識した時、`export default`の形で出せるようになったそう。  
適当に新規プロジェクトを作ったときの`tailwind.config.ts`と`postcss.config.js`を貼っておきます。`ESM`です！！！

`tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss'

export default {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
```

`postcss.config.js`

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

というわけでこれの書き方にすれば`"type": "module"`に書き足すだけで終わり！！  
雰囲気で直せるはず。

というわけで直してみた。ちゃんとビルド出来てます。

```plaintext
PS C:\Users\takusan23\Desktop\Dev\FigmaPlugin\yajirushi-mode> npm run build

> yajirushi-mode@1.0.0 build
> npm run build:ui && npm run build:plugin -- --minify


> yajirushi-mode@1.0.0 build:ui
> npx vite build --minify esbuild --emptyOutDir=false

vite v6.0.6 building for production...
✓ 72 modules transformed.
rendering chunks (1)...

Inlining: index-BLKDaB2f.js
Inlining: style-DxF5_FC1.css
../dist/index.html  268.13 kB │ gzip: 74.94 kB
✓ built in 2.01s

> yajirushi-mode@1.0.0 build:plugin
> esbuild src-plugin/code.ts --bundle --target=es2015 --outfile=dist/code.js --minify


  dist\code.js  4.2kb

Done in 8ms
PS C:\Users\takusan23\Desktop\Dev\FigmaPlugin\yajirushi-mode> 
```

見たい方がいるかわかりませんが一応差分です。  
https://github.com/takusan23/yajirushi-mode/commit/d526b34be74fbca0a9a8a0a86b9307f799122a81

# React 19 にする
https://ja.react.dev/blog/2024/04/25/react-19-upgrade-guide

`react`に付随する`react-i18next`周りもやるか。  
まずアップデートするか。

```shell
npm install --save-exact react@^19.0.0 react-dom@^19.0.0
npm install --save-exact @types/react@^19.0.0 @types/react-dom@^19.0.0
```

`react-i18next`使ってるのでそれらも

```shell
npm install react-i18next i18next --save
```

## codemod 使ってみる
勝手に書き直してくれるそう、使ったこと無いので使ってみる。`git`あるからすぐ戻せるし。えいっ

```shell
npx codemod@latest react/19/migration-recipe
```

`a`キーを押してすべての`codemod`にチェックを付け、`enter`で実行。`git`にコミットしてない差分が残ってるけどお前やるか？って聞かれたので`enter`。やります。  
`npm i`したときに`package.json`書き換わってるだけなので。

・・・何も変わっていない。  
本当にこれでいいのか、ちゃんとマイグレーションガイドを読みます。

よくわからんけど読んだ。ペライチ`React`アプリだから、そもそもそんなに使ってない。からいいか。

# TypeScript TS2865 エラーが出ている
`tsc`コマンドを叩いたらこれ。

https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#isolated-declarations

![Imgur](https://i.imgur.com/a6HojJg.png)

```plaintext
グローバル値と競合するため、'isolatedModules' が有効な場合は、型のみのインポートで宣言する必要があります。ts(2865)
```

どうやら`import`で使った名前と同じ名前の関数があるのが原因っぽい？  
名前変えたら直った（えっ）

```plaintext
(alias) type ArrowDirection = "endSide" | "startSide" | "startAndEndSide"
import ArrowDirection
function ArrowDirection({ arrowDirection, onChange }: ArrowDirectionProps): JSX.Element
```

# おわりに
該当リポジトリです

https://github.com/takusan23/yajirushi-mode

以上です、お疲れ様でした ﾉｼ