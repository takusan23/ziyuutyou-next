---
title: OkHttpとCoroutineで分割ダウンロードを実装する
created_at: 2021-03-02
tags:
- Android
- Kotlin
- Coroutine
- OkHtpp
---

高校生ブランドがあと数日でなくなりますね

# 本題
ファイルダウンロードが遅いのでいくつかに分けて並列ダウンロードしたい  
ただでさえ速度が遅いんだからさあ

## 分割ダウンロードの調査
https://developer.mozilla.org/ja/docs/Web/HTTP/Range_requests

指定した範囲（バイト）をリクエストできるらしい  
ダウンローダーによくある一時停止からの再開機能はこれを使ってるそう  
他のブラウザはしらんけど、`Chrome`の`videoタグ`でシークバーを動かすとそのたびにこの部分リクエストを飛ばしてるっぽい

リクエストヘッダに、

| name  | value      |
|-------|------------|
| Range | bytes=0-50 |

と入れると0から50までのデータが返ってくるそう。  
ちなみに次のデータ(例えば50バイト分)をリクエストする際は`50`ではなく`51`からにする必要がある？  

| name  | value        |
|-------|--------------|
| Range | bytes=51-100 |

https://triple-underscore.github.io/RFC7233-ja.html#p.byte-ranges-specifier  

ちなみにステータスコードは`206`になる

# 使うもの
## OkHttp
HTTPクライアント。WebAPI叩いたり色んな所で使ってる。  
Android 5以上対応

## Coroutine
難しい。非同期処理(アプリの画面を止めない)を書くときに幸せになれるやつ。  
難しいんで例をあげると

- コールバック地獄を脱却（たとえなので動きませんが）
    - `lifecycleScope.launch`、省略時はUIスレッドになります
```kotlin
// 地獄
getLocation { location ->
    getWeatherId(location) { id ->
        getWeather(id) { weather ->
            runOnUiThread {
                // UI Thread
            }
        }
    }
}

// 天国
lifecycleScope.launch {
    val location = suspendGetLocation()
    val weatherId = suspendGetWeatherId(location)
    val weather = suspendGetWeather(weatherId)
    withContext(Dispatchers.Main) {
        // UI Thread
    }
}

fun getLocation(callback: (String) -> Unit) {
}
fun getWeatherId(location: String, callback: (String) -> Unit) {
}
fun getWeather(id: String, callback: (String) -> Unit) {
}
suspend fun suspendGetLocation() = withContext(Dispatchers.IO) {
    "tokyo"
}
suspend fun suspendGetWeatherId(location: String) = withContext(Dispatchers.IO) {
    "tokyo"
}
suspend fun suspendGetWeather(id: String) = withContext(Dispatchers.IO) {
}
```

- キャンセルもできる

```kotlin
val job = lifecycleScope.launch { 
    while (true){
        delay(1000)
        Toast.makeText(this@MainActivity, "閉じられませんよ～", Toast.LENGTH_SHORT).show()
    }
}
lifecycleScope.launch { 
    delay(5000)
    job.cancel() // やめにする
}
```

- コルーチン内の例外をキャッチ

```kotlin
val errorHandler = CoroutineExceptionHandler { coroutineContext, throwable ->
    throwable.printStackTrace()
    runOnUiThread {
        Toast.makeText(this, "問題が発生しました。${throwable}", Toast.LENGTH_SHORT).show()
    }
}
lifecycleScope.launch(errorHandler + Dispatchers.Main) {
    // もし通信エラーが起きてもCoroutineExceptionHandlerが拾ってくれる？
    val videoFile = getLargeFile()
}

private suspend fun getLargeFile() = withContext(Dispatchers.IO) {
}
```

そして今回使う予定の、`asunc { }`  

- すべて直列にする（おそい）

```kotlin
lifecycleScope.launch {
    val gameCategoryTop = getVideoRankingTopItem("game")
    val vocaloidCategoryTop = getVideoRankingTopItem("vocaloid")
    val animeCategoryTop = getVideoRankingTopItem("anime")
    val cookCategoryTop = getVideoRankingTopItem("cook")
    textView.text = """
        ゲームランキング一位:${gameCategoryTop}
        ボカロランキング一位:${vocaloidCategoryTop}
        アニメランキング一位:${animeCategoryTop}
        料理ランキング一位:${cookCategoryTop}
        """.trimIndent()
}

private suspend fun getVideoRankingTopItem(categoryId: String) = withContext(Dispatchers.IO) {
    return@withContext ""
}
```

