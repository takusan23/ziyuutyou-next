---
title: NewRadioSupporter でキャリアアグリゲーションを表示する実験
created_at: 2025-05-06
tags:
- Android
- 5G
- NewRadioSupporter
---
どうもこんにちは、  
モックし忘れたテストコードを`GitHub Actions`で動かした結果、固まって**4時間**動いてたので流石に止めました。いつもは数分。

![Imgur](https://imgur.com/2dkqWbv.png)

あぶね～従量課金だったら泣いてた。

# 本題
`4G/5G キャリアアグリゲーション`と`EN-DC アンカーバンド`情報を表示するアプリをオープンテスト版に公開しています、  
期待通りに動けばこうなります。

![Imgur](https://imgur.com/6Nc2sk9.png)

![Imgur](https://imgur.com/ddjopBn.png)

![Imgur](https://imgur.com/bfYMZek.png)

![Imgur](https://imgur.com/UsqWee4.png)

`年末 2023 まとめの記事`で一瞬触れたあれです。  
この時点で既にキャリアアグリゲーションに関連する`API`を突き止めていて、、、ただこれは維持するのが厳しいなあって、代替案を探していた頃です。  
オープンテスト版があるってことはギリギリ許容できる代替案があったという事ですね（自分で言うのか・・・）

# ダウンロードと使い方
https://play.google.com/store/apps/details?id=io.github.takusan23.newradiosupporter

`NewRadioSupporter`のオープンテスト版のをダウンロードしてみてください。  
多分一部の端末でしか動かないのでとりあえずはオープンテスト版として公開しました。誰でも参加できるはずです。

が、が、が  
**端末によっては動きません。し、動いた所で正しい情報が表示されているかも怪しいです。**  
割に合わないと思います。`転用5G / sub6 / mmWave`の判定や`NSA/SA`の判定ができれば良い場合は何もしなくて良いと思います。

オープンテスト版をインストールしたら、パソコンを用意して`ADB`コマンドを利用できる環境を揃えてください。  
これは、普通のサードパーティアプリでは`4G/5G キャリアアグリゲーション`情報にはアクセス出来ないため、特殊な権限を利用します。  
これには`ADB`コマンドを入力しないと付与できないためです（普通にダイアログで許可するとかではない）。。

これが打ち込むべきコマンドです。  
`NewRadioSupporter`（アプリケーションID）へ、`READ_LOGS`権限を付与（`grant`）しろ。というコマンドになります。

```shell
adb shell pm grant io.github.takusan23.newradiosupporter android.permission.READ_LOGS
```

コマンドを入力した後、アプリを起動すると、「デバイスログへのアクセスを許可しますか？」と聞かれるので「一回限りのアクセスを許可」を選んでください。  
これで、**冒頭の通り**、端末が対応していれば表示されるかもしれません。

`ADB コマンド`を実行できる環境がない場合は、  
`MuntashirAkon/AppManager`のアプリ（`ADB モード`か`ワイヤレスデバッグ`）や、  
`aShell You`（`Shizuku`）を使えばパソコンなしでも権限を付与できるかもしれません。

![Imgur](https://imgur.com/ub4lDy8.png)

![Imgur](https://imgur.com/VnFrJc2.png)

# 長年の夢？
どうやら`5G`でもキャリアアグリゲーション出来るらしい。複数の`5G`のバンドに接続するとかそういう話らしい？  
`cellmapper`の`subreddit`とかを見ている限り確かに、`n257`が複数見えてるスクショがある。

どうにか`root 無し`環境下で見れないか調べていたところ、  
`*#*#4636#*#*`した時の画面の`物理チャンネル構成`に表示されている情報が、`4G/5G キャリアアグリゲーション`情報っぽいところまで突き止めました。

他にも関連しそうな`API`があるのですが、  
信頼度がなかったり（`CellInfo#getCellConnectionStatus`）（これを正しく実装してない会社あり）、  
欲しい情報がなかったりで（`ServiceState#getBandwidths`）（帯域幅でバンドが取れない）

# 物理チャンネル構成もサードパーティアプリは取得できない
ちなみに今のオープンテスト版ではこれを無理やり取得してます。  
だからよくわからない`ADB コマンド`を叩く必要があったのです。

物理チャンネル構成の表示に使われているのが、`PhysicalChannelConfig API`ですが、これは正攻法では取得できません。  
なぜなら**プリインストールアプリ限定権限**で保護されているからです。サードパーティアプリでは利用できません。  
ただ`API`が隠されているだけならまだしも、権限で保護されてると厳しいです。

# サードパーティでも取得する2つのルート
サードパーティでも取得できる手段、探した限り2つありそう。  
**ただ、どっちも険しい道。** 代替案があるだけマシ、、、

## ログを傍聴して取得する
`PhysicalChannelConfig`、どうにか抜け道がないか`Code Search`で`AOSP`を読んでいたところ、取得したら`Logcat`に**流している（出力している）ことを見つけました。**  
普通の`Logcat`ではなく、無線に関係する`logcat -b radio`の方です！！

https://cs.android.com/android/platform/superproject/main/+/main:frameworks/opt/telephony/src/java/com/android/internal/telephony/NetworkTypeController.java;drc=0a5870fa06c7144c950ec906f5b4acfc6f2ff165;l=1452

`Logcat`に流してるから何だよという話ですが、  
**Logcat**を読み取る権限は**サードパーティアプリでも ADB コマンドを使えば付与することが出来ます。**  
これです。

```xml
<uses-permission android:name="android.permission.READ_LOGS" />
```

冒頭のような`ADB コマンド`を叩けば、サードパーティアプリでも`Logcat`を取得することが出来るので、  
`PhysicalChannelConfig`の結果が流れてくるのを待ち受けることが出来るようになったわけです。

今のオープンテスト版ではこれを採用しています。メリットとしては。

- 使う側
    - `ADB コマンド`を一度打ち込めば良い
- 開発側
    - 標準ライブラリだけで作れる
        - `logcat`読み出すのは`exec()`すればいい

デメリットとしては

- 使う側
    - 毎回ダイアログを許可しないといけない
        - サードパーティアプリの宿命
- 開発側
    - 正規表現でログから取り出す必要がある
        - `AI`に聞けばなんとかなる
    - ログから消えたら詰む

## Shizuku を使う
- https://shizuku.rikka.app/
- https://github.com/RikkaApps/Shizuku

`Shizuku`という**一部のプリインストールアプリ権限で保護されている API を代わりに叩いてくれる**アプリがあります。  
どういうことかというと、`adb`コマンドって結構いろんな事が出来るわけですが。

有名どころではプリインストールアプリの無効化なんてサードパーティでは出来ませんが、`adb`コマンドを叩けば出来ます。  
冒頭で話した特殊な権限の有効化だって`adb`なら出来る場合があります。  

`Shizuku`はこの`adb`にある強力な権限をアプリ開発者にもたらしてくれました。  
どういう事かというと、`adb`が代わりに`API`を叩いてくれます。先述の通り`adb`コマンドには強力な権限があるため、  
プリインストールアプリ限定の`API`をサードパーティアプリから(`adb`を経由することで)叩くことが出来ます。

ちなみに`adb`に付与されている権限はこれです。  
https://cs.android.com/android/platform/superproject/+/master:frameworks/base/packages/Shell/AndroidManifest.xml

`android/data`だって`Shizuku`を経由すれば見ることが出来るし、  
中華スマホとかを追いかけている方ならワンちゃん知ってるかもですが、`root 無し`で`VoLTE`有効化するアプリも、この`Shizuku`を使っています。
（というかサードパーティじゃそんな事できんやろって思って見てたら`Shizuku`知った）

`Shizuku`を使って`PhysicalChannelConfig`を取得してみるアプリも試しに作ったり（ソースコードからビルドする必要がありますが）  
https://github.com/takusan23/ThirdpartyPhysicalChannelConfig

このメリットですが、

- 使う側
    - 毎回ダイアログが出ない（ログを見ているわけじゃないので）
- 開発側
    - 正規表現で文字列を処理しなくて済む

デメリットとしては

- 使う側
    - 端末を再起動すると`Shizuku`を再度有効化しないといけない
        - 仕方ない
        - Wi-Fi かパソコンのどっちかが必要で、電波測定は屋外で使うはず。
        - 外出た後に有効化し損ねたらかなしい
- 開発側
    - 後述

ただ、開発的に前者のほうが良いかなあって、（**プリインストールアプリ API を叩けるのに文句を言うなという話ではあるのですが**）  

まずは`AOSP`と同じように`API`を叩く必要があります。`AOSP`のコードを読む必要があるということです。  
https://github.com/RikkaApps/Shizuku-API の`README`にもありますが、  
`getSystemService()`で取得した`Manager`にある関数呼び出しを`Shizuku`経由にしたい場合、その関数の中身のコードを読んで、`Shizuku`を使うように作る必要があります。

`Shizuku`を経由した`Android API`呼び出しはこんな感じになります。  
これらは`電波関連の API`ですが、本来であれば`TelephonyManager`が内部でよしなにやってくます。  
が、呼び出しを`Shizuku`経由にするため、`TelephonyManager`が代わりにやってくれた処理を、`AOSP`を元に読み進める必要があります。`README`の通りですね。  
狙いの関数の中身を読んで、`Service`を呼び出している部分を`Shizuku`のものに差し替える。

本来は内部でよしなにやってくれるので、このコードは`隠し API`扱いです。よって`Android Studio`からは見つけることが出来ません。  
これが次の理由になります。

```kotlin
val telephony: ITelephony
    get() = ITelephony.Stub.asInterface(
        ShizukuBinderWrapper(ServiceManager.getService("phone"))
    )

val telephonyRegistry: ITelephonyRegistry
    get() = ITelephonyRegistry.Stub.asInterface(
        ShizukuBinderWrapper(ServiceManager.getService("telephony.registry"))
    )

val subscription: ISub
    get() = ISub.Stub.asInterface(
        ShizukuBinderWrapper(ServiceManager.getService("isub"))
    )
```

---

次に、`Android Studio`からダウンロードする`android.jar`（`Android SDK`）は、隠し`API`が削除された状態になっています。  
が、`Shizuku`を利用して`隠し API`を叩きたいので、`隠し API`が残っている`android.jar`に差し替える必要があります。  
もしテストを、`GitHub Actions`とかでやっている場合は、`CI/CD 環境`の`android.jar`も差し替える必要があり、とても大変。

優しいことに既にビルド済みの`android.jar`があるので、それに差し替えることで、`隠し API`も`Android Studio`のコード補完に表示されるようになります。  
https://github.com/Reginer/aosp-android-jar

---

最後、いくつかライブラリを入れる必要があります。  
`隠し API`を叩くためのライブラリと、`Shizuku API`ですね、これは特に言うこと無いです、文字通りです。  

`Android`は`一部の隠し API`をリフレクションを使って叩こうとしても、**メソッドが存在しない例外をスロー**するように対策されてしまいました。  
確かに`AOSP`には**存在する**のに、実行すると落ちてしまう。  

この制限はライブラリを入れることで、回避することが出来ます。  
https://github.com/LSPosed/AndroidHiddenApiBypass

### それはそれとして
`Shizuku`は手間を掛けてもなお**プリインストールアプリ権限が必要な API を叩くことが出来る**ので、やる価値はバッチリあります。夢がある話です。  

だってこの辺面白そうじゃん、  
https://github.com/timschneeb/awesome-shizuku

いつか`Shizuku`を使ってアプリを作りたいですね。その時は記事にでも！

# ログから取り出している部分
`experimental`ブランチのこの辺、オープンテスト版なんで特にテストとかは書いてないです。  
https://github.com/takusan23/NewRadioSupporter/blob/experimental/app/src/main/java/io/github/takusan23/newradiosupporter/tool/LogcatPhysicalChannelConfig.kt

# おわりに
`UI`も少し変わってます。  
`eSIM / 物理 SIM`どっちなのか、が取得できるので表示できるようにしてみました。

これが採用版の下書き、`Material 3`というか、リストの頭とおしりは角が丸くて、  
リストの間というかセパレーターの角は控えめな丸にするやつ、やってみたかった。

![Imgur](https://imgur.com/NsULxVJ.png)

あ、没 Figma デザイン案、置いておきます

![Imgur](https://imgur.com/MUFHDxH.png)
# おわりに2
なんでオープンテスト版から始めたかというと、`READ_LOGS`権限をいきなり投入したら、`GooglePlay`になにか言われるんじゃないかとか、怪しまれそうとか、で、  
（全然動かない等で）不評ならさっさと撤退しようと思って。

![Imgur](https://imgur.com/9MVKiGf.png)

手持ちの端末でも`Google Pixel`ぐらいしか動いてなさそう雰囲気、、、

# おわりに3
- `Sub6-CA`
- `NR-DC`

これなにが違うの...  
`NSA/SA`の違いってこと？

# おわりに4
ちなみに`PhysicalChannelConfig API`をサードパーティアプリに開放してくれって`Issue Tracker`に投げてみましたがダメでした。  
ん～～～どうにかしてほしいなあ

年に1度（2回になるけど）の`Android`アップデートの`API 差分`を、ダメ元で開放されてないか更新の度に見る生活を続けますかね。