---
title: Google Pixel 11 だけ OpenGL ES を使う自作アプリが起動しないので直した
created_at: 2026-10-07
tags:
- Android
- OpenGL ES
---
どうもこんばんわ。  
下取りに出して`Pixel 11 Pro Fold`にしました。下取りに出してもなお高い金を払う必要があるので、別に見送ってもよかったかもしれません。

使ってみた感じの感想ですが・・・

電波は確実によくなっている。カメラの隣の`LED`じゃなくて、もうとにかく電波がよくなってます。  
てか`Pixel 6`以降が明らかに悪すぎたんですけどね多分、、

折りたたまない方の画面は確かにデカくなってます。  
あとはなんか軽くなった気もします。まあこれでも物理的に重いけど、、

折りたたみの方は`RAM`は一世代前と同じく`16GB`搭載してますが、心なしか利用量が減っている気がします。  
使ったばっかで常駐するプロセスがそもそも少ないとかもあるかも。

気になる点は・・・！

懐中電灯はなんかちょっとだけ暗い気がします。  
`カラーLED`が自撮りカメラの部分に搭載されたわけですが（決めたの人からの着信時に光らせたりできる）、この代償なのか懐中電灯が暗くなった気がします。なんかもっと明るかった気がします。気のせいな気もしなくはない。

あと`GPU`の性能は上がってないと思います。ゲームしないんで別に、、、

# 本題
`Pixel 11`だと`OpenGL ES`を使った自作アプリが起動しない！

```plaintext
java.lang.RuntimeException: glDrawArrays: glError 1282
```

# 原因

```glsl
#version 300 es
#extension GL_EXT_YUV_target : require
precision mediump float;

in vec2 vTextureCoord;
uniform sampler2D sCanvasTexture;
uniform sampler2D sFboTexture;
uniform __samplerExternal2DY2YEXT sSurfaceTexture;

// 何を描画するか
// 1 SurfaceTexture（カメラや動画のデコード映像）
// 2 Bitmap（テキストや画像を描画した Canvas）
// 3 FBO
uniform int iDrawMode;

// SurfaceTexture 時のみ。クロマキー
uniform float chromakeyThreshold; // クロマキーのしきい値。0 でクロマキー無効
uniform vec4 chromakeyColor; // クロマキーにする色

// 出力色
out vec4 FragColor;

// https://github.com/android/camera-samples/blob/a07d5f1667b1c022dac2538d1f553df20016d89c/Camera2Video/app/src/main/java/com/example/android/camera2/video/HardwarePipeline.kt#L107
vec3 yuvToRgb(vec3 yuv) {
  const vec3 yuvOffset = vec3(0.0625, 0.5, 0.5);
  const mat3 yuvToRgbColorTransform = mat3(
    1.1689f, 1.1689f, 1.1689f,
    0.0000f, -0.1881f, 2.1502f,
    1.6853f, -0.6530f, 0.0000f
  );
  return clamp(yuvToRgbColorTransform * (yuv - yuvOffset), 0.0, 1.0);
}

void main() {   
  vec4 outColor = vec4(0.0, 0.0, 0.0, 1.0);

  if (iDrawMode == 1) {
    outColor.rgb = yuvToRgb(texture(sSurfaceTexture, vTextureCoord).rgb);
    
    // クロマキーで透過判定になったら discard
    if (chromakeyThreshold != .0 && length(outColor.rgb - chromakeyColor.rgb) < chromakeyThreshold) {
        discard;
    }
  } else if (iDrawMode == 2) {
    // テクスチャ座標なので Y を反転
    outColor = texture(sCanvasTexture, vec2(vTextureCoord.x, 1.0 - vTextureCoord.y));
  } else if (iDrawMode == 3) {
    outColor = texture(sFboTexture, vTextureCoord);
  }

  FragColor = outColor;
}
```

いろいろいじって分かった。  
わたしのアプリは`10 ビット HDR 映像`を扱うので`uniform sampler2D cameraTexture`ではなく、`uniform __samplerExternal2DY2YEXT cameraTexture`を使っています。

