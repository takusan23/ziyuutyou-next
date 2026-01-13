---
title: KSP を使ってコード生成をしてみる
created_at: 2026-01-14
tags:
- Kotlin
- KSP
---

どうもこんにちは。  
`Windows 11`にするときに`Android Studio`も入れなおしたんですが、何の設定をしてたか忘れちゃってその都度直してたんですが、たぶん思い出せたかも。自分用にそのうち書きます。

# 本題
コードを動的にいじりたくて、`KSP`を調べてたんだけど、結局要件を満たせなさそうで使わないかも。それで`KSP`の使い方だけでもメモ。

## KSP

https://kotlinlang.org/docs/ksp-overview.html

`ことりん しんぼる ぷろせっしんぐ`

`アノテーション`をつけた`Kotlin`コードに対してビルド時にアクセスできる。この時に追加でコードを生成したりできる。  
これだけ見るとめっちゃ難しそうに見えるが、`KSP`はそんなに難しくなかった。`Plugin`の方はたぶんつらい。

`KSP`のがずっと簡単なのだが、既存のコードを書き換える機能とかは持ち合わせてない。

https://kotlinlang.org/docs/ksp-why-ksp.html#limitations

`Android`の`Room`は`@Query`に渡した`SQL`を元に実際に`ContentValues`で`SQLite`に問い合わせるコードを`KSP`で作っているらしい。

# KSP でコードを自動生成してみたい
というわけで今回は簡単にコードを生成してみようと思います。思ったよりも簡単だった。

といっても特には思いつかなかったので、振り絞って考えてみました。  
任意の`UI State`の`data class`を元に、`Loading`、`Success`、`Error`を自動生成してみようかと。もっといい例が欲しかった。

```kotlin
// これから
@GenerateUiState // 生成してほしいので
data class DetailScreen(
   val name: String,
   val description: String
)
```

```kotlin
// これを作りたい
sealed interface GenerateDetailScreen {

   data object Loading: GenerateDetailScreen

   data class Success(
      val name: String,
      val description: String
   ) : GenerateDetailScreen

   data class Error(val throwable: Throwable): GenerateDetailScreen
}
```

# 環境
`KSP`作るのに`IDEA`を使います。`Android Studio`でできるかは分からないです

| なまえ | あたい                   |
|--------|--------------------------|
| IDEA   | IntelliJ IDEA 2025.3.1.1 |
| Kotlin | 2.3.0                    |
| Gradle | 9.2.1                    |
| JDK    | 25 （私は `Temurin` 派） |

`Java 25`でも、`Gradle 9.2.1`と`Kotlin 2.3.0`の組み合わせなら動きました。両方`25`に対応してた。

# 手順

- 適当な`Kotlin`プロジェクトを作る
- `アノテーション`を保持する`モジュール`、`KSP`の処理をする`モジュール`を作る
- `KSP`書く
- 動作確認`モジュール`を作って動かしてみる

## てきとうに Kotlin プロジェクトを作る

適当に作ってください

