---
title: build.gradle.ktsへ移行してついでにGradleタスク入門
created_at: 2021-10-21
tags:
- Android
- Kotlin
- Gradle
---

(Android Studio Bumblebee 以降書き方変わったので一番最後も参照にしてください)

どうもこんばんわ。  
Android 12、あんま評判よくないな？1画面で見れる情報量が減った感はあると思う。  
オーバースクロール時の挙動は賛否両論？

# 本題
build.gradleをbuild.gradle.ktsへ書き換えます。  
自分用です。

移行するメリットは、どうだろう。

## 移行前

`build.gradle`

```java
// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:7.0.3'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:1.5.31"

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
```

`app/build.gradle`

```java
plugins {
    id 'com.android.application'
    id 'kotlin-android'
}

android {
    compileSdk 31
    buildToolsVersion "30.0.3"

    defaultConfig {
        applicationId "io.github.takusan23.mobilestatuswidget"
        minSdk 24
        targetSdk 31
        versionCode 2
        versionName "1.1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        viewBinding true
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = '1.8'
    }
}

dependencies {
    // グラフ
    implementation 'com.github.PhilJay:MPAndroidChart:v3.1.0'
    // Activity Result API
    implementation 'androidx.activity:activity-ktx:1.4.0-rc01'
    implementation 'androidx.fragment:fragment-ktx:1.3.6'
    // Coroutine
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.5.2"

    implementation 'androidx.core:core-ktx:1.6.0'
    implementation 'androidx.appcompat:appcompat:1.3.1'
    implementation 'com.google.android.material:material:1.4.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.1'
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.3'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.4.0'
}
```

# 移行する
名前を`build.gradle`から`build.gradle.kts`にします。  
ファイルを選んで`Shift`+`F6`で名前変更画面を呼び出せます。  

移行したらとりあえず`Sync now`押しましょう。直すべき項目が赤くなって出るはず。

## build.gradle.kts 移行例

```kotlin
// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:7.0.3")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:1.5.31")

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

tasks.register("clean") {
    doFirst {
        delete(rootProject.buildDir)
    }
}
```

一番最後の`tasks.register`は他にも書き方あるみたいなので調べてみてください。

## app/build.gradle.kts 移行例

```kotlin
plugins {
    id("com.android.application")
    id("kotlin-android")
}

android {
    compileSdk = 31
    buildToolsVersion = "30.0.3"

    defaultConfig {
        applicationId = "io.github.takusan23.mobilestatuswidget"
        minSdk = 24
        targetSdk = 31
        versionCode = 2
        versionName = "1.1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        viewBinding = true
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
}

dependencies {
    // グラフ
    implementation("com.github.PhilJay:MPAndroidChart:v3.1.0")
    // Activity Result API
    implementation("androidx.activity:activity-ktx:1.4.0-rc01")
    implementation("androidx.fragment:fragment-ktx:1.3.6")
    // Coroutine
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.5.2")

    implementation("androidx.core:core-ktx:1.6.0")
    implementation("androidx.appcompat:appcompat:1.3.1")
    implementation("com.google.android.material:material:1.4.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.1")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.3")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.4.0")
}
```

`Kotlin`っぽい書き方になって謎が減ったような気がする。

## 変数を使っている場合
`Jetpack Compose` ~~（略してJC）~~ を使っている例では、build.gradleでComposeのバージョンを変数で宣言して、`app/build.gradle`で参照しているのがよくあると思いますが、  
このままでは移行できないので書き直します。

### build.gralde.kts で変数を宣言します。

```kotlin
// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    
    /** Kotlinのバージョン */
    val kotlinVersion by extra("1.5.31")

    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:7.0.3")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:${kotlinVersion}")

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

tasks.register("clean") {
    doFirst {
        delete(rootProject.buildDir)
    }
}
```

文字列に埋め込む場合は`"${変数名}"`で出来ます。ここらへんはさすがKotlin

### app/build.gradle.kts で使う
さて、他のモジュールから参照する方法ですが、`rootProject.extra`で出来ます。

```kotlin
val kotlinVersion: String by rootProject.extra

plugins {
    id("com.android.application")
    id("kotlin-android")
}

android {
    compileSdk = 31
    buildToolsVersion = "30.0.3"

    // 省略
```

その他詳しく知りたい場合は：https://docs.gradle.org/current/userguide/kotlin_dsl.html

# おまけ

せっかくKotlinで`Gradle`かけるようになったんだし`Gradle Task`に入門してみた。  

## どういうこと？
![Imgur](https://i.imgur.com/sEs48Eb.png)

を押したときの処理が、`build.gradle.kts`の一番下に書いてある内容なんだけど、  

↓これ
```kotlin
tasks.register("clean") {
    println("run clean !!!!!")
    doFirst {
        delete(rootProject.buildDir)
    }
}
```

これを自分でかけるよって話。しかもKotlinでかける

## 新しいタスクを作成

```kotlin
tasks.register("helloWorld"){
    doFirst {
        println("Hello World")
    }
}
```

これではろーわーるどしてくれるタスクが完成です。`Sync now`しますかって上の方に出てると思うので、`Sync now`して、  
早速実行してみましょう。右上にある`Gradle`を押して、🐘のアイコンを押してmacOSのSpotlightみたいな入力欄が出たら、`gradle helloWorld`と打ちます。これで出るはず。

![Imgur](https://i.imgur.com/D2KXZ6q.png)

これで挨拶してくれれば成功

```
> Task :helloWorld
Hello World
```

## もう少し実用的なのを頼む

`app/build.gradle.kts`で追加しているライブラリ一覧を`libraryList.txt`として書き出すタスクです。

```kotlin
tasks.register("exportDependency") {
    doFirst {
        // テキストファイル保存先
        val libraryListFile = File(rootDir, "libraryList.txt")
        libraryListFile.createNewFile()
        // 書き込む文字列
        val libraryListText = project("app")
            .configurations["implementationDependenciesMetadata"]
            .resolvedConfiguration
            .firstLevelModuleDependencies
            .joinToString(separator = "\n-----\n") {
                """
                name = ${it.name}
                version = ${it.moduleVersion}
                """.trimIndent()
            }
        // 書き込む
        libraryListFile.writeText(libraryListText) // Kotlinの拡張関数も呼べる！？
    }
}
```

かけたら`Sync now`して実行してみます。

![Imgur](https://i.imgur.com/pnfG0CG.png)

実行すると、ファイルが出来ているはずです。

![Imgur](https://i.imgur.com/kH4LTbg.png)

オープンソースライブラリ一覧画面を作るときに役に立ちそうですね！

# おまけ 2021/11/23
`build.gradle.kts`後に謎のエラーが出る場合（文法とかはあってるのに）

![Imgur](https://i.imgur.com/pZA4RPN.png)

まずプロジェクトを閉じるかAndroid Studio自体を閉じます。  
その後、プロジェクトをエクスプローラー（macOSならあの顔のやつ。Finderだっけ？）で開いて、`.idea`を消すか、適当に名前を変えます。  

そのあと再度Android Studioでプロジェクトを開き、実行ボタンの近くにある`Make Project`ボタン（Ctrl+F9）を押せば治りました。  

# おまけ 2022/01/30 追記
Android Studio Bumblebee 以降書き方変わったので置いておきます

## トップレベル build.gradle.kts

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
`buildSrc`の話じゃなくてごめん。