で、`__samplerExternal2DY2YEXT`を`uniform 変数`で宣言している一方、`テクスチャ`は転送せずに`glDrawArrays()`すると失敗するらしいです。  
条件分岐で`テクスチャ`を分岐していて、まあ条件分岐的にテクスチャは使われないからこの`glDrawArrays()`では転送しなくてもいいか。って感じで書いてたのですが、これがダメだった模様。  
まあ私のフラグメントシェーダーの書き方が変だったのが原因だったわけですね。

ただ、`sampler2D`と`samplerExternalOES`の場合は転送しなくても動いてたはずで、なんかよく分かりません、、

後述しますが`Pixel 11`から`OpenGL ES`ドライバーが`ANGLE`になったせいなのかな～

## 修正した
そもそも一つの`フラグメントシェーダー`の中で無理に条件分岐を作る必要はないです。  
代わりに描画したいテクスチャごと（`動画の映像`、`Canvas`、`フレームバッファーオブジェクト`）に分けてフラグメントシェーダーを用意する。

これから描画したいテクスチャに合わせて`フラグメントシェーダー`（正確には`プログラム`）を切り替えるようにすることで動くように直しました。

実際のコードが見たい方は↓  
https://github.com/takusan23/AkariDroid/commit/cd9dfc39a46a1c39ee8f9defb4879c5c49455951

まあ大体こんな感じのコードを書いています。

```kotlin
internal class OpenGlProgram(
    private val vertexShaderCode: String,
    private val fragmentShaderCode: String
) {

    fun prepare() { 
        // ここでプログラムを作って、シェーダーのコンパイルをする...
    }

    fun use() {
        // ここでプログラムを使う、glUseProgram() とか呼ぶ...
    }

    fun setUniform() {
        // uniform 変数を設定する...
    }
}
```

これを、以下のフラグメントシェーダーの分だけ作って

```kotlin
        /** バーテックスシェーダー。vTextureCoord でフラグメントシェーダーへテクスチャ座標を渡します */
        private const val VERTEX_SHADER = """#version 300 es
in vec4 aPosition;
in vec4 aTextureCoord;

uniform mat4 uMVPMatrix;
uniform mat4 uSTMatrix;

out vec2 vTextureCoord;

void main() {
  gl_Position = uMVPMatrix * aPosition;
  vTextureCoord = (uSTMatrix * aTextureCoord).xy;
}
"""

        /**
         * 10Bit HDR 動画のフレームを描画するときに使うフラグメントシェーダー
         *
         * CameraX いわく
         * HDR 動画の場合は GL_EXT_YUV_target を使うべきらしい。
         * SDR のときの samplerExternalOES でも動くには動くらしいが、YUV の方が良いらしい
         * https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:camera/camera-core/src/main/java/androidx/camera/core/processing/util/GLUtils.java;l=92
         */
        private val FRAGMENT_SHADER_10BIT_HDR_YUV = """#version 300 es
#extension GL_EXT_YUV_target : require
precision mediump float;

in vec2 vTextureCoord;
uniform __samplerExternal2DY2YEXT sSurfaceTexture;

uniform float chromakeyThreshold; // クロマキーのしきい値。0 でクロマキー無効
uniform vec4 chromakeyColor; // クロマキーにする色

out vec4 FragColor; // 出力色

// https://github.com/android/camera-samples/blob/a07d5f1667b1c022dac2538d1f553df20016d89c/Camera2Video/app/src/main/java/com/example/android/camera2/video/HardwarePipeline.kt#L107
vec3 yuvToRgb(vec3 yuv) {
  const vec3 yuvOffset = vec3(0.0625, 0.5, 0.5);
  const mat3 yuvToRgbColorTransform = mat3(
    1.1689f, 1.1689f, 1.1689f,
    0.0000f, -0.1881f, 2.1502f,
    1.6853f, -0.6530f, 0.0000f
  );
  return clamp(yuvToRgbColorTransform * (yuv - yuvOffset), 0.0, 1.0);
}

void main() {
    vec3 yuv = texture(sSurfaceTexture, vTextureCoord).xyz;
    vec3 rgb = yuvToRgb(yuv);
    
    // クロマキーで透過判定になったら discard
    if (chromakeyThreshold != .0 && length(rgb.rgb - chromakeyColor.rgb) < chromakeyThreshold) {
        discard;
    }
    
    FragColor = vec4(rgb, 1.0);
}
""".trimIndent()

        /** SDR 動画の時に使うフラグメントシェーダー */
        private val FRAGMENT_SHADER_SDR = """#version 300 es
#extension GL_OES_EGL_image_external_essl3 : require
precision mediump float;

in vec2 vTextureCoord;
uniform samplerExternalOES sSurfaceTexture;

uniform float chromakeyThreshold; // クロマキーのしきい値。0 でクロマキー無効
uniform vec4 chromakeyColor; // クロマキーにする色

out vec4 FragColor; // 出力色

void main() {
    vec4 color = texture(sSurfaceTexture, vTextureCoord);
    
    // クロマキーで透過判定になったら discard
    if (chromakeyThreshold != .0 && length(color.rgb - chromakeyColor.rgb) < chromakeyThreshold) {
        discard;
    }
    
    FragColor = color;
}
""".trimIndent()

        /** Bitmap に書いた Canvas を描画するときに使うフラグメントシェーダー */
        private val FRAGMENT_SHADER_CANVAS_BITMAP = """#version 300 es
precision mediump float;

in vec2 vTextureCoord;
uniform sampler2D sCanvasTexture;

out vec4 FragColor; // 出力色

void main() {
    // テクスチャ座標なので Y を反転
    FragColor = texture(sCanvasTexture, vec2(vTextureCoord.x, 1.0 - vTextureCoord.y));
}
""".trimIndent()

        /** FBO に描画された内容を描画するときに使うフラグメントシェーダー */
        private val FRAGMENT_SHADER_FBO = """#version 300 es
precision mediump float;
in vec2 vTextureCoord;
uniform sampler2D sFboTexture;

out vec4 FragColor; // 出力色

void main() {
    FragColor = texture(sFboTexture, vTextureCoord);
}
""".trimIndent()
```

