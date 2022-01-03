---
title: Jetpack Compose の例
created_at: 2020-12-31
tags:
- Android
- Kotlin
- JetpackCompose
---
追記：2021/07/15：1.0.0-rc02が出てます。


追記：2021/07/14：1.0.0-rc01が出てます。
正式リリースも近い。あとなんかAndroid Studioのプレビュー機能が4んでるみたいだから、`ui-tooling`だけは`Beta09`のままがいいらしい？  
詳細：https://stackoverflow.com/questions/68224361/jetpack-compose-cant-preview-after-updating-to-1-0-0-rc01

```
composeOptions {
    kotlinCompilerVersion '1.5.10'
    kotlinCompilerExtensionVersion '1.0.0-rc01'
}
```

追記：2021/06/26：Beta09が出てます。  
それと、現状？AndroidStudioのテンプレートからEmpty Compose Activityを選択してそのままの状態で実行すると起動しません。KotlinとJetpackComposeのバージョンを上げる必要があります。初見殺しだろこれ

```
java.lang.NoSuchMethodError: No static method copy-H99Ercs$default
```

`build.gradle`(appフォルダではない方)

```kotlin
buildscript {
    ext {
        compose_version = '1.0.0-beta09' // beta09へ
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath "com.android.tools.build:gradle:7.0.0-beta04"
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:1.5.10" // 1.5.10へ

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}
```

`app/build.gradle`(appフォルダの方のbuild.gradle)

```gradle
    composeOptions {
        kotlinCompilerExtensionVersion compose_version
        kotlinCompilerVersion '1.5.10' // 1.5.10へ
    }
```

これで実行できると思います。

追記：2021/06/06：知らん間にJetpack Compose Beta08がリリースされました。Kotlinのバージョンを1.5.10にする必要があります。

```
composeOptions {
    kotlinCompilerVersion '1.5.10'
    kotlinCompilerExtensionVersion '1.0.0-beta08'
}
```

あと `Compose版マテリアルデザインライブラリ` のリファレンスが親切になっていました。Google本気やん
https://developer.android.com/reference/kotlin/androidx/compose/material/package-summary#overview


【割と破壊的仕様変更】`beta08`から`Surface()`と`Card()`のクリックイベントは`Modifier`経由ではなく、`onClick`の引数を使うようになりました。

- beta07まで    
```kotlin
Surface(modifier = Modifier.clickable {  }) {

}
```

- beta08以降
```kotlin
Surface(onClick = { }) {

}
```

そして`Surface()`、`Card()`で`onClick`引数を使う際は、`@ExperimentalMaterialApi`をComposeな関数に付ける必要があります。

```kotlin
@ExperimentalMaterialApi
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    setContent {
        Surface(onClick = { }) {
        
        }    
    }

}
```

追記：2021/05/22：Jetpack Composeがいつの間にかbeta07まで進んでました。  
あとGoogle I/Oで言ってたけどホーム画面のウイジェットもJetpack Composeで書けるようになるとかなんとか

追記：2021/04/11：Beta04がリリースされました。多分Kotlinのバージョンを上げる必要があります。

```
composeOptions {
    kotlinCompilerVersion '1.4.32'
    kotlinCompilerExtensionVersion '1.0.0-beta04'
}
```

追記：2021/03/25：Beta03がリリースされました。`AndroidView`の問題が修正されています。  
ついでに、Android 7以前？で起きてたスクロール時に`AndroidView`がずれる問題も直ってました。

追記：2021/03/13：Beta02がリリースされました。一緒にKotlinのバージョンを`1.4.31`にする必要があります。  
`ComposeView`の問題が修正されました（多分）。

(なお今度はスクロール時に`AndroidView()`がずれるようになった模様)

```gradle
composeOptions {
    kotlinCompilerVersion '1.4.31'
    kotlinCompilerExtensionVersion '1.0.0-beta02'
}
```

また、`AppCompat`、`Fragment`のライブラリのバージョンをそれぞれ`1.3`以上にする必要があります。  

