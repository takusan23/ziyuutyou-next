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

## nuxt/content で使ってた機能
- リアルタイム更新

## Intの割り算だと思ったらFloatだった
そう言えばJSってnumberしか無かったわ。  
数十分消し飛んだ。

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
