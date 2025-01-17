---
title: NewRadioSupporter にウィジェットを追加するため Glance を使ってみた
created_at: 2023-10-02
tags:
- Android
- Kotlin
- JetpackCompose
- Glance
---

どうもこんばんわ。  

スタディ§ステディ2 攻略しました、えちえちでした  

![Imgur](https://i.imgur.com/QAZ5pFC.png)

E-mote 搭載だから立ち絵がめっちゃ動く、  
本編関係ないけど UI もアニメーション頑張っててすごいと思った（こなみかん、大変そう

![Imgur](https://i.imgur.com/b5hbK9R.png)

![Imgur](https://i.imgur.com/5Mo4atS.png)

やえちゃん！！  
前作ヒロイン?とのやりとりがあったんですけどやえちゃんルートのが好み  
なまりかわいい

![Imgur](https://i.imgur.com/VqPDyZ2.png)


由乃ちゃんかわいいのでぜひ！！！

![Imgur](https://i.imgur.com/oTgUbyj.png)

![Imgur](https://i.imgur.com/yktGFri.png)

この目すき

![Imgur](https://i.imgur.com/lWfNy23.png)

![Imgur](https://i.imgur.com/Jb0694m.png)

イベントCG貼るわけには行かないけどヒロインも背景もめっちゃきれいでした、すごい  
過去の話とかちょろっと出てくるので由乃ちゃんルートは最後が良いかも？

# 本題
`NewRadioSupporter` にウィジェットを追加しました！お待たせしちゃいました  
ホーム画面からすぐ確認できます！！！

![Imgur](https://i.imgur.com/NswvS41.png)

大きいサイズも作りました、  
後述しますが`Jetpack Glance`が面倒なことを全部肩代りしてくれたので大きいサイズも難しくないです。

![Imgur](https://i.imgur.com/vpC9HXU.png)

（小さいアプリみたいで結構気に入ってる）

どうでもいいけどドコモの`n28`見つけた、わーい  

高いキャリア版買ってよかった（まぁミリ波アンテナほしかったし...）

で、今回はこの`NewRadioSupporter`でウィジェットを作るために使った`Jetpack Glance`のお話です。

# Android Jetpack Glance
https://developer.android.com/jetpack/compose/glance

`Jetpack Compose`な文法で、`Android`の`ホーム画面ウィジェット`が作れる。 
うーん`xml + RemoteViews`でウィジェットを作ったことがある身からすると現実味が無いんだけど、確かに動いているんですよね。  

```kotlin
class MyAppWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            Text("Hello World")
        }
    }
}
```

**なんで動いてるか分からんくて本当に魔法みたい**  
不思議でたまらないけど、、、もしこれなら難しすぎて地獄の`xml + RemoteViews`から開放されるってことでいい？

# Android のウィジェットは難しい
レビューに来てたし私も欲しかったんですけど、、、  
あ、この部分は読んでも読まなくてもどっちでもいいです。

## Android 2 とかから存在するのでメソッドが古いまんま
しばらく放置されていたイメージ、、あと後方互換のために下手に手を出せなかった可能性。  
古いから情報があるのかと思うとあんまり...。  
実際公式ドキュメントの日本語版はいつのスクリーンショットだよって言いたくなる、、はぁ
- https://developer.android.com/guide/topics/appwidgets?hl=ja
- https://developer.android.com/guide/topics/appwidgets/overview?hl=ja

（日本語版なんて見るなという話ではある

## RemoteViews で使える View のみ
決まった`View`しか使えない！  
https://developer.android.com/reference/android/widget/RemoteViews

`ConstraintLayout`も使えません。`RelativeLayout`とか今更やるくらいなら`LinearLayout`とか`FrameLayout`使ったほうが良さそう。  
あと、`xml`がベースなので、ちょっと凝った事するとめんどいです。角を丸くしたい場合は`カスタムDrawable`を作らないと行けない、`Jetpack Compose`だと一発なのにつらいね。

また、`findViewById`は使えない。じゃあどうやってテキストや画像をセットするんだって話ですが、  
`RemoteViews`にテキスト設定メソッド、画像設定メソッドがあるので、`xml`の`android:id`と値をそれぞれセットしていく形になります。  
https://developer.android.com/reference/android/widget/RemoteViews#setTextViewText(int,%20java.lang.CharSequence)

```kotlin
val views = RemoteViews(context.packageName, R.layout.music_control_widget).apply {
    setTextViewText(R.id.widget_title, "title")
    setTextViewText(R.id.widget_album, "album")
    setTextViewText(R.id.widget_artist, "artist")
}
```

`Visibility`変更や、`Drawable`セットなんかの基本的なやつはありますが、あんまり凝ったメソッドまではないので出来ない事もある。  
一応、リフレクションじみた事ができますが、、、これも万能ではないらしく、`LinearLayout`の`setOrientation`しようとしたら落ちた  
https://developer.android.com/develop/ui/views/appwidgets/enhance#use-runtime-mod-of-remoteviews

**あとつらいのがリスト系**。`Gmail`とか`Google Keep`とかのリストでアイテム増やしたりできるやつ。あれが難しい  
最近はドキュメントが充実してて良い感じなのですが、リストの各アイテムを押せるようにするためには、あらかじめメソッドを呼び出す必要があるとか、  
リストへデータを渡すためのクラス、なんかよくわからないやつを継承するんだけど、実装しないといけないメソッドが多く圧倒される。

- https://developer.android.com/develop/ui/views/appwidgets/collections#behavior
- https://developer.android.com/develop/ui/views/appwidgets/collections#implement-collections

## すぐ壊れる
レイアウトを変更させると？、**ウィジェットは利用できません**みたいな表示になって、置き直さないといけない  
アプリアイコン長押し→`ウィジェット`を押すとすぐ再設置できます（時短テク  

https://support.google.com/android/answer/9450271?hl=ja#zippy=%2Cウィジェットを追加するサイズ変更する

`Logcat`追ってったらクラッシュするようなコード書いてたうわーみたいな。

## ボタンを押したときの処理が難しい
ワナが多すぎる

前述の通り`findViewById`が使えないので、`setOnClickListener { }`なんてものは使えない。  
なので、あらかじめ`PendinIntent`という押した時に発行する`Intent`を設定しておきます。（すぐ使うわけじゃないので`Pending`な`Intent`）  
アプリの画面を開く`PendingIntent.getActivity`、サービスを起動する`PendingIntent.getService`、任意のコードを呼ぶためのコールバックを受け取る`PendinIntent.getBroadcast`など。

任意のコードを呼ぶためのコールバックを受け取るやつは`AppWidgetProvider#onReceive`に書く。すぐブロードキャストレシーバーが使える状態にはなってる。  
`PendingIntent`を作る際は、このクラス（以下の例だと`ExampleWidget`）に向けた`PendingIntent`を作ってセットすれば良い。
`context`がもらえるけど、`Activity`の`context`ではないのでダイアログは出せない。  
`Kotlin Coroutines の suspend 関数`を呼びだければ`goAsync()`メソッドを見てみてください。

```kotlin
class ExampleWidget : AppWidgetProvider() {

    /** ブロードキャスト受け取り */
    override fun onReceive(context: Context?, intent: Intent?) {
        // Intent に PendinIntent でセットした Intent があるはず
        // 押したら Toast を出すなど
        // ここでは Context#startActivity は使えないので、PendingIntent.getActivity を使う
    }

}
```

ぱっと見何も難しいことはないように見えるが、、、なんか**たまによく反応しない時**がたまによくあるんですよね。  
`PendingIntent`の引数に渡した`requestCode`が重複していると押しても`BroadcastReceiver`が反応しない・・・から重複しないようにすれば直るとか...  
**ウィジェットを再設置するとボタンが反応するようになる時がある...とか。**  
難しすぎる

書き出してみるとそんなに無いな...確かにしんどかった記憶はあるんだけど。

# Android Jetpack Glance
これらの問題が結構解決します！！

## Jetpack Compose の文法で書ける
`xml`で書く必要がないのでとても見やすい。やっぱレイアウトと行き来するのつらいよな。  
使えるコンポーネントは`androidx.glance`パッケージ傘下にある`Composable 関数`に限定される。最終的には`RemoteViews`に変換するため致し方ない。  
（なので、よって`Jetpack Compose`と`UIコンポーネント`を相互利用できるわけではない）

ただ、`UI`関係ない`Composable 関数`は使えちゃいます！  
`Flow#collectAsState`とか`LaunchedEffect { }`とか。なんで動くのか本当に不思議

そして何より嬉しいのが、**リスト系がめちゃめちゃ簡単**に作れるようになった  
`LazyColumn`が`Glance`でも動く。本当に感動。こんな楽していいのか？

## ウィジェットを少しの間動的にできる
どういうことかというと、`Jetpack Glance`は`Jetpack Compose`の文法で書かれた`UI`を`RemoteViews`に変換するために、`Composable 関数`を監視しておく必要があるわけで、  
その監視のための時間があるわけです。その間は動的なので、`remember { mutableStateOf() }`なんかも使えちゃうわけです。

```kotlin
class GlanceCountWidget : GlanceAppWidget() {

    override suspend fun provideGlance(
        context: Context,
        id: GlanceId
    ) = provideContent {

        // カウンター
        // TODO 再起動とかで値をロストするので、永続化が必要
        var counter by remember { mutableStateOf(0) }

        // テーマの設定
        GlanceTheme(colors = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) GlanceTheme.colors else colors) {
            
            // 横並び
            Row(
                modifier = GlanceModifier
                    .fillMaxSize()
                    .padding(5.dp)
                    .background(GlanceTheme.colors.secondaryContainer)
                    .cornerRadius(16.dp),
                horizontalAlignment = Alignment.Horizontal.CenterHorizontally,
                verticalAlignment = Alignment.Vertical.CenterVertically
            ) {

                Button(
                    modifier = GlanceModifier.size(50.dp),
                    text = "-1",
                    onClick = { counter-- }
                )

                Text(
                    modifier = GlanceModifier.defaultWeight(),
                    text = counter.toString(),
                    style = TextStyle(
                        fontSize = 20.sp,
                        textAlign = TextAlign.Center
                    )
                )

                Button(
                    modifier = GlanceModifier.size(50.dp),
                    text = "+1",
                    onClick = { counter++ }
                )

            }
        }
    }

    companion object {

        /** ウィジェットの色 */
        val colors = ColorProviders(
            light = LightColorScheme,
            dark = DarkColorScheme
        )

    }
}
```

完全なコード→ https://github.com/takusan23/GlanceCountWidget  
最新の Android Studio でビルドできるはずです。  

![Imgur](https://i.imgur.com/QuivkuX.png)

`Jetpack Glance`で`Flow#collectAsState`や`LaunchedEffect { }`が動くのは、この動的な間が存在するからなんですね。  
ちなみに、数十秒間の間しか動かないので、もし状態を保持しておきたい（上の例だとカウントを引き継ぎたい）場合は`SharedPreferences`や`DataStore`等の保存するためのシステムを用意する必要があります。  

詳しくは：https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:glance/glance-appwidget/integration-tests/demos/src/main/java/androidx/glance/appwidget/demos/ActionAppWidget.kt

## そこそこ新しい技術で動いている
`Jetpack Compose`から`RemoteViews`に変換する部分で`WorkManager`？が使われていたり、非同期処理に`Kotlin Coroutines`が使われています。神！！！

## Modifier
`Jetpack Glance`専用の`GlanceModifier`が用意されています。  
角を丸くする処理が`Jetpack Compose`と同じく一行で書けます。  

もう`カスタムDrawable`作らずに済みます・・・！

## 押したときの処理
これもめっちゃ簡略化されていて、なんと`GlanceModifier.clickable { }`を使うだけです。  
内部では`BroadcastReceiver`が動いているため、`Context#startActivity`が呼び出せない等の成約があるものの、`BroadcastReceiver#onReceive`にクリックイベントを書くより何倍も分かりやすい！！！  
もちろん`Activity`を開く方法もちゃんとあります。

# 実際に作ってみる！！
今回は写真を一覧表示するウィジェットでも作ってみましょう。  
ただ、それだと既にあると思うので、写真を押したらウィジェット内で表示するように（一覧表示から1つだけ）してみます。  
本当にミニアプリを目指していきます。

いや～～～これ`RemoteViews`でやろうとするとめっちゃだるいやろなぁ

<video src="https://user-images.githubusercontent.com/32033405/270123308-7dee0de2-5ab1-4621-9af0-33a9168d28dd.mp4" width="200" controls></video>

## 環境

こうしき https://developer.android.com/jetpack/compose/glance

| なまえ         | あたい                                  |
|----------------|-----------------------------------------|
| Android Studio | Android Studio Giraffe 2022.3.1 Patch 1 |
| 端末           | Xperia 1 V / Google Pixel 6 Pro         |
| targetSdk      | 34 (Android 14)                         |

## 適当にプロジェクトを作る
`Jetpack Compose`が入っているプロジェクトである必要があります。新規に作るなら`Empty Compose Project`？  
`Jetpack Compose`ない場合はまず入れるところからですね

`Empty Compose Project`で、後は適当に、  
`Android`最低バージョンは`6`が良いらしい（`Jetpack Glance`が`5`をサポートしてないとかなんとか）

![Imgur](https://i.imgur.com/qPEIStn.png)

`kts`を使うかはおまかせします、新規で作るなら`kts`で良いかも、今あるプロジェクトを書き換えてまではメリットなさそう。

## Jetpack Glance を入れる

`app`の中の`build.gradle.kts`（もしくは`build.gradle`）で、以下を足す  
`glance`と、画像読み込みライブラリの`Glide`です。

```kotlin

dependencies {

    // これら
    // For AppWidgets support
    implementation ("androidx.glance:glance-appwidget:1.0.0")
    // For interop APIs with Material 3
    implementation ("androidx.glance:glance-material3:1.0.0")
    // 画像読み込みライブラリ
    implementation("com.github.bumptech.glide:glide:4.16.0")

    // 以下省略...


```

あとは、`targetSdk`を`34`にします。

```kotlin
android {
    namespace = "io.github.takusan23.touchphotowidget"
    compileSdk = 34 // ここ

    defaultConfig {
        applicationId = "io.github.takusan23.touchphotowidget"
        minSdk = 23
        targetSdk = 34 // ここ
        versionCode = 1
        versionName = "1.0"

    // 以下省略...
```

## xmlを書く
ウィジェットのメタデータ（最小幅とか、ウィジェット設定用 Activity の指定）を書く。

`res`の中に`xml`があるはずなので、そこに適当に`touch_photo_widget_info.xml`みたいなのを置く

![Imgur](https://i.imgur.com/YcQfzr8.png)

後は適当にコピペします。

```xml
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/app_name"
    android:minWidth="40dp"
    android:minHeight="40dp"
    android:previewImage="@drawable/ic_launcher_foreground"
    android:resizeMode="horizontal|vertical"
    android:targetCellWidth="1"
    android:targetCellHeight="1"
    android:updatePeriodMillis="86400000"
    android:widgetCategory="home_screen" />
```

これらのメタデータの詳細は以下。  
https://developer.android.com/develop/ui/views/appwidgets#other-attributes  

`description`とか`previewImage`はちゃんとしておいたほうが良い

## Jetpack Glance のクラスを用意する
2つ用意します。  
まずは `GlanceAppWidget`を継承したクラスを作ります。

```kotlin
class TouchPhotoWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        // TODO この後すぐ！
    }

}
```

次に、`GlanceAppWidgetReceiver`を継承したクラスも作ります。  
`glanceAppWidget`は、↑で作った`GlanceAppWidget`を継承したクラスのインスタンスを渡せば大丈夫

```kotlin
class TouchPhotoWidgetReceiver : GlanceAppWidgetReceiver() {

    override val glanceAppWidget: GlanceAppWidget
        get() = TouchPhotoWidget()

}
```

多分こうなってるはず。

![Imgur](https://i.imgur.com/4uaG1JW.png)

## AndroidManifest を書く
`<receiver>`を書きます。  
`android:name=".TouchPhotoWidgetReceiver"`と、`android:resource="@xml/touch_photo_widget_info"`は各自違う値になるはず！

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.TouchPhotoWidget"
        tools:targetApi="31">

        <!-- 詳細は... -->

        <!-- <application> の中に↓を書く -->
        <receiver
            android:name=".TouchPhotoWidgetReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/touch_photo_widget_info" />
        </receiver>

    </application>

</manifest>
```

## ウィジェットのレイアウトを書く
`TouchPhotoWidget`（`GlanceAppWidget`を継承したクラス）を開き、`provideGlance`の中で、`provideContent { }`を呼び出します。  
`provideContent`のブロック内は`Composable`なので、あとはここにレイアウトを書いていくだけです！  
まじで魔法みたいに動く。

```kotlin
class TouchPhotoWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            // Composable
        }
    }

}
```

適当に、`Hello World`と、あと押したらアプリを起動するようにするにはこんな感じで。  
前述の通り、`Glance`用のコンポーネントを呼び出す必要があるので、`import`の際は注意してください  
（`GlanceModifier`が引数に入っているか、パッケージ名が`androidx.glance`で始まっているか）

![Imgur](https://i.imgur.com/mWiqkEt.png)

```kotlin
class TouchPhotoWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            Box(
                modifier = GlanceModifier
                    // match_parent
                    .fillMaxSize()
                    // 背景色
                    .background(Color.White)
                    // 押したら Activity 起動
                    .clickable(actionStartActivity<MainActivity>()),
                contentAlignment = Alignment.Center
            ) {

                Text(
                    text = "Hello World",
                    style = TextStyle(fontSize = 24.sp)
                )

            }
        }
    }

}
```

あとは実行して、実際にウィジェットを置いてみてください、  
どうでしょう、ちゃんと`Hello World`が出て、押して起動しますか？

`RemoteViews`時代よりずっっっっっっっと簡単になりましたね、感動

# いよいよ写真ウィジェットを作る
が、その前に写真の取得の話をしないとなんですよね。

## 写真を取得する READ_EXTERNAL_STORAGE / READ_MEDIA_IMAGES
`Android 13`以上をターゲットにする場合（今回は`14`なのでもちろんこちらの対象）、`READ_EXTERNAL_STORAGE`ではなく`READ_MEDIA_IMAGES`の権限を宣言してリクエストする必要があるそう。  
ただし、この権限は`13`からなので、それ以前の`Android`をサポートする場合は引き続き`READ_EXTERNAL_STORAGE`を宣言してリクエストする必要がある。  

（ちなみにドキュメントに書いてあるかわかんないですが、自分が作った写真（自分のアプリから`ContentResolver#insert`）の場合は↑の権限無しで取得できたはず。。。）

### 写真を取り出すには
パスを渡す方法は取れません（`Android 10`からの`Scoped Storage`のせい）。つまり、以下のような方法は取れません  
`val file = File("sdcard/DCIM/Example.jpg")`

じゃあどうするんだって話ですが、`Android`では`画像`等のメディアはデータベースみたいなやつに問い合わせると取得できるようになります。  
`MediaStore`とか`ContentResolver`とか言われてるやつです。  

#### MediaStore から Uri を取り出す
例です、こんな感じだと思う。  
`SQL`っぽいやつで取得したいメディアを取り出して、`cursor`で上から舐めていきます。  
もちろん、これを実行する前に権限があるかのチェックが必要です。

`(0 until 10).map { }`とかで指定した数の配列を作れます。書いてて楽しい`Kotlin`

```kotlin
val uriList: List<Uri> = context.contentResolver.query(
    // 保存先、SDカードとかもあったはず
    MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
    // 今回はメディアの ID を取得。他にもタイトルとかあります
    // 実際のデータの取得には、まず ID を取得する必要があります
    arrayOf(MediaStore.MediaColumns._ID),
    // SQL の WHERE。ユーザー入力が伴う場合はプレースホルダーを使いましょう
    null,
    // SQL の WHERE のプレースホルダーの値
    null,
    // SQL の ORDER BY
    null
)?.use { cursor ->
    // 一応最初に移動しておく
    cursor.moveToFirst()
    // 配列を返す
    (0 until cursor.count)
        .map {
            // ID 取得
            val id = cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.MediaColumns._ID))
            // Uri の取得
            val uri = ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id)
            // 次のレコードに移動
            cursor.moveToNext()
            // 返す
            uri
        }
} ?: emptyList()
```

# 写真ウィジェットを作る

## 権限
`AndroidManifest.xml`に書き足します。  

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Android 12 まではこちらの権限が必要 -->
    <uses-permission
        android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />

    <!-- Android 13 からはこちら -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

    <!-- 以下省略 -->
```

## 権限を要求する
`MainActivity`に書きます。  
権限がなければ要求するボタンを出します。簡単になりましたね。

```kotlin
class MainActivity : ComponentActivity() {

    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            val context = LocalContext.current
            val isGranted = remember {
                // 初期値は権限があるか
                mutableStateOf(ContextCompat.checkSelfPermission(context, REQUEST_PERMISSION) == PackageManager.PERMISSION_GRANTED)
            }
            // 権限コールバック
            val requestPermission = rememberLauncherForActivityResult(contract = ActivityResultContracts.RequestPermission()) {
                isGranted.value = it
            }

            TouchPhotoWidgetTheme {
                Scaffold(
                    topBar = { TopAppBar(title = { Text(text = stringResource(id = R.string.app_name)) }) }
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(it),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {

                        if (isGranted.value) {
                            Text(text = "ホーム画面を長押しして、ウィジェットを追加してください")
                        } else {
                            Text(text = "写真を取得する権限が必要です")
                            Button(onClick = {
                                requestPermission.launch(REQUEST_PERMISSION)
                            }) { Text(text = "権限をリクエストする") }
                        }

                    }
                }
            }
        }
    }

    companion object {

        /** 必要な権限 */
        val REQUEST_PERMISSION = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            android.Manifest.permission.READ_MEDIA_IMAGES
        } else {
            android.Manifest.permission.READ_EXTERNAL_STORAGE
        }

    }

}
```

## 画像の取得処理
画像を読み込むユーティリティクラスを用意します！！！  
`ID`をとって、`Uri`にして、`Bitmap`を取得する感じです。

、、、と思ってたんですけど、メモリ使い過ぎで怒られたため、`Glide`というライブラリで`Bitmap`を読み込むようにしました。

```kotlin
object PhotoTool {

    /**
     * 写真を取得する
     *
     * @param context [Context]
     * @param limit 上限
     * @param size [Bitmap] の大きさ
     * @return [PhotoData] の配列
     */
    suspend fun getLatestPhotoBitmap(
        context: Context,
        limit: Int = 20,
        size: Int = 200
    ): List<PhotoData> = withContext(Dispatchers.IO) {
        val contentResolver = context.contentResolver
        val uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI
        val selection = arrayOf(MediaStore.MediaColumns._ID)
        val sortOrder = "${MediaStore.MediaColumns.DATE_ADDED} DESC"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // LIMIT が使える
            contentResolver.query(
                uri,
                selection,
                bundleOf(
                    ContentResolver.QUERY_ARG_LIMIT to limit,
                    ContentResolver.QUERY_ARG_SQL_SORT_ORDER to sortOrder
                ),
                null
            )
        } else {
            // 使えないので、取り出す際にやる
            contentResolver.query(
                uri,
                selection,
                null,
                null,
                sortOrder
            )
        }?.use { cursor ->
            cursor.moveToFirst()
            // 返す
            (0 until min(cursor.count, limit))
                .map {
                    // コンテンツの ID を取得
                    val id = cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.MediaColumns._ID))
                    cursor.moveToNext()
                    id
                }
                .map { id ->
                    // ID から Uri を取得
                    ContentUris.withAppendedId(uri, id)
                }
                .map { uri ->
                    // Uri から Bitmap を返す
                    // Glide で小さくしてから Bitmap を取得する
                    PhotoData(getBitmap(context, uri, size), uri)
                }
        } ?: emptyList()
    }

    /**
     * 画像をロードする
     * Glide を使うので小さくして Bitmap を返せます
     *
     * @param context [Context]
     * @param uri [Uri]
     * @param size サイズ
     * @return [Bitmap]
     */
    suspend fun getBitmap(
        context: Context,
        uri: Uri,
        size: Int,
    ): Bitmap = withContext(Dispatchers.IO) {
        Glide.with(context)
            .asBitmap()
            .load(uri)
            .submit(size, size)
            .get()
    }

    /**
     * [Bitmap] と [Uri] のデータクラス
     */
    data class PhotoData(
        val bitmap: Bitmap,
        val uri: Uri
    )

}
```

## ウィジェットに入れる
あとはウィジェット上で画像を表示するだけ！  
`Jetpack Compose`みたいな感じで書いていけば良いはず。`LocalContext`はなさそうなので、引数にある`Context`をバケツリレーすると良さそう

```kotlin
class TouchPhotoWidget : GlanceAppWidget() {

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {

            // 押した画像、選択していない場合は null
            val selectPhoto = remember { mutableStateOf<PhotoTool.PhotoData?>(null) }
            // 画像一覧
            val bitmapList = remember { mutableStateOf(emptyList<PhotoTool.PhotoData>()) }

            // 画像をロード
            LaunchedEffect(key1 = Unit) {
                bitmapList.value = PhotoTool.getLatestPhotoBitmap(context)
            }

            Box(
                modifier = GlanceModifier
                    .fillMaxSize()
                    .background(Color.White)
            ) {
                if (selectPhoto.value != null) {
                    // 選択した画像がある
                    PhotoDetail(
                        photoData = selectPhoto.value!!,
                        onBack = { selectPhoto.value = null }
                    )
                } else {
                    // 一覧表示
                    PhotoGridList(
                        photoDataList = bitmapList.value,
                        onClick = { bitmap -> selectPhoto.value = bitmap }
                    )
                }
            }
        }
    }

    /**
     * グリッド表示で写真を表示する
     *
     * @param context [Context]
     * @param onClick 写真を押したら呼ばれる
     */
    @Composable
    fun PhotoGridList(
        photoDataList: List<PhotoTool.PhotoData>,
        onClick: (PhotoTool.PhotoData) -> Unit
    ) {
        LazyVerticalGrid(
            modifier = GlanceModifier.fillMaxSize(),
            gridCells = GridCells.Fixed(4)
        ) {
            items(photoDataList) { photoData ->
                Image(
                    modifier = GlanceModifier
                        .fillMaxWidth()
                        .height(100.dp)
                        .clickable { onClick(photoData) },
                    provider = ImageProvider(photoData.bitmap),
                    contentScale = ContentScale.Crop,
                    contentDescription = null
                )
            }
        }
    }

    /**
     * 写真の詳細画面
     *
     * @param photoData [PhotoTool.PhotoData]
     * @param onBack 戻る押した時
     */
    @Composable
    fun PhotoDetail(
        photoData: PhotoTool.PhotoData,
        onBack: () -> Unit
    ) {
        // 画像アプリで開くための Intent
        // data に Uri を渡すことで対応しているアプリをあぶり出す
        val intent = remember { Intent(Intent.ACTION_VIEW, photoData.uri) }

        Column(modifier = GlanceModifier.fillMaxSize()) {
            Row(
                modifier = GlanceModifier
                    .fillMaxWidth()
                    .padding(5.dp)
            ) {
                Button(
                    modifier = GlanceModifier.padding(10.dp),
                    text = "戻る",
                    onClick = onBack
                )
                Spacer(modifier = GlanceModifier.defaultWeight())
                Button(
                    modifier = GlanceModifier.padding(10.dp),
                    text = "開く",
                    onClick = actionStartActivity(intent)
                )
            }
            Image(
                modifier = GlanceModifier.fillMaxSize(),
                provider = ImageProvider(photoData.bitmap),
                contentDescription = null
            )
        }
    }

}
```

## 使ってみる
こんな感じに一覧表示されてて、

![Imgur](https://i.imgur.com/uPnmC3M.png)

押すと一枚だけ表示されます！

![Imgur](https://i.imgur.com/XuFaZJt.png)

`戻る`ボタンを押すと戻れます。あと`開く`を押すとアプリを選択する画面が出ます！  
`Intent(Intent.ACTION_VIEW, photoData.uri)`←この`第2引数`に`Uri`を入れるやつ

![Imgur](https://i.imgur.com/WsHKYrd.png)

ちな`Android 14`で押したら落ちた  
`PendingIntent`の引数を`FLAG_IMMUTABLE`にしないといけないんだけど、現状は`Glance`が内部で`PendingIntent`を作っているので直せない。  
`RemoteViews`を作って、`PendingIntent`を渡して、その`RemoteViews`を`Glance`で使う（相互利用ができる）しかなさそう・・・

```plaintext
Unrecognized Action: androidx.glance.appwidget.action.StartActivityIntentAction@3cb3c84
    java.lang.IllegalArgumentException: io.github.takusan23.touchphotowidget: Targeting U+ (version 34 and above) disallows creating or retrieving a PendingIntent with FLAG_MUTABLE, an implicit Intent within and without FLAG_NO_CREATE and FLAG_ALLOW_UNSAFE_IMPLICIT_INTENT for security reasons. To retrieve an already existing PendingIntent, use FLAG_NO_CREATE, however, to create a new PendingIntent with an implicit Intent use FLAG_IMMUTABLE.
    at android.os.Parcel.createExceptionOrNull(Parcel.java:3061)
    at android.os.Parcel.createException(Parcel.java:3041)
    at android.os.Parcel.readException(Parcel.java:3024)
    at android.os.Parcel.readException(Parcel.java:2966)
    at android.app.IActivityManager$Stub$Proxy.getIntentSenderWithFeature(IActivityManager.java:6568)
    at android.app.PendingIntent.getActivityAsUser(PendingIntent.java:571)
    at android.app.PendingIntent.getActivity(PendingIntent.java:552)
    at androidx.glance.appwidget.action.ApplyActionKt.getPendingIntentForAction(ApplyAction.kt:82)
    at androidx.glance.appwidget.action.ApplyActionKt.getPendingIntentForAction$default(ApplyAction.kt:73)
```

## 見た目を整える

### 色

まず`GlanceTheme`が使えるように、親を`GlanceTheme`で囲います。

```kotlin
// テーマ機能
GlanceTheme(
    colors = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        GlanceTheme.colors
    } else {
        colors
    }
) {
    Box(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(GlanceTheme.colors.secondaryContainer)
    ) {
        if (selectPhoto.value != null) {
            // 選択した画像がある
            PhotoDetail(
                photoData = selectPhoto.value!!,
                onBack = { selectPhoto.value = null }
            )
        } else {
            // 一覧表示
            PhotoGridList(
                photoDataList = bitmapList.value,
                onClick = { bitmap -> selectPhoto.value = bitmap }
            )
        }
    }
}
```

`Android 12`以降は`Dynamic Color ( Material You )`を使います。  
それ以下で使うための`colors`は、`Empty Compose Project`書いた時に付いてきたやつを使うことにします。

```kotlin
companion object {
    val colors = ColorProviders(
        light = LightColorScheme,
        dark = DarkColorScheme
    )
}
```

背景の色は、`secondaryContainer`にすると良さそうです。

```kotlin
Box(
    modifier = GlanceModifier
        .fillMaxSize()
        .background(GlanceTheme.colors.secondaryContainer)
) { }
```

ボタンの色は、アイコンだけのやつだと`primary`っぽい。  
塗りつぶしアイコンの場合は、塗りつぶしが`primary`で、アイコンの色が`primaryContainer`っぽい（`Container`が逆転！？）  

あと適当にアイコンを持ってきました。`Icon`は多分なさそうなので、`Image`を使うであってそう。

```kotlin
Row(
    modifier = GlanceModifier
        .fillMaxWidth()
        .padding(5.dp)
) {
    // 戻るボタン
    Image(
        modifier = GlanceModifier
            .size(40.dp)
            .padding(5.dp)
            .cornerRadius(10.dp)
            .clickable(onBack),
        provider = ImageProvider(resId = R.drawable.outline_arrow_back_24),
        contentDescription = null,
        colorFilter = ColorFilter.tint(GlanceTheme.colors.primary)
    )
    Spacer(modifier = GlanceModifier.defaultWeight())
    // アプリを開く
    // 塗りつぶし
    Image(
        modifier = GlanceModifier
            .size(40.dp)
            .padding(5.dp)
            .background(GlanceTheme.colors.primary)
            .cornerRadius(10.dp)
            .clickable(actionStartActivity(intent)),
        provider = ImageProvider(resId = R.drawable.outline_open_in_new_24),
        contentDescription = null,
        colorFilter = ColorFilter.tint(GlanceTheme.colors.primaryContainer)
    )
}
```

こんな感じにしてみた。他のウィジェットも同じ感じの色使いしてそう！

![Imgur](https://i.imgur.com/SZ2wqhi.png)

ちなみに、`primaryContainer`は実際には`Android`のカラーリソースの`ID`を指している（`android.R.color.xxxxx`みたいな）ので、以下の`colors.xml`を見ると実際の`ID`を見ることが出来ます。

https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:glance/glance/src/main/res/values-v31/colors.xml;l=1

`primary`は`@android:color/system_accent1_600`を指定するのと同じ働きをするみたいですね！

## レスポンシブデザイン
これだと、横幅に関係なく`4つ`表示しているので、幅がないときは`2`とかにしたい！みたいなことが出来ます。  
これも`Jetpack Glance`なら簡単にできるのでやります。（`RemoteViews`だったらやりたくない

まずは大きさを定義して

```kotlin
companion object {

    /** 小さいサイズ */
    private val SMALL = DpSize(width = 100.dp, height = 100.dp)

    /** 大きいサイズ */
    private val LARGE = DpSize(width = 250.dp, height = 100.dp)
    
}
```

次に、`GlanceAppWidget`の`sizeMode`をオーバーライドして、`SizeMode.Responsive`を作って返してあげます。

```kotlin
class TouchPhotoWidget : GlanceAppWidget() {

