---
title: Hello Android 13。懐中電灯編
created_at: 2022-04-12
tags:
- Android13
- Camera2
- Kotlin
---

どうもこんばんわ。  
姫宮さんはかまいたい 攻略しました。こういうのでいいんだよ。

![Imgur](https://imgur.com/cI9ldMy.jpg)

それな

![Imgur](https://imgur.com/bglBKYa.jpg)

![Imgur](https://imgur.com/wNwRC4D.jpg)

かわいい！

戯画、ゲームエンジンが使いやすい。

# 本題
`Android 13` に `Galaxy`とか`iPhone`なんかに搭載されているフラッシュライト（懐中電灯）の明るさ調整機能が追加されたらしい。  
ので試してみる。

https://developer.android.com/sdk/api_diff/t-dp2/changes/android.hardware.camera2.CameraManager

https://www.xda-developers.com/android-13-flashlight-brightness-adjustment/

Galaxy S7 Edge にはフラッシュライトの明るさ調整が存在する。Samsung Experience 懐かしい。  
あの時はSDカードが刺さるって宣伝してたのに今は...  

![Imgur](https://imgur.com/dw93hKy.png)

## 環境

| なまえ  | あたい                    |
|---------|---------------------------|
| 端末    | Google Pixel 6 Pro        |
| 言語    | Kotlin                    |
| Android | Tiramisu (Android 13 DP2) |

## 作る
Android 13 (ティラミス) 以上が必要です。  
SDK Manager から入れましょう。
![Imgur](https://imgur.com/FDV0zju.png)

## 公式

https://developer.android.com/reference/android/hardware/camera2/CameraManager#turnOnTorchWithStrengthLevel(java.lang.String,%20int)

### appフォルダ内 build.gradle
ライブラリとかはいらないです。  
SDKのバージョンだけ13（Tiramisu）にしましょう。

```java
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    compileSdkPreview "Tiramisu"

    defaultConfig {
        applicationId "io.github.takusan23.androidtiramisutorch"
        minSdkPreview "Tiramisu"
        targetSdkPreview "Tiramisu"
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    // 省略...
```

### MainActivity.kt

懐中電灯光らせるだけならカメラの権限すらいりません。  

```kotlin
class MainActivity : AppCompatActivity() {

    private val cameraManager by lazy { getSystemService(Context.CAMERA_SERVICE) as CameraManager }

    // 警告が出るので黙らせる
    @RequiresApi(33)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val list = cameraManager.cameraIdList
        // 多分アウトカメラ
        val outCameraId = list[0]
        // アウトカメラ情報
        val cameraCharacteristics = cameraManager.getCameraCharacteristics(outCameraId)
        // 懐中電灯最大の明るさレベル
        val torchMaxLevel = cameraCharacteristics[CameraCharacteristics.FLASH_INFO_STRENGTH_MAXIMUM_LEVEL] ?: -1
        // 未対応
        if (torchMaxLevel < 0) {
            Toast.makeText(this, "明るさ調整に未対応です", Toast.LENGTH_SHORT).show()
        } else {
            // 点灯させる
            cameraManager.turnOnTorchWithStrengthLevel(outCameraId, 1)
        }
    }

    /** アプリ終了時に消す */
    override fun onDestroy() {
        super.onDestroy()
        val list = cameraManager.cameraIdList
        val outCameraId = list[0]
        cameraManager.setTorchMode(outCameraId, false)
    }
}
```

`CameraCharacteristics.FLASH_INFO_STRENGTH_MAXIMUM_LEVEL`が1以上を返していない場合は懐中電灯の明るさ調整機能に対応していません。  
`Pixel 6 Pro`で動いてることは確認済みなので**みんなも買おう。**

`turnOnTorchWithStrengthLevel`の第2引数が明るさレベルになっていて、この値を `1`から`torchMaxLevel` まで変化させることが出来ます。   
`Pixel 6 Pro`で`CameraCharacteristics.FLASH_INFO_STRENGTH_MAXIMUM_LEVEL`の返り値は`128`でした。

## 明るさスライダーを付ける

明るさの変化がわかりにくいのでシークバーで可変出来るようにする。

![Imgur](https://imgur.com/MdeB5Bp.png)

### activity_main.xml
適当にレイアウトを作りましょう。

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">


    <SeekBar
        android:id="@+id/activity_main_seekbar"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_marginStart="16dp"
        android:layout_marginEnd="16dp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <TextView
        android:id="@+id/activity_main_textview"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        app:layout_constraintEnd_toEndOf="@+id/activity_main_seekbar"
        app:layout_constraintStart_toStartOf="@+id/activity_main_seekbar"
        app:layout_constraintTop_toBottomOf="@+id/activity_main_seekbar" />
</androidx.constraintlayout.widget.ConstraintLayout>
```

### MainActivity.kt

小規模なので`findViewById`使いますが、出来れば`ViewBinding`を使うことをおすすめします。

```kotlin
class MainActivity : AppCompatActivity() {

    private val cameraManager by lazy { getSystemService(Context.CAMERA_SERVICE) as CameraManager }

    /** シークバー */
    private val lightLevelSeekBar by lazy { findViewById<SeekBar>(R.id.activity_main_seekbar) }

    /** 明るさレベル表示用TextView */
    private val lightLevelTextView by lazy { findViewById<TextView>(R.id.activity_main_textview) }

    // 警告が出るので黙らせる
    @RequiresApi(33)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val list = cameraManager.cameraIdList
        // 多分アウトカメラ
        val outCameraId = list[0]
        // アウトカメラ情報
        val cameraCharacteristics = cameraManager.getCameraCharacteristics(outCameraId)
        // 懐中電灯最大の明るさレベル
        val torchMaxLevel = cameraCharacteristics[CameraCharacteristics.FLASH_INFO_STRENGTH_MAXIMUM_LEVEL] ?: -1
        // 未対応
        if (torchMaxLevel < 0) {
            Toast.makeText(this, "明るさ調整に未対応です", Toast.LENGTH_SHORT).show()
        } else {
            // 最大値
            lightLevelSeekBar.max = torchMaxLevel
            lightLevelSeekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(p0: SeekBar?, p1: Int, p2: Boolean) {
                    // シークバー操作時に呼ばれる
                    cameraManager.turnOnTorchWithStrengthLevel(outCameraId, p1)
                    lightLevelTextView.text = "明るさレベル ${p1}"
                }

                override fun onStartTrackingTouch(p0: SeekBar?) {

                }

                override fun onStopTrackingTouch(p0: SeekBar?) {

                }
            })
        }
    }

    /** アプリ終了時に消す */
    override fun onDestroy() {
        super.onDestroy()
        val list = cameraManager.cameraIdList
        val outCameraId = list[0]
        cameraManager.setTorchMode(outCameraId, false)
    }
}
```

## ご褒美
APK置いておきます。

https://github.com/takusan23/AndroidTiramisuTorch/releases

## ソースコード
Android Studio 最新版でも多分開けると思います。(更新しようとしたら容量不足でコケた...)

https://github.com/takusan23/AndroidTiramisuTorch

# おわりに
Google Pixel だと PayPay のSMS認証来ないんですけどおま環ですか...