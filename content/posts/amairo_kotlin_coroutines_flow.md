---
title: あまいろ Kotlin Coroutines Flow 編
created_at: 2024-09-26
tags:
- Android
- Kotlin
- KotlinCoroutines
- KotlinCoroutines解説
---

どうもこんばんわ。  
あまいろショコラータ2 攻略しました。かぐやちゃんがかわいくてよかった。（振り返り程度の説明だけなので）前作もやろう！！！。  
![Imgur](https://i.imgur.com/NfA9Mki.png)

ここのシナリオよすぎる  
![Imgur](https://i.imgur.com/1q99rr3.png)

![Imgur](https://i.imgur.com/InmiDNs.png)

ここすき。  
![Imgur](https://i.imgur.com/Q8RfhIM.png)

みつきさんには辛辣なかぐやちゃん！！！！？！？！？  
![Imgur](https://i.imgur.com/PiD7nya.png)

ななちゃん性格のわりに制服かわいいのいい  
![Imgur](https://i.imgur.com/btQjfCO.png)

![Imgur](https://i.imgur.com/jyFZfwv.png)

いちかちゃんルートは必見です！！。ぜひ買って見てみてね  
![Imgur](https://i.imgur.com/9JDi6oI.png)

![Imgur](https://i.imgur.com/cUyeNve.png)

前作ヒロインがいい味出しててほんといい  

![Imgur](https://i.imgur.com/WOESDV7.png)

![Imgur](https://i.imgur.com/3Qx06Z3.png)  
心の中にちえりちゃんほしい

よかった。おすすすすすめです

# 本題
今年の夏、体温超えが連発してたけどようやく涼しくなってきたか？久しぶりにエアコン消した。  

前回は Kotlin Coroutines のサスペンド関数に関してドキュメントを読んでいきました。  
https://takusan.negitoro.dev/posts/amairo_kotlin_coroutines_suspend/

サスペンド関数の知識が必要なので、先に前回の記事を読んでおくことをおすすめします。

今回は`Flow`編です。  
ちなみに`Channel`はほとんど使ったこと無いのでほとんど触れません。。。。ごめんね

# 環境
今回も今回とてサンプルコードは`Android`で書きます。  
が、特別なことがなければ`Android`じゃない`Kotlin/JVM`に転用できるはず。

# 複数回値を返せる Flow
https://kotlinlang.org/docs/flow.html

前回の記事のサスペンド関数では、一回しか値を返すことが出来ませんでした。  
複数の値を一回だけ返す分には`Pair`や`Triple`、それ以上ならデータクラスを作り返せばいいのですが、**複数回**値を返したい場合はどうでしょう？

`Kotlin Coroutines`の`Flow`はそれを叶えます！

例えば、センサーの値を返すとか。センサーなら加速度でも気圧でも明るさでも何でもいいんですが、連続して値が来るため、複数回返せる`Flow`の出番ですね。  
それから`WebSocket`でなにかメッセージを受け取るとか。これも複数回にわたってデータを受信するため、これも`Flow`の出番です。

![Imgur](https://i.imgur.com/F89Ao7j.png)

## Android と Flow
`Android`でもよく既に使われていて、例えば`Room`でリアルタイムに値を取得する方法に`Flow`が使えます。  
`LiveData`でも出来ますが。。。  

また、`DataStore`も`Flow`ベースで作られてますね。`Key-Value`で変更があったらその都度`Flow`を使って最新の状態にしてくれます。  

`xml`の頃ならコールバックで実装されていたであろう箇所も、`Jetpack Compose`では`Flow`で作られていたり。  
多分探せばもっとある。

`Android`開発的には`LiveData`とやりたいことは大体同じって伝えれば伝わるかな。  
他の言語だとなんだろ、それこそ`Rxなんとか`とか`signal`とか？。（どっちも使ったこと無く正直わからない）  
`JavaScript`だと`非同期イテレータ`なのかな。不定期に複数回にわたって値を送信したいという願いは叶ってそう。

# 最初の Flow
https://kotlinlang.org/docs/flow.html#flows

兎にも角にもなにか`Flow`を作ってみましょう。もちろんコールバックから`Flow`への変換も出来るのですが、ややこしくなりそうで。  
10 回数字を出力する`Flow`を作りました。

```kotlin
class MainActivity : ComponentActivity() {

    /** 1 から 10 まで 1 秒ごとに出力する Flow */
    private val numberFlow = flow {
        (1..10).forEach { num ->
            delay(1_000)
            emit(num)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            numberFlow.collect {
                println(it)
            }
            println("END")
        }
    }
}
```

面白くはないんですが。  
`logcat`はこんな感じになるはず。

```plaintext
1
2
3
4
5
6
7
8
9
10
END
```

`collect { }`はサスペンド関数になっていて、`Flow`が終わるまでは**一時停止し続けます**。`collect { }`を複数回使いたい場合は`launch { }`でその都度囲って上げる必要があります。  
いつ終わるのかと言うと、`flow { }`の引数、ブロック内（関数の中）で最後まで進むと`Flow`が終わります。  

`emit()`で値を発行出来て、これもサスペンド関数になっています。というか`flow { }`の中はサスペンド関数が使えるようになっています。  
なので`delay()`等も呼び出すことが出来ます。ブロック内はサスペンド関数ですが、`Flow`**自体はサスペンド関数になりません**。`Flow`を返すだけです。

上記のコードを2つに分けるとしたら、こうなると思います。**値を送る側と、値を受信する側。**  
**Kotlinのドキュメント**では、送信側を **エミッター（emitter）**、受信側を **コレクター（collector）** と呼んでいるので、今回はこちらに合わせようと思います。

```kotlin
// エミッター
/** 1 から 10 まで 1 秒ごとに出力する Flow */
private val numberFlow = flow {
    (1..10).forEach { num ->
        delay(1_000)
        emit(num)
    }
}
```

```kotlin
// コレクター
lifecycleScope.launch {
    numberFlow.collect {
        println(it)
    }
    println("END")
}
```

## 付録 他の言い方
`Android`ドキュメントでは`emitter`を`producer（プロデューサー）`、`collector`を`consumer（コンシューマー）`って呼んでてちょっとややこしい。  
https://developer.android.com/kotlin/flow

# ColdFlow
https://kotlinlang.org/docs/flow.html#flows-are-cold

さて、`Flow`を学習するとまずでてくるのが、**コールドフロー**と**ホットフロー**の2つ。何も考えずに機械翻訳に投げると*流れは冷たい*（追真）になって面白い。  

コールドフローは、実際に受信が開始されるまで送信側のコードが動かないという特徴があります。  
次のコードを試してみましょう。

```kotlin
class MainActivity : ComponentActivity() {

    /** 1 から 10 まで 1 秒ごとに出力する Flow */
    private val numberFlow = flow {
        println("Flow エミッター 起動")
        (1..10).forEach { num ->
            delay(1_000)
            emit(num)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {

            launch {
                println("[コンシューマー1] 起動")
                numberFlow.collect {
                    println("[コンシューマー1] $it")
                }
                println("[コンシューマー1] 終了")
            }

            launch {
                println("[コンシューマー2] 起動")
                numberFlow.collect {
                    println("[コンシューマー2] $it")
                }
                println("[コンシューマー2] 終了")
            }
        }
    }
}
```

`logcat`はこうなります。  
コレクターを**呼び出すたび**にエミッター側が呼び出されていることが分かります。値はそれぞれ発行されていますね。

```plaintext
[コンシューマー1] 起動
Flow エミッター 起動
[コンシューマー2] 起動
Flow エミッター 起動
[コンシューマー1] 1
[コンシューマー2] 1
[コンシューマー1] 2
[コンシューマー2] 2
[コンシューマー1] 3
[コンシューマー2] 3
[コンシューマー1] 4
[コンシューマー2] 4
[コンシューマー1] 5
[コンシューマー2] 5
[コンシューマー1] 6
[コンシューマー2] 6
[コンシューマー1] 7
[コンシューマー2] 7
[コンシューマー1] 8
[コンシューマー2] 8
[コンシューマー1] 9
[コンシューマー2] 9
[コンシューマー1] 10
[コンシューマー1] 終了
[コンシューマー2] 10
[コンシューマー2] 終了
```

`コールドフロー`の対になる`ホットフロー`は、逆にコレクターの存在にかかわらず起動している`Flow`になります。  
**が、ドキュメントではしばらくコールドフローの話が続くので**、ホットフローの話は最後の方に回します。

## 付録 陥りやすいミス
`collect { }`は収集が終わるまで一時停止し続けるため、`collect { }`の下に書いたコードは収集が終わるまで呼び出されません。（小泉構文並感）  
複数`collect { }`したい場合は`collect { }`するたびに`launch { }`で囲うか（上記のように）、`launchIn()`する必要があるのですが、それも後述します。  
とりあえずはそれぞれ`launch { }`していきます。

## launch がないよ！
前回の記事で`launch { }`が使えるところ、使えないところ、その理由を話しているのでどうぞ！  

https://takusan.negitoro.dev/posts/amairo_kotlin_coroutines_suspend/#構造化された並行性

# キャンセル
https://kotlinlang.org/docs/flow.html#flow-cancellation-basics

詳しくは後述するのですが、サスペンド関数のキャンセルと同じ感じで`Flow`をキャンセルすることが出来ます。  

```kotlin
class MainActivity : ComponentActivity() {

    /** 1 から 10 まで 1 秒ごとに出力する Flow */
    private val numberFlow = flow {
        println("Flow エミッター 起動")
        (1..10).forEach { num ->
            delay(1_000)
            emit(num)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {

            val collectJob = launch {
                // キャンセル or 成功 にかかわらず finally が動く
                try {
                    numberFlow.collect {
                        println(it)
                    }
                } finally {
                    println("終了")
                }
            }

            // 5 秒後に終了
            delay(5_000)
            collectJob.cancelAndJoin()
        }
    }
}
```

# Flow を作る方法
https://kotlinlang.org/docs/flow.html#flow-builders

正しくは`ColdFlow`ですね。`HotFlow`を作る方法はまた別にあります。  
エミッター側を作る方法は、`flow { }`以外にもあります。

例えば`listOf()`のように`flowOf()`があります。  
配列と変わらないと思うじゃん？後述しますが変換用の演算子（`map { }`とか）がサスペンド関数対応なんですよ、、、  

![Imgur](https://i.imgur.com/T6449dF.png)

あとは`asFlow()`で配列等から`Flow`に出来ます。

```kotlin
(0 until 10).asFlow()
```

それから、よく使うであろう`callbackFlow { }`。これはコールバックで記述された関数を`Flow`に変換する関数です。  
例えば以下のコードは明るさセンサーの値を`Flow`に変換したものになります。

```kotlin
class MainActivity : ComponentActivity() {

    /** 明るさセンサーの値を Flow で送信する */
    private val lightSensorFlow = callbackFlow {
        val sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val barometerSensor = sensorManager.getSensorList(Sensor.TYPE_LIGHT)
        // コールバック
        val listener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent?) {
                // Flow で通知する
                trySend(event?.values?.first())
            }

            override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
                // do nothing
            }
        }
        // コールバック登録と、Flow キャンセル時にコールバック解除
        sensorManager.registerListener(listener, barometerSensor.first(), SensorManager.SENSOR_DELAY_NORMAL)
        awaitClose { sensorManager.unregisterListener(listener) }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            lightSensorFlow.collect {
                println(it)
            }
        }
    }
}
```

`logcat`はこんな感じになるはず。  
最近のスマホ、ベゼルが細いからどこにセンサーがあるのかよく分からん。多分自撮りカメラの部分を手で覆ったりすれば小さい値になると思う。  
逆に懐中電灯を向けると大きな値が出てくるはず。

```plaintext
57.995
8.8425
14.599999
8.5175
12.903749
10.1475
16.225
79.572495
183.56375
```

これを書き換えて、例えば頭痛持ちなら気圧センサーの値を`Flow`で受け取れるようにしてみるとどうでしょう？  
ただ、気圧センサーは**フラグシップモデル**のスマホにしか搭載されない傾向があるので、（値段重視の）ミドルレンジとかのスマホだと試せないかもしれません。  


あとは`Jetpack Compose`を使ってるなら`snapshotFlow { }`でしょうか。  

```kotlin
@Composable
private fun MainScreen() {

    var count by remember { mutableIntStateOf(0) }

    LaunchedEffect(key1 = Unit) {
        snapshotFlow { count }.collect {
            println("update $it")
        }
    }

    KotlinCoroutinesFlowPracticeTheme {
        Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
            Box(modifier = Modifier.padding(innerPadding)) {
                Button(onClick = { count++ }) {
                    Text(text = "Count++")
                }
            }
        }
    }
}
```

あとはサスペンド関数を一回の値を返す`Flow`にすることも出来ます。どこで使うのかは、、、  
`::`を使うことで、関数型の参照を取得することが出来ます。https://kotlinlang.org/docs/lambdas.html#instantiating-a-function-type

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // サスペンド関数を Flow に変換
        val taskFlow = ::exampleSuspendFun.asFlow()

        lifecycleScope.launch {
            taskFlow.collect {
                println(it)
            }
        }
    }

    private suspend fun exampleSuspendFun(): String {
        delay(500)
        return "Hello World"
    }
}
```

これ以外にも、冒頭で話した通り`Room`の`DAO`の返り値に`Flow`を採用するとかで作ることが出来ます。

# 中間演算子で変換する
https://kotlinlang.org/docs/flow.html#intermediate-flow-operators

配列の操作用関数には`filter { }`や`map { }`、`distinctUntilChanged()`なんかがありますが、`Kotlin Coroutines Flow`にもあります！  
この辺から`LiveData`を超え始めます。  

これらをなんとなく分かれば、ありとあらゆるものを`Flow`基準で考えたくなってくるはず！

`filter { }`や`map { }`等は引数の関数がサスペンド関数になっているため、関数内でサスペンド関数を呼び出すことが出来ます！  
面白い例が思いつかず申し訳ないのですが、こんな感じにサスペンド関数を呼び出すことが出来ます。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            numberFlow
                .filter { it % 2 == 0 } // 2 で割れる数
                .map { delayTask(it) } // なにか変換をする
                .collect { println(it) } // 出力
        }
    }

    /** 500ms 遅くする関数 */
    private suspend fun delayTask(number: Int): Int {
        delay(500) // 500ms 仕事をする。好きなサスペンド関数を呼び出すことが出来ます。API を叩くサスペンド関数とか
        return number
    }
}
```

出力はこうです。2 で割れる数が`500`ミリ秒ごとに出てくるはず。  

```kotlin
2
4
6
8
10
```

# 複雑な変換をする
https://kotlinlang.org/docs/flow.html#transform-operator

`map { }`じゃ足りないですか？`transform { }`を使うことで、`Flow`から来た値を増やして送信したり、逆に減らして送らないようにすることが出来ます。  
例えば無駄ではありますが、受け取った数字の数だけ繰り返し同じ数字を送出するようなコードを。もちろんサスペンド関数なのでもっと面白いことができればよかったのですが。。。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (0..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            numberFlow.transform { receive ->
                // 受け取った数字の数だけ繰り返し同じ数字を送出する
                repeat(receive) {
                    emit(receive)
                }
            }.collect {
                println(it)
            }
        }
    }
}
```

長くなるので出力は途中までしか貼りませんが、出てきた数字の分だけ同じ回数出力されているはずです。

```plaintext
1
2
2
3
3
3
4
4
4
4
5
5
5
5
5
以下省略
```

# サイズ指定の収集
https://kotlinlang.org/docs/flow.html#size-limiting-operators

配列のそれと同じように、受信する数を決めることが出来ます。  
これだけだとあんまり旨味がないかもしれませんが、後述する`toList()`とかで使えるかも！

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        try {
            (1..10).forEach {
                delay(1_000)
                emit(it)
            }
        } finally {
            println("おわり")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            numberFlow
                .take(3) // 3 個まで
                .collect { println(it) } // 出力
        }
    }
}
```

`take()`で上限に達すると、エミッター側である`flow { }`へキャンセルが伝達されます。`finally { }`が呼ばれてますね。

```plaintext
1
2
3
おわり
```

## 付録 捨てる
`drop()`で逆に捨てることが出来ます。  
例えば、最初の値を捨てたい場合、`Jetpack Compose`だと`snapshotFlow { }`を使うと、初期値も`Flow`で送りますが、実際に値が変化してから`Flow`で受信したい場合があると思います。  
そこで、`drop(1)`を使うことで`mutableIntStateOf()`の初期値は受け取ること無く、その次の値が`Flow`から送られてきた場合に収集することが出来るようになります。

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

    var count by remember { mutableIntStateOf(0) }

    LaunchedEffect(key1 = Unit) {
        snapshotFlow { count }
            .drop(1) // ボタンが押される前の、最初の値は収集したくないため drop
            .collect { println("count = $count") }
    }

    KotlinCoroutinesFlowPracticeTheme {
        Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
            Column(modifier = Modifier.padding(innerPadding)) {

                Text(text = count.toString())

                Button(onClick = { count++ }) {
                    Text(text = "count++")
                }
            }
        }
    }
}
```

# 末端演算子
https://kotlinlang.org/docs/flow.html#terminal-flow-operators

`Flow`から値を受け取るための演算子を末端演算子とか呼んでいるそうです。コンシューマーのことですね。  

まずは`collect { }`。これは`Flow`から値を受け取り、終わるまで一時停止してくれるやつです。  
書き方も2種類くらいあって、まずは`collect { }`ですね、引数の関数で受け取ることが出来ます。  

もう一つ、`collect()`と`onEach { }`を使うパターン。配列操作の`onEach { }`のそれと同じですが、`onEach { }`には収集を開始する機能が無いため、`collect()`で収集を開始するようにします。  
どっちも同じ仕事をします。

```kotlin
lifecycleScope.launch {

    // collect { }
    launch {
        numberFlow.collect { println(it) } // 出力
    }

    // collect() + onEach { }
    launch {
        numberFlow
            .onEach { println(it) } // 出力
            .collect()
    }
}
```

また、`Flow`から1つの値を取り出すための演算子もあります。  
`first() / first { }`と`single()`です。また、彼らには`OrNull()`版があります。

`first()`は最初の値が来るまで一時停止し、`first { }`は引数の関数で`true`を返すまで一時停止します。`true`を返した時点の値を返してくれます。  
`Flow`でよく使うこれ。これすき。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {

            // 最初の値が来るまで待つ
            val firstValue = numberFlow.first()
            println("firstValue = $firstValue")

            // 2 で割れる最初の値が来るまで待つ
            val divisionValue = numberFlow.first { it % 2 == 0 }
            println("divisionValue = $divisionValue")

            // もちろん演算子を挟むことも出来ます
            val firstNotNullValue = numberFlow
                .map { if (it % 2 == 0) it else null } // 2 で割れないなら null
                .filterNotNull() // null を弾く
                .first() // 最初の値
            println("firstNotNullValue = $firstNotNullValue")
        }
    }
}
```

`logcat`はこんな感じになります。`first { }`

```kotlin
firstValue = 1
divisionValue = 2
firstNotNullValue = 2
```

`OrNull()`の方を使うと、`Flow`で何も値が来ない場合に、例外ではなく変わりに`null`を返してくれるやつです。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            // もし Flow から何も値が来ない場合は first() だと例外になります
            // null が必要な場合は firstOrNull() を
            val firstOrNullValue = numberFlow
                .filter { 11 <= it } // 11 以上
                .firstOrNull() // 10 までしかエミッター側から来ないので、null になります
            println("firstOrNullValue = $firstOrNullValue")
        }
    }
}
```

こんな感じに、値が来なかった場合は`null`が帰ってきます。

```kotlin
firstOrNullValue = null
```

`single()`は、値が一回だけ送られてくる`Flow`の場合に利用できます。値が来ないで終わった場合と値が複数回流れてきた場合は例外を投げます。  
`first()`と違って複数回流れて来る場合に使えません。`singleOrNull()`で例外の代わりに`null`を返してくれます。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // サスペンド関数を一回だけ値を送出する Flow にする
        val singleEmitFlow = ::exampleSuspendFun.asFlow()

        lifecycleScope.launch {
            val singleValue = singleEmitFlow.single()
            println("singleValue = $singleValue")
        }
    }

    private suspend fun exampleSuspendFun(): String {
        delay(1_000)
        return "Hello World"
    }
}
```

`logcat`はこんな感じ。

```plaintext
singleValue = Hello World
```

あとは、`toList()`でしょうか。`Flow`から受信した値を配列にしてくれます。  
`take()`なんかで上限を決めることも出来ます。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            // 受け取った値をリストに詰めて返してもらう
            val receiveList = numberFlow.take(3).toList()
            println(receiveList)
        }
    }
}
```

`logcat`はこう

```plaintext
[1, 2, 3]
```

## 付録 そのほかの演算子
直接`Flow`の値には触らない、開始時に呼ばれる`onStart { }`や終了時に呼ばれる`onCompletion { }`等もあります。また`emit()`で値を送信することができるため、  
例えば、エミッター側が最初の値を送信するまで時間がかかる場合に、`onStart { emit() }`で初期値を即時送信する。なんて事ができます。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            numberFlow
                .map { it.toString() } // Int を String に
                .onStart { emit("START !!!") } // 開始時に
                .onCompletion { emit("END !!!") } // 終わった時に
                .collect { println(it) }
        }
    }
}
```

```plaintext
START !!!
1
2
3
4
5
6
7
8
9
10
END !!!
```

あとよく使うのは`onEach { }`かな、  
値を消費もせず変換もせず、ただ値を傍聴するだけですが、サスペンド関数を呼び出せるので遅くしたり、`Flow`の値を確認したいときとかに使えます。

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    lifecycleScope.launch {
        (1..5)
            .asFlow() // Range を Flow に
            .onEach { delay(1_000) } // 1 秒間隔
            .collect {
                println(it)
            }
    }
}
```

# フローは連続的
https://kotlinlang.org/docs/flow.html#flows-are-sequential

今更だとは思いますが、末端演算子は上から順番に適用されますよって話。宣言的でいいですよね。  

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            numberFlow
                .filter {
                    println("filter { } $it")
                    it % 2 == 0
                }
                .map {
                    println("toString() $it")
                    it.toString()
                }
                .collect { println(it) }
        }
    }
}
```

