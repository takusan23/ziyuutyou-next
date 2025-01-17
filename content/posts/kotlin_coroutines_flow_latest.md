---
title: Kotlin Coroutines の Flow で collect したら別の Flow を collect したい
created_at: 2023-09-17
tags:
- Kotlin
---

どうもこんばんわ。  
iPhone 15 の発表会があったそうですが普通に寝てました、  
みんな`USB Type-C`やら`ミリ波アンテナ非搭載`ばっか目が行ってるけど、`Pro`の方だと`AV1のハードウェアデコーダー`が入ってるらしいじゃん！！  
まぁ`AV1 コーデック`使う機会が来るのかはまた...  

# 本題
`flow`で`collect`した値を元に、別の`flow`を`collect`したい。  

適当に例を書いたけど、こんな感じにユーザーを返す`Flow`の値を使って、下のコメントを返す`Flow`を収集したい。

```kotlin
suspend fun collectValue() {
    // ユーザー一覧を Flow で返す
    val userFlow: Flow<List<User>> = getRealtimeUserIdList()

    // ↑の flow が新しい値で発行されたら ↓ の flow に渡して、flow を購読したい。
    // ↑の flow から新しい値が来たら、既に動いている ↓ の flow をキャンセルして、作り直して欲しい

    // ユーザーを渡すとコメントが Flow で返される
    val commentFlow: Flow<List<Message>> = getRealtimeUserComment(user = /* TODO */)
}
```

# 解決

https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map-latest.html

`mapLatest` か `collectLatest` を使えば解決  
前回の収集をキャンセルして、常に最新の値で別の`Flow`を`collect`できる

```kotlin
getRealtimeUserIdList()
    // ユーザー一覧を貰ったら、コメント取得 flow をそれぞれ呼び出す
    // Latest を使うと、一個前に呼ばれたこの↓のブロックはキャンセルされる
    .collectLatest { userIdList ->
        println("receive new user list")
        userIdList
            // flow を作る
            .map { user -> getRealtimeUserComment(user) }
            // 複数の flow なので（List<Flow>）、一つにまとめる（型が同じなので問題ない）
            .merge()
            // ↑の Flow の収集を始める
            // 先述の通り、新しい値（この場合 getRealtimeUserIdList() から新しい値が流れてきた場合）
            // ここの収集はキャンセルされ、新しい値で再度実行される
            .collect {
                println(it)
            }
    }
```

こんな感じに、`getRealtimeUserIdList()`が新しい値を発行したら、既に動いている`getRealtimeUserComment()`の方はキャンセルされ、新しく`getRealtimeUserComment()`を作り購読するようにしています！これがやりたかったんだよな～

```plaintext
receive new user list
Message(user=User(id=0), message=[うっさ, ミュート芸, ミュート芸, 延長しろ])
Message(user=User(id=1), message=[ミュート芸, わこつ, ミュート芸, あ でも い でも良いから書け])
Message(user=User(id=0), message=[わこつ, わこつ, わこつ, 延長しろ])
Message(user=User(id=1), message=[あ でも い でも良いから書け, わこつ, 延長しろ, 延長しろ])
Message(user=User(id=0), message=[あ でも い でも良いから書け, 延長しろ, 延長しろ, 延長しろ])
Message(user=User(id=1), message=[あ でも い でも良いから書け, わこつ, ミュート芸, おつ])
Message(user=User(id=0), message=[あ でも い でも良いから書け, おつ, わこつ, あ でも い でも良いから書け])
Message(user=User(id=1), message=[おつ, あ でも い でも良いから書け, わこつ, うっさ])
receive new user list
Message(user=User(id=2), message=[わこつ, あ でも い でも良いから書け, うっさ, おつ])
Message(user=User(id=3), message=[わこつ, あ でも い でも良いから書け, 延長しろ, うっさ])
Message(user=User(id=2), message=[あ でも い でも良いから書け, うっさ, あ でも い でも良いから書け, おつ])
```

## transformLatest
https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/transform-latest.html

また、`Android`の`Jetpack Compose`とかで使いたい場合は、`Flow#collectAsState`したいと思うので、  
その場合は`collectLatest`ではなく、変換した`Flow`を返す`transformLatest`を選ばないとダメですね。  

```kotlin
val commentFlow: Flow<Message> = getRealtimeUserIdList()
    // ユーザー一覧を貰ったら、コメント取得 flow をそれぞれ呼び出す
    // Latest を使うと、一個前に呼ばれたこの↓のブロックはキャンセルされる
    .transformLatest { userIdList ->
        println("receive new user list")
        userIdList
            // flow を作る
            .map { user -> getRealtimeUserComment(user) }
            // 複数の flow なので（List<Flow>）、一つにまとめる（型が同じなので問題ない）
            .merge()
            // ↑の Flow の収集を始める
            // 先述の通り、新しい値（この場合 getRealtimeUserIdList() から新しい値が流れてきた場合）
            // ここの収集はキャンセルされ、新しい値で再度実行される
            .collect {
                // 収集した値を、Flow の返り値として使う
                emit(it)
            }
    }
```

