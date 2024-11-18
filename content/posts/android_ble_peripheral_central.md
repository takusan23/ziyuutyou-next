---
title: Android の BLE でペリフェラル側、セントラル側を一通りやる
created_at: 2024-11-19
tags:
- Android
- Bluetooth
- BLE
- Kotlin
---
どうもこんばんわ。  
容量足りんくてパソコンのスクショ整理してたら見覚えある風景あったから見てきた。

![Imgur](https://imgur.com/RBSR4Qt.png)

時期が時期なだけあってキラキラしている。  
作中は反転してるっぽいので反転してください。

![Imgur](https://imgur.com/ZC7kl0w.png)

![Imgur](https://imgur.com/VcayN1X.png)

# 本題
`Android`端末同士を`Bluetooth Low Energy（以降 BLE）`を使って小さなデータをやり取りできるようにしたい。  
別件で近くの端末と値の交換をしたくなった。

今回は`BLE`の**ペリフェラル、セントラル側**を`Android`で作ってみて実際にデータのやり取りをしてみる。  
お試しにテキストを送ってみます。バイト配列にシリアライズできればなんでも良いはず？`Java`の`Serializable`とか。`Protocol Buffers`は使ったことなくわからないです。。  

![Imgur](https://imgur.com/pWk2EuQ.png)

ところで雲行きが怪しい。  

## BLE 公式
`BLE`だけでサンプル書いてほしかった、な  
https://developer.android.com/develop/connectivity/bluetooth/ble/ble-overview

## BLE 登場人物
`API`を触るのにこの辺知っておかないとなので・・！ざっと

- ペリフェラル（Peripheral）
    - `BLE`の接続を待ち受ける側です。
        - サーバー側、ホスト側
    - `IoT`だとセンサー側です。スマホ側じゃないです。
    - こいつには`GATT サーバー`機能と`アドバタイズ`機能を乗せます（後述）
- セントラル
    - `BLE`で接続する側です。
        - クライアント側、ゲスト側です。
- `GATT`
    - `BLE`で繋いだあとデータを送受信するための仕組み？
    - ペリフェラル側には`GATT サーバー`を搭載させます
- キャラクタリスティック
    - スペルをようやく覚えました。`Characteristic`
    - これは`GATT サーバー`の中にあるもので、実際にデータを送り返したり、あるいは書き込んだりする窓口みたいなやつ
    - バイト配列をやり取りします。文字列なら`toByteArray()`でバイト配列にします。
- サービス
    - キャラクタリスティックをまとめて入れておく箱です
    - キャラクタリスティックはサービスに属する必要があります。多分
- アドバタイズ
    - 「自分 GATT サーバーありますよ」と宣伝するやつです
    - セントラル側が探すのに使います
    - ペリフェラル側に`GATT サーバー`を用意するだけじゃ動かない
- `UUID`
    - 被らないあれ。
    - `BLE`の世界では`サービス`と`キャラクタリスティック`の識別に`UUID`を使っています。
    - `UUID`は基本被らないはずなので、自分で`UUID`を作って`BLE`で使って良いはず？（よくわからず）

## BLE 流れ

- ペリフェラルを探す
    - UUID とかでフィルターをかけます
- ペリフェラルと接続できたら`GATT サーバー`へ接続を試みる
- `GATT サーバー`と接続するとサービス一覧が取れる、ので狙ったサービスを探して、キャラクタリスティックを読み出したり書き込んだりする

# 端末

| なまえ                                                    | あたい                                                                                                                                                             |
|-----------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Android Studio                                            | Android Studio Ladybug 2024.2.1 Patch 2                                                                                                                            |
| 端末 （`ペリフェラル / セントラル`確認のため2台以上必要） | Pixel 8 Pro(15) / Xperia 1 V(14) / Pixel 6 Pro(14) / Pixel 3 XL(12) / Xiaomi Mi 11 Lite 5G(11) / OnePlus 7T Pro(11) / Xperia XZ1 Compact(9) / Xperia Z3 Compact(5) |
| minSdkVersion                                             | 21 ?                                                                                                                                                               |
| そのほか                                                  | `Jetpack Compose + Navigation Compose`、`Kotlin Coroutines`                                                                                                        |

`UI`には`Jetpack Compose`を使おうと思います。ペリフェラル、セントラル画面を作るためのナビゲーションも！  
あとコールバックが相変わらずしんどいので`Coroutines`も

手持ちの端末の中でまともに動くやつ（重たすぎるやつを除いて）を総動員させた本記事。

# つくる

## 作成
`Jetpack Compose`のテンプレで

![Imgur](https://imgur.com/XJGVfDa.png)

## AndroidManifest
ペリフェラル、セントラル両方を1つのアプリでやるので権限が多い  
多分`Android 11`以下で動かしたい場合は`android.permission.BLUETOOTH_ADMIN`も必要です。

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Bluetooth Low Energy -->
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

    <!-- Android 11 以下 -->
    <uses-permission
        android:name="android.permission.BLUETOOTH_ADMIN"
        android:maxSdkVersion="30" />

    <!-- 以下省略 -->
```

## app/build.gradle
画面遷移させたいので`navigation compose`を入れます。

```gradle
dependencies {

    implementation("androidx.navigation:navigation-compose:2.8.3")

    // 以下省略
```

## 画面を作る
とりあえずペリフェラル、セントラルの各画面と、切り替え画面を作ります。  

`HomeScreen.kt`

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onPeripheralClick: () -> Unit,
    onCentralClick: () -> Unit
) {
    Scaffold(
        topBar = { TopAppBar(title = { Text(text = "BLE ホーム画面") }) }
    ) { innerPadding ->
        Column(
            modifier = Modifier.padding(innerPadding),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(5.dp)
        ) {

            Button(onClick = onPeripheralClick) {
                Text(text = "ペリフェラル側になる")
            }

            Button(onClick = onCentralClick) {
                Text(text = "セントラル側になる")
            }
        }
    }
}
```

`PeripheralScreen.kt`

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PeripheralScreen() {
    Scaffold(
        topBar = { TopAppBar(title = { Text(text = "BLE ペリフェラル") }) }
    ) { innerPadding ->
        Column(
            modifier = Modifier.padding(innerPadding),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(5.dp)
        ) {

        }
    }
}
```

`CentralScreen.kt`

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CentralScreen() {
    Scaffold(
        topBar = { TopAppBar(title = { Text(text = "BLE セントラル") }) }
    ) { innerPadding ->
        Column(
            modifier = Modifier.padding(innerPadding),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(5.dp)
        ) {

        }
    }
}
```

`MainActivity`  
`rememberNavController()`がエラーになる場合はちゃんとライブラリ（`navigation compose`）が入ってない可能性があります。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidBlePeripheralCentralSampleTheme {
                MainScreen()
            }
        }
    }
}

@Composable
fun MainScreen() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "home") {
        composable("home") {
            HomeScreen(
                onPeripheralClick = { navController.navigate("peripheral") },
                onCentralClick = { navController.navigate("central") }
            )
        }
        composable("peripheral") {
            PeripheralScreen()
        }
        composable("central") {
            CentralScreen()
        }
    }
}
```

## 権限を求める
最初に表示される画面で必要な権限をリクエストすることにします、付与されていない場合は遷移すらさせない作戦。  
バージョンによって必要な権限が違うのがあれ。

あとコードではやってないのですが（じゃあやれ）、`Bluetooth`が有効になっているか、`BLE`が利用できるかもこのタイミングでやる必要があると思います。

```kotlin
/** 必要な権限たち */
private val PERMISSION_LIST = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
    listOf(
        android.Manifest.permission.BLUETOOTH,
        android.Manifest.permission.BLUETOOTH_CONNECT,
        android.Manifest.permission.BLUETOOTH_SCAN,
        android.Manifest.permission.BLUETOOTH_ADVERTISE,
        android.Manifest.permission.ACCESS_COARSE_LOCATION,
        android.Manifest.permission.ACCESS_FINE_LOCATION
    )
} else {
    listOf(
        android.Manifest.permission.BLUETOOTH,
        android.Manifest.permission.BLUETOOTH_ADMIN,
        android.Manifest.permission.ACCESS_COARSE_LOCATION,
        android.Manifest.permission.ACCESS_FINE_LOCATION
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onPeripheralClick: () -> Unit,
    onCentralClick: () -> Unit
) {
    val context = LocalContext.current

    // 権限を求めるまでボタンを出さない
    val isPermissionAllGranted = remember {
        mutableStateOf(PERMISSION_LIST.all { ContextCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED })
    }

    // リクエストするやつ
    val permissionRequest = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions(),
        onResult = { isPermissionAllGranted.value = it.all { it.value } }
    )

    // 権限をリクエスト
    LaunchedEffect(key1 = Unit) {
        permissionRequest.launch(PERMISSION_LIST.toTypedArray())
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text(text = "BLE ホーム画面") }) }
    ) { innerPadding ->
        Column(
            modifier = Modifier.padding(innerPadding),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(5.dp)
        ) {

            // 権限がなければ
            if (!isPermissionAllGranted.value) {
                Text(text = "権限が付与されていません")
                return@Scaffold
            }

            Button(onClick = onPeripheralClick) {
                Text(text = "ペリフェラル側になる")
            }

            Button(onClick = onCentralClick) {
                Text(text = "セントラル側になる")
            }
        }
    }
}
```

## UUID を決める
さて、次は`BLE`の`サービス`と`キャラクタリスティック`に割り当てる`UUID`を決めます。  
多分自分で作ったものを使えば良いはずです。被んないはずだし。

適当に2つ作ります。多分なにで作っても良いんですが、今回は`Kotlin Playground`とかいうブラウザから試せる`Kotlin`環境で作ります。  
特に理由はないですが、最近の`Kotlin`に`UUID`生成機能が入ったそうなので。いままでは`JVM 環境`なら`Java`のがあったけどそれ以外（`Kotlin/JS`とか）で動かしたい場合はまた考えないといけなかったので。マルチプラットフォームだ！

`Kotlin Playground`でこれを貼り付ければ良いはず。  
https://play.kotlinlang.org/

```kotlin
import kotlin.uuid.Uuid

