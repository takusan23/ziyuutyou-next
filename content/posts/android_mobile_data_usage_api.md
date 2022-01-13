---
title: Android10以降でもモバイルデータ利用量を取得する
created_at: 2021-02-06
tags:
- Android
- Kotlin
---

20GBまでのプランがMNO4社とも出揃いましたね。MNOの割に安い

# 本題
Androidで通信量を取得したい。

## AOSPの通信量を表示する設定項目を見てみる

興味なければ[#モバイルデータ利用量を取得するメソッド](#モバイルデータ利用量を取得するメソッド)まで飛ばしてもいいよ。読んでもいいけど

Androidの設定アプリのソースコードを追いかけて、通信量を表示している部分を見つけます。

AOSPミラーGitHub：https://github.com/aosp-mirror/platform_packages_apps_settings

## どこにあるの？
日本語のローカライズで使う`string.xml`を開いて、そこからモバイルデータ利用量を表示している設定で使ってる文字列を探す。  
見つけたらそのname属性の値を使って検索をかければ見つけられると思う。

とりあえずそれっぽいのを見つけたのでこれで検索をかける

```xml
<string name="cell_data_warning" msgid="5664921950473359634">"警告するデータ使用量: <xliff:g id="ID_1">^1</xliff:g>"</string>
````

これで検索をかけると、`DataUsageSummaryPreferenceController.java`ってのにたどり着きます

そしたら、モバイルデータ利用量に関係してそうな部分を探します。こことかどうでしょう？

```java
summaryPreference.setUsageNumbers(displayUsageLevel(usageLevel),
/* dataPlanSize */ -1L,
/* hasMobileData */ true);
```

`usageLevel`ってのはどこから来てるかというと、

```java
mDataUsageController = new DataUsageController(context);

// 省略

final DataUsageController.DataUsageInfo info =
mDataUsageController.getDataUsageInfo(mDefaultTemplate);
long usageLevel = info.usageLevel;
```

`DataUsageController`ってのから取得しているそうですので、`DataUsageController`を探します。

ところが、`DataUsageController`が見つかりません。   
しゃーないのでGoogleで検索をすると`platform_frameworks_base/blob/master/packages/SettingsLib/src/com/android/settingslib/net/DataUsageController.java`だそうです。

`DataUsageController.java`を開き、`getDataUsageInfo()`を探します。ありました。もうゴールは近い

```java
public DataUsageInfo getDataUsageInfo(NetworkTemplate template) {
    // 省略
    final long totalBytes = getUsageLevel(template, start, end);
    // 省略
}
```

`DataUsageController#getUsageLevel`を見ます  

```java
final Bucket bucket = mNetworkStatsManager.querySummaryForDevice(template, start, end);
if (bucket != null) {
    return bucket.getRxBytes() + bucket.getTxBytes();
}
```

ここで使っている`querySummaryForDevice`は、`@hide`されているので使えませんが、`@hide`のついていない`querySummaryForDevice`もありました。

# モバイルデータ利用量を取得するメソッド
`クラス名#メソッド名`みたいに`#`で区切る書き方があってるのかどうかは知らない [^1]
```
NetworkStatsManager#querySummaryForDevice(
    int networkType, 
    String subscriberId, 
    long startTime, 
    long endTime
)
```
ここで悲報です。`subscriberId`はAndroid 10からサードパーティアプリでは取れません。

しかし、リファレンスを読んでみると

|parameters|description|
|---|---|
|subscriberId|文字列。該当する場合は、ネットワーク・インターフェイスのサブスクライバ ID。API レベル 29 以降、subscriberId は追加の制限によって保護されます。subscriberId にアクセスするための新しい要件を満たしていないアプリを呼び出すと、すべてのモバイルネットワークの使用状況を受信するために、モバイルネットワークの種類を照会する際に NULL 値を提供することができます。詳細については、TelephonyManager#getSubscriberId() を参照してください。（Deepl翻訳：https://www.deepl.com/translator）|

`null`を渡せばモバイルデータ利用量を取得できるっぽい。  
でも複数SIMが刺さってたらどうなるんだろうね？

# 作る

|なまえ|あたい|
|---|---|
|Android|11|
|実機|Pixel 3 XL|
|minSdkVersion|23|

## activity_main.xml

最初から置いてあるTextViewにIDを振っておいてください。適当に`activity_main_text_view`とでも

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <TextView
        android:id="@+id/activity_main_text_view"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello World!"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

## AndroidManifest.xml

「`PACKAGE_USAGE_STATS`」権限が必要です。しかもダイアログ形式ではない、設定画面に誘導するタイプのやつです。  

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="io.github.takusan23.mobiledatausage">

    <!-- 使用状況へのアクセス 権限 -->
    <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS"/>

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MobileDataUsage">
        <activity android:name=".MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />

                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```

## MainActivity.kt
### 権限を確認、もらうコードを書く
権限の確認もいつものメソッドが使えないのでコードを書く必要があります。  
参考：https://stackoverflow.com/questions/28921136/how-to-check-if-android-permission-package-usage-stats-permission-is-given

```kotlin
/**
 * PACKAGE_USAGE_STATSの権限が付与されているか確認する
 * @return 権限があればtrue
 * */
fun checkUsageStatsPermission(): Boolean {
    val appOpsManager = getSystemService(APP_OPS_SERVICE) as AppOpsManager
    val mode = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
        // Android 10 以降
        appOpsManager.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), application.packageName)
    } else {
        // Android 9 以前
        appOpsManager.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), application.packageName)
    }
    return mode == AppOpsManager.MODE_ALLOWED
}
```

これを使って、権限がなければ取得する画面へ飛ばすようにします

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)
    if (checkUsageStatsPermission()) {
        // 権限がある
    } else {
        // ない
        startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
    }
}
```

