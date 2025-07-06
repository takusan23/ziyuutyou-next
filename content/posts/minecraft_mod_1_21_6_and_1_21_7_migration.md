---
title: 自作 MOD の Minecraft 1.21.6 (1.21.7) 移行メモ
created_at: 2025-07-06
tags:
- Minecraft
- Kotlin
- Java
---
どうもこんにちは、


# 本題
`Minecraft 1.21.6 (1.21.7)`がリリースされたので`自作MOD`を対応させました。  
`1.21.7`はマイナーアップデートです。

# 前回
https://takusan.negitoro.dev/posts/minecraft_mod_1_21_5_migration/

# 公式
今回も今回とて`Fabric`チームがまとめてくれているので読みます

https://fabricmc.net/2025/06/15/1216.html

# Gradle
- Fabric は前と同じ
- NeoForge は gradle-8.14.2
- Forge は gradle-8.12.1

# NBT 関連
`readData`、`writeData`の`API`が変わってます、  
が、多分`Inventories`のユーティリティ関数にそのまま渡すだけな気がする。

# getGuiTextured もエラー

```kotlin
context?.drawTexture(RenderLayer::getGuiTextured ...)
```

↓

```kotlin
context?.drawTexture(RenderPipelines.GUI_TEXTURED ...)
```

に変更すればよいはず。


`context?.drawText()`が動かねーーなーって思ってたら色のカラーコード？指定が間違ってたようです。  
近しい色が染料にあったので、染料のクラスを参照するように。

# そのほか MOD ローダー固有

## Fabric
Fabric だけかもですが、player.serverWorld が world に。  
`ServerPlayerEntity#getWorld` になったような？

## NeoForge
toml から`loader_version_range`ってキーが消えた？

```toml
# The name of the mod loader type to load - for regular FML @Mod mods it should be javafml
modLoader="javafml" #mandatory
# A version range to match for said mod loader - for regular FML @Mod it will be the FML version. This is currently 2.
loaderVersion="${loader_version_range}" #mandatory
```

## Forge
`IEventBus`が消えた。名前が変わっただけで、代わりは`BusGroup`。  
`FMLJavaModLoadingContext#getModEventBus`ではなく、`#getModBusGroup`を呼び出し、それで`Forge`に登録すれば良い。

多分呼び出しとクラス名を直すだけ、メソッド名とかはそのままになってるはず。  
`@SubscribeEvent`アノテーションは、パッケージが移動されてます。

# 1.21.6 → 1.21.7
まじでマイクラのバージョンを`1.21.7`用に修正するだけだと思ってます。  
`Fabric API`のバージョンとか、`NeoForge`のバージョンとか。

コード自体は多分変わらないんじゃないかなあ。

# 差分
`1.21.5`→`1.21.6`

- Fabric
    - https://github.com/takusan23/ClickManaita2/compare/1.21.5-fabric...1.21.6-fabric
- NeoForge
    - https://github.com/takusan23/ClickManaita2/compare/1.21.5-neoforge...1.21.6-neoforge
- Forge
    - https://github.com/takusan23/ClickManaita2/compare/1.21.5-forge...1.21.6-forge

`1.21.6`→`1.21.7`

- Fabric
    - https://github.com/takusan23/ClickManaita2/compare/1.21.6-fabric...1.21.7-fabric
- NeoForge
    - https://github.com/takusan23/ClickManaita2/compare/1.21.6-neoforge...1.21.7-neoforge
- Forge
    - https://github.com/takusan23/ClickManaita2/compare/1.21.6-forge...1.21.7-forge

おわりです。