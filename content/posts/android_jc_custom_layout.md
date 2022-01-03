---
title: Jetpack Composeでカスタムレイアウト
created_at: 2021-03-10
tags:
- Android
- Kotlin
- JetpackCompose
---

<img src="https://imgur.com/fQzaLrQ.png" width=400>

かわいい（曲もいい）

# 本題
JetpackComposeで折り返すレイアウトがほしいので作った。 

<img src="https://imgur.com/AgAFKs6.png" width=300>

# 完成品（ライブラリ）はこちら

ライブラリにしたのでこの記事読まなくていいよ

https://github.com/takusan23/ComposeOrigamiLayout

導入方法はREADME読んで（特に変わったことはしてない）

## 環境
最新の開発環境を使おう

|なまえ|あたい|
|---|---|
|Android Studio|Android Studio Arctic Fox 2020.3.1 Canary 9|
|JetpackCompose|1.0.0-beta01|

## JetpackCompose 導入

appフォルダ内のbuild.gradleを開いて

```gradle
android {
    // 省略
    kotlinOptions {
        jvmTarget = '1.8'
        useIR = true
    }
    buildFeatures {
        compose true
    }
    composeOptions {
        kotlinCompilerExtensionVersion '1.0.0-beta01'
        kotlinCompilerVersion '1.4.30'
    }
}

dependencies {

    implementation "androidx.compose.ui:ui:1.0.0-beta01"
    implementation "androidx.compose.material:material:1.0.0-beta01"
    implementation "androidx.compose.ui:ui-tooling:1.0.0-beta01"

}
```

# 作成
適当なKotlinファイルを作成してComposeな関数を作っていきましょう

```kotlin
@Composable
fun OrigamiLayout() {
    
}
```

## カスタムLayout
`View`で言うところの`ViewGroup`ですね。  
とりあえず引数をセットしてあげて、`Layout()`を置きます。

```kotlin
/**
 * 折り返すLayout
 *
 * @param modifier Paddingなど
 * @param content 表示したい部品
 * */
@Composable
fun OrigamiLayout(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    Layout(
        content = content,
        modifier = modifier
    ) { measurables, constraints ->

    }
}
```

これから返り値を書いてあげます

## measurables と constraints

- constraints

`constraints`ってのは親の部品の大きさとかが取れるやつですね。

どういうことかというと、

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ComposeOrigamiLayoutTheme {
                // A surface container using the 'background' color from the theme
                Surface(color = MaterialTheme.colors.background) {
                    
                    Column(
                        modifier = Modifier.width(200.dp) // これと
                    ) {
                        Layout(content = {
                            Text(text = "Hello World")
                        }) { measurables, constraints ->

                            println(200.dp.toPx())
                            println(constraints.maxWidth) // これ

                            layout(constraints.maxWidth, constraints.maxHeight) {

                            }
                        }
                    }
                    
                }
            }
        }
    }
}

```

これと　これ　って書いてある部分は同じ値になるということです。  
一応200dpの値をpxにして出力しましたが同じ値になると思います。

- measurables
こいつは`content`引数に入れたUI部品の大きさを測定するときに使う。  
最大値と最小値の情報を渡すと大きさが入ったデータを返してくれる。

## これから置く部品の大きさを測定する
`Measurable#measure()`は一度しか呼べません。（多分）

```kotlin
/**
 * 折り返すLayout
 *
 * @param modifier Paddingなど
 * @param content 表示したい部品
 * */
@Composable
fun OrigamiLayout(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    Layout(
        content = content,
        modifier = modifier
    ) { measurables, constraints ->
        // この中に入るCompose（子供Compose）の幅とかの情報の配列にする
        val placeableList = measurables.map { it.measure(Constraints(0, constraints.maxWidth, 0, constraints.maxHeight)) }.toMutableList()
    }
}
```

## おけるかどうか（折り返すかどうか）
折り返すかどうかの計算をここで行います。とりまコピペ  
データクラスにしても良かったけど３つだったのでTripleにX座標、Y座標、placeableをそれぞれ入れた

