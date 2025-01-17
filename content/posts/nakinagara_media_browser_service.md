---
title: AndroidのMediaBrowserServiceを作る
created_at: 2020-08-30
tags:
- Android
- Kotlin
---

どうもこんばんは。  
8月に学校あるってクソ違和感だよな。日付のところに8月って書くと**あ、まだ8月なのか**って。不思議

# 本題
Android 11でメディアの再開ってのができたので、~~真面目に~~MediaSessionとMediaBrowserServiceを作る。  

# 環境
これを書かないと（記事書いた後に）仕様変更があるかもしれんしな。

| なまえ  | あたい                                                     |
|---------|------------------------------------------------------------|
| Android | 11 Beta 3                                                  |
| Kotlin  | 1.4 ←JSみたいに配列の最後に「,」入れても怒られなくなった！ |

# そもそも MediaSession て何？
**Always on Display** っていうずっっっと時計を表示できたりする機能があるんですけど、音楽を再生しているとそこに曲名が出るんですよね。  
他にも**Google Assistant**で音楽の操作ができたり。

これ、MediaSessionを利用してExoPlayer等のメディアプレイヤーの状態を公開してくれてるからなんですね。

よってMediaSessionはExoPlayerみたいに音楽を再生するものでは無いです。

# 今回の設計

- 音楽再生
    - ExoPlayer
- 音楽の情報
    - ハードコート（めんどいしややこしくなる）
- Activity
    - 曲の操作は申し訳ないがActivityではやらずに、通知でのみ行うように。今回はMediaBrowserServiceがやりたいので

# Android 11 の メディアの再開 #とは

https://developer.android.com/preview/features/media-controls?hl=ja

https://android-developers.googleblog.com/2020/08/playing-nicely-with-media-controls.html

詳しくはここらへん読んで。  
まあ何ができるようになるかって言うと、**デバイス再起動後に最後に聞いていた曲を再生できる**って機能だと思います。  