```gradle
dependencies {
    implementation 'androidx.fragment:fragment-ktx:1.3.1'
    implementation 'androidx.appcompat:appcompat:1.3.0-beta01'
}
```

追記 2021/03/02: Jetpack Compose Beta がリリースされました！。ついに（待望の）ベータ版になります

追記 2021/02/15：Jetpack Composeのバージョンが`alpha 12`になりました。  
影響があったといえば、  
- `vectorResource`が非推奨。`painterResource`を使うように。
    - よって`Icon`へDrawableを渡すときの引数は`imageVector`ではなく、`painter`になります。

```kotlin
Icon(
    painter = painterResource(R.drawable.ic_outline_open_in_browser_24px),
    contentDescription = "ブラウザ起動"
)	
```

- Context取得時に使う、`AmbientContext.current`が`LocalContext.current`に変更になりました。

- Android Studioが対応してないのか、Kotlinのバージョンを1.4.30にしても、**バージョンが古いので利用できません**ってIDEに言われます。 
    -  **エラー出るけど実行はできる。修正待ち**
    - `'padding(Dp): Modifier' is only available since Kotlin 1.4.30 and cannot be used in Kotlin 1.4`
    - 解決方法は、設定を開き、`Languages & Frameworks`へ進み、`Kotlin`を選び、`Update Channel`を`Early Access Preview 1.4.x`にして`Install`を押せばいいらしい。
        - ここらへん参照：https://github.com/android/compose-samples/pull/387#issuecomment-777515590


追記：`Icon`の増えてるのでコピペじゃ動かなくなりました。  
`contentDescription`という文字列を入れる引数が増えてます。ので、コピペしたら`Icon`の引数を足してください。以下のように
```kotlin
Icon(
    imageVector = Icons.Outlined.Home,
    contentDescription = "アイコンの説明。なければnullでもいい"
)
```

この続きです。そのうち追記しに来る

https://takusan.negitoro.dev/posts/android_jc/

## Snackbar表示

`Scaffold { }`で囲ってあげる必要があります。  
Snackbar表示以外でもアプリバーとかドロワーの表示でも使うので置いておいて損はないはず。

また、Compose内で利用できるコルーチン(`rememberCoroutineScope()`)を利用する必要があります。

```kotlin
@ExperimentalMaterialApi
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent {
        MaterialTheme {
            val state = rememberScaffoldState()
            val scope = rememberCoroutineScope()
            Scaffold(
                scaffoldState = state,
                topBar = {
                    TopAppBar() {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center,
                            modifier = Modifier.fillMaxHeight().padding(10.dp),
                        ) {
                            Text(text = "ブログ一覧")
                        }
                    }
                }
            ) {
                OutlinedButton(onClick = {
                    scope.launch {
                        val result = state.snackbarHostState.showSnackbar(
                            message = "Snackbar表示",
                            actionLabel = "押せます",
                            duration = SnackbarDuration.Short,
                        )
                        // 押せたかどうか
                        if (result == SnackbarResult.ActionPerformed) {
                            Toast.makeText(this@MainActivity, "押せました！", Toast.LENGTH_SHORT).show()
                        }
                    }
                }) {
                    Text(text = "Snackbar表示")
                }
            }
        }
    }
}
```

実行結果

