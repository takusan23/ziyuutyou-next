---
title: Pixel 8 シリーズの AV1 ハードウェアエンコーダーを使ってみた
created_at: 2023-12-31
tags:
- Android
- Kotlin
- Pixel8Pro
- AV1
- MediaCodec
- OpenGL
---

どうもこんばんわ。  
D.S. i.F. -Dal Segno- in Future 攻略しました。なんと本作は名前を呼んでくれます。  
イベントCGがどれも可愛いのがいい！浴衣姿！！だ！  

![Imgur](https://i.imgur.com/7xN2gt7.png)

![Imgur](https://i.imgur.com/rpOXzad.png)

![Imgur](https://i.imgur.com/nvm54y4.png)

前作とは打って変わった挑戦のお話、新鮮だった

![Imgur](https://i.imgur.com/5pMrsLb.png)

かわいい！！けど鳴ちゃんは攻略できない、かなしい

![Imgur](https://i.imgur.com/bQnfKN9.png)

二人並んでるのがかわいい！！この中なら一番のシナリオかも？

![Imgur](https://i.imgur.com/vKKGFel.png)

![Imgur](https://i.imgur.com/n0AeGwL.png)

この子のルートでクイズがあるんだけど全く分からんかった、、、むずかしい  
いろんな服装が見れるので見ておくべきです

![Imgur](https://i.imgur.com/nPeLQuA.png)

あたふたしてるのかわいー

![Imgur](https://i.imgur.com/VD1vtZI.png)

![Imgur](https://i.imgur.com/YtAIGt3.png)

ひまりちゃんが可愛かったです！！  
おすすめ、イベントCGよかった  

![Imgur](https://i.imgur.com/pk8mTxf.png)

この服すき

![Imgur](https://i.imgur.com/QsV5E6e.png)

![Imgur](https://i.imgur.com/DLvxfSU.png)

![Imgur](https://i.imgur.com/oXfXgN8.png)  
天ルート短くて悲しすぎる、、なにかあるのかと思ったら何もなかった；；

えっちしーんもよかった、~~前作は寸止めばっかだったし、、~~  
えちえちシーン良かったから R-18 ゲームまた作ってくれないかな、、、、どうか～

# 本題
`Pixel 8 Pro`を買ってました、`Xperia 1 V`も今年買ったのでお金ありません。  
5 万の（Googleストアの）キャッシュバックがあった（発売直後くらいにやってた）とはいえ、値段がもろハイエンドなので同じ価格帯の端末と比べてボロボロに言われているイメージ。  

`Pro`の方は忘れがちですが、温度計が付いてますね。  
`API`で呼び出したいところではありますが、残念ながらサードパーティが使えない権限で保護されています。おもんね～～～

https://twitter.com/MishaalRahman/status/1715514224183484626

# Pixel 8 シリーズには AV1 ハードウェアエンコーダーが搭載されている
リークで噂されてましたが、本当に`Pixel 8 シリーズ`にはハードウェアアクセラレーションされた`AV1`エンコーダを載せているそうです。  
`AV1`のハードウェアエンコード、まだ`値段が高いGPU`でしか出来ないとかでスマホとかには当分来ないと思ってたんですけどどういう事？

```kotlin
MediaCodecList(MediaCodecList.ALL_CODECS)
    .codecInfos
    .filter { it.isEncoder } // エンコーダーのみ
    .forEach {
        println("name = ${it.canonicalName} / isHardwareAccelerated = ${it.isHardwareAccelerated} / isSoftwareOnly = ${it.isSoftwareOnly}")
    }
```

搭載しているエンコーダー一覧を出してみた結果（`Pixel 8 Pro`）  
重要そうな部分を抜き出しました。

```plaintext
name = c2.exynos.vp8.encoder / isHardwareAccelerated = true / isSoftwareOnly = false
name = c2.exynos.vp9.encoder / isHardwareAccelerated = true / isSoftwareOnly = false
name = c2.google.av1.encoder / isHardwareAccelerated = true / isSoftwareOnly = false
name = c2.android.av1.encoder / isHardwareAccelerated = false / isSoftwareOnly = true
```
マジだ！！`AV1 エンコーダー`（`c2.google.av1.encoder`）がソフトウェアではなくハードウェアで実装されていることが分かりますね。  
あとすごくどうでもいいですが`Google Tensor`の元が`Samsung Exynos`であることもコレでバレちゃいますね。あは

ちなみに`AV1`のハードウェアデコードは`Pixel 6`から搭載されてます（**AV1 デコードも初だったかな**）。`Snapdragon`も`8 Gen 2`からハードウェアでデコード出来るらしい。  
今年出た`iPhone 15 Pro`にも`AV1`ハードウェアデコードが入っているらしい。  
`Apple`陣営は`HEVC`じゃなかったんかい！  
https://www.theverge.com/2018/1/4/16850402  

`AV1`の動画が流行ればより動画を圧縮してお届け出来るので、携帯の通信料が減らせるかもしれませんね。

ところで知ってる限り、スマホにハードウェアエンコーダ載せたの`Pixel 8 シリーズ`が初だと思うんだけど、なんかあんまり宣伝とかされてないな。。。  
カメラアプリには`HEVC`でエンコードして保存するオプションがあるくらいだから、`AV1`でエンコードする設定もあっても良いとは思う・・？  
やっぱりハードウェアデコードがまだ浸透してないとかで辞めたんですかね？いい宣伝になるとは思うんだけど。

# Android 14 からソフトウェアの AV1 エンコーダーが搭載されてそう
手元の`Pixel 6 Pro`でもエンコードが出来た。  
`Android 14`にすると`AV1 ソフトウェアエンコーダー`が`AOSP`に入っているんですかね？

```kotlin
MediaCodecList(MediaCodecList.ALL_CODECS)
    .codecInfos
    .filter { it.isEncoder } // エンコーダーのみ
    .forEach {
        println("name = ${it.canonicalName} / isHardwareAccelerated = ${it.isHardwareAccelerated} / isSoftwareOnly = ${it.isSoftwareOnly}")
    }
```

```plaintext
name = c2.exynos.vp8.encoder / isHardwareAccelerated = true / isSoftwareOnly = false
name = c2.exynos.vp9.encoder / isHardwareAccelerated = true / isSoftwareOnly = false
name = c2.android.av1.encoder / isHardwareAccelerated = false / isSoftwareOnly = true
name = c2.android.vp8.encoder / isHardwareAccelerated = false / isSoftwareOnly = true
name = c2.android.vp8.encoder / isHardwareAccelerated = false / isSoftwareOnly = true
name = c2.android.vp9.encoder / isHardwareAccelerated = false / isSoftwareOnly = true
name = c2.android.vp9.encoder / isHardwareAccelerated = false / isSoftwareOnly = true
```

これもすごくどうでもいいですが、`NTT ドコモ`が`Android API`を叩いた結果を公開してくれているので、ドコモ端末なら買わずに分かったりなんとか。  
（叩いた結果を公開とか相当なもの好きだろこれ）

https://spec.nttdocomo.co.jp/spmss/spec/SO-51D__13_.html

## HEVC
対抗馬として`HEVC（H.265）`っていう敵がいて、しかもこっちは既にハードウェアエンコード・デコードが入ってたりする。  
なんなら`AV1`といい勝負をするらしい。

これでええやんって話ですが良くない。というのもなんか特許がよく分からん状態になってて、例えばブラウザで再生できないらしい？。  
下手に手を出せない感じなんでしょうか  
https://developer.mozilla.org/ja/docs/Web/Media/Formats/Video_codecs#hevc_h.265

`AV1`はその辺きれいになっているらしく、ほとんどのブラウザで再生可能です。スマホもハードウェアデコーダーが載り始めたので時間が解決し始めてる。  
後発組だから今ひとつだけど、`HEVC 派閥の Apple が iPhone`にハードウェアデコーダーを載せたあたり未来は明るいかもしれない。  
https://developer.mozilla.org/ja/docs/Web/Media/Formats/Video_codecs#av1

# AV1 な動画を Android で作るには
映像コーデックを`AV1`に設定するだけですね。  
`高レベルAPI`の`MediaRecorder`と、`低レベルAPI`の`MediaCodec`にそれぞれ、`AV1`用の値があるのでそれを設定すれば良いはず。  

また、コンテナフォーマットは`mp4`のみです。`Android`だと`WebM`には書き込めないみたいです。  
（`WebM`的には`AV1`を正式にサポートしてないみたい、ただ再生できるプレイヤーが結構あるので実質対応みたいな感じになってるらしい？）

もちろん**自前で**`WebM`に書き込む処理を書けば`AV1`も入れられると思う。  
コンテナに書き込む処理を自前で作るのはとても大変ですが、、、

https://takusan.negitoro.dev/posts/tag/WebM/

## MediaRecorder
`setVideoEncoder`に`MediaRecorder.VideoEncoder.AV1`を入れれば良いはず。  
https://developer.android.com/reference/android/media/MediaRecorder.VideoEncoder#AV1

```kotlin
val mediaRecorder = (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) MediaRecorder(context) else MediaRecorder()).apply {
    // メソッド呼び出しには順番があります
    setVideoSource(MediaRecorder.VideoSource.SURFACE)
    setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
    setVideoEncoder(MediaRecorder.VideoEncoder.AV1)
    setVideoEncodingBitRate(1_000_000)
    setVideoFrameRate(30)
    setVideoSize(1280, 720)
    setAudioEncodingBitRate(128_000)
    setAudioSamplingRate(44_100)
    setOutputFile(resultFile.path)
    prepare()
}
```

## MediaCodec
`MediaFormat.createVideoFormat`に`MediaFormat.MIMETYPE_VIDEO_AV1`を入れて、`MediaCodec`をセットアップすれば良いはず。  
https://developer.android.com/reference/android/media/MediaFormat#MIMETYPE_VIDEO_AV1

```kotlin
// コーデックに AV1 を指定
val codecName = MediaFormat.MIMETYPE_VIDEO_AV1

// TODO ビットレートの設定
val videoMediaFormat = MediaFormat.createVideoFormat(codecName, 1280, 720)

// MediaCodec
val mediaCodec = MediaCodec.createEncoderByType(codecName)
mediaCodec.configure(videoMediaFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
```

今回は`MediaRecorder`/`MediaCodec`どっちも試してみます。


# 動画を選んで AV1 で再エンコードするアプリを作ってみる
~~カメラアプリは作るのめっちゃクソ大変なので、すでにある動画を変換するアプリを作ろうと思います。~~  
結局カメラアプリを作ります。

## 流れ

![Imgur](https://i.imgur.com/AJHmmvr.png)

映像はコレで良いはず。音声に関しては入力する動画のコーデックが`AAC`の場合は多分入れ直すだけでいいはず。  
ただ、元データが`WebM（VP9 + Opus）`の場合は`AAC`に変換しないとダメですね。

![Imgur](https://i.imgur.com/6YhFbgN.png)

多分`OpenGL`をデコーダーとエンコーダーの間にかませる必要があります。  
デコーダーの出力先`Surface`にエンコーダーの入力`Surface`をそのまま渡したんですが、なんかうまく動きませんでした。  
（正確に言うと同じコーデックの場合は問題がない？`AVC`→`VP9`を試したらダメだった。なんか`dequeueOutputBuffer`がずっと`-1`とか返してて使えなかった）

ちなみに同じコーデックでも`OpenGL`を一度経由させるメリットがあります。  
複数の動画をつなげるとかの場合に、動画の幅高さが変化するような場合は`OpenGL`を利用しないと映像がぶっ壊れます。  
あと`OpenGL`を使えば解像度の変更？が出来るので多分経由するメリットはあります。  

もちろん`GLSL ? ふらぐめんとしぇーだー ?`分かるならエンコーダーに渡す前にフレームにエフェクトを掛けることが出来ます。（モノクロとか左右反転とか）  
が、`AOSP`からコピーしてくることにするので何やってるかはよくわからない。。。

- https://github.com/takusan23/AndroidMediaCodecVideoMerge/issues/1
- https://takusan.negitoro.dev/posts/android_mediacodec_merge_video/#おまけ

今回作ってみる動画は **コンテナフォーマットこそ mp4 (拡張子 .mp4)** ですが、プレイヤー側で`AV1`がデコードできないと再生できません。（`AAC`デコーダーは入ってるやろ）  
紛らわしいかな？やっぱ`webm`にも入れられるようにして欲しい。

箇条書きにすると

- `MediaExtractor`に動画データを入れる
- エンコーダー、デコーダーの`MediaCodec`と`OpenGL`を用意
- デコーダーに`MediaExtractor`で取り出したデータを渡してデコードする
- テクスチャが来るので OpenGL で描画する
- エンコーダーからエンコードされたデータが出力されるのを待つ
- `MediaMuxer`に入れる
- データが終わるまで続ける
- 音声トラックを戻す
    - 先述の通りコーデックが`AAC`以外の場合はこれも変換する必要があります
    - AAC じゃなくても`mp4`に入れば良い気がしてきた
- `MediaStore`を使って端末の動画フォルダに入れる
    - `Android`のファイルの仕様がなんか使いにくいので、作業中は`Java`の`File API`を使っていきます
    - が、`Java`の`File API`では端末の動画フォルダとかにはアクセスできないので、`MediaStore`にお願いします。

ただ再エンコードして入れ直すので、`MediaCodec`の記事をいくつか書いてきましたが、その中でおそらく一番楽かもしれない？

## 登場人物

### コーデック
`VP9` `AV1` `H.264 (AVC)` `H.265 (HEVC)` とかの圧縮方式のやつ。お弁当箱に入れる食べ物です  
音声なら `AAC` とか `Opus`。  

パラパラ漫画をGIFで作るのと、パラパラ漫画を動画で作るので、サイズを比較すると動画のほうが圧倒的に小さいのはコーデックが圧縮してくれてるからなんですね。  
（全てのフレームを持つとサイズが大きくなるので、前のフレームとの差分だけ持つなどの工夫をしている。らしい、キーフレームとかなんとか）

`mp4`とか`webm`とかはコンテナフォーマットなので、コーデックではありません。  

https://aviutl.info/ko-dekku-konntena/

### コンテナフォーマット
`mp4`とか`webm`とか。エンコードされたデータの入れ物です。お弁当箱です  

`AV1`でエンコードされたデータはそのままでは再生できないので、コンテナフォーマットに入れて保存します。  
（メタデータが入っていないので再生するためのデコーダーが起動出来ない）

#### MP4 はコンテナなので
お弁当箱なので、実際に再生できるかどうかは中に入ってるコーデック次第なんですよね。  
うーん、この辺の話をしてると、`ffmpeg`ってほんと良しなにやってくれてたんだなあって。  

`.mp4`形式でちょうだいって言われて、中身`AVC`じゃなくて`HEVC`のコーデック入れたら大混乱になりそう。だってそのままだと`HEVC`再生出来ないんだもん  
![Imgur](https://i.imgur.com/TXwPxOX.png)

### MediaExtractor
コンテナフォーマット（`mp4`、`webm`）からメタデータや実際のエンコードされたデータを取り出すやつ

### MediaCodec
エンコーダー・デコーダーです。  
エラーが分かりにくいというか分からない。

### MediaMuxer
エンコーダーから出てきたデータを入れるやつです。  
映像と音声をそれぞれ`mp4 / webm`に書き込んでくれるやつです。

### OpenGL
よく分からん。今回も今回とて`AOSP`の`MediaCodec`のテストで使われている`OpenGL`周りのコードをコピーしてくることにします。（`Apache-2.0 license`）  

- https://cs.android.com/android/platform/superproject/main/+/main:cts/tests/tests/media/common/src/android/media/cts/InputSurface.java
- https://cs.android.com/android/platform/superproject/main/+/main:cts/tests/tests/media/common/src/android/media/cts/TextureRender.java

# 作る

上で言った？とおり`OpenGL`はコピペするので`Kotlin`できれば良いはず

| なまえ         | あたい                           |
|----------------|----------------------------------|
| Android Studio | Android Studio Hedgehog 2023.1.1 |
| 言語           | Kotlin 1.9.20 / OpenGL ES 2.0    |
| 端末           | Pixel 8 Pro / Pixel 6 Pro        |

最低`Android`バージョンは`14 (SDK 34)`です。多分`AV1`エンコーダーがソフトウェアでも乗ってるのが`14`以降なはず？  
手元の`14`系の端末が`Pixel`しかない...

![Imgur](https://i.imgur.com/J1vw62s.png)

~~アプリの名前は特に思いつかなかったのでエロゲヒロインから取りました~~

## OpenGL 周りを AOSP から借りてくる
返しませんが。借りパクです。  
`OpenGL`周りはこの2つで、これらを`Kotlin`化したものを使います。  
`Apache-2.0 license`  

- https://cs.android.com/android/platform/superproject/main/+/main:cts/tests/tests/media/common/src/android/media/cts/TextureRender.java
- https://cs.android.com/android/platform/superproject/main/+/main:cts/tests/tests/media/common/src/android/media/cts/InputSurface.java

![Imgur](https://i.imgur.com/LMMtuzK.png)

```kotlin
/*
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

package io.github.takusan23.himaridroid.transcode

import android.graphics.SurfaceTexture
import android.opengl.EGL14
import android.opengl.EGLConfig
import android.opengl.EGLExt
import android.view.Surface

class InputSurface(
    private val surface: Surface,
    private val textureRenderer: TextureRenderer
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
        surfaceTexture = SurfaceTexture(textureRenderer.textureId).also { surfaceTexture ->
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

    fun drawImage() {
        val surfaceTexture = surfaceTexture ?: return
        textureRenderer.drawFrame(surfaceTexture)
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

```kotlin
/*
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

package io.github.takusan23.himaridroid.transcode

import android.graphics.SurfaceTexture
import android.opengl.GLES11Ext
import android.opengl.GLES20
import android.opengl.Matrix
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer

/**
 * Code for rendering a texture onto a surface using OpenGL ES 2.0.
 */
class TextureRenderer {

    private val mTriangleVertices: FloatBuffer
    private val mMVPMatrix = FloatArray(16)
    private val mSTMatrix = FloatArray(16)
    private var mProgram = 0
    private var muMVPMatrixHandle = 0
    private var muSTMatrixHandle = 0
    private var maPositionHandle = 0
    private var maTextureHandle = 0
    private val rotationAngle = 0

    var textureId = -1234567
        private set

    init {
        mTriangleVertices = ByteBuffer.allocateDirect(mTriangleVerticesData.size * FLOAT_SIZE_BYTES).order(ByteOrder.nativeOrder()).asFloatBuffer()
        mTriangleVertices.put(mTriangleVerticesData).position(0)
        Matrix.setIdentityM(mSTMatrix, 0)
    }

    fun drawFrame(st: SurfaceTexture) {
        checkGlError("onDrawFrame start")
        st.getTransformMatrix(mSTMatrix)
        GLES20.glUseProgram(mProgram)
        checkGlError("glUseProgram")
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, textureId)
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
        GLES20.glUniformMatrix4fv(muSTMatrixHandle, 1, false, mSTMatrix, 0)
        GLES20.glUniformMatrix4fv(muMVPMatrixHandle, 1, false, mMVPMatrix, 0)
        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
        checkGlError("glDrawArrays")
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
        val textures = IntArray(1)
        GLES20.glGenTextures(1, textures, 0)
        textureId = textures[0]
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, textureId)
        checkGlError("glBindTexture mTextureID")
        GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_NEAREST.toFloat())
        GLES20.glTexParameterf(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR.toFloat())
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE)
        checkGlError("glTexParameter")
        Matrix.setIdentityM(mMVPMatrix, 0)
        // if (rotationAngle != 0) {
        //     Matrix.rotateM(mMVPMatrix, 0, rotationAngle, 0, 0, 1)
        // }
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
        var error: Int
        if (GLES20.glGetError().also { error = it } != GLES20.GL_NO_ERROR) {
            throw RuntimeException("$op: glError $error")
        }
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
uniform samplerExternalOES sTexture;
void main() {
  gl_FragColor = texture2D(sTexture, vTextureCoord);
}
"""
    }
}
```

## MainActivity
`Jetpack Compose`を使います。  
`HomeScreen`コンポーネントを作って表示させます。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            HimariDroidTheme {
                HomeScreen()
            }
        }
    }
}
```

## 動画を選ぶ処理

`rememberLauncherForActivityResult`でフォトピッカーを開いて、動画を選んでもらいます。  
ユーザーが選ぶタイプなので、権限は必要ないです。

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen() {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val videoUri = remember { mutableStateOf<Uri?>(null) }

    val videoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri -> videoUri.value = uri }
    )

    Scaffold(
        topBar = { TopAppBar(title = { Text(text = "ひまりどろいど") }) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .padding(20.dp)
        ) {

            Text(text = "動画の選択", fontSize = 20.sp)
            Button(onClick = {
                videoPicker.launch(PickVisualMediaRequest(mediaType = ActivityResultContracts.PickVisualMedia.VideoOnly))
            }) { Text(text = "動画を選ぶ") }

            if (videoUri.value != null) {
                Text(text = videoUri.value.toString())
                Button(onClick = {
                    // TODO
                }) { Text(text = "処理を始める") }
            }
        }
    }
}
```

## MediaExtractor を作る
選択した動画を解析してくれる`MediaExtractor`を作ります。  
実際のエンコードされたデータを取り出す + 動画のメタデータの解析をしてくれます。

適当なユーティリティークラスを作ってそこに書きました。

```kotlin
object MediaTool {

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

## 映像の再エンコード部分
もう一気に貼ります。  
これが`MediaExtractor`からデータを貰って、`MediaCodec`でデコードして`OpenGL`でレンダリングしてそれをエンコーダーに渡す処理です。

解説というか説明はコメントに書いたのでそっちを見たら良いと思う！よ

```kotlin
object VideoProcessor {

    /** MediaCodec タイムアウト */
    private const val TIMEOUT_US = 10_000L

    /** 再エンコードする */
    suspend fun start(
        mediaExtractor: MediaExtractor,
        inputMediaFormat: MediaFormat,
        codec: String,
        bitRate: Int,
        keyframeInterval: Int,
        onOutputFormat: (MediaFormat) -> Unit,
        onOutputData: (ByteBuffer, MediaCodec.BufferInfo) -> Unit
    ) = withContext(Dispatchers.Default) {

        // 解析結果から各パラメータを取り出す
        // 動画の幅、高さは16の倍数である必要があります
        val width = inputMediaFormat.getInteger(MediaFormat.KEY_WIDTH)
        val height = inputMediaFormat.getInteger(MediaFormat.KEY_HEIGHT)
        val frameRate = runCatching { inputMediaFormat.getInteger(MediaFormat.KEY_FRAME_RATE) }.getOrNull() ?: 30

        // エンコーダーにセットするMediaFormat
        val videoMediaFormat = MediaFormat.createVideoFormat(codec, width, height).apply {
            setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
            setInteger(MediaFormat.KEY_FRAME_RATE, frameRate)
            setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, keyframeInterval)
            setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
        }

        // エンコード用 MediaCodec
        val encodeMediaCodec = MediaCodec.createEncoderByType(codec).apply {
            configure(videoMediaFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        }

        // エンコーダーの Surface を取得
        // デコーダーの出力 Surface にこれを指定して、エンコーダーに映像データが Surface 経由で行くようにする
        // なんだけど、直接 Surface を渡すだけではなくなんか OpenGL を利用しないと正しく描画できないみたい
        val codecInputSurface = InputSurface(encodeMediaCodec.createInputSurface(), TextureRenderer())
        codecInputSurface.makeCurrent()
        codecInputSurface.createRender()

        // デコード用 MediaCodec
        val decodeMediaCodec = MediaCodec.createDecoderByType(inputMediaFormat.getString(MediaFormat.KEY_MIME)!!).apply {
            // デコード時は MediaExtractor の MediaFormat で良さそう
            configure(inputMediaFormat, codecInputSurface.drawSurface, null, 0)
        }

        // 処理を始める
        encodeMediaCodec.start()
        decodeMediaCodec.start()
        val bufferInfo = MediaCodec.BufferInfo()
        var isOutputEol = false
        var isInputEol = false

        try {
            while (!isOutputEol) {

                // コルーチンキャンセル時は強制終了
                if (!isActive) break

                // デコーダーに渡す部分
                if (!isInputEol) {
                    val inputBufferId = decodeMediaCodec.dequeueInputBuffer(TIMEOUT_US)
                    if (inputBufferId >= 0) {
                        val inputBuffer = decodeMediaCodec.getInputBuffer(inputBufferId)!!
                        val size = mediaExtractor.readSampleData(inputBuffer, 0)
                        if (size > 0) {
                            // デコーダーへ流す
                            decodeMediaCodec.queueInputBuffer(inputBufferId, 0, size, mediaExtractor.sampleTime, 0)
                            mediaExtractor.advance()
                        } else {
                            // もう無い
                            decodeMediaCodec.queueInputBuffer(inputBufferId, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
                            // 終了
                            isInputEol = true
                        }
                    }
                }

                // エンコーダーから映像を受け取る部分
                // 二重 while になっているのは、デコーダーに渡したデータが一回の処理では全て受け取れないので、何回か繰り返す
                var decoderOutputAvailable = true
                while (decoderOutputAvailable) {
                    // Surface経由でデータを貰って保存する
                    val outputBufferId = encodeMediaCodec.dequeueOutputBuffer(bufferInfo, TIMEOUT_US)
                    if (outputBufferId >= 0) {
                        val encodedData = encodeMediaCodec.getOutputBuffer(outputBufferId)!!
                        if (bufferInfo.size > 1) {
                            if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG == 0) {
                                // MediaMuxer へ addTrack した後
                                onOutputData(encodedData, bufferInfo)
                            }
                        }
                        isOutputEol = bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0
                        encodeMediaCodec.releaseOutputBuffer(outputBufferId, false)
                    } else if (outputBufferId == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                        // MediaMuxer へ映像トラックを追加するのはこのタイミングで行う
                        // このタイミングでやると固有のパラメーターがセットされた MediaFormat が手に入る(csd-0 とか)
                        // 映像がぶっ壊れている場合（緑で塗りつぶされてるとか）は多分このあたりが怪しい
                        val newFormat = encodeMediaCodec.outputFormat
                        onOutputFormat(newFormat)
                    }
                    if (outputBufferId != MediaCodec.INFO_TRY_AGAIN_LATER) {
                        continue
                    }

                    // Surfaceへレンダリングする。そしてOpenGLでゴニョゴニョする
                    val inputBufferId = decodeMediaCodec.dequeueOutputBuffer(bufferInfo, TIMEOUT_US)
                    if (inputBufferId == MediaCodec.INFO_TRY_AGAIN_LATER) {
                        decoderOutputAvailable = false
                    } else if (inputBufferId >= 0) {
                        val doRender = bufferInfo.size != 0
                        decodeMediaCodec.releaseOutputBuffer(inputBufferId, doRender)
                        // OpenGL を経由しないとエンコーダーに映像が渡らないことがあった
                        if (doRender) {
                            var errorWait = false
                            try {
                                codecInputSurface.awaitNewImage()
                            } catch (e: Exception) {
                                errorWait = true
                            }
                            if (!errorWait) {
                                codecInputSurface.drawImage()
                                codecInputSurface.setPresentationTime(bufferInfo.presentationTimeUs * 1000)
                                codecInputSurface.swapBuffers()
                            }
                        }
                        if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) {
                            decoderOutputAvailable = false
                            encodeMediaCodec.signalEndOfInputStream()
                        }
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            // リソース開放
            encodeMediaCodec.release()
            decodeMediaCodec.release()
            codecInputSurface.release()
            mediaExtractor.release()
        }
    }

}
```

## 音声トラックを追加する処理
`AV1`でエンコードされたデータにはまだ音声トラックがない（映像だけしか入ってない）  
ので、音声トラックを追加して音声データを入れる処理です。

音声データは元の動画からそのまま持ってこようと思います、が先述の通り、  
`AAC`以外（`mp4`に入らないコーデックの場合）の場合は音声データの方も再エンコードが必要です。

大抵のファイルは`mp4 (AVC / AAC)`なのでまあ...そのまま入れ直すだけで動くんじゃない？

```kotlin
object MediaTool {
    // 省略

    /** 音声トラックと映像トラックを一つのファイルにする。 */
    @SuppressLint("WrongConstant")
    suspend fun mixAvTrack(
        audioPair: Pair<MediaExtractor, MediaFormat>,
        videoPair: Pair<MediaExtractor, MediaFormat>,
        resultFile: File
    ) = withContext(Dispatchers.IO) {
        // 各ファイルから MediaExtractor を作る
        val (audioMediaExtractor, audioFormat) = videoPair
        val (videoMediaExtractor, videoFormat) = audioPair

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

## 端末の動画フォルダに保存する処理
完成した動画ファイルは`getExternalFilesDir`の中にあるので、端末の動画フォルダに移動させます  
`getExternalFilesDir`のパスは`sdcard/Android/data/data/{パッケージ名}`になります。  
`AndroidStudio`の`Device Explorer`で見れば良いんじゃない

このファイルはサードパーティのファイラーでは見れず、`Android 標準のファイラー（パッケージ名 : com.android.documentsui）`を使わないと見れなくなりました。  
（アプリ一覧画面に無いので、自分で`Intent`を投げる必要があります）  

かなり不便だからなんとかして欲しい

```kotlin
object MediaTool {
    // 省略

    /** 端末の動画フォルダに保存する */
    suspend fun saveToVideoFolder(
        context: Context,
        file: File
    ) = withContext(Dispatchers.IO) {
        val contentResolver = context.contentResolver
        val contentValues = contentValuesOf(
            MediaStore.MediaColumns.DISPLAY_NAME to file.name,
            MediaStore.MediaColumns.RELATIVE_PATH to "${Environment.DIRECTORY_MOVIES}/HimariDroid"
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

## 組み合わせる
最後にこれらを組み合わせて、再エンコードをする処理を書きます。

```kotlin
object ReEncodeTool {

    suspend fun start(
        context: Context,
        inputUri: Uri,
        videoBitrate: Int
    ) = withContext(Dispatchers.Default) {
        // 再エンコードをする
        // とりあえず音声は AAC が入ってくることを期待して映像のみ再エンコードする
        val videoOnlyFile = context.getExternalFilesDir(null)!!.resolve("temp_video_only_${System.currentTimeMillis()}.mp4")
        startVideoProcess(
            resultFile = videoOnlyFile,
            context = context,
            inputUri = inputUri,
            videoBitrate = videoBitrate
        )

        // これだと映像だけなので、音声トラックを追加する。これで AV1 でエンコードした動画ができる。
        // このままだと端末の動画フォルダにコピーされないので、後でその対応をします
        val resultFile = context.getExternalFilesDir(null)!!.resolve("av1_encode_${System.currentTimeMillis()}.mp4")
        MediaTool.mixAvTrack(
            audioPair = MediaTool.createMediaExtractor(context, inputUri, MediaTool.Track.AUDIO),
            videoPair = MediaTool.createMediaExtractor(videoOnlyFile, MediaTool.Track.VIDEO),
            resultFile = resultFile,
        )

        // 端末の動画フォルダにコピーする
        MediaTool.saveToVideoFolder(context, resultFile)
        // 余計なファイルを消す
        videoOnlyFile.delete()
        resultFile.delete()
    }

    private suspend fun startVideoProcess(
        resultFile: File,
        context: Context,
        inputUri: Uri,
        videoBitrate: Int
    ) {
        // MediaExtractor
        val (videoExtractor, inputVideoFormat) = MediaTool.createMediaExtractor(context, inputUri, MediaTool.Track.VIDEO)

        // コンテナに書き込むやつ
        var trackIndex = -1
        val mediaMuxer = MediaMuxer(resultFile.path, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)

        // 再エンコードをする
        VideoProcessor.start(
            mediaExtractor = videoExtractor,
            inputMediaFormat = inputVideoFormat,
            codec = MediaFormat.MIMETYPE_VIDEO_AV1,
            bitRate = videoBitrate,
            keyframeInterval = 1,
            onOutputFormat = { format ->
                // onOutputData より先に呼ばれるはずです
                trackIndex = mediaMuxer.addTrack(format)
                mediaMuxer.start()
            },
            onOutputData = { byteBuffer, bufferInfo ->
                mediaMuxer.writeSampleData(trackIndex, byteBuffer, bufferInfo)
            }
        )

        // 終わり
        mediaMuxer.stop()
    }

}
```

後はこれを`Jetpack Compose`で作った`UI`側で呼び出せば良いはず  
せっかくなので、ビットレートを入力できるようにしてみました。

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen() {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val videoUri = remember { mutableStateOf<Uri?>(null) }

    val bitrate = remember { mutableStateOf(1_000_000.toString()) }
    val statusText = remember { mutableStateOf("待機中") }

    val videoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri -> videoUri.value = uri }
    )

    fun start() {
        val uri = videoUri.value ?: return
        scope.launch {
            // 始める
            statusText.value = "処理中です"
            // せっかくなので時間を測ってみる
            val totalTime = measureTimeMillis {
                ReEncodeTool.start(
                    context = context,
                    inputUri = uri,
                    videoBitrate = bitrate.value.toIntOrNull() ?: 1_000_000
                )
            }
            statusText.value = "終わりました。時間 = ${totalTime / 1000} 秒"
        }
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text(text = "ひまりどろいど") }) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .padding(20.dp)
        ) {

            Text(text = "動画の選択", fontSize = 20.sp)
            Button(onClick = {
                videoPicker.launch(PickVisualMediaRequest(mediaType = ActivityResultContracts.PickVisualMedia.VideoOnly))
            }) { Text(text = "動画を選ぶ") }

            if (videoUri.value != null) {

                // ビットレート入力
                OutlinedTextField(
                    label = { Text(text = "ビットレート bps") },
                    value = bitrate.toString(),
                    onValueChange = { bitrate.value = it },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )

                Text(text = videoUri.value.toString())
                Button(onClick = {
                    start()
                }) { Text(text = "処理を始める") }
                Text(text = statusText.value)
            }
        }
    }
}
```

# 使ってみる
動画を選んで、処理を開始を押せば始まります。  

![Imgur](https://i.imgur.com/4vDzyD4.png)

できました！  
試した感じ私の設計が変なのか知らないのですが、動画によっては短くてもすごく時間がかかるときがありますね。なんか私やらかしたか？  
うーん、かかった時間が安定しないな

![Imgur](https://i.imgur.com/JSCeBqs.png)

# 再エンコード ソースコード
ここまでのコードです！  

https://github.com/takusan23/HimariDroid/tree/d168e8572c1d3e485745f5420b5d4e25d7afb0a8

## AV1 再エンコーダー apk
はい  
UI が最低限なので使うべきではないです、

https://github.com/takusan23/HimariDroid/releases/tag/1.0.0

# 結果
うーん、  
色々いじってみたけど、`Android の MediaCodec`には**ビットレートの最低値**が存在するらしく？  
そのせいである値を超えるとそれ以上下げてもファイルサイズが変わらないっぽいんですよね、、、

、、でそのビットレート最低値がどこにあるかわかんないんですけど・・・

比較対象は`mp4`コンテナに入る、`AVC`/`HEVC`/`AV1 ソフトウェア`/`AV1 ハードウェア`です。  
`AV1 ソフトウェア`は`Pixel 6 Pro`でやりました（`Pixel 8`だとハードウェアが優先されちゃうので指定めんどい、一応ソフトウェアも選べる）

**あと、この結果は元データあんまり画質良くないのと、素人の私が適当にまとめただけなので過信してはいけない。**

## 元データ
https://youtu.be/AC5oNvR23UU?si=Iu1buVsN7QvrOz5M&t=633

もとから画質というかビットレートが高くないので、結構厳しいのですが...  
何かいい感じの動画があれば良いんだけど

### 1Mbps
`AVC`はこれが最低ライン感ある。  
`AV1 ソフトウェア`より`AV1 ハードウェア`もしくは`HEVC`かなあ。  
`AV1 ハードウェア`と`HEVC`比較するとわずかに`HEVC`かも。

| コーデック       | 切り抜き                                  |
|------------------|-------------------------------------------|
| 元データ         | ![Imgur](https://i.imgur.com/HpxcA9d.png) |
| AV1 ソフトウェア | ![Imgur](https://i.imgur.com/Icnc7Av.png) |
| AV1 ハードウェア | ![Imgur](https://i.imgur.com/J7T9f1y.png) |
| HEVC             | ![Imgur](https://i.imgur.com/NqZYR1n.png) |
| AVC              | ![Imgur](https://i.imgur.com/N5QEkEm.png) |

### 700Kbps
`AV1 ソフトウェア`の画質があんまりでなかった  
ここは`AV1 ハードウェア`より`HEVC`かなあ...つよい

| コーデック       | 切り抜き                                  |
|------------------|-------------------------------------------|
| 元データ         | ![Imgur](https://i.imgur.com/HpxcA9d.png) |
| AV1 ソフトウェア | ![Imgur](https://i.imgur.com/PQ23SpB.png) |
| AV1 ハードウェア | ![Imgur](https://i.imgur.com/763pSTh.png) |
| HEVC             | ![Imgur](https://i.imgur.com/GGqZoPD.png) |
| AVC              | ![Imgur](https://i.imgur.com/gnuYy4y.png) |

### 500Kbps
コレより下は多分エンコーダーのビットレート最低値に引っかかって下がらない（と思う）。  
`AVC`はやっぱりというか、なんか**転載されまくってカビカビになった動画**みたいな雰囲気になってる（分からない例え）  

`HEVC`と`AV1`はかなりいい勝負な気がする。  
`AV1`はソフトウェアよりハードウェアの方が境界線がきれいというか、シャープな気がする。

| コーデック       | 切り抜き                                  |
|------------------|-------------------------------------------|
| 元データ         | ![Imgur](https://i.imgur.com/HpxcA9d.png) |
| AV1 ソフトウェア | ![Imgur](https://i.imgur.com/doUL7TA.png) |
| AV1 ハードウェア | ![Imgur](https://i.imgur.com/pf3mcGR.png) |
| HEVC             | ![Imgur](https://i.imgur.com/kHEyd8c.png) |
| AVC              | ![Imgur](https://i.imgur.com/t13eL9e.png) |

### 感想
ハードウェアエンコーダーのが綺麗な気がするけど、これ`Google Tensor`に入ってるやつなので、  
今度`Snapdragon`とかにも`AV1`エンコーダーが搭載され始めたらまた変わってくるかもしれない。

# AV1 で動画撮影は？
なんか面白くないので、今度は`Camera 2 API`を使って、カメラの入力を`AV1`エンコーダーに渡してエンコードさせようと思います。  
リアルタイムエンコード？ってやつなんでしょうか

`Camera2 API`は前触ったことあるからまあなんとかなるやろ！  
https://takusan.negitoro.dev/posts/android_front_back_camera/

また、今回は面倒なので`MediaCodec`ではなく、`MediaRecorder`で録画しようと思います。  
ただでさえ`Camera2 API`コールバックばっかりでしんどいので

ちなみに`CameraX`は今のところコーデック選べないらしい。  
じゃあ`Camera2 API + MediaRecorder`するしか無いなあ。  
https://developer.android.com/training/camerax/video-capture#bind-videocapture

## Camera2 API と MediaRecorder のクラス
`CameraController`クラスを作りました。  
ここに`UI (Jetpack Compose)`側から呼び出す関数を作って（`setupCamera`、`startRecord`）、それぞれ実装しました。

```kotlin
@SuppressLint("NewApi") // Android Pie 以降、以前では camera2 API を直す必要があります
class CameraController(
    private val context: Context,
) {

    private val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    private val cameraExecutor = Executors.newSingleThreadExecutor()

    private var cameraDevice: CameraDevice? = null
    private var mediaRecorder: MediaRecorder? = null
    private var recordingFile: File? = null

    var isRecording = false
        private set

    val previewSurfaceView = SurfaceView(context)

    private val isLandscape: Boolean
        get() = context.resources.configuration.orientation == Configuration.ORIENTATION_LANDSCAPE

    suspend fun setupCamera() {
        // カメラを開く
        cameraDevice = awaitOpenBackCamera()
        // プレビューを開始
        startPreview()
    }

    suspend fun startRecord() {
        // 録画するやつを用意
        this@CameraController.mediaRecorder = (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) MediaRecorder(context) else MediaRecorder()).apply {
            // 呼び出し順があるので注意
            setAudioSource(MediaRecorder.AudioSource.MIC)
            setVideoSource(MediaRecorder.VideoSource.SURFACE)
            setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            setVideoEncoder(MediaRecorder.VideoEncoder.AV1) // AV1
            setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            setAudioChannels(2)
            setVideoEncodingBitRate(3_000_000) // ニコ動が H.264 AVC で 6M なので、AV1 なら半分でも同等の画質を期待して
            setVideoFrameRate(30)
            // 解像度、縦動画の場合は、代わりに回転情報を付与する（縦横の解像度はそのまま）
            setVideoSize(CAMERA_RESOLUTION_WIDTH, CAMERA_RESOLUTION_HEIGHT)
            setOrientationHint(if (isLandscape) 0 else 90)
            setAudioEncodingBitRate(192_000)
            setAudioSamplingRate(44_100)
            // 保存先
            // 動画フォルダに保存する処理が追加で必要
            recordingFile = context.getExternalFilesDir(null)?.resolve("Camera2ApiVideoSample_${System.currentTimeMillis()}.mp4")
            setOutputFile(recordingFile)
            prepare()
        }
        val mediaRecorder = mediaRecorder!!

        // 録画モードでキャプチャーセッションを開く
        val previewSurface = awaitSurface()
        val cameraDevice = cameraDevice!!
        val captureRequest = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_RECORD).apply {
            addTarget(previewSurface)
            addTarget(mediaRecorder.surface)
        }.build()
        val outputList = listOf(
            OutputConfiguration(previewSurface),
            OutputConfiguration(mediaRecorder.surface)
        )
        // 変な解像度を入れるとここでエラーなります
        SessionConfiguration(SessionConfiguration.SESSION_REGULAR, outputList, cameraExecutor, object : CameraCaptureSession.StateCallback() {
            override fun onConfigured(session: CameraCaptureSession) {
                // 録画開始
                if (!isRecording) {
                    isRecording = true
                    mediaRecorder.start()
                }
                session.setRepeatingRequest(captureRequest, null, null)
            }

            override fun onConfigureFailed(session: CameraCaptureSession) {
                // do nothing
            }
        }).also { sessionConfiguration -> cameraDevice.createCaptureSession(sessionConfiguration) }
    }


    suspend fun stopRecord() = withContext(Dispatchers.IO) {
        // プレビューに戻す
        isRecording = false
        startPreview()

        // 録画停止
        mediaRecorder?.stop()
        mediaRecorder?.release()
        mediaRecorder = null

        // 端末の動画フォルダに移動
        recordingFile?.also { recordingFile ->
            val contentValues = contentValuesOf(
                MediaStore.MediaColumns.DISPLAY_NAME to recordingFile.name,
                MediaStore.MediaColumns.RELATIVE_PATH to "${Environment.DIRECTORY_MOVIES}/Camera2ApiVideoSample",
                MediaStore.MediaColumns.MIME_TYPE to "video/mp4"
            )
            val uri = context.contentResolver.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, contentValues)!!
            context.contentResolver.openOutputStream(uri)?.use { outputStream ->
                recordingFile.inputStream().use { inputStream ->
                    inputStream.copyTo(outputStream)
                }
            }
            recordingFile.delete()
        }
    }

    fun destroy() {
        cameraDevice?.close()
        mediaRecorder?.release()
    }

    /** プレビューを開始する */
    private suspend fun startPreview() {
        // プレビューモードでキャプチャーセッションを開く
        val previewSurface = awaitSurface()
        val cameraDevice = cameraDevice!!
        val captureRequest = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW).apply {
            addTarget(previewSurface)
        }.build()
        val outputList = listOf(OutputConfiguration(previewSurface))
        SessionConfiguration(SessionConfiguration.SESSION_REGULAR, outputList, cameraExecutor, object : CameraCaptureSession.StateCallback() {
            override fun onConfigured(captureSession: CameraCaptureSession) {
                captureSession.setRepeatingRequest(captureRequest, null, null)
            }

            override fun onConfigureFailed(p0: CameraCaptureSession) {
                // do nothing
            }
        }).also { sessionConfiguration -> cameraDevice.createCaptureSession(sessionConfiguration) }
    }

    @SuppressLint("MissingPermission")
    @RequiresApi(Build.VERSION_CODES.P)
    private suspend fun awaitOpenBackCamera(): CameraDevice = suspendCancellableCoroutine {
        val backCameraId = cameraManager
            .cameraIdList
            .first { cameraManager.getCameraCharacteristics(it).get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_BACK }
        cameraManager.openCamera(backCameraId, cameraExecutor, object : CameraDevice.StateCallback() {
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

    /** SurfaceView のコールバックを待つ */
    private suspend fun awaitSurface() = suspendCancellableCoroutine {
        if (!previewSurfaceView.holder.isCreating) {
            // コールバックを待たなくていい場合はすぐ返す
            it.resume(previewSurfaceView.holder.surface)
            return@suspendCancellableCoroutine
        }
        val callback = object : SurfaceHolder.Callback {
            override fun surfaceCreated(holder: SurfaceHolder) {
                it.resume(holder.surface)
                previewSurfaceView.holder.removeCallback(this)
            }

            override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
                // do nothing
            }

            override fun surfaceDestroyed(holder: SurfaceHolder) {
                // do nothing
            }
        }
        previewSurfaceView.holder.addCallback(callback)
        it.invokeOnCancellation { previewSurfaceView.holder.removeCallback(callback) }
    }

    companion object {

        /** 720P 解像度 幅 */
        private const val CAMERA_RESOLUTION_WIDTH = 1280

        /** 720P 解像度 高さ */
        private const val CAMERA_RESOLUTION_HEIGHT = 720

        /** 必要な権限 */
        val PERMISSION_LIST = listOf(android.Manifest.permission.RECORD_AUDIO, android.Manifest.permission.CAMERA)

        /** 権限があるか */
        fun checkPermission(context: Context): Boolean = PERMISSION_LIST.all { permission -> ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED }
    }
}
```

## カメラ画面
↑で作った`CameraController`を使う画面です。  
~~カメラのプレビューを表示する`SurfaceView`は、正方形じゃない表示が歪んでしまうのですが（正方形のソースはどこだか忘れてしまった...）  ~~  
~~https://qiita.com/nakker1218/items/b9a592c93bde33de52aa~~

~~`Jetpack Compose`の`Modifier`をいくつか組み合わせるだけで解消されます。~~  
~~おそらくこういう感じの、`SurfaceView（カメラのプレビュー）`を縦横同じ正方形にして、端末の画面サイズよりも大きくするようなことを、をやってくれているんだと思います。~~  

![Imgur](https://i.imgur.com/zEyHjfy.png)

これは嘘で、以下のドキュメントに書かれている通り、`SurfaceView`のコールバック内で、`SurfaceHolder#setFixedSize`を呼び出すことで解像度を設定することが出来ます。  
https://developer.android.com/reference/android/hardware/camera2/CameraDevice#createCaptureSession(android.hardware.camera2.params.SessionConfiguration)

```kotlin
@Composable
fun CameraScreen() {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val isPortrait = LocalConfiguration.current.orientation == Configuration.ORIENTATION_PORTRAIT
    val cameraController = remember { CameraController(context) }

    // 権限
    val isGrantedPermission = remember { mutableStateOf(CameraController.checkPermission(context)) }
    val permissionRequester = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions(),
        onResult = { isGrantedPermission.value = it.all { (_, isGranted) -> isGranted } }
    )

    // カメラの用意
    DisposableEffect(key1 = Unit) {
        scope.launch {
            // 権限がなければ貰う
            if (!isGrantedPermission.value) {
                permissionRequester.launch(CameraController.PERMISSION_LIST.toTypedArray())
            }

            // 権限が付与されるまで待つ
            snapshotFlow { isGrantedPermission.value }.first { isGranted -> isGranted /* == true */ }

            // カメラを開く
            cameraController.setupCamera()
        }
        onDispose { cameraController.destroy() }
    }

    Box(modifier = Modifier.fillMaxSize()) {

        AndroidView(
            modifier = Modifier
                //プレビューが歪むのでサイズとアスペクト比修正
                // 正方形にしてはみ出すようなサイズにすれば良い
                // Jetpack Compose かゆいところに手が届いて神だろ
                .then(
                    if (isPortrait) {
                        Modifier
                            .fillMaxHeight()
                            .aspectRatio(1f, true)
                    } else {
                        Modifier
                            .fillMaxWidth()
                            .aspectRatio(1f, false)
                    }
                ),
            factory = { cameraController.previewSurfaceView }
        )

        Button(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 50.dp),
            onClick = {
                scope.launch {
                    if (!cameraController.isRecording) {
                        cameraController.startRecord()
                    } else {
                        cameraController.stopRecord()
                    }
                }
            }
        ) {
            Text("録画開始・終了")
        }

    }

}
```

## 動画撮影しつつ、AV1 でエンコードさせてみた
`MediaRecorder`で`AV1`を選ぶ！  
ビットレートは、ニコニコ動画の推奨エンコーダー設定が`H.264 で 6Mbps`みたいなので、とりあえず何も考えずに半分にしてみた。  
https://qa.nicovideo.jp/faq/show/21908?site_domain=default

```kotlin
this@CameraController.mediaRecorder = (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) MediaRecorder(context) else MediaRecorder()).apply {
    // 呼び出し順があるので注意
    setAudioSource(MediaRecorder.AudioSource.MIC)
    setVideoSource(MediaRecorder.VideoSource.SURFACE)
    setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
    setVideoEncoder(MediaRecorder.VideoEncoder.AV1) // AV1
    setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
    setAudioChannels(2)
    setVideoEncodingBitRate(3_000_000) // ニコ動が H.264 AVC で 6M なので、AV1 なら半分でも同等の画質を期待して
    setVideoFrameRate(30)
    // 解像度、縦動画の場合は、代わりに回転情報を付与する（縦横の解像度はそのまま）
    setVideoSize(CAMERA_RESOLUTION_WIDTH, CAMERA_RESOLUTION_HEIGHT)
    setOrientationHint(if (isLandscape) 0 else 90)
    setAudioEncodingBitRate(192_000)
    setAudioSamplingRate(44_100)
    // 保存先
    // 動画フォルダに保存する処理が追加で必要
    recordingFile = context.getExternalFilesDir(null)?.resolve("Camera2ApiVideoSample_${System.currentTimeMillis()}.mp4")
    setOutputFile(recordingFile)
    prepare()
}
```

## Camera 2 API で 60fps の録画をする
https://stackoverflow.com/questions/43628278/

このままでは`60fps`でカメラの映像が流れてきません、`MediaRecorder`でFPSを`60`を指定しても`30`のままになります。  
修正ですが、`Camera2 API`の`createCaptureRequest`で`set(CaptureRequest.CONTROL_AE_TARGET_FPS_RANGE, Range(30, 60))`を設定してあげる必要があります。

これで録画時は`60fps`の映像がカメラから流れてきます。  
プレビューはまあ`30fps`で良いんじゃない？負荷かかりそうやし

```kotlin
val captureRequest = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_RECORD).apply {
    addTarget(previewSurface)
    addTarget(mediaRecorder.surface)
    set(CaptureRequest.CONTROL_AE_TARGET_FPS_RANGE, Range(30, 60))
}.build()
```

### Pixel 8 Pro（AV1 ハードウェアエンコーダーあり）
すごい！！！  
これは高い端末買っただけあるわ。Google さん！カメラアプリに`AV1エンコード`設定作ろうよ

- 1280x720 / 30fps
    - 余裕そう。見てる分には映像がカクカクになる（フレームが落ちる？）ことは無さそう
- 1920x1080 / 30fps
    - 同じく余裕そう
- 1280x720 / 60fps
    - これも余裕そう、遅れたりカクカクにはなってない
- 1920x1080 / 60fps
    - 同じく余裕そう
- 3840x2160
    - ここから先はエラーになってしまう
    - ハードウェアエンコードは 1080p まで？
    - AVC / HEVC は起動可能

### Pixel 6 Pro（AV1 ソフトウェアエンコーダーのみ）
ちなみに、`Pixel 8 Pro`で明示的にソフトウェアエンコーダー（`c2.android.av1.encoder`）を指定しましたが、やっぱりカクカクになりました。  
ハードウェアすげ～～～

- 1280x720 / 30fps
    - 目に見えるレベルでカクカクになってる
- 640x480 / 30fps
    - ちょっとカクついたけどどうしても使いたければここまで？
- 1280x720 / 60fps
    - 数秒遅れて記録されるくらいにはカックカク
- 640x480 / 60fps
    - ちょっとだけ遅れてる気がするけど取れなくはない？

## Camera2 API で動画撮影するソースコード
どうぞ、`AV1`用にパラメーターを直せば動きます。  
ちなみに、`MediaRecorder`に渡す解像度（動画の縦横サイズ）は、多分`16`で割り切れる（あまりが出ない）値にする必要があり、なんか変な値を入れたら録画が開始されません。

あ、バージョン分岐とかはしてないので、古い`Android`だと動かないかも。  
検証のために作ったようなもんなので`NewApi`の警告は全部黙らせました、良くない。

https://github.com/takusan23/Camera2ApiVideoSample/tree/master

### Camera2 API + MediaCodec も書きました
`MediaRecorder`ではなく`MediaCodec`を使う版。  
エンコーダーガチ勢はどうぞ。

https://github.com/takusan23/Camera2ApiVideoSample/tree/master/app/src/main/java/io/github/takusan23/camera2apivideosample/recorder

## APK 用意しました
バックグラウンドに移動すると真っ暗になる不具合がありますが直していません。。。  
おそらく`SurfaceView`が破棄されるので、`onResume`でプレビューを開き直すと良いかもしれません。

https://github.com/takusan23/Camera2ApiVideoSample/releases/tag/1.0

# 終わりに
`Pixel 8 Pro`すごい！！！買う価値ありかも  
動画を貼ろうと思ったんだけど被写体良いの無いので、近いうちに撮って貼ります。