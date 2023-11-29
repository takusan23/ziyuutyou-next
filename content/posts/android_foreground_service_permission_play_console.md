---
title: Play Console のフォアグラウンドサービスの権限を申告してみた
created_at: 2023-11-30
tags:
- Android
- PlayConsole
---

どうもこんばんわ。  
また`NewRadioSupporter`の更新を配信しようとした時の話。

前回： https://takusan.negitoro.dev/posts/android_background_location_play_console/

# フォアグラウンド サービスの権限

```plaintext
フォアグラウンド サービスの権限
Android 14 をターゲットとするアプリでフォアグラウンド サービスを使用する場合、デベロッパーはその特定のフォアグラウンド サービスのタイプに適したフォアグラウンド サービスの権限を申告する必要があります。
```

![Imgur](https://imgur.com/9dG1ngf.png)

というわけでこれをやっていきます。  
多分`FOREGROUND_SERVICE_SPECIAL_USE`以外でも**フォアグラウンドサービスを使う場合は申請が必要**そう、、、


こうしき えいご：https://support.google.com/googleplay/android-developer/answer/13392821  
こうしき にほんご：https://support.google.com/googleplay/android-developer/answer/13392821?hl=ja

## その前に FOREGROUND_SERVICE_SPECIAL_USE
`FOREGROUND_SERVICE_SPECIAL_USE`を使う場合、なんか`AndroidManifest.xml`に利用目的を書かないといけないんだけど、  
`Play ストア`のレビュアーが見るためだけに存在しているらしく、`文字列リソース（@string/hogehoge）`とかは確か入れられないんですよね（？）

https://github.com/takusan23/NewRadioSupporter/blob/master/app/src/main/AndroidManifest.xml#L23-L31

![Imgur](https://imgur.com/4B6Kfu3.png)

英語でそれっぽく書いてるけどいいの（？？？）

# 申告を開始

![Imgur](https://imgur.com/nloUlmb.png)

必要なのは、

- 利用目的
- 利用方法を示した動画

えぇ・・・また動画作るの（前回`ACCESS_BACKGROUND_LOCATION`で作った）  
動画ってストアからインストールした直後（初回起動）から取る必要があるのかな（まぁそうだろ）

なんかドキュメント読んでもいまいちよくわからない

## 利用目的
とりあえず書いてみた。  
利用目的を書けって書いてあったけど、一応フォアグラウンドサービスを起動する手順も追加で書いておいた。

![Imgur](https://imgur.com/yMIpy6G.png)

## 動画
どうやら、手順も動画内に書けってことらしい。  
画面録画だけじゃなくて手順も書かないといけないのか、また動画編集します  

![Imgur](https://imgur.com/RLfzoWt.png)

というわけで作ってます  
どこまでやればいいのか知らないけど、とりあえず、**アプリインストール直後（初回起動）～フォアグラウンドサービスの起動と終了**まで録画した。

![Imgur](https://imgur.com/l5bMUvl.png)

できました、`YouTube`にあげます  
多分`Google Drive`に`mp4`をアップロードして`共有URL`を貼り付けるとかでもいいはず。（インターネットから制限なく見れるところにおいておけばいいんじゃない？）

![Imgur](https://imgur.com/fiJv2gW.png)

![Imgur](https://imgur.com/Mly4Ha1.png)

限定公開で（別に公開するようなものじゃないし）

![Imgur](https://imgur.com/fiJv2gW.png)

アップロードできたら、動画のリンクを貼って、保存します。

![Imgur](https://imgur.com/AybyWUC.png)

うーん、、一回で理解してもらえるか分からないけどとりあえず出してみます。

![Imgur](https://imgur.com/AybyWUC.png)

![Imgur](https://imgur.com/bOqJZuB.png)

# 通った！
一回で通った！！！うれしい！

![Imgur](https://imgur.com/rw9Fkq7.png)

対応済み！

![Imgur](https://imgur.com/RGNogBH.png)

以上です！！  
お疲れ様でした 88888888888888888888