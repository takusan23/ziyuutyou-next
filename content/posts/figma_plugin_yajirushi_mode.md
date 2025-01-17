---
title: Figma プラグインを作って図形を矢印で繋げられるようにした話（ReactとVite）
created_at: 2024-03-06
tags:
- Figma
- React
- TypeScript
- Vite
---

どうもこんばんわ。  
届きました。こちら

![Imgur](https://i.imgur.com/JtDlZHJ.png)

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">Rin&#39;ca、待望のアルバム<br>2ndアルバム『Piece of Rin&#39;ca~Pleasant~』全12曲<br>3rdアルバム『Piece of Rin&#39;ca~natural ~』全13曲<br>2月23日2枚同時リリース！<a href="https://t.co/GwkbMU2ZNh">https://t.co/GwkbMU2ZNh</a><a href="https://t.co/Va7oo3QbLa">https://t.co/Va7oo3QbLa</a><br>収録曲は↓<br>宜しくお願いします。<a href="https://twitter.com/hashtag/%E3%83%94%E3%83%BC%E3%82%B9%E3%82%AA%E3%83%96%E3%82%8A%E3%82%93%E3%81%8B?src=hash&amp;ref_src=twsrc%5Etfw">#ピースオブりんか</a> <a href="https://t.co/lgOAIwAVU3">pic.twitter.com/lgOAIwAVU3</a></p>&mdash; Peak A Soul+ (@PAS_STAFF) <a href="https://twitter.com/PAS_STAFF/status/1758829382133788953?ref_src=twsrc%5Etfw">February 17, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

特におすすめなのが **恋するMODE**（2ndアルバム） と **青い春は君と。**（3rdアルバム） です！！！  
恋するMODE、ガチ名曲。ずっと聞いてられる。ついでにゲームの`D.C.4`もいい！！！。  
あと後者もめっちゃ好きなんだけど`CUFFS 系列`全然CD出してくれないからこの値段ならすごく安い！！

<script type="application/javascript" src="https://embed.nicovideo.jp/watch/so35013448/script?w=640&h=360"></script><noscript><a href="https://www.nicovideo.jp/watch/so35013448">D.C.4 ～ダ・カーポ4～ 中間ルートオープニングムービー：「恋するMODE」</a></noscript>

![Imgur](https://i.imgur.com/BN14etA.png)

# 本題
`Figma`で矢印を引くプラグイン、どれがいいんだろう？  
選択した2つのアイテム？間を矢印で引いて欲しいんだけどいまいちどれが良いのか分からないのでもういっそのこと作るかになってる。

# 作った
2つ図形を選んで、その間を矢印で結んでくれます。  
ちゃんと右左折が必要な場合は曲がってくれます（**複雑じゃなければ**）

https://www.figma.com/community/plugin/1344710416431362546

![Imgur](https://i.imgur.com/7ZRQr93.png)

今回はこの話です。

# ソースコード
どぞー

https://github.com/takusan23/yajirushi-mode

# 公式
https://www.figma.com/plugin-docs/

# ざっくり
デスクトップ版`Figma`を入れるだけでいいらしい（無料ユーザーでも作れるぽい）。  
そして`TypeScript`で作れるらしい。よかった。  

ユーザーの入力を受け付ける`UI`の部分と、実際に`Figma`のキャンバス？で図形書いたりする部分はコードレベルで分かれているらしい。（`ui.html`、`code.js`）  
`UI`の部分は`<iframe>`で読み込まれるらしい。そしてブラウザ用の`API`も叩けるって！  
（Webブラウザの技術、`localStorage`とか`<input type="file">`、`fetch()`も使えるのかな？）  
（`localStorge`は使えんかった）

`UI`側じゃない、`Figma`側の方はブラウザではない`JavaScript`実行環境らしいので、  
`JavaScript`の言語機能は使えるけど、ブラウザ由来の機能は使えないとのこと。ちなみに、使える言語機能は`ES6`までです。

コートレベルで分かれてるので、それぞれメッセージを投げ合ってやり取りすればいいらしい。シリアライズ出来ないとだめですね。  
これ`Electron`のレンダラープロセス、メインプロセスの関係に似てますね。今の`Electron`分からんけど；；  
https://www.figma.com/plugin-docs/how-plugins-run/

せっかくなので、`UI`部分は`html / css`直書きよりは`React`とか`Tailwind CSS`を使いたいところですが、、、  
どうやら`ui.html`以外のファイルを渡すことが出来ないらしい。  
`React`は複数の`<script>`からなるし、`CSS`もどっかに出てくるので、どうにかして1つの`HTML`に全ての`JS`と`CSS`と`HTML`を詰め込まないといけない。  

というわけでありました。`Bundle`に関しての話  
https://www.figma.com/plugin-docs/libraries-and-bundling/

というか、`React`の例と`esbuild (Vite？)`の例がありました。今回はこれに乗っかります。  
- https://github.com/figma/plugin-samples/tree/master/webpack-react
    - 今なき？`create-react-app`のように`Webpack`で良い感じにやる
- https://github.com/figma/plugin-samples/tree/master/esbuild-react
    - 最近流行りの、`Next.js (や他のフレームワーク)`がオーバースペックすぎる！`React`だけよこせな構成で使われる`Vite`のサンプルもある
    - これ使お

あとあんまり関係ないけど**なんかとてもわかりやすく説明してる気がする。なんだこれ？**  
ご丁寧に`GIF`画像つかってコマンドラインの操作方法とか書いてる。でもやってることは難しそう。

https://www.figma.com/plugin-docs/plugin-quickstart-guide/

# つくる
矢印が引ける、`Figma Plugin`作ります。  
あ、今回は`Figma プラグイン`開発には必須ではない`React`、`Vite`、`esbuild`、`Tailwind CSS`とかを使うので、最小限の例が見たければ他行ったほうが良いと思います。

# 環境
必要なものは、`Figma デスクトップアプリ`、`VSCode（テキストエディタなら何でも良い）`、`Node.js`です。

| なまえ  | あたい         |
|---------|----------------|
| OS      | Windows 10 Pro |
| Node.js | v20.9.0        |

## Figma デスクトップアプリ版を入れる
https://www.figma.com/ja/downloads/

こちら、私は`Windows`版をいれます。秒でインストールが終わりました。。。  
`UAC`とか求められなかったけどどういう事なの？

## プラグインをつくる
https://www.figma.com/plugin-docs/plugin-quickstart-guide/

なにか適当なプロジェクトを開いて（なければ作ります）  
↓ デザインの方を押す
![Imgur](https://i.imgur.com/fuN9PLX.png)

次に、左上のロゴを押して、`プラグイン`→`開発`→`プラグインの新規作成`を押します。  

![Imgur](https://i.imgur.com/ee1GuiD.png)

名前は適当につけて、今回は`Figma`のデザインの方だけで動けばいいので、`デザインの方`を選びます。

![Imgur](https://i.imgur.com/c15NZP9.png)

矢印を作るプラグインを作るわけですが、矢印の設定とかをするための画面が必要なので、`カスタムUI`を選びます。

![Imgur](https://i.imgur.com/HfK7atn.png)

あとは保存先を尋ねてくるので、適当に選びます。  

![Imgur](https://i.imgur.com/qE9aD0f.png)

これで最小限のプラグインのコードが出来たらしいです。  

![Imgur](https://i.imgur.com/xuNdjM9.png)

完了を押すとプラグインにありました！

![Imgur](https://i.imgur.com/p7HdNjb.png)

## VSCode で開く
https://www.figma.com/plugin-docs/plugin-quickstart-guide/#install-project-dependencies

保存先を`VSCode`で開きます。  
ファイルの中身はこうなってるでしょうか？

![Imgur](https://i.imgur.com/iY3kk4A.png)

`Node.js`を使ったことがあれば気付くかもしれませんが、`node_modules`とか言うのがいませんね。  
というわけで`npm i`します。

まあ`コマンドプロンプト`とか`GitBash`でも何でも良いんですが、`VSCode`から起動できるのでもうそれで、  
`ターミナル`を`VSCode`で開きます。`Windows`以外はしらんけど多分おんなじ感じだと思う。

![Imgur](https://i.imgur.com/SPCqKYG.png)

そこで`npm i`を打ち込んでエンターです。  
ながい。`gradle`のそれと違ってライブラリはプロジェクト毎にダウンロードするので長いです。

![Imgur](https://i.imgur.com/O4YmJNl.png)

これで依存関係もおっけー

## git を使う（お好みで）
`Git`を使いたい場合は。`git init`コマンドを叩いてね。  
コミットとかしたい場合は。とりあえず動かしたければ要らないね。

`gitignore`がすでにあるので便利ですね。

```
git init
```

![Imgur](https://i.imgur.com/SGsA2US.png)

## Vite + React で UI 部分を開発できるようにする
`Next.js`とかはこの`Webpack`とかのバンドラーの設定をいい感じにやってくれてたから。。。いざ自分がやろうとするときついな。  
雰囲気で`esbuild`サンプルとにらめっこしてみる。

### そもそも Vite とか Webpack とか esbuild って何？
ガチでフロントエンド何もわからない。

#### esbuild
https://esbuild.github.io/

型付きでおなじみ`TypeScript`のコードはブラウザでは動かせないんですね。ブラウザは`JavaScript`しか分からないので。  
なので、`TypeScript`を`JavaScript`に変換しないといけないのですが、これは`esbuild`がやってくれるらしい。

あ、今更ですが`TypeScript`は`JavaScript`に変換される都合上、お硬い言語にある`instanceof`とかはありません。  
型情報は`JavaScript`に変換する際に消え去るので、実行時にクラスを判別とかは出来ないです。

また、`React`の`JSX / TSX`も`JavaScript`に直さないといけないのですが、これも`JavaScript`にしないといけません。  
これも`esbuild`がやってくれるらしい。

その他、ライブラリのコードを自分の書いたコードといっしょに吐き出して本番で動かせる（`node_modules`無しで起動）ようにする機能、  
古い`JavaScript`実行環境でも（`Figma`のプラグイン（UIじゃない方）は`ES6+`までの言語機能はサポート）新しい言語構文を使えるように、古くても動くように書き直す機能とかも`esbuild`がやるらしい。  

これらは`esbuild`以外の`Webpack`とかも同じことをやるらしい。

`Vite`は何？

#### Vite
ありざいす

- https://ja.vitejs.dev/guide/why.html
- https://zenn.dev/nakaakist/articles/86457bf2908379#各ツールのできること整理

どうやら、`esbuild`には開発サーバー機能がないらしい？。  
`React`とかのフロント開発では、開発サーバーを立ち上げて快適ホットリロードのありがたみを感じつつ開発をすると思いますがないらしい。これがないといちいちビルドし直さないといけない？  

→ というより、`Figma プラグイン`は`UI`に必要な`JS / HTML / CSS`を一つの`html`にしないといけないので、ホットリロードよりもこのためかも。

そのために`Vite`を使ってるとかなんですかね？もうよくわからない。

### Figma の esbuild サンプルを見る
https://github.com/figma/plugin-samples/blob/master/esbuild-react/package.json

どうやら、`UI`部分の開発には`Vite`、`Figma`上で動く方は`esbuild`にやらせているそうです。  

```json
"build": "npm run build:ui && npm run build:main -- --minify",
"build:main": "esbuild plugin-src/code.ts --bundle --outfile=dist/code.js",
"build:ui": "npx vite build --minify esbuild --emptyOutDir=false",
"build:watch": "concurrently -n widget,iframe \"npm run build:main -- --watch\" \"npm run build:ui -- --watch\"",
```

### フロントエンド難しすぎ
てなわけで普通に`React`を使った`Webサイト`を作りたければ、すぐに使える`Next.js`とかを選ぼうねって`React`の人が言ってる。  
`Figma プラグイン`開発で`React`使いたければ地道にセットアップするしか無いと思いますが。。。

https://ja.react.dev/learn/start-a-new-react-project

## Figma プラグイン開発で esbuild + Vite + React + Tailwind CSS を使うようにセットアップ
`Vite`じゃなくて`Webpack`でも良いはずなんだけど、`Webpack`は`Next.js`で使ったことあるので今回は`Vite`にしてみる。

### フォルダ構成を変更しておく
`React`のコンポーネント置き場ように`src`みたいなのを置いておくべきかなと思ったので。  
`src-ui`と`src-plugin`を作りました。`src-ui`には`React`とかの`UI 関連`を、`src-plugin`にはUIじゃない`Figma`上で動く方を。  

`src-plugin`の方には早速`code.ts`を移動させました。  
また、`code.js`と、`ui.html`は要らなくなるので消します。消すのは**code.js**の方で、**code.ts**の方は`src-plugin`に移動させてください。

それから、`tsconfig.json`も消しちゃいましょう。  
そして`src-plugin`フォルダ内に`tsconfig.json`を追加します。削除せずとも移動させるでも良かったんですが。中身はこんな感じ。  
サンプル通りです。https://github.com/figma/plugin-samples/blob/master/esbuild-react/plugin-src/tsconfig.json  

```json
{
  "compilerOptions": {
    "target": "es6",
    "lib": ["es6"],
    "strict": true,
    "typeRoots": ["../node_modules/@figma"]
  }
}
```

最後、変更した都合上、パスが変わってしまったので、`manifest.json`を変更します。  
変更点は、`main`の`"code.js"`が`"dist/code.js"`に。`ui`の`"ui.html"`が`"dist/index.html"`になります。

```json
{
  "name": "yajirushi-mode",
  "id": "1344710416431362546",
  "api": "1.0.0",
  "main": "dist/code.js",
  "capabilities": [],
  "enableProposedApi": false,
  "editorType": [
    "figma"
  ],
  "ui": "dist/index.html",
  "networkAccess": {
    "allowedDomains": [
      "none"
    ]
  },
  "documentAccess": "dynamic-page"
}
```

ここまでのファイル構成と、`manifest.json`です。  

![Imgur](https://i.imgur.com/O697g5k.png)

### esbuild
https://esbuild.github.io/getting-started/

まずは簡単そうな、`Figma`上で動く方を（`UI`じゃない方）。  
`VSCode`のターミナルへ戻り、`esbuild`ライブラリを追加します。  
開発時しか使わない（`React`みたいにブラウザ側では使わない）ので`--save-dev`ですね。

```shell
npm install --save-exact --save-dev esbuild
```

ひとまずこれで、次に`Vite + React + Tailwind CSS`で`UI`側いきます。

### Vite と React
https://ja.vitejs.dev/guide/

`Vite`を入れて、`React`も使えるようにします。  
・・・が、`npx create`以外の方法が書いてないのかな？`npm install vite`の方法で地道にセットアップしたいんやが？

というわけで手探りでやってみる。  
~~サンプルをみると、vite /vite-plugin-singlefile / plugin-react-refresh の3つを入れているのでまずは入れてみる。~~

`plugin-react-refresh`が非推奨になってしまったので、`@vitejs/plugin-react`の方を入れます。

```shell
npm install --save-dev vite vite-plugin-singlefile @vitejs/plugin-react
```

次に、`React`を入れます。`--save-dev`は付けません。  

```shell
npm install react react-dom
```

`TypeScript`なので型定義ファイルも入れます。

```shell
npm install --save @types/react @types/react-dom
```

次に、`vite`の設定ファイルを作ります。  
`vite.config.ts`を`src-ui`があるフォルダと同じところに作成して、サンプルを参考にしながら（というかほぼコピペ）こんな感じ。  
https://github.com/figma/plugin-samples/blob/master/esbuild-react/vite.config.ts

多分パスを`./src-ui`にすればいいはず。

```ts
import { defineConfig } from "vite";
import react from '@vitejs/plugin-react'
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig({
    root: "./src-ui", // UI のコンポーネントとかがあるパス
    plugins: [react(), viteSingleFile()],
    build: {
        target: "esnext",
        assetsInlineLimit: 100000000,
        chunkSizeWarningLimit: 100000000,
        cssCodeSplit: false,
        outDir: "../dist",
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
            },
        },
    },
});
```

現時点のファイル構成

![Imgur](https://i.imgur.com/r5RN6TB.png)

### package.json の編集
`Figma`の方は`esbuild`で`JavaScript`に、`React`で作る`UI`の方は`Vite`で`JavaScript`にできるようにします。  
`package.json`を開き、`scripts`の部分を変更します。`scripts`以降は変更ないです。

変更点は`scripts`内の、`build`、`build:plugin`、`build:ui`コマンドの追加です。  
- `build`コマンド
    - 後述する、`plugin`と`ui`のビルドをやる
- `build:plugin`
    - `esbuild`を使い、`code.ts`を`JavaScript`にして`dist`に入れるように。
        - この際に、古いバージョンで動かすから、新しい文法を使ってたら動くように書き直すように指示します。これが`--target=es2015`の部分。
            - `optional chaining`が`ES6`だと使えない
    - ついでに依存してるライブラリもその`JavaScript`に入れてねって。
- `build:ui`
    - `vite`を使って`vite.config.ts`を元に`JavaScript`にしたのち`dist`に入れてねってしてるらしい。

```json
{
  "name": "yajirushi-mode",
  "version": "1.0.0",
  "description": "自分のFigmaプラグイン",
  "main": "code.js",
  "scripts": {
    "lint": "eslint --ext .ts,.tsx --ignore-pattern node_modules .",
    "lint:fix": "eslint --ext .ts,.tsx --ignore-pattern node_modules --fix .",
    "build": "npm run build:ui && npm run build:plugin -- --minify",
    "build:plugin": "esbuild src-plugin/code.ts --bundle --target=es2015 --outfile=dist/code.js",
    "build:ui": "npx vite build --minify esbuild --emptyOutDir=false"
  },
```

### React で UI を作る
消してしまった`ui.html`を`React`で再現させましょう。  
`code.ts`の方はそのままなので、`ui.html`の画面を`React`で作って、`ui.html`でやっていた`JavaScript`を書けば良いはず。  

`src-ui`に`App.tsx`って名前でファイルを作り、以下の`tsx`を貼り付けてね。

```tsx
import { useState } from 'react'

function App() {
    const [count, setCount] = useState(5)

    return (
        <>
            <h2>Rectangle Creator</h2>
            <p>
                Count:
                <input
                    onChange={(ev) => setCount(Number(ev.target.value))}
                    value={count} />
            </p>
            <button
                onClick={() => {
                    parent.postMessage({ pluginMessage: { type: 'create-rectangles', count } }, '*')
                }}
            >
                Create
            </button>

            <button
                onClick={() => {
                    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
                }}
            >
                Cancel
            </button>
        </>
    )
}

export default App
```

次に、同じフォルダへ`main.tsx`を作り、`App()`コンポーネントを呼び出します。  

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
```

最後に、また同じフォルダに`index.html`を作り、以下をコピペします。  
`React`を呼び出すやつですね。

```html
<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>やじるしモード</title>
</head>

<body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
</body>

</html>
```

で、消えないエラーがあると思います。`src-plugin/`には`tsconfig.json`がありますが、`src-ui/`には`tsconfig.json`が無いからですね。  
というわけで`src-ui`フォルダ内に`tsconfig.json`を追加し、以下コピペ。これもサンプル通りです。。。  
https://github.com/figma/plugin-samples/blob/master/esbuild-react/ui-src/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": false,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

あと、`vite-env.d.ts`ファイルを置くのが、`Vite + React`アプリのお作法？らしいので置いておきます。  
`src-ui`内に`vite-env.d.ts`ファイルを作って、以下コピペ。

```d.ts
/// <reference types="vite/client" />
```

ここまでのファイル構成です。  
![Imgur](https://i.imgur.com/2JEIWJQ.png)

### ビルドしてみる
`npm run build`をターミナルで叩くことで、`UI`側とプラグイン側の`JavaScript`吐き出しが行われます。  

![Imgur](https://i.imgur.com/8SnlFTz.png)

`dist`フォルダが出来て、`code.js`と`index.html`があれば成功！！！  
おっめでと～～～～🎉🎉🎉  
まだ設定が終わったところなんですけどね初見さん。あとホットリロードとかは`scripts`で書いてないので無いです。

![Imgur](https://i.imgur.com/8J94vDV.png)

## Figma 側で読み込んでみる
`Figma`のデスクトップアプリを開いて、作ってるやつを押してみれば良いはず。

![Imgur](https://i.imgur.com/lInUTPO.png)

はえ～最初に書いてあった`ui.html`はこんな姿だったんですね～  
（`React`で書くため速攻で消したので知らなかった）

![Imgur](https://i.imgur.com/o2P2Kgm.png)

ボタンを押してみる。えいっ  
オレンジの四角形が5個並びました！おお～

![Imgur](https://i.imgur.com/R4CYwcG.png)

とりあえず`esbuild`で`Figma プラグイン側`、`Vite`で`Figma UI側`両方がちゃんと設定されてうまく動いていそうです。  
よかったよかった。

### タイプチェックをする
`esbuild`は`TypeScript`の型が合っているかまでは見てくれないので、プロパティが足りないとか、型があってないとかのエラーがあってもトランスパイルされちゃいます。  
`VSCode`上でも見れますが、開いてないと分からないので型チェックするようにしましょう。

`package.json`を開いて、`tsc`コマンドを追加します。`scripts`に1個追加です。  
`tsc`コマンドを足しました。`src-plugin`と`src-ui`の中にある`TypeScript`コードで型があっているかのチェックができるようになりました。

```json
"scripts": {
    "lint": "eslint --ext .ts,.tsx --ignore-pattern node_modules .",
    "lint:fix": "eslint --ext .ts,.tsx --ignore-pattern node_modules --fix .",
    "tsc": "tsc --noEmit -p src-plugin && tsc --noEmit -p src-ui",
    "build": "npm run build:ui && npm run build:plugin -- --minify",
    "build:plugin": "esbuild src-plugin/code.ts --bundle --target=es2015 --outfile=dist/code.js",
    "build:ui": "npx vite build --minify esbuild --emptyOutDir=false"
},
```

### Tailwind CSS を入れる（欲しければ）
あ、要らなければ別にいいです。私は欲しいので...  

https://tailwindcss.com/docs/guides/vite

`React`で書けるようになった！！でも`CSS`書きたくない。  
というわけで`Tailwind CSS`を入れます。`Vite`環境下での導入方法がちゃんとあります！  

`Tailwind CSS`を入れて。

```shell
npm install -D tailwindcss postcss autoprefixer
```

`Tailwind CSS`の構成ファイルを以下のコマンドで生成します。  
`tailwind.config.js`と`postcss.config.js`がでてくるはず。

```shell
npx tailwindcss init -p
```

できたら、`tailwind.config.js`を開いて書き換えます。  
`Tailwind CSS`のユーティリティ名の走査対象ファイルを`src-ui`にします。

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src-ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

次に、`src-ui`に`App.css`を追加します。  
中身はこんな感じ。

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

そして最後、`App.tsx`を開き、`App.css`を`import`します。  
ついでに、味気ないので`App.tsx`を`Tailwind CSS`でいい感じに見た目を揃えておきます。

```tsx
import { useState } from 'react'
import "./App.css"

function App() {
    const [count, setCount] = useState(5)

    return (
        <div className='flex flex-col space-y-2 items-center'>
            <h2 className='text-3xl'>Rectangle Creator</h2>
            <p>
                Count:
                <input
                    className='border-black border-b-2 ml-2'
                    onChange={(ev) => setCount(Number(ev.target.value))}
                    value={count} />
            </p>
            <button
                className='rounded-md border-blue-300 border-2 px-4'
                onClick={() => {
                    parent.postMessage({ pluginMessage: { type: 'create-rectangles', count } }, '*')
                }}
            >
                Create
            </button>

            <button
                className='rounded-md border-red-300 border-2 px-4'
                onClick={() => {
                    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
                }}
            >
                Cancel
            </button>
        </div>
    )
}

export default App
```

センスが無いのであれですが、とりあえず`Tailwind CSS`のセットアップも出来ました。  
![Imgur](https://i.imgur.com/W5CcvNx.png)

# Figma Plugin API になれよう
本題の矢印を書く前に、手始めに`四角形`じゃなくて`矢印`を出せるようにしてみましょう。

## code.ts
サンプルコードでは`createRect()`してますが、これを`createLine()`にすれば棒が出てくるようになります。  
また、`strokes`で線の色、`strokeCap`で矢印を出せるようです。

```ts
// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "index.html".
figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage =  (msg: {type: string, count: number}) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'create-rectangles') {
    const nodes: SceneNode[] = [];
    for (let i = 0; i < msg.count; i++) {
      const line = figma.createLine();
      line.x = i * 150;
      line.strokes = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]
      line.strokeCap = 'ARROW_LINES'
      figma.currentPage.appendChild(line);
      nodes.push(line);
    }
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
```

こんな感じ。  
なるほど。。。

![Imgur](https://i.imgur.com/aIGORnn.png)

## 座標系
`Figma`は上に向けてマイナスになる。（WebGL のそれと違うのか...）  
右向かってプラスは他と変わらんかも。

## console.log

ここの`コンソールを表示/非表示`を選ぶことで、見慣れた画面が出てきます。  
`console`タブに移動すれば、`console.log()`の内容が出力されます。これは`UI`側（`React`）も`Figma で動く側`（`code.ts`）もここに出てきます。

![Imgur](https://i.imgur.com/p6wLejr.png)

![Imgur](https://i.imgur.com/5H56gd4.png)

## アイテム（ノード）の選択イベント

`code.ts`でこんな感じに書けば、、、取れます。  
選択中アイテムを配列で返してくれます。

```ts
// 2つのアイテム（Node）を選択したかどうか
figma.on("selectionchange", () => {
  console.log(figma.currentPage.selection)
})
```

注意点ですが、`selection`の配列の順番は**決まっていません。**  
これは、2個選択した際に、`0`番目が最初に選択したノードになるかもしれないし、2回目に選択したノードになるかもしれないということです。

https://www.figma.com/plugin-docs/api/properties/PageNode-selection/

## 片っぽだけ矢印をつける
`strokeCap = 'ARROW_LINES'`すれば矢印が引けることがわかりました、、、が、  
別に両方矢印は要らない。片方ついてたらそれでいい。

↓これ。こんな感じに右側だけ矢印をつけたい。  
![Imgur](https://i.imgur.com/nVgWhg1.png)

というわけで調査してみた。`Figma`で矢印を引いて`Node`を`console.log`して色々見てみた。  
結果、あれは`線（createLine()）`ではなく、ベクターで出来てて（`createVector()`）、  
`VectorNetwork`で、ストロークに矢印をつける（？）ようにすればいいらしい。

```ts
// Figma の矢印は LineNode じゃなくて VectorNode で出来てる
// SVG で線を書く必要がある
// M 0 0 L 900 0
// https://www.figma.com/plugin-docs/api/properties/VectorPath-data/
const lineVector: VectorNode = figma.createVector()
lineVector.strokeWeight = 5
lineVector.cornerRadius = 20

// 矢印を追加するためには、VectorPath ではなく、VectorNetwork を使って、最後（or 最初）のストロークに矢印をつける必要があるらしい。
// が、SVG の data を VectorNetwork にするのは面倒なので、
// vectorPaths に入れたあとに出てくる、vectorNetwork をディープコピーして矢印をつけることにする
lineVector.vectorPaths = [{
    windingRule: 'NONE',
    data: `M 0 0 L 900 0`
}]

// VectorNetwork を使ってストロークに矢印をつける
const vertices: VectorVertex[] = lineVector.vectorNetwork.vertices
    .map((stroke, index) => {
        if (index === lineVector.vectorNetwork.vertices.length - 1) {
            // 終了側につける
            return { ...stroke, strokeCap: 'ARROW_LINES' }
        } else {
            return stroke
        }
    })

// VectorNetwork をセットする
lineVector.setVectorNetworkAsync({
    ...lineVector.vectorNetwork,
    vertices: vertices
})

figma.currentPage.appendChild(lineVector)
```

`vectorPaths`した後に、また`setVectorNetworkAsync`してて何がしたいんだって話ですが、  
`SVG`のパスを書くのが一番速く、簡単なのですが、矢印をストロークに付けたい場合は、  
`VectorNetwork`オブジェクト内の`vertices`に入ってるストロークを変化させる必要がある、、、が、`VectorNetwork`オブジェクトを作るのが多分とてもつらいので、  
`SVG`のパスを`vectorPaths`で書いてから、`vectorNetwork`プロパティに反映されたオブジェクトから最後のストロークだけ変化させて、`setVectorNetworkAsync`で反映させる。  
が一番いいのかなと思いました。

こんな感じにかたっぽだけ矢印が付きます。  
![Imgur](https://i.imgur.com/fSbhb09.png)

## PluginAPI['mixed'] ←こいつ何？
たまにこの、`number`と`PluginAPI['mixed']`の`union`で定義されているプロパティーがあります。  
で、この`PluginAPI['mixed']`は`JavaScript`の`Symbol`らしい、、、`Symbol`、はて何なんだ？  

```ts
interface CornerMixin {
  cornerRadius: number | PluginAPI['mixed']
  cornerSmoothing: number
}
```

というわけで見てみたけど、どうやら表現できない値の時に`number`ではなく`PluginAPI['mixed']`を入れているらしい。  
`symbol`の言語機能を使っているとかではなく、ただ表現できない時に`symbol`を入れてるだけだった。`symbol`使ったことないから助かる（？）。

https://www.figma.com/plugin-docs/api/properties/figma-mixed/

だから`union`なんですね、で、その表現できない値が何？  
ってわけなんですが、どうやら角を丸くするやつとかは、右上だけ丸くする。など部分的に丸めたい時、1つのプロパティでは表現出来ないため、  
代わりになる別のプロパティに値を入れて、元のプロパティには`PluginAPI['mixed']`で表現出来ないよって表しているらしい。

```ts
// 四角形で、角丸の場合
if (rectangle.type === 'RECTANGLE') {
    if (rectangle.cornerRadius === figma.mixed) {
        // 一つのプロパティでは表現出来ない
        // 代わりにそれぞれの角丸プロパティを参照する必要がある
        console.log(rectangle.topLeftRadius)
        console.log(rectangle.bottomRightRadius)
    } else {
        // 一つのプロパティで表現できる。あと型推論されて number になります
        const cornerRadius: number = rectangle.cornerRadius
        console.log(cornerRadius)
    }
}
```

## UI 側のダークモード対応
この辺参照。  
https://www.figma.com/plugin-docs/css-variables/#semantic-color-tokens

背景勝手に暗くなるけど`Figma`が既に用意してくれてるやつだしそれ使ったほうが良さそう（？）

## Figma の UI コンポーネントを使いたい
この辺見て、  
このサイト知ったのが作ったあとなので、私は使ってない！（頑張って`Tailwind CSS`で見た目整えた）

気が向いたらやるかも。~~もっと早く言って欲しかった~~

https://www.figma.com/plugin-docs/figma-components/

## localStorage はなさそう
使えないっぽい。  
代わりに、`Figma プラグイン`側に`figma.clientStorage`っていう、`Key-Value`で設定とか保存できる`localStorage`みたいなやつがいるので、それを使えば良さそう。  
`UI`から保存したい場合は、プラグイン側へメッセージを投げて、保存して貰う必要があります。

https://github.com/takusan23/yajirushi-mode/blob/master/src-plugin/code.ts#L41

# ところでどうやって線を書こう？
環境構築と`Figma Plugin API`ちょろっといじって気付いた。  
どうやって線を書こう。というか、曲がった線なんて引けなくない？

`createLine()`の場合は、多分真っ直ぐにしか引けず、しかも傾けるとかは厳しそう雰囲気。  
てなわけで調べた。`SVG`のパスが使えるらしい。

https://www.figma.com/plugin-docs/api/properties/figma-createvector/  
どうやら、`figma.createVector()`とか言うので、`VectorNode`が作成できる。  
これが、`SVG`で線がかけるやつらしく、例えばこんな感じな`SVG`のパスを書くと。。。

```ts
const lineVector = figma.createVector()
lineVector.strokeWeight = 5
lineVector.vectorPaths = [{
    windingRule: 'NONE',
    data: `M 5501 -9064 L 5829 -8772 L 5829 -8772`
}]
figma.currentPage.appendChild(lineVector)
```

線が引ける。  
これをいい感じにすれば良さそうね。

![Imgur](https://i.imgur.com/KPE3BRb.png)

ちなみに、この`SVG`のパス（`M 5501 -9064 L 5829 -8772 L 5829 -8772`）は何を表しているかと言うと、1行毎に分解するとわかりやすいかも。  
```svg
M 5501 -9064 // M は Move。つまり移動。 X=5501 Y=-9064 に移動
L 5829 -8772 // L は Line。線が引ける。 X=5829 Y=-8772 まで線を引く
L 5829 -8772 // これも同様。X=5829 Y=-8772 まで線を引く
```

最初と最後だけがあれば良いわけではなく、2つ以上`L`が無いといけない？  
なんか中間点ないと矢印引けないとかだっけ？

# プラグインを作る
もうつかれたので、ここからは端折ります。

## 線を書く
愚直に線を伸ばして当たるかどうか試してるだけです。  
U字で線が書けるか、一回折れ曲がるだけで書けるかなどを試してうまく行けば線を書いてる。  

開始点、曲がる点、曲がる点、終了点の座標を入れた配列を返しています。  
`[ {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0} ... ]`
具体的にはこの辺のコード

https://github.com/takusan23/yajirushi-mode/blob/master/src-plugin/DrawLineAlgorithmTool.ts

## 矢印を書く
線を書くための点をもらったら、そのとおりに`SVG`を書きます。  
書いたら、`VectorNetwork`を取得して、ディープコピーした後、最初と最後の線を矢印で装飾します。  
この辺です。  

https://github.com/takusan23/yajirushi-mode/blob/master/src-plugin/CreateArrowTool.ts

## UI とプラグインでやり取りするメッセージ
何となく共通化しといたほうがいいかなと思ってこの辺に。  
`JSON.stringify`を使って文字列にした後、`Figma プラグイン`側にメッセージを送るため、シリアライズできる必要があります。  

https://github.com/takusan23/yajirushi-mode/blob/master/src-common/MessageTypes.ts

## UI 部分
- 編集画面がここで、
    - https://github.com/takusan23/yajirushi-mode/blob/master/src-ui/components/ArrowSetting.tsx
- 選択してないよエラーの時はここです
    - https://github.com/takusan23/yajirushi-mode/blob/master/src-ui/components/SelectError.tsx

編集画面の各編集項目はコンポーネントに切り出してます。  
面倒なので再レンダリングとかはまじで意識してないです、、、

https://github.com/takusan23/yajirushi-mode/blob/master/src-ui/components/ArrowSetting.tsx

そう言えば編集画面はかなり見通しが悪くなっちゃったので、カスタムフックに全部切り出しました。  
といっても、位置と、UIで入力したパラメーターくらいしか渡していなく、線をどこまで書けばいいか等は全部プラグイン側なので、、、

https://github.com/takusan23/yajirushi-mode/blob/master/src-ui/hooks/useArrowSetting.ts

ちょっと頑張ったので、縦並びを選択したら縦になるし、横並びで選択したら横になるようにした。  
https://github.com/takusan23/yajirushi-mode/blob/master/src-ui/hooks/useArrowSetting.ts#L85

![Imgur](https://i.imgur.com/ExYjO4Q.png)

![Imgur](https://i.imgur.com/xNrAuhJ.png)

# 公開
以下を参考に

- https://help.figma.com/hc/en-us/articles/4407531267607--BYFP-5-Publishing-to-the-Community
- https://help.figma.com/hc/en-us/articles/360042293394-Publish-plugins-to-the-Figma-Community#h_01HA2DQNF7CMZW2Q5T6H7DSZX0

プラグイン一覧を開くと、開発中のも表示されるので、ここから公開を押す。

![Imgur](https://i.imgur.com/a6WrM6g.png)

## リリースビルドする
もし`webpack`とか`vite`等のバンドラーが開発モードだった場合は本番にしてビルドしましょう。

## 二段階認証を有効にする
`Figma`アカウントを二段階認証できるようにしないとだめらしい

![Imgur](https://i.imgur.com/GJfZEE0.png)

## 公開に必要なもの
https://help.figma.com/hc/en-us/articles/360042293394-Publish-plugins-to-the-Figma-Community#Creators_and_contributors

必要な、というか面倒なのは以下ですね。

- 一番上にでる画像（`1920x1080`）
- アイコン（`128x128`）

![Imgur](https://i.imgur.com/gcsexY9.png)

説明とかは、まあ一応それっぽい英語と日本語で書いておきました。

![Imgur](https://i.imgur.com/FUL26wN.png)

連絡先とか、誰かと一緒に作った場合はここで追加できます。

![Imgur](https://i.imgur.com/pxvk5YW.png)

次にプライバシー？の質問があるけど、これはスキップできるらしい。  
サーバーにデータ送るか、ログイン機能があるか、インターネット経由でアセット（Webフォントとか）ダウンロードするか等。  
今回作ったプラグインはインターネット切り離しても動くと思う（必要なものは全てバンドルした）からほぼ`No`だと思う。

![Imgur](https://i.imgur.com/5TyxcPb.png)

これで公開できます。  
公開ボタンを押しましょう。

![Imgur](https://i.imgur.com/fDBXqHU.png)

できた

![Imgur](https://i.imgur.com/slKSKZ1.png)

アプリストアみたいに、審査があるらしい。わくてか

![Imgur](https://i.imgur.com/zivwcGY.png)

なんかプライバシーについての質問に答えると、ご協力ありがとうねって言ってくれます。

![Imgur](https://i.imgur.com/jAecZko.png)

# 審査通った
はやい。その日のうちに通ってない？  
審査結果はメールで貰えます。

# まとめ
- `Figma`の座標系は上に向けてマイナスになる
- 別に`UI側`を`HTML / CSS / JavaScript`で書いて、`プラグイン側`を`TypeScript (JS)`で書いてもいい
    - 今回は`esbuild`とか使って余計にややこしくなったけど...
- `esbuild`がとても速い
    - `ES6`向けにビルドするよう注意ね
- `React`やその周辺ツールは動くハズ。（`Tailwind CSS`、`i18next`も動いた）
    - ただし`index.html`一つにまとめる必要があるので`Vite`等のバンドラ設定しよう
- `UI`は`Figma`のコンポーネントが使えるかもしれない
- 公開はそんなに身構えなくていい

# メモ
- 多分`code.js`と`ui`の`index.html`は監視してる？
    - `npm run build`した後に`Figma デスクトップアプリ`に戻ると、プラグインが再読み込みされてる
- `Error: Syntax error on line 1: Unexpected token .`
    - `optional chaining`を使ったらエラーで進まなくなった。
        - `dataOrNull?.name`とか`dataOrNull?.getName?.()`みたいに、`Null`の可能性がある場合でも`?.`で呼び出せるやつ
    - `Figma`の`プラグイン`で動く方は、`ES6+`までの言語機能しか無い
        - `esbuild`のコマンドで`--target=es2015`すると、`?.`の構文を`ES2015 (ES6)`で動かせるように`esbuild`が書き直してくれます。
- ドキュメントをよく見ると結構いろんなパラメーター（というかプロパティーか）公開されている、遊びがいがある
    - https://www.figma.com/plugin-docs/api/VectorNode/
- 割と`TypeScript`力が試されている感が
    - `Kotlin`にはない概念というか、、、`TypeScript`の静的解析がとても賢いなと思う
    - いやでも型ガードの組み合わせとか本当にパズルそのものや・・・"型パズル"とはよく言ったものだなあと思います
- プラグインのアイコンは、プラグイン公開時のが使われるそうです
    - とくに`manifest.json`に書いたり..とかではない

# おわりに
`esbuild`がめちゃめちゃ速い。以上です。