ので、並列にリクエストしたいですよね？そこで使うのが`async { }`です。  

```kotlin
lifecycleScope.launch {
    // すぐに実行される
    val gameCategoryTop = async { getVideoRankingTopItem("game") }
    val vocaloidCategoryTop = async { getVideoRankingTopItem("vocaloid") }
    val animeCategoryTop = async { getVideoRankingTopItem("anime") }
    val cookCategoryTop = async { getVideoRankingTopItem("cook") }

    // 並列で実行した結果を待つ
    gameCategoryTop.await()
    vocaloidCategoryTop.await()
    animeCategoryTop.await()
    cookCategoryTop.await()
    
    textView.text = """
        ゲームランキング一位:${gameCategoryTop}
        ボカロランキング一位:${vocaloidCategoryTop}
        アニメランキング一位:${animeCategoryTop}
        料理ランキング一位:${cookCategoryTop}
        """.trimIndent()
}

private suspend fun getVideoRankingTopItem(categoryId: String) = withContext(Dispatchers.IO) {
    return@withContext ""
}
```

また、配列を使うともう少しきれいに書くことができます。  

```kotlin
lifecycleScope.launch {
    val categoryList = arrayListOf("game", "vocaloid", "anime", "cook")
    val topItemList = categoryList
        .map { id -> async { getVideoRankingTopItem(id) } } // すぐに実行される
        .map { deferred -> deferred.await() } // すべての結果を待つ
    textView.text = """
        ゲームランキング一位:${topItemList[0]}
        ボカロランキング一位:${topItemList[1]}
        アニメランキング一位:${topItemList[2]}
        料理ランキング一位:${topItemList[3]}
        """.trimIndent()
}

private suspend fun getVideoRankingTopItem(categoryId: String) = withContext(Dispatchers.IO) {
    return@withContext ""
}
```

他のプログラミング言語では、関数を作る際に`async`を使うと思うんですが、  
`KotlinのCoroutine`では呼ぶ際に`async { }`を使うことになります。(ので`async/await`のことは忘れたほうがわかるかも)

# 本編
話題が逸れ過ぎた。

## 環境

Kotlinで行きます

```kotlin
mutableMapOf(
    "Android Studio" to "4.1.1",
    "端末" to "Pixel 3 XL", // エミュレーターだとなんか失敗するので実機を強く推奨
)
```

ダウンロードしたいファイルのURLを確保しておいてね

## 仕様
保存先はユーザーに選んでもらう形式を取る。  
本当はダウンロードディレクトリに自動で入れたいんだけど、`Android 10`以降しか提供されていない  
(すいませんこれは嘘でAndroid 9以前でもできるんだけど実装方法が全然違うのでめんどい)  

私がやりたいのはファイルダウンロードであって、  
Androidの`MediaStore`ではない。やりだしたらもう収集がつかない。  
(Androidは生（意味深）ファイルパスでのファイルアクセスが一部を除き禁止されているため)  
```kotlin
File("sdcard/Download") // Android 10以降禁止
```

ダウンロード処理は`ViewModel`に書くとします

## ライブラリ
`OkHttp`と`Coroutine`(とそれ関係)を入れます。

`app/build.gradle`に書き足す。ViewBindingも有効にしてください。

```gradle
dependencies {
    // コルーチン
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.4.1'
    // コルーチンをActivityで使いやすくするやつ
    implementation "androidx.lifecycle:lifecycle-runtime-ktx:2.3.0"
    // OkHttp
    implementation("com.squareup.okhttp3:okhttp:4.9.0")
    // ViewModel
    implementation "androidx.lifecycle:lifecycle-viewmodel-ktx:2.3.0"
    // LiveData
    implementation "androidx.lifecycle:lifecycle-livedata-ktx:2.3.0"
    // Activity Result API
    implementation "androidx.activity:activity-ktx:1.2.0"
    implementation "androidx.fragment:fragment-ktx:1.3.0"

    // 省略
}
```

## AndroidManifest.xml

インターネット権限が必要です。（よく書き忘れる）

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

## activity_main.xml

