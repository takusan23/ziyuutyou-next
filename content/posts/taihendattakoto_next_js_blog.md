---
title: Next.jsでブログを作った際に大変だったこと
created_at: 2022-01-04
tags:
- Next.js
- TypeScript
- 自作ブログ
---

## Nuxt.js からの移行
- URLの末尾にスラッシュを付ける
    - 知らんけどONにしておく

### nuxt/content で使ってた機能
- 記事書いてるときのリアルタイム更新
    - いらないと言えばいらないかも...

## Intの割り算だと思ったらFloatだった
ReactとかNext.js以前の問題だったわ

## remark() と rehype() 
- remark
    - Markdown処理系
- rehype
    - Html処理系

```ts
// マークダウン -> unified -> HTML 
const remarkParser = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(remarkGfm)
    .use(rehypeStringify)
    .use(rehypeHighlight, {
        // 利用できない言語の場合はエラー出さずに無視
        ignoreMissing: true
    })
    .process(matterResult.content)
const markdownToHtml = remarkParser.toString()
```

### Markdownのテーブル（表）、打ち消し線、URLの自動リンク機能は標準機能ではない！

すべて有志の拡張機能だったんですね。  
というわけで、`remark-gfm`を入れます。

```
npm i remark-gfm
```

あと表には CSS を当てないと見ずらいですね。

```css
table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    margin: 10px;
}

table tr {
    border-bottom: solid 1px #000;
}

table td {
    padding: 10px;
    text-align: center;
}
```

### Markdownに埋め込んだHTMLも対応させる

`npm i rehype-raw`で対応できます

## getStaticPaths と getStaticProps の動的ルーティング

`[ここの名前].tsx`←ここの名前 の部分がキーになります。注意して下さい


```ts
// getStaticPaths

const pathIdList = []
for (let i = 0; i < requirePageCount; i++) {
    // この場合はキーが page になるけどこれはファイル名によって変わる（[page].tsxだから）
    pathIdList.push({ params: { page: `${i}` } })
}
return {
    paths: pathIdList,
    fallback: false
}
```

```ts
// getStaticProps
export const getStaticProps: GetStaticProps<BlogListPageProps> = async context => {
    // posts/page/<ここ> を取得
    const pageId = parseInt(context.params["page"] as string) //[page].tsx だから page
    // 省略...
```

## ReactのJSX(TSX)の中で条件付きレンダリング
これ使っていいのか知らんけど面白いので使ってます。  
`Jetpack Compose`と違って、returnでJSXを返す必要があるんだけどJSX内ではifが書けない。  
代わりに`&&`を使って左側がtrueの場合は右側に進むことを利用した方法でかける。かしこい！

https://ja.reactjs.org/docs/conditional-rendering.html#inline-if-with-logical--operator

```tsx
const ExpandedText = () => {
    const [isExpanded, setExpanded] = useState(false)

    return (
        <>
            <p>Hello</p>
            {
                isExpanded && <p>World</p>
            }
            <Button onClick={()=> setExpanded(!isExpanded)}>
                Open!
            </Button>
        </p>
    )
}
```

## ダークモード
`MUI`の機能でできます。  
一応色置いておきます。

```tsx
const useCustomTheme = (isDarkmode: boolean) => {
    // isDarkmode が変わったときだけ再計算されるはず
    return React.useMemo(
        () => createTheme({
            palette: {
                mode: isDarkmode ? 'dark' : 'light',
                primary: {
                    main: isDarkmode ? '#b6c4ff' : '#4559a9', // md_theme_light_primary
                },
                secondary: {
                    main: '#006c49',
                },
                error: {
                    main: '#ba1b1b',
                },
                background: {
                    default: isDarkmode ? '#000000' : '#dce1ff', // md_theme_light_primaryContainer
                    paper: isDarkmode ? '#1b1b1f' : '#fefbff', // md_theme_light_surface : md_theme_dark_surface
                }
            },
            typography: {
                fontFamily: [
                    'Koruri Regular'
                ].join(','),
            }
        }),
        [isDarkmode]
    )
}

export default useCustomTheme
```

ダークモードスイッチのイベントは`Props`でスイッチの切り替えバケツリレーしてます。  
正攻法はわからん。頻繁に使うもんじゃないしいいんじゃね？

ついでにシステム設定のダークモードも反映させるようにしました。Win10で確認した

```tsx
// _app.tsx

/**
 * Androidで言うところのActivity。この中でPages(AndroidでいうとFragment)を切り替える
 */
const App = ({ Component, pageProps }) => {
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
                    <Component {...pageProps} />
                </Layout>
            </ThemeProvider>
        </>
    )
}
```

## Android 12 みたいなスイッチ
ここに例があります。thx!!!

