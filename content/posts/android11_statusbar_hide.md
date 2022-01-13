---
title: Hello Android 11。systemUiVisibility編
created_at: 2020-06-22
tags:
- Android
- Android11
- Kotlin
---

よーこそ`targetSdkVersion 30`の世界へ

# 本題
Activityを全画面にしたり、ステータスバー、ナビゲーションを一時的に消すときに`window?.decorView?.systemUiVisibility`がAndroid 11から非推奨になった  
代わりに`WindowInsetsController`を使って消すらしい。

# 環境

| なまえ  | あたい     |
|---------|------------|
| 端末    | Pixel 3 XL |
| Android | 11 Beta 1  |

# 非表示の種類
- **スワイプすることで一時的にはステータスバー、ナビゲーションバーが表示され、数秒操作しないとまた自動で全画面に戻る**
    - 動画アプリとか
    - `WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE`を使う（後述）
- **スワイプして、ステータスバーを表示させるけどそのまま表示したままになる**
    - どこで使ってるかはわからんな
    - `WindowInsetsController.BEHAVIOR_SHOW_BARS_BY_SWIPE`を使う（後述）

# 追記
Android 6 以降ならAndroidX(`androix.`から始まるパッケージ、クラスの最後に`Compat`がつく)によるバックポートがあるのでそれを使えばいいと思います。  
`WindowInsetsController`もAndroid 11から追加されたAPIですが、`AndroidX`(旧称：サポートライブラリ)を利用することでAndroid 6から対応することができます。

```kotlin
/**
 * キーボードを非表示にする。
 *
 * IMEで思い出した。XperiaのPOBox Plus返して。あれ使いやすかったのに
 *
 * @param activity Activity
 * */
fun hideKeyboard(activity: Activity) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        val insetsControllerCompat = WindowInsetsControllerCompat(activity.window, activity.window.decorView)
        insetsControllerCompat.hide(WindowInsetsCompat.Type.ime())
    }
}
```

# つくる

スワイプすると一時的に表示される方  
一時的に表示しているバーは半透明になっている。

```kotlin
supportActionBar?.hide()
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
    // ステータスバーの後ろにViewを潜らせるならこれも
    window?.setDecorFitsSystemWindows(false)
    // Android 11 以上と分岐
    window?.insetsController?.apply {
        // StatusBar + NavigationBar 非表示
        hide(WindowInsets.Type.systemBars())
        // スワイプで一時的に表示可能
        systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        // ノッチにも侵略
        window?.attributes?.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
    }
} else {
    // Android 10 以前。
    window?.decorView?.systemUiVisibility = View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
}
```

ノッチまでは広げなくていい場合は、ノッチにも侵略の一行をコメントアウトしてね。  

もし一時的に表示ではなく、一回表示したらずっと出っぱなしにする際は`systemBarsBehavior`を  

```kotlin
systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_BARS_BY_SWIPE
```

にすればいいと思います。

`Type#systemBars()`を使うと、ステータスバーとナビゲーションバーを消しますが、別に以下のコードでも動きます。  

```kotlin
// ステータスバー
hide(WindowInsets.Type.statusBars())
// ナビゲーションバー
hide(WindowInsets.Type.navigationBars())
```

# おまけ
IME（キーボードのこと）もこの`WindowInsetsController`を利用することで、一行で消せるようになりました。

```kotlin
window?.insetsController?.hide(WindowInsets.Type.ime())
```

キーボード隠すのなんか面倒だし成功したことないからこの方法が使えるのは嬉しい。🥳
