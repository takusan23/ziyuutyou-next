---
title: 自作 MOD を Minecraft 1.20.6 へ移行した感想
created_at: 2024-05-28
tags:
- Minecraft
- Java
- Kotlin
---

どうもこんにちは。  
これは超会議でもらってきたお菓子です。

![Imgur](https://imgur.com/NhiRLN6.png)

# 本題
`Minecraft 1.20.6`向けに自作 MOD を更新しました。  
なんか、ここ最近で一番でかい変更だった気がする、、、

![Imgur](https://imgur.com/wD01PRY.png)

![Imgur](https://imgur.com/fFiwzkw.png)

今回も`Fabric`の方々が差分を書いてくれているので（まじ助かる）、それを見るといいです。  
https://fabricmc.net/2024/04/19/1205.html

# そのまえに
最近のマイクラ知らない人向け（私！）  

バージョンアップの際にどの数字を +1 するか、つまり`X.Y.Z`のどこを`+1`するか。の考えに、`セマンティックバージョニング (SemVer)`というものがあります。   
これは、大雑把、雑に言うと、バグ修正の場合は一番けつの数字、`.Z`のところを`+1`する。  
機能追加だけど、コードの修正が必要な破壊的変更が無い場合、`.Y`を`+1`する。`.Z`は`0`に戻す。  
破壊的変更で、もうコード自体が大幅に書き換わった場合は`X`を`+1`する。`.Y.Z`は`0`に戻す。・  
みたいなやつです。

最近のマイクラはなんというか、セマンティックバージョニングのルールには従ってなくて（**そもそも最初から従っていたかも不明ですが**）、  
数年前なら、`1.10`の`mod`が`1.10.2`でも動いたかもしれませんが、現代の`Minecraft`でその考えはもう通用しません。  
（一番ケツの数字は無視して良い考えは出来ない）

一番ケツの数字が増えたとき、それがバグ修正なのか、はたまたメイン機能追加なのかは、バージョンを見るだけではわからなくなりました。  
例を上げると、  

- `1.20.4` → `1 20.5`
    - メジャーアップデート
    - MOB の追加がされたようです。
    - 追加とともに、内部も大幅に変わったそうです（`NBT`の廃止？）
- `1.20.5` → `1.20.6`
    - `1.20.5`のバグ修正です

なんで`1.21`にしないんだろう、よくわからない（そもそも`1.`が`2.`になるものだと）

# 環境
`Java 21`が必要です。こちらは`21`になりました。  
`JDK`は`Eclipse Adoptium`を私は使ってます、何でもいいと思います。`Oracle`は、、、うーん？  
`GitHub Actions`とか使っている場合は、そちらの`JDK`も更新しましょう。

# エンチャント
エンチャントは`Builder()`が出来たので、クラスを作る必要はなくなりました。  
なんの機能を持たない`Item`を作るのと同じ感覚です。  

# NBT が廃止
廃止なんだろうけど、なんか内部的には残ってそう？  

https://minecraft.wiki/w/Data_component_format

`NBT`が廃止され、`データコンポーネント`とか言うのに置き換わった。  
アイテムのダメージとか、アイテムに付いているエンチャントとかが、このデータコンポーネントで記録されるようになった。  
ただ、やっぱり`NBT`がまだ残っているので、アイテムにメタデータが付いているかの判定をする際には、`データコンポーネント`と`NBT`両方を見る必要があります。

https://github.com/takusan23/ResetTable/blob/a446c573132d17266e63fa829f7da0d613aae035/src/main/kotlin/io/github/takusan23/resettable/tool/ResetTableTool.kt#L86-L88

`NBT`が廃止なんですけど、`MOD`開発者はいいとして、これデータパック作者とか、配布ワールド作者には前連絡行ったんですかね？  
`NBT`を付けるコマンドとかが**軒並み動かなくなってる**と思うんですけど、、、  

スポーンブロックを作るコマンドとか直さないと動かなそう。  

これ、一番けつの数字バージョンアップでやることじゃないやろこれ・・・

# ルートテーブル
戦利品テーブル？  

ブロックを壊したときに、何のアイテムをドロップさせるか、の`API`がルートテーブル周りの仕組みを使うようになった（よくわからない）。  
ブロックを壊したときのドロップアイテム、`JSON`で書かないといけないんですけど、これ`MOD`開発だけじゃなく、主にデータパック？の作者が使ってる？  

そのデータパックで何ができるのかよく知らないので、置き換わった`API`も何が出来るのかよく分からなかった。  

今までは、ブロックを壊したときのドロップアイテムは、`Block`クラスに`getDropItem()`みたいなメソッドが生えていたはず？で、  
今回のバージョンからは、なんか`LootContextParameter`？（名前忘れた）みたいなやつがいて、そいつにクエリ（問い合わせる）することでドロップアイテムが手に入る。  

例えば、問い合わせるときに、`シルクタッチ付きのつるはし`を引数に渡すことで、ガラスブロックとか、葉っぱブロックは、ドロップアイテムを返すようになる。  
何も付いていない`つるはし`を渡した場合は多分何も帰ってこない。

一般的にはこれで事足りてると思うんですけど、  
この、エンチャントの条件とか、適正ツールの条件をまとめて返してくれる`API`がなさそう？問い合わせるための`API`しかない。？？？

# レシピ
レシピの`JSON`が地味に変更になっています。  
`Fabric`の差分にもなくて困ってた。まじで`JSON`書きたくねえ

```diff
{
  "type": "minecraft:crafting_shaped",
  "pattern": [
    "DDD",
    "DDD",
    "DDD"
  ],
  "key": {
    "D": {
      "item": "minecraft:crafting_table"
    }
  },
  "result": {
-   "item": "clickmanaita:clickmanaita_wood"
+   "count": 1,
+   "id": "clickmanaita:clickmanaita_wood"
  }
}
```

https://diary.negitoro.dev/notes/718f63f4349281e42e193322

https://diary.negitoro.dev/notes/718f66934c723ce274d08224

# ブロックの Entity 登録
`Minecraft`側`BlockEntityType`を使えるようになったので、`Fabric`側は非推奨になりました。

```diff
- import net.fabricmc.fabric.api.`object`.builder.v1.block.entity.FabricBlockEntityTypeBuilder
+ import net.minecraft.block.entity.BlockEntityType
```

# PacketByteBuf
これもよくわからないのですが、`サーバー・クライアント`間での、データのシリアライズに今までは`PacketByteBuf`を使っていたのが、  
なんか自前でシリアライズ、デシリアライズの処理が実装できるようになった？  

`PacketByteBuf`も引き続き使えるらしいんだけど、なんか動かなっかたので、指示通り作ることにした。  
https://github.com/takusan23/ResetTable/blob/1.20.6-fabric/src/main/kotlin/io/github/takusan23/resettable/screen/ResetTableScreenHandlerServerClientData.kt

上記のクラスのように、クラス内の（渡す必要がある）変数を順番に書き込んで、また戻す際は書き込んだ順番に取り出すと動くはず。  
何が変わったのかはよくわからない。うーん。むずかしい。

# おわりに
`Java`のラムダ式、メソッド参照をしているところがほとんどでしたが、これそんなに読みやすいのかな。どうしても慣れない。  
ラムダ式にメソッド参照渡すの、そんなに読みやすいのかな。`Intellij IDEA`は置き換えようとしてくるけど、そんなに読みやすいかなこれ。

```java
public class Main {
    public static void main(String[] args) {
        List<String> arrayList = new ArrayList<>();
        arrayList.add("Java 8");
        arrayList.add("Java 16");
        arrayList.add("Java 21");
        // メソッド参照
        arrayList.stream().forEach(System.out::println);
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        List<String> arrayList = new ArrayList<>();
        arrayList.add("Java 8");
        arrayList.add("Java 16");
        arrayList.add("Java 21");
        // ラムダ式を取る
        arrayList.stream().forEach(text -> System.out.println(text));
    }
}
```

メソッド参照でメソッド渡すならまだ分かるけど、`String::new`みたいな。インスタンス生成までされると追いつけない。。Java 力が足りないだけか。  
以上です。お疲れ様でした

# おわりに2
なんか年々`Java`で記述する部分が`JSON`に移行していっている。（直近あったのはドロップアイテムが`json`で指示するようになった）  
データパック？とか言うのはよく知らないんですけど、そっちに引っ張られているのでしょうか？

でも`JSON`、人間が書くものじゃないと思うんだけど。