---
title: Androidで接続中のバンドを取得する
created_at: 2021-04-11
tags:
- Android
- Kotlin
---
どうもこんばんわ

<img src="https://imgur.com/31rkY0c.png" width="300">

店員ちゃんのセイイキ、、、どこ？

# 本題
Androidで接続中バンドを取得するアプリを作りたい。  
Band 3とかそういうのがほしい

# 一筋縄では行かない
`getBand()`みたいな関数は無い。じゃあ世の中の電測[^1]アプリはどうやってバンドを取得しているのって話ですが、  
`EARFCN`という値が取得できるので、`EARFCN`の値と`バンド一覧`を照らし合わせることでバンドを取得することが出来ます。

周波数も`EARFCN`から出すことができるみたいです。

ちなみに3Gでは`UARFCN`、5Gでは`NRARFCN`と呼ばれているそう。

EARFCNからバンドを割り出すサイト→https://www.sqimway.com/lte_band.php

# とりあえずEARFCNを取得してみる

## app/build.gradle

`ViewBinding`、`Acitivty Result API`を利用できるようにします

```
android {
    compileSdkVersion 30
    buildToolsVersion "30.0.3"

    defaultConfig {
        applicationId "io.github.takusan23.connectionband"
        minSdkVersion 24
        targetSdkVersion 30
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures{
        viewBinding true
    }

    // 省略

}

dependencies {

    // Activity Result API
    implementation 'androidx.activity:activity-ktx:1.3.0-alpha06'
    implementation 'androidx.fragment:fragment-ktx:1.3.2'


}
```

## activity_main.xml

`TextView`と`Button`をおいておきましょう

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <TextView
        android:id="@+id/activity_main_text_view"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="ボタンを押して計測"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <Button
        android:id="@+id/activity_main_button"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        android:text="計測"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@+id/activity_main_text_view" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

## AndroidManifest.xml

Android 10以降はこの権限が無いと最新の値が取れない。

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

## MainActivity.kt

### 権限とViewBinding

とりあえず権限もらうのと、`ViewBinding`の用意をします。

```kotlin
class MainActivity : AppCompatActivity() {

    private val viewBinding by lazy { ActivityMainBinding.inflate(layoutInflater) }

    private val permissionCallBack = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        if (isGranted) {
            // 権限もらえた

        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(viewBinding.root)

        start()

        viewBinding.activityMainButton.setOnClickListener {
            start()
        }

    }

    /** 権限があれば計測、なければ権限をもらう */
    private fun start() {
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            // 権限あり

        } else {
            // 権限なし。貰いに行く
            permissionCallBack.launch(android.Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }


}
```

## EARFCNの取得
`getEarfcn`関数内に書いていきます。

```kotlin
/** TextViewにバンドを表示させる。コールバック形式になります */
private fun getEarfcn(result: (CellInfo) -> Unit) {
    val telephonyManager = getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
        // Android 10以降
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            telephonyManager.requestCellInfoUpdate(mainExecutor, object : TelephonyManager.CellInfoCallback() {
                override fun onCellInfo(cellInfo: MutableList<CellInfo>) {
                    result.invoke(cellInfo[0])
                }
            })
        }
    } else {
        // Android 9以前
        result.invoke(telephonyManager.allCellInfo[0])
    }
}
```

# EARFCNからバンドを割り出す関数

と、その前に`EARFCN`の値とバンドの相対表が必要ですので用意しましょう。 

- https://www.arib.or.jp/english/html/overview/doc/STD-T104v2_10/5_Appendix/Rel11/36/36101-b50.pdf
    - 33ページ目、`Table 5.7.3-1: E-UTRA channel numbers`
- `lte band earfcn table` とかで検索

多分PDF見るのが早いと思います。

中を見るとこんな感じの表が出てきます。（以下はクソ簡略版）

| band | Range of Ndl |
|------|--------------|
| 1    | 0 - 599      |
| 2    | 600 - 1199   |
| 3    | 1200 - 1949  |

取得した`EARFCN`が`1850`の場合は、`1200 から 1949 まで`の`Band 3`が正解！となるわけです。  
`1500`の場合でも、`1200 から 1949 まで`の`Band 3`が正解となります。

この表と照らし合わせる処理を書きます。

## データクラスを用意
データ3つなので`Triple`でも良かったですね

