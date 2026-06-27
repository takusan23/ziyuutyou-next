---
title: 自作 MOD の Minecraft 26.2 移行
created_at: 2026-06-28
tags:
- Minecraft
- Kotlin
- Java
---
どうもこんばんわ。

# 本題
`Minecraft 26.2`が公開されたので`自作MOD`を更新しました。

![minecraft_screenshot](https://oekakityou.negitoro.dev/original/03f9291d-df29-4cce-8a03-8f0dcc09166b.png)

ネタバレ、今回はマジで楽かもしれない。

# 前回
https://takusan.negitoro.dev/posts/minecraft_mod_26_1_migration/

# 差分
たぶん名前がちょっと変わったくらいしかないと思います。

- https://github.com/takusan23/ClickManaita2/compare/26.1-fabric...26.2-fabric
- https://github.com/takusan23/ClickManaita2/compare/26.1-neoforge...26.2-neoforge
- https://github.com/takusan23/ClickManaita2/compare/26.1-forge...26.2-forge

# ドキュメント
`Fabric`から出てます

https://fabricmc.net/2026/06/15/262.html

# Gradle

- `Fabric`
    - `9.5.1`
- `NeoForge`
    - かわらず
- `Forge`
    - かわらず

# BlockPos の getCenter が消えた
マジでわからん。カンニングした。  
https://github.com/neoforged/.github/blob/main/primers/26.2/index.md

見てきた、`Vec3`クラスに`static メソッド`が存在するのでそれを呼ぶ。

```kotlin
BlockPos blockPos = event.getPos();
Vec3 blockPosVec3d = blockPos.getCenter();
```

```kotlin
BlockPos blockPos = event.getPos();
Vec3 blockPosVec3d = Vec3.atCenterOf(blockPos);
```

終わり。8888