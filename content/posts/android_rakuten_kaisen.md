---
title: Androidで楽天回線を判断するアプリを書く
created_at: 2021-04-08
tags:
- Android
- Kotlin
- 楽天モバイル
---
どうもこんにちは。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">楽天の自社回線拾えず <a href="https://t.co/74fWoB3ENK">pic.twitter.com/74fWoB3ENK</a></p>&mdash; たくさん (@takusan__23) <a href="https://twitter.com/takusan__23/status/1378719149954752514?ref_src=twsrc%5Etfw">April 4, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

家ではBand 26しか掴みません。  
エリアマップでは対応してるっぽいので、恐らくau回線のほうが安定してるからauの方に繋がっちゃうとかそういう事なのかな。

# 本題
楽天回線か判断するアプリを書きます。

# 環境

| なまえ                    | あたい                                                               |
|---------------------------|----------------------------------------------------------------------|
| Android                   | 11                                                                   |
| 端末                      | Sony Xperia 5 mk 2 （念願の高リフレッシュレート + SDカード対応端末） |
| 言語                      | Kotlin                                                               |
| 最低Android SDKバージョン | 28 (Android 9 以降)                                                  |

# 作り方

## app/build.gradle

ViewBindingを有効にしてください。

```
android {
    compileSdkVersion 30
    buildToolsVersion "30.0.3"

    defaultConfig {
        applicationId "io.github.takusan23.whereisrakutenarea"
        minSdkVersion 28
        targetSdkVersion 30
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    // これ
    buildFeatures {
        viewBinding true
    }
}
```

あと、`Activity Result API`を使いたいので以下のように

```
dependencies {

    // Activity Result API
    implementation 'androidx.activity:activity-ktx:1.3.0-alpha06'
    implementation 'androidx.fragment:fragment-ktx:1.3.2'

    // 以下省略
}
```

## activity_main.xml
まあTextViewと取得用Buttonを置いておきましょう

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <TextView
        android:id="@+id/textView"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="ボタンを押して回線確認"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <Button
        android:id="@+id/button"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        android:text="回線確認"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@+id/textView" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

## MainActivity.kt
### 権限の確認

`Activity Result API`が便利すぎる。権限を使いたいので付与をお願いします的なメッセージを出したほうが親切だと思う。

```kotlin
class MainActivity : AppCompatActivity() {

    /** 権限コールバック */
    private val permissionCallBack = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        if (isGranted) {
            // 権限確保
            checkRakutenNetwork()
        }
    }

    /** ViewBinding */
    private val viewBinding by lazy { ActivityMainBinding.inflate(layoutInflater) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(viewBinding.root)

        start()

        // ボタンを押したとき
        viewBinding.button.setOnClickListener {
            start()
        }

    }

    /** 権限があれば回線チェックを行う */
    private fun start() {
        // 権限の確認
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            // 権限がある
            checkRakutenNetwork()
        } else {
            // 無い
            Toast.makeText(this, "接続状態へのアクセスに権限が必要ですので付与をお願いします。", Toast.LENGTH_SHORT).show()
            permissionCallBack.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }
}
```

## 楽天回線か確認する関数

関数内に関数があるけど気にしないで

```kotlin
/** 楽天の自社回線に繋がっているか確認する関数 */
private fun checkRakutenNetwork() {
    /** 関数内に関数を書く。TextViewに回線名を入れる */
    fun setTextViewOperatorName(cellInfo: CellInfo) {
        viewBinding.textView.text = when (cellInfo) {
            // 3G
            is CellInfoWcdma -> {
                cellInfo.cellIdentity.operatorAlphaLong
            }
            // LTE
            is CellInfoLte -> {
                cellInfo.cellIdentity.earfcn
                cellInfo.cellIdentity.operatorAlphaShort
            }
            // 5G (NR)
            is CellInfoNr -> {
                cellInfo.cellIdentity.operatorAlphaShort
            }
            else -> "不明"
        }
    }
    val telephonyManager = getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            // Android 10以降は前取得したデータを使い回す仕様のため、新しく取ってきてもらうために分岐
            telephonyManager.requestCellInfoUpdate(mainExecutor, object : TelephonyManager.CellInfoCallback() {
                override fun onCellInfo(cellInfo: MutableList<CellInfo>) {
                    setTextViewOperatorName(cellInfo[0])
                }
            })
        }
    } else {
        val cellInfoList = telephonyManager.allCellInfo
        setTextViewOperatorName(cellInfoList[0])
    }
}
```

## 全体

```kotlin
class MainActivity : AppCompatActivity() {

    /** 権限コールバック */
    private val permissionCallBack = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        if (isGranted) {
            // 権限確保
            checkRakutenNetwork()
        }
    }

    /** ViewBinding */
    private val viewBinding by lazy { ActivityMainBinding.inflate(layoutInflater) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(viewBinding.root)

        start()

        // ボタンを押したとき
        viewBinding.button.setOnClickListener {
            start()
        }

    }

    /** 権限があれば回線チェックを行う */
    private fun start() {
        // 権限の確認
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            // 権限がある
            checkRakutenNetwork()
        } else {
            // 無い
            Toast.makeText(this, "接続状態へのアクセスに権限が必要ですので付与をお願いします。", Toast.LENGTH_SHORT).show()
            permissionCallBack.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }

    /** 楽天の自社回線に繋がっているか確認する関数 */
    private fun checkRakutenNetwork() {

        /** 関数内に関数を書く。TextViewに回線名を入れる */
        fun setTextViewOperatorName(cellInfo: CellInfo) {
            viewBinding.textView.text = when (cellInfo) {
                // 3G
                is CellInfoWcdma -> {
                    cellInfo.cellIdentity.operatorAlphaLong
                }
                // LTE
                is CellInfoLte -> {
                    cellInfo.cellIdentity.operatorAlphaShort
                }
                // 5G (NR)
                is CellInfoNr -> {
                    cellInfo.cellIdentity.operatorAlphaShort
                }
                else -> "不明"
            }
        }

        val telephonyManager = getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (ActivityCompat.checkSelfPermission(
                    this,
                    Manifest.permission.ACCESS_FINE_LOCATION
                ) == PackageManager.PERMISSION_GRANTED
            ) {
                // Android 10以降は前取得したデータを使い回す仕様のため、新しく取ってきてもらうために分岐
                telephonyManager.requestCellInfoUpdate(
                    mainExecutor,
                    object : TelephonyManager.CellInfoCallback() {
                        override fun onCellInfo(cellInfo: MutableList<CellInfo>) {
                            setTextViewOperatorName(cellInfo[0])
                        }
                    })
            }
        } else {
            val cellInfoList = telephonyManager.allCellInfo
            setTextViewOperatorName(cellInfoList[0])
        }
    }

}
```

実行するとこんな感じ

![Imgur](https://i.imgur.com/cE33GZT.png)

# ソースコードです

https://github.com/takusan23/WhereIsRakutenArea

# おわりに
新しめのAndroidでしかこの方法が使えない。  
Android 7以降は`EARFCN`を取得するAPIが使えるので、  
**EARFCN取得→バンド/EARFCNの表と照合→接続中バンドを取得→バンド3なら楽天回線！**  
みたいな方法もあります（そのうち書きたい）。

以上です。今日は夜勤