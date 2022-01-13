---
title: Hello Android12。Material You 編
created_at: 2021-09-05
tags:
- Android
- Kotlin
- MaterialDesign
- MaterialYou
- Android12
---

どうもこんばんわ。  
この青空に約束を― 攻略しました。  

![Imgur](https://imgur.com/pbgKYnB.png)

オープニング曲聞いて気になってたのでやりました。  
海己ちゃんルートを最後にとっておいてよかった。結ばれるまでのお話が好き。  
静ちゃん初見時はこの子も攻略するの？とか思ってましたがエピローグの成長した姿みて反省しましたすいません。

これからやる方はWin8対応の新装版を買えばいいです。Win10で動作確認済です。DL版(Fanza)なら少し安く買える？

あと戯画はイベントモードがあるのがいいね。セーブ枠をセーブしておける←？？？

# 本題
`material-components-android`が`1.5.0-alpha03`から`M3 (Material 3)`に対応した模様。  
ついにMaterial You（動的テーマ）対応！！！

# Material You #とは
iモードケータイの着せ替えツールみたいなやつ。今の所、色だけ？が自由に決められる。  

# Monet #とは
壁紙からMaterial Youで使う取り出すシステム？のはず。`Android 12 Beta 4`からライブ壁紙でも動くそうな。  

## 悲報？
残念ながらAndroid 11？10？にあったステータスバーのアイコン変更機能、アプリアイコンの背景の変形機能は今の所削除されたままです。  
復活してほしい。

# つくる

# 公式ドキュメント

https://github.com/material-components/material-components-android/blob/master/docs/theming/Color.md#using-dynamic-colors

# 環境

| なまえ  | あたい    |
|---------|-----------|
| Android | 12 Beta 4 |
| Pixel   | 3 XL      |

## compileSdkVersion を 31 にする

`app/build.gradle`を開いて、`compileSdk`を31に変更します。

```gradle
android {
    compileSdk 31 // ここ

    defaultConfig {
        // 省略
```

次に、ライブラリを追加します。

```gradle
dependencies {
    implementation 'com.google.android.material:material:1.5.0-alpha03'
    implementation 'androidx.core:core-ktx:1.6.0' // 追加済みの場合はいらない

    // 以下省略
}
```

ここから先は以下の選択ができます。

- すべての画面で動的テーマを利用する
- 指定したActivityのみに動的テーマを当てる
- 指定したFragmentのみに動的テーマを当てる
- 動的に作ったViewに動的テーマを当てる

## すべての画面で動的テーマを利用する場合
まず、`Application`を継承したクラスを作ります。

```kotlin
/** アプリが起動したら呼ばれる */
class MainApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        // 動的テーマ有効化
        DynamicColors.applyToActivitiesIfAvailable(this)
    }
    
}
```

`AndroidManifest.xml`を開き、`android:theme`を`@style/Theme.Material3.DayNight`(もしくは`@style/Theme.Material3.DayNight`を継承したテーマ)に変更して、  
`android:name=".MainApplication"`を追加します

```xml
<application
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:supportsRtl="true"
    android:name=".MainApplication"
    android:theme="@style/Theme.Material3.DayNight"> 
```

そしたら、`activity_main.xml`にいくつかViewを置いて次世代のマテリアルデザインを体験しましょう。

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_margin="10dp"
        android:text="Button" />

    <Button
        style="@style/Widget.Material3.Button.OutlinedButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_margin="10dp"
        android:text="Outlined Button" />

</LinearLayout>
```

## 指定したActivityのみで動的テーマを利用する
Material YouをActivityで使う。

この場合は、`Application`クラスを継承したクラスを作成する手順は不要で、  
`AndroidManifest.xml`で、動的テーマを利用したいActivityの`android:theme`を`@style/Theme.Material3.DayNight`(もしくは`@style/Theme.Material3.DayNight`を継承したテーマ)に変更します。

```xml
<activity
    android:name=".MainActivity"
    android:exported="true"
    android:theme="@style/Theme.Material3.DayNight">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

つぎに、動的テーマを利用したいActivityの`setContentView()`の前に、一行書き足します。

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // setContentView() の前に呼ぶ
        DynamicColors.applyIfAvailable(this)
        
        setContentView(R.layout.activity_main)
        
    }
}
```

あとは、`activity_main.xml`にViewを置きます。

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_margin="10dp"
        android:text="Button" />

    <Button
        style="@style/Widget.Material3.Button.OutlinedButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_margin="10dp"
        android:text="Outlined Button" />

</LinearLayout>
```

## Fragmentに動的テーマを適用する
Material YouをFragmentで使う。

Fragmentとかで部分的に使う際に便利なんだろうけど、Google曰く簡単ではないらしい。  
多分こんな感じだと思う。

```kotlin
class MainFragment : Fragment() {

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        // 動的テーマを適用したContext
        val context = DynamicColors.wrapContextIfAvailable(requireContext())
        // 動的テーマを適用したContextを使ったLayoutInflaterを生成
        val dynamicColorApplyLayoutInflater = LayoutInflater.from(context)
        return dynamicColorApplyLayoutInflater.inflate(R.layout.fragment_main, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

    }

}
```

`framgnet_main.xml`はこんな感じね。

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:orientation="vertical"
    android:layout_height="match_parent">

    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_margin="10dp"
        android:text="Fragment Button" />

    <Button
        style="@style/Widget.Material3.Button.OutlinedButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_margin="10dp"
        android:text="Fragment Outlined Button" />

</LinearLayout>
```
あとは、Fragmentを置くActivityの`android:theme`を`@style/Theme.Material3.DayNight`にします。なんなら`setContentView()`の前に`setTheme()`してもいいです。

`AndroidManifest.xml`

```xml
<activity
    android:name=".MainActivity"
    android:exported="true"
    android:theme="@style/Theme.Material3.DayNight">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

`MainActivity.kt`

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_main)

    }
}
```

`activity_main.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    tools:context=".MainActivity">

    <androidx.fragment.app.FragmentContainerView
        android:id="@+id/fragmentContainerView"
        android:name="io.github.takusan23.materialyousample.MainFragment"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</LinearLayout>
```

## 動的に生成したViewに動的テーマを適用する
Material YouをViewで使う。

この場合でも、`Activity`に`android:theme`で`@style/Theme.Material3.DayNight`を指定しておく必要があります。

`AndroidManifest.xml`

```xml
<activity
    android:name=".MainActivity"
    android:exported="true"
    android:theme="@style/Theme.Material3.DayNight">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

`View`の第一引数に渡す`Context`に`DynamicColors.wrapContextIfAvailable(context)`の戻り値を指定します。  

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val context = DynamicColors.wrapContextIfAvailable(this)
        val dynamicColorButton = MaterialButton(context).apply {
            layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
            text = "動的テーマ + 動的生成View"
        }
        setContentView(dynamicColorButton)

    }
}
```

# おわりに

![Imgur](https://imgur.com/rF6V5LB.png)

サンプルコード置いておきますね。

https://github.com/takusan23/MaterialYouSample