---
title: OSSRH から Central Portal へ移行する
created_at: 2025-08-12
tags:
- Kotlin
- Gradle
- MavenCentral
---
どうもこんばんわ、あつくて特にはないです！！

# 本題
とっくのとうにですが、`OSSRH`が終了して、後継の`Central Portal`なるものに移行したらしい。  
既存ユーザーの自動的な移行は最後まで行われなかったので、いまログインして移行を確認することになりそう。

# 環境
私は`Central Portal (OSSRH)`へライブラリをアップロードするのに`gradle-nexus/publish-plugin`を使っています。  
（`io.github.gradle-nexus.publish-plugin`）

他を使っている場合は多分役に立たない、、

# Central Portal へログインしてみる

https://central.sonatype.com/

`Sign in`を押して、`OSSRH`の管理画面ログインで使ってたメアド、パスワードを入れる。  
400 帰ってきたんやが、、
　　
![centralportal1](https://oekakityou.negitoro.dev/original/3af0ea2c-d908-4d81-8468-2d43fa015cf8.png)

リロードしたらログインできてた、大丈夫そう？

![centralportal2](https://oekakityou.negitoro.dev/original/1c591535-b2fa-48ac-8717-57d473af2b8d.png)

# ライブラリを公開用する build.gradle.kts を修正
https://github.com/gradle-nexus/publish-plugin

ここに書いてあるようにやっていきます。

## ルートの build.gradle.kts
まずはルートの`build.gradle.kts`を開き、`nexusUrl`と`snapshotRepositoryUrl`を指示通りに修正します。

```kotlin
nexusPublishing.repositories.sonatype {
    username.set(extra["ossrhUsername"] as String)
    password.set(extra["ossrhPassword"] as String)
    nexusUrl.set(uri("https://ossrh-staging-api.central.sonatype.com/service/local/")) // ここと
    snapshotRepositoryUrl.set(uri("https://central.sonatype.com/repository/maven-snapshots/")) // ここ
}
```

また、`stagingProfileId.set(...)`は使わないみたいなので、消して良さそうです。

それから、`group`変数？へ値をいれる必要があるみたいです。  
`version`は無くても動いてるけど、`group`はないと失敗してしまった。

```kotlin
plugins {
    alias(libs.plugins.android.application).apply(false)
    alias(libs.plugins.android.library).apply(false)
    alias(libs.plugins.kotlin.android).apply(false)
    alias(libs.plugins.compose.compiler).apply(false)
    // akaricore ライブラリ公開で使う
    alias(libs.plugins.gradle.nexus.publish.plugin)
}

// io.github.gradle-nexus.publish-plugin で利用
// これを追加する
group = "io.github.takusan23"
```

# local.properties
認証情報を更新します。`OSSRH`の頃のキーは使えないので。

https://central.sonatype.org/publish/publish-portal-ossrh-staging-api/#plugins-tested-for-compatibility

https://central.sonatype.com/account

↑から`Generate User Token`を選んで、`OK`を選んで、`Username`の欄と`Password`の欄をコピーします。

![centralportal3](https://oekakityou.negitoro.dev/original/1709efeb-cb00-4d17-9c0a-0a84eceac1fd.png)

![centralportal4](https://oekakityou.negitoro.dev/original/a0a1c5f5-851b-4278-84e7-be6f090649d3.png)

`GitHub Actions`等を使っている場合は、そっちのシークレットも更新！

# コマンドを修正する
一つ足す必要がある？

```shell
gradlew publishToSonatype
```

↓

```shell
gradlew publishToSonatype closeSonatypeStagingRepository
```

# 実行する
上記の`gradle`コマンドを実行してしばらく待ちます。  
`Gradle`のコマンドパレット？機能

![publish1](https://oekakityou.negitoro.dev/original/724c6606-aef5-48d4-9e79-73f8b0ef327d.png)

成功したら、`Central Portal`の`View deployments`の画面を開いて、おなじみの`Drop`するか`Publish`するかが選べます。  
`Drop`で破棄、`Release`で公開になります。

![publish2](https://oekakityou.negitoro.dev/original/9f266856-fe98-43c4-a240-a9e732128bc9.png)

![publish3](https://oekakityou.negitoro.dev/original/2d0e1adf-1c3a-474d-9aff-cb3b0ca7def4.png)

![publish4](https://oekakityou.negitoro.dev/original/e7dd8460-282d-4c75-8754-afd3354a1991.png)

そういえば、`OSSRH`のときは`Close`からの`Release`だったので、一つ工程が減った？

# さぶん
多分動いてる、

https://github.com/takusan23/AkariDroid/commit/1a2767b64a19bc3332284325a5df80855fcc114d#diff-c0dfa6bc7a8685217f70a860145fbdf416d449eaff052fa28352c5cec1a98c06

# おわりに
難しいって！

現状、`Android`や`Java`だけじゃなく、`Kotlin Multiplatform (Compose Multiplatform)`のライブラリホスティングにも`Maven Central`が使われていて、  
この敷居の高さでは、他のマルチプラットフォームと戦うのは厳しいような気がします。

`Kotlin Multiplatform`を流行らせるにはこのライブラリホスティングをどうにかしないといけないと思います。  
やったことないんで言うのあれだけど、`npm publish`とかもっと簡単なんじゃないですか・・？

公式で手順があるので、ちょっとだけ敷居は下がったの、かも。

- https://www.jetbrains.com/help/kotlin-multiplatform-dev/create-kotlin-multiplatform-library.html#examine-the-project-structure
    - 公式の`Kotlin Multiplatform`ライブラリの作り方

# おわりに2
環境変数の名前変えたなら、`GitHub Actions`の方も直してくださいね（一敗）

お疲れ様でした、888