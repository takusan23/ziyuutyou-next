---
title: Jetpack ComposeにMaterial3を入れてダイナミックカラー使う
created_at: 2021-10-28
tags:
- Android
- Kotlin
- JetpackCompose
- Android12
- MaterialDesign
---
どうもこんばんわ。

アインシュタインより愛を込めて 攻略しました。  

なんか色々思うことはあるけど最後のタイトル回収とED曲で許した感ある。  
あとこの子かわいい。

![Imgur](https://i.imgur.com/u03dpx2.png)

サブヒロインの扱い雑すぎて悲しくなっちゃった

↓  
↓  
↓  

アインシュタインより愛を込めて APOLLOCRISIS 攻略しました。  
今月のエロゲの日から無料配信されるみたいなので**前作やった人は絶対やろう**。やってロミちゃんを助けてあげて、、、

![Imgur](https://i.imgur.com/ilgmLD0.png)

野上さんいい人

# 本題
`Jetpack Compose`にも`Material3`ライブラリがリリースされました。  
ダイナミックカラーが使えるようになります。ちなみに`BottomNavigationBar`の高さは`56.dp`？から`80.dp`と大きくなりました。

![Imgur](https://i.imgur.com/S1bWXYG.png)

# 環境

| なまえ         | あたい                              |
|----------------|-------------------------------------|
| Android        | 12 (ダイナミックカラー使うなら必須) |
| Android Stuido | Arctic Fox 2020.3.1 Patch 3         |
| targetSdk      | 31                                  |

# 公式ドキュメント

## 導入

https://developer.android.com/jetpack/compose/themes/material#material3

## Material3

https://m3.material.io/

## 1. 導入

`app/build.gradle`に書き足すだけです。（新世界の）α版なので安定しないかもらしいです。

```
dependencies {

    // Jetpack Compose
    implementation("androidx.compose.ui:ui:1.1.0-beta01")
    implementation("androidx.compose.material:material:1.1.0-beta01")
    implementation("androidx.compose.ui:ui-tooling-preview:1.1.0-beta01")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4:1.1.0-beta01")
    debugImplementation("androidx.compose.ui:ui-tooling:1.1.0-beta01")

    // ↓これ
    implementation("androidx.compose.material3:material3:1.0.0-alpha01")

}
```

## 2. Theme.kt (MaterialTheme)を書き換える
次に`Theme.kt`か`MaterialTheme`を書き換えます。  
プロジェクト作成時から`Composeプロジェクト`を選んだ場合は`Theme.kt`って名前で`MaterialTheme`をカスタマイズしている関数があるはずです。

以下は一例です。  
なんか色の扱いが変わってるので以下のサイトで色を吐き出してもらってもいいかも？  

https://material-foundation.github.io/material-theme-builder/

```kotlin
val PrimaryColor = Color(0xff8c9bde)
val DarkColor = Color(0xff7873c2)
val LightColor = Color(0xffd1f7e3)

@SuppressLint("NewApi")
@Composable
fun ComposeDynamicColorTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    isEnableDynamicColor: Boolean = true,
    content: @Composable () -> Unit,
) {
    val context = LocalContext.current
    // ダイナミックカラー使う？
    val isUseDynamicColor = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
            && isEnableDynamicColor

    // Android 12以降で
    val colorScheme = when {
        isUseDynamicColor && darkTheme -> dynamicDarkColorScheme(context)
        isUseDynamicColor && !darkTheme -> dynamicLightColorScheme(context)
        darkTheme -> darkColorScheme(
            primary = PrimaryColor,
            secondary = LightColor,
            tertiary = DarkColor,
        )
        else -> lightColorScheme(
            primary = PrimaryColor,
            secondary = LightColor,
            tertiary = DarkColor,
        )
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
```

`MaterialTheme`は`androidx.compose.material3.MaterialTheme`をインポートするようにしてください。

```kotlin
import android.annotation.SuppressLint
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
```

#### 注意点？

`(androidx.compose.material.)MaterialTheme.colors`は使えなくなります。   
`(androidx.compose.material3.)MaterialTheme.colorScheme`を使ってください。ない場合は`import`間違えてます。

`backgroundColor`は`containerColor`に変わった模様？

## 3. ひたすら `import androidx.compose.material`から`import androidx.compose.material3`に書き換えてく

対応しているコンポーネントは以下です。  

https://developer.android.com/jetpack/androidx/releases/compose-material3  

`Text`、`Icon`なんかも`Material3`で用意されている方を使う必要があります。  

選ぶ際は`material3`って書いてある方を。  

![Imgur](https://i.imgur.com/1CMjVPr.png)

以下例です。  
コピペする際は、`ic_android_black_24dp`を`Android Studio`の`Vector Asset`から追加してください。

```kotlin
class MainActivity : ComponentActivity() {
    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ComposeDynamicColorTheme {
                // A surface container using the 'background' color from the theme
                Surface(color = MaterialTheme.colorScheme.background) {

                    Scaffold(
                        topBar = { MediumTopAppBar(title = { Text(text = "タイトルバー") }) },
                        bottomBar = {
                            NavigationBar {
                                NavigationBarItem(
                                    selected = true,
                                    icon = { Icon(painter = painterResource(id = R.drawable.ic_android_black_24dp), contentDescription = null) },
                                    label = { Text(text = "Android") },
                                    onClick = { }
                                )
                            }
                        },
                        floatingActionButton = {
                            ExtendedFloatingActionButton(
                                text = { Text(text = "ExtendedFAB") },
                                icon = { Icon(painter = painterResource(id = R.drawable.ic_android_black_24dp), contentDescription = null) },
                                onClick = { }
                            )
                        },
                        content = {
                            Button(onClick = { }) {
                                Text(text = "Hello World")
                            }
                        },
                    )

                }
            }
        }
    }
}
```

よーこそMaterial3の世界へ...

![Imgur](https://i.imgur.com/fa8uwGI.png)

# つまずいた点

## ScaffoldにSnackbarHostが無い

`Scaffold`を使うといい感じに`Snackbar`を表示できるんですけど、`Material3`の`Scaffold`には`Snackbar`を表示する機能が現状ないです。   `Snackbar`をComposeで表示させるには、`SnackbarHost`を追加すればいいので、`Scaffold`に`SnackbarHost`を追加したコンポーネントを作ります。

```kotlin
/**
 * Material3のScaffoldにSnackBar無いので適当に作る
 *
 * [Scaffold]に[SnackbarHost]を追加してるだけです。
 * */
@ExperimentalMaterial3Api
@Composable
fun M3Scaffold(
    modifier: Modifier = Modifier,
    scaffoldState: ScaffoldState = rememberScaffoldState(),
    snackbarHostState: SnackbarHostState = remember { SnackbarHostState() },
    topBar: @Composable () -> Unit = {},
    bottomBar: @Composable () -> Unit = {},
    floatingActionButton: @Composable () -> Unit = {},
    floatingActionButtonPosition: FabPosition = FabPosition.End,
    drawerContent: @Composable (ColumnScope.() -> Unit)? = null,
    drawerGesturesEnabled: Boolean = true,
    drawerShape: Shape = RoundedCornerShape(16.dp),
    drawerTonalElevation: Dp = DrawerDefaults.Elevation,
    drawerContainerColor: Color = MaterialTheme.colorScheme.surface,
    drawerContentColor: Color = contentColorFor(drawerContainerColor),
    drawerScrimColor: Color = DrawerDefaults.scrimColor,
    containerColor: Color = MaterialTheme.colorScheme.background,
    contentColor: Color = contentColorFor(containerColor),
    content: @Composable (PaddingValues) -> Unit,
) {
    Scaffold(
        modifier = modifier,
        scaffoldState = scaffoldState,
        topBar = topBar,
        bottomBar = bottomBar,
        floatingActionButton = floatingActionButton,
        floatingActionButtonPosition = floatingActionButtonPosition,
        drawerContent = drawerContent,
        drawerGesturesEnabled = drawerGesturesEnabled,
        drawerShape = drawerShape,
        drawerTonalElevation = drawerTonalElevation,
        drawerContainerColor = drawerContainerColor,
        drawerContentColor = drawerContentColor,
        drawerScrimColor = drawerScrimColor,
        containerColor = containerColor,
        contentColor = contentColor,
        content = {
            Box {
                content(it)
                SnackbarHost(
                    modifier = Modifier
                        .padding(it)
                        .align(Alignment.BottomCenter),
                    hostState = snackbarHostState
                )
            }
        }
    )
}
```

使う際はこんなふうに


```kotlin
val scaffoldState = rememberScaffoldState()
val snackbarHostState = remember { SnackbarHostState() }

LaunchedEffect(key1 = Unit, block = {
    snackbarHostState.showSnackbar("Hello World")
})

M3Scaffold(
    scaffoldState = scaffoldState,
    snackbarHostState = snackbarHostState,
    content = {
        // components...
    },
)
```

## @ExperimentalMaterial3Api vs @OptIn(ExperimentalMaterial3Api::class)

どっち使うかって話

- @ExperimentalMaterial3Api
    - 呼び出し先にも書かないといけない（伝搬する）
    - ライブラリ開発者が警告を出したいときに使う

- @OptIn(ExperimentalMaterial3Api::class)
    - 呼び出し先には書かなくていい（伝搬しない）
    - ライブラリ利用者が警告を飲んだ場合はこっちを使う

多分こんな感じだと思う。

## Material3版Surface の tonalElevation
`Surface`の引数の説明見るとこうです。

```
カラーがColorScheme.surfaceの場合、標高が高いほどライトテーマでは色が濃くなり、ダークテーマでは色が薄くなります。

DeepL翻訳
```

というわけで`Surface`の背景色が`ColorScheme.surface`の場合は`tonalElevation`を考慮する必要があるわけです。え？そんなのどうでもいいだって？

### NavigationBarの色にナビゲーションバーの色を設定したい

`NavigationBar`の色は`ColorScheme.surface`な訳ですが、`tonalElevation`が設定されているのでそのままでは同じ色には出来ません。

```kotlin
val context = LocalContext.current
val surfaceColor = MaterialTheme.colorScheme.surface
LaunchedEffect(key1 = surfaceColor, block = {
    (context as? Activity)?.window?.navigationBarColor = Color.argb(
        surfaceColor.toArgb().alpha,
        surfaceColor.toArgb().red,
        surfaceColor.toArgb().green,
        surfaceColor.toArgb().blue,
    )
})
```

そのために`ColorScheme.surfaceColorAtElevation`の実装をお借りします。  
`surfaceColorAtElevation`自体を使えればいいんですけど`internal`で保護されていて無理でした。

```kotlin
fun ColorScheme.applyTonalElevation(
    elevation: Dp,
): androidx.compose.ui.graphics.Color {
    if (elevation == 0.dp) return surface
    val alpha = ((4.5f * ln(elevation.value + 1)) + 2f) / 100f
    return primary.copy(alpha = alpha).compositeOver(surface)
}
```

あとは書き換えて

```kotlin
val context = LocalContext.current
val bottomNavColor = MaterialTheme.colorScheme.applyTonalElevation(3.dp)
LaunchedEffect(key1 = bottomNavColor, block = {
    (context as? Activity)?.window?.navigationBarColor = Color.argb(
        bottomNavColor.toArgb().alpha,
        bottomNavColor.toArgb().red,
        bottomNavColor.toArgb().green,
        bottomNavColor.toArgb().blue,
    )
})
```

これでナビゲーションバーの色を設定できました。  

![Imgur](https://i.imgur.com/F2wVIwz.png)

# 終わりに

Android 12L ってのが発表されたみたいですね。え？Android 3.0？知らないですね？（国産全盛期？）