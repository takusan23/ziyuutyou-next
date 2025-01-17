---
title: AndroidのNonNullアノテーションはnullを返す場合があり、Kotlinで問題になる話
created_at: 2023-01-07
tags:
- Android
- Kotlin
---

# Android 「この値は @NonNull やで」→ Kotlin 「ほな厳密なnullチェックするで」→ Android 「実行時にやっぱ null 返すわ！」→ NullPointerException
うそつくな

# 本題
`Android`の`@NonNull`アノテーションはたまによく`null`を渡す。これが`Java`なら問題なかったけど、`Kotlin`だと例外で落ちてしまうって話。

## おことわり
本記事で言う`@NonNull`は`android.annotation`、`androidx.annotation`のことです。

![Imgur](https://i.imgur.com/jbCinCs.png)

# 修正する
多分2パターン存在します。

## Javaファイルを作成し、@NonNullなインターフェースを継承し、@NonNullを全部@Nullableにする
`.java`を作る必要があるので、なんか負けた気分になります（が、`Android`が`@NonNull`守らないのが悪いので仕方ない、、、）

例えば、こんな感じにJavaで書かれたインターフェースに`@NonNull`がついている場合  
（以下は`Android`の`OnGestureListener`です）  
```java
public interface OnGestureListener {
    boolean onDown(@NonNull MotionEvent e);

    void onShowPress(@NonNull MotionEvent e);

    boolean onSingleTapUp(@NonNull MotionEvent e);

    boolean onScroll(@NonNull MotionEvent e1, @NonNull MotionEvent e2, float distanceX, float distanceY);

    void onLongPress(@NonNull MotionEvent e);

    boolean onFling(@NonNull MotionEvent e1, @NonNull MotionEvent e2, float velocityX, float velocityY);
}
```

自前でこのインターフェースを継承するインターフェースを作成し、`@NonNull`を`@Nullable`に置き換えます。  
このとき**Java**で作成する必要があります。

```java
import android.view.GestureDetector;
import android.view.MotionEvent;

import androidx.annotation.Nullable;

/** OnGestureListener を Nullable にしたもの */
public interface NullableOnGestureListener extends GestureDetector.OnGestureListener {

    @Override
    boolean onDown(@Nullable MotionEvent e);

    @Override
    void onShowPress(@Nullable MotionEvent e);

    @Override
    boolean onSingleTapUp(@Nullable MotionEvent e);

    @Override
    boolean onScroll(@Nullable MotionEvent e1, @Nullable MotionEvent e2, float distanceX, float distanceY);

    @Override
    void onLongPress(@Nullable MotionEvent e);

    @Override
    boolean onFling(@Nullable MotionEvent e1, @Nullable MotionEvent e2, float velocityX, float velocityY);
}
```

これで、`Kotlin`でも`Nullable`として扱ってくれるので、`null`が入ってきた場合でも落ちなくなります。  
`MotionEvent`が全部`Nullable`になりました。やったね

```kotlin
class MainActivity : ComponentActivity(), NullableOnGestureListener {

    override fun onDown(e: MotionEvent?): Boolean {
        // TODO
    }

    override fun onShowPress(e: MotionEvent?) {
        // TODO
    }

    override fun onSingleTapUp(e: MotionEvent?): Boolean {
        // TODO
    }

    override fun onScroll(e1: MotionEvent?, e2: MotionEvent?, distanceX: Float, distanceY: Float): Boolean {
        // TODO
    }

    override fun onLongPress(e: MotionEvent?) {
        // TODO
    }

    override fun onFling(e1: MotionEvent?, e2: MotionEvent?, velocityX: Float, velocityY: Float): Boolean {
        // TODO
    }

    // 省略...
}
```

## もう一つ
これはやっていいのかわからないのですが、どうしても`Kotlin`で完結させたい場合は使えます。  
`Suppress`で黙らせるやつですね。引数が`NonNull`から`Nullable`になるだけ（引数が増えているわけではない）なので、おそらく実行時に落ちることはないと思いますが、、、

```kotlin
@Suppress("NOTHING_TO_OVERRIDE", "ACCIDENTAL_OVERRIDE", "ABSTRACT_MEMBER_NOT_IMPLEMENTED")
class MainActivity : ComponentActivity(), GestureDetector.OnGestureListener {

    override fun onDown(e: MotionEvent?): Boolean {
        // TODO
    }

    override fun onShowPress(e: MotionEvent?) {
        // TODO
    }

    override fun onSingleTapUp(e: MotionEvent?): Boolean {
        // TODO
    }

    override fun onScroll(e1: MotionEvent?, e2: MotionEvent?, distanceX: Float, distanceY: Float): Boolean {
        // TODO
    }

    override fun onLongPress(e: MotionEvent?) {
        // TODO
    }

    override fun onFling(e1: MotionEvent?, e2: MotionEvent?, velocityX: Float, velocityY: Float): Boolean {
        // TODO
    }

    // 省略....
}
```

# 事の発端

```plaintext
java.lang.NullPointerException: Parameter specified as non-null is null: method kotlin.jvm.internal.Intrinsics.checkNotNullParameter, parameter cellInfo
	at io.github.takusan23.newradiosupporter.tool.NetworkCallbackTool$listenNetworkStatus$1$callback$1.onCellInfoChanged(Unknown Source:2)
	at android.telephony.TelephonyCallback$IPhoneStateListenerStub.lambda$onCellInfoChanged$18(TelephonyCallback.java:1504)
	at android.telephony.TelephonyCallback$IPhoneStateListenerStub$$ExternalSyntheticLambda41.run(Unknown Source:4)
	at android.os.Handler.handleCallback(Handler.java:938)
	at android.os.Handler.dispatchMessage(Handler.java:99)
	at android.os.Looper.loopOnce(Looper.java:346)
	at android.os.Looper.loop(Looper.java:475)
	at android.app.ActivityThread.main(ActivityThread.java:7889)
	at java.lang.reflect.Method.invoke(Native Method)
	at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:548)
	at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:1009)
```

`onCellInfoChanged`で`NullPointerException`になってしまう。  
原因は`onCellInfoChanged`を`Android`が呼び出す際に`cellInfo`を`null`で渡しているため、、、

```java
/**
 * Interface for cell info listener.
 */
public interface CellInfoListener {
    /**
     * Callback invoked when a observed cell info has changed or new cells have been added
     * or removed on the registered subscription.
     * Note, the registration subscription ID s from {@link TelephonyManager} object
     * which registers TelephonyCallback by
     * {@link TelephonyManager#registerTelephonyCallback(Executor, TelephonyCallback)}.
     * If this TelephonyManager object was created with
     * {@link TelephonyManager#createForSubscriptionId(int)}, then the callback applies to the
     * subscription ID. Otherwise, this callback applies to
     * {@link SubscriptionManager#getDefaultSubscriptionId()}.
     *
     * @param cellInfo is the list of currently visible cells.
     */
    @RequiresPermission(allOf = {
            Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.ACCESS_FINE_LOCATION
    })
    void onCellInfoChanged(@NonNull List<CellInfo> cellInfo);
}
```

## Androidの@NonNullアノテーション
これ単純に**ビルド時**に`null`の可能性があるときに警告を出すものなので、ライブラリ開発者とかは意識するといいかもしれないですが、それ以外ならぶっちゃけ無くてもまあ、、、

```java
public class NonNullCheck {

    NonNullCheck() {
        methodA("はい");
        // 警告が出るだけでビルドは通ってしまう
        methodA(null);
    }

    private void methodA(@NonNull String argA) {
        // NonNull でも null 入るときは入るので
        if (argA == null) {
            return;
        }
        System.out.println(argA);
    }
}
```

![Imgur](https://i.imgur.com/wPkCSwj.png)

## 一方 Kotlin の NonNull
`Kotlin`は`Null`を厳格にチェックするため、`?`がついていない引数はビルドも通らないし、実行時も落ちるようになっています。  

```kotlin
class NonNullCheckKt {

    init {
        methodA("はい")
        // ビルドは通らない
        methodA(null)
    }

    fun methodA(argA: String) {
        // argA は null にはならない
    }

}
```

また実行時にも`NonNull`は機能し、関数内に引数が`null`ではないことを確認する処理が自動で挿入されています。  
（全然Androidとは関係ない`Kotlin`プロジェクトだけど変わらないはず）

```kotlin
/**
 * ドロップ数を返す。失敗したら1
 *
 * @param itemStack アイテム
 * */
private fun getDropSize(itemStack: ItemStack): Int {
    return itemStack.name.string.toIntOrNull() ?: 1
}
```

逆コンパイルすると`nullチェック`する関数が挿入されている
```java
private final int getDropSize(class_1799 itemStack) {
  Intrinsics.checkNotNullExpressionValue(itemStack.method_7964().getString(), "itemStack.name.string");
  StringsKt.toIntOrNull(itemStack.method_7964().getString());
  return (StringsKt.toIntOrNull(itemStack.method_7964().getString()) != null) ? StringsKt.toIntOrNull(itemStack.method_7964().getString()).intValue() : 1;
}
```

## Javaで書いた@NonNullはKotlinだと？
さて、`@NonNull`でも実行時は`null`を渡す可能性がある話をしましたが、、、いかが。  

まぁ予想通り`Kotlin`でもアノテーションを尊重して`NonNull`として扱われます。  
https://kotlinlang.org/docs/java-interop.html#nullability-annotations

今回、`@NonNull`が`Java`の場合に落ちないけど、`Kotlin`の場合にいきなり落ちるようになったのはこの影響です。


```java
public interface NonNullInterface {
    void onCallback(@NonNull String string);
}
```

```kotlin
class NonNullCheckKt : NonNullInterface {
    override fun onCallback(string: String) {

    }
}
```

以上です。  

# おわりに
`targetSdk = 33`から、`MotionEvent`が`NonNull`になった影響でわりと`Issue`がちらほら（全然良くない；；）

- https://issuetracker.google.com/issues/243267018
    - NonNull 無視して null 入れてる
- https://youtrack.jetbrains.com/issue/KT-53963
    - 強制的にNullableする機能についてKotlin側は拒否した模様（だってAndroidが100悪いもんね）

ちなみに私が引っかかった`onCellInfoChanged`に関しても`null`を返さないよう修正されたそうですが、古いバージョンには残り続けるでしょうね、、、  
https://issuetracker.google.com/issues/237308373