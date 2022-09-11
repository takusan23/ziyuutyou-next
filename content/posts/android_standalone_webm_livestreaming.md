---
title: Android単体でWebMとMPEG-DASHを使ったライブストリーミング
created_at: 2022-09-11
tags:
- Android
- Kotlin
- MediaCodec
- DASH
- JavaScript
---

どうもこんにちは。  
保健室のセンセーと小悪魔な会長 攻略しました。

魅力的な生徒かいちょーさんを攻略できる神ゲーです。  
声がめっちゃ合ってていい！

![Imgur](https://imgur.com/TDO2IL4.png)

；；

![Imgur](https://imgur.com/ru8COek.png)

↓の展開前作と変わってるのかわいい

![Imgur](https://imgur.com/kKdmoCP.png)

![Imgur](https://imgur.com/WZPAADx.png)

~~一緒にお風呂に入るシーンがめっちゃいい！！！かわいい！~~

# 本題
[前回の記事](/posts/android_zero_mirror/) で`Android`の画面をブラウザへミラーリングするアプリを作りました。  
が、これ問題があって、録画した映像を細切れにして`WebSocket`で送信して再生する仕組みなので、どうしても動画を入れ替える際に一瞬黒くなってしまうんですよね。これを直せないか調査しました。

## ライブストリーミングするには
世の中のライブ配信の仕組みを調査。

`HLS`の場合は、コンテナフォーマットに`MPEG2-TS`、`Fragmented mp4`を要求します。  
`MPEG-DASH`の場合は同様に、`MPEG2-TS`、`Fragmented mp4`を要求します、、、が！！  
`WebM`でも初期化セグメント、メディアセグメントをそれぞれ用意できる場合は`MPEG-DASH`で配信できるみたいです！第三の選択肢！？

# MPEG-DASH とは
HLSみたいに動画を細切れにして配信するやつ。  
`HLS`の`m3u8`に当たるマニフェスト？は、`MPEG-DASH`では`xml`で記述されており（マニフェストとか言われてる？）、若干難しい。(HLSよりは複雑になってる)  
ちなみに`iPhone`の`Safari`では使えないので(後述)、iPhoneを対象にしたい場合は`HLS`一択になる。；；  
もっと知りたい場合は `ISO/IEC 23009-1:2022` とかでも調べてください。(それっぽいPDFが手に入る)

## MPEG-DASHのマニフェスト
こいうやつを、`MPEG-DASH`のプレイヤーに渡すと映像を取得して再生してくれます。  
`HLS`と違って複数解像度を一度に記述出来たり、  
ライブ配信の際もマニフェストを更新すること無く！（後述）  
セグメント（映像データ）を連番で取得出来たり、  
（ライブ配信のみ？）映像が利用可能になる時間までも定義出来るのでよく分からん！！！

```xml
<?xml version="1.0" encoding="utf-8"?>
<MPD xmlns="urn:mpeg:dash:schema:mpd:2011" availabilityStartTime="2022-09-09T01:45:50+09:00" maxSegmentDuration="PT3S" minBufferTime="PT3S" type="dynamic" profiles="urn:mpeg:dash:profile:isoff-live:2011,http://dashif.org/guidelines/dash-if-simple">
  <BaseURL>/</BaseURL>
  <Period start="PT0S">
    <AdaptationSet mimeType="video/webm">
      <Role schemeIdUri="urn:mpeg:dash:role:2011" value="main" />
      <!-- duration が更新頻度っぽい -->
      <SegmentTemplate duration="3" initialization="/init.webm" media="/segment$Number$.webm" startNumber="0"/>
      <!-- 音声入れる場合は codecs="vp9,opus" -->
      <Representation id="default" codecs="vp9,opus"/>
    </AdaptationSet>
  </Period>
</MPD>
```

よく分からん...、無駄な事してるかもしれない。  
誰か解説よろ...

- type="dynamic"
    - MPEG-DASHがライブ配信モードになるはず
- availabilityStartTime
    - 映像が利用可能になる時間です
    - ISO 8601 で記述する
    - ライブ配信モードのみ利用出来る
- maxSegmentDuration / minBufferTime
    - わからん...
- mimeType
    - `Fragmented MP4`だったら`video/mp4`とかだと思います
- duration
    - 多分映像データの長さです
- initialization
    - 初期化セグメントです（WebMの部分で話す）
    - デコーダーを起動するための値が入ってます
- media
    - メディアセグメントです（WebMの部分で話す）
    - 映像データが入ってます
- startNumber
    - 後述
- codecs
    - 映像と音声のコーデックを指定します
    - 音声がない場合は映像コーデックだけ指定すればいいと思います

## media="/segment$Number$.webm" ← $Number$ って何？
テンプレート構文みたいなやつ。リクエストの際は`/segment1.webm`、`/segment2.webm`みたいな感じに展開される。  
`Number`がリクエストの度にインクリメントされるので、マニフェストを更新すること無くライブ配信を提供できます！（HLSの場合は定期的にプレイリストを更新しに行ってると思う...？）

他にも`$RepresentationID$`とか`$Bandwidth$`とかの変数もあります。

# WebM とは
映像コーデックの`VP8`/`VP9`、音声コーデックの`Opus`などを保存するコンテナフォーマット。  
WebMは`Matroska`のサブセットなので`Matroska`を調べよう  

エラー耐性があるとかなんとかって書いてあったけどエンコードされたデータを`Cluster`単位で保存してるからなんでしょうかね？

### 番外編 コンテナフォーマット / コーデック
`mp4`は実はコンテナフォーマットの一つなのです。  
コンテナフォーマットはエンコード(圧縮)された映像と音声を一つのファイルにするためのフォーマットで、エンコーダーの種類ではないのですね。  
(コンテナに保存することをマルチプレクサとか言ったりするっぽい)  
`mp4`、`MPEG2-TS`、`WebM`、`mkv`などが仲間です。

じゃあコーデックは何だと言う話ですが、エンコード（圧縮）の種類です。映像なら`H.264 (AVC)`、音声なら`AAC`が主に使われていると思います。  
`H.265 (HEVC)`、`VP8`、`VP9`、`ProRes`（？）、`Opus`、`Vorbis`などが仲間です。

複雑ですね、、、でもなぜか`ffmpeg`では利用者の需要を完全に理解して変換してくれます。不思議

わかりやすい記事がありました：
https://aviutl.info/ko-dekku-konntena/

## WebM を MPEG-DASH で配信するためには

参考になりました、ありがとうございます！！！
- https://www.slideshare.net/mganeko/media-recorder-and-webm
- https://qiita.com/tomoyukilabs/items/57ba8a982ab372611669

一つになった`WebM`ファイルから、`初期化セグメント`と`メディアセグメント`を分離する必要があります。  

WebMの最初の方に入っているデータが**初期化セグメント**になります。  
多分これはデコーダーが起動するためのパラメータ（動画の幅とか）で、一度だけ必要です。  

**メディアセグメント**はそのまま、エンコードされたデータが格納されています。  
（実際にはエンコードされたデータが音声なのか映像なのかを判別するための値なんかも入ってます）

ちなみに`WebM`的に言うと、初期化セグメントは`Header`から`Tracks`まで？。メディアセグメントは`Cluster`とか言われてる部分です？  

実際に`WebM`をバイナリエディタで開いてどこまでを指しているのかというと、最初の`Cluster`が始まる前までが初期化セグメントになるはずです。（雑）  

![Imgur](https://imgur.com/ICMxT2U.png)

`Cluster`の開始タグが`0x1F 0x43 0xB6 0x75`なので、多分こんな感じに分離できると思う。多分もっといい実装方法があるだろうけど...

```kotlin
val readRecordFile = recordFile.readBytes()
// 初期化セグメントの範囲を探す
// きれいな実装じゃない...
var initSegmentLength = -1
for (i in readRecordFile.indices) {
    if (
        readRecordFile[i] == 0x1F.toByte()
        && readRecordFile[i + 1] == 0x43.toByte()
        && readRecordFile[i + 2] == 0xB6.toByte()
        && readRecordFile[i + 3] == 0x75.toByte()
    ) {
        initSegmentLength = i
        break
    }
}
if (initSegmentLength == -1) {
    return
}
// 初期化セグメント
val initSegmentBytes = readRecordFile.copyOfRange(0, initSegmentLength)
```

# Androidで実現可能なのか
- WebM
    - `MediaMuxer`は対応してる！
        - ただ定期的にファイルを切り替える機能は流石にないので、書き込み中のファイルからコピーして細切れにしていくしかなさそう？ 
        - `JavaScript`にある`MediaRecorder#start`みたいな間隔で生成する機能はない（そのうちJavaScriptで画面録画してみた記事を書くと思う）
    - コーデックも対応してる！
        - Opus ← エンコーダーある
        - VP8 / VP9 ← エンコーダーある

いけそう！

# 実際に作ってみる
ここから本題です。 
端折りながら作っていきます。  

## 環境

| なまえ  | あたい                              |
|---------|-------------------------------------|
| Android | 12                                  |
| 実機    | Pixel 3 XL                          |
| 言語    | Kotlin (コルーチンも使っていきます) |

### ライブラリ
使うライブラリ集

| なまえ             | なぜ                                                                                                                    |
|--------------------|-------------------------------------------------------------------------------------------------------------------------|
| Ktor               | ライブ配信画面（index.html）と、ライブストリーミングに必要なファイルをホスティングするために使います。Androidでも動く！ |
| androidx.lifecycle | コルーチン使いたいので                                                                                                  |

## AndroidManifest.xml
今回はカメラ映像とマイクをライブ配信に使うので権限を書きます。  
忘れがちなインターネット権限も

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

## build.gradle
`Ktor (Webサーバー)`と`lifecycle-runtime-ktx`を追加します。  
あと`Ktor`を入れたせいでエラーが出るので治すのと、`ViewBinding`を有効にします。  

後述しますが、`CameraX` は使いません；；（正直プレビューView使いたかった）  
よく分からんけど今回のようなことをする場合 `Camera 2` より多分難しくなる。

```gradle
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    compileSdk 33

    defaultConfig {
        applicationId "io.github.takusan23.testwebmlivepublish"
        minSdk 21
        targetSdk 33
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    buildFeatures {
        viewBinding true
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = '1.8'
    }
    packagingOptions {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
            // Ktorのせいでエラー出るので
            excludes += "META-INF/INDEX.LIST"
            excludes += "META-INF/io.netty.versions.properties"
        }
    }
}

dependencies {

    // Ktor Webサーバー
    implementation("io.ktor:ktor-server-core:2.0.0")
    implementation("io.ktor:ktor-server-netty:2.0.0")

    implementation "androidx.lifecycle:lifecycle-runtime-ktx:2.4.0"

    implementation 'androidx.core:core-ktx:1.7.0'
    implementation 'androidx.appcompat:appcompat:1.5.0'
    implementation 'com.google.android.material:material:1.6.1'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.3'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.4.0'
}
```

# activity_main.xml
映像をプレビューする`SurfaceView`と配信開始、停止ボタンを置きました。  
`SurfaceView`の代わりに`TextureView`でもいいとは思いますが、電力消費とかの面から`SurfaceView`を推奨してるそうな。  
(ExoPlayerですが)：https://exoplayer.dev/battery-consumption.html#video-playback

（Viewを変形させたい場合は`TextureView`一択になると思います、OpenGLとかできれば話は別かも）

![Imgur](https://imgur.com/0d1xt3w.png)

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <SurfaceView
        android:id="@+id/preview_surface_view"
        android:layout_width="0dp"
        android:layout_height="0dp"
        app:layout_constraintBottom_toTopOf="@+id/start_button"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <Button
        android:id="@+id/start_button"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="配信開始"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent" />

    <Button
        android:id="@+id/stop_button"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="配信停止"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />
</androidx.constraintlayout.widget.ConstraintLayout>
```

# MainActivity.kt

## 権限を貰う処理
`Activity Result API`でスッキリかけるようになりましたね。

```kotlin
class MainActivity : AppCompatActivity() {

    /** 権限リクエストする */
    private val permissionRequester = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { result ->
        if (result.all { it.value }) {
            setupAll()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // カメラとマイク権限がある場合は準備する
        if (ActivityCompat.checkSelfPermission(this, android.Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
            && ActivityCompat.checkSelfPermission(this, android.Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED
        ) {
            setupAll()
        } else {
            // 権限を求める
            permissionRequester.launch(arrayOf(android.Manifest.permission.CAMERA, android.Manifest.permission.RECORD_AUDIO))
        }
    }

    /** セットアップを行う */
    private fun setupAll() {
        // カメラの用意など
    }

}
```

## 定数
はい

```kotlin
class MainActivity : AppCompatActivity() {

    // 省略

    companion object {

        /** 生成間隔 */
        private const val SEGMENT_INTERVAL_MS = 3_000L

        /** 初期化セグメントの名前 */
        private const val INIT_SEGMENT_FILENAME = "init.webm"

        /** セグメントファイルのプレフィックス */
        private const val SEGMENT_FILENAME_PREFIX = "segment"

        /** サンプリングレート */
        private const val SAMPLE_RATE = 48_000
    }

}
```

## カメラのプレビューを作る
ここは`Camera 2 API`のサンプルコードをそのまま使えばいいと思います。  
よくわからん、、、`Surface`二回も指定しないとだめなの？

### ViewBinding と カメラ

```kotlin
class MainActivity : AppCompatActivity() {

    /** ViewBinding */
    private val viewBinding by lazy { ActivityMainBinding.inflate(layoutInflater) }

    /** カメラ */
    private val cameraManager by lazy { getSystemService(Context.CAMERA_SERVICE) as CameraManager }
    private var cameraDevice: CameraDevice? = null
    private val cameraExecutor by lazy { Executors.newSingleThreadExecutor() }

    // 省略

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(viewBinding.root) // ここ変えるの忘れずに

    // 省略
```

### カメラの用意。プレビュー出来るまで
コールバック地獄になるんですが、コルーチンのおかげでちょっと楽になります。  
これでプレビューされるはず、**アスペクト比がおかしいのですが**多分これを直すためにはかなりの努力が必要なのでやりません。（！？）  
`Surface`を二回も指定しないといけないんですね。`Camera 2 API`大変。

エンコーダーもついでに用意したいのですが、大変なので後回しにします。

```kotlin
class MainActivity : AppCompatActivity() {

    /** セットアップを行う */
    private fun setupAll() {
        // カメラの用意など
        setupCameraAndEncoder()
    }

    /** プレビューとエンコーダーを用意する */
    private fun setupCameraAndEncoder() {
        // コールバック関数を回避するためにコルーチンを活用していく
        lifecycleScope.launch {
            val holder = viewBinding.previewSurfaceView.holder
            val cameraDevice = suspendOpenCamera()
            this@MainActivity.cameraDevice = cameraDevice

            // TODO エンコーダーを起動する

            // 出力先Surface
            val outputSurfaceList = listOf(holder.surface)
            // カメラの設定をする
            val captureRequest = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_RECORD).apply {
                outputSurfaceList.forEach {
                    addTarget(it)
                }
            }.build()

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val outputList = buildList {
                    outputSurfaceList.forEach {
                        add(OutputConfiguration(it))
                    }
                }
                SessionConfiguration(SessionConfiguration.SESSION_REGULAR, outputList, cameraExecutor, object : CameraCaptureSession.StateCallback() {
                    override fun onConfigured(captureSession: CameraCaptureSession) {
                        captureSession.setRepeatingRequest(captureRequest, null, null)
                    }
                    override fun onConfigureFailed(p0: CameraCaptureSession) {

                    }
                }).apply { cameraDevice.createCaptureSession(this) }
            } else {
                cameraDevice.createCaptureSession(outputSurfaceList, object : CameraCaptureSession.StateCallback() {
                    override fun onConfigured(captureSession: CameraCaptureSession) {
                        captureSession.setRepeatingRequest(captureRequest, null, null)
                    }
                    override fun onConfigureFailed(p0: CameraCaptureSession) {

                    }
                }, null)
            }
        }
    }

    /** カメラを取得する、コールバックが呼ばれるまで一時停止する */
    @SuppressLint("MissingPermission")
    private suspend fun suspendOpenCamera() = suspendCoroutine<CameraDevice> {
        // 多分外カメラ
        val cameraId = cameraManager.cameraIdList[0]
        cameraManager.openCamera(cameraId, object : CameraDevice.StateCallback() {
            override fun onOpened(camera: CameraDevice) {
                it.resume(camera)
            }
            override fun onDisconnected(camera: CameraDevice) {

            }
            override fun onError(camera: CameraDevice, p1: Int) {

            }
        }, null)
    }
```

### マイクの用意
これもエンコーダー面倒なのでそれ以外を先に書きます。  

```kotlin
class MainActivity : AppCompatActivity() {

    /** マイク */
    private lateinit var audioRecord: AudioRecord

    // 省略

    /** セットアップを行う */
    private fun setupAll() {
        // カメラの用意など
        setupCameraAndEncoder()
        setupMicAndEncoder()
    }

    /** マイクとエンコーダーを用意 */
    @SuppressLint("MissingPermission")
    private fun setupMicAndEncoder() {
        // コールバック関数を回避するためにコルーチンを活用していく
        lifecycleScope.launch {

            // TODO エンコーダーを用意

            // 音声レコーダー起動
            val bufferSizeInBytes = AudioRecord.getMinBufferSize(SAMPLE_RATE, AudioFormat.CHANNEL_IN_STEREO, AudioFormat.ENCODING_PCM_16BIT)
            val audioFormat = AudioFormat.Builder().apply {
                setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                setSampleRate(SAMPLE_RATE)
                setChannelMask(AudioFormat.CHANNEL_IN_STEREO)
            }.build()
            audioRecord = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                AudioRecord.Builder().apply {
                    setAudioFormat(audioFormat)
                    setAudioSource(MediaRecorder.AudioSource.MIC)
                    setBufferSizeInBytes(bufferSizeInBytes)
                }.build()
            } else {
                AudioRecord(MediaRecorder.AudioSource.MIC, SAMPLE_RATE, AudioFormat.CHANNEL_IN_STEREO, AudioFormat.ENCODING_PCM_16BIT, bufferSizeInBytes)
            }.apply { startRecording() }

            // TODO エンコーダーを起動
        }
    }
```

# エンコーダーの処理を書く ( MediaCodec )
音声と映像をエンコードする（MediaCodecを使いやすくしただけ）コードですが、**コピペしてください！！！**  
ちなみに`ぜろみらー`からコピーしてきたものです。  
https://github.com/takusan23/ZeroMirror/tree/master/app/src/main/java/io/github/takusan23/zeromirror/media

## 音声エンコーダー
音声が高くなるのはサンプリングレートが`AudioRecord`と`MediaCodec`で一致してないからでした？  
音声の場合はバッファーをそのままエンコーダーへ渡すことで、エンコードされたバッファーを返してくれます。

詳しい動作はコメントを見てください。

```kotlin
/**
 * 音声エンコーダー
 * MediaCodecを使いやすくしただけ
 */
class AudioEncoder {

    /** MediaCodec エンコーダー */
    private var mediaCodec: MediaCodec? = null

    /**
     * エンコーダーを初期化する
     *
     * @param sampleRate サンプリングレート
     * @param channelCount チャンネル数
     * @param bitRate ビットレート
     */
    fun prepareEncoder(
        sampleRate: Int = 48_000,
        channelCount: Int = 2,
        bitRate: Int = 192_000,
    ) {
        val audioEncodeFormat = MediaFormat.createAudioFormat(MediaFormat.MIMETYPE_AUDIO_OPUS, sampleRate, channelCount).apply {
            setInteger(MediaFormat.KEY_AAC_PROFILE, MediaCodecInfo.CodecProfileLevel.AACObjectLC)
            setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
        }
        // エンコーダー用意
        mediaCodec = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_AUDIO_OPUS).apply {
            configure(audioEncodeFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        }
    }

    /**
     * エンコーダーを開始する。同期モードを使うのでコルーチンを使います（スレッドでも良いけど）
     *
     * @param onRecordInput ByteArrayを渡すので、音声データを入れて、サイズを返してください
     * @param onOutputBufferAvailable エンコードされたデータが流れてきます
     * @param onOutputFormatAvailable エンコード後のMediaFormatが入手できる
     */
    suspend fun startAudioEncode(
        onRecordInput: (ByteArray) -> Int,
        onOutputBufferAvailable: (ByteBuffer, MediaCodec.BufferInfo) -> Unit,
        onOutputFormatAvailable: (MediaFormat) -> Unit,
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
                        // 多分 Surfaceで映像を入力した場合、presentationTimeUs は nanoTime を 1000 で割った値っぽい
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
        }
    }

    /** リソースを開放する */
    fun release() {
        try {
            mediaCodec?.stop()
            mediaCodec?.release()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    companion object {

        /** MediaCodec タイムアウト */
        private const val TIMEOUT_US = 10_000L

    }
}
```
## 映像エンコーダー
映像の場合は、`Surface`を経由して映像を渡します。  
`Camera X`を使わない理由がここにあります。`MediaCodec`へ`Surface`経由で映像を渡したかったからです。  
なんか`Camera X`だと`Surface`で映像データを取得できないっぽい。`Camera X`には代わりに画像を取得する機能があるみたい。  
画像の場合だと`Bitmap`を`MediaCodec`のバッファーへ入れるか（やったこと無いけど出来なくもないらしい？）、  
`MediaCodec`の`Surface`へ`Bitmap`を描画する？  
（ただし`MediaCodec#createInputSurface()`は`SurfaceView`と違って多分`Surface#lockCanvas()`が使えないため、`OpenGL ES`を使う必要がありこれもくっっそ面倒）

なので映像データを`Surface`経由で貰える、`Camera 2 API`を使う必要があったのですね。  
こちらも詳しい動作はコメントを見てください。

```kotlin
/**
 * 動画エンコーダー
 * MediaCodecを使いやすくしただけ
 *
 * VP9の場合は画面解像度が厳しい？
 * 1920x1080 1280x720 とかなら問題ないけど、ディスプレイの画面解像度を入れると例外を吐く？
 */
class VideoEncoder {

    /** MediaCodec エンコーダー */
    private var mediaCodec: MediaCodec? = null

    /** MediaCodecの入力Surface */
    private var inputSurface: Surface? = null

    /**
     * エンコーダーを初期化する
     *
     * @param videoWidth 動画の幅
     * @param videoHeight 動画の高さ
     * @param bitRate ビットレート
     * @param frameRate フレームレート
     * @param iFrameInterval Iフレーム
     */
    fun prepareEncoder(
        videoWidth: Int,
        videoHeight: Int,
        bitRate: Int,
        frameRate: Int,
        iFrameInterval: Int = 1,
    ) {
        // コーデックの選択
        // もし重くなるようなら、コーデックを VP8 にダウングレードしてもいいかもしれない
        // その場合、MPEG-DASHのマニフェストでもコーデックを vp8 にする必要あり
        val videoEncodeFormat = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_VP9, videoWidth, videoHeight).apply {
            setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
            setInteger(MediaFormat.KEY_FRAME_RATE, frameRate)
            setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, iFrameInterval)
            setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
        }
        // エンコーダー用意
        mediaCodec = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_VP9).apply {
            configure(videoEncodeFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        }
    }

    /**
     * 入力で使うSurfaceを用意する。
     * [prepareEncoder]の後に呼ばないとだめ。
     *
     * @return 入力で使うSurface
     */
    fun createInputSurface() = mediaCodec!!.createInputSurface().apply {
        inputSurface = this
    }

    /**
     * エンコーダーを開始する。同期モードを使うのでコルーチンを使います（スレッドでも良いけど）
     *
     * @param onOutputBufferAvailable エンコードされたデータが流れてきます
     * @param onOutputFormatAvailable エンコード後のMediaFormatが入手できる
     */
    suspend fun startVideoEncode(
        onOutputBufferAvailable: (ByteBuffer, MediaCodec.BufferInfo) -> Unit,
        onOutputFormatAvailable: (MediaFormat) -> Unit,
    ) = withContext(Dispatchers.Default) {
        // 多分使い回す
        val bufferInfo = MediaCodec.BufferInfo()
        mediaCodec?.start()

        try {
            while (isActive) {
                // もし -1 が返ってくれば configure() が間違ってる
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
                    // 多分映像データより先に呼ばれる
                    // MediaMuxerへ映像トラックを追加するのはこのタイミングで行う
                    // このタイミングでやると固有のパラメーターがセットされたMediaFormatが手に入る(csd-0 とか)
                    // 映像がぶっ壊れている場合（緑で塗りつぶされてるとか）は多分このあたりが怪しい
                    onOutputFormatAvailable(mediaCodec!!.outputFormat)
                }
            }
        } catch (e: Exception) {
            // なぜか例外を吐くので
            // java.lang.IllegalStateException
            // at android.media.MediaCodec.native_dequeueOutputBuffer(Native Method)
            e.printStackTrace()
        }
    }

    /** リソースを開放する */
    fun release() {
        try {
            inputSurface?.release()
            mediaCodec?.stop()
            mediaCodec?.release()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    companion object {

        /** MediaCodec タイムアウト */
        private const val TIMEOUT_US = 10_000L

    }
}
```

## エンコーダーを組み込む
`MainActivity.kt`に書いたカメラとマイクのエンコーダーの部分を埋めます

```kotlin
class MainActivity : AppCompatActivity() {

    /** 動画エンコーダー */
    private val videoEncoder = VideoEncoder()

    /** 音声エンコーダー */
    private val audioEncoder = AudioEncoder()

    // 省略

    /** プレビューとエンコーダーを用意する */
    private fun setupCameraAndEncoder() {
        // コールバック関数を回避するためにコルーチンを活用していく
        lifecycleScope.launch {
            val holder = viewBinding.previewSurfaceView.holder
            val cameraDevice = suspendOpenCamera()
            this@MainActivity.cameraDevice = cameraDevice

            // エンコーダーを初期化する
            videoEncoder.prepareEncoder(
                videoWidth = 1280,
                videoHeight = 720,
                bitRate = 1_000_000,
                frameRate = 30,
            )
            // Camera2 API から MediaCodec へ映像を渡すための Surface
            val inputSurface = videoEncoder.createInputSurface()
            
            // エンコーダーを起動する、動作中は一時停止するので別コルーチンを起動
            launch {
                videoEncoder.startVideoEncode(
                    onOutputBufferAvailable = { byteBuffer, bufferInfo ->
                        // TODO WebM保存処理
                    },
                    onOutputFormatAvailable = { mediaFormat ->
                        // TODO WebM保存処理
                    }
                )
            }

            // 出力先Surface、プレビューとエンコーダー
            val outputSurfaceList = listOf(holder.surface, inputSurface)
            // カメラの設定をする
            val captureRequest = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_RECORD).apply {
                outputSurfaceList.forEach {
                    addTarget(it)
                }
            }.build()

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val outputList = buildList {
                    outputSurfaceList.forEach {
                        add(OutputConfiguration(it))
                    }
                }
                SessionConfiguration(SessionConfiguration.SESSION_REGULAR, outputList, cameraExecutor, object : CameraCaptureSession.StateCallback() {
                    override fun onConfigured(captureSession: CameraCaptureSession) {
                        captureSession.setRepeatingRequest(captureRequest, null, null)
                    }

                    override fun onConfigureFailed(p0: CameraCaptureSession) {

                    }
                }).apply { cameraDevice.createCaptureSession(this) }
            } else {
                cameraDevice.createCaptureSession(outputSurfaceList, object : CameraCaptureSession.StateCallback() {
                    override fun onConfigured(captureSession: CameraCaptureSession) {
                        captureSession.setRepeatingRequest(captureRequest, null, null)
                    }

                    override fun onConfigureFailed(p0: CameraCaptureSession) {

                    }
                }, null)
            }
        }
    }

    /** マイクとエンコーダーを用意 */
    @SuppressLint("MissingPermission")
    private fun setupMicAndEncoder() {
        // コールバック関数を回避するためにコルーチンを活用していく
        lifecycleScope.launch {

            // エンコーダーを初期化する
            audioEncoder.prepareEncoder(
                sampleRate = SAMPLE_RATE,
                channelCount = 2,
                bitRate = 192_000,
            )

            // 音声レコーダー起動
            val bufferSizeInBytes = AudioRecord.getMinBufferSize(SAMPLE_RATE, AudioFormat.CHANNEL_IN_STEREO, AudioFormat.ENCODING_PCM_16BIT)
            val audioFormat = AudioFormat.Builder().apply {
                setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                setSampleRate(SAMPLE_RATE)
                setChannelMask(AudioFormat.CHANNEL_IN_STEREO)
            }.build()
            audioRecord = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                AudioRecord.Builder().apply {
                    setAudioFormat(audioFormat)
                    setAudioSource(MediaRecorder.AudioSource.MIC)
                    setBufferSizeInBytes(bufferSizeInBytes)
                }.build()
            } else {
                AudioRecord(MediaRecorder.AudioSource.MIC, SAMPLE_RATE, AudioFormat.CHANNEL_IN_STEREO, AudioFormat.ENCODING_PCM_16BIT, bufferSizeInBytes)
            }.apply { startRecording() }

            // エンコーダーを起動する、動作中は一時停止するので別コルーチンを起動
            launch {
                // エンコードする
                audioEncoder.startAudioEncode(
                    onRecordInput = { bytes ->
                        // PCM音声を取り出しエンコする
                        audioRecord.read(bytes, 0, bytes.size)
                    },
                    onOutputBufferAvailable = { byteBuffer, bufferInfo ->
                        // TODO WebM保存処理
                    },
                    onOutputFormatAvailable = { mediaFormat ->
                        // TODO WebM保存処理
                    }
                )
            }
        }
    }
}
```

# WebMに保存しつつ、MPEG-DASHで配信可能なファイルを生成する
`MediaMuxer`に保存しつつ、`MPEG-DASH`で配信できる`webm`も作っていくコードを書きます。

## MediaMuxerにはファイルを分割する機能はないので...
`MediaMuxer`で書き込み中のファイルからコピーします！（多分よくない）  
`WebM`を作る処理（マルチプレクサ）とか絶対大変だと思う....

```kotlin
// たとえば...
val tempFile = File("ファイルパス")
val mediaMuxer = MediaMuxer(tempFile.path, MediaMuxer.OutputFormat.MUXER_OUTPUT_WEBM)
val inputStream = tempFile.inputStream()

// よしなにコピーする
val segmentFile = File("segment.webm")
// 前回までの範囲をスキップして切り出す
inputStream.also { stream ->
    val byteArray = ByteArray(stream.available())
    stream.read(byteArray)
    segmentFile.writeBytes(byteArray)
}
```

書き込み中のファイルから更に定期的にファイルをコピーして保存するため、二倍ストレージを使います。  
どうにかしたい


## 連番なファイルを作ってくれるクラス
`segment1.webm`、`segment2.webm`.... みたいに連番でファイルを作ってくれるクラスを作ります。  
ファイル操作、なんとなく`suspend関数`にしている。  
`++`演算子、`swift`だと無いらしいですね？

```kotlin
/**
 * MPEG-DASH 用ファイル管理クラス
 *
 * - [parentFolder]
 *  - public
 *      - 生成した動画を入れるフォルダ、クライアントに返してる動画です
 *  - temp
 *      - 一時的に保存する必要のあるファイル
 *
 * @param parentFolder 保存先
 * @param prefixName ファイルの先頭につける文字列
 */
class DashContentManager(
    private val parentFolder: File,
    private val prefixName: String,
) {
    /** 作るたびにインクリメントする */
    private var count = 0

    /** 一時作業用フォルダ */
    private val tempFolder = File(parentFolder, TEMP_FOLDER_NAME).apply { mkdir() }

    /** 完成品を公開するフォルダ */
    val outputFolder = File(parentFolder, OUTPUT_VIDEO_FOLDER_NAME).apply { mkdir() }

    /**
     * 連番なファイル名になった[File]を作成する
     *
     * @return [File]
     */
    suspend fun createIncrementFile() = withContext(Dispatchers.IO) {
        File(outputFolder, "$prefixName${count++}.$WEBM_EXTENSION").apply {
            createNewFile()
        }
    }

    /**
     * ファイルを生成する関数。
     * ファイル名変更が出来る以外は [createIncrementFile] と同じ。
     *
     * @param fileName ファイル名
     * @return [File]
     */
    suspend fun createFile(fileName: String) = withContext(Dispatchers.IO) {
        File(outputFolder, fileName).apply {
            createNewFile()
        }
    }

    /**
     * 一時ファイルを生成する関数
     *
     * @param fileName ファイル名
     * @return [File]
     */
    suspend fun createTempFile(fileName: String) = withContext(Dispatchers.IO) {
        File(tempFolder, fileName).apply {
            createNewFile()
        }
    }

    /** 生成したファイルを削除する */
    suspend fun deleteGenerateFile() = withContext(Dispatchers.IO) {
        tempFolder.listFiles()?.forEach { it.delete() }
        outputFolder.listFiles()?.forEach { it.delete() }
    }

    companion object {
        /** 拡張子 */
        private const val WEBM_EXTENSION = "webm"

        /** 完成品の動画が入るフォルダの名前 */
        private const val OUTPUT_VIDEO_FOLDER_NAME = "dist"

        /** 一時作業用フォルダ */
        private const val TEMP_FOLDER_NAME = "temp"
    }

}
```

## セグメントファイル生成クラス
`WebM`にエンコードした`VP9`、`Opus`を書き込みつつ、セグメントファイルを作成できるクラスを書きます。  
`MediaMuxer`に書き込んでいるファイルから部分的にコピーすることで、`MPEG-DASH`で再生するためのセグメントファイルを生成します。  

```kotlin
/**
 * MPEG-DASHで配信する WebM を作成する。
 * エンコードされたデータをファイル（コンテナ）に書き込む。
 *
 * @param tempFile 一時ファイル。
 */
class DashContainerWriter(private val tempFile: File) {

    /** コンテナへ書き込むやつ */
    private var mediaMuxer: MediaMuxer? = null

    /** オーディオトラックの番号 */
    private var audioTrackIndex = INVALID_INDEX_NUMBER

    /** 映像トラックの番号 */
    private var videoTrackIndex = INVALID_INDEX_NUMBER

    /** オーディオのフォーマット */
    private var audioFormat: MediaFormat? = null

    /** 映像のフォーマット */
    private var videoFormat: MediaFormat? = null

    /** 書き込み可能かどうか */
    private var isWritable = true

    /** MediaMuxerで書き込んでいる動画ファイルの [InputStream]、その都度開くより良さそう */
    private var inputStream: InputStream? = null

    /** MediaMuxer 起動中の場合はtrue */
    var isRunning = false
        private set

    /** 初期化セグメントを作成したか */
    var isGeneratedInitSegment = false
        private set

    /** コンテナフォーマット / MediaMuxer を生成する */
    suspend fun createContainerFile() = withContext(Dispatchers.IO) {
        tempFile.delete()
        isGeneratedInitSegment = false
        mediaMuxer = MediaMuxer(tempFile.path, MediaMuxer.OutputFormat.MUXER_OUTPUT_WEBM)
        inputStream = tempFile.inputStream()
        // 再生成する場合はパラメーター持っているので入れておく
        videoFormat?.also { setVideoTrack(it) }
        audioFormat?.also { setAudioTrack(it) }
    }

    /**
     * MediaMuxerで書き込み中のファイルから、WebMの初期化セグメントの部分を切り出す。
     * 初期化セグメントの位置は Clusterタグ が始まる前まで
     *
     * @param filePath 書き込み先ファイルのファイルパス
     * @return ファイル
     */
    suspend fun sliceInitSegmentFile(filePath: String) = withContext(Dispatchers.IO) {
        File(filePath).also { file ->
            // 書き込まれないようにしておく
            isWritable = false
            val readRecordFile = tempFile.readBytes()
            // 初期化セグメントの範囲を探す
            // きれいな実装じゃない...
            var initSegmentLength = -1
            for (i in readRecordFile.indices) {
                if (
                    readRecordFile[i] == 0x1F.toByte()
                    && readRecordFile[i + 1] == 0x43.toByte()
                    && readRecordFile[i + 2] == 0xB6.toByte()
                    && readRecordFile[i + 3] == 0x75.toByte()
                ) {
                    initSegmentLength = i
                    break
                }
            }
            if (initSegmentLength == -1) {
                return@withContext
            }
            // 初期化セグメントを書き込む
            file.writeBytes(readRecordFile.copyOfRange(0, initSegmentLength))
            // 読み出した位置分スキップ
            inputStream?.skip(initSegmentLength.toLong())
            // 書き込み可にする
            isWritable = true
            isGeneratedInitSegment = true
        }
    }

    /**
     * MediaMuxerで書き込み中のファイルから、前回切り出した範囲から今書き込み中の範囲までを切り出す。
     * 前回切り出した範囲は[sliceInitSegmentFile]も対象。
     *
     * @param filePath 書き込み先ファイルのファイルパス
     * @return ファイル
     */
    suspend fun sliceSegmentFile(filePath: String) = withContext(Dispatchers.IO) {
        File(filePath).also { file ->
            // 書き込まれないようにしておく
            isWritable = false
            // 前回までの範囲をスキップして切り出す
            inputStream?.also { stream ->
                val byteArray = ByteArray(stream.available())
                stream.read(byteArray)
                file.writeBytes(byteArray)
            }
            // 書き込み可にする
            isWritable = true
        }
    }

    /**
     * 映像トラックを追加する
     *
     * @param mediaFormat 映像トラックの情報
     */
    fun setVideoTrack(mediaFormat: MediaFormat) {
        // MediaMuxer 開始前のみ追加できるので
        if (!isRunning) {
            videoTrackIndex = mediaMuxer!!.addTrack(mediaFormat)
        }
        videoFormat = mediaFormat
    }

    /**
     * 音声トラックを追加する
     *
     * @param mediaFormat 音声トラックの情報
     */
    fun setAudioTrack(mediaFormat: MediaFormat) {
        // MediaMuxer 開始前のみ追加できるので
        if (!isRunning) {
            audioTrackIndex = mediaMuxer!!.addTrack(mediaFormat)
        }
        audioFormat = mediaFormat
    }

    /**
     * 書き込みを開始させる。
     * これ以降のフォーマット登録を受け付けないので、ファイル再生成まで登録されません [createContainerFile]
     */
    fun start() {
        if (!isRunning) {
            mediaMuxer?.start()
            isRunning = true
        }
    }

    /**
     * 映像データを書き込む
     *
     * @param byteBuf MediaCodec からもらえるやつ
     * @param bufferInfo MediaCodec からもらえるやつ
     */
    fun writeVideo(byteBuffer: ByteBuffer, bufferInfo: MediaCodec.BufferInfo) {
        if (isRunning && videoTrackIndex != INVALID_INDEX_NUMBER && isWritable) {
            mediaMuxer?.writeSampleData(videoTrackIndex, byteBuffer, bufferInfo)
        }
    }

    /**
     * 音声データを書き込む
     *
     * @param byteBuf MediaCodec からもらえるやつ
     * @param bufferInfo MediaCodec からもらえるやつ
     */
    fun writeAudio(byteBuffer: ByteBuffer, bufferInfo: MediaCodec.BufferInfo) {
        if (isRunning && audioTrackIndex != INVALID_INDEX_NUMBER && isWritable) {
            mediaMuxer?.writeSampleData(audioTrackIndex, byteBuffer, bufferInfo)
        }
    }

    /** リソース開放 */
    fun release() {
        // 起動していなければ終了もさせない
        if (isRunning) {
            mediaMuxer?.stop()
            mediaMuxer?.release()
        }
        isRunning = false
        inputStream?.close()
    }

    companion object {
        /** インデックス番号初期値、無効な値 */
        private const val INVALID_INDEX_NUMBER = -1
    }

}
```

## MainActivity.kt で使う
連番ファイル生成クラスと、セグメント生成クラスを`MainActivity`に書いてるカメラ、マイクの部分へ組み込みます。  
書き込みを始めるのは開始ボタンを押してからです。  
(Activityがデカくなっていく...まあいっか！)  

これで定期的にセグメントファイルが生成されるはず...

```kotlin
class MainActivity : AppCompatActivity() {

    /** 動画コンテナ管理クラス */
    private lateinit var dashContainer: DashContainerWriter

    /** 生成した動画をまとめるクラス */
    private lateinit var contentManager: DashContentManager

    /** セットアップを行う */
    private fun setupAll() {
        lifecycleScope.launch {
            // カメラの用意など
            setupCommon()
            setupCameraAndEncoder()
            setupMicAndEncoder()
        }
    }

    /** 共通部分の初期化 */
    private suspend fun setupCommon() {
        // 開始ボタン、セグメント生成とサーバーを起動する
        viewBinding.startButton.setOnClickListener {
            // TODO Webサーバー開始
            dashContainer.start()
        }
        // 終了ボタン
        viewBinding.stopButton.setOnClickListener {
            // TODO リソース開放
        }

        // ファイル管理クラス
        contentManager = DashContentManager(getExternalFilesDir(null)!!, SEGMENT_FILENAME_PREFIX).apply {
            deleteCreateFile()
        }
        // コンテナフォーマットに書き込むクラス
        dashContainer = DashContainerWriter(contentManager.createTempFile("temp")).apply {
            createContainerFile()
        }
        
        // TODO Webサーバー
        
        // WebM セグメントファイルを作る。MediaMuxerが書き込んでるファイルに対して切り出して保存する
        lifecycleScope.launch(Dispatchers.Default) {
            while (isActive) {
                if (dashContainer.isRunning) {
                    try {
                        // SEGMENT_INTERVAL_MS 待機したら新しいファイルにする
                        delay(SEGMENT_INTERVAL_MS)
                        // 初回時だけ初期化セグメントを作る
                        if (!dashContainer.isGeneratedInitSegment) {
                            contentManager.createFile(INIT_SEGMENT_FILENAME).also { initSegment ->
                                dashContainer.sliceInitSegmentFile(initSegment.path)
                            }
                        }
                        // MediaMuxerで書き込み中のファイルから定期的にデータをコピーして（セグメントファイルが出来る）クライアントで再生する
                        // この方法だと、MediaMuxerとMediaMuxerからコピーしたデータで二重に容量を使うけど後で考える
                        contentManager.createIncrementFile().also { segment ->
                            dashContainer.sliceSegmentFile(segment.path)
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }
        }
    }

    /** プレビューとエンコーダーを用意する */
    private fun setupCameraAndEncoder() {

            // 省略

            // エンコーダーを起動する、動作中は一時停止するので別コルーチンを起動
            launch {
                videoEncoder.startVideoEncode(
                    onOutputBufferAvailable = { byteBuffer, bufferInfo ->
                        dashContainer.writeVideo(byteBuffer, bufferInfo)
                    },
                    onOutputFormatAvailable = { mediaFormat ->
                        dashContainer.setVideoTrack(mediaFormat)
                    }
                )
            }

            // 省略
    }

    /** マイクとエンコーダーを用意 */
    @SuppressLint("MissingPermission")
    private fun setupMicAndEncoder() {

            // 省略

            // エンコーダーを起動する、動作中は一時停止するので別コルーチンを起動
            launch {
                // エンコードする
                audioEncoder.startAudioEncode(
                    onRecordInput = { bytes ->
                        // PCM音声を取り出しエンコする
                        audioRecord.read(bytes, 0, bytes.size)
                    },
                    onOutputBufferAvailable = { byteBuffer, bufferInfo ->
                        dashContainer.writeAudio(byteBuffer, bufferInfo)
                    },
                    onOutputFormatAvailable = { mediaFormat ->
                        dashContainer.setAudioTrack(mediaFormat)
                    }
                )
            }
    }
```

# Webサーバーを立てる
`Ktor`っているライブラリで建てられます。なんと`Android`でも動きます（Android 5以上）  
**`Kotlin DSL`をゴリゴリ使うスタイルなので異世界に飛ばされた感がすごい**

## Webサーバー
`ISO 8601`の部分、古いAndroidバージョンだと使えないみたいなのでなんかしないとだめです（`XXX`が`+09:00`とかになるんだけど対応してないっぽい）  
見ての通り、`index.html`、`manifest.mpd`、セグメントファイルを静的配信するためのコードがあります。（雑）  
フロントエンドでは`MPEG-DASH`を再生するためのライブラリ、`dash.js`を使います。  
後述しますが、コーデックの`VP9`が重い場合は`VP8`を使うことも出来るのですが変えた場合はマニフェストの`codecs`も変える必要があります。

```kotlin
/**
 * index.htmlとマニフェストとセグメントファイルをホスティングする
 *
 * @param portNumber ポート番号
 * @param segmentIntervalSec セグメント生成間隔
 * @param segmentFileNamePrefix セグメントファイルのプレフィックス
 * @param staticHostingFolder セグメントファイルを保存しているフォルダ
 */
class DashServer(
    private val portNumber: Int,
    private val segmentIntervalSec: Int,
    private val segmentFileNamePrefix: String,
    private val staticHostingFolder: File,
) {

    /**
     * ISO 8601 で映像データの利用可能時間を指定する必要があるため
     * MPEG-DASHの場合は指定時間になるまで再生を開始しない機能があるらしい。
     */
    @SuppressLint("NewApi")
    private val isoDateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX", Locale.JAPAN)

    /** マニフェスト */
    private var manifest: String? = null

    /** サーバー */
    private val server = embeddedServer(Netty, port = portNumber) {
        routing {
            // WebSocketと動画プレイヤーを持った簡単なHTMLを返す
            get("/") {
                call.respondText(INDEX_HTML, ContentType.parse("text/html"))
            }
            // MPEG-DASHのマニフェストを返す
            get("manifest.mpd") {
                call.respondText(manifest!!, ContentType.parse("text/html"))
            }
            // 静的フォルダ公開するように。
            // 動画を配信する
            static {
                staticRootFolder = staticHostingFolder
                files(staticHostingFolder)
            }
        }
    }

    /** サーバーを開始する */
    fun startServer() {
        manifest = createManifest()
        server.start()
    }

    /** サーバーを終了する */
    fun stopServer() {
        server.stop()
    }

    /** マニフェストを作って返す */
    private fun createManifest(): String {
        val availableTime = isoDateFormat.format(System.currentTimeMillis())
        return """
            <?xml version="1.0" encoding="utf-8"?>
            <MPD xmlns="urn:mpeg:dash:schema:mpd:2011" availabilityStartTime="$availableTime" maxSegmentDuration="PT${segmentIntervalSec}S" minBufferTime="PT${segmentIntervalSec}S" type="dynamic" profiles="urn:mpeg:dash:profile:isoff-live:2011,http://dashif.org/guidelines/dash-if-simple">
              <BaseURL>/</BaseURL>
              <Period start="PT0S">
                <AdaptationSet mimeType="video/webm">
                  <Role schemeIdUri="urn:mpeg:dash:role:2011" value="main" />
                  <!-- duration が更新頻度っぽい -->
                  <SegmentTemplate duration="$segmentIntervalSec" initialization="/init.webm" media="/${segmentFileNamePrefix}${"$"}Number${'$'}.webm" startNumber="0"/>
                    <!-- 音声入れる場合は codecs="vp9,opus" -->
                  <Representation id="default" codecs="vp9,opus"/>
                </AdaptationSet>
              </Period>
            </MPD>
        """.trimIndent()
    }

    companion object {

        /** index.html */
        private const val INDEX_HTML = """
<!doctype html>
<html>
<head>
    <title>AndroidからMPEG-DASH配信</title>
    <style>
        video {
            width: 640px;
            height: 360px;
        }
    </style>
</head>
<body>
    <div>
        <video id="videoPlayer" controls muted autoplay></video>
    </div>
    <script src="https://cdn.dashjs.org/latest/dash.all.debug.js"></script>
    <script>
        (function () {
            var url = "manifest.mpd";
            var player = dashjs.MediaPlayer().create();
            player.initialize(document.querySelector("#videoPlayer"), url, true);
        })();
    </script>
</body>
</html>
"""
    }
}
```

## MainActivity.kt へ組み込む

```kotlin
class MainActivity : AppCompatActivity() {

    /** Webサーバー */
    private lateinit var dashServer: DashServer


    /** 共通部分の初期化 */
    private suspend fun setupCommon() {
        // 開始ボタン、セグメント生成とサーバーを起動する
        viewBinding.startButton.setOnClickListener {
            dashServer.startServer()
            dashContainer.start()
        }

        // 終了ボタン
        viewBinding.stopButton.setOnClickListener {
            // TODO リソース開放
        }

        // ファイル管理クラス
        contentManager = DashContentManager(getExternalFilesDir(null)!!, SEGMENT_FILENAME_PREFIX).apply {
            deleteCreateFile()
        }
        // コンテナフォーマットに書き込むクラス
        dashContainer = DashContainerWriter(contentManager.createTempFile("temp")).apply {
            createContainerFile()
        }

        // Webサーバー
        dashServer = DashServer(
            portNumber = 8080,
            segmentIntervalSec = (SEGMENT_INTERVAL_MS / 1000).toInt(),
            segmentFileNamePrefix = SEGMENT_FILENAME_PREFIX,
            staticHostingFolder = contentManager.outputFolder
        )

        // 省略
```

# リソース開放
終了時にそれぞれのクラスに書いた終了処理を呼び出します。  
**これで一通り完成したはず！**

```kotlin
class MainActivity : AppCompatActivity() {

    /** 共通部分の初期化 */
    private suspend fun setupCommon() {
        // 開始ボタン、セグメント生成とサーバーを起動する
        viewBinding.startButton.setOnClickListener {
            dashServer.startServer()
            dashContainer.start()
        }
        // 終了ボタン
        viewBinding.stopButton.setOnClickListener {
            release()
        }

        // 省略
    }

    override fun onDestroy() {
        super.onDestroy()
        release()
    }

    /** 終了処理 */
    private fun release() {
        dashServer.stopServer()
        dashContainer.release()
        cameraDevice?.close()
        videoEncoder.release()
        audioEncoder.release()
        lifecycleScope.cancel()
    }
```

# 動かした
`SEGMENT_INTERVAL_MS`を1000にしました。(1000ms = 1sec)  
やっぱり遅延が出ちゃうけど、`WebSocket`で動画ファイルを受け取って切り替えるよりは快適だった。  
**Android単体でライブ配信が出来て満足です。**

![Imgur](https://imgur.com/4Fn5tRq.gif)

4MBぐらいのGIFです、モバイルデータの方はすいません；；

ちなみに iOS だとHLSで、しかも今回のような無理やりな方法でセグメントファイルを作ること無く配信できるみたいです。  
マルチメディア関係はやっぱりAppleが強そう（？）

- https://qiita.com/rb-de0/items/779235007752452b2bdc
- https://qiita.com/fuziki/items/675f88058bdf11d7a48b

# そーすこーど

https://github.com/takusan23/AndroidWebMDashLive

# Q & A

## プレビュー含めてなんか重い！
`VP9`のエンコードだと負荷が高すぎの可能性があります（`Pixel 3 XL (SDM 845 / RAM 4GB)`だとやっぱ重い）。  
`MediaCodec`の`MediaFormat.MIMETYPE_VIDEO_VP9`を`MediaFormat.MIMETYPE_VIDEO_VP8`にすれば軽くなりそう。  
変えた場合は`MPEG-DASH`のマニフェストのコーデックも変えてください

```kotlin
// VideoEncoder.kt

fun prepareEncoder(
    videoWidth: Int,
    videoHeight: Int,
    bitRate: Int,
    frameRate: Int,
    iFrameInterval: Int = 1,
) {
    // コーデックの選択
    // もし重くなるようなら、コーデックを VP8 にダウングレードしてもいいかもしれない
    // その場合、MPEG-DASHのマニフェストでもコーデックを vp8 にする必要あり
    val videoEncodeFormat = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_VP8, videoWidth, videoHeight).apply {
        setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
        setInteger(MediaFormat.KEY_FRAME_RATE, frameRate)
        setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, iFrameInterval)
        setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
    }
    // エンコーダー用意
    mediaCodec = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_VP8).apply {
        configure(videoEncodeFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
    }
}
```

```kotlin
// DashServer.kt

/** マニフェストを作って返す */
private fun createManifest(): String {
    val availableTime = isoDateFormat.format(System.currentTimeMillis())
    return """
        <?xml version="1.0" encoding="utf-8"?>
        <MPD xmlns="urn:mpeg:dash:schema:mpd:2011" availabilityStartTime="$availableTime" maxSegmentDuration="PT${segmentIntervalSec}S" minBufferTime="PT${segmentIntervalSec}S" type="dynamic" profiles="urn:mpeg:dash:profile:isoff-live:2011,http://dashif.org/guidelines/dash-if-simple">
          <BaseURL>/</BaseURL>
          <Period start="PT0S">
            <AdaptationSet mimeType="video/webm">
              <Role schemeIdUri="urn:mpeg:dash:role:2011" value="main" />
              <!-- duration が更新頻度っぽい -->
              <SegmentTemplate duration="$segmentIntervalSec" initialization="/init.webm" media="/${segmentFileNamePrefix}${"$"}Number${'$'}.webm" startNumber="0"/>
              <!-- vp8 にしたら↓ここも vp8 にする -->
              <Representation id="default" codecs="vp8,opus"/>
            </AdaptationSet>
          </Period>
        </MPD>
    """.trimIndent()
}
```

## iOS と iPad OS で再生できますか？
`iPad OS`だと動くと思います。  

- dash.js (フロントエンドでMPEG-DASHを再生するライブラリ) が動かない
    - もっと詳しく言うと、`Media Source Extensions`というAPIが存在するのですが`iOS`では使えません
        - しかし何故か`iPad OS`ではサポートされている模様、ふにゃ？
        - https://caniuse.com/mediasource

`Safari`しか許してない`Apple`が悪いのも分かるんですが、`WebKit`が無くなると本当に`Google`の好きなようにWebを支配出来てしまうのでやっぱこのままで！（フロント何も分からんマン）  
`HLS`の例が多いのもやっぱ`iOS`でサポートされているからなのでしょうか

## スマホのローカルIPアドレスがわからん
Wi-Fi設定の接続中アクセスポイントを選べば表示できたはず。  
もちろんアプリで取得する方法があります。

[AndroidでIPアドレスを取得する](/posts/android_12_wifi_local_ip_address)

## Surfaceから流れてくる映像のプレゼンテーションタイムがわからないため、音声とずれる
`Surface`経由で`MediaCodec`へ渡す場合、`queueInputBuffer`を呼び出すことがないので時間(`presentationTimeUs`)が勝手に指定されるんですよね。  
多分`System.nanoTime() / 1000`が指定されていると思います....（`dequeueOutputBuffer`で貰える`BufferInfo`の時間を見ると多分そう）  

```kotlin
// 多分 Surfaceで映像を入力した場合、presentationTimeUs は nanoTime を 1000 で割った値っぽい
mediaCodec.queueInputBuffer(inputBufferId, 0, readByteSize, System.nanoTime() / 1000, 0)
```

以上です、お疲れ様でした 888888888888888888

# おわりに
需要があればストアに出したいけど、プレビューのアスペクト比だったりで色々直すところがあって大変そう。

あとこれ使ってるとそこそこ発熱します、はよ冬来い