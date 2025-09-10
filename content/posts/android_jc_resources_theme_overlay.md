---
title: Jetpack Compose で他の構成の Resources を使いたい
created_at: 2025-09-10
tags:
- Android
- JetpackCompose
- Kotlin
---
どうもこんばんわ。  
`Xperia 1 VII`の交換面倒だからって後回しにしてたらついにハガキ来た。  
いや、いい加減いかないとまずいと思って、今、交換機の入荷待ちなのよね。`メッセージR`（←え?!??!!!?）で連絡が来るとかなんとか

数日後にはショートメールも来た。2回目くらい。

![sms](https://oekakityou.negitoro.dev/resize/202ffa86-3917-477e-b5ba-4c1c3cb0ad02.png)

# 本題
ブラウザのシークレットモードって`UI`がライトテーマでも、シークレット感を出すため？なのか、無理やりダークモードになりますよね。  
こーゆーのを実装するの、テーマによらず常にそれ用の色を当てる真面目な方法がありますが、もう一つ、**すでにあるダークテーマを無理やり適用する**事もできます。

`JetpackCompose`で`Context#createConfigurationContext`を使いたい。  
返り値の、無理やりダークモードにした`Resouces`をなんとか適用したい。

無理やりすれば`colors.xml`もそれ用になるし、言語を無理やり変えればその言語の`strings.xml`になります。

# 大昔に書いた記事の JetpackCompose リメイク

https://takusan.negitoro.dev/posts/android_app_language_change/

これを`JetpackCompose`でうまく使う方法を思いつきました。ここに書きます。  
（というか`JetpackCompose`の`stringResource()`コード眺めたたら見つけた）

# 環境
`Jetpack Compose BOM 2025.08.00`が必要です

| なまえ         | あたい                                         |
|----------------|------------------------------------------------|
| Android Studio | Android Studio Narwhal 3 Feature Drop 2025.1.3 |
| 端末           | Pixel 8 Pro                                    |

# 答え

![result](https://oekakityou.negitoro.dev/resize/ed5005ab-02ae-429a-b4af-275372f4946d.png)

`2025.08.00 ?`から`LocalResources`って`Composition Local`ができました。  
今までは`LocalContext.current.resources`してアクセスしていましたが、いまは出来た方を使ってるはず？

で、その`LocalResources`の値を`CompositionLocalProvider { }`で上書きしちゃえば、`Context#createConfigurationContext`で出来た`Resouces`が`JetpackCompose`でも使える！！

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            LocelResourcesDarkTheme {
                MainScreen()
            }
        }
    }
}

@Composable
private fun MainScreen() {
    val context = LocalContext.current
    val configuration = LocalConfiguration.current

    // Resources を作る
    // 多分本来は Context を作るものだが、Context は上書きしたくないので、Resources だけ取得する
    val newResources = context.createConfigurationContext(Configuration(configuration).apply {
        uiMode = Configuration.UI_MODE_NIGHT_YES
    }).resources

    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->

        Column(
            modifier = Modifier
                .padding(innerPadding)
                .background(Color.Red)
        ) {


            CompositionLocalProvider(LocalResources provides newResources) {
                // colorResource 等は今の LocalResources を参照するので
                Text(
                    text = "Resources 上書き",
                    color = colorResource(R.color.text_color)
                )
            }

            Text(
                text = "Resources もともと",
                color = colorResource(R.color.text_color)
            )

        }
    }
}
```

違いがわかるように`values/colors.xml (ライトテーマ)`と`values-night/colors.xml (ダークテーマ)`にそれぞれ別の色を当てます。

```xml
<color name="text_color">@android:color/black</color>
```

```xml
<color name="text_color">@android:color/white</color>
```

![colors.xml](https://oekakityou.negitoro.dev/original/2d8b4d56-54b3-4252-88ec-f8c5eefdea16.png)

# よくある質問
`LocalContext`を`CompositionLocalProvider { }`で上書きすれば、過去バージョでも動くじゃん。

↓

それだと、`LocalContext.current as Activity`が**利用できなくなります。**  
`Context#createConfigurationContext`で返ってきた`Context`は、たとえ元々が`Activity`でも、`android.app.ContextImpl`が返され、もちろん`instanceof Activity`は`false`を返します。

# おわりに
`Xperia 1 VII`はやく来てほしいです