---
title: WSL2 の中に Android Studio を入れてアプリ開発をしてみる
created_at: 2025-02-02
tags:
- Android
- Linux
- Windows
---
どうもこんばんわ。  
リトルプリンセスＧＯ！ 攻略しました。かわいいいい。特にシリアスとかもないのでひたすらかわいかったです。  
えちえちも大体網羅されてていい！！！

![Imgur](https://imgur.com/JCmDrhs.png)

かわいい、かくかくしかじかだ

![Imgur](https://imgur.com/OaL5t4K.png)

![Imgur](https://imgur.com/8uv49Xg.png)

`><`なみだ目だ、かわいい、ちなみに年上ヒロイン

![Imgur](https://imgur.com/PBI812u.png)

![Imgur](https://imgur.com/pmOEwBP.png)

りっかちゃん！！  
ここのお話すき、かわいい。最後の方の話、素直でよかった～。

![Imgur](https://imgur.com/hkbS7Yw.png)

![Imgur](https://imgur.com/S0yCSYC.png)

ミーナさん！！まじで顔がいい。  
この顔すき

![Imgur](https://imgur.com/tOPR7G3.png)

!?!?!?!?

![Imgur](https://imgur.com/lWKiWzG.png)

いい！！神ゲーです  
主人公冥利につきてそう

![Imgur](https://imgur.com/PSs9rYB.png)

![Imgur](https://imgur.com/u3siIbZ.png)

ひたすらかわいいのでおすすめです！あまあまだった  
ミーナさんのえちえちシーンとくによかった...

![Imgur](https://imgur.com/V3u9Sio.png)

# 本題
`ASUS ROG Ally`を買った、えちえちゲームようです。`Surface`壊れたんで。  
（なので別にゲーミングな性能は必要なく、ただ大手の`UMPC`だから買ったってのがデカい）

ゲーミングな性能を持っているので、適当に`Android Studio`を入れてみたら、なんか普通に動いて、メモリこそ足りないものの、結構動いてた。はやい。  
先述の通りメモリは足りないし、キーボードないんだけど、それはそうとビルド環境が持ち出せるのはなんかいいなあって。  
（いやまあ使うか分からんのに`512GB`のストレージを無駄にしていいのかは怪しくなってきた。）  

## 開発環境をローカルに入れるのは、、、
でもこれ、えちえちゲーム専用機にしたいからな～～  
`Android Studio`やら`このブログの開発環境`やらいれたらローカルの環境がぐちゃぐちゃになってしまいそう。。  

あと、入れてもいいんだけど容量が足りなくなった時に簡単に消せるようにしたい。  
多機能なゆえに`Android Studio`を完全にアンインストールするのはなんか面倒くさい記憶がある。  

なんかアップデートしたのに古いバージョンのファイルが残ってたりで、気になる人は気になりそう。

![Imgur](https://i.imgur.com/Th18eHH.png)  

（↑なぜか残り続けるフォルダたち。古参ぶるな）

こんなこと言ってますが、今使ってるデスクトップは特に気にせずしています。  
なので`Android Studio / Intellij IDEA`が作った`Gradle`のキャッシュがホームディレクトリにあるし（`~/.gradle`）、  
`npm`のグローバルインストールや、`pnpm`のシンボリックリンクだったりしてローカルを汚しまくってます。手遅れ。

# WSL2
`Windows Subsystem for Linux`。  
`Windows`で`Linux`の仮想マシンを動かせる。`VMware`みたいなあれ。  

`MS`が公式で出している方法。これで`Linux`にしか**無いソフトを使うことが出来ます！**！！。  
たまによく`Linux / macOS`のバイナリはあって`Windows`だけ無いのを見かける、`Ansible`とか`Redis`とか。  
（どっちも使ったこと無いから`Windows`で困ってないんだけどさ、、）

ただ、今回は`Linux`の仮想マシンが欲しい訳じゃなく、  
どっちかというと**開発環境をその仮想マシンに閉じ込めてすぐ削除できるようにしたい**。

ちなみに`for Android`の方は使ったことないままサービス終了です。  

最近？の`WSL`は`Linux`の`GUI`アプリを動かすことができるようになったそうで、`WSL2`の`Linux`環境に`Android Studio`や他の開発環境を入れればローカルは綺麗なまま、すぐ削除もできて素敵なのでは！？？！  
あと、`Linux`の`GUI`アプリを動かすドキュメント、そんなに難しく無さそう。

https://learn.microsoft.com/ja-jp/windows/wsl/tutorials/gui-apps

アイコンのペンギンがかわいい。

![Imgur](https://i.imgur.com/oq2AS98.png)

# WSL を入れる
一度も入れたことがないので、ドキュメント通り。`PowerShell`を管理者権限で起動して、以下のコマンドを叩くだけ。  
記憶が正しければ昔は`Pro エディションの Windows`が必要とかだったような。

```powershell
wsl --install
```

（もし昔に`WSL`を使っていた場合は`wsl --update`と叩くと更新できます）

![Imgur](https://imgur.com/t3ufLzV.png)

## Wsl/CallMsi/Install/REGDB_E_CLASSNOTREG エラー
参考にしました、ありざいす  
https://qiita.com/mfunaki/items/615e4bd5b356230164c1

一回試した時はなんなくインストールできたのに、クリーンインストールした後もう一回試そうとしたらこのエラーで出来なくなってしまった。  

![Imgur](https://imgur.com/CTsuIEb.png)

というわけで`GitHub`のリリースからダウンロードして入れ直すのを試します。  
https://github.com/microsoft/WSL/releases  
既に最新版が入っているが、うまく行かないので`WSL`自体のインストールから試す。

![Imgur](https://imgur.com/fEawuT3.png)

`msix`の方は失敗したので（`同じ ID を持つものの、コンテンツが異なるため、パッケージ...`）、  
`msi`の方をダウンロードして入れた。`Intel / AMD CPU`の方は`x64`って書いてある方を、`Snapdragon CPU`の方は`arm64`って書いてある方でいいはず？

![Imgur](https://imgur.com/7RlGVx5.png)

ねんのため再起動してみる。  
これで晴れて`wsl --install`ができるようになりました。やったぜ

![Imgur](https://imgur.com/61hBmqL.png)

# Ubuntu がインストールされる
デフォルトのディストリビューションは`Ubuntu`になるそう。`Linux`はあんまり触ったことなく`Debian`系じゃないとわからないので助かった。  
（まぁそれすらもよく知らない、ラズパイがこれだった。）

`wsl --install`が終わると再起動しろって言われたので一旦再起動する。  

![Imgur](https://imgur.com/FGBCphu.png)

再起動したら`Ubuntu`がスタートに表示されたので開いてみる。  

![Imgur](https://imgur.com/1S7FUfv.png)

そしたら処理が進んで、`Linux`のユーザー作成に進みました。スクショ取りそこねました。  
インストールできました！！！

![Imgur](https://imgur.com/U7pELSu.png)

2回目以降はスタートに表示される`Ubuntu`を押すことで起動できます。  
スタートメニューから`Ubuntu`を起動できる時代かあ。  
~~`VMware Player`で立ち上がるのを見守ってたあの頃~~

ちなみに`自作PC`の人が使う`Ubuntu`とは違うと思いますがこれはデスクトップ環境が無い`Ubuntu`だからですね。ラズパイを画面無しで使ってる気分。

# WSL よく使うコマンド
https://learn.microsoft.com/ja-jp/windows/wsl/basic-commands  

これは`Windows`側で叩くコマンドです。書くまでもないか。

## インストールした Linux の状態
`wsl -l -v`

起動しているかとか。`exit`で抜けただけだと動きっぱなしになってる？

## WSL 終了
`wsl --shutdown`

# Cドライブを開けたいので別のドライブに入れたい
参考にしました、ありざいす  
- https://learn.microsoft.com/ja-jp/windows/wsl/basic-commands#export-a-distribution
- https://zenn.dev/shittoku_xxx/articles/066cfd072d87a1
- https://blog.ojisan.io/wsl-reinstall-d/

`Cドライブ`は開けておきたい。ので試しに`SD カード`に`WSL2`の環境を移動させたい。  
しかし、直接`SD カード`に入れることは出来ないそうで、代わりに`Cドライブ`に入れたものを移動させる手段を皆やっているらしい。

## 引越し準備

まずはディストリビューション名を調べます。  
`wsl --list --verbose`コマンドで見れます。

![Imgur](https://imgur.com/4Kvmymq.png)

`NAME`の欄にあるものです。今回は`Ubuntu`（そのままだった）ですね。  

次にエクスポートします。  
`wsl --export {名前} {ファイル名}`。今回の例だと`wsl --export Ubuntu ubuntu.tar`です。今いるフォルダに出来ます。  

![Imgur](https://imgur.com/WVgebLS.png)

エクスポートしたので、次は消します。  
あとでエクスポートしたものをインポートするので消して良いはず。`wsl --unregister {名前}`でできます。  
今回の例では`wsl --unregister Ubuntu`ですね。

![Imgur](https://imgur.com/9BpSqNG.png)

はい。消したので、`wsl --list --verbose`を叩いても何も無いよ！って返ってきます。

エクスポートしたファイルがどこに有るかですが、今のターミナルのパスですね。  
馴染みがない場合は、`pwd`コマンドを叩くと今のパスが分かるので、エクスプローラーでそのパスへ移動すると`ubuntu.tar`があるはず。

![Imgur](https://imgur.com/2TkfPf4.png)

## 引っ越し先
まずは引っ越し先のドライブで`PowerShell`を開きます。  
`cd`で移動してもいいですし、エクスプローラーで開いて空いてる部分を右クリックすると`ターミナルで開く`があるので押しても良いです。多分`PowerShell`だと思う。

![Imgur](https://imgur.com/qzppBSR.png)

ターミナルで引っ越し先に移動したら、次に以下のコマンドを叩きます。  
`wsl --import {名前} {フォルダ} {tarファイルのパス}`。今回の例では`wsl --import Ubuntu wsl C\Users\takusan23\ubuntu.tar`ですね。`wsl`フォルダに展開される感じです。

![Imgur](https://imgur.com/ib3AByZ.png)

これで`wsl`が戻ってきたはず！  
`wsl -d {名前}`コマンドを叩けば起動するはず。今回の例では`wsl -d Ubuntu`です。

![Imgur](https://imgur.com/7ykdM5T.png)

多分スタートメニューの`Ubuntu`から起動できています。

## root ユーザーでログインしているのをやめたい
起動してみるとわかるのですが、`root`ユーザーになっています。大いなる力には大いなる責任が伴う のあれ。  
これは怖いのでできれば初期設定時に作った`Linux`ユーザーに戻したいところです。毎回起動したら`# su takusan23`するのも面倒だし。  

![Imgur](https://imgur.com/7ykdM5T.png)

というわけで戻します。テキストエディタに`vim`を使いますが何でも良いです（戦争回避）  
`root`ユーザーで叩く必要があるのかは不明ですがそんな気がします。

このコマンドでテキストファイルを開きます。`vim /etc/wsl.conf`。私の場合は既にありました。

![Imgur](https://imgur.com/YxS9OOG.png)

そしたら`vim`が開くので、`i`を押して編集モードにし、一番最後の行へ移動し、2行書き足します。  

```plaintext
[user]
default={ユーザー名}
```

ユーザー名は`Ubuntu`初期設定時のあれです。  
私の場合は`default=takusan23`です。

`vim`を使っていれば`Esc`キーを押し、`:wq`と入力しエンターを押すことで保存しターミナルへ戻ることが出来ます。  

![Imgur](https://imgur.com/wV1ZnnE.png)

これで一旦閉じて、もう一回スタートメニューから`Ubuntu`を押せば、みごと初期設定時のユーザーで入れるようになりました。

![Imgur](https://imgur.com/uJHkt4g.png)

# エクスプローラーで Linux のドライブの中身が見れる
すごい便利、仮想マシンじゃ出来ないんじゃないかなこれ

![Imgur](https://i.imgur.com/0Ak8RtB.png)

# デスクトップアプリを入れてみる

## Firefox
手始めにブラウザを入れてみる。ガイドがあったのでそれに従う。
https://support.mozilla.org/ja/kb/install-firefox-linux#

`Ubuntu`は`Debian`系列なので、`.deb パッケージ`のやつをやってみる。  
が、`apt`経由で普通に入れることが出来そう。

順番通りにコマンドを叩けば良いはず。

```shell
sudo install -d -m 0755 /etc/apt/keyrings
```

```shell
sudo apt-get install wget
wget -q https://packages.mozilla.org/apt/repo-signing-key.gpg -O- | sudo tee /etc/apt/keyrings/packages.mozilla.org.asc > /dev/null
```

↑`wget`ない場合は一行目も叩く。

```shell
echo "deb [signed-by=/etc/apt/keyrings/packages.mozilla.org.asc] https://packages.mozilla.org/apt mozilla main" | sudo tee -a /etc/apt/sources.list.d/mozilla.list > /dev/null
```

```shell
echo '
Package: *
Pin: origin packages.mozilla.org
Pin-Priority: 1000
' | sudo tee /etc/apt/preferences.d/mozilla
```

↑これはまとめて貼り付ける

```shell
sudo apt-get update && sudo apt-get install firefox
```

↑`YesかNo`か聞かれるので`y`でエンター。

![Imgur](https://imgur.com/ZZebwr7.png)

終わったら、`firefox`コマンドで起動できます！！  
たしかにデスクトップ`Linux`アプリが`Windows`に表示されている...。謎技術すぎる。

```shell
firefox
```

![Imgur](https://imgur.com/8Wavdk2.png)

また、スタートメニューにも`WSL2 Ubuntu`の中にある`Firefox`のショートカットが表示されます。  
まじで統合されまくっててすごい。

![Imgur](https://imgur.com/VkZvnO9.png)

ただし、日本語フォントがないので入れないといけない。

## どういう仕組みでスタートメニューに登録されるの？
https://www.reddit.com/r/bashonubuntuonwindows/comments/q5a2lv/

**デスクトップエントリ**と言う機能が`Linux`にはあるらしく？、`デスクトップ環境ありの Ubuntu`（自作PCの人達が使ってる方の Ubuntu）だとアプリ一覧に表示させるのに使われているそう。  
そして`WSL2`でもデスクトップエントリを認識して`Linux GUI アプリ`のショートカットを作ってくれる、、、らしい。

# Android Studio
本題！！！！

## ダウンロードする
`Ubuntu`に`Android Studio`を入れる方法ですが、本家通りでいいはず。  
https://developer.android.com/studio/install#linux

もし↑の`Firefox`を既に入れている場合、`Android Studio`のダウンロードページが`Linux`用に切り替わるはず。  

![Imgur](https://imgur.com/8Wavdk2.png)

![Imgur](https://imgur.com/D3KT8mN.png)

## curl でダウンロード
`Firefox`入れてない場合は、`curl`でダウンロードするなり必要。  
ただ`Android Studio`のダウンロードリンクを調べておく必要があります。調べたら`curl`で落とせば。

![Imgur](https://imgur.com/WAyI4CE.png)

![Imgur](https://imgur.com/9PyLeHq.png)

```shell
mkdir ~/Downloads
cd ~/Downloads
curl -OL {ここにダウンロードリンク}
```

このコマンドだと適当にホームディレクトリに`Downloads`フォルダを作ってそこにいれるようにしています。

## インストール
ダウンロードできたら解凍します。`sudo`なのでパスワードいるかも。

```shell
cd /usr/local/
sudo tar zxvf ~/Downloads/android-studio-2024.2.1.12-linux.tar.gz
```

![Imgur](https://imgur.com/z4uXrHf.png)

解凍がおわると、`android-studio`フォルダが出来ているので、`android-studio`の中の`bin`の中にある`studio.sh`ってシェルスクリプトがあるのでそれを実行します。  
2回目以降の起動もこの1行を叩けば良いです。

```shell
sh /usr/local/android-studio/bin/studio.sh
```

いや**嘘偽りなく**`Linux GUI アプリ`が動いてるんだが、  
すごい、謎すぎる。

![Imgur](https://imgur.com/UCIB9cX.png)

セットアップを進めます。  
がんばれ～。ネタバレするとエミュレータはちょっと試した限り動かないっぽいので（おま環かも）、  
`Custom`で進めて、`Android Virtual Device`のチェックを外しても良いかもしれません。

![Imgur](https://imgur.com/HNRTAYy,png)

適当にプロジェクトを作ってみました！  
ビルドは試せてませんがとりあえずは動いてそうです！！！

![Imgur](https://imgur.com/aoCq5m2.png)

すげ～～

## 毎回 sh コマンドを叩くのはめんどい
`Firefox (Ubuntu)`みたいにスタートメニューにおいて欲しい。  
デスクトップエントリと呼ばれるファイルを作ればよいのですが、まず公式で案内されている方法があるので見ます。

https://developer.android.com/studio/install?hl=ja#linux

ひっそりと、`ツールバー > Tools > Create Desktop Entry`を実行するとデスクトップエントリが作れるよって書いてあるんですが、  
`WSL2`だからなのかデスクトップ環境が無いものだと勘違いされたのか**項目がありません。**  

ので、自分で書きます。  
まずは以下のコマンドを叩いて`android-studio.desktop`を作ります。`vim`を使いますが何でも良いです。（戦争回避）

```shell
cd /usr/share/applications/
sudo vim android-studio.desktop
```

そして以下を貼り付けます。  

```ini
[Desktop Entry]
Type=Application
Encoding=UTF-8
Name=Android Studio
Comment=Android Studio
Exec=/usr/local/android-studio/bin/studio.sh
Icon=/usr/local/android-studio/bin/studio.svg
```

（↓のスクショは若干間違ってて、↑の文字列が正解です。）

![Imgur](https://imgur.com/GWUELOe.png)

書けたら保存してターミナルに戻ります。  
`Vim`なら`Esc`キーを押し`:wq`でエンター。

これでスタートメニューに「`Android Studio` **(Ubuntu)**」が表示されるようになり、押すと`WSL2`上で`Android Studio`が起動できます！！  
もしアイコンがペンギンのままで、反映されてなかったら`Windows`を再起動してみてください。

![Imgur](https://imgur.com/msLfYki.png)

![Imgur](https://imgur.com/aYuxyHy.png)

ターミナルから起動するときと比べて、`WSL2`の`Ubuntu`が起動していない場合はちょっとだけ時間かかります。  
もちろんスタートメニューから押しても起動します。すごい。

![Imgur](https://imgur.com/e3J8r8N.png)

## WSL2 の中にある Android Studio から実機を繋ぎたい
ちなみにエミュレータは1時間くらい戦ったけどダメそうでした。またやってみてもいいけど実機のほうが楽だし。。  

### Windows 側の用意
`WSL2`で`USB`デバイスと接続する方法がちゃんとあります。  
https://learn.microsoft.com/ja-jp/windows/wsl/connect-usb

まずはここから`.msi`のインストーラーをダウンロードし、ホストの`Windows`環境へインストールします。  
https://github.com/dorssel/usbipd-win/releases

![Imgur](https://imgur.com/8qV1zvP.png)

次に端末を繋ぎます。  
`UMPC`だともうポートが埋まってしまう。。。

そしたら`WSL2`の`Ubuntu`を起動しておきます。ここから先は多分`WSL2`を起動しておく必要があると思います。

次に新しく`PowerShell`を**管理者権限**で開き、以下のコマンドを叩きます。  

```powershell
usbipd list
```

出てきた一覧から、`WSL2`で使いたい`USB`デバイスを探します。  
以下例。

```shell
Connected:
BUSID   VID:PID     DEVICE
3-1     xxxx:xxxx   Pixel 8 Pro
```

今回は`Pixel 8 Pro`なので`3-1`ですね。ここは皆さん違うと思う。~~学校のクラスみたい~~  
`BUSID`の部分をそれぞれ以下のコマンド置き換えて、叩きます。私の場合は`3-1`ですね。

```powershell
usbipd bind --busid {BUSID}
usbipd attach --wsl --busid {BUSID}
```

![Imgur](https://imgur.com/G3NgI73.png)

### WSL2 側の用意
次に`WSL2`の`Ubuntu`のターミナルへ切り替え、`ADB`を使う準備をします。  
おそらくこのまま`adb`コマンドを叩いても権限が足りなくて`Access denied (insufficient permissions)`みたいなエラーが出ちゃうんじゃないかなと思います。  
ちなみに`ADB`の所在は`~/Android/Sdk/platform-tools/`に`adb`ってあるはず。

```plaintext
01-28 02:16:11.932   510   510 E adb     : usb_libusb.cpp:598 failed to open device: Access denied (insufficient permissions)
01-28 02:16:11.932   510   510 I adb     : transport.cpp:1153 39171FDJG005SC: connection terminated: failed to open device: Access denied (insufficient permissions)

* failed to start daemon
adb: failed to check server version: cannot connect to daemon
```

というわけで公式を見ます。  
どうやら`ユーザーの操作`となんか`apt`から入れないといけない？  
https://developer.android.com/studio/run/device#setting-up

というわけで、公式通りに以下の2つ叩きます。  
`ADB`の`Access denied (insufficient permissions)`エラーは2行目の`apt`パッケージをインストールしたら直りました。再起動が必要かもしれません。

```shell
sudo usermod -aG plugdev $LOGNAME
apt-get install android-sdk-platform-tools-common
```

あとはもう一回`adb`コマンドを叩いてみる。

```shell
cd ~/Android/Sdk/platform-tools/
./adb devices
```

これで認識される（もしくは`Android`端末側に許可ダイアログが表示される）はずです！！

![Imgur](https://imgur.com/ggj09i2.png)

後は`WSL2`上の`Android Studio`を起動します。  
スタートメニューでも良いですし、以下のコマンドを叩いても良いです。

```shell
sh /usr/local/android-studio/bin/studio.sh
```

どうでしょうか？  
`Android Studio`の実行で実機が選べるようになってますか？ビルドもできるはず

![Imgur](https://imgur.com/JIGega5.png)

ちなみに使い終わったら引っこ抜けばいいらしい。  
だめな場合は`USB ハブ`を使わないとかしてみてください。

## 実機で動作確認
思ったよりもずっと速い。  
仮想マシンとは思えない。

## 2回目以降は？
もう一回接続したい場合は、端末を繋いで、`WSL2`の`Ubuntu`を起動した後、`Windows`の`PowerShell`で以下のコマンドを叩くだけでいいはず。これで`WSL2`側に認識されます。

```powershell
usbipd attach --wsl --busid {BUSID}
```

あとは`WSL2`上の`Ubuntu`で`Android Studio`を起動すれば良い。

![Imgur](https://imgur.com/FprBlYF.png)

# WSL2 の環境を削除したい
`Windows`上の`PowerShell`で以下のコマンドを叩きます。

```powershell
wsl -l
```

そしたら消したい`Linux`のディストリビューションの名前が出てくるので、消したい名前を覚えて以下のコマンドを叩く。  
例えば`Ubuntu`だったらこれです。

```powershell
wsl --unregister Ubuntu
```

これで容量が開放されるはずです。  
もう一度入れたい場合は以下のコマンドでいいはず。

```powershell
wsl --install
```

# おわりに
積んでるエロゲやるために買ったのになんですかこの記事は

# おわりに2
`apt`で調べるとショート動画のが出てくる！