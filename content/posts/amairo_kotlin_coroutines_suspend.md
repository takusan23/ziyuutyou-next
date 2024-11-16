---
title: あまいろ Kotlin Coroutines サスペンド関数編
created_at: 2024-08-18
tags:
- Android
- Kotlin
- KotlinCoroutines
- KotlinCoroutines解説
---

どうもこんばんわ。  
あまいろショコラータ１・２・３ コンプリートパックを買ってやっています。買ったのは3の発売のときだったので積んでたことになりますね、、  
まずは、あまいろショコラータ攻略しました。

みくりちゃん！！！ところどころにあるやりとりがおもしろかった

![Imgur](https://imgur.com/BSOqoO6.png)

![Imgur](https://imgur.com/N1GNFtI.png)

↑じとめすち

むくれてるのかわい～

![Imgur](https://imgur.com/iLaQDYp.png)

![Imgur](https://imgur.com/HGdpYFV.png)

英語分からん分かる、英語が第一言語だとやっぱドキュメントもエラーメッセージもそのまま分かるのでしょうか。  
直でドキュメント読めるのずるいとおもう（？）

![Imgur](https://imgur.com/6ZfPHp3.png)

`><`  
それはそうと服が似合ってていい

![Imgur](https://imgur.com/U74mT9k.png)

あとあんまり関係ないけど無印版のエンディング曲がシリーズの中で一番好きかもしれません、  

![Imgur](https://imgur.com/D5mMP92.png)

あ！！！！！これ  
このブログの土日祝日のアクセス数のこと言ってますか！？？！？！？！

![Imgur](https://imgur.com/RbleuSx.png)

技術（？）ブログ、休みの日はあんまりお客さん来てない。  
`CloudFront`の転送量を`CloudWatch`で見てみたけど、明らかに休みの日だけ折れ線グラフがガタ落ちしてる。面白い。

# 本題
`Jetpack Compose`がぶいぶい言わせている今日、`Jetpack Compose`ではありとあらゆるところで`Kotlin Coroutines`のサスペンド関数や、`Flow`が多用されています。  
（`Android`はかなり）コールバック地獄だったので、他の言語にあるような同期スタイルで記述でき、とても嬉しいわけですが、、、、  

その割には`Android`本家の`Kotlin Coroutines`の紹介がおざなりというか、分かる人向けにしか書いていません！（別に`Android`側が紹介する義理なんて無いけど）  
`Jetpack Compose`であれだけ多用しているのに！？！？（いや関係ないだろ）  
https://developer.android.com/kotlin/coroutines

かくいう私もあんまり理解できてない、、、なんとなくで書いている。  
数年前からふいんき（なぜか変換できない）で書いているので真面目にやります。  
https://takusan.negitoro.dev/posts/android_sqlite_to_room/#なんでコルーチン

というわけで今回は`Kotlin Coroutines`のドキュメントを読んでみようの会です。ぜひ夏休みの読書感想文にどうぞ。（てか世間は夏休みなのか）  
https://kotlinlang.org/docs/coroutines-guide.html

`Kotlin Coroutines`の話をするのに、`Android`である必要はないんですが、私がサンプルコード書くのが楽というだけです。  
特別なことがなければ`Android`じゃない環境、`Kotlin/JVM`とかでも転用できます。

いちおうドキュメントの流れに沿って読んでいこうかなと思うのですが、  
**スレッドと違い、なぜコルーチンは欲しいときに欲しいだけ作っていいのか**とかの話をしないと興味がわかないかなと思いそこだけ先にします。

多分合ってると思う、間違ってたらごめん。

# 環境
まあ分かりやすいと思うので`Android`で、あとは`Jetpack Compose`を使います。  

もしサンプルコードを動かすなら↓  
サンプルとしてインターネット通信が挙げられると思うので、`OkHttp`という`HTTP クライアントライブラリ`も入れます。  
インターネット通信のサンプルがあるため、インターネット権限を付与したプロジェクト（アプリ）を作っておいてください。

# はじめに
https://kotlinlang.org/docs/coroutines-guide.html

`Future`とか`Promise`とか`async / await`を知っていればもっと分かりやすいかもしれませんが**知らなくても**いいです。なんなら忘れても良いです。  
というのも`Future`や`Promise`には無い安全設計が存在したり、`Kotlin Coroutines は他の言語にある async/await`という回答は大体あっているくらいしかないです。  
また、`Kotlin Coroutines`では`async/await`は並列実行のために使われており、他の言語にある`async function`に当たるものは`suspend fun`になります。

# あらずし
一応言っておくと別に`スレッド`とか`Future`とか`Promise`の悪口が言いたいわけじゃないです。

## ライブラリの解説
これはコルーチンとは関係ないのですが、`OkHttp`というライブラリのコードでサンプルを書くので、  
最低限の使い方をば。

これが非同期モード。現在のスレッドはブロックせず、代わりに通信結果は`onResponse()`受け取る。  
ブロックしないためメインスレッド（`UI`スレッド）からも呼び出せます。

```kotlin
val request1 = Request.Builder().apply {
    url("https://example.com/")
    get()
}.build()
OkHttpClient().newCall(request1).enqueue(object : Callback {
    override fun onFailure(call: Call, e: IOException) {
        // エラー
    }

    override fun onResponse(call: Call, response: Response) {
        // 成功
    }
})
```

これが同期モード。`execute()`を呼び出すと、レスポンスが返ってくるまで現在のスレッドをブロックします。  

```kotlin
val request = Request.Builder().apply {
    url("https://example.com")
    get()
}.build()
val response = OkHttpClient().newCall(request).execute()
```

## コールバック
`Android`でコルーチンが来る前、コールバックをよく使っていました、てかこれからも使うと思います。`Java`で書く人たちは`Kotlin Coroutines`使えないので。  

人によっては`Rxなんとか`を使ってたりしたそうですが、`Android`ライブラリのほとんどはコールバックだったと思います。  
かくいう`Android`チームが作るライブラリ`Android Jetpack（androidx.hogehoge みたいなやつ）`も、もっぱらそう。

コールバックは、**せっかく覚えたプログラミングのいろは**を全部台無しにしていきました。  

というわけでまずはコールバックの振り返り。`OkHttp`ってライブラリを入れてサンプルを書いていますが、`Kotlin Coroutines`あんまり関係ないのでここは真似しなくてもいいと思います。  

例えばプログラミングでは、上から処理が実行されるという話がされるはず、でも意地悪してこれだとどうなるかというと。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        println("1 番目")

        val request = Request.Builder().apply {
            url("https://example.com/")
            get()
        }.build()
        OkHttpClient().newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {

            }

            override fun onResponse(call: Call, response: Response) {
                println("2 番目")
            }
        })

        println("3 番目")

    }
}
```

`Logcat`の表示だとこれ。全然上から順番に処理されてない。

```plaintext
1 番目
3 番目
2 番目
```

`for`も使える、、あれ？コールバックだと期待通りじゃない？

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        repeat(10) { index ->
            println("Request $index")
            val request = Request.Builder().apply {
                url("https://example.com/")
                get()
            }.build()
            OkHttpClient().newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {

                }

                override fun onResponse(call: Call, response: Response) {
                    println("onResponse $index")
                }
            })
        }
    }
}
```

`Logcat`が途中までは良かったのに、順番がぐちゃぐちゃになってしまった。

```plaintext
Request 0
Request 1
Request 2
Request 3
Request 4
Request 5
Request 6
Request 7
Request 8
Request 9
onResponse 1
onResponse 8
onResponse 7
onResponse 5
onResponse 3
onResponse 2
onResponse 0
onResponse 6
onResponse 9
onResponse 4
```

順番を守るためには、コールバックの中に処理を書かないといけないわけですが、見通しが悪すぎる。  
俗に言う`コールバック地獄`。`Android`はこんなのばっか。`Camera2 API`みてるか～？

```kotlin
val request1 = Request.Builder().apply {
    url("https://example.com/")
    get()
}.build()
OkHttpClient().newCall(request1).enqueue(object : Callback {
    override fun onFailure(call: Call, e: IOException) {
        // エラー1
    }

    override fun onResponse(call: Call, response: Response) {
        // 成功1
        
        val request2 = Request.Builder().apply {
            url("https://example.com/")
            get()
        }.build()
        OkHttpClient().newCall(request2).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                // エラー2
            }

            override fun onResponse(call: Call, response: Response) {
                // 成功2
            }
        })

    }
})
```

例外処理の`try-catch`を覚えたって？コールバックの前では役立たずです。  
成功時に呼ばれる関数、失敗時に呼ばれる関数に分離。`finally`が欲しい？関数作って両方で呼び出せばいいんじゃない？

```kotlin
val request = Request.Builder().apply {
    url("https://example.com/")
    get()
}.build()
OkHttpClient().newCall(request).enqueue(object : Callback {
    override fun onFailure(call: Call, e: IOException) {
        println("失敗時")
    }
    override fun onResponse(call: Call, response: Response) {
        println("成功時")
    }
})
```

それ以前に、コールバックがなければ直接スレッドを作って使うしか無いのですが、これは多分あんまりないと思います。  
そもそも`Android`だとコールバックの`API`しか無いとかで。  

## なぜコールバック
それでもなおコールバックを使っていたのには、わけがちゃんとあります。  
画面が固まってしまうんですよね。  

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // UI スレッドから呼び出してみる
        val request = Request.Builder().apply {
            url("https://example.com")
            get()
        }.build()
        // インターネット通信は時間がかかる
        // 通信制限されていたらいつ処理が終わるか分からない。execute() がいつ返り値を返すか分からない。返すまでは画面が固まってしまう。
        val response = OkHttpClient().newCall(request).execute()
        // Toast を出す
        Toast.makeText(this, "こんにちは $response", Toast.LENGTH_SHORT).show()
    }
}
```

最初からあるスレッド、`UIスレッド`や`メインスレッド`とも呼ばれていますが、**これは特別で**、`UI`の更新や入力を受け付けるものになります。`UI`の処理はこれ以外の他のスレッドでは出来ません。  
このスレッドで軽い処理なら問題ないでしょうが、インターネット通信（しかも通信制限のユーザーが居るかも知れない！）をやってしまったら、しばらく画面が固まってしまいます。押しても反応しないアプリが誕生します。  

やがて行き着く先はこのダイアログ、`「アプリ名」は応答していません`。これはメインスレッドで行われている処理に時間かかった際に出ます。  
`Android 4.x`あたりまではよく見た記憶がある。今でもメインスレッドを止めればいつでもこのダイアログに会えます。

![Imgur](https://imgur.com/JiTAWsp.png)

これを回避するためにスレッドを使ったり、コールバックを使い、時間がかかる処理をメインスレッドで行わないようにしていたわけです。  
**まあそれ以前に Android ではメインスレッドでインターネット通信できない（例外が投げられる）ので、そもそもやりたくても出来ません。**

これで、~~アプリの安定性が上がった。~~ アプリがフリーズしないように対策出来た。代償としてコードが地獄になったわけ。つらい。  

`アプリの安定性`から`アプリがフリーズしないように対策`とわざわざ言い直したわけですが、コールバックやスレッドだって使えば安定するかと言われると、そう簡単には安定しません。  
**ちゃんと使わないと別のエラーで落ちます**。こっちは落ちます。フリーズじゃなくて。これが厄介！  

`Android 11`で非推奨になった`AsyncTask`で痛い目を見た。なんて懐かしいですね。なんなら全然うまく動かなくてトラウマになってる人もいそう。私ももう見たくない。  
**画面回転したら落ちる**とか、**アプリから離れると落ちる**とか、、、  

流石にそれはしんどいので`MVVM`的な考え方にのっとり、`UIを担当する処理`とそれ以外が分離されました。  
画面回転ごときで落ちるのは、`UI`の部分で通信処理を書いているのが原因。`ViewModel`という`UI`に提供するデータを用意する場所で書けばいい。こいつは画面回転を超えて生き残る。  
コールバックが来ようと、同期的な処理になろうとずいぶんマシになったはず。

話がちょっとそれちゃったけど、これが今日の`Android`で、まあ後半は`Kotlin Coroutines`あんまり関係ないんですが、非同期とかコールバックがしんどいってのがわかれば。

## コールバックの代替案 Future と Promise
`Rxなんとか`←これは使ったこと無いので触れないです。すいません。  
`Future`も名前知ってるレベルであんまり知らないです。`Promise`がちょっとだけ分かります。

`Promise`（ゲッダンの方ではない）とか  

<script type="application/javascript" src="https://embed.nicovideo.jp/watch/sm25310005/script?w=640&h=360&from=45"></script><noscript><a href="https://www.nicovideo.jp/watch/sm25310005">ゲッダン[勝手に再うｐ]</a></noscript>

<script type="application/javascript" src="https://embed.nicovideo.jp/watch/sm42402334/script?w=640&h=360&from=45"></script><noscript><a href="https://www.nicovideo.jp/watch/sm42402334">promise</a></noscript>

`Future`（`Feature`じゃなく`Future`）というのがあります。  
コールバックの代替案で、`Promise`は`JavaScript`では`async/await`とともに使われています。

`Android`の話なので、`JavaScript`の話をしてもあれですが、一応ね。こんな感じの`JavaScript`です。  
`Promise`はコールバックのように非同期で処理されます。そのためどこかで待つ必要があります。`then()`と`catch()`ですね。  

コールバックはライブラリによってコールバック関数の名前が違ったりしますが（`onSuccess` / `onResponse` / `onError` / `onFailure` とか？）、  
`Promise`で書かれていれば`then() / catch()`と言った感じで一貫しています。  
（って`Promise 本`に書いてありました。→ https://azu.github.io/promises-book/#what-is-promise ）  

`then()`では、配列操作の`map { }`のように値を変換して返すことが出来ます。  
ここに`Promise`を返すことが出来て、このあとの`then()`で受け取ることが出来ます。`Promise`で出来ていれば一貫していることになるので、処理を繋げることが出来ます。  
これを`Promise チェーン`とか言うそうです。

```ts
function main() {
    fetch("https://example.com") // Promise を返す HTTP クライアント。Response を返す Proimse です
        .then(res => res.text()) // Promise 経由で Response を受け取り、Response.text() を返す。String を返す Promise です
        .then(text => console.log(text)) // Response.text() の Promise 結果を受け取る 
        .catch(err => console.log(err)) // エラー
}
```

`Promise チェーン`が無いとコールバック地獄になってしまいますからね。  
↓のコードは↑のコードと大体同じですが、明らかに↑の、メソッドチェーンで呼び出していくほうがまだマシでしょう。

```ts
function main2() {
    // コールバックが深くなっていく
    // マトリョーシカ
    fetch("https://example.com").then(res => {
        res.text().then(text => {
            console.log(text)
        })
    })
}
```

`Kotlin Coroutines`の話をするのであんまり触れませんが、あとは複数の`Promise`を待ち合わせたりも出来ます。  
コールバックだと全部のコールバックが呼ばれたかの処理が冗長になりそうですからね。

```ts
function main3() {
    const multipleRequest = [
        fetch("https://example.com"),
        fetch("https://example.com"),
        fetch("https://example.com")
    ]

    // Promise 全部まつ
    Promise.all(multipleRequest).then(resList => {
        // resList は Response の配列
    })
}
```

ただ、よく見るとコールバックが少し減ったくらいしか差が無いと言うか（申し訳ない）、  
`Promise`を繋げたり、全部待つ必要がないならあんまり旨味がないのでは？と。`then()`で受け取るのとコールバックで受け取るのはあんまり差がない？。  
`then() / catch()`のせいで`try-catch`は結局使えないじゃんって？。

## ついに来た async / await や Kotlin Coroutines
上記の`Promise`ではまだコールバック風な文化が残っていました。しかしついに今までの同期風に書けるような機能が来ました。`async/await`です。  
`async/await`はそれぞれ`えいしんく/えいうぇいと`と読むらしい、`あしんく/あうぇいと`ってのは多分違う。

ついに`try-catch`が使えるようになりました。  
同期風にかけるようになったため、`Promise`を繋げる→ああ`Promise チェーン`かとか考えなくても、`await`を付けてあとは同期的に書けば良くなりました。

```ts
async function main4() {
    try {
        const response = await fetch("https://example.com") // Promise が終わるまで待つ
        const text = await response.text()
        console.log("成功")
    } catch (e) {
        console.log("失敗")
    }
}

function main5() {
    main4() // async function は Promise を返す
        .then(() => { /* do nothing */ })
        .catch(() => { /* do nothing */ })
}
```

ループだって怖くない。ただし`JavaScript`は`forEach() / map()`で`async function`呼び出せないので、純粋なループにする必要あり。  

```ts
async function main4() {
    try {
        for (let i = 0; i < 10; i++){
            const response = await fetch("https://example.com") // Promise が終わるまで待つ
            const text = await response.text()
            console.log(`成功 ${i}`)
        }
    } catch (e) {
        console.log("失敗")
    }
}

function main5() {
    main4() // async function は Promise を返す
      .then(() => { /* do nothing */ })
      .catch(() => { /* do nothing */ })
}

main5();
```

ちゃんと`for`の順番通りでました！もうコールバックやだ！

```plaintext
成功 0
成功 1
成功 2
成功 3
成功 4
成功 5
成功 6
成功 7
成功 8
成功 9
```

`Kotlin Coroutines`はこれの`Kotlin`版です。`async function`は`suspend fun`になります。  
というわけで**長い長いあらずしも終わり**。いよいよ本題にいきましょう。

# 最初のコルーチン
https://kotlinlang.org/docs/coroutines-basics.html#your-first-coroutine

兎にも角にもなにか書いてみましょう。というわけでこちら。  

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        lifecycleScope.launch { // コルーチンを起動
            delay(1000L) // 1秒間コルーチンを一時停止
            println("World!") // 待った後に println
        }
        println("Hello") // 予想通り、スレッドのときと同じくまずはこれが出力されます。
    }
}
```

`"Hello"`を出力して、その`1秒後`に`"World"`を出力するコルーチンです。  
出力結果はこう。何の面白みもないですが。  

```plaintext
Hello
World!
```

`launch { }`関数を使い新しいコルーチンを起動しています。`delay()`は指定時間コルーチンの処理を一時停止してくれます。  

`lifecycleScope`というのは、`Android`の`Activity`と連携した`コルーチンスコープ`です。  
`コルーチンスコープ`というのは後で説明しますが、とにかく新しくコルーチンを起動するときにはスコープが必要だということがわかれば。  

ちなみに、ドキュメントでは`GlobalScope`や、`runBlocking { }`がコード例として出てきますが、`Android`アプリ開発ではまず使いません。  
`Android`でコルーチンを使う場合は、`lifecycleScope`とか`rememberCoroutineScope()`とかの用意されたコルーチンスコープを使い起動します。コルーチンスコープを自分で作ることも出来ますがあんまりないと思います。  

`GlobalScope`と`runBlocking { }`はコルーチンのサンプルコードを書く場合には便利なのですが、実際のコードの場合は少なくとも`Android`では出番がありません。  

`delay()`はサスペンド関数の1つで、`fun start()`を`suspend fun start()`のように書き直せば、サスペンド関数を自分で作ることも出来ます。  
これらはサスペンド関数の中で呼び出すか、`launch { }`、`async { }`などの中じゃないと呼び出せません。  

自分で`suspend fun`を作った場合、上記のコードはこんな感じになります。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        lifecycleScope.launch { // コルーチンを起動
            printWorld() // suspend fun を呼ぶ
        }
        println("Hello") // 予想通り、スレッドのときと同じくまずはこれが出力されます。
    }

    private suspend fun printWorld() {
        delay(1000L) // 1秒間コルーチンを一時停止
        println("World!") // 待った後に println
    }
}
```

ザックリ説明したところで、  
コルーチンの話をしていく前に、先に言った通り、なぜ`スレッドと違って大量にコルーチンを作れる`のかという話を。

## 大量にコルーチンを起動できる理由 その1
`Kotlin Coroutines`は今あるスレッドを有効活用します。スレッドを退屈させない（遊ばせない）仕組みがあります。  
例えば以下のコード。`3`秒後と`5`秒後に`println`するわけですが、これを処理するのに**スレッドが 2 個必要でしょうか？**

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            delay(5_000)
            println("5 秒待った")
        }
        lifecycleScope.launch {
            delay(3_000)
            println("3 秒待った")
        }
        println("起動した")
    }
}
```

