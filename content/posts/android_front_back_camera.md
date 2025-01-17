---
title: Android で前面と背面を同時に撮影できるカメラを作りたい
created_at: 2023-03-12
tags:
- Android
- Kotlin
- OpenGL
- Camera2API
---

# 追記 2024/07/18
令和最新版を書きました→ https://takusan.negitoro.dev/posts/android_front_back_camera_2024/  
そこそこマシなコードと動作を目指しました。

どうもこんばんわ  
新社会人へ、新人らしくないとか言われたので新人らしくしましょうね。（声をワントーン上げるとか）  
同期は大事にしよう。転職してしまいましたがいつの間にか同期はいなくなってました、、、  

あとzipファイルを解凍と言われたら展開のことです。
# ほんだい
前面カメラと背面カメラを同時に開いて、ワイプカメラ？マルチカメラ？出来るアプリを作ってみようと思います。  
すでにありそうだけど、、、

![Imgur](https://i.imgur.com/PACr0Zx.png)

![Imgur](https://i.imgur.com/2mjyEvn.png)

# かんきょう

| なまえ        | あたい                                                                                      |
|---------------|---------------------------------------------------------------------------------------------|
| 言語          | Kotlin と OpenGL を使うため GLSL                                                            |
| 端末          | Pixel 6 Pro / Xperia Pro-I (プリインストール時点で Android 11 以上を搭載した端末が必要多分) |
| minSdkVersion | 30                                                                                          |

`Jetpack Compose`をUI構築に使いますが、`SurfaceView`を主に使うことになるので別に`View`でもいいです。  
あと Kotlin Coroutine も使います。便利

## minSdk
同時にカメラをオープンする機能が、SDK バージョン 30（Android 11）からです。  
ただ、Androidのアップデートをすればよいわけではなく、おそらくハードウェアレベルで同時にカメラを開く機能が実装されている必要があると思うので、  
**Android 11以降がプリインストールされている端末でないとダメだと思います。**  
以下の関数で同時に開くことが出来るカメラ（カメラID）の組み合わせが取得できます。返ってこない場合は対応していません！

https://developer.android.com/reference/android/hardware/camera2/CameraManager#getConcurrentCameraIds()

それ以外は特に記述されていないので？多分`Camera2 API`で前面背面カメラを普通に開けばいいんじゃないかなと思っています。

[https://dic.nicovideo.jp/a/windows 8#h2-4](https://dic.nicovideo.jp/a/windows%208#h2-4)

## しくみ
今回は録画機能をつけたいため、`SurfaceView` を2つ利用して前面と背面を表示するのではなく、一つの `SurfaceView` に前面と背面のカメラ映像を合成した状態で表示させようと思います。  
その、カメラ映像を合成するために `OpenGL` を利用します。カメラ映像は `SurfaceTexture` を使うことで、フラグメントシェーダーからテクスチャ（画像）として利用できます。  
`SurfaceTexture`のコールバックに新しいフレームが来たことを通知してくれるので、来たら`glDrawArrays`して描画します。

![Imgur](https://i.imgur.com/s0Qtjhx.png)

今回もOpenGL周りはAOSPのコードをパクって来ようと思います、、、（Apache License 2.0）  
また、今回も CameraX は使わずに Camera2 API をそのまま叩こうと思います、CameraX API めちゃモダンなAPIで気になるけど、SurfaceTexture + OpenGL みたいなことって出来るのかな、、、。

流石にやりませんが、静止画撮影だけなら、`SurfaceView`を2つ使ってAndroidの`PixelCopy`を使う手もあると思いますが、、、  
~~Bitmap重ねるよりはマシ~~

## つくる
Target SDK 30 以上で作ります  
割と初めて真面目にカメラアプリを作るかもしれない、、、

![Imgur](https://i.imgur.com/BsCga8R.png)

# AndroidManifest.xml
カメラ権限と録画で使うマイク権限を

```xml
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
```

# カメラ編
`Camera2 API`なので長々しいコードが続きます、、、

## 前面、背面カメラを管理するクラス
今回は、前面と背面カメラ、それぞれこのクラスのインスタンスを作ることにします。  
クラスの名前どうにかしろよ、、、

```kotlin
/**
 * カメラを開けたり閉じたりする処理を隠蔽するクラス
 * 
 * @param context [Context]
 * @param cameraId カメラID、前面 or 背面
 * @param previewSurface プレビューSurface
 */
class CameraControl(
    private val context: Context,
    private val cameraId: String,
    private val previewSurface: Surface,
) {
    private val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    private val cameraExecutor = Executors.newSingleThreadExecutor()
    private var cameraDevice: CameraDevice? = null

    /** カメラを開く */
    suspend fun openCamera() {
        cameraDevice = waitOpenCamera()
    }

    /** プレビューを出す */
    fun startPreview() {
        val cameraDevice = cameraDevice ?: return
        val captureRequest = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW).apply {
            addTarget(previewSurface)
        }.build()
        val outputList = buildList {
            add(OutputConfiguration(previewSurface))
        }
        SessionConfiguration(SessionConfiguration.SESSION_REGULAR, outputList, cameraExecutor, object : CameraCaptureSession.StateCallback() {
            override fun onConfigured(captureSession: CameraCaptureSession) {
                captureSession.setRepeatingRequest(captureRequest, null, null)
            }

            override fun onConfigureFailed(p0: CameraCaptureSession) {
                // do nothing
            }
        }).apply { cameraDevice.createCaptureSession(this) }
    }

    /** 終了時に呼び出す */
    fun destroy() {
        cameraDevice?.close()
    }

    /** [cameraId]のカメラを開く */
    @SuppressLint("MissingPermission")
    suspend private fun waitOpenCamera() = suspendCoroutine {
        cameraManager.openCamera(cameraId, cameraExecutor, object : CameraDevice.StateCallback() {
            override fun onOpened(camera: CameraDevice) {
                it.resume(camera)
            }

            override fun onDisconnected(camera: CameraDevice) {
                // do nothing
            }

            override fun onError(camera: CameraDevice, error: Int) {
                // do nothing
            }
        })
    }

}
```
カメラIDに対応したカメラを開いて、Surfaceに映像を出力するように設定して、ライフサイクルが `onDestroy` になったら終了するようになっています。

## カメラIDを取得する関数
`cameraIdList`でカメラが取得できるので、`CameraCharacteristics.LENS_FACING`で 前面 or 背面 どっちのカメラか取得できます。  
なんか`cameraIdList`、フロントとカメラで2つしか帰ってこないと思ってたんだけど (Pixel 6 Pro) 、なんかいっぱいある端末もある (Xperia Pro-I の場合は 超広角 広角 通常 カメラにもそれぞれ カメラID が割り当てられてる？)

```kotlin
object CameraTool {

    /** 前面、背面 カメラのIDを返す */
    fun getCameraId(context: Context): Pair<String, String> {
        val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
        val backCameraId = cameraManager.cameraIdList.first { cameraManager.getCameraCharacteristics(it).get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_BACK }
        val frontCameraId = cameraManager.cameraIdList.first { cameraManager.getCameraCharacteristics(it).get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_FRONT }
        return backCameraId to frontCameraId
    }

}
```

# OpenGL 編
参考にした AOSP のコード置いておきます。thx  
https://cs.android.com/android/platform/superproject/+/master:cts/tests/tests/media/common/src/android/media/cts/InputSurface.java;l=1

## GLSurface
`GLSurfaceView` を利用すると、いきなりシェーダー書くところから始めることができます。しかも、今回`GLSurfaceView`を利用しても問題ないはずです。  
でもなんで今回は使ってないかというと、今回は録画機能をつけるためです。静止画撮影なら`GLSurfaceView`で出来るはずです。（`glReadPixels`使うなら）  

`GLSurfaceView`を録画できる便利な機能なんて無いため、`MediaRecorder`で録画する必要があります。  
しかし、`MediaRecorder`の入力には`GLSurfaceView (SurfaceView)`ではなく、`Surface`しか受け付けません。  
なので、入力用`Surface`に`OpenGL`のレンダリング結果を出力するようにする必要があるのですが、それには`OpenGL`の出力を`Surface`にするための処理を1から書く必要があります。  
`SurfaceView`と`OpenGL`をまとめたものが`GLSurfaceView`なのですが、今回ほしいのは`Surface`と`OpenGL`をまとめたものなのです。でも`GLSurface`クラスなんて無いので作ります、、、  

`Surface`が取れればいいので、`SurfaceView`でももちろん使えます。

以下がコードです。おそらく`GLSurfaceView`内部でやってることをやってるだけだと思います。

```kotlin
// 参考にした AOSP のコード : https://cs.android.com/android/platform/superproject/+/master:cts/tests/tests/media/common/src/android/media/cts/InputSurface.java

/**
 * [Surface]とOpenGLを連携させるためのクラス
 * 本来 [android.opengl.GLSurfaceView] を利用することで EGL のセットアップを省略することができますが、
 * 今回は [android.view.SurfaceView] ではなく [Surface] だけで OpenGL を利用したいため、EGLのセットアップから記述している。
 */
class GLSurface(
    private val surface: Surface,
    private val renderer: CameraGLRenderer
) {
    private var mEGLDisplay = EGL14.EGL_NO_DISPLAY
    private var mEGLContext = EGL14.EGL_NO_CONTEXT
    private var mEGLSurface = EGL14.EGL_NO_SURFACE

    init {
        eglSetup()
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

    /** 描画する */
    fun drawFrame() {
        renderer.onDrawFrame()
    }

    /**
     * Discards all resources held by this class, notably the EGL context.
     */
    fun release() {
        if (mEGLDisplay != EGL14.EGL_NO_DISPLAY) {
            EGL14.eglMakeCurrent(mEGLDisplay, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_CONTEXT)
            EGL14.eglDestroySurface(mEGLDisplay, mEGLSurface)
            EGL14.eglDestroyContext(mEGLDisplay, mEGLContext)
            EGL14.eglReleaseThread()
            EGL14.eglTerminate(mEGLDisplay)
        }
        // surface.release() // GLは破棄しない
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

## CameraGLRenderer
カメラ映像をレンダリングする処理を書きます。  
バーテックスシェーダ、フラグメントシェーダもここに書きます（別に .glsl にしてもいいですが）。

```kotlin
/**
 * カメラ映像をレンダリングする
 * フロント、バックではなく、メイン、サブにしている。後で切り替え機能を作るため
 *
 * @param rotation 映像を回転する
 * @param mainSurfaceTexture メイン映像
 * @param subSurfaceTexture サブ映像。ワイプカメラ
 */
class CameraGLRenderer(
    private val rotation: Float,
    private val mainSurfaceTexture: () -> SurfaceTexture,
    private val subSurfaceTexture: () -> SurfaceTexture,
) {

    private val mMVPMatrix = FloatArray(16)
    private val mSTMatrix = FloatArray(16)
    private val mTriangleVertices = ByteBuffer.allocateDirect(mTriangleVerticesData.size * FLOAT_SIZE_BYTES).run {
        order(ByteOrder.nativeOrder())
        asFloatBuffer().apply {
            put(mTriangleVerticesData)
            position(0)
        }
    }

    // ハンドルたち
    private var mProgram = 0
    private var muMVPMatrixHandle = 0
    private var muSTMatrixHandle = 0
    private var maPositionHandle = 0
    private var maTextureHandle = 0

    // テクスチャID
    // SurfaceTexture に渡す
    private var mainCameraTextureId = 0
    private var subCameraTextureId = 0

    // テクスチャのハンドル
    private var uMainCameraTextureHandle = 0
    private var uSubCameraTextureHandle = 0
    private var uDrawMainCameraHandle = 0

    /** 描画する */
    fun onDrawFrame() {
        prepareDraw()
        drawMainCamera(mainSurfaceTexture())
        drawSubCamera(subSurfaceTexture())
        GLES20.glFinish()
    }

    /**
     * シェーダーの用意をする。
     * テクスチャIDを返すので、SurfaceTexture のコンストラクタ入れてね。
     *
     * @return メイン映像、サブ映像のテクスチャID。SurfaceTexture のコンストラクタ に入れる。
     */
    fun setupProgram(): Pair<Int, Int> {
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
        uMainCameraTextureHandle = GLES20.glGetUniformLocation(mProgram, "uMainCameraTexture")
        checkGlError("glGetUniformLocation uMainCameraTextureHandle")
        if (uMainCameraTextureHandle == -1) {
            throw RuntimeException("Could not get attrib location for uMainCameraTextureHandle")
        }
        uSubCameraTextureHandle = GLES20.glGetUniformLocation(mProgram, "uSubCameraTexture")
        checkGlError("glGetUniformLocation uSubCameraTexture")
        if (uSubCameraTextureHandle == -1) {
            throw RuntimeException("Could not get attrib location for uSubCameraTexture")
        }
        uDrawMainCameraHandle = GLES20.glGetUniformLocation(mProgram, "uDrawMainCamera")
        checkGlError("glGetUniformLocation uDrawMainCameraHandle")
        if (uDrawMainCameraHandle == -1) {
            throw RuntimeException("Could not get attrib location for uDrawMainCameraHandle")
        }

        // カメラ2つなので、2つ分のテクスチャを作成
        val textures = IntArray(2)
        GLES20.glGenTextures(2, textures, 0)

        // メイン映像
        mainCameraTextureId = textures[0]
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, mainCameraTextureId)
        checkGlError("glBindTexture mainCameraTextureId")

        // 縮小拡大時の補間設定
        GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_NEAREST.toFloat())
        GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR.toFloat())
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE)
        checkGlError("glTexParameteri mainCameraTexture")

        // サブ映像
        subCameraTextureId = textures[1]
        GLES20.glActiveTexture(GLES20.GL_TEXTURE1)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, subCameraTextureId)
        checkGlError("glBindTexture subCameraTextureId")

        // 縮小拡大時の補間設定
        GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_NEAREST.toFloat())
        GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR.toFloat())
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE)
        checkGlError("glTexParameteri subCameraTexture")

        // アルファブレンドを有効
        // これにより、透明なテクスチャがちゃんと透明に描画される
        GLES20.glEnable(GLES20.GL_BLEND)
        GLES20.glBlendFunc(GLES20.GL_SRC_ALPHA, GLES20.GL_ONE_MINUS_SRC_ALPHA)
        checkGlError("glEnable BLEND")

        return subCameraTextureId to mainCameraTextureId
    }

    /** 描画前に呼び出す */
    private fun prepareDraw() {
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

    /** メイン映像の [SurfaceTexture] を描画する */
    private fun drawMainCamera(surfaceTexture: SurfaceTexture) {
        // テクスチャ更新。呼ばないと真っ黒
        surfaceTexture.updateTexImage()
        checkGlError("drawMainCamera start")
        surfaceTexture.getTransformMatrix(mSTMatrix)
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, subCameraTextureId)
        // メイン映像のテクスチャIDは GLES20.GL_TEXTURE0 なので 0
        GLES20.glUniform1i(uMainCameraTextureHandle, 0)
        // サブ映像のテクスチャIDは GLES20.GL_TEXTURE1 なので 1
        GLES20.glUniform1i(uSubCameraTextureHandle, 1)
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
        // メイン映像を描画するフラグを立てる
        // ----
        GLES20.glUniform1i(uDrawMainCameraHandle, 1)
        // Matrix.XXX のユーティリティー関数で行列の操作をする場合、適用させる順番に注意する必要があります
        Matrix.setIdentityM(mMVPMatrix, 0)
        // 画面回転している場合は回転する
        Matrix.rotateM(mMVPMatrix, 0, rotation, 0f, 0f, 1f)

        // 描画する
        GLES20.glUniformMatrix4fv(muSTMatrixHandle, 1, false, mSTMatrix, 0)
        GLES20.glUniformMatrix4fv(muMVPMatrixHandle, 1, false, mMVPMatrix, 0)
        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
        checkGlError("glDrawArrays drawMainCamera")
    }

    /** サブ映像の [SurfaceTexture] を描画する */
    private fun drawSubCamera(surfaceTexture: SurfaceTexture) {
        // テクスチャ更新。呼ばないと真っ黒
        surfaceTexture.updateTexImage()
        checkGlError("drawSubCamera start")
        surfaceTexture.getTransformMatrix(mSTMatrix)
        GLES20.glActiveTexture(GLES20.GL_TEXTURE1)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, mainCameraTextureId)
        // メイン映像のテクスチャIDは GLES20.GL_TEXTURE0 なので 0
        GLES20.glUniform1i(uMainCameraTextureHandle, 0)
        // サブ映像のテクスチャIDは GLES20.GL_TEXTURE1 なので 1
        GLES20.glUniform1i(uSubCameraTextureHandle, 1)
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
        // メイン映像を描画するフラグを下ろしてサブ映像を描画する
        // ----
        GLES20.glUniform1i(uDrawMainCameraHandle, 0)
        // Matrix.XXX のユーティリティー関数で行列の操作をする場合、適用させる順番に注意する必要があります
        Matrix.setIdentityM(mMVPMatrix, 0)
        // 右上に移動させる
        Matrix.translateM(mMVPMatrix, 0, 1f - 0.3f, 1f - 0.3f, 1f)
        // 半分ぐらいにする
        Matrix.scaleM(mMVPMatrix, 0, 0.3f, 0.3f, 1f)
        // 画面回転している場合は回転する
        Matrix.rotateM(mMVPMatrix, 0, rotation, 0f, 0f, 1f)

        // 描画する
        GLES20.glUniformMatrix4fv(muSTMatrixHandle, 1, false, mSTMatrix, 0)
        GLES20.glUniformMatrix4fv(muMVPMatrixHandle, 1, false, mMVPMatrix, 0)
        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
        checkGlError("glDrawArrays drawSubCamera")
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

        /** バーテックスシェーダー。位置を決める */
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

        /** フラグメントシェーダー。色を決める */
        private const val FRAGMENT_SHADER = """
            #extension GL_OES_EGL_image_external : require
            precision mediump float;
            varying vec2 vTextureCoord;
            uniform samplerExternalOES uMainCameraTexture;        
            uniform samplerExternalOES uSubCameraTexture;        
            
            // メイン映像を描画する場合は 1
            uniform int uDrawMainCamera;
        
            void main() {
                vec4 mainCameraTexture = texture2D(uMainCameraTexture, vTextureCoord);
                vec4 subCameraTexture = texture2D(uSubCameraTexture, vTextureCoord);
                
                if (bool(uDrawMainCamera)) {
                    gl_FragColor = mainCameraTexture;                
                } else {
                    gl_FragColor = subCameraTexture;
                }
            }
        """
    }

}
```

詳しくは`MainActivity`に書くときに、、

# MainActivity.kt

## 権限を求める
特に記述することはなく...

```
class MainActivity : ComponentActivity() {