使うときはこんな感じ

```kotlin
class AkariGraphicsTextureRenderer internal constructor(
    private val width: Int,
    private val height: Int,
    private val isEnableTenBitHdr: Boolean
) {
    // OpenGL ES のプログラムを描画別で作った
    // 一つのフラグメントシェーダーを使い描画内容を分岐する方法を使っていたが、一部の GPU（Pixel 11 ANGLE）では __samplerExternal2DY2YEXT を使う使わない関係なくシェーダーで定義した以上渡さないとエラーになってしまった
    // glDrawArrays: glError 1282
    // Canvas の内容を描画するときは __samplerExternal2DY2YEXT は渡されない状態なので動かなかった。
    // ので、それぞれでフラグメントシェーダーを分けることにした
    private var hdrGlProgram: OpenGlProgram? = null
    private var sdrGlProgram: OpenGlProgram? = null
    private var canvasGlProgram: OpenGlProgram? = null
    private var fboGlProgram: OpenGlProgram? = null

    // canvas で書いて OpenGLES に転写する
    suspend fun drawCanvas(draw: suspend Canvas.() -> Unit) {
        canvas.drawColor(0, PorterDuff.Mode.CLEAR)
        draw(canvas)

        canvasGlProgram?.use()

        GLUtils.texImage2D(GLES20.GL_TEXTURE_2D, 0, canvasBitmap, 0)
        checkGlError("GLUtils.texImage2D")

        // ...
    }
}
```

# ことの始まり

`Google Pixel 11`シリーズは、`OpenGL ES`の命令を`Vulkan`に翻訳して動かす`ANGLE`ドライバーを使っているみたいです。`GPU`の会社が作った`OpenGL ES`のドライバーはもう無い感じ。  
いつかの`Google I/O`で発表してた気がするのでついにか～みたいな。

なので、`GL コンテキスト`があるスレッド（`OpenGL ES`が呼び出せるスレッド、`makeCurrent()`したスレッド）の中でこんな感じの処理を書くと、、

