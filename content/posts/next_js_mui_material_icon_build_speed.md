---
title: MaterialUIのアイコンを使うとビルド時間が遅くなるのを直す
created_at: 2021-10-02
tags:
- Next.js
- MaterialUI
- MaterialIcon
- TypeScript
---

どうもおはようございます。  
このサイトはNuxt.jsなんですけどね初見さん（記述時時点）

# 本題
`Next.js`に`Material UI`を入れたあと、`import`の書き方次第でビルド時間が長くなってしまう。

## どういうこと

```js
import { AndroidOutlined } from '@mui/icons-material'
```

よりも

```js
import AndroidOutlined from '@mui/icons-material/AndroidOutlined'
```

の方がビルド時間が高速になり、サイズが小さくなる

# 試してみる

```tsx
// index.tsx

import type { NextPage } from 'next'
import AndroidOutlined from '@mui/icons-material/AndroidOutlined'

const Home: NextPage = () => {
  return (
    <AndroidOutlined />
  )
}

export default Home
```

```tsx
// index.tsx

import type { NextPage } from 'next'
import { AndroidOutlined } from '@mui/icons-material'

const Home: NextPage = () => {
  return (
    <AndroidOutlined />
  )
}

export default Home
```

どちらも同じアイコンを画面に表示するコードです


# 検証結果

## import { AndroidOutlined } from '@mui/icons-material'

3.1 MB

![Imgur](https://i.imgur.com/z4ZXCC2.png)

## import AndroidOutlined from '@mui/icons-material/AndroidOutlined'

965 kB

![Imgur](https://i.imgur.com/ojVnl0z.png)

まじ？

# 本番ビルドは？

Next.jsの静的HTMLエクスポートをして比較してみる

## package.jsonにスクリプト追加

`npm run export`コマンドを追加します

```json
{
  "name": "next-material-ui",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "export": "next build && next export"
  },
```

## import { AndroidOutlined } from '@mui/icons-material'

```
Page                              Size     First Load JS
┌ ○ / (5246 ms)                   18.1 kB          85 kB
├   /_app                         0 B              67 kB
├ ○ /404                          194 B          67.2 kB
└ λ /api/hello                    0 B              67 kB
+ First Load JS shared by all     67 kB
  ├ chunks/framework.0441fa.js    42.4 kB
  ├ chunks/main.62b8ca.js         23.3 kB
  ├ chunks/pages/_app.d6feaf.js   557 B
  ├ chunks/webpack.1a8a25.js      729 B
  └ css/120f2e2270820d49a21f.css  209 B
```

## import AndroidOutlined from '@mui/icons-material/AndroidOutlined'

```
Page                              Size     First Load JS
┌ ○ / (444 ms)                    19.3 kB        86.3 kB
├   /_app                         0 B              67 kB
├ ○ /404                          194 B          67.2 kB
└ λ /api/hello                    0 B              67 kB
+ First Load JS shared by all     67 kB
  ├ chunks/framework.2191d1.js    42.4 kB
  ├ chunks/main.62b8ca.js         23.3 kB
  ├ chunks/pages/_app.d6feaf.js   557 B
  ├ chunks/webpack.1a8a25.js      729 B
  └ css/120f2e2270820d49a21f.css  209 B
```

なんか後者の方がファイルサイズ大きいんだけど。  
まぁ検証結果としては本番ビルドなら上記の書き方でもツリーシェイキング？で最適化が行われるのだと思う。だた時間はかかりますね、、、  

https://mui.com/guides/minimizing-bundle-size/#when-and-how-to-use-tree-shaking

# 開発時でもほしい

Babelを正しく設定すると同じパフォーマンスを出せるらしいです。

## プラグインを入れる

```
npm install babel-plugin-import --save-dev
```

## .babelrcに追記
プロジェクトのルートディレクトリ（package.jsonがあるフォルダ）に`.babelrc`って名前のファイルを追加します。  
追加したら、以下の内容を入れます。

```json
{
  "presets": [
    "next/babel"
  ],
  "plugins": [
    [
      "babel-plugin-import",
      {
        "libraryName": "@mui/material",
        "libraryDirectory": "",
        "camel2DashComponentName": false
      },
      "core"
    ],
    [
      "babel-plugin-import",
      {
        "libraryName": "@mui/icons-material",
        "libraryDirectory": "",
        "camel2DashComponentName": false
      },
      "icons"
    ]
  ]
}
```

## 内部サーバー起動

`npm run dev`

以上です。これで有効になるはずです。

![Imgur](https://i.imgur.com/wGoVOy8.png)

## ソースコード
ほい

https://github.com/takusan23/next-js-materialui-icon-babel