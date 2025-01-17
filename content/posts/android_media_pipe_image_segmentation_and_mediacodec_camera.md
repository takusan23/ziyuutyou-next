---
title: Android で MediaPipe のイメージセグメンテーションしてみる
created_at: 2024-07-18
tags:
- Android
- MediaCodec
- MediaPipe
- Camera2API
---
どうもこんばんわ。  
久しぶりに`Twitter`開いたら、げっちゅ屋の実店舗がなくなってしまうと出てきてとても悲しい。そんな。。

https://x.com/getchuakiba/status/1813151430280421629

あの階段もう見れないの・・？

# 本題
`MediaPipe`とかいうやつを`Media3 Transformer`調べてるときに見つけた。  
どうやら機械学習を元に色々できるらしい、その中でも今回は`Image Segmentation`をやってみる

https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter

## Image Segmentation
いめーじせぐめんてーしょん

写真の中の人物と、背景を検出してそれぞれに色を付けて、サーモグラフィーみたいなのを出力してくれる。  
テレビ電話によくある背景ぼかし機能は、この`Image Segmentation`を使って作っているらしい。多分。

`iPhone`には写真から人物だけを切り抜いたり、ロック画面の時計が人物とか建物の裏側に表示されるあれ、多分この辺の技術を使ってる。  
しらんけど。

どうやら`MediaPipe`は機械学習のモデルをアプリにバンドルしてるからインターネット接続せずに使える？みたい。

## 機械学習のやつ多すぎ
https://ai.google.dev/edge?hl=ja

- TensorFlow
    - 多分ガチの機械学習、何もわからない
- MediaPipe
    - すでに用意された機械学習のやつ？
    - `Android`以外にも他のプラットフォーム版があるらしい
    - `Image Segmentation`以外にも画像分類とかあるらしい
- MLKit
    - 完全にスマホ向け？

## 環境

| なまえ         | あたい                        |
|----------------|-------------------------------|
| 端末           | Pixel 8 Pro / Xperia 1 V      |
| Android Studio | Android Studio Koala 2024.1.1 |
| minSdk         | 24 （`MediaPipe`都合）        |

# とりあえずイメージセグメンテーションで分類してみる
まずは動かしてみるだけなので、ドキュメントそのまま。  
https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter

とりあえず人物が写った写真`Bitmap`を渡したら、イメージセグメンテーション結果の`Bitmap`（サーモグラフィーみたいなの）が表示されるようにしてみる。  

## 適当なプロジェクトを作り、MediaPipeを入れる
`MediaPipe`のために`minSdk`は`24`（`Android 7`）にしないといけない？  
`app/build.gradle.kts`に`MediaPipe`を追加して

```kotlin

dependencies {
    // Image Segmentation
    // MediaPipe
    implementation("com.google.mediapipe:tasks-vision:0.10.14")

    // 以下省略...
```

モデルを追加します。今回は`DeepLab-v3`を使わせてもらうことにした。  
ここからダウンロードできます。  
https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter#deeplab-v3

`src/app/main/assets/`にダウンロードしたファイルを配置します。  

![Imgur](https://i.imgur.com/zFVhNBd.png)

ファイルが表示される部分、`Project`表示にすることでそのままのファイル構造が出るようになります。  
普段は`Android`表示がアクセスしやすいんですけどね

![Imgur](https://i.imgur.com/jGf4Aex.png)

## MediaPipe を使うクラスを作る
といっても`MediaPipe`がほぼやってくれたので、モデルのパスを指定したり、入力`Bitmap`を受け付ける部分しか書いてない。  

そういえば、こちらの使わせてもらったモデル`DeepLabV3`、人物含めて`20 種類`（？）分類ができるらしい。ので参考にしたコードではそれぞれ`20 種類`に別々の色を当てていたのですが、  
今回はとりあえず背景（ラベル0）とそれ以外の2色しか使っていません。

```kotlin
/** MediaPipe で ImageSegmentation する */
class MediaPipeImageSegmentation(context: Context) {

    private val imageSegmenter = ImageSegmenter.createFromOptions(
        context,
        ImageSegmenter.ImageSegmenterOptions.builder().apply {
            setBaseOptions(BaseOptions.builder().apply {
                // DeepLabV3
                // assets に置いたモデル
                setModelAssetPath("deeplab_v3.tflite")
            }.build())
            setRunningMode(RunningMode.IMAGE)
            setOutputCategoryMask(true)
            setOutputConfidenceMasks(false)
        }.build()
    )

    /** 推論して分類する。処理が終わるまで止まります。 */
    suspend fun segmentation(bitmap: Bitmap) = withContext(Dispatchers.Default) {
        val mpImage = BitmapImageBuilder(bitmap).build()
        val segmenterResult = imageSegmenter.segment(mpImage)
        val segmentedBitmap = convertBitmapFromMPImage(segmenterResult.categoryMask().get())
        return@withContext segmentedBitmap
    }

    /** [MPImage]から[Bitmap]を作る */
    private fun convertBitmapFromMPImage(mpImage: MPImage): Bitmap {
        val byteBuffer = ByteBufferExtractor.extract(mpImage)
        val pixels = IntArray(byteBuffer.capacity())

        for (i in pixels.indices) {
            // Using unsigned int here because selfie segmentation returns 0 or 255U (-1 signed)
            // with 0 being the found person, 255U for no label.
            // Deeplab uses 0 for background and other labels are 1-19,
            // so only providing 20 colors from ImageSegmenterHelper -> labelColors

            // 使ったモデル（DeepLab-v3）は、0 が背景。それ以外の 1 から 19 までが定義されているラベルになる
            // 今回は背景を青。それ以外は透過するようにしてみる。
            val index = byteBuffer.get(i).toUInt() % 20U
            val color = if (index.toInt() == 0) Color.BLUE else Color.TRANSPARENT
            pixels[i] = color
        }
        return Bitmap.createBitmap(
            pixels,
            mpImage.width,
            mpImage.height,
            Bitmap.Config.ARGB_8888
        )
    }
}
```

## UI 部分
画像を選ぶ`PhotoPicker`を開くボタンと、結果を表示する`Image()`を置きます。  
推論は`suspend fun`なので、`rememberCoroutineScope()`も

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidMediaPipeImageSegmentationTheme {
                ImageSegmentationScreen()
            }
        }
    }
}

