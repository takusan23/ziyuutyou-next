---
title: Glideでクロスフェード
created_at: 2021-03-19
tags:
- Android
- Kotlin
- Glide
---

[公式に乗ってますがメモで](https://bumptech.github.io/glide/doc/options.html#transitionoptions)

# クロスフェードして表示

```kotlin
Glide.with(imageView)
    .load("URL")
    .transition(DrawableTransitionOptions.withCrossFade()) // これ
    .into(imageView)
```

## おまけ 角を丸くする

```kotlin
Glide.with(imageView)
    .load("URL")
    .apply(RequestOptions.bitmapTransform(RoundedCorners(10))) // これ
    .into(imageView)
```