---
title: Kotlin の out T とか Nothing とかを理解したい
created_at: 2023-11-07
tags:
- Kotlin
---
どうもこんばんわ  
11 月ってこんな暑かったっけ？  

# 本題

`Jetpack Compose`を使うときによく、以下のような画面の値を持っておくステートクラスみたいなのを作ると思うんですけど  
多分、参考：https://github.com/android/nowinandroid/blob/main/feature/foryou/src/main/kotlin/com/google/samples/apps/nowinandroid/feature/foryou/OnboardingUiState.kt

```kotlin
// HomeScreen の ステート
sealed interface HomeScreenUiState {
    // ロード
    object Loading : HomeScreenUiState
    // 成功
    data class Successful(val data: String) : HomeScreenUiState
    // 失敗
    data class Error(val throwable: Throwable) : HomeScreenUiState
}

private suspend fun getData(): String {
    delay(500)
    return "Hello World"
}

@Composable
fun HomeScreen() {
    val uiState = remember { mutableStateOf<HomeScreenUiState>(HomeScreenUiState.Loading) }

    LaunchedEffect(key1 = Unit) {
        // 取得処理
        val response = getData()
        uiState.value = HomeScreenUiState.Successful(response)
    }

    Box {
        when (val state = uiState.value) {
            is HomeScreenUiState.Error -> Text(text = "失敗した！")
            HomeScreenUiState.Loading -> Text(text = "ロードなう")
            is HomeScreenUiState.Successful -> Text(text = "成功 = ${state.data}")
        }
    }
}
```

一画面だけなら問題ないと思いますが、似たような画面で使いたい場合に、`HomeScreenUiState`の名前変えただけバージョンがコピーされてしまうのは避けたいなと思ったわけで、  
解決するにはジェネリクス`<T>`みたいなのを使えばいいですね！！

というわけでこれ。

```kotlin
sealed interface BaseUiState<out T> {
    object Loading : BaseUiState<Nothing>
    data class Successful<T>(val data: T) : BaseUiState<T>
    data class Error(val throwable: Throwable) : BaseUiState<Nothing>
}
```

参考：https://stackoverflow.com/questions/44243763/how-to-make-sealed-classes-generic-in-kotlin

`<out T>`← `out`って何・・・  
あと`<Nothing>`って何なの？

確かに動くのですが、謎ばっかりだったので調べてみた

```kotlin
sealed interface BaseUiState<out T> {
    object Loading : BaseUiState<Nothing>
    data class Successful<T>(val data: T) : BaseUiState<T>
    data class Error(val throwable: Throwable) : BaseUiState<Nothing>
}

private suspend fun getData(): String {
    delay(1000)
    return "Hello World"
}

@Composable
fun HomeScreen() {

    val uiState = remember { mutableStateOf<BaseUiState<String>>(BaseUiState.Loading) }

    LaunchedEffect(key1 = Unit) {
        // 取得処理
        val response = getData()
        uiState.value = BaseUiState.Successful(response)
    }

    Box {
        when (val state = uiState.value) {
            is BaseUiState.Error -> Text(text = "失敗した！")
            BaseUiState.Loading -> Text(text = "ロードなう")
            is BaseUiState.Successful -> Text(text = "成功 = ${state.data}")
        }
    }
}
```

# sealed class / sealed interface
シールクラスって言うとかなんとか  
`TypeScript`だと`Union`が一番近いかな？  

このクラスの特徴は継承する際に制限があり（同じパッケージ内で継承して宣言する必要がある？）、その代わり継承しているクラスが分かるという特徴があります。  

https://kotlinlang.org/docs/sealed-classes.html#location-of-direct-subclasses

基本的には同じファイル内にすべて継承するクラスを定義するはず。

```kotlin
package io.github.takusan23.uistategenerics

sealed class Setting()
class WifiSetting : Setting()
class BluetoothSetting : Setting()
class DisplaySetting : Setting()
```

例えばパッケージが違うとエラー

```kotlin
package io.github.takusan23.uistategenerics.test

import io.github.takusan23.uistategenerics.Setting

class DeveloperSetting : Setting()  // エラー
// Inheritor of sealed class or interface declared in package io.github.takusan23.uistategenerics.test but it must be in package io.github.takusan23.uistategenerics where base class is declared
```

制限がある代わりに、継承しているクラスが全て分かるため、`when`等で`instanceof`する際に継承しているクラスが既にわかっているため、全て網羅すれば`else`を追加する必要がないという点です。  
これは`enum`とかでも言えることですね