@Composable
private fun ImageSegmentationScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val mediaPipeImageSegmentation = remember { MediaPipeImageSegmentation(context) }

    val inputBitmap = remember { mutableStateOf<ImageBitmap?>(null) }
    val segmentedBitmap = remember { mutableStateOf<ImageBitmap?>(null) }

    val photoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri ->
            uri ?: return@rememberLauncherForActivityResult
            // 推論はコルーチンでやる
            scope.launch {
                // Bitmap を取得。Glide や Coil が使えるならそっちで取得したほうが良いです
                val bitmap = context.contentResolver.openInputStream(uri)
                    .use { BitmapFactory.decodeStream(it) }
                // 推論
                val resultBitmap = mediaPipeImageSegmentation.segmentation(bitmap)
                // UI に表示
                inputBitmap.value = bitmap.asImageBitmap()
                segmentedBitmap.value = resultBitmap.asImageBitmap()
            }
        }
    )

    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding)) {

            Button(onClick = {
                photoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
            }) { Text(text = "写真を選ぶ") }

            if (inputBitmap.value != null) {
                Image(
                    bitmap = inputBitmap.value!!,
                    contentDescription = null
                )
            }
            if (segmentedBitmap.value != null) {
                Image(
                    bitmap = segmentedBitmap.value!!,
                    contentDescription = null
                )
            }
        }
    }
}
```

## 使ってみる
おお～  
それっぽい、背景が青だからなんか`BB 素材`が作れそう雰囲気がある。

![Imgur](https://i.imgur.com/GV786Pn.png)

### セグメンテーションのベンチマーク
```kotlin
// 推論はコルーチンでやる
scope.launch {
    // Bitmap を取得。Glide や Coil が使えるならそっちで取得したほうが良いです
    val bitmap = context.contentResolver.openInputStream(uri)
        .use { BitmapFactory.decodeStream(it) }

    // 推論
    val resultBitmap: Bitmap
    val time = measureTimeMillis {
        resultBitmap = mediaPipeImageSegmentation.segmentation(bitmap)
    }
    println("time = $time")

    // UI に表示
    inputBitmap.value = bitmap.asImageBitmap()
    segmentedBitmap.value = resultBitmap.asImageBitmap()
}
```

`width = 3840 / height = 2160`なのでまあ大きい画像。  
多分もっと小さくしてから解析するべきです。

| なまえ      | OS      | SoC                         | 1回目       | 2回目       |
|-------------|---------|-----------------------------|-------------|-------------|
| Pixel 8 Pro | 15 Beta | Google Tensor G3            | 2365 ミリ秒 | 2394 ミリ秒 |
| Xperia 1 V  | 14      | Qualcomm Snapdragon 8 Gen 2 | 747 ミリ秒  | 525 ミリ秒  |

`Google Tensor`が遅いのか`Snapdragon`が速いのかよく分からない。`Beta`だから遅いとかもあるのかな。  
ま、、、まあ価格差がザックリ 7 万円くらいある（`Xperia`のが高い、しかも`Pixel`はキャッシュバックがあったのでそれ含めるともっと差が）ので速くなりそうではあるけど、にしてもここまで差が出るものなの（？）

**それ以前にリリースビルドじゃないのでそれも問題かも**

### ここまでソースコード
https://github.com/takusan23/AndroidMediaPipeImageSegmentation

# BB 素材作れるかも
`BB 素材`というか、人物以外の背景部分を単色にして、動画編集時にクロマキー機能で透過させるあれ。  
あの単色にする際にこのイメージセグメンテーションが使えそう。というか↑の例が背景青だから余計`BB 素材`感が

## さっき作ったやつを直していく
やるべきことは、`MediaPipe`を動画モード（静止画モードとの差がよく分からない）と、  
動画一枚一枚を取り出して解析して、動画にする作業。

## 動画モードにする
`RunningMode`、ドキュメントを見ても静止画、動画、ライブ（カメラ映像）の三種類があるらしい。  
ライブモードはコールバックになってて、速度が速すぎて間に合わない場合は勝手に捨ててくれるらしい。  
また、動画モードは映像フレームの時間を渡す必要があります。のでそこも直す。

https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter/android#run_the_task

```kotlin
class MediaPipeImageSegmentation(context: Context) {

    private val imageSegmenter = ImageSegmenter.createFromOptions(
        context,
        ImageSegmenter.ImageSegmenterOptions.builder().apply {
            setBaseOptions(BaseOptions.builder().apply {
                // DeepLabV3
                // assets に置いたモデル
                setModelAssetPath("deeplab_v3.tflite")
            }.build())
            setRunningMode(RunningMode.VIDEO) // 動画モード
            setOutputCategoryMask(true)
            setOutputConfidenceMasks(false)
        }.build()
    )

