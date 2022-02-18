---
title: Hello Android 13。ダイナミックカラーのアイコン編 (Android 12もあるよ)
created_at: 2022-02-18
tags:
- Android
- Kotlin
- Android13
- Android12
---
どうもこんばんわ。  
友だちから恋びとへ 攻略しました。

![Imgur](https://imgur.com/fIZi2Wu.png)

この手のゲームは`ヒロイン+サブヒロイン`とかで大体サブヒロインは攻略できない系が多いんだけど今回はふたりとも攻略できる！！！

![Imgur](https://imgur.com/JsGTljv.png)

# 本題
Android 13 Developer Preview が出てた！  
この中から簡単に使えそうな新機能を一つ（というかまだ全然ない）

## Material You なアイコンが作れるようになった
一部のシステムアイコンはアイコンの色に壁紙の色をつけてくれるのですが、これがサードパーティーアプリにも開放されました。  
(なんでこれAndroid 12に入れなかったんだ？monetがAOSP入りしなかったから？)

![Imgur](https://imgur.com/4Q3em8N.png)

EZWebが終わる今、きせかえツールのような機能が追加されるとは

## こうしき

https://developer.android.com/about/versions/13/features#themed-app-icons

## 作り方

### app/build.gradle

`Tiramisu`を指定します。お菓子のコードネームだ！！  
SDK入っていない場合は右上にある`SDK Manager`から入れましょう。

![Imgur](https://imgur.com/JWDLgmJ.png)

そしてこうです

```java
android {
    compileSdkPreview "Tiramisu"

    defaultConfig {
        applicationId "io.github.takusan23.dynamiccoloricon"
        minSdkPreview "Tiramisu"
        targetSdkPreview "Tiramisu"
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = '1.8'
    }
}
```

## Adaptive Iconのファイルを開き

- `mipmap-anydpi-v26/ic_launcher_round.xml`
- `mipmap-anydpi-v26/ic_launcher.xml`

を開いて、それぞれ`<monochrome android:drawable="アイコンのベクター画像" />`の一行を書き足します

```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
    <!-- ↓ これ -->
    <monochrome android:drawable="@drawable/ic_launcher_foreground" /> 
</adaptive-icon>
```

基本的には通知に使ってるアイコンが使えると思います（ってGoogleが言ってた）

以上です。

# 全員が全員 Android 13 使ってると思うなよ
元ネタ：全員が全員iPhone使ってると思うなよ

Androidには`activity-alias`と`PackageManager#setComponentEnabledSetting`で予め用意しておいたアイコンを切り替えることができるみたい。  
(動的にアイコンの画像を差し替えるとかは出来ないと思う。もしやりたければ`ShortcutManager#requestPinShortcut`でショートカットを作るといい)

## 動的にアイコンを切り替えられるみたい

参照：  

https://qiita.com/temoki/items/3fa4acc0a897bbbbbc8f

## テーマアイコン用のAdaptive Iconを用意する

`src/main/res/`の中に`mipmap-anydpi-v31`を作成して

- `ic_launcher_dynamic_color.xml`
- `ic_launcher_round_dynamic_color.xml`

の2つを作成して、ファイルの中身はこれです。（中身一緒だから一つでも良かったですね）

```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@android:color/system_accent2_100" />
    <foreground android:drawable="@drawable/ic_launcher_foreground_dynamic_color" />
</adaptive-icon>
```

![Imgur](https://imgur.com/BYkzZUP.png)

また、`@drawable/ic_launcher_foreground_dynamic_color`が無いので作ります。  
`drawable`の中に`ic_launcher_foreground_dynamic_color.xml`で作りましょう。  

ファイルの中身は皆さんのAdaptive Iconの`foreground`で指定してる`xml`をそのまま使えると思います。  
というわけで`launcher_foreground.xml`をコピーして、`android:tint="@android:color/system_accent2_700"`を足します。

```xml
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:aapt="http://schemas.android.com/aapt"
    android:width="108dp"
    android:height="108dp"
    android:tint="@android:color/system_accent2_700"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- 省略... -->
</vector>
```

## AndroidManifest.xml にテーマアイコン用の <activity-alias>　を書き足す

以下のように書き足します

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="io.github.takusan23.android12dynamicicon">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Android12DynamicIcon">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />

                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- これを書き足す -->
        <activity-alias
            android:name=".MainActivity_dynamic_icon"
            android:enabled="true"
            android:exported="true"
            android:icon="@mipmap/ic_launcher_dynamic_color"
            android:label="@string/app_name"
            android:roundIcon="@mipmap/ic_launcher_round_dynamic_color"
            android:targetActivity=".MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />

                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity-alias>

    </application>

</manifest>
```

## コードを書く

### activity_main.xml
切り替えスイッチをおきます

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <com.google.android.material.switchmaterial.SwitchMaterial
        android:id="@+id/enable_theme_icon"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="テーマアイコンに切り替える"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

### MainActivity.kt

スイッチの初期値設定とスイッチを切り替えたときに`<activity-alias>`へ切り替える関数があります。

```kotlin
class MainActivity : AppCompatActivity() {

    /** 切り替えスイッチ */
    private val themeIconSwitch by lazy { findViewById<SwitchMaterial>(R.id.enable_theme_icon) }

    /** デフォ ComponentName */
    private val defaultComponentName by lazy { ComponentName(packageName, "${packageName}.MainActivity") }

    /** テーマアイコンにした ComponentName */
    private val themeIconComponentName by lazy { ComponentName(packageName, "${packageName}.MainActivity_dynamic_icon") }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 今の状態をスイッチに入れる
        themeIconSwitch.isChecked = !isDefaultIcon()
        // 切り替えたらアイコンも切り替える
        themeIconSwitch.setOnCheckedChangeListener { buttonView, isChecked ->
            setThemeIcon(isChecked)
        }

    }

    /** デフォアイコンの場合はtrue */
    private fun isDefaultIcon(): Boolean {
        return packageManager.getComponentEnabledSetting(defaultComponentName).let {
            it == PackageManager.COMPONENT_ENABLED_STATE_DEFAULT || it == PackageManager.COMPONENT_ENABLED_STATE_ENABLED
        }
    }

    /**
     * テーマアイコンを適用するか
     *
     * @param isEnable テーマアイコンならtrue、デフォアイコンならfase
     * */
    private fun setThemeIcon(isEnable: Boolean) {
        // Android 12 以降のみ
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            packageManager.setComponentEnabledSetting(
                if (isEnable) themeIconComponentName else defaultComponentName,
                PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                PackageManager.DONT_KILL_APP)
            packageManager.setComponentEnabledSetting(
                if (!isEnable) themeIconComponentName else defaultComponentName,
                PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                PackageManager.DONT_KILL_APP)
        }
    }
}
```

これで動くはず

![Imgur](https://imgur.com/BGCaO9e.png)

![Imgur](https://imgur.com/UtfBON1.png)

### メモ
有効状態だと`MainActivity`を指したIntentを解決出来なくなり、Android Studioから実行してもActivityが存在しないエラーが発生します。  
気をつけてね。

## そーすこーど

https://github.com/takusan23/Android12DynamicIcon

# おわりに
Engaged日本版終わるの悲しい...？  
過去の記事も読めなくなるのか辛いね...