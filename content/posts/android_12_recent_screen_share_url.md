---
title: Hello Android 12。アプリ履歴からURL共有機能
created_at: 2021-07-21
tags:
- Android
- Android12
- Kotlin
---
どうもこんばんわ。  
私のPixel 3 XLくん、最近充電が一時的に無効になってますで進まない時があるんだけど大丈夫なのかな。

# 本題
Android 12から最近のアプリ履歴画面からWebページのURLを共有できる機能が追加されて、ドキュメントに実装方法が追加されたので見てみる

![Imgur](https://i.imgur.com/WxaAUa0.png)

# ドキュメント
https://developer.android.com/about/versions/12/features#recents-url-sharing

# 環境
| なまえ  | あたい    |
|---------|-----------|
| Android | 12 Beta 3 |
| Pixel   | 3 XL      |
| 言語    | Kotlin    |

# 実装方法
見て見る感じ、Android 12から追加されたAPIを使っているわけではない模様。

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }

    override fun onProvideAssistContent(outContent: AssistContent?) {
        super.onProvideAssistContent(outContent)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // ここでURLを指定する
            outContent?.webUri = "https://takusan.negitoro.dev/".toUri()
        }
    }

}
```

## URL共有ボタンを非表示にしたいときは
多分`AssistContent#setWebUri()`に`null`を入れればいいと思う。

```kotlin
class MainActivity : AppCompatActivity() {

    private val button by lazy { findViewById<Button>(R.id.button) }

    private var isURLShare = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        button.setOnClickListener {
            // フラグ切り替え
            isURLShare = !isURLShare
        }

    }

    override fun onProvideAssistContent(outContent: AssistContent?) {
        super.onProvideAssistContent(outContent)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // ここでURLを指定する
            outContent?.webUri = if (isURLShare) {
                "https://takusan.negitoro.dev/".toUri()
            } else {
                null
            }
        }
    }

}
```

# ソースコード
https://github.com/takusan23/Android12RecentScreenURLShare

# 終わりに
Android 12 Beta3ってことはこれ以降APIの追加って無いってこと？