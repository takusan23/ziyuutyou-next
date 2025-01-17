---
title: Jetpack Compose で画面外にいるコンポーネントの位置を取得したい
created_at: 2024-02-27
tags:
- Android
- Kotlin
- JetpackCompose
---
どうもこんばんわ。  
忘れそうなので

# 本題
`Modifier.onGlobalPosition { }`っていう`Modifier`を使うことで、表示されているコンポーネントの位置が取れる便利なやつなのですが...  
ちょっと困った事があって

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            JetpackComposeGlobalPositionOutViewTheme {
                HomeScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen() {
    // コンポーネントの座標
    val position = remember { mutableStateOf(IntRect.Zero) }
    // ドラッグで移動
    val offset = remember { mutableStateOf(IntOffset(0, 0)) }

    Scaffold(
        topBar = { TopAppBar(title = { Text(text = "JetpackComposeGlobalPositionOutView") }) }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize()
        ) {

            Box(
                modifier = Modifier
                    .size(100.dp)
                    .offset { offset.value }
                    .background(Color.Red)
                    // コンポーネントの座標
                    .onGloballyPositioned {
                        position.value = it
                            .boundsInWindow()
                            .roundToIntRect()
                    }
                    // ドラッグで移動
                    .pointerInput(Unit) {
                        detectDragGestures { change, dragAmount ->
                            change.consume()
                            offset.value = IntOffset(
                                x = (offset.value.x + dragAmount.x).toInt(),
                                y = (offset.value.y + dragAmount.y).toInt()
                            )
                        }
                    }
            )

            Text(
                modifier = Modifier.align(Alignment.BottomCenter),
                text = """
                    left = ${position.value.left}
                    top = ${position.value.top}
                    right = ${position.value.right}
                    bottom = ${position.value.bottom}
                """.trimIndent()
            )
        }
    }
}
```

![Imgur](https://i.imgur.com/Or8W4or.png)

# 画面外にいると取れない？
というわけで横に長い、スクロールするような画面を用意しました。  

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            JetpackComposeGlobalPositionOutViewTheme {
                HomeScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen() {
    // コンポーネントの座標
    val position = remember { mutableStateOf(IntRect.Zero) }
    // ドラッグで移動
    val offset = remember { mutableStateOf(IntOffset(0, 0)) }

    Scaffold(
        topBar = { TopAppBar(title = { Text(text = "JetpackComposeGlobalPositionOutView") }) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize()
        ) {

            // 横にスクロールできるように
            // スクロールといえばレッツノート
            Box(
                modifier = Modifier
                    .weight(1f)
                    .horizontalScroll(rememberScrollState())
            ) {

                // 横に長ーーーいコンポーネントを置く
                Box(
                    modifier = Modifier
                        .fillMaxHeight()
                        .requiredWidth(3000.dp)
                ) {

                    // スクロール出来てるか確認用に文字を横にズラーッと並べる
                    Row {
                        (0 until 50).forEach {
                            Text(
                                modifier = Modifier.weight(1f),
                                text = it.toString()
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .size(100.dp)
                            .offset { offset.value }
                            .background(Color.Red)
                            // コンポーネントの座標
                            .onGloballyPositioned {
                                position.value = it
                                    .boundsInWindow()
                                    .roundToIntRect()
                            }
                            // ドラッグで移動
                            .pointerInput(Unit) {
                                detectDragGestures { change, dragAmount ->
                                    change.consume()
                                    offset.value = IntOffset(
                                        x = (offset.value.x + dragAmount.x).toInt(),
                                        y = (offset.value.y + dragAmount.y).toInt()
                                    )
                                }
                            }
                    )
                }
            }

            Text(
                text = """
                    left = ${position.value.left}
                    top = ${position.value.top}
                    right = ${position.value.right}
                    bottom = ${position.value.bottom}
                """.trimIndent()
            )
        }
    }
}
```

横並びで文字を入れてあるので、ちゃんとスクロール出来ていることがわかります。  
もちろん動かせますよ。

