---
title: Android 16 DP1 を Pixel 8 Pro に入れる
created_at: 2024-12-01
tags:
- Android
- Android16
---
どうもこんばんわ。  
`targetSdk 35`対応やったかな～？私はたいしたアプリじゃないのですぐやり終えました。  

`targetSdk 35`、地味に厄介そうな仕様変更があって、`Kotlin`の配列に拡張関数として生えてた`removeFirst()`、`removeLast()`関数が`Java`に**逆輸入**されたらしく？、`targetSdk 35`からは`Java`の実装を使うようになったらしい。  

https://www.reddit.com/r/androiddev/comments/1gspjrs/

で、この`Java`版の実装が入ったのが**Android 15 からで**、`Android 14`以下は逆輸入されてないため**実行時エラー**になる（メソッドが存在しないエラー）。**怖すぎる**  

というわけで人柱になろうかなと思い早々に更新をかけたけど、たいしたアプリじゃないからか特に問題は無さそう？  
`Jetpack Compose`、`WorkManager`、`DataStore`、`Jetpack Glance`あたり。あんまり無いね  
（`Android`が出してるライブラリは先に修正したとかなのかな）

# 本題
今の`Android 16`は`Developer Preview`版で、ソフトウェアアップデートアプリ経由では更新ができないのでパソコンが必要です。  
`Beta`段階に進むとパソコンなしでインストール出来るようになります。

https://developer.android.com/about/versions/16

# 公式
https://developer.android.com/about/versions/16/get

# 準備するもの
これから説明する方法だとデータが消えてしまうので注意です。`TOTP`のバックアップをお忘れなく。  
昔は`OTA ファイル`経由でインストールすることも出来たはずですが、今見ると`OTA`でも`ブートローダーアンロック`を推奨してて、アンロックするとやっぱりデータが消えてしまいます。  
むかしの参考：http://takusan.negitoro.dev/posts/android_12_dp_hitobashira/

データを残したい場合は`Beta`を待つといいと思います。  

あとはパソコンに`Chrome`。今回は`Google`通りに`Android Flash Tool`という`Webサイト`で更新をします。  
ブラウザだけで更新ができるのはどうなんだという意見は今はおいておくことにします（`WebUSB`）

| なまえ   | あたい         |
|----------|----------------|
| たんまつ | Pixel 8 Pro    |
| ぱそこん | Windows 10 Pro |
| ぶらうざ | Chrome         |

# 手順
というか、ここに書くまでもなく`Webサイト`の指示に従えば`Android 16`がインストール出来るはず。  

## 事前設定
`Pixel`側で開発者向けオプションを有効にし、`USB デバッグ`と`OEM ロック解除`を有効にします。

![Imgur](https://imgur.com/yb03ksM.png)

## Android Flash Tool を開く
端末とパソコンを接続します。

そしたら`Android 16 DP1`の`Flash`はここですね。以下を開きます。  
https://flash.android.com/preview/baklava-dp1

するとこんな感じの小さい小窓が出てくるので許可。  
![Imgur](https://imgur.com/0ZKk6dz.png)

`Pixel`端末に`ADB`許可ダイアログが出ていれば許可してあげてください。

そうすると多分端末が選べるようになってるはず？  
![Imgur](https://imgur.com/XGVX2DP.png)

端末が選べない場合は`Add new device`を押し、接続中の`Pixel`を選ぶ。  
`Android Studio`みたいな`adb`使うようなアプリは閉じておいたほうがいいのかも。  
![Imgur](https://imgur.com/a5nIlrX.png)

![Imgur](https://imgur.com/9I0n3b2.png)

端末を選ぶと`Install build`ボタンが押せるようになってるはず。  
いざ`Android 16`  
![Imgur](https://imgur.com/Ti2y6a2.png)

インストールを開始するとこんな感じでデータが消えるけどいいか？って聞かれるので`Confirm`を押す。  
![Imgur](https://imgur.com/GHddhiE.png)

しばらく待ちます  
![Imgur](https://imgur.com/FfCd0c9.png)

途中で`Bootloader Unlock`するよう言われるので、`Pixel`の画面に従う。  
ちなみに`OEM ロック解除`を`OFF`の状態でやるとこの画面になります。一回起動して`ON`にしてリトライしましょう。  
![Imgur](https://imgur.com/MXGM43F.png)

パソコンの画面もスマホの画面も取りそこねたのですが、  
画面には音量ボタンで選択肢を変更できる、電源ボタンで確定が出来ると書かれているので、音量アップボタンを押し`Unlock the bootloader`という文字に切り替えて、電源ボタンを押す。  

あとは勝手に進むので待つ。  
![Imgur](https://imgur.com/Ezzd4st.png)

最後に`Bootloader`を再度ロックするよう言われるので、ボリュームボタンで今度は`Lock the bootloader`にして電源ボタンを押す。これで終わりのはず。  
以上です。