`logcat`を見ると、2 で割り切れない場合は`map { }`に進んでないことが分かりますね。

```plaintext
filter { } 1
filter { } 2
toString() 2
2
filter { } 3
filter { } 4
toString() 4
4
filter { } 5
filter { } 6
toString() 6
6
filter { } 7
filter { } 8
toString() 8
8
filter { } 9
filter { } 10
toString() 10
10
```

# Flow とコルーチンコンテキスト
https://kotlinlang.org/docs/flow.html#flow-context

`collect()`や`first()`等を呼び出したコルーチンのコルーチンコンテキストで、エミッターから中間演算子の処理がされるという話。  
今のスレッド名をログを出してみましょう。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            println("[${Thread.currentThread().name}] emitter")
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            withContext(Dispatchers.Main){
                numberFlow
                    .filter {
                        println("[${Thread.currentThread().name}] filter")
                        it % 2 == 0
                    }
                    .map {
                        println("[${Thread.currentThread().name}] map")
                        it.toString()
                    }
                    .collect {
                        println("[${Thread.currentThread().name}] collect")
                        println(it)
                    }
            }
        }
    }
}
```

`logcat`が長くなってしまったので途中までですが、`collect()`を`Dispatchers.Main`で呼び出したため、`main`と表示されます。

```plaintext
[main] emitter
[main] filter
[main] emitter
[main] filter
[main] map
[main] collect
2
[main] emitter
[main] filter
[main] emitter
[main] filter
[main] map
[main] collect
4
```

`Dispatchers.Main`の部分を`Dispatchers.Default`にすれば別スレッドで`Flow`を動かすことが出来ます。  
これなら`map { }`でインターネット通信を伴う場合も落ちなくなりますね！

```plaintext
[DefaultDispatcher-worker-2] emitter
[DefaultDispatcher-worker-2] filter
[DefaultDispatcher-worker-2] emitter
[DefaultDispatcher-worker-2] filter
[DefaultDispatcher-worker-2] map
[DefaultDispatcher-worker-2] collect
2
[DefaultDispatcher-worker-2] emitter
[DefaultDispatcher-worker-2] filter
[DefaultDispatcher-worker-2] emitter
[DefaultDispatcher-worker-2] filter
[DefaultDispatcher-worker-2] map
[DefaultDispatcher-worker-2] collect
4
```

# withContext が使えない場所
https://kotlinlang.org/docs/flow.html#a-common-pitfall-when-using-withcontext

エミッター側`flow { }`の`emit()`は、呼び出しスレッドを変更してはいけないルールがあります。（というかコルーチンコンテキストが違ってもダメ？）  
`emit()`を`withContext`で囲うと怒られてしまいます。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            // withContext でコンテキスト変更後に emit() を呼び出してはいけない
            // 一見間違いがないように見えるのだが...
            withContext(Dispatchers.IO) {
                delay(1_000)
                emit(it)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            numberFlow.collect { println(it) }
        }
    }
}
```

