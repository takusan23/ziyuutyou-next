---
title: Android Studio で実機を繋いだのに No Devices が出るのを直す
created_at: 2024-06-04
tags:
- Android
- AndroidStudio
---

どうもこんばんわ。  
スマホの地震速報が鳴ったそう（寝てた）ですが、これ`SIM カード`刺さってなくても受け取れるんですかね？  
解約済みの`SIM カード`でも、刺しておけば受け取れると思ってたけど（地震速報の類はは携帯の契約に関わらず送ってるらしい？）、  
刺してなくても来るの？知らなかった

![Imgur](https://i.imgur.com/06rgsQq.png)

![Imgur](https://i.imgur.com/0EVN6kv.png)

ただ、`SIM`刺さってないやつでも来てない端末あるし、  
なんなら`SIM`刺してる`Pixel 8 Pro (Android 15 Beta)`も来てなさそうなのでよくわからない。（ベータだから？）  

![Imgur](https://i.imgur.com/D5ZGjBs.png)

`NewRadioSupporter`がなぜか`SIM`刺してないのに表示されたりするので、電波よくわからない（）  

![Imgur](https://i.imgur.com/Q7YzbUI.png)

# 本題
なんか`Android Studio`でたまによく`No Devices`になるので、私のパソコンでいつもやってる解決方法を書きます。  
**Windows**しかわかりません。。。

![Imgur](https://i.imgur.com/UnVOkEE.png)

↑こんなの

# 環境
まって`adb`（`platform-tools`）のバージョンが古いから？

| なまえ                             | あたい                                                       |
|------------------------------------|--------------------------------------------------------------|
| Android Studio                     | Android Studio Jellyfish 2023.3.1 Patch 1                    |
| ADB のバージョン（`$ adb --help`） | Android Debug Bridge version 1.0.41 / Version 34.0.1-9979309 |
| Windows                            | 10 Pro                                                       |

# Android Studio を閉じる
なんか閉じないとうまく行かないときがある、、、気がする。  
どっちかというとメモリ使用量が多すぎて再起動したい。気持ちが強いから閉じてる。

# タスクマネージャーで adb のプロセスを56す
56しに行きます  

タスクマネージャーを開き（簡易表示なら詳細にして）、詳細タブへ移動して`adb.exe`を選び、右下の`タスクの終了`を押して終了させます。（ダイアログで聞かれますが構わず終了で）  
`adb.exe`が複数存在する場合は全部終了させます。

![Imgur](https://i.imgur.com/XUOsw9M.png)

# adb を再起動する
`コマンドプロンプト`/`PowerShell`/`その他 Git 入れたときに付いてくる bash`、何でもいいのでターミナルさん！？を開きます。  
そしたら以下のコマンドを入力してエンター

```bash
adb start-server
```

あとはなんか`tcp`がなんとかとか出るようになるので、`Android Studio`を開きます。  
どうでしょう？出ましたか端末？

![Imgur](https://i.imgur.com/6dS0NlB.png)

![Imgur](https://i.imgur.com/DiXMV6Y.png)

# それでも出ない
フロントパネル（電源ボタンとかがある面）の`USB`に繋がってる周辺機器を一回全部抜くとうまくいく。  
`無線 LAN ドングル`もフロントパネルに刺している場合は抜く羽目になるのでネットが一回切れてしまう。

`No Device`は解決したけど、いざ実行しようとすると`gradle`のタスクが全く進まない時は一旦全部引っこ抜いてる。

ノートパソコンは・・・うーん

# おわりに
パソコン`Coffee Lake`なんですけどまだ行けるよね？