![new project](https://oekakityou.negitoro.dev/original/4692e8f2-4ae8-4cb5-8d82-3b5c7a1b22b7.png)

`src`は使わない予定なので消しちゃう。  
`example`を別に作ります。

![src を消す](https://oekakityou.negitoro.dev/original/4047f1fd-9b0e-4f12-b20a-0da7718ca208.png)

## annotation と processor モジュールを作る
`annotation`モジュールはその名の通り`アノテーション`を定義するための。  
`processor`が`KSP`でやりたいことを書くモジュールになります。

右クリックで新しいモジュールをいい感じに作ってください。なんか`JDK`とか`Kotlin`のバージョンがーって言ってくるけど無視して作るぞ。  
[#環境](#環境) 通りのバージョンであれば動くはずなので。

![menu](https://oekakityou.negitoro.dev/original/6313be1f-1652-4d64-908e-2a4a2252f57b.png)

![モジュール作成](https://oekakityou.negitoro.dev/original/369adfa4-da19-4f4c-8379-94a76816963e.png)

できた！

あと、`パッケージ`通りにフォルダを作ってくれないので自分で作りました。`KSP`を試す分には関係ない部分ですが、、、

![パッケージ通りにフォルダを作った](https://oekakityou.negitoro.dev/original/20fe6481-9bdd-4ef7-8448-982e3d24cc05.png)

## アノテーション書く
最初かある`Main.kt`とかは使わないので消して、`annotation`パッケージにアノテーションを置く`.kt`ファイルを作りました。  
`GenerateUiState.kt`

```kotlin
@Target(AnnotationTarget.CLASS)
annotation class GenerateUiState
```

![アノテーション](https://oekakityou.negitoro.dev/original/0f93808d-3d7f-4ce6-8dd5-374702fe9852.png)

これだけです。つぎは`KSP`側を

## KSP API を入れる
`processor`フォルダの`build.gradle.kts`に、さっき作った`アノテーション`と`ksp`開発用のライブラリを入れます。  
`KSP`は`Kotlin`のバージョンに対応したのをいれてね。

```kotlin
dependencies {
   // 省略...

   implementation(project(":annotation")) // アノテーションを取り込む
   implementation("com.google.devtools.ksp:symbol-processing-api:2.3.4") // ksp も取り込む
}
```

## プロセッサーを書く下準備
`GenerateUiStateProvider.kt`を作りました。あとで`GenerateUiStateProcessor`と`resources フォルダ`の方もやりますが

まずは`Provider`の方ですが、`SymbolProcessorProvider`を実装したクラスを作ります。  
`create`関数を実装するように言われます。ここで`Processor`を返すわけですが、この後作るのでエラーになっても仕方ない。

```kotlin
class GenerateUiStateProvider : SymbolProcessorProvider {
    override fun create(environment: SymbolProcessorEnvironment): SymbolProcessor {
        return GenerateUiStateProcessor(
            options = environment.options,
            logger = environment.logger,
            codeGenerator = environment.codeGenerator
        )
    }
}
```

これらの引数ですが、`options`はなんか`build.gradle.kts`から指定したものを受け取れるらしいです。  
`logger`はわからず、`codeGenerator`はその名の通り`Kotlin`コードを自動生成する際に使います。

とりあえず`GenerateUiStateProcessor`を作りますか。後で中身を埋めていきます。

![クラス作成](https://oekakityou.negitoro.dev/original/4c1ca9bd-abd0-437f-bc05-cbc58206b963.png)

忘れないうちに次にやることは、`resources`フォルダにファイルを置くことです。  
`resources`フォルダに`META-INF`フォルダを作り、その中に`services`フォルダを作り、その中に`com.google.devtools.ksp.processing.SymbolProcessorProvider`という名前のテキストファイルを作ります。

![ファイルを作る](https://oekakityou.negitoro.dev/original/4b0a2a6a-45d4-4145-831f-11724430f3da.png)

ファイルの中身ですが、`GenerateUiStateProvider`の名前を`完全修飾名`で書くだけです。`パッケージ名+クラス名`  
入力が面倒な場合は`Ctrl + Space`（`Windows`の場合）でコード補完を呼び出して、一つだけ候補が表示されるのでそれを入力すればよいです。

![コード補完](https://oekakityou.negitoro.dev/original/1782222b-1bdc-490e-8267-24a512e3ac27.png)

## プロセッサーを書く
`GenerateUiStateProcessor`クラスを作ったら`SymbolProcessor`を実装するようにします。  
`process`関数を実装するように言われます。ここで`アノテーション`が付いた`Kotlin`コードへアクセスできるという魂胆であります。

```kotlin
class GenerateUiStateProcessor(
    options: Map<String, String>,
    logger: KSPLogger,
    private val codeGenerator: CodeGenerator
) : SymbolProcessor {
    override fun process(resolver: Resolver): List<KSAnnotated> {
        // TODO このあとすぐ
    }
}
```

じゃあ書きますって言われてもわからんと思うので、とりあえず **冒頭通り** `UiState` を生成するコードを先に貼ります。  
解説はこの後すぐ

```kotlin
class GenerateUiStateProcessor(
    options: Map<String, String>,
    logger: KSPLogger,
    private val codeGenerator: CodeGenerator
) : SymbolProcessor {

    /** ファイルが二回作られるのを防ぐ */
    private var invoked = false

    override fun process(resolver: Resolver): List<KSAnnotated> {
        // アノテーションがついているクラスを探す
        val symbols = resolver
            .getSymbolsWithAnnotation(GenerateUiState::class.qualifiedName!!) // implementation(project(":annotation")) したのでアクセス可。名前をべた書きしてもよかったかも・・・
            .filterIsInstance<KSClassDeclaration>() // クラスに限定する、Function とかもあります

        if (!invoked) {
            invoked = true

            // ファイルを作る
            symbols.forEach { symbol ->

                // 自動生成するクラス名
                val generatedClassName = "Generated${symbol.qualifiedName!!.getShortName()}"

                // クラスの引数を val hoge: String にする
                val parameterKotlinCode = symbol
                    .getAllProperties()
                    .joinToString(separator = ", ") {
                        "val ${it.simpleName.getShortName()}: ${it.type.resolve().declaration.qualifiedName!!.asString()}"
                    }

                // ファイルを作る
                // ビルドすると IDEA / AndroidStudio から参照可能になる
                val file = codeGenerator.createNewFile(
                    dependencies = Dependencies(false, *resolver.getAllFiles().toList().toTypedArray()),
                    packageName = "io.github.takusan23.kspuistategenerator",
                    fileName = generatedClassName
                )

                // 自動生成する Kotlin コード
                val generatedKotlinCode = """
                package io.github.takusan23.kspuistategenerator

                sealed interface $generatedClassName {

                    data object Loading : $generatedClassName

                    data class Success(
                        $parameterKotlinCode
                    ) : $generatedClassName

                    data class Error(val throwable: Throwable) : $generatedClassName
                }
                """.trimIndent()

                // 書き込む
                file.write(generatedKotlinCode.toByteArray())
            }

        }

        val unableToProcess = symbols.filterNot { it.validate() }.toList()
        return unableToProcess
    }
}
```

### 解説
まああんまりよくわかってないんですが

```kotlin
// アノテーションがついているクラスを探す
val symbols = resolver
   .getSymbolsWithAnnotation(GenerateUiState::class.qualifiedName!!) // implementation(project(":annotation")) したのでアクセス可。名前をべた書きしてもよかったかも・・・
   .filterIsInstance<KSClassDeclaration>() // クラスに限定する、Function とかもあります
```

`symbol`の中身はまあ`filter`したので`KSClassDeclaration`になるわけです。  
ここに、どのクラスに対してアノテーションを付けたか。みたいな情報が得られます。`Sequence`なので`toList()`した方がデバッグは簡単。

```kotlin
@GenerateUiState data class HomeState // この場合は
println(symbols.map { it.qualifiedName!!.asString() }.toList()) // [io.github.takusan23.io.github.takusan23.kspuistategenerator.example.HomeState] こうなる
```

クラスが取れたので次はクラスのパラメーターを解析します。これから自動生成するクラスの引数になるので！  
`getAllProperties()`でとれます。

```kotlin
val parameterKotlinCode = symbol
   .getAllProperties()
   .joinToString(separator = ", ") {
      "val ${it.simpleName.getShortName()}: ${it.type.resolve().declaration.qualifiedName!!.asString()}"
   }
```

これも実行するとこうなります。

```kotlin
// これを渡すと
@GenerateUiState
data class HomeState(
   val title: String, 
   val description: String
)

println(parameterKotlinCode) // こうなる→ val title: kotlin.String, val description: kotlin.String
```

そしてあとは`Kotlin`のコードを`文字列リテラル`の中に書いて保存して終わり。なんと文字列で書くことができます。

```kotlin
// ファイルを作る
// ビルドすると IDEA / AndroidStudio から参照可能になる
val file = codeGenerator.createNewFile(
   dependencies = Dependencies(false, *resolver.getAllFiles().toList().toTypedArray()),
   packageName = "io.github.takusan23.kspuistategenerator",
   fileName = generatedClassName
)

// 自動生成する Kotlin コード
val generatedKotlinCode = """
package io.github.takusan23.kspuistategenerator

sealed interface $generatedClassName {

   data object Loading : $generatedClassName

   data class Success(
      $parameterKotlinCode
   ) : $generatedClassName

   data class Error(val throwable: Throwable) : $generatedClassName
}
""".trimIndent()

// 書き込む
file.write(generatedKotlinCode.toByteArray())
```

`if (!invoked) { }`の分岐はここのファイル生成が二回目に対応していないために必要だったわけですね。なんで二回目があるのかはわからないですが・・・

https://github.com/google/ksp/issues/797

## 動かしてみる
サンプル用の`モジュール`を作りましょう。`example`って名前にしました。

![example モジュールと build.gradle.kts](https://oekakityou.negitoro.dev/original/1f897891-6743-4271-a5cb-1ce04b10bf03.png)

できたら、`build.gradle.kts`へ`ksp`ライブラリを入れ、`annotation`モジュールと、`ksp()`として`processor`モジュールを読み込むようにします。  
ここからは`Room`入れるのと同じ流れです。

```kotlin
plugins {
    kotlin("jvm")
    id("com.google.devtools.ksp") version "2.3.3" // KSP 入れる
}

group = "io.github.takusan23.kspuistategenerator.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))

    // アノテーションと ksp を入れる
    implementation(project(":annotation"))
    ksp(project(":processor"))
}

tasks.test {
    useJUnitPlatform()
}
```

あとは適当に`Main.kt`とかでアノテーションを付けたクラスを作り、たぶん一度実行する必要があります。`fun main()`の横にある実行ボタンを押して実行すればよいです。

```kotlin
@GenerateUiState
data class DetailScreen(
    val name: String,
    val description: String
)

fun main() {
    
}
```

できた！  
生成したクラスは`プロジェクト/モジュール名/build/generated/ksp/main/kotlin/パッケージ名/KSPで作ったファイル名`にあります！

![クラス生成](https://oekakityou.negitoro.dev/original/0baf8f63-c9bc-48fb-9ff3-3f6464cfe22b.png)

# とらぶるしゅーてぃんぐ

```plaintext
Execution failed for task ':example:kspKotlin'.
> A failure occurred while executing com.google.devtools.ksp.gradle.KspAAWorkerAction
   > com/google/devtools/ksp/impl/KotlinSymbolProcessing$ExitCode
```

`resources/META-INF/services/com.google.devtools.ksp.processing.SymbolProcessorProvider`のパスが間違えてるとか

中身は`Ctrl + Space`の補完で表示される一つだけのやつを入力すればよいはず

# そのほか
## アノテーション経由でクラスを KSP へ渡しても参照できない

https://github.com/google/ksp/issues/888

https://github.com/google/ksp/issues/1038

残念ながら`KSP`が実行される環境では自分の作ったクラスとかは参照できない模様。はえ～


```kotlin
annotation class ClassArg(val clazz: KClass<*>) // KSP ではクラスが存在しないエラーになってしまう

class ExampleB

@ClassArg(ExampleB::class) // 引数に渡しても KSP からは見つけることができない
class ExampleA
```

# ソースコード
どぞ

https://github.com/takusan23/KspUiStateGenerator

# おわりに
ほかのプロジェクトで使う場合、手っ取り早いのは`mavenLocal`に公開することだと思います、が、ほかの人がビルドできなくなってしまう。