---
title: Compose Multiplatform を使って、AWS S3 にアップロードするアプリを作る
created_at: 2025-05-23
tags:
- Kotlin
- KotlinMultiplatform
- ComposeMultiplatform
- AWS
- S3
---
どうもこんばんわ。  
流る星 -a Wish Star- 攻略しました。ソフマップのかべに貼ってあったやつ！！

![ソフマップ](https://oekakityou.negitoro.dev/resize/671dbd8f-1367-4b36-8937-961b206db3d6.jpg)

![ソフマップ](https://oekakityou.negitoro.dev/resize/1c29570b-8cc8-4539-932e-c707dcb6596e.jpg)

かわいい。むずかしい話とかはなかったのでおすすめ！！！  
ロープラでおてがる

![かわいい](https://oekakityou.negitoro.dev/resize/69438e22-6d5f-4887-a7bc-3ea1967a9e49.jpg)

めっちゃモダンなカミサマだった。

![モダン](https://oekakityou.negitoro.dev/resize/54499815-580c-4728-ba9d-ac5c1995e0d3.jpg)

表情がいっぱい。おかげさまでスクショが埋まった。  
きらきらしてるやつすき

![かわいい](https://oekakityou.negitoro.dev/resize/f7a31d67-c366-4b8b-8052-eb2e5c77fd2f.jpg)

![かわいい](https://oekakityou.negitoro.dev/resize/ab7da5b1-7b02-4737-9b39-e550cf6073f8.jpg)

![かわいい](https://oekakityou.negitoro.dev/resize/8691de5a-cbbb-4778-a46f-4d5cd57c6d19.jpg)

後日談にえちえちシーンがあります！！！  
本編よりこっちが本編なのでは！？！？長く感じた。うれしい

![おねえさん](https://oekakityou.negitoro.dev/resize/a13589b8-5465-494e-be5a-da622e3c088c.jpg)  
！？！？！？

![えっ](https://oekakityou.negitoro.dev/resize/8a2a49cf-16df-4c10-b371-faacef7e690c.jpg)

![えっ](https://oekakityou.negitoro.dev/resize/41718955-a2b6-4c44-862d-aac1671c9538.jpg)

えちえちしーん良かった！！！  
意地悪でも言ってくれるカミサマ、、

# 本題
前回`S3+Lambda`で画像を小さくするやつを作った。リサイズが面倒だったのと`UltraHDR`画像をここに貼り付けたかったんだよな。  
で、で、で  

現状はコンソールにログインして、`S3`バケットの画面を開き、そこに写真を放り込んでいますが、ちょい面倒。。。  

専用クライアントアプリ作りたいなあ。
そっから画像をアップロードしてしばらく待ってれば、変換後の`URL`がコピーできるみたいな、そーゆーの作りたいなあ。

# Compose Multiplatform
パソコンと、`Android`から投稿したかったので、当初は`React`でペライチアプリでも作るか～って思ってました。が、

そう言えば`Compose Multiplatform`って**使ったことないじゃん私**、`Jetpack Compose`が`Android`だけじゃなくて`Web`とかでも動くらしい。  
ブラウザ(パソコン)と`Android`でクライアント作りたいのでこれでいいやんって。  
てか私一人しか使わないので**動けば良い**。

~~Web だと SEO とかなんとかあって SSR/SSG を選ぶ必要あるけど、今回は自分だけだし。~~

## 環境
今回は`Android`と`Web`をターゲットにします。  
`iOS`は`mac`持ってない。ので。。  
`Web`は`<canvas>`に描画されます。

| なまえ         | あたい                                       |
|----------------|----------------------------------------------|
| Android Studio | Android Studio Meerkat Feature Drop 2024.3.2 |

## Compose Multiplatform プラグイン
`Android Studio`にプラグインを入れたほうが良いらしい（？）  
本当に必要なのかが分からない

https://plugins.jetbrains.com/plugin/14936-kotlin-multiplatform

## プロジェクトを作る
これを開いて  
https://kmp.jetbrains.com/

項目を埋めます  
`Project ID`ですが、`Java`の文化なのかなんなのかわかりませんが、持っているドメインを逆さまにして、最後にアプリケーション名を入れる文化があります。  
ドメインなかった頃は`GitHub Pages`使ってて未だにそれやってる。

![Imgur](https://imgur.com/U4NjJwh.png)

出来たら`DOWNLOAD`、お好きな場所で解凍してください。

## Android Studio で開く
解凍したものを`Android Studio`で開きます。

![Imgur](https://imgur.com/aqdmZlt.png)

そしたらしばらく待ちます。  
ライブラリのダウンロードなりがあるので。。

## フォルダ構成
ファイルツリーの表示はここから変更できます。  
慣れない場合はここから変更できます。

![Imgur](https://imgur.com/PkX1N5D.png)

デフォルト状態では、`commonMain`モジュールにある`Composable App()`関数を、  
それぞれのプラットフォーム（`androidMain`、`wasmJsMain`）の各エントリーポイント（`Android`なら`MainActivity`、`Web`なら`main.kt`）で呼び出してる感じですね。  

また、プラットフォーム固有処理は  
`Platform.kt`にインターフェイスで定義があって、  
`interface Platform`を各プラットフォームで実装したものを`actual`で返す感じみたいです。

よく見るとバージョンカタログ等使われてるので、イケイケ`android`アプリ開発の知見が必要そう、  
`Gradle`何もわからない。

## とりあえず実行してみたい
`Android`の場合は`composeApp`を選んで端末を繋げば実行ボタンが押せます。  
![Imgur](https://imgur.com/tu0GEm9.png)

`Web`の場合は`Gradle`のコマンドパレットから、以下のコマンドを叩くと、ローカルサーバーが立ち上がります。  

![Imgur](https://imgur.com/uGR5Uyz.png)

![Imgur](https://imgur.com/3sEfSKW.png)

```shell
gradle  :composeApp:wasmJsBrowserDevelopmentRun
```

![Imgur](https://imgur.com/PfhePZg.png)

## 必要なライブラリを入れる
まず手始めに`Material3`じゃないので、`Material3`を使うようにライブラリを差し替えます。  
`composeApp/build.gradle.kts`でそれぞれのプラットフォームで必要なライブラリを定義できます。

![Imgur](https://imgur.com/EeKG2yX.png)

あとは、`S3`の`REST API`を叩くためのライブラリ群です。  
`androidMain`にも`HTTP Client`都合で必要です。

```kotlin
androidMain.dependencies {
    // 省略...

    // Ktor Android Impl
    implementation("io.ktor:ktor-client-okhttp:3.1.2")
}
commonMain.dependencies {
    // 省略...
    
    // HTTP Client
    implementation("io.ktor:ktor-client-core:3.1.2")

    // calc Hash
    implementation(platform("org.kotlincrypto.hash:bom:0.7.0"))
    implementation("org.kotlincrypto.hash:sha2")

    // calc Hmac-Hadh
    implementation(platform("org.kotlincrypto.macs:bom:0.7.0"))
    implementation("org.kotlincrypto.macs:hmac-sha2")

    // kotlinx.datetime
    implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.6.2")
}
```

あと`material3`用に`import`直してね。

## EdgeToEdge 出来てない
`App()`の中身を`Scaffold { }`で囲むのと、`MainActivity`で`enableEdgeToEdge()`を呼び出す必要があります。  
というわけで全部消しますか。

`App.kt`

```kotlin
@Composable
@Preview
fun App() {
    var showContent by remember { mutableStateOf(false) }

    MaterialTheme {
        Scaffold { innerPadding ->
            Column(
                modifier = Modifier.padding(innerPadding).fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Button(onClick = { showContent = !showContent }) {
                    Text("Click me!")
                }
                AnimatedVisibility(showContent) {
                    val greeting = remember { Greeting().greet() }
                    Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                        Image(painterResource(Res.drawable.compose_multiplatform), null)
                        Text("Compose: $greeting")
                    }
                }
            }
        }
    }
}
```

`MainActivity`

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            App()
        }
    }
}
```

これで`EdgeToEdge`できました。

## API を叩くのに使う AWS Sigv4 署名を作る関数
`AWS`が`Kotlin CDK`を出してくれてますが、`JVM/Android`用で、`Kotlin/Wasm`では使えません、、  
というわけで`API`を直接叩くことにしたのですが、叩くためには`AWS Sigv4 署名`が必要で、結構複雑。

詳しい説明は前回の記事見てください。  
かなり面倒くさいですが、`Compose Multiplatform`で実装できます。  
https://takusan.negitoro.dev/posts/kotlin_multiplatform_create_aws_sign_v4_without_aws_cdk/

`commonMain`に`AwsSignV4.kt`を作ってこんな感じ。  
![Imgur](https://imgur.com/G4fRGiq.png)

```kotlin
/** ISO8601 */
@OptIn(FormatStringsInDatetimeFormats::class)
private val amzDateFormat = DateTimeComponents.Format {
    byUnicodePattern("""yyyyMMdd'T'HHmmss'Z'""")
}

/** yyyyMMdd */
@OptIn(FormatStringsInDatetimeFormats::class)
private val yearMonthDayDateFormat = DateTimeComponents.Format {
    byUnicodePattern("yyyyMMdd")
}

/** AWS Sigv4 署名を作る */
@OptIn(ExperimentalStdlibApi::class)
internal fun generateAwsSign(
    url: String,
    httpMethod: String = "GET",
    contentType: String? = null,
    region: String = "ap-northeast-1",
    service: String = "s3",
    amzDateString: String,
    yyyyMMddString: String,
    secretAccessKey: String,
    accessKey: String,
    requestHeader: HashMap<String, String> = hashMapOf(),
    payloadSha256: String = "".sha256().toHexString()
): String {
    val httpUrl = Url(urlString = url)

    // リクエストヘッダーになければ追加
    requestHeader.putIfAbsent("x-amz-date", amzDateString)
    requestHeader.putIfAbsent("host", httpUrl.host)
    if (contentType != null) {
        requestHeader.putIfAbsent("Content-Type", contentType)
    }
    requestHeader.putIfAbsent("x-amz-content-sha256", payloadSha256)

    // 1.正規リクエストを作成する
    // パス、クエリパラメータは URL エンコードする
    // リスト系はアルファベットでソート
    val canonicalUri = httpUrl.encodedPath.encodeURLPath().ifBlank { "/" }
    val canonicalQueryString = httpUrl.parameters
        .names()
        .map { it.encodeURLParameter() }
        .sortedBy { name -> name }
        .associateWith { name -> httpUrl.parameters[name]?.encodeURLParameter() }
        .toList()
        .joinToString(separator = "&") { (name, values) ->
            "$name=${values ?: ""}" // こっちはイコール
        }
    val canonicalHeaders = requestHeader
        .toList()
        .sortedBy { (name, _) -> name.lowercase() }
        .joinToString(separator = "\n") { (name, value) ->
            "${name.lowercase()}:${value.trim()}"
        } + "\n" // 末尾改行で終わる
    val signedHeaders = requestHeader
        .toList()
        .map { (name, _) -> name.lowercase() }
        .sorted()
        .joinToString(separator = ";")
    val hashedPayload = payloadSha256.lowercase()
    val canonicalRequest = httpMethod + "\n" + canonicalUri + "\n" + canonicalQueryString + "\n" + canonicalHeaders + "\n" + signedHeaders + "\n" + hashedPayload

    // 2.正規リクエストのハッシュを作成する。ペイロードと同じハッシュ関数
    val hashedCanonicalRequest = canonicalRequest.sha256().toHexString()

    // 3.署名文字列を作成する
    val algorithm = "AWS4-HMAC-SHA256"
    val requestDateTime = amzDateString
    val credentialScope = "$yyyyMMddString/$region/$service/aws4_request"
    val stringToSign = algorithm + "\n" + requestDateTime + "\n" + credentialScope + "\n" + hashedCanonicalRequest

    // 4.SigV4 の署名キーの取得
    val dateKey = "AWS4$secretAccessKey".toByteArray(Charsets.UTF_8).hmacSha256(message = yyyyMMddString)
    val dateRegionKey = dateKey.hmacSha256(message = region)
    val dateRegionServiceKey = dateRegionKey.hmacSha256(message = service)
    val signingKey = dateRegionServiceKey.hmacSha256(message = "aws4_request")

    // 5.署名を計算する
    val signature = signingKey.hmacSha256(message = stringToSign).toHexString().lowercase()

    // 6.リクエストヘッダーに署名を追加する
    val authorizationHeaderValue = algorithm + " " + "Credential=$accessKey/$credentialScope" + "," + "SignedHeaders=$signedHeaders" + "," + "Signature=$signature"
    return authorizationHeaderValue
}

/** ISO8601 の形式でフォーマットする */
internal fun Instant.formatAmzDateString(): String {
    return this.format(amzDateFormat)
}

/** yyyy/MM/dd の形式でフォーマットする */
internal fun Instant.formatYearMonthDayDateString(): String {
    return this.format(yearMonthDayDateFormat)
}

/** バイト配列から SHA-256 */
internal fun ByteArray.sha256(): ByteArray {
    return SHA256().digest(this)
}

/** Java の putIfAbsent 相当 */
private fun <K, V> HashMap<K, V>.putIfAbsent(key: K, value: V): V? {
    var v = this.get(key)
    if (v == null) {
        v = put(key, value)
    }
    return v
}

/** 文字列から SHA-256 */
private fun String.sha256(): ByteArray {
    return this.toByteArray(Charsets.UTF_8).sha256()
}

/**
 * HMAC-SHA256 を計算
 * this がキーです
 */
private fun ByteArray.hmacSha256(message: String): ByteArray {
    val secretKey = this
    return HmacSHA256(secretKey).doFinal(message.toByteArray(Charsets.UTF_8))
}
```

## インターネット権限
`AndroidManifest.xml`でインターネット権限を足します。

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

## S3 の CORS 設定
もし`Kotlin/Wasm`でブラウザの`Compose`を使う場合、ブラウザの`CORS`制限に引っかかります。  
ので、`CORS`の設定変更が必要です。以下参照。`JSON`コピーして`CORS`の設定に貼り付ければ良い。

https://docs.aws.amazon.com/ja_jp/sdk-for-javascript/v2/developer-guide/s3-example-photo-album.html#s3-example-photo-album-cors-configuration

## S3 API クライアントを作る
`S3`バケットの中身一覧取得、`S3`バケットへオブジェクトを追加、`S3`バケットからオブジェクトを削除する関数たちです。  
今回は面倒くさがって`xml`パーサーを入れずに**正規表現**で戦ってます。ちゃんとするべきです、、、

`ACCESS_KEY`と`SECRET_ACCESS_KEY`、`REGION`は**皆さん自分の値**を入れてください！！！

```kotlin
/** S3 クライアント */
object AwsS3Client {

    // TODO 各自入力してください
    private const val ACCESS_KEY = ""
    private const val SECRET_ACCESS_KEY = ""
    private const val REGION = "ap-northeast-1"

    // Kotlin Multiplatform HTTP Client
    private val httpClient = HttpClient()

    // xml パーサーの代わりに正規表現
    private val regexKey = "<Key>(.*?)</Key>".toRegex()
    private val regexLastModified = "<LastModified>(.*?)</LastModified>".toRegex()

    /**
     * バケット内のオブジェクト一覧を取得する
     * 
     * @param bucketName バケット名
     */
    suspend fun getObjectList(bucketName: String): List<ListObject> {
        val now = Clock.System.now()
        val url = "https://s3.$REGION.amazonaws.com/$bucketName/?list-type=2"
        val amzDateString = now.formatAmzDateString()
        val yyyyMMddString = now.formatYearMonthDayDateString()

        // 署名を作成
        val requestHeader = hashMapOf(
            "x-amz-date" to amzDateString,
            "host" to "s3.$REGION.amazonaws.com"
        )
        val signature = generateAwsSign(
            url = url,
            httpMethod = "GET",
            contentType = null,
            region = REGION,
            service = "s3",
            amzDateString = amzDateString,
            yyyyMMddString = yyyyMMddString,
            secretAccessKey = SECRET_ACCESS_KEY,
            accessKey = ACCESS_KEY,
            requestHeader = requestHeader
        )

        // レスポンス xml を取得
        val response = httpClient.get {
            url(url)
            headers {
                // 署名をリクエストヘッダーにつける
                requestHeader.forEach { (name, value) ->
                    this[name] = value
                }
                this["Authorization"] = signature
            }
        }

        // XML パーサー入れるまでもないので、正規表現で戦う、、、
        val responseXml = response.bodyAsText()
        val keyList = regexKey.findAll(responseXml).toList().map { it.groupValues[1] }
        val lastModifiedList = regexLastModified.findAll(responseXml).toList().map { it.groupValues[1] }

        // data class
        // 同じ数ずつあるはず
        return keyList.indices.map { index ->
            ListObject(
                key = keyList[index],
                lastModified = lastModifiedList[index]
            )
        }
    }

    /**
     * S3 バケットにデータを投稿する
     *
     * @param bucketName バケット名
     * @param key オブジェクトのキー（名前）
     * @param byteArray バイナリデータ
     */
    @OptIn(ExperimentalStdlibApi::class)
    suspend fun putObject(
        bucketName: String,
        key: String,
        byteArray: ByteArray
    ): Boolean {
        val now = Clock.System.now()
        val url = "https://s3.$REGION.amazonaws.com/$bucketName/$key"
        val amzDateString = now.formatAmzDateString()
        val yyyyMMddString = now.formatYearMonthDayDateString()

        // 署名を作成
        val requestHeader = hashMapOf(
            "x-amz-date" to amzDateString,
            "host" to "s3.$REGION.amazonaws.com"
        )
        val signature = generateAwsSign(
            url = url,
            httpMethod = "PUT",
            contentType = null,
            region = REGION,
            service = "s3",
            amzDateString = amzDateString,
            yyyyMMddString = yyyyMMddString,
            secretAccessKey = SECRET_ACCESS_KEY,
            accessKey = ACCESS_KEY,
            requestHeader = requestHeader,
            payloadSha256 = byteArray.sha256().toHexString()
        )

        // PutObject する
        val response = httpClient.put {
            url(url)
            headers {
                requestHeader.forEach { (name, value) ->
                    this[name] = value
                }
                this["Authorization"] = signature
            }
            setBody(byteArray)
        }
        return response.status == HttpStatusCode.OK
    }

    /**
     * オブジェクトを削除する
     *
     * @param bucketName バケット名
     * @param key オブジェクトのキー
     */
    suspend fun deleteObject(
        bucketName: String,
        key: String
    ): Boolean {
        val now = Clock.System.now()
        val url = "https://s3.$REGION.amazonaws.com/$bucketName/$key"
        val amzDateString = now.formatAmzDateString()
        val yyyyMMddString = now.formatYearMonthDayDateString()

        // 署名を作成
        val requestHeader = hashMapOf(
            "x-amz-date" to amzDateString,
            "host" to "s3.$REGION.amazonaws.com"
        )
        val signature = generateAwsSign(
            url = url,
            httpMethod = "DELETE",
            contentType = null,
            region = REGION,
            service = "s3",
            amzDateString = amzDateString,
            yyyyMMddString = yyyyMMddString,
            secretAccessKey = SECRET_ACCESS_KEY,
            accessKey = ACCESS_KEY,
            requestHeader = requestHeader
        )

        // 削除する
        val response = httpClient.delete {
            url(url)
            headers {
                // 署名をリクエストヘッダーにつける
                requestHeader.forEach { (name, value) ->
                    this[name] = value
                }
                this["Authorization"] = signature
            }
        }
        // 204 No Content を返す
        return response.status == HttpStatusCode.NoContent
    }

    data class ListObject(
        val key: String,
        val lastModified: String
    )
}
```

## 一覧画面を作ってみる
`API`を叩いて、バケット一覧を`LazyColumn`でリスト表示できるようにしてみます。

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
@Preview
fun App() {

    // API を叩く
    val objectList = remember { mutableStateOf<List<AwsS3Client.ListObject>?>(null) }
    LaunchedEffect(key1 = Unit) {
        objectList.value = AwsS3Client.getObjectList(bucketName = "") // TODO 各自バケット名入れてください
    }

    MaterialTheme {
        Scaffold(
            topBar = { TopAppBar(title = { Text(text = "S3 Bucket") }) }
        ) { innerPadding ->

            LazyColumn(contentPadding = innerPadding) {
                if (objectList.value == null) {
                    // 読み込み中
                    item {
                        Box(
                            modifier = Modifier
                                .height(100.dp)
                                .fillMaxWidth(),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator()
                        }
                    }
                } else {
                    // 一覧画面
                    items(
                        items = objectList.value!!,
                        key = { it.key }
                    ) { obj ->
                        Column(modifier = Modifier.fillMaxWidth()) {
                            Text(text = obj.key, fontSize = 16.sp)
                            Text(text = obj.lastModified)
                        }
                        HorizontalDivider()
                    }
                }
            }
        }
    }
}
```

こんな感じ！！！  
すごい、ちゃんと`Multiplatform`で動いてる！！

![Imgur](https://imgur.com/wLi2FaP.png)

![Imgur](https://imgur.com/OP23vCG.png)

## 画像を投稿してみる
さて、少し難しくなります。  
というのも、画像を選ぶ処理はそれぞれの`OS`でやる必要があるためです。

`Android`なら`PhotoPicker`、`Web`なら`<input type="file">`ですね。  
`OS`事に違う処理を書きたい場合、`expect/actual`を使います。

`interface`を用意し、それぞれのプラットフォームで`interface`を実装し、返してあげるイメージです。  
既に`Platform.kt`が`interface`を切って、`Android`と`Web`でそれぞれ処理を書いています。

```kotlin
interface Platform {
    val name: String
}

expect fun getPlatform(): Platform
```

写真ピッカー、探せば見つかりそうだけど、`Compose Multiplatform`の練習にならないので、今回は自力で作ります。

### インターフェースを作る
といっても、写真ピッカーを開いて、選び終わるまで`サスペンド関数`が一時停止、  
選んだら画像のバイト配列が返ってくる関数を、それぞれのプラットフォームで作ります。

`Platform.kt`のように`PhotoPicker.kt`を作りました。  
インターフェースと、それぞれのプラットフォームで作った実装を入れる変数を用意しました。

```kotlin
fun interface PhotoPicker {

    /**
     * 写真ピッカーを開く。
     * 選び終わるまで一時停止し、選んだ画像を[PhotoPickerResult]で返す。
     * 選ぶのを辞めたら null を返す
     */
    suspend fun startPhotoPicker(): PhotoPickerResult?

    data class PhotoPickerResult(
        val name: String,
        val byteArray: ByteArray
    )

}

expect val photoPicker: PhotoPicker
```

こんな感じに作ると、それぞれのプラットフォームで作れよって言われるので、埋めます。  
![Imgur](https://imgur.com/xKUuhHS.png)

### Android 側
`PhotoPicker.android.kt`を埋めます。  

`Android`側は`フォトピッカー`を使うことにします。なので`Composable 関数`を一つおいて貰う形にします。  
`rememberLauncherForActivityResult()`を使いたいので何かしら`Composable 関数`をおいてもらわないと、、、なので。

コルーチン間は`Channel()`で信号を飛ばし合っています。

```kotlin
/** Android の PhotoPicker を開くことを通達する Channel */
val openPlatformPhotoPickerSignalChannel = Channel<Unit>()

/** Android の PhotoPicker の選択結果を通達する Channel */
val resultPlatformPhotoPickerSignalChannel = Channel<PhotoPicker.PhotoPickerResult?>()

/**
 * Android 側
 * 写真ピッカーの処理
 */
actual val photoPicker = PhotoPicker {
    // 開くことを要求
    openPlatformPhotoPickerSignalChannel.send(Unit)
    // 結果が送られてくるまで待つ
    resultPlatformPhotoPickerSignalChannel.receive()
}

/** [PhotoPicker]を利用するためにこの関数を呼び出してください。 */
@Composable
fun PhotoPickerInitEffect() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val platformPhotoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri ->
            scope.launch(Dispatchers.IO) {

                // 選んでない
                if (uri == null) {
                    resultPlatformPhotoPickerSignalChannel.send(null)
                    return@launch
                }

                // 名前は取得できないので、適当に作る
                val extension = when (context.contentResolver.getType(uri)) {
                    "image/jpeg" -> ".jpg"
                    "image/png" -> ".png"
                    "image/webp" -> ".webp"
                    else -> null
                }
                if (extension == null) {
                    resultPlatformPhotoPickerSignalChannel.send(null)
                    return@launch
                }

                // バイナリを取得して返す
                resultPlatformPhotoPickerSignalChannel.send(
                    PhotoPicker.PhotoPickerResult(
                        name = "${System.currentTimeMillis()}$extension",
                        byteArray = context.contentResolver.openInputStream(uri)!!.use { it.readBytes() }
                    )
                )
            }
        }
    )

    LaunchedEffect(key1 = Unit) {
        // 来たら開く
        for (unuse in openPlatformPhotoPickerSignalChannel) {
            platformPhotoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
        }
    }
}
```

これを`MainActivity`の`Compose`作ってるところ、エントリーポイントで一発呼び出します。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            PhotoPickerInitEffect() // PhotoPicker.kt のため
            App()
        }
    }
}
```

### Web側
`Platform.wasmJs.kt`です。

`<input type="file">`ですね。多分これで動くはず。。  
`TypeScript`なし`JavaScript`、新鮮だな。。

```kotlin
/** <input> */
val inputElement = (document.createElement("input") as HTMLInputElement).apply {
    setAttribute("type", "file")
    setAttribute("accept", ".jpg, .png, .webp")
}

/** ファイル取得 Flow */
val inputChangeEventFlow = callbackFlow {
    // ファイル選択イベント
    inputElement.onchange = {
        trySend(inputElement.files?.get(0))
        Unit
    }
    // 選択画面を閉じたイベント
    inputElement.oncancel = {
        trySend(null)
    }
    // ファイル
    awaitClose {
        inputElement.onchange = null
        inputElement.oncancel = null
    }
}

/**
 * Web 側
 * 写真ピッカーの処理
 */

actual val photoPicker = PhotoPicker {
    // 開く
    inputElement.click()

    // 選ぶのを待つ
    val file = inputChangeEventFlow.firstOrNull()

    // 返す
    if (file == null) {
        null
    } else {
        PhotoPicker.PhotoPickerResult(
            name = file.name,
            byteArray = file.readBytes().toByteArray()
        )
    }
}

/** [File]からバイナリを取得する */
private suspend fun File.readBytes() = suspendCoroutine { continuation ->
    val fileReader = FileReader()
    fileReader.onload = {
        val arrayBuffer = fileReader.result as ArrayBuffer
        continuation.resume(Int8Array(arrayBuffer))
    }
    fileReader.readAsArrayBuffer(this)
}
```

### 画像を選ぶボタン
を`App()`の`Scaffold { }`に置きました。  
`ExtendedFloatingActionButton`を使ってみました。

あと成功したかを表示する`Snackbar`を

```kotlin
val snackbarHostState = remember { SnackbarHostState() }

Scaffold(
    snackbarHost = {
        SnackbarHost(hostState = snackbarHostState)
    },
    topBar = {
        TopAppBar(title = { Text(text = "S3 Bucket") })
    },
    floatingActionButton = {
        ExtendedFloatingActionButton(
            text = { Text(text = "Upload") },
            icon = { Icon(imageVector = Icons.Outlined.Add, contentDescription = null) },
            onClick = {
                scope.launch {
                    // 投稿処理
                    val (name, byteArray) = photoPicker.startPhotoPicker() ?: return@launch
                }
            }
        )
    }
) { innerPadding ->
    // 省略...
}
```

### S3 に投げる
バケット名は各自直してください。

```kotlin
onClick = {
    scope.launch {
        // 投稿処理
        val (name, byteArray) = photoPicker.startPhotoPicker() ?: return@launch
        // S3 に投げる
        val isSuccessful = AwsS3Client.putObject(
            bucketName = "", // バケット名！！！！
            key = name,
            byteArray = byteArray
        )
        snackbarHostState.showSnackbar(message = if (isSuccessful) "Successful" else "Error")
    }
}
```

これで動くはず。  
成功すると`Snackbar`が表示されるはずです！！

![Imgur](https://imgur.com/wVWROpx.png)

![Imgur](https://imgur.com/etGF8VD.png)

## 削除ボタンをつくる
は、読者さんへの課題とします（おい！！）  
まあボタン押したらオブジェクトのキーで、オブジェクト削除`API`叩くだけのはずですしおすし

# 配布する
`Android`の場合は普通に`Android Studio`の`Generate Signed App Bundle or APK ...`から`APK`、`PlayStore`の場合は`AAB`を作ればよいはず。  

![Imgur](https://imgur.com/fJOldP9.png)

![Imgur](https://imgur.com/NOHBgqW.png)

https://kotlinlang.org/docs/wasm-get-started.html#generate-artifacts  
`Web`の場合は、以下のコマンドを`Execute Gradle Task`のテキストボックスで叩くと、静的サイト公開として必要なファイルが生成されます。

```shell
gradle  :composeApp:wasmJsBrowserDistribution
```

このコマンドパネルは`Gradle`パネルのターミナルみたいなアイコンから。  
![Imgur](https://imgur.com/vs8pb1r.png)

ビルド成果物のパスはこれ。  
`composeApp/build/dist/wasmJs/productExecutable`の中に`index.html`とかが入っているはず。  
![Imgur](https://imgur.com/SyU0lI3.png)

あとはこのフォルダの中身を、`GitHub Pages`か`Netlify`か`Cloudflare Pages`、`S3+CloudFront`などでホスティングすれば、  
他の人でもアクセスできるようになります！

ブラウザで表示できるか試したい場合、`Node.js`が入っていれば、成果物のパスへ`cd`して`npx serve`すればよいです。  
`IDEA Ultimate`にはローカルサーバー機能があるらしいですが、`Community`版にはなかった、、

![Imgur](https://imgur.com/cRWuDxB.png)

# おまけ 日本語表示
ここまで、なぜか頑なに`Text()`に英語を入れていました。  
なぜかというと初期状態では、`Web`の方で日本語を表示できません。

![Imgur](https://imgur.com/nAp0Wpd.png)

というわけで、フォントファイルを同梱しようと思います。  
https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform-resources-usage.html#fonts

親切なことに、`Compose Multiplatform`でフォントをバンドルする方法が書かれているので、これに従います。  
今回は`Kosugi Maru`を`Google Fonts`からダウンロードしてきて使うことにします。

ダウンロードして解凍したら、フォントファイルを`composeResources`に配置します。  
![Imgur](https://imgur.com/c0VQNaQ.png)

するとコード上で参照できるようになっているので、あとはこのフォントを`Text()`に反映させるだけ。  
`Text()`の`fontFamily`を一つ一つ付けていくのは面倒なので、大本である`MaterialTheme`の`fontFamily`を上書きする作戦で行きます。

`Res.font.`で追加したフォントが見つからない場合は一回コメントアウトして実行してみると良いかも。

```kotlin
// Web で日本語を表示できないので、MaterialTheme でフォントを伝搬させる
val bundleFont = FontFamily(Font(resource = Res.font.KosugiMaru_Regular))
val overrideFontFamily = MaterialTheme.typography.copy(
    displayLarge = MaterialTheme.typography.displayLarge.copy(fontFamily = bundleFont),
    displayMedium = MaterialTheme.typography.displayMedium.copy(fontFamily = bundleFont),
    displaySmall = MaterialTheme.typography.displaySmall.copy(fontFamily = bundleFont),
    headlineLarge = MaterialTheme.typography.headlineLarge.copy(fontFamily = bundleFont),
    headlineMedium = MaterialTheme.typography.headlineMedium.copy(fontFamily = bundleFont),
    headlineSmall = MaterialTheme.typography.headlineSmall.copy(fontFamily = bundleFont),
    titleLarge = MaterialTheme.typography.titleLarge.copy(fontFamily = bundleFont),
    titleMedium = MaterialTheme.typography.titleMedium.copy(fontFamily = bundleFont),
    titleSmall = MaterialTheme.typography.titleSmall.copy(fontFamily = bundleFont),
    bodyLarge = MaterialTheme.typography.bodyLarge.copy(fontFamily = bundleFont),
    bodyMedium = MaterialTheme.typography.bodyMedium.copy(fontFamily = bundleFont),
    bodySmall = MaterialTheme.typography.bodySmall.copy(fontFamily = bundleFont),
    labelLarge = MaterialTheme.typography.labelLarge.copy(fontFamily = bundleFont),
    labelMedium = MaterialTheme.typography.labelMedium.copy(fontFamily = bundleFont),
    labelSmall = MaterialTheme.typography.labelSmall.copy(fontFamily = bundleFont),
)

MaterialTheme(typography = overrideFontFamily) {
    // この中の Text() には自前フォントが適用されていr
}
```

これで`Web`でも日本語が表示されています！  
![Imgur](https://imgur.com/55nmhAA.png)

# おまけ マルチプラットフォーム環境の API リクエストと CloudFront のキャッシュ
これと同じみたい、ありがとうございます  
https://zenn.dev/matsubokkuri/articles/cors-cloudfront

`Ktor`がリクエストする際、`Web`の場合は`fetch()`が勝手に`Origin`ヘッダーを付けてくれますが、  
`Android`の場合は多分デフォルトだと`Origin`ヘッダー付与されません。  

![Imgur](https://imgur.com/5eZvBoT.png)

![Imgur](https://imgur.com/CpozFkp.png)

で、`CloudFront`は`Origin`ヘッダーが来たときのみ、`CORS`関連のヘッダーを付けて返しているらしい？  

何が問題になるのかというと、`CORS`関連のヘッダーが、キャッシュの中身次第では付与されないことがあるということです。  
`Origin`ヘッダーが付いていないリクエスト**をキャッシュしてしまった場合**、2回目以降は`CORS`関連の値がない状態でクライアントへ返されます。

例えば、`Web`が最初のリクエストなら、`Origin`付きのリクエストがキャッシュされてましたが、  
`Android`のような`Origin`付いてないリクエストが最初の場合、`CORS`関連のヘッダーがないレスポンスヘッダーをキャッシュするため、  
2回目`Web`がリクエストすると、そのキャッシュが帰ってきて、結果的に`CORS`エラーになってしまう。

部分的に`CloudFront`へのリクエストが`CORS エラー`でコケてて、何かと思ったらこれだった。  
![Imgur](https://imgur.com/m4VZKYl.png)

対策は`CloudFront`の`キャッシュポリシー`で、`Origin`ヘッダーをキャッシュキーとしているポリシーに変更すれば良いはず。  
キャッシュポリシー作りたい場合はヘッダーに`Origin`を、作るの面倒な場合はドロップダウンメニューにある`Elemental-MediaPackage`を使えば良いはず。  
![Imgur](https://imgur.com/lgDiNeR.png)

その下の`オリジンリクエストポリシー`は`CORS-S3Origin`にしました。  
![Imgur](https://imgur.com/5ogyRgd.png)

# ソースコード
オブジェクト一覧はこのコミットハッシュからどうぞ。  
初回起動時は設定アイコンを押して、認証情報を埋める必要があります。（`SharedPreference`、`localStorage`に永続化されます）

https://github.com/takusan23/Iroenpitu/commit/dd37c82ea54cee1a1a9fd7ec20ab77c10351ca12

このアプリを作りたかった理由が、前回`S3`と`AWS Lambda`で画像をリサイズする仕組みを作ったのですが、  
画像をいれるためにわざわざ`S3`にログインするのは面倒だった。  
あと、リサイズした画像は`CloudFront`で配信しているので、`URL`をコピーしたり、画像のプレビューがしたかった。

なので、このアプリを使って、画像をアップロードして、リサイズした画像を表示するクライアントが欲しかった。  
それが今回。

`Coil`で`AsyncImage()`をつかって、まるで写真アプリのような感じの`UI`を目指してみた。  

![Imgur](https://imgur.com/Jr8QlN1.png)

![Imgur](https://imgur.com/pKySykS.png)

# 分かったこと
https://www.jetbrains.com/help/kotlin-multiplatform-dev/faq.html#how-does-it-relate-to-jetpack-compose-for-android  
`Android`の`Jetpack Compose`と`Jetbrains`の`Compose Multiplatform`の差は無い？  
限りなく同じ API が提供されている。  
ただし、Android に依存している（`stringResource()`、`painterResource()`）は置き換えが必要。

`Kotlin Coroutines`等はそのまま使える。  
ただ、`Dispatchers.IO`は`Java`と`Kotlin/Native (?)`しか無いため、  
`IO`スレッド用`Dispatcher`を`expect val / actual val`を使って自分で作ることで`iOS`でも動かしているらしい。  
https://github.com/JetBrains/compose-multiplatform/blob/da82a7f31d69fa3ec50812d242e5c2bb053de29b/examples/imageviewer/shared/src/commonMain/kotlin/example/imageviewer/platform.common.kt#L11

そのまま使えるけど、あとも一個、これは`Kotlin/Wasm`とか関係なく、`WebAssembly`も**まだ**シングルスレッドのハズ。  
なので多分、コンカレントは正しいですが、パラレルは間違い。  
（正確にはシングルスレッドでもイベントループという方式らしく、`fetch() API`等の内部ではスレッドを使っている、ハズ）  
（が、`Web フロントエンド`開発者から見たユーザーランド（というか使える機能）では、スレッドを直接作ったりは出来ないそう）

`Kotlin/Wasm`じゃなくて、`JS`はどこいったんだいって話はこれだ、  
https://www.jetbrains.com/help/kotlin-multiplatform-dev/faq.html#what-about-future-support-for-web-targets-in-kotlin-and-compose-multiplatform

多分、`Compose`を`Web ブラウザ`に描画するために`C++`製ライブラリ`Skia`を使ってて、  
それをブラウザで動かすには`wasm`でコンパイルする必要があって、だから`Kotlin/JS`じゃなく`Kotlin/Wasm`になってるんだと思う。しらんけど。

# おわりに
`Compose Multiplatform`、思ってた以上にはいい感じに動いてる。期待以上。です！

![Imgur](https://imgur.com/fOsHkpS.png)

それはそうと、めちゃめちゃ`CPU`と`メモリ`を消費する。  
なんか黎明期の`Jetpack Compose`もこんな感じに、開発環境が重たかった気がする。一周回って懐かしい。  
https://takusan.negitoro.dev/posts/android_jc/#終わりに

あと`actual/expect`、これ`@Composable`関数でも使えます。  
ドラッグアンドドロップを`Android/Web`で実装したときのやつです。  
- 定義
    - https://github.com/takusan23/Iroenpitu/blob/master/composeApp/src/commonMain/kotlin/io/github/takusan23/iroenpitu/ui/ContentReceiveBox.kt
- Android
    - https://github.com/takusan23/Iroenpitu/blob/master/composeApp/src/androidMain/kotlin/io/github/takusan23/iroenpitu/ui/ContentReceiveBox.android.kt
- Web
    - https://github.com/takusan23/Iroenpitu/blob/master/composeApp/src/wasmJsMain/kotlin/io/github/takusan23/iroenpitu/ui/ContentReceiveBox.wasmJs.kt

# おわりに2
`Compose Multiplatform`あんまり関係ない話だけど、どうか`Maven Central`以外のライブラリホスティングを考えて欲しい、、、  
あそこお硬いし難しすぎる。やったこと無いのに言うのあれだけど、`NPM`の`npm publish`とかもっと簡単なんじゃないだろうか。 

**てか OSSRH 終わるんだけど。Central Portal って何ですか？**

![Imgur](https://imgur.com/ozj3cca.png)

# おわりに3
`Android`の`Compose`の方が、入力の補完やフォーマットがよく効いている気がする、、気のせいかな。  
`Modifier`毎に改行入れてくれないのと、`comp`で`Composable 関数`作ってくれないのが厳しい、なんか設定変えれば良いのかな。

![Imgur](https://imgur.com/lFKQmoU.png)

`actual`で`Android`側を作ってるとき、`Context`触れないの中々にきつい。。