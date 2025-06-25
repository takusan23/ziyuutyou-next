---
title: ブログの改修 2025
created_at: 2025-06-26
tags:
- 自作ブログ
- Next.js
- TypeScript
---
どうもこんばんわ。  
シークレットラブ（仮）純愛アフターストーリー 攻略しました、  
こころなしか、効果音が減った気がする。気のせいかも。

今作はこれ！！！！です

![感想](https://oekakityou.negitoro.dev/resize/07185089-edfd-42b2-94a5-f041ba726abd.jpg)

わたし的には本編よりもおもしろかった！！かも！ﾖｶｯﾀ  
ちーちゃん良すぎる

![感想](https://oekakityou.negitoro.dev/resize/19783596-2a26-473e-8b85-9a5326d56904.jpg)

、、、、

![感想](https://oekakityou.negitoro.dev/resize/6d48434b-2437-40b9-a76c-8120f68d9573.jpg)

あとここの声すき

![感想](https://oekakityou.negitoro.dev/resize/1d2e8ef0-0b8c-4aee-b395-35df0c8d90e0.jpg)

ここも

![感想](https://oekakityou.negitoro.dev/resize/d64994f6-b0b7-4b7e-851d-ba539931b76e.jpg)

よかった!!!

# 本題
やりたいこと一覧。たまってきたので一気にやります。

- リンクカード
- 関連する記事、前後の記事を表示
- ダークモード切り替えにデバイス設定に従うを追加したい
- タグの記事一覧画面もページネーションしたい
- 全画面だとだたっぴろいので、max-width を入れる
- 記事本文から記事一覧に戻るボタン
- `next/link`の画面遷移だと`<script>`が実行されない
- `<img>`を遅延読み込み
- `Tailwind CSS`を`v4`に
- コードブロックのフォントを等幅に
- `use Hook`と`<Suspence>`で書き直したい
- 画像を押したら別タブで開きたい
- 起動時に出てる`The config property experimental.turbo is deprecated`を直したい
- `sitemap.xml`、日付`new Date()`じゃだめでは

# Tailwind CSS 4 系に
`TailwindCSS`のバージョンが 4 になった。  
https://tailwindcss.com/blog/tailwindcss-v4

以下のコマンドを叩くと、できる限り自動で移行されるそうです。

```shell
npx @tailwindcss/upgrade
```

一部のユーティリティ名が置き換わった。

```diff
- className="grow focus:outline-none bg-transparent py-1 text-content-text-light dark:text-content-text-dark"
+ className="grow focus:outline-hidden bg-transparent py-1 text-content-text-light dark:text-content-text-dark"
```

また、`tailwind.config.ts`が解体されたそうです。  
今までユーティリティ名捜査対象のファイル（`.tsx`）とかを指定していましたが、なんか自動でやってくれるそうなので不要になった。

そして、最大の変更点である、自前の色設定が`.ts`から`.css`の変数に移動しました。
よってこれが、

```ts
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // コピーボタンを差し込むので
    "./src/transformShikiCodeBlockCopyButton.ts"
  ],
  theme: {
    // 既存の色を拡張する（プライマリカラー等を追加する）
    extend: {
      // ネストできるので、テーマ別にそれぞれ
      colors: {
        // コンテンツで使う色
        content: {
          // プライマリーカラー
          primary: {
            // md_theme_light_primary
            light: '#4A58A9',
            dark: '#BBC3FF'
          },
          // セカンダリーカラー
          secondary: {
            // md_theme_light_secondary
            light: '#974068',
            dark: '#974068'
          },
          // 文字
          text: {
            // md_theme_dark_background : md_theme_light_background
            light: '#1B1B1F',
            dark: '#FEFBFF'
          }
        },

        // コンテナの色。コンテンツの色の下に敷く
        container: {
          // プライマリーカラー
          primary: {
            // md_theme_light_surface : md_theme_dark_surface
            light: '#FFFBFF',
            dark: '#1B1B1F'
          },
          // セカンダリーカラー
          secondary: {
            // md_theme_light_surface : md_theme_dark_surface の RGB それぞれに 0.95 倍したもの。カラーコード 明るさ とかで検索
            light: '#f2eef2',
            dark: '#19191d'
          }
        },

        // Error ?
        error: {
          // md_theme_light_error
          light: '#BA1A1A',
          dark: '#BA1A1A'
        },

        // 背景色
        background: {
          // md_theme_light_primaryContainer
          light: '#DEE0FF',
          dark: '#000000'
        },

        // 選択時の色（ホバー）
        hover: {
          // md_theme_light_primary の 25% の色。16進数なので 40 です（RGBA）
          light: '#4A58A940',
          dark: '#BBC3FF40'
        },
      },
      fontFamily: {
        // next/font で読み込んだやつ
        'body': ['var(--koruri-font)'],
      }
    },
  },
  plugins: [],
}
```

こうなった。確かに`CSS`変数になった。`import`も減った。  
これでスクロールバーの色を`CSS`で付けていたのですが、つける色が`ts`に書かれているでコピペしていた。  
が、`Tailwind CSS`の色が変数になったので、`var()`で参照すれば良くなった。  

```css
@import 'tailwindcss';

@custom-variant dark (&:is(.dark *));

@theme {
  --color-content-primary-light: #4a58a9;
  --color-content-primary-dark: #bbc3ff;

  --color-content-secondary-light: #974068;
  --color-content-secondary-dark: #974068;

  --color-content-text-light: #1b1b1f;
  --color-content-text-dark: #fefbff;

  --color-container-primary-light: #fffbff;
  --color-container-primary-dark: #1b1b1f;

  --color-container-secondary-light: #f2eef2;
  --color-container-secondary-dark: #19191d;

  --color-error-light: #ba1a1a;
  --color-error-dark: #ba1a1a;

  --color-background-light: #dee0ff;
  --color-background-dark: #000000;

  --color-hover-light: #4a58a940;
  --color-hover-dark: #bbc3ff40;

  --font-body: var(--koruri-font);
}

/*
  The default border color has changed to `currentcolor` in Tailwind CSS v4,
  so we've added these compatibility styles to make sure everything still
  looks the same as it did with Tailwind CSS v3.

  If we ever want to remove these styles, we need to add an explicit border
  color utility to any element that depends on these defaults.
*/
@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentcolor);
  }
}
```

![差分](https://oekakityou.negitoro.dev/resize/a5c7fe0e-1e36-47f8-9720-b453d1d701f7.png)

## resolveConfig がなくなった
`tailwind.config.ts`から色を取り出す`resolveConfig()`が、`CSS 変数`の移行でなくなった？  
何に使っていたかというと`Android Chrome`のタブの色を変えるのに使ってた。

```ts
const colors = resolveConfig(tailwindConfig).theme?.colors
if (colors) {
    const backgroundColor = isDarkmode ? colors['background']['dark'] : colors['background']['light']
    document.querySelector("meta[name='theme-color']")?.setAttribute('content', backgroundColor)
}
```

ただ、`DOM API (document / window)`触れるなら、`getPropertyValue()`で`CSS 変数`アクセスできるので、とりあえず解決。

```ts
const styles = getComputedStyle(document.documentElement)
const backgroundColor = styles.getPropertyValue(isDarkmode ? "--color-background-dark" : "--color-background-light")
document.querySelector("meta[name='theme-color']")?.setAttribute('content', backgroundColor)
```

## resolveConfig がなくなった（DOM なし）
`OGP`を作っている箇所はブラウザではなく、`Node.js (サーバー側)`なので、上の`DOM API`を使う方法では解決できない。  
まじで`CSS`を読み出して正規表現で取り出すくらいしか思いつかないんだけど

強引にファイルを読み出しててもやりたい場合はこんな感じ。  
`Tailwind CSS`が使っている`PostCSS`を、`CSS`パーサーとして利用する。`CSS`ファイルを読み出して、`PostCSS`に入れると、  
`CSS`の構造通りにネストされた`JSON`が返ってくる。ので、あとは名前を一個一個確認して`filter()`していくと`CSS`変数にたどり着ける。

```ts
// @thene { } を解析
const themeBlock = cssParse.root.nodes
    .filter((node) => node.type === 'atrule')
    .find((node) => node.name === 'theme')
// 各 CSS 変数を取得。object に css 変数の key がある
const cssVariableList = Object.fromEntries(
    themeBlock
        ?.nodes
        ?.filter((node) => node.type === 'decl')
        ?.map((node) => ([node.prop, node.value])) || []
)

// 例
const backgroundColor = cssVariableList['--color-background-light']
```

## Tailwind CSS の apply が効かない
https://tailwindcss.com/docs/compatibility#explicit-context-sharing

これが効いてない...

```css
.content_div {
    /* リンクがはみ出るので */
    overflow-wrap: break-word;
    /** 文字の色 */
    @apply text-content-text-light dark:text-content-text-dark;
}
```

修正は、`@reference`を使うか、`css`変数に書き直すか。らしい。  
取り急ぎ`@reference`を使うように直してみた。こんな感じかな。

```css
@reference "../../styles/css/global.css";

.content_div {
    /* リンクがはみ出るので */
    overflow-wrap: break-word;
    /** 文字の色 */
    @apply text-content-text-light dark:text-content-text-dark;
}
```

![css](https://oekakityou.negitoro.dev/resize/a5c7fe0e-1e36-47f8-9720-b453d1d701f7.png)

# React 19 の use Hook を使う
クライアントコンポーネントでは、`async function`で`JSX`を作ることが出来ません。`RSC`の特権のようです。  
じゃあ我々は今でも`useEffect()`でデータ取得しなくちゃいけないのかというと、そうでもなく。

https://ja.react.dev/blog/2024/12/05/react-19  
新機能の`use()`と`<Suspence>`がこれを解決します。  
`use()`を使うことで、`Promise`の中身をいい感じに取得できます。取得できるまでの間は、`<Suspence fallback={}>`でフォールバック`UI`が表示できます。  
`use()`を呼び出たコンポーネントから、一番近い`<Suspence>`が使われるそうです。

一点、`use()`フックに渡す`Promise`は、レンダリング中に作るとだめらしい。  
というか、`Promise`オブジェクトは多分使い回す必要があります。とりあえず`useMemo`に入れました。

つまり、`use()`の中で`Promise`オブジェクト（インスタンス？）を作ると怒られるので、いい感じに外から渡すようにしないといけない？  
`<Suspence>`は`Promise`が完了したときに、もう一回描画されるらしい。なので、`use()`呼び出しの中で毎回あたらしく`Promise`を作ると、  
`Promise 誕生 → use() Promise開始 → Promise完了 → <Suspence> 再レンダリング → Promise 誕生 → use() Promise開始 ...`になる？

```tsx
/** 検索する */
async function executeSearchFromQueryParams(searchWord: string) {
    // pagefind で検索する
    // 省略...
}

export default function PagefindSearch() {
    // クエリパラメータから取り出す
    const searchParams = useSearchParams()
    const searchWord = searchParams.get('q') ?? ''

    // 検索する Promise。検索結果に渡す
    // 多分 Promise オブジェクトは使い回す必要があるので、useMemo()
    const promiseObject = useMemo(() => executeSearchFromQueryParams(searchWord), [searchWord])

    return(
      <Suspense fallback={<CircleLoading />}>
        <SearchResult resultListPromise={promiseObject} />
      </Suspense>
    )
}

type SearchResultProps = {
    resultListPromise: Promise<PagefindSearchFragment[]>
}

function SearchResult({ resultListPromise }: SearchResultProps) {
    // Promise を待つ
    const resultList = use(resultListPromise)
    resultList.map(...)
}
```

# 検索画面が戻れるように
今までは検索ワードを`useState()`に入れて、`Enter`を押したら`pagefind`で検索していました。  
が、これだと戻れません。戻るを押すと検索画面より前まで戻ってしまします。

というわけで、`URL`にクエリパラメータを付与して、画面遷移するように。  
検索画面は、パラメーターが付いていれば検索を実行するようにしました。  

```tsx
/** 検索画面 */
export default function PagefindSearch() {
    // クエリパラメータから取り出す
    const searchParams = useSearchParams()
    const searchWord = searchParams.get('q') ?? ''

    // 以下省略
}
```

`URL`を作って画面遷移する部分はこう、`<form>`で`URL`移動するやつですね。  
`<form>`の`Next.js`版の`next/form`を使いました。最近？のバージョンから使えるようになったはず。  
`<form>`と違って`next/form`は`URL`移動が`next/link`を使うようになっています！！

```tsx
import Form from 'next/form'

export default function SearchForm({ searchWord }: SearchFormProps) {
    // method="get" なので
    // form 確定したら /search/q={検索ワード} のページに遷移する
    return (
        <Form
            className="search-form flex flex-row w-full space-x-2 py-2 px-4 rounded-full bg-container-primary-light dark:bg-container-primary-dark"
            action="/search/"
        >
            <input
                className="grow focus:outline-hidden bg-transparent py-1 text-content-text-light dark:text-content-text-dark"
                type="input"
                placeholder="検索ワード"
                name="q"
                defaultValue={searchWord} />
        </Form>
    )
}
```

![りれき](https://oekakityou.negitoro.dev/resize/7a86698a-c237-468d-90fa-9b025343d499.png)

# 自力で HTML を組み立てる
いままでは`unified`の`remark / rehpye`を通じて`HTML`を作っています。  
`HTML`を作るのを`unified`に一任している感じです。

が、自分で`HTML`を書きたい場合がチラホラ出て、  
しかも結構あって`unified`に一任を辞めたくなってきた。理由は先述したとおりですが再掲。

- リンクカード作りたい
- `<img>`の読み込みを、画面内に入るまで遅延して欲しい
  - 前の記事の通り、自前で`S3 + CloudFront`で画像を配信するようにしたため
    - できる限りアウトバウンド通信したくない
  - というか見ない画像まで読み込むのは、**スマホのギガが減るので普通に迷惑**
    - 本音はアウトバウンド通信を減らしたい、が、こっちのほうが**重要**な気がしてきた
- ニコニコ動画の埋め込みプレイヤーが`next/link`の`SPA`な画面遷移では表示されない
  - 直接開く or リロードで開ける
  - `next/link`の`SPA`画面遷移では読み込まれない、、、

## 今回の作戦
先述の通り、`<img>`を遅延読み込みしたいとか、リンクカード作りたいとか、で必要な`HTML タグ`のみ自分で描画する。  
できれば興味ない、というか今まで使ったことない`HTML`タグは、これまで通り`unified`で作ってほしい。

自前で`JSX`を書いているタグ、というかこのブログで使っているタグは以下で、  
仮にこれ以外が来た場合は一律`unified`を使った`HTML`作成にフォールバックしています。

```ts
const ReBuildHtmlElementTagNames = [
    // グループ
    "div",
    // 改行
    "br",
    // 文字
    // 文章、文字、太字、右上につける文字、斜め、打ち消し線
    "p", "span", "strong", "sup", "em", "del",
    // リンク
    "a",
    // セクション
    "section",
    // 引用
    "blockquote",
    // 折りたたみ要素
    "details", "summary",
    // 区切り線
    "hr",
    // 画像
    "img",
    // 箇条書き
    "ol", "ul", "li",
    // 表
    "table", "thead", "tbody", "tr", "td", "th",
    // 見出し
    "h1", "h2", "h3", "h4", "h5", "h6",
    // コード・コードブロック
    "pre", "code",
    // スクリプト
    "script", "noscript",
    // iframe
    "iframe"
] as const
```

## remark rehype の話
今回、自前で`JSX`を書いて本文を描画するわけです。が、`Markdown`をパースして`HTML`にする直前までは`unified`の`remark / rehype`がやっています。

`remark`が、`Markdown`処理系で、`rehype`が`HTML`処理系です。  
今までみたいに、一発で`Markdown`から`HTML`にすることもできます。  

それに加えて、間に入ることもできます。`Markdown`のパース結果が`オブジェクト`でもらえるので、編集したりなんかができます。  
編集した`オブジェクト`を`rehype`に投げれば`HTML`に出来るって寸法。

`Markdown`のパース結果のオブジェクトを`mdast (Markdown AST)`、`HTML`のを`hast (HTML AST)`と呼んでます。  
今回は間に入り、最終的に`HTML`を作る部分は自前で実装。  
`Markdown`から`HTML`の`オブジェクト、hast`を受け取るところまで`unified`にお願いして言います。

実際に`Markdown -> mdast -> hast`にしているコードです。

```ts
/**
 * Markdown から unified の HTML AST を取得する
 * 
 * @param markdown Markdown 本文
 * @returns hast (unified HTML AST)
 */
static async parseMarkdownToHtmlAst(markdown: string) {
    const remarkProcessor = unified()
        .use(remarkParse)
        .use(remarkGfm)
    const rephypeProsessor = unified()
        .use(remarkRehype, { allowDangerousHtml: true })
    // Markdown AST (mdast)
    const mdast = remarkProcessor.parse(markdown)
    // mdast -> HTML AST (hast)
    const hast = await rephypeProsessor.run(mdast)
    return hast
}
```

返り値がこんな感じ。あとは`tagName`を見て`JSX`を組み立てているって感じ。  
リンクカードを作りたければ`<a>`を組み立てる際に介入すればOKだし。

```json
{
    "type": "root",
    "children": [
        {
            "type": "element",
            "tagName": "p",
            "properties": {},
            "children": [
                {
                    "type": "text",
                    "value": "どうもこんばんわ。",
                    "position": {
                        "start": {
                            "line": 1,
                            "column": 1,
                            "offset": 0
                        },
                        "end": {
                            "line": 1,
                            "column": 10,
                            "offset": 9
                        }
                    }
                }
            ],
            "position": {
                "start": {
                    "line": 1,
                    "column": 1,
                    "offset": 0
                },
                "end": {
                    "line": 1,
                    "column": 12,
                    "offset": 11
                }
            }
        }
    ],
    "position": {
        "start": {
            "line": 1,
            "column": 1,
            "offset": 0
        },
        "end": {
            "line": 7,
            "column": 1,
            "offset": 58
        }
    }
}
```

`children`は、`"type": "element"`以外の場合があるので、まず`filter()`する必要があります。  
`union`的なのを`filter()`で仕分けるのって`TypeScript`できたっけ、、最近できた？

```ts
element.children.filter((node) => node.type === "element").map((element) => element.tagName)
```

## 嬉しいところ
- `Tailwind CSS`がそのまま当てられる
    - `className`に渡せますから
- リンクカードを作れた
- `img`に遅延読み込みが指定できた
- `rephype`プラグインはほとんど消し去った
  - `remark`は`Markdown`パース系なので残るで正解

## つらいところ
- `unified`によるフォールバックはあんまり使えない
  - div へ html を入れても、`<p>`の中に`div`入れられないので、`<p>`傘下は全部自前で、、みたいな感じ
- 見出しの取り出しは`unified`が作った`HTML`を`js-dom`に渡して`querySelector(h1)`みたいにしていた
  - が、`unified`のノード捜索ライブラリに置き換えできた。
- markdown に html ベタ書きのときがしんどかった
- 壊れてないか確認するのが！！！
  - Playwright を使ったりもした

## 事件簿

### 書き直しで不要になったライブラリ削除
https://www.npmjs.com/package/depcheck

`npx depcheck`すると、未利用のライブラリを探してくれるらしいです。  
というわけでグローバルインストールして、

```shell
npm install -g depcheck
```

`Next.js`プロジェクト内でターミナルを開いて以下を実行。

```shell
npx depcheck
```

こんな感じ！！！

```shell
PS C:\Users\takusan23\Desktop\Dev\NextJS\ziyuutyou-next> npx depcheck
Unused dependencies
* jsdom
* rehype-pretty-code
* rehype-slug
```

### シンタックスハイライト
今まで`rehype`がやっていたのを、自分で`shiki`を使うようにするだけ。  
自分で作れるようになったので、コピーボタンを差し込む方法も簡単です。

```ts
import { codeToHtml } from "shiki"

/** ShikiCodeBlockRender へ渡す Props */
type ShikiCodeBlockRenderProps = {
    /** コード本文 */
    code: string
    /** 言語。未指定の場合は plaintext */
    language?: string
}

/** shiki を使ってシンタックスハイライトした後描画するコードブロック */
export default async function ShikiCodeBlockRender({ code, language }: ShikiCodeBlockRenderProps) {
    const syntaxHighlightingCode = await codeToHtml(
        code.trimEnd(),
        {
            lang: language ?? 'plaintext',
            theme: 'dark-plus'
        }
    )
    // この pre にスクロールバーと padding
    return <div className="[&>pre]:overflow-x-scroll [&>pre]:p-4" dangerouslySetInnerHTML={{ __html: syntaxHighlightingCode }} />
}
```

一点、何故かビルドするとたまによくエラーになる時があった。もう一回コマンドを叩くと、今度は成功するしで、再現性が。。  
そもそも try-catch したので、例外は catch されるはずなんですが、何故か例外で`next export`が失敗してしまう。

```shell
ShikiError: Language `gradle` is not included in this bundle. You may want to load it from external source.
```

成功するときは成功するので謎、、  
とりあえず、言語がロードされてないってことだったので、全部ロードするように。

```tsx
/**
 * シングルトンにする。
 * よく分からないけど、明示的にすべて読み込むようにしないと、たまによくビルドがが成功しない。
 * https://shiki.style/guide/install#highlighter-usage
 */
const highlighterPromise = createHighlighter({
    themes: Object.keys(bundledThemes),
    langs: Object.keys(bundledLanguages)
})

/** shiki を使ってシンタックスハイライトした後描画するコードブロック */
export default async function ShikiCodeBlockRender({ code, language }: ShikiCodeBlockRenderProps) {
    const trimCode = code.trimEnd()
    const option = {
        lang: language ?? 'plaintext',
        theme: 'dark-plus'
    }

    const highlighter = await highlighterPromise
    let syntaxHighlightingCode: string
    try {
        // Markdown のコードブロックの言語を尊重する
        syntaxHighlightingCode = highlighter.codeToHtml(trimCode, option)
    } catch (e) {
        // 失敗したら plaintext で再試行
        console.log(`言語 ${option.lang} のシンタックスハイライトに失敗しました。plaintext にします。`)
        syntaxHighlightingCode = highlighter.codeToHtml(trimCode, { ...option, lang: 'plaintext' })
    }

    return (
        <div className="relative group">
            <div className="[&>pre]:overflow-x-scroll [&>pre]:p-4 [&>pre]:my-4" dangerouslySetInnerHTML={{ __html: syntaxHighlightingCode }} />
        </div>
    )
}
```

### heading の id 属性
`rehype`時代は、`rehype-slug`を使うことで、`h1 等`を作る際に自動的に`id`属性を付与してくれてました。  
が、自前で描画するする場合は利用できません。頑張りましょう。

今まで使ってたやつと同じように`h1/h2`から`id`を作りたいので、何を使っているか見てきました。  
`hast-util-to-string`したものを、`github-slugger`に渡してそうです。

というわけで、インストールして、

```shell
npm i hast-util-to-string
npm i github-slugger
```

`h1`たちを描画しているクラスでこんな感じです。  
インスタンスを作って、`slugger.slug()`を使う。

```ts
import { ReactNode } from "react"
import GithubSlugger from "github-slugger"
import { toString } from "hast-util-to-string"
import type { Element } from "hast"

/** 見出しの id 属性作成 */
const slugger = new GithubSlugger()

/** HeadingElement に渡す Props */
type HeadingElementProps = {
    /** h1 ~ h6 のどれか */
    tagName: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    /** id 属性作成のために h1 等のそれ自身を */
    element: Element
    /** 子。文字だと思う */
    children: ReactNode
}

/** h1 から h6 までを描画する。見出しはこっちで付与します。rehype-slug 実装相当です。 */
export default function HeadingElement({ tagName, element, children }: HeadingElementProps) {
    const id = slugger.slug(toString(element))
    switch (tagName) {
        case "h1":
            return <h1 id={id} className="text-2xl text-content-primary-light">{children}</h1>
        case "h2":
            return <h2 id={id} className="text-xl text-content-primary-light">{children}</h2>
        case "h3":
            return <h3 id={id} className="text-lg text-content-primary-light">{children}</h3>
        case "h4":
            return <h4 id={id} className="text-content-primary-light">{children}</h4>
        case "h5":
            return <h5 id={id} className="text-content-primary-light">{children}</h5>
        case "h6":
            return <h6 id={id} className="text-content-primary-light">{children}</h6>
    }
}
```

### リストのドットの位置
ドットの下に改行されてほしくない。

![css](https://oekakityou.negitoro.dev/original/9348d7e7-74fc-4ecc-893d-c8d55a0fce2d.png)

で、色々見てみたけど、よく分からなかったため、`m-[revert] p-[revert]`しました、、

```tsx
  // 箇条書き
  case "ul":
      return <ul className="list-disc m-[revert] p-[revert]">{childrenHtml}</ul>
  case "li":
      return <li>{childrenHtml}</li>
```

![css](https://oekakityou.negitoro.dev/original/5351e26c-6b80-4479-97e2-d2a42ad8379c.png)

### リンクカード
リンクカードを作りました。じゃーん！！

![リンクカード](https://oekakityou.negitoro.dev/original/85695bee-6daf-48af-a95b-830975393a11.png)

実装は、`静的サイト書き出し時`にリンクカードのリンクの`HTML`取得し、`OGP`を取り出してブログ記事に埋め込んでいます。  
なのでリンクカードは埋め込んだ状態で`HTML`ができます。

書き出し時に取得するため**時間がかかる**のと、相手のサイトに**若干迷惑**かも。  

```ts
html = await fetch(
    url,
    {
        headers: [
            ['User-Agent', `GET_LINKCARD_${EnvironmentTool.BASE_URL}`]
        ],
        cache: 'force-cache',
        next: { revalidate: false }
    }
).then((res) => res.text())
```

`Next.js`が`fetch() API`を独自に拡張しているのを思い出したので、引数に永遠にキャッシュするように指示してみました。  
あと`User-Agent`も適当に自前のを。開発中はマシになってるはず・・？

多分この指定でいいんじゃないかなあ、、、  
(v13あたりでデフォキャッシュだったのが、反発あったのかもとに戻ったんですね)

`HTML`のパースですが、`unified`の`rehype`の`rehype-parse`ライブラリを使いました。  
`jsdom`で`ブラウザ JS`の`querySelector()`とかを使って辿っていく方法もあると思います、が、`unified`入れてるならこれでいいかって。  

```ts
/**
 * 文字列の HTML から unified HTML AST を作成する
 * 
 * @param html HTML
 * @returns 要素の配列
 */
static parseHtmlAstFromHtmlString(html: string) {
    // fragment: true で html/head/body が生成されないように
    const rephypeProsessor = unified()
        .use(rehypeParse, { fragment: true })
    const hast = rephypeProsessor.parse(html)
    return hast.children
}
```

返り値、`HTML`をオブジェクトで表現して返してくれるので、`filter()`とかで探していけばよいはず。  

```ts
const hast = MarkdownParser.parseHtmlAstFromHtmlString(html)
const metaElementList = hast
    .filter((element) => element.type === "element")
    .filter((element) => element.tagName === "meta")

// それぞれ取り出す
const ogTitle = metaElementList.find((element) => element.properties['property'] === 'og:title')?.properties['content']?.toString()
const ogDescription = metaElementList.find((element) => element.properties['property'] === 'og:description')?.properties['content']?.toString()
```

実際に描画している箇所は`LinkCardRender.tsx`です。

### 等幅フォント
コードブロック用に等幅フォントを用意しました。これでコンソールの結果を貼り付けたときに綺麗に整列するはず。  
`Web フォント`をこれ用に読み込むことになるので、、すいません。

![コードブロック](https://oekakityou.negitoro.dev/resize/b4578a02-afe2-4ec5-9637-86242a8c492d.png)

使わせていただいているフォントは`Kosugi Maru`です、  
昔からの`Android`ユーザーですか？`モトヤマルベリ`ってフォントです。

### script
https://zenn.dev/catnose99/articles/329d7d61968efb

`<script>`を`Markdown`に貼り付けても動くようになりました。  
やっていることは先駆者さんのマネです。先述の通り今回自前で`JSX`使って書いてるので、先駆者さんの技が使えるようになりました。

```tsx
export default function ClientScriptRender({ src, type, children }: ScriptRenderProps) {

    // クライアントで描画されたときに src / type をセットする
    // next/link の画面遷移では <script> のスクリプトが起動しない
    const divRef = createRef<HTMLDivElement>()
    useEffect(() => {
        // すでに div に追加していれば何もしない
        if (divRef.current?.querySelector('script')) return
        // 作成
        const scriptElement = document.createElement('script')
        scriptElement.src = src ?? ""
        scriptElement.type = type ?? ""
        // 追加
        divRef.current?.append(scriptElement)
        // 一応消しておく
        return () => { divRef.current?.removeChild(scriptElement) }
    }, [])

    return (
        <div ref={divRef}>
            {children}
        </div>
    )
}
```

### テストコード
あれもこれも欲しい！！！って自前で描画しているので、本当に期待通りに動いているか心配になってきます。  
というわけで、テストコードがついに導入されました。

`unified`を信じていたので今まではテストコードありませんでした。 🦁 !!!!!!!!!!  
が、不安しか無い + 数日後の私は覚えてないので、期待通りに動いているかをコマンド一発で確認できるようにしました。  🦁...

テスト実行は`jest`か`vitest`の２つがあるそうですが、`ES Modules`に対応している`vitest`でやりました。  
もう我々のユーザーランドから見て直せねえだろてエラーまいった。

ところで、このマークダウンを自前で描画している`コンポーネント`、`async function()`なんですよね。出来るか・・？  
って思って色々やってたら出来ました。いや私のがたまたま動いただけかもしれない。どっちにしろ**エラー消えないけど**、

```ts
/** npm run test で実行できます */
describe('<MarkdownRender /> のテスト', () => {
    // テスト実行で一回だけ
    beforeAll(() => {
        // next/font がエラーになるのでモック
        vi.mock('next/font/local', () => ({
            default: () => ({ className: '', style: { fontFamily: '' }, variable: '' })
        }))
    })
    // 前回の render() 結果が消えるように
    afterEach(() => {
        cleanup()
    });
    test('文字が描画できる', async () => {
        // よく分からないですが、act() + <Suspense> で async function もテストできた
        // https://github.com/testing-library/react-testing-library/issues/1209
        await act(async () => {
            render(
                <Suspense>
                    <MarkdownRender markdown='text' />
                </Suspense>
            )
        })
        expect(screen.getByText('text')).toBeDefined()
        expect(screen.getByText('text').tagName).toBe('P')
    })
})
```

```shell
A component was suspended by an uncached promise. Creating promises inside a Client Component or hook is not yet supported, except via a Suspense-compatible library or framework.
```

`await act()`で囲えって言われたので囲った。  
`<Suspence>`は`Issue`がそうしていたので真似した。これをやっても謎のエラーが出る。  
https://github.com/testing-library/react-testing-library/issues/1209

謎のエラーがでていますが、一応動いているので、まあ良いか。

```shell
stderr | __test__/MarkdownRender.test.tsx > <MarkdownRender /> のテスト > HTML に style が書かれていたら自分で描画するのを辞める
A component was suspended by an uncached promise. Creating promises inside a Client Component or hook is not yet supported, except via a Suspense-compatible library or framework.

 ✓ __test__/MarkdownRender.test.tsx (25 tests) 365ms
   ✓ <MarkdownRender /> のテスト > 文字が描画できる 47ms
   ✓ <MarkdownRender /> のテスト > 太字が描画できる 55ms
   ✓ <MarkdownRender /> のテスト > 打ち消し線が描画出来る 9ms
   ✓ <MarkdownRender /> のテスト > 斜線が描画できる 8ms
   ✓ <MarkdownRender /> のテスト > <p> が描画できる 12ms
   ✓ <MarkdownRender /> のテスト > <span> が描画できる 13ms
   ✓ <MarkdownRender /> のテスト > <sup> が描画できる 7ms
   ✓ <MarkdownRender /> のテスト > 改行できる 7ms
   ✓ <MarkdownRender /> のテスト > リンクが描画できる 19ms
   ✓ <MarkdownRender /> のテスト > リンクカードの取得に失敗した 17ms
   ✓ <MarkdownRender /> のテスト > リンクカードの取得に成功した 23ms
   ✓ <MarkdownRender /> のテスト > <section> を描画できる 6ms
   ✓ <MarkdownRender /> のテスト > 引用できる 7ms
   ✓ <MarkdownRender /> のテスト > 折りたたみ要素が描画できる 9ms
   ✓ <MarkdownRender /> のテスト > 区切り線が描画出来る 6ms
   ✓ <MarkdownRender /> のテスト > 画像が描画できる 8ms
   ✓ <MarkdownRender /> のテスト > 箇条書きが描画できる 15ms
   ✓ <MarkdownRender /> のテスト > テーブルが描画できる 13ms
   ✓ <MarkdownRender /> のテスト > 見出しが描画できる 25ms
   ✓ <MarkdownRender /> のテスト > コードブロックが描画出来る 16ms
   ✓ <MarkdownRender /> のテスト > <code> が描画できる 8ms
   ✓ <MarkdownRender /> のテスト > <script> が挿入される 5ms
   ✓ <MarkdownRender /> のテスト > <iframe> が挿入される 15ms
   ✓ <MarkdownRender /> のテスト > 自前で描画しないタグも描画できる 6ms
   ✓ <MarkdownRender /> のテスト > HTML に style が書かれていたら自分で描画するのを辞める 7ms

 Test Files  1 passed (1)
      Tests  25 passed (25)
   Start at  01:11:34
   Duration  8.24s

 PASS  Waiting for file changes...
       press h to show help, press q to quit
```

そういえば、`App Router`ならテストファイルを実際のコンポーネントのファイルの近く（`コロケーション`と呼ぶ考えらしいです）に置けるのですが、忘れてました。

### VRT
一度きりだけですが、`Playwright`を使って一応スクリーンショットテストを前と後でやりました。  
全部は見れてないですが、大きく崩れていないことは確認しています、、

実行する前に`Google アナリティクス`など、集計に影響が出ないか皆さん確認しましょうね。

![実行中](https://oekakityou.negitoro.dev/original/fa8e6cef-ec6f-44f9-a0d3-da8578498728.png)

こんな感じにスクショの差分がでてくる。  
細かい`padding`とかが影響してるっぽかった。

![差分](https://oekakityou.negitoro.dev/original/1aa047b4-023b-4857-9e50-9933815c125a.png)

![差分](https://oekakityou.negitoro.dev/original/be2416f3-7e67-4a2f-bb25-4665ae6d01dd.png)

# 関連記事
話変わって。  
関連する記事を記事本文の末尾に表示するようにしてみました。  
ぜひ見ていってください。

![関連記事](https://oekakityou.negitoro.dev/original/bb18af03-97d9-4de2-8864-c1696dc67256.png)

関連記事の検索ですが、タグを基準にしています。  
今の記事についているタグが含まれている数順で表示しています。  
`tagNameList.includes()`の部分で同じタグの数を数えて、多いのが上に来るように並び替え。

```ts
/**
 * 関連する記事を取得する
 * タグを基準に、新しい順で。
 * 
 * @param excludeUrl 除外する URL。自分のこと。
 * @param tagNameList タグの配列
 * @param maxSize 最大件数
 * @returns BlogItem[]
 */
static async findRelatedBlogItemList(excludeUrl: string, tagNameList: string[], maxSize: number) {
    const blogList = await this.getBlogItemList()
    // 関連しているかの判断は、引数に渡したタグが、何個一致しているか
    // 記事は新しい順
    const relatedBlogItemList = blogList
        // タグ無いとかは弾いておく
        .filter((blogItem) => blogItem.link !== excludeUrl && blogItem.tags.length !== 0)
        // 関係ない記事が出そうなので、2つ以上一致しているとき
        // 一旦件数と Pair する
        .map((blogItem) => {
            const containsTagCount = blogItem.tags.filter((tagName) => tagNameList.includes(tagName)).length
            return { containsTagCount, blogItem }
        })
        .filter((pair) => 2 <= pair.containsTagCount)
        // 一致している順
        .sort((a, b) => b.containsTagCount - a.containsTagCount)
        // 返すときは BlogItem[] に戻す
        .map((pair) => pair.blogItem)
        .splice(0, maxSize)
    return relatedBlogItemList
}
```

# 前後の記事
↑に関連していますが、前後の記事を表示するようにしました。  
本当は関連記事だけで良いかな～～って思ってたんですが、関連記事のリストを幅いっぱいに引き伸ばしたらイマイチだった。

というわけで、関連記事のリストを`50%`、で、余った残り`50%`は・・？  
で色々何が出来るか`Figma`でお絵かきしてみました。

![案](https://oekakityou.negitoro.dev/original/057a1026-3f0e-43a0-9416-76a0c8694a7c.png)

この時点でよくある、前後の記事を表示する案はもちろんあったのですが、良いデザインが思いつかなった。  

残り何も書かないのはやっぱ嫌だなあ・・・って考えてみた結果。  
前後・・・矢印・・・左右・・・道路標識！？！？？！？！（←？）

というわけで`道案内 UI`的なのが誕生し、なんかいい感じだったので採用。  
ただ前後の記事をボタンで表示するのは・・やだなーって感じだったので良かったかも。

![採用](https://oekakityou.negitoro.dev/original/9221e899-695a-48e7-a07d-2f7b70e88557.png)

# max-width
あんまり全画面にしないので分からなかったんですが、全画面で見ると、引き伸ばされてイマイチ・・・？  
なので、よくある`max-width`を設定するようにしました。  
コードブロックがはみ出たので、`w-full`を`max-width`と一緒に付与する必要があるかもです。

![一覧](https://oekakityou.negitoro.dev/original/ede6d2cf-1d96-488a-b96c-59da6b675159.png)

![本文](https://oekakityou.negitoro.dev/original/717a6179-ab1d-4016-9f35-6d131be44cf5.png)

## 余ったので
落書きした。パソコンみたいに幅が広くないとでません。

![svg](https://oekakityou.negitoro.dev/original/5cd1d706-8b75-49e5-803b-4c8ecdcbbb1c.png)

`CSS`でアニメーション入れてる。かえって気になっちゃうようなら消そうかな。

# 記事に戻るボタン
スマホだとハンバーガーメニューを押して、記事一覧を押す必要があった。  
もっと手軽に一覧に移動できるようにした。

![戻るボタン](https://oekakityou.negitoro.dev/original/d1997f04-49e3-4587-8bb4-fbbe5868409b.png)

# ダークモード切り替えにデバイス設定に従うを追加
特に言うことはないですが、追加しました！

![テーマ切り替え](https://oekakityou.negitoro.dev/original/2f552dd0-23e7-49bb-a294-ebe77472bd43.png)

# タグ記事一覧画面でもページネーション
`Android`の記事増えてきたのでいい加減やりました。  

![タグページ](https://oekakityou.negitoro.dev/original/fbf6a1e0-426b-4809-b468-d7f128d69a27.png)

ページは配列の配列で表現しているのですが、`Kotlin`の`Collection#chunked`みたいな、指定した数で配列の配列を作る関数が欲しかった。  
調べたら`Stackoverflow`にドンピシャのがあったので使わせてもらってます。

```ts
private static chunkedPage<T>(origin: T[], size: number) {
    return origin
        .map((_, i) => i % size === 0 ? origin.slice(i, i + size) : null)
        .filter((nullabeList) => nullabeList !== null)
}
```

# img を押したら別のタブで画像を開く
は、`loading="lazy"`と一緒に対応したのですが、また動いてません！！！  
最近の画像を配信している`S3+CloudFront`の手直しが必要そうでした！！！

# next.config.ts TypeScript にした
https://nextjs.org/docs/pages/api-reference/config/typescript#type-checking-nextconfigts
ついでに`CJS`から`ESM`の書き方になっていたので、追従することに

# デプロイする
人がいないタイミングを狙います。  
日曜の深夜とか良いんじゃねって思ったんですが普通に頭痛が痛くて断念（`Pull Request`をマージするだけ）

## Please install @types/node by running
まじで今まで見たこと無いエラーだ。

```plaintext
Please install @types/node by running:

	npm install --save-dev @types/node

If you are not trying to use TypeScript, please remove the tsconfig.json file from your package root (and any TypeScript files in your app and pages directories).
```

で、なんでこのエラーが出たかというと、`process.env.NODE_ENV`を利用したから。らしい。  
解決方法は書いてあるとおりで、`@types/node`を入れればよいです。

## ローカルだと動いてたのはなぜ～
**@types/node がグローバルインストールされたてた**

![グローバルインストール](https://oekakityou.negitoro.dev/original/789d2162-b5d3-458c-88cd-0ebdc8df9b4d.png)

グローバルインストールの`node_modules`を消したらちゃんとエラーになりました。（エラー出て喜んでるの草）

![エラー](https://oekakityou.negitoro.dev/original/7eff7ccc-1f03-4712-90fd-9abbb3041767.png)

ちなみに`Next.js`だけかも？ですが、  
自分で入れなくても`npm run dev`したら勝手に追加されました。私の場合はグローバルインストールされてて追加してくれませんでしたが。

# おわりに
`Next.js`も`React`も、結構親切なエラーメッセージを出してくれます。
が、たまに内容 0 のエラーが表示されるときがあります。

これは多分`Turbopack`が原因っぽいので、`Turbopack`無しで開発サーバーを起動すればよいと思います。

![Turbopack](https://oekakityou.negitoro.dev/original/4e718690-18c4-467f-abff-a6a1f4ad2135.png)

`webpack`だとこう

![webpack](https://oekakityou.negitoro.dev/original/f439e899-900f-4f2d-b2dd-2dc33672a5d1.png)

おわり！！！

# おわりに2
https://nextjs.org/blog/next-15-3

`Turbopack`が開発時（開発サーバー）以外にも、本番の静的書き出し（ビルド）が出来るようになったそうです。  
ただ、このブログでは以下の`Issue`と同じ理由でまだ使えません。。

https://github.com/vercel/next.js/issues/68667