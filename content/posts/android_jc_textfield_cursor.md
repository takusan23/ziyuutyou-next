---
title: Jetpack Compose の TextField でカーソルの位置変更
created_at: 2022-03-10
tags:
- Android
- Kotlin
- JetpackCompose
---
どうもこんばんわ。  
自分用メモ。あの文字入力中のカーソル？点滅してるやつってキャレットって言うらしいですよ？

# 本題

Jetpack Compose でテキストフィールドのカーソルの位置はどこで変更できるの

## こたえ

`String`ではなく`TextFieldValue`を引数に取る`TextField`を利用すると、  
`TextFieldValue`経由でカーソルの位置を変更できます。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TextFieldCursorPosTheme {
                // A surface container using the 'background' color from the theme
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colors.background) {

                    val textFieldValue = remember { mutableStateOf(TextFieldValue()) }

                    LaunchedEffect(key1 = textFieldValue.value.text, block = {
                        val textBoxValue = textFieldValue.value.text
                        // ここで文字変更時のイベントが取れるよ...
                    })

                    Column(
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        OutlinedTextField(
                            value = textFieldValue.value,
                            onValueChange = { textFieldValue.value = it }
                        )

                        // カーソルを最後に持っていく
                        Button(onClick = { textFieldValue.value = textFieldValue.value.copy(selection = TextRange(textFieldValue.value.text.length)) }) {
                            Text(text = "最後へ")
                        }

                        // カーソルを最初に持っていく
                        Button(onClick = { textFieldValue.value = textFieldValue.value.copy(selection = TextRange(0)) }) {
                            Text(text = "最初へ")
                        }

                    }

                }
            }
        }
    }
}
```

ただこれを利用すると、カーソルを動かすたびに`onValueChange = { }`が呼ばれるので、
今まで通りに文字変更時だけ呼ばれるようにしたい場合は`LaunchedEffect`の`key`に入れれば良いんじゃないかと思いました。

## 利用例
検索であるサジェスト（テキスト補充のやつ）とかで使えるんじゃないかと思いました

```
class MainActivity : ComponentActivity() {

    private val ALL_LIST = listOf(
        "Android 12",
        "Android 13 DP",
        "Android JetpackCompose",
        "Android Room",
        "Android LiveData",
        "Android ViewModel",
    )

    @OptIn(ExperimentalMaterialApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TextFieldCursorPosTheme {
                // A surface container using the 'background' color from the theme
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colors.background) {
                    // サジェスト一覧
                    val suggestList = remember { mutableStateListOf<String>() }
                    // 入力欄の文字
                    val textFieldValue = remember { mutableStateOf(TextFieldValue()) }
                    // 文字だけ変更検知
                    LaunchedEffect(key1 = textFieldValue.value.text, block = {
                        suggestList.clear()
                        suggestList.addAll(ALL_LIST.filter { it.contains(textFieldValue.value.text) })
                    })
                    Column(modifier = Modifier.padding(10.dp)) {
                        OutlinedTextField(
                            value = textFieldValue.value,
                            onValueChange = { textFieldValue.value = it }
                        )
                        LazyColumn(content = {
                            items(suggestList) { suggestText ->
                                Surface(
                                    onClick = {
                                        textFieldValue.value = textFieldValue.value.copy(
                                            text = suggestText,
                                            selection = TextRange(suggestText.length) // 押したらカーソルを最後に移動
                                        )
                                    }
                                ) { Text(modifier = Modifier.padding(10.dp), text = suggestText) }
                            }
                        })
                    }
                }
            }
        }
    }
}
```

![Imgur](https://i.imgur.com/XUHFn8t.png)

### ソースコード

おいておきます

https://github.com/takusan23/TextFieldCursorPos

## おわりに

```kotlin
TextFieldValue(
    text = "入力中文字",    // 入力している文字
    selection = TextRange(0),   // カーソルの位置情報、もしくは長押しで文字を範囲指定した際の位置情報
    composition = null // 変換前テキストがある場合はその範囲。nullを入れると確定になる（文字入力中のボーダーラインが消える）
)
```

花粉やばい