---
title: Hello Android 12。スプラッシュスクリーン無効化？編
created_at: 2021-10-10
tags:
- Android
- Android12
---
どうもこんにちは。  

- スプラッシュスクリーンガチアンチ
- 既存のスプラッシュスクリーンから移行できない（クロスプラットフォームなどで）
- **電話アプリ（特に着信）、QRコードに限らず決済アプリ、カメラアプリ などの応答性が必要なアプリ** で、ユーザーに「スプラッシュスクリーンなんて見せなくていいから早く起動しろよ！」と思われてしまう可能性がある方

そんな方へ捧げる。

# 答え

**！公式で文書化されているわけじゃないので気をつけてください！**

`AndroidManifest.xml`の`<application>`タグの`theme`に指定しているテーマに、  
`<item name="android:windowIsTranslucent">true</item>`を追加して、半透明なActivityとして認識させます。  
（実際に半透明にするためにはまだ手を加える必要があるので、これを追記したところで半透明にはならない）  

以下例です。

`src/main/res/values/themes.xml`

```xml
<resources xmlns:tools="http://schemas.android.com/tools">
    <!-- Base application theme. -->
    <style name="Theme.Android12DisableSplashScreen" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
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
        <!-- これ -->
        <item name="android:windowIsTranslucent">true</item>
        <!-- Customize your theme here. -->
    </style>
</resources>
```

## 既存のテーマ/ Activity に変更入れたくない or 既存のスプラッシュスクリーン用Activityがある場合は

新しくスプラッシュスクリーンを無効にしたテーマを書きます。

```xml
<resources xmlns:tools="http://schemas.android.com/tools">
    <!-- Base application theme. -->
    <style name="Theme.Android12DisableSplashScreen" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
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

    <!-- これ -->
    <style name="Theme.DisableSplashScreen" parent="Theme.Android12DisableSplashScreen">
        <item name="android:windowIsTranslucent">true</item>
    </style>

</resources>
```

次にアプリを起動したときに`MainActivity`の代わりに表示する`Activity`を作成します。  
もう既にスプラッシュスクリーン用Activityがある場合はそれを使ってもいいです。    
このActivityを経由して`MainActivity`を表示させます。

```kotlin
class TransparentActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        startActivity(Intent(this, MainActivity::class.java))
        // Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK は使えない
        finish()

    }
}
```

そしたら、`AndroidManifest`をこうです

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="io.github.takusan23.android12disablesplashscreen">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Android12DisableSplashScreen">
        
        <activity
            android:name=".TransparentActivity"
            android:exported="true"
            android:theme="@style/Theme.DisableSplashScreen">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />

                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <activity
            android:name=".MainActivity"
            android:exported="true" />
        
    </application>

