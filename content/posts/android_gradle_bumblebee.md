---
title: Android Studio Bumblebee でトップレベルの build.gradle の書き方が変わったみたい
created_at: 2022-01-30
tags:
- Android
- AndroidStudio
- Gradle
---

どうもこんばんわ。  

# 本題
書き方変わってる

```java
// 今までのトップレベル build.gradle (appじゃない方)

// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath "com.android.tools.build:gradle:7.0.4"
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:1.6.10"

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
```

```java
// Android Studio Bumblebee 以降

buildscript {
    ext {
        compose_version = '1.1.0-rc03'
    }
}// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id 'com.android.application' version '7.1.0' apply false
    id 'com.android.library' version '7.1.0' apply false
    id 'org.jetbrains.kotlin.android' version '1.6.10' apply false
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
```

# 公式に案内あるやん

https://developer.android.com/studio/releases/gradle-plugin#settings-gradle

`buildscript`の`repositories`が`settings.gradle`へ移動したみたい

```java
// Android Studio Bumblebee 以降 の settings.gradle

pluginManagement {
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "JetpackComposeParentClickEvent"
include ':app'
```

# おまけ build.gradle.kts するなら

`Gradle 7.2`にすれば既存プロジェクトでも書き換えできるのかな？  

```
# gradle-wrapper.properties

distributionUrl=https\://services.gradle.org/distributions/gradle-7.2-bin.zip # ここを 7.2  
```

## build.gradle.kts (appフォルダじゃない方)

```kotlin
buildscript {
    val kotlinVersion: String by extra("1.6.10")
    val composeVersion: String by extra("1.1.0-rc03")
}
// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id("com.android.application").version("7.1.0").apply(false)
    id("com.android.library").version("7.1.0").apply(false)
    id("org.jetbrains.kotlin.android").version("1.6.10").apply(false)
}

tasks.register("clean") {
    doFirst {
        delete(rootProject.buildDir)
    }
}
```

## settings.gradle.kts

```kotlin
pluginManagement {
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        jcenter() // Warning: this repository is going to shut down soon
    }
}
// ここから下は各自書き換えて
rootProject.name = "ChocoDroid"
include(":app")
```

# 終わりに
ソフトバンクがAndroid/iPhone別のSIMを発行するの辞めたらしい