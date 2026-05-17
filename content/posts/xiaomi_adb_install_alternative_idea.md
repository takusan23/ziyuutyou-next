---
title: Xiaomi の端末で adb install ができないので代替案を考える
created_at: 2026-05-18
tags:
- Android
- AndroidStudio
---
どうもこんばんわ。`Google I/O`もうすぐってマジ？  
`Android 開発`のサイトを見ると`Android 17`の新機能（`新API`）があんまり書かれてないのですが、`API 追加差分`を見るとそこそこ増えている。

たとえば`MediaProjection`（画面共有`API`）に、既存の画面共有に加えて`アプリコンテンツプロジェクション？`とか言うのが追加されたのですが、↑で取り上げられてないため何者なのかは分かっていません。  
あとは、ついに`SurfaceView`をぼかす？`API`が追加される模様。やった！！！でも`Android 17`以降しか使えない悲しみも同時に襲われる。

これらが`Google I/O`で発表があるかは謎です。

# 本題
`Xiaomi`のスマートフォンは、なぜか`adb install`するためには`USB デバッグ`とは別の設定を有効にする必要があるのですが、  
この設定を有効にするには`SIM カード`を刺したり`Xiaomi`のアカウントが要求される謎の仕様がある。

パソコンから`apk`をインストールしたいが、`SIM`カード刺したりアカウントうんぬんは出来ないとして、`adb install`以外の方法を考える必要がある。

# 先に答え
`apk`ファイルを転送→`APK ファイル`を処理できるサードパーティーアプリの`Activity`を開く→その`サードパーティーアプリ`経由で`apk`をインストールする。  
この方法のデメリットは、`apk`をインストールしてくれるサードパーティーアプリを探す手間があるのと、画面でいちいちインストールボタンを押さないといけない点だが、  
必要な手順の半分くらいはショートカットできた、

## 必要なもの
`apk`ファイルを`Activity`で受け入れてインストールをしてくれるアプリを探す必要があります。  
`SAI`なら`<intent-filter>`で受け入れてインストールしてくれてそうです。てかこれくらいなら自分で作ってもよいかもしれませんね？

- `SAI`
    - https://github.com/aefyr/SAI
    - `ファイルアクセス`権限を与えてください

