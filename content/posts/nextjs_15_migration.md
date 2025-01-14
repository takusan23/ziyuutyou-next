---
title: Next.js 15 に移行した
created_at: 2025-01-10
tags:
- Next.js
- TypeScript
- 自作ブログ
---
どうもこんばんわ。  
特に書くことがないのでお正月に`WSL 2`で遊んでた時の画像でもおいておきます。いつか`WSL 2`の記事も書きたい！

![Imgur](https://imgur.com/wOR9dsl.png)

# 本題

- https://nextjs.org/blog/next-15
- https://nextjs.org/blog/next-15-1

`Next.js 15`をやろうとして気付いたらあけおめ。`React 19`も`RC`が外れたのでいい加減やります。ついでに修正とかもしたいけど今は移行だけします。  
見た感じそんな複雑じゃ無さそうなので、`git`でいつでも戻せることを確認した上で、`codemod`を叩いてみる。

```bash
npx @next/codemod@canary upgrade latest
```

`Yes`、`y`で。

```plaintext
Need to install the following packages:
@next/codemod@15.1.1-canary.25
Ok to proceed? (y) y
```

お、`Turbopack`が選べる？  
でもこの`Next.js 製ブログ`は`webpack`に依存してたような、、、

```plaintext
? Enable Turbopack for next dev? » (Y/n)
```

複数の修正をやってくれるそう。矢印上下キーで移動、スペースでチェックの`ON/OFF`、`A キー`ですべて選択、`Enter キー`で`codemod`実行。

![Imgur](https://imgur.com/SnvCXSv.png)

`React 19`側の`codemod`もやるか？。やるか。

```plaintext
? Would you like to run the React 19 upgrade codemod? » (Y/n)
? Would you like to run the React 19 Types upgrade codemod? » (Y/n)
```

進めてるとデプロイ先に`Vercel`を選んでいるか聞かれた。  
静的サイトかつ`AWS`なので`n`で。

```plaintext
? Is your app deployed to Vercel? (Required to apply the selected codemod) » (Y/n)
```

なんか入れないといけないらしい。いれるか。  
`y`でエンター。

```plaintext
Need to install the following packages:
types-react-codemod@3.5.2
Ok to proceed? (y)
```

終わった。

```plaintext
✔ Codemods have been applied successfully.

Please review the local changes and read the Next.js 15 migration guide to complete the migration.
https://nextjs.org/docs/canary/app/building-your-application/upgrading/version-15
```

# 差分
`page.tsx`と`route.tsx`が

![Imgur](https://imgur.com/h1ZN106.png)

// todo github compare はる  
https://github.com/takusan23/ziyuutyou-next/commit/008f234a9ecc215f5d2afc43b469cbac40bc2f04

# package.json
`codemod`を叩いた際に`Turbopack`有効を選んだので、開発時は`Turbopack`が有効になるオプションが指定されています。

```json
  "scripts": {
    "dev": "next dev --turbopack",
```

あと一番下になにか追加されてる。

```json
"overrides": {
"@types/react": "19.0.2"
}
```

# props が Promise 経由で渡される
ページの`URL パス`（動的ルーティングのあれ）とかを関数の引数に`Props`としてつけていましたが、この`Props`が`Promise<Props>`のように、非同期で`URL`のパラメータとかが渡ってくるようになりました。

手動で直す場合は、まず各ページの引数の型を`Promise<>`でかこって、  

`async function`で`page.tsx`を書いている場合は`await props`すれば良さそう（`codemod`がそうしてた）  
https://nextjs.org/docs/app/building-your-application/upgrading/version-15#asynchronous-page

`function`で`page.tsx`している場合は、`Promise`を`React`から読み取る`React 19`の新機能、`use()`の`Hook`を使えば良いって書いてあります。  
https://nextjs.org/docs/app/building-your-application/upgrading/version-15#synchronous-page

以下`async function`な`page.tsx`を直した際の差分。

```diff
diff --git a/app/posts/[blog]/page.tsx b/app/posts/[blog]/page.tsx
index 228d44e..d6cc1a7 100644
--- a/app/posts/[blog]/page.tsx
+++ b/app/posts/[blog]/page.tsx
@@ -14,11 +14,12 @@ import "../../../styles/css/content.css"

 /** 動的ルーティング */
 type PageProps = {
-    params: { blog: string }
+    params: Promise<{ blog: string }>
 }

 /** head に値を入れる */
-export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
+export async function generateMetadata(props: PageProps): Promise<Metadata> {
+    const params = await props.params;
     const markdownData = await ContentFolderManager.getBlogItem(params.blog)
     const ogpTitle = `${markdownData.title} - ${EnvironmentTool.SITE_NAME}`
     const ogpUrl = `${EnvironmentTool.BASE_URL}${markdownData.link}`
@@ -41,7 +42,8 @@ export async function generateMetadata({ params }: PageProps): Promise<Metadata>
  * 記事本文。
  * 反映されない場合はスーパーリロードしてみてください。
  */
-export default async function BlogDetailPage({ params }: PageProps) {
+export default async function BlogDetailPage(props: PageProps) {
+    const params = await props.params;
     // サーバー側でロードする
     const markdownData = await ContentFolderManager.getBlogItem(params.blog)
```

`Route Handlers (API Routes)`の`route.ts (.tsx)`に関しても同様に`Promise`で`Props`を渡してくれる設計だそうです。  
このサイトでは`OGP画像`の生成で使ってて、静的書き出し時に`GET`リクエストされ`OGP画像`も静的書き出しされます。

```diff
diff --git a/app/posts/[blog]/opengraph-image.png/route.tsx b/app/posts/[blog]/opengraph-image.png/route.tsx
index af60d1a..488e623 100644
--- a/app/posts/[blog]/opengraph-image.png/route.tsx
+++ b/app/posts/[blog]/opengraph-image.png/route.tsx
@@ -7,7 +7,7 @@ import FileReadTool from "../../../../src/FileReadTool"

 /** 動的ルーティング */
 type PageProps = {
-    params: { blog: string }
+    params: Promise<{ blog: string }>
 }
 
 /**
@@ -17,7 +17,8 @@ type PageProps = {
  * 使える CSS は以下参照：
  * https://github.com/vercel/satori
  */
-export async function GET(_: Request, { params }: PageProps) {
+export async function GET(_: Request, props: PageProps) {
+    const params = await props.params;
     // 記事を取得
     const markdownData = await ContentFolderManager.getBlogItem(params.blog)
```

私の環境では以上で、`codemod`がすべて直してくれました。


# 実行できない
`webpack`に依存してたような、、、それで`Turbopack`にしたから動かないのかも。

```plaintext
React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: object.
React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: object.
 ⨯ [Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: object.] {
  digest: '356132257'
}
```

![Imgur](https://imgur.com/a22QZPq.png)

## SVGR で webpack を使っていたので修正する
https://nextjs.org/docs/app/api-reference/turbopack

`SVGR`は`SVG`のファイルを`React`のコンポーネントとして表示できるやつで、  
`import Icon from 'icon.svg'`みたいに`svg`を`import`するだけで、`React`のコンポーネントとして`<Icon />`みたいに使えるあれ。便利。

`Turbopack`は`webpack`使えないものだと思ってたんですが、`Turbopack`でも`@svgr/webpack`は動くって言ってる。ん？  
でも手元で動いてないんだよな  
https://nextjs.org/docs/app/api-reference/config/next-config-js/turbo

どうやらこの通りに書くと動くらしい。やってみる  
- https://nextjs.org/docs/app/api-reference/config/next-config-js/turbo#configuring-webpack-loaders
- https://github.com/vercel/turborepo/issues/4832#issuecomment-1751407444

`next.config.js`

```js
/** @type {import('next').NextConfig} */
module.exports = {
    // この webpack と
    webpack(config) {
        // SVG をコンポーネントにできる
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        })
        return config
    },
    // これを追加
    experimental: {
        turbo: {
            rules: {
                '*.svg': {
                    loaders: ['@svgr/webpack'],
                    as: '*.js',
                },
            },
        }
    }
}
```

# 開発モードで動いた
`Turbopack`、速い。。と思う。私の作りが悪い可能性も十分あるけど。

![Imgur](https://imgur.com/Jm1biay.png)

# 静的書き出し出来ない
このサイトは`Next.js`の` output: 'export'`で動いています。  
書き出した成果物を`S3`にあげ`CloudFront`でお届けしています。

## サイトマップ
`npm run build`したら次のエラーが

```plaintext
 ✓ Linting and checking validity of types    
   Collecting page data  ..Error: export const dynamic = "force-static"/export const revalidate not configured on route "/sitemap.xml" with "output: export". See more info here: https://nextjs.org/docs/advanced-features/static-html-export
    at <unknown> (C:\Users\takusan23\Desktop\Dev\NextJS\ziyuutyou-next\.next\server\app\sitemap.xml\route.js:1:1127)
```

`sitemap.ts`を静的書き出ししようとしたときのエラー。  
`export const dynamic`か`export const revalidate`が無いから怒られてる？

`export const dynamic = "force-static"`とかは、`Next.js`自体をサーバーで動かす場合（`Vercel`、`レンタルサーバー`、その他）に使うやつで、  
あらかじめ生成する静的書き出しモードだと別に指定しなくて良いんじゃないの？って思ってたけど明示的に`force-static`って書かないとだめなのかな。  
静的書き出しだとビルドコマンドを叩いた時点ですべての`HTML`が生成されるので、書かずとも全部`force-static`になるけど。

一応`Issue`見に行ったらあった。以下のように`force-static`の一文をとりあえず足したら直った。`SSG`なのに足さないと行けないのか・・？  
https://github.com/vercel/next.js/issues/68667

```ts

// 静的書き出しなので指定する必要がないはずだが、Next.js 15 から無いとエラーになってしまう
// https://github.com/vercel/next.js/issues/68667
export const dynamic = "force-static"

/**
 * サイトマップを生成する。Next.js 単体で作れるようになった。
 * Trailing Slash が有効なので最後にスラッシュ入れました。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 以下省略...
}
```

## OGP 画像に SVG を描画したらエラー
次はこれ。

```plaintext
Image data URI resolved without size:data:image/svg+xml;,<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"> ... </svg>
Image data URI resolved without size:data:image/svg+xml;,<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"> ... </svg>
Error occurred prerendering page "/posts/amairo_kotlin_coroutines_flow/opengraph-image.png". Read more: https://nextjs.org/docs/messages/prerender-error
Error: SVG data parsing failed cause invalid attribute at 1:44192 cause expected '"' not '<' at 1:44219
    at imports.wbg.__wbg_new_15d3966e9981a196 (file:///C:/Users/takusan23/Desktop/Dev/NextJS/ziyuutyou-next/node_modules/next/dist/compiled/@vercel/og/index.node.js:18406:17)
```

ちなみにこれは開発時でも同じエラーがでました。開発時よりも↑の本番のほうがまだわかりやすいエラーなの、開発時は`Turbopack`とかが影響してんのかな。  
まあ今まで動いてたので分かんないんだけど。

```plaintext
 ⨯ [TypeError: The "payload" argument must be of type object. Received null] {
  code: 'ERR_INVALID_ARG_TYPE',
  page: '/posts/nextjs_15_migration/opengraph-image.png'
}
```

![Imgur](https://imgur.com/ZGGgwZ1.png)

そもそも`静的書き出し`モードで`OGP画像`の生成はドキュメント通りに作るとダメで（`Issue`ある）、代わりに`OGP画像`を返す`Route Handlers`を作ることで`静的書き出し`時に`HTML`とともに画像が生成されるようになります。  
その`Route Handlers`機能も本当は`静的書き出し`モードでは利用できないのですが、条件を満たした（`GET`リクエストのみ + `Request`の引数を使わない）場合は静的書き出し時に一緒に呼び出され書き出されるようです。

本題に戻して、`OGP`画像に`SVG`を`<img>`経由で表示しているのですが、これがなんかエラーになってしまっている。  
かなり端折っていますが、こんな感じに`<img>`で`SVG`を表示させてた。`<img>`を経由してたのは`public/`にあるアイコンを読み出したく、ファイルパスより直接渡したほうが良いらしいので。  

```ts
// 本当は opengraph-image.tsx を作って使います
// ImageResponse を返すことで OGP 画像を返せる Route Handlers が作れる。静的書き出し時はこっちで作る必要がある
export async function GET(_: Request, props: PageProps) {
    const params = await props.params;

    return new ImageResponse(
        (
            // 背景
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    position: 'relative',
                    display: 'flex',
                    backgroundColor: '#fff'
                }}
            >
                {/* SVG は https://fonts.google.com/icons から。ありざいす */}
                <img
                    width={50}
                    height={50}
                    src={
                        `data:image/svg+xml;,<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M220-180h150v-250h220v250h150v-390L480-765 220-570v390Zm-60 60v-480l320-240 320 240v480H530v-250H430v250H160Zm320-353Z"/></svg>`
                    }
                />
            </div>
        ),
        {
            width: 1200,
            height: 630
        }
    )
}
```

マジでエラーが分からんので`Next.js`が`OGP画像`生成で使ってるライブラリ`vercel/satori`のエラーを出してる箇所を見に行ったところ、  
`data:image/svg+xml;,`だと間違いで、これでは正規表現が一致しなくて、追加でエンコーディングが何なのかをいれる必要がありました。  
なので正解は→ `data:image/svg+xml;charset=utf8,{SVGのxmlをここに貼る}`

https://github.com/vercel/satori/blob/57a89ea6b1a4fdf3c273b4f6d4f384fa02cacc5c/src/handler/image.ts#L176

てか`Google`で調べたら`utf-8`まで入れてたわ。  
ちなみにこの`data:`から始まるやつ、`Data URI (URL ?)`とかいう名前がついているらしい。

![Imgur](https://imgur.com/HH8M6bY.png)

```tsx
export async function GET(_: Request, props: PageProps) {
    const params = await props.params;

    return new ImageResponse(
        (
            // 背景
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    position: 'relative',
                    display: 'flex',
                    backgroundColor: '#fff'
                }}
            >
                {/* SVG は https://fonts.google.com/icons から。ありざいす */}
                <img
                    width={50}
                    height={50}
                    src={
                        `data:image/svg+xml;charset=utf8,<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M220-180h150v-250h220v250h150v-390L480-765 220-570v390Zm-60 60v-480l320-240 320 240v480H530v-250H430v250H160Zm320-353Z"/></svg>`
                    }
                />
            </div>
        ),
        {
            width: 1200,
            height: 630
        }
    )
}
```

`playground`で試したい方→ https://og-playground.vercel.app/

## because it took more than 60 seconds. Retrying again shortly.
`Failed`って出てビビったけど、しばらくした後にリトライしてくれるらしい。  

```plaintext
Failed to build /posts/page/[page]/page: /posts/page/1 (attempt 1 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/2 (attempt 1 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/3 (attempt 1 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/4 (attempt 1 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/5 (attempt 1 of 3) because it took more than 60 seconds. Retrying again shortly.
```

![Imgur](https://imgur.com/egmNyPv.png)

ただ、後述しますが`GitHub Actions`の環境だとこれがよく出てしまってそうなので、タイムアウトを伸ばすようにしました。。

### 静的書き出しのタイムアウトを伸ばす
ドキュメントあった。  
進捗ない場合はタイムアウトさせて再起動する機能がついたそう。

https://nextjs.org/docs/messages/static-page-generation-timeout

### 静的書き出しの高度な設定
どうやら`Next.js 15`から`Advanced Static Generation Control`という、静的書き出しの並列数等を制御する設定が実験的に追加されたそう。  
本当にひどいようならここをいじるしか無い？

https://nextjs.org/blog/next-15#advanced-static-generation-control-experimental

# 静的書き出し出来た

![Imgur](https://imgur.com/7ZlLXLf.png)

# 本番更新
`PR`作った、マージします  
https://github.com/takusan23/ziyuutyou-next/pull/4

![Imgur](https://imgur.com/bJ4h4z4.png)

`GitHub Actions`が走っています

![Imgur](https://imgur.com/gdIDt1o.png)

## ローカルと同じエラーが出たけどリトライしたら直った話
ローカルと同じエラーが出てしまった。タイムアウトを伸ばさないから、、、

![Imgur](https://imgur.com/gntj6N7.png)

![Imgur](https://imgur.com/bZkaPx2.png)

とりあえず今までの`CI`が`5分`以内で終わってたので`5分`、、、と思ったんですけどさっきの`CI`が`4分`かかってるので2倍にした。

```js
/** @type {import('next').NextConfig} */
module.exports = {
    output: 'export',
    // 省略...
    staticPageGenerationTimeout: 60 * 10 // 10分
}
```

で、伸ばした後リトライしたら逆にいつもの時間で終わった、どういうことなの

![Imgur](https://imgur.com/1uhHkcL.png)

でも何回か`GitHub Actions`やってるけどやっぱりこのエラーが**出る時は出てしまう**ので伸ばしておくことにしようと思う。  

```plaintext
Failed to build /posts/page/[page]/page: /posts/page/1 (attempt 1 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/2 (attempt 1 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/3 (attempt 1 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/4 (attempt 1 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/5 (attempt 1 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/6 (attempt 1 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/7 (attempt 1 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/8 (attempt 1 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/4 (attempt 2 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/6 (attempt 2 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/7 (attempt 2 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/8 (attempt 2 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/3 (attempt 2 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/1 (attempt 2 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/5 (attempt 2 of 3) because it took more than 60 seconds. Retrying again shortly.
Failed to build /posts/page/[page]/page: /posts/page/2 (attempt 2 of 3) because it took more than 60 seconds. Retrying again shortly.
```

## OGP 画像が一部壊れている
なんでこんな部分的に壊れるの...？

![Imgur](https://imgur.com/AEvcPDF.png)

![Imgur](https://imgur.com/DZGyXku.png)

ちなみにエラー。分からん、、

```plaintext
   Generating static pages
Failed to load dynamic font for 自由帳経動直 . Error: [TypeError: fetch failed] {
  [cause]: [AggregateError: ] { code: 'ETIMEDOUT' }
}
Failed to load dynamic font for 自由帳国内版入 . Error: [TypeError: fetch failed] {
  [cause]: [AggregateError: ] { code: 'ETIMEDOUT' }
}
Failed to load dynamic font for 自由帳作直際大変 . Error: [TypeError: fetch failed] {
  [cause]: [AggregateError: ] { code: 'ETIMEDOUT' }
}
   Generating static pages
```

なんかまたタイムアウト系なのでもう一回試したら動いた。  
~~なんかすごい`静的書き出しモード`の調子悪い？~~ →うそです。`OGP画像`の件に関しては**私が悪かった**です。

![Imgur](https://imgur.com/wnAeloA.png)

```plaintext
   Generating static pages
   Generating static pages
 ✓ Generating static pages
   Finalizing page optimization ...
   Collecting build traces ...
   Exporting (0/3) ...
 ✓ Exporting (3/3)
```

~~これ次回以降もなにかの拍子に失敗する可能性があるってこと？~~  
~~どうしたものか~~

![Imgur](https://imgur.com/vViq91v.png)

**これに関しては私が悪かったです**、原因はフォントファイルが**Web 向けの軽量版**を使ってて、必要な文字が網羅されていないのが原因だった、  
今まで気付かなかった。。。全部入りの方を使うようにしました。

`Next.js`の`OGP画像`を作る機能は`vercel/og`を使っていて、そのライブラリは`vercel/satori`を使っています。  

なんで`vercel/satori`を直接使っていないのか、`vercel/og`は何なのかはこちらにまとまっていました。  
ざっくり、フォントを`Google Fonts`からダウンロードする機能、`satori`が吐き出した`SVG`を`png`にする等を`vercel/og`側でやっているらしい。  
https://t28.dev/blog/vercel-og-or-satori-for-me  

話を戻して、じゃあ`Windows`マシンで成功して`GitHub Actions`で失敗してんのはなんでだよって話ですが、おそらくこれです。  
そのフォントを指定しない場合（もしくはフォントファイルに文字がない場合）は`Google Fonts`からダウンロードするのですが、`Windows`はいい感じに`IPv4`で繋いでくれたけど`GitHub Actions（というか Linux）`だとおま環で繋がらない`IPv6`の方を使ってしまってるのが原因の可能性がある。  

いきなり話が広がりすぎやろがいって話ですが、`WSL 2（Ubuntu）`でビルドする際に`IPv4`を優先するオプションを付けるとだいぶエラーの数が減ったので可能性がある。**減っただけでエラー自体はある**。  
こんな感じに`node`のオプションをつければ良いはず？

```shell
NODE_OPTIONS='--dns-result-order=ipv4first' npm run build
```

もし私みたいな事になってしまったら、`Web 向けの軽量版フォント`を使うのを辞めるか、  
`Google Fonts`をあらかじめローカルに落としておいて、`satori`にフォントファイルとして`ArrayBuffer`で渡すなどすれば良いのかな。  
ちな上記のオプション`IPv4`を強制するものじゃないので`IPv6`を使われたらやっぱりエラーになってしまう。

これ**一時的に**`IPv6`がダメだったり、`Node.js`の**バージョン**が関与してたり（？）でかなり複雑そう雰囲気。。。

# おわりに
ちなみに`React`側の修正は ~~ないはずです。~~ 私の場合はありませんでした

# おわりに2
- `React 19`の`use() Hook`と`<Suspense>`で`useEffect()`を消し飛ばしたい
- ダークモード切り替えに端末の設定に従うを追加したい
- タグ詳細のページネーション
- `next.config.ts`。`TypeScript`で書けるようになった
- とか

やりたいんですが、あんまり決まってないのでとりあえず`Next.js 15`に上げただけの`PR`を書こうと思います。  
`Tailwind CSS`も次のバージョンが控えてるそうなので今じゃなくていいか。

フロントエンド、むずかしい。

# おわりに3
せいてきがえっちな方の漢字になってないか`grep`したけど大丈夫そう