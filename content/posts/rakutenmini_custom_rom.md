---
title: Rakuten Mini にカスタム ROM を焼いて Android 14 にする
created_at: 2024-11-20
tags:
- Android
---
どうもこんばんわ。  
`Rakuten Mini`ほしいなあって思いつつ、`サンキュッパ`かあ、もう一声安くならんかなあと覗いてみたらから更に値下げされてて買っちゃった。何に使おかな  

![Imgur](https://imgur.com/ZVyeewC.png)

# 本題
今回はこれに`カスタムROM`を焼いて`Android 14 系`にします。。。  
小さいだけで既に楽しめそう感ありますが、どうやら`ROM 焼き`が楽しめるらしい。

**もちろん自己責任で！！！**

# 参考にしました
thx!!!!!!!!!!!

- https://androplus.jp/Entry/14664/#i-2
- https://note.com/realryo1/n/n7b0c129bfddd
- https://sgrmatha.hatenablog.com/entry/20240630-rakutenminiandroid14

# 流れ

- adb を使える状態にする
- ブートローダーをアンロックする
- ダウングレードする（？）
- `Project Treble`な`カスタムROM`を焼く
- 終わり

# adb を使える状態にする
私は`Android 開発`のための`Android Studio`を入れた際に自動的にインストールされるのでそれを使います。  
多分`adb`だけをインストールする方法があったはず。

`コマンドプロンプト`でも`PowerShell`でも`Git Bash`でもターミナルさんならなんでもいいですが、`adb`って入力してエンターした後なにか返ってくればインストール済みになります。  

```shell
C:\Users\takusan23>adb
Android Debug Bridge version 1.0.41
Version 34.0.1-9979309
Installed as C:\Users\takusan23\AppData\Local\Android\Sdk\platform-tools\adb.exe
Running on Windows 10.0.19045
```

![Imgur](https://imgur.com/dJOS3WJ.png)

# 開発者向けオプションを出す
`設定`→`端末情報`→`ビルド番号`を連打することで、開発者向けオプションが開放されます。  
そしたら、開発者向けオプションを開き、`USBデバッグ`を有効にします。

# ブートローダーをアンロックする
`設定`→`端末情報`→`ソフトウェアバージョン`を連打することで緊急通報用のダイヤルパッドが開きます。  
ここで、以下を打ち込みます。  

`*636865625#`

![Imgur](https://imgur.com/D7EO9zU.png)

最後のシャープ（ハッシュ、井げた）を打ち込むとテキストフィールドがまっさらになります。  
特に何もおきませんがこれで`OEM ロック解除`の設定項目が開放されるらしいです。

![Imgur](https://imgur.com/JYjWNRT.png)

# データを逃がす（あれば）
なにか残しておきたいデータがあれば他の端末に`Nearby Share`するなり母艦に転送するなりしてください。  
`ROM焼き`に必要なブートローダーアンロックの際に全て消えてしまうので。

# ブートローダーアンロックする
`adb`で認識されているか見ておきましょう。`コマンドプロンプト`へ`adb devices`と入力してエンター。  
こんな感じに認識されていれば`OK`、もし違ったら`USB デバッグ`を許可したかとかを確認してください。

![Imgur](https://imgur.com/XVNQAdG.png)

そしたら`adb reboot bootloader`と入力しエンター。`Rakuten Mini`の画面に`START`って文字が出ているはず。

![Imgur](https://imgur.com/nRcuu83.png)

そしたら`fastboot flashing unlock`と入力しエンター。`Rakuten Mini`の画面が変化し、本当に`BLU`するか聞かれます。  

![Imgur](https://imgur.com/U4Trp1H.png)

音量ボタンを使い、`UNLOCK THE BOOTLOADER`に合わせます。合わせたら電源ボタンを押します。初期化される。

![Imgur](https://imgur.com/Q5ztNkx.png)

このあと初期設定を進めます。また`adb`コマンドが使えるように`USB デバッグ`を有効にする必要があるためです。  
`adb devices`で返ってくる状態になりまで進めてください。

## 追記 unlock_critical も必要そう
`fastboot flashing unlock`に加えて`fastboot flashing unlock_critical`も叩く必要があるそうです。  
初期設定を進めて`USB デバッグ`を有効にできるようにしたあと、また`adb reboot bootloader`でさっきの黒い画面へ戻り、今度は`fastboot flashing unlock_critical`を入力しエンター。  
同様に音量ボタンを使って`UNLOCK THE BOOTLOADER`を選びます。

# カスタム ROM などをダウンロードする
`Project Treble`な`カスタムROM`一覧があります。多分`Android 14`が行けるはず。

https://github.com/phhusson/treble_experimentations/wiki/Generic-System-Image-(GSI)-list

今回は`crDroid`を試します。`Nexus 7 (2013)`使ってたときはこれ使ってた、ハズ。  

で、`ROM`のダウンロードページヘ行くといくつか種類があることがあります。  

- a64_bvN-Unofficial.img.xz
- arm64_bgN-slim-Unofficial.img.xz
- arm64_bgN-Unofficial.img.xz
- arm64_bvN-Unofficial.img.xz

この`bgN`とかの意味はここにまとめられていて、  
https://github.com/eremitein/treble-patches/issues/20

アンダーバーより前の`a64`や`arm64`が`CPU`アーキテクチャ。  
後ろ側の`bgN`は、  
- 1文字目が`A/B パーティション`。`b`が`A/B パーティション対応端末`向け
- 2文字目が`gapps`の有無。`Play`ストアがあるかどうか。`g`だと`gapps`あり。
- 3文字目が`ルート権限`。`N`だとルートなし。ルート欲しい場合も`Magisk`焼けばいいだけなので。

あと`slim`って付いている場合は小さいらしい。

今回は`crDroid`の`Android 14`、`crDroid-10.8-arm64_bgN-slim-Unofficial.img.xz`をダウンロードします。

## 残り
こちらから`downgrade72_SS.zip`、`vendor_72_mod.img`、`vbmeta.img`をダウンロードします。ありがとうございます。

https://note.com/realryo1/n/n7b0c129bfddd#c36aa6f2-5e42-41e4-a04d-4b2a495ad951

# カスタム ROM を焼いていく
`downgrade72_SS.zip`を解凍し、解凍したフォルダ内で`PowerShell`を開きます（`Shift+右クリック`のコンテキストメニューから）。コマンドプロンプトでも良いです。  
`adb devices`で認識されていることを確認したら、`adb reboot bootloader`を叩きさっきの黒い画面を出します。

![Imgur](https://imgur.com/E5AgA9r.png)

![Imgur](https://imgur.com/5YvxXIh.png)

そしたら、先駆け者さんの記事のとおりにコマンドを叩いていきます。

```shell
fastboot flash boot boot.img
fastboot flash devcfg devcfg.img
fastboot flash devcfgbak devcfgbak.img
fastboot flash dtbo dtbo.img
fastboot flash dtbobak dtbobak.img
fastboot flash modem modem.img
fastboot flash rpm rpm.img
fastboot flash rpmbak rpmbak.img
fastboot flash sbl1 sbl1.img
fastboot flash sbl1bak sbl1bak.img
fastboot flash tz tz.img
fastboot flash tzbak tzbak.img
fastboot flash vbmeta vbmeta.img
fastboot flash vbmetabak vbmetabak.img
```

こんな感じになるはず。  

```shell
PS D:\rakuten_mini_customrom\downgrade72_SS> adb reboot bootloader
PS D:\rakuten_mini_customrom\downgrade72_SS> fastboot flash boot boot.img
Sending 'boot' (65536 KB)                          OKAY [  2.078s]
Writing 'boot'                                     OKAY [  0.745s]
Finished. Total time: 2.839s
PS D:\rakuten_mini_customrom\downgrade72_SS> fastboot flash devcfg devcfg.img
Sending 'devcfg' (256 KB)                          OKAY [  0.009s]
Writing 'devcfg'                                   OKAY [  0.005s]
Finished. Total time: 0.030s
PS D:\rakuten_mini_customrom\downgrade72_SS> fastboot flash devcfgbak devcfgbak.img
Sending 'devcfgbak' (256 KB)                       OKAY [  0.009s]
Writing 'devcfgbak'                                OKAY [  0.005s]
Finished. Total time: 0.029s
PS D:\rakuten_mini_customrom\downgrade72_SS> fastboot flash dtbo dtbo.img
Sending 'dtbo' (8192 KB)                           OKAY [  0.263s]
Writing 'dtbo'                                     OKAY [  0.093s]
Finished. Total time: 0.381s
PS D:\rakuten_mini_customrom\downgrade72_SS> fastboot flash dtbobak dtbobak.img
Sending 'dtbobak' (8192 KB)                        OKAY [  0.261s]
Writing 'dtbobak'                                  OKAY [  0.093s]
Finished. Total time: 0.376s
PS D:\rakuten_mini_customrom\downgrade72_SS> fastboot flash modem modem.img
Sending 'modem' (86016 KB)                         OKAY [  2.743s]
Writing 'modem'                                    OKAY [  0.970s]
Finished. Total time: 3.730s
PS D:\rakuten_mini_customrom\downgrade72_SS> fastboot flash rpm rpm.img
Sending 'rpm' (512 KB)                             OKAY [  0.017s]
Writing 'rpm'                                      OKAY [  0.009s]
Finished. Total time: 0.040s
PS D:\rakuten_mini_customrom\downgrade72_SS> fastboot flash rpmbak rpmbak.img
Sending 'rpmbak' (512 KB)                          OKAY [  0.017s]
Writing 'rpmbak'                                   OKAY [  0.009s]
Finished. Total time: 0.040s
PS D:\rakuten_mini_customrom\downgrade72_SS> fastboot flash sbl1 sbl1.img
Sending 'sbl1' (512 KB)                            OKAY [  0.016s]
Writing 'sbl1'                                     OKAY [  0.010s]
Finished. Total time: 0.041s
PS D:\rakuten_mini_customrom\downgrade72_SS> fastboot flash sbl1bak sbl1bak.img
Sending 'sbl1bak' (512 KB)                         OKAY [  0.018s]
Writing 'sbl1bak'                                  OKAY [  0.010s]
Finished. Total time: 0.042s
PS D:\rakuten_mini_customrom\downgrade72_SS> fastboot flash tz tz.img
Sending 'tz' (2048 KB)                             OKAY [  0.066s]
Writing 'tz'                                       OKAY [  0.025s]
Finished. Total time: 0.106s
PS D:\rakuten_mini_customrom\downgrade72_SS> fastboot flash tzbak tzbak.img
Sending 'tzbak' (2048 KB)                          OKAY [  0.065s]
Writing 'tzbak'                                    OKAY [  0.025s]
Finished. Total time: 0.105s
PS D:\rakuten_mini_customrom\downgrade72_SS> fastboot flash vbmeta vbmeta.img
Sending 'vbmeta' (64 KB)                           OKAY [  0.003s]
Writing 'vbmeta'                                   OKAY [  0.003s]
Finished. Total time: 0.019s
PS D:\rakuten_mini_customrom\downgrade72_SS> fastboot flash vbmetabak vbmetabak.img
Sending 'vbmetabak' (64 KB)                        OKAY [  0.003s]
Writing 'vbmetabak'                                OKAY [  0.001s]
Finished. Total time: 0.018s
PS D:\rakuten_mini_customrom\downgrade72_SS>
```

![Imgur](https://imgur.com/5x9nCbL.png)

次に、`カスタムROM`本体を焼いてきます。  
ダウンロードした拡張子が`.img.xz`と`xz`で圧縮されているので、これも解凍します。`7zip`で解凍できるはず。みんなはアーカイバー何使ってるのかな。

そしたらまずは`fastboot erase system`を入力してエンターします。  
`PowerShell`のウィンドウは使いまわしてもいいです。新しく開いてもいいです。

その後、`fastboot flash system {解凍したカスタムROMのパス}`を叩きます。各自ダウンロードした`ROM`の`img`のパスを`fastboot flash system `の後に入れてください。  
しばらく時間がかかるので待ちます。

![Imgur](https://imgur.com/DzHHbkC.png)

終わりました。

```shell
Sending sparse 'system' 6/6 (462088 KB)            OKAY [ 14.886s]
Writing 'system'                                   OKAY [  7.925s]
Finished. Total time: 138.610s
```

最後に`fastboot flash vendor vendor_72_mod.img`を入力してエンターし、  
`Android`の`AVB`とか言う機能を無効にするための`fastboot --disable-verity --disable-verification flash vbmeta vbmeta.img`も入力してエンターします。  

![Imgur](https://imgur.com/0OEX5em.png)

# 起動する
`START`って書いてある画面のままだと思うので、音量ボタンを使い`Recovery mode`に合わせて電源ボタンを押します。  
そしたらドロイド君が横たわってるアイコンが出てくるので、**電源ボタンを押しながら音量アップボタンを押す**ことで`Android Recovery`とか言う画面に遷移します。  

![Imgur](https://imgur.com/2u4z4h9,png)

音量ボタンを使い、`Wipe data/factory reset`に合わせて電源ボタンを押し、その後`Yes`か`No`か聞かれるので音量ボタンを使って`YES`を選びまた電源ボタンを押します。  

最後に`Reboot system now`を選ぶことで起動するはずです！

# 起動しない
何個か`ROM`を試してみたけど起動しなかった。  
なんなら先駆け者さんと同じにしてもダメそうだった。

- `Android Recovery`の画面が表示され、`Try again`か`Factory reset`しか選べない
    - この場合`Try again`を押してすぐに音量アップボタンを長押しし続けると、起動後にドロイド君が倒れた画面に進むことが出来ます。
        - あとはさっきと同じ手順で`Android Recovery`に入ることが出来ます。
- `Android Recovery`が出る
    - `Reboot now`を選んで電源ボタンを押してもまた`Android Recovery`に戻って来る
- ブートループする
    - この場合もさっきと同じように、音量アップボタンを押し続けることでループしてる際に何処かでドロイド君が倒れた画面に入ることが出来ます。
        - これも同様の手順で`Android Recovery`に入れます。

# 戦略的撤退。とりあえず元に戻したい
先駆け者さんがまとめてくれているのでこれと同じようにすれば良いです。

https://androplus.jp/Entry/15189/

これの`fastboot`の方で直せました。

# 戻した後更新して再チャレンジ
今回はバージョンを最新に上げました。  
新しい更新がないことを確認して再チャレンジします。

![Imgur](https://imgur.com/avjz1sw.png)

# 動いた ROM

![Imgur](https://imgur.com/x1mY8NF.png)

- SparkOS（`SparkOS-13.4-arm64_bgN-slim-Unofficial.img`）
    - 起動した
- EvolutionX（`evolution_arm64_bgN_slim-9.6-unofficial-20241117.img`）
    - 起動しない（`Try again`を選ぶ画面になる）
- crDroid
    - 最新のビルド（`crDroid-10.8-arm64_bgN-slim-Unofficial.img`）は起動しない
    - 前のビルド（`crDroid-10.1-arm64_bgN-slim-Unofficial.img`）にすると起動した
- LineargeOS（`lineage-21.0-20241118-UNOFFICIAL-arm64_bvN.img`）
    - 起動しない（`Try again`を選ぶ画面になる）

# root 欲しい
私が入れた`ROM`だけかもしれないですが、  

`Magisk Manager`を`GitHub`からダウンロードします。  
https://github.com/topjohnwu/Magisk/releases

![Imgur](https://imgur.com/4EkhH6x.png)

あとは画面に従えばセットアップが終わります。  

![Imgur](https://imgur.com/ph9jc4t.png)

実際に`root`を必要とするアプリを使おうとするとダイアログが出ることを確認しました。

![Imgur](https://imgur.com/HD79N9z.png)

# おわりに
まだあんまり触れてないけど設定項目見てるだけで楽しい。  
あと保護フィルムは`PDA工房`からいつも買ってるんだけど、今回だけなの分からないですが買ったらメガネ拭きが付いてきた。今までは入ってなかったはず？