```kotlin
/**
 * バンドの表データ
 * @param bandNumber バンドの番号
 * @param nDlMin Earfcnここから
 * @param nDlMax Earfcnここまで
 * */
data class BandData(val bandNumber: Int, val nDlMin: Int, val nDlMax: Int)
```

## 変換する関数

Kotlinの(0..10)みたいなやつのおかげで楽ですね。  
(比較演算子使って範囲内かどうかを調べてもいいけど)

```kotlin
/** EARFCNからバンドを割り出す */
private fun getBand(earfcn: Int): Int {
    /**
     * https://www.arib.or.jp/english/html/overview/doc/STD-T104v2_10/5_Appendix/Rel11/36/36101-b50.pdf
     *
     * 33ページ目、「Table 5.7.3-1: E-UTRA channel numbers」参照
     * */
    val bandList = listOf(
            BandData(1, 0, 599),
            BandData(2, 600, 1199),
            BandData(3, 1200, 1949),
            BandData(4, 1950, 2399),
            BandData(5, 2400, 2649),
            BandData(6, 2650, 2749),
            BandData(7, 2750, 3449),
            BandData(8, 3450, 3799),
            BandData(9, 3800, 4149),
            BandData(10, 4150, 4749),
            BandData(11, 4750, 4949),
            BandData(12, 5010, 5179),
            BandData(13, 5180, 5279),
            BandData(14, 5280, 5279),
            BandData(17, 5730, 5849),
            BandData(18, 5850, 5999),
            BandData(19, 6000, 6149),
            BandData(20, 6150, 6449),
            BandData(21, 6450, 6599),
            BandData(22, 6600, 7399),
            BandData(23, 7500, 7699),
            BandData(24, 7700, 8039),
            BandData(25, 8040, 8689),
            BandData(26, 8690, 9039),
            BandData(27, 9040, 9209),
            BandData(28, 9210, 9659),
            BandData(29, 9660, 9769),
            BandData(30, 9770, 9869),
            BandData(31, 9870, 9919),
            BandData(32, 9920, 10359),
            BandData(65, 65536, 66435),
            BandData(66, 66436, 67335),
            BandData(67, 67336, 67535),
            BandData(68, 67536, 67835),
            BandData(69, 67836, 68335),
            BandData(70, 68336, 68585),
            BandData(71, 68586, 68935),
    )
    // 探す
    return bandList.find { bandData -> earfcn in bandData.nDlMin..bandData.nDlMax }?.bandNumber ?: 0
}
```

## 合体
EARFCN取得関数と合体させます。

```kotlin
/** 接続しているバンドをTextViewに入れる */
private fun setBandToTextView() {
    getEarfcn { cellInfo ->
        if (cellInfo is CellInfoLte) {
           val band = getBand(cellInfo.cellIdentity.earfcn)
            viewBinding.activityMainTextView.text = "接続中バンド：${band}"
        }
    }
}
```

そして権限コールバックのところとボタン押したところに書いて完成

```kotlin
private val permissionCallBack = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
    if (isGranted) {
        // 権限もらえた
        setBandToTextView()
    }
}
```

```kotlin
/** 権限があれば計測、なければ権限をもらう */
private fun start() {
    if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
        // 権限あり
        setBandToTextView()
    } else {
        // 権限なし。貰いに行く
        permissionCallBack.launch(Manifest.permission.ACCESS_FINE_LOCATION)
    }
}
```

# 全部くっつけてこう

