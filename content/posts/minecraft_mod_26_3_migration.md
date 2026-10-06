---
title: 自作 MOD の Minecraft 26.3 移行
created_at: 2026-10-07
tags:
- Minecraft
- Kotlin
- Java
---
どうもこんばんわ。

# 本題
`Minecraft 26.3`がリリースされてたので`自作MOD`を更新しました。

![minecraft_screenshot](https://oekakityou.negitoro.dev/original/140ea9ea-4f50-4c6e-a49f-34558b11b4d9.png)

あ、ついに`GPU`がオンボードからグラボに進化しました。玄人志向（名前変わった!?）の`Intel Arc`の安いやつ！。  
`4K`モニターをちょっと安く譲ってもらったのですが、`4K + 60fps`がオンボードでは出せないらしく、安いやつでいいので`グラボ`を買う必要があった・・  

まあそもそも`i5 8600K`（8年前くらい）なのでたいそれたものは付けません + 時期が悪い

# 前回
https://takusan.negitoro.dev/posts/minecraft_mod_26_2_migration/

# 差分
- https://github.com/takusan23/ClickManaita2/compare/26.2-fabric...26.3-fabric
- https://github.com/takusan23/ClickManaita2/compare/26.2-neoforge...26.3-neoforge
- https://github.com/takusan23/ClickManaita2/compare/26.2-forge...26.3-forge

# 移行ガイド
まいどおなじみ、ありがとう

https://fabricmc.net/2026/09/15/263.html

# Gradle
- Fabric
    - `9.7.1`
- NeoForge (変わらず)
    - `9.2.1`
- Forge
    - `9.7.1`

# Block の playerDestroy が ServerPlayer を引数に取る
いままでは`Player`だった？んで`instanceof ServerPlayer`であることを確認すればよいはず。  
`Block#playerDestroy`が`ServerPlayer`必須になってた。が、多分その辺の処理の前に`Level#isClient()`とか、`Level instanceof ServerLevel`とかで分岐してるはずなので、特に大変じゃないハズ

```kotlin
fun manaita(
    dropSize: Int,
    world: Level,
    blockPos: BlockPos,
    playerEntity: Player
) {
    if (world !is ServerLevel) return // こんな感じにすでにサーバーかどうか見ている箇所があるハズなので
    if (playerEntity !is ServerPlayer) return // これを足す

    val blockState = world.getBlockState(blockPos)
    val copyBlock = blockState.block
    val blockEntity = world.getBlockEntity(blockPos)

    repeat(dropSize) {

        // チェストの中身も増やす
        if (blockEntity is Container) {
            repeat(blockEntity.containerSize) { invIndex ->
                Block.popResource(world, blockPos, blockEntity.getItem(invIndex).copy())
            }
        }

        // ブロックを増やす
        copyBlock.playerDestroy(world, playerEntity, blockPos, blockState, blockEntity, playerEntity.mainHandItem)
    }
}
```

`Java`なら、早期リターン効いてない？のかキャストしないとだった

```java
public static void manaita(
        int dropSize,
        Level world,
        BlockPos blockPos,
        Player player
) {

    if (!(world instanceof ServerLevel)) {
        return;
    }

    // 足す
    if (!(player instanceof ServerPlayer)) {
        return;
    }

    BlockState blockState = world.getBlockState(blockPos);
    Block copyBlock = blockState.getBlock();
    BlockEntity blockEntity = world.getBlockEntity(blockPos);

    for (int i = 0; i < dropSize; i++) {

        // チェストの中身も増やす
        if (blockEntity instanceof Container) {
            for (int l = 0; l < ((Container) blockEntity).getContainerSize(); l++) {
                Block.popResource(world, blockPos, ((Container) blockEntity).getItem(l).copy());
            }
        }

        // ブロック複製
        // ここはキャスト
        copyBlock.playerDestroy((ServerLevel) world, (ServerPlayer) player, blockPos, blockState, blockEntity, player.getMainHandItem());

        // なんか経験値を吐き出す実装がなくなった？ので自前で用意
        int exp = blockState.getExpDrop(world, blockPos, blockEntity, player, player.getMainHandItem());
        copyBlock.popExperience((ServerLevel) world, blockPos, exp);
    }
}
```

# なんか腕を振ってくれない
なんか昔は`useOn`で`SUCCESS`を返すだけで、クリックしたときに腕をぶんぶん振り回してた気がするんだけど、`26.3`にしたらなんかクリックしても腕が動かない？。  
でも見た感じ`Fabric`だけで`NeoForge`と`Forge`だと`SUCCESS`だけで動いてるっぽいんだよなあ、、

```kotlin
override fun useOn(context: UseOnContext): InteractionResult {
    return InteractionResult.SUCCESS // これじゃだめっぽ
}
```

で、調べた感じ、`InteractionResult.SUCCESS.heldItemTransformedTo()`を使うと腕をぶんぶん振ってくれるようになった。  
こんな感じ。

```kotlin
class ClickManaitaBaseItem(settings: Properties, private val dropSize: Int = 2) : Item(settings) {

    /**
     * ブロックを右クリックしたときに呼ばれる関数
     */
    override fun useOn(context: UseOnContext): InteractionResult {

        // 共通処理を呼び出す
        ClickManaitaItemTool.manaita(
            dropSize = dropSize,
            world = context.level,
            blockPos = context.clickedPos,
            playerEntity = context.player ?: return InteractionResult.PASS
        )

        return InteractionResult.SUCCESS.heldItemTransformedTo(context.itemInHand)
    }
}
```

`InteractionResult`、ただの`enum class`だと思ってたら`代数的データ型`的な感じに書き直されていた・・！？  
`Java`でも`sealed class`あるんだ。

# Block クラスの codec() メソッドは使われなくなった
`BaseEntityBlock`とかには`codec()`メソッドがあったのですが、どうやら消えたらしいです。  
そしてもう使われないらしいので削除するだけでいい模様。

```kotlin
class ResetTableBlock(settings: Properties) : BaseEntityBlock(settings) {

    // codec() メソッドを消す、もう存在しない
    override fun codec(): MapCodec<out BaseEntityBlock> {
        return CODEC
    }

    // そのほか省略...

    companion object {
        private val CODEC = simpleCodec { settings -> ResetTableBlock(settings) } // 使わないので消す
    }
}
```

# MOD ローダー別
## Fabric
`build.gradle`から`version`と`group`が消えた、けどちゃんと`gradle.properties`の値を適用していそうだった。

```diff
- version = project.mod_version
- group = project.maven_group
```

# おわりに
`Fabric`のときだけ、`.idea`フォルダを消さないとエラーが消えなかった・・