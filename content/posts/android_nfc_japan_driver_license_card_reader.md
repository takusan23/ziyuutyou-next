---
title: Androidで運転免許証のICを読み取る
created_at: 2021-09-03
tags:
- Android
- Kotlin
- 運転免許証
---
どうもこんばんわ。  

`feng`がなんと！サウンドトラックを発売するみたいじゃないですか！！！。もう手に入らないと思ってたのにまじ？   
一瞬本当か疑ったけど`fengの上様がRTしてた`のと`ちゃんと予約開始日に予約できた`あたりマジだと思う。値段が安く見える謎  

![Imgur](https://i.imgur.com/r1OXk0z.png)

http://fengva.com/

# 本題
どうやら運転免許証にはICが埋め込んであるらしく、NFC Type-Bでやり取りできるらしい？  

# 仕様

## 警察公式の運転免許証IC仕様書
https://www.npa.go.jp/laws/notification/koutuu/menkyo/menkyo20210630_150.pdf

URL4んでたら「運転免許証　仕様」とかで検索すればPDFで出てくると思います。  
`2021/06/30`に改定されたバージョン`009`が現在のバージョンらしい。

なんか警察が公式で公開してるのってなんか意外。~~無限アラート事件とかCoinhive事件とかやってたくせに。~~

## AndroidでNFCやり取りドキュメント
https://developer.android.com/guide/topics/connectivity/nfc/advanced-nfc?hl=ja

今回は`IsoDep`クラスを使っていきます（後述）

# 環境

| なまえ  | あたい     |
|---------|------------|
| 端末    | Xperia 5 Ⅱ |
| Android | 11         |
| 言語    | Kotlin     |

## 必要なもの？

- AndroidでNFC搭載の実機
- 運転免許証
    - 1つ目の暗証番号を覚えている必要があります
    - 本籍の取得は2つ目の暗証番号も必要
    - 暗証番号を3回間違えるとロック（仕様書では閉塞って表現）されるので注意。もっと手軽ならいいのにね。
- 2進数、10進数、16進数の変換が出来る電卓みたいなアプリ
    - `Windows 10`に最初から入ってる電卓の`プログラマーモード`にすればいいです。

# 運転免許証のICに入っている中身
運転免許証IC仕様書の6ページ目の内容です。仕様書ではなんかタコ🐙の足みたいな絵が乗ってると思います。それです。 

- MF
    - DF1
        - EF01 記載事項（本籍以外。名前とか住所とか）
        - EF02 記載事項（本籍）
        - EF03 外字
        - EF04 記載事項変更等
        - EF05 記載事項変更
        - EF06 記載事項変更
        - EF07 電子署名
    - EF01 PIN 1
    - EF02 PIN 2
    - DF2
        - EF01 写真
    - EF2 PIN設定
    - EF01 共通データ要素
    - DF3
        - EF01

パソコンのファイル構造みたいですね。

今回は `DF1のEF01`にある記載事項（本籍以外）を取得することを目標に頑張っていきましょう。

# 運転免許証と通信した際に返ってくるデータについて
運転免許証IC仕様書の8ページ目の内容です。`基本符号化TLV`とか言われてるそうな。  

今回は記載事項を取得するわけですが、記載事項を取得すると氏名、住所、生年月日等全てまとめたバイト配列が返ってきます。以下のように。


| タグフィールド | 長さフィールド | 値フィールド                               | タグフィールド | 長さフィールド | ... |
|----------------|----------------|--------------------------------------------|----------------|----------------|-----|
| 1バイト        | 1バイト        | 長さフィールドを10進数に戻した値分のバイト | 1バイト        | 1バイト        | ... |

### 長さフィールド
長さフィールドが`0x0A`なら10進数に戻した`10`バイト分が値フィールドの長さであるということです。  
値フィールドが終わったら次のデータのタグフィールドが来て、その次の長さフィールドを見て値フィールドの長さを取得して...ってやっていきます。

### タグフィールド
`運転免許証のICに入っている中身`を見てもらうと、住所とか名前はすべて`DF1のEF01`にある`記載事項（本籍以外）`にまとめられています。  
それだと受け取ったバイト配列のどこからが住所の値で、どこからが名前がわからないため、16進数で出来た目印のようなものです。  

住所がなんの16進数の目印になっているかは仕様書に書いてあります。  
記載事項を例にすると住所は`0x17`、名前は`0x12`です。

### 値フィールド
値フィールドの中身がテキストなのかそれとも別のなにかなのかを知るには、仕様書に書いてある`タグフィールドの表`に`符 号`ってかいてあるのでそこを見ます。  
`データの内容`もここから確認できます。

例：住所 タグフィールド`0x17`、符号は`JIS X 0208`。Kotlinなら`SJIS`を文字コードに指定すればいける。  

### データ例
記載事項（本籍除く）のデータ例です。  
タグフィールドの表は仕様書の11ページ目を見てください。

```js
0x11, 0x01, 0x78, 0x12, 0x0A, 0x00, 0x00 ...
```

まず、`0x11`ですが、これは仕様書のタグフィールドの表と照らし合わせると、`JIS X 0208 制定年番号`で有ることが分かりますね。  
そして、次のバイト`0x01`が`JIS X 0208 制定年番号`の値フィールドの大きさを16進数で表しています。`0x01`を10進数に変換すると`1`ですので、この次`1`バイト分が値フィールドの長さであるということです。  
値フィールドが終わった次のバイト`0x12`は、仕様書のタグフィールドの表を見ると`氏名`であることが分かります。  
そして、その次の`0x0A`が`氏名の値フィールド`の長さを表しています。`0x0A`は10進数に変換すると`10`ですので、この次から`10`バイト分は氏名の値フィールドであるということです。

こんな感じに読んでいきます。

# 運転免許証と通信する際に送るデータについて
運転免許証IC仕様書の20ページ目の内容です。  
`APDU`って形式で送るらしい。  

最初のバイト(CLA)は`0x00`で固定。そこから先は以下の`コマンド`で変わってくる。

## SELECT FILE コマンド
このコマンドはカレントディレクトリを設定するときに使う。`cd`コマンドみたいな感じ？  
2バイト目(INS)が`0xA4`になります。  
3バイト目(P1)以降は使うときになったらまた説明入れます。

## VERIFY コマンド
このコマンドは暗証番号を照合するとき、または残り照合可能回数を確認する際にも利用する。  
2バイト目(INS)が`0x20`になる。  
3バイト目(P1)は`0x00`固定です。  
4バイト目(P2)以降は使うときになったらまた説明入れます。

## READ BINARY コマンド
このコマンドはデータを読み出すときに使う。  
2バイト目(INS)が`0xB0`になる。  
3バイト目(P1)以降は使うときになったらまた説明入れます。

# JIS X 0208
住所、氏名等の文字は`JIS X 0208`に沿って、16進数に変換され、保存されます。  

## 長いのやだから三行で
- `JIS X 0208`をAndroidで読める形に変換する際に使う文字コードは`JISコード`で行ける。
- `JIS X 0208`で変換されたバイト配列の先頭に`0x1B, 0x24, 0x42`を入れてから
- `String`クラスに突っ込む。文字コードは`charset("jis")`で

## JIS X 0208 は 符号化文字集合
`Shift_JIS`とか`UTF-8`とかの`文字符号化方式`のお友達ではないです。  

`符号化文字集合`ってのは文字ひとつひとつに番号を割り当てたものです。  
`文字符号化方式`ってのは上記の`符号化文字集合`をどうやって保存出来る形（バイト配列）にするかを決めてるものです。あとは複数の`符号化文字集合`を組み合わせたものだったりします。

- `Shift-JIS`
    - `JIS X 0201`と`JIS X 0208`を組み合わせている
    - 組み合わせる際に文字の番号が被らないよう、`Shift_JIS`では計算をしている
- `ISO-2022-JP / 別名 JISコード`
    - `JIS X 0211`、`JIS X 0201のラテン文字集合`、`ISO 646`、`JIS X 0208`などの符号化文字集合を組み合わせている。
    - こちらは、特定のバイト配列（エスケープシーケンス）を使うことで符号化文字集合を切り替えることが出来る。
        - `JIS X 0208`に切り替えるエスケープシーケンスは`0x1B, 0x24, 0x42`
    - 多分エスケープシーケンスで切り替えたら多分切り替えを戻さないと行けない気がするけど、戻さなくても動いてるのでいいか←？

今回は`Android`でも使えて、そのまま`JIS X 0208`の文字集合の値を入れて使える`JISコード`(`charset("jis")`)を使います。  

```kotlin
val encodedData = byteArrayOf(0x3c.toByte(), 0x56.toByte()) // "車" を JIS X 0208 にしたもの
val escapeSequence = byteArrayOf(0x1b.toByte(), 0x24.toByte(), 0x42.toByte()) // JIS X 0208に切り替えるエスケープシーケンス
val decodeString = String(escapeSequence + encodedData, charset("jis")) // ISO-2022-JP（JISコード）で戻す
println(decodeString)
```

# 流れ

- Android端末とNFCで接続する。
- `IsoDep#get()`でインスタンスを取得。
- `IsoDep#connect()`を呼び出して接続します。
- `SELECT FILE`コマンドを送信して`MF`にカレントディレクトリを設定します。
- `VERIFY`コマンドを送信して第一暗証番号を認証します。
- `SELECT FILE`コマンドを送信して`DF1`にカレントディレクトリを設定します。
- `READ BINARY`コマンドを送信して`EF01`のデータを読み出します。
- バイト配列を解析します。
- `IsoDep#close()`を呼び出して終了。

以上になります。  
今回はついでに残り照合回数と、共通データ要素も読み出してみます。

## NfcBじゃないの？
ADPUの送信は`IsoDep`じゃないとだめらしい。

# とりあえず運転免許証と通信するまで

## AndroidManifest.xml
`NFC`の権限が必要です。

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="io.github.takusan23.jdcardreader">

    <uses-permission android:name="android.permission.NFC" />
```

## activity_main.xml

`TextView`を置いておきます。

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
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:text="J(apan) D(river) Card Reader"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

## MainActivity.kt
今回は`Activity`に直接書いちゃいますね。  
一応Activityを離れたらNFC検出を止めるようにしてあります。  

`ByteArray.toHexString()`って関数は`ByteArray`の拡張関数になってて、文字列の16進数に変換してくれる関数です。

こんな風に→`println(byteArrayOf(0x63.toByte(), 0xC3.toByte()).toHexString()) // 出力 : 63, c3`

これ以降は`// ここにコマンドを送信するコードを入れる`の次からコードを書いていきます。

```kotlin
package io.github.takusan23.jdcardreader

import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.IsoDep
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.TextView

class MainActivity : AppCompatActivity() {

    private val textView by lazy { findViewById<TextView>(R.id.activity_main_text_view) }

    /** NFCを検出するのに使う */
    private val nfcAdapter by lazy { NfcAdapter.getDefaultAdapter(this) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)


    }

    override fun onResume() {
        super.onResume()
        nfcAdapter.enableReaderMode(
            this,
            { tag ->

                val isoDep = IsoDep.get(tag)
                isoDep.connect()

                // ここにコマンドを送信するコードを入れる

                isoDep.close()

            },
            NfcAdapter.FLAG_READER_NFC_B,
            null
        )
    }

    override fun onPause() {
        super.onPause()
        nfcAdapter.disableReaderMode(this)
    }

    /** 16進数に変換するやつ */
    fun ByteArray.toHexString() = this.joinToString { "%02x".format(it) }

}
```

## MFへカレントディレクトリを設定
運転免許証IC仕様書の20ページ目のMFの選択ってやつをそのまま使います。  

送信するコマンド(バイト配列)はこれです。  

| CLA  | INS  | P1   | P2   |
|------|------|------|------|
| 0x00 | 0xA4 | 0x00 | 0x00 |

```plaintext
0x00, 0xA4, 0x00, 0x00
```

んでもって成功したときに帰ってくるバイト配列はこんな感じです。  

| SW1        | SW2        |
|------------|------------|
| 1バイト    | 1バイト    |
| 90なら成功 | 00なら成功 |

失敗時の値は仕様書の23ページに書いてあるので見てください。

Kotlinだとこうです。

```kotlin
// カレントディレクトリをMFにする
val mfSelectCommand = byteArrayOf(
    0x00.toByte(),
    0xA4.toByte(),
    0x00.toByte(),
    0x00.toByte()
)
val mfSelectCommandResult = isoDep.transceive(mfSelectCommand)
if (mfSelectCommandResult[0] == 0x90.toByte()) {
    val text = """
        
        ---
        MF選択コマンド 成功
        ${mfSelectCommandResult.toHexString()}
    """.trimIndent()
    textView.append(text)
    println(text)
}
```

## 共通データ要素を読んで見る
記載事項は暗証番号が必要で、失敗したらまずいのでとりあえず認証不要な共通データ要素を読んでみます。

### カレントディレクトリを共通データ要素へ

送信するコマンドは以下です。  
`P1 / P2`に関しては、運転免許IC仕様書の22ページ目、`P1コーディング`、`P2コーディング`を参照してください。  
今回は、`P1`は`カレントDFの直下のEF`、`P2`は`最初又は唯一のファイルを選択`を指定しました。
2進数を16進数にして渡すだけです。

![Imgur](https://i.imgur.com/vJKuTN2.png)

`Le`は、この後続くデータフィールドの長さです。今回は`0x2F, 0x01`で2バイトなので、2を16進数にした`0x02`(先頭`0x`つけて1桁なら`0`で埋める)を渡します。

`MF/EF01`の共通データ要素の`EF識別子`は`0x2F, 0x01`なので、`Le`の次に入れます。

```plaintext
0x00, 0xA4, 0x02, 0x0C, 0x02, 0x2F, 0x01
```

| CLA  | INS  | P1   | P2   | Le   | データフィールド | データフィールド |
|------|------|------|------|------|------------------|------------------|
| 0x00 | 0xA4 | 0x02 | 0x0C | 0x02 | 0x2F             | 0x01             |


以下例です。

```kotlin
// カレントディレクトリを共通データ要素に設定する
val mfEf01SelectCommand = byteArrayOf(
    0x00.toByte(),
    0xA4.toByte(),
    0x02.toByte(),
    0x0C.toByte(),
    0x02.toByte(),
    0x2F.toByte(),
    0x01.toByte(),
)
val mfEf01SelectCommandResult = isoDep.transceive(mfEf01SelectCommand)
if (mfEf01SelectCommandResult[0] == 0x90.toByte()) {
    val text = """
        
        ---
        DF/EF01 共通データ要素 選択コマンド 成功
        ${mfEf01SelectCommandResult.toHexString()}
    """.trimIndent()
    textView.append(text)
    println(text)
}
```

### 共通データ要素を読み取る

送信するコマンドは以下です。  
`P1 / P2`に関しては、カレントディレクトリの中身を見るので`0x00, 0x00`でいいです。  
最後の`Le`ですが、共通データ要素の長さは17なので、16進数に変換した`0x11`を渡せばいいです。

![Imgur](https://i.imgur.com/dXHZinj.png)

```plaintext
0x00, 0xB0, 0x00, 0x00, 0x11
```

| CLA  | INS  | P1   | P2   | Le   |
|------|------|------|------|------|
| 0x00 | 0xA4 | 0x00 | 0x0C | 0x11 |

成功した場合は、最後から2番目の値が`0x90`になっているはずです。

#### 読み取った共通データ要素を解析
運転免許IC仕様書9ページ目参照。

読み取ったバイト配列の最後2つはステータス（成功したかどうか）が入っています。

最初の`0x45`は`カード発行者データ`で、仕様書バージョン(3バイト)、交付年月日(4バイト)、有効期限(4バイト)が連続で入っているそうです。  
その次の`0x0B`は`カード発行者データ`の長さが16進数で入っています。ので、10進数に戻すと`11`、`11バイト分`がカード発狂者データみたいです。  
仕様書バージョンの3バイト分は`SJIS`で変換します。交付年月日(4バイト。`YYMMDD`)、有効期限(4バイト。`YYMMDD`)は`文字列の16進数`にすればいいと思います。  

Kotlinだとこうです。

```kotlin
// カレントディレクトリを読み取る
val mfEf01ReadBinaryCommand = byteArrayOf(
    0x00.toByte(),
    0xB0.toByte(),
    0x00.toByte(),
    0x00.toByte(),
    0x11.toByte()
)
val mfEf01ReadBinaryCommandResult = isoDep.transceive(mfEf01ReadBinaryCommand)
// 成功した場合、最後から2番目の16進数が0x90
if (mfEf01ReadBinaryCommandResult[mfEf01ReadBinaryCommandResult.size - 2] == 0x90.toByte()) {
    // カード発行者データの長さを取得
    val cardPublisherDataLength = mfEf01ReadBinaryCommandResult[1].toInt() // 多分11
    // 先頭から cardPublisherDataLength 分のバイト配列取得
    val cardPublisherDataBinary = mfEf01ReadBinaryCommandResult.copyOfRange(2, 2 + cardPublisherDataLength)
    // 最初の3バイトが仕様書バージョン（SJIS変換後確認可能）、次の4バイトが交付年月日、次の4バイトが有効期限
    val version = cardPublisherDataBinary.copyOfRange(0, 3).toString(charset("sjis"))
    val publishDate = cardPublisherDataBinary.copyOfRange(4, 7).joinToString(separator = "") { "%02x".format(it) }
    val effectiveDate = cardPublisherDataBinary.copyOfRange(8, 11).joinToString(separator = "") { "%02x".format(it) }
    val text = """
        
        ---
        カレントディレクトリ 読み取りコマンド 成功
        ${mfEf01ReadBinaryCommandResult.toHexString()}
        仕様書バージョン：$version
        発行年月日：$publishDate
        有効期限：$effectiveDate
    """.trimIndent()
    textView.append(text)
    println(text)
}
```

## 残り照合可能回数(暗証番号ミスった回数)を取得してみる
後何回暗証番号を間違えることが出来るのか調べてみます。  
ちなみに3回間違えると読み取りできなくなります（仕様書曰く）。仕様書では読み取りできない状態のことを`閉塞`って呼んでいる。  
**なお運転免許ICが読み取り不可の状態でも運転はできるらしい**

### 残り照合可能回数へ移動する
運転免許IC仕様書24ページ目、`残りの照合許容回数の出力指定`をそのまま使います。

コマンドは以下です。

| CLA  | INS  | P1   | P2   |
|------|------|------|------|
| 0x00 | 0x20 | 0x00 | 0x81 |

```plaintext
0x00, 0x20, 0x00, 0x81
```

`P2`に関してですが、`0x81`を指定することで、`MF/IEF01`(暗証番号1)の`EF識別子`を指定しています。  
多分`P2`を`0x80`(カレントディレクトリを指定)にして、このコマンド実行前に`SELECT FILE コマンド`で`MF/IEF01`へカレントディレクトリを移動しもいいと思います。

### 残り照合可能回数を解析する

以下の2バイトが帰ってきます。  
```plaintext
0x63, 0xC3
```

最初のバイトが`0x63`なら成功です。  
それで見てほしいのは`0xC3`の部分で、最後の`3`が残り照合可能回数です。  
残り2回の場合は`0xC2`になるということです。

Kotlinで書くとこうです。

```kotlin
// 残り照合可能回数を取得する
val retryCountVerifyCommand = byteArrayOf(
    0x00.toByte(),
    0x20.toByte(),
    0x00.toByte(),
    0x81.toByte()
)
val retryCountVerifyCommandResult = isoDep.transceive(retryCountVerifyCommand)
println(retryCountVerifyCommandResult.toHexString())
if (retryCountVerifyCommandResult[0] == 0x63.toByte()) {
    val retryCountHex = retryCountVerifyCommandResult.last().toInt() - 0xC0 // 0xC0を引けば最後が残る
    val retryCount = "%x".format(retryCountHex).last() // ffffff03みたいな感じになる、ので最後だけ取得
    val text = """
        
        ---
        残り照合可能回数 読み取りコマンド 成功
        ${retryCountVerifyCommandResult.toHexString()}
        残り照合可能回数：$retryCount
    """.trimIndent()
    textView.append(text)
    println(text)
}
```

## 暗証番号を照合する
運転免許証の表面に書いてある情報（顔写真以外）`DF1のEF01`を読み取るには認証を通過する必要があります。  
（表面に書いてあるなら暗証番号の必要性... #とは）

運転免許証IC仕様書24ページ目、`照合(Case 3)`を使って認証します。  
暗証番号の照合には`VERIFY`コマンドを送信します。  

### 暗証番号をJIS X 0201に変換する
暗証番号を`JIS X 0201`へ変換します。  

`JIS X 0201`と数値の相対表を用意しました。

| JIS X 0201 | 数値 |
|------------|------|
| 0x30       | 0    |
| 0x31       | 1    |
| 0x32       | 2    |
| 0x33       | 3    |
| 0x34       | 4    |
| 0x35       | 5    |
| 0x36       | 6    |
| 0x37       | 7    |
| 0x38       | 8    |
| 0x39       | 9    |

例えば暗証番号が「2525」なら、`0x32, 0x35, 0x32, 0x35`になります。

今回は変換用の関数でも用意しておきましょう。

```kotlin
fun toJIS(c: Char): Byte {
    return when (c) {
        '0' -> 0x30
        '1' -> 0x31
        '2' -> 0x32
        '3' -> 0x33
        '4' -> 0x34
        '5' -> 0x35
        '6' -> 0x36
        '7' -> 0x37
        '8' -> 0x38
        '9' -> 0x39
        else -> 0x00
    }.toByte()
}
```

### それを踏まえて暗証番号を照合するコマンド
これです。  
`INS`は`VERIFYコマンド`なので`0x20`、  
`P1`は固定`0x00`です。  
`P2`は`運転免許証IC仕様書24ページ目`の`P2エンコーディング`で、`短縮EF識別子指定`を利用します。暗証番号1は`IEF01`で、`EF識別子`が`0001`なので、  
`P2エンコーディング`に照らし合わせると、`10000001`になります(100は固定)。これを16進数に変換した値を入れます。  
`Lc`は暗証番号の長さです。4バイトなので`0x04`です。  
その後は変換した暗証番号を入れます。

| CLA  | INS  | P1   | P2   | Lc   | 変換した暗証番号1桁目 | 変換した暗証番号2桁目 | 変換した暗証番号3桁目 | 変換した暗証番号4桁目 |
|------|------|------|------|------|-----------------------|-----------------------|-----------------------|-----------------------|
| 0x00 | 0x20 | 0x00 | 0x81 | 0x04 | 各自                  | 各自                  | 各自                  | 各自                  |

```plaintext
0x00, 0x20, 0x00, 0x81, 0x04, <暗証番号をJIS X 0201で変換した4バイト>
```

暗証番号が「2525」の場合は以下のようになります。

```plaintext
0x00, 0x20, 0x00, 0x81, 0x04, 0x32, 0x35, 0x32, 0x35
```

成功した場合は最初の値が`0x90`になります。

それをKotlinでやるとこうなります。

```kotlin
// 暗証番号1を照合する
val pinCode1CharList = listOf(0, 0, 0, 0) // 各自暗証番号を入力
val pinCode1EncodedList = pinCode1CharList.map { toJIS(it.toString()[0]) }
val pinCode1VerifyCommand = byteArrayOf(
    0x00.toByte(),
    0x20.toByte(),
    0x00.toByte(),
    0x81.toByte(),
    0x04.toByte(),
) + pinCode1EncodedList
val pinCode1VerifyCommandResult = isoDep.transceive(pinCode1VerifyCommand)
if (pinCode1VerifyCommandResult[pinCode1VerifyCommandResult.size - 2] == 0x90.toByte()) {
    val text = """
        
        ---
        第一暗証番号の照合 成功
        ${pinCode1VerifyCommandResult.toHexString()}
    """.trimIndent()
    textView.append(text)
    println(text)
}
```

### ちなみに閉塞状態になると

```plaintext
0x69, 0x84
```

が帰ってきます。（暗証番号間違えたまま読み取って閉塞した）

### 閉塞状態を解除してもらった話
警察署 か 運転免許試験場 で解除してもらえます。

試験場の場合は**みどりの窓口**行って、受付番号発券して呼ばれるまで待って、呼ばれたら「暗証番号間違えてICカードロックされたので解除してください。」的なことを伝えて、運転免許証を渡せば数十秒後に解除された運転免許証が帰ってきます。  
私は暗証番号覚えてるって伝えたから数十秒で終わったけど、暗証番号忘れてる場合はもっと掛かるかもしれない？

警察署の場合はしらん。

## 記載事項（DF1/EF01）を読み出す
暗証番号の照合を終えたのでやっと読み出せます。  
カレントディレクトリを`DF1`にして、`READ BINARY`で`EF01`を読み出すようにします。

### カレントディレクトリをDF1に設定する
運転免許証IC仕様書22ページ目参照。

コマンドはこうです。`SELECT FILE`コマンドです。

`P1`は、`P1エンコーディングの表`から`DF名による直接選択`を利用したいので、2進数`100`であることがわかります。これを16進数にした`0x04`を渡します。  
`P2`は、`P2エンコーディング`の表から、`最初または唯一のファイルを選択`を利用したいので、2進数`1100`であることがわかります。これを16進数にした`0x0C`を渡します。  
`LC`は、`DF名`の長さをいれます。後述しますが、`DF1`の選択には16バイト必要なので、10進数`16`を16進数にした`0x10`を渡します。  
`DF1のアプリケーション識別子(AID)`なんですが、以下です。運転免許証IC仕様書7ページ目`DF1のアプリケーション識別子(AID)`参照。  

```plaintext
0xA0, 0x00, 0x00, 0x02, 0x31, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
```

| CLA  | INS  | P1   | P2   | Lc   | DF1のアプリケーション識別子(AID) |
|------|------|------|------|------|----------------------------------|
| 0x00 | 0xA4 | 0x04 | 0x0C | 0x10 | 後述                             |

```plaintext
0x00, 0xA4, 0x04, 0x0C, 0x10, 0xA0, 0x00, 0x00, 0x02, 0x31, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
```

成功すると、最初の値が`0x90`になります。  

これを`Kotlin`で書くとこう

```kotlin
// カレントディレクトリをDF1へ
val df1SelectCommand = byteArrayOf(
    0x00.toByte(),
    0xA4.toByte(),
    0x04.toByte(),
    0x0C.toByte(),
    0x10.toByte(),
    0xA0.toByte(),
    0x00.toByte(),
    0x00.toByte(),
    0x02.toByte(),
    0x31.toByte(),
    0x01.toByte(),
    0x00.toByte(),
    0x00.toByte(),
    0x00.toByte(),
    0x00.toByte(),
    0x00.toByte(),
    0x00.toByte(),
    0x00.toByte(),
    0x00.toByte(),
    0x00.toByte(),
    0x00.toByte(),
)
val df1SelectCommandResult = isoDep.transceive(df1SelectCommand)
if (df1SelectCommandResult[0] == 0x90.toByte()) {
    val text = """
        
        ---
        DF1選択 成功
        ${df1SelectCommandResult.toHexString()}
    """.trimIndent()
    textView.append(text)
    println(text)
}
```

### DF1のEF01（記載事項）を読み出すコマンド
運転免許証IC仕様書26ページ目参照。

長かった。いやまだバイト配列を解析する仕事が残ってるんですが。 

以下のコマンドです。`READ BINARY`の`P1/P2`で`EF01`を指定するので、`SELECT FILE`で予め移動しておく必要はないです。  
`P1`、`P2`は`運転免許証IC仕様書26ページ目のP1-P2のコーディング(相対アドレス８ビット指定)`の表から、`P1`で`EF01`を`短縮EF識別子`で指定するため(EF01の短縮EF識別子は`0001`)、`10000001`、`P2`が`00000000`であることがわかります。  
`Lc`ですが、`運転免許証IC仕様書7ページ目のファイル構成`から、記載事項のファイル容量が`880`バイトであることがわかるので、10進数`880`を16進数にした`0x370`をバイト配列にした`0x03, 0x80`を渡すんですが、  
`運転免許証IC仕様書26ページ目のコマンドAPDU`を見ると、`Lc`は`1バイトか3バイト`のどっちかなので、先頭に`0x00`をいれて3バイトにした`0x00, 0x03, 0x80`を渡します。

| CLA  | INS  | P1   | P2   | Lc   | Lc   | Lc   |
|------|------|------|------|------|------|------|
| 0x00 | 0xB0 | 0x81 | 0x00 | 0x00 | 0x03 | 0x70 |

```plaintext
0x00, 0xB0, 0x81, 0x00, 0x00, 0x03, 0x70
```

成功した場合は、バイト配列の最後から二番目が`0x90`になります。  

これをKotlinで書くとこう。

```kotlin
// 記載事項(DF1/EF01)を読み出す
val df1Ef01ReadBinaryCommand = byteArrayOf(
    0x00.toByte(),
    0xB0.toByte(),
    0x81.toByte(),
    0x00.toByte(),
    0x00.toByte(),
    0x03.toByte(),
    0x70.toByte(),
)
val df1Ef01ReadBinaryCommandResult = isoDep.transceive(df1Ef01ReadBinaryCommand)
if (df1Ef01ReadBinaryCommandResult[df1Ef01ReadBinaryCommandResult.size - 2] == 0x90.toByte()) {
    val text = """
        
        ---
        DF1/EF01読み出しコマンド 成功
        ${df1Ef01ReadBinaryCommandResult.toHexString()}
    """.trimIndent()
    textView.append(text)
    println(text)
}
```

### DF1のEF01のバイト配列を読める形に変換する
運転免許証IC仕様書11ページ目参照。  
[運転免許証と通信した際に返ってくるデータについて](/posts/android_nfc_japan_driver_license_card_reader/#運転免許証と通信した際に返ってくるデータについて)の説明が役に立つわけですね（くそ分かりにくい）  
  
氏名、住所がどの順番で入っているかは`運転免許証IC仕様書の11ページ目`の表に書いてあります。

Kotlinのコードは、`さっき書いたif`の中に書いていってください。以下の`// こっから`ってところから

```kotlin
if (df1Ef01ReadBinaryCommandResult[df1Ef01ReadBinaryCommandResult.size - 2] == 0x90.toByte()) {
    val text = """
        
        ---
        DF1/EF01読み出しコマンド 成功
        ${df1Ef01ReadBinaryCommandResult.toHexString()}
    """.trimIndent()
    textView.append(text)
    println(text)

    // こっから

}
```

#### JIS X 0208 制定年番号
最初のデータは`JIS X 0208 制定年番号`ってのが入っているみたいです。以下例
```plaintext
0x11, 0x01, 0x78
```

`0x11`は`JIS X 0208 制定年番号`のタグです。  
`0x01`はその次に来る値フィールドの長さです。今回は`0x01`を10進数にした`1`バイト分が値フィールドの長さです。  
`0x78`が値フィールドの中身ですが、`78`の場合は1978年に制定された`JIS C 6226`で符号化されたというわけらしいのですがよくわかりません。  
~~面白くないので飛ばします。~~

```kotlin
// JIS X 0208
val jisX0208Data = df1Ef01ReadBinaryCommandResult.copyOfRange(0, 3)
val jisX0208 = "%02x".format(jisX0208Data.last())
```

#### 氏名
次のデータは氏名です。氏名は値フィールドが可変長なので（当たり前）注意してください。以下例  
```plaintext
0x12, 0x0A, <JIS X 0208で変換したデータ>
```

`0x12`は`氏名`のタグです。  
`0x0A`が、この後の値フィールドの長さを16進数で表したものです。10進数に戻した値が値フィールドの長さになります。  
値フィールドは`JIS X 0208`で変換しているので、あとで戻します。

#### JIS X 0208 を読める形に戻す
上の方でも書きましたが、戻すには、`JIS X 0208`のデータの先頭にエスケープシーケンスとして`0x1B, 0x24, 0x42`を付けて、`JISコード`として変換してあげればいいです。

Kotlinで書くとこうです。(JIS X 0208 制定年番号に書き足す感じで）

```kotlin
// データを解析する
// 現在のバイト配列の位置？
var length = 0

// JIS X 0208
length = 3
val jisX0208Data = df1Ef01ReadBinaryCommandResult.copyOfRange(0, length)
val jisX0208 = "%02x".format(jisX0208Data.last())

// 名前
val nameLength = df1Ef01ReadBinaryCommandResult[length + 1]
val nameData = df1Ef01ReadBinaryCommandResult.copyOfRange(length + 2, length + 2 + nameLength.toInt())
val escapeSequence = byteArrayOf(0x1b.toByte(), 0x24.toByte(), 0x42.toByte())
val name = String(escapeSequence + nameData, charset("jis"))
length += 2 + nameLength.toInt()

val dfEf01FormattedText = """
    
    ---
    JIS X 0208 制定年番号：$jisX0208
    名前：$name
""".trimIndent()
textView.append(dfEf01FormattedText)
println(dfEf01FormattedText)
```

氏名が出力されたら成功です。おめ  
氏と名の間にはスペースが入ってますが仕様です。

#### 見ずらいので関数にまとめる
本当はタグフィールドから値を取得する関数を作れればいいんですが、  
タグフィールドで利用している16進数、これ値フィールドでも普通に使われているので多分indexOfとかで検索かけてもうまくいきません。  

なんで、住所だけが欲しい場合でも順番に取得していく必要があります。それは面倒なので関数を書いて少しだけでも楽になりましょう。

```kotlin
/**
 * 次のデータを取得する
 * @param currentPos 今の位置。初回時は0？
 * @return Intは、今の位置を返します。２回目以降この関数を呼ぶ際に使ってください、ByteArrayは値フィールドです
 * */
private fun ByteArray.getValueField(currentPos: Int): Pair<Int, ByteArray> {
    // 長さを読み取る
    val length = this[currentPos + 1]
    return currentPos + 2 + length to copyOfRange(currentPos + 2, currentPos + 2 + length)
}

/** JIS X 0208で変換されたバイト配列を戻す */
private fun ByteArray.toJISX0208(): String {
    // 変換する。JISコードで変換できる。JISコードはエスケープシーケンスにより、文字集合を切り替えることができる
    val escapeSequence = byteArrayOf(0x1B.toByte(), 0x24.toByte(), 0x42.toByte()) // JIS X 0208
    return String(escapeSequence + this, charset("jis"))
}

/** JIS X 0201で変換されたバイト配列を戻す */
private fun ByteArray.toJISX0201(): String {
    // 変換する。JISコードで変換できる。JISコードはエスケープシーケンスにより、文字集合を切り替えることができる
    val escapeSequence = byteArrayOf(0x1B.toByte(), 0x28.toByte(), 0x42.toByte()) // ASCII
    return String(escapeSequence + this, charset("jis"))
}

/** JIS X 0201で変換されたバイト配列を戻して、日付形式にする */
private fun ByteArray.toJISX0201DateString(): String {
    // とりあえずJIS X 0201の変換後データを取得
    val valueField = this.toJISX0201()
    val gengo = when (valueField.first()) {
        '1' -> "明治"
        '2' -> "大正"
        '3' -> "昭和"
        '4' -> "平成"
        else -> "令和"
    }
    val year = valueField.substring(1, 3)
    val month = valueField.substring(3, 5)
    val date = valueField.substring(5, 7)
    return "$gengo ${year}年 ${month}月 ${date}日"
}
```

上記の拡張関数を利用して、制定年番号、氏名を取得する部分を書き換えるとこんな感じ。

```kotlin
var currentPos = 0
// 記載事項を上から順番に取得していく
val byteArrayList = mutableListOf<ByteArray>()
repeat(17) {
    val (pos, data) = df1Ef01ReadBinaryCommandResult.getValueField(currentPos)
    byteArrayList.add(data)
    currentPos = pos
}

// JIS X 0208 制定年番号
val jisX0208 = "%02x".format(byteArrayList[0].last())
// 名前
val name = byteArrayList[1].toJISX0208()
// 読み
val yomi =  byteArrayList[2].toJISX0208()
// 通称名
val tuusyoumei = byteArrayList[3].toJISX0208()
// 統一氏名
val touitusimei = byteArrayList[4].toJISX0208()
// 生年月日
val birthday = byteArrayList[5].toJISX0201DateString()
// 住所
val location = byteArrayList[6].toJISX0208()
// 交付年月日
val registeredAt =  byteArrayList[7].toJISX0201DateString()
// 照会番号
val syoukaiNum = byteArrayList[8].toJISX0201()
// 免許証の色区分
val color = byteArrayList[9].toJISX0208()
// 有効期限
val endTimeAt =byteArrayList[10].toJISX0201DateString()
// 運転免許の条件。メガネなど
val requirement1 = byteArrayList[11].toJISX0208()
val requirement2 = byteArrayList[12].toJISX0208()
val requirement3 = byteArrayList[13].toJISX0208()
val requirement4 = byteArrayList[14].toJISX0208()
// 公安委員会名
val publicSafetyCommissionName = byteArrayList[15].toJISX0208()
// 運転免許証の番号
val cardNumber = byteArrayList[16].toJISX0201()

val dfEf01FormattedText = """
    
    ---
    JIS X 0208 制定年番号：$jisX0208
    名前：$name
    読み：$yomi
    通称名：$tuusyoumei
    統一氏名：$touitusimei
    住所：$location
    生年月日：$birthday
    交付年月日：$registeredAt
    有効期限：$endTimeAt
    照会番号：$syoukaiNum
    色区分：$color
    運転免許の条件１：$requirement1
    運転免許の条件２：$requirement2
    運転免許の条件３：$requirement3
    運転免許の条件４：$requirement4
    公安委員会名：$publicSafetyCommissionName
    運転免許証の番号：$cardNumber
""".trimIndent()
textView.append(dfEf01FormattedText)
println(dfEf01FormattedText)
```

#### 生年月日、交付年月日等の日付のデータについて
生年月日、交付年月日等の日付に関わるデータは`JIS X 0201`で保存されており、  
変換後の先頭の数字は元号を表しており、`明治=1, 大正=2, 昭和=3, 平成=4, 令和=5`になります。（運転免許証IC仕様書11ページ目 注6）  
その次の二文字は、和暦の年を表しています。  
その次の二文字は月、その次の二文字が日になります。  

例(今更だけど16進数なので`0x`をつけました)：

```plaintext
0x16, 0x07, 0x34, 0x31, 0x34, 0x30, 0x39, 0x31, 0x33
```

`0x16`が生年月日で有ることを表すタグフィールド、  
`0x07`がこの後続く値フィールドの長さです。10進数にした7バイト分が値フィールドの長さになります。  
`0x34`から`0x33`までが値フィールドの中身です。`JIS X 0201`で変換できます。

上記のバイト配列を変換した結果です。

```plaintext
4140913
```

先頭の数字が元号を表しており、`4`の場合は`平成`になります。  

よって、上記のバイト配列の値は`平成14年 09月 13日`と表すことが出来ます。  

#### 終わりに
全部くっつけたソースコードです。

<span style="color:red;font-size:20px">// 暗証番号1を照合する</span>の部分は各自自分の暗証番号を入力してください。

```kotlin
class MainActivity : AppCompatActivity() {

    private val textView by lazy { findViewById<TextView>(R.id.activity_main_text_view) }

    /** NFCを検出するのに使う */
    private val nfcAdapter by lazy { NfcAdapter.getDefaultAdapter(this) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

    }

    override fun onResume() {
        super.onResume()
        nfcAdapter.enableReaderMode(
            this,
            { tag ->

                val isoDep = IsoDep.get(tag)
                isoDep.connect()

                // ここにコマンドを送信するコードを入れる

                // カレントディレクトリをMFにする
                val mfSelectCommand = byteArrayOf(
                    0x00.toByte(),
                    0xA4.toByte(),
                    0x00.toByte(),
                    0x00.toByte()
                )
                val mfSelectCommandResult = isoDep.transceive(mfSelectCommand)
                if (mfSelectCommandResult[0] == 0x90.toByte()) {
                    val text = """
                        
                        ---
                        MF選択コマンド 成功
                        ${mfSelectCommandResult.toHexString()}
                    """.trimIndent()
                    textView.append(text)
                    println(text)
                }

                // カレントディレクトリを共通データ要素に設定する
                val mfEf01SelectCommand = byteArrayOf(
                    0x00.toByte(),
                    0xA4.toByte(),
                    0x02.toByte(),
                    0x0C.toByte(),
                    0x02.toByte(),
                    0x2F.toByte(),
                    0x01.toByte(),
                )
                val mfEf01SelectCommandResult = isoDep.transceive(mfEf01SelectCommand)
                if (mfEf01SelectCommandResult[0] == 0x90.toByte()) {
                    val text = """
                        
                        ---
                        DF/EF01 共通データ要素 選択コマンド 成功
                        ${mfEf01SelectCommandResult.toHexString()}
                    """.trimIndent()
                    textView.append(text)
                    println(text)
                }

                // カレントディレクトリを読み取る
                val mfEf01ReadBinaryCommand = byteArrayOf(
                    0x00.toByte(),
                    0xB0.toByte(),
                    0x00.toByte(),
                    0x00.toByte(),
                    0x11.toByte()
                )
                val mfEf01ReadBinaryCommandResult = isoDep.transceive(mfEf01ReadBinaryCommand)
                // 成功した場合、最後から2番目の16進数が0x90
                if (mfEf01ReadBinaryCommandResult[mfEf01ReadBinaryCommandResult.size - 2] == 0x90.toByte()) {
                    // カード発行者データの長さを取得
                    val cardPublisherDataLength = mfEf01ReadBinaryCommandResult[1].toInt() // 多分11
                    // 先頭から cardPublisherDataLength 分のバイト配列取得
                    val cardPublisherDataBinary = mfEf01ReadBinaryCommandResult.copyOfRange(2, 2 + cardPublisherDataLength)
                    // カード発狂者データ、最初の3バイトが仕様書バージョン（SJIS変換後確認可能）、次の4バイトが交付年月日、次の4バイトが有効期限
                    val version = cardPublisherDataBinary.copyOfRange(0, 3).toString(charset("sjis"))
                    val publishDate = cardPublisherDataBinary.copyOfRange(4, 7).joinToString(separator = "") { "%02x".format(it) }
                    val effectiveDate = cardPublisherDataBinary.copyOfRange(8, 11).joinToString(separator = "") { "%02x".format(it) }
                    val text = """
                        
                        ---
                        カレントディレクトリ 読み取りコマンド 成功
                        ${mfEf01ReadBinaryCommandResult.toHexString()}
                        仕様書バージョン：$version
                        発行年月日：$publishDate
                        有効期限：$effectiveDate
                    """.trimIndent()
                    textView.append(text)
                    println(text)
                }

                // 残り照合可能回数を取得する
                val retryCountVerifyCommand = byteArrayOf(
                    0x00.toByte(),
                    0x20.toByte(),
                    0x00.toByte(),
                    0x81.toByte()
                )
                val retryCountVerifyCommandResult = isoDep.transceive(retryCountVerifyCommand)
                println(retryCountVerifyCommandResult.toHexString())
                if (retryCountVerifyCommandResult[0] == 0x63.toByte()) {
                    val retryCountHex = retryCountVerifyCommandResult.last().toInt() - 0xC0 // 0xC0を引けば最後が残る
                    val retryCount = "%x".format(retryCountHex).last() // ffffff03みたいな感じになる、ので最後だけ取得
                    val text = """
                        
                        ---
                        残り照合可能回数 読み取りコマンド 成功
                        ${retryCountVerifyCommandResult.toHexString()}
                        残り照合可能回数：$retryCount
                    """.trimIndent()
                    textView.append(text)
                    println(text)
                }

                // 暗証番号1を照合する
                val pinCode1CharList = listOf(0, 0, 0, 0) // 各自暗証番号を入力
                val pinCode1EncodedList = pinCode1CharList.map { toJIS(it.toString()[0]) }
                val pinCode1VerifyCommand = byteArrayOf(
                    0x00.toByte(),
                    0x20.toByte(),
                    0x00.toByte(),
                    0x81.toByte(),
                    0x04.toByte(),
                ) + pinCode1EncodedList
                val pinCode1VerifyCommandResult = isoDep.transceive(pinCode1VerifyCommand)
                println(pinCode1VerifyCommandResult.toHexString())
                if (pinCode1VerifyCommandResult[pinCode1VerifyCommandResult.size - 2] == 0x90.toByte()) {
                    val text = """
                        
                        ---
                        第一暗証番号の照合 成功
                        ${pinCode1VerifyCommandResult.toHexString()}
                    """.trimIndent()
                    textView.append(text)
                    println(text)
                }

                // カレントディレクトリをDF1へ
                val df1SelectCommand = byteArrayOf(
                    0x00.toByte(),
                    0xA4.toByte(),
                    0x04.toByte(),
                    0x0C.toByte(),
                    0x10.toByte(),
                    0xA0.toByte(),
                    0x00.toByte(),
                    0x00.toByte(),
                    0x02.toByte(),
                    0x31.toByte(),
                    0x01.toByte(),
                    0x00.toByte(),
                    0x00.toByte(),
                    0x00.toByte(),
                    0x00.toByte(),
                    0x00.toByte(),
                    0x00.toByte(),
                    0x00.toByte(),
                    0x00.toByte(),
                    0x00.toByte(),
                    0x00.toByte(),
                )
                val df1SelectCommandResult = isoDep.transceive(df1SelectCommand)
                if (df1SelectCommandResult[0] == 0x90.toByte()) {
                    val text = """
                        
                        ---
                        DF1選択 成功
                        ${df1SelectCommandResult.toHexString()}
                    """.trimIndent()
                    textView.append(text)
                    println(text)
                }

                // 記載事項(DF1/EF01)を読み出す
                val df1Ef01ReadBinaryCommand = byteArrayOf(
                    0x00.toByte(),
                    0xB0.toByte(),
                    0x81.toByte(),
                    0x00.toByte(),
                    0x00.toByte(),
                    0x03.toByte(),
                    0x70.toByte(),
                )
                val df1Ef01ReadBinaryCommandResult = isoDep.transceive(df1Ef01ReadBinaryCommand)
                if (df1Ef01ReadBinaryCommandResult[df1Ef01ReadBinaryCommandResult.size - 2] == 0x90.toByte()) {
                    val text = """
                        
                        ---
                        DF1/EF01読み出しコマンド 成功
                        データの長さ：${df1Ef01ReadBinaryCommandResult.size}
                    """.trimIndent()
                    textView.append(text)
                    println(df1Ef01ReadBinaryCommandResult.toHexString())
                    println(text)

                    var currentPos = 0
                    // 記載事項を上から順番に取得していく
                    val byteArrayList = mutableListOf<ByteArray>()
                    repeat(35) {
                        val (pos, data) = df1Ef01ReadBinaryCommandResult.getValueField(currentPos)
                        byteArrayList.add(data)
                        currentPos = pos
                    }

                    // JIS X 0208 制定年番号
                    val jisX0208 = "%02x".format(byteArrayList[0].last())
                    // 名前
                    val name = byteArrayList[1].toJISX0208()
                    // 読み
                    val yomi = byteArrayList[2].toJISX0208()
                    // 通称名
                    val tuusyoumei = byteArrayList[3].toJISX0208()
                    // 統一氏名
                    val touitusimei = byteArrayList[4].toJISX0208()
                    // 生年月日
                    val birthday = byteArrayList[5].toJISX0201DateString()
                    // 住所
                    val location = byteArrayList[6].toJISX0208()
                    // 交付年月日
                    val registeredAt = byteArrayList[7].toJISX0201DateString()
                    // 照会番号
                    val syoukaiNum = byteArrayList[8].toJISX0201()
                    // 免許証の色区分
                    val color = byteArrayList[9].toJISX0208()
                    // 有効期限
                    val endTimeAt = byteArrayList[10].toJISX0201DateString()
                    // 運転免許の条件。メガネなど
                    val requirement1 = byteArrayList[11].toJISX0208()
                    val requirement2 = byteArrayList[12].toJISX0208()
                    val requirement3 = byteArrayList[13].toJISX0208()
                    val requirement4 = byteArrayList[14].toJISX0208()
                    // 公安委員会名
                    val publicSafetyCommissionName = byteArrayList[15].toJISX0208()
                    // 運転免許証の番号
                    val cardNumber = byteArrayList[16].toJISX0201()
                    // 他の免許
                    val nirin = byteArrayList[17].toJISX0201DateString()
                    val hoka = byteArrayList[18].toJISX0201DateString()
                    val nisyu = byteArrayList[19].toJISX0201DateString()
                    val oogata = byteArrayList[20].toJISX0201DateString()
                    val hutuu = byteArrayList[21].toJISX0201DateString()
                    val oogatatokusyu = byteArrayList[22].toJISX0201DateString()
                    val oogatazidounirin = byteArrayList[23].toJISX0201DateString()
                    val hutuuzidounirin = byteArrayList[24].toJISX0201DateString()
                    val kogatatokusyu = byteArrayList[25].toJISX0201DateString()
                    val gentuki = byteArrayList[26].toJISX0201DateString()
                    val kanninn = byteArrayList[27].toJISX0201DateString()
                    val oogatanisyu = byteArrayList[28].toJISX0201DateString()
                    val hutuunisyu = byteArrayList[29].toJISX0201DateString()
                    val oogataokusyunisyu = byteArrayList[30].toJISX0201DateString()
                    val kenninnnisyu = byteArrayList[31].toJISX0201DateString()
                    val tyuugata = byteArrayList[32].toJISX0201DateString()
                    val tyuugatanisyu = byteArrayList[33].toJISX0201DateString()
                    val zyuntyuugata = byteArrayList[34].toJISX0201DateString()

                    val dfEf01FormattedText = """
                        
                        ---
                        JIS X 0208 制定年番号：$jisX0208
                        名前：$name
                        読み：$yomi
                        通称名：$tuusyoumei
                        統一氏名：$touitusimei
                        住所：$location
                        生年月日：$birthday
                        交付年月日：$registeredAt
                        有効期限：$endTimeAt
                        照会番号：$syoukaiNum
                        色区分：$color
                        運転免許の条件１：$requirement1
                        運転免許の条件２：$requirement2
                        運転免許の条件３：$requirement3
                        運転免許の条件４：$requirement4
                        公安委員会名：$publicSafetyCommissionName
                        運転免許証の番号：$cardNumber
                        免許の年月日(二・小・原)：${nirin ?: "未取得"}
                        免許の年月日(他)：${hoka ?: "未取得"}
                        免許の年月日(二種)：${nisyu ?: "未取得"}
                        免許の年月日(大型)：${oogata ?: "未取得"}
                        免許の年月日(普通)：${hutuu ?: "未取得"}
                        免許の年月日(大特)：${oogatatokusyu ?: "未取得"}
                        免許の年月日(大自二)：${oogatazidounirin ?: "未取得"}
                        免許の年月日(普自二)：${hutuuzidounirin ?: "未取得"}
                        免許の年月日(小特)：${kogatatokusyu ?: "未取得"}
                        免許の年月日(原付)：${gentuki ?: "未取得"}
                        免許の年月日(け引)：${kanninn ?: "未取得"}
                        免許の年月日(大二)：${oogatanisyu ?: "未取得"}
                        免許の年月日(普二)：${hutuunisyu ?: "未取得"}
                        免許の年月日(大特二)：${oogataokusyunisyu ?: "未取得"}
                        免許の年月日(け引二)：${kenninnnisyu ?: "未取得"}
                        免許の年月日(中型)：${tyuugata ?: "未取得"}
                        免許の年月日(中二)：${tyuugatanisyu ?: "未取得"}
                        免許の年月日(準中型)：${zyuntyuugata ?: "未取得"}
                    """.trimIndent()
                    textView.append(dfEf01FormattedText)
                    println(dfEf01FormattedText)

                }


                isoDep.close()

            },
            NfcAdapter.FLAG_READER_NFC_B,
            null
        )
    }

    override fun onPause() {
        super.onPause()
        nfcAdapter.disableReaderMode(this)
    }

    /** 16進数に変換するやつ */
    private fun ByteArray.toHexString() = this.joinToString { "%02x".format(it) }

    /**
     * 次のデータを取得する
     * @param currentPos 今の位置。初回時は0？
     * @return Intは、今の位置を返します。２回目以降この関数を呼ぶ際に使ってください、ByteArrayは値フィールドです
     * */
    private fun ByteArray.getValueField(currentPos: Int): Pair<Int, ByteArray> {
        // 長さを読み取る
        val length = this[currentPos + 1]
        return currentPos + 2 + length to copyOfRange(currentPos + 2, currentPos + 2 + length)
    }

    /** JIS X 0208で変換されたバイト配列を戻す */
    private fun ByteArray.toJISX0208(): String {
        // 変換する。JISコードで変換できる。JISコードはエスケープシーケンスにより、文字集合を切り替えることができる
        val escapeSequence = byteArrayOf(0x1B.toByte(), 0x24.toByte(), 0x42.toByte()) // JIS X 0208
        return String(escapeSequence + this, charset("jis"))
    }

    /** JIS X 0201で変換されたバイト配列を戻す */
    private fun ByteArray.toJISX0201(): String {
        // 変換する。JISコードで変換できる。JISコードはエスケープシーケンスにより、文字集合を切り替えることができる
        val escapeSequence = byteArrayOf(0x1B.toByte(), 0x28.toByte(), 0x42.toByte()) // ASCII
        return String(escapeSequence + this, charset("jis"))
    }

    /**
     * JIS X 0201で変換されたバイト配列を戻して、日付形式にする
     * @return nullの場合は不正な値の場合（例えば普通免許以外持っていない場合は00000なのでそのときはnullを返します。）
     * */
    private fun ByteArray.toJISX0201DateString(): String? {
        // とりあえずJIS X 0201の変換後データを取得
        val valueField = this.toJISX0201()
        // 持ってない免許の場合は (元号)000000 なので
        if (valueField.contains("000000")) return null
        val gengo = when (valueField.first()) {
            '1' -> "明治"
            '2' -> "大正"
            '3' -> "昭和"
            '4' -> "平成"
            else -> "令和"
        }
        val year = valueField.substring(1, 3)
        val month = valueField.substring(3, 5)
        val date = valueField.substring(5, 7)
        return "$gengo ${year}年 ${month}月 ${date}日"
    }

    /** 数値文字をJIS X 0201にエンコードする */
    private fun toJIS(c: Char): Byte {
        return when (c) {
            '0' -> 0x30
            '1' -> 0x31
            '2' -> 0x32
            '3' -> 0x33
            '4' -> 0x34
            '5' -> 0x35
            '6' -> 0x36
            '7' -> 0x37
            '8' -> 0x38
            '9' -> 0x39
            else -> 0x00
        }.toByte()
    }

}
```

## 番外編 本籍を読み出す
本籍を読み出すには、暗証番号2の照合を通過する必要があります。

```kotlin
// MFを選択する
val pin2MfSelectCommandResult = isoDep.transceive(mfSelectCommand)

// IEF02(暗証番号２)を指定したVERIFYコマンドを送る
val pinCode2CharList = "0000".toCharArray() // 各自暗証番号を入力
val pinCode2EncodedList = pinCode2CharList.map { toJIS(it.toString()[0]) }
val pinCode2VerifyCommand = byteArrayOf(
    0x00.toByte(),
    0x20.toByte(),
    0x00.toByte(),
    0x82.toByte(), // IEF02選択
    0x04.toByte(),
) + pinCode2EncodedList
val pinCode2VerifyCommandResult = isoDep.transceive(pinCode2VerifyCommand)

// 本籍を読み出すためにDF1へ移動
val pin2Df1SelectCommandResult = isoDep.transceive(df1SelectCommand)

// 本籍（DF1/EF02）を読み出す
val df1Ef02ReadBinaryCommand = byteArrayOf(
    0x00.toByte(),
    0xB0.toByte(),
    0x82.toByte(),
    0x00.toByte(),
    0x00.toByte(),
    0x03.toByte(),
    0x70.toByte(),
)
val df1Ef02ReadBinaryCommandResult = isoDep.transceive(df1Ef02ReadBinaryCommand)
if (df1Ef02ReadBinaryCommandResult[df1Ef02ReadBinaryCommandResult.size - 2] == 0x90.toByte()) {
    val honsekiLength = df1Ef02ReadBinaryCommandResult[1]
    val honsekiData = df1Ef02ReadBinaryCommandResult.copyOfRange(2, 2 + honsekiLength)
    honseki = honsekiData.toJISX0208()
}
```

# 面倒なので
ライブラリ書きました。多分簡単に使えます。

https://github.com/takusan23/JDCardReaderCore

使い方はREADME https://github.com/takusan23/JDCardReaderCore/blob/master/README.md 読んでください。

# 参考にしました
ありがとうございます

https://qiita.com/treastrain/items/f95ee3f99c6b6111e999  
https://qiita.com/ikazayim/items/2e9b8bdca96db6bf34cb  
https://www.npa.go.jp/laws/notification/koutuu/menkyo/menkyo20210630_150.pdf

# 終わりに
選択不可のPDFもFirefoxなら選択出来ます。

8月一瞬で終わった気がするんだけどなに？

# 追記：2024/09/17 一部の Android 端末で DF1/EF01 が読み出せない
調べてみたところ、手元にある`Xperia XZ1 Compact`で上記のコードを使って読み取ろうとすると`DF1/EF01`の読み取りが失敗しました。ちなみに暗証番号の認証までは動いてるのは確認した。  
ログを仕込んでみたところ`DF1/EF01`の大きさは`880 + 2 (応答コードの分)`バイトになるはずなのですが、  
`Xperia XZ1 Compact`だけ`400`バイトしか読み取れませんでした。途中でレスポンスが途切れてます。  

`APDU`の仕様的にはオフセット（読み取り開始位置）を指定できるので、端末の仕様で`400`しか取れなかった場合でも、`400`バイト分を読み飛ばすコマンドを叩くようにすればいいのですが、  
**このコードでは読み飛ばせません。** 別の方法を取る必要があります。

https://stackoverflow.com/questions/11297880/

というのも、今回書いたコードは`DF1`に移動したあと、`READ BINARY`コマンドで`EF01`を指定して読み出すようなコマンドを書きました。  
`P1`と`P2`は、`EF01`を指定できる`短縮EF識別子`でコマンドを書く場合、`P1`は`EF01`を表すものを、`P2`が`0埋め`になります。  

| CLA  | INS  | P1   | P2   | Lc   | Lc   | Lc   |
|------|------|------|------|------|------|------|
| 0x00 | 0xB0 | 0x81 | 0x00 | 0x00 | 0x03 | 0x70 |

```plaintext
0x00, 0xB0, 0x81, 0x00, 0x00, 0x03, 0x70
```

さて、`APDU`の仕様では`P1/P2`の部分でオフセットの設定ができます。  
しかし、このコマンドだと`短縮EF識別子`を使うため、`P1`の部分は`EF01`を指定したため使えません。  
`P2`が`0埋め`なので、その部分はオフセットとして使えるのですが、`1バイト`しか無いので、`0xFF`、つまり 255 バイトしか読み飛ばすことが出来ません。  
今回は 400 バイトより先を読み取りたいわけですが、`400`、つまり`0x190`を指定するには`P2`だけでは足りません。  

そのため、`SELECT FILE`コマンドで、`EF01`に移動したあと、`READ BINARY`コマンドを使う必要があります。  

使うコマンドは以下です。  
`仕様書 2-17`の`EFの選択(FCI要求なし)`の部分をそのまま使いました。  
多分データフィードは、`EF01`なので`0x01`を選ぶと`DF1/EF01`になるんだと思います。`DF1`に移動済みなので！

| CLA  | INS  | P1   | P2   | Lc   | データフィールド | データフィールド |
|------|------|------|------|------|------------------|------------------|
| 0x00 | 0xA4 | 0x02 | 0x0C | 0x02 | 0x00             | 0x01             |

```plaintext
0x00, 0xA4, 0x02, 0x0C, 0x02, 0x00, 0x01
```

そのあと、`READ BINARY`コマンドでデータを読み出します。  
使うコマンドは以下です。  

`CLA`と`INS`は変わらず。  
`P1`と`P2`は`仕様書 2-21`の`P1-P2コーディング(相対アドレス15ビット指定)`を元に`P1`と`P2`共に`0x00`を入れればいいですね。  
`Le`も変わらず、`DF1/EF01`のデータの大きさ`0x370`（880バイト）を渡せばいいです。

| CLA  | INS  | P1   | P2   | Le   | Le   | Le   |
|------|------|------|------|------|------|------|
| 0x00 | 0xB0 | 0x00 | 0x00 | 0x00 | 0x03 | 0x70 |

```plaintext
0x00, 0xB0, 0x00, 0x00, 0x00, 0x03, 0x70
```

`P1`と`P2`が`0埋め`になったため、**15ビット**で表現できる数値がオフセットとして利用できるようになりました。  
2バイト分あるから、`16ビット`の数値が使えるのではと思った方もいるかも知れません。  
しかし仕様書の`P1-P2コーディング(相対アドレス15ビット指定)`の表を見ると、最上位ビットは`0`で利用済みになっています。よって利用できるのは1ビット引いた15ビット分になります。  
`0b0111_1111_1111_1111`まで使えます。

**とかなんとか言ってもよく分からんと思うので、コードを貼ります。**

```kotlin

// DF1 に移動した後に書く

// カレントディレクトリを EF01 に移動する
// DF1 に移動した後 READ BINARY コマンドで EF01 を指定する方法もあるが、読み出し開始位置を指示するオフセットが、0xFF までしか使えない。
// オフセットは P1/P2 で指定することで使えるが、EF01 を指定する場合、P2 しかオフセットの指定で使えず、最大 0xFF までしか読み出し開始位置を指定できない。
// 一方 EF01 に移動した後 READ BINARY する場合 0b_111_1111_1111 まで使える（最上位ビットは予約済みで使えない）
// 一部の Android 端末は、EF01 全てを取得できない（なぜか 400 バイトで途切れてしまう事があった）。
// 400 パイトから先のデータを読み出すためには 0x190 をオフセットに指定する必要があるが、P2 は 0xFF までしか使えないため、READ BINARY で EF01 する方法は使えない。
val ef01SelectCommand = byteArrayOf(
    0x00.toByte(),
    0xA4.toByte(),
    0x02.toByte(),
    0x0C.toByte(),
    0x02.toByte(),
    0x00.toByte(),
    0x01.toByte()
)
val ef01SelectCommandResult = isoDep.transceive(ef01SelectCommand)
if (ef01SelectCommandResult[0] == 0x90.toByte()) {
    val text = """

        ---
        EF01 選択 成功
        ${ef01SelectCommandResult.toHexString()}
    """.trimIndent()
    textView.append(text)
    println(text)
}


val DF1EF01_SIZE = 880 + 2 // 880（仕様書通り） + 応答コード 2 バイト
// 移動したので読み出す
// 先述の通り、一度に読み出し出来ない Android 端末があるため、880 + 2 バイトになるまでオフセットを足して読んでいく
var df1Ef01ReadBinaryCommandResult = byteArrayOf()
var readSize = 0
while (true) {
    val currentReadBinaryCommand = byteArrayOf(
        0x00.toByte(),
        0xB0.toByte(),
        // P1/P2。オフセット 2 バイト分（正しくは最上位ビットを除いた分）
        *readSize.toShort().toByteArray(),
        //  DF1/EF01 のサイズ
        0x00.toByte(),
        0x03.toByte(),
        0x70.toByte(),
    )
    val currentReadBinaryCommandResult = isoDep.transceive(currentReadBinaryCommand)
    // 読み出しきれない場合に、今読み出せた分を足す
    readSize += currentReadBinaryCommandResult.size
    df1Ef01ReadBinaryCommandResult += currentReadBinaryCommandResult
    // 読み出し終わったら break
    if (DF1EF01_SIZE <= readSize) {
        break
    }
}

if (df1Ef01ReadBinaryCommandResult[df1Ef01ReadBinaryCommandResult.size - 2] == 0x90.toByte()) {
    // ここから下は変化なし
```

`Short`型を`ByteArray`にする拡張関数を作って使っているので、書いておいてください。  

```kotlin
/** Short（2バイト数値）をバイト配列に変換する */
private fun Short.toByteArray(): ByteArray {
    val int = this.toInt()
    return byteArrayOf(
        (int shr 8).toByte(),
        int.toByte()
    )
}
```

ま、まあ手元の端末の中で動かなかったのが`Xperia XZ1 Compact`だけで、それ以外は一発で`880バイト`読み出せたので、よくわかりません。  
ライブラリの改修はこんな感じでした。

https://github.com/takusan23/JDCardReaderCore/commit/45c05dfcab4a994ddbfeb85edbd1e2784872c4c7