---
title: Xperia Z5 Compact 海外版にカスタムROMを入れるまで
created_at: 2021-04-24
tags:
- Android
- Xperia
- カスタムROM
---
夜勤しんど

# 本題
E5823(Xperia Z5 Compact 海外版)へカスタムROMを入れて遊ぶ。  
ワールドモバイルで三千円ぐらいだった

# 環境
先人に乗っかっていく

https://abc10946.hateblo.jp/entry/2020/07/12/234733

# TAパーティションのバックアップ
カメラの画質が落ちるらしい。メイン機にはならないし、どうでもいい気がするけど一応バックアップを取っておく。

## Androidのダウングレード
Lollipop(5)へ戻す必要があるみたいなので、`ftfファイル`をXDAからダウンロードしてきます。  

https://forum.xda-developers.com/t/how-to-backup-restore-ta-partition-and-root-the-device-detailed-guide.3479532/

それと並行して

## FlashToolをダウンロード
トレントが使えるならトレント経由でDLしたほうがいいと思います。

ダウンロードできたら、（保存先変えてなければ）Cドライブの中に`Flashtool`フォルダがあるので、その中の`drivers`フォルダ内にある`Flashtool-drivers.exe`を起動してドライバを入れるんだけど、  
署名がないドライバはそのままではインストールできないので、Windowsの設定→更新とセキュリティ→回復→PCの起動をカスタマイズするにある「今すぐ再起動」をおして、  
トラブルシューティング→詳細オプション→スタートアップ設定  
へ進み、  
再起動で立ち上がったら`7`を選んでWindowsを起動させると、ドライバの署名を無視してドライバを入れることができるようになります。

## ﾌﾗｯｼｭ!
`FlashTool`を起動して、稲妻マークを押し

![Imgur](https://i.imgur.com/oR720C9.png)

`Flashmode`を選んで`Ok`を押します。

![Imgur](https://i.imgur.com/UPAuB13.png)

そうするとこんなウィンドウが出るので、`Source folder`にはダウンロードした`tftファイル`が置いてあるフォルダを指定して、  
あと`Wipe`には全部チェックを入れます。  

![Imgur](https://i.imgur.com/rR8kPW9.png)

できたら`Flash`をおして準備を始めます。

この画面に進めたら、

![Imgur](https://i.imgur.com/qPr31lK.png)

Xperia（Sony風に言うなら機器）の電源を切って、ボリュームダウンキーを押しながらUSBケーブルでPCとつなぎます。

あとは待機です。

`INFO  - Flashing finished.`と出れば成功です。  
私は一回目はなんか失敗してデバイスを選ぶダイアログが出て、その後もう一度やると出来たのでまあよくわからん。

![Imgur](https://i.imgur.com/zmAeUhj.png)

成功したらUSBケーブルを外して起動して見ましょう。多分長い。

## TAパーティションのバックアップ

https://forum.xda-developers.com/t/need-iovyroot-v0-3-or-v0-4-please.3526743/

ここからダウンロードできるらしいので使わせてもらいます。

ダウンロードしたら解凍して、`tabackup.bat`を実行します。  
なんかUSBデバッグを付けたら`imgファイル`が手に入りました。はい  
ファイルサイズは`2MB`らしいよ。

## ブートローダーのアンロック
- 開発者向けオプションのOEMロック解除を有効にします。
- https://developer.sony.com/develop/open-devices/get-started/unlock-bootloader/
    - ここを開きます
- 一番下までスクロールして、デバイスをZ5C、IMEIを入力します。

できたら、解除コードが払い出されるのでコピーして、コマンドプロンプトを開きます。

開いたら、スマホとパソコンをボリューム**アップキー**を押しながらUSBでつないで、通知ランプが青色に光ることを確認してください。

コマンドプロンプトで、`fastboot devices`を叩くと値が帰ってくることも確認してください。

接続できたら、  

```
fastboot oem unlock 0x解除コード
```

をコマンドプロンプトへ入力します。解除コードの前に`0x`を入力しておく必要があるので注意してください。

```
OKAY [  0.693s]
Finished. Total time: 0.695s
```

これで解除できました。DRMキー消失。

## TWRPの導入

ここからが楽しいところなんだけど、ここで躓いたので記事を書いている。  
結論を言うと、Android 7にアップデートしたあとにTWRPを導入する必要があるみたいなのですが、  
なぜか`Xperifirm`が4んでいて`tft`が落とせなくなっています。  

### Android 7へアップデート
じゃあアップデートすればいいじゃんって話なんですが、BLUするとOTAでのアップデートが出来なくなるそうです。  
なので有志が上げているAndroid 7の`tft`を持ってきます。  

https://forum.xda-developers.com/t/ftf-newest-android-7-1-1-for-xperia-z5c-e5823-32-4-a-0-160.3628734/

ダウンロードしたら、`tft`をFlashtoolで焼きます。

### TWRPの導入

これで`TWRP`が導入できるようになります。  
つい最近？公開された`TWRP`があるので導入しましょう。  

https://forum.xda-developers.com/t/recovery-unofficial-twrp-3-5-2-for-the-xperia-z5-compact-suzuran.4213077/

ダウンロードしたら、Xperiaの電源を切って、ボリュームアップキーを押しながらUSBを指すことで通知LEDが青色に光ります。  

この状態でコマンドプロンプトを立ち上げ、以下のコマンドを入れます。  

```
fastboot flash recovery TWRP_3.5.2_9-0-recovery_suzuran_2021-04-11.img
```

導入できたらUSBを外して、電源ボタンとボリュームダウンキーをバイブが振動するまで押すことでカスタムリカバリへ入ることが出来ます。

## これでおしまい

あとは好きなカスタムROMを入れればいいと思います。  
今回はこれでも  

https://forum.xda-developers.com/t/rom-11-x-havoc-os-4-3-unofficial-suzuran.4249577/

ROM本体と、PlayStoreが必要なら`Gapps`、あとRootが欲しければ`Magisk`をそれぞれPCにダウンロードしておきます。  

(もしAndroid11で、64ビットなSoCなら(たしかSnapdragon810以降は64ビット))Gappsはここから https://sourceforge.net/projects/opengapps/files/arm64/test/20210130/  
最低限入ってるpicoを選んでおけばいいでしょう。むしろ欲張るとなんか失敗しそう（小並感）

Magiskは https://github.com/topjohnwu/Magisk/releases からAPKをダウンロードして、その後拡張子を`apk`から`zip`に変えておきます。  

用意できたら、カスタムリカバリへ入って、`Wipe`を選び、`Format Data`をしておきます。`yes`と入力することで始まります。

次にダウンロードしたファイルをXperiaへ転送します。ホーム画面に戻り、`Mount`を選び`Enable MTP`を選びパソコンと接続します。

そうしたらWindowsのエクスプローラーからファイルを転送できるようになるので各Zipを転送します。

![Imgur](https://i.imgur.com/EEH5Rfa.png)

終わったら最後、ホーム画面へ戻り、`Install`を押して、  
- ROMのインストール
- Gappsのインストール
- Magiskのインストール

をします。Android楽しい。3つダウンロードできたら、`Reboot system`を選んでシステムを起動させちゃいましょう！

起動できれば成功です。お疲れさまでした。

PlayStoreでGoogleアプリを入れておけばGoogle DiscoverとかAt a Glanceが使えるようになると思いますので入れておけばいいと思います。

以上です。

# 終わりに
Xperia Z5Cの背面すべすべ？しててすき  