    private val isPermissionGranted: Boolean
        get() = ContextCompat.checkSelfPermission(this, android.Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
                && ContextCompat.checkSelfPermission(this, android.Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED

    private val surfaceView by lazy { SurfaceView(this) }

    private val permissionRequest = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
        if (it.all { it.value }) {
            // onResume で代替
            // setup()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(surfaceView)
    }

    private fun setup() {

    }

}
```

## SurfaceView の準備を待つ関数
`MainActivity`に`SurfaceView`の用意が終わるまで待つ関数を書きます。

```
/** Surface の用意が終わるまで一時停止する */
private suspend fun waitSurface() = suspendCoroutine { continuation ->
    surfaceView.holder.apply {
        if (surface.isValid) {
            continuation.resume(this)
        } else {
            addCallback(object : SurfaceHolder.Callback {
                override fun surfaceCreated(holder: SurfaceHolder) {
                    continuation.resume(holder)
                }
                override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
                    // do nothing
                }
                override fun surfaceDestroyed(holder: SurfaceHolder) {
                    // do nothing
                }
            })
        }
    }
}
```

## カメラを開いてプレビューする

```kotlin
class MainActivity : ComponentActivity(), SurfaceTexture.OnFrameAvailableListener {

    /** 生成した [GLSurface] */
    private val glSurfaceList = arrayListOf<GLSurface>()

