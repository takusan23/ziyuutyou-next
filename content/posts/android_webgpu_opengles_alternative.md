---
title: Android アプリで OpenGL ES の代わりに WebGPU を使って描画する
created_at: 2026-08-18
tags:
- Android
- WebGPU
- Camera2API
---
どうもこんにちは。ディメンション凸ラバース!! 攻略しました。  
体験版でかたんちゃんのカップラーメンのくだりまで見て面白くて買った！めちゃめちゃ面白い！めっちゃ作りこまれてそうだった

![とつらば](https://oekakityou.negitoro.dev/resize/2e4d5101-3e29-4cd9-b12b-ade6c46e83d8.png)

かたんちゃんルートだけなんかスケールがデカかったのは気のせいなのか私が見過ごしたのか・・  
かたんちゃんルートの最後のらんかすたさん、よかったのだわ

![とつらば](https://oekakityou.negitoro.dev/resize/49efc26c-8a16-47cc-b6b6-a5e309fc24b0.png)

![とつらば](https://oekakityou.negitoro.dev/resize/30b4eb25-10e3-4b65-ac6a-41ad17916be2.png)

いもうとちゃん！！その服後ろがら空きなのでは!?  
~~えちえちしーんの言葉がえっちだった~~

![とつらば](https://oekakityou.negitoro.dev/resize/3556768d-096e-4657-a103-0ac54d3e6c75.png)

!?!?

![とつらば](https://oekakityou.negitoro.dev/resize/20e19d32-6a3a-497b-a80c-d21dc6f218ea.png)

そふぃーちゃんのこのかおすき、声かわいい  
らんかすたさんのルート分岐だけそれっぽくない(?)名前なのなるほど

![とつらば](https://oekakityou.negitoro.dev/resize/4e8137c1-f954-4771-b4c0-c0fd5e4e00c9.png)

![とつらば](https://oekakityou.negitoro.dev/resize/283d0ebd-bd1c-4f55-925c-13e4bad79e26.png)

・・・まｧ

![とつらば](https://oekakityou.negitoro.dev/resize/054e0c4c-5a8b-4e01-b67b-d3885f497434.png)

![とつらば](https://oekakityou.negitoro.dev/resize/45c59bc2-4946-415c-a689-2b69500b413f.png)

しふくだ!

![とつらば](https://oekakityou.negitoro.dev/resize/337d6b35-1134-4a83-964a-3e72dfe707f4.png)

![とつらば](https://oekakityou.negitoro.dev/resize/42f3c3d4-fc65-477e-adbb-ebe49b15fa2c.png)

!?!?!?!?!?!??!!?!?!

![とつらば](https://oekakityou.negitoro.dev/resize/1faa256e-d56b-44ca-bfd6-4f227b6d3529.png)

ざんねんながらみおさんルートはないわけですが、主人公のお兄ちゃんと妙に仲がいいの、グランドエンディングでわかってはえ～ってなった。

![とつらば](https://oekakityou.negitoro.dev/resize/321c0af6-8c89-44d1-9ed5-a8a7afa40af8.png)

桜ちゃん！？！？かわいい！~~ちなみにいちばんえちえちでした~~  
ここの返しすき

![とつらば](https://oekakityou.negitoro.dev/resize/39ec52e9-a1e2-4820-9a0e-114ea05cfb4c.png)

ジト目かわいい  
のと初日に惹かれた話が判明するわけですがシリアス展開にならなくてよかった！！

![とつらば](https://oekakityou.negitoro.dev/resize/04a6b909-062f-4fab-82f0-ea85ab830504.png)

![とつらば](https://oekakityou.negitoro.dev/resize/1fe84b57-5133-4dac-8539-7d0511900bb6.png)

![とつらば](https://oekakityou.negitoro.dev/resize/3d9fff33-30ad-49cc-8aa1-42e56f2d1d41.png)

![とつらば](https://oekakityou.negitoro.dev/resize/199364fa-07b7-438d-b20a-aed3fec5fb46.png)

ここのくだりセーブしてある、かわいい

![とつらば](https://oekakityou.negitoro.dev/resize/211a18be-9127-4aed-a062-55a01bc737de.png)

とんちきシーン集

![とつらば](https://oekakityou.negitoro.dev/resize/09406a96-6810-4788-a9a3-e71a543633d6.png)

![とつらば](https://oekakityou.negitoro.dev/resize/3e594bc8-b30a-4d72-907d-e271eeed0f1f.png)

![とつらば](https://oekakityou.negitoro.dev/resize/3a99d526-3611-4b77-a819-dd375ef58648.png)

すごいよかった、おすすめ!!  
(めっちゃ細かく`TIPS`書いてあるのあってわらった)

# 本題
https://youtu.be/8PxuWdjESfg?t=692

`Google I/O 2026`は見ましたか！？`Android`の発表の`GPU`の話。

`OpenGL ES（GLES）`や`Vulkan`は`低レイヤーなグラフィックス API`で、これらは`GPU`に直接指示しないと速度が出ないアプリを作るときに仕方なく使う`API`です。  
（**なので9割5分のアプリには関係ない話ですね！**）（ゲームとかは`Unity`のゲームエンジンが代わりに叩くので、これらを直接扱うのは稀です！）

発表によると`OpenGL ES`を使っているアプリは`ANGLE`（？）が翻訳をして`Vulkan`で動くようになるらしい、  
`Android 17`でなるのか将来の話なのかは分からない。でも`SoC`の`OpenGL ES ドライバー`を捨てるとかなんとかはどっかで発表してて気がする。

![googleio_youtube_gpu_api_overview](https://oekakityou.negitoro.dev/original/2f481ecc-8b1e-4db6-b7cb-c4b74b1f14ad.png)

そして`Vulkan`を使うための新しい方法があるとのこと！  
`ブラウザ`に搭載されている`低レイヤーグラフィックス API`である`WebGPU`が、`Android`アプリ開発で使えるように移植された。

![googleio_youtube_webgpu_introduction](https://oekakityou.negitoro.dev/original/36f18561-62a9-44d1-baf9-dd331164c650.png)

今までよりも高性能で簡潔と言っています、ちょっと試してみましたが**本当っぽい！。**  
というわけで今回は`Android`に移植された`WebGPU`で`SurfaceView`に描画してみようと思います！

ちなみに、この`WebGPU Android 移植版`の話の直後に`Adobe Premiere Android 版`の話をしています。  
世の中にある`Android`の動画編集アプリというのは多分`OpenGL ES`を使っていて（`media3`ライブラリがそう）、`OpenGL ES`の代替である`WebGPU`を使っているという話は多分正解な気がします。

![googleio_youtube_webgpu_maybe_using_adore_premiure](https://oekakityou.negitoro.dev/original/4772d0ff-ea16-40de-97da-8299a583fa93.png)

多分正解？なのは`alpha`段階の`WebGPU`を本番アプリで使うのは怖くないのかという疑問と、移植された`WebGPU`には今のところ動画の映像を渡す特別な方法が存在しない。  
後述しますが、`OpenGL ES`の時は`SurfaceTexture`クラスを使うことで`GPU`へ`カメラ、動画の映像`を簡単に渡すことが出来た。一方今の段階の`WebGPU`にはその機能相当が存在しないハズ。  
特別に用意とかされてるのか知らんけど、今のところその機能がないため、普通にテクスチャとして送る必要があって、これは地味にめんどくさい！！（自動ではやってくれないので`YUV`から`RGB`に変換する処理を自分で書かないといけない！）

動画編集であるのに`動画の映像`を効率よく渡す方法が今のところない`WebGPU`を使っているのかは微妙・・・

べつに大企業の名前引っ張ってこなくてもすばらしいのにね`WebGPU`

# 先に感想
ドパガキ向け（悪口すぎ）

めちゃめちゃ良いよ、`WebGPU`。

- WebGL / OpenGLES よりもはるかに良い。
- **エラーがとにかくわかりやすい**
    - エラー1
        - `WGSL`文法エラー
        - `androidx.webgpu.ValidationException: Error while parsing WGSL: :49:34 error: expected '}' for function body`
        - `return vec4<f32>(color, 1.0);`
    - エラ－2
        - `renderPass.draw()`の数が違った
        - `androidx.webgpu.ValidationException: Vertex range (first: 0, count: 27) requires a larger buffer (324) than the bound buffer size (216) of the vertex buffer at slot 0 with stride 12.`
        - `While encoding [RenderPassEncoder (unlabeled)].Draw(27, 1, 0, 0).`
        - `While finishing [CommandEncoder (unlabeled)].`
    - エラー3
        - `WGSL`組み込み関数の使い方ミス
        - `androidx.webgpu.ValidationException: Error while parsing WGSL: :39:67 error: no matching constructor for 'mat4x4<f32>(mat2x2<f32>)'`
        - `7 candidate constructors:`
        - ` • 'mat4x4<T  ✓ >(mat4x4<T>  ✗ ) -> mat4x4<T>' where:`
        - `      ✓  'T' is 'f32' or 'f16'`
        - ` • 'mat4x4<T  ✓ >() -> mat4x4<T>' where:`
        - `      ✗  overload expects 0 arguments, call passed 1 argument`
        - `      ✓  'T' is 'f32' or 'f16'`
- `wgsl`、構造体を返すのいいね。`in / out`みたいなので`texCoord`を渡してたけど`struct`で返せるのいいね。
- もうとにかくエラーがわかりやすい
- フラグメントシェーダとバーテックスシェーダーが同じなのがいい、構造体を返してフラグメントシェーダに渡るのも`glsl`より直感的だと思う、
- バーテックスシェーダーの中に直接三角形の頂点の配列を記載できるの、解説がわかりやすくていいと思う
- `@location`のインデックスで紐づけるの結構いいかも！気軽に`uniform変数`をリネームできるぜ！
- サンプラーを要求してくるのは`GLES`との違いか？
- 事あるごとに例外を投げてくれるのがいい！`glError`をいつ呼んているのか問題がある。ドローループ？gl呼び出しことに？
- `WebGPU`は`Surface`を渡してセットアップできる。難解だから`EGL`を捨てたい。
    - `OpenGL ES`は`Android`においては`GLSurfaceView`を使わない場合は、自力で`EGL`の関数を呼び出す必要がある。複雑すぎてつらい

## 気になる点
`メインスレッド`以外だとなんか動かなくない？私のせい？なんか`Dispatchers.Default`や`newSingleThreadContext()`だと、`renderPass.draw()`を繰り返し呼び出してしばらく経過すると落ちてる気がする。  
スタックトレースは後述、しかも`ネイティブコード`で落ちてんだけど・・

あと`カメラ映像`や`動画の映像`を効率よく`WebGPU`へ渡す方法が今のところ存在しない点です。  
`OpenGL ES`の`SurfaceTexture`、`Vulkan`の`external memory + AHardwareBuffer`相当がない、見た感じ。一回`CPU`を経由してから`WebGPU`に転送するしかなさそうに見える。  

今のところは`ImageReader`を`YUV_420_888`でテクスチャを転送してみるとかなり高速に動く。  
効率が良いかといわれると怪しいけど、コピーするにしても`YUV`なので速いのかな。

# WebGPU とは
あーここではゲームに関しては触れません、アプリでどうしてもリアルタイムで映像を加工するみたいな場合を想定しています。  
ゲームに関しては`Unity`とかのゲームエンジンが代わりに`低レイヤーグラフィックスAPI`を叩いてくれているので。

## おもしろい記事があるからそっちを見てきてください
おもしろい記事があるので私の話よりもこっちを見てきてください。アーカイブにしか存在しないのが本当に惜しい；；なんで；；

https://web.archive.org/web/20230503112509/https://cohost.org/mcc/post/1406157-i-want-to-talk-about-webgpu

## Canvas が使えないユースケース
`WebGPU`は`低レイヤー`な`グラフィックス API`です。`OpenGL ES（GLES）`や`Vulkan`と同じ仲間です。  
低レイヤーなため、`Canvas`にある`文字を書く`とか`線を引く`機能はありません。もし`低レイヤー API`で文字を書きたい場合は一旦`Canvas`で書いて画像（テクスチャと呼びたいですね）を`GPU`に転送し`フラグメントシェーダ`で書くのが一番早いと思います。

基本的には`Canvas`を使えばよいわけですが、本当に一部のアプリは`Canvas`が使えない場合があります。

- 前後のカメラを合成して動画ファイルに保存するとか
    - https://takusan.negitoro.dev/posts/android_front_back_camera_2024/
- 動画やカメラ映像の上に文字を書いて動画ファイルに保存するとか
    - https://takusan.negitoro.dev/posts/android_add_canvas_text_to_video/
- 動画を部分的にぼかして再生するとか
    - https://takusan.negitoro.dev/posts/android_media3_video_side_blur/
- `HDR 動画`を編集するとか（いわゆる眩しい動画）
    - https://takusan.negitoro.dev/posts/android_hdr_camera_video_editor/

カメラや動画の映像は`Canvas`ではなく`SurfaceView`を使い描画するため、`Canvas`で加工することは出来ません。  
`SurfaceView`が特殊な`View`なのは`Canvas`に書けないからです。

補足すると、速度が出なくてもよい場合は`Canvas`を頑張って使う方法もあるかと思いますが（映像を1枚1枚画像にするなど）、あまり一般的ではないと思います。（無駄に電池を消費するとか、、）

### 余談 media3 と cameraX
動画再生ライブラリである`media3`、`Camera2 API`を代わりに叩いてくれる`CameraX`では、どちらも映像を加工するのに`OpenGL ES`を利用しています。  
予想でしかないですが彼らも`OpenGL ES`を書くとつらいはずだから、`WebGPU`が移植されたのかな～って

## OpenGLES と Vulkan
というわけで`Canvas`が使えないとなると何を使うのかというわけですが、`OpenGL ES`や`Vulkan`ですね。  
ほかのプラットフォームでは`Direct3D (Windows)`とか、`Metal (Apple デバイス)`になります。

![GPUプログラミングといえば三角形](https://oekakityou.negitoro.dev/resize/39a41bda-12ea-4310-bdac-18b7e094cf3b.png)

文字を書くとか図形を書くみたいな機能はもちろん無くて、基本的には**三角形**を描画することしかできない。`GLES`とかの練習で三角形が最初に出るのはそういうことです。  
三角形なのはこれを組み合わせればどんな図形も立体も書けるから。らしい。  
苦労して三角形書いてだから何？って。

三角形を書くためにはいくつかの関数呼び出しと、それとは別に`フラグメントシェーダー・バーテックスシェーダー`と呼ばれるプログラムを書く必要があります。  
`バーテックスシェーダー`が三角形の位置を決めて、`フラグメントシェーダー`が三角形に色を付けます。  
三角形に画像をあてはめたい場合は`GPU`に画像を転送し、`フラグメントシェーダー`で画像の色を取り出して色を決定する、、、みたいなことをします。

カメラや動画の映像がなぜ`低レイヤー`な`API`だと高速に扱えるのかというと、この`シェーダー`たちは同時に実行されます。  
例えば、`フルHD`の画面なら`1920x1080`の数だけ色を準備する必要があるわけですが、これらの色を決めるためにに並列で`シェーダー`を実行することでリアルタイムな描画ができているわけ。すごい！  
（ほかにも理由はあると思いますが）

世の中には`shadertoy`と呼ばれるサイトがあり、`ブラウザ版 OpenGL ES`である`WebGL`を使い`GPU`で高速に描画できるのをいいことに、`Canvas`では表現できないような力作が投稿されまくっているサイトがあります。

https://www.shadertoy.com/

`OpenGL ES`や`Vulkan`が何なのかはこの通りで、`Vulkan`は比較的新しいので`OpenGL ES`よりも速いらしいです。書いたことがないので分かりませんが。

## Vulkan 難しすぎ問題
昔からある`OpenGL ES`と、割と新しくて高速な`Vulkan`があるわけですが、選択肢は一択です。`OpenGL ES`一択です。（`2026年`記述時時点、`WebGPU`が流行ったら変わるかもしれない！）

速いのになぜ`Vulkan`を書かないのか？という質問が来ていました。  
**Vulkan は人間が書くのが無理なほど難しいと言われております。**  
（`OpenGL ES`ですら難しいのに><）

そもそも難しい上に、`Android`では`C++`で記述する必要があります。**C++!?!??!**  
`OpenGL ES`は`Java/Kotlin`から呼び出して描画することが出来たのですが、`Vulkan`では`C++`を書く必要があります。  
（え～`Android`開発各位は`16KB ページサイズ`が記憶に新しいので`Android NDK`を用意するのは嫌ですかね・・）

なんか`OpenGL ES`はスマホアプリで使ってほしそうな雰囲気を感じますが、それと違い`Vulkan`は用途が違うように思えます。  
多分`ゲーム`ではなく`ゲームエンジン`を作っている、とか、機械学習だから画面出力なしで`GPU`を使う。みたいな用途のためにこんなにも難しくなっているんでは？

先述のブログ曰く、`Metal`のがまだマシらしく、`Vulkan`がとにかく難しいらしい。。  

https://blog.jacobstechtavern.com/p/metal-in-swiftui-how-to-write-shaders

いやなんか`Metal`のがよさそうじゃないか（隣の芝生は青く何とかかんとか）

## WebGPU
もともとはブラウザで`OpenGL ES`を使えるようにする`WebGL`という技術があり、その後継として`WebGPU`があります。  
作った由来としては`WebGL`が出た時点で、すでに`OpenGL`以外の高性能な選択肢（`Vulkan`や`Windows`の`Direct3D12`や`Apple`の`Metal`）があり、これらをブラウザから使うために作られたとかなんとか。

`OpenGL ES`を大体そのまま移植した`WebGL`と違い、`WebGPU`はブラウザで動かすため`Windows / Android / Apple デバイス`で動かないといけない。  
それぞれのプラットフォームにある`グラフィックス API`を呼び出す形なので、`Vulkan`を置き換えるとかではなく、`Vulkan`の上で動くことになる。

`WebGL`と比べて`WebGPU`の方が高性能ゆえ難しいとされているが、ちょっと書いてみた限り`WebGPU`の方が**モダンなAPI**だし分かりやすくない？？？  
`OpenGL ES`よりも罠が少ない気がする。

`sampler`を要求するんだ～くらいしか引っかかるところがなかった（まあ大したコードを書いていないというのがある）

## Android に話を戻す
`Android`に話を戻すと、`Android`に移植された`WebGPU`ですが、ゼロから作ったわけではなく`Chrome`にある`WebGPU`の実装を`Android`に持ってきたみたいです。  
https://developer.chrome.com/blog/new-in-webgpu-144#dawn_updates

`Vulkan`の上で動くため、ライブラリをいれると`Vulkan`を使った`WebGPU`実装のネイティブライブラリ（`.so`）が入ります。  
これを`JNI`を経由して`Kotlin`から叩くことが出来るため、`Vulkan`を書かずとも高性能を享受できる！という寸法！

# OpenGLES を WebGPUにすると嬉しいこと

## モダンな API
**人間でも書ける、人間に書いてほしそうな** `API`がここにはあります。

何か間違えたら関数呼び出しの箇所で例外を投げてくれます。  

`OpenGL ES`の時は`glなんとかかんとか()`みたいな関数を呼び出しても失敗したかどうかは分かりません。  
失敗したかどうかは`GLES20.glGetError()`を別に呼び出すことで、さっきの関数呼び出しが失敗しているのかを知ることが出来ます。  
なので`GlUtil.checkGlError()`みたいな`static 関数`がどのプロジェクトにもあって、これを**開発者の気分によって**呼び出したり呼び出さなかったりされてる。  
（いまだにわからない、`OpenGL ES`のエラーチェック、どの程度でやってんの？`glなんとかかんとか()`を呼び出すたびにやってるの？）

![glerror_hex](https://oekakityou.negitoro.dev/original/0f8d6723-980e-41eb-b4a6-493fe5fdaf1b.png)

そもそもエラーが得られたとして、謎の`16進数`でエラーを表現するから**やる気なくすんだよな。**  
人間が読めるエラーなんて返してくれません。

`WebGPU`はマジで良くできていて、失敗した関数呼び出しで例外を投げてくれる。  
どこで失敗しているのかがすごくわかりやすい。人間が読めるエラーも出してくれる。バイト数が間違ってるとか、構文が違うとか。親切すぎ。

ほかにも、`フラグメントシェーダー`や`バーテックスシェーダー`がコンパイルに失敗しても例外を勝手に投げてくれます。  
`OpenGL ES`の時は、コンパイルに失敗したら`GLES20.glGetShaderInfoLog`を呼び出すことで`シェーダー`でどこが間違っているかを教えてくれます。逆に呼ばないと迷宮入り。

**`WebGPU`はとにかくエラーが分かりやすいと思います。**

あとは`WebGPU`のシェーダー`WebGPU Shading Language (WGSL)`も結構よいと思います。  
先述のブログ曰く、もともとは`Apple`と`Khronos Group`で会社同士の仲が悪くて作られたものらしい。

見た目がモダンなのを除くと、`フラグメントシェーダー`と`バーテックスシェーダー`を1か所に書けるのは結構よいと思いました。  
また、`頂点の配列`を`CPU`から渡さずに`バーテックスシェーダー`の中に直接書けるようになってて？（`OpenGL ES`で出来たっけ？）これは説明をする分や、とりあえず動かす分には分かりやすくてよいと思いました。複雑になるので基本的には`CPU`から渡すと思います。

`バーテックスシェーダー`で`構造体`を返して`フラグメントシェーダー`に渡すのもなんか直観的になった気がします。そもそも構造体なんてものが使えるだと・・・！  
`GLSL`の`varying`や`in / out`変数よりも`バーテックスシェーダー`が返すのが直観的というか（2回目）

## なんか GooglePixel は Vulkan なら性能が良いらしい
まあ`Pixel`はゲームを売りにしているわけではないし、ゲームしたいなら`Pixel`を選ばないと思うのでどうでもいい話なのはその通りなのですが、、

`GooglePixel`シリーズは`SoC`が`Google Tensor`になってから同期の`Android`と比べて特に`GPU`がイマイチになってます。  
特に`Pixel 10 シリーズ`においては、どういうわけか一つ前の世代よりも性能が悪化しているらしい。

というわけでネットの海をさまよった結果、**どうやら OpenGL ES のドライバーがイマイチなだけで**、  
**Vulkan なら一つ前と同じくらいの性能が出るらしい！**

https://www.reddit.com/r/GooglePixel/comments/1qbybhj

ところが、先述の通り`Vulkan`を使うには`C++`を書く必要と、すごく難しいであろう`API`を叩くことになるので試すことが出来なかった。

# 今回作るもの
なに作ろうかな～というわけで、万華鏡みたいなのを作ろうかと。  
よく見ると三角形を組み合わせて作っているのでそこまで難しくなさそうでいいかもしれない。難しいのはカメラ映像を`WebGPU`に渡すところかな、、、

![三角形を組み合わせれば作れそう](https://oekakityou.negitoro.dev/resize/4e5ae812-6ba5-487d-a1ab-061dbfd5c7e8.png)

# もう疲れたので APK だけくれませんか
はい

https://github.com/takusan23/AndroidWebGpuMangekyou/releases

# 環境

| なまえ                   | あたい                                |
|--------------------------|---------------------------------------|
| Android Studio           | Android Studio Quail 3 2026.1.3       |
| たんまつ                 | `Xperia 1 VIII` / `Pixel Pro Fold 10` |
| `androidx.webgpu:webgpu` | `1.0.0-alpha05`                       |

# 流れ

- カメラ権限を得る
- カメラ映像を受け取っていい感じに YUV_420 にする
- WebGPU の設定をする
- カメラ映像を受け取って描画する

# WebGPU ライブラリを入れる
`app/build.gradle.kts`の中の`dependencies`で`androidx.webgpu`を入れてください。いまんとこ`alpha`です。

```kotlin
dependencies {
    // WebGPU
    implementation("androidx.webgpu:webgpu:1.0.0-alpha05")

    // 以下省略...
```

# ざっくり WebGPU 入門
https://developer.android.com/develop/ui/views/graphics/webgpu/getting-started?hl=ja

ココにあります！

わたしも、知ってる限り、できる限り説明します！！  
`OpenGL ES`やってなくても`モダンなAPI`でやろー

## 三角形を書く MainActivity
とりあえず`WebGpuSurfaceView`とかいう`Composable`を作り、中身は`SurfaceView`を置いただけです。  
サンプルコードでは`AndroidExternalSurface`を使っているのですが、あんまり信用してない（？？？）ので`AndroidView`で行きます。

`SurfaceView`は画面回転とかで再生成されるため、`collectLatest`を使い描画するためのクラスも破棄して作り直すようにしました。  
`WebGpuRenderer()`クラスを作っていないのでエラーになります。この後作ります。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidWebGpuKaleidoscopeTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    WebGpuSurfaceView(modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}

@Composable
fun WebGpuSurfaceView(modifier: Modifier = Modifier) {
    val surfaceSize = remember { MutableStateFlow<IntSize?>(null) }
    val surfaceFlow = remember { MutableStateFlow<Surface?>(null) }

    LaunchedEffect(key1 = Unit) {
        // サイズと surface が得られること、得られない場合は return している
        combine(
            surfaceSize,
            surfaceFlow,
            ::Pair
        ).collectLatest { (size, surface) ->
            if (size != null && surface != null) {
                val renderer = WebGpuRenderer()
                try {
                    renderer.init(surface, size.width, size.height)
                    renderer.render()
                } finally {
                    // surface が再生成された、破棄されたとき
                    renderer.cleanup()
                }
            }
        }
    }

    AndroidView(
        modifier = modifier.onSizeChanged { surfaceSize.value = it },
        factory = { context ->
            SurfaceView(context).apply {
                holder.addCallback(object : SurfaceHolder.Callback {
                    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
                        // do nothing
                    }

                    override fun surfaceCreated(holder: SurfaceHolder) {
                        surfaceFlow.value = holder.surface
                    }

                    override fun surfaceDestroyed(holder: SurfaceHolder) {
                        surfaceFlow.value = null
                    }
                })
            }
        }
    )
}
```

そういえば、サンプル通りに`withContext(Dispatchers.Default)`で描画してると、最初のころはうまく動くんだけど、何回か繰り返し`render()`を呼び出していると謎のエラーで落ちるんだけど、これは何？  
仕方なく今回はメインスレッドで呼び出しています；；

```plaintext
Fatal signal 11 (SIGSEGV), code 1 (SEGV_MAPERR), fault addr 0x0 in tid 7821 (DefaultDispatch), pid 7763 (webgpumangekyou)
Executable: /system/bin/app_process64
Cmdline: io.github.takusan23.androidwebgpumangekyou
pid: 7763, ppid: 1064, tid: 7821, name: DefaultDispatch  >>> io.github.takusan23.androidwebgpumangekyou <<<
uid: 10470
tagged_addr_ctrl: 0000000000000001 (PR_TAGGED_ADDR_ENABLE)
pac_enabled_keys: 000000000000000f (PR_PAC_APIAKEY, PR_PAC_APIBKEY, PR_PAC_APDAKEY, PR_PAC_APDBKEY)
esr: 0000000092000006 (Data Abort Exception 0x24)
signal 11 (SIGSEGV), code 1 (SEGV_MAPERR), fault addr 0x0000000000000000 (read)
Cause: null pointer dereference

    x0  b400007313869af0  x1  00000070ca330820  x2  0000000000000060  x3  00000070ca330780
    x4  00000070ca3307e0  x5  0000000000000000  x6  0000000000000000  x7  0000000000000000
    x8  0000000000000048  x9  0000000000010000  x10 0000000000000400  x11 0000000000000048
    x12 00000070ca330808  x13 0000000000000001  x14 b400007273877cc0  x15 0000000000000000
    x16 0000000000000000  x17 000000742f6c50c0  x18 00000070c91e8000  x19 00000070ca3308e8
    x20 0000000000000000  x21 00000070ca3307e0  x22 b40000720388fef0  x23 000000003b9f9490
    x24 0000000000000000  x25 00000070ca330780  x26 0000000000000000  x27 0000000000000400
    x28 00000070ca3307e0  x29 00000070ca330720
    lr  00016af12dfb166c  sp  00000070ca3306b0  pc  000000712deddbd8  pst 0000000060001000
    esr 0000000092000006  vg  0000000000000002

51 total frames
backtrace:
      #00 pc 00000000000acbd8  /vendor/lib64/hw/vulkan.powervr.so (CmdPipelineBarrier+40) (BuildId: c5a24e633e33df683ac924d335f0fa5e)
      #01 pc 0000000000180668  /vendor/lib64/hw/vulkan.powervr.so (IMG_vkCmdPipelineBarrier+600) (BuildId: c5a24e633e33df683ac924d335f0fa5e)
      #02 pc 00000000002a5d90  /data/app/~~a9tWnlc2Ui69foMsJvwU-w==/io.github.takusan23.androidwebgpumangekyou-2HqmwQPXD1IXlHvS7R8ZNQ==/base.apk!libwebgpu_c_bundled.so (offset 0xa4000) (BuildId: 3b2a4919ce8bcfa4a301e256d6bcc7ff)
      #03 pc 00000000002a42fc  /data/app/~~a9tWnlc2Ui69foMsJvwU-w==/io.github.takusan23.androidwebgpumangekyou-2HqmwQPXD1IXlHvS7R8ZNQ==/base.apk!libwebgpu_c_bundled.so (offset 0xa4000) (BuildId: 3b2a4919ce8bcfa4a301e256d6bcc7ff)

以下省略...
```

## 三角形を書く WebGpuRenderer
これはサンプル通りで、分かりにくい部分をちょっと改行して分かりやすくしただけです。  
このクラスを用意すると`MainActivity`の方のエラーが消えるので、これで実行してみましょう。

**とりあえず三角形を見てから超簡単に解説します。**

```kotlin
class WebGpuRenderer {
    private lateinit var webGpu: WebGpu
    private lateinit var renderPipeline: GPURenderPipeline

    suspend fun init(surface: Surface, width: Int, height: Int) {
        // 1. Create Instance & Device
        webGpu = createWebGpu(surface)
        val device = webGpu.device

        // 2. Setup Pipeline (compile shaders)
        initPipeline(device)

        // 3. Configure the Surface
        webGpu.webgpuSurface.configure(
            GPUSurfaceConfiguration(
                device,
                width,
                height,
                TextureFormat.RGBA8Unorm,
            )
        )
    }

    fun render() {
        if (!::webGpu.isInitialized) {
            return
        }

        val gpu = webGpu

        // 1. Get the next available texture from the screen
        val surfaceTexture = gpu.webgpuSurface.getCurrentTexture()

        // 2. Create a command encoder
        val commandEncoder = gpu.device.createCommandEncoder()

        // 3. Begin a render pass (clearing the screen to blue)
        val renderPass = commandEncoder.beginRenderPass(
            GPURenderPassDescriptor(
                colorAttachments = arrayOf(
                    GPURenderPassColorAttachment(
                        GPUColor(0.0, 0.0, 0.5, 1.0),
                        surfaceTexture.texture.createView(),
                        loadOp = LoadOp.Clear,
                        storeOp = StoreOp.Store,
                    )
                )
            )
        )

        // 4. Draw
        renderPass.setPipeline(renderPipeline)
        renderPass.draw(3) // Draw 3 vertices
        renderPass.end()

        // 5. Submit and Present
        gpu.device.queue.submit(arrayOf(commandEncoder.finish()))
        gpu.webgpuSurface.present()
    }

    fun cleanup() {
        if (::webGpu.isInitialized) {
            webGpu.close()
        }
    }

    private fun initPipeline(device: GPUDevice) {
        val shaderCode = """
        @vertex fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f {
            const pos = array(vec2f(0.0, 0.5), vec2f(-0.5, -0.5), vec2f(0.5, -0.5));
            return vec4f(pos[vertexIndex], 0, 1);
        }
        
        @fragment fn fs_main() -> @location(0) vec4f {
            return vec4f(1, 0, 0, 1);
        }
    """

        // Create Shader Module
        val shaderModule = device.createShaderModule(
            GPUShaderModuleDescriptor(shaderSourceWGSL = GPUShaderSourceWGSL(shaderCode))
        )

        // Create Render Pipeline
        renderPipeline = device.createRenderPipeline(
            descriptor = GPURenderPipelineDescriptor(
                vertex = GPUVertexState(
                    shaderModule,
                ),
                fragment = GPUFragmentState(
                    shaderModule,
                    targets = arrayOf(GPUColorTargetState(TextureFormat.RGBA8Unorm))
                ),
                primitive = GPUPrimitiveState(PrimitiveTopology.TriangleList)
            )
        )
    }
}
```

## 三角形が表示できた！
赤い三角形が表示されてますね！

![webgpu_triangle_not_fix_aspect](https://oekakityou.negitoro.dev/resize/39a41bda-12ea-4310-bdac-18b7e094cf3b.png)

**なんか歪んでない？**、スマホが縦長だからそれに追従して縦に長くなってない？

## なぜ三角形が表示されるのか

`suspend fun init()`が`WebGPU`の初期化をしている箇所です。名前通りイニシャライズですね。  
この辺はお作法なので飛ばします。`OpenGL ES`の時の`EGL`ほにゃららの時よりはるかに分かりやすい`API`だ。

三角形は`fun render()`で描画をしています。  
重要なのは`draw(3)`と、`initPipeline()`の`shaderCode`の文字列ですね。それ以外はお作法です（`CPU`から値を渡す`Uniform`とかが無いシンプルなものなのでもうお作法）

以下のコードが`シェーダー`と呼ばれるもので、`Rust`っぽい雰囲気（変換できる）を感じますね！。`WebGPU Shader Language (WGSL)`と呼びます。  
この関数たちは`GPU`側で動作します。それっぽくなってきましたね！

```wgsl
@vertex fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f {
    const pos = array(vec2f(0.0, 0.5), vec2f(-0.5, -0.5), vec2f(0.5, -0.5));
    return vec4f(pos[vertexIndex], 0, 1);
}

@fragment fn fs_main() -> @location(0) vec4f {
    return vec4f(1, 0, 0, 1);
}
```

`draw(3)`を呼び出すと、`3`なので三回`vs_main()`関数が呼び出されます。引数の`vertexIndex`がそれぞれ`0,1,2`で呼び出される感じですね。  
これは`バーテックスシェーダー`と呼ばれています。位置を決めるのに使われます。

`const pos = array(...)`が、**三角形**の頂点の座標です。`0.5`という数字は、`WebGPU`の座標系による数字です。（`OpenGL ES`の時と同じような感じですが）

というのも、`WebGPU`は`X/Y 座標`が`1280`とか`720`とかではなく、`-1`から`1`の範囲に正規化されます。  
`三角形`を見た時に`縦に長くなっている`と思ったと思いますが、これは**縦も横も**`-1`から`1`の範囲に無理やり押し込まれているからなんですね。  
縦の`-1 ~ 1`と、横の`-1 ~ 1`が異なるため、縦長になってしまう。

![webgpu_座標は-1から1の範囲になる](https://oekakityou.negitoro.dev/resize/33394696-f1fc-40e0-8149-c1c3abd34783.png)

コードの`const pos = array(vec2f(0.0, 0.5), vec2f(-0.5, -0.5), vec2f(0.5, -0.5));`だと

- 最初の頂点は`x=0`で、`y=0.5`（上）
- 次の頂点は`x=-0.5`で、`y=0.5`（左下）
- 最後の頂点が`x=0.5`で、`y=-0.5`（右下）

となります。`pos[vertexIndex]`でそれぞれの配列から取り出して`return`しているので、これで三角形が書けます。

![webgpu_座標と三角形の説明](https://oekakityou.negitoro.dev/resize/02ccb6ef-8882-4873-ad0f-a18299d11a55.png)

次は`fs_main()`が呼びだされます。`フラグメントシェーダー`と呼ばれています。これは色を決める関数です。各ピクセルに対して呼ばれるわけですね！  
が、ここでは省略するため`vec4f(1, 0, 0, 1);`を常に返していますね。`vec4`はそれぞれ`赤色, 緑色, 青色, 透明度`の順番で`0`から`1`の値を取ります。この例では`赤`（と`透明`）だけが`1`なので、赤色になります。  
画像を表示するとかの場合はここに書けばよいわけですね！

### 例えば四角形を書くなら？
四角形はよく見てみると、縦に長くした三角形を並べて二つ描画することで四角形が描画できるということに気付きますね！  
というわけで、`draw(6)`にして（三角形を二つ書くため）、頂点の配列をこんな感じにすることで四角形を描画することが出来るはずです。

```wgsl
const pos = array(
    vec2<f32>(-1.0, -1.0), // 左下
    vec2<f32>( 1.0, -1.0), // 右下
    vec2<f32>(-1.0,  1.0), // 左上
    vec2<f32>(-1.0,  1.0), // 左上
    vec2<f32>( 1.0, -1.0), // 右下
    vec2<f32>( 1.0,  1.0)  // 右上
);
```

## 変換行列
`コンピューターグラフィック`の世界では`カメラ？`とかの専門用語があるみたいなのですが、まあよく分からないんため、ここでは`変換行列`と呼ぶことにします。

`三角形`が歪んでいます。これは先述の通りスマホの画面が縦長ゆえに、縦の`-1 ~ 1`と横の`-1 ~ 1`が違うことが原因です。  
（なのでたまたま正方形なら問題ないかもしれません）

三角形を動かしたり、サイズを変えたり、スケールを変えたりすることが出来る**Float 型を 16 個取る魔法みたいな配列**があります。これが**変換行列**ですね。  
`コンピューターグラフィックス`の世界においては**配列**と呼ぶより、**ベクトル**や**行列**と呼んだ方が正しいかもしれません。

専門じゃないので本当によく分からないわけですが、`OpenGL ES`や`WebGPU`のシェーダーでは**配列と配列の足し算引き算掛け算割り算**が文字通り出来るようになってます。  
`vec4f() * vec4f()`みたいな。そのままだね。

そして、先述の`三角形`の頂点と`変換行列`を掛け算することで、さっきの`三角形`を`回転`させたり、`移動`させたり、`スケール`を変えて横に引き延ばしたりできます。

例えば三角形を`90度`傾けてみる場合はこんな感じ。  
回転するだけな、変換行列は`2x2`で`4`つの`float`配列で済むらしい。

```wgsl
@vertex fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f {
    const pos = array(vec2f(0.0, 0.5), vec2f(-0.5, -0.5), vec2f(0.5, -0.5));
    
    // WGSL 側で回転行列を作る
    let camera_cosTheta = cos(radians(90));
    let camera_sinTheta = sin(radians(90));
    let rotate_matrix = mat2x2f(
        vec2f(camera_cosTheta, camera_sinTheta),
        vec2f(-camera_sinTheta, camera_cosTheta)
    );
    
    // 回転する
    let xy = pos[vertexIndex];
    let position = rotate_matrix * xy; // ベクトル同士の掛け算！
    
    return vec4f(position, 0, 1);
}
```

![webgpu_回転行列を掛け算して回転した三角形](https://oekakityou.negitoro.dev/resize/01402535-e2d0-4d14-a969-53c4a6d18552.png)

ところで、変換行列は作るのが難しいため（正直に言うと↑の回転する行列は`AI`に書いてもらった）、自力では書かないと思います。  
`変換行列`で調べるとなんだか怖い数式が出ますが、わたしたちは自力では書きません。

代わりに`Android`には`android.opengl.Matrix`クラスが存在し、`16個`の`Float`を持つ配列を渡すだけで、好きなように移動させたり回転させたりする行列を書いてくれます！やったぜ！  
しかしこれを使うには`CPU`と`GPU`のメモリを超える必要があります。`Kotlin`で作った行列を`WebGPU`に渡す必要があります。

## 変換行列を使って歪んでいる三角形を直す
まずは`変数`を宣言します。  
`transformMatrixUniformBuffer`と`bindGroup`です。

```kotlin
private lateinit var webGpu: WebGpu
private lateinit var renderPipeline: GPURenderPipeline

// 変換行列を渡す
private lateinit var transformMatrixUniformBuffer: GPUBuffer
private lateinit var bindGroup: GPUBindGroup

private var width = 0
private var height = 0
```

次に、`initPipeline()`関数の中に書き足します。`lateinit var`に代入します。

```kotlin
private fun initPipeline(device: GPUDevice) {

    // 省略...

    // CPU から値を渡す準備
    transformMatrixUniformBuffer = device.createBuffer(
        GPUBufferDescriptor(
            size = 64,
            usage = BufferUsage.Uniform or BufferUsage.CopyDst
        )
    )
    bindGroup = webGpu.device.createBindGroup(
        descriptor = GPUBindGroupDescriptor(
            layout = renderPipeline.getBindGroupLayout(0),
            entries = arrayOf(
                GPUBindGroupEntry(binding = 0, buffer = transformMatrixUniformBuffer)
            )
        )
    )
}
```

同様に`width`と`height`は`init()`関数で代入するようにしました。

```kotlin
suspend fun init(surface: Surface, width: Int, height: Int) {
    this.width = width
    this.height = height

    // 以下省略...
}
```

次に`シェーダー`を修正します。  
`CPU`から受け取った行列を使えるようにしているのが`@group(0) @binding(0) var<uniform> transformMatrix: Uniforms;`ですね。  
型は`struct Uniforms { ... }`を使っています。今回はシンプルに`ベクトル`を一つだけ定義してます。

構造体なので複数の値を定義して`CPU`から`GPU`へ値を渡すことが出来ますが、もしそうする場合は`device.createBuffer()`で構造体が使うメモリの量をちゃんと計算して、  
後述する`device.queue.writeBuffer()`でデータをつなげる必要があると思います。

また行列を適用できるように、`バーテックスシェーダー`で`vec4f(pos[vertexIndex], 0, 1)`を`return`する前に、変換行列を掛け算を追加します。  
見てもらえばわかるかと思いますが本当に掛け算です。

```wgsl
    val shaderCode = """
    // Uniforms 構造体
    struct Uniforms {
        matrix: mat4x4<f32>,
    }
        
    // CPU から受け取る
    @group(0) @binding(0) var<uniform> transformMatrix: Uniforms;
        
    @vertex fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f {
        const pos = array(vec2f(0.0, 0.5), vec2f(-0.5, -0.5), vec2f(0.5, -0.5));
        let transformedVec = vec4f(pos[vertexIndex], 0, 1) * transformMatrix.matrix; // 変換行列を適用
        return transformedVec;
    }
    
    @fragment fn fs_main() -> @location(0) vec4f {
        return vec4f(1, 0, 0, 1);
    }
"""
```

これで`CPU`から`GPU (シェーダー)`側へ配列（ベクトル、行列）を渡せるようになりました。  
次は`Matrix`クラスを使って変換行列を用意します。

まずは`Float`の配列を`ByteBuffer`に変換する`拡張関数`を書きました。`Float`の配列ではなく`ByteBuffer`でやり取りするみたいなので。

```kotlin
private fun FloatArray.toByteBuffer(): ByteBuffer {
    val bufferSize = this.size * Float.SIZE_BYTES
    val byteBuffer = ByteBuffer.allocateDirect(bufferSize)
        .order(ByteOrder.nativeOrder())
        .also { byteBuffer -> byteBuffer.asFloatBuffer().put(this).rewind() }
    return byteBuffer
}
```

`render()`関数で`GPU`に転送しますか、`render()`関数で`変換行列`を作って`GPU`に転送します。

```kotlin
fun render() {
    if (!::webGpu.isInitialized) {
        return
    }

    val gpu = webGpu

    // 変換行列を用意
    // 三角形が歪まないようにする
    val transformMatrix = FloatArray(16)
    Matrix.setIdentityM(transformMatrix, 0)
    // WebGPU 側を正方形にする、SurfaceView は画面いっぱいなので縦長のママだが、見切れる前提で正方形にする。これで三角形が歪まなくなる
    if (width < height) {
        val scale = (height / width.toFloat())
        Matrix.scaleM(transformMatrix, 0, scale, 1f, 1f)
    } else {
        val scale = (width / height.toFloat())
        Matrix.scaleM(transformMatrix, 0, 1f, scale, 1f)
    }
    // GPU に転送
    gpu.device.queue.writeBuffer(transformMatrixUniformBuffer, 0, transformMatrix.toByteBuffer())

    // 以下省略...
}
```

どういうことをやっているのかというと、縦と横で長さが違うのに`-1 ~ 1`に収められているのが悪い。なので、縦に長い分だけ横に引き延ばすスケールを適用する行列？を作っています。  
縦と同じ長さになるように横を引き延ばします。縦と横の長さが同じになれば三角形も正三角形になるハズです！

![webgpu_やる前の図、横にスケールを伸ばした図、実際に伸ばしたためスマホの画面外に突っ込んでいる説明の図](https://oekakityou.negitoro.dev/resize/44a7be04-61cb-490f-ae8a-682e3887904a.png)

これで実行してみますと、`CPU`で作った変換行列が適用されて、歪みのないきれいな三角形になっているのではないでしょうか！？  
おめでとう！そして`低レイヤーグラフィックス API`は難しい。。。

![webgpu_triangle_fixed_aspect](https://oekakityou.negitoro.dev/resize/014392ad-c6b4-4778-ab72-76951e0a413e.png)

## 回転しようぜ
`Matrix`クラスに回転を変換行列へ追加できる関数があるのでこれを呼べば回転もできます。  
変換行列の注意点としては、適用する順番がちゃんとあって、順番を間違えると期待通りになりません。

```kotlin
private var rotate = 0f

fun render() {
    if (!::webGpu.isInitialized) {
        return
    }

    val gpu = webGpu


    // 変換行列を用意
    // 三角形が歪まないようにする
    val transformMatrix = FloatArray(16)
    Matrix.setIdentityM(transformMatrix, 0)
    // 回転
    rotate++
    if (rotate == 360f) {
        rotate = 0f
    }
    Matrix.rotateM(transformMatrix, 0, rotate, 0f, 0f, 1f)
    // WebGPU 側を正方形にする、SurfaceView は画面いっぱいなので縦長のママだが、見切れる前提で正方形にする。これで三角形が歪まなくなる
    if (width < height) {
        val scale = (height / width.toFloat())
        Matrix.scaleM(transformMatrix, 0, scale, 1f, 1f)
    } else {
        val scale = (width / height.toFloat())
        Matrix.scaleM(transformMatrix, 0, 1f, scale, 1f)
    }
    // 小さくする
    Matrix.scaleM(transformMatrix, 0, .5f, .5f, .5f)
    // GPU に転送
    gpu.device.queue.writeBuffer(transformMatrixUniformBuffer, 0, transformMatrix.toByteBuffer())

    // 以下省略...
```

あとは`render()`を繰り返し呼ぶようにすれば`rotate`がインクリメントされ続けるのでくるくる回るようになります。

```kotlin
LaunchedEffect(key1 = Unit) {
    // サイズと surface が得られること、得られない場合は return している
    combine(
        surfaceSize,
        surfaceFlow,
        ::Pair
    ).collectLatest { (size, surface) ->
        if (size != null && surface != null) {
            val renderer = WebGpuRenderer()
            try {
                renderer.init(surface, size.width, size.height)
                // 繰り返し呼ぶ
                while (true) {
                    delay(16.milliseconds) // 60fps
                    renderer.render()
                }
            } finally {
                // surface が再生成された、破棄されたとき
                renderer.cleanup()
            }
        }
    }
}
```

![webgpu_triangle_rotate](https://oekakityou.negitoro.dev/resize/01402535-e2d0-4d14-a969-53c4a6d18552.png)

以上！入門！これからは本題の`万華鏡`をつくるぞ！

## ここまでのコード全部

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidWebGpuMangekyouTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    WebGpuSurfaceView(modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}

@Composable
fun WebGpuSurfaceView(modifier: Modifier = Modifier) {
    val surfaceSize = remember { MutableStateFlow<IntSize?>(null) }
    val surfaceFlow = remember { MutableStateFlow<Surface?>(null) }

    LaunchedEffect(key1 = Unit) {
        // サイズと surface が得られること、得られない場合は return している
        combine(
            surfaceSize,
            surfaceFlow,
            ::Pair
        ).collectLatest { (size, surface) ->
            if (size != null && surface != null) {
                val renderer = WebGpuRenderer()
                try {
                    renderer.init(surface, size.width, size.height)
                    // 繰り返し呼ぶ
                    while (true) {
                        delay(16.milliseconds)
                        renderer.render()
                    }
                } finally {
                    // surface が再生成された、破棄されたとき
                    renderer.cleanup()
                }
            }
        }
    }

    AndroidView(
        modifier = modifier.onSizeChanged { surfaceSize.value = it },
        factory = { context ->
            SurfaceView(context).apply {
                holder.addCallback(object : SurfaceHolder.Callback {
                    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
                        // do nothing
                    }

                    override fun surfaceCreated(holder: SurfaceHolder) {
                        surfaceFlow.value = holder.surface
                    }

                    override fun surfaceDestroyed(holder: SurfaceHolder) {
                        surfaceFlow.value = null
                    }
                })
            }
        }
    )
}
```

```kotlin
class WebGpuRenderer {
    private lateinit var webGpu: WebGpu
    private lateinit var renderPipeline: GPURenderPipeline

    // 変換行列を渡す
    private lateinit var transformMatrixUniformBuffer: GPUBuffer
    private lateinit var bindGroup: GPUBindGroup

    private var width = 0
    private var height = 0

    suspend fun init(surface: Surface, width: Int, height: Int) {
        this.width = width
        this.height = height

        // 1. Create Instance & Device
        webGpu = createWebGpu(surface)
        val device = webGpu.device

        // 2. Setup Pipeline (compile shaders)
        initPipeline(device)

        // 3. Configure the Surface
        webGpu.webgpuSurface.configure(
            GPUSurfaceConfiguration(
                device,
                width,
                height,
                TextureFormat.RGBA8Unorm,
            )
        )
    }

    private var rotate = 0f

    fun render() {
        if (!::webGpu.isInitialized) {
            return
        }

        val gpu = webGpu


        // 変換行列を用意
        // 三角形が歪まないようにする
        val transformMatrix = FloatArray(16)
        Matrix.setIdentityM(transformMatrix, 0)
        // 回転
        rotate++
        if (rotate == 360f) {
            rotate = 0f
        }
        Matrix.rotateM(transformMatrix, 0, rotate, 0f, 0f, 1f)
        // WebGPU 側を正方形にする、SurfaceView は画面いっぱいなので縦長のママだが、見切れる前提で正方形にする。これで三角形が歪まなくなる
        if (width < height) {
            val scale = (height / width.toFloat())
            Matrix.scaleM(transformMatrix, 0, scale, 1f, 1f)
        } else {
            val scale = (width / height.toFloat())
            Matrix.scaleM(transformMatrix, 0, 1f, scale, 1f)
        }
        // 小さくする
        Matrix.scaleM(transformMatrix, 0, .5f, .5f, .5f)
        // GPU に転送
        gpu.device.queue.writeBuffer(transformMatrixUniformBuffer, 0, transformMatrix.toByteBuffer())


        // 1. Get the next available texture from the screen
        val surfaceTexture = gpu.webgpuSurface.getCurrentTexture()

        // 2. Create a command encoder
        val commandEncoder = gpu.device.createCommandEncoder()

        // 3. Begin a render pass (clearing the screen to blue)
        val renderPass = commandEncoder.beginRenderPass(
            GPURenderPassDescriptor(
                colorAttachments = arrayOf(
                    GPURenderPassColorAttachment(
                        GPUColor(0.0, 0.0, 0.5, 1.0),
                        surfaceTexture.texture.createView(),
                        loadOp = LoadOp.Clear,
                        storeOp = StoreOp.Store,
                    )
                )
            )
        )

        // 4. Draw
        renderPass.setPipeline(renderPipeline)
        renderPass.setBindGroup(0, bindGroup) // @group(0) なので 0
        renderPass.draw(3) // 三角形の頂点の数が3個
        renderPass.end()

        // 5. Submit and Present
        gpu.device.queue.submit(arrayOf(commandEncoder.finish()))
        gpu.webgpuSurface.present()
    }

    fun cleanup() {
        if (::webGpu.isInitialized) {
            webGpu.close()
        }
    }

    private fun FloatArray.toByteBuffer(): ByteBuffer {
        val bufferSize = this.size * Float.SIZE_BYTES
        val byteBuffer = ByteBuffer.allocateDirect(bufferSize)
            .order(ByteOrder.nativeOrder())
            .also { byteBuffer -> byteBuffer.asFloatBuffer().put(this).rewind() }
        return byteBuffer
    }

    private fun initPipeline(device: GPUDevice) {
        val shaderCode = """
    // Uniforms 構造体
    struct Uniforms {
        matrix: mat4x4<f32>,
    }
        
    // CPU から受け取る
    @group(0) @binding(0) var<uniform> transformMatrix: Uniforms;
        
    @vertex fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f {
        const pos = array(vec2f(0.0, 0.5), vec2f(-0.5, -0.5), vec2f(0.5, -0.5));
        let transformedVec = vec4f(pos[vertexIndex], 0, 1) * transformMatrix.matrix; // 変換行列を適用
        return transformedVec;
    }
    
    @fragment fn fs_main() -> @location(0) vec4f {
        return vec4f(1, 0, 0, 1);
    }
"""

        // Create Shader Module
        val shaderModule = device.createShaderModule(
            GPUShaderModuleDescriptor(shaderSourceWGSL = GPUShaderSourceWGSL(shaderCode))
        )

        // Create Render Pipeline
        renderPipeline = device.createRenderPipeline(
            descriptor = GPURenderPipelineDescriptor(
                vertex = GPUVertexState(
                    shaderModule,
                ),
                fragment = GPUFragmentState(
                    shaderModule,
                    targets = arrayOf(GPUColorTargetState(TextureFormat.RGBA8Unorm))
                ),
                primitive = GPUPrimitiveState(PrimitiveTopology.TriangleList)
            )
        )

        // CPU から値を渡す準備
        transformMatrixUniformBuffer = device.createBuffer(
            GPUBufferDescriptor(
                size = 64,
                usage = BufferUsage.Uniform or BufferUsage.CopyDst
            )
        )
        bindGroup = webGpu.device.createBindGroup(
            descriptor = GPUBindGroupDescriptor(
                layout = renderPipeline.getBindGroupLayout(0),
                entries = arrayOf(
                    GPUBindGroupEntry(binding = 0, buffer = transformMatrixUniformBuffer)
                )
            )
        )
    }
}
```

# 万華鏡をつくる
流れとしてはこれに、カメラを用意していい感じに`GPU`に転送して、三角形を増やして描画する感じになります。

## 万華鏡用に MainActivity を書き換える
さっきの`WebGpuRenderer`とは別物のクラスを作る予定で、また、カメラの権限を許可してもらう必要があり、別の`Composable`関数を作って`MainActivity`に設置することにします。  
`MangekyouWebGpuRenderer`はこれから作ります。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidWebGpuMangekyouTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    MangekyouGpuSurfaceView(modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}

@Composable
fun MangekyouGpuSurfaceView(modifier: Modifier = Modifier) {
    val surfaceSize = remember { MutableStateFlow<IntSize?>(null) }
    val surfaceFlow = remember { MutableStateFlow<Surface?>(null) }

    val context = LocalContext.current
    val isPermissionGranted = remember { Channel<Boolean>() }
    val permissionRequester = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { isGranted ->
            isPermissionGranted.trySend(isGranted)
        }
    )

    LaunchedEffect(key1 = Unit) {
        // 権限を要求して待つ
        permissionRequester.launch(android.Manifest.permission.CAMERA)
        if (!isPermissionGranted.receive()) {
            println("権限が付与されませんでした...")
        }

        // サイズと surface が得られること、得られない場合は return している
        combine(
            surfaceSize,
            surfaceFlow,
            ::Pair
        ).collectLatest { (size, surface) ->
            if (size != null && surface != null) {
                val renderer = MangekyouWebGpuRenderer(context)
                try {
                    renderer.init(surface, size.width, size.height)
                    // 繰り返し呼ぶ
                    while (true) {
                        delay(16.milliseconds)
                        renderer.render()
                    }
                } finally {
                    // surface が再生成された、破棄されたとき
                    renderer.cleanup()
                }
            }
        }
    }

    AndroidView(
        modifier = modifier.onSizeChanged { surfaceSize.value = it },
        factory = { context ->
            SurfaceView(context).apply {
                holder.addCallback(object : SurfaceHolder.Callback {
                    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
                        // do nothing
                    }

                    override fun surfaceCreated(holder: SurfaceHolder) {
                        surfaceFlow.value = holder.surface
                    }

                    override fun surfaceDestroyed(holder: SurfaceHolder) {
                        surfaceFlow.value = null
                    }
                })
            }
        }
    )
}
```

## 描画するクラスを作る
さっきまで作っていたクラスを基礎にするので、とりあえず新しいクラスを作りますが、中身は同じ。

```kotlin
class MangekyouWebGpuRenderer {
    private lateinit var webGpu: WebGpu
    private lateinit var renderPipeline: GPURenderPipeline

    // 変換行列を渡す
    private lateinit var transformMatrixUniformBuffer: GPUBuffer
    private lateinit var bindGroup: GPUBindGroup

    private var width = 0
    private var height = 0

    suspend fun init(surface: Surface, width: Int, height: Int) {
        this.width = width
        this.height = height

        // 1. Create Instance & Device
        webGpu = createWebGpu(surface)
        val device = webGpu.device

        // 2. Setup Pipeline (compile shaders)
        initPipeline(device)

        // 3. Configure the Surface
        webGpu.webgpuSurface.configure(
            GPUSurfaceConfiguration(
                device,
                width,
                height,
                TextureFormat.RGBA8Unorm,
            )
        )
    }
    
    fun render() {
        if (!::webGpu.isInitialized) {
            return
        }

        val gpu = webGpu


        // 変換行列を用意
        // 三角形が歪まないようにする
        val transformMatrix = FloatArray(16)
        Matrix.setIdentityM(transformMatrix, 0)
        // WebGPU 側を正方形にする、SurfaceView は画面いっぱいなので縦長のママだが、見切れる前提で正方形にする。これで三角形が歪まなくなる
        if (width < height) {
            val scale = (height / width.toFloat())
            Matrix.scaleM(transformMatrix, 0, scale, 1f, 1f)
        } else {
            val scale = (width / height.toFloat())
            Matrix.scaleM(transformMatrix, 0, 1f, scale, 1f)
        }
        // 小さくする
        Matrix.scaleM(transformMatrix, 0, .5f, .5f, .5f)
        // GPU に転送
        gpu.device.queue.writeBuffer(transformMatrixUniformBuffer, 0, transformMatrix.toByteBuffer())


        // 1. Get the next available texture from the screen
        val surfaceTexture = gpu.webgpuSurface.getCurrentTexture()

        // 2. Create a command encoder
        val commandEncoder = gpu.device.createCommandEncoder()

        // 3. Begin a render pass (clearing the screen to blue)
        val renderPass = commandEncoder.beginRenderPass(
            GPURenderPassDescriptor(
                colorAttachments = arrayOf(
                    GPURenderPassColorAttachment(
                        GPUColor(0.0, 0.0, 0.5, 1.0),
                        surfaceTexture.texture.createView(),
                        loadOp = LoadOp.Clear,
                        storeOp = StoreOp.Store,
                    )
                )
            )
        )

        // 4. Draw
        renderPass.setPipeline(renderPipeline)
        renderPass.setBindGroup(0, bindGroup) // @group(0) なので 0
        renderPass.draw(3) // 三角形の頂点の数が3個
        renderPass.end()

        // 5. Submit and Present
        gpu.device.queue.submit(arrayOf(commandEncoder.finish()))
        gpu.webgpuSurface.present()
    }

    fun cleanup() {
        if (::webGpu.isInitialized) {
            webGpu.close()
        }
    }

    private fun FloatArray.toByteBuffer(): ByteBuffer {
        val bufferSize = this.size * Float.SIZE_BYTES
        val byteBuffer = ByteBuffer.allocateDirect(bufferSize)
            .order(ByteOrder.nativeOrder())
            .also { byteBuffer -> byteBuffer.asFloatBuffer().put(this).rewind() }
        return byteBuffer
    }

    private fun initPipeline(device: GPUDevice) {
        val shaderCode = """
    // Uniforms 構造体
    struct Uniforms {
        matrix: mat4x4<f32>,
    }
        
    // CPU から受け取る
    @group(0) @binding(0) var<uniform> transformMatrix: Uniforms;
        
    @vertex fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4f {
        const pos = array(vec2f(0.0, 0.5), vec2f(-0.5, -0.5), vec2f(0.5, -0.5));
        let transformedVec = vec4f(pos[vertexIndex], 0, 1) * transformMatrix.matrix; // 変換行列を適用
        return transformedVec;
    }
    
    @fragment fn fs_main() -> @location(0) vec4f {
        return vec4f(1, 0, 0, 1);
    }
"""

        // Create Shader Module
        val shaderModule = device.createShaderModule(
            GPUShaderModuleDescriptor(shaderSourceWGSL = GPUShaderSourceWGSL(shaderCode))
        )

        // Create Render Pipeline
        renderPipeline = device.createRenderPipeline(
            descriptor = GPURenderPipelineDescriptor(
                vertex = GPUVertexState(
                    shaderModule,
                ),
                fragment = GPUFragmentState(
                    shaderModule,
                    targets = arrayOf(GPUColorTargetState(TextureFormat.RGBA8Unorm))
                ),
                primitive = GPUPrimitiveState(PrimitiveTopology.TriangleList)
            )
        )

        // CPU から値を渡す準備
        transformMatrixUniformBuffer = device.createBuffer(
            GPUBufferDescriptor(
                size = 64,
                usage = BufferUsage.Uniform or BufferUsage.CopyDst
            )
        )
        bindGroup = webGpu.device.createBindGroup(
            descriptor = GPUBindGroupDescriptor(
                layout = renderPipeline.getBindGroupLayout(0),
                entries = arrayOf(
                    GPUBindGroupEntry(binding = 0, buffer = transformMatrixUniformBuffer)
                )
            )
        )
    }
}
```

## カメラの準備
`AndroidManifest.xml`にカメラ権限を追加します。

```xml
<uses-permission android:name="android.permission.CAMERA" />
```

つぎに、`MangekyouWebGpuRenderer`に`Camera2`用の関数とかを用意します。中身は後で！  
また、`Camera2API`のために`Context`が必要だったのでコンストラクタ引数でとることにします。`width と height`もこうやって取ればよかった、、

あと`cleanup()`に破棄する処理を足しておきました、あと映像サイズを`companion`に置いておきます、`CAMERA_WIDTH`

```kotlin
class MangekyouWebGpuRenderer(private val context: Context) {

    // 省略...

    // カメラの映像を得る
    private val latestImageChannel = Channel<Image>(capacity = Channel.CONFLATED, onUndeliveredElement = { it.close() })
    private var imageReader: ImageReader? = null
    private var cameraDevice: CameraDevice? = null
    private val cameraExecutor = Executors.newSingleThreadExecutor()

    // 省略...

    fun cleanup() {
        if (::webGpu.isInitialized) {
            webGpu.close()
        }
        cameraDevice?.close()
        imageReader?.close()
    }

    // 省略...

    private suspend fun initCamera2Api() {
        // TODO これから
    }

    companion object {
        private const val CAMERA_WIDTH = 1280
        private const val CAMERA_HEIGHT = 720
    }
}
```

今回は`Camera2API`をそのまま使います、`CameraX`は使ったことが無くて、、  
`Camera2API`のお作法的なコードが続きます。カメラ映像は`Kotlin Coroutines`の`Channel`を使って`WebGPU`の描画処理である`render()`関数へ渡そうと思うので、ここでは受け取って`trySend()`しています。

`ImageReader`ですが、今回は`YUV_420_888`を使っています。  
`Camera2API`を使ったことがあればこれは難しい選択をしたと思うでしょう。だって`YUV`から`Bitmap`、つまり`RGB`の配列にするのはけっこー面倒くさい。

`JPEG`の方が楽です。何も考えずに`ImageReader`から出てきたバイト配列がすでに`JPEG`なので、`Bitmap`にして`WebGPU`のテクスチャにすれば、フラグメントシェーダーで利用可能なのですから。  
なのですが、`JPEG`はとにかく遅いです。全然速度が出ません。なので難しい`YUV`の方を使っています。こちらは難しい代わりに**結構速度**が出ています。

まあそもそもの話、`OpenGL ES`では`SurfaceTexture`クラスを使うことで、`カメラ映像`や`動画の映像`を`OpenGL ES`のテクスチャとして使うことが出来ます。  
`Vulkan`にも`HardwareBuffer`クラスがあり、`ImageReader`から出てきた`Image`の`HardwareBuffer`をそのまま、`Vulkan`のテクスチャとして使えるそうです。  
`Android`の`WebGPU`移植版にはこれに相当するクラスが存在しないっぽいです。なので速度が出る`YUV`をいい感じに`RGB`に変換して使うことにします。

```kotlin
@SuppressLint("MissingPermission") // 権限チェックするべきです
private suspend fun initCamera2Api() {
    // 出力先の ImageReader、カメラ映像は Channel で別の関数へおくる
    imageReader = ImageReader.newInstance(CAMERA_WIDTH, CAMERA_HEIGHT, ImageFormat.YUV_420_888, 2)
    imageReader?.setOnImageAvailableListener(
        { imageReader ->
            latestImageChannel.trySend(element = imageReader?.acquireLatestImage() ?: return@setOnImageAvailableListener)
        },
        null
    )

    // Camera2API
    val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    val (frontCameraId, _) = cameraManager
        .cameraIdList
        .map { cameraId -> cameraId to cameraManager.getCameraCharacteristics(cameraId) }
        .firstOrNull { (_, characteristic) -> characteristic.get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_BACK } ?: return

    cameraDevice = suspendCancellableCoroutine { cont ->
        cameraManager.openCamera(frontCameraId, object : CameraDevice.StateCallback() {
            override fun onOpened(device: CameraDevice) {
                cont.resume(device)
            }

            override fun onDisconnected(device: CameraDevice) {
                cont.resume(null)
            }

            override fun onError(device: CameraDevice, error: Int) {
                cont.resume(null)
            }
        }, null)
    }

    cameraDevice ?: return
    val captureRequest = cameraDevice!!.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW).apply {
        addTarget(imageReader!!.surface)
    }
    val captureSession = suspendCancellableCoroutine { continuation ->
        // OutputConfiguration を作る
        val outputConfigurationList = listOf(OutputConfiguration(imageReader!!.surface))
        val sessionConfiguration = SessionConfiguration(SessionConfiguration.SESSION_REGULAR, outputConfigurationList, cameraExecutor, object : CameraCaptureSession.StateCallback() {
            override fun onConfigured(captureSession: CameraCaptureSession) {
                continuation.resume(captureSession)
            }

            override fun onConfigureFailed(p0: CameraCaptureSession) {
                continuation.resume(null)
            }
        })
        cameraDevice!!.createCaptureSession(sessionConfiguration)
    }

    captureSession ?: return
    captureSession.setRepeatingRequest(captureRequest.build(), null, null)
}
```

## 万華鏡の頂点の配列
さっきの入門では`バーテックスシェーダー`内に`三角形の頂点の座標`を書いていましたが、本当は`CPU`側から送ってあげるのが良いはずです。  
先述の通り、三角形が組み合わさってできているので、いい感じに三角形を並べていけばよさそうですね！

とりあえず六個の三角形を描画しようと思います。全然`万華鏡`って感じはしないと思いますが。とにかく動くところまで！

```kotlin
companion object {
    private const val CAMERA_WIDTH = 1280
    private const val CAMERA_HEIGHT = 720

    private val VERTEX_ARRAY = floatArrayOf(
        // 下 真ん中
        0.0f, 0.0f,
        -0.5f, -1.0f,
        0.5f, -1.0f,

        // 下 右
        0.0f, 0.0f,
        0.5f, -1.0f,
        1.0f, 0.0f,

        // 下 左
        0.0f, 0.0f,
        -1.0f, 0.0f,
        -0.5f, -1.0f,

        // 上 真ん中
        0.0f, 0.0f,
        -0.5f, 1.0f,
        0.5f, 1.0f,

        // 上 右
        0.0f, 0.0f,
        0.5f, 1.0f,
        1.0f, 0.0f,

        // 上 左
        0.0f, 0.0f,
        -0.5f, 1.0f,
        -1.0f, 0.0f,
    )
}
```

## 頂点をGPUへ渡す
`vertexBuffer`を`lateinit var`に追加します。

```kotlin
private lateinit var webGpu: WebGpu
private lateinit var renderPipeline: GPURenderPipeline
private lateinit var vertexBuffer: GPUBuffer // これ
```

次に`initPipeline()`関数で、`createRenderPipeline()`を呼び出している箇所より前で、`頂点バッファー`を作ります。  
作ってもうすぐに`writeBuffer`で送ってしまいましょう。

```kotlin
// 頂点
vertexBuffer = device.createBuffer(
    descriptor = GPUBufferDescriptor(
        size = (VERTEX_ARRAY.size * Float.SIZE_BYTES).toLong(),
        usage = BufferUsage.Vertex or BufferUsage.CopyDst
    )
)
device.queue.writeBuffer(vertexBuffer, 0, VERTEX_ARRAY.toByteBuffer())

// Create Render Pipeline
// 以下省略...
```

次にすぐ下の`createRenderPipeline()`を書き足します。`GPUVertexState()`の`buffers`の部分ですね。  
`arrayStride`ですが、後述しますが構造体が登場するのですが、今回はこの構造体に`X,Y`という感じで`vec2f`しか使ってないんですね。つーわけで`Float`が二つ。  
つぎの`shaderLocation`も構造体のところで出るのですが、今回はこの構造体に先述の`x,y`しか入れないため`location`は`0`になります。

```kotlin
renderPipeline = device.createRenderPipeline(
    descriptor = GPURenderPipelineDescriptor(
        vertex = GPUVertexState(
            shaderModule,
            // 頂点を
            buffers = arrayOf(
                GPUVertexBufferLayout(
                    arrayStride = (2 * Float.SIZE_BYTES).toLong(), // 頂点(x,y)しか渡してないため 2 * FloatSize
                    attributes = arrayOf(
                        // 今回は vertex の構造体に vec2f で足りる x,y しか入れていないため
                        GPUVertexAttribute(
                            shaderLocation = 0,
                            offset = 0,
                            format = VertexFormat.Float32x2
                        )
                    )
                )
            )
        ),
        fragment = GPUFragmentState(
            shaderModule,
            targets = arrayOf(GPUColorTargetState(TextureFormat.RGBA8Unorm))
        ),
        primitive = GPUPrimitiveState(PrimitiveTopology.TriangleList),
    )
)
```

最後、`render()`でも`setVertexBuffer()`を呼ぶ必要と、`draw()`の頂点の数がずれているので直しましょう！

```kotlin
// 4. Draw
renderPass.setPipeline(renderPipeline)
renderPass.setVertexBuffer(0, vertexBuffer)
renderPass.setBindGroup(0, bindGroup) // @group(0) なので 0
renderPass.draw(VERTEX_ARRAY.size / 2) // 三角形の頂点の数、x,y,x,y... の並びをした Float 配列なので、サイズを取って半分にすればよい
renderPass.end()
```

## シェーダーを直す
全部貼ります、どーん

`頂点`を渡すために`struct Vertex { }`構造体を作りました。もしかしたら引数に直接`@location(0) ..`と書いてもよかったかもしれません。  
`shaderLocation`で指定した通り`0`番目に`x,y`が入ってくるようになります。

`vs_main`ではこの構造体を受け取るようにします。すると、`draw()`の呼び出し回数を数えてくれていた`@builtin(vertex_index) vertexIndex : u32`が消えます。  
その代わりに`Kotlin`で書いてた`VERTEX_ARRAY`から対応する回数の座標の`x,y`を直接貰えるようになります。

```wgsl
        val shaderCode = """
    // Uniforms 構造体
    struct Uniforms {
        matrix: mat4x4<f32>,
    }
    
    // CPU から頂点を受け取る
    struct Vertex {
        @location(0) position: vec2f,
    }
        
    // CPU から受け取る
    @group(0) @binding(0) var<uniform> transformMatrix: Uniforms;
        
    @vertex fn vs_main(vertex: Vertex) -> @builtin(position) vec4f {
        let transformedVec = vec4f(vertex.position, 0, 1) * transformMatrix.matrix; // 変換行列を適用
        return transformedVec;
    }
    
    @fragment fn fs_main() -> @location(0) vec4f {
        return vec4f(1, 0, 0, 1);
    }
"""
```

## 六角形が映っている！
できたぜ！次はカメラですね

![webgpu_万華鏡_図形のみ](https://oekakityou.negitoro.dev/resize/513ce127-db49-40b3-8443-12b70cd5a36a.png)

## カメラ映像の話

### YUV の話
`Camera2API`でもらった映像データは`ImageReader`によって`YUV`とか言うのになります。  
これは`RGB`ではありません。`プレーン`というのはまあその色が入っているバイト配列です。

`Yプレーン`と`Uプレーン`と`Vプレーン`で色が分かれていて、それぞれ画像としても表示できます。  
`Yプレーン`が雑に言うとモノクロ画像で、それに色を付けるのが`Uプレーン`と`Yプレーン`になります。

ただ、これに加えて`クロマサンプリング`と呼ばれる技術を使い人間にバレないように情報を減らす技術が使われています。  
詳しくはこの後話しますが、`Yプレーン`のモノクロ画像の大きさと、`Uプレーン`と`Vプレーン`の画像の大きさは異なることがあります（データ量を減らすが画質は維持できてる）。**というか今回は異なります。**

なので、ざっくり`Yプレーン`と`Uプレーン`と`Vプレーン`を使って`YUVからRGB`に変換する式を適用すると、`RGB`になるハズです。  
難しいように思えますが、`フラグメントシェーダー`を使って描画するとそこまで難しく無いです。  
（というか、`GPU`だと座標が`0~1`に正規化さ、むしろ`CPU`で座標を計算するよりも簡単かもしれません！！）  
（また、ベクトル同士の掛け算が`シェーダー`だと文字通り出来るのも簡単にできる要因かもしれません）

### YUV の 444 とか 420 とかの話
`クロマサンプリング`の話を、今回これがあるから避けて通れない。  
`YUV`の中でも種類があり`4:4:4`とか`4:2:0`とかあります。

もしかしたら`Yプレーン`と比べて、`Uプレーン`と`Vプレーン`はバイト配列が半分（半分の画像サイズ）になっているという噂を聞いたかもしれません。

これは、`Yプレーン`（モノクロ画像）は`1ピクセル`ごとに色を保存します。  
一方、`Uプレーン`と`Vプレーン`の色は`1ピクセル`ごとに保存しなくても人間は鈍感だから分からないのでは？？？  
`2ピクセル`の分を同じ色にすれば、`Yプレーン`の半分のデータ容量で済むし人間にはバレないというわけです。

例えば、横`4ピクセル`縦`2ピクセル`の例を出します。

`YUV 444`の場合は`1ピクセル`ごとに`Y,U,V`保存するのでこうなりますね。

```plaintext
 Y              U               V
+-------------+ +-------------+ +-------------+
| Y1 Y2 Y3 Y4 | | U1 U2 U3 U4 | | V1 V2 V3 V4 |
| Y5 Y6 Y7 Y8 | | U5 U6 U7 U8 | | V5 V6 V7 V8 |
+-------------+ +-------------+ +-------------+
```

`YUV 422`の場合はこうです。横`2ピクセル`分が同じ色になっています。

```plaintext
 Y              U               V
+-------------+ +-------------+ +-------------+
| Y1 Y2 Y3 Y4 | | U1 U1 U2 U2 | | V1 V1 V2 V2 |
| Y5 Y6 Y7 Y8 | | U3 U3 U4 U4 | | V3 V3 V4 V4 |
+-------------+ +-------------+ +-------------+
```

`YUV 420`の場合はこうです。横`2ピクセル`と縦`2ピクセル`分が同じ色になっています。

```plaintext
 Y              U               V
+-------------+ +-------------+ +-------------+
| Y1 Y2 Y3 Y4 | | U1 U1 U2 U2 | | V1 V1 V2 V2 |
| Y5 Y6 Y7 Y8 | | U1 U1 U2 U2 | | V1 V1 V2 V2 |
+-------------+ +-------------+ +-------------+
```

### インターリーブの話
最後にこれ、`Android`の場合は`インターリーブ`されています。  
`ImageReader`クラスから`YUV`が得られるわけです。`YUV 420`なので`Yプレーン`と比べて、`Uプレーン`と`Vプレーン`は`4分の1`になります。

`インターリーブ`、今回の文脈での使い道の説明だと、`Yプレーン`と同じバイト配列のサイズを作って、`Uプレーン`と`Vプレーン`のデータを交互に入れることを指しています。  
`Uプレーン`と`Yプレーン`を足すと`Yプレーン`のサイズと同じになりますね！。  
ハードウェア由来？？の理由らしいですが、`Uプレーン`と`Vプレーン`で別々のバイト配列を確保するよりも良いらしいです。

```plaintext
Yプレーン = [Y1,Y2,Y3,Y4 ...]
Uプレーン = [U1,V1,U2,V2 ...]
Vプレーン = [V1,U2,V2    ...]
```

インターリーブされているため、`ImageReader`から出てきた`YUV`の`Uプレーン`も`Vプレーン`も、`AndroidOS`的には同じバイト配列の参照のはずです。  
ただ、`Uプレーン`の場合は最初に`Uプレーン`のデータから配列が始まるようになっています。同様に`Vプレーン`も。

### YUV だのクロマサンプリングだの意味わかんなすぎ
**わかる**。まだ`Android`版`WebGPU`は時期尚早。

`OpenGL ES`の場合は`カメラ`や`動画`の映像を`OpenGL ES`のテクスチャとして使える`SurfaceTexture`クラスが存在します。  
もう本当に`カメラ`や`動画プレイヤー`の出力先として使って、あとは`OpenGL ES`のテクスチャの`uniform`に設定して、、、、みたいな感じ。`YUV`とかは出てこない。  
全部`GPU`がやってくれて`OpenGL ES`に映像を転送してくれる。

`Vulkan`にも同様の機能がある。

`Android`に移植された`WebGPU`にも同様の効率よく映像をやり取りする仕組みができるまで、手を出さなくてもいいかもね。

## インターリーブされたデータを元に戻す
つまり我々の課題は二つ、`YUV`なので`RGB`にする`シェーダー`を書くのと、前提として`インターリーブ`されているので`YUV`に分離するための処理を書かないといけませんね。

まずは`インターリーブ`されたプレーンの場合は元に戻す`拡張関数`を書きました。  
`Image.Plane`の`pixelStride`が`1`以外の場合はインターリーブされており、`pixelStride`分`index`をインクリメントすると次のデータが得られるという形になります。

```kotlin
private fun Image.Plane.fixIfInterleaveRePutPlane(yPlaneWidth: Int, yPlaneHeight: Int): ByteBuffer {
    // U/V プレーンは Y プレーンの半分のサイズ
    val uvPlaneWidth = yPlaneWidth / 2
    val uvPlaneHeight = yPlaneHeight / 2

    val result = ByteBuffer.allocateDirect(uvPlaneWidth * uvPlaneHeight)

    // pixelStride が
    // 1 の場合は、[ Y1,Y2,Y3,Y4 ] のように、バイト配列に連続してデータが入っている
    // 2 とかの場合、U/V プレーンを別々に取得しても、[ U1,V1,U2,V2 ] のように、一つのバイト配列に二種類のデータが交互に入っている（インターリーブ）
    // 後者の場合はそのままでは WebGPU/OpenGLES のテクスチャとして使うことができないため、それぞれ切り離す必要がある
    // ---
    // また、後者の場合、実際には U/V 両方のデータが入っているため U/V プレーンは Y プレーンの半分。ですらない。
    // それぞれのプレーンにすれば半分のサイズで収まります。
    if (pixelStride == 1) {
        buffer.put(result)
        return result
    }

    // 例として [ U1, V1, U2 V2 Padding, U3, V3, U4, V4 ] の場合
    // pixelStride が 2 になる。次の同じデータが 2 バイト先にあることを表している
    // 二種類のデータとは別に、Padding が含まれていて、Padding 込みの横一列は rowStride で取得可能。基本的に Padding で次の横一列になるハズ
    repeat(uvPlaneHeight) { y ->
        // この行の先頭位置を rowStride から計算
        val rowStartIdx = y * rowStride
        // 2つ先を読む（1byte 飛ばして 1byte 読む）
        for (x in 0 until uvPlaneWidth) {
            val readPosition = rowStartIdx + (x * pixelStride)
            // 一応
            if (readPosition < buffer.capacity()) {
                result.put(buffer[readPosition])
            }
        }
    }
    return result
}
```

## GPU へ YUV を送る準備
`コンピューターグラフィックス`の世界では`GPU`で描画する`画像`のことを`テクスチャ`と呼ぶらしいです。  
`YUV`もそれぞれのプレーンは画像として表すため、`テクスチャ`として`GPU`へ送ります。

というわけで`WebGPU`にテクスチャを登録しましょう。`クラスの変数`にテクスチャと`sampler`を宣言します。  
`sampler`は`OpenGL ES`だと省略できた？ので目新しいかも。

```kotlin
class MangekyouWebGpuRenderer(private val context: Context) {
    // 省略

    // WebGPU テクスチャ
    private lateinit var sampler: GPUSampler
    private lateinit var textureYuvY: GPUTexture
    private lateinit var textureYuvU: GPUTexture
    private lateinit var textureYuvV: GPUTexture

    // 省略
```

次に`initPipeline()`で`bindGroup`を作る前で`テクスチャ`を作ります。  
`OpenGL ES`の時の`glなんとかかんとか()`と比べると本当に分かりやすい！！！１！

ところで今回、`Bitmap`のような`RGB`のバイト配列を渡すわけではなく、`YUV`はそれぞれの画像を見ると単色しか使ってないんですよね。  
なので`format`は`r`だけを使うものにしました。`rgb`の画像であれば`r`だけじゃもちろんダメです！

作れたら`GPUBindGroupDescriptor()`で登録しましょう。`binding`の数字は後で`シェーダー`を書くときに使うので覚えておいてください！  
（覚えなくてもカンニングしてよいのでいいです）

```kotlin
private fun initPipeline(device: GPUDevice) {
    // 省略...

    // テクスチャ。よく考えると YUV それぞれは単色である、なので RGB も確保せずとも R だけで足りる
    // U/V プレーンは半分
    val textureUvWidth = CAMERA_WIDTH / 2
    val textureUvHeight = CAMERA_HEIGHT / 2
    sampler = webGpu.device.createSampler()
    textureYuvY = webGpu.device.createTexture(
        descriptor = GPUTextureDescriptor(
            usage = TextureUsage.TextureBinding or TextureUsage.CopyDst,
            size = GPUExtent3D(CAMERA_WIDTH, CAMERA_HEIGHT),
            format = TextureFormat.R8Unorm
        )
    )
    textureYuvU = webGpu.device.createTexture(
        descriptor = GPUTextureDescriptor(
            usage = TextureUsage.TextureBinding or TextureUsage.CopyDst,
            size = GPUExtent3D(textureUvWidth, textureUvHeight),
            format = TextureFormat.R8Unorm
        )
    )
    textureYuvV = webGpu.device.createTexture(
        descriptor = GPUTextureDescriptor(
            usage = TextureUsage.TextureBinding or TextureUsage.CopyDst,
            size = GPUExtent3D(textureUvWidth, textureUvHeight),
            format = TextureFormat.R8Unorm
        )
    )

    bindGroup = webGpu.device.createBindGroup(
        descriptor = GPUBindGroupDescriptor(
            layout = renderPipeline.getBindGroupLayout(0),
            entries = arrayOf(
                // 変換行列
                GPUBindGroupEntry(binding = 0, buffer = transformMatrixUniformBuffer),
                // テクスチャ
                GPUBindGroupEntry(binding = 1, sampler = sampler),
                GPUBindGroupEntry(binding = 2, textureView = textureYuvY.createView()),
                GPUBindGroupEntry(binding = 3, textureView = textureYuvU.createView()),
                GPUBindGroupEntry(binding = 4, textureView = textureYuvV.createView())
            )
        )
    )
}
```

## フラグメントシェーダーで YUV を RGB にする
https://ja.wikipedia.org/wiki/YUV#動画フォーマット

まずは`Wiki`にある`YUV`を`RGB`にする公式を見てください。**分かんないですよね！**  
なんかよく分からない`デカい波かっこ`がある、が、先述の通りよく分からくても`この手のフラグメントシェーダー`は息を吸うのと同じように`ベクトル同士`の掛け算ができるので問題ないです。

この中で使うのは`BT.709`です（`Rec.709`）。`HDR`ではない`カメラ映像`の場合は十中八九`BT.709`です（`SDR`ですね）。  
`BT.709`というのは`色空間`と呼ばれ、使える色の範囲の事です。`HDR`動画だと`BT.2020`が使われより鮮やかで眩しいですが、これは`BT.709`よりも使える色が多いからですね。

`色空間`とか`ガンマカーブ`とかは`Android で HDR 動画を扱う記事`で触れたのでそっちで・・・  
https://takusan.negitoro.dev/posts/android_hdr_camera_video_editor/

シェーダーでやることは、`テクスチャ`を受け取る、`テクスチャ`を描画できるように`バーテックスシェーダー`から`テクスチャ座標？`を返す、`YUV`から`RGB`の変換式を`フラグメントシェーダー`で書く。

まず簡単なのは`@group(0) @binding(2) var textureYuvY: texture_2d<f32>;`ですかね。  
`YUV`で三つ分の`テクスチャ`と（`binding`の番号気を付けて！）、`sampler`を受け取ります。

次に`バーテックスシェーダー`から構造体を返せるようにします。  
`@builtin(position) position: vec4f`に加えて、テクスチャ座標に変換したもの返します。  
`WebGPU`は縦横が`-1 から 1`の範囲に正規化されると言いましたが、これとは別に`テクスチャ座標`というのがあって、これは`0 から 1`になります。

複数の値を返すために`struct VertexOutput { }`構造体を作りました。`vs_main()`の返り値を`-> VertexOutput`に直して、`return`で構造体を返すようにします。  
また、`fs_main()`の引数を`output: vertexOutput`にして`バーテックスシェーダー`の結果を受け取れるようにします。

最後の`RGB`変換は、`Wiki`の通りです。  
`mat3x3`はよくわかりません。このよく分からない数字の塊と`vec3f(Y,U,V)`のベクトルを掛け算すると`RGB`になるらしいです。

```wgsl
    private fun initPipeline(device: GPUDevice) {
        val shaderCode = """
    // Uniforms 構造体
    struct Uniforms {
        matrix: mat4x4<f32>,
    }
    
    // CPU から頂点を受け取る
    struct Vertex {
        @location(0) position: vec2f,
    }
    
    // フラグメントシェーダーへ渡す
    struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) uv : vec2f,
    }
        
    // CPU から受け取る
    @group(0) @binding(0) var<uniform> transformMatrix: Uniforms;
    @group(0) @binding(1) var smp: sampler;
    @group(0) @binding(2) var textureYuvY: texture_2d<f32>;
    @group(0) @binding(3) var textureYuvU: texture_2d<f32>;
    @group(0) @binding(4) var textureYuvV: texture_2d<f32>;
        
    @vertex fn vs_main(vertex: Vertex) -> VertexOutput {
        let transformedVec = vec4f(vertex.position, 0, 1) * transformMatrix.matrix; // 変換行列を適用
        var output: VertexOutput;
        output.position = transformedVec;
        output.uv = transformedVec.xy *  0.5 + 0.5; // テクスチャ座標に変換する
        return output;
    }
    
    @fragment fn fs_main(output: VertexOutput) -> @location(0) vec4f {

        // 位置に対応する YUV とりだし
        // 以下、R, G, B, Yの値域は[0, 1]。Cb, Crの値域は[-0.5, 0.5]
        let y = (textureSample(textureYuvY, smp, output.uv).r * (255.0 / 235.0) - (16.0 / 235.0));
        let u = (textureSample(textureYuvU, smp, output.uv).r - 0.5);
        let v = (textureSample(textureYuvV, smp, output.uv).r - 0.5);
    
        // YUV から BT.709 RGB の変換式は Wiki
        // https://ja.wikipedia.org/wiki/YUV#RGBからの変換
        let yuvToRgbBt709 = mat3x3<f32>(
            vec3f(1.0, 1.0, 1.0),
            vec3f(0.0, -0.187324, 1.8556),
            vec3f(1.5748, -0.468124, 0.0)
        );
    
        let rgb = yuvToRgbBt709 * vec3f(y, u, v);
        return vec4<f32>(rgb, 1.0);
    }
"""

    // 以下省略...
```

### Wiki じゃない方法
違う方法

- https://github.com/wenxiaoming/YUVRender
- https://hk.interaction-lab.org/firewire/yuv.html
- https://licheng.sakura.ne.jp/hatena6/rgbyc.html

`Wiki`に書いてある数字の塊は`R, G, B, Yの値域は[0, 1]。Cb, Crの値域は[-0.5, 0.5]`の前提のコードです。  
一方、先に`YUV テクスチャ`の色を`0~1`にせずに調整した後に`RGB`の変換式に入れる方法もあります。`16.0 / 255.0`のところとかですね。

```wgsl
@fragment fn fs_main(output: VertexOutput) -> @location(0) vec4f {

    let yuvToRgbBt709 = mat3x3<f32>(
        vec3<f32>(1.164, 1.164, 1.164),
        vec3<f32>(0.0, -0.213, 2.112),
        vec3<f32>(1.793, -0.533, 0.0)
    );

    let y = (textureSample(textureYuvY, smp, output.uv).r - (16.0 / 255.0));
    let u = (textureSample(textureYuvU, smp, output.uv).r - (128.0 / 255.0));
    let v = (textureSample(textureYuvV, smp, output.uv).r - (128.0 / 255.0));

    let rgb = yuvToRgbBt709 * vec3<f32>(y, u, v);
    return vec4<f32>(rgb, 1.0);
}
```

## 画面に描画する処理
最後に`ImageReader`から貰う`YUV`を`GPU`に転送し、あとは`WebGPU`で描画します。  
`Kotlin Coroutines`で`ImageReader`のコールバックで貰える`Image`を`Channel`を使って、この関数で受け取ります。

`YUV`はさっき作った`拡張関数`でインターリーブを戻して、`GPU`に渡します！。`OpenGL ES`の時はべらぼうに引数が多かった気がするのでめっちゃ人間よりだな～って。

`render()`関数を書き換えます！

```kotlin
suspend fun render() {
    if (!::webGpu.isInitialized) {
        return
    }

    val gpu = webGpu


    // YUV を受け取って GPU に転送する処理
    val image = latestImageChannel.receive()
    val yuvY = image.planes[0].buffer
    val yuvU = image.planes[1].fixIfInterleaveRePutPlane(CAMERA_WIDTH, CAMERA_HEIGHT)
    val yuvV = image.planes[2].fixIfInterleaveRePutPlane(CAMERA_WIDTH, CAMERA_HEIGHT)
    image.close()
    // YUV を GPU に送信
    val yuvUvWidth = CAMERA_WIDTH / 2
    val yuvUvHeight = CAMERA_HEIGHT / 2
    webGpu.device.queue.writeTexture(
        destination = GPUTexelCopyTextureInfo(textureYuvY),
        data = yuvY,
        writeSize = GPUExtent3D(CAMERA_WIDTH, CAMERA_HEIGHT),
        dataLayout = GPUTexelCopyBufferLayout(bytesPerRow = CAMERA_WIDTH) // 1ピクセル1バイトしか使ってない (TextureFormat.R8Unorm)
    )
    webGpu.device.queue.writeTexture(
        destination = GPUTexelCopyTextureInfo(textureYuvU),
        data = yuvU,
        writeSize = GPUExtent3D(yuvUvWidth, yuvUvHeight),
        dataLayout = GPUTexelCopyBufferLayout(bytesPerRow = yuvUvWidth)
    )
    webGpu.device.queue.writeTexture(
        destination = GPUTexelCopyTextureInfo(textureYuvV),
        data = yuvV,
        writeSize = GPUExtent3D(yuvUvWidth, yuvUvHeight),
        dataLayout = GPUTexelCopyBufferLayout(bytesPerRow = yuvUvWidth)
    )


    // 変換行列を用意
    // 三角形が歪まないようにする
    val transformMatrix = FloatArray(16)

    // 以下省略...
```

## カメラ映像が表示されたけど違う！！！
でもなんか違う！！！**全然万華鏡**じゃない、しかもなんか回転している。

![webgpu_万華鏡_六角形にカメラ映像が描画される](https://oekakityou.negitoro.dev/resize/230b0efe-6e14-4a84-b6e2-89fcdfc5d5fb.png)

## テクスチャ座標を操作する変換行列
三角形はこのままでよいでしょう。問題はそれぞれの三角形で描画している画像が問題です。

**それぞれの三角形で描画されていない問題**と、**それぞれの三角形で描画する際に回転されていてほしい問題**、**カメラ映像がなんか回転、反転している問題**。  

## カメラが回転、反転している
そもそもなんで回転されているのかはわかりません。`Camera2 API`のせい？？？？

反転しているのは多分`WebGPU`の`テクスチャ座標`の仕様です。テクスチャ座標は`-1から1`ではなく！`0から1`になります。  
そして反転しているため`WebGPU`の`テクスチャ座標`は上方向に`0`に近づく仕様です。左上が`X=0,Y=0`になり、右下が`X=1,Y=1`になります。

![webgpu_テクスチャ座標は上下反転](https://oekakityou.negitoro.dev/resize/0775a8cd-bc4b-485b-9b9c-da171bc824b0.png)

話を戻して、`テクスチャ座標`に適用する`変換行列`を用意すればよい気がします！  
`Unfirom構造体`にテクスチャ用の`変換行列`を追加して受け取れるようにします。

まずは`Uniforms`構造体に`textureMatrix: mat4x4<f32>,`を追加しました。  
また、`output.uv`に入れる前に`let uv = transformedVec * transformMatrix.textureMatrix;`で計算をし、テクスチャ用の変換行列を適用します。  
`三角形`の位置はそのまま、`テクスチャ（フラグメントシェーダー）`にのみ回転とか反転が適用されます！

```wgsl
    private fun initPipeline(device: GPUDevice) {
        val shaderCode = """
    // Uniforms 構造体
    struct Uniforms {
        matrix: mat4x4<f32>,
        textureMatrix: mat4x4<f32>,
    }
    
    // CPU から頂点を受け取る
    struct Vertex {
        @location(0) position: vec2f,
    }
    
    // フラグメントシェーダーへ渡す
    struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) uv : vec2f,
    }
        
    // CPU から受け取る
    @group(0) @binding(0) var<uniform> transformMatrix: Uniforms;
    @group(0) @binding(1) var smp: sampler;
    @group(0) @binding(2) var textureYuvY: texture_2d<f32>;
    @group(0) @binding(3) var textureYuvU: texture_2d<f32>;
    @group(0) @binding(4) var textureYuvV: texture_2d<f32>;
        
    @vertex fn vs_main(vertex: Vertex) -> VertexOutput {
        let transformedVec = vec4f(vertex.position, 0, 1) * transformMatrix.matrix; // 変換行列を適用
        let uv = transformedVec * transformMatrix.textureMatrix;
        var output: VertexOutput;
        output.position = transformedVec;
        output.uv = uv.xy * 0.5 + 0.5; // テクスチャ座標に変換する
        return output;
    }
    
    @fragment fn fs_main(output: VertexOutput) -> @location(0) vec4f {

        // 位置に対応する YUV とりだし
        // 以下、Yの値域は[0, 1]。Cb, Crの値域は[-0.5, 0.5]
        let y = (textureSample(textureYuvY, smp, output.uv).r * (255.0 / 235.0) - (16.0 / 235.0));
        let u = (textureSample(textureYuvU, smp, output.uv).r - 0.5);
        let v = (textureSample(textureYuvV, smp, output.uv).r - 0.5);
    
        // YUV から BT.709 RGB の変換式は Wiki
        // https://ja.wikipedia.org/wiki/YUV#RGBからの変換
        let yuvToRgbBt709 = mat3x3<f32>(
            vec3f(1.0, 1.0, 1.0),
            vec3f(0.0, -0.187324, 1.8556),
            vec3f(1.5748, -0.468124, 0.0)
        );
    
        let rgb = yuvToRgbBt709 * vec3f(y, u, v);
        return vec4<f32>(rgb, 1.0);
    }
"""
```

次に`Uniform`の`バッファー`を作っているコードまで移動して、構造体の中身が増えたためサイズを修正します。  
今回はもう一つ`mat4x4<f32>`が追加されたので`64`を2倍すればよいですね！

```kotlin
// CPU から値を渡す準備
transformMatrixUniformBuffer = device.createBuffer(
    GPUBufferDescriptor(
        size = 64 * 2, // mat4x4<f32> が2つあるので
        usage = BufferUsage.Uniform or BufferUsage.CopyDst
    )
)
```

最後に`render()`関数の`変換行列`を作っている箇所まで移動し、新たに`テクスチャ座標に適用する変換行列`を作り、`writeBuffer()`します。  
`struct`に2つ`mat4x4`があり、これをどうやって`CPU`から渡せばいいのかと言うと単にバイト配列を連結するだけです。  
`Kotlin`には`演算子オーバーロード`があり`FloatArray + FloatArray`が出来るので、つなげて`Java`の`ByteBuffer`にするだけ！楽！

```kotlin
// 変換行列を用意
// 三角形が歪まないようにする
val transformMatrix = FloatArray(16)
Matrix.setIdentityM(transformMatrix, 0)
// WebGPU 側を正方形にする、SurfaceView は画面いっぱいなので縦長のママだが、見切れる前提で正方形にする。これで三角形が歪まなくなる
if (width < height) {
    val scale = (height / width.toFloat())
    Matrix.scaleM(transformMatrix, 0, scale, 1f, 1f)
} else {
    val scale = (width / height.toFloat())
    Matrix.scaleM(transformMatrix, 0, 1f, scale, 1f)
}
// 小さくする
Matrix.scaleM(transformMatrix, 0, .5f, .5f, .5f)
// テクスチャに適用する変換行列
// カメラが回転している + 反転もしている（多分既に回転されてる状態なので Y 軸に対して反転をする必要が？）
val textureTransformMatrix = FloatArray(16)
Matrix.setIdentityM(textureTransformMatrix, 0)
Matrix.setRotateM(textureTransformMatrix, 0, 270f, 0f, 0f, 1f)
Matrix.scaleM(textureTransformMatrix, 0, 1f, -1f, 1f)
// GPU に転送
// mat4x4<f32> が2つある構造体なので足す
val structFloatArray = transformMatrix + textureTransformMatrix
gpu.device.queue.writeBuffer(transformMatrixUniformBuffer, 0, structFloatArray.toByteBuffer())
```

これでカメラの回転は修正されたと思います！

![webgpu_六角形の形に描画されたカメラが正しい向きに描画される](https://oekakityou.negitoro.dev/resize/0dc43898-bdbb-4aed-98ce-0611cb92873d.png)

## 各三角形の中にそれぞれ回転したカメラ映像を流したい
そもそも一体なぜこうなっているかというと、**三角形の頂点をテクスチャ座標としても使って**いるから。  
以下のように、一つ目の三角形は、`左端X座標 -0.5f`から`右端 X座標 0.5f`なのに対して、二つ目の三角形は`左端 X座標 0.5f`から`右端 X座標 1.0`になっている。  
三角形の位置としては並べたいので正しいが、三角形に**すべて同じテクスチャ**を描画する場合は`X座標`がズレてるといけないですね。

```kotlin
// 下 真ん中
0.0f, 0.0f,
-0.5f, -1.0f,
0.5f, -1.0f,

// 下 右
0.0f, 0.0f,
0.5f, -1.0f,
1.0f, 0.0f,
```

**いやマジで説明が難しいな。**  
画像で説明する、極端に横に二つ並べるとこう。今の段階では頂点の位置をテクスチャ座標として利用しようとしている。  
このせいで、それぞれの三角形で同じ画像が出ず、切り抜いたというか、、なんだろう、**水玉コラみたいな**（？？？）。

![webgpu_三角形の頂点とは別にテクスチャ座標を渡す](https://oekakityou.negitoro.dev/resize/306cf1d8-a3ed-400f-bb1f-c4a0f9762584.png)

なので、多分一般的なのは、三角形の頂点とは別に`テクスチャ座標`を別に渡すのが良いと思います。  
というわけで渡します。見ての通り`三角形の頂点`は三角形を並べるのでそのまま、テクスチャ座標はそれぞれの三角形が同じ画像になるように同じ値を渡しています。先述の通りそれぞれの三角形で同じテクスチャを描画するためです

```kotlin
private val VERTEX_ARRAY = floatArrayOf(
    // それぞれ X座標、Y座標、テクスチャX座標、 テクスチャY座標

    // 下 真ん中
    0.0f, 0.0f, 0.5f, 1.0f,
    -0.5f, -1.0f, 0f, 0f,
    0.5f, -1.0f, 1.0f, 0f,

    // 下 右
    0.0f, 0.0f, 0.5f, 1.0f,
    0.5f, -1.0f, 0f, 0f,
    1.0f, 0.0f, 1.0f, 0f,

    // 下 左
    0.0f, 0.0f, 0.5f, 1.0f,
    -1.0f, 0.0f, 0f, 0f,
    -0.5f, -1.0f, 1.0f, 0f,

    // 上 真ん中
    0.0f, 0.0f, 0.5f, 1.0f,
    -0.5f, 1.0f, 0f, 0f,
    0.5f, 1.0f, 1.0f, 0f,

    // 上 右
    0.0f, 0.0f, 0.5f, 1.0f,
    0.5f, 1.0f, 0f, 0f,
    1.0f, 0.0f, 1.0f, 0f,

    // 上 左
    0.0f, 0.0f, 0.5f, 1.0f,
    -0.5f, 1.0f, 0f, 0f,
    -1.0f, 0.0f, 1.0f, 0f,
)
```

次に、`device.createRenderPipeline()`のコードまで移動して、`バーテックスシェーダー`の引数で`テクスチャ座標`の値を受け取れるようにします。型としては`vec2f`になりますね。`x,y`なので！  
`VERTEX_ARRAY`の`x,y`の後の`2`つが`テクスチャ座標のX/Y`なので、そうするように指示します。

`arrayStride`は、`X,Y`の`vec2f`で`2 * Float.SIZE_BYTES`消費しているので、`vec2f`が増えたらそれに加えて二倍すればよいですね。  
`GPUVertexAttribute`で`テクスチャ座標 vec2f`を新設します。`offset`は頂点の`vec2f`のバイトサイズを飛ばしたら`テクスチャ座標`の`vec2f`が得られますのでそうします。

```kotlin
// Create Render Pipeline
renderPipeline = device.createRenderPipeline(
    descriptor = GPURenderPipelineDescriptor(
        vertex = GPUVertexState(
            shaderModule,
            // 頂点を
            buffers = arrayOf(
                GPUVertexBufferLayout(
                    arrayStride = Float.SIZE_BYTES * 4L, // 頂点(x,y) とテクスチャ座標(x,y) で 2 * 2 * FloatSize
                    attributes = arrayOf(
                        // 三角形の頂点
                        GPUVertexAttribute(
                            shaderLocation = 0,
                            offset = 0,
                            format = VertexFormat.Float32x2
                        ),
                        // テクスチャ座標
                        GPUVertexAttribute(
                            shaderLocation = 1,
                            offset = Float.SIZE_BYTES * 2L,
                            format = VertexFormat.Float32x2
                        )
                    )
                )
            )
        ),
        fragment = GPUFragmentState(
            shaderModule,
            targets = arrayOf(GPUColorTargetState(TextureFormat.RGBA8Unorm))
        ),
        primitive = GPUPrimitiveState(PrimitiveTopology.TriangleList),
    )
)
```

つぎに`シェーダー`を修正します。  
`バーテックスシェーダー`から`三角形の頂点`に加えて`テクスチャ座標`を受け取るようにします。

`テクスチャ座標`を受け取って、先述の`テクスチャ座標`に適用する変換行列を掛け算します。この時`vec2f`と`mat4x4`で直接掛け算できないため、`vec2f`を`vec4f`にしています。  
`vec4f`にした都合上なんか戻さないといけなくなってしまったので`* 0.5 + 0.5`は引き続き・・・

```wgsl
    private fun initPipeline(device: GPUDevice) {
        val shaderCode = """
    // Uniforms 構造体
    struct Uniforms {
        matrix: mat4x4<f32>,
        textureMatrix: mat4x4<f32>,
    }
    
    // CPU から頂点を受け取る
    struct Vertex {
        @location(0) position: vec2f,
        @location(1) uv: vec2f,
    }
    
    // フラグメントシェーダーへ渡す
    struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) uv : vec2f,
    }
        
    // CPU から受け取る
    @group(0) @binding(0) var<uniform> transformMatrix: Uniforms;
    @group(0) @binding(1) var smp: sampler;
    @group(0) @binding(2) var textureYuvY: texture_2d<f32>;
    @group(0) @binding(3) var textureYuvU: texture_2d<f32>;
    @group(0) @binding(4) var textureYuvV: texture_2d<f32>;
        
    @vertex fn vs_main(vertex: Vertex) -> VertexOutput {
        let transformedVec = vec4f(vertex.position, 0, 1) * transformMatrix.matrix; // 変換行列を適用
        let uvVec4 = vec4f(vertex.uv, 0, 1) * transformMatrix.textureMatrix; // mat4x4 の変換行列を適用するために vec4f() にする
        var output: VertexOutput;
        output.position = transformedVec;
        output.uv = uvVec4.xy * 0.5 + 0.5; // vec4f にしてしまったのでテクスチャ座標にもどす
        return output;
    }
    
    @fragment fn fs_main(output: VertexOutput) -> @location(0) vec4f {

        // 位置に対応する YUV とりだし
        // 以下、Yの値域は[0, 1]。Cb, Crの値域は[-0.5, 0.5]
        let y = (textureSample(textureYuvY, smp, output.uv).r * (255.0 / 235.0) - (16.0 / 235.0));
        let u = (textureSample(textureYuvU, smp, output.uv).r - 0.5);
        let v = (textureSample(textureYuvV, smp, output.uv).r - 0.5);
    
        // YUV から BT.709 RGB の変換式は Wiki
        // https://ja.wikipedia.org/wiki/YUV#RGBからの変換
        let yuvToRgbBt709 = mat3x3<f32>(
            vec3f(1.0, 1.0, 1.0),
            vec3f(0.0, -0.187324, 1.8556),
            vec3f(1.5748, -0.468124, 0.0)
        );
    
        let rgb = yuvToRgbBt709 * vec3f(y, u, v);
        return vec4<f32>(rgb, 1.0);
    }
"""
```

最後に`draw()`の部分、`2`で割ることで三角形の頂点の数を出していましたが、頂点の数だけ`x,y,テクスチャx,テクスチャy`のデータがあるため、4で割る必要があります。

```kotlin
renderPass.setPipeline(renderPipeline)
renderPass.setVertexBuffer(0, vertexBuffer)
renderPass.setBindGroup(0, bindGroup) // @group(0) なので 0
renderPass.draw(VERTEX_ARRAY.size / 4) // 頂点の数だけ x,y,テクスチャx,テクスチャy のデータがあるため割り算
renderPass.end()
```

**ついに！できた！！！！！！！！！！**  
**同じテクスチャが描画されていますね！**

![webgpu_万華鏡が出来た、各三角形に映像が描画されている](https://oekakityou.negitoro.dev/resize/1f8928b9-cb45-4d94-a385-fc3152cc5970.png)

# 完成
ちょっと面白いですねこれ（手前味噌）

![WebGPUで万華鏡完成](https://oekakityou.negitoro.dev/resize/1f8928b9-cb45-4d94-a385-fc3152cc5970.png)

`WebGPU`、マジでいいな。エラーが遥かに分かりやすい。

# 全部書いたコード

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidWebGpuMangekyouTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    MangekyouGpuSurfaceView(modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}

@Composable
fun MangekyouGpuSurfaceView(modifier: Modifier = Modifier) {
    val surfaceSize = remember { MutableStateFlow<IntSize?>(null) }
    val surfaceFlow = remember { MutableStateFlow<Surface?>(null) }

    val context = LocalContext.current
    val isPermissionGranted = remember { Channel<Boolean>() }
    val permissionRequester = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { isGranted ->
            isPermissionGranted.trySend(isGranted)
        }
    )

    LaunchedEffect(key1 = Unit) {
        // 権限を要求して待つ
        permissionRequester.launch(android.Manifest.permission.CAMERA)
        if (!isPermissionGranted.receive()) {
            println("権限が付与されませんでした...")
        }

        // サイズと surface が得られること、得られない場合は return している
        combine(
            surfaceSize,
            surfaceFlow,
            ::Pair
        ).collectLatest { (size, surface) ->
            if (size != null && surface != null) {
                val renderer = MangekyouWebGpuRenderer(context)
                try {
                    renderer.init(surface, size.width, size.height)
                    // 繰り返し呼ぶ
                    while (true) {
                        delay(16.milliseconds)
                        renderer.render()
                    }
                } finally {
                    // surface が再生成された、破棄されたとき
                    renderer.cleanup()
                }
            }
        }
    }

    AndroidView(
        modifier = modifier.onSizeChanged { surfaceSize.value = it },
        factory = { context ->
            SurfaceView(context).apply {
                holder.addCallback(object : SurfaceHolder.Callback {
                    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
                        // do nothing
                    }

                    override fun surfaceCreated(holder: SurfaceHolder) {
                        surfaceFlow.value = holder.surface
                    }

                    override fun surfaceDestroyed(holder: SurfaceHolder) {
                        surfaceFlow.value = null
                    }
                })
            }
        }
    )
}
```

```kotlin
class MangekyouWebGpuRenderer(private val context: Context) {
    private lateinit var webGpu: WebGpu
    private lateinit var renderPipeline: GPURenderPipeline
    private lateinit var vertexBuffer: GPUBuffer

    // 変換行列を渡す
    private lateinit var transformMatrixUniformBuffer: GPUBuffer
    private lateinit var bindGroup: GPUBindGroup

    private var width = 0
    private var height = 0

    // カメラの映像を得る
    private val latestImageChannel = Channel<Image>(capacity = Channel.CONFLATED, onUndeliveredElement = { it.close() })
    private var imageReader: ImageReader? = null
    private var cameraDevice: CameraDevice? = null
    private val cameraExecutor = Executors.newSingleThreadExecutor()

    // WebGPU テクスチャ
    private lateinit var sampler: GPUSampler
    private lateinit var textureYuvY: GPUTexture
    private lateinit var textureYuvU: GPUTexture
    private lateinit var textureYuvV: GPUTexture

    suspend fun init(surface: Surface, width: Int, height: Int) {
        this.width = width
        this.height = height

        // 1. Create Instance & Device
        webGpu = createWebGpu(surface)
        val device = webGpu.device

        // 2. Setup Pipeline (compile shaders)
        initPipeline(device)

        // 3. Configure the Surface
        webGpu.webgpuSurface.configure(
            GPUSurfaceConfiguration(
                device,
                width,
                height,
                TextureFormat.RGBA8Unorm,
            )
        )

        // camera2 api init
        initCamera2Api()
    }

    suspend fun render() {
        if (!::webGpu.isInitialized) {
            return
        }

        val gpu = webGpu


        // YUV を受け取って GPU に転送する処理
        val image = latestImageChannel.receive()
        val yuvY = image.planes[0].buffer
        val yuvU = image.planes[1].fixIfInterleaveRePutPlane(CAMERA_WIDTH, CAMERA_HEIGHT)
        val yuvV = image.planes[2].fixIfInterleaveRePutPlane(CAMERA_WIDTH, CAMERA_HEIGHT)
        image.close()
        // YUV を GPU に送信
        val yuvUvWidth = CAMERA_WIDTH / 2
        val yuvUvHeight = CAMERA_HEIGHT / 2
        webGpu.device.queue.writeTexture(
            destination = GPUTexelCopyTextureInfo(textureYuvY),
            data = yuvY,
            writeSize = GPUExtent3D(CAMERA_WIDTH, CAMERA_HEIGHT),
            dataLayout = GPUTexelCopyBufferLayout(bytesPerRow = CAMERA_WIDTH) // 1ピクセル1バイトしか使ってない (TextureFormat.R8Unorm)
        )
        webGpu.device.queue.writeTexture(
            destination = GPUTexelCopyTextureInfo(textureYuvU),
            data = yuvU,
            writeSize = GPUExtent3D(yuvUvWidth, yuvUvHeight),
            dataLayout = GPUTexelCopyBufferLayout(bytesPerRow = yuvUvWidth)
        )
        webGpu.device.queue.writeTexture(
            destination = GPUTexelCopyTextureInfo(textureYuvV),
            data = yuvV,
            writeSize = GPUExtent3D(yuvUvWidth, yuvUvHeight),
            dataLayout = GPUTexelCopyBufferLayout(bytesPerRow = yuvUvWidth)
        )


        // 変換行列を用意
        // 三角形が歪まないようにする
        val transformMatrix = FloatArray(16)
        Matrix.setIdentityM(transformMatrix, 0)
        // WebGPU 側を正方形にする、SurfaceView は画面いっぱいなので縦長のママだが、見切れる前提で正方形にする。これで三角形が歪まなくなる
        if (width < height) {
            val scale = (height / width.toFloat())
            Matrix.scaleM(transformMatrix, 0, scale, 1f, 1f)
        } else {
            val scale = (width / height.toFloat())
            Matrix.scaleM(transformMatrix, 0, 1f, scale, 1f)
        }
        // 小さくする
        Matrix.scaleM(transformMatrix, 0, .5f, .5f, .5f)
        // テクスチャに適用する変換行列
        // カメラが回転している + 反転もしている（多分既に回転されてる状態なので Y 軸に対して反転をする必要が？）
        val textureTransformMatrix = FloatArray(16)
        Matrix.setIdentityM(textureTransformMatrix, 0)
        Matrix.setRotateM(textureTransformMatrix, 0, 270f, 0f, 0f, 1f)
        Matrix.scaleM(textureTransformMatrix, 0, 1f, -1f, 1f)
        // GPU に転送
        // mat4x4<f32> が2つある構造体なので足す
        val structFloatArray = transformMatrix + textureTransformMatrix
        gpu.device.queue.writeBuffer(transformMatrixUniformBuffer, 0, structFloatArray.toByteBuffer())


        // 1. Get the next available texture from the screen
        val surfaceTexture = gpu.webgpuSurface.getCurrentTexture()

        // 2. Create a command encoder
        val commandEncoder = gpu.device.createCommandEncoder()

        // 3. Begin a render pass (clearing the screen to blue)
        val renderPass = commandEncoder.beginRenderPass(
            GPURenderPassDescriptor(
                colorAttachments = arrayOf(
                    GPURenderPassColorAttachment(
                        GPUColor(0.0, 0.0, 0.5, 1.0),
                        surfaceTexture.texture.createView(),
                        loadOp = LoadOp.Clear,
                        storeOp = StoreOp.Store,
                    )
                )
            )
        )

        // 4. Draw
        renderPass.setPipeline(renderPipeline)
        renderPass.setVertexBuffer(0, vertexBuffer)
        renderPass.setBindGroup(0, bindGroup) // @group(0) なので 0
        renderPass.draw(VERTEX_ARRAY.size / 4) // 頂点の数だけ x,y,テクスチャx,テクスチャy のデータがあるため割り算
        renderPass.end()

        // 5. Submit and Present
        gpu.device.queue.submit(arrayOf(commandEncoder.finish()))
        gpu.webgpuSurface.present()
    }

    fun cleanup() {
        if (::webGpu.isInitialized) {
            webGpu.close()
        }
        cameraDevice?.close()
        imageReader?.close()
    }

    private fun FloatArray.toByteBuffer(): ByteBuffer {
        val bufferSize = this.size * Float.SIZE_BYTES
        val byteBuffer = ByteBuffer.allocateDirect(bufferSize)
            .order(ByteOrder.nativeOrder())
            .also { byteBuffer -> byteBuffer.asFloatBuffer().put(this).rewind() }
        return byteBuffer
    }

    private fun initPipeline(device: GPUDevice) {
        val shaderCode = """
    // Uniforms 構造体
    struct Uniforms {
        matrix: mat4x4<f32>,
        textureMatrix: mat4x4<f32>,
    }
    
    // CPU から頂点を受け取る
    struct Vertex {
        @location(0) position: vec2f,
        @location(1) uv: vec2f,
    }
    
    // フラグメントシェーダーへ渡す
    struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) uv : vec2f,
    }
        
    // CPU から受け取る
    @group(0) @binding(0) var<uniform> transformMatrix: Uniforms;
    @group(0) @binding(1) var smp: sampler;
    @group(0) @binding(2) var textureYuvY: texture_2d<f32>;
    @group(0) @binding(3) var textureYuvU: texture_2d<f32>;
    @group(0) @binding(4) var textureYuvV: texture_2d<f32>;
        
    @vertex fn vs_main(vertex: Vertex) -> VertexOutput {
        let transformedVec = vec4f(vertex.position, 0, 1) * transformMatrix.matrix; // 変換行列を適用
        let uvVec4 = vec4f(vertex.uv, 0, 1) * transformMatrix.textureMatrix; // mat4x4 の変換行列を適用するために vec4f() にする
        var output: VertexOutput;
        output.position = transformedVec;
        output.uv = uvVec4.xy * 0.5 + 0.5; // vec4f にしてしまったのでテクスチャ座標にもどす
        return output;
    }
    
    @fragment fn fs_main(output: VertexOutput) -> @location(0) vec4f {

        // 位置に対応する YUV とりだし
        // 以下、Yの値域は[0, 1]。Cb, Crの値域は[-0.5, 0.5]
        let y = (textureSample(textureYuvY, smp, output.uv).r * (255.0 / 235.0) - (16.0 / 235.0));
        let u = (textureSample(textureYuvU, smp, output.uv).r - 0.5);
        let v = (textureSample(textureYuvV, smp, output.uv).r - 0.5);
    
        // YUV から BT.709 RGB の変換式は Wiki
        // https://ja.wikipedia.org/wiki/YUV#RGBからの変換
        let yuvToRgbBt709 = mat3x3<f32>(
            vec3f(1.0, 1.0, 1.0),
            vec3f(0.0, -0.187324, 1.8556),
            vec3f(1.5748, -0.468124, 0.0)
        );
    
        let rgb = yuvToRgbBt709 * vec3f(y, u, v);
        return vec4<f32>(rgb, 1.0);
    }
"""

        // Create Shader Module
        val shaderModule = device.createShaderModule(
            GPUShaderModuleDescriptor(shaderSourceWGSL = GPUShaderSourceWGSL(shaderCode))
        )

        // 頂点
        vertexBuffer = device.createBuffer(
            descriptor = GPUBufferDescriptor(
                size = (VERTEX_ARRAY.size * Float.SIZE_BYTES).toLong(),
                usage = BufferUsage.Vertex or BufferUsage.CopyDst
            )
        )
        device.queue.writeBuffer(vertexBuffer, 0, VERTEX_ARRAY.toByteBuffer())

        // Create Render Pipeline
        renderPipeline = device.createRenderPipeline(
            descriptor = GPURenderPipelineDescriptor(
                vertex = GPUVertexState(
                    shaderModule,
                    // 頂点を
                    buffers = arrayOf(
                        GPUVertexBufferLayout(
                            arrayStride = Float.SIZE_BYTES * 4L, // 頂点(x,y) とテクスチャ座標(x,y) で 2 * 2 * FloatSize
                            attributes = arrayOf(
                                // 三角形の頂点
                                GPUVertexAttribute(
                                    shaderLocation = 0,
                                    offset = 0,
                                    format = VertexFormat.Float32x2
                                ),
                                // テクスチャ座標
                                GPUVertexAttribute(
                                    shaderLocation = 1,
                                    offset = Float.SIZE_BYTES * 2L,
                                    format = VertexFormat.Float32x2
                                )
                            )
                        )
                    )
                ),
                fragment = GPUFragmentState(
                    shaderModule,
                    targets = arrayOf(GPUColorTargetState(TextureFormat.RGBA8Unorm))
                ),
                primitive = GPUPrimitiveState(PrimitiveTopology.TriangleList),
            )
        )

        // CPU から値を渡す準備
        transformMatrixUniformBuffer = device.createBuffer(
            GPUBufferDescriptor(
                size = 64 * 2, // mat4x4<f32> が2つあるので
                usage = BufferUsage.Uniform or BufferUsage.CopyDst
            )
        )

        // テクスチャ。よく考えると YUV それぞれは単色である、なので RGB も確保せずとも R だけで足りる
        // U/V プレーンは半分
        val textureUvWidth = CAMERA_WIDTH / 2
        val textureUvHeight = CAMERA_HEIGHT / 2
        sampler = webGpu.device.createSampler()
        textureYuvY = webGpu.device.createTexture(
            descriptor = GPUTextureDescriptor(
                usage = TextureUsage.TextureBinding or TextureUsage.CopyDst,
                size = GPUExtent3D(CAMERA_WIDTH, CAMERA_HEIGHT),
                format = TextureFormat.R8Unorm
            )
        )
        textureYuvU = webGpu.device.createTexture(
            descriptor = GPUTextureDescriptor(
                usage = TextureUsage.TextureBinding or TextureUsage.CopyDst,
                size = GPUExtent3D(textureUvWidth, textureUvHeight),
                format = TextureFormat.R8Unorm
            )
        )
        textureYuvV = webGpu.device.createTexture(
            descriptor = GPUTextureDescriptor(
                usage = TextureUsage.TextureBinding or TextureUsage.CopyDst,
                size = GPUExtent3D(textureUvWidth, textureUvHeight),
                format = TextureFormat.R8Unorm
            )
        )

        bindGroup = webGpu.device.createBindGroup(
            descriptor = GPUBindGroupDescriptor(
                layout = renderPipeline.getBindGroupLayout(0),
                entries = arrayOf(
                    // 変換行列
                    GPUBindGroupEntry(binding = 0, buffer = transformMatrixUniformBuffer),
                    // テクスチャ
                    GPUBindGroupEntry(binding = 1, sampler = sampler),
                    GPUBindGroupEntry(binding = 2, textureView = textureYuvY.createView()),
                    GPUBindGroupEntry(binding = 3, textureView = textureYuvU.createView()),
                    GPUBindGroupEntry(binding = 4, textureView = textureYuvV.createView()),
                )
            )
        )
    }

    @SuppressLint("MissingPermission") // 権限チェックするべきです
    private suspend fun initCamera2Api() {
        // 出力先の ImageReader、カメラ映像は Channel で別の関数へおくる
        imageReader = ImageReader.newInstance(CAMERA_WIDTH, CAMERA_HEIGHT, ImageFormat.YUV_420_888, 2)
        imageReader?.setOnImageAvailableListener(
            { imageReader ->
                latestImageChannel.trySend(element = imageReader?.acquireLatestImage() ?: return@setOnImageAvailableListener)
            },
            null
        )

        // Camera2API
        val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
        val (frontCameraId, _) = cameraManager
            .cameraIdList
            .map { cameraId -> cameraId to cameraManager.getCameraCharacteristics(cameraId) }
            .firstOrNull { (_, characteristic) -> characteristic.get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_BACK } ?: return

        cameraDevice = suspendCancellableCoroutine { cont ->
            cameraManager.openCamera(frontCameraId, object : CameraDevice.StateCallback() {
                override fun onOpened(device: CameraDevice) {
                    cont.resume(device)
                }

                override fun onDisconnected(device: CameraDevice) {
                    cont.resume(null)
                }

                override fun onError(device: CameraDevice, error: Int) {
                    cont.resume(null)
                }
            }, null)
        }

        cameraDevice ?: return
        val captureRequest = cameraDevice!!.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW).apply {
            addTarget(imageReader!!.surface)
        }
        val captureSession = suspendCancellableCoroutine { continuation ->
            // OutputConfiguration を作る
            val outputConfigurationList = listOf(OutputConfiguration(imageReader!!.surface))
            val sessionConfiguration = SessionConfiguration(SessionConfiguration.SESSION_REGULAR, outputConfigurationList, cameraExecutor, object : CameraCaptureSession.StateCallback() {
                override fun onConfigured(captureSession: CameraCaptureSession) {
                    continuation.resume(captureSession)
                }

                override fun onConfigureFailed(p0: CameraCaptureSession) {
                    continuation.resume(null)
                }
            })
            cameraDevice!!.createCaptureSession(sessionConfiguration)
        }

        captureSession ?: return
        captureSession.setRepeatingRequest(captureRequest.build(), null, null)
    }

    private fun Image.Plane.fixIfInterleaveRePutPlane(yPlaneWidth: Int, yPlaneHeight: Int): ByteBuffer {
        // U/V プレーンは Y プレーンの半分のサイズ
        val uvPlaneWidth = yPlaneWidth / 2
        val uvPlaneHeight = yPlaneHeight / 2

        val result = ByteBuffer.allocateDirect(uvPlaneWidth * uvPlaneHeight)

        // pixelStride が
        // 1 の場合は、[ Y1,Y2,Y3,Y4 ] のように、バイト配列に連続してデータが入っている
        // 2 とかの場合、U/V プレーンを別々に取得しても、[ U1,V1,U2,V2 ] のように、一つのバイト配列に二種類のデータが交互に入っている（インターリーブ）
        // 後者の場合はそのままでは WebGPU/OpenGLES のテクスチャとして使うことができないため、それぞれ切り離す必要がある
        // ---
        // また、後者の場合、実際には U/V 両方のデータが入っているため U/V プレーンは Y プレーンの半分。ですらない。
        // それぞれのプレーンにすれば半分のサイズで収まります。
        if (pixelStride == 1) {
            buffer.put(result)
            return result
        }

        // 例として [ U1, V1, U2 V2 Padding, U3, V3, U4, V4 ] の場合
        // pixelStride が 2 になる。次の同じデータが 2 バイト先にあることを表している
        // 二種類のデータとは別に、Padding が含まれていて、Padding 込みの横一列は rowStride で取得可能。基本的に Padding で次の横一列になるハズ
        repeat(uvPlaneHeight) { y ->
            // この行の先頭位置を rowStride から計算
            val rowStartIdx = y * rowStride
            // 2つ先を読む（1byte 飛ばして 1byte 読む）
            for (x in 0 until uvPlaneWidth) {
                val readPosition = rowStartIdx + (x * pixelStride)
                // 一応
                if (readPosition < buffer.capacity()) {
                    result.put(buffer[readPosition])
                }
            }
        }
        return result
    }


    companion object {
        private const val CAMERA_WIDTH = 1280
        private const val CAMERA_HEIGHT = 720

        private val VERTEX_ARRAY = floatArrayOf(
            // それぞれ X座標、Y座標、テクスチャX座標、 テクスチャY座標

            // 下 真ん中
            0.0f, 0.0f, 0.5f, 1.0f,
            -0.5f, -1.0f, 0f, 0f,
            0.5f, -1.0f, 1.0f, 0f,

            // 下 右
            0.0f, 0.0f, 0.5f, 1.0f,
            0.5f, -1.0f, 0f, 0f,
            1.0f, 0.0f, 1.0f, 0f,

            // 下 左
            0.0f, 0.0f, 0.5f, 1.0f,
            -1.0f, 0.0f, 0f, 0f,
            -0.5f, -1.0f, 1.0f, 0f,

            // 上 真ん中
            0.0f, 0.0f, 0.5f, 1.0f,
            -0.5f, 1.0f, 0f, 0f,
            0.5f, 1.0f, 1.0f, 0f,

            // 上 右
            0.0f, 0.0f, 0.5f, 1.0f,
            0.5f, 1.0f, 0f, 0f,
            1.0f, 0.0f, 1.0f, 0f,

            // 上 左
            0.0f, 0.0f, 0.5f, 1.0f,
            -0.5f, 1.0f, 0f, 0f,
            -1.0f, 0.0f, 1.0f, 0f,
        )
    }
}
```

# 番外編

## 本当に Pixel10 シリーズは Vulkan 経由なら一世代前に追いつけるのですか
文字にして書くとやっぱおかしいよな、なんで`Pixel10 シリーズ`よりも`Pixel 9`の方が`GPU 性能`よかったんだ。。。  
`WebGPU`は`Vulkan`を叩いてくれるので！まあ実質`Vulkan`と言っていいのでは！？

`Camera2API`から`YUV`のインターリーブされているデータをそれぞれのバイト配列に戻す処理とかも含まれていて、これは`CPU`性能によるので、`GPU`だけを計測するにはそもそも正確ではないことに注意する必要があります。  
とりあえず繰り返し呼び出す`render()`関数が何ミリ秒かかっているか計測します。

また、`Jetpack Compose`はリリースビルドで最高速度を出すので、デバッグ中ではあんまり参考にならないかも  
（が、`GPU`に関しては`リリースもデバッグ`も変わらないハズ。。。）

```kotlin
@Composable
fun MangekyouGpuSurfaceView(modifier: Modifier = Modifier) {
    val surfaceSize = remember { MutableStateFlow<IntSize?>(null) }
    val surfaceFlow = remember { MutableStateFlow<Surface?>(null) }

    val context = LocalContext.current
    val isPermissionGranted = remember { Channel<Boolean>() }
    val permissionRequester = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { isGranted ->
            isPermissionGranted.trySend(isGranted)
        }
    )

    val fps = remember { mutableStateOf("0 FPS") }

    LaunchedEffect(key1 = Unit) {
        // 権限を要求して待つ
        permissionRequester.launch(android.Manifest.permission.CAMERA)
        if (!isPermissionGranted.receive()) {
            println("権限が付与されませんでした...")
        }

        // サイズと surface が得られること、得られない場合は return している
        combine(
            surfaceSize,
            surfaceFlow,
            ::Pair
        ).collectLatest { (size, surface) ->
            if (size != null && surface != null) {
                val renderer = MangekyouWebGpuRenderer(context)
                try {
                    renderer.init(surface, size.width, size.height)
                    // 繰り返し呼ぶ
                    while (true) {
                        val time = measureTimeMillis {
                            delay(16.milliseconds)
                            renderer.render()
                        }
                        fps.value = ("${1000 / time} FPS")
                    }
                } finally {
                    // surface が再生成された、破棄されたとき
                    renderer.cleanup()
                }
            }
        }
    }

    Box {
        AndroidView(
            modifier = modifier.onSizeChanged { surfaceSize.value = it },
            factory = { context ->
                SurfaceView(context).apply {
                    holder.addCallback(object : SurfaceHolder.Callback {
                        override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
                            // do nothing
                        }

                        override fun surfaceCreated(holder: SurfaceHolder) {
                            surfaceFlow.value = holder.surface
                        }

                        override fun surfaceDestroyed(holder: SurfaceHolder) {
                            surfaceFlow.value = null
                        }
                    })
                }
            }
        )

        Text(
            modifier = Modifier.statusBarsPadding(),
            text = fps.value,
            fontSize = 30.sp,
            color = Color.Red
        )
    }
}
```

`APK`上の方に置いてあるので試してみたい方はどうぞ！

![xperia1viiとpixel8proとpixel10profold](https://oekakityou.negitoro.dev/resize/1f4f9e00-3113-4557-bbd0-0b0ee767603d.jpg)

←`Xperia 1 VII (Adreno)`↑`Pixel 8 Pro (Mali)`→`Pixel 10 Pro Fold (PowerVR)`

結果ですが、**Pixel 8 Pro も Pixel 10 Pro Fold もあんまり変わらず、Pixel 10 が1、2くらい高いくらい。ほんのちょっと高いくらいで変わらないと思う。**  
`OpenGL ES`だと`Pixel 8 シリーズ`が速かったが`Vulkan`だと健闘している？よく分からない。

端っこの`Xperia`はずっと`18`、`19`を行き来してました、というかこの程度でたったこれしか出ないのは**普通に私が悪くね？**

まあそもそもカメラ映像を渡す処理とかが入ってるので、再掲しますが正確な計測ではないです！！！

## 三角形の数を増やす
`6個`の三角形しか描画してないのであんまりおもしろくないかも。  
三角形の数というか頂点は先述の通り`VERTEX_ARRAY`で定義しているので、ここで三角形を増やしたい場合は頂点を書き足せばよいですね。

もうちょっと頭がこんがらかってるので、`VERTEX_ARRAY`の続きだけは`AI`に書かせました、さーせん。

```kotlin
private val VERTEX_ARRAY = floatArrayOf(
    // それぞれ X座標、Y座標、テクスチャX座標、 テクスチャY座標

    // 下 真ん中
    0.0f, 0.0f, 0.5f, 1.0f,
    -0.5f, -1.0f, 0f, 0f,
    0.5f, -1.0f, 1.0f, 0f,

    // 下 右
    0.0f, 0.0f, 0.5f, 1.0f,
    0.5f, -1.0f, 0f, 0f,
    1.0f, 0.0f, 1.0f, 0f,

    // 下 左
    0.0f, 0.0f, 0.5f, 1.0f,
    -1.0f, 0.0f, 0f, 0f,
    -0.5f, -1.0f, 1.0f, 0f,

    // 上 真ん中
    0.0f, 0.0f, 0.5f, 1.0f,
    -0.5f, 1.0f, 0f, 0f,
    0.5f, 1.0f, 1.0f, 0f,

    // 上 右
    0.0f, 0.0f, 0.5f, 1.0f,
    0.5f, 1.0f, 0f, 0f,
    1.0f, 0.0f, 1.0f, 0f,

    // 上 左
    0.0f, 0.0f, 0.5f, 1.0f,
    -0.5f, 1.0f, 0f, 0f,
    -1.0f, 0.0f, 1.0f, 0f,

    // --- ここから追加分 ---、すいません続きは AI に書かせました

    0.0f, -2.0f, 0.5f, 1.0f,
    0.5f, -1.0f, 0f, 0f,
    -0.5f, -1.0f, 1.0f, 0f,

    1.5f, -1.0f, 0.5f, 1.0f,
    1.0f, 0.0f, 0f, 0f,
    0.5f, -1.0f, 1.0f, 0f,

    -1.5f, -1.0f, 0.5f, 1.0f,
    -0.5f, -1.0f, 0f, 0f,
    -1.0f, 0.0f, 1.0f, 0f,

    0.0f, 2.0f, 0.5f, 1.0f,
    0.5f, 1.0f, 0f, 0f,
    -0.5f, 1.0f, 1.0f, 0f,

    1.5f, 1.0f, 0.5f, 1.0f,
    1.0f, 0.0f, 0f, 0f,
    0.5f, 1.0f, 1.0f, 0f,

    -1.5f, 1.0f, 0.5f, 1.0f,
    -1.0f, 0.0f, 0f, 0f,
    -0.5f, 1.0f, 1.0f, 0f,

    0.0f, -2.0f, 0.5f, 1.0f,
    0.5f, -1.0f, 0f, 0f,
    1.0f, -2.0f, 1.0f, 0f,

    1.5f, -1.0f, 0.5f, 1.0f,
    1.0f, 0.0f, 0f, 0f,
    2.0f, 0.0f, 1.0f, 0f,

    1.5f, 1.0f, 0.5f, 1.0f,
    1.0f, 0.0f, 0f, 0f,
    2.0f, 0.0f, 1.0f, 0f,

    1.5f, 1.0f, 0.5f, 1.0f,
    0.5f, 1.0f, 0f, 0f,
    1.0f, 2.0f, 1.0f, 0f,

    0.0f, 2.0f, 0.5f, 1.0f,
    -0.5f, 1.0f, 0f, 0f,
    -1.0f, 2.0f, 1.0f, 0f,

    -1.5f, 1.0f, 0.5f, 1.0f,
    -1.0f, 0.0f, 0f, 0f,
    -2.0f, 0.0f, 1.0f, 0f,

    -1.5f, -1.0f, 0.5f, 1.0f,
    -1.0f, 0.0f, 0f, 0f,
    -2.0f, 0.0f, 1.0f, 0f,

    0.0f, -2.0f, 0.5f, 1.0f,
    -0.5f, -1.0f, 0f, 0f,
    -1.0f, -2.0f, 1.0f, 0f,

    1.5f, -1.0f, 0.5f, 1.0f,
    1.0f, -2.0f, 0f, 0f,
    0.5f, -1.0f, 1.0f, 0f,

    -1.5f, -1.0f, 0.5f, 1.0f,
    -0.5f, -1.0f, 0f, 0f,
    -1.0f, -2.0f, 1.0f, 0f,

    -1.5f, 1.0f, 0.5f, 1.0f,
    -0.5f, 1.0f, 0f, 0f,
    -1.0f, 2.0f, 1.0f, 0f,

    0.0f, 2.0f, 0.5f, 1.0f,
    1.0f, 2.0f, 0f, 0f,
    0.5f, 1.0f, 1.0f, 0f,
)
```

# ソースコード
どうぞ！

https://github.com/takusan23/AndroidWebGpuMangekyou

# おわりに
夏休みの自由研究はこれで決まり！（難しいので他を選びましょう）

つーかもう折り返し地点じゃねえか

# おわりに2
仕事のせいでゲーム積みまくってる、ヤバい！  
ﾛｰﾌﾟﾗも買ってる

# おわりに3
`Android`が`Webフロントエンド`からインスピレーションを受けてそうな技術

- `WebGPU`
    - はやく正式版来てほしいです
- `Remote Compose`
    - どこで使われてるのかすらわからないけど`React Server Components`みたいなやつ
- `Jetpack Compose`
    - これ`React.js`だよマジで
    - スタイリングも`TailwindCSS`に近い
    - え？もっと`Web`技術を転用したいって？
- `Jetpack Compose FlexBox`
    - `CSS`にある`display: flex`を`Jetpack Compose`で使えるようにしたものらしい
    - わたしは`CSS flex`を雰囲気でつかってますが`TailwindCSS`でしか使ったことないので、`CSS素`そのままだったらつらいかもしれません
- `Jetpack Compose Grid`
    - `CSS`にある`display: grid`らしい
    - 先述の通り`CSS`は`flex`しか使ったことないので使い心地はわからない...
- `Jetpack Compose Strong skipping mode`
    - `React Compiler`みたいなやつ、`Android`はデフォルトになった

`React`にある`ReactQuery (なんか名前変わってた気がする)`みたいなの`Android`に来てほしいなあと一瞬思ったけど、複雑なライフサイクルを持つ`Android`には合わなさそうな気がしてきたので思ってないです。

# おわりに4
`Camera2 API`利用中（？）にスクショを取ると音が出る！！！  
ちゃんと塞がれてんのくさ