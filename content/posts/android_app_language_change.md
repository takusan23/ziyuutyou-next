---
title: Androidアプリ内の言語を変更する
created_at: 2020-07-24
tags:
- Android
- Kotlin
---

期末おわった！

# 本題
`Context#getString()`で日本語だったら日本語（日本語のstrings.xmlがあれば）表示できますが、これ英語verがほしいってのが今回のお話です

# こうです！

日本語だけど`Context#getString()`やレイアウトの`R.string.app_name`は英語の文字列が欲しいってときは、**Activity**や**Service**にこんな感じに

`MainActivity.kt`

```kotlin
/**
 * 言語変更機能をつける
 * 端末の設定で日本語でもこのアプリだけ英語で使うみたいな使い方ができます。
 * */
override fun attachBaseContext(newBase: Context?) {
    val configuration = Configuration()
    configuration.setLocale(Locale.ENGLISH)
    super.attachBaseContext(baseContext?.createConfigurationContext(configuration))
}
```

**Fragment**はActivityのが使われるそう？

以上です。おつかれ８８８