```kotlin
Layout(
    content = content,
    modifier = modifier
) { measurables, constraints ->
    // この中に入る部品の幅とかの情報の配列にする
    val placeableList = measurables.map { it.measure(Constraints(0, constraints.maxWidth, 0, constraints.maxHeight)) }.toMutableList()
    // 最終的に入れるときに使うやつ
    val childrenDataList = arrayListOf<Triple<Int, Int, Placeable>>()
    // このComposeの幅
    val origamiWidth = constraints.maxWidth
    // 高さ計算
    var origamiHeight = 0
    // 列に入ってるComposeの合計の幅
    var lineWidth = 0
    // 子供Composeがの位置を決定する
    placeableList.forEach { placeable ->
        if (lineWidth + placeable.width < origamiWidth) {
            // 今の行の幅が足りている場合
            // width / height / placeable
            childrenDataList.add(Triple(lineWidth, origamiHeight, placeable))
            lineWidth += placeable.width
        } else {
            // 足りてない
            // 次はもう入らないので次の行へ
            lineWidth = 0
            origamiHeight += placeable.height
            // width / height / placeable
            childrenDataList.add(Triple(lineWidth, origamiHeight, placeable))
            // 幅を足す
            lineWidth = placeable.width
        }
    }
}
```

## 配置する
`layout()`を呼んで、`placeRelative()`を呼ぶことで部品が配置されます。  

```kotlin
Layout(
    content = content,
    modifier = modifier
) { measurables, constraints ->
    // この中に入る部品の幅とかの情報の配列にする
    val placeableList = measurables.map { it.measure(Constraints(0, constraints.maxWidth, 0, constraints.maxHeight)) }.toMutableList()
    // 最終的に入れるときに使うやつ
    val childrenDataList = arrayListOf<Triple<Int, Int, Placeable>>()
    // このComposeの幅
    val origamiWidth = constraints.maxWidth
    // 高さ計算
    var origamiHeight = 0
    // 列に入ってるComposeの合計の幅
    var lineWidth = 0
    // 子供Composeがの位置を決定する
    placeableList.forEach { placeable ->
        if (lineWidth + placeable.width < origamiWidth) {
            // 今の行の幅が足りている場合
            // width / height / placeable
            childrenDataList.add(Triple(lineWidth, origamiHeight, placeable))
            lineWidth += placeable.width
        } else {
            // 足りてない
            // 次はもう入らないので次の行へ
            lineWidth = 0
            origamiHeight += placeable.height
            // width / height / placeable
            childrenDataList.add(Triple(lineWidth, origamiHeight, placeable))
            // 幅を足す
            lineWidth = placeable.width
        }
    }
    // origamiHeightは、部品を置く際の座標（左上）になりますので、高さとして使うにはもう一度部品の高さを足してあげないといけない
    val lastItemHeight = if (placeableList.isEmpty()) 0 else placeableList.last().height
    layout(width = constraints.maxWidth, height = origamiHeight + lastItemHeight) {
        childrenDataList.forEach { triple ->
            val xPos = triple.first
            val yPos = triple.second
            val placeable = triple.third
            // 設置
            placeable.placeRelative(xPos, yPos)
        }
    }
}
```

## 置いて使ってみる

```kotlin
@Composable
fun HomeScreen() {
    Column(
        modifier = Modifier.fillMaxHeight(),
    ) {
        // 文字列配列
        val list = remember { mutableStateListOf<String>() }
        // テキストボックスに入れてる文字列
        val editTextValue = remember { mutableStateOf("") }
        // 折り返すやつ
        OrigamiLayout {
            // テキスト配置
            list.forEach { text ->
                OutlinedButton(
                    onClick = { },
                    modifier = Modifier.padding(2.dp)
                ) {
                    Text(
                        text = text
                    )
                }
            }
        }
        // 追加
        Row {
            // テキストボックス
            TextField(
                modifier = Modifier.weight(1f),
                value = editTextValue.value,
                onValueChange = { editTextValue.value = it }
            )
            // 追加ボタン
            Button(
                onClick = {
                    list.add(editTextValue.value)
                },
                modifier = Modifier
                    .padding(10.dp)
            ) {
                Text(text = "Add Text")
            }
        }
    }
}
```

