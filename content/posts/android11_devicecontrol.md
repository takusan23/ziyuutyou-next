---
title: Android 11 のデバイスコントロールAPIを試す
created_at: 2020-06-11
tags:
- Android
- Android11
- Kotlin
- Android R
---

Android 11 Beta きたぞおおおおおおおおお   
🥳←これすき

# 追記：2020/06/13
Google Payが使えないと言いました。が、Suicaで電車に乗れたので多分**おｻｲﾌｹｰﾀｲ**アプリでは対応していない**NFC Pay**あたりが使えないんだと思います。  
Felica使う系は多分行けるんじゃないですかね？

あとスライダー(RangeTemplate)動いたのでそれも

# 本題
Android 11 Beta 1 来ました。  
わたし的に楽しみにしてる機能は
- Device Control API (正式名称しらん)
    - 証明のON/OFFとか明るさスライダーなど
    - Quick Settings のスマートホーム版
    - **スマートホームなんて金かかるからやらないと思う（よって使わない）**
- Dynamic Intent Filter
- Wi-Fi経由のADB
    - カスROMには前からあるって？
    - 公式で対応なんですよ！！！
- Bubble
    - **他のアプリに重ねて表示**が年々厳しくなってるので（最近、設定アプリの上に表示できなくなった）代替。
    - ポップアップ再生の代替にはならなそう。あくまでメッセージアプリ向けなのかな。