![Imgur](https://i.imgur.com/IpX69hG.png)

このMediaSession通知が表示されるまでに、  
- `onGetRoot`が呼ばれる（実装で詳しく）
- `onLoadChildren`が呼ばれる（実装で詳しく）
    - 最後の曲をここで返す（非同期おｋ）

再生ボタンだけが表示されてる。これを押すと、
- `MediaSessionCompat.setCallBack`の`onPrepare()`が呼ばれる
- `MediaSessionCompat.setCallBack`の`onPlay()`が呼ばれる
    - ここらへんで通知を更新する？

## 実装わからん
https://github.com/android/uamp  
読めば分かるって書いてあるけど、**MediaSessionのコールバック関係を別ライブラリ（exoplayer:extension-mediasession）** に任せてるので~~あんま参考に~~  

それでも共通部分はまあまあわかった気がした。

# 今回の記事はコピペでは動かないと思います。
中級者向けの記事になりますね。

# 作り方

# build.gradle

```gradle
// ExoPlayer
implementation 'com.google.android.exoplayer:exoplayer-core:2.11.3'
implementation 'com.google.android.exoplayer:exoplayer-hls:2.11.3'
implementation 'com.google.android.exoplayer:extension-mediasession:2.10.4'
// Preference
implementation "androidx.preference:preference:1.1.1"
```

まず`AndroidManifest.xml`に書き足す内容です

```xml
<service
        android:name=".Service.BackgroundPlaylistCachePlayService"
        android:enabled="true"
        android:exported="true"
        android:label="@string/cache_background_play">
    <intent-filter>
        <action android:name="android.media.browse.MediaBrowserService" />
    </intent-filter>
</service>
<!-- これ書かないと通知から操作一生こない -->
<receiver android:name="androidx.media.session.MediaButtonReceiver">
    <intent-filter>
        <action android:name="android.intent.action.MEDIA_BUTTON" />
    </intent-filter>
</receiver>
```

`android:name`、`android:label`は各自書き換えてください。

それと別に、フォアグラウンドサービスを利用するので、上に権限を書いてください。

```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

# BackgroundPlaylistCachePlayService.kt
を作成して、（クラス名は別になんでもいい）`MediaBrowserServiceCompat`を継承してね。

```kotlin
class BackgroundPlaylistCachePlayService : MediaBrowserServiceCompat() {


    override fun onGetRoot(clientPackageName: String, clientUid: Int, rootHints: Bundle?): BrowserRoot? {

    }

    override fun onLoadChildren(parentId: String, result: Result<MutableList<MediaBrowserCompat.MediaItem>>) {

    }

}
```

あれ？`onCreate`とか書かないのって話ですが**ちょっとまって。時期が悪い**

## onGetRoot
これは`MediaBrowserService`に接続しようとした時に呼ばれます。  
**Android 11 のメディアの再開かどうか**はここで判断する必要があるのですね。

### Android 11 の メディアの再開 かどうか判断する
`rootHints?.getBoolean(BrowserRoot.EXTRA_RECENT)`が`true`なら**システムが最後の曲をリクエストしている**ことになります。

```kotlin
/** [onLoadChildren]でparentIdに入ってくる。Android 11のメディアの再開の場合はこの値 */
private val ROOT_RECENT = "root_recent"
/** [onLoadChildren]でparentIdに入ってくる。[ROOT_RECENT]以外の場合 */
private val ROOT = "root"
/**
 * [MediaBrowserServiceCompat]へ接続しようとした時に呼ばれる
 * Android 11 のメディアの再開では重要になっている
 * */
override fun onGetRoot(clientPackageName: String, clientUid: Int, rootHints: Bundle?): BrowserRoot? {
    // 最後の曲をリクエストしている場合はtrue
    val isRequestRecentMusic = rootHints?.getBoolean(BrowserRoot.EXTRA_RECENT) ?: false
    // BrowserRootに入れる値を変える
    val rootPath = if (isRequestRecentMusic) ROOT_RECENT else ROOT
    return BrowserRoot(rootPath, null)
}
```

これで、この後にある`onLoadChildren`で**メディアの再開**かどうか分かるようになりました。

**あ、ここでは曲一覧を読み込むとかの重い処理はしないでね。曲一覧はこの後の`onLoadChildren`でやってください。**

## onLoadChildren
ここでは、Activityや他デバイス（Wear OSとか車とか？）に返す曲を読み込みます。  
**Android 11 の メディアの再開**に対応するにはここで最後に聞いていた曲を返す必要があります。  
だから`onGetRoot`が必要だったのですね。

```kotlin
/**
 * Activityとかのクライアントへ曲一覧を返す
 * */
override fun onLoadChildren(parentId: String, result: Result<MutableList<MediaBrowserCompat.MediaItem>>) {
    // 保険。遅くなると怒られるぽい？
    result.detach()
    if (parentId == ROOT_RECENT) {
        // 動画情報いれる
        result.sendResult(arrayListOf(createMediaItem("sm157","てすとです","さぶたいとる")))
    }
}
/**
 * [onLoadChildren]で返すアイテムを作成する
 * */
private fun createMediaItem(videoId: String, title: String, subTitle: String): MediaBrowserCompat.MediaItem {
    val mediaDescriptionCompat = MediaDescriptionCompat.Builder().apply {
        setTitle(title)
        setSubtitle(subTitle)
        setMediaId(videoId)
    }.build()
    return MediaBrowserCompat.MediaItem(mediaDescriptionCompat, MediaBrowserCompat.MediaItem.FLAG_PLAYABLE)
}
```

ここで`SharedPreferenceに最後の曲のIDを保存しておく`とか書いてありますが、最後の曲の情報（タイトルとか）が取れればここは自由に作ってください。  
今回はめんどいのでハードコートしました。

## onCreate
さて、ようやくですね。  
ここでは`MediaSession`、`ExoPlayer`の初期化を行います。　　

```kotlin
/** 音楽再生のExoPlayer */
lateinit var exoPlayer: SimpleExoPlayer
/** MediaSession */
lateinit var mediaSessionCompat: MediaSessionCompat
/** 通知出すのに使う */
lateinit var notificationManager: NotificationManager
/** MediaSession初期化など */
override fun onCreate() {
    super.onCreate()
    // 通知出すのに使う
    notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    // ExoPlayer用意
    exoPlayer = SimpleExoPlayer.Builder(this).build()
    // MediaSession用意
    mediaSessionCompat = MediaSessionCompat(this, "media_session").apply {
        // MediaButtons と TransportControls の操作を受け付ける
        setFlags(MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS or MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS)
        // MediaSessionの操作のコールバック
        setCallback(object : MediaSessionCompat.Callback() {
            /** 再生準備 */
            override fun onPrepare() {
                super.onPrepare()
                val dataSourceFactory = DefaultDataSourceFactory(this@BackgroundPlaylistCachePlayService, "TatimiDroid;@takusan_23")
                val mediaSource = ProgressiveMediaSource.Factory(dataSourceFactory)
                    .createMediaSource("各自ファイルパスを入れてね".toUri()) // 動画の場所
                exoPlayer.prepare(mediaSource)
            }
            /** 再生 */
            override fun onPlay() {
                super.onPlay()
                exoPlayer.playWhenReady = true
                isActive = true
            }
            /** 一時停止 */
            override fun onPause() {
                super.onPause()
                exoPlayer.playWhenReady = false
            }
            /** 通知のシーク動かした時 */
            override fun onSeekTo(pos: Long) {
                super.onSeekTo(pos)
                exoPlayer.seekTo(pos)
            }
            /** 止めた時 */
            override fun onStop() {
                super.onStop()
                isActive = false
                stopSelf()
            }
        })
        // 忘れずに
        setSessionToken(sessionToken)
    }
    // ExoPlayerの再生状態が更新されたときも通知を更新する
    exoPlayer.addListener(object : Player.EventListener {
        override fun onPlayerStateChanged(playWhenReady: Boolean, playbackState: Int) {
            super.onPlayerStateChanged(playWhenReady, playbackState)
        }
    })
}
```

動画のファイルパスは各自書き換えてください。  

### これ何してるの？
`MediaSession`経由で`再生・一時停止`した際にExoPlayerでは何をすれば良いのかって言うのを書いてます。  

## MediaSessionのCallbackのonPlayでサービスを起動する
これしないと、**Android 11のメディアの再開**までできたのに、いざ再生しようとすると数秒で止まるようになります。  
~~これで一日ぐらい無駄にした~~

というかマジで`onPlay`でサービス起動するの？って話ですが、**書 い て あ り ま し た 。**

https://developer.android.com/guide/topics/media-apps/audio-app/building-a-mediabrowserservice#service-lifecycle

<p style="border: 1px solid;padding:10px">
The media session onPlay() callback should include code that calls startService(). This ensures that the service starts and continues to run, even when all UI MediaBrowser activities that are bound to it unbind.
</p>

<p style="color:red">最初から読んでればよかったですねえ！</p>

というわけで`onPlay`に（多分フォアグラウンド）サービスを起動するコードを書きましょう

```kotlin
/** 再生 */
override fun onPlay() {
    super.onPlay()
    startThisService()
    exoPlayer.playWhenReady = true
    isActive = true
}
```

`startThisService()`関数は以下
```kotlin
/** フォアグラウンドサービスを起動する */
private fun startThisService() {
    val playlistPlayServiceIntent = Intent(this, BackgroundPlaylistCachePlayService::class.java)
    // 起動
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        startForegroundService(playlistPlayServiceIntent)
    } else {
        startService(playlistPlayServiceIntent)
    }
}
```

# 音楽の情報と再生状態を更新する
ここで用意した情報が、AODやGoogleAssistantで使われるんですね。  

もし音楽の時間が取れる場合は、一緒に入れておくとAndroid 10以降で通知シークができます。  
今回はめんどいのでハードコートします

```kotlin
/**
 * 再生状態とメタデータを設定する。今回はメタデータはハードコートする
 *
 * MediaSessionのsetCallBackで扱う操作([MediaSessionCompat.Callback.onPlay]など)も[PlaybackStateCompat.Builder.setState]に書かないと何も起きない
 * */