## モバイルデータ利用量を取得する
とりあえず今月の利用分を取得する関数を書いてみる

```kotlin
/**
 * 今月のモバイルデータ利用量を取得する。単位はバイト
 * @return バイト単位で返す
 * */
fun getMobileDataUsageFromCurrentMonth(): Long {
    val networkStatsManager = getSystemService(Context.NETWORK_STATS_SERVICE) as NetworkStatsManager
    // 集計開始の日付その月の最初の日
    val startTime = Calendar.getInstance().apply {
        set(Calendar.DAY_OF_MONTH, 1)
        set(Calendar.HOUR_OF_DAY, 0)
        set(Calendar.MINUTE, 0)
        set(Calendar.SECOND, 0)
    }.time.time
    // 集計終了は現在時刻
    val endTime = Calendar.getInstance().time.time
    // 問い合わせる
    val bucket = networkStatsManager.querySummaryForDevice(ConnectivityManager.TYPE_MOBILE, null, startTime, endTime)
    // 送信 + 受信
    return bucket.txBytes + bucket.rxBytes
}
```

最後にTextViewに入れるようにして完成

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)
    // findViewByIdよりViewBindingを使ったほうがいい
    val textView = findViewById<TextView>(R.id.activity_main_text_view)
    if (checkUsageStatsPermission()) {
        // 権限がある
        val byte = getMobileDataUsageFromCurrentMonth()
        // MBへ変換
        val usageMB = byte / 1024f / 1024f
        // TextViewに入れる
        textView.text = "$usageMB MB"
    } else {
        // ない
        startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
    }
}
```

# 結果
多分あってる（AOSP見て作ったんだからそりゃそうだろ）

![Imgur](https://imgur.com/V6gKPaz.png)

# 全部くっつけたコード

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // findViewByIdよりViewBindingを使ったほうがいい
        val textView = findViewById<TextView>(R.id.activity_main_text_view)

        if (checkUsageStatsPermission()) {
            // 権限がある
            val byte = getMobileDataUsageFromCurrentMonth()
            // MBへ変換。Byte -> KB -> MB
            val usageMB = byte / 1024f / 1024f
            // TextViewに入れる
            textView.text = "$usageMB MB"
        } else {
            // ない
            startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
        }

    }

    /**
     * PACKAGE_USAGE_STATSの権限が付与されているか確認する
     * @return 権限があればtrue
     * */
    fun checkUsageStatsPermission(): Boolean {
        val appOpsManager = getSystemService(APP_OPS_SERVICE) as AppOpsManager
        val mode = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            // Android 10 以降
            appOpsManager.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), application.packageName)
        } else {
            // Android 9 以前
            appOpsManager.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), application.packageName)
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }

    /**
     * 今月のモバイルデータ利用量を取得する。単位はバイト
     * @return バイト単位で返す
     * */
    fun getMobileDataUsageFromCurrentMonth(): Long {
        val networkStatsManager = getSystemService(Context.NETWORK_STATS_SERVICE) as NetworkStatsManager
        // 集計開始の日付その月の最初の日
        val startTime = Calendar.getInstance().apply {
            set(Calendar.DAY_OF_MONTH, 1)
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
        }.time.time
        // 集計終了は現在時刻
        val endTime = Calendar.getInstance().time.time
        // 問い合わせる
        val bucket = networkStatsManager.querySummaryForDevice(ConnectivityManager.TYPE_MOBILE, null, startTime, endTime)
        // 送信 + 受信
        return bucket.txBytes + bucket.rxBytes
    }

}
```

# 終わりに
ソースコード置いておきます。  
https://github.com/takusan23/MobileDataUsage

AOSPのソースコード読むところいらんかった気がする


[^1]: 「java class method hash tag symbol」とかで検索検索！