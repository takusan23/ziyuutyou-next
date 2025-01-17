---
title: Hello Android 12。ローカルIPアドレス編
created_at: 2021-11-18
tags:
- Android
- Kotlin
---
どうもこんばんわ。  
Chromeくんがたまによく固まるんだけどどうした？

# 本題
Android 12からローカルIPアドレスを取得する際に`WifiManager`を利用するほうが非推奨になり、  
`ConnectivityManager`を使うのが正規ルートになったみたいなのでメモ  

![Imgur](https://i.imgur.com/Rpjusp8.png)

# 公式リファレンス

https://developer.android.com/reference/android/net/ConnectivityManager#getLinkProperties(android.net.Network)

https://developer.android.com/reference/kotlin/android/net/wifi/WifiManager#getConnectionInfo()

# 権限

`AndroidManifest.xml`に`android.permission.ACCESS_NETWORK_STATE`を追加します。  
DANGERレベルじゃないので自動で付与されます。

```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

# レイアウト
適当にTextViewを置いておけばいいと思います（idは`activity_main_text_view`）

# 同期的に取得
一回だけ取得する際はどんな難しくないです。ただしネットワークの変更があった際に対応できません。

```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val textView = findViewById<TextView>(R.id.activity_main_text_view)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            textView.text = getIpAddress(this)
        }
    }

     /**
     * IPアドレスを取得する関数
     *
     * @param context Context
     * @return IPv4のIPアドレス
     * */
   @RequiresApi(Build.VERSION_CODES.M)
    fun getIpAddress(context: Context): String? {
        val connectivityManager = context.getSystemService(CONNECTIVITY_SERVICE) as ConnectivityManager
        val activeNetwork = connectivityManager.activeNetwork
        val linkProperties = connectivityManager.getLinkProperties(activeNetwork)
        println(linkProperties?.linkAddresses)
        val localIpAddress = linkProperties?.linkAddresses
            ?.find { it.address?.toString()?.contains("192") == true }
            ?.address
            ?.hostAddress
        return localIpAddress
    }
}
```

## LinkProperties#getLinkAddresses() メソッド
どうやらこれ、IPv6アドレス（16進数の`:`区切りのやつ）とIPv4アドレス（10進数で`.`区切りのやつ）が一緒の配列に入ってるみたいなので、  
配列の中からIPアドレスに`192`が含まれているものを探してます。

該当のコード

```kotlin
val localIpAddress = linkProperties?.linkAddresses
    ?.find { it.address?.toString()?.contains("192") == true }
    ?.address
    ?.hostAddress
```

# 非同期的に取得する
コードが複雑になる代償にネットワーク変更の検知に対応できます。

## ライブラリ

`app/build.gradle`にコルーチンとライフサイクルのライブラリを入れます。

```gradle
dependencies {

    implementation "androidx.lifecycle:lifecycle-runtime-ktx:2.4.0"
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-core:1.5.2"

    // 省略
```

## コールバックをいい感じに扱いたい！
`Kotlin`のコルーチンにある、`Flow`の一種、`callbackFlow`がいい感じに扱ってくれます。  
これを使うと、コールバック形式のコードをFlowに変換してくれます。さらに、コルーチンが終了した際の後始末まで一つの関数で完結するのでマジ便利。

```kotlin
callbackFlow {
    // BroadcastReceiver など
    awaitClose {
        // Context#unregisterReceiver() で登録解除
    }
}
```

## FlowでIPアドレスを送る関数

`lifecycleScope`を利用することで、Activityのライフサイクルに合わせてコルーチンを終了してくれます。  
コルーチンが終了すると、`callbackFlow`内の`awaitClose`へ進み後始末をしてくれます。

```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val textView = findViewById<TextView>(R.id.activity_main_text_view)
        lifecycleScope.launch {
            collectIpAddress(this@MainActivity).collect {
                textView.text = it
            }
        }
    }

    /**
     * IPアドレスをFlowで受け取る
     *
     * @param context Context
     * @return IPv4のIPアドレス
     * */
    @OptIn(ExperimentalCoroutinesApi::class)
    fun collectIpAddress(context: Context) = callbackFlow {
        val connectivityManager = context.getSystemService(CONNECTIVITY_SERVICE) as ConnectivityManager
        val request = NetworkRequest.Builder()
            .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
            .build()
        // コールバック
        val networkCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onCapabilitiesChanged(network: Network, networkCapabilities: NetworkCapabilities) {
                super.onCapabilitiesChanged(network, networkCapabilities)
                val linkProperties = connectivityManager.getLinkProperties(network)
                // IPv4アドレスを探す
                val address = linkProperties?.linkAddresses
                    ?.find { it.address?.toString()?.contains("192") == true }
                    ?.address?.hostAddress
                if (address != null) {
                    trySend(address)
                }
            }
        }
        connectivityManager.registerNetworkCallback(request, networkCallback)
        awaitClose {
            connectivityManager.unregisterNetworkCallback(networkCallback)
        }
    }

}
```

以上です。

お疲れさまでした

# おわりに

ソースコード置いておきます

https://github.com/takusan23/Android12GetIPAddress