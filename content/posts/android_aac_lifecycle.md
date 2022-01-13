---
title: Android Architecture ComponentsのLifeCycleでonDestory()に書き忘れを回避
created_at: 2020-09-28
tags:
- Android
- Kotlin
---
ねむい

# 本題
ライフサイクルのコールバックをActivity/Fragment以外のクラスで受け取りたいって話。

## あると何がいいか
こんなふうなセンサーの値をとるクラスがあったとして、

```kotlin
/**
 * 加速度センサーの値取得クラス
 * @param activity Contextとるため
 * @param sensorChanged センサーの値が変更された時に呼ばれる高階関数
 * */
class GetSensor(activity: Activity, sensorChanged: (SensorEvent?) -> Unit) {

    private val sensorManager = activity.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private var sensorEventListener: SensorEventListener

    init {
        sensorEventListener = object : SensorEventListener {
            override fun onAccuracyChanged(p0: Sensor?, p1: Int) {

            }

            override fun onSensorChanged(p0: SensorEvent?) {
                // 値が変更された
                sensorChanged(p0)
            }
        }
    }

    /** 終了時に呼んでね */
    fun destroy() {
        sensorManager.unregisterListener(sensorEventListener)
    }

    /** 開始時に呼んでね */
    fun start(){
        // 加速度センサー
        val sensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        // センサー登録
        sensorManager.registerListener(
            sensorEventListener,
            sensor,
            SensorManager.SENSOR_DELAY_NORMAL
        )
    }

}
```

`MainActivity.kt`あたりで使うとして、こうですね

```kotlin
class MainActivity : AppCompatActivity() {

    private lateinit var sensor: GetSensor

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        sensor = GetSensor(this) {
            // X軸を出力
            println(it?.values?.get(0))
        }

    }

    // センサーの登録解除
    override fun onPause() {
        super.onPause()
        sensor.destroy()
    }

    // センサーの登録
    override fun onResume() {
        super.onResume()
        sensor.start()
    }


}
```

## これの何が問題なのか
~~(activityじゃなくてcontextで良いだろ)~~
- `onPause()`に書き忘れる可能性がある
- `GetSensor`クラスで登録とか解除とかを自動でやってほしい
    - なんでActivityの`onPause`とかに書かないといけないの？

# ライフサイクル対応コンポーネント を利用して解決
これを使うと、
- `DESTROY`状態になったら呼ばれる関数(べつにSTARTでも良いよ)
    - **ActivityやFragmentのonPause()関数等がActivity/Fragment以外(自作クラス)でも利用できる！！！**

~~ライフサイクルはクソなので助かる~~

なので書き直すと

## LifecycleObserverを継承
`LifecycleObserver`は実は中身空っぽなので書き足すだけでいいです
```kotlin
class GetSensor(activity: Activity, sensorChanged: (SensorEvent?) -> Unit) : LifecycleObserver {
```

## addObserver()
`GetSensor`クラスのコンストラクタの引数に`lifecycle: Lifecycle`を付け足します。

```kotlin
class GetSensor(activity: Activity, lifecycle: Lifecycle, sensorChanged: (SensorEvent?) -> Unit) : LifecycleObserver {
```

そして`init{ }`の中に以下の1行を足します
```kotlin
lifecycle.addObserver(this)
```

## ライフサイクルに関係している関数に`@OnLifecycleEvent`をつける

まず忘れそうな`destroy()`関数につけましょう。  
ちゃんとコメントも書き換えて、privateにしてしまいましょう（勝手に呼ばれるのでもう書く必要がないため）。

```kotlin
/** 終了時に勝手に呼ばれる */
@OnLifecycleEvent(Lifecycle.Event.ON_PAUSE)
private fun destroy() {
    sensorManager.unregisterListener(sensorEventListener)
}
```

それとセンサーを登録する関数も、ライフサイクルが`Resume`の状態になったら自動で呼ぶようにします
```kotlin
/** 開始状態になったら勝手に呼ばれる */
@OnLifecycleEvent(Lifecycle.Event.ON_RESUME)
private fun start() {
    // 加速度センサー
    val sensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    // センサー登録
    sensorManager.registerListener(
        sensorEventListener,
        sensor,
        SensorManager.SENSOR_DELAY_NORMAL
    )
}
```

最後に`MainActivity`を修正して終わりです！

```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        GetSensor(this, lifecycle) {
            // X軸を出力
            println(it?.values?.get(0))
        }
    }

}
```

わあ！すごいスッキリ

実行してLogcatを出してアプリを離れると勝手に出力が終了し、また戻ってくると出力が始まってることが分かるはずです。

# 全部くっつけたコード

`GetSensor.kt`

```kotlin
/**
 * 加速度センサーの値取得クラス
 * @param activity Contextとるため
 * @param sensorChanged センサーの値が変更された時に呼ばれる高階関数
 * */
class GetSensor(activity: Activity, lifecycle: Lifecycle, sensorChanged: (SensorEvent?) -> Unit) :
    LifecycleObserver {

    private val sensorManager = activity.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private var sensorEventListener: SensorEventListener

    init {
        lifecycle.addObserver(this)
        sensorEventListener = object : SensorEventListener {
            override fun onAccuracyChanged(p0: Sensor?, p1: Int) {

            }

            override fun onSensorChanged(p0: SensorEvent?) {
                // 値が変更された
                sensorChanged(p0)
            }
        }
    }

    /** 終了時に勝手に呼ばれる */
    @OnLifecycleEvent(Lifecycle.Event.ON_PAUSE)
    private fun destroy() {
        sensorManager.unregisterListener(sensorEventListener)
    }

    /** 開始状態になったら勝手に呼ばれる */
    @OnLifecycleEvent(Lifecycle.Event.ON_RESUME)
    private fun start() {
        // 加速度センサー
        val sensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        // センサー登録
        sensorManager.registerListener(
            sensorEventListener,
            sensor,
            SensorManager.SENSOR_DELAY_NORMAL
        )
    }

}
```

`MainActivity.kt`

```kotlin
class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        GetSensor(this, lifecycle) {
            // X軸を出力
            println(it?.values?.get(0))
        }
    }
}
```

# 参考にしました
https://developer.android.com/topic/libraries/architecture/lifecycle?hl=ja