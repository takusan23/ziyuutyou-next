---
title : 他の人が作ったJetpack Composeのサンプルアプリがビルドできなかった話
created_at: 2021-06-07
tags:
- Android
- Kotlin
- JetpackCompose
---

WWDCの季節ですね。WWDCを見るときはいつも**macwebcasterの同時翻訳**が居たのですが、今年からは居ません。  
なので今回の発表会で気になるプロダクトのアンケートもありません。寂しいね。

# 本題
https://github.com/Gurupreet/ComposeCookBook

をCloneしてビルドしたいんだけどなんかできなかった。

# 今北産業

`Android Studio`左上の`File`から、`Project Structure...`を選び、`Gradle Version`をバージョンアップして、`Try Again`したあと、バージョンを戻したらビルドが通るようになった。

![Imgur](https://imgur.com/WYJR2kZ.png)

# 第一関門

```
Unsupported Kotlin plugin version.
Unresolved reference: compileSdk
```

これは、`Android Studio`左上の`File`から、`Project Structure...`を選択して、`Gradle Version`を上げたらなんか直った。

# 第二関門

エラーの数は減りましたがまだ通りません。

```
Multiple builders are available to build a model of type 'org.jetbrains.plugins.gradle.model.internal.DummyModel'.
```

今度は`Gradle Version`をもとに戻したらビルドが通るようになりました。

# 終わりに
`build.gradle.kts`に移行すべきなのかな。`ext`の変数は補充効かないし。  
`buildSrc`によるライブラリの管理良さそう。

# おまけ
システムドライブが容量不足になったので以下を消した。

- `C:\Users\ユーザー名\.gradle\wrapper\dists`
    - 使ってない`Gradle`を消そう。
- `C:\Users\ユーザー名\AppData\Local\Android\Sdk\system-images`
    - 古いAndroidのバージョンとか使ってないから消そう。

あとシステムドライブだけじゃなくてRAMも足りなくてしんどい。16GBで足りなくなるとかマジ？

![Imgur](https://imgur.com/Jtqw95M.png)