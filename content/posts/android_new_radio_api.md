---
title: 5Gなのに通信始めると4Gになるやつ
created_at: 2021-12-30
tags:
- Android
- Kotlin
- 5G
---
どうもこんばんわ。  
ウチはもう、延期できない。 攻略しました。  

http://www.cuffs.co.jp/products/enking/

みんな可愛かったです。  
シナリオなら未来ちゃんかなー

![Imgur](https://i.imgur.com/gn5s67t.png)
![Imgur](https://i.imgur.com/ofeHzOf.png)

でもやっぱ千紗さんが可愛かったです。

![Imgur](https://i.imgur.com/QfWM9eI.png)
![Imgur](https://i.imgur.com/fmBl3jo.png)

とりあえずオープニング見てほしい、テンポ良くて良き

## 本題
Pixel 6 Pro を更新したらついにdocomoの5Gを掴むようになった。いえーい  
(ちなみに12月のパッチ、モバイルデータ通信に問題があるみたいで配信止まってるみたいですね。いまから適用するのは辞めて1月のパッチまで待ったほうがいいと思います。)

そーす：https://9to5google.com/2021/12/30/pixel-6-december-update-delay/

<img width="200" src="https://i.imgur.com/Mg1qpT3.png">

というわけで、Android 11から追加された 5G（NR / New Radio）向けのAPIを試してみる

https://developer.android.com/about/versions/11/features/5g

(正直私もよくわかってない)

## 環境

| なまえ   | あたい                              |
|----------|-------------------------------------|
| 端末     | Google Pixel 6 Pro                  |
| Android  | 12                                  |
| キャリア | docomo (ギガホプレミア契約してきた) |

## その前に：5G来た！通信始めたろｗ→4Gに切り替わる
仕様です。

https://www.nttdocomo.co.jp/area/5g/notice.html

### 5Gなのに4Gに切り替わるのはなぜ？
5Gの展開では、`スタンドアローン (SA)`方式と、`ノンスタンドアローン (NSA)`方式があって、現状普及してる5Gは`NSA方式`です。   
前者の`SA方式`では、**5G基地局単体**で動くことができますが、  
後者の`NSA方式`では**従来の4G基地局設備(eNB)に5G基地局(gNB)を導入した物で**、制御信号(C-Plane)に4Gの電波を利用し実際のデータ転送(U-Plane)では5Gの電波を利用します。   
4Gと5Gを同時に利用する`EN-DC`って言う技術を採用しているそうです。この場合では4Gを`マスターノード`、5Gを`セカンダリノード`と呼んでいるようです。

流れとしては、
- 4G基地局へ導入した5G基地局(NSA方式)があって、  
- その4G基地局の圏内に入った場合に、5G基地局の存在が4Gの制御信号で送られて来る。
    - セカンダリノードの5G基地局は自分の存在を送出しないらしい？(3GPP TS 37.340 7.1	System information handling)
- でも実際は5G基地局の圏内には入っていない。しかし4G（と5Gの制御信号）は届くのでアンテナピクトの隣のアイコン(RAT表示)が5Gになる。
    - 5G圏内にいれば4Gの制御信号をもとに接続してくれる模様（要調査）

詳しく知りたい場合は`EN-DC (E-UTRA-NR Dual Connectivity)`とか`アンカーバンド`とか`5G NR NSA Call Flow`で検索して下さい。

3GPPの資料が見たい場合はこちらです  
TS 37.340

https://portal.3gpp.org/desktopmodules/Specifications/SpecificationDetails.aspx?specificationId=3198

`Versions`タブへ移動して`Version`のところのリンクを押すとDLできます。  
Google翻訳にドキュメントファイルを投げれば翻訳してくれます。（なお理解できるとは言っていない）

### そういうことなので
5G対応端末をSIMロックフリーで買う際は、5Gの対応バンド以外にも4Gのバンドを確認しないといけません。  
`EN-DC組み合わせ`とかで検索すれば4Gのバンドと5Gのバンドの組み合わせが出てくるのでいいと思います。  
(どうでもいいんだけどdocomoの5G Sub-6で使ってる`n79`ってSIMフリー端末だと全然対応してなくない？)

## 適当にアプリを作る

### 使うメソッド

- `ConnectivityManager#registerDefaultNetworkCallback()`
    - どうやらこれで`従量制 or 定額制`ネットワークの検出ができるらしい（無理じゃね？）
        - 使い放題か上限付きのプランかみたいな？
- `TelephonyManager#listen()`と`onDisplayInfoChanged()`
    - これで5Gが`Sub-6 or ミリ波`のどっちなのかが検出できるみたい。
    - アンテナピクト📶の隣の`5G`、`4G+`と同じのが取れるっぽい
- `TelephonyManager#listen()`と`onDisplayInfoChanged()`
    - 接続中バンドが知りたい

### app/build.gradle

`Activity Result API`を使いたいのでActivityとFragmentのバージョンをあげます。  
あと`ViewBinding`も使いたいので有効にします。

```java
plugins {
    id 'com.android.application'
    id 'kotlin-android'
}

android {
    compileSdk 31

    defaultConfig {
        applicationId "io.github.takusan23.newradioapichecker"
        minSdk 30
        targetSdk 31
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
    buildFeatures {
        viewBinding true
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = '1.8'
    }
}

dependencies {

    implementation "androidx.activity:activity:1.4.0"
    implementation "androidx.fragment:fragment-ktx:1.4.0"

    implementation 'androidx.core:core-ktx:1.7.0'
    implementation 'androidx.appcompat:appcompat:1.4.0'
    implementation 'com.google.android.material:material:1.4.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.2'
    testImplementation 'junit:junit:4.+'
    androidTestImplementation 'androidx.test.ext:junit:1.1.3'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.4.0'
}
```

### AndroidManifest.xml
電波状態にアクセスするために位置情報とか発信権限とか余計なもん付いてきますが仕方ない。

```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
```

### activity_main.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    tools:context=".MainActivity">

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:padding="10dp"
        android:text="従量制チェック"
        android:textSize="20sp" />

    <TextView
        android:id="@+id/activity_main_metered_textview"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:gravity="end"
        android:padding="10dp"
        android:text="---"
        android:textSize="20sp" />

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:padding="10dp"
        android:text="5Gコールバック"
        android:textSize="20sp" />

    <TextView
        android:id="@+id/activity_main_new_radio_textview"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:gravity="end"
        android:padding="10dp"
        android:text="---"
        android:textSize="20sp" />

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:padding="10dp"
        android:text="接続中バンド"
        android:textSize="20sp" />

    <TextView
        android:id="@+id/activity_main_band_textview"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:gravity="end"
        android:padding="10dp"
        android:text="---"
        android:textSize="20sp" />

</LinearLayout>
```

### MainActivity.kt

```kotlin
class MainActivity : AppCompatActivity() {

    private val connectivityManager by lazy { getSystemService(CONNECTIVITY_SERVICE) as ConnectivityManager }
    private val telephonyManager by lazy { getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager }
    private val viewBinding by lazy { ActivityMainBinding.inflate(layoutInflater) }

    // コールバック解除用
    private var connectivityManagerCallback: ConnectivityManager.NetworkCallback? = null
    private var phoneStateListener: PhoneStateListener? = null
    private var telephonyCallback: TelephonyCallback? = null

    private val permissionRequest = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { result ->
        if (result.all { it.value }) {
            startListen()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(viewBinding.root)

        // 権限確認
        if (isGranted()) {
            // あるので監視開始
            startListen()
        } else {
            // ない
            permissionRequest.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.READ_PHONE_STATE))
        }
    }

    private fun startListen() {
        listenUnlimitedNetwork {
            viewBinding.activityMainMeteredTextview.text = if (it) "無制限のネットワーク接続" else "上限ありのネットワーク接続"
        }
        listenNewRadio(
            onCellInfoCallback = {
                viewBinding.activityMainBandTextview.text = when (it) {
                    is CellInfoLte -> """LTE
接続中バンド：${it.cellIdentity.bands.map { it.toString() }} (${it.cellIdentity.earfcn})"""
                    is CellInfoNr -> """5G
接続中バンド：${(it.cellIdentity as CellIdentityNr).bands.map { it.toString() }} (${(it.cellIdentity as CellIdentityNr).nrarfcn})"""
                    else -> "それ以外"
                }
            },
            onDisplayInfoCallback = {
                viewBinding.activityMainNewRadioTextview.text = when (it.overrideNetworkType) {
                    TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_LTE_ADVANCED_PRO -> "LTE Advanced Pro（5Ge）"
                    TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_LTE_CA -> "LTE キャリアアグリゲーション"
                    TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_NR_NSA -> "5G Sub-6 ネットワーク"
                    TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_NR_NSA_MMWAVE -> "5G ミリ波 ネットワーク (非推奨)"
                    TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_NR_ADVANCED -> "5G ミリ波 (もしくはそれ同等の) ネットワーク"
                    else -> "それ以外"
                }
            }
        )
    }

    private fun isGranted(): Boolean {
        val fineLocation = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
        val readPhoneState = ContextCompat.checkSelfPermission(this, Manifest.permission.READ_PHONE_STATE)
        return (fineLocation == PackageManager.PERMISSION_GRANTED) && (readPhoneState == PackageManager.PERMISSION_GRANTED)
    }

    private fun listenNewRadio(
        onCellInfoCallback: (CellInfo) -> Unit,
        onDisplayInfoCallback: (TelephonyDisplayInfo) -> Unit,
    ) {
        // Android 12より書き方が変わった
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            telephonyCallback = object : TelephonyCallback(), TelephonyCallback.DisplayInfoListener, TelephonyCallback.CellInfoListener {
                /** 実際の状態 */
                override fun onCellInfoChanged(cellInfo: MutableList<CellInfo>) {
                    onCellInfoCallback(cellInfo[0])
                }

                /** アンテナピクトと同じやつ */
                override fun onDisplayInfoChanged(telephonyDisplayInfo: TelephonyDisplayInfo) {
                    onDisplayInfoCallback(telephonyDisplayInfo)
                }
            }
            telephonyManager.registerTelephonyCallback(mainExecutor, telephonyCallback!!)
        } else {
            phoneStateListener = object : PhoneStateListener() {

                @SuppressLint("MissingPermission")
                override fun onCellInfoChanged(cellInfo: MutableList<CellInfo>?) {
                    super.onCellInfoChanged(cellInfo)
                    cellInfo?.get(0)?.let { onCellInfoCallback(it) }
                }

                @SuppressLint("MissingPermission")
                override fun onDisplayInfoChanged(telephonyDisplayInfo: TelephonyDisplayInfo) {
                    super.onDisplayInfoChanged(telephonyDisplayInfo)
                    onDisplayInfoCallback(telephonyDisplayInfo)
                }
            }
            telephonyManager.listen(phoneStateListener!!, PhoneStateListener.LISTEN_DISPLAY_INFO_CHANGED or PhoneStateListener.LISTEN_CELL_INFO)
        }
    }

    private fun listenUnlimitedNetwork(onResult: (Boolean) -> Unit) {
        connectivityManagerCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onCapabilitiesChanged(network: Network, networkCapabilities: NetworkCapabilities) {
                super.onCapabilitiesChanged(network, networkCapabilities)
                // 無制限プランを契約している場合はtrue
                val isUnlimited = networkCapabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_METERED) ||
                        networkCapabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_TEMPORARILY_NOT_METERED)
                onResult(isUnlimited)
            }
        }
        connectivityManager.registerDefaultNetworkCallback(connectivityManagerCallback!!)
    }

    override fun onDestroy() {
        super.onDestroy()
        connectivityManagerCallback?.let { connectivityManager.unregisterNetworkCallback(it) }
        phoneStateListener?.let { telephonyManager.listen(it, PhoneStateListener.LISTEN_NONE) }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            telephonyCallback?.let { telephonyManager.unregisterTelephonyCallback(it) }
        }
    }

}
```

### 結果

寒い中ドコモショップの近くをフラフラして5Gの電波を感じてきました。(ドコモショップには貴重な5Gミリ波アンテナがある。すべての店舗には無いっぽい？)

<img width="200" src="https://i.imgur.com/Mg1qpT3.png">
<img width="200" src="https://i.imgur.com/J2BomtM.png">
<img width="200" src="https://i.imgur.com/TcmirVd.png">
<img width="200" src="https://i.imgur.com/PhYA35b.png">

- `ConnectivityManager#registerDefaultNetworkCallback()`
    - モバイルデータ接続中は常に従量制ネットワーク判定だった
        - なんか設定が必要なの？
