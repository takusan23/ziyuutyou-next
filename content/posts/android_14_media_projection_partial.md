---
title: Hello Android 14。部分的な画面共有と MediaProjection 再入門
created_at: 2024-01-28
tags:
- Android
- Android14
- Kotlin
- OpenGL
- MediaRecorder
- MediaProjection
---
どうもこんばんわ。  
彼方の人魚姫 攻略しました。

久しぶりのシナリオゲー？かもしれない、OP 曲がいい！  
共通が長いせいか、個別の最後の方は駆け足になってた気がするけど、引きずるよりかはいいのかも・・・？

![Imgur](https://imgur.com/lTYI7fj.png)

かわい～

![Imgur](https://imgur.com/ySVpYjp.png)

制服ちがうのってなんでだろう（言及してたのかもしれないけど私が見落としてただけ・・？）  

![Imgur](https://imgur.com/be2TOOj.png)

すごいどうでもいいけど、プログラミング何も分からんときに`multipart/form-data`でバイナリデータ（写真）を送れたときの感動にを思い出したこれ ↑

私は日輪ちゃんルートが一番かな  
↓ この後にあるイベントCGがいい！

![Imgur](https://imgur.com/R2Iuypz.png)

![Imgur](https://imgur.com/QVQxVrr.png)

この子のルートの結末が読者次第というパターンのやつだった、ぐぬぬ、どっちなんだろう

![Imgur](https://imgur.com/2Y5OpBW.png)

おすすめ、~~えちえちシーンもよかった~~

# 本題
このブログでは`Hello Android xx`シリーズを新しいバージョンが出るたびに何回か書いてましたが、`14`だけ書いてない！  
なんか`Android 14`、新機能よりは仕様変更のがメインな気がする。  

特に`Android 14`のフォアグラウンドサービスの`Foreground service types are required`って何がしたいのかいまいち分からない。  
フォアグラウンドサービスで行う作業を予め`AndroidManifest`に書けって言ってるんだけど、定義されてるユースケースが少なくて`specialUse`（その他の用途）になりそうなふいんき（なぜか変換できない）

そんな中、`Google I/O`で発表されてて気になってた機能が`Android 14`の正式版リリースから**数ヶ月たった今**、ようやくベータ版（`Android 14 QBR 2`）で試せるようになったので使ってみます。  

正式版でも試せなくて白紙になったのかと思ったら`14`正式版には間に合わなかっただけっぽい。  
~~だから`AOSP`にもまだ入ってない？どうなんだろう、既に`Android 14`を受け取った端末でもセキュリティアップデートと一緒に降ってくるとかなんですかね？~~  

`Android 15`の機能として紹介された。`14 QPR2`で試験的に入って`15`でリリースなんですかね？`15`を待とう・・！  
https://android-developers.googleblog.com/2024/02/first-developer-preview-android15.html

`Pixel`端末は`2024年3月`の`Feature Drop`で対応したそう。もうわけがわからないよ

## 部分的な画面共有機能
- ドキュメント
    - https://developer.android.com/about/versions/14/features/partial-screen-sharing
- Google I/O
    - https://youtu.be/qXhjN66O7Bk?si=LsXPmE8B2vL2z0Ls&t=201

![Imgur](https://imgur.com/6ctjVe4.png)

![Imgur](https://imgur.com/DUlRd1q.png)

画面共有をする際に、今までどおりの**画面全体**の画面共有に加えて、**指定したアプリの画面**だけの画面共有に対応しました。  
画面分割中に、かたっぽのアプリだけ画面共有ができるようになりました。また画面分割をしないときも便利で、これだと**通知やステータスバーが写り込まない**んですよね  

画面共有中に突然、`heads up notification`（ステータスバーから飛び出してくるあの通知）が来たとしても画面共有にはアプリの画面だけしか映らず、通知は写り込まないので安心して使えるようになります！  

ちなみに試した限り、単一アプリの場合でも音声は端末全体になるっぽい？  

試したい場合は`クイック設定パネル`の画面録画を使うと試せそう。対応済みらしく、単一アプリの画面録画ができます。

### 部分的な画面共有 API
https://developer.android.com/reference/kotlin/android/media/projection/MediaProjection.Callback  
コールバックがあるので、単一アプリの画面共有の状態変化を知ることが出来ます。

- MediaProjection.Callback#onCapturedContentResize
    - 単一アプリの画面サイズが変化したときに呼ばれます。
    - 画面分割とかで、`1:1`以外に`1:2`みたいな比率にも出来るので、そのときに呼ばれるんじゃないかな。
- MediaProjection.Callback#oncapturedcontentvisibilitychanged
    - 単一アプリが画面外に移動したときに呼ばれます。
    - 例えば単一アプリ以外の別のアプリが画面に表示されている場合、単一アプリはユーザーから見えない状態になるので、このコールバックが呼ばれます。

### 部分的な画面共有に対応する
画面を録画するだけのアプリなら、~~多分何も対応が要らない・・？~~  
→いや嘘、`MediaProjection#registerCallback`でコールバックを追加する必要がある。が、コールバックを追加するだけで良いらしいのでほぼ対応無しだと思う。  
（ちなみにメインスレッドで呼び出す必要が多分ある。）

`MediaProjectionManager#createScreenCaptureIntent`で`Intent`が貰えるので、それを`rememberLauncherForActivityResult`に入れれば良いはず。  
ですが、別にこの`createScreenCaptureIntent`はこれまで通り`MediaProjection`を開始するときに使うやつなので、コードの変更はなしで対応できるんじゃないかな。

ちなみに、ユーザーに**全画面の画面共有のみ利用できる**ようにする方法もあります。`MediaProjectionConfig.createConfigForDefaultDisplay`を渡せばいいです。  
（つまり、部分的な画面共有を利用できなくさせる）

```kotlin
val mediaProjectionResult = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.StartActivityForResult(),
    onResult = { result ->
        // TODO
    }

// createConfigForDefaultDisplay を指定すると、全画面の画面共有のみ利用できる（部分的な画面共有は利用できない）
mediaProjectionResult.launch(mediaProjectionManager.createScreenCaptureIntent(MediaProjectionConfig.createConfigForDefaultDisplay()))
```

![Imgur](https://imgur.com/pzOMg5G.png)

#### 対応したほうがいい場合
この記事の後半に書きますが、画面を録画してその映像を生配信したい場合は、別途対応が必要かもしれません。  
**というのも、単一アプリで指定したアプリが画面に写っていない場合、映像データがエンコーダーから出てきません。そしてその修正は簡単には直せなさそうです。**

単一アプリの画面が写ってない場合、最後の映像フレームがエンコーダーから出てくるわけでもなく、かといって黒い画面がエンコーダーから出てくるわけでもなく、  
エンコーダーからは何も出てきません！

生配信とかだととにかく映像を送り続けたいと思うので、単一アプリが画面に映っていない時の対応が必要かもしれません。  
これも対応できるので、詳しくは後半までスクロールしてね。

あ、あと、指定したアプリが画面に写っていない場合に代わりに画像を出すとかも難しそうです。  
これも対応します。

# Android の画面共有機能を支える技術
`Android 5`からある機能なので、そこそこ情報はあるんじゃないですかね、、

大昔に書いた記事が出てきた。はずい  
https://takusan23.github.io/Bibouroku/2020/04/06/MediaProjection/

## MediaProjection
画面の映像を`MediaRecorder`や`MediaCodec`、`OpenGL`に流したり出来るやつ、  
端末内部の音声を収録するのにも使われる（`AudioRecord`で`PCM`のバイト配列が入手できます）。

おそらく、`Activity`等では動かせず、`Service`じゃないと動かないはず。

## MediaRecorder
画面の映像を受け取って、動画ファイルにしてくれるやつ。  
ただ画面録画をするだけなら`MediaRecorder`でいいはずですが、`MediaCodec`でも良いです。

# 画面録画+内部音声収録 アプリを作ってみる
部分的な画面共有を試すだけで良いのですが、今回は`MediaProjection`を使って`画面録画+内部音声収録`が出来るアプリを作ってみようと思います。  
もう`Android`のクイック設定パネルの画面録画で内部音声収録ありますが、内部音声を収録するための話があんまり無さそうだったので・・・！

先述の通り、特に何もしなくても部分的な画面共有に対応できるので、大昔に書いた記事と同じっちゃ同じなのですが、、、まあ再入門ってことで。

# 環境

| なまえ         | あたい                                                                                                |
|----------------|-------------------------------------------------------------------------------------------------------|
| Android        | 部分的な画面共有したい場合は 14 QBR 2 以降（現状`Pixel`シリーズに`Android ベータ版`を入れるしか無い） |
| 端末           | Pixel 8 Pro / Xperia 1 V                                                                              |
| Android Studio | Android Studio Hedgehog 2023.1.1 Patch 2                                                              |

`UI`には`Jetpack Compose`を利用しますが、別に画面録画にはあんまり関係ないので、`View`で作ってもいいです。  
`Jetpack Compose`だと記事に`xml`貼らなくて済むから地味に楽なんだよな。

あ、あと別スレッドを扱う必要があるので、その際には`Kotlin コルーチン`を使います。  
が、そんな難しいことはしていないはず。

## AndroidManifest.xml
多分この3つが必要。

- フォアグラウンドサービス権限
- マイク権限（内部音声収録しない場合はいらない）
- `MediaProjection`をフォアグラウンドサービスで使いますよ権限

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION" />
```

## MainActivity.kt
サービスを開始するボタンと、終了するボタンを置きます。  
それぞれボタンを押したらサービスを起動、終了するようにします。まだ`ScreenRecordService`は作ってないので赤くなります  

先述の通り、画面録画にはあんまり`UI`関係ないので、`Jetpack Compose`じゃなくてもいいはず。  
（まあ今更`AndroidView`を選ぶ理由もないと思いますが。）

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MainScreen()
        }
    }
}

@Composable
fun MainScreen() {
    val context = LocalContext.current
    val mediaProjectionManager = remember { context.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager }

    // 内部音声収録のためにマイク権限を貰う
    val permissionResult = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { isGrant ->
            if (isGrant) {
                Toast.makeText(context, "許可されました", Toast.LENGTH_SHORT).show()
            }
        }
    )

    // 画面共有の合否
    val mediaProjectionResult = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult(),
        onResult = { result ->
            // 許可がもらえたら
            if (result.resultCode == ComponentActivity.RESULT_OK && result.data != null) {
                ScreenRecordService.startService(context, result.resultCode, result.data!!)
            }
        }
    )

    // マイク権限無ければ貰う
    LaunchedEffect(key1 = Unit) {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            permissionResult.launch(Manifest.permission.RECORD_AUDIO)
        }
    }

    Column {
        Button(onClick = {
            // 許可をリクエスト
            mediaProjectionResult.launch(mediaProjectionManager.createScreenCaptureIntent())
        }) {
            Text(text = "録画サービス起動")
        }

        Button(onClick = {
            ScreenRecordService.stopService(context)
        }) {
            Text(text = "録画サービス終了")
        }
    }
}
```

## フォアグラウンドサービスを作る
どうでもいいですが、`Service`を作る時はコンテキストメニューから作ると良いと思います。  
よく`AndroidManifest.xml`に書き忘れるんだよなあこれ

![Imgur](https://imgur.com/WfgE4NX.png)

一点、サービス作ったら`AndroidManifest.xml`を開いて、`<service>`を探して、`android:foregroundServiceType="mediaProjection"`を付けてあげる必要があります。  

```xml
<service
    android:name=".ScreenRecordService"
    android:enabled="true"
    android:exported="true"
    android:foregroundServiceType="mediaProjection"></service>
```

とりあえずフォアグラウンドサービスを起動するまでのコードを書きます。  
画面録画はこの後！

ユーザーに許可をもらった後、`rememberLauncherForActivityResult （旧：onActivityResult）`経由で`Intent`を貰いますが、その`Intent`の`resultCode`と`data`をサービス側に渡してあげる必要があります。  
`MediaProjection`を開始するのに必要なので・・・！  
（大昔に書いた記事書くときに、`Intent`の中に`putExtra`で`Intent`入れられるんだ・・って思ったのを思い出しました）  

一点、`stopService`関数ですが、`Context#stopService`ではなく、`Context#startService`した後に、`onStartCommand`内で`stopSelf`を呼び出して終了するようにしています。  
なんでこんな回りくどい方法を取っているか、なんですが、録画終了時にちょっと時間がかかる処理をする必要があって、`Context#stopService`だと処理中に`Service`が終了しかねないんですよね。  
（`onDestroy`でやっても間に合わないかも）

そのため、サービス終了しろよというフラグを乗せた`Intent`を投げて、処理が終わった後`stopSelf`するようにするため、この様な形になってます。  
ちょっとややこしい

```kotlin
/** 画面録画サービス */
class ScreenRecordService : Service() {
    private val notificationManager by lazy { NotificationManagerCompat.from(this) }

    override fun onBind(intent: Intent): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 通知を出す
        notifyForegroundServiceNotification()

        // Intent から値を取り出す
        if (intent?.getBooleanExtra(INTENT_KEY_START_OR_STOP, false) == true) {
            // 開始命令
        } else {
            // 終了命令
            stopSelf()
        }

        return START_NOT_STICKY
    }

    private fun notifyForegroundServiceNotification() {
        if (notificationManager.getNotificationChannel(CHANNEL_ID) == null) {
            val channel = NotificationChannelCompat.Builder(CHANNEL_ID, NotificationManagerCompat.IMPORTANCE_LOW).apply {
                setName("画面録画サービス起動中通知")
            }.build()
            notificationManager.createNotificationChannel(channel)
        }
        val notification = NotificationCompat.Builder(this, CHANNEL_ID).apply {
            setContentTitle("画面録画")
            setContentText("録画中です")
            setSmallIcon(R.drawable.ic_launcher_foreground)
        }.build()

        // ForegroundServiceType は必須です
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION)
        } else {
            ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, 0)
        }
    }

    companion object {
        // 通知関連
        private const val CHANNEL_ID = "screen_recorder_service"
        private const val NOTIFICATION_ID = 4545

        // Intent に MediaProjection の結果を入れるのでそのキー
        private const val INTENT_KEY_MEDIA_PROJECTION_RESULT_CODE = "result_code"
        private const val INTENT_KEY_MEDIA_PROJECTION_RESULT_DATA = "result_code"

        // サービス終了時は、終了しろというフラグを Intent に入れて、startService することにする
        // 多分 onDestroy でファイル操作とかやっちゃいけない気がする
        // true だったら start 、false だったら stop
        private const val INTENT_KEY_START_OR_STOP = "start_or_stop"

        fun startService(context: Context, resultCode: Int, data: Intent) {
            val intent = Intent(context, ScreenRecordService::class.java).apply {
                putExtra(INTENT_KEY_MEDIA_PROJECTION_RESULT_CODE, resultCode)
                putExtra(INTENT_KEY_MEDIA_PROJECTION_RESULT_DATA, data)
                putExtra(INTENT_KEY_START_OR_STOP, true)
            }
            ContextCompat.startForegroundService(context, intent)
        }

        fun stopService(context: Context) {
            val intent = Intent(context, ScreenRecordService::class.java).apply {
                putExtra(INTENT_KEY_START_OR_STOP, false)
            }
            ContextCompat.startForegroundService(context, intent)
        }
    }
}
```

## 画面録画のためのコード ScreenRecorder.kt
`MainActivity`とかがある階層に`ScreenRecorder.kt`を作りました。  
画面録画のための処理をここに書きます（画面録画だけなら`Service`に直接書いてもそこまで長くならないので良いはず？）  

```kotlin
/** 画面録画のためのクラス */
class ScreenRecorder(
    private val context: Context,
    private val resultCode: Int,
    private val resultData: Intent
) {
    private val mediaProjectionManager by lazy { context.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager }

    private var mediaProjection: MediaProjection? = null
    private var mediaRecorder: MediaRecorder? = null
    private var virtualDisplay: VirtualDisplay? = null

    fun startRecord() {
        // このあとすぐ
    }

    fun stopRecord() {
        // このあとすぐ
    }

    companion object {
        private const val VIDEO_WIDTH = 1280
        private const val VIDEO_HEIGHT = 720
    }
}
```

`startRecord()`では画面録画を行うのに必要な、`MediaProjection`を作ったり、`MediaRecorder`を作ったりして、実際に録画を開始する処理を書きます。  
`MediaCodec`とかは（**まだ**）登場しないので安心してください

```kotlin
/** 録画を開始する */
fun startRecord() {
    mediaRecorder = (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) MediaRecorder(context) else MediaRecorder()).apply {
        // 呼び出し順が存在します
        // 音声トラックは録画終了時にやります
        setVideoSource(MediaRecorder.VideoSource.SURFACE)
        setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
        setVideoEncoder(MediaRecorder.VideoEncoder.H264)
        setVideoEncodingBitRate(6_000_000)
        setVideoFrameRate(60)
        // 解像度、縦動画の場合は、代わりに回転情報を付与する（縦横の解像度はそのまま）
        setVideoSize(VIDEO_WIDTH, VIDEO_HEIGHT)
        // 保存先。
        // sdcard/Android/data/{アプリケーションID} に保存されますが、後で端末の動画フォルダーに移動します
        videoRecordingFile = context.getExternalFilesDir(null)?.resolve("video_track.mp4")
        setOutputFile(videoRecordingFile!!.path)
        prepare()
    }

    mediaProjection = mediaProjectionManager.getMediaProjection(resultCode, resultData).apply {
        // 画面録画中のコールバック
        registerCallback(object : MediaProjection.Callback() {
            override fun onCapturedContentResize(width: Int, height: Int) {
                super.onCapturedContentResize(width, height)
                // サイズが変化したら呼び出される
            }

            override fun onCapturedContentVisibilityChanged(isVisible: Boolean) {
                super.onCapturedContentVisibilityChanged(isVisible)
                // 録画中の画面の表示・非表示が切り替わったら呼び出される
            }

            override fun onStop() {
                super.onStop()
                // MediaProjection 終了時
                // do nothing
            }
        }, null)
    }
    virtualDisplay = mediaProjection?.createVirtualDisplay(
        "io.github.takusan23.androidpartialscreeninternalaudiorecorder",
        VIDEO_WIDTH,
        VIDEO_HEIGHT,
        context.resources.configuration.densityDpi,
        DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
        mediaRecorder?.surface,
        null,
        null
    )
    // 録画開始
    mediaRecorder?.start()
}
```

`stopRecord()`では録画を止めて、画面録画に使ったクラスのリソース開放をします。

```kotlin
/** 録画を終了する */
fun stopRecord() {
    mediaRecorder?.stop()
    mediaRecorder?.release()
    mediaProjection?.stop()
    virtualDisplay?.release()
}
```

一旦これで、`ScreenRecordService`に組み込みます。  
`true`でインスタンスを作って録画開始、`false`なら`stopRecord`を呼び出します。

まだ内部音声収録機能とか、端末の動画フォルダーに移動する機能がないのですが・・・

```kotlin
override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    // 通知を出す
    notifyForegroundServiceNotification()

    // Intent から値を取り出す
    if (intent?.getBooleanExtra(INTENT_KEY_START_OR_STOP, false) == true) {
        // 開始命令
        screenRecorder = ScreenRecorder(
            context = this,
            resultCode = intent.getIntExtra(INTENT_KEY_MEDIA_PROJECTION_RESULT_CODE, -1),
            resultData = intent.getParcelableExtra(INTENT_KEY_MEDIA_PROJECTION_RESULT_DATA)!!
        )
        screenRecorder?.startRecord()
    } else {
        // 終了命令
        screenRecorder?.stopRecord()
        stopSelf()
    }

    return START_NOT_STICKY
}
```

そういえば、`getParcelableExtra`が非推奨になったけど代替メソッドにはまた別の問題があるとかで、結局非推奨の方を使わないといけないとかいう話、  
あれ進展あるのかな。`Compat`出た？

## 動画だけの録画ができるか確認
どうでしょう。開始ボタンを押したら、ステータスバーにキャストアイコンが出て、終了を押したら消えましたか？  
ファイルの確認ですが、`Android Studio`が使える場合は、`Device Explorer`を開いて、`sdcard/Android/data/{アプリケーションID}/files`に動画が保存されているはず

![Imgur](https://imgur.com/MdI6w6r.png)

`Android`端末しかない場合は、アプリケーションID`com.android.documentsui`を何らかの方法で開くことで、ファイルマネージャーが開くので、  
そこで`Android/data/{アプリケーションID}/files`を確認すると良いと思います。

開く方法はショートカットアプリを入れて、パッケージ名`com.android.documentsui`から始まる`Activity`を選ぶと良いはず。

## 内部音声収録機能をつける
ここから難しくなります。。。とりあえずコピペで動かしてみると良いと思います。

- ドキュメント
    - https://developer.android.com/media/platform/av-capture#building_a_capture_app

さて、ここからが難しいです。  
内部音声を収録する機能ですが、残念ながら高レベル`API`の`MediaRecorder`では出来ません。  
というのも、`MediaRecorder#setAudioSource`にはマイクしか選択肢がないのです。端末内の音声を取るためには`MediaRecorder`じゃダメなんですね。

じゃあどうするんだって話ですが、低レベル`API`を組み合わせて作るしか無いはずです。  
`AudioRecord` + `MediaCodec` + `MediaMuxer` です。

### AudioRecord
マイクとか、内部音声の収録で使うやつで、音声データがそのまま取得できます。  
`MediaRecorder`だと勝手にファイルに書き込んでくれますが、`AudioRecord`はあくまでも音を拾って拾った結果をそのまま吐き出す（PCM）だけなので、  
拾ってきた音を圧縮（エンコード）して、ファイルに書き込む処理は別途作る必要があります・・！  

`MediaRecorder`には無いから自前で機能を作りたい場合はこの辺お世話になりそうですね。  
今回は内部音声収録のために使うので凝ったことはしません！

### MediaCodec
拾ってきた音を圧縮（エンコード）するのに使います。  
内部音声収録をして生の音声データが出てくるので、これを使って`AAC`とか言うファイルにします。  
とにかくエラーがわからない・・・

映像の圧縮もあるのですが今回は音声のエンコードだけなのでパス！

### MediaMuxer
`MediaCodec`から出てきたエンコードされたデータをファイルに書き込むためのやつです。  

### MediaExtractor
`mp4`、`webm`ファイルから、エンコードされたデータを取り出したり、メタデータを取り出したりします。  
この先で使うのでここで説明させてね。

う～ん。こうやって見ると`MediaRecorder`ってこの辺いい感じにしてくれてたんですねえ・・・

## 音声エンコーダー AudioEncoder.kt
まずは`MediaCodec`を使いやすくしたクラスを作ります。  
このブログでは何回か出てきているあれです。  

私も何でこれで動いているのかよく分からないのでコピペしてください。`MediaCodec`何もわからない・・・  
`startAudioEncode`のなかで`while`ループしているので、呼び出し元のコルーチンがキャンセルされるまでずっとコルーチンが一時停止し続けます。

```kotlin
/**
 * 音声エンコーダー
 * MediaCodecを使いやすくしただけ
 *
 * 内部音声が生のまま（PCM）送られてくるので、 AAC / Opus にエンコードする。
 */
class AudioEncoder {

    /** MediaCodec エンコーダー */
    private var mediaCodec: MediaCodec? = null

    /**
     * エンコーダーを初期化する
     *
     * @param samplingRate サンプリングレート
     * @param channelCount チャンネル数
     * @param bitRate ビットレート
     */
    fun prepareEncoder(
        samplingRate: Int = 44_100,
        channelCount: Int = 2,
        bitRate: Int = 192_000,
    ) {
        val codec = MediaFormat.MIMETYPE_AUDIO_AAC
        val audioEncodeFormat = MediaFormat.createAudioFormat(codec, samplingRate, channelCount).apply {
            setInteger(MediaFormat.KEY_AAC_PROFILE, MediaCodecInfo.CodecProfileLevel.AACObjectLC)
            setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
        }
        // エンコーダー用意
        mediaCodec = MediaCodec.createEncoderByType(codec).apply {
            configure(audioEncodeFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        }
    }

    /**
     * エンコーダーを開始する。
     * キャンセルされるまでコルーチンが一時停止します。
     *
     * @param onRecordInput ByteArrayを渡すので、音声データを入れて、サイズを返してください
     * @param onOutputBufferAvailable エンコードされたデータが流れてきます
     * @param onOutputFormatAvailable エンコード後のMediaFormatが入手できる
     */
    suspend fun startAudioEncode(
        onRecordInput: suspend (ByteArray) -> Int,
        onOutputBufferAvailable: suspend (ByteBuffer, MediaCodec.BufferInfo) -> Unit,
        onOutputFormatAvailable: suspend (MediaFormat) -> Unit,
    ) = withContext(Dispatchers.Default) {
        val bufferInfo = MediaCodec.BufferInfo()
        mediaCodec!!.start()

        try {
            while (isActive) {
                // もし -1 が返ってくれば configure() が間違ってる
                val inputBufferId = mediaCodec!!.dequeueInputBuffer(TIMEOUT_US)
                if (inputBufferId >= 0) {
                    // AudioRecodeのデータをこの中に入れる
                    val inputBuffer = mediaCodec!!.getInputBuffer(inputBufferId)!!
                    val capacity = inputBuffer.capacity()
                    // サイズに合わせて作成
                    val byteArray = ByteArray(capacity)
                    // byteArrayへデータを入れてもらう
                    val readByteSize = onRecordInput(byteArray)
                    if (readByteSize > 0) {
                        // 書き込む。書き込んだデータは[onOutputBufferAvailable]で受け取れる
                        inputBuffer.put(byteArray, 0, readByteSize)
                        mediaCodec!!.queueInputBuffer(inputBufferId, 0, readByteSize, System.nanoTime() / 1000, 0)
                    }
                }
                // 出力
                val outputBufferId = mediaCodec!!.dequeueOutputBuffer(bufferInfo, TIMEOUT_US)
                if (outputBufferId >= 0) {
                    val outputBuffer = mediaCodec!!.getOutputBuffer(outputBufferId)!!
                    if (bufferInfo.size > 1) {
                        if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG == 0) {
                            // ファイルに書き込む...
                            onOutputBufferAvailable(outputBuffer, bufferInfo)
                        }
                    }
                    // 返却
                    mediaCodec!!.releaseOutputBuffer(outputBufferId, false)
                } else if (outputBufferId == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                    // MediaFormat、MediaMuxerに入れるときに使うやつ
                    // たぶんこっちのほうが先に呼ばれる
                    onOutputFormatAvailable(mediaCodec!!.outputFormat)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            // リソース開放
            mediaCodec?.stop()
            mediaCodec?.release()
        }
    }

    companion object {

        /** MediaCodec タイムアウト */
        private const val TIMEOUT_US = 10_000L

    }
}
```

## 内部音声収録をする InternalAudioRecorder.kt
内部音声収録機能はそれだけで結構複雑なので、更に別のクラスに切り出してみました。  
まずは内部音声収録に使う`AudioRecord`を初期化します。  
内部音声収録は`Android 10`以降が必要なので、ちょっと注意。

で、で、で、ここで`サンプリングレート`と`チャンネル数`とかいう聞き慣れない単語が出てくるのですが、  
あんまり`Android`とは関係ないので深入りはしませんが。`AudioRecord`と`MediaCodec`で同じ値を指定しておく必要があります

- サンプリングレート
    - 音を一秒間に何回記録するかです
    - 大体`44100`か`48000`のどっちかです
        - ほぼ`44100`です
- チャンネル数
    - 1 だと左右同じ音が出ます
        - モノラル とか言います
    - 2 だと左右から違う音が出ます
        - ステレオ とか言います
    - ほとんどが 2 です

```kotlin
@SuppressLint("MissingPermission")
@RequiresApi(Build.VERSION_CODES.Q)
class InternalAudioRecorder {
    private var audioRecord: AudioRecord? = null
    private var audioEncoder: AudioEncoder? = null
    private var mediaMuxer: MediaMuxer? = null

    var audioRecordingFile: File? = null
        private set

    /**
     * 内部音声収録の初期化をする
     *
     * @param samplingRate サンプリングレート
     * @param channelCount チャンネル数
     */
    fun prepareRecorder(
        context: Context,
        mediaProjection: MediaProjection,
        samplingRate: Int,
        channelCount: Int
    ) {
        // 内部音声取るのに使う
        val playbackConfig = AudioPlaybackCaptureConfiguration.Builder(mediaProjection).apply {
            addMatchingUsage(AudioAttributes.USAGE_MEDIA)
            addMatchingUsage(AudioAttributes.USAGE_GAME)
            addMatchingUsage(AudioAttributes.USAGE_UNKNOWN)
        }.build()
        val audioFormat = AudioFormat.Builder().apply {
            setEncoding(AudioFormat.ENCODING_PCM_16BIT)
            setSampleRate(samplingRate)
            setChannelMask(if (channelCount == 1) AudioFormat.CHANNEL_IN_MONO else AudioFormat.CHANNEL_IN_STEREO)
        }.build()
        audioRecord = AudioRecord.Builder().apply {
            setAudioPlaybackCaptureConfig(playbackConfig)
            setAudioFormat(audioFormat)
        }.build()
        // エンコーダーの初期化
        audioEncoder = AudioEncoder().apply {
            prepareEncoder(
                samplingRate = samplingRate,
                channelCount = channelCount
            )
        }
        // コンテナフォーマットに書き込むやつ
        audioRecordingFile = context.getExternalFilesDir(null)?.resolve("audio_track.mp4")
        mediaMuxer = MediaMuxer(audioRecordingFile!!.path, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
    }

    fun startRecord() {
        // このあと
    }

}
```

そしたら`startRecord`ですね。`stop`が無いやん！って話ですが、呼び出し元のコルーチンがキャンセルされればこちらも`finally`が呼ばれて終了します。  
多分こんな感じ！

```kotlin
/** 録音中はコルーチンが一時停止します */
suspend fun startRecord() = withContext(Dispatchers.Default) {
    val audioRecord = audioRecord ?: return@withContext
    val audioEncoder = audioEncoder ?: return@withContext
    val mediaMuxer = mediaMuxer ?: return@withContext

    try {
        // 録音とエンコーダーを開始する
        audioRecord.startRecording()
        var trackIndex = -1
        audioEncoder.startAudioEncode(
            onRecordInput = { byteArray ->
                // PCM音声を取り出しエンコする
                audioRecord.read(byteArray, 0, byteArray.size)
            },
            onOutputBufferAvailable = { byteBuffer, bufferInfo ->
                // エンコードされたデータが来る
                mediaMuxer.writeSampleData(trackIndex, byteBuffer, bufferInfo)
            },
            onOutputFormatAvailable = { mediaFormat ->
                // onOutputBufferAvailable よりも先にこちらが呼ばれるはずです
                trackIndex = mediaMuxer.addTrack(mediaFormat)
                mediaMuxer.start()
            }
        )
    } finally {
        // リソース開放
        audioRecord.stop()
        audioRecord.release()
        mediaMuxer.stop()
        mediaMuxer.release()
    }
}
```

出来たら、呼び出しを追加する前に最後の処理を先に書いちゃいましょう。  
（全部揃ってから呼び出しします。）

## 画面録画の映像と、内部音声収録の音声を一つの mp4 にする処理
このままだと`video_track.mp4`と`audio_track.mp4`と、それぞれ分かれちゃっています。  
これを一つにします。  

どうすればいいかと言うと、`MediaMuxer`を使います。  
`mp4`（というかコンテナフォーマット）にはトラックというエンコードされたデータの入れ物みたいな概念があって、  
映像データと音声データをそれぞれ一つのファイルに保存するために使われます。

これを使って、音声トラックと映像トラックでそれぞれあるファイルを、一つの`mp4`にします。  

さっき`MediaMuxer`使ったのにまた使うんかい！って感じですが、まあ音声と映像は別々で処理して最後にトラックを入れるって方法が多分良いと思う。  
音声も映像も`MediaCodec`にすれば、一度の`MediaMuxer`ですむと思いますが、うーん。逆に難しくなりそう。

で、コードはこんな感じ。  
`MediaMuxerTool.kt`っていうユーティリティクラスに書いてみました。  
↑ の説明通りのを作ってみた感じです。コメント参照してね。

ちなみにですが、あくまでもトラックを入れ直すだけなので、2つの音声トラックを1つの音声トラックにしたい（音を混ぜたい）とかであればまた全然違う処理を書く必要があります。前ちょっとやったのでこの辺が役に立つかもしれません。  
https://takusan.negitoro.dev/posts/summer_vacation_music_vocal_only/

```kotlin
object MediaMuxerTool {

    /** それぞれ音声トラック、映像トラックを取り出して、2つのトラックを一つの mp4 にする */
    @SuppressLint("WrongConstant")
    suspend fun mixAvTrack(
        audioTrackFile: File,
        videoTrackFile: File,
        resultFile: File
    ) = withContext(Dispatchers.IO) {
        // 出力先
        val mediaMuxer = MediaMuxer(resultFile.path, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)

        val (
            audioPair,
            videoPair
        ) = listOf(
            // mimeType と ファイル
            audioTrackFile to "audio/",
            videoTrackFile to "video/"
        ).map { (file, mimeType) ->
            // MediaExtractor を作る
            val mediaExtractor = MediaExtractor().apply {
                setDataSource(file.path)
            }
            // トラックを探す
            // 今回の場合、TrackFile には 1 トラックしか無いはずだが、一応探す処理を入れる
            // 本当は音声と映像で 2 トラックあるので、どっちのデータが欲しいかをこれで切り替える
            val trackIndex = (0 until mediaExtractor.trackCount)
                .map { index -> mediaExtractor.getTrackFormat(index) }
                .indexOfFirst { mediaFormat -> mediaFormat.getString(MediaFormat.KEY_MIME)?.startsWith(mimeType) == true }
            mediaExtractor.selectTrack(trackIndex)
            // MediaExtractor と MediaFormat の返り値を返す
            mediaExtractor to mediaExtractor.getTrackFormat(trackIndex)
        }

        val (audioExtractor, audioFormat) = audioPair
        val (videoExtractor, videoFormat) = videoPair

        // MediaMuxer に追加して開始
        val audioTrackIndex = mediaMuxer.addTrack(audioFormat)
        val videoTrackIndex = mediaMuxer.addTrack(videoFormat)
        mediaMuxer.start()

        // MediaExtractor からトラックを取り出して、MediaMuxer に入れ直す処理
        listOf(
            audioExtractor to audioTrackIndex,
            videoExtractor to videoTrackIndex,
        ).forEach { (extractor, trackIndex) ->
            val byteBuffer = ByteBuffer.allocate(1024 * 4096)
            val bufferInfo = MediaCodec.BufferInfo()
            // データが無くなるまで回す
            while (isActive) {
                // データを読み出す
                val offset = byteBuffer.arrayOffset()
                bufferInfo.size = extractor.readSampleData(byteBuffer, offset)
                // もう無い場合
                if (bufferInfo.size < 0) break
                // 書き込む
                bufferInfo.presentationTimeUs = extractor.sampleTime
                bufferInfo.flags = extractor.sampleFlags // Lintがキレるけど黙らせる
                mediaMuxer.writeSampleData(trackIndex, byteBuffer, bufferInfo)
                // 次のデータに進める
                extractor.advance()
            }
            // あとしまつ
            extractor.release()
        }

        // 後始末
        mediaMuxer.stop()
        mediaMuxer.release()
    }
}
```

## 端末の動画フォルダーに移動する処理

- ドキュメント
    - https://developer.android.com/training/data-storage/shared/media#toggle-pending-status

`MediaStore`に動画ファイルを追加すると、ファイルパスの代わりになる`Uri`がもらえて、これで`OutputStream`が取得できるので、`File`のデータをコピーすれば良い。  
そういえば、`MediaStore`の`Uri`から`FileDescriptor`がもらえて、これを`MediaMuxer`の出力先として使う方法もあったのですが、、、、`Android 8`以降だったので辞めておきました。  
`7`以下を切れれば使えそうですね。

話を戻して、`getExternalFilesDir`にあるファイルを、端末の動画フォルダーに保存するのはこんな感じです。  

```kotlin
object MediaStoreTool {

    /** 端末の動画フォルダーにコピーする */
    suspend fun copyToVideoFolder(
        context: Context,
        file: File,
        fileName: String
    ) = withContext(Dispatchers.IO) {
        val contentResolver = context.contentResolver
        val contentValues = contentValuesOf(
            MediaStore.MediaColumns.DISPLAY_NAME to fileName,
            MediaStore.MediaColumns.RELATIVE_PATH to "${Environment.DIRECTORY_MOVIES}/AndroidPartialScreenInternalAudioRecorder",
        )
        val uri = contentResolver.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, contentValues) ?: return@withContext
        contentResolver.openOutputStream(uri)?.use { outputStream ->
            file.inputStream().use { inputStream ->
                inputStream.copyTo(outputStream)
            }
        }
    }

}
```

## 組み合わせる！
まずは`ScreenRecorder.kt`。  
内部音声収録の機能と、音声と映像のミックス、端末の動画フォルダーに移動する処理が追加されます。  
`suspend fun`を使ったので、`launch { }`でくくる必要があります

これちょっと内部音声収録のための`Android 10`かどうかの分岐が邪魔くさいですね。面倒なのでやりませんが、、、

```kotlin
/** 画面録画のためのクラス */
class ScreenRecorder(
    private val context: Context,
    private val resultCode: Int,
    private val resultData: Intent
) {
    private val mediaProjectionManager by lazy { context.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager }
    private val scope = CoroutineScope(Dispatchers.Default + Job())

    private var recordingJob: Job? = null
    private var mediaProjection: MediaProjection? = null
    private var mediaRecorder: MediaRecorder? = null
    private var videoRecordingFile: File? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var internalAudioRecorder: InternalAudioRecorder? = null

    /** 録画を開始する */
    fun startRecord() {
        recordingJob = scope.launch {
            mediaRecorder = (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) MediaRecorder(context) else MediaRecorder()).apply {
                // 呼び出し順が存在します
                // 音声トラックは録画終了時にやります
                setVideoSource(MediaRecorder.VideoSource.SURFACE)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setVideoEncoder(MediaRecorder.VideoEncoder.H264)
                setVideoEncodingBitRate(6_000_000)
                setVideoFrameRate(60)
                // 解像度、縦動画の場合は、代わりに回転情報を付与する（縦横の解像度はそのまま）
                setVideoSize(VIDEO_WIDTH, VIDEO_HEIGHT)
                // 保存先。
                // sdcard/Android/data/{アプリケーションID} に保存されますが、後で端末の動画フォルダーに移動します
                videoRecordingFile = context.getExternalFilesDir(null)?.resolve("video_track.mp4")
                setOutputFile(videoRecordingFile!!.path)
                prepare()
            }

            mediaProjection = mediaProjectionManager.getMediaProjection(resultCode, resultData)
            // メインスレッドで呼び出す
            withContext(Dispatchers.Main) {
                // 画面録画中のコールバック
                mediaProjection?.registerCallback(object : MediaProjection.Callback() {
                    override fun onCapturedContentResize(width: Int, height: Int) {
                        super.onCapturedContentResize(width, height)
                        // サイズが変化したら呼び出される
                    }

                    override fun onCapturedContentVisibilityChanged(isVisible: Boolean) {
                        super.onCapturedContentVisibilityChanged(isVisible)
                        // 録画中の画面の表示・非表示が切り替わったら呼び出される
                    }

                    override fun onStop() {
                        super.onStop()
                        // MediaProjection 終了時
                        // do nothing
                    }
                }, null)
            }
            // 画面ミラーリング
            virtualDisplay = mediaProjection?.createVirtualDisplay(
                "io.github.takusan23.androidpartialscreeninternalaudiorecorder",
                VIDEO_WIDTH,
                VIDEO_HEIGHT,
                context.resources.configuration.densityDpi,
                DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                mediaRecorder?.surface,
                null,
                null
            )
            // 内部音声収録
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                internalAudioRecorder = InternalAudioRecorder().apply {
                    prepareRecorder(context, mediaProjection!!, AUDIO_SAMPLING_RATE, AUDIO_CHANNEL_COUNT)
                }
            }

            // 画面録画開始
            mediaRecorder?.start()
            // 内部音声収録開始。
            // この関数のあとに処理を書いても、startRecord が一時停止し続けるので注意。
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                internalAudioRecorder?.startRecord()
            }
        }
    }

    /** 録画を終了する */
    suspend fun stopRecord() = withContext(Dispatchers.IO) {
        // 終了を待つ
        recordingJob?.cancelAndJoin()
        // リソース開放をする
        mediaRecorder?.stop()
        mediaRecorder?.release()
        mediaProjection?.stop()
        virtualDisplay?.release()

        // 内部音声収録をしている場合、音声と映像が別れているので、2トラックをまとめた mp4 にする
        val resultFile = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            context.getExternalFilesDir(null)?.resolve("mix_track.mp4")!!.also { mixFile ->
                MediaMuxerTool.mixAvTrack(
                    audioTrackFile = internalAudioRecorder?.audioRecordingFile!!,
                    videoTrackFile = videoRecordingFile!!,
                    resultFile = mixFile
                )
            }
        } else {
            videoRecordingFile!!
        }

        // 端末の動画フォルダーに移動
        MediaStoreTool.copyToVideoFolder(
            context = context,
            file = resultFile,
            fileName = "AndroidPartialScreenInternalAudioRecorder_${System.currentTimeMillis()}.mp4"
        )

        // 要らないのを消す
        videoRecordingFile!!.delete()
        resultFile.delete()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            internalAudioRecorder?.audioRecordingFile!!.delete()
        }
    }

    companion object {
        private const val VIDEO_WIDTH = 1280
        private const val VIDEO_HEIGHT = 720
        private const val AUDIO_SAMPLING_RATE = 44_100
        private const val AUDIO_CHANNEL_COUNT = 2
    }
}
```

これに合わせて`ScreenRecordService.kt`も修正しました。  
`stopRecord`が`suspend fun`になり、ファイルの保存が確実に終わるまでは`stopSelf`に進まないようになっています。

```kotlin
class ScreenRecordService : Service() {
    private val notificationManager by lazy { NotificationManagerCompat.from(this) }
    private val scope = MainScope()

    private var screenRecorder: ScreenRecorder? = null

    override fun onBind(intent: Intent): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 通知を出す
        notifyForegroundServiceNotification()

        // Intent から値を取り出す
        if (intent?.getBooleanExtra(INTENT_KEY_START_OR_STOP, false) == true) {
            // 開始命令
            screenRecorder = ScreenRecorder(
                context = this,
                resultCode = intent.getIntExtra(INTENT_KEY_MEDIA_PROJECTION_RESULT_CODE, -1),
                resultData = intent.getParcelableExtra(INTENT_KEY_MEDIA_PROJECTION_RESULT_DATA)!!
            )
            // 録画開始
            screenRecorder?.startRecord()
        } else {
            // 終了命令
            scope.launch {
                // 終了を待ってから stopSelf する
                screenRecorder?.stopRecord()
                stopSelf()
            }
        }

        return START_NOT_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()
    }

    // これ以降は変更なし
```

**どうだろう？これで完成だと思うよ？**

# これが部分的な画面共有！！です！
**ステータスバーが映り込んでない！** これが`Android 14`だあああ。  
どうやら画面分割の場合、`createVirtualDisplay`のサイズはそのままで、黒帯が表示されたりする感じなんですね。

そしてちゃんと**内部音声収録**もされています！  
ゲーム実況できそう！

https://www.youtube.com/watch?v=0KcolWHVjV0

<video controls src="https://github.com/takusan23/AndroidPartialScreenInternalAudioRecorder/assets/32033405/b31a8370-3da8-4eab-adc4-543ad9390f09" width="300px"></video>

# ソースコード
コードとか後半は断片的になっちゃったから。。。どうぞ

https://github.com/takusan23/AndroidPartialScreenInternalAudioRecorder

https://github.com/takusan23/AndroidPartialScreenInternalAudioRecorder/tree/master/app/src/main/java/io/github/takusan23/androidpartialscreeninternalaudiorecorder

# 番外編 単一アプリが画面に映っていないときの話
さて、ここから先はおまけです。ほとんどの人は関係ありません  
冒頭の方で、単一アプリの表示中で、その単一アプリが画面外に移動した場合、エンコーダーからデータが流れてこないんですよね。  

`MediaRecorder`は高レベル過ぎて分からないですが、`MediaCodec`の場合`MediaCodec#dequeueOutputBuffer`の返り値が、単一アプリが画面外にいる場合は`-1`を返すので、データが流れてきません！  

データが流れてこないと何が困るかと言うと、前作ったミラーリングアプリ（`ぜろみらー`）が動かなくなっちゃうんですよね。  
このアプリは映像データを細切れにしてブラウザに配信するアプリなのですが、おそらく仕様上ずっと映像データを送り続けないといけないんですよね。  

なので、私としては単一アプリが画面外にいる場合、最後のフレームでも、真っ黒の映像でもなんでも良いので途切れてほしくはなかったのですが、、、  
現状何もしない場合はエンコーダーからデータが来ないので、ブラウザに配信するファイルも途切れてしまいます。  
（・・・まあ画面外に有るのに出続けるのもおかしいか）

## 単一アプリが画面に映ってないときに代わりに映す
![Imgur](https://imgur.com/RO0lLNn.png)

というわけで、画面外に単一アプリが移動した場合、「今は映らないよ！アプリ戻ってきたら映るよ！」的な文字を動画に入れたいわけですが、  
それをするにはおそらく`OpenGL`を使うしか無い・・・

## やらないといけないこと

- 代替画像の作成
    - これは`Bitmap`作って適当に`Canvas`で文字を書けばいいでしょう
- `OpenGL` で画面共有の映像を描画する
    - 最大の敵でた
    - おそらく映像データに手を入れたい場合は`OpenGL`を使うしか無い
    - ・・・が、相変わらず`AOSP`の`MediaCodec`テストで使われてる`OpenGL`関連のやつをコピペして、フラグメントシェーダーをちょっと直せば動くはずなのでそれで行きます

# もしやりたい場合

## OpenGL
`OpenGL`のコードをコピペします。  
もう全部貼るのはつかれたというかまぶたが重くて、、、`GitHub`からコピーしてきてね

`MediaCodec`シリーズではよく出てくるこのコード、`MediaRecorder`でも使えます。  
https://takusan.negitoro.dev/posts/tag/MediaCodec/

- https://github.com/takusan23/AndroidPartialScreenInternalAudioRecorder/blob/master/app/src/main/java/io/github/takusan23/androidpartialscreeninternalaudiorecorder/opengl/TextureRenderer.kt
- https://github.com/takusan23/AndroidPartialScreenInternalAudioRecorder/blob/cf09881d6bb9e5c76dbafc7884a4ae6239efda47/app/src/main/java/io/github/takusan23/androidpartialscreeninternalaudiorecorder/opengl/InputSurface.kt

これは`MediaRecorder - MediaProjection (VirtualDisplay)`の関係から、`MediaRecorder - OpenGL - MediaProjection (VirtualDiplay)`という感じに、間に`OpenGL`を挟むようにします。  
`MediaProjection`の映像は`OpenGL`のテクスチャとして使える（`SurfaceTexture`クラス参照）ので、フラグメントシェーダーからは`texture2D`で描画できます。

このフラグメントシェーダーで、単一アプリが画面に表示されている場合は`MediaProjection`の画面共有を描画して、  
表示されていない時は代わりの画像`uAltImage`を描画するようにしてみました。これでエンコーダー（`MediaRecorder`）へ流す映像が途切れなくはなりましたね。

```glsl
        private const val FRAGMENT_SHADER = """
#extension GL_OES_EGL_image_external : require
precision mediump float;
varying vec2 vTextureCoord;
uniform samplerExternalOES sTexture;
uniform sampler2D uAltImage;

// 映像を描画するのか、画像を表示するのか
uniform int uDrawAltImage;

void main() {
  if (bool(uDrawAltImage)) {
    gl_FragColor = texture2D(uAltImage, vTextureCoord);
  } else {
    gl_FragColor = texture2D(sTexture, vTextureCoord);  
  }
}
"""
```

あとは`glDrawArrays`とかやって、画面共有か代替画像かどっちかを描画するように

```kotlin
/** 録画映像の代わりに代替画像を描画する */
fun drawAltImage() {
    GLES20.glUseProgram(mProgram)
    checkGlError("glUseProgram")
    // AltImage を描画する
    GLES20.glUniform1i(uDrawAltImageHandle, 1)
    checkGlError("glUniform1i uDrawAltImageHandle")
    // 描画する
    GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
    checkGlError("glDrawArrays")
    GLES20.glFinish()
}

/** 画面録画の映像を描画する */
fun drawFrame(st: SurfaceTexture) {
    checkGlError("onDrawFrame start")
    st.getTransformMatrix(mSTMatrix)
    GLES20.glUseProgram(mProgram)
    checkGlError("glUseProgram")
    GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
    // SurfaceTexture テクスチャユニットは GLES20.GL_TEXTURE0 なので 0
    GLES20.glUniform1i(uTextureHandle, 0)
    checkGlError("glUniform1i uTextureHandle")
    // AltImage ではなく SurfaceTexture を描画する
    GLES20.glUniform1i(uDrawAltImageHandle, 0)
    checkGlError("glUniform1i uDrawAltImageHandle")
    GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, screenRecordTextureId)
    mTriangleVertices.position(TRIANGLE_VERTICES_DATA_POS_OFFSET)
    GLES20.glVertexAttribPointer(maPositionHandle, 3, GLES20.GL_FLOAT, false, TRIANGLE_VERTICES_DATA_STRIDE_BYTES, mTriangleVertices)
    checkGlError("glVertexAttribPointer maPosition")
    GLES20.glEnableVertexAttribArray(maPositionHandle)
    checkGlError("glEnableVertexAttribArray maPositionHandle")
    mTriangleVertices.position(TRIANGLE_VERTICES_DATA_UV_OFFSET)
    GLES20.glVertexAttribPointer(maTextureHandle, 2, GLES20.GL_FLOAT, false, TRIANGLE_VERTICES_DATA_STRIDE_BYTES, mTriangleVertices)
    checkGlError("glVertexAttribPointer maTextureHandle")
    GLES20.glEnableVertexAttribArray(maTextureHandle)
    checkGlError("glEnableVertexAttribArray maTextureHandle")
    GLES20.glUniformMatrix4fv(muSTMatrixHandle, 1, false, mSTMatrix, 0)
    GLES20.glUniformMatrix4fv(muMVPMatrixHandle, 1, false, mMVPMatrix, 0)
    GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
    checkGlError("glDrawArrays")
    GLES20.glFinish()
}
```

そういえば、`SurfaceTexture`のコールバックと周りはちょっと罠があって、  
https://stackoverflow.com/questions/14185661/

こんな感じに別スレッドでフラグを操作する場合は`Synchronized`とか`Mutex()`を使って、同時に複数スレッドからフラグを操作されないようにしないと、いつまでたっても映像が来ない勘違いをすることになります。。。  
（`Stackoverflow`を見る感じ、`OpenGL`の描画が遅くて以下の`isNewFrameAvailable`のフラグが不正に書き換わっちゃうらしい）

```kotlin
/**
 * [SurfaceTexture.OnFrameAvailableListener.onFrameAvailable] と [awaitIsNewFrameAvailable] からそれぞれ別スレッドで [isNewFrameAvailable] にアクセスするため、
 * 同時アクセスできないように制御する [Mutex]。
 */
private val frameSyncMutex = Mutex()

/** 新しい映像フレームが来ていれば true */
private var isNewFrameAvailable = false

/**
 * 新しい映像フレームが来ているか
 *
 * @return true の場合は[updateTexImage] [drawImage] [swapBuffers]を呼び出して描画する。
 */
suspend fun awaitIsNewFrameAvailable(): Boolean {
    return frameSyncMutex.withLock {
        if (isNewFrameAvailable) {
            // onFrameAvailable が来るまで倒しておく
            isNewFrameAvailable = false
            // 描画すべきなので true
            true
        } else {
            // まだ来てない
            false
        }
    }
}

/** これは UI Thread から呼ばれる */
override fun onFrameAvailable(st: SurfaceTexture) {
    scope.launch {
        frameSyncMutex.withLock {
            // 新しい映像フレームが来たら true
            isNewFrameAvailable = true
        }
    }
}
```

それ以外は何やってんのか知らないので、次行きます。

## 録画部分に組み込む話と Kotlin Coroutine の話
`Kotlin コルーチン`がマジで便利。  
というのも、`OpenGL`は`makeCurrent`したスレッドじゃないと描画できないので、ちょっとややこしい。  

https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html

`Kotlin coroutine`で、実行したいスレッドを指定したい時`Dispatchers.Main`とか`Dispatchers.IO`とか使うと思いますが、  
`Main`以外は裏側で複数のスレッドが待機していて処理されるはずで（スレッドプールとか言うらしいですけどよくわかりません？）、  
例えば`Dispatchers.Default`を`launch / withContext`に指定したとしても、すべてで同じスレッドが使われるかどうかはわからないわけです。

```kotlin
runBlocking {
    // 適当に 100 個、子コルーチンを起動する
    // Dispatchers.Default を指定する
    (0 until 100).map { i ->
        launch(Dispatchers.Default) {
            println("$i = ${Thread.currentThread().name}")
        }
    }.joinAll()
}
```

適当に実行してみた結果、この様な結果になります。最後の方をコピペしてみました。  
`Thread.currentThread().name`が起動するたびに違う事がありますね。  

```
90 = DefaultDispatcher-worker-2
91 = DefaultDispatcher-worker-1
92 = DefaultDispatcher-worker-2
93 = DefaultDispatcher-worker-5
94 = DefaultDispatcher-worker-5
95 = DefaultDispatcher-worker-2
96 = DefaultDispatcher-worker-1
97 = DefaultDispatcher-worker-1
98 = DefaultDispatcher-worker-2
99 = DefaultDispatcher-worker-1
```

**OpenGL の場合はスレッドが変わっちゃうと動かなくなるので、これだと困る！固定して欲しい！**  

というわけで実行するスレッドを固定してみます。  
`newSingleThreadContext`ってやつを使うことで、常に同じスレッドで処理してくれる`Dispatcher`を作ることが出来ます

```kotlin
fun main() {
    // newSingleThreadContext は作るのにコストがかかるので、
    // companion object に置くなどして、一回だけ作って使い回す方が良いです
    val singleThreadDispatcher = newSingleThreadContext("OpenGLContextRelatedThread")

    runBlocking {
        // 適当に 100 個、子コルーチンを起動する
        // Dispatchers.Default を指定する
        (0 until 100).map { i ->
            launch(singleThreadDispatcher) {
                println("$i = ${Thread.currentThread().name}")
            }
        }.joinAll()
    }
}
```

```kotlin
90 = OpenGLContextRelatedThread
91 = OpenGLContextRelatedThread
92 = OpenGLContextRelatedThread
93 = OpenGLContextRelatedThread
94 = OpenGLContextRelatedThread
95 = OpenGLContextRelatedThread
96 = OpenGLContextRelatedThread
97 = OpenGLContextRelatedThread
98 = OpenGLContextRelatedThread
99 = OpenGLContextRelatedThread
```

これだとすべて同じスレッドで処理されることが分かりますね。  
これがあれば`OpenGL`も怖くない！

というわけで組み込んでみました。こうです。  
`onCapturedContentVisibilityChanged`のコールバックで、代替画像を表示するかのフラグを更新するのを追加しました。  
また、`OpenGL`周りの初期化を追加しました。スレッド注意です。  
そして`VirtualDisplay`の`Surface`を`OpenGL （SurfaceTexture）`の物に差し替えました。差し替え忘れないようにしてください。

あとは録画が停止するまで、`OpenGL`のメインループ？で新しい画面共有のフレームが来ていれば描画するし、代替画像を表示する場合はここで代替画像を描画して、エンコーダーへ渡します。

```kotlin
/** 画面録画のためのクラス */
class ScreenRecorder(
    private val context: Context,
    private val resultCode: Int,
    private val resultData: Intent
) {
    private val mediaProjectionManager by lazy { context.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager }
    private val scope = CoroutineScope(Dispatchers.Default + Job())

    private var recordingJob: Job? = null
    private var mediaProjection: MediaProjection? = null
    private var mediaRecorder: MediaRecorder? = null
    private var videoRecordingFile: File? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var internalAudioRecorder: InternalAudioRecorder? = null
    private var inputOpenGlSurface: InputSurface? = null
    private var isDrawAltImage = false

    /** 録画を開始する */
    fun startRecord() {
        recordingJob = scope.launch {
            mediaRecorder = (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) MediaRecorder(context) else MediaRecorder()).apply {
                // 呼び出し順が存在します
                // 音声トラックは録画終了時にやります
                setVideoSource(MediaRecorder.VideoSource.SURFACE)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setVideoEncoder(MediaRecorder.VideoEncoder.H264)
                setVideoEncodingBitRate(6_000_000)
                setVideoFrameRate(60)
                // 解像度、縦動画の場合は、代わりに回転情報を付与する（縦横の解像度はそのまま）
                setVideoSize(VIDEO_WIDTH, VIDEO_HEIGHT)
                // 保存先。
                // sdcard/Android/data/{アプリケーションID} に保存されますが、後で端末の動画フォルダーに移動します
                videoRecordingFile = context.getExternalFilesDir(null)?.resolve("video_track.mp4")
                setOutputFile(videoRecordingFile!!.path)
                prepare()
            }

            mediaProjection = mediaProjectionManager.getMediaProjection(resultCode, resultData)
            // メインスレッドで呼び出す
            withContext(Dispatchers.Main) {
                // 画面録画中のコールバック
                mediaProjection?.registerCallback(object : MediaProjection.Callback() {
                    override fun onCapturedContentResize(width: Int, height: Int) {
                        super.onCapturedContentResize(width, height)
                        // サイズが変化したら呼び出される
                    }

                    override fun onCapturedContentVisibilityChanged(isVisible: Boolean) {
                        super.onCapturedContentVisibilityChanged(isVisible)
                        // 録画中の画面の表示・非表示が切り替わったら呼び出される
                        isDrawAltImage = !isVisible
                    }

                    override fun onStop() {
                        super.onStop()
                        // MediaProjection 終了時
                        // do nothing
                    }
                }, null)
            }
            // OpenGL を経由して、画面共有の映像を MediaRecorder へ渡す
            // スレッド注意
            withContext(openGlRelatedDispatcher) {
                inputOpenGlSurface = InputSurface(mediaRecorder?.surface!!, TextureRenderer())
                inputOpenGlSurface?.makeCurrent()
                inputOpenGlSurface?.createRender(VIDEO_WIDTH, VIDEO_HEIGHT)
                // 単一アプリが画面に写っていないときに描画する、代替画像をセット
                inputOpenGlSurface?.setAltImageTexture(createAltImage())
            }
            // 画面ミラーリング
            virtualDisplay = mediaProjection?.createVirtualDisplay(
                "io.github.takusan23.androidpartialscreeninternalaudiorecorder",
                VIDEO_WIDTH,
                VIDEO_HEIGHT,
                context.resources.configuration.densityDpi,
                DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                inputOpenGlSurface?.drawSurface,
                null,
                null
            )
            // 内部音声収録
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                internalAudioRecorder = InternalAudioRecorder().apply {
                    prepareRecorder(context, mediaProjection!!, AUDIO_SAMPLING_RATE, AUDIO_CHANNEL_COUNT)
                }
            }

            // 画面録画開始
            mediaRecorder?.start()
            // OpenGL と 内部音声の処理を始める
            // 並列で
            listOf(
                launch(openGlRelatedDispatcher) {
                    // OpenGL で画面共有か代替画像のどちらかを描画する
                    while (isActive) {
                        try {
                            if (isDrawAltImage) {
                                inputOpenGlSurface?.drawAltImage()
                                inputOpenGlSurface?.swapBuffers()
                                delay(16) // 60fps が 16ミリ秒 らしいので適当に待つ。多分待たないといけない
                            } else {
                                // 映像フレームが来ていれば OpenGL のテクスチャを更新
                                val isNewFrameAvailable = inputOpenGlSurface?.awaitIsNewFrameAvailable()
                                // 描画する
                                if (isNewFrameAvailable == true) {
                                    inputOpenGlSurface?.updateTexImage()
                                    inputOpenGlSurface?.drawImage()
                                    inputOpenGlSurface?.swapBuffers()
                                }
                            }
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }
                },
                launch {
                    // 内部音声収録開始。
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        internalAudioRecorder?.startRecord()
                    }
                }
            ).joinAll() // 終わるまで一時停止
        }
    }

    /** 録画を終了する */
    suspend fun stopRecord() = withContext(Dispatchers.IO) {
        // 終了を待つ
        recordingJob?.cancelAndJoin()
        // リソース開放をする
        mediaRecorder?.stop()
        mediaRecorder?.release()
        mediaProjection?.stop()
        virtualDisplay?.release()

        // 内部音声収録をしている場合、音声と映像が別れているので、2トラックをまとめた mp4 にする
        val resultFile = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            context.getExternalFilesDir(null)?.resolve("mix_track.mp4")!!.also { mixFile ->
                MediaMuxerTool.mixAvTrack(
                    audioTrackFile = internalAudioRecorder?.audioRecordingFile!!,
                    videoTrackFile = videoRecordingFile!!,
                    resultFile = mixFile
                )
            }
        } else {
            videoRecordingFile!!
        }

        // 端末の動画フォルダーに移動
        MediaStoreTool.copyToVideoFolder(
            context = context,
            file = resultFile,
            fileName = "AndroidPartialScreenInternalAudioRecorder_${System.currentTimeMillis()}.mp4"
        )

        // 要らないのを消す
        videoRecordingFile!!.delete()
        resultFile.delete()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            internalAudioRecorder?.audioRecordingFile!!.delete()
        }
    }

    /** 単一アプリの画面録画時に、指定した単一アプリが画面外に移動した際に代わりに描画する画像を生成する */
    private fun createAltImage(): Bitmap = Bitmap.createBitmap(VIDEO_WIDTH, VIDEO_HEIGHT, Bitmap.Config.ARGB_8888).also { bitmap ->
        val canvas = Canvas(bitmap)
        val paint = Paint().apply {
            color = Color.WHITE
            textSize = 50f
        }

        canvas.drawColor(Color.BLACK)
        canvas.drawText("指定したアプリは今画面に写ってません。", 100f, 100f, paint)
        canvas.drawText("戻ってきたら映像が再開されます。", 100f, 200f, paint)
    }

    companion object {

        /**
         * OpenGL はスレッドでコンテキストを識別するので、OpenGL 関連はこの openGlRelatedDispatcher から呼び出す。
         * どういうことかと言うと、OpenGL は makeCurrent したスレッド以外で、OpenGL の関数を呼び出してはいけない。
         * （makeCurrent したスレッドのみ swapBuffers 等できる）。
         *
         * 独自 Dispatcher を作ることで、処理するスレッドを指定できたりする。
         */
        @OptIn(DelicateCoroutinesApi::class)
        private val openGlRelatedDispatcher = newSingleThreadContext("OpenGLContextRelatedThread")

        private const val VIDEO_WIDTH = 1280
        private const val VIDEO_HEIGHT = 720
        private const val AUDIO_SAMPLING_RATE = 44_100
        private const val AUDIO_CHANNEL_COUNT = 2
    }
}
```

どうでしょうか。  
単一アプリが離れた時は代わりの画像が出てますでしょうか？

<video controls src="https://github.com/takusan23/AndroidPartialScreenInternalAudioRecorder/assets/32033405/d2265d4c-4afc-446d-be76-9a7f89069d4d" width="300px"></video>

ちなみに、最後のフレーム（アプリが画面外に行く前の最後の状態）を写し続けたい場合は、こんな画像を作ったりはしなくて良いはずで、  
画面外にあれば更新しなきゃいいだけのはず。まあ、最後のフレームを再送し続けるにしろ`OpenGL`からは避けれない人生。

```kotlin
// OpenGL で画面共有のフレームを描画する
while (isActive) {
    try {
        // isVisibleCaptureContent は onCapturedContentVisibilityChanged で true だったら true になるフラグ
        if (isVisibleCaptureContent) {
            // 映像フレームが来ていれば OpenGL のテクスチャを更新
            val isNewFrameAvailable = inputOpenGlSurface?.awaitIsNewFrameAvailable()
            // 描画する
            if (isNewFrameAvailable == true) {
                inputOpenGlSurface?.updateTexImage()
                inputOpenGlSurface?.drawImage()
                inputOpenGlSurface?.swapBuffers()
            }
        }
    } catch (e: Exception) {
        e.printStackTrace()
    }
}
```

# おわりに

## ソースコードです！
https://github.com/takusan23/AndroidPartialScreenInternalAudioRecorder

## ぜろみらー も対応しました
単一アプリ共有時に画面外に移動してもちゃんと動きます！  
![Imgur](https://imgur.com/RO0lLNn.png)

ついでに**安定性を向上させました**。んなアプリストアのリリースノートみたいなこと言うなよって言われるので話すと、セグメントの生成がちゃんと時間通りに配信出来るように調整しました。  
記事書き終わったらリリースするので、読む頃にはリリースされてるんじゃないでしょうか？  

https://github.com/takusan23/ZeroMirror/commit/b93cd452c708718b4cf03cad94464b9268d09978

## そういえば
`MediaCodec`だけだと思いますが、指定したミリ秒の間に映像が流れてこないときに（今回みたいに単一アプリ共有で画面外にいる等で？）、  
前回のフレームをエンコーダーに入れるオプションがあります。`MediaFormat.KEY_REPEAT_PREVIOUS_FRAME_AFTER`っていうんですけど。  

ただ、これ`REPEAT`とか定数名に使ってるだけあって映像が流れてこない場合はずっと最後のフレームをエンコーダーに再送するのかと思ってたらそうではないらしく、  
なんか1回だけしか動かないらしい？（`REPEAT`って何なんだ）

https://issuetracker.google.com/issues/171023079

## そのほか
めっちゃ長くなってしまった...すいません  
システムUIが写り込まない画面共有、余計な SystemUI が映らなくなるので、画面録画中に通知が来ても安心！