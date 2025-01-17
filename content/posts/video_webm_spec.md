---
title: WebMを攻略する
created_at: 2022-10-13
tags:
- WebM
- Kotlin
---
どうもこんばんわ。  
最近ずっと フルスロットルHeart っていう曲聞いてる、、掛け合いめっちゃよい

# 本題
コンテナフォーマットの一つ、`WebM`を解析したり、組み立てたりするコードを書けるようになりましょう。（？）  
これ https://github.com/takusan23/ZeroMirror の中の WebMへ書き込む処理 https://github.com/takusan23/ZeroMirror/tree/master/zerowebm を作ってる際に調査したやつ

## 環境
`Kotlin`で書きます。  
あと 2/10/16進数 の変換ができる電卓が必要です（Windows 10 の最初から入ってる電卓のプログラマーモードでOKです）

# ざっくり WebM
`WebM`ってのは音声と映像を一つのファイルに保存する技術の名前で、`mp4`、`mpeg2-ts`とかの仲間です（`H.264`/`H.265`/`VP8`/`VP9`等のコーデックの仲間ではないです。コーデックでエンコードしたデータを保存する技術です）  
（`Android`では`MediaMuxer`を使えばらくらく保存できるのですが、ストリーミングできる`WebM`を作りたかったので）

動画ファイルの拡張子が`mp4`以外だったときランキングで、三番目ぐらいに居座ってそう。（avi,mov の次くらい？、iPhoneが mov らしいのよね）

`WebM`は`Matroska`のサブセットになってます。ので仕様書なんかは`Matroska`のを見るのが良いと思う。  
コーデックは`VP8`/`VP9`/`Opus`などが対応しています。保存方法には`EBML`を使ってます（`Matroska`がそう）。

## WebM を見るアプリ
MKVToolNix ってのがあります。これが神レベルで使いやすい。
DLしたら mkvtoolnix-gui.exe を起動して、`infoツール`にして`webm`をドラッグアンドドロップすれば見れます。

https://mkvtoolnix.download/

