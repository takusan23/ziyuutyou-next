---
title: AndroidのMediaCodecで逆再生の動画を作る
created_at: 2024-02-03
tags:
- Android
- Kotlin
- MediaCodec
- OpenGL
---
どうもこんばんわ。  

2014年が10年前ってやばくない？そんなには経ってないやろ・・・って思ってたときにふと、  
その頃に飯のテレビCMを逆再生にしたやつを見せてくれたことを思い出したので、今回は逆再生動画を作るアプリを作ってみる

# 逆再生動画を作る Android アプリを探してるんだけど検索妨害するのやめない？
はい。  
審査中なので、通っていれば以下の`URL`で開けるようになるはずです。

![Imgur](https://imgur.com/Kqv04XN.png)

https://play.google.com/store/apps/details?id=io.github.takusan23.dougaundroid

ソースコードあるので、もしビルドしたい方がいれば  
https://github.com/takusan23/DougaUnDroid

# 本題
というわけで、今回は選択した動画を逆から再生するような動画を作るアプリを作ろうと思います。  
逆再生動画作成アプリです。  

もちろん`Android`の`MediaCodec`や`OpenGL ES`等のみを利用します。  
`ffmpeg`？バイナリサイズとライセンスの面から今回は無しです！、使えるならそっち使うのが良いと思う。

# 先に作品例を
こんなのが作れます

- https://www.youtube.com/watch?v=HauBBGb3jvw
- https://www.youtube.com/watch?v=4QyE-Gjc2o8

<video controls width="300px" src="https://github.com/takusan23/DougaUnDroid/assets/32033405/7cd3f322-335b-42b8-adf3-4a624f950cdd"></video>  

<video controls width="300px" src="https://github.com/takusan23/DougaUnDroid/assets/32033405/80ee0768-a0b7-4865-bbd7-6c016f712652"></video>  

<video controls width="300px" src="https://github.com/takusan23/DougaUnDroid/assets/32033405/073c2b35-9801-4315-90ba-ad34f7b3c0e1"></video>  

<video controls width="300px" src="https://github.com/takusan23/DougaUnDroid/assets/32033405/c470554d-7a34-481d-923f-da0c5a4e8a0b"></video>  

# 逆から再生する動画を作るのは難しい
逆再生の動画ってよく見かけると思いますが、実は作るのが難しいんですよね。  
世の動画編集アプリはよくやっていると思います。  

動画というのは、写真1枚1枚がパラパラ漫画のように動いて見えるので、それぞれ1枚ずつ保存しているかのように見えるかもしれません。  
しかし、写真1枚1枚をファイルに保存している割には、動画ファイルのサイズがそんなに大きくないんですよね。これが`GIF`ならバカでかくなるのですが、動画はそんなに大きくないですね。  

単純に1枚ずつ保存した場合、1秒間に`30fps`なら`30枚`、`60fps`なら`60枚`あるはずなので膨大なファイルサイズになってしまうような気がするのですが、  
現実のカメラアプリや動画編集アプリはそうではありませんね。一体写真データは何処へ・・？

その答えがコーデックと、エンコーダーですね。  
コーデックというのが、動画を圧縮するアルゴリズムでのことで、そのアルゴリズムを動かすのがエンコーダーですね。  

じゃあ一体コーデックさんはどのようにして動画を圧縮しているのか。ですが普通に難しいことをしているので、  
**逆再生の動画を作る上で障壁になっている部分を話すと、**

一個前の写真と今の写真を**見比べて、変わっている部分**のみをファイルに保存します。  
変わっていない部分は一個前の写真を引き続き参照するようにしたわけですね。  

![Imgur](https://imgur.com/jYIyLRx.png)

↑ 雑な絵ですが、、、  
こんな感じに2枚目には猫が増えた場合、増えた分だけを保存するようなことをしているらしい。

この、今の写真と比較している一個前の写真のことをキーフレームといいます。  
実際は一個前の写真と比較するわけではなく、一定間隔でこのキーフレームが生成され、間はすべてキーフレームからの差分のみが保存されるってわけです。  

![Imgur](https://imgur.com/D7lpjAO.png)

これにより、1秒間に30枚写真が来た（`30fps`）としても、変わっている部分のみを記録することでファイルサイズを小さくすることに成功するわけですね。  
しかし、これには欠点があり、**時間が増える方向にしか再生できない**ということです。  

ほとんどのフレームがキーフレームからの差分なので、キーフレームの間にあるフレーム（写真）へを表示したいために動画をシークした場合、キーフレームまで遡る必要があります。  
という感じで、時間が増える方向にしか再生出来ないという前提があるおかげで、ストレージや通信料を節約しつつ高画質な動画をお届け出来ているわけですね（（？））。

詳しくは

- Iフレーム / キーフレーム
- フレーム間予測 / フレーム間圧縮
- 動画コーデック

とかで調べてみてください。  
**まあこの辺今回意識しなくても作れるので**

**あ、あと音声に関しては PCM を2バイトずつ後ろから取り出して入れ直すだけなのでそこまで大変じゃないです**

# 二番煎じ
はい。  

https://www.sisik.eu/blog/android/media/reverse-video

ぱっと読んだ感じ、普通に難しそう。  
`OpenGL`無しでやったみたい。あの`InputSurface.java`とかいうやつがいらなくなる（別に必要でも`AOSP`からコピーするだけだけど）みたいです。  
（でも体感`OpenGL`を`MediaCodec`に噛ませておいたほうが良さそう感はあるんだよなあ、リサイズとか出来るし）

あと記事読んで気付いた、`ByteBuffer`（写真（映像フレーム）のバイト配列）を直接扱う方法もあるか、、、  
いやでも`ByteBuffer`を`MediaCodec`で扱うとか絶対やだ。

# 今回の作戦
とにかく、今日使われている動画は増える方向にしか再生できなくて、減る方向に再生する場合は難しいよってことがわかったところで今回の作戦です。  
先駆け者さんは、キーフレームとその間をすべてキーフレームに変換したそうです。どこへシークしても完全な状態で持つことを選択したそう。  
つまり写真1枚1枚持つのと同じ方法を取ったみたいです。  

ただ、これやるとファイルサイズがかなり大きくなりそうなのと、すべてキーフレームにするための`MediaCodec`周りを書くのがやだかなあ。  

というわけで今回の作戦はこちら、前作った`Canvasから動画を作る`やつを使います！  
（ちなみにこれも若干間違ってることにこれ作っているときに気付きました。。。）  
https://takusan.negitoro.dev/posts/android_canvas_to_video/


それから、動画から`Bitmap`を貰える`MediaMetadataRetriever`も使う  
どうやら`MediaMetadataRetriever#getFrameAtTime`メソッドで、指定した時間の動画フレーム（写真）が取れるらしい。

https://developer.android.com/reference/android/media/MediaMetadataRetriever

これらを組み合わせて、今回は、1枚1枚動画ファイルから動画フレーム（写真）を後ろから取り出し、`Canvas`に描画し、エンコーダーに突っ込むことにします。  
どうやら`MediaMetadataRetriever#getFrameAtTime`は時間が増える方向じゃなくて、減るような方向にも対応しているみたい。これで行こう。  

先述の説明の通り、すべてがキーフレームではないので、まずキーフレームまで移動して、その後差分を見る・・・って事をするはずなので普通に高コストだとは思う。  
ただ全部をキーフレームになるような動画を作るよりはマシな気がしなくもない。いや`getFrameAtTime`が多分重たいので、全部キーフレームのほうが早いのかなあ、、、

# ながれ
映像は↑の感じで、逆から取り出して`Canvas`に書く方法で。  
音声は、`PCM`にして配列を反転させればいいので映像ほぞ難しくないです。

![Imgur](https://imgur.com/mIXeRK0.png)

# 動画を支える技術
`MediaCodec`とかが何なのかは他の記事で書いたので、そっちを見て。  

- https://takusan.negitoro.dev/posts/tag/OpenGL/
- https://takusan.negitoro.dev/posts/tag/MediaCodec/

ざっくりいうと

- `MediaCodec`
    - エンコーダー・デコーダー
- `MediaExtractor`
    - `mp4 / webm`等のコンテナからメタデータ、エンコードされたデータを取り出す
- `MediaMuxer`
    - エンコーダーから出てきたデータを`mp4 / webm`コンテナに書き込む
- `OpenGL ES`
    - `MediaCodec`と組み合わせると、映像を加工したり出来る

# つくる
ながかった

## 環境

| なまえ         | あたい                                   |
|----------------|------------------------------------------|
| 端末           | Pixel 8 Pro / Xperia 1 V                 |
| Android Studio | Android Studio Hedgehog 2023.1.1 Patch 2 |

## つくる
`Jetpack Compose`使うけど、別に`View`でもいいです。  
どうせ主役は`MediaCodec`周りなのだから

![Imgur](https://imgur.com/pD7b5Ny.png)

## 適当にレイアウトを用意
動画を選ぶボタンと、処理を開始するボタンを`MainActivity`におきます。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AndroidReverseVideoMakerTheme {
                HomeScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val videoUri = remember { mutableStateOf<Uri?>(null) }
    val videoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri -> videoUri.value = uri }
    )

    fun start() {
        scope.launch {
            // 処理をここに書く
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(title = { Text(text = stringResource(id = R.string.app_name)) })
        }
    ) { paddingValues ->
        Column(Modifier.padding(paddingValues)) {

            Button(onClick = {
                videoPicker.launch(PickVisualMediaRequest(mediaType = ActivityResultContracts.PickVisualMedia.VideoOnly))
            }) {
                Text(text = "動画を選ぶ")
            }

            if (videoUri.value != null) {
                Text(text = videoUri.value.toString())
                Button(onClick = { start() }) {
                    Text(text = "処理を開始する")
                }
            }
        }
    }
}
```

## Canvas から動画を作る処理
前記事で書いたので、あんまり深入りはしないけど（てか覚えてない）  
https://takusan.negitoro.dev/posts/android_canvas_to_video/

とりあえずこの2つをコピペします。`AOSP`にちょっと手を加えただけなので私も何やってるのかよくわからない。

```kotlin
/**
 * 動画無しで Canvas のみを入力として利用する
 *
 * @param surface [android.media.MediaCodec.createInputSurface]
 * @param textureRenderer [TextureRenderer]
 */
class CanvasInputSurface(
    private val surface: Surface,
    private val textureRenderer: TextureRenderer,
) {
    private var mEGLDisplay = EGL14.EGL_NO_DISPLAY
    private var mEGLContext = EGL14.EGL_NO_CONTEXT
    private var mEGLSurface = EGL14.EGL_NO_SURFACE

    init {
        eglSetup()
    }

    fun createRender() {
        textureRenderer.surfaceCreated()
    }

    /**
     * Prepares EGL.  We want a GLES 2.0 context and a surface that supports recording.
     */
    private fun eglSetup() {
        mEGLDisplay = EGL14.eglGetDisplay(EGL14.EGL_DEFAULT_DISPLAY)
        if (mEGLDisplay == EGL14.EGL_NO_DISPLAY) {
            throw RuntimeException("unable to get EGL14 display")
        }
        val version = IntArray(2)
        if (!EGL14.eglInitialize(mEGLDisplay, version, 0, version, 1)) {
            throw RuntimeException("unable to initialize EGL14")
        }
        // Configure EGL for recording and OpenGL ES 2.0.
        val attribList = intArrayOf(
            EGL14.EGL_RED_SIZE, 8,
            EGL14.EGL_GREEN_SIZE, 8,
            EGL14.EGL_BLUE_SIZE, 8,
            EGL14.EGL_ALPHA_SIZE, 8,
            EGL14.EGL_RENDERABLE_TYPE, EGL14.EGL_OPENGL_ES2_BIT,
            EGL_RECORDABLE_ANDROID, 1,
            EGL14.EGL_NONE
        )
        val configs = arrayOfNulls<EGLConfig>(1)
        val numConfigs = IntArray(1)
        EGL14.eglChooseConfig(mEGLDisplay, attribList, 0, configs, 0, configs.size, numConfigs, 0)
        checkEglError("eglCreateContext RGB888+recordable ES2")

        // Configure context for OpenGL ES 2.0.
        val attrib_list = intArrayOf(
            EGL14.EGL_CONTEXT_CLIENT_VERSION, 2,
            EGL14.EGL_NONE
        )
        mEGLContext = EGL14.eglCreateContext(
            mEGLDisplay, configs[0], EGL14.EGL_NO_CONTEXT,
            attrib_list, 0
        )
        checkEglError("eglCreateContext")

        // Create a window surface, and attach it to the Surface we received.
        val surfaceAttribs = intArrayOf(
            EGL14.EGL_NONE
        )
        mEGLSurface = EGL14.eglCreateWindowSurface(mEGLDisplay, configs[0], surface, surfaceAttribs, 0)
        checkEglError("eglCreateWindowSurface")
    }

    /**
     * Canvasに描画してOpenGLに描画する
     *
     * @param onCanvasDrawRequest Canvasを渡すので描画して返してください
     */
    fun drawCanvas(onCanvasDrawRequest: (Canvas) -> Unit) {
        textureRenderer.prepareDraw()
        textureRenderer.drawCanvas(onCanvasDrawRequest)
        textureRenderer.invokeGlFinish()
    }

    /**
     * Discards all resources held by this class, notably the EGL context.  Also releases the
     * Surface that was passed to our constructor.
     */
    fun release() {
        if (mEGLDisplay != EGL14.EGL_NO_DISPLAY) {
            EGL14.eglMakeCurrent(mEGLDisplay, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_CONTEXT)
            EGL14.eglDestroySurface(mEGLDisplay, mEGLSurface)
            EGL14.eglDestroyContext(mEGLDisplay, mEGLContext)
            EGL14.eglReleaseThread()
            EGL14.eglTerminate(mEGLDisplay)
        }
        surface.release()
        mEGLDisplay = EGL14.EGL_NO_DISPLAY
        mEGLContext = EGL14.EGL_NO_CONTEXT
        mEGLSurface = EGL14.EGL_NO_SURFACE
    }

    /**
     * Makes our EGL context and surface current.
     */
    fun makeCurrent() {
        EGL14.eglMakeCurrent(mEGLDisplay, mEGLSurface, mEGLSurface, mEGLContext)
        checkEglError("eglMakeCurrent")
    }

    /**
     * Calls eglSwapBuffers.  Use this to "publish" the current frame.
     */
    fun swapBuffers(): Boolean {
        val result = EGL14.eglSwapBuffers(mEGLDisplay, mEGLSurface)
        checkEglError("eglSwapBuffers")
        return result
    }

    /**
     * Sends the presentation time stamp to EGL.  Time is expressed in nanoseconds.
     */
    fun setPresentationTime(nsecs: Long) {
        EGLExt.eglPresentationTimeANDROID(mEGLDisplay, mEGLSurface, nsecs)
        checkEglError("eglPresentationTimeANDROID")
    }

    /**
     * Checks for EGL errors.  Throws an exception if one is found.
     */
    private fun checkEglError(msg: String) {
        val error = EGL14.eglGetError()
        if (error != EGL14.EGL_SUCCESS) {
            throw RuntimeException("$msg: EGL error: 0x${Integer.toHexString(error)}")
        }
    }

    companion object {
        private const val EGL_RECORDABLE_ANDROID = 0x3142
    }
}
```

```kotlin
/**
 * Canvas の内容を OpenGL で描画するため
 *
 * @param outputVideoWidth 動画の幅
 * @param outputVideoHeight 動画の高さ
 */
class TextureRenderer(
    private val outputVideoWidth: Int,
    private val outputVideoHeight: Int,
) {

    private var mTriangleVertices = ByteBuffer.allocateDirect(mTriangleVerticesData.size * FLOAT_SIZE_BYTES).run {
        order(ByteOrder.nativeOrder())
        asFloatBuffer().apply {
            put(mTriangleVerticesData)
            position(0)
        }
    }

    private val mMVPMatrix = FloatArray(16)
    private val mSTMatrix = FloatArray(16)

    /** Canvasで書いたBitmap。Canvasの内容をOpenGLのテクスチャとして利用 */
    private val canvasBitmap by lazy { Bitmap.createBitmap(outputVideoWidth, outputVideoHeight, Bitmap.Config.ARGB_8888) }

    /** Canvas。これがエンコーダーに行く */
    private val canvas by lazy { Canvas(canvasBitmap) }

    // ハンドルたち
    private var mProgram = 0
    private var muMVPMatrixHandle = 0
    private var muSTMatrixHandle = 0
    private var maPositionHandle = 0
    private var maTextureHandle = 0
    private var uCanvasTextureHandle = 0

    /** キャンバスの画像を渡すOpenGLのテクスチャID */
    private var canvasTextureID = -1

    init {
        Matrix.setIdentityM(mSTMatrix, 0)
    }

    /** 描画前に呼び出す */
    fun prepareDraw() {
        // glError 1282 の原因とかになる
        GLES20.glUseProgram(mProgram)
        checkGlError("glUseProgram")
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

        // Snapdragon だと glClear が無いと映像が乱れる
        GLES20.glClear(GLES20.GL_DEPTH_BUFFER_BIT or GLES20.GL_COLOR_BUFFER_BIT)
    }

    /**
     * Canvas に書いて OpenGL で描画する。
     * [drawFrame]のあとに呼び出す必要あり。
     *
     * @param onCanvasDrawRequest Canvasを渡すので描画して返してください
     */
    fun drawCanvas(onCanvasDrawRequest: (Canvas) -> Unit) {
        checkGlError("drawCanvas start")
        // コンテキストをCanvasのテクスチャIDに切り替える
        // テクスチャ設定
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, canvasTextureID)
        // 縮小拡大時の補間設定
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR)
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR)
        // 前回のを消す
        canvas.drawColor(0, PorterDuff.Mode.CLEAR)
        // Canvasで書く
        onCanvasDrawRequest(canvas)
        // glActiveTexture したテクスチャへCanvasで書いた画像を転送する
        // 更新なので texSubImage2D
        GLUtils.texSubImage2D(GLES20.GL_TEXTURE_2D, 0, 0, 0, canvasBitmap)
        checkGlError("GLUtils.texSubImage2D canvasTextureID")
        // Uniform 変数へテクスチャを設定
        // 第二引数は GLES20.GL_TEXTURE0 なので 0
        GLES20.glUniform1i(uCanvasTextureHandle, 0)
        checkGlError("glUniform1i uCanvasTextureHandle")
        // アスペクト比の調整はいらないのでリセット（エンコーダーの出力サイズにCanvasを合わせて作っているため）
        Matrix.setIdentityM(mMVPMatrix, 0)
        // それとは別に、OpenGLの画像は原点が左下なので（普通は左上）、行列を反転させる
        // すいませんよくわかりません。
        Matrix.setIdentityM(mSTMatrix, 0)
        Matrix.scaleM(mSTMatrix, 0, 1f, -1f, 1f)
        // 描画する
        GLES20.glUniformMatrix4fv(muSTMatrixHandle, 1, false, mSTMatrix, 0)
        GLES20.glUniformMatrix4fv(muMVPMatrixHandle, 1, false, mMVPMatrix, 0)
        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
        checkGlError("glDrawArrays Canvas")
    }

    /** glFinish をよびだす */
    fun invokeGlFinish() {
        GLES20.glFinish()
    }

    fun surfaceCreated() {
        mProgram = createProgram(VERTEX_SHADER, FRAGMENT_SHADER)
        if (mProgram == 0) {
            throw RuntimeException("failed creating program")
        }
        maPositionHandle = GLES20.glGetAttribLocation(mProgram, "aPosition")
        checkGlError("glGetAttribLocation aPosition")
        if (maPositionHandle == -1) {
            throw RuntimeException("Could not get attrib location for aPosition")
        }
        maTextureHandle = GLES20.glGetAttribLocation(mProgram, "aTextureCoord")
        checkGlError("glGetAttribLocation aTextureCoord")
        if (maTextureHandle == -1) {
            throw RuntimeException("Could not get attrib location for aTextureCoord")
        }
        muMVPMatrixHandle = GLES20.glGetUniformLocation(mProgram, "uMVPMatrix")
        checkGlError("glGetUniformLocation uMVPMatrix")
        if (muMVPMatrixHandle == -1) {
            throw RuntimeException("Could not get attrib location for uMVPMatrix")
        }
        muSTMatrixHandle = GLES20.glGetUniformLocation(mProgram, "uSTMatrix")
        checkGlError("glGetUniformLocation uSTMatrix")
        if (muSTMatrixHandle == -1) {
            throw RuntimeException("Could not get attrib location for uSTMatrix")
        }
        uCanvasTextureHandle = GLES20.glGetUniformLocation(mProgram, "uCanvasTexture")

        // Canvas のテクスチャID を払い出してもらう
        val textures = IntArray(1)
        GLES20.glGenTextures(1, textures, 0)

        // Canvasテクスチャ
        canvasTextureID = textures[0]
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, canvasTextureID)
        checkGlError("glBindTexture canvasTextureID")

        // 縮小拡大時の補間設定
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR)
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR)

        // テクスチャを初期化
        // 更新の際はコンテキストを切り替えた上で texSubImage2D を使う
        GLUtils.texImage2D(GLES20.GL_TEXTURE_2D, 0, canvasBitmap, 0)
        checkGlError("glTexParameter canvasTextureID")
    }

    private fun loadShader(shaderType: Int, source: String): Int {
        var shader = GLES20.glCreateShader(shaderType)
        checkGlError("glCreateShader type=$shaderType")
        GLES20.glShaderSource(shader, source)
        GLES20.glCompileShader(shader)
        val compiled = IntArray(1)
        GLES20.glGetShaderiv(shader, GLES20.GL_COMPILE_STATUS, compiled, 0)
        if (compiled[0] == 0) {
            GLES20.glDeleteShader(shader)
            shader = 0
        }
        return shader
    }

    private fun createProgram(vertexSource: String, fragmentSource: String): Int {
        val vertexShader = loadShader(GLES20.GL_VERTEX_SHADER, vertexSource)
        if (vertexShader == 0) {
            return 0
        }
        val pixelShader = loadShader(GLES20.GL_FRAGMENT_SHADER, fragmentSource)
        if (pixelShader == 0) {
            return 0
        }
        var program = GLES20.glCreateProgram()
        checkGlError("glCreateProgram")
        if (program == 0) {
            return 0
        }
        GLES20.glAttachShader(program, vertexShader)
        checkGlError("glAttachShader")
        GLES20.glAttachShader(program, pixelShader)
        checkGlError("glAttachShader")
        GLES20.glLinkProgram(program)
        val linkStatus = IntArray(1)
        GLES20.glGetProgramiv(program, GLES20.GL_LINK_STATUS, linkStatus, 0)
        if (linkStatus[0] != GLES20.GL_TRUE) {
            GLES20.glDeleteProgram(program)
            program = 0
        }
        return program
    }

    private fun checkGlError(op: String) {
        val error = GLES20.glGetError()
        if (error != GLES20.GL_NO_ERROR) {
            throw RuntimeException("$op: glError $error")
        }
    }

    companion object {

        private val mTriangleVerticesData = floatArrayOf(
            -1.0f, -1.0f, 0f, 0f, 0f,
            1.0f, -1.0f, 0f, 1f, 0f,
            -1.0f, 1.0f, 0f, 0f, 1f,
            1.0f, 1.0f, 0f, 1f, 1f
        )

        private const val FLOAT_SIZE_BYTES = 4
        private const val TRIANGLE_VERTICES_DATA_STRIDE_BYTES = 5 * FLOAT_SIZE_BYTES
        private const val TRIANGLE_VERTICES_DATA_POS_OFFSET = 0
        private const val TRIANGLE_VERTICES_DATA_UV_OFFSET = 3

        /** バーテックスシェーダー。座標などを決める */
        private const val VERTEX_SHADER = """
            uniform mat4 uMVPMatrix;
            uniform mat4 uSTMatrix;
            attribute vec4 aPosition;
            attribute vec4 aTextureCoord;
            varying vec2 vTextureCoord;
            
            void main() {
              gl_Position = uMVPMatrix * aPosition;
              vTextureCoord = (uSTMatrix * aTextureCoord).xy;
            }
        """

        /** フラグメントシェーダー。実際の色を返す */
        private const val FRAGMENT_SHADER = """
            #extension GL_OES_EGL_image_external : require

            precision mediump float;
            varying vec2 vTextureCoord;
            uniform sampler2D uCanvasTexture;
        
            void main() {
                gl_FragColor = texture2D(uCanvasTexture, vTextureCoord);
            }
        """
    }
}
```

これらを組み合わせて、`Canvas`で動画を作る処理を書きます。  
まずコード全文です。解説はこの後します。（といっても`MediaCodec`周りは複雑すぎて私もわからん）

```kotlin
suspend fun start(
    outFile: File,
    bitRate: Int = 1_000_000,
    frameRate: Int = 30,
    outputVideoWidth: Int = 1280,
    outputVideoHeight: Int = 720,
    codecName: String = MediaFormat.MIMETYPE_VIDEO_AVC,
    containerFormat: Int = MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4,
    onCanvasDrawRequest: Canvas.(positionMs: Long) -> Boolean,
) = withContext(Dispatchers.Default) {
    val encodeMediaCodec = MediaCodec.createEncoderByType(codecName).apply {
        // エンコーダーにセットするMediaFormat
        // コーデックが指定されていればそっちを使う
        val videoMediaFormat = MediaFormat.createVideoFormat(codecName, outputVideoWidth, outputVideoHeight).apply {
            setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
            setInteger(MediaFormat.KEY_FRAME_RATE, frameRate)
            setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1)
            setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
        }
        configure(videoMediaFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
    }

    // OpenGL の初期化をする。OpenGL 関連の関数を呼び出す場合は、OpenGL 用に用意したスレッドに切り替えてから
    val canvasInputSurface = withContext(openGlRelatedThreadDispatcher) {
        // エンコーダーのSurfaceを取得して、OpenGLを利用してCanvasを重ねます
        CanvasInputSurface(
            encodeMediaCodec.createInputSurface(),
            TextureRenderer(
                outputVideoWidth = outputVideoWidth,
                outputVideoHeight = outputVideoHeight
            )
        ).apply {
            makeCurrent()
            // エンコーダー開始
            encodeMediaCodec.start()
            createRender()
        }
    }

    // マルチプレクサ
    var videoTrackIndex = -1
    val mediaMuxer = MediaMuxer(outFile.path, containerFormat)

    // 終了フラグ
    var outputDone = false

    // OpenGL の描画用メインループ。
    // 先述の通り、OpenGL はスレッドでコンテキストを識別するため、OpenGL 用スレッドに切り替える必要あり。
    val openGlRenderingJob = launch(openGlRelatedThreadDispatcher) {
        // 1フレームの時間
        // 60fps なら 16ms、30fps なら 33ms
        val frameMs = 1_000 / frameRate
        // 経過時間。マイクロ秒
        var currentPositionUs = 0L
        try {
            while (!outputDone) {
                // コルーチンキャンセル時は強制終了
                if (!isActive) break

                // OpenGL で描画する
                // Canvas の入力をする
                var isRunning = false
                canvasInputSurface.drawCanvas { canvas ->
                    isRunning = onCanvasDrawRequest(canvas, currentPositionUs / 1_000L)
                }
                canvasInputSurface.setPresentationTime(currentPositionUs * 1_000L)
                canvasInputSurface.swapBuffers()
                if (!isRunning) {
                    outputDone = true
                    encodeMediaCodec.signalEndOfInputStream()
                }
                // 時間を増やす
                // 1 フレーム分の時間。ミリ秒なので増やす
                currentPositionUs += frameMs * 1_000L
            }
        } finally {
            // リソース開放
            canvasInputSurface.release()
        }
    }

    // エンコーダーのループ
    val encoderJob = launch {
        // メタデータ
        val bufferInfo = MediaCodec.BufferInfo()
        try {
            while (!outputDone) {
                // コルーチンキャンセル時は強制終了
                if (!isActive) break

                // Surface経由でデータを貰って保存する
                val encoderStatus = encodeMediaCodec.dequeueOutputBuffer(bufferInfo, TIMEOUT_US)
                if (encoderStatus >= 0) {
                    if (bufferInfo.size > 0) {
                        if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG == 0) {
                            // MediaMuxer へ addTrack した後
                            val encodedData = encodeMediaCodec.getOutputBuffer(encoderStatus)!!
                            mediaMuxer.writeSampleData(videoTrackIndex, encodedData, bufferInfo)
                        }
                    }
                    encodeMediaCodec.releaseOutputBuffer(encoderStatus, false)
                } else if (encoderStatus == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                    // MediaMuxerへ映像トラックを追加するのはこのタイミングで行う
                    // このタイミングでやると固有のパラメーターがセットされたMediaFormatが手に入る(csd-0 とか)
                    // 映像がぶっ壊れている場合（緑で塗りつぶされてるとか）は多分このあたりが怪しい
                    val newFormat = encodeMediaCodec.outputFormat
                    videoTrackIndex = mediaMuxer.addTrack(newFormat)
                    mediaMuxer.start()
                }
                if (encoderStatus != MediaCodec.INFO_TRY_AGAIN_LATER) {
                    continue
                }
            }
        } finally {
            // エンコーダー終了
            encodeMediaCodec.stop()
            encodeMediaCodec.release()
            // MediaMuxerも終了
            mediaMuxer.stop()
            mediaMuxer.release()
        }
    }

    // それぞれのメインループが終わるまで、コルーチンを一時停止
    openGlRenderingJob.join()
    encoderJob.join()
}
```

これで、写真1枚1枚`Canvas`で書いて動画を作る処理ができました。`30fps`なら一秒間に30回`Canvas`で書く漢字ですね！。  
（毎フレーム`Canvas`で書いてエンコードする。）

解説ですが、  
`Kotlin coroutine`で`OpenGL`をうまく使うために、新しい単一スレッドの`Dispatcher`を作ります。  
これの何が嬉しいかと言うと詳しくは前回の記事で、ざっくりいうとこれから作る`Dispatcher`だと常に同じスレッドが使われます。同じスレッドで`OpenGL`を操作する必要があるので  
（`makeCurrent`したスレッド以外では`OpenGL`関連できない？）

https://takusan.negitoro.dev/posts/android_14_media_projection_partial/#録画部分に組み込む話と-kotlin-coroutine-の話


```kotlin
/** OpenGL 描画用スレッドの Kotlin Coroutine Dispatcher */
@OptIn(DelicateCoroutinesApi::class)
private val openGlRelatedThreadDispatcher = newSingleThreadContext("openGlRelatedThreadDispatcher")
```

それから、`MediaCodec`と`OpenGL`周りを用意します。  
`OpenGL`はスレッド注意です！

```kotlin
val encodeMediaCodec = MediaCodec.createEncoderByType(codecName).apply {
    // エンコーダーにセットするMediaFormat
    // コーデックが指定されていればそっちを使う
    val videoMediaFormat = MediaFormat.createVideoFormat(codecName, outputVideoWidth, outputVideoHeight).apply {
        setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
        setInteger(MediaFormat.KEY_FRAME_RATE, frameRate)
        setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1)
        setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
    }
    configure(videoMediaFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
}

