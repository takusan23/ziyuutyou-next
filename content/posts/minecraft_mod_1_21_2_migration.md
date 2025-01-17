---
title: 自作 MOD の Minecraft 1.21.2 移行メモ
created_at: 2024-11-17
tags:
- Minecraft
- Kotlin
- Java
---
どうもこんばんわ。  
一応言っておくと定住先でよく使われる**1.12.2**ではなく**1.21.2**です。  
（最近はどこに定住しているのか知らない）

# 本題
自作 MOD の`Minecraft 1.21.2`への移行メモです。  
移行メモ振り返ってみたけど、`1.20.6`から全部今年なの・・・

![Imgur](https://i.imgur.com/HxnQHhK.png)

今回も地味に大変だった。前回のエンチャント作り直しよりはマシかな？  
レシピ周り（`ServerWorld#getRecipeManager`とか）触ってなければ多分今回のアップデートは怖くない。はず。

今回も今回とて`Fabric`の方々がまとめてくれているので、どこが変わっているかはそれを見ればいいです。  
https://fabricmc.net/2024/10/14/1212.html

# 1.21.3
はバグ修正バージョンらしいので、`1.21.2`からの対応は無いと思います。

# 前回
https://takusan.negitoro.dev/posts/minecraft_mod_1_21_migration/

# レシピの JSON が変更されています
`Fabric`チームがまとめてくれてないですが、`JSON`の構造が変更されています。  
https://github.com/takusan23/ClickManaita2/blob/1.21.3-fabric/src/main/resources/data/clickmanaita/recipe/clickmanaita_wood.json

オブジェクト`{ "item": "アイテムID" }`じゃなくて、`アイテムのID`を渡すようになりました。

```diff
{
   "type": "minecraft:crafting_shaped",
   "pattern": [
     "DDD",
     "DDD",
     "DDD"
   ],
   "key": {
-    "D": {
-      "item": "minecraft:crafting_table"
-    }
+    "D": "minecraft:crafting_table"
   },
   "result": {
     "count": 1,
     "id": "clickmanaita:clickmanaita_wood"
   }
}
```

不定形レシピも同様です。  
https://github.com/takusan23/ResetTable/blob/1.21.3-fabric/src/main/resources/data/resettable/recipe/reset_table_block.json

# アイテム、ブロックの登録前に ID を渡す必要があります
`1.21.1`時代のコードを貼り付けるとこんなエラーが出る。  

```plaintext
NullPointerException: Item id not set
```

これは、`Minecraft`にアイテムを追加する前までに、アイテムの設定（食べ物かどうか、スタック数）へ`アイテムID`を設定しておく必要があるということです。  
いままでは、`Minecraft`に登録する際に、`アイテムID`とアイテムのクラスのインスタンスを渡せば登録できたのですが、もう一箇所、アイテム設定の時点でも渡す必要があります。

`Fabric + Kotlin`の場合は多分こんな感じで、`Item.Settings#registryKey`を呼べば良いはず。

```kotlin
// アイテムID
private val ID_CLICKMANAITA_WOOD = Identifier.of("clickmanaita", "clickmanaita_wood")

// レジストリキー
private val KEY_CLICKMANAITA_WOOD = RegistryKey.of(RegistryKeys.ITEM, ID_CLICKMANAITA_WOOD)

/** 木製。2個増える */
val CLICKMANAITA_WOOD = ClickManaitaBaseItem(settings = Item.Settings().registryKey(KEY_CLICKMANAITA_WOOD), dropSize = 2)

/** アイテムを登録する。この関数を MOD のエントリーポイントで呼び出す */
fun register() {
    // アイテム追加
    Registry.register(Registries.ITEM, KEY_CLICKMANAITA_WOOD, CLICKMANAITA_WOOD)
}
```

`Forge`の場合は多分こんな感じで、`Item.Properties#setId`を呼べば良いはず。

```java
// 各 アイテム ID
private static final ResourceLocation ID_CLICKMANAITA_WOOD = ResourceLocation.fromNamespaceAndPath(ClickManaita.MOD_ID, "clickmanaita_wood");

// 各 アイテム リソースキー
private static final ResourceKey<Item> KEY_CLICKMANAITA_WOOD = ResourceKey.create(Registries.ITEM, ID_CLICKMANAITA_WOOD);

public static final DeferredRegister<Item> ITEMS = DeferredRegister.create(ForgeRegistries.ITEMS, ClickManaita.MOD_ID);

/**
 * 木製のクリックまな板
 * ２倍化
 */
public static final RegistryObject<ClickManaitaBaseItem> CLICKMANAITA_WOOD = ITEMS.register(KEY_CLICKMANAITA_WOOD.location().getPath(), () -> createItem(KEY_CLICKMANAITA_WOOD, 2, MaterialColor.MATERIAL_WOOD_COLOR));

/**
 * アイテムを登録する。このメソッドを MOD のエントリーポイントから呼び出す。
 */
public static void register(IEventBus eventBus) {
    // 登録
    ITEMS.register(eventBus);
}

/**
 * ClickManaitaBaseItem を作成する
 *
 * @param itemId       アイテムのID
 * @param dropSize     ドロップ数
 * @param tooltipColor ツールチップの色
 * @return ClickManaitaBaseItem
 */
private static ClickManaitaBaseItem createItem(ResourceKey<Item> itemId, int dropSize, String tooltipColor) {
    ClickManaitaBaseItem item = new ClickManaitaBaseItem((new Item.Properties().setId(itemId)), dropSize);
    item.setToolTipColor(tooltipColor);
    return item;
}
```

# ActionResult
型推論に頼っている場合は明示的に型を渡さないといけなくなりそうです。

```kotlin
// SUCCESS にすると腕を振るう
var clickResult:ActionResult = ActionResult.PASS

if (/* 何かあれば */) {
    clickResult = ActionResult.SUCCESS    
}
```

# ブロックエンティティ
`BlockEntityType.Builder`は削除された？`FabricBlockEntityTypeBuilder`になったそうです。

```diff
- val RESET_TABLE_BLOCK_ENTITY: BlockEntityType<ResetTableEntity> = BlockEntityType.Builder.create(
-     { pos, state -> ResetTableEntity(pos, state) },
-     ResetTableBlocks.RESET_TABLE_BLOCK
- ).build(null)

+ val RESET_TABLE_BLOCK_ENTITY: BlockEntityType<ResetTableEntity> = FabricBlockEntityTypeBuilder.create(
+     { pos, state -> ResetTableEntity(pos, state) },
+     ResetTableBlocks.RESET_TABLE_BLOCK
+ ).build(null)
```

# レシピのシステムの変更
大幅に変わってそう、これのせいで`ResetTable`はかなりの書き直しが必要だった。  
一番でかいのが、サーバー側のみレシピが参照できる点。クライアント側のコード（例えば`GUI`のテクスチャを描画するクラス）ではレシピにアクセスできなくなりました。

`World`クラスにレシピに関してのクラスがあったのですが、`World`の中でも`ServerWorld`にしかレシピのクラスがゲットできなくなってしまったので、まずは`if (world instanceof ServerWorld)`する必要があります。  
サーバー側で処理されるクラスの場合には（`Entity`とかはサーバー側なので`ServerWorld`になると思う）、`instanceof`で`ServerWorld`かどうか見れば特に問題はないはず。

詳しくはこの辺：  
https://fabricmc.net/2024/10/14/1212.html#serverworld-parameters

一方`GUI`のテクスチャを描画する、クライアント側にしか無い場合は**レシピにアクセスできなくなりました**。  
自作`MOD`ではレシピが存在するかを`GUI`側で確認して、無い場合は無いというテキストを`GUI`に描画するためクライアント側でもレシピを使っていた。

困った。

仕方ないので、サーバー側でレシピがあるか確認して、戻せない場合にはクライアント側へ`Fabric`の`Networking API`で通知するようにしました。  
シリアライズする必要があって面倒。

## Networking API で置き換えた話
本家の`Networking API`の説明で十分な気がするけど一応。  
https://fabricmc.net/wiki/tutorial:networking

今回はレシピが戻せない理由をクライアント側へ送ろうと思います。  
戻せない理由は`enum（初見で読めない）`で定義済みで、`enum`のシリアライズには`ordinal()`で順番を使おうと思います、、、

まずはネットワークで使う一意の`ID`を作ります。

```kotlin
/** ネットワークの ID 一覧 */
object ResetTableNetworkIds {
    /** リセットテーブルで戻せない理由をサーバーからクライアントに送るためのネットワークの ID */
    val RESET_TABLE_ERROR_NETWORK_ID = Identifier.of("clickmanaita", "reset_table_error_network")
}
```

つぎに`サーバー側`←→`クライアント側`でやり取りするためのクラスを作ります。  
`Kotlin`なら`data class`、`Java`なら`record`で作って、`CustomPayload`インターフェース（？）を実装します。

また、わかりやすいので、ここにシリアライズ、デシリアライズ用の処理も`static`で用意しておくことにします。  
`PacketByteBufs`っていう書き込むクラスが渡されて、シリアライズの際はそのクラスに順番に書き込んでいく。`writeInt()`とか、あと`Minecraft`で使いがちのブロック位置を書き込む`writeBlockPos`なんてもあります。  
デシリアライズの時は書き込んだ`PacketByteBufs`が渡されます。書き込んだ順番と同じ順番で`read`していけば良いです。

```kotlin
data class ResetTableErrorPayload(
    val blockPos: BlockPos,
    val verifyResult: ResetTableTool.VerifyResult
) : CustomPayload {
    override fun getId(): CustomPayload.Id<out CustomPayload> = ID
    companion object {
        val ID = CustomPayload.Id<ResetTableErrorPayload>(ResetTableNetworkIds.RESET_TABLE_ERROR_NETWORK_ID)
        val CODEC = PacketCodec.of<RegistryByteBuf, ResetTableErrorPayload>(
            /* encoder = */ { data, buf ->
                buf.writeBlockPos(data.blockPos)
                buf.writeInt(data.verifyResult.ordinal)
            },
            /* decoder = */ { buf ->
                ResetTableErrorPayload(
                    blockPos = buf.readBlockPos(),
                    verifyResult = ResetTableTool.VerifyResult.entries[buf.readInt()]
                )
            }
        )
    }
}
```

次はサーバー側とクライアント側でネットワークを登録します。  
`ClientPlayNetworking.registerGlobalReceiver`で、サーバー側から送られてきたデータを受け取ることができます。

```kotlin
// サーバー側
// コンストラクタなど、MOD のエントリーポイントで呼び出す。
// ネットワークの追加（クライアント・サーバー間でやり取りする）
PayloadTypeRegistry.playS2C().register(ResetTableErrorPayload.ID, ResetTableErrorPayload.CODEC)

// クライアント側
// コンストラクタなど、MOD のエントリーポイントで呼び出す。
// クライアント側は追加でネットワーク登録が必要
ClientPlayNetworking.registerGlobalReceiver(ResetTableErrorPayload.ID) { payload, context ->
    context.client().execute {
        // ネットワーク経由でイベントが来た
        // 今表示されている画面がリセットテーブルの GUI の場合はエラーを出す
        // currentScreenHandler は表示されている GUI のやつ
        val resetTableScreenHandler = (context.player().currentScreenHandler as? ResetTableScreenHandler)
        if (resetTableScreenHandler != null) {
            resetTableScreenHandler.recipeVerifyResult = payload.verifyResult
        }
    }
}
```

あとはサーバー側でクライアント側に送る処理を書けば良いはず。  
サーバー側である必要があります。多分

```kotlin
// サーバー側であること
if (player !is ServerPlayerEntity) return

ServerPlayNetworking.send(player, ResetTableErrorPayload(blockPos, verifyResult))
```

# おわりに
差分をおいておきます。

- ClickManaita Fabric 1.21 → 1.21.2
    - https://github.com/takusan23/ClickManaita2/compare/1.21-fabric...1.21.3-fabric
- ClickManaita Forge 1.21 → 1.21.2
    - https://github.com/takusan23/ClickManaita2/compare/1.21-forge...1.21.3-forge
- ResetTable Fabric 1.21 → 1.21.2
    - https://github.com/takusan23/ResetTable/compare/1.21-fabric...1.21.3-fabric

以上です。88888888。ﾉｼ