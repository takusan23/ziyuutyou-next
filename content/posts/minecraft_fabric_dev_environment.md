---
title: Minecraft Fabric の環境構築をしてアイテムを追加してみる
created_at: 2021-06-11
tags:
- Kotlin
- Minecraft
- Fabric
---
どうもこんにちは。  
ハジラブ -Making\*Lovers-（Making\*Lovers フルHDリマスター付き）予約しました。月末が楽しみですね。

# 本題
TwitterでForgeより快適と聞いて。  
しかもKotlinでModdingができる!!!

# 環境

| なまえ    | あたい                                                                                            |
|-----------|---------------------------------------------------------------------------------------------------|
| IDE       | Intellij IDEA 2021.1.2 Community Edition                                                          |
| Windows   | 10 Pro (そういえば発表会があるんだっけ？いい加減設定がコンパネと散らばってんのどうにかしてほしい) |
| Minecraft | 1.17 (1.7.10と空目しないで)                                                                       |
| Java      | 16（後述）                                                                                        |
| 言語      | Kotlin                                                                                            |

# Minecraft 1.17
調べた感じ、Extra UtilitiesにあったDark Glassがバニラに逆輸入？されたみたい。TTの監視で使えそう。

技術的な話をするとJava 16以上が必要です。JDKの有償化よくわからんけどAdoptOpenJDKの方なら多分大丈夫。  
ついにJavaのModdingでも型推論が（使っていいのかはよくわからん）（というか`Record`も使えるようになったのかええやん）（てかそもそも今回はKotlin使うから別に）

#### 読まなくていい　Java有償化の話
- Javaは今でも無料で使える
- JavaのJDKは色んな会社が作ってる
    - AmazonとかMicrosoftとか
    - Oracleも作ってる
- その中でOracleの作ってるOracle JDKが商用利用するなら金払えになった。
    - Java 11から出てきた話。今までのマイクラはJava 8で利用できたので。
    - Oracle JDK
        - こいつは一部を除いて有償
    - Open JDK
        - こいつは無料。ただしサポート期間が半年
- Oracle以外のJDKを選べばええ
    - AdoptOpenJDK
        - こいつは無料+サポート4年+商用利用可。もうこれ代替品だろ
    - Corretto
        - Amazon製JDK

多分間違ってる気がするのでチラシの裏的な感覚で

#### Oracle JDK 有償化の話の続き 2021/10/06 追記
どうやら、Java 17から`Oracle JDK`が無償提供されるようになりました。再び無償化。  
まーたややこしくして何がしたいんや...

というわけで`Java 17以降`は`Oracle JDK`使っても大丈夫になりました。でも今の所オラクル以外のJDKでやって行けてるのでそのまま行こうと思います。

# Java 16 を入れる
今回は`AdoptOpenJDK`を入れます。  
https://adoptopenjdk.net/ を開いて、`OpenJDK 16 (Latest)`と、`HotSpot`のラジオボタンを選んで`Latest release`を押してダウンロードしましょう。