開始ボタンとプログレスバーをおきます

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <Button
        android:id="@+id/start_button"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Start"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <ProgressBar
        android:id="@+id/progress_bar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_marginStart="16dp"
        android:layout_marginEnd="16dp"
        android:max="100"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@+id/start_button" />
</androidx.constraintlayout.widget.ConstraintLayout>
```

## MainActivity.kt
とりあえず`ViewBinding`を使えるようにしておいてください

```kotlin
class MainActivity : AppCompatActivity() {

    private val viewBinding by lazy { ActivityMainBinding.inflate(layoutInflater) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(viewBinding.root)
    }
}
```

## MainActivityViewModel.kt
を作成して、コピペします。  
しばらくはこのクラスにプログラムを書いていきます

```kotlin
/**
 * [MainActivity]からUI以外のコードを持ってきた。
 * */
class MainActivityViewModel(application: Application) : AndroidViewModel(application) {

    private val context = application.applicationContext

}
```

### ファイルのサイズを取得する
これからファイルをダウンロードするわけですが、分割してダウンロードするにはまず元のファイルサイズを求めておく必要があります。

ここでほしいのはレスポンスヘッダなので、レスポンスボディをリクエストしない`HEAD`リクエストを飛ばします。

```kotlin
private val okHttpClient = OkHttpClient()
/** HEADリクエストを送信する */
private suspend fun getResponseHeader(url: String) = withContext(Dispatchers.IO) {
    // リクエスト
    val request = Request.Builder().apply {
        url(url)
        head() // bodyいらん
    }.build()
    return@withContext okHttpClient.newCall(request).execute()
}
```

### 分割する関数
長ったらしい。

```kotlin
/**
 * 分割して配列にして返す
 * 
 * @param totalBytes 合計サイズ
 * @param splitCount 分割数
 * */
private fun splitByteList(totalBytes: Long, splitCount: Int): ArrayList<Pair<Long, Long>> {
    // あまりが出ないほうがおかしいので余りを出す
    val amari = totalBytes % splitCount
    // あまり分を引いて一個のリクエストでのバイト数を決定
    val splitByte = (totalBytes - amari) / splitCount
    // 配列にして返す
    val byteList = arrayListOf<Pair<Long, Long>>()
    // 2回目のループなら1回目の値が入ってる。前の値
    var prevByte = 0L
    while (true) {
        // ピッタリ分けたいので
        if (totalBytes >= prevByte) {
            /***
             * 最後余分に取得しないように。
             * true(splitByte足しても足りない)ならsplitByteを足して、falseならtotalByteを渡して終了
             * */
            val toByte =
                if (totalBytes > (prevByte + splitByte)) prevByte + splitByte else totalBytes
            byteList.add(Pair(prevByte, toByte))
            prevByte += splitByte + 1 // 1足して次のバイトからリクエストする
        } else break
    }
    return byteList
}
```

ちなみにこの関数の返り値はこんな感じになります

```kotlin
// 685MB
viewModel.splitByteList(719200584, 5)
// return
[
Pair(0, 143840116),
Pair(143840117, 287680233),
Pair(287680234, 431520350),
Pair(431520351, 575360467),
Pair(575360468, 719200584),
]
```


### ファイルをダウンロードする
今回は`HEAD`ではなく`GET`リクエストですよ！  

と、その前にダウンロードした分割ファイルを持っておくわけにもいかないので、一旦ファイルに書き込みます。その保存先フォルダを先に作っておきます

```kotlin
/** 一時保存先 */
private val tmpFolder = File(context.externalCacheDir, "split_file").apply { mkdir() }
```

そしたらダウンロードする関数を書きましょう。拡張子にファイルの順番を付けてます

```kotlin
/**
 * 範囲リクエストを送信する
 *
 * @param fromByte こっから
 * @param toByte ここまで
 * @param count 何個目か
 * @param fileName ファイル名
 * */
