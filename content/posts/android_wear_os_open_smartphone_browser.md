---
title: Wear OS からスマホのブラウザを開く
created_at: 2022-11-04
tags:
- Android
- WearOS
- Kotlin
---

この場合はスマホ側のアプリを作る必要はないです。

# 本題
Wear OS からスマホのブラウザを開きたい場合は、スマホ側のアプリを作る必要はないよって話

# つくる

## build.gradle
ライブラリを入れます

```gradle
implementation("androidx.wear:wear-remote-interactions:1.0.0")
```

## てきとうに

`RemoteActivityHelper(context).startRemoteActivity`でブラウザに向けた`Intent`を飛ばすことで開くことが出来ます。  
別に`Jetpack Compose`である必要もないです。

```kotlin
Box(
    modifier = Modifier.fillMaxSize(),
    contentAlignment = Alignment.Center
) {
    val context = LocalContext.current
    Chip(
        label = { Text(text = "スマホで開く") },
        secondaryLabel = { Text(text = "ブラウザが開きます") },
        onClick = {
            // スマートフォンのブラウザを開く
            RemoteActivityHelper(context).startRemoteActivity(
                Intent(Intent.ACTION_VIEW, "https://takusan.negitoro.dev/".toUri()).apply {
                    // 多分いる
                    addCategory(Intent.CATEGORY_BROWSABLE)
                },
            )
        },
    )
}
```

![Imgur](https://imgur.com/5xMHMlr.png)

## 利用例

ソースコードに飛ばすなど

![Imgur](https://imgur.com/pOVWDbG.png)

以上です、お疲れ様でした 8888