例えばその下の`3秒後に println`とか`5秒間`待ってる間に処理できそうじゃないですか？  

```kotlin
lifecycleScope.launch {
    delay(5_000) // この 5 秒待ってる間に、その下の 3 秒後に println するコードが動かせるのでは、、、？
    println("5 秒待った")
}
lifecycleScope.launch {
    delay(3_000)
    println("3 秒待った")
}
println("起動した")
```

`Kotlin Coroutines`はこんな感じに、待ち時間が発生すれば、他のコルーチンの処理をするためスレッドを譲るようにします。  
これにより、`launch { }`した回数よりも遥かに少ないスレッドで処理できちゃうわけ。  
一時停止と再開という単語がでてきますがおそらくこれです。

![Imgur](https://imgur.com/Vzr4q9Q.png)

### 付録 譲るところを見てみる
実際に譲っているか見てみましょう。`println`を追加して、どのスレッドで処理しているかを出力するように書き換えました。  
`Dispatchers.Default`というまだ習ってないものを使ってますが、とりあえずは別のスレッドを使う場合はこれをつければいいんだって思ってくれれば。`Dispatchers`で詳しく話します。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch(Dispatchers.Default) {
            println("[launch 1] 起動 ${Thread.currentThread().name}")
            delay(5_000)
            println("[launch 1] 5 秒待った ${Thread.currentThread().name}")
        }
        lifecycleScope.launch(Dispatchers.Default) {
            println("[launch 2] 起動 ${Thread.currentThread().name}")
            delay(3_000)
            println("[launch 2] 3 秒待った ${Thread.currentThread().name}")
        }
        println("起動した")
    }
}
```

結果です。実行する度に若干変化するかと思いますが、私の手元ではこんな感じでした。  
`launch { }`直後はそれぞれ別のスレッドが使われてますが、`delay`後は同じスレッドを使っている結果になりました。  
ちゃんと`delay`で待っている間、他のコルーチンにスレッドを譲っているのが確認できました。

```plaintext
[launch 1] 起動 DefaultDispatcher-worker-1
起動した
[launch 2] 起動 DefaultDispatcher-worker-2
[launch 2] 3 秒待った DefaultDispatcher-worker-1
[launch 1] 5 秒待った DefaultDispatcher-worker-1
```

![Imgur](https://imgur.com/LAjgS9Y.png)

また、この結果を見るに、`delay()` **する前と、した後では違うスレッドが使われる場合がある。** ということも分かりましたね。  
`メインスレッド`の場合は 1 つしか無いので有りえませんが、このサンプルでは`Dispatchers.Default`を指定したためにこうなりました。  
詳しくは`Dispatchers`のところで話しますが、スレッドこそ違うスレッドが割り当てられますが、`Dispatchers.Default`は複数のスレッドを雇っているので、`Default`の中で手が空いているスレッドが代わりに対応しただけです。  
（また、これは`delay()`に限らないんですがまだ習ってないので・・・）

### 付録 Thread.sleep と delay
この2つ、どちらも処理を指定時間止めてくれるものですが、大きな違いがあります。  

`Thread.sleep`はスレッド自体を止めてしまいます。コルーチンを実際に処理していくスレッド自体が止まってしまいます。  
一方`delay`は指定時間コルーチンの処理が一時停止するだけで、スレッドは止まらない。止まらないので、待っている間、スレッドは他のコルーチンの利用に割り当てることができます。

`delay`はスレッドが止まるわけじゃないので、例えばメインスレッドで処理されるコルーチンを作ったところで、  
`ANR`のダイアログは出ません。コルーチンが一時停止するだけで、メインスレッド自体は動き続けていますから。  

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch(Dispatchers.Main) { // Main でメインスレッドで処理されるコルーチンが作れます 
            delay(10_000) // Thread.sleep で 10 秒止めたら確実に ANR ですが、delay はコルーチンが一時停止するだけなので
            Toast.makeText(this@MainActivity, "ANR は出ません！", Toast.LENGTH_SHORT).show()
        }
    }
}
```

![Imgur](https://imgur.com/MBG4Pby.png)

たとえ無限に`delay`したとしても、上記の理由によりびくともしないと思います。

## 大量にコルーチンを起動できる理由 その2
ただ、上記の説明は、既存のスレッドを効率良く使う説明であって、  
大量に作ってもいい理由にはあんまりなっていない気がします。

https://stackoverflow.com/questions/63719766/

`Java`のスレッドは、`OS`のスレッドを使って作られています。`Java`のスレッドと`OS`のスレッドは`1:1`の関係になりますね。  
スレッドを新たに作るのはメモリを消費したりと、コストがかかる処理のようです。  

また、搭載している`CPU`のコア数以上にスレッドを生成されると処理しきれなくなるため、各スレッド均等に処理できるよう（よく知らない）  
`コンテキストスイッチ`と呼ばれる切り替えるための仕組みがあるのですが、これも結構重い処理らしい。  
どうでも良いですが、コンテキストスイッチがあるので、`1コア CPU`だとしても複数のスレッドを動かすことが出来ます。同時に処理できるとは言ってませんが。（パラレルとコンカレントの話は後でします）  

話を戻して、`Kotlin Coroutines`は`launch { }`でコルーチンを作成しても、**スレッドは作成されません。**  
**もちろん、** コルーチンの中身を処理していくスレッドが必要なのですが、`Kotlin Coroutines`側ですでにスレッドを確保しているので（詳しくは`Dispatchers`で）、それらが使われます。  

そのためコルーチンと、確保しているスレッドの関係は`多:多`の関係になります。  
どれかのスレッドで処理されるのは確かにそうですが、スレッドとコルーチンが`1:1`で紐付けられるわけではありません。**大量にコルーチンを起動出来るもう一つの理由ですね。**  

コンテキストスイッチに関しても`OS`のスレッドだと`OS`がやるので重たい処理になる（らしい）のですが、  
コルーチンだと`Kotlin`側が持ってるスレッド上でコルーチンを切り替えるだけなので軽いらしい。

### 付録 本当にメモリ使用量が少ないのか
そうは言ってもよく分からないと思うので、`thread { }`が本当に重たいのか見ていきたいと思います。  
それぞれ**1000個**（！？）作ってみます。`Pixel 8 Pro / Android 15 Beta`で試しました。**デバッグビルドなのであんまりあてにならないかも。**  

開発中のアプリであれば、`Android Studio`の`Profiler`でメモリ使用量を見ることが出来ます。  
![Imgur](https://imgur.com/agCwUvH.png)

#### スレッドでテスト
ボタンを押したらスレッドを作って`Thread.sleep(60秒)`するコードを書きました。  

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            KotlinCoroutiensPracticeTheme {
                MainScreen()
            }
        }
    }
}

@Composable
private fun MainScreen() {
    fun runMemoryTest() {
        repeat(1000) {
            thread {
                Thread.sleep(60_000)
            }
        }
    }

    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding)) {
            Button(onClick = { runMemoryTest() }) {
                Text(text = "確認")
            }
        }
    }
}
```

結果がコレです。  
ボタンを押したら赤い丸ポチが付くわけですが、まあ確かに増えてますね。

![Imgur](https://imgur.com/618w8kX.png)

#### コルーチンでテスト
ボタンを押したら、コルーチンを起動（`launch { }`）して、`delay(60秒)`するコードを書きました。みなさんも試してみてください。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            KotlinCoroutiensPracticeTheme {
                MainScreen()
            }
        }
    }
}

@Composable
private fun MainScreen() {
    val scope = rememberCoroutineScope()

    fun runMemoryTest() {
        repeat(1000) {
            scope.launch {
                delay(60_000)
            }
        }
    }

    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding)) {
            Button(onClick = { runMemoryTest() }) {
                Text(text = "確認")
            }
        }
    }
}
```

結果がコレで、赤い丸ポチが出ているときがボタンを押したときです。  
最初ちょっと増えましたが、2回目以降は押しても得には、目に見えるレベルで増えたりはしてなさそう。

![Imgur](https://imgur.com/ZZP0Sop.png)

実際に`Java`のスレッドを作っているわけじゃないだけあって、いっぱい押しても特に起きない  

![Imgur](https://imgur.com/oAX7Clb.png)

# 構造化された並行性
https://kotlinlang.org/docs/coroutines-basics.html#structured-concurrency

コルーチンのドキュメントをいい加減なぞっていこうかと思ったのですが、  
もう一個、これは`スレッド`、`Future`、`Promise`から来た人たちが**困惑しないよう**に先に言及することにしました。これら3つにはない考え方です。  

英語だと`structured concurrency`って言うそうです。かっこいい。

## launch が使えない問題
もしこれを見る前にすでに`Kotlin Coroutines`を書いたことがある場合、まず壁にぶち当たるのがこれ。  
`launch { }`を使いたくても、赤くエラーになるんだけど。って。しかも謎なことに、書く場所によってはエラーにならない。一体なぜ！？

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            downloadFile()
            
            launch {  } // ここはエラーじゃない（？）
        }
    }

    private suspend fun downloadFile() {
        launch { } // ここだとエラー（？？？）コルーチン起動したいよ！
    }
}
```

エラーになるので仕方なく`GlobalScope`と呼ばれる、どこでも使える`コルーチンスコープ`を使って強行突破を試みますが、  
そもそも`GlobalScope`を使うことが滅多にないと`Lint`に警告されます。なんでよ！？

```kotlin
private suspend fun downloadFile() {
    GlobalScope.launch { } // GlobalScope は滅多に使いません。
}
```

![Imgur](https://imgur.com/h3otQlk.png)

反省して`GlobalScope`のドキュメントを見に行きましょう。  
https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-global-scope/

読んでみると、どうやら`coroutineScope { }`を使えば、`suspend fun`の中でも`launch { }`出来るっぽいですよ！？  
試してみると、確かに`coroutineScope { }`ではエラーが消えています。

```kotlin
private suspend fun downloadFile() {
    coroutineScope {
        launch { } // 祝！これで起動できた！！！
    }
}
```

これは何故かと言うと、`launch { }`が`coroutineScope`の拡張関数になっているからですね。  
https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html

```kotlin
fun CoroutineScope.launch(
    context: CoroutineContext = EmptyCoroutineContext, 
    start: CoroutineStart = CoroutineStart.DEFAULT, 
    block: suspend CoroutineScope.() -> Unit
): Job
```

また、`launch { }`の中で`launch { }`出来たのは、`launch`の引数`block`が、`this`で`CoroutineScope`を提供していたからなんですね。  
以下のコードが分かりやすいかな？

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            val scope: CoroutineScope = this // launch のブロック内はコルーチンスコープがある
            this.launch {  } // コルーチンスコープがあるので起動できる
            launch { } // これでいい
        }
    }
}
```

ちなみに、`launch`が`CoroutineScope`の拡張関数になっているという答えにたどり着けた場合、自分が作る関数も`CoroutineScope`を取る拡張関数にすればいいのでは・・・！という答えになるかもしれません。  
もしその発想にたどり着けた暁にはもうゴールは目前で、最後の一押しとして`Lint`が`coroutineScope { }`に置き換えるよう教えてくれます。かしこい！！！

```kotlin
// Lint で coroutineScope { } に置き換えるよう教えてくれる
private suspend fun CoroutineScope.downloadFile2() {
    launch { } // this が CoroutineScope なので問題は無い
    launch { }
}
```

