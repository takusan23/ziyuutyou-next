---
title: Kotlin Multiplatform の関数をエクスポートして npm install してブラウザで使う
created_at: 2025-06-30
tags:
- Kotlin
- KotlinMultiplatform
- TypeScript
- Next.js
---

どうもこんばんわ。  
花鐘カナデ＊グラム Chapter:3 星泉コトナ 攻略しました。前作やって無くてもいけそう！

!???!?!?!?!!

![感想1](https://oekakityou.negitoro.dev/resize/d048826e-81f0-4765-9fab-f691bbb53e79.jpg)

今作、物語がすごい進んだような気がする！！！最終章に向けての伏線的なのが。  
最終章すごい気になる。

![感想2](https://oekakityou.negitoro.dev/resize/3a97a6ae-a32a-4176-a2fe-15625f58d8c7.jpg)

なにかありそう最後のヒロイン

![感想3](https://oekakityou.negitoro.dev/resize/6e75a865-b294-469a-a4e4-edddbdeaa0e6.jpg)

↓このあとのシーンめっちゃ良かった。えちえちだった。

![感想4](https://oekakityou.negitoro.dev/resize/27fdabab-cfae-4536-8646-9e65a83375fb.jpg)

今作もだけど冒頭のやつ何なんだろう、、最後のヒロインで分かるのかな。  
ちなみに、今作は最後かわいいイベント CG で終れてよかった！！  
(Chapter 2 の一番最後は何だったんだ、、？)

かわいい！！！おすすめです！

![感想5](https://oekakityou.negitoro.dev/resize/b5f51760-6150-43e2-8fb4-2916bb720aad.jpg)

![感想6](https://oekakityou.negitoro.dev/resize/4ec82d16-f0ba-465a-af49-14ef7431bb42.jpg)

# 本題
`Kotlin Multiplatform`を使うと、`Kotlin`の関数をエクスポートして`npm ライブラリ`にして、`npm install`して`JavaScript`から呼び出すことが出来ます。  
https://kotlinlang.org/docs/js-to-kotlin-interop.html

# 今回ライブラリにするコード
今回はこれを使って`JavaScript`の`MediaRecorder`をシークできるようにするコードを、`npm install`して、`React`とかで使えるようにしてみます。

https://github.com/takusan23/FixSeekableWebmKotlinJs

https://takusan.negitoro.dev/posts/kotlin_js_fix_javascript_mediarecorder_webm_seek/

これですが、現状は`UI`も`Kotlin/JS`のリソースの中にある`HTML`に書いている状況です。  
これを、`シーク処理`は`Kotlin`で書いて`JS`向けにエクスポート。それを`React`か何かで`UI`を作り、呼び出すようにしてみます。

# 完成品
超実験的ですが、

以下の`GitHub`リポジトリを指定して`npm install`してください。  
`JavaScript`の`MediaRecorder`が生成する`WebM`ファイルをシークできるようにする関数を提供します。

```shell
npm install takusan23/himari-webm-kotlin-multiplatform-npm-library
```

詳しくは`README`見てください  
https://github.com/takusan23/himari-webm-kotlin-multiplatform-npm-library/blob/main/README.md

今のところ以下の環境で動くことを確認しています。
- `Next.js`の`クライアントコンポーネント`で使う
- `React`と`Vite`で使う

# 参考
参考にしましあ！！

https://www.jetbrains.com/help/kotlin-multiplatform-dev/create-kotlin-multiplatform-library.html

https://zenn.dev/itsu_dev/articles/37d8c2318ddc10

# 環境
`Android Studio`か`IDEA`が必要？

`npm ライブラリ`にしたあと、ブラウザで動かすには何かしらフロントエンドを作る必要があるのですが、今回は`Next.js`で。  
`React + Vite`でも動きます。

```kotlin
mapOf(
    "Android Studio" to "Android Studio Narwhal | 2025.1.1",
    "Kotlin" to "2.2.0",
    "Next.js" to "15.3.4"
)
```

# 作る
## プロジェクトを作る
https://github.com/Kotlin/multiplatform-library-template

ここに`Kotlin Multiplatform`のライブラリを作るテンプレートがあります。  
別に`Kotlin Multiplatform`のライブラリを作るわけじゃないです。がライブラリのテンプレートなので、`ComposeMultiplatform`とか入って無い構成。

このリポジトリを`git clone`して、`Android Studio`で開きます。

![open](https://oekakityou.negitoro.dev/original/71dc3924-9e54-4b8d-b55c-dba027ed4576.png)

`Gradle Sync`が終わるまでまちます！  
`JS`の世界から戻ってくるとやっぱり遅いねんこれ

![sync](https://oekakityou.negitoro.dev/original/bbfbe9ac-d5ba-4404-83f2-4bdcc0d0a504.png)

## Wasm ターゲットを追加する
https://www.jetbrains.com/help/kotlin-multiplatform-dev/create-kotlin-multiplatform-library.html#add-a-new-platform

↑と同じです。

`Kotlin/Wasm`を追加します。  
今回、`npm install`して`JS`側から使う際には`Wasm`が使われるようにします。`Kotlin/JS`は分からず...

`build.gradle.kts`を開いて、`kotlin { }`のところを探し、中に足します。

```kotlin
kotlin {
    // gradle wasmJsBrowserProductionRun
    // JavaScript からは、kotlin/wasm でライブラリとして npm で登録する。
    wasmJs {
        outputModuleName = "fix-seekable-webm-kotlin-wasm"
        binaries.executable()
        browser {
        }
        generateTypeScriptDefinitions()

        // https://kotlinlang.org/docs/wasm-js-interop.html#exception-handling
        compilerOptions {
            freeCompilerArgs.add("-Xwasm-attach-js-exception")
        }

        // npm の package.json に types を入れてくれないので
        // https://youtrack.jetbrains.com/issue/KT-77319
        // https://youtrack.jetbrains.com/issue/KT-77073
        compilations["main"].packageJson {
            this@packageJson.types = "kotlin/${outputModuleName.get()}.d.ts"
        }
    }

    // 以下省略
}
```

`outputModuleName`が出力される`.wasm`ファイルの名前だったり  
`binaries.executable()`でブラウザで動くようになるはず。

`generateTypeScriptDefinitions()`で、公開した`Kotlin`の関数に対応する、`TypeScript`の型定義を作ってくれます。  
ただ、その型定義を`JS`側で認識させるために、`this@packageJson.types`を指定する必要があります。`Issue`があるので今後修正されるはずです。

他にも`jvm()`や`androidTarget { }`、`iosX64()`がありますがまあどっちでも良いです。  
使わないので消しても良いかもしれません。

## Wasm 専用処理を書くフォルダを作る
プラットフォーム別の処理を書くフォルダです。今回は`Wasm`ですね。  
スクショのようにディレクトリを作ると、`wasmJsMain`ってディレクトリが生成されるはずです、

![ディレクトリ](https://oekakityou.negitoro.dev/original/53d4d18c-cd64-4d5f-b97c-3ee9040e6fca.png)

ここでは`wasmJsMain`を選びます。

![wasmJsMain](https://oekakityou.negitoro.dev/original/96e6f577-2ed8-4ec6-9375-30109dc0eb40.png)

## ドメインを使ったパッケージ名を作る
`Kotlin Multiplatform`でもこの考えが引き継がれているのかは、わからないのですが、今回は使います。  
どういうわけかというと、自分の持っているドメインをひっくり返したものをパッケージとして使う文化があります。

`https://takusan.negitoro.dev/`だったら、パッケージ名が`dev.negitoro.takusan`になるわけです。  
この後にアプリ名がつくので、`dev.negitoro.takusan.{APP名}`になるでしょうか。

ドメインなければ`GitHub Pages`の`.io`ドメインを使ったり。  
要は被らなければよいわけです。

というわけでやります。私はずっと`GitHub Pages`のを使っているので今回もこれで。あと後ろにアプリ名を``付与して、以下のようになりました。  
`io.github.takusan23.fixseekablewebmkotlinwasm`

![パッケージ名](https://oekakityou.negitoro.dev/original/7929e8f1-bd5a-4627-b915-1482f79656e6.png)

まあね、`Kotlin/Wasm`を`JS`ライブラリにするだけなら、**多分する必要ないです。**

## コードを書く
書きます。  
今回はすでにあるコードをコピーするだけ！  

![クラス](https://oekakityou.negitoro.dev/original/1d935131-e41e-480c-a904-2cb140dca43c.png)

`Kotlin Multiplatform`なので、`Kotlin`標準ライブラリか、`Multiplatform`対応ライブラリを使う必要があります。  
**ご存知でしょうが**、例えば`JVM`のクラスは、`JVM`ターゲットでは使えますが、`wasm (JavaScript)`ではもちろん使えません。

## JavaScript 側に公開する準備
`wasmJsMain`の`Kotlin`コードでは、`JavaScript`に公開する（エクスポートする）ためのアノテーションが利用できます。  
https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.js/-js-export/

なので、`wasmJsMain`に`JavaScript`側から呼び出したい関数を作ります。  
ファイル名は何でも良いはず？

ここに、トップレベルの関数を作って、`@JsExport`アノテーションを関数に付与すると、`JavaScript`から呼び出すことが出来ます！！！  

```kotlin
@OptIn(ExperimentalJsExport::class)
@JsExport
fun fixSeekableWebm() {
    // common で書いた処理を呼び出すなど
}
```

今回はこうです！！  
`WebM`ファイルのバイト配列を受け取って、`Kotlin Multiplatform 製`のシーク出来るようにする修正関数を呼び出し、バイト配列を返すという感じです。

エクスポートするには引数の制限があるので、こんな感じになりました。  
詳しくはこのあとの説明で！

```kotlin
@OptIn(ExperimentalJsExport::class)
@JsExport
fun fixSeekableWebm(webmByteArray: JsArray<JsNumber>): JsArray<JsNumber> {
    val kotlinByteArray = webmByteArray.toList().map { it.toInt().toByte() }.toByteArray()
    val elementList = HimariWebmParser.parseWebmLowLevel(kotlinByteArray)
    val fixedByteArray = HimariFixSeekableWebm.fixSeekableWebm(elementList)
    val wasmFixedByteArray = fixedByteArray.map { it.toInt().toJsNumber() }.toJsArray()
    return wasmFixedByteArray
}
```

### JavaScript と Kotlin のデータやり取り
https://kotlinlang.org/docs/wasm-js-interop.html#jsany-type

プリミティブ型は渡せます。

```kotlin
@JsExport
fun fixSeekableWebm(int: Int, string: String) // OK
```

一方、配列やバイト配列は一筋縄では行きません。  
https://kotlinlang.org/docs/wasm-js-interop.html#array-interoperability

```kotlin
@JsExport
fun fixSeekableWebm(list: List<String>) // エラー
```

これは、`JsArray<>`を使うことで配列も`JavaScript`から受け取ることが出来ます。

```kotlin
@JsExport
fun fixSeekableWebm(intList: JsArray<JsNumber>, stringList: JsArray<JsString>) {
    val kotlinIntList: List<Int> = intList.toList().map { it.toInt() }
    val kotlinStringList  = stringList.toList().map { it.toString() }
}
```

`JsArray`は拡張関数があるので、相互変換は結構簡単かなと思います。`Kotlin`らしくてすきすき大好き～

```kotlin
val kotlinByteArray: ByteArray = webmByteArray.toList().map { it.toInt().toByte() }.toByteArray()
val wasmFixedByteArray: JsArray<JsNumber> = fixedByteArray.map { it.toInt().toJsNumber() }.toJsArray()
```

そして、個人的にすごいと思ったのが、`JsReference<>`です。  
名前の通りこれは、`Kotlin/Wasm`側の値の参照を表現するクラスです。`Kotlin/Wasm`で使っている参照を表すためのものなので、`JS`側からはよく分からないオブジェクトとかになるはずです。

例えば、`Kotlin/Wasm`で`Kotlin`のクラスの参照を`JsReference`で返します。  
これは、`JS`の世界ではよく分からないオブジェクトですが、これを`Kotlin/Wasm`側の関数に渡すと、参照からクラスを取得できるという魂胆です。

```kotlin
@JsExport
fun parseWebm(webmByteArray: JsArray<JsNumber>): JsReference<WebmParseResult> {
    return HimariWebmParser.parseWebm(webmByteArray.toByteArray()).toJsReference()
}

@JsExport
fun getVideoWidthFromWebmParseResult(reference: JsReference<WebmParseResult>): Int? {
    return reference.get().videoTrack?.videoWidth
}
```

これを`JavaScript`で呼び出すと、`Kotlin/Wasm`で使っている値の参照がもらえます。  
`JS`側ではこの参照を、参照を必要とする関数に渡すくらいしか使い道はないと思います。

呼び出されると、`Kotlin/Wasm`側の関数は`get()`で参照からインスタンスに戻せるって。

```ts
const parseRef = parseWebm(intArray)
const width: number = getVideoWidthFromWebmParseResult(parseRef) 
```

もちろん`JsArray<>`に`JsReference`を入れてもちゃんと動きます。  
`JsArray<JsReference<T>>`

## JavaScript で呼び出せるようにエクスポートする
ここから`Gradle`のコマンドを入力するウィンドウを出します。  

![コマンド](https://oekakityou.negitoro.dev/original/26ff57a2-edd2-44b5-a8ef-b4bf7c89a4e7.png)

そしたら、テキストフィールドに以下のコマンドを入力して、`Enter`します。

```plaintext
gradle wasmJsBrowserProductionRun
```

![コマンド](https://oekakityou.negitoro.dev/original/cea5f350-8a10-4877-9c96-80d78242a363.png)

これで待っていると`npm install`出来るライブラリが出力されます。  
パスは→`build/wasm/packages/{outputModuleName}`に存在するはずです。

![dist](https://oekakityou.negitoro.dev/original/19f0512e-4bda-43bd-8742-5913e345045b.png)

なんか見覚えあるフォルダ構成だなって

### Configuration cache state could not be cached: field `value` of `kotlin.reflect.jvm.internal.ReflectProperties$LazySoftVal` bean found in field ...
なっがｗ

```plaintext
FAILURE: Build failed with an exception.

* What went wrong:
Configuration cache state could not be cached: field `value` of `kotlin.reflect.jvm.internal.ReflectProperties$LazySoftVal` bean found in field `descriptor$delegate` of `kotlin.reflect.jvm.internal.KClassImpl$Data` bean found in field `value` of `kotlin.InitializedLazyImpl` bean found in field `data` of `kotlin.reflect.jvm.internal.KClassImpl` bean found in field `nodeJsRootKlass` of `org.jetbrains.kotlin.gradle.targets.web.nodejs.NodeJsRootPluginApplier` bean found in field `this$0` of `org.jetbrains.kotlin.gradle.targets.web.nodejs.NodeJsRootPluginApplier$apply$nodeJsRoot$1` bean found in field `nodeJs` of `org.jetbrains.kotlin.gradle.targets.wasm.nodejs.WasmNodeJsRootExtension` bean found in field `nodeJsRoot` of `org.jetbrains.kotlin.gradle.targets.js.ir.KotlinBrowserJsIr` bean found in field `value` of `kotlin.InitializedLazyImpl` bean found in field `browserLazyDelegate` of `org.jetbrains.kotlin.gradle.targets.js.ir.KotlinJsIrTarget` bean found in field `$this_wasmJs` of `Build_gradle$1$1$3` bean found in field `__packageJsonHandlers__` of task `:library:wasmJsPackageJson` of type `org.jetbrains.kotlin.gradle.targets.js.npm.tasks.KotlinPackageJsonTask`: error writing value of type 'java.lang.ref.SoftReference'
> Unable to make field private long java.lang.ref.SoftReference.timestamp accessible: module java.base does not "opens java.lang.ref" to unnamed module @81439d1
```

よくわからないですが、`Gradle`の`Configuration Cache`が有効になってるとなぜか失敗する。  
とりあえず成功させたいので`gradle.properties`ファイルを開き、以下のキーを`false`にした。

```plaintext
org.gradle.configuration-cache=false
```

### Lock file was changed

```plaintext
FAILURE: Build failed with an exception.

* What went wrong:
Execution failed for task ':kotlinWasmStoreYarnLock'.
> Lock file was changed. Run the `kotlinWasmUpgradeYarnLock` task to actualize lock file
```

何もしてないはずなので、`kotlin-js-store`フォルダーを消しました。とりあえずは治りました。

## npm install してみる！
`React + Vite`でも`Next.js`でも何でも良いのですが、今回は`React`で`UI`を作り、`Kotlin/Multiplatform`の関数を呼び出そうかなと。  
これはどっちでも良いと思います。なんなら`React`以外でも良いんじゃない？

- `Next.js`+`クライアントコンポーネントで Kotlin/Wasm の関数を呼び出す`
  - ひと手間必要です
- `Vite + React`
  - OK
  - コピーして使う分には問題ないはず

今回は一番手間な`Next.js + クライアントコンポーネント`でやってみます。  
とにかく`React`で試したい場合は`Vite`がいいと思います。

というわけで新しいフォルダを作って、`Next.js`のプロジェクトを作ります。  
今回は`TypeScript ON`、`TailwindCSS ON`、`AppRouter / src directory ON`でいきます。

https://nextjs.org/docs/app/getting-started/installation

```shell
npx create-next-app@latest
```

![こまんど](https://oekakityou.negitoro.dev/original/4928459c-4ed7-4720-9c05-2fef194c7734.png)

適当にフロントエンドのプロジェクトが出来たら、さっき作った`Kotlin/Wasm`のライブラリを入れます。  
フロントエンドのフォルダに、さっきの`Kotlin/Wasm 製`ライブラリをコピーして、ファイルパスを指定して`npm install`をします。

![コピー](https://oekakityou.negitoro.dev/original/0c62d11c-c17d-4c2a-b7f9-167a913e5b1f.png)

![インストール](https://oekakityou.negitoro.dev/original/9b46e331-efd3-4a6c-a2fd-dc4e84df4499.png)

## インポートして使ってみる
こんな感じにフロント側で、適当な`TypeScript`を開いて（今回は`page,tsx`）、`Kotlin/Wasm`でエクスポートした関数名を入力すると、`VSCode`が補完を表示するはず。  
もし出なくても、`import { } from "ライブラリ名"`すれば取り込めるはず。

![補完](https://oekakityou.negitoro.dev/original/66e700db-1dfd-4f1e-9032-c460355f1534.png)

すごい！！！

```tsx
import { fixSeekableWebm } from "fix-seekable-webm-kotlin-wasm";

export default function Home() {
    fixSeekableWebm()
}
```

## 実際に使ってみる
今回は`MediaRecorder`の`WebM`をシークできるようにするコードなので、`MediaRecorder`から書いていきます。  
もう面倒なのが理由ですが、全部一つのファイルに書いたほうが読む側は楽かな～って

今回は`Next.js`+`TailwindCSS`を使っています。  
録画開始ボタン・終了ボタン。それから`WebM`ファイルを受け付けるボタンをおいています。  
`MediaRecorder`の画面録画は多分調べたら出てくるので省略します。

画面録画すると`Blob[]`が取得できます。配列の中身を全部つなげると`WebM`ファイルになるという感じです。  
なんとかして`ArrayBuffer`に変換します。これを`Int8Array()`とかに渡すと無事バイト配列として操作できるというわけです。  
このバイト配列を`Kotlin/Wasm`の関数渡します。型エラーになるので無理やりキャストして渡しています。一応動いてます。  
あとは、この関数の返り値をいい感じに`Int8Array -> ArrayBuffer -> BlobUrl`にすることでダウンロードができます。

`await import("fix-seekable-webm-kotlin-wasm")`しているのは後述します。

```ts
"use client"

import { useRef, useState } from "react";

export default function Home() {
  const chunkList = useRef<Blob[]>([])
  const mediaRecorder = useRef<MediaRecorder>(null)
  const mediaStream = useRef<MediaStream>(null)
  const [isRunning, setRunning] = useState(false)

  async function handleStartClick() {
    mediaStream.current = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: { channelCount: 2 } });
    mediaRecorder.current = new MediaRecorder(mediaStream.current, { mimeType: 'video/webm; codecs="vp9"' })
    mediaRecorder.current.ondataavailable = (event) => {
      chunkList.current.push(event.data);
    }
    mediaRecorder.current.start(100)
  }

  async function handleStopClick() {
    // 終了させる
    mediaRecorder.current?.stop()
    mediaStream.current?.getTracks().forEach((track) => track.stop())
    // シークできるようにする関数
    const webmArrayBuffer = await (new Blob(chunkList.current, { type: "video/webm" })).arrayBuffer()
    startFixSeekableWebmLibAndDownload(webmArrayBuffer)
    // リセット
    chunkList.current.splice(0)
  }

  async function startFixSeekableWebmLibAndDownload(arrayBuffer: ArrayBuffer) {
    // UI に反映
    setRunning(true)
    // Kotlin/Wasm の JsArray<Number> にする
    const intArray = new Int8Array(arrayBuffer)
    // Kotlin/Wasm でエクスポートした関数を呼び出す
    // 今のところ遅延ロードでクライアントからインポートする必要がありそう
    // window オブジェクトが使えるかの判定を内部でしている雰囲気
    const { fixSeekableWebm } = await import("fix-seekable-webm-kotlin-wasm")
    const fixSeekableWebmNumberList = fixSeekableWebm(intArray as any)
    const fixSeekableWebmIntArray = new Int8Array(fixSeekableWebmNumberList as any)
    // ダウンロード
    const downloadBlob = new Blob([fixSeekableWebmIntArray], { type: "video/webm" })
    const blobUrl = URL.createObjectURL(downloadBlob)
    // <a> タグを作って押す
    const anchor = document.createElement("a") as HTMLAnchorElement
    anchor.href = blobUrl
    anchor.download = `fix-seekable-webm-kotlin-wasm-${Date.now()}.webm`
    document.body?.appendChild(anchor)
    anchor.click()
    anchor.remove()
    // 戻す
    setRunning(false)
  }

  async function handleWebmFilePicker(event: React.ChangeEvent<HTMLInputElement>) {
    // 取得
    const webmFile = event.currentTarget.files?.[0]
    if (!webmFile) return
    // 処理開始
    const webmArrayBuffer = await webmFile.arrayBuffer()
    startFixSeekableWebmLibAndDownload(webmArrayBuffer)
  }

  return (
    <div className="flex flex-col items-start space-y-2">

      <h1>JavaScript の MediaRecorder で出力される WebM をシークできるようにする Kotlin/Wasm</h1>
      <h2>Kotlin/Wasm を npm install して Next.js から使っています。</h2>

      {
        isRunning && (
          <p className="text-red-400">
            WebM ファイルをシークできるように修正中です。すこし時間がかかります。
          </p>
        )
      }

      <div className="flex flex-col p-2 border-2 border-blue-400 rounded-lg">
        <h3>MediaRecorder 録画開始・終了</h3>
        <button className="border-2" onClick={handleStartClick}>録画開始</button>
        <button className="border-2" onClick={handleStopClick}>録画終了</button>
      </div>

      <div className="flex flex-col p-2 border-2 border-blue-400 rounded-lg">
        <h3>すでにある WebM ファイルをシークできるようにする</h3>
        <input
          className="border-2"
          type="file"
          accept=".webm"
          onChange={handleWebmFilePicker} />
      </div>
    </div>
  )
}
```

スクリーンショットです。  

![UI](https://oekakityou.negitoro.dev/original/adee7c18-f8c3-4e3f-9840-c6df5c23fb3c.png)

### Next.js のクライアントコンポーネントで呼び出して使う

#### Kotlin/Wasm の JS コード修正
ちなみに、`Vite+React`ではこの問題は起きません。`process`オブジェクトがそもそもないので。

一方、`Next.js`のクライアントコンポーネントから使おうとすると、このエラーが発生します。

```plaintext
Error: Cannot read properties of undefined (reading 'name')
```

調べた結果、`Next.js`のサーバーコンポーネントの場合、グローバル変数の`process`の`process.release.name`の返り値が`"node"`なんですが、  
クライアントコンポーネントでは、`process`オブジェクトは存在するものの、`release`オブジェクトが存在しないのでエラーになる。

クラッシュする箇所のコードは、`fix-seekable-webm-kotlin-wasm.uninstantiated.mjs`ファイルの、この行で`release`オブジェクトが存在するかの条件を足すだけだと思います。  
https://github.com/JetBrains/kotlin/blob/c0389ea0ab922e0e3f53b5562251b7d53191239a/compiler/ir/backend.wasm/src/org/jetbrains/kotlin/backend/wasm/wasmCompiler.kt#L333

```ts
const isNodeJs = (typeof process !== 'undefined') && (process.release.name === 'node');
```

なので、こうやって`truthy`の値かの判定を入れるか、**オプショナルチェーン**するか。  
今のところ、`Kotlin`が出力したファイルを手直しするのが一番早そう。手直しするのが一番ダメそうな案だけど。

```ts
// truthy
const isNodeJs = (typeof process !== 'undefined') && process.release && (process.release.name === 'node');

// もしくは optional chaining
const isNodeJs = (typeof process !== 'undefined') && (process.release?.name === 'node');
```

#### 遅延読み込みさせる
これも`Vite+React`の場合は問題になりません。良くも悪くもブラウザ環境でしか描画されないためです。

`Kotlin/Wasm`が`.wasm`をロードする際、今の環境がサーバーかブラウザかでロード処理を分けています。  
クライアントコンポーネントで`Kotlin/Wasm`の関数を呼び出して使う場合、ブラウザ環境で動かすことになります。

https://github.com/JetBrains/kotlin/blob/c0389ea0ab922e0e3f53b5562251b7d53191239a/compiler/ir/backend.wasm/src/org/jetbrains/kotlin/backend/wasm/wasmCompiler.kt#L356-L385

で、そのブラウザ環境かの判定に`window`オブジェクトがグローバル変数に存在するか。で判定しています。  
`Next.js`を使ったことある方、**もうお分かりですね。**

```ts
typeof window !== 'undefined'
```

`Next.js`は御存知の通り、サーバー(`Node.js`環境)で一回`React`が描画されてから、ブラウザへ送信されます。  
`Next.js`の強みです。

これがブラウザ環境で描画する場合、ブラウザ由来の`API`、`window`や`document`が存在します。よってこの判定は問題なく動くわけですね。  
一方`Node.js`環境で描画する場合、ブラウザ由来の`API`は存在しないため、**判定結果がNode.js**、でなります。いや`Node.js`環境だってんだからそりゃそうだろ。  

これを回避し、常にブラウザ環境でロードする方法があります。**どっちかと言うと**ギリギリまでライブラリのロードを**遅らせる**。が正しいですね。  
遅延ロードって方法ですね。`window`が`undefined`以外であることが保証されているはずです。  
https://nextjs.org/docs/app/guides/lazy-loading

今回はこれを使うことで、確実に（？）ブラウザ側でしかライブラリがロードしないようになりました。  
必要になるまでロードしないため、高速化にもつながったはずです。

というわけで、このインポートを消して

```ts
import { fixSeekableWebm } from "fix-seekable-webm-kotlin-wasm"
```

代わりに必要なタイミングで`await import()`するように修正しました

```ts
async function startFixSeekableWebmLibAndDownload(arrayBuffer: ArrayBuffer) {
    // 必要になるまでライブラリを import しない
    const { fixSeekableWebm } = await import("fix-seekable-webm-kotlin-wasm")
    const fixSeekableWebmNumberList = fixSeekableWebm(intArray as any)
}
```

# 完成！
`Kotlin/Wasm`で作った関数を`JavaScript`で呼び出して使うことが出来ました！！！  
ちゃんと録画した動画がシークできるようになってます！

![トップ](https://oekakityou.negitoro.dev/original/adee7c18-f8c3-4e3f-9840-c6df5c23fb3c.png)

![録画開始](https://oekakityou.negitoro.dev/original/66b300ca-f70c-4b65-b3d5-ee970e755c42.png)

![保存](https://oekakityou.negitoro.dev/original/4cd512e5-1067-4eb1-908c-ae3ba7ade490.png)

![シークできる！](https://oekakityou.negitoro.dev/original/55783f35-df67-40ad-9d73-6138aee78f3b.png)

# ソースコード
今回の例で使ったものたち

- Kotlin Multiplatform 側
    - https://github.com/takusan23/multiplatform-library-jsexport-sample
- 呼び出す Next.js 側
    - https://github.com/takusan23/kotlin-wasm-nextjs

冒頭の`GitHub`から`npm install`できる`npm ライブラリ`と`Kotlin Multiplatform`
- Kotlin Multiplatform 側
  - https://github.com/takusan23/HimariWebmKotlinMultiplatform
- npm ライブラリ
  - https://github.com/takusan23/himari-webm-kotlin-multiplatform-npm-library

# おわりに
https://webm.negitoro.dev/

シークできる処理は`Kotlin`で書かれていて、`Kotlin/JS`しています。  
一方、`Kotlin/JS`では`React`なんかは使えない（使えたところで Kotlin で書くのは・・・）ため、見た目は調整せず`HTML`を書いただけになっていました。

ですが、シークできる処理が`npm ライブラリ`になったことで、見た目は`React`で書いて、シークする処理は`Kotlin/Wasm`のライブラリを読み込むだけになった。  
見た目はやっぱり`React`とかで作りたい。

それと、`JavaScript`前提の`ブラウザ API`を`Kotlin`の文法で書くのは、、、コレジャナイ感ある。  
すべての`ブラウザ API`が`Kotlin/JS`で呼び出せる、、わけじゃない。  
一部の`API`は用意されてないので、`js()`で`JavaScript`のコードを文字列で渡していて、やっぱ`JavaScript`向けの`API`はその言語で書くべきだよなって。

https://github.com/takusan23/FixSeekableWebmKotlinJs/blob/master/src/jsMain/kotlin/App.kt

`js(" ここに JS コード  ")`←これがよく動いているのはすごいけど、、

# おわりに2
`Kotlin Multiplatform`するとホームディレクトリに地味にでかいフォルダが生成されます。

![1GB超え](https://oekakityou.negitoro.dev/original/db7bbb12-6717-4b3b-aae6-d8b8f1ad685f.png)

# おわりに3
https://github.com/takusan23/FixSeekableWebmKotlinJs

今回使ったこれ、メモリに優しくない（めっちゃ消費する）ので、イマイチです。