private suspend fun requestFile(url: String, fromByte: Long, toByte: Long, count: Int,fileName: String) = withContext(Dispatchers.IO) {
    // リクエスト
    val request = Request.Builder().apply {
        url(url)
        addHeader("Range", "bytes=${fromByte}-${toByte}")
        get()
    }.build()
    val response = okHttpClient.newCall(request).execute()
    val inputStream = response.body?.byteStream()
    // ファイル作成。拡張子に順番を入れる
    val splitFile = File(tmpFolder, "${fileName}.${count}").apply { createNewFile() }
    val splitFileOutputStream = splitFile.outputStream()
    // 書き込む
    val buffer = ByteArray(1024 * 1024)
    while (true) {
        val read = inputStream?.read(buffer)
        if (read == -1 || read == null) {
            // 終わりなら無限ループ抜け
            break
        }
        splitFileOutputStream.write(buffer, 0, read)
    }
    inputStream?.close()
    splitFileOutputStream.close()
}
```

### ファイルを結合する関数

結合したファイル(`File`)を返してあげてください。後で使う  

```kotlin
/**
 * すべてのファイルを一つにまとめ
 * @param fileName ファイル名
 * @return 結合ファイル
 * */
private suspend fun multipleFileToOneFile(fileName: String) = withContext(Dispatchers.Default) {
    // 最終的なファイル
    val resultFile = File(context.getExternalFilesDir(null), fileName).apply { createNewFile() }
    tmpFolder.listFiles()
        ?.sortedBy { file -> file.extension } // 並び替え。男女男男女男女
        ?.map { file -> file.readBytes() } // readBytes()は2GBまでしか対応してない(さすがにないやろ)
        ?.forEach { bytes -> resultFile.appendBytes(bytes) }
    // フォルダを消す
    tmpFolder.deleteRecursively()
    // ファイルを返す
    return@withContext resultFile
}
```

### ユーザーの選んだ保存先に保存する
まだユーザーに保存先を選んでもらう処理は書いてませんが。保存先を選ぶとファイルパス、、、ではなく`Uri`が返ってくるのでこれを使います。  


```kotlin
/**
 * ファイルをUriの場所に書き込んで、元のファイル（[resultFile]）を削除する
 *
 * @param resultFile 完成したファイル
 * @param uri Activity Result APIでもらえるUri
 * */
private suspend fun moveFile(resultFile: File, uri: Uri) = withContext(Dispatchers.IO) {
    val contentResolver = context.contentResolver
    // outputStreamをもらう
    val outputStream = contentResolver.openOutputStream(uri)
    outputStream?.write(resultFile.readBytes()) // readBytes()は大きいファイルでは使うべきではない
    outputStream?.close()
    // 元のファイルを消す
    resultFile.deleteRecursively()
}
```

### Activityから呼ぶ関数を書く

`start`関数を書いて、Activityからはこの関数を呼ぶことにします

```kotlin
/**
 * ファイルダウンロードを開始する
 * @param fileName ファイル名
 * @param uri 保存先
 * @param url URL
 * */
fun start(url: String, uri: Uri, fileName: String) {
    viewModelScope.launch {
        val responseHeader = getResponseHeader(url)
        // 合計サイズ
        val contentLength = responseHeader.headers["Content-Length"]!!.toLong()
        // 分割。とりあえず5分割
        val splitList = splitByteList(contentLength, 5)
        // リクエスト
        splitList
            .mapIndexed { index, pair ->
                // asyncで並列実行
                async { requestFile(url, pair.first, pair.second, index, fileName) }
            }.map { deferred ->
                // すべてのasyncを待つ
                deferred.await()
            }
        // ファイルを結合
        val resultFile = multipleFileToOneFile(fileName)
        // ファイルを移動させて完成
        moveFile(resultFile, uri)
        // おしまい
        Toast.makeText(context, "おわり", Toast.LENGTH_SHORT).show()
    }
}
```

### ここまでのコード

```kotlin
/**
 * [MainActivity]からUI以外のコードを持ってきた。
 * */
class MainActivityViewModel(application: Application) : AndroidViewModel(application) {

    private val context = application.applicationContext

    /** シングルトンにすべき */
    private val okHttpClient = OkHttpClient()

    /** 一時保存先 */
    private val tmpFolder = File(context.externalCacheDir, "split_file").apply { mkdir() }

