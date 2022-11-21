---
title: AndroidのARCoreでGitHubの草(skyline)を表示させるまで。without Sceneform時代のARCoreを試す。
created_at: 2022-11-22
tags:
- Android
- ARCore
- Kotlin
- OpenGL
---

どうもこんばんわ  
アマエミ -longing for you- 攻略しました。  
絵がめっちゃかわいい！！！シナリオも重くなくあまあまなお話です。

3人並ぶといいな...まぶしい

![Imgur](https://imgur.com/mzyBGfn.png)

かわいい！

![Imgur](https://imgur.com/7RoYMk7.png)

この子が特に可愛かったです

![Imgur](https://imgur.com/acwibMI.png)

↑この目すき

![Imgur](https://imgur.com/cKU7FPr.png)


どうやらルート分岐で選んだ回数によって 告白される or する のどちらかになるっぽいです。すごい

あと曲がいい。これだけで予約確定。

おすすめです（アルテミスエンジンくんお願いだからクリックしたらオート解除するのやめて）

# 本題
`GitHub Skyline`っていうGitHubの草を3Dモデルで表示できるサービスがあるのですが、これARで見れたら面白いのではと思ったのでやります。  
3Dプリンターで印刷するためのものなんでしょうが持ってないので...

![Imgur](https://imgur.com/x2Kih8U.png)

# ARCore の Sceneform ...
`AR Core`といえば、簡単に使える`Sceneform`ってライブラリがあったと思います！  
大昔に試してそんなに難しくなかった記憶  

https://takusan23.github.io/Bibouroku/2020/04/06/ARCore/

それを使いたい、、、のですが、  
なんと！使えなくなっていました！数年前は使えてたのですが...！おいGoogle！

![Imgur](https://imgur.com/2nBm31S.png)

うーんしゃあない最新の`AR Core`調べるか...  → https://github.com/google-ar/arcore-android-sdk/tree/master/samples/hello_ar_kotlin

Kotlinのサンプルコード、とりあえず実行できたけどどこで何やってるのかマジで分からん！！！！  
なんか内容が難しい！！！

というわけで、今回は`3Dモデル (GitHub Skyline)`を表示させるまで上記のサンプルをパクってやってみようと思います。

# 環境

| なまえ    | あたい                                                                  |
|-----------|-------------------------------------------------------------------------|
| 端末      | Pixel 6 Pro (Google Tensor / RAM 12GB) / Pixel 3 XL (SDM 845 / RAM 4GB) |
| Android   | 13                                                                      |
| minSdk    | 24 ?                                                                    |
| OpenGL ES | 3.0 たと思う                                                            |

今回は`Depth API`（現実と同じように手前にものがあれば隠れんぼする機能）を使います。  
（てか Pixel 3 XL 物理的に軽くね？いや 6 Pro が重いだけか...）

# ARCore
`ARCore`には描画するための機能は持ち合わせてません。（`Sceneform`にはありましたが、`ARCore`の機能ではありません。）  
そのため描画するための技術（`OpenGL`）と組み合わせて利用する必要があります。

## ながれ

- GitHub Skyline の3Dモデル`.stl`を`AR Core`で利用できる`.obj`に変換する
    - ついでにサイズを小さくします。
    - Blender 使います
- `AR Core`を利用するための用意
- カメラ映像の描画
- 平面の描画
- 3Dオブジェクトの描画

# Blender をいれる
`.stl`を`.obj`にするために使います。  
あとサイズを小さくするためにも使ってます。

使う機会なければ`Portable`の方でも良いんじゃないでしょうか（よく分からん）

![Imgur](https://imgur.com/xFNIsKw.png)

## GitHub Skyline のオブジェクトを読み込む

`GitHub Skyline`のデータはここからダウンロードできます。

![Imgur](https://imgur.com/Vu7t4lf.png)

`Blender`を開き、最初からある立方体はいらないので選んで`Deleteキー`押して消しちゃいましょう。

![Imgur](https://imgur.com/JE0RUTz.png)

ファイル > インポート > STL を選び、ダウンロードしたオブジェクトを選んで取り込みます。

![Imgur](https://imgur.com/XbuK8O7.png)

で、これそのまま使うとクソデカいので直します。

![Imgur](https://imgur.com/sRLPLdN.png)

ちなみにどれぐらいクソデカいかというと、サンプルコードで使われているオブジェクトがこのくらい小さいです。

![Imgur](https://imgur.com/xnBViJF.png)

### サイズを小さくする

キーボードの`N`を押すことで、`トランスフォーム`を表示させる事ができます。  
で、`スケール`の部分を全部`0.005`ぐらいにします。

![Imgur](https://imgur.com/IhuLOgX.png)

これでサンプルと同じぐらいの大きさぐらいに出来ました。保存しましょう。

### 保存
オブジェクトを選択した状態で、  
ファイル > エクスポート > Wavefront OBJ を選びます。

![Imgur](https://imgur.com/nYfKgpU.png)

選択物のみにして、適当な場所に保存します。

![Imgur](https://imgur.com/EVLA3l6.png)

これでファイルの用意は終わりです。

# 公式のサンプルコードをダウンロードします
今回はGoogleのサンプルコードを8割ぐらい使います（`Apache License Version 2.0`）。ので以下のリポジトリを`zip`で落とすなり`git clone`するなりしてローカルに保存して下さい。  
これ`AR Core`のライブラリとして提供してほしいぐらいですよ。

https://github.com/google-ar/arcore-android-sdk

# アプリを作る
Android Studio を開きます。

# 適当なプロジェクトを作成
`minSdk`は`24`です。

![Imgur](https://imgur.com/MHytvCH.png)

# AndroidManifest.xml
`カメラ権限`が必要です。また、`uses-feature`をサンプル通り書いておきましたが無くても動くかもしれないです。

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- カメラ権限 -->
    <uses-permission android:name="android.permission.CAMERA" />
    <!-- AR Core をサポートしている端末のみ Google Play で表示させる -->
    <uses-feature
        android:name="android.hardware.camera.ar"
        android:required="true" />
    <uses-feature
        android:glEsVersion="0x00020000"
        android:required="true" />
```

あともう一箇所、`application`の中に`meta-data`を一つ書きます

```xml
    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.ARCoreGitHubSkyline"
        tools:targetApi="31">

        <!-- AR Google Play Service のインストールを必須にする  -->
        <meta-data
            android:name="com.google.ar.core"
            android:value="required" />
```

# build.gradle
`AR Core`のライブラリと`obj`ファイルを扱うライブラリと公式のライフサイクルのライブラリ、あと権限取るので`Activity Result API`を入れます。

```gradle
dependencies {

    // ARCore (Google Play Services for AR) library.
    implementation("com.google.ar:core:1.34.0")

    // Obj - a simple Wavefront OBJ file loader
    // https://github.com/javagl/Obj
    implementation("de.javagl:obj:0.2.1")

    // ライフサイクル
    implementation("androidx.lifecycle:lifecycle-common-java8:2.5.1")

    // Activity Result API
    implementation("androidx.activity:activity-ktx:1.6.1")
    implementation("androidx.fragment:fragment-ktx:1.5.4")
```

あ、ついでに`targetSdk`を`33`にしておきます。なんか`32`のままだったので  
あと`ViewBinding`も有効にします。

```gradle
android {
    namespace 'io.github.takusan23.arcoregithubskyline'
    compileSdk 33 // ここも

    defaultConfig {
        applicationId "io.github.takusan23.arcoregithubskyline"
        minSdk 24
        targetSdk 33 // ここ
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        viewBinding true // これも
    }

// 以下略
```

# 公式のサンプルコードをコピペする
`hello_ar_kotlin`の`app/src/main/java/com/google/ar/core/examples/java`の中にある`common`をAndroid Studioの`MainActivity.kt`と同じフォルダにコピーします。  
はい。`import`の部分でエラーが出ると思いますので、エラーの部分を消して`Alt+Enter`してインポートし直せば治ると思います。

![Imgur](https://imgur.com/FtlBwSU.png)

# 公式のアセットをコピペする
今回は`OpenGL`の`GLSL言語`で書かれた`シェーダー`もパクることにします。まあ後で少し手直しをしますが。  
1から書くとかはちょっと分からん...

`assets`フォルダを作成して

![Imgur](https://imgur.com/njIeQPa.png)

`hello_ar_kotlin`の`app/src/main/assets`の`models`、`shaders`から以下のファイルをコピーしてきます。

- models
    - dfg.raw
    - trigrid.png
- shaders
    - background_show_camera.vert
    - cubemap_filter.frag
    - cubemap_filter.vert
    - environmental_hdr.frag
    - environmental_hdr.vert
    - occlusion.frag
    - occlusion.vert
    - plane.frag
    - plane.vert
    - point_cloud.frag
    - point_cloud.vert

こうなってれば良いはず

![Imgur](https://imgur.com/afuGMoj.png)

# オブジェクトファイルを入れる
さっき作った`models`に`Blender`で保存した`objファイル`をコピーします。

![Imgur](https://imgur.com/SRaUnkt.png)

これでアセット編は終わりなはず..

# activity_main.xml
`GlSurfaceView`を置きます。ずっと`Jetpack Compose`だったので懐かしいですね（？）

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <android.opengl.GLSurfaceView
        android:id="@+id/activity_main_gl_surfaceview"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

# ARCore を使う
ARCoreのセッションを管理するクラスを作ります。  
ほぼサンプルコードそのままですが

```kotlin
/**
 * ARCoreのセッションとライフサイクル
 */
class ARCoreSessionLifecycleHelper(
    private val activity: Activity,
    private val features: Set<Session.Feature> = emptySet(),
) : DefaultLifecycleObserver {

    var installRequested = false
    var session: Session? = null
        private set

    /**
     * 失敗時に呼び出されるコールバック関数
     *
     * @see [Session constructor](https://developers.google.com/ar/reference/java/com/google/ar/core/Session#Session(android.content.Context))
     */
    var exceptionCallback: ((Exception) -> Unit)? = null

    /**
     * セッションの構成が必要になったら呼び出される。ARCoreの機能など
     *
     * [Session.configure](https://developers.google.com/ar/reference/java/com/google/ar/core/Session#configure-config)
     * [setCameraConfig](https://developers.google.com/ar/reference/java/com/google/ar/core/Session#setCameraConfig-cameraConfig)
     */
    var beforeSessionResume: ((Session) -> Unit)? = null

    /**
     * セッションの作成を試みる。
     * AR の Google Play Service がインストールされていない場合はインストールをリクエスト。
     */
    private fun tryCreateSession(): Session? {
        // 権限がなければreturn
        if (!CameraPermissionHelper.hasCameraPermission(activity)) {
            return null
        }

        return try {
            // Request installation if necessary.
            when (ArCoreApk.getInstance().requestInstall(activity, !installRequested)) {
                ArCoreApk.InstallStatus.INSTALL_REQUESTED -> {
                    installRequested = true
                    // tryCreateSession will be called again, so we return null for now.
                    return null
                }
                ArCoreApk.InstallStatus.INSTALLED -> {
                    // Left empty; nothing needs to be done.
                }
            }

            // Create a session if Google Play Services for AR is installed and up to date.
            Session(activity, features)
        } catch (e: Exception) {
            exceptionCallback?.invoke(e)
            null
        }
    }

    override fun onResume(owner: LifecycleOwner) {
        val session = this.session ?: tryCreateSession() ?: return
        try {
            beforeSessionResume?.invoke(session)
            session.resume()
            this.session = session
        } catch (e: CameraNotAvailableException) {
            exceptionCallback?.invoke(e)
        }
    }

    override fun onPause(owner: LifecycleOwner) {
        session?.pause()
    }

    override fun onDestroy(owner: LifecycleOwner) {
        // ARCoreのセッションを破棄する
        // https://developers.google.com/ar/reference/java/arcore/reference/com/google/ar/core/Session#close()
        session?.close()
        session = null
    }
}
```

`MainActivity.kt`ではこんな感じに使います。  
ついでにカメラ権限ない場合はリクエストするようにしました。

```kotlin
class MainActivity : AppCompatActivity() {

    /** ARCoreのセッション管理 */
    private val arCoreSessionLifecycleHelper by lazy { ARCoreSessionLifecycleHelper(this) }

    /** 権限コールバック */
    private val permissionRequester = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGrant ->
        if (isGrant) {
            setup()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        lifecycle.addObserver(arCoreSessionLifecycleHelper)

        // 権限がない場合は取得する
        if (CameraPermissionHelper.hasCameraPermission(this)) {
            setup()
        } else {
            permissionRequester.launch(android.Manifest.permission.CAMERA)
        }
    }

    private fun setup() {
        arCoreSessionLifecycleHelper.apply {
            // 失敗コールバック
            exceptionCallback = { exception ->
                exception.printStackTrace()
            }
            // 構成
            beforeSessionResume = { session ->
                session.configure(
                    session.config.apply {
                        lightEstimationMode = Config.LightEstimationMode.ENVIRONMENTAL_HDR
                        // Depth API は使いたい
                        depthMode = if (session.isDepthModeSupported(Config.DepthMode.AUTOMATIC)) {
                            Config.DepthMode.AUTOMATIC
                        } else {
                            Config.DepthMode.DISABLED
                        }
                        // インスタント配置は使わない
                        instantPlacementMode = Config.InstantPlacementMode.DISABLED
                    }
                )
            }
        }
    }
}
```

# ViewBindingするクラス
このレベルだとそのまま使ったほうが良さそうまであるけど一応

```kotlin
/** GLSurfaceViewのライフサイクルするやつ */
class ARViewLifecycle(context: Context) : DefaultLifecycleObserver {

    val viewBinding = ActivityMainBinding.inflate(LayoutInflater.from(context))

    override fun onPause(owner: LifecycleOwner) {
        super.onPause(owner)
        viewBinding.activityMainGlSurfaceview.onPause()
    }

    override fun onResume(owner: LifecycleOwner) {
        super.onResume(owner)
        viewBinding.activityMainGlSurfaceview.onResume()
    }
}
```

`MainActivity.kt`で`setContentView`します。

```kotlin
class MainActivity : AppCompatActivity() {

    /** ARCoreのセッション管理 */
    private val arCoreSessionLifecycleHelper by lazy { ARCoreSessionLifecycleHelper(this) }

    /** GLSurfaceView */
    private val arViewLifecycle by lazy { ARViewLifecycle(this) }

    /** 権限コールバック */
    private val permissionRequester = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGrant ->
        if (isGrant) {
            setup()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(arViewLifecycle.viewBinding.root)

        lifecycle.addObserver(arCoreSessionLifecycleHelper)
        lifecycle.addObserver(arViewLifecycle)

        // 権限がない場合は取得する
        if (CameraPermissionHelper.hasCameraPermission(this)) {
            setup()
        } else {
            permissionRequester.launch(android.Manifest.permission.CAMERA)
        }
    }

    // 省略
}
```

# 描画するクラス

いよいよ描画するクラスを作っていきます。  
`ARCoreOpenGlRenderer.kt`です。

```kotlin
/** OpenGLを利用して描画するクラス */
class ARCoreOpenGlRenderer(
    private val context: Context,
    private val arCoreSessionLifecycleHelper: ARCoreSessionLifecycleHelper,
    private val tapHelper: TapHelper,
) : SampleRender.Renderer, DefaultLifecycleObserver {

    override fun onResume(owner: LifecycleOwner) {
        super.onResume(owner)
    }

    override fun onPause(owner: LifecycleOwner) {
        super.onPause(owner)
    }

    override fun onSurfaceCreated(render: SampleRender?) {

    }

    override fun onSurfaceChanged(render: SampleRender?, width: Int, height: Int) {

    }

    override fun onDrawFrame(render: SampleRender?) {

    }
}
```

これを`MainActivity`でこうやって使います

```kotlin
class MainActivity : AppCompatActivity() {

    /** ARCoreのセッション管理 */
    private val arCoreSessionLifecycleHelper by lazy { ARCoreSessionLifecycleHelper(this) }

    /** GLSurfaceView */
    private val arViewLifecycle by lazy { ARViewLifecycle(this) }

    /** タッチイベント */
    private val tapHelper by lazy { TapHelper(this).also { arViewLifecycle.viewBinding.activityMainGlSurfaceview.setOnTouchListener(it) } }

    /** OpenGLでARCore描画するやつ */
    private val renderer by lazy { ARCoreOpenGlRenderer(this, arCoreSessionLifecycleHelper, tapHelper) }

    /** 権限コールバック */
    private val permissionRequester = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGrant ->
        if (isGrant) {
            setup()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(arViewLifecycle.viewBinding.root)

        lifecycle.addObserver(arCoreSessionLifecycleHelper)
        lifecycle.addObserver(arViewLifecycle)
        lifecycle.addObserver(renderer)

        // 権限がない場合は取得する
        if (CameraPermissionHelper.hasCameraPermission(this)) {
            setup()
        } else {
            permissionRequester.launch(android.Manifest.permission.CAMERA)
        }
    }

    private fun setup() {
        arCoreSessionLifecycleHelper.apply {
            // 失敗コールバック
            exceptionCallback = { exception ->
                exception.printStackTrace()
            }
            // 構成
            beforeSessionResume = { session ->
                session.configure(
                    session.config.apply {
                        lightEstimationMode = Config.LightEstimationMode.ENVIRONMENTAL_HDR
                        // Depth API は使いたい
                        depthMode = if (session.isDepthModeSupported(Config.DepthMode.AUTOMATIC)) {
                            Config.DepthMode.AUTOMATIC
                        } else {
                            Config.DepthMode.DISABLED
                        }
                        // インスタント配置は使わない
                        instantPlacementMode = Config.InstantPlacementMode.DISABLED
                    }
                )
            }
        }

        // 描画する
        SampleRender(arViewLifecycle.viewBinding.activityMainGlSurfaceview, renderer, assets)
    }
}
```

## そのまえに Toast を出すだけのクラスを作る

```kotlin
/** Toastを表示するだけのクラス */
class ToastManager(private val context: Context) {
    private val handler = Handler(Looper.getMainLooper())

    /** 前回のメッセージ */
    private var prevMessage: String? = null

    /**
     * Toastを表示させる
     * @param message 本文
     */
    fun show(message: String) {
        // 同じ場合は出さない
        if (prevMessage == message) {
            return
        }
        handler.post {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
            prevMessage = message
        }
    }
}
```

## カメラ映像を描画する
まずはカメラ映像を描画するようにしましょう。

```kotlin
/** OpenGLを利用して描画するクラス */
class ARCoreOpenGlRenderer(
    private val context: Context,
    private val arCoreSessionLifecycleHelper: ARCoreSessionLifecycleHelper,
    private val tapHelper: TapHelper,
) : SampleRender.Renderer, DefaultLifecycleObserver {

    /** カメラ映像をレンダリングするやつ */
    private lateinit var backgroundRenderer: BackgroundRenderer
    private lateinit var virtualSceneFramebuffer: Framebuffer
    private val displayRotationHelper = DisplayRotationHelper(context)

    /** カメラ映像のテクスチャを渡したか。一度だけ行うため */
    private var isAlreadySetTexture = false
    
    override fun onResume(owner: LifecycleOwner) {
        super.onResume(owner)
        displayRotationHelper.onResume()
    }

    override fun onPause(owner: LifecycleOwner) {
        super.onPause(owner)
        displayRotationHelper.onPause()
    }

    /** SurfaceViewが利用可能になったら呼ばれる */
    override fun onSurfaceCreated(render: SampleRender) {
        backgroundRenderer = BackgroundRenderer(render)
        virtualSceneFramebuffer = Framebuffer(render, /*width=*/ 1, /*height=*/ 1)
    }

    /** SurfaceViewのサイズ変更時に */
    override fun onSurfaceChanged(render: SampleRender, width: Int, height: Int) {
        displayRotationHelper.onSurfaceChanged(width, height)
        virtualSceneFramebuffer.resize(width, height)
    }

    /** 毎フレーム呼ばれる？ */
    override fun onDrawFrame(render: SampleRender) {
        val session = arCoreSessionLifecycleHelper.session ?: return

        // カメラ映像テクスチャ
        if (!isAlreadySetTexture) {
            session.setCameraTextureNames(intArrayOf(backgroundRenderer.cameraColorTexture.textureId))
            isAlreadySetTexture = true
        }

        // カメラ映像のサイズを合わせる
        displayRotationHelper.updateSessionIfNeeded(session)

        // ARSession から現在のフレームを取得
        val frame = try {
            session.update()
        } catch (e: Exception) {
            Log.e(TAG, "Camera not available during onDrawFrame", e)
            return
        }

        val camera = frame.camera
        // 深度設定
        try {
            backgroundRenderer.setUseDepthVisualization(render, false)
            backgroundRenderer.setUseOcclusion(render, true)
        } catch (e: IOException) {
            Log.e(TAG, "Failed to read a required asset file", e)
            return
        }

        // 座標を更新する
        backgroundRenderer.updateDisplayGeometry(frame)
        // 深度設定
        val shouldGetDepthImage = true
        if (camera.trackingState == TrackingState.TRACKING && shouldGetDepthImage) {
            try {
                val depthImage = frame.acquireDepthImage16Bits()
                backgroundRenderer.updateCameraDepthTexture(depthImage)
                depthImage.close()
            } catch (e: NotYetAvailableException) {
                // まだ深度データが利用できない
                // 別にエラーではなく正常
            }
        }

        // カメラ映像を描画する
        if (frame.timestamp != 0L) {
            // カメラがまだ最初のフレームを生成していない場合、レンダリングを抑制します。 これは避けるためです
            // テクスチャが再利用される場合、以前のセッションから残っている可能性のあるデータを描画します。
            backgroundRenderer.drawBackground(render)
        }
        // 追跡しない場合は、3D オブジェクトを描画しない
        if (camera.trackingState == TrackingState.PAUSED) {
            return
        }

        // 背景を使用して仮想シーンを構成します。
        backgroundRenderer.drawVirtualScene(render, virtualSceneFramebuffer, Z_NEAR, Z_FAR)
    }

    companion object {
        private val TAG = ARCoreOpenGlRenderer::class.java.simpleName

        private const val Z_NEAR = 0.1f
        private const val Z_FAR = 100f
    }
}
```

後は実行してカメラ映像が描画されていれば成功です！

![Imgur](https://imgur.com/02T1zOV.png)

## 平面とクラウドポイントを描画する

平面はこの白色の三角形のタイルみたいなやつです。  
クラウドポイントってのはこの青いてんてんのことです。

![Imgur](https://imgur.com/sWGK2wA.png)

オブジェクトの描画の際に使う`FloatArray`も今回まとめて書いちゃいます。

```kotlin
/** OpenGLを利用して描画するクラス */
class ARCoreOpenGlRenderer(
    private val context: Context,
    private val arCoreSessionLifecycleHelper: ARCoreSessionLifecycleHelper,
    private val tapHelper: TapHelper,
) : SampleRender.Renderer, DefaultLifecycleObserver {

    /** カメラ映像をレンダリングするやつ */
    private lateinit var backgroundRenderer: BackgroundRenderer
    private lateinit var virtualSceneFramebuffer: Framebuffer
    private val displayRotationHelper = DisplayRotationHelper(context)

    /** カメラ映像のテクスチャを渡したか。一度だけ行うため */
    private var isAlreadySetTexture = false

    /** 平面をレンダリングするやつ */
    private lateinit var planeRenderer: PlaneRenderer

    /** Point Cloud (あの青い点) */
    private lateinit var pointCloudVertexBuffer: VertexBuffer
    private lateinit var pointCloudMesh: Mesh
    private lateinit var pointCloudShader: Shader

    /** 最後のポイントクラウド */
    private var lastPointCloudTimestamp = 0L

    /** AR上においたオブジェクト配列 */
    private val wrappedAnchors = mutableListOf<WrappedAnchor>()

    /** Toast出すだけ */
    private val toastManager = ToastManager(context)

    private val modelMatrix = FloatArray(16)
    private val viewMatrix = FloatArray(16)
    private val modelViewMatrix = FloatArray(16)
    private val projectionMatrix = FloatArray(16)
    private val modelViewProjectionMatrix = FloatArray(16)
    private val viewInverseMatrix = FloatArray(16)
    private val sphericalHarmonicsCoefficients = FloatArray(9 * 3)
    private val worldLightDirection = floatArrayOf(0.0f, 0.0f, 0.0f, 0.0f)
    private val viewLightDirection = FloatArray(4)

    // 省略

    /** SurfaceViewが利用可能になったら呼ばれる */
    override fun onSurfaceCreated(render: SampleRender) {
        // カメラ映像
        backgroundRenderer = BackgroundRenderer(render)
        virtualSceneFramebuffer = Framebuffer(render, /*width=*/ 1, /*height=*/ 1)

        // 平面
        planeRenderer = PlaneRenderer(render)

        // ポイントクラウド (平面を見つける際に表示される青いやつ)
        pointCloudShader = Shader.createFromAssets(
            render,
            "shaders/point_cloud.vert",
            "shaders/point_cloud.frag",
            /*defines=*/ null
        ).apply {
            setVec4("u_Color", floatArrayOf(31.0f / 255.0f, 188.0f / 255.0f, 210.0f / 255.0f, 1.0f))
            setFloat("u_PointSize", 5.0f)
        }
        pointCloudVertexBuffer = VertexBuffer(render, /*numberOfEntriesPerVertex=*/ 4, /*entries=*/ null)
        pointCloudMesh = Mesh(render, Mesh.PrimitiveMode.POINTS, /*indexBuffer=*/ null, arrayOf(pointCloudVertexBuffer))
    }

    // 省略

    /** 毎フレーム呼ばれる？ */
    override fun onDrawFrame(render: SampleRender) {
        val session = arCoreSessionLifecycleHelper.session ?: return

        // カメラ映像テクスチャ
        if (!isAlreadySetTexture) {
            session.setCameraTextureNames(intArrayOf(backgroundRenderer.cameraColorTexture.textureId))
            isAlreadySetTexture = true
        }

        // カメラ映像のサイズを合わせる
        displayRotationHelper.updateSessionIfNeeded(session)

        // ARSession から現在のフレームを取得
        val frame = try {
            session.update()
        } catch (e: Exception) {
            Log.e(TAG, "Camera not available during onDrawFrame", e)
            return
        }

        val camera = frame.camera
        // 深度設定
        try {
            backgroundRenderer.setUseDepthVisualization(render, false)
            backgroundRenderer.setUseOcclusion(render, true)
        } catch (e: IOException) {
            Log.e(TAG, "Failed to read a required asset file", e)
            return
        }

        // 座標を更新する
        backgroundRenderer.updateDisplayGeometry(frame)
        val shouldGetDepthImage = true
        if (camera.trackingState == TrackingState.TRACKING && shouldGetDepthImage) {
            try {
                val depthImage = frame.acquireDepthImage16Bits()
                backgroundRenderer.updateCameraDepthTexture(depthImage)
                depthImage.close()
            } catch (e: NotYetAvailableException) {
                // まだ深度データが利用できない
                // 別にエラーではなく正常
            }
        }

        // タップされたか、毎フレーム見る
        handleTap(frame, camera)

        // ARのステータス
        // 平面が検出されてオブジェクトを配置できるようになったかどうかなど
        when {
            camera.trackingState == TrackingState.PAUSED && camera.trackingFailureReason == TrackingFailureReason.NONE -> "平面を探しています"
            camera.trackingState == TrackingState.PAUSED -> null
            hasTrackingPlane(session) && wrappedAnchors.isEmpty() -> "平面を検出しました。タップして配置します。"
            hasTrackingPlane(session) && wrappedAnchors.isNotEmpty() -> null
            else -> "平面を探しています"
        }?.also {
            toastManager.show(it)
        }

        // カメラ映像を描画する
        if (frame.timestamp != 0L) {
            // カメラがまだ最初のフレームを生成していない場合、レンダリングを抑制します。 これは避けるためです
            // テクスチャが再利用される場合、以前のセッションから残っている可能性のあるデータを描画します。
            backgroundRenderer.drawBackground(render)
        }
        // 追跡しない場合は、3D オブジェクトを描画しない
        if (camera.trackingState == TrackingState.PAUSED) {
            return
        }

        // 射影行列を取得する
        camera.getProjectionMatrix(projectionMatrix, 0, Z_NEAR, Z_FAR)

        // カメラ行列を取得して描画.
        camera.getViewMatrix(viewMatrix, 0)

        // ポイントクラウドの描画
        frame.acquirePointCloud().use { pointCloud ->
            if (pointCloud.timestamp > lastPointCloudTimestamp) {
                pointCloudVertexBuffer.set(pointCloud.points)
                lastPointCloudTimestamp = pointCloud.timestamp
            }
            Matrix.multiplyMM(modelViewProjectionMatrix, 0, projectionMatrix, 0, viewMatrix, 0)
            pointCloudShader.setMat4("u_ModelViewProjection", modelViewProjectionMatrix)
            render.draw(pointCloudMesh, pointCloudShader)
        }

        // 平面を描画します
        planeRenderer.drawPlanes(render, session.getAllTrackables(Plane::class.java), camera.displayOrientedPose, projectionMatrix)

        // 背景を使用して仮想シーンを構成します。
        backgroundRenderer.drawVirtualScene(render, virtualSceneFramebuffer, Z_NEAR, Z_FAR)
    }

    /** 1フレームごとにタップを処理する */
    private fun handleTap(frame: Frame, camera: Camera) {
        if (camera.trackingState != TrackingState.TRACKING) return
        val tap = tapHelper.poll() ?: return

        // ヒットは深さによってソートされます。平面上の最も近いヒットのみ
        val hitResultList = frame.hitTest(tap)
        val firstHitResult = hitResultList.firstOrNull { hit ->
            when (val trackable = hit.trackable!!) {
                is Plane -> trackable.isPoseInPolygon(hit.hitPose) && PlaneRenderer.calculateDistanceToPlane(hit.hitPose, camera.pose) > 0
                is Point -> trackable.orientationMode == Point.OrientationMode.ESTIMATED_SURFACE_NORMAL
                is InstantPlacementPoint -> true
                // DepthPoints are only returned if Config.DepthMode is set to AUTOMATIC.
                is DepthPoint -> true
                else -> false
            }
        }

        if (firstHitResult != null) {
            // アンカー数に制限をかける
            if (wrappedAnchors.size >= 20) {
                wrappedAnchors[0].anchor.detach()
                wrappedAnchors.removeAt(0)
            }
            // 追跡登録
            wrappedAnchors.add(WrappedAnchor(firstHitResult.createAnchor(), firstHitResult.trackable))
        }
    }

    /** 平面が1つ以上見つかっていれば true */
    private fun hasTrackingPlane(session: Session) = session.getAllTrackables(Plane::class.java).any { it.trackingState == TrackingState.TRACKING }

    /** アンカーとトラッカブルを紐つける */
    private data class WrappedAnchor(
        val anchor: Anchor,
        val trackable: Trackable,
    )

    // 省略
}
```

## オブジェクトを描画する (多分最後)

ついにGitHubの草をARに登場させます！！！  
今回はテクスチャを用意しないので、単色で塗りつぶすよう`フラグメントシェーダ`にも手を加えます。

面倒なのでここまで全部張ります。

### ARCoreOpenGlRenderer

```kotlin
/** OpenGLを利用して描画するクラス */
class ARCoreOpenGlRenderer(
    private val context: Context,
    private val arCoreSessionLifecycleHelper: ARCoreSessionLifecycleHelper,
    private val tapHelper: TapHelper,
) : SampleRender.Renderer, DefaultLifecycleObserver {

    /** カメラ映像をレンダリングするやつ */
    private lateinit var backgroundRenderer: BackgroundRenderer
    private lateinit var virtualSceneFramebuffer: Framebuffer
    private val displayRotationHelper = DisplayRotationHelper(context)

    /** カメラ映像のテクスチャを渡したか。一度だけ行うため */
    private var isAlreadySetTexture = false

    /** 平面をレンダリングするやつ */
    private lateinit var planeRenderer: PlaneRenderer

    /** Point Cloud (あの青い点) */
    private lateinit var pointCloudVertexBuffer: VertexBuffer
    private lateinit var pointCloudMesh: Mesh
    private lateinit var pointCloudShader: Shader

    /** 最後のポイントクラウド */
    private var lastPointCloudTimestamp = 0L

    /** GitHubのARモデル */
    private lateinit var virtualObjectMesh: Mesh
    private lateinit var virtualObjectShader: Shader

    /** ARモデルの環境HDR */
    private lateinit var dfgTexture: Texture
    private lateinit var cubemapFilter: SpecularCubemapFilter

    /** AR上においたオブジェクト配列 */
    private val wrappedAnchors = mutableListOf<WrappedAnchor>()

    /** Toast出すだけ */
    private val toastManager = ToastManager(context)

    private val modelMatrix = FloatArray(16)
    private val viewMatrix = FloatArray(16)
    private val modelViewMatrix = FloatArray(16)
    private val projectionMatrix = FloatArray(16)
    private val modelViewProjectionMatrix = FloatArray(16)
    private val viewInverseMatrix = FloatArray(16)
    private val sphericalHarmonicsCoefficients = FloatArray(9 * 3)
    private val worldLightDirection = floatArrayOf(0.0f, 0.0f, 0.0f, 0.0f)
    private val viewLightDirection = FloatArray(4)

    override fun onResume(owner: LifecycleOwner) {
        super.onResume(owner)
        displayRotationHelper.onResume()
    }

    override fun onPause(owner: LifecycleOwner) {
        super.onPause(owner)
        displayRotationHelper.onPause()
    }

    /** SurfaceViewが利用可能になったら呼ばれる */
    override fun onSurfaceCreated(render: SampleRender) {
        // カメラ映像
        backgroundRenderer = BackgroundRenderer(render)
        virtualSceneFramebuffer = Framebuffer(render, /*width=*/ 1, /*height=*/ 1)

        // 平面
        planeRenderer = PlaneRenderer(render)

        // ポイントクラウド (平面を見つける際に表示される青いやつ)
        pointCloudShader = Shader.createFromAssets(
            render,
            "shaders/point_cloud.vert",
            "shaders/point_cloud.frag",
            /*defines=*/ null
        ).apply {
            setVec4("u_Color", floatArrayOf(31.0f / 255.0f, 188.0f / 255.0f, 210.0f / 255.0f, 1.0f))
            setFloat("u_PointSize", 5.0f)
        }
        pointCloudVertexBuffer = VertexBuffer(render, /*numberOfEntriesPerVertex=*/ 4, /*entries=*/ null)
        pointCloudMesh = Mesh(render, Mesh.PrimitiveMode.POINTS, /*indexBuffer=*/ null, arrayOf(pointCloudVertexBuffer))

        // HDRの設定
        cubemapFilter = SpecularCubemapFilter(render, CUBEMAP_RESOLUTION, CUBEMAP_NUMBER_OF_IMPORTANCE_SAMPLES)
        dfgTexture = Texture(render, Texture.Target.TEXTURE_2D, Texture.WrapMode.CLAMP_TO_EDGE,/*useMipmaps=*/ false)

        // DFT テクスチャの設定
        val dfgResolution = 64
        val dfgChannels = 2
        val halfFloatSize = 2
        val buffer = ByteBuffer.allocateDirect(dfgResolution * dfgResolution * dfgChannels * halfFloatSize).apply {
            context.assets.open("models/dfg.raw").use { it.read(this.array()) }
        }

        GLES30.glBindTexture(GLES30.GL_TEXTURE_2D, dfgTexture.textureId)
        GLError.maybeThrowGLException("Failed to bind DFG texture", "glBindTexture")
        GLES30.glTexImage2D(
            GLES30.GL_TEXTURE_2D,
            /*level=*/ 0,
            GLES30.GL_RG16F,
            /*width=*/ dfgResolution,
            /*height=*/ dfgResolution,
            /*border=*/ 0,
            GLES30.GL_RG,
            GLES30.GL_HALF_FLOAT,
            buffer
        )
        GLError.maybeThrowGLException("Failed to populate DFG texture", "glTexImage2D")

        // 3Dオブジェクトを読み込む
        virtualObjectMesh = Mesh.createFromAsset(render, "models/arcore_github_skyline.obj")
        virtualObjectShader = Shader.createFromAssets(
            render,
            "shaders/environmental_hdr.vert",
            "shaders/environmental_hdr.frag",
            mapOf("NUMBER_OF_MIPMAP_LEVELS" to cubemapFilter.numberOfMipmapLevels.toString())
        ).apply {
            setTexture("u_Cubemap", cubemapFilter.filteredCubemapTexture)
            setTexture("u_DfgTexture", dfgTexture)
            // オブジェクトの色をUniform変数に入れる
            setVec4("v_ObjColor", floatArrayOf(0.25f, 0.76f, 0.38f, 1.0f))
        }
    }

    /** SurfaceViewのサイズ変更時に */
    override fun onSurfaceChanged(render: SampleRender, width: Int, height: Int) {
        displayRotationHelper.onSurfaceChanged(width, height)
        virtualSceneFramebuffer.resize(width, height)
    }

    /** 毎フレーム呼ばれる？ */
    override fun onDrawFrame(render: SampleRender) {
        val session = arCoreSessionLifecycleHelper.session ?: return

        // カメラ映像テクスチャ
        if (!isAlreadySetTexture) {
            session.setCameraTextureNames(intArrayOf(backgroundRenderer.cameraColorTexture.textureId))
            isAlreadySetTexture = true
        }

        // カメラ映像のサイズを合わせる
        displayRotationHelper.updateSessionIfNeeded(session)

        // ARSession から現在のフレームを取得
        val frame = try {
            session.update()
        } catch (e: Exception) {
            Log.e(TAG, "Camera not available during onDrawFrame", e)
            return
        }

        val camera = frame.camera
        // 深度設定
        try {
            backgroundRenderer.setUseDepthVisualization(render, false)
            backgroundRenderer.setUseOcclusion(render, true)
        } catch (e: IOException) {
            Log.e(TAG, "Failed to read a required asset file", e)
            return
        }

        // 座標を更新する
        backgroundRenderer.updateDisplayGeometry(frame)
        val shouldGetDepthImage = true
        if (camera.trackingState == TrackingState.TRACKING && shouldGetDepthImage) {
            try {
                val depthImage = frame.acquireDepthImage16Bits()
                backgroundRenderer.updateCameraDepthTexture(depthImage)
                depthImage.close()
            } catch (e: NotYetAvailableException) {
                // まだ深度データが利用できない
                // 別にエラーではなく正常
            }
        }

        // タップされたか、毎フレーム見る
        handleTap(frame, camera)

        // ARのステータス
        // 平面が検出されてオブジェクトを配置できるようになったかどうかなど
        when {
            camera.trackingState == TrackingState.PAUSED && camera.trackingFailureReason == TrackingFailureReason.NONE -> "平面を探しています"
            camera.trackingState == TrackingState.PAUSED -> null
            hasTrackingPlane(session) && wrappedAnchors.isEmpty() -> "平面を検出しました。タップして配置します。"
            hasTrackingPlane(session) && wrappedAnchors.isNotEmpty() -> null
            else -> "平面を探しています"
        }?.also {
            toastManager.show(it)
        }

        // カメラ映像を描画する
        if (frame.timestamp != 0L) {
            // カメラがまだ最初のフレームを生成していない場合、レンダリングを抑制します。 これは避けるためです
            // テクスチャが再利用される場合、以前のセッションから残っている可能性のあるデータを描画します。
            backgroundRenderer.drawBackground(render)
        }
        // 追跡しない場合は、3D オブジェクトを描画しない
        if (camera.trackingState == TrackingState.PAUSED) {
            return
        }

        // 射影行列を取得する
        camera.getProjectionMatrix(projectionMatrix, 0, Z_NEAR, Z_FAR)

        // カメラ行列を取得して描画.
        camera.getViewMatrix(viewMatrix, 0)

        // ポイントクラウドの描画
        frame.acquirePointCloud().use { pointCloud ->
            if (pointCloud.timestamp > lastPointCloudTimestamp) {
                pointCloudVertexBuffer.set(pointCloud.points)
                lastPointCloudTimestamp = pointCloud.timestamp
            }
            Matrix.multiplyMM(modelViewProjectionMatrix, 0, projectionMatrix, 0, viewMatrix, 0)
            pointCloudShader.setMat4("u_ModelViewProjection", modelViewProjectionMatrix)
            render.draw(pointCloudMesh, pointCloudShader)
        }

        // 平面を描画します
        planeRenderer.drawPlanes(render, session.getAllTrackables(Plane::class.java), camera.displayOrientedPose, projectionMatrix)

        // シェーダのライティングパラメータを更新
        updateLightEstimation(frame.lightEstimate, viewMatrix)

        // ARオブジェクトを描画
        render.clear(virtualSceneFramebuffer, 0f, 0f, 0f, 0f)
        wrappedAnchors.filter { it.anchor.trackingState == TrackingState.TRACKING }.forEach { (anchor, trackable) ->
            // アンカーポーズ
            anchor.pose.toMatrix(modelMatrix, 0)
            // モデル、ビュー、投影行列 を計算
            Matrix.multiplyMM(modelViewMatrix, 0, viewMatrix, 0, modelMatrix, 0)
            Matrix.multiplyMM(modelViewProjectionMatrix, 0, projectionMatrix, 0, modelViewMatrix, 0)
            // シェーダーのUniform変数にセットする
            virtualObjectShader.setMat4("u_ModelView", modelViewMatrix)
            virtualObjectShader.setMat4("u_ModelViewProjection", modelViewProjectionMatrix)
            // 描画
            render.draw(virtualObjectMesh, virtualObjectShader, virtualSceneFramebuffer)
        }

        // 背景を使用して仮想シーンを構成します。
        backgroundRenderer.drawVirtualScene(render, virtualSceneFramebuffer, Z_NEAR, Z_FAR)
    }

    /** 1フレームごとにタップを処理する */
    private fun handleTap(frame: Frame, camera: Camera) {
        if (camera.trackingState != TrackingState.TRACKING) return
        val tap = tapHelper.poll() ?: return

        // ヒットは深さによってソートされます。平面上の最も近いヒットのみ
        val hitResultList = frame.hitTest(tap)
        val firstHitResult = hitResultList.firstOrNull { hit ->
            when (val trackable = hit.trackable!!) {
                is Plane -> trackable.isPoseInPolygon(hit.hitPose) && PlaneRenderer.calculateDistanceToPlane(hit.hitPose, camera.pose) > 0
                is Point -> trackable.orientationMode == Point.OrientationMode.ESTIMATED_SURFACE_NORMAL
                is InstantPlacementPoint -> true
                // DepthPoints are only returned if Config.DepthMode is set to AUTOMATIC.
                is DepthPoint -> true
                else -> false
            }
        }

        if (firstHitResult != null) {
            // アンカー数に制限をかける
            if (wrappedAnchors.size >= 20) {
                wrappedAnchors[0].anchor.detach()
                wrappedAnchors.removeAt(0)
            }
            // 追跡登録
            wrappedAnchors.add(WrappedAnchor(firstHitResult.createAnchor(), firstHitResult.trackable))
        }
    }

    /** 光を処理する */
    private fun updateLightEstimation(lightEstimate: LightEstimate, viewMatrix: FloatArray) {
        if (lightEstimate.state != LightEstimate.State.VALID) {
            virtualObjectShader.setBool("u_LightEstimateIsValid", false)
            return
        }
        virtualObjectShader.setBool("u_LightEstimateIsValid", true)
        Matrix.invertM(viewInverseMatrix, 0, viewMatrix, 0)
        virtualObjectShader.setMat4("u_ViewInverse", viewInverseMatrix)
        updateMainLight(
            lightEstimate.environmentalHdrMainLightDirection,
            lightEstimate.environmentalHdrMainLightIntensity,
            viewMatrix
        )
        cubemapFilter.update(lightEstimate.acquireEnvironmentalHdrCubeMap())
    }

    private fun updateMainLight(
        direction: FloatArray,
        intensity: FloatArray,
        viewMatrix: FloatArray,
    ) {
        // ビュー空間に変換するための最終コンポーネントとして 0.0 を持つ vec4 の方向が必要です。
        worldLightDirection[0] = direction[0]
        worldLightDirection[1] = direction[1]
        worldLightDirection[2] = direction[2]
        Matrix.multiplyMV(viewLightDirection, 0, viewMatrix, 0, worldLightDirection, 0)
        virtualObjectShader.setVec4("u_ViewLightDirection", viewLightDirection)
        virtualObjectShader.setVec3("u_LightIntensity", intensity)
    }

    /** 平面が1つ以上見つかっていれば true */
    private fun hasTrackingPlane(session: Session) = session.getAllTrackables(Plane::class.java).any { it.trackingState == TrackingState.TRACKING }

    /** アンカーとトラッカブルを紐つける */
    private data class WrappedAnchor(
        val anchor: Anchor,
        val trackable: Trackable,
    )

    companion object {
        private val TAG = ARCoreOpenGlRenderer::class.java.simpleName

        private const val Z_NEAR = 0.1f
        private const val Z_FAR = 100f

        private const val CUBEMAP_RESOLUTION = 16
        private const val CUBEMAP_NUMBER_OF_IMPORTANCE_SAMPLES = 32
    }
}
```

### environmental_hdr.frag

この3Dオブジェクトに色を付けるのが、`environmental_hdr.frag`って名前のフラグメントシェーダです。  
少し手を加えます。

以下の3行を

```glsl
// The albedo and roughness/metallic textures.
uniform sampler2D u_AlbedoTexture;
uniform sampler2D u_RoughnessMetallicAmbientOcclusionTexture;
```

こうします

```glsl
// ここで3Dオブジェクトの色を定義しておく
uniform vec4 v_ObjColor;
```

次にここを

```glsl
  // Skip all lighting calculations if the estimation is not valid.
  if (!u_LightEstimateIsValid) {
    o_FragColor = vec4(texture(u_AlbedoTexture, texCoord).rgb, 1.0);
    return;
  }
```

こうします

```glsl
  // Skip all lighting calculations if the estimation is not valid.
  if (!u_LightEstimateIsValid) {
    o_FragColor = v_ObjColor;
    return;
  }
```

関数呼び出しも直します。  
以下の部分を

```glsl
  MaterialParameters material;
  Pbr_CreateMaterialParameters(texCoord, u_AlbedoTexture,
                               u_RoughnessMetallicAmbientOcclusionTexture,
                               u_DfgTexture, shading, material);
```

こうします

```glsl
  MaterialParameters material;
  Pbr_CreateMaterialParameters(texCoord, u_DfgTexture, shading, material);
```

`Pbr_CreateMaterialParameters`関数から引数を消して直します。

```glsl
void Pbr_CreateMaterialParameters(const in vec2 texCoord,
                                  const in sampler2D albedoTexture,
                                  const in sampler2D pbrTexture,
                                  const in sampler2D dfgTexture,
                                  const in ShadingParameters shading,
                                  out MaterialParameters material) {
  // Read the material parameters from the textures
  vec3 albedo = texture(albedoTexture, texCoord).rgb;
  vec3 roughnessMetallicAmbientOcclusion = texture(pbrTexture, texCoord).rgb;
```

```glsl
void Pbr_CreateMaterialParameters(const in vec2 texCoord,
                                  const in sampler2D dfgTexture,
                                  const in ShadingParameters shading,
                                  out MaterialParameters material) {
  // Read the material parameters from the textures
  vec3 albedo = v_ObjColor.rgb;
  vec3 roughnessMetallicAmbientOcclusion = v_ObjColor.rgb;
```

### 何してたの？
公式のサンプルコードでは、テクスチャ画像を読み込むような実装でした。  
今回はテクスチャ画像無しで、単色で塗りつぶすようにするため上記の修正が必要になりました。

### environmental_hdr.frag 全体

ほとんど変えてませんが

```glsl
#version 300 es
/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
precision mediump float;

// This shader will light scenes based on ARCore's Environmental HDR mode with a
// physically based rendering model.
//
// When using the HDR Cubemap from ARCore for specular reflections, please note
// that the following equation is true of ARCore's Environmental HDR lighting
// estimation, where E(x) is irradiance of x.
//
// E(spherical harmonics) + E(main light) == E(cubemap)
//
// In order to not duplicate the specular lighting contribution of the main
// light, we must use the following equation, where Lo is total reflected
// radiance (i.e. linear color output), Ld(x) is the reflected diffuse radiance
// of x, and Ls(x) is reflected specular radiance of x.
//
// Lo = Ld(spherical harmonics) + Ld(main light) + Ls(cubemap)
//
// The Filament documentation has excellent documentation on the subject of
// image based lighting:
// https://google.github.io/filament/Filament.md.html#lighting/imagebasedlights
//
// If you would rather not use the HDR cubemap in your application, you would
// need to adjust the lighting calculations to reflect the following equation
// instead.
//
// Lo = Ld(spherical harmonics) + Ld(main light) + Ls(main light)
//
// See the definitions of Pbr_CalculateMainLightRadiance and
// Pbr_CalculateEnvironmentalRadiance.

// Number of mipmap levels in the filtered cubemap.
const int kNumberOfRoughnessLevels = NUMBER_OF_MIPMAP_LEVELS;

// ここで3Dオブジェクトの色を定義しておく
uniform vec4 v_ObjColor;

// The intensity of the main directional light.
uniform vec3 u_LightIntensity;

// The direction of the main directional light in view space.
uniform vec4 u_ViewLightDirection;

// The coefficients for the spherical harmonic function which models the diffuse
// irradiance of a distant environmental light for a given surface normal in
// world space. These coefficients must be premultiplied with their
// corresponding spherical harmonics constants. See
// HelloArActivity.updateSphericalHarmonicsCoefficients for more information.
uniform vec3 u_SphericalHarmonicsCoefficients[9];

// The filtered cubemap texture which models the LD term (i.e. radiance (L)
// times distribution function (D)) of the environmental specular calculation as
// a function of direction and roughness.
uniform samplerCube u_Cubemap;

// The DFG lookup texture which models the DFG1 and DFG2 terms of the
// environmental specular calculation as a function of normal dot view and
// perceptual roughness.
uniform sampler2D u_DfgTexture;

// Inverse view matrix. Used for converting normals back into world space for
// environmental radiance calculations.
uniform mat4 u_ViewInverse;

// If the current light estimate is valid. Used to short circuit the entire
// shader when the light estimate is not valid.
uniform bool u_LightEstimateIsValid;

struct MaterialParameters {
  vec3 diffuse;
  float perceptualRoughness;  // perceptually linear roughness
  float roughness;            // non-perceptually linear roughness
  float metallic;
  float ambientOcclusion;
  vec3 f0;                  // reflectance
  vec2 dfg;                 // DFG1 and DFG2 terms
  vec3 energyCompensation;  // energy preservation for multiscattering
};

struct ShadingParameters {
  // Halfway here refers to halfway between the view and light directions.
  float normalDotView;
  float normalDotHalfway;
  float normalDotLight;
  float viewDotHalfway;
  float oneMinusNormalDotHalfwaySquared;

  // These unit vectors are in world space and are used for the environmental
  // lighting math.
  vec3 worldNormalDirection;
  vec3 worldReflectDirection;
};

in vec3 v_ViewPosition;
in vec3 v_ViewNormal;
in vec2 v_TexCoord;

layout(location = 0) out vec4 o_FragColor;

const float kPi = 3.14159265359;

vec3 Pbr_CalculateMainLightRadiance(const ShadingParameters shading,
                                    const MaterialParameters material,
                                    const vec3 mainLightIntensity) {
  // Lambertian diffuse
  vec3 diffuseTerm = material.diffuse / kPi;

  // Note that if we were not using the HDR cubemap from ARCore for specular
  // lighting, we would be adding a specular contribution from the main light
  // here. See the top of the file for a more detailed explanation.

  return diffuseTerm * mainLightIntensity * shading.normalDotLight;
}

vec3 Pbr_CalculateDiffuseEnvironmentalRadiance(const vec3 normal,
                                               const vec3 coefficients[9]) {
  // See HelloArActivity.updateSphericalHarmonicsCoefficients() for more
  // information about this calculation.
  vec3 radiance = coefficients[0] + coefficients[1] * (normal.y) +
                  coefficients[2] * (normal.z) + coefficients[3] * (normal.x) +
                  coefficients[4] * (normal.y * normal.x) +
                  coefficients[5] * (normal.y * normal.z) +
                  coefficients[6] * (3.0 * normal.z * normal.z - 1.0) +
                  coefficients[7] * (normal.z * normal.x) +
                  coefficients[8] * (normal.x * normal.x - normal.y * normal.y);
  return max(radiance, 0.0);
}

vec3 Pbr_CalculateSpecularEnvironmentalRadiance(
    const ShadingParameters shading, const MaterialParameters material,
    const samplerCube cubemap) {
  // Lagarde and de Rousiers 2014, "Moving Frostbite to PBR"
  float specularAO =
      clamp(pow(shading.normalDotView + material.ambientOcclusion,
                exp2(-16.0 * material.roughness - 1.0)) -
                1.0 + material.ambientOcclusion,
            0.0, 1.0);
  // Combine DFG and LD terms
  float lod =
      material.perceptualRoughness * float(kNumberOfRoughnessLevels - 1);
  vec3 LD = textureLod(cubemap, shading.worldReflectDirection, lod).rgb;
  vec3 E = mix(material.dfg.xxx, material.dfg.yyy, material.f0);
  return E * LD * specularAO * material.energyCompensation;
}

vec3 Pbr_CalculateEnvironmentalRadiance(
    const ShadingParameters shading, const MaterialParameters material,
    const vec3 sphericalHarmonicsCoefficients[9], const samplerCube cubemap) {
  // The lambertian diffuse BRDF term (1/pi) is baked into
  // HelloArActivity.sphericalHarmonicsFactors.
  vec3 diffuseTerm =
      Pbr_CalculateDiffuseEnvironmentalRadiance(
          shading.worldNormalDirection, sphericalHarmonicsCoefficients) *
      material.diffuse * material.ambientOcclusion;

  vec3 specularTerm =
      Pbr_CalculateSpecularEnvironmentalRadiance(shading, material, cubemap);

  return diffuseTerm + specularTerm;
}

void Pbr_CreateShadingParameters(const in vec3 viewNormal,
                                 const in vec3 viewPosition,
                                 const in vec4 viewLightDirection,
                                 const in mat4 viewInverse,
                                 out ShadingParameters shading) {
  vec3 normalDirection = normalize(viewNormal);
  vec3 viewDirection = -normalize(viewPosition);
  vec3 lightDirection = normalize(viewLightDirection.xyz);
  vec3 halfwayDirection = normalize(viewDirection + lightDirection);

  // Clamping the minimum bound yields better results with values less than or
  // equal to 0, which would otherwise cause discontinuity in the geometry
  // factor. Neubelt and Pettineo 2013, "Crafting a Next-gen Material Pipeline
  // for The Order: 1886"
  shading.normalDotView = max(dot(normalDirection, viewDirection), 1e-4);
  shading.normalDotHalfway =
      clamp(dot(normalDirection, halfwayDirection), 0.0, 1.0);
  shading.normalDotLight =
      clamp(dot(normalDirection, lightDirection), 0.0, 1.0);
  shading.viewDotHalfway =
      clamp(dot(viewDirection, halfwayDirection), 0.0, 1.0);

  // The following calculation can be proven as being equivalent to 1-(N.H)^2 by
  // using Lagrange's identity.
  //
  // ||a x b||^2 = ||a||^2 ||b||^2 - (a . b)^2
  //
  // Since we're using unit vectors: ||N x H||^2 = 1 - (N . H)^2
  //
  // We are calculating it in this way to preserve floating point precision.
  vec3 NxH = cross(normalDirection, halfwayDirection);
  shading.oneMinusNormalDotHalfwaySquared = dot(NxH, NxH);

  shading.worldNormalDirection = (viewInverse * vec4(normalDirection, 0.0)).xyz;
  vec3 reflectDirection = reflect(-viewDirection, normalDirection);
  shading.worldReflectDirection =
      (viewInverse * vec4(reflectDirection, 0.0)).xyz;
}

void Pbr_CreateMaterialParameters(const in vec2 texCoord,
                                  const in sampler2D dfgTexture,
                                  const in ShadingParameters shading,
                                  out MaterialParameters material) {
  // Read the material parameters from the textures
  vec3 albedo = v_ObjColor.rgb;
  vec3 roughnessMetallicAmbientOcclusion = v_ObjColor.rgb;
  // Roughness inputs are perceptually linear; convert them to regular roughness
  // values. Roughness levels approaching 0 will make specular reflections
  // completely invisible, so cap the lower bound. This value was chosen such
  // that (kMinPerceptualRoughness^4) > 0 in fp16 (i.e. 2^(-14/4), rounded up).
  // https://github.com/google/filament/blob/main/shaders/src/common_material.fs#L2
  const float kMinPerceptualRoughness = 0.089;
  material.perceptualRoughness =
      max(roughnessMetallicAmbientOcclusion.r, kMinPerceptualRoughness);
  material.roughness =
      material.perceptualRoughness * material.perceptualRoughness;
  material.metallic = roughnessMetallicAmbientOcclusion.g;
  material.ambientOcclusion = roughnessMetallicAmbientOcclusion.b;

  material.diffuse = albedo * (1.0 - material.metallic);
  // F0 is defined as "Fresnel reflectance at 0 degrees", i.e. specular
  // reflectance when light is grazing a surface perfectly perpendicularly. This
  // value is derived from the index of refraction for a material. Most
  // dielectric materials have an F0 value of 0.00-0.08, which leaves 0.04 as a
  // reasonable constant for a simple roughness/metallic material workflow as
  // implemented by this shader.
  material.f0 = mix(vec3(0.04), albedo, material.metallic);

  // The DFG texture is a simple lookup table indexed by [normal dot view,
  // perceptualRoughness].
  material.dfg =
      textureLod(dfgTexture,
                 vec2(shading.normalDotView, material.perceptualRoughness), 0.0)
          .xy;

  // Energy preservation for multiscattering (see
  // https://google.github.io/filament/Filament.md.html#materialsystem/improvingthebrdfs)
  material.energyCompensation =
      1.0 + material.f0 * (1.0 / material.dfg.y - 1.0);
}

vec3 LinearToSrgb(const vec3 color) {
  vec3 kGamma = vec3(1.0 / 2.2);
  return clamp(pow(color, kGamma), 0.0, 1.0);
}

void main() {
  // Mirror texture coordinates over the X axis
  vec2 texCoord = vec2(v_TexCoord.x, 1.0 - v_TexCoord.y);

  // Skip all lighting calculations if the estimation is not valid.
  if (!u_LightEstimateIsValid) {
    o_FragColor = v_ObjColor;
    return;
  }

  ShadingParameters shading;
  Pbr_CreateShadingParameters(v_ViewNormal, v_ViewPosition,
                              u_ViewLightDirection, u_ViewInverse, shading);

  MaterialParameters material;
  Pbr_CreateMaterialParameters(texCoord, u_DfgTexture, shading, material);

  // Combine the radiance contributions of both the main light and environment
  vec3 mainLightRadiance =
      Pbr_CalculateMainLightRadiance(shading, material, u_LightIntensity);

  vec3 environmentalRadiance = Pbr_CalculateEnvironmentalRadiance(
      shading, material, u_SphericalHarmonicsCoefficients, u_Cubemap);

  vec3 radiance = mainLightRadiance + environmentalRadiance;

  // Convert final color to sRGB color space
  o_FragColor = vec4(LinearToSrgb(radiance), 1.0);
}
```

# 完成品
スクショ下手くそ選手権

![Imgur](https://imgur.com/R15xfnf.png)

## ざっくり OpenGL
それぞれの関数がなんか`Win32 API`みたいでなんか慣れない (-1を返したら失敗とか)

### フラグメントシェーダ / バーテックスシェーダ
バーテックスシェーダってのは頂点をセットするやつらしい。  
フラグメントシェーダはそれに色を付けていく。

### Uniform
`Uniform`を使うと、`CPU`から`GPU`へ値を渡すことができます。（今回では`Kotlin`から`OpenGL`へ値を渡すことができる）

```kotlin
val glslProgram = GLES20.glCreateProgram()

// 省略

// フラグメントシェーダの vColor変数 へ値をセットする
GLES20.glGetUniformLocation(program, "vColor").also { color ->
    // 色をOpenGL (GPU) へ渡す
    GLES20.glUniform4fv(color, 1, floatArrayOf(1.0f, 0.0f, 0.0f, 1.0f), 0)
}
```

```glsl
precision mediump float;

// uniform をつけると取得できる
uniform vec4 vColor;

void main() {
    gl_FragColor = vColor;
}
```

### o_FragColor
ここに `vec4 型` で色をセットすることで反映されます。  
グローバル変数

### vec4
色の指定とかで使う。  
色の場合は 0f から 1f までの RGBA だと思います。  

# 書き換えて遊ぶ

例えば、頂点のつなぎ方を変更することで塗りつぶさない。なんかも出来ます。

`Mesh.java`

```java
VertexBuffer[] vertexBuffers = {
  new VertexBuffer(render, 3, localCoordinates),
  new VertexBuffer(render, 2, textureCoordinates),
  new VertexBuffer(render, 3, normals),
};

IndexBuffer indexBuffer = new IndexBuffer(render, vertexIndices);

// LINE_STRIP にする。これは塗りつぶさない
return new Mesh(render, PrimitiveMode.LINE_STRIP, indexBuffer, vertexBuffers);
```

```java
// これを足す
GLES30.glLineWidth(5f);

GLES30.glDrawArrays(primitiveMode.glesEnum, 0, numberOfVertices);
GLError.maybeThrowGLException("Failed to draw vertex array object", "glDrawArrays");
```

![Imgur](https://imgur.com/jIQrGQL.png)

# ソースコード
多分動く。コミット一応分けておきました。

https://github.com/takusan23/ARCoreGitHubSkyline

とりあえず`APK`欲しい場合は`GitHub Releases`においておきました。

https://github.com/takusan23/ARCoreGitHubSkyline/releases/tag/1.0.0

# おわりに

近くで見るとちゃんと凸凹してる

![Imgur](https://imgur.com/JGt9BvS.png)

## Depth API
写真下手くそですがちゃんと物を検知するようになってます。  
（机の下に置いたらちゃと机の下まで潜らないと描画されない）

## OpenGL要素えぇ
シェーダーすらパクってきたのでほぼ`Kotlin`しか書いてないです。  
もしかしたら `Unity` とかのゲームエンジンがわかる人のほうが使いこなせそう！

## デバッグしんどくない？
`シェーダー`、これコンパイル(`GLES30.glCompileShader`)の際に使われない変数を消すのですが、これのせいで実行時に`Uniform`変数が無いよ！って言われてしまうんですよね。  
あと`printf`みたいなのも(多分)ない(GPUで動いてるので...)のでまじで大変そう。  

一応`GLSLで書かれたシェーダー`を`minify (最適化)`するツールがあるみたいなので、どの変数が要らなくなるかとかをコンパイル前に見ることはできるのかな...？

# おわりに2

そういえば、今無き とらのあな秋葉原店A でやってたこれ、行ってきました

![Imgur](https://imgur.com/xQWMb7r.png)

![Imgur](https://imgur.com/3ALfT8A.png)