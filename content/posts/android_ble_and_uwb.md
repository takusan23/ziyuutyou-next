---
title: Android で UWB を使ってお互いの位置を知る
created_at: 2024-12-05
tags:
- Android
- Kotlin
- UWB
- BLE
---
どうもこんばんわ。  
シークレットラブ（仮） 攻略しました。涼しそうな制服ですねって言おうとしたらもう寒い時期。  
それはそれとして今作の HOOK 結構おもしろかった。セーブ枠が足りない。あとえちえちだった。

![Imgur](https://imgur.com/AMgt8sa.png)

今作は特にみんなかわいい、しかもきれい。買う前と共通やった後で誰から攻略するか変わった。  

![Imgur](https://imgur.com/w6dNJJu.png)

![Imgur](https://imgur.com/DNK4xAB.png)

ハルちゃんのここのシナリオすき、>< かわいい  

![Imgur](https://imgur.com/BL5WXMy.png)

![Imgur](https://imgur.com/A3pbrk4.png)

顔が良すぎる

こちら後輩ちゃんです。売り文句どおりえちえちだった。。  

![Imgur](https://imgur.com/FLsYRbu.png)

楓ちゃんルートが一番おもしろいかもしれん！

![Imgur](https://imgur.com/Yn3xXTx.png)

![Imgur](https://imgur.com/21vPKZt.png)

![Imgur](https://imgur.com/Sgvmcgm.png)

でもやっぱちあきちゃんが一番良かったかも  
！？！？

![Imgur](https://imgur.com/hMivHap.png)

ん～

![Imgur](https://imgur.com/qswxNxq.png)

![Imgur](https://imgur.com/UojM6gl.png)

それはそれとして、他のヒロイン選んだときに真っ先にちあきちゃん飛んでくるのが心に来る

![Imgur](https://imgur.com/I1YDTrA.png)

だから最後にするといいのかな、ﾖｶｯﾀ

![Imgur](https://imgur.com/PRtvrDL.png)

あとはオープンルートのが掛け合いがあるので面白かったけどクローズドの方にも好きなシナリオあるから一概に言えない！！

![Imgur](https://imgur.com/VUQ0s1h.png)

![Imgur](https://imgur.com/sPyf4fZ.png)

↑ここすき

いい！！とてもいいです。おすすすすめです

![Imgur](https://imgur.com/6xq6YLf.png)

# 本題
`Pixel 6 Pro`以降の`Pro`モデルには`UWB アンテナ`が搭載されていて？、`API`も用意されているわけですがあんまり情報がないので、  
今回は試しに`UWB`の`API`を使ってお互いの位置を見れるアプリを作ってみようと思います。  

なんなら`UWB`あるのが忘れられている可能性・・・？

# 公式
まじでこれしか無い。  
なんなら2つ目の`YouTube`の動画のほうが詳しく話してる。

- https://developer.android.com/develop/connectivity/uwb
- https://www.youtube.com/watch?v=8X_9no-9tCg
- https://github.com/android/connectivity-samples/tree/main/UwbRanging

# UWB とは
近くの端末と通信する技術で、他のそれと違ってかなり正確な位置検出が出来る。位置測定に関してはセンチメートルの単位で報告される。（体感`10cm`前後くらいの誤差）  
あとは高速通信があるらしいですが、今のところ`Android`の`UWB`にはデータ通信の`API`は無さそう？  
ドキュメントを見る限り位置情報に関してしか無い。

# UWB どこで使ってるの
`ニアバイシェア`の際に共有する端末に近付けると勝手に転送が始まる。端末を選ぶ作業がスキップされる。  
あとは・・・

# UWB 誰もやってない
しかし`UWB`を試すには地味にハードルが高い。

## UWB 対応端末を2台用意する必要がある
https://developer.android.com/develop/connectivity/uwb#uwb-enabled_mobile_devices

多分これのせい。  
今のところ`Pixel`の`Pro`シリーズと`Galaxy`には搭載されているそう。  
・・・高い。

## UWB は通信する機能しかなく、発見する別の仕組みが必要
どういうことかというと携帯電話を持っていても相手の電話番号が分からなければ電話をかけることが出来ない。  
`UWB`も同じで、`UWB`通信を開始するためのパラメーターを**何らかの方法**でお互いに送受信する必要があり、これも地味にハードルが高い。  

それこそ例えば、前回の記事でやった`Bluetooth Low Energy`の`キャラクタリスティック`で読み書きしパラメーターを交換する必要がある。  
`UWB`のパラメーターも多分そんな複雑じゃないからキーボードで打ち込んでもらうでも最悪いいはず。

# 環境
今回は`Pixel 6 Pro`と`Pixel 8 Pro`があるのでそれを使います。  
あと`UWB`のライブラリが`Kotlin Coroutines Flow`を使っているので`Kotlin`です。`Jetpack Compose`使いたいのでそれはそう。  

`UWB`自体は`Flow`か`Rx`のどっちか選べるらしい。`Flow`しかわからん無いのでそっちで。

|                |                                         |
|----------------|-----------------------------------------|
| 端末           | Pixel 6 Pro / Pixel 8 Pro               |
| Android Studio | Android Studio Ladybug 2024.2.1 Patch 2 |
| targetSdk      | 31 ?                                    |
| そのほか       | `Jetpack Compose + Navigation Compose`  |
| 言語           | Kotlin                                  |

# 今回の作戦
`UWB`でお互いに交換する必要があるパラメーターは`data class`に詰めて`Serializable`にした後`BLE`経由で交換します。  
`BLE`でやり取りする話は前回の記事でやったので今回は手短にします。

https://takusan.negitoro.dev/posts/android_ble_peripheral_central/

ちなみに`Google`が書いた`UWB`サンプルコードは`Nearby API`で交換してるっぽい。  
ただ、`Nearby API`には`API キー`の払い出しが必要なはずでそれはそれで面倒。  

https://github.com/android/connectivity-samples/tree/main/UwbRanging

## 流れ
なので、流れとしては、  

- 2台のうちどっちかが`Controller`になり、もう片方が`Controlee`になる
- `UWB`接続に必要なパラメーターを受け取り、`BLE`の`キャラクタリスティック`に読み書きして交換する
- お互い相手の情報を知ったうえで`UWB`を開始する

後述しますが、親→子は複数の値を渡す必要がある、逆に子→親は自分のアドレス（`ByteArray`）を渡すだけなので楽。  
![Imgur](https://imgur.com/uL9Mg0s.png)

# つくる
`Jetpack Compose`で適当にプロジェクトを作ってください。

## 必要なライブラリを入れる
`app/build.gradle.kts`に`UWB`のライブラリと`navigation-compose`を入れてね。バージョンカタログ入ってるならそっちに書くべきです。  
何故か`UWB`は`Android Jetpack`からの提供になります。普通に`getSystemService()`するもんだと思ってたら違った。

```kotlin
dependencies {

    // UWB
    implementation("androidx.core.uwb:uwb:1.0.0-alpha09")
    
    // navigation compose
    implementation("androidx.navigation:navigation-compose:2.8.4")

    // 以下省略
```

## 権限を書く
まじで情報がさっきの`YouTube`とサンプルコードくらいしか無いんですが、多分`android.permission.UWB_RANGING`ってのが必要。  
後は`BLE`のための権限が続きます。

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Bluetooth Low Energy -->
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

    <!-- UWB -->
    <uses-permission android:name="android.permission.UWB_RANGING" />

```

## MainActivity
で`Navigation Compose`のアレコレをします。  
各画面はまだ作ってないのでエラーになると思います。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidBleAndUwbSampleTheme {
                MainScreen()
            }
        }
    }
}

@Composable
private fun MainScreen() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "home") {
        composable("home") {
            HomeScreen(
                onControllerClick = { navController.navigate("controller") },
                onControleeClick = { navController.navigate("controlee") }
            )
        }
        composable("controller") {
            ControllerScreen()
        }
        composable("controlee") {
            ControleeScreen()
        }
    }
}
```

## 最初の権限ください画面
`BLE`のそれと同じなので解説はコードのコメントくらいしか無いです。  
`Controller側`（親機側）になるか、`Controlee側`（子機側）になるかを選べる画面です。

```kotlin
private val REQUIRED_PERMISSION = listOf(
    android.Manifest.permission.BLUETOOTH,
    android.Manifest.permission.BLUETOOTH_CONNECT,
    android.Manifest.permission.BLUETOOTH_SCAN,
    android.Manifest.permission.BLUETOOTH_ADVERTISE,
    android.Manifest.permission.ACCESS_COARSE_LOCATION,
    android.Manifest.permission.ACCESS_FINE_LOCATION,
    android.Manifest.permission.UWB_RANGING
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onControllerClick: () -> Unit,
    onControleeClick: () -> Unit
) {
    val context = LocalContext.current
    val isGranted = remember {
        mutableStateOf(REQUIRED_PERMISSION.all { ContextCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED })
    }

    val permissionRequest = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions(),
        onResult = { isGranted.value = it.all { it.value } }
    )

    LaunchedEffect(key1 = Unit) {
        // 権限をリクエスト
        permissionRequest.launch(REQUIRED_PERMISSION.toTypedArray())
    }

    Scaffold(
        topBar = {
            TopAppBar(title = { Text(text = "権限ください") })
        }
    ) { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding)) {

            // 権限が付与されるまでボタンを出さない
            if (!isGranted.value) {
                Text(text = "権限が付与されていません")
                return@Scaffold
            }

            // 画面遷移用
            Button(onClick = onControllerClick) {
                Text(text = "Controller (Host)")
            }
            Button(onClick = onControleeClick) {
                Text(text = "Controlee (Guest)")
            }
        }
    }
}
```

![Imgur](https://imgur.com/38eotVr.png)

![Imgur](https://imgur.com/Kf1NdE4.png)

## BLE 周りを作る
さて、先に`BLE`で`UWB`開始に必要なパラメーター交換周りを作ります。  
詳しくは前回の`BLE`で`ペリフェラル、セントラル`を試す記事を読んでください。

再掲：  
https://takusan.negitoro.dev/posts/android_ble_peripheral_central/

## GATT のサービスとキャラクタリスティックの UUID
を適当に作ったのでそれを使います。

```kotlin
/** BLE で使う UUID */
object BleUuid {

    /** GATT サービスの UUID */
    val GATT_SERVICE_UUID = UUID.fromString("107c9e9b-bf6d-4b64-ab30-0bd96fdd2537")
    
    /** GATT キャラクタリスティックの UUID */
    val GATT_CHARACTERISTIC_UUID = UUID.fromString("e42ba363-eeaa-4e46-b7aa-049c19341f24")

}
```

## BLE ペリフェラル側のコード
これも前回の記事でやったので。。  

```kotlin
/** BLE ペリフェラル側のコード */
object BlePeripheral {

    /**
     * ペリフェラル側に必要な GATT サーバーとアドバタイジングを開始する。
     * コルーチンをキャンセルすると終了する。
     *
     * @param context [Context]
     * @param onCharacteristicReadRequest セントラルからキャラクタリスティックに対して read 要求された時
     * @param onCharacteristicWriteRequest セントラルからキャラクタリスティックに対して write 要求された時
     */
    suspend fun startPeripheralAndAdvertising(
        context: Context,
        onCharacteristicReadRequest: () -> ByteArray,
        onCharacteristicWriteRequest: (ByteArray) -> Unit
    ) {
        coroutineScope {
            launch {
                suspendGattServer(context, onCharacteristicReadRequest, onCharacteristicWriteRequest)
            }
            launch {
                suspendAdvertisement(context)
            }
        }
    }

    @SuppressLint("MissingPermission")
    private suspend fun suspendGattServer(
        context: Context,
        onCharacteristicReadRequest: () -> ByteArray,
        onCharacteristicWriteRequest: (ByteArray) -> Unit
    ) {
        val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager

        var bleGattServer: BluetoothGattServer? = null
        bleGattServer = bluetoothManager.openGattServer(context, object : BluetoothGattServerCallback() {
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
        val gattService = BluetoothGattService(BleUuid.GATT_SERVICE_UUID, BluetoothGattService.SERVICE_TYPE_PRIMARY)
        val gattCharacteristics = BluetoothGattCharacteristic(
            BleUuid.GATT_CHARACTERISTIC_UUID,
            BluetoothGattCharacteristic.PROPERTY_READ or BluetoothGattCharacteristic.PROPERTY_WRITE,
            BluetoothGattCharacteristic.PERMISSION_READ or BluetoothGattCharacteristic.PERMISSION_WRITE
        )
        // サービスに Characteristic を入れる
        gattService.addCharacteristic(gattCharacteristics)
        // GATT サーバーにサービスを追加
        bleGattServer?.addService(gattService)

        // キャンセルしたら終了
        try {
            awaitCancellation()
        } finally {
            bleGattServer?.close()
        }
    }

    @SuppressLint("MissingPermission")
    private suspend fun suspendAdvertisement(context: Context) {
        val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        val bluetoothLeAdvertiser = bluetoothManager.adapter.bluetoothLeAdvertiser

        // アドバタイジング。これがないと見つけてもらえない
        val advertiseSettings = AdvertiseSettings.Builder().apply {
            setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_POWER)
            setTimeout(0)
        }.build()
        val advertiseData = AdvertiseData.Builder().apply {
            addServiceUuid(ParcelUuid(BleUuid.GATT_SERVICE_UUID))
        }.build()
        // アドバタイジング開始
        val advertiseCallback = object : AdvertiseCallback() {
            override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
                super.onStartSuccess(settingsInEffect)
            }

            override fun onStartFailure(errorCode: Int) {
                super.onStartFailure(errorCode)
            }
        }
        bluetoothLeAdvertiser.startAdvertising(advertiseSettings, advertiseData, advertiseCallback)

        // キャンセルしたら終了
        try {
            awaitCancellation()
        } finally {
            bluetoothLeAdvertiser.stopAdvertising(advertiseCallback)
        }
    }

}
```

## BLE セントラル側のコード
これも前回のようなコードを書きます。

```kotlin
/** BLE セントラル側のコード */
class BleCentral(private val context: Context) {

    /** [readCharacteristic]等で使いたいので */
    private val _bluetoothGatt = MutableStateFlow<BluetoothGatt?>(null)

    /** コールバックの返り値をコルーチン側から受け取りたいので */
    private val _characteristicReadChannel = Channel<ByteArray>()

    /** BLE 通信をし、GATT サーバーへ接続しサービスを探す */
    @SuppressLint("MissingPermission")
    suspend fun connectGattServer() {
        val bluetoothManager = context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager

        // BluetoothDevice が見つかるまで一時停止
        val bluetoothDevice: BluetoothDevice? = suspendCoroutine { continuation ->
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
                setServiceUuid(ParcelUuid(BleUuid.GATT_SERVICE_UUID))
            }.build()
            bluetoothLeScanner.startScan(
                listOf(scanFilter),
                ScanSettings.Builder().build(),
                bleScanCallback
            )
        }

        // BLE デバイスを見つけたら、GATT サーバーへ接続
        bluetoothDevice?.connectGatt(context, false, object : BluetoothGattCallback() {

            // ペリフェラル側との接続
            override fun onConnectionStateChange(gatt: BluetoothGatt?, status: Int, newState: Int) {
                super.onConnectionStateChange(gatt, status, newState)
                when (newState) {
                    // 接続できたらサービスを探す
                    BluetoothProfile.STATE_CONNECTED -> gatt?.discoverServices()
                    // なくなった
                    BluetoothProfile.STATE_DISCONNECTED -> _bluetoothGatt.value = null
                }
            }

            override fun onServicesDiscovered(gatt: BluetoothGatt?, status: Int) {
                super.onServicesDiscovered(gatt, status)
                // サービスが見つかったら GATT サーバーに対して操作ができるはず
                // サービスとキャラクタリスティックを探して、read する
                // キャラクタリスティック操作ができたら flow に入れる
                _bluetoothGatt.value = gatt
            }

            // onCharacteristicReadRequest で送られてきたデータを受け取る
            override fun onCharacteristicRead(gatt: BluetoothGatt, characteristic: BluetoothGattCharacteristic, value: ByteArray, status: Int) {
                super.onCharacteristicRead(gatt, characteristic, value, status)
                _characteristicReadChannel.trySend(value)
            }
        })

        // GATT サーバーへ接続できるまで一時停止する
        _bluetoothGatt.first { it != null }
    }

    /** 終了時に呼ぶ */
    @SuppressLint("MissingPermission")
    fun destroy() {
        _bluetoothGatt.value?.close()
        _bluetoothGatt.value = null
    }

    /** キャラクタリスティックから読み出す */
    @SuppressLint("MissingPermission")
    suspend fun readCharacteristic(): ByteArray {
        // GATT サーバーとの接続を待つ
        val gatt = _bluetoothGatt.filterNotNull().first()
        // GATT サーバーへ狙ったサービス内にあるキャラクタリスティックへ read を試みる
        val findService = gatt.services?.first { it.uuid == BleUuid.GATT_SERVICE_UUID }
        val findCharacteristic = findService?.characteristics?.first { it.uuid == BleUuid.GATT_CHARACTERISTIC_UUID }
        // 結果は onCharacteristicRead で
        gatt.readCharacteristic(findCharacteristic)
        return _characteristicReadChannel.receive()
    }

    /** キャラクタリスティックへ書き込む */
    @SuppressLint("MissingPermission")
    suspend fun writeCharacteristic(sendData: ByteArray) {
        // GATT サーバーとの接続を待つ
        val gatt = _bluetoothGatt.filterNotNull().first()
        // GATT サーバーへ狙ったサービス内にあるキャラクタリスティックへ write を試みる
        val findService = gatt.services?.first { it.uuid == BleUuid.GATT_SERVICE_UUID } ?: return
        val findCharacteristic = findService.characteristics?.first { it.uuid == BleUuid.GATT_CHARACTERISTIC_UUID } ?: return
        // 結果は onCharacteristicWriteRequest で
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            gatt.writeCharacteristic(findCharacteristic, sendData, BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT)
        } else {
            // TODO 下位バージョン対応するなら。UWB 対応デバイスが、TIRAMISU より前に存在するかを考えるとめんどい
        }
    }

}
```

## BLE で実際にやり取りするデータのデータクラス
さて、`UWB`を開始するために必要なパラメーターなのですが、`Controller(親)→Controlee(子)`へ送る必要がある値が複数個あるんですね。  
ちなみに`Controlee(子)→Controller(親)`は1つのバイト配列を投げれば終わり。

というわけで何らかの方法で1つのバイト配列に変換しちゃいたいわけです。  
今なら`protobuf`なんでしょうが、私は使ったことがないので大人しく`Java`の`Serializable`で`data class`をバイト配列に変換しようと思います。。。

```kotlin
/** Controller(親)→Controlee(子) へ送るパラメーター */
data class UwbControllerParams(
    val address: ByteArray,
    val channel: Int,
    val preambleIndex: Int,
    val sessionId: Int,
    val sessionKeyInfo: ByteArray
) : Serializable {

    /** シリアライズ、デシリアライズ用 */
    companion object {

        fun encode(uwbHostParameter: UwbControllerParams): ByteArray {
            return ByteArrayOutputStream().use { byteArrayOutputStream ->
                ObjectOutputStream(byteArrayOutputStream).use { objectOutputStream ->
                    // 書き込んで ByteArray を返す
                    objectOutputStream.writeObject(uwbHostParameter)
                    byteArrayOutputStream.toByteArray()
                }
            }
        }

        fun decode(byteArray: ByteArray): UwbControllerParams {
            return byteArray.inputStream().use { byteArrayInputStream ->
                ObjectInputStream(byteArrayInputStream).use { objectInputStream ->
                    // キャストする
                    objectInputStream.readObject() as UwbControllerParams
                }
            }
        }
    }
}
```

## 実際に UWB の部分を書いていく
ついに来ました。まずは`Controller`(ホスト)側から！

## UWB Controller(ホスト) 側の画面
ついにドキュメントが役に立ちそうなところまで進んできました。  

まずは実際に`UI`で表示するため`RangingPosition`を`remember { mutableStateOf }`で作っておきます。

で、`LaunchedEffect`の中で`BLE`からの`UWB`をやっています。  
`Controller`側になるには`UwbManager#controllerSessionScope`を呼び出します。**あ、まず`UWB`があるかの確認をしたほうが良さそうですね**。めんどいのでやりません。

`Controlee側`（ゲスト側）に送らないといけない値は以下で、  
`controllerSession()`から取得できる`localAddress.address`、`uwbComplexChannel.channel`、`uwbComplexChannel.preambleIndex`、  
それから`sessionId`と`sessionKeyInfo`を適当に作る必要があるらしいです。サンプルコードでも適当に作ってたので適当に作りました。

この値たちをデータクラスにした後、`Serializable`なのでバイト配列に変換し、`BLE`の`キャラクタリスティック`の`read要求`でこのバイト配列を送るようにします。  
また、`Controlee`側をまだ作っていないのであれですが、`Controlee`側からも`ByteArray`のアドレスを受け取る必要があるので、`write要求`されるまで待ちます。

`Controlee`側からのアドレスが受信できれば`RangingParameters()`の値が全て揃います。  
詳しい引数はよくわからずで、とりあえずコレで動きました。

最後に`ControllerSession#prepareSession`に`RangingParameters`を入れて`Flow`を`collect { }`すると`Controlee`側の位置の情報が取得できるようになります。  
適当に受け取った位置情報は`Text()`で表示するようにしました。

```kotlin
/** Controller(Host) 側の画面 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ControllerScreen() {
    val context = LocalContext.current
    
    // controlee の位置
    val uwbPosition = remember { mutableStateOf<RangingPosition?>(null) }

    LaunchedEffect(key1 = Unit) {
        // controller 側として作成
        val uwbManager = UwbManager.createInstance(context)
        val controllerSession = uwbManager.controllerSessionScope()

        // ゲスト側へ送るパラメーターを ByteArray にして送る
        // sessionId / sessionKeyInfo はサンプルコードでも適当に作ってるので適当に作る
        // https://github.com/android/connectivity-samples/blob/777517eb2898cd48e139446246808a2106d343cc/UwbRanging/uwbranging/src/main/java/com/google/apps/uwbranging/impl/NearbyControllerConnector.kt#L69
        val sessionId = Random.nextInt()
        val sessionKeyInfo = Random.nextBytes(8)
        // Serializable な data class にして ByteArray にエンコードする
        val uwbControllerParams = UwbControllerParams(
            address = controllerSession.localAddress.address,
            channel = controllerSession.uwbComplexChannel.channel,
            preambleIndex = controllerSession.uwbComplexChannel.preambleIndex,
            sessionId = sessionId,
            sessionKeyInfo = sessionKeyInfo
        )
        // バイト配列に
        val encodeHostParameter = UwbControllerParams.encode(uwbControllerParams)

        // Controlee 側からアドレスが送られてきたら入れる Flow
        val controleeAddressFlow = MutableStateFlow<ByteArray?>(null)

        // BLE の開始
        val peripheralJob = launch {
            BlePeripheral.startPeripheralAndAdvertising(
                context = context,
                onCharacteristicReadRequest = {
                    // controlee へ送る
                    encodeHostParameter
                },
                onCharacteristicWriteRequest = {
                    // controlee から受け取る
                    controleeAddressFlow.value = it
                }
            )
        }

        // アドレスが送られてきたらペリフェラル終了
        val controleeAddress = controleeAddressFlow.filterNotNull().first()
        peripheralJob.cancel()

        // RangingParameters を作り UWB 接続を開始する
        val rangingParameters = RangingParameters(
            uwbConfigType = RangingParameters.CONFIG_MULTICAST_DS_TWR,
            complexChannel = controllerSession.uwbComplexChannel,
            peerDevices = listOf(UwbDevice.createForAddress(controleeAddress)),
            updateRateType = RangingParameters.RANGING_UPDATE_RATE_AUTOMATIC,
            sessionId = sessionId,
            sessionKeyInfo = sessionKeyInfo,
            subSessionId = 0, // SUB_SESSION_UNSET
            subSessionKeyInfo = null // 暗号化の何か
        )
        controllerSession.prepareSession(rangingParameters).collect { rangingResult ->
            when (rangingResult) {
                is RangingResult.RangingResultPosition -> {
                    uwbPosition.value = rangingResult.position
                }

                is RangingResult.RangingResultPeerDisconnected -> {
                    uwbPosition.value = null
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(title = { Text(text = "UWB Controller") })
        }
    ) { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding)) {
            // null になりえるので注意
            Text(text = "距離 = ${uwbPosition.value?.distance?.value} m")
            Text(text = "方位角 = ${uwbPosition.value?.azimuth?.value} 度")
            Text(text = "仰角 = ${uwbPosition.value?.elevation?.value} 度")
        }
    }
}
```

## UWB Controlee(ゲスト) 側の画面
こちらも同様、`RangingPosition`を`remember stateof`で持っておきます。  
で、`Controlee側`は`UwbManager#controleeSessionScope`で作れます。

つぎに、`BLE`を使い、`Controller側`のペリフェラルへ接続し、キャラクタリスティックへ`read`することで`UWB`に必要なパラメーターを受信します。`Serializable`な`ByteArray`なのでデータクラスの状態戻します。  
`Controller側`で話しましたが、こっちは`localAddress.address`1つを`Controller`側へ送るだけなので楽です。

そしたら`RangingParameters`が作成できるので、あとは同じです。

```kotlin
/** Controlee(Guest) 側の画面 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ControleeScreen() {
    val context = LocalContext.current

    // controller の位置
    val uwbPosition = remember { mutableStateOf<RangingPosition?>(null) }

    LaunchedEffect(key1 = Unit) {
        val uwbManager = UwbManager.createInstance(context)
        val controleeSession = uwbManager.controleeSessionScope()

        // ホスト側へ送るデータ
        val addressByteArray = controleeSession.localAddress.address

        // BLE GATT サーバーへ接続し、UWB ホストと接続に必要なパラメーターを送受信する
        val bleCentral = BleCentral(context)
        bleCentral.connectGattServer()
        val uwbControllerParamsByteArray = bleCentral.readCharacteristic()
        val uwbControllerParams = UwbControllerParams.decode(uwbControllerParamsByteArray)
        bleCentral.writeCharacteristic(addressByteArray)
        bleCentral.destroy()

        // パラメーターを作成
        val rangingParameters = RangingParameters(
            uwbConfigType = RangingParameters.CONFIG_MULTICAST_DS_TWR,
            complexChannel = UwbComplexChannel(uwbControllerParams.channel, uwbControllerParams.preambleIndex),
            peerDevices = listOf(UwbDevice.createForAddress(uwbControllerParams.address)),
            updateRateType = RangingParameters.RANGING_UPDATE_RATE_AUTOMATIC,
            sessionId = uwbControllerParams.sessionId,
            sessionKeyInfo = uwbControllerParams.sessionKeyInfo,
            subSessionId = 0, // SESSION_ID_UNSET ？
            subSessionKeyInfo = null // ？
        )

        // Flow で UWB デバイスとの接続状況をもらえる
        controleeSession.prepareSession(rangingParameters).collect { rangingResult ->
            when (rangingResult) {
                is RangingResult.RangingResultPosition -> {
                    uwbPosition.value = rangingResult.position
                }

                is RangingResult.RangingResultPeerDisconnected -> {
                    uwbPosition.value = null
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(title = { Text(text = "UWB Controlee") })
        }
    ) { innerPadding ->
        Column(modifier = Modifier.padding(innerPadding)) {
            // null になりえるので注意
            Text(text = "距離 = ${uwbPosition.value?.distance?.value} m")
            Text(text = "方位角 = ${uwbPosition.value?.azimuth?.value} 度")
            Text(text = "仰角 = ${uwbPosition.value?.elevation?.value} 度")
        }
    }
}
```

# UWB 使ってみる！！！
アプリを実行してみます。

## UWB 注意事項
ドキュメントには書いてないのですが、注意事項がいくつかあります。`iPhone`のドキュメントをチラ見しましたが多分`Android`もそうです。  
ドキュメントに書いてないけど多分そういう仕様。

- 端末を縦持ちにする
    - 横画面や、ひっくり返すと正しい値になりません
- 2台の端末を背中合わせにする形で配置する
    - つまり、画面が同じ方向を向いていると正しい値にならなそうです
    - 手で持ってない方（机においている方）は自分側に外カメが来るようにする必要があります

## 動かない時
`logcat`で`UwbBackend`で`TAG`を探して見てみるといいかも。ちなみに私は権限が付与されてないことに**30分くらい**気付かなかった。。。

## こんな感じ
こんな感じ。手元で見る感じ誤差はざっくり`プラマイ10cm`くらいかな？  
すごい

![Imgur](https://imgur.com/HIqneoY.png)

![Imgur](https://imgur.com/zDAQpen.png)

# アクセサリの位置を探す矢印みたいなやつは？
`YouTube`の動画を見た感じ、距離に加えて`azimuth`ってので角度を取得できるらしい。  

![Imgur](https://imgur.com/TyCPLEX.png)

![Imgur](https://imgur.com/s1tK0Hw.png)

ところで試したところ、なんかドキュメントだと`90, -90`の範囲って書いてあって、  
でも画面に表示されてるのは`-148`で普通に超えてる気がするんだけどどういうことなの？  
https://developer.android.com/reference/androidx/core/uwb/RangingPosition#getAzimuth()

というわけで矢印コンポーネントを用意しました。  
矢印の記号を`rotationZ`しています。

```kotlin
/** UWB の方角を表示する矢印 */
@Composable
fun UwbArrow(
    modifier: Modifier = Modifier,
    azimuth: Float
) {
    val animateAzimuth = animateFloatAsState(azimuth, label = "animateAzimuth")

    Box(
        modifier = modifier.graphicsLayer {
            rotationZ = animateAzimuth.value
        },
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "↑",
            fontSize = 100.sp
        )
    }
}
```

あとは`ControllerScreen / ControleeScreen`で呼び出せばいいはず！

```kotlin
// null になりえるので注意
Text(text = "距離 = ${uwbPosition.value?.distance?.value} m")
Text(text = "方位角 = ${uwbPosition.value?.azimuth?.value} 度")
Text(text = "仰角 = ${uwbPosition.value?.elevation?.value} 度")

UwbArrow(
    azimuth = uwbPosition.value?.azimuth?.value ?: 0f
)
```

こんな感じに矢印が出て、この矢印がまっすぐになった方向に歩くと見つかります。  
結構正確です。

![Imgur](https://imgur.com/LOIg19k.png)

![Imgur](https://imgur.com/Dl9rREZ.png)

# 相手の位置を表示する Canvas
サンプルアプリでは、自分の位置を中心に、どのへんに`UWB`接続相手がいるかをレーダーみたいに表示する`UI`があるっぽいです。  
これをパクってみます。

元ネタはこの辺です。  
https://github.com/android/connectivity-samples/blob/main/UwbRanging/app/src/main/java/com/google/apps/hellouwb/ui/home/HomeScreen.kt
`Apache-2.0 license`

まずは`Canvas`を用意し、`UWB`デバイスの位置を表す点を書きます。

```kotlin
/**
 * 自分と通信相手を点で表示する Canvas
 * https://github.com/android/connectivity-samples/blob/main/UwbRanging/app/src/main/java/com/google/apps/hellouwb/ui/home/HomeScreen.kt
 *
 * @param modifier [Modifier]
 * @param distance 距離
 * @param azimuth 角度
 * @param isInvert 動かす側の場合は反転する必要があるので
 */
@Composable
fun UwbPointCanvas(
    modifier: Modifier = Modifier,
    isInvert: Boolean,
    distance: Float,
    azimuth: Float
) {
    Canvas(modifier = modifier.border(1.dp, Color.Black)) {

        // 自分（isInvert した場合は相手）
        drawCircle(Color.Red, radius = 15.0f)

        val scale = size.minDimension / 20.0f
        val angle = azimuth * PI / 180
        val x = distance * sin(angle).toFloat()
        val y = distance * cos(angle).toFloat()

        // UWB デバイスの位置
        drawCircle(
            center = center.plus(
                if (isInvert) {
                    Offset(-x * scale, y * scale)
                } else {
                    Offset(x * scale, -y * scale)
                }
            ),
            color = Color.Blue,
            radius = 15.0f
        )
    }
}
```

これを`ControllerScreen / ControleeScreen`で呼び出せばよいです。  
もう一方の端末では`isInvert`を`true`にして自分と相手を入れ替える必要がある。多分。

```kotlin
// null になりえるので注意
Text(text = "距離 = ${uwbPosition.value?.distance?.value} m")
Text(text = "方位角 = ${uwbPosition.value?.azimuth?.value} 度")
Text(text = "仰角 = ${uwbPosition.value?.elevation?.value} 度")

UwbArrow(
    azimuth = uwbPosition.value?.azimuth?.value ?: 0f
)

val isCanvasInvert = remember { mutableStateOf(false) }
Row {
    Text(text = "canvas を反転")
    Switch(checked = isCanvasInvert.value, onCheckedChange = { isCanvasInvert.value = it })
}
UwbPointCanvas(
    modifier = Modifier.size(300.dp),
    isInvert = isCanvasInvert.value,
    distance = uwbPosition.value?.distance?.value ?: 0f,
    azimuth = uwbPosition.value?.azimuth?.value ?: 0f
)
```

こんな感じに自分と相手の位置が点で表示される。上から見た図ですね。  
`Jetpack Compose`数年使ってる気がするけど始めて`Canvas`使ったかもしれない。

![Imgur](https://imgur.com/ivZVSIn.png)

![Imgur](https://imgur.com/IxdLjh5.png)

# おまけ UWB デバイスを動かして軌跡を描く
点の動きを記録して、線を書いてみる。数が多くなるので適当に捨てます。  
さっきの`Canvas`に書いてたやつを転用し、引数の値を配列に記録するように改造し、点を描画する際にはその配列から取り出すようにします。

開始、終了ボタン、リセットボタンをおきました。

```kotlin
@Composable
fun UwbRecordPointCanvas(
    modifier: Modifier = Modifier,
    isInvert: Boolean,
    distance: Float,
    azimuth: Float
) {
    val isRecord = remember { mutableStateOf(false) }
    val recordList = remember { mutableStateOf(emptyList<PointData>()) }

    if (isRecord.value) {
        SideEffect {
            // 数が多いので適当に捨てる
            if (Random.nextBoolean()) {
                recordList.value += PointData(distance, azimuth)
            }
        }
    }

    Column {
        Row {
            Button(onClick = { isRecord.value = !isRecord.value }) {
                Text(text = if (!isRecord.value) "記録開始" else "終了")
            }
            Button(onClick = { recordList.value = emptyList() }) {
                Text(text = "クリア")
            }
        }
        Canvas(modifier = modifier.border(1.dp, Color.Black)) {

            // 自分（isInvert した場合は相手）
            drawCircle(Color.Red, radius = 15.0f)

            // 配列に入れたものを表示
            recordList.value.forEach { (distance, azimuth) ->

                val scale = size.minDimension / 20.0f
                val angle = azimuth * PI / 180
                val x = distance * sin(angle).toFloat()
                val y = distance * cos(angle).toFloat()

                // UWB デバイスの位置
                drawCircle(
                    center = center.plus(
                        if (isInvert) {
                            Offset(-x * scale, y * scale)
                        } else {
                            Offset(x * scale, -y * scale)
                        }
                    ),
                    color = Color.Blue,
                    radius = 15.0f
                )
            }
        }
    }
}
```

あとは片方の端末で記録ボタンを押し、もう一方の`UWB`端末に動いてもらえばいいはず。  
でもあんまりうまく取れてない。

![Imgur](https://imgur.com/6EEXoLe.png)

# そーすこーど
どーぞ  
`UWB`対応の2台の端末にビルドしたアプリを入れて、片方で`Controller`を開始したあともう片方を`Controlee`にしてしばらく待ってると位置とかが表示されるようになるはず。

https://github.com/takusan23/AndroidBleAndUwbSample

# おわりに
2台それぞれにインストールするのが大変でした。

以上です。88888888