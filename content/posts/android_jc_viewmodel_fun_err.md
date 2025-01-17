---
title: Jetpack ComposeのviewModel()が赤くなる
created_at: 2021-06-02
tags:
- Android
- Kotlin
- JetpackCompose
---
どうもこんばんわ。  
WWDCも夜勤で見れません。あとまいてつがセール中なんだって？気になる

# 本題

`viewModel()`関数がなんか赤くなってる。別にバージョンもいじってないのに

![Imgur](https://i.imgur.com/Nt8YeKE.png)

# 直し方

左上の`File`から`Invalidate Caches/ Restart...`を選んで、`Invalidate and Restart`を押せば勝手にAndroid Studioが再起動する。

![Imgur](https://i.imgur.com/alXmBnd.png)

# 終わりに
`Jetpack Compose`では`ViewModel`を使わないみたいなのを観測したけどどういうことなの？  