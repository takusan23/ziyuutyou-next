---
title: Jetpack ComposeのTabRowのインジケータの角を丸く
created_at: 2021-06-13
tags:
- Android
- Kotlin
- JetpackCompose
---

どうもこんばんわ。

# 本題
最近のマテリアルデザインにあるタブの下の選択中を示す棒の端っこが丸いやつをやりたい。  
ちなみにこれはPlayStore。オープンソースライセンス見るとComposeの文字が...？

![Imgur](https://imgur.com/DS6aAR4.png)

# コード

```kotlin
@Composable
fun RoundedIndicatorTabRow() {
    val selectIndex = remember { mutableStateOf(0) }
    TabRow(
        selectedTabIndex = selectIndex.value,
        contentColor = MaterialTheme.colors.primary,
        backgroundColor = MaterialTheme.colors.background,
        indicator = { tabPositions ->
            // テキストの下に出るあの棒のやつ
            Box(
                modifier = Modifier
                    .tabIndicatorOffset(tabPositions[selectIndex.value])
                    .height(3.dp)
                    .padding(start = 20.dp, end = 20.dp)
                    .background(LocalContentColor.current, RoundedCornerShape(100, 100, 0, 0))
            )
        }
    ) {
        Tab(
            selected = 0 == selectIndex.value,
            modifier = Modifier.padding(5.dp),
            onClick = { selectIndex.value = (0) },
            content = {
                Text(text = "ホーム")
            }
        )
        Tab(
            selected = 1 == selectIndex.value,
            modifier = Modifier.padding(5.dp),
            onClick = { selectIndex.value = (1) },
            content = {
                Text(text = "通知")
            }
        )
        Tab(
            selected = 2 == selectIndex.value,
            modifier = Modifier.padding(5.dp),
            onClick = { selectIndex.value = (1) },
            content = {
                Text(text = "お気に入り")
            }
        )
        Tab(
            selected = 3 == selectIndex.value,
            modifier = Modifier.padding(5.dp),
            onClick = { selectIndex.value = (1) },
            content = {
                Text(text = "設定")
            }
        )
    }

}
```

以上です。お疲れさまでした。

![Imgur](https://imgur.com/ibFilId.png)