// OpenGL の初期化をする。OpenGL 関連の関数を呼び出す場合は、OpenGL 用に用意したスレッドに切り替えてから
val canvasInputSurface = withContext(openGlRelatedThreadDispatcher) {
    // エンコーダーのSurfaceを取得して、OpenGLを利用してCanvasを重ねます
    CanvasInputSurface(
        encodeMediaCodec.createInputSurface(),
        TextureRenderer(
            outputVideoWidth = outputVideoWidth,
            outputVideoHeight = outputVideoHeight
        )
    ).apply {
        makeCurrent()
        // エンコーダー開始
        encodeMediaCodec.start()
        createRender()
    }
}
```

あとは、保存先の`MediaMuxer`を用意して、エンコーダーと`OpenGL`のメインループ？を開始します。  
メインループ？内で`Canvas`を使って描画をする感じですね。

```kotlin
// OpenGL の描画用メインループ。
// 先述の通り、OpenGL はスレッドでコンテキストを識別するため、OpenGL 用スレッドに切り替える必要あり。
val openGlRenderingJob = launch(openGlRelatedThreadDispatcher) {
    // 1フレームの時間
    // 60fps なら 16ms、30fps なら 33ms
    val frameMs = 1_000 / frameRate
    // 経過時間。マイクロ秒
    var currentPositionUs = 0L
    try {
        while (!outputDone) {
            // コルーチンキャンセル時は強制終了
            if (!isActive) break
            // OpenGL で描画する
            // Canvas の入力をする
            var isRunning = false
            canvasInputSurface.drawCanvas { canvas ->
                isRunning = onCanvasDrawRequest(canvas, currentPositionUs / 1_000L)
            }
            canvasInputSurface.setPresentationTime(currentPositionUs * 1_000L)
            canvasInputSurface.swapBuffers()
            if (!isRunning) {
                outputDone = true
                encodeMediaCodec.signalEndOfInputStream()
            }
            // 時間を増やす
            // 1 フレーム分の時間。ミリ秒なので1000増やす
            currentPositionUs += frameMs * 1_000L
        }
    } finally {
        // リソース開放
        canvasInputSurface.release()
    }
}
```

## 映像を逆にする処理
`MediaMetadataRetriever`を作って後ろから動画の写真（フレーム）を取り出して、`Canvas`に書くので、ここだけに高レベル`API`で完結します。  
`Canvas`なので、自由に書くことが出来ます。

`MediaExtractor`よりも`MediaMetadataRetriever`の方が、`fps`とか`ビットレート`とか取れるんですね。

```kotlin
object VideoReverseProcessor {

