---
title: Nuxtの静的サイトジェネレートはモードをuniversalにしよう
created_at: 2020-06-16
tags:
- NuxtJS
- JavaScript
- 自作ブログ
---

静的サイト書き出せてたと思ったら書き出せてなかった話です。  
これ以外にも大変だったことがいっぱいあるのでもしよければ見てね。→[大変だったこと](/posts/taihendattakoto)

# なにがあったの
Mastodonの認証マークが付かなかった。  
Mastodonの認証マークはサイトにaタグ置いて、hrefと`rel="me"`付けば通る。ちゃんとChromeであってるか確認したんだけど、なぜか認証されなかった。

## さらに
JavaScriptを無効にすると（めったにないけど）真っ白になった。  
静的サイト書き出しならただHTMLを表示するだけなのになんでJS消すと動かなくなるんだ？。JSがどうこう関係なくね？  

**あれこれJavaScriptで動的にDOM操作？**

# 静的サイトを書き出す方法

`nuxt.config.js`の`mode`を`universal`にする必要があります。  

そうすればHTMLファイルにちゃんと内容がまんま入ってるはずです。

こんな感じに↓  
![Imgur](https://imgur.com/WkV9GT2.png)

(ちなみにVSCode、`Ctrlと+`で拡大、`Ctrlと-`で縮小ができます。間違えて押した時に覚えておけば良いかも？)

以上です。

# おまけ
`mode:'universal'`にしたせいか、VuetifyのChipのところでエラーが出るようになっちゃった。  
よくわからないのでとりあえず`<client-only>`で黙らせた（え）

# 参考にしました
https://jamstack.jp/blog/nuxt_stumble_point/