private fun updateState() {
    val stateBuilder = PlaybackStateCompat.Builder().apply {
        // 取り扱う操作。とりあえず 再生準備 再生 一時停止 シーク を扱うようにする。書き忘れると何も起きない
        setActions(PlaybackStateCompat.ACTION_PREPARE or PlaybackStateCompat.ACTION_PLAY or PlaybackStateCompat.ACTION_PAUSE or PlaybackStateCompat.ACTION_STOP or PlaybackStateCompat.ACTION_SEEK_TO or PlaybackStateCompat.ACTION_STOP)
        // 再生してるか。ExoPlayerを参照
        val state = if (exoPlayer.isPlaying) PlaybackStateCompat.STATE_PLAYING else PlaybackStateCompat.STATE_PAUSED
        // 位置
        val position = exoPlayer.currentPosition
        // 再生状態を更新
        setState(state, position, 1.0f) // 最後は再生速度
    }.build()
    mediaSessionCompat.setPlaybackState(stateBuilder)
    // メタデータの設定
    val duration = 288L // 再生時間
    val mediaMetadataCompat = MediaMetadataCompat.Builder().apply {
        // Android 11 の MediaSession で使われるやつ
        putString(MediaMetadataCompat.METADATA_KEY_TITLE, "音楽のタイトル")
        putString(MediaMetadataCompat.METADATA_KEY_ARTIST, "音楽のアーティスト")
        putLong(MediaMetadataCompat.METADATA_KEY_DURATION, duration * 1000) // これあるとAndroid 10でシーク使えます
    }.build()
    mediaSessionCompat.setMetadata(mediaMetadataCompat)
}
```

これを、ExoPlayerの`onPlayerStateChanged`に書いておきましょう。再生状態が変わったら勝手に関数を呼んで更新されるようになります。

```kotlin
// ExoPlayerの再生状態が更新されたときも通知を更新する
exoPlayer.addListener(object : Player.EventListener {
    override fun onPlayerStateChanged(playWhenReady: Boolean, playbackState: Int) {
        super.onPlayerStateChanged(playWhenReady, playbackState)
        updateState()
    }
})
```

## はい注意事項
`setActions()`に入れた内容のみが扱えます。  
この中に書いてない操作は、MediaSessionの`setCallback`に書いても一生呼ばれません。悲しいね

# ForegroundServiceを維持するために通知を出す
サービス起動から5秒経過する前に、通知を出しましょう。  
これでメモリが足りないときも動かすことができます（？）

```kotlin
/** 通知を表示する */
private fun showNotification() {
    // 通知を作成。通知チャンネルのせいで長い
    val notification = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        // 通知チャンネル
        val channelId = "playlist_play"
        val notificationChannel = NotificationChannel(channelId, "音楽コントローラー", NotificationManager.IMPORTANCE_LOW)
        if (notificationManager.getNotificationChannel(channelId) == null) {
            // 登録
            notificationManager.createNotificationChannel(notificationChannel)
        }
        NotificationCompat.Builder(this, channelId)
    } else {
        NotificationCompat.Builder(this)
    }
    notification.apply {
        setStyle(androidx.media.app.NotificationCompat.MediaStyle().setMediaSession(mediaSessionCompat.sessionToken).setShowActionsInCompactView(0))
        setSmallIcon(R.drawable.ic_background_icon)
        // 通知領域に置くボタン
        if (exoPlayer.isPlaying) {
            addAction(NotificationCompat.Action(R.drawable.ic_pause_black_24dp, "一時停止", MediaButtonReceiver.buildMediaButtonPendingIntent(this@BackgroundPlaylistCachePlayService, PlaybackStateCompat.ACTION_PAUSE)))
        } else {
            addAction(NotificationCompat.Action(R.drawable.ic_play_arrow_24px, "再生", MediaButtonReceiver.buildMediaButtonPendingIntent(this@BackgroundPlaylistCachePlayService, PlaybackStateCompat.ACTION_PLAY)))
        }
        addAction(NotificationCompat.Action(R.drawable.ic_clear_black, "停止", MediaButtonReceiver.buildMediaButtonPendingIntent(this@BackgroundPlaylistCachePlayService, PlaybackStateCompat.ACTION_STOP)))
    }
    // 通知表示
    startForeground(84, notification.build())
}
```

あ、アイコンは各自用意してください。  
`ResourceManager → + `から好きなアイコンを選んできてください。

これも、ExoPlayerの`onPlayerStateChanged`に書いておきましょう

```kotlin
// ExoPlayerの再生状態が更新されたときも通知を更新する
exoPlayer.addListener(object : Player.EventListener {
    override fun onPlayerStateChanged(playWhenReady: Boolean, playbackState: Int) {
        super.onPlayerStateChanged(playWhenReady, playbackState)
        updateState()
        showNotification()
    }
})
```

これで生きていけます。  
あとなんかしらんけど、通知のテキストとか入れてないんだけどこれ`MediaStyle`だと勝手に曲の名前とか入れてくれるのかな。

### はい注意事項
setSmallIconが無くても **通知は出せますが、MediaStyleな通知を出すためには、アイコンの指定が必要です。**  
アイコンはちゃんと指定しよう。

# あとしまつ
```kotlin
override fun onDestroy() {
    super.onDestroy()
    mediaSessionCompat.release()
    exoPlayer.release()
}
```

# Fragment(Activity)から操作できるように

~~startForegroundService()で起動したほうが早くね~~

まず使う関数たちです

```kotlin
private fun initCachePlaylistPlay() {
    bottom_fragment_nicovideo_list_menu_playlist_background.setOnClickListener {
        // ボタン押した時
        mediaControllerCompat.transportControls.play()
    }
}
/** [BackgroundPlaylistCachePlayService]と接続する関数 */
private fun initMediaBrowserConnect() {
    // MediaBrowser
    mediaBrowserCompat = MediaBrowserCompat(requireContext(), ComponentName(requireContext(), BackgroundPlaylistCachePlayService::class.java), object : MediaBrowserCompat.ConnectionCallback() {
        override fun onConnected() {
            super.onConnected()
            mediaControllerCompat = MediaControllerCompat(requireContext(), mediaBrowserCompat.sessionToken)
            // とりあえずprepareを呼ぶ
            mediaControllerCompat.transportControls.prepare()
        }
    }, null)
    // 接続
    mediaBrowserCompat.connect()
}