```plaintext
FATAL EXCEPTION: main
Process: io.github.takusan23.kotlincoroutinesflowpractice, PID: 19225
java.lang.IllegalStateException: Flow invariant is violated:
		Flow was collected in [StandaloneCoroutine{Active}@7ba43ca, Dispatchers.Main.immediate],
		but emission happened in [DispatchedCoroutine{Active}@332993b, Dispatchers.IO].
		Please refer to 'flow' documentation or use 'flowOn' instead
	at kotlinx.coroutines.flow.internal.SafeCollector_commonKt.checkContext(SafeCollector.common.kt:86)
	at kotlinx.coroutines.flow.internal.SafeCollector.checkContext(SafeCollector.kt:106)
```

`emit()`は元のコルーチンコンテキストから呼び出すか、`flowOn()`演算子を使うかのどちらかをする必要があります。

# flowOn
https://kotlinlang.org/docs/flow.html#flowon-operator

`Flow`を実行するスレッド、もといコルーチンコンテキストを変更するための方法です。  
`collect()`等のエミッター側を`withContext`で切り替えた中で呼び出す方法もありますが、`flowOn()`でも出来ます。

これは巻き上げになります。`flowOn()`よりも上のエミッター側と中間演算子が引数の`コルーチンコンテキスト`、もといスレッドで呼び出されます。  
逆に`flowOn()`より下側のコレクター側と中間演算子は、コレクターを呼び出したコルーチンコンテキストで実行されます。

ログを出すようにして、どのスレッドで処理されているかを確認できるようにしてみましょう。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            println("[${Thread.currentThread().name}] emitter")
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            numberFlow
                .onEach { println("[${Thread.currentThread().name}] onEach1 $it") } // ただ値を傍聴するだけ
                .flowOn(Dispatchers.IO) // これより上のエミッターと中間演算子、Dispatchers.IO で動く
                .onEach { println("[${Thread.currentThread().name}] onEach2 $it") } // flowOn() より下の中間演算子やコレクターは、コレクターを呼び出したコルーチンコンテキストが使われる
                .collect { println("[${Thread.currentThread().name}] collect $it") }
        }
    }
}
```

`logcat`はこうです。  
ちゃんと`flowOn`より上は、指定したコルーチンコンテキスト（スレッド）が、それより下は`collect()`を呼び出したコルーチンコンテキスト（スレッド）で処理されている事がわかりますね。

```plaintext
[DefaultDispatcher-worker-1] emitter
[DefaultDispatcher-worker-1] onEach1 1
[DefaultDispatcher-worker-1] emitter
[main] onEach2 1
[main] collect 1
[DefaultDispatcher-worker-1] onEach1 2
[DefaultDispatcher-worker-1] emitter
[main] onEach2 2
[main] collect 2
[DefaultDispatcher-worker-1] onEach1 3
[DefaultDispatcher-worker-1] emitter
[main] onEach2 3
[main] collect 3
[DefaultDispatcher-worker-1] onEach1 4
[DefaultDispatcher-worker-1] emitter
[main] onEach2 4
[main] collect 4
[DefaultDispatcher-worker-1] onEach1 5
[DefaultDispatcher-worker-1] emitter
[main] onEach2 5
[main] collect 5
[DefaultDispatcher-worker-1] onEach1 6
[DefaultDispatcher-worker-1] emitter
[main] onEach2 6
[main] collect 6
[DefaultDispatcher-worker-1] onEach1 7
[DefaultDispatcher-worker-1] emitter
[main] onEach2 7
[main] collect 7
[DefaultDispatcher-worker-1] onEach1 8
[main] onEach2 8
[main] collect 8
[DefaultDispatcher-worker-1] emitter
[DefaultDispatcher-worker-1] onEach1 9
[main] onEach2 9
[main] collect 9
[DefaultDispatcher-worker-1] emitter
[DefaultDispatcher-worker-1] onEach1 10
[main] onEach2 10
[main] collect 10
```

# バッファリング
https://kotlinlang.org/docs/flow.html#buffering

`Flow`はサスペンド関数を多用するため、しばし時間がかかるサスペンド関数を呼び出してしまう場合があると思います。  
助けになるかもしれない`buffer()`

例えば以下のコード、エミッター側は値を送信するのに`1秒`かかります。また、コレクター側も`1秒`かかるとします。  
これだと`println()`まで`2秒`かかることが分かりますね。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            // かかった時間を出力
            val totalTime = measureTimeMillis {
                numberFlow.collect {
                    delay(1_000)
                    println(it)
                }
            }
            println("totalTime = $totalTime ms")
        }
    }
}
```

確かに`logcat`を見ると20秒（20_000 ミリ秒）かかっていることが分かります。

```plaintext
// 以下省略
7
8
9
10
totalTime = 20062 ms
```

しかし、`collect { }`で時間を待っている間に次の値を受信しておく事もできるとは思いませんか？  
`buffer()`はそれを叶えます。実際に動かさないとわからないと思うのですが、  

