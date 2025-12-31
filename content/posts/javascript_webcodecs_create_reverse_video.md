---
title: WebCodecs で逆再生の動画を作る
created_at: 2025-12-31
tags:
- TypeScript
- Next.js
- WebCodecs
---
どうもこんばんわ。ハッピーウィークエンド攻略しました。こんかいの`HOOK`にはお姉さんヒロインがいます！！  
かわいくて声もよかった。こはるさんがかわいかった！のでおすすめです。

![感想](https://oekakityou.negitoro.dev/resize/6db08fe7-6da9-4503-bcb1-c9a3e0fcf1b4.jpg)

`"文字列リテラル"`になってる（？）

共通が長め + 前作より過程が楽しめます！。前作が分割だったからそりゃそうかもしれないけど  
終わり方が`HOOK`だ！！

![感想](https://oekakityou.negitoro.dev/resize/3520c25c-a7c5-4dd9-9ff3-a6da1b5fb2ac.jpg)

ゆきさん！！声がかわいい  
フライパン

![感想](https://oekakityou.negitoro.dev/resize/63efdc73-ee53-4e3a-9e6c-bfafc6b259fa.jpg)

かわいい

![感想](https://oekakityou.negitoro.dev/resize/5f1f8366-b2d6-4dae-a596-3403e4c3c48f.jpg)

がーん

![感想](https://oekakityou.negitoro.dev/resize/0f3decf7-4213-4e56-842d-6627cea243be.jpg)

ひなたさん面白くてよかった。あとえちえち。  
いっぱいスクショあります

![感想](https://oekakityou.negitoro.dev/resize/11e2788b-472b-4529-a37c-6ca93be2c494.jpg)

（笑）読み上げてて笑った

![感想](https://oekakityou.negitoro.dev/resize/6f60657b-10d1-4563-a98b-cecf208cc854.jpg)

![感想](https://oekakityou.negitoro.dev/resize/4e492e63-ab81-4596-a99f-2933da098099.jpg)

ここすｋ

![感想](https://oekakityou.negitoro.dev/resize/57278e07-9426-4dd0-a8a2-03d81a9da75c.jpg)

！？！？

![感想](https://oekakityou.negitoro.dev/resize/11fcb9ff-b9e7-45cf-aa7b-996a6b1cb726.jpg)

がるるるる

![感想](https://oekakityou.negitoro.dev/resize/334bc254-ecd3-4296-9a32-5aeb62d2a1bb.jpg)

敵ぃ←かわいい

![感想](https://oekakityou.negitoro.dev/resize/17959de6-676d-49f5-9b81-f6cc8fc6c55a.jpg)

あきなさん！！！色々と・・・

![感想](https://oekakityou.negitoro.dev/resize/581e60b3-110a-40f6-b26a-91748738001f.jpg)

ここすき

![感想](https://oekakityou.negitoro.dev/resize/33dfa84d-f8e1-4d32-9d0a-1c1d8319757f.jpg)

大人組の会話、こはるさんの方はイベント絵だったのでこっちで

![感想](https://oekakityou.negitoro.dev/resize/15c72f96-e15e-41b8-8b4b-74b07d00ce16.jpg)

あ！！

![感想](https://oekakityou.negitoro.dev/resize/147fb125-4a00-47ff-8155-742d0113a03f.jpg)

おすすめはこはるさんルートです。あらあ

![感想](https://oekakityou.negitoro.dev/resize/63957758-a829-4c3d-801d-3fb48a87013d.jpg)

おでかけ・・！

![感想](https://oekakityou.negitoro.dev/resize/0250561a-3948-4f76-bf6c-e16e3bb1f474.jpg)

！！！

![感想](https://oekakityou.negitoro.dev/resize/1a60bcbe-71f9-46ad-aab4-a1a842001597.jpg)

かみのけ！！！おろしてる！

![感想](https://oekakityou.negitoro.dev/resize/6708c389-01b7-4441-9fce-a7016579beb6.jpg)

くろまきー用こはるさんもあります（？）

![感想](https://oekakityou.negitoro.dev/resize/3a988cf7-cab1-4f6f-8270-08eb41b7da45.jpg)

かわい～～～

![感想](https://oekakityou.negitoro.dev/resize/49d9b761-3a58-40e2-926a-8db5c0db804c.jpg)

![感想](https://oekakityou.negitoro.dev/resize/263e29c9-384f-4a8a-899f-3c23cac0ee16.jpg)

！！！！！

![感想](https://oekakityou.negitoro.dev/resize/06cbc80d-cb0b-413b-b3c4-969708fc479f.jpg)

いまなら！

![感想](https://oekakityou.negitoro.dev/resize/579177d9-ae7a-4a82-bdeb-a7b36f149e55.jpg)

あと！！全員にひとりのしーんがある！！！

# 本題
今回は`ブラウザ`の中で完結する、逆再生の動画を作る`Webサイト`を作ろうと思います。  
`WebCodecs API`っていう、`映像・音声コーデック`の`エンコーダー/デコーダー`を直接利用することが出来る`ブラウザ`由来の`API`があります。今回はそれらを使うことで低レイヤーな動画処理をしようかと。

![webm.negitoro.dev](https://oekakityou.negitoro.dev/original/13b8f713-356c-4dad-a57d-04a2f4680f97.png)

作ろうと思いますというか、前に作った`WebM`の`Webサイト`に**しれっと追加**しているので、それの詳細記事になるんですが・・・

# 自分 Android ユーザー、エンジニアなんですけど
`Android`の`エンコード / デコード API`である`MediaCodec`を使って逆再生の動画を作る。

https://takusan.negitoro.dev/posts/android_mediacodec_reverse_video/

こっちは`Android`にあるコンテナフォーマット読み書き`API (MediaMuxer)`を利用するため、`mp4`も`webm`もいけるし、`10 ビット HDR`動画もいけます。

# 完成品

リンク  
https://webm.negitoro.dev/

ソースコード  
https://github.com/takusan23/webm-kotlin-wasm-nextjs

これの`WebM ファイルを逆再生して保存する`で、逆再生の動画を作ることが出来ます。  
**利用するためには WebM ファイル（映像コーデック：VP9 + 音声コーデック：Opus）である必要があります**。それが厳しい場合は`Android ユーザー・エンジニア`向けに案内したアプリを使ってください。

- `ffmpeg`で変換するか
- 自作アプリで変換してもいいですけど
    - https://play.google.com/store/apps/details?id=io.github.takusan23.himaridroid  
- お手軽なのは`MediaRecorder API`で画面録画する事ですね。`WebM (VP9+Opus)`ファイルが手に入ります。
    - https://webm.negitoro.dev/

というのも、この`WebCodecs API`、**名前の通り**に`デコーダー・エンコーダー`の`API`しか無く、`WebM / mp4`等のコンテナフォーマットへ書き込む`API`が存在しないんですよね。  
コンテナフォーマットを読み書きするとなると、仕様が公開されてて、`MediaRecorder API`でも使われている実績がある`WebM`を採用するしか無く、それに引きずられて`映像コーデックは VP9`、`音声コーデックは Opus`、、、と決まるわけです。  
（`AV1 / VP8`でも良いけど・・・）

詳しくは後述します！！！

あと`Android`エンジニアの誘導のくだりの続きですが、当時は`WebCodecs API`が`Chrome 系列`でしか実装されてなかったはず。  
が`Android`版を作ったあとくらいに`Firefox`でも実装されたため、`Webサイト`版が作れます！！`Safari`は`Apple`ユーザーじゃないんで知らないです。

https://caniuse.com/?search=webcodecs

ですが、今回作るやつ、なんか`Firefox`では動きませんでした（？）

# そもそも逆再生の動画って難しいんですか？
よく見るかなと思います。逆再生の動画。あれって難しいのという話。

```html
<video src="test.mp4" reversed={true}></video>
```

上記の`reversed`パラメータなんて存在しないんですが、その理由とそもそも難しいんか？って話をするために、世の中の動画ファイルの話をします。  
`Android`の`MediaCodec`の記事で何回か言ったような気がするけど再掲しておきます。。。

# 今日の動画ファイルが再生できる仕組み
今日のオンライン会議から、今晩のおかずまでを支えている動画の仕組みをば。  
`WebCodecs API`といい`MediaCodec API`の立ち位置がわからないよって人向け。

![流れ](https://oekakityou.negitoro.dev/resize/51fabd2d-e782-412f-8cda-c960262215a7.png)

## コーデック
`AVC（H.264）`、`HEVC（H.265）`、`VP9`、`AV1`とかが映像コーデック、`AAC`、`Opus`が音声コーデックの種類ですね。

`コーデック`というのが映像や音声を小さくするためのアルゴリズムのことです。  
そして、このアルゴリズムを動かして、映像・音声を圧縮するのが`エンコーダー`で、逆に解凍するのが`デコーダー`です。`GPU`の中にあります。ない場合は`CPU`がやります。

なんで圧縮なんかしているのかと言うと**クソデカファイル**になってしまうからです。

https://developer.mozilla.org/ja/docs/Web/Media/Guides/Formats/Video_codecs

例えば`フルHD`の解像度では`1920x1080=2073600`ピクセル分のデータが必要で、その上、`1ピクセル`は`4バイト（32ビット）`を消費するので、`1920x1080x4=8294400`バイト必要です。  
単位を変換すると`8.29MB`になります。  
（`4バイト`の出どころさんは、カラーコードの`#000000`から`#FFFFFFFF`を表現するため。`RGBA`がそれぞれ`8ビット`使う（`#00`から`#FF`））  
（余談ですが`10 ビット HDR`動画は`RGB`で`10ビット`使い、アルファチャンネルが残りの`2ビット`使っている。）

これが**映像の一枚分のデータ**。  
よく見る動画ファイルは、`30fps`や`60fps`、`120fps`の場合が多いため、`8.29(MB)x30(fps)`にすれば`1秒`で`30fps`の動画が出来ます。**明らかに動画サイズが大きすぎる。**

これをいい感じに小さくするのがコーデックの役割。

https://aviutl.info/ko-dekku-konntena/

コーデックはいくつかの方法を利用してファイルサイズを小さくします。この中に逆再生ができなくなる理由があります。  
というのも、**動画の時間が増えていく方向にしか再生ができない**という制約があります。

コーデックさんは、前の画像と変化しないところは保存せず、変化したところだけを保存するそうです。`30fps`なら`30枚分`をまるまる保存しなくて済むので合理的に見えます。  
ただ、これだと前の画像は前の前の画像に依存してて、その前はさらに前の画像に依存してて、と**一生シーク操作**が出来なくなってしまいます。

![Imgur](https://i.imgur.com/jYIyLRx.png)

これを解決するために、キーフレームという画像が定期的にエンコーダーからでてきます。  
これは前の画像に依存しない画像のため、シークする際はこのキーフレームまで戻ったあと、狙いの時間まで画像を進めればよいわけです。

![Imgur](https://i.imgur.com/D7lpjAO.png)

**つまり逆再生は難しい！！！**

### 音声の場合
音声の場合も同様にエンコードされていますが、これを全部デコードしたところでそこまでデータ量が大きくならないと思います。（大きいけど）

詳しく話すと、大抵の音声ファイルは1秒間に`48_000回`記録します。これがサンプリングレートと呼ばれているものです。  
次に、一回の記録で`16ビット`使います。これをビット深度とか言います。ロスレス配信気になってる人!  
最後に、左右で違う音を出すために二倍の容量を利用します。なので一回で`32ビット`ですね。これをチャンネル数とか言います。

全部掛け算すると、1秒間に`1_536_000ビット`、バイトに変換するために`8`で割ると`192_000バイト`しか使いません。1秒で。

なので、音声ファイルの逆再生に関しては、一回全部デコードしたあと、後ろからデータをエンコーダーに渡していけばいいんじゃないかと思っています。

## コンテナ
`MP4`や`WebM`といったのはコンテナフォーマットの種類のことです。  
ちなみに`MP4`の前世が`MOV`形式です。`iPhone`の動画ファイルが`MOV`だとしても、これを思い出して`.mp4`に拡張子を書き換えるだけで動く。

雑な絵ですが動画ファイルの中身、`WebM`がこんなのでほかでもそうなんじゃないかな。

![動画ファイルの中身](https://oekakityou.negitoro.dev/resize/4939a72e-a7fc-42d4-bec4-6abbd600808c.png)

雑と言ってもそんなに大外れな解釈ではないはずだ、が、

![webm_spec](https://oekakityou.negitoro.dev/resize/7ed48fac-6abf-4107-890b-3a1e8ba8dd5f.png)

エンコードした音声・映像を入れるための箱です。`mp4`とか`webm`とか言われているやつです。  
なので、動画プレイヤーや、`<video> タグ`はまずこのコンテナフォーマットをバラバラにするわけです。

パースすると大まかに3つの塊が現れるかと思います。  

- 動画情報
- エンコードされた音声トラックのデータ
- エンコードされた映像トラックのデータ

`WebCodecs`も`MediaCodecs`もですが、再生のためにまずは動画情報の中身が必要になります。これらのクラスの初期化に必要なので。  
`WebM`の場合はこんな感じになってて、`mp4`でも同様だと思いますが、

- 動画の長さ
- 映像情報
    - コーデックの名前
    - 動画の縦横サイズ
    - SDR なのか HDR なのか
- 音声情報
    - コーデックの名前
    - サンプリングレート
    - チャンネル数（モノラル・ステレオ）
    - （`Opus`なら固有のデータ？）
- エンコードされたデータの保存位置
    - 0秒 -> 200バイト目
    - 繰り返し...

映像や音声などの、中にはいっているデータの種類を`トラック`とよんだりします。  
`映像トラック、音声トラック`のように。

## デコーダー・エンコーダー
`動画情報`をもとに`WebCodecs API`をセットアップすると、ついに再生の準備が出来ました。  
`エンコードされたデータ`を順番にデコーダーに入れるだけです。

`WebCodecs API`のデコーダーは`VideoFrame`をコールバック関数で受け取ることが出来て、これを`Canvas`に書けば、`WebCodecs API`で動画再生（映像のみ）が可能になる！！  
同様にエンコーダーに`VideoFrame`や`<canvas>`を入れればエンコード済みデータが取得できる。これを`WebM`とかにルール通り保存すれば、`動画プレイヤー`で再生することが出来る。

## むずかしいくね
まあどっちかというと私の説明が怪しい。

つまるところ、`WebCodecs API`とか`MediaCodec API`とかってのは、この圧縮・解凍を行うエンコーダー・デコーダーを指しているわけ、。  
で、それとは別に`WebCodecs API`で再生するためには`WebM`を解析する（デマルチプレクサ、パーサー）が必要。  
パースした結果を渡すことで再生できるので。。。

そして逆再生は一筋縄ではいかないということも。

# 付録 video タグや MSE との違いは？
`<video>`タグを自前で作り直すポテンシャルがあり、`MSE`と違ってコンテナフォーマットに縛られない。

| `<video>`                            | `Media Source Extensions`                              | `WebCodecs`                                          |
|--------------------------------------|--------------------------------------------------------|------------------------------------------------------|
| `src`からロードする機能              | ロードする箇所は自前で作成可能（生配信など）           | ロードする箇所は自前で作成可能                       |
| コンテナフォーマットを解析する機能   | コンテナフォーマットは規定の物を利用（`fmp4`、`webm`） | コンテナフォーマットも自力で解析するので好きにできる |
| デコーダーに入れて画面に表示する機能 | デコーダーに入れて画面に表示する機能                   | デコーダーに入れるまでは自前で作る必要               |
| `UI`を提供する機能                   | `UI`を提供する機能                                     | `<canvas>`に書けば最低限画面に表示できる             |
| `iOS`対応                            | `iOS` **非対応**（`iPad OS`のみ対応、謎）              | 知らない。？                                         |

# 作戦
映像トラックに関しては一回一回キーフレームまで戻ってフレームを取得するしかない。  
音声トラックは先述の通り一回すべてデコードして、後ろからエンコーダーに突っ込む作戦。

![後ろからフレームを撮る](https://oekakityou.negitoro.dev/resize/8d808930-6501-475b-8422-901a9556fae1.png)

それよりも問題は`WebM`に書き込む処理なんだよ

# WebM コンテナフォーマットのパーサとミキサーが必要
というわけで、`WebCodecs API`は`映像・音声`の`エンコーダー・デコーダー`の`API`しか存在しないので、自分で作るかライブラリを入れるかする必要があり。

こんかいは自作！！！  
`WebM`の仕様はインターネットで見ることが出来るので誰でもパーサー（デマルチプレクサ）を作ることが出来ます！

https://takusan.negitoro.dev/posts/video_webm_spec/

**WebCodecs API が難しいうんぬんも、コンテナフォーマット読み書きを用意するほうがよっぽど難しい！！！**

どうでもいいですが、`mp4`の仕様はお金を払えば見れるはず（`ISOなんとか`）だが、仮に買ったとてそもそも英語がわからない。。。。  

## Kotlin でできた WebM 読み書き処理をブラウザで使う
ここの説明は余談な感じです。のと前ブログで書いたので省きます！！

https://takusan.negitoro.dev/posts/kotlin_multiplatform_create_npm_library_use_nextjs/

自作したと言っても`Kotlin`で書いたので、これを`ブラウザ JavaScript`に持ってくる必要があります。  
幸いなことに`Kotlin Multiplatform`は`Kotlin/Wasm`をターゲットにできて、かつ、`npm`ライブラリ吐き出す機能があるため、`Kotlin`で書いた関数を`Wasm`の力で`JavaScript/TypeScript`から**呼び出す**ことが出来る！！！！

## WebM 読み書きライブラリ メイドイン Kotlin Wasm

https://github.com/takusan23/himari-webm-kotlin-multiplatform-npm-library

`Kotlin Multiplatform`のコードを`npm i`出来るようにしました。  
私の`WebM 読み書きライブラリ`を使いたいという人は多分存在しないと思いますが、もし使う場合は、`npm`レジストリには存在しないので、`GitHub`から`npm i`してください・・・

```shell
npm install takusan23/himari-webm-kotlin-multiplatform-npm-library
```

今回はこのライブラリを使って`WebM`を解析し、`WebCodecs API`でデコードとエンコードをし、このライブラリで再度`WebM`を組み立てるという魂胆でいます。

# 環境
`WebCodecs API`を使いたいだけなので、`React + Vite`の`SPA`の構成でも良いんですが、今回は`Next.js`にします。  
`TypeScript`と`TailwindCSS`がすぐ使えるので。まあ`Next.js`使いますが大多数を`"use client"`にするので、やってることは`React + Vite`の`SPA`と大体同じという。。。

| なまえ        | あたい                                                                     |
|---------------|----------------------------------------------------------------------------|
| 利用する動画  | WebM コンテナフォーマット形式（映像コーデック`VP9`、音声コーデック`Opus`） |
| Next.js       | 16.1.0 （クライアントコンポーネントだけ使います）                          |
| WebM 読み書き | 自前のものを（先述）                                                       |
| CSS           | TailwindCSS                                                                |

また、今回は`WebM + VP9 + Opus`の動画でやります。  
エンコーダー・デコーダーを起動する際に、なんのコーデックを使っているかで分岐するべきなのだが、今回は決め打ちしています。運用でカバー

# 今回使う WebM ファイルを用意する
先述の通りで、`JavaScript`の`MediaRecorder API`で作ったもので良いです。`ffmpeg`で変換しても良いですが。  
ま何でも良いので`WebM`コンテナフォーマット形式（映像コーデック`VP9`、音声コーデック`Opus`）を守ってくれれば、多分今回作る`Webサイト`は動きます。

https://webm.negitoro.dev/

今回は、わたしのサイトで画面録画して`WebM`ファイルを取得したものを使おうと思います。これ↑  
中身は`getDisplayMedia()`で画面録画用のデータをもらい、`MediaRecorder API`で`WebM`に保存する処理をやってるだけ。`ブラウザ内部`で完結しています。

# 逆再生よりまず普通に再生してみる
とりあえず画面に映像トラックだけ表示する例をやってみようと思った。

## 適当なコンポーネントを作った
`WebCodecsVideoPlayer.tsx`を作りました。  
動画を流すための`<canvas>`、動画を選ぶ`<input type="file">`と、`startVideoPlay()`関数で再生が始まる的なやつです。

めんどうなので`hooks`にはしてないです。

```tsx
'use client'

export default function WebCodecsVideoPlayer() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    /** 再生を始める */
    async function startVideoPlay(file?: File) {
        if (!file) return
    }

    return (
        <div className="flex flex-col space-y-2 border rounded-md border-l-blue-600 p-4 items-start">

            <h2 className="text-2xl text-blue-600">
                WebCodecs で動画再生
            </h2>

            <canvas
                ref={canvasRef}
                width={640}
                height={320} />

            <input
                className="p-1 border rounded-md border-l-blue-600"
                accept="video/webm"
                type="file"
                onChange={(ev) => startVideoPlay(ev.currentTarget.files?.[0])} />
        </div>
    )
}
```

## WebM 読み書きを用意
`Kotlin Multiplatform`で作った読み書き関数を`Wasm`にして呼び出しています。  
読み書きに何を採用するかによって違うと思う。。。

今回は自前のを入れます...

```shell
npm install takusan23/himari-webm-kotlin-multiplatform-npm-library
```

## 再生関数の中身
`startVideoPlay()`関数の全貌です。詳細はこのあとすぐ！

```ts
/** 再生を始める */
async function startVideoPlay(file?: File) {
    if (!file) return
    if (!canvasRef.current) return

    // Kotlin Multiplatform で出来たライブラリをロード
    // 絶対クライアントが良いので動的ロードする
    const {
        parseWebm,
        getVideoHeightFromWebmParseResult,
        getVideoWidthFromWebmParseResult,
        getVideoEncodeDataFromWebmParseResult,
        getTimeFromEncodeData,
        getEncodeDataFromEncodeData,
        isKeyFrameFromEncodeData
    } = await import("himari-webm-kotlin-multiplatform")

    // WebM をパース
    const arrayBuffer = await file.arrayBuffer()
    const intArray = new Int8Array(arrayBuffer)
    const parseRef = parseWebm(intArray as any)

    // 動画の縦横サイズを出す
    const videoHeight = Number(getVideoHeightFromWebmParseResult(parseRef))
    const videoWidth = Number(getVideoWidthFromWebmParseResult(parseRef))

    // 映像トラックのエンコード済みデータの配列
    // TODO 全部メモリに乗せることになってる
    const videoTrackEncodeDataList = Array.from(getVideoEncodeDataFromWebmParseResult(parseRef) as any).map((ref) => ({
        time: getTimeFromEncodeData(ref),
        encodeData: getEncodeDataFromEncodeData(ref),
        isKeyFrame: isKeyFrameFromEncodeData(ref)
    }))

    // とりあえず Canvas に書く
    const ctx = canvasRef.current.getContext('2d')

    // WebCodecs をいい感じに Promise にする
    let outputCallback: ((videoFrame: VideoFrame) => void) = () => { }

    // outputCallback() 呼び出しまで待機する Promise
    function awaitVideoFrameOutput() {
        return new Promise<VideoFrame>((resolve) => {
            outputCallback = (videoFrame) => {
                resolve(videoFrame)
            }
        })
    }

    // WebCodecs インスタンスを作成
    const videoDecoder = new VideoDecoder({
        error: (err) => {
            alert('WebCodecs API でエラーが発生しました')
        },
        output: (videoFrame) => {
            outputCallback(videoFrame)
        }
    })

    // セットアップ
    videoDecoder.configure({
        codec: 'vp09.00.10.08', // コーデックは VP9 固定にする...
        codedHeight: videoHeight,
        codedWidth: videoWidth
    })

    // 開始時間を控えておく
    const startTime = Date.now()

    // 映像トラックのエンコード済みデータを得る
    for (const encodeData of videoTrackEncodeDataList) {

        // 順番にデコーダーに入れていく
        const videoChunk = new EncodedVideoChunk({
            data: new Int8Array(encodeData.encodeData as any).buffer as any,
            timestamp: Number(encodeData.time) * 1_000,
            type: encodeData.isKeyFrame ? 'key' : 'delta'
        })

        // デコーダーに入れる
        const outputPromise = awaitVideoFrameOutput()
        videoDecoder.decode(videoChunk)

        // output = () => { } が呼び出されるのを待つ
        const videoFrame = await outputPromise

        // Canvas にかく
        ctx?.drawImage(videoFrame, 0, 0, canvasRef.current.width, canvasRef.current.height)
        videoFrame.close()

        // 次のループに進む前に delay を入れる。30fps なら 33ms は待つ必要があるので
        // タイムスタンプと再生開始時間を足した時間が、今のフレームを出し続ける時間
        const delayMs = (startTime + (videoFrame.timestamp / 1_000)) - Date.now()
        await new Promise((resolve) => setTimeout(resolve, delayMs))
    }

    // おしまい
    videoDecoder.close()
}
```

### WebM のパース部分
ここは`WebM`のパーサーというか読み書きライブラリ次第なのであんまり話してもあれですが。

```ts
if (!file) return
if (!canvasRef.current) return

// Kotlin Multiplatform で出来たライブラリをロード
// 絶対クライアントが良いので動的ロードする
const {
    parseWebm,
    getVideoHeightFromWebmParseResult,
    getVideoWidthFromWebmParseResult,
    getVideoEncodeDataFromWebmParseResult,
    getTimeFromEncodeData,
    getEncodeDataFromEncodeData,
    isKeyFrameFromEncodeData
} = await import("himari-webm-kotlin-multiplatform")

// WebM をパース
const arrayBuffer = await file.arrayBuffer()
const intArray = new Int8Array(arrayBuffer)
const parseRef = parseWebm(intArray as any)
```

先頭の`if`は`早期 return`で値があることを確認するためです。関係ないね  
その後の、`await import("himari-webm-kotlin-multiplatform")`ですが、これが`Kotlin Multiplatform`で書かれた関数をインポートしている部分です。  
なんか絶対クライアント側でロードしないとうまく行かなかった。

その後は`arrayBuffer()`で`WebM`ファイルのバイト配列を取得し、これを`Kotlin`で書かれた処理に渡すという。  
`Kotlin`側気になる方はここです。バイト配列をいじくり回してます・・・

https://github.com/takusan23/HimariWebmKotlinMultiplatform/blob/7618dbb04bc5d92247b12ab863e36d049b35cbeb/library/src/commonMain/kotlin/io/github/takusan23/himariwebmkotlinmultiplatform/HimariWebmParser.kt#L29

### WebM からデコーダー起動に必要な値を取ってる部分
```ts
// 動画の縦横サイズを出す
const videoHeight = Number(getVideoHeightFromWebmParseResult(parseRef))
const videoWidth = Number(getVideoWidthFromWebmParseResult(parseRef))

// 映像トラックのエンコード済みデータの配列
// TODO 全部メモリに乗せることになってる
const videoTrackEncodeDataList = Array.from(getVideoEncodeDataFromWebmParseResult(parseRef) as any).map((ref) => ({
    time: getTimeFromEncodeData(ref),
    encodeData: getEncodeDataFromEncodeData(ref),
    isKeyFrame: isKeyFrameFromEncodeData(ref)
}))
```

このへんです。  
なんでやたらめったら`parseRef`を引数にした関数呼び出しを行っているかと言うと、`Kotlin/Wasm`側にしかデータクラスの値が無くて、データクラスからそれぞれの値を取得するための関数を呼び出しているためです。  

`TypeScript`側からだと`parseRef`は何も意味をなさないオブジェクトなのですが、これを`Kotlin/Wasm`側へ渡すと、`Kotlin/Wasm`の世界で持っている参照に変換（ここではデータクラスの参照に変換）出来る。  
これを使って、データクラスのそれぞれの値を返す関数をその都度呼び出している。もしかすると`Kotlin/JS`ならそんな事しなくても良かった可能性が？

この辺も`Kotlin`側みたい人は！！！

https://github.com/takusan23/HimariWebmKotlinMultiplatform/blob/7618dbb04bc5d92247b12ab863e36d049b35cbeb/library/src/wasmJsMain/kotlin/io/github/takusan23/himariwebmkotlinmultiplatform/ExportParser.kt#L38

### WebCodecs デコーダー起動している部分

```ts
// WebCodecs をいい感じに Promise にする
let outputCallback: ((videoFrame: VideoFrame) => void) = () => { }

// outputCallback() 呼び出しまで待機する Promise
function awaitVideoFrameOutput() {
    return new Promise<VideoFrame>((resolve) => {
        outputCallback = (videoFrame) => {
            resolve(videoFrame)
        }
    })
}

// WebCodecs インスタンスを作成
const videoDecoder = new VideoDecoder({
    error: (err) => {
        alert('WebCodecs API でエラーが発生しました')
    },
    output: (videoFrame) => {
        outputCallback(videoFrame)
    }
})

// セットアップ
videoDecoder.configure({
    codec: 'vp09.00.10.08', // コーデックは VP9 固定にする...
    codedHeight: videoHeight,
    codedWidth: videoWidth
})
```

`new VideoDecoder()`で映像デコーダーのインスタンスが取得できます。  
デコード結果を取得できるコールバックと、エラー時に呼ばれるコールバックを取ります。映像デコーダーの場合は`output`で`VideoFrame`のオブジェクトをもらうことが出来ます。

ただ、コールバックだとちょっと扱いにくいので、コールバック呼び出しを`Promise`にするための関数が`let outputCallback`と、`awaitVideoFrameOutput()`です。  
詳しい話はこれを使うときに！！

### 時間通りに再生する処理

```ts
// 開始時間を控えておく
const startTime = Date.now()

// 映像トラックのエンコード済みデータを得る
for (const encodeData of videoTrackEncodeDataList) {

    // 順番にデコーダーに入れていく
    const videoChunk = new EncodedVideoChunk({
        data: new Int8Array(encodeData.encodeData as any).buffer as any,
        timestamp: Number(encodeData.time) * 1_000,
        type: encodeData.isKeyFrame ? 'key' : 'delta'
    })

    // デコーダーに入れる
    const outputPromise = awaitVideoFrameOutput()
    videoDecoder.decode(videoChunk)

    // output = () => { } が呼び出されるのを待つ
    const videoFrame = await outputPromise

    // Canvas にかく
    ctx?.drawImage(videoFrame, 0, 0, canvasRef.current.width, canvasRef.current.height)
    videoFrame.close()

    // 次のループに進む前に delay を入れる。30fps なら 33ms は待つ必要があるので
    // タイムスタンプと再生開始時間を足した時間が、今のフレームを出し続ける時間
    const delayMs = (startTime + (videoFrame.timestamp / 1_000)) - Date.now()
    await new Promise((resolve) => setTimeout(resolve, delayMs))
}

// おしまい
videoDecoder.close()
```

デコーダーに渡す際は`EncodedVideoChunk`形式にする必要があるみたいです。  
エンコード済みのバイト配列、再生時間（マイクロ秒です！！）、キーフレームかどうかを指定する必要があります。これらは`WebM`から取り出す際に取得できるので、それを渡せばおっけー

![webm_encoded_detail](https://oekakityou.negitoro.dev/original/424ed36e-72ab-41d8-b60a-da2dfd42e72e.png)

まああとは、順番にデコーダーに入れています。ただ、これを適当に入れると、動画が超高速で再生されてしまいます。  
例えば、`30fps`であれば`33ms`の間はそのフレームを表示し続ける必要があります。が、デコーダーはそれよりも圧倒的に早い時間でデコードし終えるので、待ってから次のデータを入れる処理が必要になります。

そのためには`Promise`で`setTimeout`的な、待つ処理的なのをかけると良い感じに解決しそうですよね。

ここで、先述のデコーダーのコールバックを`Promise`にしたものが役に立つわけです。  
デコーダーに入れる前に、`awaitVideoFrameOutput()`を呼び出す。これは、`outputCallback`コールバック関数を作り直し、それが呼び出されるまでは`resolve()`しないような`Promise`を作成します。  
次に、`VideoDecoder#decode()`を呼び出しデコードを行う。目論見通りなら`output: (videoFrame) => { }`コールバック関数が呼ばれるはず。  
この中で`outputCallback`が呼び出され、`Promise`が`resolved`状態になる。

すると、`await outputPromise`の部分が呼び出しから戻って来て、`VideoFrame`が取得できる。  
これを`Canvas`に書けば画面に表示することが出来る。

最後に、フレームの時間だけ待つ`setTimeout`を`Promise`にして`await`したら、1フレームの再生は成功。  
これをエンコード済みデータがある限り繰り返せば、動画プレイヤーになります！

## とりあえず再生してみる
今作ったコンポーネントを`page.tsx`等で画面に表示していきます。

```ts
import WebCodecsVideoPlayer from "./WebCodecsVideoPlayer";

export default function Home() {
  return (
    <div className="flex flex-col p-2 space-y-2">
      <h1 className="text-4xl">WebCodecs + WebM サイト</h1>

      <WebCodecsVideoPlayer />
    </div>
  )
}
```

ちゃんと動画が流れています！！

![webcodecs_play_on_chrome](https://oekakityou.negitoro.dev/resize/02dc10d5-6fe6-4294-8b4c-595bc4672b62.png)

![webcodecs_play_on_firefox](https://oekakityou.negitoro.dev/resize/28b2e389-6463-4462-9f44-bf91dee1092d.png)

## 思ったよりシンプル？
**一時停止**や**シーク**や**再生速度変更**をやろうとすると一気にしんどくなると思います！！！！！！！！  
それに映像だけだし。音声トラックも再生するとなると再生位置を同期させる必要があって・・・

# 本題の逆再生を作っていきたい
`ReverseVideoMaker.tsx`を作りました。  
まずは見た目を。今どこやってるかを表示できる`<canvas>`を置きました。色同じだとあれなので赤色にした。

```tsx
'use client'

import { useRef } from "react"

export default function ReverseVideoMaker() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    /** 処理を開始する */
    async function process(file?: File) {
        if (!file) return
        if (!canvasRef.current) return

        // TODO この後すぐ
    }

    return (
        <div className="flex flex-col space-y-2 border rounded-md border-l-red-600 p-4 items-start">

            <h2 className="text-2xl text-red-600">
                WebCodecs で逆再生動画を作る
            </h2>

            <canvas
                ref={canvasRef}
                width={640}
                height={360} />

            <input
                className="p-1 border rounded-md border-l-blue-600"
                accept="video/webm"
                type="file"
                onChange={(ev) => process(ev.currentTarget.files?.[0])} />
        </div>
    )
}
```

## 逆再生に使う関数をインポートして解析
毎度のごとく申し訳ないと思っております。`WebM`コンテナをパースする部分が自作なので、パット見で何だか分からない関数だらけなの。  
かつ`Kotlin Multiplatform（Kotlin/Wasm）`でややこしい。。。

`Kotlin Multiplatform`で出来た解析系の処理はここ  
https://github.com/takusan23/HimariWebmKotlinMultiplatform/blob/7618dbb04bc5d92247b12ab863e36d049b35cbeb/library/src/wasmJsMain/kotlin/io/github/takusan23/himariwebmkotlinmultiplatform/ExportParser.kt#L8

同様に`WebM`組み立てる系の処理はここ  
https://github.com/takusan23/HimariWebmKotlinMultiplatform/blob/7618dbb04bc5d92247b12ab863e36d049b35cbeb/library/src/wasmJsMain/kotlin/io/github/takusan23/himariwebmkotlinmultiplatform/ExportMuxer.kt#L8

```ts
// クライアントでロードする
const {
    getEncodeDataFromEncodeData,
    getTimeFromEncodeData,
    getVideoEncodeDataFromWebmParseResult,
    getVideoHeightFromWebmParseResult,
    getVideoWidthFromWebmParseResult,
    isKeyFrameFromEncodeData,
    parseWebm,
    createMuxerWebm,
    setAudioTrack,
    setVideoTrack,
    writeAudioTrack,
    writeVideoTrack,
    muxerBuild,
    getAudioCodecFromWebmParseResult,
    getAudioSamplingRateFromWebmParseResult,
    getAudioChannelCountFromWebmParseResult,
    getAudioEncodeDataFromWebmParseResult
} = await import("himari-webm-kotlin-multiplatform")

// WebM をパース
const arrayBuffer = await file.arrayBuffer()
const intArray = new Int8Array(arrayBuffer)
const parseRef = parseWebm(intArray as any)

// 音無しの動画にも対応するため
const hasAudioTrack = !!getAudioCodecFromWebmParseResult(parseRef)

// エンコードされたデータを取得する
// TODO メモリに優しくない
const videoTrackEncodeDataList = Array.from(getVideoEncodeDataFromWebmParseResult(parseRef) as any).map((ref) => ({
    time: getTimeFromEncodeData(ref),
    encodeData: getEncodeDataFromEncodeData(ref),
    isKeyFrame: isKeyFrameFromEncodeData(ref)
}))
const audioTrackEncodeDataList =
    hasAudioTrack
        ? Array.from(getAudioEncodeDataFromWebmParseResult(parseRef) as any).map((ref) => ({
            time: getTimeFromEncodeData(ref),
            encodeData: getEncodeDataFromEncodeData(ref),
            isKeyFrame: isKeyFrameFromEncodeData(ref)
        }))
        : []

// 時間やデコーダー起動に必要な値を出す
const durationMs = videoTrackEncodeDataList[videoTrackEncodeDataList.length - 1].time
const videoHeight = Number(getVideoHeightFromWebmParseResult(parseRef))
const videoWidth = Number(getVideoWidthFromWebmParseResult(parseRef))
const samplingRateOrNull =
    hasAudioTrack
        ? Number(getAudioSamplingRateFromWebmParseResult(parseRef))
        : null
const channelCountOrNull =
    hasAudioTrack
        ? Number(getAudioChannelCountFromWebmParseResult(parseRef))
        : null
```

今回は音ありの動画を考慮するため、`hasAudioTrack`を`true/false`で持っています。`!!`で`truthy`な値を`Boolean`に変換する技、たまに使いたくなる。`double exclamation mark`とか言う技らしい。  
再生と同様に、映像・音声トラックの情報と、エンコード済みデータを取り出しています。音声エンコーダー・デコーダーには`サンプリングレート`と`チャンネル数（ステレオだと思いますが）`が必要なので。

## 逆再生 プレビュー Canvas
逆再生エンコードしてる？進捗を見るために。なお音声の処理は特に用意してないので進捗を見ることは出来ないです。

```ts
// 進捗具合を canvas に描画
const ctx = canvasRef.current?.getContext('2d')
```

## WebM 書き込みをつくる
ここが`WebM`を書き込むための処理を初期化している部分。  
`WebM`ファイルに限らず、コンテナフォーマットは`動画情報（映像情報+音声情報+etc）`と、`エンコード済みデータ（時間と共に増えていく）`の2つに大別することが出来ます。  
ので、おそらく他の`WebM`書き込みライブラリだとしても、まず最初に`映像トラック・音声トラック`の情報を入れると思います。

```ts
// WebM に書き込むクラス作成 + 映像トラック追加 + 音声トラック追加
const muxerRef = createMuxerWebm()
setVideoTrack(muxerRef, videoWidth, videoHeight)
if (hasAudioTrack && samplingRateOrNull && channelCountOrNull) {
    setAudioTrack(muxerRef, samplingRateOrNull, channelCountOrNull)
}
```

## 映像トラックを逆にする処理
関数の中に関数を書いて複雑になってきた。関数の中に関数を定義したので、これまでに作った変数は引き続き参照できます。  
関数に分けたのは変数名の名前が被るから。でも`if`とかでスコープがすぐ切れるのであんまり意味なかったかも。

```ts
/** 映像トラックを逆からデコードしてエンコードする処理 */
async function processVideoTrack() {
    // WebCodecs のコールバックを Promise にする
    let decoderOutput: ((videoFrame: VideoFrame) => void) = () => { }
    let encoderOutput: ((chunk: EncodedVideoChunk) => void) = () => { }

    // 映像エンコーダー・デコーダー用意
    const videoDecoder = new VideoDecoder({
        error: (err) => { alert('映像デコーダーでエラーが発生しました') },
        output: (videoFrame) => { decoderOutput(videoFrame) }
    })
    videoDecoder.configure({
        codec: 'vp09.00.10.08',
        codedHeight: videoHeight,
        codedWidth: videoWidth
    })
    const videoEncoder = new VideoEncoder({
        error: (err) => { alert('映像エンコーダーでエラーが発生しました') },
        output: (chunk) => { encoderOutput(chunk) }
    })
    videoEncoder.configure({
        codec: 'vp09.00.10.08',
        height: videoHeight,
        width: videoWidth,
        framerate: 30
    })

    // コールバックを Proimise にする関数
    function awaitDecoderOutput() {
        return new Promise<VideoFrame>((resolve) => {
            decoderOutput = (videoFrame) => {
                resolve(videoFrame)
            }
        })
    }
    function awaitEncoderOutput() {
        return new Promise<EncodedVideoChunk>((resolve) => {
            encoderOutput = (chunk) => {
                resolve(chunk)
            }
        })
    }

    // エンコードされているデータを逆からデコードして、エンコーダーに突っ込む
    // 単位はマイクロ秒
    for (let frameIndex = videoTrackEncodeDataList.length - 1; frameIndex >= 0; frameIndex--) {
        const encodeChunkData = videoTrackEncodeDataList[frameIndex]
        const frameMs = Number(encodeChunkData.time)

        // キーフレームじゃない場合はキーフレームまで戻る
        if (!encodeChunkData.isKeyFrame) {
            const keyFrameIndex = videoTrackEncodeDataList.findLastIndex((chunk) => chunk.isKeyFrame && chunk.time < frameMs)
            for (let iFrameIndex = keyFrameIndex; iFrameIndex < frameIndex; iFrameIndex++) {
                const iFrameChunk = videoTrackEncodeDataList[iFrameIndex]
                const iFrameVideoChunk = new EncodedVideoChunk({
                    data: new Int8Array(iFrameChunk.encodeData as any).buffer as any,
                    timestamp: (durationMs - Number(iFrameChunk.time)) * 1_000,
                    type: iFrameChunk.isKeyFrame ? 'key' : 'delta'
                })
                // デコーダー出力の Promise を待つが特に使わずに close()
                const promise = awaitDecoderOutput()
                videoDecoder.decode(iFrameVideoChunk)
                const unUseVideoFrame = await promise
                unUseVideoFrame?.close()
            }
        }

        // 戻ったのででデコード
        const videoChunk = new EncodedVideoChunk({
            data: new Int8Array(encodeChunkData.encodeData as any).buffer as any,
            timestamp: (durationMs - Number(encodeChunkData.time)) * 1_000,
            type: encodeChunkData.isKeyFrame ? 'key' : 'delta'
        })

        // Promise を作ってデコーダーに入れた後 await 待つ
        const videoFramePromise = awaitDecoderOutput()
        videoDecoder.decode(videoChunk)
        const videoFrame = await videoFramePromise

        // プレビュー、アスペクト比を保持して拡大縮小
        // https://stackoverflow.com/questions/23104582/
        if (canvasRef.current) {
            var hRatio = canvasRef.current.width / videoFrame.displayWidth
            var vRatio = canvasRef.current.height / videoFrame.displayHeight
            var ratio = Math.min(hRatio, vRatio)
            ctx?.drawImage(videoFrame, 0, 0, videoFrame.displayWidth, videoFrame.displayHeight, 0, 0, videoFrame.displayWidth * ratio, videoFrame.displayHeight * ratio)
        }

        // 逆からとったフレームをエンコーダーに入れて待つ
        const chunkPromise = awaitEncoderOutput()
        videoEncoder.encode(videoFrame)
        const chunk = await chunkPromise

        // エンコード結果を WebM に書き込む
        const frameData = new Uint8Array(chunk.byteLength)
        chunk.copyTo(frameData)
        writeVideoTrack(muxerRef, frameData as any, chunk.timestamp / 1_000, chunk.type === "key", false)
        videoFrame.close()
    }

    // リソース解放
    videoDecoder.close()
    videoEncoder.close()
}
```

### 映像エンコーダー、デコーダーを用意し Promise にする
`VideoEncoder`と`VideoDecoder`を作ります。  
エンコーダーの方のコールバックは`EncodedVideoChunk`がもらえます。これを`WebM`に書き込む。  
デコーダーの方は`VideoFrame`が取得できます。これをエンコーダーに入れてエンコードしたり、`<canvas>`に書くことが出来る。

同様に`Promise`にします。  
ループ内でエンコーダー、デコーダーから出てくるまで`await`するような処理が書きたくて！！

どこかで書いたかもしれないですが、面倒なので`VP9`コーデック決め打ちです。

```ts
// WebCodecs のコールバックを Promise にする
let decoderOutput: ((videoFrame: VideoFrame) => void) = () => { }
let encoderOutput: ((chunk: EncodedVideoChunk) => void) = () => { }

// 映像エンコーダー・デコーダー用意
const videoDecoder = new VideoDecoder({
    error: (err) => { alert('映像デコーダーでエラーが発生しました') },
    output: (videoFrame) => { decoderOutput(videoFrame) }
})
videoDecoder.configure({
    codec: 'vp09.00.10.08',
    codedHeight: videoHeight,
    codedWidth: videoWidth
})
const videoEncoder = new VideoEncoder({
    error: (err) => { alert('映像エンコーダーでエラーが発生しました') },
    output: (chunk) => { encoderOutput(chunk) }
})
videoEncoder.configure({
    codec: 'vp09.00.10.08',
    height: videoHeight,
    width: videoWidth,
    framerate: 30
})

// コールバックを Proimise にする関数
function awaitDecoderOutput() {
    return new Promise<VideoFrame>((resolve) => {
        decoderOutput = (videoFrame) => {
            resolve(videoFrame)
        }
    })
}
function awaitEncoderOutput() {
    return new Promise<EncodedVideoChunk>((resolve) => {
        encoderOutput = (chunk) => {
            resolve(chunk)
        }
    })
}
```

### 動画フレームを逆から取得してエンコードし直す処理
真髄の部分です。この画像と同じです。

![ぎゃくにする手順](https://oekakityou.negitoro.dev/resize/8d808930-6501-475b-8422-901a9556fae1.png)

ループを逆に回して、`if`でキーフレーム以外なら最寄りのキーフレームまで戻って、欲しいフレームが取得できたら、エンコーダーに入れて、`WebM`に書き込む。  
終わったら次のループ。。。。する処理。

おまけ程度に`<canvas>`に進行中のフレームを表示するように。あとキーフレームまで戻った処理のフレームは使わないので何もせずに`close()`しています。

```ts
// エンコードされているデータを逆からデコードして、エンコーダーに突っ込む
// 単位はマイクロ秒
for (let frameIndex = videoTrackEncodeDataList.length - 1; frameIndex >= 0; frameIndex--) {
    const encodeChunkData = videoTrackEncodeDataList[frameIndex]
    const frameMs = Number(encodeChunkData.time)

    // キーフレームじゃない場合はキーフレームまで戻る
    if (!encodeChunkData.isKeyFrame) {
        const keyFrameIndex = videoTrackEncodeDataList.findLastIndex((chunk) => chunk.isKeyFrame && chunk.time < frameMs)
        for (let iFrameIndex = keyFrameIndex; iFrameIndex < frameIndex; iFrameIndex++) {
            const iFrameChunk = videoTrackEncodeDataList[iFrameIndex]
            const iFrameVideoChunk = new EncodedVideoChunk({
                data: new Int8Array(iFrameChunk.encodeData as any).buffer as any,
                timestamp: (durationMs - Number(iFrameChunk.time)) * 1_000,
                type: iFrameChunk.isKeyFrame ? 'key' : 'delta'
            })
            // デコーダー出力の Promise を待つが特に使わずに close()
            const promise = awaitDecoderOutput()
            videoDecoder.decode(iFrameVideoChunk)
            const unUseVideoFrame = await promise
            unUseVideoFrame?.close()
        }
    }

    // 戻ったのででデコード
    const videoChunk = new EncodedVideoChunk({
        data: new Int8Array(encodeChunkData.encodeData as any).buffer as any,
        timestamp: (durationMs - Number(encodeChunkData.time)) * 1_000,
        type: encodeChunkData.isKeyFrame ? 'key' : 'delta'
    })

    // Promise を作ってデコーダーに入れた後 await 待つ
    const videoFramePromise = awaitDecoderOutput()
    videoDecoder.decode(videoChunk)
    const videoFrame = await videoFramePromise

    // プレビュー、アスペクト比を保持して拡大縮小
    // https://stackoverflow.com/questions/23104582/
    if (canvasRef.current) {
        var hRatio = canvasRef.current.width / videoFrame.displayWidth
        var vRatio = canvasRef.current.height / videoFrame.displayHeight
        var ratio = Math.min(hRatio, vRatio)
        ctx?.drawImage(videoFrame, 0, 0, videoFrame.displayWidth, videoFrame.displayHeight, 0, 0, videoFrame.displayWidth * ratio, videoFrame.displayHeight * ratio)
    }

    // 逆からとったフレームをエンコーダーに入れて待つ
    const chunkPromise = awaitEncoderOutput()
    videoEncoder.encode(videoFrame)
    const chunk = await chunkPromise

    // エンコード結果を WebM に書き込む
    const frameData = new Uint8Array(chunk.byteLength)
    chunk.copyTo(frameData)
    writeVideoTrack(muxerRef, frameData as any, chunk.timestamp / 1_000, chunk.type === "key", false)
    videoFrame.close()
}
```

### 映像側リソース解放
おつ ﾉｼ

```ts
// リソース解放
videoDecoder.close()
videoEncoder.close()
```

## 音声トラックを逆にする処理
こっちは作戦を変えて、一度にすべてデコードしきって、そのあと逆さまにして、エンコーダーに突っ込むことにします。  
これも解説していきます。

```ts
/** 音声トラックをデコードしたあと、逆からエンコードする処理 */
async function processAudioTrack() {
    // 音声トラックがない場合は return
    if (!hasAudioTrack) return
    if (!samplingRateOrNull) return
    if (!channelCountOrNull) return

    // VideoCodec コールバック
    let decoderOutput: (audioData: AudioData) => void = () => { }
    let encoderOutput: (chunk: EncodedAudioChunk) => void = () => { }

    // エンコーダー・デコーダー用意
    const audioDecoder = new AudioDecoder({
        error: (err) => { alert('音声デコーダーでエラーが発生しました') },
        output: (audioData) => { decoderOutput(audioData) }
    })
    audioDecoder.configure({
        codec: 'opus',
        sampleRate: samplingRateOrNull,
        numberOfChannels: channelCountOrNull
    })
    const audioEncoder = new AudioEncoder({
        error: (err) => { alert('音声エンコーダーでエラーが発生しました') },
        output: (chunk, metadata) => { encoderOutput(chunk) }
    })
    audioEncoder.configure({
        codec: 'opus',
        sampleRate: samplingRateOrNull,
        numberOfChannels: channelCountOrNull
    })

    // コールバックを Promise にする
    function awaitDecoderOutput() {
        return new Promise<AudioData>((resolve) => {
            decoderOutput = (audioData) => {
                resolve(audioData)
            }
        })
    }
    function awaitEncoderOutput() {
        return new Promise<EncodedAudioChunk>((resolve) => {
            encoderOutput = (chunk) => {
                resolve(chunk)
            }
        })
    }

    /**
     * [1,2,3,4,5,6] を size の数で二重の配列にする
     * 2 の場合は [[1,2],[3,4],[5,6]] する
     */
    function chunked<T>(origin: T[], size: number) {
        return origin
            .map((_, i) => i % size === 0 ? origin.slice(i, i + size) : null)
            .filter((nullabeList) => nullabeList !== null)
    }

    // 音声の場合はとりあえずすべてのデータをデコードしちゃう
    const decodeAudioList: AudioData[] = []
    for (const audioChunk of audioTrackEncodeDataList) {
        const encodeChunk = new EncodedAudioChunk({
            data: new Int8Array(audioChunk.encodeData as any).buffer as any,
            timestamp: Number(audioChunk.time) * 1_000,
            type: audioChunk.isKeyFrame ? 'key' : 'delta' // 音声は常にキーフレームかも
        })
        const audioDataPromise = awaitDecoderOutput()
        audioDecoder.decode(encodeChunk)

        // 一旦配列に。後で配列で使うので close() しない
        const audioData = await audioDataPromise
        decodeAudioList.push(audioData)
    }

    // デコードした音声データ（PCM）を逆にする。まずは全部くっつけて一つの配列に
    const pcmDataList = decodeAudioList
        .map((audioData) => {
            const float32Array = new Float32Array(audioData.numberOfFrames * audioData.numberOfChannels)
            audioData.copyTo(float32Array, { planeIndex: 0 })
            return Array.from(float32Array)
        })
        .flat()

    // 次に reverse() するのだが、このときチャンネル数を考慮する必要がある
    // 2チャンネルなら [[右,左],[右,左],[右,左],] のように、ペアにした後に reverse() する必要がある
    // flat() で戻す
    const channelReversePcmList = chunked(pcmDataList, channelCountOrNull).reverse().flat()

    // WebM に一度に書き込むサイズ、どれくらいが良いのか知らないので 20ms 間隔にしてみた
    // 10ms とか 2ms とかの小さすぎるとエンコーダーに入れても何もでてこなくなる
    // 暗黙的に最小バッファサイズ的なのが？あるはず？
    const ENCODE_FRAME_SIZE = ((48_000 * channelCountOrNull) / 1_000) * 20
    const chunkedPcmList = chunked(channelReversePcmList, ENCODE_FRAME_SIZE)

    // for でエンコーダーへ
    let timestamp = 0
    for (const pcmList of chunkedPcmList) {
        // エンコードする
        const reversePcm = new AudioData({
            data: Float32Array.of(...pcmList),
            format: 'f32',
            timestamp: timestamp * 1_000,
            numberOfFrames: (pcmList.length / channelCountOrNull), // [右,左,右,左] になっているので、フレーム数を数える時は 右左 のペアで
            numberOfChannels: channelCountOrNull,
            sampleRate: 48_000
        })
        timestamp += ENCODE_FRAME_SIZE
        const chunkPromise = awaitEncoderOutput()
        audioEncoder.encode(reversePcm)
        const chunk = await chunkPromise

        // WebM に入れる
        const frameData = new Uint8Array(chunk.byteLength)
        chunk.copyTo(frameData)
        writeAudioTrack(muxerRef, frameData as any, chunk.timestamp / 1_000, chunk.type === "key")
    }

    // リソース解放
    decodeAudioList.forEach((audioData) => audioData.close())
    audioDecoder.close()
    audioEncoder.close()
}
```

### 音声エンコーダー・デコーダーを用意し Promise にする
もう映像と同じです。コールバックで返ってくる値が違うくらい。  
デコーダーからは`AudioData`がもらえます。これが`PCM`と呼ばれるやつになるかな。  
エンコーダーからもらえる`EncodedAudioChunk`では、映像と同じように`WebM`に書き込むために使います。

```ts
// 音声トラックがない場合は return
if (!hasAudioTrack) return
if (!samplingRateOrNull) return
if (!channelCountOrNull) return

// VideoCodec コールバック
let decoderOutput: (audioData: AudioData) => void = () => { }
let encoderOutput: (chunk: EncodedAudioChunk) => void = () => { }

// エンコーダー・デコーダー用意
const audioDecoder = new AudioDecoder({
    error: (err) => { alert('音声デコーダーでエラーが発生しました') },
    output: (audioData) => { decoderOutput(audioData) }
})
audioDecoder.configure({
    codec: 'opus',
    sampleRate: samplingRateOrNull,
    numberOfChannels: channelCountOrNull
})
const audioEncoder = new AudioEncoder({
    error: (err) => { alert('音声エンコーダーでエラーが発生しました') },
    output: (chunk, metadata) => { encoderOutput(chunk) }
})
audioEncoder.configure({
    codec: 'opus',
    sampleRate: samplingRateOrNull,
    numberOfChannels: channelCountOrNull
})

// コールバックを Promise にする
function awaitDecoderOutput() {
    return new Promise<AudioData>((resolve) => {
        decoderOutput = (audioData) => {
            resolve(audioData)
        }
    })
}
function awaitEncoderOutput() {
    return new Promise<EncodedAudioChunk>((resolve) => {
        encoderOutput = (chunk) => {
            resolve(chunk)
        }
    })
}
```

### ユーティリティ関数
コメントに書いてあるような動作をする関数です。`Kotlin`にある`chunked`、`lodash`にある`chunk`みたいな。

```ts
/**
 * [1,2,3,4,5,6] を size の数で二重の配列にする
 * 2 の場合は [[1,2],[3,4],[5,6]] する
 */
function chunked<T>(origin: T[], size: number) {
    return origin
        .map((_, i) => i % size === 0 ? origin.slice(i, i + size) : null)
        .filter((nullabeList) => nullabeList !== null)
}
```

元ネタはすたっくおーばーふろー。

### 全部の音声をデコードする処理
とりあえずすべてデコードします。`Opus`をデコードしたので`PCM`が取得できます。  
終わったら一旦配列に入れます。`PCM`くらいなら全部メモリに乗せても行けるはず（なおメモリ高騰）

```ts
// 音声の場合はとりあえずすべてのデータをデコードしちゃう
const decodeAudioList: AudioData[] = []
for (const audioChunk of audioTrackEncodeDataList) {
    const encodeChunk = new EncodedAudioChunk({
        data: new Int8Array(audioChunk.encodeData as any).buffer as any,
        timestamp: Number(audioChunk.time) * 1_000,
        type: audioChunk.isKeyFrame ? 'key' : 'delta' // 音声は常にキーフレームかも
    })
    const audioDataPromise = awaitDecoderOutput()
    audioDecoder.decode(encodeChunk)

    // 一旦配列に。後で配列で使うので close() しない
    const audioData = await audioDataPromise
    decodeAudioList.push(audioData)
}
```

### 音声を逆さまにする処理
音声を逆にすると言っても、いくつか考慮する必要があり、クソ長読む気を起こさせないコメントが書いてあります。

まずは`AudioData`から実際のバイト配列を得ます。`number[]`が欲しい。`copyTo()`で`AudioData`から`バイト配列`、`PCM`ですね。取得できます。  
このままでは`Float32Array[]`の配列になるので、`Array.from`でなんかいい感じにします。

次に、ついに逆にする処理です。真骨頂ですね。  
さっき作った`chunked()`を呼び出して、チャンネル数でグループ化した配列にします。ステレオなら`2ch`ですので、`[[1,2],[3,4]]`となります。  
なぜこれが必要かと言うと、音声データ（`PCM`）は`2ch`の場合`右,左,右,左,,,`と言った感じに並んでいるためで、右と左をワンセットにした状態でひっくり返す必要があるためです。  
これでひっくり返して、`flat()`すると期待通り`PCM`がひっくり返る。

最後に、一度にエンコーダーに入れるサイズを計算し、それでもう一回グループ化します。  
というのも、映像の場合は`VideoFrame`を作って入れるだけなので、エンコーダーに入れるサイズに関して考えることはないと思います。
一方、音声の場合はある程度まとまった時間（`20ms`とか）ごとに分けて入れて上げる必要があります。世の中の`WebM`ファイルがそうしている。

![mkvtoolnix](https://oekakityou.negitoro.dev/original/8750bfc2-ecce-42c2-a9e2-5f4a09adb1ed.png)

これは`MKVToolNix`っていう`WebM`をパースして表示してくれるガチ有能`GUI`アプリ（なんと日本語対応）  

```ts
// デコードした音声データ（PCM）を逆にする。まずは全部くっつけて一つの配列に
const pcmDataList = decodeAudioList
    .map((audioData) => {
        const float32Array = new Float32Array(audioData.numberOfFrames * audioData.numberOfChannels)
        audioData.copyTo(float32Array, { planeIndex: 0 })
        return Array.from(float32Array)
    })
    .flat()

// 次に reverse() するのだが、このときチャンネル数を考慮する必要がある
// 2チャンネルなら [[右,左],[右,左],[右,左],] のように、ペアにした後に reverse() する必要がある
// flat() で戻す
const channelReversePcmList = chunked(pcmDataList, channelCountOrNull).reverse().flat()

// WebM に一度に書き込むサイズ、どれくらいが良いのか知らないので 20ms 間隔にしてみた
// 10ms とか 2ms とかの小さすぎるとエンコーダーに入れても何もでてこなくなる
// 暗黙的に最小バッファサイズ的なのが？あるはず？
const ENCODE_FRAME_SIZE = ((samplingRateOrNull * channelCountOrNull) / 1_000) * 20
const chunkedPcmList = chunked(channelReversePcmList, ENCODE_FRAME_SIZE)
```

### 音声をエンコード
映像の逆と同じ。もう音声のデータ（`PCM`）しか持っていないため、`AudioData`を作るところから始まります。  
`data`に逆にした`PCM`（`number[]`）を、`format`はよく分からず使ってる`Float32`、`timestamp`は時間です。マイクロ秒です。  
`numberOfFrames`は`data`内のサンプリング数です。`右,左`で`1サンプル`なのでチャンネル数で割れば良いはず。`numberOfChannels`はチャンネル数です。  
`sampleRate`はサンプリングレートです。

エンコーダーに入れてでてきたら同様に`WebM`に書き込みます。

```ts
// for でエンコーダーへ
let timestamp = 0
for (const pcmList of chunkedPcmList) {
    // エンコードする
    const reversePcm = new AudioData({
        data: Float32Array.of(...pcmList),
        format: 'f32',
        timestamp: timestamp * 1_000,
        numberOfFrames: (pcmList.length / channelCountOrNull), // [右,左,右,左] になっているので、フレーム数を数える時は 右左 のペアで
        numberOfChannels: channelCountOrNull,
        sampleRate: samplingRateOrNull
    })
    timestamp += ENCODE_FRAME_SIZE
    const chunkPromise = awaitEncoderOutput()
    audioEncoder.encode(reversePcm)
    const chunk = await chunkPromise

    // WebM に入れる
    const frameData = new Uint8Array(chunk.byteLength)
    chunk.copyTo(frameData)
    writeAudioTrack(muxerRef, frameData as any, chunk.timestamp / 1_000, chunk.type === "key")
}
```

### 音声のリソース解放
`AudioData`をここまで付き合わせたので破棄します。

```ts
// リソース解放
decodeAudioList.forEach((audioData) => audioData.close())
audioDecoder.close()
audioEncoder.close()
```

## 上記2つの関数を呼び出す
映像トラックを逆にする関数、音声トラックを逆にする関数をそれぞれ呼び出します。  
直列にしているのですが、`WebCodecs API`自体はコールバックの`API`なので並列にも出来るかもしれません。ただ自作の`WebM`書き込みが並列で行えるかは自信ないので（お前が書いただろうに）

```ts
// それぞれの処理を待つ
await processVideoTrack()
await processAudioTrack()
```

関数自体をそれぞれ分けたの、名前が被るかなーくらいだったんですけど、外に出しちゃうとデバッグしにくいから中が良いと思う。どっちか片方のトラックで試せる。

## WebM を完成させて保存する
自作`WebM`書き込みライブラリではこの辺の処理につながります。  
↓  
https://github.com/takusan23/HimariWebmKotlinMultiplatform/blob/7618dbb04bc5d92247b12ab863e36d049b35cbeb/library/src/wasmJsMain/kotlin/io/github/takusan23/himariwebmkotlinmultiplatform/ExportMuxer.kt#L57  
↓  
https://github.com/takusan23/HimariWebmKotlinMultiplatform/blob/7618dbb04bc5d92247b12ab863e36d049b35cbeb/library/src/commonMain/kotlin/io/github/takusan23/himariwebmkotlinmultiplatform/HimariWebmBuilder.kt#L112

`WebM`データの`バイト配列`が手に入るので、これを`Blob`にして、`<a> タグ`を使ってダウンロードする技を使い保存します。

```ts
// 書き込みが終わったため WebM ファイルを完成させる
const byteArray = muxerBuild(muxerRef)
const jsByteArray = new Int8Array(byteArray as any)

// ダウンロード
const blob = new Blob([jsByteArray], { type: 'video/webm' })
const blobUrl = URL.createObjectURL(blob)
const anchor = document.createElement('a')
anchor.href = blobUrl
anchor.download = `webcodecs-reverse-video-${Date.now()}.webm`
document.body.appendChild(anchor)
anchor.click()
anchor.remove()
```

# 逆再生の動画を作ってみる
雑ですが解説は以上です。  
コンポーネントを`page.tsx`等に置いて早速使ってみましょう。

```tsx
import ReverseVideoMaker from "./ReverseVideoMaker";

export default function Home() {
  return (
    <div className="flex flex-col p-2 space-y-2">
      <h1 className="text-4xl">WebCodecs + WebM サイト</h1>

      <ReverseVideoMaker />
    </div>
  )
}
```

`<input>`を押して`WebM`ファイルを選ぶと・・・動いています！

![動いてる](https://oekakityou.negitoro.dev/resize/124881f0-d9bd-4628-b3f1-4f4b64265d7e.png)

![保存](https://oekakityou.negitoro.dev/resize/271040b2-71fd-41a7-ba7d-58bcb0baf4bb.png)

なぜか`Firefox`では動きません（？）

# 完成品
見た目こそ違いますが、中身のコードは同じです。

https://webm.negitoro.dev/

# ソースコード
https://github.com/takusan23/nextjs-webcodecs-webm

冒頭の`webm.negitoro.dev`の方はこっち

https://github.com/takusan23/webm-kotlin-wasm-nextjs

# WebCodecs API よくある質問
でしゃばってると詳しい人に見つかりそうなので大人しくします

## MP4 を扱うには
`H264`と`AAC`をサポートしているか確認（してるの？見てない）して、あとは`MP4`の読み書きライブラリを入れるなりすれば出来るんじゃない？

## PCM を再生したい
`WebAudioAPI`？で、`PCM 音声`を再生する方法が使えるはず。  
ダウンロード出来るなら`ffplay`や`Audacity`でも見れるはず（ただしサンプリングレート、チャンネル数、ビット深度は指定する必要あり）

## エンコードした音声が速い
サンプリングレート・チャンネル数・ビット深度のどれかを間違えている？

## canvas に描画してるけど超速い
`30fps`なら`33ms`（`1000ms / 30`）、`60fps`なら`16ms`（`1000ms / 60`）、`setTimeout()`で待つ必要があります。（フレームを出し続ける必要があります）

## AudioEncoder のコールバックが呼ばれない
少なくとも`20ミリ秒`分の`PCM`データがないと何もでてこなくなる？

## TypeError: Failed to construct 'AudioData': data is too small
エラー通りで、`numberOfFrame`と`numberOfChannels`を掛け算した値よりも、`data: `の`Float32Array`の件数が少ない

## 突然動かなくなった
`Chrome`や`Firefox`を一旦閉じると良さそう

## VideoDecoder のコールバックが呼ばれない
妥協案としてソフトウェアデコーダーを指定すると良いかも。効率はすごく悪くなるけど。。。

```ts
videoDecoder.configure({
    codec: 'vp09.00.10.08',
    codedHeight: 1080,
    codedWidth: 1920,
    hardwareAcceleration: 'prefer-software' // これ
})
```

ソフトウェア、つまり`CPU`で処理するので`GPU`は遊ぶことになります。

![CPU](https://oekakityou.negitoro.dev/original/2c9a97b6-1720-43f0-8f26-4cd692f26e8a.png)

## Firefox Encoder 系が動かない
私も知りたい

# おまけ
![えらー](https://oekakityou.negitoro.dev/resize/274db933-41ab-4e9c-be68-dd960969d109.png)

`MediaRecorder API`や無効な動画を吐き出したり、`WebCodecs API`からコールバックが呼ばれなくなったら一回`Chrome`を全部閉じると良いかもしれません。  
リロードしまくってるとなんか壊れる？

# 画面が固まる
ちなみに`WebWorker`を使わずに作ってしまったので、メインスレッドが固まるので、画面がガタガタになります。  
`WebCodecs API`自体はコールバックで作られているためメインスレッドでも問題ないでしょうが、`WebM`読み書きはメインスレッドでやっているのでそこが**多分重たい・・・**

# おわりに1
`caniuse`にある通り、`Android Chrome`でも動きます。ただ、`WebCodecs API`は（も）もれなく`Secure Contexts`を必要とします。  
よって`localhost`では動きますが、スマホからアクセスするための`ローカルIPアドレス指定`では動きません。`is not defined`エラーになるんじゃないでしょうか。

![webcodecs_android_chrome](https://oekakityou.negitoro.dev/resize/6149924f-a2df-44a4-abee-474c37b42e3b.png)

![webcodecs_android_chrome](https://oekakityou.negitoro.dev/resize/465686b7-9c3e-4599-9ec9-b96ddb9e9ebb.png)

どうすればいいのかもぱっとは知らないです

# おわりに2
`WebCodecs API`、`Android ブラウザ`だと十中八九`MediaCodec API`を使って実装されてると思うので、なんかよくわからない`MediaCodec`のエラーに苦しみそう。  
`GPU`違いで端末を揃えてチャレンジだ！

`Android`で動かないなら、とりあえず縦横サイズが`16`で割り切れる動画で試してみるとか、`1080p`、`2160p`みたいなメジャーな解像度でも試してみる等やってみてください。

# おわりに3
動画編集で`WebCodecs API`を使いたいならまだ厳しい。  
`WebM`等のコンテナフォーマットを読み書きする処理を`自前で作る`or`ライブラリを入れる`のどっちがが必要。まじで`エンコーダー・デコーダー`しかない。

# おわりに4
このネタは会社のLTでネタにしたやつです。どこかは内緒で :pray: