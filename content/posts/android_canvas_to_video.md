---
title: AndroidでCanvasから動画を作る
created_at: 2023-04-30
tags:
- Android
- Kotlin
- MediaCodec
- OpenGL
---
どうもこんばんわ。
D.C.5 攻略しました（ぜんねんれい作品）  
全年齢だけど結構攻めたイベントCGが多かった気がする（こんなもんなんですかね  

(顔つきが大人っぽくなりましたね..!)

![Imgur](https://i.imgur.com/pxfMlhZ.png)

今回の主人公、白河灯莉ちゃん以外のヒロインが同じ家にいるだと

灯莉ちゃん√がめっちゃ可愛かったのでおすすめです。
(自前のスクショをとるアプリの調子がわるく普通に写り込んでますが気にせず...)

![Imgur](https://i.imgur.com/GNSMgxB.png)

かわいい

![Imgur](https://i.imgur.com/6Bldigw.png)

ここのお話がお気に入りです

![Imgur](https://i.imgur.com/9ZdJGh7.png)

![Imgur](https://i.imgur.com/UCNiB3v.png)

あと個別ルートで愛乃亜ちゃんかわいいくなっていくのでぜひ。いいなあ...

![Imgur](https://i.imgur.com/Phon90s.png)

![Imgur](https://i.imgur.com/iNsB5sW.png)

D.C.4 をやってなくても楽しめると思うのでぜひ！

![Imgur](https://i.imgur.com/QlX9XGN.png)

いくつか謎が残っていますがFDとか6とかで明かされるのでしょうか、楽しみです！  
(瑞花verのめぐり逢えたね、単品でほしい)

# 本題
少し前に動画の上にCanvasで落書きするような記事を書きましたが、今回はそもそもCanvasから動画を作ってみようの話です。  
スライドショーっぽい動画を作るアプリが作れるかも？

## 環境

| なまえ  | あたい       |
|---------|--------------|
| 端末    | Xperia Pro-I |
| Android | 13           |
| 言語    | Kotlin       |

`OpenGL` を使いますが使わない方法もあります。  
あと`Jetpack Compose`を使いますが別に使わなくても良いです。

## めんどうなんだけど
最新バージョンは↓から、すでに今回やったことは MavenCentral にあるので、、、  
![Maven Central](https://img.shields.io/maven-central/v/io.github.takusan23/akaricore)

```kotlin
implementation("io.github.takusan23:akaricore:1.0.0-alpha03")
```

あとはいい感じに乗っかれば作れるはず

```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        canvasToVideoProcessorStart()
    }

    private fun canvasToVideoProcessorStart() {
        lifecycleScope.launch {
            // 保存先
            val resultFile = getExternalFilesDir(null)?.resolve("${System.currentTimeMillis()}.mp4") ?: return@launch
            // エンコーダー
            val videoWidth = 1280
            val videoHeight = 720

            val outlinePaint = Paint().apply {
                color = Color.BLACK
                style = Paint.Style.STROKE
                textSize = 80f
            }
            val innerPaint = Paint().apply {
                style = Paint.Style.FILL
                color = Color.WHITE
                textSize = 80f
            }
            val logoBitmap = ContextCompat.getDrawable(this@MainActivity, R.drawable.ic_launcher_foreground)?.apply {
                setTint(Color.WHITE)
            }?.toBitmap(300, 300)!!

            // Canvas にかく
            // 処理が終わるまで一時停止する
            CanvasProcessor.start(
                resultFile = resultFile, // エンコード後の動画ファイル
                outputVideoWidth = videoWidth,
                outputVideoHeight = videoHeight
            ) { positionMs ->
                // 適当に文字を書く
                val text = "動画の時間 = ${"%.2f".format(positionMs / 1000f)}"
                // 枠取り文字
                drawText(text, 0f, 80f, outlinePaint)
                // 枠無し文字
                drawText(text, 0f, 80f, innerPaint)
                // 画像も表示する
                drawBitmap(logoBitmap, (videoWidth - logoBitmap.width).toFloat(), (videoHeight - logoBitmap.height).toFloat(), innerPaint)
                positionMs < 10_000
            }

            // 音声の追加など
            // MediaStore を使って ギャラリーに追加するとか
            Toast.makeText(this@MainActivity, "終了しました", Toast.LENGTH_SHORT).show()
        }
    }

}
```

# MediaCodecシリーズ

- [動画をつなげる](/posts/android_mediacodec_merge_video/)
- [なんちゃってライブ配信をする](/posts/android_standalone_webm_livestreaming/)
- [動画の上に文字を重ねる](/posts/android_add_canvas_text_to_video/)
    - 今回の記事はこれの続きみたいなところがあります

# Android で Canvas から動画を作るには
`MediaCodec`と`OpenGL`を使うか、難しいのを無しにして`MediaRecorder`と`Surface#lockHardwareCanvas`を使う方法があると思います。  

## MediaCodec + OpenGL
- MediaCodec / MediaMuxer の用意をする
- MediaCodec の Surface に OpenGL で描画する
    - Surface と OpenGL の橋渡しをするためのコードは書かないといけない（AOSPそのまま）
- Canvas で書いて、Bitmapにして、テクスチャとして描画します。
    - OpenGL のシェーダーもAOSPから借りてくることにします（ならお前は何をするんだ）
- MediaCodec から出てきたエンコード済みデータを MediaMuxer を使い `mp4` （コンテナフォーマット）に格納する

`OpenGL`の用意と、シェーダーを書かないといけない（ただコピペできる）ので、普通に難しい。  
あとやっぱり低レベルAPIなので、`MediaRecorder`では出てこない`コーデック やら コンテナ やら`と向き合わないといけない。  
が、**おそらく正規ルート感はある**。（後者は動かない端末があるらしい）

## 難しいのを無しにして MediaRecorder + Surface#lockHardwareCanvas を使う
というか `OpenGL` の代わりに `lockHardwareCanvas` を使う方法もあります。Android 6 以上なので、まぁ選んでも良いでしょう

- MediaRecorder を初期化する
- MediaRecorder の Surface を取得する
- Surface にある `lockHardwareCanvas` 関数を呼ぶと `Canvas` が貰えるので、よしなに書く
- `unlockCanvasAndPost` の引数に `Canvas` を入れる

高レベルAPIで保守しやすそう！！！  
`lockHardwareCanvas`を使わないといけないです（ハードウェアアクセラレーションされていないとだめ）  
また、一部の端末ではこの方法が使えないらしい（以下の `Issue` 参照、多分 `OpenGL` を使うしかなさそう？）  
https://issuetracker.google.com/issues/111433520

# 作ってみる
`Android Studio` 更新したら `Empty Activity` が `JetpackCompose` になってる、、  
適当なプロジェクトを作ってください。

# MediaCodec + OpenGL を使う方法
- `MediaCodec`
    - エンコード / デコード するためのクラス
    - H.264 / H.265 とかにエンコードできる
        - パラパラ漫画にするよりも動画にするほうが容量が小さいのはコーデックが圧縮してくれているから
    - エラーメッセージが役に立たない
- `MediaMuxer`
    - コンテナフォーマットへ保存するためのクラス
        - コンテナフォーマットは音声と映像を一つのファイルにするための技術（`mp4`など）
    - `MediaCodec`から出てきたエンコード済みデータを`mp4 (webM とかでも可)`に格納する
        - 音声も追加したい場合はコンテナに入れる
    - `addTrack`は スタート前に呼ぶ必要がある

## CanvasInputSurface
AOSP の以下のコードそのままです（多分 GLSurfaceView の内部でやっていること）  
https://cs.android.com/android/platform/superproject/+/master:cts/tests/tests/media/common/src/android/media/cts/InputSurface.java

↑ の Kotlin化 と若干の修正が入っているだけです。  

これは`エンコーダー MediaCodec`の入力に`OpenGL`を使えるようにするためのクラスです。わかりません。

```kotlin
/** MediaCodec の Surface と OpenGL の橋渡しをする */
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

## TextureRenderer
`OpenGL`で`Canvas`を`Bitmap`にしてテクスチャとして描画するためのクラス。  
`OpenGL`、、何もわからん（アルファブレンド設定が有効だと真っ暗な映像が出来た...）

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

## CanvasProcessor
これが`Canvas`から動画にするためのクラスですね。  
記事冒頭に書いたライブラリと同じやつです。  

- エンコーダー（`MediaCodec`）を用意
- `OpenGL`の用意
- エンコーダーを開始し
- 終わるまで以下の作業をループ
    - エンコーダーからエンコードしたデータがあれば取り出す
        - `MediaMuxer`に入れてコンテナフォーマットに格納
            - `MediaMuxer`に始めていれる場合は`addTrack`する（おそらくエンコードしたデータよりも先に呼ばれる）
    - `Canvas` に好きなように描く
        - 関数を引数にしているので、呼び出し側で好きなように描けます
    - `OpenGL`で描画し、`swapBuffers`でエンコーダーに渡す？
    - もう描画しない場合はループを抜ける
- 後片付け

多分他の`MediaCodecシリーズ`と同じようなコードだと思う。

```kotlin
/** Canvas から動画を作る */
object CanvasProcessor {

    /** タイムアウト */
    private const val TIMEOUT_US = 10000L

    /** トラック番号が空の場合 */
    private const val UNDEFINED_TRACK_INDEX = -1

    /**
     * 処理を開始する
     *
     * @param resultFile エンコード先のファイル
     * @param videoCodec 動画コーデック
     * @param containerFormat コンテナフォーマット
     * @param bitRate ビットレート
     * @param frameRate フレームレート
     * @param outputVideoWidth 動画の高さ
     * @param outputVideoHeight 動画の幅
     * @param onCanvasDrawRequest Canvasの描画が必要になったら呼び出される。trueを返している間、動画を作成する
     */
    suspend fun start(
        resultFile: File,
        videoCodec: String = MediaFormat.MIMETYPE_VIDEO_AVC,
        containerFormat: Int = MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4,
        bitRate: Int = 1_000_000,
        frameRate: Int = 30,
        outputVideoWidth: Int = 1280,
        outputVideoHeight: Int = 720,
        onCanvasDrawRequest: Canvas.(positionMs: Long) -> Boolean,
    ) = withContext(Dispatchers.Default) {
        // エンコード用（生データ -> H.264）MediaCodec
        val encodeMediaCodec = MediaCodec.createEncoderByType(videoCodec).apply {
            // エンコーダーにセットするMediaFormat
            // コーデックが指定されていればそっちを使う
            val videoMediaFormat = MediaFormat.createVideoFormat(videoCodec, outputVideoWidth, outputVideoHeight).apply {
                setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
                setInteger(MediaFormat.KEY_FRAME_RATE, frameRate)
                setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1)
                setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
            }
            configure(videoMediaFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        }

        // エンコーダーのSurfaceを取得して、OpenGLを利用してCanvasを重ねます
        val canvasInputSurface = CanvasInputSurface(
            encodeMediaCodec.createInputSurface(),
            TextureRenderer(
                outputVideoWidth = outputVideoWidth,
                outputVideoHeight = outputVideoHeight
            )
        )
        // OpenGL
        canvasInputSurface.makeCurrent()
        encodeMediaCodec.start()
        canvasInputSurface.createRender()

        // 保存先
        var videoTrackIndex = UNDEFINED_TRACK_INDEX
        val mediaMuxer = MediaMuxer(resultFile.path, containerFormat)

        // メタデータ格納用
        val bufferInfo = MediaCodec.BufferInfo()
        var outputDone = false
        val startMs = System.currentTimeMillis()

        while (!outputDone) {

            // コルーチンキャンセル時は強制終了
            if (!isActive) break

            // Surface経由でデータを貰って保存する
            val encoderStatus = encodeMediaCodec.dequeueOutputBuffer(bufferInfo, TIMEOUT_US)
            if (encoderStatus >= 0) {
                val encodedData = encodeMediaCodec.getOutputBuffer(encoderStatus)!!
                if (bufferInfo.size > 1) {
                    if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG == 0) {
                        // MediaMuxer へ addTrack した後
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
            // OpenGLで描画する
            // Canvas の入力をする
            val presentationTimeUs = (System.currentTimeMillis() - startMs) * 1000
            var isRunning = false
            canvasInputSurface.drawCanvas { canvas ->
                isRunning = onCanvasDrawRequest(canvas, presentationTimeUs / 1000L)
            }
            canvasInputSurface.setPresentationTime(presentationTimeUs * 1000)
            canvasInputSurface.swapBuffers()
            if (!isRunning) {
                outputDone = true
                encodeMediaCodec.signalEndOfInputStream()
            }
        }

        // OpenGL開放
        canvasInputSurface.release()
        // エンコーダー終了
        encodeMediaCodec.stop()
        encodeMediaCodec.release()
        // MediaMuxerも終了
        mediaMuxer.stop()
        mediaMuxer.release()
    }
}
```

## MainActivity
呼び出し側で`Canvas`にお絵かきをします  
`Jetpack Compose`でプロジェクトを作ったために使ってますが、別に使う必要はないです  
（むしろエンコードは時間がかかるので`Acitivty`ではなく、`Foreground Service`などにやらせるべきです。）  

まーでも記事を書く側としては、`xml`側のコードをわざわざ載せなくても、一つの`kt`ファイルを記事に乗せておけば良いというのは結構良いですね。

保存先ですが、`getExternalFilesDir`なので、`/sdcard/Android/data/{アプリケーションID}/files`の中にあるはずです。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CanvasToVideoTheme {
                // A surface container using the 'background' color from the theme
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    MainScreen()
                }
            }
        }
    }
}

// TODO 別に Compose を使う必要はない。
@Composable
fun MainScreen() {
    val isRunning = remember { mutableStateOf(false) }
    val context = LocalContext.current

    LaunchedEffect(key1 = Unit) {
        // 適当なファイルを作成
        val resultFile = context.getExternalFilesDir(null)?.resolve("${System.currentTimeMillis()}.mp4") ?: return@LaunchedEffect
        val outlinePaint = Paint().apply {
            color = Color.BLACK
            style = Paint.Style.STROKE
            textSize = 80f
        }
        val innerPaint = Paint().apply {
            style = Paint.Style.FILL
            color = Color.WHITE
            textSize = 80f
        }
        isRunning.value = true
        CanvasProcessor.start(resultFile) { positionMs ->
            // this は Canvas
            drawColor(Color.LTGRAY)
            // positionMs は現在の動画の時間
            val text = "動画の時間 = ${"%.2f".format(positionMs / 1000f)}"
            // 枠取り文字
            drawText(text, 0f, 80f, outlinePaint)
            // 枠無し文字
            drawText(text, 0f, 80f, innerPaint)
            // true を返している間は動画を作成する。とりあえず 10 秒
            positionMs < 10_000
        }
        isRunning.value = false
    }

    Text(text = if (isRunning.value) "エンコード中です" else "終わりました")

}
```

保存先↓  
`Android`標準のファイラー（Files by Google の事ではない） `com.android.documentsui` の方のアプリを使うことで多分 `/sdcard/Android/data` を開くことが出来ると思います。
（ただホーム画面にアイコンがないので、`Intent`を投げるアプリが別途必要（ショートカットを作れるアプリなど））  
また`X-plore`でも権限を渡すことで見れます。

![Imgur](https://i.imgur.com/lZsG3in.png)

どうでしょう、動画ちゃんと出来ていますか！？

![Imgur](https://i.imgur.com/ZMv4zcq.png)


# もう一つの MediaRecorder + lockHardwareCanvas を利用する方法
こっちは高レベルAPIなので、難しいことは無いと思う。

## CanvasProcessorHighLevelApi
命名センスが終わっている。`OpenGL`版をもとに作りました。合ってるかはわからないです。  
コードを見てもらえるとなんですが、`MediaRecorder`と`Canvas`を使っています。`OpenGL`と`MediaCodec / MediaMuxer`の難しいコードはありません。  

```kotlin
/** OpenGL と MediaCodec を使わずに [CanvasProcessor] をする */
@RequiresApi(Build.VERSION_CODES.M)
object CanvasProcessorHighLevelApi {

    /**
     * 処理を開始する
     *
     * @param context [Context]
     * @param resultFile エンコード先のファイル
     * @param videoCodec 動画コーデック
     * @param containerFormat コンテナフォーマット
     * @param bitRate ビットレート
     * @param frameRate フレームレート
     * @param outputVideoWidth 動画の高さ
     * @param outputVideoHeight 動画の幅
     * @param onCanvasDrawRequest Canvasの描画が必要になったら呼び出される。trueを返している間、動画を作成する
     */
    suspend fun start(
        context: Context,
        resultFile: File,
        videoCodec: Int = MediaRecorder.VideoEncoder.H264,
        containerFormat: Int = MediaRecorder.OutputFormat.MPEG_4,
        bitRate: Int = 1_000_000,
        frameRate: Int = 30,
        outputVideoWidth: Int = 1280,
        outputVideoHeight: Int = 720,
        onCanvasDrawRequest: Canvas.(positionMs: Long) -> Boolean,
    ) = withContext(Dispatchers.Default) {
        val mediaRecorder = (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) MediaRecorder(context) else MediaRecorder()).apply {
            // メソッド呼び出しには順番があります
            setVideoSource(MediaRecorder.VideoSource.SURFACE)
            setOutputFormat(containerFormat)
            setVideoEncoder(videoCodec)
            setVideoEncodingBitRate(bitRate)
            setVideoFrameRate(frameRate)
            setVideoSize(outputVideoWidth, outputVideoHeight)
            setAudioEncodingBitRate(128_000)
            setAudioSamplingRate(44_100)
            setOutputFile(resultFile.path)
            prepare()
        }
        val inputSurface = mediaRecorder.surface
        val startTime = System.currentTimeMillis()
        mediaRecorder.start()
        while (isActive) {
            val positionMs = System.currentTimeMillis() - startTime
            val canvas = inputSurface.lockHardwareCanvas()
            val isRunning = onCanvasDrawRequest(canvas, positionMs)
            inputSurface.unlockCanvasAndPost(canvas)
            if (!isRunning) {
                break
            }
        }
        mediaRecorder.stop()
        mediaRecorder.release()
    }
}
```

## MainActivity
呼び出し側もあんまり変わってないです。  
（`Context`が必要になったぐらいで、APIはだいたい同じ）

ただ、私の作りが悪いのか、少しずつ時間がずれていっている気がします、、、改善したほうが良さそう。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CanvasToVideoTheme {
                // A surface container using the 'background' color from the theme
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    MainScreen()
                }
            }
        }
    }
}

// TODO 別に Compose を使う必要はない。
@Composable
fun MainScreen() {
    val isRunning = remember { mutableStateOf(false) }
    val context = LocalContext.current

    LaunchedEffect(key1 = Unit) {
        // 適当なファイルを作成
        val resultFile = context.getExternalFilesDir(null)?.resolve("${System.currentTimeMillis()}.mp4") ?: return@LaunchedEffect
        val outlinePaint = Paint().apply {
            color = Color.BLACK
            style = Paint.Style.STROKE
            textSize = 80f
        }
        val innerPaint = Paint().apply {
            style = Paint.Style.FILL
            color = Color.WHITE
            textSize = 80f
        }
        isRunning.value = true
        CanvasProcessorHighLevelApi.start(context, resultFile) { positionMs ->
            // this は Canvas
            drawColor(Color.LTGRAY)
            // positionMs は現在の動画の時間
            val text = "動画の時間 = ${"%.2f".format(positionMs / 1000f)}"
            // 枠取り文字
            drawText(text, 0f, 80f, outlinePaint)
            // 枠無し文字
            drawText(text, 0f, 80f, innerPaint)
            // true を返している間は動画を作成する。とりあえず 10 秒
            positionMs < 10_000
        }
        isRunning.value = false
    }

    Text(text = if (isRunning.value) "エンコード中です" else "終わりました")

}
```

API はだいたい同じなので、以下のように実行時に切り替えるみたいなことも出来ると思います（誰得？）

```kotlin
// CanvasProcessor / CanvasProcessorHighLevelApi どっちを使うか
val isUseLowLevelApi = true
// 描画時に呼び出される関数
val onCanvasDrawRequest: Canvas.(Long) -> Boolean = { positionMs ->
    // this は Canvas
    drawColor(Color.LTGRAY)
    // positionMs は現在の動画の時間
    val text = "動画の時間 = ${"%.2f".format(positionMs / 1000f)}"
    // 枠取り文字
    drawText(text, 0f, 80f, outlinePaint)
    // 枠無し文字
    drawText(text, 0f, 80f, innerPaint)
    // true を返している間は動画を作成する。とりあえず 10 秒
    positionMs < 10_000
}
if (isUseLowLevelApi) {
    CanvasProcessor.start(resultFile, onCanvasDrawRequest = onCanvasDrawRequest)
} else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
    CanvasProcessorHighLevelApi.start(context, resultFile, onCanvasDrawRequest = onCanvasDrawRequest)
}
```

# 端末の動画フォルダに保存して欲しい
このままだと毎回ファイルマネージャーを開かないといけないので、端末の動画フォルダー（`/sdcard/Movies`）に移動するようにしましょう。  
ここに移動することで、Googleフォト等の写真ビューアーで見ることが出来ます。

```kotlin
object MediaStoreTool {

    /**
     * 端末の動画フォルダーへコピーする
     *
     * @param context [Context]
     * @param file コピーするファイル
     */
    suspend fun copyToMovieFolder(
        context: Context,
        file: File
    ) = withContext(Dispatchers.IO) {
        val contentValues = contentValuesOf(
            MediaStore.MediaColumns.DISPLAY_NAME to file.name,
            // RELATIVE_PATH（ディレクトリを掘る） は Android 10 以降のみです
            MediaStore.MediaColumns.RELATIVE_PATH to "${Environment.DIRECTORY_MOVIES}/CanvasToVideo"
        )
        val uri = context.contentResolver.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, contentValues) ?: return@withContext
        context.contentResolver.openOutputStream(uri)?.use { outputStream ->
            file.inputStream().use { inputStream ->
                inputStream.copyTo(outputStream)
            }
        }
    }

}
```

これをエンコーダーの下に描けば良いはず

```kotlin
// TODO 別に Compose を使う必要はない。
@Composable
fun MainScreen() {
    val isRunning = remember { mutableStateOf(false) }
    val context = LocalContext.current

    LaunchedEffect(key1 = Unit) {
        // 適当なファイルを作成
        val resultFile = context.getExternalFilesDir(null)?.resolve("${System.currentTimeMillis()}.mp4") ?: return@LaunchedEffect
        val outlinePaint = Paint().apply {
            color = Color.BLACK
            style = Paint.Style.STROKE
            textSize = 80f
        }
        val innerPaint = Paint().apply {
            style = Paint.Style.FILL
            color = Color.WHITE
            textSize = 80f
        }
        isRunning.value = true
        // CanvasProcessor / CanvasProcessorHighLevelApi どっちを使うか
        val isUseLowLevelApi = false
        // 描画時に呼び出される関数
        val onCanvasDrawRequest: Canvas.(Long) -> Boolean = { positionMs ->
            // this は Canvas
            drawColor(Color.LTGRAY)
            // positionMs は現在の動画の時間
            val text = "動画の時間 = ${"%.2f".format(positionMs / 1000f)}"
            // 枠取り文字
            drawText(text, 0f, 80f, outlinePaint)
            // 枠無し文字
            drawText(text, 0f, 80f, innerPaint)
            // true を返している間は動画を作成する。とりあえず 10 秒
            positionMs < 10_000
        }
        if (isUseLowLevelApi) {
            CanvasProcessor.start(resultFile, onCanvasDrawRequest = onCanvasDrawRequest)
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            CanvasProcessorHighLevelApi.start(context, resultFile, onCanvasDrawRequest = onCanvasDrawRequest)
        }
        // コピーして元データを消す
        MediaStoreTool.copyToMovieFolder(context, resultFile)
        resultFile.delete()
        isRunning.value = false
    }

    Text(text = if (isRunning.value) "エンコード中です" else "終わりました")

}
```

これで動画フォルダーに保存されるようになったはず。
というかこれ前も書いた気がする

![Imgur](https://i.imgur.com/03vHmPf.png)

# ベンチマーク（動作確認）
時間測ってみます。三回くらい試しました。リリースビルドではないので正しくは無いかも？  
測ってみましたが差がないのでどっちを使ってもいいと思いました。

| たんまつ                              | OpenGL 版                      | lockHardwareCanvas 版          |
|---------------------------------------|--------------------------------|--------------------------------|
| Xperia Pro-I (SDM 888)                | 10111 ms / 10109 ms / 10121 ms | 10161 ms / 10133 ms / 10121 ms |
| Google Pixel 6 Pro (Google Tensor G1) | 10185 ms / 10131 ms / 10117 ms | 10717 ms / 10649 ms / 10654 ms |
| Google Pixel 3 XL (SDM 845)           | 10381 ms / 10133 ms / 10099 ms | 10552 ms / 10404 ms / 10391 ms |
| Xperia XZ1 Compact (SDM 835)          | 10932 ms / 10204 ms / 10186 ms | 10420 ms / 10412 ms / 10435 ms |
| Xperia Z3 Compact (SDM 801)           | 10634 ms / 10559 ms / 10419 ms | Android 5 なので使えない       |
たまたま Z3 Compact の電源が入っていたのでついでにやってみました、もう9年くらい前になるの...！？

## ファイルサイズ
速度はあんまり変わらないのですが、できた動画サイズが全部バラバラなんですよね（なぜ？）
OpenGL -> lockHardwareCanvas を三回繰り返したので、偶数がOpenGL、奇数がlockHardwareCanvasになります  
うーん、`OpenGL 版`のほうが若干ファイルサイズが小さい？

- Xperia Pro-I
    - ![Imgur](https://i.imgur.com/e9iA6gJ.png)
- Google Pixel 6 Pro
    - ![Imgur](https://i.imgur.com/pstJVP9.png)
- Google Pixel 3 XL
    - ![Imgur](https://i.imgur.com/WkQ0P0x.png)
- Xperia XZ1 Compact
    - ![Imgur](https://i.imgur.com/oczGiJk.png)
- Xperia Z3 Compact
    - ![Imgur](https://i.imgur.com/TOHnqZQ.png)

他にも Xiaomi とかでも見てみましたが特に問題なくどっちでも動いていそうです。（Issueの件再現せず）

# スライドショーの動画を作るアプリを作る
`Jetpack Compose`でUIを作ります。  
画像を選択するボタンと、エンコードボタンを設置しました。  
押したらエンコードするようにしています。多分 UI に書くことじゃないと思います（時間がかかるので`Service`でやるべきですねはい。）  
特に難しいことはしてない（`Canvas`に書いてるだけ）ので、詳しくはコードのコメント見てください。  

`Bitmap`を`Canvas`の真ん中に描くのが地味に面倒だった。  
`Uri から Bitmap`はなんか面倒だったので`Glide`とか`Coil`とか入れて楽しても良いかも。  

```kotlin
private const val TIME_MS = 3_000
private const val VIDEO_WIDTH = 1280
private const val VIDEO_HEIGHT = 720

/** スライドショーを作る */
@Composable
fun SlideShowScreen() {
    val context = LocalContext.current
    // 実行中フラグ
    val isRunning = remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    // 取得した画像を入れる配列
    val imageList = remember { mutableStateListOf<Uri>() }
    val imagePicker = rememberLauncherForActivityResult(contract = ActivityResultContracts.GetMultipleContents()) {
        imageList.addAll(it)
    }

    // エンコードする
    fun encode() {
        scope.launch {
            isRunning.value = true
            val resultFile = context.getExternalFilesDir(null)?.resolve("${System.currentTimeMillis()}.mp4")!!
            val paint = Paint()

            var prevBitmapPathPair: Pair<Uri, Bitmap>? = null
            CanvasProcessor.start(
                resultFile = resultFile,
                outputVideoWidth = VIDEO_WIDTH,
                outputVideoHeight = VIDEO_HEIGHT
            ) { positionMs ->
                // 再生位置から表示すべき画像の配列の添え字を計算
                val index = (positionMs / TIME_MS).toInt()
                val uri = imageList.getOrNull(index) ?: return@start false
                // 前回と違う画像の場合
                if (prevBitmapPathPair?.first != uri) {
                    val bitmap = createBitmapFromUri(context, uri).aspectResize(VIDEO_WIDTH, VIDEO_HEIGHT)
                    // 前の Bitmap を破棄してから
                    prevBitmapPathPair?.second?.recycle()
                    prevBitmapPathPair = uri to bitmap
                }

                // 真ん中に Bitmap
                val bitmap = prevBitmapPathPair!!.second
                drawBitmap(bitmap, ((VIDEO_WIDTH / 2f) - (bitmap.width / 2f)), 0f, paint)

                // true を返している間
                positionMs < TIME_MS * imageList.size
            }

            // コピーして元データを消す
            MediaStoreTool.copyToMovieFolder(context, resultFile)
            resultFile.delete()

            isRunning.value = false
        }
    }

    Column {
        // 画像のパスを表示
        imageList.forEach { Text(text = it.toString()) }

        // 選択ボタン
        Button(
            modifier = Modifier.padding(10.dp),
            onClick = {
                imageList.clear()
                imagePicker.launch("image/*")
            }
        ) { Text(text = "画像を選ぶ") }

        // 実行中はエンコードボタンを塞ぐ
        if (isRunning.value) {
            Text(text = "エンコード中です")
        } else {
            Button(
                modifier = Modifier.padding(10.dp),
                onClick = { encode() }
            ) { Text(text = "エンコードする") }
        }
    }

}

/** アスペクト比を保持してリサイズする */
private fun Bitmap.aspectResize(targetWidth: Int, targetHeight: Int): Bitmap {
    val width = width
    val height = height
    val aspectBitmap = width.toFloat() / height.toFloat()
    val aspectTarget = targetWidth.toFloat() / targetHeight.toFloat()
    var calcWidth = targetWidth
    var calcHeight = targetHeight
    if (aspectTarget > aspectBitmap) {
        calcWidth = (targetHeight.toFloat() * aspectBitmap).toInt()
    } else {
        calcHeight = (targetWidth.toFloat() / aspectBitmap).toInt()
    }
    return scale(calcWidth, calcHeight, true)
}

/** Uri から Bitmap を作る。 */
private fun createBitmapFromUri(context: Context, uri: Uri): Bitmap {
    // これだと ハードウェア Bitmap が出来てしまうので、 SOFTWARE をつけて、ソフトウェア Bitmap を作る必要がある（編集可能）
    // API が Android 9 以降なので、古いバージョンをサポートしたい場合は古い方法を使うか、いっその事画像を読み込むライブラリ Glide とかを入れるのもありだと思います
    return ImageDecoder.createSource(context.contentResolver, uri)
        .let { src -> ImageDecoder.decodeDrawable(src) { decoder, info, s -> decoder.allocator = ImageDecoder.ALLOCATOR_SOFTWARE } }
        .toBitmap()
}
```
![Imgur](https://i.imgur.com/SFXmTmb.png)

まぁ切り替えアニメーションがないんで、見た目があれですが面倒そうなので、、、  
（今思ったけどアニメーションなくてもスライドショーって呼んで良いのか・・・？）  

<video src="https://user-images.githubusercontent.com/32033405/235321119-e8391d46-9fbd-4ed2-9cc7-5a2dd72b7d10.mp4" width="80%" controls></video>

# エンドロール？スタッフロール？の動画も作れます
エンディングのあれも作れそう、作ります。  
適当に画像を選ぶボタンと、エンコードボタンと、エンドロール？で流す文字を入力するテキストボックスを置きました。  
これも`Canvas`にいい感じに書いてるだけなので、特に難しいことはしてないはず。`positionMs`を見てそれっぽく上に文字を移動させているだけです、、  


```kotlin
private const val VIDEO_DURATION_MS = 20_000
private const val VIDEO_WIDTH = 1280
private const val VIDEO_HEIGHT = 720

/** エンドロールをつくる */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EndRollScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    // 実行中フラグ
    val isRunning = remember { mutableStateOf(false) }

    // エンドロールの文字
    val endRollText = remember { mutableStateOf("") }

    // 画像
    val bitmap = remember { mutableStateOf<Bitmap?>(null) }
    DisposableEffect(key1 = Unit) {
        onDispose { bitmap.value?.recycle() } // Bitmap を破棄する
    }
    val imagePicker = rememberLauncherForActivityResult(contract = ActivityResultContracts.GetContent()) {
        val uri = it ?: return@rememberLauncherForActivityResult
        bitmap.value = createBitmapFromUri(context, uri).aspectResize(200, 200)
    }

    // エンコードする
    fun encode() {
        scope.launch {
            isRunning.value = true
            val resultFile = context.getExternalFilesDir(null)?.resolve("${System.currentTimeMillis()}.mp4")!!
            val bitmapPaint = Paint()
            val textPaint = Paint().apply {
                style = Paint.Style.FILL
                color = Color.WHITE
                textSize = 50f
            }

            CanvasProcessor.start(
                resultFile = resultFile,
                outputVideoWidth = VIDEO_WIDTH,
                outputVideoHeight = VIDEO_HEIGHT
            ) { positionMs ->

                // 背景は真っ黒
                drawColor(Color.BLACK)

                // アイコンを描く
                var textLeftPos = 100f
                bitmap.value?.also { bitmap ->
                    drawBitmap(bitmap, textLeftPos, ((VIDEO_HEIGHT / 2f) - (bitmap.height / 2f)), bitmapPaint)
                    textLeftPos += bitmap.width
                }

                // 適当に移動させる
                // 複数行描けないので行単位で drawText する
                endRollText.value.lines().forEachIndexed { index, text ->
                    drawText(text, textLeftPos + 100f, ((VIDEO_HEIGHT + (textPaint.textSize * (index + 1))) - (positionMs / 10f)), textPaint)
                }

                positionMs < VIDEO_DURATION_MS
            }

            // コピーして元データを消す
            MediaStoreTool.copyToMovieFolder(context, resultFile)
            resultFile.delete()

            isRunning.value = false
        }
    }

    Column {
        // 選択ボタン
        bitmap.value?.also {
            Text(text = "Bitmap width = ${it.width}")
        }
        Button(
            modifier = Modifier.padding(10.dp),
            onClick = { imagePicker.launch("image/*") }
        ) { Text(text = "画像を選ぶ") }

        // 文字
        OutlinedTextField(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp),
            value = endRollText.value,
            onValueChange = { endRollText.value = it },
            label = { Text(text = "エンドロールのテキスト") }
        )

        Spacer(modifier = Modifier.height(50.dp))

        // 実行中はエンコードボタンを塞ぐ
        if (isRunning.value) {
            Text(text = "エンコード中です")
        } else {
            Button(
                modifier = Modifier.padding(10.dp),
                onClick = { encode() }
            ) { Text(text = "エンコードする") }
        }
    }
}

/** アスペクト比を保持してリサイズする */
private fun Bitmap.aspectResize(targetWidth: Int, targetHeight: Int): Bitmap {
    val width = width
    val height = height
    val aspectBitmap = width.toFloat() / height.toFloat()
    val aspectTarget = targetWidth.toFloat() / targetHeight.toFloat()
    var calcWidth = targetWidth
    var calcHeight = targetHeight
    if (aspectTarget > aspectBitmap) {
        calcWidth = (targetHeight.toFloat() * aspectBitmap).toInt()
    } else {
        calcHeight = (targetWidth.toFloat() / aspectBitmap).toInt()
    }
    return scale(calcWidth, calcHeight, true)
}

/** Uri から Bitmap を作る。 */
private fun createBitmapFromUri(context: Context, uri: Uri): Bitmap {
    // これだと ハードウェア Bitmap が出来てしまうので、 SOFTWARE をつけて、ソフトウェア Bitmap を作る必要がある（編集可能）
    // API が Android 9 以降なので、古いバージョンをサポートしたい場合は古い方法を使うか、いっその事画像を読み込むライブラリ Glide とかを入れるのもありだと思います
    return ImageDecoder.createSource(context.contentResolver, uri)
        .let { src -> ImageDecoder.decodeDrawable(src) { decoder, info, s -> decoder.allocator = ImageDecoder.ALLOCATOR_SOFTWARE } }
        .toBitmap()
}
```

こんな感じのUIになるはず

![Imgur](https://i.imgur.com/wzlAcX0.png)

実際に作るとこんな感じです。

<video src="https://user-images.githubusercontent.com/32033405/235225944-748106f4-89a0-48c0-b14d-7edfd2698b96.mp4" width="80%" controls ></video>

![Imgur](https://i.imgur.com/h7fPexc.png)

![Imgur](https://i.imgur.com/oaGiDld.png)

# そーすこーど
最低限のUIを作りました、スライドショーとエンドロールを作成する画面を開くことができるはずです。

https://github.com/takusan23/CanvasToVideo

# おわりに
`Windows 用 Nearby Share`、めっちゃ便利ですね。  
`USB`にしても`USB接続をファイル転送`にしないといけないし、`adb`だとプレビューないからファイルの名前を知らないと行けないから、結構どれを取っても面倒だったんですよね。  
少し前なら Googleフォト へバックアップしてパソコンでダウンロードする方法がありましたが、無制限じゃなくなったからなあ。  
すごく便利です。