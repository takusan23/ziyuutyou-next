---
title: 夏休みの自由研究 通常版とカラオケ版トラックを使ってボーカルだけの音楽を作る
created_at: 2023-08-31
tags:
- Android
- MediaCodec
- Kotlin
---

どうもこんばんわ。  
今でも 8/31 まで夏休みあるんですかね？

# 本題
ノイズキャンセリングって、周りの音を逆位相にして周囲の音を打ち消しているらしいんですよね。  

で、それを使えば音楽の通常版とカラオケ版トラックを使いカラオケ版トラックを逆位相にすることで、カラオケ版の逆、つまりボーカルだけのトラックが作れる  

昔からあるやつなので、普通は`Audacity`とかでやればいいと思うんですけど、今回は`Android`でやります！！！

# ながれ

- 音声ファイルを用意する
    - 通常版とカラオケ版トラックを用意する
- 音声ファイルを未圧縮状態にする（デコード）
    - 後述
    - PCM とかいうやつですね
- 通常版トラックと逆位相カラオケ版トラックを足し算して、ボーカルだけにする
    - 正確には通常版からカラオケ版トラックを引く
        - 音は波なので、そのまま足したり引いたりできる
        - 逆位相にして合成するのとやってることは変わらんはず
- 未圧縮状態のデータなので、このままだとファイルサイズが大きいままなので、圧縮する（エンコード）
    - 未圧縮状態だと多分音楽プレイヤーでも再生できない
    - `ffplay`とか`Audacity`でパラメータ合わせれば再生できるかもしれん

## 未圧縮状態にする
`CD`とかで取り込むと、既にエンコードされている状態で保存されますよね。（`.mp3`、`.flac`、`.aac`）  
エンコードされているということは、圧縮されている状態なので、音声データを加工したい場合はまず圧縮を元に戻す必要があります。デコードと呼ばれる作業ですね。  
（`zip`を解凍しないと中身いじれない感じで）  

動画/音楽プレイヤーが圧縮されている音声を再生できるのは、デコードと呼ばれる作業をし、元の音声ファイルに戻しているからなんですね。  
`Audacity`のファイルが大きいのは編集のために未圧縮状態で持っておく必要があるからなんですね

## 音声を支える技術

- MediaCodec
    - このブログでも何回か取り上げているくせ者
        - https://takusan.negitoro.dev/posts/tag/MediaCodec/
    - 映像や音声のエンコード、デコードをするクラス
        - `Media3 (ExoPlayer)`が動画を再生できるのは、くせ者`MediaCodec`を使っているからなんですね
    - 最終的にはC言語とかで書かれた処理に到達する、エラーが何もわからない
    - `H.264`、`H.265`、`VP9`とか`AAC`とか、コーデックと呼ばれるやつをやってくれる
    - くせ者
- MediaExtractor
    - `mp4`や`aac`などのファイルから、`MediaCodec`へ渡すためのデータを取り出してくれるクラス
        - `mp4`とか`aac`には実際のデータ以外にもメタデータを持っている（動画の縦横サイズ、ビットレート、fps など）ので、メタデータと実際のデータをそれぞれ分けて取り出してくれる
    - `mp4`とか`aac`はコンテナフォーマットとかいうやつですね
    - くせ者
- MediaMuxer
    - `MediaCodec`から出てきたデータを`mp4`とかに保存するためのクラス、`MediaExtractor`の逆をする
        - コンテナフォーマットって難しいんですね...
    - くせ者

# 環境

| なまえ           | あたい                                                                                                 |
|------------------|--------------------------------------------------------------------------------------------------------|
| Windows          | 10 Pro                                                                                                 |
| Android Studio   | Android Studio Giraffe                                                                                 |
| たんまつ         | Google Pixel 6 Pro                                                                                     |
| 使う音声ファイル | `flac`（多分`AAC`でもいいはず）/ サンプリング周波数 44.1 kHz / ビットレート 1 Mbps / チャンネル数 2 ch |

音声ファイルは、通常版とカラオケ版で、サンプリング周波数（ビットレートも？？）が同じじゃないとダメだと思う（CDから入れれば同じ設定だと思いますが...）