```kotlin
class MainActivity : AppCompatActivity() {

    private val viewBinding by lazy { ActivityMainBinding.inflate(layoutInflater) }

    private val permissionCallBack = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        if (isGranted) {
            // 権限もらえた
            setBandToTextView()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(viewBinding.root)

        start()

        viewBinding.activityMainButton.setOnClickListener {
            start()
        }

    }

    /** 権限があれば計測、なければ権限をもらう */
    private fun start() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            // 権限あり
            setBandToTextView()
        } else {
            // 権限なし。貰いに行く
            permissionCallBack.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }

    /** 接続しているバンドをTextViewに入れる */
    private fun setBandToTextView() {
        getEarfcn { cellInfo ->
            when (cellInfo) {
                is CellInfoLte -> {
                    // 4G / LTE
                    val band = getBand(cellInfo.cellIdentity.earfcn)
                    viewBinding.activityMainTextView.text = "接続中バンド：${band}"
                }
            }
        }
    }

    /** TextViewにバンドを表示させる。コールバック形式になります */
    private fun getEarfcn(result: (CellInfo) -> Unit) {
        val telephonyManager = getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            // Android 10以降
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                telephonyManager.requestCellInfoUpdate(mainExecutor, object : TelephonyManager.CellInfoCallback() {
                    override fun onCellInfo(cellInfo: MutableList<CellInfo>) {
                        result.invoke(cellInfo[0])
                    }
                })
            }
        } else {
            // Android 9以前
            result.invoke(telephonyManager.allCellInfo[0])
        }
    }

    /** EARFCNからバンドを割り出す */
    private fun getBand(earfcn: Int): Int {
        /**
         * https://www.arib.or.jp/english/html/overview/doc/STD-T104v2_10/5_Appendix/Rel11/36/36101-b50.pdf
         *
         * 33ページ目、「Table 5.7.3-1: E-UTRA channel numbers」参照
         * */
        val bandList = listOf(
                BandData(1, 0, 599),
                BandData(2, 600, 1199),
                BandData(3, 1200, 1949),
                BandData(4, 1950, 2399),
                BandData(5, 2400, 2649),
                BandData(6, 2650, 2749),
                BandData(7, 2750, 3449),
                BandData(8, 3450, 3799),
                BandData(9, 3800, 4149),
                BandData(10, 4150, 4749),
                BandData(11, 4750, 4949),
                BandData(12, 5010, 5179),
                BandData(13, 5180, 5279),
                BandData(14, 5280, 5279),
                BandData(17, 5730, 5849),
                BandData(18, 5850, 5999),
                BandData(19, 6000, 6149),
                BandData(20, 6150, 6449),
                BandData(21, 6450, 6599),
                BandData(22, 6600, 7399),
                BandData(23, 7500, 7699),
                BandData(24, 7700, 8039),
                BandData(25, 8040, 8689),
                BandData(26, 8690, 9039),
                BandData(27, 9040, 9209),
                BandData(28, 9210, 9659),
                BandData(29, 9660, 9769),
                BandData(30, 9770, 9869),
                BandData(31, 9870, 9919),
                BandData(32, 9920, 10359),
                BandData(65, 65536, 66435),
                BandData(66, 66436, 67335),
                BandData(67, 67336, 67535),
                BandData(68, 67536, 67835),
                BandData(69, 67836, 68335),
                BandData(70, 68336, 68585),
                BandData(71, 68586, 68935),
        )
        // 探す
        return bandList.find { bandData -> earfcn in bandData.nDlMin..bandData.nDlMax }?.bandNumber ?: 0
    }

    /**
     * バンドの表データ
     * @param bandNumber バンドの番号
     * @param nDlMin Earfcnここから
     * @param nDlMax Earfcnここまで
     * */
    data class BandData(val bandNumber: Int, val nDlMin: Int, val nDlMax: Int)

}
```

動かすとこんなかんじ