![Imgur](https://i.imgur.com/mJvsTSm.png)

## ざっくり EBML
よく `xml` と言われてますが、`xml`にはある終了タグや属性などはないのでどっちかというと `yml (yaml)` が近いと思います。  
終了タグが無いので、タグの後についてる長さを見て子要素、データを取り出していきます。  

こんな感じで入ってる（かなり端折った

```yml
- EBML
    - EBML version
        - Data size 1
        - Data 1
    - EBML read version
        - Data size 1
        - Data 1
    - Maximum EBML ID Length
        - Data size 1
        - Data 4
- Segment
    - Info
        - Timestamp scale
            - Data size 4
            - Data 1000000
        - Writing app
            - Data size 10
            - Data zeromirror
    - Tracks
        - Track
            - Track number
                - Data size 1
                - Data 1
            - Track type
                - Data size 1
                - Data 1
            - Codec id
                - Data size 5
                - Data V_VP9
```

## バイナリを見る
実際のバイナリを見ながら、もう少し解説を  
ちなみに以下のバイナリは最適化してない（難しそうだったので、後述）ので本来であればもっと短くなります。

```
 1A 45 DF A3 10 00 00 34 42 86 10 00 00 01 01 42
 F7 10 00 00 01 01 42 F2 10 00 00 01 04 42 F3 10
 00 00 01 08 42 82 10 00 00 04 77 65 62 6D 42 87
 10 00 00 01 02 42 85 10 00 00 01 02 18 53 80 67
 01 FF FF FF FF FF FF FF 15 49 A9 66 10 00 00 34
 2A D7 B1 10 00 00 04 00 0F 42 40 4D 80 10 00 00
 13 7A 65 72 6F 6D 69 72 72 6F 72 5F 7A 65 72 6F
 77 65 62 6D 57 41 10 00 00 0A 7A 65 72 6F 6D 69
 72 72 6F 72 16 54 AE 6B 10 00 00 87 AE 10 00 00
 32 D7 10 00 00 01 01 73 C5 10 00 00 01 01 86 10
 00 00 05 56 5F 56 50 39 83 10 00 00 01 01 E0 10
 00 00 10 B0 10 00 00 03 00 05 00 BA 10 00 00 03
 00 02 D0 AE 10 00 00 4B D7 10 00 00 01 02 73 C5
 10 00 00 01 02 86 10 00 00 06 41 5F 4F 50 55 53
 83 10 00 00 01 02 63 A2 10 00 00 13 4F 70 75 73
 48 65 61 64 01 02 00 00 80 BB 00 00 00 00 00 E1
 10 00 00 0F B5 10 00 00 04 47 3B 80 00 9F 10 00
 00 01 02 1F 43 B6 75 01 FF FF FF FF FF FF FF E7
 10 00 00 04 00 00 00 00
```

### バイナリのレイアウト

こんなのがずっっっと続いてます。

|                                     |                                     |                                      |
|-------------------------------------|-------------------------------------|--------------------------------------|
| ID                                  | Data size                           | Data                                 |
| なんのデータかを示します            | Data のサイズです                   | データです。数値/ASCII/バイナリ など |
| サイズは可変長 (後述)、Max 4バイト? | サイズは可変長  (後述)、Max 8バイト | Data size の値                       |

たとえば...

```
57 41 10 00 00 0a 7a 65 72 6f 6d 69 72 72 6f 72
```

の場合は

| バイナリ | 0x57 0x41   | 0x10 0x00 0x00 0x0A | 0x7A 0x65 0x72 0x6F 0x6D 0x69 0x72 0x72 0x6F 0x72 |
|----------|-------------|---------------------|---------------------------------------------------|
| なに？   | ID          | Data size           | Data                                              |
| あたい   | Writing App | 10                  | zeromirror                                        |

になります！（なんでこうなるのかをこれから書きます）

### バイナリの読み方 ID編
IDの一覧はこれです：https://www.matroska.org/technical/elements.html

まずは ID から。`ID`はその名の通りデータが何なのかを示すものです。  
で、IDなのですが、**これ賢くて**、2進数にした後に左から何ビット目に1が立っているかでIDの長さが分かっちゃう用になってます！。  
例えば上記の `Writing App` の `0x57 0x41` を2進数にした場合

| 16進数    | 2進数               |
|-----------|---------------------|
| 0x57 0x41 | 0101 0111 0100 0001 |

こうなります（`5`を2進にすると`101`ですが、4桁に合わせるため先頭に`0`を入れてます）

で、`1`が左から2ビット目に立ってますよね？すると上記のIDは **2バイト分** になります！！！  
2バイト取り出した`0x57 0x41`をID一覧と見比べると`Writing App`であるとわかりますね！

これを **VINT** というらしいですよ？（データのサイズを含めつつ、ちゃんと目印としても使える）

他に例をもう一個、 `Cluster` のIDを見てみると

| 16進数              | 2進数                                   |
|---------------------|-----------------------------------------|
| 0x1F 0x43 0xB6 0x75 | 0001 1111 0100 0011 1011 0110 0111 0101 |

こうなりますね？（変換後は`1 1111 0100 0011 1011 0110 0111 0101`になりますが、4桁揃えにするため `0001 1111 0100 0011 1011 0110 0111 0101`にしてます）

![Imgur](https://i.imgur.com/1Snu6co.png)

で、`1`が左から4番目に立ってますので、IDは**4バイト分**と判断できるわけです。  
4バイト取り出した `0x1F 0x43 0xB6 0x75` をID一覧から探すと `Cluster` であるとわかりますね。

多分最大 4バイト までだと思います。  

あ、VINTのわかりやすい表があったので貼っておきますね

https://github.com/ietf-wg-cellar/ebml-specification/blob/master/specification.markdown#vint-examples

### バイナリの読み方 Data size 編
実際に`Data size`で合ってるのかはわからない...（`Content size`説？  
これは Data が何バイト分かを示すものです。で、こいつ自信も可変長です。

例え行きましょう。上記の`Writing App`で

| 16進数              | 2進数                                   |
|---------------------|-----------------------------------------|
| 0x10 0x00 0x00 0x0A | 0001 0000 0000 0000 0000 0000 0000 1010 |

ここでやらないといけないのは、`Data size 自身の長さ`と`Data の長さ`を出すことです。  
`Data size`自身の長さは ID のときと同じように、左から1が何ビット目に立っているかで判断できます。  
ただ、IDと違って`Data size`は最大8バイトまであります。  
今回は`1`が左から4バイト目に立っているため、`Data size`自身は4バイトあることがわかります。  

で、2進数にした後に左から`1`を抜いたあと10進数にした値が、`Data`の長さになります。  
`0001 0000 0000 0000 0000 0000 0000 1010` -> `0000 0000 0000 0000 0000 0000 0000 1010` -> 2進数を10進数にした`10`

`Data`は10バイトです！

これもわかりやすい表があったので貼っておきますね

https://www.matroska.org/technical/notes.html#ebml-lacing

### バイナリの読み方 Data 編
`Data size`で出した長さだけあります。  
そのデータが 数値 / ASCII / バイナリ / 入れ子 など何のデータかはIDの一覧から見て下さい。多分IDだけだとわからないはず。。。

Element type でわかるはず

![Imgur](https://i.imgur.com/GrMHZLY.png)

#### 番外編 なんで賢いのか
なんで賢いのかというと、IDが知らない/対応していない場合にスキップして次のデータを読み取れるからなんですね。  
だってIDの長さ知らないけど、IDの長さは 2進数にして1が何ビット目に立ってるか を計算していけば ID分からん未知のデータ として解析できるわけです。  

もし IDに長さが含まれなかった 場合、パース前に予めIDと長さの対応表みたいなのを持っておく必要がある上、未知のIDが来た場合に解析ができなくなります。  

# WebMで必要な値
WebMに話を戻します。  
多分以下の値が必要です。

んなもん分からんわって方はこっちのほうが正しいです：https://www.matroska.org/technical/diagram.html

```yml
- EBML
    - EBMLVersion
    - EBMLReadVersion
    - EBMLMaxIDLength
    - EBMLMaxSizeLength
    - DocType
    - DocTypeVersion
    - DocTypeReadVersion
- Segment
    - Info
        - Timestamp scale
        - Duration
        - Multiplexing application
        - Writing application
    - Tracks
        - Track
            - Track number
            - Track Uid
            - Codec id
            - Track type
            - Video
                - Pixel width
                - Pixel height
        - Track
            - Track number
            - Track Uid
            - Codec id
            - Codec private data
            - Audio
                - Sampling frequency
                - Channels
    - Cues
        - CuePoint
            - Cue time
            - Cue track position
                - Cue track
                - Cue cluster position
- Cluster
    - Cluster timestamp
    - SimpleBlock
    - SimpleBlock
    - ...
```

これらはさっき話した、EBMLの仕組みに沿ってバイナリを入れていけばいいのですが、、、  
EBMLだけ知っていればできるわけではなく、以下の要素は別に説明しないとと思うのでします。

- Codec private data
- SimpleBlock

## ざっくり何が入ってるか
その前に何に何が入ってるかざっくり

- EBML
    - おまじないみたいなの
    - ファイルが WebM だよ みたいなの
- Segment
    - 映像や音声の実際データを除いたデータが有る
- Info
    - 動画の長さとか書き込みアプリケーションが何かとかをいれる
    - 動画の長さが入ってないとシークバーが使えない
- Tracks
    - 音声と映像の`Track`を入れます
- Track
    - 音声なら、サンプリングレート、チャンネル数、コーデックの種類を入れます
    - 映像なら、動画の高さや幅、コーデックの種類を入れます
    - トラック番号もここで入れます
- Cue
    - なんかシークする際の目印を入れるらしい
- Cluster
    - SimpleBlockを入れる
    - 最初に時間を入れる、その次に SimpleBlock の時間を相対時間で入れる（2バイトで）
    - 0xFF 0xFF を超える場合は Cluster を作り直す
- SimpleBlock
    - エンコードしたデータを入れます

## Codec private data
ここでは音声コーデックが`Opus`のときの話。

これは音声トラックに必要なデータです。  
`Track`に定義されていない値を入れるのに使う、本当にプライベートなデータです。  

おそらく `Opus` を利用している場合は入れる必要があり、プライベートなデータなため`EBML`の仕組みにも乗っかってません！！！

### Opus の Codec private data
まずはこれ見て下さい。

https://wiki.xiph.org/OggOpus#ID_Header

https://www.rfc-editor.org/rfc/rfc7845#section-5

はい、完全に`EBML`じゃないですね。デコーダーに追加情報を渡すために必要なようです。

```
0x4F 0x70 0x75 0x73 0x48 0x65 0x61 0x64 0x01 0x02 0x00 0x00 0x80 0xBB 0x00 0x00 0x00 0x00 0x00
```

#### 中身

まず先頭から8バイト分は、`OpusHead`をASCIIにしたものになります。

| 0x4F | 0x70 | 0x75 | 0x73 | 0x48 | 0x65 | 0x61 | 0x64 |
|------|------|------|------|------|------|------|------|
| O    | p    | u    | s    | H    | e    | a    | d    |

そして次の1バイトはバージョンですが、0x01でいいそうです。

| 0x01        |
|-------------|
| 0x01 で固定 |

その次の1バイトはチャンネル数です。モノラルなら`0x01`、ステレオなら`0x02`でしょう。

| 0x02         |
|--------------|
| チャンネル数 |

その次の2バイト分はわかりません。`Pre-skip`って書いてあるけど知らん

| 0x00     | 0x00 |
|----------|------|
| Pre-skip |      |

その次の4バイト分はサンプリングレートです。なんと**リトルエンディアン**です

`0x80 0xBB 0x00 0x00`

リトルエンディアンなので電卓にそのまま突っ込んでも多分変な値になります。ちなみに正解は10進数で`48000`になるべきです。

![Imgur](https://i.imgur.com/I14Pec7.png)

さらに`Java (JVM で動く Kotlin も)`もビッグエンディアンなのでおかしくなると思います。

電卓で正しい値を出すためには(Windowsの電卓はビッグエンディアンっぽい？)、バイトを逆順にする必要があります。なので、

`0x80 0xBB 0x00 0x00` を `0x00 0x00 0xBB 0x80` にした後に電卓に入れると正しい値になると思います。

![Imgur](https://i.imgur.com/g8UjMba.png)

最後の3バイトはわからん、使わなそうなので`0x00`で埋めてます

| 0x00 | 0x00 | 0x00 |
|------|------|------|
| ?    | ?    | ?    |

音声の`Track`に入れる`Codec private data`は以上です。

### SampleBlock
これもちょっと特殊で、`Data`の先頭4バイトに値を入れる必要があります。

#### 最初に入れる内容

```
0x81 0x00 0x00 0x80
```

最初の1バイトはトラック番号です。TracksにTrackを追加する際に指定すると思います。それです（音声なのか映像なのか）  
次の2バイトは時間です。 0xFF 0xFF までしか時間が追加出来ないです（Short.MAX_VALUE ?）（多分ミリ秒になるので、32秒ぐらいかな）  
0xFF 0xFF を超える場合は、`Cluster`を作り直すところからやる必要があります。(後述)

最後の1バイトはキーフレームかどうかです。キーフレームなら`0x80`、そうでなければ`0x00`だと思います。

おわりです。

# WebMパーサーを書こう
はいここまで来たらかけますね、書きましょう

## 流れ

- EBMLを読み出す
- Segmentの入れ子になってる要素を読み出す
    - Info / Tracks / Cue など
- Clusterを読み出す

## Kotlinで書く

適当にプロジェクトを作って下さい。

## 列挙型

適当に

```kotlin
/** MatroskaのIDたち */
enum class MatroskaTags(val byteArray: ByteArray) {
    EBML(byteArrayOf(0x1A.toByte(), 0x45.toByte(), 0xDF.toByte(), 0xA3.toByte())),
    EBMLVersion(byteArrayOf(0x42.toByte(), 0x86.toByte())),
    EBMLReadVersion(byteArrayOf(0x42.toByte(), 0xF7.toByte())),
    EBMLMaxIDLength(byteArrayOf(0x42.toByte(), 0xF2.toByte())),
    EBMLMaxSizeLength(byteArrayOf(0x42.toByte(), 0xF3.toByte())),
    DocType(byteArrayOf(0x42.toByte(), 0x82.toByte())),
    DocTypeVersion(byteArrayOf(0x42.toByte(), 0x87.toByte())),
    DocTypeReadVersion(byteArrayOf(0x42.toByte(), 0x85.toByte())),

    Segment(byteArrayOf(0x18.toByte(), 0x53.toByte(), 0x80.toByte(), 0x67.toByte())),
    SeekHead(byteArrayOf(0x11.toByte(), 0x4D.toByte(), 0x9B.toByte(), 0x74.toByte())),
    Seek(byteArrayOf(0x4D.toByte(), 0xBB.toByte())),
    SeekID(byteArrayOf(0x53.toByte(), 0xAB.toByte())),
    SeekPosition(byteArrayOf(0x53.toByte(), 0xAC.toByte())),

    Info(byteArrayOf(0x15.toByte(), 0x49.toByte(), 0xA9.toByte(), 0x66.toByte())),
    Duration(byteArrayOf(0x44.toByte(), 0x89.toByte())),
    SegmentUUID(byteArrayOf(0x73.toByte(), 0xA4.toByte())),
    TimestampScale(byteArrayOf(0x2A.toByte(), 0xD7.toByte(), 0xB1.toByte())),
    MuxingApp(byteArrayOf(0x4D.toByte(), 0x80.toByte())),
    WritingApp(byteArrayOf(0x57.toByte(), 0x41.toByte())),

    Tracks(byteArrayOf(0x16.toByte(), 0x54.toByte(), 0xAE.toByte(), 0x6B.toByte())),
    Track(byteArrayOf(0xAE.toByte())),
    TrackNumber(byteArrayOf(0xD7.toByte())),
    TrackUID(byteArrayOf(0x73.toByte(), 0xC5.toByte())),
    FlagLacing(byteArrayOf(0x9C.toByte())),
    Language(byteArrayOf(0x22.toByte(), 0xB5.toByte(), 0x9C.toByte())),
    TrackType(byteArrayOf(0x83.toByte())),
    DefaultDuration(byteArrayOf(0x23.toByte(), 0xE3.toByte(), 0x83.toByte())),
    TrackTimecodeScale(byteArrayOf(0x23.toByte(), 0x31.toByte(), 0x4F.toByte())),
    CodecID(byteArrayOf(0x86.toByte())),
    CodecPrivate(byteArrayOf(0x63.toByte(), 0xA2.toByte())),
    CodecName(byteArrayOf(0x25.toByte(), 0x86.toByte(), 0x88.toByte())),
    VideoTrack(byteArrayOf(0xE0.toByte())),
    PixelWidth(byteArrayOf(0xB0.toByte())),
    PixelHeight(byteArrayOf(0xBA.toByte())),
    FrameRate(byteArrayOf(0x23.toByte(), 0x83.toByte(), 0xE3.toByte())),
    AudioTrack(byteArrayOf(0xE1.toByte())),
    SamplingFrequency(byteArrayOf(0xB5.toByte())),
    Channels(byteArrayOf(0x9F.toByte())),
    BitDepth(byteArrayOf(0x62.toByte(), 0x64.toByte())),

    Cues(byteArrayOf(0x1C.toByte(), 0x53.toByte(), 0xBB.toByte(), 0x6B.toByte())),
    CuePoint(byteArrayOf(0xBB.toByte())),
    CueTime(byteArrayOf(0xB3.toByte())),
    CueTrackPositions(byteArrayOf(0xB7.toByte())),
    CueTrack(byteArrayOf(0xF7.toByte())),
    CueClusterPosition(byteArrayOf(0xF1.toByte())),

    Cluster(byteArrayOf(0x1F.toByte(), 0x43.toByte(), 0xB6.toByte(), 0x75.toByte())),
    Timestamp(byteArrayOf(0xE7.toByte())),
    SimpleBlock(byteArrayOf(0xA3.toByte())),

    Void(byteArrayOf(0xEC.toByte())),
}
```

## パーサーを書く

### ID

とりあえず VInt を計算するやつ書きますか、あの1がとこに立ってるかのやつ

書きました。`downTo`いいね、もうKotlinしかできない

```kotlin
/**
 * VIntを出す
 * 後続バイトの長さを返します。失敗したら -1 を返します
 */
fun Byte.getVIntSize(): Int {
    // JavaのByteは符号付きなので、UIntにする必要がある。AND 0xFF すると UInt にできる
    val int = this.toInt().andFF()
    // 以下のように
    // 1000_0000 -> 1xxx_xxxx
    // 0100_0000 -> 01xx_xxxx_xxxx_xxxx
    for (i in 7 downTo 0) {
        if ((int and (1 shl i)) != 0) {
            return 8 - i
        }
    }
    return -1
}

/** ByteをIntに変換した際に、符号付きIntになるので、AND 0xFF するだけの関数 */
fun Int.andFF() = this and 0xFF
```

Javaだと、Byteは符号付きになるので、`AND 0xFF`をしないとだめです。多分  


こんな感じでわかるはず

```kotlin
// 例である

println(0x81.toByte().getVIntSize()) // return 1
println(0x42.toByte().getVIntSize()) // return 2
println(0x2A.toByte().getVIntSize()) // return 3
println(0x18.toByte().getVIntSize()) // return 4
println(0x82.toByte().getVIntSize()) // return 1
```

### DataSize

`Data`の長さを表す`DataSize`です。  
左から数えて最初の1を消した後の16進数がそうです。

```kotlin
/** DataSizeの長さが不定の場合 */
private val DATASIZE_UNDEFINED = byteArrayOf(0x1F.toByte(), 0xFF.toByte(), 0xFF.toByte(), 0xFF.toByte(), 0xFF.toByte(), 0xFF.toByte(), 0xFF.toByte(), 0xFF.toByte())

/**
 * DataSizeを計算する。
 * だたし、長さ不定の場合（[MatroskaTags.Segment]、[MatroskaTags.Cluster]）の場合、[-1]を返す
 *
 * 例
 * 0x82 -> 0x02
 * 0x42 0x10 -> 0x02 0x10
 */
fun ByteArray.toDataSize(): Int {
    var first = first().toInt().andFF()
    // 例外で、 01 FF FF FF FF FF FF FF のときは長さが不定なので...
    // Segment / Cluster の場合は子要素の長さを全部足せば出せると思うので、、、
    if (contentEquals(DATASIZE_UNDEFINED)) {
        return -1
    }
    // 左から数えて最初の1ビット を消す処理
    // 例
    // 0b1000_0000 なら 0b1xxx_xxxx の x の範囲が数値になる
    // break したかったので for
    for (i in 0..8) {
        if ((first and (1 shl (8 - i))) != 0) {
            // 多分
            // 0b1000_1000 XOR 0b0000_1000 みたいなのをやってるはず
            first = first xor (1 shl (8 - i))
            break
        }
    }
    return (byteArrayOf(first.toByte()) + this.drop(1)).toInt()
}

/** ByteArray から Int へ変換する。ByteArray 内にある Byte は符号なしに変換される。 */
fun ByteArray.toInt(): Int {
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
```

ByteArray から Int はこちらを参考にしました、ありがとうございます。  
https://gist.github.com/groovelab/38d381a943556299f205b47307bf60d7

多分左側へビットを動かしてIntにしてるんだと思います、

`[ 0x10, 0x20, 0x30 ]` だったら...

|                   |      |      |          |
|-------------------|------|------|----------|
| 左側へ2バイト移動 | 0x10 | 0x00 | 0x00     |
| 左側へ1バイト移動 |      | 0x20 | 0x00     |
| 左側へ0バイト移動 |      |      | 0x30     |
| XOR する          |      |      | 0x102030 |

それと、 `0x01 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF`の場合のことを考えないといけないんですよね。  
これは長さが不明の場合に指定されています。`JavaScript`の`MediaRecorder API`で録画したデータがまさに長さ不定になります。  
ただ、子要素には長さが入っているため、これを全部足せばいいと思いました。


### Data
`DataSize`分取り出すだけなので特筆することはないかと

## 組み合わせる

これらの拡張関数を呼び出すと一つの要素をパースできるようになります。

と、その前にパース結果を入れるデータクラスを作りましょう。

```kotlin
/**
 * EBMLの要素を表すデータクラス
 *
 * @param tag [MatroskaTags]
 * @param elementSize 要素の合計サイズ
 * @param data 実際のデータ
 */
data class MatroskaElement(
    val tag: MatroskaTags,
    val data: ByteArray,
    val elementSize: Int,
)
```

要素をパースする関数はこちら。`Data size`が不定`0x01 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF`の場合は動かないと思います。先頭から見ていってもいいけどさあ...

```kotlin
/**
 * EBMLをパースする
 *
 * @param byteArray [ByteArray]
 * @param startPos 読み出し開始位置
 */
fun parseElement(byteArray: ByteArray, startPos: Int): MatroskaElement {
    var readPos = startPos
    val idLength = byteArray[readPos].getVIntSize()
    // IDのバイト配列
    val idBytes = byteArray.copyOfRange(readPos, readPos + idLength)
    val idElement = MatroskaTags.find(idBytes)!!
    readPos += idBytes.size
    // DataSize部
    val dataSizeLength = byteArray[readPos].getVIntSize()
    val dataSizeBytes = byteArray.copyOfRange(readPos, readPos + dataSizeLength)
    val dataSize = dataSizeBytes.toDataSize()
    readPos += dataSizeBytes.size
    // Dataを読み出す。
    // 長さが取得できた場合とそうじゃない場合で...
    return if (dataSize != -1) {
        // Data部
        val dataBytes = byteArray.copyOfRange(readPos, readPos + dataSize)
        readPos += dataSize
        MatroskaElement(idElement, dataBytes, readPos - startPos)
    } else {
        // もし -1 (長さ不定)の場合は全部取得するようにする
        // ただし全部取得すると壊れるので、直さないといけない
        val dataBytes = byteArray.copyOfRange(readPos, byteArray.size)
        readPos += dataBytes.size
        MatroskaElement(idElement, dataBytes, readPos - startPos)
    }
}
```

後はこれを再帰的に呼び出せばすべての要素が取り出せるはずです！

## 再帰的に呼び出す

入れ子になってるタグの場合は再度`parseElement`を呼び出すようにしています。  
そうじゃない場合は配列に入る。

```kotlin
/**
 * 子要素をパースする
 *
 * @param byteArray バイナリ
 */
fun parseChildElement(byteArray: ByteArray): List<MatroskaElement> {
    val childElementList = arrayListOf<MatroskaElement>()
    var readPos = 0
    while (byteArray.size > readPos) {
        val element = parseElement(byteArray, readPos)
        // 親要素があれば子要素をパースしていく
        when (element.tag) {
            MatroskaTags.SeekHead -> childElementList += parseChildElement(element.data)
            MatroskaTags.Info -> childElementList += parseChildElement(element.data)
            MatroskaTags.Tracks -> childElementList += parseChildElement(element.data)
            MatroskaTags.Track -> childElementList += parseChildElement(element.data)
            MatroskaTags.VideoTrack -> childElementList += parseChildElement(element.data)
            MatroskaTags.AudioTrack -> childElementList += parseChildElement(element.data)
            MatroskaTags.Cues -> childElementList += parseChildElement(element.data)
            MatroskaTags.CuePoint -> childElementList += parseChildElement(element.data)
            MatroskaTags.CueTrackPositions -> childElementList += parseChildElement(element.data)
            MatroskaTags.Cluster -> childElementList += parseChildElement(element.data)
            // 親要素ではなく子要素の場合は配列に入れる
            else -> childElementList += element
        }
        readPos += element.elementSize
    }
    return childElementList
}
```

最後にこれを`main関数`で呼び出すなりすればいいと思います。  
もしかするとここまでのコードで Javaの機能 を使ってないので他のプラットフォームでも動くかもしれないです。  

以下の例では `Java の File API` を呼び出してるので`JVM`のみですが、他のプラットフォームでも `Kotlin の ByteArray` が取得できれば使えるかもしれないです。  

**あ！ちなみに JS の MediaRecorder API だと 長さ不定 (0x01 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF) の WebM を出力するのでこのままでは使えません終わりです。**

```kotlin
fun main() {
    // 適当にWebMのパスを
    val bytes = File("""C://Users/takusan23/Desktop/demo.webm""").readBytes()
    val elementList = arrayListOf<MatroskaElement>()
    // トップレベルのパース位置
    // EBML Segment Cluster など
    var topLevelReadPos = 0

    // EBMLを読み出す
    val ebmlElement = parseElement(bytes, 0)
    topLevelReadPos += ebmlElement.elementSize
    elementList.addAll(parseChildElement(ebmlElement.data))

    // Segmentを読み出す
    val segmentElement = parseElement(bytes, topLevelReadPos)
    topLevelReadPos += segmentElement.elementSize
    elementList.addAll(parseChildElement(segmentElement.data))

    // 結果を出力
    elementList.forEach {
        println("${it.tag} = ${it.data.take(10).toByteArray().toHexString()}")
    }
}

/** 16進数に変換するやつ */
private fun ByteArray.toHexString() = this.joinToString(separator = " ") { "%02x".format(it) }
```

こんな感じになるはず。

```
EBMLVersion = ...
EBMLReadVersion = ...
EBMLMaxIDLength = ...
EBMLMaxSizeLength = ...
DocType = ...
DocTypeVersion = ...
DocTypeReadVersion = ...
Seek = ...
Seek = ...
Seek = ...
Void = ...
Duration = ...
TimestampScale = ...
MuxingApp = ...
WritingApp = ...
TrackNumber = ...
TrackUID = ...
FlagLacing = ...
Language = ...
CodecID = ...
TrackType = ...
Channels = ...
SamplingFrequency = ...
CodecPrivate = ...
TrackNumber = ...
TrackUID = ...
FlagLacing = ...
Language = ...
CodecID = ...
TrackType = ...
PixelWidth = ...
PixelHeight = ...
```

## サイズが不明な Clsuter ...

`JS`の`MediaRecoder API`を使ったできた動画って、`DataSize`が`0x01 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF`になっていて、おそらく子要素を次のClusterが来るまでなめていくしか無いです。  
というわけで こちらのコード

```kotlin
/**
 * DataSize が 0x01 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF だった場合にサイズを出す。算出方法は以下。多分 Cluster 以外では動かない
 * Cluster のそれぞれの子要素にはサイズが入っているため、次のClusterが現れるまで足していくことでサイズが分かる。
 */
fun ByteArray.calcUnknownElementSize(): Int {
    val byteSize = this.size
    var totalReadPos = 0
    while (true) {
        // 子要素を順番に見て、長さだけ足していく

        var readPos = totalReadPos

        val idLength = this[readPos].getVIntSize()
        // IDのバイト配列
        val idBytes = this.copyOfRange(readPos, readPos + idLength)
        val idElement = MatroskaTags.find(idBytes)!!
        readPos += idLength

        // トップレベル要素？別のClusterにぶつかったらもう解析しない
        if (idElement == MatroskaTags.Cluster) {
            break
        }

        // DataSize部
        val dataSizeLength = this[readPos].getVIntSize()
        val dataSizeBytes = this.copyOfRange(readPos, readPos + dataSizeLength)
        val dataSize = dataSizeBytes.toDataSize()
        readPos += dataSizeLength
        readPos += dataSize

        totalReadPos = readPos

        // もしかしたら他のブラウザでもなるかもしれないけど、
        // Chromeの場合、WebMのファイル分割は SimpleBlock の途中だろうとぶった切ってくるらしく、中途半端にデータが余ることがある
        // 例：タグの A3 で終わるなど
        // その場合にエラーにならないように、この後3バイト（ID / DataSize / Data それぞれ1バイト）ない場合はループを抜ける
        if (byteSize < totalReadPos + 3) {
            break
        }

    }
    return totalReadPos
}
```

次の`Cluster`が見つかるまで子要素の長さを足していく関数です。  
これを、`parseChildElement`関数に組み込めば...、多分長さがわからない`Cluster`も解析できるようになるはずです。  
長さ不明、パースしんどいな...

```kotlin
/**
 * EBMLをパースする
 *
 * @param byteArray [ByteArray]
 * @param startPos 読み出し開始位置
 */
fun parseElement(byteArray: ByteArray, startPos: Int): MatroskaElement {
    var readPos = startPos
    val idLength = byteArray[readPos].getVIntSize()
    // IDのバイト配列
    val idBytes = byteArray.copyOfRange(readPos, readPos + idLength)
    val idElement = MatroskaTags.find(idBytes)!!
    readPos += idBytes.size
    // DataSize部
    val dataSizeLength = byteArray[readPos].getVIntSize()
    val dataSizeBytes = byteArray.copyOfRange(readPos, readPos + dataSizeLength)
    val dataSize = dataSizeBytes.toDataSize()
    readPos += dataSizeBytes.size
    // Dataを読み出す。
    // 長さが取得できた場合とそうじゃない場合で...
    return if (dataSize != -1) {
        // Data部
        val dataBytes = byteArray.copyOfRange(readPos, readPos + dataSize)
        readPos += dataSize
        MatroskaElement(idElement, dataBytes, readPos - startPos)
    } else {
        // もし -1 (長さ不定)の場合
        val unknownDataSize = if (idElement == MatroskaTags.Cluster) {
            // Clusterの場合は、次のClusterまでの子要素の合計サイズを出す
            readPos + byteArray.copyOfRange(readPos, byteArray.size).calcUnknownElementSize()
        } else {
            // Segmentの場合はすべて取得
            byteArray.size
        }
        val dataBytes = byteArray.copyOfRange(readPos, unknownDataSize)
        readPos += dataBytes.size
        MatroskaElement(idElement, dataBytes, readPos - startPos)
    }
}
```

# ソースコード
https://github.com/takusan23/ZeroWebM

# ブラウザの挙動？

- Chrome は 要素の途中だろうとぶった切ってくる？
    - なので`DataSize`分データがあるか怪しい（え？？？）
    - Clusterのパースの際はお気をつけて
    - コードあってるけどデータが良くない時があった；；
        - `ArrayIndexOutOfBoundsException: Index 56492651 out of bounds for length 56492651`
        - これ自分が書いたコードが悪いようにみえるじゃん...
- Firefox はぱっと見要素の終わりに揃えていそう

# そのほか

- Opusの場合、常にキーフレームかもしれないです
    - Android の ExoPlayer では Opus の SimpleBlock は全部キーフレームにしないと再生できませんでした；；

# おまけ 書き込み作る
どっちかというとこっち本題にしたかったけどもう疲れた ~~上に気分がPixel Watch に傾いてるのでもう無理~~ 

## 流れ

- ID要素をバイト配列にする
    - まあこれはパースの際に用意したのを使います
- DataSizeを計算する
    - めんどそう
    - 長さ不明はパーサーがかわいそうなのでちゃんとしようね
- ID要素のバイト配列、DataSizeのバイト配列、Dataの配列をくっつける
- これを全部繰り返す

パースよりやさしそう

## 一つの要素を表すデータクラス
今回は楽するために、`DataSize`が常に4バイトになります；；。4バイトを超えたら対応できないので各自いい感じに...  
この記事の冒頭の最適化してないの話はここにつながるわけですね。。

```kotlin
/**
 * EBML要素を作成する
 *
 * @param tagId タグ
 * @param byteArray 実際のデータ
 * @param dataSize DataSize。エンコード済み
 */
data class MatroskaBuildElement(
    val tagId: MatroskaTags,
    val byteArray: ByteArray,
    val dataSize: ByteArray = byteArray.calcDataSize(),
) {

    /** [tagId] + [dataSize] + [byteArray] を繋げたバイト配列を返す */
    fun concat() = tagId.byteArray + dataSize + byteArray

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as MatroskaBuildElement

        if (tagId != other.tagId) return false
        if (!byteArray.contentEquals(other.byteArray)) return false
        if (!dataSize.contentEquals(other.dataSize)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = tagId.hashCode()
        result = 31 * result + byteArray.contentHashCode()
        result = 31 * result + dataSize.contentHashCode()
        return result
    }

}

/** [ByteArray]の長さを求めて、DataSizeを作成する */
private fun ByteArray.calcDataSize(): ByteArray {
    // IntをByteArrayにする
    // TODO これだと 1 でも 0x00 0x00 0x00 0x01 と無駄なパディングが入ってしまう
    val dataSizeByteArray = this.size.toByteArray()
    val first = dataSizeByteArray.first()
    // データサイズ自体も可変長なので、何バイト分がデータサイズなのか記述する
    // V_INT とかいうやつで、1が先頭から何番目に立ってるかで残りのバイト数が分かるようになってる
    // 1000 0000 -> 7 ビット ( 1xxx xxxx )
    // 0100 0000 -> 14 ビット ( 01xx xxxx xxxx xxxx )
    val dataSizeBytesSize = when (dataSizeByteArray.size) {
        1 -> 0b1000_0000
        2 -> 0b0100_0000
        3 -> 0b0010_0000
        4 -> 0b0001_0000
        5 -> 0b0000_1000
        6 -> 0b0000_0100
        7 -> 0b0000_0010
        else -> 0b0000_0001
    }
    // データサイズのバイトの先頭に V_INT のやつを OR する
    val dataSize = dataSizeByteArray.apply {
        this[0] = (dataSizeBytesSize or first.toInt()).toByte()
    }
    return dataSize
}

/** [Int]を[ByteArray]に変換する */
private fun Int.toByteArray() = byteArrayOf(
    (this shr 24).toByte(),
    (this shr 16).toByte(),
    (this shr 8).toByte(),
    this.toByte(),
)
```

main関数とかで呼び出すようにすればいいと思います  
例えばこれで `EBMLヘッダー` を作れます、

```kotlin
/** WebMライター */

fun main() {
    // WebMファイルの先頭にある EBML Header を作る
    // 子要素を作成する
    val ebmlVersion = MatroskaBuildElement(MatroskaTags.EBMLVersion, byteArrayOf(0x01))
    val readVersion = MatroskaBuildElement(MatroskaTags.EBMLReadVersion, byteArrayOf(0x01))
    val maxIdLength = MatroskaBuildElement(MatroskaTags.EBMLMaxIDLength, byteArrayOf(0x04))
    val maxSizeLength = MatroskaBuildElement(MatroskaTags.EBMLMaxSizeLength, byteArrayOf(0x08))
    val docType = MatroskaBuildElement(MatroskaTags.DocType, "webm".toAscii())
    val docTypeVersion = MatroskaBuildElement(MatroskaTags.DocTypeVersion, byteArrayOf(0x02))
    val docTypeReadVersion = MatroskaBuildElement(MatroskaTags.DocTypeReadVersion, byteArrayOf(0x02))

    // EBML Header 要素
    val children = ebmlVersion.concat() + readVersion.concat() + maxIdLength.concat() + maxSizeLength.concat() + docType.concat() + docTypeVersion.concat() + docTypeReadVersion.concat()
    val ebmlHeader = MatroskaBuildElement(MatroskaTags.EBML, children)
    // ファイルに書き出す
    File("ebmlHeader.webm").writeBytes(ebmlHeader.concat())
}

/** 文字列を ASCII のバイト配列に変換する */
private fun String.toAscii() = this.toByteArray(charset = Charsets.US_ASCII)
```

ちゃんとパーサーに認識されてました

![Imgur](https://i.imgur.com/lAcMljf.png)

## 他の要素も作ろう

疲れたので全カットで。  
注意点としては、`Tracks > Track`で音声トラックを追加する場合、`AudioTrack`の`Sampling frequency`が`Float`なので注意して下さい。  
Kotlinなら`Int.toBits()`を呼び出すだけかも？`// TODO`ばっかで使えたもんじゃないな

```kotlin
/*
 * Kotlinのシフト演算子
 * [shl] <<
 * [shr] >>
 */

/** サイズが不明 */
private val UNKNOWN_SIZE = byteArrayOf(0x01, 0xFF.toByte(), 0xFF.toByte(), 0xFF.toByte(), 0xFF.toByte(), 0xFF.toByte(), 0xFF.toByte(), 0xFF.toByte())

/** TrackType が Video */
private const val VIDEO_TRACK_TYPE = 1

/** TrackType が Audio */
private const val AUDIO_TRACK_TYPE = 2

/** キーフレームなら */
private const val SIMPLE_BLOCK_FLAGS_KEYFRAME = 0x80

/** キーフレームじゃない */
private const val SIMPLE_BLOCK_FLAGS = 0x00

/** WebMライター */

fun main() {
    val ebmlHeader = createEbmlHeader()

    val info = createInfo()
    val tracks = createTracks()
    val cluster = createStreamingCluster()
    val segment = MatroskaBuildElement(MatroskaTags.Segment, info.concat() + tracks.concat() + cluster.concat())

    // EBML Header + Segment 書き込み
    File("empty.webm").apply {
        appendBytes(ebmlHeader.concat())
        appendBytes(segment.concat())
    }
}

/** EBMLヘッダーを作成する */
private fun createEbmlHeader(): MatroskaBuildElement {
    // WebMファイルの先頭にある EBML Header を作る
    // 子要素を作成する
    val ebmlVersion = MatroskaBuildElement(MatroskaTags.EBMLVersion, byteArrayOf(0x01))
    val readVersion = MatroskaBuildElement(MatroskaTags.EBMLReadVersion, byteArrayOf(0x01))
    val maxIdLength = MatroskaBuildElement(MatroskaTags.EBMLMaxIDLength, byteArrayOf(0x04))
    val maxSizeLength = MatroskaBuildElement(MatroskaTags.EBMLMaxSizeLength, byteArrayOf(0x08))
    val docType = MatroskaBuildElement(MatroskaTags.DocType, "webm".toAscii())
    val docTypeVersion = MatroskaBuildElement(MatroskaTags.DocTypeVersion, byteArrayOf(0x02))
    val docTypeReadVersion = MatroskaBuildElement(MatroskaTags.DocTypeReadVersion, byteArrayOf(0x02))

    // EBML Header 要素
    val children = ebmlVersion.concat() + readVersion.concat() + maxIdLength.concat() + maxSizeLength.concat() + docType.concat() + docTypeVersion.concat() + docTypeReadVersion.concat()
    return MatroskaBuildElement(MatroskaTags.EBML, children)
}

/** Infoを作成する */
private fun createInfo(): MatroskaBuildElement {
    val timestampScale = MatroskaBuildElement(MatroskaTags.TimestampScale, 1_000_000.to4ByteArray())
    val multiplexingAppName = MatroskaBuildElement(MatroskaTags.MuxingApp, "ZeroWebM".toAscii())
    val writingAppName = MatroskaBuildElement(MatroskaTags.WritingApp, "ZeroWebM".toAscii())
    val children = timestampScale.concat() + multiplexingAppName.concat() + writingAppName.concat()
    return MatroskaBuildElement(MatroskaTags.Info, children)
}

/** Track要素を作成する */
private fun createTracks(
    videoTrackId: Int = 1,
    videoCodec: String = "V_VP9",
    videoWidth: Int = 1280,
    videoHeight: Int = 720,
    audioTrackId: Int = 2,
    audioCodec: String = "O_OPUS",
    audioSamplingRate: Float = 48_000.0f, // Floatなの！？
    audioChannelCount: Int = 2,
): MatroskaBuildElement {

    // 動画トラック情報
    val videoTrackNumber = MatroskaBuildElement(MatroskaTags.TrackNumber, videoTrackId.toByteArray())
    val videoTrackUid = MatroskaBuildElement(MatroskaTags.TrackUID, videoTrackId.toByteArray())
    val videoCodecId = MatroskaBuildElement(MatroskaTags.CodecID, videoCodec.toAscii())
    val videoTrackType = MatroskaBuildElement(MatroskaTags.TrackType, VIDEO_TRACK_TYPE.toByteArray())
    val pixelWidth = MatroskaBuildElement(MatroskaTags.PixelWidth, videoWidth.toByteArray())
    val pixelHeight = MatroskaBuildElement(MatroskaTags.PixelHeight, videoHeight.toByteArray())
    val videoTrack = MatroskaBuildElement(MatroskaTags.VideoTrack, pixelWidth.concat() + pixelHeight.concat())
    val videoTrackEntryChildren = videoTrackNumber.concat() + videoTrackUid.concat() + videoCodecId.concat() + videoTrackType.concat() + videoTrack.concat()
    val videoTrackEntry = MatroskaBuildElement(MatroskaTags.Track, videoTrackEntryChildren)

    // 音声トラック情報
    val audioTrackNumber = MatroskaBuildElement(MatroskaTags.TrackNumber, audioTrackId.toByteArray())
    val audioTrackUid = MatroskaBuildElement(MatroskaTags.TrackUID, audioTrackId.toByteArray())
    val audioCodecId = MatroskaBuildElement(MatroskaTags.CodecID, audioCodec.toAscii())
    val audioTrackType = MatroskaBuildElement(MatroskaTags.TrackType, AUDIO_TRACK_TYPE.toByteArray())
    // Segment > Tracks > Audio の CodecPrivate に入れる中身
    // OpusHeaderをつくる
    // https://www.rfc-editor.org/rfc/rfc7845
    // Version = 0x01
    // Channel Count = 0x02
    // Pre-Skip = 0x00 0x00
    // Input Sample Rate ( little endian ) 0x80 0xBB 0x00 0x00 . Kotlin は Big endian なので反転する
    // Output Gain 0x00 0x00
    // Mapping Family 0x00
    // ??? 0x00 0x00
    val opusHeader = "OpusHead".toAscii() + byteArrayOf(1.toByte()) + byteArrayOf(audioChannelCount.toByte()) + byteArrayOf(0x00.toByte(), 0x00.toByte()) + audioSamplingRate.toInt().toByteArray().reversed() + byteArrayOf(0x00.toByte(), 0x00.toByte(), 0x00.toByte(), 0x00.toByte(), 0x00.toByte())
    val codecPrivate = MatroskaBuildElement(MatroskaTags.CodecPrivate, opusHeader)
    // Float を ByteArray にするにはひと手間必要
    val sampleFrequency = MatroskaBuildElement(MatroskaTags.SamplingFrequency, audioSamplingRate.toBits().to4ByteArray())
    val channels = MatroskaBuildElement(MatroskaTags.Channels, audioChannelCount.toByteArray())
    val audioTrack = MatroskaBuildElement(MatroskaTags.AudioTrack, channels.concat() + sampleFrequency.concat())
    val audioTrackEntryValue = audioTrackNumber.concat() + audioTrackUid.concat() + audioCodecId.concat() + audioTrackType.concat() + codecPrivate.concat() + audioTrack.concat()
    val audioTrackEntry = MatroskaBuildElement(MatroskaTags.Track, audioTrackEntryValue)

    // Tracks を作る
    return MatroskaBuildElement(MatroskaTags.Tracks, videoTrackEntry.concat() + audioTrackEntry.concat())
}

/**
 * Clusterの中に入れるSimpleBlockを作る
 *
 * @param trackNumber トラック番号、映像なのか音声なのか
 * @param simpleBlockTimescale エンコードしたデータの時間
 * @param byteArray エンコードされたデータ
 * @param isKeyFrame キーフレームの場合は true
 */
private fun createSimpleBlock(
    trackNumber: Int,
    simpleBlockTimescale: Int,
    byteArray: ByteArray,
    isKeyFrame: Boolean,
): MatroskaBuildElement {
    val vIntTrackNumberBytes = trackNumber.toVInt()
    val simpleBlockBytes = simpleBlockTimescale.toByteArray()
    // flags。キーフレームかどうかぐらいしか入れることなさそう
    val flagsBytes = byteArrayOf((if (isKeyFrame) SIMPLE_BLOCK_FLAGS_KEYFRAME else SIMPLE_BLOCK_FLAGS).toByte())
    // エンコードしたデータの先頭に、
    // トラック番号、時間、キーフレームかどうか を付け加える
    val simpleBlockValue = vIntTrackNumberBytes + simpleBlockBytes + flagsBytes + byteArray

    return MatroskaBuildElement(MatroskaTags.SimpleBlock, simpleBlockValue)
}

/**
 * ストリーミング可能な Cluster を作成する。
 * データサイズが不定になっている。
 *
 * @param timescaleMs 開始時間。ミリ秒
 */
private fun createStreamingCluster(timescaleMs: Int = 0): MatroskaBuildElement {
    val timescaleBytes = timescaleMs.to4ByteArray()
    val timescale = MatroskaBuildElement(MatroskaTags.Timestamp, timescaleBytes)
    val clusterValue = timescale.concat()

    return MatroskaBuildElement(MatroskaTags.Cluster, clusterValue, UNKNOWN_SIZE)
}

/** 数値を V_INT でエンコードする */
private fun Int.toVInt(): ByteArray {
    val valueByteArray = this.toByteArray()
    val valueSize = when (valueByteArray.size) {
        1 -> 0b1000_0000
        2 -> 0b0100_0000
        3 -> 0b0010_0000
        4 -> 0b0001_0000
        5 -> 0b0000_1000
        6 -> 0b0000_0100
        7 -> 0b0000_0010
        else -> 0b0000_0001
    }
    return valueByteArray.apply {
        // TODO これだと多分よくない（立てたい位置にすでに 1 が立っている場合に数値がおかしくなる）
        this[0] = (valueSize or this[0].toInt()).toByte()
    }
}

/** 文字列を ASCII のバイト配列に変換する */
private fun String.toAscii() = this.toByteArray(charset = Charsets.US_ASCII)

/** [Int]を[ByteArray]に変換する。2バイト */
private fun Int.toByteArray() = byteArrayOf(
    (this shr 8).toByte(),
    this.toByte(),
)

/** [Int]を[ByteArray]に変換する。4バイト */
private fun Int.to4ByteArray() = byteArrayOf(
    (this shr 24).toByte(),
    (this shr 16).toByte(),
    (this shr 8).toByte(),
    this.toByte(),
)
```

まぁ動いているのでヨシ！  
`writing app`好きな文字列にできるのいいな（すごくどうでもいい）

![Imgur](https://i.imgur.com/Od6yGsP.png)

# ソースコード
再掲

https://github.com/takusan23/ZeroWebM

# おわりに
Pixel Watch はよ来い！！！！  
docomoでもセルラー通信できたら WearOS でもLTEバンド取得できるのか試してみたかったんだけどな、、、

Kotlinの便利機能ばっかり使ったのであんまり参考にならなそう。  

# 参考にしました
たすかります！！！

- https://www.slideshare.net/mganeko/inside-webm
- https://www.slideshare.net/mganeko/media-recorder-and-webm
- https://qiita.com/ryiwamoto/items/0ff451da6ab76b4f4064
- https://qiita.com/legokichi/items/83871e1f034331222fd2
- https://scrapbox.io/unarist/MediaRecorderAPIで作ったwebmをseekableにしたい