    /** 動画を後ろのフレームから取り出して、逆再生動画を作る */
    suspend fun reverseVideoFrame(
        context: Context,
        inFileUri: Uri,
        outFile: File
    ) = withContext(Dispatchers.IO) {
        // メタデータを取り出す
        val inputVideoMediaMetadataRetriever = MediaMetadataRetriever().apply { setDataSource(context, inFileUri) }
        val bitRate = inputVideoMediaMetadataRetriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_BITRATE)?.toIntOrNull() ?: 3_000_000
        val (videoHeight, videoWidth) = inputVideoMediaMetadataRetriever.extractVideoSize()
        val frameRate = inputVideoMediaMetadataRetriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_CAPTURE_FRAMERATE)?.toIntOrNull() ?: 30
        val durationMs = inputVideoMediaMetadataRetriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toInt()!!

        // Canvas で毎フレーム書く
        val paint = Paint()
        CanvasVideoProcessor.start(
            outFile = outFile,
            bitRate = bitRate,
            frameRate = frameRate,
            outputVideoWidth = videoWidth,
            outputVideoHeight = videoHeight,
            onCanvasDrawRequest = { currentPositionMs ->
                // ここが Canvas なので、好きなように書く
                // 逆再生したときの、動画のフレームを取り出して、Canvas に書く。
                // getFrameAtTime はマイクロ秒なので注意
                val reverseCurrentPositionMs = durationMs - currentPositionMs
                val bitmap = inputVideoMediaMetadataRetriever.getFrameAtTime(reverseCurrentPositionMs * 1_000, MediaMetadataRetriever.OPTION_CLOSEST)
                if (bitmap != null) {
                    drawBitmap(bitmap, 0f, 0f, paint)
                }
                currentPositionMs <= durationMs
            }
        )
    }

    /**
     * MediaMetadataRetriever で動画の縦横を取得する
     *
     * @return Height / Width の Pair
     */
    private fun MediaMetadataRetriever.extractVideoSize(): Pair<Int, Int> {
        // Android のメディア系（ Retriever だけでなく、MediaExtractor お前もだぞ）
        // 縦動画の場合、縦と横が入れ替わるワナが存在する
        // ROTATION を見る必要あり
        val videoWidth = extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toIntOrNull() ?: 1280
        val videoHeight = extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toIntOrNull() ?: 720
        val rotation = extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION)?.toIntOrNull() ?: 0
        return when (rotation) {
            // 縦だけ入れ替わるので
            90, 270 -> Pair(videoWidth, videoHeight)
            else -> Pair(videoHeight, videoWidth)
        }
    }
}
```

そういえば、縦動画の場合、`Android`だと縦と横が入れ替わった状態で返ってくるんですよね。  
これだと縦動画を入れても、エンコーダーの動画の縦横が横動画のときの値になってしまいます。ので、回転情報を見て、`height / width`を入れ替えて取り出すようにする必要があります。  
https://stackoverflow.com/questions/45879813/

↓ このへんね  

```kotlin
val videoWidth = extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toIntOrNull() ?: 1280
val videoHeight = extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toIntOrNull() ?: 720
val rotation = extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION)?.toIntOrNull() ?: 0
return when (rotation) {
    // 縦だけ入れ替わるので
    90, 270 -> Pair(videoWidth, videoHeight)
    else -> Pair(videoHeight, videoWidth)
}
```

## 音声のエンコーダー・デコーダー
まずは`AAC (mp4 の中に入ってる音声データ)`を未圧縮状態、`PCM`のバイト配列に変換します。  
デコーダーを使ってデコードすることで、`PCM`に戻すことが出来ます。  
`PCM`にすればバイト配列をいじることが出来るようになり、音声データに手を入れることが出来ます。

それから、`PCM`のままだと`mp4`に入らないので、エンコーダーも用意します。  
というわけで`MediaCodec`を使ったエンコーダー・デコーダーがこちらです。

なんで動いてるかはよくわからない、適当に`if`を消したらなんか動かなくなったのでもう知らない...

```kotlin
/**
 * 音声エンコーダー
 * MediaCodecを使いやすくしただけ
 *
 * 生（意味深）の音声（PCM）送られてくるので、 AAC / Opus にエンコードして圧縮する。
 */
