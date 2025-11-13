---
title: 要 Shizuku アプリを切り替えたら自動でタスクを終了するアプリ
created_at: 2025-11-14
tags:
- Android
- Kotlin
---
どうもこんばんわ。最近買ったもの紹介ドラゴン。いつまで使えてるか記録します。

水筒。象印の`720ml`のワンタッチじゃない方です。水道水飲んでます。名古屋のお水が美味しいらしいので飲んでみたいです（買ったものと関係ない）  
なんか知らんけどよく頭が痛くなるので、水不足による頭痛を回避するために持ち歩いてる。まあ寝すぎの頭痛とかあるので原因の1つを潰しただけなんですけどね、  
ひねって開けるタイプの方を買ったので、容量の割に小さめなのかなとちょっと思った。

あとはリュックサックを無印のでかいやつにしました。いっぱい入るのでいい！！  
今まで使ってたやつがもう風前の灯。汚れてきちゃった。

おわり。

# 本題
`Xperia 1 VII`のカメラ、なんと**アプリを切り替えても状態が保持されてる。**  
`Android アプリ開発`したことがあれば、状態を引き継ぐ`onSaveInstanceState()`を律儀に実装していて偉いと口を揃えるかと思います。  
全人類の敵である**アクティビティを保持しない**を有効にしてもちゃんと動くというのは素晴らしいです。

静止画撮影モード・動画撮影モード・ズーム倍率・自撮りカメラ・・・をアプリを終了せずに切り替えた場合に（タスク一覧画面に残した状態）アプリの状態を復元する。

が、、、**どうもこの挙動が慣れなくて・・・**
`Pixel`の場合だと動画撮影で倍率変えてても、アプリを一旦離れた状態でリセットされてるので、履歴画面から開いてもまた静止画モード、等倍ズームに戻ってくれてます。  
こっちがいい！！

んだけど、設定を見てもそれらしき項目は見つからなかった。。私は！こっちの！挙動が良い！！