```
// collect するもよし
commentFlow.collect {
    println(it)
}

// Jetpack Compose の State として使うのもよし
commentFlow.collectAsState()
```

ほかにも、`List<User>`みたいに配列で欲しい（`Flow`の返り値を`Flow<Message>`ではなく、`Flow<List<Message?>>`にしたい）場合はこんな感じですかね  
うーーんあんまりきれいに書けなかった...

```kotlin
val commentFlow: Flow<List<Message?>> = getRealtimeUserIdList()
    // ユーザー一覧を貰ったら、コメント取得 flow をそれぞれ呼び出す
    // Latest を使うと、一個前に呼ばれたこの↓のブロックはキャンセルされる
    .transformLatest { userIdList ->
        println("receive new user list")
        // 入れておく配列
        val commentArray = Array<Message?>(userIdList.size) { null }
        userIdList
            // ユーザーの数だけ flow を作って
            // onEach で値を受け取った際に、array に入れるようにする、その後値を transformLatest へ返してあげると、flow の返り値になる
            .mapIndexed { index, user ->
                getRealtimeUserComment(user)
                    .onEach {
                        commentArray[index] = it
                        emit(commentArray.toList())
                    }
            }
            // 複数件あるのでマージする
            .merge()
            // 収集する
            .collect()
    }
```

```plaintext
receive new user list
[Message(user=User(id=0), message=[あ でも い でも良いから書け, 延長しろ, あ でも い でも良いから書け, あ でも い でも良いから書け]), null]
[Message(user=User(id=0), message=[あ でも い でも良いから書け, 延長しろ, あ でも い でも良いから書け, あ でも い でも良いから書け]), Message(user=User(id=1), message=[延長しろ, あ でも い でも良いから書け, おつ, ミュート芸])]
[Message(user=User(id=0), message=[うっさ, 延長しろ, ミュート芸, 延長しろ]), Message(user=User(id=1), message=[延長しろ, あ でも い でも良いから書け, おつ, ミュート芸])]
[Message(user=User(id=0), message=[うっさ, 延長しろ, ミュート芸, 延長しろ]), Message(user=User(id=1), message=[延長しろ, あ でも い でも良いから書け, あ でも い でも良いから書け, うっさ])]
[Message(user=User(id=0), message=[おつ, ミュート芸, おつ, うっさ]), Message(user=User(id=1), message=[延長しろ, あ でも い でも良いから書け, あ でも い でも良いから書け, うっさ])]
[Message(user=User(id=0), message=[おつ, ミュート芸, おつ, うっさ]), Message(user=User(id=1), message=[わこつ, うっさ, ミュート芸, おつ])]
[Message(user=User(id=0), message=[ミュート芸, おつ, うっさ, ミュート芸]), Message(user=User(id=1), message=[わこつ, うっさ, ミュート芸, おつ])]
[Message(user=User(id=0), message=[ミュート芸, おつ, うっさ, ミュート芸]), Message(user=User(id=1), message=[わこつ, おつ, わこつ, 延長しろ])]
receive new user list
[Message(user=User(id=2), message=[あ でも い でも良いから書け, 延長しろ, おつ, うっさ]), null]
[Message(user=User(id=2), message=[あ でも い でも良いから書け, 延長しろ, おつ, うっさ]), Message(user=User(id=3), message=[わこつ, 延長しろ, 延長しろ, わこつ])]
```

# ちなみに
`Flow<List<User>>`ではなく、`Flow<User>`みたいに、配列ではない場合はもっと簡単にかけます。  
まぁ複数あったとしても`Flow#merge`で１つの`Flow`にしてしまえばおっけーだと思います。

```kotlin

fun getRealtimeOneUserId(): Flow<User> = flow {
    var index = 0
    while (currentCoroutineContext().isActive) {
        // いい感じのダイナモ感覚
        delay(5_000)
        emit(User(index++))
    }
}

val commentList: Flow<Message> = getRealtimeOneUserId()
    .transformLatest { user ->
        println("receive new user")
        getRealtimeUserComment(user)
            .collect { message -> emit(message) }
    }
commentList.collect { println(it) }
```

```plaintext
receive new user
Message(user=User(id=0), message=[延長しろ, うっさ, ミュート芸, わこつ])
Message(user=User(id=0), message=[ミュート芸, 延長しろ, おつ, あ でも い でも良いから書け])
Message(user=User(id=0), message=[ミュート芸, おつ, わこつ, おつ])
Message(user=User(id=0), message=[わこつ, 延長しろ, うっさ, 延長しろ])
receive new user
Message(user=User(id=1), message=[おつ, あ でも い でも良いから書け, おつ, うっさ])
Message(user=User(id=1), message=[わこつ, 延長しろ, 延長しろ, おつ])
```