![Imgur](https://imgur.com/zDwqwjJ.png)

ただ、引数に`コルーチンスコープ`を取る場合は教えてくれないので注意。  

```kotlin
private suspend fun downloadFile3(scope: CoroutineScope) {
    scope.launch { 
        
    }
}
```

**ところで、なんでコルーチンを起動するのにコルーチンスコープが必要なんでしょうか？**  
**スレッドや Future 、Promise はどこでも作れるじゃないですか、なんでこんな仕様なの？めんどくせ～～**  

と思うかもしれませんが、これは`スレッド`や`Future`、`Promise`にはない安全設計のため、この様になっています。  
この安全設計が`構造化された並行性`と呼ばれるものです。

## 親は子を見守る
`Kotlin Coroutines`に構造化された並行性を導入した方の、こちらの記事もどうぞ  
https://elizarov.medium.com/structured-concurrency-722d765aa952

↑の方の記事で引用されているこちらも。  
コールバックは`goto`文と何ら変わらないという話  
https://vorpus.org/blog/notes-on-structured-concurrency-or-go-statement-considered-harmful/

![Imgur](https://imgur.com/wCectH1.png)  
![Imgur](https://imgur.com/LNLNjP3.png)
ちな`D.C.5`  


いや、上記の画像はあんまり関係ないのですが、  
二人三脚という競技は、例えば解けてしまった場合は結び直して再出発する必要があります。  
いきなり相方がどっか走り出したらルール違反になります。

おおむね、プログラミングの世界でも、起動した並列処理がどこか行方不明にならないよう待ち合わせしたり、  
時にはエラーになったら他の並列処理を終了に倒したいときがあります。分割ダウンロードを作るとか。

![Imgur](https://imgur.com/RnqzhGd.png)

`JavaScript`の`Promise`では、`Promise.all`を使うことで全ての`Promise`が終わるまで待つ事ができます。  
しかし、特に待ち合わせとか何もしない場合は独立して`Promise`が動きます。これは`スレッド`や`Future`にも言えますが。  

例えば以下のコード、`main5`関数の方は明示的に並列処理を待ち合わせしていますが、`main6`の方は非同期処理を開始するだけ開始してそのままにしています。  
`main6`の呼び出し後は面倒を見ていません。別に`Promise`に関係なく、コールバックだろうとそのまま待たずに呼び出し元へ戻ったら同じことが言えます。  

```ts
async function main4() {
    // 待ち合わせする
    await main5()
    // これは待ち合わせしないのですぐ呼び出し元（ここ）に戻って来る
    main6()
}

// これは全ての Promise を待ち合わせする。待ち合わせが終わるまで呼び出し元へは戻らない
async function main5() {
    const multipleRequest = [
        fetch("https://example.com"),
        fetch("https://example.com"),
        fetch("https://example.com")
    ]

    return await Promise.all(multipleRequest)
}

// これは非同期処理を開始するだけ開始して、呼び出し元にすぐに戻る
function main6() {
    fetch("https://example.com")
    fetch("https://example.com")
    fetch("https://example.com")
}
```

**構造化された並行性**ではこれを問題視しています。  
例えば、非同期処理を待たないので、コードの理解が困難になります。  
冒頭で行った通り、非同期処理、コールバックたちはプログラミングのいろはを全て破壊していったので、  
`for`は順番を守らない、`try-catch-finally`だと`catch`に来ない、`finally`が非同期処理よりも先に呼ばれるしで、理解が困難になります。  
（`finally`が先に呼ばれるせいで`AutoCloseable#use { }`、他の言語の`using { }`が使えない等）

それでは`Kotlin Coroutines`を見ていきましょう。賢い仕組みがあります。そして困惑するかもしれません。  
以下のコードを見てください。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            runMultipleTask()
        }
    }

    private suspend fun runMultipleTask() {
        coroutineScope { // コルーチンスコープを作成
            println("coroutineScope 爆誕")
            listOf(3_000L, 5_000L, 10_000L).forEach { time -> // 3・5・10 秒待つコルーチンを並列で起動
                launch {
                    delay(time)
                    println("$time ミリ秒待ったよ！")
                }
            }
        }
        println("おしまい！")
    }
}
```

上でいった通り、`suspend fun`の中では`launch { }`出来ないため、`coroutineScope { }`を使いました。  
**これの実行結果ですが、予想できますか？**

```plaintext
coroutineScope 爆誕
3000 ミリ秒待ったよ！
5000 ミリ秒待ったよ！
10000 ミリ秒待ったよ！
おしまい！
```

先に **おしまい！** が来るのかと思いきや、`coroutineScope { }`で起動した`3・5・10 秒待つコルーチンを並列で起動`を全て待ってから`おしまい`に進んでいます。  
最後に`10000 ミリ秒待ったよ！`が出ると思ったそこのキミ。多分`スレッド`や`Future`、`Promise`から来ましたね？

これが`構造化された並行性`と呼ばれるもので、**並列で起動した子コルーチンが全て終わるまで、親のコルーチンが終わらない**という特徴があります。  
**明示的に待つ必要はなく**、暗黙のうちに全ての子の終了を待つようになっています。（もちろん明示的に待つ事もできます。`join()`）  
この子が終わっているかの追跡に、コルーチンスコープを使っているんですね。新しいコルーチンの起動にコルーチンスコープが必要なのもなんとなく分かる気がする。

`スレッド`や`Future`、`Promise`の場合、この`構造化された並行性`が無いため、  
**非同期処理を開始するだけ開始して、成功したかまでは確認しない。すぐ戻って来るよろしく無い関数**が作れてしまいます。  
一方`Kotlin Coroutines`では基本的に並列処理が終わる前に戻ってくるような関数は作れません。  
（`コルーチンスコープ`の使い方を間違えていなければ）

## エラーが伝搬する
こっちのが分かりやすいかな。  
`Kotlin Coroutines`では、**並列実行した処理でどれか1つが失敗したら他も失敗するのがデフォルトです**。生き残っている並列処理をそのまま続行したいことのほうが稀なはずなので、これは嬉しいはず。  

どれか1つの`Promise / Future / スレッド`で失敗したら他も失敗にするという処理、なかなか面倒な気がします。  
また、キャンセルさせたいと思っても全ての`Promise / Future / スレッド`に失敗を伝搬する何かを自前で実装する必要があります。  

`Kotlin Coroutines`のデフォルトでは、子が失敗した場合その他の子も全てを失敗にします。  
どれか1つが失敗したら、親が検知して、子供に失敗、もといキャンセルを命令します。ちなみにキャンセルは例外の仕組み動いているのですが、後述します。

以下のコードで試してみましょう。  
まだ習っていない`CancellationException`とかが出てきますがすいません。

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch(Dispatchers.Default) {
            try {
                splitTask()
            } catch (e: RuntimeException) {
                println("errorTask() が投げた RuntimeException をキャッチ！")
            }
        }
    }

    // delayTask を3つ、errorTask を1つ並列で実行する
    private suspend fun splitTask() = coroutineScope {
        launch { delayTask(1) }
        launch { delayTask(2) }
        launch { delayTask(3) }
        launch { errorTask() }
    }

    private suspend fun errorTask() {
        delay(3_000)
        throw RuntimeException()
    }

    private suspend fun delayTask(id: Int) {
        try {
            delay(10_000)
        } catch (e: CancellationException) {
            println("失敗 $id")
            throw e
        }
    }
}
```

`logcat`がこうです。  

```plaintext
失敗 1
失敗 2
失敗 3
errorTask() が投げた RuntimeException をキャッチ！
```

`delayTask`で`10`秒待っている間に、`errorTask()`が例外を投げました。  
すると、エラーを伝搬するため、他の`delayTask()`へ`CancellationException`例外が投げられます。  
子を失敗させたら、最後に呼び出し元へエラーを伝搬させます。呼び出し元の`catch`で例外をキャッチできるようになります。  

`CancellationException`の話はまだしてないのであれですが、キャンセルが要求されるとこの例外がスローされます。  
ルールとして`CancellationException`は`catch`したら`再 throw`する必要があるのですが、これも後述します。  

呼び出し元は`RuntimeException`をキャッチしておけば例外で落ちることはないですね。  

**もちろん、すべての子の待ち合わせしつつ、子へキャンセルを伝搬させない方法ももちろんあります。**  
並列で処理するけど、他の並列処理に依存していない場合に使えると思います。

## ちなみに
コルーチンスコープを頼りにしているので、コルーチンスコープを適切に使わない場合は普通に**破綻**します。思わぬエラーです。  
例えば以下はすべての子を待ち合わせしません。スコープが違うので他人の子です。我が子以外には興味がないサスペンド関数さん。

```kotlin
private suspend fun runMultipleTask() {
    coroutineScope {
        println("coroutineScope 爆誕")
        listOf(3_000L, 5_000L, 10_000L).forEach { time ->
            lifecycleScope.launch { // coroutineScope { } の scope 以外を使うと破綻する
                delay(time)
                println("$time ミリ秒待ったよ！")
            }
        }
    }
    println("おしまい！")
}
```

```plaintext
coroutineScope 爆誕
おしまい！
3000 ミリ秒待ったよ！
5000 ミリ秒待ったよ！
10000 ミリ秒待ったよ！
```

これだって、以下のように書くとエラーが伝搬しません。それから**呼び出し元で例外をキャッチできない**ので絶対やめましょう。  
我が子以外には説教をしないサスペンド関数です。

```kotlin
lifecycleScope.launch(Dispatchers.Default) {
    try {
        splitTask()
    } catch (e: RuntimeException) {
        // errorTask() が coroutineScope { } の scope じゃないのでここではキャッチできません。エラーが伝搬しないので。
        println("errorTask() が投げた RuntimeException をキャッチ！")
    }
}

// 省略...

private suspend fun splitTask() = coroutineScope {
    launch { delayTask(1) }
    launch { delayTask(2) }
    launch { delayTask(3) }
    lifecycleScope.launch { errorTask() } // coroutineScope { } の scope を使っていない。これだと伝搬しない。
}
```

キャッチしきれなくて普通にクラッシュします。

```plaintext
Process: io.github.takusan23.kotlincoroutienspractice, PID: 29855
java.lang.RuntimeException
	at io.github.takusan23.kotlincoroutienspractice.MainActivity.errorTask(MainActivity.kt:65)
	at io.github.takusan23.kotlincoroutienspractice.MainActivity.access$errorTask(MainActivity.kt:28)
	at io.github.takusan23.kotlincoroutienspractice.MainActivity$errorTask$1.invokeSuspend(Unknown Source:14)
```

以上！！！！  
構造化された並行性！！多分クソわかりにくかったと思う。

# キャンセル
コルーチンのドキュメント通りに歩くと、次はこれです。  
**Cancellation and timeouts**

https://kotlinlang.org/docs/cancellation-and-timeouts.html

これも大事で、これを守らないと`Kotlin Coroutines`の**売り文句とは裏腹に**、思った通りには動かないコードが出来てしまいます。  
というわけでキャンセル、読んでいきましょう。

## コルーチンのキャンセル方法
いくつかありますが`launch { }`したときの返り値の`Job`を使う場合。`Job#cancel`が生えているので呼べばキャンセルできます。  

例えば以下の`Jetpack Compose`で出来たカウントアップするやつでは、  
開始ボタンを押したらループがコルーチンで開始、終了ボタンを押したらコルーチンをキャンセルさせて、カウントアップを止めます。

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent { MainScreen() }
    }
}

@Composable
private fun MainScreen() {
    val scope = rememberCoroutineScope()

    var currentJob = remember<Job?> { null }
    val count = remember { mutableIntStateOf(0) }

    Scaffold { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding)) {

            Text(
                text = count.intValue.toString(),
                fontSize = 24.sp
            )

            Button(onClick = {
                // launch の返り値を持つ。キャンセルに使う
                currentJob = scope.launch {
                    while (isActive) { // コルーチンがキャンセルされると isActive が false になる
                        delay(1_000) // 1 秒一時停止する
                        count.intValue++
                    }
                }
            }) {
                Text(text = "カウントアップ開始")
            }

            Button(onClick = {
                // キャンセルする
                currentJob?.cancel()
            }) {
                Text(text = "カウントアップ停止")
            }
        }
    }
}
```

![Imgur](https://imgur.com/5iFwR1k.png)

### コルーチンスコープを利用したキャンセル
他にも`CoroutineScope#cancel`や`CoroutineContext#cancelChildren`を使って、子のコルーチンを全てキャンセルさせる事もできます。  
`cancel()`だとこれ以降コルーチンを作ることが出来ないので、それが困る場合は`cancelChildren()`を使うといいと思います。

### Android のコルーチンスコープのキャンセル
ただ、`Android`だとコルーチンスコープのキャンセルはあんまりしないと思います。  
というのも、既に`Android`が用意している`コルーチンスコープ、lifecycleScope / viewModelScope / rememberCoroutineScope() / LaunchedEffect`たちは、それぞれのライフサイクルに合わせて自動でキャンセルする機能を持っています。

`lifecycleScope`では`onDestroy`（確か）、`rememberCoroutineScope() / LaunchedEffect`ではコンポーズ関数が表示されている間。  
なので、例えば以下のコードでは、条件分岐でコンポーズ関数が表示されなくなったら`LaunchedEffect`を勝手にキャンセルしてくれます。コンポーズ関数が画面から消えたのにカウントアップだけ残り続けるなんてことは起きません。

```kotlin
@Composable
private fun MainScreen() {
    val isEnable = remember { mutableStateOf(false) }
    if (isEnable.value) {
        // true の間のみ、false になった場合は LaunchedEffect が呼ばれなくなるのでキャンセルです
        LaunchedEffect(key1 = Unit) {
            while (isActive) {
                delay(1_000)
                println("launched effect loop ...")
            }
        }
    }

    Button(onClick = { isEnable.value = !isEnable.value }) {
        Text(text = "isEnable = ${isEnable.value}")
    }
}
```

自分でコルーチンスコープを作る場合、`MainScope()`や`CoroutineScope()`を呼び出せば作れるのですが、それは`コルーチンコンテキストとディスパッチャの章`で！  
[#コルーチンスコープ](#コルーチンスコープ)

### コルーチンが終わるまで待つ
`cancel()`したあとに`join()`することで終わったことを確認できます。別にキャンセルしなくても終わるまで待ちたければ`join()`すれば良いです。  
`cancel()`はあくまでも**キャンセルを命令するだけ**で、**キャンセルの完了を待つ**場合は`join()`が必要です。  
後述しますが、キャンセルをハンドリングして後始末をする事ができるため、その後始末を待つ場合は`join()`が役立つかも。  
また、`cancelAndJoin()`とかいう、名前通り2つを合体させた関数があります。

## キャンセルの仕組み
まずはキャンセルの仕組みをば。  
キャンセルの仕組みですが、キャンセル用の例外`CancellationException`をスローすることで実現されています。  
キャンセルが要求された場合は上記の例外をスローするわけですが、誰がスローするのかと言うと、一時停止中のサスペンド関数ですね。以下の例だと`delay()`さんです。  

```kotlin
while (isActive) { // isActive はキャンセルしたら false になるよ
    delay(1_000) // キャンセルが要求されたらキャンセル例外を投げるよ！
    println("loop ...")
}
```

例えば先程のカウントアップのプログラムでは、`delay()`がキーパーソンになります。  
`delay()`のドキュメントを確認しますが、指定時間待っている間にコルーチンがキャンセルされた場合は関数自身がキャンセル例外をスローすると書いています。  
https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/delay.html

`delay()`はキャンセルに協力的に作られているので良いのですが、**自分でサスペンド関数を書いた場合はちゃんとキャンセルに協力的になる必要があります。**  
この話を次でします。

### try-catch / runCatching には注意
**サスペンド関数を try-catch / runCatching で囲った場合、注意点があります**。  
`CancellationException`例外をスローすることでキャンセルが実現しているわけですが、`try-catch`や`runCatching`で`CancellationException`をキャッチした場合はどうなるでしょうか？

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        lifecycleScope.launch(Dispatchers.Default) {
            // 5秒になるまで1秒ごとに経過を logcat に出す
            val timer = launch { printTimer() }

            // キャンセルしてみる
            delay(2_000)
            timer.cancel()
            println("キャンセルしたよ")
            // コルーチンが終わるのを待つ
            timer.join()
            println("おわったよ")
        }
    }

    private suspend fun printTimer() {
        runCatching { delay(1_000) }
        println("1秒経過")
        runCatching { delay(1_000) }
        println("2秒経過")
        runCatching { delay(1_000) }
        println("3秒経過")
        runCatching { delay(1_000) }
        println("4秒経過")
        runCatching { delay(1_000) }
        println("5秒経過")
    }

}
```

結果はこれです。  
キャンセル後も**キャンセルされずに**処理が続行されています。**これはキャンセル例外をキャッチしてしまったのが理由です。**

```plaintext
1秒経過
キャンセルしたよ
2秒経過
3秒経過
4秒経過
5秒経過
おわったよ
```

修正方法としては、

- `try-catch`では最低限の例外だけをキャッチする
- `CancellationException`をキャッチしたら再スローする
- キャンセルされているか明示的に確認する

のどれかが必要です。まずは`try-catch`から。

```kotlin
// 最低限だけキャッチする
private suspend fun printTimer() {
    try {
        delay(1_000)
    } catch (e: RuntimeException) {
        // 必要な例外だけキャッチする。ちなみに delay は RuntimeException スローしないと思いますが
    }
    println("1秒経過")

    try {
        delay(1_000)
    } catch (e: RuntimeException) {
        // ...
    }
    println("2秒経過")

    // 以下省略...
}
```

もしくは、Exception を網羅的にキャッチするが、CancellationException だけは再スローする。

```kotlin
private suspend fun printTimer() {
    try {
        delay(1_000)
    } catch (e: CancellationException) {
        // キャンセル例外だけはキャッチして再 throw
        throw e
    } catch (e: Exception) {
        // Exception を網羅的にキャッチ
    }
    println("1秒経過")

    try {
        delay(1_000)
    } catch (e: CancellationException) {
        // キャンセル例外だけはキャッチして再 throw
        throw e
    } catch (e: Exception) {
        // Exception を網羅的にキャッチ
    }
    println("2秒経過")

    // 以下省略...
}
```

同じことが`runCatching { }`にも言えます。  
これは`Kotlin Coroutines`が`cencellableRunCatching { }`とか、`suspendRunCatching { }`を作ってくれないのが悪い気もする。  
議論されてるけど、、、まーだ時間かかりそうですかねー？：https://github.com/Kotlin/kotlinx.coroutines/issues/1814

対策としては`runCatching { }`のキャンセル対応版を作るか  
参考にしました、ありがとうございます：https://nashcft.hatenablog.com/entry/2023/06/16/094916

```kotlin
// 対策版 runCatching に置き換える
private suspend fun printTimer() {
    suspendRunCatching { delay(1_000) }
    println("1秒経過")
    suspendRunCatching { delay(1_000) }
    println("2秒経過")
    suspendRunCatching { delay(1_000) }
    println("3秒経過")
    suspendRunCatching { delay(1_000) }
    println("4秒経過")
    suspendRunCatching { delay(1_000) }
    println("5秒経過")
}