class AudioEncoder {

    /** MediaCodec エンコーダー */
    private var mediaCodec: MediaCodec? = null

    /**
     * エンコーダーを初期化する
     *
     * @param codec コーデック。[MediaFormat.MIMETYPE_AUDIO_AAC]など
     * @param sampleRate サンプリングレート
     * @param channelCount チャンネル数
     * @param bitRate ビットレート
     * @param
     */
    fun prepareEncoder(
        codec: String = MediaFormat.MIMETYPE_AUDIO_AAC,
        sampleRate: Int = 44_100,
        channelCount: Int = 2,
        bitRate: Int = 192_000,
    ) {
        val audioEncodeFormat = MediaFormat.createAudioFormat(codec, sampleRate, channelCount).apply {
            setInteger(MediaFormat.KEY_AAC_PROFILE, MediaCodecInfo.CodecProfileLevel.AACObjectLC)
            setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
        }
        // エンコーダー用意
        mediaCodec = MediaCodec.createEncoderByType(codec).apply {
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
                    } else {
                        // もうない！
                        break
                    }
                }
                // 出力
                val outputBufferId = mediaCodec!!.dequeueOutputBuffer(bufferInfo, TIMEOUT_US)
                if (outputBufferId >= 0) {
                    val outputBuffer = mediaCodec!!.getOutputBuffer(outputBufferId)!!
                    // size > 0 とか BUFFER_FLAG_CODEC_CONFIG を消すと、MediaMuxer 周りで時間がおかしくなる
                    if (bufferInfo.size > 0) {
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
            // リソースを開放する
            try {
                mediaCodec?.stop()
                mediaCodec?.release()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    companion object {
        /** MediaCodec タイムアウト */
        private const val TIMEOUT_US = 10_000L
    }
}
```

```kotlin
/**
 * 音声エンコーダー
 * MediaCodecを使いやすくしただけ
 *
 * 生（意味深）の音声（PCM）送られてくるので、 AAC / Opus にエンコードして圧縮する。
 */
class AudioDecoder {
    /** MediaCodec デコーダー */
    private var mediaCodec: MediaCodec? = null

    /**
     * 初期化する
     * デコーダーならパラメーター持ってるはず...
     *
     * @param mediaFormat [android.media.MediaExtractor]から出てきたMediaFormat
     */
    fun prepareDecoder(mediaFormat: MediaFormat) {
        val mimeType = mediaFormat.getString(MediaFormat.KEY_MIME)!!
        mediaCodec = MediaCodec.createDecoderByType(mimeType).apply {
            configure(mediaFormat, null, null, 0)
        }
    }

    /**
     * 音声のデコードをする
     *
     * @param onOutputFormat MediaFormat が確定したときに呼ばれる
     * @param readSampleData ByteArrayを渡すので、音声データを入れて、サイズと再生時間（マイクロ秒）を返してください
     * @param onOutputBufferAvailable デコードされたデータが流れてきます
     */
    suspend fun startAudioDecode(
        onOutputFormat: (MediaFormat) -> Unit,
        readSampleData: (ByteBuffer) -> Pair<Int, Long>,
        onOutputBufferAvailable: (ByteArray) -> Unit,
    ) = withContext(Dispatchers.Default) {
        val bufferInfo = MediaCodec.BufferInfo()
        mediaCodec!!.start()

        try {
            while (isActive) {
                // もし -1 が返ってくれば configure() が間違ってる
                val inputBufferId = mediaCodec!!.dequeueInputBuffer(TIMEOUT_US)
                if (inputBufferId >= 0) {
                    // Extractorからデータを読みだす
                    val inputBuffer = mediaCodec!!.getInputBuffer(inputBufferId)!!
                    // 書き込む。書き込んだデータは[onOutputBufferAvailable]で受け取れる
                    val (size, presentationTime) = readSampleData(inputBuffer)
                    if (size > 0) {
                        mediaCodec!!.queueInputBuffer(inputBufferId, 0, size, presentationTime, 0)
                    } else {
                        // データなくなった場合は終了フラグを立てる
                        mediaCodec!!.queueInputBuffer(inputBufferId, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
                        // おわり
                        break
                    }
                }
                // 出力
                val outputBufferId = mediaCodec!!.dequeueOutputBuffer(bufferInfo, TIMEOUT_US)
                if (outputBufferId >= 0) {
                    // デコード結果をもらう
                    val outputBuffer = mediaCodec!!.getOutputBuffer(outputBufferId)!!
                    val outData = ByteArray(bufferInfo.size)
                    outputBuffer.get(outData)
                    onOutputBufferAvailable(outData)
                    // 返却
                    mediaCodec!!.releaseOutputBuffer(outputBufferId, false)
                } else if (outputBufferId == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                    // HE-AAC を MediaExtractor で解析すると、サンプリングレートが半分になる現象があった。
                    // 調べると、デコーダーが吐き出す MediaFormat を見る必要があった模様。
                    // ドキュメントに書いとけ
                    // https://stackoverflow.com/questions/33609775/
                    onOutputFormat(mediaCodec!!.outputFormat)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            // リソースを開放する
            try {
                mediaCodec?.stop()
                mediaCodec?.release()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    companion object {

        /** MediaCodec タイムアウト */
        private const val TIMEOUT_US = 10_000L
    }
}
```

## 音声と逆にする処理
次に、音声データを逆に並べ替える処理を書きます。。。  
が、ここで音声データの保存方法と言うか、`PCM`がどの用にバイナリを保存しているのか。という話が必要だった。

### サンプリングレート・チャンネル数・量子化ビット数
知っていれば飛ばしていいです。というか前話した気がする、まあいいや。  

- https://takusan.negitoro.dev/posts/android_14_media_projection_partial/#内部音声収録をする-internalaudiorecorderkt
- https://takusan.negitoro.dev/posts/android_himari_droid/#音声データのお話

`PCM`のバイト配列を並び替えて、逆再生動画の音声を作るわけですが、ただ反転させれば逆再生になるかというと**微妙**。  
なので話をします

- チャンネル数
    - これは簡単
    - 左右同じ音を出したい場合は 1
    - 左右違う音を出したい場合は 2
    - 大体 2 なはず
- サンプリングレート
    - 1秒間に何回音を記録するか。です。
    - 大体、44,100 回か、 48,000 回のどちらかだと思います
        - 音声コーデックが`AAC`の場合は 44,100 回が多そう
        - 音声コーデックが`WebM`の場合は 48,000 回が多そう
    - 今回は`AAC`なので`44,100`でいきます
- 量子化ビット数
    - 英語だと`bitDepth`？
    - サンプリングレートの回数分記録するわけですが、何バイトで表現するかです
    - 多分`16bit`が多い？
        - `16bit`の場合、一回の記録で`2バイト`使うことになります
        - 2チャンネルの場合は左右それぞれ`2バイト`使う事になります

なので、最後の量子化ビット数を考えながら、`PCM`のバイト配列を反転させる必要があります。  
そのまま反転させたら`8bit (1バイト)`の場合以外は動かなそう。`2バイト`ずつ操作しないといけないので。。。

|      |      |      |      |      |
|------|------|------|------|------|
| 0x00 | 0x00 | 0x00 | 0x00 | 0x00 |

だと

| 1チャンネル目（16bit なので2バイト） | 2チャンネル目（16bit なので2バイト） | 1秒間にサンプリングレートの数だけ記録... |
|--------------------------------------|--------------------------------------|------------------------------------------|
| 0x00 0x00                            | 0x00 0x00                            | ...                                      |

そういえば最初が右か左かは忘れました、どっちだっけ

上記を考慮して、多分これで`PCM`のバイト配列の反転ができると思います。  
`量子化ビット数`はメタデータから取る方法がなさそうだったので、音声データ量を求める公式を入れ替えて`量子化ビット数`を求める公式を作って計算するようにしてみました。

`デコードするやつ`、`PCMを逆に並び替えるやつ`、`PCMをエンコードするやつ`をそれぞれ作って、`Uri`を渡せば動くようにします。  
これらは`Jetpack Compose`で作った`UI`側で呼び出して使います。

```kotlin
object AudioReverseProcessor {

    /** 動画を後ろのフレームから取り出して、逆再生動画を作る */
    suspend fun reverseAudio(
        context: Context,
        inFileUri: Uri,
        outFile: File,
        tempFolder: File
    ) = withContext(Dispatchers.IO) {
        // 音声の生データ置き場
        val rawDataFile = tempFolder.resolve("raw_file")
        val reverseRawDataFile = tempFolder.resolve("reverse_raw_data")

        // ファイルのメタデータ
        var inputMediaFormat: MediaFormat? = null
        var outputMediaFormat: MediaFormat? = null

        // デコードする（AAC を PCM に）
        decode(
            context = context,
            inFileUri = inFileUri,
            rawDataFile = rawDataFile,
            onReceiveMediaFormat = { input, output ->
                inputMediaFormat = input
                outputMediaFormat = output
            }
        )

        // PCM を逆並びにする
        reversePcmAudioData(
            rawPcmFile = rawDataFile,
            outFile = reverseRawDataFile,
            samplingRate = outputMediaFormat!!.getInteger(MediaFormat.KEY_SAMPLE_RATE),
            channelCount = outputMediaFormat!!.getInteger(MediaFormat.KEY_CHANNEL_COUNT),
            // Duration は MediaCodec#outputFormat ではなく MediaExtractor から
            durationUs = inputMediaFormat!!.getLong(MediaFormat.KEY_DURATION)
        )

        // PCM を AAC にエンコードする
        encode(
            rawDataFile = reverseRawDataFile,
            outFile = outFile,
            samplingRate = outputMediaFormat!!.getInteger(MediaFormat.KEY_SAMPLE_RATE),
            channelCount = outputMediaFormat!!.getInteger(MediaFormat.KEY_CHANNEL_COUNT),
            bitRate = 192_000
        )

        // 要らないファイルを消す
        rawDataFile.delete()
        reverseRawDataFile.delete()
    }

    /** PCM 音声データを逆に並び替えて保存する */
    private suspend fun reversePcmAudioData(
        rawPcmFile: File,
        outFile: File,
        samplingRate: Int,
        channelCount: Int,
        durationUs: Long
    ) = withContext(Dispatchers.IO) {
        // 量子化ビット数を出す（16bit とか 8bit とか。バイトに直すので 16 bitなら 2 byte）
        val durationSec = durationUs / 1_000 / 1_000
        val bitDepth = (((rawPcmFile.length() / durationSec) / samplingRate) / channelCount).toInt()

        // 逆にしていく
        // RandomAccessFile にするか、PCM データをメモリに乗せるかのどっちかだと思う。
        rawPcmFile.readBytes()
        RandomAccessFile(rawPcmFile, "r").use { randomAccessFile ->
            outFile.outputStream().use { outputStream ->
                var nextReadPosition = rawPcmFile.length()
                // 量子化ビット数 * チャンネル数 ごとに取り出す
                val audioData = ByteArray(bitDepth * channelCount)
                while (isActive) {
                    // データを逆から読み出す
                    // 現在位置を調整してバイト配列に入れる
                    randomAccessFile.seek(nextReadPosition)
                    randomAccessFile.read(audioData)
                    // 次取り出す位置
                    nextReadPosition -= audioData.size
                    // 書き込む
                    outputStream.write(audioData)
                    // もう次がない場合は
                    if (nextReadPosition < 0) {
                        break
                    }
                }
            }
        }
    }

    /** PCM を AAC にエンコードする */
    private suspend fun encode(
        rawDataFile: File,
        outFile: File,
        samplingRate: Int,
        channelCount: Int,
        bitRate: Int
    ) = withContext(Dispatchers.Default) {
        val audioEncoder = AudioEncoder().apply {
            prepareEncoder(
                sampleRate = samplingRate,
                channelCount = channelCount,
                bitRate = bitRate
            )
        }
        // MediaMuxer
        var index = -1
        val mediaMuxer = MediaMuxer(outFile.path, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
        // エンコードする
        rawDataFile.inputStream().use { inputStream ->
            audioEncoder.startAudioEncode(
                onRecordInput = { bytes ->
                    // データをエンコーダーに渡す
                    inputStream.read(bytes)
                },
                onOutputFormatAvailable = { mediaFormat ->
                    // トラックを追加
                    index = mediaMuxer.addTrack(mediaFormat)
                    mediaMuxer.start()
                },
                onOutputBufferAvailable = { byteBuffer, bufferInfo ->
                    // 書き込む
                    mediaMuxer.writeSampleData(index, byteBuffer, bufferInfo)
                }
            )
        }
        mediaMuxer.stop()
        mediaMuxer.release()
    }

    /** AAC をデコードする（PCM */
    private suspend fun decode(
        context: Context,
        inFileUri: Uri,
        rawDataFile: File,
        onReceiveMediaFormat: (input: MediaFormat, output: MediaFormat) -> Unit
    ) {
        // Extractor から取り出す
        val (mediaExtractor, mediaFormat) = MediaExtractorTool.createMediaExtractor(context, inFileUri, MediaExtractorTool.Track.AUDIO)
        // デコーダーにメタデータを渡す
        val audioDecoder = AudioDecoder().apply {
            prepareDecoder(mediaFormat)
        }
        // ファイルに書き込む準備
        rawDataFile.outputStream().use { outputStream ->
            // デコードする
            audioDecoder.startAudioDecode(
                onOutputFormat = { outputMediaFormat ->
                    onReceiveMediaFormat(mediaFormat, outputMediaFormat)
                },
                readSampleData = { byteBuffer ->
                    // データを進める
                    val size = mediaExtractor.readSampleData(byteBuffer, 0)
                    mediaExtractor.advance()
                    size to mediaExtractor.sampleTime
                },
                onOutputBufferAvailable = { bytes ->
                    // データを書き込む
                    outputStream.write(bytes)
                }
            )
        }
        mediaExtractor.release()
    }
}
```

解説ですが、`decode()`は`AAC(mp4)`から`PCM`へ、`encode()`は`PCM`から`AAC(mp4)`にする処理です。  
さっき作った`AudioEncoder / AudioDecoder`クラスはここで使うわけですね  
`PCM`はデカくなるのでメモリにのせるのもアレかなと思い、アプリが使えるストレージ`getExternalFilesDir`に一旦ファイルを置いています。

`reversePcmAudioData`は、上記の説明通りに`PCM`を反転に並び替えるやつです。  
ところで、`InputStream`系の`read`は逆方向に読み取ることが出来ないらしく、  
逆から取り出すためには、ファイルのデータをすべてバイト配列の変数に入れるか（`File#readBytes()`）、`InputStream`ではなく、`RandomAccessFile`にして指定位置からデータを取り出すのどちらかが必要？  
どっちがいいんだろう、詳しくないや

## MediaExtractorTool
`MediaExtractor`を作るユーティリティ関数があります。  
↑で書いたコードで使うのでこれも持ってきてね。`MediaExtractor#selectTrack`の呼び忘れには注意

```kotlin
object MediaExtractorTool {

    enum class Track(val mimeTypePrefix: String) {
        VIDEO("video/"),
        AUDIO("audio/")
    }

    /**
     * [MediaExtractor]を作る
     *
     * @return [MediaExtractor]と選択したトラックの[MediaFormat]
     */
    fun createMediaExtractor(
        context: Context,
        uri: Uri,
        track: Track
    ): Pair<MediaExtractor, MediaFormat> {
        val mediaExtractor = MediaExtractor().apply {
            // read で FileDescriptor を開く
            context.contentResolver.openFileDescriptor(uri, "r")?.use {
                setDataSource(it.fileDescriptor)
            }
        }
        val (index, mediaFormat) = mediaExtractor.getTrackMediaFormat(track)
        mediaExtractor.selectTrack(index)
        // Extractor / MediaFormat を返す
        return mediaExtractor to mediaFormat
    }

    /**
     * [MediaExtractor]を作る
     *
     * @return [MediaExtractor]と選択したトラックの[MediaFormat]
     */
    fun createMediaExtractor(
        file: File,
        track: Track
    ): Pair<MediaExtractor, MediaFormat> {
        val mediaExtractor = MediaExtractor().apply {
            setDataSource(file.path)
        }
        val (index, mediaFormat) = mediaExtractor.getTrackMediaFormat(track)
        mediaExtractor.selectTrack(index)
        // Extractor / MediaFormat を返す
        return mediaExtractor to mediaFormat
    }

    private fun MediaExtractor.getTrackMediaFormat(track: Track): Pair<Int, MediaFormat> {
        // トラックを選択する（映像・音声どっち？）
        val trackIndex = (0 until this.trackCount)
            .map { this.getTrackFormat(it) }
            .indexOfFirst { it.getString(MediaFormat.KEY_MIME)?.startsWith(track.mimeTypePrefix) == true }
        val mediaFormat = this.getTrackFormat(trackIndex)
        // 位置と MediaFormat
        return trackIndex to mediaFormat
    }

}
```

## 音声と映像のトラックを保存する処理
`AudioReverseProcessor`と`VideoReverseProcessor`を書いたあたりで気付いたかもしれませんが、  
これ音声と映像がそれぞれの`mp4`に保存されちゃうんですよね。  

`.mp4`一つのファイルに、映像トラックと音声トラックをそれぞれ入れたいわけですが、それをするには`MediaMuxer`を使えばよいです。  
（あくまでもトラックを合わせているだけなので、すでにある音声トラックに音を重ねたいとかはまた別のことをする必要があります）  
この辺で音を重ねてます： https://takusan.negitoro.dev/posts/summer_vacation_music_vocal_only/

コードです。  
```kotlin
object MediaMuxerTool {

    private const val BUFFER_SIZE = 1024 * 4096

    /** 音声トラックと映像トラックを一つのファイルにする。 */
    @SuppressLint("WrongConstant")
    suspend fun mixAvTrack(
        audioTrackFile: File,
        videoTrackFile: File,
        resultFile: File
    ) = withContext(Dispatchers.IO) {
        // 各ファイルから MediaExtractor を作る
        val (audioMediaExtractor, audioFormat) = MediaExtractorTool.createMediaExtractor(audioTrackFile, MediaExtractorTool.Track.AUDIO)
        val (videoMediaExtractor, videoFormat) = MediaExtractorTool.createMediaExtractor(videoTrackFile, MediaExtractorTool.Track.VIDEO)

        // 新しくコンテナファイルを作って保存する
        // 音声と映像を追加
        val mediaMuxer = MediaMuxer(resultFile.path, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
        val audioTrackIndex = mediaMuxer.addTrack(audioFormat)
        val videoTrackIndex = mediaMuxer.addTrack(videoFormat)
        // MediaMuxerスタート。スタート後は addTrack が呼べない
        mediaMuxer.start()

        // 音声をコンテナに追加する
        audioMediaExtractor.apply {
            val byteBuffer = ByteBuffer.allocate(BUFFER_SIZE)
            val bufferInfo = MediaCodec.BufferInfo()
            // データが無くなるまで回す
            while (isActive) {
                // データを読み出す
                val offset = byteBuffer.arrayOffset()
                bufferInfo.size = readSampleData(byteBuffer, offset)
                // もう無い場合
                if (bufferInfo.size < 0) break
                // 書き込む
                bufferInfo.presentationTimeUs = sampleTime
                bufferInfo.flags = sampleFlags // Lintがキレるけど黙らせる
                mediaMuxer.writeSampleData(audioTrackIndex, byteBuffer, bufferInfo)
                // 次のデータに進める
                advance()
            }
            // あとしまつ
            release()
        }

        // 映像をコンテナに追加する
        videoMediaExtractor.apply {
            val byteBuffer = ByteBuffer.allocate(BUFFER_SIZE)
            val bufferInfo = MediaCodec.BufferInfo()
            // データが無くなるまで回す
            while (isActive) {
                // データを読み出す
                val offset = byteBuffer.arrayOffset()
                bufferInfo.size = readSampleData(byteBuffer, offset)
                // もう無い場合
                if (bufferInfo.size < 0) break
                // 書き込む
                bufferInfo.presentationTimeUs = sampleTime
                bufferInfo.flags = sampleFlags // Lintがキレるけど黙らせる
                mediaMuxer.writeSampleData(videoTrackIndex, byteBuffer, bufferInfo)
                // 次のデータに進める
                advance()
            }
            // あとしまつ
            release()
        }

        // 終わり
        mediaMuxer.stop()
        mediaMuxer.release()
    }
}
```

## 端末の動画フォルダへ保存する処理
`getExternalFilesDir`にあるファイルを端末の動画フォルダへコピーする処理です。  
公式はこの辺で説明しています。 https://developer.android.com/training/data-storage/shared/media#add-item

`MediaStore`とかいうメディア系の所在を記録してる`データベース`みたいなやつが居て、そいつに対してレコードを追加すると、  
一意の値（`Uri`）が貰えるので、それで`Java`の`InputStream`、`OutputStream`を開けばよいです。

```kotlin
object MediaStoreTool {

    /** 端末の動画フォルダに保存する */
    suspend fun saveToVideoFolder(
        context: Context,
        file: File
    ) = withContext(Dispatchers.IO) {
        val contentResolver = context.contentResolver
        val contentValues = contentValuesOf(
            MediaStore.MediaColumns.DISPLAY_NAME to file.name,
            MediaStore.MediaColumns.RELATIVE_PATH to "${Environment.DIRECTORY_MOVIES}/AndroidReverseVideoMaker",
            MediaStore.MediaColumns.MIME_TYPE to "video/mp4"
        )
        val uri = contentResolver.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, contentValues) ?: return@withContext
        // コピーする
        contentResolver.openOutputStream(uri)?.use { outputStream ->
            file.inputStream().use { inputStream ->
                inputStream.copyTo(outputStream)
            }
        }
    }

}
```

## これまでに作った処理を合体
上で作った`reverseAudio`と`reverseVideoFrame`を組み合わせて、逆再生動画を作る処理がこちらです！  
`Kotlin coroutine`の`try-finally`でリソース開放できるやつすき

`launch { }`じゃなくて`async { }`でもいいですが、今回は`launch { }`で返り値返していないので、これでいいはず。  
返り値があるなら`async { }`のが良さそう。

```kotlin
object ReverseProcessor {

    /** 音声と映像を逆にする */
    suspend fun start(
        context: Context,
        inFileUri: Uri
    ) = withContext(Dispatchers.Default) {
        // 一時ファイル置き場
        // 音声と映像は別々に処理するので、一旦アプリが使えるストレージに保存する
        val tempFolder = context.getExternalFilesDir(null)?.resolve("temp")?.apply { mkdir() }!!
        val reverseVideoFile = tempFolder.resolve("temp_video_reverse.mp4")
        val reverseAudioFile = tempFolder.resolve("temp_audio_reverse.mp4")
        val resultFile = tempFolder.resolve("android_reverse_video_${System.currentTimeMillis()}.mp4")

        try {
            // 音声と映像を逆にする
            // 並列処理なので、両方終わるまで joinAll で待つ。
            listOf(
                launch {
                    // 音声を逆にする処理
                    // AAC をデコードする
                    AudioReverseProcessor.reverseAudio(
                        context = context,
                        inFileUri = inFileUri,
                        outFile = reverseAudioFile,
                        tempFolder = tempFolder
                    )
                },
                launch {
                    // 映像を逆にする処理
                    VideoReverseProcessor.reverseVideoFrame(
                        context = context,
                        inFileUri = inFileUri,
                        outFile = reverseVideoFile
                    )
                }
            ).joinAll()

            // 音声トラックと映像トラックを合わせる
            MediaMuxerTool.mixAvTrack(
                audioTrackFile = reverseAudioFile,
                videoTrackFile = reverseVideoFile,
                resultFile = resultFile
            )

            // 保存する
            MediaStoreTool.saveToVideoFolder(
                context = context,
                file = resultFile
            )
        } finally {
            // 要らないファイルを消す
            tempFolder.deleteRecursively()
        }
    }
}
```

## UI から呼び出す
↑で作った処理を呼び出します。  
が、結構時間がかかるので、現在の状態を表示させておくと良いでしょう。

遅すぎて`println`も書きました。`logcat`に出るはず

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val videoUri = remember { mutableStateOf<Uri?>(null) }
    val videoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri -> videoUri.value = uri }
    )

    // 処理中か処理終わりか
    val statusText = remember { mutableStateOf("待機中") }

    fun start() {
        val uri = videoUri.value ?: return
        scope.launch {
            // 逆再生動画を作る処理
            statusText.value = "処理中"
            ReverseProcessor.start(
                context = context,
                inFileUri = uri
            )
            statusText.value = "処理終わり"
            println("終わったよ")
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(title = { Text(text = stringResource(id = R.string.app_name)) })
        }
    ) { paddingValues ->
        Column(Modifier.padding(paddingValues)) {

            Button(onClick = {
                videoPicker.launch(PickVisualMediaRequest(mediaType = ActivityResultContracts.PickVisualMedia.VideoOnly))
            }) {
                Text(text = "動画を選ぶ")
            }

            if (videoUri.value != null) {
                Text(text = videoUri.value.toString())
                Button(onClick = { start() }) {
                    Text(text = "処理を開始する")
                }
            }

            Text(text = statusText.value)
        }
    }
}
```

# 動作確認
動画を選んで開始を押せばいいはず。  

![Imgur](https://imgur.com/280dywh.png)

終わると終わりって出ます。  

![Imgur](https://imgur.com/U13gsW6.png)

検証動画ですが、ニコ動で逆再生タグの付いた動画を動画撮影してみて、このアプリで変換して、逆再生が元に戻っていれば成功じゃないでしょうか？  

<script type="application/javascript" src="https://embed.nicovideo.jp/watch/sm3274055/script?w=640&h=360&from=45"></script><noscript><a href="https://www.nicovideo.jp/watch/sm3274055?from=45">逆再生ドナルド【ドナルドのウワサ編】</a></noscript>

<script type="application/javascript" src="https://embed.nicovideo.jp/watch/sm2360782/script?w=640&h=360&from=21"></script><noscript><a href="https://www.nicovideo.jp/watch/sm2360782?from=21">この木なんの木　逆再生バージョン</a></noscript>

<script type="application/javascript" src="https://embed.nicovideo.jp/watch/sm8694353/script?w=640&h=360&from=101"></script><noscript><a href="https://www.nicovideo.jp/watch/sm8694353?from=101">【くるみ☆ぽんちお】おちんぽ☆みるく【逆再生】</a></noscript>

ちゃんと逆再生が元の再生に戻ってますでしょうか・・？  

# ソースコード
https://github.com/takusan23/AndroidReverseVideoMaker

# おわりに
めちゃめちゃ時間がかかる  
この方法はあんまり良くないかもしれない。

あ、あと、`Android`の`MediaMuxer`（コンテナに書き込むマルチプレクサ）は、ストリーミング出来ない`mp4`を吐き出すので、  
`ffmpeg`を使って`moov atom`を先頭にしてからこのブログに貼ってます。  

以上です、お疲れ様でした 888888