    /** 利用中の [CameraControl] */
    private val cameraControlList = arrayListOf<CameraControl>()

    /** プレビュー用に生成した [SurfaceTexture] */
    private val previewSurfaceTexture = arrayListOf<SurfaceTexture>()

    /** onFrameAvailable が呼ばれたら +1 していく */
    private var unUsedFrameCount = 0L

    /** updateTexImage を呼んだら +1 していく */
    private var usedFrameCount = 0L

    /** カメラ用コルーチンJob */
    private var cameraJob: Job? = null

    // 省略...

    override fun onFrameAvailable(surfaceTexture: SurfaceTexture?) {
        // 更新を通知するため、値を更新する
        latestUpdateCount++
    }

    override fun onResume() {
        super.onResume()
        if (isPermissionGranted) {
            setup()
        }
    }

    override fun onPause() {
        super.onPause()
        // リソース開放
        cameraJob?.cancel()
        previewSurfaceTexture.forEach {
            it.setOnFrameAvailableListener(null)
            it.release()
        }
        glSurfaceList.clear()
        previewSurfaceTexture.forEach { it.release() }
        previewSurfaceTexture.clear()
        cameraControlList.forEach { it.destroy() }
        cameraControlList.clear()
    }

    private fun setup() {
        cameraJob = lifecycleScope.launch(Dispatchers.IO) {
            // SurfaceView を待つ
            val previewSurface = waitSurface()

            // CameraRenderer を作る
            val cameraGLRenderer = CameraGLRenderer(
                rotation = if (resources.configuration.orientation == Configuration.ORIENTATION_LANDSCAPE) 90f else 0f, // 画面回転
                mainSurfaceTexture = { previewSurfaceTexture[0] },
                subSurfaceTexture = { previewSurfaceTexture[1] }
            )
            // GLSurface を作る
            val glSurface = GLSurface(
                surface = previewSurface,
                renderer = cameraGLRenderer,
            )
            glSurface.makeCurrent()
            glSurfaceList += glSurface

            // プレビューで利用する SurfaceTexture を用意
            // SurfaceTexture の場合は setDefaultBufferSize で解像度の設定ができる
            val previewSurfaceTexturePair = cameraGLRenderer.setupProgram().let { (mainCameraTextureId, subCameraTextureId) ->
                // メイン映像
                val main = SurfaceTexture(mainCameraTextureId).apply {
                    setDefaultBufferSize(CAMERA_RESOLTION_WIDTH, CAMERA_RESOLTION_HEIGHT)
                    setOnFrameAvailableListener(this@MainActivity)
                }
                // サブ映像
                val sub = SurfaceTexture(subCameraTextureId).apply {
                    setDefaultBufferSize(CAMERA_RESOLTION_WIDTH, CAMERA_RESOLTION_HEIGHT)
                    setOnFrameAvailableListener(this@MainActivity)
                }
                main to sub
            }
            previewSurfaceTexture.addAll(previewSurfaceTexturePair.toList())

            // どっちのカメラをメイン映像にするか
            // 今回はメイン映像をバックカメラ、サブ映像（ワイプ）をフロントカメラに指定
            val previewMainSurfaceTexture = previewSurfaceTexturePair.first
            val previewSubSurfaceTexture = previewSurfaceTexturePair.second
            // カメラを開く
            val (backCameraId, frontCameraId) = CameraTool.getCameraId(this@MainActivity)
            cameraControlList += CameraControl(this@MainActivity, backCameraId, Surface(previewMainSurfaceTexture))
            cameraControlList += CameraControl(this@MainActivity, frontCameraId, Surface(previewSubSurfaceTexture))
            cameraControlList.forEach { it.openCamera() }
            // プレビューする
            cameraControlList.forEach { it.startPreview() }

            // OpenGL のレンダリングを行う
            // isActive でこの cameraJob が終了されるまでループし続ける
            // ここで行う理由ですが、makeCurrent したスレッドでないと glDrawArray できない？ + onFrameAvailable が UIスレッド なので重たいことはできないためです。
            // ただ、レンダリングするタイミングは onFrameAvailable が更新されたタイミングなので、
            // while ループを回して 新しいフレームが来ているか確認しています。
            while (isActive) {
                // OpenGL の描画よりも onFrameAvailable の更新のほうが早い？ため、更新が追いついてしまう
                // そのため、消費したフレームとまだ消費していないフレームを比較するようにした
                // https://stackoverflow.com/questions/14185661
                if (unUsedFrameCount != usedFrameCount) {
                    glSurfaceList.forEach {
                        it.makeCurrent() // 多分いる
                        it.drawFrame()
                        it.swapBuffers()
                    }
                    usedFrameCount += 2 // メイン映像とサブ映像で2つ
                }
            }
        }
    }

    // 省略...

    companion object {

        /** 720P 解像度 幅 */
        private const val CAMERA_RESOLTION_WIDTH = 1280

        /** 720P 解像度 高さ */
        private const val CAMERA_RESOLTION_HEIGHT = 720

    }
```

`SurfaceTexture.OnFrameAvailableListener`を実装します。これで`MainActivity`に新しいカメラの映像フレームが来たことを知ることができます。  
映像が更新されたら、`drawFrame`と`swapBuffers`を呼び出すのですが、`makeCurrent`したスレッドの中で呼び出す必要があるみたいです？？？。  
というわけで、`while`ループ内でどうにか処理しないといけないのですが、単純にフラグを持ってるだけだと描画されなくなります。  
多分これと同じです：https://stackoverflow.com/questions/14185661/

どうやら、`OpenGL`の描画中に`OnFrameAvailableListener`が呼ばれる？（`OnFrameAvailableListener`のほうが早いらしい？）のが原因らしいです。  
直す方法ですが、`OnFrameAvailableListener`の呼ばれた回数をまず変数に持つようにしておきます。つまりまだ消費していないフレーム数ですね。  
そして今度は`SurfaceTexture#updateTexImage`を呼んだ回数をまた変数に持つようにします。つまり消費したフレーム数ですね。  
あとはこれが違う間はずっと描画するようにするととりあえず治っていそうです。  
**が、なんかまぐれで動いてる気もしなくはない、、**

```kotlin
if (unUsedFrameCount != usedFrameCount) {
    glSurfaceList.forEach {
        it.makeCurrent() // 多分いる
        it.drawFrame()
        it.swapBuffers()
    }
    usedFrameCount += 2 // メイン映像とサブ映像で2つ
    println("未利用フレーム = $unUsedFrameCount / 消費フレーム = $usedFrameCount")
}
```

```
未利用フレーム = 6550 / 消費フレーム = 6572
未利用フレーム = 6554 / 消費フレーム = 6574
未利用フレーム = 6558 / 消費フレーム = 6576
未利用フレーム = 6562 / 消費フレーム = 6578
未利用フレーム = 6562 / 消費フレーム = 6580
```

ちなみに`OnFrameAvailableListener`は引数を省略した場合はUIスレッドっぽいです。Handlerが渡せるので別スレッドでも出来るんかな。  
多分`drawFrame`と`swapBuffers`をUIスレッドでやったら重たくなると思う、、、

`CameraGLRenderer`の`rotation`で映像の回転をしています。これで画面回転しても映像が引き伸ばされたりしません！多分。
映像の解像度ですが、`SurfaceTexture`の場合は`SurfaceTexture#setDefaultBufferSize`で指定できます。  

あとはリソース開放ですね、`onResume`でカメラを開き`onPause`で後片付けをします。カメラは他アプリも利用するためちゃんと使ったら後片付けしましょう。

# SurfaceViewが引き伸ばされている
縦画面なら、横幅いっぱいに縦を調整する。横画面なら縦いっぱいにして横を調整する。ようなコードを書けばいいのですが、面倒なので、  
`View`なら`ConstraintLayout`の`layout_constraintDimensionRatio`、`JetpackCompose`なら`Modifier.aspect`があるので使うといいと思います。

```kotlin
setContent {
    Box(modifier = Modifier.fillMaxSize()) {
        AndroidView(
            modifier = Modifier
                .align(Alignment.Center)
                // 16:9 のアスペクト比にする
                .aspectRatio(
                    if (resources.configuration.orientation == Configuration.ORIENTATION_LANDSCAPE) {
                        CAMERA_RESOLTION_WIDTH.toFloat() / CAMERA_RESOLTION_HEIGHT.toFloat()
                    } else {
                        CAMERA_RESOLTION_HEIGHT.toFloat() / CAMERA_RESOLTION_WIDTH.toFloat()
                    }
                ),
            factory = { surfaceView }
        )
    }
}
```

# システムバーを消したい
はい。

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // これ
    WindowCompat.getInsetsController(window, window.decorView).apply {
        hide(WindowInsetsCompat.Type.systemBars())
        systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }
    