/** コルーチンのキャンセル例外はキャッチしない[runCatching] */
inline fun <T, R> T.suspendRunCatching(block: T.() -> R): Result<R> {
    return try {
        Result.success(block())
    } catch (e: CancellationException) {
        throw e
    } catch (e: Throwable) {
        Result.failure(e)
    }
}
```

もしくは、`Result`クラスに`getOrCancel()`みたいな拡張機能を作って、`Result`を返すけど、もしキャンセル例外で失敗していればスローするとか。

```kotlin
private suspend fun printTimer() {
    runCatching { delay(1_000) }.getOrCancel()
    println("1秒経過")
    runCatching { delay(1_000) }.getOrCancel()
    println("2秒経過")
    runCatching { delay(1_000) }.getOrCancel()
    println("3秒経過")
    runCatching { delay(1_000) }.getOrCancel()
    println("4秒経過")
    runCatching { delay(1_000) }.getOrCancel()
    println("5秒経過")
}

/** [Result]の失敗理由がキャンセル例外だった場合は、キャンセル例外をスローする拡張関数 */
fun <T> Result<T>.getOrCancel(): Result<T> = this.onFailure {
    if (it is CancellationException) {
        throw it
    }
}
```

`try-catch`も`runCatching { }`も**どっちも厳しい場合は**、  
`try-catch`や`runCatching { }`の後に`ensureActive()`を呼び出す手もあります。  
`ensureActive()`は`CoroutineScope`の拡張関数なのでコルーチンスコープが必要で、`coroutineScope { }`で囲ったり、`launch { }`の中で使わないといけないのが玉に瑕。  

```kotlin
private suspend fun printTimer() = coroutineScope {
    try {
        delay(1_000)
    } catch (e: Exception) {
        // ...
    }
    ensureActive() // この時点でキャンセルされている場合、キャンセル例外をスローする
    println("1秒経過")

    try {
        delay(1_000)
    } catch (e: Exception) {
        // ...
    }
    ensureActive() // この時点でキャンセルされている場合、キャンセル例外をスローする
    println("2秒経過")
    
    // 以下省略...
}
```

```kotlin
private suspend fun printTimer() = coroutineScope {
    runCatching { delay(1_000) }
    ensureActive() // runCatching { } の後にキャンセルチェック
    println("1秒経過")
    runCatching { delay(1_000) }
    ensureActive() // runCatching { } の後にキャンセルチェック
    println("2秒経過")
    runCatching { delay(1_000) }
    ensureActive() // runCatching { } の後にキャンセルチェック
    println("3秒経過")
    runCatching { delay(1_000) }
    ensureActive() // runCatching { } の後にキャンセルチェック
    println("4秒経過")
    runCatching { delay(1_000) }
    ensureActive() // runCatching { } の後にキャンセルチェック
    println("5秒経過")
}
```

出力結果はこうです。  
キャンセル後は余計な処理がされていないことを確認できました！

```plaintext
1秒経過
キャンセルしたよ
おわったよ
```

## キャンセルは協力的
さて、ここからが大事です。（ここまでも大事ですが）  
さっき書いたカウントアップするだけのコードはキャンセル出来ましたが、これは`delay()`や`isActive`がキャンセルに協力しているからキャンセルできただけです。  
自分でサスペンド関数を書く場合は、キャンセルに協力的になる必要があります。

例えば以下の、コルーチンの中で、`OkHttp`で`GET`リクエストを同期的に呼び出すコードを動かしてみます。  

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // 別スレッドを指定したコルーチン
        val internetJob = lifecycleScope.launch(Dispatchers.IO) {
            repeatGetRequest()
        }

        lifecycleScope.launch {
            delay(2_000)
            println("キャンセルします")
            internetJob.cancelAndJoin()
            println("cancelAndJoin() 終わりました")
        }
    }

    // OkHttp の同期モードで何回か GET リクエストを投げます
    private suspend fun repeatGetRequest() {
        // 5 回くらい
        repeat(5) {
            val request = Request.Builder().apply {
                url("https://example.com")
                get()
            }.build()
            val response = OkHttpClient().newCall(request).execute()
            println("レスポンス ${response.code}")
        }
    }
}
```

読者さんのインターネットの速度によっては、以下のように再現できないかも。なのであれなのですが。（開発者向けオプションのネットワーク速度を変更する、使わなければ`128k`の`povo 2.0`を契約する等）  

しかし、さっきのカウントアップのときとは違い、`cancel()`を呼んだのにもかかわらず、`GET`リクエストが続行されています。  
**これはキャンセルに協力的ではありませんね。** キャンセルしたらインターネット通信を始めないでほしいです。ギガが減るんでね。

```plaintext
レスポンス 200
レスポンス 200
キャンセルします
レスポンス 200
レスポンス 200
レスポンス 200
cancelAndJoin() 終わりました
```

ギガが減るのも良くないけど、キャンセルが適切に行われないとクラッシュを巻き起こす可能性もあります。  
画面回転や、Fragment の破棄後に非同期処理が終わり、破棄されているのに`UI`更新しようとして落ちるパターン。`ViewModel`が来る前まではみんな引っかかってたはず。  
`getActivity() != null`とか、`Fragment#isAdded() == true`とかで分岐してなんとかしのいでた。

例に漏れずコルーチンでも、`UI`破棄のタイミングでキャンセルを要求したのは良いものの、キャンセル対応のサスペンド関数を書いていないと、破棄後に`UI`更新する羽目になりやっぱり同じエラーに鳴ってしまいます。  
まあ`UI`関係ないなら`ViewModel`に書けよという話ではあるんですが。

## キャンセル可能な処理の作り方
いくつか、キャンセルに関連する関数、フラグがあります。

- `yield()`
    - https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/yield.html
    - 可能であれば、他のコルーチンの処理のためにスレッドを譲る
    - キャンセルされていれば、キャンセル例外を投げる
- `CoroutineScope#isActive`
    - https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/is-active.html
    - キャンセルされていれば false
    - キャンセルされていない場合は true
- `CoroutineScope#ensureActive()`
    - https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/ensure-active.html
    - キャンセルされていれば、キャンセル例外を投げる

`try-catch / runCatching`のときにも触れましたが、`isActive`と`ensureActive()`は`コルーチンスコープ`の拡張関数になっていて、  
サスペンド関数の中を`coroutineScope { }`で囲ってあげるか、`launch { }`の直下で使う必要があります。  
まあ`yield()`もよく見ると`coroutineScope { }`を使っているので適当に`coroutineScope { }`で囲っとけばいいんじゃない（適当）

今回なら、インターネット通信を始める前にキャンセルされているか確認すれば良さそうですね。  
直前に`ensureActive()`を呼ぶか、`isActive`で確認を入れれば良さそうですね。  

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // 別スレッドを指定したコルーチン
        val internetJob = lifecycleScope.launch(Dispatchers.IO) {
            repeatGetRequest()
        }

        lifecycleScope.launch {
            delay(2_000)
            println("キャンセルします")
            internetJob.cancelAndJoin()
            println("cancelAndJoin() 終わりました")
        }
    }

    // OkHttp の同期モードで何回か GET リクエストを投げます
    private suspend fun repeatGetRequest() = coroutineScope {
        // 5 回くらい
        repeat(5) {
            // キャンセル済みならリクエストしない
            ensureActive()
            val request = Request.Builder().apply {
                url("https://example.com")
                get()
            }.build()
            val response = OkHttpClient().newCall(request).execute()
            println("レスポンス ${response.code}")
        }
    }
}
```

こんな感じにキャンセル後もリクエストが継続されているような挙動じゃなくなりました。  
自分で作ったサスペンド関数がキャンセル可能になりました！！！キャンセル後も、キャンセルする前のリクエストが残ってるせいで微妙に分かりにくい。

```plaintext
レスポンス 200
レスポンス 200
キャンセルします
レスポンス 200
cancelAndJoin() 終わりました
```

もし`while`ループをしている場合も同様で、`isActive`でループを抜けられるようにするか、`ensureActive()`で例外を投げる必要があります。

```kotlin
// OkHttp の同期モードで何回か GET リクエストを投げます
private suspend fun repeatGetRequest() = coroutineScope {
    // 5 回くらい
    var count = 0
    while (count < 5 && isActive) { // isActive も確認する
        val request = Request.Builder().apply {
            url("https://example.com")
            get()
        }.build()
        val response = OkHttpClient().newCall(request).execute()
        println("レスポンス ${response.code}")
        count++
    }
}
```

### 付録 どこに ensureActive() / isActive を入れるの
キャンセルされているか確認しろと言われても、1行毎に入れていったら洒落にならないでしょう。  

これの答えは、インターネット通信とか、ファイル読み書きとか、`CPU`を大量に消費する処理（フィボナッチ数列を計算する）とかの、  
**重たい、時間がかかる処理**を始める前に確認すればいいんじゃないかなと思います。  
https://developer.android.com/kotlin/coroutines/coroutines-best-practices?hl=ja#coroutine-cancellable

それから、`delay()`やそのほか`kotlinx.coroutines`パッケージ傘下にあるサスペンド関数（最初から用意されているサスペンド関数）は、**基本的にキャンセルに対応している**ため、`ensureActive()`とかで確認せずともキャンセルされたら例外を投げてくれるはずです。  

逆を言えば最初から用意されていない、自分でサスペンド関数を書く場合はキャンセル出来るよう心がける必要があります。

- `delay`
    - https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/delay.html
- `withContext`（後述）
    - https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-context.html
- `join` / `cancelAndJoin`
    - https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/join.html
    - https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/cancel-and-join.html

### 付録 ensureActive() と isActive 2つもあって迷っちゃうな～
https://medium.com/androiddevelopers/cancellation-in-coroutines-aa6b90163629

確かに2パターンあります。  
微々たる差ではあるのですが、`isActive`の方は例外を投げないので、`while { }`の下でなにか処理をしたい場合にちょっと楽かもしれません。  
ただ、`ensureActive()`でも`try-finally`であとしまつ出来るので、どっちでもいい気がします。  

```kotlin
private suspend fun exampleEnsureActive() = coroutineScope {
    try {
        while (true) {
            ensureActive()
            // 重い処理
        }
    } finally {
        // あとしまつとか
    }
}

private suspend fun exampleIsActive() = coroutineScope {
    while (isActive) {
        // 重い処理
    }
    // あとしまつとか
}
```

そういえば、`ensureActive()`と違い、`isActive`の方は例外を投げないから、`isActive`でキャンセルを実装したらキャンセル後も処理が続行してしまうのでは、、、と思う方がいるかも知れません。例外の場合は投げれば後続の処理は実行されませんからね。  

```kotlin
coroutineScope {
    ensureActive() // コルーチンキャンセル時は例外を投げる
    println("生きてる") // 例外投げたらここに進まない
}
```

```kotlin
coroutineScope {
    if (isActive) {
        println("生きてる") // コルーチン生きてる時
    }
    println("あれ？") // ここコルーチンキャンセル時も来ちゃうんじゃない？
}
```

たしかにそれはそうです。ただ、これは`try-finally`すれば`ensureActive()`でも出来るやつなのでそういうものだと思います。  

じゃあ`isActive`を使った実装方法だと自作サスペンド関数がキャンセルに対応できないのかというと、そんなことはなくて、今回使った`coroutineScope { }`がキャンセルに対応しています。  
https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/coroutine-scope.html

`coroutineScope { }`のブロック内（波括弧の中身）が終了して、呼び出し元へ戻る際にキャンセルチェックが入ります。  
戻った際にキャンセルが要求されていることが分かったら`coroutineScope { }`自身が例外を投げます。

よって、今回書いてきたコードではどちらを使っても`coroutineScope { }`か`ensureActive()`が例外を投げてくれるので、キャンセルに対応することになります。

### 付録 yield() の説明もしろ
なんて読むのか調べたら`いーるど`って読むらしい。  
記事書き終わった後に良い例を思い出したので書いてみる。

ドキュメントではスレッドを譲るって書いてあるけど、なんか難しくて避けてた。  
これはスレッドを専有するような処理を書く時に使うと良いみたい。

まだ習ってない物を使いますが、`limitedParallelism()`を使い、`1スレッド`で処理されるコルーチンを2つ起動します。  
`1スレッド`しかないため、どちらかのコルーチンがスレッドを専有、ずっと終わらない処理を書いた場合はもう片方のコルーチンは処理されないことになります。例を書きます。

```kotlin
class MainActivity : ComponentActivity() {

    /** とりあえずは 1スレッド で処理されるコルーチンを作るためのものだと思って */
    private val singleThreadDispatcher = Dispatchers.Default.limitedParallelism(1)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // シングルスレッドでコルーチンを2つ起動
        lifecycleScope.launch(singleThreadDispatcher) {
            while (isActive) {
                // スレッドを専有する。
                // ここでは Thread.sleep() を使いスレッドを譲らずに経過時間までブロックする
                // 本来は Thread.sleep() は使わない。スレッドをブロックする例のため意図的に使っている。
                // ブロックするならインターネット通信等の IO 処理でもいいよ
                Thread.sleep(3_000)
                println("[launch 1] Thread.sleep")
            }
        }
        lifecycleScope.launch(singleThreadDispatcher) {
            // 同じものを作る
            while (isActive) {
                Thread.sleep(3_000)
                println("[launch 2] Thread.sleep")
            }
        }
    }
}
```

これで`logcat`を見てみると、`[launch 1]`しかログが出ていません。  
なぜなら**シングルスレッドしか無い上に**、**スレッドをブロックする無限ループ**を書いて専有してしまっているためです。

```plaintext
[launch 1] Thread.sleep
[launch 1] Thread.sleep
[launch 1] Thread.sleep
[launch 1] Thread.sleep
[launch 1] Thread.sleep
```

ここで`yield()`が役に立ちます。説明どおりならスレッドを譲ってくれるはずです。  
ループ毎に`yield()`を呼び出してみましょう。

```kotlin
class MainActivity : ComponentActivity() {

