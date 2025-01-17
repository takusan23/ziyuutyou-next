---
title: JavaScriptでパソコンの画面録画とMPEG-DASHでライブ配信
created_at: 2022-09-13
tags:
- Kotlin
- DASH
- JavaScript
---

どうもこんにちは  
Dreamin'Her -僕は、彼女の夢を見る。- 攻略しました。(全年齢)  

声優さんが良かったです（詳しくないので分からないですが）
![Imgur](https://i.imgur.com/70hd72N.png)

中盤がけっこう？重いのですがエンディングはよく出来てていいと思います。

タイトル通りだ...

![Imgur](https://i.imgur.com/qFAMtAP.png)

![Imgur](https://i.imgur.com/sPKP4BO.png)

![Imgur](https://i.imgur.com/FYY4Cyy.png)

あとOP曲がめっちゃいい。  
作品とリンクしてる！！！

*せめて 私を 過去にして 今紡ごう 未来を ...*  

OP曲の`おやすみモノクローム`、めっちゃいい

（ゲームはSteamで買えます。）

# 本題

最近のブラウザって数行かけば画面の録画が出来るらしいんですよね、試してみます。  
前回の記事の副産物になります [これ](/posts/android_standalone_webm_livestreaming/)

# ブラウザで録画するまで

- `getDisplayMedia`で画面録画の`MediaStream`を取得
- ↑`MediaRecorder`の入力にする
- `webm`が出来る

なんやこれ...Androidでやるより簡単！ ( https://takusan23.github.io/Bibouroku/2020/04/06/MediaProjection/ )、JSすげ～  

流石にPC版にしか実装されてませんでしたが、そりゃそうか→ https://caniuse.com/?search=getDisplayMedia

# 環境

| なまえ  | あたい                                                                      |
|---------|-----------------------------------------------------------------------------|
| Windows | 10 Pro 21H2 (Win11のコンテキストメニュー使いにくいのどうにかならないの；；) |
| Chrome  | 105                                                                         |

多分`localhost`みたいな内部サーバーを立てなくても、`file`スキーマで動く...？

## ブラウザでパソコンの画面を取得する（ミラーリング）
`<video>`でパソコンの画面をミラーするだけならこれだけで動きます、何やこれ一体...

![Imgur](https://i.imgur.com/wrmpuFZ.png)

これだけ（Promiseがリジェクトされた場合などは見てないですが）でパソコンの画面がvideo要素内で再生できています！

![Imgur](https://i.imgur.com/aCMWFR9.png)

```html
<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>getUserMedia</title>
</head>

<body>
    <div class="parent">
        <button id="rec_button">録画開始</button>
        <video id="video" width="640" height="320" muted autoplay />
    </div>
</body>

<style>
    .parent {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
</style>

<script>
    const recordButton = document.getElementById('rec_button')
    const videoElement = document.getElementById('video')

    // 録画を開始して、canvasに描画する
    const startRec = async () => {
        // 画面をキャプチャーしてくれるやつ
        const displayMedia = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })
        // とりあえず video要素 で再生
        videoElement.srcObject = displayMedia
    }

    // 録画ボタン投下時
    recordButton.onclick = () => {
        startRec()
    }

</script>

</html>
```

## パソコンの画面を録画する
`MediaRecorder`に`getDisplayMedia()`の返り値を入れることで、録画もできます！  

参考になりました！  
https://qiita.com/miyataku/items/6ed855a7fb7507ccc244

ちゃんとダウンロードできる

![Imgur](https://i.imgur.com/3wnkTpl.png)

```html
<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>getUserMedia</title>
</head>

<body>
    <div class="parent">
        <button id="rec_button">録画開始</button>
        <button id="stop_button">録画終了</button>
        <video id="video" width="640" height="320" muted autoplay />
    </div>
</body>

<style>
    .parent {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
</style>

<script>

    // @ts-check

    // 今回利用するコンテナフォーマット、コーデック
    const MIME_TYPE = `video/webm; codecs="vp9,opus"`
    // 録画するやつ
    let mediaRecorder
    // WebMデータが細切れになって来るので一時的に保存する
    let chunks = []

    const recordButton = document.getElementById('rec_button')
    const stopButton = document.getElementById('stop_button')
    const videoElement = document.getElementById('video')

    // 録画を開始して、canvasに描画する
    const startRec = async () => {
        // 画面をキャプチャーしてくれるやつ
        const displayMedia = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })
        // パソコンの画面を流す
        mediaRecorder = new MediaRecorder(displayMedia, { mimeType: MIME_TYPE })
        // 録画データが着たら呼ばれる
        mediaRecorder.ondataavailable = (ev) => {
            chunks.push(ev.data)
        }
        // 録画開始。100msごとに ondataavailable が呼ばれてデータが貰えるように。
        mediaRecorder.start(100)
        // とりあえず video要素 で再生
        videoElement.srcObject = displayMedia
    }

    // 録画ボタン投下時
    recordButton.onclick = () => {
        startRec()
    }

    // 終了ボタン投下時
    stopButton.onclick = () => {
        // 録画を止める
        mediaRecorder.stop()
        // BlobUrlを作成し、a要素でリンクを作りJSで押すことでダウンロードさせる（DL出来るんだ！
        const blob = new Blob(chunks, { type: MIME_TYPE })
        const blobUrl = URL.createObjectURL(blob)
        const aElement = document.createElement('a')
        aElement.style.display = 'none'
        aElement.href = blobUrl
        aElement.download = `record-${Date.now()}.webm`
        document.body.appendChild(aElement)
        aElement.click()
        // TODO BlobUrlのリソース開放
    }

</script>

</html>
```

ちなみにこれで生成される`webm`は再生時間がヘッダー部分に入っていないため、シークが遅いらしい。  
ここまでのソースコードおいておきます

https://github.com/takusan23/browser-screen-record  

`index.html`をコピペしてブラウザで開けば使えると思います。

## しくみ
`MediaRecorder`の`ondataavailable`は録画したデータが貰えるコールバックになってます。  
`MediaRecorder#start()`の引数に時間をミリ秒で入れると（上記だと100ミリ秒（0.1秒））、その時間の間隔で`ondataavailable`が呼ばれます。  
これを配列に順次保存して、最後に結合してダウンロードしています。

つまり、`ondataavailable`で貰えるデータを他のブラウザとかに何らかの方法（`WebSocket`とか）で送信できれば、ローカルライブ配信の完成になります。！！！

**ちなみに、**`ondataavailable`はあくまでもデータを分割してるだけなので、全部揃わないと動画ファイルとしては成り立たないです。  
最初の動画は単独で再生できますが、２個目以降はメタデータ？が入ってないので再生できません。  
（もしかすると最初のヘッダー部分があればなんか再生できるかもしれないです...）

# これができれば WebM でライブ配信が出来るのでは？
[前回の記事](/posts/android_standalone_webm_livestreaming/) のAndroidと違い、サーバー側が必要ですが似たようなことができそうなのでやってみます。

## 環境

| なまえ         | あたい                    |
|----------------|---------------------------|
| サーバー側言語 | Kotlin (Ktor使いたい...!) |
| サーバー側技術 | Ktor                      |
| フロント側技術 | dash.js                   |

## WebM / MPEG-DASH でライブ配信
`MPEG-DASH`で出来るのですが、ただ`WebM`を公開すればいいという**わけではなく**、`初期化セグメント`と`メディアセグメント`に分ける必要があります。  
が、今回は面倒なので最初に出てきた`webm`を初期化セグメントとして使おうかなと  
ちなみに`初期化セグメント`は多分`Clusterの開始タグ`（`0x1F 0x43 0xB6 0x75`）の前までです。ちゃんとやるならその範囲だけのファイル(`init.webm`)みたいなのを作るべきだと思います。

詳しくは [前回の記事](/posts/android_standalone_webm_livestreaming/) で

### ちなみ に最初に出てきた`webm`を初期化セグメントとして利用できる理由
単純に`Clusterの開始タグ`より前の部分が含まれているから。  
デコーダーの起動に必要なメタデータが含まれているのが、最初に呼ばれる`ondataavailable`にはある。

(２個目以降には含まれていないため、２個目以降のバイナリを渡したところで再生できない；；)

## Ktorで適当にAPIをつくる
バックエンドは何も詳しくないので...

- `/api/upload`
    - Webフロントの`MediaRecorder`の`ondataavailable`が呼ばれたらバイナリを送るAPI。POST
    - よく知らんけど `multipart-formdata` にする
- `/`
    - `index.html`を返す、視聴ページ 兼 録画ページ
- `manifest.mpd`
    - `MPEG-DASH`のマニフェストを返します。`dash.js`に渡す
- `segment1.webm`、`segment2.webm`...
    - `/api/upload`のファイルを保存しているフォルダを静的配信する
    - Ktorのstatic公開機能で

# サクサクっと作る

適当に`IDEA`でプロジェクトを作ります。  
`Ktor`、簡単にWebサーバーが立てれていい感じ。バックエンドよく分からんけど；；

![Imgur](https://i.imgur.com/5PXwH3j.png)

## ライブラリを入れる
`build.gradle.kts`に書き足します。

```kotlin
dependencies {

    // Ktor
    val ktorVersion = "2.1.1"
    implementation("io.ktor:ktor-server-core:$ktorVersion")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")

    testImplementation(kotlin("test"))
}
```

## Main.kt
なんか`Main.kt`がドメインのパッケージに居ない（と言うかドメインのパッケージすら無い）ので作って移動させます。  
`Kotlin`だといらないんですかね（そんな事ある？）

`ドメイン名.アプリ名`みたいな感じのパッケージを作って移動させました。`io.github.takusan23.browserdashmirroring`

![Imgur](https://i.imgur.com/WasHxwe.png)


```kotlin
package io.github.takusan23.browserdashmirroring

import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.http.content.*
import io.ktor.server.netty.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.io.File

fun main(args: Array<String>) {

    // 映像の保存先
    // プロジェクトのフォルダに作る
    // Node.js の process.cwd() みたいな
    val projectFolder = System.getProperty("user.dir")
    val segmentSaveFolder = File(projectFolder, "static").apply {
        listFiles()?.forEach { it.delete() }
        mkdir()
    }

    // セグメントのインデックス
    var index = 0

    println("http://localhost:8080")

    embeddedServer(Netty, port = 8080) {
        routing {
            // プロジェクトの resources フォルダから取得
            // index.html を返す
            resource("/", "index.html")
            // マニフェストを返す
            resource("/manifest.mpd", "manifest.mpd")

            // フロント側からWebMの細切れが送られてくるので保存していく
            post("/api/upload") {
                // Multipart-FormDataを受け取る
                call.receiveMultipart().forEachPart { partData ->
                    if (partData is PartData.FileItem) {
                        // ファイルを作って保存
                        File(segmentSaveFolder, "segment${index++}.webm").apply {
                            createNewFile()
                            writeBytes(partData.streamProvider().readAllBytes())
                        }
                    }
                }
                call.respond(HttpStatusCode.OK, "保存できました")
            }

            // 静的ファイル公開するように。動画を配信する
            static {
                staticRootFolder = segmentSaveFolder
                files(segmentSaveFolder)
            }
        }
    }.start(true)
}
```

フロントが投げてきたデータは上記の例だとここに保存されます。  

![Imgur](https://i.imgur.com/xlqra1d.png)

## index.html
`resources`に置きます。こ↑こ↓です

![Imgur](https://i.imgur.com/cHSV5Oi.png)

```html
<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>getUserMedia</title>
    <!-- MPEG-DASH 視聴用 -->
    <script src="https://cdn.dashjs.org/latest/dash.all.debug.js"></script>
</head>

<body>
    <div class="parent">
        <button id="live_button">配信開始</button>
        <button id="watch_button">視聴開始</button>
        <video id="video" width="640" height="320" muted autoplay />
    </div>
</body>

<style>
    .parent {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
</style>

<script>

    // @ts-check

    // 今回利用するコンテナフォーマット、コーデック
    const MIME_TYPE = `video/webm; codecs="vp9"`
    // 録画するやつ
    let mediaRecorder
    // WebMデータが細切れになって来るので一時的に保存する
    let chunks = []
    // 映像を送る間隔
    const SEND_INTERVAL_MS = 3_000

    const recordButton = document.getElementById('live_button')
    const watchButton = document.getElementById('watch_button')
    const videoElement = document.getElementById('video')

    // サーバーに映像を送る
    const sendSegment = (segment) => {
        const form = new FormData()
        form.append('data', segment)
        fetch('/api/upload', { method: 'POST', body: form })
    }

    // 録画を開始して、canvasに描画する
    const startRec = async () => {
        // 画面をキャプチャーしてくれるやつ
        const displayMedia = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })
        // パソコンの画面を流す
        mediaRecorder = new MediaRecorder(displayMedia, { mimeType: MIME_TYPE })
        // 録画データが着たら呼ばれる。サーバーに送る
        mediaRecorder.ondataavailable = (ev) => {
            sendSegment(ev.data)
        }
        // 録画開始
        mediaRecorder.start(SEND_INTERVAL_MS)
        // とりあえず video要素 で再生
        videoElement.srcObject = displayMedia
    }

    // 配信ボタン投下時
    recordButton.onclick = () => {
        startRec()
    }

    // 視聴ボタン投下時
    // dash.js による MPEG-DASH の再生を試みる
    watchButton.onclick = () => {
        const url = "/manifest.mpd";
        const player = dashjs.MediaPlayer().create();
        player.initialize(videoElement, url, true);
    }

</script>

</html>
```

## manifest.mpd
これも`resources`に置きます。  
とりあえず動いたのを書いてるので、多分なんか無駄なことしてると思います。

```xml
<?xml version="1.0" encoding="utf-8"?>
<MPD xmlns="urn:mpeg:dash:schema:mpd:2011" maxSegmentDuration="PT3S" minBufferTime="PT3S" type="dynamic" profiles="urn:mpeg:dash:profile:isoff-live:2011,http://dashif.org/guidelines/dash-if-simple">
  <BaseURL>/</BaseURL>
  <Period start="PT0S">
    <AdaptationSet mimeType="video/webm">
      <Role schemeIdUri="urn:mpeg:dash:role:2011" value="main" />
      <SegmentTemplate duration="3" initialization="/segment0.webm" media="/segment$Number$.webm" startNumber="1"/>
      <Representation id="default" codecs="vp9"/>
    </AdaptationSet>
  </Period>
</MPD>
```

# 起動

`main関数`の再生ボタンみたいなのを押すと起動できます。  
<span style="color:green">▶</span> ←これ

![Imgur](https://i.imgur.com/lalzp0P.png)

`http://localhost:8080`を開き、`配信開始`を押します。配信でもプレビューが流れます。  
数秒後にもう一つブラウザで`http://localhost:8080`を開き、今度は`視聴開始`を押します。これで配信側の映像が流れてくると思います。

スマホでも視聴なら出来るはず。

![Imgur](https://i.imgur.com/dRvd2Rg.png)

**すごい！！サーバー側は仲介しかして無いのになんちゃってライブ配信が完成しました！**

# 真面目に作るには
動いたことに満足したのですが、まだ直したほうがいいところがあります。

- 配信をやめて再配信する場合
    - 再度配信するためにはセグメントフォルダの中身を消すのと、インデックスを0に戻す必要があります。
    - 現状はサーバーを再起動しないと再配信できません。
- 視聴側が最初から再生されてしまう（すでにセグメントが生成されているのに）
    - リロードして視聴を再度始めると最初から始まる
    - $Number$ を`0`から開始しないようにすればいい
    - マニフェストで`availabilityStartTime`をセットすることで、途中から視聴した場合も最新のが取得されるはずです。
        - `availabilityStartTime`はライブ配信が利用可能になる時間（ISO 8601）
        - `availabilityStartTime="2022-09-13T00:00:00+09:00"`

```xml
<?xml version="1.0" encoding="utf-8"?>
<MPD xmlns="urn:mpeg:dash:schema:mpd:2011" availabilityStartTime="2022-09-13T00:00:00+09:00" maxSegmentDuration="PT3S" minBufferTime="PT3S" type="dynamic" profiles="urn:mpeg:dash:profile:isoff-live:2011,http://dashif.org/guidelines/dash-if-simple">
  <BaseURL>/</BaseURL>
  <Period start="PT0S">
    <AdaptationSet mimeType="video/webm">
      <Role schemeIdUri="urn:mpeg:dash:role:2011" value="main" />
      <SegmentTemplate duration="3" initialization="/segment0.webm" media="/segment$Number$.webm" startNumber="1"/>
      <Representation id="default" codecs="vp9"/>
    </AdaptationSet>
  </Period>
</MPD>
```

# Q&A

## iOS と iPad OS で再生できますか

- iPad OS なら再生できると思います
- iOS は `MediaSource Extensions API`に対応すれば動くと思います。

詳しくは [前回の記事](/posts/android_standalone_webm_livestreaming/) で

# 参考になりました
助かります！！！

- https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API
- https://www.slideshare.net/mganeko/media-recorder-and-webm
- https://qiita.com/tomoyukilabs/items/57ba8a982ab372611669

# おわりに
お疲れ様でした、ﾉｼ 888888

## ソースコードです
https://github.com/takusan23/BrowserDashMirroring
