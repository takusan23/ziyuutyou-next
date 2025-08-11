---
title: MavenCentral にライブラリをアップロードしようとしたら 401
created_at: 2024-06-21
tags:
- MavenCentral
---
どうもこんばんわ。  

# 追記 2025-08-12
`OSSRH`→`Central Portal`はここ！

https://takusan.negitoro.dev/posts/maven_central_ossrh_to_central_portal/

# 本題
`GitHub Actions`を使ってボタンを押すだけでライブラリのリリース、今日も使おうと思ったら失敗してしまった。  
その調査です。

![Imgur](https://i.imgur.com/jPY6u4r.png)

![Imgur](https://i.imgur.com/T6cHzV3.png)

```plaintext
Received status code 401 from server: Content access is protected by token
```

# おことわり
この記事は`OSSRH`を使っているユーザー向けです。  
いまライブラリを公開しようとすると、`Central Portal`という`OSSRH`の代替に誘導されるらしいです。

# これらしい
めっちゃ最近で草  
`OSSRH`のユーザー名、パスワードでアップロード出来なくなったらしい（？）。

https://central.sonatype.org/news/20240617_migration_of_accounts/

解決方法はユーザートークンなるものを使うらしい、これっぽい。

https://central.sonatype.org/publish/generate-token/

# OSSRH にログイン
私はこっちですね： https://s01.oss.sonatype.org/

ログインしたら、名前のところのドロップダウンメニューを開いて、`Profile`を押します。  

![Imgur](https://i.imgur.com/OtbqxgB.png)

そしたらドロップダウンメニューが出るので、`User Token`を選びます。

![Imgur](https://i.imgur.com/lRZ7zoW.png)

そしたら、`Access User Token`ボタンを押します。  
ダイアログが出るのでログイン情報を再度入力します。

![Imgur](https://i.imgur.com/0xv6cDA.png)

![Imgur](https://i.imgur.com/AeINvdg.png)

すると、2つの値が生成されます。  
これを急いでコピーします。どうやら1分で勝手にウィンドウが消えるらしいです（）。  

左側が`ユーザーネーム`の代わりになるもの、右側が`パスワード`の代わりになるものです。  
これを`local.properties`なり、`GitHub Actions`の環境変数なりに入れれば良いわけですね。

`local.properties`の場合は、`OSSRH`のユーザー名、パスワードの値を変えれば良いはず。

```properties
# Sonatype OSSRH UserToken UserName
ossrhUsername={UserToken ユーザー名}
# Sonatype OSSRH UserToken Password
ossrhPassword={UserToken パスワード}
```

`build.gradle.kts`（ルートね、ライブラリの方の`build.gradle.kts`じゃない）にベタ書きしてる場合は多分この辺。  
以下のコードは公開に`io.github.gradle-nexus.publish-plugin`プラグインを使っている場合ですが、多分ユーザー名とパスワードをそれぞれ`ユーザートークン`で発行されたものに置き換えれば良いはずです。

```kotlin
// Sonatype OSSRH リポジトリ情報
nexusPublishing.repositories.sonatype {
    stagingProfileId.set(extra["sonatypeStagingProfileId"] as String)
    username.set(extra["ossrhUsername"] as String) // ←UserToken ユーザー名、私は環境変数から取ってるので extra から取り出している
    password.set(extra["ossrhPassword"] as String) // ←UserToken パスワード、私は環境変数から取ってるので extra から取り出している
    nexusUrl.set(uri("https://s01.oss.sonatype.org/service/local/"))
    snapshotRepositoryUrl.set(uri("https://s01.oss.sonatype.org/content/repositories/snapshots/"))
}
```

一応ローカルで試して、成功しました。  
`GitHub Actions`のシークレットの方も更新します。

![Imgur](https://i.imgur.com/y85zKvC.png)

# GitHub Actions
ユーザー名、パスワードが変わっただけなので、シークレットを更新して、`GitHub Actions`を起動すれば良いはず。  
環境変数から取ってる場合`yml`は特に変えるところ無いはず。

きたきた  
![Imgur](https://i.imgur.com/8F5BOpK.png)

以上です。お疲れさまでした