/**
 * You can edit, run, and share this code.
 * play.kotlinlang.org
 */
fun main() {
    println(Uuid.random())
    println(Uuid.random())
}
```

![Imgur](https://imgur.com/jQBbNYv.png)

2つの値が出てくれば良いはず。  
上を`サービスの UUID`、下を`キャラクタリスティックの UUID`にします。

```plaintext
a1bf5691-1851-4d0c-bddd-cd5c9f516595
03f06708-4119-4841-893e-4de78b22c3d4
```

というわけで`UUID`を定義しておきましょう。  

```kotlin
/** BLE UUID 定数 */
object BleUuid {

    /** GATT サーバー サービスの UUID */
    val BLE_UUID_SERVICE = UUID.fromString("a1bf5691-1851-4d0c-bddd-cd5c9f516595")

    /** GATT サーバー キャラクタリスティックの UUID */
    val BLE_UUID_CHARACTERISTIC = UUID.fromString("03f06708-4119-4841-893e-4de78b22c3d4")

}
```

## ペリフェラル側（ホスト側）を作る
`GATT サーバー`と`アドバタイズ`機能を持つあれです。  
ペリフェラル側を担当するクラスを作ります。`BlePeripheralManager`みたいな。

まだ埋まってないところはこれから書きます

```kotlin
/**
 * BLE ペリフェラル側の処理をまとめたクラス
 *
 * @param onCharacteristicReadRequest キャラクタリスティックへ read が要求された（送り返す）
 * @param onCharacteristicWriteRequest キャラクタリスティックへ write が要求された（受信）
 */
