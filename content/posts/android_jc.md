---
title: Jetpack Composeを既存アプリへ導入
created_at: 2020-12-29
tags:
- Android
- JetpackCompose
- Kotlin
---

どうもこんばんわ。ニコ生でCLANNAD一挙見てます。  
本編で流れてるBGMすきすき

# 前提
- `Kotlin Android Extensions`は使えない模様。`ViewBinding`へ乗り換えて。  

# 環境

| なまえ           | あたい                                          |
|------------------|-------------------------------------------------|
| `Android Studio` | `Android Studio Arctic Fox \ 2020.3.1 Canary 3` |
| minSdkVersion    | 21                                              |


# 遭遇した問題 2021/01/03 現在

- Android 5でリソースが見つからないエラーでクラッシュ
今までの方法でDrawableを取得してBitmapへ変換してComposeで扱えるBitmapへ変換すれば取れる。

```kotlin
val icon = AmbientContext.current.getDrawable(R.drawable.android)?.toBitmap()?.asImageBitmap()
if (icon != null) {
    Icon(
        modifier = Modifier.padding(5.dp),
        bitmap = icon
    )
}
```

- ~~`ScrollableRow`で`AndroidView`がずれる~~ **Beta03で修正されました。**
    - Android 7以前で観測
    - ~~直し方はわからん~~**Beta03に上げればおｋ(Kotlinは1.4.31)**

- そもそもAndroid StudioでJDKのパスが間違ってるとか言われてビルドまで進めない
    - `.idea`を消してみる(か適当に名前を変える)と直りました。


# 既存アプリへ導入

割と頻繁にアップデートが入るので、[こっちも見て](/posts/android_jc_recipe/)

## AGPのアップデート
必要かどうかはわかりませんが、たしかサンプルコードいじってるときもAGPのバージョンがなんとかみたいな感じでアップデートした記憶があるので更新しておきましょう。  
家のWi-Fi遅くてつらい  

多分右下にアップデートする？みたいな通知が出てると思うのでそこから

![Imgur](https://i.imgur.com/PzEdNV0.png)

## Kotlinのアップデート
`app`フォルダじゃない方の`build.gradle`を開いて、書き換えていきます。

```java
buildscript {
    ext.kotlin_version = '1.4.21'
    repositories {
        google()
        jcenter()
        
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:7.0.0-alpha03'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}
```

`ext.kotlin_version`を`1.4.21`へ変えます。  
`classpath 'com.android.tools.build:gradle:7.0.0-alpha03'`はバージョンを上げるとそうなると思う。

### app/build.gradle
`app`フォルダの方の`build.gradle`を開いて、必要なライブラリを書いていきます。  
以下は一例です。

```java
apply plugin: 'com.android.application'

apply plugin: 'kotlin-android'

// apply plugin: 'kotlin-android-extensions' さよなら

apply plugin: 'kotlin-kapt' // Room使うときのなにか。一番上に

android {

    compileSdkVersion 30
    defaultConfig {
        applicationId "io.github.takusan23.tatimidroid"
        minSdkVersion 22
        targetSdkVersion 30
        versionCode 78
        versionName "12.2.1"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    // Kotlinを書くきっかけになった Kotlin Android Extensions がいよいよ非推奨になってしまった
    // のでViewBindingに乗り換える
    buildFeatures {
        // ViewBinding有効
        viewBinding true
        // Jetpack Compose有効
        compose true
    }

    compileOptions {
        targetCompatibility 1.8
        sourceCompatibility 1.8
    }

    kotlinOptions {
        jvmTarget = '1.8'
        useIR = true
    }

    composeOptions {
        kotlinCompilerVersion kotlin_version // 1.4.21が入ると思う
        kotlinCompilerExtensionVersion '1.0.0-alpha09'
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])

    // Jetpack Compose --- ここから

    implementation 'androidx.compose.ui:ui:1.0.0-alpha09'
    // Tooling support (Previews, etc.)
    implementation 'androidx.compose.ui:ui-tooling:1.0.0-alpha09'
    // Foundation (Border, Background, Box, Image, Scroll, shapes, animations, etc.)
    implementation 'androidx.compose.foundation:foundation:1.0.0-alpha09'
    // Material Design
    implementation 'androidx.compose.material:material:1.0.0-alpha09'
    // Material design icons
    implementation 'androidx.compose.material:material-icons-core:1.0.0-alpha09'
    implementation 'androidx.compose.material:material-icons-extended:1.0.0-alpha09'
    // Integration with observables
    implementation 'androidx.compose.runtime:runtime-livedata:1.0.0-alpha09'

    // Jetpack Compose --- ここまで

}
```

`buildFeatures`とか`kotlinOptions`、`composeOptions`と  
`dependencies`に書き足す感じですかね

できたら`Sync`して`Build`します。

# Jetpack Compose を試す

適当にクラスを作って書いていきます。

```kotlin
/**
 * Jetpack Compose 略してJC
 * */

@Composable
fun VideoInfoCard() {
    Card(modifier = Modifier.padding(10.dp)) {
        Text(text = "Hello World")
    }
}

@Preview
@Composable
fun PreviewVideoInfoCard() {
    VideoInfoCard()
}
```

`@Preview`をつけることで隣のプレビューに表示されるようになります。`@Preview`を付けた関数には引数を設定してはいけません。

## Activityに置く

setContentView()の代わりに`setContent { }`を置いてその中にさっき書いた`VideoInfoCard()`を書きましょう

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            VideoInfoCard()
        }
    }
}
```

他にも`@Preview`のついた関数のところで実機プレビューが使えますが、  
私の環境ではうまく動かなかったので`Activity`に置いたほうがいいと思います。

## Modifierについて
よく登場する`Modifier`、多分すべての`Compose`で共通する`height`とか`width`とか`padding`とかを設定するときに使う。  
xmlでレイアウト組んでたときも共通で使えた属性あったから多分そんなやつ  

連結して設定していきます

```kotlin
Image(
    imageVector = Icons.Outlined.Book,
    modifier = Modifier.height(50.dp).width(50.dp),
)
```

# レシピ集
Jetpack Composeが流行ると願って  
手を動かそう

## カウンターアプリを作る
`var count by remember { mutableStateOf(0) }`を使うことでカウント値を保持できます。  
`var count = 0`は動きませんでした。

```kotlin

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TestCompose()
        }
    }
}

