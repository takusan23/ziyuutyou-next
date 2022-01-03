---
title: COCOAの電波を検知してみる
created_at: 2021-03-22
tags:
- Android
- Bluetooth
- Kotlin
---
これ高校卒業前にやっとけば面白かったのでは

<img src="https://imgur.com/6EC4Hng.png" width="200">

テレビちゃんに卒業式でつける花（なんていうの？）をつけた

# 本題
どうやら`COCOA`の電波を拾えるらしい？試してみる  
ちな一回も通知来たことない（いいことじゃん）

# 環境

| なまえ  | あたい  |
|---------|---------|
| Android | 12 DP 2 |

# 公式ドキュメント
日本語版は`BluetoothAdapter#startLeScan()`を使ってますが、これは非推奨なので英語版を見ましょう。  
https://developer.android.com/guide/topics/connectivity/use-ble

# つくる

## AndroidManifest.xml
ブルートゥースの権限が必要であることを示します。  
特に一番下の`android.permission.ACCESS_FINE_LOCATION`は、ユーザーに許可を求めるタイプの権限です。

```xml
<uses-permission android:name="android.permission.BLUETOOTH"/>
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

## appフォルダ内のbuild.gradle
権限を求めるため、今までの`onActivityResult()`を使ってもいいんですけど、今回は`Activity Result API`を使いたい。  
ので`Activity`と`Fragment`のバージョンをあげます

```kotlin
dependencies {

    // Activity Result API
    implementation "androidx.activity:activity-ktx:1.2.1"
    implementation "androidx.fragment:fragment-ktx:1.3.1"

    // 省略
}
```


## MainActivity.kt

### BLEに対応しているか
BLEに対応しているかを返す関数を書いて

```kotlin
/** BLE対応時はtrueを返す */
private fun isSupportedBLE(): Boolean {
    return packageManager.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)
}
```

### BluetoothAdapter
が必要らしいので

```kotlin
private val bluetoothAdapter by lazy {
    val bluetoothManager = getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    bluetoothManager.adapter
}
```

### Bluetoothが有効？
ブルートゥースがONになっているかを確認します

```kotlin
/** Bluetoothが有効ならtrue */
private fun isEnableBluetooth(): Boolean {
    return bluetoothAdapter.isEnabled
}
```

### BLE端末が検出したら呼ばれるコールバック
を書きます。

```kotlin
/** BLE端末を検出したら呼ばれるコールバック */
private val bleCallBack = object : ScanCallback() {
    override fun onScanResult(callbackType: Int, result: ScanResult?) {
        super.onScanResult(callbackType, result)
        println("検出")
        println(result)
    }
}
```
### 検出を始める
10秒後に検出を終了するようにしときました。  
とりあえずはUUIDの制限を掛けずにスキャンしてみます

```kotlin
/** BLE端末の検出を始める。10秒後に終了する */
private fun start() {
    bluetoothAdapter.bluetoothLeScanner.startScan(bleCallBack)
    // 10秒後に終了
    Handler(Looper.getMainLooper()).postDelayed(10 * 1000) {
        bluetoothAdapter.bluetoothLeScanner.stopScan(bleCallBack)
    }
}
```

### 権限を求める
`Activity Result API`のおかげで簡単になった。  

```kotlin
/** 権限コールバック */
private val permissionCallBack = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
    if (isGranted) {
        // お許しをもらった
        start()
    }
}

/** android.permission.ACCESS_FINE_LOCATION 権限があるかどうか */
private fun isGrantedAccessFineLocationPermission(): Boolean {
    return ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
}

/** android.permission.ACCESS_FINE_LOCATION 権限を貰いに行く */
private fun requestAccessFineLocationPermission(){
    permissionCallBack.launch(android.Manifest.permission.ACCESS_FINE_LOCATION)
}
```


### onCreate()
`onCreate()`でそれぞれ呼べばいいかな

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)
    when {
        !isSupportedBLE() -> {
            // BLE非対応
            finish()
            Toast.makeText(this, "BLE未対応端末では利用できません", Toast.LENGTH_SHORT).show()
        }
        !isEnableBluetooth() -> {
            // BluetoothがOFF
            finish()
            Toast.makeText(this, "Bluetoothを有効にしてください", Toast.LENGTH_SHORT).show()
        }
        !isGrantedAccessFineLocationPermission() -> {
            // パーミッションがない。リクエストする
            requestAccessFineLocationPermission()
        }
        else -> {
            // 検出開始
            start()
        }
    }
}
```

## ここまで