class BlePeripheralManager(
    private val context: Context,
    private val onCharacteristicReadRequest: () -> ByteArray,
    private val onCharacteristicWriteRequest: (ByteArray) -> Unit
) {

    private val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    private val bluetoothLeAdvertiser = bluetoothManager.adapter.bluetoothLeAdvertiser
    
    /** アドバタイジングのコールバック */
    private val advertiseCallback = object : AdvertiseCallback() {
        override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
            super.onStartSuccess(settingsInEffect)
        }

        override fun onStartFailure(errorCode: Int) {
            super.onStartFailure(errorCode)
        }
    }

    /** GATT サーバー */
    private var bleGattServer: BluetoothGattServer? = null

    private val _connectedDeviceList = MutableStateFlow(emptyList<BluetoothDevice>())

    /** 接続中端末の配列 */
    val connectedDeviceList = _connectedDeviceList.asStateFlow()

    /** GATT サーバーとアドバタイジングするやつを開始する */
    fun start() {
        startGattServer()
        startAdvertising()
    }

    /** 終了する */
    fun destroy() {
        // このあとすぐ
    }

    private fun startGattServer() {
        // このあとすぐ
    }

    private fun startAdvertising() {
        // このあとすぐ
    }

}
```

### ペリフェラル側 GATT サーバーを作る
`startGattServer()`を実装します。  
キャラクタリスティックへ読み込み、書き込みが要求されたら呼ばれるコールバックを作り、サービス、キャラクタリスティックを登録すれば良いはず。  
また、`onConnectionStateChange()`なんかのコールバックを使えばいま接続中のデバイスの情報が取れたりします。接続中の端末数を表示させたい場合はこれ。

`onCharacteristicReadRequest`に関しては、多分一度には送り切れないのか、前回受信した位置までが`offset`に入っているので何らかの方法で指定バイト数をスキップする必要があります。  
今回は`ByteArrayInputStream`を使いました、**指定バイト数をスキップするためだけ**に使いました。多分オーバースペックな気がします。

キャラクタリスティックの`read / write`する値はこのクラスのコンストラクタ引数にある`onCharacteristicReadRequest / onCharacteristicWriteRequest`関数を取って、外から好きな用に渡せるようにしました。

権限チェックは無視しました、多分この画面に来る前に権限を付与してくれると思うので、、

```kotlin
@SuppressLint("MissingPermission") // TODO 権限チェックをする
private fun startGattServer() {
    bleGattServer = bluetoothManager.openGattServer(context, object : BluetoothGattServerCallback() {

        // セントラル側デバイスと接続したら
        // UI に表示するため StateFlow で通知する
        override fun onConnectionStateChange(device: BluetoothDevice?, status: Int, newState: Int) {
            super.onConnectionStateChange(device, status, newState)
            device ?: return
            when (newState) {
                BluetoothProfile.STATE_DISCONNECTED -> _connectedDeviceList.value -= _connectedDeviceList.value.first { it.address == device.address }
                BluetoothProfile.STATE_CONNECTED -> _connectedDeviceList.value += device
            }
        }

        // readCharacteristic が要求されたら呼ばれる
        // セントラルへ送信する
        override fun onCharacteristicReadRequest(device: BluetoothDevice?, requestId: Int, offset: Int, characteristic: BluetoothGattCharacteristic?) {
            super.onCharacteristicReadRequest(device, requestId, offset, characteristic)
            val sendByteArray = onCharacteristicReadRequest()
            // オフセットを考慮する
            // TODO バイト数スキップするのが面倒で ByteArrayInputStream 使ってるけど多分オーバースペック
            val sendOffsetByteArray = sendByteArray.inputStream().apply { skip(offset.toLong()) }.readBytes()
            bleGattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, sendOffsetByteArray)
        }

        // writeCharacteristic が要求されたら呼ばれる
        // セントラルから受信する
        override fun onCharacteristicWriteRequest(device: BluetoothDevice?, requestId: Int, characteristic: BluetoothGattCharacteristic?, preparedWrite: Boolean, responseNeeded: Boolean, offset: Int, value: ByteArray?) {
            super.onCharacteristicWriteRequest(device, requestId, characteristic, preparedWrite, responseNeeded, offset, value)
            value ?: return
            onCharacteristicWriteRequest(value)
            bleGattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, null)
        }
    })

    //サービスとキャラクタリスティックを作る
    val gattService = BluetoothGattService(BleUuid.BLE_UUID_SERVICE, BluetoothGattService.SERVICE_TYPE_PRIMARY)
    val gattCharacteristics = BluetoothGattCharacteristic(
        BleUuid.BLE_UUID_CHARACTERISTIC,
        BluetoothGattCharacteristic.PROPERTY_READ or BluetoothGattCharacteristic.PROPERTY_WRITE,
        BluetoothGattCharacteristic.PERMISSION_READ or BluetoothGattCharacteristic.PERMISSION_WRITE
    )
    // サービスにキャラクタリスティックを入れる
    gattService.addCharacteristic(gattCharacteristics)
    // GATT サーバーにサービスを追加
    bleGattServer?.addService(gattService)
}
```

### ペリフェラル側 アドバタイジングを作る
次はペリフェラル側に`GATT サーバー`があるということを報知するやつです。  
今回も今回とて権限チェックは無視しました、多分この画面に来る前に権限を付与してくれると思うので、、

```kotlin
@SuppressLint("MissingPermission") // TODO 権限チェック
private fun startAdvertising() {
    // アドバタイジング。これがないと見つけてもらえない
    val advertiseSettings = AdvertiseSettings.Builder().apply {
        setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_POWER)
        setTimeout(0)
    }.build()
    val advertiseData = AdvertiseData.Builder().apply {
        addServiceUuid(ParcelUuid(BleUuid.BLE_UUID_SERVICE))
    }.build()
    // アドバタイジング開始
    bluetoothLeAdvertiser.startAdvertising(advertiseSettings, advertiseData, advertiseCallback)
}
```

### ペリフェラル側 終了処理
`GATT サーバー`、`アドバタイジング`を終了させる処理です。

```kotlin
/** 終了する */
@SuppressLint("MissingPermission")
fun destroy() {
    bleGattServer?.close()
    bluetoothLeAdvertiser.stopAdvertising(advertiseCallback)
}
```

### ペリフェラル側 ここまで

```kotlin
/**
 * BLE ペリフェラル側の処理をまとめたクラス
 *
 * @param onCharacteristicReadRequest キャラクタリスティックへ read が要求された（送り返す）
 * @param onCharacteristicWriteRequest キャラクタリスティックへ write が要求された（受信）
 */
