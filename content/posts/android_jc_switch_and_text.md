---
title: Jetpack Compose でテキストを押してもスイッチを押せるようにするやつ
created_at: 2024-12-03
tags:
- Android
- JetpackCompose
- Kotlin
---
どうもこんばんわ。

# 先に答え
スイッチとラベルの`Text()`を並べてる親に`Modifier.toggleable()`をつければ良いです。

```kotlin
val isEnable = remember { mutableStateOf(false) }

// Switch
Row(
    modifier = Modifier
        .toggleable(
            value = isEnable.value,
            onValueChange = { isEnable.value = it },
            role = Role.Switch // 他にもチェックボックスとかあります
        )
        .padding(10.dp),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(10.dp)
) {
    Icon(
        painter = painterResource(id = R.drawable.akari_droid_color_icon),
        contentDescription = null
    )
    Text(
        modifier = Modifier.weight(1f),
        text = "ラベルも押せるようにしたい"
    )
    Switch(
        checked = isEnable.value,
        onCheckedChange = null // null に
    )
}

// Checkbox
Row(
    modifier = Modifier
        .toggleable(
            value = isEnable.value,
            onValueChange = { isEnable.value = it },
            role = Role.Checkbox // 他にもチェックボックスとかあります
        )
        .padding(10.dp),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(10.dp)
) {
    Icon(
        painter = painterResource(id = R.drawable.akari_droid_color_icon),
        contentDescription = null
    )
    Text(
        modifier = Modifier.weight(1f),
        text = "ラベルも押せるようにしたい"
    )
    Checkbox(
        checked = isEnable.value,
        onCheckedChange = null // null に
    )
}
```

![Imgur](https://imgur.com/wCXJqja.png)

ちゃんとキーボード入力でも操作ができます！！

![Imgur](https://imgur.com/ziDGfIk.png)

# 本題
`Jetpack Compose`の`Switch()`、本当にスイッチだけなので隣に`Text()`を置いてラベルも一緒に表示するかなと思いますが

```kotlin
val isEnable = remember { mutableStateOf(false) }

Row(
    modifier = Modifier.padding(10.dp),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(10.dp)
) {
    Icon(
        painter = painterResource(id = R.drawable.akari_droid_color_icon),
        contentDescription = null
    )
    Text(
        modifier = Modifier.weight(1f),
        text = "ラベルも押せるようにしたい"
    )
    Switch(
        checked = isEnable.value,
        onCheckedChange = { isEnable.value = it }
    )
}
```

# ラベルの部分も押したい

これだとスイッチの部分だけで、**ラベルの部分を押しても**スイッチが反映されません。

![Imgur](https://imgur.com/a0CPpXz.png)

![Imgur](https://imgur.com/kKX606U.png)

ブッブー  
これではいけませんね

https://www.nicovideo.jp/watch/sm9476405?from=30

<script type="application/javascript" src="https://embed.nicovideo.jp/watch/sm9476405/script?w=640&h=360&from=30"></script><noscript><a href="https://www.nicovideo.jp/watch/sm9476405?from=30">【元凶】必勝！面接マニュアル</a></noscript>

なので、この例だと親の`Row()`に`Modifier.clickable { isEnable.value = !isEnable.value }`をつけるといいのかなって思いますが、**これじゃない方法があったはず**、、、、思い出せないけど

```kotlin
val isEnable = remember { mutableStateOf(false) }

Row(
    modifier = Modifier
        .clickable { isEnable.value = !isEnable.value }
        .padding(10.dp),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(10.dp)
) {
    Icon(
        painter = painterResource(id = R.drawable.akari_droid_color_icon),
        contentDescription = null
    )
    Text(
        modifier = Modifier.weight(1f),
        text = "ラベルも押せるようにしたい"
    )
    Switch(
        checked = isEnable.value,
        onCheckedChange = { isEnable.value = it }
    )
}
```

![Imgur](https://imgur.com/crclGgw.png)

というわけで答えが冒頭のあれです。これだけです。