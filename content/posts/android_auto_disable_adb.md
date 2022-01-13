---
title: 銀行系アプリにあるUSBデバッグ有効時に起動しない問題に終止符を打つ
created_at: 2021-10-04
tags:
- Android
- Kotlin
---
どうもこんばんわ。  
Android 12、そろそろ正式リリースだと思うんですけど まーだ時間かかりそうですかねー

# 本題
![Imgur](https://imgur.com/qRAmIBt.png)

`rootアクセス`があるとか、`ブートローダーがアンロック`されているとかならわかるんだけど、  
なんで`USBデバッグ`ついてるとだめなんや（**多分adb経由で画面録画とかができるのでそれのせい**）

## 一時的にオフにすればいいじゃん
USBデバッグをOFFにするのって結構めんどいんだよね。  
しかもONにするの忘れてるとか。ウィジェットを作ってUSBデバッグを有効、無効にするアプリとかクイック設定から変更できるようにしても良かったけどなんかなぁ。

# だから作った
(600KBのGIFですのでモバイルデータの方ごめんね)

![Imgur](https://imgur.com/63c7UZt.gif)

真っ暗の画面になってるのは、銀行系アプリが画面録画とかスクリーンショットを禁止しているせいです。  
USBデバッグをOFFにしろってダイアログが出てないのでそれが証拠になるかと。

# 仕組み

USBデバッグをOFFにする  
↓  
USBデバッグをONにしてると怒られるアプリをIntent経由で起動   
↓  
アプリが終了(`Activity Result API (onActivityResult)` / `onDestroy`)したらUSBデバッグをONに戻す。

# ソースコード

```kotlin
/**
 * pm grant io.github.takusan23.usbdebugautohide android.permission.WRITE_SECURE_SETTINGS
 * */
class MainActivity : AppCompatActivity() {


    private val PACKAGE_NAME = "jp.co.smbc.direct"
    private val activityCloseCallback = registerForActivityResult(ActivityClose()) {
        // アプリ終了時にUSBデバッグをONに戻す
        Settings.Global.putLong(contentResolver, Settings.Global.ADB_ENABLED, 1)
        // バックキーで戻ってきたらここに来る。アプリ閉じる
        finishAndRemoveTask()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // SMBC起動前にUSBデバッグをOFF
        Settings.Global.putLong(contentResolver, Settings.Global.ADB_ENABLED, 0)

        // USBデバッグを無効にしないといけないアプリを起動
        val launchIntent = packageManager.getLaunchIntentForPackage(PACKAGE_NAME)
        launchIntent?.flags = 0 // 勝手に Intent.FLAG_ACTIVITY_NEW_TASK を指定するので消す
        activityCloseCallback.launch(launchIntent)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(Intent(this, USBDebugAutoOnService::class.java))
        } else {
            startService(Intent(this, USBDebugAutoOnService::class.java))
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopService(Intent(this, USBDebugAutoOnService::class.java))
    }

}

class USBDebugAutoOnService : Service() {

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "usbdebug_auto_on"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            notificationManager.createNotificationChannel(NotificationChannel(channelId, "USBデバックを戻すサービス", NotificationManager.IMPORTANCE_LOW))
        }
        val notification = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, channelId)
        } else {
            Notification.Builder(this)
        }.apply {
            setContentText("USBデバックを戻すサービス")
            setContentTitle("アプリが終了したらUSBデバッグが有効になります")
            setSmallIcon(R.drawable.ic_launcher_background).build()
        }.build()

        startForeground(1, notification)
        return START_NOT_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        println("アプリ終了")
        Settings.Global.putLong(contentResolver, Settings.Global.ADB_ENABLED, 1)
    }

    override fun onBind(p0: Intent?): IBinder? {
        return null;
    }

}

class ActivityClose : ActivityResultContract<Intent, Unit>() {
    override fun createIntent(context: Context, input: Intent): Intent {
        // launch()のIntentがinput
        return input
    }

    override fun parseResult(resultCode: Int, intent: Intent?) {
        // とくになし
    }
}
```

使う権限は以下の２つです。

```xml
<uses-permission android:name="android.permission.WRITE_SECURE_SETTINGS" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

# USBデバッグをアプリから有効、無効にする
には、`WRITE_SECURE_SETTINGS`が必要なのですが、これはサードパーティアプリには開放されていません。  
しかし何故か`pm grant <パッケージ名> android.permission.WRITE_SECURE_SETTINGS`を実行すると権限を付与することが出来ます。YATTA YATTA

権限がゲットできればこっちのもんです。

```kotlin
// USBデバッグをON
Settings.Global.putLong(contentResolver, Settings.Global.ADB_ENABLED, 1)

// USBデバッグをOFF
Settings.Global.putLong(contentResolver, Settings.Global.ADB_ENABLED, 0)
```

# アプリの終了検知
バックキーで戻ってきたときのために、`Activity Result API (onActivityResult)`でを使います。  

それとは別に、アプリ履歴画面から終了した際のために`onDestroy`も使います。  

## じゃあなんでサービス起動してるの？
`startForegroundService`でフォアグラウンドサービスを起動してるわけですが、その理由は`onDestory`で`USBデバッグをON`に戻せなかったからです。  
でもなんかサービスを終了させる`stopService`だけうまく動いたので、サービス側で戻すようにしました。`onDestroy`、まじで謎  

なんかフォアグラウンドサービス起動中ならアプリ履歴画面から終了させても`onDestroy`でUSBデバッグを有効にできる？

## registerForActivityResult の引数を自作する

上記の`ActivityClose`クラスのことですね。`ActivityResultContract`を継承して、`ジェネリクス`の１個目の型は、画面遷移をする関数、`launch()`に渡す値の型です。今回はIntentを渡すので`Intent`です。  
２個目の型はコールバック時に返す値です。ここでは特に何も返さないので`Unit`です。  

それから2つ関数がありますが、`createIntent`に関しては`引数のIntent`をそのままreturnして、`parseResult`では特に何もしません。

# ソースコードです

なお、`WRITE_SECURE_SETTINGS`の権限があるかのチェックはしてないので、インストールしたら、以下のコマンドを実行して権限を付与してあげてください。（よって初回起動時は強制クラッシュします）

```
pm grant io.github.takusan23.usbdebugautohide android.permission.WRITE_SECURE_SETTINGS
```

https://github.com/takusan23/USBDebugAutoHide

# おわりに
https://github.com/takusan23/DeveloperHide

アプリ書きました。そのうちPlayストアに出したい

提出はした、審査が通るかは知らんけど：https://play.google.com/store/apps/details?id=io.github.takusan23.developerhide