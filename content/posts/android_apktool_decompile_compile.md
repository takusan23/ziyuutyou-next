---
title: Apktool を使ってアプリを解体して組み立てる
created_at: 2025-06-27
tags:
- Android
- Apktool
---
どうもこんばんわ。  
`adb`コマンドでアプリインストールするの、面倒ですよね。特に複数端末が接続されている時。  

`Android Studio`が使える場合のみですが、  
物理端末の画面ミラーリング画面へ`apk`を投げ込むとインストール出来ます、

![step1](https://oekakityou.negitoro.dev/original/12575c3b-438d-4f12-a6fc-0df7f1990ab1.png)

![step2](https://oekakityou.negitoro.dev/original/75124d9b-befd-4c9f-b21e-4a52a67eff1e.png)

![step3](https://oekakityou.negitoro.dev/original/7356bb11-7dbb-4110-ba26-15b557d7b223.png)

# 本題
アプリを作り直せる`Apktool`を使いました。動いた！  
老舗ツールですが、今でも動いて感動。

というわけで、今回は自分用に`Apktool`で、`APK`を解体・組み立てまでの流れを残しておこうと思います。

これは、アプリ（`APK`）を解体して中身を書き換えて、もう一度**APK**に組み立て直すツール。  
逆コンパイルだけでなく、そこから`APK`をもう一度作ることが出来る。

リソースは容易に書き換えできて、  
`AndroidManifest`から怪しい権限を消したり、`strings.xml`を自分の言語にローカライズしたり、して、その後`APK`を作る。とか。

`Java`のコードは`Smali`になっているので、すごい微調整とかならすぐ出来るかもですが、  
大きい変更は厳しそう雰囲気。。

難読化等されてると厳しいらしい。

# 環境

| なまえ   | あたい         |
|----------|----------------|
| ぱそこん | Windows 10 Pro |

# ひつようなもの
- `Android Studio`
    - まじで`APK`直すだけで、`Android`開発一ミリも興味ないから入れたくない
        - って場合は、`WSL2`とかにインストールすれば良いはずです
        - 削除するのも面倒だし分からなくもない
    - ちなみに`Android Studio`が必要というかは
        - `adb`、`apksigner`コマンドを叩きたいからで、別に開発するわけではない
- `Java`
    - `Android Studio`を入れると付いてきますが、`JAVA_HOME`がなんとかとか言われたら...
    - `Android Studio`を入れたときに入ってくる`jbr`のパスを環境変数にすれば良いはず
- テキストエディタ
    - `VSCode`など、メモ帳で頑張っても良いはず？
        - 上手く行かなかったら`VSCode`でも

# ながれ

- `APK`ファイルを取り出す
- `Apktool`に渡して解体
- 中身を書き換える
- `Apktool`で組み立て`APK`の作成
- 署名する
- `adb install`でインストール

## 犠牲になる？アプリ
`NewRadioSupporter`。  
自分のだから大丈夫だし、そもそも自己満足のためだから誰にも言われんやろ...

## 必要なものを揃える
`Apktool`はここから。  
`.bat`ファイルは今回使わず、`java`コマンドを毎回叩くことにします（なぜ...）  
ダウンロードしたら、適当に新しいフォルダを作ってそこに入れてください。  
https://apktool.org/docs/install

`Android Studio`も使います。  
先述の通り必要なのは一緒についてくる`adb`とかなので、起動することはないです、、、  
とりあえずインストールを進めてください  
https://developer.android.com/studio?hl=ja

あと`Java`が必要ですが、`Android Studio`入れていれば付いてくるはずなので。  
`JAVA_HOME`の環境変数の設定だけやっておいて１！！

## APK を取り出す
`adb`コマンドで取り出す方法もあると思いますが、ファイルマネージャーによっては`APK`を取り出す機能があるので今回はそれを使います。

![apk](https://oekakityou.negitoro.dev/resize/04e2ae35-6948-4d43-b2ec-a947ac4e0389.png)

これをパソコンに転送～  
`apktool`のところに置きました。名前も短くしておくと、ターミナル操作が楽かも？

![explorer](https://oekakityou.negitoro.dev/original/dd52e3bc-8c8a-4c37-aa92-5d551a4b79f4.png)

## apktool を使って解体
`.bat`を経由しないので、`java`から書いていきます。  
以下のコマンドを叩くと、`APK`が解体されフォルダに中身が展開されます。

```shell
java -jar .\apktool_2.11.1.jar d {APKのパス}
```

![terminal](https://oekakityou.negitoro.dev/original/fc6cbfc0-475c-4f5c-8b62-1bc123a5ffea.png)

## 別のアプリとしてインストールする
`Android`アプリは`applicationId (packageName)`で識別しています。  
同じ名前のアプリでも、`applicationId`が違えば別のアプリです。

既に`applicationId`のが同じアプリがインストールされている場合、アプリの更新としてインストールされます。  
そのさい、アップデートの提供元が本物の開発者かどうか判断のため、署名を確認します。  
この署名は、開発元しか持っていないため、別人が同じ`applicationId`で更新することは出来ません。

なので、`applicationId`を変更して別アプリとしてインストールするか、本家のアプリを削除するか。の2択です。  
今回は前者の`applicationId`を変えて、もう一個同じアプリを入れることにします。

本家のアプリを消す場合はこの手順はスキップできます。  
あと、よく分からないという場合も、本家を削除してスキップしたほうが良いかなと思います。

アプリが展開されたフォルダを開いて、`AndroidManifest,xml`を、`VSCode`か何かで開きます。  

![vscode](https://oekakityou.negitoro.dev/original/d3fa5439-84fc-46ca-8747-5618cd101097.png)

そしたら`package`属性を探してください。  
この行のことです。2行目とかにあるはずです。

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android" android:compileSdkVersion="36" android:compileSdkVersionCodename="16" package="io.github.takusan23.newradiosupporter" platformBuildVersionCode="36" platformBuildVersionName="16">
```

この`package="io.github.takusan23.newradiosupporter"`を、なにか被らない（ユニークな）別の文字にする必要があります。  
適当に後ろに`.original`とかつけておきますか。

```plaintext
package="io.github.takusan23.newradiosupporter.original"
```

### 他の箇所
同様に、変更する必要がある箇所一覧です

#### (あれば) <permission>
この２つの、`android:name`属性を`applicationId`の時のように被らないよう書き換えてください。  
そして同じ値にする必要があります。

```xml
<permission android:name="io.github.takusan23.newradiosupporter.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION" android:protectionLevel="signature"/>
<uses-permission android:name="io.github.takusan23.newradiosupporter.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION"/>
```

↓

```xml
<permission android:name="io.github.takusan23.newradiosupporter.original.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION" android:protectionLevel="signature"/>
<uses-permission android:name="io.github.takusan23.newradiosupporter.original.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION"/>
```

### (あれば) <provider>
`ContentProvider`も一意である必要があります。  
`android:authorities`の値を、`applicationId`の時のように被らないよう書き換えてください。  

```xml
<provider android:authorities="io.github.takusan23.newradiosupporter.androidx-startup" android:exported="false" android:name="androidx.startup.InitializationProvider">
```

↓

```xml
<provider android:authorities="io.github.takusan23.newradiosupporter.original.androidx-startup" android:exported="false" android:name="androidx.startup.InitializationProvider">
```

## リソースを編集してみる
手始めに、ホーム画面に表示されるアプリの名前を書き換えてみましょう。  
同様に`AndroidManifest`を開きます

ホーム画面のアイコンを押したときに開く`Activity (画面)`の探し方ですが、  
`<intent-filter>`に`android.intent.category.LAUNCHER`があるものが、ランチャーアプリで表示される`Activity`になります。  
まあ、後はは`MainActivity`って名前の`Activity`なら十中八九それです。

見つけたら、`android:label`属性を探します。今回は`@string/app_name`でした。  
`@string/`で始まってますね！！！これは文字列リソースなので、`res`フォルダを開きます。

そしたら、`values-{言語コード}`のフォルダが見つかると思います、日本語なので`ja`ですね。それを開きます。  
最後、！`strings.xml`を開きます！！  
どうでしょう？見覚えある文字列、ありますか？

![見覚えある](https://oekakityou.negitoro.dev/original/018168d0-33d8-469a-b0c2-93751204005a.png)

ランチャーアプリに表示される名前は`@string/app_name`でした、ので、`name="app_name"`を探します。  
一番上でしたね。（非開発者向け：`Android Studio`が最初に作るのでそれはそう）

```xml
<string name="app_name">NewRadioSupporter</string>
```

これを書き換えてみます。5G チェッカーみたいな？

```xml
<string name="app_name">5Gチェッカー</string>
```

出来たら保存です！

## APK を組み立てる
`apktool`にあるフォルダに戻って、ターミナル（コマンドプロンプト等）を開き、今度は`b`オプション！

```shell
java -jar .\apktool_2.11.1.jar b {展開されたフォルダの名前}
```

![ビルド](https://oekakityou.negitoro.dev/original/935fdaba-fd24-434d-9d89-5586f6dad0de.png)

成功すると、展開されたフォルダの`dist`フォルダに`APK`があるはずです。

## alignment
https://github.com/iBotPeaches/Apktool/issues/1626#issuecomment-682488752

これがないとインストールに失敗するのでやります。  
`zipalign`コマンドですが、これは`Android Studio`をインストールすると付いてきます。  
パスはここ：`C:\Users\{ユーザー名}\AppData\Local\Android\Sdk\build-tools\{最新バージョン}\`

パスが分かったところで、以下のコマンドを叩きます。  
`APK`はさっき作ったやつ(`dist`)です。

```shell
{build-toolsのパス}\{最新バージョン}\zipalign.exe -p -f 4 {distにあるapkのパス} aligned.apk
```

`aligned.apk`が出来ていれば成功です！

![aligned](https://oekakityou.negitoro.dev/original/c162403b-1c82-4195-9803-1e631b5247e3.png)

## 署名
多分署名しないとインストール出来ません、  
署名には署名ファイルが必要です。自分のものを使う、自分で作る、また、もしかすると開発中（デバッグ用）の署名が使えるかもしれません。

もう持っている場合は署名コマンドまでスキップ。

## デバッグ用の署名ファイルを使う
すいません、今回は自分の署名ファイルを使うので、これが使えるかは見れていません。  
署名ファイルはホームディレクトリの`.android`フォルダの`debug.keystore`だと思います。

![デバッグ](https://oekakityou.negitoro.dev/original/f3fc2476-3c89-4017-9470-1ca9f94e2e43.png)

### 署名ファイルを用意
コマンドで作る場合は調べてみてください。  
`Android Studio`で作る場合、適当に何かしらプロジェクトを作ります。なんでも良いです。

![new project](https://oekakityou.negitoro.dev/original/52760864-2630-485f-883d-d3d51aa0261e.png)

そしたら、メニューバーから`Build`→`Generate Signed Bundle/APK`へ進み、

![menubar](https://oekakityou.negitoro.dev/original/a2a8650c-26c0-4bb2-ad77-98aeb413e064.png)

![apk](https://oekakityou.negitoro.dev/original/974de77d-3abb-4aeb-9005-f8a36764385a.png)

`APK`でも`AAB`でもどっちでも良いので次に進み、`Create new`を押します。これを埋めれば、`APK`に署名するための証明書が完成です。  
パスワードは署名コマンドを叩く際に聞かれるので覚えておいてください。

![sign](https://oekakityou.negitoro.dev/original/fa1faedf-2b2d-497e-893f-2cff0e67f795.png)

### APK に署名
署名ファイルが出来たら、以下のコマンドを叩きます。  
今回も`build-tools`にあるやつを使います。

```shell
{apksigner.bat のパス} sign --ks {署名ファイルのパス} --v2-signing-enabled true --ks-key-alias {key alias の値} --ks-pass pass:{key store pass の値} {aligned した APK のパス}
```

## インストール
ここまで出来ると`aligned.apk`がインストールできるはずです。  
以下のコマンドでインストール！！

![install](https://oekakityou.negitoro.dev/original/cabb3e75-0c25-4c46-b608-b3d2d02f01b9.png)

端末に`APK`を転送して、ファイルマネージャーで入れようとするとなんか失敗する時があったので、  
`adb`が確実かも？

## 名前変わってる！！！
数字だと一番上で草

![りねーむ](https://oekakityou.negitoro.dev/original/0b1af1c6-0593-4840-93c3-bdf17f057c17.png)

# Java のコードも編集したい
`Smali`と戦うか、、、  
値を書き換えるくらいなら、その値で検索をかければいいので、今回はこれを試します。

## 探す
例えば、こんな感じに文字列リテラルの中の`URL`を書き換えてみようと思います。

```kotlin
/** プライバシーポリシーを開く */
private fun openPrivacyPolicy(context: Context) {
    val url = "https://takusan.negitoro.dev/pages/new_radio_supporter_privacy_policy/".toUri()
    context.startActivity(Intent(Intent.ACTION_VIEW, url))
}
```

そもそもこの関数をどうやって見つけるんだって話ですが、  
`GUI`の`APK`逆コンパイル+ソース閲覧ツール`jadx`を使っています。

https://github.com/skylot/jadx

このアプリで、それっぽい処理を探し、（今回の例では`URL`の文字列検索）  
クラス、関数を探します。

![jadx](https://oekakityou.negitoro.dev/original/99fca9cd-de5c-4ad7-9c40-87e004d44aaa.png)

## 該当の Smali ファイル
クラス名と同じ名前で`Smali`ファイルがあるはずです。  
`smali`で始まるフォルダを探してみてください。

`Java`のパッケージと同じやつが見つかるはずなんですよね。  
![package](https://oekakityou.negitoro.dev/original/e840aef8-611b-49b7-80aa-7a666fe1adce.png)

それっぽいファイルを見つけたら、同様に`VSCode`何かで開いて、探します。  
関数の中で使ってる関数とかで検索をかけていく

## 書き換えてみる
対応する処理はここでした。  
文字列リテラルがあると探すの楽でいいですね。

```plaintext
.method private static final openPrivacyPolicy(Landroid/content/Context;)V
    .locals 3

    .line 67
    const-string v0, "https://takusan.negitoro.dev/pages/new_radio_supporter_privacy_policy/"

    .line 168
    invoke-static {v0}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;

    move-result-object v0

    .line 68
    new-instance v1, Landroid/content/Intent;

    const-string v2, "android.intent.action.VIEW"

    invoke-direct {v1, v2, v0}, Landroid/content/Intent;-><init>(Ljava/lang/String;Landroid/net/Uri;)V

    invoke-virtual {p0, v1}, Landroid/content/Context;->startActivity(Landroid/content/Intent;)V

    return-void
.end method
```

この`"https://github.com/takusan23/NewRadioSupporter"`を書き換えて、`Apktool`で`APK`を作り、実際に`URL`が書き換わっているか見てみます。  
適当にこのブログのトップページに飛ばすようにしてみた。

```plaintext
const-string v0, "https://takusan.negitoro.dev/"
```

あとはこれでもう一回`Apktool`で`APK`を作り、`alignment`、`署名`、`インストール`の手順で良いはずです。

# 事件簿
## INSTALL_FAILED_DUPLICATE_PERMISSION: Package ... attempting to redeclare permission ...DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION already owned by ...
`androidx.appcompat`ライブラリ（？）が勝手に`DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`権限を作って自分に付与している、  
同じ名前で権限を作ると怒られるので、名前変更。  
[別のアプリとしてインストールする](#別のアプリとしてインストールする) の項目読んでください。

## Failure [INSTALL_FAILED_CONFLICTING_PROVIDER: Scanning Failed.: Can't install because provider name ...androidx-startup (in package ...) is already used by ...]
これも同じ名前問題です。  
[別のアプリとしてインストールする](#別のアプリとしてインストールする) の項目読んでください。

## Failure [INSTALL_PARSE_FAILED_NO_CERTIFICATES: Failed to collect certificates from tmp/base.apk: Attempt to get length of null array]
署名してない。署名してからインストールです。  
[署名](#署名) の項目読んでください。

## [INSTALL_FAILED_INVALID_APK: Failed to extract native libraries, res=-2]
この次と同じ

## -124: Failed parse during installPackageLI: Targeting R+ (version 30 and above) requires the resources.arsc of installed APKs to be stored uncompressed and aligned on a 4-byte boundary
[alignment](#alignment) の項目読んでください；；  

## [INSTALL_PARSE_FAILED_NO_CERTIFICATES: Scanning Failed.: No signature found in package of version 2 or newer for package ...]
jarsinger ではなく apksinger を使ってください。  
詳しくは [署名](#署名) の項目読んでください。

おわり。  
お疲れ様でした 88888