---
title: Jetpack Composeで真ん中にする
created_at: 2021-07-14
tags:
- Android
- Kotlin
- JetpackCompose
---

どうもこんばんわ。  
ゆびさきコネクション、攻略しました。  

![Imgur](https://i.imgur.com/LAo5lKO.png)

この子かわいい（お酒の話分からんかったけど）

あとヒロインカスタムパッチを夏歩ちゃんにしたときのクイックロードの音声可愛かった

# 本題
Jetpack Composeで`gravity="center"`する方法です  
今更ながらメモ

# その前に
`Android Studio`のテンプレート？から`Empty Compose`を選択してプロジェクトを作成すると、実行できません。  
`Jetpack Compose`のバージョンを`1.0.0-rc01`へ、`Kotlin`のバージョンを`1.5.10`へ設定してください。

(appフォルダではない方の`build.gradle`)

```gradle
buildscript {
    ext {
        compose_version = '1.0.0-rc01' // ここを1.0.0-rc01へ
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath "com.android.tools.build:gradle:7.0.0-beta05"
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:1.5.10" // ここを1.5.10へ

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}
```

(appフォルダの`build.gradle`)

```gradle
composeOptions {
    kotlinCompilerExtensionVersion compose_version
    kotlinCompilerVersion '1.5.10' // 1.5.10へ
}
```

# Layout 編
ここで言う`Layout`は、`Column`、`Row`、`Box`みたいなやつです。  
`Alignment.Center`以外にも`Start`とかあったと思うのでどうぞ

## Box
View時代の`FrameLayout`に当たるやつ。重ねられます。

```kotlin
Box(
    modifier = Modifier.fillMaxSize(),
    contentAlignment = Alignment.Center
) {
    Text(text = "Android")
    Text(text = "Jetpack")
    Text(text = "Compose")
}
```

![Imgur](https://i.imgur.com/WS0R8dv.png)

## Column
縦積みLinearLayout

```kotlin
Column(
    modifier = Modifier.fillMaxSize(),
    horizontalAlignment = Alignment.CenterHorizontally, // 横方向
    verticalArrangement = Arrangement.Center // 縦方向
) {
    Text(text = "Android")
    Text(text = "Jetpack")
    Text(text = "Compose")
}
```

![Imgur](https://i.imgur.com/SvrEPky.png)


## Row
横並べLinearLayout  
Columnのときと逆になりますね。

```kotlin
Row(
    modifier = Modifier.fillMaxSize(),
    horizontalArrangement = Arrangement.Center,
    verticalAlignment = Alignment.CenterVertically
) {
    Text(text = "Android")
    Text(text = "Jetpack")
    Text(text = "Compose")
}
```

![Imgur](https://i.imgur.com/43hkYm7.png)

# 全部真ん中である必要はないときのための
`Box`、`Column`、`Row`の子供のときだけ使える`Modifier`の関数があります。

## Box

```kotlin
Box(modifier = Modifier.fillMaxSize()) {
    Text(text = "Android", modifier = Modifier.align(alignment = Alignment.TopStart)) // 左上
    Text(text = "Jetpack", modifier = Modifier.align(alignment = Alignment.Center)) // 真ん中
    Text(text = "Compose", modifier = Modifier.align(alignment = Alignment.BottomEnd)) // 右下
}
```

![Imgur](https://i.imgur.com/u8sk2nm.png)

## Column

```kotlin
Column(
    modifier = Modifier.fillMaxSize(),
) {
    Text(text = "Android",modifier = Modifier.align(alignment = Alignment.Start)) // 左
    Text(text = "Jetpack",modifier = Modifier.align(alignment = Alignment.CenterHorizontally)) // 真ん中
    Text(text = "Compose",modifier = Modifier.align(alignment = Alignment.End)) // 右
}
```

![Imgur](https://i.imgur.com/UYfAYOz.png)

## Row

```kotlin
Row(
    modifier = Modifier.fillMaxSize(),
) {
    Text(text = "Android",modifier = Modifier.align(Alignment.Top)) // 上
    Text(text = "Jetpack",modifier = Modifier.align(Alignment.CenterVertically)) // 真ん中
    Text(text = "Compose",modifier = Modifier.align(Alignment.Bottom)) // 下
}
```

![Imgur](https://i.imgur.com/cEHpKIy.png)

なお、上記の方法は`Modifier`が引数に取ってあることが必須なため、  
オリジナル`@Composable`な関数の場合は引数に`Modifier`を取るようにしよう。

```kotlin
Row(
    modifier = Modifier.fillMaxSize(),
) {
    Text(text = "Android", modifier = Modifier.align(Alignment.Top)) // 上
    Text(text = "Jetpack", modifier = Modifier.align(Alignment.CenterVertically)) // 真ん中
    Text(text = "Compose", modifier = Modifier.align(Alignment.Bottom)) // 下
    
    ComposeHelloWorldText(Modifier.align(Alignment.Top))
}

// 省略

@Composable
fun ComposeHelloWorldText(modifier: Modifier = Modifier) {
    Text(
        text = "Hello World",
        modifier = modifier
    )
}
```

ちなみに`ColumnScope`、`RowScope`、`BoxScope`の拡張関数とした`@Composable`な関数も作れないわけじゃないけどなんか自由度が減るのでやめとこう？

```kotlin
Row(
    modifier = Modifier.fillMaxSize(),
) {
    Text(text = "Android", modifier = Modifier.align(Alignment.Top)) // 上
    Text(text = "Jetpack", modifier = Modifier.align(Alignment.CenterVertically)) // 真ん中
    Text(text = "Compose", modifier = Modifier.align(Alignment.Bottom)) // 下

    // 親がRow限定
    ComposeHelloWorldText2()
}

// 省略

@Composable
fun RowScope.ComposeHelloWorldText2() {
    Text(
        text = "Hello World",
        modifier = Modifier.align(Alignment.Top),
    )
}
```


# 終わりに
`comp`まで入力すれば`@Composable`な関数を一瞬で作れます。

![Imgur](https://i.imgur.com/GbDP9rT.png)

![Imgur](https://i.imgur.com/LJZx5Wq.png)

あとクソどうでもいいんだけど、エロゲをリモートデスクトップでスマホから遊ぶときは`Steam Link`を使うといいかも。ルーターを超えられる(同じネットワークにいる必要がない)ので外からでも出来るのが強い。  