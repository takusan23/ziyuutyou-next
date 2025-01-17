---
title: Next.jsへGoogleアナリティクスのGA4とUAを共存させる
created_at: 2022-01-16
tags:
- Next.js
- GoogleAnalytics
---

どうもこんばんわ。  

キスから始まるギャルの恋 〜くるみのウワサとホントのキモチ〜 攻略しました。

いいね！次回作も予約した

![Imgur](https://i.imgur.com/kBGvFeJ.png)

丁寧に書かれてて？良かったと思います

![Imgur](https://i.imgur.com/gZpbJXu.png)

# 本題

GoogleアナリティクスからGA4を使ってみませんかって定期的にメールでお知らせしてくるので対応してみた。  
Next.jsで作り直した記念に

# 環境

| なまえ  | あたい                                                                       |
|---------|------------------------------------------------------------------------------|
| Windows | 10 Pro                                                                       |
| Next.js | 記述時時点最新版                                                             |
| React   | 17                                                                           |
| 言語    | TypeScript。JavaScriptの場合はコピペ出来ないのでにらめっこして書き換えて；； |

# 参考

thx!!!!!

https://github.com/vercel/next.js/tree/main/examples/with-google-analytics

https://panda-program.com/posts/nextjs-google-analytics

## GA4 と UA はぜんぜん違う？
なんか後継みたいな雰囲気（なぜか変換できない（できてる））出してますが、UIからして結構違うシステムらしい？  
なんなら`ユニバーサルアナリティクス (UA)`時代に集計したデータは`Google アナリティクス 4 (GA4)`には引き継げないみたいですよ？

データがGA4に引き継げないのはしんどいので、とりあえずは`ユニバーサルアナリティクス`と`Google アナリティクス 4`の同時利用で行きます（同じ結果が集計されるはず）。

(ちょっと時間が経っちゃったからうろ覚え)

## 単語集

| きー                       | ばりゅー                                                   |
|----------------------------|------------------------------------------------------------|
| ユニバーサルアナリティクス | 略してUA。設定を開いた際に`GA4 設定アシスタント`があればUA |
| Google アナリティクス 4    | 略してGA4。リアルタイムのページに地図が表示されていればGA4 |
| 測定 ID                    | GA4で使うID。 **G-** から始まる                            |
| トラッキングコード         | UAで使うID。 **UA-** から始まる                            |

# 既存のユニバーサルアナリティクスでGA4を有効にする
ブラウザでUAの方の設定画面を開いて、`Google アナリティクス 4 プロパティの設定アシスタント`を選んで、始めます

![Imgur](https://i.imgur.com/FPOrU2F.png)

こんな画面が出るけど、今回は UA → GA4 へイベントの転送は行わずに、それぞれ対応するのでチェックマークはそのままにして、プロパティを作成をおします。  
(自分でHTMLを書き換えることが出来ない場合のための処置だと思う)

![Imgur](https://i.imgur.com/pv04NvW.png)

作成できるとGA4の管理ページへ移動できるボタンが現れるのでそのままおします。

![Imgur](https://i.imgur.com/FB4Gd2Y.png)

移動したら、`タグの設定`を押して、一つだけデータストリームがあると思うのでそれを選択します。

![Imgur](https://i.imgur.com/hpg4USI.png)

そしたら、表示されている`測定 ID`を控えます。`G-`から始まるやつですね。

![Imgur](https://i.imgur.com/pTpOTPf.png)

## Next.js(のnext/router)でも動くように対応する
`測定 ID`を控えた画面にある歯車マーク⚙を押して、拡張計測機能の設定をします。  
ここの`ページビュー数`の`詳細設定`を押して、**ブラウザの履歴イベントに基づくページの変更**のチェックマークを外して、保存を押します。

![Imgur](https://i.imgur.com/SciZSld.png)

### なぜ？

`Next.js 等のJSフレームワーク`では画面を動的に書き換えて（ブラウザのロードを挟まない）画面遷移が行われるため、Googleアナリティクスではページ遷移イベントを捕捉出来ません。  
ので、自分でページ遷移イベントを送信する必要があるのですが、なんか**GA4**にロードを挟まない遷移を捕まえることが出来るようになったらしく、このままでは二重で計測されてしまう。  
そこで**GA4**の計測の設定を変えます。

もしかしたら、上記のチェックマークをONにしておくと、ページの変更イベントをわざわざ送信する必要もなくなるかもしれないけど、UAと合わせたいので今回はOFFで行きます。

## (analytics.js から gtag.js へ移行する)
もし`gtag.js`で書いていた場合はここは飛ばしていいと思います。  

UAの方の設定画面を開いて、**トラッキング情報 > トラッキングコード**へ進み、**トラッキング ID**をコピーします。`UA-`から始まるやつですね。

## Next.js での作業
`_app.tsx`(jsxかもしれん)を開きます。  
作っていない場合は他調べて作って下さい。

そしたら、以下を参考に書いて下さい（まるなげ）  
analytics.js時代のコードは消しちゃえ～。  
定数`UA_TRACKING_ID`の中には各自UAのトラッキングIDを入れて下さい。

```tsx

// 各自ここに UA トラッキング ID
const UA_TRACKING_ID = `UA-`

const App = ({ Component, pageProps }) => {
    return (
        <>            
            {/* Google アナリティクス GA4 / UA */}
            <Head>
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${UA_TRACKING_ID}`}></script>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${UA_TRACKING_ID}');
                    `}}
                />
            </Head>

            <Component {...pageProps} />
        </>
    )
}
export default App
```

# gtag.js に GA4 も計測するように書き足す
`gtag('config', '${UA_TRACKING_ID}');`と同じ様にGA4の測定 IDを登録します。  
`gtag.js`を読み込んでる`<script>`タグはそのままUAのを使えるみたいです。

以下例：

```tsx
// 各自ここに UA トラッキング ID
const UA_TRACKING_ID = `UA-`
// 各自ここに GA4 測定 ID
const GA_TRACKING_ID = `G-`

const App = ({ Component, pageProps }) => {
    return (
        <>            
            {/* Google アナリティクス GA4 / UA */}
            <Head>
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${UA_TRACKING_ID}`}></script>
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

            <Component {...pageProps} />
        </>
    )
}
export default App
```

## Next.jsの next/script 使えないの？
これ使うと`<body>`内に`<script>`埋め込んでるっぽいんだけどどうなんだろう。Googleアナリティクスは`<head>`内に書いてって言われてるので...

## UAの gtag.js 転用して使えんのかよwww

既存の gtag.js を読み込んでいる場合は**GA4の測定IDを登録する一行**をそのまま書き足せばOKらしい。やるやん

<https://support.google.com/analytics/answer/9310895?hl=ja&utm_id=ad#which_product&zippy=%2Cこの記事の内容>

# next/router のページ遷移イベントを登録する
このままだと初回の読み込みは正しく送信されますが、ページを切り替えた際には対応できません。  
ので`next/router`の遷移イベントをGA4とUAへ飛ばします。

以下例：  
TSなのに`as any`してるから参考にするには良くないかも。  
JavaScript派閥の方はTypeScriptの型注釈(とキャスト)を消して、どうぞ。

```tsx
// 各自ここに UA トラッキング ID
const UA_TRACKING_ID = `UA-`
// 各自ここに GA4 測定 ID
const GA_TRACKING_ID = `G-`

/**
 * ページ遷移のたびに呼ぶ
 * 
 * @param {string} url うらる
 */
const pageview = (url: string) => {
    // 多分 UA と GA4 両方それぞれ送信しないといけない
    (window as any).gtag('config', UA_TRACKING_ID, {
        page_path: url,
    });
    (window as any).gtag('config', GA_TRACKING_ID, {
        page_path: url,
    });
}

const App = ({ Component, pageProps }) => {

    // Google アナリティクスへページ遷移を通知
    const router = useRouter()
    useEffect(() => {
        const handleRouteChange = (url: string) => {
            pageview(url)
        }
        router.events.on('routeChangeComplete', handleRouteChange)
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [router.events])

    return (
        <>            
            {/* Google アナリティクス GA4 / UA */}
            <Head>
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${UA_TRACKING_ID}`}></script>
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

            <Component {...pageProps} />
        </>
    )
}
export default App
```

これで多分対応は終了です。  
GA4とUAそれぞれ開いて、ちゃんとリアルタイムに現れたら成功だと思います。

## 番外編 GoogleAnalytics.tsx にまとめる編

`_app.tsx`が長くなるとしんどいので分けておくと良いと思います。  
ついでに本番環境のみGoogle アナリティクスを動作させるようにしました。

```tsx
// GoogleAnalytics.tsx

/** Google アナリティクス (UA) の 測定ID */
export const UA_TRACKING_ID = `UA-`

/** Google アナリティクス (GA4) の 測定ID */
export const GA_TRACKING_ID = `G-`

/** 開発モード。本番（意味深）だけアナリティクスを動作させるため */
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * ページ遷移のたびに呼ぶ
 * 
 * @param {string} url うらる
 */
const pageview = (url: string) => {
    // 本番のみ実行
    if (isDevelopment) {
        return
    }
    (window as any).gtag('config', UA_TRACKING_ID, {
        page_path: url,
    });
    (window as any).gtag('config', GA_TRACKING_ID, {
        page_path: url,
    });
}

/** Google Analytics へnext/routerのページ遷移の状態を通知する */
export const useGoogleAnalytics = () => {
    // Google アナリティクスへページ遷移を通知
    const router = useRouter()
    useEffect(() => {
        const handleRouteChange = (url: string) => {
            pageview(url)
        }
        router.events.on('routeChangeComplete', handleRouteChange)
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [router.events])
}

/** Google Analytics 4 で利用するJavaScriptを差し込むやつ。本番（意味深）のみ実行 */
export const GoogleAnalyticsHead = () => {
    return (
        <>
            {!isDevelopment && <Head>
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${UA_TRACKING_ID}`}></script>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${UA_TRACKING_ID}');
                        gtag('config', '${GA_TRACKING_ID}');
                    `}}
                />
            </Head>}
        </>
    )
}
```

これを`_app.tsx`で呼ぶようにすればおっけ

```tsx
import { GoogleAnalyticsHead, useGoogleAnalytics } from '../src/GoogleAnalytics'

const App = ({ Component, pageProps }) => {

    // GoogleAnalyticsへnext/routerのページ遷移を通知する。
    useGoogleAnalytics()

    return (
        <>            
            {/* Google アナリティクス GA4 / UA */}
            <GoogleAnalyticsHead />

            <Component {...pageProps} />
        </>
    )
}
```

もしパクった場合は本番環境のみで動くので、動いてるか確認したい場合は

```
npm run build
npm run start
```

すれば本番環境のビルド成果物をホストした開発サーバーが立ち上がります。

![Imgur](https://i.imgur.com/DwEizfq.png)