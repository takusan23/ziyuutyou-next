---
title: Hello Android12。RenderEffect編
created_at: 2021-03-18
tags:
- Android12
- Android
- Kotlin
---
マテリアルデザインって半透明とかぼかしとかやらないイメージある

# 本題

`Android 12 DP2`に、Viewをぼかしたりできる`RenderEffect API`が追加されたので試してみる

![Imgur](https://i.imgur.com/aW11fUG.png)

## 環境

| なまえ  | あたい     |
|---------|------------|
| Android | 12 DP2     |
| 端末    | Pixel 3 XL |

## バージョン
Android 12な環境が必要です。  
`SDK Manager`から`Android S Preview`を入れておいてください。  

また、build.gradleは以下のように

```gradle
android {
    compileSdkVersion "android-S"
    buildToolsVersion "30.0.3"

    defaultConfig {
        applicationId "io.github.takusan23.android12blur"
        minSdkVersion "S"
        targetSdkVersion "S"
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    // 省略
}
```

## activity_main.xml
好きなViewを置けばいいです

## MainActivity.kt
`View#setRenderEffect()`を呼べばおk

```kotlin
imageView.post {
    imageView.setRenderEffect(RenderEffect.createBlurEffect(10f, 10f, Shader.TileMode.CLAMP))
}
```

# おわりに

GitHubにコード上げときました

https://github.com/takusan23/Android12Blur