---
title: Androidで新規プロジェクトを作ると何もしていないのに壊れた
created_at: 2023-02-19
tags:
- Android
---
毎回 Java のバージョンが足りないって出てくるんだけどなぜ？

```
The consumer was configured to find a runtime of a library compatible with Java 8
```

# 修正
設定を開いて、`Build, Execution, Deployment`を押して`Build Tools`をおして`Gradle`を押します。

そして、`Gradle JDK`の部分を`11`以上の`Java`にします。  

![Imgur](https://imgur.com/3AT260T.png)

## 11 以上の Java がない
入れましょう。  
多分 `Android Studio` 入れたときについてくるはずですが、もしない場合はダウンロードしてくる必要があります。

## Java を入れる
実は `Java (JDK)` は `Oracle` 以外のベンダーも作っていて（マイクロソフトやアマゾンなど）、好きな`11 以降のJDK`を入れて↑の設定を完了させれば解決します。  
おすすめは`Eclipse Temurin （旧 AdoptOpenJDK）`です。別に`Oracle JDK / OpenJDK`でもいいですが

![Imgur](https://imgur.com/p8I1NTw.png)

https://adoptium.net/download/

ダウンロードしたらインストールして、さっきの`Android Studio`の設定画面を開いて、さっき入れたJavaを選択して閉じます。

![Imgur](https://imgur.com/KtIdNeW.png)

あとは `Try Again` を押して完了

![Imgur](https://imgur.com/VDYTzU3.png)

以上でつ、お疲れ様でした。  