    /** とりあえずは 1スレッド で処理されるコルーチンを作るためのものだと思って */
    private val singleThreadDispatcher = Dispatchers.Default.limitedParallelism(1)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // シングルスレッドでコルーチンを2つ起動
        lifecycleScope.launch(singleThreadDispatcher) {
            while (isActive) {
                yield() // 他にコルーチンあれば譲る
                // スレッドを専有する。
                // ここでは Thread.sleep() を使いスレッドを譲らずに経過時間までブロックする
                // 本来は Thread.sleep() は使わない。スレッドをブロックする例のため意図的に使っている。
                // ブロックするならインターネット通信等の IO 処理でもいいよ
                Thread.sleep(3_000)
                println("[launch 1] Thread.sleep")
            }
        }
        lifecycleScope.launch(singleThreadDispatcher) {
            // 同じものを作る
            while (isActive) {
                yield() // 他にコルーチンあれば譲る
                Thread.sleep(3_000)
                println("[launch 2] Thread.sleep")
            }
        }
    }
}
```

これで、`logcat`を見てみると、`[launch 2]`の出力がされるようになりました。  
スレッドを専有するような処理では`yield()`を入れておくと良いかもですね！

## try-finally が動く
キャンセルできるサスペンド関数は、キャンセル時はキャンセル例外を投げるため、`try-finally`が完全に動作します。  
処理が完了するか、はたまたキャンセルされるかわかりませんが、`finally`に書いておけばどちらにも対応できます。プログラミングのいろはがようやく戻ってきました。

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            // 5秒で終わってみる
            val job1 = launch { tryFinally() }
            delay(5_000)
            job1.cancelAndJoin()

            println("---")

            // 10秒で終わってみる
            val job2 = launch { tryFinally() }
            delay(10_000)
            job2.cancelAndJoin()

        }
    }

    private suspend fun tryFinally() {
        try {
            delay(10_000)
            println("10秒待った")
        } finally {
            println("finally ですよ")
        }
    }
}
```

こんな感じにキャンセルされる、されないに関係なく`finally`が実行できています。やったやった！

```plaintext
finally ですよ
---
10秒待った
finally ですよ
```

## finally でコルーチンが起動できない解決策
コルーチンがキャンセルした後、新しくコルーチンを起動することが出来ません。  
あんまりないかもしれませんが、どうしても`finally`でサスペンド関数を呼び出したいときの話です。

キャンセル済みの場合、`finally { }`の中ではコルーチンを起動しても、キャンセル済みなので`ensureActive()`を呼び出すと例外をスローするし、`isActive`は`false`になります。  
サスペンド関数は動かなくなります。

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            val job = launch { tryFinally() }
            delay(5_000)
            println("キャンセル")
            job.cancelAndJoin()
        }
    }

    private suspend fun tryFinally() {
        try {
            delay(10_000)
            println("10秒待った")
        } finally {
            sendLog()
            println("ログ送信")
        }
    }

    private suspend fun sendLog() = coroutineScope {
        // キャンセルチェック
        ensureActive()
        // TODO ログ送信
    }
}
```

どうしても`finally { }`でサスペンド関数を呼び出したい場合は、`withContext(NonCancellable) { }`で処理をくくると、サスペンド関数も一応動くようになります。  
`withContext`は後述します。が、`NonCancellable`を引数に渡すと、キャンセル不可の処理を実行できるようになります。

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            val job = launch { tryFinally() }
            delay(5_000)
            println("キャンセル")
            job.cancelAndJoin()
        }
    }

    private suspend fun tryFinally() {
        try {
            delay(10_000)
            println("10秒待った")
        } finally {
            // キャンセル不可にする
            withContext(NonCancellable) {
                sendLog()
                println("ログ送信")
            }
        }
    }

    private suspend fun sendLog() = coroutineScope {
        // キャンセルチェック
        ensureActive()
        println("isActive = $isActive")
        // TODO ログ送信
    }

}
```

出力結果はこうです、`ensureActive()`がキャンセル例外をスローしなくなりました。  
一方、`isActive`とかも、`NonCancellable`が付いている場合は`true`になるので注意です。キャンセルされたかの判定が壊れます。  
あくまでリソース開放とかの最小限にとどめましょうね。

```plaintext
キャンセル
isActive = true
ログ送信
```

ちなみに、`NonCancellable`、よく見ると`launch { }`にも渡せるんですが、`withContext { }`以外で使ってはいけません。  
https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-non-cancellable/

## タイムアウト
タイムアウトもできます。  
`withTimeout { }`を使うと指定時間以内にコルーチンが終了しなかった場合に、  
`withTimeout { }`の中の処理はキャンセルし、また関数自身も`TimeoutCancellationException`をスローします。

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            try {
                withTimeout(5_000) {
                    tryFinally()
                }
            } catch (e: TimeoutCancellationException) {
                println("たいむあうと！")
                throw e
            }
        }
    }

    private suspend fun tryFinally() {
        try {
            delay(10_000)
            println("10秒待った")
        } finally {
            println("finally")
        }
    }
}
```

```plaintext
finally
たいむあうと！
```

先述の通り、タイムアウトしたら`withTimeout`は例外を投げるので、投げられた場合後続する処理が動きません。

```kotlin
lifecycleScope.launch {
    withTimeout(5_000) {
        tryFinally()
    }
    println("タイムアウト例外が出たら動かない") // withTimeout が例外を投げるせいでここには来ない
}
```

それが困る場合は、代わりに`null`を返す`withTimeoutOrNull { }`を使うと良いです。  

```kotlin
lifecycleScope.launch {
    val resultOrNull = withTimeoutOrNull(5_000) {
        tryFinally()
    }
    println("タイムアウト例外が出たら動かない")
}
```

```plaintext
finally
タイムアウト例外が出たら動かない
```

### 付録 質問:キャンセル例外を投げればキャンセルしたことになりますか
これは元ネタがあって、私はただパクっただけです、興味があれば先に元ネタを読んでください。  
https://medium.com/better-programming/the-silent-killer-thats-crashing-your-coroutines-9171d1e8f79b

**回答: なりません**  

`ensureActive()`の説明では以下のコードと大体同じことをやっていると書いています。  
これだけ見ると、例外を投げればキャンセルできるのかと思ってしまいます。  
https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/ensure-active.html  

```kotlin
if (!isActive) {
    throw CancellationException()
}
```

それでは自分で投げてみましょう！キャンセル時の挙動は、先述の通り、  

- `isActive`が`false`であるはずで、  
- `ensureActive()`も例外を投げるはずで、
- `withContext { }`も使えないはず、

なので、それも出力して見てみることにします。

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            try {
                throwCancel()
            } catch (e: CancellationException) {
                println("CancellationException !!!")
                println("isActive = $isActive")

                // ensureActive() でも例外を投げるか確認
                try {
                    ensureActive()
                    println("ensureActive() スローせず")
                } catch (e: CancellationException) {
                    println("ensureActive() キャッチ")
                    throw e
                }
                
                throw e
            }
        }
    }

    private suspend fun throwCancel() {
        delay(3_000)
        throw CancellationException()
    }
}
```

で、`logcat`に出てきたのがこれです。  

```plaintext
CancellationException !!!
isActive = true
ensureActive() スローせず
withContext に入りました
```

どうやらダメみたいですね。  
**キャンセル例外を投げるだけではキャンセル扱いにはならないみたいです。ちゃんと正規ルートでキャンセルしましょう。**

これはほとんど無いと思いたい。。。！  
ただ、`CancellationException`が`Kotlin Coroutines`で追加された例外ではなく、`Java`の**エイリアス**になっているので,  
`Kotlin Coroutines`のことを一切考慮していない`Java / Kotlin`コードからその例外を投げられる可能性は、、、可能性だけならありますね。

# サスペンド関数
https://kotlinlang.org/docs/composing-suspending-functions.html

つぎはこれ、サスペンド関数の話です。ついに並列処理の話ができます。

## 直列処理
今まで通り、そのまま書けば直列処理です。  
普通に書くだけで順番通りに処理されるとか、コールバックのときにはあり得なかったことですね。

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch(Dispatchers.Default) {
            request()
        }
    }

    private suspend fun request() {
        // 直列で実行する
        val time = measureTimeMillis {
            requestInternet()
            requestInternet()
        }
        println("$time ms で完了")
    }

    private suspend fun requestInternet() = coroutineScope {
        ensureActive()
        val request = Request.Builder().apply {
            url("https://example.com")
            get()
        }.build()
        OkHttpClient().newCall(request).execute()
    }

}
```

結果はこう。直列処理なので、1つ目が終わるまで2つ目は呼ばれません。

```plaintext
1474 ms で完了
```

## 並列処理
次に並列処理です。1番目の処理を待たずに並列で走らせることが出来ます。  
`async { }`と`await()`を使います。

`async { }`の使い方は`launch { }`のそれと同じなのですが、`launch { }`と違って返り値を返せます！  
`await()`で返り値を取得できます。  
それ以外は大体同じなので`コルーチンスコープ`が必要なのも同様です。  

```kotlin
private suspend fun request() = coroutineScope { // scope を用意
    // 並列で実行する
    val time = measureTimeMillis {
        // async { } はすぐ実行されます
        val request1 = async { requestInternet() }
        val request2 = async { requestInternet() }

        // なんかやる...

        // 待ち合わせする
        val response1 = request1.await()
        val response2 = request2.await()
    }
    println("$time ms で完了")
}
```

直列のときよりも大体半分の時間で終わっています。  

```plaintext
731 ms で完了
```

数が多い場合は配列に入れて`awaitAll()`すると良いかもしれません。  
見た目が良くてすき

```kotlin
private suspend fun request1() = coroutineScope {
    // 並列で実行する
    val time = measureTimeMillis {
        // listOf でも
        val responseList = listOf(
            async { requestInternet() },
            async { requestInternet() }
        ).awaitAll()

        val (response1, response2) = responseList
    }
    println("$time ms で完了")
}

private suspend fun request2() = coroutineScope {
    // 並列で実行する
    val time = measureTimeMillis {
        // map で async を返して awaitAll() する
        val responseList = (0 until 2) // [0, 1]
            .map { async { requestInternet() } } // すべて並列で実行
            .awaitAll() // 全て待つ

        // 取り出す
        val (response1, response2) = responseList
    }
    println("$time ms で完了")
}
```

### 並列処理の開始を制御する
`async { }`は何もしない場合はすぐに実行されますが、明示的に開始するように修正することが出来ます。  
`async { }`の引数に`start = CoroutineStart.LAZY`をつけると、`start()`を呼び出すまで動かなくなります。

```kotlin
private suspend fun requestInternet() = coroutineScope {
    println("requestInternet()")
    ensureActive()
    val request = Request.Builder().apply {
        url("https://example.com")
        get()
    }.build()
    OkHttpClient().newCall(request).execute()
}

private suspend fun request() = coroutineScope { // scope を用意
    // 直列で実行する
    val time = measureTimeMillis {
        val request1 = async(start = CoroutineStart.LAZY) { requestInternet() }
        val request2 = async(start = CoroutineStart.LAZY) { requestInternet() }

        // なんかやる...
        println("起動前")

        // async 開始する
        request1.start()
        request2.start()
        println("開始した")

        // 待ち合わせする
        val response1 = request1.await()
        val response2 = request2.await()
    }
    println("$time ms で完了")
}
```

出力はこうです。  
ちゃんと`start()`した後に`requestInternet()`が呼ばれてそうですね。

```plaintext
起動前
開始した
requestInternet()
requestInternet()
659 ms で完了
```

## 構造化された並行性
は最初の方で話したので、まずはこちらを読んでください。`Promise / Future`との違いの話です。  
[#構造化された並行性](#構造化された並行性)

で、上記では触れなかった`async { }`の使い方をば。  
**他の言語から来た場合**、`async`キーワードは**関数宣言時**に使うので、このように書きたくなるかなと思います。

```kotlin
// ダメなパターン
@OptIn(DelicateCoroutinesApi::class)
private fun requestInternet1() = GlobalScope.async(Dispatchers.IO) { // 関数宣言時に async を使いたくなる
    ensureActive()
    val request = Request.Builder().apply {
        url("https://example.com")
        get()
    }.build()
    return@async OkHttpClient().newCall(request).execute()
}
```

しかし、構造化された並行性がある`Kotlin Coroutines`では`async { }`は呼び出し側で使うのが良いです。  
関数の返り値に`async { }`を使う、ではなくサスペンド関数を作って`async { }`の中で呼び出すのが良いです。

というのも、これだと子コルーチンのどれかが失敗した際に、他の子コルーチンをキャンセルする動作が動かないんですよね。  

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch(Dispatchers.Default) {
            val job = launch {
                try {
                    task()
                } catch (e: RuntimeException) {
                    // ...
                }
            }
            println("launch した")
            delay(3_000)
            job.cancel()
            println("キャンセル")
            job.join()
            println("おわった")
        }
    }

    private suspend fun task() = coroutineScope {
        listOf(
            launch { suspendDelay(tag = "launch") },
            async { suspendDelay(tag = "async") },
            asyncDelay(),
            launch {
                // 子コルーチンの1つを失敗にする。全部にキャンセルが行くはず
                delay(3_000)
                println("例外を投げます")
                throw RuntimeException()
            }
        ).joinAll()
    }

    // ダメなパターン
    private fun asyncDelay() = GlobalScope.async {
        suspendDelay(tag = "asyncDelay")
    }

    /** 適当な時間 delay する */
    private suspend fun suspendDelay(tag: String) {
        try {
            delay(10_000)
            println("[$tag] 10秒たった")
        } catch (e: CancellationException) {
            println("[$tag] キャンセル！")
            throw e
        } finally {
            println("[$tag] おわり")
        }
    }
}
```

出力はこうです

```plaintext
launch した
例外を投げます
[launch] キャンセル！
[launch] おわり
[async] キャンセル！
[async] おわり
キャンセル
おわった
[asyncDelay] 10秒たった
[asyncDelay] おわり
```

構造化された並行性では、子のどれか1つが失敗したら他の子コルーチンにもキャンセルが伝搬するのですが、結果はこうです。  
`launch { suspendDelay(tag = "launch") }`、`async { suspendDelay(tag = "async") }`はちゃんとキャンセルされているのですが、`asyncDelay()`だけは生き残っています。  

これはなぜかと言うと、`asyncDelay()`だけはコルーチンスコープが違うため、キャンセル命令が行き届いてないのです。  
`launch { }`と`async { }`は`suspendCoroutine { }`のコルーチンスコープを使っていますが、`asyncDelay()`は`GlobalScope`のコルーチンスコープを使っています。

そのため、修正するとしたら、  
コルーチンスコープを`asyncDelay()`の引数に渡すよりは、`asyncDelay()`関数を`サスペンド関数`にし、`async { }`を呼び出す責務を呼び出し側に移動させるのが正解です。  
`async { suspendDelay(tag = "async") }`の使い方が正解ですね。

他の言語にある`Promise`とかは、返り値を返すこのスタイルが使われているので注意です。

### 付録 launch と async
`async { }`だと値が返せるんだし、全部`async { }`でいいのではと。  
値を返さない場合は`launch { }`、値を返す必要があれば`async { }`でいいと思います。`launch { }`のほうが考えることが少なくてよいです。

