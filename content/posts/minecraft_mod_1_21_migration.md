---
title: 自作 MOD の Minecraft 1.21 移行メモ
created_at: 2024-07-02
tags:
- Minecraft
- Kotlin
- Java
---
どうもこんにちは。  
`Minecraft 1.21`で新登場の自動作業台、めっちゃ強くない？  
`工業化 MOD`みたいに電力が必要なわけでもなければ、かまどみたいに時間がかかるわけでもない、明石信号一発で作れる。  

# 本題
自作`MOD`の`Minecraft 1.21`移行記録です。  
今回も今回とて変更が多かった

![Imgur](https://i.imgur.com/kTfjOYB.png)

![Imgur](https://i.imgur.com/KoqVwLu.png)

今回も`Fabric`の方々が差分を書いてくれているので、それにのっかります。ありざいす。  
https://fabricmc.net/2024/05/31/121.html

# 前回
https://takusan.negitoro.dev/posts/minecraft_mod_1_20_6_migration/

# 変更点をコードで見せろ
- Fabric
    - https://github.com/takusan23/ClickManaita2/compare/1.20.6-fabric...1.21-fabric
- Forge
    - https://github.com/takusan23/ClickManaita2/compare/1.20.6-forge...1.21-forge

# (Fabric だけ) Identifier を Identifier.of に置き換える
`new Identifier`を`Identifier.of`という`static メソッド`に置き換えます。  

```diff
-    Registry.register(Registries.ITEM, Identifier("clickmanaita", "clickmanaita_wood"), ClickManaitaItem.CLICKMANAITA_WOOD)
+    Registry.register(Registries.ITEM, Identifier.of("clickmanaita", "clickmanaita_wood"), ClickManaitaItem.CLICKMANAITA_WOOD)
```

`Fabric`のブログを見ると、`Identifier.of`を作る`static メソッド`を作って`static import`すればコードを短縮できて良い！と言ってますが、  
個人的には`static import`あんまり好きじゃないので私はやっていません。  
たかだか10数行をメソッド呼び出しに置き換えるだけなので、、、

# フォルダ名変更
一部の、`JSON`を格納するフォルダ名（ディレクトリ名）が複数形ではなく単数形の英単語を使うようになりました。  
分かりにくい仕様変更すぎんよ～  

https://fabricmc.net/2024/05/31/121.html

- `recipes`→`recipe`
- `minecraft/tags/blocks/mineable`→`minecraft/tags/block/mineable`
- `loot_tables/blocks`→`loot_table/blocks`

**多分 MOD 開発者だけじゃなくデータパック作ってる人たちも巻き込まれてるはず。**  
ただ、よく見ると、`tags`はそのまま`tags`のままだったりと、部分的に単数形になった。何がやりたいのかよく分からない。

# エンチャント
もうこれはエンチャントアップデートです。エンチャント全部実装し直しです。  

めっちゃわかりやすい記事がありました。データパックの話みたい。ありがとうございます。  
https://qiita.com/Hirobao1/items/c6c307cdbad0589d43a3

データパックはよく分からずで端折ります、、、今回は`MOD`移行の話なので！

## やるべきこと
- エンチャント追加の JSON を作る
- エンチャントのトリガー、効果 を記述する Java
    - バニラのエンチャントのトリガー、効果を使える場合はスキップできる
- **エンチャントテーブルからエンチャントを付与できる旨の JSON を作る**

## エンチャントも JSON
エンチャントの追加が`JSON`になりました。  
こんなかんじです。ファイル名がエンチャントの`ID`になります。

ファイルパス：`src/main/resources/data/{MOD_IDが入る}/enchantment/{エンチャントID}.json`

```json
{
  "anvil_cost": 1,
  "description": {
    "translate": "enchantment.clickmanaita.clickmanaita_enchant"
  },
  "effects": {
    "clickmanaita:block_right_click": [
      {
        "effect": {
          "type": "clickmanaita:clickmanaita_enchant_effect",
          "drop_size": {
            "type": "minecraft:lookup",
            "values": [
              2,
              4,
              8,
              16,
              32,
              64
            ],
            "fallback": 2
          }
        }
      }
    ]
  },
  "max_cost": {
    "base": 51,
    "per_level_above_first": 10
  },
  "max_level": 5,
  "min_cost": {
    "base": 1,
    "per_level_above_first": 10
  },
  "slots": [
    "mainhand"
  ],
  "supported_items": "#minecraft:enchantable/durability",
  "weight": 10
}
```

`JSON`だとコメントが書けないので、以下貼り付けたらエラーになるのですが、一応説明するとこうです。  
パット見で何がなんだか分からないと思うので書きます。

```js
{
  "anvil_cost": 1, // これは Java から変わらないはず
  "description": {
    "translate": "enchantment.clickmanaita.clickmanaita_enchant" // ローカライズのキー。en_us.json みたいな
  },
  "effects": { // エンチャントの効果（後述します）
    "clickmanaita:block_right_click": [ // エンチャントの起動条件（後述します）
      {
        "effect": { // エンチャントの効果（後述します）
          "type": "clickmanaita:clickmanaita_enchant_effect", // 効果の種類
          "drop_size": { // エンチャントレベルによって、値を変更する（後述します、この例ではドロップ数）
            "type": "minecraft:lookup",
            "values": [
              2,
              4,
              8,
              16,
              32,
              64
            ],
            "fallback": 2
          }
        }
      }
    ]
  },
  "max_cost": { // これは Java から変わらないはず
    "base": 51,
    "per_level_above_first": 10
  },
  "max_level": 5, // これは Java から変わらないはず
  "min_cost": { // これは Java から変わらないはず
    "base": 1,
    "per_level_above_first": 10
  },
  "slots": [ // これは Java から変わらないはず
    "mainhand"
  ],
  "supported_items": "#minecraft:enchantable/durability", // エンチャントが付与できるアイテムタグ（後述します）
  "weight": 10 // これは Java から変わらないはず
}
```

## JSON エンチャントの思想
おそらく、エンチャントと効果（動作）が 1:1 の関係じゃなくなった。  
データパックで自作のエンチャントが作れるのか何なのかよく分からないですが、エンチャントの追加自体は`JSON`になった。

が、おそらく、エンチャントのトリガーと効果は引き続き`Java （Fabric なら Kotlin でも可）`で書かないといけない。  
トリガーならいくつかバニラのがあるけど、、、どうだろう？、多分なくて作る羽目になりそう。  
効果はほぼ確実に書き直し、がほとんど気がする。  

**ただ、運良くバニラのエンチャントの進化系（数値いじっただけ）みたいな場合だとバニラのを指定して JSON 書き直すだけで動くかも。**  
**エンチャントと効果が切り離されたメリットですね。**

こんな感じで切り離されたので、コード上でも変化が起きています。（と`Fabric`の方々が言っています）  

例えばシルクタッチの道具なら、蜂の巣を壊しても、蜂が開放されないでブロックに残る？仕様みたいなのですが、  
これの実装は、今プレイヤーが持っている道具にシルクタッチが付いているか。という条件分岐で作られていました。（今までは）

このバージョンからは、代わりに**蜂の巣を壊しても、蜂がブロックに残るエンチャント一覧**みたいなのをあらかじめ定義しておいて、  
プログラムで実装する際は、**そのエンチャント一覧を取得し、該当のエンチャントが道具に付いているか**を判定するようになっているみたいです。この例では一覧にシルクタッチがあるわけです。  

この機能のことを、`エンチャントタグ`と呼んでいるらしく、データパック作者が、この仕組みに乗っかれば、自作エンチャントでも蜂の巣回収機能をつけられるようになるというわけですね。  

擬似コード（擬似なので動かないです！）で表すと、  
`player.getMainHandItem().getEnchantments().contains(SILK_TOUCH) == true`  
みたいなコードだったのが、  

`player.getMainHandItem().getEnchantments().any(enchant -> enchant.getTags().contains(NO_SPAWN_BEE_IN_MINING)) == true`  
みたいになるらしい。分かりにくくてごめん。

## めんどそう
エンチャントタグをつけて、コードで判定する部分をエンチャントが付いているか、からエンチャントタグがついているかの判別に書き直す方法でいい気がする。  
複数エンチャントがあるならトリガーと効果を作って使い回すとかが出来そう。

## バニラのトリガー、効果一覧
`Wiki`で、、、よく分からん。

https://ja.minecraft.wiki/w/エンチャントのカスタマイズ

# 後述の解説
いやまじでよくやったよな、`JSON`でエンチャントを定義するとか。

## effects オブジェクト
エンチャントの起動条件を入れるオブジェクトです、  
オブジェクト内、キーがトリガー（後述します）、値が効果（後述します）です。  

`effects`はオブジェクトなので、複数の起動条件を入れることが出来ます。  

```json
"effects": {
    "clickmanaita:block_right_click": [
        { ... }
    ]
}
```

## トリガー
エンチャントの効果を呼び出すトリガー。`minecraft:damage`や`minecraft:hit_block`がある。  
ブロックを叩いた時の`minecraft:hit_block`が使えそうな気がしたんですが、これ右クリックじゃ動作しないので自前実装確定です。

そしてすいません、トリガーとか適当なこと言ってますが、正式名称はおそらく**エフェクトコンポーネント**です。

## 効果
エンチャントの効果です。  
効果といってもザックリ2（3？）パターンあって、アイテム自体の値を変更するか、それ以外。  
上記の`minecraft:damage`だと、攻撃力の変更が出来る。値の変更。耐久値とかもある。  
一方`minecraft:hit_block`は、値の変更ではなく、実際になにか動作を起こすことが出来ます。ブロックを置き換える等。

そしてすいません、これも効果とか適当なこと言ってますが、正式名称は多分、**エンチャントエフェクト**です。

## 効果へ指定する値
攻撃力とかの変更が、ある程度自由にできます。  

https://ja.minecraft.wiki/w/エンチャントのカスタマイズ/効果形式/level_based_value

`linear`を使うと、エンチャントレベルに応じて増加、減少する数値が設定できる。  
掛け算でかけられる値を渡す感じ。

`lookup`を使うと、エンチャントレベルごとに指定した数値が渡されるようになります。  
最大レベルのときだけ、べらぼうな数値を指定したい。みたいなときに使うと良さそう。  
今回は面倒だったので、これ使ってます。たかだか5個くらいなので。

他にもあります！

## supported_items
エンチャントが付けられるアイテム。  
剣にしかつかないエンチャント（攻撃力等）、道具にしかつかないエンチャント（シルクタッチ等）、釣り竿にしかつかないエンチャント（宝釣り？）を指定する。  

**ちなみに、エンチャントテーブルでエンチャントを付与できるようにするには、後述する JSON を別途書く必要があります**

# エンチャントテーブルで付与できるようにするには
以下の`JSON`を書いて、指定されたファイルパスに置かないといけません。  
ファイルパス：`src/main/resources/data/minecraft/tags/enchantment/in_enchanting_table.json`

```json
{
  "values": [
    "{MOD_ID}:{エンチャントのID}"
  ]
}
```

例えば今回追加したエンチャントなら、

```json
{
  "values": [
    "clickmanaita:clickmanaita_enchant"
  ]
}
```

## エンチャントテーブル以外で入手する方法
`tradeable.json`を作り、同様に記述することで、村人との交易に出現するそうです。バニラでは修繕（`Mending`）等が入ってます。  
結構柔軟性があるのねこれ。後は敵の持ってる道具に付与するとかも出来るらしい（たまにいるエンチャント付きの装備、道具付けたあれ）

# エフェクトコンポーネントとエンチャントエフェクトを実装する
`Forge`も`Fabric`も、細かい`API`が違うくらい（クラス名、メソッド名が違うくらい、引数自体が違うとかはなかったと思う。）で、大体は同じです。  
でも`Kotlin`で書いてるせいで参考にならないと思うけど。`生成AI`に`Java`で書き直してって言えば書き直してくれそう。  

あ、エフェクトコンポーネントはバニラのを使う、エンチャントエフェクトは自前で作るとかなら適当に読み飛ばして。

## エフェクトコンポーネント
トリガーの方です。  
`BLOCK_RIGHT_CLICK_EFFECT_COMPONENT`を`static`で用意します。`hit_block`を参考にしながら、右クリック版`hit_block`を作ろうとしているので、`LootContextParamSets`とかは`hit_block`のままです。  
多分作りたいエフェクト（トリガー）に近いバニラのを参考にするのが一番良さそう。よく分からん。

```kotlin
/**
 * minecraft:hit_block が右クリックじゃ動作しないので、右クリックで発動する hit_block 。
 * クリック板は右クリックなので。
 */
object EnchantRightClickEffectComponent {

    /** [net.minecraft.enchantment.Enchantment.getEffect]の引数としてこれを使う */
    val BLOCK_RIGHT_CLICK_EFFECT_COMPONENT: ComponentType<List<EnchantmentEffectEntry<EnchantmentEntityEffect>>> = ComponentType.builder<List<EnchantmentEffectEntry<EnchantmentEntityEffect>>>().apply {
        codec(EnchantmentEffectEntry.createCodec(EnchantmentEntityEffect.CODEC, LootContextTypes.HIT_BLOCK).listOf())
    }.build()

}
```
上記の例は 2 種類あるといったエンチャントの、それ以外の方です。  
エンチャントエフェクトで、数値を変更するタイプのエンチャントエフェクトを作りたい場合は、`EnchantmentEffectEntry<EnchantmentEntityEffect>`を`EnchantmentEffectEntry<EnchantmentValueEffect>`で、`ComponentType.builder`すればいいんじゃないかなあ、、、

## エンチャントエフェクト
効果の方です。`EnchantmentEntityEffect`を継承します。  
`CODEC`とかは他の`EnchantmentEntityEffect`を継承しているクラスを真似ました。エフェクトの`JSON`で数値をキー名`drop_size`で取っているので、`fieldOf`でも同じく。  
`apply`が実際にトリガーされた際に呼ばれます。ここでクリックしたブロックを渡して、自前の増やしている処理を呼び出しているわけです。

```kotlin
/**
 * エンチャントのカスタムエフェクト
 * エンチャントは JSON で記述できるようになったけど、実際の動き、動作は Java で書かないといけない。
 * JSON から受け取った値が [lookupDropSize]になる。
 */
data class ClickManaitaEnchantEntityEffect(
    private val lookupDropSize: EnchantmentLevelBasedValue
) : EnchantmentEntityEffect {

    override fun apply(world: ServerWorld?, level: Int, context: EnchantmentEffectContext?, user: Entity?, pos: Vec3d?) {
        val dropSize = lookupDropSize.getValue(level).toInt()
        val blockPos = BlockPos.ofFloored(pos)
        val player = user as? PlayerEntity ?: return

        ClickManaitaItemTool.manaita(dropSize, world, blockPos, player)
    }

    override fun getCodec(): MapCodec<out EnchantmentEntityEffect> = CODEC

    companion object {

        /** JSON で書かれたエンチャントの effect: { } 項目のシリアライズ、デシリアライズをする */
        val CODEC: MapCodec<ClickManaitaEnchantEntityEffect> = RecordCodecBuilder.mapCodec { instance ->
            instance.group(
                EnchantmentLevelBasedValue.CODEC.fieldOf("drop_size").forGetter { it.lookupDropSize }
            ).apply(instance) { p1 -> ClickManaitaEnchantEntityEffect(p1) }
        }
    }
}
```

ちなみに上のほうで、エンチャントエフェクトは、値を変更するか、それ以外と言いましたが、上記のコードはそれ以外の方ですね。  
値を変更するエンチャントエフェクトを作りたい場合は`EnchantmentValueEffect`を継承すればいいはずです。値を変更するだけなので、`apply`メソッドの引数は最小限です。  
使ったこと無いのでよく知りません、、、

## エフェクトコンポーネントの発動
もちろん、書いただけではダメで、実際にエフェクトコンポーネントを発動させるコードを仕込んでおく必要があります。  
`Forge`の右クリックイベントは`@SubscribeEvent public void onBlockRightClickEvent(PlayerInteractEvent.RightClickBlock event) { }`です。  
`Fabric`なら`UseBlockCallback.EVENT.register { -> }`です。両者共に 2 回ずつ呼ばれますが、これは右手左手でそれぞれ呼ばれるからですね。

そんなに長くないしまるまる貼っちゃいます。  
`createHitBlockLootContext`や`applyEffects`は`EnchantmentHelper`クラスや`Enchantment`クラスがやってるのをお借りした。

```kotlin
/** ブロックをクリックしたイベントを拾う */
object ClickManaitaEnchantClickCallback {

    /** クリックイベントを登録する関数 */
    fun registerClickManaitaEnchantCallback() {
        UseBlockCallback.EVENT.register { playerEntity, world, hand, blockHitResult ->
            val blockPos = blockHitResult.blockPos
            val blockState = world.getBlockState(blockPos)
            val blockPosVec3d = blockPos.toCenterPos()
            // 持ち手によって分岐
            val currentItem = when (hand) {
                Hand.MAIN_HAND -> playerEntity.mainHandStack
                Hand.OFF_HAND -> playerEntity.offHandStack
                else -> return@register ActionResult.PASS
            }

            // サーバー側
            if (world !is ServerWorld) return@register ActionResult.PASS

            // スニークしてないでチェストクリック時 は即 return（クリックイベントを消費せずに）
            if (!playerEntity.isSneaking && blockState.hasBlockEntity()) return@register ActionResult.PASS

            // ドア（とその亜種）をクリックした場合、開けるのを優先。でもスニーク状態ならやらない
            if (!playerEntity.isSneaking && blockState.contains(Properties.OPEN)) return@register ActionResult.PASS

            // SUCCESS にすると腕を振るう
            var clickResult = ActionResult.PASS

            // clickmanaita:block_right_click エフェクトコンポーネントを呼び出す
            // 動作は minecraft:hit_block のそれと同じ、それの右クリック板。
            val itemEnchantmentsComponent = currentItem.getOrDefault(DataComponentTypes.ENCHANTMENTS, ItemEnchantmentsComponent.DEFAULT)
            val enchantmentEffectContext = EnchantmentEffectContext(currentItem, EquipmentSlot.MAINHAND, playerEntity) { playerEntity.sendEquipmentBreakStatus(it, EquipmentSlot.MAINHAND) }
            itemEnchantmentsComponent.enchantmentEntries.forEach { (enchant, level) ->
                val effectEntries = enchant.value().getEffect(EnchantRightClickEffectComponent.BLOCK_RIGHT_CLICK_EFFECT_COMPONENT)
                applyEffects(
                    entries = effectEntries,
                    lootContext = createHitBlockLootContext(world, level, playerEntity, blockPosVec3d, blockState),
                    onEffect = { effect ->
                        clickResult = ActionResult.SUCCESS
                        effect.apply(world, level, enchantmentEffectContext, playerEntity, blockPosVec3d)
                    }
                )
            }

            clickResult
        }
    }

    private fun createHitBlockLootContext(world: ServerWorld, level: Int, entity: Entity, pos: Vec3d, state: BlockState): LootContext {
        val lootContextParameterSet = LootContextParameterSet.Builder(world)
            .add(LootContextParameters.THIS_ENTITY, entity)
            .add(LootContextParameters.ENCHANTMENT_LEVEL, level)
            .add(LootContextParameters.ORIGIN, pos)
            .add(LootContextParameters.BLOCK_STATE, state)
            .build(LootContextTypes.HIT_BLOCK)
        return LootContext.Builder(lootContextParameterSet).build(Optional.empty())
    }

    private fun <T> applyEffects(
        entries: List<EnchantmentEffectEntry<T>>,
        lootContext: LootContext,
        onEffect: (T) -> Unit
    ) {
        entries
            .filter { it.test(lootContext) }
            .forEach { onEffect(it.effect()) }
    }
}
```

## Minecraft に登録
エフェクトコンポーネントと、エンチャントエフェクトを`Minecraft`に追加します。多分コンストラクタ内で。  
あと右クリックイベント。

```kotlin
/**
 * エントリーポイント。起動時にinit関数が呼ばれる
 */
@Suppress("unused")
fun init() {
    // アイテム追加 省略...
    // ブロック追加 省略...
    // ブロックアイテム追加 省略...
    // クリエタブ 省略...

    // エンチャントのカスタムエフェクト、カスタムエフェクトのトリガー条件を追加
    Registry.register(Registries.ENCHANTMENT_ENTITY_EFFECT_TYPE, Identifier.of("clickmanaita", "clickmanaita_enchant_effect"), ClickManaitaEnchantEntityEffect.CODEC)
    Registry.register(Registries.ENCHANTMENT_EFFECT_COMPONENT_TYPE, Identifier.of("clickmanaita", "block_right_click"), EnchantRightClickEffectComponent.BLOCK_RIGHT_CLICK_EFFECT_COMPONENT)
    ClickManaitaEnchantClickCallback.registerClickManaitaEnchantCallback()
}
```

# おわりに
エンチャント以外は移行難しくないはず、エンチャントがとにかく厳しそう