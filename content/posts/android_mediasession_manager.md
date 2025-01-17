---
title: Androidで好きな音楽アプリの操作とか楽曲情報取得とか
created_at: 2021-10-23
tags:
- Android
- Kotlin
- MediaSession
---
どうもこんばんわ。  
ソニーのイヤホンのアプリが楽曲情報を取得できていたので謎だなーって思って調査した。（ちなみにこれから書くこととは関係ない。多分別の仕組みで取得してる）

# 本題
Root権限とかなしで再生中の音楽アプリから楽曲情報取得とか音楽操作をします。  
多分いま存在している音楽アプリではMediaSessionを使っているはずなので、多分各自好きな音楽アプリで動くはずです。

## MediaSession #とは
音楽アプリがいま再生している曲の情報を外部に公開するのに使う。  
他にも他から音楽アプリへ次の曲行け！とか操作を受け付けるのにも使う。  

これのおかげで、

- Googleアシスタントで、今音楽アプリが再生している曲名を教えてくれたり
    - 次の曲にしてとかも対応してる
- ロック画面の背景にアルバムジャケットが表示されたり    
    - Android 11ぐらいで廃止になったけどね。
- Bluetoothイヤホンとの接続が切断された際に一時停止する

など。

![Imgur](https://i.imgur.com/8oYASKU.png)

↑ [そう言えばSMEEが新作出すっぽいですよ？](http://www.hook-net.jp/smee/smee13th/)。いやこれ以上手を出したらまじで詰んでるゲーム終わらなくなる。

ちなみに他のアプリが音を出すから、いま再生している音楽アプリは一時停止してねってやつは`AudioFocus`ってやつだと思う。MediaSessionの機能じゃなかったはず。

## 正規ルートで楽曲情報取得とかするには
`MediaSessionManager`を利用することで、現在アクティブ状態になっているMediaSessionのControllerを貰えます。  
これを使うと楽曲情報(`MediaMetadata`)や、操作(`TransportControls`)へアクセスできるようになります。

なんだけど、これシステム権限の`MEDIA_CONTENT_CONTROL`か、通知領域の監視権限のどちらかが必要です。  
Root無いので必然的に後者しか無いです。まぁそんな難しくないので大丈夫です。

## 通知領域の監視権限
`NotificationListenerService`ってやつを使うときに必要になる。  
DangerPermissionより上の、設定画面へ誘導してユーザーにONにしてもらう系の権限です。  

# 通知監視サービスを作る
適当に`NotificationListenerService`を継承したサービスを作ります。  
多分サービスのクラスがあればいいので特に継承して何か書くことは無いと思います。

```kotlin
class MediaSessionNotificationListenerService : NotificationListenerService() {

}
```

# AndroidManifest.xmlに書き足す
`<application>`の中に書き足します。

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="io.github.takusan23.getcurrentplayingmusic">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.GetCurrentPlayingMusic">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />

                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>


        <service
            android:name=".MediaSessionNotificationListenerService"
            android:exported="true"
            android:label="@string/app_name"
            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE">
            <intent-filter>
                <action android:name="android.service.notification.NotificationListenerService" />
            </intent-filter>
        </service>

    </application>

</manifest>
```

# アプリを実行する。
起動したら、閉じて設定画面へ進み、  

- Android 12
    - 通知 > デバイスとアプリの通知 
- Android 11
    - アプリと通知 > 特別なアプリアクセス > 通知へのアクセス
- Android 5
    - 音と通知 > 通知へのアクセス
- MIUI 12
    - プライバシー保護 > 特別な権限 > 通知へのアクセス

からこのアプリへ権限を付与してください。  
これで準備完了です！

# 現在再生している楽曲情報を取得

`activity_main.xml`に最初からあるTextViewに適当にIDを振っておいてください。

`MediaController#getMetadata`から取得できます。

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val textView = findViewById<TextView>(R.id.activity_main_text_view)

        // 現在アクティブ状態になっているMediaSessionのController取得
        val mediaSessionManager = getSystemService(Context.MEDIA_SESSION_SERVICE) as MediaSessionManager
        val componentName = ComponentName(this, MediaSessionNotificationListenerService::class.java)
        // 曲名をセット
        val currentPlayingMediaController = mediaSessionManager.getActiveSessions(componentName)[0]
        textView.text = currentPlayingMediaController.metadata?.getString(MediaMetadata.METADATA_KEY_TITLE) // タイトル取得
        
    }
}
```

# 一時停止操作など
`MediaController#getTransportControls`から一時停止操作や、再生とか出来ます。

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val textView = findViewById<TextView>(R.id.activity_main_text_view)

        // 現在アクティブ状態になっているMediaSessionのController取得
        val mediaSessionManager = getSystemService(Context.MEDIA_SESSION_SERVICE) as MediaSessionManager
        val componentName = ComponentName(this, MediaSessionNotificationListenerService::class.java)
        // 曲名をセット
        val currentPlayingMediaController = mediaSessionManager.getActiveSessions(componentName)[0]
        textView.text = currentPlayingMediaController.metadata?.getString(MediaMetadata.METADATA_KEY_TITLE)

        // 一時停止
        currentPlayingMediaController.transportControls.pause()
    }
}
```

# 終わりに
これを応用した、音楽アプリのウイジェットだけを追加するアプリを作りました。  

ソースコード：https://github.com/takusan23/MyMusicControlWidget

Playストア：https://play.google.com/store/apps/details?id=io.github.takusan23.mymusiccontrolwidget

APKダウンロード：https://github.com/takusan23/MyMusicControlWidget/releases