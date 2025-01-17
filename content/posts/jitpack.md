---
title: JitPackでAndroidライブラリを公開する
created_at: 2020-11-01
tags:
- Android
- JitPack
- GitHub
---

自分用メモ（記事更新：2021/03/11）

# ライブラリ作成
## 適当なプロジェクトを作成します。
ここで作成したプロジェクトはExample的な役割をする。

## ライブラリを作成
上の`File`を押して、`New`を押して、`New Module...`を選択して、  
`Android Library`を選択して、ライブラリ名をつけます。

![Imgur](https://i.imgur.com/tQF3cW2.png)

## 最初に作ったプロジェクトでライブラリを参照できるようにする
`app`フォルダにある`build.gradle`(`app/build.gradle`)を開き、`dependencies { }`に書き足します。

```gradle
dependencies {
    // 作ったライブラリ
    implementation project(':ライブラリ名')
}
```

ライブラリ名が、`SearchPreferenceFragment`だった場合は、

```gradle
dependencies {
    // 作ったライブラリ
    implementation project(':SearchPreferenceFragment')
}
```

となります。

# JitPackで公開する流れ
## library/build.gradle
`ライブラリ名/build.gradle`（ライブラリ名のフォルダに有るbuild.gradle）を開いて、上の部分を書き換えます。

```gradle
plugins {
    id 'com.android.library'
    id 'kotlin-android'
    id 'kotlin-android-extensions'
    // JitPackで必要
    id 'maven-publish'
}

// これもJitPackで使う
group = 'com.github.takusan23'
```

`takusan23`の部分は各自違うと思う。

それから、一番下に行って数行書き足す必要があるみたいです。

```kotlin
afterEvaluate {
    publishing {
        publications {
            release(MavenPublication) {
                from components.release
                groupId = 'com.github.takusan23'
                artifactId = 'ComposeOrigamiLayout'
                version = '1.0'
            }
        }
    }
}
```

`groupId`は`group`と同じでいいと思う。  
`artifactId`にはGitHubのリポジトリ名を入れてね。
 
## jitpack.yml
ってファイルを作成します。場所はsrcフォルダとか.ideaフォルダがあるところです。  
ファイル名は`jitpack.yml`で。  

中身なんですけど、Javaのバージョンを指定します。なんかJava11が必要になったみたい。

```yml
jdk:
  - openjdk11
```

# 他の人に使ってもらう
## build.gradle
appフォルダでもない、ライブラリ名のついたフォルダでもない、`build.gradle`を開いて、以下のように書き足します

```gradle
allprojects {
    repositories {
        google()
        jcenter()
        maven { url 'https://jitpack.io' }
    }
}
```

`allprojects{ repositories{ } }`がない場合は、`settings.gradle`を開いてこうです。  

```gradle
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        jcenter() // Warning: this repository is going to shut down soon
        maven { url 'https://jitpack.io' } // これ
    }
}
```

## app/build.gradle
を開き、`dependencies{ }`に書き足します。

```gradle
dependencies {
    // 検索できるPreference
    implementation 'com.github.takusan23:SearchPreferenceFragment:1.0.0'
}
```

以上です。