override fun onDestroy() {
    super.onDestroy()
    mediaBrowserCompat.disconnect()
}
```

それから`onViewCreated`でこんな感じに

```kotlin
override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)
    // MediaBrowserと接続
    initMediaBrowserConnect()
    
    // キャッシュ用連続再生
    initCachePlaylistPlay()
}
```

Activityでも同じようにできると思います。

## 何してるの？
わからん。  
`今回作ったMediaBrowserService`を操作する`MediaControllerCompat`を用意するために、なんかやってる。

とりあえず再生できるように操作できるようになったら`prepare()`を呼んでる。

`bottom_fragment_nicovideo_list_menu_playlist_background`は私の環境にしか無いので、各自ActivityかFragmentにボタンを置いて、`setOnClickListener{ }`の中に`mediaControllerCompat.transportControls.play()`を書けばいいです。

ところで`requireContext()`っていつの間にできたの？

# `mediaControllerCompat.transportControls.play()`の結果
![Imgur](https://i.imgur.com/9BWwp5X.png)

いかがでしょうか！！こんな感じになりましたか！？！？

### play()の時に値を渡したい
`playFromMediaId()`あたりを使えばできそう。  
使う際は、
- `setCallBack()`に`override fun onPlayFromUri`を追加
- `updateState()`関数にある、`setActions()`の中に`PlaybackStateCompat.ACTION_PLAY_FROM_MEDIA_ID`追加

しないとダメだと思います。

# 果たして再起動後も音楽の再開ができるのか
できました。onLoadChildrenで返してる内容が表示されてますね。

![Imgur](https://i.imgur.com/blfcxsI.png)

# 全コード
```kotlin
class BackgroundPlaylistCachePlayService : MediaBrowserServiceCompat() {

