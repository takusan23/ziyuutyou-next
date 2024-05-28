---
title: Jetpack Compose でテキストや画像のドラッグアンドドロップと Android 14
created_at: 2024-05-29
tags:
- Android
- Kotlin
- JetpackCompose
---

どうもこんばんわ。  
パイセンの犯人捕まったそうですね。全然関係ない枠で知った。  

![Imgur](https://imgur.com/6FlCXG9.png)

（テレビにパイセン映し出されたの普通に面白すぎる）

ニコ生でパイセンの放送何回か見たことあるけど、  
パイセンでもちゃんと警察動いててなんか凄いなーって（ひどい言い方だよ）  

~~そんなパイセンを忘れないようにここに書いておくことにします。~~ → すまん前科が多すぎて忘れられそうにない。いつ狙われてもおかしくないような人だったし、、  

<script type="application/javascript" src="https://embed.nicovideo.jp/watch/sm34367238/script?w=640&h=360&from=148"></script><noscript><a href="https://www.nicovideo.jp/watch/sm34367238?from=148">20181223　暗黒放送 有馬記念3連単クラブ（2018有馬記念）放送　⑥</a></noscript>

<script type="application/javascript" src="https://embed.nicovideo.jp/watch/sm34367962/script?w=640&h=360&from=363"></script><noscript><a href="https://www.nicovideo.jp/watch/sm34367962?from=363">20181223　暗黒放送 有馬記念3連単クラブ（2018有馬記念）放送　⑩</a></noscript>

2018 年ってもう 6 年も前になるの・・・えぇ  
懐かしすぎる、

![Imgur](https://imgur.com/V9FIeEn.png)

ニコ生年齢あんけ in パイセンの枠  
2018 年くらいらしい

![Imgur](https://imgur.com/XpNahpZ.png)

2020 年にニコ生戻ってきて？やってたそうだけど、生前どこでやってたかはわからん。  
`FC2`とかも`BAN`とかなんとか。

![Imgur](https://imgur.com/I9ZIFVL.png)

# 本題
それとこれとは関係ないのですが、  
（決してパイセンがドラッグやって捕まったからドラッグアンドドロップに繋がったわけではない）

`Jetpack Compose`でテキストとかファイルの、ドラッグアンドドロップ機能がつけられるようになったみたいなので、  
試してみることにします。

ドラッグアンドドロップ自体は`Android 7`くらいからありますが、  
**Android 14 でパワーアップしたのでそれも紹介。あんまり盛り上がってなくて悲しい。**

# 環境

| なまえ          | あたい                                           |
|-----------------|--------------------------------------------------|
| Android Studio  | Android Studio Jellyfish 2023.3.1 Patch 1        |
| Jetpack Compose | 2024.05.00                                       |
| minSdk          | 24 （ドラッグアンドドロップが Android 7 以降？） |

# ドキュメント
テキストをドラッグアンドドロップで貼り付けるとかは、そんなに難しくない。  
画像とか、バイナリデータをやり取りしたい場合は一気に面倒になる。

- View
    - https://developer.android.com/develop/ui/views/touch-and-input/drag-drop/view
- Compose
    - https://developer.android.com/develop/ui/compose/touch-input/user-interactions/drag-and-drop

# テキストをやり取りしてみる
まずは簡単な、テキストをやり取りしてみることにします。

## 共通レイアウト
送信と受信が両方試せるように、ドラッグアンドドロップの開始、終了をそれぞれ置きました。  
処理はこのあと書きます

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen() {
    Scaffold(
        topBar = {
            TopAppBar(title = { Text(text = "ドラッグアンドドロップ") })
        }
    ) { paddingValues ->

        Column(modifier = Modifier.padding(paddingValues)) {

            DragAndDropSendContainer(
                modifier = Modifier
                    .padding(10.dp)
                    .fillMaxWidth()
            )

            DragAndDropReceiveContainer(
                modifier = Modifier
                    .padding(10.dp)
                    .fillMaxWidth()
            )

        }
    }
}

@Composable
private fun DragAndDropSendContainer(modifier: Modifier = Modifier) {
    val inputText = remember { mutableStateOf("") }

    OutlinedCard(modifier = modifier) {
        Column(modifier = Modifier.padding(10.dp)) {

            Text(text = "ドラッグアンドドロップ 送信側")

            OutlinedTextField(
                value = inputText.value,
                onValueChange = { inputText.value = it }
            )

            Box(
                modifier = Modifier
                    .size(100.dp)
                    .border(1.dp, MaterialTheme.colorScheme.primary),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "長押し！")
            }
        }
    }
}

@Composable
private fun DragAndDropReceiveContainer(modifier: Modifier = Modifier) {
    val receiveText = remember { mutableStateOf("") }

    OutlinedCard(modifier = modifier) {
        Column(modifier = Modifier.padding(10.dp)) {

            Text(text = "ドラッグアンドドロップ 受信側")

            Box(
                modifier = Modifier
                    .size(200.dp)
                    .border(1.dp, MaterialTheme.colorScheme.primary),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "ここに持ってくる")
            }

            HorizontalDivider()

            Text(text = receiveText.value)
        }
    }
}
```

## 送信側
`ClipData`にドラッグアンドドロップで送りたいデータを詰め込みます。  
あとは、ドラッグアンドドロップしたい`Box()`とかのコンポーネントの`Modifier`へ、`dragAndDropSource { }`することで、長押し時に移動できるようになります。

`ClipData.newPlainText`の第1引数、`"Text"`の部分、ドキュメントにはユーザーへ表示する値とかなんとか書いてありますが、  
私もそんな`UI`見たこと無いので、おそらく開発側が自由に決めていい値のはずです。

- https://developer.android.com/reference/android/content/ClipData.html#newPlainText(java.lang.CharSequence,%20java.lang.CharSequence)
- https://stackoverflow.com/questions/33207809/

```kotlin
Box(
    modifier = Modifier
        .size(100.dp)
        .border(1.dp, MaterialTheme.colorScheme.primary)
        .dragAndDropSource {
            detectTapGestures(onLongPress = {
                // value に文字をいれる
                val clipData = ClipData.newPlainText("Text", inputText.value)
                startTransfer(DragAndDropTransferData(clipData = clipData, flags = View.DRAG_FLAG_GLOBAL))
            })
        },
    contentAlignment = Alignment.Center
) {
    Text(text = "長押し！")
}
```

## 受信側
まずはドラッグアンドドロップの受信コールバックを用意します。  
ドラッグアンドドロップの操作が開始した、領域の中に入った、出た、ドラッグアンドドロップが終了した。等を知ることが出来ます。  

ドラッグアンドドロップで投げ込まれたときのコールバックは必須で、残りの開始とか終了とかは自由に。  
今回は`UI`側に反映させたいので、コールバックで受け取ることにします。

```kotlin
val isProgressDragAndDrop = remember { mutableStateOf(false) }
val callback = remember {
    object : DragAndDropTarget {
        override fun onDrop(event: DragAndDropEvent): Boolean {
            // TODO この後すぐ！
            return true
        }
        override fun onStarted(event: DragAndDropEvent) {
            super.onStarted(event)
            isProgressDragAndDrop.value = true
        }
        override fun onEnded(event: DragAndDropEvent) {
            super.onEnded(event)
            isProgressDragAndDrop.value = false
        }
    }
}
```

次に、ドラッグアンドドロップを受信したいコンポーネントの`Modifier`で、`dragAndDropTarget`を呼び出して、受け取ることを示します。  
引数ですが、受け取れるデータの種類（`MIME-Type`とか見れる）と、さっき作ったコールバックです。

```kotlin
Box(
    modifier = Modifier
        .size(200.dp)
        .border(1.dp, MaterialTheme.colorScheme.primary)
        .background(
            // ドラッグアンドドロップ操作中はコンテナの背景色を変化
            color = if (isProgressDragAndDrop.value) {
                MaterialTheme.colorScheme.primary.copy(0.5f)
            } else {
                Color.Transparent
            }
        )
        .dragAndDropTarget(
            shouldStartDragAndDrop = { event ->
                // 受け取れる種類。とりあえずテキスト
                event
                    .mimeTypes()
                    .contains(ClipDescription.MIMETYPE_TEXT_PLAIN)
            },
            target = callback
        ),
    contentAlignment = Alignment.Center
) {
    Text(text = "ここに持ってくる")
}
```

最後に、ドラッグアンドドロップで投げ込まれたデータのパースをします。  
適当に、最初の`ClipData`を取り出して、テキストとして表示するようにしてみます。

`ClipData`の詳細（`MIME-Type`とかは）`ClipDescription`に入っています。  
マルチプラットフォームを意識しているのか、`toAndroidDragEvent()`で取り出す必要があります。

```kotlin
val receiveText = remember { mutableStateOf("") }
val isProgressDragAndDrop = remember { mutableStateOf(false) }
val callback = remember {
    object : DragAndDropTarget {
        override fun onDrop(event: DragAndDropEvent): Boolean {
            val androidEvent = event.toAndroidDragEvent()
            // 最初のデータを取り出します
            val mimeType = androidEvent.clipDescription.getMimeType(0)
            val text = androidEvent.clipData.getItemAt(0).text
            receiveText.value = """
                受信したデータ
                MIME-Type: $mimeType
                text: $text
            """.trimIndent()
            return true
        }
        override fun onStarted(event: DragAndDropEvent) {
            super.onStarted(event)
            isProgressDragAndDrop.value = true
        }
        override fun onEnded(event: DragAndDropEvent) {
            super.onEnded(event)
            isProgressDragAndDrop.value = false
        }
    }
}
```

## 使ってみる
テキストボックスに適当に文字を入れて、「長押し！」を押すとドラッグアンドドロップが始まって、  
それと同時に、受信先のコンポーネントの背景色が変化して、受信先で指を離すと中身が表示されるはずです。どうだろ？？？

![Imgur](https://imgur.com/ALZOTq8.png)

<video src="https://github.com/takusan23/JetpackComposeFileDragAndDrop/assets/32033405/50cdbf7e-4160-4362-9985-9daf61f5be54" width="300" controls></video>

また、アプリを超えても利用できることがこれで分かるはず。  
おんなじアプリを2つ作って、アプリを超えてドラッグアンドドロップしてみましたが、これもちゃんと動きます。

![Imgur](https://imgur.com/8lhhBtR.png)

<video src="https://github.com/takusan23/JetpackComposeFileDragAndDrop/assets/32033405/4a8230a9-fab2-464e-a82b-263b872276ce" width="300" controls></video>

**もちろん**、ドラッグアンドドロップに対応したアプリへの送信、受信も出来ます。  

![Imgur](https://imgur.com/hae1Uvx.png)

<video src="https://github.com/takusan23/JetpackComposeFileDragAndDrop/assets/32033405/00109db2-b7ba-4490-9a7d-0d8282d3b195" width="300" controls></video>

## Android 14 要素どこ？？？？

https://9to5google.com/2023/05/19/android-14-drag-and-drop/

`iOS`にはすでにあったそうですが、`Android`にも来ました。  
ドラッグアンドドロップでアプリを超えたい場合、マルチウィンドウ（画面分割）する必要がなくなりました。  

ドラッグアンドドロップ中でも、その指を離さなければ、別の指でホーム画面に戻って別アプリを起動したり、アプリを切り替えたり出来るようになりました。  
そしてドラッグアンドドロップ中の指を離せばそのアプリに貼り付けられます。  

画面分割するほど画面が大きくない場合に便利そう。  
もちろんコード上でなにかする必要はありません。

![Imgur](https://imgur.com/1vr6SnF.png)

<video src="https://github.com/takusan23/JetpackComposeFileDragAndDrop/assets/32033405/5d3c28cd-0757-49d9-afa8-c5b1ecda84bf" width="300" controls></video>

# 画像もやり取りしたい
画像を入れる場合、`ClipData`へ画像は入れられず、バイナリを共有するための仕組みを使い、`Uri`を発行してもらい、その`Uri`を`ClipData`へ入れる必要があります。  
画像のファイルパスを入れれば良いとか、そういう話ではないのでかなり面倒くさい。

大雑把にこんな感じ。  
`Android`の`Intent`のサイズ上限が出来たあたり（私は知らない）で、この`FileProvider`の知見が結構あるので助かる。。。

![Imgur](https://imgur.com/2KvoFzl.png)

## FileProvider
https://developer.android.com/reference/androidx/core/content/FileProvider

アプリの固有ストレージ内のファイル（`Context#getExternalFileDir()`内のファイルとか）を`Uri`を経由して外部へ公開できるやつ。  
`ContentProvider`をいい感じに実装してくれたものになります。ので、頑張れば`ContentProvider`でも同じことが出来るはず？？（何もわからない）

## データ送信側

- `FileProvider`が存在することを`AndroidManifest.xml`に書く
- 画像とかのバイナリデータを、`Context#getExternalFileDir()`とか`Context#getFilesDir()`に保存する
    - `getExternalFileDir`は`/sdcard/Android/data/{アプリケーションID}`
        - こっちは、パソコンに繋いだときにエクスプローラーからアクセスできちゃいます
        - `Android Studio`の`Device Explorer`機能でも
        - あと`Android`標準ファイラー（`com.android.documentsui`）でも見れます
            - `Files by Google`のことではありません
    - `getFilesDir`は`/data/data/{アプリケーションID}`
        - こっちはパソコンに繋いでも見れません
        - デバッグビルド中であれば見れるかも？
        - それ以外の場合は`root`を取らない限り見れません
- そのファイルパスを`FileProvider`へ登録する
    - と、`Uri`がもらえる
- その`Uri`を`ClipData`に入れる
- ドラッグアンドドロップする

## データ受信側

- `ClipData`から`Uri`を取り出します
- `ActivityCompat.requestDragAndDropPermissions`を呼び出します
    - これを呼び出さないと、`Uri`へアクセスできません
- これで`Uri`が使えるようになります
- 後は画像表示で使えばおけ。`Coil`とか`Glide`に`Uri`を渡せば表示できるのでは無いでしょうか！？！？
    - 今回はライブラリ入れるまでもないので、自分で`BitmapFactory`で`Uri`から`Bitmap`を作ります...
    - 使えるなら画像読み込みライブラリ（`Coil`、`Glide`を使うべきです）。面倒事を全部やってくれるので他のことに集中できます。

# 画像のドラッグアンドドロップを作る
ちなみに、画像とか言っていますが別に画像じゃなくても任意のバイナリをやり取りできるはず。  

## 画像を送る側
送る側は`FileProvider`の用意が必要なので面倒。

### FileProvider を作る
まずは`res/xml`の中に、`file_path.xml`を作ります。  
多分名前は何でもいいんですけど、ドキュメント通りに行こうと思います。

![Imgur](https://imgur.com/hs9ORkI.png)

中身です。  
`<external-files-path`は`Context#getExternalFileDir()`の中にあるファイルを共有するためですね。  
`Context#getFilesDir()`の場合は`<files-path`にする必要があります。

https://developer.android.com/reference/androidx/core/content/FileProvider

```xml
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-files-path name="images" path="images/"/>
</paths>
```

次に、`FileProvider`を継承したクラスを作ります。  
コンストラクタの引数はさっき作った`xml`です。

```kotlin
import androidx.core.content.FileProvider

class DragAndDropFileProvider : FileProvider(R.xml.file_paths)
```

最後に、`AndroidManifest`に`FileProvider`を登録して`FileProvider 編`は終了。

```xml
<provider
    android:name=".DragAndDropFileProvider"
    android:authorities="${applicationId}.provider"
    android:exported="false"
    android:grantUriPermissions="true">
    <meta-data
        android:name="android.support.FILE_PROVIDER_PATHS"
        android:resource="@xml/file_paths" />
</provider>
```

### 画像の用意と送信側のレイアウトを作る
レイアウトを作ります。  

あと、画像を用意するのが面倒なので、自身のアプリのアイコンを`Bitmap`で取って、ファイルに保存することにしようと思います。  
自身のアイコン画像の取得はこんな感じです。

```kotlin
@Composable
private fun ImageDragAndDropSendContainer(modifier: Modifier = Modifier) {
    val context = LocalContext.current

    // 自分のアプリのアイコン
    val bitmap = remember { mutableStateOf<Bitmap?>(null) }
    LaunchedEffect(key1 = Unit) {
        // Bitmap を取り出す
        val iconDrawable = context.packageManager.getApplicationIcon(context.packageName)
        bitmap.value = iconDrawable.toBitmap()
    }

    OutlinedCard(modifier = modifier) {
        Column(modifier = Modifier.padding(10.dp)) {

            Text(text = "画像ドラッグアンドドロップ 送信側")

            // 画像を表示、ドラッグアンドドロップも兼ねて
            if (bitmap.value != null) {
                Image(
                    modifier = Modifier,
                    bitmap = bitmap.value!!.asImageBitmap(),
                    contentDescription = null
                )
            }
        }
    }
}
```

`MainScreen()`に設置するのも忘れないでね。  

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen() {
    Scaffold(
        topBar = {
            TopAppBar(title = { Text(text = "ドラッグアンドドロップ") })
        }
    ) { paddingValues ->

        Column(
            modifier = Modifier
                .padding(paddingValues)
                .verticalScroll(rememberScrollState()) // スクロールしたい
        ) {

            // 省略...

            HorizontalDivider()

            // 今作ったやつ
            ImageDragAndDropSendContainer(
                modifier = Modifier
                    .padding(10.dp)
                    .fillMaxWidth()
            )
        }
    }
}
```

どうでしょう？

![Imgur](https://imgur.com/NrKULwU.png)

### Uri を取得する
次は`Bitmap`を`getExternalFileDir`に保存して、`Uri`を取得します。  
先述のとおり、`getExternalFileDir`は、見ようと思えば見れるフォルダなので、もしまずいようなら`getFilesDir`を選んでください。（`xml`も直してね）

`Bitmap`の保存先を`getExternalFileDir`の中に作ります。  
`/images`フォルダを先に作ってますが、これは`file_paths.xml`で`path=""`を`images`にしたからですね。

`getUriForFile`で`Uri`が出来ます。エラーの場合は例外が投げられます。

```kotlin
// 自分のアプリのアイコン
val bitmap = remember { mutableStateOf<Bitmap?>(null) }
// 共有で使える Uri
val shareUri = remember { mutableStateOf<Uri?>(null) }

LaunchedEffect(key1 = Unit) {
    // Bitmap を取り出す
    val iconDrawable = context.packageManager.getApplicationIcon(context.packageName)
    bitmap.value = iconDrawable.toBitmap()

    // ファイル getExternalFilesDir の中に作って保存する
    // images フォルダの images は、 file_paths.xml の path="" が images だからです。
    val imageFolder = context.getExternalFilesDir(null)!!.resolve("images").apply { mkdir() }
    val imageFile = imageFolder.resolve("${System.currentTimeMillis()}.png").apply { createNewFile() }
    imageFile.outputStream().use { outputStream ->
        bitmap.value!!.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
    }

    // FileProvider に登録して Uri を取得
    shareUri.value = FileProvider.getUriForFile(context, "${context.packageName}.provider", imageFile)
    // 生成される Uri はこんな感じ
    // content://io.github.takusan23.jetpackcomposefiledraganddrop.provider/images/1716833782696.png
}
```

### 画像のドラッグアンドドロップをする
テキストと同じ用に`dragAndDropSource`を呼び出して、ドラッグアンドドロップで掴めるようにします。  
テキストとは違い、`newUri`を使って、`Uri`を入れた`ClipData`を作ります。`MIME-Type`とかは`Uri`を使って`MediaStore`に問い合わせて自動でセットしてくれるらしい。  

それから、`flags`ですが、`Uri`に読み取り権限を付与するための`View.DRAG_FLAG_GLOBAL_URI_READ`フラグを立てておく必要があります。  
`FileProvider`のドキュメントには`Intent`の場合しか書かれてませんが、`ClipData`の場合も権限を付与しないと、ドラッグアンドドロップ先で読み取りできません。

他にも書き込み権限とかあります。`View`のドキュメント参照。  
`View`のドキュメントクソ重いので開くときは注意→ https://developer.android.com/reference/android/view/View#DRAG_FLAG_GLOBAL_URI_READ

```kotlin
Image(
    modifier = Modifier.dragAndDropSource {
        detectTapGestures(onLongPress = {
            // ClipData へ Uri を
            val nonnullUri = shareUri.value ?: return@detectTapGestures
            val clipData = ClipData.newUri(context.contentResolver, "image_uri", nonnullUri)
            startTransfer(
                DragAndDropTransferData(
                    clipData = clipData,
                    flags = View.DRAG_FLAG_GLOBAL or View.DRAG_FLAG_GLOBAL_URI_READ // Uri 読み取り可能ですよのフラグを or で立てておく。ビット演算
                )
            )
        })
    },
    bitmap = bitmap.value!!.asImageBitmap(),
    contentDescription = null
)
```

これで、送信側は完成のはずです。  
`Google Keep`とかにドラッグアンドドロップ出来るはず！！！！！できた！？！？！？！？

![Imgur](https://imgur.com/c2KPHoY.png)

![Imgur](https://imgur.com/45BQipo.png)

<video src="https://github.com/takusan23/JetpackComposeFileDragAndDrop/assets/32033405/2b26cbe8-ac76-437c-8507-513483bd0869" width="300" controls></video>

## 画像を受け取る側
こっちはいくらか簡単です。  
受け取る側くらいは考えてもいいんじゃないでしょうか？

`mimeTypes()`のチェックは、画像用に直す必要があります。これは画像以外のバイナリ（動画とか）の場合もそうですが。  
今回は画像だけなので、`MIME-Type`が`image/`で始まっているかを見ています。

`Uri`を受け取った後、`ActivityCompat.requestDragAndDropPermissions`を呼び出す必要があります。  
これを呼び出さないと、`Uri`を使って画像へアクセスしようとしても、ブロックされます。`Uri`が用済みになったら、`release()`してあげましょう。

`requestDragAndDropPermissions`した後は`Uri`を使ってアクセス出来るようになるので`context.contentResolver.openInputStream`でデータを読み出して、  
`Bitmap`にしています。先述のとおり、`Glide`や`Coil`のライブラリが使えるなら使うべきです。今回はこのためだけにわざわざ入れないですが。。。

```kotlin
@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun ImageDragAndDropReceiveContainer(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // 受け取った画像
    val receiveBitmap = remember { mutableStateOf<Bitmap?>(null) }
    val isProgressDragAndDrop = remember { mutableStateOf(false) }
    val callback = remember {
        object : DragAndDropTarget {
            override fun onDrop(event: DragAndDropEvent): Boolean {
                val androidEvent = event.toAndroidDragEvent()

                // DragAndDropPermission を作らないと、Uri を使ったアクセスが出来ません
                val dragAndDropPermissions = ActivityCompat.requestDragAndDropPermissions(context as Activity, androidEvent)
                // 最初のデータを取り出します
                val receiveUri = androidEvent.clipData.getItemAt(0).uri

                // UI 処理なので一応コルーチンで
                scope.launch(Dispatchers.IO) {
                    // Uri から Bitmap を作る
                    // Glide や Coil が使えるなら使うべきです
                    receiveBitmap.value = context.contentResolver.openInputStream(receiveUri)
                        ?.use { inputStream -> BitmapFactory.decodeStream(inputStream) }
                    // とじる
                    dragAndDropPermissions?.release()
                }
                return true
            }

            override fun onStarted(event: DragAndDropEvent) {
                super.onStarted(event)
                isProgressDragAndDrop.value = true
            }

            override fun onEnded(event: DragAndDropEvent) {
                super.onEnded(event)
                isProgressDragAndDrop.value = false
            }
        }
    }

    OutlinedCard(modifier = modifier) {
        Column(modifier = Modifier.padding(10.dp)) {

            Text(text = "画像ドラッグアンドドロップ 受信側")

            // ドラッグアンドドロップを待ち受ける
            Box(
                modifier = Modifier
                    .size(300.dp)
                    .border(1.dp, MaterialTheme.colorScheme.primary)
                    .background(
                        // ドラッグアンドドロップ操作中はコンテナの背景色を変化
                        color = if (isProgressDragAndDrop.value) {
                            MaterialTheme.colorScheme.primary.copy(0.5f)
                        } else {
                            Color.Transparent
                        }
                    )
                    .dragAndDropTarget(
                        shouldStartDragAndDrop = { event ->
                            // 受け取れる種類。とりあえず
                            val supportedMimeTypePrefix = "image/"
                            event
                                .mimeTypes()
                                .all { receiveMimeType -> receiveMimeType.startsWith(supportedMimeTypePrefix) }
                        },
                        target = callback
                    )
            ) {
                // 画像表示
                if (receiveBitmap.value != null) {
                    Image(
                        bitmap = receiveBitmap.value!!.asImageBitmap(),
                        contentDescription = null
                    )
                }
            }
        }
    }
}
```

これを`MainScreen()`に置いて完成！

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen() {
    Scaffold(
        topBar = {
            TopAppBar(title = { Text(text = "ドラッグアンドドロップ") })
        }
    ) { paddingValues ->

        Column(
            modifier = Modifier
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
        ) {

            // 省略...

            ImageDragAndDropSendContainer(
                modifier = Modifier
                    .padding(10.dp)
                    .fillMaxWidth()
            )

            ImageDragAndDropReceiveContainer(
                modifier = Modifier
                    .padding(10.dp)
                    .fillMaxWidth()
            )
        }
    }
}
```

どうだろ？？？  
画像も受け取れるアプリが出来ましたか？？？

![Imgur](https://imgur.com/ZdZTins.png)

<video src="https://github.com/takusan23/JetpackComposeFileDragAndDrop/assets/32033405/f4aaf49d-e561-4302-abb6-c8b626ec6275" width="300" controls></video>

# そーすこーど
https://github.com/takusan23/JetpackComposeFileDragAndDrop

# 参考にしました
ありざいす

- https://developer.android.com/training/secure-file-sharing
- https://azunobu.hatenablog.com/entry/2019/06/27/120908
- https://funnelbit.hatenablog.com/entry/2016/04/01/092611