## ちなみ2
`println("receive new user")`や`println("receive new user list")`は分かりやすくしているだけなので、なくても動く（当たり前）

# もっと詳しく話せ

まず前提になるコードです  
適当にデータクラスを用意して、それぞれ定期的に適当に`Flow`を用意しました、

```kotlin
data class User(val id: Int)
data class Message(val user: User, val message: List<String>)

fun getRealtimeUserIdList(): Flow<List<User>> = flow {
    var index = 0
    while (currentCoroutineContext().isActive) {
        // いい感じのダイナモ感覚
        delay(5_000)
        // 適当な数のユーザーを用意して返す
        val randomUserList = (0 until 2).map { User(index++) }
        emit(randomUserList)
    }
}

fun getRealtimeUserComment(user: User): Flow<Message> = flow {
    val commentList = listOf("わこつ", "ミュート芸", "延長しろ", "うっさ", "おつ", "あ でも い でも良いから書け")
    while (currentCoroutineContext().isActive) {
        delay(1_000)
        // 適当に3件選んで返す
        val randomCommentList = (0..3).map { commentList.random() }
        emit(
            Message(
                user = user,
                message = randomCommentList
            )
        )
    }
}
```

ユーザーを購読して～コメントを購読するとするとまずこう

```kotlin
getRealtimeUserIdList().collect { userIdList ->
    println("receive new user list")

    // ユーザーの数だけ flow を購読
    userIdList.map { user ->
        // collect { } だと collect 中は一時停止になる
        // ので、onEach と launchIn にした
        getRealtimeUserComment(user).onEach { message ->
            println(message)
        }.launchIn(this)
    }
}
```

しかし、これだと、`Flow`の更新のたびに`getRealtimeUserComment()`を呼び出しています。  

```plaintext
receive new user list
Message(user=User(id=8), message=[
Message(user=User(id=9), message=[
Message(user=User(id=6), message=[
Message(user=User(id=7), message=[
Message(user=User(id=4), message=[
Message(user=User(id=5), message=[
Message(user=User(id=2), message=[
Message(user=User(id=3), message=[
Message(user=User(id=0), message=[
Message(user=User(id=1), message=[
```

これが期待値の場合もありますが、今回は値を受け取ったら既に動いている`flow`をキャンセルしてほしい  
と思った時に書くやつ

```kotlin
val commentScope = CoroutineScope(Dispatchers.Default)

getRealtimeUserIdList().collect { userIdList ->
    println("receive new user list")
    // 新しい値が来たので既に動いてるやつをキャンセル
    commentScope.coroutineContext.cancelChildren()

    // ユーザーの数だけ flow を購読
    userIdList.map { user ->
        // collect { } だと collect 中は一時停止になる
        // ので、onEach と launchIn にした
        getRealtimeUserComment(user).onEach { message ->
            println(message)
        }.launchIn(commentScope)
    }
}
```

別のコルーチンスコープを作って、ユーザー用とコメント用で分けて、コメント用は更新のたびにキャンセルする。  
たしかにこれでも動くのですが、、、もっとなんかいい方法があるはず！

```plaintext
receive new user list
Message(user=User(id=1), message=[ミュート芸, 延長しろ, うっさ, あ でも い でも良いから書け])
Message(user=User(id=0), message=[ミュート芸, わこつ, わこつ, あ でも い でも良いから書け])
Message(user=User(id=0), message=[おつ, ミュート芸, わこつ, 延長しろ])
Message(user=User(id=1), message=[延長しろ, ミュート芸, あ でも い でも良いから書け, おつ])
Message(user=User(id=0), message=[うっさ, おつ, わこつ, あ でも い でも良いから書け])
Message(user=User(id=1), message=[延長しろ, わこつ, あ でも い でも良いから書け, あ でも い でも良いから書け])
Message(user=User(id=0), message=[ミュート芸, わこつ, わこつ, うっさ])
Message(user=User(id=1), message=[うっさ, うっさ, 延長しろ, 延長しろ])
receive new user list
Message(user=User(id=2), message=[おつ, あ でも い でも良いから書け, うっさ, わこつ])
Message(user=User(id=3), message=[ミュート芸, おつ, 延長しろ, おつ])
Message(user=User(id=2), message=[あ でも い でも良いから書け, わこつ, 延長しろ, ミュート芸])
```

というわけで`collectLatest`/`mapLatest`/`transformLatest`の登場。  
前回のブロックをキャンセルしてくれます。以上です。

# つまり...

https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/map-latest.html

`collect { }`の中でコルーチン使いたい時（`collect { }`したい等）ときは、`collectLatest { }`を親にする？と次の値が来た時にキャンセルして再起動してくれる。  

# コードおいていきます

https://github.com/takusan23/FlowLatest

# おわりに

`Latest`系のオペレーターはなぜか`@OptIn`しないと`Lint`で怒られます...  
早く安定になって欲しい

![Imgur](https://i.imgur.com/PQgRznT.png)