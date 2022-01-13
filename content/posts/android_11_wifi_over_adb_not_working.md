---
title: Android 11のワイヤレスデバッグ(Wi-Fi経由のADB)が動かないのを直す
created_at: 2021-05-03
tags:
- Android11
- ADB
---

どうもこんばんわ。銀行系アプリがUSBデバッグ有効時に起動しないのめんどくせえ

# 本題
Wi-Fi経由のADBがなんかうまく動かない。  
うまくいくときは上手くいくんだけどね。うまく動かないときはずっとAndroid側が読み込んでる。

# 環境

|なまえ|あたい|
|---|---|
|Android Stuido|Android Studio Arctic Fox | 2020.3.1 Canary 14|
|Windows|10 Pro|
|スマホ|Pixel 3 XL(Android 11) / Android 11のカスタムROM搭載機|

# 対処する
まず`SDK Manager`を開き、`SDK Tools`へ移動して`Android SDK Platform-Tools`を更新します。  

本来はこれで利用できるはずなんですが、私の場合はなぜか利用できませんでした。

# ADBのパスを修正
ドキュメントを見ると、`adb pair`コマンドが使えるようになったっぽいんですが、私の環境でやるとなぜか存在しないんですね。  
更新したのに

```
adb pair
adb: usage: unknown command pair
```

その次に、`ADB`のバージョンを確認しようと`adb --version`を叩くと衝撃の事実が。

```
adb --version
Android Debug Bridge version 1.0.40
Version 4797878
Installed as C:\Program Files (x86)\Android\platform-tools\adb.exe
```

`adb.exe`は`C:\Program Files (x86)\Android\platform-tools`にある？あれ？  
`SDK Location`は`AppData\Local\Android\Sdk`に設定してあるのに？

# 環境変数を直す
Windowsの検索から環境変数で調べてもらってもいいですし、スタートボタン（"スタート"の文字がVistaから消えて何年たった？）を右クリックして`システム`を押して、`システムの詳細設定`を選び、`環境変数`を押してもいいです。

開けたら、`システム環境変数`の方の`Path`をダブルクリックして、

`C:\Program Files (x86)\Android\platform-tools`を消して

`C:\Users\ユーザー名\AppData\Local\Android\Sdk\platform-tools`を追加して閉じます。

そして再起動

再起動後、コマンドプロンプトで`adb --version`と入力して、パスが修正されていれば完了です。

# これで利用できるようになったはず
多分おま環でしょうが一応置いておきます。  
あとワイヤレスデバッグを一旦OFFにしてまたONにすると直ったりするかも。

以上です。