```kotlin
sealed class Setting()
class WifiSetting : Setting()
class BluetoothSetting : Setting()
class DisplaySetting : Setting()

fun example(setting: Setting) {
    // Setting クラスは以下のクラス以外は継承していないので、else を書く必要がない
    when (setting) {
        is BluetoothSetting -> {

        }

        is DisplaySetting -> {

        }

        is WifiSetting -> {

        }
    }
}
```

## 実際どこで使うの
例えば`UI`になにかアラートか何かを出すため、データを入れておくクラスをつくろうと思います。  
アラートはこの三種類、どれも Android 端末を触ったことがあれば出会ったことがあると思う。

- Toast
    - https://developer.android.com/guide/topics/ui/notifiers/toasts
- Snackbar
    - https://m3.material.io/components/snackbar/overview
- Dialog
    - https://m3.material.io/components/dialogs/overview

汎用的にこんな感じかな

```kotlin
class NotifyData(
    val type: Type,
    // メッセージ
    val message: String
) {

    // Toast / Snackbar / ダイアログ のどれか
    enum class Type {
        TOAST,
        SNACKBAR,
        DIALOG
    }

}
```

あ！`Snackbar`と`Dialog`はボタンがあるので、ボタンのテキストも設定できるようにしたいですね。  
うーん雲行きが怪しく

```kotlin
class NotifyData(
    val type: Type,
    val message: String,
    // TOAST 以外
    val actionText: String
) {
    enum class Type {
        TOAST,
        SNACKBAR,
        DIALOG
    }
}
```

あとダイアログは外側を押したらキャンセル出来るかのフラグも欲しいかも

```kotlin
class NotifyData(
    val type: Type,
    val message: String,
    // TOAST 以外
    val actionText: String,
    // DIALOG のみ
    val isCancellable: Boolean
) {
    enum class Type {
        TOAST,
        SNACKBAR,
        DIALOG
    }
}
```

きつくなってきた。  
アラートの種類は`enum`で表現できるのに、種類ごとに必要なデータが違うから使えない・・・！でも継承可だとなんか違う！  
ってときに使うといいと思います。

```kotlin
sealed interface Notify

data class Toast(val message: String) : Notify

data class Snackbar(
    val message: String,
    val actionText: String? = null
) : Notify

data class Dialog(
    val message: String,
    val positiveText: String,
    val isCancellable: Boolean
) : Notify

fun notifyToUi(notify: Notify) {
    when (notify) {
        is Toast -> {
            // Toast を出す処理
        }

        is Snackbar -> {
            // Snackbar を出す処理
        }

        is Dialog -> {
            // Dialog を出す処理
        }
    }
}
```

これをうまく使ったのが、冒頭の`UiState`ですね  
`when`の使いやすさと相まっていいと思う

```kotlin
sealed interface HomeScreenUiState {
    object Loading : HomeScreenUiState
    data class Successful(val data: String) : HomeScreenUiState
    data class Error(val throwable: Throwable) : HomeScreenUiState
}
```

以上！`sealed class`

# Nothing / Any
ようやく本題、はい。

## Any
https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/

全てのクラスのスーパークラス  
全てのクラスはこの`Any`を継承しているってことらしい。

`toString`とかはいつ見てもあると思いますがこれは根っこの部分`Any`で用意されているからなんですねえ

試しにさっき作ったクラスをインスタンス化し`is Any`してみますがもちろん`true`になります

