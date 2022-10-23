---
title: Wear OS のコンプリケーションを作りたい
created_at: 2022-10-17
tags:
- Android
- WearOS
- Kotlin
---

どうもこんばんわ。まだゲームが終わってないので今回は感想無しです。  
Pixel Watch、予想より**かなり、めっちゃいいですね**。USB Type-C の充電器持って無いのでPCのType-Cに挿してます。  

意外に小さめ。他のWearOSなデバイスは着けられてる感がすごかったので...  
セルラー通信、試してみたかったな；；（docomoなので

30億のデバイスで動くJavaすごい  

# 本題
コンプリケーションを作りたい！！！  
というか デジタルクラウン？りゅうず？ あの横の回せるやつを押さずに、タッチだけでアプリ一覧画面を開きたい！！！  
（物理ボタンあんまり押したくない...押したくない？）

![Imgur](https://imgur.com/tk1nwae.png)

押したらアプリ一覧画面に行くようなアプリを作りたい

## コンプリケーションってなに

天気とか、曜日とか電池マークが書いてある部分。  

![Imgur](https://imgur.com/4MemA9U.png)


公式でも作り方書いてあるけど、なんか非推奨になってた...  
ここが参考になる→ https://github.com/android/wear-os-samples

# 環境

| なまえ         | あたい                        |
|----------------|-------------------------------|
| Android Studio | Android Studio Dolphin        |
| 実機           | Pixel Watch ( Wear OS 3.5 )   |
| 言語           | Kotlin ( やっぱコルーチンよ ) |

## 公式の例を出せ
公式のはなんか非推奨なので、コードとにらめっこしたほうがいいのかな

https://github.com/android/wear-os-samples/blob/main/WearComplicationDataSourcesTestSuite

# その前に Wear OS とどうやって ADB 接続するん？
Android 11 から追加された、`ワイヤレス デバッグ`が使えます。  
Pixel WatchをWi-Fiに接続して、開発者向けオプション（有効化方法はAndroidスマホと同じ）内の`ワイヤレス デバッグ`を押します。  
有効にして、ペア設定を押します。なんかコードとIPアドレスが表示されると思うので、ターミナル（コマンドプロンプト など）を開いて、

```
adb pair {表示されているIPアドレスとポート}
```

```
# 例
# adb pair 192.168.0.0:00000
```

を叩きます。なんか入力しろと言われるので、

```
{Wi-Fi ペア設定コード}
```

を入れます。完了したら、画面が戻る？ので`IP アドレスとポート`のところに書いてあるIPアドレスとポート番号を、ターミナルに入れます

```
adb connect IPアドレスとポート番号
```

```
# 例
# adb connect 192.168.0.0:00000
```

`connected to 192.168.0.0:0000`がターミナルに表示されれば完了です！

![Imgur](https://imgur.com/87nqO8x.png)

# 適当にプロジェクトを作って下さい
`Wear OS`の`No Activity`で良いんじゃない。アプリの画面いらないし。

![Imgur](https://imgur.com/rL3xV01.png)

名前は適当に、SDKバージョンは後で`build.gradle`書き換えるのでなんでもいいです

![Imgur](https://imgur.com/Qwg7oXC.png)

## app/build.gradle
`app`フォルダに有る`build.gradle`を開いて、直します  
`compileSdk`、`minSdk`、`targetSdk`を直します。  
あとは`dependencies`にコンプリケーションを作るライブラリを追加します。

```gradle
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'io.github.takusan23.batteryapplaunchercomplication'
    compileSdk 33

    defaultConfig {
        applicationId "io.github.takusan23.batteryapplaunchercomplication"
        // Wear OS 3.x が SDK 30 みたい
        // Wear OS 2.x をサポートしたい場合は SDK 26 にする？
        minSdk 30
        targetSdk 33
        versionCode 1
        versionName "1.0"

    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {

    // コンプリケーションを作るライブラリ
    implementation "androidx.wear.watchface:watchface-complications-data-source:1.2.0-alpha03"
    implementation "androidx.wear.watchface:watchface-complications-data-source-ktx:1.2.0-alpha03"

    implementation 'androidx.core:core-ktx:1.7.0'
    implementation 'com.google.android.gms:play-services-wearable:18.0.0'
    implementation 'androidx.percentlayout:percentlayout:1.0.0'
    implementation 'androidx.legacy:legacy-support-v4:1.0.0'
    implementation 'androidx.recyclerview:recyclerview:1.2.1'
}
```

## SuspendingComplicationDataSourceService を継承したクラスを作る
適当にクラスを作り、`SuspendingComplicationDataSourceService`を継承します。  
`ComplicationDataSourceService`の`kotlinx.coroutines`対応版です！！！便利！！！

```kotlin
/** 電池残量を表示して、押したらアプリ一覧を開く コンプリケーション */
class BatteryAppLauncherComplication : SuspendingComplicationDataSourceService() {
    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        
    }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData? {

    }
}
```

### getPreviewData
これはプレビュー表示の際に呼び出されます。  
今回は電池残量を表示するコンプリケーションと同じ`RangedValueComplicationData`にしました。他にも`ShortTextComplicationData`とかあります。  
プレビューなので値は決め打ちでいいでしょう。

```
class BatteryAppLauncherComplication : SuspendingComplicationDataSourceService() {

    /** プレビューの際に呼び出される */
    override fun getPreviewData(type: ComplicationType): ComplicationData {
        // RangedValueComplicationData は 丸いプログレスバーみたいなやつ
        return RangedValueComplicationData.Builder(
            value = 75f,
            min = 0f,
            max = 100f,
            contentDescription = createPlainTextComplication("電池残量とアプリランチャー")
        ).also { build ->
            build.setText(createPlainTextComplication("75%"))
            build.setMonochromaticImage(createMonochromeIcon(R.drawable.icon_battery_4_bar))
        }.build()
    }

    /** 実際のウォッチフェイスから呼び出される */
    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData {
        // TODO この後すぐ！
    }

    /** [String]から[PlainComplicationText]を作る */
    private fun createPlainTextComplication(string: String) = PlainComplicationText.Builder(string).build()

    /** アイコンのリソースIDから[MonochromaticImage]を作る */
    private fun createMonochromeIcon(iconRes: Int) = MonochromaticImage.Builder(
        image = Icon.createWithResource(this, iconRes)
    ).build()

}
```

アイコンはこの辺から拝借しました。アウトラインのアイコンすき

![Imgur](https://imgur.com/zesuYSM.png)

## onComplicationRequest
これは実際の値を返す必要があります。

```kotlin
/** 電池残量を表示して、押したらアプリ一覧を開く コンプリケーション */
class BatteryAppLauncherComplication : SuspendingComplicationDataSourceService() {

    /** プレビューの際に呼び出される */
    override fun getPreviewData(type: ComplicationType): ComplicationData {
        // RangedValueComplicationData は 丸いプログレスバーみたいなやつ
        return RangedValueComplicationData.Builder(
            value = 75f,
            min = 0f,
            max = 100f,
            contentDescription = createPlainTextComplication("電池残量とアプリランチャー")
        ).also { build ->
            build.setText(createPlainTextComplication("75%"))
            build.setMonochromaticImage(createMonochromeIcon(R.drawable.icon_battery_4_bar))
        }.build()
    }

    /** 実際のウォッチフェイスから呼び出される */
    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData {
        request.complicationType
        // 実際の電池残量を取得する
        val batteryLevel = getBatteryLevel().toFloat()
        return RangedValueComplicationData.Builder(
            value = batteryLevel, // 現在の値
            min = 0f, // 最低値
            max = 100f, // 最大値
            contentDescription = createPlainTextComplication("電池残量とアプリランチャー")
        ).also { build ->
            build.setText(createPlainTextComplication("${batteryLevel.toInt()}%"))
            build.setMonochromaticImage(createMonochromeIcon(R.drawable.icon_battery_4_bar))
        }.build()
    }

    /** [String]から[PlainComplicationText]を作る */
    private fun createPlainTextComplication(string: String) = PlainComplicationText.Builder(string).build()

    /** アイコンのリソースIDから[MonochromaticImage]を作る */
    private fun createMonochromeIcon(iconRes: Int) = MonochromaticImage.Builder(
        image = Icon.createWithResource(this, iconRes)
    ).build()

    /** 電池残量を取得 */
    private fun getBatteryLevel(): Int {
        val powerManager = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        return powerManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
    }

}
```

## AndroidManifest.xml
最後にサービスを`Manifest`に追加します。  
`intent-filter`は絶対必要です。  

```xml
<service
    android:name=".BatteryAppLauncherComplication"
    android:exported="true"
    android:icon="@drawable/icon_battery_4_bar"
    android:label="電池残量とアプリランチャー"
    android:permission="com.google.android.wearable.permission.BIND_COMPLICATION_PROVIDER">
    <intent-filter>
        <action android:name="android.support.wearable.complications.ACTION_COMPLICATION_UPDATE_REQUEST" />
    </intent-filter>

    <meta-data
        android:name="android.support.wearable.complications.SUPPORTED_TYPES"
        android:value="RANGED_VALUE" />
    <meta-data
        android:name="android.support.wearable.complications.UPDATE_PERIOD_SECONDS"
        android:value="300" />
</service>
```

`android.support.wearable.complications.SUPPORTED_TYPES`は、今回は`RangedValueComplicationData`を返すので`RANGED_VALUE`です。  
クラスと値の対応表などはちょっと見つけられなかったのですが、  
以下の列挙型から名前が同じ(`RangedValueComplicationData`だから`TYPE_RANGED_VALUE`？)、`TYPE_`を除いたのを設定すればいいそうです。  

```kotlin
    NO_DATA(WireComplicationData.TYPE_NO_DATA),
    EMPTY(WireComplicationData.TYPE_EMPTY),
    NOT_CONFIGURED(WireComplicationData.TYPE_NOT_CONFIGURED),
    SHORT_TEXT(WireComplicationData.TYPE_SHORT_TEXT),
    LONG_TEXT(WireComplicationData.TYPE_LONG_TEXT),
    RANGED_VALUE(WireComplicationData.TYPE_RANGED_VALUE),
    MONOCHROMATIC_IMAGE(WireComplicationData.TYPE_ICON),
    SMALL_IMAGE(WireComplicationData.TYPE_SMALL_IMAGE),
    PHOTO_IMAGE(WireComplicationData.TYPE_LARGE_IMAGE),
    NO_PERMISSION(WireComplicationData.TYPE_NO_PERMISSION),
```

`ShortTextComplicationData`なら`SHORT_TEXT`になると思います。  
ちなみに、コンマ区切りで複数指定できます。複数指定した場合は`onComplicationRequest`の第一引数の`ComplicationRequest#complicationType`で判断できると思います。

```xml
<meta-data android:name="android.support.wearable.complications.SUPPORTED_TYPES"
android:value="RANGED_VALUE,SHORT_TEXT,ICON"/>
```


複数選択時はこんな感じで分岐できるはず？

```kotlin
when(request.complicationType){
    ComplicationType.SHORT_TEXT -> TODO()
    ComplicationType.LONG_TEXT -> TODO()
    ComplicationType.RANGED_VALUE -> TODO()
    ComplicationType.MONOCHROMATIC_IMAGE -> TODO()
    ComplicationType.SMALL_IMAGE -> TODO()
    ComplicationType.PHOTO_IMAGE -> TODO()
}
```

`android.support.wearable.complications.UPDATE_PERIOD_SECONDS`は最低更新間隔です。多分書いたどおりに実行されないと思いますが。  
最低間隔は300秒らしいです：https://developer.android.com/training/wearables/watch-faces/exposing-data-complications?hl=ja#meta-data

```xml
<meta-data
    android:name="android.support.wearable.complications.UPDATE_PERIOD_SECONDS"
    android:value="300" />
```

# 動かす

`Activity`が無いと実行ボタンすら表示されないのね、  
`Add Configuration...`を押して、`+`をおして`Android App`を選びます。

![Imgur](https://imgur.com/vajZiez.png)

`Activity`ないので、`Launch`は`Nothing`になると思います。  
`Module`は多分一個しか表示されないと思うのでそれを選べばおｋです。

![Imgur](https://imgur.com/2oq3Vkw.png)

実行すると、なんか赤い文字で怖いメッセージが出ますが、アプリがインストールできてるのでOKです。  

```
10/17 02:22:22: Launching 'Unnamed' on Google Google Pixel Watch.
Install successfully finished in 2 s 700 ms.
Could not identify launch activity: Default Activity not found
Error while Launching activity
Failed to launch an application on all devices
```

# コンプリケーションを追加する
文字盤の変更とかはこの辺見て下さい。  
https://support.google.com/wearos/answer/6140435?hl=ja

おお？

![Imgur](https://imgur.com/0iH51lM.png)


動いてま！す！（最初から入ってるやつとほぼ一緒だから出来てるのか分からんね）

![Imgur](https://imgur.com/RbXEIkI.png)

# 押したときにアプリランチャーを開いてほしい！！
多分ランチャーの`Activity`を直接`Intent`で指定して`startActivity`しても無理だと思うので、別の方法を取る必要があります。  
で、色々やってたら**文字盤を表示しているときにホームボタンを押すとアプリランチャーが開く**ことがわかりました。  
(ごめん Pixel Watch だけかもしれない)

```
C:\Users\takusan23>adb shell input keyevent KEYCODE_HOME
```

というわけで、アプリ側からホームボタンを押せば、アプリランチャーを開くことができそうです！

## ホームボタンを押すには？

上記の`adb shell input`が使えればいいのですが、アプリでこれを実行しても動かないと思います。  

```
Runtime.getRuntime().exec("adb shell input keyevent KEYCODE_HOME")
```

詰んだか...と思いきや、ユーザー補助サービスを作ることで、ユーザーに代わってホームボタンを押すことが出来ます。ｋｔｋｒ

## ユーザー補助サービスをサクサクっと作る

`performGlobalAction`を使いたいだけなので、それ以外は作りません。  
ブロードキャストをセットして、コンプリケーションを押した際にここのブロードキャストに飛ばすようにします。

```kotlin
/** ホームボタンを押すだけのユーザー補助サービス */
class HomeButtonAccessibilityService : AccessibilityService() {

    /** ホームボタンを押してほしいことを受け取るブロードキャスト */
    private val broadcastReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                // ホームボタンを押す
                DOWN_HOME_BUTTON -> performGlobalAction(GLOBAL_ACTION_HOME)
            }
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        registerReceiver(broadcastReceiver, IntentFilter().apply {
            addAction(DOWN_HOME_BUTTON)
        })
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // do nothing
    }

    override fun onInterrupt() {
        // do nothing
    }

    override fun onUnbind(intent: Intent?): Boolean {
        unregisterReceiver(broadcastReceiver)
        return super.onUnbind(intent)
    }

    companion object {
        /** ブロードキャストのIntentのAction */
        const val DOWN_HOME_BUTTON = "io.github.takusan23.batteryapplaunchercomplication.DOWN_HOME_BUTTON"
    }
}
```

### accessibility_service_config.xml を書く
`res/xml`内に`accessibility_service_config.xml`を追加して以下コピペ  
ちなみに Codelab そのままです：https://codelabs.developers.google.com/codelabs/developing-android-a11y-service/?hl=ja#2

```xml
<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityFeedbackType="feedbackGeneric" android:accessibilityFlags="flagDefault"
    android:canPerformGestures="true" android:canRetrieveWindowContent="true" />
```

### AndroidManifest.xml を書く
はい。

```xml
<service
    android:name=".HomeButtonAccessibilityService"
    android:exported="true"
    android:label="ホームボタンを押すユーザー補助サービス"
    android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE">

    <intent-filter>
        <action android:name="android.accessibilityservice.AccessibilityService" />
    </intent-filter>

    <meta-data
        android:name="android.accessibilityservice"
        android:resource="@xml/accessibility_service_config" />
</service>
```

### コンプリケーションを押したときに、ホームボタンを押すだけのユーザー補助サービスへブロードキャストを送る
`setTapAction`へ`PendingIntent`をセットすると押したときに`Intent`が発行されるようになります。

```kotlin
/** 実際のウォッチフェイスから呼び出される */
override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData {
    request.complicationType
    // 実際の電池残量を取得する
    val batteryLevel = getBatteryLevel().toFloat()
    return RangedValueComplicationData.Builder(
        value = batteryLevel,
        min = 0f,
        max = 100f,
        contentDescription = createPlainTextComplication("電池残量とアプリランチャー")
    ).also { build ->
        build.setText(createPlainTextComplication("${batteryLevel.toInt()}%"))
        build.setMonochromaticImage(createMonochromeIcon(R.drawable.icon_battery_4_bar))
        // コンプリケーションを押したときの PendingIntent 。ホームボタンを押すだけのユーザー補助サービスへブロードキャストを送信している
        build.setTapAction(PendingIntent.getBroadcast(this, 4545, Intent(HomeButtonAccessibilityService.DOWN_HOME_BUTTON), PendingIntent.FLAG_IMMUTABLE))
    }.build()
}
```

# 実行して、ユーザー補助を有効にする

設定を開いて、ユーザー補助の項目へ行き、さっき作ったやつを有効にします。

![Imgur](https://imgur.com/K8fEKlQ.png)

![Imgur](https://imgur.com/DegI7dB.png)

あと最後に、コンプリケーションを再度置き直す必要があるかもしれないです。  
これで、コンプリケーションを押したらアプリランチャーが開くようになりました。やったぜ！！！

なんか`Android Studio`で録画したせいか重い...

![Imgur](https://imgur.com/16BAh1s.gif)

# ソースコード
https://github.com/takusan23/BatteryAppLauncherComplication

# おわりに
ガジェット買うよりよりメイン機のSSD増設するのが先かもしれない...  
いやでもガチのまじで円安で時期が悪いやろ...  

![Imgur](https://imgur.com/KgFDjOf.png)

![Imgur](https://imgur.com/fD3nP9Z.png)

そんな円安の中お財布に優しいレートで売ってくれるあたりGoogleガチなのかもしれない。  
349ドルを39,800円で販売したら大赤字なのでは

![Imgur](https://imgur.com/47Ydxq6.png)

# おまけ Wear OS でスクリーンショットの取り方
`Android Studio`が起動中の場合は、`Wear OS デバイス`とADBで接続した後、`Logcat`を開いて、カメラマークを押すことで撮ることが出来ます。

![Imgur](https://imgur.com/9QCpkia.png)

もし手元にPCがなければ、`Pixel Watch`アプリから撮ることができます。  
（もしかしたら WearOS で開発者向けオプションを有効にしないと出来ないかも）

![Imgur](https://imgur.com/cr6Ddg7.png)

# 追記 2022/10/23
もしかしたら、これ有効にすると `りゅうず` 回したときの感触フィードバックが無効になるかもしれないです。  
原因は`accessibility_service_config.xml`で`canPerformGestures`を`true`にしたせいだと思います。  

対策としては、`canPerformGestures`をブロードキャストを受信した際に動的に有効にすることで利用できると思います。

`accessibility_service_config.xml`の`canPerformGestures`を`false`にして

```xml
<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityFeedbackType="feedbackGeneric" android:accessibilityFlags="flagDefault"
    android:canPerformGestures="false" />
```

ブロードキャストを受信した際に`canPerformGestures`を有効にします。ホームボタンを押したら再度`canPerformGestures`を向こうにします。  
で、動的に有効にするための関数が`@UnsupportedAppUsage`アノテーションで隠されているため、普通には呼び出せません。  
リフレクションで呼び出すしか無いと思います。(ほんとか？)

(AccessibilityService_canRetrieveWindowContent が 動的に変更はできない(xmlで指定しろ)って書いてあるので、逆に動的に変更するメソッドがあるのかと期待してたのですがアノテーションで隠されてました。)

```kotlin
/** ホームボタンを押してほしいことを受け取るブロードキャスト */
private val broadcastReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        when (intent?.action) {
            // ホームボタンを押す
            DOWN_HOME_BUTTON -> {
                // xml で android:canPerformGestures を指定すると、
                // りゅうず を回したときの感触フィードバック が貰えなくなるため、
                // 実行時に canPerformGestures を指定する
                // ただ、↑のメソッドが隠されているためリフレクションで呼び出す
                val setCapabilities = AccessibilityServiceInfo::class.java
                    .methods
                    .first { it.name == "setCapabilities" }
                setCapabilities.invoke(serviceInfo, AccessibilityServiceInfo.CAPABILITY_CAN_PERFORM_GESTURES)
                // 再セットする
                serviceInfo = serviceInfo
                // ホームボタンを押す
                performGlobalAction(GLOBAL_ACTION_HOME)
                // そして最後に戻す
                setCapabilities.invoke(serviceInfo, 0)
                serviceInfo = serviceInfo
            }
        }
    }
}
```

対応コミットです  

https://github.com/takusan23/BatteryAppLauncherComplication/commit/75d83f584322d268bbcbae2d14aa0fcdbc61b5e1