</manifest>
```

## その他、なにもないスプラッシュスクリーンでごまかす編

前書いたのでそっち見てください： [Hello Android 12。スプラッシュスクリーン編](/posts/android_12_splashscreen/)

# なんで消せるの？
`AOSP`追いかけます。Code Searchでもブランチ`android-12.0.0-r1`が選べるようになっているので読めます。

多分間違えてると思うんでこっから先読まなくていいと思います。

`Window_windowSplashScreenAnimatedIcon`で検索をかけます。`SplashscreenContentDrawer.java`が引っかかります。  
このクラスの`createContentView()`がスプラッシュスクリーンを返してそうですね。このメソッドを読んでる部分を探します。  
↓  
`StartingSurfaceDrawer.java`の`addSplashScreenStartingWindow()`メソッドの中で呼んでますね。でも条件分岐とか見てもそれっぽい事書いてないですね。  
というわけでこのメソッドを読んでる部分を探します。  
↓  
`StartingWindowController.java`の`addStartingWindow()`の中で呼んでますね。  
ここの`isSplashScreenType()`ってのがもしかしたら...!って思いましたが、違うみたいです。それじゃどっから呼ばれてるか探します。  
↓  
多分`ShellTaskOrganizer.java`の`addStartingWindow()`ですかね。  
そしてこれは  
↓  
`TaskOrganizer.java`の`ITaskOrganizer`の`addStartingWindow()`で呼んでます。間違ってるかもしれん。  
そして
↓  
`TaskOrganizerController.java`の`TaskOrganizerCallbacks`の`addStartingWindow()`で呼んでますね。ここに`theme`がなんとかって書いてありますが多分違います。  
そてしてこれは  
↓  
`TaskOrganizerController.java`の`TaskOrganizerState`の`addStartingWindow()`で呼んでますね。  
そして  
↓  
`TaskOrganizerController.java`の`TaskOrganizerController`の`addStartingWindow()`で呼んでますね。  
それっぽいことは書いてないなあというわけで読んでる部分を探し  
↓  
`StartingSurfaceController.java`の`createSplashScreenStatingSurface()`で呼んでますね。  
そーしーてー  
↓  
`SplashScreenStartingData.java`の`createStartingSurface()`で呼んでますね。  
そろそろ終わりかな？  
↓  
`ActivityRecord.java`の`AddStartingWindow`の`run()`の中で呼んでますね。  
それっぽい処理はないので読んでる部分を探します  
↓  
`ActivityRecord.java`で`AddStartingWindow`のインスタンスを作成してるみたいです。  
↓  
`ActivityRecord.java`の`scheduleAddStartingWindow()`で`AddStartingWindow`にある`run()`メソッドを呼んでるみたいです。  
↓  
`ActivityRecord.java`の`addStartingWindow()`に、それっぽい記述がありますよ？  

```java
// Original theme can be 0 if developer doesn't request any theme. So if resolved theme is 0
// but original theme is not 0, means this package doesn't want a starting window.
if (resolvedTheme == 0 && theme != 0) {
    return false;
}
```

`resolvedTheme`と`theme`が気になりますのでもう少し読み進めてみる。  
↓  
`ActivityRecord.java`の`showStartingWindow()`で呼んでますね。  

```java
final int resolvedTheme = evaluateStartingWindowTheme(prev, packageName, theme, splashScreenTheme);
```

`evaluateStartingWindowTheme()`を見る。

```java
    /**
     * Evaluate the theme for a starting window.
     * @param prev Previous activity which may have a starting window.
     * @param originalTheme The original theme which read from activity or application.
     * @param replaceTheme The replace theme which requested from starter.
     * @return Resolved theme.
     */
    private int evaluateStartingWindowTheme(ActivityRecord prev, String pkg, int originalTheme, int replaceTheme) {
    // Skip if the package doesn't want a starting window.
    if (!validateStartingWindowTheme(prev, pkg, originalTheme)) {
        return 0;
    }

    // 省略
```

`validateStartingWindowTheme()`が気になる  

↓  

```java
private boolean validateStartingWindowTheme(ActivityRecord prev, String pkg, int theme) {
    // If this is a translucent window, then don't show a starting window -- the current
    // effect (a full-screen opaque starting window that fades away to the real contents
    // when it is ready) does not work for this.
    if (com.android.server.wm.ProtoLogCache.WM_DEBUG_STARTING_WINDOW_enabled) { long protoLogParam0 = theme; com.android.internal.protolog.ProtoLogImpl.v(WM_DEBUG_STARTING_WINDOW, -1782453012, 1, null, protoLogParam0); }
    if (theme == 0) {
        return false;
    }
    final AttributeCache.Entry ent = AttributeCache.instance().get(pkg, theme,
            com.android.internal.R.styleable.Window, mWmService.mCurrentUserId);
    if (ent == null) {
        // Whoops!  App doesn't exist. Um. Okay. We'll just pretend like we didn't
        // see that.
        return false;
    }
    final boolean windowIsTranslucent = ent.array.getBoolean(
            com.android.internal.R.styleable.Window_windowIsTranslucent, false);
    final boolean windowIsFloating = ent.array.getBoolean(
            com.android.internal.R.styleable.Window_windowIsFloating, false);
    final boolean windowShowWallpaper = ent.array.getBoolean(
            com.android.internal.R.styleable.Window_windowShowWallpaper, false);
    final boolean windowDisableStarting = ent.array.getBoolean(
            com.android.internal.R.styleable.Window_windowDisablePreview, false);
    if (com.android.server.wm.ProtoLogCache.WM_DEBUG_STARTING_WINDOW_enabled) { String protoLogParam0 = String.valueOf(windowIsTranslucent); String protoLogParam1 = String.valueOf(windowIsFloating); String protoLogParam2 = String.valueOf(windowShowWallpaper); String protoLogParam3 = String.valueOf(windowDisableStarting); com.android.internal.protolog.ProtoLogImpl.v(WM_DEBUG_STARTING_WINDOW, -124316973, 0, null, protoLogParam0, protoLogParam1, protoLogParam2, protoLogParam3); }

    // If this activity is launched from system surface, ignore windowDisableStarting
    if (windowIsTranslucent || windowIsFloating) {
        return false;
    }
```

見つけたぞ！！！

`if (windowIsTranslucent || windowIsFloating)` ← 多分ここが true がになってこの関数の返り値がfalseになる。