@Composable
fun TestCompose() {
    // 押した回数を保持する
    var count by remember { mutableStateOf(0) }

    Column(
        modifier = Modifier.padding(10.dp), // スペース確保
        horizontalAlignment = Alignment.CenterHorizontally, // 真ん中にする
    ) {
        Text(
            text = "押した回数 $count",
        )
        Button(
            onClick = {
                // おしたとき
                count += 1
            },
            colors = ButtonDefaults.textButtonColors(backgroundColor = Color.White)
        ) {
            Text(text = "ここをおせ！")
        }
    }
}

@Preview
@Composable
fun TestComposePreview() {
    TestCompose()
}
```

実行結果

![Imgur](https://i.imgur.com/MHExL7O.png)


## 好きなUIにクリックイベントを置きたい（`Button { }`以外で押せるようにしたい）
Modifierにクリックするやつがあります。`Ripple`（波みたいなやつ）もできます。

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ClickableCompose()
        }
    }
}

@Composable
fun ClickableCompose() {
    // 押した回数を保持する
    var count by remember { mutableStateOf(0) }
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .width(150.dp)
            .height(100.dp)
            .clickable(
                onClick = { count++ },
                indication = rememberRipple(color = Color.Blue),
                interactionSource = remember { MutableInteractionSource() },
            )
    ) {
        Text(text = "おせますよ～ $count")
        Image(imageVector = Icons.Outlined.Add)
    }
}
```
実行結果

