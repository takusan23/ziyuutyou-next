---
title: Next.js で出来たこのブログの改修をした
created_at: 2024-05-07
tags:
- 自作ブログ
- Next.js
- TypeScript
---

どうもこんにちわ。  
コイバナ恋愛 ミニファンディスク アフターフェスティバル 攻略しました。  

![Imgur](https://i.imgur.com/0y5h5Es.png)  

FD で FD 言及するのねｗ

かわい～

![Imgur](https://i.imgur.com/Eb8D7S5.png)

![Imgur](https://i.imgur.com/Cp850Ql.png)

おもろい！！！！！！！！  
いちいちおもろいのすごい

![Imgur](https://i.imgur.com/gxq0t6x.png)

![Imgur](https://i.imgur.com/UiRcENu.png)

サブカプも報われててよかったよかった。

![Imgur](https://i.imgur.com/Ybx2yRd.png)

まぶしすぎるので（？）ぜひ  
みじかい！！！

![Imgur](https://i.imgur.com/jg2c1My.png)

# 本題
修正したい点がまた増えてきた、、いい加減直します！  
優先度高め順で

- 静的（意味深）書き出し`GitHub Actions`が遅すぎる
    - `Markdown → HTML`が何回も何回も呼ばれているのが原因ぽい
    - `Markdown → HTML`の変換結果をキャッシュする方法が必要
- 静的サイトでも使える全文検索があるらしいので使ってみたい→`pagefind`
- OGP 画像を作って共有したときにおしゃれにしたい
- シンタックスハイライトを`rehype-pretty-code`にしたい
    - `VSCode`も使ってるやつらしい
- `Google Analytics 4`のみ。`UA`の方を消したい
    - ついでにページ遷移イベントを自前で送るのもやめたい
- コードブロックにコピーボタンほしい
- スマホでも目次
- ダークモード切り替えを`localStorage + useSyncExternalStore`にしたい
- 環境変数じゃなくてベタ書きのが残ってる
- Mastodon / Misskey の認証マーク付けれるように

# やったこと

## シンタックスハイライト
`highlight.js`から`Shiki（を使っている rehype-pretty-code ）`にしました。  
`JSX`と`TypeScript`の色つけが良くなった気がする。やった～～～  

どうやら`VSCode`のシンタックスハイライトがこの`Shiki`みたい？

## 依存関係の更新
`Next.js`とか`Unified`とかの更新もした。  
`rehype-pretty-code`とかは`11`系にしないといけないので

## Google Analytics の UA を消す
https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries#google-analytics

`GA4 / UA`の両方書いてたんですけど、いつからか、なんか重複されてる気がする？記録されるようになったので消しました。  
~~ついでに、`Next.js`側で`Google アナリティクス`の使い方が言及されたので、そっちに乗り換えました。~~  
~~ブラウザの履歴を検知する設定を有効にする必要があります。~~

私の環境では`jsdom`の型がおかしくなってしまったので、`next/third-parties`は使わず、引き続き`<script>`を仕込むことにしました。  

![Imgur](https://i.imgur.com/UuZu2lb.png)

ただ、`hooks（useEffect）`でページ切り替えイベントを送るのはもうやめようと思いました。  
`GA4`に`ブラウザの履歴イベントに基づくページの変更`ってやつがあるので、それにページ遷移イベントを送るのをお任せしようと思います。

![Imgur](https://i.imgur.com/pv6d8X2.png)

今までは`useEffect`で送ってましたが、`GA4`におまかせできるならお任せしようと思う。

## Mastodon / Misskey のチェックマークが付くように rel に me を入れる
自分の`Webページ`（静的サイトでいい）に、自分の`Mastodon / Misskey`の`URL`を`<a>`タグで追加して、  
`href`と共に`rel="me"`を付与します。  
そのあと、`Mastodon / Misskey`の補足情報にサイトの`URL`を入れると、チェックマークがつく機能があります。  

その`rel="me"`を付与できるように修正しました。

これ、`SPA`だと無理で`SSG`とか`SSR`みたいに`HTML`をプリレンダリングした状態でホスティングしないといけないハズなので、ちょっと注意です。  
https://takusan.negitoro.dev/posts/nuxt_universal/

```html
<a class="no-underline text-inherit" rel="me" href="https://diary.negitoro.dev/@takusan_23">
    @takusan_23
</a>
```

## Markdown から HTML の変換が何度も走って遅い
改修したかった一番の理由これ。  
`SSG`する`GitHub Actions`が遅い。`2024`年になってから？`GitHub Actions`のマシンスペックが向上したらしく、ずいぶん早くなりましたが。それでも**15分**くらいかかってる。  

![Imgur](https://i.imgur.com/e2Yf6pg.png)

（ちなみにスペックが上る前は30～40分くらいかかってた。小声。やばい）  

![Imgur](https://i.imgur.com/VucT93a.png)

理由はわかっていて、`Markdown`から`HTML`の変換が何度も何度も走っているから。  
変換したらメモリに乗せておくとか、あると思うんですけど、ファイル更新の際にメモリに乗せた変換結果を破棄するのもめんどいなあ思ってやらなかった。  

でもやります。やっぱ遅いんで。  

### シングルトン案

最初に考えたのはシングルトンにしてパース結果を使い回す案。  
`Next.js`のホットリードに**シングルトンにしたインスタンス**まで巻き込まれて、インスタンスが作り直されてしまうらしい。調べたら`globalThis`とかいうのに入れるといいらしい。  
https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices

これ合ってる？、これでいいのか怪しくなってきた。暫定対応感あるけど。  
ちなみにこの技を使っても、`constructor()`で`console.log`してみると何故か2回出力される。シングルトンってなんだ？

```ts
class ContentFolderManager {

    /** マークダウンパース結果を共用するため、シングルトンにする */
    private static _instance: ContentFolderManager

    /** マークダウンのパース結果 */
    private markdownParseList: Map<string, MarkdownData> = new Map()

    /**
     * ContentFolderManager を返します。
     * マークダウンのパース結果を共用するため、シングルトンになってます。
     * 
     * @returns ContentFolderManager
     */
    static getInstance() {
        // Next.js はシングルトンでインスタンスを共有しようとしても、ホットリードでインスタンスが再生成されるらしい
        if (process.env.NODE_ENV === 'development') {
            globalThis['_ContentFolderManager'] = globalThis['_ContentFolderManager'] ?? new ContentFolderManager()
            return globalThis['_ContentFolderManager'] as ContentFolderManager
        } else {
            ContentFolderManager._instance = ContentFolderManager._instance ?? new ContentFolderManager()
            return ContentFolderManager._instance
        }
    }
}
```

### Next.js のキャッシュ案

これやるなら`Next.js`の`cache()`（どっちかと言うと`unstable_cache`）とかを使うべきな気がしてきた...  
この辺で言及しているやつ。。  

https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#fetching-data-on-the-server-with-third-party-libraries

`unstable_cache`の方だと、`revalidateTag()`を使うことで`unstable_cache`のキャッシュを消すことが出来るみたい。  
`cache()`の方はちょっと消し方見つからなかった。。。

というわけで仕込んでみました！  
まずはキャッシュを保持しておくストアです。キャッシュがあれば返すやつ（なければパースする）と、消すやつ。  
あんまり`Next.js`に依存したコードを増やしたくなかったので今回はインターフェースを切りました。剥がしやすいようにしてみた。

```ts
export class NextJsCacheStore<T> implements CacheStore<T> {

    async getCache(key: string, notExists: (key: string) => Promise<T>): Promise<T> {
        // キャッシュがあればそれ、なければ notExists を呼び出す
        const cacheOrCreate = unstable_cache(
            async () => notExists(key),
            [key],
            { tags: [key] }
        )
        // 待って返す
        const result = await cacheOrCreate()
        return result
    }

    deleteCache(key: string): void {
        revalidateTag(key)
    }

}

interface CacheStore<T> {

    getCache(key: string, notExists: (key: string) => Promise<T>): Promise<T>

    deleteCache(key: string): void
}
```

それを仕込みました。  
`parseMarkdown`でマークダウンをパースする前にキャッシュが存在するか問い合わせて、あれば返す。無いならパースする。  
また、ファイルの変更を監視して、変化があったらキャッシュから消すようにした。これで変更があった際には再度パースする様になっているはず。  
キャッシュのキーはファイルパス。

```ts

/** マークダウンパース結果をキャッシュして使い回す。中身は Next.js の cache() です。 */
private static cacheStore = new NextJsCacheStore<MarkdownData>()

static {
    // マークダウンファイルの変更を追跡して、キャッシュしているマークダウンパース結果を削除する
    // 複数回呼ばれるらしいので、その都度パースするではなく、消すだけ消して必要になったらパースする方向で
    this.watchFolder(ContentFolderManager.POSTS_FOLDER_PATH, (filePath) => {
        console.log(`[change] ${filePath}`)
        this.cacheStore.deleteCache(filePath)
    })
}

/**
 * Markdown をパースして返す。
 * キャッシュがあればキャッシュを返します。
 * 
 * @param filePath ファイルパス
 * @param baseUrl /posts /pages など
 * @returns MarkdownData
 */
private static async parseMarkdown(filePath: string, baseUrl: string) {
    // キャッシュがあるか問い合わせる
    const markdownData = await this.cacheStore.getCache(filePath, (_) => MarkdownParser.parse(filePath, baseUrl))
    return markdownData
}

/**
 * fs.watch を使ったフォルダの監視。複数回呼ばれるらしい。
 * マークダウンに変更があった際に通知されてほしいので。
 * 
 * @param folderPath フォルダパス
 * @param onChange 変更があった際に呼ばれます。引数はファイルパス。
 */
private static watchFolder(
    folderPath: string,
    onChange: (filePath: string) => void
) {
    (async () => {
        const pagesWatcher = fs.watch(folderPath)
        for await (const result of pagesWatcher) {
            if (result.eventType === 'change' && result.filename) {
                onChange(path.join(folderPath, result.filename))
            }
        }
    })()
}
```

これでページの表示も早くなる（マークダウンを毎回パースする手間が減る）、かつ、マークダウンに変更があったら再度パーサーにかかるようにキャッシュを消すようにしています。  
これで勝った！！！と思ってたんですが。

```plaintext
 ⨯ unhandledRejection: StaticGenBailoutError: Route /posts/android_video_editor_akari_droid/ with `dynamic = "error"` couldn't be rendered statically because it used `revalidateTag C:\Users\takusan23\Desktop\Dev\NextJS\ziyuutyou-next\content\posts\ziyuutyou_update_2024.md`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering
    at trackDynamicDataAccessed (webpack-internal:///(rsc)/./node_modules/next/dist/server/app-render/dynamic-rendering.js:106:15)
    at revalidate (webpack-internal:///(rsc)/./node_modules/next/dist/server/web/spec-extension/revalidate.js:51:52)
    at revalidateTag (webpack-internal:///(rsc)/./node_modules/next/dist/server/web/spec-extension/revalidate.js:26:12)
    at NextJsCacheStore.deleteCache (webpack-internal:///(rsc)/./src/NextJsCacheStore.ts:25:66)
    at eval (webpack-internal:///(rsc)/./src/ContentFolderManager.ts:45:29)
    at eval (webpack-internal:///(rsc)/./src/ContentFolderManager.ts:196:21) {
  code: 'NEXT_STATIC_GEN_BAILOUT'
```

`Next.js`を静的書き出しモードで使っている場合は、たとえ開発モードでも`revalidateTag`が呼べない。  
もちろん静的書き出しではバックエンド側の機能（ブラウザではなく`Node.js`が必要な機能）は使えないので、`revalidateTag`が使えないというのは分かるんですが、ちょっと期待していたので残念。  
静的書き出し時に使えない機能はこちらです：https://nextjs.org/docs/app/building-your-application/deploying/static-exports#unsupported-features

### Next.js のキャッシュ案2
よく見たら`next.config.js`、これ**開発中・静的書き出し中**それぞれ別に設定を変更できるらしい。  
https://nextjs.org/docs/app/api-reference/next-config-js

これで、開発中は`output: 'export'`を消すようにすればいいのでは・・・？  
というわけで試してみた、**動いてます！！！**

```ts
const { PHASE_DEVELOPMENT_SERVER } = require('next/dist/shared/lib/constants')

module.exports = async (phase, { defaultConfig }) => {

    /** @type {import('next').NextConfig} */
    const nextConfig = {
        output: 'export',
        trailingSlash: true,
        webpack(config) {
            // SVG をコンポーネントにできる
            config.module.rules.push({
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            })
            return config
        },
        experimental: {
            scrollRestoration: true,
        }
    }

    // このサイトは静的書き出しを使っていますが、静的書き出しモードでは使えない機能を開発中のみ使いたいため、
    // 開発時のみ静的書き出しモードを OFF にする。（ Next.js の revalidateTag ）
    // 開発時のみ OFF になるが、本番環境は静的書き出しを使うため、静的書き出しで使える機能のみを使う必要があります。
    // https://nextjs.org/docs/app/building-your-application/deploying/static-exports#supported-features
    if (phase === PHASE_DEVELOPMENT_SERVER) {
        nextConfig.output = undefined
    }

    return nextConfig
}
```

パース結果を使い回すようにしたため、超速くなりました。  
開発中も静的書き出し時も超高速です（**てか今までが毎回パースしてたからくっっっそ遅かった**）  
あと、**これもシングルトンのときと同じく**`watchFolder`が何度も呼ばれてしまうため、やっぱり`globalThis`しないとだめかも。。。。

### Next.js のキャッシュ案3
`watchFolder`が何回も呼ばれちゃうので、`globalThis`等で制御する必要があり、気持ち悪いというかそれならシングルトンで良かった。  
あとは`revalidateTag`のためだけに`next.config.js`いじって開発時のみ`SSR`とかやりたくないので。。。  

のと、`unstable_cache`はどうやら（開発時だけかも）**ブラウザのスーパーリロード**でキャッシュが消えることが判明したので、  
もう無理にキャッシュを消すために`revalidateTag`なんかしないで、手元でスーパーリロードすればいいじゃん。ってなった。  

**このキャッシュやっかいなことに、これ開発サーバーを再起動してもキャッシュ（unstable_cache の結果）は残り続けるらしく、知らないとガチ沼にはまりそう。**  
というかキャッシュがスーパーリロードで消えるとかどこに書いてある？、、書いてないけどこれまぐれで動いてるんか？

```ts
export class NextJsCacheStore<T> implements CacheStore<T> {

    async getCache(key: string, notExists: (key: string) => Promise<T>): Promise<T> {
        // キャッシュがあればそれ、なければ notExists を呼び出す
        const cacheOrCreate = unstable_cache(
            async () => notExists(key),
            [key],
            { tags: [key] }
        )
        // 待って返す
        const result = await cacheOrCreate()
        return result
    }

    deleteCache(key: string): void {
        // 未実装
        // ブラウザのスーパーリロードをすれば消せます。
    }

}
```

### まとめ

- シングルトン案
    - `globalThis`とかいうオブジェクトに入れることで、開発時でもインスタンスを一つにできる
        - 正解なのかは不明
    - でも試した限りなんか`constructor()`が2回呼ばれている（2ついる？）
- `unstable_cache` 案
    - マークダウンが変化したら`revalidateTag`を呼び出してキャッシュを消したいところだが、静的書き出しモードでは利用できない
- `unstable_cache` + `開発時のみ サーバーサイドレンダリング` 案
    - 開発時のみ SSR にしているのが引っかかる
    - ファイル監視用の関数がホットリードのたびに呼ばれるので、シングルトン同様制御が必要
- `unstable_cache`で変更したら自分でスーパーリロードする案
    - 普通のリロードだとキャッシュが返ってくる
    - でも開発時だけ`SSR`と比べると一番マシな気がする、、、

どれがベスト？今のところ一番最後かなあ、、、  
でもマークダウンのパースする部分に`Next.js`依存を持ち込むかと言われるとシングルトンが最有力になる。まあいいや。

あと調べると、マークダウンパース結果をメモリ（シングルトンで配列を持つ）ではなく、ストレージに書き込む案もありましたが、  
`Next.js`のキャッシュがまさにそれな気がする。自前で書くか`Next.js`にお任せするか。  

## テーマ設定を localStorage に、あと useSyncExternalStore
テーマ設定を`localStorage`で持つようにしました。  
2回目開いた時にテーマ設定が引き継がれます。

また、`localStorage`書き込みイベントを投げて、`useSyncExternalStore`を使い、`React`側でも購読できるようにしました。  
https://ja.react.dev/reference/react/useSyncExternalStore

`useSyncExternalStore + dispatchEvent`を使って`localStorage`の変更を通知できるようにすると、  
地味に複数タブを開いたときもテーマ設定が反映されるのでちょっと感動。

```ts
import { useSyncExternalStore } from "react"
import { ThemeTool, Theme } from "../../src/ThemeTool"

const subscribe = (onStoreChange: () => void) => {
    window.addEventListener('storage', onStoreChange)
    return () => {
        window.removeEventListener('storage', onStoreChange)
    }
}
const getSnapshot = () => ThemeTool.readTheme()
const getServerSnapshot = () => 'light'

/**
 * テーマ用カスタムフック。
 * 現在のテーマ設定と、テーマ変更の関数を返します。
 */
export default function useTheme() {
    // useSyncExternalStore で localStorage と React のステートをつなげる
    const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

    // 設定変更用関数
    function setTheme(theme: Theme) {
        ThemeTool.saveTheme(theme)
        // subscribe で通知が行くように
        window.dispatchEvent(new Event('storage'))
    }

    return { theme, setTheme }
}
```

そういえば、端末がダークモード設定でも初回時はライトテーマになる問題、`<head>`に`JavaScript`を差し込めば良さそうだけど、  
`Next.js`だと出来なさそう・・・？  

FOUC 対策に`<head>`に書いてねって書いてある。。。  
https://tailwindcss.com/docs/dark-mode

## スマホ用目次を Tailwind CSS で作る
とりあえず記事の一番上に。目次を開くコンポーネントを置きました。  
なんと`JavaScript`無しで再現できます。`GitHub`の`Markdown`とかでも使えるハズ。

```html
<details>
    <summary>
        目次
    </summary>
    <p><a href="#1">1</a></p>
    <p><a href="#2">2</a></p>
    <p><a href="#3">3</a></p>
</details>
```

↓こんなの

![Imgur](https://i.imgur.com/7iIQbfA.png)

次に、`Tailwind CSS`で見た目を調整したい（展開ボタンとか付けたい）  
というわけでこちら→ https://tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-parent-state

どうやら、親要素の状態（例えばこの場合は展開した時に`<details>`に`open`属性がつく）に応じて CSS を付ける方法があります。  
`group`を使う方法です。

```jsx
{/* group つける */}
<details className="group select-none">
    <summary className="list-none">
        {/* 開いてるときと閉じてる時を作っておく、CSS で切り替える。group-open で group 付けた要素の状態参照ができる */}
        <p className="flex group-open:hidden">ここを押すと開く</p>
        <p className="hidden group-open:flex">もう一回ここを押すと閉じる</p>
    </summary>
    <p><a href="#1">1</a></p>
    <p><a href="#2">2</a></p>
    <p><a href="#3">3</a></p>
</details>
```

![Imgur](https://i.imgur.com/GOwqEYz.png)

展開アイコンも出したい？  
これでどうだろう？

```jsx
{/* group つける */}
<details className="group select-none">
    <summary className="list-none">
        {/* group-open で group 付けた要素の状態参照ができる */}
        <div className="flex flex-row">
            <p className="grow">もくじ</p>
            {/* アイコンは https://fonts.google.com/icons から */}
            <div className="rotate-180 group-open:rotate-0">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                    <path d="m296-345-56-56 240-240 240 240-56 56-184-184-184 184Z" />
                </svg>
            </div>
        </div>
    </summary>
    <p><a href="#1">1</a></p>
    <p><a href="#2">2</a></p>
    <p><a href="#3">3</a></p>
</details>
```

どうだろう！？！？。  
`React Server Component`だと`JavaScript`をギリギリまで使いたくないと思うから便利だと思う！！！  

![Imgur](https://i.imgur.com/9K9hgjv.png)

![Imgur](https://i.imgur.com/NtjoJEQ.png)

## コードブロックにコピーボタンを置いた
こんな感じに、コードブロックをマウスオーバーするとコピーボタンが出てくるようになりました。  
欲しかったけど`unified`のプラグインとか絶対難しそうで、`useEffect`で動的に差し込むか～どうするかな～思ってたところで。

![Imgur](https://i.imgur.com/Ln1YtQ5.png)

仕組みとしては、`Markdown`にあるコードを色付けする`rehype-pretty-code`は、`shiki`で色付けしているわけですが、  
これ任意のコードを差し込む`API`が用意されているんですね。`Transformers`ってやつ。

https://shiki.matsu.io/guide/transformers

というか今回はこれをほぼパクっただけです。  
https://github.com/rehype-pretty/rehype-pretty-code/blob/master/packages/transformers/examples/copy-button.ts

```ts
const remarkParser = await unified()
    .use(rehypePrettyCode, {
        theme: "dark-plus",
        transformers: [
            // コピーボタンを差し込む
            transformShikiCodeBlockCopyButton()
        ]
    })
    .process(matterResult.content)
```

`transformShikiCodeBlockCopyButton.ts`がこちらです。  
ボタン要素を作って、押した時にクリップボードにコピーされるようにします。  
`pre(node) { }`が`<pre>`要素に対して`DOM 操作`が出来るやつです。今回は`<pre>`に`<button>`を差し込んでいるので。`<code>`要素をいじる`code(node) { }`とかもあります。  

ここでも`Tailwind CSS`の`group`が大活躍です。親のコードブロックがマウスオーバーしたら、ボタンが表示されるよう、親には`group`、ボタンには`hidden group-hover:flex`？を付けています。`JavaScript`なしでここまで出来るんだ。

```ts

/** コピーボタンにつける Tailwind CSS のユーティリティ名 */
const className = 'hidden group-hover:flex p-2 m-2 absolute top-0 right-0 cursor-pointer rounded-md bg-background-dark border-2 border-content-primary-dark text-content-primary-dark fill-content-primary-dark'

export default function transformShikiCodeBlockCopyButton(): ShikiTransformer {
    return {
        name: 'transformShikiCodeBlockCopyButton',

        // 生成後の <pre> 要素を編集する
        pre(node) {

            // コピーボタンを追加するためにまず親を position: relative する
            // src の中ですが、このファイルだけ特別にユーティリティ名走査対象にしているので Tailwind CSS が使えます。
            node.properties.class = 'relative group'

            // コピーボタンを差し込む
            node.children.push({
                type: 'element',
                tagName: 'button',
                properties: {
                    data: this.source,
                    onclick: /* javascript */ `navigator.clipboard.writeText(this.attributes.data.value)`,
                    class: className,
                },
                children: [
                    {
                        type: 'element',
                        tagName: 'svg',
                        properties: {
                            xmlns: 'http://www.w3.org/2000/svg',
                            height: '24',
                            viewBox: '0 -960 960 960',
                            width: '24'
                        },
                        children: [
                            {
                                type: 'element',
                                tagName: 'path',
                                properties: {
                                    // アイコンは https://fonts.google.com/icons より
                                    d: 'M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h167q11-35 43-57.5t70-22.5q40 0 71.5 22.5T594-840h166q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560h-80v120H280v-120h-80v560Zm280-560q17 0 28.5-11.5T520-800q0-17-11.5-28.5T480-840q-17 0-28.5 11.5T440-800q0 17 11.5 28.5T480-760Z'
                                },
                                children: []
                            }
                        ]
                    }
                ],
            })
        }
    }
}
```

あ、もし私みたいに`Tailwind CSS`を使う場合、`tailwind.config.js`で、`transformShikiCodeBlockCopyButton.ts`もユーティリティ名走査対象に追加する必要があります。  
もしくは`./app`とかの`jsx`があるフォルダ内に書いた場合はいらないです。私は`./src`の中に書いたので走査対象じゃない。

```js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // コピーボタンを差し込むので
    "./src/transformShikiCodeBlockCopyButton.ts"
  ],
  // 以下省略
}
```

## 作ったアプリコンポーネントを作り直した
メニューを押して見ないと何があるか分からないので、選択中以外の項目も下に表示するようにしてみた。  
マルチカラムです。

![Imgur](https://i.imgur.com/V0PBTj0.png)

## OGP 画像
リンクを共有したときに表示される、あの画像。  
`OGP画像`とか`OpenGraph Image`とか言われてる？  

`Next.js`では`html（JSX）`を組み立てる感覚で画像を作ることが出来ます。すごい時代ですね。  
https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image#generate-images-using-code-js-ts-tsx

というわけで使いたいのですが、静的書き出しモードで動かすにはひと手間必要みたい。  
といっても`Route Handlers`として`OpenGraph Image`を生成するといいらしい。  
https://github.com/vercel/next.js/issues/51147

### Route Handlers 機能
これは`page.tsx`なら`html`をレスポンスとして返しますが、  
スマホ向けに`json`とか`RSS`用に`xml`とか、`html`以外をレスポンスで返したいときが多々あると思います。  
このような場合は、この`Route Handlers`機能を使うことで、`html`以外を生成してレスポンスとして返してあげることが出来ます。  

`page.tsx`が静的書き出し出来るのと同じ用に、この`Route Handlers`機能もレスポンスを静的書き出し時に生成することが出来ます。  
ただ、生成するためには条件があり、`GET`リクエストののみ + リクエストのたびに同じデータを返すような`Route Handlers`でなければいけません。  

静的サイトなので、同じデータを配信することしか出来ない。逆に言えばこれさえ守れば`xml`とか`json`とかも静的書き出し時に生成できるので面白いことが出来そう（今回の`OGP 画像`がこれ）  
何言ってるかよくわからない場合は公式見て：  
https://nextjs.org/docs/app/building-your-application/deploying/static-exports#route-handlers

`app/posts/[blog]/example.json/route.ts`  
```ts
import ContentFolderManager from "../../../../src/ContentFolderManager"

/** 動的ルーティング */
type PageProps = {
    params: { blog: string }
}

/**
 * ルートハンドラー
 * 静的書き出し時に生成するため、request 引数は使ってはいけない
 */
export async function GET(_: Request, { params }: PageProps) {
    return Response.json({ dynamic_routing: params.blog })
}

// app/posts/[blog]/page.tsx の generateStaticParams と同じ
export async function generateStaticParams() {
    // 記事一覧
    const fileNameList = await ContentFolderManager.getBlogNameList()
    // この場合はキーが blog になるけどこれはファイル名によって変わる（[page].tsxなら page がキーになる）
    return fileNameList.map((name) => ({ blog: name }))
}
```

レスポンスはこんな感じになります

```json
{"dynamic_routing":"ziyuutyou_update_2024"}
```

### Route Handlers で OGP 画像を生成する
`app/posts/[blog]/opengraph-image.png/route.tsx`を作ります。  
そして雑ですがこんな感じにしてみると。。。

```tsx
import { ImageResponse } from "next/og"

/** 動的ルーティング */
type PageProps = {
    params: { blog: string }
}

/**
 * OGP 画像を生成するルートハンドラー
 * OGP 画像を静的書き出し時に生成するため、request 引数は使ってはいけない。
 */
export async function GET(_: Request, { params }: PageProps) {
    return new ImageResponse(
        (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding:10
                }}
            >
                <h1 style={{ fontSize: 60 }}>
                    ここにタイトルを入れる
                </h1>
                <p style={{ fontSize: 30 }}>
                    2024-05-02
                </p>
                <p style={{ fontSize: 30 }}>
                    @takusan_23
                </p>
            </div>
        ),
        {
            width: 1200,
            height: 630
        }
    )
}

/** 動的ルーティング */
export async function generateStaticParams() {
    // 各自よしなに実装してください。page.tsx の動的ルーティングと同じです。
    // return [{ blog: 'first' }]
}
```

こんな感じの`OGP 画像`が出来ます。  
結構良さそう。すげ～～～

![Imgur](https://i.imgur.com/g5b47jQ.png)

使える`CSS`とかはこの辺が多分そう。  
`flex`で作っていけば良さそう。長い文字入れても乱れないかは確認しておいたほうが良さそう。  
https://github.com/vercel/satori

というわけで作ってみました。  
![Imgur](https://i.imgur.com/W9iXALZ.png)

ちゃんと静的書き出し時に記事毎に生成されてますね！  
これで共有したときイケてるサイトみたいに画像が出ます！

![Imgur](https://i.imgur.com/vIYkieZ.png)

#### metadata に入れる
正規ルート？ではなく`Route Handlers`で作ったので自動では`<head>`に`og:image`を追加してくれません。  
自分で`URL`を指定して追加する必要があります。  

```ts
/** head に値を入れる */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const markdownData = await ContentFolderManager.getBlogItem(params.blog)
    const ogpTitle = `${markdownData.title} - ${EnvironmentTool.SITE_NAME}`
    const ogpUrl = `${EnvironmentTool.BASE_URL}${markdownData.link}`

    return {
        title: ogpTitle,
        alternates: {
            canonical: ogpUrl
        },
        openGraph: {
            title: ogpTitle,
            url: ogpUrl,
            // OGP 画像は opengraph-image.png/route.tsx 参照
            images: `${ogpUrl}opengraph-image.png` // ←これ
        }
    }
}
```

![Imgur](https://i.imgur.com/QFQsx7t.png)

#### メモ
画像は`base64`にしたあと`<img>`に入れるとデータの取り出し？操作の回数が減るからおすすめとのこと。  
https://github.com/vercel/satori?tab=readme-ov-file#images

フォントも`Buffer`（バイナリ）のまま渡せば使える。  
https://github.com/vercel/satori?tab=readme-ov-file#fonts

#### せっかくなのでコード貼ります
ファイルを読み出すユーティリティクラスを作ってみたけどわざわざ作るまででもないと言われれればそう。  

```ts
class FileReadTool {

    /** <img> の src へ base64 のデータを渡す際に先頭に入れておく文字列。png 版。 */
    static BASE64_PREFIX_PNG = 'data:image/png;base64,'

    /** {@link BASE64_PREFIX_PNG}の svg 版。 */
    static BASE64_PREFIX_SVG = 'data:image/svg+xml;,'

    /**
     * 引数に渡したファイルパスのデータを base64 形式で読み出して返す
     * 
     * @param filePathSegments ファイルパス。/app/icon.png なら可変長引数に 'app', 'icon.png' を渡す。
     * @returns base64 のデータ
     */
    static async readBase64(...filePathSegments: string[]) {
        return await fs.readFile(path.join(process.cwd(), ...filePathSegments), { encoding: 'base64' })
    }

    /**
     * テキストファイルを読み出す。
     * 
     * @param filePathSegments ファイルパス。/public/icon/menu.svg なら可変長引数に 'public', 'icon', 'menu.svg' を渡す。
     */
    static async readTextFile(...filePathSegments: string[]) {
        return await fs.readFile(path.join(process.cwd(), ...filePathSegments), { encoding: 'utf-8' })
    }

    /**
     * 引数に渡したファイルパスを読み出して Buffer で返す
     * 
     * @param filePathSegments ファイルパス。/styles/css/fonts/font.ttf なら可変長引数に 'styles', 'css', 'fonts', 'font.ttf' を渡す。
     */
    static async readByteArray(...filePathSegments: string[]) {
        return await fs.readFile(path.join(process.cwd(), ...filePathSegments))
    }
}
```

```tsx
// /app/posts/[blog]/opengraph-image.png/route.tsx
// TODO PageProps の定義
// TODO generateStaticParams の実装

export async function GET(_: Request, { params }: PageProps) {
    // 記事を取得
    const markdownData = await ContentFolderManager.getBlogItem(params.blog)

    // Tailwind CSS の色を取得
    const colors = resolveConfig(tailwindConfig).theme?.colors
    const backgroundColor = colors['background']['light']
    const containerColor = colors['container']['primary']['light']
    const contentColor = colors['content']['primary']['light']

    // 表示するアイコン。base64 とかで直接渡すのがいいらしい（相対 URL 無理だった）
    const [iconBase64, homeIconBase64, blogIconBase64, tagIconBase64] = await Promise.all([
        // アバター画像。/app/icon.png
        FileReadTool.readBase64('app', 'icon.png'),
        // ナビゲーションドロワーのアイコン
        FileReadTool.readTextFile('public', 'icon', 'home.svg'),
        FileReadTool.readTextFile('public', 'icon', 'book.svg'),
        FileReadTool.readTextFile('public', 'icon', 'sell.svg')
    ])

    // フォントファイル
    // styles/css/fonts にある ttf を見に行く
    const fontFileBuffer = await FileReadTool.readByteArray('styles', 'css', 'fonts', 'Koruri-Regular-sub.ttf')

    return new ImageResponse(
        (
            // 背景
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    position: 'relative',
                    display: 'flex',
                    backgroundColor: backgroundColor,
                    fontFamily: 'KoruriFont'
                }}
            >

                {/* flex 横並び。 */}
                {/* パーセントで仕切るんじゃなくて、flex-grow 使うべきな気がするけど、width 明示的に指定しないとテキストの折り返し出来ない気がして、、 */}
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        position: 'absolute',
                        display: 'flex',
                        flexDirection: 'row'
                    }}
                >

                    {/* アイコン並んでる部分 */}
                    <div
                        style={{
                            width: '10%',
                            display: 'flex',
                            flexDirection: 'column',
                            marginTop: 20,
                            alignItems: 'center'
                        }}
                    >
                        {/* アバター画像 */}
                        <img
                            style={{ borderRadius: 50 }}
                            width={70}
                            height={70}
                            src={`${FileReadTool.BASE64_PREFIX_PNG}${iconBase64}`}
                        />

                        {/* ナビゲーションドロワーのアイコン並んでる部分 */}
                        {
                            [homeIconBase64, blogIconBase64, tagIconBase64].map((svg) => (
                                <img
                                    style={{ marginTop: 40 }}
                                    width={50}
                                    height={50}
                                    src={`${FileReadTool.BASE64_PREFIX_SVG}${svg}`}
                                />
                            ))
                        }
                    </div>

                    {/* flex 縦並び */}
                    <div
                        style={{
                            width: '90%',
                            display: 'flex',
                            flexDirection: 'column',
                            paddingRight: 30
                        }}
                    >

                        {/* タイトルバーの部分 */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <h1
                                style={{
                                    flexGrow: 1,
                                    fontSize: 40,
                                    color: contentColor
                                }}
                            >
                                {EnvironmentTool.SITE_NAME}
                            </h1>
                        </div>

                        {/* 記事のタイトルと投稿日時の部分 */}
                        <div
                            style={{
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                padding: 20,
                                backgroundColor: containerColor,
                                borderTopLeftRadius: 40,
                                borderTopRightRadius: 40
                            }}
                        >

                            <h1
                                style={{
                                    fontSize: 70,
                                    color: contentColor,
                                    flexGrow: 1,
                                    wordBreak: 'break-all'
                                }}
                            >
                                {markdownData.title}
                            </h1>

                            <p
                                style={{
                                    fontSize: 40,
                                    color: contentColor,
                                    alignSelf: 'flex-end'
                                }}
                            >
                                {markdownData.createdAt}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'KoruriFont',
                    data: fontFileBuffer
                }
            ]
        }
    )
}
```

## 静的サイトで検索機能
この手の検索機能、`全文検索`とかいう名前がついているらしい。

静的サイト書き出しという性質上、よくあるブログ記事検索みたいなのはかなりめんどくさいんですよね。  
静的書き出し時にサーバーに配置する（ユーザーに配信する）`html とか`を生成するので、検索ワードに応じた検索結果の`html`を作ることが出来ないんですよね、、  
（それこそ`サーバーサイドレンダリング`するサーバーが必要）

というわけで、静的書き出し時でも検索機能を付けたい場合、思いつくのが、  
検索用に`全部の記事を一つにした.json`を作って、検索をしたときに`json`ファイルをリクエストして、クライアント側で検索ワードを元にフィルタリングしていく。  

```json
[
    {
        title: "記事のタイトル",
        content: "どうもこんにちは、今回は～"
    }
]
```

```ts
// 擬似コード
// 全部の記事を JSON で静的書き出し時に作っておいて、検索実行時に取得する
const allBlogJson = await fetch('search.json').then(res => res.json())

// 検索ワードが含まれているか
const keyword = keywordInput.value
const searchResult = allBlogJson.filter(blog => blog.content.match(keyword))

// 表示する
searchResult.forEach(containsBlog => {
    // todo
})
```

ただ、全部の記事を一つの`JSON`にして配信すると、多分とんでもない通信量になってしまう。。。  
全部詰め込んだ`JSON`（`1MB`超え）配信するのは、、、その辺の小さくした画像よりもずっと大きい`JSON`できついわ。

というわけで静的書き出しサイトだと検索機能付けるのは厳しそうに見えたのですが、`pagefind`を見つけた。  
https://pagefind.app/

転送量を抑えながら全文検索ができる模様。静的サイト向けの全文検索機能みたい！！  
Next.js 向けの記事もあった  
https://www.petemillspaugh.com/nextjs-search-with-pagefind

### pagefind 導入
https://pagefind.app/docs/running-pagefind/

`pagefind`をいれて、  

```shell
npm i -D pagefind
```

静的書き出し後に、`pagefind`の処理を追加します。  
`out`は静的書き出しフォルダです。`dist`とかの場合もある？  

```json
"deploy": "npm run build && pagefind --site out"
```

### pagefind 検索 UI
https://pagefind.app/docs/api/

`pagefind`の標準検索`UI`もありますが、`Next.js`のルーティングで動くか怪しいので、今回は1から作ります。  
（`next/link`の画面遷移でも`DOMContentLoaded`呼ばれる？）

というわけでまず検索するための`JavaScript`をインポートしたいのですが、  
どうやら、`npx pagefind`した後に生成される`pagefind.js`をロードする必要があるそう。。  
何が難しいか言うと、静的書き出し時まで`pagefind.js`が存在しないんですよね。開発時は無い。  

というわけで先駆け者さんのをまるまるパクった。  
`window`オブジェクト（`static`にあたるやつ）に`pagefind`を差し込む。ページ表示時に。  
ついでに、開発時にも適当な値が帰ってきてほしいので、開発中のみ`pagefindInDevMock`に向けるようにしました。  

`pagefind.search()`で検索が出来ます。  
各検索結果は`async data()`関数を呼び出すことでタイトルとか本文とかが取り出せます。  
今回は`Promise.all`で10件取り出してロードした状態で`JSX`に渡してますが、ロード前の状態で`JSX`に渡して、`useEffect()`で表示されたらロードみたいなことも出来ると思います。

タイトルは`meta['title']`で取れるらしいです。`html`の中から`<h1>`を探してきてそれをタイトルとして使うみたいなので、複数`<h1>`がある場合は注意ですね。  

動くかまでは見てないけどこんな感じ。開発中はハードコートした値が帰ってきます。  
あと`pagefind`、型がないから自前で適当に作って`as`でキャストしてるけど正攻法なのかな、これ。

```tsx
/** await pagefind.search の返り値 */
type PagefindSearchResults = {
    results: PagefindSearchResult[]
}

/** 各検索結果エントリ。data() を await することで詳細を取得する。 */
type PagefindSearchResult = {
    id: string,
    data: () => Promise<PagefindSearchFragment>
}

/** PagefindSearchResult.data() の返り値 */
type PagefindSearchFragment = {
    url: string,
    content: string,
    meta: Record<string, string>
}

/** 開発時は適当な値を返す pagefind。UI の調整用。 */
function pagefindInDevMock() {
    // 適当にダミーを作って返す
    const results: PagefindSearchResult[] = (new Array(5)).fill(0).map((_, index) => ({
        id: 'example',
        data: () => new Promise((resolve) => resolve({
            url: `/posts/page/${index + 1}/`,
            content: 'process.env.NODE_ENV === development',
            meta: { 'title': `Page ${index + 1}` }
        }))
    }))
    const result: PagefindSearchResults = {
        results: results
    }
    return { search: () => new Promise<PagefindSearchResults>((resolve) => resolve(result)) }
}

export default function PagefindSearch() {
    // キーワード
    const [searchWord, setSearchWord] = useState('')
    // 検索結果
    const [searchResult, setSearchResult] = useState<PagefindSearchFragment[]>([])

    // pagefind を読み込む
    // window.pagefind が使えるように 
    // なんでこんな回りくどい方法を取っているかというと、pagefind は静的書き出し後に生成する JavaScript をロードする必要があり、開発時は使えない。
    useEffect(() => {
        (async () => {
            if (!window["pagefind"]) {
                try {
                    window["pagefind"] = await import(
                        // @ts-expect-error pagefind.js generated after build
                        /* webpackIgnore: true */ "/pagefind/pagefind.js"
                    )
                } catch (e) {
                    // 開発時は適当にハードコートされた値を返す。本番は await import するはずなので問題ないはず
                    if (process.env.NODE_ENV === 'development') {
                        window["pagefind"] = pagefindInDevMock()
                    }
                }
            }
        })();
    }, [])

    // 検索する
    async function search(keyword: string) {
        if (window["pagefind"]) {
            // 検索する
            const pagefindResult = await window["pagefind"].search(keyword) as PagefindSearchResults
            // 10件取り出してロードする
            const searchResultFragmentList = await Promise.all(pagefindResult.results.slice(0, 10).map((r) => r.data()))
            // 文字制限したい
            const formatTextResultFragmentList = searchResultFragmentList.map((fragment) => ({ ...fragment, content: fragment.content.substring(0, 100) }))
            // UI に反映
            setSearchResult(formatTextResultFragmentList)
        }
    }

    // 検索結果を JSX で組み立てる
    return (
        <div className="flex flex-col">

            <input
                value={searchWord}
                onChange={(ev) => setSearchWord(ev.target.value)} />
        
            <button onClick={() => search(searchWord)}>
                検索
            </button>

            {
                searchResult.map((result) => (
                    <Link href={result.url} key={result.url}>
                        {fragment.meta['title']}
                    </Link>
                ))
            }
        </div>
    )
}
```

### pagefind インデックス対象の調整
https://pagefind.app/docs/indexing/

おそらくそのままでは、本文以外の、投稿日時とかタグとかも検索結果に出てきてしまいます。  
検索結果には本文だけでてきてほしいと思います。というわけで`Markdown`を`html`にして表示している箇所に`data-pagefind-body`をつけました。  

```tsx
<div
    data-pagefind-body
    className="content_div"
    dangerouslySetInnerHTML={{ __html: markdownData.html }} />
```

一点、注意点があり、`data-pagefind-body`を付けると、ついていない画面は検索結果の対象にはなりません。  
`data-pagefind-body`を一回でも使った場合、検索結果に出てきて欲しいすべてのページで同様に付ける必要があります。  
今回は記事本文だけ検索結果に表示されればいいので、`data-pagefind-body`をブログ記事本文`page.tsx`に付けて終わりです。

### 組み込んだソースコード
`pagefind`検索コンポーネント。クライアント（`Node.js`ではなくブラウザ側の`JavaScript`）で動きます。  
https://github.com/takusan23/ziyuutyou-next/blob/main/app/search/PagefindSearch.tsx

### 実際に動かしてみた結果
英語だけかと思ったら日本語も結構出てきて感動した。すごい。なんだこれ？？？

![Imgur](https://i.imgur.com/jkxYCqc.png)

![Imgur](https://i.imgur.com/cReO6IB.png)

![Imgur](https://i.imgur.com/Yl5BGJP.png)

## 文字数カウントからコードブロックの分を消す
はい。

```ts
const REGEX_MARKDOWN_CODE_BLOCK = /```([\S])([\s\S\n]*?)```/g

// マークダウン読み出す
const rawMarkdownText = await fs.readFile(filePath, { encoding: 'utf-8' })
// 文字数カウント。
// 正規表現でコードブロックを取り出して、その分の文字数を消す
const markdownCodeBlockAllExtract = Array.from(rawMarkdownText.matchAll(this.REGEX_MARKDOWN_CODE_BLOCK), (m) => m[0])
const markdownCodeBlockLength = markdownCodeBlockAllExtract.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0)
const textCount = rawMarkdownText.length - markdownCodeBlockLength
```

# 本番（意味深）に入れる
一応人がいなさそうな深夜とかに本番環境へ入れようと思います。。。  
（そもそも見てる人おらんやろ）

今回も`PR`を作りました。  
https://github.com/takusan23/ziyuutyou-next/pull/3

![Imgur](https://i.imgur.com/4FfS2bF.png)

`Markdown`のパース回数が減ったので、かかる時間もかなり短くなった（てか本当に今まで長すぎた）  
`Windows Update`すら環境に配慮する時代やぞ

![Imgur](https://i.imgur.com/Mbv0wVS.png)

本番（意味深）の`Amazon CloudFront`から見ていますがちゃんと反映されました。  
2024/05/05 の午前3時くらいのことです。おはよう！朝4時に何してるんだい？

![Imgur](https://i.imgur.com/s7uBB5L.png)

↑検索ボタンが出ていますねっ

# 終わりに
`JavaScript`でクラスってあんまり使わないらしい？のであんまり気にならないのかもしれないけど、  
`this`を付けないといけないの、明らかに冗長だと思う。

```js
class ContentFolderManager {

    static POSTS_FOLDER_PATH = path.join(process.cwd(), `content`, `posts`)
    static POSTS_BASE_URL = `/posts`

    static async getBlogItem(fileName: string) {
        const filePath = path.join(this.POSTS_FOLDER_PATH, `${fileName}.md`)
        return this.parseMarkdown(filePath, this.POSTS_BASE_URL)
    }

    private static async parseMarkdown(filePath: string, baseUrl: string) {
        // todo
    }
}
```

！！！！  
`JavaScript`のクラスで思い出したんですけど、`JavaScript`のクラスのコンストラクタって`return`で値返せるらしいんですよね。。  
（コンストラクタで`return`したいことあるんかな？）  
（てか`new`したクラスとは関係ない値が返せるってこと？？）

https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/new#構文

https://effectivetypescript.com/2024/04/16/inferring-a-type-predicate/

# 終わりに2
`JSX`の中で`IIFE（即時実行関数式）`を使うのってアリなのかな。  
`Jetpack Compose`と違って`JSX`内では`if`が使えない（正確には`JS`の`if`は文なので、値を返せない。三項演算子を使う）。

早期 return したいときに`IIFE`を使ったけどどうなの？あり？  
この程度なら`let component: ReactNode`で`JSX`外で条件分岐すれば良い気もしてきた。。。`let`が嫌ならこれ？

```tsx
<div className="flex flex-col items-center w-full space-y-6">
    {(() => {

        // ロード中
        if (isLoading) {
            return <CircleLoading />
        }

        // まだ検索してない
        if (!searchResult) {
            return searchLogoElement
        }

        // 検索したけど 0 件だった
        if (searchResult.length === 0) {
            return (
                <>
                    {searchLogoElement}
                    <p className="text-content-primary-light dark:text-content-primary-dark">
                        検索結果が見つかりませんでした。
                    </p>
                </>
            )
        }

        // 検索結果を出す
        return <SearchResult resultList={searchResult} />

    })()}
</div>
```

# 終わりに3
`Google Analytics`の`UA`が`GA4`に取って代わったため、`UA`がサービス終了になるわけですが、  
`7月1日`より前に`UA`で集めたデータをダウンロードしておく必要があります。`UA`の集計結果を見ることが出来なくなってしまいます。

https://support.google.com/analytics/answer/11583528?hl=ja#export

以上です。お疲れ様でした。8888888888