class BlePeripheralManager(
    private val context: Context,
    private val onCharacteristicReadRequest: () -> ByteArray,
    private val onCharacteristicWriteRequest: (ByteArray) -> Unit
) {

    private val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
    private val bluetoothLeAdvertiser = bluetoothManager.adapter.bluetoothLeAdvertiser

    /** アドバタイジングのコールバック */
    private val advertiseCallback = object : AdvertiseCallback() {
        override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
            super.onStartSuccess(settingsInEffect)
        }

        override fun onStartFailure(errorCode: Int) {
            super.onStartFailure(errorCode)
        }
    }

    /** GATT サーバー */
    private var bleGattServer: BluetoothGattServer? = null

    private val _connectedDeviceList = MutableStateFlow(emptyList<BluetoothDevice>())

    /** 接続中端末の配列 */
    val connectedDeviceList = _connectedDeviceList.asStateFlow()

    /** GATT サーバーとアドバタイジングするやつを開始する */
    fun start() {
        startGattServer()
        startAdvertising()
    }

    /** 終了する */
    @SuppressLint("MissingPermission")
    fun destroy() {
        bleGattServer?.close()
        bluetoothLeAdvertiser.stopAdvertising(advertiseCallback)
    }

    @SuppressLint("MissingPermission") // TODO 権限チェックをする
    private fun startGattServer() {
        bleGattServer = bluetoothManager.openGattServer(context, object : BluetoothGattServerCallback() {

            // セントラル側デバイスと接続したら
            // UI に表示するため StateFlow で通知する
            override fun onConnectionStateChange(device: BluetoothDevice?, status: Int, newState: Int) {
                super.onConnectionStateChange(device, status, newState)
                device ?: return
                when (newState) {
                    BluetoothProfile.STATE_DISCONNECTED -> _connectedDeviceList.value -= _connectedDeviceList.value.first { it.address == device.address }
                    BluetoothProfile.STATE_CONNECTED -> _connectedDeviceList.value += device
                }
            }

            // readCharacteristic が要求されたら呼ばれる
            // セントラルへ送信する
            override fun onCharacteristicReadRequest(device: BluetoothDevice?, requestId: Int, offset: Int, characteristic: BluetoothGattCharacteristic?) {
                super.onCharacteristicReadRequest(device, requestId, offset, characteristic)
                val sendByteArray = onCharacteristicReadRequest()
                // オフセットを考慮する
                // TODO バイト数スキップするのが面倒で ByteArrayInputStream 使ってるけど多分オーバースペック
                val sendOffsetByteArray = sendByteArray.inputStream().apply { skip(offset.toLong()) }.readBytes()
                bleGattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, sendOffsetByteArray)
            }

            // writeCharacteristic が要求されたら呼ばれる
            // セントラルから受信する
            override fun onCharacteristicWriteRequest(device: BluetoothDevice?, requestId: Int, characteristic: BluetoothGattCharacteristic?, preparedWrite: Boolean, responseNeeded: Boolean, offset: Int, value: ByteArray?) {
                super.onCharacteristicWriteRequest(device, requestId, characteristic, preparedWrite, responseNeeded, offset, value)
                value ?: return
                onCharacteristicWriteRequest(value)
                bleGattServer?.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, null)
            }
        })

        //サービスとキャラクタリスティックを作る
        val gattService = BluetoothGattService(BleUuid.BLE_UUID_SERVICE, BluetoothGattService.SERVICE_TYPE_PRIMARY)
        val gattCharacteristics = BluetoothGattCharacteristic(
            BleUuid.BLE_UUID_CHARACTERISTIC,
            BluetoothGattCharacteristic.PROPERTY_READ or BluetoothGattCharacteristic.PROPERTY_WRITE,
            BluetoothGattCharacteristic.PERMISSION_READ or BluetoothGattCharacteristic.PERMISSION_WRITE
        )
        // サービスにキャラクタリスティックを入れる
        gattService.addCharacteristic(gattCharacteristics)
        // GATT サーバーにサービスを追加
        bleGattServer?.addService(gattService)
    }

    @SuppressLint("MissingPermission") // TODO 権限チェック
    private fun startAdvertising() {
        // アドバタイジング。これがないと見つけてもらえない
        val advertiseSettings = AdvertiseSettings.Builder().apply {
            setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_POWER)
            setTimeout(0)
        }.build()
        val advertiseData = AdvertiseData.Builder().apply {
            addServiceUuid(ParcelUuid(BleUuid.BLE_UUID_SERVICE))
        }.build()
        // アドバタイジング開始
        bluetoothLeAdvertiser.startAdvertising(advertiseSettings, advertiseData, advertiseCallback)
    }

}
```

### ペリフェラル側の画面を完成させる
さっき作った`BlePeripheralManager`をインスタンス化し、`Jetpack Compose`で適当に`UI`を作ります。  
キャラクタリスティックの`read`で送り返す値を入力するテキストフィールドと、`write`で送られてきた値を表示する`Text()`。

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PeripheralScreen() {
    val context = LocalContext.current

    val readRequestText = remember { mutableStateOf(Build.MODEL) }
    val writeRequestList = remember { mutableStateOf(emptyList<String>()) }

    val peripheralManager = remember {
        BlePeripheralManager(
            context = context,
            onCharacteristicReadRequest = { readRequestText.value.toByteArray(Charsets.UTF_8) },
            onCharacteristicWriteRequest = { writeRequestList.value += it.toString(Charsets.UTF_8) }
        )
    }
    val connectedDeviceList = peripheralManager.connectedDeviceList.collectAsState()

    // 開始・終了処理
    DisposableEffect(key1 = Unit) {
        peripheralManager.start()
        onDispose { peripheralManager.destroy() }
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text(text = "BLE ペリフェラル") }) }
    ) { innerPadding ->
        Column(
            modifier = Modifier.padding(innerPadding),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(5.dp)
        ) {

            Text(
                text = "キャラクタリスティック read で送り返す値",
                fontSize = 20.sp
            )
            OutlinedTextField(
                modifier = Modifier.fillMaxWidth(),
                value = readRequestText.value,
                onValueChange = { readRequestText.value = it },
                singleLine = true
            )

            HorizontalDivider()

            Text(
                text = "接続中デバイス数：${connectedDeviceList.value.size}",
                fontSize = 20.sp
            )

            HorizontalDivider()

            Text(
                text = "キャラクタリスティック write で受信した値",
                fontSize = 20.sp
            )
            writeRequestList.value.forEach { writeText ->
                Text(text = writeText)
            }

        }
    }
}
```

