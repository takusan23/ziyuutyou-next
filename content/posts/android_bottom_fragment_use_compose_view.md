---
title: BottomSheetDialogFragmentとかDialogでComposeViewが使えない
created_at: 2021-02-26
tags:
- Android
- Kotlin
---

~~`alpha 12`から直ってない~~  
 `beta02`で修正されました。更新手順は、  
`app/build.gradle`のKotlinバージョン、Composeのバージョンを以下のように変更し、

```gradle
// Compose関係
composeOptions {
    kotlinCompilerVersion '1.4.31'
    kotlinCompilerExtensionVersion '1.0.0-beta02'
}
```

Composeのバージョンを上げて、  
`Fragment`、`AppCompat`のバージョンを`1.3`以上にすればこの問題は修正できます。

```gradle
dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])

    implementation "androidx.compose.ui:ui:1.0.0-beta02"
    // Tooling support (Previews, etc.)
    implementation "androidx.compose.ui:ui-tooling:1.0.0-beta02"
    // Foundation (Border, Background, Box, Image, Scroll, shapes, animations, etc.)
    implementation "androidx.compose.foundation:foundation:1.0.0-beta02"
    // Material Design
    implementation "androidx.compose.material:material:1.0.0-beta02"
    // Integration with observables
    implementation "androidx.compose.runtime:runtime-livedata:1.0.0-beta02"
    // LayoutInspector
    implementation "androidx.compose.ui:ui-tooling:1.0.0-beta02"

    // fragment
    implementation 'androidx.fragment:fragment-ktx:1.3.1'

    // appcompat
    implementation 'androidx.appcompat:appcompat:1.3.0-beta01'

}
```

# 本題
`BottomSheetDialogFragment`の`onCreateView`の返り値として`ComposeView()`を使うとエラーが出る問題

```java
java.lang.IllegalStateException: ViewTreeLifecycleOwner not found from DecorView@b98b3fc[MainActivity]
```

# 環境

| name    | value        |
|---------|--------------|
| Compose | 1.0.0 Beta 1 |

## なんで？
`ViewTreeLifecycleOwner`っていう`View`から`Activity/Fragment`のライフライクルを取得できるやつがあるんですけど、  
親Viewを指定して`ViewTreeLifecycleOwner.get()`を呼ぶとなぜかnullが返ってくる

# 解決方法
お好きな方をどうぞ
- `ViewTreeLifecycleOwner`(と`Recomposer`)を指定する
- `androidx.fragment`をスナップショット版にする

## `ViewTreeLifecycleOwner`を指定する

`Compose`で使ってる`Recomposer`を作るのに`ViewTreeLifecycleOwner`が必要だった模様。  
というわけで`Recomposer`を作って渡してあげる必要があります

`ViewTreeLifecycleOwner.set()`の第二引数は`Activity`の場合は`Activity`を（this）、  
`Fragment`の場合は`viewLifecycleOwner`を渡してあげてください

```kotlin
class BottomFragmentCompose : BottomSheetDialogFragment() {

    @InternalComposeUiApi
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        return ComposeView(requireContext()).apply {

            ViewTreeLifecycleOwner.set(this, viewLifecycleOwner)
            val newRecomposer = AtomicReference(WindowRecomposerFactory.LifecycleAware).get().createRecomposer(rootView)
            compositionContext = newRecomposer

            setContent {
                Text(
                    text = "BottomSheetDialogFragment + ComposeView",
                    modifier = Modifier.padding(10.dp)
                )
            }
        }
    }

}
```

`Dialog`で`ComposeView`を使う場合は`ViewTreeSavedStateRegistryOwner`の指定も必要かも

```kotlin
@InternalComposeUiApi
private fun showDialog() {
    Dialog(this).apply {
        setContentView(ComposeView(context).apply {
            ViewTreeLifecycleOwner.set(this, this@MainActivity)
            ViewTreeSavedStateRegistryOwner.set(this, this@MainActivity)
            val newRecomposer = AtomicReference(WindowRecomposerFactory.LifecycleAware).get().createRecomposer(this)
            compositionContext = newRecomposer
            setContent {
                Text(
                    text = "Dialog + ComposeView",
                    modifier = Modifier.padding(10.dp)
                )
            }
        })
    }.show()
}
```

## Fragmentをスナップショット版にする
ついさっき知ったんですけど、`build.gradle`から`allprojects`が消滅してた。(gradleが6.8になった影響？)  
代替として、`settings.gradle`に`dependencyResolutionManagement`が追加された模様  


### allprojectがある場合

```gradle
allprojects {
    repositories {
        google()
        jcenter()
        maven { url 'https://androidx.dev/snapshots/builds/7172350/artifacts/repository' } // これを書き足す
    }
}
```

あとは`app`フォルダにある`build.gradle`を開いて、`androidx.fragment`をアップデートします

```gradle
dependencies {
    implementation "androidx.fragment:fragment:1.4.0-SNAPSHOT"
}
```

### dependencyResolutionManagementの場合
`settings.gradle`を開いて書き足す

```gradle
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        jcenter() // Warning: this repository is going to shut down soon
        maven { url 'https://androidx.dev/snapshots/builds/7172350/artifacts/repository' }
    }
}
```

あとは`app`フォルダにある`build.gradle`を開いて、`androidx.fragment`をアップデートします

```gradle
dependencies {
    implementation "androidx.fragment:fragment:1.4.0-SNAPSHOT"
}
```

# おわりに
dependencyResolutionManagement ってなに  

あとソースコード置いておきます  

https://github.com/takusan23/BottomFragmentComposeView

# 参考にしました
https://issuetracker.google.com/issues/180691023