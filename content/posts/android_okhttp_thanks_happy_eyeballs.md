---
title: Happy Eyeballs を実装してくれた OkHttp チームに感謝
created_at: 2024-10-29
tags:
- Android
- OkHttp
---
`Pixel Watch 3`に朝起こしてもらってますが、起こしてくれない時があった！！  
どうしたんかなって見てみたら、**オーバーヒート**でシャットダウンしてたらしい。腕を怪我する前に守ってくれた模様、ありがと～～

![Imgur](https://imgur.com/HmChxf0.png)

![Imgur](https://imgur.com/1gVdCMF.png)

# 本題
`Android`では`HTTP`クライアントライブラリに`OkHttp`をよく使うのですが、**私の家の回線環境のせいなのか**、  
ときたま、`IPv4 / IPv6`両方に対応したサーバー（ちな`Amazon CloudFront`）にあるファイルのダウンロードが全く進まなくなる時がありました。  
今回はこれの調査をしました。

# 先に結論
`OkHttp`チームが`Happy Eyeballs`機能を実装してくれたため、`OkHttp`のバージョンを`5系`（記述時時点アルファ版です・・）にすると直るはずです。  
https://square.github.io/okhttp/changelogs/changelog/#version-500-alpha11

もしくは、`OkHttp`の`DNS`で`IPv4`を優先する方法でもいいらしいです（バージョンアップできない場合）  
詳しくは最後！→ [#okhttp-アップデート以外で修正したい](#okhttp-アップデート以外で修正したい)

# 環境
家の固定回線です。今のところ携帯回線（ギガ使うやつ）は再現しないですね、、  
あと`Pixel`系はなってない気がします。気のせいかも。

| なまえ   | あたい                                            |
|----------|---------------------------------------------------|
| たんまつ | Xperia 1 V / OnePlus 7 Pro / Xiaomi Mi 11 Lite 5G |
| サーバー | `AWS (CloudFront + S3)`                           |

# 事の発端
`Android`アプリで`OkHttp`を使い、ファイルダウンロード機能を作ってたんですが、なんだか一向にダウンロードが進まない。  
と思って端末変えるとダウンロード出来たり、時間によってはダウンロード出来たり、`Wi-Fi`の`ON/OFF`を試すと動いたりと不安定です。

**ちなみにブラウザではダウンロード出来る**ので、これもまた謎。

## 最低限のコード
コードはこんな感じで、時間によっては動くから間違いはないはず。  
この状態になると`onFailure`も`onResponse`も呼ばれないので、本当にずっっっと読み込み中表示になっちゃうことになります。

```kotlin
val okHttpClient = OkHttpClient.Builder()
    .build()
val request = Request.Builder().apply {
    url("https://takusan.negitoro.dev/icon.png")
    get()
}.build()
var isInvokeCallback = false
val call = okHttpClient.newCall(request)
call.enqueue(object : Callback {
    override fun onFailure(call: Call, e: IOException) {
        isInvokeCallback = true
        println("onFailure")
    }

    override fun onResponse(call: Call, response: Response) {
        isInvokeCallback = true
        println("onResponse ${response.code}")
    }
})
Handler(Looper.getMainLooper()).postDelayed(10_000) {
    // 10 秒以内に onFailure も onResponse もない場合
    if (!isInvokeCallback) {
        call.cancel()
        println("10秒待ってもだめなのでキャンセルします")
    }
}
```

`Logcat`がこう

```plaintext
10秒待ってもだめなのでキャンセルします
onFailure
```

# 調べる
ちょうどパソコンの前に座ってるタイミングで発症したので、重い腰を上げて調査することにした。  
何でかは知りませんが`Google Pixel`以外の`Android`端末で`curl`使えます（何でだろう）。`Pixel`だとなんかエラーになってしまう。`Xperia`にはある。  
持っててよかった`Pixel`以外

```shell
C:\Users\takusan23>adb shell
SO-51D:/ $ curl --help
Usage: curl [options...] <url>
 -d, --data <data>          HTTP POST data
 -f, --fail                 Fail fast with no output on HTTP errors
 -h, --help <category>      Get help for commands
 -i, --include              Include protocol response headers in the output
 -o, --output <file>        Write to file instead of stdout
 -O, --remote-name          Write output to a file named as the remote file
 -s, --silent               Silent mode
 -T, --upload-file <file>   Transfer local FILE to destination
 -u, --user <user:password> Server user and password
 -A, --user-agent <name>    Send User-Agent <name> to server
 -v, --verbose              Make the operation more talkative
 -V, --version              Show version number and quit
```

`curl`で`OkHttp`のリクエストと同じ内容を投げてみます。が、なぜか通ります。  
たまたま直ったかと思って`OkHttp`で試してみたけどだめだった、、、

## IPv6 が悪い？
ここで`curl -v`付きで詳細を出してもらおうと思いました。  
すると興味深い内容が出てきました。

```shell
$ curl -v https://example.com
*   Trying 2001:0db8:85a3:0:0:8a2e:0370:7334:443...
* TCP_NODELAY set
*   Trying 192.0.2.1:443...
* TCP_NODELAY set
* Connected to example.com (192.0.2.1) port 443 (#0)
```

（このブログの`CloudFront`の`IPアドレス`を例示して良いのか知らんので適当に予約済み`IPアドレス`で代替しました。）  
（`CloudFront`からの借り物だし自分のですって言えない気がする。）  
（`URL`も適当です）

**なんだか IPv4 にフォールバックしています。**  
`curl`は`IPv6`を使うことを諦めている説がある

## OkHttp の IPv6 周りが怪しい
というわけで見てみたところ、こちらです。  
`IPv4`と`IPv6`のどちらか良い方を使う機能、`Happy Eyeballs`って名前がついているらしい。

https://github.com/square/okhttp/issues/506

`OkHttp`は既にアルファ版でこの機能が使えるらしい！  
解決策としては、`OkHttp`を`v5`系にして、~~`OkHttpClient.Builder`で`fastFallback(true)`を呼び出せば良いらしいです！~~ → どこかのアルファ版からデフォルト`true`になったっぽい！  
https://github.com/square/okhttp/issues/506#issuecomment-1024256588

# 再現させる
再現させたい方向け。調べてる感じ回線によるので、**多分ならない回線だと再現できない**。  

再現させるには`IPv4 / IPv6 デュアルスタック`なサーバーを用意できれば良いはず。  
ちなみにこのブログも`Amazon CloudFront (IPv4 / IPv6 両方行ける)`で配信してるので適当に画像をリクエストするでも良いはず。https://takusan.negitoro.dev/icon.png

## サーバーを用意する
`VPS`とか借りるの面倒なんで、今回は`Amazon CloudFront`のディストリビューションを作ることにします。  
`CloudFront`は`IPv4 / IPv6`どっちでも接続できるはず。（手元の端末の回線都合は知らん）

オリジンも`S3`にします。`S3`のコンテンツを`CloudFront`で配信するようにして、これをサーバーとします。

### S3
適当にバケットを作ります。  

![Imgur](https://imgur.com/e7ndSjM.png)

できたら、開いて、適当にファイルをバケットに入れておきます。  
このファイルを`Happy Eyeballs`を有効にした`OkHttp`からダウンロード出来るか試します。

![Imgur](https://imgur.com/LOHZ9Pn.png)

### CloudFront
ディストリビューションを作成します。  
オリジンには、さっき作った`S3`を選びます。  

![Imgur](https://imgur.com/wKuwxK8.png)

オリジンアクセスには`OAC`を使います。  
`Origin access control settings (recommended)`を選んで、`Create new OAC`を押し、そのままにして作成します。  

![Imgur](https://imgur.com/WudsEd0,png)

![Imgur](https://imgur.com/1odPpiJ.png)

こんな警告が出るので、後で対応します。

![Imgur](https://imgur.com/S5c0Ji4.png)

あとここを選んで、作成すれば良いはず。

![Imgur](https://imgur.com/UFm8chD.png)

作成後、`S3`の設定を変更するよう言われるので、コピーボタンを押して、リンクを押します。

![Imgur](https://imgur.com/KYCtgFn.png)

アクセス許可を選び

![Imgur](https://imgur.com/3olfd1V.png)

バケットポリシーを押し、貼り付けます（コピーボタンを押したらクリップボードにコピーされるので、あとは貼り付ければ良い）。

![Imgur](https://imgur.com/QvWpU32.png)

## 疎通確認
`CloudFront`のディストリビューションに戻って、`ディストリビューションドメイン名`をコピーし、ブラウザのアドレス欄に打ち込みます。  
そのあと、スラッシュ入れて、アップロードしたファイルの名前（今回は`takusan23_icon.png`）を入れて Enter

![Imgur](https://imgur.com/SKBUxxC.png)

できた！！！

## OkHttp を使う Android アプリを用意する
適当に`Jetpack Compose`を使うプロジェクトを作ってください。  
そのあと、`OkHttp`ライブラリを追加します。`app`フォルダの方の`build.gradle (.kts)`を開き、以下を足す。

```kotlin
dependencies {
    implementation("com.squareup.okhttp3:okhttp:5.0.0-alpha.14")

    // ... 以下省略
```

次に`AndroidManifest.xml`で、インターネット権限を追加します。

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />

    <!-- 以下省略 -->
```

最後に`MainActivity`で適当に画面を作って終わり。  
`Happy Eyeballs`の`ON/OFF`用スイッチを付けました。  
サンプルのためにダウンロード処理を`UI (Compose)`に書いていますが、本当は`ViewModel`に処理を書くべきです。画面回転を超えられないので。  

```kotlin
/** OkHttp 非同期モードのコールバックを Kotlin Coroutines に対応させたもの */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            OkHttpHappyEyeballsTheme {
                MainScreen()
            }
        }
    }
}

/** OkHttp 非同期モードのコールバックを Kotlin Coroutines に対応させたもの */
private suspend fun Call.suspendExecute() = suspendCancellableCoroutine { cancellableContinuation ->
    enqueue(object : Callback {
        override fun onFailure(call: Call, e: IOException) {
            cancellableContinuation.resumeWithException(e)
        }

        override fun onResponse(call: Call, response: Response) {
            cancellableContinuation.resume(response)
        }
    })
    cancellableContinuation.invokeOnCancellation { this.cancel() }
}

@RequiresApi(Build.VERSION_CODES.Q)
@Composable
private fun MainScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val errorDialogText = remember { mutableStateOf<String?>(null) }
    val downloadUrl = remember { mutableStateOf("https://takusan.negitoro.dev/icon.png") }
    val isUseHappyEyeballs = remember { mutableStateOf(false) }

    fun startDownload() {
        scope.launch(Dispatchers.IO) {
            val okHttpClient = OkHttpClient.Builder().apply {
                // Happy Eyeballs を有効
                fastFallback(isUseHappyEyeballs.value)
            }.build()
            val request = Request.Builder().apply {
                url(downloadUrl.value)
                get()
            }.build()
            try {
                // 指定時間以内に終わらなければキャンセルする suspendExecute()
                withTimeout(10_000) {
                    okHttpClient.newCall(request).suspendExecute()
                }.use { response ->
                    // エラーは return
                    if (!response.isSuccessful) {
                        errorDialogText.value = response.code.toString()
                        return@launch
                    }
                    // Downloads/OkHttpHappyEyeballs フォルダに保存
                    val fileContentValues = contentValuesOf(
                        MediaStore.Downloads.DISPLAY_NAME to System.currentTimeMillis().toString(),
                        MediaStore.Downloads.RELATIVE_PATH to "${Environment.DIRECTORY_DOWNLOADS}/OkHttpHappyEyeballs"
                    )
                    val uri = context.contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, fileContentValues)!!
                    context.contentResolver.openOutputStream(uri)?.use { outputStream ->
                        response.body.byteStream().use { inputStream ->
                            inputStream.copyTo(outputStream)
                        }
                    }
                    withContext(Dispatchers.Main) {
                        Toast.makeText(context, "ダウンロードが完了しました", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                errorDialogText.value = e.toString()
                // キャンセル系は再スロー
                if (e is CancellationException) {
                    throw e
                }
            }
        }
    }

    if (errorDialogText.value != null) {
        AlertDialog(
            onDismissRequest = { errorDialogText.value = null },
            title = { Text(text = "OkHttp エラー") },
            text = { Text(text = errorDialogText.value!!) },
            confirmButton = {
                Button(onClick = { errorDialogText.value = null }) {
                    Text(text = "閉じる")
                }
            }
        )
    }

    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .padding(10.dp)
        ) {

            OutlinedTextField(
                modifier = Modifier.fillMaxWidth(),
                value = downloadUrl.value,
                onValueChange = { downloadUrl.value = it },
                label = { Text(text = "画像の URL") }
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(text = "HappyEyeballs を有効")
                Switch(
                    checked = isUseHappyEyeballs.value,
                    onCheckedChange = { isUseHappyEyeballs.value = it }
                )
            }
            Button(onClick = { startDownload() }) {
                Text(text = "ダウンロード開始")
            }
        }
    }
}
```

## 再現した
タイミング良く回線ハズレを引き当てました！！！  
`Happy Eyeballs`なしの場合はコールバックが一向に呼ばれないので、`Kotlin Coroutines`の`withTimeout { }`のタイムアウトが作動して、タイムアウトになっています。  

![Imgur](https://imgur.com/93WG6Fp.png)

![Imgur](https://imgur.com/to2d8vy.png)

一方回線ハズレを引いている状態でも、`Happy Eyeballs`が有効だとちゃんとダウンロードできました。  

![Imgur](https://imgur.com/6G3t9fs.png)

![Imgur](https://imgur.com/0YN7gnS.png)

# OkHttp アップデート以外で修正したい
アルファ版だからアップデートは心配という場合は、`DNS`部分をカスタマイズすれば一応は回避できるらしい。
https://github.com/square/okhttp/issues/506#issuecomment-765899011

```kotlin
/** IPv4 アドレスを優先する OkHttp DNS。IPv6 アドレスを後ろに追いやっている */
class PriorityIpv4Dns() : Dns {
    override fun lookup(hostname: String): List<InetAddress> {
        return Dns.SYSTEM.lookup(hostname).sortedBy { Inet6Address::class.java.isInstance(it) }
    }
}
```

差分を貼り付けるの面倒なので全部張りますが、  
`IPv4`を優先するスイッチを付けました。有効にすると、上記の`PriorityIpv4Dns`が使われるようにしてみました。  

```kotlin
/** IPv4 アドレスを優先する OkHttp DNS 実装。IPv6 アドレスを後ろに追いやっている */
class PriorityIpv4Dns() : Dns {
    override fun lookup(hostname: String): List<InetAddress> {
        return Dns.SYSTEM.lookup(hostname).sortedBy { Inet6Address::class.java.isInstance(it) }
    }
}

@RequiresApi(Build.VERSION_CODES.Q)
@Composable
private fun MainScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val errorDialogText = remember { mutableStateOf<String?>(null) }
    val downloadUrl = remember { mutableStateOf("https://takusan.negitoro.dev/icon.png") }
    val isUseHappyEyeballs = remember { mutableStateOf(false) }
    val isPriorityIpv4 = remember { mutableStateOf(false) }

    fun startDownload() {
        scope.launch(Dispatchers.IO) {
            val okHttpClient = OkHttpClient.Builder().apply {
                // Happy Eyeballs を有効
                fastFallback(isUseHappyEyeballs.value)
                // IPv4 を優先
                if (isPriorityIpv4.value) {
                    dns(PriorityIpv4Dns())
                }
            }.build()
            val request = Request.Builder().apply {
                url(downloadUrl.value)
                get()
            }.build()
            try {
                // 指定時間以内に終わらなければキャンセルする suspendExecute()
                withTimeout(10_000) {
                    okHttpClient.newCall(request).suspendExecute()
                }.use { response ->
                    // エラーは return
                    if (!response.isSuccessful) {
                        errorDialogText.value = response.code.toString()
                        return@launch
                    }
                    // Downloads/OkHttpHappyEyeballs フォルダに保存
                    val fileContentValues = contentValuesOf(
                        MediaStore.Downloads.DISPLAY_NAME to System.currentTimeMillis().toString(),
                        MediaStore.Downloads.RELATIVE_PATH to "${Environment.DIRECTORY_DOWNLOADS}/OkHttpHappyEyeballs"
                    )
                    val uri = context.contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, fileContentValues)!!
                    context.contentResolver.openOutputStream(uri)?.use { outputStream ->
                        response.body.byteStream().use { inputStream ->
                            inputStream.copyTo(outputStream)
                        }
                    }
                    withContext(Dispatchers.Main) {
                        Toast.makeText(context, "ダウンロードが完了しました", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                errorDialogText.value = e.toString()
                // キャンセル系は再スロー
                if (e is CancellationException) {
                    throw e
                }
            }
        }
    }

    if (errorDialogText.value != null) {
        AlertDialog(
            onDismissRequest = { errorDialogText.value = null },
            title = { Text(text = "OkHttp エラー") },
            text = { Text(text = errorDialogText.value!!) },
            confirmButton = {
                Button(onClick = { errorDialogText.value = null }) {
                    Text(text = "閉じる")
                }
            }
        )
    }

    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .padding(10.dp)
        ) {

            OutlinedTextField(
                modifier = Modifier.fillMaxWidth(),
                value = downloadUrl.value,
                onValueChange = { downloadUrl.value = it },
                label = { Text(text = "画像の URL") }
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(text = "HappyEyeballs を有効")
                Switch(
                    checked = isUseHappyEyeballs.value,
                    onCheckedChange = { isUseHappyEyeballs.value = it }
                )
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(text = "IPv4 を優先する")
                Switch(
                    checked = isPriorityIpv4.value,
                    onCheckedChange = { isPriorityIpv4.value = it }
                )
            }
            Button(onClick = { startDownload() }) {
                Text(text = "ダウンロード開始")
            }
        }
    }
}
```

![Imgur](https://imgur.com/zliyX4M.png)

これでも一応動きますが、多分`Happy Eyeballs`を使えるアルファ版を使うほうが良いような気がする。  
というのも`Reddit`チームいわく、よく動いているみたい。なので

https://www.reddit.com/r/RedditEng/comments/v1upr8/ipv6_support_on_android/

# おわりに
今回使った検証アプリのソースコード置いておきます  
https://github.com/takusan23/OkHttpHappyEyeballs

以上です、お疲れ様でした 8888888888888