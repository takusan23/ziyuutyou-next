---
title: 一部の Android 端末でフラグメントシェーダーの描画が崩れる調査
created_at: 2025-01-24
tags:
- Android
- OpenGL ES
---

どうもこんばんわ。  
フジテレビ、本当にACジャパンの広告ばっかり流れてた

# 本題
`Snapdragon`の`Adreno GPU`だとパット見動いているが、`Exynos ?`が使ってる`Mali GPU`だとなんか黒くなってたり、均一になってない部分がある。  
`WebGL`見た感じ、フラグメントシェーダー自体には問題がなさそ。

| ぼかし（謎の黒い線が見える）              | もざいく（均一になってない）              |
|-------------------------------------------|-------------------------------------------|
| ![Imgur](https://i.imgur.com/RwXRJ7I.png) | ![Imgur](https://i.imgur.com/SmCcee4.png) |

ちなみにシェーダーです。ありざいす。

- https://qiita.com/edo_m18/items/d166653ac0dccbc607dc
- https://github.com/GameMakerDiscord/blur-shaders

# 原因
- https://stackoverflow.com/questions/23759731
- https://stackoverflow.com/questions/9271149

一つの`フレームバッファーオブジェクト`から`texture()`で読み出し & 書き込んでた。  
`OpenGL`はこの同時読み書きを`フィードバックループ`って言っているそうで、未定義動作だった。  
- https://www.khronos.org/opengl/wiki/Framebuffer_Object#Feedback_Loops
- https://www.khronos.org/opengl/wiki/Memory_Model#Framebuffer_objects

本当のところは、2つ`フレームバッファーオブジェクト`を作って、フレームバッファーオブジェクトを描画のたびに入れ替えるような処理が必要だった。

- 2つ作って
    - 描画先を1つ目のフレームバッファーオブジェクトに
    - テクスチャ ID を2つ目のフレームバッファーオブジェクトのものに（2つ目のフレームバッファーオブジェクトに書き込んだので）
    - 描画する
    - 描画先を2つ目のフレームバッファーオブジェクトに
    - テクスチャ ID を1つ目のフレームバッファーオブジェクトのものに（1つ目のフレームバッファーオブジェクトに書き込んだので）
    - 描画する
    - 繰り返し...
- 気が済んだらデフォルトのフレームバッファーオブジェクトに切り替えて画面に描画

# 直した

| ぼかし（きれいになった）                  | もざいく（均一になった）                  |
|-------------------------------------------|-------------------------------------------|
| ![Imgur](https://i.imgur.com/sE5VvLY.png) | ![Imgur](https://i.imgur.com/EcF22HR.png) |


どうすれば使いやすいかはまだ分からんけど、多分こんな感じに2つ持つクラスを作って、

```kotlin
/**
 * 2つのフレームバッファーオブジェクトを交互に使うやつ
 * [pingPong]で交互に取得できます。
 *
 * @param fbo1 ひとつめ
 * @param fbo2 ふたつめ
 */
class FboPingPongManager(
    private val fbo1: FrameBufferObject,
    private val fbo2: FrameBufferObject
) {

    private var first = true

    /**
     * 交互に FBO のテクスチャ ID を取得する
     * @return [NextFbo]
     */
    fun pingPong(): NextFbo {
        // 交互にする
        // フレームバッファーオブジェクトに書き込むとテクスチャとしてフラグメントシェーダーから利用できる
        val nextFbo = if (first) {
            NextFbo(fbo1.textureId, fbo2.frameBuffer)
        } else {
            NextFbo(fbo2.textureId, fbo1.frameBuffer)
        }
        first = !first
        return nextFbo
    }
}

/**
 * ピンポンした FBO
 *
 * @param readTextureId [GLES20.glBindTexture]して、フラグメントシェーダーから FBO を読み出す
 * @param writeFrameBuffer [GLES20.glBindFramebuffer]して、描画内容を FBO に書き込む
 */
data class NextFbo(
    val readTextureId: Int,
    val writeFrameBuffer: Int
)

/**
 * フレームバッファーオブジェクト
 *
 * @param textureId 紐付けしたテクスチャ ID
 * @param frameBuffer 紐付けしたフレームバッファーオブジェクト
 */
data class FrameBufferObject(
    val textureId: Int,
    val frameBuffer: Int
)
```

そしたら実際にフレームバッファーオブジェクトを作成し、  
呼び出す度に切り替える関数を作ります。

```kotlin
fun prepare() {
    // 省略...

    // フレームバッファオブジェクトの用意
    // ピンポンするため2つ（交互に利用。読み取り、書き込みを交互にする）
    val fbo1 = generateFrameBufferObject()
    val fbo2 = generateFrameBufferObject()

    // FBO テクスチャ ID を交互にするクラス
    fboPingPongManager = FboPingPongManager(fbo1, fbo2)
}

private fun pingPongFrameBufferObject() {
    // フレームバッファーオブジェクトを入れ替え
    val nextFbo = fboPingPongManager?.pingPong() ?: return

    // 描画先をフレームバッファオブジェクトに
    GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, nextFbo.writeFrameBuffer)
    checkGlError("glBindFramebuffer")

    // フレームバッファーオブジェクトのテクスチャ指定
    // FBO 用に GLES20.GL_TEXTURE2
    GLES20.glActiveTexture(GLES20.GL_TEXTURE2)
    GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, nextFbo.readTextureId)
    checkGlError("glBindFramebuffer")
}

private fun generateFrameBufferObject(): FrameBufferObject {
    // フレームバッファオブジェクトの保存先になるテクスチャを作成
    val textures = IntArray(1)
    GLES20.glGenTextures(1, textures, 0)
    val fboTextureId = textures.first()
    checkGlError("fbo glGenTextures")
    GLES20.glActiveTexture(GLES20.GL_TEXTURE2)
    GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, fboTextureId)
    checkGlError("fbo glActiveTexture glBindTexture")

    GLES20.glTexImage2D(GLES20.GL_TEXTURE_2D, 0, GLES20.GL_RGBA, width, height, 0, GLES20.GL_RGBA, GLES20.GL_UNSIGNED_BYTE, null)

    // テクスチャの補完とか
    GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR.toFloat())
    GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR.toFloat())
    GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE)
    GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE)
    checkGlError("fbo glTexParameter");

    // フレームバッファオブジェクトを作り、テクスチャをバインドする
    val frameBuffers = IntArray(1)
    GLES20.glGenFramebuffers(1, frameBuffers, 0)
    checkGlError("fbo glGenFramebuffers")
    val framebuffer = frameBuffers.first()
    GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, framebuffer)
    checkGlError("fbo glBindFramebuffer ")

    // 深度バッファを作りバインドする
    val depthBuffers = IntArray(1)
    GLES20.glGenRenderbuffers(1, depthBuffers, 0)
    checkGlError("fbo glGenRenderbuffers")
    val depthBuffer = depthBuffers.first()
    GLES20.glBindRenderbuffer(GLES20.GL_RENDERBUFFER, depthBuffer)
    checkGlError("fbo glBindRenderbuffer")

    // 深度バッファ用のストレージを作る
    GLES20.glRenderbufferStorage(GLES20.GL_RENDERBUFFER, GLES20.GL_DEPTH_COMPONENT16, width, height)
    checkGlError("fbo glRenderbufferStorage")

    // 深度バッファとテクスチャ (カラーバッファ) をフレームバッファオブジェクトにアタッチする
    GLES20.glFramebufferRenderbuffer(GLES20.GL_FRAMEBUFFER, GLES20.GL_DEPTH_ATTACHMENT, GLES20.GL_RENDERBUFFER, depthBuffer)
    checkGlError("fbo glFramebufferRenderbuffer")
    GLES20.glFramebufferTexture2D(GLES20.GL_FRAMEBUFFER, GLES20.GL_COLOR_ATTACHMENT0, GLES20.GL_TEXTURE_2D, fboTextureId, 0)
    checkGlError("fbo glFramebufferTexture2D")

    // 完了したか確認
    val status = GLES20.glCheckFramebufferStatus(GLES20.GL_FRAMEBUFFER)
    if (status != GLES20.GL_FRAMEBUFFER_COMPLETE) {
        throw RuntimeException("Framebuffer not complete, status = $status")
    }

    // デフォルトのフレームバッファに戻す
    // 描画の際には glBindFramebuffer で FBO に描画できる
    GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, 0)

    // 返す
    return FrameBufferObject(textureId = fboTextureId, frameBuffer = framebuffer)
}
```

あとはこれを`フレームバッファーオブジェクト`を`フラグメントシェーダー`で必要としている描画処理の前において終わり。  
断片的すぎてごめん。

```kotlin
fun applyBlur() {
    pingPongFrameBufferObject()

    // ブラーのシェーダーにする
    GLES20.glUseProgram(mProgram)
    checkGlError("glUseProgram")

    // 省略 FBO から読み出したテクスチャへ、ブラーのフラグメントシェーダー適用してぼかす...
}

/** 最後に FBO を描画する */
fun drawFbo() {
    // ちゃんと入れ替える
    pingPongFrameBufferObject()

    // 最後の描画なので FBO ではなくデフォルト（画面）に描画
    GLES20.glBindFramebuffer(GLES20.GL_FRAMEBUFFER, 0)

    // 省略 FBO のテクスチャを描画する...
}
```

# おわりに
わかりにくいですが差分ほしければ...  
https://github.com/takusan23/AkariDroid/commit/eb4ccb6a01ec5b3b3a3ec30a36ac07ea4b7f6992

自作アプリも直してリリースしました。`OpenGL`まわりは何も分からん。先人が多いのだけが救い。