## セントラル側（ゲスト側）を作る
多分こっちのがコールバック地獄でしんどい気がする。コルーチンで幸せになろう。  
どうしてクライアント側のがつらいんですか？（ここに電話猫の画像を貼る）

まずはクラスを作ります。空の関数はこのあとすぐ実装していきます。

```kotlin
/** BLE デバイスへ接続し GATT サーバーへ接続しサービスを探しキャラクタリスティックを操作する */
class BleCentralManager(private val context: Context) {

    private val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager

    /** [readCharacteristic]等で使いたいので */
    private val _bluetoothGatt = MutableStateFlow<BluetoothGatt?>(null)

    /** コールバックの返り値をコルーチン側から受け取りたいので */
    private val _characteristicReadChannel = Channel<ByteArray>()

    /** 接続中かどうか */
    val isConnected = _bluetoothGatt.map { it != null }

    suspend fun connect(){
        // このあとすぐ
    }

    suspend fun readCharacteristic(): ByteArray {
        // このあとすぐ
    }

    suspend fun writeCharacteristic(sendData: ByteArray) {
        // このあとすぐ
    }

    fun destroy() {
        // このあとすぐ
    }
}
```

### セントラル側 BLE デバイスを見つける
まずはデバイスを探す処理です。  
`GATT サーバー`の`UUID`を指定してすることでアドバタイジングしてるやつが引っかかり、コールバックが呼ばれます。  
コールバックしんどいのでコルーチンでいい感じに同期っぽく書きます。ちなみに`IoT`端末相手の場合は`UUID`指定よりも`MACアドレス`指定を使ってそう？