![Imgur](https://i.imgur.com/Il4LVKd.png)

で、ここからです。  
赤い四角が画面外に行くようにスクロールすると・・・おや？座標が取れないですね。。。  
なんなら画面外に赤い四角を追いやるでもダメですね。

![Imgur](https://i.imgur.com/FnQw9Gh.png)

![Imgur](https://i.imgur.com/KgXRJUe.png)

う～～～ん。  
こまった。

# わんちゃんあるかも boundsInParent
さて、スクロールして画面外から消えたらなんで座標まで取れなくなるのかと言うと、、、
`boundsInWindow()`を使ってるからなんですね。

https://developer.android.com/reference/kotlin/androidx/compose/ui/layout/package-summary#(androidx.compose.ui.layout.LayoutCoordinates).boundsInWindow()

関数の名前から予想できる通り、`Window`（アプリの領域）から見た座標ですね。  
`Window`（アプリの領域）から消えてしまったらそりゃ取れなくなりますわ、  

で、`boundsInParent`とか言うのがワンちゃん使える可能性があります。  

```
- Box (スクロールできるやつ)
    - Box ( requiredWidth で無理やり画面外にコンポーネントを拡大 )
        - Box (赤い四角)
```
↑ 別に`Box`である必要はないですが。

こんな感じに親がすぐ`requiredWidth`というか、画面外にはみ出しているコンポーネントの場合はおそらく取れます。  
`boundsInParent()`を使うように直せばおっけ～

```kotlin
Box(
    modifier = Modifier
        .size(100.dp)
        .offset { offset.value }
        .background(Color.Red)
        // コンポーネントの座標
        .onGloballyPositioned {
            position.value = it
                .boundsInParent() // これね
                .roundToIntRect()
        }
        // ドラッグで移動
        .pointerInput(Unit) {
            detectDragGestures { change, dragAmount ->
                change.consume()
                offset.value = IntOffset(
                    x = (offset.value.x + dragAmount.x).toInt(),
                    y = (offset.value.y + dragAmount.y).toInt()
                )
            }
        }
)
```

![Imgur](https://i.imgur.com/VBoKakT.png)

# 最終手段
先に答えを出すと、はみ出しているコンポーネントで`Modifier.onGloballyPositioned { }`を使って、`LayoutCoordinates`をもらいます。  
次に、座標が欲しいコンポーネントの`Modifier.onGloballyPositioned { }`でも、`LayoutCoordinates`をもらいます。  
最後に、はみ出している`LayoutCoordinates`で`localBoundingBoxOf()`を呼び出し、引数に座標が欲しいコンポーネントの方の`LayoutCoordinates`を入れると、はみ出しているコンポーネントからみた座標が取れます。  

説明難しいのでコード見て。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            JetpackComposeGlobalPositionOutViewTheme {
                HomeScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen() {
    // コンポーネントの座標
    val position = remember { mutableStateOf(IntRect.Zero) }
    // ドラッグで移動
    val offset = remember { mutableStateOf(IntOffset(0, 0)) }
    // 横に長いコンポーネントの LayoutCoordinates
    // 画面外にいるコンポーネントの座標の取得に必要
    val longComponentLayoutCoordinates = remember { mutableStateOf<LayoutCoordinates?>(null) }

    Scaffold(
        topBar = { TopAppBar(title = { Text(text = "JetpackComposeGlobalPositionOutView") }) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .fillMaxSize()
        ) {

            // 横にスクロールできるように
            // スクロールといえばレッツノート
            Box(
                modifier = Modifier
                    .weight(1f)
                    .horizontalScroll(rememberScrollState())
            ) {

                // 横に長ーーーいコンポーネントを置く
                Box(
                    modifier = Modifier
                        .fillMaxHeight()
                        .requiredWidth(3000.dp)
                        .onGloballyPositioned { longComponentLayoutCoordinates.value = it }
                ) {

                    // スクロール出来てるか確認用に文字を横にズラーッと並べる
                    Row {
                        (0 until 50).forEach {
                            Text(
                                modifier = Modifier.weight(1f),
                                text = it.toString()
                            )
                        }
                    }

                    if (longComponentLayoutCoordinates.value != null) {
                        Box(
                            modifier = Modifier
                                .size(100.dp)
                                .offset { offset.value }
                                .background(Color.Red)
                                // コンポーネントの座標
                                .onGloballyPositioned {
                                    // 横に長いコンポーネントから見た座標を取り出す
                                    // localBoundingBoxOf 参照
                                    position.value = longComponentLayoutCoordinates.value!!
                                        .localBoundingBoxOf(it)
                                        .roundToIntRect()
                                }
                                // ドラッグで移動
                                .pointerInput(Unit) {
                                    detectDragGestures { change, dragAmount ->
                                        change.consume()
                                        offset.value = IntOffset(
                                            x = (offset.value.x + dragAmount.x).toInt(),
                                            y = (offset.value.y + dragAmount.y).toInt()
                                        )
                                    }
                                }
                        )
                    }
                }
            }

            Text(
                text = """
                    left = ${position.value.left}
                    top = ${position.value.top}
                    right = ${position.value.right}
                    bottom = ${position.value.bottom}
                """.trimIndent()
            )
        }
    }
}
```

画面外にスクロールしましたが、ちゃんと座標が残ったままです！  

![Imgur](https://i.imgur.com/hJ1ZVFU.png)

## 何をしているのか
`boundsInRoot()`の中身をちょっと見てちょっとだけ分かった気がする。  

`LayoutCoordinates`てのがサイズを測った結果の何からしいんだけど、これに`localBoundingBoxOf()`って関数があって、  
引数に別のコンポーネントの`LayoutCoordinates`を渡すとそいつの座標が返ってくる。

`boundsInRoot()`は任意の`LayoutCoordinates`から根っこのコンポーネントの`LayoutCoordinates`が取れるまで再帰的に探して（親の`LayoutCoordinates`が取れるので）、  
そのあと`LayoutCoordinates#localBoundingBoxOf`を呼び出して根っこから見た座標を取っているらしい。  

が、別に今回は根っこのコンポーネントじゃなくて任意のコンポーネントの`LayoutCoordinates`でいいので、基準とするコンポーネントの`LayoutCoordinates`を`Modifier.onGloballyPositioned { }`で取って使ってる。

ただ、このレイアウト構造だと`boundsInParent()`とやってること変わらないのでどっち使っても変化はないです。はい。  
複雑なレイアウトだと役に立つかも！

# ソースコード
https://github.com/takusan23/JetpackComposeGlobalPositionOutView

# おわりに
スクロール出来てかつ、ドラッグアンドドロップを使った時に`onGloballyPositioned`動かなくてハマった。ので書きました。  
もっといい方法があったらごめん。