```kotlin
class MainActivity : AppCompatActivity() {

    private val bluetoothAdapter by lazy {
        val bluetoothManager = getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        bluetoothManager.adapter
    }

    /** 権限コールバック */
    private val permissionCallBack = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        if (isGranted) {
            // お許しをもらった
            start()
        }
    }

    /** BLE端末を検出したら呼ばれるコールバック */
    private val bleCallBack = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult?) {
            super.onScanResult(callbackType, result)
            println("検出")
            println(result)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        when {
            !isSupportedBLE() -> {
                // BLE非対応
                finish()
                Toast.makeText(this, "BLE未対応端末では利用できません", Toast.LENGTH_SHORT).show()
            }
            !isEnableBluetooth() -> {
                // BluetoothがOFF
                finish()
                Toast.makeText(this, "Bluetoothを有効にしてください", Toast.LENGTH_SHORT).show()
            }
            !isGrantedAccessFineLocationPermission() -> {
                // パーミッションがない。リクエストする
                requestAccessFineLocationPermission()
            }
            else -> {
                // 検出開始
                start()
            }
        }
    }

    /** BLE端末の検出を始める。10秒後に終了する */
    private fun start() {
        bluetoothAdapter.bluetoothLeScanner.startScan(bleCallBack)
        // 10秒後に終了
        Handler(Looper.getMainLooper()).postDelayed(10 * 1000) {
            bluetoothAdapter.bluetoothLeScanner.stopScan(bleCallBack)
            Toast.makeText(this, "検出終了", Toast.LENGTH_SHORT).show()
        }
    }

    /** android.permission.ACCESS_FINE_LOCATION 権限があるかどうか */
    private fun isGrantedAccessFineLocationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
    }

    /** android.permission.ACCESS_FINE_LOCATION 権限を貰いに行く */
    private fun requestAccessFineLocationPermission(){
        permissionCallBack.launch(android.Manifest.permission.ACCESS_FINE_LOCATION)
    }

    /** Bluetoothが有効ならtrue */
    private fun isEnableBluetooth(): Boolean {
        return bluetoothAdapter.isEnabled
    }

    /** BLE対応時はtrueを返す */
    private fun isSupportedBLE(): Boolean {
        return packageManager.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)
    }

}
```

## どれがCOCOAの電波ですか？
このままではすべての電波を取得してしまうので、`COCOA`の電波に限定してあげる必要があるのですが、ここらへんはよく知りません。  
２つの方法でこの問題を解決することが出来ます。

## 電波強度
`ScanResult#rssi`で取れます。単位は謎

### start()関数を書き換える方法
眺めてると`0000fd6f-0000-1000-8000-00805f9b34fb`がCOCOAのUUID？らしいのでこれに限定してあげればいいと思います。

```kotlin
/** BLE端末の検出を始める。10秒後に終了する */
private fun start() {
    // COCOAの電波のみ
    val uuidFilter = listOf(
            ScanFilter.Builder().apply { setServiceUuid(ParcelUuid.fromString("0000fd6f-0000-1000-8000-00805f9b34fb")) }.build()
    )
    val scanSettings = ScanSettings.Builder().build()
    bluetoothAdapter.bluetoothLeScanner.startScan(uuidFilter, scanSettings, bleCallBack)
    // 10秒後に終了
    Handler(Looper.getMainLooper()).postDelayed(10 * 1000) {
        bluetoothAdapter.bluetoothLeScanner.stopScan(bleCallBack)
        Toast.makeText(this, "検出終了", Toast.LENGTH_SHORT).show()
    }
}
```

## コールバックで限定する

もしくは、すべての電波を取得したあとにUUIDでフィルターしてもいいと思います

```kotlin
/** BLE端末を検出したら呼ばれるコールバック */
private val bleCallBack = object : ScanCallback() {
    override fun onScanResult(callbackType: Int, result: ScanResult?) {
        super.onScanResult(callbackType, result)
        if (result?.scanRecord?.serviceUuids?.get(0)?.uuid?.toString() == "0000fd6f-0000-1000-8000-00805f9b34fb"){
            println("みつけた")
        }
    }
}
```

## UIも作る
`ViewBinding`を有効にしてください。  
日本語版ドキュメントには`viewBinding { enable = true }`しろって書いてありますが、これは古くて以下の方法が正解です

`app/build.gradle`を開いて

```gradle
android {
    compileSdkVersion 30
    buildToolsVersion "30.0.3"

    defaultConfig {
        applicationId "io.github.takusan23.cocoablechecker"
        minSdkVersion 21
        targetSdkVersion 30
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    // これ
    buildFeatures {
        viewBinding true
    }
    // ここまで
}
```