    /** [onLoadChildren]でparentIdに入ってくる。Android 11のメディアの再開の場合はこの値 */
    private val ROOT_RECENT = "root_recent"

    /** [onLoadChildren]でparentIdに入ってくる。[ROOT_RECENT]以外の場合 */
    private val ROOT = "root"

    /** 音楽再生のExoPlayer */
    lateinit var exoPlayer: SimpleExoPlayer

    /** MediaSession */
    lateinit var mediaSessionCompat: MediaSessionCompat

    /** 通知出すのに使う */
    lateinit var notificationManager: NotificationManager

    /** MediaSession初期化など */
    override fun onCreate() {
        super.onCreate()

        // 通知出すのに使う
        notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // ExoPlayer用意
        exoPlayer = SimpleExoPlayer.Builder(this).build()

        // MediaSession用意
        mediaSessionCompat = MediaSessionCompat(this, "media_session").apply {

            // MediaButtons と TransportControls の操作を受け付ける
            setFlags(MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS or MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS)

            // MediaSessionの操作のコールバック
            setCallback(object : MediaSessionCompat.Callback() {

                /** 再生準備 */
                override fun onPrepare() {
                    super.onPrepare()
                    val dataSourceFactory = DefaultDataSourceFactory(this@BackgroundPlaylistCachePlayService, "TatimiDroid;@takusan_23")
                    val mediaSource = ProgressiveMediaSource.Factory(dataSourceFactory)
                        .createMediaSource("各自いれて".toUri()) // 動画の場所
                    exoPlayer.prepare(mediaSource)
                }

                /** 再生 */
                override fun onPlay() {
                    super.onPlay()
                    startThisService()
                    exoPlayer.playWhenReady = true
                }

                /** 一時停止 */
                override fun onPause() {
                    super.onPause()
                    exoPlayer.playWhenReady = false
                }

                /** 通知のシーク動かした時 */
                override fun onSeekTo(pos: Long) {
                    super.onSeekTo(pos)
                    exoPlayer.seekTo(pos)
                }

                /** 止めた時 */
                override fun onStop() {
                    super.onStop()
                    isActive = false
                    stopSelf()
                }

            })

            // 忘れずに
            setSessionToken(sessionToken)
        }

        // ExoPlayerの再生状態が更新されたときも通知を更新する
        exoPlayer.addListener(object : Player.EventListener {
            override fun onPlayerStateChanged(playWhenReady: Boolean, playbackState: Int) {
                super.onPlayerStateChanged(playWhenReady, playbackState)
                updateState()
                showNotification()
            }
        })
    }

