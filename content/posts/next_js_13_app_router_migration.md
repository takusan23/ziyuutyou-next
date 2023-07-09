---
title: Next.js の AppRouter に移行する
created_at: 2023-07-10
tags:
- Next.js
- TypeScript
- 自作ブログ
---

どうもこんばんわ。
恋にはあまえが必要です 攻略しました。  
ゆびさきのときとは違ってちゃんとメッセージアプリのテキストも読み上げてくれます神。  

この子のBルートの最後のイベントCGがめっちゃ好みです。

![Imgur](https://imgur.com/KvcE0Gh.png)

![Imgur](https://imgur.com/tB5j7YX.png)

個人的にはこの二人のルートが好きです、  
Aルートのほうが好みでした。

![Imgur](https://imgur.com/UTyFiFD.png)

![Imgur](https://imgur.com/62BW6gS.png)

かわいい

![Imgur](https://imgur.com/bOC7SP1.png)

ルート選択、妹ちゃんルートはちゃんと午後からしか出現しないようになってた（それはそうか

![Imgur](https://imgur.com/PYaEeQ2.png)

![Imgur](https://imgur.com/d4bVeUR.png)

あつい・・・あついね

あとめっちゃ関係ないですが`Misskeyのお一人様インスタンス`立ててみました。しばらく見てないうちに`インスタンス`ではなく`サーバー`って言うようになったらしい。  
こちらです。立ててしまった以上使わないとお金かかかるので使います・・・多分（？？？）

- URL
    - https://diary.negitoro.dev/@takusan_23
- ID と 鯖
    - `@takusan_23@diary.negitoro.dev`

なぜか私の鯖からリモートのユーザー情報が取れない鯖があるんですけどよく分かりません・・・  
io鯖とかは普通にリモートフォロー出来たのでほんとに謎です・・・


# 本題
`Next.js`の`AppRouter`に移行しようと思います。いい加減やります。  
おそらく日が経ったので、`PromiseでJSX`を返してもエラーにならないはず・・・！

# 環境

|            |                     |
|------------|---------------------|
| Next.js    | 13.4.4              |
| React      | 18.2.0              |
| TypeScript | 5.1.3 (後述)        |
| リポジトリ | app_router ブランチ |


# Next.js の AppRouter

`React Server Components`が採用されているので、デフォルトで`.tsx`を作った場合はサーバー側で描画されます。  

???

サーバー側（このブログは`SSG`ですが）で`React (JSX)`から`HTML`を作ってクライアントに返そう言っています。？  
動きのない（タイトルを表示している部分など）はこれを使うと、追加の`JavaScript`が無いので軽くなるとか？？  

サーバー側で描画するため、直接`データベース / API`へアクセスし、コンポーネントをクライアントへ返すことができるらしい。うーん難しい  
サーバー側で描画されるので、`useState`や、`onClick`、`Context`は使えない（動的な要素が必要ならクライアントコンポーネントが必要）  

てなことがここに書いてある。  
https://nextjs.org/docs/getting-started/react-essentials#when-to-use-server-and-client-components

### データ取得の新しい考え方？
`getStaticProps`は無くなったそう。かわりにコンポーネントが非同期で返せる（！？）ので、直接`await`でブログ記事とかを読み込めばいいらしい。  
コンポーネントでAPI叩くとか非同期なことできるようになったのが`RSC`なのか・・・？  

上に関連してなんですが、どうやらページの作り方の考え方も変わってるそうで、  
今までは`getStaticProps`でデータを取ったら、`Props`を他のコンポーネントにバケツリレーしてたと思うのですが、、  
`AppRouter`ではできる限り、非同期コンポーネント内でそれぞれ`getStaticProps`に当たる取得処理をするのが良いらしい。どゆこと？  

```tsx
// これより ----
export default async function DetailPage() {
    const data = await getArticle() // 記事を読み込む関数 Promise
    return (
        <>
            <Title>{data.title}</Title>
            <Detail body={data.html} />
        </>
    )
}

// こっちの方がいいらしい ----
async function Title() {
    const data = await getArticle()
    return (<h1>{data.title}</h1>)
}
async function Detail() {
    const data = await getArticle()
    return (<body dangerouslySetInnerHTML={data.html} />)
}

export default async function DetailPage() {
  return (
    <>
        <Title/>
        <Detail />
    </>
  )
}
```

- https://nextjs.org/docs/app/building-your-application/data-fetching#fetching-data-on-the-server
    - サーバーコンポーネントでロードしろ
- https://nextjs.org/docs/app/building-your-application/data-fetching#automatic-fetch-request-deduping
    - `fetch()`は重複リクエストしても、複数回`API`を叩くような処理にはならないよ
- https://nextjs.org/docs/app/building-your-application/data-fetching/caching#react-cache
    - `fetch()`が使えない（このブログのように、`Node.js`の`fs モジュール`を使うなど）場合は`cache()`を用意したから使ってね！

## Material-UI
このブログは`Material-UI`を使っていて、`Material-UI`はクライアントコンポーネントで描画する必要があります。  
というわけで、`"use client";`をひたすら書いていくのが今回の移行作業だと思います・・・

- https://github.com/mui/material-ui/issues/34905#issuecomment-1587760474
- https://github.com/mui/material-ui/issues/34905#issuecomment-1401306594

せっかく`App Router`なのに、全部に全部`"use client"`したら意味がないんじゃないかと思っていましたが、  
サーバーコンポーネント以外にもメリットがあると言ってくれているので、`pages`から移行したほうが良さそう  
（ 非同期なコンポーネントや、`Next.js 用 fetch API`、`pages ディレクトリ`よりも柔軟なファイル構成 など。特に最後のやつはそれだけでも旨味ありそう？ ）

# 移行します
公式  
https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration

手順としては・・・

- もろもろ更新する
    - 暗黙的な`children`が無くなったりとめんどいかも
- `pages`のルーティングを`app`に移動する
- 既存の`pages`で動いてたページをクライアントコンポーネントとして使えるようにする（`"use client"`をひたすら付ける）
- `app`へサーバーコンポーネントとして動くページを作り、データ取得と↑で作ったクライアントコンポーネントを呼び出す
- `generateStaticParams`を使って動的ルーティングを実装する
- `GoogleAnalytics`や`グローバルCSS`を動くように調節する

がんばりましょう。。。

## 更新
`Next.js`を更新します  
```
npm install next@latest react@latest react-dom@latest 
```

`TypeScript`だけは`npm i -D typescript`で更新されなかったので直接`package.json`をいじりました。  
`typescript`を`5.1.3`以降へ、`@types/react`を`18.2.8`以降にします。  
直接いじった場合、`package-lock.json`、`node_module`を消して`npm i`しないとだめです。

```json
  "devDependencies": {
    "@types/react": "^18.2.8",
    "typescript": "^5.1.3"
  }
}
```

## app フォルダを作る
`pages`のように`app`を作りました。

## _app.tsx を layout.tsx にする
`_app.tsx`を使って共通レイアウトを作ってましたが、`App Router`では`layout.tsx`を作ることで共通レイアウトを作れるようになりました。  

![Imgur](https://imgur.com/msvtbZg.png)

`app/layout.tsx`  
```tsx
import ClientLayout from "./ClientLayout"

/** 共通レイアウト部分 */
export default function RootLayout({ children, }: { children: React.ReactNode }) {
    // クライアントコンポーネントとして描画する必要があるため
    return (<ClientLayout children={children} />)
}
```

`app/ClientLayout.tsx`  
```tsx
// Material-UI を使うためクライアントコンポーネント
"use client"

import { ThemeProvider } from '@mui/material/styles'
import Layout from '../../components/Layout'
import useCustomTheme from '../../src/ZiyuutyouTheme'
import { useEffect, useState } from "react"
import useMediaQuery from '@mui/material/useMediaQuery'

/** ClientLayout へ渡す値  */
type ClientLayoutProps = {
    /** 子要素 */
    children: React.ReactNode
}

/** 共通レイアウト */
export default function ClientLayout({ children }: ClientLayoutProps) {
    // ダークモードスイッチ
    const [isDarkmode, setDarkmode] = useState(false)
    // テーマ。カスタムフック？何もわからん
    const theme = useCustomTheme(isDarkmode)
    // システム設定がダークモードならダークモードにする。Win10で確認済み
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
    // システム設定のダークモード切り替え時にテーマも切り替え
    useEffect(() => {
        setDarkmode(prefersDarkMode)
    }, [prefersDarkMode])

    return (
        <>
            <ThemeProvider theme={theme}>
                {/* ナビゲーションドロワーとタイトルバーをAppで描画する。各Pageでは描画しない */}
                <Layout
                    isDarkmode={isDarkmode}
                    onDarkmodeChange={() => setDarkmode(!isDarkmode)}
                >
                    {/* 各Pageはここで切り替える。これでタイトルバー等は共通化される */}
                    {children}
                </Layout>
            </ThemeProvider>
        </>
    )
}
```

## _document.tsx を layout.tsx にする
また、`next/head`も変更されており、メタデータを公開するような形になっています。  
`_document.tsx`で`head`いじってた場合はここに書くっぽい。

`pages/_document.tsx`  
```tsx
export default class Document extends NextDocument {
    render() {
        return (
            <Html>
                <Head>
                    {/* PWA */}
                    <link rel="icon" sizes="192x192" href="/icon.png" />
                    <link rel="manifest" href="/manifest.json" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
```

`app/layout.tsx`  
```tsx
import { Metadata } from "next"
import ClientLayout from "./ClientLayout"

export const metadata: Metadata = {
    manifest: '/manifest.json'
}

/** 共通レイアウト部分 */
export default function RootLayout({ children, }: { children: React.ReactNode }) {
    // TODO Google Analytics
    // クライアントコンポーネントとして描画する必要があるため
    return (<ClientLayout children={children} />)
}
```

`icon`、`favicon`は、`appフォルダ`内に入れておくことで自動で認識して追加してくれるそうです。  
![Imgur](https://imgur.com/J4KEWCE.png)

https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons#image-files-ico-jpg-png

## pages を app に移動する
`pages/index.tsx`をクライアントコンポーネントにします。

`app/ClientHomePage.tsx`  
```tsx
// Material-UI を使うため クライアントコンポーネント
"use client"

import LinkCard from "../../components/LinkCard";
import MakingAppCard from "../../components/MakingAppCard";
import ProfileCard from "../../components/ProfileCard";
import Spacer from "../../components/Spacer";
import LinkData from "../../src/data/LinkData";
import { MakingAppData } from "../../src/data/MakingAppData";

/** ClientHomePage へ渡すデータ */
type ClientHomePageProps = {
    /** ランダムメッセージの配列 */
    randomMessageList: Array<string>,
    /** 作ったアプリ配列 */
    makingAppList: MakingAppData[],
    /** リンク集 */
    linkList: LinkData[]
}

/** 最初に表示する画面 */
export default function ClientHomePage(props: ClientHomePageProps) {
    return (
        <>
            <ProfileCard randomMessageList={props.randomMessageList} />
            <Spacer value={1} />
            <LinkCard linkList={props.linkList} />
            <Spacer value={1} />
            <MakingAppCard makingAppList={props.makingAppList} />
        </>
    )
}
```

次に、`app/page.tsx`を作り、`getStaticProps`でやっていたロード処理を非同期コンポーネント内でやるようにします。  

`app/page.tsx`  
```tsx
import { Metadata } from "next";
import JsonFolderManager from "../src/JsonFolderManager";
import ClientHomePage from "./ClientHomePage";

/** <head> に入れる値 */
export const metadata: Metadata = {
    title: 'トップページ - たくさんの自由帳'
}

/** 最初に表示されるページ */
export default async function Home() {
    // データを async/await を使って取得する
    // なんとなく並列にしてみた
    const [randomMessageList, makingAppList, linkList] = await Promise.all([
        // ランダムメッセージ
        JsonFolderManager.getRandomMessageList(),
        // 作ったアプリ
        JsonFolderManager.getMakingAppMap(),
        // リンク集
        JsonFolderManager.getLinkList()
    ])

    return (<ClientHomePage randomMessageList={randomMessageList} makingAppList={makingAppList} linkList={linkList} />)
}
```

なんとなく並列にしてみただけで、大人しく一個一個`await`しても問題ないはずです。  

```ts
// これでもいい
// ランダムメッセージ
const randomMessageList = await JsonFolderManager.getRandomMessageList()
// 作ったアプリ
const makingLovers = await JsonFolderManager.getMakingAppMap()
// リンク集
const linkList = await JsonFolderManager.getLinkList()
```

最後に、`pages/index.tsx`、`pages/_app.tsx`、`pages/_document.tsx`を消します。残しておくと、`app`なのか`pages`なのかどっちなんだい！ってなっちゃうので  

どうだろう、これで見れるはず？  
![Imgur](https://imgur.com/5p4dvJN.png)

## ひたすら pages を app にする作業をする
これを繰り返します。  
`getStaticPaths`は後でやります。  

### ルーティング
`App Router`は、フォルダを作っただけではパスとしては認識されません。  
フォルダの中に`page.tsx`があるかでパスとしては認識するかどうかが決まります。

なので`pages`でこうだった構成だと
- pages
    - pages
        - [page].tsx
    - posts
        - page
            - [page].tsx
        - tag
            - [tag].tsx
            - all_tags.tsx
        - [blog].tsx

`app`だとこうなるはず

- app
    - pages
        - [page]
            - page.tsx
    - posts
        - [blog]
            - page.tsx
        - page
            - [page]
                - page.tsx
        - tag
            - [tag]
                - page.tsx
            - all_tags
                - page.tsx

パスの名前のフォルダを作る必要がある感じですね。  
一見ややこしいように見えますが、`page.tsx`を置いてないフォルダはさっきの通りパスとしては認識されないので、  
同じ場所にテストコード、コンポーネントを置くなどができるようになりました。

- app
    - posts
        - posts-components // 記事表示で使うコンポーネント置き場
            - Title.tsx
        - tests // テストコード
            - test.tsx
        - [blog]
            - page.tsx // 記事表示

わかりやすいような・・・ややこしいような・・・

あと動的ルーティングはフォルダ名を`[動的ルーティング名]`にすればいいです。（`[id]`とか`[page]`とか）  
`page.tsx`からは以下のように引数で動的ルーティングのパス名が取れるようになります。  

```tsx
// slug は [slug] だから。
// フォルダ名が [id] なら { id: string } が正解
export default function Page({ params }: { params: { slug: string } }) {
  return <div>My Post: {params.slug}</div>
}
```

https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes

どうでしょう、`CSS`が当たってなかったりしますが、、、、とりあえずは出るようになりましたか？

![Imgur](https://imgur.com/hC0jLrc.png)

もし`Conflicting app and page file found`がでてしまったら、一度開発サーバーを起動し直すといいかもしれないです。  
`npm run dev`

## 動的ルーティング を返してあげる
動的ルーティングで生成されるパス一覧を返してあげます。  
`getStaticPaths`は`AppRouter`では`generateStaticParams`になります。  
`API`はそんなに変わってないはずです。  

`pages/posts/[blog].tsx`  
```ts
/**
 * ここで生成するページを列挙して返す。（実際にはパスの一部）
 * 
 * /posts/<ここ> ←ここの部分の名前を渡して生成すべきページを全部列挙して返してる
 * 
 * これも上記同様クライアント側では呼ばれない。
 */
export const getStaticPaths: GetStaticPaths = async () => {
    const fileNameList = (await ContentFolderManager.getBlogNameList())
        // この場合はキーが blog になるけどこれはファイル名によって変わる（[page].tsxなら page がキーになる）
        .map(name => ({ params: { blog: name } }))
    return {
        paths: fileNameList,
        fallback: false
    }
}
```

`app/posts/[blog]/page.tsx`  
```ts
/**
 * ここで生成するページを列挙して返す。（実際にはパスの一部）
 * 
 * /posts/<ここ> ←ここの部分の名前を渡して生成すべきページを全部列挙して返してる
 * 
 * これも上記同様クライアント側では呼ばれない。
 */
export async function generateStaticParams() {
    const fileNameList = await ContentFolderManager.getBlogNameList()
    // この場合はキーが blog になるけどこれはファイル名によって変わる（[page].tsxなら page がキーになる）
    return fileNameList.map((name) => ({ blog: name }))
}
```

## 404.tsx を not-found.tsx へ移行する
`pages/404.tsx`も`app/not-found.tsx`へ移動します。  
これで`pages`フォルダーは削除できるようになるはず・・・！

## CSS をなおす
`layout.tsx`で`css`を読み込むことが出来ます

```tsx
import { Metadata } from "next"
import ClientLayout from "./ClientLayout"
// コードブロックのCSS
import "highlight.js/styles/vs2015.css"
// グローバルCSS
import "../styles/css/global.css"
```

## GoogleAnalytics をなおす
これは`GA4`で`SPA`でも使える設定（なんだっけ？、パスの変化を検知するみたいなやつ）をしていない場合に必要です。  
`useRouter`で遷移時にイベントを取得し、そのタイミングで`GAの遷移イベント`を飛ばしていたやつは修正が必要です。  

こーゆーやつ ↓↓↓  
```tsx
useEffect(() => {
    const handleRouteChange = (url: string) => {
        pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
        router.events.off('routeChangeComplete', handleRouteChange)
    }
}, [router.events])
```

で、`useRouter usePathname useSearchParams`の3つに分裂したそうなので置き換えます。  
クライアントコンポーネントである必要があります。  

https://nextjs.org/docs/app/api-reference/functions/use-router#router-events

```tsx  
/** Google Analytics 4 で利用するJavaScriptを差し込むやつ。本番（意味深）のみ実行 */
export default function GoogleAnalytics() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Google Analytics へnext/routerのページ遷移の状態を通知する
    useEffect(() => {
        const url = `${pathname}${searchParams}`
        pageview(url)
    }, [pathname, searchParams])

    // 本番ビルド時のみ GoogleAnalytics をセットアップする
    return (
        <>
            {!isDevelopment && <>
                <Script
                    strategy="afterInteractive"
                    src={`https://www.googletagmanager.com/gtag/js?id=${UA_TRACKING_ID}`}
                />
                <Script
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${UA_TRACKING_ID}');
                        gtag('config', '${GA_TRACKING_ID}');
                    `}}
                />
            </>}
        </>
    )
}
```

`app/layout.tsx`で呼び出せば良いのですが、`<suspense>`でくくらないと怒られます。  

```tsx
/** 共通レイアウト部分 */
export default function RootLayout({ children, }: { children: React.ReactNode }) {
    // クライアントコンポーネントとして描画する必要があるため
    return (
        <html>
            <body className={koruriFont.variable}>
                {/* 共通レイアウト。ナビゲーションドロワーとか */}
                <ClientLayout children={children} />
                {/* GoogleAnalytics */}
                <Suspense fallback={null}>
                    <GoogleAnalytics />
                </Suspense>
            </body>
        </html>
    )
}
```

これで一通り出来たかな？？？

## 静的サイト書き出しを有効にして、本番ビルドしてみる
https://nextjs.org/docs/pages/building-your-application/deploying/static-exports

`next.config.js`に追記する必要があります。

```js
// https://github.com/vercel/next.js/blob/canary/examples/progressive-web-app/next.config.js
const withPWA = require('next-pwa')({
    // https://github.com/GoogleChrome/workbox/issues/1790#issuecomment-729698643
    disable: process.env.NODE_ENV === 'development',
    dest: 'public',
})

module.exports = withPWA({
    output: 'export', // これ
    trailingSlash: true,
    experimental: {
        scrollRestoration: true,
    }
})
```

また、`output: 'export'`が追加された影響で、`npx next export`が無くなったため、`package.json`に書いたビルドコマンドも修正する必要があります。（`npx next build`だけでよくなりました）  

```diff
- "deploy": "npm run build && npm run export && npm run postbuild"
+ "deploy": "npm run build && npm run postbuild"
```

これでビルドしてみる。多分動くはず。  
流石に全部やると時間かかりすぎるので記事を2個ぐらいにした。

### 型チェックが厳しくなった？
型のチェックが厳しくなっている？

```ts
./components/MakingAppCard.tsx:120:20
Type error: Object is possibly 'undefined'.

  118 |     const changeAppListPlatform = (platformName: string) => {
  119 |         // あれTypeScriptくんこれ通すんか？
> 120 |         setAppList(makingAppList.find(platformObj => platformObj.platfromName === platformName).appList)
      |                    ^
  121 |     }
  122 | 
  123 |     /**
```

```ts
const makingApp = makingAppList.find(platformObj => platformObj.platfromName === platformName)
if (makingApp) {
    setAppList(makingApp.appList)
}
```

`TypeScript`、エラーがわかりにくい気がするんですけど、私だけなんですかね・・・

```ts
./src/MarkdownParser.ts:97:15
Type error: Type '{ label: string | null; level: number; hashTag: string; }[]' is not assignable to type 'TocData[]'.
  Type '{ label: string | null; level: number; hashTag: string; }' is not assignable to type 'TocData'.
    Types of property 'label' are incompatible.
      Type 'string | null' is not assignable to type 'string'.
        Type 'null' is not assignable to type 'string'.
```

`Kotlin`の`filterNotNull`に当たる処理が思いつかないので調べたんですが、`flatMap`を使う方法だと型を予測して解決してくれていい感じ。  
https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array

```ts
/**
 * HTML を解析して 目次データを作成する。結構時間がかかる。
 * 
 * @param html HTML
 * @returns 目次データの配列
 */
static parseToc(html: string): TocData[] {
    // HTML パーサー ライブラリを利用して h1 , h2 ... を取得する
    // この関数は ブラウザ ではなく Node.js から呼び出されるため、document は使えない。
    const window = (new JSDOM(html)).window
    const document = window.document
    const tocElementList = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    // 目次データに変換して返す
    const tocDataList: TocData[] = Array.from(tocElementList)
        .map(element => {
            if (element.textContent) {
                return {
                    label: element.textContent,
                    level: Number(element.tagName.charAt(1)), // h1 の 1 だけ取り出し数値型へ
                    hashTag: `#${element.getAttribute('id')}` // id属性 を取り出し、先頭に#をつける
                }
            } else {
                return null
            }
        })
        // null を配列から消す技です
        .flatMap(tocDataOrNull => tocDataOrNull ? [tocDataOrNull] : [])
    window.close()
    return tocDataList
}
```

### 静的書き出し結果を見てみる
`npx next start`は使えなくなりました。  

```plaintext
Error: "next start" does not work with "output: export" configuration. Use "npx serve@latest out" instead.
```

かわりに、以下のコマンドで起動できます。  

```shell
npx serve@latest out
```

うーんなんか全然動いて無くないか？  
~~`/posts/page/1/`を押してもなんかパスが中途半端なんですけど？~~ → `generateStaticParams`間違ってました。ごめんなさい

![Imgur](https://imgur.com/Kfoniwd.png)

# ついでに直したいところ
他に直したい部分が何個かあるんですよね...

- ドメインをハードコートするのをやめて、環境変数にする
- ドキュメント通りのサイトマップ生成を使う
- app/README.md 更新する
- Babel をやめたい
- ServiceWorker やめたい
- next/font を利用したい
- トップページの画像変えたい
- サイトマップ生成も変えたい
- 404 の画像変えたい
- OSSライセンス画面更新
- ビルドコマンドの修正（ライブラリ無しでサイトマップ生成したので`postbuild`なしでよくなった。`npx next build`だけでいいはず）

## サイトマップ生成
`App Router`から、サイトマップ生成がライブラリ無しで作れるようになったっぽいので、移行します。  
https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

`app/sitemap.ts`  
```ts
import { MetadataRoute } from "next";
import UrlTool from "../src/UrlTool";
import ContentFolderManager from "../src/ContentFolderManager";

/**
 * サイトマップを生成する。Next.js 単体で作れるようになった。
 * Trailing Slash が有効なので最後にスラッシュ入れました。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const currentTime = new Date()

    // 静的ページ
    const staticPathList: MetadataRoute.Sitemap = [
        {
            url: `${UrlTool.BASE_URL}/`,
            lastModified: currentTime
        }
    ]

    // ブログ記事
    const blogPathList = (await ContentFolderManager.getBlogNameList())
        .map(name => ({
            url: `${UrlTool.BASE_URL}/posts/${name}/`,
            lastModified: currentTime
        }))

    // 固定ページ
    const pagePathList = (await ContentFolderManager.getPageNameList())
        .map(name => ({
            url: `${UrlTool.BASE_URL}/pages/${name}/`,
            lastModified: currentTime
        }))

    return [...staticPathList, ...blogPathList, ...pagePathList]
}
```

`npm run build`したあと`out/sitemap.xml`が出来て、こんなのが出てきます。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>https://takusan.negitoro.dev/</loc>
<lastmod>2023-06-18T17:15:15.809Z</lastmod>
</url>
<url>
<loc>https://takusan.negitoro.dev/posts/next_js_13_app_router_migration/</loc>
<lastmod>2023-06-18T17:15:15.809Z</lastmod>
</url>
<url>
<loc>https://takusan.negitoro.dev/posts/windows_winui3_installer_and_virtual_desktop/</loc>
<lastmod>2023-06-18T17:15:15.809Z</lastmod>
</url>
<url>
<loc>https://takusan.negitoro.dev/pages/about/</loc>
<lastmod>2023-06-18T17:15:15.809Z</lastmod>
</url>
</urlset>
```

## Babel をやめて SWC にする
https://nextjs.org/docs/architecture/nextjs-compiler

そもそも何だこれはという話ですが、なんか`SWC`を使ったほうが高速に動くらしい。  
で、`SWC`にしたいところなんですが、、`Babel`で`svg`をコンポーネント化するプラグインを使っているので、この代わりをどうにかする必要があります。  

困ってる人私以外にもいた  
https://github.com/vercel/next.js/discussions/33161

`SVGR`を使っている人が多そうかな、じゃあこれで  
https://react-svgr.com/docs/next/

`.babelrc`を消して、プラグインも消しちゃいます。  

次に入れて  
`npm install --save-dev @svgr/webpack`

`next.config.js`に書き足します。  
`webpack`の箇所ですね。  

```js
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
```

あとは`svg`のパスをインポートして、JSX書けば良いはず！すごい！  

```tsx
// https://react-svgr.com/docs/next/ 参照
import NotFoundIcon from "../public/not_found.svg"

export default function Component() {
    return (
        <>
            <NotFoundIcon
                className={'theme_color'}
                height={250}
                width={250}
            />
```

## next/font を使う
こっちの方がいいらしい。ので  
前は`@next/font`を入れる必要があったみたいですが、`Next.js`に組み込まれたみたいなので、入れなくても使えるらしい。  
`app/layout.tsx`で読み込めば良さそう。  

用意したフォントを読み込みたいので、`local`の方を使うぽい  
https://nextjs.org/docs/app/building-your-application/optimizing/fonts#local-fonts

`variable`を指定すると、`.css`などから参照できるようになります。  
`<body className={koruriFont.variable}>`を忘れないようにしてください。（一敗）

`app/layout.tsx`  
```tsx
import localFont from "next/font/local"

/** フォントを読み込む */
const koruriFont = localFont({
    // CSS 変数として使う
    variable: '--koruri-font',
    src: [
        { path: '../styles/css/fonts/Koruri-Regular-sub.eot' },
        { path: '../styles/css/fonts/Koruri-Regular-sub.ttf' },
        { path: '../styles/css/fonts/Koruri-Regular-sub.woff' },
    ]
})

/** 共通レイアウト部分 */
export default function RootLayout({ children, }: { children: React.ReactNode }) {
    // クライアントコンポーネントとして描画する必要があるため
    return (
        <html>
            <body className={koruriFont.variable}>
                {/* 共通レイアウト。ナビゲーションドロワーとか */}
                <ClientLayout children={children} />
                {/* GoogleAnalytics */}
                <Suspense fallback={null}>
                    <GoogleAnalytics />
                </Suspense>
            </body>
        </html>
    )
}
```

`CSS`からは`var()`で参照できます。  
`global.css`  
```css
/* コードブロック */
code {
    overflow-x: scroll;
    font-family: var(--koruri-font);
    background-color: rgba(0, 0, 0, 0.05);
}
```

`Material-UI`の`createTheme`も多分これで参照できているはず。  
```ts
createTheme({
    typography: {
        fontFamily: [
            'var(--koruri-font)'
        ].join(','),
    }
})
```

はい  
![Imgur](https://imgur.com/fiMT1nU.png)

## next/head が無くなってしまったので、クライアントコンポーネントで head が操作できない？
唯一困ったかもしれない。  
`next/head`を使って、テーマの色に合わせて`Android`のステータスバーの色も同じ色に合わせるようにしていたのですが、`AppRouter`で使えなくなってしまった。  
とりあえず`DOM`を`JavaScript`で無理やり変えてるんですけど、、、これでいいの？  

```ts
"use client"

import { useEffect, useRef } from "react"

/**
 * Androidのステータスバーに色を設定する
 * AppRouter だと next/head が使えない。多分現状クライアントコンポーネントで head の中身を変える方法が Next.js にはなさそう？
 * 仕方ないので、DOM を触る。
 * 
 * @param colorCode カラーコード
 */
export default function useAndroidStatusBarColor(colorCode: string) {
    const statusBarColorMeta = useRef<HTMLMetaElement>()

    // 追加する
    useEffect(() => {
        statusBarColorMeta.current = document.createElement('meta')
        statusBarColorMeta.current.setAttribute('name', 'theme-color')
        document.head.append(statusBarColorMeta.current)
    }, [])

    // 色が変化したら更新する
    useEffect(() => {
        statusBarColorMeta.current?.setAttribute('content', colorCode)
    }, [colorCode])
}
```

# 動きました！
差分はこんな感じになります。  

https://github.com/takusan23/ziyuutyou-next/pull/1

実際に適当に公開しても問題なさそうだったので、人がいなさそうな時にあげようかな。いや別にいつでも良いか・・？

# おわりに
めちゃ関係ないけど`Tailwind CSS`ﾁｮｯﾄだけ触ってみましたが、これで良くない？  
サーバーコンポーネントとしても`Tailwind CSS`は使えるみたいなので`Material-UI`をやめてもいいかもしれない  

あと公式ドキュメント、Chromeの翻訳してるとルーティング失敗しない？  
あと`VSCode`は`Altキー`を押しながらスクロールすると高速でスクロールできます。  

# おわりに2
ストレージがたりない！！！

`[Error: ENOSPC: no space left on device, write]`