![Imgur](https://i.imgur.com/taTzKxx.png)

# 作る

つくります

## 適当にプロジェクトを作成
`Jetpack Compose`でいきます！もう`レイアウトのxml`一生書きたくない！

ついに！`build.gradle.kts`がデフォルトで作れるようになりましたね！！！  
長かったけどまぁ旨味あんまりないから`build.gradle`から移行するほどではなさそう

![Imgur](https://i.imgur.com/FWVEz3f.png)

## 音楽を選ぶためのUI
ファイルピッカーを開いて、音声ファイルを選ぶ処理を書きます。  
適当にボタンを置きます。  

本当は`HomeScreen`は別ファイルのほうが良さそうですがまぁ単発企画なのでこのままで行きます

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            VocalOnlyDroidTheme {
                HomeScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen() {
    val context = LocalContext.current

    // 音声ファイルの Uri
    val normalTrackUri = remember { mutableStateOf<Uri?>(null) }
    val instrumentalTrackUri = remember { mutableStateOf<Uri?>(null) }

    // ファイルピッカー
    val normalTrackFilePicker = rememberLauncherForActivityResult(contract = ActivityResultContracts.OpenDocument()) { normalTrackUri.value = it }
    val instrumentalTrackFilePicker = rememberLauncherForActivityResult(contract = ActivityResultContracts.OpenDocument()) { instrumentalTrackUri.value = it }

    Scaffold(
        topBar = { TopAppBar(title = { Text(text = stringResource(id = R.string.app_name)) }) }
    ) {
        Column(
            modifier = Modifier.padding(it),
            verticalArrangement = Arrangement.spacedBy(5.dp)
        ) {

            Button(
                onClick = { normalTrackFilePicker.launch(arrayOf("audio/*")) }
            ) { Text(text = normalTrackUri.value?.toString() ?: "通常版の選択") }

            Button(
                onClick = { instrumentalTrackFilePicker.launch(arrayOf("audio/*")) }
            ) { Text(text = instrumentalTrackUri.value?.toString() ?: "カラオケ版の選択") }
        }
    }
}
```

ファイルピッカーの返り値は`Uri`で、**これはファイルパスではないです。**  
もちろんちゃんと`Uri`からデータを取り出したり、書き込んだりする方法があります（`InputStream / OutputStream`が開けます）。  

はぁ～？？？って感じですよね、、、なんでだよファイルパスよこせよって話ですが、この方法だとファイルパスを持たないアプリからデータを受け取れるんですよね。  
つまりどういうことかというと、`Google ドライブ`や`Google フォト`などの、端末内には無いファイルもファイルピッカーで選択することができます。（端末内に無いのでファイルパスを持ってません...）  
（もちろん、上記のアプリから端末外にあるファイルを選んだ場合、一時的には端末内にダウンロードされるとは思いますが）

あと`Uri`はプロセスが生きている間（アプリが動いている間）のみ有効みたいな話だったはず、、、ちょっと思い出せない  

選んだら`normalTrackUri / instrumentalTrackUri`にそれぞれ入れます。

![Imgur](https://i.imgur.com/91Z4HfD.png)

## 実行ボタンともろもろを書く

まずは UI に状態を通知するため、状態一覧を書きます。  
`WWDC 2023`で久しぶりに出た`One more thing...`、`iPhone X`の発表以来使ってないんじゃないと思って調べたら`Apple Silicon`で使ったのか

```kotlin
private enum class ProgressStatus {
    /** 実行可能 */
    IDLE,

    /** デコード中 */
    DECODE,

    /** 音声の加工中 */
    EDIT,

    /** エンコード中 */
    ENCODE,

    /** あとしまつ */
    ONE_MORE_THING
}
```

そして実行ボタンを設置しました、`HomeScreen`だけです以外は変えてないです。

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // 音声ファイルの Uri
    val normalTrackUri = remember { mutableStateOf<Uri?>(null) }
    val instrumentalTrackUri = remember { mutableStateOf<Uri?>(null) }

    // ファイルピッカー
    val normalTrackFilePicker = rememberLauncherForActivityResult(contract = ActivityResultContracts.OpenDocument()) { normalTrackUri.value = it }
    val instrumentalTrackFilePicker = rememberLauncherForActivityResult(contract = ActivityResultContracts.OpenDocument()) { instrumentalTrackUri.value = it }
    
    val progressStatus = remember { mutableStateOf(ProgressStatus.IDLE) }
    
    // 処理内容
    fun start() {
        // TODO このあとすぐ！
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text(text = stringResource(id = R.string.app_name)) }) }
    ) {
        Column(
            modifier = Modifier.padding(it),
            verticalArrangement = Arrangement.spacedBy(5.dp)
        ) {

            Button(
                onClick = { normalTrackFilePicker.launch(arrayOf("audio/*")) }
            ) { Text(text = normalTrackUri.value?.toString() ?: "通常版の選択") }

            Button(
                onClick = { instrumentalTrackFilePicker.launch(arrayOf("audio/*")) }
            ) { Text(text = instrumentalTrackUri.value?.toString() ?: "カラオケ版の選択") }

            // 実行中は実行ボタンを出さない
            if (progressStatus.value == ProgressStatus.IDLE) {
                Button(
                    onClick = { start() }
                ) { Text(text = "処理を始める") }
            } else {
                CircularProgressIndicator()
                Text(text = "処理中です：${progressStatus.value}")
            }
        }
    }
}
```

## 音声を編集する処理を書く
`MediaCodec`とかのくせ者をここから使っていくわけですが...  
今回は前私が書いたやつがあるのでそれをパクることにします。ありがとう過去の私

https://github.com/takusan23/AkariDroid/tree/master/akari-core/src/main/java/io/github/takusan23/akaricore/common

## AudioEncoder / AudioDecoder
以下のクラスを作ってください...  

やってることは
- `MediaCodec`を初期化する
    - ビットレートとかコーデックとか入れる
- 終わりまでデータを`MediaCodec`に流す
    - 圧縮したデータ or 未圧縮データ が出てくる

```kotlin
/**
 * 音声エンコーダー
 * MediaCodecを使いやすくしただけ
 *
 * 生（意味深）の音声（PCM）送られてくるので、 AAC / Opus にエンコードして圧縮する。
 */
class AudioEncoder {

    /** MediaCodec エンコーダー */
    private var mediaCodec: MediaCodec? = null

    /**
     * エンコーダーを初期化する
     *
     * @param codec コーデック。[MediaFormat.MIMETYPE_AUDIO_AAC]など
     * @param sampleRate サンプリングレート
     * @param channelCount チャンネル数
     * @param bitRate ビットレート
     * @param
     */
    fun prepareEncoder(
        codec: String = MediaFormat.MIMETYPE_AUDIO_AAC,
        sampleRate: Int = 44_100,
        channelCount: Int = 2,
        bitRate: Int = 192_000,
    ) {
        val audioEncodeFormat = MediaFormat.createAudioFormat(codec, sampleRate, channelCount).apply {
            setInteger(MediaFormat.KEY_AAC_PROFILE, MediaCodecInfo.CodecProfileLevel.AACObjectLC)
            setInteger(MediaFormat.KEY_BIT_RATE, bitRate)
        }
        // エンコーダー用意
        mediaCodec = MediaCodec.createEncoderByType(codec).apply {
            configure(audioEncodeFormat, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        }
    }

    /**
     * エンコーダーを開始する。同期モードを使うのでコルーチンを使います（スレッドでも良いけど）
     *
     * @param onRecordInput ByteArrayを渡すので、音声データを入れて、サイズを返してください
     * @param onOutputBufferAvailable エンコードされたデータが流れてきます
     * @param onOutputFormatAvailable エンコード後のMediaFormatが入手できる
     */
    suspend fun startAudioEncode(
        onRecordInput: suspend (ByteArray) -> Int,
        onOutputBufferAvailable: suspend (ByteBuffer, MediaCodec.BufferInfo) -> Unit,
        onOutputFormatAvailable: suspend (MediaFormat) -> Unit,
    ) = withContext(Dispatchers.Default) {
        val bufferInfo = MediaCodec.BufferInfo()
        mediaCodec!!.start()

        try {
            while (isActive) {
                // もし -1 が返ってくれば configure() が間違ってる
                val inputBufferId = mediaCodec!!.dequeueInputBuffer(TIMEOUT_US)
                if (inputBufferId >= 0) {
                    // AudioRecodeのデータをこの中に入れる
                    val inputBuffer = mediaCodec!!.getInputBuffer(inputBufferId)!!
                    val capacity = inputBuffer.capacity()
                    // サイズに合わせて作成
                    val byteArray = ByteArray(capacity)
                    // byteArrayへデータを入れてもらう
                    val readByteSize = onRecordInput(byteArray)
                    if (readByteSize > 0) {
                        // 書き込む。書き込んだデータは[onOutputBufferAvailable]で受け取れる
                        inputBuffer.put(byteArray, 0, readByteSize)
                        mediaCodec!!.queueInputBuffer(inputBufferId, 0, readByteSize, System.nanoTime() / 1000, 0)
                    } else {
                        // もうない！
                        break
                    }
                }
                // 出力
                val outputBufferId = mediaCodec!!.dequeueOutputBuffer(bufferInfo, TIMEOUT_US)
                if (outputBufferId >= 0) {
                    val outputBuffer = mediaCodec!!.getOutputBuffer(outputBufferId)!!
                    if (bufferInfo.size > 1) {
                        if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG == 0) {
                            // ファイルに書き込む...
                            onOutputBufferAvailable(outputBuffer, bufferInfo)
                        }
                    }
                    // 返却
                    mediaCodec!!.releaseOutputBuffer(outputBufferId, false)
                } else if (outputBufferId == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                    // MediaFormat、MediaMuxerに入れるときに使うやつ
                    // たぶんこっちのほうが先に呼ばれる
                    onOutputFormatAvailable(mediaCodec!!.outputFormat)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            // リソースを開放する
            try {
                mediaCodec?.stop()
                mediaCodec?.release()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    companion object {
        /** MediaCodec タイムアウト */
        private const val TIMEOUT_US = 10_000L
    }
}
```

```kotlin
/**
 * 音声エンコーダー
 * MediaCodecを使いやすくしただけ
 *
 * 生（意味深）の音声（PCM）送られてくるので、 AAC / Opus にエンコードして圧縮する。
 */
class AudioDecoder {
    /** MediaCodec デコーダー */
    private var mediaCodec: MediaCodec? = null

    /**
     * 初期化する
     * デコーダーならパラメーター持ってるはず...
     *
     * @param mediaFormat [android.media.MediaExtractor]から出てきたMediaFormat
     */
    fun prepareDecoder(mediaFormat: MediaFormat) {
        val mimeType = mediaFormat.getString(MediaFormat.KEY_MIME)!!
        mediaCodec = MediaCodec.createDecoderByType(mimeType).apply {
            configure(mediaFormat, null, null, 0)
        }
    }

    /**
     * デコーダーを開始する
     *
     * @param readSampleData ByteArrayを渡すので、音声データを入れて、サイズと再生時間（マイクロ秒）を返してください
     * @param onOutputBufferAvailable デコードされたデータが流れてきます
     */
    suspend fun startAudioDecode(
        readSampleData: (ByteBuffer) -> Pair<Int, Long>,
        onOutputBufferAvailable: (ByteArray) -> Unit,
    ) = withContext(Dispatchers.Default) {
        val bufferInfo = MediaCodec.BufferInfo()
        mediaCodec!!.start()

        try {
            while (isActive) {
                // もし -1 が返ってくれば configure() が間違ってる
                val inputBufferId = mediaCodec!!.dequeueInputBuffer(TIMEOUT_US)
                if (inputBufferId >= 0) {
                    // Extractorからデータを読みだす
                    val inputBuffer = mediaCodec!!.getInputBuffer(inputBufferId)!!
                    // 書き込む。書き込んだデータは[onOutputBufferAvailable]で受け取れる
                    val (size, presentationTime) = readSampleData(inputBuffer)
                    if (size > 0) {
                        mediaCodec!!.queueInputBuffer(inputBufferId, 0, size, presentationTime, 0)
                    } else {
                        // データなくなった場合は終了フラグを立てる
                        mediaCodec!!.queueInputBuffer(inputBufferId, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
                        // おわり
                        break
                    }
                }
                // 出力
                val outputBufferId = mediaCodec!!.dequeueOutputBuffer(bufferInfo, TIMEOUT_US)
                if (outputBufferId >= 0) {
                    // デコード結果をもらう
                    val outputBuffer = mediaCodec!!.getOutputBuffer(outputBufferId)!!
                    val outData = ByteArray(bufferInfo.size)
                    outputBuffer.get(outData)
                    onOutputBufferAvailable(outData)
                    // 返却
                    mediaCodec!!.releaseOutputBuffer(outputBufferId, false)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            // リソースを開放する
            try {
                mediaCodec?.stop()
                mediaCodec?.release()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    companion object {

        /** MediaCodec タイムアウト */
        private const val TIMEOUT_US = 10_000L
    }
}
```

## 音声ファイルをデコードして、一時的にファイルに書き込む
`aac`や`flac`はエンコードされている（圧縮されている）ので、まずはデコードして未圧縮状態のデータに戻す必要があると言いました、それをします。  
で出来た、未圧縮状態のデータをファイルに書き込みます。  

雑にコメントに書いたので何してるか見たい方はどうぞ。  
一点、`Uri`からデータを取り出すのに`InputStream`みたいなのを使おうとしたんですけど、それ自体は渡せなさそうで、`FileDescriptor`とかいうやつを経由してデータを取り出すようにするようにしました。よく分かりません

あ！、もう一点、  
出力先ファイルが`File クラス`になってたりしますが、これはこの下のどっかで話すと思う

```kotlin
/** ボーカルだけ取り出す処理を行う */
object VocalOnlyProcessor {

    /**
     * 音声ファイルをデコードする
     *
     * @param fileDescriptor [android.content.ContentResolver.openFileDescriptor]
     * @param outputFile 出力先ファイル
     */
    suspend fun decode(
        fileDescriptor: FileDescriptor,
        outputFile: File
    ) = withContext(Dispatchers.Default) {
        // コンテナフォーマットからデータを取り出すやつ
        val extractor = MediaExtractor().apply {
            setDataSource(fileDescriptor)
        }
        // 音声トラックを見つける
        // 音声ファイルなら、音声トラックしか無いはずなので、0 決め打ちでも良さそう
        val audioTrackIndex = (0 until extractor.trackCount)
            .first { extractor.getTrackFormat(it).getString(MediaFormat.KEY_MIME)?.startsWith("audio/") == true }
        // デコーダーにメタデータを渡す
        val audioDecoder = AudioDecoder().apply {
            prepareDecoder(extractor.getTrackFormat(audioTrackIndex))
        }
        extractor.selectTrack(audioTrackIndex)
        // ファイルに書き込む準備
        outputFile.outputStream().use { outputStream ->
            // デコードする
            audioDecoder.startAudioDecode(
                readSampleData = { byteBuffer ->
                    // データを進める
                    val size = extractor.readSampleData(byteBuffer, 0)
                    extractor.advance()
                    size to extractor.sampleTime
                },
                onOutputBufferAvailable = { bytes ->
                    // データを書き込む
                    outputStream.write(bytes)
                }
            )
        }
    }
}
```

## 通常版とカラオケ版を使って、ボーカルだけを取り出す処理
冒頭に言った通り、未圧縮状態のデータなので、足し算・引き算が出来ます。  
未圧縮状態のデータのバイト配列の同じ位置同士を足したり引いたりすれば良いはずです...！

`readNBytes`とかいう、指定サイズの`ByteArray`を作って読み出して返してくれるやつがあるんですけど、古い`Android`をターゲットにするなら使えなさそう...
https://developer.android.com/reference/java/io/InputStream#readNBytes(int)

流石に3つも`use { }`すると分かりにくい気がしてきた...でも自動で閉じてくれるの便利なんだよな

```kotlin
/**
 * 通常版からカラオケ版を引いてボーカルだけ取り出す
 *
 * @param normalTrackFile 通常版のデコード済みデータ
 * @param instrumentalTrackFile カラオケ版のデコード済みデータ
 * @param resultFile 保存先
 */
suspend fun extract(
    normalTrackFile: File,
    instrumentalTrackFile: File,
    resultFile: File
) = withContext(Dispatchers.IO) {
    resultFile.outputStream().use { resultOutputStream ->
        normalTrackFile.inputStream().use { normalTrackInputStream ->
            instrumentalTrackFile.inputStream().use { instrumentalTrackInputStream ->
                // データが無くなるまで
                while (isActive) {
                    // ちょっとずつ取り出して、音の加工をしていく
                    // 一気に読み取るのは多分無理
                    val normalTrackByteArray = ByteArray(BYTE_ARRAY_SIZE).also { byteArray -> normalTrackInputStream.read(byteArray) }
                    val instrumentalTrackByteArray = ByteArray(BYTE_ARRAY_SIZE).also { byteArray -> instrumentalTrackInputStream.read(byteArray) }
                    
                    // 通常版からカラオケ版を引く処理
                    val size = max(normalTrackByteArray.size, instrumentalTrackByteArray.size)
                    val vocalOnlyByteArray = (0 until size)
                        .map { index -> (normalTrackByteArray[index] - instrumentalTrackByteArray[index]).toByte() }
                        .toByteArray()

                    // ファイルに書き込む
                    resultOutputStream.write(vocalOnlyByteArray)
                    // どちらかのファイルが読み込み終わったら、無限ループを抜ける
                    if (normalTrackInputStream.available() == 0 || instrumentalTrackInputStream.available() == 0) {
                        break
                    }
                }
            }
        }
    }
}

private const val BYTE_ARRAY_SIZE = 8192
```

## エンコードする処理
はい。こっちもコメントに書いたので見てね  
`MediaMuxer`を開始するには、`MediaCodec`を開始した後に取得できる`MediaFormat`を待つ必要があります...

```kotlin
/**
 * エンコードする
 * 
 * @param rawFile 圧縮していないデータ
 * @param resultFile エンコードしたデータ
 */
suspend fun encode(
    rawFile: File,
    resultFile: File
) = withContext(Dispatchers.Default) {
    // エンコーダーを初期化
    val audioEncoder = AudioEncoder().apply {
        prepareEncoder(
            codec = MediaFormat.MIMETYPE_AUDIO_AAC,
            sampleRate = 44_100,
            channelCount = 2,
            bitRate = 192_000
        )
    }
    // コンテナフォーマットに保存していくやつ
    val mediaMuxer = MediaMuxer(resultFile.path, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
    var trackIndex = -1
    rawFile.inputStream().use { inputStream ->
        audioEncoder.startAudioEncode(
            onRecordInput = { bytes ->
                // データをエンコーダーに渡す
                inputStream.read(bytes)
            },
            onOutputBufferAvailable = { byteBuffer, bufferInfo ->
                // 無いと思うけど MediaMuxer が開始していなければ追加しない
                if (trackIndex != -1) {
                    mediaMuxer.writeSampleData(trackIndex, byteBuffer, bufferInfo)
                }
            },
            onOutputFormatAvailable = {
                // フォーマットが確定したら MediaMuxer を開始する
                trackIndex = mediaMuxer.addTrack(it)
                mediaMuxer.start()
            }
        )
    }
    mediaMuxer.stop()
}
```

## 出来た音声ファイルを端末の音楽フォルダに移動させる
最後！  
完成品したファイルを端末の音声フォルダに移動する処理を書きます！  
というのも、作業のためにすべてのファイルを`Context#getExternalFilesDir`で返される保存先に書き込んでいたわけですが、（`Java`の`File`クラスが使えるので一時的にフォルダ作るのに良い）  
この保存先というのはアプリ固有ストレージとか言われていて、他のアプリからアクセスできないんですよね...  
（ちなみに`sdcard/Android/data/{applicationId}`みたいな保存先パスになるはず）

というわけで、`MediaStore (ContentResolver ?)`に音楽データ追加を依頼して、そっちにデータを移動させます！  
これで他のアプリから参照できるはずです！！！

`new File("sdcard/Music/VocalOnly")`みたいなコードは動かないので、大人しくドキュメントどおりにしましょう...  
https://developer.android.com/training/data-storage/shared/media

```kotlin
/**
 * 音楽ファイルを端末の音声フォルダにコピーする
 *
 * @param context [Context]
 * @param fileName ファイル名
 * @param targetFile 音楽ファイル
 */
suspend fun copyToAudioFolder(
    context: Context,
    fileName: String,
    targetFile: File
) = withContext(Dispatchers.IO) {
    val contentResolver = context.contentResolver
    // 名前とか
    val contentValues = contentValuesOf(
        MediaStore.Audio.Media.DISPLAY_NAME to fileName,
        // ディレクトリを掘る場合
        MediaStore.Audio.Media.RELATIVE_PATH to "${Environment.DIRECTORY_MUSIC}/VocalOnlyTrack"
    )
    // 追加する
    val uri = contentResolver.insert(
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL) else MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
        contentValues
    ) ?: return@withContext
    // ファイルをコピーする
    targetFile.inputStream().use { inputStream ->
        contentResolver.openOutputStream(uri)?.use { outputStream ->
            // Kotlin 拡張関数でコピー 一発
            inputStream.copyTo(outputStream)
        }
    }
}

/**
 * Uri からファイル名をクエリする
 * 
 * @param uri [Uri]
 * @param context [Context]
 * @return ファイル名
 */
suspend fun getFileNameFromUri(
    context: Context,
    uri: Uri
) = withContext(Dispatchers.IO) {
    // DISPLAY_NAME を SELECT する
    context.contentResolver.query(uri, arrayOf(MediaStore.Audio.Media.DISPLAY_NAME), null, null, null)?.use { cursor ->
        // DB の先頭に移動して、
        cursor.moveToFirst()
        cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DISPLAY_NAME))
    }
}
```

## ここまでのコード

つぎはこれらをUIから呼び出していきます...

```kotlin
/** ボーカルだけ取り出す処理を行う */
/** ボーカルだけ取り出す処理を行う */
object VocalOnlyProcessor {

    /**
     * 音声ファイルをデコードする
     *
     * @param fileDescriptor [android.content.ContentResolver.openFileDescriptor]
     * @param outputFile 出力先ファイル
     */
    suspend fun decode(
        fileDescriptor: FileDescriptor,
        outputFile: File
    ) = withContext(Dispatchers.Default) {
        // コンテナフォーマットからデータを取り出すやつ
        val extractor = MediaExtractor().apply {
            setDataSource(fileDescriptor)
        }
        // 音声トラックを見つける
        // 音声ファイルなら、音声トラックしか無いはずなので、0 決め打ちでも良さそう
        val audioTrackIndex = (0 until extractor.trackCount)
            .first { extractor.getTrackFormat(it).getString(MediaFormat.KEY_MIME)?.startsWith("audio/") == true }
        // デコーダーにメタデータを渡す
        val audioDecoder = AudioDecoder().apply {
            prepareDecoder(extractor.getTrackFormat(audioTrackIndex))
        }
        extractor.selectTrack(audioTrackIndex)
        // ファイルに書き込む準備
        outputFile.outputStream().use { outputStream ->
            // デコードする
            audioDecoder.startAudioDecode(
                readSampleData = { byteBuffer ->
                    // データを進める
                    val size = extractor.readSampleData(byteBuffer, 0)
                    extractor.advance()
                    size to extractor.sampleTime
                },
                onOutputBufferAvailable = { bytes ->
                    // データを書き込む
                    outputStream.write(bytes)
                }
            )
        }
    }

    /**
     * 通常版からカラオケ版を引いてボーカルだけ取り出す
     *
     * @param normalTrackFile 通常版のデコード済みデータ
     * @param instrumentalTrackFile カラオケ版のデコード済みデータ
     * @param resultFile 保存先
     */
    suspend fun extract(
        normalTrackFile: File,
        instrumentalTrackFile: File,
        resultFile: File
    ) = withContext(Dispatchers.IO) {
        resultFile.outputStream().use { resultOutputStream ->
            normalTrackFile.inputStream().use { normalTrackInputStream ->
                instrumentalTrackFile.inputStream().use { instrumentalTrackInputStream ->
                    // データが無くなるまで
                    while (isActive) {
                        // ちょっとずつ取り出して、音の加工をしていく
                        // 一気に読み取るのは多分無理
                        val normalTrackByteArray = ByteArray(BYTE_ARRAY_SIZE).also { byteArray -> normalTrackInputStream.read(byteArray) }
                        val instrumentalTrackByteArray = ByteArray(BYTE_ARRAY_SIZE).also { byteArray -> instrumentalTrackInputStream.read(byteArray) }

                        // 通常版からカラオケ版を引く処理
                        val size = max(normalTrackByteArray.size, instrumentalTrackByteArray.size)
                        val vocalOnlyByteArray = (0 until size)
                            .map { index -> (normalTrackByteArray[index] - instrumentalTrackByteArray[index]).toByte() }
                            .toByteArray()
                        // ファイルに書き込む
                        resultOutputStream.write(vocalOnlyByteArray)

                        // どちらかのファイルが読み込み終わったら、無限ループを抜ける
                        if (normalTrackInputStream.available() == 0 || instrumentalTrackInputStream.available() == 0) {
                            break
                        }
                    }
                }
            }
        }
    }

    /**
     * エンコードする
     *
     * @param rawFile 圧縮していないデータ
     * @param resultFile エンコードしたデータ
     */
    suspend fun encode(
        rawFile: File,
        resultFile: File
    ) = withContext(Dispatchers.Default) {
        // エンコーダーを初期化
        val audioEncoder = AudioEncoder().apply {
            prepareEncoder(
                codec = MediaFormat.MIMETYPE_AUDIO_AAC,
                sampleRate = 44_100,
                channelCount = 2,
                bitRate = 192_000
            )
        }
        // コンテナフォーマットに保存していくやつ
        val mediaMuxer = MediaMuxer(resultFile.path, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
        var trackIndex = -1
        rawFile.inputStream().use { inputStream ->
            audioEncoder.startAudioEncode(
                onRecordInput = { bytes ->
                    // データをエンコーダーに渡す
                    inputStream.read(bytes)
                },
                onOutputBufferAvailable = { byteBuffer, bufferInfo ->
                    // 無いと思うけど MediaMuxer が開始していなければ追加しない
                    if (trackIndex != -1) {
                        mediaMuxer.writeSampleData(trackIndex, byteBuffer, bufferInfo)
                    }
                },
                onOutputFormatAvailable = {
                    // フォーマットが確定したら MediaMuxer を開始する
                    trackIndex = mediaMuxer.addTrack(it)
                    mediaMuxer.start()
                }
            )
        }
        mediaMuxer.stop()
    }

    /**
     * 音楽ファイルを端末の音声フォルダにコピーする
     *
     * @param context [Context]
     * @param fileName ファイル名
     * @param targetFile 音楽ファイル
     */
    suspend fun copyToAudioFolder(
        context: Context,
        fileName: String,
        targetFile: File
    ) = withContext(Dispatchers.IO) {
        val contentResolver = context.contentResolver
        // 名前とか
        val contentValues = contentValuesOf(
            MediaStore.Audio.Media.DISPLAY_NAME to fileName,
            // ディレクトリを掘る場合
            MediaStore.Audio.Media.RELATIVE_PATH to "${Environment.DIRECTORY_MUSIC}/VocalOnlyTrack"
        )
        // 追加する
        val uri = contentResolver.insert(
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL) else MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
            contentValues
        ) ?: return@withContext
        // ファイルをコピーする
        targetFile.inputStream().use { inputStream ->
            contentResolver.openOutputStream(uri)?.use { outputStream ->
                // Kotlin 拡張関数でコピー 一発
                inputStream.copyTo(outputStream)
            }
        }
    }

    /**
     * Uri からファイル名をクエリする
     *
     * @param uri [Uri]
     * @param context [Context]
     * @return ファイル名
     */
    suspend fun getFileNameFromUri(
        context: Context,
        uri: Uri
    ) = withContext(Dispatchers.IO) {
        // DISPLAY_NAME を SELECT する
        context.contentResolver.query(uri, arrayOf(MediaStore.Audio.Media.DISPLAY_NAME), null, null, null)?.use { cursor ->
            // DB の先頭に移動して、
            cursor.moveToFirst()
            cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DISPLAY_NAME))
        }
    }

    private const val BYTE_ARRAY_SIZE = 8192

}
```

## つなぎ合わせる
`UI`からさっき作った関数を呼び出していきます。  
本当は`UI`ではなく、`フォアグラウンドサービス`なんかで`Activity`を破棄した後でも動くようにすべきです  

というわけで UI のコード全部張ります！どーーーん

やってることはコメントに書いてるので見てください（全投げ

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            VocalOnlyDroidTheme {
                HomeScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // 音声ファイルの Uri
    val normalTrackUri = remember { mutableStateOf<Uri?>(null) }
    val instrumentalTrackUri = remember { mutableStateOf<Uri?>(null) }

    // ファイルピッカー
    val normalTrackFilePicker = rememberLauncherForActivityResult(contract = ActivityResultContracts.OpenDocument()) { normalTrackUri.value = it }
    val instrumentalTrackFilePicker = rememberLauncherForActivityResult(contract = ActivityResultContracts.OpenDocument()) { instrumentalTrackUri.value = it }

    val progressStatus = remember { mutableStateOf(ProgressStatus.IDLE) }

    // 処理内容
    fun start() {
        scope.launch(Dispatchers.Default) {

            // 作業用の仮フォルダを作る
            val tempFolder = context.getExternalFilesDir(null)?.resolve("temp_work")!!.apply {
                mkdir()
            }

            // 音声ファイルをデコードする
            progressStatus.value = ProgressStatus.DECODE
            val (normalRawFile, instrumentalRawFile) = listOf(normalTrackUri.value!!, instrumentalTrackUri.value!!)
                .mapIndexed { index, uri ->
                    // 並列でデコードしてファイルを返す
                    async {
                        context.contentResolver.openFileDescriptor(uri, "r")!!.use {
                            val rawFile = File(tempFolder, "audio_$index.raw").apply { createNewFile() }
                            VocalOnlyProcessor.decode(
                                fileDescriptor = it.fileDescriptor,
                                outputFile = rawFile
                            )
                            return@use rawFile
                        }
                    }
                }
                // 並列で実行した処理を待ち合わせる
                .map { it.await() }

            // ボーカルだけ取り出す
            progressStatus.value = ProgressStatus.EDIT
            val vocalRawFile = tempFolder.resolve("audio_vocal.raw").apply { createNewFile() }
            VocalOnlyProcessor.extract(
                normalTrackFile = normalRawFile,
                instrumentalTrackFile = instrumentalRawFile,
                resultFile = vocalRawFile
            )

            // 生データをエンコードする
            progressStatus.value = ProgressStatus.ENCODE
            val encodeVocalFile = tempFolder.resolve("audio_vocal.aac").apply { createNewFile() }
            VocalOnlyProcessor.encode(
                rawFile = vocalRawFile,
                resultFile = encodeVocalFile
            )

            // ファイルを音楽フォルダにコピーする
            progressStatus.value = ProgressStatus.ONE_MORE_THING
            val fileName = VocalOnlyProcessor.getFileNameFromUri(context, normalTrackUri.value!!)!!
            VocalOnlyProcessor.copyToAudioFolder(
                context = context,
                fileName = "$fileName.aac",
                targetFile = encodeVocalFile
            )

            // 後始末
            tempFolder.deleteRecursively()
            progressStatus.value = ProgressStatus.IDLE
        }
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text(text = stringResource(id = R.string.app_name)) }) }
    ) {
        Column(
            modifier = Modifier.padding(it),
            verticalArrangement = Arrangement.spacedBy(5.dp)
        ) {

            Button(
                onClick = { normalTrackFilePicker.launch(arrayOf("audio/*")) }
            ) { Text(text = normalTrackUri.value?.toString() ?: "通常版の選択") }

            Button(
                onClick = { instrumentalTrackFilePicker.launch(arrayOf("audio/*")) }
            ) { Text(text = instrumentalTrackUri.value?.toString() ?: "カラオケ版の選択") }

            // 実行中は実行ボタンを出さない
            if (progressStatus.value == ProgressStatus.IDLE) {
                Button(
                    onClick = { start() }
                ) { Text(text = "処理を始める") }
            } else {
                CircularProgressIndicator()
                Text(text = "処理中です：${progressStatus.value}")
            }
        }
    }
}

