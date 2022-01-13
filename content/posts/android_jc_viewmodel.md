---
title: Jetpack Compose と ViewModel
created_at: 2021-05-22
tags:
- Android
- JetpackCompose
- Kotlin
---

どうもこんにちは。  
楽天モバイルのテザリングでこの記事書いてます。

# 本題
Jetpack ComposeでViewModelを使うときどうすればええの？

# なんかいい感じにやってくれる。
ViewModelにKeyを内部的に付けてくれるので、同じスコープでも複数のViewModelが持てました。よく考えてある

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ComposeViewModelTheme {
                // A surface container using the 'background' color from the theme
                Surface(color = MaterialTheme.colors.background) {

                    val currentPageName = remember { mutableStateOf("home") }

                    Scaffold(
                        bottomBar = {
                            BottomNavigation {
                                BottomNavigationItem(
                                    selected = currentPageName.value == "home",
                                    onClick = { currentPageName.value = "home" },
                                    label = { Text(text = "Home") },
                                    icon = { Icon(painter = painterResource(id = R.drawable.ic_baseline_home_24), contentDescription = "home") }
                                )
                                BottomNavigationItem(
                                    selected = currentPageName.value == "notification",
                                    onClick = { currentPageName.value = "notification" },
                                    label = { Text(text = "Notification") },
                                    icon = { Icon(painter = painterResource(id = R.drawable.ic_baseline_notifications_24), contentDescription = "notification") }
                                )
                            }
                        }
                    ) {
                        // ページ切り替え
                        when (currentPageName.value) {
                            "home" -> HomeScreen()
                            "notification" -> NotificationScreen()
                        }
                    }

                }
            }
        }
    }
}

@Composable
fun HomeScreen() {
    val viewModel = viewModel<HomeViewModel>()
    Text(text = "Home Screen ${viewModel.hashCode()}")
}

@Composable
fun NotificationScreen() {
    val viewModel = viewModel<NotificationViewModel>()
    Text(text = "Notification is empty ${viewModel.hashCode()}")
}
```

## ViewModelProvider#Factory
にも対応しています。

```kotlin
class InfoViewModel(application: Application, private val gameId: Int) : AndroidViewModel(application) {

}
```

```kotlin
class InfoViewModelFactory(val application: Application, val gameId: Int) : ViewModelProvider.Factory {

    override fun <T : ViewModel?> create(modelClass: Class<T>): T {
        return InfoViewModel(application, gameId) as T
    }

}
```

```kotlin
GameInfoScreen(viewModel = viewModel(factory = InfoViewModelFactory(application, "contentId")))
```

```kotlin
@Composable
fun GameInfoScreen(viewModel: InfoViewModel) {
    // 省略
}
```

以上です。

# サンプル
一つのActivityにJetpack Composeで2画面実現してます

https://github.com/takusan23/ErogameScapeDroid

# 終わりに
Jetpack Composeで書き直したいけど時間がない。