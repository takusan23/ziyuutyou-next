---
title: Jetpack Compose の AndroidView で SurfaceView を使うとはみ出して真っ暗になる
created_at: 2024-11-24
tags:
- Android
- JetpackCompose
- Kotlin
---

どうもこんばんわ。  
もうすでに`Issue Tracker`で解決策が書いてありますが

# 本題
`Android 12`以上と未満で表示が崩れてしまった。  
はみ出して背景が真っ暗になってしまった。

| Android 11                                | Android 12                                |
|-------------------------------------------|-------------------------------------------|
| ![Imgur](https://i.imgur.com/bi4Jjun.png) | ![Imgur](https://i.imgur.com/rkL6Kxm.png) |

# なおしかた
`AndroidView`に`Modifier.clipToBounds`をつければ終わり。  
ありがとう`Issue Tracker`。

https://issuetracker.google.com/issues/283147300

```kotlin
@Composable
fun ComposeSurfaceView(
    modifier: Modifier = Modifier,
    onCreateSurface: (SurfaceHolder) -> Unit,
    onSizeChanged: (width: Int, height: Int) -> Unit,
    onDestroySurface: () -> Unit
) {
    AndroidView(
        modifier = modifier.clipToBounds(), // Android 11 以前で AndroidView + SurfaceView すると背景が真っ暗になるので必要
        factory = { context ->
            SurfaceView(context).apply {
                holder.addCallback(object : SurfaceHolder.Callback {
                    override fun surfaceCreated(holder: SurfaceHolder) = onCreateSurface(holder)
                    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) = onSizeChanged(width, height)
                    override fun surfaceDestroyed(holder: SurfaceHolder) = onDestroySurface()
                })
            }
        }
    )
}
```