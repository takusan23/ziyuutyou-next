---
title: JavaScript の MediaRecorder で出来る WebM をシークできるようにする Kotlin/JS
created_at: 2023-12-26
tags:
- Kotlin
- JavaScript
- WebM
- Kotlin/JS
---
どうもこんばんわ。  
忘年会でお酒飲まずにソフトドリンクだけ飲んでたんですけどやっぱ飲んだほうが得なんかな（？？）

# 本題
`JavaScript`に`MediaRecorder`とかいうやつがあるんですけど（`Android`のやつじゃないです）  
これのおかげで`JavaScript`を少し書いてブラウザで開くだけで画面録画ができます！  
https://takusan.negitoro.dev/posts/javascript_webm_livestreaming/

```js
const MIME_TYPE = 'video/webm; codecs="vp9"'
// 画面をキャプチャーしてくれるやつ
const displayMedia = await navigator.mediaDevices.getDisplayMedia({ audio: { channelCount: 2 }, video: true })
// パソコンの画面を流す
mediaRecorder = new MediaRecorder(displayMedia, { mimeType: MIME_TYPE })
// 録画データが着たら呼ばれる
mediaRecorder.ondataavailable = (ev) => {
    chunks.push(ev.data)
}
// 録画開始
mediaRecorder.start(100)

// TODO ダウンロード処理
```

画面録画がブラウザひとつで出来る一方、お悩みポイントもあって、**出来た WebM ファイルがシークが出来ない**点です  

## シークできない
`Firefox`は**超優秀**ですね、シークが出来ます。  
`Firefox`は動画の長さを解析する機能があるのでしょうか。

