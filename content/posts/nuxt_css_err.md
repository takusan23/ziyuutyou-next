---
title: nuxtでcssを指定すると Could not compile template
created_at: 2021-03-29
tags:
- NuxtJS
- JavaScript
---
どうもこんにちは。そろそろ虫の季節かー嫌だなー

# 本題

`nuxt.config.js`で`CSS`を指定すると怒られる

```
Could not compile template ~
```

# 直す

https://ja.nuxtjs.org/docs/2.x/configuration-glossary/configuration-css/

これ見ると`@`が必要みたいだけどなんかいらなかったわ。

```js
  css: [
    "assets/css/styles.css" // @ なしで書く
  ],
```