![Imgur](https://imgur.com/T2NNPnK.png)

参考にしました：https://gist.github.com/gildor/82ec960cc0c5873453f024870495eab3

## Context取得
リソース取得等は用意されてるけど、それ以外でContextを使いたい場合はこうです！

```kotlin
@Composable
fun needContext() {
    val context = LocalContext.current
}
```

## コルーチンは？

なんかコルーチン、2種類あるっぽい。  

### LaunchedEffect vs rememberCoroutineScope
なんか警告出てたので追記（2021/04/19）

### LaunchedEffect

これは`@Composable`がついた関数内でしか呼べません。  
`Button()`や`Text()`を置く感じで使うことになります。

```kotlin
@Composable
fun TimerText() {
    val timerCount = remember { mutableStateOf(0) }
    /**
     * ここはコンポーザブルのスコープ内
     *
     * Button()やText()が設置可能
     * */
    LaunchedEffect(key1 = Unit, block = {
        while (true) {
            timerCount.value += 1
            delay(1000)
        }
    })
    Text(text = "${timerCount.value} 秒経過")
}

```

また、`key1`の中身が変わると、今のコルーチンはキャンセルされ、新しいコルーチンが起動するようになっています。

```kotlin
@Composable
fun TimerText() {
    val timerCount = remember { mutableStateOf(0) }
    val isRunning = remember { mutableStateOf(false) }
    /**
     * Button()やText()が設置可能な場所
     *
     * Composable内で利用できるコルーチン
     *
     * key1が変更されると、既存のコルーチンはキャンセルされ、新しくコルーチンが起動する
     * */
    LaunchedEffect(key1 = isRunning.value, block = {
        timerCount.value = 0
        while (isRunning.value) {
            timerCount.value += 1
            delay(1000)
        }
    })
    Button(onClick = {
        isRunning.value = !isRunning.value
    }) {
        if (isRunning.value) {
            Text(text = "${timerCount.value} 秒経過")
        } else {
            Text(text = "タイマー開始")
        }
    }
}
```

### rememberCoroutineScope
じゃあ`rememberCoroutineScope`はなんだよって話ですが、これは`Composable`な関数ではないところで使うのが正解らしいです。  
(例えば、ボタンを押したときに呼ばれる関数は`Composableな関数`ではない)

```kotlin
@Composable
fun RememberCoroutine() {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    Button(onClick = {
        // ここはComposableな関数ではない
        scope.launch {
            // Toast表示が終わるまで一時停止する
            suspendToast(context)
            println("終了")
        }
    }) {
        Text(text = "rememberCoroutineScope")
    }
}

/** Toast表示が終わるまで一時停止する関数 */
suspend fun suspendToast(context: Context) {
    Toast.makeText(context, "rememberCoroutineScope", Toast.LENGTH_SHORT).show()
    delay(2 * 1000) // 2秒ぐらい
}
```

あってるか分からないので、詳しくは公式で  
https://developer.android.com/jetpack/compose/lifecycle

## テーマとか文字の色にカラーコードを使いたい！
`Color.parseColor()`がそのままでは使えないので、`androidx.compose.ui.graphics`の方の`Color`の引数に入れてあげます。

```kotlin
Text(
    text = AnniversaryDate.makeAnniversaryMessage(anniversary),
    color = Color(android.graphics.Color.parseColor("#252525"))
)
```

## ダークモード

まずは`ThemeColor.kt`みたいな色だけを書いておくクラスを作ってはりつけ  
~~なんか`isDarkMode`に`@Composable`を付ける理由はわかりません。サンプルコードがそうなってたので便乗~~  
`@Composable`をつけると`LocalContext`等へアクセスできる。  
つけない場合だと(今回の場合は)引数に`Context`が必要になる。なるほどなあ

```kotlin
// 引数にContextが必要
fun isDarkMode(context: Context) {}

// いらない
@Composable
fun isDarkMode() {
    val context = LocalContext.current
}
```

ここから例です

```kotlin
/**
 * [MaterialTheme]に渡すテーマ。コードでテーマの設定ができるってマジ？
 * */

/** ダークモード。OLED特化 */
val DarkColors = darkColors(
    primary = Color.White,
    secondary = Color.Black,
)

/** ライトテーマ */
val LightColors = lightColors(
    primary = Color(android.graphics.Color.parseColor("#757575")),
    primaryVariant = Color(android.graphics.Color.parseColor("#494949")),
    secondary = Color(android.graphics.Color.parseColor("#a4a4a4")),
)

/** ダークモードかどうか */
@Composable
fun isDarkMode(): Boolean {
    // ComposableをつけるとLocalContext等、Composable内でしか呼べない関数を呼べる（それはそう）
    // 今回はContextを引数に取らなくてもLocalContextを使うことが出来た
    val context = LocalContext.current
    val conf = context.resources.configuration
    val nightMode = conf.uiMode and Configuration.UI_MODE_NIGHT_MASK
    return nightMode == Configuration.UI_MODE_NIGHT_YES // ダークモードなら true
}
```

そしたら`MaterialTheme { }`に渡してあげます。if文を一行で書く

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                // 色の設定
                colors = if (isDarkMode(AmbientContext.current)) DarkColors else LightColors
            ) {
                Scaffold {
                    Column(
                        modifier = Modifier.fillMaxWidth().fillMaxHeight(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        // この２つ、ダークモードなら白色、それ以外なら黒色になるはず
                        Text(text = "もじのいろ")
                        Icon(imageVector = Icons.Outlined.Home)
                    }
                }
            }
        }
    }
}
```

ちゃんと動けばダークモードのときは真っ暗になると思います。AOD

![Imgur](https://imgur.com/pMaRzgc.png)

ちなみに黒基調にすると`Icon()`等が勝手に検知してアイコンの色を白色に変更してくれるそうです。ダークモード対応の手間が減る


## タブレイアウト
見つけたので報告しますね。そんなに難しくない。

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                // 色の設定
                colors = if (isDarkMode(AmbientContext.current)) DarkColors else LightColors
            ) {
                Scaffold {
                    Column(
                        modifier = Modifier.fillMaxWidth().fillMaxHeight(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {

                        // 選択中タブ
                        var selectTabIndex by remember { mutableStateOf(0) }

                        TabLayout(
                            selectTabIndex = selectTabIndex,
                            tabClick = { index -> selectTabIndex = index }
                        )
                        Text(text = "選択中：$selectTabIndex")

                    }
                }
            }
        }
    }
}


/**
 * タブレイアウト
 *
 * @param selectTabIndex 選択するタブを入れてね
 * @param tabClick タブを押した時
 * */
@Composable
fun TabLayout(selectTabIndex: Int, tabClick: (Int) -> Unit) {
    TabRow(
        modifier = Modifier.padding(10.dp),
        selectedTabIndex = selectTabIndex,
        backgroundColor = Color.Transparent,
    ) {
        Tab(selected = selectTabIndex == 0, onClick = {
            tabClick(0)
        }) {
            Icon(imageVector = Icons.Outlined.Android)
            Text(text = "Android 9")
        }
        Tab(selected = selectTabIndex == 1, onClick = {
            tabClick(1)
        }) {
            Icon(imageVector = Icons.Outlined.Android)
            Text(text = "Android 10")
        }
        Tab(selected = selectTabIndex == 2, onClick = {
            tabClick(2)
        }) {
            Icon(imageVector = Icons.Outlined.Android)
            Text(text = "Android 11")
        }
    }
}
```