- `TelephonyManager#listen()`と`onDisplayInfoChanged()`
    - `ミリ波`でも変わらず、`Sub-6`判定だった。
    - `アンカーバンド圏内`の場合でも`Sub-6`判定だった。
- `TelephonyManager#listen()`と`onDisplayInfoChanged()`
    - アンカーバンド時は`CellInfoLte`、5G(Sub-6/NR)の場合は`CellIdentityNr`が貰える
        - よって`Sub-6`or`ミリ波`or`アンカーバンド`の検出にはこっちを利用する必要があるってことですね！

## Sub-6 か ミリ波 か判定する方法

`NRARFCN`の数字が`2054166`以上の場合は多分ミリ波です(5Gバンド`n257`以上)

というわけで、`startListen 関数`を書き換えれば5G ミリ波、5G Sub-6の検知も出来るはずです。

```kotlin
    private fun startListen() {
        listenUnlimitedNetwork {
            viewBinding.activityMainMeteredTextview.text = if (it) "無制限のネットワーク接続" else "上限ありのネットワーク接続"
        }
        listenNewRadio(
            onCellInfoCallback = {
                viewBinding.activityMainBandTextview.text = when (it) {
                    is CellInfoLte -> """LTE
接続中バンド：${it.cellIdentity.bands.map { it.toString() }} (${it.cellIdentity.earfcn})"""
                    is CellInfoNr -> """5G
接続中バンド：${(it.cellIdentity as CellIdentityNr).bands.map { it.toString() }} (${(it.cellIdentity as CellIdentityNr).nrarfcn})
${if ((it.cellIdentity as CellIdentityNr).nrarfcn > 2054166) "ミリ波に接続中" else "Sub-6に接続中"}
"""
                    else -> "それ以外"
                }
            },
            onDisplayInfoCallback = {
                viewBinding.activityMainNewRadioTextview.text = when (it.overrideNetworkType) {
                    TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_LTE_ADVANCED_PRO -> "LTE Advanced Pro（5Ge）"
                    TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_LTE_CA -> "LTE キャリアアグリゲーション"
                    TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_NR_NSA -> "5G Sub-6 ネットワーク"
                    TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_NR_NSA_MMWAVE -> "5G ミリ波 ネットワーク (非推奨)"
                    TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_NR_ADVANCED -> "5G ミリ波 (もしくはそれ同等の) ネットワーク"
                    else -> "それ以外"
                }
            }
        )
    }
```

