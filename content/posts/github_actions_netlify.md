---
title: GitHub Actions でビルドして Netlify で公開する
created_at: 2023-01-09
tags:
- GitHub Actions
- Netlify
- 自作ブログ
- Next.js
---
どうもこんばんわ。成人おめでとうございます。  
成人式は中学校楽しくなかったので行きませんでした。

# 本題
`Netlify`でどうやってもビルドが通らなくなってしまった、、

# 環境
| なまえ  | あたい                       |
|---------|------------------------------|
| Next.js | 13.1.1                       |
| React   | 18.2.0                       |
| Node.js | v18.13.0  (14系から更新した) |

# どうやっても Netlify でビルドできなくなってしまった、、、
目次機能を追加したら`Netlify`の環境でビルドできなくなりました。  
手元ではビルドできるのに、、  

目次を取得するために`jsdom`でHTMLをパースしてるのが悪いんか？若干メモリ多く使う＋処理時間も長くなるけど...不足するほどではないはず、なぜ？

```plaintext
1:47:29 AM: info  - Compiled successfully
1:47:29 AM: info  - Collecting page data...
1:47:43 AM: info  - Generating static pages (0/236)
1:47:59 AM: info  - Generating static pages (59/236)
1:48:04 AM: info  - Generating static pages (118/236)
1:48:44 AM: Killed
1:48:46 AM: ​
1:48:46 AM:   "build.command" failed                                        
1:48:46 AM: ────────────────────────────────────────────────────────────────
1:48:46 AM: ​
1:48:46 AM:   Error message
1:48:46 AM:   Command failed with exit code 137: npm run deploy (https://ntl.fyi/exit-code-137)
1:48:46 AM: ​
1:48:46 AM:   Error location
1:48:46 AM:   In Build command from Netlify app:
1:48:46 AM:   npm run deploy
```

調べても出てこない、、ので良い機会だと思い`GitHub Actions`に移行しようかと思います。  
`GitHub Actions -> Netlify`なんて何番煎じかよって話ですが一応残しておきます。

## （ちなみに）やったこと
手元ではビルドできるので。`Netlify`ってエラーログ見せてくれるのかな

- `package-lock.json`の削除
- `Node.js`を`14.x`から`18.x`へアップデート

以上試しましたがダメでした。

# GitHub Actions #とは
ほかみて

[タグ名 GitHub Actions](/posts/tag/GitHub%20Actions/)

# Netlify側のビルドを止める
これはサイトの詳細ページへ進み、`Site settings`を押して、`Build & deploy`を押し、`Stopped builds`を押します。

![Imgur](https://i.imgur.com/H67TVrn.png)

# 必要な値を集める
GitHub Actions で利用する環境変数（アクセストークンみたいなやつ）を用意します。

## NETLIFY_AUTH_TOKEN
アカウントページの`Applications`へ進み、`New access token`を押します

![Imgur](https://i.imgur.com/fFKKdKT.png)

コピペして適当な場所に控えておきます。（メモ帳とか）

## NETLIFY_SITE_ID
これはサイトの詳細ページへ進み、`Site settings`を押して、`Site ID:`の値をコピーします。ちょうどコピーボタンが出てますね。

![Imgur](https://i.imgur.com/QrOEe6z.png)

## GitHub Actions から参照できるように 環境変数 に追加する
**Secrets**の中にある**Actions**を押します。

![Imgur](https://i.imgur.com/FLHXe3c.png)

そしたら、以下の名前で環境変数を作成します。  
<span style="border: solid 2px green;background-color:green;color:#fff;padding:2px;border-radius:5px"> New repository secret </span>を押すことで環境変数の追加ができます。

![Imgur](https://i.imgur.com/oDkdXDx.png)

| なまえ             | あたい                  |
|--------------------|-------------------------|
| NETLIFY_AUTH_TOKEN | `New access token` の値 |
| NETLIFY_SITE_ID    | `Site ID:` の値         |

# GitHub Actions を組む
ここから空の`yaml`ファイルが作成できるので

![Imgur](https://i.imgur.com/nb1dvD4.png)

あとは以下を参考に作ってください。  
以下の値は環境によっては違うので、`yaml`調整してください！

| なまえ         | あたい         |
|----------------|----------------|
| ビルドコマンド | npm run deploy |
| 成果物保存先   | ./out          |

ビルドコマンド、成果物保存先フォルダ名とかは各自違うと思うので

```yml
# Netlify でビルドできなくなってしまったので GitHub Actions にやらせます

# 名前
name: Netlify Deploy

# 起動条件。pushと手動起動
on:
  push:
  workflow_dispatch:

# やらせること
jobs:
  build:
    # OS
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      # Node.js インストール
      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18.13.0
      
      # 依存関係
      - name: Package install
        run: npm i
      
      # 書き出し
      - name: Build page
        run: npm run deploy
        
      # Netlify アップロード
      - name: Upload page
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=./out --prod
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

# コミットして実行する
コミットします。`push`がトリガー？されるので`GitHub Actions`も動くと思います。

![Imgur](https://i.imgur.com/kWVSwcB.png)

成功しました。やったぜ～～～  
それにしても長いな、、、どうしようこれ

![Imgur](https://i.imgur.com/vCeXSpb.png)

# おまけ

## 手動実行ボタン
ここ

![Imgur](https://i.imgur.com/S52InIw.png)

## Markdownに貼り付けるステータスバッジ？バッヂ？
`Create status badge`から`Markdown`をコピーできます

![Imgur](https://i.imgur.com/3oL1BLX.png)

# おわりに1
もしかしたら記事が多すぎたせいかもしれないです。少ない場合は以前通り`Netlify`でビルドできるかもしれないです。

# おわりに2

```ts
import { JSDOM } from "jsdom"

static parseToc(html: string): TocData[] {
    // HTML パーサー ライブラリを利用して h1 , h2 ... を取得する
    // この関数は ブラウザ ではなく Node.js から呼び出されるため、document は使えない。
    const window = (new JSDOM(html)).window
    const document = window.document
    const tocElementList = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    // 目次データに変換して返す
    const tocDataList: TocData[] = Array.from(tocElementList).map((element) => ({
        label: element.textContent,
        level: Number(element.tagName.charAt(1)), // h1 の 1 だけ取り出し数値型へ
        hashTag: `#${element.getAttribute('id')}` // id属性 を取り出し、先頭に#をつける
    }))
    window.close()
    return tocDataList
}
```

目次機能のために生成したHTMLからh1,h2...を取得するために、HTMLパーサーにかけてるんですけど、これのせいで多分ビルド時間が伸びてしまった、、、  
（10分以上かかる。`GitHub Actions`、パブリックリポジトリの場合は無料だけど長いのはちょっと、、）  
`jsdom`じゃなくて`Unified`でいい感じに処理するべきなのかな。  
（最初は`Unified`が吐き出す構文木をパースしてたけど、あとあとメンテすることを考えると`JS の Document`みたいな感じのAPIが使いやすいかなと思い切り替えたんですよね、、、）

以上です。数値型への変換は`parseInt`より`Number`が良いって言ってました。