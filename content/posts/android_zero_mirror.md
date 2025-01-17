---
title: ブラウザへAndroidの画面をミラーリングできるアプリ、ぜろみらーを作った
created_at: 2022-08-01
tags:
- Kotlin
- Android
- MediaCodec
---

どうもこんばんわ、（お久しぶりです）  
D.C.4 Sweet Harmony ～ダ・カーポ4～ スイートハーモニー 攻略しました。  
めっちゃいいですね、ヒロインみんなかわいい！

ここの話ほんとかわいい  

![Imgur](https://i.imgur.com/iBWxbJI.png)

ここほんとすき  

![Imgur](https://i.imgur.com/7IlRZEE.png)

あぁぁぁ  

![Imgur](https://i.imgur.com/B36lbxb.png)

本編では焦点があまり当てられなかったヒロインたちのストーリーが本作でちゃんとしてていい！  

![Imgur](https://i.imgur.com/RKCEJn9.png)

~~実用性もあるとおもう~~

# 本題
ぜろみらーを作りました。ミラーリングアプリです。  
とりあえずリリースしましたが、多分動く端末のほうが少ないと思う←！？

![Imgur](https://i.imgur.com/FwtzpvV.png)

ニコ生のコミュの名前にありそうですが関係ないです。  

# ダウンロード
- PlayStore
    - https://play.google.com/store/apps/details?id=io.github.takusan23.zeromirror
- GitHub
    - https://github.com/takusan23/ZeroMirror
- プライバシーポリシー
    - https://github.com/takusan23/ZeroMirror/blob/master/PRIVACY_POLICY.md

# 機能
- ブラウザがあれば見れる、同じWi-Fi (同じLAN) に接続している端末のブラウザから見れます
- 設定はほぼない
- 画面だけじゃなくて、端末内音声も共有される（Android 10 以上、がんばった）
- 一応おまけ機能として、`VP9`でエンコードする機能もあります。`H.264`と比べて同じビットレートだと多分きれいな気がする...
- ブラウザ側は簡単なHTMLとJavaScriptが書いてあるだけ
    - WebSocketクライアント、HTTPクライアント、動画再生機能、インターネット接続 があればブラウザ以外でも視聴側は移植できるかも

ブラウザがあれば使える → ほぼ設定がない → Zero ( Config ) Mirroring → ぜろみらー  
結構無理やりなので負荷がやばいかも  
あと動画を細切れにしている以上、切り替えで一瞬ロードされちゃいます...

# ざっくり仕組み
端末の画面録画と(あれば)端末内音声を集めて、動画を細切れにして、ブラウザへWebSocketで送信してます。  
もっといい方法があったかもしれない...

![Imgur](https://i.imgur.com/czpAHGx.png)

## 真面目に仕組み
Androidの画面録画、端末内音声の内容を`MediaProjection`で受け取ります。  
（画面録画は`Surface`、端末内音声は`PCM`）  

受け取ったら`MediaCodec`で`H.264`か（設定したら）`VP9`にエンコードします。  
エンコードしたら`MediaMuxer`を使い`mp4`か`webm`の動画ファイルにします、一定期間経ったらファイルを切り替えてまた保存します。  
できた動画ファイルを`WebSocket`を使ってブラウザへ通知して（動画ファイルのパス）、ブラウザの`<video> タグ`で再生します。

動画ファイルを細切れで作って、ブラウザで再生しているだけです。はい

## もっといい方法ないの

### HLS / MPEG-DASH
リアルタイム配信といえばこれ？  

`HLS`は`MediaMuxer`が`MPEG2-TS`のコンテナフォーマットに対応していないので無理です！(これは後述)  
`MPEG-DASH`も`MediaMuxer`が`Fragmented MP4`を作れないので多分無理です。  

ブラウザで見たかったので（追加のアプリが必要とかは敷居が高い！）今回は動画ファイルを細切れにして送ることにした。  
`iOS`だと出来るみたいなのですが残念ですね...

（ffmpeg？ バイナリが大きくなる上にライセンスがね...）

# 大変だったこと

## MediaMuxer
`MediaMuxer#addTrack`がスタート前じゃないと呼べないため、使いにくい！  
それとは別なのですが、高レベルAPIの`MediaRecorder`には`MPEG2-TS`のコンテナフォーマットに対応しているのですよね。  
一方今回使った低レベルAPIの`MediaMuxer`には`MPEG2-TS`のサポートはありません！え逆では

なら`MediaMuxer / MediaCodec`とかを使わずに、`MediaRecorder`を使えば`HLS`で配信出来たの！？って話になるんですが、  
ならないです。内部音声を収録して一緒の動画ファイルにしたかったので。残念。  
それに加えて、もし内部音声がなかった場合でも動画を短い間隔で作り直すのは`MediaRecorder`では多分難しいような気がします。遅延が大きくなりそう。

## MediaCodec
`MediaMuxer`のインスタンスを作り直した場合は、`MediaCodec.BufferInfo`の`presentationTimeUs`を`0`からスタートするようにする必要があるみたいです。  
https://github.com/takusan23/ZeroMirror/commit/3718678180bea6037c0e23d2686b2265b2d4e58f

あと`VP9`の場合は解像度が厳しいです（1920x1080、1280x720 なら動く）、ディスプレイの画面解像度をそのまま入れたら落ちてしまう。

## MP4ファイルがストリーミング出来ない
mp4ファイルをストリーミングできるように（ダウンロードしながら再生）するには、`mp4`ファイルの先頭に`moovブロック`を置く必要があるらしい（？）のですが、  
`MediaMuxer`の場合は最後に`moovブロック`を置くため、ストリーミング出来ません（全部ダウンロードしてから再生してしまう）
`ffmpeg`が入ってる場合は以下のコマンドを叩くことで、`moovブロック`の位置が分かります。

```
ffmpeg -v trace -i ファイル.mp4 2>&1 | grep -e type:\'mdat\' -e type:\'moov\'
```

多分こうなっていれば正解なのですが

```sh
$ ffmpeg -v trace -i  publish74.mp4  2>&1 | grep -e type:\'mdat\' -e type:\'moov\'
[mov,mp4,m4a,3gp,3g2,mj2 @ 00000133f22a9a40] type:'moov' parent:'root' sz: 3844 32 1896645
[mov,mp4,m4a,3gp,3g2,mj2 @ 00000133f22a9a40] type:'mdat' parent:'root' sz: 1889577 7076 1896645
```

`MediaMuxer`で出来たファイルは`moovブロック`が一番下なのですよね...

```sh
$ ffmpeg -v trace -i  publish29.mp4  2>&1 | grep -e type:\'mdat\' -e type:\'moov\'
[mov,mp4,m4a,3gp,3g2,mj2 @ 000002461b249a40] type:'mdat' parent:'root' sz: 1420893 3232 1427957
[mov,mp4,m4a,3gp,3g2,mj2 @ 000002461b249a40] type:'moov' parent:'root' sz: 3840 1424125 1427957
```

この問題はすでに先駆け者さんが対応してくれています！  
すごい！

- https://qiita.com/yuya_presto/items/d48e29c89109b746d000
- https://github.com/ypresto/qtfaststart-java

上記のプログラムをお借りすることで、`moovブロック`を先頭に移動できました、ありがとうございます！

```sh
$ ffmpeg -v trace -i  publish74.mp4  2>&1 | grep -e type:\'mdat\' -e type:\'moov\'
[mov,mp4,m4a,3gp,3g2,mj2 @ 00000133f22a9a40] type:'moov' parent:'root' sz: 3844 32 1896645
[mov,mp4,m4a,3gp,3g2,mj2 @ 00000133f22a9a40] type:'mdat' parent:'root' sz: 1889577 7076 1896645
```

ちなみにブラウザでもストリーミング再生なのでバッファリングの表示がされるようになります。

![Imgur](https://i.imgur.com/JnQyJg9.png)

なお`WebM`の場合は特に何もせずともストリーミング可能なファイルにしてくれるみたい

![Imgur](https://i.imgur.com/9sI9oHv.png)

# よくわからない

## 端末の差がある
新しめの端末じゃないと動かないっぽい？  
動かない理由もよくわからん（`MediaCodec`のクラッシュログが不親切）

## Opusだと音が高い？
これはまじで謎です。  
なんかエンコーダーの設定間違えたのかな。

追記：すいませんサンプリングレート間違ってただけでした。

## VP9でエンコードした動画がなんかFirefoxだけ再生できる
わかりません、Chromeだと再生されませんでした。

# 終わりに
Pixel 6 Pro のディスプレイちょっとだけ画面傷入っちゃって悲しい。

D.C.5 ！？

![Imgur](https://i.imgur.com/7d4KIrc.png)