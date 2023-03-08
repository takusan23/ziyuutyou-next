---
title: AndroidでMediaCodecを利用して動画の上に文字をかさねる
created_at: 2023-02-21
tags:
- Android
- Kotlin
- MediaCodec
---
どうもこんばんわ  
D.S. -Dal Segno- 攻略しました。  
D.C.4 ってもしかして D.S.2 、、、？

OP曲が良すぎ。ぜひ聞いてみてね  

<script type="application/javascript" src="https://embed.nicovideo.jp/watch/so28350805/script?w=320&h=180"></script><noscript><a href="https://www.nicovideo.jp/watch/so28350805">D.S. -Dal Segno- オープニングムービー</a></noscript>

ヒロインみんなかわいいので置いておきますね。  
イベントCGがめっちゃいいのでやってみてね。

![Imgur](https://imgur.com/qUF7Dcr.png)  
声がふわふわしててかわいい

![Imgur](https://imgur.com/IY6kJjj.png)  
ここ何回でも聞ける

![Imgur](https://imgur.com/TPRc8vg.png)  
オンオフ合ったほうがいいよね

![Imgur](https://imgur.com/jpRWjaJ.png)  
姉さん女房！！！

![Imgur](https://imgur.com/nOW8MqM.png)  
ファンディスクに期待、、！

どうやらファンディスクの方ではデフォルトネームを呼んでくれるらしい？ので気になっております  
それはそれとしてじゃあ D.C.5 やるからまたね

# 動画に文字をかさねてみた
↓ こんな感じに テキストとドロイド君（画像） 重ねてエンコードしてみる話です。  
元動画はこれ：https://nico.ms/sm36044089

<video src="https://user-images.githubusercontent.com/32033405/219969962-999f71a9-2b55-484e-adfd-ad6f597431b9.mp4" width="80%" controls></video>

![Imgur](https://imgur.com/vw7176n.png)

https://github.com/takusan23/AkariDroid

お正月に試してたことの話をします、、、

# 二番煎じ
https://www.sisik.eu/blog/android/media/add-text-to-video

はい。

# めんどいんだけど？
本当に（ほんとうに）最低限の状態で`MavenCentral`に公開したのでお試しには使えるかも、、、
![Maven Central](https://img.shields.io/maven-central/v/io.github.takusan23/akaricore)

```kotlin
implementation("io.github.takusan23:akaricore:1.0.0-alpha03")
```

最低限過ぎてこの記事で紹介する`音声の追加`部分、`MediaStore`の部分はまだ存在しないので自分で作る必要があります。

```kotlin
class MainActivity : AppCompatActivity() {
    private val folder by lazy { File(getExternalFilesDir(null), "video_edit").apply { mkdir() } }
    private val originVideoFile by lazy { File(folder, ORIGIN_VIDEO_FILE).apply { createNewFile() } }

    private val videoPicker = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri ?: return@registerForActivityResult
        // 動画をコピーしてエンコードする
        originVideoFile.delete()
        contentResolver.openInputStream(uri)?.use { inputStream ->
            originVideoFile.outputStream().use { outputStream ->
                inputStream.copyTo(outputStream)
            }
        }
        videoProcessorStart()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        // 動画を選択する
        videoPicker.launch("video/mp4")
    }

    private fun videoProcessorStart() {
        // エンコード後のファイル
        val resultFile = File(folder, RESULT_VIDEO_FILE)
        lifecycleScope.launch {
            // エンコーダー
            val videoWidth = 1280
            val videoHeight = 720

            val textPaint = Paint().apply {
                textSize = 100f
            }
            val logoBitmap = ContextCompat.getDrawable(this@MainActivity, R.drawable.ic_launcher_foreground)?.apply {
                setTint(Color.WHITE)
            }?.toBitmap(300, 300)!!

            // Canvas にかく
            // 処理が終わるまで一時停止する
            VideoCanvasProcessor.start(
                videoFile = originVideoFile, // もと動画ファイル
                resultFile = resultFile, // エンコード後の動画ファイル
                outputVideoWidth = videoWidth,
                outputVideoHeight = videoHeight
            ) { positionMs ->
                // 適当に文字を書く
                val text = "動画の時間 = ${"%.2f".format(positionMs / 1000f)}"

                textPaint.color = Color.BLACK
                textPaint.style = Paint.Style.STROKE
                // 枠取り文字
                drawText(text, 200f, 300f, textPaint)

                textPaint.style = Paint.Style.FILL
                textPaint.color = Color.WHITE
                // 枠無し文字
                drawText(text, 200f, 300f, textPaint)

                // 画像も表示する
                drawBitmap(logoBitmap, (videoWidth - logoBitmap.width).toFloat(), (videoHeight - logoBitmap.height).toFloat(), textPaint)
            }

            // 音声の追加など
            // MediaStore を使って ギャラリーに追加するとか
            Toast.makeText(this@MainActivity, "終了しました", Toast.LENGTH_SHORT).show()
        }
    }

    companion object {
        private const val ORIGIN_VIDEO_FILE = "origin_video_file.mp4"
        private const val RESULT_VIDEO_FILE = "result.mp4"
    }

}
```

# MediaCodecシリーズ

- [動画をつなげる](/posts/android_mediacodec_merge_video/)
    - `MediaCodec` / `MediaExtractor` / `MediaMuxer` の雑な説明があります
        - 説明はこっちに任せて本記事では省略します...
    - https://github.com/takusan23/Coneco
    - https://github.com/takusan23/AndroidMediaCodecVideoMerge
- [なんちゃってライブ配信をする](/posts/android_standalone_webm_livestreaming/)
    - カメラの入力を`MediaCodec`に渡して細切れな`WebM`を作ってブラウザで見る
    - https://github.com/takusan23/AndroidWebMDashLive

# Android で文字を動画にかさねるには
`FFmpeg`とかを利用しない場合、`MediaCodec`をそのまま使うしかないです。（使いにくいやつ）  

これのそのままですが  
https://speakerdeck.com/masayukisuda/mediacodecdedong-hua-bian-ji-wositemiyou

- MediaExtractorで動画を取り出して
- MediaCodecで動画をデコードして
- Canvasで文字を書く
    - AndroidのCanvasに書ければ図形でも画像でも行けるはず
- OpenGLで動画とCanvasを描画する
- OpenGLの出力をもとにMediaCodecでエンコードする
- エンコーダーから
- 繰り返す

`OpenGL`を使う理由ですが、`MediaCodec`の入力用`Surface`では`lockCanvas`を使っての描画ができないことが書かれています。  

https://developer.android.com/reference/android/media/MediaCodec#createInputSurface()

# 動画関係のメモ

## コーデックとコンテナ
一応置いておきます

- コンテナ
    - エンコードした映像と音声を一つのファイルに保存するための技術
    - AAC / H.264 (AVC) はコーデックの種類なので間違い
        - mp4
        - mpeg2-ts
        - WebM
- コーデック
    - 映像、音声を圧縮するプログラム
        - 圧縮する作業をエンコードとかいいます
        - 逆に再生するために戻す作業をデコードといいます
    - パラパラ漫画にするよりも動画にするほうが容量が小さいのはコーデックが圧縮しているから
        - AAC
            - 音声
        - Opus
            - 音声
            - JavaScript の MediaRecorder はこれが採用されていたかな
        - H.264 / AVC
            - 映像
        - H.265 / HEVC
            - 映像
            - H.264 の半分で同じ画質と言われている(つまり容量半分)
            - カメラアプリによっては H.265 を利用して容量を節約する機能があったり
        - VP9
            - 映像
            - JavaScript の MediaRecorder で使えたような？
            - H.265 の Google バージョン

# つくる
OpenGLの部分とかはほぼコピーです

| なまえ         | あたい                      |
|----------------|-----------------------------|
| 言語           | Kotlin / OpenGL (一部)      |
| targetSdk      | 33                          |
| Android Studio | Android Studio Electric Eel |
| たんまつ       | Xperia Pro-I Android 13     |

# app/build.gradle
`app/build.gradle`に書き足します。  
`ViewBinding`と最低限のライブラリを

```gradle

android {
    namespace 'io.github.takusan23.androidmediacodecaddcanvastexttovideo'
    compileSdk 33

    // 省略...

    buildFeatures {
        viewBinding true
    }

    // 省略...

}

dependencies {

    // lifecycleScope
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.5.1'

    // 省略...
}
```

# activity_main.xml
動画を選択するボタンと、エンコードするボタンと、現在の状態を表すTextView を置きました。

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <Button
        android:id="@+id/video_select_button"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="動画ファイルを選択する"
        app:layout_constraintBottom_toTopOf="@+id/encode_button"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintHorizontal_bias="0.5"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@+id/encode_status_text_view" />

    <TextView
        android:id="@+id/encode_status_text_view"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="エンコード前"
        app:layout_constraintBottom_toTopOf="@+id/video_select_button"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintHorizontal_bias="0.5"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <Button
        android:id="@+id/encode_button"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="エンコードする"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintHorizontal_bias="0.5"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@+id/video_select_button" />
</androidx.constraintlayout.widget.ConstraintLayout>
```

## 動画ファイルをコピーする
まずは動画ファイルをアプリの固有ストレージにコピーする部分を作ります。  
`Uri`だと使いにくいので、一旦`Context#getExternalFilesDir`の領域に保存します。その領域では`Java File API`が使えるので。

```kotlin
class MainActivity : AppCompatActivity() {

    private val workFolder by lazy { File(getExternalFilesDir(null), "video").apply { mkdir() } }
    private val viewBinding by lazy { ActivityMainBinding.inflate(layoutInflater) }

    /** 動画ピッカー */
    private val videoPicker = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri ?: return@registerForActivityResult
        // コピーする
        lifecycleScope.launch(Dispatchers.IO) {
            val videoFile = File(workFolder, VIDEO_FILE_NAME).apply {
                createNewFile()
            }
            videoFile.outputStream().use { outputStream ->
                contentResolver.openInputStream(uri)?.use { inputStream ->
                    inputStream.copyTo(outputStream)
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(viewBinding.root)

        // 動画を選択する
        viewBinding.videoSelectButton.setOnClickListener {
            videoPicker.launch("video/mp4")
        }

    }

    companion object {
        /** かさねる動画のファイル名 */
        private const val VIDEO_FILE_NAME = "origin_video_file.mp4"
    }

}
```

## OpenGL の用意をする
AOSPのCTSテストとかでも使われているやつですね。  
https://cs.android.com/android/platform/superproject/+/master:cts/tests/tests/media/src/android/media/cts/InputSurface.java

### CodecInputSurface.kt
`GLSurfaceView`とかはこの辺意識しなくてもいきなり`OpenGL`のシェーダー書くところから始められるので良いですね、、、  
よく知らないのでコピペしてください、、、

```kotlin
/*
 * https://android.googlesource.com/platform/cts/+/jb-mr2-release/tests/tests/media/src/android/media/cts/InputSurface.java
 *
 * Copyright (C) 2013 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * MediaCodecで使うOpenGLを管理するクラス
 *
 * Holds state associated with a Surface used for MediaCodec encoder input.
 * The constructor takes a Surface obtained from MediaCodec.createInputSurface(), and uses that
 * to create an EGL window surface.  Calls to eglSwapBuffers() cause a frame of data to be sent
 * to the video encoder.
 *
 * @param surface MediaCodecでもらえるcreateInputSurface
 */
class CodecInputSurface(
    private val surface: Surface,
    private val textureRenderer: TextureRenderer,
) : SurfaceTexture.OnFrameAvailableListener {

    private var mEGLDisplay = EGL14.EGL_NO_DISPLAY
    private var mEGLContext = EGL14.EGL_NO_CONTEXT
    private var mEGLSurface = EGL14.EGL_NO_SURFACE
    private val mFrameSyncObject = Object()
    private var mFrameAvailable = false
    private var surfaceTexture: SurfaceTexture? = null

    /** MediaCodecのデコーダーSurfaceとしてこれを使う */
    var drawSurface: Surface? = null
        private set

    init {
        eglSetup()
    }

    fun createRender() {
        textureRenderer.surfaceCreated()
        surfaceTexture = SurfaceTexture(textureRenderer.videoTextureID).also { surfaceTexture ->
            surfaceTexture.setOnFrameAvailableListener(this)
        }
        drawSurface = Surface(surfaceTexture)
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

    fun changeFragmentShader(fragmentShader: String) {
        textureRenderer.changeFragmentShader(fragmentShader)
    }

    fun awaitNewImage() {
        val TIMEOUT_MS = 5000
        synchronized(mFrameSyncObject) {
            while (!mFrameAvailable) {
                try {
                    mFrameSyncObject.wait(TIMEOUT_MS.toLong())
                    if (!mFrameAvailable) {
                        throw RuntimeException("Surface frame wait timed out")
                    }
                } catch (ie: InterruptedException) {
                    throw RuntimeException(ie)
                }
            }
            mFrameAvailable = false
        }
        textureRenderer.checkGlError("before updateTexImage")
        surfaceTexture?.updateTexImage()
    }

    /**
     * フレームが来たら描画する
     *
     * @param onCanvasDrawRequest Canvasを渡すので描画して返してください
     */
    fun drawImage(onCanvasDrawRequest: (Canvas) -> Unit) {
        val surfaceTexture = surfaceTexture ?: return
        textureRenderer.prepareDraw()
        textureRenderer.drawFrame(surfaceTexture)
        textureRenderer.drawCanvas(onCanvasDrawRequest)
        textureRenderer.invokeGlFinish()
    }

    override fun onFrameAvailable(st: SurfaceTexture) {
        synchronized(mFrameSyncObject) {
            if (mFrameAvailable) {
                throw RuntimeException("mFrameAvailable already set, frame could be dropped")
            }
            mFrameAvailable = true
            mFrameSyncObject.notifyAll()
        }
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

### TextureRenderer.kt
こちらは映像とCanvasをOpenGLを利用してかさねるためのクラスです。  
まずコード全文を

```kotlin
/**
 * OpenGL関連
 * 映像にCanvasを重ねてエンコーダーに渡す。
 * 映像を描画したあとにCanvasを描画する。二回四角形を描画している。
 *
 * @param outputVideoWidth エンコード時の動画の幅
 * @param outputVideoHeight エンコード時の動画の高さ
 * @param originVideoWidth 元動画の幅
 * @param originVideoHeight 元動画の高さ
 * @param videoRotation 映像を回転させる場合に利用
 */
class TextureRenderer(
    private val outputVideoWidth: Int,
    private val outputVideoHeight: Int,
    private val originVideoHeight: Int,
    private val originVideoWidth: Int,
    private val videoRotation: Float
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
    private var uVideoTextureHandle = 0
    private var uDrawVideo = 0

    /** キャンバスの画像を渡すOpenGLのテクスチャID */
    private var canvasTextureID = -1

    /** デコード結果が流れてくるOpenGLのテクスチャID */
    var videoTextureID = -1
        private set

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
     * フレームを描画する
     *
     * @param surfaceTexture [SurfaceTexture]
     */
    fun drawFrame(surfaceTexture: SurfaceTexture) {
        checkGlError("onDrawFrame start")
        surfaceTexture.getTransformMatrix(mSTMatrix)
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, videoTextureID)
        // 映像のテクスチャユニットは GLES20.GL_TEXTURE0 なので 0
        GLES20.glUniform1i(uVideoTextureHandle, 0)
        // Canvasのテクスチャユニットは GLES20.GL_TEXTURE1 なので 1
        GLES20.glUniform1i(uCanvasTextureHandle, 1)
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
        // ----
        // 映像を描画するフラグを立てる
        // ----
        GLES20.glUniform1i(uDrawVideo, 1)
        // アスペクト比を調整する
        Matrix.setIdentityM(mMVPMatrix, 0)

        // 横幅を計算して合わせる
        // 縦は outputHeight 最大まで
        val scaleY = (outputVideoHeight / originVideoHeight.toFloat())
        val textureWidth = originVideoWidth * scaleY
        val percent = textureWidth / outputVideoWidth.toFloat()
        Matrix.scaleM(mMVPMatrix, 0, percent, 1f, 1f)

        // 動画が回転している場合に戻す
        Matrix.rotateM(mMVPMatrix, 0, videoRotation, 0f, 0f, 1f)

        // 描画する
        GLES20.glUniformMatrix4fv(muSTMatrixHandle, 1, false, mSTMatrix, 0)
        GLES20.glUniformMatrix4fv(muMVPMatrixHandle, 1, false, mMVPMatrix, 0)
        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
        checkGlError("glDrawArrays VideoFrame")
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
        GLES20.glActiveTexture(GLES20.GL_TEXTURE1)
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
        // 第二引数の 1 って何、、、（GLES20.GL_TEXTURE1 だから？）
        GLES20.glUniform1i(uCanvasTextureHandle, 1)
        checkGlError("glUniform1i uCanvasTextureHandle")
        // ----
        // Canvasを描画するフラグを立てる
        // ----
        GLES20.glUniform1i(uDrawVideo, 0)
        // アスペクト比の調整はいらないのでリセット（エンコーダーの出力サイズにCanvasを合わせて作っているため）
        Matrix.setIdentityM(mMVPMatrix, 0)
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
        uVideoTextureHandle = GLES20.glGetUniformLocation(mProgram, "uVideoTexture")
        uDrawVideo = GLES20.glGetUniformLocation(mProgram, "uDrawVideo")

        // 映像が入ってくるテクスチャ、Canvasのテクスチャを登録する
        // テクスチャ2つ作る
        val textures = IntArray(2)
        GLES20.glGenTextures(2, textures, 0)

        // 映像テクスチャ
        videoTextureID = textures[0]
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, videoTextureID)
        checkGlError("glBindTexture videoTextureID")

        GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_NEAREST.toFloat())
        GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR.toFloat())
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE)
        checkGlError("glTexParameter videoTextureID")

        // Canvasテクスチャ
        canvasTextureID = textures[1]
        GLES20.glActiveTexture(GLES20.GL_TEXTURE1)
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, canvasTextureID)
        checkGlError("glBindTexture canvasTextureID")

        // 縮小拡大時の補間設定
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR)
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR)

        // テクスチャを初期化
        // 更新の際はコンテキストを切り替えた上で texSubImage2D を使う
        GLUtils.texImage2D(GLES20.GL_TEXTURE_2D, 0, canvasBitmap, 0)
        checkGlError("glTexParameter canvasTextureID")

        // アルファブレンドを有効
        // これにより、透明なテクスチャがちゃんと透明に描画される
        GLES20.glEnable(GLES20.GL_BLEND)
        GLES20.glBlendFunc(GLES20.GL_SRC_ALPHA, GLES20.GL_ONE_MINUS_SRC_ALPHA)
        checkGlError("glEnable BLEND")
    }

    fun changeFragmentShader(fragmentShader: String) {
        GLES20.glDeleteProgram(mProgram)
        mProgram = createProgram(VERTEX_SHADER, fragmentShader)
        if (mProgram == 0) {
            throw RuntimeException("failed creating program")
        }
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

    fun checkGlError(op: String) {
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
            uniform samplerExternalOES uVideoTexture;        
            uniform sampler2D uCanvasTexture;
            
            // 映像を描画するのか、Canvasを描画するのかのフラグ
            uniform int uDrawVideo;
        
            void main() {
                vec4 videoTexture = texture2D(uVideoTexture, vTextureCoord);
                vec4 canvasTexture = texture2D(uCanvasTexture, vTextureCoord);
                
                if (bool(uDrawVideo)) {
                    gl_FragColor = videoTexture;                
                } else {
                    gl_FragColor = canvasTexture;
                }
            }
        """
    }

}
```

#### よく分からんなりの解説
`Surface`の映像は`Android`の`SurfaceTexture`を利用することで`OpenGL`のテクスチャ（画像）として取得できます。（`sampler2D`ではなく`samplerExternalOES`です）  
`Canvas`は`Bitmap`にすることで、`OpenGL`のテクスチャとして取得できます。（`sampler2D`です）  

- 映像のフレームがやってくる
- Canvasに描画する
- `glDrawArrays`を呼び出して映像を描画する
- 今度は `Canvas` の内容を `glDrawArrays` を呼び出して重ねて描画する
    - `uniform 変数 uDrawVideo`を切り替えて Canvas を描画する
- エンコーダーに行く？

今回は`フラグメントシェーダ`に用意したフラグを切り替えることで映像とCanvasの画像を切り替えて描画できるようにしてあります。（`uDrawVideo`フラグ）  
（どうやって 映像とCanvasの画像 を重ねるんだろうって一週間ぐらい悩んでましたが、二回描画すればいいんですね。基礎がなってないね）

また、`gl_Position`の値を制御することで回転やスケールの調整ができます。  
今回は`gl_Position`をいい感じにして縦動画でも真ん中にフィットさせて描画されるようにしてあります。`Matrix.scaleM`の部分です。（引数に動画のサイズを取ってるのはそのせい）  
また、（後でまた書きますが）縦動画の場合は`gl_Position`をいい感じにして回転させる処理を追加しています。行列の回転とかいうやつらしいです。`Matrix.rotateM`の部分です。
（もしうまく動いてない（ひっくり返ってる）場合は `Matrix.rotateM` の部分を見直してみてください、、よくわかりません。）

あと、`Canvas`の何も書いていない部分は透明になるのですが、`アルファブレンド`の設定をしていないと`重ねたCanvas`のせいで透明の部分が真っ黒になります。

#### Snapdragon端末で映像が乱れた
`glClear`関数を呼ぶことで直りました。

### VideoProcessor.kt
最後に MediaCodec とかと上で書いたコードを組み合わせます。  
まず全文貼りますね  
ここにもいくつか罠があって、、、

```kotlin
/**
 * 動画にCanvasをかさねる処理
 *
 * @param videoFile 元動画
 * @param resultFile エンコード後の動画
 * @param bitRate ビットレート
 * @param frameRate フレームレート
 * @param outputVideoWidth エンコード後の動画の幅
 * @param outputVideoHeight エンコード後の動画の高さ
 */
class VideoProcessor(
    private val videoFile: File,
    private val resultFile: File,
    private val bitRate: Int = 1_000_000,
    private val frameRate: Int = 30,
    private val outputVideoWidth: Int = 1280,
    private val outputVideoHeight: Int = 720,
) {

    /** データを取り出すやつ */
    private var mediaExtractor: MediaExtractor? = null

    /** エンコード用 [MediaCodec] */
    private var encodeMediaCodec: MediaCodec? = null

    /** デコード用 [MediaCodec] */
    private var decodeMediaCodec: MediaCodec? = null

    /** コンテナフォーマットへ格納するやつ */
    private val mediaMuxer by lazy { MediaMuxer(resultFile.path, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4) }

    /** OpenGL で加工する */
    private var codecInputSurface: CodecInputSurface? = null

    /**
     * エンコードを開始する
     *
     * @param onCanvasDrawRequest Canvasで描画する。timeMsは動画の時間
     */
    suspend fun encode(
        onCanvasDrawRequest: Canvas.(timeMs: Long) -> Unit,
    ) = withContext(Dispatchers.Default) {
        // 動画を取り出す
        val (mediaExtractor, index, format) = extractMedia(videoFile.path, "video/")
        this@VideoProcessor.mediaExtractor = mediaExtractor
        // 動画トラック
        mediaExtractor.selectTrack(index)
        mediaExtractor.seekTo(0, MediaExtractor.SEEK_TO_PREVIOUS_SYNC)

        // 解析結果から各パラメータを取り出す
        val videoMimeType = format.getString(MediaFormat.KEY_MIME)!!
        val videoWidth = format.getInteger(MediaFormat.KEY_WIDTH)
        val videoHeight = format.getInteger(MediaFormat.KEY_HEIGHT)
        // 画面回転情報
        // Androidの縦動画はどうやら回転させているらしいので、回転を戻す
        // TODO KEY_ROTATION が Android 6 以降
        val hasRotation = format.getIntegerOrNull(MediaFormat.KEY_ROTATION) == 90
        // 画面回転度がある場合は width / height がそれぞれ入れ替わるので注意（一敗）
        val originVideoWidth = if (hasRotation) videoHeight else videoWidth
        val originVideoHeight = if (hasRotation) videoWidth else videoHeight

        // エンコード用（生データ -> H.264）MediaCodec
        encodeMediaCodec = MediaCodec.createEncoderByType(videoMimeType).apply {
            // エンコーダーにセットするMediaFormat
            // コーデックが指定されていればそっちを使う
            val videoMediaFormat = MediaFormat.createVideoFormat(videoMimeType, outputVideoWidth, outputVideoHeight).apply {
                setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
                setInteger(MediaFormat.KEY_FRAME_RATE, frameRate)
                setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1)
                setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
            }
            configure(videoMediaFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        }

        // エンコーダーのSurfaceを取得して、OpenGLを利用してCanvasを重ねます
        codecInputSurface = CodecInputSurface(
            encodeMediaCodec!!.createInputSurface(),
            TextureRenderer(
                outputVideoWidth = outputVideoWidth,
                outputVideoHeight = outputVideoHeight,
                originVideoWidth = originVideoWidth,
                originVideoHeight = originVideoHeight,
                videoRotation = if (hasRotation) 270f else 0f
            )
        )

        codecInputSurface?.makeCurrent()
        encodeMediaCodec!!.start()

        // デコード用（H.264 -> 生データ）MediaCodec
        codecInputSurface?.createRender()
        decodeMediaCodec = MediaCodec.createDecoderByType(videoMimeType).apply {
            // 画面回転データが有った場合にリセットする
            // このままだと回転されたままなので、OpenGL 側で回転させる
            // setInteger をここでやるのは良くない気がするけど面倒なので
            format.setInteger(MediaFormat.KEY_ROTATION, 0)
            configure(format, codecInputSurface!!.drawSurface, null, 0)
        }
        decodeMediaCodec?.start()

        // nonNull
        val decodeMediaCodec = decodeMediaCodec!!
        val encodeMediaCodec = encodeMediaCodec!!

        // メタデータ格納用
        val bufferInfo = MediaCodec.BufferInfo()

        var videoTrackIndex = -1

        var outputDone = false
        var inputDone = false

        while (!outputDone) {
            if (!inputDone) {

                val inputBufferId = decodeMediaCodec.dequeueInputBuffer(TIMEOUT_US)
                if (inputBufferId >= 0) {
                    val inputBuffer = decodeMediaCodec.getInputBuffer(inputBufferId)!!
                    val size = mediaExtractor.readSampleData(inputBuffer, 0)
                    if (size > 0) {
                        // デコーダーへ流す
                        // 今までの動画の分の再生位置を足しておく
                        decodeMediaCodec.queueInputBuffer(inputBufferId, 0, size, mediaExtractor.sampleTime, 0)
                        mediaExtractor.advance()
                    } else {
                        // 終了
                        decodeMediaCodec.queueInputBuffer(inputBufferId, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
                        // 開放
                        mediaExtractor.release()
                        // 終了
                        inputDone = true
                    }
                }
            }
            var decoderOutputAvailable = true
            while (decoderOutputAvailable) {
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
                    outputDone = bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0
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
                // Surfaceへレンダリングする。そしてOpenGLでゴニョゴニョする
                val outputBufferId = decodeMediaCodec.dequeueOutputBuffer(bufferInfo, TIMEOUT_US)
                if (outputBufferId == MediaCodec.INFO_TRY_AGAIN_LATER) {
                    decoderOutputAvailable = false
                } else if (outputBufferId >= 0) {
                    // 進捗
                    val doRender = bufferInfo.size != 0
                    decodeMediaCodec.releaseOutputBuffer(outputBufferId, doRender)
                    if (doRender) {
                        var errorWait = false
                        try {
                            codecInputSurface?.awaitNewImage()
                        } catch (e: Exception) {
                            errorWait = true
                        }
                        if (!errorWait) {
                            // 映像とCanvasを合成する
                            codecInputSurface?.drawImage { canvas ->
                                onCanvasDrawRequest(canvas, bufferInfo.presentationTimeUs / 1000L)
                            }
                            codecInputSurface?.setPresentationTime(bufferInfo.presentationTimeUs * 1000)
                            codecInputSurface?.swapBuffers()
                        }
                    }
                    if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) {
                        decoderOutputAvailable = false
                        encodeMediaCodec.signalEndOfInputStream()
                    }
                }
            }
        }

        // デコーダー終了
        decodeMediaCodec.stop()
        decodeMediaCodec.release()
        // OpenGL開放
        codecInputSurface?.release()
        // エンコーダー終了
        encodeMediaCodec.stop()
        encodeMediaCodec.release()
        // MediaMuxerも終了
        mediaMuxer.stop()
        mediaMuxer.release()
    }

    private fun MediaFormat.getIntegerOrNull(name: String): Int? {
        return if (containsKey(name)) {
            getInteger(name)
        } else null
    }

    private fun extractMedia(videoPath: String, startMimeType: String): Triple<MediaExtractor, Int, MediaFormat> {
        val mediaExtractor = MediaExtractor().apply { setDataSource(videoPath) }
        // トラックとインデックス番号のPairを作って返す
        val (index, track) = (0 until mediaExtractor.trackCount)
            .map { index -> index to mediaExtractor.getTrackFormat(index) }
            .first { (_, track) -> track.getString(MediaFormat.KEY_MIME)?.startsWith(startMimeType) == true }
        return Triple(mediaExtractor, index, track)
    }

    companion object {
        /** タイムアウト */
        private const val TIMEOUT_US = 10_000L
    }
}
```

#### 雑な解説
といってもデコーダーの出力をOpenGLに向けている以外になさそう？  
映像が取得できたら、`Canvas`の更新をするようにしています。

#### わな 縦動画の場合は動画の回転情報が入っている。
- しれっと書いてあった
    - https://developer.android.com/reference/android/media/MediaCodec#transformations-when-rendering-onto-surface
    - Surface の場合回転情報があれば回転しますよって
    - 回転した 横の動画 みたいな
    - デコード時 に回転されたまま表示される
- それだけじゃなく、動画のの幅、動画の高さも回転されている状態で保存される
    - height / width が逆になる！？
- 今回はこれを修正するため、縦動画の場合は`OpenGL`側で`Matrix.rotateM`をして回転情報がなくても縦動画にするようにしています。

↓ ちょうどここ

```kotlin
// 画面回転情報
// Androidの縦動画はどうやら回転させているらしいので、回転を戻す
// TODO KEY_ROTATION が Android 6 以降
val hasRotation = format.getIntegerOrNull(MediaFormat.KEY_ROTATION) == 90
// 画面回転度がある場合は width / height がそれぞれ入れ替わるので注意（一敗）
val originVideoWidth = if (hasRotation) videoHeight else videoWidth
val originVideoHeight = if (hasRotation) videoWidth else videoHeight
```

あとは`MediaCodec`特有の使いにくさが相変わらずあるのですがそれは前に書いた他の記事で...

## MainActivity.kt
本当は長時間のタスクになるので、`フォアグラウンドサービス`でやるべきですが本題じゃないので、、  

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(viewBinding.root)
    // 動画を選択する
    viewBinding.videoSelectButton.setOnClickListener {
        videoPicker.launch("video/mp4")
    }
    // エンコーダーを起動する
    viewBinding.encodeButton.setOnClickListener {
        lifecycleScope.launch {
            viewBinding.encodeStatusTextView.text = "エンコード開始"
            val videoFile = File(workFolder, VIDEO_FILE_NAME)
            val resultFile = File(workFolder, RESULT_VIDEO_FILE_NAME)
            val videoProcessor = VideoProcessor(videoFile, resultFile)
            videoProcessor.encode { currentTimeMs ->
                // TODO この後すぐ
            }
            // TODO 音声の追加
            // TODO MediaStoreへ追加
            viewBinding.encodeStatusTextView.text = "エンコード終了"
        }
    }
}
```

### Canvasでお絵かきタイム
おまたせしました。お絵かきタイムです  
`this`に`Canvas`、`currentTimeMs`は動画の再生位置（ミリ秒）になります。

```
videoProcessor.encode { currentTimeMs ->
    // this は Canvas
    // currentTimeMs は動画の再生位置（ミリ秒）
}
```

例えば動画の再生時間を重ねた（ついでに画像も）場合はこんな感じ

```kotlin
val videoFile = File(workFolder, VIDEO_FILE_NAME)
val resultFile = File(workFolder, RESULT_VIDEO_FILE_NAME)
val videoWidth = 1280
val videoHeight = 720
val videoProcessor = VideoProcessor(
    videoFile = videoFile,
    resultFile = resultFile,
    outputVideoWidth = videoWidth,
    outputVideoHeight = videoHeight
)
val textPaint = Paint().apply {
    textSize = 80f
}
val logoBitmap = ContextCompat.getDrawable(this@MainActivity, R.drawable.ic_launcher_foreground)?.apply {
    setTint(Color.WHITE)
}?.toBitmap(300, 300)!!
videoProcessor.encode { currentTimeMs ->
    // this が Canvas
    // 適当に文字を書く
    val text = "動画の時間 = ${"%.2f".format(currentTimeMs / 1000f)}"
    textPaint.color = Color.BLACK
    textPaint.style = Paint.Style.STROKE
    // 枠取り文字
    drawText(text, 700f, 500f, textPaint)
    textPaint.style = Paint.Style.FILL
    textPaint.color = Color.WHITE
    // 枠無し文字
    drawText(text, 700f, 500f, textPaint)
    // 画像も表示する
    drawBitmap(logoBitmap, (videoWidth - logoBitmap.width).toFloat(), (videoWidth - logoBitmap.height).toFloat(), textPaint)
}
```

ついでにここまでの`MainActivity.kt`を置いておきます。

```kotlin
class MainActivity : AppCompatActivity() {

    private val workFolder by lazy { File(getExternalFilesDir(null), "video").apply { mkdir() } }
    private val viewBinding by lazy { ActivityMainBinding.inflate(layoutInflater) }

    /** 動画ピッカー */
    private val videoPicker = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri ?: return@registerForActivityResult
        // コピーする
        lifecycleScope.launch(Dispatchers.IO) {
            val videoFile = File(workFolder, VIDEO_FILE_NAME).apply {
                createNewFile()
            }
            videoFile.outputStream().use { outputStream ->
                contentResolver.openInputStream(uri)?.use { inputStream ->
                    inputStream.copyTo(outputStream)
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(viewBinding.root)

        // 動画を選択する
        viewBinding.videoSelectButton.setOnClickListener {
            videoPicker.launch("video/mp4")
        }

        // エンコーダーを起動する
        viewBinding.encodeButton.setOnClickListener {
            lifecycleScope.launch {

                viewBinding.encodeStatusTextView.text = "エンコード開始"

                val videoFile = File(workFolder, VIDEO_FILE_NAME)
                val resultFile = File(workFolder, RESULT_VIDEO_FILE_NAME)
                val videoWidth = 1280
                val videoHeight = 720
                val videoProcessor = VideoProcessor(
                    videoFile = videoFile,
                    resultFile = resultFile,
                    outputVideoWidth = videoWidth,
                    outputVideoHeight = videoHeight
                )

                val textPaint = Paint().apply {
                    textSize = 100f
                }
                val logoBitmap = ContextCompat.getDrawable(this@MainActivity, R.drawable.ic_launcher_foreground)?.apply {
                    setTint(Color.WHITE)
                }?.toBitmap(300, 300)!!

                videoProcessor.encode { currentTimeMs ->
                    // 適当に文字を書く
                    val text = "動画の時間 = ${"%.2f".format(currentTimeMs / 1000f)}"

                    textPaint.color = Color.BLACK
                    textPaint.style = Paint.Style.STROKE
                    // 枠取り文字
                    drawText(text, 200f, 300f, textPaint)

                    textPaint.style = Paint.Style.FILL
                    textPaint.color = Color.WHITE
                    // 枠無し文字
                    drawText(text, 200f, 300f, textPaint)

                    // 画像も表示する
                    drawBitmap(logoBitmap, (videoWidth - logoBitmap.width).toFloat(), (videoHeight - logoBitmap.height).toFloat(), textPaint)
                }

                viewBinding.encodeStatusTextView.text = "エンコード終了"

                // TODO 音声の追加
                // TODO MediaStoreへ追加
            }
        }

    }

    companion object {
        /** かさねる動画のファイル名 */
        private const val VIDEO_FILE_NAME = "origin_video_file.mp4"

        /** エンコードした動画ファイル名 */
        private const val RESULT_VIDEO_FILE_NAME = "result.mp4"
    }

}
```

# 動かしてみる

動画を選んだあとに、エンコードボタンを押します。  
しばらく待ちます、終了しましたと表示されたら終わりです。  

で、、、動画のパスなんですが、  
`/storage/emulated/0/Android/data/アプリケーションID/files/video/result.mp4`  
です。端末の動画フォルダに保存する処理はまだ書いてないのでこうなります  
`アプリケーションID`は`build.gradle`の`applicationId`の部分の値です。  

```gradle
    defaultConfig {
        applicationId "こ↑こ↓"
        minSdk 21
        targetSdk 33
        versionCode 1
        versionName "1.0"
        // 省略
```

どうでしょう、動画の上にCanvasで落書きした画像が重なってエンコードされていますでしょうか？  

![Imgur](https://imgur.com/efE7zna.png)

しかし音声がなくなってしまいました。  
この修正を次やります。

# 音声を追加する
さっきよりは難しくない。`Kotlin`で完結する上、`mp4`->`mp4`の場合はそのまま取り出して入れ直すだけなので`MediaCodec`すら出てきません。  
（`mp4`->`WebM`の場合は`AAC`を`Opus`にするためエンコードする必要がありますが、、、（`MediaCodec`利用））

## MixingTool.kt
名前はお任せします。  
`Util`クラス、スペルが`Tool`のほうが簡単だから`Tool`にしてるんだけどどうなんだろう（超どうでもいい）

```kotlin
/** エンコードされた動画には音声がないので、音声を追加するためのクラス */
object MixingTool {

    /**
     * [videoFile]に[audioFile]の音声を追加して、[resultFile]として生成する
     */
    @SuppressLint("WrongConstant")
    suspend fun addAudioTrack(
        videoFile: File,
        audioFile: File,
        resultFile: File
    ) = withContext(Dispatchers.Default) {
        // audioFile から音声トラックを取得
        val (audioMediaExtractor, audioFormat) = MediaExtractor().let { mediaExtractor ->
            mediaExtractor.setDataSource(audioFile.path)
            val (index, format) = (0 until mediaExtractor.trackCount)
                .map { index -> index to mediaExtractor.getTrackFormat(index) }
                .first { (_, format) -> format.getString(MediaFormat.KEY_MIME)?.startsWith("audio/") == true }
            mediaExtractor.selectTrack(index)
            mediaExtractor to format
        }
        // videoFile から映像トラックを取得
        val (videoMediaExtractor, videoFormat) = MediaExtractor().let { mediaExtractor ->
            mediaExtractor.setDataSource(videoFile.path)
            val (index, format) = (0 until mediaExtractor.trackCount)
                .map { index -> index to mediaExtractor.getTrackFormat(index) }
                .first { (_, format) -> format.getString(MediaFormat.KEY_MIME)?.startsWith("video/") == true }
            mediaExtractor.selectTrack(index)
            mediaExtractor to format
        }

        // 新しくコンテナファイルを作って保存する
        // 音声と映像を追加
        val mediaMuxer = MediaMuxer(resultFile.path, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
        val audioTrackIndex = mediaMuxer.addTrack(audioFormat)
        val videoTrackIndex = mediaMuxer.addTrack(videoFormat)
        // MediaMuxerスタート。スタート後は addTrack が呼べない
        mediaMuxer.start()

        // 音声をコンテナに追加する
        audioMediaExtractor.apply {
            val byteBuffer = ByteBuffer.allocate(1024 * 4096)
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
            val byteBuffer = ByteBuffer.allocate(1024 * 4096)
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

## MainActivity.kt
音声を追加した動画ファイルを最終的なファイルとするため、ちょっと直します。  
定数が増えているのが分かる通り、ファイルが三種類になりました（`元動画`、`Canvasと重ねた動画`、`Canvasと重ねた動画に音声を追加した動画`）

```kotlin
lifecycleScope.launch {
    viewBinding.encodeStatusTextView.text = "エンコード開始"

    // まずは Canvas と映像を重ねる
    val videoFile = File(workFolder, VIDEO_FILE_NAME)
    val canvasOverlayVideoFile = File(workFolder, VIDEO_CANVAS_OVERLAY_FILE_NAME)
    val videoWidth = 1280
    val videoHeight = 720
    val videoProcessor = VideoProcessor(
        videoFile = videoFile,
        resultFile = canvasOverlayVideoFile,
        outputVideoWidth = videoWidth,
        outputVideoHeight = videoHeight
    )
    val textPaint = Paint().apply {
        textSize = 100f
    }
    val logoBitmap = ContextCompat.getDrawable(this@MainActivity, R.drawable.ic_launcher_foreground)?.apply {
        setTint(Color.WHITE)
    }?.toBitmap(300, 300)!!
    videoProcessor.encode { currentTimeMs ->
        // 適当に文字を書く
        val text = "動画の時間 = ${"%.2f".format(currentTimeMs / 1000f)}"
        textPaint.color = Color.BLACK
        textPaint.style = Paint.Style.STROKE
        // 枠取り文字
        drawText(text, 200f, 300f, textPaint)
        textPaint.style = Paint.Style.FILL
        textPaint.color = Color.WHITE
        // 枠無し文字
        drawText(text, 200f, 300f, textPaint)
        // 画像も表示する
        drawBitmap(logoBitmap, (videoWidth - logoBitmap.width).toFloat(), (videoHeight - logoBitmap.height).toFloat(), textPaint)
    }

    // 音声がないので元のファイルから音声だけもらってくる
    // 音声を追加したファイルが最終的なファイルになる
    val resultFile = File(workFolder, RESULT_VIDEO_FILE_NAME)
    MixingTool.addAudioTrack(
        videoFile = canvasOverlayVideoFile,
        audioFile = videoFile,
        resultFile = resultFile
    )

    viewBinding.encodeStatusTextView.text = "エンコード終了"
}

// 省略...

companion object {
    /** かさねる動画のファイル名 */
    private const val VIDEO_FILE_NAME = "origin_video_file.mp4"

    /** Canvasと重ねた動画のファイル名 */
    private const val VIDEO_CANVAS_OVERLAY_FILE_NAME = "temp_canvas_overlay.mp4"

    /** エンコードした動画ファイル名 */
    private const val RESULT_VIDEO_FILE_NAME = "result.mp4"
}
```

これで音声が追加されているはずです！いかがでしょう！
`VLC`で見るとオーディオについての項目が増えています！

![Imgur](https://imgur.com/SqzaqGd.png)

# MediaStoreを利用して、端末の動画フォルダに保存する
これで`Google フォト`アプリや他のギャラリーに見つけてもらうことができます。  
が、結構面倒くさいのでコピペしましょう。

## MediaStoreTool
`Android`の`MediaStore`とかいう仕組み、使いにくいというか、、なんかなあ、、、  
`MediaMuxer`や`MediaExtractor`とかが`MediaStore や Storage Access Framework`で取得できる`Uri (File#path のようなものだけど違う)`に対応してないから、  
結局`File`が使える`getExternalFilesDir`とかに転送しないといけないのがなあ、、  
`Android 10 の Scoped Storage`、やっぱ影響範囲めっちゃでかいよなあ

```kotlin
/** 端末の動画フォルダに保存する */
object MediaStoreTool {

    /** [videoFile]を MediaStore に登録して、ギャラリーから参照できるようにする */
    suspend fun addVideo(
        context: Context,
        videoFile: File
    ) = withContext(Dispatchers.IO) {
        val contentResolver = context.contentResolver
        val contentValues = contentValuesOf(
            MediaStore.MediaColumns.DISPLAY_NAME to videoFile.name,
            // RELATIVE_PATH（ディレクトリを掘る） は Android 10 以降のみです
            MediaStore.MediaColumns.RELATIVE_PATH to "${Environment.DIRECTORY_MOVIES}/AndroidMediaCodecAddCanvasTextToVideo"
        )
        val uri = contentResolver.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, contentValues) ?: return@withContext
        // コピーする
        contentResolver.openOutputStream(uri)?.use { outputStream ->
            videoFile.inputStream().use { inputStream ->
                inputStream.copyTo(outputStream)
            }
        }
    }

}
```

## MainActivity.kt
あとは`MixingTool`のあとに書き足すだけ。終わり

```kotlin
// 音声がないので元のファイルから音声だけもらってくる
// 音声を追加したファイルが最終的なファイルになる
val resultFile = File(workFolder, RESULT_VIDEO_FILE_NAME)
MixingTool.addAudioTrack(
    videoFile = canvasOverlayVideoFile,
    audioFile = videoFile,
    resultFile = resultFile
)

// 端末の動画フォルダへ転送する
MediaStoreTool.addVideo(this@MainActivity, resultFile)
// 転送したら要らなくなるので削除
resultFile.delete()
canvasOverlayVideoFile.delete()
// videoFile.delete() // 毎回消すなら

viewBinding.encodeStatusTextView.text = "エンコード終了"
```

これで `Google フォト` アプリの`デバイス内の写真`に表示されているはずです、どうでしょう？

![Imgur](https://imgur.com/nCzp0hz.png)

# 以上です。
ソースコードです。  

https://github.com/takusan23/AndroidMediaCodecAddCanvasTextToVideo

最終的な MainActivity.kt です

https://github.com/takusan23/AndroidMediaCodecAddCanvasTextToVideo/blob/master/app/src/main/java/io/github/takusan23/androidmediacodecaddcanvastexttovideo/MainActivity.kt


# おわりに
この更新から`Next.js`の`scrollRestoration`を`true`にしてます。  
`experimental`なので使うか迷ってたんですけど特に影響なさそうなので有効にしました。

# おわりに 2
`WebKit`だと`JavaScript`の`Date.parse()`が`YYYY-MM-DD`をパースできなくて、何日前に投稿したかどうかの部分が `NaN` になっていました。  
`Apple`デバイス持っていないので知りませんでした、、、そのうち直します