![Imgur](https://imgur.com/FIzgY7v.png)

## 番外編：5G（NR）に対応する
New Radioの略らしい。  

- https://www.etsi.org/deliver/etsi_ts/138100_138199/13810101/15.08.02_60/ts_13810101v150802p.pdf
    - 30ページ目、「Table 5.4.2.3-1: Applicable NR-ARFCN per operating band」参照

ここに4Gのときみたいな表があるので

| band | Downlink Range of NREF |
|------|------------------------|
| n1   | 422000 – 434000        |
| n2   | 386000  – 398000       |
| n3   | 361000 - 376000        |

これを配列に入れてこんな感じに。

あ、ミリ波の方は、

- https://www.etsi.org/deliver/etsi_ts/138100_138199/13810102/15.08.00_60/ts_13810102v150800p.pdf
    - 27ページ目、「Table 5.4.2.3-1: Applicable NR-ARFCN per operating band」

だと思います。（多分）

```kotlin
/** バンドを取得する。5G対応版 */
private fun getNRBand(arfcn: Int): Int {
    /**
     * https://www.etsi.org/deliver/etsi_ts/138100_138199/13810101/15.08.02_60/ts_13810101v150802p.pdf
     *
     * 30ページ目、「Table 5.4.2.3-1: Applicable NR-ARFCN per operating band」参照
     * */
    val bandList = listOf(
            BandData(1, 422000, 434000),
            BandData(2, 386000, 398000),
            BandData(3, 361000, 376000),
            BandData(5, 173800, 178800),
            BandData(7, 524000, 538000),
            BandData(8, 185000, 192000),
            BandData(20, 158200, 164200),
            BandData(28, 151600, 160600),
            BandData(38, 514000, 524000),
            BandData(41, 499200, 537999),
            BandData(50, 286400, 303400),
            BandData(51, 285400, 286400),
            BandData(66, 422000, 440000),
            BandData(70, 399000, 404000),
            BandData(71, 123400, 130400),
            BandData(74, 295000, 303600),
            BandData(75, 286400, 303400),
            BandData(76, 285400, 286400),
            BandData(77, 620000, 680000),
            BandData(78, 620000, 653333),
            BandData(79, 693334, 733333),
            // 5G ミリ波
            BandData(257, 2054166, 2104165),
            BandData(258, 2016667, 2070832),
            BandData(260, 2229166, 2279165),
            BandData(261, 2070833, 2084999),
    )
    // 探す
    return bandList.find { bandData -> arfcn in bandData.nDlMin..bandData.nDlMax }?.bandNumber ?: 0
}
```

```kotlin
/** 接続しているバンドをTextViewに入れる */
private fun setBandToTextView() {
    getEarfcn { cellInfo ->
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
            when (cellInfo) {
                is CellInfoLte -> {
                    // 4G / LTE
                    val band = getBand(cellInfo.cellIdentity.earfcn)
                    viewBinding.activityMainTextView.text = "接続中バンド：${band}"
                }
                is CellInfoNr -> {
                    // 5G NR
                    val band = getNRBand((cellInfo.cellIdentity as CellIdentityNr).nrarfcn)
                    viewBinding.activityMainTextView.text = "接続中バンド：n${band}"
                }
            }
        } else {
            when (cellInfo) {
                is CellInfoLte -> {
                    // 4G / LTE
                    val band = getBand(cellInfo.cellIdentity.earfcn)
                    viewBinding.activityMainTextView.text = "接続中バンド：${band}"
                }
            }
        }
    }
}
```

作ったのはいいけど5Gエリアに行かないとあってるかどうかわからない。

# 全部くっつけて

```kotlin
class MainActivity : AppCompatActivity() {

    private val viewBinding by lazy { ActivityMainBinding.inflate(layoutInflater) }

    private val permissionCallBack = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        if (isGranted) {
            // 権限もらえた
            setBandToTextView()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(viewBinding.root)

        start()

        viewBinding.activityMainButton.setOnClickListener {
            start()
        }

    }

    /** 権限があれば計測、なければ権限をもらう */
    private fun start() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            // 権限あり
            setBandToTextView()
        } else {
            // 権限なし。貰いに行く
            permissionCallBack.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }

    /** 接続しているバンドをTextViewに入れる */
    private fun setBandToTextView() {
        getEarfcn { cellInfo ->
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
                when (cellInfo) {
                    is CellInfoLte -> {
                        // 4G / LTE
                        val band = getBand(cellInfo.cellIdentity.earfcn)
                        viewBinding.activityMainTextView.text = "接続中バンド：${band}"
                    }
                    is CellInfoNr -> {
                        // 5G NR
                        val band = getNRBand((cellInfo.cellIdentity as CellIdentityNr).nrarfcn)
                        viewBinding.activityMainTextView.text = "接続中バンド：n${band}"
                    }
                }
            } else {
                when (cellInfo) {
                    is CellInfoLte -> {
                        // 4G / LTE
                        val band = getBand(cellInfo.cellIdentity.earfcn)
                        viewBinding.activityMainTextView.text = "接続中バンド：${band}"
                    }
                }
            }
        }
    }

    /** TextViewにバンドを表示させる。コールバック形式になります */
    private fun getEarfcn(result: (CellInfo) -> Unit) {
        val telephonyManager = getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            // Android 10以降
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                telephonyManager.requestCellInfoUpdate(mainExecutor, object : TelephonyManager.CellInfoCallback() {
                    override fun onCellInfo(cellInfo: MutableList<CellInfo>) {
                        result.invoke(cellInfo[0])
                    }
                })
            }
        } else {
            // Android 9以前
            result.invoke(telephonyManager.allCellInfo[0])
        }
    }

    /** EARFCNからバンドを割り出す */
    private fun getBand(earfcn: Int): Int {
        /**
         * https://www.arib.or.jp/english/html/overview/doc/STD-T104v2_10/5_Appendix/Rel11/36/36101-b50.pdf
         *
         * 33ページ目、「Table 5.7.3-1: E-UTRA channel numbers」参照
         * */
        val bandList = listOf(
                BandData(1, 0, 599),
                BandData(2, 600, 1199),
                BandData(3, 1200, 1949),
                BandData(4, 1950, 2399),
                BandData(5, 2400, 2649),
                BandData(6, 2650, 2749),
                BandData(7, 2750, 3449),
                BandData(8, 3450, 3799),
                BandData(9, 3800, 4149),
                BandData(10, 4150, 4749),
                BandData(11, 4750, 4949),
                BandData(12, 5010, 5179),
                BandData(13, 5180, 5279),
                BandData(14, 5280, 5279),
                BandData(17, 5730, 5849),
                BandData(18, 5850, 5999),
                BandData(19, 6000, 6149),
                BandData(20, 6150, 6449),
                BandData(21, 6450, 6599),
                BandData(22, 6600, 7399),
                BandData(23, 7500, 7699),
                BandData(24, 7700, 8039),
                BandData(25, 8040, 8689),
                BandData(26, 8690, 9039),
                BandData(27, 9040, 9209),
                BandData(28, 9210, 9659),
                BandData(29, 9660, 9769),
                BandData(30, 9770, 9869),
                BandData(31, 9870, 9919),
                BandData(32, 9920, 10359),
                BandData(65, 65536, 66435),
                BandData(66, 66436, 67335),
                BandData(67, 67336, 67535),
                BandData(68, 67536, 67835),
                BandData(69, 67836, 68335),
                BandData(70, 68336, 68585),
                BandData(71, 68586, 68935),
        )
        // 探す
        return bandList.find { bandData -> earfcn in bandData.nDlMin..bandData.nDlMax }?.bandNumber ?: 0
    }

    /** バンドを取得する。5G対応版 */
    private fun getNRBand(arfcn: Int): Int {
        val bandList = listOf(
                BandData(1, 422000, 434000),
                BandData(2, 386000, 398000),
                BandData(3, 361000, 376000),
                BandData(5, 173800, 178800),
                BandData(7, 524000, 538000),
                BandData(8, 185000, 192000),
                BandData(20, 158200, 164200),
                BandData(28, 151600, 160600),
                BandData(38, 514000, 524000),
                BandData(41, 499200, 537999),
                BandData(50, 286400, 303400),
                BandData(51, 285400, 286400),
                BandData(66, 422000, 440000),
                BandData(70, 399000, 404000),
                BandData(71, 123400, 130400),
                BandData(74, 295000, 303600),
                BandData(75, 286400, 303400),
                BandData(76, 285400, 286400),
                BandData(77, 620000, 680000),
                BandData(78, 620000, 653333),
                BandData(79, 693334, 733333),
                // 5G ミリ波
                BandData(257, 2054166, 2104165),
                BandData(258, 2016667, 2070832),
                BandData(260, 2229166, 2279165),
                BandData(261, 2070833, 2084999),
        )
        // 探す
        return bandList.find { bandData -> arfcn in bandData.nDlMin..bandData.nDlMax }?.bandNumber ?: 0
    }

    /**
     * バンドの表データ
     * @param bandNumber バンドの番号
     * @param nDlMin Earfcnここから
     * @param nDlMax Earfcnここまで
     * */
    data class BandData(val bandNumber: Int, val nDlMin: Int, val nDlMax: Int)

}
```

# ソースコード

https://github.com/takusan23/ConnectionBand

# 終わりに
休日終わるの早すぎ。  
あと機内モードポチポチしてたら家でも楽天回線掴むようになってた。うれしい

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">機内モードぽちぽちしてたら楽天の自社回線掴んだ <a href="https://t.co/GPq60McH5o">pic.twitter.com/GPq60McH5o</a></p>&mdash; たくさん (@takusan__23) <a href="https://twitter.com/takusan__23/status/1381290674478145537?ref_src=twsrc%5Etfw">April 11, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

[^1]:電波測定の略らしい