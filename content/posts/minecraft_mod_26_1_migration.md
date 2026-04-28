---
title: 自作 MOD の Minecraft 26.1 移行
created_at: 2026-04-29
tags:
- Minecraft
- Kotlin
- Java
---
どうもこんにちわ、これは超会議

![超会議](https://oekakityou.negitoro.dev/resize/042a8c86-c579-4ede-a514-c54e02d9274a.jpg)

# ほんだい
`Minecraft 26.1`が来てたのに忙しくて全然できなかった、ようやく`自作MOD`を対応させました。  
なんか子供ゾンビの頭デカくね？

![子供ゾンビ](https://oekakityou.negitoro.dev/original/2c57d10c-07f7-48af-943d-cab125a29640.png)

`26.1.1`と`26.1.2`はバグフィックスです。

# 前回
https://takusan.negitoro.dev/posts/minecraft_mod_1_21_11_migration/

# 差分
たぶん名前がちょっと変わったくらいしかないと思います。

- https://github.com/takusan23/ClickManaita2/compare/1.21.11-fabric...26.1-fabric
- https://github.com/takusan23/ClickManaita2/compare/1.21.11-neoforge...26.1-neoforge
- https://github.com/takusan23/ClickManaita2/compare/1.21.11-forge...26.1-forge

# ドキュメント
`Fabric`と`NeoForge`からドキュメントが公開されています。片っぽの`MODローダー`向けにしか作ってないとしても、両方読むと足りない箇所が補完されるので良いかも。

- https://fabricmc.net/2026/03/14/261.html
- https://neoforged.net/news/26.1release/

# 今回は MOD テンプレートでサンプルを作ってコピペすることにする
`26.1`は難読化されない初のバージョンらしい。  
ので、`build.gradle`周りも変更されてると思いすべてテンプレートをコピペして部分的に治すことにした。

## Gradle
もしテンプレートからコピペしない場合は手動で追従するかと思うので。  
全部微妙に違うせいでホームディレクトリにある`~/gradle/wrapper/dists`がデカくなりがち

- `Fabric`
    - `9.4.1`
- `NeoForge`
    - `9.2.1`
- `Forge`
    - `9.3.1`

## Java 25 が必要
わたしは`Eclipse Temurin`を使ってますが好きな`Java 25`をインストールしてください。のと、`GitHub Actions`とかを使っている場合は`Java 25`を使うように直す！忘れないで！

# エンチャント周り
`ConditionalEffect#codec`は第二引数に`ContextKeySet`を取らなくなった。よくわからないが、ただ消すだけで期待通り動いているように見える。しらんけど

# クリエタブ周り
名前変わってます！！！

`net.fabricmc.fabric.api.itemgroup.v1.FabricItemGroup`→`net.fabricmc.fabric.api.creativetab.v1.FabricCreativeModeTab`

# GUI 周り

## BlockEntity
クラス名が変わってます`ExtendedScreenHandlerFactory`→`ExtendedMenuProvider`

```kotlin
class ResetTableEntity(
    pos: BlockPos,
    state: BlockState
) : BlockEntity(ResetTableEntities.RESET_TABLE_BLOCK_ENTITY, pos, state), MenuProvider, ExtendedScreenHandlerFactory<ResetTableScreenHandlerServerClientData>, ImplementedInventory, WorldlyContainer {
```

↓

```kotlin
class ResetTableEntity(
    pos: BlockPos,
    state: BlockState
) : BlockEntity(ResetTableEntities.RESET_TABLE_BLOCK_ENTITY, pos, state), MenuProvider, ExtendedMenuProvider<ResetTableScreenHandlerServerClientData>, ImplementedInventory, WorldlyContainer
```

## AbstractContainerMenu
`clicked`関数のシグネチャが変わってます。引数が増えた

```kotlin
override fun clicked(i: Int, j: Int, clickType: ClickType, player: Player)
```

↓

```kotlin
override fun clicked(slotIndex: Int, buttonNum: Int, containerInput: ContainerInput, player: Player)
```

## ScreenHandlers
`ExtendedScreenHandlerType`→`ExtendedMenuType`になりました。

```kotlin
/**
 * リセットテーブルブロックのエンティティのスクリーンハンドラー
 */
val RESET_TABLE_SCREEN_HANDLER = ExtendedScreenHandlerType(
    { syncId, inventory, serverClientData -> ResetTableScreenHandler(syncId, inventory, serverClientData) },
    PACKET_CODEC
)
```

```kotlin
/**
 * リセットテーブルブロックのエンティティのスクリーンハンドラー
 */
val RESET_TABLE_SCREEN_HANDLER = ExtendedMenuType(
    { syncId, inventory, serverClientData -> ResetTableScreenHandler(syncId, inventory, serverClientData) },
    PACKET_CODEC
)
```

## AbstractContainerScreen
`NeoForge`のサイトだけど`Fabric`も同じ。  
https://neoforged.net/news/26.1release/#guigraphics-rename

`AbstractContainerScreen`の中の`renderBg`、`renderLabels`関数とかがことごとく消えています。  
`renderBg`は`extractBackground`、`renderLabels`は`extractLabels`に名前が変わっています。また、`GuiGraphics#drawString`相当は`GuiGraphicsExtractor#text`になります。

```kotlin
override fun renderBg(guiGraphics: GuiGraphics, f: Float, i: Int, j: Int) {
    val x = (width - imageWidth) / 2
    val y = (height - imageHeight) / 2
    guiGraphics.blit(RenderPipelines.GUI_TEXTURED, TEXTURE, x, y, 0f, 0f, imageWidth, imageHeight, 256, 256)
}

/** テキスト描画はここで */
override fun renderLabels(guiGraphics: GuiGraphics, i: Int, j: Int) {
    super.renderLabels(guiGraphics, i, j)
    // アイテムが戻せない場合はなんで戻せないのか理由を
    val verify = resetTableScreenHandler.recipeVerifyResult
    // エラー時は利用できない理由を
    val textColorPair = ResetTableTool.resolveUserDescription(verify) ?: return
    // テキスト描画
    guiGraphics.drawString(
        font,
        textColorPair.first,
        ((RESET_SLOT_POS_X + (SLOT_WIDTH / 2f)) - (font.width(textColorPair.first) / 2)).toInt(), // 真ん中にするため
        60,
        textColorPair.second,
        false
    )
}
```

だった場合は、↓になる

```kotlin
override fun extractBackground(graphics: GuiGraphicsExtractor, mouseX: Int, mouseY: Int, a: Float) {
    super.extractBackground(graphics, mouseX, mouseY, a)
    val x = (width - imageWidth) / 2
    val y = (height - imageHeight) / 2
    graphics.blit(RenderPipelines.GUI_TEXTURED, TEXTURE, x, y, 0f, 0f, imageWidth, imageHeight, 256, 256)
}

/** テキスト描画はここで */
override fun extractLabels(graphics: GuiGraphicsExtractor, xm: Int, ym: Int) {
    super.extractLabels(graphics, xm, ym)
    // アイテムが戻せない場合はなんで戻せないのか理由を
    val verify = resetTableScreenHandler.recipeVerifyResult
    // エラー時は利用できない理由を
    val textColorPair = ResetTableTool.resolveUserDescription(verify) ?: return
    // テキスト描画
    graphics.text(
        font,
        textColorPair.first,
        ((RESET_SLOT_POS_X + (SLOT_WIDTH / 2f)) - (font.width(textColorPair.first) / 2)).toInt(), // 真ん中にするため
        60,
        textColorPair.second,
        false
    )
}
```

あと`render`関数もオーバーライドしていたが、名前変わってる上にこれは消してもぱっと見動いてそうだったため、もう消すことにした。

# サーバー、クライアント間周り
`PayloadTypeRegistry.playS2C()`の名前も変わってます。`PayloadTypeRegistry.clientboundPlay()`

```kotlin
// ネットワークの追加（クライアント・サーバー間でやり取りする）
PayloadTypeRegistry.playS2C().register(ResetTableErrorPayload.ID, ResetTableErrorPayload.CODEC)
```

↓

```kotlin
// ネットワークの追加（クライアント・サーバー間でやり取りする）
PayloadTypeRegistry.clientboundPlay().register(ResetTableErrorPayload.ID, ResetTableErrorPayload.CODEC)
```

# レシピ周り
レシピを探すようなコードを書いた場合、`Recipe#assemble`の引数が一つになりました。`ServerLevel`(かつて`World`と呼ばれてたクラス)を渡さなくてよくなったらしい

```kotlin
private fun CraftingRecipe.craftOrNull(): ItemStack? = runCatching {
    assemble(CraftingInput.EMPTY)
}.getOrNull()
```

# Fabric 向け
## 使っていたクラスの名前が見つからない
私が遭遇した名前変更は↑に書きましたが、それ以外であった場合、ここから前の名前と今の名前の対応表があります。ここから探すことが可能

https://docs.fabricmc.net/develop/porting/fabric-api#renames

# NeoForge 向け
こっちも`MODテンプレート`を入れなおしました。`gradle.properties`の値が消えて、直接`neoforge.mods.toml`に書き込むようになった模様？

この二つが消えて

```properties
# The authors of the mod. This is a simple text string that is used for display purposes in the mod list.
mod_authors=takusan_23
# The description of the mod. This is a simple multiline text string that is used for display purposes in the mod list.
mod_description=CheatMOD
```

`.toml`の方に直書きするようになった？かも

```toml
# The authors of the mod, displayed in the mod UI (optional)
authors="takusan_23"

# The description text for the mod (multi line!) (#mandatory)
description='''
CheatMOD
'''
```

# Forge
こっちも同様にテンプレートからコピペしました。こっちは`properties`から`mods.toml`にべた書きするようになったみたいです。  
`build.gradle`と`mods.toml`で値が分散してしまう...

## genIntellijRuns が見つからない！！！
`Gradle`タブにある、`runClient`を直で起動できるようになっていたが、これであっているのかが分からない！  
`Forge`は何も教えてくれないからな～

![running_runclient](https://oekakityou.negitoro.dev/original/380dcbcf-d15d-496a-97d9-3fe410dcff88.png)

## Level#random が private
`getRandom()`が`public`にあるのでそれで。てかなんで今まで動いてた?

# おわりに
今回は、`Fabric`の方がなんだか調子悪く、`Minecraft Client`が頻繁にバツマークになってしまった。`.idea`とか`build`とかを消して開きなおすと直ったからよし！

# おわりに2
`Minecraft`入れなおしたんだけど、`Minecraft Launcher`のダウンロード分かんなくて数分探しまわったり、`Microsoft Store`に先に`MS アカウント`でサインインしておけとか、`Xbox`のダイアログが二回くらい出てきたり、なんかのタイミングでローカルアカウントから`MS アカウント`に昇格していた。

`GitHub`がこうならなくてよかった！