---
title: AWS Signature V4 を Kotlin Multiplatform で作る
created_at: 2025-05-10
tags:
- AWS
- Kotlin
- KotlinMultiplatform
---
どうもこんにちわ。  
お土産をもらいました。外装がもうそれっぽい。

![お土産](https://oekakityou.negitoro.dev/resize/89da54fb-5040-4add-b3e7-eb35a3c78fec.jpg)

![お土産](https://oekakityou.negitoro.dev/resize/4aae9f71-d895-4f75-b1aa-9284544cf549.jpg)

おいしかったです！！  
ホワイトチョコのが一番かな。

![お土産](https://oekakityou.negitoro.dev/resize/16ce7481-8aee-4dcc-b887-a10f450aa01f.jpg)

# 本題
`AWS`って`CDK`（`AWS API クライアント`）がない環境（`Kotlin Multiplatform`、君だよ～～～）でもクライアントが使えるように、`REST API`を提供してます。  
`Kotlin`にも`CDK`ありますが、`JVM`だけっぽい、そんな。

じゃあ`curl`や`HTTP クライアント`で手軽に叩けるかというとそうではなく、  
`AWS SigV4 署名`と呼ばれる文字列を作り、リクエストヘッダーにくっつける必要があります。。。

![Imgur](https://imgur.com/Dd0m8pW.png)

`Authorization: AWS4-HMAC-SHA256 Credential=....`といった感じで、意味深なリクエストヘッダーがついています。  
というわけで、今回はこの文字列を作ってみようと思います。  
`Kotlin Multiplatform`に対応したライブラリを使うことで、`Java 標準ライブラリ`に頼ることなく作成できます

# 公式
https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/reference_sigv-create-signed-request.html

# 説明用に
今回は解説のために、以下のパラメーター（`アクセスキー`）などはこれを使うことにします。  
例示用のアクセスキーとか`s3`バケットないのかな、

| なまえ                        | あたい                                                          |
|-------------------------------|-----------------------------------------------------------------|
| 叩く URL の例                 | `https://s3.ap-northeast-1.amazonaws.com/myBucket/?list-type=2` |
| HTTP メソッド                 | GET                                                             |
| リージョン                    | ap-northeast-1                                                  |
| バケット名                    | myBucket                                                        |
| アクセスキー                  | AKIA0000                                                        |
| シークレットアクセスキー      | 0000                                                            |
| x-amz-date の値               | 20250507T164812Z                                                |
| yyyyMMdd した日付フォーマット | 20250507                                                        |
| サービス                      | `s3`                                                            |

# つくる
## 必要なライブラリ
もし`Kotlin Multiplatform`で`AWS SigV4 署名`を作る場合、`Java`の標準ライブラリは使えない（`Android/JVM`以外で動かない）  
ので、代替を使う必要があります。それがこれらです。

`HTTP Client`は`AWS`を`CDK`無しの`API`で操作したいなら入ってるはずなので説明は省きます。（`androidMain`に書いてあるのは`Android`だと必要なので）  
あと`URL`をパースしたり（`ホスト`/`クエリパラメータ`の部分の抽出）、`URLエンコード`の目的にも使います。

`SHA256`と`HMAC-SHA256`を計算できるマルチプラットフォーム対応ライブラリ、  
`kotlinx-datetime`はクロスプラットフォームの日付操作のためのライブラリです。

```kotlin
androidMain.dependencies {
    // 省略

    // Ktor Android Impl
    implementation("io.ktor:ktor-client-okhttp:3.1.2")
}

commonMain.dependencies {
    // 省略

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

## 用意する拡張関数
今の時間をフォーマットする関数や、ハッシュ値を出す関数なんかはよく使う or 外からも呼び出して使う予定なのでこんな感じに。

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

## 関数
引数です。この中を埋めていきます。

```kotlin
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
    // このあとすぐ
}
```

## 前座 リクエストヘッダーを更新
足りないパラメーターがあれば、署名を作成する前に追加します。

```kotlin
val httpUrl = Url(urlString = url)

// リクエストヘッダーになければ追加
requestHeader.putIfAbsent("x-amz-date", amzDateString)
requestHeader.putIfAbsent("host", httpUrl.host)
if (contentType != null) {
    requestHeader.putIfAbsent("Content-Type", contentType)
}
requestHeader.putIfAbsent("x-amz-content-sha256", payloadSha256)
```

## 1正規リクエストを作成する
https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/reference_sigv-create-signed-request.html#create-canonical-request

形式はこれです。各値を`\n`で連結する形。  
以下の形式はわかりやすく`\n`の後に改行を入れてますが、文字列を作る際は`\n`だけでいいです。改行しないでください。

```js
${HTTPMethod}\n
${CanonicalURI}\n
${CanonicalQueryString}\n
${CanonicalHeaders}\n
${SignedHeaders}\n
${HashedPayload}
```

- `HTTPMethod`は`GET`や`PUT`、`POST`などのやつ
- `CanonicalURI`は、ドメインの後から、クエリパラメータの直前までです。
    - `https://example.com/bucketName/?list-type=2`なら、`/bucketName/`
    - `URL`エンコードしてください
- `CanonicalQueryString`は、クエリパラメータを繋げて文字列にするものですが、ルールがあります
    - `URL`エンコードしてください
    - クエリパラメータの名前でソートする。（アルファベット順）
        - ソートする際は`URL`エンコード後の名前を使う必要があります
    - 名前と値は`=`で連結し、クエリパラメータ同士は`&`で連結する
- `CanonicalHeaders`は追加するリクエストヘッダーを繋げたものです
    - リクエストヘッダーの名前と値は小文字に揃える必要があります（`lowerCase()`）
    - 同様に名前でソートしてください（アルファベット順）
    - 名前と値は **:** で連結して、連結した同士は`\n`（改行）で繋げます。
        - `=`じゃない！（一敗）
    - **一番最後にも \n が必要です。**
- `SignedHeaders`はリクエストヘッダーの名前を繋げてください
    - 同様に小文字に揃えて、アルファベット順で並び替えます
    - 名前同士は`;`で連結してください
- `HashedPayload`は、リクエストボディを`SHA-256`した値です。
    - `GET`の場合等、ボディーない場合は`""`（空文字）を`SHA-256`したものを入れてください

```kotlin
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
```

うまくいくと`canonicalRequest`はこんな文字列になるはずです。  
`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`は空の`SHA2`

```plaintext
GET
/myBucket/
list-type=2
host:s3.ap-northeast-1.amazonaws.com
x-amz-content-sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
x-amz-date:20250507T164812Z

host;x-amz-content-sha256;x-amz-date
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```


## 2正規リクエストのハッシュを作成する
https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/reference_sigv-create-signed-request.html#create-canonical-request-hash

`HashedPayload`と同じハッシュ関数（`SHA-256`）で、↑で作った`canonicalRequest`をハッシュ化します。  
文字列の`16進数`を取得してください。

```kotlin
// 2.正規リクエストのハッシュを作成する。ペイロードと同じハッシュ関数
val hashedCanonicalRequest = canonicalRequest.sha256().toHexString()
```

```plaintext
ac5c69c03c2cb898197213a13ccb017423f4bc733b6912f3c75945f473387060
```

## 3署名文字列を作成する
https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/reference_sigv-create-signed-request.html#create-string-to-sign

形式はこれです。各値を`\n`で連結する形。  
先述の通りですが、わかりやすさのために`\n`の後に改行を入れてますが、文字列を作る際は改行無しで`\n`のみでよいです。

```js
${Algorithm}\n
${RequestDateTime}\n
${CredentialScope}\n
${HashedCanonicalRequest}
```

- `Algorithm`ですが、これは`AWS4-HMAC-SHA256`でよいはず
- `RequestDateTime`は`ISO8601`形式の今の時間です
    - `x-amz-date`のリクエストヘッダーの値を入れればよいです
- `CredentialScope`は、以下の文字列の形式です
    - `${yyyyMMdd}/${region}/${service}/aws4_request`
    - `yyyyMMdd`には今の時間を`yyyy/MM/dd`形式にフォーマットしたものを入れてください（`SimpleDateFormat()`は、、おじいちゃんか）
    - `region`には`AWS`のリージョンを
    - `service`は`s3`とか`ec2`が入ります
    - 最後の`aws4_request`は固定らしいです
- `HashedCanonicalRequest`は、手順2でやった、`hashedCanonicalRequest`を入れてください。

```kotlin
// 3.署名文字列を作成する
val algorithm = "AWS4-HMAC-SHA256"
val requestDateTime = amzDateString
val credentialScope = "$yyyyMMddString/$region/$service/aws4_request"
val stringToSign = algorithm + "\n" + requestDateTime + "\n" + credentialScope + "\n" + hashedCanonicalRequest
```

うまくいくと、こんな文字列になるはずです。

```plaintext
AWS4-HMAC-SHA256
20250507T164812Z
20250507/ap-northeast-1/s3/aws4_request
ac5c69c03c2cb898197213a13ccb017423f4bc733b6912f3c75945f473387060
```

## 4SigV4の署名キーの取得
https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/reference_sigv-create-signed-request.html#derive-signing-key

ここでシークレットアクセスキーがやっと登場する形になります。

これはもうコード貼ったほうが早いのでそうします。説明できる気がしない。  
ここで`HMAC-SHA256`が登場します。前回のハッシュ値を使って、次のハッシュ値の計算をする複雑なやつ。

- 1.`AWS4$secretAccessKey`をバイト配列にしたものをキー、今の時間を`yyyy/MM/dd`でフォーマットしたものを値にして、`HMAC-SHA256`を計算
- 2.`1`で出したハッシュをキー、`AWS`のリージョンを値として、`HMAC-SHA256`を計算
- 3.`2`で出したハッシュをキー、サービス（`s3`とか）を値として、`HMAC-SHA256`を計算
- 4.`3`で出したハッシュをキー、`aws4_request`の文字列を値として、`HMAC-SHA256`を計算

```kotlin
// 4.SigV4 の署名キーの取得
val dateKey = "AWS4$secretAccessKey".toByteArray(Charsets.UTF_8).hmacSha256(message = yyyyMMddString)
val dateRegionKey = dateKey.hmacSha256(message = region)
val dateRegionServiceKey = dateRegionKey.hmacSha256(message = service)
val signingKey = dateRegionServiceKey.hmacSha256(message = "aws4_request")
```

この`signingKey`を`16進数文字列`にした結果がこれになってるはず？  

```plaintext
8645308c3a6e25e207681d29e27240eaa62140ce3624a719be42f005a3225bfe
```

## 5署名を計算する
https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/reference_sigv-create-signed-request.html#calculate-signature

`signingKey`をキー、手順3で作った`stringToSign`を値として、`HMAC-SHA256`を計算。  
これを`16進数文字列`にする。小文字は念のため呼んでいる。

```kotlin
// 5.署名を計算する
val signature = signingKey.hmacSha256(message = stringToSign).toHexString().lowercase()
```

多分こんな文字列になるはずです。  

```plaintext
d0feff0891c0ca4a27641bce11ac1e1ec60f0380c5a6d72cad42f53fb86061b9
```

## 6リクエストヘッダーにつける文字列を完成させる
https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/reference_sigv-create-signed-request.html#add-signature-to-request

`Authorization: ${ここの文字列}`を作ります。  
これも文字列を連結させるのですが、こうです。

```js
AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope},SignedHeaders=${signedHeaders},Signature=${signature}
```

- `accessKey`がアクセスキー、シークレットアクセスキーと対になっているあれ
- `credentialScope`は手順3で作ったものを使えばよいです
- `signedHeaders`も手順1で作ったものを使えばよいです
- `signature`は手順5で作ったものになります！

```kotlin
// 6.リクエストヘッダーに署名を追加する
val authorizationHeaderValue = algorithm + " " + "Credential=$accessKey/$credentialScope" + "," + "SignedHeaders=$signedHeaders" + "," + "Signature=$signature"
return authorizationHeaderValue
```

こんな文字列になるはずです。  

```plaintext
AWS4-HMAC-SHA256 Credential=AKIA0000/20250507/ap-northeast-1/s3/aws4_request,SignedHeaders=host;x-amz-content-sha256;x-amz-date,Signature=d0feff0891c0ca4a27641bce11ac1e1ec60f0380c5a6d72cad42f53fb86061b9
```

# ここまで

```kotlin
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
```

# 使ってみる
`Kotlin Multiplatform`の`Compose`の画面で実行してみます。  
手始めにバケットの中身を取得する`ListObjectsV2 API`を叩いてみようと思います。  
https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html

```kotlin
// TODO 皆さんそれぞれ設定してください！！！
const val bucketName = ""
const val region = "ap-northeast-1"
const val secretAccessKey = ""
const val accessKey = ""

/** Kotlin Multiplatform Compose */
@Composable
@Preview
fun App() {
    MaterialTheme {

        // バケットの中身を取得する REST API を叩く
        val responseXml = remember { mutableStateOf("") }
        LaunchedEffect(key1 = Unit) {
            val now = Clock.System.now()
            val url = "https://s3.$region.amazonaws.com/$bucketName/?list-type=2"
            val amzDateString = now.formatAmzDateString()
            val yyyyMMddString = now.formatYearMonthDayDateString()

            // 署名を作成
            val requestHeader = hashMapOf(
                "x-amz-date" to amzDateString,
                "host" to "s3.$region.amazonaws.com"
            )
            val signature = generateAwsSign(
                url = url,
                httpMethod = "GET",
                contentType = null,
                region = region,
                service = "s3",
                amzDateString = amzDateString,
                yyyyMMddString = yyyyMMddString,
                secretAccessKey = secretAccessKey,
                accessKey = accessKey,
                requestHeader = requestHeader
            )

            // レスポンス xml を取得
            val httpClient = HttpClient()
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
            responseXml.value = response.bodyAsText()
        }


        var showContent by remember { mutableStateOf(false) }
        Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
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

            Text(text = responseXml.value)
        }
    }
}
```

実行してみると、`Android`でも`Webブラウザ (Wasm)`でも表示できているはずです。**Kotlin Multiplatform で AWS 出来ましたね！！！**  
`iOS`は`mac`がなくわかりません。。。

あ、もし`Webブラウザ (Wasm)`でリクエストしたい場合は、`S3`バケットの`CORS`設定を変更する必要があります。  
https://docs.aws.amazon.com/ja_jp/sdk-for-javascript/v2/developer-guide/s3-example-photo-album.html#s3-example-photo-album-cors-configuration

すげー、ちゃんとマルチプラットフォームだ。。。

![Imgur](https://imgur.com/hMGLiuo.png)

# ソースコード
https://github.com/takusan23/MultiplatformAwsSignV4

# おわりに1
https://github.com/lucasweb78/aws-v4-signer-java

大変参考になりました。

# おわりに2
超絶どうでもいい話ですが、

`Cloudflare`もオブジェクトストレージとして`R2`ってのを提供しているけど、  
名前の由来が`AWS`の`S3`から一文字ずつずらしたって話すき。