    /** ウィジェットの利用可能なサイズ。通常と横に長いサイズ */
    override val sizeMode = SizeMode.Responsive(setOf(SMALL, LARGE))

```

あとは、`LocalSize`が使えるようになるので、グリッド表示コンポーネントの横並びセル数の部分で使います。

```kotlin
/**
 * グリッド表示で写真を表示する
 *
 * @param context [Context]
 * @param onClick 写真を押したら呼ばれる
 */
@Composable
fun PhotoGridList(
    photoDataList: List<PhotoTool.PhotoData>,
    onClick: (PhotoTool.PhotoData) -> Unit
) {
    // ウィジェットの大きさによって横に並べる数を変える
    val gridSize = if (LocalSize.current.width >= LARGE.width) 4 else 2

    LazyVerticalGrid(
        modifier = GlanceModifier.fillMaxSize(),
        gridCells = GridCells.Fixed(gridSize)
    ) {
        // 以下省略...
```

これで、横幅が小さいときは横並びが2つになりました。  
多分もっと刻むことができるはずです。いや～～楽ですねこれ

![Imgur](https://i.imgur.com/l0X4b6s.png)

ちなみに、普通にこーゆーこともできるので、レイアウト全体を変えることも出来ます。  
本当になんで動いてるか不思議だ...

```kotlin
val size = LocalSize.current
// サイズによってレイアウトを切り替える
if (size.width >= LARGE.width) {
    LargeWidgetContent()
} else {
    SmallWidgetContent()
}
```

# ここまでコード全部

```kotlin
class TouchPhotoWidget : GlanceAppWidget() {

    /** ウィジェットの利用可能なサイズ。通常と横に長いサイズ */
    override val sizeMode = SizeMode.Responsive(setOf(SMALL, LARGE))

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {

            // 押した画像、選択していない場合は null
            val selectPhoto = remember { mutableStateOf<PhotoTool.PhotoData?>(null) }
            // 画像一覧
            val bitmapList = remember { mutableStateOf(emptyList<PhotoTool.PhotoData>()) }

            // 画像をロード
            LaunchedEffect(key1 = Unit) {
                bitmapList.value = PhotoTool.getLatestPhotoBitmap(context)
            }

            // テーマ機能
            GlanceTheme(
                colors = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    GlanceTheme.colors
                } else {
                    colors
                }
            ) {
                Box(
                    modifier = GlanceModifier
                        .fillMaxSize()
                        .background(GlanceTheme.colors.secondaryContainer)
                ) {
                    if (selectPhoto.value != null) {
                        // 選択した画像がある
                        PhotoDetail(
                            photoData = selectPhoto.value!!,
                            onBack = { selectPhoto.value = null }
                        )
                    } else {
                        // 一覧表示
                        PhotoGridList(
                            photoDataList = bitmapList.value,
                            onClick = { bitmap -> selectPhoto.value = bitmap }
                        )
                    }
                }
            }
        }
    }

    /**
     * グリッド表示で写真を表示する
     *
     * @param context [Context]
     * @param onClick 写真を押したら呼ばれる
     */
    @Composable
    fun PhotoGridList(
        photoDataList: List<PhotoTool.PhotoData>,
        onClick: (PhotoTool.PhotoData) -> Unit
    ) {
        // ウィジェットの大きさによって横に並べる数を変える
        val gridSize = if (LocalSize.current.width >= LARGE.width) 4 else 2

        LazyVerticalGrid(
            modifier = GlanceModifier.fillMaxSize(),
            gridCells = GridCells.Fixed(gridSize)
        ) {
            items(photoDataList) { photoData ->
                Image(
                    modifier = GlanceModifier
                        .fillMaxWidth()
                        .height(100.dp)
                        .clickable { onClick(photoData) },
                    provider = ImageProvider(photoData.bitmap),
                    contentScale = ContentScale.Crop,
                    contentDescription = null
                )
            }
        }
    }

    /**
     * 写真の詳細画面
     *
     * @param photoData [PhotoTool.PhotoData]
     * @param onBack 戻る押した時
     */
    @Composable
    fun PhotoDetail(
        photoData: PhotoTool.PhotoData,
        onBack: () -> Unit
    ) {
        // 画像アプリで開くための Intent
        // data に Uri を渡すことで対応しているアプリをあぶり出す
        val intent = remember { Intent(Intent.ACTION_VIEW, photoData.uri) }

        Column(modifier = GlanceModifier.fillMaxSize()) {
            Row(
                modifier = GlanceModifier
                    .fillMaxWidth()
                    .padding(5.dp)
            ) {
                // 戻るボタン
                Image(
                    modifier = GlanceModifier
                        .size(40.dp)
                        .padding(5.dp)
                        .cornerRadius(10.dp)
                        .clickable(onBack),
                    provider = ImageProvider(resId = R.drawable.outline_arrow_back_24),
                    contentDescription = null,
                    colorFilter = ColorFilter.tint(GlanceTheme.colors.primary)
                )
                Spacer(modifier = GlanceModifier.defaultWeight())
                // アプリを開く
                // 塗りつぶし
                Image(
                    modifier = GlanceModifier
                        .size(40.dp)
                        .padding(5.dp)
                        .background(GlanceTheme.colors.primary)
                        .cornerRadius(10.dp)
                        .clickable(actionStartActivity(intent)),
                    provider = ImageProvider(resId = R.drawable.outline_open_in_new_24),
                    contentDescription = null,
                    colorFilter = ColorFilter.tint(GlanceTheme.colors.primaryContainer)
                )
            }
            Image(
                modifier = GlanceModifier.fillMaxSize(),
                provider = ImageProvider(photoData.bitmap),
                contentDescription = null
            )
        }
    }

    companion object {

        /** Material You が使えない用 */
        val colors = ColorProviders(
            light = LightColorScheme,
            dark = DarkColorScheme
        )

        /** 小さいサイズ */
        private val SMALL = DpSize(width = 100.dp, height = 100.dp)

        /** 大きいサイズ */
        private val LARGE = DpSize(width = 250.dp, height = 100.dp)

    }

}
```

## Android Jetpack Glance 知見
最後にこれ作ってたり、`NewRadioSupporter`のウィジェット作ってたときの知見を残します。

- `provideContent { }`は`45`秒間動き続ける？
    - ↑ の間、`collectAsState`とかが動くのか
    - `GlanceAppWidget#provideGlance`のドキュメントを見てください。
- ウィジェットを更新する関数があります。
    - `TouchPhotoWidget().update()`とか`TouchPhotoWidget().updateAll()`とか
    - これらは、`provideContent { }`が動いているときは特に何もしなさそう
        - `WorkManager`が動いている間？は既にウィジェット動いてるので特に何もしない？
- `GlanceModifier.clickable { }`の際、`provideContent { }`が起動していなかったら起動するぽい
    - `WorkManager`が裏で動く
        - ボタンを追加で押すと、`45`秒のタイムアウトも延長するらしい
- 多分レイアウト変更時に再設置が必要なのは変わってないと思う、`RemoteViews`だから仕方ないのかも

# おわりに
これも`iOS`でウィジェットが入った影響みたいなのがあるんですかね？  
もしも入らなければ、`Android`もウィジェット周りの改修が入らず地獄のままだったのでしょうか・・・ありがとう`iOS`  

ソースコード置いておきます。最新の`Android Studio`で実行できるはずです。  
https://github.com/takusan23/TouchPhotoWidget

# おわりに2
`BroadcastReceiver`で思い出した、レシーバーのスペル、たまに`Reciever`って書いちゃう

# おわりに3
`NewRadioSupporter` 審査出ししました

![Imgur](https://i.imgur.com/XxAV4Y9.png)