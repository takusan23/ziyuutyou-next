---
title: Google Search Consoleにこのサイトのインデックス化してもらおう
created_at: 2020-10-31
tags:
- GoogleSearchConsole
- NuxtJS
---

ちょっと前の記憶から書きます

# 本題
Googleの検索にこのサイトを載せてほしい。  
そのために`Google Search Console`を使うといいらしい

# Google Search Console とは
- Google検索でサイトを発見できるかどうか
    - クローラー？GoogleBot？を弾いてないかとか
- サイトマップを登録して明示的にサイトを登録してもらうとか
    - 今回はこれ

# Google Search Consoleに登録する

https://search.google.com/search-console/welcome?hl=ja

を開いて、`URL プレフィックス`の方にURLを入力します。

で、本来は認証のためにいくつか作業が必要そうですが、**なんかGoogle Domainsでドメインを取ったおかげか自動で認証されました。**

![Imgur](https://imgur.com/DFjFW8r.png)

# サイトマップを書き出す
## Nuxt.js での作業
参考にしました：https://ninebolt.net/articles/nuxt-content-sitemap/


(前提：`nuxt/content`を利用していること)

まずは`@nuxt/sitemap`を入れます

```
npm install @nuxtjs/sitemap
```

そしたら、`nuxt.config.js`を開いて、


`modules`の配列に足します。
```js
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxt/content',
    '@nuxtjs/sitemap'
  ],

```

そうしたら、その下の方に以下のようなコードを書きます。  
私の場合は記事が`posts`に入っていますが、ここは各自書き換えてください。

```js
  /**
   * サイトマップ書き出し
   */
  sitemap: {
    hostname: 'https://takusan.negitoro.dev',
    routes: async () => {
      const { $content } = require('@nuxt/content')
      const posts = await $content('posts').only(['path']).fetch()
      return posts.map(post => post.path)      
    }
  }
```

全部くっつけるとこんな感じ

```js
export default {
  
  // --- 省略 ---
  
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/pwa',
    '@nuxtjs/markdownit',
    '@nuxt/content',
    '@nuxtjs/sitemap'
  ],

  // --- 省略 ---
  
  /**
   * サイトマップ書き出し
   */
  sitemap: {
    hostname: 'https://takusan.negitoro.dev',
    routes: async () => {
      const { $content } = require('@nuxt/content')
      const posts = await $content('posts').only(['path']).fetch()
      return posts.map(post => post.path)      
    }
  }
}
```

書き足せたら、`localhost:なんとか/sitemap.xml`とブラウザのアドレス欄へ入力してみると、xmlファイルみたいなのが出てくると思います。

こんなの↓

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
<url>
<loc>https://takusan.negitoro.dev/posts/search_console</loc>
</url>
<url>
```

確認できたら、`nuxt generate`して、NetlifyなりGitHub Pagesなりに公開しましょう。

(`nuxt generete`すると勝手に`/sitemap.xml`も生成されるそうです)

## Google Search Console での作業

ナビゲーションドロワーの中から`サイトマップ`を選んで、`新しいサイトマップの追加`にURLを入れます。

![Imgur](https://imgur.com/szoUpIE.png)

あとは数日待てばいいらしい。

# URL 検査 # とは
URLを入れるとoogle検索で見つけることができるか(登録済みかどうか)を確認できる機能です。

![Imgur](https://imgur.com/7PXFURn.png)

でもなんか見つからなかった

# site:サイトのURL でも代替できる

こんな感じに

![Imgur](https://imgur.com/sr3hFm3.png)

# なんかリンクがおかしい

`URL 検査`のカバレッジを眺めてみると、なんかURLが違うんですよね

![Imgur](https://imgur.com/N7eo5oE.png)

これどうやら`<link data-n-head="ssr" rel="canonical" href="">`が悪さをしているっぽいですね。  

これなんか相対パスが勝手に入ってる（私が知らんうちにやってた？）んですが、これ絶対パス入れないとおかしくなるっぽいですね。

というわけでちゃんと指定するように、`head{ }`を変更してきました。

```js
  // タイトル変更に使う
  head() {
    // エラーでちゃうからanyで。解決方法ある？
    const title = (this as any).article.title;
    const url = `https://takusan.negitoro.dev/posts/${(this as any).article.slug}`;
    return {
      title: title,
      meta: [
        { hid: "og:url", property: "og:url", content: url },
        { hid: "og:title", property: "og:title", content: title },
      ],
      link: [{ rel: "canonical", href: url }],
    };
  },
```

ところで`as any`直したいんだけど、TypeScriptの`class`と`interface`どっちがいいですか？  
とか調べてたら`type`とかいう概念もあってよくわからなくなった。