https://mui.com/components/switches/#customization

## SVG画像の色を簡単に変えられると思ってた
Androidだと`ImageView#setTint() だっけ？`できるけどCSSにはそういう機能無いらしい。  
なのでこういうCSSをかけばいいと思います。私もよく知らないので詳しくは 属性セレクター とかで検索してください。  
`!important`を追記すればsvg内のpath、circleの色も上書き出来ます。使っていいのかは知らんけど

```html
<svg className="svg_color">

</svg>
```

```css
.svg_color path {
    stroke: red;
}
.svg_color circle[style*="fill:none"] {
    stroke: red;
}
.svg_color circle[style*="stroke:none"] {
    fill: red;
}
```

`pages/404.tsx`参照


## サイトマップ

https://github.com/iamvishnusankar/next-sitemap 

を利用することで簡単に作成できます。  

いれて

`npm install --save-dev next-sitemap`

`package.json`があるフォルダに`next-sitemap.config.js`を作成します。  
公式では`next-sitemap.js`を作れと言ってますが、Windowsの場合は駄目だと思います。

(Windowsだとどうやら 環境変数 よりも フォルダ内ファイル が優先されるらしい)

あとはビルド時に生成するように`package.json`に追記すればおk

```
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "postbuild": "next-sitemap --config next-sitemap.config.js",
  "deploy": "npm run build && npm run postbuild && npm run export"
},
```

## Google Analytics 4 を入れる
Googleさんが定期的にメールで GA4いかが・・ ってメールで送ってくるので対応した。  

というか`GA4`、これ今までの`UA`を置き換えるやつかと思ってたんだけど、どうやら違うみたい？  
なんかユニバーサルアナリティクスで集めてた時代のデータは引き継いでくれないっぽいし何やねん・・・

```
GA4 設定アシスタント ウィザードでは、作成した GA4 プロパティが過去のデータに基づきバックフィルされることはありません。GA4 プロパティに保存されるのは、設定後に発生したデータのみです。過去のデータを参照する際は、ユニバーサル アナリティクス プロパティのレポートを使用してください。
```

<https://support.google.com/analytics/answer/9744165?hl=ja&utm_id=ad#zippy=%2Cご自身またはウェブ-デベロッパーがウェブページに手動でタグを設定する場合>

というわけで、今のところは`GA4`と`UA`の両方で集計するようにしてあります。

![Imgur](https://imgur.com/4bkbzPv)

`head`内に`GA4`のJavaScriptを差し込むようにすればいいです。
`GA_TRACKING_ID`には**GA4の測定ID**、`UA_TRACKING_ID`には**UAのトラッキングコード**を変数に入れておいて下さい。  
多分`Google アナリティクス 4 プロパティの設定アシスタント`を利用しないと駄目かも？

```tsx
<Head>
    <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}></script>
    <script dangerouslySetInnerHTML={{
        __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${UA_TRACKING_ID}');
            gtag('config', '${GA_TRACKING_ID}');
        `}}
    />
</Head>
```

なんか調べてると`next/script`でいい感じに読み込む書き方をしてる例がありますが私の環境では重複して送信されたので辞めました。

## Material-UIのアイコンを書くときの注意点
名前付きインポートだと開発環境の読み込みが遅くなります。  

```tsx
import { AndroidOutlined } from '@mui/icons-material' // これだと重くなる
```

```tsx
import AndroidOutlined from '@mui/icons-material/AndroidOutlined'
```

詳しくは：https://takusan.negitoro.dev/posts/next_js_mui_material_icon_build_speed/

今回はBabelの設定せずに個別にインポートするようにしてます。

ちなみにこれはKotlinで該当のJavaScriptを渡すと変換してくれるコード。気分次第で`Kotlin/JS`で書くかも

```kotlin
fun main() {

    val javaScriptCode = """
        
import { BookOutlined } from "@mui/icons-material"

    """.trimIndent()

    // "@mui/icons-material" の部分を取得する正規表現
    val packageRegex = "\"(.*?)\"".toRegex()
    val packageName = packageRegex.find(javaScriptCode)!!.groupValues[1]

    // { BookOutlined } の部分を取得する正規表現
    val namedImportRegex = "\\{(.*?)}".toRegex()
    val namedImportCode = namedImportRegex.find(javaScriptCode)!!.groupValues[1]
    // 複数インポートされているか
    val namedImportList = if (namedImportCode.contains(",")) {
        namedImportCode
            .split(",")
            .map { it.replace(" ", "") }
    } else {
        listOf(namedImportCode.replace(" ", ""))
    }

    namedImportList.forEach { name ->
        println("""import $name from "${packageName}/${name}" """)
    }

}
```