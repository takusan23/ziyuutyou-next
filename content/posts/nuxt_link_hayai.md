---
title: Nuxt.jsのプリフェッチがはやい
created_at: 2020-06-28
tags:
- NuxtJS
- JavaScript
- Vuetify
---

まずはこちらのGIFを見てください（3MBぐらい）

![Imgur](https://i.imgur.com/oyePdWI.gif)

左側は今まで、右側はNuxt.jsのSmart Prefeching機能を使ったページ遷移です。  

押した瞬間に切り替わっていることが分かると思います。

# Smart Prefeching とは
[本家ブログ](https://nuxtjs.org/blog/introducing-smart-prefetching)

ブラウザの表示領域にリンク`<nuxt-link>`を見つけたらそのリンクをブラウザが先読みする機能。これをプリフェッチ機能っていうらしい。

# 使い方
- `<nuxt-link>`を使う
- Vuetifyの場合
    - `to="遷移先"`と`nuxt`を属性に付けることで利用可能。`nuxt`を付け忘れると機能しない。
    - GIFの用に`<v-card>`をページ遷移に使う際はこんな風に
```html
<v-card
  class="ma-2 pa-5"
  to="`/posts/taihendattakoto"
  nuxt
>
</v-card>
```

以上です。