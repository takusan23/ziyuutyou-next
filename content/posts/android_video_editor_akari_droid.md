---
title: Android で動く動画編集アプリを作ってみた感想
created_at: 2024-04-06
tags:
- Android
- Kotlin
- MediaCodec
---

どうもこんばんわ。  
D.C.5 Future Link ～ダ・カーポ5～ フューチャーリンク 攻略しました。（ぜんねんれい）  

ファンディスクです。前作`D.C.5`では良くも悪くも（？）あのイベントにシナリオが引っ張られてた感があったけど、  
今回はそれがなくて（？）ヒロインに合ったシナリオでかわいいな～ってなれる神ゲー。

あたしちゃん様！！！さすがファンディスクです  

![Imgur](https://i.imgur.com/UcdYRWB.png)

![Imgur](https://i.imgur.com/TQ9dPBV.png)

↑妹と話してるシーンよすぎ

![Imgur](https://i.imgur.com/eNeXwYf.png)

！！！ヒロイン昇格！！  
バカやってるのおもろい。無印では見れないのでファンディスクやろう！！！

![Imgur](https://i.imgur.com/461wagY.png)

![Imgur](https://i.imgur.com/n2GMb6x.png)

↑ここすき

![Imgur](https://i.imgur.com/b2j71Uo.png)

ファンディスクの割にフルプライスでお高いけどこのシナリオで元取った感ある！！  
いい！

![Imgur](https://i.imgur.com/EsgZDEG.png)

むんむん  
かわい～、イベントCGよすぎ

![Imgur](https://i.imgur.com/dUa3GnA.png)

![Imgur](https://i.imgur.com/dcXSbqD.png)

でもみじか！！い！！もっと見たかった

![Imgur](https://i.imgur.com/xS0uB8b.png)

体操服！

！！！本編では語られなかった部分の話、、だ！  
あまあま

![Imgur](https://i.imgur.com/JHuA82C.png)

![Imgur](https://i.imgur.com/02DlMWL.png)

本編で書かれなかった部分、なかなか内容あるので見よう

![Imgur](https://i.imgur.com/NSrNL4M.png)

![Imgur](https://i.imgur.com/7y5E1yW.png)

うどんの話ししてる時に時そばだ

語られなかった部分の続きまで書いてくれるので結構ボリュームがある。  
めっちゃ魔法の話でした

![Imgur](https://i.imgur.com/o5XBoGP.png)

ついぞこの子を攻略することは出来ませんでしたが・・・！！

![Imgur](https://i.imgur.com/agX9c10.png)

まだ謎が明かされてない箇所がありますが、`D.C.6`とかで明かされるんでしょうか。  
何年後になるんだろう、、`R-18`版を出してからなのかな、どっちになるか分かんないけど楽しみ～

# 本題
動画編集アプリを作ってみた。  
かねてより`AviUtil`とかの動画編集アプリってどうなってるんだろうって気になってたんですよね。大した機能はないですが、悲願であったアプリを作ることが出来ました。8888  
（まあプラットフォーム違うからなんとも言えんけど）。  

世の動画アプリの仕組みは知りませんが（バックエンドなのか端末内なのか）、このアプリは後者、端末内の`MediaCodec`でエンコードしています。  
触ったことある動画編集アプリが`AviUtil`くらいしかないので、スマホの動画編集`UI`がどんな感じなのかは知らない。電気屋の`Appleコーナー`で`iMovie`ちょっと触った程度ならあるよ。  

![Imgur](https://i.imgur.com/RrwLOFf.png)

元ネタは多分この辺です：https://www.youtube.com/watch?v=ExOT03rhCyU

![Imgur](https://i.imgur.com/jrpbcq7.png)

![Imgur](https://i.imgur.com/8Nht6zM.png)

`MediaCodec`シリーズの記事を書いてきた知見を合わせて作ってみた。  
今回の記事はこれの中身の話です。

- 動画周りの話。`MediaCodec`（とその周辺）を触るうえでの前提の話です。
- `Android`で動画編集の話
    - 何を自前で実装しないといけないか
- あかりどろいどのライブラリ、あかりこあ の話（`MavenCentral`にある）
- などなど...

# 実際に動画編集してみた感想
スマホじゃちっちゃい  
https://takusan.negitoro.dev/posts/android_akari_droid_create_video/

# ダウンロード
~~審査が通れば以下の URL で開けるはず。~~ 通りました。記事書くの遅すぎて先越されました。  
https://play.google.com/store/apps/details?id=io.github.takusan23.akaridroid

![Imgur](https://i.imgur.com/jN3gZCG.png)

ソースコードもあります。  
最新の`Android Studio`でビルドできるんじゃないかな。  
https://github.com/takusan23/AkariDroid

フォアグラウンドサービスの審査用の動画、実際にこのアプリで作りました。  
画面録画して編集して書き出してアップロードまでスマホで完結して結構感動。

![Imgur](https://i.imgur.com/uk9kwLp.png)

（補足）  
最近の`Play ストア`、`フォアグラウンドサービス`を使う場合は起動方法を説明した動画を渡す必要がある。（どこかインターネットから見れる場所に上げて`URL`を記入する）  
そのための動画をこれで作った。。。スマホで完結。

https://takusan.negitoro.dev/posts/android_foreground_service_permission_play_console/

# アプリの特徴
大した機能はない。

- 文字と画像と音声と動画をタイムラインに追加できる
    - 動画の上に動画を重ねるのも出来ます。がんばった
    - 動画、デコーダーが許す限り同時に表示できるんじゃないですかね
- 動画がなくても使えます
    - 文字だけ、画像だけ。でも利用できます
    - 世の動画編集アプリは最初に動画を選ばせている・・・？
- プレビュー
    - ちなみに4ぬほど遅い
- `MediaCodec`を叩いている
    - `Android`の`API`を叩いてるだけなので、インターネット接続も不要です。すてき
- タイムライン機能
    - 大したことは出来ない
    - 分割とかレイヤー機能のため
- 外部連携機能
    - 後述しますが、`Intent`の仕組みを使って他のアプリで素材を作ってタイムラインに追加できます
- 上級者向けではありますが、エンコーダーの設定とか
    - コーデック / コンテナ も選べるようにしました
    - `Pixel 8`なら`AV1`エンコードも夢じゃないかも
- undo / redo 機能
    - タイムラインのデータをイミュータブルで持ってるので、実装は難しくない、、、
        - データクラスをコピーしまくっている
        - メモリ的に良くないかな

# アプリの概要
あかりどろいどは、あかりこあとか言う`core`と、アプリのコードのふたつになっています。  
なんで分かれてるかというと、`core`の方はライブラリとして`MavenCentral`にあるからなんですね。

![Imgur](https://i.imgur.com/jSpEE1w.png)

あかりこあ`:akari-core`は代わりに`MediaCodec`を叩いてくれるやつです。  
叩いてくれるっても、このブログで扱ったことを集結させたくらいなので、地道にこれらを組み合わせていくしか無い。使用例はいつか書きます。

- https://github.com/takusan23/AkariDroid/blob/master/akari-core/src/main/java/io/github/takusan23/akaricore/video/README.md
- https://github.com/takusan23/AkariDroid/blob/master/akari-core/src/main/java/io/github/takusan23/akaricore/audio/README.md

例えば動画をつなげる機能はない。  
無いので、繋げたい動画のフレームを取り出し`Canvas`にかく。それを繋げたい動画が終わるまで続ける。みたいな。  
この程度なら`media3 transformer`でいい気がするけど、今回のそれはそもそも考え方が違うのでそれは後半。  
というかそもそも`alpha01`のままだわ。

```kotlin
implementation("io.github.takusan23:akaricore:2.0.0-alpha01")
```

`app`モジュールのほうがアプリのコードになってて、タイムラインの`UI`とか、プレビュー用の`UI`をこっちで書いています。  
2つもモジュールがあるので`Gradle Version Catalog`使ってみた。いつの間にか`IDE`のサポートが入ったのね。

で、この辺詳しく書こうと思ったんだけど、その前に動画周りの技術の話をしないとって思った。知ってる限りお話します。

# その前に動画周りの技術について
この話は、`Android`の`MediaCodec`の話ではなく、動画全般の話になります。  
が、`MediaCodec`/`MediaExtractor`/`MediaMuxer`が何をやるのかを理解するのには以下のキーワードが分からないと多分厳しいと思うので先に話します。

- コンテナ
    - トラック
- コーデック
    - エンコード・デコード
- 動画エンコーダー
    - フレーム
    - フレームレート
    - キーフレーム
    - ビットレート
- 音声エンコーダー
    - チャンネル数
    - サンプリングレート
    - 量子化ビット数
    - PCM

今日のテレビ会議から今晩のおかずまでを支える、動画の技術についてちょっとだけ触れます。

## コンテナの話
コンテナというのは、音声と映像を一つのファイルに格納するためのもので、`mp4`とか`webm`とか言うあれです。  
一緒にいれる箱でしか無いので、再生できるかどうかは中身次第になります。  

一緒に格納したらどれがどれだか分からなくなりそうですが、トラックという概念があり、このデータは音声トラック、このデータは映像トラックと分かるようになっています。  
ごくまれに、動画は流れるけど音量調整が出来ない動画がありますが、あれは映像トラックだけ再生できたパターンですね。音声トラックが無いのかエラーになったか。その逆もあると思う。

![Imgur](https://i.imgur.com/MxdNOCX.png)

`mp4`は知りませんが、`webm`ならこんな感じの構造だと思います。  
`Cluster`に音声と映像がそれぞれ書き込まれていくわけですね。多分映像データのが大きくなるのでこんな感じじゃないかな...

```plaintext
- demo.webm
    - Header
    - Segment
        - Info
            - Duration
        - Tracks
            - Track #映像
            - Track #音声
        - Cluster
            - SimpleBlock #映像データ
            - SimpleBlock #音声データ
            - SimpleBlock #映像データ
            - SimpleBlock #映像データ
            - SimpleBlock #映像データ
```

こう考えてみると、なんか意地悪したくなりますね。  
`mp4`に`AVC`じゃなくて`H.265（HEVC）`入れたいよね。拡張子さえ見ればいいと思っている人を騙せそう（性格悪すぎ）

そういえば、`Windows 11`にすると`H.265（HEVC）`が無料で使えるらしい。  
これでストアで数百円払わなくても再生できるぽい。  

https://learn.microsoft.com/ja-jp/windows/whats-new/whats-new-windows-11-version-22h2

### MediaExtractor
これは、`.mp4 / .webm`からそれぞれ音声と映像のデータを取り出すやつです。  
そのほか、メタデータを取り出したりもできます（動画の縦横サイズ、動画の長さなど）

以下は擬似コードなのでそれっぽいですが多分動きません。

```kotlin
// MediaExtractor を作る
val mediaExtractor = MediaExtractor()
// ファイルを読み込む
mediaExtractor.setDataSource(context, uri)

// 映像トラックとインデックス番号のPairを作って返す
// 音声の場合は audio/ を探す
val (trackIndex, mediaFormat) = (0 until mediaExtractor.trackCount)
    .map { index -> index to mediaExtractor.getTrackFormat(index) }
    .firstOrNull { (_, track) -> track.getString(MediaFormat.KEY_MIME)?.startsWith("video/") == true } ?: return@withContext null

// トラック番号を指定する
// 映像トラックの番号
mediaExtractor.selectTrack(trackIndex)

// 映像データを取り出す
// エンコードされている（圧縮されている）ので、MediaCodec に渡します
val byteBuffer = ByteBuffer.allocate(1024 * 4096)
val readSize = mediaExtractor.readSampleData(byteBuffer, offset)

// MediaCodec なり...
```

### MediaMuxer
`MediaExtractor`の逆です。データを書き込みます。  
これも以下は擬似コードなので動きません。

```kotlin
// MediaMuxer を作成
// 指定した Uri へ書き込む
val fileDescriptor = context.contentResolver.openFileDescriptor(uri, "r")
val mediaMuxer = MediaMuxer(fileDescriptor, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)

// 映像トラックを追加
val videoTrackIndex = mediaMuxer.addTrack(videoMediaFormat)

// 開始
mediaMuxer.start()

// データがでてきたら書き込む
val byteBuffer = // 出てきたデータ
val bufferInfo = // 今の動画の時間とか
mediaMuxer.writeSampleData(videoTrackIndex, byteBuffer, bufferInfo)
```

## コーデックの話
コーデックというのが、動画を圧縮するアルゴリズムのことですね。  
そのアルゴリズムを動かすのがエンコーダーとデコーダーで、圧縮するのをエンコード、圧縮を戻すのがデコードです。

### 動画エンコーダーの話

パラパラ漫画の一枚一枚のことを動画ではフレームとか呼んだり。そのフレームが一秒間に何回あるかがフレームレートですね。  
30fps なら 30 回フレームが切り替わりますし、120fps なら 120 回フレームが切り替わるわけですね。  
ちなみに、ミリ秒で表すと`30fps`は`33ミリ秒`毎に、`60fps`なら`16ミリ秒`毎に切り替わるわけです。すごいね。

で、で、で、動画はパラパラ漫画みたいになっていますが、パラパラ漫画のようにすべての画像を持っているといくら容量があっても足りません。  
てか容量だけじゃなくて通信量が先に終わってしまいます。  

![Imgur](https://i.imgur.com/bmMRThW.png)  
↑ 手元で見たら 1920x1080 の1フレームが 1MB だった。30fps なら1秒で 30MB になりますね。1分で・・・うっ  

そこで、コーデックが圧縮をするわけですね。例えば、前のフレームと比較して、変化している箇所のみをファイルに保存する。とか。  
ただ、一生前のフレームとの差分を持っていると、今度はシークができなくなってしまう（このままだと、ちょっと後ろに戻したいだけなのに、最初から差分を見ていく必要がある。）  
なので、前のフレームに依存しない、完全なフレームを定期的に入れるわけですね。1秒毎とか。これをキーフレームといい、間隔のことをキーフレーム間隔とかなんとか。  
（キーフレーム。別名同期フレーム、Iフレーム）

![Imgur](https://i.imgur.com/Uynkqke.png)  
↑ 前使ったやつを再利用。

（話はそれるけど）`Firefox`の自動再生がデフォルトONになる話で、仮にデフォルトOFFにしちゃうとパラパラ漫画を実装されて、かえって通信量が増えるからONにしてるって見た気がする。  
https://hacks.mozilla.org/2019/02/firefox-66-to-block-automatically-playing-audible-video-and-audio/#comment-24416

前のフレームとの差分しか持ってないから小さく出来てる。一方動画の逆再生がかなり難しいという話は前した気がする。  

コーデックにもいくつか種類があり、まず映像から。音声は後述。

- 映像
    - `AVC（H.264）`
        - 互換性最高。ただビットレートが高くないと画質があんまり
    - `HEVC（H.265）`
        - `AVC`の半分のビットレート（半分の容量・通信量）で同じ画質になるらしい
        - が、特許問題のせいで使っていいものなのか不明。
    - `VP9`
        - ロイヤリティティーフリーで安心
    - `AV1`
        -ロイヤリティティーフリーかつ`HEVC`と同等の効率らしい
        - でもハードウェアエンコードが無いとかなり厳しい雰囲気
            - （`Pixel 8`には`AV1 ハードウェアエンコーダー`あるけどそれ以外はまだなさそう。先取りだね）

あ、あとビットレートってのが1秒間にどれだけデータを使うかで、多ければ画質が上がります。  
音声なら 192kbps ？ か 128kbps。動画ならコーデックにもよるけど 10Mbps あれば高画質？

### 音声エンコーダーの話
次は音声エンコーダー周りの話。  
ビットレートは音声エンコーダーにもあるんですが、動画のそれと同じなので割愛。

チャンネル数はモノラルなら1、ステレオなら2です。  
モノラルの場合は左右から同じ音が、ステレオなら左右から違う音が出ます。まあほとんどステレオだと思います。  

サンプリングレートは、一秒間に何回音声を記録するか。で、  
44100 か 48000 の2つが多分主流です。ニコニ・コモンズとかにある音声素材は変なサンプリングレートのがあるけど。  
で、で、で、`Opus`とかいうコーデックが`44100`対応していないので、`48000`にしておくといいかも。  
（今回の動画編集アプリでは`48000`に統一した）

あと、量子化ビット数が音声データの記録に何バイト分使うかですね。まあ`16bit`（2バイト分）じゃないですかね。ほとんど。  

最後は`PCM`の話。これは音声データの生データのことを指します。  
`aac`や`opus`とかのファイルはエンコードされているので、デコードする（圧縮を戻す）ことで`PCM`を得ることが出来ます。

`0x00`で無音のデータを作ってみました。（`2チャンネル、16bit (2バイト)`）

```
0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00
```

↑実際のデータはこんな感じになってて、（`0x00`なので無音ですが）  
2バイトずつで見ていきます。最初の2バイトが左、次の2バイトが右の音声です（ごめん左右逆かも。）。2チャンネルあって、16bitなので、一回のサンプリングに4バイト(`2*2`)使うわけですね。
この例だと2つのサンプルしか無いですが、一秒間にサンプリングレートの回数分繰り返されるはずです。

繰り返されるだけなので、これは計算で`PCM`を作るのにどれだけの容量が必要か出すことが出来ます。  
例えば`チャンネル数 = 2 / サンプリングレート = 48000 / 量子化ビット数 = 16bit (2バイト)`なら、1秒間に `2 * 48000 * 2 = 192000 byte`ですね。  

音声コーデックはこんな感じ

- 音声
    - `AAC`
        - `mp4`の中に入ってる音声多分このコーデックがほとんどじゃない？
    - `Opus`
        - `WebM`に入る音声コーデックは`Android`で使えるやつだとこれだけ？
        - サンプリングレートは`44100`が使えないらしい（ので、`48000`になるようにサンプリングレートの変換が必要）

以上！今日の動画と音声の話！

# Android で動画編集
**は厳しい**。なぜならろくな`API`が存在しない。  
（最近`media3 transformer`が出たそうです。が、要件満たせなそうで`MediaCodec`叩いてる。ﾊﾞﾝﾊﾞﾝ）

本題です。  
`iOS`は`iPhone`普及期（まだ`iPhone`に機種変するなら、`iTunes`を動かすためのパソコンがないとダメって言われたた頃！）から`iMovie`とかいうアプリがあったので、動画編集周りは割とマシな`API`があるらしい？（`iPhone`には明るくないのでネット情報でしか無い）  

一方`Android`・・・？エンコードとデコードが出来る`MediaCodec`とかいうやつが`Android 5`くらいからあるけど、、、  
入力として音声ならバイト配列、映像なら`Surface`を受け付けて、エンコードしたデータを吐き出す。エンコードとデコードという最低限の機能しかない。  
（`Surface`ってのは、なんか映像を運ぶパイプみたいなやつ。カメラ映像とか再生中の動画フレームとか。これのおかげでバイト配列でやり取りしなくてすむ。）  
（ブラウザの`getUserMedia()`が`Stream`を返すじゃん、あれに近い。）

お友達に`MediaExtractor (コンテナフォーマットから取り出す)`と`MediaMuxer (コンテナフォーマットに書き込む)`がいるけど。。。

**動画を司る最低限の`API`ならあるけど、動画編集で使える`API`は無いので、全部自前で書かないといけない。**  
ちなみに、`MediaCodec`の`API`、すごいドキュメントが長いけど何も分からないが得られます。

- https://developer.android.com/reference/android/media/MediaCodec

# 今回の戦略
どうやって動画を作るか。編集するか。  

![Imgur](https://i.imgur.com/0Oq1Tyv.png)

というわけで今回の戦略。`Canvas`で動画のフレームを作って渡す。音声はデコードして合成する。  

そういえば、動画編集で言うと似たようなことを少し前に書きました、  
こちら、**動画の上に文字を重ねる**では`SurfaceTexture`を使って映像を渡しつつ、`Canvas`で落書きをするというのがあり、初期段階ではこれを使おうと思ってました。  
これ→ https://takusan.negitoro.dev/posts/android_add_canvas_text_to_video/  

（`SurfaceTexture`はカメラ映像とか動画のフレームを`OpenGL`のテクスチャとして使えるやつ。）

ただ、前書いた記事の方法では満たせない要件があったため、、、この方法は却下になり、作り直しになりました。

- **動画編集に動画が必要になってしまう**
    - 今回のアプリは動画なし（文字や画像だけで動画を作れるのが理想）で動かしたいので、前書いた記事の方法は却下です。
    - 解説動画とか、あれ動画無しで背景の画像と文字とBGMだけよね。動画なしでも使える動画編集アプリが作りたいの！
        - 写真だけのスライドショーとか動画いらないじゃん。あーゆーの
- 動画に動画を重ねることが出来ない
    - `AviUtil`とかはこの動画に動画を重ねたり、動画を2つ並べて再生が出来るので、この機能も実装したい。
    - けど、この方法だと出来ない。映像を渡す`SurfaceTexture`が一つしか無いので。
- **プレビューが難しい**
    - 動画編集に必要！！！
    - でもこの方法、`MediaCodec - Surface - OpenGL ES`みたいな感じで、エンコーダーと描画の`OpenGL ES`が強く紐付いちゃってます
    - プレビュー用に`OpenGL`をセットアップするのはやりたくない。。。
        - `OpenGL ES`詳しくないし
    - **そうなると、完全なプレビューは諦めて、動画プレイヤーとかで再生する必要がある**
        - 再生時間を監視して、それに応じて文字とか画像とかを書き込む`Canvas`も更新していく
        - ただ、これは**なんちゃってプレビュー**なので、映像と`Canvas`を重ねてエンコードした時のフレームに**限りなく近い**ものが表示されることになります。
            - エンコーダーの方は`MediaCodec - OpenGL ES`、プレビューの方はただ動画を流して上に`Canvas`を表示させているだけになってしまう
                - エンコードで使われるフレームと同じものを表示しているわけではないので。。。
- `Canvas`で作る方法が結構いいという確信がある
    - `Canvas`から動画を作る
        - https://takusan.negitoro.dev/posts/android_canvas_to_video/
        - これに成功したのがデカい
    - `MediaCodec`で逆再生の動画を作る
        - https://takusan.negitoro.dev/posts/android_mediacodec_reverse_video/
        - これは動画の全てのフレームを逆から取り出して、`Canvas`に書き込んでエンコードするというもの
            - これで、動画もフレームを取り出して`Canvas`に書けば、難しい`SurfaceTexture`周りを触らずに完結するという知見が得れた
            - ただ、`Android`の動画からフレームを取り出す`MediaMetadataRetriever`がとても遅いことも同時に判明
    - `MediaMetadataRetriever`が遅いので、`MediaCodec`を叩いて高速にフレームを取り出す処理を作る
        - https://takusan.negitoro.dev/posts/android_get_video_frame_mediacodec/
        - これのお陰で、逆再生の時に発覚したフレーム取得が遅い問題も解決した
            - `MediaMetadataRetriever`よりはずっと速いですが、それでもプレビューに数秒かかります。どうしよう。
    - `Canvas`で書けるなら動画編集アプリ行けるんじゃね？←これ

作戦変更後は、`Canvas`に動画のフレームを書き込む方法になります。  
`Canvas`は高レベルなのでメンテしやすそうなのと、上記の問題もほぼクリアできます。  

- 動画編集に動画が必要
    - 必要ない。`Canvas`に文字と画像を書いてエンコーダーに渡せばいい。
- 動画に動画を重ねられない
    - 重ねられる。動画のフレームを取り出して、`Canvas`で書けばいいので。
    - デコーダーの許す限り重ねられるんじゃないでしょうか。`Canvas`に書ければいいので
- プレビューが難しい
    - `Canvas`で描く処理を作るだけ！
        - プレビューの際は、`Canvas`で書いたのを`Bitmap`でもらって`Jetpack Compose`で書けばいい。
        - エンコードの際は、`Canvas`で書いたのを`Bitmap`にして`OpenGL ES`で描画した後エンコーダーに流せばいい。
    - `Canvas`で書く部分が、プレビューとエンコードで共通化出来たことにより、プレビューで使われるフレームは実際にエンコーダーにも送られるフレームになります。
        - おんなじになった！

プレビュー問題まで解決しちゃってよかった。なんちゃってプレビューではなく本当にエンコーダーに渡されるフレームを見ることが出来るようになりました。  
これで依存関係から`media3`を消せました。  
https://github.com/takusan23/AkariDroid/commit/8099545b2f3e11e2421bed3c5084a4cf076e58bb

具体的なコードはこの辺です。

- Canvas でフレームを書く
    - https://github.com/takusan23/AkariDroid/blob/master/app/src/main/java/io/github/takusan23/akaridroid/canvasrender/CanvasRender.kt
- 文字を書く
    - https://github.com/takusan23/AkariDroid/blob/master/app/src/main/java/io/github/takusan23/akaridroid/canvasrender/itemrender/TextRender.kt
- 動画を書く
    - https://github.com/takusan23/AkariDroid/blob/master/app/src/main/java/io/github/takusan23/akaridroid/canvasrender/itemrender/VideoRender.kt
- プレビュー
    - https://github.com/takusan23/AkariDroid/blob/master/app/src/main/java/io/github/takusan23/akaridroid/preview/VideoEditorPreviewPlayer.kt

ちなみに、`OpenGL ES`はハードウェアアクセラレーションされた描画システム？が`Android`の`MediaCodec`では必要なので、`OpenGL ES`から逃げることは出来ないぽい。  

# 自分で作らないと無い機能
動画編集`API`なんて無いので、自分で作る必要があるのですが、その中でも大変だったのを

## 音声のサンプリングレート変換
音声のサンプリングレート変換はありません。どこでサンプリングレート変換が必要かと言うと、無いとこの次の合成ができないんですよね。  
音は波（らしい）ので、同じ位置のデータをそのまま足し算すれば音を合成できるのですが、（`PCM 音声 合成`とかで調べてみて）  

```plaintext
// 16 bit と仮定

pcm1: 0x0001 0x0001 ...
pcm2: 0x0002 0x0002 ...
-------------------------
sum0: 0x0003 0x0003
```

この、足し算の際に合成したい音声のサンプリングレートをあわせておく必要があります。  
しないと音声が早くなったり遅くなったりして期待通りになりません。

というわけで、割と使いそうな気がするこのサンプリングレート変換する方法、`Android`にはありません！！！  
内部的にはあるんだろうけど、、、サードパーティ開発者が使えそうなのはなくて困った。

というわけで調べた。  
ちょうどその頃、`media3`もなんか動画変換処理を作ったとか言ってて（`media3 transformer`）、作ったってことはおそらくサンプリングレート変換がない問題を知ってるはずでしかも解決してそう！  
どうやってるんだろって見に行ったら`sonic`というのを使っていました。純粋な`Java`実装らしく、`Android`でも動いちゃいます。  

https://github.com/waywardgeek/sonic

というわけでサンプリングレート変換は`OSS`に頼りました。  
ありがとうございます。  
https://github.com/takusan23/AkariDroid/blob/master/akari-core/src/main/java/io/github/takusan23/akaricore/audio/ReSamplingRateProcessor.kt

ちなみに、元のサンプリングレートの取得で`Android`の`MediaExtractor`を使うと罠があります。前話した通りですが、`HE-AAC`を入れるとサンプリングレートが何故か半分になる。  
`MediaExtractor`の`MediaFormat`ではなく、`MediaCodec#getOutputFormat`の方のサンプリングレートは正解なので、そちらを信用する必要があります。（まじで謎）

https://takusan.negitoro.dev/posts/android_himari_droid/#mediaextractor-でサンプリングレートを取得すると半分になる

## 音声の合成も無い
音声の合成もない。  
本当に何も無い。

ただ、先述の通り、音声の合成は同じ位置のデータを足し算すればいい（単純なやつなら）ので、サンプリングレート変換よりもずっとマシなはず。  

https://github.com/takusan23/AkariDroid/blob/master/akari-core/src/main/java/io/github/takusan23/akaricore/audio/AudioMixingProcessor.kt

一点！足し算の際に、量子化ビット数が16bit の場合 0xFFFF を超えないようにする必要があります。超えたら音割れポッターなります。  
なので、元の音声素材の音量を小さくするとかの対策が必要です。  
`PCM`なので、小さくするのも 2 バイトを Int にして、`0.5`とか掛け算して小さくした後、2バイトに戻せばいいと思う。

そういえば`OutputStream`って`Buffer`の方を使うか、`バイト配列`にいくらか溜め込んでから書き込むかしないと遅いんですね。  
`write()`でファイルを開けるのが重たいんでしょうか。ちなみに`bufferd()`する方にしました。

ちなみに今回は単純に足したのであれですが、`pcm audio mixing`とかで調べると色々な案が出てくるので、おそらくちゃんと調べるべきです。  
単純に足せばいいというわけではないらしい。まあ元の音量をいじって合計が`0xFFFF`を超えないようにするって作業、現実だとそんな事しないよな。それはそう。

https://stackoverflow.com/questions/376036/

## Canvas から動画を作る
これは前書いた記事の通りです、これは自分で作らないと流石に無いですね。  
逆再生のほうがちょっとだけきれいなコードかも（単純に後に書かれたってことで）。

- https://takusan.negitoro.dev/posts/android_canvas_to_video/
- https://takusan.negitoro.dev/posts/android_mediacodec_reverse_video/

https://github.com/takusan23/AkariDroid/blob/master/akari-core/src/main/java/io/github/takusan23/akaricore/video/CanvasVideoProcessor.kt

## 動画のフレーム取り出すのが遅い
これも前書いた記事の通り。  
実は伏線だったんですね。あの記事。  

- https://takusan.negitoro.dev/posts/android_get_video_frame_mediacodec/

# media3 の transformer は使わないの
そういえば、`Android`に動画編集`API`がないみたいな話をしましたが、最近`media3 transformer`が出たようです。  
ただ、私のそれとは思想が違いそう。  

## transformer
`transformer`って名前なので、動画編集よりも、動画をリサイズするとか、音声トラックを消すとか、いらない部分をカットするとか、画像を重ねたいとか、元ある動画を変換するのに使う？。  
プレビュー機能は無いらしい（今後できるらしい）、あとは動画無しでは使えない？みたい。動画の上に動画を重ねる機能は将来出来るらしい。  

うーん。思想的には動画編集！って感じの`API`ではなく、  
メッセージアプリで、動画を小さくしてかつカットしたいけど動画周りは自前で作りたくないよ～><。みたいな時に使えばいい雰囲気がある。  
画像と文字だけで動画を作りたいみたいなユースケースは対応してなさそう感じがする。（`transformer`って名前だしそりゃそうか）  

でもでもでも`OpenGL ES / MediaCodec`周りを触らずに、動画の上に文字を重ねることが出来るとか素晴らしすぎる。  
この↓の記事書いてたときはそんなの無かったよ？（たしか）

https://takusan.negitoro.dev/posts/android_add_canvas_text_to_video/

## akari-core
一方私のは`Canvas`に書ければ何でも出来るみたいな感じで作ったので、フレームが取れるなら何個でも動画を並べられる。  
`Canvas`に描きたいものがある限りエンコーダーにフレームを流せる。`Canvas`から作るので動画がなくても作れます。  

でも動画のカットとかはパットは実装できず、指定時間だけフレームを取り出して、`Canvas`に書き込むような使い方をしないといけない。  
複数の動画をつなげるのも、動画からフレームを取り出して`Canvas`に書いて、フレームがなくなるまで続けて、無くなったら次の動画ファイル・・・って感じでやる必要があり、これもやっぱりすぐには作れない。  
その上、音声トラックのことは別に考慮する必要があり、これもカットや結合も自分で書かないといけないので、やっぱりすぐには作れない。  
（デコードして`PCM`にしたあと、指定時間だけ取り出す、`PCM`を連結させる等して`PCM`を加工したあとエンコーダーに入れる）  

うーん。こうしてみると、"動画編集ライブラリ"よりも"`MediaCodec`を代わりに叩くライブラリ"のほうが自己紹介としては正解かもしれない。

# そのほか
あんまり動画の話はなくなってきます

## Jetpack Compose は本当に便利
タイムラインの実装やプレビューの実装に一役（どころじゃない）買ってくれました。  
ドラッグアンドドロップの実装がすごい簡単ですね。移動する側は特に簡単で、考える必要があるのは移動を受け入れる側ですね。  
https://developer.android.com/develop/ui/compose/touch-input/pointer-input/drag-swipe-fling  

`Modifier.pointerInput`と`detectDragGestures`ありがとう。今ならリストの並び替えも作れそう。（それはどうだろう、それはそうと`MotionEvent`辛かったよな・・・）  
あと地味に`IntRect`に使いたい関数生えてていい！

## コルーチンは本当に便利
どっちかと言うと`Flow`をいっぱい使いました。  
タイムラインに素材を追加したら、プレビューも更新しないといけないんですが、もう`Flow`を購読して勝手に反映されるようにしました。  

`collectLatest { }`、すでに処理中だったらキャンセル投げてやり直してくれるので、重たい処理がある場合は地味に便利。

```kotlin
// 素材が更新されたらプレビューにも反映
viewModelScope.launch {
    _renderData
        .map { it.audioRenderItem }
        .distinctUntilChanged()
        .collectLatest { renderItem ->
            videoEditorPreviewPlayer.setAudioRenderItem(renderItem)
        }
}
viewModelScope.launch {
    _renderData
        .map { it.canvasRenderItem }
        .distinctUntilChanged()
        .collect { renderItem ->
            videoEditorPreviewPlayer.setCanvasRenderItem(renderItem)
            // プレビューを更新
            videoEditorPreviewPlayer.playInSingle()
        }
}
```

オペレーターが便利すぎる。  
`map { }`で加工していく感じ、書いてて楽しい。

```kotlin
// 動画の情報が更新されたら
viewModelScope.launch {
    // Pair に詰めて distinct で変わったときだけ
    _renderData
        .map { Pair(it.videoSize, it.durationMs) }
        .distinctUntilChanged()
        .collect { (videoSize, durationMs) ->
            videoEditorPreviewPlayer.setVideoInfo(videoSize.width, videoSize.height, durationMs)
            _timeLineData.update { it.copy(durationMs = durationMs) }
            _touchEditorData.update { it.copy(videoSize = videoSize) }
        }
}
```

## エンコーダーの設定
コーデック、いくつか選べるようにしました。せっかくハードウェアエンコーダーが乗ってるなら選べるようにしたら面白いかなって思った。  
`Pixel 8`から`AV1 ハードウェアエンコーダー`が乗ってるので、`AV1 コーデック`も選べるようにしました。Android 14 からは`AV1 ソフトウェアエンコード`もできます。  

![Imgur](https://i.imgur.com/cwKPMBY.png)

## 外部連携機能

![Imgur](https://i.imgur.com/hUUXLdR.png)

外部連携機能があります。あかりんく。  
これは外部アプリで素材を作成（写真とか）して、その素材をタイムラインに追加できる機能で、  
標準では作れない、なんか特殊な素材（例えば`QRコード画像生成機能`とか）を外部アプリで作成して、あかりどろいど側で受け取る事ができます。  

![Imgur](https://i.imgur.com/QOsN5Kk.png)

技術的には、`Android`には`Intent`で他のアプリと連携できる仕組みがあります。それこそ大昔（？）のキーボードアプリのマッシュルーム機能とかはこの`Intent`で出来ていたはず。  
これを使ってます。  
写真をメッセージで送る時に標準のカメラアプリが起動するやつ。あれ。

https://developer.android.com/media/camera/camera-intents

流れとしては、

- 外部連携機能を開始（あかりんく）
- あかりんく用の`Intent`を投げる（`startActivity`）
    - 対応アプリはこの`Intent`を受け取れるように、`AndroidManifest.xml`で定義する
- 対応アプリが開く
- `Intent`から`Uri`を取り出す
    - この`Uri`に、音声、画像、動画を書き込みます
- 処理が終わったら、`setResult`を呼び出し、以下の情報を詰めてください
    - `Intent#setType`に`MIME-Type`
        - `Uri`に何のデータを書き込んだか分からないため
    - あと`EXTRA_TITLE`で素材の名前を変更できます。
- 対応アプリ側で`finish()`を呼ぶことで、元いたあかりどろいどに戻ってこられるはず
- あかりどろいど側の`Activity Result API`のコールバックが呼ばれて、タイムラインに追加されます

もし外部連携アプリを作りたいという場合は、それ専用の説明書を書いたので、見てみてください（まあ適当なんですが）。  
https://github.com/takusan23/AkariDroid/blob/master/AKALINK_README.md

ちなみに、似たような機能を作りたい場合ですが、`FileProvider`クラスを見てみてください。外部アプリと`Intent`に入り切らないバイナリデータをやり取りするやつです。  
`Uri`を経由しないと多分怒られる（画像を`Intent`に入れると多分サイズデカすぎで落ちる）  

# まだ無い機能
まさかのローカライズすらしていない。`Text(text = "ハードコーディング!")`

- ローカライズ
- 通知権限
- エフェクト
- 出力形式のバリデーション
- 横画面
- タイムラインのレーン（レイヤー）数ハードコートやめる
- 画面が狭すぎる
- プレビュー重すぎ
- クロマキー
- プロジェクト機能
- モザイクとかのエフェクト？
- シーンチェンジ
- 倍速
- 逆再生
- ムーブアトムを先頭に持ってくる
- webm + av1

# おわりに
つかれた。`Playストア`で動画編集アプリ探すと結構でてくるけど、動画編集アプリ作ってわかった。（大した機能はないけど）  
世の`Android`で動く動画編集アプリはよくやっていると思います。`Android`ろくな動画編集`API`無いんだよ？

# おわりに2
画面小さすぎて操作しにくい。

# おわりに3
そういえば、あかりこあ（`akari-core`）、これ`Android 5`以降で動くはずなのですが試してなかったので試しました。結果`Xperia Z3 Compact (Android 5)`っていう名機でも動きました。  
わんちゃん`Android 5`以降が動いてる端末なら何でも動く説がある。`Android`のらくらくホンとか。`Android`で動いてるなんか変なやつ（例えが出ないけど）  
見た感じ`media3 transformer`も同じく`Android 5`以降で動きそう。試せてはない  

ちなみに`あかりどろいど`自体はちょっと直さないと動かなそう。（超小声）  
エンコード部分はちゃんと動きました。それ以外の部分がちょっと壊れてた。。  

![Imgur](https://i.imgur.com/tr71Ciz.png)

- `MediaMetadataRetriever`、`AutoCloseable`を実装してるの新しい`Android`だけなのか、、罠すぎる
    - https://stackoverflow.com/questions/65398759/
    - 新しい`Android`には実装されてる
        - https://cs.android.com/android/platform/superproject/+/android-14.0.0_r1:frameworks/base/media/java/android/media/MediaMetadataRetriever.java
    - ふるい`Android`にはない
        - https://cs.android.com/android/platform/superproject/+/android-7.0.0_r1:frameworks/base/media/java/android/media/MediaMetadataRetriever.java