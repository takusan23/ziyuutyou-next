---
title: ブラウザと USB で APK インストール + 開発者認証の文句
created_at: 2025-10-18
tags:
- Android
- WebUSB
- Next.js
---
どうもこんにちわ。  
`Pixel 10 Pro Fold`届きました、初！！！！！！！フォルダブル？折りたたみ？スマホです。

![pixel10profold_unboxing](https://oekakityou.negitoro.dev/resize/d95c7828-38dc-4467-a65d-e97e974b6273.jpg)

こわいのでケース買います！純正のは高いので適当にアマゾンで買おうと思いますが、そういえばわたし**プライム会員じゃ無いん**ですよね。  
`without プライム会員`なのでいつも送料無料になるまでなにか探しています。最近だと実物写真取るのに背景が映ると嫌なので**ちっちゃい撮影スタジオ**みたいなのを買いました。グリーンバック

それで今回は、、、会社のチームメンバーにプライム会員！！！がいらっしゃったので代わりに買ってもらいました。  
なお商品の値段だけ払った模様。プライム古事記ですよねそうです。

![case](https://oekakityou.negitoro.dev/resize/5330f6ad-08d9-4a03-bc81-692e7e7bd4c2.jpg)

`プライム`はや～～～い、  
プライム会員、お急ぎ便とか無料配送とか抜きにしても確か映画とかドラマが見れるらしい。  
わたしもガリレオの映画（3つ目のやつ）まだ見れてない。あとすみっコぐらしも絵本のやつ良かったから他のも見たい。

めちゃいいかんじです。ヒンジ？開いたときに収納される部分も守ってくれるやつを買いました。高いからね仕方ないね。  
折りたたまない方の画面の保護フィルムは自分で貼りたかったのですが、折りたたみスマホのケースって大体こっちの画面も守ってくれるんですよね。ガラスフィルムみたいなのが一体になってる。保護フィルム見たく粘着するんじゃなくてはめるだけ。  
多分画面を覆うようにはめ込む設計にしないと落っこちちゃうからだと。どうしても縁？バンパー？だけなら両面テープ。

でもどうしてもフィルムを使いたかったので、、、ガラスを割りました。でもほんのちょっとだけ怪我したので**おすすめしません**。  
バンパーだけじゃ落っこちちゃうので付け焼き刃ですが両面テープを貼りました。怪我したけどさらさらのアンチグレアフィルムが使えて満足（いつも`PDA工房`の`Perfect Shield`を買ってる）

![screen_protector](https://oekakityou.negitoro.dev/original/bf9d1974-c496-43bc-bb8e-7b9bfe1accd7.jpg)

最後に初感

めちゃいいです。おりたたみ。多分フリック入力のが早いんだけど、開いたときのローマ字が良い。  
`Gmail`とか`Google Keep`とか`Google マップ`がでかい画面対応してていいな～、アダプティブレイアウト作りたいな～気分になりました。`layout.xml`じゃないしそんな難しくないと見込んでるけどどう？

![css_mediaquery](https://oekakityou.negitoro.dev/resize/21d5c3e3-d078-4012-a62f-9539ac4cb742.jpg)

あと、これならスマホで`Markdown`も夢じゃないのでは！？！？

以上です。本編行くぞ！！！

# 先に完成品
`Chrome`ブラウザを使って`APK`ファイルをインストールする

https://androidapksideloadwebapp.negitoro.dev

![first](https://oekakityou.negitoro.dev/resize/d9c13372-0518-486c-b7b7-4de669d52e35.png)

![confirm](https://oekakityou.negitoro.dev/resize/75c2f3bd-337e-47af-b591-329c2a4539f9.png)

![installed](https://oekakityou.negitoro.dev/resize/d2ece96d-e8c9-4621-a8df-e4a18c18bbaa.png)

# 本題

https://android-developers.googleblog.com/2025/08/elevating-android-security.html

https://android-developers.googleblog.com/2025/09/lets-talk-security-answering-your-top.html

近い将来、`APK`ファイルを直接配信する開発者に対しても、`Google`は開発者登録を強制する。

わるさをする`APK`を繰り返し配信し続ける奴らを締め出したい。のが目的らしい。  
身元を特定できるようにして、もうインストール出来ないようにするらしい。**別にアプリを審査するわけではなく、ただ前科がある開発者かどうかを見るだけっぽい。**

いやめんどくせえな、君たちが`Google Play`製品版のハードル引き上げたんだろうに、次はこれかよ。

# 何が困る
https://f-droid.org/fr/2025/09/29/google-developer-registration-decree.html

`Apple iPhone`とは違うある程度開かれたプラットフォームを期待してた人は残念だし、`APK`ファイルを配るだけなのに`Google`へ個人情報を渡さないといけない。

`macOS`もサードパーティアプリに対してが、どのルートで配布するにしても`Apple`に登録が必要。これを`公証`とか言うらしく、`macOS`のゲートキーパー機能が公証したアプリか確認しているそう。  
これと同じことが`Android`にも来る。。しかも回避策は後述する`adb install`以外にない。

なんで`Google`に登録しないといけないんだ。自分で買ったんだから自由にできる選択があるだろうよ。

というかこれが執行されると`Google`の力が強くなりすぎてしまう。`Google`にとって**都合が悪いアプリを難癖つけて配信停止に追いやることだって技術的には出来る。**  
それだけの権限があるんだけど。

セキュリティだけであれば`Google Play Protect`があるし、そっちに全振りすればいいと思う。

水面下ではすでに開発者認証で使われるであろう`API`が登場し始めています。  
https://developer.android.com/sdk/api_diff/36.1-incr/changes/android.content.pm.PackageInstaller

**本題からずれるので文句は一番最後に書いた。** → [開発者認証の文句](#開発者認証の文句)

## 回避策

https://developer.android.com/developer-verification/guides/faq

開発者向けとして`ADB`コマンドを利用すると回避できるみたいです。  
ただ`ADB`コマンドを利用するためには、`AndroidStudio`を入れるか、`platform-tools`を単品で入れるかが必要で、開発者でなければ厳しい。

# WebUSB
さて、話変わって、`Google`が作ってる`Chrome ブラウザ`の話でも。

`Chrome`（とその系列）には、`WebUSB API`があります。これは、フロントエンド開発者向けに、ウェブサイト内で`USB`で接続したデバイスと通信したいな～ってときに使えます。  
（通信したい時がほとんど無いと思うんだけど、、、）  
それこそ、`ADB`コマンドのような`USB`接続をするようなアプリを、ブラウザだけで作ることが出来ます。

知ってる限り、`Google Pixel`端末へ`Android OS`を入れ直す（焼く）（`Flash`する）ための`ウェブサイト`で使われてます。まじで`Chrome`だけで出来る。

https://takusan.negitoro.dev/posts/android_16_dp_install/

一方、この`API`は`Chrome`だけで、`Safari`と`FireFox`ではこの`WebUSB`は利用できません。  
なので`CanIUse`も`Chrome 系列`のみになっている→https://caniuse.com/webusb

`Standards Positions`見たけどやっぱりそれぞれ反対してる。

- https://github.com/mozilla/standards-positions/issues/100
- https://github.com/WebKit/standards-positions/issues/68

スマホアプリとかは`USB`にアクセスしたところで、審査があるので最低限担保されるかもだが、`Web`ではそうはいかない。ユーザーに委ねるのはあまりにも危険。

https://github.com/mozilla/standards-positions/issues/336#issuecomment-634116454

まあ使い道が思いつかない。  
今回みたいに、本来は開発者向けに使われる`adb install`を何故かパソコンのブラウザだけで出来るように上方修正する。みたいな抜け道としてしか使われなくない？  
調べた：マイコンボードに書き込むのに使ってるらしい。`Web`ブラウザでコード書くのかな。`GoogleDocs`みたいにめちゃめちゃ作り込まれてないと`Web`ベースの`IDE`は厳しい気が。

ユーザーが騙されてダイアログで`USB`デバイスを接続してぐちゃぐちゃにされる未来しか無いんだけど気のせい？

## WebUSB で adb install すればパソコンのブラウザだけで開発者認証を回避できるのでは
`adb install`経由では免除されると、また、`WebUSB`を使えば`ADB`コマンドの実装が出来そう、、、

あれ、これ、パソコンのブラウザだけで`APK`サイドローディング出来ませんか？  
`adb`のセットアップとか無しで。  
いいんですか？？？もちろんパソコンへスマホを接続する必要がありますが。

なんというか、`Safari / Firefox`に従っておけば抜け道ができることなんて無かったの、かも。（いうほど抜け道か？）

# WebUSB で ADB できるか調査
これが`NPM ライブラリ`っぽく使えそう。

https://github.com/GoogleChromeLabs/wadb

あと先駆者さんがいました、  
Chu！人のネタのパクリでごめん（そういえば HoneyWorks 原点回帰した!??!）

https://adb.andro.plus/

# つくった
冒頭の画像を再掲しますが、、、

https://androidapksideloadwebapp.negitoro.dev

![first](https://oekakityou.negitoro.dev/resize/d9c13372-0518-486c-b7b7-4de669d52e35.png)

![confirm](https://oekakityou.negitoro.dev/resize/75c2f3bd-337e-47af-b591-329c2a4539f9.png)

![installed](https://oekakityou.negitoro.dev/resize/d2ece96d-e8c9-4621-a8df-e4a18c18bbaa.png)

`ADB`の実装は↑のライブラリを使っているだけです。  
あとは適当に`Next.js (static export) + TailwindCSS + TypeScript`です。  
`WebUSB`はもちろん`ブラウザ JavaScript`の`API`なので、`Next.js`使ったけど`クライアントコンポーネント`です。

ボタンを押して`WebUSB API`経由で端末と接続し、`APK`ファイルを選択するとインストールが開始されます。  
`.apk`ファイルを`Android`へインストールするために、もうあの黒い画面、`コマンドプロンプト・PowerShell`のようなターミナルさんに一切触れること無くインストールできます。  
ほんとにパソコンには`Chrome`が入っていればそれだけで良くなった。

なんか実装が間違っているのか、常に`USB デバッグを許可しますか？`のダイアログがでています。  
`localStorage`的なのに書き込んで永続化する必要があったかもしれません。

# 感想
作った感想だよ～

## GoogleChromeLabs/wadb が今日のフロントエンドで動くようにする
`git clone`したあと、  
デモサイトを消しました。ライブラリ単品で欲しかったので・・・  
テストを消しました。すいません。

あと今の`TypeScript`で通るように`ArrayBufferLike`のあれこれを直しました、`DataView`のところを`DataView<ArrayBuffer>`とジェネリクスの型を渡すようにしました。  
とりあえず動いてる。

あと`Web Crypto API`が使えなかった？ためか代替ライブラリを使っていたのですが、ネイティブの`Web Crypto API`で動いてそうだったのでライブラリを消しました。  
この代替ライブラリは`C言語?`のコンパイル処理が存在してて、そのためには`Windows`の場合は多分`VisualStudio`とかを入れる必要があって・・・

こんな感じに、`npx tsc --noEmit`が激怒長エラーメッセージが消えればおっけーです。型が合わないエラーメッセージが長いんよな・・・

最後に`npm i ./gitcloneしたときのパス`すれば、ローカルにある`npm`パッケージを入れることが出来ます。  
どうでもいいですが`npm i githubのリポジトリurl`もいけます。

## APK ファイルを選ぶ input の mimeType
`application/vnd.android.package-archive`！！！

```tsx
<input
    id="apk_select"
    className="px-5 py-2 bg-blue-200 rounded-full"
    type="file"
    accept="application/vnd.android.package-archive"
    onChange={ev => {
        const apkFile = ev.currentTarget.files?.item(0)
    }} />
```

## 実際にインストールするまで
`GoogleChromeLabs/wadb`をつかって

まずは接続に必要なインターフェースを実装します。よくわからないのでデモからコピペしています。

https://github.com/GoogleChromeLabs/wadb/blob/5c8f5518466ff558d8b151235667d9ccb237d876/demo/src/livestream.ts#L37

```ts
class MyKeyStore implements KeyStore {
    private keys: CryptoKeyPair[] = [];
    async loadKeys(): Promise<CryptoKeyPair[]> {
        return this.keys;
    }

    async saveKey(key: CryptoKeyPair): Promise<void> {
        this.keys.push(key);
        console.log('Saving Key' + key);
    }
}
```

つぎは接続箇所。  
呼び出すと、パソコンのブラウザで`USB`に繋いだ`Android`端末を選ぶダイアログ？が出るので選んで。  
`Android`端末側では`USB デバッグを許可するか？`のダイアログで許可してあげてください。

```ts
const adbClient = useRef<AdbClient>(null)
const transport = useRef<WebUsbTransport>(null)

/** 接続を開始する。ユーザーは開いたダイアログでデバイスを選択すること */
async function connect() { // 近い将来 React Compiler が登場するので、手動で useCallback するのはやめる、JetpackCompose の StrongSkippingMode みたいな
    const options: Options = {
        debug: true,
        useChecksum: false,
        dump: false,
        keySize: 2048
    };

    try {
        const keyStore = new MyKeyStore()
        transport.current = await WebUsbTransport.open(options)
        adbClient.current = new AdbClient(transport.current, options, keyStore)
        const info = await adbClient.current.connect()

        // info に接続した端末の名前とかが入ってる

    } catch (e) {
        // TODO err
    }
}
```

次に`APK`ファイルを転送+インストールする処理。いままで`adb install`と言っていましたが、  
**正しくは`apk`ファイルを`Android`端末に転送して、そのあとそこからインストールするコマンドを叩く。が正解です。**

`apkFile`は`<input>`の`onChange = { ev => ev.currentTarget.files?.item(0) }`の値です。  
`HTMLInputElement`に生えてますよね。

https://developer.mozilla.org/ja/docs/Web/API/HTMLInputElement/files

```ts
try {
    // 転送する
    const apkBinary = await apkFile.arrayBuffer()
    const blob = new Blob([apkBinary])
    const tempApkFilePath = `/data/local/tmp/${Date.now()}_android_apk_sideload_web.apk`
    // 1_000_000 にした途端動かなくなった...
    // いい感じにバイト配列を分割して転送してくれるそう
    await adbClient.current?.push(blob, tempApkFilePath, "0755", 5_000)

    // インストールする
    await adbClient.current?.shell(`pm install ${tempApkFilePath}`)

    // 消す
    await adbClient.current?.shell(`rm ${tempApkFilePath}`)
} catch (e) {
    // todo えらー
}
```

`WebUSB`の技術的な制約なのか何なのかはよくわかりませんが、一度に遅れるバイトには制限があるらしく、このライブラリでは分割して送ってるみたいです？  
手元では`1_000_000`したら`0バイト`のファイルが転送されていました。ギリギリで生きるのをやめます。

あとはインストールコマンドと削除。  
よくみると`adb install`とか`adb devices`とかの**コマンドではなく、adb shell した後にするコマンド**を入れる必要がありますね。  
`adb shell am start -d https://example.com`みたいな。

切断するなら。

```ts
try {
    await adbClient.current?.disconnect()
    await transport.current?.close()
} catch {
    // 物理的に引っこ抜いたとか...
}
```

# おわりに
`CloudFront`+`S3`でサイトを公開したのですが、これからもこの構成で公開するとなると`CloudFormation`的なのを作っておこうと思い作ってたんですが**3日**ぐらいかかりました。  
使うかわからんものに・・・

https://takusan.negitoro.dev/posts/aws_cloudformation_create_ziyuutyou_infrastructure/

あーあ、マネジメントコンソール（ブラウザ）をポチポチしてれば1時間くらいだったのに。

# 開発者認証の文句
**悪口ばっかりなのでもう帰ってもらって結構です。**  
サイドローディングであーだこーだ言ったところで大多数はサイドローディングしないんだから極論どうでもいいんだよな。

私としてはすでに`PlayConsole`に個人情報を渡しているからなあ、それにともない`PlayStore`で本名だけは開示されてるし、、、学生とかだとクソきついと思う

開発者認証のためにインターネット接続が必要になる予感。登録済みアプリ全部のリストをローカルに持っておくわけにはいかないだろうし。  
個人情報を渡したくない場合は、趣味向けアカウントを作ることが出来るが、これはインストールする端末の識別子（何が使われるかは不明）を登録した後配布する必要があり**とても現実的ではない。**  
https://www.reddit.com/r/Android/comments/1nwddik/heres_how_androids_new_app_verification_rules/

自分で買ったスマホなんだから自由にさせてくれて良くない？`Google Pixel 10 Pro Fold`、**26万したんだけど**。  
なんで26万払って自分でアプリを入れるかの選択ができないの？  
`Android 12`にアップデートしてから`Android/data`フォルダが見れなくなった件も、今回の件も、返金の準備したほうが良いんじゃないかな Google さん？

`adb install`以外は開発者認証済みの`APK`が必要になり、`adb`以外の回避策はない模様。  
`GooglePlay 開発者サービス`の一つとして実装されると思うので、ユーザーは無効にするとかは出来ない気がする。

開発者サービスを入れない選択は`カスタム ROM`を入れるときに`Google なし`のを焼くとか、`Root`権限でなんとか出来るのかもだけど、どっちにろ`ブートローダー`がアンロックできないのでやっぱり何も出来ない。通信キャリア許せねえよ  
`Shizuku`でなんとかなるもんなんですかね？希望はある

悪意あるアプリの拡散を防ぐと言っているが、通報を受け付ける仕組みなのか、`AI`か何かが検知して勝手にアカウントを`BAN`にするのかは調べたけど分からなかった。

**Chrome**から**apk**をダウンロードする機能を消せば良くない？？？こんな極論に走るよりも

`applicationId`が被った場合はダウンロード数が多いほうがゲット出来る。

あとこれは去年くらいにあった`製品版の制限`のが近いけど、`Android`がこのザマならわざわざ`Compose Multiplatform`とかのマルチプラットフォームなんか使わずに、  
ファーストは諦めて大人しく`iOS`だけ作ってれば良い流れになりませんか？流石にそんなこと無いか。

カード会社の攻撃のせいでえっちなのを取り締まってるみたいに、アプリを全部握ったら思わぬ外部からの攻撃で消されることにもなりそう。  
下手に握ってると`開発者登録があるのに Google はなんで野放しにしてたんだ!!!`とかいちゃもんつけられそうじゃないですか？やっぱやめようよ。

**仮に**`APK`配布のための開発者アカウントも、`PlayConsole`も`BAN`されたら**一生 Android アプリを配信できないってことで合ってる？**  
恩赦は？

開発者アカウントの作成には個人情報を渡す必要がある。一方、それだけで作れる。  
少なくとも`PlayConsole`の方では、携帯電話の契約みたいに**eKYC**みたいに自分の顔を撮影するやつは要求されないので、誰かの個人情報を入手できれば作れちゃいそうなんだけど。  
そしてサイドローディングする開発者向けにわざわざ`eKYC`相当を用意するとも到底思えない。負担すぎるでしょ。  
https://takusan.negitoro.dev/posts/play_console_developer_account_verfy/

アプリストアが泣かず飛ばずだった`Windows`を見たのか、どうしてもアプリストアを手放したくない。が、今日、それを各国は許さない。だからせめてものの負け惜しみだと思ってる。

先述したけど、これが執行されると`Google`は**都合が悪いアプリを権力行使で利用不可に出来る**。それくらいの力がある。インストールするアプリはすべて申請が必要になるので。  
`Google`が強くなりすぎてしまう。  
強くなりすぎてしまった場合、もし仮に、  
代わりのアプリストアが登場した時、アプリの審査はそのアプリストアが担当するべきだが、これに加えて何故か`Google`が**首突っ込んでくることになる**。代替アプリストアなのに`Google`が**許さなければ配信できない。**

---

`Google`の力が強くなりすぎてしまう件は**以前に似たようなことがあります**  
https://commonsware.com/blog/2020/09/23/uncomfortable-questions-app-signing.html

`PlayConsole`へ審査のためにアプリをアップロードする際、`APK`ファイルから`AAB`を要求するようになりました。  
簡単に言うと、`AAB`ファイルが`.zip`ファイルみたいになってて、`Google`側で`zip`から`スマホ向け`、`タブレット向け`や、`C++`があれば`ARM 64bit`、`x86_64`それぞれの`APK`を生成します。`Android`は引き続き`APK`を要求するので、`AAB`から作る必要があります。  
一見すると`スマホ向け`をダウンロードすれば`タブレット向け`のレイアウトが不要になるので通信量を節約できていいじゃん。ってなるんですが、**大きなセキュリティの問題が残っていて**、それは今日でもなお使われています。  
・・・・  
`.zip`から`APK`を作る際、もちろん署名をします。署名をすることで、悪さをする同じアプリに擬態しても（`applicationId`をパクっても）署名が合わないので更新がブロックされるって仕組みです。  
さて、`AAB`から`APK`を作る作業は`Google`側がやると言いました。これに伴い、**`Google`がアプリ毎に署名鍵を作って`Google`が署名をします。次回以降も署名するために`Google`が保管します。**  
・・・  
悪さをする同じアプリに擬態しても更新がブロックされるのは、署名がされているからで、**逆に言えば署名さえも擬態されてしまえば更新が成功します。**  
署名さえも擬態することが可能な人間が、ここまでの文章で登場しているのがわかりますか・・・・・・・・・・  
`Google`ですね。**彼らは更新が成功する署名鍵を持っているため、正規の開発者からもらったアプリのコードを書き換えたとしても、そのまま署名してしまえば、誰にも改ざんがバレずにアプリの配信ができてしまいます。**  
・・・  
もちろん`Google`は自分自身が勝手に**変更したり配布することは無い**と言いました。先述の通り不可能ではなく、やろうと思えば出来るはずなので**無い**。`don't`であって、`can't`とは言っていない。  
https://commonsware.com/blog/2020/09/23/uncomfortable-questions-app-signing.html

今回も施行されてしまえば強い力を持つことになるので、このように`can't`ではなく`don't`の声明が出る。のかは不明です。