    setContent {
        // 省略...
    }
}
```

また、ノッチやパンチホールがある場合は追加で以下を書き足すことで消すことができます。

```kotlin
window.setDecorFitsSystemWindows(false)
window.attributes.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
```

# 撮影機能
とりあえず撮影ボタンを置きます。話はそれから

```kotlin
Box(
    modifier = Modifier
        .background(Color.Black)
        .fillMaxSize()
) {
    AndroidView(
        modifier = Modifier
            .align(Alignment.Center)
            // 16:9 のアスペクト比にする
            .aspectRatio(
                if (resources.configuration.orientation == Configuration.ORIENTATION_LANDSCAPE) {
                    CAMERA_RESOLTION_WIDTH.toFloat() / CAMERA_RESOLTION_HEIGHT.toFloat()
                } else {
                    CAMERA_RESOLTION_HEIGHT.toFloat() / CAMERA_RESOLTION_WIDTH.toFloat()
                }
            ),
        factory = { surfaceView }
    )
    Button(
        modifier = Modifier.align(Alignment.BottomCenter),
        onClick = { /* TODO */ }
    ) { Text(text = "撮影する") }
}
```

## 2つの方法で撮影できる
1つ目が、今描画している `SurfaceView` をキャプチャする方法。  
`OpenGL`に標準装備している`glReadPixels`を使うか、`SurfaceView`を`PixelCopy`で`Bitmap`にしてもいいと思います。  
`PixelCopy`の例はいっぱいあると思うので、`OpenGL`の方で作ってみます。

もう一つは、`ImageReader`を利用する方法。  
これは`Surface`の入力から画像を生成できるやつです。多分こっちを使うのが正攻法な気がします。

### glReadPixels する
`MainActivity`に書きました。

```kotlin
/** glReadPixels する場合は true。処理を受け付けたら false */
private var isCaptureRequest = false

/** SurfaceView のサイズ */
private var size: IntRect? = null

// 省略

override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    WindowCompat.getInsetsController(window, window.decorView).apply {
        hide(WindowInsetsCompat.Type.systemBars())
        systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }
    window.setDecorFitsSystemWindows(false)
    window.attributes.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES

    setContent {
        Box(
            modifier = Modifier
                .background(Color.Black)
                .fillMaxSize()
        ) {
            AndroidView(
                modifier = Modifier
                    .align(Alignment.Center)
                    .onGloballyPositioned {
                        // サイズをとる
                        size = it.size.toIntRect()
                    }
                    // 16:9 のアスペクト比にする
                    .aspectRatio(
                        if (resources.configuration.orientation == Configuration.ORIENTATION_LANDSCAPE) {
                            CAMERA_RESOLTION_WIDTH.toFloat() / CAMERA_RESOLTION_HEIGHT.toFloat()
                        } else {
                            CAMERA_RESOLTION_HEIGHT.toFloat() / CAMERA_RESOLTION_WIDTH.toFloat()
                        }
                    ),
                factory = { surfaceView }
            )
            Button(
                modifier = Modifier.align(Alignment.BottomCenter),
                onClick = {
                    // 撮影フラグを立てる
                    isCaptureRequest = true
                }
            ) { Text(text = "撮影する") }
        }
    }
}

// 省略

private fun setup() {
    cameraJob = lifecycleScope.launch(Dispatchers.IO) {

        // 省略

        while (isActive) {

            // 省略...

            // 撮影リクエストがあった場合
            if (isCaptureRequest) {
                isCaptureRequest = false
                val bitmap = capture(size!!.width, size!!.height)
                insertPhoto("${System.currentTimeMillis()}.jpg", bitmap)
                bitmap.recycle()
            }
        }
    }
}

/** ギャラリーに登録する */
fun insertPhoto(name: String, bitmap: Bitmap) {
    val contentResolver = contentResolver
    val contentValues = contentValuesOf(
        MediaStore.Images.Media.DISPLAY_NAME to name,
        MediaStore.Images.Media.RELATIVE_PATH to "${Environment.DIRECTORY_PICTURES}/ArisaDroid"
    )
    val uri = contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues) ?: return
    contentResolver.openOutputStream(uri).use { outputStream ->
        bitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
    }
}

/** OpenGLの描画内容を Bitmap にする */
fun capture(width: Int, height: Int): Bitmap {
    val pixels = IntArray(width * height)
    val buffer = IntBuffer.wrap(pixels)
    buffer.position(0)
    GLES20.glReadPixels(0, 0, width, height, GLES20.GL_RGBA, GLES20.GL_UNSIGNED_BYTE, buffer)
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    bitmap.copyPixelsFromBuffer(buffer)
    return bitmap
}

// 省略

```

どうしても`makeCurrent`したスレッドでないと呼び出せない関係上、雑な処理になってしまった。  
手軽？にキャプチャ出来る一方、問題点としては解像度ではなく、`SurfaceView`のサイズになってしまう点ですね。あと反転してるし回転もしているのでめんどい！！！  
プログラムもきたねえし。

### もう一つの方法、ImageReader
多分こっちで撮影するのが正解だと思います。  
`ImageReader`を利用すると、`Surface`の出力をキャプチャすることができます。カメラの映像や`MediaCodec`の出力先`Surface`として`ImageReader`を利用すると、画像の`JPEG`とかで取得できるんだと思います。  
なので、今回は`プレビュー用SurfaceView`とは別に`静止画撮影用Surface`を作ることにします。  
絵にするとこんなイメージですね。

![Imgur](https://i.imgur.com/IbiX9B3.png)

#### ImageReader で撮影する

##### CameraControl
`Surface`をプレビューと撮影用で2つ取るようにしました。  
`captureSurface`が引数に増えている点、`startCamera`に`captureSurface`を追加する処理がふえてます。

```kotlin
/**
 * カメラを開けたり閉じたりする処理を隠蔽するクラス
 *
 * @param context [Context]
 * @param cameraId カメラID、前面 or 背面
 * @param previewSurface プレビューSurface
 * @param captureSurface 撮影、録画 用Surface
 */
class CameraControl(
    context: Context,
    private val cameraId: String,
    private val previewSurface: Surface,
    private val captureSurface: Surface
) {
    private val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    private val cameraExecutor = Executors.newSingleThreadExecutor()
    private var cameraDevice: CameraDevice? = null

    /** カメラを開く */
    suspend fun openCamera() {
        cameraDevice = waitOpenCamera()
    }

    /** カメラを開始する */
    fun startCamera() {
        val cameraDevice = cameraDevice ?: return
        val captureRequest = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_STILL_CAPTURE).apply {
            addTarget(previewSurface)
            addTarget(captureSurface)
        }.build()
        val outputList = buildList {
            add(OutputConfiguration(previewSurface))
            add(OutputConfiguration(captureSurface))
        }
        SessionConfiguration(SessionConfiguration.SESSION_REGULAR, outputList, cameraExecutor, object : CameraCaptureSession.StateCallback() {
            override fun onConfigured(captureSession: CameraCaptureSession) {
                captureSession.setRepeatingRequest(captureRequest, null, null)
            }

            override fun onConfigureFailed(p0: CameraCaptureSession) {
                // do nothing
            }
        }).apply { cameraDevice.createCaptureSession(this) }
    }

    /** 終了時に呼び出す */
    fun destroy() {
        cameraDevice?.close()
    }

    /** [cameraId]のカメラを開く */
    @SuppressLint("MissingPermission")
    suspend private fun waitOpenCamera() = suspendCoroutine {
        cameraManager.openCamera(cameraId, cameraExecutor, object : CameraDevice.StateCallback() {
            override fun onOpened(camera: CameraDevice) {
                it.resume(camera)
            }

            override fun onDisconnected(camera: CameraDevice) {
                // do nothing
            }

            override fun onError(camera: CameraDevice, error: Int) {
                // do nothing
            }
        })
    }

}
```

##### MainActivity
`setup`で、プレビュー用のSurface、撮影用のSurfaceの2つ分、セットアップするように修正します。  

```kotlin
class MainActivity : ComponentActivity(), SurfaceTexture.OnFrameAvailableListener {

