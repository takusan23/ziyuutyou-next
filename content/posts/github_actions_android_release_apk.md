---
title: GitHub Actions で AndroidのリリースAPK作成
created_at: 2022-02-03
tags:
- Android
- GitHub Actions
- Gradle
---

どうもこんばんわ。  
創作彼女の恋愛公式 攻略しました。

ゆめみちゃんが可愛かったです。アペンド配信まだですか！！！！

![Imgur](https://i.imgur.com/cDsSfhl.png)

表情いっぱいあるのかわいい。

![Imgur](https://i.imgur.com/1uoWiaU.png)

![Imgur](https://i.imgur.com/VaS7aQw.png)

共通が長いのが好きな方はどうぞ、わたし的には個別長いほうが良いかな

![Imgur](https://i.imgur.com/PBlokGv.png)


(え？グランドエンディング？...アペンド配信に期待)

# 本題
GitHub ActionsでAndroidのリリースAPKを作成したい！  
releaseブランチへpushしたら勝手にAPK作ってくれるようにしたい！

## GitHub Actions
このブログでも何回か登場してるやつ。  
ビルド作業とかを自分のPCじゃなくてGitHubのマシンでやらせることができる。  
しかもパブリックリポジトリなら無料！。  

今回はこれを使ってそこそこ時間のかかるAPK作成をGitHub Actions（**他の人のPC**）にやらせます！

## build.gradle.kts
今回は`kts`へ移行した`build.gradle.kts`を利用します。  
`build.gradle`の場合はコピペで動かないと思います；；

# 流れ
- (APK生成時のコードを管理しておく)releaseブランチを作成
- `build.gradle.kts`を編集してコマンドラインからAPKを作成して署名できるようにする
- 署名ファイルをBase64にする
- `GitHub Actions`を組む
- releaseブランチをpushする

# つくる

## releaseブランチを作成
今回は`release`ブランチを作成して、このブランチに対してpushがあった際に自動でAPKを作成するようにします。  
APKを作成したい場合はこのブランチへmasterの中身をマージしてpushすれば良いわけなんですね。

![Imgur](https://i.imgur.com/fcuuYib.png)

(もし最初からあるmasterブランチをpushするたびにapkを作りたい場合はこれの作業はいらない)

## build.gradle.ktsへ署名関係のプロパティを設定
appフォルダにある`build.gradle.kts`を開きます。  
`build.gradle`をお使いの方はすいませんわからないです(Kotlinしか分からんしKotlinも分からん)

そしてコピペしてください。

```kotlin
import java.util.*


android {

    // 省略
    
    // APK作成と署名の設定
    signingConfigs {
        // 環境変数から取りに行く
        create("release_signing_config") {
            // 存在しない場合はとりあえずスルーする
            if (System.getenv("ENV_SIGN_KEYSTORE_BASE64") != null) {
                // GitHubActionsの環境変数に入れておいた署名ファイルがBase64でエンコードされているので戻す
                System.getenv("ENV_SIGN_KEYSTORE_BASE64").let { base64 ->
                    val decoder = Base64.getDecoder()
                    // ルートフォルダに作成する
                    File("keystore.jks").also { file ->
                        file.createNewFile()
                        file.writeBytes(decoder.decode(base64))
                    }
                }
                // どうやら appフォルダ の中を見に行ってるみたいなのでプロジェクトのルートフォルダを指定する
                storeFile = File(rootProject.projectDir, "keystore.jks")
                keyAlias = System.getenv("ENV_SIGN_KEY_ALIAS")
                keyPassword = System.getenv("ENV_SIGN_KEY_PASSWORD")
                storePassword = System.getenv("ENV_SIGN_STORE_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            // 署名の設定を適用する
            signingConfig = signingConfigs.getByName("release_signing_config")
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

}
```

一番上の`import java.util.*`はBase64のデコードを行うために必要です。  

### 雑な解説的な

署名に使うパスワードとかは環境変数から取得するようにしました。  
`build.gradle.kts`へ直接書くとパスワードが誰でも見れてしまうので大問題です。  
じゃあどこにパスワードを保存しておくかという話ですが、GitHubのSecret機能にパスワードなんかの機密情報を登録しておきます。  
そしてGitHub Actionsの環境変数をセットする際にSecretの値を使うことで、安全にパスワードを渡すことが出来ます。

でも署名ファイルをどうやって渡すのかというのが問題になります。パスワードは文字列でしたが今回はファイルです。  
この問題を解決するのが`Base64`です。これを利用することでファイルをよく分からん文字列に変換してくれます（その逆も可）。文字列になったらこっちのものです。   
なのでSecretへ文字列になった署名ファイルを登録しておいて、  
ビルド時に文字列から署名ファイルを作成することで安全に署名ファイルも管理できました。

他の例だと、Base64へのエンコード/デコードをコマンドラインにやらせてる例がありますが、なんか`build.gradle.kts`の中でいい感じに変換できたのでこれで行きます。

## 署名ファイルをBase64にする
Androidアプリの署名で使ってる`keystore.jks`みたいなファイルをBase64に変換します。  
Windowsの標準機能でBase64に変換できるみたいなのでやってみましょう。

適当なフォルダでPowerShellとかを開いてコマンドを叩きます

![Imgur](https://i.imgur.com/EOXhnXm.png)

```
certutil -encode {署名ファイルのパス} encode.txt
```

コマンドを叩くと`encode.txt`が出来てると思うので開いて、  
`-----BEGIN CERTIFICATE-----`、`-----END CERTIFICATE-----`を消して  
改行も消します。

消せたらコピーします。

## GitHub の Secret へ登録
リポジトリの Secrets > Actions へ進みます。

![Imgur](https://i.imgur.com/Z9Ok9ar.png)

そしてこの中に署名で使うパスワード等を保存していくわけですが、  
さっきの`build.gradle.kts`をパクった場合の名前と値の対応表です↓  
名前変えた場合はそれぞれ変えて...

**New repository secret**から追加できます。

| 名前                     | 入れる中身               |
|--------------------------|--------------------------|
| ENV_SIGN_KEYSTORE_BASE64 | Base64にした署名ファイル |
| ENV_SIGN_KEY_ALIAS       | Key alias                |
| ENV_SIGN_KEY_PASSWORD    | Key password             |
| ENV_SIGN_STORE_PASSWORD  | Key store password       |

もしパクった場合はSecretはこうなります

![Imgur](https://i.imgur.com/guaG8dc.png)

## GitHub Actions を作成する

GitHubのリポジトリにある`Actions`から新しいワークフローを作成します。  
テンプレ置いておくので皆さんは Simple workflow を選んでいいですよ。

![Imgur](https://i.imgur.com/DmOATvW.png)

そしてAPKを作成するワークフローはこちらです！！！

```yml
name: Generate Release APK

on:
  # releaseブランチ更新時に起動する
  push:
    branches: [ release ]
  # 手動実行ボタン
  workflow_dispatch:
    
jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    
    # releaseブランチをチェックアウト
    - uses: actions/checkout@v2
      with:
        ref: 'release'

    # JDK導入
    - name: set up JDK 11
      uses: actions/setup-java@v2
      with:
        java-version: '11'
        distribution: 'temurin'
        cache: gradle
    
    # 権限を与える
    - name: Grant permission gradlew
      run: chmod +x gradlew
      
    # コマンドラインからAPKの作成。実行前に環境変数をGitHubActionsのSecretから取得
    - name: Building APK
      env:
        ENV_SIGN_KEYSTORE_BASE64: ${{secrets.ENV_SIGN_KEYSTORE_BASE64}}
        ENV_SIGN_KEY_ALIAS: ${{secrets.ENV_SIGN_KEY_ALIAS}}
        ENV_SIGN_KEY_PASSWORD: ${{secrets.ENV_SIGN_KEY_PASSWORD}}
        ENV_SIGN_STORE_PASSWORD: ${{secrets.ENV_SIGN_STORE_PASSWORD}}
      run: ./gradlew assembleRelease

    # アーティファクトとして保存
    - name: Upload artifact
      uses: actions/upload-artifact@v2
      with:
        name: app-release.apk
        path: app/build/outputs/apk/release/app-release.apk
```

もしブランチ名が違う場合は `branches: [ release ]` と `ref: 'release'` の`release`の部分を各自書き換えてください。(`master`とか？)  
GitHubのSecretは勝手に環境変数にはならないので、`env`で定義する必要があります。

出来たらコミット+プッシュしましょう。

![Imgur](https://i.imgur.com/DTux7Rj.png)

## release ブランチを push してみる
(releaseブランチをGitHub Actionsのトリガーにしていた場合)

releaseブランチに切り替えて、pushしてみます。  
これで動き始めるはず。Actionsタブへ移動します。

![Imgur](https://i.imgur.com/YBBHkun.png)

## 手動実行ボタンを使う
pushせずに動かすことが出来ます。ここをポチッと

![Imgur](https://i.imgur.com/7Wy1SaZ.png)

APKもちゃんとアーティファクトの欄にありますね。  
これで自分のPCへ負荷をかけずにAPKを作ることが出来ました。やったー

![Imgur](https://i.imgur.com/IwyCZpc.png)

### おまけ 自分のPCで確認する編
**Windows以外は知りません**

Android Studioのターミナルを開きます。

![Imgur](https://i.imgur.com/4knLAkM.png)

環境変数の設定をします。`{}`の部分は各自違うと思うのでそれぞれ入れてください

```bash
set ENV_SIGN_KEYSTORE_BASE64 = {Base64にした署名ファイル}
set ENV_SIGN_KEY_ALIAS = {Key alias}
set ENV_SIGN_KEY_PASSWORD = {Key password}
set ENV_SIGN_STORE_PASSWORD = {Key store password}
```

確認のために`set`を叩くと環境変数一覧を見ることが出来ます

```
set
```

パスワードとかに間違いがなければ以下のコマンドを入力します

```
gradlew assembleRelease
```

終わると `app/build/outputs/apk/release` の中にAPKが出来ていると思います。

# 終わりに

最低限の build.gradle.kts 置いておきます。

```kotlin
// トップレベル (appフォルダじゃない) build.gradle.kts

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

```kotlin
// appフォルダ内 build.gradle.kts

import java.util.*

plugins {
    id("com.android.application")
    id("kotlin-android")
    id("kotlin-kapt")
}

android {
    compileSdk = 31

    defaultConfig {
        applicationId = "io.github.takusan23.chocodroid"
        minSdk = 21
        targetSdk = 31
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    buildFeatures {
        viewBinding = true
    }

    // APK作成と署名の設定
    signingConfigs {
        /**
         * 予め GitHubActions の環境変数に入れておく
         *
         * ローカル環境で行う場合 (Windows cmd.exe)
         *
         * set ENV_SIGN_KEYSTORE_BASE64 = Base64エンコードした署名ファイル
         * set ENV_SIGN_KEY_ALIAS = KeyAlias
         * set ENV_SIGN_KEY_PASSWORD = KeyPassword
         * set ENV_SIGN_STORE_PASSWORD = StorePassword
         * */
        create("release_signing_config") {
            // 存在しない場合はとりあえずスルーする
            if (System.getenv("ENV_SIGN_KEYSTORE_BASE64") != null) {
                // GitHubActionsの環境変数に入れておいた署名ファイルがBase64でエンコードされているので戻す
                System.getenv("ENV_SIGN_KEYSTORE_BASE64").let { base64 ->
                    val decoder = Base64.getDecoder()
                    // ルートフォルダに作成する
                    File("keystore.jks").also { file ->
                        file.createNewFile()
                        file.writeBytes(decoder.decode(base64))
                    }
                }
                // どうやら appフォルダ の中を見に行ってるみたいなのでプロジェクトのルートフォルダを指定する
                storeFile = File(rootProject.projectDir, "keystore.jks")
                keyAlias = System.getenv("ENV_SIGN_KEY_ALIAS")
                keyPassword = System.getenv("ENV_SIGN_KEY_PASSWORD")
                storePassword = System.getenv("ENV_SIGN_STORE_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            // 署名の設定を適用する
            signingConfig = signingConfigs.getByName("release_signing_config")
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

}

dependencies {
  implementation("androidx.core:core-ktx:1.7.0")
  implementation("androidx.appcompat:appcompat:1.4.0")
  implementation("com.google.android.material:material:1.4.0")
  implementation("androidx.constraintlayout:constraintlayout:2.1.1")
  testImplementation("junit:junit:4.13.2")
  androidTestImplementation("androidx.test.ext:junit:1.1.3")
  androidTestImplementation("androidx.test.espresso:espresso-core:3.4.0")
}
```