- 最初の値はもちろん、エミッター側`1秒` + コレクター側`1秒`かかります
- 2つ目以降は、最初のコレクター側`1秒`を待っているの間に、エミッター側`1秒`を消費したため、コレクター側`1秒`待つだけで出力されるようになります。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            // かかった時間を出力
            val totalTime = measureTimeMillis {
                numberFlow
                    .buffer()
                    .collect {
                        delay(1_000)
                        println(it)
                    }
            }
            println("totalTime = $totalTime ms")
        }
    }
}
```

`logcat`はこうで、最初の値だけ`2秒`かかっているので、かかった時間はコレクター側`10秒`+エミッター側`1秒`になります。

```plaintext
// 以下省略
7
8
9
10
totalTime = 11091 ms
```

クソ雑な絵です。`buffer()`でコレクター側とエミッター側が同時に動くよってことが分かれば。  

![Imgur](https://i.imgur.com/JCE8L9s.png)

# 途中の値は消す
https://kotlinlang.org/docs/flow.html#conflation

コレクター側が時間かかる場合で、かつ毎回処理する必要がない場合に使えます。コレクター側が間に合う分だけ処理すればいいみたいな。  
たとえば以下のような、エミッター側は1秒間隔で値を送信し、エミッター側では3秒かかる場合、エミッター側で処理中の値は捨てられることになります。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            numberFlow
                .conflate() // コレクター側が処理中に来た値は捨てる
                .collect {
                    delay(3_000) // 3秒かかる
                    println(it)
                }
        }
    }
}
```

今回はたまたま1秒毎に値を出していたため、3の倍数がきれいに出ています。  
最初と最後は除く。完全にコレクター側の都合だけでオッケーな場合はこれでいいはずです。

```plaintext
1
3
6
9
10
```

# 値が来たら再起動
https://kotlinlang.org/docs/flow.html#processing-the-latest-value

これだいすき、よく使う。  
なんならこれだけで前記事を書いたことがある。https://takusan.negitoro.dev/posts/kotlin_coroutines_flow_latest/

これはコレクター側がまだ処理中の間に、エミッター側から値が来た場合に、コレクター側を一旦キャンセルし、新しい値で再度起動してくれるやつです。  
`collectLatest { }`の他にも`mapLatest { }`や`transformLatest { }`があり、同様に処理中の間に新しい値が来た場合にキャンセルし再起動してくれます。

これは最新の値だけ処理できればいい場合に使います。  
例えば`collect { }`した結果から、別の`Flow`を`collect { }`したい場合、普通に`collect { }`すると、値が来た分だけ別の`Flow`が起動してしまいます。  
`Flow#collect`の中で`Flow#collect`したい場合ですね。

```kotlin
class MainActivity : ComponentActivity() {

    private val COMMENT = listOf("わこつ", "延長しろ", "おつ", "豆先輩やめてください", "豆豆豆豆豆")

    /** 定期的に適当なユーザーIDを返す */
    private fun userListFlow() = flow {
        while (currentCoroutineContext().isActive) {
            delay(3_000)
            emit(listOf(1, 2, 3, 4))
        }
    }

    /** 定期的に適当なコメントを返す */
    private fun commentListFlow(userId: Int) = flow {
        while (currentCoroutineContext().isActive) {
            delay(1_000)
            emit("ユーザー $userId / コメント = ${COMMENT.random()}")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            // ユーザーID を Flow で受け取って、そのユーザーたちのコメントを収集する
            userListFlow().collect { userList ->
                println("ユーザー更新 = $userList")
                userList
                    .map { commentListFlow(it) }
                    .merge()
                    .collect { comment -> println(comment) }
            }
        }
    }
}
```

これだと、`userListFlow().collect { }`の中で`commentListFlow().collect { }`していますが、`commentListFlow()`は無限ループでずっと送信し続けるため、  
`userListFlow()`から値を受け取ることが出来ません。（`collect { }`は`Flow`が終わるまで一時停止し続けるので）

そこで、`collectLatest { }`です。  

```kotlin
lifecycleScope.launch {
    // ユーザーID を Flow で受け取って、そのユーザーたちのコメントを収集する
    // collectLatest で、userListFlow() から値が来たら、再起動する
    userListFlow().collectLatest { userList ->
        println("ユーザー更新 = $userList")
        userList
            .map { commentListFlow(it) }
            .merge()
            .collect { comment -> println(comment) }
    }
}
```

これで、`userListFlow()`から来た値で`commentListFlow()`を再度作る事ができるようになりました。  
再起動できたので、`ユーザー更新`の`println`も動きます！！

```plaintext
ユーザー更新 = [1, 2, 3, 4]
ユーザー 1 / コメント = 豆豆豆豆豆
ユーザー 2 / コメント = 豆豆豆豆豆
ユーザー 3 / コメント = おつ
ユーザー 4 / コメント = わこつ
ユーザー 1 / コメント = おつ
ユーザー 2 / コメント = 豆先輩やめてください
ユーザー 3 / コメント = 豆先輩やめてください
ユーザー 4 / コメント = 延長しろ
ユーザー更新 = [1, 2, 3, 4]
ユーザー 1 / コメント = わこつ
ユーザー 2 / コメント = おつ
ユーザー 3 / コメント = 豆豆豆豆豆
ユーザー 4 / コメント = おつ
ユーザー 1 / コメント = 豆先輩やめてください
ユーザー 2 / コメント = 豆先輩やめてください
ユーザー 3 / コメント = 豆豆豆豆豆
ユーザー 4 / コメント = 豆先輩やめてください
ユーザー更新 = [1, 2, 3, 4]
ユーザー 1 / コメント = 延長しろ
ユーザー 2 / コメント = 豆先輩やめてください
ユーザー 3 / コメント = 延長しろ
ユーザー 4 / コメント = 豆豆豆豆豆
```

`transformLatest { }`とかも同様に使うことが出来ます。  
`collectLatest { }`だと、`Jetpack Compose`じゃ使えないですからね（`Jetpack Compose`の場合は`Flow#collectAsState()`したいので、`Flow`を返して貰う必要がある）

```kotlin
// さっきの例を transformLatest で書き直した例。Jetpack Compose なら collectAsState() すれば良いです！
val latestUserCommentFlow = userListFlow().transformLatest { userList ->
    userList
        .map { commentListFlow(it) }
        .merge()
        .collect { comment -> emit(comment) }
}

lifecycleScope.launch {
    latestUserCommentFlow.collect { println(it) }
}
```

ちなみに、おそらくこれをやるための適切な演算子、`flatMapConcat { }`等があるんですが、その話は後で！

## 付録 複数の Flow をまとめる
次のセクションに行く前に触れておこうかと。  
↑の例で`merge()`をこっそり使ってたのですが、説明します。  

まずはドキュメントでは触れられてないけど`merge()`、これは`Flow`の配列を1つの`Flow`にすることが出来ます。  
こんな感じ。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            (0 until 3)
                .map { numberFlow } // 3個 numberFlow を作る
                .merge() // １つにする
                .collect {
                    println(it)
                }
        }
    }
}
```

# 複数の Flow を組み合わせる
https://kotlinlang.org/docs/flow.html#composing-multiple-flows

次、ドキュメントに戻して、`zip`と`combine`ですね。  
これらは、それぞれの`Flow`から来た値を加工したりなんかして、単一の`Flow`にすることが出来ます。  
`zip vs combine`で調べれば色んな人が図解して説明してくれているので、今更説明するまでもないかなって思ったけどせっかくなので。  

## zip
https://kotlinlang.org/docs/flow.html#zip

`zip`は、それぞれの`Flow`から新しい値が出揃った時に出力します。攻略の鍵としては、新しい値が出揃ったといったところでしょうか。  
以下のコードを試してみましょう。  

Android のリリース年とそれに対応するバージョンを`Flow`で出してみる例です。  
`zip() { a, b -> }`の`a`と`b`は好きな名前に出来ます。今回は変数の範囲がブロック内、超限定的なので適当に`a`と`b`にしています。

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    // リリース年
    val year = flowOf(2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025)
    // Android バージョン
    val androidVersion = flowOf(5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)

    lifecycleScope.launch {
        year.zip(androidVersion) { a, b -> "$a Android $b" }
            .collect { println(it) }
    }
}
```

`logcat`の出力結果はこうです。  
`year = flowOf()`の方では、勢い余って`2025`まで作ってしまいましたが、出力結果には`2025`がありません。これはなぜかと言うと、`2024`までは`year`と`androidVersion`両方から新しい値が送信されていたのですが、  
`androidVersion`は`15`までしか無く、`2025`に対応する値が`androidVersion`の`Flow`には存在しないためにこのような事態になっています。  
先述の通り、`zip`は`Flow`から新しい値が出揃った時。なので、出揃わない場合は出てくるまで待つことになります。

```plaintext
2014 Android 5
2015 Android 6
2016 Android 7
2017 Android 8
2018 Android 9
2019 Android 10
2020 Android 11
2021 Android 12
2022 Android 13
2023 Android 14
2024 Android 15
```

## combine
https://kotlinlang.org/docs/flow.html#combine

もう一つ、`combine()`を見てみましょう。  
これは、`Flow`のどれかから新しい値が出たら、値を送信する事ができます。`zip`と違い、全ての`Flow`から新しい値が出揃う必要はないです。  

例えばバックアップアプリを作ろうとします。バックアップが実行される条件は適当に考えてこちらです。  

- 充電中
- Wi-Fi 接続中
- 夜

また、どれか 1 つでも条件が変化したらバックアップも停止してほしいですよね。  
というわけで`Flow`を使い、バックアップを起動する処理を書いてみましょう（流石にバックアップ処理は書きません）。

まずはそれぞれの状態を通知する`Flow`を作ってみました。  
充電器に指した、抜いたた`true / false`を送信する`Flow`、`Wi-Fi`接続状態に変化があれば`true / false`を送信する`Flow`、夜かどうかの`Flow`を作り、  
すべての条件が`true`だったら`backupTask()`を呼び出すようにしてみました。  

`combine()`は 1 つでも`Flow`から新しい値が来たら再度関数が呼ばれるため、`collectLatest { }`を使いました。  
これで`false`になったときに`backupTask()`をキャンセルできます！

