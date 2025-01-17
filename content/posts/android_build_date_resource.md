---
title: Androidアプリのビルドした日付をアプリ側から取得できるようにする
created_at: 2022-02-09
tags:
- Android
- Gradle
- Kotlin
---
どうもこんばんわ。  
2月といえば次期Androidのデベロッパープレビューですよねって感じだけど、Android 12Lがある中果たしてリリースされるのか（？）

# 本題
Androidアプリのビルドしたときの日付をアプリ側から表示できるようにできるらしい。  
(build.gradle で `Context#getString` から参照可能なリソースを作成できるみたい)

## 公式

https://developer.android.com/studio/build/gradle-tips?hl=ja#share-custom-fields-and-resource-values-with-your-app-code

## 環境

| なまえ         | あたい                   |
|----------------|--------------------------|
| Android        | 12                       |
| Android Studio | Android Studio Bumblebee |

# build.gradle
`app`フォルダの方の`build.gradle`を開いて、こう書きます。

```java
android {
    compileSdk 31

    defaultConfig {
        applicationId "io.github.takusan23.androidbuilddateresource"
        minSdk 21
        targetSdk 31
        versionCode 1
        versionName "1.0"

        // ビルド日時を Context#getString で参照できるようにする
        resValue("string", "build_date", System.currentTimeMillis().toString())

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    // 省略...
```

あとは `R.string.build_date` で参照できます。 
UnixTimeを日付フォーマットに変更してTextViewなんかに入れれば完成。  
一度ビルドするまで<span style="color:red">赤いまんま</span>かもしれないです。

```kotlin
class MainActivity : AppCompatActivity() {

    private val textView by lazy { findViewById<TextView>(R.id.activity_main_textview) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        // ビルド日時
        val buildDate = getString(R.string.build_date).toLong()
        // 日付をフォーマットする
        val simpleDateFormat = SimpleDateFormat("yyyy/MM/dd HH:mm:ss", Locale.getDefault())
        val formatDate = simpleDateFormat.format(buildDate)
        // TextViewへ
        textView.text = formatDate
    }
}
```

以上です。

![Imgur](https://i.imgur.com/yJffXni.png)

### おまけ

`build.gradle.kts`の場合もほとんど同じです。

```kotlin
android {
    compileSdk = 31

    defaultConfig {
        applicationId = "io.github.takusan23.androidbuilddateresource"
        minSdk = 21
        targetSdk = 31
        versionCode = 1
        versionName = "1.0"

        // ヒルド日時を Context#getString で参照可能にする
        resValue("string", "build_date", System.currentTimeMillis().toString())

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    // 省略...
```