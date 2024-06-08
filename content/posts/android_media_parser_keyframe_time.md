---
title: Android で動画のキーフレームの位置を取得したい
created_at: 2024-06-09
tags:
- Android
- Kotlin
- MediaCodec
- MediaParser
---
どうもこんばんわ。

最近は`Pixel Watch`を付けて寝てますが、これなら起きられそうです。  
ぶるぶる震えてくれる。

# 本題
前作った、この動画から`Bitmap`を高速に取り出すあれ、連続で取得しない場合にめちゃくちゃ遅いので、改善しようと思います。  

https://takusan.negitoro.dev/posts/android_get_video_frame_mediacodec/

ランダムアクセスというんでしょうか、最初から順番に見ていく分には速いんですけどね。。

# どういうこと
シークがめちゃくちゃ遅い。遅すぎ  
原因というか、一番時間かかってるのが、この動画から`Bitmap`を取り出す作業です、記事を書いた時点（修正前）で数秒かかります。  

<video src="https://github.com/takusan23/AndroidMediaParserKeyFrameListSample/assets/32033405/586cc173-0fec-428b-aeae-e4b1d7316de6" width="300" controls></video>

これを改善したのがこれ。**確かに速いはずなんですが、なんか分かりにくくて草。**  
今回は改善するために必要な、キーフレームの位置を取得するお話です。

<video src="https://github.com/takusan23/AndroidMediaParserKeyFrameListSample/assets/32033405/09d8a947-dba0-45a7-a7f7-afa753f6527e" width="300" controls></video>

# シークは難しい
そもそも、指定した時間の動画のフレーム取得が難しくて、  
1 の場所のフレームが欲しい場合、一番近い 2 のキーフレームまで戻らないといけないんですよね。  
1 の場所のフレームは不完全なフレームでキーフレームから変化している箇所のみが記録されているため、完全なフレームにするためには一番近いキーフレーム（2 の地点）まで戻り、 1 の位置まで待つ必要があります。

