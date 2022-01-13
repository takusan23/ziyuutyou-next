---
title: Jetpack Composeでも背景押したらTextFieldのフォーカスを外す
created_at: 2021-10-16
tags:
- Android
- JetpackCompose
- Kotlin
---

#DroidKaigiの荷物届きました。ドロイド君かわいい

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">ドロイド君かわいい<a href="https://twitter.com/hashtag/DroidKaigi?src=hash&amp;ref_src=twsrc%5Etfw">#DroidKaigi</a> <a href="https://t.co/zKheIh1M6F">pic.twitter.com/zKheIh1M6F</a></p>&mdash; たくさん (@takusan__23) <a href="https://twitter.com/takusan__23/status/1448877475254079488?ref_src=twsrc%5Etfw">October 15, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Android Developersのシール、貴重では

# コード

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ReleaseTextFieldFocusTheme {
                // A surface container using the 'background' color from the theme
                Surface(color = MaterialTheme.colors.background) {

                    // 親コンポーネントにフォーカスを移動させるのに使う
                    val focusRequester = remember { FocusRequester() }
                    val interactionSource = remember { MutableInteractionSource() }

                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .clickable(
                                interactionSource = interactionSource,
                                enabled = true,
                                indication = null,
                                onClick = { focusRequester.requestFocus() } // 押したら外す
                            )
                            .focusRequester(focusRequester) // フォーカス操作するやつをセット
                            .focusTarget(), // フォーカス当たるように
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {

                        val text = remember { mutableStateOf("") }

                        OutlinedTextField(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(10.dp),
                            value = text.value,
                            label = { Text(text = "フォーカス外すサンプル") },
                            onValueChange = { text.value = it }
                        )

                    }

                }
            }
        }
    }
}
```

`Modifier.clickable()`の引数が多い理由はRipple効果を無くすためです。  
以上です。お疲れさまでした。