```kotlin
val vendor = GLES20.glGetString(GLES20.GL_VENDOR)
val renderer = GLES20.glGetString(GLES20.GL_RENDERER)
val version = GLES20.glGetString(GLES20.GL_VERSION)
println("OpenGL Info: vendor=$vendor, renderer=$renderer, version=$version")
```

こんな感じに`ANGLE`だよ～みたいな出力になる。おお～

```plaintext
OpenGL Info: vendor=Google Inc. (Imagination Technologies), renderer=ANGLE (Imagination Technologies, Vulkan 1.4.317 (PowerVR C-Series CXTP-48-1536 MC1 (0x70061042)), PowerVR C-Series Vulkan Driver-1.662.3024), version=OpenGL ES 3.2 (ANGLE 2.1 git hash: 8d8796935e4faeaf19e67ac0a5949e71a5252e7f)
```

ちなみに`Pixel 10`シリーズだとこうなってたはず？

```plaintext
vendor=Imagination Technologies / render=PowerVR D-Series DXT-48-1536 / version=OpenGL ES 3.2 build 26.1@6967606
```

で、これのせいなのか知らんけど自作アプリが起動しない。

```plaintext
java.lang.RuntimeException: glDrawArrays: glError 1282
	at io.github.takusan23.akaricore.graphics.AkariGraphicsTextureRenderer.checkGlError(AkariGraphicsTextureRenderer.kt:438)
	at io.github.takusan23.akaricore.graphics.AkariGraphicsTextureRenderer.drawCanvas(AkariGraphicsTextureRenderer.kt:107)
	at io.github.takusan23.akaridroid.canvasrender.VideoTrackRenderer.drawItemRendererToAkariGraphicsProcessor(VideoTrackRenderer.kt:427)
	at io.github.takusan23.akaridroid.canvasrender.VideoTrackRenderer.access$drawItemRendererToAkariGraphicsProcessor(VideoTrackRenderer.kt:58)
	at io.github.takusan23.akaridroid.canvasrender.VideoTrackRenderer$draw$2.invokeSuspend(VideoTrackRenderer.kt:206)
	at io.github.takusan23.akaridroid.canvasrender.VideoTrackRenderer$draw$2.invoke(VideoTrackRenderer.kt:8)
	at io.github.takusan23.akaridroid.canvasrender.VideoTrackRenderer$draw$2.invoke(VideoTrackRenderer.kt:4)
	at io.github.takusan23.akaricore.graphics.AkariGraphicsProcessor$drawOneshot$2.invokeSuspend(AkariGraphicsProcessor.kt:105)
	at kotlin.coroutines.jvm.internal.BaseContinuationImpl.resumeWith(ContinuationImpl.kt:34)
	at kotlinx.coroutines.DispatchedTask.run(DispatchedTask.kt:100)
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:520)
	at java.util.concurrent.FutureTask.run(FutureTask.java:328)
	at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:323)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1100)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:1572)
```

いろいろ見た感じ`__samplerExternal2DY2YEXT`のせいっぽかったわけですが、ほかのサンプルコード（`cameraX`の`HDR 動画`の処理）とかを見る感じ`__samplerExternal2DY2YEXT`を使っているのに動いてるんですよね。  
つまり私がなんかやらかしてる。

で色々見た結果、`ANGLE`ドライバーだと？、`__samplerExternal2DY2YEXT`は使う使わないによらず、フラグメントシェーダーで宣言した以上一度はテクスチャを転送しないと、このようなエラーが出てしまうみたい。  
まあ普通宣言したなら転送しろよという話ではある、、

# おわりに
数年前くらいの`Google I/O`で`OpenGL ES`ドライバーが`ANGLE`になるのは数年先とか言って、今がこの数年先か～とか思ってたんですが、  
それよりも前から`ANGLE`を`GLES`ドライバーとして使ってたスマホがあった模様。`Galaxy Sシリーズ`の`Exynos`搭載版らしいです。（しかし日本版は`Snapdragon`なのでセーフ！）

おわりです。