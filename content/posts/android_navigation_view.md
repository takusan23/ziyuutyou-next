---
title: AndroidのNavigationViewって便利じゃねって話。下から出てくるメニューの作り方
created_at: 2020-07-01
tags:
- Android
- Kotlin
- MaterialDesign
---

今まで`TextView`並べてたのがｂｋみたいだわ  
そんなことより7月ですね。

# 本題
こういうのを作ります。  

![Imgur](https://i.imgur.com/u1b56Rr.png)

# 環境
| なまえ  | あたい                            |
|---------|-----------------------------------|
| Android | 11 Beta 1 (5以降なら動くはずです) |
| 言語    | Kotlin                            |

# マテリアルデザインのライブラリを入れる

`appフォルダ`の方にある`build.gradle`を開きます。  
開いたら、`dependencies`に追記します。

```gradle
dependencies {
    // Material Design
    implementation 'com.google.android.material:material:1.3.0-alpha01'
    // 省略
}
```

あと多分関係ないけど、Java 8を使うようにしておくと今後幸せになれるかもしれない。

```gradle
android {
    compileSdkVersion 30
    buildToolsVersion "30.0.0"
    // 省略
    compileOptions {
        sourceCompatibility = 1.8
        targetCompatibility = 1.8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
}
```

# styles.xml を書き換える
これしないと **メニューを押したときの背景** がちゃんと反映されないと思います。  
といっても`parent`を`Theme.MaterialComponents.Light.DarkActionBar`に変更するだけです。難しくない

```xml
<resources>
    <!-- Base application theme. -->
    <style name="AppTheme" parent="Theme.MaterialComponents.Light.DarkActionBar">
        <!-- Customize your theme here. -->
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
    </style>

</resources>
```

# メニュー作成
## menuフォルダの中にファイルを置く

`res`の中に`menu`フォルダを作ります。  
できたら、`bottom_fragment_menu.xml`ファイルを置きます。

## アイコンを取ってくる
Android Studio 4.0 からアイコンを選ぶ際に、Outlinedなアイコンが選択可能になりました。たすかる  
`Vector Asset`を開いて、好きなアイコンを取ってきてください。  
起動方法は、`Shiftキーを3連続`押して`Vector Asset`って入力すれば多分出ると思います。`macOSのSpotlight的ななにか（macOS触ったこと無いけど）`

![Imgur](https://i.imgur.com/EIxL4JP.png)

## bottom_fragment_menu.xml を書く
以下のように。  

```xml
<?xml version="1.0" encoding="utf-8"?>
<menu xmlns:android="http://schemas.android.com/apk/res/android">
    <group android:checkableBehavior="single">
        <item
            android:id="@+id/nav_menu_java"
            android:icon="@drawable/ic_outline_settings_24"
            android:title="Java" />
        <item
            android:id="@+id/nav_menu_kotlin"
            android:icon="@drawable/ic_outline_settings_24"
            android:title="Kotlin" />
        <item
            android:id="@+id/nav_menu_js"
            android:icon="@drawable/ic_outline_settings_24"
            android:title="JS" />
    </group>
</menu>
```

# MainActivity
## activity_main.xml
レイアウトを書き換えます。ボタン一個置くだけなので`ConstraintLayout`をそのまま使おうと思います。  
いつかはちゃんと`ConstraintLayout`できるようにして**MotionLayoutの初め方**みたいな記事を書きたい。  
ちなみに現状`MotionLayout`使うと`RecyclerView`のクリックが行かない（たまによくクリックが反応しなくなる）のでもう少し様子見したほうが良い。
```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <Button
        android:id="@+id/activity_main_bottom_menu"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="BottomMenu"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

## MainActivity.kt
メニューを開くコードを書きます。

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        // BottomFragment開く
        activity_main_bottom_menu.setOnClickListener {
            MenuBottomFragment().show(supportFragmentManager, "menu")
        }
    }
}
```

`MenuBottomFragment`が赤くなるのでこれから書いていきましょう。

# MenuBottomFragment.kt
を作成します。  
よくわからん人は`MainActivity.kt`のある場所に`MenuBottomFragment.kt`を作ればいいです。

## bottom_fragment_menu.xml
`res/layout`の中に`bottom_fragment_menu.xml`を作成してください。  
中身はこんな感じで

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <com.google.android.material.navigation.NavigationView
        android:id="@+id/bottom_fragment_menu_navigation_view"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:menu="@menu/bottom_fragment_menu" />

</LinearLayout>
```

## MenuBottomFragment.kt

今回はメニューを押したらToastを出すようにしてみました。

```kotlin
class MenuBottomFragment : BottomSheetDialogFragment() {

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.bottom_fragment_menu, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        // メニュー押したとき
        bottom_fragment_menu_navigation_view.setNavigationItemSelectedListener {
            Toast.makeText(context, it.title, Toast.LENGTH_SHORT).show()
            true
        }
    }

}
```

これで終わりです。おつ88888888888

あとは起動してボタンを押すと下からメニューが出てくると思います。

# ソースコード
https://github.com/takusan23/NavigationViewSample

# おわりに
Android Studioくんに背景画像セットしてるせいでスクショが取れなかった。  
次からはPreview版をブログ書く用に入れておきたいと思いましたまる