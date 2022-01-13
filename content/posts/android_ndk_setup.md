---
title: ndk-bundle did not have a source.properties file を直す
created_at: 2020-12-11
tags:
- Android
- NDK
---

ライブラリ入れたら出たので解決方法です。

## 環境

|なまえ|あたい|
|--|--|
|Android Studio|Android Studio 4.1|

## でるえらー

```
> NDK at C:\Users\takusan23\AppData\Local\Android\Sdk\ndk-bundle did not have a source.properties file
```

## NDKを入れる

もう導入済みなら飛ばしていいです。

`SDK Manager`から導入できます。

`SDK Tools`へタブ移動して、`NDK`にチェックを入れて`Apply`を押してください。

## `local.properties`を開く

開いたら、`sdk.dir`のしたに一行足します。  

```
ndk.dir=C\:\\Users\\ユーザー名\\AppData\\Local\\Android\\Sdk\\ndk\\21.3.6528147
```

ユーザー名のところは各自変えてね。

`Windows`はこうですが、`macOS`は知らない

これでビルドが通るようになります。