![Imgur](https://imgur.com/Bhpg4nM.png)

## Nothing
https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-nothing.html

これは逆に全てのクラスを継承したクラスです。  
`Any`が根っこなら`Nothing`はてっぺんです←？

全てのクラスを継承しているとかいう**意味不明**なクラスなので、インスタンス化することができません。  

存在しない値を表現する際に使うらしい。例えば`throw`した場合`Nothing`が返される。  
もし`Nothing`を返す関数があればそれは例外を投げるか、無限ループになって呼び出し元に戻らない？になるらしいです。

```kotlin
val error: Nothing = throw RuntimeException("") // throw したら続行できないので、error に値が入ることはない...
```

イマイチ使い方が思いつかないですが、もう一個、多分こっちが本題！、  
インスタンス化して使うことはできませんが、**全てのクラスを継承した型**として使うことができます。

全てのクラスを継承しているクラス（インスタンス化できないので建前でしか無いですが）は**アップキャスト**と組み合わせることで効果を発揮します。

アップキャストはまぁ調べれば出ると思いますが、子クラスを親クラスにキャストするやつです。あの安全な方のキャスト  
`Android`だと`ImageView / TextView (子)`から`View (子が継承している親のクラス)`にキャストするみたいな感じです。  

話を戻して、アップキャストと組み合わせることでこんな事ができます。いや難しいなこれ

```kotlin
// むずかしい...

// 基本的にはアップキャストされるので、View と ImageView だと親クラスの View の配列になる
val list1: List<View> = listOf<ImageView>() + listOf<View>()

// Nothing 型は全てのクラスの子なので、アップキャストして安全を取ったとしても String になる
// Nothing 型のインスタンスなんて無いので、実質 String です
val list1: List<String> = listOf<Nothing>() + listOf<String>()

// Any 型は全てのクラスの親なので、アップキャストすると安全を取って Any 型になる
val list2: List<Any> = listOf<Any>() + listOf<String>()
```

てかこれ考えたん賢くない？？？頭めっちゃいいと思う  
で、これを次の`<out T>`と組み合わせることで、`Jetpack Compose`の`UiState`クラスが共通化できちゃうわけ

### どこで使われてるの
たとえばエルビス演算子（`?:`）は、`null 以外`なら左側の値、`null`なら右側の値を返すという便利な演算子がありますが、  
これ`throw`を右側に置くことも出来ます。これは`null`の場合は例外を投げる。

```kotlin
val responseOrNull: String? = "hello world"
val responseOrThrow: String = responseOrNull ?: throw RuntimeException("null です！")
```

一見すると、`Kotlin`のコンパイラが`?:`の右側に`throw`が来た場合は`NonNull`として返すという処理が特別に入っているのかと思ってしまいますが、  
そうではなく、`throw`は`Nothing`を返すため、先述の通り`String`が選ばれるというわけです。

これは`TODO()`とかいう~~初見殺し~~関数でも使われている技で、`TODO()`を入れると、とりあえずコンパイルが通るようになるのは、  
`TODO()`はまだ未実装だよって例外を投げる。すると`Nothing`を返すため、すべてを継承している`Nothing`で型が解決できているという話なだけです。

```kotlin
// これでコンパイルが通ってしまうのは
// TODO() は例外を投げる。
// Kotlin は例外を投げると Nothing を返す。
// Nothing 型はすべてのクラスを継承しているためとりあえずエラーが消える。
val text: String = TODO()
```

# ジェネリクス
ジェネリックなのかジェネリクスなのか、どっちなんだろう

https://kotlinlang.org/docs/generics.html

そこらの言語と同じ奴。

```kotlin
val list: List<String>
val list2: List<Int>
```

ただ、アップキャストの話をちょっと↑でしましたが、ジェネリクスだとうまく行かないことがあるんですね。（てなことをドキュメントに書いてる）  
たとえばこんなコード

```kotlin
data class CommonData<T>(val data: T)

fun main() {

    var commonData1: CommonData<Any> = CommonData(Any())
    var commonData2: CommonData<String> = CommonData("Hello World")

    // CommonData<Any> に CommonData<String> を入れようとするとエラー
    commonData1 = commonData2

}
```

`String`は`Any`を継承しているので、アップキャストにより入れられるはず・・・が入れようとするとエラーになる。継承してるのになぜ？  

![Imgur](https://imgur.com/k8oDSJf.png)

これは訳あってそうしているらしく、以下のようにダウンキャストの可能性が捨てきれないんですね。（詳しくは `Java ジェネリクス 共変`とかで調べてみてください）  
参考： https://kotlinlang.org/docs/generics.html#variance

（なので以下のコードは動きません）

```kotlin
data class CommonData<T>(var data: T) // 意図的に var にしました

fun main() {
    // String の箱
    var commonData1: CommonData<String> = CommonData("Hello World")

    // Any の箱、String は Any を継承しているので入るはずだが、エラーになる
    // もし仮にエラーにならないとする
    var commonData2: CommonData<Any> = commonData1

    // Any の箱に Any を入れる
    commonData2.data = Any()

    // さて、これは？
    // Any を String にしようとしている...！
    val string: String = commonData1.data
}
```

話を戻して、で、これを解決する方法があります。  
`Java`でも出来るらしいですが、`Kotlin`だと`out`を利用することでこの問題を解決できます。  

```kotlin
data class CommonData<out T>(val data: T) // <out T> にする 

fun main() {

    var commonData1: CommonData<Any> = CommonData(Any())
    var commonData2: CommonData<String> = CommonData("Hello World")

    // CommonData<Any> に CommonData<String> が入るようになった
    commonData1 = commonData2

}
```

これだとなんで通るようになるのかですが、`<out T>`だと`T`は返り値としてしか使うことができず、`setter`や`var`等の値を変更する箇所で`T`を使おうとすると怒られるわけです。  

上記の問題は`setter`を使われてしまった場合に値が変わってしまう可能性があるために出来ないようにしていた、、、  
が、変化しないと`<out T>`で宣言することでこの問題が解決！ついでに変化しないので継承している子クラスも入れられるようになりました。

```kotlin
data class CommonData<out T>(val data: T)

fun main() {
    // String の箱
    var commonData1: CommonData<String> = CommonData("Hello World")

    // out T なら出来る
    var commonData2: CommonData<Any> = commonData1

    // out T なので getter / val しか作ることが出来ず、結果的に後から値を変えることはできなくなるため、安全になる
    commonData2.data = Any() // エラー！

    // 書き換わらないので安全！
    val string: String = commonData1.data
}
```

# これらを組み合わせると
こういうステートが作れます。
一体それぞれが何の役割をしているか、わかった気がしませんか？

```kotlin
sealed interface BaseUiState<out T> {
    object Loading : BaseUiState<Nothing>
    data class Successful<T>(val data: T) : BaseUiState<T>
    data class Error(val throwable: Throwable) : BaseUiState<Nothing>
}
```

- `sealed interface`
    - 継承しているクラスを`Loading`/`Successful`/`Error` の3つに制限
    - `when`や`in`でクラスを比較する際はこの3つを見ればおっけー
- `object Loading`
    - 値を持たない場合は`object`でいいらしい
    - もちろん`sealed interface`を継承してね
- `data class Successful<T>`
    - 成功時の状態と型
    - 型をパラメータとして取ることで共通化
- `data class Error`
    - エラー状態
- ジェネリクスに入れている`Nothing`
    - 全てのクラスを継承している型 `Nothing`
    - 成功時以外は型を`Nothing`にすることで、アップキャストが働き`Nothing`以外の型を探そうとし、結果成功時の型が使われるようになる
        - `Successful<T>`の型になる！
- `<out T>`
    - ステート自体を共通化したいのでジェネリクスしたい！
        - `Loading`/`Error`の型をどうすればいいの？
            - 全てのクラスを継承した型 `Nothing` を使うとアップキャストが効いていい感じ
    - `<T>`に`out`をつけることで、親クラスを指定した際に子クラスも型パラメータに入れることを許容するように
        - 先述の通り`Nothing`という特殊な型により、自動的に成功時の型が使われるようになる

・・・ってことで合ってる？

## 使われている所
`emptyList()`という空の配列を返す関数があります。  
こんな感じに、`List`自体が`nullable`の場合にエルビス演算子と合わせて使うと`NonNull`になるので便利。  

```kotlin
val responseListOrNull: List<String>? = listOf("Hello World")
val responseListOrEmpty = responseListOrNull ?: emptyList()
```

これは一見`emptyList()`が中で`new List<T>`しているのかな？と思いきやここでも`Nothing`が活用されています。  
`EmptyList`と呼ばれる`List<Nothing>`型の配列を返しています。  

この関数はジェネリクスで`<T>`を取って**は**いますが、実際には使っておらず、シングルトンで作られた、中身のない配列、`List<Nothing>`を返しています。  

```kotlin
internal object EmptyList : List<Nothing>, Serializable, RandomAccess {
    // 興味があれば Kotlin のコード見てきてください
}

public fun <T> emptyList(): List<T> = EmptyList
```

https://github.com/JetBrains/kotlin/blob/c6f337283d59fcede75954eebaa589ad1b479aea/libraries/stdlib/src/kotlin/collections/Collections.kt#L72

また、`Kotlin`の`List`は`out T`（今見たら`E`だった）といった感じで`out`が付いています。  
これにより、`List`のジェネリクスの型`<T>`に`T`と`T`を継承した型を入れられるようになっています。そして`Nothing`は先述の通りすべての子なのでこの`T`にいれることが出来ているわけです。  

# おわりに
間違ってたらすいません

# 参考にしました
難しい

https://stackoverflow.com/questions/44243763/how-to-make-sealed-classes-generic-in-kotlin
https://phoneappli.hatenablog.com/entry/2021/03/30/180749
https://stackoverflow.com/questions/55953052/kotlin-void-vs-unit-vs-nothing