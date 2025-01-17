---
title: 令和最新版 Android で前面と背面を同時に撮影できるカメラを作りたい
created_at: 2024-07-18
tags:
- Android
- Camera2API
- OpenGL
- MediaCodec
- KotlinCoroutines
---
どうもこんばんわ。  
アスカさんはなびかない 攻略しました。アスカさんめっちゃかわいんだけど！？！？！？

![Imgur](https://i.imgur.com/XLQivJY.png)

！！！

![Imgur](https://i.imgur.com/tbcR5zY.png)

ここの話いい！

![Imgur](https://i.imgur.com/yxVo25l.png)

ちゃんとなびいてない！  
丁寧に書かれていてよかったと思います。とくになびくまで！！

![Imgur](https://i.imgur.com/ESRogri.png)

それから声優さんの声がめっちゃよかった、また出てくれないかな

![Imgur](https://i.imgur.com/D6dsx3W.png)

おすすめです、かわいかったです

# 本題
前面と背面のカメラを同時に利用して一つの`View（SurfaceView）`にカメラ映像を表示させようというやつです。  

![Imgur](https://i.imgur.com/3B3eZdg.png)

https://takusan.negitoro.dev/posts/android_front_back_camera/

これの令和最新版です。もうちょっときれいなコード、マシな動作を目指します。  

- `SurfaceTexture`のコールバックが暫定対応感ある（`Mutex()`使えばいい）
- コルーチンの`newSingleThreadContext`が`OpenGL ES`で使えそう
- アプリから離れたら落ちる時があるなど、若干不安定なのも直したい

細かい説明は去年書いたやつに任せるとして、でもコードはほぼ書き直しです。

# 前面と背面が同時に撮影できる Android アプリを探してるんだけど検索妨害するのやめない？
はい。  

https://play.google.com/store/apps/details?id=io.github.takusan23.komadroid

# 追記 2024/10/29
`CameraX`が追いついてきました。  
もう私みたいに`OpenGL ES`のシェーダーやら何やら書くこと無く、2つのカメラ映像を重ねた状態で`SurfaceView`で表示したり、`MediaCodec`で録画できるらしいです。  

https://android-developers.googleblog.com/2024/10/camerax-update-makes-dual-concurrent-camera-easier.html

悔しい...ですよね？  
もう`CameraX`を使えばいいと思いました。

# ざっくり概要
前面背面それぞれプレビュー用の`SurfaceView`を持つと、見る分には良いのですが、静止画、動画撮影が出来ないんですよね。  
なので、どうにかして一つの`Surface`に合成する必要があります。  
（`Surface`ファミリー。画面に表示する`SurfaceView / TextureView`、録画する`MediaRecorder / MediaCodec`、静止画撮影の`ImageReader`）

`Surface`ってのが、なんか映像を渡すパイプみたいなやつ。これのおかげで私たちは映像データをバイト配列で扱わなくて済む。  
（`ブラウザ JavaScript`の`MediaStream`が一番近そう。詳しくないけど。）  

で、その一つの`Surface`に2つのカメラ映像を合成する方法がおそらく`OpenGL ES`を使うしか無い。  
`OpenGL ES`を使えば、合成処理が`CPU`じゃなくて`GPU`で処理されるので、プレビューも動画撮影も難なくこなせるはずです。`OpenGL ES`めっちゃ難しいけど、`AOSP`コピペする気でいるので。。。

`OpenGL ES`へカメラ映像を渡す方法ですが、`SurfaceTexture`クラスを使います。  
これで、後述する`フラグメントシェーダー`からテクスチャとしてカメラ映像を利用できます。`texture2D()`で使うことが出来ます。  
`WebGL`でも`<video>`がテクスチャとして使えますが、そんな感じです。

逆に`OpenGL ES`で描画した内容を`SurfaceView`や`MediaRecorder`で使う方法ですが、これも`AOSP`で使われている`InputSurface`クラスを使います。  

![Imgur](https://i.imgur.com/tHrEQGy.png)

私はカメラ周りの用意と、フラグメントシェーダーで2つの映像を重ねて描画する処理を書くのと、録画とプレビューの繋ぎこみ。くらいしかやっていないことがわかりますね。

# 令和最新版なのに CameraX 使わないんですか
あの記事を書いた後くらいに、`CameraX`でも同時に前面背面カメラを利用できるようになったそうです。（未検証）  

`Google I/O 2024`の`Android`メディア関連の発表でありました。`CameraX`の発表。  
https://youtu.be/98QtLRrwyt8?si=yM8qtBMDXJ6EgEle

リリースノート的にはこの辺？  
https://developer.android.com/jetpack/androidx/releases/camera#1.3.0

`CameraX`も同時にカメラを開けるようになったらしい、前回記事書いた時はダメだったのですごい！  
![Imgur](https://i.imgur.com/bcSmjFh.png)

ただ、この後に出てくるコードでプレビューを作ってるのですが、プレビューは多分`SurfaceView`？にあたるものを2個重ねてるだけっぽい？  
静止画撮影や録画はどうすればいいのかまでは話してくれなかった。  
![Imgur](https://i.imgur.com/UTfsZjy.png)

多分撮影、録画したい場合は結局`OpenGL ES`とかを書かないといけない雰囲気がして、  
そうなると`Camera2 API`叩くのと変わらないというか、`CameraX`入れても享受出来る機能あんまりなさそうなんだけどどうなんだろう？。  
あんまり`CameraX`の機能使いたい！とかないんだよな今回。  
`PreviewView`が便利そうだけど`OpenGL ES`で描画したら結局使えなさそう。

# つくる

| なまえ  | あたい                           |
|---------|----------------------------------|
| 端末    | Pixel 8 Pro / Xperia 1 V         |
| Android | プリインストールの時点で 11 以降 |
| minSdk  | 30                               |
| 言語    | Kotlin / OpenGL ES               |

カメラ映像を一つの`SurfaceView`に描画するため`OpenGL ES`を使います。  
ががが、相変わらず`AOSP`のコードをコピーすることにするので、そんなに難しくないはず。

今回も今回とて`Kotlin コルーチン`が大活躍です。  
コルーチンがいたるところに出てくるので多分難しい。私もよく分からない。カメラ周りはコールバック多すぎる。

また、**Android 11**以降で、カメラの前後同時利用が出来るようになりましたが！！  
同時利用のためにはハードウェア側も対応している必要がおそらくあり、アップデートで`Android 11`にした場合はおそらく対応していません。

`Android 11`以降が初めから搭載された端末の場合は多分使えます。

## プロジェクトをつくる
`minSdk`を`30`に（`Android 11`）。  
`Jetpack Compose`を使っても使わなくてもいいです。`MainActivity`にはカメラ映像を出すための`SurfaceView`があれば最低限良いのですから。  

名前ですがいい感じのを付けてください。今回は自分側のカメラ映像が小窓で映るので→こまどろいど

![Imgur](https://i.imgur.com/AMSm0Mq.png)

## AndroidManifest
カメラ権限と、動画撮影でマイクを使うならマイク権限も。

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

## カメラ権限ください画面
先に権限をもらう画面を作りますか。  
よくある、初回起動時に必要な権限を一気に要求するタイプの嫌なアプリになってしまう。が、カメラアプリでカメラ権限無いのは問題だしこれはこれでいいか。。。

まずは権限を確認するユーティリティクラスを

```kotlin
object PermissionTool {

    /** 必要な権限 */
    val REQUIRED_PERMISSION_LIST = arrayOf(
        android.Manifest.permission.CAMERA,
        android.Manifest.permission.RECORD_AUDIO
    )

    /** 権限があるか */
    fun isGrantedPermission(context: Context): Boolean = REQUIRED_PERMISSION_LIST
        .map { permission -> ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED }
        .all { it }
}
```

次に権限ください画面を

```kotlin
/** 権限ください画面 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PermissionScreen(onGranted: () -> Unit) {
    val permissionRequest = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions(),
        onResult = {
            // 権限付与された
            if (it.all { it.value }) {
                onGranted()
            }
        }
    )

    Scaffold(
        topBar = { TopAppBar(title = { Text(text = "権限ください") }) }
    ) { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding)) {

            Text(text = "権限ください")

            Button(onClick = {
                permissionRequest.launch(PermissionTool.REQUIRED_PERMISSION_LIST)
            }) { Text(text = "権限を付与") }
        }
    }
}
```

カメラ画面も作ってしまいます。`CameraScreen.kt`  
権限を貰った後は、ここに映像が描画されるようにします。

```kotlin
/** カメラ画面 */
@Composable
fun CameraScreen() {

}
```

最後に`MainActivity`から呼び出して出るはず。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            KomaDroidTheme {
                CameraOrPermissionScreen()
            }
        }
    }
}

// 権限画面かカメラ画面
@Composable
private fun CameraOrPermissionScreen() {
    val context = LocalContext.current

    // 権限ない場合は権限ください画面
    val isGrantedPermission = remember { mutableStateOf(PermissionTool.isGrantedPermission(context)) }
    if (!isGrantedPermission.value) {
        PermissionScreen(
            onGranted = { isGrantedPermission.value = true }
        )
    } else {
        CameraScreen()
    }
}
```

![Imgur](https://i.imgur.com/LuVnkBS.png)

## AOSP からコードをお借りしてくる
次は`Camera 2 API`でカメラの用意、、、の前に`OpenGL ES`周りを終わらせてしまいます。  
難易度爆上がりコピーしよう

### InputSurface クラス
まず1つ目がこちら、`InputSurface`クラス。  
これは`AOSP`のをコピペして私が`Kotlin`化をしたものです。

https://cs.android.com/android/platform/superproject/main/+/main:cts/tests/mediapc/src/android/mediapc/cts/InputSurface.java

一応分かっている範囲で説明をすると、  
`Android`には、`GLSurfaceView`っていう、`Android`で`OpenGL ES`で描画した内容を表示する、`SurfaceView`を継承した`View`があります。  
`OpenGL ES`はメインスレッド以外で描画するので、バックグラウンドスレッドでも描画できる`SurfaceView`をもと作ってます。

ただ、初めから用意されているのは`SurfaceView`だけで、  
`SurfaceView`のお友達である`TextureView`や、`SurfaceView`のように表示はしないけど、代わりに録画を行う`MediaRecorder`などにはそれぞれ`GLTextureView`、`GLMediaRecorder`みたいなクラスがありません。存在しない！！！

そこでこのクラスです。  
`SurfaceView`を継承した`GLSurfaceView`がやっていることを多分やってくれています。  
これで`TextureView`や`MediaRecorder`でも`OpenGL ES`が使えるわけです。多分。

```kotlin
/*
 * Copyright (C) 2021 The Android Open Source Project
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

package io.github.takusan23.komadroid.gl

import android.opengl.EGL14
import android.opengl.EGLConfig
import android.opengl.EGLExt
import android.view.Surface

/**
 * SurfaceView / MediaRecorder / MediaCodec で描画する際に OpenGL ES の設定が必要だが、EGL 周りの設定をしてくれるやつ。
 *
 * @param outputSurface 出力先 [Surface]
 */
class InputSurface(private val outputSurface: Surface) {
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
        mEGLSurface = EGL14.eglCreateWindowSurface(mEGLDisplay, configs[0], outputSurface, surfaceAttribs, 0)
        checkEglError("eglCreateWindowSurface")
    }

    /** Discards all resources held by this class, notably the EGL context. */
    fun destroy() {
        if (mEGLDisplay != EGL14.EGL_NO_DISPLAY) {
            EGL14.eglMakeCurrent(mEGLDisplay, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_CONTEXT)
            EGL14.eglDestroySurface(mEGLDisplay, mEGLSurface)
            EGL14.eglDestroyContext(mEGLDisplay, mEGLContext)
            EGL14.eglReleaseThread()
            EGL14.eglTerminate(mEGLDisplay)
        }
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

### TextureRender を元にしたクラス
https://cs.android.com/android/platform/superproject/main/+/main:cts/tests/mediapc/src/android/mediapc/cts/TextureRender.java

さっきは`OpenGL ES`が他の`TextureView`とかでも使えるようにするためのクラスを作りました。  
が、`OpenGL ES`の設定だけで、実際にカメラ映像を描画するためのクラスがありませんでした。それがこちらです。

説明出来るところはするけど、まずはコードを。こちらです。

```kotlin
/**
 * 前面背面カメラを、OpenGL ES を使い、同時に重ねて描画する。
 * OpenGL 用スレッドで呼び出してください。
 */
class KomaDroidCameraTextureRenderer {

    private val mTriangleVertices = ByteBuffer.allocateDirect(mTriangleVerticesData.size * FLOAT_SIZE_BYTES).order(ByteOrder.nativeOrder()).asFloatBuffer()
    private val mMVPMatrix = FloatArray(16)
    private val mSTMatrix = FloatArray(16)
    private var mProgram = 0
    private var muMVPMatrixHandle = 0
    private var muSTMatrixHandle = 0
    private var maPositionHandle = 0
    private var maTextureHandle = 0

    // Uniform 変数のハンドル
    private var sFrontCameraTextureHandle = 0
    private var sBackCameraTextureHandle = 0
    private var iDrawFrontCameraTextureHandle = 0

    // スレッドセーフに Bool 扱うため Mutex と CoroutineScope
    private val frameMutex = Mutex()
    private val scope = CoroutineScope(Dispatchers.Default + Job())

    // カメラ映像が来ているか。カメラ映像が描画ループの速度よりも遅いので
    private var isAvailableFrontCameraFrame = false
    private var isAvailableBackCameraFrame = false

    // カメラ映像は SurfaceTexture を経由してフラグメントシェーダーでテクスチャとして使える
    private var frontCameraTextureId = -1
    private var backCameraTextureId = -1

    // SurfaceTexture。カメラ映像をテクスチャとして使えるやつ
    private var frontCameraSurfaceTexture: SurfaceTexture? = null
    private var backCameraSurfaceTexture: SurfaceTexture? = null

    // カメラ映像を流す Surface。SurfaceTexture として使われます
    var frontCameraInputSurface: Surface? = null
        private set
    var backCameraInputSurface: Surface? = null
        private set

    init {
        mTriangleVertices.put(mTriangleVerticesData).position(0)
    }

    /** バーテックスシェーダ、フラグメントシェーダーをコンパイルする。多分 GL スレッドから呼び出してください */
    fun createShader() {
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
        sFrontCameraTextureHandle = GLES20.glGetUniformLocation(mProgram, "sFrontCameraTexture")
        checkGlError("glGetUniformLocation sFrontCameraTexture")
        if (sFrontCameraTextureHandle == -1) {
            throw RuntimeException("Could not get attrib location for sFrontCameraTexture")
        }
        sBackCameraTextureHandle = GLES20.glGetUniformLocation(mProgram, "sBackCameraTexture")
        checkGlError("glGetUniformLocation sBackCameraTexture")
        if (sBackCameraTextureHandle == -1) {
            throw RuntimeException("Could not get attrib location for sBackCameraTexture")
        }
        iDrawFrontCameraTextureHandle = GLES20.glGetUniformLocation(mProgram, "iDrawFrontCameraTexture")
        checkGlError("glGetUniformLocation iDrawFrontCameraTexture")
        if (iDrawFrontCameraTextureHandle == -1) {
            throw RuntimeException("Could not get attrib location for iDrawFrontCameraTexture")
        }

        // テクスチャ ID を払い出してもらう
        // 前面カメラの映像、背面カメラの映像で2個分
        val textures = IntArray(2)
        GLES20.glGenTextures(2, textures, 0)

        // 1個目はフロントカメラ映像
        frontCameraTextureId = textures[0]
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, frontCameraTextureId)
        checkGlError("glBindTexture cameraTextureId")
        GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_NEAREST.toFloat())
        GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR.toFloat())
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE)
        checkGlError("glTexParameter")

        // 2個目はバックカメラ映像
        backCameraTextureId = textures[1]
        GLES20.glActiveTexture(GLES20.GL_TEXTURE1)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, backCameraTextureId)
        GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_NEAREST.toFloat())
        GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR.toFloat())
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE)
        checkGlError("glTexParameter")

        // glGenTextures で作ったテクスチャは SurfaceTexture で使う
        // カメラ映像は Surface 経由で受け取る
        frontCameraSurfaceTexture = SurfaceTexture(frontCameraTextureId)
        frontCameraInputSurface = Surface(frontCameraSurfaceTexture)
        backCameraSurfaceTexture = SurfaceTexture(backCameraTextureId)
        backCameraInputSurface = Surface(backCameraSurfaceTexture)

        // 新しいフレームが使える場合に呼ばれるイベントリスナー
        // 他のスレッドからも書き換わるので Mutex() する
        frontCameraSurfaceTexture?.setOnFrameAvailableListener {
            scope.launch {
                frameMutex.withLock {
                    isAvailableFrontCameraFrame = true
                }
            }
        }
        backCameraSurfaceTexture?.setOnFrameAvailableListener {
            scope.launch {
                frameMutex.withLock {
                    isAvailableBackCameraFrame = true
                }
            }
        }
    }

    /** SurfaceTexture のサイズを設定する */
    fun setSurfaceTextureSize(width: Int, height: Int) {
        frontCameraSurfaceTexture?.setDefaultBufferSize(width, height)
        backCameraSurfaceTexture?.setDefaultBufferSize(width, height)
    }

    /** 新しいフロントカメラの映像が来ているか */
    suspend fun isAvailableFrontCameraFrame() = frameMutex.withLock {
        if (isAvailableFrontCameraFrame) {
            isAvailableFrontCameraFrame = false
            true
        } else {
            false
        }
    }

    /** 新しいバックカメラの映像が来ているか */
    suspend fun isAvailableBackCameraFrame() = frameMutex.withLock {
        if (isAvailableBackCameraFrame) {
            isAvailableBackCameraFrame = false
            true
        } else {
            false
        }
    }

    /** フロントカメラ映像のテクスチャを更新する */
    fun updateFrontCameraTexture() {
        if (frontCameraSurfaceTexture?.isReleased == false) {
            frontCameraSurfaceTexture?.updateTexImage()
        }
    }

    /** バックカメラ映像のテクスチャを更新する */
    fun updateBackCameraTexture() {
        if (backCameraSurfaceTexture?.isReleased == false) {
            backCameraSurfaceTexture?.updateTexImage()
        }
    }

    /** 描画する。GL スレッドから呼び出してください */
    fun draw() {
        // Snapdragon だと glClear が無いと映像が乱れる
        // Google Pixel だと何も起きないのに、、、
        GLES20.glClear(GLES20.GL_DEPTH_BUFFER_BIT or GLES20.GL_COLOR_BUFFER_BIT)

        // 描画する
        checkGlError("draw() start")
        GLES20.glUseProgram(mProgram)
        checkGlError("glUseProgram")

        // テクスチャの ID をわたす
        GLES20.glUniform1i(sFrontCameraTextureHandle, 0) // GLES20.GL_TEXTURE0 なので 0
        GLES20.glUniform1i(sBackCameraTextureHandle, 1) // GLES20.GL_TEXTURE1 なので 1
        checkGlError("glUniform1i sFrontCameraTextureHandle sBackCameraTextureHandle")

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

        //  --- まずバックカメラ映像を描画する ---
        GLES20.glUniform1i(iDrawFrontCameraTextureHandle, 0)
        checkGlError("glUniform1i iDrawFrontCameraTextureHandle")

        // mMVPMatrix リセット
        Matrix.setIdentityM(mMVPMatrix, 0)

        backCameraSurfaceTexture?.getTransformMatrix(mSTMatrix)
        GLES20.glUniformMatrix4fv(muSTMatrixHandle, 1, false, mSTMatrix, 0)
        GLES20.glUniformMatrix4fv(muMVPMatrixHandle, 1, false, mMVPMatrix, 0)
        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
        checkGlError("glDrawArrays")

        // --- 次にフロントカメラ映像を描画する ---
        GLES20.glUniform1i(iDrawFrontCameraTextureHandle, 1)
        checkGlError("glUniform1i iDrawFrontCameraTextureHandle")

        // mMVPMatrix リセット
        Matrix.setIdentityM(mMVPMatrix, 0)
        // 右上に移動させる
        // Matrix.translateM(mMVPMatrix, 0, 1f - 0.3f, 1f - 0.3f, 1f)
        // 右下に移動なら
        Matrix.translateM(mMVPMatrix, 0, 1f - 0.3f, -1f + 0.3f, 1f)
        // 半分ぐらいにする
        Matrix.scaleM(mMVPMatrix, 0, 0.3f, 0.3f, 1f)

        // 描画する
        frontCameraSurfaceTexture?.getTransformMatrix(mSTMatrix)
        GLES20.glUniformMatrix4fv(muSTMatrixHandle, 1, false, mSTMatrix, 0)
        GLES20.glUniformMatrix4fv(muMVPMatrixHandle, 1, false, mMVPMatrix, 0)
        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
        checkGlError("glDrawArrays")
        GLES20.glFinish()
    }

    /** 破棄時に呼び出す */
    fun destroy() {
        scope.cancel()
        frontCameraSurfaceTexture?.release()
        frontCameraInputSurface?.release()
        backCameraSurfaceTexture?.release()
        backCameraInputSurface?.release()
    }

    private fun checkGlError(op: String) {
        val error = GLES20.glGetError()
        if (error != GLES20.GL_NO_ERROR) {
            throw RuntimeException("$op: glError $error")
        }
    }

    /**
     * GLSL（フラグメントシェーダー・バーテックスシェーダー）をコンパイルして、OpenGL ES とリンクする
     *
     * @throws GlslSyntaxErrorException 構文エラーの場合に投げる
     * @throws RuntimeException それ以外
     * @return 0 以外で成功
     */
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

    /**
     * GLSL（フラグメントシェーダー・バーテックスシェーダー）のコンパイルをする
     *
     * @throws GlslSyntaxErrorException 構文エラーの場合に投げる
     * @throws RuntimeException それ以外
     * @return 0 以外で成功
     */
    private fun loadShader(shaderType: Int, source: String): Int {
        var shader = GLES20.glCreateShader(shaderType)
        checkGlError("glCreateShader type=$shaderType")
        GLES20.glShaderSource(shader, source)
        GLES20.glCompileShader(shader)
        val compiled = IntArray(1)
        GLES20.glGetShaderiv(shader, GLES20.GL_COMPILE_STATUS, compiled, 0)
        if (compiled[0] == 0) {
            shader = 0
        }
        return shader
    }

    companion object {
        private const val FLOAT_SIZE_BYTES = 4
        private const val TRIANGLE_VERTICES_DATA_STRIDE_BYTES = 5 * FLOAT_SIZE_BYTES
        private const val TRIANGLE_VERTICES_DATA_POS_OFFSET = 0
        private const val TRIANGLE_VERTICES_DATA_UV_OFFSET = 3

        private val mTriangleVerticesData = floatArrayOf(
            -1.0f, -1.0f, 0f, 0f, 0f,
            1.0f, -1.0f, 0f, 1f, 0f,
            -1.0f, 1.0f, 0f, 0f, 1f,
            1.0f, 1.0f, 0f, 1f, 1f
        )

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

        private const val FRAGMENT_SHADER = """
#extension GL_OES_EGL_image_external : require
precision mediump float;
varying vec2 vTextureCoord;

uniform samplerExternalOES sFrontCameraTexture;
uniform samplerExternalOES sBackCameraTexture;

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
    outColor = cameraColor;
  } else {
    // バックカメラ（外側）
    vec4 cameraColor = texture2D(sBackCameraTexture, vTextureCoord);
    outColor = cameraColor;
  }

  // 出力
  gl_FragColor = outColor;
}
"""
    }

}
```

#### createShader 関数
まずバーテックスシェーダとフラグメントシェーダーをコンパイルしています。  
バーテックスシェーダーがどこに描画するか、フラグメントシェーダーが何色で色を塗るかですね。  
原画家さんとグラフィッカーさんかな、

実際のバーテックスシェーダーとフラグメントシェーダーがどこにあるかですが、  
`companion object`にある`VERTEX_SHADER`と`FRAGMENT_SHADER`です。`C言語`みたいなやつ。`GPU`側で動くので`C言語`みたいになっちゃいます（？？）  
バーテックスシェーダーの方はよくわかりません、これで画面いっぱいに描画するぜってことらしいです。  

フラグメントシェーダーが色を付けてるところで、ここでカメラ映像のテクスチャから対応する座標の色を取り出して、`gl_FragColor`に渡してる感じです。  
`texture2D`関数が引数にテクスチャと位置（vec2）を取ります。  
`if (bool(....))`を使うことで、前面カメラの映像を描画するか、背面カメラの映像を描画するか分岐してる感じですね。

`OpenGL ES`（というか`GPU`）がなぜ速いかは、多分`GPU`のコア数を活かしてフラグメントシェーダーを並列で動かしてるからなんじゃないかなと。  
ディスプレイの各ピクセルの色を決めるのにフラグメントシェーダーを並列で動かす。

シェーダーはこのへんで。  
次は`glGetAttribLocation`や`glGetUniformLocation`が続きます。これはバーテックスシェーダー、フラグメントシェーダーへ値を渡したいときに使うやつです。  
`GPU`で動くので`CPU`側で作った値は送らないといけない。変数へのアドレスみたいなのがもらえるので、`glUniform1i`とかを使って値を渡します。  
今回はこれを使って前面カメラ、背面カメラどっちを描画するかとかを`CPU`側で指定した後、`GPU`で描画するようにしています。

最後に`glGenTextures`。これは画像を使いますよというやつです。  
`2`個分です。前面カメラと背面カメラ用。  
最後は`SurfaceTexture / Surface`を作り、`glGenTextures`で作ったテクスチャがカメラ映像になるようにします。  

どーでもいいけど、`Surface()`のコンストラクタに`SurfaceTexture`のインスタンスを入れるという、なんだかよく分からない`API`設計ですよね。  
`TextureView`使ったことあれば謎に思った人が何人かいそう。

#### draw 関数
描画する処理があります。  
`glUseProgram`で、コンパイルしたシェーダーを使いますよと宣言し、  
バーテックスシェーダー、フラグメントシェーダーで使ってる変数をセットします。  

そのあと、まずは背面カメラの映像を描画します。そのためにフラグを切り替えます。`glDrawArrays`で描画。  

次にフラグを前面カメラを描画するように切り替えます。  
また行列操作をします。今度は小さくして、右下に配置します。  
もう一回`glDrawArrays`することで、背景カメラ映像の右上に前面カメラの映像が描画されるようになるはず。

#### isAvailableBackCameraFrame、isAvailableFrontCameraFrame 関数
さて、ここまでは大体前回と同じような`OpenGL ES`周りですが、記事を書いた後しばらくしてこれを使えば良いんじゃないかと思ったので、、、  
前回あったこの問題、原因は`SurfaceTexture`（カメラ映像を`OpenGL ES`のテクスチャとして使えるやつ）のコールバックが描画に対して速すぎるせいで、映像の更新通知がおかしくなり描画出来なくなる。とか言ってましたが。。。  
https://stackoverflow.com/questions/14185661

あれは私が**複数スレッド**で`boolean`を**書き換えていたのが原因**。です。  
`OpenGL ES`描画用スレッドでフラグを折って、`SurfaceTexture`のコールバックでフラグを立てていた（多分メインスレッド）のが悪い。  

というわけで、`synchronized`（か同等の解決策を）して、`boolean`の書き換えがスレッドセーフになるようにすれば良かったのです。はい。  
`Kotlin コルーチン`では`synchronized`は動きませんが、スレッドセーフにアクセスできる代替案があります。`Mutex()`です。  
https://kotlinlang.org/docs/shared-mutable-state-and-concurrency.html#mutual-exclusion

これを使えば複数のコルーチン（スレッド）から変数を操作したとしてもスレッドセーフになるはずです！  
前回の`Int`増やしたり減らしたりするよりも良さそう感ある。  

#### updateBackCameraTexture、updateFrontCameraTexture 関数
`isReleased == false`をおまじない程度に入れてあります。  
いらないなら消して良いはず。

#### setSurfaceTextureSize 関数
`Camera2 API`の解像度がこの`SurfaceTexture#setDefaultBufferSize`で決めると書いてあるので。  
（カメラ映像を`OpenGL ES`のテクスチャとして使える`SurfaceTexture`を出力先にする場合、動画撮影の`MediaRecorder`とかはまた別）  
詳しくはこのへん↓

https://developer.android.com/reference/android/hardware/camera2/CameraDevice#createCaptureSession(android.hardware.camera2.params.SessionConfiguration)

縦持ちだとしても、横だと考えて解像度を入れる必要があるそうです。  
縦だから`1280x720`を`720x1280`にする必要はない、横のまま入れて縦で使えば勝手に縦になる（？）

ちなみに利用可能な解像度は以下のように取得できます。`getOutputSizes`に入れればいいらしい。  

```kotlin
val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
val frontCameraId = cameraManager
    .cameraIdList
    .first { cameraId -> cameraManager.getCameraCharacteristics(cameraId).get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_FRONT }
cameraManager
    .getCameraCharacteristics(frontCameraId)
    .get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP)
    ?.getOutputSizes(SurfaceTexture::class.java)
    ?.forEach {
        println("${it.width}x${it.height}")
    }
```

別に`1280x720`みたいな、`16:9`以外にも正方形とかが選べたはずで、もし自撮りカメラを正方形で描画したい場合は、**ここと、OpenGL ES の行列を調整してみてください**。  
おそらく`Matrix.scaleM(mMVPMatrix, 0, 1.7f, 1f, 1f)`みたいなのをやればいいはずです（？）

`Camera2 API`を触るとまずぶつかるのがこのプレビューで、アスペクト比が歪んでぐちゃぐちゃになるのがセオリーですが、  
今回はここで出力サイズを決めて、かつ`SurfaceView`も`16:9`になるようにしているのでぐちゃぐちゃにはなりません。多分。。。

### カメラを管理するクラスを作る
`KomaDroidCameraManager`を作りました。  
カメラを管理するクラスです、今更ですが名前は何でもいいです。`Context`を使うので取っておいてください。

プレビュー表示用の`SurfaceView`、`OpenGL ES`用のスレッドのための`newSingleThreadContext`（2個ある理由は後述します）、  
前面背面カメラの`CameraDevice`、あとはコルーチン使いたいのでコルーチンスコープとかあります。

ついでに用意した材料を破棄する関数も用意しておきましょう、`Jetpack Compose`側から使わなくなった際に呼び出します。

```kotlin
/** カメラを開いたり、プレビュー用の SurfaceView を作ったり、静止画撮影したりする */
@OptIn(ExperimentalCoroutinesApi::class)
class KomaDroidCameraManager(private val context: Context) {
    private val scope = CoroutineScope(Dispatchers.Default + Job())
    private val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    private val cameraExecutor = Executors.newSingleThreadExecutor()

    /** 今のタスク（というか動画撮影）キャンセル用 */
    private var currentJob: Job? = null

    /** プレビュー用 OpenGL ES のスレッド */
    private val previewGlThreadDispatcher = newSingleThreadContext("PreviewGlThread")

    /** 録画用 OpenGL ES のスレッド */
    private val recordGlThreadDispatcher = newSingleThreadContext("RecordGlThread")

    /** 静止画撮影用[ImageReader] */
    private var imageReader: ImageReader? = null

    /** 録画用[OpenGlDrawPair] */
    private var recordOpenGlDrawPair: OpenGlDrawPair? = null

    /** 出力先 Surface */
    val surfaceView = SurfaceView(context)

    /** 破棄時に呼び出す。Activity の onDestroy とかで呼んでください。 */
    fun destroy() {
        scope.cancel()
        recordOpenGlDrawPair?.textureRenderer?.destroy()
        recordOpenGlDrawPair?.inputSurface?.destroy()
        previewGlThreadDispatcher.close()
        recordGlThreadDispatcher.close()
    }

    companion object {
        /** 横 */
        const val CAMERA_RESOLUTION_WIDTH = 720
        /** 縦 */
        const val CAMERA_RESOLUTION_HEIGHT = 1280
    }
}
```

#### newSingleThreadContext なんで2個あるの
今回`Mutex()`と同じくらい大活躍するのがこちら、`newSingleThreadContext`です。  

これは、新しく`Java`のスレッドを作り`Dispatcher`を返してくれます。  
`withContext() { }`や`CoroutineScope.launch() { }`の時に、この`Dispatcher`を渡すと、処理されるスレッドがさっき作った`Java`のスレッドになるというやつです。  

`Dispatchers.IO`とか`Dispatchers.Default`のように、メインスレッド以外のスレッドで処理される`Dispatcher`がいくつかあるのに、  
わざわざ新しく作るのはなぜ？と思いますよね。というわけで以下のコード。`Android`はあんまり関係ないですが、

```kotlin
fun main() {
    // テスト用なので runBlocking しています
    runBlocking {
        (0 until 100).map { i ->
            launch(Dispatchers.Default) {
                // どの Java のスレッドで処理されたかを見る
                println("Index = $i / CurrentThread = ${Thread.currentThread().name}")
            }
        }.joinAll() // 100個終わるのを待つ
    }
}
```

出力結果がこちらです。  
`Index`がぐちゃぐちゃなのは並列で処理したから仕方ないとして、`Dispatchers.Default`を指定すると`Java`のスレッドが複数存在していることがわかります。  
これはドキュメントにも書いてあって、少なくとも2つのスレッドが存在して、そのどちらかで処理されるらしいです。

```plaintext
Index = 90 / CurrentThread = DefaultDispatcher-worker-1
Index = 91 / CurrentThread = DefaultDispatcher-worker-1
Index = 92 / CurrentThread = DefaultDispatcher-worker-1
Index = 93 / CurrentThread = DefaultDispatcher-worker-1
Index = 95 / CurrentThread = DefaultDispatcher-worker-3
Index = 98 / CurrentThread = DefaultDispatcher-worker-3
Index = 99 / CurrentThread = DefaultDispatcher-worker-3
Index = 94 / CurrentThread = DefaultDispatcher-worker-4
Index = 97 / CurrentThread = DefaultDispatcher-worker-2
Index = 96 / CurrentThread = DefaultDispatcher-worker-1
```

で、これの何が問題かと言うと、`OpenGL ES`は**コンテキストがスレッドに紐ついてる**んですよね。  
`OpenGL ES`の関数、`glDrawArrays()`とかを見てみると分かるんですが、この手の関数が全部`static`なんですよね。状態を持っていない。  

`static`なのにどうやって自分が描画すべき`OpenGL ES（EGL）`が分かるのかと言うと、`makeCurrent()`を呼び出したスレッドに紐ついてるコンテキストに対して描画をする。から。  
つまり`makeCurrent()`していないスレッドで`OpenGL ES`の関数を呼び出しても期待通りにはならない。スレッドに紐ついてるので。  

スレッドに紐ついてるので、↑のコルーチンの結果のような、起動する度にスレッドが変わると描画できなくなってしまうので、これだと困るわけです。  
そこで`newSingleThreadContext`です。新しくスレッドを作って、そのスレッドだけで処理を行う`Dispatcher`。  

```kotlin
fun main() {
    // テスト用なので runBlocking しています
    val singleThreadDispatcher = newSingleThreadContext("SingleThreadDispatcher")
    runBlocking {
        (0 until 100).map { i ->
            launch(singleThreadDispatcher) {
                // どの Java のスレッドで処理されたかを見る
                println("Index = $i / CurrentThread = ${Thread.currentThread().name}")
            }
        }.joinAll() // 100個終わるのを待つ
    }
}
```

```plaintext
Index = 90 / CurrentThread = SingleThreadDispatcher
Index = 91 / CurrentThread = SingleThreadDispatcher
Index = 92 / CurrentThread = SingleThreadDispatcher
Index = 93 / CurrentThread = SingleThreadDispatcher
Index = 94 / CurrentThread = SingleThreadDispatcher
Index = 95 / CurrentThread = SingleThreadDispatcher
Index = 96 / CurrentThread = SingleThreadDispatcher
Index = 97 / CurrentThread = SingleThreadDispatcher
Index = 98 / CurrentThread = SingleThreadDispatcher
Index = 99 / CurrentThread = SingleThreadDispatcher
```

これで作った`Dispatcher`を指定して`withContext`や`launch`すれば、同じスレッドで処理できることが約束されているので、`OpenGL ES`も怖くない！！！！！
以上！`newSingleThreadContext`でした。

## カメラを開く
### カメラID
まずはカメラの`ID`を取得するところから。  
最近のスマホにはカメラが複数ついてますが、開発的に見ると一つのカメラとしてみることが出来ます（古い Android でそれが使えるかはわからない）  
多分個別で広角だけ！とかも出来るんじゃないかなあ、、、  

一つのカメラとしてみるので、超広角・広角・望遠の切り替えは`Camera2 API`のズームする関数で自動的に選ばれる。だったはず。

```kotlin
/** フロントカメラの ID を返す */
private fun getFrontCameraId(): String = cameraManager
    .cameraIdList
    .first { cameraId -> cameraManager.getCameraCharacteristics(cameraId).get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_FRONT }

/** バックカメラの ID を返す */
private fun getBackCameraId(): String = cameraManager
    .cameraIdList
    .first { cameraId -> cameraManager.getCameraCharacteristics(cameraId).get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_BACK }
```

### openCamera
次にカメラを開く処理です。  
`onOpened`以外にもコールバックがあり、また、状態によって複数回コールバック関数が呼ばれるため、`suspendCancellableCoroutine`じゃなくて`Flow`にする必要があります。複数回返せるやつ。  
`Flow`で、カメラが使える時は`CameraDevice`、使えない場合は`null`を`Flow`経由でもらいます。

それと`openCamera`、コールバックだけじゃなくて、関数自体も例外を投げる場合があり、多分`try-catch`しないとダメです。

[CameraManager#openCamera(java.lang.String, android.hardware.camera2.CameraDevice.StateCallback, android.os.Handler)](https://developer.android.com/reference/android/hardware/camera2/CameraManager#openCamera(java.lang.String,%20android.hardware.camera2.CameraDevice.StateCallback,%20android.os.Handler))

お気持ち程度に`CameraDevice`を`close`しています。必要かは分からない。

```kotlin
/**
 * カメラを開く
 * 開くのに成功したら[CameraDevice]を流します。失敗したら null を流します。
 *
 * @param cameraId 起動したいカメラ
 */
@SuppressLint("MissingPermission")
private fun openCameraFlow(cameraId: String) = callbackFlow {
    var _cameraDevice: CameraDevice? = null
    cameraManager.openCamera(cameraId, cameraExecutor, object : CameraDevice.StateCallback() {
        override fun onOpened(camera: CameraDevice) {
            _cameraDevice = camera
            trySend(camera)
        }

        override fun onDisconnected(camera: CameraDevice) {
            _cameraDevice = camera
            camera.close()
            trySend(null)
        }

        override fun onError(camera: CameraDevice, error: Int) {
            _cameraDevice = camera
            camera.close()
            trySend(null)
        }
    })
    awaitClose { _cameraDevice?.close() }
}
```

### openCameraFlow を呼び出す
`openCamera`を呼び出します。`Flow`なので、どこかで購読している必要があるのですが、  
今回は普通に`collect { }`するのではなく、`ホットフロー`に変換して常に動かしておこうかなと。

`openCamera`は`callbackFlow { }`なので、末端で`collect()`されるまで`callbackFlow { }`は動かない（ブロック内の処理が実行されない）のですが。  
プレビュー、写真撮影、動画撮影で同じ`CameraDevice`を使いまわしたいので、どこかで`collect()`しないといけません。  
この収集されるまで動かない、収集される度に起動するタイプの`Flow`を`コールドフロー`とかいいますね。  

ただ、今回のこのような一回だけしか`Flow`を作れない場合（`openCamera`は一回呼び出して後は使い回す）や、  
高コストで`collect()`の度に起動されると困る場合（インターネット通信が伴う等）の対処法があります。  
それが常に動かしておくタイプの`Flow`、`ホットフロー`に変換する技です。  

`stateIn()`か`sharedIn()`を使えばいいのですが、今回は`stateIn()`を使います。  
`stateIn`だと`StateFlow`に出来ます。これは`SharedFlow`と違い、常に最新の値を持っていてくれます。`Android`の`LiveData`のそれと同じです。ちなみに`Flow`は`Kotlin`で書かれてるので`null安全`です。  
最新の値、つまりここでは`CameraDevice`を保持してもらうことで、プレビュー、静止画撮影、動画撮影で同じ`CameraDevice`を使い回せるわけです。  

最新の値を持つ関係で、初期値を渡す必要があります。まあ`null`で。

```kotlin
/** 前面カメラ */
private val frontCameraFlow = openCameraFlow(getFrontCameraId()).stateIn(
    scope = scope,
    started = SharingStarted.Eagerly,
    initialValue = null
)

/** 背面カメラ */
private val backCameraFlow = openCameraFlow(getBackCameraId()).stateIn(
    scope = scope,
    started = SharingStarted.Eagerly,
    initialValue = null
)
```

もちろん、どこか、`init { }`とかで`collect`して、収集された`CameraDevice`をフィールドに保持するとかでもいいのですが、こっちのが綺麗にかけそう。  

```kotlin
// これでもいいけど、stateIn で変換するのが良さそう
var cameraDevice: CameraDevice? = null

openCameraFlow(getFrontCameraId()).collect { cameraDevice = it }
```

### createCaptureSession
最後に、キャプチャーセッション？がこれまた非同期なので、コルーチンで書けるようにします。  
多分こっちは一回だけ`onConfigured`か`onConfigureFailed`のどっちかが呼ばれる、、はず。

```kotlin
/**
 * [SessionConfiguration]が非同期なので、コルーチンで出来るように
 *
 * @param outputSurfaceList 出力先[Surface]
 */
private suspend fun CameraDevice.awaitCameraSessionConfiguration(
    outputSurfaceList: List<Surface>
) = suspendCancellableCoroutine { continuation ->
    // OutputConfiguration を作る
    val outputConfigurationList = outputSurfaceList.map { surface -> OutputConfiguration(surface) }
    val backCameraSessionConfiguration = SessionConfiguration(SessionConfiguration.SESSION_REGULAR, outputConfigurationList, cameraExecutor, object : CameraCaptureSession.StateCallback() {
        override fun onConfigured(captureSession: CameraCaptureSession) {
            continuation.resume(captureSession)
        }

        override fun onConfigureFailed(p0: CameraCaptureSession) {
            continuation.resume(null)
        }
    })
    createCaptureSession(backCameraSessionConfiguration)
}
```

## OpenGL ES 周りを書く

### OpenGlDrawPair
次は`AOSP`からお借りしてきた`InputSurface`、`KomaDroidCameraTextureRenderer`を持つだけのクラスをまず作ります。  
`InputSurface`、`TextureRenderer`をただデータクラスにいれるだけです。扱いがちょっと楽になると言うか、引数取るときが楽になる程度です

```kotlin
/**
 * OpenGL ES 描画のための2点セット。
 * [InputSurface]、[KomaDroidCameraTextureRenderer]を持っているだけ。
 */
private data class OpenGlDrawPair(
    val inputSurface: InputSurface,
    val textureRenderer: KomaDroidCameraTextureRenderer
)
```

### createOpenGlDrawPair
次はこの`OpenGlDrawPair`を作る処理です。  
引数はプレビューなら`SurfaceView`の`SurfaceView#holder#surface`、静止画撮影なら`ImageReader#surface`ですね。  

`OpenGL ES`周りは`OpenGL ES`用に作ったスレッド（Kotlin コルーチンだと`Dispatcher`）内で呼び出すように。必須です。  
プレビュー用の`OpenGL ES`なら`previewGlThreadDispatcher`、録画用の`OpenGL ES`なら`recordGlThreadDispatcher`。

```kotlin
/**
 * [surface]を受け取って、[OpenGlDrawPair]を作る
 * この関数は[previewGlThreadDispatcher]や[recordGlThreadDispatcher]等、OpenGL 用スレッドの中で呼び出す必要があります。
 *
 * @param surface 描画先
 * @return [OpenGlDrawPair]
 */
private fun createOpenGlDrawPair(surface: Surface): OpenGlDrawPair {
    val inputSurface = InputSurface(surface)
    val textureRenderer = KomaDroidCameraTextureRenderer()
    // スレッド切り替え済みなはずなので
    inputSurface.makeCurrent()
    textureRenderer.createShader()
    // カメラ映像の解像度
    // 縦持ちだとしても、横のまま入れればいいらしい
    // https://developer.android.com/reference/android/hardware/camera2/CameraDevice#createCaptureSession(android.hardware.camera2.params.SessionConfiguration)
    textureRenderer.setSurfaceTextureSize(width = CAMERA_RESOLUTION_HEIGHT, height = CAMERA_RESOLUTION_WIDTH)
    return OpenGlDrawPair(inputSurface, textureRenderer)
}
```

そしたら、静止画撮影の`ImageReader`と`ImageReader`に対して`OpenGL ES`で描画できるように初期化するやつを作ります。  
繰り返しになりますが、`createOpenGlDrawPair`を録画用の`Dispatcher`で呼び出すの、忘れないで。

```kotlin
/** 静止画モードの初期化 */
private suspend fun initPictureMode() {
    imageReader = ImageReader.newInstance(
        CAMERA_RESOLUTION_WIDTH,
        CAMERA_RESOLUTION_HEIGHT,
        PixelFormat.RGBA_8888,
        2
    )
    // 描画を OpenGL に、プレビューと同じ
    recordOpenGlDrawPair = withContext(recordGlThreadDispatcher) {
        createOpenGlDrawPair(surface = imageReader!!.surface)
    }
}
```

### renderOpenGl
次は`OpenGL ES`で描画する処理です。  
`AOSP`からコピペしてきた`draw()`とか`swapBuffers()`とかを呼び出します。  
これもスレッドはちゃんと意識しないとダメです。それ用のスレッドに切り替えてあげましょう。

```kotlin
/**
 * [OpenGlDrawPair]を使って描画する。
 * スレッド注意です！！！。[previewGlThreadDispatcher]や[recordGlThreadDispatcher]から呼び出す必要があります。
 *
 * @param drawPair プレビューとか
 */
private suspend fun renderOpenGl(drawPair: OpenGlDrawPair) {
    if (drawPair.textureRenderer.isAvailableFrontCameraFrame() || drawPair.textureRenderer.isAvailableBackCameraFrame()) {
        // カメラ映像テクスチャを更新して、描画
        drawPair.textureRenderer.updateFrontCameraTexture()
        drawPair.textureRenderer.updateBackCameraTexture()
        drawPair.textureRenderer.draw()
        drawPair.inputSurface.swapBuffers()
    }
}
```

### プレビューを OpenGL ES で描画する用意
プレビューを作る準備です。  
やることは`SurfaceView`で`OpenGL ES`が使えるようにする。（静止画撮影の`ImageReader`のそれと同じ）  

なんですけど、`SurfaceView`はコールバックを待たないと使えない。  
生成コールバック、破棄コールバックに応じて`OpenGL ES`周りの生成と破棄をしなくちゃいけなくて、`ImageReader#surface`みたいなすぐ使えるわけじゃなくて厳しい。

これもまずはコールバックを`Flow`に変換するところから始めましょう。  
コールバックで`SurfaceView`の用意ができたら、今度は`createOpenGlDrawPair`を呼び出してプレビューの`OpenGL ES`用意もします。  

また、カメラを開く関数と同様に、`stateIn`しています。  
`stateIn`が何なのかは`openCameraFlow`関数作るところでちらっと話したのでそっちで。  

これは全体でプレビュー`OpenGL ES`を一回作って使い回すというのもあるのですが、それよりも`SurfaceView`のこのコールバックがいつ呼ばれるか分からない。  
分からないのでとにかく作ったら速攻コールバックを追加して`Flow`で監視することにします。`SurfaceView`が用意済みの場合だと`addCallback`しても`surfaceCreated()`呼んでくれなさそうな雰囲気なのでスピード勝負。  
コールバック自体は多分`addView`とかで`View`に追加されたら呼ばれそうではあります。

```kotlin
/**
 * [SurfaceView]へ OpenGL で描画できるやつ。
 * ただ、[SurfaceView]は生成と破棄の非同期コールバックを待つ必要があるため、このような[Flow]を使う羽目になっている。
 * これは[OpenGlDrawPair]の生成までしかやっていないので、破棄は使う側で頼みました。
 *
 * また、[stateIn]でホットフローに変換し、[SurfaceView]のコールバックがいつ呼ばれても大丈夫にする。
 * [callbackFlow]はコールドフローで、collect するまで動かない、いつコールバックが呼ばれるかわからないため、今回はホットフローに変換している。
 */
private val previewOpenGlDrawPairFlow = callbackFlow {
    val callback = object : SurfaceHolder.Callback {
        override fun surfaceCreated(holder: SurfaceHolder) {
            trySend(holder)
        }

        override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
            // do nothing
        }

        override fun surfaceDestroyed(holder: SurfaceHolder) {
            trySend(null)
        }
    }
    surfaceView.holder.addCallback(callback)
    awaitClose { surfaceView.holder.removeCallback(callback) }
}.map { holder ->
    // OpenGL ES のセットアップ
    val surface = holder?.surface
    if (surface != null) {
        withContext(previewGlThreadDispatcher) {
            createOpenGlDrawPair(surface)
        }
    } else null
}.stateIn(
    scope = scope,
    started = SharingStarted.Eagerly,
    initialValue = null
)
```

### prepare 関数
を書きます。  
この中に、プレビュー、静止画撮影、動画撮影で共通する処理を書きます。  
とりあえずは`initPictureMode()`を呼ぶだけで。

```kotlin
/** 用意をする */
fun prepare() {
    scope.launch {
        // 静止画撮影の用意
        initPictureMode()
    }
}
```

### プレビューを描画する
次は`OpenGL ES`でカメラのプレビューを描画する処理を書きます。  
`OpenGL ES`の描画する関数とかを`prepare()`内に書きます。これはプレビュー、静止画撮影、動画撮影で共通なので。

ここでやってるのはプレビューの描画と破棄だけですね。  
静止画撮影の`ImageReader`とか、動画撮影の`MediaRecorder`に対して描画・破棄する処理はまた別に書こうかなと。

プレビュー用`OpenGlDrawPair`をもらいます。これを`renderOpenGl`へ渡して、`while()`で繰り返し描画します。  
これがプレビューの描画。スレッド注意です。

ところで、`collectLatest { }`これは何なんだ。という話ですが、
`collect { }`と違って、`Flow`で次の値が来たときに、既存の処理に対してキャンセルしてくれます。  

普通に`collect { }`すると、値の数だけ`while`が起動してしまうことになります。今回は最新の`OpenGlDrawPair`を使って描画したい！！！  
そこで、`collectLatest { }`に置き換える。こうすると、前回の値で起動した`collectLatest { }`のブロックに対してキャンセルをしてくれます。  
キャンセルすると`isActive`が`false`になるので、以下のコードでは`finally`へ進みます。これで最新の値でのみ動く`while`ループが作れます。

あとは新しい`OpenGlDrawPair`が来たら、古い方は破棄しないといけないので、`finally`で破棄したかったってのもあります。  
`while`で描画→新しい`OpenGlDrawPair`が来る→キャンセルが投げられる→`finally`で古い`OpenGL ES`周りが破棄される→新しい`OpenGlDrawPair`で描画ループが始まる。

あと一点、キャンセル投げられた後は`withContext() { }`が使えません。  
`withContext`に関しては`NonCancellable`を引数に渡すことで、キャンセル後も動かす必要のある処理（リソース開放、クリーンアップ処理）が出来ます。  
が、キャンセル命令を無視して処理することになるので、最小限にするべきです。  

```kotlin
/** 用意をする */
fun prepare() {
    scope.launch {
        // 静止画撮影の用意
        initPictureMode()

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
    }
}
```

## 繋ぎこみをしてプレビューを映す
ここまで、プレビューの描画ループとかは完成しましたが、まだカメラの処理と、`OpenGL ES`の処理の繋ぎこみをしていないので、何も映りません。  
繋ぎ込んでいきます。

前面カメラ、背面カメラ、プレビュー用`OpenGL ES`のやつ、全部非同期。非同期はしんどいので`Flow`です。  
`Flow`にしたおかげで強力な関数が使えます。`combine()`です。

`combine()`のお友達が何個がありますが、今回はこれ。`Flow`を取る可変長引数と変換する関数で出来ています。  
引数に渡した`Flow`の、それぞれ最後の値を、変換する関数の引数として呼び出し、返り値を`Flow`で流してくれます。  
どれか一つの`Flow`に値が来ると、そのたびに変換する関数を呼んでくれます。値が変化していない（来ていない）`Flow`に関しては最後の値を使います。  

いくつかお友達があるといいましたが、それらはこの値が来たときの挙動が違う。  
説明クソ下手なのでドキュメントみて。とりあえずは複数の`Flow`を変換して一つの`Flow`に出来るよってわかれば。  
https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/combine.html

今回は3つの`Flow`の値を受け取って`Triple`に変換して`Flow`に流しています。  
特に`null`チェックは`Flow`の中ではやってないので`collect { }`のところで見ています。全部 null 以外になるまで進みません。

あとは`Camera2 API`を叩いて前面カメラ、背面カメラの映像を`OpenGL ES`へ流しています。  
プレビュー描画は`prepare()`の`while`でやっているので、ここでは特に無いです。

```kotlin
/** プレビューを始める */
private fun startPreview() {
    scope.launch {
        // キャンセルして、コルーチンが終わるのを待つ
        currentJob?.cancelAndJoin()
        currentJob = launch {

            // カメラを開けるか
            // 全部非同期なので、Flow にした後、複数の Flow を一つにしてすべての準備ができるのを待つ。
            combine(
                frontCameraFlow,
                backCameraFlow,
                previewOpenGlDrawPairFlow
            ) { a, b, c -> Triple(a, b, c) }.collect { (frontCamera, backCamera, previewOpenGlDrawPair) ->

                // フロントカメラ、バックカメラ、プレビューの OpenGL ES がすべて準備完了になるまで待つ
                frontCamera ?: return@collect
                backCamera ?: return@collect
                previewOpenGlDrawPair ?: return@collect
                val recordOpenGlDrawPair = recordOpenGlDrawPair ?: return@collect

                // フロントカメラの設定
                // 出力先
                val frontCameraOutputList = listOfNotNull(
                    previewOpenGlDrawPair.textureRenderer.frontCameraInputSurface,
                    recordOpenGlDrawPair.textureRenderer.frontCameraInputSurface
                )
                val frontCameraCaptureRequest = frontCamera.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW).apply {
                    frontCameraOutputList.forEach { surface -> addTarget(surface) }
                }.build()
                val frontCameraCaptureSession = frontCamera.awaitCameraSessionConfiguration(frontCameraOutputList)
                frontCameraCaptureSession?.setRepeatingRequest(frontCameraCaptureRequest, null, null)

                // バックカメラの設定
                val backCameraOutputList = listOfNotNull(
                    previewOpenGlDrawPair.textureRenderer.backCameraInputSurface,
                    recordOpenGlDrawPair.textureRenderer.backCameraInputSurface
                )
                val backCameraCaptureRequest = backCamera.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW).apply {
                    backCameraOutputList.forEach { surface -> addTarget(surface) }
                }.build()
                val backCameraCaptureSession = backCamera.awaitCameraSessionConfiguration(backCameraOutputList)
                backCameraCaptureSession?.setRepeatingRequest(backCameraCaptureRequest, null, null)
            }
        }
    }
}
```

あとは起動したらまずプレビューに遷移するように、`prepare()`で呼び出します。  

```kotlin
/** 用意をする */
fun prepare() {
    scope.launch {

        // 以下省略...

        // プレビューを開始する
        startPreview()
    }
}
```

## CameraScreen に設置する
空っぽの`CameraScreen`に手を入れます。  
`SurfaceView`、作っただけで画面に追加してないので追加します。  
`CameraScreen`で`KomaDroidCameraManager`のインスタンスを作って、`AndroidView`で`SurfaceView`を追加します。

```kotlin
/** カメラ画面 */
@Composable
fun CameraScreen() {
    val context = LocalContext.current
    val cameraManager = remember { KomaDroidCameraManager(context) }

    // カメラを開く、Composable が破棄されたら破棄する
    DisposableEffect(key1 = Unit) {
        cameraManager.prepare()
        onDispose { cameraManager.destroy() }
    }

    Box(modifier = Modifier.fillMaxSize()) {

        // OpenGL ES を描画する SurfaceView
        // アスペクト比
        AndroidView(
            modifier = Modifier
                .align(Alignment.Center)
                .fillMaxWidth()
                .aspectRatio(KomaDroidCameraManager.CAMERA_RESOLUTION_WIDTH / KomaDroidCameraManager.CAMERA_RESOLUTION_HEIGHT.toFloat()),
            factory = { cameraManager.surfaceView }
        )

        Button(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 50.dp),
            onClick = { /* TODO この後すぐ */ }
        ) { Text(text = "写真撮影") }
    }
}
```

そして実行してみる、、、、  
どうでしょう？？？プレビューでた？

![Imgur](https://i.imgur.com/3B3eZdg.png)

## 静止画撮影を追加
### ImageReader から画像を取る
まずは静止画撮影の`ImageReader`から画像を取り出して保存する処理を。  
`ImageReader`のモードが`RGBA_8888`なのでこれで動きますが、`JPEG`とかはまた別の処理だと思います。

この辺は前回の記事と同じですね。謎の余白を消す処理も健在。

```kotlin
/** [ImageReader]から写真を取り出して、端末のギャラリーに登録する拡張関数。 */
private suspend fun ImageReader.saveJpegImage() = withContext(Dispatchers.IO) {
    val image = acquireLatestImage()
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
    val editBitmap = Bitmap.createBitmap(readBitmap, 0, 0, CAMERA_RESOLUTION_WIDTH, CAMERA_RESOLUTION_HEIGHT)
    readBitmap.recycle()
    // ギャラリーに登録する
    val contentResolver = context.contentResolver
    val contentValues = contentValuesOf(
        MediaStore.Images.Media.DISPLAY_NAME to "${System.currentTimeMillis()}.jpg",
        MediaStore.Images.Media.RELATIVE_PATH to "${Environment.DIRECTORY_PICTURES}/KomaDroid"
    )
    val uri = contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues) ?: return@withContext
    contentResolver.openOutputStream(uri)?.use { outputStream ->
        editBitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
    }
    // 開放
    editBitmap.recycle()
    image.close()
}
```

### 静止画撮影用 Camera2 API
静止画撮影の場合は、カメラのセットアップが若干変わって、  
`CameraDevice.TEMPLATE_STILL_CAPTURE`と、`CameraCaptureSession#capture`を呼び出します。どちらも一回ポッキリ撮影するのに最適化したモード（らしい）です。  

プレビューと違って、静止画撮影は短時間で終わるので、`combine()`で`Flow`を監視したりはしません！  
プレビューの場合は長い時間使われるので、`プレビュー OpenGL`やカメラが使えなくなったら再起動出来るよう`collect`してましたが、すぐ終わるので`first()`で取って終わりにします。

```kotlin
/**
 * 静止画撮影する
 * 静止画撮影用に[CameraDevice.TEMPLATE_STILL_CAPTURE]と[CameraCaptureSession.capture]が使われます。
 */
fun takePicture() {
    scope.launch {
        // キャンセルして、コルーチンが終わるのを待つ
        currentJob?.cancelAndJoin()
        currentJob = launch {

            // 用意が揃うまで待つ
            val frontCamera = frontCameraFlow.filterNotNull().first()
            val backCamera = backCameraFlow.filterNotNull().first()
            val previewOpenGlDrawPair = previewOpenGlDrawPairFlow.filterNotNull().first()
            val recordOpenGlDrawPair = recordOpenGlDrawPair!!

            // フロントカメラの設定
            // 出力先
            val frontCameraOutputList = listOfNotNull(
                previewOpenGlDrawPair.textureRenderer.frontCameraInputSurface,
                recordOpenGlDrawPair.textureRenderer.frontCameraInputSurface
            )
            val frontCameraCaptureRequest = frontCamera.createCaptureRequest(CameraDevice.TEMPLATE_STILL_CAPTURE).apply {
                frontCameraOutputList.forEach { surface -> addTarget(surface) }
            }.build()
            val frontCameraCaptureSession = frontCamera.awaitCameraSessionConfiguration(frontCameraOutputList)
            frontCameraCaptureSession?.capture(frontCameraCaptureRequest, null, null)

            // バックカメラの設定
            val backCameraOutputList = listOfNotNull(
                previewOpenGlDrawPair.textureRenderer.backCameraInputSurface,
                recordOpenGlDrawPair.textureRenderer.backCameraInputSurface
            )
            val backCameraCaptureRequest = backCamera.createCaptureRequest(CameraDevice.TEMPLATE_STILL_CAPTURE).apply {
                backCameraOutputList.forEach { surface -> addTarget(surface) }
            }.build()
            val backCameraCaptureSession = backCamera.awaitCameraSessionConfiguration(backCameraOutputList)
            backCameraCaptureSession?.capture(backCameraCaptureRequest, null, null)

            // ImageReader に描画する
            withContext(recordGlThreadDispatcher) {
                renderOpenGl(recordOpenGlDrawPair)
            }
            // ImageReader で取り出す
            imageReader?.saveJpegImage()

            // 撮影したらプレビューに戻す
            withContext(Dispatchers.Main) {
                Toast.makeText(context, "撮影しました", Toast.LENGTH_SHORT).show()
            }
            startPreview()
        }
    }
}
```

あとは`Jetpack Compose`側で、ボタンを押したときに`takePicture()`を呼べば完成。  
保存先は写真フォルダ。`DCIM`じゃなくて`Pictures`っぽいです（何が違うのかよく分からない）。`Google フォト`とかで見れるはず。  

```kotlin
Button(
    modifier = Modifier
        .align(Alignment.BottomCenter)
        .padding(bottom = 50.dp),
    onClick = { cameraManager.takePicture() } // ←ここ
) { Text(text = "写真撮影") }
```

ちなみに盾持ちなら問題ないですが、横で撮影すると回転状態になってしまいます・・・  
`Bitmap`を回転すれば良いのでしょうが、、、面倒なので今回は無しで。  

`Camera2 API`と`ImageReader`の組み合わせなら、`CaptureRequest.JPEG_ORIENTATION`で回転できるらしい（使ったこと無い）ですが、  
今回は`OpenGL ES`で描画した内容を`ImageReader`で撮影しているのでその方法は使えないと思います。愚直に`Bitmap`を回転させないとダメそう。

![Imgur](https://i.imgur.com/8CKqVCf.png)

## 動画撮影も付ける
### 引数追加
`KomaDroidCameraManager`に録画機能も付けます。  
同じクラスに静止画撮影と動画撮影が混在する（しかもどちらかしか使えない）のでなんとかしたほうがいいですが。今回は動くところ最優先なのでやりません！  

クラスのコンストラクタ引数に、どっちのモードで使うかを決めます。  
それ用の`enum`も作りました

```kotlin
class KomaDroidCameraManager(
    private val context: Context,
    private val mode: CaptureMode // これ
) {

    /** 静止画撮影 or 録画 */
    enum class CaptureMode {
        /** 静止画撮影 */
        PICTURE,

        /** 録画 */
        VIDEO
    }
}
```

### MediaRecorder の用意
つぎに、`ImageReader`と同じように、`MediaRecorder`を作ります。  
録画用ですね。静止画撮影とクラスを分けなかったせいでぐちゃぐちゃになってきました。あと別に`MediaCodec`でも動くと思いますがクソ難しくなると思います。

```kotlin
/** 静止画撮影用[ImageReader] */
private var imageReader: ImageReader? = null

// 下2つを足す

/** 録画用の[MediaRecorder] */
private var mediaRecorder: MediaRecorder? = null

/** 録画保存先 */
private var saveVideoFile: File? = null
```

次に、`MediaRecorder`を初期化する関数を書きます。  
`ImageReader`のやつを`MediaRecorder`にしただけ。出力先ファイルを初期化時に決めないといけないので、一時的に`getExternalFilesDir`に保存するようにしています。  
録画終了時に端末の動画フォルダへ移動させます。

映像コーデックが`H.264`なので高めのビットレートで（これでもまだ低いかも。`1280x720`なのでまあこれでも。）  
別に`H.265 (HEVC)`とかでも良いのよ、使っても大丈夫なら。`VP9`は使っても問題ないはず。`AV1`は`Pixel 8`シリーズにしかハードウェアエンコーダーが無いからまだ厳しい！

```kotlin
/** 録画モードの初期化 */
private suspend fun initVideoMode() {
    mediaRecorder = (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) MediaRecorder(context) else MediaRecorder()).apply {
        setAudioSource(MediaRecorder.AudioSource.MIC)
        setVideoSource(MediaRecorder.VideoSource.SURFACE)
        setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
        setVideoEncoder(MediaRecorder.VideoEncoder.H264)
        setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
        setAudioChannels(2)
        setVideoEncodingBitRate(3_000_000) // H.264 なので高めに
        setVideoFrameRate(30)
        setVideoSize(CAMERA_RESOLUTION_WIDTH, CAMERA_RESOLUTION_HEIGHT)
        setAudioEncodingBitRate(128_000)
        setAudioSamplingRate(44_100)
        // 一時的に getExternalFilesDir に保存する
        saveVideoFile = File(context.getExternalFilesDir(null), "${System.currentTimeMillis()}.mp4")
        setOutputFile(saveVideoFile!!)
        prepare()
    }
    // 描画を OpenGL に、プレビューと同じ
    recordOpenGlDrawPair = withContext(recordGlThreadDispatcher) {
        createOpenGlDrawPair(surface = mediaRecorder!!.surface)
    }
}
```

次に、`prepare()`関数を書き直してモード別に初期化処理を分岐させます。  
`initVideoMode()`が増えただけ、

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

        // プレビューを開始する
        startPreview()
    }
}
```

### 録画開始処理、終了処理
次、録画開始処理と終了処理を書きます。  
一応動画撮影に向いた`CameraDevice.TEMPLATE_RECORD`にしてみました。  

プレビューと大体同じで、違うのは`MediaRecorder#start`している点ですね。  
`finally`で録画終了処理をしています。`cancel()`されたときか、`collectLatest`から新しい値が来たときですかね。  
`collectLatest`なので、カメラ開けなくなった、プレビューがだめになったとかで`null`が来たとしても、録画中の処理に対してキャンセルを投げてくれるので、`finally`で保存されるんじゃないかなーと。  

コルーチンがキャンセルされた場合、新しくコルーチンが作れないので`withContext`と`NonCancellable`を使う必要があります、  
が、これも先述しましたが、終了処理のみで使うに留めておいてね、むやみやたらに使うべきじゃないです。多分。  

`MediaRecorder`を作り直して、`startPreview`を呼んでプレビューへ戻してあげます。  
`stop`したら作り直さないといけないので。関数にしておいてよかった`MediaRecorder`の初期化処理。

イマイチな点としては、動画フォルダへ動画ファイルが移動し終わるまでプレビューに戻らない点ですね。面倒なのでやりませんが。  

```kotlin
/**
 * 動画撮影をする
 * 静止画撮影用に[CameraDevice.TEMPLATE_RECORD]と[CameraCaptureSession.setRepeatingRequest]が使われます。
 */
fun startRecordVideo() {
    scope.launch {
        // キャンセルして、コルーチンが終わるのを待つ
        currentJob?.cancelAndJoin()
        currentJob = launch {

            // カメラを開けるか
            // 全部非同期なのでコールバックを待つ
            combine(
                frontCameraFlow,
                backCameraFlow,
                previewOpenGlDrawPairFlow
            ) { a, b, c -> Triple(a, b, c) }.collectLatest { (frontCamera, backCamera, previewOpenGlDrawPair) ->

                // フロントカメラ、バックカメラ、プレビューの OpenGL ES がすべて準備完了になるまで待つ
                frontCamera ?: return@collectLatest
                backCamera ?: return@collectLatest
                previewOpenGlDrawPair ?: return@collectLatest
                val recordOpenGlDrawPair = recordOpenGlDrawPair ?: return@collectLatest

                // フロントカメラの設定
                // 出力先
                val frontCameraOutputList = listOfNotNull(
                    previewOpenGlDrawPair.textureRenderer.frontCameraInputSurface,
                    recordOpenGlDrawPair.textureRenderer.frontCameraInputSurface
                )
                val frontCameraCaptureRequest = frontCamera.createCaptureRequest(CameraDevice.TEMPLATE_RECORD).apply {
                    frontCameraOutputList.forEach { surface -> addTarget(surface) }
                }.build()
                val frontCameraCaptureSession = frontCamera.awaitCameraSessionConfiguration(frontCameraOutputList)
                frontCameraCaptureSession?.setRepeatingRequest(frontCameraCaptureRequest, null, null)

                // バックカメラの設定
                val backCameraOutputList = listOfNotNull(
                    previewOpenGlDrawPair.textureRenderer.backCameraInputSurface,
                    recordOpenGlDrawPair.textureRenderer.backCameraInputSurface
                )
                val backCameraCaptureRequest = backCamera.createCaptureRequest(CameraDevice.TEMPLATE_RECORD).apply {
                    backCameraOutputList.forEach { surface -> addTarget(surface) }
                }.build()
                val backCameraCaptureSession = backCamera.awaitCameraSessionConfiguration(backCameraOutputList)
                backCameraCaptureSession?.setRepeatingRequest(backCameraCaptureRequest, null, null)

                // 録画開始
                mediaRecorder?.start()
                try {
                    // MediaRecorder に OpenGL ES で描画
                    // 録画中はループするのでこれ以降の処理には進まない
                    withContext(recordGlThreadDispatcher) {
                        while (isActive) {
                            renderOpenGl(recordOpenGlDrawPair)
                        }
                    }
                } finally {
                    // 録画終了処理
                    // stopRecordVideo を呼び出したときか、collectLatest から新しい値が来た時
                    // キャンセルされた後、普通ならコルーチンが起動できない。
                    // NonCancellable を付けることで起動できるが、今回のように終了処理のみで使いましょうね
                    withContext(NonCancellable) {
                        mediaRecorder?.stop()
                        mediaRecorder?.release()
                        // 動画ファイルを動画フォルダへコピーさせ、ファイルを消す
                        withContext(Dispatchers.IO) {
                            val contentResolver = context.contentResolver
                            val contentValues = contentValuesOf(
                                MediaStore.Images.Media.DISPLAY_NAME to saveVideoFile!!.name,
                                MediaStore.Images.Media.RELATIVE_PATH to "${Environment.DIRECTORY_MOVIES}/KomaDroid"
                            )
                            val uri = contentResolver.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, contentValues)!!
                            saveVideoFile!!.inputStream().use { inputStream ->
                                contentResolver.openOutputStream(uri)?.use { outputStream ->
                                    inputStream.copyTo(outputStream)
                                }
                            }
                            saveVideoFile!!.delete()
                        }
                        // MediaRecorder は stop したら使えないので、MediaRecorder を作り直してからプレビューに戻す
                        initVideoMode()
                        startPreview()
                    }
                }
            }
        }
    }
}

/** [startRecordVideo]を終了する */
fun stopRecordVideo() {
    // startRecordVideo の finally に進みます
    currentJob?.cancel()
}
```

最後に`Jetpack Compose`側から呼び出して終わりです。  
静止画撮影と動画撮影で`KomaDroidCameraManager`を分けたので、画面も分けることにしました。その結果がこちらです。

切り替えボタンも追加しました。`Material3`の`SegmentedButton`です。アニメーションされて綺麗。  
切り替えボタンを押すと、それぞれの画面へ切り替わります。`KomaDroidCameraManager`も再生成されます。

録画中か知るすべを用意しそこねたので雑に画面の方においておきました。  
本当は`KomaDroidCameraManager`が提供すべきですね。

録画画面の方は録画中に応じて`startRecordVideo / stopRecordVideo`を分岐させます。  
それ以外は静止画撮影と同じレイアウトですね。

```kotlin
/** カメラ画面 */
@Composable
fun CameraScreen() {
    val context = LocalContext.current
    // 静止画撮影 or 動画撮影
    val currentMode = remember { mutableStateOf(KomaDroidCameraManager.CaptureMode.PICTURE) }

    Box(modifier = Modifier.fillMaxSize()) {

        // 静止画モード・動画撮影モード
        when (currentMode.value) {
            KomaDroidCameraManager.CaptureMode.PICTURE -> PictureModeScreen()
            KomaDroidCameraManager.CaptureMode.VIDEO -> VideoModeScreen()
        }

        // 切り替えボタン
        SwitchModeButton(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .statusBarsPadding(),
            currentMode = currentMode.value,
            onSelect = { currentMode.value = it }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SwitchModeButton(
    modifier: Modifier = Modifier,
    currentMode: KomaDroidCameraManager.CaptureMode,
    onSelect: (KomaDroidCameraManager.CaptureMode) -> Unit
) {
    SingleChoiceSegmentedButtonRow(modifier = modifier) {
        KomaDroidCameraManager.CaptureMode.entries.forEachIndexed { index, mode ->
            SegmentedButton(
                selected = mode == currentMode,
                onClick = { onSelect(mode) },
                shape = SegmentedButtonDefaults.itemShape(
                    index = index,
                    count = KomaDroidCameraManager.CaptureMode.entries.size
                )
            ) {
                Text(text = mode.name)
            }
        }
    }
}

@Composable
private fun PictureModeScreen() {
    val context = LocalContext.current
    val cameraManager = remember { KomaDroidCameraManager(context, KomaDroidCameraManager.CaptureMode.PICTURE) }

    // カメラを開く、Composable が破棄されたら破棄する
    DisposableEffect(key1 = Unit) {
        cameraManager.prepare()
        onDispose { cameraManager.destroy() }
    }

    Box(modifier = Modifier.fillMaxSize()) {

        // OpenGL ES を描画する SurfaceView
        // アスペクト比
        AndroidView(
            modifier = Modifier
                .align(Alignment.Center)
                .fillMaxWidth()
                .aspectRatio(KomaDroidCameraManager.CAMERA_RESOLUTION_WIDTH / KomaDroidCameraManager.CAMERA_RESOLUTION_HEIGHT.toFloat()),
            factory = { cameraManager.surfaceView }
        )

        Button(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 50.dp),
            onClick = { cameraManager.takePicture() }
        ) { Text(text = "写真撮影") }
    }
}

@Composable
private fun VideoModeScreen() {
    val context = LocalContext.current
    val cameraManager = remember { KomaDroidCameraManager(context, KomaDroidCameraManager.CaptureMode.VIDEO) }

    // 仮でここに置かせて
    val isRecording = remember { mutableStateOf(false) }

    // カメラを開く、Composable が破棄されたら破棄する
    DisposableEffect(key1 = Unit) {
        cameraManager.prepare()
        onDispose { cameraManager.destroy() }
    }

    Box(modifier = Modifier.fillMaxSize()) {

        // OpenGL ES を描画する SurfaceView
        // アスペクト比
        AndroidView(
            modifier = Modifier
                .align(Alignment.Center)
                .fillMaxWidth()
                .aspectRatio(KomaDroidCameraManager.CAMERA_RESOLUTION_WIDTH / KomaDroidCameraManager.CAMERA_RESOLUTION_HEIGHT.toFloat()),
            factory = { cameraManager.surfaceView }
        )

        Button(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 50.dp),
            onClick = {
                if (isRecording.value) {
                    cameraManager.stopRecordVideo()
                } else {
                    cameraManager.startRecordVideo()
                }
                isRecording.value = !isRecording.value
            }
        ) {
            Text(text = if (isRecording.value) "録画終了" else "録画開始")
        }
    }
}
```

こんな感じに切り替えボタンが出て、切り替えた後に録画ボタンを押せば撮影されるはず。  
保存先は動画フォルダです。これも`Google フォト`とかで見れるはず。

![Imgur](https://i.imgur.com/d5YBj5N.png)

`Material3`の`SegmentedButton`、いい感じ

# そーすこーど
https://github.com/takusan23/KomaDroid/tree/blog_code

ブランチ名`blog_code`のがそうです。ブログ記述時時点のコードがあります多分。

# おわりに
カメラアプリ開発はとてもとても大変。  
`OpenGL ES`周りの扱いががががが、割と`OpenGL ES`周りだけ結構書き直してる。  

# おまけ
https://github.com/takusan23/KomaDroid/commit/0c0abc8d01ce4ff25188f211601123db237b84c9

`OpenGL ES`周りの難しい部分を隠すことで、`OpenGL ES`の上に構築して`GPU`の性能を享受しつつ、他のアプリでも難しくない`API`を公開しよう。って考えてみた。仮です。  
`SurfaceTexture`（カメラ映像、動画のフレームデコード結果）を描画しつつ、`Canvas`で文字とかも書ける。さらにはエフェクトだって適用できる、みたいな。  
もしまともに使えそうならまた記事にしようかな。

```kotlin
val previewSurface = viewBinding.previewSurface.holder.surface

// OpenGL ES の上に構築された、映像を加工するやつ
val akariGraphicsProcessor = AkariGraphicsProcessor(
    outputSurface = previewSurface.surface,
    width = CAMERA_RESOLUTION_WIDTH,
    height = CAMERA_RESOLUTION_HEIGHT
)
akariGraphicsProcessor.prepare()

// カメラ映像を OpenGL のテクスチャとして利用できる SurfaceTexture を作る
val frontCameraTexture = akariGraphicsProcessor.genTextureId { texId -> AkariSurfaceTexture(texId) }
val backCameraTexture = akariGraphicsProcessor.genTextureId { texId -> AkariSurfaceTexture(texId) }

// エフェクト
val blurEffect = akariGraphicsProcessor.genEffect { AkariEffectFragmentShader(Shaders.BLUR) }

// カメラのセットアップ
// 省略...
frontCameraCaptureSession?.setRepeatingRequest(...)
backCameraCaptureSession?.setRepeatingRequest(...)

try {
    // 描画のループ
    akariGraphicsProcessor.drawLoop {
        // カメラ映像描画
        drawSurfaceTexture(backCameraTexture) { mvpMatrix ->
            // do nothing
        }
        drawSurfaceTexture(frontCameraTexture) { mvpMatrix ->
            // 小さくする
            Matrix.scaleM(mvpMatrix, 0, 0.3f, 0.3f, 0.3f)
        }
        // Canvas も重ねる
        drawCanvas {
            drawText("Camera Preview", 100f, 100f, paint)
        }
        // エフェクト
        textureRenderer.applyEffect(blurEffect)
    }
} finally {
    akariGraphicsProcessor.destroy()
}
```

# おわりに2
というわけで、`OpenGL ES`で描画したいとか、~~同時にカメラを開く~~（これは`CameraX`で出来るらしい）とか、静止画撮影対象が`OpenGL ES`、とかのマニアックな使い方をしない場合は、  
大人しく`CameraX`を頼ったほうが良いはずです。使ったこと無いので何もわからないですが。

プレビューもクソ大変だし、`Camera2 API`もコールバックばっかでしんどいし。  
プレビュー出すまでにどれだけのコールバックが必要なんだろう、数えたくないけど。

# おわりに3
ちなみに、`SurfaceView`で`OpenGL ES`を使いたい**だけ**なら`GLSurfaceView`ってのがあるのでそれでいいと思います。  
ただ、今回は静止画撮影、動画撮影と同じ描画処理を使い回したかったのでに使っていません。  

`SurfaceView + OpenGLES = GLSurfaceView`は存在しますが、  
`ImageReader + OpenGLES = GLImageReader`や`MediaRecorder + OpenGLES = GLMediaRecorder`は存在しないので、それらと繋ぐ部分は結局必要。プレビューだけ`GLSurfaceView`にする旨味は多分無い。

# おわりに4
`Google Pixel`だと以下のコードが落ちます。逆に`Snapdragon`だと問題なく動いて**悩んだ**。  
`Snapdragon`が優秀説ある？他の`SoC`のスマホがなくて試せない。

```kotlin
// SurfaceView と OpenGL ES 用スレッドを作る
val openGlDispatcher = newSingleThreadContext("OpenGlThread")
val surfaceView = SurfaceView(this)

// SurfaceView の生成コールバックを待つ
surfaceView.holder.addCallback(object : SurfaceHolder.Callback {
    override fun surfaceCreated(holder: SurfaceHolder) {
        // Surface が出来たら OpenGL ES の作成（どっちかというと EGL の作成）と破棄を2回やる
        lifecycleScope.launch {
            // InputSurface.java
            // https://cs.android.com/android/platform/superproject/main/+/main:cts/tests/mediapc/src/android/mediapc/cts/InputSurface.java
            val inputSurface1 = InputSurface(holder.surface)
            withContext(openGlDispatcher) {
                inputSurface1.makeCurrent()
            }
            inputSurface1.release()
            // 同じ Surface で、違う EGL のセットアップをする。inputSurface1 は破棄済み
            val inputSurface2 = InputSurface(holder.surface)
            withContext(openGlDispatcher) {
                inputSurface2.makeCurrent()
            }
            inputSurface2.release()
            println("おわり")
        }
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
        // do nothing
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        // do nothing
    }
})

// 画面に置く
setContentView(surfaceView)
```

スタックトレース

```plaintext
FATAL EXCEPTION: main
Process: io.github.takusan23.opengldrivererror, PID: 31834
java.lang.RuntimeException: eglCreateWindowSurface: EGL error: 0x3003
	at io.github.takusan23.opengldrivererror.InputSurface.checkEglError(InputSurface.java:29)
	at io.github.takusan23.opengldrivererror.InputSurface.createEGLSurface(InputSurface.java:88)
	at io.github.takusan23.opengldrivererror.InputSurface.eglSetup(InputSurface.java:76)
	at io.github.takusan23.opengldrivererror.InputSurface.<init>(InputSurface.java:120)
	at io.github.takusan23.opengldrivererror.MainActivity$onCreate$1$surfaceCreated$1.invokeSuspend(MainActivity.kt:35)
```

ちなみに直せます、記事ほぼ書き終わった今気付いた。  
`InputSurface#release`も`OpenGL ES`用スレッドから呼び出せば良いです。じゃあ`Snapdragon`で動いたのはなんで？？？

```kotlin
// Surface が出来たら OpenGL ES の作成（どっちかというと EGL の作成）と破棄を2回やる
lifecycleScope.launch {
    // InputSurface.java
    // https://cs.android.com/android/platform/superproject/main/+/main:cts/tests/mediapc/src/android/mediapc/cts/InputSurface.java
    val inputSurface1 = InputSurface(holder.surface)
    withContext(openGlDispatcher) {
        inputSurface1.makeCurrent()
        inputSurface1.release()
    }
    // 同じ Surface で、違う EGL のセットアップをする。inputSurface1 は破棄済み
    val inputSurface2 = InputSurface(holder.surface)
    withContext(openGlDispatcher) {
        inputSurface2.makeCurrent()
        inputSurface2.release()
    }
    println("おわり")
}
```