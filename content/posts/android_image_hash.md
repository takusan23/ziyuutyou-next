---
title: Android で似ている画像を探す画像ハッシュを使ってみる
created_at: 2024-10-01
tags:
- Android
- Kotlin
---
どうもこんばんわ。セレクトオブリージュ 攻略しました。深夜販売で買ってきたげーむ。  

![Imgur](https://imgur.com/mTb9wBO.png)

くくるちゃん目的！！！だったけど  
会長さんルートも結構良かった。てか買うまで分からんかった・・って気持ちになった。

![Imgur](https://imgur.com/k0AqFDY.png)

そのうえ側近ちゃんがまたかわいい。うおおお  
ちびきゃらイベントCGがかわいかった。

![Imgur](https://imgur.com/ki4ZH7C.png)

！！！！！！？！？！！

![Imgur](https://imgur.com/Vhz2iNc.png)

これすち

![Imgur](https://imgur.com/eLhWofW.png)

妹ちゃんルートは別に妹ちゃんルートでやんなくても、、みたいなシナリオだったかな。  

![Imgur](https://imgur.com/ZBHncYK.png)

ぴしゃん・・・

![Imgur](https://imgur.com/A7kHXld.png)

！！！！！！  
くくるちゃんルートが一番良かった。です

![Imgur](https://imgur.com/y5b59LT.png)

食べキャラかわいいわね

![Imgur](https://imgur.com/xFUncUy.png)

![Imgur](https://imgur.com/OqA2Y0B.png)

これです。これこれ

![Imgur](https://imgur.com/OWEyi5m.png)

![Imgur](https://imgur.com/bukAJr3.png)

ぜひくくるちゃんルートを！

![Imgur](https://imgur.com/Cmc23bR.png)

# 本題
写真管理アプリによくある、 **似ている画像や重複している画像を消しますか？** ってやつ。あれってどうやって動いてるんだろう？。  
機械学習で頑張ってるのかなと思いきや、そこまでのことは必要ないらしく、世の中には画像向けのハッシュ値を求めるアルゴリズムがあるらしい。  

ハッシュと言えば、同一データかどうか、少しでも違えば全く違うハッシュを出す、そんなイメージですが、  
今回のはそういうのじゃなく、似ていれば似ているハッシュを出します。

# 画像のハッシュ
いくつかあり、簡単なやつなら私でも一から`Bitmap`をこねくり回して作れそう。

## aHash
`average hash`  
これは、画像を`8x8`の大きさに変更した後、モノクロ画像に変換し、ピクセルの色の平均を出します（画像の平均の色）。  
そのあと、モノクロ画像の各ピクセルに対してさっき出した平均と比較する。比較結果を何らかの方法で保存する。後述  

とか言ってもよく分からんと思うので`Figma`で書いてきました。  

![Imgur](https://imgur.com/Au1edd8.png)

## dHash
くわしくは  
https://www.hackerfactor.com/blog/index.php?/archives/529-Kind-of-Like-That.html

`difference hash`  
これは、画像を**9x8**の大きさに変更します。幅が`+1`多いですが後で分かります。そのあと、モノクロ画像に変換します。  
次に、差を求めます。`8x8`のピクセルに対して行います。この時、比較対象が**右隣のピクセルの色**になります。  
隣と比較するために`+1`多くしています。`x = 8`の比較も`+1`した`x = 9`と比べば良くなります。  
あとはこの比較結果を何らかの方法で保存すればいいです。後述

とか言ってもやっぱり分からんと思うので、これもついでに書いてきました。  

![Imgur](https://imgur.com/rrm8FdN.png)

## pHash
説明を読んだけど難しくて断念。知らない言葉だらけだ。。。

## 保存方法は？
比較した結果は、大きいか小さいかしか無いので、`0`と`1`で表現できます、はい、`2進数`。片手で31まで数えられるあれです。  
各ピクセルの比較結果は`8x8 = 64`なので、`64`個ビットを格納できる`long型（int64？）`にちょうど収めることが出来ます。  
いや、正しくは`Android (Java)`の場合、`Long`の最上位ビットは`正の数か負の数か`を表すために1ビット使われてしまうため、`64Bit`フルで使える`ULong`型を使う必要があります。多分。

どう並べるかは人それぞれだと思いますが、大抵は、左上（`x=0, y=0`）から始まり、一番左（`x=0, y=7`）まで来たら、1個下に下がって、左から右へ。  
ビッグエンディアンで入れていこうと思うので、2進数から見て一番左が `x=0, y=0`、一番右が `x=7, y=7` の比較結果になるようにしたいと思います。

![Imgur](https://imgur.com/2aNusa6.png)

まあ`long`に押し込めるという理由で`8x8`になっているはずで、押し込める理由がなければ`16x16`とかでもできると思います。  
でもビット演算がやりにくいと思うので`long`に押し込めておけばいいと思った。

## 比較方法は？
ハッシュを出すだけじゃなくて比較の話も。  
が、こちらは`XOR`して立っているビットの数を数えればいいはず？比較したい2つの`二進数`を`XOR`して、`0`と`1`が一致していない部分に`1`を立てます。  
真理値表の`01`の組み合わせのあの表のとおりですね。  

```plaintext
0b0000000000010000000100100001011000010110000101000000000000000000
0b0001000001011000000101000000100001001001011110010010100000000000
-----------------------------------------------------------------------
0b0001000001001000000001100001111001011111011011010010100000000000
```

あとは`1`の数を数えて、少なければ少ないほど一致していることになります。  
2進数の`1`を数える方法ですが`countOneBits()`があるのでそれを使えば良いはず？

# 作ってみる
`aHash`や`dHash`を計算する機能は用意されてないので、自分で作る必要があります。多分。でも解説した上２つはそんな難しくないと思う。

## 環境
| なまえ         | あたい                        |
|----------------|-------------------------------|
| Android Studio | Android Studio Koala 2024.1.1 |
| 言語           | Kotlin                        |
| 端末           | Google Pixel 8 Pro            |

## 適当にプロジェクトを作る
`Jetpack Compose`で`UI`を作るから！

## ImageHashTool.kt くらす
`object ImageHashTool { }`を作ったので、ここに画像のハッシュを出すユーティリティ関数を書いていくことにします。

### loadBitmap
いつも画像の読み込みを`Glide`とか`Coil`とかのライブラリに任せてるから`InputStream`から作るの新鮮。  
インターネットの画像だとライブラリ使うしか無い。

```kotlin
/**
 * [Bitmap]を取得する
 *
 * @param context [Context]
 * @param uri PhotoPicker 等で取得した[Uri]
 * @return [Bitmap]
 */
suspend fun loadBitmap(
    context: Context,
    uri: Uri
) = withContext(Dispatchers.IO) {
    context.contentResolver.openInputStream(uri)?.use { inputStream ->
        BitmapFactory.decodeStream(inputStream)
    }
}
```

### toMonoChrome
https://stackoverflow.com/questions/9377786/

次に`aHash`も`dHash`も共通して使う、`Bitmap`をモノクロ画像にする関数。  

```kotlin
/** [Bitmap]をモノクロにする */
private fun Bitmap.toMonoChrome(): Bitmap {
    val bmpGrayscale = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bmpGrayscale)
    val paint = Paint()
    val colorMatrix = ColorMatrix()
    colorMatrix.setSaturation(0f)
    val filter = ColorMatrixColorFilter(colorMatrix)
    paint.setColorFilter(filter)
    canvas.drawBitmap(this, 0f, 0f, paint)
    return bmpGrayscale
}
```

### aHash
まずは平均と比べるやつ。  
説明通り`8x8`にしてモノクロ画像にして平均の色を出します。そしたら`8x8=64`個あるピクセル全てと比較する。先述の通り左から右へ、上から下へ。  
平均より今の色が大きい場合は`1`を立てます。返り値は`ULong`

```kotlin
/** aHash を求める */
suspend fun calcAHash(bitmap: Bitmap) = withContext(Dispatchers.Default) {
    // 幅 8、高さ 8 の Bitmap にリサイズする
    val scaledBitmap = bitmap.scale(width = 8, height = 8)
    // モノクロにする
    val monochromeBitmap = scaledBitmap.toMonoChrome()
    // 色の平均を出す
    var totalRed = 0
    var totalGreen = 0
    var totalBlue = 0
    repeat(8) { y ->
        repeat(8) { x ->
            val color = monochromeBitmap[x, y]
            totalRed += color.red
            totalGreen += color.green
            totalBlue += color.blue
        }
    }
    val averageColor = Color.rgb(totalRed / 64, totalGreen / 64, totalBlue / 64)
    // 縦 8、横 8 のループを回す
    // 8x8 なので結果は 64 ビットになる。ULong で格納できる
    // 各ピクセルと平均を比較して、平均よりも大きい場合は 1 を立てる
    // ビットの立て方は以下に従う
    // 左上[0,0]から開始し、一番右まで読み取る。[0,7]
    // 一番右まで読み取ったらひとつ下に下がってまた読み出す[1,0]
    // ビッグエンディアンを採用するので、一番右のビットが[0,0]の結果になります
    var resultBit = 0UL
    var bitCount = 63
    repeat(8) { y ->
        repeat(8) { x ->
            val currentColor = monochromeBitmap[x, y]
            // ビットを立てる
            if (averageColor < currentColor) {
                resultBit = resultBit or (1UL shl bitCount)
            }
            bitCount--
        }
    }
    return@withContext resultBit
}
```

### ビット演算難しい
ビット演算見慣れないのであれですが、この部分は何をしているかと言うと、

```kotlin
var resultBit = 0UL
resultBit = resultBit or (1UL shl bitCount)
```

- `(1UL shl bitCount)`
    - この例だと、`bitCount`の回数だけ右から左へ`1`を移動させます。
    - `(1UL shl 4)`とした場合は、`10000`という二進数になります。
    - どうでもいいですが`CPU`はこの手の計算が得意らしいです。詳しくは知らないですが。
- `resultBit or ...`
    - 論理演算の`OR`をしています
    - `1000`と`0010`という2つの二進数を`OR`した場合は`1010`になります。`OR`なので。
    - 返り値の`ULong`で`OR`することで、狙った位置へビットを立てることが出来ます

### dHash
同様に`dHash`も作ります。  
こっちも作るのは難しくないはず。ビット演算してるところは`aHash`と同じです。

```kotlin
/**
 * dHash を求める
 * https://www.hackerfactor.com/blog/index.php?/archives/529-Kind-of-Like-That.html
 */
suspend fun calcDHash(bitmap: Bitmap) = withContext(Dispatchers.Default) {
    // 幅 9、高さ 8 の Bitmap にリサイズする
    val scaledBitmap = bitmap.scale(width = 9, height = 8)
    // モノクロにする
    val monochromeBitmap = scaledBitmap.toMonoChrome()
    // 縦 8、横 8 のループを回す
    // 8x8 なので結果は 64 ビットになる。ULong で格納できる
    // 幅 9 なのに 8 なのは、今のピクセルと右隣のピクセルの色と比較するため。比較して隣が大きければ 1 を立てる
    // ビットの立て方は以下に従う
    // 左上[0,0]から開始し、一番右まで読み取る。[0,7]
    // 一番右まで読み取ったらひとつ下に下がってまた読み出す[1,0]
    // ビッグエンディアンを採用するので、一番右のビットが[0,0]の結果になります
    var resultBit = 0UL
    var bitCount = 63
    repeat(8) { y ->
        repeat(8) { x ->
            val currentColor = monochromeBitmap[x, y]
            val currentRightColor = monochromeBitmap[x + 1, y]
            // ビットを立てる
            if (currentColor < currentRightColor) {
                resultBit = resultBit or (1UL shl bitCount)
            }
            bitCount--
        }
    }
    return@withContext resultBit
}
```

## JetpackCompose で UI をサクッと作る
`PhotoPicker`で適当に選んで、さっき作った`aHash / dHash`の計算をできるようにします。  

`UI`には関係ないですが、`toBinaryString()`を用意しました。これは`ULong`を`2進数の文字列`として返してくれるやつです。  
`1ビット`ずつ比較してるの、どうなの？

なんとなくコルーチンを使ってましたが、まあ全部足しても`150ms`くらいなので、最悪メインスレッドでも良いのかも。いや画像のサイズにもよりそうだからやっぱ別スレッドのが正しいかも。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidCalcImageHashTheme {
                MainScreen()
            }
        }
    }
}

/** ULong を2進数の文字列にする */
private fun ULong.toBinaryString(): String {
    var binString = "0b"
    for (i in 63 downTo 0) {
        binString += if (this and (1UL shl i) != 0UL) "1" else "0"
    }
    return binString
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MainScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val aHash = remember { mutableStateOf(0UL) }
    val dHash = remember { mutableStateOf(0UL) }

    val photoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri ->
            uri ?: return@rememberLauncherForActivityResult
            scope.launch {
                // 画像のハッシュを出す
                val bitmap = ImageHashTool.loadBitmap(context, uri) ?: return@launch
                aHash.value = ImageHashTool.calcAHash(bitmap)
                dHash.value = ImageHashTool.calcDHash(bitmap)
            }
        }
    )

    Scaffold(
        topBar = { TopAppBar(title = { Text(text = stringResource(id = R.string.app_name)) }) },
        modifier = Modifier.fillMaxSize()
    ) { innerPadding ->

        Column(modifier = Modifier.padding(innerPadding)) {

            Button(onClick = { photoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }) {
                Text(text = "画像を選ぶ")
            }

            Text(text = "aHash = ${aHash.value.toBinaryString()}")
            Text(text = "dHash = ${dHash.value.toBinaryString()}")

        }
    }
}
```

これで実行すると、こんな感じにボタンと`000...`の羅列を表示してる`Text()`があるはず。  
ボタンを押して画像を選ぶと、`aHash / dHash`が計算されます。比較できるわけじゃないので、だから何？感がある。

![Imgur](https://imgur.com/rZF76U4.png)

## 比較機能をつける
`MainScreen()`にボタンを増やして、二枚目の画像を選ぶボタンと、計算するボタンを置きました。  
比較方法は`XOR`したあと立っているビットの数を数えて少なければ`1f`に近づくようにしました。

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MainScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // 画像の Uri
    var image1Uri = remember<Uri?> { null }
    var image2Uri = remember<Uri?> { null }

    // 画像それぞれの aHash、dHash
    val aHash1 = remember { mutableStateOf(0UL) }
    val dHash1 = remember { mutableStateOf(0UL) }
    val aHash2 = remember { mutableStateOf(0UL) }
    val dHash2 = remember { mutableStateOf(0UL) }

    // 比較結果。0 から 1
    val compareAHash = remember { mutableFloatStateOf(0f) }
    val compareDHash = remember { mutableFloatStateOf(0f) }

    val photoPicker1 = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri -> image1Uri = uri }
    )
    val photoPicker2 = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri -> image2Uri = uri }
    )

    fun compare() {
        scope.launch {
            val image1Bitmap = ImageHashTool.loadBitmap(context, image1Uri!!)!!
            val image2Bitmap = ImageHashTool.loadBitmap(context, image2Uri!!)!!

            // それぞれ aHash dHash を求める
            aHash1.value = ImageHashTool.calcAHash(image1Bitmap)
            dHash1.value = ImageHashTool.calcDHash(image1Bitmap)
            aHash2.value = ImageHashTool.calcAHash(image2Bitmap)
            dHash2.value = ImageHashTool.calcDHash(image2Bitmap)

            // 一致していないビットを求める。XOR する
            val aHashXor = aHash1.value xor aHash2.value
            val dHashXor = dHash1.value xor dHash2.value

            // 立っているビットの数を数える
            // 一致しているビットが多ければ少なくなる
            val aHashOneBitCount = aHashXor.countOneBits()
            val dHashOneBitCount = dHashXor.countOneBits()

            // 一致度を出す
            // 64 はハッシュ値が 64 ビットなので
            compareAHash.floatValue = (64 - aHashOneBitCount) / 64f
            compareDHash.floatValue = (64 - dHashOneBitCount) / 64f
        }
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text(text = stringResource(id = R.string.app_name)) }) },
        modifier = Modifier.fillMaxSize()
    ) { innerPadding ->

        Column(modifier = Modifier.padding(innerPadding)) {

            Button(onClick = { photoPicker1.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }) {
                Text(text = "1枚目の画像を選ぶ")
            }

            Button(onClick = { photoPicker2.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }) {
                Text(text = "2枚目の画像を選ぶ")
            }

            Button(onClick = { compare() }) {
                Text(text = "一致度を計算")
            }

            Text(text = "それぞれの aHash dHash")
            Text(text = "aHash1 = ${aHash1.value.toBinaryString()}")
            Text(text = "dHash1 = ${dHash1.value.toBinaryString()}")
            Text(text = "aHash2 = ${aHash2.value.toBinaryString()}")
            Text(text = "dHash2 = ${dHash2.value.toBinaryString()}")

            Text(text = "一致度")
            Text(text = "aHash = ${compareAHash.floatValue}")
            Text(text = "dHash = ${compareDHash.floatValue}")

        }
    }
}
```

できた！！！！！  
似ていれば`1.0`に近い値が出てくるはずです！！！

![Imgur](https://imgur.com/58r7X84.png)

## ここまでのソースコード
https://github.com/takusan23/AndroidCalcImageHash

## いろいろ写真を入れてみる
本当に似ていれば同じなのか！？

### 半分同じ

![Imgur](https://imgur.com/wrF0tZV.png)

### 回転

![Imgur](https://imgur.com/lRpXkmS.png)

### モノクロにした

![Imgur](https://imgur.com/E2uo3qj.png)

### 正方形に切り抜いた

![Imgur](https://imgur.com/Czxl1lD.png)

# 写真フォルダを走査して重複画像を探したい
せっかくなので重複画像があれば見つけてくれるアプリを作ってみる。  
いうて`MediaStore`から画像を全部取って`Bitmap`取って`aHash / dHash`取って近いやつを表示すれば。。。

## 画像を読み取る権限
`android.permission.READ_MEDIA_IMAGES`が必要です。`Android 12`以下でも動かしたい場合は`android.permission.READ_EXTERNAL_STORAGE`が必要です。  
また、この権限は結構強いので`PlayStore`に出す際は追加の審査があるので、できれば避けるべきです。  
写真管理アプリ、みたいな目的だとおそらく通りそうな雰囲気はありますが。→ https://support.google.com/googleplay/android-developer/answer/14115180

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission
        android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

    <!-- 以下省略... -->
```

## 今回使う関数たち
今回使う関数たち、画像一覧を取得するとか、`Uri`から`Bitmap`を取るとか。`aHash / dHash`取るとか。今回は`XOR`する部分も関数にしました。  
大量の画像を扱うなら`Glide`とかのライブラリで画像を読み込んだ方がいいですね。。。

`ImageTool.kt`

```kotlin
object ImageTool {

    /** 画像一覧を Uri の配列として取得する */
    suspend fun queryAllImageUriList(
        context: Context
    ): List<Uri> = withContext(Dispatchers.IO) {
        context.contentResolver.query(
            // 保存先、SDカードとかもあったはず
            MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
            // 今回はメディアの ID を取得。他にもタイトルとかあります
            // 実際のデータの取得には、まず ID を取得する必要があります
            arrayOf(MediaStore.MediaColumns._ID),
            // SQL の WHERE。ユーザー入力が伴う場合はプレースホルダーを使いましょう
            null,
            // SQL の WHERE のプレースホルダーの値
            null,
            // SQL の ORDER BY
            null
        )?.use { cursor ->
            // 一応最初に移動しておく
            cursor.moveToFirst()
            // 配列を返す
            (0 until cursor.count)
                .map {
                    // ID 取得
                    val id = cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.MediaColumns._ID))
                    // Uri の取得
                    val uri = ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id)
                    // 次のレコードに移動
                    cursor.moveToNext()
                    // 返す
                    uri
                }
        } ?: emptyList()
    }

    /**
     * [Bitmap]を取得する
     * TODO 大量に読み込む場合は Glide を使ってサイズを指定してから読み込む方が良いです。自前で書くの良くない
     *
     * @param context [Context]
     * @param uri PhotoPicker 等で取得した[Uri]
     * @return [Bitmap]
     */
    suspend fun loadBitmap(
        context: Context,
        uri: Uri
    ) = withContext(Dispatchers.IO) {
        context.contentResolver.openInputStream(uri)?.use { inputStream ->
            BitmapFactory.decodeStream(inputStream)
        }
    }

    /**
     * dHash を求める
     * https://www.hackerfactor.com/blog/index.php?/archives/529-Kind-of-Like-That.html
     */
    suspend fun calcDHash(bitmap: Bitmap) = withContext(Dispatchers.Default) {
        // 幅 9、高さ 8 の Bitmap にリサイズする
        val scaledBitmap = bitmap.scale(width = 9, height = 8)
        // モノクロにする
        val monochromeBitmap = scaledBitmap.toMonoChrome()
        // 縦 8、横 8 のループを回す
        // 8x8 なので結果は 64 ビットになる。ULong で格納できる
        // 幅 9 なのに 8 なのは、今のピクセルと右隣のピクセルの色と比較するため。比較して隣が大きければ 1 を立てる
        // ビットの立て方は以下に従う
        // 左上[0,0]から開始し、一番右まで読み取る。[0,7]
        // 一番右まで読み取ったらひとつ下に下がってまた読み出す[1,0]
        // ビッグエンディアンを採用するので、一番右のビットが[0,0]の結果になります
        var resultBit = 0UL
        var bitCount = 63
        repeat(8) { y ->
            repeat(8) { x ->
                val currentColor = monochromeBitmap[x, y]
                val currentRightColor = monochromeBitmap[x + 1, y]
                // ビットを立てる
                if (currentColor < currentRightColor) {
                    resultBit = resultBit or (1UL shl bitCount)
                }
                bitCount--
            }
        }
        return@withContext resultBit
    }

    /** aHash を求める */
    suspend fun calcAHash(bitmap: Bitmap) = withContext(Dispatchers.Default) {
        // 幅 8、高さ 8 の Bitmap にリサイズする
        val scaledBitmap = bitmap.scale(width = 8, height = 8)
        // モノクロにする
        val monochromeBitmap = scaledBitmap.toMonoChrome()
        // 色の平均を出す
        var totalRed = 0
        var totalGreen = 0
        var totalBlue = 0
        repeat(8) { y ->
            repeat(8) { x ->
                val color = monochromeBitmap[x, y]
                totalRed += color.red
                totalGreen += color.green
                totalBlue += color.blue
            }
        }
        val averageColor = Color.rgb(totalRed / 64, totalGreen / 64, totalBlue / 64)
        // 縦 8、横 8 のループを回す
        // 8x8 なので結果は 64 ビットになる。ULong で格納できる
        // 各ピクセルと平均を比較して、平均よりも大きい場合は 1 を立てる
        // ビットの立て方は以下に従う
        // 左上[0,0]から開始し、一番右まで読み取る。[0,7]
        // 一番右まで読み取ったらひとつ下に下がってまた読み出す[1,0]
        // ビッグエンディアンを採用するので、一番右のビットが[0,0]の結果になります
        var resultBit = 0UL
        var bitCount = 63
        repeat(8) { y ->
            repeat(8) { x ->
                val currentColor = monochromeBitmap[x, y]
                // ビットを立てる
                if (averageColor < currentColor) {
                    resultBit = resultBit or (1UL shl bitCount)
                }
                bitCount--
            }
        }
        return@withContext resultBit
    }

    /** XOR してビットを数えて 0 から 1 の範囲でどれだけ似ているかを返す */
    fun compare(a: ULong, b: ULong): Float {
        val xorResult = a xor b
        val bitCount = xorResult.countOneBits()
        // 64 はハッシュ値が 64 ビットなので
        return (64 - bitCount) / 64f
    }

    /** [Bitmap]をモノクロにする */
    private fun Bitmap.toMonoChrome(): Bitmap {
        val bmpGrayscale = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bmpGrayscale)
        val paint = Paint()
        val colorMatrix = ColorMatrix()
        colorMatrix.setSaturation(0f)
        val filter = ColorMatrixColorFilter(colorMatrix)
        paint.setColorFilter(filter)
        canvas.drawBitmap(this, 0f, 0f, paint)
        return bmpGrayscale
    }

}
```

## 重複してるかも画像を表示する画面を作る
`宣言型UI`のおかげで縦スクロールの中に横スクロールを入れるのがめっちゃ簡単なの神神神  
今回は面倒なのでやってませんが、画像のハッシュを求めて比較する処理とかは明らかに`ViewModel`にあるべきですね。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidDetectDuplicateImageAppTheme {
                MainScreen()
            }
        }
    }
}

/** Uri の画像ハッシュ値データクラス */
data class ImageHashData(
    val uri: Uri,
    val aHash: ULong,
    val dHash: ULong
)

/**
 * 重複しているかも？画像のデータクラス
 *
 * @param from 元画像
 * @param duplicateImageList 似ている画像
 */
data class MaybeDuplicateImageData(
    val from: Uri,
    val duplicateImageList: List<Uri>
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MainScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // 権限をゲットする
    val permissionRequest = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { isGrented ->
            if (isGrented) {
                Toast.makeText(context, "権限を付与しました", Toast.LENGTH_SHORT).show()
            }
        }
    )

    val imageCount = remember { mutableIntStateOf(0) }
    val processCount = remember { mutableIntStateOf(0) }
    val maybeDuplicateImageData = remember { mutableStateOf(emptyList<MaybeDuplicateImageData>()) }

    // TODO 本当は ViewModel でやるべきです
    fun search() {
        scope.launch(Dispatchers.Default) {
            // MediaStore で画像一覧を問い合わせる
            // 権限が必要です
            val uriList = ImageTool.queryAllImageUriList(context)
            imageCount.intValue = uriList.size

            // 処理を開始
            // 並列にするなど改善の余地あり
            val imageHashList = uriList.map { uri ->
                val bitmap = ImageTool.loadBitmap(context, uri)!!
                val aHash = ImageTool.calcAHash(bitmap)
                val dHash = ImageTool.calcDHash(bitmap)
                processCount.intValue++
                ImageHashData(uri, aHash, dHash)
            }

            // しきい値
            val threshold = 0.95f
            // ImageHashList を可変長配列に。これは重複している画像が出てきら消すことで、後半になるにつれ走査回数が減るよう
            val maybeDuplicateDropImageHashList = imageHashList.toMutableList()
            // 重複している、似ている画像を探す
            imageHashList.forEach { current ->
                // 自分以外
                val withoutTargetList = maybeDuplicateDropImageHashList.filter { it.uri != current.uri }
                val maybeFromAHash = withoutTargetList.filter { threshold < ImageTool.compare(it.aHash, current.aHash) }
                val maybeFromDHash = withoutTargetList.filter { threshold < ImageTool.compare(it.dHash, current.dHash) }
                // 結果をいれる
                // aHash か dHash で重複していない場合は結果に入れない
                val totalResult = (maybeFromAHash.map { it.uri } + maybeFromDHash.map { it.uri }).distinct()
                if (totalResult.isNotEmpty()) {
                    maybeDuplicateImageData.value += MaybeDuplicateImageData(
                        from = current.uri,
                        duplicateImageList = totalResult
                    )
                }
                // 1回重複していることが分かったらもう消す（2回目以降検索にかけない）
                maybeDuplicateDropImageHashList.removeAll(maybeFromAHash)
                maybeDuplicateDropImageHashList.removeAll(maybeFromDHash)
            }
        }
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text(text = stringResource(id = R.string.app_name)) }) },
        modifier = Modifier.fillMaxSize()
    ) { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding)) {

            Button(onClick = {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    permissionRequest.launch(android.Manifest.permission.READ_MEDIA_IMAGES)
                } else {
                    permissionRequest.launch(android.Manifest.permission.READ_EXTERNAL_STORAGE)
                }
            }) {
                Text(text = "権限を付与")
            }

            Button(onClick = { search() }) {
                Text(text = "処理を開始")
            }

            Text(text = "総画像数 ${imageCount.intValue} / 処理済み画像数 ${processCount.intValue} / 重複の可能性がある画像の数 ${maybeDuplicateImageData.value.size}")

            LazyColumn {
                items(maybeDuplicateImageData.value) { maybeDuplicate ->

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        UriImagePreview(
                            modifier = Modifier.requiredSize(200.dp),
                            uri = maybeDuplicate.from
                        )
                        Text(text = maybeDuplicate.from.toString())
                    }

                    LazyRow {
                        items(maybeDuplicate.duplicateImageList) { maybeUri ->
                            UriImagePreview(
                                modifier = Modifier.requiredSize(200.dp),
                                uri = maybeUri
                            )
                        }
                    }

                    HorizontalDivider()
                }
            }
        }
    }
}

/** Uri の画像を表示する */
@Composable
private fun UriImagePreview(
    modifier: Modifier = Modifier,
    uri: Uri
) {
    val context = LocalContext.current
    val image = remember { mutableStateOf<ImageBitmap?>(null) }

    LaunchedEffect(key1 = uri) {
        // TODO 自分で Bitmap を読み込むのではなく、Glide や Coil を使うべきです
        image.value = ImageTool.loadBitmap(context, uri)?.asImageBitmap()
    }

    if (image.value != null) {
        Image(
            modifier = modifier,
            bitmap = image.value!!,
            contentDescription = null
        )
    } else {
        Box(
            modifier = modifier,
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
    }
}
```

動かしてみた、  
今回は並列で処理してないので、少し時間がかかります。もし並列で処理したい場合はメモリを使いすぎないよう並列処理数を減らすとか、  
`Glide`ってライブラリであらかじめ小さくして`Bitmap`を読み込むとかしたほうが良いですね。

うーん、スクリーンショットの中にカメラ越しの写真が含まれちゃってるんだけど、そういうものなのかはたまた正しいのか、よく分からんな。。。  
スクリーンショットも似ているレイアウトのアプリを見つけてくれるときが大半なんだけど、なんかぜんぜん違うのも混じってて、なにか間違えた可能性がある。。。

![Imgur](https://imgur.com/JDRZsmg.png)

![Imgur](https://imgur.com/k74dffq.png)  

↑ スクショなのに普通の写真が出てきている？なんか間違えたかな、、、

（あと知らない間に`LazyColumn { }`ってスクロールスクショに対応したんですね！）

## ソースコード
https://github.com/takusan23/AndroidDetectDuplicateImageApp

# 動画も画像を取り出してハッシュにすれば探せるのでは？
動画も一枚一枚取り出して`aHash / dHash`に通して突き合わせれば動画の重複も探せるのではないかという話。  
`MediaCodec`の検証で同じような動画ばっかり作ってるから消せると嬉しい。似てる動画を消したい！！

ただ、動画の場合は多分かなり時間がかかるので、最初から10秒だけとか、アプリを再起動したら途中から再開できるよう`Room`データベースに入れておくとかが必要だと思います。  
面倒なので今回は冒頭から`10`秒だけ見ます。

## 動画から画像（フレーム）を取り出す
前書いたこれを使います。  
https://takusan.negitoro.dev/posts/android_get_video_frame_mediacodec/

一応いつまで面倒を見るか不明ですがライブラリがあります。  
https://github.com/takusan23/AkariDroid/tree/master/akari-core

`implementation("io.github.takusan23:akaricore:4.1.1")`

また、ライブラリを入れるまでもなく`Android`には`MediaMetadataRetriever`ってクラスがあって、こいつでも動画からフレーム（`Bitmap`）を取り出せるのですが、**多分並列化出来ない。。。**  
並列でスレッドを起動して試してみたけど多分効果ない、、、

## 動画アクセス権限
動画の場合は、`android.permission.READ_MEDIA_VIDEO`が必要です。同様に`Android 12`以下でも使いたい場合は`android.permission.READ_EXTERNAL_STORAGE`が必要です。

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission
        android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />

    <!-- 以下省略 -->
```

## 動画一覧を取得する
`queryAllImageUriList`の動画版を作ります。今回は`Uri`ではなく`ID`を返そうかなと、というのも、`Room`（データベース）に入れる時に文字列よりは数字のほうが良いのかなと。  
いや、あんまり変わん気がしてきた、、、

```kotlin
object VideoTool {

    /**
     * 全ての動画を取得する
     *
     * @param context [Context]
     */
    suspend fun queryAllVideoIdList(
        context: Context
    ) = withContext(Dispatchers.IO) {
        context.contentResolver.query(
            // 保存先、SDカードとかもあったはず
            MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
            // 今回はメディアの ID を取得。他にもタイトルとかあります
            // 実際のデータの取得には、まず ID を取得する必要があります
            arrayOf(MediaStore.MediaColumns._ID),
            // SQL の WHERE。ユーザー入力が伴う場合はプレースホルダーを使いましょう
            null,
            // SQL の WHERE のプレースホルダーの値
            null,
            // SQL の ORDER BY
            null
        )?.use { cursor ->
            // 一応最初に移動しておく
            cursor.moveToFirst()
            // 配列を返す
            (0 until cursor.count)
                .map {
                    // ID 取得
                    val id = cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.MediaColumns._ID))
                    // 次のレコードに移動
                    cursor.moveToNext()
                    // 返す
                    id
                }
        } ?: emptyList()
    }

    /** ID から Uri を取る */
    fun getVideoUri(id: Long) = ContentUris.withAppendedId(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, id)
}
```

## ハッシュを出す関数
は、写真の時に作った`ImageTool.kt`を使うことにします。

→ [#今回使う関数たち](#今回使う関数たち)

## 動画のレイアウトを作る
こちらです。  
権限付与ボタンと、処理開始ボタンがあって、結果表示の`LazyColumn`があります。

実際にフレームを取り出してハッシュを出す`analyze()`関数はこのあとすぐ。ほんとうは`ViewModel`とかに書くべきです。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidDetectDuplicateVideoAppTheme {
                MainScreen()
            }
        }
    }
}

/** 動画Uriとフレームとハッシュ */
private data class VideoFrameHashData(
    val videoUri: Uri,
    val durationMs: Long,
    val aHash: ULong,
    val dHash: ULong
)

/** 動画と、似ているフレームがある動画 */
private data class DuplicateVideoData(
    val videoUri: Uri,
    val maybeDuplicateUriList: List<Uri>
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MainScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val permissionRequest = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { isGranted ->
            if (isGranted) {
                Toast.makeText(context, "権限を付与しました", Toast.LENGTH_SHORT).show()
            }
        }
    )

    val totalVideoCount = remember { mutableIntStateOf(0) }
    val processCount = remember { mutableIntStateOf(0) }
    val duplicateVideoList = remember { mutableStateOf(emptyList<DuplicateVideoData>()) }

    fun analyze() {
        // todo このあとすぐ
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text(text = stringResource(id = R.string.app_name)) }) },
        modifier = Modifier.fillMaxSize()
    ) { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding)) {

            Button(onClick = {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    permissionRequest.launch(android.Manifest.permission.READ_MEDIA_VIDEO)
                } else {
                    permissionRequest.launch(android.Manifest.permission.READ_EXTERNAL_STORAGE)
                }
            }) {
                Text(text = "権限を付与する")
            }

            Button(onClick = { analyze() }) {
                Text(text = "解析する")
            }

            Text(text = "総動画数 ${totalVideoCount.intValue} / 処理済み動画数 ${processCount.intValue}")

            LazyColumn {
                items(duplicateVideoList.value) { duplicate ->
                    Row {
                        VideoThumbnailImage(
                            modifier = Modifier.requiredSize(100.dp),
                            uri = duplicate.videoUri
                        )
                        Text(text = duplicate.videoUri.toString())
                    }
                    LazyRow {
                        items(duplicate.maybeDuplicateUriList) { maybeUri ->
                            VideoThumbnailImage(
                                modifier = Modifier.requiredSize(100.dp),
                                uri = maybeUri
                            )
                        }
                    }
                    HorizontalDivider()
                }
            }

        }
    }
}

/** 動画のサムネイルを表示する Image */
@Composable
private fun VideoThumbnailImage(
    modifier: Modifier = Modifier,
    uri: Uri
) {
    val context = LocalContext.current
    val thumbnailBitmap = remember { mutableStateOf<ImageBitmap?>(null) }

    LaunchedEffect(key1 = uri) {
        withContext(Dispatchers.IO) {
            thumbnailBitmap.value = context.contentResolver.loadThumbnail(uri, Size(320, 320), null).asImageBitmap()
        }
    }

    if (thumbnailBitmap.value != null) {
        Image(
            modifier = modifier.clickable { isShowBottomSheet.value = !isShowBottomSheet.value },
            bitmap = thumbnailBitmap.value!!,
            contentDescription = null
        )
    } else {
        Box(
            modifier = modifier,
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
    }
}
```

## 動画からフレーム取ってハッシュを出す
自作ライブラリ`akari-core`の`VideoFrameBitmapExtractor()`を使ってますが、`Android`の`MediaMetadataRetriever`で`Bitmap`を取り出してもいいです。  
その場合は`frameBitmapExtractor.getVideoFrameBitmap()`の部分を`MediaMetadataRetriever#getFrameAtTime`とかに差し替えれば良いはず。

同時処理数は`Semaphore(8)`で`8`個以上`VideoFrameBitmapExtractor()`のインスタンスが存在しないようにしたはずですが、なんか例外投げてくる時あるので、`catch()`が何個か待ち受けてます。それのせい。  
並列数を減らせば良いかも。というか端末がそもそも悪い気がしてきた。

`println`は消してください、あと、時間がかかりすぎるので`minOf()`で長くても`10`秒まで、`1`秒ごとに取り出してハッシュを出すことにします。  
ハッシュを出してる箇所と比較してる箇所は動画のそれと変わってないはず。

```kotlin
fun analyze() {
    scope.launch(Dispatchers.Default) {
        val videoUriList = VideoTool.queryAllVideoIdList(context)
            .map { VideoTool.getVideoUri(it) }
        totalVideoCount.intValue = videoUriList.size

        // リストに同時にでアクセスさせないように mutex
        val listLock = Mutex()
        // 並列処理数を制限。ハードウェアデコーダーは同時起動上限がある。多分16個くらい
        val semaphore = Semaphore(8)
        // 処理結果
        val videoFrameHashDataList = arrayListOf<VideoFrameHashData>()

        // 上限を決めるなら List#take() とかを使う
        videoUriList.map { uri ->
            println("start $uri")

            // 並列ではしらす
            launch {
                semaphore.withPermit {

                    // 動画時間取る
                    // TODO 長すぎるとデバッグするのが面倒なので適当に10秒で
                    val videoDurationMs = minOf(
                        10_000,
                        runCatching {
                            MediaMetadataRetriever().apply {
                                context.contentResolver.openFileDescriptor(uri, "r")?.use {
                                    setDataSource(it.fileDescriptor)
                                }
                            }.use { it.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLong()!! }
                        }.getOrNull() ?: return@withPermit
                    )

                    // 1 秒ごとにフレームを取り出す
                    val frameMsList = (0 until videoDurationMs step 1_000).toList()
                    val frameBitmapExtractor = VideoFrameBitmapExtractor()
                    try {
                        frameBitmapExtractor.prepareDecoder(uri.toAkariCoreInputOutputData(context))
                        frameMsList.forEach { frameMs ->
                            // println("current $frameMs $uri")
                            frameBitmapExtractor.getVideoFrameBitmap(frameMs)?.also { bitmap ->
                                // ハッシュを出してリストに追加
                                val aHash = ImageTool.calcAHash(bitmap)
                                val dHash = ImageTool.calcDHash(bitmap)
                                listLock.withLock {
                                    videoFrameHashDataList += VideoFrameHashData(uri, frameMs, aHash, dHash)
                                }
                            }
                        }
                    } catch (e: IllegalArgumentException) {
                        // Failed to initialize video/av01, error 0xfffffffe ？
                        println("Decoder error $uri")
                    } catch (e: MediaCodec.CodecException) {
                        // 多分並列起動数が多いとエラーなる。同じ動画でも1つだけなら問題なかった
                        println("Decoder error $uri")
                    } finally {
                        println("complete $uri")
                        processCount.intValue++
                        frameBitmapExtractor.destroy()
                    }

                }
            }

        }.joinAll()

        // しきい値
        val threshold = 0.95f
        // ImageHashList を可変長配列に。これは重複している画像が出てきら消すことで、後半になるにつれ走査回数が減るよう
        val maybeDuplicateDropFrameHashList = videoFrameHashDataList.toMutableList()
        // フレームを一枚ずつ見ていって、重複していたら消す
        while (isActive) {
            // 次のデータ。ループのたびに最初の要素を消すので、実質イテレータ。
            // ただ、重複していたらリストから Uri が消えるので、イテレータより回数は少ないはず
            val current = maybeDuplicateDropFrameHashList.removeFirstOrNull() ?: break
            // 自分以外
            val withoutTargetList = maybeDuplicateDropFrameHashList.filter { it.videoUri != current.videoUri }
            val maybeFromAHash = withoutTargetList.filter { threshold < ImageTool.compare(it.aHash, current.aHash) }
            val maybeFromDHash = withoutTargetList.filter { threshold < ImageTool.compare(it.dHash, current.dHash) }
            // aHash か dHash で重複していない場合は結果に入れない
            val totalResult = (maybeFromAHash.map { it.videoUri } + maybeFromDHash.map { it.videoUri }).distinct()
            println("totalResult = $totalResult")
            if (totalResult.isNotEmpty()) {
                duplicateVideoList.value += DuplicateVideoData(
                    videoUri = current.videoUri,
                    maybeDuplicateUriList = totalResult
                )
            }
            // 1回重複していることが分かったらもう消す（2回目以降検索にかけない）
            maybeDuplicateDropFrameHashList.removeAll { it.videoUri == current.videoUri }
        }
    }
}
```

## 重複しているかもな動画を見てみた
つかってみた。先頭`10`秒までしか見ていないんだけど、解析がちょっとかかる。  
うまく動いてるっちゃ動いている気がする、、、

![Imgur](https://imgur.com/sEblgLM.png)

## 削除機能が欲しい
さて、これは画像ハッシュとか全然関係なく、`Android`の話になります。。  
`Uri`を削除したい。けどややこしいんだわ。。

`Android`の`Uri`周りが複雑な話は、今度やる気があったら話したいと思うのですが、今回は他のアプリが作成したファイルの削除をしたいということで。  
`ContentResolver#delete`って関数があるんですが、これは自分のアプリが`ContentResolver#insert`したものに限るはずです。

じゃあ他のアプリが作成した写真は消せないのかと言うとそうではなく、ユーザーに許可を求めることで削除ができます。  
https://developer.android.com/training/data-storage/shared/media?hl=ja#update-other-apps-files

というわけでレイアウトをまずは作ります。  
動画のサムネイルを押した時にボトムシートを出すようにします。ボトムシートの実装も`Jetpack Compose`だとバカ簡単になって神。  
`ModalBottomSheet`はレイヤーが違うので（`WindowManager#addView`している。`React`の`Portal`で全然違うところにコンポーネントを置くみたいな）、  
再利用する用のコンポーネントでも呼び出して使うことが出来ます。

`ACTION_VIEW`でおそらく動画プレイヤーを開けます。削除はこのあとすぐ！

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun VideoThumbnailImage(
    modifier: Modifier = Modifier,
    uri: Uri
) {
    val context = LocalContext.current
    val thumbnailBitmap = remember { mutableStateOf<ImageBitmap?>(null) }
    val isShowBottomSheet = remember { mutableStateOf(false) }

    LaunchedEffect(key1 = uri) {
        withContext(Dispatchers.IO) {
            thumbnailBitmap.value = context.contentResolver.loadThumbnail(uri, Size(320, 320), null).asImageBitmap()
        }
    }

    // 削除とかできるボトムシート
    if (isShowBottomSheet.value) {
        ModalBottomSheet(onDismissRequest = { isShowBottomSheet.value = false }) {
            TextButton(
                modifier = Modifier.fillMaxWidth(),
                onClick = { context.startActivity(Intent(Intent.ACTION_VIEW, uri)) }
            ) {
                Text(text = "動画プレイヤーを開く")
            }
            TextButton(
                modifier = Modifier.fillMaxWidth(),
                onClick = {
                    // このあとすぐ
                }
            ) {
                Text(text = "ゴミ箱に移動（Google フォトから復元できます）")
            }
        }
    }

    if (thumbnailBitmap.value != null) {
        Image(
            modifier = modifier.clickable { isShowBottomSheet.value = !isShowBottomSheet.value },
            bitmap = thumbnailBitmap.value!!,
            contentDescription = null
        )
    } else {
        Box(
            modifier = modifier,
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator()
        }
    }
}
```

## Uriの削除とゴミ箱に移動
削除するっても、`Uri`を削除するか、はたまた**ゴミ箱に移動**するか選べます。  
ゴミ箱なんてどこから開けば良いんだよって思ったのですが`Google フォト`アプリか、`File by Google`アプリでゴミ箱の一覧が見れるらしいです。Android初心者です  

以下のコードはゴミ箱に移動するコード。  
`MediaStore.createTrashRequest`で`Intent`をつくり、それをユーザーに表示させることでゴミ箱に移動するかを決めてもらうことが出来ます。これの亜種に削除版と更新版（書き込みができる？）があります。  
複数の`Uri`を渡すことが出来ます。プリインアプリに関してはダイアログを出さすに遂行できるので、私達は知らず知らずに使ってたっぽいこれ。

古いバージョンに関してはストレージ書き込み権限で消せるんじゃないかな？（未検証）

```kotlin
TextButton(
    modifier = Modifier.fillMaxWidth(),
    onClick = {
        // ゴミ箱に移動リクエストの Intent をつくる
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val intent = MediaStore.createTrashRequest(context.contentResolver, listOf(uri), true)
            (context as? Activity)?.startIntentSenderForResult(intent.intentSender, 0, null, 0, 0, 0)
        } else {
            // TODO 古い Android は未実装
        }
    }
) {
    Text(text = "ゴミ箱に移動（Google フォトから復元できます）")
}
```

というわけで削除機能もつけました！やった！  
ゴミ箱に移動なので戻せます！

![Imgur](https://imgur.com/pNMYu7T.png)

ちゃんと`Google フォト`アプリと`Files by Google`アプリのゴミ箱に入ってました。  

![Imgur](https://imgur.com/EczEgI4.png)

![Imgur](https://imgur.com/gj8ZtRP.png)

## データベースにいれるようにしてアプリの再起動に耐えれるように
ハッシュを求めた結果を`Android`のデータベースに入れました。`Room`、かわらぬ使いやすさ。`Flow<T>`が返せるの、どういう仕組みなんだろう？  
さすがに`ViewModel`で処理を書くべきだったこれ。。。

https://github.com/takusan23/AndroidDetectDuplicateVideoApp/commit/be544a06f9befdd19a0670355ebeb545eb68146e

## 重複しているかも動画を探すソースコード
はい

https://github.com/takusan23/AndroidDetectDuplicateVideoApp

# おわりに
わたしの作りが悪いのか、似てる画像のときと外れてるときが半々くらい。。。。  
でも思ったよりは見つけられている。`MediaCodec`の検証で作ったおんなじような画像は見つけられてそう（まあほぼおんなじだし）

あとどうでもいいんですけど、2進数で`1`の数を数える関数`countOneBits()`を今回は使ったわけですが、  
`Kotlin/JVM`だと`java.lang.Integer.bitCount`というメソッドを呼んでいるそうです。  
で、ちらっと`Java`の`bitCount`実装を見てみたけど、、、、上からビットを数えてるのかと思ったらなんかよく分からんビット演算をして数えてる、、、？？？  

https://stackoverflow.com/questions/44093381/

# 参考にしました
ありがとうございます！

https://tech.unifa-e.com/entry/2017/11/27/111546  
https://nsr-9.hatenablog.jp/entry/2021/08/08/010905  
https://qiita.com/mamo3gr/items/b93545a0346d8731f03c