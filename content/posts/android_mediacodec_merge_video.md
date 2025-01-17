---
title: AndroidのMediaCodecを利用して複数の動画を繋げて一つの動画にする
created_at: 2022-03-21
tags:
- Android
- Kotlin
- MediaCodec
---
どうもこんばんわ。  
アイカギ2 攻略しました。<span style="font-size:10px">声優買いだったけど</span>予想以上で面白かったです。  
ずーーーっとかわいかった。

![Imgur](https://i.imgur.com/SBK2sis.png)

![Imgur](https://i.imgur.com/PC8tXYN.png)

![Imgur](https://i.imgur.com/wPFTJ6b.png)

かわいい

# 本題
HLS形式の動画って`MPEG2-TS セグメント`が複数流れてくるんだけど、これ一つの`mp4`とかにできないのかって話。  
複数の動画って言ってるけどコーデックとかフォーマットが同じ場合に限るけど...

### 番外編 FFmpeg でよくない？
GPL「やあ！」  
ライセンス問題もあるっちゃあるけど、それよりアプリのサイズがデカくなりそう...

### 番外編 MediaCodecの使い方の例が見たかったんだけど検索妨害するの辞めない？
https://github.com/takusan23/MediaCodecDecode  
のブランチに音声、映像それぞれをMediaCodecを利用してデコードするサンプルがあります。チラシの裏的な感じでどうぞ...  
(`masterブランチ`以外で作業してたせいでGitHubの草が生えてないよ...；；)

- 動画をデコードしてSurfaceViewへレンダリングする
    - https://github.com/takusan23/MediaCodecDecode/blob/video-decode/app/src/main/java/io/github/takusan23/mediacodecdecode/MainActivity.kt
- 動画をデコードしてAudioTarckで音声を再生する
    - https://github.com/takusan23/MediaCodecDecode/blob/audio-decode/app/src/main/java/io/github/takusan23/mediacodecdecode/MainActivity.kt

## 多分読まなくていい 動画フォーマット の話
多分基礎的な話なので見なくて良き。というかあってるか分からない；；

### コンテナフォーマット
`MPEG2-TS`とか`mp4`とかはコンテナフォーマットであり、音声・映像をぞれぞれしまっておくものです。（多分）  
上記2つのコンテナフォーマットなら、映像（H.264が多い？）と音声（AACが多い？）を入れます。

Androidだと`MediaExtractor`、`MediaMuxer`あたりで触ります。

### コーデック
エンコード、デコードの種類。  
映像ならH.264（AVC）とかH.265（HEVC）のこと。  
音声ならAACとか？

Androidでは`MediaCodec`で触りますね

こう書いてみると、FFmpegってこの辺よくわからんくても適当にやってくれてたんやなあ...

### HLS
Apple様が作った映像をごまぎれにして送る技術。ライブ配信とか暗号化したい動画の場合に使ってるとかなんとか。  

超絶どうでもいいけど、AppleのWWDCって昔はAppleデバイスじゃないと見れなかった（昔はブラウザの中でもHLSに対応してるのはAppleのSafariだけだった？）  
なのでWindows/AndroidユーザーはVLCにWWDCのHLSアドレスを入れて見てたような。  
その後、今は無いけどEdgeHTMLなEdgeでHLSが（Apple Safari以外のブラウザとしては初？）サポートされて、Appleデバイス or Windows 10 のEdgeブラウザで見れるようになったような。  
今日はモダンブラウザで見れるほか、Apple公式がようつべにミラーしてるのでいい時代になりましたね←？？？

# 環境
実機がおすすめです。

| なまえ           | あたい                                         |
|------------------|------------------------------------------------|
| 端末             | Pixel 3 XL / Xperia 5 Ⅱ / Xiaomi Mi 11 Lite 5G |
| SoC (Snapdragon) | SDM 845 / SDM 865 / SDM 780G                   |
| Android          | 12 / 11 / 11                                   |
| 言語             | Kotlin                                         |

# 本日のメイン MediaCodec 
https://developer.android.com/reference/android/media/MediaCodec

扱いがとても難しい。公式リファレンスも長い説明があるけど分からんということがわかる。  
各メソッドは最終的にC言語で書かれたコードにたどり着くらしい、何も分からん。

## 登場人物

- MediaFormat
- MediaExtractor
- MediaMuxer
- MediaCodec

### MediaFormat
映像、音声のメタデータを入れる。ビットレート、フレームレートなど。  
これを`MediaCodec`や`MediaMuxer`へ渡す。  
でも動画の情報なんて分からんので、`MediaExtractor`を利用してMediaFormatを取得してから作るのがいい？

```kotlin
val videoMediaFormat = // MediaExtractorの説明で...

val height = videoMediaFormat?.getInteger(MediaFormat.KEY_HEIGHT) ?: 720
val width = videoMediaFormat?.getInteger(MediaFormat.KEY_WIDTH) ?: 1280
val encoderMediaFormat = MediaFormat.createVideoFormat(ENCODE_MIME_TYPE, width, height).apply {
    setInteger(MediaFormat.KEY_MAX_INPUT_SIZE, INPUT_BUFFER_SIZE)
    setInteger(MediaFormat.KEY_BIT_RATE, BIT_RATE)
    setInteger(MediaFormat.KEY_FRAME_RATE, 30)
    setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1)
    setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
}
```

### MediaExtractor
`MP4`、`MPEG2-TS`とかのコンテナフォーマットから、映像・音声のメタデータ(`MediaFormat`)を取り出したり、`MediaCodec`へ渡すデータを取り出す。  
私もよく知らないんだけど、`MediaExtractor`から出てきた`MediaFormat`を直接`MediaCodec`へ渡すとコケる場合がある？  
Androidのファイルピッカー(Storage Access Framework)の結果(Uri、contentスキーム)の場合は多分受け付けないと思います（知らんけど）。  
なので、ユーザーに選ばせた後、選択したUriがもらえるのでInputStreamを使い、一度アプリ内の固有ストレージにコピーする必要があると思います。

```kotlin
// MP4とかMPEG2-TSのファイルパスを渡す
val extractor = MediaExtractor().apply { setDataSource("file:///") }
// 映像データのMediaFormatを取り出す
val videoMediaFormat = (0 until extractor.trackCount) // [0,1] のような配列を作る
    .map { extractor.getTrackFormat(it) } // [MediaFormat,MediaFormat] に変換する
    .firstOrNull { it.getString(MediaFormat.KEY_MIME)?.startsWith("video/") == true } // 配列の中からMIME_TYPEが video/ から始まるのを返す
// 音声データのMediaFormat
val audioMediaFormat = (0 until extractor.trackCount)
    .map { extractor.getTrackFormat(it) }
    .firstOrNull { it.getString(MediaFormat.KEY_MIME)?.startsWith("audio/") == true }

// MediaCodecへデータを渡す
val inputBuffer = decodeMediaCodec.getInputBuffer(inputBufferId)!!
val size = extractor.readSampleData(inputBuffer, 0)

// 使い終わったら
extractor.release()
```

#### Uriコピー例
今回の話ではないので適当に...

```kotlin
// Uriだと...
val uri = // ファイルピッカーの結果
val inputStream = contentResolver.openInputStream(uri)!!
// 固有ストレージにコピー
val tempFile = File(getExternalFilesDir(null), "copy.mp4")
tempFile.createNewFile()
tempFile.writeBytes(inputStream.readBytes()) // もし2GBを超えるなら使えない
inputStream.close()
val filePath = tempFile.path // file スキーム
```

### MediaMuxer
`MediaCodec`でエンコードされた映像、音声をMP4とかのコンテナフォーマットへ格納する。  
`MediaMuxer`へ渡す`MediaFormat`は`MediaCodec#getOutputFormat()`とか`MediaExtractor#getTrackFormat()`で貰えるやつじゃないと失敗する？（コーデック固有データが無いとかで）  
参考：https://stackoverflow.com/questions/19505845/mediamuxer-error-failed-to-stop-the-muxer

```kotlin
// 映像MediaFormat
val videoMediaFormat = // 上で書いたので省略...
// MediaMuxer作成
val mediaMuxer = MediaMuxer(mergedFile.path, OUTPUT_CONATINER_FORMAT)
// 映像トラック追加
val videoTrackIndex = mediaMuxer.addTrack(videoMediaFormat) // ここで入れるMediaFormatはMediaCodec#getOutputFormat()で貰えるのを入れると確実？
mediaMuxer.start()

// MediaCodecの結果を書き込む...
mediaMuxer.writeSampleData(videoTrackIndex, /* outputBuffer, outputBufferInfo */)

// 後片付け
mediaMuxer.stop()
mediaMuxer.release()
```

### MediaCodec
エンコードされた映像・音声をデコードする、もしくはその逆をする。  
非同期モードと同期モードがあるけどどっちがいいんだろう。今回は同期モードで書きます。  
AOSPのソース覗いたけど、Android 11から搭載された内部音声と画面録画を合成する部分でも同期モードなMediaCodecを使ってた  
https://cs.android.com/android/platform/superproject/+/master:frameworks/base/packages/SystemUI/src/com/android/systemui/screenrecord/ScreenInternalAudioRecorder.java;l=234?q=internalaudio

別スレッド必須です。

```kotlin
// デコード用（H.264 -> 生データ）MediaCodec
val decodeMediaCodec = MediaCodec.createDecoderByType("video/avc").apply {
    configure(decoderMediaFormat, null, null, 0)
    start()
}
// メタデータ格納用
val decoderBufferInfo = MediaCodec.BufferInfo()
while (true) {
    // デコーダー部分
    val inputBufferId = decodeMediaCodec.dequeueInputBuffer(TIMEOUT_US)
    if (inputBufferId >= 0) {
        // Extractorからデータを読みだす
        val inputBuffer = decodeMediaCodec.getInputBuffer(inputBufferId)!!
        val size = mediaExtractor.readSampleData(inputBuffer, 0)
        if (size > 0) {
            // デコーダーへ流す
            decodeMediaCodec.queueInputBuffer(inputBufferId, 0, size, mediaExtractor.sampleTime, 0)
            mediaExtractor.advance()
        } else {
            // データなくなった場合は終了
            decodeMediaCodec.queueInputBuffer(inputBufferId, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
            // 開放
            mediaExtractor.release()
            // 終了
            break
        }
    }
    // デコード結果
    val outputBufferId = decodeMediaCodec.dequeueOutputBuffer(decoderBufferInfo, TIMEOUT_US)
    if (outputBufferId >= 0) {
        // デコード結果をもらう
        // 返す
        decodeMediaCodec.releaseOutputBuffer(outputBufferId, true)
    }
}
```

# これらを踏まえて複数の動画を繋げたい

## 音声
音声の場合は、動画ファイルを`MediaExtractor`へ入れて、データを`MediaCodec`へ突っ込みます。  
生データが出てくるので、これを一旦適当なファイルを作り書き込んでおきます。  
これを結合したい動画全てで繰り返します。デコード結果が先程の適当なファイルにまとまっているように。  

そのあと、エンコード用の`MediaCodec`を作り先程の適当なファイルに書き込んでおいたデータを突っ込みます。  
するとエンコードされたデータが出てくるので、`MediaMuxer`へ渡します。

これでなんか動いてる。なんでだろう

あと割と時間がかかりますこれ...

![Imgur](https://i.imgur.com/qCxBbMW.png)

## 映像
映像の場合、音声のように一時的に生（意味深）データを外出し（意味深）しておく方法が使えないと思います。映像の生データとかデカすぎでヤバそう。  
なので代わりに、エンコーダーの入力用`Surface`へデコード結果を書き込む方法を使います。  

デコーダーの設定時にエンコーダーの`Surface`を指定しておきます。  
結合したい動画を順次`MediaExtractor`で読み出して、デコーダーへ流します。  
ファイルが読み終わったら次の動画にしてまたデコーダーへ流してあげます。これを無くなるまでやります。

それで`Surface`へ映像が流れてくるので、エンコーダーで受け取り`MediaMuxer`へ渡します。  
本来は`Surface`を指定する部分に`SurfaceView`の`Surface`を入れて映像を出力するんだと思う。

![Imgur](https://i.imgur.com/BlWU5jP.png)

ちなみに形式が異なる場合は無理だと思います。OpenGLとかが出来れば別だと思う

## 音声と映像をコンテナフォーマットへ格納
`MediaExtractor`で取り出して、`MediaMuxer`に入れればOK

![Imgur](https://i.imgur.com/QV1cYdL.png)

# 実際に作ってみた！
攻略のカギは、`presentationTime`にあります！(フレームの時間をセットするやつ)  
(前回の動画の位置を足していく)

## 予めデータを入れておく
今回は、予めアプリ固有ストレージ（`getExternalFilesDir(null)`）のところに動画を入れておきます。  
HLSを想定して、`FFmpeg`で`.ts`ファイルへ変換して転送します。  
命名規則は ファイル名+番号+拡張子 で、あとで配列にする際に正規表現で取り出して数字の小さい順に並べ替えられるようにしてます。 

ファイルピッカーとかで選ばせたいけど長くなるのでカットで...

`io.github.takusan23.～`の部分は各自違うと思う...

![Imgur](https://i.imgur.com/qLPsuYH.png)

### ちなみに
Android標準のファイラーだと、`Android/data`が端末でも見れます。

## 音声部分
音声データを結合するクラスを書きました。  
説明はコメントに書いておきました。  
`setInteger`、`setLong`はちゃんと選ばないとだめです。  
`getInteger`の値がない場合は代わりを指定したほうがいいと思います（でも`getInteger`のデフォルト値指定付きメソッドがAndroid 10以降だった...）  

なんか`MediaExtractor`でもらえる`MediaFormat`経由でビットレートも取得できるはずですが、なんかゴミみたいな音質だったので引数に取るようにした。 

```kotlin
/**
 * 音声データを結合する
 *
 * @param videoList 結合する動画、音声ファイルの配列。入っている順番どおりに結合します。
 * @param mergeFilePath 結合したファイルの保存先
 * @param tempRawDataFile 一時的ファイル保存先
 * @param bitRate ビットレート。なんかゴミみたいな音質だった...
 * */
class AudioDataMerge(
    videoList: List<File>,
    private val mergeFilePath: File,
    private val tempRawDataFile: File,
    private val bitRate: Int = 192_000,
) {

    /** タイムアウト */
    private val TIMEOUT_US = 10000L

    /** MediaCodecでもらえるInputBufferのサイズ */
    private val INPUT_BUFFER_SIZE = 655360

    /** 結合する動画の配列のイテレータ */
    private val videoListIterator = videoList.listIterator()

    /** 一時ファイル保存で使う */
    private val bufferedOutputStream by lazy { tempRawDataFile.outputStream().buffered() }

    /** 一時ファイル読み出しで使う */
    private val bufferedInputStream by lazy { tempRawDataFile.inputStream().buffered() }

    /** ファイル合成 */
    private val mediaMuxer by lazy { MediaMuxer(mergeFilePath.path, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4) }

    /** 取り出した[MediaFormat] */
    private var currentMediaFormat: MediaFormat? = null

    /** 現在進行中の[MediaExtractor] */
    private var currentMediaExtractor: MediaExtractor? = null

    /** エンコード用 [MediaCodec] */
    private var encodeMediaCodec: MediaCodec? = null

    /** デコード用 [MediaCodec] */
    private var decodeMediaCodec: MediaCodec? = null

    /**
     * 結合を開始する
     *
     * 同期処理になるので、別スレッドで実行してください
     * */
    fun merge() {

        /**
         * MediaExtractorで動画ファイルを読み出す
         *
         * @param path 動画パス
         * */
        fun extractVideoFile(path: String) {
            // 動画の情報を読み出す
            val (_mediaExtractor, index, format) = extractMedia(path, "audio/") ?: return
            currentMediaExtractor = _mediaExtractor
            currentMediaFormat = format
            // 音声のトラックを選択
            currentMediaExtractor?.selectTrack(index)
        }

        // 最初の動画を解析
        extractVideoFile(videoListIterator.next().path)

        // 解析結果から各パラメータを取り出す
        val mimeType = currentMediaFormat?.getString(MediaFormat.KEY_MIME)!! // AACなら audio/mp4a-latm
        val samplingRate = currentMediaFormat?.getInteger(MediaFormat.KEY_SAMPLE_RATE)!! // 44100
        val channelCount = currentMediaFormat?.getInteger(MediaFormat.KEY_CHANNEL_COUNT)!! // 2

        // エンコーダーにセットするMediaFormat
        val audioMediaFormat = MediaFormat.createAudioFormat(mimeType, samplingRate, channelCount).apply {
            setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
            setInteger(MediaFormat.KEY_MAX_INPUT_SIZE, INPUT_BUFFER_SIZE)
            setInteger(MediaFormat.KEY_AAC_PROFILE, MediaCodecInfo.CodecProfileLevel.AACObjectLC)
        }

        // 音声を追加してトラック番号をもらう
        // 多分 addTrack する際は MediaExtractor 経由で取得した MediaFormat を入れないといけない？
        val audioTrackIndex = mediaMuxer.addTrack(currentMediaFormat!!)

        // デコード用（aac -> 生データ）MediaCodec
        decodeMediaCodec = MediaCodec.createDecoderByType(mimeType).apply {
            // デコード時は MediaExtractor の MediaFormat で良さそう
            configure(currentMediaFormat!!, null, null, 0)
        }
        // エンコード用（生データ -> aac）MediaCodec
        encodeMediaCodec = MediaCodec.createEncoderByType(mimeType).apply {
            configure(audioMediaFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        }

        // nonNull
        val decodeMediaCodec = decodeMediaCodec!!
        val encodeMediaCodec = encodeMediaCodec!!
        // スタート
        decodeMediaCodec.start()
        encodeMediaCodec.start()
        mediaMuxer.start()

        // 再生位置など
        val bufferInfo = MediaCodec.BufferInfo()

        /**
         * データを順次読み出して、[MediaCodec]で生データへ変換する。
         * 変換した生データは[tempRawDataFile]へ一時的に入れる。
         * */
        var totalPresentationTime = 0L
        var prevPresentationTime = 0L
        while (true) {
            // もし -1 が返ってくれば configure() が間違ってる
            val inputBufferId = decodeMediaCodec.dequeueInputBuffer(TIMEOUT_US)
            if (inputBufferId >= 0) {
                // Extractorからデータを読みだす
                val inputBuffer = decodeMediaCodec.getInputBuffer(inputBufferId)!!
                val size = currentMediaExtractor!!.readSampleData(inputBuffer, 0)
                if (size > 0) {
                    // デコーダーへ流す
                    decodeMediaCodec.queueInputBuffer(inputBufferId, 0, size, currentMediaExtractor!!.sampleTime + totalPresentationTime, 0)
                    currentMediaExtractor!!.advance()
                    // 一個前の動画の動画サイズを控えておく
                    // else で extractor.sampleTime すると既に-1にっているので
                    if (currentMediaExtractor!!.sampleTime != -1L) {
                        prevPresentationTime = currentMediaExtractor!!.sampleTime
                    }
                } else {
                    totalPresentationTime += prevPresentationTime
                    // データがないので次データへ
                    if (videoListIterator.hasNext()) {
                        // 次データへ
                        val file = videoListIterator.next()
                        // 多分いる
                        decodeMediaCodec.queueInputBuffer(inputBufferId, 0, 0, 0, 0)
                        // 動画の情報を読み出す
                        currentMediaExtractor!!.release()
                        extractVideoFile(file.path)
                    } else {
                        // データなくなった場合は終了フラグを立てる
                        decodeMediaCodec.queueInputBuffer(inputBufferId, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
                        // 開放
                        currentMediaExtractor!!.release()
                        // 終了
                        break
                    }
                }
            }

            /**
             * デコード結果を受け取って、一時的に保存する
             * */
            val outputBufferId = decodeMediaCodec.dequeueOutputBuffer(bufferInfo, TIMEOUT_US)
            if (outputBufferId >= 0) {
                // デコード結果をもらう
                val outputBuffer = decodeMediaCodec.getOutputBuffer(outputBufferId)!!
                // 生データを一時的に保存する
                val chunk = ByteArray(bufferInfo.size)
                outputBuffer[chunk]
                bufferedOutputStream.write(chunk)
                // 消したほうがいいらしい
                outputBuffer.clear()
                // 返却
                decodeMediaCodec.releaseOutputBuffer(outputBufferId, false)
            }
        }

        // Xiaomi端末で落ちたので例外処理
        try {
            // デコーダー終了
            decodeMediaCodec.stop()
            decodeMediaCodec.release()
            bufferedOutputStream.close()
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // 読み出し済みの位置と時間
        var totalBytesRead = 0
        var presentationTime = 0L

        /**
         * 一時的に保存したファイルを読み出して、エンコーダーに入れる。
         * エンコード結果を[MediaMuxer]へ入れて完成。
         * */
        while (true) {
            val inputBufferId = encodeMediaCodec.dequeueInputBuffer(TIMEOUT_US)
            if (inputBufferId >= 0) {
                // デコードした生データをエンコーダーへ渡す
                val inputBuffer = encodeMediaCodec.getInputBuffer(inputBufferId)!!
                val buffer = ByteArray(inputBuffer.capacity())
                val size = bufferedInputStream.read(buffer)
                // エンコーダーへ渡す
                if (size > 0) {
                    // 書き込む。書き込んだデータは[onOutputBufferAvailable]で受け取れる
                    inputBuffer.put(buffer, 0, size)
                    encodeMediaCodec.queueInputBuffer(inputBufferId, 0, size, presentationTime, 0)
                    totalBytesRead += size
                    // あんまり分からん
                    presentationTime = 1000000L * (totalBytesRead / (channelCount * 2)) / samplingRate
                } else {
                    // 終了
                    encodeMediaCodec.queueInputBuffer(inputBufferId, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
                }
            }
            // デコーダーから生データを受け取る
            val outputBufferId = encodeMediaCodec.dequeueOutputBuffer(bufferInfo, TIMEOUT_US)
            if (outputBufferId >= 0) {
                // デコード結果をもらう
                val outputBuffer = encodeMediaCodec.getOutputBuffer(outputBufferId)!!
                if (bufferInfo.size > 0) {
                    // 書き込む
                    mediaMuxer.writeSampleData(audioTrackIndex, outputBuffer, bufferInfo)
                    // 返却
                    encodeMediaCodec.releaseOutputBuffer(outputBufferId, false)
                } else {
                    // もう無い！
                    break
                }
            }
        }

        // Xiaomi端末で落ちたので例外処理
        try {
            // エンコーダー終了
            encodeMediaCodec.stop()
            encodeMediaCodec.release()
            bufferedInputStream.close()

            // MediaMuxerも終了
            // MediaMuxer#stopでコケる場合、大体MediaFormatのパラメータ不足です。
            // MediaExtractorで出てきたFormatを入れると直ると思います。
            mediaMuxer.stop()
            mediaMuxer.release()

            // 一時ファイルの削除
            tempRawDataFile.delete()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /** 強制終了時に呼ぶ */
    fun stop() {
        decodeMediaCodec?.stop()
        decodeMediaCodec?.release()
        bufferedOutputStream.close()
        encodeMediaCodec?.stop()
        encodeMediaCodec?.release()
        bufferedInputStream.close()
        currentMediaExtractor?.release()
        mediaMuxer.stop()
        mediaMuxer.release()
        tempRawDataFile.delete()
    }

    /**
     * 引数に渡した動画パス[videoPath]の情報を[MediaExtractor]で取り出す
     *
     * @param mimeType 音声なら audio/ 動画なら video/
     * @param videoPath 動画の動画パス
     * */
    private fun extractMedia(videoPath: String, mimeType: String): Triple<MediaExtractor, Int, MediaFormat>? {
        val mediaExtractor = MediaExtractor().apply { setDataSource(videoPath) }
        val (index, track) = (0 until mediaExtractor.trackCount)
            .map { index -> index to mediaExtractor.getTrackFormat(index) }
            .firstOrNull { (_, track) -> track.getString(MediaFormat.KEY_MIME)?.startsWith(mimeType) == true } ?: return null
        return Triple(mediaExtractor, index, track)
    }

}
```

### MainActivity.kt

```kotlin
/**
 * 動画保存先
 *
 * /sdcard/Android/data/{パッケージId}/files/video
 * */
class MainActivity : AppCompatActivity() {
    /** 動画ファイルがあるフォルダ名 */
    private val FOLDER_NAME = "bakkure"

    /** ファイル名 */
    private val MERGE_FILE_NAME = "merged.aac"

    /** 一時ファイルの名前 */
    private val TEMP_RAW_DATA_FILE_NAME = "temp_raw_data"

    /** 音声くっつけるやつ */
    private lateinit var audioDataMerge: AudioDataMerge

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 結合したい動画ファイルが置いてあるフォルダ
        val videoFolder = File(getExternalFilesDir(null), FOLDER_NAME).apply {
            if (!exists()) {
                mkdir()
            }
        }

        // 最終的に結合するファイル
        val mergedFile = File(getExternalFilesDir(null), MERGE_FILE_NAME).apply {
            if (!exists()) {
                delete()
            }
            createNewFile()
        }

        // 音声だけの生データをおいておくファイル
        val tempRawDataFile = File(getExternalFilesDir(null), TEMP_RAW_DATA_FILE_NAME).apply {
            if (!exists()) {
                delete()
            }
            createNewFile()
        }

        // 数字を見つける正規表現
        val numberRegex = "(\\d+)".toRegex()
        // 結合する動画ファイルを配列
        val videoList = videoFolder.listFiles()
            // ?.filter { it.extension == "ts" } // これ動画ファイル以外が入ってくる場合はここで見切りをつける
            ?.toList()
            ?.sortedBy { numberRegex.find(it.name)?.groupValues?.get(0)?.toIntOrNull() ?: 0 } // 数字の若い順にする

        // インスタンス作成
        audioDataMerge = AudioDataMerge(videoList!!, mergedFile, tempRawDataFile)

        // 別スレッドを起動して開始
        // コルーチンとかを使うべきです...
        thread {
            val startMs = System.currentTimeMillis()
            showMessage("開始：$startMs")
            audioDataMerge.merge()
            showMessage("終了：${System.currentTimeMillis() - startMs} Ms")
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        audioDataMerge.stop()
    }

    private fun showMessage(message: String) {
        println(message)
        runOnUiThread { Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show() }
    }
}
```

## 映像部分
映像データをSurfaceへ描画して結合するクラスを書きました。  
説明はコメントに書いておきました。  
緑で出力された場合はMediaFormatのコーデック固有のパラメーターがおかしいかも。(csd-1,csd-0 とか？)  
なんか動かない場合は、解像度は16の倍数であるか確認するといいのかも？
- 1280 x 720
    - 余り出ない
- 720 x 480
    - 余り出ない
- 640 x 360
    - 360 / 16 で余りが出るので、割り切れる 368 にする必要がある

```kotlin
/**
 * 映像データを結合する
 *
 * @param videoList 結合する動画、音声ファイルの配列。入っている順番どおりに結合します。
 * @param mergeFilePath 結合したファイルの保存先
 * @param bitRate ビットレート。何故か取れなかった
 * @param frameRate フレームレート。何故か取れなかった
 * */
class VideoDataMerge(
    videoList: List<File>,
    private val mergeFilePath: File,
    private val bitRate: Int = 1_000_000, // 1Mbps
    private val frameRate: Int = 30, // 30fps
) {

    /** タイムアウト */
    private val TIMEOUT_US = 10000L

    /** MediaCodecでもらえるInputBufferのサイズ */
    private val INPUT_BUFFER_SIZE = 655360

    /** 結合する動画の配列のイテレータ */
    private val videoListIterator = videoList.listIterator()

    /** ファイル合成 */
    private val mediaMuxer by lazy { MediaMuxer(mergeFilePath.path, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4) }

    /** 取り出した[MediaFormat] */
    private var currentMediaFormat: MediaFormat? = null

    /** 現在進行中の[MediaExtractor] */
    private var currentMediaExtractor: MediaExtractor? = null

    /** エンコード用 [MediaCodec] */
    private var encodeMediaCodec: MediaCodec? = null

    /** デコード用 [MediaCodec] */
    private var decodeMediaCodec: MediaCodec? = null

    /** エンコーダーとデコーダーの橋渡しをするSurface */
    private var encoderSurface: Surface? = null

    /**
     * 結合を開始する
     *
     * 同期処理になるので、別スレッドで実行してください
     * */
    fun merge() {
        /**
         * MediaExtractorで動画ファイルを読み出す
         *
         * @param path 動画パス
         * */
        fun extractVideoFile(path: String) {
            // 動画の情報を読み出す
            val (_mediaExtractor, index, format) = extractMedia(path, "video/") ?: return
            currentMediaExtractor = _mediaExtractor
            currentMediaFormat = format
            // 音声のトラックを選択
            currentMediaExtractor?.selectTrack(index)
            currentMediaExtractor?.seekTo(0, MediaExtractor.SEEK_TO_PREVIOUS_SYNC)
        }

        // 最初の動画を解析
        extractVideoFile(videoListIterator.next().path)

        // 解析結果から各パラメータを取り出す
        // 動画の幅、高さは16の倍数である必要があります。（どこに書いてんねんクソが）
        val mimeType = currentMediaFormat?.getString(MediaFormat.KEY_MIME)!! // video/avc
        val width = currentMediaFormat?.getInteger(MediaFormat.KEY_WIDTH)!! // 1280
        val height = currentMediaFormat?.getInteger(MediaFormat.KEY_HEIGHT)!! // 720

        // エンコーダーにセットするMediaFormat
        val videoMediaFormat = MediaFormat.createVideoFormat(mimeType, width, height).apply {
            setInteger(MediaFormat.KEY_MAX_INPUT_SIZE, INPUT_BUFFER_SIZE)
            setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
            setInteger(MediaFormat.KEY_FRAME_RATE, frameRate)
            setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1)
            setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
        }

        // 後に映像トラックのトラック番号が入る
        // encodeMediaCodec.outputFormat を MediaMuxer へ渡す
        var videoTrackIndex = NO_INDEX_VALUE

        // エンコード用（生データ -> H.264）MediaCodec
        encodeMediaCodec = MediaCodec.createEncoderByType(mimeType).apply {
            configure(videoMediaFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        }

        // エンコーダーのSurfaceを取得
        // デコーダーの出力Surfaceの項目にこれを指定して、エンコーダーに映像データがSurface経由で行くようにする
        encoderSurface = encodeMediaCodec!!.createInputSurface()

        // デコード用（H.264 -> 生データ）MediaCodec
        decodeMediaCodec = MediaCodec.createDecoderByType(mimeType).apply {
            // デコード時は MediaExtractor の MediaFormat で良さそう
            configure(currentMediaFormat!!, encoderSurface, null, 0)
        }

        // nonNull
        val decodeMediaCodec = decodeMediaCodec!!
        val encodeMediaCodec = encodeMediaCodec!!
        encodeMediaCodec.start()
        decodeMediaCodec.start()

        // 前回の動画ファイルを足した動画時間
        var totalPresentationTime = 0L
        var prevPresentationTime = 0L

        // メタデータ格納用
        val bufferInfo = MediaCodec.BufferInfo()

        // ループ制御
        var outputDone = false
        var inputDone = false

        /**
         *  --- 複数ファイルを全てデコードする ---
         * */
        while (!outputDone) {
            if (!inputDone) {

                val inputBufferId = decodeMediaCodec.dequeueInputBuffer(TIMEOUT_US)
                if (inputBufferId >= 0) {
                    val inputBuffer = decodeMediaCodec.getInputBuffer(inputBufferId)!!
                    val size = currentMediaExtractor!!.readSampleData(inputBuffer, 0)
                    if (size > 0) {
                        // デコーダーへ流す
                        // 今までの動画の分の再生位置を足しておく
                        decodeMediaCodec.queueInputBuffer(inputBufferId, 0, size, currentMediaExtractor!!.sampleTime + totalPresentationTime, 0)
                        currentMediaExtractor!!.advance()
                        // 一個前の動画の動画サイズを控えておく
                        // else で extractor.sampleTime すると既に-1にっているので
                        if (currentMediaExtractor!!.sampleTime != -1L) {
                            prevPresentationTime = currentMediaExtractor!!.sampleTime
                        }
                    } else {
                        totalPresentationTime += prevPresentationTime
                        // データがないので次データへ
                        if (videoListIterator.hasNext()) {
                            // 次データへ
                            val file = videoListIterator.next()
                            // 多分いる
                            decodeMediaCodec.queueInputBuffer(inputBufferId, 0, 0, 0, 0)
                            // 動画の情報を読み出す
                            currentMediaExtractor!!.release()
                            extractVideoFile(file.path)
                        } else {
                            // データなくなった場合は終了
                            decodeMediaCodec.queueInputBuffer(inputBufferId, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
                            // 開放
                            currentMediaExtractor!!.release()
                            // 終了
                            inputDone = true
                        }
                    }
                }
            }

            var decoderOutputAvailable = true
            while (decoderOutputAvailable) {
                // Surface経由でデータを貰って保存する
                val encoderStatus = encodeMediaCodec.dequeueOutputBuffer(bufferInfo, TIMEOUT_US)
                if (encoderStatus >= 0) {
                    val encodedData = encodeMediaCodec.getOutputBuffer(encoderStatus)!!
                    if (bufferInfo.size > 1) {
                        if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG == 0) {
                            // ファイルに書き込む...
                            mediaMuxer.writeSampleData(videoTrackIndex, encodedData, bufferInfo)
                        } else if (videoTrackIndex == NO_INDEX_VALUE) {
                            // MediaMuxerへ映像トラックを追加するのはこのタイミングで行う
                            // このタイミングでやると固有のパラメーターがセットされたMediaFormatが手に入る(csd-0 とか)
                            // 映像がぶっ壊れている場合（緑で塗りつぶされてるとか）は多分このあたりが怪しい
                            val newFormat = encodeMediaCodec.outputFormat
                            videoTrackIndex = mediaMuxer.addTrack(newFormat)
                            mediaMuxer.start()
                        }
                    }
                    outputDone = bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0
                    encodeMediaCodec.releaseOutputBuffer(encoderStatus, false)
                }
                if (encoderStatus != MediaCodec.INFO_TRY_AGAIN_LATER) {
                    continue
                }
                // Surfaceへレンダリングする。
                val outputBufferId = decodeMediaCodec.dequeueOutputBuffer(bufferInfo, TIMEOUT_US)
                if (outputBufferId == MediaCodec.INFO_TRY_AGAIN_LATER) {
                    decoderOutputAvailable = false
                } else if (outputBufferId >= 0) {
                    val doRender = bufferInfo.size != 0
                    decodeMediaCodec.releaseOutputBuffer(outputBufferId, doRender)
                    if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) {
                        decoderOutputAvailable = false
                        encodeMediaCodec.signalEndOfInputStream()
                    }
                }
            }
        }

        // Xiaomi端末で落ちたので例外処理
        try {
            // デコーダー終了
            decodeMediaCodec.stop()
            decodeMediaCodec.release()
            // Surface開放
            encoderSurface?.release()
            // エンコーダー終了
            encodeMediaCodec.stop()
            encodeMediaCodec.release()
            // MediaMuxerも終了
            mediaMuxer.stop()
            mediaMuxer.release()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /** 強制終了時に呼ぶ */
    fun stop() {
        decodeMediaCodec?.stop()
        decodeMediaCodec?.release()
        encoderSurface?.release()
        encodeMediaCodec?.stop()
        encodeMediaCodec?.release()
        currentMediaExtractor?.release()
        mediaMuxer.stop()
        mediaMuxer.release()
    }

    /**
     * 引数に渡した動画パス[videoPath]の情報を[MediaExtractor]で取り出す
     *
     * @param mimeType 音声なら audio/ 動画なら video/
     * @param videoPath 動画の動画パス
     * */
    private fun extractMedia(videoPath: String, mimeType: String): Triple<MediaExtractor, Int, MediaFormat>? {
        val mediaExtractor = MediaExtractor().apply { setDataSource(videoPath) }
        val (index, track) = (0 until mediaExtractor.trackCount)
            .map { index -> index to mediaExtractor.getTrackFormat(index) }
            .firstOrNull { (_, track) -> track.getString(MediaFormat.KEY_MIME)?.startsWith(mimeType) == true } ?: return null
        return Triple(mediaExtractor, index, track)
    }

    companion object {

        /** トラック番号が空の場合 */
        const val NO_INDEX_VALUE = -100

    }

}
```

### MainActivity.kt
音声とあんまり変わらん。  
ビットレート、フレームレートを調整したい場合は引数に渡せばいいと思います。

```kotlin
/**
 * 動画保存先
 *
 * /sdcard/Android/data/io.github.takusan23.androidmediacodecvideomerge/files/video
 * */
class MainActivity : AppCompatActivity() {
    /** 動画ファイルがあるフォルダ名 */
    private val FOLDER_NAME = "bakkure"

    /** ファイル名 */
    private val MERGE_FILE_NAME = "merged.mp4"

    /** 映像くっつけるやつ */
    private lateinit var videoDataMerge: VideoDataMerge

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 結合したい動画ファイルが置いてあるフォルダ
        val videoFolder = File(getExternalFilesDir(null), FOLDER_NAME).apply {
            if (!exists()) {
                mkdir()
            }
        }

        // 最終的に結合するファイル
        val mergedFile = File(getExternalFilesDir(null), MERGE_FILE_NAME).apply {
            if (!exists()) {
                delete()
            }
            createNewFile()
        }

        // 数字を見つける正規表現
        val numberRegex = "(\\d+)".toRegex()
        // 結合する動画ファイルを配列
        val videoList = videoFolder.listFiles()
            // ?.filter { it.extension == "ts" } // これ動画ファイル以外が入ってくる場合はここで見切りをつける
            ?.toList()
            ?.sortedBy { numberRegex.find(it.name)?.groupValues?.get(0)?.toIntOrNull() ?: 0 } // 数字の若い順にする

        // インスタンス作成
        videoDataMerge = VideoDataMerge(videoList!!, mergedFile, /*bitRate = 1_000_000, frameRate = 30*/)

        // 別スレッドを起動して開始
        // コルーチンとかを使うべきです...
        thread {
            val startMs = System.currentTimeMillis()
            showMessage("開始：$startMs")
            videoDataMerge.merge()
            showMessage("終了：${System.currentTimeMillis() - startMs} Ms")
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        videoDataMerge.stop()
    }

    private fun showMessage(message: String) {
        println(message)
        runOnUiThread { Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show() }
    }
}
```

## 音声と映像をコンテナフォーマットへ格納する
こっからはそんなに難しくないです。  
それぞれを`MediaExtractor`で取り出して、そのまま`MediaMuxer`へ渡すだけです！

```kotlin
/**
 * 音声と映像をコンテナフォーマットへしまって一つの動画にする関数がある
 * */
object MergedDataMuxer {

    /**
     * コンテナフォーマットへ格納する
     *
     * @param resultFile 最終的なファイル
     * @param mergeFileList コンテナフォーマットへ入れる音声、映像データの[File]
     * */
    @SuppressLint("WrongConstant")
    fun mixed(
        resultFile: File,
        mergeFileList: List<File>,
    ) {
        // 映像と音声を追加して一つの動画にする
        val mediaMuxer = MediaMuxer(resultFile.path, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)

        // 音声、映像ファイルの トラック番号 と [MediaExtractor] の Pair
        val trackIndexToExtractorPairList = mergeFileList
            .map {
                // MediaExtractorとフォーマット取得
                val mediaExtractor = MediaExtractor().apply { setDataSource(it.path) }
                val mediaFormat = mediaExtractor.getTrackFormat(0) // 音声には音声、映像には映像しか無いので 0
                mediaExtractor.selectTrack(0)
                mediaFormat to mediaExtractor
            }
            .map { (format, extractor) ->
                // フォーマットをMediaMuxerに渡して、トラックを追加してもらう
                val videoTrackIndex = mediaMuxer.addTrack(format)
                videoTrackIndex to extractor
            }
        // MediaMuxerスタート
        mediaMuxer.start()
        // 映像と音声を一つの動画ファイルに書き込んでいく
        trackIndexToExtractorPairList.forEach { (index, extractor) ->
            val byteBuffer = ByteBuffer.allocate(1024 * 4096)
            val bufferInfo = MediaCodec.BufferInfo()
            // データが無くなるまで回す
            while (true) {
                // データを読み出す
                val offset = byteBuffer.arrayOffset()
                bufferInfo.size = extractor.readSampleData(byteBuffer, offset)
                // もう無い場合
                if (bufferInfo.size < 0) break
                // 書き込む
                bufferInfo.presentationTimeUs = extractor.sampleTime
                bufferInfo.flags = extractor.sampleFlags // Lintがキレるけど黙らせる
                mediaMuxer.writeSampleData(index, byteBuffer, bufferInfo)
                // 次のデータに進める
                extractor.advance()
            }
            // あとしまつ
            extractor.release()
        }
        // あとしまつ
        mediaMuxer.stop()
        mediaMuxer.release()
    }

}
```

## 最終的な MainActivity

```kotlin
/**
 * 動画保存先
 *
 * /sdcard/Android/data/io.github.takusan23.androidmediacodecvideomerge/files/video
 * */
class MainActivity : AppCompatActivity() {
    /** 動画ファイルがあるフォルダ名 */
    private val FOLDER_NAME = "bakkure"

    /** 映像 ファイル名 */
    private val MERGE_VIDEO_FILE_NAME = "video_merge.mp4"

    /** 音声 ファイル名 */
    private val MERGE_AUDIO_FILE_NAME = "audio_merge.aac"

    /** 映像と音声を合わせたファイル */
    private val FINAL_RESULT_FILE = "final_merge.mp4"

    /** 一時ファイルの名前 */
    private val TEMP_RAW_DATA_FILE_NAME = "temp_raw_data"

    /** 映像くっつけるやつ */
    private lateinit var videoDataMerge: VideoDataMerge

    /** 音声くっつけるやつ */
    private lateinit var audioDataMerge: AudioDataMerge

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 結合したい動画ファイルが置いてあるフォルダ
        val videoFolder = File(getExternalFilesDir(null), FOLDER_NAME).apply {
            if (!exists()) {
                mkdir()
            }
        }

        // 最終的に結合するファイル。映像
        val videoMergedFile = File(getExternalFilesDir(null), MERGE_VIDEO_FILE_NAME).apply {
            if (!exists()) {
                delete()
            }
            createNewFile()
        }

        // 最終的に結合するファイル。音声
        val audioMergedFile = File(getExternalFilesDir(null), MERGE_AUDIO_FILE_NAME).apply {
            if (!exists()) {
                delete()
            }
            createNewFile()
        }

        // 音声だけの生データをおいておくファイル
        val tempRawDataFile = File(getExternalFilesDir(null), TEMP_RAW_DATA_FILE_NAME).apply {
            if (!exists()) {
                delete()
            }
            createNewFile()
        }

        // 最終的なファイル
        val finalResultFile = File(getExternalFilesDir(null), FINAL_RESULT_FILE).apply {
            if (!exists()) {
                delete()
            }
            createNewFile()
        }


        // 数字を見つける正規表現
        val numberRegex = "(\\d+)".toRegex()
        // 結合する動画ファイルを配列
        val videoList = videoFolder.listFiles()
            // ?.filter { it.extension == "ts" } // これ動画ファイル以外が入ってくる場合はここで見切りをつける
            ?.toList()
            ?.sortedBy { numberRegex.find(it.name)?.groupValues?.get(0)?.toIntOrNull() ?: 0 } // 数字の若い順にする
        // ?.dropLast(6)

        // インスタンス作成
        videoDataMerge = VideoDataMerge(videoList!!, videoMergedFile /*bitRate = 1_000_000, frameRate = 30*/)
        audioDataMerge = AudioDataMerge(videoList!!, audioMergedFile, tempRawDataFile, bitRate = 192_000)

        // 別スレッドを起動して開始
        // 音声と映像をそれぞれ並列で実行したほうがいいと思います...（デコーダーの起動制限に引っかからなければ）
        // 今回はコルーチン入れてないので直列で行います...
        thread {
            // 映像デコード
            val videoStartMs = System.currentTimeMillis()
            showMessage("映像開始：$videoStartMs")
            videoDataMerge.merge()
            showMessage("映像終了：${System.currentTimeMillis() - videoStartMs} Ms")

            // 音声デコード
            val audioStartMs = System.currentTimeMillis()
            showMessage("音声開始：$audioStartMs")
            audioDataMerge.merge()
            showMessage("音声終了：${System.currentTimeMillis() - audioStartMs} Ms")

            // 合成...
            MergedDataMuxer.mixed(finalResultFile, listOf(audioMergedFile, videoMergedFile))
            showMessage("合成終了：${System.currentTimeMillis() - videoStartMs} Ms")
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        videoDataMerge.stop()
        audioDataMerge.stop()
    }

    private fun showMessage(message: String) {
        println(message)
        runOnUiThread { Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show() }
    }
}
```

## ベンチマーク
映像 -> 音声 -> 合成 という感じに直列でやっている

5:14分の動画をFFmpegで細切れにして合成テスト  
各tsファイル 1MB ～ 2MB ぐらい。これが30個。

- https://www.youtube.com/watch?v=F2ZAlXrldIM
    - 5分14秒
    - 1280 x 720
        - 解像度の割に画質が悪い（ビットレートのせい？）
    - 60 fps
    - ビットレートはわからん
    - H.264 / AAC

- Pixel 3 XL
    - Snapdragon 845 / RAM 4GB (ハイエンドな同世代のスマホと比べても少ない)

```
映像終了：1090457 Ms
音声終了：231366 Ms
合成終了：1332262 Ms
ファイルサイズ：105 MB ←！？
```

- Xperia 5 Ⅱ
    - Snapdragon 865 / RAM 8GB

```
映像終了：817174 Ms
音声終了：174536 Ms
合成終了：995225 Ms
ファイルサイズ：46.80 MB
```

- Xiaomi Mi 11 Lite 5G
    - Snapdragon 780G / RAM 6GB

```
映像終了：871282 Ms
音声終了：187584 Ms
合成終了：1063305 Ms
ファイルサイズ：49.81 MB
```

# メモ

- Pixel 3 XL だとなんか映像データのファイルサイズがクソでかい
    - 今回使った Xperia / Xiaomi と比べてもくっそでかい
- `MediaCodec#getInputBuffer()`のサイズを変更する
    - 初期状態だと`4096`ぐらいだったはず
        - `MediaCodec#configure()`で`MediaFormat.KEY_MAX_INPUT_SIZE`をいい感じにすれば大きく出来ます
- 1、2年前ぐらいにAOSPをパクって作った内部音声録画のサンプルがいい感じに役立った。ありがとう過去の私
    - https://github.com/takusan23/InternalAudioRecorder
- エミュレータが起動しない
    - Cドライブ空いてる？
- 出力がぶっ壊れる（緑色とか）
    - MediaMuxerへ渡したMediaFormatだ正しくないかも
        - `MediaCodec#getOutputFormat()`で取れるやつを入れればいいと思う
- 解像度が16の倍数じゃないとだめ
    - 公式に書いてないっぽい？

# すぺしゃる さんくす
とてもとても参考にしました

- https://android.googlesource.com/platform/cts/+/jb-mr2-release/tests/tests/media/src/android/media/cts/ExtractDecodeEditEncodeMuxTest.java
    - Apache License, Version 2.0
- https://github.com/ypresto/android-transcoder/blob/ac94c6b059785bc7440e35422bf18d3a9913e884/lib/src/main/java/net/ypresto/androidtranscoder/engine/VideoTrackTranscoder.java
    - Apache License, Version 2.0
- https://github.com/zolad/VideoSlimmer
    - Apache License, Version 2.0

# おまけ
参考にしたサンプルにOpenGLを利用する例があったので作ってみました、  
何やってるのかはまじでわかりません。なんでこれで動くの...？

OpenGLを利用すると分からんけど、形式が異なる（横縦の大きさが違う）ファイルでも結合できるっぽい（なんで？）

- https://github.com/takusan23/AndroidMediaCodecVideoMerge/blob/master/app/src/main/java/io/github/takusan23/androidmediacodecvideomerge/VideoDataOpenGlMerge.kt
    - OpenGLを利用した VideoDataMerge
    - VideoDataMerge と使い方は同じ...
- https://github.com/takusan23/AndroidMediaCodecVideoMerge/blob/master/app/src/main/java/io/github/takusan23/androidmediacodecvideomerge/gl/TextureRenderer.java
    - 必要。何やってるのかは分からん
- https://github.com/takusan23/AndroidMediaCodecVideoMerge/blob/master/app/src/main/java/io/github/takusan23/androidmediacodecvideomerge/gl/CodecInputSurface.java
    - 必要。何やってるのかは分からん

# ソースコード
気が向いたら合成アプリを作りたいです...

https://github.com/takusan23/AndroidMediaCodecVideoMerge

# おわりに

Dreamin'Her -僕は、彼女の夢を見る。-  

ってやつ全年齢なんだけどめっちゃ気になる。~~買おうかな~~

かった、パッケージ版高いよぉ

![Imgur](https://i.imgur.com/oiBU1KT.png)