![Imgur](https://imgur.com/mrJU171.png)

すべてがキーフレームなら戻る必要なく最高なのですが、すべてキーフレームにすると動画サイズがべらぼうに大きくなってしまいます。ので定期的にキーフレームを入れるようにしたらしい。  

もちろんすべてキーフレームな動画ファイルもあります。`Apple ProRes`とかいうやつですね。  
すべてのフレームがキーフレームなのでくっそ容量がでかいと思う。が、代わりに先述の理由によりどの位置にシークしようとキーフレームしか無いので最速。

# シークが遅い理由
で、この自前で作った動画フレームを`Bitmap`にしてくれるやつ、実は連続アクセス前提で作ったので、動画編集中とかは向いてないんですね。  
現状は、欲しい時間のフレームが来る前に、キーフレームが来た場合のみシークをしています。  

![Imgur](https://imgur.com/8f8sifW.png)

（つまり、いま`1`の位置にいて、`4`のフレームが欲しい場合でも、まず`2`のキーフレームまでデコードが進み（無駄）、そこで`3`のキーフレームへシークする判断になる）

```plaintext
// 欲しいフレームが前回の呼び出しと連続していないときの処理。
// Android 10 以前はここでシークの判断をします。Android 11 以降は MediaParserKeyFrameTimeDetector でシークの判断をします。
// 例えば、前回の取得位置よりもさらに数秒以上先にシークした場合、指定位置になるまで待ってたら遅くなるので、数秒先にあるキーフレームまでシークする
// で、このシークが必要かどうかの判定がこれ。数秒先をリクエストした結果、欲しいフレームが来るよりも先にキーフレームが来てしまった
// この場合は一気にシーク位置に一番近いキーフレームまで進める
```

https://github.com/takusan23/AkariDroid/blob/master/akari-core/src/main/java/io/github/takusan23/akaricore/video/VideoFrameBitmapExtractor.kt

キーフレームが来るまでは、欲しいフレームが連続したフレームの可能性があるのでシークしない。これにより連続アクセスは速いですが、シークがとてもおそい。  
シークする際に、連続したフレームじゃないよ！ってフラグを渡してあげればいいのですが、うーん。

# シークの判断を早くする
これはシークするかの判断に、次のキーフレームが来るまで待っているのが悪い。  
キーフレームが来る前にシークすれば速い。。。のですが、`Android`の`MediaExtractor（コンテナフォーマットからデータを取り出すやつ）`に、キーフレームがどこに入っているかを問い合わせる`API`がない。  
さっきの図を使いまわしますが、このキーフレームの再生位置を取得する方法があればいいんですけど、、、

![Imgur](https://imgur.com/8f8sifW.png)

# MediaParser クラス
ありました！！！！  
コンテナフォーマットからキーフレームの時間を取り出すやつ！！！。これで即時シークが必要かの判定ができます！やっと本題です。

https://developer.android.com/reference/android/media/MediaParser  

本来は`MediaExtractor`の代替らしいですが、`Android 11`以降じゃないと使えないので、引き続き`MediaExtractor`は必要かな。  

で、今回の記事は`MediaParser`を使って動画のキーフレームの位置を取得してみようという話です。  
前フリが長すぎた。

# 環境
`MediaCodec`タグつけたけど今回は出てきません。（？？？）

| なまえ         | あたい                                    |
|----------------|-------------------------------------------|
| 端末           | Pixel 8 Pro                               |
| Android Studio | Android Studio Jellyfish 2023.3.1 Patch 1 |

## 適当に UI を作る
動画ファイルを選ぶボタンと、キーフレーム一覧を出すためのリストを。  
`Scaffold`とかは別に関係ないので、ボタンとテキストを表示するリストがあればいいんじゃないでしょうか。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidMediaParserKeyFrameListSampleTheme {
                MainScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val seekPositionList = remember { mutableStateOf(listOf<Long>()) }

    fun start(uri: Uri?) {
        // TODO この後すぐ
    }

    val filePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri -> start(uri) }
    )

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = { TopAppBar(title = { Text(text = stringResource(id = R.string.app_name)) }) }
    ) { innerPadding ->

        Column(Modifier.padding(innerPadding)) {

            Button(onClick = { filePicker.launch(PickVisualMediaRequest(mediaType = ActivityResultContracts.PickVisualMedia.VideoOnly)) }) {
                Text(text = "動画の選択")
            }

            Text(text = "キーフレーム一覧")

            LazyColumn {
                items(seekPositionList.value) {
                    Text(text = "keyFrame = $it us")
                    HorizontalDivider()
                }
            }
        }
    }
}
```

## MediaParser を使う用意をする
というのも、`MediaParser`にデータを渡すための`SeekableInputReader（MediaParser.InputReader）`の実装がない。`Android`はインターフェースだけ作って実装はしていないらしい。  
ただ、`InputStream`っぽいインターフェースをしているので多分難しくない（`InputStream`に似せるなら用意してほしかった）。

`MediaParserKeyFrameDetector.kt`を適当に作りました。まずは`SeekableInputReader（MediaParser.InputReader）`の実装を。こんな感じですかね。  

一点、シークするメソッド`seekToPosition()`が厄介です。  
これは指定した位置に`InputStream`の読み取り位置をセットする実装を書けばいいのですが、`InputStream`の読み取り位置をセットするには`InputStream#mark()`と`InputStream#reset()`に対応していないといけないんですよね。  
で、で、で、動画を`PhotoPicker`で選んで、貰った`Uri`で作る`InputStream`は残念ながら、`mark()`と`reset()`出来ません。多分`InputStream`の作り直しを要します。  
というわけで、`private val onCreateInputStream: () -> InputStream`て感じで、`InputStream`を返す関数を引数に取るようにしました。作り直しが必要になったら`onCreateInputStream`が呼ばれる感じですね。

```kotlin
object MediaParserKeyFrameDetector {

    /** MediaParser.InputReader の InputStream 実装例 */
    class InputStreamSeekableInputReader(private val onCreateInputStream: () -> InputStream) : SeekableInputReader {

        /** InputStream。[seekToPosition]が呼び出された際には作り直す */
        private var currentInputStream = onCreateInputStream()

        /** read する前に available を呼ぶことでファイルの合計サイズを出す */
        private val fileSize = currentInputStream.available().toLong()

        override fun read(p0: ByteArray, p1: Int, p2: Int): Int = currentInputStream.read(p0, p1, p2)

        override fun getPosition(): Long = fileSize - currentInputStream.available()

        override fun getLength(): Long = fileSize

        override fun seekToPosition(p0: Long) {
            // ContentResolver#openInputStream だと mark/reset が使えない
            // InputStream を作り直す
            currentInputStream.close()
            currentInputStream = onCreateInputStream()
            currentInputStream.skip(p0)
        }

        /** InputStream を閉じる */
        fun close() {
            currentInputStream.close()
        }
    }

}
```

## MediaParser を使う

`MediaParser.OutputConsumer`をまず作ります。  
取り出したデータはこのコールバック関数で受け取る形です。

ただ、今回はキーフレームがとこにあるか以外のデータ（実際の映像データとか）には興味がないので、適当に捨てています。  
捨てている箇所が`onSampleDataFound`ですね。一応キーフレームの位置の情報さえ貰えれば終わりでいいので、`isFoundSeekMap`フラグを立てています。  

コメントを読んでもよく分からなかったので、サンプル通りにしてみました。  
`onSampleDataFound`で`InputReader#read`しないとなんかダメみたいです。先述の通り読み取った後のデータには興味がないので、適当に`tempByteArray`へ上書きさせています。

