---
title: Android NDK 無しで USB Video Class をやりたかった（ギブアップ）
created_at: 2024-09-30
tags:
- Android
- Kotlin
---
どうもこんばんわ。  
最近は数年ぶりに`Nova Launcher`ってホームアプリを使ってます。`Android 7`くらいのときは有料版を買うくらいには気に入ってた。  
列や行のサイズを変えたり（今なら標準で出来ますが、上限付き）、ウィジェットの最小幅を無視したり、上から下スワイプで通知領域を展開したり（これも今なら標準で出来ますが）、ページ丸々削除するやつとか、通知バッチとか気に入ってた。

しかし`Android 10`が来てからは、ジェスチャーナビゲーションを使うために標準ホームアプリを使ってました。  
正しくはサードパーティのホームアプリでもジェスチャーナビゲーションが使えたのですが、その頃のサードパーティのホームアプリにはホーム画面に戻ったときのアニメーションが実装されて無くて、使うのをやめちゃったんですよね。（そもそもデバイスメーカーによっては標準ホームアプリ以外を使う場合はジェスチャーナビゲーションが無効になるとか）  
`Android`がそれ用の`API`を提供してくれないのが悪いみたいでサードパーティが対応するのは難しいとか。

が、やっぱりウィジェットを詰め込みたくて舞い戻ってきた。最小幅を無視したい。  
**今使ってますが、かなり再現度の高いジェスチャーのアニメーションがされるようになってました。**  
いつから実装されたんだろう？`API`がないからサードパーティではもう無理なのかなって思い込んでたんだけど、`Nova Launcher`側でフルスクラッチしたのか、かなり再現度の高いアニメーションがされるように進化してた、、、  

# 本題
ギブアップです。わかりません。  
敗因は`UVC`どころか`USB`自体がわからなかったことかなと思います。  

`Android NDK`、というよりかは`C / C++`無しで`USB Video Class (UVC)`をやりたかった。。。  
なんとか`Java / Kotlin`だけで書けるようになりたかった。

# 中途半端な成果
だれか続きを書きたいという方がいらっしゃれば。  
https://github.com/takusan23/AndroidKotlinUsbVideoClass

見るべきところは`MainActivity`です。  
https://github.com/takusan23/AndroidKotlinUsbVideoClass/blob/master/app/src/main/java/io/github/takusan23/androidkotlinusbvideoclass/MainActivity.kt

一応繋いで、権限を付与した後ボタンを押すと、こんな感じのぐちゃぐちゃな画像ができます。  
本当はぐちゃぐちゃにならないはずですが。。

![Imgur](https://imgur.com/sUJYbC1.png)

![Imgur](https://imgur.com/7CbPh4q.png)

`Xperia`の外部モニターだときれいに出ている。解像度が変なのは私があれこれいじったせい。  

![Imgur](https://imgur.com/HKjDS1i.png)

# 先駆け者さんを調べる
ぶっちゃけパクリです。すいません

- https://voidcomputing.hu/blog/android-uvc/#test-implementation
    - https://github.com/badicsalex/ar-drivers-rs
- https://github.com/libuvc/libuvc

# USB Video Class 仕様
仕様がダウンロードできます、が！`USB`に関しての知識がないと多分わからない。私も分からん。

https://www.usb.org/document-library/video-class-v15-document-set

## Android USB ドキュメント
ブロードキャストレシーバーが出てきて懐かしい気持ち。クラスが何個か出てきて複雑

https://developer.android.com/develop/connectivity/usb/host

# UVC デバイスからフレームを取得する流れ
多分こんなことを`libuvc`がやっている。`C言語`はわからない

- `UVC`のデバイスを探す
- 探した`UVC`デバイスに接続する
    - カメラ権限が必要です
- `USB`デバイスを操作する権限がなければ、ダイアログを表示し付与してもらう
    - `USB`デバイスの`インターフェース`や`エンドポイント`に触れるようになる

これ以降は`UVC`の仕様書を読んだり、`libuvc`がやっていることを真似すれば良いはず。理論上は

- `USB`には通信路がいくつかある？この通信路をインターフェースとか呼んでいるそう
    - `UVC`の場合は、仕様書を見ると`0番目`が`VideoControl`、`1番目`が`VideoStreaming`になってて、映像のフレームが欲しい場合は`1番目`のインターフェースを使う
- `1番目`のインターフェースを取る。あと`エンドポイント`も取る
    - エンドポイントが何なのかはよく分かっていない
- `claimInterface`で、`USB`デバイスを専有する
- `コントロール転送`を使って、`UVC`デバイスに命令を投げる
    - 命令内容もパクって作ったのでぶっちゃけわからない。。。
    - `libuvc`のこの辺で命令の`バイト配列`を作っている
        - `C言語`わからない
        - https://github.com/libuvc/libuvc/blob/047920bcdfb1dac42424c90de5cc77dfc9fba04d/src/stream.c#L470
- `バルク転送`を使って、フレームを取り出す
    - ここもよく分からなくて、多分受け取るバイト配列のサイズをちゃんと出さないといけない
        - 適当にでかい数字を入れていたのも敗因
    - 手に入るのは`YUY2`（手元のやつだとこれだけっぽい）
        - `Android`だと`YuvImage`クラスを使うことで`JPEG`にできます
- `YUY2`を`JPEG`とかにする
    - 何もわからないので、ぐちゃぐちゃな画像がここでゲットできる

# どうすればいいのかな
`libuvc`は`libusb`っていうライブラリを叩いてるので、`Android`に持ち込むのは先人たちが言うには厳しいそう。（`USB`デバイスのファイルにアクセスできない）  
`Android`で`USB`を触るには`UsbManager`ってのがすでにあるため、それを使わないといけない。

なので、`libuvc`と同じように命令のバイト配列を組み立てたり、結果をパースしたりして、  
`libusb`を叩いてる部分は`Android`の`USB関連`のクラス、`UsbDeviceConnection#controlTransfer`や`UsbDeviceConnection#bulkTransfer`を使えば、**理論上は動くような気がしている**

めちゃめちゃ大変そうだけど。

# おわりに
内容0で申し訳ない。まずは`libuvc`を動かしてみるところからやらないとダメそう。  
あと`Camera2 API`で`UVC`デバイスにアクセスできるとか書いてありますが、あれは`Xperia`くらいしか対応した機種がないです。  
カメラ連携を謳ってるだけある！！！！