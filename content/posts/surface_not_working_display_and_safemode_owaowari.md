---
title: Surface の画面が壊れた上にセーフモードで起動して本格的に壊してしまったので直す
created_at: 2024-12-18
tags:
- Surface
- Windows
---
それはそうともう`Microsoft Surface`は買わないと決めました。高いだけじゃんか。  
これ交換したやつなんですが、それでも少し前くらいから画面がご機嫌斜めで、チカチカしたり謎の線が出たりいきなり真っ暗になったりしてた。

ちなみに画面以外に`タイプ カバー`も壊れてて（キーボード使えない）、  
`Surface Connect`も充電されてないことがあり（信用できないので`Type-C`で充電してる）、  
なんか自撮りカメラの部分にホコリが入り込んじゃってる（ホコリは私のせいかも）。  
もう買わないです。  

交換したのが三年前くらいらしいので、、、うーん。  
https://takusan.negitoro.dev/posts/surface_pro7_repair/

# おことわり
多分`Surface`だから直ったのであって、他だと厳しいかも。  
あと`Windows`マシンと`USB メモリ`が必要です。壊れてない動く`Windows`マシンで`Windows インストールメディア`を作成するので。

# 先に結論
**ディスプレイこそ治らなかったものの、`msconfig`の設定を元に戻すことには成功。**  

生きてる`Windows`マシンで`Windows インストールメディア`を作成したあと、`AutoUnattend.xml`をインストールメディア内に作成。  
`msconfig`のセーフモードを解除するコマンド（`コマンドプロンプト`のやつ）があるため、それをインストールメディア起動時に呼び出されるように`xml`を記述する。  

最後に`インストールメディア USB メモリ`を差し`Surface`を`USB ブート`するように起動し、なんとなく起動した感じがしたら強制終了し、  
`USB メモリ`を抜いたあと再度電源ボタンを押し`Windows`を立ち上げることで、`msconfig`の`セーフモード`地獄から脱出。

