---
title: Android でスプラッシュスクリーンのアイコンを動かす
created_at: 2024-07-28
tags:
- Android
- Kotlin
- SVG
---
どうもこんにちは。  
花鐘カナデ＊グラム Chapter:2 花ノ香澄玲 攻略しました。（前作やってないので本筋あんまり分かってないけど）とにかくかわいかったです！

![Imgur](https://imgur.com/oIcv8qt.png)

ハイスペックでいい子すぎる

![Imgur](https://imgur.com/BzYSRno.png)

↑ ここのシナリオすき、表情がころころ変わるのがいい

![Imgur](https://imgur.com/L4YIfSg.png)

そういえば最後の最後にあったあの意味深な文章は何だったんだろう、  
3と4で回収するのかな（本筋もあんまり進まずに Chapter:2 終わってしまった）、、  

![Imgur](https://imgur.com/CjbezIq.png)

# 本題
Android 12 で入ったこのスプラッシュスクリーン、アニメーション付きのアイコンが使えるのですが、  
なぜかそのスプラッシュスクリーンで使える`アニメーション付きアイコン`の作り方が乗ってないので書きます。  

こんなの、等倍速  
<video src="https://github.com/user-attachments/assets/8d3cb367-6949-4810-b9bd-7a31754f8403" width="500" controls></video>

等倍速だと速すぎるので`0.5 倍速`（これでもまだ速い気が）  
<video src="https://github.com/user-attachments/assets/dd76ff1c-0857-41b3-8397-572f6276b648" width="500" controls></video>

`AnimatedVectorDrawable`を作る`Webアプリ`を使うだけなのですが。。  
結局この`Animated vector drawable`、どうやって作るのが正攻法なのかがわからない、、、多分この方法は効率が悪い気がする、、、

個人的にはスプラッシュスクリーンアンチなのですが（アニメーションするくらいなら早く開けよお気持ち）、  
`Android 12`から強制的にスプラッシュスクリーン付いてくるので、まあやるならアニメーションさせるか。って。

# スプラッシュスクリーンで使うアイコンの作り方 公式
https://developer.android.com/develop/ui/views/launch/splash-screen#dimensions

# おことわり
多分この方法はとても非効率です。  
おそらくどこか省略できる点があるはず。

# 環境
| なまえ        | あたい                                 |
|---------------|----------------------------------------|
| PC            | `Windows 10 Pro`                       |
| `Inkscape`    | `Inkscape 1.1.1`（最新版でいいはず）   |
| `LibreOffice` | `Version: 7.0.4.2`（最新版でいいはず） |
| 言語          | `Kotlin`（多分`Java`も行ける）         |

## 必要なソフトをダウンロード
なぜか`Inkscape`と`LibreOffice Draw`が必要です。ほんとうはどっちかで`SVG`を書けばいいはずなのですが、`Inkscape`の`svg`、`Android Studio`に入れて`Drawable`にしてもなんかうまくいかないんですよね。  
しかし、`Inkscape`で保存した`svg`を`LibreOffice Draw`に入れて、別名保存したものを`Android Studio`に入れるとちゃんと反映される。何故か私の環境だと一回`LibreOffice Draw`を経由しないといけない。

なんでかな、バージョン古いからかな。

## アイコンを描く
`Inkscape`でも`LibreOffice Draw`でも何でもいいので`SVG`を書くアプリを開いてください。  
まず`SVG（Drawable）`のサイズなのですが、私もよく知らない。ので私が作ってるときに使ってるサイズを貼っておくとこれです。正方形なので、縦横同じです。

|                  |                  |
|------------------|------------------|
| Inkscape         | `8.73000 mm`     |
| LibreOffice Draw | `0.90 cm`        |
| `<svg>` の属性   | `width="8.73mm"` |

`Inkscape`だと`ドキュメントのプロパティ`からサイズを変更できます。これ  
![Imgur](https://imgur.com/0SnjT5n.png)

次にアイコンのサイズです、`SVG（Drawable）`のサイズと何が違うんだって話ですが、アイコン全体が表示されるわけではなく、真ん中を円形にくり抜いた分だけが表示されます。以下のドキュメントの画像がわかりやすいです。

https://developer.android.com/develop/ui/views/launch/splash-screen?#dimensions

アイコンを大きく書くと見切れてしまうし、小さすぎるとなんだか分からない。くり抜かれる範囲がどこか知りたいですよね、見切れちゃうと嫌ですからね。  
というわけで試してみました。以下調査結果です。以下の四角形の範囲に収まれば（線踏むのは四隅じゃなければOK）大丈夫そうです。  

数値でいうと、`Inkscape`の場合は縦横`2.115 mm ～ 6.615 mm`の範囲内にアイコンを書けば、丸く切り抜かれても見切れたりしないはずです。

![Imgur](https://imgur.com/0jZc9BG.png)

実際に四角形を置いてみるとこう  
![Imgur](https://imgur.com/XCxpSD1.png)

上記のように、わかりやすく四角形を置きたい場合、`Inkscape`の場合は縦横`4.500 mm`の四角形を作って、それをページの真ん中に置くことで、その四角形の中なら見切れない、境界線代わりになります。  
`LibreOffice Draw`でやりたい場合は`0.45 cm`の四角形を真ん中に置くと同様にできます。

![Imgur](https://imgur.com/RTIW3iF.png)

この四角形の中にアイコンを書いていきましょう。

## 書いた
あらかじめ時間によって表示したい（出し分けたい）図形は`SVG`上に存在させておく必要があります。多分。  
いや、`SVG`のパスの変形が出来るっぽいんだけど難しそうで使ったことがない。

![Imgur](https://imgur.com/awjbF1q.png)

保存する際は補助線としていた四角い図形を消しましょうね（まあこの後でも消せるけどここで消しちゃうで良い気がする）。

## LibreOffice を経由する
`Inkscape`で書いた`SVG`を保存したら、今度は`LibreOffice Draw`で開きます。  
で、開いたら何もせずエクスポートを選び、`SVG`として保存します。一応別名保存のがいいでしょう。

![Imgur](https://imgur.com/pGXjx7c.png)

なぜかこの`LibreOffice Draw`でエクスポートする工程をスキップするとうまく`VectorDrawable`に変換できません、、、

![Imgur](https://imgur.com/0YOGBT2.png)

また、このとき作った`SVG`、`Android 11`以下はスプラッシュスクリーンに`AnimatedVectorDrawable`が使えないので代わりにこれを使います。

## AnimatedVectorDrawable を作る Web アプリ
こちらです。ありざいす！！！

https://shapeshifter.design/

開いたらさっき別名保存した`SVG`をインポートしましょう、ここです。ドラッグアンドドロップでもいいかもしれません。

![Imgur](https://imgur.com/siHECz5.png)

## とりあえず時間経過で表示させてみる
というか私はこれしか使ったこと無いです。  
適当な`path`を選んで、ストップウォッチのアイコンを押して、`strokeAlpha`を選びます。

![Imgur](https://imgur.com/UPmyBKc.png)

次に`fromValue`を`0`にしておきます。

![Imgur](https://imgur.com/P47yLW7.png)

これで再生ボタンを押すと、、、？  
時間経過で`fromt`から`to`に`alpha`が変化します！

![Imgur](https://imgur.com/qCLLL1q.png)

私が作ってきたスプラッシュスクリーンのアニメーションはこれの組み合わせがほとんどです、、

### アニメーションの時間
ドキュメントによるとスプラッシュスクリーンのアニメーション最大秒数は`1000ms`だそうですが、  
せいぜいスプラッシュスクリーンのアニメーションは`500ms`ぐらいだと思います。  

サーバー等の通信等でスプラッシュスクリーンを意図的に長く表示させる場合（ドキュメントにある`ViewTreeObserver.OnPreDrawListener`を使う方法）を除き、`500ms`ぐらいが限界な気がする。あんまり長いとアニメーションの終了より先に`Activity`が起動しちゃう。

![Imgur](https://imgur.com/z91nfSn.png)

また、これは`AnimatedVectorDrawable`の話ではなく、スプラッシュスクリーン都合の話だと思いますが、  
`0ms`から`200ms`の間にアニメーションで変化させても認知できないです。（`200ms`より前のアニメーションが何だったのか分からない）  
アニメーションさせる場合は`200ms`から`500ms`に収めると良い気がします。

![Imgur](https://imgur.com/UVNSXQz.png)

### アニメーションさせるまで消したい
線（`stroke`）の場合は`strokeAlpha`、塗りつぶし（`fill`）の場合は`fillAlpha`を`0`にしておくと、`strokeAlpha`のアニメーションまでは消しておくことが出来ます。

![Imgur](https://imgur.com/o2JkT2Q.png)

アニメーション経過後はそのままアニメーションで変化した状態のが適用されます（手元で試している限り）

### 移動させたい、回転させたい、サイズを変えたい
`translateX`のようなものはありませんね。  
これは`path`だからで、`group`を作り、その中に`path`を入れることで`translateX`や`rotate`が使えるようになります。

![Imgur](https://imgur.com/UPmyBKc.png)

というわけで`group`を作りますか、ここの`New group layer`です。

![Imgur](https://imgur.com/F1OBV2D.png)

動かしたい図形たちを`group`の中に入れて、、、

![Imgur](https://imgur.com/GzF8dQs.png)

あとはお好きなものを。  
移動させたいなら`translate`、回転なら`rotate`、サイズ変更なら`scale`です。

![Imgur](https://imgur.com/NzeUV4v.png)

### 保存する
`shapeshifter`の`webアプリ`で開けるように保存しましょう。  
ここの`Save`を押すと、`.shapeshifter`でプロジェクトを保存できます。これを他の人に渡せば、他の人が開いた`shapeshifter`で続きの作業ができるわけです。  
もし`F5`でリロードしたとしてもこのファイルで保存しておけば良いわけです。

![Imgur](https://imgur.com/tnXY7En.png)

## AnimatedVectorDrawable で吐き出す
それとは別にスプラッシュスクリーン用に`AnimatedVectorDrawable`が必要なので吐き出します。  
これです。

![Imgur](https://imgur.com/46CSvuk.png)

## スプラッシュスクリーンを表示する準備をする
`Android 12`未満向けに、サポートライブラリがあります。  
サポートライブラリ無しで直接`Android 12`以降で追加された`API`を叩いても良いのですが、古い端末では利用できないので入れます。入れることで`Android 6`から最新までが一回の実装だけで済みます。

と言ってもドキュメント通りにライブラリを入れるだけです、

https://developer.android.com/develop/ui/views/launch/splash-screen/migrate

### ライブラリをいれる
ついにデフォルトで`Gradle Version Catalog`になりましたね、  
単一モジュールでバージョンカタログ使ってもあれかと思ったのですが、マルチモジュールにしやすくするためかなって。

```kotlin
dependencies {
    implementation("androidx.core:core-splashscreen:1.0.1")
}
```

### drawable-v31 フォルダを作る
`drawable`にアニメーションアイコンを格納するのですが、先述の通りアニメーションアイコンは`Android 12（API 31）`以降だけで、それ以前には動かないアイコンを置く必要があります。  
バージョンによって分けるために`v31`を作った感じです。

![Imgur](https://imgur.com/b04LJC8.png)

後はそのフォルダに`drawble`を入れます。名前は合わせましょうね。

![Imgur](https://imgur.com/qOZBEfl.png)

### themes.xml を書く
スプラッシュスクリーン用のテーマを書きます。  
`Jetpack Compose`が主流の今、`styles`とか`themes`とか書かなくなったなあって。いい時代になりましたね。  
`View`時代の`Material Components ライブラリ`なんてテーマがすごく複雑で、一箇所変えたいだけなのに大変だった記憶が、、、あれ使いこなせた人いるのかな、調べてもわけわかめ。  
てか結局`styles.xml`と`themes.xml`の違いが分からなかった。

背景色（`windowSplashScreenBackground`）ですが、色を`colors.xml`に書いて`@color/`で参照するべきです。ダークモードに対応できないので。

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>

    <style name="Theme.KomaDroid" parent="android:Theme.Material.Light.NoActionBar" />

    <!-- スプラッシュスクリーン用テーマ -->
    <style name="Theme.App.Starting" parent="Theme.SplashScreen">
        <!-- 背景色 -->
        <item name="windowSplashScreenBackground">#4A5C92</item>
        <!-- アイコン -->
        <item name="windowSplashScreenAnimatedIcon">@drawable/komadroid_splash_icon</item>
        <!-- アニメーションの時間 -->
        <item name="windowSplashScreenAnimationDuration">500</item>
        <!-- スプラッシュスクリーンが終わった後のテーマ -->
        <item name="postSplashScreenTheme">@style/Theme.KomaDroid</item>
    </style>
</resources>
```

### AndroidManifest.xml を編集
最初に起動する`Activity`の`android:theme`を、`android:theme="@style/Theme.App.Starting"`になるように直します。

```xml
<activity
    android:name=".MainActivity"
    android:exported="true"
    android:label="@string/app_name"
    android:theme="@style/Theme.App.Starting"> 
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />

        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

### MainActivity を開く
最初に起動する`Activity`を開きます。たいてい`MainActivity`だとは思いますが。  
`installSplashScreen()`という`Kotlin`拡張関数があるので、それを呼び出します。`super.onCreate`よりも前に。拡張関数がない`Java`だと`SplashScreen.installSplashScreen`が使えるらしいです。

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen() // super.onCreate よりも先
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            KomaDroidTheme {
                MainScreen()
            }
        }
    }
}

```

# できた！！！
<video src="https://github.com/user-attachments/assets/46a3e4e9-19bb-4863-9c4b-894f647c19bb" width="300" controls></video>

# Q&A
## Android 12 でスプラッシュスクリーンが出ない
ホーム画面のアイコンを押さないと表示されません。それ以外のルートで起動したら出ません。  
（例：`Android Studio`の実行ボタン）

# おわりに
差分貼っておきます。

https://github.com/takusan23/KomaDroid/commit/97ce9aeb45631426bf99f5f884f7fa5f5d4c0eb5

また、今回使った`ShapeShifter`のファイルも置いておきます。  
https://github.com/takusan23/KomaDroid/blob/master/komadroid_splash_icon.shapeshifter

素材集  
https://github.com/takusan23/AndroidSplashScreenDesignTemplate

以上でつ、お疲れ様でした８８８８８