```
buildFeatures {
        viewBinding true
}
```

が正解です。

### activity_main.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <ProgressBar
        android:id="@+id/activity_main_progress_bar"
        style="?android:attr/progressBarStyle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginBottom="16dp"
        android:visibility="gone"
        app:layout_constraintBottom_toTopOf="@+id/activity_main_count_text_view"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent" />

    <TextView
        android:id="@+id/activity_main_count_text_view"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:gravity="center"
        android:textSize="24sp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <Button
        android:id="@+id/activity_main_start_button"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        android:text="計測開始"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@+id/activity_main_count_text_view" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

### MainActivity.kt
電波強度も表示してみたけど見方がわからん

```kotlin
class MainActivity : AppCompatActivity() {

    private val bluetoothAdapter by lazy {
        val bluetoothManager = getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        bluetoothManager.adapter
    }

    /** 権限コールバック */
    private val permissionCallBack = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        if (isGranted) {
            // お許しをもらった
            start()
        }
    }

    /** ViewBinding */
    private val viewBinding by lazy { ActivityMainBinding.inflate(layoutInflater) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(viewBinding.root)

        when {
            !isSupportedBLE() -> {
                // BLE非対応
                finish()
                Toast.makeText(this, "BLE未対応端末では利用できません", Toast.LENGTH_SHORT).show()
            }
            !isEnableBluetooth() -> {
                // BluetoothがOFF
                finish()
                Toast.makeText(this, "Bluetoothを有効にしてください", Toast.LENGTH_SHORT).show()
            }
            !isGrantedAccessFineLocationPermission() -> {
                // パーミッションがない。リクエストする
                requestAccessFineLocationPermission()
            }
            else -> {
                // 検出開始
                viewBinding.activityMainStartButton.setOnClickListener {
                    start()
                }
            }
        }
    }

    /** BLE端末の検出を始める。10秒後に終了する */
    private fun start() {
        // 結果を入れる配列
        val resultList = arrayListOf<ScanResult>()
        // BLE端末を検出したら呼ばれるコールバック
        val bleCallBack = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult?) {
                super.onScanResult(callbackType, result)
                // 配列に追加
                if (result?.scanRecord?.serviceUuids?.get(0)?.uuid?.toString() == "0000fd6f-0000-1000-8000-00805f9b34fb") {
                    resultList.add(result)
                }
            }
        }
        // スキャン開始
        bluetoothAdapter.bluetoothLeScanner.startScan(bleCallBack)
        // くるくる
        viewBinding.activityMainProgressBar.isVisible = true
        // 10秒後に終了
        Handler(Looper.getMainLooper()).postDelayed(10 * 1000) {
            // 止める
            bluetoothAdapter.bluetoothLeScanner.stopScan(bleCallBack)
            // 重複を消す
            val finalList = resultList.distinctBy { scanResult -> scanResult.device?.address }
            // 結果
            viewBinding.activityMainProgressBar.isVisible = false
            // 電波強度
            val singalText = finalList.joinToString(separator = "\n") { scanResult -> "${scanResult.rssi} dBm" }
            // TextViewに表示
            viewBinding.activityMainCountTextView.text = """
COCOAインストール台数
およそ ${finalList.size} 台
--- 電波強度 ---
$singalText
            """.trimIndent()
        }
    }

    /** android.permission.ACCESS_FINE_LOCATION 権限があるかどうか */
    private fun isGrantedAccessFineLocationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
    }

    /** android.permission.ACCESS_FINE_LOCATION 権限を貰いに行く */
    private fun requestAccessFineLocationPermission() {
        permissionCallBack.launch(android.Manifest.permission.ACCESS_FINE_LOCATION)
    }

    /** Bluetoothが有効ならtrue */
    private fun isEnableBluetooth(): Boolean {
        return bluetoothAdapter.isEnabled
    }

    /** BLE対応時はtrueを返す */
    private fun isSupportedBLE(): Boolean {
        return packageManager.hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)
    }

}
```

<img src="https://imgur.com/YlcCf5d.png" width=300>

# そーすこーど
間違ってたらごめんね

https://github.com/takusan23/CocoaBLECheckerSample


# 参考にしました
https://qiita.com/Rabbit_Program/items/3c1aec6e30eb646d78a1  
https://engineer.dena.com/posts/2021.02/web-bluetooth-cocoa-checker/  
https://qiita.com/jp-96/items/3e5e5a12d42ba246b8c3  
https://qiita.com/coppercele/items/fef9eacee05b752ed982