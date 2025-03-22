---
title: Android の media3 で動画の両端をぼかす
created_at: 2025-03-23
tags:
- Android
- Kotlin
- OpenGL
- media3
---

どうもこんにちは。  
きらかの 攻略しました。"草なんだが"すき

![Imgur](https://imgur.com/7rE2HuU.png)

まさかの接点でびっくり、  
事件が解決しておわってしまった、もうちょっと見たかった

![Imgur](https://imgur.com/l5Paigg.png)

あと仮想世界でのシーンがあってよかった!!!  

![Imgur](https://imgur.com/I5neYGx.png)

![Imgur](https://imgur.com/AzfSV7d.png)

# 本題
少し前に自作動画編集アプリで、ショート動画とかにある、横動画を縦にして両端をぼかすやつをやりました。  
これ：  
https://takusan.negitoro.dev/posts/akari_droid_tutorial_video_side_blur/

今回は開発として`media3`ライブラリのプレイヤーで、同じように両端をぼかすやつをやってみようと思います。  

![Imgur](https://imgur.com/aJuFH7o.png)

# 環境
`OpenGL ES`を触りますが、`OpenGL ES`セットアップは`media3 effect`ライブラリが、  
`OpenGL ES`でぼかし処理をする`GLSL コード`（フラグメントシェーダー）は`GitHub`からお借りすることにします。

| なまえ         | あたい                                            |
|----------------|---------------------------------------------------|
| 端末           | Pixel 8 Pro / Xperia 1 V                          |
| Android Studio | Android Studio Ladybug Feature Drop 2024.2.2      |
| 言語           | Kotlin / GLSL（ぼかし処理）                       |
| minSdk         | 21                                                |

この記事では、`Jetpack Compose`を使いますが`xml`で`UI`を作ってもいいです。  
`SurfaceView`を画面内に設置できれば何でも良いです、この記事の本題はプレイヤー周りですから。

## media3
動画再生ライブラリ。  
https://developer.android.com/media/media3/exoplayer

プレイヤーの`media3-exoplayer`を始めとして、プレイヤーの`UI`を提供する`media3-ui`、  
動画のフレーム加工する`media3-effect`、簡単な動画編集ができる`media3-transformer`なんかがあります。  
`ExoPlayer`と呼ばれていたものは`media3-exoplayer`にあたりますね。

今回は`media3-effect`でぼかしを適用するフラグメントシェーダーを書いて、動画の両端をぼかそうと目論んでいます。  
`effect`が登場するまでは`OpenGL ES`のセットアップまで自分で書かないといけなくて大変だった、、今ならフラグメントシェーダーと少しの`Kotlin コード`でいいはず（`Uniform`変数とかの）。  
こんなの：https://github.com/google/ExoPlayer/tree/release-v2/demos/gl

あとぼかしのフラグメントシェーダーは`GitHub`からお借りすることにします。。。ありざいす！  
https://github.com/GameMakerDiscord/blur-shaders

## どうにかして OpenGL ES を回避できませんか
多分厳しいと思う

### SurfaceView は多分ぼかしが出来ない
やったことないけど、ぼかせないはず。  

`SurfaceView`は他の`View`と作りが違う（別スレッドで描画できたりする特殊なやつ）なので試せてないけど多分無理な気がする。  
せいぜい上に半透明の`View`を重ねるのが限界で、ぼかしは出来ないんじゃないかなあ、、

話がそれるけど`Windows`がクラッシュした時、ブルースクリーンに何故かそれまで見ていた`YouTube`の動画が一緒に残る事があるけど、  
それと同じ雰囲気を感じる、一部の描画処理を回避してるからブルースクリーンを貫通するみたいな。

![Imgur](https://imgur.com/yccpikU.png)

![Imgur](https://imgur.com/a9PBGFW.png)

![Imgur](https://imgur.com/F66bP7p.png)

### 映像の出力先は1つだけ
これは`ExoPlayer`が使っているデコーダー（`MediaCodec`）の制限上、映像の出力先を1つしか指定できないのでこれは出来ない。  
https://github.com/google/ExoPlayer/issues/4880

### Bitmap を取り出して背景をぼかす
`TextureView`は普通に`getBitmap()`が、`SurfaceView`も`PixelCopy`を使うことで`Bitmap`が取得できますが、  
間に合わなくてフレームドロップしてしまいそう。`30fps`なら`33ms`、`60fps`なら`16ms`以内に`Bitmap`を取り出す必要があるがそんなに高速じゃない。  

ぼかす背景用の`Bitmap`ならちょっと遅れてもそんなに気にならんかも。要検証。

# 適当にプロジェクトを作る
適当に作ったら、`media3-exoplayer`、`media3-effect`ライブラリを入れてください。  
`hls`や`mpeg-dash`で配信された動画を再生する場合はそれらも入れてください。今回は端末の中にある動画を再生するだけなのでこれだけ。

`app/build.gradle.kts`

```kotlin
dependencies {

    // media3
    implementation("androidx.media3:media3-exoplayer:1.5.1")
    implementation("androidx.media3:media3-effect:1.5.1")

    // 以下省略..
}
```

お好みでバージョンカタログにしてください。

# SurfaceView を置いて、最低限動画が再生できるように
`AndroidView()`で`SurfaceView`を置けば良いです。いつの間にか`AndroidExternalSurface()`っていう`AndroidView() + SurfaceView`を既に用意したものがあるのでそれを使っても良いかもしれません。  
動画は端末内にあるものを選んで再生することにします。別にインターネットから取ってきてもいいですが本題からずれるので、、、

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            Media3VideoSideBlurTheme {
                MainScreen()
            }
        }
    }
}

@Composable
private fun MainScreen() {
    val context = LocalContext.current

    // ExoPlayer
    val exoPlayer = remember { ExoPlayer.Builder(context).build() }

    // PhotoPicker
    val videoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri ->
            // 動画を選んだらセットして再生
            exoPlayer.setMediaItem(MediaItem.fromUri(uri ?: return@rememberLauncherForActivityResult))
            exoPlayer.prepare()
            exoPlayer.playWhenReady = true
        }
    )

    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {

            Button(onClick = { videoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly)) }) {
                Text(text = "動画を選ぶ")
            }

            // アスペクト比を縦動画に
            AndroidView(
                modifier = Modifier
                    .fillMaxHeight(0.8f)
                    .aspectRatio(9 / 16f),
                factory = { SurfaceView(it) },
                update = { surfaceView ->
                    // 出力先にする
                    exoPlayer.setVideoSurfaceView(surfaceView)
                }
            )
        }
    }
}
```

結果はこんな感じで、まあアスペクト比が縦なので引き伸ばされてます。  
これから端をぼかしていこうと思います。

![Imgur](https://imgur.com/xFrAde2.png)

# media3-effect を使い始める
## アスペクト比
https://developer.android.com/media/media3/transformer/transformations

`effect`自体のチュートリアルは存在しない。本来は`media3-transformer`っていうシンプルな動画編集ライブラリの、映像加工のためのライブラリなんですよねこれ。  
ただ、`effect`を動画編集ではなくて通常再生でも使うことができるので大丈夫。

もちろん、ぼかしを入れた動画を動画ファイルにするために`media3-transformer`を使うことが出来ます。せっかくなので最後に試してみましょう。

まずは出力サイズを決めます。  
縦動画なのでアスペクト比を`16:9`ではなく`9:16`にします。`ExoPlayer`のインスタンス生成後に`ExoPlayer#setVideoEffects`を呼び出すことで、`media3-effect`の各エフェクトが適用できます。  