`MediaParser.create`の第2引数は可変長引数で、とりあえず有り得そうなコンテナフォーマットを指定しています。  
https://developer.android.com/reference/android/media/MediaParser#create(android.media.MediaParser.OutputConsumer,%20java.lang.String[])

あとはデータが無くなるか、`isFoundSeekMap`のフラグが立つまで`while`で`MediaParser#advance`を呼び続けます。  
`advance()`の中でよしなに`InputReader`の`read`とか、`seekToPosition`が呼び出されるわけですね。

最後、キーフレームの位置が分かったら問いただしています。  
キーフレームの位置が分かるというか、**時間を渡すとキーフレームの位置を返してくれる、の方が正しいですね**、~~適当に 1 秒間隔で問いただしています。~~  
~~流石にキーフレームが 1 秒未満の間隔に、、、ならないよね？~~  

1 秒間に複数のキーフレームがある動画があったため修正しました。そのため 1 ミリ秒間隔で問いただしています。  
ちなみに表示される時間の単位はマイクロ秒です。`1 秒 == 1_000 ミリ秒 == 1_000_000 マイクロ秒`

```kotlin
object MediaParserKeyFrameDetector {

    /** 解析して、キーフレームの位置を検出する */
    suspend fun detect(onCreateInputStream: () -> InputStream): List<Long> = withContext(Dispatchers.IO) {

        // MediaParser を作る
        var seekMap: MediaParser.SeekMap? = null
        // onSeekFound が来たら解析終わってほしいので
        var isFoundSeekMap = false
        // パース結果コールバック
        val output = object : MediaParser.OutputConsumer {

            // 中身には興味がないので適当に入れ物だけ用意
            private val tempByteArray = ByteArray(4096)

            override fun onSeekMapFound(p0: MediaParser.SeekMap) {
                // 解析してシークできる位置が分かった
                seekMap = p0
                isFoundSeekMap = true
            }

            override fun onTrackCountFound(p0: Int) {
                // do nothing
            }

            override fun onTrackDataFound(p0: Int, p1: MediaParser.TrackData) {
                // do nothing
            }

            override fun onSampleDataFound(p0: Int, p1: MediaParser.InputReader) {
                // SeekMap が欲しいだけなのだが、InputReader#read しないと MediaParser#advance で止まってしまうので
                // サンプル通りに InputReader#read している。
                // SeekMap が欲しいだけで中身には興味がないので tempByteArray に上書きしている
                val readSize = p1.length.toInt()
                p1.read(tempByteArray, 0, minOf(tempByteArray.size, readSize))
            }

            override fun onSampleCompleted(p0: Int, p1: Long, p2: Int, p3: Int, p4: Int, p5: MediaCodec.CryptoInfo?) {
                // do nothing
            }
        }
        // InputStream を MediaParser.InputReader で使う
        val input = InputStreamSeekableInputReader(onCreateInputStream)

        // MP4 と WebM のコンテナを解析する
        val mediaParser = MediaParser.create(output, MediaParser.PARSER_NAME_MP4, MediaParser.PARSER_NAME_MATROSKA)
        while (!isFoundSeekMap && mediaParser.advance(input)) {
            // SeekMap が取れるまで while 回す
        }

        mediaParser.release()
        input.close()

        // 流石にないはず
        seekMap ?: return@withContext emptyList()

        // SeekMap 取れたら、1 ミリ秒ごとにシークできる位置はどこかを問いただす
        return@withContext (0 until seekMap!!.durationMicros step 1_000) // マイクロ秒注意
            .map { timeUs -> seekMap!!.getSeekPoints(timeUs).component2() } // 次のシーク位置が欲しい
            .map { it.timeMicros }
            .distinct() // 同じ値（キーフレーム間隔が 1 秒以上なら同じ値が入ってくることある）
    }

    // 以下省略

}
```

## UI 側から読んで完成
はい！

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val seekPositionList = remember { mutableStateOf(listOf<Long>()) }

    fun start(uri: Uri?) {
        uri ?: return
        scope.launch {
            // キーフレームの位置を出す
            // 引数は InputStream を作る関数。必要になったら関数が呼ばれるので、InputStream を作って返してください。
            seekPositionList.value = MediaParserKeyFrameDetector.detect(onCreateInputStream = { context.contentResolver.openInputStream(uri)!! })
        }
    }

    val filePicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri -> start(uri) }
    )

    // 以下省略...
```

# 使ってみる
![Imgur](https://imgur.com/NT7aJaZ.png)

ほとんどの人からすれば、動画のキーフレームの位置なんて超絶どうでもいいと思うので、、、、はい。  
一応`ffprobe get keyframe position`とかで調べて出てきたコマンドを叩いた結果と、今作ったアプリで同じ時間が出てきたので、多分合ってる！

# ソースコード
https://github.com/takusan23/AndroidMediaParserKeyFrameListSample

以上です。おつかれさまでした。