動作結果

![Imgur](https://imgur.com/nXfFeG5.png)

## 動的にテーマを変える

`MaterialTheme`の`colors`の部分を変えることでテーマを切り替えられるようになりました。これ従来のレイアウトじゃできないからComposeの強みじゃない？

まずは色の情報を置いておくクラスを作成して、以下をコピペします。

`ThemeColor.kt`

```kotlin
/** ダークモード。OLED特化 */
val DarkColors = darkColors(
    primary = Color.White,
    secondary = Color.Black,
)

/** ライトテーマ */
val LightColors = lightColors(
    primary = Color(android.graphics.Color.parseColor("#FF6200EE")),
    primaryVariant = Color(android.graphics.Color.parseColor("#FF3700B3")),
    secondary = Color(android.graphics.Color.parseColor("#FFFFFF")),
)

/** 青基調 */
val blueTheme = lightColors(
    primary = Color(android.graphics.Color.parseColor("#0277bd")),
    primaryVariant = Color(android.graphics.Color.parseColor("#58a5f0")),
    secondary = Color(android.graphics.Color.parseColor("#004c8c")),
)

/** 赤基調 */
val redTheme = lightColors(
    primary = Color(android.graphics.Color.parseColor("#c2185b")),
    primaryVariant = Color(android.graphics.Color.parseColor("#8c0032")),
    secondary = Color(android.graphics.Color.parseColor("#fa5788")),
)

/** 緑基調 */
val greenTheme = lightColors(
    primary = Color(android.graphics.Color.parseColor("#1b5e20")),
    primaryVariant = Color(android.graphics.Color.parseColor("#003300")),
    secondary = Color(android.graphics.Color.parseColor("#4c8c4a")),
)

/** ダークモードかどうか */
@Composable
fun isDarkMode(context: Context): Boolean {
    val conf = context.resources.configuration
    val nightMode = conf.uiMode and Configuration.UI_MODE_NIGHT_MASK
    return nightMode == Configuration.UI_MODE_NIGHT_YES // ダークモードなら true
}
```

その後に書いていきます。ダークモードを一緒に書いた人はこっから掛けばいいです。

```java
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {

            // デフォルト
            val defaultTheme = if (isDarkMode(AmbientContext.current)) DarkColors else LightColors

            // 色を保持する
            val themes = remember { mutableStateOf(defaultTheme) }

            MaterialTheme(
                // 色の設定
                colors = themes.value
            ) {
                Scaffold(
                    topBar = {
                        TopAppBar() {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center,
                                modifier = Modifier.fillMaxHeight().padding(10.dp),
                            ) {
                                Text(text = "動的テーマ")
                            }
                        }
                    }
                ) {
                    // テーマ切り替え
                    DynamicThemeButtons(themeClick = { themes.value = it})
                }
            }
        }
    }
}

/**
 * 動的にテーマを切り替える。
 *
 * @param themeClick ボタンを押したときに呼ばれる。引数にはテーマ（[Colors]）が入ってる
 * */
@Composable
fun DynamicThemeButtons(
    themeClick: (Colors) -> Unit,
) {

    // デフォルト
    val defaultTheme = if (isDarkMode(context = AmbientContext.current)) DarkColors else LightColors

    Column(
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Button(
            modifier = Modifier.padding(5.dp),
            onClick = { themeClick(blueTheme) }
        ) {
            Text(text = "青")
        }
        Button(modifier = Modifier.padding(5.dp),
            onClick = { themeClick(redTheme) }
        ) {
            Text(text = "赤")
        }
        Button(modifier = Modifier.padding(5.dp),
            onClick = { themeClick(greenTheme) }
        ) {
            Text(text = "緑")
        }
        Button(modifier = Modifier.padding(5.dp),
            onClick = { themeClick(defaultTheme) }
        ) {
            Text(text = "デフォルト")
        }
    }

}
```

実行結果

ボタンを押すと色が切り替わると思います。

![Imgur](https://imgur.com/cijIOts.png)

![Imgur](https://imgur.com/Xr8lRaT.png)

## 表示、非表示をアニメーションしてほしい

`AnimatedVisibility`ってのがあります。  

```kotlin
class MainActivity : AppCompatActivity() {
    
    @ExperimentalAnimationApi
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {

            // デフォルト
            val defaultTheme = if (isDarkMode(AmbientContext.current)) DarkColors else LightColors

            // 色を保持する
            val themes = remember { mutableStateOf(defaultTheme) }

            MaterialTheme(
                // 色の設定
                colors = themes.value
            ) {
                VisibilityAnimationSample()
            }
        }
    }
}

@ExperimentalAnimationApi
@Composable
fun VisibilityAnimationSample() {
    // 表示するか
    val isShow = remember { mutableStateOf(false) }
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .fillMaxHeight(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        AnimatedVisibility(visible = isShow.value) {
            // この中に書いたやつがアニメーションされながら表示される
            Column {
                // 10個ぐらい
                repeat(10) {
                    Icon(imageVector = Icons.Outlined.Android, modifier = Modifier.rotate(90f * it))
                }
            }
        }
        // 表示、非表示切り替え
        Button(onClick = { isShow.value = !isShow.value }) {
            Text(text = "アニメーションさせながら表示")
        }
    }
}
```

画像じゃわからんけど、ちゃんとアニメーションされてます。

![Imgur](https://imgur.com/VFFCZR9.png)


## 右寄せ
`android:gravity="right"`をJetpack Composeでもやりたいわけですね。重要な点は`fillMaxWidth()`を使うところです

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            GravityRight()
        }
    }
}

@Composable
fun GravityRight() {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(text = "右に寄ってる Row")
            IconButton(onClick = { /*TODO*/ }) {
                Icon(imageVector = Icons.Outlined.Adb)
            }
        }
        Divider() // 区切り
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.End,
            verticalArrangement = Arrangement.Center
        ) {
            Text(text = "右に寄ってる Column")
            IconButton(onClick = { /*TODO*/ }) {
                Icon(imageVector = Icons.Outlined.Adb)
            }
        }
    }
}
```

こうなるはず

![Imgur](https://imgur.com/38Uu9zz.png)


## 均等に並べる
`LinearLayout`と同じように`weight`を設定すればできます。

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            WeightSample()
        }
    }
}

@Composable
fun WeightSample() {
    Row(
        modifier = Modifier.fillMaxWidth()
    ) {
        Button(modifier = Modifier.weight(1f).padding(5.dp), onClick = { /*TODO*/ }) {
            Text(text = "ぼたんだよー")
        }
        Button(modifier = Modifier.weight(1f).padding(5.dp), onClick = { /*TODO*/ }) {
            Text(text = "ぼたんだよー")
        }
        Button(modifier = Modifier.weight(1f).padding(5.dp), onClick = { /*TODO*/ }) {
            Text(text = "ぼたんだよー")
        }
    }
}
```

