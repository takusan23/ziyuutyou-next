---
title: arrows Alpha ドコモ版のブートローダーアンロックと Root 化
created_at: 2025-09-24
tags:
- Android
- arrows
- Root
---
どうもこんにちわ、今週ようやく涼しくなってきたか・・・

# 先駆者さん
先駆者さん以上のことは話してないのでそっち見てください！！  
ブートローダーアンロックに関しては同じです！！

https://mitanyan98.hatenablog.com/entry/2025/09/08/070000
https://doroid.org/how-to-motorola-bootloader-unlock-jp/

# 本題
`arrows Alpha`をドコモで購入しました。`F-51F`。Fで始まってFで終わる型番再来。  
`NMP`すると安いみたいですが、 **ドコモ版が欲し買ったため定価で買いました。** えっ。ドコモ版が欲しかった理由はただ一つ、`転用5G`に接続するため・・・

![docomo_arrows_alpha_rooted](https://oekakityou.negitoro.dev/resize/bca2f245-5a56-4ff7-b865-a9cf2a74f5b7.jpg)

`arrows Alpha`、なんか`MediaTek`搭載らしいし、`5G+`表記が気になるし、マイブーム?の`10-bit HDR動画`も行ける、`ブートローダーアンロック`ができる予感がする（できた）、、、、で買いました。  
レノボのおかげで？モトローラ兄弟関係になったみたいで、よく見るとモトローラ譲りの`UI`があったりします？。（まーモトローラのスマホは電気屋で触ったくらいしかないんですが）  
`4636`したときに`5G/LTE Debugging Information`のメニューがあったり。

![4636](https://oekakityou.negitoro.dev/resize/7036b710-b56d-4984-bee1-23d5eea95172.png)

## ドコモ版でもブートローダーアンロックができる
なんと`ブートローダーアンロック`が出来ます。  
`SIMフリー版`は先駆者さんが試してくれています。

![f51f_rooted](https://oekakityou.negitoro.dev/resize/5dbb7f7e-48e9-4221-81fb-981c76fec30e.png)

買う前に調べたら（ドコモ版に感じては見つからなかった）、基底の部分からモトローラ譲りになったからなのか、ブートローダーアンロックができるっぽい。  
あとはキャリア版でも`MediaTek`の`arrows`は何故かブートローダーアンロックできるみたいで、、、、  
わたし、`モトローラ譲り+MediaTek`の2つのソースからアンロックできる予感がします、。

そういえば、なんか似たような理由（`ブートローダーアンロック`ができるから）で買った`Mi 11 Lite 5G`は、今でもシーリングライトのリモコンとして活躍しています。  
なお結局`BLU`せずに使ってます。今回はするんかいって。

さよなら保証・・・・って思ったけど白ロム購入だから無いか。

# arrows Alpha 今のところの感想
`ブートローダーアンロック可能`とか関係なく、

- （でかいスマホばっかり使ってたので）けっこう持ちやすい方だと思った
- サクサク動きます、リフレッシュレートもいい感じ
- 初`MediaTek SoC`なので楽しみ
- ダブルタップでのスリープ解除できます
- `ATOK`そんなに悪くないと思った
- アプリ履歴画面にスクショのボタンがほしい
- カメラ思ったより良い！！
- ホームアプリはすいません、`Lawnchair`を自前でビルドして使ってます、、

もっとあると思います、ので、思い出したら別のところで書きます

## モイモイがいない
この犬のキャラクター。壁紙だったり、マチキャラ（`ひつじのしつじくん`とか`豆腐みたいなあれ`）のキャラとして設定できたやつ。

![moimoi](https://oekakityou.negitoro.dev/original/19bdd10d-1c42-4bd5-9b22-285e4785cf88.png)

**Fのケータイと言えばモイモイ！！！！** だと思っていますが、もう搭載されてないみたいです。がっくし。  
中の人へ、どうか・・モイモイの復活を・・・

# 今北産業
- ドコモ版でもブートローダーアンロックできる。モトローラの手順で
- ただ、`Software Fix`が対応していない（？）ので、`Root 化`のための`init_boot.img`取得のために`DSU Sideloader`を利用する
    - `lineage-22.2-20250621-UNOFFICIAL-gsi_arm64_vN.img.gz`の`ROM`で起動できます！！キミにありがとう
    - 壊れた時↑が使えないので、イメージをバックアップしたほうが良い
        - `初期ROM (Fastboot ROM ?)`が欲しい場合は`SIMフリー`を買うと良いかも
- `Magisk`ですが記述時時点の最新版？はモトローラ譲りのせいかダメみたい、、なので`KernelSU`を使っています

# 必要なもの

- 本体
    - ドコモ版でもちゃんと出来ます
- `Motorola Account`
    - ブートローダーアンロックの申請時に必要です
        - https://en-us.support.motorola.com/app/utils/login
    - ない場合は
        - https://en-us.support.motorola.com/app/utils/signup?p_next_page=
- Windows マシン
    - `adb`コマンドが利用できるようにする必要があります
        - 私は`Android Studio`を入れてるので省略します
        - ターミナルさんは好きなのを使ってください、`コマンドプロンプト`でも`PowerShell`でも`GitBash`でも
    - もし`Android`のイメージをバックアップするなら`20GB`くらいほしいかも

# ブートローダーアンロックする
ここは先駆者さんと全く同じです、ありがとうございます

https://mitanyan98.hatenablog.com/entry/2025/09/08/070000
https://doroid.org/how-to-motorola-bootloader-unlock-jp/

## アカウントを作る
https://en-us.support.motorola.com/app/utils/signup?p_next_page=

から作ってください。名前とメアドとパスワードです。パスワードは大文字と特殊文字（記号？）が必要でした。  
`reCAPTHA`と確認用にメールが来ます。リンクを押して承認しましょう。

![register](https://oekakityou.negitoro.dev/original/b87edb82-560c-4c51-b301-b7aab349775a.png)

## OEMロック解除を有効にする
端末の設定を開き、`端末情報`→`デバイス ID`→`ビルド番号`を連打して開発者向けオプションを有効にします。  
そしたら`OEMロック解除`を有効にします。

![developer_setting](https://oekakityou.negitoro.dev/resize/028e6b18-3619-4591-b3b3-36eccb02ed2f.png)

## パソコンにドライバを入れる
https://en-us.support.motorola.com/app/usb-drivers

ここから。手動でドライバを入れるとか数年ぶりじゃない。  
ちなみに入れないと`fastboot devices`コマンドが何も返ってこなかったです。

でも失敗してしまった。

![error](https://oekakityou.negitoro.dev/original/bd044d7f-dc1e-43a9-8f9a-bd9b2e2deeaf.png)

まあなんかガチャガチャやってたら認識されるようになりました。（？！？！？）  
一回消してみたり、別のボタンを押してみたりとか・・・

```shell
C:\Users\takusan23>fastboot devices
ZY22LQLH4D       fastboot
```

![どれ？](https://oekakityou.negitoro.dev/original/5304756c-8f4b-4713-ba80-98c03f591220.png)

## アンロック用のコードを取得する
https://en-us.support.motorola.com/app/standalone/bootloader/unlock-your-device-b

まず端末を`fastboot`モードで起動します。  
電源を切った状態で、`音量下げボタン`と`電源ボタン`を長押しすると、ドロイド君が仰向けになっている画面になると思います。

![fastboot_screen](https://oekakityou.negitoro.dev/resize/1aeb9808-cdd0-47f8-a24e-02b426c77d73.jpg)

この状態で`USB`で接続し、  
コマンドプロンプトを開いて、以下の文字を入れて Enter します。（PowerShell でも好きなターミナルを開いてください）

```shell
fastboot devices
```

ここで`シリアルナンバー`？？が返ってくれば成功です。

![connected](https://oekakityou.negitoro.dev/original/9495173e-1e41-4a9b-a6e3-62c140ebbecd.png)

何も返ってこない場合はドライバのインストールがミスってるとか、`USB`を別のところに指すとか、再起動するとかしてみてください。

そしたら、以下の文字を入れてもう一度`Enter`します  
端末はそのままにしてください。

```shell
fastboot oem get_unlock_data
```

![get_unlock_data](https://oekakityou.negitoro.dev/original/ff433d01-7393-4469-9c42-a20dccbc1a30.png)

そしたら、なぞの文字が表示されると思います。以下は例です。

```shell
(bootloader) 0A40040192024205#4C4D3556313230
(bootloader) 30373731363031303332323239#BD00
(bootloader) 8A672BA4746C2CE02328A2AC0C39F95
(bootloader) 1A3E5#1F53280002000000000000000
(bootloader) 0000000
```

これを一旦メモ帳とかにコピーします。  
コマンドプロンプトの場合は、テキストを選択して右クリックでコピーできます（`Ctrl+C`はプロセスを56す操作のために予約されているため、コピーできません、いや出来るかも）  
数字が書かれている行だけでいいです。`(bootloader) Unlock data:`のところや、`OKAY`は不要。

できたら、数字以外の文字を削除して、1行にします。メモ帳の設定によっては折り返し機能で複数行に見えてしまうかもしれません。  
`(bootloader) `と改行と空白文字を消ししてつなげます。

以下例：

```plaintext
0A40040192024205#4C4D355631323030373731363031303332323239#BD008A672BA4746C2CE02328A2AC0C39F951A3E5#1F532800020000000000000000000000
```

![notepad](https://oekakityou.negitoro.dev/original/ae4839e8-7b00-464b-b63e-8c23445281d9.png)

## ブートローダーアンロックの申請ページを開く
以下のサイトを開いて、テキストボックスに↑で作った1行を貼り付けます  
https://en-us.support.motorola.com/app/standalone/bootloader/unlock-your-device-b

![code](https://oekakityou.negitoro.dev/original/6ee21d2d-386c-4d76-ada3-f94c18929494.png)

貼り付けたら`Can my device be unlocked?`ボタンを押します。

![check_blu](https://oekakityou.negitoro.dev/original/84289457-74bc-4def-814d-e277606032ff.png)

`ブートローダーアンロック可能な場合`はその下に利用規約が表示されるようになります。  
キャリア版（私が今やっている）も、SIMフリー版（オープンマーケット版）も解除できるので下に進めるはずです。

![agree](https://oekakityou.negitoro.dev/original/fbb91ed4-7e6f-49dc-bf9e-5b147e973957.png)

利用規約に同意するので`Yes`のラジオボタンを選択して、`Request Unlock Key`のボタンを押します、  
最後に一度聞かれるので、`OK`を選ぶ

![confirm](https://oekakityou.negitoro.dev/original/daf213e6-2349-4490-afb6-7a82da5a3880.png)

## 解除コードがメールで来る
https://en-us.support.motorola.com/app/standalone/bootloader/unlock-your-device-c

![part4](https://oekakityou.negitoro.dev/original/bf3c282e-d998-40f7-864c-978386acf103.png)

アカウント登録時に使ったメールアドレスに`Unlocking Your Device`ってメールが来ているはずです。  

![from_motorola_to_me](https://oekakityou.negitoro.dev/resize/f8259268-104d-4805-b64d-c452e0ae9daf.png)

`Unlock Code:`に表示されているコードをコピーします。

そしたらもう一度コマンドプロンプトを開き、以下のコマンドを入力して`Enter`します。  
`ここにメールできた解除コード`には実際のコードを入れてください。

もし画面が消えちゃってたら、もう一回`音量下げ`+`電源ボタン`を押して仰向けになっている画面を出せばいいです。

```shell
fastboot oem unlock ここにメールできた解除コード
```

そしたら端末を確認します。  
本当に`ブートローダーアンロック`するか？的な画面になるので、音量ボタンを使って`UNLOCK THE BOOTLOADER`を選んで、電源ボタンを押します。  
これで終わり。解除に伴って端末が初期化されます。

![comfirm_bootloader_unlock](https://oekakityou.negitoro.dev/resize/2782f56b-6f33-443a-b57c-dc8f39f75c4d.jpg)

なぜか元の画面に戻ってきたので、`START`を選んで起動します。  
同様に`START`じゃない場合は音量ボタンを使って選んで、電源ボタンで確定させます。

![fastboot_screen](https://oekakityou.negitoro.dev/resize/1aeb9808-cdd0-47f8-a24e-02b426c77d73.jpg)

## できた！
`開発者向けオプション`を開くと`ブートローダーはすでにアンロックされています`になっています。

![already_unlocked_bootloader](https://oekakityou.negitoro.dev/resize/ef69235a-ad89-4467-a6fa-73db05168f8e.jpg)

# Root を取る
`Magisk`で`Root`を得るためには`init_boot.img`ってファイルをファクトリーイメージから取り出す必要があります。  
モトローラやレノボのデバイスと同じ手順で取得することが出来る、、と思ってましたが、`Software Fix`が認識しません、、ドコモ版だとダメなのか・・？

![unsupported_docomo_variant](https://oekakityou.negitoro.dev/original/30217df3-1b22-4cb6-b30b-e4943ce08c92.png)

## Software Fix でダウンロードできない
頼りにするはずでしたが、先述の通り対応していません。  
これだと何が困るのかというと、`init_boot.img`が取得できないので`Root`が取れないのと、**ぶっ壊したときに戻せない**

というわけで、別の方法で`init_boot.img`とそれ以外も全部取り出し、`Root`と万一に備えようと思います。

## KernelSU を使った Root 手順
ちなみに利用できるならこれが一番早いと思います。

ちなみにブートローダーアンロックされていれば、`KernelSU`を使って`Root 化`する方法もあるみたいですが、  
できる限りクリーンな状態のシステムのバックアップを取りたいので、王道？な`DSU`の方法で行きます。

https://androplus.jp/entry/android-dynamic-system-updates/
https://mitanyan98.hatenablog.com/entry/2024/05/06/040247

## 手順
というわけで、`DSU Sideloader`を使い`Android Root 済み OS`を疑似デュアルブートします。  
`root`が使えるとシステムの`init_boot.img`とかが入手できるので。

- ブートローダーアンロックする（すでにやった）
- `DSU Sideloader`と`カスタムROM`を用意する
- パソコンでコマンドを叩く
- ルート化で`init_boot.img`を使うのでパソコンにコピ－（もしくは全部のイメージバックアップ）
    - `ドコモ版 arrows Alpha`は`Software Fix`が使えないっぽいので全部バックアップしてみます
        - `SIMフリー版`はそもそも`Software Fix`から`init_boot.img`が取り出せる（らしい）ので・・・
- 再起動して戻す

パソコンが必要です。

### システムに必要なファイルを全部バックアップする技

イメージバックアップってなんだって感じだったけどこの辺です！

https://note.com/reindex/n/n8d199ed8de88
https://mitanyan98.hatenablog.com/entry/2024/05/06/040247
https://gist.github.com/AndroPlus-org/c057a96d0c474f799354b939068337d1

https://androplus.jp/entry/kernelsu-how-to-extract-boot-img/
https://mitanyan98.hatenablog.com/entry/2023/05/03/143941

`RakutenMini`戻すときにひたすら`fastboot flash`していたけど、この元で使うファイルのこと・・？  
（あんまりわかってない、なら辞めとけよ）

## ABパーティションでどっちを使っているかを確認
`fastboot`モードで（ドロイド君が仰向けになっている画面）起動して、端末をパソコンに接続し、コマンドプロンプトで`fastboot getvar current-slot`を入力しエンターします。

```shell
C:\Users\takusan23>fastboot getvar current-slot
current-slot: a
Finished. Total time: 0.003s
```

`current-slot: `の後のアルファベットを確認します。この場合は`a`ですね。  
**後で使うので覚えておいてください。**

終わったら`Android`を起動してください、

## DSU Sideloader とカスタム ROM のダウンロード

- DSU Sideloader はここからダウンロードします
    - https://github.com/VegaBobo/DSU-Sideloader/releases
- `カスタムROM`ですが、私の手元（arrows Alpha ドコモ版）では、以下の`lineage-22.2-20250621-UNOFFICIAL-gsi_arm64_vN.img.gz`が起動できました
    - https://sourceforge.net/projects/andyyan-gsi/files/lineage-22-light/

### メモ lineageos 22 版 GSI はすでにルート済み？
`LineageOS 22`を使わせていただきます、ビルドしてくれたキミにありがとう。

が、`arm64_bvS`って感じに、最後に`S`がついてないと`root`がないと思っていましたが、  
以下の通り`LineageOS`にははじめからルートがついている？っぽいので`N`の方で行けるっぽいです

https://xdaforums.com/t/gsi-15-lineageos-22-light.4711135/

## DSU Sideloader で起動
両方ダウンロードできたら、`DSU Sideloader`をインストールし起動します。  
新しいフォルダを作るように言われるので、作ります。`Android`は`ファイル読み書き API`が使いにくいのでこんなところにも影響が・・・

![storage_access_framework_1](https://oekakityou.negitoro.dev/resize/b91e44f8-1563-4ce6-be87-ababea7f27bc.png)

![storage_access_framework_2](https://oekakityou.negitoro.dev/resize/40667c36-334f-4744-ad92-aa3a89eba7e0.png)

ブートローダーアンロック済みであることを確認しろよ的なメッセージが出ます。

![blu_confirm](https://oekakityou.negitoro.dev/resize/4498da7d-35bd-4f48-b3d0-5cf41f29ddd4.png)

これでボタンを押すと`カスタムROM`とストレージの設定画面に入ります。  
テキストボックスをおして、ダウンロードした`カスタムROM`を、容量の欄は`32GB`にしました。←!?

後述しますが、全部バックアップする場合は`20GB`超えのファイルになるので、多めに取っておく必要があります。  
逆に`init_boot.img`だけ取る場合は`8GB`くらいでいいっぽい？`初期ROM`が欲しいかどうかで決めると良さそう。

![set_rom_and_storage](https://oekakityou.negitoro.dev/resize/f10fe107-82f9-4368-be30-131c732972be.png)

出来たらインストール。

![dsu_install](https://oekakityou.negitoro.dev/resize/a2561107-81da-48a1-b6ec-d7128c1319cb.png)

そしたら、`ADB`コマンドを入力するように言われるので、パソコンと接続して、以下のコマンドをコマンドプロンプト等で入力してエンターします。  
多分同じコマンドだと思います。

```shell
adb shell sh "/storage/emulated/0/Android/data/vegabobo.dsusideloader/files/install"
```

![dsu_adb](https://oekakityou.negitoro.dev/resize/7184f367-7801-4162-b206-d025a2895ea7.png)

コマンドを入力したあとは、通知領域を見てしばらく待ちます。完了すると`動的システムの～`って通知があるので、`再起動`を押します。

![complete_notification](https://oekakityou.negitoro.dev/resize/6cee928e-de52-4dbc-a4bf-f85bd45cc57b.png)

## LineageOS の設定
再起動で成功すると`LineageOS`の初期設定画面が出てるはずです。わーカスタムROMだ

![lineageos](https://oekakityou.negitoro.dev/resize/1eb72e5f-40a2-4f21-805a-b323d3b40865.jpg)

初期設定は適当に進めます。インターネットや画面ロックはスキップしてください。  
終わったら設定を開き、いつもの手順で`開発者向けオプション`を有効にし、  
`USB デバッグ`と`ルート状態のデバッグ`を有効にします。

![開発者向けオプション](https://oekakityou.negitoro.dev/resize/352831ce-bcd3-4ffd-9336-26b4f45e4250.jpg)

そしたらパソコンと接続して次のステップへ

### メモ adb shell su で superuser になれない
https://www.reddit.com/r/LineageOS/comments/iglcn8/cannot_use_adb_shell_su_when_updateing_lineage_os/?tl=ja

`adb root`コマンドが`adb shell`+`su`相当になる。  
`adb root`した後に`adb shell`するとルートユーザーとしてターミナルに入れます。`whoami`したらちゃんとルートユーザーですね。

```shell
C:\Users\takusan23>adb root
adbd is already running as root

C:\Users\takusan23>adb shell
lineage_gsi_arm64:/ #
lineage_gsi_arm64:/ # whoami
root
lineage_gsi_arm64:/ #
```

## データをパソコンに逃がす
ここで、`イメージをすべてバックアップ`するか、`init_boot.img`だけ取得するかで変わってきます。

### イメージをバックアップする
https://gist.github.com/AndroPlus-org/c057a96d0c474f799354b939068337d1

まじでそのままパクってるだけです、、

まず以下2つ

```shell
adb root
```

```shell
adb shell
```

次も2つ、`cd /dev/block/by-name/`は`MediaTek`の`SoC`だけっぽいので、`Snapdragon`の場合は別みたい。

```shell
cd /dev/block/by-name/
```

```shell
mkdir /sdcard/backup_img
```

次に以下をすべて選択した状態で（複数行でも構わずに）貼り付ける。  
1行ずつ貼り付けてはいけません、3行まとめて貼り付けるんです、しばらく掛かると思います。`Windows Terminal`だと複数行貼り付け時に警告が出るかもだけどとにかく実行。

```shell
for file in *; do
    if [[ "${file}" = cache* || "${file}" = userdata* || "${file}" = sd[a-z] ]]; then continue ; else dd if="${file}" of=/sdcard/backup_img/"${file}".img ; fi
done
```

![backup](https://oekakityou.negitoro.dev/original/05f0a92f-7724-4aa9-83ab-c3b5e0256f2e.png)

最後に成功しているかを確認します。これも複数行をまとめて貼り付けます。

```shell
echo "" > /sdcard/backup_img/md5.txt
for file in *; do
    if [[ "${file}" = cache* || "${file}" = userdata* || "${file}" = sda || "${file}" = sdb || "${file}" = sdc ]]; then continue ; else
    if cmp -s "${file}" /sdcard/backup_img/"${file}".img; then
        echo "${file} - OK" >> /sdcard/backup_img/md5.txt
    else
        echo "${file} - NG, you have to backup again!" >> /sdcard/backup_img/md5.txt
    fi
    fi
done
```

しばらくまちます。。。**シェルスクリプト芸人って毎回すげーとおもうわ。**`GitHub Actions`とかもそれだけど。。  
`/sdcard/backup_img/md5.txt`へ、成功しているかのログがテキストファイルになっているので、`cat`コマンドで見ます。全部`OK`になっていると成功。

```shell
cat /sdcard/backup_img/md5.txt
```

![check1](https://oekakityou.negitoro.dev/original/83e14287-f6c8-492b-8964-f940eb57f75c.png)

![check2](https://oekakityou.negitoro.dev/original/9c16bb0b-f74c-47d2-82c6-b65b4e825c85.png)

あとあんまり良くわかってないですが、もし起動しなくなったらこれを元ある場所に戻せば良いんですかね・・？  
わかんないなら辞めとけよ（再掲）

### パソコンに転送

![usb_mode](https://oekakityou.negitoro.dev/resize/ea15e372-5b69-44ed-9f51-7faa478d9cb2.jpg)

母艦となるパソコンに転送します。`USB 接続設定`から`ファイル転送`を選べば`Windows`のエクスプローラーから見れるのでこれで良いでしょう。  
`backup_img`フォルダです。ちなみに容量は`21GB!!??`

![backup_transfer](https://oekakityou.negitoro.dev/original/36810523-7130-4b76-b2a2-43e27cd65feb.png)

### Root を取るために必要なファイルを見つけておく
最初に`A/B`のどっちを使っているかを知っているので、↑のフォルダから`a`なら`init_boot_a.img`を、`b`の場合は`init_boot_b.img`を探しておきましょう。  
これを`Magisk`や`KernelSU`でパッチします。

## init_boot.img のみバックアップする場合
未検証ですが、一応書いておきます。わかりやすい記事があるのでそっちを見ると良さそう  
https://mitanyan98.hatenablog.com/entry/2024/05/06/040247

同様に`A/B`のどっちかを復習しておく必要があります。今回は`a`ですね。  
次に以下のコマンドを叩きます。途中までは同じなので。同様に`Snapdragon`の場合は`/dev/block/by-name/`が違うはず

```shell
adb root
```

```shell
adb shell
```

```shell
cd /dev/block/by-name/
```

```shell
mkdir /sdcard/backup_img
```

そしたら分岐です。**aだった場合は**

```shell
dd if=init_boot_a of=/sdcard/backup_img/init_boot_a.img
```

**bだった場合は**

```shell
dd if=init_boot_b of=/sdcard/backup_img/init_boot_b.img
```

あとは同様に`USB 接続設定`をデータ転送にすれば、`Windows`のエクスプローラーから見ることが出来ます。同様にパソコンにバックアップしておいてください。

## init_boot.img にパッチを当てる
もう`LineageOS`は不要なので、再起動します。普通に再起動すると元々の`OS`が起動します。  
起動したら、パソコンにある`init_boot.img`をスマホに戻します。`A/B`は先述の手順で選別したはずですから。

### メモ Magisk だと動かなかった
モトローラだからなのかよくわかりませんが、どうやってもエラーになってしまいました。  
もしかするとバージョンを下げると導入できるみたいなのですが、`KernelSU`の方は使ったことないな・・・と思ったので今回はそっちにします。

```shell
PS C:\Users\takusan23\Downloads> fastboot flash init_boot_a C:\Users\takusan23\Downloads\magisk_patched-30200_TMHEq.img
Sending 'init_boot_a' (8192 KB)                    OKAY [  0.181s]
Writing 'init_boot_a'                              (bootloader) Preflash validation failed
FAILED (remote: '')
fastboot: error: Command failed
```

## KernelSU を導入
https://kernelsu.org/ja_JP/guide/installation.html

インストールします。ファイルの末尾が`release.apk`となっているものを探してください。他の`gz`とかは、`KernelSU`経由で`Root (Magisk)`を入れるためのものっぽい？  
https://github.com/tiann/KernelSU/releases

![kernelsu_download](https://oekakityou.negitoro.dev/original/946cd627-3943-4bdf-bec3-79f7dc08fd6f.png)

できたら、起動して、スクショを **取り忘れて事後報告になるのですが** 、 **未インストール** と書かれている箇所を押します。  
以下のスクショではもう導入済みなので **動作中＜LKM＞** と表示されてますが、インストールしていない場合はここが未インストールになります。

![kernelsu_install_1](https://oekakityou.negitoro.dev/resize/5eee06cb-9917-4ab4-b20d-a5b18b0a1e29.png)

そしたら、`ファイルを選択してください`を押します。スクショでは相変わらず事後報告なので他のメニューが見えているのですが、インストールしてない場合は一つだけなのでそれを押します。  
おすと`init_boot.img`ファイルを選択する画面に移動するので、パソコンから転送しておいた`init_boot_a.img`もしくは`init_boot_b.img`を選びます。どっちを利用するかは前述しましたよ!!!

![kernelsu_install_select_init_boot](https://oekakityou.negitoro.dev/resize/cc981f43-c16f-49ac-bf91-53dbae75125f.png)

できたら`次に`を押します。あとは`Magisk`みたいに`init_boot.img`へパッチされてますよ～画面に遷移するので、終わるのを見届けて、  
終わったら、ダウンロードフォルダに`kernelsu_patched_`から始まるファイルが出来ているので、これをパソコンに転送します。

![kernelsu_install_patching](https://oekakityou.negitoro.dev/resize/4f75db65-57e6-4d88-9f8a-3655eda177e2.png)

![kernelsu_install_transfer_patching](https://oekakityou.negitoro.dev/resize/d55c95fc-5b40-47ba-acb8-b23387c71c4d.png)

あとはパソコンと接続し、まずはドロイド君が仰向けになっている画面を出します。シャットダウンして、電源ボタンと音量下げボタンのやつ。  
そしたら、パソコンに転送したファイルを使ってコマンドを叩きます。

```shell
fastboot flash init_boot {ここにパソコンに転送した kernelsu_patched_ のファイルパス}
```

以下は例です。

![init_boot_a_suucessful](https://oekakityou.negitoro.dev/original/375f1805-6bd3-4fa9-a9e5-5d53ce4f8536.png)

```shell
PS C:\Users\takusan23\Downloads> fastboot flash init_boot C:\Users\takusan23\Downloads\kernelsu_patched_20250919_144334.img
Sending 'init_boot_a' (8192 KB)                    OKAY [  0.182s]
Writing 'init_boot_a'                              OKAY [  0.029s]
Finished. Total time: 0.223s
```

完了したら、ドロイド君が仰向けになっている画面で、すでに`START`が選ばれていればそのまま電源ボタンを押して確定。  
それ以外になっていれば音量ボタンを`START`が出るまで押して、でたら電源ボタンを押します。  

![docomo_arrows_alpha_rooted](https://oekakityou.negitoro.dev/resize/bca2f245-5a56-4ff7-b865-a9cf2a74f5b7.jpg)

これで`KernelSU`導入済みの`arrows Alpha ドコモ版`が完成。おつかれさまでした。

# おわりに
ドコモのキャリア絵文字ですが、今年の夏発売した機種を皮切りに廃止されたそうです。`Xperia 1 VII`が最後の可能性がある。  
まあダークモード環境で最悪だったし、**Slackも端末に入っている絵文字を使っているので意図がうまく汲み取れないし**だったのでようやくですね。。

https://k-tai.watch.impress.co.jp/docs/news/2015881.html

# おわりに2
なぜか`n1`表示になります。私のプログラムの考慮ミスのようです。。。**MediaTekでは動いてなかった可能性があります。**

![mediatek](https://oekakityou.negitoro.dev/resize/256f8707-b728-47ee-ad10-4d71c1e2a44e.png)

`arrows Alpha`を買った理由は`MediaTek`だからってのもあって、この`SoC`の`電波API`を拝見したかったってのもあります。手持ちでないので。  
うーーーん、どのベンダーもやっぱり謎の挙動がありますね（`n1`・・？）

ちなみに`Qualcomm`の場合は`CellInfo#getCellConnectionStatus`を実装してない、`5G`のときの`ServiceState#getBandwidths`も実装していない、  
`4636`の物理チャンネル構成で使われている`PhysicalChannelConfig`も`5Gのキャリアアグリゲーション`は実装してない。  
`Google Tensor`は電波の掴みがいまいちで・・(`API`関係ないわ)

# おわりに3
冒頭の通り、ドコモ版を買った理由は、`転用 5G`に接続したかったからです。ドコモの`転用5G`は`IMEI`でドコモ端末かチェックを入れているみたいなので。

# おわりに4
`Root`があると`Shizuku`のセットアップが超簡単。  
`ワイヤレスデバッグ出来ない環境`でも`root`を使ってセットアップできるので、今でも`root`を取る価値はあるんだなって思った。

# おわりに5

![launchair_docomo_no_touhu](https://oekakityou.negitoro.dev/resize/fb1640b9-e61b-4b80-b8a5-8211a708d296.png)

`Lawnchair`は`APK`あるのに何故自分でビルドしてるんですかって話ですが、開発者としての境地・・・とかの思いは特に無く、（向上心のない者はなんとか・・・）  
`Google Discover (Google Feed)`が動かないので調べてたら、`ナイトリービルド`もしくは`デバッグビルド`であれば、追加でインストール必要なく動くって書いたあったからです。  
まあ、ナイトリービルドを入れればいいので、自分でビルドする必要なんて無いんですが・・・

- https://github.com/LawnchairLauncher/lawnchair/issues/4201
- https://lawnchair.app/faq/
- ナイトリービルドは`assembleDebug`で`APK`を作っているので、デバッグビルド相当になり何もしなくても動くハズ
    - https://github.com/LawnchairLauncher/lawnchair/blob/b44364253079ebe4251e820772b4a8ec0ffacfe8/.github/workflows/ci.yml#L55