![Imgur](https://i.imgur.com/dHQELFC.png)

## アイコンを表示 + 押せるようにする

今まで、マテリアルアイコンを使う際は`Asset Studio`からアイコンを持ってくると思うんですが、  

![Imgur](https://i.imgur.com/QEgIZ6J.png)

なんと！`Jetpack Compose`を使うことでコード一行でアイコンを用意できます。`Outlined`以外も用意できます。

```kotlin
Icon(imageVector = Icons.Outlined.Android)
```

```kotlin

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TestCompose()
        }
    }
}

@Composable
fun TestCompose() {
    // 押した回数を保持する
    var count by remember { mutableStateOf(0) }

    Row(
        modifier = Modifier.padding(10.dp), // スペース確保
        verticalAlignment = Alignment.CenterVertically, // まんなかに
    ) {
        Text(
            text = "押した回数 $count",
        )
        IconButton(onClick = {
            // カウントアップ
            count++
        }) {
            Icon(imageVector = Icons.Outlined.Home)
        }
    }
}

@Preview
@Composable
fun TestComposePreview() {
    TestCompose()
}
```

実行結果

![Imgur](https://i.imgur.com/srZwt5e.png)

## 動画説明文見え隠れするやつ

```kotlin

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            VideoInfo()
        }
    }
}

@Composable
fun VideoInfo() {
    // 表示するか
    var isShow by remember { mutableStateOf(false) }
    Card(
        modifier = Modifier.padding(10.dp)
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Row {
                Text(text = "動画タイトル", modifier = Modifier.weight(1f)) // アイコンまでずっと伸ばす
                IconButton(onClick = {
                    isShow = !isShow
                }) {
                    // アイコンも変更
                    Icon(imageVector = if (isShow) Icons.Outlined.ExpandLess else Icons.Outlined.ExpandMore)
                }
            }

            // 表示するか
            if (isShow) {
                Text(
                    text = """
                    ニコ動にもサムネ登録機能ついてから最後一瞬だけサムネ用の画像を表示させるやつも見なくなりましたね。
                    """.trimIndent()
                )
            }

        }
    }
}
```

実行結果

![Imgur](https://i.imgur.com/wwflXdr.png)

## リスト表示

`RecyclerView`みたいに画面外は表示しない`LazyColumn`ってのがありますのでこれを使っていきます

まずRecyclerViewのAdapterみたいに一つだけのやつを用意します。

```kotlin
@Composable
fun BlogCard(blogTitle: String) {
    // 押した回数を保持する
    var count by remember { mutableStateOf(0) }

    Card(
        modifier = Modifier.padding(10.dp),
        elevation = 10.dp
    ) {
        Column(
            modifier = Modifier.padding(10.dp), // スペース確保
            verticalArrangement = Arrangement.Center, // まんなかに
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Image(
                    imageVector = Icons.Outlined.Book,
                    modifier = Modifier.height(50.dp).width(50.dp),
                )
                Text(
                    text = blogTitle,
                    modifier = Modifier.weight(1f)
                )
            }
            Divider(modifier = Modifier.padding(0.dp, 10.dp, 0.dp, 0.dp)) // 区切り線
            IconButton(onClick = {
                // カウントアップ
                count++
            }) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(imageVector = Icons.Outlined.FavoriteBorder)
                    Text(text = "$count")
                }
            }
        }
    }
}
```


そしたら一覧表示を作って完成

```kotlin

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            BlogCardList()
        }
    }
}

@Composable
fun BlogCardList() {
    val blogList = listOf(
        "Jetpack Compose 略して？",
        "MotionLayoutでミニプレイヤー",
        "2020年おすすめボカロ",
        "ボカロバラードいいよね",
    )
    Surface(Modifier.fillMaxSize()) {
        LazyColumn(content = {
            items(blogList) {
                BlogCard(it)
            }
        })
    }
}

@Preview
@Composable
fun TestComposePreview() {
    BlogCardList()
}
```

こんな感じになると思う。`RecyclerView`より一覧表示がかんたんで嬉しい。  
(Vue.jsの`v-for`みたいで使いやすい)

![Imgur](https://i.imgur.com/gh2VjIL.png)

# Fragment に設置する

とりあえず一つにFragmentからJetpack Compose使ってみようかなって。そんな方に

## 今（2020/12/30現在）だけ？
Fragmentを作るにはFragmentのバージョンを上げる必要があります。あげないと、`prepareCall`とか言う謎のメソッドを書かないといけなくなります（正体不明）  
`app`フォルダにある`build.gradle`を開いて`dependencies`に書き足します

```java
dependencies {
    // Fragmentを作ろうとすると謎のメソッドをオーバーライドさせようとするので
    implementation 'androidx.fragment:fragment-ktx:1.3.0-rc01'
}
```

そしたら`BlogListFragment.kt`を作成してコピペ

```kotlin
class BlogListFragment : Fragment() {
    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        return ComposeView(requireContext()).apply {
            setContent {
                MaterialTheme {
                    Scaffold(
                        topBar = {
                            TopAppBar() {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.Center,
                                    modifier = Modifier.fillMaxHeight().padding(10.dp),
                                ) {
                                    Text(text = "ブログ一覧")
                                }
                            }
                        }
                    ) {
                        BlogCardList()
                    }
                }
            }
        }
    }
}
```

`BlogCardList()`どこから出てきたんだって話ですが、`MainActivity.kt`に書いてあるのをそのまま使いました。  
本来はComposeのUI用クラスを用意すべきです。  

あと`BlogCardList()`関数？メソッド？はどこのクラスにも所属していない（class { } の中に書いてない）  
**トップレベル関数**ってやつなので、どこでもかけます？。注意点ですが**名前がかぶる**とエラーになります。

後はActivityに置きましょう。今までのXMLな感じで  
サンプルコードではxml使わず(R.layout.activity_main)、動的にFrameLayoutを置いてますが別にXMLでFrameLayout置いてid設定してもいいです。

```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // レイアウト作るのめんどいので動的に作る。別にXMLでレイアウト置いてもいい
        val fragmentHostLayout = FrameLayout(this)
        fragmentHostLayout.id = View.generateViewId()
        setContentView(fragmentHostLayout)

        supportFragmentManager.beginTransaction().replace(fragmentHostLayout.id, BlogListFragment()).commit()

    }
}
```

ちなみに`Navigation`は使ったことがないです。`argument`渡すのが楽になるとかなんとか

## 真ん中に表示させたい
一番実用性がありそう

### Row（横並び編）

注意点としては`verticalAlignment`と`horizontalArrangement`で指定している値のスペルが若干似てるってことですかね。

| なまえ                | あたい                         |
|-----------------------|--------------------------------|
| verticalAlignment     | **Alignment**.CenterVertically |
| horizontalArrangement | **Arrangement**.Center         |

### Column（縦並び編）
`Row`とは逆になります。

| なまえ              | あたい                           |
|---------------------|----------------------------------|
| verticalArrangement | **Arrangement**.Center           |
| horizontalAlignment | **Alignment**.CenterHorizontally |

以下サンプルコード

```kotlin

override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent {
        CardCenterText()
    }
}

@Composable
fun CardCenterText() {
    Column {
        Card(
            modifier = Modifier.padding(10.dp).fillMaxWidth().height(100.dp),
            backgroundColor = Color.Cyan,
        ) {
            Row(
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(text = "まんなかに居座る Row")
                Icon(imageVector = Icons.Outlined.Android)
            }
        }
        Card(
            modifier = Modifier.padding(10.dp).fillMaxWidth().height(100.dp),
            backgroundColor = Color.Cyan,
        ) {
            Column(
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(text = "まんなかに居座る Column")
                Icon(imageVector = Icons.Outlined.Android)
            }
        }
    }
}
```

こんな感じ

![Imgur](https://i.imgur.com/ejw6EYv.png)


# 遭遇したエラー

## R.jar: プロセスはファイルにアクセスできません。別のプロセスが使用中です。

`@Preview`から実行しようとすると失敗する。ので、`ActivityとかFragment`に置いていつもどおり実行したほうがいい。てかプレビューより早くない？

```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            VideoInfo()
        }
    }
}
```

どうしても`@Preview`から実行したければ

`Make Project`した後に実行させるとうまくいく？

![Imgur](https://i.imgur.com/QwiEqH5.png)

## Type 'TypeVariable(T)' has no method 'getValue(Nothing?, KProperty<*>)' and thus it cannot serve as a delegate

### by remember { } じゃないもう一つの方法

```kotlin
// プロパティデリゲート とか言う書き方
var selectTabIndex_ by remember { mutableStateOf(0) }
// アクセス
selectTabIndex_ = 0

// 割り当て演算子
var selectTabIndex = remember { mutableStateOf(0) }
selectTabIndex.value = 0
```

上も下も同じことができるので、だめな場合は下の方を試してみてください。アクセスの際に`value`を付ける必要がありますが


### else

なんかコピペし直したら治った。一応使ってる`import`書いておきますね

```kotlin
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Book
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.setContent
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
```

## Caused by: java.lang.ClassNotFoundException: Composable Method ~

`@Preview`のついた関数を消してそのまま実行すると出る。切り替えてあげよう

![Imgur](https://i.imgur.com/VXetpSK.png)


## java.lang.NoSuchMethodError: No static method ~

関数有るのに無いとか言ってくるやつ。

ツールバーの`Build`から`Clean Project`を実行した後に再度実行すると直るんじゃないかな

![Imgur](https://i.imgur.com/O8goR2b.png)

## なんか真っ赤になった。Importしてもなんか別なのがImportされるんだけど？

`Sync Project`したらなんかアップデートしませんか？(Android Gradle Pluginだと思われ)って聞かれたのでアプデしたらなんか治った。難しいね

![Imgur](https://i.imgur.com/ZSiRS9T.png)

# ソースコード
`Android Studio Arctic Fox | 2020.3.1 Canary 3`で動作確認済です。  
とりあえずブログ一覧を表示させた状態の画面が開くようになってるはずです。

https://github.com/takusan23/BlogListCompose

# 終わりに
- CPUとかメモリとかのリソースくっっっそ持っていくなこいつ。メモリも16GBあるのに無くなりそう()  
- あとプレビューまだ不十分感。なんかずれたりするし。
    - Activityに置いて普通に実行したほうが(私は)はやかった
- アイコンがすでに用意されているのは嬉しい。取り込む作業がなくなった
    - ただAndroid StudioのDrawable表示機能が便利だったのでちょっとつらい

あと`margin`ってないのかな。見つけられなかったんだけど  