というのも、詳しくは`例外の章`で話すのですが、例外を投げる部分が違ってきます。ほんと微々たる違いなのですが、例外なのでシビアにいきましょう。  
`launch { }`は、親のコルーチンまで例外を伝達させます。親まで伝達するため他の子コルーチンもキャンセルになります。  
ので、例外をキャッチするには`coroutineScope { }`（親のスコープ）で`try-catch`する必要があります。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            try {
                coroutineScope {
                    listOf(
                        launch { delay(5_000) },
                        launch { delay(5_000) },
                        launch {
                            delay(3_000)
                            throw RuntimeException() // 3 秒後に失敗
                        }
                    )
                }
            } catch (e: RuntimeException) {
                println("投げた RuntimeException をキャッチ")
            }
        }
    }
}
```

`async { }`は例外を返せます。`launch { }`と違い、`async { }`は`await()`を使い値を返せるといいましたが、`await()`で例外も受け取ることが出来ます。  
**ついでに親のコルーチンスコープまで例外を伝達させます。** 親まで伝達するため他の子コルーチンもキャンセルになります。  

なので、`await()`の部分ではなく、`try-catch`は`coroutineScope { }`や親のコルーチンでやる必要があります。**ちなみに**`await()`で`try-catch`してもキャッチできます。ただ親にも伝達します。  

逆に期待通り、`await()`で例外をキャッチできるようにする方法もあります。親に伝搬しない方法。  
`SupervisorJob()`や`supervisorScope { }`を使うことで`await()`で例外をキャッチして、かつ親にも伝搬しないようになります。が、後述します。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            try {
                coroutineScope { // 親にも例外が行く
                    val asyncTasks = async {
                        delay(3_000)
                        throw RuntimeException() // 3 秒後に失敗
                    }
                    try {
                        asyncTasks.await()
                    } catch (e: RuntimeException) {
                        println("await() で RuntimeException をキャッチ")
                    }
                }
            } catch (e: RuntimeException) {
                println("coroutineScope() で RuntimeException をキャッチ")
            }
        }
    }
}
```

出力がこう

```plaintext
await() で RuntimeException をキャッチ
coroutineScope() で RuntimeException をキャッチ
```

# コルーチンコンテキストとディスパッチャ
https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html

`launch { }`や`async { }`には引数を渡すことが出来ます。この引数のことを`CoroutineContext`（コルーチンコンテキスト）といいます。  
コルーチンコンテキストには後述する`Dispatchers`などを設定できるのですが、この章ではその話です。

## スレッドとディスパッチャ
コルーチンは大量に作れますが、結局はどれかのスレッドで処理されるといいました。  
`launch { }`と`async { }`では、引数に`Dispatchers`を指定することが出来ます。この`Dispatchers`が実際に処理されるスレッドを指定するものです。  

よく使うのが以下の3つです。

|                       | 解説                                                                             | スレッド数                             |
|-----------------------|----------------------------------------------------------------------------------|----------------------------------------|
| `Dispatchers.Default` | メインスレッド以外のスレッドで、CPU を消費する処理向けです。                     | 2 個以上`CPU のコア数`以下             |
| `Dispatchers.IO`      | メインスレッド以外のスレッドで、インターネット通信や、ファイル読み書き向けです。 | 少なくとも 64 個、足りなければ増える。 |
| `Dispatchers.Main`    | メインスレッドです。                                                             | 1 個                                   |

`Default`と`IO`は、`Dispatchers`が複数のスレッドを持っている（雇っている）形になります。  
その時空いているスレッドが使われる感じです。

`Dispatchers.Main`に関して、`Kotlin`のドキュメントには出てこないので不思議に思ったかもしれません。なぜかというと`Android用`（というか`GUI`向け）に拡張して作られたからです  
https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-main.html

実際に指定してみます。以下のコードを試してみましょう。

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            printThread()
        }
    }

    private suspend fun printThread() = coroutineScope {
        launch {
            println("launch 無指定 ${Thread.currentThread().name}")
        }
        launch(Dispatchers.Unconfined) {
            println("launch Unconfined ${Thread.currentThread().name}")
        }
        launch(Dispatchers.Default) {
            println("launch Default ${Thread.currentThread().name}")
        }
        launch(Dispatchers.IO) {
            println("launch IO ${Thread.currentThread().name}")
        }
        launch(Dispatchers.Main) {
            println("launch Main ${Thread.currentThread().name}")
        }
    }
}
```

出力がこうです。  
出力される順番が前後するかもしれませんが気にせず。

```plaintext
launch Default DefaultDispatcher-worker-2
launch IO DefaultDispatcher-worker-1
launch 無指定 main
launch Unconfined main
launch Main main
```

無指定の場合は`main`になっていますが、これは呼び出し元、親の`Dispatchers`を引き継ぐためです。  
しかし`printThread()`を呼び出している`launch { }`でも無指定です。特に親の`launch`でも指定がない場合はコルーチンスコープに設定されている`Dispatchers`が使われます。  

ちなみに、`Dispatchers.Main`以外は、**複数のスレッドが処理を担当**するため、もしスレッドに依存した処理を書く場合は注意してください。  
`Android`開発においてはメインスレッドとそれ以外のスレッドという認識（雑）なので特に問題はないはずです。問題がある場合は`newSingleThreadContext`の説明も読んでください。

例えば以下のコード、どのスレッドで処理されるかは`Kotlin Coroutines`のみが知っています。  

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch(Dispatchers.Default) { println("Default ${Thread.currentThread().name}") }
        lifecycleScope.launch(Dispatchers.Default) { println("Default ${Thread.currentThread().name}") }
        lifecycleScope.launch(Dispatchers.Default) { println("Default ${Thread.currentThread().name}") }
        lifecycleScope.launch(Dispatchers.Default) { println("Default ${Thread.currentThread().name}") }
        lifecycleScope.launch(Dispatchers.Default) { println("Default ${Thread.currentThread().name}") }
    }
}
```

予測は出来ません。続きを読めば対策方法があります。

```plaintext
Default DefaultDispatcher-worker-1
Default DefaultDispatcher-worker-2
Default DefaultDispatcher-worker-1
Default DefaultDispatcher-worker-2
Default DefaultDispatcher-worker-1
```

### Android が用意しているスコープはメインスレッド
`Android`の`lifecycleScope`と`Jetpack Compose`の`rememberCoroutineScope()`、`LaunchedEffect`はデフォルトで`Main`が指定されています。  
が、心配になってきたので一応試しましょう。`coroutineContext[CoroutineDispatcher]`で`Dispatchers`を取り出せるようです。

```kotlin
class MainActivity : ComponentActivity() {

    @OptIn(ExperimentalStdlibApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        println("lifecycleScope = ${lifecycleScope.coroutineContext[CoroutineDispatcher]}")

        setContent {
            val composeScope = rememberCoroutineScope()
            println("rememberCoroutineScope() = ${lifecycleScope.coroutineContext[CoroutineDispatcher]}")

            LaunchedEffect(key1 = Unit) {
                println("LaunchedEffect = ${lifecycleScope.coroutineContext[CoroutineDispatcher]}")
            }
        }
    }
}
```

結果は認識通り、`Main`が使われていました。よかった～

```plaintext
lifecycleScope = Dispatchers.Main.immediate
rememberCoroutineScope() = Dispatchers.Main.immediate
LaunchedEffect = Dispatchers.Main.immediate
```

### 付録 Dispatchers.Main.immediate の immediate って何
`lifecycleScope`や`rememberCoroutineScope`、`LaunchedEffect`の`コルーチンスコープ`は`Dispatchers.Main.immediate`だということが判明しました。  
しかし、`Dispatchers.Main`と`Dispatchers.Main.immediate`の違いはなんなのでしょうか？

https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-main-coroutine-dispatcher/immediate.html

・・・？？  
というわけでドキュメントを見てみましたが、いまいちよく分からなかったので、一緒に書いてあるサンプルコードのコメントを元に実際に動かしてみる。  
サンプルコードのコメントを見るに、すでにメインスレッドで呼び出されている場合は、即時実行される。とのこと。試します。

まずは`Dispatchers.Main`で。

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        println("0")
        lifecycleScope.launch(Dispatchers.Main) {
            println("1")
        }
        lifecycleScope.launch(Dispatchers.Main) {
            println("2")
        }
        lifecycleScope.launch(Dispatchers.Main) {
            println("3")
        }
        println("4")
    }
}
```

これは予想通り、`launch { }`で囲った`1/2/3`よりも先に`4`がでますね。 

```plaintext
0
4
1
2
3
```

一方、`Dispatchers.Main.immediate`をつけると・・・？

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        println("0")
        lifecycleScope.launch(Dispatchers.Main.immediate) {
            println("1")
        }
        lifecycleScope.launch(Dispatchers.Main.immediate) {
            println("2")
        }
        lifecycleScope.launch(Dispatchers.Main.immediate) {
            println("3")
        }
        println("4")
    }
}
```

おお！すでにメインスレッドで呼ばれている場合は`launch { }`が後回しにされずに即時実行されていますね。  

```kotlin
0
1
2
3
4
```

## newSingleThreadContext
ごく、極稀に、自分で作ったスレッドでコルーチンを処理させたい時があります。  
あんまり、というか本当に無いと思うのですが、唯一あったのが`OpenGL ES`ですね。  

話がそれてしまうので手短に話すと、`OpenGL ES`は自分を認識するのにスレッドを使っています。  
メインスレッド以外で`UI`を操作できないのと同じように、`OpenGL ES`も`OpenGL ES`のセットアップ時に使われたスレッドを自分と結びつけます。  
そのため、`OpenGL ES`の描画を行う際は、スレッドを気にする必要があります。`OpgnGL ES`にはマルチスレッドは多分ありません。

話を戻して、どうしても自分で作ったスレッドでしか処理できない場合があります。  
その場合は`newSingleThreadContext()`を使うことで、**新しく Java のスレッドを作り**、その中で処理される`Dispatchers`を返してくれます。

はい。`Java のスレッド`を作ることになります。これを多用した場合は`Kotlin Coroutines`の売り文句の 1 つ、`スレッドより軽量`を失うことになります。  
そのため、シングルトンにしてアプリケーション全体で使い回すか、使わなくなったら破棄する必要があります。  
（親切なことに`AutoCloseable`インターフェースを実装しているので、`use { }`拡張関数が使えます！）

```kotlin
class MainActivity : ComponentActivity() {

    @OptIn(ExperimentalCoroutinesApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // close() するか use { } を使うこと
        val newThreadDispatcher = newSingleThreadContext("new thread !!!!!")

        newThreadDispatcher.use {
            lifecycleScope.launch(newThreadDispatcher) {
                println(Thread.currentThread().name)
            }
        }
    }
}
```

出力がこうです。ちゃんと新しく作ったスレッドで処理されていますね。  

```plaintext
new thread !!!!!
```

## Unconfined
私もこの記事を書くために初めて使う、し、いまいちどこで使えばいいかよくわからないので多分使わない。  

これは特別で、呼び出したサスペンド関数がスレッドを切り替えたら、サスペンド関数を抜けた後もそのスレッドを使うというやつです。  
よく分からないと思うので例を書くと。

と、その前に`Main`の例。`Main`で起動したコルーチンで`Dispatchers`を切り替える。  
`withContext`はまだ習っていないのですが、`CoroutineContext（Dispatchers）`を切り替える際に使います。後述します。

```kotlin
@OptIn(ExperimentalCoroutinesApi::class,DelicateCoroutinesApi::class)
class MainActivity : ComponentActivity() {

    /** 分かりやすいよう特別に Dispatchers を作る */
    private val specialDispatcher = newSingleThreadContext("special thread dispatcher !!!")

override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    lifecycleScope.launch(Dispatchers.Main) {
        println("1-1 = ${Thread.currentThread().name}")
        specialTask()
        println("1-2 = ${Thread.currentThread().name}")
    }

    lifecycleScope.launch(Dispatchers.Main) {
        println("2-1 = ${Thread.currentThread().name}")
        specialTask()
        println("2-2 = ${Thread.currentThread().name}")
    }
}

    override fun onDestroy() {
        super.onDestroy()
        specialDispatcher.close()
    }

    /** 1秒待つだけ。新しく作ったスレッドで */
    private suspend fun specialTask() = withContext(specialDispatcher) {
        delay(1_000)
    }

}
```

出力がこうです。  
ちゃんと`specialTask()`を呼び出し終わった後は`メインスレッド`で処理されていますね。

```plaintext
1-1 = main
2-1 = main
1-2 = main
2-2 = main
```

つぎに`Default`に書き換えてみます。

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    lifecycleScope.launch(Dispatchers.Default) {
        println("1-1 = ${Thread.currentThread().name}")
        specialTask()
        println("1-2 = ${Thread.currentThread().name}")
    }

    lifecycleScope.launch(Dispatchers.Default) {
        println("2-1 = ${Thread.currentThread().name}")
        specialTask()
        println("2-2 = ${Thread.currentThread().name}")
    }
}
```

**実行するたびに若干異なる場合がありますが、** 手元ではこうでした。  
`specialTask()`が終わった後は`Dispatchers.Default`のスレッドが使われてます。が、なぜか違うスレッドが使われてますね。これは`Default`は`Main`と違って複数のスレッドでコルーチンを処理しているためです。  

はじめの方で話した通り、サスペンド関数を抜けた後、（メインスレッドのようなスレッドが 1 つしかない場合を除いて）違うスレッドが使われる可能性があるといいました。その影響です。  
`DefaultDispatcher`は`Dispatchers.Default`が持っているスレッドなので（要検証）、スレッドこそ違うものが割り当てられましたが、`Dispatchers`は元に戻ってきていますね。

```plaintext
1-1 = DefaultDispatcher-worker-2
2-1 = DefaultDispatcher-worker-1
2-2 = DefaultDispatcher-worker-2
1-2 = DefaultDispatcher-worker-3
```

最後に`Unconfined`です。よく見ててください。  

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    lifecycleScope.launch(Dispatchers.Unconfined) {
        println("1-1 = ${Thread.currentThread().name}")
        specialTask()
        println("1-2 = ${Thread.currentThread().name}")
    }

    lifecycleScope.launch(Dispatchers.Unconfined) {
        println("2-1 = ${Thread.currentThread().name}")
        specialTask()
        println("2-2 = ${Thread.currentThread().name}")
    }
}
```

出力がこうです。  
`specialTask()`を抜けた後も`specialTask()`が使っていたスレッド（`Dispatchers`）を使っています。が、あんまり使う機会はないと思います。  
*知っていることを自慢できるかもしれないけど、そんなもん自慢したら深堀りされて詰む。*

```plaintext
1-1 = main
2-1 = main
1-2 = special thread dispatcher !!!
2-2 = special thread dispatcher !!!
```

## コンテキストを切り替える withContext
`withContext { }`、これまでも習ってないのにちょくちょくでてきてましたが。ついに触れます。  
これを使うと好きなところでスレッド、**正しくは**`Dispatchers`を切り替えることが出来ます。  

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // UI スレッドで処理させる
        lifecycleScope.launch(Dispatchers.Main) {
            changeThread()
        }
    }

    private suspend fun changeThread() = coroutineScope {
        withContext(Dispatchers.Default){
            println("Default スレッド = ${Thread.currentThread().name}")
        }
        println("元のスレッド = ${Thread.currentThread().name}")
        
        withContext(Dispatchers.Main){
            println("Main スレッド = ${Thread.currentThread().name}")
        }
        println("元のスレッド = ${Thread.currentThread().name}")
    }
}
```

出力がこうです。  
こんな感じにスレッドを行ったり来たり出来ます。`newSingleThreadContext()`も渡せます。  
ブロック内は指定したスレッドで処理されます。ブロックを抜けると元のスレッドに戻るため、スレッドを切り替えているのにコールバックのようにネストせずに書けるのが感動ポイント。  

```plaintext
Default スレッド = DefaultDispatcher-worker-1
元のスレッド = main
Main スレッド = main
元のスレッド = main
```

`delay()`のそれと同じように、この手の関数は、戻ってきた際に同じスレッドが使われるとは限らないので注意です。  
先述の通りスレッド、ではなく`Dispatchers`が元に戻るだけ、`Dispatchers.Default`は複数のスレッドを雇っているのでその時空いているスレッドが割り当てられます。

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch(Dispatchers.Default) {
            changeThread("[1]")
        }
        lifecycleScope.launch(Dispatchers.Default) {
            changeThread("[2]")
        }
    }

    private suspend fun changeThread(tag:String) = coroutineScope {
        println("$tag 1 = ${Thread.currentThread().name}")
        withContext(Dispatchers.Main){
            println("$tag 2 = ${Thread.currentThread().name}")
        }
        println("$tag 3 = ${Thread.currentThread().name}")
    }
}
```

