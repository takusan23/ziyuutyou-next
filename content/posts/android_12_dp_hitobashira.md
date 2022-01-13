---
title: 国内版Pixel 3 XLにAndroid 12 DPを入れる
created_at: 2021-02-20
tags:
- Android
- Android12
---

Pixel 3シリーズで適用できる最後のバージョンかな[^1]

# 本題
Android 12 DP1 が公開されたので、国内版Pixel 3 XLに入れて見るお話です。  

# 注意
今でてるベータ版は`Developer Preview (DP)`で開発者向けです。エンドユーザー向けの`Beta`ではないです。  
`Developer Preview`では、`Beta`版と違い、ソフトウェアアップデートアプリ経由の提供がありませんのでパソコンが必要です。


なお`Beta`版が始まるとここから端末の登録ができるようになります。  
https://www.google.com/android/beta?hl=ja

# 環境
|なまえ|あたい|
|---|---|
|端末|Pixel 3 XL (docomoで購入)|
|Android|Android 11|
|PC|Windows 10 Pro / ADBセットアップ済み（コマンドプロンプト、PowerShell等で`adb`って入力して英語の説明が返ってくればおｋ）|

adbは各自セットアップしといてください（私はAndroid Studio入れてあるのでここでは省略）

# やる前に
データがなくなるのでなくなったら困るデータは逃しておきましょう。  
(LINEとかねこあつめとか)  
バックアップ機能が無いアプリは、`adb`があればバックアップができるかもしれません。  
パッケージ名(アプリケーションIDとも言う？)はドメインみたいなやつで、一部のファイルマネージャーでは見ることができると思います
```
adb backup パッケージ名
```

# やりかた
多分二通りあります。`adb sideload`で`OTA`を適用する方法と、データを全部消して（工場出荷状態）`Android Flash Tool`を使う方法（`fastboot`）ですね。

||OTA|Android Flash Tool|
|---|---|---|
|ブートローダーアンロックが必要|☓|○|
|データを残してアップデートが可能|○|☓|

今回は`OTA`ファイルを利用してアップデートしてみます。

# OTAファイルを適用

## OTAファイルをダウンロード
https://developer.android.com/about/versions/12/download-ota  
こっから自分の持ってる機種のファイルをダウンロードします。  
SHA-256を確認したい場合は以下のコマンドをPowerShellに入れると確認できます。(Windows以外はしらん)

```
CertUtil -hashfile <ダウンロードしたzipファイル> SHA256
```

## USBデバッグを有効に
普段アプリ開発をしていれば有効になってると思いますが、`USBデバッグ`を有効にする必要があります。  
もし銀行系アプリを使うためにOFFにしている場合はもう一度ONにしてください。  

## PCとつなぐ
USBデバッグを許可するか聞かれたら許可してください。  
できたら、以下のコマンドをPowerShell等で入力してください。

```
adb reboot recovery
```

するとスマホが暗くなってドロイド君が倒れてる画面に切り替わると思います。OLEDきれい

この画面になったら電源ボタンを押しながら音量アップキーを押します。すると上に`Android Recovery`と書かれた画面に切り替わると思います。  

こんなの

```
Android Recovery
google/crosshatch/crosshatch
11
user/release-keys
Use volume up/down and power.
-----------------------------------------
Reboot system now
Reboot to bootloader
Enter fastboot
Apply update from ADB
Apply update from SD card
Wipe data/factory reset
Mound /system
View recocvery logs
Run graphics test
Run locale test
Power off
```

## Apply update from ADB
を音量キーを使い選び、電源ボタンを押します。できたらPowerShellで以下のコマンドを入力します

```
adb sideload <ダウンロードしたzipファイル>
```
あとは待ちます。

![Imgur](https://imgur.com/kevfdt6.png)

終わったら、さっきの画面に戻るので、一番上の`Reboot system now`を選べばおｋです。

![Imgur](https://imgur.com/ZtGTSLG.png)

データを消さずにアップデートできた。

# アプリの生存確認
- Google Pay
    - 起動できた
- おサイフケータイ
    - 起動できた
- モバイルSuica
    - 起動できた
- COCOA
    - 起動できた
- Kyash
    - 起動できた
- SMBC
    - 起動できた

何が起動できないんだろ

# おわりに
通知からアプリを起動する速度が上がってむしろAndroid 11のときより動きがいい気がする

[^1]: Pixel 2シリーズが11で終わってるので多分そう