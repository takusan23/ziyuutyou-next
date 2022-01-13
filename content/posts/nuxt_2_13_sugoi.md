---
title: Nuxt.jsのFull Staticがすごい
created_at: 2020-06-27
tags:
- NuxtJS
- JavaScript
- Vuetify
---

歯磨きしたら血が出た。ちょっとびっくりした

# 本題
Nuxt.jsの2.13から`完全な静的生成`機能がついた模様。  
むしろ今までは完全ではなかったのか？って話でよくわからないけど、この中にある`ルーティング自動生成`が多分強い。

詳しくはこれ  
[本家ブログ](https://nuxtjs.org/blog/going-full-static)


# こんなん読んでられんわ

- 1.Nuxt.jsをアップデートする
- 2.`nuxt.config.js`にこんな感じで`target:static`を指定
```js
export default {
  // 静的サイト書き出し。universalとstatic入れてね
  mode: 'universal',
  target: 'static',
}
```
- 3.`package.json`の`generate`スクリプトを以下に変更
```json
"scripts": {
  "generate": "nuxt build && nuxt export",
}
```
- 4.`npm run generate`を実行する。`dist`フォルダができる。おつかれ様です。
- おまけ：`npx nuxt serve`で静的生成したサイトをすぐに確認できるようになりました。

# 何ができるようになるの？
- 新しくなった静的生成
    - `nuxt generate`から
    - `nuxt build && nuxt export`へ
- 怖くないルーティング
    - 勝手にページを解析し、リンクを自動で見つけて勝手に生成します。
    - どういうことかと言うと、以下のJSの用に`generate.routes`を書く必要がもうないということです。**コメントと化した結構重要（多分一番めんどい）な部分**
```js
export default {
  generate: {
    // routes: generateRoutes, // 生成する
    dir: 'docs'
  },
}
```

# Nuxt.jsのアップデート
2.0から2.13へ上げます。  
## package.json 開いて

`dependencies`の中の`nuxt`を`^2.13.1`にします。以下は一例

```json
"dependencies": {
  "@nuxtjs/google-analytics": "^2.3.0",
  "@nuxtjs/markdownit": "^1.2.9",
  "@nuxtjs/pwa": "^3.0.0-0",
  "markdown-it-footnote": "^3.0.2",
  "markdown-it-highlight": "^0.2.0",
  "nuxt": "^2.13.1"
},
```

なお私もよく分かっていない。`^`←これなに？

## package-lock.json ファイルと node_modules フォルダを消す

npm installで再召喚するので大丈夫

## npm install を実行
`npm install`を実行します。  
おそらくおま環だろうけど私の環境では**管理者権限**ないとできませんでした。

### こける
まあうまく行かないよね
- `Unexpected end of JSON input while parsing`なんとか
    - 管理者権限でcmd等を開いて`npm cache clean --force`を実行する。**何してるか分かってるよな？** って言われた。分からない  
    `npm WARN using --force I sure hope you know what you are doing.`

# nuxt.config.js を開く
開いたら、静的生成して＾～ってNuxtに伝えます。  
`target:static`を追加します。

```js
export default {
  // 静的サイト書き出し。universalとstatic入れてね
  mode: 'universal',
  target: 'static',
}
```

# nuxt build && nuxt export
`package.json`を開いて、`script`にある、`generate`を書き換えます。

```json
"scripts": {
  "generate": "nuxt build && nuxt export",
}
```

# npm run generate 実行
すると生成されます。お疲れ様でした～

# 怖くないルーティング  
今回のNuxt.jsさんは、勝手にリンクを見つけてリンクの分だけ生成するようになったのでもう不要です。  
いやールーティング面倒だったのでこれはとてもありがたい。

一応、`nuxt.config.js`で明示的に無効にする（`generate.crawler: false`）ことで旧仕様（`generate.routes`）を利用できるっぽい。

# 静的生成したサイトを確認できる機能
本番環境（私ならNetlify）に公開された場合どんな感じに見れるのか（多分変わらんと思うけど）を確認できる機能が付きました。

- 一度きりなら
    - `npx nuxt serve`（package.jsonにscript書かなくても、`npx`使えば直接使える）
- package.jsonに書くなら
```json
"scripts": {
  "staticdev": "nuxt serve",
}
```
実行は`npm run staticdev`（別に`staticdev`って名前である必要はない。みんなはかっこいい名前をつけてあげよう）

# おまけ
## Vuetifyが変わった？

`v-content`から`v-main`になった模様

あと強制上書きCSSがまた動かなくなってた（力技やめとけ）  
それでふと`SCSS`ってやつでVuetifyが適用するCSSの内容変えられるやんって思って見てみると、あるんですね～

```scss
// Vuetifyが勝手に色つける問題
$code-background-color: '#000000';
```

`code-background-color`なんていつの間に追加してたの？

また今度やろうと思います

# おわりに
`npx`なんて便利な機能あったんですね（え）

# 参考にしました。
https://nuxtjs.org/blog/going-full-static  
https://ja.nuxtjs.org/guide/upgrading/  
https://microcms.io/blog/nuxt-full-static-generation/