## アンカーバンドかどうかを判断する方法

`CellInfo`と`TelephonyDisplayInfo`から判断できます

```kotlin
    private fun listenNewRadio(
        onCellInfoCallback: (CellInfo) -> Unit,
        onDisplayInfoCallback: (TelephonyDisplayInfo) -> Unit,
        onAnchorBandCallback: (Boolean) -> Unit,
    ) {

        // onCellInfoChanged onDisplayInfoChanged の結果を一時的に持っておく
        var tempCellInfo: CellInfo? = null
        var tempTelephonyDisplayInfo: TelephonyDisplayInfo? = null

        // アンカーバンドかどうかを送る
        fun checkAnchorBand() {
            if (tempCellInfo == null && tempTelephonyDisplayInfo == null) return
            // CellInfoがLTEのもので、実際に表示しているアイコンが5Gの場合はアンカーバンド
            val isAnchorBand = tempCellInfo is CellInfoLte && tempTelephonyDisplayInfo?.overrideNetworkType == TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_NR_NSA
            onAnchorBandCallback(isAnchorBand)
        }

        // Android 12より書き方が変わった
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            telephonyCallback = object : TelephonyCallback(), TelephonyCallback.DisplayInfoListener, TelephonyCallback.CellInfoListener {
                /** 実際の状態 */
                override fun onCellInfoChanged(cellInfo: MutableList<CellInfo>) {
                    onCellInfoCallback(cellInfo[0])
                    tempCellInfo = cellInfo[0]
                    checkAnchorBand()
                }

                /** アンテナピクトと同じやつ */
                override fun onDisplayInfoChanged(telephonyDisplayInfo: TelephonyDisplayInfo) {
                    onDisplayInfoCallback(telephonyDisplayInfo)
                    tempTelephonyDisplayInfo = telephonyDisplayInfo
                    checkAnchorBand()
                }
            }
            telephonyManager.registerTelephonyCallback(mainExecutor, telephonyCallback!!)
        } else {
            phoneStateListener = object : PhoneStateListener() {

                @SuppressLint("MissingPermission")
                override fun onCellInfoChanged(cellInfo: MutableList<CellInfo>?) {
                    super.onCellInfoChanged(cellInfo)
                    cellInfo?.get(0)?.let { onCellInfoCallback(it) }
                    tempCellInfo = cellInfo?.get(0)
                    checkAnchorBand()
                }

                @SuppressLint("MissingPermission")
                override fun onDisplayInfoChanged(telephonyDisplayInfo: TelephonyDisplayInfo) {
                    super.onDisplayInfoChanged(telephonyDisplayInfo)
                    onDisplayInfoCallback(telephonyDisplayInfo)
                    tempTelephonyDisplayInfo = telephonyDisplayInfo
                    checkAnchorBand()
                }
            }
            telephonyManager.listen(phoneStateListener!!, PhoneStateListener.LISTEN_DISPLAY_INFO_CHANGED or PhoneStateListener.LISTEN_CELL_INFO)
        }
    }
```

