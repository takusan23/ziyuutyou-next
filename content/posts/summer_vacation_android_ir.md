---
title: 夏休み企画　Mi 11 Lite 5G の赤外線送信機能を使ってシーリングライトを操作
created_at: 2021-08-08
tags:
- Android
- Kotlin
- Xiaomi 11 Lite 5G
- Raspberry Pi
---

どうもこんばんわ。  
ハジラブ -Making*Lovers- 攻略しました。  
桜子ちゃんが可愛かったです。無印版もやりたいと思います。    
![Imgur](https://i.imgur.com/Dm9TXuI.png)　　

あと別にこのゲームに限った話じゃないけど他のヒロイン攻略するのしんどくなるやつわかる人いますかね？

![Imgur](https://i.imgur.com/ZqkR7Qw.png)

好きな娘からやればいいと思いますがおすすめは初穂さんを最後にやるといいかも？

# 本題
なんかBLU出来るらしいから買った`Xiaomi Mi 11 Lite 5G`、この子`Mi Remote`っていうプリインアプリで赤外線を送信して家電操作ができるんですね。  
でもこのアプリ、シーリングライトが何故か用意されてません。  

赤外線通信、懐かしい響きなんですかね？。スマホ世代だからわからん  
(iモード？、着せ替えツール？、フルブラウザ？、ネットワーク暗証番号？、センター問い合わせ？、富士通のプライバシーモード？、パケ・ホーダイ？)

# MIUI初体験
なんかUSBデバッグとは別にUSB経由のアプリインストールの設定があって、これ`SIMカード`刺さないとONに出来ないので注意。

# 赤外線送信するためには
- 赤外線送信ができて、`ConsumerIrManager#hasIrEmitter()`が`true`を返す端末
    - 今回は`Xiaomi Mi 11 Lite 5G`を利用。33W充電めっちゃ早くて怖いまである。
- 赤外線のパターンを取得出来る環境
    - 今回はラズパイと赤外線受信モジュールで取得
    - Nature Remo(エアコンや照明を外出先からONに出来るやつ)を持っている場合はいらないかもしれない
        - 後述。なお私は持っていない。誰か確かめてみてくれ。

# 環境

| なまえ               | あたい                    |
|----------------------|---------------------------|
| 端末                 | Xiaomi Mi 11 Lite 5G      |
| 言語                 | Kotlin                    |
| UI                   | Jetpack Compose           |
| Raspberry Pi         | 2 Model B                 |
| 赤外線受信モジュール | OSRB38C9AA (秋月で買えた) |

UI作るのだるいので、Jetpack Composeを使います。

# 赤外線のパターン取得編

今回は`NEC`のシーリングライトの赤外線パターンを取得したいと思います。NECって昔ゲーム作ってたってマジ？  
Raspberry Piと赤外線受信モジュールをGPIOで接続して取得するんですが、残念ながらこの辺は詳しくないので先人に乗っかります。この辺詳しくなくても出来るので先人GJ  

## どんなデータ？
こんな感じの配列。本当はもっと長い。

```json
[
    8925, 4540, 514, 626, 514,
]
```

## ラズパイとか持ってないよ
赤外線のパターンが手に入ればいいので、`Nature Remo`をお持ちの方は、`Nature Remo 赤外線データ`とかで調べるとそれっぽいパターンを取得できるそうですよ（そもそも持ってたらこんな事する必要すらないけどな）

## Raspberry Pi に 赤外線受信モジュール を接続する
先人に乗っかります。ラズパイのセットアップは各自。ディスプレイつないで初期設定終わらせておいてね。  

https://qiita.com/takjg/items/e6b8af53421be54b62c9#%E8%B5%A4%E5%A4%96%E7%B7%9A%E3%82%92%E5%8F%97%E4%BF%A1%E3%81%99%E3%82%8B%E5%9B%9E%E8%B7%AF

受光部を正面にした場合、右から「3.3V」「グラウンド」「データ」線をつなぎます。

```
+-+
|●|
+-+
|||

321
```

```
3. データ線     GPIO 18 (ピン番号12)
2. グラウンド   ピン番号 9 (GNDならどこでもおｋ)
1. 3.3V        ピン番号 1 (3.3Vならどこでもおｋ)
```

以下結線例です。

![Imgur](https://i.imgur.com/jmBtlwx.png)

## Raspberry PiにSSH接続する
SSH接続ってのはラズパイにあるターミナル（Windowsでいうコマンドプロンプト）を他PCから操作するときに使うやつです。リモートデスクトップでコマンドプロンプト操作してるみたいな感じだと思う。

Raspberry Piにリモートで入ります。別にラズパイにつないだディスプレイとキーボードで操作してもいいんだけど、赤外線のパターンを母艦（開発環境があるPC）にコピーするのが面倒なのでリモートで入ります。  
ところで母艦って死語？

なんか最近はディスプレイなしでもファイル作ってラズパイと有線LANで繋げば初回起動からSSHに入れるそうですね？

SSHの有効化は省略させてもらいます。ごめんね。`TeraTerm`か`PowerShellのssh`でラズパイのターミナル画面が出るところまで用意しておいてください。

Wi-Fiの場合もLANの場合も`mDNS`？のおかげでホストの欄に`pi@raspberrypi.local`って入れれば接続できます。固定IPにしていない場合でもわざわざ調べに行かなくていいのでとても便利。

ちなみに以下の画像は関係ないです。

![Imgur](https://i.imgur.com/3sOhTFh.png)

## 赤外線パターンを手に入れる

### 必要なパッケージをラズパイへインストール
黒い画面に入れていきます

```
sudo apt install pigpio python3-pigpio
sudo systemctl enable pigpiod.service
sudo systemctl start pigpiod
```

### GPIOの設定
赤外線モジュールのデータ線を`GPIO 18`に繋いだのでその旨を教えてあげます。

```
echo 'm 18 r    pud 18 u' > /dev/pigpio
```

### 赤外線パターン入手プログラムをダウンロード

```
curl http://abyz.me.uk/rpi/pigpio/code/irrp_py.zip | zcat > irrp.py
```

### 赤外線パターンを取得
先程ダウンロードしたプログラムを実行すると赤外線パターンを入手出来ます。  
以下のコマンドを実行した後、リモコンを赤外線受信モジュールへ向けてボタンを押します。

```
python3 irrp.py -r -g18 -f codes light_on --no-confirm --post 130
```

成功すると`Okey`まで出ます。

```
Recording
Press key for 'light_on'
Okay
```

赤外線パターンは`codes`というファイルに保存されます。

### 赤外線パターンを見る
以下のコマンドを打ち込むと赤外線パターンを記載したファイルを見ることが出来ます。

```
cat codes
```

![Imgur](https://i.imgur.com/kvgL2CS.png)

`[`から`]`で囲われてる数値を控えておきます。  
画像の例では`8953`から`]`の前まで。以下例

```
8953, 4544, 463, 730, 463, 1730, 463, 1730, 463, 586, 549, 586, 549, 586, 463, 586, 463, 586, 463, 1730, 463, 1730, 549, 586, 463, 586, 463, 586, 549, 1730, 463, 730, 463, 1730, 549, 586, 463, 586, 463, 730, 463, 586, 463, 1730, 549, 1730, 463, 1730, 463, 586, 549, 586, 463, 586, 463, 586, 463, 586, 463, 730, 463, 1730, 463, 1730, 463, 1730, 463, 41143, 8953, 2224, 463
```

**赤外線パターンの中身知りたい方は`NECフォーマットだけですが`適当にまとめたのでどうぞ：**[赤外線のNECフォーマットまとめ？](/posts/ir_nec_format/)  
別に見なくても分からなくても作れます。

# Xiaomi Mi 11 Lite 5G で送信

## テスト用アプリ用意しておきました。

赤外線のパターンを入れて送信できるか試せるアプリです。

![Imgur](https://i.imgur.com/WaXQlJj.png)

ソースコード：https://github.com/takusan23/IrSenDroid

APKダウンロード：https://github.com/takusan23/IrSenDroid/releases/tag/1.0

## AndroidManifest

適当にComposeプロジェクトを作成します。  
できたら、赤外線を使うので権限を`Manifest`に書き足します。

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="io.github.takusan23.irsendroid">

    <uses-permission android:name="android.permission.TRANSMIT_IR"/>

```

## 送信用関数の用意

`IrSendTool.kt`を作成して、以下をコピペ  

`LIGHT_OFF_DATA`と`LIGHT_ON_DATA`の配列は各自取得したパターンを入れてください。

```kotlin
object IrSendTool {

    /** NECのシーリングライトの 消灯ボタン を押したときに送信される赤外線のパターン */
    val LIGHT_OFF_DATA = listOf(
        8925, 4540, 514, 626, 514, 1730, 514, 626, 514, 626, 514, 626, 514, 626, 514, 626, 514, 1730, 514, 1730, 514, 626, 514, 1730, 514, 1730, 514, 626, 514, 1730, 514, 1730, 514, 626, 514, 626, 514, 1730, 514, 1730, 514, 1730, 514, 1730, 514, 1730, 514, 626, 514, 1730, 514, 1730, 514, 626, 514, 626, 514, 626, 514, 626, 514, 626, 514, 1730, 514, 626, 514
    )

    /** NECのシーリングライトの 全灯ボタン を押したときに送信される赤外線のパターン */
    val LIGHT_ON_DATA = listOf(
        8925, 4540, 514, 626, 514, 1730, 514, 626, 514, 626, 514, 626, 514, 626, 514, 626, 514, 1730, 514, 1730, 514, 626, 514, 1730, 514, 1730, 514, 626, 514, 1730, 514, 1730, 514, 626, 514, 626, 514, 1730, 514, 1730, 514, 1730, 514, 1730, 514, 1730, 514, 626, 514, 1730, 514, 1730, 514, 626, 514, 626, 514, 626, 514, 626, 514, 626, 514, 1730, 514, 626, 514
    )

    /**
     * 赤外線送信
     * @param context Context
     * @param pattern 赤外線パターン
     * */
    fun sendIr(context: Context, pattern: List<Int>) {
        val consumerIrManager = context.getSystemService(Context.CONSUMER_IR_SERVICE) as ConsumerIrManager
        // 赤外線利用可能かどうか
        if (consumerIrManager.hasIrEmitter()) {
            // 利用可能なら送信
            consumerIrManager.transmit(38_000, pattern.toIntArray())
        }
    }

}
```

使うときはこんな風に

```kotlin
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        IrSendTool.sendIr(this, IrSendTool.LIGHT_ON_DATA)

    }
}
```

## ComposeでちゃちゃっとUIを作る

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            IrSenDroidTheme {
                Surface(color = MaterialTheme.colors.background) {
                    HomeScreen()
                }
            }
        }
    }
}

@Preview(backgroundColor = 0xFFFFFF, showBackground = true)
@Composable
fun HomeScreenPrev() {
    HomeScreen()
}

@Composable
fun HomeScreen() {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        RoomLightOnButton()
        RoomLightOffButton()
    }
}

@Composable
fun RoomLightOnButton() {
    val context = LocalContext.current

    Button(
        modifier = Modifier.padding(10.dp),
        onClick = { IrSendTool.sendIr(context, IrSendTool.LIGHT_ON_DATA) }
    ) {
        Text(text = "照明ON")
    }
}

@Composable
fun RoomLightOffButton() {
    val context = LocalContext.current

    Button(
        modifier = Modifier.padding(10.dp),
        onClick = { IrSendTool.sendIr(context, IrSendTool.LIGHT_OFF_DATA) }
    ) {
        Text(text = "照明OFF")
    }
}
```

これで`Xiaomi Mi 11 Lite 5G`があればシーリングライト操作し放題です。やったね。

# 終わりに
赤外線送信付いてるのおもろいな。  
休日終わるの早すぎな～～～