```kotlin
class MainActivity : ComponentActivity() {

    /** 充電したら true を送信する Flow */
    private val isChargingFlow = callbackFlow {
        val broadcastReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                val status = intent?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
                trySend(status == BatteryManager.BATTERY_STATUS_CHARGING)
            }
        }
        registerReceiver(broadcastReceiver, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        awaitClose { unregisterReceiver(broadcastReceiver) }
    }.distinctUntilChanged()

    /** 接続状態 android.permission.ACCESS_NETWORK_STATE 権限が必要です */
    @RequiresApi(Build.VERSION_CODES.N)
    private val isWiFiConnectFlow = callbackFlow {
        val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        // インターネットに出れて（Wi-Fi アイコンにビックリマークが出ていないこと）、かつ定額制（テザリングだと通信制限なる）
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_NOT_METERED)
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                super.onAvailable(network)
                trySend(true)
            }

            override fun onLost(network: Network) {
                super.onLost(network)
                trySend(false)
            }

            override fun onUnavailable() {
                super.onUnavailable()
                trySend(false)
            }
        }
        connectivityManager.registerNetworkCallback(request, callback)
        awaitClose { connectivityManager.unregisterNetworkCallback(callback) }
    }.distinctUntilChanged()

    /** 夜かどうか */
    private val isNightTime = flow {
        // while で定期的に見る
        while (currentCoroutineContext().isActive) {
            val hour = Calendar.getInstance()[Calendar.HOUR_OF_DAY]
            // おはよう!朝4時に何してるんだい?
            val isNight = hour in 18..23 || hour in 0..4
            emit(isNight)
            delay(10_000)
        }
    }.distinctUntilChanged()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            // すべての条件が整った時、どれか 1 つでも false になれば false。
            // どれか 1 つでも条件が変化すれば collectLatest でキャンセルされる
            combine(
                isChargingFlow,
                isWiFiConnectFlow,
                isNightTime
            ) { charging, wifi, night -> charging && wifi && night }.collectLatest { isAllOk ->
                if (isAllOk) {
                    println("バックアップを初めます")
                    backupTask()
                } else {
                    println("条件を満たさなかったため停止しました")
                }
            }
        }
    }

    private suspend fun backupTask() {
        try {
            // ここにバックアップの処理を書く
            awaitCancellation()
        } catch (e: CancellationException) {
            println("キャンセルされました")
            throw e
        }
    }
}
```

実際に動かして、機内モードを`ON / OFF`繰り返してみたりすると、キャンセルされた旨が表示されるはずです。  

```plaintext
バックアップを初めます
キャンセルされました
条件を満たさなかったため停止しました
バックアップを初めます
キャンセルされました
条件を満たさなかったため停止しました
バックアップを初めます
```

### 付録 図解
`zip()`と`combine()`、もう何人もの人が図解化してるので今更書くまでもないと思いますが一応。  
![Imgur](https://i.imgur.com/grNyjPS.png)

### 付録 combine() と初期値
上記の絵を描いている時に思ったんですが、例え`combine()`だとしても、`Flow`から全て出揃ってないと最初の値は流れてこないんですよね。  
それが困る場合があるかなと思います。極端に最初の値が来るのが遅いとか。

その場合は`onStart { }`で初期値としてなにか流しておけばいいのかなってちょっと思った。  
あとは`HotFlow`に変換して常に動かしておくとか。常に動かせば初期値に時間がかかる`Flow`でもなんとかなりそう。

# Flow の中で Flow を作る
https://kotlinlang.org/docs/flow.html#flattening-flows  

`collectLatest { }`や`transformLatest { }`でもう既にやったネタですが、、  
`Flow`で受信した値を元に`Flow`を作りたい場合があると思います。`Android`だと`Room`の`Flow`で受信した値で`Flow`を収集したい事がありそう。

`map { }`で`Flow`を返すと、もれなく`Flow<Flow<T>>`とかいうジェネリクス訳わからんことになります。

```kotlin
class MainActivity : ComponentActivity() {

    private val USER_ID = (1..100).iterator()
    private val COMMENT = listOf("わこつ", "延長しろ", "おつ", "豆先輩やめてください", "豆豆豆豆豆")

    /** 定期的に適当なユーザーIDを返す */
    private fun userFlow() = flow {
        while (currentCoroutineContext().isActive) {
            delay(3_000)
            emit(USER_ID.nextInt())
        }
    }

    /** 定期的に適当なコメントを返す */
    private fun commentFlow(userId: Int) = flow {
        while (currentCoroutineContext().isActive) {
            delay(1_000)
            emit("ユーザー $userId / コメント = ${COMMENT.random()}")
        }
    }

    /** 定期的に適当なコメントを返す。上限つき */
    private fun commentFlowLimit(userId: Int) = flow {
        repeat(5) {
            delay(1_000)
            emit("ユーザー $userId / コメント = ${COMMENT.random()}")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Flow<Flow<T>> ← !?!?!??!
        val flowFlow: Flow<Flow<String>> = userFlow().map { userId -> commentFlow(userId) }
    }
}
```

`Flow<Flow<T>>`を`Flow<T>`の形にしたいですよね、このままだと`collect { }`で`Flow`を受け取る羽目になる。。。

## flatMapConcat
https://kotlinlang.org/docs/flow.html#flatmapconcat

これは、`flatMapConcat { }`で返した`Flow`が終わるのを待つという特徴があります。  
そうです。`Flow`を返す際はおわりがある`Flow`を返す必要があります。上記のコードでは`commentFlowLimit()`が無限ループしないのでおわりがあります。

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    val flowFlow: Flow<String> = userFlow().flatMapConcat { userId -> commentFlowLimit(userId) }
    lifecycleScope.launch {
        flowFlow.collect {
            println(it)
        }
    }
}
```

`logcat`はこんな感じで、`flatMapConcat { }`で返した`Flow`が終わるまでは`userFlow()`から受信した値を使わないという特徴があります。  
`commentFlowLimit()`は5個まで出すので、それが終わってから次の値で`flatMapConcat { }`を呼び出しているわけですね。

```plaintext
ユーザー 1 / コメント = 豆先輩やめてください
ユーザー 1 / コメント = わこつ
ユーザー 1 / コメント = 豆豆豆豆豆
ユーザー 1 / コメント = 延長しろ
ユーザー 1 / コメント = 豆豆豆豆豆
ユーザー 2 / コメント = 豆豆豆豆豆
ユーザー 2 / コメント = 豆先輩やめてください
ユーザー 2 / コメント = 豆先輩やめてください
ユーザー 2 / コメント = 延長しろ
ユーザー 2 / コメント = 豆豆豆豆豆
ユーザー 3 / コメント = 豆先輩やめてください
ユーザー 3 / コメント = 延長しろ
ユーザー 3 / コメント = 豆豆豆豆豆
ユーザー 3 / コメント = おつ
ユーザー 3 / コメント = 豆豆豆豆豆
ユーザー 4 / コメント = 豆先輩やめてください
```

## flatMapMerge
https://kotlinlang.org/docs/flow.html#flatmapmerge

こっちは、値を受け取ったら`flatMapMerge { }`を即呼び出し、`flatMapMerge { }`で返された`Flow`の収集を始めます。  
`flatMapConcat { }`と違い`Flow`の終了を待たないので、おわりがない`Flow`でも使えます。

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    // Flow<Flow<>> !?!?!??!
    val flowFlow: Flow<String> = userFlow().flatMapMerge { userId -> commentFlow(userId) } // 有限の commentFlowLimit() でも！
    lifecycleScope.launch {
        flowFlow.collect {
            println(it)
        }
    }
}
```

`logcat`はこうで、即呼び出すため、並列で何個も`Flow`から受信することになります。

```kotlin
ユーザー 10 / コメント = わこつ
ユーザー 9 / コメント = 延長しろ
ユーザー 8 / コメント = わこつ
ユーザー 7 / コメント = わこつ
ユーザー 6 / コメント = 延長しろ
ユーザー 5 / コメント = おつ
ユーザー 4 / コメント = わこつ
ユーザー 3 / コメント = 豆先輩やめてください
ユーザー 2 / コメント = おつ
ユーザー 1 / コメント = 延長しろ
```

## flatMapLatest
https://kotlinlang.org/docs/flow.html#flatmaplatest

`Latest`系列は、新しい値が来たらキャンセルしてもう一回起動すると言いました。  
例に漏れず、これも新しい値が来たら`flatMapLatest { }`で返された`Flow`の収集をキャンセルし、新しく返された`Flow`で収集を初めます。

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    // Flow<Flow<>> !?!?!??!
    val flowFlow: Flow<String> = userFlow().flatMapLatest { userId -> commentFlow(userId) } // おわりがない Flow を返している点に注目
    lifecycleScope.launch {
        flowFlow.collect {
            println(it)
        }
    }
}
```

`logcat`の出力はこうで、`flatMapConcat { }`と**同じような出力**がされるのですが、  
今回は`commentFlowLimit()`ではなく、**無限ループする**`commentFlow()`を呼び出しています。新しい値が来たらキャンセルするため、おわりがない場合もキャンセルしてくれるためです。

```plaintext
ユーザー 46 / コメント = おつ
ユーザー 46 / コメント = 延長しろ
ユーザー 47 / コメント = 延長しろ
ユーザー 47 / コメント = 延長しろ
ユーザー 48 / コメント = 延長しろ
ユーザー 48 / コメント = 豆豆豆豆豆
ユーザー 49 / コメント = わこつ
ユーザー 49 / コメント = わこつ
ユーザー 50 / コメント = 延長しろ
ユーザー 50 / コメント = 豆先輩やめてください
ユーザー 51 / コメント = 延長しろ
ユーザー 51 / コメント = 豆豆豆豆豆
ユーザー 52 / コメント = わこつ
ユーザー 52 / コメント = 豆先輩やめてください
ユーザー 53 / コメント = わこつ
ユーザー 53 / コメント = 延長しろ
```

# Flow の例外
https://kotlinlang.org/docs/flow.html#collector-try-and-catch

## コレクター側の例外
`try-catch`で例外を捕まえることが出来ます。  

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            try {
                numberFlow.collect {
                    if (3 < it) {
                        throw RuntimeException("err")
                    }
                    println(it)
                }
            } catch (e: RuntimeException) {
                println("例外をキャッチ")
            } finally {
                println("finally")
            }
        }
    }
}
```

キャッチできるので、アプリはクラッシュしません。

```plaintext
1
2
3
例外をキャッチ
finally
```

## エミッター側、中間演算子の例外
https://kotlinlang.org/docs/flow.html#everything-is-caught