![Imgur](https://imgur.com/ge3rYla.png)

一方、`Chrome`とか`Windows`の標準プレイヤーとか、その他の動画プレイヤーも再生中ではありますがシークバーが進みません。

![Imgur](https://imgur.com/36Ehgez.png)

# シークできるようにしてみる
というわけで、今回はこのシークできない`webm`をシークできるようにしてみようと思います。  
すでに先人がいますが、、、この次くらいに`webm`触る予定なのでちょうどいいです。自分でも作ってみます。

# 先に完成品
ここで WebM を選んで処理を始めればおけ。  
ちょっと待てば勝手にダウンロードがされます。

https://webm.negitoro.dev

# WebM について
その前に`WebM`について、どの様に保存しているかをさらっっっと  

`WebM`の中身というかデータの格納方法とかは前も書いたのでそっちも見て  
https://takusan.negitoro.dev/posts/video_webm_spec/

また、`Matroska`のサブセットなのでそっちも見て  
https://www.matroska.org/technical/elements.html

## データの格納方法
`EBML`という仕組みに乗っかってます。  
`xml`がよく例で出るけど閉じタグは無いので、`yaml`とかが近そう。  
閉じタグが無いので、要素にはサイズが記録されています。

`EBML`はこんな感じの構造が続いています。

```plaintext
 +----+----------+------+
 | ID | DataSize | Data |
 +----+----------+------+
```

- ID
    - その名の通り、何のデータかどうかを表す
    - 可変長です
    - ID の一覧です
        - https://www.matroska.org/technical/elements.html
- DataSize
    - `DataSize`の後ろにある`Data`の大きさです
    - `DataSize`自身も可変長です
- Data
    - `DataSize`の分だけデータがあります

`ID`と`DataSize`は可変長になっていて、どこにサイズが入っているかというと、  
最初のバイトを、16進数から2進数にした後、左から`1`がどの位置に入っているか。でサイズが分かるようになっています。  

| 1 の位置  | データの大きさ |
|-----------|----------------|
| 1000_0000 | 1              |
| 0100_0000 | 2              |
| 0010_0000 | 3              |
| 0001_0000 | 4              |
| 0000_1000 | 5              |
| 0000_0100 | 6              |
| 0000_0010 | 7              |
| 0000_0001 | 8              |

`ID`と`DataSize`はコレに乗っかっているので、自分自身の大きさを含めながら`ID`/`DataSize`としての役割も果たします。すごい！  
これを`VINT`とか言うらしい。

ちなみに`DataSize`は左から最初の`1`は`VINT`のために`1`が立っているので、データの大きさとして使う場合はその最初の`1`を無視する必要があります（ビット演算的に言うとフラグを折る）。 

あ、ちなみにパースではなく組み立てる際、`1`を立てる位置には注意する必要があります。  
例えば`1バイト`のデータ`0100 0000`なら先頭に`1`を立てても問題ないですが、  
`1111 0000`の場合はすでに`1`が立っているので`1`を立てることは出来ません。代わりに`2バイト`に増やして`1000 0000 1111 0000`にする必要があると思います。

また、次のような`2バイト`のデータ`1000 0000 0000 0000`の場合、左から2バイト目に`1`を立てたいところですが、この場合も1バイト増やす必要があります。  
これで立てると左の最初の`1`が`2`番目から`1`番目になってしまうため、パースに失敗してしまいます。  
実装的には先頭の1バイトが、1を立てただけの1バイトよりも大きくなる場合は1バイト足す必要があります。1を立てただけのバイトの方が大きい場合はそのまま立てて良いはず。

### 例えば

例えば、これから追加する動画の時間はこんな感じ  

```plaintext
44 89 84 48 b6 c8 60
```

まず`ID`を解析します。（これは動画の時間を表しているって答えを言っていますが聞かなかったことに）  
`44` は2進数にすると`0100 0100`ですね。  

![Imgur](https://imgur.com/fqN5tTJ.png)

`1`の位置は左から2番目なので、`VINT`の表と照らし合わせて`ID`は2バイト分あることになります。  
`2バイト`取り出して、`ID`は`44 89`であることが分かりました。

`4489`を`ID一覧`から探します！ありました！  
このデータは`Duration`ですね！
![Imgur](https://imgur.com/3uWdy5V.png)

次に`DataSize`です。`84`を2進数にすると`1000 0100`ですね。同様に表から探すと`1`バイト分だということが分かります。  
`DataSize`は`1バイト`分だとわかったので`84`です。なんですが、左から最初の`1`は`VINT`用のやつなので無視する必要があります。  
というわけで折ります。16進数`84`を2進数にすると`1000 0100`ですが、左から最初の`1`は無視したいので`0000 0100`です。  
`0100`を10進数にしたら`4`ですね。よって`Data`の大きさは`4`バイト分だと分かるわけです。

というわけで`Data`は`48 b6 c8 60`。これが動画の長さです。  
なんか動画の時間にしては変に見えますが、整数じゃないんですよね。`ID`一覧をよく見ると`Float`って書いてあります。なのでそれはまたおいおい

![Imgur](https://imgur.com/z0qNM6n.png)

![Imgur](https://imgur.com/DRzW7Qn.png)

![Imgur](https://imgur.com/yVh9pwG.png)

### その他の話
親要素（`Segment`/`Info`/`Tracks`/`Cluster`等）は`Data`にデータではなく`EBML`が入っているので、子要素を解析するようにする必要があります。  
それも`ID`の表に書いてあるので見て

![Imgur](https://imgur.com/wFmjUky.png)

それと、`DataSize`には長さ不明というのが既に予約されています。（`0x01FFFFFFFFFFFFFF`）  
もし長さが不明な場合は、子要素の`DataSize`を足していけば分かるはず。  
`DataSize`が不明だと解析がめっちゃ面倒になるので無視したくなりますが、**`JavaScript`の`MediaRecorder`が作った`WebM`には長さ不明が出現します。**  
なので、**長さ不明を受け付けないようなコードを書いてはいけません。**

出現すると言っても、出現箇所は決まってて（多分）`Segment`と`Cluster`が長さ不明になるはずです。気をつけましょう（？）  
![Imgur](https://imgur.com/jkJGRKK.png)

コレを繰り返すことで、解析することが出来ます。  
（他にも`CodecPrivate`とかは別途説明が必要ですがそれは前書いた記事見て。シークしたいだけなら関係ないので。）

以上！！！データの格納方法！でした！

## WebM に入っているデータ
`EBML`に乗っかって入っているデータが以下  

公式：  
https://www.matroska.org/technical/diagram.html

```yaml
- EBML Header
    - EBML version
    - EBML read version
    - EBMLMaxIDLength
    - EBMLMaxSizeLength
    - Document type
    - Document type version
    - Document type read version
- Segment
    - SeekHead
        - SeekEntry         # Info の位置
            - SeekID
            - SeekPosition
        - SeekEntry         # Tracks の位置
            - SeekID
            - SeekPosition
        - SeekEntry         # Cluster の位置
            - SeekID
            - SeekPosition
        - SeekEntry         # Cue の位置
            - SeekID
            - SeekPosition
    - Info
        - TimestampScale
        - MuxingApp
        - WritingApp
        - Duration
    - Tracks
        - Track
            - TrackNumber
            - TrackUID
            - TrackType
            - CodecID
            - CodecPrivateData
            - AudioTrack
                - SamplingFrequency
                - Channels
        - Track
            - TrackNumber
            - TrackUID
            - TrackType
            - CodecID
            - VideoTrack
                - PixelWidth
                - PixelHeight
    - Cluster
        - ClusterTimestamp
        - SimpleBlock
        - SimpleBlock
    - Cluster               # 動画が続く限り Cluster が増えていく
    - Cue
        - CuePoint
            - CueTime
            - CueTrackPositions
                - CueTrack
                - CueClusterPosition
        - CuePoint          # Cluster の数だけ CuePoint を入れる
```

## シークできるようにするには
↑ のやつから欠けているやつを入れる必要がある

### 動画の長さが記録されてない（Duration）
動画の長さが`webm`に記録されていない。  
`webm`のファイル構造を見るための`GUI`アプリケーションがあるのでそれを開きます。  

https://mkvtoolnix.download/

確かに動画の長さが`JavaScript`の`MediaRecorder`が吐き出したファイルには存在しないですね。  
シークできる動画には動画の長さが記録されていそうです。

![Imgur](https://imgur.com/e9L3ZV8.png)

![Imgur](https://imgur.com/IBXFLqX.png)

というわけでまずは動画の長さを`WebM ファイル`に書き込む必要があるわけですね。

### シークのための目印がない（Cue）
詳しくは：  
https://www.matroska.org/technical/cues.html

そのシークの目印ってのが`Cue`要素とかいうやつで、これも`JavaScript`の`MediaRecorder`が吐き出したファイルには存在しません。  
これは映像データ（後述）が、先頭から何バイト目にあるかというのを時間とともに目印として入れておきます。  
これにより、プレイヤーがシークする際に`Cluster`を上から舐める必要がなくなり、シークした時間に一番近い目印を探して、`Cluster`を読み出すことが出来るわけです。

・・・が後述しますが、`Cue`とこの後説明する`SeekHead`が無くても動画時間さえあれば再生できるプレイヤーも存在するらしい。

### シークのための目印が入っていることを知らせることが出来ない（SeekHead）
時間と、シークの目印だけを入れればシークできるのですが、どこに`Cue`を入れるかによっては話が変わってきます。  
というのも

```yaml
- EBML Header
- Segment
    - Info
        - Duration
    - Tracks
        - Track
        - Track
    - Cue
    - Cluster
    - Cluster
    - Cluster
```

上記のように、映像、音声データを入れている`Cluster`より前に`Cue`を置くことが出来る場合はおそらく問題無いでしょう。  

```yaml
- EBML Header
- Segment
    - Info
        - Duration
    - Tracks
        - Track
        - Track
    - Cluster
    - Cluster
    - Cluster
    - Cue
```

一方、上記のように`Cluster`の後に`Cue`が来る場合、`Cluster`の一番最後に`Cue`がありますよと教えてあげる必要があります。  
`Cluster`は映像、音声データの分だけ増えていくため、一度に解析はしないで再生に必要な部分だけ、上から順に取り出すような処理になっているはずです。  
で、上から順に再生に必要な分だけ取り出していると、`Cue`の存在に誰も気付かないわけです。  

`Cluster`より先頭にあれば気付く事ができますが、いかんせん`Cluster`の数が多いので最後では気付かないでしょう。

で、最後に`Cue`ありますよと教えてあげるのが`SeekHead`要素です。  
これに`Cue`が一番最後にあると書いておけば、再生の際にファイルの最後の方にジャンプして`Cue`を解析する事ができるわけです。

これも`JavaScript`の`MediaRecorder`が吐き出した`WebM`にはありません。  

#### Cue を先頭に持っていけば良いのでは？
コレをする方法もあるとは思いますが、圧倒的に`Cue`を後にするのが楽だと思います（あんまりバイナリ操作慣れてないし）。  
というのも、`Cue`のサイズを予測する必要があるわけですね。

```yaml
- EBML Header
- Segment
    - Info
        - Duration
    - Tracks
        - Track
        - Track
    - Cue が入るから適当に大きめのスペースを取る。予測する必要がある
    - Cluster
    - Cluster
    - Cluster
```

すでに動画ファイルが存在して変換する場合ならまあ予測も出来ると思いますが、  
撮影中の場合はどれだけ必要になるか見当もつかないため、`Cue`最後が楽だと思います。

また、`Cue`はシークの目印なので、`Cluster`の位置がもちろん必要なのですが、  
その`Cluster`は`Cue`よりも後に来るため、位置計算の際に絶賛書き込み中の`Cue`自身のサイズまで予測する必要があり、これも大変だと思います。  
しかも`Cue`が増えていくたびに全ての`Cluster`の位置を更新する必要があり、結構めんどくさい、考えたくない。

```yaml
- EBML Header
- Segment
    - Info
        - Duration
    - Tracks
        - Track
        - Track
    - Cue
        - CuePoint
            - ClusterPosition       # <-- Cluster の位置を書き込むが、この位置は今書き込んでいる Cue のサイズも考慮する必要がある
    - Cluster                       # <-- もちろん Cue が追加されれば Cluster の位置もズレていく
    - Cluster
    - Cluster
```

# 長い！はよ作れ！
作ります。  
今回は`JavaScript`の`MediaRecorder`というわけで、**やっぱブラウザで動くように**したいですよね。  
ですが、、、バイナリ操作にあんまり慣れてない。。。ので`JavaScript`でも`TypeScript`でも無く、いつも書いてる`Kotlin`で行かせてください。  
`JS / TS`で書ければ良いのですがちょっと自信無いかなあ、慣れてる（？）言語で行かせて欲しい。  
`Kotlin`で書いて、`Kotlin/JS`でビルドすればブラウザで動くのでそれで許して～～～  

（`JVM`以外でも`Kotlin`のコード動かせます。もちろん動かすためには`Java`の機能を使わないようにする必要がありますが。）  
（`java.net.HttpUrlConnection`とか`java.io.File`とか使ったら無理。逆に`Kotlin`の標準ライブラリだけで書かれていれば`JS`でも動くかもしれない。）

あ、とりあえずは`Java`で作って動かして、問題なければ`Kotlin/JS`にコピーしようと思います。

# 環境

| なまえ        | あたい                       |
|---------------|------------------------------|
| Intellij IDEA | 2023.2.2 (Community Edition) |
| Java          | Eclipse Adoptium JDK 17      |
| Kotlin        | 1.9.0                        |

2/10/16 進数変換出来る電卓があると良いです  
（`Windows`に最初から入ってる電卓をプログラマーモードにすれば良いです）

## ID 一覧を用意する
はい。  
それぞれ子要素を持っているか、子要素の場合は親要素のID、を持たせてみました。

https://www.matroska.org/technical/elements.html

```kotlin
/**
 * Matroska の ID
 *
 * @param byteArray ID のバイト配列
 * @param isParent 子要素を持つ親かどうか
 * @param parentTag 親要素の [MatroskaId]
 */
enum class MatroskaId(
    val byteArray: ByteArray,
    val isParent: Boolean,
    val parentTag: MatroskaId?
) {
    EBML(byteArrayOf(0x1A.toByte(), 0x45.toByte(), 0xDF.toByte(), 0xA3.toByte()), true, null),
    EBMLVersion(byteArrayOf(0x42.toByte(), 0x86.toByte()), false, EBML),
    EBMLReadVersion(byteArrayOf(0x42.toByte(), 0xF7.toByte()), false, EBML),
    EBMLMaxIDLength(byteArrayOf(0x42.toByte(), 0xF2.toByte()), false, EBML),
    EBMLMaxSizeLength(byteArrayOf(0x42.toByte(), 0xF3.toByte()), false, EBML),
    DocType(byteArrayOf(0x42.toByte(), 0x82.toByte()), false, EBML),
    DocTypeVersion(byteArrayOf(0x42.toByte(), 0x87.toByte()), false, EBML),
    DocTypeReadVersion(byteArrayOf(0x42.toByte(), 0x85.toByte()), false, EBML),

    Segment(byteArrayOf(0x18.toByte(), 0x53.toByte(), 0x80.toByte(), 0x67.toByte()), true, null),

    SeekHead(byteArrayOf(0x11.toByte(), 0x4D.toByte(), 0x9B.toByte(), 0x74.toByte()), true, Segment),
    Seek(byteArrayOf(0x4D.toByte(), 0xBB.toByte()), true, SeekHead),
    SeekID(byteArrayOf(0x53.toByte(), 0xAB.toByte()), false, Seek),
    SeekPosition(byteArrayOf(0x53.toByte(), 0xAC.toByte()), false, Seek),

    Info(byteArrayOf(0x15.toByte(), 0x49.toByte(), 0xA9.toByte(), 0x66.toByte()), true, Segment),
    Duration(byteArrayOf(0x44.toByte(), 0x89.toByte()), false, Info),
    SegmentUUID(byteArrayOf(0x73.toByte(), 0xA4.toByte()), false, Info),
    TimestampScale(byteArrayOf(0x2A.toByte(), 0xD7.toByte(), 0xB1.toByte()), false, Info),
    MuxingApp(byteArrayOf(0x4D.toByte(), 0x80.toByte()), false, Info),
    WritingApp(byteArrayOf(0x57.toByte(), 0x41.toByte()), false, Info),

    Tracks(byteArrayOf(0x16.toByte(), 0x54.toByte(), 0xAE.toByte(), 0x6B.toByte()), true, Segment),
    TrackEntry(byteArrayOf(0xAE.toByte()), true, Tracks),
    TrackNumber(byteArrayOf(0xD7.toByte()), false, TrackEntry),
    TrackUID(byteArrayOf(0x73.toByte(), 0xC5.toByte()), false, TrackEntry),
    TrackType(byteArrayOf(0x83.toByte()), false, TrackEntry),
    Language(byteArrayOf(0x22.toByte(), 0xB5.toByte(), 0x9C.toByte()), false, TrackEntry),
    CodecID(byteArrayOf(0x86.toByte()), false, TrackEntry),
    CodecPrivate(byteArrayOf(0x63.toByte(), 0xA2.toByte()), false, TrackEntry),
    CodecName(byteArrayOf(0x25.toByte(), 0x86.toByte(), 0x88.toByte()), false, TrackEntry),
    FlagLacing(byteArrayOf(0x9C.toByte()), false, TrackEntry),
    DefaultDuration(byteArrayOf(0x23.toByte(), 0xE3.toByte(), 0x83.toByte()), false, TrackEntry),
    TrackTimecodeScale(byteArrayOf(0x23.toByte(), 0x31.toByte(), 0x4F.toByte()), false, TrackEntry),
    VideoTrack(byteArrayOf(0xE0.toByte()), false, TrackEntry),
    PixelWidth(byteArrayOf(0xB0.toByte()), false, VideoTrack),
    PixelHeight(byteArrayOf(0xBA.toByte()), false, VideoTrack),
    FrameRate(byteArrayOf(0x23.toByte(), 0x83.toByte(), 0xE3.toByte()), false, VideoTrack),
    MaxBlockAdditionID(byteArrayOf(0x55.toByte(), 0xEE.toByte()), false, VideoTrack),
    AudioTrack(byteArrayOf(0xE1.toByte()), true, TrackEntry),
    SamplingFrequency(byteArrayOf(0xB5.toByte()), false, AudioTrack),
    Channels(byteArrayOf(0x9F.toByte()), false, AudioTrack),
    BitDepth(byteArrayOf(0x62.toByte(), 0x64.toByte()), false, AudioTrack),

    Cues(byteArrayOf(0x1C.toByte(), 0x53.toByte(), 0xBB.toByte(), 0x6B.toByte()), true, Segment),
    CuePoint(byteArrayOf(0xBB.toByte()), true, Cues),
    CueTime(byteArrayOf(0xB3.toByte()), false, CuePoint),
    CueTrackPositions(byteArrayOf(0xB7.toByte()), true, CuePoint),
    CueTrack(byteArrayOf(0xF7.toByte()), false, CueTrackPositions),
    CueClusterPosition(byteArrayOf(0xF1.toByte()), false, CueTrackPositions),
    CueRelativePosition(byteArrayOf(0xF0.toByte()), false, CueTrackPositions),

    Cluster(byteArrayOf(0x1F.toByte(), 0x43.toByte(), 0xB6.toByte(), 0x75.toByte()), true, Segment),
    Timestamp(byteArrayOf(0xE7.toByte()), false, Cluster),
    SimpleBlock(byteArrayOf(0xA3.toByte()), false, Cluster)
}
```

## 要素を表現するクラス
`EBML`で収納されたそれぞれのデータを表すクラスです。  
`ID`と、`Data`の中身ですね。

```kotlin
/**
 * EBMLの要素を表すデータクラス
 *
 * @param matroskaId [MatroskaId]
 * @param data データ
 */
data class MatroskaElement(
    val matroskaId: MatroskaId,
    val data: ByteArray
)
```

## EBML や VINT をよしなにやる拡張関数
よく使う関数は拡張関数として生やしておきましょう。  

前回の`VINT`周りは慣れないビット演算を使ったせいで、なんだかよく分からないけど動いているコードが誕生したので、  
→ https://takusan.negitoro.dev/posts/video_webm_spec/#id  

今回は`VINT`とサイズの対応表とかを用意することでビット演算を少し回避しました。  

あ、あとあんまり見かけたことがないのですが、`Kotlin`で`*`（アスタリスク）を使うと配列の中身を展開してくれます。  
`JavaScript`だとスプレッド構文とか言うやつですね。`JavaScript`のそれと同じだと思います。  

```js
// JavaScript
// 展開しない
console.log([1,2,3, [4,5,6] ]) // [1,2,3, [4,5,6] ]
// 配列内に展開する（スプレッド構文）
console.log([1,2,3, ...[4,5,6] ]) // [ 1, 2, 3, 4, 5, 6 ]
```

```kotlin
// Kotlin
println(listOf(1,2,3, listOf(4,5,6) )) // [1, 2, 3, [4, 5, 6]]
println(listOf(1, 2, 3, *arrayOf(4, 5, 6))) // [1, 2, 3, 4, 5, 6]
```

別に無くても、`byteArrayOf() + byteArrayOf()`みたく`+`で繋いでいけばいいんですけど、`*`のが見やすそう。  

```kotlin
listOf(1, 2, 3, *arrayOf(4, 5, 6))
listOf(1, 2, 3) + arrayOf(4, 5, 6)
```

詳しくはそれぞれの関数のコメントを見て下さい。  
`MatroskaExtension.kt`

```kotlin
/** DataSize の長さが不定の場合の表現 */
internal val UNKNOWN_DATA_SIZE = byteArrayOf(0x1F.toByte(), 0xFF.toByte(), 0xFF.toByte(), 0xFF.toByte(), 0xFF.toByte(), 0xFF.toByte(), 0xFF.toByte(), 0xFF.toByte())

/** VINT とバイト数 */
private val BIT_SIZE_LIST = listOf(
    0b1000_0000 to 1,
    0b0100_0000 to 2,
    0b0010_0000 to 3,
    0b0001_0000 to 4,
    0b0000_1000 to 5,
    0b0000_0100 to 6,
    0b0000_0010 to 7,
    0b0000_0001 to 8
)

/** 最大値と必要なバイト数 */
private val INT_TO_BYTEARRAY_LIST = listOf(
    0xFF to 1,
    0xFFFF to 2,
    0xFFFFFF to 3,
    0x7FFFFFFF to 4
)

/** [MatroskaElement]の配列から[MatroskaId]をフィルターする */
internal fun List<MatroskaElement>.filterId(matroskaId: MatroskaId) = this.filter { it.matroskaId == matroskaId }

/**
 * VINT の長さを返す
 * 注意してほしいのは、DataSize は Data の長さを表すものだが、この DataSize 自体の長さが可変長。
 */
internal fun Byte.getElementLength(): Int {
    // UInt にする必要あり
    val uIntValue = toInt().andFF()
    // 左から最初に立ってるビットを探して、サイズをもとめる
    // 予めビットとサイズを用意しておく読みやすさ最優先実装...
    return BIT_SIZE_LIST.first { (bit, _) ->
        // ビットを AND して、0 以外を探す（ビットが立ってない場合は 0 になる）
        uIntValue and bit != 0
    }.second
}

/** [MatroskaElement] を EBML 要素のバイト配列にする */
internal fun MatroskaElement.toEbmlByteArray(): ByteArray {
    // ID
    val idByteArray = this.matroskaId.byteArray
    // DataSize
    val dataSize = this.data.size
    val dataSizeByteArray = dataSize.toDataSize()
    // Data
    val data = this.data
    // ByteArray にする
    return byteArrayOf(*idByteArray, *dataSizeByteArray, *data)
}

/** [ByteArray]から[MatroskaId]を探す */
internal fun ByteArray.toMatroskaId(): MatroskaId {
    return MatroskaId.entries.first { it.byteArray.contentEquals(this) }
}

/** [ByteArray]が入っている[List]を、全部まとめて[ByteArray]にする */
internal fun List<ByteArray>.concatByteArray(): ByteArray {
    val byteArray = ByteArray(this.sumOf { it.size })
    var write = 0
    this.forEach { cluster ->
        repeat(cluster.size) { read ->
            byteArray[write++] = cluster[read]
        }
    }
    return byteArray
}

/**
 * DataSize 要素から実際の Data の大きさを出す
 * @see [getElementLength]
 * @return 長さ不定の場合は -1
 */
internal fun ByteArray.getDataSize(): Int {
    // 例外で、 01 FF FF FF FF FF FF FF のときは長さが不定なので...
    // Segment / Cluster の場合は子要素の長さを全部足せば出せると思うので、、、
    if (contentEquals(UNKNOWN_DATA_SIZE)) {
        return -1
    }

    var firstByte = first().toInt().andFF()
    // DataSize 要素の場合、最初に立ってるビットを消す
    for ((bit, _) in BIT_SIZE_LIST) {
        if (firstByte and bit != 0) {
            // XOR で両方同じ場合は消す
            firstByte = firstByte xor bit
            // 消すビットは最初だけなので
            break
        }
    }
    // 戻す
    return if (size == 1) {
        firstByte
    } else {
        byteArrayOf(firstByte.toByte(), *copyOfRange(1, size)).toInt()
    }
}

/** 実際のデータの大きさから DataSize 要素のバイト配列にする */
internal fun Int.toDataSize(): ByteArray {
    // Int を ByteArray に
    val byteArray = this.toByteArray()
    // 最初のバイトは、DataSize 自体のサイズを入れる必要がある（ VINT ）
    val firstByte = byteArray.first().toInt().andFF()

    // DataSize 自体のサイズとして、最初のバイトに OR で 1 を立てる
    var resultByteArray = byteArrayOf()
    BIT_SIZE_LIST.forEachIndexed { index, (bit, size) ->
        if (size == byteArray.size) {
            resultByteArray = if (firstByte < bit) {
                // V_INT を先頭のバイトに書き込む
                byteArrayOf(
                    (firstByte or bit).toByte(),
                    *byteArray.copyOfRange(1, byteArray.size)
                )
            } else {
                // 最初のバイトに書き込めない場合
                // （DataSize 自身のサイズのビットを立てる前の時点で、最初のバイトのほうが大きい場合）
                // size が +1 するので、配列の添字は -1 する必要あり
                byteArrayOf(BIT_SIZE_LIST[index + 1].first.toByte(), *byteArray)
            }
        }
    }
    // 戻す
    return resultByteArray
}

/**
 * Segment の長さ不定のデータサイズを上から舐めてもとめる。
 * ByteArray は ID までは読めている、DataSize は長さ不定なので 8 バイト固定。というわけで ID + DataSize を消した Data だけください。
 */
internal fun ByteArray.analyzeUnknownDataSizeForSegmentData(): Int {
    var index = 0

    while (true) {
        // Segment も Cluster も親要素なので、それぞれの子を見ていけばデータの長さが分かるはず。
        val idLength = this[index].getElementLength()
        val idElement = this.copyOfRange(index, index + idLength)
        // ID 分足していく
        index += idLength

        // DataSize を取り出す
        val dataSizeLength = this[index].getElementLength()
        // Cluster の場合は長さ不定の場合があるため、追加処理
        val dataSizeElement = this.copyOfRange(index, index + dataSizeLength).getDataSize().let { dataSizeOrUnknown ->
            // 長さが求まっていればそれを使う
            if (dataSizeOrUnknown != -1) {
                return@let dataSizeOrUnknown
            }

            // Cluster は上から舐めて求められる
            val dataByteArray = this.copyOfRange(index + UNKNOWN_DATA_SIZE.size, this.size)
            if (idElement.toMatroskaId() == MatroskaId.Cluster) {
                // Cluster の長さ不定は求められる、再帰で求める。Data を渡す
                dataByteArray.analyzeUnknownDataSizeForClusterData()
            } else {
                throw RuntimeException("長さ不定")
            }
        }

        // DataSize 分足していく
        index += dataSizeLength
        // データの大きさを出すため、Data の中身までは見ない
        // Data 分足していく
        index += dataSizeElement

        // もう読み出せない場合はここまでをデータの大きさとする
        if (size <= index) {
            break
        }
        // 次の要素が 3 バイト以上ない場合は break（解析できない）
        if (size <= index + 3) {
            break
        }
    }
    return index
}

/**
 * Cluster の長さ不定のデータサイズを上から舐めてもとめる。
 *
 * ByteArray は ID までは読めている、DataSize は長さ不定なので 8 バイト固定。というわけで ID + DataSize を消した Data だけください。
 */
internal fun ByteArray.analyzeUnknownDataSizeForClusterData(): Int {
    var index = 0

    while (true) {
        // Segment も Cluster も親要素なので、それぞれの子を見ていけばデータの長さが分かるはず。
        val idLength = this[index].getElementLength()
        val idElement = this.copyOfRange(index, index + idLength)

        // Cluster だった場合は break。次の Cluster にぶつかったってことです。
        if (idElement.toMatroskaId() == MatroskaId.Cluster) {
            break
        }

        // ID 分足していく
        index += idLength
        // DataSize を取り出す
        val dataSizeLength = this[index].getElementLength()
        val dataSizeElement = this.copyOfRange(index, index + dataSizeLength).getDataSize()
        // DataSize 分足していく
        index += dataSizeLength
        // データの大きさを出すため、Data の中身までは見ない
        // Data 分足していく
        index += dataSizeElement

        // もう読み出せない場合はここまでをデータの大きさとする
        if (size <= index) {
            break
        }
        // もしかしたら他のブラウザでもなるかもしれないけど、
        // Chromeの場合、録画終了を押したとき、要素をきれいに終わらせてくれるわけでは無いらしく SimpleBlock の途中だろうとぶった切ってくるらしい、中途半端にデータが余ることがある
        // 例：タグの A3 で終わるなど
        // その場合にエラーにならないように、この後3バイト（ID / DataSize / Data それぞれ1バイト）ない場合はループを抜ける
        if (size <= index + 3) {
            break
        }
    }
    return index
}

/** Int を ByteArray に変換する */
internal fun Int.toByteArray(): ByteArray {
    // 多分 max 4 バイト
    val size = INT_TO_BYTEARRAY_LIST.first { (maxValue, _) ->
        this <= maxValue
    }.second
    var l = this
    val result = ByteArray(size)
    for (i in 0..<size) {
        result[i] = (l and 0xff).toByte()
        l = l shr 8
    }
    // 逆になってるのでもどす
    result.reverse()
    return result
}

/** ByteArray から Int へ変換する。ByteArray 内にある Byte は符号なしに変換される。 */
internal fun ByteArray.toInt(): Int {
    // 先頭に 0x00 があれば消す
    val validValuePos = kotlin.math.max(0, this.indexOfFirst { it != 0x00.toByte() })
    var result = 0
    // 逆にする
    // これしないと左側にバイトが移動するようなシフト演算？になってしまう
    // for を 多い順 にすればいいけどこっちの方でいいんじゃない
    drop(validValuePos).reversed().also { bytes ->
        for (i in 0 until bytes.count()) {
            result = result or (bytes.get(i).toInt().andFF() shl (8 * i))
        }
    }
    return result
}

/** ByteをIntに変換した際に、符号付きIntになるので、AND 0xFF するだけの関数 */
internal fun Int.andFF() = this and 0xFF
```

## WebM をパースする処理
まずは`WebM`の中身からそれぞれの要素を出そうと思います。  
`Info`とか`SimpleBlock`とかを取り出していきます。  

長さ不明の場合はサイズを求めるようにしていますが、これは`Segment`と`Cluster`のみで、それ以外で長さ不明を使われたら例外になると思います。  
（めんどいのと`JavaScript`の`MediaRecorder`はコレ以外の要素に関してはちゃんとサイズを入れているので）  

ちなみに`Cluster`の場合は次の`Cluster`に当たるまで DataSize を取り出し続けます。`Segment`は解析できなくなるまでかな。  
ちなみにこれ計算リソースの無駄遣いと言われたらそれはそうだと思う（長さ不明の解析のために一回上から舐めて、長さが分かったら今度要素のパースのためにまた舐める）

```kotlin
object FixWebmSeek {

    /**
     * WebM をパースする
     *
     * @param webmFileByteArray WebM ファイル
     * @return [MatroskaElement]の配列
     */
    fun parseWebm(webmFileByteArray: ByteArray): List<MatroskaElement> {

        /**
         * [byteArray] から次の EBML のパースを行う
         *
         * @param byteArray EBML の[ByteArray]
         * @param startPosition EBML 要素の開始位置
         * @return パース結果[MatroskaElement]と、パースしたデータの位置
         */
        fun parseEbmlElement(byteArray: ByteArray, startPosition: Int): Pair<MatroskaElement, Int> {
            var currentPosition = startPosition

            // ID をパース
            val idLength = byteArray[currentPosition].getElementLength()
            val idByteArray = byteArray.copyOfRange(currentPosition, currentPosition + idLength)
            val matroskaId = idByteArray.toMatroskaId()
            currentPosition += idLength

            // DataSize をパース
            val dataSizeLength = byteArray[currentPosition].getElementLength()
            // JavaScript の MediaRecorder は Segment / Cluster が DataSize が長さ不明になる
            val dataSize = byteArray.copyOfRange(currentPosition, currentPosition + dataSizeLength).getDataSize().let { dataSizeOrUnknown ->
                if (dataSizeOrUnknown == -1) {
                    // 長さ不明の場合は上から舐めて出す
                    val dataByteArray = byteArray.copyOfRange(currentPosition + UNKNOWN_DATA_SIZE.size, byteArray.size)
                    when (matroskaId) {
                        MatroskaId.Segment -> dataByteArray.analyzeUnknownDataSizeForSegmentData()
                        MatroskaId.Cluster -> dataByteArray.analyzeUnknownDataSizeForClusterData()
                        else -> throw RuntimeException("Cluster Segment 以外は長さ不明に対応していません；；")
                    }
                } else {
                    // 長さが求まっていればそれを使う
                    dataSizeOrUnknown
                }
            }
            currentPosition += dataSizeLength

            // Data を取り出す
            val dataByteArray = byteArray.copyOfRange(currentPosition, currentPosition + dataSize)
            currentPosition += dataSize

            // 返す
            val matroskaElement = MatroskaElement(matroskaId, dataByteArray)
            return matroskaElement to currentPosition
        }

        /**
         * [byteArray] から EBML 要素をパースする。
         * 親要素の場合は子要素まで再帰的に見つける。
         *
         * 一つだけ取りたい場合は [parseEbmlElement]
         * @param byteArray WebM のバイト配列
         * @return 要素一覧
         */
        fun parseAllEbmlElement(byteArray: ByteArray): List<MatroskaElement> {
            var readPosition = 0
            val elementList = arrayListOf<MatroskaElement>()

            while (true) {
                // 要素を取得し位置を更新
                val (element, currentPosition) = parseEbmlElement(byteArray, readPosition)
                elementList += element
                readPosition = currentPosition

                // 親要素の場合は子要素の解析をする
                if (element.matroskaId.isParent) {
                    val children = parseAllEbmlElement(element.data)
                    elementList += children
                }

                // 次のデータが 3 バイト以上ない場合は break（解析できない）
                // 3 バイトの理由ですが ID+DataSize+Data それぞれ1バイト以上必要なので
                if (byteArray.size <= readPosition + 3) {
                    break
                }
            }

            return elementList
        }

        // WebM の要素を全部パースする
        return parseAllEbmlElement(webmFileByteArray)
    }

}
```

とりあえず動くか試します。  
とりあえず`Java`で動く`Kotlin`で書いてから`Kotlin/JS`で動くようにしようと思うので、  
こんな感じに書いて、適当なところに`webm`ファイルを置いて、ファイルパスを直してください。

```kotlin
private const val WEBM_PATH = """C:\Users\takusan23\Downloads\record-1703001154715.webm"""

fun main(args: Array<String>) {
    // ファイルを読み出す
    val webmByteArray = File(WEBM_PATH).readBytes()
    // 要素のリストに
    val elementList = FixWebmSeek.parseWebm(webmByteArray)
    println(elementList.map { it.matroskaId })
}
```

あんまり関係ないですが、`Windows`でファイルパスのコピーはファイルを選んで`Shift + 右クリック`するとコンテキストメニューに`パスのコピー`というメニューが出てきます。それを押せば簡単にできます。  
何故か`Shiftキー`を押しながら右クリックしないと出てきません。

![Imgur](https://imgur.com/U6pN57q.png)

適当に動かしてみました、  
`println`で`WebM`の中身が出力されていれば成功です！！

![Imgur](https://imgur.com/fro1z83.png)

## WebM をシークできるように組み立て直す
`WebM`をそれぞれの要素に分解出来たので、シークのために必要な要素を追加して、`WebM`を完成させます。  
やるべきことは上の方で説明した通りで、

- 動画の時間を入れる
    - `Info`の中に`Duration`を入れる
- `Cue`を`Cluster`の後に入れる
- `Info`、`Tracks`、`Cue`の開始位置を宣言する`SeekHead`を入れる

というわけで、それらをやる処理です。  
めんどくさくなったので詳しくはコメント見てください。

```kotlin
object FixWebmSeek {

    // 省略 ...

    /**
     * [parseWebm]で出来た要素一覧を元に、シークできる WebM を作成する
     *
     * @param elementList [parseWebm]
     * @return シークできる WebM のバイナリ
     */
    fun fixSeekableWebM(elementList: List<MatroskaElement>): ByteArray {

        /** SimpleBlock と Timestamp から動画の時間を出す */
        fun getVideoDuration(): Int {
            val lastTimeStamp = elementList.filterId(MatroskaId.Timestamp).last().data.toInt()
            // Cluster は 2,3 バイト目が相対時間になる
            val lastRelativeTime = elementList.filterId(MatroskaId.SimpleBlock).last().data.copyOfRange(1, 3).toInt()
            return lastTimeStamp + lastRelativeTime
        }

        /** 映像トラックの番号を取得 */
        fun getVideoTrackNumber(): Int {
            var videoTrackIndex = -1
            var latestTrackNumber = -1
            var latestTrackType = -1
            for (element in elementList) {
                if (element.matroskaId == MatroskaId.TrackNumber) {
                    latestTrackNumber = element.data.toInt()
                }
                if (element.matroskaId == MatroskaId.TrackType) {
                    latestTrackType = element.data.toInt()
                }
                if (latestTrackType != -1 && latestTrackNumber != -1) {
                    if (latestTrackType == 1) {
                        videoTrackIndex = latestTrackNumber
                        break
                    }
                }
            }
            return videoTrackIndex
        }

        /**
         * Cluster を見て [MatroskaId.CuePoint] を作成する
         *
         * @param clusterStartPosition Cluster 開始位置
         * @return CuePoint
         */
        fun createCuePoint(clusterStartPosition: Int): List<MatroskaElement> {
            // Cluster を上から見ていって CuePoint を作る
            val cuePointList = mutableListOf<MatroskaElement>()
            // 前回追加した Cluster の位置
            var prevPosition = clusterStartPosition
            elementList.forEachIndexed { index, element ->
                if (element.matroskaId == MatroskaId.Cluster) {
                    // Cluster の子から時間を取り出して Cue で使う
                    var childIndex = index
                    var latestTimestamp = -1
                    var latestSimpleBlockRelativeTime = -1
                    while (true) {
                        val childElement = elementList[childIndex++]
                        // Cluster のあとにある Timestamp を控える
                        if (childElement.matroskaId == MatroskaId.Timestamp) {
                            latestTimestamp = childElement.data.toInt()
                        }
                        // Cluster から見た相対時間
                        if (childElement.matroskaId == MatroskaId.SimpleBlock) {
                            latestSimpleBlockRelativeTime = childElement.data.copyOfRange(1, 3).toInt()
                        }
                        // Cluster の位置と時間がわかったので
                        if (latestTimestamp != -1 && latestSimpleBlockRelativeTime != -1) {
                            cuePointList += MatroskaElement(
                                MatroskaId.CuePoint,
                                byteArrayOf(
                                    *MatroskaElement(MatroskaId.CueTime, (latestTimestamp + latestSimpleBlockRelativeTime).toByteArray()).toEbmlByteArray(),
                                    *MatroskaElement(
                                        MatroskaId.CueTrackPositions,
                                        byteArrayOf(
                                            *MatroskaElement(MatroskaId.CueTrack, getVideoTrackNumber().toByteArray()).toEbmlByteArray(),
                                            *MatroskaElement(MatroskaId.CueClusterPosition, prevPosition.toByteArray()).toEbmlByteArray()
                                        )
                                    ).toEbmlByteArray()
                                )
                            )
                            break
                        }
                    }
                    // 進める
                    prevPosition += element.toEbmlByteArray().size
                }
            }
            return cuePointList
        }

        /** SeekHead を組み立てる */
        fun reclusiveCreateSeekHead(
            infoByteArraySize: Int,
            tracksByteArraySize: Int,
            clusterByteArraySize: Int
        ): MatroskaElement {

            /**
             * SeekHead を作成する
             * 注意しないといけないのは、SeekHead に書き込んだ各要素の位置は、SeekHead 自身のサイズを含めた位置にする必要があります。
             * なので、SeekHead のサイズが変わった場合、この後の Info Tracks の位置もその分だけズレていくので、注意が必要。
             */
            fun createSeekHead(seekHeadSize: Int): MatroskaElement {
                val infoPosition = seekHeadSize
                val tracksPosition = infoPosition + infoByteArraySize
                val clusterPosition = tracksPosition + tracksByteArraySize
                // Cue は最後
                val cuePosition = clusterPosition + clusterByteArraySize
                // トップレベル要素、この子たちの位置を入れる
                val topLevelElementList = listOf(
                    MatroskaId.Info to infoPosition,
                    MatroskaId.Tracks to tracksPosition,
                    MatroskaId.Cluster to clusterPosition,
                    MatroskaId.Cues to cuePosition
                ).map { (tag, position) ->
                    MatroskaElement(
                        MatroskaId.Seek,
                        byteArrayOf(
                            *MatroskaElement(MatroskaId.SeekID, tag.byteArray).toEbmlByteArray(),
                            *MatroskaElement(MatroskaId.SeekPosition, position.toByteArray()).toEbmlByteArray()
                        )
                    )
                }
                val seekHead = MatroskaElement(MatroskaId.SeekHead, topLevelElementList.map { it.toEbmlByteArray() }.concatByteArray())
                return seekHead
            }

            // まず一回 SeekHead 自身のサイズを含めない SeekHead を作る。
            // これで SeekHead 自身のサイズが求められるので、SeekHead 自身を考慮した SeekHead を作成できる。
            var prevSeekHeadSize = createSeekHead(0).toEbmlByteArray().size
            var seekHead: MatroskaElement
            while (true) {
                seekHead = createSeekHead(prevSeekHeadSize)
                val seekHeadSize = seekHead.toEbmlByteArray().size
                // サイズが同じになるまで SeekHead を作り直す
                if (prevSeekHeadSize == seekHeadSize) {
                    break
                } else {
                    prevSeekHeadSize = seekHeadSize
                }
            }

            return seekHead
        }

        // Duration 要素を作る
        val durationElement = MatroskaElement(MatroskaId.Duration, getVideoDuration().toFloat().toBits().toByteArray())
        // Duration を追加した Info を作る
        val infoElement = elementList.filterId(MatroskaId.Info).first().let { before ->
            before.copy(data = before.data + durationElement.toEbmlByteArray())
        }

        // ByteArray にしてサイズが分かるように
        val infoByteArray = infoElement.toEbmlByteArray()
        val tracksByteArray = elementList.filterId(MatroskaId.Tracks).first().toEbmlByteArray()
        val clusterByteArray = elementList.filterId(MatroskaId.Cluster).map { it.toEbmlByteArray() }.concatByteArray()
        // SeekHead を作る
        val seekHeadByteArray = reclusiveCreateSeekHead(
            infoByteArraySize = infoByteArray.size,
            tracksByteArraySize = tracksByteArray.size,
            clusterByteArraySize = clusterByteArray.size
        ).toEbmlByteArray()

        // Cues を作る
        val cuePointList = createCuePoint(seekHeadByteArray.size + infoByteArray.size + tracksByteArray.size)
        val cuesByteArray = MatroskaElement(MatroskaId.Cues, cuePointList.map { it.toEbmlByteArray() }.concatByteArray()).toEbmlByteArray()

        // Segment 要素に書き込むファイルが完成
        // 全部作り直しになる副産物として DataSize が不定長ではなくなります。
        val segment = MatroskaElement(
            MatroskaId.Segment,
            byteArrayOf(
                *seekHeadByteArray,
                *infoByteArray,
                *tracksByteArray,
                *clusterByteArray,
                *cuesByteArray
            )
        )

        // シークできるように修正した WebM のバイナリ
        // WebM 先頭の EBML を忘れずに、これは書き換える必要ないのでそのまま
        return byteArrayOf(
            *elementList.filterId(MatroskaId.EBML).first().toEbmlByteArray(),
            *segment.toEbmlByteArray()
        )
    }

}
```

あとはこれを`parseWebm`の返り値と組み合わせて使えば動きます。  
適当にダウンロードフォルダにでも保存するようにしましょう。

```kotlin
import java.io.File

private const val WEBM_PATH = """C:\Users\takusan23\Downloads\record-1703001154715.webm"""
private val DOWNLOAD_FOLDER = File(System.getProperty("user.home"), "Downloads")

fun main(args: Array<String>) {
    // ファイルを読み出す
    val webmByteArray = File(WEBM_PATH).readBytes()
    // 要素のリストに
    val elementList = FixWebmSeek.parseWebm(webmByteArray)
    // シークできる WebM にする
    val seekableWebmByteArray = FixWebmSeek.fixSeekableWebM(elementList)
    // 保存する
    File(DOWNLOAD_FOLDER, "fix_webm_seek_kotlin_${System.currentTimeMillis()}.webm").writeBytes(seekableWebmByteArray)
}
```

どうでしょう？  
シークバー、進んでますか？シークも出来ますか？

![Imgur](https://imgur.com/0MXSnkZ.png)

ブラウザでももちろん見れます。やった～～～

![Imgur](https://imgur.com/jkQcxHR.png)

`mkvtoolnix`で見てみます。こんな感じ  
`SeekHead`、`Cue`がそれぞれありますね。  
また、要素を入れ直している関係で、長さ不明だった`DataSize`が**確定していますね**。パーサーに優しくなった

![Imgur](https://imgur.com/GLQSNV2.png)

## 動画の時間だけ入れればシークできるかも（プレイヤー次第、多分良くない）
動画の長さ、`Duration`さえ入っていればシークできるプレイヤー実装があるらしいです。  
が、まちまちなのでやっぱり `Cue` や `SeekHead` も入れないとダメなはずです。

- 動画の長さが無くてもシークできる
    - なんで・・・？出来るの（先読みしてるの？）
    - Firefox
- 動画の長さがあればシークできる
    - 動画時間と再生位置を元に Cluster の位置を探すんですかね
    - Chrome
    - VLC（Windows / Android）
- 動画の長さ + Cue + SeekHead？ があって初めてシークできる
    - 大半がこっちのはず。
    - シークバーは進むけど、シークしようとすると戻される、そもそもシークバーのつまみの部分が表示されないなど。
    - Windows の動画プレイヤー
    - Android の Google フォト / Files by Google
    - Android の media3（動画再生ライブラリ）

# ここまでのソースコード
どうぞ  
多分最新の IDEA で動くはず。

https://github.com/takusan23/FixSeekableWebmKotlin

# Kotlin/JS で使う
`JavaScript`の`MediaRecorder`で出来る`WebM`をシーク出来るようにするためにわざわざ`IDEA`起動するのは面倒！  
なんなら画面録画からシーク可能に修正までブラウザで出来ると良いので`Kotlin/JS`で動かします！

## Kotlin/JS プロジェクトを作る
セットアップ方法がなんか難しくなった？  
前は`Kotlin/JS`すぐ使えた気がするんだけど

公式：  
https://kotlinlang.org/docs/js-project-setup.html

うーん、前は新規プロジェクト作成で`Kotlin/JS`単品が選べた気がするんですけど、、今見ると`Kotlin Multiplatform`でしか作れない？  
わかんない・・

とりあえずは`Kotlin/JVM`なプロジェクトを作った後に、`Kotlin/JS`で動くように直そうと思います。  
てな感じで`New Project`で作っていきます。`Gradle`は`build.gradle.kts`の方にします。（ほんとに無いの？）

![Imgur](https://imgur.com/AfOnVTb.png)

次に`build.gradle.kts`を開いて、`Kotlin/JS` 用に直します。  
`jvm`用の設定が消えた

```kotlin
plugins {
    kotlin("multiplatform") version "1.9.22"
}

group = "io.github.takusan23"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

kotlin {
    js {
        browser {
            // webpack とか
        }
        binaries.executable()
    }
}
```

多分コピペ直後は赤くなってるので、`Gradle Sync`しましょう。  
これです

![Imgur](https://imgur.com/Aw8cXGz.png)

ここに置けば良いって書いてあるのでそうします。  
https://kotlinlang.org/docs/running-kotlin-js.html

`src`を右クリックして、ディレクトリを作ります。  
`jsMain/kotlin`です。

![Imgur](https://imgur.com/elKf65k.png)

出来たら`src/jsMain/kotlin`へ移動して、`App.kt`を作ります。  
![Imgur](https://imgur.com/3XNhb0r.png)

適当に`console.log`するコードを置いておきます。  
![Imgur](https://imgur.com/tvnxjV6.png)

そしたらもう`jvm`の方はいらないので、この2つは消して良いはず。  
![Imgur](https://imgur.com/zMgr5pm.png)

次に`index.html`を置きます。  
さっきと同じ用にディレクトリを作る画面を出して、今度は`jsMain/resources`を選びます。  
![Imgur](https://imgur.com/e4EguS1.png)

そしたら`src/jsMain/resources`に`index.html`を作ります。  
![Imgur](https://imgur.com/WUrm6tc.png)

`index.html`の中身はそれぞれ調整しないといけないので注意してね。  
調整しないといけない項目は、
- `<title>`
    - すきな文字に
- `<script>`の`src`属性の値
    - `{こ↑こ↓}.js`のここの名前は、プロジェクト名にする必要があります。
    - ![Imgur](https://imgur.com/DLY24XJ.png)
    - 多分`build.gradle.kts`の`webpack`の設定で好きに変えられるとは思います

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>FixSeekableWebmKotlinJs</title>
</head>
<body>
<script src="FixSeekableWebmKotlinJs.js"></script>
</body>
</html>
```

ここまで出来たら実行できます。やってみましょう。

### 実行（ホットリロードあり）

https://kotlinlang.org/docs/running-kotlin-js.html#run-the-browser-target  
https://kotlinlang.org/docs/dev-server-continuous-compilation.html  

ホットリロード付きです。  
`Web`界隈の開発では当たり前なのか`React Native`とかでもホットリロードされててすごいと思った。  

`Gradle`のコマンドを実行できる`Execute Gradle Task`を開きます。  
`IDEA`の右側に🐘さんのマークがあるはずなので押してこれ押す。  
![Imgur](https://imgur.com/K29OXzf.png)

もし見つけられなかったら、`View`から`Tool Windows`から`Gradle`を押してもいいです。  
![Imgur](https://imgur.com/lQziDR4.png)

そしたら以下を打ち込んで実行です！

```gradle
gradle jsRun --continuous 
```

どうでしょう？勝手にブラウザが開いて`localhost:8080`が開くはず？  
![Imgur](https://imgur.com/G8yu6j5.png)

`index.html`に何も無いので真っ白ですが、`F12`を押して`Console`を押すと・・・  
ありました！`Hello`！

![Imgur](https://imgur.com/s1RQRT5.png)

多分ちゃんとホットリロードになってるはず。

## さっき作った WebM をシークできるようにするコードを持ってくる
ちなみに`Kotlin/JVM`で動かしてたものが`Kotlin/JS`で何で動かせるんやって話ですが、  
`Java`の機能を使ってないからなんですよね（さっきも話した気が  

確かに`Main.kt`では`import java.xxxx`で`Java`の機能を呼び出していますが、  
それ以外のファイルでは`import java.xxx`等は出てきていません。また`Kotlin/JVM`でしか動かない拡張関数も使っていないので、そのままコピペできるわけです。

というわけで持ってきました。  
![Imgur](https://imgur.com/SmVMhXS.png)

## 画面を作る（html を書く）
適当に画面を作ります。  
最低限必要なのは、`.webm`ファイルを選ばせる`<input type="file">`ですね。  
久しぶりに`getElementById`とかを使うな、、、`Kotlin/JS`から触る要素には`id`を付けています。

`index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>FixSeekableWebmKotlinJs</title>
</head>
<style>
    .column {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
</style>
<body>
<div class="column">
    <h1>JavaScript の MediaRecorder で作った WebM をシーク可能な WebM ファイルに修正する Kotlin/JS</h1>
    <p>処理はすべてブラウザ側の JavaScript で完結します。</p>

    <form>
        <label for="webm_picker">WebM ファイル:</label>
        <input type="file" id="webm_picker" accept="video/webm"/>
    </form>

    <button id="start_button">処理を開始</button>

    <p id="status_text">進捗</p>
</div>
<script src="FixSeekableWebmKotlinJs.js"></script>
</body>
</html>
```

つくりました、`CSS`何も分からん、、  
![Imgur](https://imgur.com/ep1BalM.png)

## Kotlin/JS を書く
`Kotlin/JS`なので、もちろん`DOM`操作や、`alert`、`fetch`なんかも出来ます。  
`JS`の`API`が無理やり`Kotlin`に来た感じなので型がところどころ`dynamic`になってますね。

```kotlin
import kotlinx.browser.document
import kotlinx.browser.window

fun main() {
    console.log("Hello, Kotlin/JS! こんにちは")
    document
    window.fetch()
    window.alert()
}
```

で、まずは選んだファイルを取り出す処理ですね。  
https://developer.mozilla.org/ja/docs/Web/API/File_API/Using_files_from_web_applications

`App.kt`

```kotlin
import kotlinx.browser.document
import kotlinx.browser.window
import org.w3c.dom.HTMLInputElement
import org.w3c.files.Blob
import org.w3c.files.FileReader
import org.w3c.files.get

fun main() {
    val buttonElement = document.getElementById("start_button")!!
    val statusElement = document.getElementById("status_text")!!
    val inputElement = document.getElementById("webm_picker")!! as HTMLInputElement

    // ボタンを押した時
    buttonElement.addEventListener("click", {

        // 選択したファイル
        val selectWebmFile = inputElement.files?.get(0)
        if (selectWebmFile == null) {
            window.alert("WebM ファイルを選択して下さい")
            return@addEventListener
        }

        // JavaScript の FileReader で WebM の ByteArray を取得する
        val fileReader = FileReader()
        fileReader.onload = {
            // ロード完了
            statusElement.textContent = "ロード完了"

            // なんか適当に値を返しておく必要がある？
            Unit
        }

        // ロード開始
        statusElement.textContent = "ロード中です"
        fileReader.readAsArrayBuffer(selectWebmFile)
    })

}
```

これでとりあえず`WebM`のロード処理ができました。  
適当に選ぶと`ロード完了`って出るはず

![Imgur](https://imgur.com/omQRwbK.png)

## WebM をシーク可能にする処理
`JavaScript`の`FileReader`はバイト配列の表現に`ArrayBuffer`を使います。`JS`のですね。  
一方`Kotlin`はバイト配列の表現に`ByteArray`を使うので、変換しないとさっき書いた`WebM`をシーク可能にする処理が使えないです。  

で既に同じような人がいたのでそれに乗っかります。  
https://youtrack.jetbrains.com/issue/KT-30098

後はさっきのロード完了のあとに書き足していけば良いはず。  
というわけでパースして修正して組み立て直してダウンロードまで書きました。やった～

ダウンロードはこの辺参考にしました  
https://javascript.keicode.com/newjs/download-files.php

```kotlin
fun main() {
    val buttonElement = document.getElementById("start_button")!!
    val statusElement = document.getElementById("status_text")!!
    val inputElement = document.getElementById("webm_picker")!! as HTMLInputElement

    // ボタンを押した時
    buttonElement.addEventListener("click", {

        // 選択したファイル
        val selectWebmFile = inputElement.files?.get(0)
        if (selectWebmFile == null) {
            window.alert("WebM ファイルを選択して下さい")
            return@addEventListener
        }

        // JavaScript の FileReader で WebM の ByteArray を取得する
        val fileReader = FileReader()
        fileReader.onload = {
            // ロード完了
            statusElement.textContent = "ロード完了"

            // WebM のバイナリを取る
            val webmByteArray = (fileReader.result as ArrayBuffer).asByteArray()

            // 処理を始める
            // パース処理
            statusElement.textContent = "WebM を分解しています"
            val elementList = FixWebmSeek.parseWebm(webmByteArray)

            // 修正と再組み立て
            statusElement.textContent = "WebM へシーク時に必要な値を書き込んでいます"
            val seekableWebmByteArray = FixWebmSeek.fixSeekableWebM(elementList)

            // ダウンロード
            statusElement.textContent = "終了しました"
            seekableWebmByteArray.downloadFromByteArray()

            // なんか適当に値を返しておく必要がある？
            Unit
        }
        fileReader.readAsArrayBuffer(selectWebmFile)
    })

}

/** JS の ArrayBuffer を Kotlin の ByteArray にする */
private fun ArrayBuffer.asByteArray(): ByteArray = Int8Array(this).unsafeCast<ByteArray>()

/** ByteArray をダウンロードさせる */
private fun ByteArray.downloadFromByteArray() {
    // Blob Url
    val blob = Blob(arrayOf(this), BlobPropertyBag(type = "video/webm"))
    val blobUrl = URL.createObjectURL(blob)
    // <a> タグを作って押す
    val anchor = document.createElement("a") as HTMLAnchorElement
    anchor.href = blobUrl
    anchor.download = "fix-seekable-webm-kotlinjs-${Date.now()}.webm"
    document.body?.appendChild(anchor)
    anchor.click()
    anchor.remove()
}
```

どうでしょうか？  
ちゃんとシークできる`WebM`がダウンロード出来ましたか？

![Imgur](https://imgur.com/HxmWZJf.png)

うおおおおお～  
ブラウザで録画して、ブラウザでシークできる`WebM`が出来るようになった！！！

![Imgur](https://imgur.com/NvyR4Ia.png)

`Firefox`でも動いた  
![Imgur](https://imgur.com/GgnIPbo.png)

# 公開する
`index.html`と`Kotlin/JS`の`js`ファイルは`Gradle`の`Build`で出来るはず？  
ドキュメント見たけど無さそうでよくわからない。とりあえず出来ているので良いのかな？

![Imgur](https://imgur.com/PAT0AbL.png)

もしくは

![Imgur](https://imgur.com/Dn2fRxg.png)

保存先はここのはず。

![Imgur](https://imgur.com/13ZNvzy.png)

インターネットで公開したい！！

## ホスティングする（インターネットへ公開する）
静的サイトなので、適当な静的サイトホスティングサービスにアップロードすれば誰でもアクセスして使えるはずです。  
でも静的サイト生成に`Java`が必要なことってあんまり無いと思うから、そのホスティングサービスのビルド環境に入ってるか分からなくて調べたけど、`Netlify / Cloudflare Pages`には入ってそう。

使う際は  
`Build command`は`chmod +x ./gradlew && ./gradlew build`にします。  
`Build output directory`は`/build/dist/js/productionExecutable`です。

今回は疲れたのでデプロイの部分は省略します。  
最近はなんとなく`Amazon S3 + CloudFront`がマイブーム（？）なのでそこに上げます。  

詳しくは前書いたからそっち見て、ビルドコマンドとかが違うだけで使い回せると思う：  
https://takusan.negitoro.dev/posts/aws_sitatic_site_hosting/

# 完成品（再掲）

https://webm.negitoro.dev

# ソースコード

- Java の方
    - https://github.com/takusan23/FixSeekableWebmKotlin
- JavaScript の方（ブラウザで動く方）
    - https://github.com/takusan23/FixSeekableWebmKotlinJs


# おまけ
せっかくなので画面録画機能も合体させました。  
`JavaScript`で出来た画面録画のコードをそのまま`Kotlin/JS`で呼べるようにしただけです。

![Imgur](https://imgur.com/Z9HjESP.png)

`Kotlin/JS`の定義に`MediaRecorder`が無くてなんか`JavaScript`コードを埋め込む感じになっちゃった。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Kotlin/JS で作った WebM ツール</title>
</head>
<style>
    .column {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
</style>
<body>
<div class="column">
    <h1>JavaScript の MediaRecorder で画面録画するやつ。</h1>
    <p>処理はすべてブラウザ側の JavaScript で完結します。WebM
        ファイルが生成されます。そのままではシークできないので、下のツールを使ってください。</p>

    <button id="record_button">録画開始・終了</button>

    <h1>JavaScript の MediaRecorder で作った WebM をシーク可能な WebM ファイルに修正する Kotlin/JS。</h1>
    <p>処理はすべてブラウザ側の JavaScript で完結します。</p>

    <form>
        <label for="webm_picker">WebM ファイル:</label>
        <input type="file" id="webm_picker" accept="video/webm"/>
    </form>

    <button id="start_button">処理を開始</button>

    <p id="status_text">進捗</p>

    <a href="https://github.com/takusan23/FixSeekableWebmKotlinJs">ソースコード</a>
</div>
<script src="FixSeekableWebmKotlinJs.js"></script>
</body>
</html>
```

```kotlin
fun main() {
    setupScreenRecorde()
    setupWebmSeekable()
}

/** 画面録画のやつの初期化 */
private fun setupScreenRecorde() {
    val recordButtonElement = document.getElementById("record_button")!!
    var mediaStream: MediaStream? = null
    var mediaRecorder: dynamic = null

    /** 録画データ */
    val chunks = arrayListOf<Blob>()

    /** 録画中か */
    var isRecording = false

    fun startRecord() {
        // ここから先 Kotlin/JS 側で定義がなかったため全部 dynamic です。こわい！
        val mediaDevicesPrototype = js("window.navigator.mediaDevices")
        // Promise です
        mediaDevicesPrototype.getDisplayMedia(
            json(
                "audio" to json("channelCount" to 2),
                "video" to true
            )
        ).then { displayMedia: MediaStream ->
            mediaStream = displayMedia
            // どうやら変数とかはそのまま文字列の中に埋め込めば動くらしい。なんか気持ち悪いけど動くよ
            mediaRecorder = js(""" new MediaRecorder(displayMedia, { mimeType: 'video/webm; codecs="vp9"' }) """)
            // 録画データが細切れになって呼ばれる
            mediaRecorder.ondataavailable = { ev: dynamic ->
                chunks.add(ev.data as Blob)
                Unit
            }
            // 録画開始
            mediaRecorder.start(100)
            isRecording = true
            // 適当に値を返す
            Unit
        }.catch { err: dynamic -> console.log(err); window.alert("エラーが発生しました") }
    }

    fun stopRecord() {
        // 録画を止める
        isRecording = false
        mediaRecorder.stop()
        mediaStream?.getTracks()?.forEach { it.stop() }
        // Blob にして保存
        Blob(chunks.toTypedArray(), BlobPropertyBag(type = "video/webm"))
            .downloadFile(fileName = "javascript-mediarecorder-${Date.now()}.webm")
    }

    recordButtonElement.addEventListener("click", {
        if (!isRecording) {
            startRecord()
        } else {
            stopRecord()
        }
    })
}

/** WebM をシーク可能にするやつの初期化 */
private fun setupWebmSeekable() {
    val buttonElement = document.getElementById("start_button")!!
    val statusElement = document.getElementById("status_text")!!
    val inputElement = document.getElementById("webm_picker")!! as HTMLInputElement

    // ボタンを押した時
    buttonElement.addEventListener("click", {

        // 選択したファイル
        val selectWebmFile = inputElement.files?.get(0)
        if (selectWebmFile == null) {
            window.alert("WebM ファイルを選択して下さい")
            return@addEventListener
        }

        // JavaScript の FileReader で WebM の ByteArray を取得する
        val fileReader = FileReader()
        fileReader.onload = {
            // ロード完了
            statusElement.textContent = "ロード完了"

            // WebM のバイナリを取る
            val webmByteArray = (fileReader.result as ArrayBuffer).asByteArray()

            // 処理を始める
            // パース処理
            statusElement.textContent = "WebM を分解しています"
            val elementList = FixWebmSeek.parseWebm(webmByteArray)

            // 修正と再組み立て
            statusElement.textContent = "WebM へシーク時に必要な値を書き込んでいます"
            val seekableWebmByteArray = FixWebmSeek.fixSeekableWebM(elementList)

            // ダウンロード
            statusElement.textContent = "終了しました"
            Blob(arrayOf(seekableWebmByteArray), BlobPropertyBag(type = "video/webm"))
                .downloadFile(fileName = "fix-seekable-webm-kotlinjs-${Date.now()}.webm")

            // なんか適当に値を返しておく必要がある？
            Unit
        }

        // ロード開始
        statusElement.textContent = "ロード中です"
        fileReader.readAsArrayBuffer(selectWebmFile)
    })
}

/** JS の ArrayBuffer を Kotlin の ByteArray にする */
private fun ArrayBuffer.asByteArray(): ByteArray = Int8Array(this).unsafeCast<ByteArray>()

/** [Blob]をダウンロードする */
private fun Blob.downloadFile(fileName: String) {
    // Blob Url
    val blobUrl = URL.createObjectURL(this)
    // <a> タグを作って押す
    val anchor = document.createElement("a") as HTMLAnchorElement
    anchor.href = blobUrl
    anchor.download = fileName
    document.body?.appendChild(anchor)
    anchor.click()
    anchor.remove()
}
```

# おわりに
`Kotlin/JS`良いですね。プロジェクトの作り方分からんのだけはどうにかして欲しい。  
`JavaScript`でバイナリ操作するのやったこと無いから`Kotlin`で書いてみたけど、こういう使い方が良いのかな。あと既に`Kotlin`のコードがあってブラウザで動かしたいとか？

`MediaRecorder`みたいに`JavaScript`全部の`API`があるわけじゃないらしい（？）ので気をつけないといけない。。。  
ちなみに、`js()`の文字列は定数である必要があるので、変数埋め込みとか使うと怒られる。  
が、が、が、展開されるので、名前があっていれば変数等にそのままアクセスできます。

```kotlin
val displayMedia = ...
// 変数等を渡したい場合は、テンプレートではなく変数名をそのまま JavaScript のコードの中に埋め込めばおっけー
val mediaRecorder = js(""" new MediaRecorder(displayMedia, { mimeType: 'video/webm; codecs="vp9"' }) """)
```

もう疲れたのでやり残したこととか

## メモリ的によろしくないかも
説明難しいから擬似コードで書きますが、、  
こんな感じに、`Cluster`も（他の親要素もですが）`ByteArray`を持っているんですよね。  
この`ByteArray`、子要素全体の`ByteArray`になっているので、この後に続く子要素分も足すとメモリが二倍消費になっているはずです。  
同じデータ（`ByteArray`）をメモリに2つも持ってるのでめっちゃよろしく無い実装かもしれないです。

```kotlin
Element(Cluster, [0x00,0x00,0x00,0x00,0x00]) // Cluster の子要素全体 の ByteArray。この後に続く SimpleBlock の分まで持ってる
Element(Timestamp, [0x00,0x00,0x00,0x00,0x00]) // 各子要素 の ByteArray
Element(SimpleBlock, [0x00,0x00,0x00,0x00,0x00])
Element(SimpleBlock, [0x00,0x00,0x00,0x00,0x00])
Element(SimpleBlock, [0x00,0x00,0x00,0x00,0x00])
```

## Chrome の作った WebM は途中でぶった斬る？
`DataSize`の大きさだけ`ByteArray`を取り出そうとすると足りない時がある（私のパーサーの実装ミスかも）  
とりあえず次の要素のパースの前に後続が 3 バイト以上あるか確認するようにしました。  
（`ID`+`DataSize`+`Data`でそれぞれ最低 1 バイトずつ使えば 3 バイトになるはず）

# 参考にしました
ありがとうございます！！！

- https://scrapbox.io/unarist/MediaRecorderAPIで作ったwebmをseekableにしたい
- https://qiita.com/legokichi/items/83871e1f034331222fd2
- https://trap.jp/post/1145/