`Android アプリ開発者向け`に話すと、この処理を任意のアプリで使いたい。  
アプリを離れたら`onStop()`にライフサイクルが進むので、そこでタスクから削除する`finishAndRemoveTask()`を呼び出したい。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onStop() {
        super.onStop()
        finishAndRemoveTask()
    }
}
```

# つくった
アプリを離れたら自動でタスクを終了するアプリ！！！  
以下の録画はカメラアプリではないですが、好きなアプリを離れたと同時にタスク削除することが出来ます。

| 前                                                                                                             | 後                                                                                                             |
|----------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| <video width="300" height="600" controls src="https://github.com/user-attachments/assets/ecdc5050-f05b-4c98-8554-dc765f65cb93"></video> | <video width="300" height="600" controls src="https://github.com/user-attachments/assets/e7c4cfa0-0173-408c-bed0-7c6b09234507"></video> |

使い道としては、今回のように離れたときにアプリを勝手に閉じておいてほしい時に使えます。  
今回のカメラアプリの件や、放ったらかしにすると使えなくなるアプリとか？に

ブラウザアプリは**絶対**やめたほうが良いです。`シークレットタブ`が消えるので。

いい感じに動いてると思います。これでカメラの倍率を毎回戻す手間がなくなりました。。。

# だうんろーど
`APK`あります。

https://github.com/takusan23/OnStop2FinishAndRemoveTask/releases

ソースコードもあります。後述しますが`Shizuku`+`隠しAPI`のコンボなので`android.jar`を差し替える必要があります。

https://github.com/takusan23/OnStop2FinishAndRemoveTask

# 仕組み

- 今表示されている`Activity`がタスク削除対象になるまで待つ
- 削除対象が他の画面になるまで待つ
- 消す
- 最初に戻る

# 隠しAPIを使っています
`Android`のソースコードである`AOSP`を斜め読みして、今表示されている`Activity`が切り替わったときに呼ばれるコールバックと、タスク一覧画面からタスク（アプリ）を終了する`関数`を見つけました。  
多分`IActivityManager`にある`registerTaskStackListener()`と`removeTask()`ですね。

ただ、もちろんのことこれらの`API`は`Android`内部で使われる前提なので、そもそもサードパーティーのアプリが利用できない。  
いくつか問題があり、権限の件、`隠しAPI`の件、`リフレクション対策`の件。

権限の話ですが、`Shizuku`を使います。これは内部で使われている`API`を`Shizuku`が代わりに叩いてくれます。詳しい話はまだ今度（前もまた今度って言った気がする・・・）  
`ActivityManager`とか`TelephonyManager`等の`なんとかManager`にある関数呼び出しを`Shizuku`経由にすることができます。

まだ問題があります。`隠しAPI`の話です。`Android Studio`の`SDK Manager`からダウンロードできる`android.jar`は`隠しAPI`が削除された状態になってます。  
まあ実行時には`隠しAPI`も存在するのでリフレクションする技もありますが・・・`Android Studio`へ`隠しAPI`が入った`android.jar`に差し替えるのが良いかと。

https://github.com/Reginer/aosp-android-jar

最後に`リフレクション対策`の話。これは`AndroidHiddenApiBypass`ライブラリを入れることで回避できます。  
というのも、いくら`隠しAPI`とは言え`AOSP`には確かに存在するのに、リフレクションで関数を呼び出そうとしても`存在しない例外`を投げる仕組みが何故か存在します。  
`Shizuku`は関数呼び出しに成功した後の、権限を回避するために使うものであり、そもそも関数が見つからない場合はこの回避策が必要になる。

https://github.com/LSPosed/AndroidHiddenApiBypass

## 表示されてる Activity 取得
`Shizuku`で呼び出して、`Flow`でコールバックをいい感じにしてこんな感じ。`ActivityManager`にある関数呼び出しを`Shizuku`経由にするための`IActivityManager...`ですね。  
あとは`collect { }`するたびに`callbackFlow { }`の中身が起動する（コールバックがその都度登録される）のをやめるために`stateIn()`で`HotFlow (StateFlow)`に変換しています。

```kotlin
val taskStackHotFlow = callbackFlow {
    val listener = object : ITaskStackListener.Stub() {
        override fun onTaskMovedToFront(taskInfo: ActivityManager.RunningTaskInfo?) {
            trySend(taskInfo)
        }
        // TODO 他にもコールバックがいっぱい存在します
    }

    val activityManager = IActivityManager.Stub.asInterface(
        ShizukuBinderWrapper(ServiceManager.getService("activity"))
    )

    activityManager.registerTaskStackListener(listener)
    awaitClose { activityManager.unregisterTaskStackListener(listener) }
}.stateIn(
    scope = scope,
    started = SharingStarted.Eagerly,
    initialValue = null
)
```

## 削除している部分
`first { }`で削除対象が来るまで一時停止します。その後、他のアプリに切り替わるのも待って確認します。  
これでもう他のアプリに切り替わったので削除の準備が整った。`removeTask()`を呼び出します。

純粋な`while`ループで作れたのがお気に入り。`suspend fun`なのでめっちゃ同期的なコードに原点回帰が出来る。

```kotlin
scope.launch {

    val idList = listOf("") // ここに離れたときに削除したい applicationId
    val activityManager = IActivityManager.Stub.asInterface(
        ShizukuBinderWrapper(ServiceManager.getService("activity"))

    )

    while (isActive) {

        // 削除対象が来るまで待つ
        val removeTask = taskStackHotFlow.first { info -> info?.topActivity?.packageName in idList }
        // 別のアプリが開かれるのを待つ
        taskStackHotFlow.first { info -> info?.topActivity?.packageName !in idList }

        if (removeTask != null) {
            // 削除する
            activityManager.removeTask(removeTask.taskId)
        }
    }
}
```

これだけです。このアプリではこれを`フォアグラウンドサービス`で実行しています。

https://github.com/takusan23/OnStop2FinishAndRemoveTask/blob/master/app/src/main/java/io/github/takusan23/onstop2finishandremovetask/OnStop2FinishAndRemoveTaskService.kt

# おまけ

## アクセシビリティサービスでなんとかなったかも
多分いま表示されている`Activity`を取得することは`Shizuku`使わずにとも`AccessibilityService`で作れた可能性がある。  
ただタスクから消す方法がイマイチ存在しなさそうで。

## Shizuku で Toast を出す
`Toast`を出したかったが、何故かカメラアプリだから出せなかった。`logcat`には以下のように表示された。

```plaintext
Suppressing toast from package io.github.takusan23.onstop2finishandremovetask by user request.
```

`Shizuku`経由で`Toast`を出せば流石に表示されるやろってことで、これで表示できると思います。

```kotlin
val notification = INotificationManager.Stub.asInterface(
    ShizukuBinderWrapper(ServiceManager.getService("notification"))
)
notification.enqueueTextToast(
    "com.android.shell",
    Binder(),
    "Shizuku で Toast を出す",
    Toast.LENGTH_SHORT,
    isUiContext,
    displayId,
    object : ITransientNotificationCallback.Stub() {
        override fun onToastShown() {
            // do nothing
        }

        override fun onToastHidden() {
            // do nothing
        }
    }
)
```

# おわりに
まじで関係ない話ですが、`B2C`とか`E2E`とか`P2P`とかの、`to`を`2`に置き換えるやつ、同じ音（？）だから、ただ短くなるってだけの意味だけなんですかね？英語わからん・・・