## Android 11 Beta入れようとしている各位
Google Pay 使えなくなるらしいよ。DP4の段階では使えたんだけどまた使えなくなった。  
![Imgur](https://i.imgur.com/r914HON.png)  
Suica使えるんかな？  

# Device Control API を試す
**スマートホームなんてする予定なけど**せっかくBeta版の登場と一緒にAPIが文書化されてるので試しに追加してみる。

[ドキュメント](https://developer.android.com/preview/features/device-control)

# 環境
| なまえ  | あたい     |
|---------|------------|
| 言語    | Kotlin     |
| Android | 11 Beta 1  |
| 端末    | Pixel 3 XL |

## Android R Betaの環境を揃えます。
SDK Manager開いて、SDK Platformsタブを押して、**Android 10.0+(R)**にチェックを入れて**Apply**押してダウンロードしましょう。

# build.gradle
## バージョン
```gradle
android {
    compileSdkVersion 30
    buildToolsVersion "29.0.3"

    defaultConfig {
        applicationId "io.github.takusan23.devicecontrolstest"
        minSdkVersion 30
        targetSdkVersion 30
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

`compileSdkVersion 30`と`targetSdkVersion 30`になってればいいと思います。多分

## ライブラリいれる
ドキュメントがRxJava入れてることを前提にしているので私も入れます。  
RxJavaなんて使ったことないんだけどね。
```gradle
dependencies {
    implementation 'org.reactivestreams:reactive-streams:1.0.3'
    implementation 'io.reactivex.rxjava2:rxjava:2.2.0'
}
```

# AndroidManifest書く
おまじないです。
```xml
<service
    android:name=".DeviceControlsService"
    android:label="@string/app_name"
    android:permission="android.permission.BIND_CONTROLS">
    <intent-filter>
        <action android:name="android.service.controls.ControlsProviderService" />
    </intent-filter>
</service>
```

# DeviceControlsService っていうサービス作成
`DeviceControlsService.kt`を作成します。  
作成したら、`ControlsProviderService()`を継承します。
```kotlin
class DeviceControlsService : ControlsProviderService() {
    override fun createPublisherForAllAvailable(): Flow.Publisher<Control> {

    }

    override fun performControlAction(p0: String, p1: ControlAction, p2: Consumer<Int>) {

    }

    override fun createPublisherFor(p0: MutableList<String>): Flow.Publisher<Control> {

    }
}
```

でもこのままだと返り値なにもないのでIDEが赤いなみなみ出すので今から書いていきましょう。

## 利用可能コントローラーの一覧を用意する
これから追加可能コントローラーを作っていきます。  
ここからユーザーが選ぶわけですね。  
`createPublisherForAllAvailable()`に書いていきます。
```kotlin
// 追加するデバイスのID
val TOGGLE_BUTTON_ID = "toggle_button_id"
/**
 * 追加可能コントローラーを用意する。
 * */
override fun createPublisherForAllAvailable(): Flow.Publisher<Control> {
    // コントローラーを長押しした時に表示するActivity
    val intent = Intent(baseContext, MainActivity::class.java)
    val pendingIntent =
        PendingIntent.getActivity(baseContext, 10, intent, PendingIntent.FLAG_UPDATE_CURRENT)
    // まとめてコントローラーを追加するので配列に
    val controlList = mutableListOf<Control>()
    // ON/OFFサンプル。
    val toggleControl = Control.StatelessBuilder(TOGGLE_BUTTON_ID, pendingIntent)
        .setTitle("ON/OFFサンプル") // たいとる
        .setSubtitle("おすとON/OFFが切り替わります。") // サブタイトル
        .setDeviceType(DeviceTypes.TYPE_LIGHT) // あいこんといろの設定。
        .build()
    // 配列に追加
    controlList.add(toggleControl)
    // Reactive Streamsの知識が必要な模様。私にはないのでサンプルコピペする。
    return FlowAdapters.toFlowPublisher(Flowable.fromIterable(controlList))
}
```

コメント文は各自消してね。  
### 注意
ここで使う`Control`は`Control.StatelessBuilder`の方です。  
これはまだ状態が（スイッチがONとかOFFとかって話）が分からない時に使うとか書いてあるけど多分この時に使います。

## ユーザーが選んだコントローラーを用意する
`利用可能コントローラーの一覧を用意する`で選んだコントローラーをユーザーが操作できるようにします。

```kotlin
lateinit var updatePublisher: ReplayProcessor<Control>
/**
 * ユーザーが選んだコントローラーを用意する
 * 電源ボタン長押しでよばれる
 * */
override fun createPublisherFor(p0: MutableList<String>): Flow.Publisher<Control> {
    // コントローラーを長押ししたときに表示するActivity
    val intent = Intent(baseContext, MainActivity::class.java)
    val pendingIntent =
        PendingIntent.getActivity(baseContext, 12, intent, PendingIntent.FLAG_UPDATE_CURRENT)
    // 知識不足でわからん
    updatePublisher = ReplayProcessor.create()
    // コントローラー
    if(p0.contains(TOGGLE_BUTTON_ID)) {
        // ON/OFF
        val toggle = ToggleTemplate("toggle_template", ControlButton(false, "OFFですねえ！"))
        // ここで作るControlは StatefulBuilder を使う。
        val control = Control.StatefulBuilder(TOGGLE_BUTTON_ID, pendingIntent)
            .setTitle("ON/OFFサンプル") // たいとる
            .setSubtitle("おすとON/OFFが切り替わります。") // サブタイトル
            .setDeviceType(DeviceTypes.TYPE_LIGHT) // 多分アイコンに使われてる？
            .setStatus(Control.STATUS_OK) // 現在の状態
            .setControlTemplate(toggle) // 今回はON/OFFボタン
            .build()
        updatePublisher.onNext(control)
    }
    return FlowAdapters.toFlowPublisher(updatePublisher)
}
```

これでエラーは一応消えるので、早速実行してみましょう。

# コントローラー追加
電源ボタン長押しすると、**デバイス コントロール**が追加されているので、押してみましょう。  
押すと、コントローラーが提供されているアプリ一覧画面が表示されるので、今作っているアプリを選びましょう。  
すると、さっき作ったコントローラーが現れるのでチェックを入れて、右下の保存ボタンを押しましょう。  

![Imgur](https://i.imgur.com/r2Wyog1.png)

するとコントローラーが追加されているはずです。  
ですがこの段階では押してもなにも変わらないのでこれから押した時に`ON/OFF`を切り替える処理を書いていきたいと思います。

ちなみにエミュレータでAndroid 11動かすのにダウンロードが長かった。

# コントローラーを押したときの処理
押した時にON/OFFを切り替えられるようにします。
```kotlin
/**
 * コントローラーを押したとき
 * */
override fun performControlAction(p0: String, p1: ControlAction, p2: Consumer<Int>) {
    // コントローラーを長押ししたときに表示するActivity
    val intent = Intent(baseContext, MainActivity::class.java)
    val pendingIntent =
        PendingIntent.getActivity(baseContext, 11, intent, PendingIntent.FLAG_UPDATE_CURRENT)
    // システムに処理中とおしえる
    p2.accept(ControlAction.RESPONSE_OK)
    // コントローラー分岐
    when (p0) {
        TOGGLE_BUTTON_ID -> {
            // ON/OFF切り替え
            // ToggleTemplate は BooleanAction
            if (p1 is BooleanAction) {
                // ONかどうか
                val isOn = p1.newState
                val message = if (isOn) "ONです" else "OFFです"
                val toggle = ToggleTemplate("toggle_template", ControlButton(isOn, message))
                // Control更新
                val control = Control.StatefulBuilder(TOGGLE_BUTTON_ID, pendingIntent)
                    .setTitle("ON/OFFサンプル") // たいとる
                    .setSubtitle("おすとON/OFFが切り替わります。") // サブタイトル
                    .setDeviceType(DeviceTypes.TYPE_LIGHT) // 多分アイコンに使われてる？
                    .setStatus(Control.STATUS_OK) // 現在の状態
                    .setControlTemplate(toggle) // 今回はON/OFFボタン
                    .setStatusText(message)
                    .build()
                updatePublisher.onNext(control)
            }
        }
    }
}
```

これで押した時にON/OFFが切り替わるようになりました。  
`DeviceType#TYPE_LIGHT`見た目いい感じ。  
スマートホームやってみたい（金ないけど）

![Imgur](https://i.imgur.com/2TNFYZz.png)

# おわりに
ソースコードです。https://github.com/takusan23/DeviceControlsTest

~~それと**本当**はスライダー（値を調整できる`RangeTemplate`てやつ）コントローラーがあったんですけど、私の環境ではうまく動きませんでした。Beta版だからなのかそもそも私が間違ってるのか？~~

**RangeTemplate**動きました。[参考にしました](https://gist.github.com/KieronQuinn/c9950f3ee09e11f305ce16e7f48f03b8)

```kotlin
val sliderControl = Control.StatefulBuilder(SLIDER_BUTTON_ID, pendingIntent)
    .setTitle("スライダーサンプル") // たいとる
    .setSubtitle("スライダーです。") // サブタイトル
    .setDeviceType(DeviceTypes.TYPE_LIGHT) // 多分アイコンに使われてる？
    .setControlId(SLIDER_BUTTON_ID)
    .setStatus(Control.STATUS_OK) // 現在の状態
sliderControl.setControlTemplate(
    ToggleRangeTemplate(
        "slider_template",
        ControlButton(true, "slider_button"),
        RangeTemplate("range", 0f, 10f, 1f, 1f, null)
    )
)
updatePublisher.onNext(sliderControl.build())
```

performControlAction()はこうです。

```kotlin
// スライダー
// RangeTemplate は FloatAction
if (p1 is FloatAction) {
    // 現在の値
    val currentValue = p1.newValue
    val sliderControl = Control.StatefulBuilder(SLIDER_BUTTON_ID, pendingIntent)
        .setTitle("スライダーサンプル") // たいとる
        .setSubtitle("スライダーです。") // サブタイトル
        .setDeviceType(DeviceTypes.TYPE_LIGHT) // 多分アイコンに使われてる？
        .setControlId(SLIDER_BUTTON_ID)
        .setStatus(Control.STATUS_OK) // 現在の状態
    val controlButton = ControlButton(true, "slider_button")
    sliderControl.setControlTemplate(
        ToggleRangeTemplate(
            "slider_template",
            controlButton,
            RangeTemplate("range", 0f, 10f, currentValue, 1f, null)
        )
    )
    updatePublisher.onNext(sliderControl.build())
}
```


あと`DeviceType`がいっぱいあるので全種類アイコンと色を見てみたい。やってみるか。

やりました→ https://github.com/takusan23/DeviceControlAllDeviceTypeSample


Dynamic Intent Filterもやりたい