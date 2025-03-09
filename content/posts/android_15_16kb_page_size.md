---
title: Hello Android 15。16KB ページサイズ編
created_at: 2025-03-09
tags:
- Android
- NDK
---
どうもこんばんわ。  
前回貼り付け忘れた画像です。かわいい

![Imgur](https://imgur.com/jCm54vd.png)

![Imgur](https://imgur.com/jrIgOoO.png)

# 本題
前回の続きっちゃそうですが、単品で読めます。  
https://takusan.negitoro.dev/posts/android_rust/

前回`NDK`を使うアプリを作りました。そうです、`各 CPU アーキテクチャ`向けにビルドするあれです。  
`NDK`を使う（使った）アプリを開発する際、この`16KB ページサイズ`に対応する必要があります。

# こうしき
- https://developer.android.com/guide/practices/page-sizes
- https://android-developers.googleblog.com/2024/12/get-your-apps-ready-for-16-kb-page-size-devices.html
- https://android-developers.googleblog.com/2024/08/adding-16-kb-page-size-to-android.html

# 対応する必要があるか確認
`リリース APK`を作った後に、`Analyze APK ...`を押すことで、`APK`の中を見れます。

![Imgur](https://imgur.com/jQlfyq8.png)

で、こんな感じに、`lib`フォルダがあれば対応が必要です。  
が、今のアプリ開発だと`libandroidx.graphics.path.so`が入ってしまう？

![Imgur](https://imgur.com/FBKC834.png)

# はじめに
この記事で言う**ネイティブコード**は、クロスプラットフォームの人たちが言う **各プラットフォームの開発言語 (Swift / Kotlin)** の事では無く、  
`C++`や`Rust`のような **Android NDK** が必要なコードのことを指します。

ネイティブライブラリに関しても同じ。

# AGP をバージョンアップ
https://developer.android.com/build/agp-upgrade-assistant

`AGP`バージョン`8.5.1`以上にすると**共有ライブラリのパッケージを更新する**のセクションは完了しそう。  
ネイティブコードを使ってる場合は、自分で対応するにしろ、対応してもらうにしろ何にしろ`AGP`のアップデートが必要そう？（よくわからない）  

私の環境の`Android Gradle Plugin`は`8.8.2`。  
`Android Studio`には`AGP Upgrade Assistant`がついているので古い場合は上げちゃえば良さそう。

![Imgur](https://imgur.com/Uz1eVNh,png)

# 対応パターン
多分このよっつ？

- ライブラリがネイティブコードを使ってる場合
- `AndroidX`の`libandroidx.graphics.path.so`、`libdatastore_shared_counter.so`だけ入ってる場合
    - `androidx.`から始まる（`Android Jetpack`）のライブラリが`.so`ファイルに依存している
- `Android Studio`で`CMakeLists.txt`とかを書いて`C++`をコンパイルしている場合
- 共有ライブラリを他のプロジェクトでビルドして、`Android`へ持ち込んでいる場合

# 使ってるライブラリがネイティブコードを使ってる場合
**ライブラリ作者にお願いしてきてください**  
よろしくお願いします

# AndroidX の .so ファイルのみが表示されている場合
`libandroidx.graphics.path.so`や`libdatastore_shared_counter.so`とかが表示されている場合。`androidx.`のライブラリを入れたら付いてきた場合。  
この場合は、**すでに 16KB ページサイズ**でライブラリを配布しているので問題ない（はず）です。観測してる範囲では。

## 証拠は
後述するのですが、`C++`のビルド時に参照する`CMakeLists.txt`を見ると、`16KB ページサイズ`でビルドするように追記されてました

- https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:graphics/graphics-path/src/main/cpp/CMakeLists.txt;l=14
- https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:datastore/datastore-core/src/androidMain/cpp/CMakeLists.txt;l=28

# 俺がライブラリ作者だ / ネイティブコードをビルドしている場合
がんばろう

## すでに 16KB ページサイズに対応しているか確認
https://developer.android.com/guide/practices/page-sizes#elf-alignment

`macOS / Linux`の場合はシェルスクリプトで確認できます。適当にテキストファイルを`.sh`で作り、シェルスクリプトを貼り付けてください。  
`vim`だとペーストモードが便利。

説明通りここからシェルスクリプトをコピーしてきます。  
https://cs.android.com/android/platform/superproject/main/+/main:system/extras/tools/check_elf_alignment.sh

`Linux`しか確認できていませんが、`chmod`で実行権限をつけた後、`./check_elf_alignment.sh {APKのパス}`コマンドで動くはず。

```shell
chmod +x check_elf_alignment.sh
./check_elf_alignment.sh app-release.apk
```

`Windows`の場合は`WSL2`か、あとはコマンドを愚直に叩く方法もある→ https://developer.android.com/guide/practices/page-sizes#windows-powershell  
ちなみに`GitBash`じゃ動かなかった、`unzip dir lib/*`の箇所でエラーになるのと、`GitBash`でも`objdump`が`windows`に無い。

以下が実行結果です、  
`UNALIGNED`が`16KB ページサイズ`未対応で、`ALIGNED`が対応済みです。もっぱら自分が用意した`.so`が未対応ですね、、

```shell
/tmp/app-release_out_6q4W9/lib/arm64-v8a/libandroid_jni.so: UNALIGNED (2**12)
/tmp/app-release_out_6q4W9/lib/arm64-v8a/libandroid_jni_without_simd.so: UNALIGNED (2**12)
/tmp/app-release_out_6q4W9/lib/arm64-v8a/libandroidx.graphics.path.so: ALIGNED (2**14)
/tmp/app-release_out_6q4W9/lib/arm64-v8a/libjnidispatch.so: ALIGNED (2**16)
/tmp/app-release_out_6q4W9/lib/arm64-v8a/libandroid_rust_uniffi.so: UNALIGNED (2**12)
```

# 対応方法
対応する必要がある`CPU アーキテクチャ`は`ARM 64 ビット（arm64-v8a）`、`x86_64`です。  
`32bit`はいいらしい。

この3つ？

- `Android Studio`で`CMakeLists.txt`を使って`C++`をビルドしている場合
- 他の`C++`プロジェクトを`Android NDK`でビルドして`.so`と`.h`を`Android Studio`へ持ち込んでいる場合
- `Android NDK`で`Rust`とかからクロスコンパイルしている場合

# 環境
`Android NDK r27`を使います。  
後述しますが`r28`を使えれば一番早いです。

![Imgur](https://imgur.com/2rQIIwE.png)

## 最短ルート
`Android NDK r28`以上を使って、あとはいつも通りビルドする。  
バージョンが上げられる場合は多分これが一番早い。

`Android Studio`以外でビルドする場合は`NDK`のパスを`r28`に置き換えれば良さそう。  
`Android Studio`で`C++`ビルドする場合は、`app/build.gradle (.kts)`で`ndkVersion = ""`を`28`のものにする必要があります。以下例。

```kotlin
android {
    // 以下省略...

    defaultConfig {
        // 以下省略...

        ndkVersion = "28.0.13004108"
    }

    // 以下省略...
}
```

## Android Studio で有効にする
一番多そう雰囲気（なぜか変換できる）。

https://developer.android.com/guide/practices/page-sizes#compile-r27

`C++`コードを`Android Studio`で書いている場合。  
この場合は`app`フォルダ内の`build.gradle (.kts)`に`arguments += listOf("-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON")`を書き足せばいいはず。

多分こう。

```kotlin
android {
    namespace = "io.github.takusan23.cppnativesample"
    compileSdk = 35

    defaultConfig {
        applicationId = "io.github.takusan23.cppnativesample"
        minSdk = 21
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // これを足す
        // This block is different from the one you use to link Gradle
        // to your CMake or ndk-build script.
        externalNativeBuild {
            // For ndk-build, instead use the ndkBuild block.
            cmake {
                // Passes optional arguments to CMake.
                arguments += listOf("-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON")
            }
        }
    }

    // 以下省略...
```

これで`APK`を作成しもう一度チェックしてみると、ちゃんと`arm64-v8a`、`x86_64`で`ALIGNED`になってました。

```shell
takusan23@DESKTOP-ULEKIDB:~$ ./check_elf_alignment.sh app-release-cpp.apk

Recursively analyzing app-release-cpp.apk

NOTICE: Zip alignment check requires build-tools version 35.0.0-rc3 or higher.
  You can install the latest build-tools by running the below command
  and updating your $PATH:

    sdkmanager "build-tools;35.0.0-rc3"

=== ELF alignment ===
/tmp/app-release-cpp_out_BGTqn/lib/x86_64/libcppnativesample.so: ALIGNED (2**14)
/tmp/app-release-cpp_out_BGTqn/lib/arm64-v8a/libcppnativesample.so: ALIGNED (2**14)
/tmp/app-release-cpp_out_BGTqn/lib/x86/libcppnativesample.so: UNALIGNED (2**12)
/tmp/app-release-cpp_out_BGTqn/lib/armeabi-v7a/libcppnativesample.so: UNALIGNED (2**12)
Found 2 unaligned libs (only arm64-v8a/x86_64 libs need to be aligned).
```

## Android Studio を使わない他の C++ プロジェクトで CMakeLists.txt に指定する
次はこのパターン  
`Android Studio`以外で`CMakeLists.txt`を使って共有ライブラリをビルドしている場合。

https://developer.android.com/guide/practices/page-sizes#compile-r27

`CMakeLists.txt`を使ってリンカーに引数をつければいいらしい。  
というわけで`Android`向けにビルドできる適当なプロジェクトで試します。今回は`UltraHDR`画像を作る`libultrahdr`をビルドしてみる。`Android`向けが公式にサポートされてるので。  
（`Android`の機能だからそれはそう）

`building.md`に従えば出来るはず。  
`cmake`と`ninja`を`apt`から`install`して、`Android NDK`をダウンロードして、指示通りコマンドを叩くだけ感。

しかし、これでビルドして`.so`を`APK`に入れても`16K ページサイズ`に対応してないので`UNALIGNED`になります。  
```shell
/tmp/app-release-other-project_out_7tCyK/lib/arm64-v8a/libuhdr.so: UNALIGNED (2**12)
```

というわけで`Android`ビルドで使ってる？`CMakeLists.txt`を探します。  
`libultrahdr`の場合は`android.cmake`がそれだったので、一番下にこれを書き足しました。`target_link_options`はなんかエラーになってしまった。

```txt
# Android 15 16K page-size support.
set(CMAKE_SHARED_LINKER_FLAGS "-Wl,-z,max-page-size=16384")
```

あとはこれでビルドすればいいはず。出来た`.so`を`main/jniLibs`の`CPU アーキテクチャ`のところに格納して終わりのはず。  
以下は面倒くさがって`arm64-v8a`しかビルドしてませんが、これで`ALIGNED`になりました。`libuhdr.so`です。

```shell
takusan23@DESKTOP-ULEKIDB:~$ ./check_elf_alignment.sh app-release-other-project-16k.apk

Recursively analyzing app-release-other-project-16k.apk

NOTICE: Zip alignment check requires build-tools version 35.0.0-rc3 or higher.
  You can install the latest build-tools by running the below command
  and updating your $PATH:

    sdkmanager "build-tools;35.0.0-rc3"

=== ELF alignment ===
/tmp/app-release-other-project-16k_out_EFo2u/lib/x86_64/libcppnativesample.so: ALIGNED (2**14)
/tmp/app-release-other-project-16k_out_EFo2u/lib/arm64-v8a/libcppnativesample.so: ALIGNED (2**14)
/tmp/app-release-other-project-16k_out_EFo2u/lib/arm64-v8a/libuhdr.so: ALIGNED (2**14)
/tmp/app-release-other-project-16k_out_EFo2u/lib/x86/libcppnativesample.so: UNALIGNED (2**12)
/tmp/app-release-other-project-16k_out_EFo2u/lib/armeabi-v7a/libcppnativesample.so: UNALIGNED (2**12)
Found 2 unaligned libs (only arm64-v8a/x86_64 libs need to be aligned).
=====================
```

![Imgur](https://imgur.com/b25wbD3.png)

## Rust などのクロスコンパイルで Android 向けビルドを 16KB ページサイズに対応させる
https://developer.android.com/guide/practices/page-sizes#compile-r27

`Rust`の`cargo`は`その他のビルドシステム`に当たるので、`-Wl,-z,max-page-size=16384`をどうにかして渡す必要があります。  

しらべた、  
https://stackoverflow.com/questions/39310905/

`cargo build`の際に、`RUSTFLAGS`で`-C link-arg=`に突っ込めば良さそう感。なのでこれでいいはず。

```shell
RUSTFLAGS='-C link-arg=-Wl,-z,max-page-size=16384' cargo build --release --target aarch64-linux-android
RUSTFLAGS='-C link-arg=-Wl,-z,max-page-size=16384' cargo build --release --target x86_64-linux-android
```

![Imgur](https://imgur.com/2n9sT9O.png)

できた`.so`を同様に`jniLibs`に配置すればいいはず。  
`APK`作ってチェックしてみたけど大丈夫そう。`libandroid_rust_jni.so`が`x86_64`と`arm64-v8a`で`ALIGNED`になってます！！

```shell
takusan23@DESKTOP-ULEKIDB:~$ ./check_elf_alignment.sh app-release-rust-jni.apk

Recursively analyzing app-release-rust-jni.apk

NOTICE: Zip alignment check requires build-tools version 35.0.0-rc3 or higher.
  You can install the latest build-tools by running the below command
  and updating your $PATH:

    sdkmanager "build-tools;35.0.0-rc3"

=== ELF alignment ===
/tmp/app-release-rust-jni_out_bm5NF/lib/x86_64/libandroid_rust_jni.so: ALIGNED (2**14)
/tmp/app-release-rust-jni_out_bm5NF/lib/x86_64/libandroidx.graphics.path.so: ALIGNED (2**14)
/tmp/app-release-rust-jni_out_bm5NF/lib/arm64-v8a/libandroid_rust_jni.so: ALIGNED (2**14)
/tmp/app-release-rust-jni_out_bm5NF/lib/arm64-v8a/libandroidx.graphics.path.so: ALIGNED (2**14)
/tmp/app-release-rust-jni_out_bm5NF/lib/x86/libandroid_rust_jni.so: UNALIGNED (2**12)
/tmp/app-release-rust-jni_out_bm5NF/lib/x86/libandroidx.graphics.path.so: ALIGNED (2**14)
/tmp/app-release-rust-jni_out_bm5NF/lib/armeabi-v7a/libandroid_rust_jni.so: UNALIGNED (2**12)
/tmp/app-release-rust-jni_out_bm5NF/lib/armeabi-v7a/libandroidx.graphics.path.so: ALIGNED (2**14)
Found 2 unaligned libs (only arm64-v8a/x86_64 libs need to be aligned).
```

![Imgur](https://imgur.com/2n9sT9O.png)

# 16KB ページサイズの動作確認
https://developer.android.com/guide/practices/page-sizes#16kb-emulator

エミュレーターで試せるらしい。  
起動できた。

![Imgur](https://imgur.com/NsUXOjV.png)

逆に`16KB ページサイズ`に対応してないと以下のような例外で落ちる。

```plaintext
FATAL EXCEPTION: main
Process: io.github.takusan23.androidrustjni, PID: 16320
java.lang.UnsatisfiedLinkError: dlopen failed: empty/missing DT_HASH/DT_GNU_HASH in "/data/app/~~S5iS_B60dhn6WlqTEzvegg==/io.github.takusan23.androidrustjni-HG0y1lLFYvVg6MvQNC3k2g==/lib/x86_64/libandroid_rust_jni.so" (new hash type from the future?)
    at java.lang.Runtime.loadLibrary0(Runtime.java:1081)
    at java.lang.Runtime.loadLibrary0(Runtime.java:1003)
    at java.lang.System.loadLibrary(System.java:1765)
    at io.github.takusan23.androidrustjni.MainActivity.<clinit>(MainActivity.kt:42)
    at java.lang.Class.newInstance(Native Method)
    at android.app.AppComponentFactory.instantiateActivity(AppComponentFactory.java:95)
    at androidx.core.app.CoreComponentFactory.instantiateActivity(CoreComponentFactory.java:44)
    at android.app.Instrumentation.newActivity(Instrumentation.java:1448)
    at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:3941)
    at android.app.ActivityThread.handleLaunchActivity(ActivityThread.java:4235)
    at android.app.servertransaction.LaunchActivityItem.execute(LaunchActivityItem.java:112)
    at android.app.servertransaction.TransactionExecutor.executeNonLifecycleItem(TransactionExecutor.java:174)
    at android.app.servertransaction.TransactionExecutor.executeTransactionItems(TransactionExecutor.java:109)
    at android.app.servertransaction.TransactionExecutor.execute(TransactionExecutor.java:81)
    at android.app.ActivityThread$H.handleMessage(ActivityThread.java:2636)
    at android.os.Handler.dispatchMessage(Handler.java:107)
    at android.os.Looper.loopOnce(Looper.java:232)
    at android.os.Looper.loop(Looper.java:317)
    at android.app.ActivityThread.main(ActivityThread.java:8705)
    at java.lang.reflect.Method.invoke(Native Method)
    at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:580)
    at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:886)
```

# 16KB ページサイズでビルドしたら古い端末で動くの？
https://android-developers.googleblog.com/2024/08/adding-16-kb-page-size-to-android.html

で書かれてる通り、`16KB ページサイズ`でビルドした共有ライブラリは`4KB デバイス`でも動くそうな。

一応古い端末を起動して試してみたけど、`Galaxy S7 Edge`（`Snapdragon 820 (64bit) / Android 7`）で起動できた。  
`16KB ページサイズ`の`.so`に置き換えるで問題なさそう。

![Imgur](https://imgur.com/l8xC482.png)

おわりです。お疲れ様でした。888