エミッター側や、中間演算子で発生した例外も、`try-catch`でキャッチできます。  

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            try {
                numberFlow
                    .onEach { if (3 < it) throw RuntimeException("err") }
                    .collect { println(it) }
            } catch (e: RuntimeException) {
                println("例外をキャッチ")
            } finally {
                println("finally")
            }
        }
    }
}
```

キャッチしたため、同様にクラッシュしません。

```plaintext
1
2
3
例外をキャッチ
finally
```

# 例外の透過性
https://kotlinlang.org/docs/flow.html#exception-transparency

ここの説明は、`catch { }`の後に話すので、まずは`catch { }`について聞いてって

## catch 演算子
https://kotlinlang.org/docs/flow.html#transparent-catch

`catch { }`を使うことで、`try-catch`のように例外をキャッチすることが出来ます。  
`emit()`も可能です。これも巻き上げなので、`catch { }`より下で発生した例外はキャッチされません。宣言型。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            numberFlow
                .onEach { if (3 < it) throw RuntimeException("onEach err") }
                .catch { println("キャッチした $it") } // これより上の例外をキャッチする
                .collect { println(it) }
        }
    }
}
```

## コレクター側の例外も catch したい
https://kotlinlang.org/docs/flow.html#catching-declaratively

`collect { }`以外に、もう一つ書き方があるといいました。`onEach { }`と`collect()`を組み合わせる方法ですね。  
これと`catch { }`を使うことで、エミッター側、コレクター側、中間演算子の例外全てをキャッチすることが出来るようになります。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            numberFlow
                .onEach { if (3 < it) throw RuntimeException("onEach err") }
                .onEach { println(it) }
                // これより上の例外をキャッチする。collect { } の代わりに onEach { } に移動し catch { } より上に呼ばれているため、コレクター側の例外もここでキャッチできます
                .catch { println("キャッチした $it") }
                .collect()
        }
    }
}
```

```plaintext
1
2
3
キャッチした java.lang.RuntimeException: onEach err
```

ま、まあ`collect { }`と`try-catch`でもいいんですがこういう方法もあるよって。


## 例外の透明性は何が言いたかったのか
順番が前後しちゃってすいません。

- https://kotlinlang.org/docs/flow.html#exception-transparency
- https://elizarov.medium.com/exceptions-in-kotlin-flows-b59643c940fb

ドキュメントでは、`Exception transparency`、翻訳すると`例外の透明性`だって、よくわからない。  
`Flow`で例外が発生した場合に、`println()`するような、`catch { }`演算子のようなものを自前で作ってみることにしましょう。  

```kotlin
/** Flow の例外をキャッチし、println() する */
private fun <T> Flow<T>.catchAndPrintError() = flow {
    try {
        collect { emit(it) }
    } catch (e: Exception) {
        println("[ログ] 例外をキャッチ $e")
    }
}
```

しかし、これは`catch { }`と同じ動作をしません。まず、以下のコードを試してみましょう。  
`catch { }`演算子は巻き上げで、自分より上のエミッターや中間演算子で発生した例外のみをキャッチし、自分より下のコレクターや中間演算子の例外はキャッチしないという特徴がありました。

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            (1..100).asFlow()
                .onEach { delay(100) } // 100 ミリ秒毎に次の値
                .catchAndPrintError() // 自前 catch
                .onEach { if (3 < it) error("Error") } // 自前 catch よりも下で例外を投げる
                .collect { println(it) } // 収集開始
        }
    }

    /** Flow の例外をキャッチし、println() する */
    private fun <T> Flow<T>.catchAndPrintError() = flow {
        try {
            collect { emit(it) }
        } catch (e: Exception) {
            println("[ログ] 例外をキャッチ $e")
        }
    }
}
```

ただ、自前で作った`catch`演算子は`Flow`**全体の例外をキャッチしてしまっています。**  
`map { }`や`filter { }`などは上から順番に処理されるのでなんとなくは予想できますが、全体の例外をキャッチされてしまっては予測が困難になります。

```plaintext
1
2
3
[ログ] 例外をキャッチ java.lang.IllegalStateException: Error
```

それでは、例外時に値を送信する機能もつけてみましょう。  
`catch { }`が`emit()`できるなら自前で作ったやつだって出来るはず！

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            (1..100).asFlow()
                .onEach { delay(100) } // 100 ミリ秒毎に次の値
                .catchAndPrintError { -1 } // 自前 catch、エラーだったら -1 を送信する
                .onEach { if (3 < it) error("Error") } // 自前 catch よりも下で例外を投げる
                .collect { println(it) } // 収集開始
        }
    }

    /** Flow の例外をキャッチし、println() する */
    private fun <T> Flow<T>.catchAndPrintError(fallback: (Exception) -> T) = flow {
        try {
            collect { emit(it) }
        } catch (e: Exception) {
            println("[ログ] 例外をキャッチ $e")
            // 引数の関数を呼び出して emit()
            emit(fallback(e))
        }
    }
}
```

しかしこれも動きません。  
`try-catch`の`catch`で`emit()`を呼び出すことは禁止されています。

```plaintext
1
2
3
[ログ] 例外をキャッチ java.lang.IllegalStateException: Error
FATAL EXCEPTION: main
Process: io.github.takusan23.kotlincoroutinesflowpractice, PID: 7787
java.lang.IllegalStateException: Flow exception transparency is violated:
    Previous 'emit' call has thrown exception java.lang.IllegalStateException: Error, but then emission attempt of value '-1' has been detected.
    Emissions from 'catch' blocks are prohibited in order to avoid unspecified behaviour, 'Flow.catch' operator can be used instead.
    For a more detailed explanation, please refer to Flow documentation.
```

おそらくは、例外が投げられたことで`Flow`は終了するはずだったのに、`emit()`されて困っていると言ったことろでしょうか。  
（正直良く分かっていない）

自前`catch { }`なんて作らずに用意された`catch { }`を使えば良いです。自分で適当に作ると全体の例外をキャッチしちゃうので。。。

# フローの完了
https://kotlinlang.org/docs/flow.html#flow-completion

完了、終了を知ることが出来ます。

## try-finally
https://kotlinlang.org/docs/flow.html#imperative-finally-block

サスペンド関数のときと同じく`finally { }`で終わりを知ることが出来ます。  

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            try {
                numberFlow.collect {
                    println(it)
                }
            } finally {
                println("おわり")
            }
        }
    }
}
```

`logcat`はこう。まあ予想通り。

```plaintext
1
2
3
4
5
6
7
8
9
10
おわり
```

## onCompletion 演算子
https://kotlinlang.org/docs/flow.html#declarative-handling

`onCompletion { }`は、中間演算子の付録で触ったけど、そう言えば言ってないことがあったので。  
これも`catch { }`演算子のそれと同じく、`finally { }`とだいたい同じです。

ちなみに、`onCompletion { }`は、引数に`Throwable`を貰えます。  
これは例外で終了した場合には例外を、正常に終了した場合は`null`を渡してくれます。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            numberFlow
                .onCompletion { causeOrNull -> println("おわり $causeOrNull") }
                .collect { println(it) }
        }
    }
}
```

`logcat`を見ると、今回は正常に完了したので、`null`がでていますね。

```plaintext
1
2
3
4
5
6
7
8
9
10
おわり null
```

## catch との違い
https://kotlinlang.org/docs/flow.html#successful-completion

`catch { }`と違って、**例外をキャッチするわけじゃない**ので、`try-catch`でくくるか、`catch { }`をつけるかしないと落ちます。  
`onCompletion { }`は呼ばれるのですが、その後例外で落ちてしまいます。

```kotlin
lifecycleScope.launch {
    numberFlow
        .onCompletion { println("例外はこれ $it") }
        .collect {
            if (3 < it) throw RuntimeException("3 < it")
            println(it)
        }
}
```

`logcat`には例外が

```plaintext
1
2
3
例外はこれ java.lang.RuntimeException: 3 < it
FATAL EXCEPTION: main
Process: io.github.takusan23.kotlincoroutinesflowpractice, PID: 1060
java.lang.RuntimeException: 3 < it
	at io.github.takusan23.kotlincoroutinesflowpractice.MainActivity$onCreate$1$2.emit(MainActivity.kt:75)
```

# 例外処理はどっちがいいの
https://kotlinlang.org/docs/flow.html#imperative-versus-declarative

`try-catch-finally`と、`catch { } onCompletion { }`どっちがいいかという話。  
これは、どっちを推奨するとかはないらしい。好きな方を使って大丈夫。

# Flow を起動する
https://kotlinlang.org/docs/flow.html#launching-flow

後回しにしていた`launchIn()`ってのがあるよという話です。  
`collect()`を呼び出すと、`Flow`の収集が完了するまで一時停止し続けるわけです。  
間違えやすいミスとしては、`collect { }`の後に別の`Flow`の`collect { }`をしちゃう場合。先述の通り完了するまで一時停止するため、終わるまで進みません。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {

            numberFlow.collect { println(it) }

            // ↑ の Flow が終わるまでここに来ない！！
            numberFlow.collect { println(it) }
        }
    }
}
```

終わるのを待たず、並列で`Flow`から収集をしたい場合、`collect { }`してる箇所を`launch { }`で一個一個囲っていくか、`launchIn()`を使うかです。  
まずは`launch { }`でくくっていく場合。ちょっとネストが深くなっちゃうけど、シンプルでいい。

```kotlin
lifecycleScope.launch {
    // これなら並列起動できます
    launch {
        numberFlow.collect { println(it) }
    }
    launch {
        numberFlow.collect { println(it) }
    }
}
```

再度宣伝しますが、`launch { }`が使えるところ、使えないところとその理由。を前回のサスペンド関数のドキュメントを読んでみようの記事で触れているので良ければ。  
https://takusan.negitoro.dev/posts/amairo_kotlin_coroutines_suspend/#構造化された並行性

