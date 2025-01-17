---
title: クリックまな板を1.18に移行した話
created_at: 2021-12-02
tags:
- Kotlin
- Minecraft
- Fabric
- Forge
---
どうもこんばんわ。  
けもの道☆ガーリッシュスクエア 攻略しました。  
https://whirlpool.co.jp/kemonomichi-gs/

かわいい。

![Imgur](https://i.imgur.com/Ms6q4Ag.png)

一本道のハーレムルート！誰も不幸にならない幸せルートでいいね

![Imgur](https://i.imgur.com/thklLcG.png)

# 本題
クリックまな板を**Minecraft 1.18**に更新したときに遭遇したエラーなど(ほぼFabricの話)

# --- Fabric 編 ---

## 1.17との変更点

- `Java 17` が必要になりました
    - 私の環境では`Eclipse Adoptium`の`Java 17`を利用しています。
        - IDEA右上のFileからProject Structureを選択して、JDKのバージョンを17にします。
        - IDEAの設定を開き、Build,Execution,Deployment > Build Tools > Gradle へ進み、Gradle JVMを17にします。
    - OracleJDKも無償提供に戻ったので、別にOracleJDKつかってもいいはず？
- `Gradle`は`7.3`以降が必要です
    - 1.17から引き継ぐ際は注意
- loader_version
    - `0.12.8`
- fabric_version
    - `0.43.1+1.18`
- loom_version
    - `0.10-SNAPSHOT`
- fabric_kotlin_version
    - `1.7.0+kotlin.1.6.0`

### build.gradle

全部載せると長いので変更点だけ

Java 17 を利用するように

```java
sourceCompatibility = JavaVersion.VERSION_17
targetCompatibility = JavaVersion.VERSION_17
```

```java
tasks.withType(JavaCompile) {
    it.options.encoding = "UTF-8"

    // Minecraft 1.18 (1.18) upwards uses Java 17.
    it.options.release = 17
}
```

```java
compileKotlin.kotlinOptions.jvmTarget = "17"
```

### gradle.properties

いっぱい変更点がある。

```properties
kotlin.code.style=official
org.gradle.jvmargs=-Xmx1G

# Fabric Properties
	# Check these on https://modmuss50.me/fabric.html
minecraft_version=1.18
yarn_mappings=1.18+build.1
loader_version=0.12.8

#Fabric api
fabric_version=0.43.1+1.18

	loom_version=0.10-SNAPSHOT

	# Mod Properties
	mod_version = 1.0.0
	maven_group = io.github.takusan23
	archives_base_name = ClickManaita-Fabric-1.18

	# Kotlin
	kotlin_version=1.6.0
	fabric_kotlin_version=1.7.0+kotlin.1.6.0
```

### gradle-wrapper.properties

Gradle 7.3 を利用するようにします。

```
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-7.3-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

### fabric.mod.json

こっちは変更部分だけ

エントリーポイントの登録、なんか変わってたので修正

```json
"entrypoints": {
  "main": [
    {
      "adapter": "kotlin",
      "value": "io.github.takusan23.clickmanaita.ClickManaitaKt::init"
    }
  ]
},
```

Minecraft 1.18、Java 17、loader 0.12.8 を指定します

```json
"depends": {
  "fabricloader": ">=0.12.8",
  "fabric": "*",
  "fabric-language-kotlin": "*",
  "minecraft": "1.18.x",
  "java": ">=17"
},
```

### modid.mixins.json

使ってないけど一応

Java 17 を指定します。

```
"compatibilityLevel": "JAVA_17",
```

## 直してもそう簡単に動かない
3回ぐらい壁にぶち当たった。しんどい

### Exception in thread "main" java.lang.NoClassDefFoundError: joptsimple/OptionSpec

```
Exception in thread "main" java.lang.NoClassDefFoundError: joptsimple/OptionSpec
Caused by: java.lang.RuntimeException: Unsupported access widener format (v2)
```

- IDEAのキャッシュを消したら治りました。
    - ここから消せます

![Imgur](https://i.imgur.com/Qb0Db6s.png)

### Failed to read accessWidener file from mod fabric-content-registries-v0

- コマンドプロンプトを開いて、以下のコマンドを実行したら治りました。

```
gradlew --refresh-dependencies
```

![Imgur](https://i.imgur.com/NhDFypB.png)

### There is insufficient memory for the Java Runtime Environment to continue

メモリが足りません！！！！  
(もしかしたらCドライブの空きがなくて、スワップでも無理だったからこれが出たのかも)

# --- Forge 編 ---

## 1.17.1 との違い
Fabricと同じ？

- `Java 17` が必要になりました
    - 私の環境では`Eclipse Adoptium`の`Java 17`を利用しています。
        - IDEA右上のFileからProject Structureを選択して、JDKのバージョンを17にします。
        - IDEAの設定を開き、Build,Execution,Deployment > Build Tools > Gradle へ進み、Gradle JVMを17にします。
    - OracleJDKも無償提供に戻ったので、別にOracleJDKつかってもいいはず？
- `Gradle`は`7.3`以降が必要です
    - mdk落としてくればついてくるので特に関係ないはず

更新の仕方よく知らないので**Forgeのmdk落としてきて1.17.1の環境にコピペした**。  
多分`build.gradle`をいじれば更新できると思うけど。  

1.18のmdkコピーしたらIDEA開き直して右上の`Gradle`から`Tasks > forgegradle runs > genIntellijRuns`を実行。

### Caused by: java.lang.UnsupportedClassVersionError: net/minecraftforge/fml/loading/targets/FMLClientLaunchHandler has been compiled by a more recent version of the Java Runtime (class file version 61.0), this version of the Java Runtime only recognizes class file versions up to 60.0

IDEAのFileから、`Project Strcture`を開き、`Project SDK`にJava 17を指定します。

![Imgur](https://i.imgur.com/dTueBHD.png)

影響あったのは、クリエイティブタブのローカライズがちょっとだけ変わってたって所かな。  
(そもそもアップデートが大規模過ぎて1.18に分割したって話だっけ？そうなら影響あまりなさそう？)

# 終わりに
**Forge / Fabric 共に`1.18`へ移行した際のコードの書き換えはほぼ無かったです。**  
(いや気付いて無いだけかもしれない)

ソースコード置いておきます
- 1.18 Fabric版
    - https://github.com/takusan23/ClickManaita2/tree/1.18-fabric
- 1.18 Forge版
    - https://github.com/takusan23/ClickManaita2/tree/1.18-forge

MOD開発者さんがんばってください。おつ。８８８８８８