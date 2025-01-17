---
title: Hello Android12。スプラッシュスクリーン編
created_at: 2021-07-16
tags:
- Android
- Android12
- SplashScreen
---
どうもこんばんわ。Androidにスプラッシュスクリーンっていらねえよなぁ  
iOS版もリリースしていてiOSと同じにしてください！みたいなことがない限りいらないと思う。

# 本題
Android 12からアプリ起動時にスプラッシュスクリーンが無条件で追加される模様。  
カメラを起動するときはスプラッシュスクリーン出ないけど、多分あれ真っ暗の背景色を指定してるんだと思う。  
**なお、独自でスプラッシュスクリーンを実装している場合は二連続でスプラッシュスクリーンが出ます。**  

# 環境
| なまえ  | あたい    |
|---------|-----------|
| Android | 12 Beta 3 |
| Pixel   | 3 XL      |

# ドキュメントです
https://developer.android.com/about/versions/12/features/splash-screen

# とりあえず
Android 12をターゲットにします。SDK Managerを起動してAndroid 12のSDKを入れて、`app/build.gradle`を開いて、以下を変えます。

```gradle
android {
    compileSdk 31 // ここを31
    buildToolsVersion "30.0.3"

    defaultConfig {
        applicationId "io.github.takusan23.splashscreen"
        minSdk 21
        targetSdk 31 // ここを31
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

# 無効化する方法はない？
ちらっと見た感じなさそう。

代わりに、
- スプラッシュスクリーンの背景色
    - 透明を指定
- Adaptive Iconの背景色
    - 透明を指定
- Adaptive Iconの前面画像
    - なにもないDrawableを作成して指定

よく調べてないのであとは頼んだ。

## なにもないDrawableを作る
適当に中身のないDrawableを作ればいいと思います。  
こっから作成できます

![Imgur](https://i.imgur.com/8oSywlA.png)

中身は空っぽで

```xml
<?xml version="1.0" encoding="utf-8"?>
<selector xmlns:android="http://schemas.android.com/apk/res/android">

</selector>
```

## themes.xml

次に`src/main/res/values/themes.xml`を開いて書き足します

```xml
<resources xmlns:tools="http://schemas.android.com/tools">
    <!-- Base application theme. -->

    <style name="Theme.SplashScreen" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
        <!-- Primary brand color. -->
        <item name="colorPrimary">@color/purple_500</item>
        <item name="colorPrimaryVariant">@color/purple_700</item>
        <item name="colorOnPrimary">@color/white</item>
        <!-- Secondary brand color. -->
        <item name="colorSecondary">@color/teal_200</item>
        <item name="colorSecondaryVariant">@color/teal_700</item>
        <item name="colorOnSecondary">@color/black</item>
        <!-- Status bar color. -->
        <item name="android:statusBarColor" tools:targetApi="l">?attr/colorPrimaryVariant</item>

        <!-- こっから三行 -->
        <item name="android:windowSplashScreenBackground">@android:color/transparent</item>
        <item name="android:windowSplashScreenIconBackgroundColor">@android:color/transparent</item>
        <item name="android:windowSplashScreenAnimatedIcon">@drawable/empty_drawable</item>

        <!-- Customize your theme here. -->
    </style>
</resources>
```

`src/main/res/values-night/themes.xml`も書き換えましょう。ダークモード時の挙動です

```xml
<resources xmlns:tools="http://schemas.android.com/tools">
    <!-- Base application theme. -->
    <style name="Theme.SplashScreen" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
        <!-- Primary brand color. -->
        <item name="colorPrimary">@color/purple_200</item>
        <item name="colorPrimaryVariant">@color/purple_700</item>
        <item name="colorOnPrimary">@color/black</item>
        <!-- Secondary brand color. -->
        <item name="colorSecondary">@color/teal_200</item>
        <item name="colorSecondaryVariant">@color/teal_200</item>
        <item name="colorOnSecondary">@color/black</item>
        <!-- Status bar color. -->
        <item name="android:statusBarColor" tools:targetApi="l">?attr/colorPrimaryVariant</item>
        <!-- Customize your theme here. -->

        <!-- こっから三行 -->
        <item name="android:windowSplashScreenBackground">@android:color/transparent</item>
        <item name="android:windowSplashScreenIconBackgroundColor">@android:color/transparent</item>
        <item name="android:windowSplashScreenAnimatedIcon">@drawable/empty_drawable</item>

    </style>
