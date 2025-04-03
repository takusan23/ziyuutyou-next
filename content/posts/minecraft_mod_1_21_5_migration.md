---
title: 自作 MOD の Minecraft 1.21.5 移行メモ
created_at: 2025-04-03
tags:
- Minecraft
- Kotlin
- Java
---
どうもこんばんわ。

# 本題
`Minecraft 1.21.5`がリリースされたので`自作MOD`を対応させました。  
わんちゃんの柄が増えた？

![Imgur](https://imgur.com/YHFDbjG.png)

![Imgur](https://imgur.com/I7llaQs.png)

![Imgur](https://imgur.com/r07CH9j.png)

# 前回
https://takusan.negitoro.dev/posts/minecraft_mod_1_21_4_migration/

# 公式
今回も今回とて`Fabric`チームがまとめてくれているので読みます

https://fabricmc.net/2025/03/24/1215.html

# Gradle
`Fabric`と`Forge`は`8.12.1`になってます。`NeoForge`は`8.12`

# ツールチップを付けるメソッドが非推奨化
そして代替メソッドが見つからない、それっぽい名前のはあるんだけど全く引数が違う。。

## データコンポーネントとツールチップ
https://wiki.fabricmc.net/tutorial:tooltip#adding_tooltips_in_1215  

どうやらデータコンポーネント（耐久、付いているエンチャント、金床のコスト）の中にツールチップに関する処理が移動した？  
その上、ツールチップの表示処理を見ると、バニラのデータコンポーネントだけが列挙されてて、自作した所でデータコンポーネントを差し込む所が見つけられなかった。。。

## Fabric
`Fabric`の場合は`Fabric API`が独自のツールチップ追加イベントを飛ばしてくれるので、そのタイミングでやればいいらしい。  
このイベントを`MOD`初期化時に一回呼べば良い（`@Mod`がついてるクラスのコンストラクタとかで）

というわけで適当にイベント登録する関数を作って、

```kotlin
/** ツールチップイベントを拾う */
object ClickManaitaTooltipEventCallback {

    /** ツールチップ表示イベントを登録する */
    fun registerTooltipEventCallback() {
        // ツールチップの実装が変わってしまったので対応
        // https://wiki.fabricmc.net/tutorial:tooltip#adding_tooltips_in_1215
        ItemTooltipCallback.EVENT.register tooltipCallback@{ itemStack, _, _, list ->
            val tooltipText = when (val item = itemStack.item) {
                is ClickManaitaBaseItem -> item.getTooltipText()
                is ClickManaitaCustomItem -> item.getTooltipText(itemStack)
                else -> return@tooltipCallback
            }
            list.add(tooltipText)
        }
    }
}
```

`@Mod`が付いたクラスのコンストラクタで呼び出す。  
`Kotlin`で書いているので（`Fabric Language Kotlin`なので）コンストラクタじゃなくて関数だけど、、

```kotlin
@Suppress("unused")
fun init() {
    // 以下省略...

    // イベント登録
    ClickManaitaTooltipEventCallback.registerTooltipEventCallback() // これ
}
```

ちなみに`getTooltipText()`はこれ。`MutableText`を返している。

```kotlin
class ClickManaitaBaseItem(settings: Settings?, private val dropSize: Int = 2) : Item(settings) {

    /** ツールチップの文言を返す */
    fun getTooltipText(): MutableText {
        return MutableText.of(PlainTextContent.of("x$dropSize")).setStyle(Style.EMPTY.withColor(Formatting.AQUA))
    }

}
```

## NeoForge
`NeoForge`もソースコード見てたら見つけました。`Fabric`と同様にイベントを初期化時に一発購読すれば取れます。  
まずはイベントを受け取るため、イベント受け取り用のクラスを作って、メソッドを作ります。  

`Fabric`と違い、`@SubscribeEvent`を付けると受け取れます。  
どこからも呼び出されない関数なので、静的解析（`IDEA`）がこれ使ってないやん消せるって言ってきますが、実行中に呼び出されるので`@SuppressWarnings("unused")`を付けておきます。  
警告が消えるとかのレベルなんですが。  

ツールチップの上書きイベントを受け取る場合、**引数の数、型** （シグネチャ） を合わせておく必要があります。名前は多分なんでも良い。  
今回の場合は`ItemTooltipEvent`を一つだけ取るメソッドを用意しておけば良いはず。

```java
public class ClickManaitaPlayerEvent {

    /**
     * ツールチップを出すメソッドが非推奨になってしまったので
     */
    @SuppressWarnings("unused")
    @SubscribeEvent
    public void onItemTooltip(ItemTooltipEvent event) {
        ItemStack itemStack = event.getItemStack();
        List<Component> toolTip = event.getToolTip();

        MutableComponent text = switch (itemStack.getItem()) {
            case ClickManaitaBaseItem baseItem -> baseItem.getHoverText(itemStack);
            case ClickManaitaBlockItem blockItem -> blockItem.getHoverText();
            default -> null;
        };
        if (text != null) {
            toolTip.add(text);
        }
    }
}
```

このクラスを、`MOD`初期化時に一発呼べば良いはず。  
`@Mod`が付いたクラスのコンストラクタが良いかな。

```java
@Mod(ClickManaita.MOD_ID)
public class ClickManaita {

    /**
     * MODのID
     */
    public static final String MOD_ID = "clickmanaita";

    /**
     * コンストラクタ
     */
    public ClickManaita(IEventBus modEventBus, ModContainer modContainer) {
        // 省略...

        NeoForge.EVENT_BUS.register(new ClickManaitaPlayerEvent()); // これ
    }
}
```

ちなみに`getHoverText()`は`MutableComponent`を返しているだけです。

```java
public MutableComponent getHoverText(ItemStack itemStack) {
    MutableComponent text = Component.literal(toolTipText);
    text.setStyle(Style.EMPTY.withColor(TextColor.parseColor(toolTipColor).getOrThrow()));
    return text;
}
```

![Imgur](https://imgur.com/aoL8M1L.png)

## Forge
`Forge`も同様にイベントがあります。ので購読すれば良さそう。  
`NeoForge`とほぼ同じなのでコードだけ貼ります。`NeoForge`で書いたものを、`IDEA`のブランチ間差分で`Forge`側にコピペしただけなので、、、

![Imgur](https://imgur.com/OX5Dn2i.png)

```java
public class ClickManaitaPlayerEvent {

    /**
     * ツールチップを出すメソッドが非推奨になってしまったので
     */
    @SuppressWarnings("unused")
    @SubscribeEvent
    public void onItemTooltip(ItemTooltipEvent event) {
        ItemStack itemStack = event.getItemStack();
        List<Component> toolTip = event.getToolTip();

        MutableComponent text = switch (itemStack.getItem()) {
            case ClickManaitaBaseItem baseItem -> baseItem.getHoverText(itemStack);
            case ClickManaitaBlockItem blockItem -> blockItem.getHoverText();
            default -> null;
        };
        if (text != null) {
            toolTip.add(text);
        }
    }
}
```

```java
@Mod(ClickManaita.MOD_ID)
public class ClickManaita {

    /**
     * MODのID
     */
    public static final String MOD_ID = "clickmanaita";

    /**
     * コンストラクタ
     */
    public ClickManaita(FMLJavaModLoadingContext context) {
        // 以下省略...

        // プレイヤーイベント
        MinecraftForge.EVENT_BUS.register(new ClickManaitaPlayerEvent());
    }
}
```

# 道具アイテムのクラスが消えた？
つるはしクラスと、剣クラスが消えた。斧とかは残ってる。  
代わりに`new Item()`の際に`Item.Settings().pickaxe()`とかを付けるようになった？

# onStateReplaced の引数変更
見た感じ引数を直して、中身は`ItemScatterer.onStateReplaced(state, world, pos)`を呼び出すだけ？

# 差分
はい

- Fabric
    - https://github.com/takusan23/ClickManaita2/compare/1.21.4-fabric...1.21.5-fabric
- NeoForge
    - https://github.com/takusan23/ClickManaita2/compare/1.21.4-neoforge...1.21.5-neoforge
- Forge
    - https://github.com/takusan23/ClickManaita2/compare/1.21.4-forge...1.21.5-forge

# おわりに
`Kotlin`の言語レベルの`null安全`に慣れすぎて`Optional<T>`が何もわからない。。。  
~~`Optional#map`するくらいなら`早期return`してく、、れ。nullable を引き回すのは、、、~~