---
title: 自作 MOD を NeoForge でも遊べるようにした
created_at: 2025-03-18
tags:
- Minecraft
- Java
---
どうもこんばんわ。  
`UMPC (排熱目当て)`を持っておふとんに潜って暖を取る時期がもう終わりそう。へーくちゅん

# 本題
`NeoForge`で`MOD`を遊びたいって、`GitHub`の`Issue`に来たので対応してみる。  
https://github.com/takusan23/ClickManaita2/issues/3

`neoforge-1.21.4`!!!!  
![Imgur](https://imgur.com/urz7i7s.png)

# 今日の Minecraft MOD プレイ
マイクラに`MOD`を入れて遊ぶには`前提 MOD（MOD ローダー）`を入れる必要があるのですが、種類が3つくらいある。  
遊ぶ側としては遊びたい MOD に合わせればいいと思う。**どれも互換性はない。** どれも互換性がないので開発側としては厳しそう（こなみかん）。

- `Forge`
    - ずっとずっと前からあるやつ
    - `Fabric`よりもやっぱりこっちなんですかね？
- `Fabric`
    - バニラのバージョンアップにすぐ対応する
    - 開発者向けドキュメントがかなり充実している、`Kotlin`でも書ける！！
    - 個人的にはこれがすき、ドキュメントが優しい
- `NeoForge`
    - `Forge`のフォークだそう。互換性はない。
    - `MOD`開発者は**1.21**あたりでみんな`Forge`からこれに引っ越したらしい
    - 今のところ`Forge`からの移植は多分難しくない、`import`直すだけとか（後述）

`1.6.4`とか`1.7.10`とか`1.10.2`とか`1.12.2`まで（同窓会かな）は`Forge`だけだったはず。  

そのあとに`Fabric`っていう**バニラのアップデートに速攻対応**する`MOD ローダー`が登場した。  
`Forge`が数週間待ちに対して、これは次の日くらいには`リリースノート`が投稿され、その中で`API`や内部の仕様変更がまとめられているという開発者にめちゃ優しい。  

`Forge`は`MDK(SDK)`だけ配ってじゃあ後やってね～だから何もわからないんだよな。  
ドキュメントだってあってないようなものだし。

そのあと、`NeoForge`ていうのが`Forge`をフォークして登場したそうな。  
名前が似ているけど**互換性が無い**。ただ`modding`書いて見た感じ限りなく`Forge`の`API`に似ている。  
**1.21**あたりでかなりの開発者がこっちに移住したそう。で、私の`MOD`はこの`MOD ローダー`では遊べないので`Issue`が来た。

`NeoForge`に移行しているあたり、いま作るなら`Fabric`か`NeoForge`の2択なのかな。`Fabric`のが作りやすいと思うけど、遊ぶ側的には`NeoForge`なのかなあ。  
あと`NeoForge`もいつまで`Forge`風の`API`であり続けるか分からないし急いでやるか～～～。  
ここまでが調べた限り、`Reddit`の人たちが詳しい。

# NeoForge はじめる
これがドキュメントです、結構充実してる  
https://docs.neoforged.net/docs/gettingstarted/modfiles

で、これが`MOD`のテンプレを作ってくれるやつです  
これを開いて、`パッケージ名`、`MOD 名`を埋めて`zip`をダウンロードする。`Forge`のときよりずっと優しい。  
https://neoforged.net/mod-generator/

`パッケージ名`はドメインを逆にしたものを使うのが王道だけど、持ってなかったから`GitHub Pages (io.github)`のをずっと使ってるんだよな、  
多分被らなければ良いんじゃないかな（？）  
https://docs.neoforged.net/docs/gettingstarted/structuring

解凍して`zip`を`IDEA`で開けば`Gradle`が作業を始めてくれる。

![Imgur](https://imgur.com/Q66CqNX.png)

終わるのを待ちます。`BUILD SUCCESSFUL`みたいなのが出るはず

![Imgur](https://imgur.com/VDWQTJK.png)

処理が終わったら、`Client`を実行します。ここです

![Imgur](https://imgur.com/HTet1kT.png)

# MOD Generator のわな
`Java`のパッケージ名通りにフォルダを作ってくれないようです。  
`com.example.foo`なら`com/example/foo`って感じに、それぞれフォルダを作って入れ子にする必要があるはずなのですが、（フォルダにドットがあるとダメなはず）  
`com.example.foo`フォルダになってしまいます。これだと**ビルドは出来ますが**なにか問題が起きる可能性があります、、

![Imgur](https://imgur.com/9qkvhXy.png)

というわけで各フォルダを作って入れ子にしました。  
エクスプローラーの表示が`>`になってれば良いはず。  

![Imgur](https://imgur.com/oROPn2a.png)

# 起動してみた
クリエタブとアイテムがあります。  
食えます。

![Imgur](https://imgur.com/8S58HzE.png)

# Forge のコードから NeoForge 対応作業をする
`NeoForge`の`.zip テンプレ`を解凍して、`src/main/java`と`src/main/resources`を上書きすれば良さそう。  
ビルドに必要な`build.gradle`周りは`NeoForge`のが絶対必要。一方`Java`コードとテクスチャとかの自分で書いたものは`Forge`のを今のところ入れておく。`NeoForge`が`build.gradle`を元に開発環境を構築するので、あとは`Forge`時代の`Java`コードを直す作戦で行く。

というわけで`Forge`時代のコードに`NeoForge`のビルドに必要な`src`以外を持ってきた。  

`src`の中も`src/main/template`フォルダだけは`Forge`には無いので必要です。  
逆に`src/main/resources/META-INF/mods.toml`は`Forge`だけなので、`NeoForge`では消して良いはず。

![Imgur](https://imgur.com/BxbbM4l.png)

バージョン管理（`git`）を使って`Forge`ブランチから`NeoForge`ブランチを切った。  
`エクスプローラー`上のチェックマークとかビックリマークは`TortoiseGit`を入れているからですね。

`IDEA`の`git`統合なら、`neoforge`で上書きしても、こんな感じに上書きしたとしてもすぐ戻せるので便利  
![Imgur](https://imgur.com/ZFSiak0.png)

# Forge と NeoForge の API の違い
`1.21.4`時点です！！。あと`import`も直してください。  
`import`のパッケージ名が`neoforge`なのと、本当に少し`API`が違う。**ただ、かなり Forge の API に似てる。**

```java
// Forge
public static final DeferredRegister<Block> BLOCKS = DeferredRegister.create(ForgeRegistries.BLOCKS, ClickManaita.MOD_ID);
public static final DeferredRegister<Item> ITEMS = DeferredRegister.create(ForgeRegistries.ITEMS, ClickManaita.MOD_ID);
public static final DeferredRegister<CreativeModeTab> ITEM_GROUP = DeferredRegister.create(Registries.CREATIVE_MODE_TAB, ClickManaita.MOD_ID);

public static final RegistryObject<ClickManaitaBaseBlock> CLICKMANAITA_WOOD_BLOCK = BLOCKS.register(KEY_CLICKMANAITA_WOOD_BLOCK.location().getPath(), () -> new ClickManaitaBaseBlock(BlockBehaviour.Properties.of().mapColor(MapColor.WOOD).instrument(NoteBlockInstrument.BASS).strength(2.5F).sound(SoundType.WOOD).ignitedByLava().setId(KEY_CLICKMANAITA_WOOD_BLOCK), 2));

public static final RegistryObject<ClickManaitaBaseItem> CLICKMANAITA_WOOD = ITEMS.register(KEY_CLICKMANAITA_WOOD.location().getPath(), () -> createItem(KEY_CLICKMANAITA_WOOD, 2, MaterialColor.MATERIAL_WOOD_COLOR));

public static final RegistryObject<CreativeModeTab> CREATIVE_TAB = ITEM_GROUP.register(/* 以下省略... */);
```

```java
// NeoForge
public static final DeferredRegister.Blocks BLOCKS = DeferredRegister.createBlocks(ClickManaita.MOD_ID);
public static final DeferredRegister.Items ITEMS = DeferredRegister.createItems(ClickManaita.MOD_ID);
public static final DeferredRegister<CreativeModeTab> ITEM_GROUP = DeferredRegister.create(Registries.CREATIVE_MODE_TAB, ClickManaita.MOD_ID);

public static final RegistryObject<ClickManaitaBaseBlock> CLICKMANAITA_WOOD_BLOCK = BLOCKS.register(KEY_CLICKMANAITA_WOOD_BLOCK.location().getPath(), () -> new ClickManaitaBaseBlock(BlockBehaviour.Properties.of().mapColor(MapColor.WOOD).instrument(NoteBlockInstrument.BASS).strength(2.5F).sound(SoundType.WOOD).ignitedByLava().setId(KEY_CLICKMANAITA_WOOD_BLOCK), 2));

public static final DeferredItem<ClickManaitaBaseItem> CLICKMANAITA_WOOD = ITEMS.register(KEY_CLICKMANAITA_WOOD.location().getPath(), () -> createItem(KEY_CLICKMANAITA_WOOD, 2, MaterialColor.MATERIAL_WOOD_COLOR));

public static final DeferredHolder<CreativeModeTab, CreativeModeTab> CREATIVE_TAB = ITEM_GROUP.register(/* 以下省略... */);
```

コンストラクタ（`MOD`のエントリーポイント）の引数の違いはこれ。  
これも`import`が変わってるので注意です。

```java
// Forge
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
        IEventBus modEventBus = context.getModEventBus();
        // ブロック登録
        ClickManaitaBlocks.register(modEventBus);
        // アイテム（ブロックのアイテム）登録
        ClickManaitaItems.register(modEventBus);
    }
}

// NeoForge
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
        // ブロック登録
        ClickManaitaBlocks.register(modEventBus);
        // アイテム（ブロックのアイテム）登録
        ClickManaitaItems.register(modEventBus);
    }
}
```

あとは`MinecraftForge.EVENT_BUS`は`NeoForge.EVENT_BUS`だし、  
クラス名同じでパッケージ名だけ違うとかなので`import`直すだけとかがメインの仕事なんじゃないかな。`IDEA`なら`Ctrl + Space (Windows は)`連打のコード補完が強いからすぐ出来そう感。

![Imgur](https://imgur.com/NwR2ywN.png)

# うごいた
狐がぐるぐる回るのをしばらく見てると起動した。  
まだ`MOD`のメタデータとかは直せてないけど起動した。

![Imgur](https://imgur.com/T6RpxhC.png)

# MOD ファイル作成
`build`コマンドで`MOD ファイル`の`.jar ファイル`が出来るはず。

![Imgur](https://imgur.com/GAPajPG.png)

`build/libs`フォルダにあるはず。

![Imgur](https://imgur.com/OzCDomC.png)

# 差分
大半が`import`の修正。

https://github.com/takusan23/ClickManaita2/compare/1.21.4-forge...1.21.4-neoforge

# 事件簿
## Error: could not open clientRunVmArgs.txt
`clean`したあと、`Gradle Sync`（更新ボタンみたいなやつ）を押したら治った。

```plaintext
Error: could not open `C:\\Users\\takusan23\\Desktop\\Dev\\Minecraft\\examplemod-template-1.21.4\\build\\moddev\\clientRunVmArgs.txt'
```

![Imgur](https://imgur.com/1TOTdNM.png)

# おわりに
`生成 AI`にリリース時に使ってるテンプレ（`NeoForge バージョン x.y.z 以降が必要`）みたいなのを書かせてみた。  
私の舌足らず感ある命令でもいい感じに解釈してくれてやってくれた。

ちなみに必要な`NeoForge`のバージョンは`gradle.properties`に書いてあって、  
また`git`でバージョン管理してるので`git grep 'neo_version='`コマンドを全ブランチに対してやった。その結果がプロンプトの冒頭のあれ。  

![Imgur](https://imgur.com/y4sXgUZ.png)

![Imgur](https://imgur.com/altYOqk.png)

![Imgur](https://imgur.com/V5A5TyZ.png)

おわりです。