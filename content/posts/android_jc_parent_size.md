---
title: Jetpack Composeで一番大きいコンポーネントにすべて合わせたい
created_at: 2021-10-23
tags:
- Android
- Kotlin
- JetpackCompose
---
どうもこんばんわ。  
無線LAN子機を買い替えたら`Gradle sync`でコケなくなりました。今まではライブラリ拾ってくるところでよくコケてたので...

# 本題
一番大きいコンポーネントにすべて合わせたい。

![Imgur](https://i.imgur.com/cXiFrne.png)

# 作り方

```kotlin
@Composable
fun ParentDynamicWidth() {
    Column(modifier = Modifier.width(IntrinsicSize.Max)) {
        Button(
            onClick = { },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(text = "Jetpack Compose")
        }
        Button(
            onClick = { },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(text = "Android")
        }
        Button(
            onClick = { },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(text = "Kotlin ")
        }
    }
}
```

親要素に`Modifier.width(IntrinsicSize.Max)`を付けて、子要素には`Modifier.fillMaxWidth()`を付けてあげます。

![Imgur](https://i.imgur.com/GAwVnRH.png)

# 終わりに
そろそろ寝たいのでここらへんで失礼します。

# 参考リンク
https://stackoverflow.com/questions/66458270/modifier-wrapcontentwidth-vs-modifier-widthintrinsicsize-max-in-android-jetp