![grant_file_permission](https://oekakityou.negitoro.dev/resize/550e516e-45ae-4cbb-8c6c-ffc6e2faefd4.png)

## AndroidStudio を使っている
`Android`開発の場合は、`build.gradle.kts`にこの`Gradle タスク`を書けばよい。`build.gradle`をまだ使ってる？そんな、、、  
このタスクを`Android Studio`で実行すれば、二回目以降は再生ボタンを押したときの挙動がこのタスクの実行になる。

ただ、`:app`モジュール（`Android Studio`初期状態のやつ）の、`プロダクト フレーバー`も使ってない状態のコードなので、  
`assembleDebug`の部分も、`apk`のパスも修正が必要かもしれない。

`cmd`も`Windows`なので`macOS`とかだと使えないな

```kotlin
tasks.register<Exec>("xiaomiAdbInstallAlternative") {
    // app モジュール想定
    // デバッグ APK を作る
    dependsOn("app:assembleDebug")
    // APK を探す
    val apkFile = project.project("app").projectDir
        .resolve("build")
        .resolve("outputs")
        .resolve("apk")
        .resolve("debug")
        .resolve("app-debug.apk")
    // ADB を探すために local.properties を見る
    val properties = project.rootProject.file("local.properties").inputStream().use { inputStream ->
        java.util.Properties().apply {
            load(inputStream)
        }
    }
    val sdkFolder = File(properties["sdk.dir"].toString())
    val adbBin = sdkFolder.resolve("platform-tools").resolve("adb.exe")
    // apk を転送して、APK を受け入れる Activity を開く
    commandLine("cmd", "/c", "${adbBin.path} push ${apkFile.path} /sdcard/app-debug.apk && ${adbBin.path} shell am start -d file:///storage/emulated/0/app-debug.apk -a android.intent.action.VIEW -t application/vnd.android.package-archive")
    // この先は Android 端末でインストールする...
}
```

![android_studio_edit_build_gradle_kts](https://oekakityou.negitoro.dev/original/204f9783-e76f-4f65-aea7-7fc08778f887.png)

![android_studio_run_gradle_task](https://oekakityou.negitoro.dev/original/175d44c4-0743-4f4f-84c2-ced0111f3e18.png)

実行すると、こんな感じに`SAI`がインストールするか聞いてくれるので、インストールボタンを押す。この工程はたぶんスキップできないため、`adb install`をちゃんと使えるようにする方が良いかと。

![install_app_from_sai](https://oekakityou.negitoro.dev/resize/139ab5d1-f028-4f6e-85fc-375d7afbbdfa.png)

これの良くないところは`APK`転送と`Activity`起動のコマンドを無理やりつないで`commandLine()`に渡してますが、  
たぶん正解は`tasks.register()`を`APK 転送`と`Activity 起動`で分けるのだと思います。

## シェルスクリプトなら使える
もしマルチプラットフォームで`VSCode`を使っている場合などは、こんな感じの`シェルスクリプト`を書けばよいはず。  
以下の`シェルスクリプト`は`Windows`の`Git Bash`で動くのをみました。`bat ?`は`Windows`ユーザーなのに書いたことなく`sh`です！

`Linux`とか`macOS`の場合、たぶん`パス区切り～`とかの部分をすっ飛ばせるはず。`sed 's/\\\\/\//g' | sed 's/C\\:/\/c/g'`の部分。そもそもここやらないとだめなんですかね（？）  

マルチプラットフォーム、ろくに触ったことないから何のコマンドで`デバッグ APK`作れるのか知らない。`gradlew`直接呼ぶの違う気がしてきた。  
`APK`のパスとかも皆さんの環境に合わせてください。

```sh
# デバッグ APK をつくるコマンド
./gradlew assembleDebug
# local.properties から ADB のパスを探す
GRADLE_MODULE_NAME='app'
# sdk.dir= を消し、パス区切りを修正し、C\: を /c/ にする
SDK_PATH=$(cat local.properties | sed -n '$p' | sed 's/sdk.dir=//' | sed 's/\\\\/\//g' | sed 's/C\\:/\/c/g')
APK_PATH="${GRADLE_MODULE_NAME}/build/outputs/apk/debug/app-debug.apk"
ADB_PATH="${SDK_PATH}/platform-tools/adb.exe"

# 転送する
# 先頭の // の出所はここ → https://stackoverflow.com/questions/16344985
"${ADB_PATH}" push "${APK_PATH}" "//sdcard\app-debug.apk"

# APK を処理できる Activity を立ち上げる
${ADB_PATH} shell am start -d file:///storage/emulated/0/app-debug.apk -a android.intent.action.VIEW -t application/vnd.android.package-archive
```

# ことのはじまり
`adb install`できないし、`apk`を転送してファイルマネージャーで開くのもつらい。  
かといって`adb install`を使えるようにするのもめんどい。`adb install`を無理やり有効にする案があるとかないとからしいんですが、一旦ここから離れた案を探したほうがよさそう。

## 普通に APK ファイルを入れることはできる
`adb install`だけを弾いてるっぽいので、まあよく考えたらできる。  
ほな`APK`をインストールしてくれる（`APK`インストールのダイアログを開いてくれるアプリ）を探せばよさそう。

## 作戦
これが`Gradle`とかシェルスクリプトでやってることです！

`デバッグ APK 作成`→`Android 端末`の適当なところに転送→`APK インストール ダイアログ`を開いてくれるアプリを立ち上げる

で最後に、**人間がインストールボタンを押す**

# おわりに
`adb`の`PATH`は通ってるはず（もしくは通してるはず）なので、`Android SDK`の中の`platform-tools/adb.exe`を探すことなく`adb`コマンドを叩けるはずです。  
私が書いたコードは無駄に`local.properties`から`adb`を探しているのでたぶん無駄です。