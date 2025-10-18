---
title: 自作Androidライブラリを Maven Central へ公開する
created_at: 2022-04-19
tags:
- MavenCentral
- Android
- Gradle
---
どうもこんばんわ。

保健室のセンセーとゴスロリの校医 攻略しました。前作はやってないです。  
ロープライスだけどシナリオがちゃんとしていていいと思いました。おすすめ

![Imgur](https://i.imgur.com/zgom8f4.png)

![Imgur](https://i.imgur.com/mS4S4ne.png)

みんなかわいい

![Imgur](https://i.imgur.com/roZOqlK.png)

鈴ルートも近々発売みたいなので楽しみですね。くー

![Imgur](https://i.imgur.com/8PamPDe.png)

# 本題
ちょっと前に書いたアプリのコア部分をライブラリに切り出した。
- https://github.com/takusan23/Coneco/tree/master/conecocore
- https://github.com/takusan23/Coneco/tree/master/conecohls

ライブラリを作ったのでせっかくなら公開しようというわけで、  
`Maven Central`へ公開し、他の人から使えるようにしてみます！

# 環境

- リポジトリ
    - https://github.com/takusan23/Coneco
- build.gradle.kts を使います
    - 別に移行しても便利にはならないと思います...
- Windows 10 Pro

## 用語集
なんだかよく分からん名前ばっか出るのでまとめます。  
それぞれの立ち位置を理解するのでお腹いっぱいになりそう。

- Sonatype Jira
    - ライブラリをアップロードするリポジトリを作成するため使う
        - 多分リポジトリ管理してる中の人とやり取りするのに使う
        - Jira チケットを切って担当者にお願いする
        - チケットを切るには Jira アカウントも作らないといけない
- Sonatype OSSRH
    - Sonatype OpenSourceSoftware Repository Hosting の略らしい
    - まずはここにライブラリをアップロードする
- MavenCentral
    - Sonatype OSSRH へアップロードしたライブラリが問題なければ MavenCentral へ公開する。
    - よく分からん

## 流れ
- Sonatype (Atlassian) Jira のアカウントを作る
- リポジトリの作成をお願いするJiraチケットを切る
    - グループID（ドメイン、GitHub Pages）のどれかを利用する
- 署名に使うGPG鍵を作成する
- Gradleを書く
- リリースする
- Sonatypeの管理画面からMavenCentralに公開する
- おわり

なげえよ...

## 公式

https://central.sonatype.org/publish/publish-guide/

## 使うライブラリ
あり座椅子

https://github.com/gradle-nexus/publish-plugin

https://github.com/Kotlin/dokka

(Dokkaでjavadoc.jar 生成 : https://kotlinlang.org/docs/dokka-gradle.html#build-javadoc-jar)

## 参考にしました、ありがとうございます！
https://getstream.io/blog/publishing-libraries-to-mavencentral-2021/

http://yuki312.blogspot.com/2021/08/maven-central-repository.html


# Sonatype Atlassian Jira アカウントの作成
ここから作れます。  
https://issues.sonatype.org/secure/Signup!default.jspa

Full name は適当でいいんじゃね、バカ正直にかく必要はなさそう雰囲気（知らんけどあとから変更できる）。  
**Usernameは変更できない上に管理画面へログインする際も使われるのでよく考えたほうが良さそう**

https://central.sonatype.org/publish/manage-user/#change-my-full-name-e-mail-address-or-password

パスワードの条件難しくて草。最後の記号とかどうやって出すんだよ

```
You must specify a password that satisfies the password policy.
The password must contain at least 1 special character, such as &, %, ™, or É.
```

出来たらこうなる。作ったアカウントでログインして、適当に初期設定を進めます。

![Imgur](https://i.imgur.com/4NYMvGD.png)

Atlassian Jira 自体には日本語があります。なお日本語で対応してくれるとは言っていない。

![Imgur](https://i.imgur.com/wHObSuK.png)

# リポジトリを作ってもらうJiraチケットを切る
**作成**からチケットを切れます。

![Imgur](https://i.imgur.com/UK5Aezu.png)

プロジェクト、課題タイプ はそのままでおっけー

![Imgur](https://i.imgur.com/K8YduK0.png)

そして以下の項目を埋めていきます。  
Group Idってのは`io.github.takusan23`みたいなやつです。    
自分で持ってるドメインとか使えるみたいですが、今回はGitHub Pagesのドメインを使います。  
よくライブラリ導入時にドメインが逆になった文字列を入れると思うのですが、それです。

`implementation("io.github.takusan23:conecocore:1.0.0")` ← この `io.github.takusan23`がグループID

| なまえ                    | 書くこと                                                 | 例                                                                                                          |
|---------------------------|----------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| 要約                      | リポジトリを作って欲しいよ～的な                         | Create repository for io.github.takusan23                                                                   |
| 説明                      | ライブラリ作ったからMavenCentralで公開したいんだ！～的な | I created an Android library that connects multiple videos. I would like to publish it using Maven Central. |
| Group Id                  | グループID、GitHub Pagesのドメインとか                   | io.github.takusan23                                                                                         |
| Project URL               | GitHubのリポジトリへのURL                                | https://github.com/takusan23/Coneco                                                                         |
| SCM url                   | Project URLで書いたURLに`.git`をつければ良さそう         | https://github.com/takusan23/Coneco.git                                                                     |
| Already Synced to Central | 初めてならNoで良いと思う                                 | No                                                                                                          |

以下例です。

![Imgur](https://i.imgur.com/kanqUyx.png)

作成を押すと、こんな風になるのでチケットの詳細ページへ飛びましょう。

![Imgur](https://i.imgur.com/Bnxb0zf.png)

## 数十秒待っていると...
チケットへコメントが付きます。（Botなんですけどね初見さん）  

![Imgur](https://i.imgur.com/lljwjuq.png)

ここでグループIDの検証を行います、が特に難しいことをするわけでもなく、  
自分のGitHubのリポジトリに作ったJiraチケットのチケット番号（OSSRH- から始まるやつ）の名前でリポジトリを作成しろって内容です。

というわけで作成して

![Imgur](https://i.imgur.com/VtlXUag.png)

チケットのコメントに作ったことを知らせます。  

```
Created repository for https://github.com/takusan23/OSSRH-79851
```

![Imgur](https://i.imgur.com/tSevFmy.png)

チケットをOpenにしろって言われてるんだけど勝手にOpenになってた

![Imgur](https://i.imgur.com/396HM8B.png)

## 数分後に...

MavenCentralで`io.github.takusan23`が使えるようになったぞ！ってメールが来ました。歯磨き終わったら仕事終わってた。有能かよ

![Imgur](https://i.imgur.com/k01PjD8.png)

これで、https://s01.oss.sonatype.org/ にログインできるようになります。  
ログインはここです。  
Username、パスワードはさっきのJiraアカウントと同じものを使えばOKです。

![Imgur](https://i.imgur.com/zyI6CQw.png)

![Imgur](https://i.imgur.com/dqOgO67.png)

# 署名で使う鍵を作成する
公式：https://central.sonatype.org/publish/requirements/gpg/

私は Windowsユーザー なので Gpg4win を入れます。

https://gpg4win.org/index.html

![Imgur](https://i.imgur.com/p2ekpeb.png)

インストーラーの案内に従って入れましょう。

![Imgur](https://i.imgur.com/xdPIIfD.png)

インストールしたら開きます。GUIが付属してますので使っていきましょう。

![Imgur](https://i.imgur.com/isJTqGm.png)

## 署名の中身
詳細設定は、`詳細設定`を押すと開きます。

| なまえ                                      | あたい                                          |
|---------------------------------------------|-------------------------------------------------|
| 名前                                        | 各自の名前                                      |
| メールアドレス                              | 各自のメールアドレス                            |
| 鍵の要素                                    | RSA +RSA (4096 ビット)                          |
| 証明書の利用目的                            | 署名 （有効期限決めることも可能、今回はしない） |
| Protect the generated key with a passphrase | チェックを入れる                                |

![Imgur](https://i.imgur.com/YNdDU66.png)

パスワードを入力します。

![Imgur](https://i.imgur.com/R2kALYR.png)

できました。

![Imgur](https://i.imgur.com/N5svyQA.png)

### バックアップと失効証明書の作成
一応作成します。

バックアップはキーを右クリックしてコンテキストメニューを出し、`Backup Secret Keys...`で出来ます。

![Imgur](https://i.imgur.com/NprkeQg.png)

失効証明書を作っておくと、万が一秘密鍵が漏れた場合に無効にできます。  
コンテキストメニューを開き、`詳細`を押します。

![Imgur](https://i.imgur.com/12Qnqs7.png)

そしたら`Generate revocation certificate`を押すことで発行できます。

![Imgur](https://i.imgur.com/HVpCBv3.png)

## 公開鍵を鍵サーバーへアップロードする
GUIでやる方法がわからんかったので、コマンドプロンプトでやります。  
コマンドプロンプト、PowerShell等を起動して、まず鍵一覧を出します

`gpg --list-keys`

そしたら長い16進数があると思うので、この16進数の最後から8文字分をコピーしておきます。

次に、以下のコマンドを叩いてアップロードします。

```shell
gpg --keyserver keyserver.ubuntu.com --send-keys <コピーした16進数>
```

![Imgur](https://i.imgur.com/PHk9DF8.png)

## 署名鍵をBase64にする
最後にライブラリの署名で使うので、秘密鍵をBase64で書き出しておきます。  
**秘密鍵なので扱いには十分気をつけてね！！！！**

`macOS`とかだとワンライナーみたいなんですが、Windowsの場合はちょっとめんどいですね...  
適当なフォルダを作りその中で、PowerShellなどを起動して...

```shell
gpg --export-secret-keys コピーした16進数 > export_secret
certutil -f -encode export_secret export_secret_base64
```

`export_secret_base64`ファイルができていれば成功です。Base64なファイルは文字なのでテキストエディタで開けます。  
最初の`-----BEGIN CERTIFICATE-----`と最後の`-----END CERTIFICATE-----`を消して、改行も消します

# いよいよライブラリを公開するためのGradleタスクを書いていく...

**2023/02/19 めっちゃ間違えてました。すいませｎ。ソースとjavadocが入るように修正しました。**

**2024/03/29 Android Gradle Plugin の更新でまた動かなくなってました。不要な箇所があるので追記読んでください。**

**2025/09/30 OSSRH のままだったので CentralPortal 用の説明を追記しました。**  

## CentralPortal に対応させる

https://takusan.negitoro.dev/posts/maven_central_ossrh_to_central_portal/

↑も見てください（なげやり）。  
めんどい場合は令和最新版の`build.gradle.kts`と`ライブラリ/build.gradle.kts`のコードへのリンクを張っておきます。

- AkariDroid
    - [build.gradle.kts](https://github.com/takusan23/AkariDroid/blob/master/build.gradle.kts)
    - [ライブラリ/build.gradle.kts](https://github.com/takusan23/AkariDroid/blob/master/akari-core/build.gradle.kts)
- andAicaroid
    - [build.gradle.kts](https://github.com/takusan23/andAicaroid/blob/master/build.gradle.kts)            
    - [ライブラリ/build.gradle.kts](https://github.com/takusan23/AkariDroid/blob/master/akari-core/build.gradle.kts)

`local.properties`のキー名も変えちゃってますのですいません、

## ルート (.idea がある場所) の build.gradle.kts

まずルートにある build.gradle.kts へ書き足します。  
`kts`で書いた場合、別ファイルにスクリプトを書いて`apply from`する方法が使えないみたいなので、直接書くしかないです。  
(参考にした記事では別スクリプトに分けてた、~~あれ？ktsに移行するメリットマジでなくない...~~)

https://github.com/gradle/kotlin-dsl-samples/issues/1287

```kotlin
buildscript {
    val kotlinVersion: String by extra("1.7.10")
    val composeVersion: String by extra("1.3.1")
}
// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id("com.android.application").version("7.4.0").apply(false)
    id("com.android.library").version("7.4.0").apply(false)
    id("org.jetbrains.kotlin.android").version("1.7.10").apply(false)
    // ドキュメント生成と Maven Central へ公開をしてくれるやつ
    id("org.jetbrains.dokka").version("1.7.10")
    id("io.github.gradle-nexus.publish-plugin").version("1.1.0")
}

tasks.register("clean") {
    doFirst {
        delete(rootProject.buildDir)
    }
}

// ライブラリ署名情報がなくてもビルドできるようにする
extra["signing.keyId"] = ""
extra["signing.password"] = ""
extra["signing.key"] = ""
extra["ossrhUsername"] = ""
extra["ossrhPassword"] = ""
extra["sonatypeStagingProfileId"] = ""

// 署名情報を読み出す。開発環境では local.properties に署名情報を置いている。
val secretPropsFile = project.rootProject.file("local.properties")
if (secretPropsFile.exists()) {
    // 読み出して、extra へ格納する
    val properties = java.util.Properties().apply {
        load(secretPropsFile.inputStream())
    }
    properties.forEach { name, value -> extra[name as String] = value }
} else {
    // システム環境変数から読み出す。CI/CD 用
    extra["ossrhUsername"] = System.getenv("OSSRH_USERNAME")
    extra["ossrhPassword"] = System.getenv("OSSRH_PASSWORD")
    extra["sonatypeStagingProfileId"] = System.getenv("SONATYPE_STAGING_PROFILE_ID")
    extra["signing.keyId"] = System.getenv("SIGNING_KEY_ID")
    extra["signing.password"] = System.getenv("SIGNING_PASSWORD")
    extra["signing.key"] = System.getenv("SIGNING_KEY")
}

// Sonatype OSSRH リポジトリ情報
nexusPublishing.repositories.sonatype {
    stagingProfileId.set(extra["sonatypeStagingProfileId"] as String)
    username.set(extra["ossrhUsername"] as String)
    password.set(extra["ossrhPassword"] as String)
    nexusUrl.set(uri("https://s01.oss.sonatype.org/service/local/"))
    snapshotRepositoryUrl.set(uri("https://s01.oss.sonatype.org/content/repositories/snapshots/"))
}
```

## ライブラリの方の build.gradle.kts
こっちも同様直接書くしかないです。  
`ライブラリ名`、`ライブラリの説明`の部分や、  
作者とかライセンスとかが書いてある下の部分は各自書き換えてください。

| なまえ     | せつめい                                                |
|------------|---------------------------------------------------------|
| groupId    | Sonatype OSSRH のJiraチケットで決めたのと同じグループID |
| artifactId | ライブラリ名とも言う                                    |
| version    | バージョン                                              |

```kotlin
plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    // ライブラリに同梱するドキュメント生成器
    id("org.jetbrains.dokka")
    // ライブラリ作成に必要
    `maven-publish`
    signing
}

// ライブラリバージョン
val libraryVersion = "1.0.2"
// ライブラリ名
val libraryName = "conecocore"
// ライブラリの説明
val libraryDescription = "It is a library that connects multiple videos into one."

android {
    compileSdk = 33
    namespace = "io.github.takusan23.conecocore"

    defaultConfig {
        minSdk = 21
        targetSdk = 33

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        consumerProguardFile("consumer-rules.pro")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
}

dependencies {

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.6.0")

    implementation("androidx.core:core-ktx:1.7.0")
    implementation("androidx.appcompat:appcompat:1.4.1")

    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.3")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.4.0")
}

val androidSourcesJar = tasks.register<Jar>("androidSourcesJar") {
    archiveClassifier.set("sources")
    from(android.sourceSets["main"].java.srcDirs)
}

tasks.dokkaJavadoc {
    outputDirectory.set(File(buildDir, "dokkaJavadoc"))
}

val javadocJar = tasks.register<Jar>("dokkaJavadocJar") {
    dependsOn(tasks.dokkaJavadoc)
    from(tasks.dokkaJavadoc.flatMap { it.outputDirectory })
    archiveClassifier.set("javadoc")
}

artifacts {
    archives(androidSourcesJar)
    archives(javadocJar)
}

signing {
    // ルート build.gradle.kts の extra を見に行く
    useInMemoryPgpKeys(
        rootProject.extra["signing.keyId"] as String,
        rootProject.extra["signing.key"] as String,
        rootProject.extra["signing.password"] as String,
    )
    sign(publishing.publications)
}

afterEvaluate {
    publishing {
        publications {
            create<MavenPublication>("maven") {
                groupId = "io.github.takusan23"
                artifactId = libraryName
                version = libraryVersion
                if (project.plugins.hasPlugin("com.android.library")) {
                    from(components["release"])
                } else {
                    from(components["java"])
                }
                artifact(androidSourcesJar)
                artifact(javadocJar)
                pom {
                    // ライブラリ情報
                    name.set(artifactId)
                    description.set(libraryDescription)
                    url.set("https://github.com/takusan23/Coneco/")
                    // ライセンス
                    licenses {
                        license {
                            name.set("Apache License 2.0")
                            url.set("https://github.com/takusan23/Coneco/blob/master/LICENSE")
                        }
                    }
                    // 開発者
                    developers {
                        developer {
                            id.set("takusan_23")
                            name.set("takusan_23")
                            url.set("https://takusan.negitoro.dev/")
                        }
                    }
                    // git
                    scm {
                        connection.set("scm:git:github.com/takusan23/Coneco")
                        developerConnection.set("scm:git:ssh://github.com/takusan23/Coneco")
                        url.set("https://github.com/takusan23/Coneco")
                    }
                }
            }
        }
    }
}
```

# 追記 Android Gradle Plugin 最新バージョン追従
- https://developer.android.com/build/publish-library
- https://stackoverflow.com/questions/76859081/

なんか見ないうちに、公式ドキュメントに、ライブラリの作り方が言及されるようになってる。  
変更点ですが、

- `Android Gradle Plugin`が元のソースコードを同梱するようになったので、自分で`task`を書かなくて良い
    - `withSourcesJar()`、`withJavadocJar()`を使えばいい（いつから追加されたのこれ？？？）
- 同様に、`Javadoc`も`AGP`が勝手に生成して同梱するようになったので、自分で`dokka`をセットアップする必要はなくなった
- それに伴い、`build.gradle`に書いている記述も修正が必要

まずは、ルートの`build.gradle.kts`から`dokka`は不要なので消しちゃって

```diff
plugins {
     alias(libs.plugins.kotlin.android).apply(false)
     // akaricore ライブラリ公開で使う
     alias(libs.plugins.gradle.nexus.publish.plugin)
-    alias(libs.plugins.jetpbrains.dokka)
-}
-
-subprojects {
-    apply(plugin = "org.jetbrains.dokka")
 }
```

そして、ライブラリの方の`build.gradle.kts`を以下のように書き直します。  
`namespace`とかは各自違うと思う。コメントは不要なので消していいよ

```kotlin
plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    // Maven Central に公開する際に利用
    `maven-publish`
    signing
}

// ライブラリ公開は Android でも言及するようになったので目を通すといいかも
// https://developer.android.com/build/publish-library/upload-library
// そのほか役に立ちそうなドキュメント
// https://docs.gradle.org/current/dsl/org.gradle.api.publish.maven.MavenPublication.html
// https://github.com/gradle-nexus/publish-plugin

// OSSRH にアップロードせずに成果物を確認する方法があります。ローカルに吐き出せばいい
// gradle :akari-core:publishToMavenLocal

android {
    namespace = "io.github.takusan23.akaricore"
    compileSdk = 34

    defaultConfig {
        minSdk = 21
        targetSdk = 34

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        consumerProguardFiles("consumer-rules.pro")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }

    // どうやら Android Gradle Plugin 側で sources.jar と javadoc.jar を作る機能が実装されたそう
    publishing {
        singleVariant("release") {
            withSourcesJar()
            withJavadocJar()
        }
    }
}

// ライブラリ
dependencies {

    implementation(libs.androidx.core)
    implementation(libs.androidx.appcompat)
    implementation(libs.kotlinx.coroutine)
    testImplementation(libs.junit)
    androidTestImplementation(libs.kotlinx.coroutine.test)
    androidTestImplementation(libs.androidx.test.junit)
    androidTestImplementation(libs.androidx.test.espresso.core)
}

// ライブラリのメタデータ
publishing {
    publications {
        create<MavenPublication>("release") {
            groupId = "io.github.takusan23"
            artifactId = "akaricore"
            version = "2.0.0-alpha01"

            // afterEvaluate しないとエラーなる
            afterEvaluate {
                from(components["release"])
            }

            pom {
                // ライブラリ情報
                name.set("akaricore")
                description.set("AkariDroid is Video editor app in Android. AkariDroid core library")
                url.set("https://github.com/takusan23/AkariDroid/")
                // ライセンス
                licenses {
                    license {
                        name.set("Apache License 2.0")
                        url.set("https://github.com/takusan23/AkariDroid/blob/master/LICENSE")
                    }
                }
                // 開発者
                developers {
                    developer {
                        id.set("takusan_23")
                        name.set("takusan_23")
                        url.set("https://takusan.negitoro.dev/")
                    }
                }
                // git
                scm {
                    connection.set("scm:git:github.com/takusan23/AkariDroid")
                    developerConnection.set("scm:git:ssh://github.com/takusan23/AkariDroid")
                    url.set("https://github.com/takusan23/AkariDroid")
                }
            }
        }
    }
}

// 署名
signing {
    // ルート build.gradle.kts の extra を見に行く
    useInMemoryPgpKeys(
        rootProject.extra["signing.keyId"] as String,
        rootProject.extra["signing.key"] as String,
        rootProject.extra["signing.password"] as String,
    )
    sign(publishing.publications["release"])
}
```

変更点ですが、
- `android { }`の中に`publishing { }`を追加した
- ソースコードとドキュメント生成の`task`を消した、`artifacts { }`も消した、
- `afterEvaluate { }`に`from`だけ移動。
    - 多分ここは関係ない。ただ Android のドキュメントに従ってみた
    - https://developer.android.com/build/publish-library/upload-library
- 多分`from`でソースと`javadoc`が入るので、`artifact()`は書かなくていい
- `signing { }`を一番最後に

全部の差分はこちらから  
https://github.com/takusan23/AkariDroid/commit/54e1dd4329569bda09bacdd090b34e78a65ab892

# local.properties に認証情報を書き込む
このファイルはgitの管理下にしてはいけません。絶対人には見せちゃだめですよ。  
なんか書いてあるかもだけどその下にかけばいいです。

```properties
# Git管理下に入れてはぜっっったいダメです
# 絶対秘密です
# 鍵IDの最後8桁
signing.keyId=xxxxxx
# パスワード
signing.password=password
# 秘密鍵のBase64
signing.key=xxxxxxxxx
# Sonatype OSSRH のユーザー名
ossrhUsername=takusan_23
# Sonatype OSSRH のパスワード
ossrhPassword=password
# Sonatype ステージングプロファイルId
sonatypeStagingProfileId=8320....
```

## 追記 ユーザーネーム、パスワードでログインできなくなった
こちらを参考に、ユーザートークンなるもの作ってください。

https://takusan.negitoro.dev/posts/maven_central_ossrh_upload_401_error/

## ステージングプロファイルId どこやねん

Sonatype OSSRH の nexus repository manager へログインします。  
https://s01.oss.sonatype.org

そしたら、左側にある中から、`Staging Profiles`を押して、自分の名前の部分を押します。  
押したら、ブラウザのアドレス欄を見ます。`stagingProfiles;`のあとの16進数が`ステージングプロファイルId`になります。

![Imgur](https://i.imgur.com/z9PU7tD.png)

# 公開するぞ！！！！
といっても直接`MavenCentral`に公開されるわけではなく、一旦`Sonatype OSSRH`の`nexus repository manager`へアップロードされます。  
その後問題がなければ公開という流れになります。

Android Studioの右側にある`Gradle`を押してぞうさんのマーク🐘を押して、以下のコマンドを叩きます。  
参考にした記事とコマンドが変わってますね。
https://github.com/gradle-nexus/publish-plugin

```
gradle :ライブラリ名(モジュール名):publishToSonatype
```

![Imgur](https://i.imgur.com/d5Stw0C.png)

数十秒後に終了しました。  
プラグイン作ったやつすげえ！

![Imgur](https://i.imgur.com/OCI1AHS.png)

# Sonatype OSSRH nexus repository manager の ステージングリポジトリを見に行く

またさっきのリポジトリのURL https://s01.oss.sonatype.org/ を開いて、`Staging Repositories`を押します。
押したら、`Refresh`を押して最新の状態にしましょう。

どうですか？ありましたか！？

![Imgur](https://i.imgur.com/QQk5ikQ.png)

問題がなければ**Close**を、やり直したい場合は**Drop**で消せます。  

## Close を押す
`Close`を押すと、MavenCentralへ公開する？準備が始まります。  
自動で公開されるわけではないので、まだ安心できますね。

![Imgur](https://i.imgur.com/omkAFZU.png)

しばらく待っていると**Release**が押せるようになっていました。  
いくぞおおおおお、新曲！

![Imgur](https://i.imgur.com/EdiIqLW.png)

`Confirm`を押してリリースです！

![Imgur](https://i.imgur.com/Ys8HBSc.png)

数時間後に https://repo1.maven.org/maven2/ から見れるようになるみたいなので楽しみですね。

# 公開されたか見る
https://repo1.maven.org/maven2/ を開いて辿っていけばいいです。 
あった！！！

![Imgur](https://i.imgur.com/b38RD5W.png)

## search.maven.org でも確認する
さらに待ってると、 https://search.maven.org で検索出来るようになってます。

![Imgur](https://i.imgur.com/v02mUI0.png)


うおおおお、なんかすごい

![Imgur](https://i.imgur.com/0IIme8l.png)

ライブラリの詳細画面はこんな感じ、導入方法とか書いてある。

![Imgur](https://i.imgur.com/KTPtKXR.png)

# 使う側になる

プロジェクトレベル(appフォルダ内)の`build.gradle`に書き足すと追加できます。やったぜ

```
implementation '<グループId>:<ライブラリ名（アーティファクトId）>:<バージョン>'
```

今回作ったライブラリだとこうですね。

```java
// build.gradle
implementation 'io.github.takusan23:conecocore:1.0.0'

// build.gradle.kts の場合
implementation("io.github.takusan23:conecocore:1.0.0")
```

これで他の大手ライブラリのように導入できます。くっそ大変だなこれ...

![Imgur](https://i.imgur.com/qek6dbP.png)

~~(なんか別にドキュメントを生成しないとダメみたいですね...)~~

ライブラリを入れた際に一緒に`XXX-sources.jar`がダウンロードされるので、IDE上でもそのまま表示されるようになります。  

![Imgur](https://i.imgur.com/AwCm0Oh.png)

![Imgur](https://i.imgur.com/RuVmcSf.png)

![Imgur](https://i.imgur.com/iAM8juN.png)

# 他にライブラリを公開したい場合
すでにリポジトリがある(Sonatype OSSRH nexus repository manager が使える)ので、`build.gradle.kts`のところからやればいいと思います。

# ソースコード
どうぞ

~~https://github.com/takusan23/Coneco~~

https://github.com/takusan23/AkariDroid

# おわりに

4月も終わりますね...