    // 省略...

    private val isLandscape: Boolean
        get() = resources.configuration.orientation == Configuration.ORIENTATION_LANDSCAPE

    /** 静止画撮影  */
    private var imageReader: ImageReader? = null

    // 省略...

    private fun setup() {
        cameraJob = lifecycleScope.launch(Dispatchers.IO) {
            // SurfaceView を待つ
            val previewSurface = waitSurface()
            // 静止画撮影で利用する ImageReader
            // Surface の入力から画像を生成できる
            val imageReader = ImageReader.newInstance(
                if (isLandscape) CAMERA_RESOLTION_WIDTH else CAMERA_RESOLTION_HEIGHT,
                if (isLandscape) CAMERA_RESOLTION_HEIGHT else CAMERA_RESOLTION_WIDTH,
                PixelFormat.RGBA_8888, // JPEG は OpenGL 使ったせいなのか利用できない
                2
            )
            this@MainActivity.imageReader = imageReader

            // CameraRenderer を作る
            val previewCameraGLRenderer = CameraGLRenderer(
                rotation = if (isLandscape) 90f else 0f, // 画面回転
                mainSurfaceTexture = { previewSurfaceTexture[0] },
                subSurfaceTexture = { previewSurfaceTexture[1] }
            )
            val captureCameraGLRenderer = CameraGLRenderer(
                rotation = if (isLandscape) 90f else 0f, // 画面回転
                mainSurfaceTexture = { previewSurfaceTexture[2] },
                subSurfaceTexture = { previewSurfaceTexture[3] }
            )
            // GLSurface を作る
            val previewGlSurface = GLSurface(
                surface = previewSurface,
                renderer = previewCameraGLRenderer,
            )
            val captureGlSurface = GLSurface(
                surface = imageReader.surface,
                renderer = captureCameraGLRenderer
            )
            glSurfaceList += previewGlSurface
            glSurfaceList += captureGlSurface

            // プレビュー / 静止画撮影 で利用する SurfaceTexture を用意
            // SurfaceTexture の場合は setDefaultBufferSize でカメラの解像度の設定ができる (720P など)
            previewGlSurface.makeCurrent()
            val previewSurfaceTexturePair = previewCameraGLRenderer.setupProgram().let { (mainCameraTextureId, subCameraTextureId) ->
                // メイン映像
                val main = SurfaceTexture(mainCameraTextureId).apply {
                    setDefaultBufferSize(CAMERA_RESOLTION_WIDTH, CAMERA_RESOLTION_HEIGHT)
                    setOnFrameAvailableListener(this@MainActivity)
                }
                // サブ映像
                val sub = SurfaceTexture(subCameraTextureId).apply {
                    setDefaultBufferSize(CAMERA_RESOLTION_WIDTH, CAMERA_RESOLTION_HEIGHT)
                    setOnFrameAvailableListener(this@MainActivity)
                }
                main to sub
            }
            captureGlSurface.makeCurrent()
            val captureSurfaceTexturePair = captureCameraGLRenderer.setupProgram().let { (mainCameraTextureId, subCameraTextureId) ->
                // メイン映像
                val main = SurfaceTexture(mainCameraTextureId).apply {
                    setDefaultBufferSize(CAMERA_RESOLTION_WIDTH, CAMERA_RESOLTION_HEIGHT)
                    setOnFrameAvailableListener(this@MainActivity)
                }
                // サブ映像
                val sub = SurfaceTexture(subCameraTextureId).apply {
                    setDefaultBufferSize(CAMERA_RESOLTION_WIDTH, CAMERA_RESOLTION_HEIGHT)
                    setOnFrameAvailableListener(this@MainActivity)
                }
                main to sub
            }
            previewSurfaceTexture.addAll(previewSurfaceTexturePair.toList())
            previewSurfaceTexture.addAll(captureSurfaceTexturePair.toList())

            // どっちのカメラをメイン映像にするか
            // 今回はメイン映像をバックカメラ、サブ映像（ワイプ）をフロントカメラに指定
            // 以下のリストは メイン/ザブ 映像に指定する SurfaceTexture のリスト
            val mainSurfaceTexture = listOf(previewSurfaceTexturePair.first, captureSurfaceTexturePair.first)
            val subSurfaceTexture = listOf(previewSurfaceTexturePair.second, captureSurfaceTexturePair.second)

            // カメラを開く
            val (backCameraId, frontCameraId) = CameraTool.getCameraId(this@MainActivity)
            cameraControlList += CameraControl(this@MainActivity, backCameraId, Surface(mainSurfaceTexture[0]), Surface(mainSurfaceTexture[1]))
            cameraControlList += CameraControl(this@MainActivity, frontCameraId, Surface(subSurfaceTexture[0]), Surface(subSurfaceTexture[1]))
            cameraControlList.forEach { it.openCamera() }
            // プレビューする
            cameraControlList.forEach { it.startCamera() }

            // OpenGL のレンダリングを行う
            // isActive でこの cameraJob が終了されるまでループし続ける
            // ここで行う理由ですが、makeCurrent したスレッドでないと glDrawArray できない？ + onFrameAvailable が UIスレッド なので重たいことはできないためです。
            // ただ、レンダリングするタイミングは onFrameAvailable が更新されたタイミングなので、
            // while ループを回して 新しいフレームが来ているか確認しています。
            while (isActive) {
                // OpenGL の描画よりも onFrameAvailable の更新のほうが早い？ため、更新が追いついてしまう
                // そのため、消費したフレームとまだ消費していないフレームを比較するようにした
                // https://stackoverflow.com/questions/14185661
                if (unUsedFrameCount != usedFrameCount) {
                    glSurfaceList.forEach {
                        it.makeCurrent() // 多分いる
                        it.drawFrame()
                        it.swapBuffers()
                    }
                    usedFrameCount += 2 // メイン映像とサブ映像で2つ
                }
            }
        }
    }

    /** [imageReader]から取り出して保存する */
    private fun capture() {
        lifecycleScope.launch(Dispatchers.IO) {
            // ImageReader から取り出す
            val image = imageReader?.acquireLatestImage() ?: return@launch
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
            val originWidth = if (isLandscape) CAMERA_RESOLTION_WIDTH else CAMERA_RESOLTION_HEIGHT
            val originHeight = if (isLandscape) CAMERA_RESOLTION_HEIGHT else CAMERA_RESOLTION_WIDTH
            val editBitmap = Bitmap.createBitmap(readBitmap, 0, 0, originWidth, originHeight)
            readBitmap.recycle()
            // ギャラリーに登録する
            val contentResolver = contentResolver
            val contentValues = contentValuesOf(
                MediaStore.Images.Media.DISPLAY_NAME to "${System.currentTimeMillis()}.jpg",
                MediaStore.Images.Media.RELATIVE_PATH to "${Environment.DIRECTORY_PICTURES}/ArisaDroid"
            )
            val uri = contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues) ?: return@launch
            contentResolver.openOutputStream(uri).use { outputStream ->
                editBitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
            }
            editBitmap.recycle()
            image.close()
        }
    }

```

あとは`capture`関数を呼ぶ部分を作り、リソース開放のための呼び出しを追加する。

```kotlin
Button(
    modifier = Modifier
        .padding(bottom = 30.dp)
        .align(Alignment.BottomCenter),
    onClick = { capture() }
) { Text(text = "撮影する") }
```

```kotlin
override fun onPause() {
    super.onPause()
    // リソース開放
    cameraJob?.cancel()
    previewSurfaceTexture.forEach {
        it.setOnFrameAvailableListener(null)
        it.release()
    }
    imageReader?.close()
    previewSurfaceTexture.clear()
    glSurfaceList.forEach { it.release() }
    glSurfaceList.clear()
    cameraControlList.forEach { it.destroy() }
    cameraControlList.clear()
}
```

これで縦でも横でも撮影ができているはずです、、、！どうでしょう？  
`glReadPixels`と違い、撮影の写真サイズを指定できます。（まぁ後述しますが`ImageReader`のせいで`Bitmap`を加工する必要はありますが）（`glReadPixels`でも`Bitmap`を加工すればサイズ変更できますが、、、）  

わなとしては、`ImageReader`から取得した画像に黒帯が何故か追加されるのがあります。  
何故か`newInstance`したときに指定したサイズと、生成した`Bitmap`のサイズが一致していません。（`Bitmap.createBitmap`に渡すサイズは厳守する必要があります。乱れます）  
よく分からんので`Bitmap.createBitmap(加工前Bitmap , left , top , right , bottom )`で要らない部分を削りました。OOMなりそうで怖い  

あとそのまま`JPEG`として取り出す機能が`ImageReader`にあるみたいですが、`OpenGL`とかで加工しているせいか、以下のエラーで利用できませんでした。  
（`rgba override blob format buffer should have height == width`）  
`PixelFormat.RGBA_8888`を使い、`Bitmap.createBitmap`で`Bitmap`にしたあと、`Bitmap#compress`を呼び出すことで`JPEG`画像にできます。

