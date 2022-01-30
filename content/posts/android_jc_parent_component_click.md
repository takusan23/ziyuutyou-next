---
title: JetpackComposeで親のコンポーネントでもクリックイベントがほしい
created_at: 2022-01-30
tags:
- Android
- JetpackCompose
---

どうもこんばんわ。  
どうでもいいんですけどNext.jsで作り直したこのサイト、Googleに無事嫌われている模様

![Imgur](https://imgur.com/UD5eqeu.png)

![Imgur](https://imgur.com/JQOKdAD.png)

# 本題
JetpackComposeで子コンポーネントでクリックされると親のコンポーネントではタッチイベントが貰えません。  
子コンポーネントで消費されても親コンポーネントでクリックイベントが来てほしい。

ので作った

# 環境

| なまえ         | あたい     |
|----------------|------------|
| Android        | 12         |
| Android Studio | Bumblebee  |
| Kotlin         | 1.6.10     |
| Compose        | 1.1.0-rc03 |

# 作る

## ParentPointerEvent.kt
ファイル名は何でもいいですがとりあえず一つKtを作成します。

そして中身はこれ(ごめんコメント部分はあってるかどうか分からん)

```kotlin
/**
 * 子要素でタップが消費の有無に関わらず親要素へタッチイベントが行くようにしたもの
 *
 * @param onTap 押したとき
 * */
suspend fun PointerInputScope.detectParentComponentTapGestures(onTap: ((Offset) -> Unit)? = null) = coroutineScope {
    forEachGesture {
        awaitPointerEventScope {
            // awaitPointerEvent を使うことでクリックが消費されてるかどうか関係なくクリックイベントを待機
            awaitPointerEvent()
            var upOrCancel: PointerInputChange? = null
            try {
                upOrCancel = withTimeout(Long.MAX_VALUE / 2) {
                    // ここでタップ判定をしている。長押しとか画面外タッチはnullになる
                    waitForUpIgnoreOrCancellation()
                }
                upOrCancel?.consumeDownChange()
            } catch (_: PointerEventTimeoutCancellationException) {
                consumeUntilUp()
            }
            if (upOrCancel != null) {
                onTap?.invoke(upOrCancel.position)
            }
        }
    }
}

/**
 * クリックするかキャンセルするまで一時停止する。
 * [AwaitPointerEventScope.waitForUpOrCancellation]では他でクリックイベントが消費されたらキャンセルされますが、
 * これはクリックイベントの消費されていてもキャンセル扱いしません。
 *
 * @return クリックしたら[PointerInputChange]。ドラッグ操作やキャンセルならnull
 * */
private suspend fun AwaitPointerEventScope.waitForUpIgnoreOrCancellation(): PointerInputChange? {
    while (true) {
        val event = awaitPointerEvent(PointerEventPass.Main)
        // クリックイベントが消費されてもされてなくてもいいやつ
        if (event.changes.all { it.changedToUpIgnoreConsumed() }) {
            // All pointers are up
            return event.changes[0]
        }

        if (event.changes.any { it.consumed.downChange || it.isOutOfBounds(size, extendedTouchPadding) }) {
            return null // Canceled
        }

        // Check for cancel by position consumption. We can look on the Final pass of the
        // existing pointer event because it comes after the Main pass we checked above.
        val consumeCheck = awaitPointerEvent(PointerEventPass.Final)
        if (consumeCheck.changes.any { it.positionChangeConsumed() }) {
            return null
        }
    }
}

/** クリックイベントをすべて消費する */
private suspend fun AwaitPointerEventScope.consumeUntilUp() {
    do {
        val event = awaitPointerEvent()
        event.changes.forEach { it.consumeAllChanges() }
    } while (event.changes.any { it.pressed })
}
```

# これの使い方

親要素でもクリックイベントがほしい！！！ときにさっき書いたやつを使います

```kotlin
class MainActivity : ComponentActivity() {

    @OptIn(ExperimentalMaterialApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            // 親要素を押したときの時間
            var parentClickTime by remember { mutableStateOf(0L) }
            // ボタンを押したときの時間
            var buttonClickTime by remember { mutableStateOf(0L) }

            MaterialTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colors.background
                ) {

                    Column {
                        Text(text = "親要素押したとき：${parentClickTime.toTimeFormat()}")
                        Text(text = "子要素押したとき：${buttonClickTime.toTimeFormat()}")

                        // 適当な広さの親要素を作成
                        Box(
                            modifier = Modifier
                                .size(200.dp)
                                .background(Color.LightGray)
                                .pointerInput(Unit) {
                                    // 親要素だけどクリックイベントと5000兆円ほしい！！！
                                    detectParentComponentTapGestures {
                                        parentClickTime = System.currentTimeMillis()
                                    }
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Button(onClick = { buttonClickTime = System.currentTimeMillis() }) {
                                Text(text = "おせ！")
                            }
                        }
                    }
                }
            }
        }
    }

    /** ミリ秒UnixTimeを日付フォーマットへ変換する拡張関数 */
    fun Long.toTimeFormat(): String? {
        val simpleDateFormat = SimpleDateFormat("HH:mm:ss.SSS", Locale.getDefault())
        return simpleDateFormat.format(this)
    }

}
```

# 実際に起動させるとこんな感じになるはず

- 親要素(灰色の部分)だけクリックした場合
    - 親要素押したときの時間だけが更新される

![Imgur](https://imgur.com/3eM10f8.png)

- ボタンも押した場合
    - 親要素押したとき、子要素押したとき両方の時間が更新される

![Imgur](https://imgur.com/2V1N7ey.png)

## 仕組み的ななにか
`PointerInputScope.detectTapGestures`をほぼパクって作りました

```kotlin
Box(
    modifier = Modifier
        .pointerInput(Unit) {
            // ↓これの中身をほとんどパクって作った
            detectTapGestures(onTap = {
                
            })
        },
    contentAlignment = Alignment.Center
) { }
```

`PointerInputScope.detectTapGestures`から、

まだ消費されていないクリックイベントが来るまで待機サスペンド関数

を 消費されていてもクリックイベントが来るまで待つサスペンド関数 へ書き換えることで動かしています。

- 最初の`awaitFirstDown()`を`awaitPointerEvent()`にすることで消費されていてもいいクリックイベントが来るまで待機
- 上記の理由から`event.changes.fastAll { it.changedToUp() }` を `event.changes.all { it.changedToUpIgnoreConsumed() }`にしました
- onTap 以外は使わないので削除

# 終わりに
ソースコードです。

https://github.com/takusan23/JetpackComposeParentClickEvent