---
title: MediaControllerCompat#transportControlsでリピート、シャッフル操作する
created_at: 2020-12-12
tags:
- Android
- Kotlin
---

本当かどうかは知りませんがメモとして置いておきます。

## 本題
`Fragment/Activity`に紐づけした`MediaControllerCompat`で  
`transportControls.setRepeatMode()`や`transportControls.setShuffleMode()`を呼んだのに、
`repeatMode`や`shuffleMode`が変わらない問題

## 解決方法

```kotlin
private val callback = object : MediaSessionCompat.Callback() {
    /** リピートモード変更 */
    override fun onSetRepeatMode(repeatMode: Int) {
        super.onSetRepeatMode(repeatMode)
        // もしかして：この一行必須？
        mediaSessionCompat.setRepeatMode(repeatMode)
        if (repeatMode == PlaybackStateCompat.REPEAT_MODE_ALL) {
            // 無限ループループする
            exoPlayer.repeatMode = Player.REPEAT_MODE_ALL
        } else {
            // 同じ曲を何回も聞く。
            exoPlayer.repeatMode = Player.REPEAT_MODE_ONE
        }
    }
}
```

`mediaSessionCompat.setRepeatMode(repeatMode)`を呼んだら直った