```kotlin
suspend fun connect() {
    // GATT サーバーのサービスを元に探す
    val bleDevice = findBleDevice() ?: return
}

@SuppressLint("MissingPermission")
private suspend fun findBleDevice() = suspendCancellableCoroutine { continuation ->
    val bluetoothLeScanner = bluetoothManager.adapter.bluetoothLeScanner
    val bleScanCallback = object : ScanCallback() {
        override fun onScanResult(callbackType: Int, result: ScanResult?) {
            super.onScanResult(callbackType, result)
            // 見つけたら返して、スキャンも終了させる
            continuation.resume(result?.device)
            bluetoothLeScanner.stopScan(this)
        }

        override fun onScanFailed(errorCode: Int) {
            super.onScanFailed(errorCode)
            continuation.resume(null)
        }
    }

    // GATT サーバーのサービス UUID を指定して検索を始める
    val scanFilter = ScanFilter.Builder().apply {
        setServiceUuid(ParcelUuid(BleUuid.BLE_UUID_SERVICE))
    }.build()
    bluetoothLeScanner.startScan(
        listOf(scanFilter),
        ScanSettings.Builder().build(),
        bleScanCallback
    )

    continuation.invokeOnCancellation {
        bluetoothLeScanner.stopScan(bleScanCallback)
    }
}
```

### セントラル側 GATT サーバーへ接続する
このあたりから辛くなってくるらしい。  
うまくいくとこれで動くらしい。まずは`connectGatt()`を呼び出して`GATT サーバー`へ接続したあと、`onConnectionStateChange()`コールバックを待ちます。  
このコールバックで接続に成功したことが分かれば、`discoverServices()`を呼び出しサービスを探します。  
サービスが見つかると、`onServicesDiscovered()`コールバックが呼ばれるので、ようやくキャラクタリスティックへ操作ができるようになります。

で、で、で、`_bluetoothGatt`、なんで`MutableStateFlow`に`BluetoothGatt`を入れているのか？という話はこの後します。  
`_characteristicReadChannel`もそうです。

```kotlin
@SuppressLint("MissingPermission")
suspend fun connect() {
    // GATT サーバーのサービスを元に探す
    val bleDevice = findBleDevice() ?: return

    // GATT サーバーへ接続する
    bleDevice.connectGatt(context, false, object : BluetoothGattCallback() {

        // 接続できたらサービスを探す
        override fun onConnectionStateChange(gatt: BluetoothGatt?, status: Int, newState: Int) {
            super.onConnectionStateChange(gatt, status, newState)
            when (newState) {
                // 接続できたらサービスを探す
                BluetoothProfile.STATE_CONNECTED -> gatt?.discoverServices()
                // なくなった
                BluetoothProfile.STATE_DISCONNECTED -> _bluetoothGatt.value = null
            }
        }

        // discoverServices() でサービスが見つかった
        override fun onServicesDiscovered(gatt: BluetoothGatt?, status: Int) {
            super.onServicesDiscovered(gatt, status)
            // Flow に BluetoothGatt を入れる
            _bluetoothGatt.value = gatt
        }

        // onCharacteristicReadRequest で送られてきたデータを受け取る
        override fun onCharacteristicRead(gatt: BluetoothGatt, characteristic: BluetoothGattCharacteristic, value: ByteArray, status: Int) {
            super.onCharacteristicRead(gatt, characteristic, value, status)
            _characteristicReadChannel.trySend(value)
        }

        // Android 12 ？以前はこっちを実装する必要あり
        override fun onCharacteristicRead(gatt: BluetoothGatt?, characteristic: BluetoothGattCharacteristic?, status: Int) {
            super.onCharacteristicRead(gatt, characteristic, status)
            _characteristicReadChannel.trySend(characteristic?.value ?: byteArrayOf())
        }
    })
}
```

### セントラル側 キャラクタリスティックへ read する
ペリフェラル側から値を読み出す処理を書きます。  

で、なんで一部の値を`Flow`で扱っているかというと、接続し終わった後に`read`するとかいう制御が面倒そう。  
かわりに、`MutableStateFlow`に値が入ってくるまで待つような処理にすれば、まだ接続が成功していなくても、この関数の呼び出しが出来るようになります。  

また、`read`の結果を`connectGatt()`のコールバックから受け取る必要があるんだけど、できればこの関数の返り値として`read`の結果がほしい。  
そこで、`Coroutines`の`Channel()`を使い、サスペンド関数を超えて値の送受信が出来るようにして、コールバックの値をこの関数の`return`で返せるようにしました。  
（コールバック側はサスペンド関数じゃないのでサスペンド関数間ではないんですがまあ）

`Channel`ってこうやって使うんかなあ、、ってのと多分説明下手で伝わってない。

```kotlin
@SuppressLint("MissingPermission")
suspend fun readCharacteristic(): ByteArray {
    // GATT サーバーとの接続を待つ
    // Flow に値が入ってくるまで（onServicesDiscovered() で入れている）一時停止する。コルーチン便利
    val gatt = _bluetoothGatt.filterNotNull().first()
    // GATT サーバーへ狙ったサービス内にあるキャラクタリスティックへ read を試みる
    val findService = gatt.services?.first { it.uuid == BleUuid.BLE_UUID_SERVICE }
    val findCharacteristic = findService?.characteristics?.first { it.uuid == BleUuid.BLE_UUID_CHARACTERISTIC }
    // 結果は onCharacteristicRead で
    gatt.readCharacteristic(findCharacteristic)
    return _characteristicReadChannel.receive()
}
```

