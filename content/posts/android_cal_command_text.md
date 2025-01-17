---
title: Android でカレンダーを表示する最短ルート
created_at: 2024-09-12
tags:
- Android
- Kotlin
---

`Google`で一分くらい調べたけど誰もやってなかった

# cal コマンドを叩いて表示
カレンダーを何でもいいので表示させたかったんだけど、縦横グリッドを作って、、、みたいな正攻法だと普通にしんどいと思った。  
そこで、`Runtime.getRuntime().exec("cal")`した結果を`TextView`とか`Text()`で表示すればいいんじゃないかと。飾り気は無いけどとにかく表示はできる。

これ

![Imgur](https://i.imgur.com/J8arIyY.png)

# 環境
攻略の鍵は等幅フォントです

| なまえ         | あたい                        |
|----------------|-------------------------------|
| Android Studio | Android Studio Koala 2024.1.1 |
| たんまつ       | Xperia 1 V                    |

# JetpackCompose
`Text()`を好きなところにおいて、`fontFamily`を`FontFamily.Monospace`にすると等幅フォントになります。  
あと`exec()`の使い方があってるのかは知らん。  
こんな感じです。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            CalenderCommandTextTheme {
                MainScreen()
            }
        }
    }
}

// TODO Util クラスとかに置く
private fun execCalenderCommand(): String {
    val process = Runtime.getRuntime().exec("cal")
    val printText = process.inputStream.bufferedReader().readText()
    process.destroy()
    return printText
}

@Composable
private fun MainScreen() {
    val calenderCommand = remember { mutableStateOf("") }

    LaunchedEffect(key1 = Unit) {
        calenderCommand.value = execCalenderCommand()
    }

    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            Text(
                text = calenderCommand.value,
                fontFamily = FontFamily.Monospace // 等幅フォントにする
            )
        }
    }
}
```

![Imgur](https://i.imgur.com/guRhfEB.png)

# View
`<TextView>`を好きなところにおいて、等幅フォントを指定します。これも`fontFamily`で`monospace`を指定することで等幅フォントです。  
以下のコードでは`ViewBinding`を使ってますが別になくてもいいです。

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:gravity="center"
    android:orientation="vertical">

    <TextView
        android:id="@+id/activity_main_textview"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:fontFamily="monospace" />

</LinearLayout>
```

```kotlin
class MainActivity : ComponentActivity() { // AppCompatActivity() かも
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.activityMainTextview.text = execCalenderCommand()
    }
}

// TODO Util クラスとかに置く
private fun execCalenderCommand(): String {
    val process = Runtime.getRuntime().exec("cal")
    val printText = process.inputStream.bufferedReader().readText()
    process.destroy()
    return printText
}
```

![Imgur](https://i.imgur.com/QUNnrP4.png)

# おわりに
テキストが表示てきて、かつ等幅フォントが使える箇所なら割とどこでも使えそうこの技。  
ホーム画面のウィジェットとか。