    /**
     * 再生状態とメタデータを設定する。今回はメタデータはハードコートする
     *
     * MediaSessionのsetCallBackで扱う操作([MediaSessionCompat.Callback.onPlay]など)も[PlaybackStateCompat.Builder.setState]に書かないと何も起きない
     * */
    private fun updateState() {
        val stateBuilder = PlaybackStateCompat.Builder().apply {
            // 取り扱う操作。とりあえず 再生準備 再生 一時停止 シーク を扱うようにする。書き忘れると何も起きない
            setActions(PlaybackStateCompat.ACTION_PREPARE or PlaybackStateCompat.ACTION_PLAY or PlaybackStateCompat.ACTION_PAUSE or PlaybackStateCompat.ACTION_STOP or PlaybackStateCompat.ACTION_SEEK_TO or PlaybackStateCompat.ACTION_STOP)
            // 再生してるか。ExoPlayerを参照
            val state = if (exoPlayer.isPlaying) PlaybackStateCompat.STATE_PLAYING else PlaybackStateCompat.STATE_PAUSED
            // 位置
            val position = exoPlayer.currentPosition
            // 再生状態を更新
            setState(state, position, 1.0f) // 最後は再生速度
        }.build()
        mediaSessionCompat.setPlaybackState(stateBuilder)
        // メタデータの設定
        val duration = 288L // 再生時間
        val mediaMetadataCompat = MediaMetadataCompat.Builder().apply {
            // Android 11 の MediaSession で使われるやつ
            putString(MediaMetadataCompat.METADATA_KEY_TITLE, "音楽のタイトル")
            putString(MediaMetadataCompat.METADATA_KEY_ARTIST, "音楽のアーティスト")
            putLong(MediaMetadataCompat.METADATA_KEY_DURATION, duration * 1000) // これあるとAndroid 10でシーク使えます
        }.build()
        mediaSessionCompat.setMetadata(mediaMetadataCompat)
    }