### セントラル側 キャラクタリスティックへ write する
こっちも同様に`Flow`で接続待ちをするようにします。  
`Android 12`以前でも使いたい場合は分岐して古い方を使う必要があります。

```kotlin
@SuppressLint("MissingPermission")
suspend fun writeCharacteristic(sendData: ByteArray) {
    // GATT サーバーとの接続を待つ
    val gatt = _bluetoothGatt.filterNotNull().first()
    // GATT サーバーへ狙ったサービス内にあるキャラクタリスティックへ write を試みる
    val findService = gatt.services?.first { it.uuid == BleUuid.BLE_UUID_SERVICE } ?: return
    val findCharacteristic = findService.characteristics?.first { it.uuid == BleUuid.BLE_UUID_CHARACTERISTIC } ?: return
    // 結果は onCharacteristicWriteRequest で
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        gatt.writeCharacteristic(findCharacteristic, sendData, BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT)
    } else {
        findCharacteristic.setValue(sendData)
        gatt.writeCharacteristic(findCharacteristic)
    }
}
```

### セントラル側 終了処理
使い終わったときに呼び出す処理です。

```kotlin
@SuppressLint("MissingPermission")
fun destroy() {
    _bluetoothGatt.value?.close()
}
```

### セントラル側 ここまで

```kotlin
/** BLE デバイスへ接続し GATT サーバーへ接続しサービスを探しキャラクタリスティックを操作する */
class BleCentralManager(private val context: Context) {

    private val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager

    /** [readCharacteristic]等で使いたいので */
    private val _bluetoothGatt = MutableStateFlow<BluetoothGatt?>(null)

    /** コールバックの返り値をコルーチン側から受け取りたいので */
    private val _characteristicReadChannel = Channel<ByteArray>()

    /** 接続中かどうか */
    val isConnected = _bluetoothGatt.map { it != null }

    /** デバイスを探し、GATT サーバーへ接続する */
    @SuppressLint("MissingPermission")
    suspend fun connect() {
        // GATT サーバーのサービスを元に探す
        val bleDevice = findBleDevice() ?: return

        // GATT サーバーへ接続する
        bleDevice.connectGatt(context, false, object : BluetoothGattCallback() {

            // 接続できたらサービスを探す
            override fun onConnectionStateChange(gatt: BluetoothGatt?, status: Int, newState: Int) {
                super.onConnectionStateChange(gatt, status, newState)
                when (newState) {
                    // 接続できたらサービスを探す
                    BluetoothProfile.STATE_CONNECTED -> gatt?.discoverServices()
                    // なくなった
                    BluetoothProfile.STATE_DISCONNECTED -> _bluetoothGatt.value = null
                }
            }

            // discoverServices() でサービスが見つかった
            override fun onServicesDiscovered(gatt: BluetoothGatt?, status: Int) {
                super.onServicesDiscovered(gatt, status)
                // Flow に BluetoothGatt を入れる
                _bluetoothGatt.value = gatt
            }

            // onCharacteristicReadRequest で送られてきたデータを受け取る
            override fun onCharacteristicRead(gatt: BluetoothGatt, characteristic: BluetoothGattCharacteristic, value: ByteArray, status: Int) {
                super.onCharacteristicRead(gatt, characteristic, value, status)
                _characteristicReadChannel.trySend(value)
            }

            // Android 12 ？以前はこっちを実装する必要あり
            override fun onCharacteristicRead(gatt: BluetoothGatt?, characteristic: BluetoothGattCharacteristic?, status: Int) {
                super.onCharacteristicRead(gatt, characteristic, status)
                _characteristicReadChannel.trySend(characteristic?.value ?: byteArrayOf())
            }
        })
    }

    /** キャラクタリスティックへ read する */
    @SuppressLint("MissingPermission")
    suspend fun readCharacteristic(): ByteArray {
        // GATT サーバーとの接続を待つ
        // Flow に値が入ってくるまで（onServicesDiscovered() で入れている）一時停止する。コルーチン便利
        val gatt = _bluetoothGatt.filterNotNull().first()
        // GATT サーバーへ狙ったサービス内にあるキャラクタリスティックへ read を試みる
        val findService = gatt.services?.first { it.uuid == BleUuid.BLE_UUID_SERVICE }
        val findCharacteristic = findService?.characteristics?.first { it.uuid == BleUuid.BLE_UUID_CHARACTERISTIC }
        // 結果は onCharacteristicRead で
        gatt.readCharacteristic(findCharacteristic)
        return _characteristicReadChannel.receive()
    }

    /** キャラクタリスティックへ write する */
    @SuppressLint("MissingPermission")
    suspend fun writeCharacteristic(sendData: ByteArray) {
        // GATT サーバーとの接続を待つ
        val gatt = _bluetoothGatt.filterNotNull().first()
        // GATT サーバーへ狙ったサービス内にあるキャラクタリスティックへ write を試みる
        val findService = gatt.services?.first { it.uuid == BleUuid.BLE_UUID_SERVICE } ?: return
        val findCharacteristic = findService.characteristics?.first { it.uuid == BleUuid.BLE_UUID_CHARACTERISTIC } ?: return
        // 結果は onCharacteristicWriteRequest で
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            gatt.writeCharacteristic(findCharacteristic, sendData, BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT)
        } else {
            findCharacteristic.setValue(sendData)
            gatt.writeCharacteristic(findCharacteristic)
        }
    }

    /** 終了する */
    @SuppressLint("MissingPermission")
    fun destroy() {
        _bluetoothGatt.value?.close()
    }

    @SuppressLint("MissingPermission")
    private suspend fun findBleDevice() = suspendCancellableCoroutine { continuation ->
        val bluetoothLeScanner = bluetoothManager.adapter.bluetoothLeScanner
        val bleScanCallback = object : ScanCallback() {
            override fun onScanResult(callbackType: Int, result: ScanResult?) {
                super.onScanResult(callbackType, result)
                // 見つけたら返して、スキャンも終了させる
                continuation.resume(result?.device)
                bluetoothLeScanner.stopScan(this)
            }

            override fun onScanFailed(errorCode: Int) {
                super.onScanFailed(errorCode)
                continuation.resume(null)
            }
        }

        // GATT サーバーのサービス UUID を指定して検索を始める
        val scanFilter = ScanFilter.Builder().apply {
            setServiceUuid(ParcelUuid(BleUuid.BLE_UUID_SERVICE))
        }.build()
        bluetoothLeScanner.startScan(
            listOf(scanFilter),
            ScanSettings.Builder().build(),
            bleScanCallback
        )

        continuation.invokeOnCancellation {
            bluetoothLeScanner.stopScan(bleScanCallback)
        }
    }
}
```

