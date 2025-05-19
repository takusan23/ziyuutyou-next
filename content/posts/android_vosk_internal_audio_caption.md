---
title: Android で Vosk を使って端末内音声の字幕アプリを作る
created_at: 2025-05-19
tags:
- Android
- Kotlin
- MediaProjection
- Vosk
---

どうもこんばんわ。  
ジュエリー・ナイツ・アルカディア -The ends of the world- 攻略しました。  
前作より読みやすいと思った！！今作は戦闘要素控えめに感じました（前作の戦闘&戦闘だと疲れる...）

前作の駆け込みの部分の話！！があった。そっちのミリアちゃんに助けられたのか。。  
輝け、私たちの未来、確かにそうだった。

前作のポイントと言うか要素が出てくるとうれｃ。  
前作、先生が早々に退場しちゃってえ？ってのがここに来てフォーカスがあたったって、おぉ～～って

![すくしょ](https://oekakityou.negitoro.dev/resize/c850b2aa-aa60-46cb-9503-1beb0d4de646.jpg)

ミリアちゃん！！！  
助けに来てくれるところ良すぎた、、、

![すくしょ](https://oekakityou.negitoro.dev/resize/e1e3bece-5bec-4ba5-a4d1-978632549769.jpg)  
キラキラ目

![すくしょ](https://oekakityou.negitoro.dev/resize/bfd14cac-57b6-4e4f-a613-f62667b18130.jpg)

プリちゃん呼びいつの間にか言われなくなって草

![すくしょ](https://oekakityou.negitoro.dev/resize/5916fd83-94b9-413b-8f25-8ab2e8895945.jpg)

![すくしょ](https://oekakityou.negitoro.dev/resize/d33fd7ba-8d86-4ded-9820-fc63b0b76fcd.jpg)

はぐれドラゴンの言い方よ  
ルクリナさんの戦いのやつ、主人公が上手く切り抜けたのすごいと思った、

![すくしょ](https://oekakityou.negitoro.dev/resize/2cbaf3b9-bcd8-47f9-8a93-ad3b1a832dbc.jpg)

![すくしょ](https://oekakityou.negitoro.dev/resize/14b4eb87-01d0-4e89-926b-f304430a3b7a.jpg)

！！！！  
髪型！！かわいい！

![すくしょ](https://oekakityou.negitoro.dev/resize/28e99422-2170-4d27-8898-032851984ee5.jpg)

![すくしょ](https://oekakityou.negitoro.dev/resize/c601bcaa-ffb6-45f1-8491-12496da0ba90.jpg)

！？？！？！？！！！！

![すくしょ](https://oekakityou.negitoro.dev/resize/f016c994-5317-48cf-a3c6-42c95b165305.jpg)

ブチギレビジョンブラッドなんかおもろい  
前作ヒロインの個別もあり！ます！１

![すくしょ](https://oekakityou.negitoro.dev/resize/317dd7b7-a7d0-4841-ba8e-2a4c50f27550.jpg)  
わたし的前作ヒロインの個別 No.1、ルビィちゃん

おすすめ！です、とにかく！かわいい！ので  
戦闘&戦闘だったらどうしよう...って思ってたけどそんな事なかった。

# 本題
`Google Pixel`には端末から再生してる喋ってる声を文字に起こしてくれる（字幕）機能があります。  
![スクショ](https://oekakityou.negitoro.dev/resize/e87ce6dd-8137-44a1-ba67-43f6fb8a9547.png)

どうやら他にも`Galaxy`とかにもあるそうですが、メインで使ってる`Xperia`にはこの機能が**無い**みたいです。。そんな。  

生配信見てるときにあー腹痛が痛いなートイレにスマホ持っていって見るか・・・ってときに  
`Pixel`持ち出したら字幕機能がある。でも間違えて`Xperia`持ち出したら、、、無い！！

どうにか自作出来ないものか・・・

# 端末内の音声を文字起こしするアプリを探してるんだから邪魔しないで
はい。審査中なので通過すれば以下のリンクからダウンロード出来るはずです。  
https://play.google.com/store/apps/details?id=io.github.takusan23.hiroid

![playconsole](https://oekakityou.negitoro.dev/original/6eb7499e-805b-4ff8-8c5a-4057cad8f1d6.png)

![すくしょ](https://oekakityou.negitoro.dev/resize/51fc3b21-80b9-44f2-915d-47c54ba25d5f.png)

# 文字起こし技術
`Android`には昔ながらの文字起こし`SpeechRecognizer API`があります。  
マイクで取った喋り超えを文字に起こしてくれる。しかもオフライン対応、途中の文章（確定していない段階の文字起こし）の取得ができたりと便利。

が、が、が、  
今回やりたいのは**マイクの音声**じゃなくて**端末内で再生してる音声**で文字起こしして欲しい。  

## SpeechRecognizer
`SpeechRecognizer`でマイク以外で入力できないかドキュメント見てみました。

ありました。`EXTRA_AUDIO_SOURCE`。音声`PCM`ファイルの`ParcelFileDescriptor`を渡せる。
https://developer.android.com/reference/android/speech/RecognizerIntent#EXTRA_AUDIO_SOURCE

でも動かない。`onError() 5`で終了してしまう。  
日本語なのがだめなのか、そもそも間違ってるのか、よく分からないけど無理だった。終わり。

```kotlin
// not working !!
val fd = ParcelFileDescriptor.open(context.getExternalFilesDir(null)!!.resolve("pcm").apply { println(path) }, ParcelFileDescriptor.MODE_READ_ONLY)
val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
    putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ja-JP")
    putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "ja-JP")
    putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE, fd)
    putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_ENCODING, AudioFormat.ENCODING_PCM_16BIT)
    putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_CHANNEL_COUNT, 2)
    putExtra(RecognizerIntent.EXTRA_AUDIO_SOURCE_SAMPLING_RATE, 44100)
}
val recognizer = SpeechRecognizer.createSpeechRecognizer(context)
recognizer?.setRecognitionListener(object : RecognitionListener {
    override fun onReadyForSpeech(params: Bundle?) {
        println("onReadyForSpeech")
    }

    override fun onBeginningOfSpeech() {
        println("onBeginningOfSpeech")
    }

    override fun onRmsChanged(rmsdB: Float) {
        println("onRmsChanged")
    }

    override fun onBufferReceived(buffer: ByteArray?) {
        println("onBufferReceived")
    }

    override fun onEndOfSpeech() {
        println("onEndOfSpeech")
    }

    override fun onError(error: Int) {
        println("onError $error")
    }

    override fun onResults(results: Bundle?) {
        println("onResults $results")
    }

    override fun onPartialResults(partialResults: Bundle?) {
        println("onPartialResults $partialResults")
    }

    override fun onEvent(eventType: Int, params: Bundle?) {
        println("onEvent $eventType $params")
    }
})
recognizer.startListening(intent)
```

## Vosk
https://github.com/alphacep/vosk-api

音声認識モデルをダウンロードし読み込ませると、オフラインで文字起こしが出来るらしい。  
なんと**Android**でも動いちゃいます！！！

```kotlin
implementation("net.java.dev.jna:jna:5.15.0@aar")
implementation("com.alphacephei:vosk-android:0.3.47@aar")
```

しかもマイク以外にも`PCM バイト配列`を渡して文字起こし出来るみたいなので、今回はこれを使うことにします。  
端末内の音声を渡すので複雑になってますが、マイクを使うならもっと簡単なはず。

# 作戦
端末内の音声は`MediaProjection`を使うことで取得可能です。  
前書いたので詳しくはそっちを見てもらうことに。`MediaProjection`から未圧縮の音声（`PCM`）を取得し`Vosk`に渡す感じになります。  
https://takusan.negitoro.dev/posts/android_14_media_projection_partial/

また、`Vosk`のモデルはアプリには同梱しないで、後でファイルマネージャーを使って配置させます。  
地味にデカかった、、、のと、自分しか使わないので。

# 環境
端末内の音声が取得できるのが`Android 10`からなので、、、  
新しい`xperia`買いたいです、、、

|                |                                              |
|----------------|----------------------------------------------|
| Android Studio | Android Studio Meerkat Feature Drop 2024.3.2 |
| minSdk         | 29                                           |
| 端末           | Pixel 8 Pro / Xperia 1 V                     |

# 作る
## Vosk を入れる
`app/build.gradle.kts`に足します。  
上2つは`Vosk`、最後のは`Service()`で`LifecycleOwner`が使えるやつです。  
`LifecycleOwner`は`Vosk`とは関係ないのですが、文字起こしした文字を表示する字幕`View`を作るときに使いたいので！！

```kotlin
dependencies {

    // Vosk
    implementation("net.java.dev.jna:jna:5.15.0@aar")
    implementation("com.alphacephei:vosk-android:0.3.47@aar")
    implementation("androidx.lifecycle:lifecycle-service:2.8.7")

    // 以下省略
```

## 必要な権限
端末内の音声は`マイク権限`が必要で、  
端末内の音声を取るための`MediaProjection`をサービスで動かすために`フォアグラウンドサービス権限`を。

```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION" />
```

## 権限を要求
権限よこせってダイアログを出します。  
サービスを開始する処理は`todo`で！

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            HiroidTheme {
                MainScreen()
            }
        }
    }
}

@Composable
private fun MainScreen() {
    val context = LocalContext.current

    // 権限
    val permissionRequest = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { isGranted ->
            if (isGranted) {
                Toast.makeText(context, "権限が付与されました", Toast.LENGTH_SHORT).show()
            }
        }
    )

    // 権限を要求
    LaunchedEffect(key1 = Unit) {
        permissionRequest.launch(android.Manifest.permission.RECORD_AUDIO)
    }

    Scaffold { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding)) {
            Button(onClick = {
                // todo このあとすぐ
            }) { Text("開始") }
            Button(onClick = {
                // todo このあとすぐ
            }) { Text("終了") }
        }
    }
}
```

こうなるはず  
![権限](https://oekakityou.negitoro.dev/resize/0e36ae23-9eda-4230-9d80-84381fddfacd.png)

## サービスを作る
`Kotlin`ファイルを作っても良いんですけど、  
`AndroidManifest`に書き忘れる可能性があるので、スクショのように作る事もできます。名前は`VoskCaptionService.kt`で。

![サービス作る](https://oekakityou.negitoro.dev/resize/52991140-6985-4058-98d3-181b7aa8e798.png)

いや～～`Activity / Fragment`全盛期はこっから作ってましたね、懐かしい。  
レイアウトファイルも作ってくれるし。

話を戻して、サービスを作ったら、`AndroidManifest`を開き、作った`<service>`へ属性を一つ足します。  
以下のように。`android:foregroundServiceType="mediaProjection"`の部分ですね。これでサービスで`MediaProjection`が使えます。

```xml
<service
    android:name=".VoskCaptionService"
    android:enabled="true"
    android:exported="true"
    android:foregroundServiceType="mediaProjection"></service>
```

サービスですが、`LifecycleOwner`付きのサービス`LifecycleService()`を継承するように修正します。  
あとはサービスを開始・終了するユーティリティ関数的なものを作っておきました。  
`companion object { }`のやつですね。

```kotlin
class VoskCaptionService : LifecycleService() {

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)
        // todo この後すぐ！！！
        return START_NOT_STICKY
    }

    companion object {

        // Intent に MediaProjection の結果を入れるのでそのキー
        private const val INTENT_KEY_MEDIA_PROJECTION_RESULT_CODE = "result_code"
        private const val INTENT_KEY_MEDIA_PROJECTION_RESULT_DATA = "result_data"

        /** フォアグラウンドサービスを開始する */
        fun startService(context: Context, resultCode: Int, data: Intent) {
            val intent = Intent(context, VoskCaptionService::class.java).apply {
                // サービスで MediaProjection を開始するのに必要
                putExtra(INTENT_KEY_MEDIA_PROJECTION_RESULT_CODE, resultCode)
                putExtra(INTENT_KEY_MEDIA_PROJECTION_RESULT_DATA, data)
            }
            ContextCompat.startForegroundService(context, intent)
        }

        /** フォアグラウンドサービスを終了する */
        fun stopService(context: Context) {
            val intent = Intent(context, VoskCaptionService::class.java)
            context.stopService(intent)
        }
    }
}
```

## MediaProjection を開始する処理
`MainActivity`で、`MediaProjection`始めますよ～って。  
ボタンを押したときに許可を求めるようにします。

`Activity Result API`、が登場する前は`startActivityForResult`が使われてて、これは`resultCode`や`data`が引数としてあったのですが、  
登場とともに見かけることが無くなりました、、、  
`Activity Result API`の中で`data`や`resultCode`を元に`onResult = { }`の中身をいい感じに作ってくれるようになったので、自分で`data`をパースしたりする必要はなくなりました。

が、今回のように`MediaProjection`のために`resultCode`や`data`が必要という場合は、  
`startActivityForResult`相当の`StartActivityForResult()`を使うと取得できます。

あと`MediaProjection`には選択したアプリのみを画面録画できる（`Android 14`）んですが、  
音声は引き続き**端末全体**になるみたいなので、`createConfigForDefaultDisplay()`を指定して、`選択したアプリのみ`のメニューを無効にします。

```kotlin
// MediaProjection
val mediaProjectionManager = remember { context.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager }
val mediaProjectionRequest = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.StartActivityForResult(),
    onResult = {
        VoskCaptionService.startService(
            context = context,
            resultCode = it.resultCode,
            data = it.data ?: return@rememberLauncherForActivityResult
        )
    }
)

Scaffold { innerPadding ->
    Column(modifier = Modifier.padding(innerPadding)) {
        Button(onClick = {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                mediaProjectionRequest.launch(mediaProjectionManager.createScreenCaptureIntent(MediaProjectionConfig.createConfigForDefaultDisplay()))
            } else {
                mediaProjectionRequest.launch(mediaProjectionManager.createScreenCaptureIntent())
            }
        }) { Text("開始") }
        Button(onClick = {
            VoskCaptionService.stopService(context)
        }) { Text("終了") }
    }
}
```

## Vosk の処理をする関数
冒頭の通り、モデルは自分でダウンロードしてファイルマネージャーを使って配置させようかなって（自分しか使わない）、  
モデルが有るパスを引数に、こんな感じかな。

`Vosk`は部分的に確定した文字を取得することも出来るので、`sealed interface`でどっちかを表現できるように。

```kotlin
/** Vosk を使って文字起こしをする */
class VoskAndroid(private val modelPath: String) {

    private var model: Model? = null
    private var recognizer: Recognizer? = null

    /** モデルを読み込む */
    suspend fun prepare() {
        withContext(Dispatchers.IO) {
            model = Model(modelPath)
            recognizer = Recognizer(model, SAMPLING_RATE.toFloat())
        }
    }

    /** 喋り声の音声（PCM）を入力し、文字起こし結果を取得する */
    suspend fun recognizeFromSpeechPcm(pcmByteArray: ByteArray): VoskResult? {
        val recognizer = recognizer ?: return null

        // 文字起こしする
        val isFullyText = withContext(Dispatchers.Default) {
            recognizer.acceptWaveForm(pcmByteArray, pcmByteArray.size)
        }

        // JSON なのでパースする
        val voskResult = if (isFullyText) {
            val jsonObject = JSONObject(recognizer.result)
            VoskResult.Result(text = jsonObject.getString("text"))
        } else {
            val jsonObject = JSONObject(recognizer.partialResult)
            VoskResult.Partial(partial = jsonObject.getString("partial"))
        }

        // 空文字なら return
        return if (voskResult.isBlank) {
            null
        } else {
            voskResult
        }
    }

    /** 破棄する */
    fun destroy() {
        model?.close()
        recognizer?.close()
    }

    /** [recognizeFromSpeechPcm]の返り値 */
    sealed interface VoskResult {
        val isBlank: Boolean
            get() = when (this) {
                is Partial -> partial.isBlank()
                is Result -> text.isBlank()
            }

        /** 確定した文章 */
        @JvmInline
        value class Result(val text: String) : VoskResult

        /** 部分的に確定した文章 */
        @JvmInline
        value class Partial(val partial: String) : VoskResult
    }

    companion object {
        /** Vosk で受け付けるサンプリングレート */
        const val SAMPLING_RATE = 16000
    }
}
```

## 端末内の音声を録音する関数
詳しくは前書いた`MediaProjection`の記事を読んでもらうとして、  
今回は映像要らない、音声だけなので、関数を一つ作ってそこに集結させます。

関数の返り値は`Flow<ByteArray>`です。`ByteArray`が端末内の音声の`PCM`で、これを`Vosk`にかけます。

サンプリングレートを`Vosk`と合わせる感じで。  
`MediaProjection`がキャンセルされたら`Flow`もキャンセルで！

```kotlin
/** 端末内の音声を MediaProjection を使って録音する */
object InternalAudioTool {

    /** 端末内の音声を録音する */
    @SuppressLint("MissingPermission")
    fun recordInternalAudio(
        context: Context,
        resultCode: Int,
        resultData: Intent
    ) = callbackFlow {
        val mediaProjectionManager = context.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        val bufferSize = AudioRecord.getMinBufferSize(
            VoskAndroid.SAMPLING_RATE,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        )

        // MediaProjection
        val mediaProjection = mediaProjectionManager.getMediaProjection(resultCode, resultData).apply {
            // 画面録画中のコールバック
            registerCallback(object : MediaProjection.Callback() {
                // MediaProjection 終了時
                override fun onStop() {
                    super.onStop()
                    cancel()
                }
            }, null)
        }
        // 内部音声取るのに使う
        val playbackConfig = AudioPlaybackCaptureConfiguration.Builder(mediaProjection).apply {
            addMatchingUsage(AudioAttributes.USAGE_MEDIA)
            addMatchingUsage(AudioAttributes.USAGE_GAME)
            addMatchingUsage(AudioAttributes.USAGE_UNKNOWN)
        }.build()
        val audioFormat = AudioFormat.Builder().apply {
            setEncoding(AudioFormat.ENCODING_PCM_16BIT)
            setSampleRate(VoskAndroid.SAMPLING_RATE)
            setChannelMask(AudioFormat.CHANNEL_IN_MONO)
        }.build()
        val audioRecord = AudioRecord.Builder().apply {
            setAudioPlaybackCaptureConfig(playbackConfig)
            setAudioFormat(audioFormat)
            setBufferSizeInBytes(bufferSize)
        }.build()

        // 開始
        try {
            audioRecord.startRecording()
            while (true) {
                yield()
                val pcmAudio = ByteArray(bufferSize)
                audioRecord.read(pcmAudio, 0, pcmAudio.size)
                trySend(pcmAudio)
            }
        } finally {
            audioRecord.stop()
            audioRecord.release()
            mediaProjection.stop()
        }
    }
}
```

## サービスから呼び出して完成
`VoskAndroid`、`InternalAudioRecorder`をサービスから呼び出すようにして完成です。  
こんな感じで、`Intent`から`MediaProjection`を作成するためのパラメーターをもらって、`InternalAudioRecorder`を呼び、順次`PCM`を`Vosk`にかけて、とりあえずは**println()**しています。

`LifecycleService()`なので、`lifecycleScope.launch { }`が出来ちゃいます。素敵。

あとフォアグラウンドサービスなので、通知を出して上げる必要があります。  
忘れがち

`recordInternalAudio()`が`MediaProjection`終了時に`callbackFlow`を`cancel()`するようにしているので、  
`try-finally`で`stopSelf()`しています。`MediaProjection`の終了でサービスが終了するはず。  
あとサービス自体の終了は`lifecycleScope`がキャンセルされるので、問題ないはず。

```kotlin
class VoskCaptionService : LifecycleService() {

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)

        // フォアグラウンドサービス通知を出す
        val notificationManager = NotificationManagerCompat.from(this)
        if (notificationManager.getNotificationChannel(CHANNEL_ID) == null) {
            val channel = NotificationChannelCompat.Builder(CHANNEL_ID, NotificationManagerCompat.IMPORTANCE_LOW).apply {
                setName("文字起こしサービス実行中")
            }.build()
            notificationManager.createNotificationChannel(channel)
        }
        val notification = NotificationCompat.Builder(this, CHANNEL_ID).apply {
            setContentTitle("文字起こしサービス")
            setContentText("端末内の音声を収集して、文字起こしをしています。")
            setSmallIcon(R.drawable.ic_launcher_foreground)
        }.build()
        ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION)

        if (intent != null) {
            lifecycleScope.launch {
                // モデルを指定して Vosk
                val modelPath = getExternalFilesDir(null)!!.resolve("vosk-model-small-ja-0.22")
                val voskAndroid = VoskAndroid(modelPath.path).apply { prepare() }

                try {
                    withContext(Dispatchers.Default) {
                        InternalAudioTool
                            .recordInternalAudio(
                                context = this@VoskCaptionService,
                                resultCode = intent.getIntExtra(INTENT_KEY_MEDIA_PROJECTION_RESULT_CODE, -1),
                                resultData = IntentCompat.getParcelableExtra(intent, INTENT_KEY_MEDIA_PROJECTION_RESULT_DATA, Intent::class.java)!!
                            )
                            .conflate()
                            .collect { pcm ->
                                val result = voskAndroid.recognizeFromSpeechPcm(pcm) ?: return@collect
                                println(result)
                            }
                    }
                } finally {
                    // recordInternalAudio が MediaProjection 終了でキャンセル例外を投げる
                    voskAndroid.destroy()
                    stopSelf()
                }
            }
        }
        return START_NOT_STICKY
    }

    companion object {

        // 通知周り
        private const val NOTIFICATION_ID = 1234
        private const val CHANNEL_ID = "hiroid_running_service"

        // Intent に MediaProjection の結果を入れるのでそのキー
        private const val INTENT_KEY_MEDIA_PROJECTION_RESULT_CODE = "result_code"
        private const val INTENT_KEY_MEDIA_PROJECTION_RESULT_DATA = "result_data"

        /** フォアグラウンドサービスを開始する */
        fun startService(context: Context, resultCode: Int, data: Intent) {
            val intent = Intent(context, VoskCaptionService::class.java).apply {
                // サービスで MediaProjection を開始するのに必要
                putExtra(INTENT_KEY_MEDIA_PROJECTION_RESULT_CODE, resultCode)
                putExtra(INTENT_KEY_MEDIA_PROJECTION_RESULT_DATA, data)
            }
            ContextCompat.startForegroundService(context, intent)
        }

        /** フォアグラウンドサービスを終了する */
        fun stopService(context: Context) {
            val intent = Intent(context, VoskCaptionService::class.java)
            context.stopService(intent)
        }
    }
}
```

## モデルをダウンロードする
https://alphacephei.com/vosk/models

ここから、日本語の`vosk-model-small-ja-0.22`をダウンロードしてきます。  
出来たら、解凍して、`/storage/emulated/0/Android/data/{アプリケーションID}/files/`に`vosk-model-small-ja-0.22`フォルダーで配置します。

![ファイルマネージャー](https://oekakityou.negitoro.dev/resize/be6b5de5-761c-439c-b619-905ccd3a5cd6.png)

## 使ってみる
起動してみました。`logcat`に流れているはず。  
そこそこいい感じです。！！！

![ようつべ](https://oekakityou.negitoro.dev/resize/8c7f57b0-7bef-47c1-aa68-d100a8d4f723.png)

```plaintext
Partial(partial=まー の 清掃 だ から ねぇ なんか カン 並ぶ に 休日 入る か も しん ない です 平日 だっ て です か いい なぁ と て 舐め て た ん です けど ねぇ)
Partial(partial=まー の 清掃 だ から ねぇ なんか カン 並ぶ に 休日 入る か も しん ない です 平日 だっ て です か いい なぁ と て 舐め て た ん です けど ねぇ)
Result(text=まー の 清掃 だ から ねぇ なんか まー 間 並ぶ に 休日 入る か も しん ない です 平日 だっ て です か いい なぁ と て 舐め て た ん です けど ねぇ)
Partial(partial=動い)
Partial(partial=動い)
Partial(partial=後 いい ん)
```

## 字幕をつける
`logcat`に出してもしょうがないので、何らかの方法で上に字幕を出したいです。  
多分二通りあって、

- ピクチャーインピクチャー
    - お手軽
    - 移動処理、サイズ変更もお任せできる
    - 多分同時に表示できるのは一つだけ
- `WindowManager`で画面の上にオーバーレイする`View`を出す
    - 設定画面に移動して、権限を付与する必要
    - 移動処理、サイズ変更は自前
    - 複数出せる、、はず

ただ、ピクチャーインピクチャーは一つしか出せないはず。  
ピクチャーインピクチャー状態のアプリを文字起こししたい場合の事を考えると、`WindowManager`で作るしか無さそう。  
一つしか出せないピクチャーインピクチャーを、文字起こしした字幕で使ってしまうのはもったいない。

## WindowManager で JetpackCompose を使う
参考にしました、ありがとうございます。  
https://zenn.dev/lanlan_peco/scraps/70dec1df75c425

`Activity/Fragment`と違い、`Service`と`WindowManager#addView + ComposeView`で`Jetpack Compose`をオーバーレイするにはひと手間必要なはず。  
`Jetpack Compose`、ライフサイクルとかを密接に使ってそうだし。

## WindowManager の権限
これが必要です。これは、設定画面に移動して有効にする必要があるタイプの権限で厳しい。  
意地でも`PinP`の`API`を使わせようって。

```xml
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
```

また、設定画面に遷移するボタンを置きました、

```kotlin
Button(onClick = {
    context.startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION))
}) { Text("オーバーレイ権限の設定画面") }
```

ボタンを押したら、利用者は、一覧からアプリを選んでもらって、許可する。

![許可](https://oekakityou.negitoro.dev/resize/cdd4d247-338e-4390-a076-d1f2f8551212.png)

## Service で ComposeView をオーバーレイ表示する
`SavedStateRegistryOwner`とかを実装すれば、`WindowManager`で`ComposeView`を表示できるようです。  
先駆者さんありがとう、

```kotlin
class VoskCaptionService : LifecycleService(), SavedStateRegistryOwner {

    private val savedStateRegistryController = SavedStateRegistryController.create(this)
    override val savedStateRegistry: SavedStateRegistry
        get() = savedStateRegistryController.savedStateRegistry

    private val windowManager by lazy { getSystemService(Context.WINDOW_SERVICE) as WindowManager }
    private val composeView by lazy {
        ComposeView(this).apply {
            setContent {
                Text(text = "ForegroundService + WindowManager + Compose")
            }
        }
    }

    private val params = WindowManager.LayoutParams(
        WindowManager.LayoutParams.WRAP_CONTENT,
        WindowManager.LayoutParams.WRAP_CONTENT,
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
        PixelFormat.TRANSLUCENT
    )

    override fun onCreate() {
        super.onCreate()
        composeView.setViewTreeLifecycleOwner(this)
        composeView.setViewTreeSavedStateRegistryOwner(this)
        savedStateRegistryController.performRestore(null)
        windowManager.addView(composeView, params)
    }

    override fun onDestroy() {
        super.onDestroy()
        windowManager.removeView(composeView)
    }

    // 以下省略...
}
```

これでサービスを起動すると、テキストがでているはず？  
ただ出ているわけじゃなく、ちゃんと`Activity`の上に描画されているはずです。

![オーバーレイ](https://oekakityou.negitoro.dev/resize/1d179319-342d-4dc1-905f-37531b24b3a2.png)

## 字幕を表示
`Vosk`の文字起こし結果を`ComposeView`の`Text()`で表示します。  
見た目も最低限整えます、、、最低限背景色とかは無いと、、、

まずは変換結果を入れておく配列を`mutableStateOf()`で用意します。  
`Compose`は`State<T>`の変更を追跡するので。

`Partial`のときは赤色、`Result`で確定しているときは`primary`の色にしました。

```kotlin
private val voskResultCaptionState = mutableStateOf(emptyList<VoskAndroid.VoskResult>())
private val composeView by lazy {
    ComposeView(this).apply {
        setContent {
            HiroidTheme {
                LazyColumn(
                    modifier = Modifier
                        .background(MaterialTheme.colorScheme.primaryContainer)
                        .size(300.dp)
                ) {
                    // 表示する
                    items(voskResultCaptionState.value) { result ->
                        Text(
                            text = when (result) {
                                is VoskAndroid.VoskResult.Partial -> result.partial
                                is VoskAndroid.VoskResult.Result -> result.text
                            },
                            color = when (result) {
                                is VoskAndroid.VoskResult.Partial -> MaterialTheme.colorScheme.error
                                is VoskAndroid.VoskResult.Result -> MaterialTheme.colorScheme.primary
                            }
                        )
                        HorizontalDivider()
                    }
                }
            }
        }
    }
}
```

あとは`Vosk`の文字起こし結果の部分と繋げます。  
`filterIsInstance()`で`Result`だけにします。一番最初だけは`Partial`も受け入れます。これで部分的に確定した文字を一番上に表示し、確定したものは下に積んでいく事ができます。

```kotlin
InternalAudioTool
    .recordInternalAudio(
        context = this@VoskCaptionService,
        resultCode = intent.getIntExtra(INTENT_KEY_MEDIA_PROJECTION_RESULT_CODE, -1),
        resultData = IntentCompat.getParcelableExtra(intent, INTENT_KEY_MEDIA_PROJECTION_RESULT_DATA, Intent::class.java)!!
    )
    .conflate()
    .collect { pcm ->
        // 文字起こし
        val result = voskAndroid.recognizeFromSpeechPcm(pcm) ?: return@collect
        // 配列に足す
        // Partial は配列に一個あれば良い
        voskResultCaptionState.value = listOf(result) + voskResultCaptionState.value.filterIsInstance<VoskAndroid.VoskResult.Result>()
    }
```

こんな感じになってるはず！！！  
UI がいまいちですが、一番上は部分的に確定した文字が更新されて、確定したら下に積まれていく感じだと思います。

![文字起こしView](https://oekakityou.negitoro.dev/resize/9336ca06-60d2-41db-a849-c8293c97fb1a.png)

## 動かせるようにする
`ComposeView`は目一杯広がっているわけじゃないので、`Compose`の中身を`Offset`でずらすとかは出来ないです。  
`WindowManager`にレイアウトを更新する関数があるので、`ComposeView`と位置を渡すと`ComposeView`自体を動かすことが出来ます。

`ComposeView`直下の`コンポーネント`の`Modifier`に長押し移動コールバックを追加します。  
`detectDragGestures { }`ですね。これで`LayoutParams`の値ずらして、`WindowManager`の関数を呼ぶ。

```kotlin
modifier = Modifier
    .background(MaterialTheme.colorScheme.primaryContainer)
    .size(300.dp)
    .pointerInput(key1 = Unit) {
        detectDragGestures { change, dragAmount ->
            change.consume()
            params.x += dragAmount.x.toInt()
            params.y += dragAmount.y.toInt()
            windowManager.updateViewLayout(this@apply, params)
        }
    }
```

これで動かせるようになったはずです！！

![動かせる](https://oekakityou.negitoro.dev/resize/73ea4bd2-54f4-4d59-bcc9-a33459848021.png)

# 完成
見た目とかはまた今度で、、、

![完成](https://oekakityou.negitoro.dev/resize/f5d9d8f6-4494-43f2-aa2e-d9a7924ec587.png)

# ソースコード
https://github.com/takusan23/Hiroid

# おわりに
デメリットですが、`MediaProjection`を使ってるので実質画面録画してるようなものです、、、  

![デメリット](https://oekakityou.negitoro.dev/resize/ee2a0dae-a1cd-4178-9090-7a6f3b180562.png)

# おわりに2
まじで関係ないけど

![サンダーバード](https://oekakityou.negitoro.dev/resize/7db16631-3d46-4a1c-a816-610d0d1f1df7.jpg)

サンダーバードで思い出した。

`Thunderbird`派でしたか？`Outlook`派でしたか？  
ちなみに私は`Windows XP`に`Becky!`を入れて使ってたはずです。  
受信トレイを受信（で合ってる？）すると左上にある`Becky`のロゴが動いてたのをずっと見てた記憶。  

全然覚えてないけど

ちなみにシェアウェアだってことを高校生くらいのときに知ったんですが、親のライセンスだったのかな（よくわからない）  
窓の杜開いたら懐かし～って  
（ちなみにそこの頃は`まどのしゃ`って呼んでたと思う、`まどのもり`って読めるはずない）