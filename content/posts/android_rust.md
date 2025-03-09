---
title: Android と Rust
created_at: 2025-03-04
tags:
- Android
- Rust
- NDK
---

どうもこんばんわ。  
スカイコード 攻略しました。`OP曲`がかっこよくて気になってたやつ

<iframe width="560" height="315" src="https://www.youtube.com/embed/vr4K5W8tJ2k?si=ZzlmAtmaTpSgzkY0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

この先どうなるんや、、が続くゲームでよかった（語彙力。作中じゃないけどシナリオに惹かれた  
？な発言もちゃんと回収してた

![Imgur](https://imgur.com/JlBUwQb.png)

天使ちゃんかわいい。  
重いシーンが何個かあって個別あるか心配だった、あります。

![Imgur](https://imgur.com/pid40BV.png)

![Imgur](https://imgur.com/F1SlyKh.png)

![Imgur](https://imgur.com/mNfAJ92.png)

![Imgur](https://imgur.com/mJFHepX.png)

！！！あがっちゃうシンジュちゃん  
かわいい！！

![Imgur](https://imgur.com/c66ajWK.png)

![Imgur](https://imgur.com/HTHyEeE.png)

![Imgur](https://imgur.com/tic2adH.png)

あと天使ちゃんルートの中間曲がとてもいい！！シンジュちゃんのところ  
しばらくリピートしてる、CD買ってよかった。

![Imgur](https://imgur.com/qklJMhz.png)

えちえちシーンも結構良かった！！！、、（けど本筋の話が気になってそれどころじゃないよ；；）  

![Imgur](https://imgur.com/S5vKycq.png)

それはそうと、何回か(も?)気持ちが揺さぶられて疲れた、、、。休み明けのシンジュちゃんのやつは結構効いた  
シンジュちゃんEDの後はどうなったのか、、な

# 本題
ふと、`Rust 言語`を書いてみたくなった。  
というのも、`Android 開発者`は難しい`C++`で処理を書いて`JNI`で繋いで呼び出せば速くなると盲目的に思ってる（節がある）（私だけか。）

ただ`C++`難しいそうだなあ～思ってたところ、`Rust`を`Android の CPU`向けにクロスコンパイル出来るらしく、しかも簡単な方法があると聞いた。  
本当に速いか確かめます。

# はじめに
この記事で言う**ネイティブコード**は、クロスプラットフォームの人たちが言う **各プラットフォームの開発言語 (Swift / Kotlin)** の事では無く、  
`C++`や`Rust`のような **Android NDK** が必要なコードのことを指します。

ネイティブライブラリも同様に`Rust`をコンパイルしたやつを指します。

# Android で Rust を呼び出す方法
調べた感じ、2つくらい`Rust`コードを呼び出す方法があるっぽい。

- https://mozilla.github.io/firefox-browser-architecture/experiments/2017-09-21-rust-on-android.html
    - ちょい古いですが今も大体同じです
- https://mozilla.github.io/uniffi-rs/latest/
    - 情報があんまり無いですが、難しくない

前者の古い方が`C++`と同じような感じで、`Java Native Interface (JNI)`の形式で関数を書いてコンパイルしてって感じのやつ。  
後者が`Rust`コードを少し書き足すだけで`Rust`と`Kotlin`を繋ぐバインディングを自動で生成してくれるというもの。自動生成とは言え使うのは難しくない。

ただ、前者は`JNI`なので**複雑**、後者は`JNI`とは別の`Java Native Access (JNA)`を採用しているためか**速度が出ない**という欠点があります。  
今回のように速度を出して欲しいときは`JNI`の方を使う必要があるかも。

# 環境
`Windows`を使いますが、どうやら`Windows`で`Rust`するには`Visual Studio Installer`を経由して数GBのビルドツールを入れないといけないらしい。（本当？）  
`without Visual Studio Installer`でセットアップする方法ないのかな...  
https://www.rust-lang.org/ja/tools/install

数回しか使わないのに面倒すぎるので、今回は`WSL 2`をインストールし`Linux`で`Rust`することにします。今回`Android`向けにビルドするため、別に`Windows`で動く必要ないので。~~容量無くなったらすぐ消したいしで~~  
また、`Rust`を書く際に`VSCode`を使います。何でも良いです。

| なまえ       | あたい                                                   |
|--------------|----------------------------------------------------------|
| パソコン     | Windows 10 Pro                                           |
| Rust 開発    | WSL 2 ( Ubuntu )                                         |
| Android 端末 | Pixel 8 Pro / Xperia 1 V                                 |
| Rust         | rustc 1.85.0 (4d91de4e4 2025-02-17)                      |
| UniFFI       | 0.29                                                     |
| Android NDK  | 27 ( `WSL2`で`Rust`をビルドする場合は`Windows`側は不要 ) |

`DiskInfo3`のお陰で、`Cドライブ`を少し開放できたので`WSL 2`を入れます。ちょいまって  
古い`Android Studio`の残骸を消したら空いた。  
![Imgur](https://imgur.com/7TPf4je.png)

# Rust
`Rust`ほとんどやったこと無いので、まずはチュートリアルをこなしてみる。  
`Rust`のマスコットキャラクター？のカニが挨拶をしてくれるプログラムを作るらしいです。

## Rust を入れる
`Linux`なのでこっち。

```plaintext
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

![Imgur](https://imgur.com/CzKHGNN.png)

そのままエンターでいいはず。

```plaintext
1) Proceed with standard installation (default - just press enter)
2) Customize installation
3) Cancel installation
```

`Rust is installed now. Great!`って表示されれば良いはず。  
ターミナルを再起動します。面倒なので`exit`で抜けて再起動するか。

あと私の場合は`error: linker cc not found`エラーが表示されたため、以下のコマンドを叩く必要がありました。

```plaintext
sudo apt update
sudo apt upgrade
sudo apt install -y build-essential
```

## HelloWorld
https://www.rust-lang.org/ja/learn/get-started

これをやって`Rust`の感覚を掴んでみる。  
カニのマスコットが挨拶してくれるプログラムを作るらしい。

新しいプロジェクトを作って

```shell
cargo new hello-rust
```

移動して実行

```shell
cd hello-rust
cargo build
```

`Hello World`できた

![Imgur](https://imgur.com/VpF3D9s.png)

## VSCode
さすがに`WSL2`上で`vim`を使うのは厳しいので、`VSCode`と`WSL2`を接続して`VSCode`で開発できるようにします。  
https://code.visualstudio.com/docs/remote/wsl

`VSCode`側に拡張機能をあらかじめインストールしておいて、

![Imgur](https://imgur.com/aZVmp75.png)

`WSL2`上の`Ubuntu`で、`code .`コマンドを叩くと、`WSL2`と接続した`VSCode`が開きます。左下に`WSL: Ubuntu`って出てる！！！  
すごく統合されていてこの手の開発者は嬉しそう、わたしは`Android`なんで,,,

![Imgur](https://imgur.com/Ff58Em6,png)

## カニさんに挨拶されたい
https://www.rust-lang.org/ja/learn/get-started

これの依存関係のところから。  
`Cargo.toml`を開き`dependencies`に1行足します。

```toml
[dependencies]
ferris-says = "0.3.1"
```

そしたら`cargo build`を入力することでライブラリを取ってきてくれるそう。

最後に挨拶してくるプログラムを書きます。`src`の中の`main.rs`をこの用に書き換えて

```rust
use ferris_says::say; // from the previous step
use std::io::{stdout, BufWriter};

fn main() {
    let stdout = stdout();
    let message = String::from("Hello fellow Rustaceans!");
    let width = message.chars().count();

    let mut writer = BufWriter::new(stdout.lock());
    say(&message, width, &mut writer).unwrap();
}
```

出来たら、ターミナルでもう一度`cargo run`を叩きます。  
カニさんが出てきたら成功です。

![Imgur](https://imgur.com/WiKR5C8.png)

![Imgur](https://imgur.com/qNEabxq.png)

アスキーアート、かわいい。  
バックスラッシュが￥マークになってるけど気にしないことに。

# Android Kotlin から Rust を呼び出す
`Android`で`Rust`を呼び出すためには、冒頭の通り`C++`時代のように`JNI`を使うか、`UniFFI`で`Kotlin`バインディングを自動生成するかの2択っぽいです。  
両方試してみますが、速度が必要ない場合は`UniFFI`が簡単で良かったです。

## Android NDK を入れる
ビルドするためには`Android NDK`を`Rust`をコンパイルするマシンに入れておく必要があります。  
`JNI`にしろ、`UniFFI`にしろ必要です。

ダウンロードと展開は以下のコマンドで出来ます。が、利用規約を読まず直接 DL することになります、  
というわけで利用規約一応おいておきます→ https://developer.android.com/ndk/downloads

```shell
cd /opt
sudo wget https://dl.google.com/android/repository/android-ndk-r27c-linux.zip
sudo apt install unzip
sudo unzip android-ndk-r27c-linux.zip
```

ダウンロード先はどこにするのがいいのか知らないので、他プロジェクトにならって`/opt`にしてみた。  
多分`sudo`が必要です。

`unzip`コマンドが使える場合は`apt install`の行はスキップできます。

# JNI
https://mozilla.github.io/firefox-browser-architecture/experiments/2017-09-21-rust-on-android.html

少し古いですが、この記事通りにやることが出来ます。  

## JNI Android プロジェクトを作成
`C++`を`Android`でやったことある方ならわかるかもしれませんが、`JNI`の関数はクソ長いです。  
`JNI`の関数の命名規則は、パッケージ名、クラス名、関数名を知っている必要があるので、先に`Android`プロジェクトを作ります。ちなみに後者の`UniFFI`ならもっと簡単です。

今回は`WSL2`で`Rust`をコンパイルするため、`Native`を選択する**必要はありません**。  
`Windows`で`Rust`をコンパイルする場合も`SDK Manager`から`Android NDK`をインストールすればいいはずな気がするので、`Native`を選ぶ必要はないと思います。

![Imgur](https://imgur.com/0mL9yck.png)

次に、`Kotlin`で`external fun greeting(message: String)`関数を作ります。今回は`MainActivity`で。  
せっかくなので挨拶文を引数で設定できるようにしてみました。また、カニさんのアスキーアートを文字列で受け取るよう返り値は`String`です。

この関数の中身を`Rust`で実装する形になります。

```kotlin
package io.github.takusan23.androidrustjni

class MainActivity : ComponentActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidRustJniTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    Greeting(
                        name = "Android",
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }

    // これ
    private external fun greeting(message: String): String

}
```

で、なんで先にプロジェクトを作ったかと言うと、この関数名、クラス、パッケージ名を確定させておく必要があるからです。  
とりあえず次は`Rust`コードを書きましょう。

## JNI Rust 側も作成
まずはそれ用の`Rust`プロジェクトを作ります。`VSCode`を開きます。

```shell
cargo new android-rust-jni
cd android-rust-jni/
code .
```

## JNI Cargo.toml
`Cargo.toml`を開き

`[lib]`の2行も書き足します。  
`dylib`にするとビルド時に`.so`が生成されるようになります。

次に、同様にカニさんに挨拶されたいのでライブラリを入れます。同じ用に`[dependencies]`の下に足します。  
また、`JNI`用のライブラリも追加します。下の2行ですね。

```toml
[lib]
crate-type = ["dylib"]

[dependencies]
ferris-says = "0.3.1"

[target.'cfg(target_os="android")'.dependencies]
jni = { version = "0.21.1", default-features = false }
```

## JNI lib.rs

次に`main.rs`の名前を`lib.rs`にします。  
（`cargo new`の時点で`lib`の方を作る方法があったような気もします。）

ここから`Rust + JNI`コードを書いていきます。  
で、ここで、さっき作った`Android`プロジェクトを確認する必要があります。

というのもここから追加で書く関数が、`Kotlin`側の`external fun`と紐付くわけですが、  
名前にルールがあります。こちらです。

```plaintext
Java_{パッケージ名。ドットはアンダーバーに置き換え}_{クラス名}_{関数名}
```

例えば、この`Kotlin`コードだと

```kotlin
package io.github.takusan23.androidrustjni

class MainActivity : ComponentActivity() {
    // これ
    private external fun greeting(message: String): String
}
```

- パッケージ名
    - `io.github.takusan23.androidrustjni`
- クラス名
    - `MainActivity`
- 関数名
    - `greeting`

になるので、これをルール通りに当てはめるとこうなります。

```plaintext
Java_io_github_takusan23_androidrustjni_MainActivity_greeting
```

関数名が分かったところでコードを書いていきましょう。`lib.rs`に書き足します。  
`Java_io_github_takusan23_androidrustjni_MainActivity_greeting`の部分は、各自パッケージ名と関数名を直してください。

```rust
use ferris_says::say;

fn rust_greeting(message: String) -> String {
    let width = message.chars().count();
    let mut writer = Vec::new();
    say(&message, width, &mut writer).unwrap();
    return String::from_utf8(writer).unwrap();
}

#[cfg(target_os = "android")]
#[allow(non_snake_case)]
pub mod android {
    extern crate jni;

    use jni::JNIEnv;
    use jni::objects::{JClass, JString};

    use crate::rust_greeting;

    #[unsafe(no_mangle)]
    pub extern "C" fn Java_io_github_takusan23_androidrustjni_MainActivity_greeting<'local>(
        mut env: JNIEnv<'local>,
        _class: JClass<'local>,
        message: JString<'local>,
    ) -> JString<'local> {
        // Rust String へ
        let rust_string: String = env
            .get_string(&message)
            .expect("Couldn't get java string!")
            .into();

        // カニさん
        let greeting_string = rust_greeting(rust_string);

        // JString を返す
        return env.new_string(greeting_string).unwrap();
    }
}
```

`JNI`の関数は`JNI`用のプリミティブ型を使う必要があります。  
これは`Rust`に限らず`C++`で書いても`jstring`とか言うのになる。

## JNI ビルド
そしたらビルドします。  
と、その前に`Android`をターゲットに追加します。多分この4つ？

上から`ARM 64ビット`、`ARM 32 ビット`、`x64`、`x86`。のハズ？  
`x64`とかは`Windows`でエミュレータを動かした時に`Intel CPU`なので多分いる。

```shell
rustup target add aarch64-linux-android
rustup target add armv7-linux-androideabi
rustup target add x86_64-linux-android
rustup target add i686-linux-android
```

![Imgur](https://imgur.com/waD7gro.png)

次に、`Cargo.toml`の階層に`.cargo`フォルダを作成し、`config.toml`を作成します、  
そしたら、以下を貼り付けます。`NDK`のパスが違う場合は直してください。

```plaintext
[target.aarch64-linux-android]
ar = "/opt/android-ndk-r27c/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
linker = "/opt/android-ndk-r27c/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android21-clang"

[target.armv7-linux-androideabi]
ar = "/opt/android-ndk-r27c/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
linker = "/opt/android-ndk-r27c/toolchains/llvm/prebuilt/linux-x86_64/bin/armv7a-linux-androideabi21-clang"

[target.x86_64-linux-android]
ar = "/opt/android-ndk-r27c/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
linker = "/opt/android-ndk-r27c/toolchains/llvm/prebuilt/linux-x86_64/bin/x86_64-linux-android21-clang"

[target.i686-linux-android]
ar = "/opt/android-ndk-r27c/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
linker = "/opt/android-ndk-r27c/toolchains/llvm/prebuilt/linux-x86_64/bin/i686-linux-android21-clang"
```

![Imgur](https://imgur.com/zBfQXSR.png)

そしたら各`CPU`向けにビルドできるようになっているはずです。  
以下のコマンドを順番に叩けばいいはず。

```shell
cargo build --release --target aarch64-linux-android
cargo build --release --target armv7-linux-androideabi
cargo build --release --target x86_64-linux-android
cargo build --release --target i686-linux-android
```

`Finished release profile [optimized] target(s) in 8.72s`みたいなのが出ればいいはず。

![Imgur](https://imgur.com/DAcUAxN.png)

## JNI 共有ライブラリを回収
あともうちょっと！

`.so`ファイルを回収します。`target`フォルダ内に`各 CPU`向けのフォルダがあるので開いて、`release`の中の`lib から始まる 拡張子 so`のファイルを取り出します。  
`WSL2`ならエクスプローラーから見れるのでラクラクです。

![Imgur](https://imgur.com/rUnxUAU.png)

![Imgur](https://imgur.com/1tJBc8z.png)

## JNI AndroidStudio のプロジェクトに共有ライブラリを入れる
`app`→`src`→`main`フォルダへ進み、`jniLibs`フォルダを作成します。  
また、その中に以下4つの名前でフォルダを作ってください。

- armeabi-v7a
- arm64-v8a
- x86
- x86_64

`ファイルツリー`の表示を`Project`にした時に、この場所にフォルダが作られていれば大丈夫です。

![Imgur](https://imgur.com/QzJ9gCc.png)

![Imgur](https://imgur.com/nS2cqgd.png)

そしたら今作った4つのフォルダに、それぞれさっき取り出した`so`ファイルを配置します。  

- `armeabi-v7a` なら `armv7-linux-androideabi`
- `arm64-v8a` なら `aarch64-linux-android`
- `x86` なら `i686-linux-android`
- `x86_64` なら `x86_64-linux-android`

`arm64-v8a`なら`aarch64-linux-android`フォルダの`release`の中にあった`so`ファイルといった感じです。  

![Imgur](https://imgur.com/f7i5bxU.png)

## JNI 呼び出してみる
カニさんに挨拶されたいことを忘れかけてた。もう見れますよ。  
`MainActivity.kt`で`共有ライブラリ`をロードするようにすれば完了です。あとは`external fun greeting()`を呼び出して使いましょう。

`System.loadLibrary()`ですが、共有ライブラリの名前から先頭の`lib`と`.so`を消した名前を渡す必要があります。  
ちなみに、`Rust`と`Kotlin (JNI)`名前が間違ってる場合は`java.lang.UnsatisfiedLinkError: No implementation found`見たいな例外が投げられます。

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidRustJniTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    // Rust のカニさんが挨拶してくれる
                    Text(
                        text = greeting("Hello Android + JNI + Rust"),
                        modifier = Modifier.padding(innerPadding),
                        fontFamily = FontFamily.Monospace
                    )
                }
            }
        }
    }

    // Rust 側の実装
    private external fun greeting(message: String): String

    // Rust でビルドした共有ライブラリをロード
    companion object {
        init {
            System.loadLibrary("android_rust_jni")
        }
    }
}
```

これで完了です。早速実行してみましょう。

## JNI 実行
カニさん出た。  

![Imgur](https://imgur.com/eOfass3.png)

試しに`32ビット`の`Android`端末でも動かしてみた。（`Xperia Z3 Compact`）  
動いてます。

![Imgur](https://imgur.com/JfcvEHU.png)

画像送るほうが大変、、、`Android ビーム (懐かしい)`を経由して`QuickShare`。  
`x86_64`の`.so`ファイルもちゃんと同梱したので、`Windows`でエミュレーターを使ったときの開発でも特に問題なく実行できるはずです。

## JNI は長すぎる
これが嫌な場合は`UniFFI`を採用するべきです、少しはラクできるはず。

# UniFFI
https://mozilla.github.io/uniffi-rs/latest/

こちらは`Rust`と`Kotlin`を繋ぐ部分を自動で作ってくれます（`Kotlin バインディング`）。  
しかも簡単。

## UniFFI 同様にカニさんプロジェクトを作る
`JNI`と同じように、それ用のプロジェクトを`cargo new`します。

```shell
cargo new android-rust-uniffi
cd android-rust-uniffi
```

次に`Cargo.toml`を開いて書き足します。  
`cdylib`で共有ライブラリをビルド、`uniffi`は記述時時点最新版を入れます。あとはカニさんのライブラリを。

```toml
[lib]
crate-type = ["cdylib"]
name = "android_rust_uniffi"

[dependencies]
uniffi = { version = "0.29", features = [ "cli" ] }

[build-dependencies]
uniffi = { version = "0.29", features = [ "build" ] }
```

![Imgur](https://imgur.com/pl7VtPA.png)

詳しくは本家  
https://mozilla.github.io/uniffi-rs/latest/tutorial/Prerequisites.html

## UniFFI カニさんコードを書く
`src`の中の`main.rs`を`lib.rs`にリネームして、カニさんプログラムを書きます。  
`JNI`のそれと同じです。カニさんのアスキーアートを文字列で返す。

```rust
use ferris_says::say;

pub fn rust_greeting(message: String) -> String {
    let width = message.chars().count();
    let mut writer = Vec::new();
    say(&message, width, &mut writer).unwrap();
    return String::from_utf8(writer).unwrap();
}
```

## UniFFI Kotlin で使いたい関数に目印をつける
- https://mozilla.github.io/uniffi-rs/latest/tutorial/udl_file.html
- https://mozilla.github.io/uniffi-rs/latest/tutorial/Rust_scaffolding.html

今回は`pub fn rust_greeting()`関数を`Kotlin`から呼び出したいので、`#[uniffi::export]`をつけます。  
もう一つ、本家では`UDL ファイル`を作る方法も紹介されてますが、`#[uniffi::export]`付けるのが楽だと思います。

```rust
#[uniffi::export]
pub fn rust_greeting(message: String) -> String {
    // 以下省略...
}
```

それから、`lib.rs`の一番最初に`uniffi::setup_scaffolding!();`の一行を書き足します。  
これが、ここまでの状態のコードです。

```rust
uniffi::setup_scaffolding!();

use ferris_says::say;

#[uniffi::export]
pub fn rust_greeting(message: String) -> String {
    let width = message.chars().count();
    let mut writer = Vec::new();
    say(&message, width, &mut writer).unwrap();
    return String::from_utf8(writer).unwrap();
}
```

## UniFFI Kotlin バインディングを生成する準備
https://mozilla.github.io/uniffi-rs/latest/tutorial/foreign_language_bindings.html

もうゴールは近い。  
次は`Kotlin`で`Rust`コードを呼び出すバインディングを生成するために使うファイルを作ります。

`Cargo.toml`と同じ階層に`uniffi-bindgen.rs`ファイルを作成して、以下を貼り付けます。

```rust
fn main() {
    uniffi::uniffi_bindgen_main()
}
```

次に、`Cargo.toml`に書き足します。

```toml
[[bin]]
# This can be whatever name makes sense for your project, but the rest of this tutorial assumes uniffi-bindgen.
name = "uniffi-bindgen"
path = "uniffi-bindgen.rs"
```

## UniFFI バインディングを生成する
バインディングのために使う`.so`ファイルは多分`ターゲット Android`向けである必要がない？  
以下の２つのコマンドを実行します。`so`ファイルのパスは各自直してください。

```shell
cargo build --release
cargo run --bin uniffi-bindgen generate --library target/release/libandroid_rust_uniffi.so --language kotlin --out-dir out
```

終わると、`out`フォルダの中に`.kt`（Kotlin）コードが入ってるはず！  
![Imgur](https://imgur.com/FW9DL9T.png)

## UniFFI ビルド
`JNI`と同じように`各 CPU (アーキテクチャ)`向けにビルドして、`.so`ファイルを作成する必要があります。  
JNI のときと同じ [#JNIビルド](#jni-ビルド) と同じです。

`rustup target`で一回も追加したことない場合は呼び出します。

```shell
rustup target add aarch64-linux-android
rustup target add armv7-linux-androideabi
rustup target add x86_64-linux-android
rustup target add i686-linux-android
```

次に`.cargo`フォルダを作り`config.toml`を作成し、以下を貼り付けます。  
`NDK`のパスが違う場合は直してください。

```toml
[target.aarch64-linux-android]
ar = "/opt/android-ndk-r27c/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
linker = "/opt/android-ndk-r27c/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android21-clang"

[target.armv7-linux-androideabi]
ar = "/opt/android-ndk-r27c/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
linker = "/opt/android-ndk-r27c/toolchains/llvm/prebuilt/linux-x86_64/bin/armv7a-linux-androideabi21-clang"

[target.x86_64-linux-android]
ar = "/opt/android-ndk-r27c/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
linker = "/opt/android-ndk-r27c/toolchains/llvm/prebuilt/linux-x86_64/bin/x86_64-linux-android21-clang"

[target.i686-linux-android]
ar = "/opt/android-ndk-r27c/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-ar"
linker = "/opt/android-ndk-r27c/toolchains/llvm/prebuilt/linux-x86_64/bin/i686-linux-android21-clang"
```

![Imgur](https://imgur.com/F2OGQu7.png)

これで`Android`向けにビルド出来るようになりました。  
4つのコマンドを順番に叩いて、各アーキテクチャ向けにビルドした共有ライブラリを作ります。

```shell
cargo build --release --target aarch64-linux-android
cargo build --release --target armv7-linux-androideabi
cargo build --release --target x86_64-linux-android
cargo build --release --target i686-linux-android
```

## UniFFI AndroidStudio のプロジェクトに共有ライブラリを入れる
`Android Studio`でプロジェクトを作ってください。`Jetpack Compose`のやつを選んでいいです。  
`Native`である必要もないです。ビルド済み`Rust`を使うので。

次に、ビルドした`.so`ファイルを置くためのフォルダを作ります。
これも [JNI AndroidStudio のプロジェクトに共有ライブラリを入れる](#jni-androidstudio-のプロジェクトに共有ライブラリを入れる) と同じです。  
詳しくはそっちに譲ります。ざっくり。スクショのとおりにフォルダを作ります。

![Imgur](https://imgur.com/YoOdovx.png)

そしたら今作った4つのフォルダに、`so`ファイルを配置します。  
`so`ファイルは`target/{各アーキテクチャ}/release`の中にあります。

- `armeabi-v7a` なら `armv7-linux-androideabi`
- `arm64-v8a` なら `aarch64-linux-android`
- `x86` なら `i686-linux-android`
- `x86_64` なら `x86_64-linux-android`

例えば`arm64-v8a`なら`target/aarch64-linux-android/release/`の中にある`so`ファイルを置けばいいです。

![Imgur](https://imgur.com/ngupR5u.png)

## UniFFI バインディングをコピーしてくる
と、その前に、  
`UniFFI`を動かすには`Java Native Access (JNA)`というライブラリに依存しているので、まず`app/build.gradle.kts`を開いて`JNA`を追加します。そしたら`Gradle sync`ね。

```kotlin
dependencies {
    implementation("net.java.dev.jna:jna:5.6.0@aar")

    // 以下省略...
```

次に`UniFFI`が生成したバインディングを持ってきましょう。  
`out`フォルダを探すとあるはず。`out/uniffi/android_rust_uniffi`にありました。これを`MainActivity.kt`と同じ階層に貼り付ける。

![Imgur](https://imgur.com/7ogRJy9.png)

`package 名`を直してもいいはず。  
`JNA`は`JNI`のときとは違い、パッケージ名が違ったとしても動くはず。

## UniFFI 呼び出してみる
バインディングがあるので、対応する関数が見つかるはず。  
`rustGreeting()`関数ですね。`JNI`のときの用にしてみる。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidRustUniffiTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    Text(
                        text = rustGreeting("Android UniFFI + Rust !!!"), // 今回作ったコードはトップレベルにあった
                        modifier = Modifier.padding(innerPadding),
                        fontFamily = FontFamily.Monospace
                    )
                }
            }
        }
    }
}
```

## UniFFI 実行
`UniFFI`でもカニさんが挨拶してくれました。良かった。  

![Imgur](https://imgur.com/u8rR12p.png)

![Imgur](https://imgur.com/FSgvXTX.png)

また、使いたい関数にに少し書き出すだけで`Kotlin (JNI)`で呼び出せることに気付きましたか？  
`JNI`のときは`Java`のプリミティブ型`jstring`とかを使う必要があったのに対し、`UniFFI`は**気にする必要がない。**。

また、`JNI`の長い関数名のルールもありません。が、ほんとは`JNI`でも長い関数名を回避できる、、、

# カニさんソースコード
- JNI 版
    - Rust 側
        - https://github.com/takusan23/android-rust-jni
    - Android 側
        - https://github.com/takusan23/AndroidRustJni
- UniFFI 版
    - Rust 側
        - https://github.com/takusan23/android-rust-uniffi
    - Android 側
        - https://github.com/takusan23/AndroidRustUniffi

# Android NDK だと速いの？
というわけで、今回はひたすら計算する処理を`Rust`で書いて、更に`SIMD 命令`の恩恵を受けようと思います。

## SIMD
`CPU`には`SIMD`命令とか言うのがあって、複数の値に対して同時に四則演算ができるとかなんとか。  
どういうことかというと、こんな感じに`Int 配列`の中身を2倍にしたい場合はまあこうですよね。

```kotlin
val a = listOf(1, 2, 3, 4).map { it * 2 }
```

しかし、これでは掛け算が4回必要です。  
そこで`SIMD`です。以下のコードは擬似コードなので動かないですが、どうやら一回の掛け算処理で、4つの値全てに対して計算ができる、らしい。

```kotlin
val a = listOf(1, 2, 3, 4) * 2
```

しかし、この`SIMD`命令を`Java`から使う方法はない？ので、`Rust`で書いて使うことにします。

## SIMD 命令のプログラムは難しくないんですか
そう思ってたのですが、、、、

実は単純な`for`ループの場合はコンパイラが勝手に`SIMD`を使ったものに置き換えてくれるそうです。  
というか今回は**コンパイラにやらせる作戦**で行きます。自分で`SIMD`用の関数を呼ぶくらいならやらない。

単純というか副作用がないコードじゃないとならないらしい？  
`for`の中で関数呼び出しとかするとダメそう。

## 関数
これまでと同じように`cargo new`でプロジェクトを作って、`lib.rs`に関数を作りました。
2つのバイト配列から取り出して引き算するやつ。テストも正解だけだけど書いた。  

```rust
use std::cmp;

// 2つのバイト配列を取って、引き算した結果を返す
fn sub_two_bytearray(a: Vec<u8>, b: Vec<u8>) -> Vec<u8> {
    let size = cmp::min(a.len(), b.len());
    let mut result: Vec<u8> = vec![0; size];

    for i in 0..size {
        result[i] = a[i] - b[i];
    }
    return result;
}

// テストコード
#[cfg(test)]
mod tests {
    use std::vec;

    use crate::sub_two_bytearray;

    #[test]
    fn it_works() {
        let a: Vec<u8> = vec![10, 10, 10];
        let b: Vec<u8> = vec![1, 2, 3];

        let result = sub_two_bytearray(a, b);
        assert_eq!(result, vec![9, 8, 7]);
    }
}
```

これを`JNI`と`UniFFI`で試して速いか確かめます。

### 付録 ところでコンパイラが SIMD 命令を使っているか確認したい
そのためには、アセンブリコードを読む必要があるのですが、`cargo build`はデフォルトでは生成されないのでオプション付きでコマンドを叩きます。  
`aarch64`で作ってみます。なお、`release`の場合は多分`SIMD`に書き直すのが有効になります。

```shell
RUSTFLAGS='--emit asm' cargo build --release --target aarch64-linux-android
```

`target/aarch64-linux-android(アーキテクチャ)/release/deps/`の中に`.s`ファイルがあるはず。  
これを読みます。一部を抜き出してみました。

```asm
.LBB0_16:
	ldp	q0, q3, [x12, #-16]
	subs	x14, x14, #32
	ldp	q1, q2, [x13, #-16]
	add	x12, x12, #32
	add	x13, x13, #32
	sub	v0.16b, v1.16b, v0.16b
	sub	v1.16b, v2.16b, v3.16b
	stp	q0, q1, [x11, #-16]
	add	x11, x11, #32
	b.ne	.LBB0_16
	cmp	x21, x10
	b.eq	.LBB0_6
	tst	x21, #0x18
	b.eq	.LBB0_4
```

、、、、が、この辺さっぱり分からんので`AI`に聞いた。  

![Imgur](https://imgur.com/h3BJWWC.png)

`Gemini`さん曰く、`ARM NEON`(ARM の SIMD の名前)の場合は、アセンブリを見て`q0`みたいな名前の付くレジスタを使っているらしい。  
これを見ると`ldp q0`ってところで`q0`レジスタを使ってるので確かにそうなのかもしれない？

### 付録 SIMD を無効にしてビルドすると
`cargo`は`RUSTFLAGS="-C target-feature=+hogehoge"`で`CPU`の機能が有効にできますが、逆にマイナス`-hogehoge`すると無効にできるらしい。  
というわけでこの場合のアセンブリコードもみてみます。`SIMD 命令`、`ARM アーキテクチャ`だと`NEON`って名前なので`neon`。`Intel`だとまた別。

```shell
RUSTFLAGS='--emit asm -C target-feature=-neon' cargo build --release --target aarch64-linux-android
```

同じ様にアセンブリコードを見てみると、`q0`とかの文字がなくなってそう。

### 付録 ブラウザでアセンブリコードを見たい
Compiler Explorer  
https://godbolt.org/

で、アセンブリコードを見ることが出来る。`Rust`を選ぶ。  
`Compiler Options`に

```shell
-C opt-level=3 -C target-feature=+neon --target aarch64-linux-android
```

を入れると見れるはず。`neon`無効は`-neon`で。

# SIMD 実験
というわけで、今回は結構前にやった**ボーカルあり曲とカラオケ曲を使ってボーカルのみ曲**を作る記事の、  
ボーカル曲からカラオケ曲を引き算し、ボーカルだけにしてる計算部分だけを`Rust`で書きます。

https://takusan.negitoro.dev/posts/summer_vacation_music_vocal_only/

音は波なので、足したり引いたり出来ます。  
これを応用して、`aac`を`PCM`にデコードして、引き算して、`aac`にエンコードすれば出来るはず。

試す内容としては`JNI SIMD あり`、`UniFFI SIMD あり`、`Kotlin リリースビルド`、`JNI SIMD無効`で試します。  
あと、そもそも`Rust`や`C++`を使ったネイティブコードが、本当に速いのか確かめるために`Kotlin`も。あと`SIMD`の有り無しを見たい。

使う端末は`Xperia 1 V`と`Google Pixel 8 Pro`。  
バイト配列の大きさは`47290528 バイト (45MB)`。これを引き算していく。

## アプリ作った
というわけで作りました。  
音声のエンコード、デコードは前回の記事のままなので、そちらを見るか、後述する`GitHub`でソースコードを見てください。

![Imgur](https://imgur.com/qgHtVtz.png)

## 実験結果
### Snapdragon 8 Gen 2 (Xperia 1 V)
新しいのほちい

| Rust + JNI | Rust + UniFFI | Kotlin | Rust + JNI ( SIMD 未使用 ) |
|------------|---------------|--------|----------------------------|
| 66  ms     | 446 ms        | 128 ms | 94 ms                      |
| 59 ms      | 459 ms        | 22 ms  | 103 ms                     |
| 72 ms      | 440 ms        | 20 ms  | 96 ms                      |
| 61  ms     | 444 ms        | 21 ms  | 100 ms                     |
| 57  ms     | 440 ms        | 21 ms  | 94 ms                      |

### Google Tensor G3 (Pixel 8 Pro)
同期の`SoC`よりも性能がちょっと低い。

| Rust + JNI | Rust + UniFFI | Kotlin | Rust + JNI ( SIMD 未使用 ) |
|------------|---------------|--------|----------------------------|
| 131 ms     | 572 ms        | 213 ms | 172 ms                     |
| 121 ms     | 567 ms        | 78 ms  | 192 ms                     |
| 121 ms     | 563 ms        | 70 ms  | 181 ms                     |
| 151 ms     | 572 ms        | 58 ms  | 177 ms                     |
| 122 ms     | 561 ms        | 53 ms  | 199 ms                     |

## まとめ
この規模だと`Kotlin (JVM)`が一番速かった。(というか題材にこれを選んだのが良くなかった？)  
`JVM`が初回を除いてなぜか速い。もっと大規模だと違うのかもしれない。  

`C++`で試せてないのであれですが、**別にネイティブコードを書いても速くなるわけじゃないのか、、、**  

`Android の JVM`すごい。

`UniFFI`は`Java Native Access (JNA)`都合で遅くなってる？  
`JNI`独自の型（`jstring`）とかを使わずに呼び出せるので、それで時間がかかってるのかも？

## 実験ソースコード
- Rust 側をビルドしたい場合
    - https://github.com/takusan23/android-rust-simd
- Android 側
    - https://github.com/takusan23/AndroidRustSimd
    - 既にビルドされた .so が入ってるので皆さんは Rust いらないです

# Q&A 16KB ページサイズに対応してないんですけど
`.so`ファイルを`apk / aab`の中に入れることになるので**この問題にぶち当たります**。  
~~が、この記事もう長いので次回にまわします。~~ → 書きました： https://takusan.negitoro.dev/posts/android_15_16kb_page_size/

```shell
takusan23@DESKTOP-ULEKIDB:~$ chmod +x check_elf_alignment.sh
takusan23@DESKTOP-ULEKIDB:~$ ./check_elf_alignment.sh app-release.apk

Recursively analyzing app-release.apk

NOTICE: Zip alignment check requires build-tools version 35.0.0-rc3 or higher.
  You can install the latest build-tools by running the below command
  and updating your $PATH:

    sdkmanager "build-tools;35.0.0-rc3"

=== ELF alignment ===
/tmp/app-release_out_6q4W9/lib/x86_64/libandroid_jni.so: UNALIGNED (2**12)
/tmp/app-release_out_6q4W9/lib/x86_64/libandroid_jni_without_simd.so: UNALIGNED (2**12)
/tmp/app-release_out_6q4W9/lib/x86_64/libandroidx.graphics.path.so: ALIGNED (2**14)
/tmp/app-release_out_6q4W9/lib/x86_64/libjnidispatch.so: UNALIGNED (2**12)
/tmp/app-release_out_6q4W9/lib/x86_64/libandroid_rust_uniffi.so: UNALIGNED (2**12)
/tmp/app-release_out_6q4W9/lib/armeabi/libjnidispatch.so: UNALIGNED (2**12)
/tmp/app-release_out_6q4W9/lib/arm64-v8a/libandroid_jni.so: UNALIGNED (2**12)
/tmp/app-release_out_6q4W9/lib/arm64-v8a/libandroid_jni_without_simd.so: UNALIGNED (2**12)
/tmp/app-release_out_6q4W9/lib/arm64-v8a/libandroidx.graphics.path.so: ALIGNED (2**14)
/tmp/app-release_out_6q4W9/lib/arm64-v8a/libjnidispatch.so: ALIGNED (2**16)
/tmp/app-release_out_6q4W9/lib/arm64-v8a/libandroid_rust_uniffi.so: UNALIGNED (2**12)
/tmp/app-release_out_6q4W9/lib/x86/libandroid_jni.so: UNALIGNED (2**12)
/tmp/app-release_out_6q4W9/lib/x86/libandroid_jni_without_simd.so: UNALIGNED (2**12)
/tmp/app-release_out_6q4W9/lib/x86/libandroidx.graphics.path.so: ALIGNED (2**14)
/tmp/app-release_out_6q4W9/lib/x86/libjnidispatch.so: UNALIGNED (2**12)
/tmp/app-release_out_6q4W9/lib/x86/libandroid_rust_uniffi.so: UNALIGNED (2**12)
/tmp/app-release_out_6q4W9/lib/mips64/libjnidispatch.so: ALIGNED (2**16)
/tmp/app-release_out_6q4W9/lib/mips/libjnidispatch.so: ALIGNED (2**16)
/tmp/app-release_out_6q4W9/lib/armeabi-v7a/libandroid_jni.so: UNALIGNED (2**12)
/tmp/app-release_out_6q4W9/lib/armeabi-v7a/libandroid_jni_without_simd.so: UNALIGNED (2**12)
/tmp/app-release_out_6q4W9/lib/armeabi-v7a/libandroidx.graphics.path.so: ALIGNED (2**14)
/tmp/app-release_out_6q4W9/lib/armeabi-v7a/libjnidispatch.so: UNALIGNED (2**12)
/tmp/app-release_out_6q4W9/lib/armeabi-v7a/libandroid_rust_uniffi.so: UNALIGNED (2**12)
Found 16 unaligned libs (only arm64-v8a/x86_64 libs need to be aligned).
=====================
takusan23@DESKTOP-ULEKIDB:~$
```

![Imgur](https://imgur.com/XbW84vo.png)

今回作った`.so`が軒並み`UNALIGNED`。。。

# おわりに
`Java / Kotlin`で十分に速かった。  
`Android NDK`を入れて、`Java Native Interface`のバインディングを書いて、`各 CPU アーキテクチャ`向けにコンパイルして、、、って面倒だし**クラッシュした時に直せる自信がない。**  
`GitHub`のコードで`NDK`が必要って言われた瞬間に目を逸らしてる（偏見）

# おわりに2
そーいえば昔というか、`32bit`時代の、ネイティブコードを使ってて`arm64-v8a`（`ARM 64bit`）が入ってないアプリ、すでに動かなくなってそう。  
`Google Tensor`は`G2 ( Pixel 7 )`から`32 ビット`ネイティブコードのサポート無し、  
`Snapdragon`も`8 Gen 3`で`32 ビット`ネイティブコードのサポートが無くなった。

もっとも、`targetSdk`が古すぎてインストールが弾かれてしまいそうなので、こんなことにはならないと思います、が。