# 事の発端
![Imgur](https://imgur.com/WBpclpf.png)

↑複製を押しても変わらんしそもそも戻ってしまう。

`Surface Pro 7`の画面が付かない。  
正しくは窓のロゴが1秒くらい表示されるがその後に画面だけ付かない。

が、画面が付かないだけで、電源ボタン長押しで起動し直したときの起動音や、USB デバイスを繋いだときの音はなっている。  
唯一`Surface`のいいところかもしれない`Windows Hello`の速い顔認証も動いている。  

また、`USB-C`から`HDMI`に変換したところ、ちゃんと映ったので、`GPU`が壊れたとかでもなく、**画面だけが壊れた**。タッチパネルはなぜか生きてる。  
ディスプレイの設定でセカンダリだけ使う設定なのか、いやまさかとは思ったけどそんなことなかった。  
ちなみに複製にしても変わらない。画面が壊れてしまった。

ちなみにリモートデスクトップが可能、もちろん`Windows Pro`エディションのみで設定が必要。

# とどめを刺した
なんとなくセーフモードを試そうと思い、`msconfig`、システム構成からセーフモード起動を有効にしてしまった。  

そもそもセーフモードで起動したい場合は別に`システム構成（msconfig）`なんていじる必要がなく、設定から回復を選べばいいだけ。  
なんですけど、この回復メニューが`外部出力出来ない可能性を鑑みて`こっちの手段を取ってしまったんですよね。

**セーフモード**だと`GPU`のドライバが汎用ドライバ？になるらしく、（これのせいなのかは不明ですが）`HDMI 画面出力`が使えなくなってしまった。  

**本格的に壊してしまった。。。**  
壊れたというか余計なことをして壊した。

# ここまで
`Surface`本体のディスプレイが壊れたので、`HDMI による外部出力`に頼っていたが、セーフモードでは外部出力ができない。  
（`GPU 汎用ドライバ`が使われる？から？）

しかもセーフモードを`システム構成（msconfig）`でやってしまったがために、明示的に戻すまで常にセーフモード、常に外部出力が使えない。

# やってみたこと
画面はもう直らなくていいので、`msconfig`でやらかしたセーフモードの設定をとにかく戻したい。

## 電源と音量アップボタンを押して強制終了
`OS`というかソフトウェアが固まってる分にはこれで解決だろうけど、画面が壊れてる雰囲気を感じる。  
だめだった。1 秒くらい`Windows`のロゴがでて、あとは起動音はなる。

## Windows インストールメディアの USB メモリを作ってそこから起動
どうやら`インストールメディア`には`cmd（コマンドプロンプト）`が付いてて、`OS`をインストールする目的以外に、  
既にインストール済みだけど起動できない`Windows`に対してコマンドプロンプトでコマンドを叩ける？機能があるらしい。  
https://www.tenforums.com/general-support/139205-how-escape-msconfig-induced-safe-mode-boot-loop.html

でも`Windows`をインストールするまでは汎用ドライバだし、これじゃ画面出力出来なくない？  
`Windows Update`を待つなり手動でいれるなりしないと（自作PC並感）

ちなみに`USB`から起動する方法は`UEFI`を使う必要がなく、`電源ボタン`と**音量ダウン**を同時押しで`USB`から起動できるそうです。  
大抵のパソコンは`UEFI`で起動順序というかブートメニューをいじる必要がある  

### 余談
そもそもデフォルトだと`Windows`の高速スタートアップ機能が有効になっているせいで一筋縄では`UEFI / BIOS`に入れない。  
`Windows`マシンを手に入れたら真っ先にやることは`Chrome`のインストールではなく**高速スタートアップの無効化**です。多分大差ない

# 成功したこと
冒頭のそれです。  

## Windows PE を起動したら自動的にコマンドを叩く
今回やったのは、`Windows インストールメディア`を作り、`Windows`セットアップを自動化できる`AutoUnattend.xml`を使い、  
`Windows PE`起動？（インストールメディアから起動した直後？）と共に、裏でコマンドプロンプトを使い`msconfig`の設定を元に戻す作戦。  

画面が壊れてるので、`cmd`を開いて操作するってことが出来ない。ので自動化させる。画面が見えないのでかなりの賭けになる。  
その手順でも。

## Windows インストールメディアを作る
まずは別の動く`Windows`マシンで`Windows インストールメディア`を作る、  
昔作った時は`USBメモリ 4GB`くらいで足りた気がするんだけど、今`8GB`いるんだ。

https://www.microsoft.com/en-us/software-download/windows11

インストールメディア作りたいので`Windows 11 インストール メディアを作成する`を選べばいいはず。  
どうでもいいけど今だと`ISO`ファイルが直接落とせるんだ。昔は`ユーザーエージェント`変えないと落とせなかった気が、

あとは画面に従って`USB メモリ`に入れてください。

![Imgur](https://imgur.com/lLQJ5ex.png)

## インストールを自動化できる AutoUnattend.xml を作成する
これを作ると、インストールを自動で行えるそうですが、今回は`Windows PE`起動とともにコマンドを叩きたいだけなので、最小限です。  
`USB メモリ`のルートフォルダに`AutoUnattend.xml`を作り、以下の`xml`を貼り付けます。

![Imgur](https://imgur.com/SKHwhCR.png)

```xml
<unattend xmlns="urn:schemas-microsoft-com:unattend" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State">
	<settings pass="windowsPE">
		<component name="Microsoft-Windows-Setup" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
			<RunSynchronous>
				<RunSynchronousCommand wcm:action="add">
					<Order>1</Order>
					<Path>bcdedit /deletevalue {default} safeboot</Path>
				</RunSynchronousCommand>
			</RunSynchronous>
		</component>
	</settings>
</unattend>
```

これは`Windows PE`が起動直後（`Microsoft-Windows-Setup`）に、同期的にコマンドを叩く`RunSynchronous`というものです。  
先述の通り画面が壊れててコマンドプロンプトを開くことすら出来ないので、`USB`をぶっ刺し起動後にコマンドが勝手に叩かれるようにします。

`bcdedit /deletevalue {default} safeboot`ってコマンドが、本来画面が使える場合に`コマンドプロンプト`で打ち込むコマンドになります。  
ありがとう Reddit。  
https://www.reddit.com/r/techsupport/comments/444jal/

あとは保存してください。多分`UTF-8`でいいはず。

## Surface をシャットダウンし、USB を差し、音量ダウンボタンを押しながら起動
これは`Surface`だから使える技だと思う。`USB`からの起動に`BIOS / UEFI`の変更が必要な場合は画面が壊れてるので多分無理な気がする。

頑張ってシャットダウンします。相変わらず画面が使えないので切れているのかも分からないという。`USB`に扇風機か何か刺して電源が供給されているか見ればいいのか？  
次に`USB`を差し、最後に音量ダウンを押しながら電源ボタンを押します。  

音量ダウンを押しながら起動するとどうやら`USB`から起動になるそうで、`USB`メモリのアクセスランプが激しく光りだします。  
相変わらず画面が壊れてるので`Windows PE`が起動したのかもわからない、  
ドライバが当たってないからか`HDMI 外部出力`も動かずキーボードもいつも光ってるインジケーターが光ってなくガチで不安になる。

## 復活した
流石に`Windows PE`が起動しただろうと思い強制シャットダウンをしてみる。その後`USB`を抜いて`HDMI`を繋ぎ起動したら外部出力が動いた！！！  
`msconfig`戻せた。。。。

相変わらず`Surface`の画面は壊れたままです

# 試してないこと
これらは試してないです

- 放電
    - ダイソーのUSBランプを繋いでたけど、終わったかな？って電源ボタン押したらまた光って。を何回も繰り返しやらされてやめた。
- `Windows インストールメディア`ではなく`Surface リカバリイメージ`を`USB`にいれる
    - これだとドライバが付いてくるらしい？
    - でもドライバがインストールされるのがどのタイミングになるかが分からず、`HDMI 画面出力`に頼る必要がある場合はだめかも。
- `boot.win`に`GPU ドライバー`を埋め込む
    - これだと起動時にドライバが当たる・・・？

# おわりに
代替機を探さないといけないのでこの辺でお開きにします。お疲れさまでした