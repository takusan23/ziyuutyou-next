---
title: iPhone Duo の大きさを Android の ARCore で置いて比べてみた
created_at: 2026-10-15
tags:
- Android
- Kotlin
- OpenGLES
- ARCore
---
どうもこんばんわ。  
美容室に行ってみました。怖いのかなーって思ってましたが怖くなかったです。免許更新があったので切りに行ってみた。

なんか短い方が似合うって言われたけど短くしたことないから分からん :(  
なんか髪の毛押し付けながらドライバーするとボリューム感へっておすすめらしいので試してみている

話はなんか髪を短くした方が似合いそう（？）とかの話とか、髪質が強い（？）から染めたりとかで柔らかくなるかも見たいな。**陽キャすぎんか？**

せっかくなので、なんかちょっと白髪混じってるの聞いてみた。  
そしたら、ツヤがあるからそのままでいいんじゃないって言われたのでそのままにすることにした（？）

# 本題
ついに`iPhone`から折り畳みスマホが出るようです。どれくらいのサイズ感なのかは気になりますよね！？  
そういうのに向いてる機能があります（？）。`Android`の`AR`機能というか`API`である`ARCore`ですね！

というわけで今回は`iPhone Duo`と同じサイズの`3D オブジェクト`を`Blender`で作って`ARCore`で表示してみます。

# Q 興味ないので APK ファイルだけくれませんか
はい

https://github.com/takusan23/iPhoneDuoSameSizeObjectARCore/releases/tag/1.0

ボトムシートに表示される項目は以下の通りです。

- google_pixel_11_profold_collapsed_same_size_obj.obj
    - `Pixel 11 Pro Fold`閉じた時のサイズ
- google_pixel_11_profold_expanded_same_size_obj.obj
    - `Pixel 11 Pro Fold`開いた時のサイズ
- iphone_duo_collapsed_same_size_obj.obj
    - `iPhone Duo`閉じた時のサイズ
- iphone_duo_expanded_same_size_obj.obj
    - `iPhone Duo`開いた時のサイズ

# Q 興味ないので比較した写真だけ見せてくれませんか
いろいろ置いてみた、けど、なかなかこれというのが見つからんかった。

閉じたときは`ポケットティッシュ`を一回り大きくしたくらいだと思います。  
開いたときは`小説の本`（`A6`らしい）が近い気がします。

![ポケットティッシュと並べた](https://oekakityou.negitoro.dev/resize/05dacf87-3cf1-4c87-ada0-6d7e11a7dbce.jpg)

![小説の本と並べた](https://oekakityou.negitoro.dev/resize/0d830fdd-573a-48c9-a4bf-958713405505.jpg)

![小説の本と並べた](https://oekakityou.negitoro.dev/resize/09e2b4b9-4ae9-4aaf-b603-6589965e04f9.jpg)

ガリレオ、3つ目の映画まだ見てないな・・・

## Macbook Air 13 インチ
閉じたら`トラックパッド`くらい

![macbook_air_13_のトラックパッドに置いた](https://oekakityou.negitoro.dev/resize/1577d77a-9d0c-44dd-8d19-3e11633e7d5c.jpg)

開いて`キーボード`の上に乗せた感じ

![macbook_air_13_のキーボードに置いた](https://oekakityou.negitoro.dev/resize/03b8223b-41a0-4c66-b2e0-d32742afb04e.jpg)

## そのほか
`AirDrop`のためになんか持ってる`iPhone7`（今なら`Pixel`で`Apple`デバイスと`AirDrop`できる）  
こうしてみると思ったより小さい。

![iPhone7と比較](https://oekakityou.negitoro.dev/resize/0481457c-f421-4306-bf5f-32ff5c669ab6.jpg)

はがき（と同じサイズです！）閉じるとはがきより一回りくらい小さかった。

![はがきと比較_おりたたみ](https://oekakityou.negitoro.dev/resize/030051bf-7704-422f-844e-735afeb0a05e.jpg)

ひらくとはがきちょい大きいくらい

![はがきと比較_ひらいた](https://oekakityou.negitoro.dev/resize/130cca7f-1d2e-4f99-9482-d43a8d0e79eb.jpg)

雑誌

![雑誌](https://oekakityou.negitoro.dev/resize/15049fdd-c26a-4c7e-ab9b-244856e4a97a.jpg)

# 詳しい話は大昔に書いたのでそっちも見てください

https://takusan.negitoro.dev/posts/android_ar_core_github_skyline/

# ARCore とは
`Android`で`AR`アプリを作るための`API`。ゲームエンジンを使わなくても`Java/Kotlin`で利用できます。  
しかしその場合、代わりに`OpenGL ES`を使って描画しているので、ゲームエンジンを避けてもどのみち難しいです。

結構むかしの話ですが、かつて`Google`が作った`Sceneform`っていうライブラリがありました。  
`OpenGL ES`の知識は一切不要、簡単な`Java/Kotlin`のコードを書くだけで現実世界にオブジェクトが置けたライブラリです。`Google`のお家芸というかなんというかで、これはずっと前に廃止されました・・  

https://takusan23.github.io/Bibouroku/2020/04/06/ARCore/

ですが、`Sceneform`は今でも有志が引き継いでるはず！なのでそっちを使う方がいい気がします。  
まあこんなことがあったので`Android XR`もやる気があるのかは少し怪しいところです（）

そうはいっても、今回やることは`Google`が書いてるサンプルコードを書き換えて、自分で作った`Blender`の`3D オブジェクト`を表示するように直すだけなので別に難しくないです。

# 環境

| なまえ         | あたい                           |
|----------------|----------------------------------|
| Android        | Pixel 11 Pro Fold                |
| Blender        | 5.2.2                            |
| ARCore         | 1.56                             |
| Android Studio | Android Studio Rabbit 1 2026.2.1 |

# 手順

- いい感じに`3D モデル`を作る
- `Google`の`ARCore`サンプルコードをクローンしてビルドが通るようになるまで直す
- ソースコードを書き換えて、作った`3D モデル`を表示するように直す

# 3Dモデルを作る
`Blender`を入れます。`ポータブル`版でも`インストール`版でもどっちでもいいと思います。  
いっぱい使うならインストール版がいいのかな、私はポータブル版を入れました。

ポータブル版ならダウンロードした`zip`を解凍しておいてください。

## Blender を開く
`blender-launcher.exe`を開きます。日本語が選べるっぽいので選びました。どっちでもいいと思います。選んだらダイアログ？の外側を押して閉じました。  
もうすでに正方形があるのでこれを使いますか！？

![blender_起動画面](https://oekakityou.negitoro.dev/original/221e7ef3-f8b8-4e1b-8b7d-095ccdac5ab5.png)

![blender_正方形が出ている](https://oekakityou.negitoro.dev/original/0cc811fa-0142-43be-98a3-89a417fe52fe.png)

## 正方形を調整する
`マウス押し込み`で視点変更が、スクロールで前後に動かせます。で、なんか正方形の下半分が埋まってますね。。。  
`Z軸`の`0`地点に正方形が来てほしいです。

何が原因なのかというと、`オブジェクト`の原点が真ん中にあるせいらしい。  
これを底面に移動させて、位置を`Z軸`の`0`地点に合わせれば、底面と`0`が一致し下に埋まることはなくなるはずです！

参考にしました！！！  
https://note.com/info_/n/nf3b28d4999d0

左上が`オブジェクトモード`になっているので、`Tab`キーを押して`編集モード`に切り替えます。左上がそうなると思います。  
次に数字の`3`キーを押します。この状態で正方形の底面が見えるようにマウス押し込みで視点変更しつつ、底面をクリックします。選んだ面だけ色が変わるハズ！

![blender_正方形の底面を選択している状態](https://oekakityou.negitoro.dev/original/134ea7fd-dc9a-46e0-b011-70aa8e6fd3e4.png)

つぎに、`Shift`と`S`キーを押すとメニューが出るので、`カーソル→選択物`を選びます。

![blender_カーソルを選択物に合わせる](https://oekakityou.negitoro.dev/original/1f3c8eaa-be66-41c7-a4bf-c4b9f4d16c33.png)

最後に`Tab`キーを押して元のモードに戻し、`正方形`を右クリックし、`原点を調整`→`原点を3Dカーソルに移動`を選びます。  
これで、三次元に伸びてる矢印が正方形の底に表示されるはずです。矢印が出ない場合は左の縦にアイコンが並んでる部分から矢印のアイコンを選んでください（移動ってやつ）

![blender_原点を3Dカーソルに移動を選ぶ](https://oekakityou.negitoro.dev/original/0bb8d35f-6bfb-4ff4-a458-fadc85defc12.png)

![blender_原点が底面に移動した状態](https://oekakityou.negitoro.dev/original/14955841-89a5-4ccc-bc66-c4fc0720dc95.png)

## 単位をミリメートル
スマホの大きさとかはミリメートル表記なので、先に変えちゃいますか。  
右のパネル？から`シーン`を選んで、`単位`を開き`長さ`を`ミリメートル`に変更します。

![blender_単位をミリメートルに変更](https://oekakityou.negitoro.dev/resize/0bec4868-1ba1-448e-8a71-af295068996d.png)

## サイズを位置を合わせる
これでもまだ下半分が埋まってます。これを調整するための画面を出します。`N`キーを押してください。  
するとなんか左から出てくると思います。

![blender_左側から出てくる](https://oekakityou.negitoro.dev/original/1517c981-d4b6-4100-93e2-2ceecb8b0ab4.png)

まず埋まってるのは`Z軸`が`0`になってないせいですね。`0`にします。これで埋まらなくなります。  
また、寸法のところは`iPhone Duo`の大きさに合わせます。大きさは`Apple`のサイトから見れます。

https://www.apple.com/jp/iphone-duo/specs/

出来ました、とりあえず開いてる状態作りました。たぶんあってます。  
数字を合わせるだけですね！

![blender_サイズを合わせた状態](https://oekakityou.negitoro.dev/resize/0b13ef21-162f-4271-85cf-363016261496.png)

## 保存する
`Blender`で編集する予定があれば、ツールバーから`ファイル`→`保存`を選んで`.blend`形式で保存。  
もう完成して`3D モデル`を書きだすなら、`ファイル`→`エクスポート`→`wavefront (.obj)`形式が`ARCore`のサンプルコードで使われている形式なので、`obj`で書き出してください。  
適当な名前を付けて保存してください。

![blender_obj形式で書き出す](https://oekakityou.negitoro.dev/original/09642400-a61d-45fe-addb-4ab9d99ba4d9.png)

保存すると`.obj`形式ともう一つ何か生成されるのですが、`.obj`しか使いません！

## 何パターンか作った
閉じたバージョンも作りました。また、`Pixel 11 Pro Fold`も同じように作りました。まあ私は手元にあるので作らなくてもいいのですが。（下取りに出したのにまだ高い！）

![blender_pixelも作った](https://oekakityou.negitoro.dev/original/1603f869-0e9b-492a-8b46-8a78321347f2.png)

# アプリを作る

## ARCore のサンプルコードをクローンする
https://github.com/google-ar/arcore-android-sdk/tree/main/samples/hello_ar_kotlin

`Kotlin + OpenGL ES`のサンプルコードはこれです。  
`git`リポジトリの中に複数のサンプルコードがあるので、これだけが欲しくても多分全部クローンする必要があります。ファイルサイズが切りなる場合は`--depth=1`を付けて`git clone`するとよいかも？

```bash
git clone https://github.com/google-ar/arcore-android-sdk.git --depth=1
```

## サンプルコードを開く
`hello_ar_kotlin`フォルダを`Android Studio`で開きます。  
・・・・あ、`Gradle`周りが古すぎて一発ではビルドが通らないかも。

![android_studio_gradle_jdk_version](https://oekakityou.negitoro.dev/original/0c3a42a7-3c54-4a5e-8ef4-e9d23e9c14c6.png)

このダイアログ通りに`JDK`のバージョン（`Java`のバージョン）を変える方法もありますが、`Gradle`や`AGP`のバージョンを新しくしてビルドを通す方法もあります。  
今回は後者のバージョンをすべて新しくする方法で行きます。ダイアログはバツで閉じます。  
（`org.jetbrains.kotlin:kotlin-stdlib`とか逆に今通るか・・？とっくのとうに不要になったので）

いうまでもなく、`Gradle`周りのバージョンを新しくするのは`ARCore`**関係ないです。**

## Gradle 周りを新しくする
`2026年10月`現在。多分もっと新しいバージョンが出てると思いますが、ここでは私が公開してるアプリで使っているバージョンを使うようにします（コピペしたいだけです）

まず最近の`.gradle`ファイルは`.gradle.kts`という`Kotlin`を使った形式になるので、以下の3つのファイルを`.kts`に変更してください  
ビルドすら通ってないので名前変更で警告が出ても`Refactor`や`OK`を選んでください。

- `settings.gradle` → `settings.gradle.kts`
- `build.gradle` → `build.gradle.kts`
- `app/build.gradle` → `app/build.gradle.kts`

## 中身を書き換える
コピペできない部分はコメントで！  
また、今回はあとで`Jetpack Compose`で`ボトムシート`を作りたいため、`Jetpack Compose`込みのライブラリ設定になります。

### settings.gradle.kts

```kotlin
pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "iPhoneDuoSameSizeObjectARCore" // ここはプロジェクトの名前にしてください
include(":app")
```

### build.gradle.kts
`app`フォルダの方じゃない`build.gradle.kts`

```kotlin
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.compose.compiler) apply false
}
```

### gradle-wrapper.properties
`gradle/wrapper/gradle-wrapper.properties`にあります。

```properties
#Mon Aug 03 01:07:56 JST 2026
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionSha256Sum=553c78f50dafcd54d65b9a444649057857469edf836431389695608536d6b746
distributionUrl=https\://services.gradle.org/distributions/gradle-9.5.0-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

### app/build.gradle.kts

```kotlin
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.compose.compiler) // もし Room や Hilt で ksp や databinding で kapt 使ってるならここに追加
}

android {
    namespace = "com.google.ar.core.examples.kotlin.helloar" // これもアプリケーションIDに合わせるのがセオリーか
    compileSdk {
        version = release(37)
    }
    defaultConfig {
        applicationId = "com.google.ar.core.examples.kotlin.helloar" // アプリケーションID

        // AR Optional apps must declare minSdkVersion >= 14.
        // AR Required apps must declare minSdkVersion >= 24.
        minSdk = 24 // SDK バージョンが違う場合はこの辺を変更してください
        targetSdk = 37
        versionCode = 1
        versionName = "1.0"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    buildTypes {
        release {
            optimization {
                enable = true // ちな難読化のファイルは app/src/main/keepRules/rules.keep に移動になりました
            }
        }
    }
    buildFeatures {
        compose = true // viewbinding / databinding 使ってるなら
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // ARCore (Google Play Services for AR) library.
    implementation("com.google.ar:core:1.56.0")

    // Obj - a simple Wavefront OBJ file loader
    // https://github.com/javagl/Obj
    implementation("de.javagl:obj:0.4.0")

    implementation("androidx.appcompat:appcompat:1.1.0")
    implementation("androidx.lifecycle:lifecycle-common-java8:2.2.0")

    implementation("com.google.android.material:material:1.1.0")

    // --- ここまで ARCore のサンプルコードで使っている依存 ---

    // jetpack compose
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation3.ui)
    implementation(libs.androidx.navigation3.runtime)
}
```

### gradle/libs.versions.toml
とりあえず上記の`build.gradle.kts`で使っているライブラリのみ。  
既存の書き方をバージョンカタログにするとかはお任せします。

```toml
[versions]
agp = "9.3.1"
kotlin = "2.4.10"
activityCompose = "1.13.0"
composeBom = "2026.08.00"
nav3Core = "1.1.7"

[libraries]
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-navigation3-runtime = { module = "androidx.navigation3:navigation3-runtime", version.ref = "nav3Core" }
androidx-navigation3-ui = { module = "androidx.navigation3:navigation3-ui", version.ref = "nav3Core" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
compose-compiler = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
```

ここまでやるとビルドが通るハズなのですが、まあうまくいかないかと。`Gradle エラー`は我々が直せるレベルの話か怪しいときがよくあるから困るよな～


## 最低限ビルドが通るまでのコミット
https://github.com/takusan23/iPhoneDuoSameSizeObjectARCore/commit/127da743484ebb018d1571a0633a276171f1834f

## ちなみに起動すると
なんかピンみたいなのが置ける

![サンプルアプリの画面](https://oekakityou.negitoro.dev/resize/11d1e50d-2683-46f5-89a5-363f37a85767.jpg)

## オブジェクトを取り込む
`app/src/main/assets/models`に`.obj`を置いてください。  
ちなみに↑のオブジェクトは`pawn.obj`です。

![android_studio_ここにobjを置く](https://oekakityou.negitoro.dev/original/0652bf15-89a3-4b89-9432-590172ff5a7f.png)

## environmental_hdr 修正
テクスチャを作ってない（`3Dモデル`の画像を作ってない）ので、`テクスチャ`から色を取らずに単色にする処理を書く必要があります。  
でその処理はたぶんここです。

`albedo`は白色（`1.0, 1.0, 1.0`）として、その下の`roughnessMetallicAmbientOcclusion`の値の出所は忘れてしまいました。（え？）

```glsl
void Pbr_CreateMaterialParameters(const in vec2 texCoord,
                                  const in sampler2D albedoTexture,
                                  const in sampler2D pbrTexture,
                                  const in sampler2D dfgTexture,
                                  const in ShadingParameters shading,
                                  out MaterialParameters material) {
  // Read the material parameters from the textures
  // vec3 albedo = texture(albedoTexture, texCoord).rgb;
  // vec3 roughnessMetallicAmbientOcclusion = texture(pbrTexture, texCoord).rgb;
  // テクスチャを作ってないので
  vec3 albedo = vec3(1.0, 1.0, 1.0);
  vec3 roughnessMetallicAmbientOcclusion = vec3(0.5, 0.0, 1.0);
  // Roughness inputs are perceptually linear; convert them to regular roughness
  // values. Roughness levels approaching 0 will make specular reflections
  // completely invisible, so cap the lower bound. This value was chosen such
  // that (kMinPerceptualRoughness^4) > 0 in fp16 (i.e. 2^(-14/4), rounded up).
  // https://github.com/google/filament/blob/main/shaders/src/common_material.fs#L2

  // 以下省略...
```

## HelloArActivity
ここで、`3Dモデル`を切り替える`UI`を作るために`Jetpack Compose`を用意して切り替え`UI`も作ります。  
`Jetpack Compose`の`Activity`では`ComponentActivity()`を継承してるっぽいのでそうします。

```kotlin
class HelloArActivity : ComponentActivity() { // ComponentActivity に直す
```

次に、`setContentView()`を`Jetpack Compose`で描画するので`setContent`に置き換えます。  
ただ、`setContentView()`には`AR`を描画していた`SurfaceView`があるため、`AndroidView`で埋め込む必要があります。


`onCreate()`の`setContentView()`をこんな感じに治します。ボトムシートで切り替えもできる！  
また、`onCreate()`関数に`OptIn ExperimentalMaterial3Api`を付けろって言われると思うので付けてください。  
あと`HelloArRenderer`のクラスも書き換わってるので次直します。

```kotlin
// Set up Hello AR UI.
view = HelloArView(this)
lifecycle.addObserver(view)
setContent {
    // 既にある view は使いまわす + 自作部分だけ compose
    Box {
        AndroidView(factory = { view.root })

        val isShowObjSelectBottomSheet = remember { mutableStateOf(false) }
        if (isShowObjSelectBottomSheet.value) {
            ModalBottomSheet(onDismissRequest = { isShowObjSelectBottomSheet.value = false }) {
                LazyColumn {
                    items(HelloArRenderer.OBJECT_LIST) { obj ->
                        Text(
                            text = obj,
                            modifier = Modifier
                                .clickable {
                                    renderer.nextTapAddMeshObjName = obj
                                    isShowObjSelectBottomSheet.value = false
                                }
                                .padding(10.dp)
                                .align(Alignment.CenterHorizontally)
                        )
                        HorizontalDivider()
                    }
                }
            }
        }
        Button(
            modifier = Modifier.align(Alignment.BottomCenter),
            onClick = { isShowObjSelectBottomSheet.value = true }
        ) {
            Text(text = "オブジェクト選択")
        }
    }
}
```

## HelloArRenderer
まずは`obj`のファイル名を`companion object`で定数として定義しておきましょう。↑の`Activity`で使うのと、この`Renderer`で使うのでここで定義しておきます。

```kotlin
companion object {
    // 以下省略...

    val OBJECT_LIST = listOf(
        "google_pixel_11_profold_collapsed_same_size_obj.obj",
        "google_pixel_11_profold_expanded_same_size_obj.obj",
        "iphone_duo_collapsed_same_size_obj.obj",
        "iphone_duo_expanded_same_size_obj.obj"
    )
}
```

つぎに、オブジェクトを複数変数に保持できるように配列、正しくは`オブジェクトのファイル名`と`オブジェクト`の連想配列にします。  
なので`lateinit var virtualObjectMesh: Mesh`を連想配列に直します。

```kotlin
// Virtual object key:OBJECT_LIST value:Mesh
private val virtualObjectMeshHashMap = hashMapOf<String, Mesh>()
lateinit var virtualObjectShader: Shader
lateinit var virtualObjectAlbedoTexture: Texture
lateinit var virtualObjectAlbedoInstantPlacementTexture: Texture
```

つぎに、一番最後に変数を一つ。これは、次画面を押してオブジェクトを`AR`に追加する際に、`OBJECT_LIST`のどのオブジェクトを追加するかを保持するための変数です。  
`HelloArActivity`からこの変数を操作して切り替えできるように。`nextTapAddMeshObjName`

```kotlin
val session
    get() = activity.arCoreSessionHelper.session

val displayRotationHelper = DisplayRotationHelper(activity)
val trackingStateHelper = TrackingStateHelper(activity)

// 次追加するオブジェクト
var nextTapAddMeshObjName = OBJECT_LIST[0]
```

つぎに、`virtualObjectMesh`をロードしていた箇所で、代わりに連想配列にロードしたものを格納するようにします。  
そういえば`フラグメントシェーダー`で結局テクスチャを使わずに固定の色を表示するようになった。で、たぶん`GPU`は賢いので使われない`Uniform`変数（今回はテクスチャ）は削除され、渡しても渡す宛がなくなるのでコメントアウトします。

```kotlin
// assets にある obj をまとめて読み込む
virtualObjectMeshHashMap += OBJECT_LIST.associateWith { Mesh.createFromAsset(render, "models/$it") }
virtualObjectShader =
    Shader.createFromAssets(
        render,
        "shaders/environmental_hdr.vert",
        "shaders/environmental_hdr.frag",
        mapOf("NUMBER_OF_MIPMAP_LEVELS" to cubemapFilter.numberOfMipmapLevels.toString())
    )
        // .setTexture("u_AlbedoTexture", virtualObjectAlbedoTexture)
        // .setTexture("u_RoughnessMetallicAmbientOcclusionTexture", virtualObjectPbrTexture)
        .setTexture("u_Cubemap", cubemapFilter.filteredCubemapTexture)
        .setTexture("u_DfgTexture", dfgTexture)
```

つぎに、`onDrawFrame`まで移動します。  
画面更新のために何度も呼ばれ、ここで`OpenGL ES`を使って描画しているわけですね。

`render.draw(virtualObjectMesh, virtualObjectShader, virtualSceneFramebuffer)`に渡している`virtualObjectMesh`が描画したい`3Dオブジェクト`になります。  
ここを連想配列から取り出す。。ではまだダメで。

というのも、ここは画面更新のたびに呼び出されるため、追加したオブジェクトを渡してあげる必要があります。  
ここで`render.draw(virtualObjectMeshHashMap[nextTapAddMeshObjName] ...)`で渡すと、追加したオブジェクトのすべてが`nextTapAddMeshObjName`のオブジェクトになってしまいます。

そうならないためには、追加したオブジェクトが何なのかを保持しておけばよさそうですね。  
オブジェクトを決めるのは画面を押したとき。何を追加したかを保持して`render.draw()`ではその保持しているオブジェクトを描画するようにします。

ここではオブジェクトの位置？とかが入ってる`data class`があるので、これに何のオブジェクト化を追加で保持させます。  
`wrappedAnchors`が`AR`内に追加した（表示する）`3Dオブジェクト`のリストになります。

```kotlin
for ((anchor, trackable, mesh) in wrappedAnchors.filter { it.anchor.trackingState == TrackingState.TRACKING }) {
    // Get the current pose of an Anchor in world space. The Anchor pose is updated
    // during calls to session.update() as ARCore refines its estimate of the world.
    anchor.pose.toMatrix(modelMatrix, 0)

    // Calculate model/view/projection matrices
    Matrix.multiplyMM(modelViewMatrix, 0, viewMatrix, 0, modelMatrix, 0)
    Matrix.multiplyMM(modelViewProjectionMatrix, 0, projectionMatrix, 0, modelViewMatrix, 0)

    // Update shader properties and draw
    virtualObjectShader.setMat4("u_ModelView", modelViewMatrix)
    virtualObjectShader.setMat4("u_ModelViewProjection", modelViewProjectionMatrix)
    val texture =
        if ((trackable as? InstantPlacementPoint)?.trackingMethod ==
            InstantPlacementPoint.TrackingMethod.SCREENSPACE_WITH_APPROXIMATE_DISTANCE
        ) {
            virtualObjectAlbedoInstantPlacementTexture
        } else {
            virtualObjectAlbedoTexture
        }
    virtualObjectShader.setTexture("u_AlbedoTexture", texture)
    render.draw(mesh, virtualObjectShader, virtualSceneFramebuffer)
}
```

あとすこし、`handleTap()`関数まで移動してください。  
`wrappedAnchors.add()`している箇所があると思います。まだ`data class`を書き換えてないので赤くなると思いますが、第三引数を追加します。  
描画したい`3Dオブジェクト`ですね。先述の通り、画面に表示されるオブジェクトがすべて同じにならないよう、このタイミングで記憶するようにします。

```kotlin
wrappedAnchors.add(WrappedAnchor(firstHitResult.createAnchor(), firstHitResult.trackable, virtualObjectMeshHashMap[nextTapAddMeshObjName]!!))
```

さいご。`WrappedAnchor`に描画したい`3Dオブジェクト`を保持するための引数を追加するだけ。

```kotlin
/**
 * Associates an Anchor with the trackable it was attached to. This is used to be able to check
 * whether or not an Anchor originally was attached to an {@link InstantPlacementPoint}.
 */
private data class WrappedAnchor(
    val anchor: Anchor,
    val trackable: Trackable,
    val mesh: Mesh
)
```

## 動かす
これで起動すると、下にボタンが表示されて、`3Dオブジェクト`を選択できるようになり、画面を押すと選択した`3Dオブジェクト`が`AR`内に設置されるはずです！

![ARアプリ_オブジェクトを配置してみた](https://oekakityou.negitoro.dev/resize/028933ff-508a-401f-abc0-1063940010e9.jpg)

![ARアプリ_ボトムシート](https://oekakityou.negitoro.dev/resize/0f704f17-f692-4c79-89fd-aca0da328794.jpg)

ちなみに`20`個までしか表示できないはずです。`wrappedAnchors`に追加する前に超えていたら最後から消すみたいなのが入っているためです。  
なんで`20`なのかは知りません、負荷的な話ですかね？

# ソースコード
はい

https://github.com/takusan23/iPhoneDuoSameSizeObjectARCore

# おわりに
https://www.xreal.com/jp/aura

まじで全然関係ない話になるわけですが、`Android`搭載メガネ`XREAL AURA`がついに買えるらしい。10年以上前に`YouTube`で見た`Google Glass`がついに実現するのか？！。  
完全にスルーしてたわけですが、予約時点で`1500`ドルは超えない値段で発売するって言っててちょっと高いなあ～って

だったのが、発売すると`1279`ドルスタートで思ったよりかは安かった。ハイエンドスマホの値段とあんまり変わらない、もっとべらぼうに高いと思ってた。  
（まあ普通に全然高いんですけど！！）

もっと高くなるもんだと思ってたから下取りにして`Pixel 11 Pro Fold`に変えたけど、`10 Pro Fold`をそのまま続けてこっち買うか考えてたかもしれない・・・

# おわりに2
よくある？`iPhone 対 Androidスマホ`のクリックベイト記事にならないように書きましたが、もしそう感じてしまったらすいません。  
まじでもういいよ`iPhone`と`Android`の比較というか。煽りすぎ。

機嫌悪いときに見つけた日には、`Google Discover`（ホーム画面の一番左にあるやつ、`Chrome`にあるやつ）から`Web サイト`ごとまるまる非表示にしてる。

# おわりに3
もしおりたたみスマホ気になってる人がいれば。

わたし的には、折り目はマジで気にならない。触ればわかるし光の当たり方によっては折り目はちゃんと見える。  
でもそれだけ。普通に使えるし。こんなもんだよ。

それこそおりたたみスマホ黎明期は分からないけど今時そんなひどいことある？

折り目はもう仕方ない気がします。今でもスマホの電池は繰り返し使うほど使える時間が短くなってくるし。  
最近はあんまり聞かなくなりましたが、`iPhone X (2017)`で`有機EL (OLED)`が採用されたとき、人々は画面が焼き付くのではないかの話題で持ちきりになってた時と同じように見えます。  
（電池マークとかアンテナマークの部分が常に表示されるから残像が残るのではないか）

折り目なんかよりもハイエンド以上の値段を払ってもなお、望遠カメラが無いのが不満・・・難しいのかな

# おわりに4
ぼーっと`YouTube`みてたんですけど

https://www.youtube.com/watch?v=Od6M0AXpcxQ

![YouTube](https://oekakityou.negitoro.dev/original/0afa253b-c107-4f81-9f7a-b22ad75021bc.png)

`Neo`と`Duo`って名前の組み合わせ、言われるまで気付かなかった。  
`Macbook Neo`の時点で規則性に気付いていれば、`Ultra`でも`Fold`でもなく`Duo`だって予想できた可能性がある？