---
title: Hello Android11。Device Control編
created_at: 2020-09-10
tags:
- Android
- Android11
- Kotlin
---

Android 11の正式版が出ましたね。おめでとうございます  
自己PR と 長所短所 って違うのか

# Device Control #とは
家電操作用クイック設定パネル。電源長押しで開ける。  

![Imgur](https://imgur.com/w0IUBYW.png)

↑こんなやつ。

なお、**Reactive Stream**が何なのかわからんのでそこはコピペで頼む

# 環境
|なまえ|あたい|
|---|---|
|Android|11|
|言語|Kotlin|


# つくる
公式の解説です：https://developer.android.com/guide/topics/ui/device-control

## Android Manifest
サービスを宣言します。  
`android:label`がデバイスコントロールアプリ一覧に表示される名前だって~~（誰も教えてくれないAndroid）~~

```xml
<!-- Device Control のサービス -->
<service android:name="DeviceControlService" android:label="デバイスコントロールのサンプル"
    android:permission="android.permission.BIND_CONTROLS">
    <intent-filter>
        <action android:name="android.service.controls.ControlsProviderService" />
    </intent-filter>
</service>
```

## DeviceControlService.kt
を作成します。

できたら、以下のように`ControlsProviderService`を継承させます。

```kotlin
/** デバイスコントロールのサービス */
class DeviceControlService :ControlsProviderService(){

    /** 利用可能なデバイスコントロールはここで */
    override fun createPublisherForAllAvailable(): Flow.Publisher<Control> {

    }

    /** 実際にデバイスコントロールを有効にした場合はここ */
    override fun createPublisherFor(p0: MutableList<String>): Flow.Publisher<Control> {

    }

    /** デバイスコントロールを操作したときはここ */
    override fun performControlAction(p0: String, p1: ControlAction, p2: Consumer<Int>) {

    }

}
```

## デバイスコントロールを作成する関数を作る
今回は値の変更ができるコントロール（`RangeTemplate`）を作成します。  
なお今回は値をハードコートしますが本来は
- createPublisherForAllAvailable()
    - ここではユーザーに利用可能なコントロールを表示
    - ので値は適当でもいい
- createPublisherFor()
    - ここではユーザーが実際に操作するコントロールを表示
    - よって値はちゃんと入れておかないといけない

```kotlin
/**
 * コントロールを返す関数
 * @param floatValue シークを進める場合は入れてください
 * */
private fun createControl(floatValue: Float = 0f): Control {
    // コントロールを長押ししたときのインテント
    val intent = Intent(this, MainActivity::class.java)
    val pendingIntent =
        PendingIntent.getBroadcast(this, 4545, intent, PendingIntent.FLAG_UPDATE_CURRENT)
    return Control.StatefulBuilder("sample_control", pendingIntent).apply {
        setTitle("シーリングライト")
        setSubtitle("リビング")
        setDeviceType(DeviceTypes.TYPE_LIGHT)
        setStatus(Control.STATUS_OK)
        // 値を調整できるように
        setControlTemplate(RangeTemplate("sample_range", 0f, 10f, floatValue, 1f, "%.0f"))
    }.build()
}
```

## createPublisherForAllAvailable()
ここではユーザーに利用可能なコントロールを表示させるときに呼ばれる。  
詳しくないのでコピペ

```kotlin
/** 利用可能なデバイスコントロールはここで */
override fun createPublisherForAllAvailable(): Flow.Publisher<Control> {
    val control = createControl(0f)
    return Flow.Publisher { subscriber ->
        subscriber.onNext(control)
        subscriber.onComplete()
    }
}
```

## createPublisherFor()
ここではユーザーが選択したコントロールが表示される時に呼ばれます？  
電源ボタン長押しで表示させたときですね。

```kotlin
/** Controlの操作に使う */
private lateinit var subscriber: Flow.Subscriber<in Control>
/** 実際にデバイスコントロールを有効にした場合はここ */
override fun createPublisherFor(p0: MutableList<String>): Flow.Publisher<Control> {
    // ここで値を取得するなりする。今回はハードコート
    val control = createControl(0f)
    return Flow.Publisher<Control> {
        subscriber = it
        it.onSubscribe(object : Flow.Subscription {
            override fun request(p0: Long) {
            }
            override fun cancel() {
            }
        })
        it.onNext(control)
    }
}
```

## performControlAction()
ここではユーザーがコントロールを操作した時に呼ばれます。  
`RangeTemplate`の値は第二引数を`FloatAction`でキャストすれば取得できます。  

```kotlin
/** デバイスコントロールを操作したときはここ */
override fun performControlAction(p0: String, p1: ControlAction, p2: Consumer<Int>) {
    // システムに処理中とおしえる
    p2.accept(ControlAction.RESPONSE_OK)
    if (p1 is FloatAction) {
        val control = createControl(p1.newValue)
        subscriber.onNext(control)
    }
}
```

できたら実行して、電源ボタン長押し→︙→コントロールを追加へ進み、  
追加してみてください。

追加するとこのように表示されるはずです。  

![Imgur](https://imgur.com/1aE1SX4.png)

お疲れ様です。8888888888

# 全部くっつけたコード

```kotlin
/** デバイスコントロールのサービス */
class DeviceControlService : ControlsProviderService() {

    /** 利用可能なデバイスコントロールはここで */
    override fun createPublisherForAllAvailable(): Flow.Publisher<Control> {
        val control = createControl(0f)
        return Flow.Publisher { subscriber ->
            subscriber.onNext(control)
            subscriber.onComplete()
        }
    }

    /** Controlの操作に使う */
    private lateinit var subscriber: Flow.Subscriber<in Control>

    /** 実際にデバイスコントロールを有効にした場合はここ */
    override fun createPublisherFor(p0: MutableList<String>): Flow.Publisher<Control> {
        // ここで値を取得するなりする。今回はハードコート
        val control = createControl(0f)
        return Flow.Publisher<Control> {
            subscriber = it
            it.onSubscribe(object : Flow.Subscription {
                override fun request(p0: Long) {

                }

                override fun cancel() {

                }
            })
            it.onNext(control)
        }
    }

    /** デバイスコントロールを操作したときはここ */
    override fun performControlAction(p0: String, p1: ControlAction, p2: Consumer<Int>) {
        // システムに処理中とおしえる
        p2.accept(ControlAction.RESPONSE_OK)
        if (p1 is FloatAction) {
            val control = createControl(p1.newValue)
            subscriber.onNext(control)
        }
    }

    /**
     * コントロールを返す関数
     * @param floatValue シークを進める場合は入れてください
     * */
    private fun createControl(floatValue: Float = 0f): Control {
        // コントロールを長押ししたときのインテント
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent =
            PendingIntent.getBroadcast(this, 4545, intent, PendingIntent.FLAG_UPDATE_CURRENT)
        return Control.StatefulBuilder("sample_control", pendingIntent).apply {
            setTitle("シーリングライト")
            setSubtitle("リビング")
            setDeviceType(DeviceTypes.TYPE_LIGHT)
            setStatus(Control.STATUS_OK)
            // 値を調整できるように
            setControlTemplate(RangeTemplate("sample_range", 0f, 10f, floatValue, 1f, "%.0f"))
        }.build()
    }

}
```

GitHubです：https://github.com/takusan23/DeviceControlSample

# おわりに
今回のイースターエッグのソースはここ？：https://github.com/aosp-mirror/platform_frameworks_base/blob/android11-release/packages/EasterEgg/src/com/android/egg/neko/NekoControlsService.kt

背面タップ、結局実装されなかった  