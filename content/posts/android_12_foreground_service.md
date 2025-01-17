---
title: Hello Android12。フォアグラウンドサービス編
created_at: 2021-02-21
tags:
- Android12
- Kotlin
- Android
---

お一人様インスタンス作ってみたい（タイトル全然関係なくてあれ）

# 本題
`Context#startForegroundService()`に制限が追加された模様。  
ので検証してみる

# 環境
| なまえ  | あたい     |
|---------|------------|
| Android | 12 DP 1    |
| スマホ  | Pixel 3 XL |

# フォアグラウンドサービスの開始制限 #とは
アプリがバックグラウンドな状態の時に`Context#startForegroundService()`が呼べなくなった模様。  

## アプリがバックグラウンド の定義
どの状態のことを言っているのかというとここに書いてある→ https://developer.android.com/guide/background#definition


# 確かめる

Android 12 を対象にします

`app/build.gradle`

```gradle
android {
    compileSdkVersion "android-S"
    buildToolsVersion "30.0.3"

    defaultConfig {
        applicationId "io.github.takusan23.backgroundstartforegroundservice"
        minSdkVersion "S"
        targetSdkVersion "S"
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

## AndroidManifest.xml

フォアグラウンドサービス利用権限が必要です（インターネット権限並に書き忘れるやつ）

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="io.github.takusan23.backgroundstartforegroundservice">

    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.BackgroundStartForegroundService">

        <service android:name=".ExampleService" />

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />

                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

## MainActivity.kt

サービスを起動するコードだけ。バックグラウンドに行ったことを検知するため`onStop()`に書く

```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }

    /** バッググラウンド判定 */
    override fun onStop() {
        super.onStop()
        Toast.makeText(this, "onStop", Toast.LENGTH_SHORT).show()
        Timer().schedule(5000) {
            runOnUiThread {
                Toast.makeText(this@MainActivity, "Start service", Toast.LENGTH_SHORT).show()
                startForegroundService(Intent(this@MainActivity, ExampleService::class.java))
            }
        }
    }
}
```

## ExampleService.kt

特に何もしませんが

```kotlin
class ExampleService : Service() {

    /** 通知チャンネル追加で使う */
    private val notificationManager by lazy { getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        postNotification()
        return START_NOT_STICKY
    }

    override fun onBind(p0: Intent?): IBinder? {
        return null
    }

    /** フォアグラウンド開始 */
    private fun postNotification() {
        val notificationChannelId = "test_notification"
        if (notificationManager.getNotificationChannel(notificationChannelId) == null) {
            // 通知チャンネル登録
            val channel = NotificationChannel(notificationChannelId, "通知テスト", NotificationManager.IMPORTANCE_LOW)
            notificationManager.createNotificationChannel(channel)
        }
        val notification = Notification.Builder(this, notificationChannelId).apply {
            setContentTitle("サービス起動中")
            setContentText("サービス起動テスト")
            setSmallIcon(R.drawable.ic_outline_textsms_24)
        }.build()
        startForeground(1, notification)
    }

}
```

# 実行してみる

起動する→アプリから離れる→5秒待つと？

```
java.lang.IllegalStateException: startForegroundService() not allowed due to mAllowStartForeground false: service io.github.takusan23.backgroundstartforegroundservice/.ExampleService
```

起動しない。あと通知も飛んでくる

![Imgur](https://i.imgur.com/lM5rVxJ.png)

# その他、フォアグラウンドサービスの仕様変更
`Context#startForeground()`を呼んでも10秒間は通知を出さずにサービスを起動しておけるらしい。  
ただし、以下の条件に一個でも当てはまるとすぐに通知が出るようになる。

- 通知にボタンがある

```kotlin
val notification = Notification.Builder(this, notificationChannelId).apply {
    setContentTitle("サービス起動中")
    setContentText("サービス起動テスト")
    setSmallIcon(R.drawable.ic_outline_textsms_24)
    addAction(Notification.Action.Builder(Icon.createWithResource(this@ExampleService, R.drawable.ic_outline_textsms_24), "ボタン", null).build())
}.build()
```

- `foregroundServiceType`が`connectedDevice`、`mediaPlayback`、`mediaProjection`、`phoneCall` のとき

```xml
<service android:name=".ExampleService" android:foregroundServiceType="mediaProjection" />
```

- 通知作成時に ~~setShowForegroundImmediately(true)~~ `setForegroundServiceBehavior(Notification.FOREGROUND_SERVICE_IMMEDIATE)`を指定した

```kotlin
val notification = Notification.Builder(this, notificationChannelId).apply {
    setContentTitle("サービス起動中")
    setContentText("サービス起動テスト")
    setSmallIcon(R.drawable.ic_outline_textsms_24)
    setForegroundServiceBehavior(Notification.FOREGROUND_SERVICE_IMMEDIATE) // これ
}.build()
```

これに当てはまらなければ`Service#startForeground()`を呼んだ後10秒間は通知が表示されずにサービスを実行できます

# おわりに
間違ってたらすいません

`startActivity()`の制限の次は`startForegroundService()`がやられるのか