```kotlin
// ExoPlayer
val exoPlayer = remember {
    ExoPlayer.Builder(context).build().apply {
        setVideoEffects(
            listOf(
                // 縦動画に
                Presentation.createForAspectRatio(9 / 16f, Presentation.LAYOUT_SCALE_TO_FIT)
            )
        )
    }
}
```

これだけでまずはアスペクト比が自動的に修正されます。便利。

![Imgur](https://imgur.com/qzQKf4f.png)

## 自前のフラグメントシェーダーで映像に手をいれる
`media3-effect`には既にぼかしとか、上にテキストを重ねるとか、回転行列を適用するとか、色々あるのですが、自分でフラグメントシェーダーを書いて加工することも出来ます。  

### これから何をやるか
![Imgur](https://imgur.com/T60wYNe.png)

はい。2回に分けて描画します。  
まずは`行列`を使って動画のスケールを大きくし、縦方向を目一杯埋めます。（回転やスケールや位置変更だけなら最初から出来ます）  
そのあと、フラグメントシェーダーに書いたぼかし処理を動かすため`glDrawArrays()`します。これで目いっぱいにぼかした動画が表示されるはず。

その次に、今度は行列をもとに戻し、フラグメントシェーダーもぼかさずそのまま出力するようにして、もう一回`glDrawArrays()`を呼んで描画します。  
これでぼかし動画がつくれた！

行列やらなんやらわけわかめですが、このへんは`WebGL`の登場により知見が増えてるので調べたり`AI`に聞けばいいと思う。  
https://developer.mozilla.org/ja/docs/Web/API/WebGL_API/Matrix_math_for_the_web

また、行列操作は`android.opengl.Matrix クラス`（package 違い多数存在）がユーティリティ関数を公開しているので、自分で計算する必要はないです。  
ひとつ、適用する順番には決まりがあるのでそのところは注意してください（今回はスケールだけなので触れません）  
https://wgld.org/d/webgl/w013.html

### ざっくりフラグメントシェーダー
`GLSL`は2つ書く必要があり`バーテックスシェーダー`と`フラグメントシェーダー`ですね。  
この中でも今回は色を確定するフラグメントシェーダーを触ります。

何もしないフラグメントシェーダーはこうなります。（`GLES 3.0`）  

```glsl
#version 300 es
precision highp float;

in vec2 vTexSamplingCoord;
uniform sampler2D uTexSampler;

// 出力する色
out vec4 fragColor;

void main()
{
    vec4 Color = texture( uTexSampler, vTexSamplingCoord);
    fragColor = Color;
}
```

上2行はおまじないです（調べてください）。  
`main()`関数が画面のピクセルごとに呼ばれて、`texture()`関数で画像の色を取り出し、`fragColor`変数に代入しています。  
`out vec4 fragColor`が実際に画面に表示される色になります。

`uniform sampler2D uTexSampler`の`uniform`は、`CPU`から（ここでは`Kotlin`で）値をフラグメントシェーダー（`GPU`）に渡したい時に使います。  
`int`や`float`、ベクトルだって渡せます。

`vec4`は、小数点の数字が4つ入れられる型で、グラフィックスの世界では行列やベクトルとか呼んでいるものです。まぁ配列です。  
普通に`float`や`int`もあります。  

`texture()`は`vec4`型を返し、それぞれ`vec4(red, green, blue, alpha )`の順番で並んでます。各値は`0.0`から`1.0`です。`255`ではないです。  
そのため、赤色だけ出力したい場合は帰ってきた`vec4`から、`r`以外の`g`と`b`を`0`すればいいですね。

```glsl
fragColor = texture(uTexSampler, vTexSamplingCoord);
fragColor.g = 0.;
fragColor.b = 0.;
```

`.g`や`.b`の添字は`vec4`とかのベクトルに生えてて、**スウィズル演算子**とか言う名前がついてます。  
これ以外にも`.rgb`とすれば`vec3(red, green, blue)`が帰ってきます。`.xyz`とかもあります。

また、`vec`系のコンストラクタは、すでにある`vec`系を引数に取ることもできるため、上記の赤色だけ出力はこの用に置き換えることも出来ます。

```glsl
fragColor = texture(uTexSampler, vTexSamplingCoord);
fragColor = vec4(fragColor.r, vec3(0));
```

また`OpenGL`までとは言わなくても`AGSL`とかいう`Android`版の`フラグメントシェーダー`みたいなのがあります。  
大体`GLSL`のフラグメントシェーダーと同じなので移植も簡単そう。  
https://developer.android.com/develop/ui/views/graphics/agsl/using-agsl

- https://www.sinasamaki.com/dynamic-island/
    - `iPhone`の`Dynamic Island`を再現するやつ
- https://medium.com/androiddevelopers/making-jellyfish-move-in-compose-animating-imagevectors-and-applying-agsl-rendereffects-3666596a8888
    - https://www.youtube.com/watch?v=wJx7EhGaDow
    - 水面みたいにぐにゃぐにゃするやつ

もし興味があれば、フラグメントシェーダーで遊んでいる人たちがこぞって力作を投稿しまくっている www.shadertoy.com と呼ばれるサイトを覗いてみると面白いかもしれません。マジで謎。見た目がどれもヤバそうで草。  

でも多分`OpenGL ES`や`WebGL`、あとはさっきの`Android AGSL`にそのまま貼り付けても動かないと思います。でも動くように直すのもそんなに難しくないはずで、  
`shadertoy`が最初から提供している変数を自分で追加すれば動くようになる、、、はず。  

例えばテクスチャは`iChannel`になってるので、自分で定義するように直せばいいはず。  
他にも解像度とかも渡すようにしないといけないかも。  

## フラグメントシェーダーを ExoPlayer に適用する
まずは答えを。どーん。  
`GlEffect`を継承したクラスを作ります。継承する関数が一つあるので、それで`GlShaderProgram`を返します。  
`GlShaderProgram`がフラグメントシェーダー（やバーテックスシェーダー）で映像を加工するためのクラスで、ここの関数が動画のフレームのたびに呼ばれるということですね。

先述の通り、2回に分けて描画します。2回目は目一杯広げないため、描画してない両端の部分は透明であってほしいです。せっかくぼかしたのに、、、  
というわけでまずはアルファチャンネルを有効にします。`GLES20.glEnable(GLES20.GL_BLEND)`の部分ですね。

あとは動画のフレームのたびに（映像が切り替わるたびに）`drawFrame`が呼ばれるので、`OpenGL ES`で描画しようって。  
`iDrawMode`という`Uniform`変数を切り替えることで、ぼかすかぼかさないかを選べるようにしてあります。

1回目はぼかすので`setIntUniform("iDrawMode", 1)`を、あと、行列を操作し、目一杯広がるようにしています。  
`Matrix.scaleM(identityTransformationMatrix, 0, 3.5f, 3.5f, 1f)`ですね。  
おわったら描画。`glDrawArrays()`します。

つぎに、ぼかさずに描画したいので`setIntUniform("iDrawMode", 2)`します。  
行列も大きくなったままなので、`setIdentityM(identityTransformationMatrix, 0)`で戻します。  
これでもう一度`glDrawArrays()`することで、背景をぼかした動画が作れるわけです。

ぼかし処理はフラグメントシェーダーでやっているので、ぼかし具合はフラグメントシェーダー内の定数を操作することで変更できます！！

```kotlin
/** ExoPlayer で両端をぼかすやつ */
@UnstableApi
class Media3VideoSideBlurEffect : GlEffect {

    override fun toGlShaderProgram(context: Context, useHdr: Boolean): GlShaderProgram {
        return BlurEffectGlShaderProgram(useHdr, 1)
    }

    private class BlurEffectGlShaderProgram(
        useHighPrecisionColorComponents: Boolean,
        texturePoolCapacity: Int
    ) : BaseGlShaderProgram(useHighPrecisionColorComponents, texturePoolCapacity) {

        private val glProgram = GlProgram(VERTEX_SHADER, FRAGMENT_SHADER)
        private val identityTransformationMatrix = GlUtil.create4x4IdentityMatrix()
        private val identityTexTransformationMatrix = GlUtil.create4x4IdentityMatrix()

        private var size: Size? = null

        init {
            glProgram.setBufferAttribute(
                "aFramePosition",
                GlUtil.getNormalizedCoordinateBounds(),
                GlUtil.HOMOGENEOUS_COORDINATE_VECTOR_SIZE
            )
            // Uniform 変数を更新
            glProgram.setFloatsUniform("uTransformationMatrix", identityTransformationMatrix)
            glProgram.setFloatsUniform("uTexTransformationMatrix", identityTexTransformationMatrix)

            // アルファブレンディングを有効
            // 2回 glDrawArrays してブラーの背景の上に動画を重ねるため
            GLES20.glEnable(GLES20.GL_BLEND)
            GLES20.glBlendFunc(GLES20.GL_SRC_ALPHA, GLES20.GL_ONE_MINUS_SRC_ALPHA)
        }

        override fun configure(inputWidth: Int, inputHeight: Int): Size {
            val size = Size(inputWidth, inputHeight)
            // Uniform 変数でも使いたい
            this.size = size
            return size
        }

        override fun drawFrame(inputTexId: Int, presentationTimeUs: Long) {
            glProgram.use()
            // テクスチャID（映像フレーム）をセット
            glProgram.setSamplerTexIdUniform("uTexSampler", inputTexId, /* texUnitIndex= */ 0)
            // サイズを Uniform 変数に入れる
            glProgram.setFloatsUniform("vResolution", floatArrayOf(size!!.width.toFloat(), size!!.height.toFloat()))

            // 描画する。まず背景（ブラー）
            glProgram.setIntUniform("iDrawMode", 1)
            // 3倍くらいに拡大してはみ出させる
            Matrix.setIdentityM(identityTransformationMatrix, 0)
            Matrix.scaleM(identityTransformationMatrix, 0, 3.5f, 3.5f, 1f)
            glProgram.setFloatsUniform("uTransformationMatrix", identityTransformationMatrix)
            glProgram.bindAttributesAndUniforms()
            // The four-vertex triangle strip forms a quad.
            GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, /* first= */ 0, /* count= */ 4)

            // 次に最前面の動画を
            glProgram.setIntUniform("iDrawMode", 2)
            glProgram.setSamplerTexIdUniform("uTexSampler", inputTexId, /* texUnitIndex= */ 0)
            // はみ出しは戻す
            Matrix.setIdentityM(identityTransformationMatrix, 0)
            glProgram.setFloatsUniform("uTransformationMatrix", identityTransformationMatrix)
            glProgram.bindAttributesAndUniforms()
            // The four-vertex triangle strip forms a quad.
            GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, /* first= */ 0, /* count= */ 4)
        }

        companion object {

            /** バーテックスシェーダー */
            private const val VERTEX_SHADER = """#version 300 es
                in vec4 aFramePosition;
                uniform mat4 uTransformationMatrix;
                uniform mat4 uTexTransformationMatrix;
                
                out vec2 vTexSamplingCoord;
                
                void main() {
                  gl_Position = uTransformationMatrix * aFramePosition;
                  vec4 texturePosition = vec4(aFramePosition.x * 0.5 + 0.5,
                                              aFramePosition.y * 0.5 + 0.5, 0.0, 1.0);
                  vTexSamplingCoord = (uTexTransformationMatrix * texturePosition).xy;
                }    
            """

            /**
             * フラグメントシェーダー
             * thx!!!!
             * https://github.com/GameMakerDiscord/blur-shaders
             */
            private const val FRAGMENT_SHADER = """#version 300 es
                precision highp float;
                
                in vec2 vTexSamplingCoord;
                uniform sampler2D uTexSampler;
                
                // どっちを描画するか。1 = 背景(ブラー) / 2 = 最前面(ブラーしない)
                uniform int iDrawMode;
                
                // 動画のサイズ
                uniform vec2 vResolution;
                
                // ぼかし
                const int Quality = 3;
                const int Directions = 16;
                const float Pi = 6.28318530718; //pi * 2
                const float Radius = 16.0; // ぼかし具合
                
                // 出力する色
                out vec4 fragColor;
                
                void main()
                {
                    vec2 radius = Radius / vResolution.xy;
                    vec4 Color = texture( uTexSampler, vTexSamplingCoord);
                    
                    // 背景を描画するモード
                    if (iDrawMode == 1) {
                        for( float d=0.0;d<Pi;d+=Pi/float(Directions) )
                        {
                            for( float i=1.0/float(Quality);i<=1.0;i+=1.0/float(Quality) )
                            {
                                Color += texture( uTexSampler, vTexSamplingCoord+vec2(cos(d),sin(d))*radius*i);
                            }
                        }
                        Color /= float(Quality)*float(Directions)+1.0;
                        fragColor = Color;
                    }
                    
                    // 最前面の動画を描画するモード                    
                    if (iDrawMode == 2) {
                        fragColor = Color;
                    }
                }
"""
        }
    }
}
```

## エフェクトを追加
これを、`ExoPlayer.setVideoEffects`の配列に追加すれば完成です。見てみましょう。

```kotlin
// ExoPlayer
val exoPlayer = remember {
    ExoPlayer.Builder(context).build().apply {
        setVideoEffects(
            listOf(
                // 縦動画に
                Presentation.createForAspectRatio(9 / 16f, Presentation.LAYOUT_SCALE_TO_FIT),
                // ぼかす
                Media3VideoSideBlurEffect()
            )
        )
    }
}
```

# 完成品
![Imgur](https://imgur.com/aJuFH7o.png)

# 番外編 動画ファイルにして欲しい
`setVideoEffects`のエフェクトは先述の通り`media3-transformer`の動画編集で使うことができるので、動画ファイルを作る機能も作ってみましょう。  

## media3-transformer を入れる
`app/build.gradle.kts`にライブラリを追加します。

```kotlin
dependencies {

    // media3
    implementation("androidx.media3:media3-exoplayer:1.5.1")
    implementation("androidx.media3:media3-effect:1.5.1")
    // transformer
    implementation("androidx.media3:media3-transformer:1.5.1")
    implementation("androidx.media3:media3-common:1.5.1")

    // 以下省略...
```

## 組み込む
まとめてどーーーん。  
`EditedMediaItem.Builder`に`setEffects`ってのがあるので、それを`ExoPlayer`のときと同じく渡せばいいです。  
あとは`Transformer`のサンプル通りでいいはず。

動画の保存先に`Uri`が選べないので、一旦`getExternalFilesDir()`などの`Java File API`が使える領域に保存したあと、  
動画フォルダに追加し`uri`を返してもらい、`InputStream / OutputStream`でコピーすればいいです。`Kotlin`だと`copyTo`拡張関数のお陰ではい、一発

```kotlin
// media3-transformer 用
val scope = rememberCoroutineScope()
val transformVideoPicker = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia(),
    onResult = { uri ->
        uri ?: return@rememberLauncherForActivityResult
        // 動画の一時保存先
        val tempVideoFile = context.getExternalFilesDir(null)!!.resolve("VideoSideBlur_${System.currentTimeMillis()}.mp4")
        val inputMediaItem = MediaItem.fromUri(uri)
        val editedMediaItem = EditedMediaItem.Builder(inputMediaItem).apply {
            setEffects(
                Effects(
                    /* audioProcessors = */ emptyList(),
                    /* videoEffects = */ listOf(
                        // 縦動画に
                        Presentation.createForAspectRatio(9 / 16f, Presentation.LAYOUT_SCALE_TO_FIT),
                        // ぼかす
                        Media3VideoSideBlurEffect()
                    )
                )
            )
        }.build()
        val transformer = Transformer.Builder(context).apply {
            setVideoMimeType(MimeTypes.VIDEO_H264)
            addListener(object : Transformer.Listener {
                // 完了した
                override fun onCompleted(composition: Composition, exportResult: ExportResult) {
                    super.onCompleted(composition, exportResult)
                    // 端末の動画フォルダに移動させる
                    val contentValues = contentValuesOf(
                        MediaStore.Video.Media.DISPLAY_NAME to tempVideoFile.name,
                        MediaStore.Video.Media.RELATIVE_PATH to "${Environment.DIRECTORY_MOVIES}/VideoSideBlur"
                    )
                    val copyToUri = context.contentResolver.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, contentValues)!!
                    context.contentResolver.openOutputStream(copyToUri)?.use { outputStream ->
                        tempVideoFile.inputStream().use { inputStream ->
                            inputStream.copyTo(outputStream)
                        }
                    }
                    tempVideoFile.delete()
                    Toast.makeText(context, "おわり", Toast.LENGTH_SHORT).show()
                }
            })
        }.build()
        transformer.start(editedMediaItem, tempVideoFile.path)
    }
)
Button(onClick = { transformVideoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly)) }) {
    Text(text = "ぼかした動画を動画ファイルにする")
}
```

## 動画書き出し完成品
動画フォルダの`VideoSideBlur`フォルダ内にあるはず。

![Imgur](https://imgur.com/yiRdqjp.png)

# そーすこーど
https://github.com/takusan23/Media3VideoSideBlur

# おわりに
`media3-effect`、多分`media3-transformer`（動画編集）が主な利用目的で`media3-exoplayer`はおまけというか、`media3-transformer`のプレビューのためみたいな側面があるのか、  
いくつか`Issue`があります。。。  
**どうしてもこれをやる場合は十分に動作確認をしたほうが良さそうです。**

- https://github.com/androidx/media/issues?q=setVideoEffects
- [ExoPlayer#setVideoEffects()](https://developer.android.com/reference/androidx/media3/exoplayer/ExoPlayer#setVideoEffects(java.util.List<androidx.media3.common.Effect>))

# おわりに2
ちなみに`10 ビット HDR 動画`もを入れても動きます。もちろん`media3-transformer`もね。

![Imgur](https://imgur.com/zRECdj5.png)