こうなるはず

![Imgur](https://imgur.com/6YRtu3S.png)

## 余りのスペースを埋める
埋めたい部品に対して`weight(1f)`を足してあげることで、他の部品の事を考えながら埋めたい部品で埋めてくれます。  
こっちも親要素に`fillMaxWidth()`を指定してあげる必要があります。(画面いっぱい使うなら)

```kotlin   
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MessageSendUI()
        }
    }
}

@Composable
fun MessageSendUI() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        val message = remember { mutableStateOf("") }
        // この部品を最大まで広げたい
        OutlinedTextField(
            value = message.value,
            onValueChange = { message.value = it },
            modifier = Modifier
                .padding(5.dp)
                .weight(1f)
        )
        IconButton(
            onClick = { /*TODO*/ },
            modifier = Modifier.padding(5.dp)
        ) {
            Icon(imageVector = Icons.Outlined.Send)
        }
    }
}
```

こうなるはず

![Imgur](https://imgur.com/dcxKhg3.png)

## もっとサンプル書け！

`Jetpack Compose`を書いてる人のサンプルには勝てないというわけで`ソースコード`の探し方でも。

#### 1.Android Studioで使いたいUI部品のソースコードを開く

`Button`とか`OutlinedButton`とか`MaterialTheme`の部分で`Ctrl 押しながら クリック`することで飛べます。

こんなのが出ると思う

![Imgur](https://imgur.com/PovnHgF.png)

#### 2.ブラウザで

https://cs.android.com/

を開きます。

#### 3.@sample の部分を探します。

さっきの画像だと、

```java
@sample androidx.compose.material.samples.OutlinedButtonSample
```

のところですね

#### 4.検索欄に入れる
で、何を検索欄に入れればいいんだって話ですが、さっき見つけた`@sample ～`の部分、  
最後から`.`までの部分を入力します。

```java
@sample androidx.compose.material.samples.OutlinedButtonSample
```

だと、`OutlinedButtonSample`がそうです。


早速検索欄に入れましょう

![Imgur](https://imgur.com/zUlBhLR.png)

#### 5.コードを読み解く

検索欄に入れたらおそらく一番最初のサジェストが使い方の例になってると思います。

あとは読んでいくしか無いです。

![Imgur](https://imgur.com/7dM94mY.png)


## サンプルアプリ

今までやったこと(だいたい)を一つのアプリにしてみました。どうぞ。

https://github.com/takusan23/JetpackComposeSampleApp

### ダウンロード

https://github.com/takusan23/JetpackComposeSampleApp/releases/tag/1.0