</resources>
```

これで見た感じ今まで通りの挙動になると思います。

# Android 6までならバックポートのライブラリで対応できます
これを使うことでAndroid 6(API 23 / マシュマロ)までさかのぼってスプラッシュスクリーンを追加できます。

まず`app/build.gradle`を開き、`compileSdk`を`31`にする必要があるみたいです。KDoc見れば作れるってGoogle言ってたのにこんな事書いてないぞ！嘘つき！  
参考：https://dev.to/tkuenneth/a-peek-inside-jetpack-core-splashscreen-odo

そしたらライブラリを書き足します。

```gradle
plugins {
    id 'com.android.application'
    id 'kotlin-android'
}

android {
    compileSdk 31
    buildToolsVersion "30.0.3"

    defaultConfig {
        applicationId "io.github.takusan23.splashscreenbackport"
        minSdk 23
        targetSdk 30
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

dependencies {
    // これ
    implementation "androidx.core:core-splashscreen:1.0.0-alpha01"

    implementation 'androidx.core:core-ktx:1.6.0'
    implementation 'androidx.appcompat:appcompat:1.3.0'
    implementation 'com.google.android.material:material:1.4.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.0.4'
    testImplementation 'junit:junit:4.+'
    androidTestImplementation 'androidx.test.ext:junit:1.1.3'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.4.0'
}
```

そしたら次は`themes.xml`を開き、スプラッシュスクリーン時のテーマを定義します。

```xml
<!-- Base application theme. -->
<style name="Theme.SplashScreenBackport" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
    <!-- Primary brand color. -->
    <item name="colorPrimary">@color/purple_500</item>
    <item name="colorPrimaryVariant">@color/purple_700</item>
    <item name="colorOnPrimary">@color/white</item>
    <!-- Secondary brand color. -->
    <item name="colorSecondary">@color/teal_200</item>
    <item name="colorSecondaryVariant">@color/teal_700</item>
    <item name="colorOnSecondary">@color/black</item>
    <!-- Status bar color. -->
    <item name="android:statusBarColor" tools:targetApi="l">?attr/colorPrimaryVariant</item>
    <!-- Customize your theme here. -->
</style>

<style name="Theme.OriginalSplashScreen" parent="Theme.SplashScreen">
    <!-- アイコン -->
    <item name="windowSplashScreenAnimatedIcon">@mipmap/ic_launcher</item>
    <!-- スプラッシュスクリーン後のテーマ。今までAndroidManifestで指定してたテーマね -->
    <item name="postSplashScreenTheme">@style/Theme.SplashScreenBackport</item>
</style>
```

次に、`AndroidManifest.xml`を開き`application`要素の`theme`属性を`Theme.OriginalSplashScreen`に変更します。

```xml
<application
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:supportsRtl="true"
    android:theme="@style/Theme.OriginalSplashScreen">
    <activity
        android:name=".MainActivity"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
    </activity>
</application>
```

最後に、`MainActivity.kt`を開き`installSplashScreen()`を呼んだあとに`setContentView()`するように書き換えます。

```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        installSplashScreen()

        setContentView(R.layout.activity_main)

    }

}
```

これでスプラッシュスクリーンがバックポートされました。

# 終わりに
GmailとかGoogle Driveにはアニメーション付きスプラッシュスクリーンが実装されたそうですが、あれアニメーション見せるのが目的になってない？  
アニメーションなんていらんからはよ本題行ってくれってお気持ち。

仕様なのかBetaだからなのかは知りませんが、ランチャー以外からアプリを起動するとスプラッシュスクリーン出ないんだけど？