関数を呼ぶ側はこんな風に

```kotlin
    private fun startListen() {
        listenUnlimitedNetwork {
            viewBinding.activityMainMeteredTextview.text = if (it) "無制限のネットワーク接続" else "上限ありのネットワーク接続"
        }
        listenNewRadio(
            onCellInfoCallback = {
                viewBinding.activityMainBandTextview.text = when (it) {
                    is CellInfoLte -> """LTE
接続中バンド：${it.cellIdentity.bands.map { it.toString() }} (${it.cellIdentity.earfcn})"""
                    is CellInfoNr -> """5G
接続中バンド：${(it.cellIdentity as CellIdentityNr).bands.map { it.toString() }} (${(it.cellIdentity as CellIdentityNr).nrarfcn})
${if ((it.cellIdentity as CellIdentityNr).nrarfcn > 2054166) "ミリ波に接続中" else "Sub-6に接続中"}"""
                    else -> "それ以外"
                }
            },
            onDisplayInfoCallback = {
                viewBinding.activityMainNewRadioTextview.text = when (it.overrideNetworkType) {
                    TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_LTE_ADVANCED_PRO -> "LTE Advanced Pro（5Ge）"
                    TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_LTE_CA -> "LTE キャリアアグリゲーション"
                    TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_NR_NSA -> "5G Sub-6 ネットワーク"
                    TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_NR_NSA_MMWAVE -> "5G ミリ波 ネットワーク (非推奨)"
                    TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_NR_ADVANCED -> "5G ミリ波 (もしくはそれ同等の) ネットワーク"
                    else -> "それ以外"
                }
            },
            onAnchorBandCallback = {
                // レイアウトにTextView追加しておいて！
                viewBinding.activityMainAnchorBandTextview.text = if (it) "アンカーバンド接続中" else "4G接続中、もしくはアンカーバンドではありません。"
            }
        )
    }
```

## ソースコード
どうぞ～

https://github.com/takusan23/NewRadioAPIChecker

# 終わりに
アンカーバンドチェッカー作りました。作ったんだけどなんかdocomoなのに`バンド：n77`とか表示するしなんか強制終了するして適当だけどどうぞ。

(PlayStoreって年末年始も審査してるんか・・・？お疲れ様です)

- PlayStore
    - https://play.google.com/store/apps/details?id=io.github.takusan23.newradiosupporter
    - Android 11 以降
- ソースコード
    - https://github.com/takusan23/NewRadioSupporter

そういえばdocomoもなんちゃって5G（4G周波数を転用）の姿勢を見せたみたいですよ。docomoはやらない雰囲気（なぜか変換できない）出してたのに・・・