    /** 推論して分類する。処理が終わるまで止まります。 */
    suspend fun segmentation(bitmap: Bitmap, framePositionMs: Long) = withContext(Dispatchers.Default) {
        // framePositionMs を引数にとって、segmentForVideo を呼び出すようにする
        val mpImage = BitmapImageBuilder(bitmap).build()
        val segmenterResult = imageSegmenter.segmentForVideo(mpImage, framePositionMs)
        val segmentedBitmap = convertBitmapFromMPImage(segmenterResult.categoryMask().get())
        return@withContext segmentedBitmap
    }

```
## 動画に手をいれるライブラリ
は前作ったのを入れます。`MavenCentral`にあります。  
何をしてくれるものなのか、詳しくは前書いた記事で→ https://takusan.negitoro.dev/posts/android_video_editor_akari_droid/#アプリの概要

```kotlin
dependencies {
    // Image Segmentation
    // MediaPipe
    implementation("com.google.mediapipe:tasks-vision:0.10.14")

    // ↓これを足す
    // 動画を編集すると言うか、MediaCodec を代わりに叩いてくれる
    implementation("io.github.takusan23:akaricore:4.0.0")

    // 以下省略
```

### ライブラリ入れたくない
分かる、メンテするか分からんしな。  
ソースコードをコピーするほうが都合がいい場合、この2️つと、2つが参照している`gl`パッケージの中身をコピーして来れば良いはず。多分以下のクラスを取ってくれば良いはず。

#### ライブラリのソースコード
https://github.com/takusan23/AkariDroid/blob/master/akari-core/

#### ひつようなもの
- CanvasVideoProcessor.kt
- VideoFrameBitmapExtractor.kt
- AkariCoreInputOutput.kt
- MediaMuxerTool.kt
- CanvasRenderer.kt
- InputSurface.kt
- MediaExtractorTool.kt
- FrameExtractorRenderer.kt

#### 詳細記事
`Canvas`で書いて動画を作るやつと、動画から一枚一枚`Bitmap`を取り出すやつの詳細です。  
それぞれ一本ずつ記事があります。。。

- https://takusan.negitoro.dev/posts/android_get_video_frame_mediacodec/
- https://takusan.negitoro.dev/posts/android_canvas_to_video/

## UI を動画選択用に直す
プレビューの`Image()`とかはいらないので、映像から一枚一枚フレームを取り出し、イメージセグメンテーションにかけて、動画を作る処理をする。  
動画から一枚一枚取り出す処理と動画を作る処理はもう（ライブラリを入れるかコピーするか）で出来ているので、組み合わせるだけ！

あ、ちなみに音声は消えます。  
音声トラックも`mp4`コンテナに入れれば音声も流れますが、まあ BB 素材にいらんやろ

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidVideoBackgroundTransparentEditorTheme {
                ImageSegmentationScreen()
            }
        }
    }
}

@Composable
private fun ImageSegmentationScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val mediaPipeImageSegmentation = remember { MediaPipeImageSegmentation(context) }

    // エンコード済み時間と処理中かどうか
    val encodedPositionMs = remember { mutableLongStateOf(0) }
    val isRunning = remember { mutableStateOf(false) }

    val videoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri ->
            // 選んでもらったら処理開始
            uri ?: return@rememberLauncherForActivityResult
            scope.launch {
                isRunning.value = true

                // 動画サイズが欲しい
                val metadataRetriever = MediaMetadataRetriever().apply {
                    context.contentResolver.openFileDescriptor(uri, "r")
                        ?.use { setDataSource(it.fileDescriptor) }
                }
                val videoWidth = metadataRetriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)!!.toInt()
                val videoHeight = metadataRetriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)!!.toInt()

                // 一枚一枚取り出すやつ。MetadataRetriever より速い
                val videoFrameBitmapExtractor = VideoFrameBitmapExtractor()
                videoFrameBitmapExtractor.prepareDecoder(uri.toAkariCoreInputOutputData(context))

                // BB 素材保存先
                val resultVideoMetadata = contentValuesOf(
                    MediaStore.Video.VideoColumns.DISPLAY_NAME to "${System.currentTimeMillis()}.mp4",
                    MediaStore.Video.VideoColumns.MIME_TYPE to "video/mp4",
                    MediaStore.MediaColumns.RELATIVE_PATH to "${Environment.DIRECTORY_MOVIES}/AndroidVideoBackgroundBlueBackEditor"
                )
                val resultVideoFileUri = context.contentResolver.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, resultVideoMetadata)!!

                // Canvas から動画を作るやつ
                val paint = Paint()
                CanvasVideoProcessor.start(
                    output = resultVideoFileUri.toAkariCoreInputOutputData(context),
                    outputVideoWidth = videoWidth,
                    outputVideoHeight = videoHeight,
                    onCanvasDrawRequest = { positionMs ->
                        // 一枚一枚取り出す
                        val videoFrameBitmap = videoFrameBitmapExtractor.getVideoFrameBitmap(positionMs)
                        if (videoFrameBitmap != null) {
                            // 推論する
                            val segmentedBitmap = mediaPipeImageSegmentation.segmentation(videoFrameBitmap, positionMs)

                            // Canvas に書き込む
                            // 背景を青にした推論結果を上に重ねて描画することで、BB 素材っぽく
                            drawBitmap(videoFrameBitmap, 0f, 0f, paint)
                            drawBitmap(segmentedBitmap, 0f, 0f, paint)
                        }

                        // 進捗を UI に
                        encodedPositionMs.longValue = positionMs
                        // とりあえず 60 秒まで動画を作る
                        positionMs <= 60_000
                    }
                )

                isRunning.value = false
            }
        }
    )

    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding)) {

            Button(onClick = {
                videoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly))
            }) { Text(text = "動画を選ぶ") }

            if (isRunning.value) {
                CircularProgressIndicator()
                Text(text = "処理済みの時間 : ${encodedPositionMs.longValue} ミリ秒")
            }
        }
    }
}
```

## 使ってみる
動画を選ぶを押して人物が写っている動画を選ぶ。  
選ぶと処理が始まるので、数分待つ。

![Imgur](https://i.imgur.com/RbgvG9X.png)

## 出力結果
`MediaPipe`すげ～  
職人が作るのと比べるとダメだけどそれでもすごいと思う。

- https://www.youtube.com/watch?v=LsBq0HdNbp8
    - <video controls src="https://github.com/user-attachments/assets/7ad488fa-fae3-4c6b-91ab-a1bc7eb6c1c7" width="300"></video>
- https://www.youtube.com/watch?v=cVxT-MSdipg
    - <video controls src="https://github.com/user-attachments/assets/01e05980-64da-45d2-b96b-6812b8d34bfb" width="300"></video>
    - <video controls src="https://github.com/user-attachments/assets/c7ad54c9-4339-47c4-a6a5-b0cde21707dd" width="300"></video>

## BB 素材として使えます
青色をくり抜くようにすれば BB 素材です。  
他の動画編集アプリでも使えるはず。

![Imgur](https://i.imgur.com/ljp9Qry.png)

![Imgur](https://i.imgur.com/A5Ghj8P.png)

### BB素材作成ベンチマーク
#### 時間測る関数
時間測るために`currentTimeMillis`仕込むの面倒なので、インライン関数を用意しました。  
普通の関数と違って、ビルド時に呼び出し元に展開されます。多分該当箇所を逆コンパイルすると、関数呼び出しではなく、関数の中身が出てくるんじゃないかなと思います。  
メリットはいくつかありますが、呼び出し元に展開されるので、`サスペンド関数`でも気にせず使える点ですね。  

```kotlin
// 時間測って println してくれるやつ
inline fun <T> printTime(task: () -> T): T {
    val taskResult: T
    val time = measureTimeMillis {
        taskResult = task()
    }
    println("PrintTime $time")
    return taskResult
}
```
#### 結果
この関数を`scope.launch { printTime { /* エンコード処理 */ } }`のように`launch`の中身全部の時間を計測するようにしてみた。

まあこれも**リリースビルド**じゃないのであんまり真に受けないでください。  
使った動画はこれの`720p`版。https://www.youtube.com/watch?v=LsBq0HdNbp8  
`10秒間`作ってみた結果。

| なまえ      | OS      | SoC                         | 1回目         | 2回目         |
|-------------|---------|-----------------------------|---------------|---------------|
| Pixel 8 Pro | 15 Beta | Google Tensor G3            | 115301 ミリ秒 | 115631 ミリ秒 |
| Xperia 1 V  | 14      | Qualcomm Snapdragon 8 Gen 2 | 38167 ミリ秒  | 38313 ミリ秒  |

なんでこんな差が出るの・・？

## BB素材をイメージセグメンテーションで作るアプリのソースコードとAPK
需要あるかな  

https://github.com/takusan23/AndroidVideoBackgroundBlueBackEditor

# 前作った、前面背面を同時に撮影するカメラにイメージセグメンテーションを組み込む
元ネタがこれ。なんかこの記事結構見られてそうなので、`令和最新版 Android で前面と背面を同時に撮影できるカメラを作りたい`を書きました。  
コルーチンをもう少し真面目に使って、小手先の技というか、雑な部分をちょっと改善しました。

https://takusan.negitoro.dev/posts/android_front_back_camera_2024/  

ここから先は、↑の記事の続きです。↑で書いたカメラアプリのプログラムを元に、遊んでいきます。  

というわけで、今回の後半はこの自撮りカメラ映像を`MediaPipe のイメージセグメンテーション`に投げて、解析結果を元に、自撮りカメラの顔だけを描画するアプリに改善してみようと思います。  
自撮りカメラから顔だけ描画して、背景は描画しない（背面カメラ映像になる）みたいな！！！！！

## イメージセグメンテーション結果の画像をテクスチャとして使えるように
`OpenGL ES`周りの修正から初めます。  
`sSegmentedTextureHandle`変数を追加して、`Uniform`変数を探してそれに入れます。フラグメントシェーダー側の`uniform sampler2D sSegmentedTexture;`のハンドルがここに入ります。  

そしたら、`glGenTextures`の数を`3`にします。背面カメラ映像+前面カメラ映像+イメージセグメンテーションの結果の画像で 3 枚。  
イメージセグメンテーション用の`テクスチャID`変数`segmentedTextureId`を作り、渡して、`glBindTexture`とかします。

```kotlin
sSegmentedTextureHandle = GLES20.glGetUniformLocation(mProgram, "sSegmentedTexture")
checkGlError("glGetUniformLocation sSegmentedTexture")
if (sSegmentedTextureHandle == -1) {
    throw RuntimeException("Could not get attrib location for sSegmentedTexture")
}

// テクスチャ ID を払い出してもらう
// 前面カメラの映像、背面カメラの映像で2個
// イメージセグメンテーション用にもう1個
val textures = IntArray(3)
GLES20.glGenTextures(3, textures, 0)

// 以下省略...

// 3個目はイメージセグメンテーションの結果
segmentedTextureId = textures[2]
GLES20.glActiveTexture(GLES20.GL_TEXTURE2)
GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, segmentedTextureId)
GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR)
GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR)
checkGlError("glTexParameteri")
```

## イメージセグメンテーション結果を渡す口を作る
`uniform sampler2D sSegmentedTexture`で参照できる`Bitmap`をセットする関数です。

```kotlin
/**
 * イメージセグメンテーションの結果を渡す
 *
 * @param segmentedBitmap MediaPipe から出てきたやつ
 */
fun updateSegmentedBitmap(segmentedBitmap: Bitmap) {
    // texImage2D、引数違いがいるので注意
    GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, segmentedTextureId)
    GLUtils.texImage2D(GLES20.GL_TEXTURE_2D, 0, segmentedBitmap, 0)
    checkGlError("GLUtils.texImage2D")
}
```

## 描画する関数
`テクスチャのID`をセットしてなかったのでここでします。  
`GLES20.glUniform1i(sSegmentedTextureHandle, 2)`の部分ですね。

```kotlin
// テクスチャの ID をわたす
GLES20.glUniform1i(sFrontCameraTextureHandle, 0) // GLES20.GL_TEXTURE0 なので 0
GLES20.glUniform1i(sBackCameraTextureHandle, 1) // GLES20.GL_TEXTURE1 なので 1
GLES20.glUniform1i(sSegmentedTextureHandle, 2) // GLES20.GL_TEXTURE2 なので 2
checkGlError("glUniform1i sFrontCameraTextureHandle sBackCameraTextureHandle")
```

## フラグメントシェーダーを修正
まずはコードを。こちらです。  
`sSegmentedTexture`を`texture2D`に渡すと、イメージセグメンテーション結果の画像が参照できます。  

これを使い、前面カメラを描画するモードだったら、描画するピクセルに対応するイメージセグメンテーション結果の色を取り出して、色が青かどうかを判定します。  
`length()`を使うことで色がどれくらい近いかの判定ができるそうです（よく分からないので、`0.3`をしきい値にしている）。

もし描画するべきピクセルのイメージセグメンテーション結果が青色、つまり背景だった場合は`discard`で描画しない！とします。  
青色じゃない場合は、前面カメラ映像の色をそのピクセルに指定します。  

背面カメラの方は背面カメラの映像を写しているだけですね。

```glsl
#extension GL_OES_EGL_image_external : require
precision mediump float;

varying vec2 vTextureCoord;
uniform samplerExternalOES sFrontCameraTexture;
uniform samplerExternalOES sBackCameraTexture;
uniform sampler2D sSegmentedTexture;

// sFrontCameraTexture を描画する場合は 1。
// sBackCameraTexture は 0。
uniform int iDrawFrontCameraTexture;

void main() { 
  // 出力色
  vec4 outColor = vec4(0., 0., 0., 1.);

  // どっちを描画するのか
  if (bool(iDrawFrontCameraTexture)) {
    // フロントカメラ（自撮り）
    vec4 cameraColor = texture2D(sFrontCameraTexture, vTextureCoord); 
    // 推論結果の被写体の色
    vec4 targetColor = vec4(0., 0., 1., 1.);
    // 推論結果
    vec4 segmentedColor = texture2D(sSegmentedTexture, vTextureCoord);
    // 青色だったら discard。そうじゃなければフロントカメラの色を
    // length でどれくらい似ているかが取れる（雑な説明）
    if (.3 < length(targetColor - segmentedColor)) {
      outColor = cameraColor;
    } else {
      // outColor = segmentedColor; // ブルーバックを出す
      discard;
    }
  } else {
    // バックカメラ（外側）
    vec4 cameraColor = texture2D(sBackCameraTexture, vTextureCoord);
    outColor = cameraColor;
  }

  // 出力
  gl_FragColor = outColor;
}
```

## ImageReader でカメラ映像を流す
`ImageReader`を作ります。  
解像度は下げておきます。クソデカ画像を投げてもイメージセグメンテーションの解析が遅くなるだけなので。

ここでは`ImageFormat.JPEG`しています。`Camera2 API`の出力先にする場合は多分これにしないといけない？  
あと、`maxImages`を`30`にしています。これを`2`とかの極端に少ない数にすると、全然関係ないであろう`SurfaceView`プレビューの`fps`が低くなります（何故？）。すごく低くなる。  
`Stackoverflow`にもある通り、多くすると随分マシになる。  
https://stackoverflow.com/questions/42688188/

```kotlin
/**
 * イメージセグメンテーション用に Bitmap を提供しなくてはいけない、そのための[ImageReader]。
 * maxImages が多いが、多めに取らないと、プレビューが遅くなる。https://stackoverflow.com/questions/42688188/
 *
 * width / height を半分以下にしているのはメモリ使用量を減らす目的と、
 * どうせ解析にクソデカい画像を入れても遅くなるだけなので、この段階で小さくしてしまう。
 */
private val analyzeImageReader = ImageReader.newInstance(CAMERA_RESOLUTION_WIDTH / 4, CAMERA_RESOLUTION_HEIGHT / 4, ImageFormat.JPEG, 30)
```

あとは、自撮りカメラの出力先にこの`ImageReader`を追加していくだけ。  
こんな感じ。

```kotlin
// フロントカメラの設定
// 出力先
val frontCameraOutputList = listOfNotNull(
    previewOpenGlDrawPair.textureRenderer.frontCameraInputSurface,
    recordOpenGlDrawPair.textureRenderer.frontCameraInputSurface,
    analyzeImageReader.surface // これ
)
val frontCameraCaptureRequest = frontCamera.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW).apply {
    frontCameraOutputList.forEach { surface -> addTarget(surface) }
}.build()
val frontCameraCaptureSession = frontCamera.awaitCameraSessionConfiguration(frontCameraOutputList)
frontCameraCaptureSession?.setRepeatingRequest(frontCameraCaptureRequest, null, null)
```

## MediaPipe 側の修正
`MediaPipe`をライブモードにします。ライブ配信や、カメラ映像に向いているモードだそうです。  
このモードはコールバックしか対応していないので、コールバックを追加して、`Flow`か何かで通知するようにしてあげます。

コールバックを使う場合、画像を渡す関数が`segmentAsync`に変更になります。  
時間を渡す必要があるので、インスタンス作成時の時間と比べるようにしています。（これでいいの？？？）

```kotlin
private val createInstanceTime = System.currentTimeMillis()
private val _segmentedBitmapFlow = MutableStateFlow<Bitmap?>(null)

private val imageSegmenter = ImageSegmenter.createFromOptions(
    context,
    ImageSegmenter.ImageSegmenterOptions.builder().apply {
        setBaseOptions(BaseOptions.builder().apply {
            // DeepLabV3
            // assets に置いたモデル
            setModelAssetPath("deeplab_v3.tflite")
        }.build())
        setRunningMode(RunningMode.LIVE_STREAM) // ライブモード、カメラ映像を流すため
        setOutputCategoryMask(true)
        setOutputConfidenceMasks(false)
        setResultListener { result, _ -> // コールバックを使う必要がある
            // Flow で通知
            _segmentedBitmapFlow.value = convertBitmapFromMPImage(result.categoryMask().get())
        }
    }.build()
)

/** 推論結果を流す Flow */
val segmentedBitmapFlow = _segmentedBitmapFlow.asStateFlow()

/** 推論して分類する。 */
fun segmentation(bitmap: Bitmap) {
    val mpImage = BitmapImageBuilder(bitmap).build()
    imageSegmenter.segmentAsync(mpImage, System.currentTimeMillis() - createInstanceTime) // segmentAsync を使う、フレームの時間を渡す必要がある
}

/** 破棄する */
fun destroy() {
    imageSegmenter.close()
}
```

## KomaDroidCameraManager 側の修正
次に、`ImageReader`から`MediaPipe`に渡してる処理がこの辺。  
`ImageReader`からカメラ映像を取り出して、`Bitmap`を`MediaPipe`に渡して、イメージセグメンテーションしてもらう。  
そのあと、`segmentedBitmapFlow`で色で分類された`Bitmap`が流れてくるので、`OpenGL ES`のテクスチャを更新する。

ちなみに`updateSegmentedBitmap`はテクスチャの更新しかしていません。  
なので更新したとしても、反映されるにはプレビュー、静止画撮影の描画処理が呼ばれる必要があるのですが、  
カメラ映像を描画する処理は高頻度で呼び出しているので、わざわざ呼ぶまでもないかなって。

```kotlin
/** 用意をする */
fun prepare() {
    scope.launch {
        // モードに応じて初期化を分岐
        when (mode) {
            CaptureMode.PICTURE -> initPictureMode()
            CaptureMode.VIDEO -> initVideoMode()
        }

        // プレビュー Surface で OpenGL ES の描画と破棄を行う。OpenGL ES の用意は map { } でやっている。
        // 新しい値が来たら、既存の OpenGlDrawPair は破棄するので、collectLatest でキャンセルを投げてもらうようにする。
        // また、録画用（静止画撮影、動画撮影）も別のところで描画
        launch {
            previewOpenGlDrawPairFlow.collectLatest { previewOpenGlDrawPair ->
                previewOpenGlDrawPair ?: return@collectLatest

                try {
                    // OpenGL ES の描画のためのメインループ
                    withContext(previewGlThreadDispatcher) {
                        while (isActive) {
                            renderOpenGl(previewOpenGlDrawPair)
                        }
                    }
                } finally {
                    // 終了時は OpenGL ES の破棄
                    withContext(NonCancellable + previewGlThreadDispatcher) {
                        previewOpenGlDrawPair.textureRenderer.destroy()
                        previewOpenGlDrawPair.inputSurface.destroy()
                    }
                }
            }
        }

        // MediaPipe のイメージセグメンテーションを行う
        // まず前面カメラのカメラ映像を ImageReader で受け取り、Bitmap にする
        // そのあと、イメージセグメンテーションの推論をして、結果を OpenGL ES へ渡す
        // OpenGL ES 側で描画する処理は、他のプレビューとかの描画ループ中に入れてもらうことにする。
        launch { prepareAndStartImageSegmentation() }

        // プレビューを開始する
        startPreview()
    }
}

/** イメージセグメンテーションの開始 */
private suspend fun startImageSegmentation() = coroutineScope {
    // MediaPipe
    val mediaPipeImageSegmentation = MediaPipeImageSegmentation(context)

    try {
        listOf(
            launch {
                // カメラ映像を受け取って解析に投げる部分
                while (isActive) {
                    val bitmap = analyzeImageReader.acquireLatestImage()?.toJpegBitmap()
                    if (bitmap != null) {
                        mediaPipeImageSegmentation.segmentation(bitmap)
                    }
                }
            },
            launch {
                // 解析結果を受け取って、OpenGL ES へテクスチャとして提供する
                mediaPipeImageSegmentation
                    .segmentedBitmapFlow
                    .filterNotNull()
                    .collect { segmentedBitmap ->
                        withContext(previewGlThreadDispatcher) {
                            previewOpenGlDrawPairFlow.value?.textureRenderer?.updateSegmentedBitmap(segmentedBitmap)
                        }
                        withContext(recordGlThreadDispatcher) {
                            recordOpenGlDrawPair?.textureRenderer?.updateSegmentedBitmap(segmentedBitmap)
                        }
                    }
            }
        ).joinAll()
    } finally {
        mediaPipeImageSegmentation.destroy()
    }
}

private suspend fun Image.toJpegBitmap() = withContext(Dispatchers.IO) {
    val imageBuf: ByteBuffer = planes[0].buffer
    val imageBytes = ByteArray(imageBuf.remaining())
    imageBuf[imageBytes]
    close()
    BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
}
```

## イマイチ
まず`JPEG`を指定した`ImageReader`の挙動がすごい怪しい。  
プレビューは問題なさそうだが、録画ができてなさそう。私の作り方が悪い気がしますが（と言うか多分これ）、`Google Pixel`は動くが、何故か`Snapdragon`搭載機で動かなくなる。  

さらに言うと、`ImageReader`を`JPEG`で使っているせいなのか、写真が`90度`回転しています。  
これだとカメラ映像とイメージセグメンテーション結果の画像を重ねたとしても、回転している状態では切り抜くことが出来ないので困った！  
困るはずなのだが、**何故か動いています**。はて。

これはカメラ映像のテクスチャの`SurfaceTexture`も`90度`回転していて、この`90度`回転している件は`SurfaceTexture#getTransformMatrix`を使った行列を適用すると？回転が直る。  
これと同じ行列を`ImageReader`から出てきた`Bitmap`の描画でも使えば、同じく回転が直る。

逆に言えば 90 度回転していない画像をぶち込んだら壊れる。両方 90 度回転してるからたまたま動いている

### イマイチなソースコード
いまいち過ぎるので`git revert`しました。多分安定しているのがテクスチャを描画するだけの`OpenGL ES`を経由するのが一番いい気がする。これから話します。  
もしくは解析のユースケースがサポートされてる（らしい）`CameraX`に乗り換えるか。解析用に`Image`がもらえるらしいです。

![Imgur](https://i.imgur.com/8wlyAbn.png)

`git revert`してしまったのでもしイマイチ具合を見たい場合は、  
ブランチが`image_segmentation`、コミットハッシュが`a7742f2f863b3ffbff40ddddc0b88d87b67f17c3`なので、`git clone`したら`git checkout`でコミットハッシュを入れてください。  

https://github.com/takusan23/KomaDroid

## もしちゃんとやりたい場合は
`OpenGL ES`を間に挟むと安定して動いてる気がします。`Stackoverflow`の回答でも`glReadPixels`しているくらいだし（今でもそっちのが速いかは不明）。  
というか、間に`OpenGL ES`を挟むと`glReadPixels`なんかせずとも、`ImageReader`を`PixelFormat.RGBA_8888`のモードで利用できるので。今のところ`RGBA_8888`なら安定して動いてる気がします。

![Imgur](https://i.imgur.com/RiQEAOG.png)

こんな感じに、カメラ映像が一旦`OpenGL ES`の描画を経由するようになります。ただカメラ映像のテクスチャをそのまま描画しているだけ（手間が増えただけ）。なんでこっちのほうが安定しているのかは謎です。  
`ImageReader`を入れるだけでガクガクになるプレビュー問題も直るし、`Snapdragon`で動画撮影が出来ないのも直った。

## 修正する
が、が、が、かなり直す必要があって、  
- `OpenGL ES`でテクスチャを描画するだけの`TextureRenderer`クラスを用意する
- 前面カメラ、背面カメラ映像を同時に描画する`KomaDroidCameraTextureRenderer`の、イメージセグメンテーション結果を扱う部分の修正
    - `ImageReader(JPEG)`の時はたまたま`90度`回転していたので、カメラ映像と同じように`texture2D()`を呼べばよかったのですが、`RGBA_8888`は回転していない。
        - まあコレに関しては回転しているのがおかしい（？？？）

### テクスチャを描画するだけの処理
こちらです、もう貼るの面倒なので`GitHub`見てください、  
テクスチャを`texture2D`で描画するだけ。それだけ。`InputSurface`の方は使い回せるのでこれだけ持ってくれば良いです。

https://github.com/takusan23/KomaDroid/blob/image_segmentation/app/src/main/java/io/github/takusan23/komadroid/gl/TextureCopyTextureRenderer.kt

### KomaDroidCameraTextureRenderer 側の修正2
回転していない画像が来るようになったので、新しい、回転していない行列を作ります。  
バーテックスシェーダー、フラグメントシェーダーだけで変更すれば、あとはイマイチな`ImageReader`だけで使ってた頃のコードを使えます。  

バーテックスシェーダ側に`vSegmentTextureCoord`を用意しました。フラグメントシェーダーへ値を渡せます。  
これを`texture2D()`に入れれば回転していない状態でテクスチャを描画できます。テクスチャ座標に合わせるため`y`を反転させています。

フラグメントシェーダー側も、`varying vec2 vSegmentTextureCoord`を追加します、  
そのあと、`vec4 segmentedColor = texture2D(...)`の第1引数を`vSegmentTextureCoord`にすれば回転していない状態で取り出せます。  

これでイメージセグメンテーション結果を受け入れられるようになった。

```kotlin
        private const val VERTEX_SHADER = """
uniform mat4 uMVPMatrix;
uniform mat4 uSTMatrix;
attribute vec4 aPosition;
attribute vec4 aTextureCoord;
varying vec2 vTextureCoord;
varying vec2 vSegmentTextureCoord;

// Matrix.setIdentityM()
const mat4 uTextureSTMatrix = mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0);

void main() {
  gl_Position = uMVPMatrix * aPosition;
  vTextureCoord = (uSTMatrix * aTextureCoord).xy;
  
  // vTextureCoord は SurfaceTexture 用なので、普通のテクスチャ描画用の vTextureCoord を作る
  // またテクスチャ座標は反転しているので戻す
  vSegmentTextureCoord = (uTextureSTMatrix * aTextureCoord).xy;
  vSegmentTextureCoord = vec2(vSegmentTextureCoord.x, 1.-vSegmentTextureCoord.y);
}
"""

        private const val FRAGMENT_SHADER = """
#extension GL_OES_EGL_image_external : require
precision mediump float;

varying vec2 vTextureCoord;
uniform samplerExternalOES sFrontCameraTexture;
uniform samplerExternalOES sBackCameraTexture;

varying vec2 vSegmentTextureCoord;
uniform sampler2D sSegmentedTexture;

// sFrontCameraTexture を描画する場合は 1。
// sBackCameraTexture は 0。
uniform int iDrawFrontCameraTexture;

void main() { 
  // 出力色
  vec4 outColor = vec4(0., 0., 0., 1.);

  // どっちを描画するのか
  if (bool(iDrawFrontCameraTexture)) {
    // フロントカメラ（自撮り）
    vec4 cameraColor = texture2D(sFrontCameraTexture, vTextureCoord); 
    // 推論結果の被写体の色
    vec4 targetColor = vec4(0., 0., 1., 1.);
    // 推論結果
    vec4 segmentedColor = texture2D(sSegmentedTexture, vSegmentTextureCoord);
    // 青色だったら discard。そうじゃなければフロントカメラの色を
    // length でどれくらい似ているかが取れる（雑な説明）
    if (.3 < length(targetColor - segmentedColor)) {
      outColor = cameraColor;
    } else {
      // outColor = segmentedColor; // ブルーバックを出す
      discard;
    }
  } else {
    // バックカメラ（外側）
    vec4 cameraColor = texture2D(sBackCameraTexture, vTextureCoord);
    outColor = cameraColor;
  }

  // 出力
  gl_FragColor = outColor;
}
"""
```

### KomaDroidCameraManager 側の修正2
`InputSurface`と、`TextureCopyTextureRenderer`を持つだけのクラスを作りました。  

```kotlin
/** 解析用 [OpenGlDrawPair] */
private data class AnalyzeOpenGlDrawPair(
    val inputSurface: InputSurface,
    val textureRenderer: TextureCopyTextureRenderer
)
```

それから、解析用`ImageReader`の他に、解析用`ImageReader`の`OpenGL`用スレッド、`AnalyzeOpenGlDrawPair`のインスタンスを作ります。  
`ImageReader`は`PixelFormat.RGBA_8888`にしてください、

```kotlin
/**
 * イメージセグメンテーション用に Bitmap を提供しなくてはいけない、そのための[ImageReader]。
 *
 * width / height を半分以下にしているのはメモリ使用量を減らす目的と、
 * どうせ解析にクソデカい画像を入れても遅くなるだけなので、この段階で小さくしてしまう。
 */
private val analyzeImageReader = ImageReader.newInstance(
    CAMERA_RESOLUTION_WIDTH / ANALYZE_DIV_SCALE,
    CAMERA_RESOLUTION_HEIGHT / ANALYZE_DIV_SCALE,
    PixelFormat.RGBA_8888,
    2
)

/** [analyzeImageReader]用 GL スレッド */
private val analyzeGlThreadDispatcher = newSingleThreadContext("AnalyzeGlThread")

/** [analyzeImageReader]用[OpenGlDrawPair] */
private var analyzeOpenGlDrawPair: AnalyzeOpenGlDrawPair? = null

companion object {
    const val CAMERA_RESOLUTION_WIDTH = 720
    const val CAMERA_RESOLUTION_HEIGHT = 1280
    private const val ANALYZE_DIV_SCALE = 4 // イメージセグメンテーションに元の解像度はいらないので 1/4 する
}
```

次に、`prepare()`の中で、`analyzeOpenGlDrawPair`の用意をします。  
`InputSurface`と`TextureCopyTextureRenderer`を作ります。作ったら`startImageSegmentation()`を呼び出しますが、`startImageSegmentation()`側も修正が必要です。  
といっても、`ImageReader`から直接取ってた部分を、カメラ映像が来ていれば`OpenGL ES`で描画して`ImageReader`から取り出す。  

`ImageReader`から`Bitmap`を取り出す方法、`RGBA_8888`になったので`JPEG`用のは使い回せないので注意です。

```kotlin
fun prepare() {
    scope.launch {
        // 省略...

        // MediaPipe のイメージセグメンテーションを行う
        // まず前面カメラのカメラ映像を ImageReader で受け取り、Bitmap にする
        // そのあと、イメージセグメンテーションの推論をして、結果を OpenGL ES へ渡す
        // OpenGL ES 側で描画する処理は、他のプレビューとかの描画ループ中に入れてもらうことにする。
        analyzeOpenGlDrawPair = withContext(analyzeGlThreadDispatcher) {
            // また、本当は ImageReader を Camera2 API に渡せばいいはずだが、プレビューが重たくなってしまった。
            // OpenGL ES を経由すると改善したのでとりあえずそれで（謎）
            val inputSurface = InputSurface(analyzeImageReader.surface)
            val textureRenderer = TextureCopyTextureRenderer()
            inputSurface.makeCurrent()
            textureRenderer.createShader()
            textureRenderer.setSurfaceTextureSize(CAMERA_RESOLUTION_WIDTH / ANALYZE_DIV_SCALE, CAMERA_RESOLUTION_HEIGHT / ANALYZE_DIV_SCALE)
            AnalyzeOpenGlDrawPair(inputSurface, textureRenderer)
        }
        launch { startImageSegmentation() }

        // プレビューを開始する
        startPreview()
    }
}

/** イメージセグメンテーションの開始 */
private suspend fun startImageSegmentation() = coroutineScope {
    // MediaPipe
    val mediaPipeImageSegmentation = MediaPipeImageSegmentation(context)

    try {
        listOf(
            launch {
                // カメラ映像を受け取って解析に投げる部分
                withContext(analyzeGlThreadDispatcher) {
                    while (isActive) {
                        if (analyzeOpenGlDrawPair?.textureRenderer?.isAvailableFrame() == true) {
                            // カメラ映像テクスチャを更新して、描画
                            analyzeOpenGlDrawPair?.textureRenderer?.updateCameraTexture()
                            analyzeOpenGlDrawPair?.textureRenderer?.draw()
                            analyzeOpenGlDrawPair?.inputSurface?.swapBuffers()
                            // ImageReader で取りだして、MediaPipe のイメージセグメンテーションに投げる
                            val bitmap = analyzeImageReader.acquireLatestImage()?.toRgbaBitmap(
                                imageReaderWidth = CAMERA_RESOLUTION_WIDTH / ANALYZE_DIV_SCALE,
                                imageReaderHeight = CAMERA_RESOLUTION_HEIGHT / ANALYZE_DIV_SCALE,
                            )
                            if (bitmap != null) {
                                mediaPipeImageSegmentation.segmentation(bitmap)
                            }
                        }
                    }
                }
            },
            launch {
                // 解析結果を受け取って、プレビュー、録画用 OpenGL ES へテクスチャとして提供する
                mediaPipeImageSegmentation
                    .segmentedBitmapFlow
                    .filterNotNull()
                    .collect { segmentedBitmap ->
                        withContext(previewGlThreadDispatcher) {
                            previewOpenGlDrawPairFlow.value?.textureRenderer?.updateSegmentedBitmap(segmentedBitmap)
                        }
                        withContext(recordGlThreadDispatcher) {
                            recordOpenGlDrawPair?.textureRenderer?.updateSegmentedBitmap(segmentedBitmap)
                        }
                    }
            }
        ).joinAll()
    } finally {
        mediaPipeImageSegmentation.destroy()
    }
}

/** [Image]から[Bitmap]を作る */
private suspend fun Image.toRgbaBitmap(imageReaderWidth: Int, imageReaderHeight: Int) = withContext(Dispatchers.IO) {
    val image = this@toRgbaBitmap
    val width = image.width
    val height = image.height
    val planes = image.planes
    val buffer = planes[0].buffer
    // なぜか ImageReader のサイズに加えて、何故か Padding が入っていることを考慮する必要がある
    val pixelStride = planes[0].pixelStride
    val rowStride = planes[0].rowStride
    val rowPadding = rowStride - pixelStride * width
    // Bitmap 作成
    val readBitmap = Bitmap.createBitmap(width + rowPadding / pixelStride, height, Bitmap.Config.ARGB_8888)
    readBitmap.copyPixelsFromBuffer(buffer)
    // 余分な Padding を消す
    val editBitmap = Bitmap.createBitmap(readBitmap, 0, 0, imageReaderWidth, imageReaderHeight)
    readBitmap.recycle()
    image.close()
    return@withContext editBitmap
}
```

最後に、カメラ映像の出力先を`ImageReader#surface`から、`ImageReader`の`OpenGL`へテクスチャを送る`SurfaceTexture`に変更する。  
プレビュー、静止画、動画の三箇所かな。

```kotlin
// フロントカメラの設定
// 出力先
val frontCameraOutputList = listOfNotNull(
    previewOpenGlDrawPair.textureRenderer.frontCameraInputSurface,
    recordOpenGlDrawPair.textureRenderer.frontCameraInputSurface,
    analyzeOpenGlDrawPair?.textureRenderer?.inputSurface // こ↑こ↓
)
val frontCameraCaptureRequest = frontCamera.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW).apply {
    frontCameraOutputList.forEach { surface -> addTarget(surface) }
}.build()
val frontCameraCaptureSession = frontCamera.awaitCameraSessionConfiguration(frontCameraOutputList)
frontCameraCaptureSession?.setRepeatingRequest(frontCameraCaptureRequest, null, null)
```

## 修正できた
随分快適になったと思う。  
ちゃんと自分撮りの方は顔だけ（解析の精度にもよるけどおおよそ）映るようになりました。おもろい

画像を貼ろうと思ったけど`Android Emulator`だと`MediaPipe`無理かあ...  

せめてもの`APK`おいておきます：https://github.com/takusan23/KomaDroid/releases/tag/1.0.0  
なんかすげーバイナリサイズが大きいんだけど、、、、そんなもんか

## ソースコード
疲れたので全文は貼ってない。ので見てみて。これだけじゃまじで何やってるか分からんと思うので、、、  
`image_segmentation`ブランチです。多分ビルドできる、そして多分実機じゃないと動かない。

https://github.com/takusan23/KomaDroid/tree/image_segmentation

# おわりに
**この機能で遊んでると結構スマホがアチアチになる。** 開発のために`USB`で繋いでるから余計に。  
てかまだ6月なのに（記述時時点）クソ暑すぎだろ。虫やだ！！！！網戸すり抜けてくる奴ら何？？？？