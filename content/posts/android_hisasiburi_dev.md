---
title: 少し前のアプリの改修をしたときのメモ
created_at: 2021-08-07
tags:
- Android
- Kotlin
---
どうもこんばんわ。   
`kotlin-android-extensions`が現役の頃のアプリです。

# 本題
少し前に作ったアプリにレビューがついてたので改修しようとしたときに遭遇したことなど。

# Android Gradle plugin requires Java 11 to run. You are currently using Java 1.8.

Gradleのバージョンを`7.x`系にすると言われる。

`build.gradle`(appじゃない)を開いて、`com.android.tools.build:gradle:7.0.0`にして、`gradle-wapper.properties`も`7.x`系にすると言われます。このエラー

```gradle
buildscript {
    ext.kotlin_version = '1.5.10'
    repositories {
        google()
        jcenter()
    }
    dependencies {
        // これ7.xへ
        classpath 'com.android.tools.build:gradle:7.0.0'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}
```

```properties
#Sat Aug 07 02:47:13 JST 2021
distributionBase=GRADLE_USER_HOME
#これ7.x系へ
distributionUrl=https\://services.gradle.org/distributions/gradle-7.0.2-bin.zip
distributionPath=wrapper/dists
zipStorePath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
```

このエラーの解決方法ですが、`IDEA`の設定を開き、`Build, Execution, Deployment`へ進み、`Build Tools`の中の`Gradle`を選び、`Gradle JDK`を`Java 11以降`にすればいいです。

![Imgur](https://imgur.com/G3obZ0x.png)

# Execution failed for task ':app:kaptDebugKotlin'.

```
Execution failed for task ':app:kaptDebugKotlin'.
> A failure occurred while executing org.jetbrains.kotlin.gradle.internal.KaptWithoutKotlincTask$KaptExecutionWorkAction
   > java.lang.reflect.InvocationTargetException (no error message)
```

これはプロジェクトを一旦閉じて、プロジェクトをエクスプローラーで開いた後、`.idea`フォルダを消して、再度プロジェクトを開くとなんか治りました。なぜ？

以上です。

# 終わりに
緊急速報メールはSIMカードが刺さっていれば契約の有無に関係なく受信出来るらしい。