あとはMainActivityなんかに置いて完成

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ComposeOrigamiLayoutTheme {
                // A surface container using the 'background' color from the theme
                Surface(color = MaterialTheme.colors.background) {
                    HomeScreen()
                }
            }
        }
    }
}
```

説明すっとばちゃったけどこんな感じになります。

![Imgur](https://imgur.com/OnLimT7.png)

## 短い順にしてスペースを有効活用させる
**並び替えしても問題ないなら**の話ですが  
この小さい順に並び替えるやつ(`ArrayList#sort{ }`)便利

```kotlin
/**
 * 折り返すLayout
 *
 * @param modifier Paddingなど
 * @param isAcceptSort 並び替えしてもいいならtrue
 * @param content 表示したい部品
 * */
@Composable
fun OrigamiLayout(
    modifier: Modifier = Modifier,
    isAcceptSort: Boolean = false,
    content: @Composable () -> Unit,
) {
    Layout(
        content = content,
        modifier = modifier
    ) { measurables, constraints ->
        // この中に入るCompose（子供Compose）の幅とかの情報の配列にする
        // なんかConstraints()のmaxのところはMAX_VALUE入れといてminには0を入れてあげれば大きさが取れるようになる
        val placeableList = measurables.map { it.measure(Constraints(0, constraints.maxWidth, 0, constraints.maxHeight)) }.toMutableList()
        // 最終的に入れるときに使うやつ
        val childrenDataList = arrayListOf<Triple<Int, Int, Placeable>>()
        // このComposeの幅
        val origamiWidth = constraints.maxWidth
        // 高さ計算
        var origamiHeight = 0
        // 列に入ってるComposeの合計の幅
        var lineWidth = 0
        // 並び替えを許可している場合は並び替える
        if(isAcceptSort){
            placeableList.sortBy { placeable -> placeable.width }
        }
        // 子供Composeがの位置を決定する
        placeableList.forEach { placeable ->
            if (lineWidth + placeable.width < origamiWidth) {
                // 今の行の幅が足りている場合
                // width / height / placeable
                childrenDataList.add(Triple(lineWidth, origamiHeight, placeable))
                lineWidth += placeable.width
            } else {
                // 足りてない
                // 次はもう入らないので次の行へ
                lineWidth = 0
                origamiHeight += placeable.height
                // width / height / placeable
                childrenDataList.add(Triple(lineWidth, origamiHeight, placeable))
                // 次の行に移動して幅を足す
                lineWidth = placeable.width
            }
        }
        // 子Composeを置いていく
        // origamiHeightは、部品を置く際の座標（左上）になりますので、高さとして使うにはもう一度部品の高さを足してあげないといけない
        val lastItemHeight = if (placeableList.isEmpty()) 0 else placeableList.last().height
        layout(width = constraints.maxWidth, height = origamiHeight + lastItemHeight) {
            childrenDataList.forEach { triple ->
                val xPos = triple.first
                val yPos = triple.second
                val placeable = triple.third
                // 設置
                placeable.placeRelative(xPos, yPos)
            }
        }
    }
}
```

使う方で`true`してあげる。

```kotlin
@Composable
fun HomeScreen() {
    Column(
        modifier = Modifier.fillMaxHeight(),
    ) {
        // 文字列配列
        val list = remember { mutableStateListOf<String>() }
        // テキストボックスに入れてる文字列
        val editTextValue = remember { mutableStateOf("") }
        // 折り返すやつ
        OrigamiLayout(
            isAcceptSort = true // ソート有効
        ) {
            // テキスト配置
            list.forEach { text ->
                OutlinedButton(
                    onClick = { },
                    modifier = Modifier.padding(2.dp)
                ) {
                    Text(
                        text = text
                    )
                }
            }
        }
        // 追加
        Row {
            // テキストボックス
            TextField(
                modifier = Modifier.weight(1f),
                value = editTextValue.value,
                onValueChange = { editTextValue.value = it }
            )
            // 追加ボタン
            Button(
                onClick = {
                    list.add(editTextValue.value)
                },
                modifier = Modifier
                    .padding(10.dp)
            ) {
                Text(text = "Add Text")
            }
        }
    }
}
```

これで短い順に上から入っていきます。  

![Imgur](https://imgur.com/AgAFKs6.png)

# おわりに
ソースコードです。  



参考にしました。ありがとうございます。

https://qiita.com/takahirom/items/c6625cbc7ebdda49de2f

https://developer.android.com/jetpack/compose/layout?hl=ja