話を戻して、もう一つ、`launchIn()`を使う方法があります。  
これは一時停止する代わりに、`Job`を返します。これは`launch { }`したときの返り値と同じで、これを使うことでキャンセルが出来ます。  
（まあコルーチンスコープをキャンセルすることでもキャンセルが出来ます）

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..10).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // launchIn() はサスペンド関数じゃないです
        // collect { } の代わりに onEach { } を使う
        val collector: Job = numberFlow
            .onEach { println(it) }
            .launchIn(lifecycleScope) // LifecycleScope が有効な間

        println("一時停止しませんよ～（危険運転）")
    }
}
```

`logcat`をみるとこんな感じで、一番最後の`println()`が先に呼び出されるようになります。

```plaintext
一時停止しませんよ～（危険運転）
1
2
3
4
5
6
7
8
9
10
```

## Android ライフサイクルと collect
https://developer.android.com/topic/libraries/architecture/coroutines#lifecycle-aware

今まで書いてきたコードでは、アプリを切り替えるなどしてバックグラウンド状態にしても`Flow`から値の収集が動いてしまいます。
ユーザーには見えていないのに`Flow`の収集が動くのは、無駄にバッテリーを消費したり、インターネット通信が伴う場合は通信されてしまうため、あんまり良くないですね。見えないところで何やってんだって。電池もギガ（Z世代並感）も有限なので。  

`Android`では、ユーザーに実際に表示されているときのみ`Flow`から収集する機能が用意されています。`Android`チームが作ってくれました。  
もう少し具体的に言うと、ライフサイクルが`onStart ~ onStop`の間だけ`Flow`から収集する方法があります。`onStart`まで進んだら`Flow`の収集が始まり、`onStop`以降に進んだらキャンセルされます。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberFlow = flow {
        (1..100).forEach {
            delay(1_000)
            emit(it)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            // this で LifecycleOwner が必要
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                // onStart - onStop の間有効なコルーチンスコープ
                try {
                    numberFlow.collect { println(it) }
                } finally {
                    println("finally ！")
                }
            }
        }
    }
}
```

これを動かしてみて、適当にバックグラウンドいったりフォアグラウンド行ったりするとこんな感じで、何回か`finally !`が出力され、数字も戻っているはず。  
なので`logcat`はこんな感じです。

```plaintext
98
99
100
finally ！
1
2
3
4
5
6
7
finally ！
1
2
3
finally ！
1
2
3
finally ！
```

ちなみに、これの`Jetpack Compose`版もあります。  
`build.gradle (.kts)`で、`implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.6")`を書き足す必要がありますが。  

```kotlin
// build.gradle.kts

dependencies {

    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.6")
    // ... 以下省略

}
```

`collectAsState()`を`collectAsStateWithLifecycle()`に置き換えます。  
これで画面に表示されているときのみ更新するようになります。

```kotlin
@Composable
private fun MainScreen() {
    val countValue by remember {
        (1..100).asFlow().onEach { delay(100) }
    }.collectAsStateWithLifecycle(initialValue = 0) // collectAsStateWithLifecycle() にする
    
    Text(text = countValue.toString())
}
```

# Flow とキャンセルチェック
https://kotlinlang.org/docs/flow.html#flow-cancellation-checks

サスペンド関数のときは`ensureActive()`や`isActive`等でキャンセルチェックをしましょうねという話をしました。  
`Flow`の場合もだいたい同じで、キャンセルを考慮する必要が多々あります。

まずは`flow { }`で作った`Flow`。これはキャンセル可能です。キャンセルしたらもう来ません。  
試してみましょうっておもったけど、これも`Android`だとサンプルコードがそのままクラッシュせずに動いちゃいますね。  

じゃあ飛ばして、`asFlow()`等で作った`Flow`はキャンセルされてても値が来てしまいます。  
もちろん、中間演算子や、コレクター側でキャンセル対応サスペンド関数を呼び出せばそこでキャンセルされるのですが（`delay()`や`withContext { }`）、それすらもない、最小構成の場合はキャンセル後も値が出てきます。

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    lifecycleScope.launch {
        // この中、どれもキャンセル対応のサスペンド関数がない
        (0..100).asFlow().collect {
            if (it == 3) cancel()
            println(it)
        }
    }
}
```

もしこれをキャンセル対応にしたい場合は、`cancellable()`をつけると良いです。  

```kotlin
lifecycleScope.launch {
    (0..100).asFlow()
        .cancellable() // キャンセル対応
        .collect {
            if (it == 3) cancel()
            println(it)
        }
}
```

これで、`3`以降の値は来ていないことが分かりました。

```plaintext
0
1
2
3
```

# むすび
https://kotlinlang.org/docs/flow.html#flow-and-reactive-streams

`Flow`は`Rxなんとか`等に似せて作ったよって話と、`Rx`と変換するライブラリも用意したよって話で終わりです。  
公式ドキュメントは以上！長かった・・・

# ちょっとまって？ HotFlow の話が入ってないやん
親方に電話させてもらうね

https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/

はい、なぜだか知りませんがホットフローに関してさっきの公式ドキュメントでは触れられていません。ので手探りでやっていこうと思います。

ちなみに一応`Android`側にはあります。良くも悪くも`Google`が作ったって感じのドキュメントですが。  
https://developer.android.com/kotlin/flow/stateflow-and-sharedflow

## ColdFlow だと困ること
https://elizarov.medium.com/shared-flows-broadcast-channels-899b675e805c

ここまで作ってきた`Flow`は`Flow`の中でも`Cold Flow (コールドフロー)`と呼ばれるものです。  

```kotlin
private val numberFlow = flow {
    (1..100).forEach {
        delay(1_000)
        emit(it)
    }
}
```

`flow { }`のブロック内で値を送信する処理が完結しています。  
これにより、`collect()`でブロック内の処理が開始し、ブロック内一番最後に到達すれば`collect()`の一時停止が終了するわけです。  
ブロック内に閉じ込められているため、開始と終了は明確ですね。  

ところで、`flow { }`のブロック内よりも広いスコープで`emit()`したい場合はどうすればいいでしょうか。  
上記の例では終わりがあるのため、ブロック内でしか`emit()`出来ないですが、これとは別に終わりがない`Flow`が存在すれば他の箇所から`emit()`出来てもいいのではないかと。  

え？`emit()`を他の箇所からしたい理由？それは`collect()`するたびに`flow { }`のブロック内が呼び出されると無駄使いになるから。  
インターネット通信が伴う場合、一回`flow { }`を起動したら 2 回目以降はそれを使いまわしてほしいと思うでしょう。でもブロック内だと毎回呼ばれちゃうから。`emit()`するコードを動かしたいわけ。

要は`LiveData`の代わりに使えるって、皆言ってたのに今のところ出てきてねえじゃねえかって。

## HotFlow
- https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/
- https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/

`SharedFlow`と`StateFlow`がそれらを解決します。  
これらは、終わりがない代わりに、`emit()`が自由にできます。ブロック内の成約がなくなります。  
難しいですか、じゃあ`MutableLiveData / LiveData`は`MutableStateFlow / StateFlow`に置き換えが可能ですと言えばいいかな。使い方はほぼ同じで`Flow`の強力な中間演算子付きです。

## ColdFlow vs HotFlow

### HotFlow は終了しない
`ColdFlow`は`collect()`したら起動し、ブロック内の処理が終わると終了します。`collect()`も一時停止が解除されます。  
`HotFlow`は作った時点で起動し、終わりません。`ColdFlow`と違い終わりを知るすべが無いためですね。終わりがないため、`collect()`したらそれ以降の処理が呼ばれません。  

先述の通り、`launch { }`でくくるなどの対策が必要です。  
また、`toList()`等の終了する前提で作られたコレクターもおそらく期待通りに動きません。終わるまで`List`に詰めてくれるやつですが、終わらないんですから。  
一応`toList()`は`take()`を使い上限を決めることで期待通りに動くようになります。

### 値は共有される
`ColdFlow`は`collect()`のたびにブロック内が起動するため、それぞれ独立していました。そのため、値は共有されません。それぞれで作られます。  
`HotFlow`は`emit()`した値を全てのコレクター側で共有します。同じものが届けられます。

## HotFlow の使い方
`SharedFlow`も`StateFlow`も`Mutable`版があります。  
`Mutable`版を作った後、`Jetpack Compose / Activity / Fragment`から参照するための非`Mutable`版の`Flow`を`public`で公開するのがお作法です。  
これにより`HotFlow`への書き込みは`ViewModel`内に限定されるため秩序が保たれます。

```kotlin
class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val _eventFlow = MutableSharedFlow<String>()
    private val _nameFlow = MutableStateFlow("takusan_23")

    // public なものは Mutable が付いていない、読み取り専用の Flow を返すべきです

    val eventFlow = _eventFlow.asSharedFlow()
    val nameFlow = _nameFlow.asStateFlow()

    fun sendEvent(event: String) {
        viewModelScope.launch {
            // tryEmit() だと非サスペンド関数になります
            _eventFlow.emit(event)
        }
    }

    fun changeName(name: String) {
        _nameFlow.value = name
    }
}
```

まんま`LiveData`のそれなのですが、1 つ疑問が

## SharedFlow vs StateFlow
短い答えとしては、`LiveData`の代替は`StateFlow`になります。  
真面目に話すと、`Flow`、`SharedFlow`、`StateFlow`の関係性は以下のようになります。

```java
class SharedFlow extends Flow
```

```java
class StateFlow extends SharedFlow
```

はい。`StateFlow`は`SharedFlow`を元に作ったものですね。これだけだと進化版に見えますが、使い所さんが違います。  

まずは`SharedFlow`。これは`HotFlow`ですが、`LiveData`のように最新の値を保持するわけではありません（正しくは保持できるがデフォルトだとしない。引数を調整するか、`StateFlow`を使う）。  
そのため、`collect()`するタイミングによって、受け取れる値が変わります。以下の例を試してみましょう。

```kotlin
class MainActivity : ComponentActivity() {

    private val sharedFlow = MutableSharedFlow<Int>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {

            // [1] 受信開始
            launch {
                sharedFlow.collect { println("[1] $it") }
            }

            // 値セット
            delay(100)
            sharedFlow.emit(1)

            // [2] 受信開始
            launch {
                sharedFlow.collect { println("[2] $it") }
            }

            // 値更新
            delay(100)
            sharedFlow.emit(2)
        }
    }
}
```

`logcat`はこうで、`collect()`した後に送られてきた値のみ受信するという挙動になっています。  
`[2]`がなぜ`1`を受信していないかと言うと、`collect()`する前に`emit(1)`されたからですね。名前通り値を共有するのには使える感じですね。

```plaintext
[1] 1
[1] 2
[2] 2
```

次に`StateFlow`もみてみましょう。  
こちらは初期値が必要なんです。状態更新は`emit()`もありますが、`.value`でセットするか、`update { }`で出来ます。これらは非サスペンド関数からも呼び出せます。

```kotlin
class MainActivity : ComponentActivity() {

