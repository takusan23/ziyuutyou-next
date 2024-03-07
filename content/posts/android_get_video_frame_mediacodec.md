---
title: Android で動画からフレーム（画像）を高速で取り出す処理を自作する
created_at: 2024-03-08
tags:
- Kotlin
- Android
- MediaCodec
- OpenGL
---

どうもこんばんわ。  
FLIP＊FLOP 〜INNOCENCE OVERCLOCK〜 攻略しました。  

![Imgur](https://imgur.com/EitoG0c.png)

めっちゃ あまあまなシナリオ + かわいいヒロイン がいる神ゲーです。ほんとにあまあまでした  
おじいちゃん何者なの（（？））続編で明かされるんかな  

![Imgur](https://imgur.com/MfIPCOM.png)

![Imgur](https://imgur.com/pETHOMu.png)

ボクっ娘だ！  

![Imgur](https://imgur.com/058KJPn.png)

元気いっぱいイオちゃんかわいい！！  

![Imgur](https://imgur.com/pNBa7tK.png)

サブヒロインも可愛いけど攻略できない、そんな・・・  

![Imgur](https://imgur.com/y3IH8rp.png)

![Imgur](https://imgur.com/Bs9JKOg.png)

というわけで`OP`の`CD`、開け、、ます！  
`OP`曲めっちゃいい！

![Imgur](https://imgur.com/NTDg8p2.png)

# 本題
`Android`で動画の1コマ1コマを画像として取り出す処理を`Android`でやりたい。  
30 fps なら 1秒間に 30 枚画像が切り替わるわけですが、その1枚1枚を切り出したい。  

特に、`30fps なら 30枚`、連続したフレームを取り出すのに特化した処理を自作したい。  
**理由は後述しますが遅い！**

# 欲しい要件
- 指定位置のフレーム（動画の指定位置を画像にする）
- 動画の再生時間が増加する方向に対して連続でフレームを取り出す際には、**高速であってほしい**
    - **巻き戻しは遅くなって仕方がない**
    - 高速で取れるハズな理由も後述します
    - 後述しますが既知の`Android`の解決策では遅い

動画のサムネイル画像が一回ぽっきりで欲しいとかで、動画のフレームを取得するなら別に遅くてもなんともならないと思うのですが、、、  
時間が増加する方向に向かって映像のフレームを取り出す分には、高速にフレームを取り出せる気がするんですよね。以下擬似コード

```kotlin
// 時間が増加する分には速く取れるように作れそう。
val bitmap1 = getVideoFrameBitmap(ms = 1_000)
val bitmap2 = getVideoFrameBitmap(ms = 1_100)
val bitmap3 = getVideoFrameBitmap(ms = 1_200)
val bitmap4 = getVideoFrameBitmap(ms = 1_300)
val bitmap5 = getVideoFrameBitmap(ms = 1_400)
```

# 既にあるやつじゃだめなの？
ライブラリを使わずに、`Android`で完結させたい場合は多分以下のパターンがある

## MediaMetadataRetriever
`高レベルAPI`ですね。  
`ffprobe`的な使い方から、動画のフレームを取ったりも出来ます。

### getFrameAtTime
https://developer.android.com/reference/android/media/MediaMetadataRetriever#getFrameAtTime(long,%20int)

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen() {

    val context = LocalContext.current
    val bitmap = remember { mutableStateOf<ImageBitmap?>(null) }

    val videoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri ->
            // MediaMetadataRetriever は File からも作れます
            uri ?: return@rememberLauncherForActivityResult
            val mediaMetadataRetriever = MediaMetadataRetriever().apply {
                setDataSource(context, uri)
            }
            // Bitmap を取り出す
            // 引数の単位は Ms ではなく Us です
            bitmap.value = mediaMetadataRetriever.getFrameAtTime(13_000_000, MediaMetadataRetriever.OPTION_CLOSEST)?.asImageBitmap()
            // もう使わないなら
            mediaMetadataRetriever.release()
        }
    )

    Scaffold(
        topBar = {
            TopAppBar(title = { Text(text = stringResource(id = R.string.app_name)) })
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {

            if (bitmap.value != null) {
                Image(
                    modifier = Modifier.fillMaxWidth(),
                    bitmap = bitmap.value!!,
                    contentDescription = null
                )
            }

            Button(onClick = { videoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly)) }) {
                Text(text = "取り出す")
            }

        }
    }
}
```

すごく簡単に使える。  
動画を渡して時間とオプションを指定するだけで、`Bitmap`として取れる。  
オプションですが  

- 動画の時間に近いフレームを取り出す（高速）
    - MediaMetadataRetriever.OPTION_PREVIOUS_SYNC
        - 高速な代わりに、指定の時間よりも前のフレームになる
    - MediaMetadataRetriever.OPTION_NEXT_SYNC
        - 高速な代わりに、指定の時間よりも前か後のフレームになる
    - MediaMetadataRetriever.OPTION_CLOSEST_SYNC
        - 高速な代わりに、指定の時間よりも後のフレームになる
- 動画の時間を厳密にしたフレームを取り出す（めちゃ遅い）
    - MediaMetadataRetriever.OPTION_CLOSEST

フレームを正確に欲しい場合は、`MediaMetadataRetriever.OPTION_CLOSEST`を使うしか無いと思うんですが、結構遅いのでちょっと使えないかな。  

```kotlin
// 時間が巻き戻らなければ速くフレーム返して欲しい
// これだけでも 1 秒くらいはかかっちゃう
mediaMetadataRetriever.getFrameAtTime(1_000_000L, MediaMetadataRetriever.OPTION_CLOSEST)
mediaMetadataRetriever.getFrameAtTime(1_100_000L, MediaMetadataRetriever.OPTION_CLOSEST)
mediaMetadataRetriever.getFrameAtTime(1_200_000L, MediaMetadataRetriever.OPTION_CLOSEST)
```

### getFrameAtIndex
https://developer.android.com/reference/android/media/MediaMetadataRetriever#getFrameAtIndex(int,%20android.media.MediaMetadataRetriever.BitmapParams)

こっちのほうが`getFrameAtTime`よりは高速らしいですが、あんまり速くない気がする。  
引数には時間ではなく、フレームの番号を渡す必要があります。`30fps`なら、1秒間に`30枚`あるので、、、  

全部で何フレームあるかは、`METADATA_KEY_VIDEO_FRAME_COUNT`で取れるらしいので、欲しい時間のフレーム番号を計算で出せば良さそう。  
**が、これも私が試した限りあんまり速くないので別に・・・**

### MediaMetadataRetriever は並列処理できない可能性
`MediaMetadataRetriever`が何やってるのかあんまりわからないのですが、  
なんだか`getFrameAtIndex / getFrameAtTime`が遅いからって並列にしても対して速くないです。

まず直列パターン。  
```kotlin
// 3枚取り出す
val time = measureTimeMillis {
    repeat(3) {
        val timeUs = it * 1_000_000L
        val mediaMetadataRetriever = MediaMetadataRetriever().apply {
            setDataSource(context, uri)
        }
        // Bitmap を取り出す
        // 引数の単位は Ms ではなく Us です
        mediaMetadataRetriever.getFrameAtTime(timeUs, MediaMetadataRetriever.OPTION_CLOSEST)?.asImageBitmap()
        // もう使わないなら
        mediaMetadataRetriever.release()
    }
}
println("time = $time")
```

次に並列のパターン。  
```kotlin
scope.launch {
    // 3枚取り出す
    val time = measureTimeMillis {
        (0 until 3).map {
            launch {
                val timeUs = it * 1_000_000L
                val mediaMetadataRetriever = MediaMetadataRetriever().apply {
                    setDataSource(context, uri)
                }
                // Bitmap を取り出す
                // 引数の単位は Ms ではなく Us です
                mediaMetadataRetriever.getFrameAtTime(timeUs, MediaMetadataRetriever.OPTION_CLOSEST)?.asImageBitmap()
                // もう使わないなら
                mediaMetadataRetriever.release()
            }
        }.joinAll()
    }
    println("time = $time ms")
}
```

まず直列パターンの結果ですが、
- `Pixel 6 Pro`
    - `time = 1090 ms`
    - `time = 1082 ms`
- `Pixel 8 Pro`
    - `time = 744 ms`
    - `time = 702 ms`

そしてコレが並列パターンの結果。
- `Pixel 6 Pro`
    - `time = 1087 ms`
    - `time = 983 ms`
- `Pixel 8 Pro`
    - `time = 691 ms`
    - `time = 653 ms`

**若干早いけど誤差なのでは・・・？**  
`MediaMetadataRetriever`、もしかして内部でインスタンスを共通にしてて切り替えて使ってる？

**うーん、おそい！**

## MediaPlayer + ImageReader
ネタバレすると、**これは自作した後に気付いたんですが、これも結局あんまり早くない**

動画プレイヤーの`MediaPlayer`の出力先に`ImageReader`を使う方法。  
`MediaPlayer`の出力先に普通は、`SurfaceView`とか、`TextureView`とかを渡しますが、`ImageReader`を渡すと`画像データ`として取ることが出来ます。  
`SurfaceView / TextureView`が画面に表示する物だとしたら、`ImageReader`は画像データにしてくれるものでしょうか。`MediaRecorder`は動画にしてくれるやつです。  
（まあ`TextureView`をキャプチャするのと対して変わらんと思うけど、、、`ImageReader`とか言う適役がいるので）

で、で、で、、、`MediaPlayer#seekTo`して、`ImageReader`で動画のフレームを画像にすれば高速に取れるのではないかと。  
でもだめだったよ。これもあんまり早くない。

https://developer.android.com/reference/android/media/MediaPlayer#seekTo(long,%20int)

並列はこれで達成できるかもしれない。  
ただ、`MediaPlayer#seekTo`が`MediaMetadataRetriever`のときと同じく、正確性を求めるなら速度が遅くなるみたい。  
次のフレームを`seekTo`で指定しても速くなかった。うん。`高レベルAPI`だし、そりゃそうなるか。

そういえば、`MediaPlayer`、これ動画を再生するものなので、連続してフレームを`Bitmap`にするとかなら得意なんじゃないだろうか。  
動くか分からんけどこんなの。

```kotlin
// TODO 動くかわからない。多分動かない
val imageReader = ImageReader.newInstance(videoWidth, videoHeight, ImageFormat.YUV_420_888, 2)
imageReader.setOnImageAvailableListener({
    // 毎フレームごとに呼ばれるんじゃないかな
    // 連続して取り出す分には出来そう
    val currentPosition = mediaPlayer.currentPosition
    val image = imageReader.acquireLatestImage()
    val bitmap = image.toBitmap() // toBitmap は自分で書いて...
}, null)

val mediaPlayer = MediaPlayer().apply {
    setSurface(imageReader.surface)
    setDataSource(videoFile.path)
    prepare()
    seekTo(1_000)
    start() // 再生
}
```

ただ、連続してフレームがとれるというか、毎フレーム`Bitmap`を生成することになるので、`Bitmap`をどっかに置いておかないといけない。
一旦画像にして保存してもいいけど、、、できれば指定した時間のフレームだけ欲しいし、その次のフレームが欲しかったらすぐ返して欲しい。

# そもそも連続したフレームだったら高速に取り出せるんですか？

## 動画のフレーム（画像）の話

- https://ja.wikipedia.org/wiki/フレーム間予測
- https://aviutl.info/keyframe/

それには動画がどうやって動画を圧縮しているかの話と、キーフレームの話が必要で、しますね。  

前も話した気がするけどこのサイト`Google`で見つからない事が多いのでまた書きますね。  
（`SSG`でも動く全文検索検討するかあ～）

動画というのは、画像が切り替わっている用に見えますが、考えてみてください。`30fps`だと`1秒間に30枚の画像`を保存しているのかと。
してないですね。仮に作ったとしても動画ファイルはそんなに大きくなりません。でも`30fps`なら`30枚分`あるはずの画像はどこに行ってしまったのか・・・

小さく出来る理由ですが、前回のフレーム（画像）からの差分のみを動画ファイルへ保存するんですね。  
動画というのはほとんど変わらない部分も含まれているわけで、それらは前のフレームを参照してねとすれば、動画ファイルは小さく出来ます。  
前のフレームに依存する代わりにファイルを小さく出来ました。  

![Imgur](https://imgur.com/bxdpjgF.png)

ただ、すべてのフレームを前のフレームに依存させてしまうと、今度は巻き戻しができなくなってしまいます。  
ドロイドくん3つのフレームを表示させたい場合、フレーム単体では表示できないので、それよりも前（上の絵では最初）に戻る必要があります。

でも毎回最初に戻っていてはシークがとんでもなく遅くなってしまうので、定期的に**キーフレーム**という、前のフレームに依存しない完全な状態の画像を差し込んでいます。  
1秒に一回くらいとかですかね。これなら、大幅に戻ったりする必要がなくなるのでシークも早くなります。

![Imgur](https://imgur.com/41S5X2o.png)

もちろん、動画のコーデックはこれ以外の技術を使って動画のファイルサイズを縮小していますが、今回の高速でフレームを取り出す話しには多分関係ないので飛ばします。

## なぜ既知の解決策が遅いのか
シークしているからでしょう。  
`MediaMetadataRetriever`には4つのオプションがあるといいました。  

- OPTION_PREVIOUS_SYNC (高速)
    - 指定位置より後ろのキーフレームを取る
- OPTION_NEXT_SYNC (高速)
    - 指定位置より先のキーフレームを取る
- OPTION_CLOSEST_SYNC (高速)
    - 指定位置に一番近いキーフレームを取る
- OPTION_CLOSEST (低速)
    - 指定位置のフレームを取り出す

↑のフレームの話を聞いたら、`OPTION_CLOSEST`がなんで遅くて、それ以外がなんで早いか。分かる気がしませんか？  
`OPTION_PREVIOUS_SYNC / OPTION_NEXT_SYNC / OPTION_CLOSEST_SYNC`はキーフレームを探すのに対して（フレーム単体で画像になっている）、  
`OPTION_CLOSEST`はキーフレームからの差分までも見る必要があるため、キーフレームまで移動した後指定時間になるまで進める必要があり、時間がかかるわけです。

![Imgur](https://imgur.com/xUbl57V.png)

そして、`OPTION_CLOSEST`の場合、**おそらく毎回キーフレームまで戻っている？ために遅くなっている？**  
`MediaMetadataRetriever`も`MediaPlayer`も多分そう。  

![Imgur](https://imgur.com/VaKTjN4.png)

## なぜ高速に取り出せると思っているのか
**キーフレームまで戻るから遅いのでは。巻き戻すわけじゃないから戻らないように時前で書けばいいのでは？？？**  

![Imgur](https://imgur.com/IWrtmJB.png)

絶対戻らないという前提があれば、連続したフレームを取り出すのも早いんじゃないかという話です。

```kotlin
// 毎フレーム、巻き戻ししなければ速く取得できる処理が作れるのではないか。
getVideoFrameBitmap(ms = 16)
getVideoFrameBitmap(ms = 33)
getVideoFrameBitmap(ms = 66)
getVideoFrameBitmap(ms = 99)
```

というわけで、今回は動画のフレームを`Bitmap`として取り出す処理。（`MediaMetadataRetriever#getFrameAtTime`の代替）、  
かつキーフレームまで戻らない仕様を込めて自前で作ってみようと思います。

（ちなみに）  
（`MediaMetadataRetriever`は指定した時間が、前回のフレームの次のフレームだったとしても、`OPTION_CLOSEST`指定している限りキーフレームまで戻っているのが悪いと言われると微妙。）  
（次のフレームなら効率が悪いと思いますが、前回のフレームよりも前に戻る場合は、キーフレームまで戻るこの方法が必要なのでまあ仕方ないところがある。）

# つくる
前置きが長過ぎる

## 環境

|                |                                           |
|----------------|-------------------------------------------|
| Android Studio | Android Studio Hedgehog  2023.1.1 Patch 2 |
| 端末           | Pixel 8 Pro / Xperia 1 V                  |
| 言語           | Koltin / OpenGL                           |

~~一応`MediaCodec`の出力先を`ImageReader`にするだけで動くので、`MediaCodec`系といっしょに使われる`OpenGL`とかは要らないはずですが~~  
~~`OpenGL`を一枚噛ませるとさせておくとより安心です~~（嘘です。なんか間違えたのか**Google Pixel**以外で落ちました。**OpenGL**を噛ませないと動きません。落ちた話は後半でします。）

## 今回の作戦
前回の位置から、巻き戻っていない場合は、コンテナから次のデータを取り出してデコーダーに渡すようにします。  
これをするため、フレームが取得し終わっても`MediaCodec / MediaExtractor`はそのままにしておく必要があります（待機状態というのでしょうか・・）

![Imgur](https://imgur.com/i0ycoYF.png)

### MediaCodec とゆかいな仲間たち
- MediaCodec
    - エンコード済のデータをデコードしたりする
        - `AVC`を生データに
        - `AAC`を`PCM`に
- MediaExtractor
    - `mp4 / webm`等のコンテナフォーマットから、パラメーターや実際のデータを取り出すやつ
    - デコーダーに渡すときに使う
- ImageReader
    - `SurfaceView`が画面に表示するやつなら、これは静止画に変換するやつ
- Surface
    - 映像データを運ぶパイプみたいなやつです
    - このパイプみたいなやつがいるおかげで、私たちは映像データをバイト配列でやり取りする必要がなくなります
- OpenGL
    - `MediaCodec`で出てきたフレームを加工したりできる
    - そのほか、`MediaCodec`の出力先`Surface`は`OpenGL`を使った`InputSurface`を経由させるのがお作法らしい
        - `InputSurface.java`
            - https://cs.android.com/android/platform/superproject/main/+/main:cts/tests/tests/media/common/src/android/media/cts/InputSurface.java
        - よくわからないけど`OpenGL`を経由させるのが安牌
            - 過去記事
            - https://takusan.negitoro.dev/posts/android_video_av1_pixel_8_hardware_encoder/#流れ

## OpenGL 周りを AOSP から借りてくる
何やってるか私もわからないので`AOSP`から借りてくることにします。  
私がやったのは`Kotlin`化くらいです。

- https://github.com/takusan23/AndroidVideoFrameFastNextExtractor/blob/master/app/src/main/java/io/github/takusan23/androidvideoframefastnextextractor/gl/TextureRenderer.kt
- https://github.com/takusan23/AndroidVideoFrameFastNextExtractor/blob/master/app/src/main/java/io/github/takusan23/androidvideoframefastnextextractor/gl/InputSurface.kt

![Imgur](https://imgur.com/HM50HvO.png)

## VideoFrameBitmapExtractor.kt
適当にクラスを作って、以下の関数を用意します。  
それぞれの中身はこれから書きます。

`newSingleThreadContext`がなんで必要かは前書いたのでそっち見て  
→ https://takusan.negitoro.dev/posts/android_14_media_projection_partial/#録画部分に組み込む話と-kotlin-coroutine-の話

まあ言うと  
`newSingleThreadContext`ってやつを使うことで、常に同じスレッドで処理してくれる`Dispatcher`を作れます。これを`withContext`とかで使えばいい。  
あ、でも複数の`VideoFrameBitmapExtractor()`のインスタンスを作って使う場合は、`openGlRenderDispatcher`をそれぞれ作らないといけないので、`companion object`に置いたらダメですね。  

```kotlin
/**
 * [MediaCodec]と[MediaExtractor]、[ImageReader]を使って高速に動画からフレームを取り出す
 */
class VideoFrameBitmapExtractor {

    /** MediaCodec デコーダー */
    private var decodeMediaCodec: MediaCodec? = null

    /** Extractor */
    private var mediaExtractor: MediaExtractor? = null

    /** 映像デコーダーから Bitmap として取り出すための ImageReader */
    private var imageReader: ImageReader? = null

    /** 最後の[getVideoFrameBitmap]で取得したフレームの位置 */
    private var latestDecodePositionMs = 0L

    /** 前回のシーク位置 */
    private var prevSeekToMs = -1L

    /** 前回[getImageReaderBitmap]で作成した Bitmap */
    private var prevBitmap: Bitmap? = null

    /**
     * デコーダーを初期化する
     *
     * @param uri 動画ファイル
     */
    suspend fun prepareDecoder(
        context: Context,
        uri: Uri,
    ) = withContext(Dispatchers.IO) {
        // todo
    }

    /**
     * 指定位置の動画のフレームを取得して、[Bitmap]で返す
     *
     * @param seekToMs シーク位置
     * @return Bitmap
     */
    suspend fun getVideoFrameBitmap(
        seekToMs: Long
    ): Bitmap = withContext(Dispatchers.Default) {
        // TODO
    }

    /** 破棄する */
    fun destroy() {
        decodeMediaCodec?.release()
        mediaExtractor?.release()
        imageReader?.close()
        inputSurface?.release()
    }

    companion object {
        /** MediaCodec タイムアウト */
        private const val TIMEOUT_US = 10_000L

        /** OpenGL 用に用意した描画用スレッド。Kotlin coroutines では Dispatcher を切り替えて使う */
        @OptIn(DelicateCoroutinesApi::class)
        private val openGlRenderDispatcher = newSingleThreadContext("openGlRenderDispatcher")
    }
}
```

### 初期化する処理
`prepareDecoder`関数の中身です。  
`Context`と`Uri`は`Jetpack Compose`で作る`UI`側で貰えるので

`trackIndex = ...`の部分は、`mp4 / webm`から映像トラックを探して`selectTrack`します。  
音声トラックと映像トラックで2つしか無いと思いますが。

`ImageReader`ですが、`MediaCodec`で使う場合は`ImageFormat.YUV_420_888`じゃないとだめっぽいです。  

```kotlin
/**
 * デコーダーを初期化する
 *
 * @param uri 動画ファイル
 */
suspend fun prepareDecoder(
    context: Context,
    uri: Uri,
) = withContext(Dispatchers.IO) {
    // コンテナからメタデータを取り出す
    val mediaExtractor = MediaExtractor().apply {
        context.contentResolver.openFileDescriptor(uri, "r")?.use {
            setDataSource(it.fileDescriptor)
        }
    }
    this@VideoFrameBitmapExtractor.mediaExtractor = mediaExtractor

    // 映像トラックを探して指定する。音声と映像で2️個入ってるので
    val trackIndex = (0 until mediaExtractor.trackCount)
        .map { index -> mediaExtractor.getTrackFormat(index) }
        .indexOfFirst { mediaFormat -> mediaFormat.getString(MediaFormat.KEY_MIME)?.startsWith("video/") == true }
    mediaExtractor.selectTrack(trackIndex)

    // デコーダーの用意
    val mediaFormat = mediaExtractor.getTrackFormat(trackIndex)
    val codecName = mediaFormat.getString(MediaFormat.KEY_MIME)!!
    val videoHeight = mediaFormat.getInteger(MediaFormat.KEY_HEIGHT)
    val videoWidth = mediaFormat.getInteger(MediaFormat.KEY_WIDTH)

    // Surface 経由で Bitmap が取れる ImageReader つくる
    imageReader = ImageReader.newInstance(videoWidth, videoHeight, PixelFormat.RGBA_8888, 2)

    // 描画用スレッドに切り替える
    withContext(openGlRenderDispatcher) {
        // MediaCodec と ImageReader の間に OpenGL を経由させる
        // 経由させないと、Google Pixel 以外（Snapdragon 端末とか）で動かなかった
        this@VideoFrameBitmapExtractor.inputSurface = InputSurface(
            surface = imageReader!!.surface,
            textureRenderer = TextureRenderer()
        )
        inputSurface!!.makeCurrent()
        inputSurface!!.createRender()
    }

    // 映像デコーダー起動
    // デコード結果を ImageReader に流す
    decodeMediaCodec = MediaCodec.createDecoderByType(codecName).apply {
        configure(mediaFormat, inputSurface!!.drawSurface, null, 0)
    }
    decodeMediaCodec!!.start()
}
```

## 映像からフレームを取り出す処理
前回フレームを取り出した再生位置よりも前の位置のを取り出す処理と、後の位置のを取り出す処理で2つ処理を分けたほうが良さそう。

### 前回より前の位置にあるフレームを取り出す

```plaintext
|-------◯----|
   ↑
```

前回取り出したフレームの位置よりも前にある場合は、もうこれは仕方ないので、一旦キーフレームまで戻って、指定時間になるまでコンテナから取り出してデコードを続けます。  
とりあえず前のキーフレームまでシークして待てばいいので、後の位置よりも簡単ですね。

一点、現時点の再生位置よりも巻き戻すシークの場合`MediaCodec#flush`しないとだめっぽい？  
試した感じ、`flush()`呼ばないと巻き戻らないんだよね。  
`flush()`を呼ぶ場合、`MediaCodec#dequeueInputBuffer`で取ったバッファのインデックスを、`MediaCodec#queueInputBuffer`に渡して`MediaCodec`に返却してから`flush`を呼ぶようにしましょうね。  
（`MediaCodec#dequeueInputBuffer`を呼びっぱなしにして`flush`すると怒られます）

（クソなが`MediaCodec`のドキュメントついに役に立つのか！）  
https://developer.android.com/reference/android/media/MediaCodec#for-decoders-that-do-not-support-adaptive-playback-including-when-not-decoding-onto-a-surface

あとは`while`で欲しい時間のフレームが来るまで繰り返すだけです。  
`readSampleData`で取り出して`queueInputBuffer`でデコーダーに詰める。デコードできたかどうかは`dequeueOutputBuffer`を呼び出して、データが来ていれば`Surface`に描画です。  
単位が`Ms`じゃなくて`Us`なので注意。

```kotlin
/**
 * 今の再生位置よりも前の位置にシークして、指定した時間のフレームまでデコードする。
 * 指定した時間のフレームがキーフレームじゃない場合は、キーフレームまでさらに巻き戻すので、ちょっと時間がかかります。
 *
 * @param seekToMs シーク位置
 */
private suspend fun awaitSeekToPrevDecode(
    seekToMs: Long
) = withContext(Dispatchers.Default) {
    val decodeMediaCodec = decodeMediaCodec!!
    val mediaExtractor = mediaExtractor!!
    val inputSurface = inputSurface!!

    // シークする。SEEK_TO_PREVIOUS_SYNC なので、シーク位置にキーフレームがない場合はキーフレームがある場所まで戻る
    mediaExtractor.seekTo(seekToMs * 1000, MediaExtractor.SEEK_TO_PREVIOUS_SYNC)
    // エンコードサれたデータを順番通りに送るわけではない（隣接したデータじゃない）ので flush する
    decodeMediaCodec.flush()

    // デコーダーに渡す
    var isRunning = true
    val bufferInfo = MediaCodec.BufferInfo()
    while (isRunning) {
        // キャンセル時
        if (!isActive) break

        // コンテナフォーマットからサンプルを取り出し、デコーダーに渡す
        // while で繰り返しているのは、シーク位置がキーフレームのため戻った場合に、狙った時間のフレームが表示されるまで繰り返しデコーダーに渡すため
        val inputBufferIndex = decodeMediaCodec.dequeueInputBuffer(TIMEOUT_US)
        if (inputBufferIndex >= 0) {
            val inputBuffer = decodeMediaCodec.getInputBuffer(inputBufferIndex)!!
            // デコーダーへ流す
            val size = mediaExtractor.readSampleData(inputBuffer, 0)
            decodeMediaCodec.queueInputBuffer(inputBufferIndex, 0, size, mediaExtractor.sampleTime, 0)
            // 狙ったフレームになるまでデータを進める
            mediaExtractor.advance()
        }

        // デコーダーから映像を受け取る部分
        var isDecoderOutputAvailable = true
        while (isDecoderOutputAvailable) {
            // デコード結果が来ているか
            val outputBufferIndex = decodeMediaCodec.dequeueOutputBuffer(bufferInfo, TIMEOUT_US)
            when {
                outputBufferIndex == MediaCodec.INFO_TRY_AGAIN_LATER -> {
                    // もう無い時
                    isDecoderOutputAvailable = false
                }

                outputBufferIndex >= 0 -> {
                    // ImageReader ( Surface ) に描画する
                    val doRender = bufferInfo.size != 0
                    decodeMediaCodec.releaseOutputBuffer(outputBufferIndex, doRender)
                    // OpenGL で描画して、ImageReader で撮影する
                    // OpenGL 描画用スレッドに切り替えてから、swapBuffers とかやる
                    withContext(openGlRenderDispatcher) {
                        if (doRender) {
                            var errorWait = false
                            try {
                                inputSurface.awaitNewImage()
                            } catch (e: Exception) {
                                errorWait = true
                            }
                            if (!errorWait) {
                                inputSurface.drawImage()
                                inputSurface.setPresentationTime(bufferInfo.presentationTimeUs * 1000)
                                inputSurface.swapBuffers()
                            }
                        }
                    }
                    // 欲しいフレームの時間に到達した場合、ループを抜ける
                    val presentationTimeMs = bufferInfo.presentationTimeUs / 1000
                    if (seekToMs <= presentationTimeMs) {
                        isRunning = false
                        latestDecodePositionMs = presentationTimeMs
                    }
                }
            }
        }
    }
}
```

### 前回より後の位置にあるフレームを取り出す

```plaintext
|-------◯----|
              ↑
```

さて、`MediaMetadataRetriever#getFrameAtTime`にはない、巻き戻さなければキーフレームまで戻らないを実装していきます。  
が、が、が、巻き戻さなければなんですが、これだと前回よりもかけ離れた先にある場所へシークするのが遅くなってしまいます。連続したフレームの取得なら早くなりますが、  
遠い場所へシークする場合は近くのキーフレームまでシークしたほうが早いです。（これがないと前回からの差分を全部取り出すので効率が悪い）

というわけで、欲しい位置のフレームの取得よりも先に、キーフレームが出現した場合は一気に近い位置までシークするような処理を書きました。  
（前回よりも数フレーム先のフレームなら、キーフレームまでシークせずに取り出せるので高速ですが、次次...あれ先にキーフレームが来ちゃうの？ってくらい離れていると逆に一気にシークした方が良い）

なんか手こずったけどなんとかなりました（`MediaExtractor#getSampleTime`と`BufferInfo#getPresentationTimeUs()`って微妙に違うのか・・）。

それ以外は↑のコードと大体一緒なので説明は省略で。

```kotlin
/**
 * 今の再生位置よりも後の位置にシークして、指定した時間のフレームまでデコードする。
 *
 * また高速化のため、まず[seekToMs]へシークするのではなく、次のキーフレームまでデータをデコーダーへ渡します。
 * この間に[seekToMs]のフレームがあればシークしません。
 * これにより、キーフレームまで戻る必要がなくなり、連続してフレームを取得する場合は高速に取得できます。
 *
 * @param seekToMs シーク位置
 */
private suspend fun awaitSeekToNextDecode(
    seekToMs: Long
) = withContext(Dispatchers.Default) {
    val decodeMediaCodec = decodeMediaCodec!!
    val mediaExtractor = mediaExtractor!!
    val inputSurface = inputSurface!!

    var isRunning = isActive
    val bufferInfo = MediaCodec.BufferInfo()
    while (isRunning) {
        // キャンセル時
        if (!isActive) break

        // コンテナフォーマットからサンプルを取り出し、デコーダーに渡す
        // シークしないことで、連続してフレームを取得する場合にキーフレームまで戻る必要がなくなり、早くなる
        val inputBufferIndex = decodeMediaCodec.dequeueInputBuffer(TIMEOUT_US)
        if (inputBufferIndex >= 0) {
            // デコーダーへ流す
            val inputBuffer = decodeMediaCodec.getInputBuffer(inputBufferIndex)!!
            val size = mediaExtractor.readSampleData(inputBuffer, 0)
            decodeMediaCodec.queueInputBuffer(inputBufferIndex, 0, size, mediaExtractor.sampleTime, 0)
        }

        // デコーダーから映像を受け取る部分
        var isDecoderOutputAvailable = true
        while (isDecoderOutputAvailable) {
            // デコード結果が来ているか
            val outputBufferIndex = decodeMediaCodec.dequeueOutputBuffer(bufferInfo, TIMEOUT_US)
            when {
                outputBufferIndex == MediaCodec.INFO_TRY_AGAIN_LATER -> {
                    // もう無い時
                    isDecoderOutputAvailable = false
                }

                outputBufferIndex >= 0 -> {
                    // ImageReader ( Surface ) に描画する
                    val doRender = bufferInfo.size != 0
                    decodeMediaCodec.releaseOutputBuffer(outputBufferIndex, doRender)
                    // OpenGL で描画して、ImageReader で撮影する
                    // OpenGL 描画用スレッドに切り替えてから、swapBuffers とかやる
                    withContext(openGlRenderDispatcher) {
                        if (doRender) {
                            var errorWait = false
                            try {
                                inputSurface.awaitNewImage()
                            } catch (e: Exception) {
                                errorWait = true
                            }
                            if (!errorWait) {
                                inputSurface.drawImage()
                                inputSurface.setPresentationTime(bufferInfo.presentationTimeUs * 1000)
                                inputSurface.swapBuffers()
                            }
                        }
                    }
                    // 欲しいフレームの時間に到達した場合、ループを抜ける
                    val presentationTimeMs = bufferInfo.presentationTimeUs / 1000
                    if (seekToMs <= presentationTimeMs) {
                        isRunning = false
                        latestDecodePositionMs = presentationTimeMs
                    }
                }
            }
        }

        // 次に進める
        mediaExtractor.advance()

        // 欲しいフレームが前回の呼び出しと連続していないときの処理
        // 例えば、前回の取得位置よりもさらに数秒以上先にシークした場合、指定位置になるまで待ってたら遅くなるので、数秒先にあるキーフレームまでシークする
        // で、このシークが必要かどうかの判定がこれ。数秒先をリクエストした結果、欲しいフレームが来るよりも先にキーフレームが来てしまった
        // この場合は一気にシーク位置に一番近いキーフレームまで進める
        // ただし、キーフレームが来ているサンプルの時間を比べて、欲しいフレームの位置の方が大きくなっていることを確認してから。
        // デコーダーの時間 presentationTimeUs と、MediaExtractor の sampleTime は同じじゃない？らしく、sampleTime の方がデコーダーの時間より早くなるので注意
        val isKeyFrame = mediaExtractor.sampleFlags and MediaExtractor.SAMPLE_FLAG_SYNC != 0
        val currentSampleTimeMs = mediaExtractor.sampleTime / 1000
        if (isKeyFrame && currentSampleTimeMs < seekToMs) {
            mediaExtractor.seekTo(seekToMs * 1000, MediaExtractor.SEEK_TO_PREVIOUS_SYNC)
        }
    }
}
```

### ImageReader から Bitmap を取り出す処理
`acquireLatestImage`して、`Buffer`とって、`Bitmap`にしています。

```kotlin
/** [imageReader]から[Bitmap]を取り出す */
private suspend fun getImageReaderBitmap(): Bitmap = withContext(Dispatchers.Default) {
    val image = imageReader!!.acquireLatestImage()
    val width = image.width
    val height = image.height
    val buffer = image.planes.first().buffer
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    bitmap.copyPixelsFromBuffer(buffer)
    prevBitmap = bitmap
    // Image を close する
    image.close()
    return@withContext bitmap
}
```

### 組み合わせる
`awaitSeekToNextDecode`とか`awaitSeekToPrevDecode`とか`getImageReaderBitmap`を組み合わせて、動画のフレームを取り出す関数を完成させます。  

あ～  
シーク不要の部分で、なんで`前回の Bitmap`を返しているかなんですが、動画フレームの枚数よりも多くのフレームをリクエストしてきた時に前回のフレームを返すためのものです。  
どういうことかと言うと、`30fps`なら`1秒間に30枚`までならフレームを取り出せますが、`1秒間に60枚`取ろうとするとフレームの枚数よりも多くのフレームを要求することになり、余計にデコードが進んでいってしまい、ズレていってしまいます。  
（`30fps`なら`33ミリ秒`毎に取り出す処理なら問題ないけど、`16ミリ秒`毎に取り出すと、フレームの枚数よりも多くのフレームを取るから壊れちゃう。）

フレームの枚数よりも多くのフレームを要求してきても壊れないように、最後取得したフレームの位置を見て、もし最後取得したフレームよりも前の位置だったら前回の`Bitmap`を返すようにしました。

```kotlin
/**
 * 指定位置の動画のフレームを取得して、[Bitmap]で返す
 *
 * @param seekToMs シーク位置
 * @return Bitmap
 */
suspend fun getVideoFrameBitmap(
    seekToMs: Long
): Bitmap = withContext(Dispatchers.Default) {
    val videoFrameBitmap = when {
        // 現在の再生位置よりも戻る方向に（巻き戻し）した場合
        seekToMs < prevSeekToMs -> {
            awaitSeekToPrevDecode(seekToMs)
            getImageReaderBitmap()
        }

        // シーク不要
        // 例えば 30fps なら 33ms 毎なら新しい Bitmap を返す必要があるが、 16ms 毎に要求されたら Bitmap 変化しないので
        // つまり映像のフレームレートよりも高頻度で Bitmap が要求されたら、前回取得した Bitmap がそのまま使い回せる
        seekToMs < latestDecodePositionMs && prevBitmap != null -> {
            prevBitmap!!
        }

        else -> {
            // 巻き戻しでも無く、フレームを取り出す必要がある
            awaitSeekToNextDecode(seekToMs)
            getImageReaderBitmap()
        }
    }
    prevSeekToMs = seekToMs
    return@withContext videoFrameBitmap
}
```

### Jetpack Compose で作った UI 側で呼び出して使う
ボタンと画像を表示するやつをおいて、ボタンを押したら動画を選ぶやつを開いて、選んだら↑の処理を呼び出す。  
これで一通り出来たかな。ボタンを押して動画を選べば出てきます。

```kotlin
fun VideoFrameBitmapExtractorScreen() {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val bitmap = remember { mutableStateOf<ImageBitmap?>(null) }

    // フレームを取り出すやつと取り出した位置
    val currentPositionMs = remember { mutableStateOf(0L) }
    val videoFrameBitmapExtractor = remember { VideoFrameBitmapExtractor() }

    val videoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri ->
            uri ?: return@rememberLauncherForActivityResult
            scope.launch {
                videoFrameBitmapExtractor.prepareDecoder(context, uri)
                currentPositionMs.value = 1000
                bitmap.value = videoFrameBitmapExtractor.getVideoFrameBitmap(currentPositionMs.value).asImageBitmap()
            }
        }
    )

    // 破棄時
    DisposableEffect(key1 = Unit) {
        onDispose { videoFrameBitmapExtractor.destroy() }
    }

    Scaffold(
        topBar = {
            TopAppBar(title = { Text(text = "VideoFrameBitmapExtractorScreen") })
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {

            if (bitmap.value != null) {
                Image(
                    modifier = Modifier.fillMaxWidth(),
                    bitmap = bitmap.value!!,
                    contentDescription = null
                )
            }

            Text(text = "currentPositionMs = ${currentPositionMs.value}")

            Button(onClick = {
                videoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly))
            }) { Text(text = "取り出す") }

            Button(onClick = {
                scope.launch {
                    currentPositionMs.value += 16
                    bitmap.value = videoFrameBitmapExtractor.getVideoFrameBitmap(currentPositionMs.value).asImageBitmap()
                }
            }) { Text(text = "16ms 進める") }

        }
    }

}
```

これを好きなところで表示してください。  
好きな場所でいいので、今回は検証のために`MainActivity.kt`とかで。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            AndroidVideoFrameFastNextExtractorTheme {
                VideoFrameBitmapExtractorScreen()
            }
        }
    }
}
```

# 使ってみた
ちゃんと`Image()`に映像のフレームが写っています。  
ちょっとずつだけど`進める`を押せば動画も進んでいそう。

![Imgur](https://imgur.com/chqM8U2.png)

# ベンチマーク
頑張って作ったので、`MediaMetadataRetriever#getFrameAtTime`よりも早くないと困るぞ・・・！  
今回は正確なフレームが欲しいので、`MediaMetadataRetriever#getFrameAtTime`の第2引数には遅いですが`MediaMetadataRetriever.OPTION_CLOSEST`を指定します。  
意地悪ですね・・

## 3枚フレーム取り出してみる
とりあえず連続して3回取り出してみる。  

```kotlin
val totalTimeVideoFrameBitmapExtractor = remember { mutableStateOf(0L) }
val totalTimeMetadataRetriever = remember { mutableStateOf(0L) }

fun startVideoFrameBitmapExtractorBenchMark(uri: Uri?) {
    uri ?: return
    scope.launch(Dispatchers.Default) {
        totalTimeVideoFrameBitmapExtractor.value = 0
        totalTimeVideoFrameBitmapExtractor.value = measureTimeMillis {
            VideoFrameBitmapExtractor().apply {
                prepareDecoder(context, uri)
                getVideoFrameBitmap(1_000)
                getVideoFrameBitmap(1_100)
                getVideoFrameBitmap(1_200)
            }
        }
    }
}

fun startMediaMetadataRetrieverBenchMark(uri: Uri?) {
    uri ?: return
    scope.launch(Dispatchers.Default) {
        totalTimeMetadataRetriever.value = 0
        totalTimeMetadataRetriever.value = measureTimeMillis {
            MediaMetadataRetriever().apply {
                setDataSource(context, uri)
                getFrameAtTime(1_000_000, MediaMetadataRetriever.OPTION_CLOSEST)
                getFrameAtTime(1_100_000, MediaMetadataRetriever.OPTION_CLOSEST)
                getFrameAtTime(1_200_000, MediaMetadataRetriever.OPTION_CLOSEST)
            }
        }
    }
}
```

うーん？  
`Xperia`に関しては自作しないほうが速いぞ・・？  
なんなら`Google Pixel`の方も若干速いくらいで誤差っちゃ誤差かもしれない

- Xperia 1 V
    - 自前の`VideoFrameBitmapExtractor`
        - 787 ms
        - 790 ms
    - `MediaMetadataRetriever#getFrameAtTime`
        - 346 ms
        - 342 ms
- Pixel 8 Pro
    - 自前の`VideoFrameBitmapExtractor`
        - 1104 ms
        - 1291 ms
    - `MediaMetadataRetriever#getFrameAtTime`
        - 1548 ms
        - 1515 ms
- Pixel 6 Pro
    - 自前の`VideoFrameBitmapExtractor`
        - 1127 ms
        - 1072 ms
    - `MediaMetadataRetriever#getFrameAtTime`
        - 3235 ms
        - 2810 ms

## 0から3秒まで連続してフレームを取り出してみる
い、、いや、連続してフレームを取る際に早くなっていればええんや。  
こっちが早くなっていれば万々歳

```kotlin
// 0 から 3 秒まで、33 ずつ増やした数字の配列（30fps = 33ms なので）
val BenchMarkFramePositionMsList = (0 until 3_000L step 33)

val totalTimeVideoFrameBitmapExtractor = remember { mutableStateOf(0L) }
val totalTimeMetadataRetriever = remember { mutableStateOf(0L) }

fun startVideoFrameBitmapExtractorBenchMark(uri: Uri?) {
    uri ?: return
    scope.launch(Dispatchers.Default) {
        totalTimeVideoFrameBitmapExtractor.value = 0
        totalTimeVideoFrameBitmapExtractor.value = measureTimeMillis {
            VideoFrameBitmapExtractor().apply {
                prepareDecoder(context, uri)
                BenchMarkFramePositionMsList.forEach { framePositionMs ->
                    println("framePositionMs = $framePositionMs")
                    getVideoFrameBitmap(framePositionMs)
                }
            }
        }
    }
}

fun startMediaMetadataRetrieverBenchMark(uri: Uri?) {
    uri ?: return
    scope.launch(Dispatchers.Default) {
        totalTimeMetadataRetriever.value = 0
        totalTimeMetadataRetriever.value = measureTimeMillis {
            MediaMetadataRetriever().apply {
                setDataSource(context, uri)
                BenchMarkFramePositionMsList.forEach { framePositionMs ->
                    println("framePositionMs = $framePositionMs")
                    getFrameAtTime(framePositionMs * 1000, MediaMetadataRetriever.OPTION_CLOSEST)
                }
            }
        }
    }
}
```

結果はこちらです。  
**連続して取得する方はかなり速いです**。まあ巻き戻ししなければ速く取れるように作っているのでそれはそうなのですが。  
うれしい！ﾊｯﾋﾟｰﾊｯﾋﾟｰﾊｯﾋﾟｰ（猫ぴょんぴょん）  

- Xperia 1 V
    - 自前の`VideoFrameBitmapExtractor`
        - 2264 ms
        - 2608 ms
    - `MediaMetadataRetriever#getFrameAtTime`
        - 12877 ms
        - 22712 ms
- Pixel 8 Pro
    - 自前の`VideoFrameBitmapExtractor`
        - 3108 ms
        - 3814 ms
    - `MediaMetadataRetriever#getFrameAtTime`
        - 54782 ms
        - 55143 ms
- Pixel 6 Pro
    - 自前の`VideoFrameBitmapExtractor`
        - 4539 ms
        - 4407 ms
    - `MediaMetadataRetriever#getFrameAtTime`
        - 135828 ms
        - 137949 ms

# 動画からフレームを連続して取り出して保存してみる
連続して取り出して保存する処理を書きました。  
↑で書いた`Bitmap`取り出しした後`MediaStore`を使って写真フォルダに保存する処理が入ってます。多分保存処理があんまり速度でないんですけど、、、

https://github.com/takusan23/AndroidVideoFrameFastNextExtractor/blob/875cf02a003a6d186f5b0f695d5ee08e9d895360/app/src/main/java/io/github/takusan23/androidvideoframefastnextextractor/ui/screen/VideoFrameExtractAndSaveScreen.kt#L121

![Imgur](https://imgur.com/26wpmIo.png)

## 連続して取り出すのは得意
巻き戻ししなければキーフレームまで戻らないので、次のフレームの取得は早くなります。（コンテナから次のデータ取ってデコーダーに入れてでてくるのを待てば良い）  
試した感じかなりいい成績ですよ。

自前↓  
![Imgur](https://imgur.com/26wpmIo.png)

MediaMetadataRetriever↓  
![Imgur](https://imgur.com/XjQHv1E.png)

自前↓  
![Imgur](https://imgur.com/Q7uPn8K.png)

MediaMetadataRetriever↓  
![Imgur](https://imgur.com/DOO21Pl.png)

## 苦手なのもある
連続して取り出さない場合は`MediaMetadataRetriever`の方が早くなることがあります。（1秒で1フレームずつ取り出すとか）  
あと巻き戻す場合は完敗だとおもいます。

自前↓  
![Imgur](https://imgur.com/tMKHO7W.png)

MediaMetadataRetriever↓  
![Imgur](https://imgur.com/ugXa0dA.png)

# ソースコードです
https://github.com/takusan23/AndroidVideoFrameFastNextExtractor

# おまけ
こっから先は知見の共有なので、本編とは関係ないです。

## MediaCodec の出力先を OpenGL 無し ImageReader にするのは辞めておいたほうがいい
私が試した限り動かなかった。  
あと動画によっては`Google Pixel`でもぶっ壊れているフレームを吐き出してた。。。

### Google Pixel 以外で落ちる
*Google Pixel で動いていれば他でも動くと思ってた時期が私にもありました*  
*私の名前は ImageReader です。Google Pixel を使ってます（それ以外では動かないので :( ）*

素直に`MediaCodec`の出力先を`ImageReader`にしたら、`Google Pixel`以外で落ちた。  
動かないの書いても無駄ですが一応。`MediaCodec`で使う`ImageReader`は`YUV_420_888`にする必要があります。

```kotlin
// Surface 経由で Bitmap が取れる ImageReader つくる
imageReader = ImageReader.newInstance(videoWidth, videoHeight, ImageFormat.YUV_420_888, 2)
// 映像デコーダー起動
// デコード結果を ImageReader に流す
decodeMediaCodec = MediaCodec.createDecoderByType(codecName).apply {
    configure(mediaFormat, imageReader!!.surface, null, 0)
}
decodeMediaCodec!!.start()
```

ただ、`Google Pixel`以外の端末（`Qualcomm Snapdragon` 搭載端末？）だとなんか落ちて、  
しかもネイティブの部分（`C++ か何かで書かれてる部分`）で落ちているのでかなり厳しい雰囲気。

```plaintext
java_vm_ext.cc:591] JNI DETECTED ERROR IN APPLICATION: non-zero capacity for nullptr pointer: 1
java_vm_ext.cc:591]     in call to NewDirectByteBuffer
java_vm_ext.cc:591]     from android.media.ImageReader$SurfaceImage$SurfacePlane[] android.media.ImageReader$SurfaceImage.nativeCreatePlanes(int, int, long)
runtime.cc:691] Runtime aborting...
runtime.cc:691] Dumping all threads without mutator lock held
runtime.cc:691] All threads:
runtime.cc:691] DALVIK THREADS (26):
runtime.cc:691] "main" prio=10 tid=1 Native
```

というわけで調べたら、デコーダーに渡す`MediaFormat`で、`mediaFormat.setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Flexible)`を指定すれば直るって！  

- https://github.com/google/ExoPlayer/issues/8920
- https://cs.android.com/android/platform/superproject/main/+/main:cts/tests/tests/media/decoder/src/android/media/decoder/cts/ImageReaderDecoderTest.java

```kotlin
// Surface 経由で Bitmap が取れる ImageReader つくる
imageReader = ImageReader.newInstance(videoWidth, videoHeight, ImageFormat.YUV_420_888, 2)

// 映像デコーダー起動
// デコード結果を ImageReader に流す
decodeMediaCodec = MediaCodec.createDecoderByType(codecName).apply {
    // Google Pixel 以外（Snapdragon 搭載機？）でおちるので
    mediaFormat.setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Flexible)
    configure(mediaFormat, imageReader!!.surface, null, 0)
}
decodeMediaCodec!!.start()
```

### 取り出したフレームが壊れている

でもこれもだめで、クラッシュこそしなくなりましたが、  
画像がぶっ壊れている。ちゃんと出てくる画像もあるけど大体失敗してる。  
ちなみに`Pixel`でも失敗したので`MediaCodec`とか`ImageReader`何もわからない。

![Imgur](https://imgur.com/TKH0WFY.png)  
↑ 謎の緑の線

![Imgur](https://imgur.com/v17PlQC.png)  
↑ 砂嵐のように何も見えない

![Imgur](https://imgur.com/rO4nnRG.png)  
↑ Pixel でもだめだった

![Imgur](https://imgur.com/ZPJMzk2.png)  
↑ なぜかこれだけ動いた

解決策があるのか不明ですが、、、結局`OpenGL`を一枚噛ませたら直ったのでもうそれで。  
`MediaCodec`周りは`Surface`直指定より`OpenGL`を噛ませておくと安牌。なんだろう、`SoC （というか GPU ？）`の違いなのかな。  
あ、ちなみにもしこれがうまく行っても、`YUV_420_888`を`Bitmap`にするのが面倒そう。  

`MediaCodec`の映像入出力には`Surface`以外に`ByteBuffer`（`ByteArray`）も使えますが、`ByteBuffer`だと色の面倒も自前で調整しないといけない？？？  
スマホの`SoC`違ったら動かないとか嫌すぎる・・・  

それに比べると`OpenGL`周りの用意は面倒なものの、Androidの`SurfaceTexture`、デコーダーから出てくるこの色？カラーフォーマット？の扱い（`YUV`とか`RGB`とか）を勝手に吸収してくれている可能性。  
`stackoverflow`だとその事に関して言及してるんだけど、公式だとどこで`Surface`のカラーフォーマットの話書いてあるんだろうか。  
- https://stackoverflow.com/questions/46244179/
- https://stackoverflow.com/questions/60748942/

`OpenGL ES`周りは厳しいけど（`AOSP`コピペで何がなんだかわからない）、けど、それなりのメリットはありそうです。  
あとフラグメントシェーダーで加工できるのもメリットだけど難しそう。

# おわりに
こんな長々と書く予定はありませんでした。  
ぜひ試す際はいろんな動画を入れてみるといいと思います、たまに変に動くやついる↑もそれで見つけた