    /** 通知を表示する */
    private fun showNotification() {
        // 通知を作成。通知チャンネルのせいで長い
        val notification = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // 通知チャンネル
            val channelId = "playlist_play"
            val notificationChannel = NotificationChannel(channelId, getString(R.string.background_playlist_play_channel), NotificationManager.IMPORTANCE_LOW)
            if (notificationManager.getNotificationChannel(channelId) == null) {
                // 登録
                notificationManager.createNotificationChannel(notificationChannel)
            }
            NotificationCompat.Builder(this, channelId)
        } else {
            NotificationCompat.Builder(this)
        }
        notification.apply {
            setStyle(androidx.media.app.NotificationCompat.MediaStyle().setMediaSession(mediaSessionCompat.sessionToken).setShowActionsInCompactView(0))
            setSmallIcon(R.drawable.ic_background_icon)
            // 通知領域に置くボタン
            if (exoPlayer.isPlaying) {
                addAction(NotificationCompat.Action(R.drawable.ic_pause_black_24dp, "一時停止", MediaButtonReceiver.buildMediaButtonPendingIntent(this@BackgroundPlaylistCachePlayService, PlaybackStateCompat.ACTION_PAUSE)))
            } else {
                addAction(NotificationCompat.Action(R.drawable.ic_play_arrow_24px, "再生", MediaButtonReceiver.buildMediaButtonPendingIntent(this@BackgroundPlaylistCachePlayService, PlaybackStateCompat.ACTION_PLAY)))
            }
            addAction(NotificationCompat.Action(R.drawable.ic_clear_black, "停止", MediaButtonReceiver.buildMediaButtonPendingIntent(this@BackgroundPlaylistCachePlayService, PlaybackStateCompat.ACTION_STOP)))
        }
        // 通知表示
        startForeground(84, notification.build())
    }

    /** フォアグラウンドサービスを起動する */
    private fun startThisService() {
        val playlistPlayServiceIntent = Intent(this, BackgroundPlaylistCachePlayService::class.java)
        // 起動
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(playlistPlayServiceIntent)
        } else {
            startService(playlistPlayServiceIntent)
        }
    }

    /**
     * [MediaBrowserServiceCompat]へ接続しようとした時に呼ばれる
     * Android 11 のメディアの再開では重要になっている
     * */
    override fun onGetRoot(clientPackageName: String, clientUid: Int, rootHints: Bundle?): BrowserRoot? {
        // 最後の曲をリクエストしている場合はtrue
        val isRequestRecentMusic = rootHints?.getBoolean(BrowserRoot.EXTRA_RECENT) ?: false
        // BrowserRootに入れる値を変える
        val rootPath = if (isRequestRecentMusic) ROOT_RECENT else ROOT
        return BrowserRoot(rootPath, null)
    }

    /**
     * Activityとかのクライアントへ曲一覧を返す
     * */
    override fun onLoadChildren(parentId: String, result: Result<MutableList<MediaBrowserCompat.MediaItem>>) {
        // 保険。遅くなると怒られるぽい？
        result.detach()
        if (parentId == ROOT_RECENT) {
            // 動画情報いれる
            result.sendResult(arrayListOf(createMediaItem("sm157", "てすとです", "さぶたいとる")))
        }
    }

    /**
     * [onLoadChildren]で返すアイテムを作成する
     * */
    private fun createMediaItem(videoId: String, title: String, subTitle: String): MediaBrowserCompat.MediaItem {
        val mediaDescriptionCompat = MediaDescriptionCompat.Builder().apply {
            setTitle(title)
            setSubtitle(subTitle)
            setMediaId(videoId)
        }.build()
        return MediaBrowserCompat.MediaItem(mediaDescriptionCompat, MediaBrowserCompat.MediaItem.FLAG_PLAYABLE)
    }

    override fun onDestroy() {
        super.onDestroy()
        mediaSessionCompat.release()
        exoPlayer.release()
    }

}
```

# おわりに
MediaSession、よくわからん。  
**なんかしらんけど `setMetadata()` で複雑なことすると通知が二重ででる。**  
いや私の設計が悪いのかもしれない。(ExoPlayerにTagがなければ表示しないとかいう仕様だから、Tagが無いときは適当な情報を入れておくことで(今ん所)解決)  

うーん。わからん！  
MediaStyle通知が二重で表示される場合はとりあえず仮でメタデータを作っておいて、その後に本番を入れてあげるとうまくいくかもしれない。

~~まあ動いてよかったわ（よくない）~~

```kotlin
val stateBuilder = PlaybackStateCompat.Builder().apply {
    // 取り扱う操作。とりあえず 再生準備 再生 一時停止 シーク を扱うようにする。書き忘れると何も起きない
    setActions(PlaybackStateCompat.ACTION_PREPARE or PlaybackStateCompat.ACTION_PLAY or PlaybackStateCompat.ACTION_PAUSE or PlaybackStateCompat.ACTION_STOP or PlaybackStateCompat.ACTION_SEEK_TO or PlaybackStateCompat.ACTION_STOP)
    // 再生してるか。ExoPlayerを参照
    val state = if (exoPlayer.isPlaying) PlaybackStateCompat.STATE_PLAYING else PlaybackStateCompat.STATE_PAUSED
    // 位置
    val position = exoPlayer.currentPosition
    // 再生状態を更新
    setState(state, position, 1.0f) // 最後は再生速度
}.build()
mediaSessionCompat.setPlaybackState(stateBuilder)
// なんかここらへんがおかしいと通知が二重で発行される。のでとりあえず仮のメタデータを送って
val mediaMetadataCompat = MediaMetadataCompat.Builder().apply {
    // Android 11 の MediaSession で使われるやつ
    putString(MediaMetadataCompat.METADATA_KEY_TITLE, "タイトル")
    putString(MediaMetadataCompat.METADATA_KEY_ARTIST, "アーティスト")
    putLong(MediaMetadataCompat.METADATA_KEY_DURATION, 0 * 1000) // これあるとAndroid 10でシーク使えます
}.build()
mediaSessionCompat.setMetadata(mediaMetadataCompat)
// 取れそうなら本番のメタデータを送る。なぜか上の setMetadata を省略すると動かない。
if (exoPlayer.currentTag is String) {
    mediaSessionCompat.setMetadata(createMetaData(exoPlayer.currentTag as String))
}
```


あと再起動から起動→再生ボタン押す→なぜかこれ以降押せなくなる  
バグなの・・・？でもUAMPのサンプルだとそんなこと無いし？わからん。  
Betaのせい？（人のせいにするな）

初音ミクさん誕生日おめでとうございます。


### そういえば
```koltin
implementation "androidx.media:media:1.1.0"
```

これ入れると`setFlags`が省略できる？

# 参考にしました
https://dev.classmethod.jp/articles/how-to-android-media-player/

https://qiita.com/siy1121/items/f01167186a6677c22435

https://android-developers.googleblog.com/2020/08/playing-nicely-with-media-controls.html

https://developer.android.com/guide/topics/media-apps/audio-app/building-a-mediabrowserservice

https://developer.android.com/preview/features/media-controls