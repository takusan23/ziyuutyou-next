---
title: Navigation3 にしたら AndroidViewModel が使えなかったので付け焼き刃する
created_at: 2026-01-06
tags:
- Android
- Kotlin
- JetpackCompose
- Navigation3
---

あけましておめでとうございます!!!  
年明けは`M.2 SSD`を換装して`Windows 11`にアップデートしてました。起動音がなるんだ。

# さきにこたえ
`CreationExtras`に`Application`がないエラーだったので、付け焼き刃ですが`Application`を渡せば解決。  
知らないうちに`LocalActivity`なるものが生えてる

```kotlin
SubScreen(
    viewModel = viewModel(
        extras = MutableCreationExtras(
            (LocalViewModelStoreOwner.current as? HasDefaultViewModelProviderFactory)?.defaultViewModelCreationExtras ?: CreationExtras.Empty
        ).apply {
            // Application を渡す付け焼き刃
            set(ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY, LocalActivity.current!!.application)
        }
    ),
    title = "ホーム画面"
)
```

# 本題
`Navigation3`と遊んでました。

感想はまたあとで！そんなことより！

```plaintext
java.lang.IllegalArgumentException: CreationExtras must have an application by `APPLICATION_KEY`
```

`Navigation3`でも同じように`ViewModel`をサポートしていますが、ついに、`AndroidViewModel`が切られてしまった。  
もともと`ViewModel`で`Context`を直で使うべきではないって`Android`が公式で言ってたので・・・

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidNavigation3AndroidViewModelTheme {
                MainScreen()
            }
        }
    }
}

class HomeViewModel(application: Application) : AndroidViewModel(application) // Android の ViewModel がエラーに...

@Composable
private fun MainScreen() {
    val backStack = rememberNavBackStack(Links.Home)
    NavDisplay(
        backStack = backStack,
        entryDecorators = listOf(
            rememberSaveableStateHolderNavEntryDecorator(),
            rememberViewModelStoreNavEntryDecorator()
        ),
        entryProvider = entryProvider {
            entry<Links.Home> { link ->
                SubScreen(
                    viewModel = viewModel(),
                    title = "ホーム画面"
                )
            }
        }
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SubScreen(
    viewModel: HomeViewModel,
    title: String
) {
    Scaffold(
        topBar = { TopAppBar(title = { Text(title) }) }
    ) { innerPadding ->
        // do nothing
    }
}

sealed interface Links : NavKey {
    @Serializable
    data object Home : Links
}
```

# 環境

`Android Studio Otter 2 Feature Drop | 2025.2.2 Patch 1`

```toml
[versions]
# 省略...
nav3Core = "1.0.0"
lifecycleViewmodelNav3 = "2.10.0"

[libraries]
# 省略...
androidx-navigation3-runtime = { module = "androidx.navigation3:navigation3-runtime", version.ref = "nav3Core" }
androidx-navigation3-ui = { module = "androidx.navigation3:navigation3-ui", version.ref = "nav3Core" }
androidx-lifecycle-viewmodel-navigation3 = { module = "androidx.lifecycle:lifecycle-viewmodel-navigation3", version.ref = "lifecycleViewmodelNav3" }
kotlinx-serialization-json = { module = "org.jetbrains.kotlinx:kotlinx-serialization-json", version.ref = "kotlinxSerialization" }

[plugins]
# 省略...
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
```

# 直し方
冒頭の通りです。`Issue`を見る限り`Application`がなくなったのは期待通りらしい。

https://issuetracker.google.com/issues/432380378

あと、追加で引数を渡したい場合は`factory =`の引数を埋めればよいです。

```kotlin
class HomeViewModel(application: Application, links: Links) : AndroidViewModel(application) // 画面遷移の data class も欲しい
```

```kotlin
SubScreen(
    viewModel = viewModel(
        extras = MutableCreationExtras(
            (LocalViewModelStoreOwner.current as? HasDefaultViewModelProviderFactory)?.defaultViewModelCreationExtras ?: CreationExtras.Empty
        ).apply {
            // Application を渡す付け焼き刃
            set(ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY, LocalActivity.current!!.application)
        },
        factory = viewModelFactory {
            initializer {
                HomeViewModel(
                    application = this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY]!!,
                    links = it // 引数がある場合
                )
            }
        }
    ),
    title = "ホーム画面"
)
```

おわり。

# ソースコード
いる?

https://github.com/takusan23/AndroidNavigation3AndroidViewModel

# Navigation3 感想
まだあんまり使えてないけど。真髄は`Scene`とかなんだと思う。

`Navigation2`であった`Compose Navigation`との違いは、バックスタック（画面遷移履歴）をつかさどる`rememberNavBackStack()`が、`MutableList`を実装している点でしょうか。  
画面遷移は`MutableList`を自分で操作することによって行うようになりました。`add()`すれば画面が切り替わり、`removeLastOrNull()`すれば画面が閉じられる。

`Navigation2`の時は今表示されてる画面を取得するのに、どっかのクラスにある`Flow`を`collectAsState()`したような気がしますが、  
今作ではただの配列になったので、`MutableList`の最後の要素を取るだけで済むはず。

あと配列を操作すればよくなったので、**前の画面に戻れない**挙動がすぐできるのが強い。  
これが一番のメリットかもしれない。`popUpTo()`と`inclusive`をいい感じにすればいいんだろうけどあの`API`わかりにくすぎる。

```kotlin
entry<NavigationLinkList.PermissionScreen> {
    PermissionScreen(
        onGranted = {
            // 履歴配列から消してホームを出す
            backStack += NavigationLinkList.HomeScreen
            backStack -= NavigationLinkList.PermissionScreen
        }
    )
}
entry<NavigationLinkList.HomeScreen> {
    HomeScreen(
        onNavigate = { dest -> backStack += dest }
    )
}
```

きになる点としては

```kotlin
composable("${NavigationPaths.VideoEditor.path}/{projectName}?openVideoInfo={openVideoInfo}") {
    VideoEditorScreen(
        onNavigate = { navigationPaths -> navController.navigate(navigationPaths.path) },
        onBack = { navController.popBackStack() }
    )
}
```

```kotlin
class VideoEditorViewModel(
    private val application: Application,
    private val savedStateHandle: SavedStateHandle
) : AndroidViewModel(application) {

    // SavedStateHandle 経由で
    val projectName: String = savedStateHandle["projectName"]!!
}
```

画面遷移のパラメーターを`SavedStateHandle`に自動的に入れてくれる機能がありましたが、**この機能は無くなったようです。**  
今のところ`viewModelFactory { }`で引数付き`ViewModel`を作れるようにする案と、`Koin`とかの`DI`ライブラリだともっと簡単に渡せるっぽいです。`DI`ライブラリに入門しておくんだった・・・

あとは文字列のパスから`data class`とかを使ったパスになった。パラメーターが型安全の一方、`kotlinx.serialization`がルーティングに必要な時代かと思った。  
たぶん`serialization`も`data class`も使わず`enum`でも動きそうな気はしますが、公式の方法から逸脱してまでする気も起きないので。