    /**
     * ファイルダウンロードを開始する
     * @param fileName ファイル名
     * @param uri 保存先
     * @param url URL
     * */
    fun start(url: String, uri: Uri, fileName: String) {
        viewModelScope.launch {
            val responseHeader = getResponseHeader(url)
            // 合計サイズ
            val contentLength = responseHeader.headers["Content-Length"]!!.toLong()
            // 分割。とりあえず5分割
            val splitList = splitByteList(contentLength, 5)
            // リクエスト
            splitList
                .mapIndexed { index, pair ->
                    // asyncで並列実行
                    async { requestFile(url, pair.first, pair.second, index, fileName) }
                }.map { deferred ->
                    // すべてのasyncを待つ
                    deferred.await()
                }
            // ファイルを結合
            val resultFile = multipleFileToOneFile(fileName)
            // ファイルを移動させて完成
            moveFile(resultFile, uri)
            // おしまい
            println("おわり")
        }
    }


    /**
     * HEADリクエストを送信する
     * @param url URL
     * */
    private suspend fun getResponseHeader(url: String) = withContext(Dispatchers.IO) {
        // リクエスト
        val request = Request.Builder().apply {
            url(url)
            head() // bodyいらん
        }.build()
        return@withContext okHttpClient.newCall(request).execute()
    }

    /**
     * 分割して配列にして返す
     *
     * @param totalBytes 合計サイズ
     * @param splitCount 分割数
     * */
    private fun splitByteList(totalBytes: Long, splitCount: Int): ArrayList<Pair<Long, Long>> {
        // あまりが出ないほうがおかしいので余りを出す
        val amari = totalBytes % splitCount
        // あまり分を引いて一個のリクエストでのバイト数を決定
        val splitByte = (totalBytes - amari) / splitCount
        // 配列にして返す
        val byteList = arrayListOf<Pair<Long, Long>>()
        // 2回目のループなら1回目の値が入ってる。前の値
        var prevByte = 0L
        while (true) {
            // ピッタリ分けたいので
            if (totalBytes >= prevByte) {
                /***
                 * 最後余分に取得しないように。
                 * true(splitByte足しても足りない)ならsplitByteを足して、falseならtotalByteを渡して終了
                 * */
                val toByte =
                    if (totalBytes > (prevByte + splitByte)) prevByte + splitByte else totalBytes
                byteList.add(Pair(prevByte, toByte))
                prevByte += splitByte + 1 // 1足して次のバイトからリクエストする
            } else break
        }
        return byteList
    }

    /**
     * 範囲リクエストを送信する
     *
     * @param fromByte こっから
     * @param toByte ここまでのバイト数を返す
     * @param count 何個目か
     * @param fileName ファイル名
     * */
    private suspend fun requestFile(url: String, fromByte: Long, toByte: Long, count: Int, fileName: String) = withContext(Dispatchers.IO) {
        // リクエスト
        val request = Request.Builder().apply {
            url(url)
            addHeader("Range", "bytes=${fromByte}-${toByte}")
            get()
        }.build()
        val response = okHttpClient.newCall(request).execute()
        val inputStream = response.body?.byteStream()
        // ファイル作成。拡張子に順番を入れる
        val splitFile = File(tmpFolder, "${fileName}.${count}").apply { createNewFile() }
        val splitFileOutputStream = splitFile.outputStream()
        // 書き込む
        val buffer = ByteArray(1024 * 1024)
        while (true) {
            val read = inputStream?.read(buffer)
            if (read == -1 || read == null) {
                // 終わりなら無限ループ抜けて高階関数よぶ
                break
            }
            splitFileOutputStream.write(buffer, 0, read)
        }
        inputStream?.close()
        splitFileOutputStream.close()
    }

    /**
     * すべてのファイルを一つにまとめて完成
     * @param fileName ファイル名
     * @return 結合ファイル
     * */
    private suspend fun multipleFileToOneFile(fileName: String) = withContext(Dispatchers.Default) {
        // 最終的なファイル
        val resultFile = File(context.getExternalFilesDir(null), fileName).apply { createNewFile() }
        tmpFolder.listFiles()
            ?.sortedBy { file -> file.extension } // 並び替え。男女男男女男女
            ?.map { file -> file.readBytes() } // readBytes()は2GBまでしか対応してない(さすがにないやろ)
            ?.forEach { bytes -> resultFile.appendBytes(bytes) }
        // フォルダを消す
        tmpFolder.deleteRecursively()
        // ファイルを返す
        return@withContext resultFile
    }