これも実行するたびに変化するかもしれませんが、手元ではこんな感じに、`Dispatchers`こそ同じものの、スレッドは違うものが割り当てられてそうです。

```kotlin
[1] 1 = DefaultDispatcher-worker-1
[2] 1 = DefaultDispatcher-worker-2
[1] 2 = main
[2] 2 = main
[1] 3 = DefaultDispatcher-worker-3
[2] 3 = DefaultDispatcher-worker-2
```

また、キャンセル後にサスペンド関数が呼び出せないのと同じように、`withContext { }`も呼び出せません。  
ただし、キャンセルの章で話した通り、`NonCancellable`をつければ一応は使えます。乱用しないように。  

## Job()
構造化された並行性の章にて、親コルーチンは子コルーチンを追跡して、全部終わったことを確認した後に親が終わることを話しました。  
しかし、コルーチンスコープを使うことでこの親子関係を切ることが出来ることも話しました。

この他に`コルーチンコンテキスト`の`Job()`をオーバーライドすることでもこの関係を切ることが出来ます。  
こんな感じに。

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            val job = launch { otherJob() }
            println("親を起動")
            // 少し待った後、親をキャンセルする
            delay(3_000)
            println("キャンセル！")
            job.cancelAndJoin()
        }
    }

    private suspend fun otherJob() = coroutineScope {
        launch {
            println("Jobなし 開始")
            delay(5_000)
            println("Jobなし 5 秒まった")
        }
        launch(Job()) {
            println("Job指定 開始")
            delay(5_000)
            println("Job指定 5 秒まった")
        }
    }
}
```

親子関係が切れてしまったので、親がキャンセルされても生き残っていますね。使い道があるのかは知らない。  

```plaintext
親を起動
Jobなし 開始
Job指定 開始
キャンセル！
Job指定 5 秒まった
```

## デバッグ用に命名
本家の説明で十二分だとおもう  
https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html#naming-coroutines-for-debugging

## 同時に Dispatchers NonCancellable Job を指定したい
コルーチンコンテキストは`+ 演算子`で繋げることが出来ます。  

```kotlin
// UI スレッドで処理させる
lifecycleScope.launch {
    try {
        // キャンセルするかもしれない処理
    } finally {
        withContext(Dispatchers.Main + NonCancellable) {
            // UI スレッドかつ、キャンセル時も実行したい場合
        }
    }
}
```

## コルーチンスコープ
もし、自分でコルーチンスコープを作って管理する場合は、ちゃんと使わなくなった際にコルーチンスコープを破棄するようにする必要があります。  
例えば`Android`のサービスでコルーチンが使いたい場合、（`Activity`、`Fragment`、`Jetpack Compose`とは違い）`Android`では用意されていないため自分で用意する必要があります。  
作る分には`CoroutineScope()`や`MainScope()`を呼べば作れますが、ちゃんと破棄のタイミングでキャンセルしてあげる必要があります。

という話が`MainScope()`のドキュメントに書いてあるので読んで。  
https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-main-scope.html

```kotlin
class AndroidService : Service() {

    // Android の Service だと Kotlin Coroutines のためのコルーチンスコープがない。ので自分で用意する
    private val scope = MainScope() // もしくは CoroutineScope()

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    // Service が使われなくなったとき
    override fun onDestroy() {
        super.onDestroy()
        // コルーチンスコープも破棄する
        scope.cancel()
    }
}
```

## スレッドローカルデータ
すいませんこれは使ったこと無いので分かりません。；；  
https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html#thread-local-data

### 付録 Android の Handler と Dispatchers
`Android`では`Handler`を引数に渡す関数が結構あります。  
この手の関数は引数にコールバックと、そのコールバックを呼び出すスレッドを指定するための`Handler`を取ります。  
ちなみに`null`のときは`メインスレッド`、コードだと`Handler(Looper.getMainLooper())`を`Android`側で渡しているそうです。  

まあこの手の関数は`Handler`を`null`に出来て、しかも大抵は`null`で問題なかったりするのですが。（小声）  

例えば`Camera2 API`の写真撮影メソッド。`null`でメインスレッド？  
```kotlin
capture(frontCameraCaptureRequest, object : CameraCaptureSession.CaptureCallback {
    // ...以下省略
}, Handler(handlerThread.looper))
```

例えば`MediaCodec`の`setCallback()`。`null`でメインスレッド  
```kotlin
setCallback(object : MediaCodec.Callback() {
    // ...以下省略
}, Handler(handlerThread.looper))
```

例えば`MediaProjection`の`registerCallback()`。`null`でメインスレッド  
```kotlin
registerCallback(object : MediaProjection.Callback() {
    // ...以下省略
}, Handler(handlerThread.looper))
```

ただ、コールバックを別スレッドで呼び出されるよう`Handler()`と`HandlerThread()`を作ることもあるでしょう。`MediaCodec`の非同期モードは多分そう。  
概要としては、`HandlerThread()`と呼ばれるスレッドを作り、`Handler#getLooper()`を`Handler()`へ渡して、出来た`Handler`を引数に渡せば完成なのですが、もう一歩、この`Handler()`を`Kotlin Coroutines`の`Dispatchers`としても使うことが出来ます。  

（ということを最近知りました、ありがとうございます）  
https://qiita.com/sdkei/items/b066817fb7f7c34d5760

こんな感じですね。  
`HandlerThread()`を`Kotlin Coroutines`でも転用したい場合はどうぞ！

```kotlin
class MainActivity : ComponentActivity() {

    private val handlerThread = HandlerThread("handler_thread").apply { start() }
    private val handler = Handler(handlerThread.looper)
    private val handlerDispatcher = handler.asCoroutineDispatcher()

}
```

### 付録 Dispatchers.Default はなぜ最低 2 個で、Dispatchers.IO は最低 64 個もあるの
これの答えを`Kotlin Coroutines`の中で探したんですが、それっぽい記述を見つけることは出来ず。  

- Default
    - https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html
- IO
    - https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-i-o.html

というわけで手詰まりになりました。ここから先の話は憶測です。ドキュメントには書いていない話なので。  

`Kotlin Coroutines`関係なく、`CPU`を駆使する処理（`CPU バウンドなタスク`）だと、起動するスレッド数は搭載されている`CPU`のコア数と同じか半分が良いという風の噂があるらしい。  

- https://softwareengineering.stackexchange.com/questions/375929/
- https://stackoverflow.com/questions/14556037/

あんまり理解できてないけど、なんとなくこういうこと？かなり理論上な気はする。  

`CPU`を駆使する処理は`CPU`にしか依存していないので（遅くなる原因のファイル読み書き等の邪魔するものがない場合）1スレッドだけで使用率を`100%`に出来る？。  
1スレッドだけで`100%`になるからコア数以上に増やしてもそれ以上、`100%`を超えられないので意味がないってことらしい？

一方ファイル読み書きやインターネット通信（`IO バウンド`）は`CPU`がどれだけ早くても読み書き、通信速度がボトルネックで`100%`にできない？  
から並列化させて`CPU`を遊ばせない（暇させない）ほうがいいってことなのかな

# Flow と Channel
https://kotlinlang.org/docs/flow.html

<p style="font-size:30px; color:red; ">↓書きました↓</p>

https://takusan.negitoro.dev/posts/amairo_kotlin_coroutines_flow/

<del>
<p style="font-size:30px; color:red; ">省略します！！！</p>
</del>

~~やる気があれば`Flow`の話をします。~~  
~~というのも`Flow`はサスペンド関数のそれ同じくらい内容があってそれだけで記事一本出来てしまうので。。。~~

~~いやだって目次が多すぎる。。。~~

# 例外
例外の話です。地味に新しい事実がある  

## 違う親の子コルーチンの例外
違う親の子コルーチンというか、自分が親のコルーチンのときにも言える話ですね。`lifecycleScope.launch { }`のこと。  
まあ落ちます。自分が親のコルーチンにも言えることでしょうが。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            try {
                // this の Scope を使わずに起動
                val parent = lifecycleScope.launch {
                    delay(3_000)
                    throw RuntimeException()
                }
                parent.join()
            } catch (e: RuntimeException) {
                println("RuntimeException をキャッチ") // 出来ません
            }
        }
    }
}
```

```plaintext
Process: io.github.takusan23.kotlincoroutienspractice, PID: 24548
java.lang.RuntimeException
	at io.github.takusan23.kotlincoroutienspractice.MainActivity$onCreate$1$parent$1.invokeSuspend(MainActivity.kt:26)
	at kotlin.coroutines.jvm.internal.BaseContinuationImpl.resumeWith(ContinuationImpl.kt:33)
	at kotlinx.coroutines.DispatchedTaskKt.resume(DispatchedTask.kt:235)
```

ちなみに`async { }`は受け取れますが、そもそも違う親で起動しない気がして、だから何みたいな。。。。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            // this の Scope を使わずに起動
            val parent = lifecycleScope.async {
                delay(3_000)
                throw RuntimeException()
            }
            try {
                parent.await()
            } catch (e: RuntimeException) {
                println("RuntimeException をキャッチ") // できる。けどあんまりないハズ
            }
        }
    }
}
```

## キャッチされなかった例外を観測
キャッチされなかった例外を観測することが出来ます。キャッチされなかったというわけで、もうアプリは回復できません（落ちてしまう）  
スタックトレース収集とかに使えるかも？

試したことがあるかもしれませんが、`launch { }`を`try-catch`で囲っても意味がありません。普通に落ちます。  
軽量スレッドとはいえスレッドなんですから。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        try {
            lifecycleScope.launch {
                delay(3_000)
                throw RuntimeException()
            }
        } catch (e: Exception) {
            println("launch { } で例外をキャッチ") // 動かない
        }
    }
}
```

じゃあどうすればいいのかというと、`CoroutineExceptionHandler { }`を使うと出来ます。  
先述の通りキャッチされなかった例外が来るので、回復目的には使えません。出来るとしたらスタックトレースと回収とかアプリ全体を再起動とかでしょうか。  
ここでキャッチ出来るようになるので、アプリが落ちることはなくなります。

例えば以下のようにスタックトレースの回収が出来ます。

```kotlin
class MainActivity : ComponentActivity() {

    private val coroutineExceptionHandler = CoroutineExceptionHandler { coroutineContext, throwable ->
        // https://stackoverflow.com/questions/9226794/
        val stringWriter = StringWriter()
        val printWriter = PrintWriter(stringWriter)
        throwable.printStackTrace(printWriter)
        stringWriter.flush()

        println("!!! CoroutineExceptionHandler !!!")
        println(stringWriter.toString())
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch(coroutineExceptionHandler) {
            delay(3_000)
            throw RuntimeException()
        }
    }
}
```

`logcat`はこんな感じです。

```plaintext
System.out              io....an23.kotlincoroutienspractice  I  !!! CoroutineExceptionHandler !!!
System.out              io....an23.kotlincoroutienspractice  I  java.lang.RuntimeException
System.out              io....an23.kotlincoroutienspractice  I  	at io.github.takusan23.kotlincoroutienspractice.MainActivity$onCreate$1.invokeSuspend(MainActivity.kt:39)
System.out              io....an23.kotlincoroutienspractice  I  	at kotlin.coroutines.jvm.internal.BaseContinuationImpl.resumeWith(ContinuationImpl.kt:33)
System.out              io....an23.kotlincoroutienspractice  I  	at kotlinx.coroutines.DispatchedTaskKt.resume(DispatchedTask.kt:235)
```

ちなみに親以外に付けても動きませんので！  

```kotlin
lifecycleScope.launch {
    launch(coroutineExceptionHandler) { // 無意味！
        delay(3_000)
        throw RuntimeException()
    }
}
```

## キャンセルと大元の例外
子コルーチンの中で例外が投げられた場合、親を通じて他の子もキャンセルされるわけですが、子に来るのはキャンセル例外です。  
キャンセルの原因となった子コルーチンの例外は親のコルーチンで受け取れます。  

子コルーチンが`RuntimeException`でコケたら他の子コルーチンには`RuntimeException`が来るわけではなく、キャンセルの例外が来るよという話です。親で`RuntimeException`を受け取れます。

## 複数の例外の報告
はドキュメントにゆずります。得にはないかな、、、  
https://kotlinlang.org/docs/exception-handling.html#exceptions-aggregation

## スーパーパイザー
ドキュメントにあるサンプルコードパクっても`Android`だと動かないな、、、

ここまで出てきたコードでは子のコルーチンが例外投げられたら、親に伝搬し、他の子に対してはキャンセルを投げるというものでした。  
しかし、他の子コルーチンは生かしておきたい場合があります。その場合、子コルーチン内の処理を`try-catch`して例外を投げないようにする、でも良いですが、もう一つの方法があります。`SupervisorJob()`と`supervisorScope { }`です。

試してみましょう。  
指定時間後に成功するタスク`successTask()`と、指定時間後に例外を投げて失敗する`failTask()`をそれぞれ並列で呼び出します。  

`async { }`は`await()`で値もしくは例外を受け取ることが出来ます。って書いてあります。  
https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-supervisor-job.html

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            supervisorTask()
            println("supervisorScope { } complete !!!")
        }
    }

    private suspend fun supervisorTask() = supervisorScope {
        // 失敗する子を含んで並列起動
        val async1 = async { successTask() }
        val async2 = async { successTask() }
        val async3 = async { failTask() }

        listOf(async1, async2, async3).forEachIndexed { index, deferred ->
            try {
                // await() で例外をキャッチできる
                println("[$index] await()")
                println(deferred.await())
            } catch (e: RuntimeException) {
                println("[$index] RuntimeException キャッチ")
            }
        }
    }

    private suspend fun successTask(): String {
        delay(3_000)
        return "hello world"
    }

    private suspend fun failTask() {
        delay(2_000)
        throw RuntimeException()
    }
}
```

結果はこんな感じで、`supervisorScope { }`は子と子が持っている子にのみキャンセルが伝搬します。親には伝搬しません。  
ので、親に対して明示的にキャンセルしない場合は、子コルーチンはそのまま生き続けます。  

もちろん子がすべて終わるまで親が終わらないルールは`supervisorScope { }`でも引き継がれています。なので最後に`complete !!!`が出る形にあります。

```plaintext
[0] await()
hello world
[1] await()
hello world
[2] await()
[2] RuntimeException キャッチ
supervisorScope { } complete !!!
```

さっきは`async { }`の例を出しましたが、`launch { }`でも動きます。`async { }`だと`await()`でキャッチできますが、  
`launch { }`の場合はというと、、、、代わりにコルーチンスコープに設定された`CoroutineExceptionHandler`で例外をキャッチできます。コルーチンスコープにそれがない場合は落ちます。  

```kotlin
class MainActivity : ComponentActivity() {

    private val coroutineExceptionHandler = CoroutineExceptionHandler { coroutineContext, throwable ->
        throwable.printStackTrace(System.out) // System.out に出す
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch(coroutineExceptionHandler) { // CoroutineExceptionHandler をつける
            supervisorTask()
            println("supervisorScope { } complete !!!")
        }
    }

    private suspend fun supervisorTask() = supervisorScope {
        launch { println(successTask()) }
        launch { failTask() }
    }

    private suspend fun successTask(): String {
        delay(3_000)
        return "hello world"
    }

    private suspend fun failTask() {
        delay(2_000)
        throw RuntimeException()
    }
}
```

これでも`successTask()`がちゃんと生き残っています。  

```plaintext
java.lang.RuntimeException
	at io.github.takusan23.kotlincoroutienspractice.MainActivity.failTask(MainActivity.kt:47)
	at io.github.takusan23.kotlincoroutienspractice.MainActivity.access$failTask(MainActivity.kt:19)
	at io.github.takusan23.kotlincoroutienspractice.MainActivity$failTask$1.invokeSuspend(Unknown Source:14)
    ... 以下省略
hello world
supervisorScope { } complete !!!
```