![Imgur](https://imgur.com/IilPXDc.png)

インストールはまあ適当に進めてください。（画像ない）

一応Java 16がインストールできたか確認するために、コマンドプロンプトとかで、`javac -version`を叩きます。`javac 16.0.1`が帰ってくればおｋ

```cmd
javac -version
```

```cmd
javac 16.0.1
```

# 追記：2021/07/28 JAVA_HOMEの設定
なんか久しぶりにやったらまだJava8使ってんのかよって言われたので直します。

環境変数の設定開いて、システム環境変数の中から`JAVA_HOME`を選んで、`AdoptOpenJDK`のパスを設定します。

![Imgur](https://imgur.com/qna3UJ5.png)


# IDEAを入れる
入れておいてください。Community Editionでいいです

# テンプレートをクローン

IDEAのスタート画面から、`Get from VCS`を押して、いかのURLを指定して`Clone`します。

![Imgur](https://imgur.com/j5tEO0u.png)

| なまえ | あたい                                                  |
|--------|---------------------------------------------------------|
| URL    | https://github.com/natanfudge/fabric-example-mod-kotlin |

プロジェクトを信頼するか聞かれるので`Trust project`を押してください。

# そううまく行かない

## Could not merge JARs! Deleting source JARs - please re-run the command and move on.

`gradle.properties`を開いて、`loom_version`を`0.8`にします

![Imgur](https://imgur.com/NmjERlf.png)

## You are using an outdated version of Java (8). Java 16 or higher is required

### プロジェクトの設定
右上の`File`から`Project Structure`を選択して、`Project SDK`を`16`に、`Project language level`も`16`にします。

![Imgur](https://imgur.com/6sn3TEy.png)

適用したら、このボタンを探して押します。

![Imgur](https://imgur.com/Q7hdIIO.png)

ボタンが見つからない場合は`IDEA`の右上にある？`Gradle`を押して、`Sync`ボタンを押してもいいです。

![Imgur](https://imgur.com/0ra6jbW.png)

これで終わればいいんですが、これでも同じエラーで進めないときがあります。

### IDEAの設定
右上の`File`から`Settings`を選択して、`Build,Execution,Deployment`を押し、`Build Tools`を押し、`Gradle`へ進み、  
`Gradle JVM`を`16`にしてみてください。できたらさっきみたいにボタンを押します。

![Imgur](https://imgur.com/ejjN51l.png)

うまく行けば処理が進みます。私の環境では10分ちょっとかかった。  
`Gradle Build`が終わったら一旦IDEAを閉じます。その後もう一度起動するとマイクラのクライアントが起動できるようになります。  

![Imgur](https://imgur.com/NhEtyaF.png)

早速再生ボタンみたいなやつを押して起動してみましょう。

# 1.17 Fabric
（私だったら）起動直後設定へ進みBGMを0にします。うるさいし

![Imgur](https://imgur.com/rS1ziQj.png)

# MOD情報の変更
`gradle.properties`を開いて、以下の内容を変えます

| なまえ             | あたい                                                                             |
|--------------------|------------------------------------------------------------------------------------|
| maven_group        | 自分の持ってるドメインを逆から。持ってないならGithub Pagesとか他とかぶらない文字列 |
| archives_base_name | MODのID（小文字）                                                                  |

私ならこんな感じ？

```
#Fabric api
fabric_version=0.34.10+1.17

	loom_version=0.8-SNAPSHOT

	# Mod Properties
	mod_version = 1.0.0
	maven_group = io.github.takusan23
	archives_base_name = clickmanaita
```

また、`fabric_version`等は、以下のサイトから更新があるか確認できるので見てみるといいと思います。  

https://fabricmc.net/versions.html

# Javaのパッケージ名修正
IDEAのProject(ファイルが表示されてるところ)から`net.fabricmc.example`を選択状態にして、`Shift押しながらF6を押します`。  
押したら`Rename Package`を選び、ドメイン名(逆から)+MOD名小文字 を入力します

![Imgur](https://imgur.com/JAPuJUz.png)

続いて`resources`の方も修正します。同じように`assets.modid`を選択状態にして、`Shift押しながらF6を押します`。 
そしたら先程入力したMODのIDを入力すればいいです。

なんか残ってる`net.fabricmc`ってのは多分消して大丈夫です。

こうなっていればおｋ

![Imgur](https://imgur.com/jZ7odV0.png)

# ExampleMod.kt のファイル名修正
味気ないので`MOD名.kt`とでもしておきましょう。名前変更は先程と同じです。

![Imgur](https://imgur.com/DQvTCV5.png)

# MOD情報の修正
`resources`の中にある`fabric.mod.json`を開きます。  
開いたら、`modid`、`entrypoints.main`の部分を最低限書き換えておけばいいと思います。

```json
  "id": "clickmanaita",
```

`ドメイン(逆から)`.`MODのID`.`ExampleMod.ktだったファイル名`Kt::init

**クラス名+Kt**、Ktを付けないとダメっぽい。

```json
  "entrypoints": {
    "main": [
      "io.github.takusan23.clickmanaita.ClickManaitaKt::init"
    ]
  },
```

あとアイコンのところの`modid`もさっき変えちゃったので直しといてください。

その他は各自好きなように。以下例

```json
{
  "schemaVersion": 1,
  "id": "clickmanaita",
  "version": "${version}",

  "name": "ClickManaita",
  "description": "CheatMod",
  "authors": [
    "takusan_23"
  ],
  "contact": {
    "homepage": "https://www.curseforge.com/minecraft/mc-mods/clickmanaita",
    "sources": "https://github.com/takusan23/ClickManaita2"
  },

  "license": "Apache-2.0 License",
  "icon": "assets/clickmanaita/icon.png",

  "environment": "*",
  "entrypoints": {
    "main": [
      "io.github.takusan23.clickmanaita.ClickManaitaKt::init"
    ]
  },
  "mixins": [
    "modid.mixins.json"
  ],
  "depends": {
    "fabricloader": ">=0.8.7",
    "fabric": "*",
    "fabric-language-kotlin": "*",
    "minecraft": "1.17.x"
  },
  "suggests": {
    "flamingo": "*"
  }
}
```

# よくわからんけど Mixin も修正
`resources`内の`modid.mixins.json`を開いて、`package`の部分を直します。これなんなの？  
`ドメイン`.`MODのID`.`mixin`

```json
{
  "required": true,
  "package": "io.github.takusan23.clickmanaita.mixin",
  "compatibilityLevel": "JAVA_8",
  "mixins": [
  ],
  "client": [
    "ExampleMixin"
  ],
  "injectors": {
    "defaultRequire": 1
  }
}
```

# 起動してみる

これで起動するはず。多分

# アイテムを追加してみる

https://fabricmc.net/wiki/tutorial:items

この通りにやってみる

まずアイテムクラス(Kotlinだしobjectでもいいわ)を作ります。

```kotlin
object ClickManaitaItem {

    /** 特になんの機能もないアイテム */
    val CLICKMANAITA_WOOD = Item(FabricItemSettings().group(ItemGroup.TOOLS))

}
```

![Imgur](https://imgur.com/ap6YcZj.png)

そしたら`ExampleModKt`だったファイルを開いて、`init`関数内でアイテムを登録します。

```kotlin
@Suppress("unused")
fun init() {
    // This code runs as soon as Minecraft is in a mod-load-ready state.
    // However, some things (like resources) may still be uninitialized.
    // Proceed with mild caution.

    // アイテム追加。clickmanaita_woodのところはアイテムID
    Registry.register(Registry.ITEM, Identifier("clickmanaita", "clickmanaita_wood"), ClickManaitaItem.CLICKMANAITA_WOOD)

}
```

そしたら起動してみましょう。  
画面のようにアイテムが追加できていれば成功。

![Imgur](https://imgur.com/5ZrM8r6.png)

# テクスチャ
画像ファイルを用意します。用意できたら、`resources/assets/MODのID/textures/item/アイテムID.png`って感じで置きます。

![Imgur](https://imgur.com/ezwosDY.png)

そしたら今度は、`resources/assets/MODのID/models/item/アイテムID.json`って感じでJSONファイルを作成します。  
中身はこうです。

```json
{
  "parent": "item/generated",
  "textures": {
    "layer0": "clickmanaita:item/clickmanaita_wood"
  }
}
```

`modのID:item/アイテムのID`って感じですね。このテキスチャ指定まじでややこしいからやめてほしい。  
というかJSONは人間が書くもんじゃないだろ。本当に

成功してました。失敗してたらまじでつらい

![Imgur](https://imgur.com/4M5ParB.png)

### おまけ　クリックまな板みたいにクリックしたら増えるように

そのためには`Item`クラスを継承する必要があります。ので`ClickManaitaBaseItem`みたいなクラスを作成します。

```kotlin
/**
 * 右クリックしたらアイテムが増えるアイテムを追加する
 *
 * @param settings クリエタブとか
 * @param dropSize 増える数
 * */
class ClickManaitaBaseItem(settings: Settings?, private val dropSize: Int = 2) : Item(settings) {

}
```

そしたら`useOnBlock`メソッドをオーバーライドします。多分これがブロックを右クリックしたときに呼ばれる関数です。  

```kotlin
/**
 * ブロックを右クリックしたときに呼ばれる関数
 * */
override fun useOnBlock(context: ItemUsageContext?): ActionResult {
    val world = context?.world
    val state = world?.getBlockState(context.blockPos)
    val copyBlock = state?.block
    repeat(dropSize) {
        copyBlock?.afterBreak(world, context.player, context.blockPos, state, null, context.stack)
    }
    return ActionResult.SUCCESS
}
```

そしたらItem()の部分をClickManaitaBaseItem()に書き換えて実行してみると

```kotlin
object ClickManaitaItem {

    /** 右クリックしたらアイテムが増える */
    val CLICKMANAITA_WOOD = ClickManaitaBaseItem(settings = FabricItemSettings().group(ItemGroup.TOOLS), dropSize = 2)

}
```


増えます。まだチェストの中身とかは増えないのでまだまだって感じですかね。

![Imgur](https://imgur.com/xsXFHrp.png)

# ソースを読めるようにする
Minecraftのソースを読めるようにします。IDEAには逆コンパイラーが搭載されているのでなくても最悪いいですが、検索機能が使えないのでソースを生成しといたほうがいいと思います。

IDEAの`Gradle`を押して、`Tasks` > `fabric` > `genSources` をダブルクリックすることで生成されます。

![Imgur](https://imgur.com/U0U2TCL.png)

その後、適当にBlockクラスとかを参照した際に、上に出てくる`Choose Sources...`を押して、`なんとか-sources.jar`を選択することで生成したソースを読むことができるようになります。

![Imgur](https://imgur.com/qHRSVnB.png)

`Shift`+`Ctrl`+`F`の検索機能も開放されました。

![Imgur](https://imgur.com/PCDBcwG.png)

# 配布可能ファイルを生成する

IDEA右上の`Gradle`から、`Tasks`>`build`へ進み`build`を選択することで配布可能なJarファイルを生成します。  
成功すると、`build/libs/`に生成したファイルが有るはずです。（dev、sources、sources-dev じゃない方）  
あとはこのJarファイルをCurseForgeとかで公開すればいいんじゃない？

![Imgur](https://imgur.com/6J6OyJb.png)

# エンドユーザー向けの説明とか
このModは`Fabric`導入後、`mods`フォルダに以下のファイルをダウンロードして放り込んでおく必要があります。

- Fabric API
  - https://www.curseforge.com/minecraft/mc-mods/fabric-api/files
- Fabric Language Kotlin
  - Kotlinという言語で書かれたため、他のMODと違い必要になる。
  - https://www.curseforge.com/minecraft/mc-mods/fabric-language-kotlin/files
- Mod本体

# ソースコード
ソースコードです。  
https://github.com/takusan23/ClickManaita2/tree/1.17-fabric

クローンしたあとブランチ名「1.17-fabric」をチェックアウトしてください。一発でビルド通らないと思う。

# 追記：2021/07/28 1.17.1への対応
git使ってる場合はコミットするなりブランチ作るなりして現状の環境壊れても大丈夫な状態にしてください。  
使ってなければどっかにバックアップしておけばいいのでは

`gradle.properties`を、最新の情報に更新します。  
最新の値は「https://fabricmc.net/versions.html」から確認することが出来ます。

以下一例 (なんかコードブロックの言語にproperties指定したらシンタックスハイライト動いててちょっと感動)

```properties
kotlin.code.style=official
org.gradle.jvmargs=-Xmx1G

# Fabric Properties
	# Check these on https://modmuss50.me/fabric.html
minecraft_version=1.17.1
yarn_mappings=1.17.1+build.31
loader_version=0.11.6

#Fabric api
fabric_version=0.37.1+1.17

	loom_version=0.8-SNAPSHOT

	# Mod Properties
	mod_version = 1.0.0
	maven_group = io.github.takusan23
	archives_base_name = clickmanaita

# Kotlin
	kotlin_version=1.5.0
	fabric_kotlin_version=1.6.0+kotlin.1.5.0
```

これで後は`Minecraft Client`を起動するだけで1.17.1へ対応できました。  
マイナーアップデートなのでクラスの変更とか無いけど大型アップデートならそううまく行かないと思う。

# 終わりに
いつもAndroidで書いてるKotlinでModdingできるので快適。Fabricへ移植したいから会社辞めたい。  
そういえば私のマイクラ全盛期はナポアンのマイクラが最新Ver追いかけてたけどあのサイトどうなってんの？