### セントラル側の画面も完成させる
ペリフェラル側同様、インスタンス化し、`キャラクタリスティック`へ`read`するボタンと`write`するテキストフィールドと送信ボタンを置きます。  
ペリフェラル側と違って明示的に`read / write`ボタンを置く必要があります。

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CentralScreen() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val centralManager = remember { BleCentralManager(context) }
    val isConnected = centralManager.isConnected.collectAsState(initial = false)
    val writeRequestText = remember { mutableStateOf(Build.MODEL) }
    val readRequestList = remember { mutableStateOf(emptyList<String>()) }

    DisposableEffect(key1 = Unit) {
        scope.launch { centralManager.connect() }
        onDispose { centralManager.destroy() }
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text(text = "BLE セントラル") }) }
    ) { innerPadding ->
        Column(
            modifier = Modifier.padding(innerPadding),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(5.dp)
        ) {

            // 接続中ならくるくる
            if (!isConnected.value) {
                CircularProgressIndicator()
                Text(text = "接続中です")
                return@Scaffold
            }

            Text(
                text = "キャラクタリスティック write で送信する値",
                fontSize = 20.sp
            )
            Row {
                OutlinedTextField(
                    modifier = Modifier.weight(1f),
                    value = writeRequestText.value,
                    onValueChange = { writeRequestText.value = it },
                    singleLine = true
                )
                Button(
                    onClick = {
                        scope.launch {
                            centralManager.writeCharacteristic(writeRequestText.value.toByteArray(Charsets.UTF_8))
                        }
                    }
                ) {
                    Text(text = "送信")
                }
            }
            HorizontalDivider()

            Text(
                text = "キャラクタリスティック read で読み出した値",
                fontSize = 20.sp
            )
            Button(onClick = {
                scope.launch {
                    readRequestList.value += centralManager.readCharacteristic().toString(Charsets.UTF_8)
                }
            }) {
                Text(text = "読み出す")
            }
            readRequestList.value.forEach { readText ->
                Text(text = readText)
            }
        }
    }
}
```

# 使ってみる
1台をペリフェラル、もう1台をセントラルにして、接続できるまで待ちます。（デバイス数が増えていること、くるくるが消えていること）  
接続すると、セントラル側からペリフェラルの値を`read`したり、ペリフェラル側に`write`出来るようになるはずです。

![Imgur](https://imgur.com/B7IxEjX.png)

![Imgur](https://imgur.com/xnfDAhW.png)

動いたかな。  

**手持ちのまともに動く端末を総動員させた画像がこれです。**  
1台のペリフェラルのキャラクタリスティック対して`read / write`出来てそうです。

![Imgur](https://imgur.com/KhX2eVq.png)

冒頭で話した通り、今回は文字列を`read / write`しているわけですが別に文字列に限ったことはなく、バイト配列にエンコードデコードできる場合はやり取りできるはずです、  
`BLE`なので小さいデータしか送れないとは思いますが。

# そーすこーど
どうぞ

https://github.com/takusan23/AndroidBlePeripheralCentralSample

# なぞ
なぜか誰も接続していないのに**謎に 1 台接続済み**の表示になってしまった。コードがミスってる可能性もある。  
`Bluetooth`のオンオフを試すと直るけどかなり最終手段。

# おわりに
ペリフェラル、セントラル両方とも`Android`だったのでつらみはあんまりなかった？（`API`がコールバックの連続だってのはしんどい）  
それよりも古い`Android`バージョンに対応させたい場合は多分非推奨の方を使う必要がある。  

以上でつ。8888888