# 並行処理と可変変数
見出しは適当につけました。  
最後の章。かな。

https://kotlinlang.org/docs/shared-mutable-state-and-concurrency.html

## マルチスレッド起因の問題はコルーチンでも起きる
マルチスレッドで変数を同時に書き換えると正しい値にならないというのは有名だと思います。  

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        var count = 0
        lifecycleScope.launch(Dispatchers.Default) {
            coroutineScope {
                repeat(10_000){
                    launch {
                        count++
                    }
                }
            }
            println("結果 = $count")
        }
    }
}
```

`logcat`はこうです。実行するタイミングによっては`10000`が表示されるかもしれませんが、それはたまたま動いただけです。  
これはマルチスレッドで同時に変数にアクセスしているから（まあ目には見えない速さなんですが）、タイミング悪く増える前の変数に`+1`したとかでおかしくなってるんでしょう。  

```plaintext
結果 = 9995
```

`Dispatchers`の章で話した通り、`Dispatchers.Main`やシングルスレッドの`Dispatchers`を使えば、他スレッドから参照されたり変更されたりしないので、ちゃんと期待通りになります。  

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Main とか
        lifecycleScope.launch(Dispatchers.Main) {
            increment()
        }

        // newSingleThreadContext() とか
        lifecycleScope.launch {
            newSingleThreadContext("single_thread_dispatchers").use { dispatcher ->
                withContext(dispatcher) {
                    increment()
                }
            }
        }
    }

    private suspend fun increment(){
        var count = 0
        coroutineScope {
            repeat(10_000) { // 10_000 回ループする
                launch {
                    count++ // +1 する
                }
            }
        }
        println("結果 = $count")
    }
}
```

また、変数に`@Volatile`を付けても期待通りにならないそうです（これがなんなのかいまいちわからないのでスルーします）

## ループと withContext
ちなみに`repeat { }`の中で`withContext { }`よりも`withContext { }`の中で`repeat { }`のほうが良いです。  
いくら軽いとはいえ、繰り返し文のたびに`withContext { }`を呼び出すのはコストがかかるそうです。

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            var count = 0
            val time1 = measureTimeMillis {
                repeat(10_000) {
                    withContext(Dispatchers.Default) {
                        count++ // 特に意味のないことをしてます。withContext の呼び出しが地味に重いので、time2 のようにループ開始前に呼び出しておくこと
                    }
                }
            }
            val time2 = measureTimeMillis {
                withContext(Dispatchers.Default) {
                    repeat(10_000) {
                        count++
                    }
                }
            }
            println("ループの中で withContext = $time1")
            println("withContext の中でループ = $time2")
        }
    }
}
```

```plaintext
ループの中で withContext = 716
withContext の中でループ = 0
```

## スレッドセーフ
いくつかあります。  
まずは`AtomicInteger`、これは`Int`ですが他にも`Boolean`とかもあるはず。何回実行しても`10000`になります。

```kotlin
val count = AtomicInteger()
lifecycleScope.launch(Dispatchers.Default) {
    coroutineScope {
        repeat(10_000){ // 10_000 回ループする
            launch {
                count.incrementAndGet() // +1 する
            }
        }
    }
    println("結果 = ${count.get()}")
}
```

あとは`synchronized`のコルーチン版`Mutex()`を使うことでも同時アクセスを防ぐためにロックできます。変数の操作はもちろん、処理自体を同時実行されないようにしたい場合にこちら。ブロック内はスレッドセーフになります。  
なお`synchronized`は`Kotlin Coroutines`では使えません。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val mutex = Mutex()

        lifecycleScope.launch(Dispatchers.Default) {
            var count = 0
            coroutineScope {
                repeat(10_000) { // 10_000 回ループする
                    launch {
                        mutex.withLock { // 書き換わらないようロック
                            count++ // +1 する
                        }
                    }
                }
            }
            println("結果 = $count")
        }
    }
}
```

```plaintext
結果 = 10000
```

## 以上！
（`Flow`と`Channel`以外は）一通り読み終えました。  
長かった。。。。つかれた。

# ファンディスク
ここからはドキュメントに書いてないけど、実戦投入する際によく使うやつを書いていきます。

## コールバックの関数をサスペンド関数に変換する
ちなみに、これが使えるのは一度だけ値を返す場合のみです。複数回コールバック関数が呼ばれる場合は`Flow`の勉強が必要です。。。  

コールバックの関数をサスペンド関数に変換できます。`Kotlin Coroutines`を**使ってやりたいことの1位か2位**くらいに居座っていそう、コールバックの置き換え。達成感あるんだよなこれ。  
`suspendCoroutine { }`と`suspendCancellableCoroutine { }`の2つがあります。差はキャンセル不可能か可能かです。後者のキャンセル対応版を使うのが良いです。

`suspendCoroutine { }`の場合はこんな感じです。  
`suspendCoroutine`で`Continuation`がもらえるので、コールバックの中で`resume`とかを呼び出せば良い。

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            request()
        }
    }

    private suspend fun request() {
        val response = awaitOkHttpAsyncCallback()
        println(response)
    }

    private suspend fun awaitOkHttpAsyncCallback() = suspendCoroutine { continuation ->
        val request = Request.Builder().apply {
            url("https://example.com/")
            get()
        }.build()
        OkHttpClient().newCall(request).enqueue(object : Callback { // コールバックの関数
            override fun onFailure(call: Call, e: IOException) {
                continuation.resumeWithException(e) // 失敗時
            }

            override fun onResponse(call: Call, response: Response) {
                continuation.resume(response.body!!.string()) // 成功時
            }
        })
    }
}
```

キャンセル出来ないので、キャンセルを要求したとしても、`suspendCoroutine`自身は**キャンセル例外を投げません。**  
後続でキャンセルチェックとかを入れるなどする必要があります。

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    lifecycleScope.launch {
        val job = launch { request() }
        // 500ms 後にキャンセル
        delay(500)
        job.cancel()
    }
}

private suspend fun request() = coroutineScope { // ensureActive() のため
    try {
        val response = awaitOkHttpAsyncCallback() // キャンセル不可なので、非同期処理中にキャンセルが要求されても自身は例外を投げない
        ensureActive() // キャンセルチェック。これをコメントアウトすると println() に進んでしまう...
        println(response)
    } catch (e: CancellationException) {
        println("CancellationException !!!")
        throw e
    }
}
```

`ensureActive()`がキャンセル判定をし、今回だとキャンセルしているので例外を投げます。`logcat`には`CancellationException !!!`が出ます。  
`ensureActive()`をコメントアウトすると、そのまま`println()`へ進んでしまいます。これはおそらく意図していない操作だと思います。


`suspendCancellableCoroutine`だとこんな感じです。  
**こちらはキャンセル機能を持ちます。**`Continuation`が`CancellableContinuation`に変化します。キャンセルが要求されたときに呼び出されるコールバックを提供します。  
極力こちらの`suspendCancellableCoroutine { }`でキャンセルに協力的なサスペンド関数を作っていくのがよろしいかと思います。  

使い方はキャンセルに対応したコールバックが追加されたくらいで、ほぼ同じです。

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            request()
        }
    }

    private suspend fun request() {
        val response = awaitCancellableOkHttpAsyncCallback()
        println(response)
    }

    private suspend fun awaitCancellableOkHttpAsyncCallback() = suspendCancellableCoroutine { continuation ->
        val request = Request.Builder().apply {
            url("https://example.com/")
            get()
        }.build()
        val call = OkHttpClient().newCall(request)
        call.enqueue(object : Callback { // コールバックの関数
            override fun onFailure(call: Call, e: IOException) {
                continuation.resumeWithException(e) // 失敗時
            }

            override fun onResponse(call: Call, response: Response) {
                continuation.resume(response.body!!.string()) // 成功時
            }
        })
        // コルーチンがキャンセルされたらリクエストをキャンセルさせます
        continuation.invokeOnCancellation {
            call.cancel()
        }
    }
}
```

先述の通り、キャンセルに対応しているので、キャンセル要求がされた場合は`suspendCancellableCoroutine { }`自身が例外を投げます。  
そのためキャンセルチェックは不要です。  

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    lifecycleScope.launch {
        val job = launch { request() }
        // 500ms 後にキャンセル
        delay(500)
        job.cancel()
    }
}

private suspend fun request() {
    try {
        val response = awaitCancellableOkHttpAsyncCallback() // キャンセル対応なので、キャンセルが要求されたら自身が例外を投げる
        println(response)
    } catch (e: CancellationException) {
        println("CancellationException !!!")
        throw e
    }
}
```

ちゃんと`logcat`には`ensureActive()`無しで`CancellationException !!!`が出ています。

## 並列と並行（パラレルとコンカレント）
https://stackoverflow.com/questions/1050222/

同時に処理を実行する際に出てくるキーワードに、 **並列（parallel / パラレル）** と **並行（concurrent / コンカレント）** という単語が出てきます。  
機械翻訳にぶち込むと同じ単語が出てきて困惑するのですが、 **少なくとも** `Kotlin Coroutines`では別に扱ってそうです。

### 平行（コンカレント）
これは同時に起動は出来るというだけ。同時に処理はできていない。  
`CPU`が`1コア`しかなければ1つのことしか出来ない。。。。ですが、実は`コンテキストスイッチ`と呼ばれるものがあって、  
同時に起動している処理を細かく区切って、それぞれ均等に`CPU`に与えて処理させているので、同時に処理が出来ているように見えている。

`1コア`しか無いので、同じ時間には1つしか処理できないことになります。  

*ワンオペで店を回しているようなものでしょうか。*

### 並列（パラレル）
これは同時に処理が出来ます。`マルチコア CPU`とか`Intel のハイパースレッディング`のそれを使うやつです。  
同時、同じ時間に複数の処理が出来る違いがあります。もちろんコア数を超えるスレッドがあれば同じくコンテキストスイッチが頑張ります。

*複数人雇っていることになりますね。これなら同じ時間に違う仕事をさせることが出来ます。*

### だから何？
並列の実行数を制限したいときに、どっちを制限したいのかによって使い分ける必要があります。

|          | 平行（同時に起動する） | 並列（同時に処理する。使うスレッド数を制限する） |
|----------|------------------------|--------------------------------------------------|
| 1つだけ  | Mutex()                | limitedParallelism(1)                            |
| 上限付き | Semaphore(上限の数)    | limitedParallelism(上限の数)                     |

### Mutex
例えば以下の関数は`withLock { }`の中からのみ呼び出されているため、`successTask()`を3つ並列にしても、1つずつ処理されることになります。  
なので、同時に`Hello world`が出力されることはありません。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val mutex = Mutex()
        lifecycleScope.launch {
            mutex.withLock { successTask() }
        }
        lifecycleScope.launch {
            mutex.withLock { successTask() }
        }
        lifecycleScope.launch {
            mutex.withLock { successTask() }
        }
    }

    private suspend fun successTask() {
        delay(3_000)
        println("Hello world")
    }
}
```

`logcat`

```plaintext
03:53:59.277 10572-10572 System.out              io....an23.kotlincoroutienspractice  I  Hello world
03:54:02.280 10572-10572 System.out              io....an23.kotlincoroutienspractice  I  Hello world
03:54:05.281 10572-10572 System.out              io....an23.kotlincoroutienspractice  I  Hello world
```

### Semaphore
`Mutex()`は1つずつですが、2個までは許容して3個目以降は待ち状態にしたい場合があると思います。  
例えば`Minecraft`のマインカートは一人乗りなので`Mutex()`で事足りますが、ボートは二人まで乗れますので`Mutex()`は使えないですね。  

それが`Semaphore()`です。見ていきましょう。  
引数に同時に利用できる上限数を入れます。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val semaphore = Semaphore(2)
        lifecycleScope.launch {
            semaphore.withPermit { successTask() }
        }
        lifecycleScope.launch {
            semaphore.withPermit { successTask() }
        }
        lifecycleScope.launch {
            semaphore.withPermit { successTask() }
        }
        lifecycleScope.launch {
            semaphore.withPermit { successTask() }
        }
    }

    private suspend fun successTask() {
        delay(3_000)
        println("Hello world")
    }
}
```

実行結果ですが、2つずつ処理されるので、`logcat`の出力も2個ずつ出てくるんじゃないかなと思います。  

```plaintext
04:02:47.409 12167-12167 System.out              io....an23.kotlincoroutienspractice  I  Hello world
04:02:47.411 12167-12167 System.out              io....an23.kotlincoroutienspractice  I  Hello world
04:02:50.412 12167-12167 System.out              io....an23.kotlincoroutienspractice  I  Hello world
04:02:50.413 12167-12167 System.out              io....an23.kotlincoroutienspractice  I  Hello world
04:02:53.416 12167-12167 System.out              io....an23.kotlincoroutienspractice  I  Hello world
04:02:53.417 12167-12167 System.out              io....an23.kotlincoroutienspractice  I  Hello world
04:02:56.421 12167-12167 System.out              io....an23.kotlincoroutienspractice  I  Hello world
04:02:56.422 12167-12167 System.out              io....an23.kotlincoroutienspractice  I  Hello world
04:02:59.425 12167-12167 System.out              io....an23.kotlincoroutienspractice  I  Hello world
04:02:59.426 12167-12167 System.out              io....an23.kotlincoroutienspractice  I  Hello world
```

### limitedParallelism
これは同時に利用するスレッド数を制限するものです。  
`Dispatchers.IO`や`Dispatchers.Default`は複数のスレッドを持っている（雇っている）ので、それらの制限をするのに使うそう。  

ややこしいのが、これはスレッド数を制限するものであって、`launch { }`や`async { }`の同時起動数を制限するものではないということです。  
`Kotlin Coroutines`はスレッドを有効活用するため、`delay()`等の待ち時間が出れば他のコルーチンの処理に当てるのでコルーチンの起動数制限には使えません。  
もし`launch { }`や`async { }`の同時起動数を制限したい場合はさっきの`Semaphore()`が解決策です。

例えば`limitedParallelism(1)`にした場合はスレッドが1つだけになるので、このようにループでインクリメントさせても正しい値になります。  
ちなみにシングルスレッドが約束されるだけであって同じスレッドが使われるとは言っていません。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val singleDefault = Dispatchers.Default.limitedParallelism(1)
        var count = 0
        lifecycleScope.launch {
            withContext(singleDefault){
                repeat(10_000){
                    launch {
                        count++
                    }
                }
            }
            println("シングルスレッドなので $count")
        }
    }
}
```

うーん、どこで使うのかな。多分賢い使い方があるんだと思うんだけど。

## forEach / map でサスペンド関数呼べます
`JavaScript`から来た方向け。`Kotlin`の`forEach`や`map`等でサスペンド関数を呼び出せるよという話です。`JavaScript`では`forEach`内で`await`出来ないのは有名な話ですが、`Kotlin`では出来るよという話、それだけです。  

`Kotlin`にはインライン関数と呼ばれる、関数呼び出しではなく、関数の中身のコードを呼び出し元に展開する機能があります。（他の言語にあるマクロみたいなやつ）  
`forEach`や`map`はインライン関数なので、これらは純粋な繰り返し文に置き換わります。なのでサスペンド関数を呼び出すことが出来る感じです。

例えば以下の`Kotlin`コードは  

```kotlin
val list = listOf("Pixel 9", "Pixel 9 Pro", "Pixel 9 Pro XL", "Pixel 9 Pro Fold")
list.forEach { text ->
    println(text)
}
```

`Java`ではこのようになるそうです。  
ちゃんと純粋なループに置き換わっていますね。  

```java
String[] var3 = new String[]{"Pixel 9", "Pixel 9 Pro", "Pixel 9 Pro XL", "Pixel 9 Pro Fold"};
List list = CollectionsKt.listOf(var3);
Iterable $this$forEach$iv = (Iterable)list;
int $i$f$forEach = false;
Iterator var5 = $this$forEach$iv.iterator();

while(var5.hasNext()) {
    Object element$iv = var5.next();
    String text = (String)element$iv;
    int var8 = false;
    System.out.println(text);
}
```

# おわりに
いやーーーーーー`Kotlin Coroutines`、頭が良い！よく考えられてるなと思いました。