private enum class ProgressStatus {
    /** 実行可能 */
    IDLE,

    /** デコード中 */
    DECODE,

    /** 音声の加工中 */
    EDIT,

    /** エンコード中 */
    ENCODE,

    /** あとしまつ */
    ONE_MORE_THING
}
```

# 使ってみた
多分実行できるはず。  
起動したらそれぞれファイルを選んで処理を開始します

![Imgur](https://i.imgur.com/9A2ASVs.png)

![Imgur](https://i.imgur.com/HRmVKQ8.png)

保存先はここになります！！

![Imgur](https://i.imgur.com/gRoaKrP.png)

# 感想

- うまくボーカルだけ取れる パターン
- 若干ボーカル以外も入ってる パターン
- 失敗しちゃう パターン（音割れ）

いくつか試しましたが結構な確率で失敗しちゃいますね。  
原因はおそらく、音声の波が通常版とカラオケ版で若干ずれてることがあるんですよね、、、（オフセットがある？）  
`Audacity`で逆位相にして同時再生する方法でも、まずは波を合わせる作業をする必要がある場合がが多く、  
今回のようにそのままカラオケ版トラックを逆位相にして（通常版から引き算して）同時再生してもうまく抜けません。

なかなか難しい...うまく抜けるとほんとにボーカルしか聞こえなくて感動ものなのですが...

# そーすこーど
どうぞ  
最新の Android Studio で実行できるはずです。

https://github.com/takusan23/VocalOnlyDroid

# おわりに
8月も終わりますね...

全然話変わるんだけど、三井住友銀行さんさあ...メール普通にビビるからやめてほしい

![Imgur](https://i.imgur.com/eWb136O.png)

展開するとちゃんとウソであることが書いてある

![Imgur](https://i.imgur.com/GGsYLqt.png)