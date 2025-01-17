---
title: Play ストアでバックグラウンド位置情報取得権限 ACCESS_BACKGROUND_LOCATION を使うアプリを公開してみた
created_at: 2023-10-08
tags:
- Android
- PlayConsole
---

どうもこんにちは。  
`NewRadioSupporter` の更新を配信しようとした時の話。

# リリースしようとしたら
**バックグラウンドで位置情報を取得する権限**を使う場合は、追加で申告をしないといけないらしい。  
まぁそこそこ危険な権限だよな。。。

![Imgur](https://i.imgur.com/G8z5jtf.png)

どうやらバックグラウンド状態で位置情報にアクセスするには、アプリの審査で追加の申告をしないといけないらしい。のでメモ

![Imgur](https://i.imgur.com/y02GXIf.png)

## 文字で書く部分
アプリが何なのか、とバックグラウンドで位置情報を取得する機能が何なのかを書きます。

![Imgur](https://i.imgur.com/zL781Yc.png)

![Imgur](https://i.imgur.com/3pxyDeD.png)

## 動画

使い方を表す**動画**を提出する必要がある模様。

https://support.google.com/googleplay/android-developer/answer/9799150?hl=ja#Video%20demonstration

`動画の中で機能やその影響～` ← なんか動画の中に説明も入れろ、みたいな言い方をしてるので、  
バックグラウンド位置情報取得をする流れを画面録画をした上で、`AviUtl`で文字を入れて適当に作りました。~~数年前はよくニコニコ動画に投稿してたので動画作る環境はあるっちゃある~~

![Imgur](https://i.imgur.com/FIQYmyT.png)

`YouTube`に上げるのを推奨しているらしいのでそうした。別に`Google Drive`の共有でも良いらしい。  
限定公開なので動画説明欄とかは適当でいいはず。

![Imgur](https://i.imgur.com/DzcMGZv.png)

限定公開で公開して  

![Imgur](https://i.imgur.com/UdAfwq0.png)

PlayConsole へ戻り申告フォームに URL を貼ります。

![Imgur](https://i.imgur.com/ZARjWfy.png)

## プライバシーポリシー
元々ありましたが、プライバシーポリシーもこれに合わせて更新しました。  
アプリ内からも飛べるようにしました。

https://github.com/takusan23/NewRadioSupporter/blob/master/PRIVACY_POLICY.md

もしかすると、`GitHub`のリポジトリ内にある`Markdown`だとリジェクトされるかも（後述します）

# 審査出しする・・・！
おねがいします

![Imgur](https://i.imgur.com/2cdTKvC.png)

## リジェクトされる 1回目

![Imgur](https://i.imgur.com/86QiK36.png)

プライバシーポリシーが甘いと判断されたらしい。`収集する項目 / 利用目的 / 共有の有無`をそれぞれ書きました。  
あとプライバシーポリシーにアプリの名前をちゃんと書くようにした。  

再提出～

## リジェクトされる 2回目

![Imgur](https://i.imgur.com/Mn3J415.png)

<p style="color:red;font-size:40px">？？？？？？？？</p>

え？`URL` 変えてないんですけど、1回目は見れたのに2回目は見れなくなっちゃったんですか？  
`GitHub`のリポジトリ内にある`Markdown`へのリンクをプライバシーポリシーの`URL`として使ってたんですけど、もしかして`GitHub`のリポジトリじゃだめなの？  
仕方ないので自分のドメインのこのサイトに書きました。それなら1回目でリンクが無効って言ってほしかった。。。

いや～でもいままで`リポジトリにある Markdown`へのパスをプライバシーポリシーに使ったんだけど、なんで今回だけダメだったんだろう。  
異議申し立てしても良かったかもだけど、早く配信したかったから飲むことにした。

## とおりました

![Imgur](https://i.imgur.com/8mVv36Y.png)

# これ書いてる時に気付いた
`フォアグラウンドサービス`で利用する場合、`AndroidManifest`で`<service>`の`foregroundServiceType`属性を`location`にすることで、アプリがフォアグラウンド（外アプリ利用中）でなくても位置情報が取得できるはずです。  

試してないけど、フォアグラウンドサービスなら通知が出るからユーザー気付くでしょ！バックグラウンド位置情報取得権限は要らないよ！的な事が書いてある→ https://developer.android.com/training/location/permissions#foreground

```xml
<service
    android:name=".BackgroundLocationService"
    android:enabled="true"
    android:exported="false"
    android:foregroundServiceType="location">
</service>
```

```kotlin
class BackgroundLocationService : Service() {

    override fun onCreate() {
        super.onCreate()

        val notification = // 通知を作る
        ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION) // location

    }
}
```

あれ？じゃあバックグラウンド位置情報取得の権限要らない？と思ったんですけど、**このアプリは 5G 回線チェッカーなので、`foregroundServiceType="location"`で良いのかが微妙で**、結局この方法も使えなさそう。

- https://developer.android.com/about/versions/14/changes/fgs-types-required#location
- https://developer.android.com/reference/android/R.attr#foregroundServiceType

`WorkManager`で動かしたいとかがあれば、やっぱりこの権限が必要かも？

# おわりに1
電波状態にアクセスするために、位置情報の権限が必要なんですけど、これは何故かというと、  
`CID`や`PCI`の値が、基地局？に対して一意の値（他と被らない、ユニークな値）らしい？？？から、おおよその位置が分かるかららしい。はえ～  

# おわりに2

`バックグラウンド 5G 通知機能`の修正のついでに。  
`WearOS`側に通知が行くようにしました。デフォルトだと通知はサイレントなので、デフォルトにしないといけないかもしれない。

![Imgur](https://i.imgur.com/knYSsYl.png)

ちなみに、フォアグラウンドサービス起動中通知が、別で出るようになってしまったのですが、これは通知チャンネルの設定から個別に消せるようにしてあります。  
実行中の方をオフにしても電波状態の通知は来るようになります。

![Imgur](https://i.imgur.com/aliGiWC.png)

ちなみに今までなんで来なかったかというと、フォアグラウンドサービスの起動には通知を出さないといけないのですが、この通知に電波状態を表示させてたからでした。  
この通知、サービスが動いている間は消せないんですよね。  
そして、消せない通知は`WearOS`側に転送されないんですよね。  

https://developer.android.com/training/wearables/notifications/bridger#non-bridged

なので、サービス起動中通知とは別に、電波状態の通知を出すようにしてみました。電波状態の方は消せるので、`WearOS`にも出るようになりました。