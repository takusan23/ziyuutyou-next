---
title: Kotlin/JSでサイトを作って公開する
created_at: 2021-08-13
tags:
- KotlinJS
- Kotlin
- JavaScript
---

夜勤明け ~~(のなんでも出来そうな気分の中)~~ `Kotlin/JS`を初めて触ったら面白かったので記事にする。  

# 本題
残りの日数を数えるWebサイトを`Kotlin/JS`で作ります。  
これなら簡単に作れそう。

# Kotlin/JS #とは
KotlinコードをJSにトランスパイルする。  
JSみたいにDOM操作とかも出来る。

# IDEAを開き新規プロジェクトを作成します

## 追記 2023/12/26
なんか画面が変わって作り方も変わってしかもよく分からなくなってるのでこっちも見て下さい。  
https://takusan.negitoro.dev/posts/kotlin_js_fix_javascript_mediarecorder_webm_seek/

`Gradle`を押して、`Kotlin DSL build script`にチェックを入れ、`Kotlin/JS for browser`を選択します。

![Imgur](https://i.imgur.com/mjYwnR1.png)

名前とかは適当に入れてください。

![Imgur](https://i.imgur.com/hg9WgLW.png)

生成後しばらく待ちます。

# 起動する

IDEA右下の`Terminal`をおして、以下のコマンドを入れます。

```
./gradlew run --continuous
```

これはホットリロード付きで開発サーバーを起動するコマンドです。勝手にブラウザが起動するはずです。

初回起動時は、ファイアウォールが許可するか聞いてくるので許可してあげてください。

無事ブラウザに`Hello World`が出てれば成功です。

![Imgur](https://i.imgur.com/EihsdkV.png)

# index.html を書き換える

`src/main/resources/index.html`が`index.html`になります。  

## `script`タグを移動
`<script>タグ`を`<body>`タグの下に移動させます。  
これをしないと多分`DOM操作時にぬるぽ吐きます。`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CountdownKotlinJS</title>
</head>
<body>

</body>

<script src="CountdownKotlinJS.js"></script>

</html>
```

## 適当にUIを作る

```html
<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <title>CountdownKotlinJS</title>
</head>

<style>
    .title {
        font-size: 30px;
    }

    .subtitle {
        font-size: 20px;
    }

    .card {
        width: 50%;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 10px;
        border-radius: 5px;
        padding: 10px;
        box-shadow: 0 2px 5px #ccc;
    }

    .divider {
        border-top: 1px solid #ccc
    }
</style>

<body>

    <div class="card">
        <p class="title">カウントダウン</p>
        <div class="divider"></div>
        <p class="subtitle">日付の選択</p>
        <p align="center">
            <input type="date" id="date_input">
            <input type="button" id="calc_button" value="残り日数計算">
        </p>
        <div class="divider"></div>
        <p class="subtitle">残り</p>
        <p align="center" class="title" id="countdown_text"></p>
    </div>
</body>

<script src="CountdownKotlinJS.js"></script>

</html>
```

# Kotlin

とりあえず日付を取得するまで

```kotlin
import kotlinx.browser.document
import kotlinx.browser.window
import org.w3c.dom.HTMLInputElement

fun main() {

    // 残り日数表示要素
    val countdownTextElement = document.getElementById("countdown_text")!!
    // ボタン
    val calcButton = document.getElementById("calc_button")!!
    // 日付入力要素
    val dateInputElement = document.getElementById("date_input")!! as HTMLInputElement

    // ボタン押したとき
    calcButton.addEventListener("click", {
        // 日付取得
        val dateString = dateInputElement.value
        window.alert(dateString)
    })
}
```

日付を入れてボタンを押したらアラートが出ると思います。

![Imgur](https://i.imgur.com/GckVewI.png)

## 日付計算ライブラリ
別にJS標準の`Date`を使うって手もある。

今回は`dayjs`を入れようと思います。  
`Kotlin/JS`でも`npm`からライブラリを入れることが出来ます。

`build.gradle.kts`に書き足します。  
日付ライブラリといえば`moment.js`ですが、今回は`dayjs`を使います。軽いらしい？

```gradle
plugins {
    id("org.jetbrains.kotlin.js") version "1.5.10"
}

group = "io.github.takusan23"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation(kotlin("stdlib-js"))

    // 日付計算
    implementation(npm("dayjs", "1.10.6"))

}
```

## JSのライブラリをKotlinで使う
`JS`は動的に型をつけますが、`Kotlin`では静的に型をつけます。  
普通に考えるとJSライブラリが使えないように見えますが、`Kotlin/JS`には`dynamic`型が用意されています。

これを使うと`JS`みたいに書くことが出来ます。なおこれを使うと`Kotlin`の`Null安全`等の恩恵が受けれなくなるので`Kotlinで書く意味・・・？`

```kotlin
/** dayjs読み込み */
@JsModule("dayjs")
@JsNonModule
external fun dayjs(): dynamic
```

## 残り日数計算

を含めた完全版です。

```kotlin
import kotlinx.browser.document
import org.w3c.dom.HTMLInputElement

/** dayjs（コンストラクタあり）読み込み */
@JsModule("dayjs")
@JsNonModule
external fun dayjs(d: dynamic): dynamic

/** dayjs読み込み */
@JsModule("dayjs")
@JsNonModule
external fun dayjs(): dynamic

fun main() {

    // 残り日数表示要素
    val countdownTextElement = document.getElementById("countdown_text")!!
    // ボタン
    val calcButton = document.getElementById("calc_button")!!
    // 日付入力要素
    val dateInputElement = document.getElementById("date_input")!! as HTMLInputElement

    // ボタン押したとき
    calcButton.addEventListener("click", {
        // 日付取得
        val dateString = dateInputElement.value
        val countdown = dayjs(dateString).diff(dayjs(), "day") as Int
        countdownTextElement.textContent = "残り $countdown 日"
    })
}
```

これで残りの日数を表示できます。やったね。

![Imgur](https://i.imgur.com/gCc7Z3I.png)

# 書き出す(ビルド)

ターミナルに以下のコマンドを入力すことでHTMLを書き出すことが出来ます。  

```gradle
./gradlew browserWebpack
```

`build/distributions`に書き出されます。

![Imgur](https://i.imgur.com/zJ3U8Iw.png)

# ホスティング
今回は`Netlify`にホスティングして公開します。  

## とりあえずGitHubに公開する
ここから出来ます。

![Imgur](https://i.imgur.com/jJn3857.png)

## Netlifyで公開

ビルドコマンドのところを空白にします。  
おま環だろうけど、`Netlify`でビルド出来なかったので`GitHub Actions`でビルドして、結果だけNetlifyに公開するようにする。

ビルドしないように設定を変更します。`Site settings`から`Build & deploy`をおし、`Stop builds`します。

![Imgur](https://i.imgur.com/Bb945fO.png)

# GitHub Actions の前に
リポジトリの設定を開いて、`Secrets`を開きます。  
この中に、必要な値を保存しておきます。

## NETLIFY_AUTH_TOKEN
Netlifyのアカウント設定へ進んで、`Applications`の中の`Personal access tokens`までスクロールして、`New access token`を押して払い出してもらいます。

## NETLIFY_SITE_ID
これはさっき公開したサイトの設定へすすんで、`Site information`の中の`API ID:`の値です

こんなふう

![Imgur](https://i.imgur.com/LUm0oxZ.png)

# GitHub Actions を組む
リポジトリの`Actions`を選択して、`set up a workflow yourself`を押して作成します。

![Imgur](https://i.imgur.com/Pd2OpNz.png)

そしたら以下コピペ

```yml
# 参考にした。thx!：https://qiita.com/nwtgck/items/e9a355c2ccb03d8e8eb0

name: Netlify

on:
  push:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      
      # 権限の変更
      - name: Grant permission
        run: chmod +x ./gradlew
      
      # HTML書き出し（ビルド）
      - name: Making html
        run: ./gradlew browserWebpack 
      
      # Netlifyにデプロイする
      - name: Upload netlify
        run: npx netlify-cli deploy --dir=./build/distributions --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

できたら`Commit`して`Actions`へ移動して見てみます。

作業進行中

![Imgur](https://i.imgur.com/gwxC5in.png)

終わったらNetlifyで公開したサイトのURLを開いてます。無事開けたら成功です。

# 終わりに
完成品です：https://countdown-kotlinjs.netlify.app/  
ソースコードです：https://github.com/takusan23/CountdownKotlinJS