    /**
     * ファイルをUriの場所に書き込んで、元のファイル（[resultFile]）を削除する
     *
     * @param resultFile 完成したファイル
     * @param uri Activity Result APIでもらえるUri
     * */
    private suspend fun moveFile(resultFile: File, uri: Uri) = withContext(Dispatchers.IO) {
        val contentResolver = context.contentResolver
        // outputStreamをもらう
        val outputStream = contentResolver.openOutputStream(uri)
        outputStream?.write(resultFile.readBytes()) // readBytes()は大きいファイルでは使うべきではない
        outputStream?.close()
        // 元のファイルを消す
        resultFile.deleteRecursively()
    }

}
```

## MainActivity.kt

Storage Access Frameworkを開いてユーザーに保存先を選んでもらいます  
あと`ViewModel`も使えるようにしておいてね  
あとURLにはダウンロードしたいファイルのURLを入れておいてください。

```kotlin
class MainActivity : AppCompatActivity() {

    private val viewBinding by lazy { ActivityMainBinding.inflate(layoutInflater) }

    private val viewModel by viewModels<MainActivityViewModel>()

    /** URL */
    private val URL = ""

    /** ファイル名 */
    private val FILE_NAME = "download.mp4"

    /** Activity Result API コールバック */
    private val callback = registerForActivityResult(ActivityResultContracts.CreateDocument()) { uri ->
        if (uri != null) {
            // ViewModelに書いたダウンロード関数を呼ぶ
            viewModel.start(URL, uri, FILE_NAME)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(viewBinding.root)

        viewBinding.startButton.setOnClickListener {
            // 選ばせる
            callback.launch(FILE_NAME)
        }
    }
}
```

これでボタンを押して、保存先を選ぶとダウンロードが開始されるはずです。  
プログレスバーは動きませんが

## プログレスバーを動かす

変数を宣言して

```kotlin
/** 合計バイト */
private var totalByte = 0L

/** 書き込みが終わったバイト */
private var progressByte = 0L

/** 進捗LiveData */
private val _progressLiveData = MutableLiveData<Int>()

/** 外部に公開する進捗LiveData */
val progressLiveData: LiveData<Int> = _progressLiveData
```

start関数を少し書き足す

```kotlin
/**
 * ファイルダウンロードを開始する
 * @param fileName ファイル名
 * @param uri 保存先
 * @param url URL
 * */
fun start(url: String, uri: Uri, fileName: String) {
    totalByte = 0L
    progressByte = 0L
    viewModelScope.launch {
        val responseHeader = getResponseHeader(url)
        // 合計サイズ
        val contentLength = responseHeader.headers["Content-Length"]!!.toLong()
        totalByte = contentLength
        // 分割。とりあえず5分割
        val splitList = splitByteList(contentLength, 5)
        // リクエスト
        splitList
            .mapIndexed { index, pair ->
                // asyncで並列実行
                async { requestFile(url, pair.first, pair.second, index, fileName) }
            }.map { deferred ->
                // すべてのasyncを待つ
                deferred.await()
            }
        // ファイルを結合
        val resultFile = multipleFileToOneFile(fileName)
        // ファイルを移動させて完成
        moveFile(resultFile, uri)
        // おしまい
        _progressLiveData.postValue(100)
        println("おわり")
    }
}
```

`requestFile`関数に書き足す

```kotlin
/**
 * 範囲リクエストを送信する
 *
 * @param fromByte こっから
 * @param toByte ここまでのバイト数を返す
 * @param count 何個目か
 * @param fileName ファイル名
 * */
private suspend fun requestFile(url: String, fromByte: Long, toByte: Long, count: Int, fileName: String) = withContext(Dispatchers.IO) {
    // リクエスト
    val request = Request.Builder().apply {
        url(url)
        addHeader("Range", "bytes=${fromByte}-${toByte}")
        get()
    }.build()
    val response = okHttpClient.newCall(request).execute()
    val inputStream = response.body?.byteStream()
    // ファイル作成。拡張子に順番を入れる
    val splitFile = File(tmpFolder, "${fileName}.${count}").apply { createNewFile() }
    val splitFileOutputStream = splitFile.outputStream()
    // 書き込む
    val buffer = ByteArray(1024 * 1024)
    while (true) {
        val read = inputStream?.read(buffer)
        if (read == -1 || read == null) {
            // 終わりなら無限ループ抜けて高階関数よぶ
            break
        }
        splitFileOutputStream.write(buffer, 0, read)
        // 進捗
        progressByte += read
        val progress = ((progressByte / totalByte.toFloat()) * 100).toInt()
        // LiveData送信
        if (_progressLiveData.value != progress) {
            _progressLiveData.postValue(progress)
        }
    }
    inputStream?.close()
    splitFileOutputStream.close()
}
```


最後に`MainActivity`

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(viewBinding.root)
    viewBinding.startButton.setOnClickListener {
        // 選ばせる
        callback.launch(FILE_NAME)
    }
    // 進捗
    viewModel.progressLiveData.observe(this) { progress ->
        println(progress)
        viewBinding.progressBar.progress = progress
        if (progress == 100) {
            Toast.makeText(this, "おわり", Toast.LENGTH_SHORT).show()
        }
    }
}
```

これでプログレスバーも動くと思います。

# やってること
- ファイルのサイズを求める
- 分割数に合わせてバイト数を決定
- 並列ダウンロード。一旦保存
- 一旦保存したファイルを一つにまとめて保存
- UriからOutputStreamを取得して書き込む
- まとめたファイル、一旦保存したファイルを削除

# MediaStore.Download の例

まーじでAndroidのファイル操作どうにかならねえのこれ

```kotlin
/**
 * MediaStore.Downloadを利用してダウンロードフォルダに入れる
 * 
 * Android 10以降のみ対応
 * */
private fun insertFileToDownloadFolder(fileName: String): Uri? {
    val contentResolver = context.contentResolver
    val contentUri = MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
    val contentValues = ContentValues().apply {
        put(MediaStore.Downloads.DISPLAY_NAME, fileName)
    }
    // ダウンロードフォルダにデータを追加。Uriを受け取る
    val uri = contentResolver.insert(contentUri, contentValues)
    return uri
}
```

そして`start`関数を少し書き換える

```kotlin
/**
 * ファイルダウンロードを開始する
 * @param fileName ファイル名
 * @param url URL
 * */
fun start(url: String, fileName: String) {
    totalByte = 0L
    progressByte = 0L
    viewModelScope.launch {
        val responseHeader = getResponseHeader(url)
        // 合計サイズ
        val contentLength = responseHeader.headers["Content-Length"]!!.toLong()
        totalByte = contentLength
        // 分割。とりあえず5分割
        val splitList = splitByteList(contentLength, 5)
        // リクエスト
        splitList
            .mapIndexed { index, pair ->
                // asyncで並列実行
                async { requestFile(url, pair.first, pair.second, index, fileName) }
            }.map { deferred ->
                // すべてのasyncを待つ
                deferred.await()
            }
        // ファイルを結合
        val resultFile = multipleFileToOneFile(fileName)
        // ファイルを移動させて完成
        val uri = insertFileToDownloadFolder(fileName)
        if (uri != null) {
            moveFile(resultFile, uri)
            // おしまい
            _progressLiveData.postValue(100)
            println("おわり")
        }
    }
}
```

`MainActivity`の方も書き換えます

```kotlin
class MainActivity : AppCompatActivity() {

    private val viewBinding by lazy { ActivityMainBinding.inflate(layoutInflater) }

    private val viewModel by viewModels<MainActivityViewModel>()

    /** URL */
    private val URL = ""

    /** ファイル名 */
    private val FILE_NAME = "download.mp4"

    /** Activity Result API コールバック */
    private val callback = registerForActivityResult(ActivityResultContracts.CreateDocument()) { uri ->
        if (uri != null) {
            // ViewModelに書いたダウンロード関数を呼ぶ
            // viewModel.start(URL, FILE_NAME)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(viewBinding.root)

        viewBinding.startButton.setOnClickListener {
            // ダウンロードする
            // callback.launch(FILE_NAME)
            viewModel.start(URL, FILE_NAME)

        }

        // 進捗
        viewModel.progressLiveData.observe(this) { progress ->
            println(progress)
            viewBinding.progressBar.progress = progress
            if (progress == 100) {
                Toast.makeText(this, "おわり", Toast.LENGTH_SHORT).show()
            }
        }

    }
}
```

# おわりに
つかれた。ソースコード置いておきますね。  

https://github.com/takusan23/OkHttpRangeDownload