    private val sharedFlow = MutableStateFlow(0) // 初期値が必要

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {

            // [1] 受信開始
            launch {
                sharedFlow.collect { println("[1] $it") }
            }

            // 値セット
            delay(100)
            sharedFlow.value = 1

            // [2] 受信開始
            launch {
                sharedFlow.collect { println("[2] $it") }
            }

            // 値更新
            delay(100)
            sharedFlow.value = 2
        }
    }
}
```

`logcat`の出力がこんな感じで、今回は`[2]`でも`1`を出力しています。  
これは、`SharedFlow`とは違い`StateFlow`の場合は最後の値（つまり最新の値）を常に持っているためです。最後の値が必要なので、`MutableStateFlow()`を作る際には初期値が必要になります。  
`LiveData`と違い`Kotlin`で書かれているため、`null`にする場合は`?`を型に付ける必要があります。安全！

```plaintext
[1] 0
[1] 1
[2] 1
[1] 2
[2] 2
```

もちろん`SharedFlow`でも保持するように引数を調整できるのですが、あんまりやらないかなと、、、  
`StateFlow`あるしそれでいいじゃんて

あとは`StateFlow`は同じ値を入れた場合は送信しないという特徴もあります。  
`distinctUntilChanged()`が組み込まれているため、`StateFlow`に`distinctUntilChanged()`をつけても意味がないです（`map { }`等で変換した後では効くと思います）

## ColdFlow を HotFlow にしたい
`ColdFlow`でインターネット通信をしたいけど、その都度起動すると通信量がその分だけかかってしまいます。値を共有できる`SharedFlow / StateFlow`にしたいけど書き直すのも面倒だって？  
`flow { }`や`asFlow()`で作った`Flow`を`HotFlow`に変換する関数があります。これで`MutableStateFlow()`用に書き直す必要はありません。  

まずは`ColdFlow`で書いた`Flow`を 2 箇所で受信して動かしてみる。  
せっかくなのでインターネット通信をする`Flow`を作ります。インターネット通信用ライブラリの`OkHttp`を入れて、`android.permission.INTERNET`権限を付与して、以下のコードです。  

ちなみに叩いてる`API`は`AWS`のグローバルIP確認`API`です。バックエンド開発ならまだしも、`Android`でグローバルIPを知れて嬉しいことなんて無いと思いますが。

```kotlin
class MainActivity : ComponentActivity() {

    private val okHttpClient = OkHttpClient()
    private val GLOBAL_IP_ADDRESS_API_URL = "https://checkip.amazonaws.com"

    /** グローバル IP を取得する API を定期的に叩く TODO android.permission.INTERNET 権限と、OkHttp ライブラリを使っています */
    private val globalIpFlow = flow {
        println("Flow 起動")
        while (currentCoroutineContext().isActive) {
            delay(10_000)
            val request = Request.Builder().apply {
                url(GLOBAL_IP_ADDRESS_API_URL)
                get()
            }.build()
            val responseString = okHttpClient.newCall(request).execute().body?.string()
            emit(responseString)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // インターネット通信なので Main 以外で！
        lifecycleScope.launch(Dispatchers.IO) {
            launch {
                globalIpFlow.collect {
                    println("[collect 1] グローバルIP = $it")
                }
            }
            launch {
                globalIpFlow.collect {
                    println("[collect 2] グローバルIP = $it")
                }
            }
        }
    }
}

```

`logcat`を見てみると、`ColdFlow`の特徴通り、`collect()`するたびにブロック内の処理が起動してしまっているので（`"Flow 起動"`が2回出ている）、インターネット通信を余計にしていることになりますね、無駄！  
一回取得したら`collect { }`間で共有してほしいですよね。


```plaintext
// グローバルIPなので適当な値に置き換えています
Flow 起動
Flow 起動
[collect 2] グローバルIP = 192.0.2.1
[collect 1] グローバルIP = 192.0.2.1
[collect 1] グローバルIP = 192.0.2.1
[collect 2] グローバルIP = 192.0.2.1
[collect 1] グローバルIP = 192.0.2.1
[collect 2] グローバルIP = 192.0.2.1
```

`HotFlow`にするには`stateIn()`か`shareIn()`を呼び出すとよいです。  
`stateIn()`が`StateFlow`、`shareIn()`が`SharedFlow`になります。常に最新の値を持ってほしい場合は`stateIn()`、ただ共有だけできればいい場合は`shareIn()`でいいんじゃないかなと。  

```kotlin
/** グローバル IP を取得する API を定期的に叩く TODO android.permission.INTERNET 権限と、OkHttp ライブラリを使っています */
private val globalIpFlow = flow {
    println("Flow 起動")
    while (currentCoroutineContext().isActive) {
        delay(10_000)
        val request = Request.Builder().apply {
            url(GLOBAL_IP_ADDRESS_API_URL)
            get()
        }.build()
        val responseString = okHttpClient.newCall(request).execute().body?.string()
        emit(responseString)
    }
}.stateIn(
    scope = lifecycleScope, // 起動するためコルーチンスコープを提供しないといけない。collect() や launchIn() のそれと同じ理由
    started = SharingStarted.Eagerly, // 後述
    initialValue = null // StateFlow の場合は初期値が必要
)
```

### 付録 SharingStarted の種類
https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-sharing-started/-companion/

- Eagerly
    - `stateIn`/`shareIn`を呼び出すとすぐに動き出します
- Lazily
    - 誰かが`collect()`するまで動かない
- WhileSubscribed
    - 誰かが`collect()`するまで動かないし、`collect()`している箇所がなくなったら終了する。誰かが受信している間は動く
- 自作する
    - https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-sharing-started/

### 付録 HotFlow 好きな使い方
好きな`HotFlow`変換ユースケース発表ドラゴン

個人的には`コールバックのAPI`を`callbackFlow { }`で`Flow`にした後、`stateIn()`するのがすきです。  

というのも、コールバックのAPIってのは大抵、コールバックの呼び出し以外で値を取得する術がないんですよね。  
うーん、説明すると難しいな。コールバックを待ってからじゃないと値が取れないのはもちろんなんだけど、コールバックの引数ってコールバック以外で取れないんですよね。  
`getSuccessValueOrNull()`みたいな、前回成功したコールバックの値を返す関数が生えていてほしいんだけど、大抵は無い。

擬似コードを無理やり書いて、しかも待ち合わせを一定時間待つことでやっているガチで良くないコードですが、こういうのが欲しい

```kotlin
// 擬似コードなので動きません
val request = httpClient.get(URL).request()
request.onSuccess { response -> println(response) }

thread { 
    // 明らかに非同期処理が終わるまで適当に待つ
    sleep(10_000)

    // コールバックでわたってくる値をここでも欲しい
    // でも大抵はコールバック以外で取る術がない
    val response = request.getSuccessValueOrNull()
    println(response)
}
```

で、これを`stateIn()`するとどうなるかと言うと、最後の値を常に持っていてくれるため、処理が終わるまで待ちたければ`collect()`するし、確実に非同期処理が終わっていれば`.value`プロパティで取得できるので、私はこのパターンを良く使ってます。  
`Camera2 API`はこの技を使うとずいぶんコールバックの数がマシになる。

```kotlin
// 擬似コードなので動きません
val responseFlow = flow { 
    val request = httpClient.get(URL).request()
    request.onSuccess { response -> println(response) }
}.shareIn()

// 終わるまで待ちたい
responseFlow.collect { response -> }

// 確実に非同期処理が終わってるので、コールバックの値を欲しい
responseFlow.value
```

まあ後は、最新の値を持ってくれているという特徴を活かして、いつ呼ばれるか分からんコールバックを`callbackFlow { }`と`stateIn()`するやつ。  
例えば最初の値が来るまで時間がかかっていつ呼ばれるか分からん非同期処理なんかは、`stateIn()`で即起動しておく技をやっています。

完了すれば`collect { }`で受信できるし、`.value`でも取れるしで。`Flow.first()`で非同期処理の値が来るまで一時停止する技もすきです。

まあ後は（オイいい加減にしろ）、コールバックの登録が一箇所しか出来ないやつも`callbackFlow { }`と`stateIn()`で変換して、複数個所から受信できるようにするやつ。これもすき  
ライブラリによっては **set**Listener { } / **set**Callback { } じゃなくて、 **add**Listener { } / **add**Callback { } を用意してくれるライブラリもあるんですが、大体は`setListener { } / setCallback { }`で一箇所しかコールバックを登録できない。。。ので。

# Channel
https://kotlinlang.org/docs/channels.html

すいません、これはマジでほとんど使ったことがなくドキュメント通りの話しかできません。  
今のところ`Flow`で間に合ってるので使わないかなあ

これは、複数回値を返したいというよりかは、`launch { }`を超えた値の共有のために使われてそう？  
コルーチン間で値のやり取りができます。`Flow`でもできますが、これは値が送れたことが確実になるまで一時停止してくれます。`BlockingQueue`のコルーチン版らしい。

例えば以下のコードを試してみましょう。

```kotlin
class MainActivity : ComponentActivity() {

    private val numberChannel = Channel<Int>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        lifecycleScope.launch {
            numberChannel.send(1)
            println("送ったのを確認した")
        }

        lifecycleScope.launch {
            val receive = numberChannel.receive()
            println("受け取った $receive")
        }
    }
}
```

`logcat`はこうです。`send()`したら、`receive()`するまで一時停止する感じです。  
これは`Flow`とは違い、確実に受信したかを確認することが出来ます。  

```plaintext
受け取った 1
送ったのを確認した
```

コルーチン間で処理が分かれていて、別のコルーチンに処理を投げたい場合に`Channel`は便利なんだと思います。受信が確実に分かるので。  
ごめん、使ったことがなくどういう時に使えばいいかわかんないや

# おわりに
以上です。おつかれさまでした。88888