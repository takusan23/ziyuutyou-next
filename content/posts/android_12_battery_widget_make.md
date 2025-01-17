---
title: Android 12 の電池ウイジェット作った
created_at: 2021-12-03
tags:
- Android
- Kotlin
---
どうもこんばんわ。  
**（ちょっと前だけど）ついにfengのアルバムを手に入れました。**  
神。  
冬華さま～

![Imgur](https://i.imgur.com/fiuZ0TW.png)

# 本題

Android 12 のコンセプト画像？にあるこの電池残量ウイジェットってどこにあるの？  
これほしいんだが

![Imgur](https://i.imgur.com/BiVH4Zz.png)

# 作った
スマホの電池残量とBluetoothデバイス（一台だけ）の電池残量が見れます。  
Bluetoothデバイスの方は10%刻みですが仕様です（後述）

![Imgur](https://i.imgur.com/SAtNPAa.png)

![Imgur](https://i.imgur.com/rlr7nd6.png)

↑ 友愛進化論のフルありがとうfeng

# ダウンロードとソースコード
- PlayStore
    - https://play.google.com/store/apps/details?id=io.github.takusan23.materialbatterywidget
- GitHub
    - https://github.com/takusan23/MaterialBatteryWidget

## AndroidでBluetoothデバイスの電池残量取得
(全部のデバイスで使えるわけじゃないと思う)

`BluetoothDevice#getBatteryLevel()`っていうメソッドがあります。  
が、`@hide`と`@UnsupportedAppUsage`が付いているため普通には見れません。が、逆に言えば成約はこれだけなのでリフレクションで呼び出せます。  
変にシステムアプリ限定権限とかなくてよかった。

```kotlin
val getBatteryLevelMethod = BluetoothDevice::class.java
            .methods
            .find { it.name == "getBatteryLevel" }!!
getBatteryLevelMethod.invoke(/* BluetoothDevice */)
```

実際にペアリングデバイスを取得して電池残量を取得するコードです

```kotlin
val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
if (!bluetoothManager.adapter.isEnabled) return null

// 電池残量を取得するメソッドが @hide で隠されているので、リフレクションで呼び出す
val getBatteryLevelMethod = BluetoothDevice::class.java
    .methods
    .find { it.name == "getBatteryLevel" }!!
val deviceList = bluetoothManager.adapter.bondedDevices
    .map { Pair(it.name, getBatteryLevelMethod.invoke(it) as Int) }
    .filter { it.second != -1 }

return deviceList.firstOrNull()
```

ちなみにAndroid 11以前はBluetooth権限、Android 12以降は`BLUETOOTH_CONNECT`とかいうダイアログで権限求める系の権限が必要です。

## 10%刻みで返ってくる
多分どうしようもない。サードパーティアプリの限界？  
イヤホンによっては端末のBluetooth設定画面からは1%刻みの残量とか充電ケースの残量も取得できますが、これはシステムアプリ限定権限を使っている上に  
そもそも権限がなくてもシステムアプリ以外メソッドが呼び出せないという二段構えで詰んでます。~~つまんね～~~

https://cs.android.com/android/platform/superproject/+/master:frameworks/base/core/java/android/bluetooth/BluetoothDevice.java;drc=master;l=2808

```java
@SystemApi
@Nullable
@RequiresPermission(allOf = {
        android.Manifest.permission.BLUETOOTH_CONNECT,
        android.Manifest.permission.BLUETOOTH_PRIVILEGED,
})
public byte[] getMetadata(@MetadataKey int key) {
```

## Android 12 以降はダイナミックカラーに対応しています
ダイナミックカラーの値を取得する場合は`@android:color/system_accent*`系を使うと取得できます。  
詳しくはAndroid 12のイースターエッグ見て下さい。  

あとはウイジェット内で使う色を`color.xml`で切り出して使えばいいと思います

```xml
<!-- values-v31/colors.xml -->
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- バッテリーのプログレスバーの表面の色 -->
    <color name="battery_color">@android:color/system_accent1_300</color>
    <!-- バッテリーのプログレスバーの背面の色 -->
    <color name="battery_background_color">@android:color/system_accent1_200</color>
    <!-- テキストの色 -->
    <color name="battery_text_color">@android:color/system_accent1_900</color>
    <!-- ウイジェットの背景色 -->
    <color name="widget_background_color">@android:color/system_accent2_100</color>
</resources>
```

```xml
<!-- values/colors.xml -->
<?xml version="1.0" encoding="utf-8"?>
<resources>

    <!-- Android 12 用の色リソースはv31の方参照 -->

    <!-- バッテリーのプログレスバーの表面の色 -->
    <color name="battery_color">#FFAFCBFB</color>
    <!-- バッテリーのプログレスバーの背面の色 -->
    <color name="battery_background_color">#FFE8F0FE</color>
    <!-- テキストの色 -->
    <color name="battery_text_color">#FF1B72E8</color>
    <!-- ウイジェットの背景色 -->
    <color name="widget_background_color">@color/white</color>

    <!-- 省略 -->
```

# 終わりに
このアルバムが本当にfengの最後だと思うととても悲しい。  
そしてエロゲ板のfengスレも解散スレに...