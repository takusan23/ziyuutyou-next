---
title: Android の C++ で使う共有ライブラリを追加する
created_at: 2025-08-14
tags:
- Android
- AndroidStudio
- C++
---
どうもこんばんわ。うお～～買うぞ

![dc](https://oekakityou.negitoro.dev/resize/1b5537f2-92fa-4a04-b727-052872423a71.png)

# 本題
`Android`向けにビルドした共有ライブラリ（ネイテイブライブラリ）を、`Android`アプリの`C++`コードから呼び出すほうほうです。  
`Android`の`C++`から、共有ライブラリ`.so`を呼び出す技。

# ちなみに
共有ライブラリを`JNI`経由で呼び出す場合はこの記事は役に立たないと思います。  
言語が`Rust`だけどこっちのが役に立つはず。

https://takusan.negitoro.dev/posts/android_rust/

# 環境
|                |                                              |
|----------------|----------------------------------------------|
| Android Studio | Android Studio Narwhal Feature Drop 2025.1.2 |
| Gradle         | 8.12.0                                       |
| CMake          | 3.22.1                                       |

# 用意するもの

![library](https://oekakityou.negitoro.dev/original/c6809a9a-298c-4ca0-b47e-3331762d5689.png)

- 各`CPU`向けにビルドした共有ライブラリのファイル`.so`
    - `C++`から呼び出したいやつ！
- ヘッダーファイル

# C++ コードを使えるようにする
新しいプロジェクトを作る画面で、`Native C++`を押しても良いのですが、  
`Android Studio`には既存のプロジェクトに`C++`コードを追加できる環境を構築する機能があるので、こちらを使います。

**つまり、あとから Jetpack Compose を入れるのはちょっとめんどいけど、あとから C++ コードを追加するのはボタンを何回か押すだけ。**

もちろん`Native C++`からプロジェクトを作ってもいいですが、`Jetpack Compose`を使いたいなら手動でいれる必要があって、、

## C++ コードを追加
ツールバーの`File`から`Add C++ to Module`をおして、あとはそのまま`OK`で。

![cpp1](https://oekakityou.negitoro.dev/original/d019db1d-72e0-4235-9148-a4532ac88b22.png)

こんな感じに`cpp`フォルダと、`CMakeLists.txt`が生成されていればOK

![cpp2](https://oekakityou.negitoro.dev/original/96e462ac-7234-4294-89df-4ee74a386d33.png)

# jniLibs フォルダの作成
（`Android Studio`のファイルツリー表示を`Android`から`File`にしたほうがいいかも）

`app/src/main`に`jniLibs`フォルダを作成します。  
また、その中に`CPU のアーキテクチャ（ABI）`の名前でフォルダを作り、その中に使いたい共有ライブラリを入れます。

`ARM 64bit`なら`arm64-v8a`ってフォルダ名、`x86-64`用のライブラリなら`x86_64`フォルダ名で。
めんどくさがって`ARM 64bit`しか用意しなかったのでさみしい感じに（）

`ARM 64bit`、`ARM 32Bit`、`x86-64`、`x86`の4つでそれぞれビルドしたライブラリを用意しないと、な気がします。

また、`C++`から書いて呼び出すためのヘッダーファイルですが、これも適当に`jniLibs`フォルダの中に`include`ってフォルダを作って、その中に入れようと思います。  
よって、こうなっているはず、

![cpp3](https://oekakityou.negitoro.dev/original/b2f97006-bde7-48e8-bfa6-5a40d16e4323.png)

# CMakeLists.txt を書く
あとはこのライブラリがリンクされるように書いていきます。  
が、何なのかよくわからないので全部張ります。

`libuhdr`は今回追加したライブラリの名前なので、そこは各自変えてください。  
あとコメントにもある通り、`Log.d`を`C++`から呼び出す場合は下2個書き足してください、

```cmake
# ここから
# 今回追加したライブラリ名が libuhdr になっているので、そうしている
add_library(libuhdr SHARED IMPORTED)

set_target_properties(
        libuhdr
        PROPERTIES IMPORTED_LOCATION
        ${CMAKE_SOURCE_DIR}/../jniLibs/${ANDROID_ABI}/libuhdr.so
)

include_directories(${CMAKE_SOURCE_DIR}/../jniLibs/include)

target_link_libraries(${CMAKE_PROJECT_NAME} libuhdr)

# Android の Log.d つかうなら以下2つ
find_library(log-lib log)
target_link_libraries(${CMAKE_PROJECT_NAME} ${log-lib})
```

これで`Gradle Sync`すると、`C++`コードからライブラリが呼び出せるはずです。

![cpp4](https://oekakityou.negitoro.dev/original/8ffa68d9-059b-4ae4-8fb0-678c97d393a4.png)

# C++ から呼び出す
これで`.cpp`からライブラリが呼び出せるようになったはずです。  
やった～

```cpp
// ヘッダーファイルが include できる
#include "ultrahdr_api.h"

void hello_world() {
    // ライブラリの関数が呼び出せた!!!!!
    auto encoder = uhdr_create_encoder();
    uhdr_release_encoder(encoder);
}
```

# おわりに
次回はこれを使って遊ぶ予定です。

# さんこうにしました

https://developer.android.com/studio/projects/configure-cmake?hl=ja#add-other-library

https://totechite.hatenablog.com/entry/2019/01/07/005327