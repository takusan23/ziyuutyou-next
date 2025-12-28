---
title: 自作 MOD の Minecraft 1.21.11 移行とマッピング移行メモ
created_at: 2025-12-30
tags:
- Minecraft
- Kotlin
- Java
---
どうもこんばんわ。  
~~1.21.11 対応版がクリスマスプレゼントです。~~ もう年末ですね。寒い！！！

# 本題
`Minecraft 1.21.11`が来たので`自作MOD`を対応させました。やり？の使い方がわからんかった。。  
チェストがクリスマス仕様？一体何のことやら

![攻略中](https://oekakityou.negitoro.dev/resize/4b1f3104-7b8e-4edb-a94e-a5ba200bf3be.png)

![おわり](https://oekakityou.negitoro.dev/resize/75b43aaf-3382-4da5-8f47-e0aa29ed2111.png)

`NeoForge`と`Forge`に関しては、特にそんな大きな変更はないです。  
また`Fabric`に関しても大きな変更はありません。`Yarn マッピング`から`Mojang マッピング`の移行作業をやるならそこそこ大変です。

# 前回

https://takusan.negitoro.dev/posts/minecraft_mod_1_21_9_and_1_21_10_migration/

# 差分
`Fabric`ですが、`Yarn マッピング`から`Mojang マッピング`へ移行したため差分が大きいです、

- https://github.com/takusan23/ClickManaita2/compare/1.21.10-fabric...1.21.11-fabric
- https://github.com/takusan23/ClickManaita2/compare/1.21.10-neoforge...1.21.11-neoforge
- https://github.com/takusan23/ClickManaita2/compare/1.21.10-forge...1.21.11-forge

# ドキュメント
`Fabric`チームが書いてくれた資料です。  
今回は`Mojang マッピング`への移行を行うので、難読化がなくなった記事も。

https://fabricmc.net/2025/12/05/12111.html

https://fabricmc.net/2025/10/31/obfuscation.html

`NeoForge`も。今の段階の`Fabric`と違って`Mojang マッピング`を使っているのでその話があります。

https://neoforged.net/news/21.11release/

# 難読化がなくなったというニュース

https://www.minecraft.net/en-us/article/removing-obfuscation-in-java-edition

難読化されなくなる。  
今までは`Minecraft`の`.jar ファイル`を何らかの方法で`.java コード`相当に復元したとしても、でたらめな名前が表示されるだけになると思う。やったことないので知らない。

目的としては、でたらめな名前に置き換えることで解析をある程度妨害できるので、中で使っているプログラムや画像、音声なんかを引っこ抜かれないようにするため。だと思ってる。  
（次点にでたらめな短い名前に置き換えればコード自体が小さくなり、ファイルサイズ自体が小さくなるのも見込めますが、多分それが目的じゃないと思うので）

ところが難読化を辞めるとのこと。`MOD`ユーザーのためだって。  
お金取ってるゲームでこの判断がみんなにも出来るだろうか。

これまでにも`MOD`ユーザーには結構親身に対応してくれていて、`Mojang`は`Minecraft`を難読化しつつも、数年前から難読化を解除し元のプログラムに戻すためのファイルを公開していました。  
（`マッピングファイル`、難読化する前の名前とした後の名前の関連付けを記録したファイル）  
が、今回は難読化自体をやめてしまおうと。

大きなニュースに思えますが、遊ぶ側は特に影響ないです。  
また作る側も、難読化されないので元の`Minecraft`コードが見やすくはなると思う・・・今までは各自`マッピングファイル`を使って難読化前相当のコードを生成してたのでその手間がなくなる。くらい。  

`NeoForge`と`Forge`はすでに`Mojang 公式マッピングファイル`を利用していたため、置き換えが大変みたいな問題ないはず？  
`Fabric`は自分たちで`マッピングファイル`を作っていました。そして今回、難読化を辞めたバージョンより`自分たちで作ったマッピング`を廃止することを決定したそうです。

まずは`SNAPSHOT`リリースから難読化を解除した版が配信されるとのこと。  
いつ正式版に適用されるかわからないので、`1.21.11`の今急いでやる必要もない。が、そこまで大変じゃなかったです（後述）

## ついでにバージョン命名ルールも変わる

https://www.minecraft.net/en-us/article/minecraft-new-version-numbering-system

`1.21.11`の次は`26.1`になる。`iOS`みたいになったね。  
これが俗に言う`カレンダーバージョニング`ですか、今よりわかりやすくなるならそれでいいと思います。

## Fabric チーム側の話
これは完全に余談ですが、公式の声明をみてください。

https://fabricmc.net/2025/10/31/obfuscation.html

`Fabric`の`modding`では`Mojang 公式マッピング`ではなく、自分たちで作っていた`Yarn マッピング`がデフォルトで採用されていました。（`modding`テンプレートがそれだったはず）  
同じ`MOD`でも、`Fabric`の`コード`と`NeoForge / Forge`での`コード`を見比べると、部分的に名前が違って見えるのは、この`マッピング`が違うから。  
難読化された`クラス名、関数名`にどんな名前をつけるか。の関連付けをしてくれていたのが、この`Yarn / Mojang マッピングファイル`だったわけですね。

`Yarn マッピング`は`Intermediary`というプロジェクトが生成した賜物でした。  
この`Intermediary`は、難読化された`関数、クラス`に、人間がわかる名前をつける機能だけでなく、バージョンを跨いで人間が読める同じ名前を付ける機能もありました。

難読化は新しいバージョンが公開されるたびに行われます。よって、例えば`Blocks.jar`は今のバージョンでは`ab.java`になっていても、新しいバージョンでは`aab.java`になるかもしれません。  
`Intermediary`はちゃんと`クラスや関数の中身`を見て前のバージョンと同じなら同じ名前をつけてくれました。

ある程度`MOD`で遊んだことがあればわかるかもしれないですが、バグ修正バージョンで同じ`MOD`ファイルがなぜか遊べるみたいな。  
バグ修正バージョン対応版を開発者が出さなくても、なぜか動いているみたいな。この裏側には`Intermediary`がいたわけ・・・  

ところが、難読化がされなくなるということは、`Yarn/Mojang マッピング`自体がそもそも不要になることを意味します。  
そのため、`Yarn マッピング`は廃止されることが発表されました。既存のバージョン向けには残るが、新しくリリースされることはなく、**テンプレートや Fabric ドキュメントでは Mojang マッピングを採用するようになります。**

![using_mojang_mapping](https://oekakityou.negitoro.dev/original/03e8f82f-9b7f-4827-a4f9-d42b297d603a.png)

## 遊ぶ側メリット
**ほぼない**。しいていえば

クラッシュしたときのスタックトレースが意味のある文字列になる。のと、  
`Minecraft`の挙動を調べるとかはわんちゃん出来るんじゃないでしょうか。調べるにしろ`EULA`が引き続き適用されるとは思いますが。

## 作る側メリット
https://docs.fabricmc.net/develop/getting-started/intellij-idea/generating-sources

難読化されなくなるため、`Yarn / Mojang マッピング`から`Minecraft`のソースコードを復元する手間がなくなるはず。  
`Gradle`にある`genSources`する手間が不要に！

https://github.com/takusan23/ClickManaita2?tab=readme-ov-file#minecraft-%E3%81%AE%E3%82%BD%E3%83%BC%E3%82%B9%E7%94%9F%E6%88%90

あとは`マッピングファイル`からソースの復元とは違い、そもそも難読化されないので、**関数の中で使われている変数名**（ローカル変数）の名前がそのまま表示されるようになるはず？。  
`ProGuard`によらないと思うが、`マッピングファイル`の手が及ぶのは`クラス`と`クラスの関数、変数`まで。それ以上の、関数内の変数名は難読化されている以上見れなかったんじゃないかな？

正直、大きく取り上げた割には時間が節約できるとか、関数の中の変数の名前が見れるとかなので、実はそこまで大騒ぎすることでもない。

# Fabric Mojang マッピング移行
本家

https://docs.fabricmc.net/develop/migrating-mappings/

私は`Kotlin`で書いているので、`Loom Gradle プラグイン`ではなく、`Ravel IDEA プラグイン`の方を使うことにした。  
`Java`のみの場合はどちらでも良いらしい。

https://docs.fabricmc.net/develop/migrating-mappings/ravel

![plugin_download](https://oekakityou.negitoro.dev/resize/4acf21cc-44aa-415e-961a-34cc7fc8a123.png)

上の手順にしたがって入れます。`zip`ファイルがダウンロード出来るので、`IDEA`の`設定`の`プラグイン`の設定を開いて、`歯車`を押して`Install Plugin From Disk`を選び、さっきの`zip`を読み込む。

![install_plugin](https://oekakityou.negitoro.dev/resize/828c882a-fb3a-4b7b-9586-25044c632d5f.png)

次に、`yarn マッピング`と`mojang マッピング`のファイルをダウンロードします。  

`yarn`の方は、  
https://maven.fabricmc.net/net/fabricmc/yarn/

から、今使っている`yarn マッピング`のバージョンを選択してダウンロード。`gradle.properties`を開いて、ここの値と同じものを探します。

```toml
minecraft_version=1.21.11
yarn_mappings=1.21.11+build.3 # ←これ
loader_version=0.18.4
loom_version=1.14-SNAPSHOT
fabric_kotlin_version=1.13.8+kotlin.2.3.0
```

![同じバージョンを探す](https://oekakityou.negitoro.dev/original/514071fa-499a-4461-b0c5-c8f08d73b071.png)

見つけたら開いて、その中の`mergedv2.jar`ファイルをダウンロードします。

![ダウンロード](https://oekakityou.negitoro.dev/original/5f837952-965b-4968-afb3-2b93dd8c0359.png)

ダウンロードできたら、`7zip`等を使い展開し、`mappings`フォルダの`mappings.tiny`を探します。このファイルが必要です。

![展開](https://oekakityou.negitoro.dev/original/3dff1bb2-8d06-4fb8-8220-cb30a19dc4c3.png)

![これが欲しかった](https://oekakityou.negitoro.dev/original/8ed5ce3a-bd47-4f26-8d5a-f9e90bcf746f.png)

`Mojang マッピング`の方は以下を開いて、  
https://piston-meta.mojang.com/mc/game/version_manifest_v2.json

![JSON](https://oekakityou.negitoro.dev/original/64778bc7-c6e2-4694-a92b-a3b861d844c6.png)

`JSON オブジェクト`がいくつもありますが、自分のバージョン（今回`1.21.11`）が書いてある`JSON オブジェクト`を探し、その中の`url`の値に書いてあるアドレスにアクセスします。

![client_mappings_object](https://oekakityou.negitoro.dev/original/1c720398-8d1d-4c8a-b67b-66caa507a09d.png)

開いたら、サイト内検索で`client_mappings`で検索をかけます。  
見つかったら同様に`url`の値のアドレスにアクセスしてください。できたら、謎の文字がいっぱいでてくるので、何でも良いのでダウンロードしてください。

![client.txt](https://oekakityou.negitoro.dev/original/6e2ea5bc-f17f-46b7-9f77-00ec278a9722.png)

一番楽なのは`Webサイト`を右クリックして`名前をつけて保存`するのがいいかと。

## 2つそろった

適当にファイルを選んで右クリックし、`Refactor`を押して、`Remap Using Ravel`を押します。

![Ravel](https://oekakityou.negitoro.dev/original/1754e330-661b-4128-882d-577af3cc32e6.png)

するとこんなダイアログがでます。

![Ravel_dialog](https://oekakityou.negitoro.dev/original/5a9b544d-7ec9-42f0-abab-85bab2209a52.png)

まず左側の`+`を押します。`Add Local File Mappting...`を選びます。選んだら、ファイルを選ぶ画面になるので、まずは`yarn`の方を読み込ませます。  
`mappings.tiny`ですね。

![add_mapping](https://oekakityou.negitoro.dev/original/2c741f94-3f36-4879-845b-3806f7f6e81b.png)

![dialog](https://oekakityou.negitoro.dev/original/35855882-a958-43c2-b406-866b51316594.png)

選んだら、それぞれ以下のように選びます。

| なまえ                | あたい   |
|-----------------------|----------|
| Source Namespace      | named    |
| Destination Namespace | official |

出来たら`OK`、同様に`Mojang`の`client.txt`を選び、以下のように選びます。

| なまえ                | あたい |
|-----------------------|--------|
| Source Namespace      | target |
| Destination Namespace | source |

最後、右側に`モジュール`が表示されています。一個ずつ選んで`+`ボタンを押しましょう。すべてやります。

これで`OK`を押すと処理が始まります。

## yarn とのお別れ
`build.gradle`ファイルを開き、以下の`yarn_mappings`の1行を`officialMojangMappings()`に置き換えます。

```diff
- mappings "net.fabricmc:yarn:${project.yarn_mappings}:v2"
+ mappings loom.officialMojangMappings()
```

`gradle.properties`ファイルの`yarn_mappings`の値も使わなくなったので削除できます。

```diff
- yarn_mappings=1.21.11+build.3
```

## エラーを治す
`IDEA`を使っている場合は、左の`虫メガネボタン`を押すか、`Shift + Ctrl + F`キーを同時押しするかで全体検索を出すことが出来ます。
ここで、`TODO(Ravel)`で検索をかけることで、自動で置き換えできなかった箇所が見つかるという仕組み。

![TODOを解決](https://oekakityou.negitoro.dev/original/7108a898-2db0-453c-b112-4540000986ac.png)

`package name`がおかしい言われてますが、確かに存在するのでよくわからない。

あと普通に`Java`コードの`import`間違えている箇所があるのでそれは手動で直した。

## Gradle Sync する
`IDEA`の右にある`ゾウのボタン`（`Gradle`）を押し、その中にある`更新ボタン`みたいなのを押します。  
これをするまでソースコードが赤いままになると思う。

![GradleSync](https://oekakityou.negitoro.dev/original/22c5c30d-351c-4bdd-8293-9712c60b488a.png)

これで終わりなはず・・・！

## 起動してみる
`再生マーク`の隣りにあるドロップダウンメニューを`Minecraft Client`にしてチャレンジ・・・

![実行](https://oekakityou.negitoro.dev/original/615dfb26-6b98-404a-96b2-1f5895d5ff8a.png)

しっぱい！ｗ  
コード直します。

## 'useWithoutItem' overrides nothing. Potential signatures for overriding

```plaintext
'useWithoutItem' overrides nothing. Potential signatures for overriding:
fun useWithoutItem(blockState: BlockState, level: Level, blockPos: BlockPos, player: Player, blockHitResult: BlockHitResult): InteractionResult
```

`NonNull`だったらしい。シグネチャ違い

```kotlin
override fun useWithoutItem(blockState: BlockState?, level: Level?, blockPos: BlockPos?, player: Player?, blockHitResult: BlockHitResult?): InteractionResult?
```

を

```kotlin
override fun useWithoutItem(blockState: BlockState, level: Level, blockPos: BlockPos, player: Player, blockHitResult: BlockHitResult): InteractionResult
```

したらなおった。ところで`modding`において`Kotlin`と`Java`相互の`Null安全`の体験、こんなにも良かった記憶ないんだけど。  
と思って調べたら`Null`系アノテーションが`JSpecify`になったらしい。相互利用が良くなったのはこれのおかげかも知れない

## Type argument is not within its bounds: must be subtype of 'Any'.
`<T>`だと`Any?`、`null`を許容できてしまうので、`<T:Any>`して`NonNull`の型のみにする

```kotlin
private fun <T : Any> applyEffects(
    entries: List<ConditionalEffect<T>>,
    lootContext: LootContext,
    onEffect: (T) -> Unit
) { }
```

## Argument type mismatch: actual type is 'Item.Properties?', but 'Item.Properties' was expected
同様に`NonNull`が保証されたらしい

```kotlin
class ClickManaitaBaseItem(settings: Properties?, private val dropSize: Int = 2) : Item(settings)
```

が

```kotlin
class ClickManaitaBaseItem(settings: Properties, private val dropSize: Int = 2) : Item(settings)
```

## Mojang マッピングしょかん

- `Kotlin`を使っている場合、`?（Nullable）`を消していく作業
    - `NonNull`なの？信じるよ？
- ワールドクラスが`Level`って名前なんだけど由来何なんだろう、？
    - これとかは`yarn`のが好きだった
- なんか`i`とか`j`とかの引数名の時があるんだけど手動で難読化してるの？
    - 誰ののせいなのかわからん

## jar ファイル作成
作る側はこれまで通り`gradle`の`build`で良いはず。

## 遊ぶ側
遊ぶ側も同様に`MOD`の`jarファイル`と`Fabric API`と、私みたいに`Kotlin`で書いている場合は`Fabric Language Kotlin`を`mods`フォルダへ入れれば起動できた。

# そのほか
ここからは`Fabric`、`NeoForge`、`Forge`で同じ！

## Gradle

- `Fabric`
    - `9.2.1`
- `NeoForge`
    - `9.2.0`
- `Forge`
    - かわらず？

## ResourceLocation→Identifier 名前変更

https://neoforged.net/news/21.11release/#renaming-of-resourcelocation-to-identifier

`NeoForge`や`Forge`みたいに`Mojang マッピング`を使っている場合の話。

```java
private static final ResourceLocation ID_CLICKMANAITA_WOOD = ResourceLocation.fromNamespaceAndPath(ClickManaita.MOD_ID, "clickmanaita_wood");
private static final ResourceKey<Item> KEY_CLICKMANAITA_WOOD = ResourceKey.create(Registries.ITEM, ID_CLICKMANAITA_WOOD);

public static final DeferredRegister.Items ITEMS = DeferredRegister.createItems(ClickManaita.MOD_ID);
public static final DeferredItem<ClickManaitaBaseItem> CLICKMANAITA_WOOD = ITEMS.register(KEY_CLICKMANAITA_WOOD.location().getPath(), () -> /* 省略... */ );
```

`ResourceLocation`を`Identifier`に置き換える。`location()`も`identifier()`に置き換える

```java
private static final Identifier ID_CLICKMANAITA_WOOD = Identifier.fromNamespaceAndPath(ClickManaita.MOD_ID, "clickmanaita_wood"); // ここと
private static final ResourceKey<Item> KEY_CLICKMANAITA_WOOD = ResourceKey.create(Registries.ITEM, ID_CLICKMANAITA_WOOD);

public static final DeferredRegister.Items ITEMS = DeferredRegister.createItems(ClickManaita.MOD_ID);
public static final DeferredItem<ClickManaitaBaseItem> CLICKMANAITA_WOOD = ITEMS.register(KEY_CLICKMANAITA_WOOD.identifier().getPath(), () -> /* 省略... */ ); // ここ
```

ところで、この`Identifier`は`Fabric`の`Yarn マッピング`で使われていた名前なんですよね。以下参照  
`Mojang マッピング`は`ResourceLocation`だった。が、なぜか今`Fabric`と同じ名前に変わった。

```kotlin
private val ID_CLICKMANAITA_WOOD = Identifier.of("clickmanaita", "clickmanaita_wood")
private val KEY_CLICKMANAITA_WOOD = RegistryKey.of(RegistryKeys.ITEM, ID_CLICKMANAITA_WOOD)

val CLICKMANAITA_WOOD = ClickManaitaBaseItem(settings = Item.Settings().registryKey(KEY_CLICKMANAITA_WOOD), dropSize = 2)
Registry.register(BuiltInRegistries.ITEM, KEY_CLICKMANAITA_WOOD, CLICKMANAITA_WOOD)
```

`NeoForge`チームも言っていますが、どういう風の吹き回しでこのような改名になったのかは中の人しかわからないでしょう。

- 単に`ResourceLocation`よりも短いから採用した説
- `Fabric`製`MOD`の`Mojang マッピング`の移行時の混乱を避けるため説
- `Yarn マッピング`のことを忘れないようにするため説
    - 尊敬と言うか敬意というか

## NonNull アノテーション

https://neoforged.net/news/21.11release/#jspecify-nullability-annotations

使ったことがなくてよくわからないですが、`JSpecify`ってライブラリの`@NonNull`アノテーションが採用されたらしいです。  
`Kotlin`の`null安全`機能は、`Kotlin`言語で書くだけでなく、`Java`言語でも`@NonNull`を書いたコードに対しても発動します。なので`Mojang マッピング`への移行をしつつ、`NonNull`に書き直すようにする必要もあります。

`Optional`を駆逐できるようになるのかはわかりません。  
わたしてきには`Optional#isPresent()`が`nullable != null`よりも優れてるとはあんまり思わないので、アノテーション付けるだけでいい感じに支援されるならもうそれでいいと思った。

# おわりに
`IDEA`の`Start Free Trial`ボタンめっちゃ緑色で自己主張してて草