# 録画機能をつける (つまり最終的な MainActivity )
`ImageReader`のように、プレビュー用Surface以外に録画用Surfaceを用意することで利用できます。  
録画用Surfaceは`MediaRecorder`から取得できるやつです。低レベルの`MediaCodec`でも録画できますがわざわざ難しい方使う必要もないと思います。  

![Imgur](https://i.imgur.com/PsDLFGR.png)

いか実装例。`MainActivity`に全部書きました。差分も多いので全部のせます。解説は後で  
静止画撮影と動画撮影はどっちかしか利用できない用になってます（まぁええやろ）。  

```kotlin
class MainActivity : ComponentActivity(), SurfaceTexture.OnFrameAvailableListener {

    private val isPermissionGranted: Boolean
        get() = ContextCompat.checkSelfPermission(this, android.Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
                && ContextCompat.checkSelfPermission(this, android.Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED

    private val isLandscape: Boolean
        get() = resources.configuration.orientation == Configuration.ORIENTATION_LANDSCAPE

    private val surfaceView by lazy { SurfaceView(this) }

    private val permissionRequest = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
        if (it.all { it.value }) {
            // onResume で代替
            // setup()
        }
    }

    /** 生成した [GLSurface] */
    private val glSurfaceList = arrayListOf<GLSurface>()

    /** 利用中の [CameraControl] */
    private val cameraControlList = arrayListOf<CameraControl>()

    /** 生成した [SurfaceTexture] */
    private val previewSurfaceTexture = arrayListOf<SurfaceTexture>()

    /** onFrameAvailable が呼ばれたら +1 していく */
    private var unUsedFrameCount = 0L

    /** updateTexImage を呼んだら +1 していく */
    private var usedFrameCount = 0L

    /** カメラ用スレッド */
    private var cameraJob: Job? = null

    /**
     * 撮影モード
     *
     * 静止画撮影なら[imageReader]、動画撮影なら[mediaRecorder]が使われます
     */
    private var currentCaptureMode = CameraCaptureMode.VIDEO

    /** 静止画撮影  */
    private var imageReader: ImageReader? = null

    /** 録画機能 */
    private var mediaRecorder: MediaRecorder? = null

    /** 録画中か */
    private var isRecording = false

    /** 録画中ファイル */
    private var saveVideoFile: File? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // これ
        WindowCompat.getInsetsController(window, window.decorView).apply {
            hide(WindowInsetsCompat.Type.systemBars())
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
        window.setDecorFitsSystemWindows(false)
        window.attributes.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES

        setContent {
            Box(
                modifier = Modifier
                    .background(Color.Black)
                    .fillMaxSize()
            ) {
                AndroidView(
                    modifier = Modifier
                        .align(Alignment.Center)
                        // 16:9 のアスペクト比にする
                        .aspectRatio(
                            if (resources.configuration.orientation == Configuration.ORIENTATION_LANDSCAPE) {
                                CAMERA_RESOLTION_WIDTH.toFloat() / CAMERA_RESOLTION_HEIGHT.toFloat()
                            } else {
                                CAMERA_RESOLTION_HEIGHT.toFloat() / CAMERA_RESOLTION_WIDTH.toFloat()
                            }
                        ),
                    factory = { surfaceView }
                )
                Button(
                    modifier = Modifier
                        .padding(bottom = 30.dp)
                        .align(Alignment.BottomCenter),
                    onClick = { capture() }
                ) { Text(text = "撮影 録画 する") }
            }
        }
    }

    override fun onFrameAvailable(surfaceTexture: SurfaceTexture?) {
        // 更新を通知するため、値を更新する
        unUsedFrameCount++
    }

    override fun onResume() {
        super.onResume()
        if (isPermissionGranted) {
            setup()
        } else {
            permissionRequest.launch(arrayOf(android.Manifest.permission.CAMERA, android.Manifest.permission.RECORD_AUDIO))
        }
    }

    override fun onPause() {
        super.onPause()
        lifecycleScope.launch(Dispatchers.IO) {
            cameraDestroy()
        }
    }

    /** リソース開放。サスペンド関数なので終わるまで一時停止する */
    private suspend fun cameraDestroy() {
        // キャンセル待ちをすることでGLのループを抜けるのを待つ（多分描画中に終了すると落ちる）
        cameraJob?.cancelAndJoin()
        previewSurfaceTexture.forEach {
            it.setOnFrameAvailableListener(null)
            it.release()
        }
        previewSurfaceTexture.clear()
        imageReader?.close()
        glSurfaceList.forEach { it.release() }
        glSurfaceList.clear()
        cameraControlList.forEach { it.destroy() }
        cameraControlList.clear()
        if (isRecording) {
            mediaRecorder?.stop()
        }
        mediaRecorder?.release()
        mediaRecorder = null
    }

    private fun setup() {
        cameraJob = lifecycleScope.launch(Dispatchers.IO) {
            // SurfaceView を待つ
            val previewSurface = waitSurface()
            // 撮影モードに合わせた Surface を作る（静止画撮影、動画撮影）
            val captureSurface = if (currentCaptureMode == CameraCaptureMode.PICTURE) {
                // 静止画撮影で利用する ImageReader
                // Surface の入力から画像を生成できる
                val imageReader = ImageReader.newInstance(
                    if (isLandscape) CAMERA_RESOLTION_WIDTH else CAMERA_RESOLTION_HEIGHT,
                    if (isLandscape) CAMERA_RESOLTION_HEIGHT else CAMERA_RESOLTION_WIDTH,
                    PixelFormat.RGBA_8888, // JPEG は OpenGL 使ったせいなのか利用できない
                    2
                )
                this@MainActivity.imageReader = imageReader
                imageReader.surface
            } else {
                // メソッド呼び出しには順番があります
                val mediaRecorder = (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) MediaRecorder(this@MainActivity) else MediaRecorder()).apply {
                    setAudioSource(MediaRecorder.AudioSource.MIC)
                    setVideoSource(MediaRecorder.VideoSource.SURFACE)
                    setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                    setVideoEncoder(MediaRecorder.VideoEncoder.H264)
                    setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                    setAudioChannels(2)
                    setVideoEncodingBitRate(1_000_000)
                    setVideoFrameRate(30)
                    if (isLandscape) {
                        setVideoSize(CAMERA_RESOLTION_WIDTH, CAMERA_RESOLTION_HEIGHT)
                    } else {
                        setVideoSize(CAMERA_RESOLTION_HEIGHT, CAMERA_RESOLTION_WIDTH)
                    }
                    setAudioEncodingBitRate(128_000)
                    setAudioSamplingRate(44_100)
                    saveVideoFile = File(getExternalFilesDir(null), "${System.currentTimeMillis()}.mp4")
                    setOutputFile(saveVideoFile!!)
                    prepare()
                }
                this@MainActivity.mediaRecorder = mediaRecorder
                mediaRecorder.surface
            }

            // CameraRenderer を作る
            val previewCameraGLRenderer = CameraGLRenderer(
                rotation = if (isLandscape) 90f else 0f, // 画面回転
                mainSurfaceTexture = { previewSurfaceTexture[0] },
                subSurfaceTexture = { previewSurfaceTexture[1] }
            )
            val captureCameraGLRenderer = CameraGLRenderer(
                rotation = if (isLandscape) 90f else 0f, // 画面回転
                mainSurfaceTexture = { previewSurfaceTexture[2] },
                subSurfaceTexture = { previewSurfaceTexture[3] }
            )
            // GLSurface を作る
            val previewGlSurface = GLSurface(
                surface = previewSurface,
                renderer = previewCameraGLRenderer,
            )
            val captureGlSurface = GLSurface(
                surface = captureSurface,
                renderer = captureCameraGLRenderer
            )
            glSurfaceList += previewGlSurface
            glSurfaceList += captureGlSurface

            // プレビュー / 静止画撮影 で利用する SurfaceTexture を用意
            // SurfaceTexture の場合は setDefaultBufferSize でカメラの解像度の設定ができる (720P など)
            previewGlSurface.makeCurrent()
            val previewSurfaceTexturePair = previewCameraGLRenderer.setupProgram().let { (mainCameraTextureId, subCameraTextureId) ->
                // メイン映像
                val main = SurfaceTexture(mainCameraTextureId).apply {
                    setDefaultBufferSize(CAMERA_RESOLTION_WIDTH, CAMERA_RESOLTION_HEIGHT)
                    setOnFrameAvailableListener(this@MainActivity)
                }
                // サブ映像
                val sub = SurfaceTexture(subCameraTextureId).apply {
                    setDefaultBufferSize(CAMERA_RESOLTION_WIDTH, CAMERA_RESOLTION_HEIGHT)
                    setOnFrameAvailableListener(this@MainActivity)
                }
                main to sub
            }
            captureGlSurface.makeCurrent()
            val captureSurfaceTexturePair = captureCameraGLRenderer.setupProgram().let { (mainCameraTextureId, subCameraTextureId) ->
                // メイン映像
                val main = SurfaceTexture(mainCameraTextureId).apply {
                    setDefaultBufferSize(CAMERA_RESOLTION_WIDTH, CAMERA_RESOLTION_HEIGHT)
                    setOnFrameAvailableListener(this@MainActivity)
                }
                // サブ映像
                val sub = SurfaceTexture(subCameraTextureId).apply {
                    setDefaultBufferSize(CAMERA_RESOLTION_WIDTH, CAMERA_RESOLTION_HEIGHT)
                    setOnFrameAvailableListener(this@MainActivity)
                }
                main to sub
            }
            previewSurfaceTexture.addAll(previewSurfaceTexturePair.toList())
            previewSurfaceTexture.addAll(captureSurfaceTexturePair.toList())

            // どっちのカメラをメイン映像にするか
            // 今回はメイン映像をバックカメラ、サブ映像（ワイプ）をフロントカメラに指定
            // Pair は メイン映像に指定する SurfaceTexture のリスト
            val mainSurfaceTexture = listOf(previewSurfaceTexturePair.first, captureSurfaceTexturePair.first)
            val subSurfaceTexture = listOf(previewSurfaceTexturePair.second, captureSurfaceTexturePair.second)

            // カメラを開く
            val (backCameraId, frontCameraId) = CameraTool.getCameraId(this@MainActivity)
            cameraControlList += CameraControl(this@MainActivity, backCameraId, Surface(mainSurfaceTexture[0]), Surface(mainSurfaceTexture[1]))
            cameraControlList += CameraControl(this@MainActivity, frontCameraId, Surface(subSurfaceTexture[0]), Surface(subSurfaceTexture[1]))
            cameraControlList.forEach { it.openCamera() }
            // プレビューする
            cameraControlList.forEach { it.startCamera() }

            // OpenGL のレンダリングを行う
            // isActive でこの cameraJob が終了されるまでループし続ける
            // ここで行う理由ですが、makeCurrent したスレッドでないと glDrawArray できない？ + onFrameAvailable が UIスレッド なので重たいことはできないためです。
            // ただ、レンダリングするタイミングは onFrameAvailable が更新されたタイミングなので、
            // while ループを回して 新しいフレームが来ているか確認しています。
            while (isActive) {
                // OpenGL の描画よりも onFrameAvailable の更新のほうが早い？ため、更新が追いついてしまう
                // そのため、消費したフレームとまだ消費していないフレームを比較するようにした
                // https://stackoverflow.com/questions/14185661
                if (unUsedFrameCount != usedFrameCount && isActive) {
                    glSurfaceList.forEach {
                        it.makeCurrent() // 多分いる
                        it.drawFrame()
                        it.swapBuffers()
                    }
                    usedFrameCount += 2 // メイン映像とサブ映像で2つ
                }
            }
        }
    }

    /** 撮影、録画ボタンを押したとき */
    private fun capture() {
        lifecycleScope.launch(Dispatchers.IO) {
            if (currentCaptureMode == CameraCaptureMode.VIDEO) {
                // 録画モード
                if (!isRecording) {
                    mediaRecorder?.start()
                } else {
                    // 多分 MediaRecorder を作り直さないといけない
                    cameraDestroy()
                    // 動画フォルダ に保存する
                    val contentResolver = contentResolver
                    val contentValues = contentValuesOf(
                        MediaStore.Video.Media.DISPLAY_NAME to saveVideoFile?.name,
                        MediaStore.Video.Media.RELATIVE_PATH to "${Environment.DIRECTORY_MOVIES}/ArisaDroid"
                    )
                    contentResolver.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, contentValues)?.also { uri ->
                        contentResolver.openOutputStream(uri)?.use { outputStream ->
                            saveVideoFile?.inputStream()?.use { inputStream ->
                                inputStream.copyTo(outputStream)
                            }
                        }
                    }
                    setup()
                }
                isRecording = !isRecording
            } else {
                // 静止画モード
                // ImageReader から取り出す
                val image = imageReader?.acquireLatestImage() ?: return@launch
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
                val originWidth = if (isLandscape) CAMERA_RESOLTION_WIDTH else CAMERA_RESOLTION_HEIGHT
                val originHeight = if (isLandscape) CAMERA_RESOLTION_HEIGHT else CAMERA_RESOLTION_WIDTH
                val editBitmap = Bitmap.createBitmap(readBitmap, 0, 0, originWidth, originHeight)
                readBitmap.recycle()
                // ギャラリーに登録する
                val contentResolver = contentResolver
                val contentValues = contentValuesOf(
                    MediaStore.Images.Media.DISPLAY_NAME to "${System.currentTimeMillis()}.jpg",
                    MediaStore.Images.Media.RELATIVE_PATH to "${Environment.DIRECTORY_PICTURES}/ArisaDroid"
                )
                val uri = contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues) ?: return@launch
                contentResolver.openOutputStream(uri).use { outputStream ->
                    editBitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
                }
                editBitmap.recycle()
                image.close()
            }
        }
    }

    /** Surface の用意が終わるまで一時停止する */
    private suspend fun waitSurface() = suspendCoroutine { continuation ->
        surfaceView.holder.apply {
            if (surface.isValid) {
                continuation.resume(this.surface)
            } else {
                var callback: SurfaceHolder.Callback? = null
                callback = object : SurfaceHolder.Callback {
                    override fun surfaceCreated(holder: SurfaceHolder) {
                        continuation.resume(holder.surface)
                        removeCallback(callback)
                    }

                    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
                        // do nothing
                    }

                    override fun surfaceDestroyed(holder: SurfaceHolder) {
                        // do nothing
                    }
                }
                addCallback(callback)
            }
        }
    }

    /** 撮影モード */
    private enum class CameraCaptureMode {
        PICTURE,
        VIDEO,
    }

    companion object {

        /** 720P 解像度 幅 */
        private const val CAMERA_RESOLTION_WIDTH = 1280

        /** 720P 解像度 高さ */
        private const val CAMERA_RESOLTION_HEIGHT = 720

    }

}
```

## ついでに 最終的な CameraControl 

```kotlin
/**
 * カメラを開けたり閉じたりする処理を隠蔽するクラス
 *
 * @param context [Context]
 * @param cameraId カメラID、前面 or 背面
 * @param previewSurface プレビューSurface
 * @param captureSurface 撮影、録画 用Surface
 */
class CameraControl(
    context: Context,
    private val cameraId: String,
    private val previewSurface: Surface,
    private val captureSurface: Surface
) {
    private val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    private val cameraExecutor = Executors.newSingleThreadExecutor()
    private var cameraDevice: CameraDevice? = null

    /** カメラを開く */
    suspend fun openCamera() {
        cameraDevice = waitOpenCamera()
    }

    /** カメラを開始する */
    fun startCamera() {
        val cameraDevice = cameraDevice ?: return
        val captureRequest = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_STILL_CAPTURE).apply {
            addTarget(previewSurface)
            addTarget(captureSurface)
        }.build()
        val outputList = buildList {
            add(OutputConfiguration(previewSurface))
            add(OutputConfiguration(captureSurface))
        }
        SessionConfiguration(SessionConfiguration.SESSION_REGULAR, outputList, cameraExecutor, object : CameraCaptureSession.StateCallback() {
            override fun onConfigured(captureSession: CameraCaptureSession) {
                captureSession.setRepeatingRequest(captureRequest, null, null)
            }

            override fun onConfigureFailed(p0: CameraCaptureSession) {
                // do nothing
            }
        }).apply { cameraDevice.createCaptureSession(this) }
    }

    /** 終了時に呼び出す */
    fun destroy() {
        cameraDevice?.close()
    }

    /** [cameraId]のカメラを開く */
    @SuppressLint("MissingPermission")
    suspend private fun waitOpenCamera() = suspendCoroutine {
        cameraManager.openCamera(cameraId, cameraExecutor, object : CameraDevice.StateCallback() {
            override fun onOpened(camera: CameraDevice) {
                it.resume(camera)
            }

            override fun onDisconnected(camera: CameraDevice) {
                // do nothing
            }

            override fun onError(camera: CameraDevice, error: Int) {
                // do nothing
            }
        })
    }

}
```

## 解説
`currentCaptureMode`は静止画が動画どっちなのかが入ってます。`setup()`の呼び出し前のみ変更できます。  
`MediaRecorder`のコーデック指定に`H.264`を使ったのですが、`H.264`なのでビットレートを割りと高めにしないと残念な画質になると思います（今回は`1Mbps`にしてみたけど残念な画質）  

静止画撮影と違い、録画を終了すると`MediaRecorder`を作り直す必要があるのですが、、部分的に作り直すのは（多分）できないのでプレビューから作り直す必要があります。  
なので、`onPause`以外でもリソース開放出来るよう`cameraDestory()`関数に切り出し、録画停止時に全部作り直すようにしています。（正解なのかは知らない、、、そして若干時間がかかる）  
 
`cameraJob.cancelAndJoin()`することで、キャンセルが完了するまで待ってくれます。`cancel`だと直ちには終了しないらしい。  
`OpenGL の while ループ`を抜けた後にカメラとかのリソースを開放しないと`EGL`がなんとかで落ちてしまうので気をつけよう  
（もろもろリソース開放後に`whileループ`が生き残ってたらしく落ちた）

# そーすこーど
すぐ使えると思う

- https://github.com/takusan23/MultiCamera
    - この記事時点のコード
- https://github.com/takusan23/ArisaDroid
    - 真面目に作ろうとしたけど考えること多すぎて作るか迷ってる
    - 記述時時点からソースコード変更してると思うから前者の方を使ってください

# そのほか
## eglSwapBuffers: EGL error: 0x300d
- `makeCurrent`呼んでますか？
- `Surface`を破棄した後に`eglSwapBuffers`を呼び出していませんか？

## Surface が終了したら リソース開放する
書いてませんが、やらないといけないと思います。

# 参考にしました
thx!!!

- https://github.com/android/camera-samples
- https://stackoverflow.com/questions/14185661
- https://cs.android.com/android/platform/superproject/+/master:cts/tests/media/common/src/android/mediav2/common/cts/InputSurface.java;l=1?
- https://techbooster.org/android/application/17026/
- https://medium.com/@itometeam/camera2-apiを使いこなす-part-1-プレビューの表示-e5e799a7b4dd

# おまけ ズームする 前提編
せっかくなのでズーム機能をつけようと思います。  
`Camera 2 API`では`Android 11`以前から使える`SCALER_CROP_REGION`と以降で利用できる`CONTROL_ZOOM_RATIO_RANGE`があるっぽいです。  
今回は後者の`CONTROL_ZOOM_RATIO_RANGE`を試します。なんか前者はズーム範囲を自前で計算？（四角形の座標を自前で用意する？）する必要があるらしく、  
後者はそのまま 1f~ (広角搭載時は .7f ~ でしょうか) のような指定ができるようです。  

`Pixel 6 Pro`だと望遠カメラ（ペリスコープ）も広角カメラも`CONTROL_ZOOM_RATIO_RANGE`を変更することで変更した値によって適切なカメラが自動で選択されるらしいです。（20を入れたら望遠、0.6を入れたら広角 みたいな）

が、↑の方法が使えるのは、**論理カメラ**の場合のみです。（`getCameraIdList`でフロント、バックでそれぞれ一個ずつ配列に入っている場合）  
**それとは別に**`Camera 2 API`の`getCameraIdList`でバックカメラの数だけ返ってくる場合（標準、広角、望遠 それぞれにIDが振られている）、選択中のカメラのズームのみが利用できます。  
（標準カメラの場合は標準カメラが使えるズーム範囲のみ。もし標準→望遠にしたい場合はカメラを開き直すところからやる必要がある。）  
（端末によっては録画中は物理カメラを変更できないやつがありますがこの辺が影響していそうですね。）  
（今回は面倒なのでやらないです、、、）  

## ズームする
`CameraControl`内にズームできる範囲を取得できるプロパティを用意しました。  
`Pixel 6 Pro`のバックカメラの場合は`0.6704426..20.0`が返ってきました。20倍ズーム！！ペリスコープすごい。可動部品を載せる勇気！！  
（ペリスコープのせいでスマホを振るとカタカタ音が鳴るんだけどちょっと怖い。`pixel 6 pro rattle`で検索検索）

```kotlin
class CameraControl(
    context: Context,
    private val cameraId: String,
    private val previewSurface: Surface,
    private val captureSurface: Surface
) {

    /** ズーム出来る値の範囲を返す */
    val zoomRange = cameraManager.getCameraCharacteristics(cameraId)?.get(CameraCharacteristics.CONTROL_ZOOM_RATIO_RANGE)?.let {
        // Pixel 6 Pro の場合は 0.6704426..20.0 のような値になる
        it.lower..it.upper
    } ?: 0f..0f

```

後はカメラ開始時にズームする値を渡せるようにします。  
差分が面倒なので全部張ります。`captureRequest`と`currentCaptureSession`を他の構成でも使えるように移動させました。  
`setRepeatingRequest`でズーム後の構成でカメラを利用できます。

```kotlin
class CameraControl(
    context: Context,
    private val cameraId: String,
    private val previewSurface: Surface,
    private val captureSurface: Surface
) {
    private val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    private val cameraExecutor = Executors.newSingleThreadExecutor()
    private var cameraDevice: CameraDevice? = null

    private var captureRequest: CaptureRequest.Builder? = null
    private var currentCaptureSession: CameraCaptureSession? = null
    private val outputList = buildList {
        add(OutputConfiguration(previewSurface))
        add(OutputConfiguration(captureSurface))
    }

    /** ズーム出来る値の範囲を返す */
    val zoomRange = cameraManager.getCameraCharacteristics(cameraId)?.get(CameraCharacteristics.CONTROL_ZOOM_RATIO_RANGE)?.let {
        // Pixel 6 Pro の場合は 0.6704426..20.0 のような値になる
        it.lower..it.upper
    } ?: 0f..0f

    /** カメラを開く */
    suspend fun openCamera() {
        cameraDevice = waitOpenCamera()
    }

    /** カメラを開始する */
    fun startCamera() {
        val cameraDevice = cameraDevice ?: return
        if (captureRequest == null) {
            captureRequest = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_STILL_CAPTURE).apply {
                addTarget(previewSurface)
                addTarget(captureSurface)
            }
        }
        SessionConfiguration(SessionConfiguration.SESSION_REGULAR, outputList, cameraExecutor, object : CameraCaptureSession.StateCallback() {
            override fun onConfigured(captureSession: CameraCaptureSession) {
                currentCaptureSession = captureSession
                captureSession.setRepeatingRequest(captureRequest!!.build(), null, null)
            }

            override fun onConfigureFailed(p0: CameraCaptureSession) {
                // do nothing
            }
        }).apply { cameraDevice.createCaptureSession(this) }
    }

    /**
     * ズームする
     * [startCamera]を呼び出した後のみ利用可能
     */
    fun zoom(zoom: Float = 1f) {
        val captureRequest = captureRequest ?: return
        val currentCaptureSession = currentCaptureSession ?: return

        captureRequest.set(CaptureRequest.CONTROL_ZOOM_RATIO, zoom)
        currentCaptureSession.setRepeatingRequest(captureRequest.build(), null, null)
    }

    /** 終了時に呼び出す */
    fun destroy() {
        cameraDevice?.close()
    }

    /** [cameraId]のカメラを開く */
    @SuppressLint("MissingPermission")
    suspend private fun waitOpenCamera() = suspendCoroutine {
        cameraManager.openCamera(cameraId, cameraExecutor, object : CameraDevice.StateCallback() {
            override fun onOpened(camera: CameraDevice) {
                it.resume(camera)
            }

            override fun onDisconnected(camera: CameraDevice) {
                // do nothing
            }

            override fun onError(camera: CameraDevice, error: Int) {
                // do nothing
            }
        })
    }
}
```

あとはシークバーのUI部品を置いて完成。  
カメラを配列で管理するの、良くなかったですね。

```kotlin
val zoomValue = remember { mutableStateOf(1f) }
val zoomRange = remember { mutableStateOf(0f..1f) }
SideEffect {
    // 非 Compose なコードので若干違和感
    zoomRange.value = cameraControlList.firstOrNull()?.zoomRange ?: 0f..1f
}

Slider(
    value = zoomValue.value,
    valueRange = zoomRange.value,
    onValueChange = {
        zoomValue.value = it
        // 前面カメラ は最初
        cameraControlList.first().zoom(it)
    }
)
```
これでちゃんとズームできるはず、。標準アプリ以外でもペリスコープカメラが使えてすごい。

# おわりに1
おそらく、静止画撮影の場合は`CameraCaptureSession#setRepeatingRequest`ではなく、`CameraCaptureSession#capture`を呼び出すべきですね。めんどいのでやってませんが。  
それと`CameraX`が使えたらとても楽だと思いサンプルコードをクローンした後、`前面、背面`カメラを同時に開こうとしましたが、、、  
残念ながらできない？っぽいので、今回のような同時にカメラを利用する場合は`Cameara2 API`を使うしかなさそうですね。誰もしないでしょうが  

```plaintext
E/CameraXBasic: Use case binding failed
    java.lang.IllegalArgumentException: Multiple LifecycleCameras with use cases are registered to the same LifecycleOwner.
```

あと`CameraX`でも`SurfaceTexture`も多分使えそう？だけど、`ImageAnalysis`？とか言うので`Bitmap`が取れるらしい？のでそれを`OpenGL`に転送すれば良さそうです。  
何も分からん。

# おわりに2
つかれた  
こうしてカメラアプリを作ってみると、プレビューを出すまでなのにすごい大変だなあというところです。（`CameraX`を使えるなら使えよという話ではある）  

それなのに電池残量が10%を切ったら使えなくなるとかで騒がれてて流石にかわいそうだと思いました。（というかこれで記事にするんか？）  
https://www.itmedia.co.jp/news/articles/2302/17/news190.html

老舗メーカーなので黎明期に10%あってもいきなり電池が切れるとかあっただろうし、  
カメラよりも重要なプロセスが存在するような気がするし（キャリア端末だからなおさら）で、安全な方に倒しているので全然問題ないと思うんですが。。。。  

動画撮影ならなおさらですね。途中で電池が切れて再生できないファイルが出来るより予め利用できない方へ倒すべきですね。シャットダウンまでの間に保存できるか分からん、、、  
（最後に`moov atom`を動画ファイルに書き込むらしい（要検証）ので間に合わない可能性もある？書き込めなかったら動画ファイルとして認識されないので、、、）  

以上です。お疲れ様でした。8888