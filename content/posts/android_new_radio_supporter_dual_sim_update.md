---
title: NewRadioSupporterがデュアルSIMに対応しました
created_at: 2022-12-31
tags:
- Android
- 5G
- Kotlin
- NewRadioSupporter
---

どうもこんばんわ。

ジュエリー・ハーツ・アカデミア -We will wing wonder world- 攻略しました。  

![Imgur](https://imgur.com/vR1AfMu.png)

序盤の頃が懐かしくなるぐらいにはぜんぜん違う方向に話が進むのね、、評判がよさそうだったので予約してたんですがめちゃよかったです。  
次々と新事実が、、、！伏線回収すごい、、色んな方向に話が進んでいくけど最後はちゃんとしてました。

![Imgur](https://imgur.com/trnJxyg.png)

戦闘シーンは毎回ラスボスかよって勢いなので毎回ハラハラさせられる、、、

![Imgur](https://imgur.com/4gdKxtp.png)

ヒロインみんなめっちゃかわいい！！！。おすすめです。

![Imgur](https://imgur.com/RbcdPR7.png)

![Imgur](https://imgur.com/wR807Ro.png)

↑アリアンナちゃんがかわいいのでぜひ

曲もめっちゃいい！。エンディング曲が気に入りました。オープニング曲のイントロもすき

# 本題

`NewRadioSupporter`バージョンアップをしました。  
ソースコードもあるので自信がある方はビルド挑戦してみてもいいかもしれません。

## デュアルSIM対応
デュアルSIMに対応しました。そんなに難しくなかった、、、  
動作確認のためにMNOのオンライン限定プランを契約してみたのですがMNOなのにずいぶん安いですね（感覚麻痺）。  
~~というかテザリング無料なのね、docomo / 楽天 以外は金払わないと使えないのにオンライン限定プランはいいのか、、、？~~ 最近のプランはテザリング無料になったの？

`Xperia`で動いたのは確認した。`Pixel`でも多分動くと思います。

![Imgur](https://imgur.com/VZuEFBS.png)

![Imgur](https://imgur.com/liyNL0w.png)

## 転用5G の検出
`3.6GHz`未満の周波数の場合に転用5Gと表示するようにしました。  
![Imgur](https://imgur.com/BHuAk07.png)

## Snapdragon 端末で動くように
あともう一つ、私もXperiaで使うまで知らなかったのですが **Snapdragon 搭載端末で動いてませんでした。**  
たまたま`Google Pixel`で動いてただけでした、、、、

アプリを出してから一年ぐらい経ちますが気づきませんでしたごめんなさい。

![Imgur](https://imgur.com/rXrsd6A.png)

今回はこれらの実装方法でもつらつらと

# その前にこのアプリ何
電波アイコン（アンテナピクト）の隣にある、`5G`アイコン（`RAT表示`）が何を指しているのかを判定するアプリです。  
実はこれ`5G`につながって無くても`5G`って表示することがあり（！？）、本当に`5G`に接続しているのか判定するアプリになります。  
以下の判定機能があります。

- アンカーバンド
    - 現在普及している`5G`は`4G`基地局が無いと動かない。連動している（ノンスタンドアローン方式）
    - → 連動している`4G`基地局とつながった際に、`5G`基地局の存在が通知される
    - → 通知されるが、`5G`基地局の電波は届かず`4G`にのみ接続される。
    - → しかし、`4G`基地局から`5G`の存在が通知されているため、**RAT表示が5G**になる。（実際は`4G`に繋がっているのに！）
    - 雑な絵です
        - ![Imgur](https://imgur.com/eCoXDPD.png)
    - なんで判定がサードパーティレベルでできるんだって話ですが、どうやら内部では`4G`扱いだが、RAT表示だけ`5G`に上書きする処理のようです。
- Sub-6
    - 4Gの延長線上の周波数を使う5Gです。
    - 転用5Gを除けばほとんどこれ
- ミリ波
    - Sub-6よりもさらに早い
    - めったに遭遇しない
    - 対応機種もあんまりない（SIMフリーならなおさら無い）
- 転用5G
    - 4G基地局を5Gにしたもの。名前そのまま
    - 速度は4Gのままになる
    - なんちゃって5G / NR化 とか呼ばれている
- ノンスタンドアローン (NSA)
    - いまの5Gはこれ
    - 4G基地局と連動して動く5G
        - 4G基地局を プライマリーセル、マスターノード とか呼んでる？
        - 5G基地局を セカンダリーセル とか呼んでる？
    - Androidの`TelephonyManager`の挙動がよく分からない、、、`5G NSA`の場合は内部的に`LTE`で扱われてそうな雰囲気がある
        - 設定画面にある `SIM ステータス`ダイアログ（デバイス情報から見れる） のところのソースコードを眺める
            - なんか `LTE` だけど `5G NSA` なら上書きする処理がある
            - https://cs.android.com/android/platform/superproject/+/master:packages/apps/Settings/src/com/android/settings/deviceinfo/simstatus/SimStatusDialogController.java;l=558
- スタンドアローン (SA)
    - 5G単独で動く
    - 今のところ個人向けに`5G SA`を提供してるのはドコモだけ？（しかもエリアも少ない）

# デュアルSIM 対応

`SubscriptionManager`を使うことで、端末に入ってる`SIMカード`の情報とか取れます。  
データ用 / 通話用 のSIMカードがどれかを取得できたりします。

また、`SubscriptionInfo#getSimSlotIndex`で取得できる値を利用することで`SIMカード`を指定した`TelephonyManager`のインスタンスが作成できます。  
これで`SIMカード`別の`EARFCN`とかが取得できるようになります。

```kotlin
// データ用SIMカード
val subscriptionManager = getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager
val dataUseSimSubscriptionId = SubscriptionManager.getActiveDataSubscriptionId()
val dataUseSim = subscriptionManager.getActiveSubscriptionInfo(dataUseSimSubscriptionId)

textView.text = "データ通信に指定されたSIMカードのキャリア名 = ${dataUseSim.carrierName}"

// SIMカードを指定した TelephonyManager を作成する
val dataUseTelephonyManager = (getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager).createForSubscriptionId(dataUseSim.subscriptionId)
dataUseTelephonyManager.requestCellInfoUpdate(mainExecutor, object : TelephonyManager.CellInfoCallback() {
    override fun onCellInfo(cellInfo: MutableList<CellInfo>) {
        // EARFCN の取得など...
    }
})
```

なんか取れない時があったので、確実に取得したい場合は`SubscriptionManager#addOnSubscriptionsChangedListener`でコールバックを購読するのがいいと思います（多分？）

```kotlin
val subscriptionInfoCallback = object : SubscriptionManager.OnSubscriptionsChangedListener() {
    override fun onSubscriptionsChanged() {
        super.onSubscriptionsChanged()
        // 更新されたら呼ばれる
        subscriptionManager.activeSubscriptionInfoList
    }
}
subscriptionManager.addOnSubscriptionsChangedListener(context.mainExecutor, subscriptionInfoCallback)
```

# 転用5G の検出
私も最初は`n20`とかが転用5Gで、`n77`以上を新周波数の5Gだろ～ｗｗとか思ってたのですが、どうやら違うみたいで転用5Gでもバンドが`n78`とかになるみたいです。  
`n78`の範囲は`3.3GHz ~ 3.8GHz`までなのでバンドを見るだけでは転用5Gの判定ができない。（5G専用周波数が`3.6GHz`からなので、、、）  
多分周波数が`3.6GHz`未満の`5G`を`転用5G`って言うと思う、、、ので、まず周波数を取得します。(どうでもいいけど5G専用周波数（新周波数）を`3.7GHz帯`とか言うらしいんだけど、実際は`3.6GHz`からっぽいです。)  

もしかするとこれは日本だけかもしれない。  
参考：https://k-tai.watch.impress.co.jp/docs/column/keyword/1223471.html

話を戻して、周波数を取得する方法ですが、残念ながらこれも一筋縄では行きません（`getFrequency()`みたいなメソッドはない。）  
じゃあどうするんだって話ですが、`NRARFCN`から計算をすることで、周波数（`3.6GHz`）みたいな値を出すことができます！！！

その計算式がここの資料に書いてある：3GPP TS 38.104 5.4.2.1  

## NRARFCN から 周波数を計算する
はい。単位は MHz になります。  
必要な値は`NRARFCN`のみで、あと必要な値は以下の表から持ってきます。

```plaintext
FREF = FREF-Offs + ΔFGlobal (NRARFCN – NREF-Offs)
```

| NRARFCN の範囲       | ΔFGlobal (MHz) | FREF-Offs (MHz) | NREF-Offs |
|----------------------|----------------|-----------------|-----------|
| 0 から 599999        | 0.005          | 0               | 0         |
| 600000 から 2016666  | 0.015          | 3000            | 600000    |
| 2016667 から 3279165 | 0.060          | 24250.08        | 2016667   |

（ソース：3GPP TS 38.104 Table 5.4.2.1-1: NR-ARFCN parameters for the global frequency raster）

### 例

例えば`NRARFCN`が`643334`だった場合は、  
上の表を使い、`NRARFCN の範囲`から`600000 から 2016666`に該当します。あとは横になぞって`ΔFGlobal (MHz) = 0.015 / FREF-Offs (MHz) = 3000 / NREF-Offs = 600000`がそれぞれ判明します。  
あとは公式に当てはめます。  

```plaintext
FREF = FREF-Offs + ΔFGlobal (NRARFCN – NREF-Offs)
```
```plaintext
3000 + 0.015 (643334 – 600000) = 3650.01
```

というわけで周波数は`3650.01 MHz`、多分新周波数の`5G`になります。

### 例2
同じ`n78`でも転用5Gの可能性がある`NRARFCN`が`635424`も計算してみましょう。
こちらも同様、上の表を使い`NRARFCN の範囲`から`600000 から 2016666`に該当し、横になぞって`ΔFGlobal (MHz) = 0.015 / FREF-Offs (MHz) = 3000 / NREF-Offs = 600000`が判明して、

```plaintext
FREF = FREF-Offs + ΔFGlobal (NRARFCN – NREF-Offs)
```
```plaintext
3000 + 0.015 (635424 – 600000) = 3531.36
```

`3531.36 MHz`になりました。これは多分転用5Gになります。`au`のものですが、`3.5GHz`は4Gと同じ旨がエリアマップのところに書いてあるので多分正解でしょう。

### Kotlin 実装例
Kotlinの機能を使って楽をしていますが、特に難しいことはしていないので他の言語でも簡単に作れると思います。

```kotlin
/**
 * NRARFCN から 周波数を求める。
 * 計算式は「3GPP TS 38.104 5.4.2.1」を参照してください。
 *
 * @return 周波数。単位は MHz 。3600とか。
 */
fun toFrequencyMHz(nrarfcn: Int): Float {
    // 計算に必要な、 FREF-Offs / FGlobal / NREF-Offs を NRARFCN から出す
    // 資料では FGlobal は kHz だが、 MHz に合わせるため変換している
    val (FGlobal, FREFOffs, NREFOffs) = when (nrarfcn) {
        // 3 GHz 以下
        in 0..599999 -> Triple(0.005f, 0f, 0)
        // 3 GHz から 24.25 GHz
        in 600000..2016666 -> Triple(0.015f, 3000f, 600000)
        // 24.25 GHz 以上
        in 2016667..3279165 -> Triple(0.060f, 24250.08f, 2016667)
        // ありえないので適当にreturn
        else -> return -1f
    }
    // FREFOffs + FGlobal( NRARFCN - NREFOffs ) の計算をする
    val frequencyMHz = FREFOffs + ((FGlobal * nrarfcn) - (FGlobal * NREFOffs))
    // 小数点第二位までにする
    return "%.2f".format(frequencyMHz).toFloat()
}
```

#### 組み合わせ例
こんな感じに使えます

```kotlin

override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // 省略...

    val telephonyManager = getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
    telephonyManager.requestCellInfoUpdate(mainExecutor, object : TelephonyManager.CellInfoCallback() {
        override fun onCellInfo(cellInfo: MutableList<CellInfo>) {
            // 5G のみ
            val info = cellInfo.filterIsInstance<CellInfoNr>().firstOrNull() ?: return
            val cellIdentityNr = info.cellIdentity as CellIdentityNr
            val frequency = toFrequencyMHz(cellIdentityNr.nrarfcn)
            println("""
                NRARFCN = ${cellIdentityNr.nrarfcn}
                周波数 = ${frequency}
            """.trimIndent())
        }
    })
    // I/System.out: NRARFCN = 635424
    // I/System.out: 周波数 = 3531.36
}

/**
 * NRARFCN から 周波数を求める。
 * 計算式は「3GPP TS 38.104 5.4.2.1」を参照してください。
 *
 * @return 周波数。単位は MHz 。3600とか。
 */
fun toFrequencyMHz(nrarfcn: Int): Float {
    // 計算に必要な、 FREF-Offs / FGlobal / NREF-Offs を NRARFCN から出す
    // 資料では FGlobal は kHz だが、 MHz に合わせるため変換している
    val (FGlobal, FREFOffs, NREFOffs) = when (nrarfcn) {
        // 3 GHz 以下
        in 0..599999 -> Triple(0.005f, 0f, 0)
        // 3 GHz から 24.25 GHz
        in 600000..2016666 -> Triple(0.015f, 3000f, 600000)
        // 24.25 GHz 以上
        in 2016667..3279165 -> Triple(0.060f, 24250.08f, 2016667)
        // ありえないので適当にreturn
        else -> return -1f
    }
    // FREFOffs + FGlobal( NRARFCN - NREFOffs ) の計算をする
    val frequencyMHz = FREFOffs + ((FGlobal * nrarfcn) - (FGlobal * NREFOffs))
    // 小数点第二位までにする
    return "%.2f".format(frequencyMHz).toFloat()
}
```

# Snapdragon端末で動くように修正
簡単に言うと`Google Tensor`と`Qualcomm Snapdragon`で`TelephonyManager#getAllCellInfo`関数の返り値が違う（コールバック版もそう）のが原因でした、、、  

## 何が違うのか
5G の ノンスタンドアローン (NSA) 方式の場合に挙動が違うっぽい

`TelephonyManager#getAllCellInfo`の返り値が

- Google Tensor 端末の場合
    - CellInfoNr が一つだけ入った配列
    - `[CellInfoNr]`
- Qualcomm Snapdragon 端末の場合
    - NSA の場合は CellInfoLte と CellInfoNr が配列に入ってる
    - 少なくとも CellInfoNr は最初のインデックスには無い？
    - `[CellInfoLte, CellInfoNr...]`

で、このアプリは`CellInfoNr`が**配列の最初**に入ってる前提で動いてたので、スナドラ端末の場合で全滅します。（`Google Pixel`で動けば他でも動くやろと思ってた）  
どっちが正解なのかは分からないのですが、、、`5G ノンスタンドアローン(NSA) 方式`の場合は4Gにも接続しているはず？なので`CellInfoLte`が配列に入ってないとおかしい気がします、、、。  
修正としては、最初の要素ではなく`CellInfoNr`を配列の中から探すように修正しました。

```diff
                     /** 実際の状態 */
                     override fun onCellInfoChanged(cellInfo: MutableList<CellInfo?>) {
-                        // 機内モードから復帰時などにすぐ開くとなんか落ちるので
-                        tempBandData = cellInfo.getOrNull(0)?.let { convertBandData(it) }
+                        // CellInfoNrを探して、もしない場合は 4G にする
+                        // Qualcomm Snapdragon 端末 と Google Tensor 端末 で挙動が違う
+                        // Google Tensor の場合は配列の最初に CellInfoNr があるみたい。
+                        // Qualcomm Snapdragon の場合、配列のどっかに CellInfoNr があるみたい。
+                        // で、 Qualcomm Snapdragon の場合で CellInfoNr が取れない場合がある（ CellSignalStrengthNr だけ取れる。バンドとかは取れないけど5Gの電波強度が取れる？）
+                        // ない場合は 4G か アンカーバンド？
+                        tempBandData = cellInfo.filterIsInstance<CellInfoNr>().firstOrNull()?.let { convertBandData(it) } ?: cellInfo.firstOrNull()?.let { convertBandData(it) }
                         sendResult()
                     }
```

### メモ
手持ちに端末がないのでなんとも言えないのですが、`5G スタンドアローン(SA) 方式`の場合はスナドラ端末でも`CellInfoNr`しか配列に入らないはず？？？なので動いてたかもしれません。  
~~5G NSAが特殊すぎるんや、、、~~

# より多くの端末で5Gを検出する
`Qualcomm Snapdragon`の端末の場合でかつ古めの端末？理由は分からないのですが、`5G`に接続していても`CellInfoNr`が取得できないことがあります。（しかし5Gには接続できているようでアンカーバンドではなさそう、もちろん`RAT表示`も`5G`になってる）  
で、いろいろ見た結果 `CellInfoNr` は取得できないけど`5G`に接続できている場合、`CellSignalStrengthNr`が取得できるらしいです（電波強度とかが入ってる）  

というわけで、`CellInfoNr`が取れず`4G`の場合でも、`CellSignalStrengthNr`が取れた場合は`もしかして5G`の表示にしています。  
電波強度だけ取得なので、接続中のバンドとかは4Gのままになります。（マスターノード？プライマリーセル？の情報）

https://github.com/takusan23/NewRadioSupporter/blob/afca30269ce8e80cc4efea944560f00904c46473/app/src/main/java/io/github/takusan23/newradiosupporter/tool/NetworkCallbackTool.kt#L88

より多くの端末で5Gを検出（検出だけ！）できるようにする場合は`CellSignalStrengthNr`のインスタンスが取得できるかどうかを追加するといいと思います（後述）

## 実装例

`TelephonyManager#getAllCellInfo`ではなく、`TelephonyManager#getSignalStrength`を利用することで`5G`かどうかを判定できます。  
`callbackFlow`便利ですね。

```kotlin
/** 少なくとも 5G に接続している場合は true を返す (アンカーバンド / 4G は false) */
@OptIn(ExperimentalCoroutinesApi::class)
fun collectNrCheck() = callbackFlow {
    var tempCellSignalStrength: CellSignalStrength? = null

    fun sendResult() {
        // Flow で返す
        trySend(tempCellSignalStrength != null)
    }

    val telephonyManager = getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val telephonyCallback = object : TelephonyCallback(), TelephonyCallback.SignalStrengthsListener {
            // 5G に接続しているのにもかかわらず、CellInfoNr が取得できないことがある。が、その場合でも CellSignalStrengthNr が取得できる
            override fun onSignalStrengthsChanged(signalStrength: SignalStrength) {
                tempCellSignalStrength = signalStrength.getCellSignalStrengths(CellSignalStrengthNr::class.java).firstOrNull()
                sendResult()
            }
        }
        telephonyManager.registerTelephonyCallback(mainExecutor, telephonyCallback)
        awaitClose { telephonyManager.unregisterTelephonyCallback(telephonyCallback) }
    } else {
        val phoneStateListener = object : PhoneStateListener() {
            override fun onSignalStrengthsChanged(signalStrength: SignalStrength?) {
                super.onSignalStrengthsChanged(signalStrength)
                tempCellSignalStrength = signalStrength?.getCellSignalStrengths(CellSignalStrengthNr::class.java)?.firstOrNull()
                sendResult()
            }
        }
        telephonyManager.listen(phoneStateListener, PhoneStateListener.LISTEN_SIGNAL_STRENGTHS)
        awaitClose { telephonyManager.listen(phoneStateListener, PhoneStateListener.LISTEN_NONE) }
    }
}
```

利用側でこんな感じに（別に`JetpackCompose`である必要もないですが）

```kotlin
// Flow で 5G かどうかを監視する
val isNewRadio by remember { collectNrCheck() }.collectAsState(initial = false)

Column(
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.Center
) {
    if (isNewRadio) {
        Text(text = "5Gに接続しています")
    } else {
        Text(text = "4Gに接続しています")
    }
}
```

一応そーすこーど  
https://github.com/takusan23/AndroidNrCheckerMoreDevice


# ノンスタンドアローン (NSA) / スタンドアローン (SA) 検出
すでに対応済みですが、私は試せてないので本当に検出できてるかは分かんないです、、、（`docomoの 5G SA`ってあれドコモ端末だけ？）  
AOSPとか眺めてる感じ？`TelephonyManager#getDataNetworkType`で`NSA / SA`判定が行えるはずです。  

どうやら`ノンスタンドアローン 5G`はAndroid内部では`4G`判定らしく、`5G`表示を上書きする処理のようです。  

```kotlin
/**
 * [TelephonyDisplayInfo]と[TelephonyManager.getDataNetworkType]を見て5Gが NSA/SA のどっちで接続されているか判別する
 *
 * @param telephonyDisplayInfo [TelephonyCallback.DisplayInfoListener]で取れるやつ
 * @param dataNetworkType [TelephonyManager.getDataNetworkType]の値
 * @return [NrStandAloneType]。5G 以外は [NrStandAloneType.ERROR]
 */
fun convertStandAloneType(telephonyDisplayInfo: TelephonyDisplayInfo, dataNetworkType: Int) = when {
    /**
     * 5G スタンドアローン形式 (SA)
     * [TelephonyManager.getDataNetworkType]が[TelephonyManager.NETWORK_TYPE_NR]を返す
     */
    dataNetworkType == TelephonyManager.NETWORK_TYPE_NR -> NrStandAloneType.STAND_ALONE
    /**
     * 5G ノンスタンドアローン方式 (NSA)
     * [TelephonyManager.getDataNetworkType]が[TelephonyManager.NETWORK_TYPE_LTE]を返し（なんと！）、
     * [TelephonyDisplayInfo.getOverrideNetworkType]が NR を返す
     */
    dataNetworkType == TelephonyManager.NETWORK_TYPE_LTE &&
            (telephonyDisplayInfo.overrideNetworkType == TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_NR_ADVANCED
                    || telephonyDisplayInfo.overrideNetworkType == TelephonyDisplayInfo.OVERRIDE_NETWORK_TYPE_NR_NSA) -> NrStandAloneType.NON_STAND_ALONE
    // 5Gじゃない
    else -> NrStandAloneType.ERROR
}

/**
 * 5Gのネットワーク方式、動作未確認
 * Non StandAlone / StandAlone / 5G以外
 */
enum class NrStandAloneType {
    /** 5G スタンドアローン形式 */
    STAND_ALONE,

    /** 5G ノンスタンドアローン形式 */
    NON_STAND_ALONE,

    /** 5G じゃない */
    ERROR
}
```

# TelephonyCallback.CellInfoListenerの @NonNull は嘘
リリース後、`Kotlin`で書いてある部分でなぜか`ぬるぽ`で落ちてるんですよね、  
そんな ぬるぽ になる場所なんてあったかな、、と思い見てみたのですが、どうやらこれ`Android`が悪いんですよね。

こんな感じに`@NonNull`が書いてあるので`null`が入らないと**私もKotlin**も思ってたのですが、一部の条件で`null`になるんですよね、、  
（一部の条件：再起動したあとすぐ起動すると`null`になる。Issue にちょうどあって再現もした：https://issuetracker.google.com/issues/237308373）

```java
public interface CellInfoListener {
    @RequiresPermission(allOf = {
            Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.ACCESS_FINE_LOCATION
    })
    void onCellInfoChanged(@NonNull List<CellInfo> cellInfo);
}
```

`Java（AndroidのNonNull）`の場合、`@NonNull`はビルド時に`null`の可能性があるときに警告が出る程度なので実際に実行中に`null`になっても、特に何もなく動きます、、、  
一方、`Kotlin`の場合は`Android の @NonNull アノテーション`も`NonNull`として扱う上、`NonNull`の場合実行時も`null`チェックするコードを挿入するため、`null`を渡して呼び出した場合は落ちてしまいます。  
詳しい話→ http://takusan.negitoro.dev/posts/android_nonnull_annotation_kotlin/

```kotlin
val callback = object : TelephonyCallback(), TelephonyCallback.CellInfoListener {
   
    override fun onCellInfoChanged(cellInfo: MutableList<CellInfo>) {
        // ビルド時にここに cellInfo が null ではないことを確認するコードが以下のように挿入される
        // Intrinsics.checkNotNullExpressionValue(...)
        // cellInfo
    }

}
```

対策としては、`Java`でインターフェースを作成し、`TelephonyCallback.onCellInfoChanged`を継承して、引数の部分の`@NonNull`を`@Nullable`に置き換えるようにすると動くはずです。  

```java
/** NonNull が付いているが、onCellInfoChanged を null で呼び出す事があるため、Nullable にしたもの */
@RequiresApi(api = Build.VERSION_CODES.S)
public interface NullableCellInfoListener extends TelephonyCallback.CellInfoListener {

    @Override
    void onCellInfoChanged(@Nullable List<CellInfo> cellInfo);
}
```

```kotlin
val callback = object : TelephonyCallback(), NullableCellInfoListener {
    override fun onCellInfoChanged(cellInfo: MutableList<CellInfo>?) {
        // nullable になった
    }
}
```

# 電波関連のIssue
- https://issuetracker.google.com/issues/145308680
    - `NSA`の場合`CellInfo`が返ってくるかはメーカー次第
    - `CellInfoNr`が取れなくても`SignalStrengthNr`が取れる場合がある
- https://issuetracker.google.com/issues/190423022
    - `Exynos`で挙動が違うらしい
        - `Google Tensor`も`Exynos`と同じモデムを使ってたはずなので同じ影響を受けそう感

# NewRadioSupporter ソースコード
https://github.com/takusan23/NewRadioSupporter

審査提出！  

![Imgur](https://imgur.com/JY0Itt0.png)

# おわりに1
電測APIはAOSPがどうこう、よりもモデムのベンダー次第なところがあるので、`Issue Tracker`に書いても多分無理って言われるだけだと思います；；

# おわりに2
`Xperia`って`SIMピン`なくてもSIMトレーを引き出せるんですけど、これ便利ですね。

# おわりに3
au / Softbank が転用5Gしてるせいなのか、はたまた Snapdragon搭載端末 だからなのかは知らないのですが、5Gの掴みがいい気がしました。（Pixelより掴むのかな？）  
転用5Gだと少し歩けば掴むので動作確認がずいぶん楽になりますね（ドコモショップにいかなくても済む）

そしてドコモも転用5Gを始めたみたい（公式発表済み、運用も始まってるとかなんとか？）なのですが、なんかドコモ端末以外は接続できないらしい？（私は持ってない）。  
**しかし噂によると転用でも`80MHz`を使うところがあるらしいので結構速そう**（新周波数帯の5Gが`100MHz ~`なので8割ぐらいは出る？ｗｋｔｋ）。

血を見ると力が抜けてくのって気のせいかな