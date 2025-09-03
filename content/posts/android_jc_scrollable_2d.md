---
title: Jetpack Compose で縦横ななめスクロール
created_at: 2025-09-04
tags:
- Android
- Kotlin
- JetpackCompose
---
どうもこんばんわ。ネタ無いので記録として書いておきます、  
健康診断行った結果が帰ってきました、`ALT`が再検査とか書いてあります。なんすかこれ  

あとは、`A`→`C12`になったせいなのかコメント欄がいっぱい書いてあります、  
まあそもそもこんなくっそ暑い中、**水すらも飲めない**状態で行ったら不健康診断になるだろうがよ！！！！！！！！！！

# 本題
`Jetpack Compose`でできた、表みたいな`UI`で**縦横斜め方向**にスクロールできるようにしてみます。  
`verticalScroll()`と`horizontalScroll()`を両方兼ね備えた的なやつ。

![表](https://oekakityou.negitoro.dev/resize/10225423-79f4-4c00-8d32-5d603bbd6e64.png)

動画編集アプリのタイムラインとかで使えそうですね（**使います！！**）

<video src="https://github.com/takusan23/JetpackComposeScrollable2D/raw/refs/heads/master/sample/scroll2d_2.mp4" width="80%" controls></video>

そのうち入れます！  
https://play.google.com/store/apps/details?id=io.github.takusan23.akaridroid

# 先に答え
説明は後、`Modifier.verticalScroll()`は**スクロールジェスチャー検出 + スクロールに合わせて描画をずらす**機能があります。  
が、が、が  
今のところ`Modifier.scrollable2D()`には**スクロールジェスチャー検出**機能しかありません、よって**自前でずらす必要**があります。

```kotlin
val offset = remember { mutableStateOf(Offset.Zero) }
val size = remember { mutableStateOf(IntSize.Zero) }
Box(
    modifier = Modifier // あとは fillMaxSize() するとか
        .clipToBounds()
        .scrollable2D(state = rememberScrollable2DState { delta ->
            // これをしないと見えないスクロール（スクロールしても UI がなかなか反映されない）が起きる
            val newX = (offset.value.x + delta.x).toInt().coerceIn(-size.value.width..0)
            val newY = (offset.value.y + delta.y).toInt().coerceIn(-size.value.height..0)
            offset.value = Offset(newX.toFloat(), newY.toFloat())
            // TODO 今回は面倒なのでネストスクロールを考慮していません。
            // TODO 本来は利用した分だけ return するべきです
            delta
        })
        .layout { measurable, constraints ->
            // ここを infinity にすると左端に寄ってくれる
            val childConstraints = constraints.copy(
                maxHeight = Constraints.Infinity,
                maxWidth = Constraints.Infinity,
            )
            // この辺は全部 Scroll.kt のパクリ
            val placeable = measurable.measure(childConstraints)
            val width = placeable.width.coerceAtMost(constraints.maxWidth)
            val height = placeable.height.coerceAtMost(constraints.maxHeight)
            val scrollHeight = placeable.height - height
            val scrollWidth = placeable.width - width
            size.value = IntSize(scrollWidth, scrollHeight)
            layout(width, height) {
                val scrollX = offset.value.x.toInt().coerceIn(-scrollWidth..0)
                val scrollY = offset.value.y.toInt().coerceIn(-scrollHeight..0)
                val xOffset = scrollX
                val yOffset = scrollY
                withMotionFrameOfReferencePlacement {
                    placeable.placeRelativeWithLayer(xOffset, yOffset)
                }
            }
        }
    ) {
    // ここに縦横にはみ出すレイアウト
}
```

# 2025.08.00
連続で体温超え、っていうかお熱。するとかどーなってんだよおい。暑すぎる。`Google Pixel`が毎日`熱中症警戒アラート`出してる。

`JetpackCompose`のこのバージョンから縦横斜め方向にスクロールした分を取得できる`Modifier`が追加されました。  
`Modifier.scrollable2D()`ですね。

```kotlin
Modifier.scrollable2D(rememberScrollable2DState { delta ->
    delta
})
```

`delta`が移動した分で、**あとは自分でスクロール分のオフセットを調整していくだけ。**  
・・・

どうやら**斜め方向のジェスチャー登録**までで、**スクロール分だけオフセットを調整して表示する**機能はないらしい。ええ

# 環境
一応書いておくか

|                     |                                                |
|---------------------|------------------------------------------------|
| 端末                | Pixel 8 Pro                                    |
| Android             | 16 QPR 2                                       |
| Jetpack Compose Bom | 2025.08.00                                     |
| Android Studio      | Android Studio Narwhal 3 Feature Drop 2025.1.3 |

# 例
こんな感じに縦横に数字を敷き詰めるようにしてみました。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            JetpackComposeScrollable2DTheme {
                MainScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MainScreen() {
    Scaffold(
        topBar = {
            TopAppBar(title = { Text(text = stringResource(R.string.app_name)) })
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            for (i in 0..10) {
                Row {
                    for (j in 0..10) {
                        NumberSquare(number = i * 10 + j)
                    }
                }
            }
        }
    }
}

@Composable
private fun NumberSquare(
    modifier: Modifier = Modifier,
    number: Int
) {
    Box(
        modifier = modifier
            .border(1.dp, Color.Black)
            .size(100.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = number.toString(),
            fontSize = 20.sp
        )
    }
}
```

# つくる
といっても`Modifier.verticalScroll()`のコードをパクって、`Modifier.scrollable2D()`で動くように直しただけなのであんまり追求しないでください、

`rememberScrollable2DState { }`のコールバックで移動した分がもらえるので、`offset.value`で累積していきます。  
ここで勢いよくスクロールしたときに備えて、`-size.value.width .. 0`の範囲内でしか値が帰ってこないように制限します。`Kotlin`便利。  
仮に勢いよくの制限がないと、いくらスクロールしても戻ってこれなくなります（範囲外に行ったので、範囲内に戻ってくるまで描画は無反応...）

`rememberScrollable2DState { }`の関数はちゃんと`Offset`を返す必要がありますが、今回は別にネストスクロールしていないので諦めました。

`layout { }`は`Modifier.verticalScroll()`の中を見てパクっただけなのよく分かっていません（）。  
`Constraints.Infinity`にするとはみ出させられるんだ～～くらいしか分かってません。

ちなみにこの辺です、てかまんまそう  
https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/foundation/foundation/src/commonMain/kotlin/androidx/compose/foundation/Scroll.kt

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MainScreen() {

    val offset = remember { mutableStateOf(Offset.Zero) }
    val size = remember { mutableStateOf(IntSize.Zero) }

    Scaffold(
        topBar = { TopAppBar(title = { Text(text = stringResource(R.string.app_name)) }) }
    ) { paddingValues ->
        Column(
            modifier = Modifier

                .fillMaxSize()
                .padding(paddingValues)

                .clipToBounds()
                .scrollable2D(state = rememberScrollable2DState { delta ->
                    // これをしないと見えないスクロール（スクロールしても UI がなかなか反映されない）が起きる
                    val newX = (offset.value.x + delta.x).toInt().coerceIn(-size.value.width..0)
                    val newY = (offset.value.y + delta.y).toInt().coerceIn(-size.value.height..0)
                    offset.value = Offset(newX.toFloat(), newY.toFloat())
                    // TODO 今回は面倒なのでネストスクロールを考慮していません。
                    // TODO 本来は利用した分だけ return するべきです
                    delta
                })
                .layout { measurable, constraints ->
                    // ここを infinity にすると左端に寄ってくれる
                    val childConstraints = constraints.copy(
                        maxHeight = Constraints.Infinity,
                        maxWidth = Constraints.Infinity,
                    )
                    // この辺は全部 Scroll.kt のパクリ
                    val placeable = measurable.measure(childConstraints)
                    val width = placeable.width.coerceAtMost(constraints.maxWidth)
                    val height = placeable.height.coerceAtMost(constraints.maxHeight)
                    val scrollHeight = placeable.height - height
                    val scrollWidth = placeable.width - width
                    size.value = IntSize(scrollWidth, scrollHeight)
                    layout(width, height) {
                        val scrollX = offset.value.x.toInt().coerceIn(-scrollWidth..0)
                        val scrollY = offset.value.y.toInt().coerceIn(-scrollHeight..0)
                        val xOffset = scrollX
                        val yOffset = scrollY
                        withMotionFrameOfReferencePlacement {
                            placeable.placeRelativeWithLayer(xOffset, yOffset)
                        }
                    }
                }


        ) {
            for (i in 0..10) {
                Row {
                    for (j in 0..10) {
                        NumberSquare(number = i * 10 + j)
                    }
                }
            }
        }
    }
}
```

# 完成

<video src="https://github.com/takusan23/JetpackComposeScrollable2D/raw/refs/heads/master/sample/scroll2d_1.mp4" width="80%" controls></video>

# ソースコード
どーぞ

https://github.com/takusan23/JetpackComposeScrollable2D

以上です、おつ 888

# おわりに
`rememberScrollable2DState { delta -> }`の`delta`をスクロールしたいコンポーネントに、  
`Modifier.offset`すればいいじゃんって思いましたが普通に動きませんでした。