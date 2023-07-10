# ziyuutyou-next
たくさんの自由帳 Next.js リメイク版

[![Netlify Deploy](https://github.com/takusan23/ziyuutyou-next/actions/workflows/netlify-deploy.yml/badge.svg?branch=main)](https://github.com/takusan23/ziyuutyou-next/actions/workflows/netlify-deploy.yml)

![Imgur](https://imgur.com/6N5X7yQ.png)

`Next.js` / `MUI` / `unified` で出来ている。

## 開発環境構築

### 必要なもの

- Node.js
    - v18.13.0 以降？
    - 最新版を入れておけば良さそう
    - 本番環境へデプロイするならその環境のNode.jsのバージョンも確認してね

### 開発環境の起動まで

- このリポジトリをクローンします
- クローンしたフォルダ内でターミナルを立ち上げます
- 以下を実行します（初回時）
```
npm i
```
- 開発サーバーを立ち上げます
```
npm run dev
```
- (多分) `localhost:3000`をブラウザで開きます
- スマホで確認したい場合は`ローカルIPアドレス:3000`で見れるはず
    - `ipconfig`？`ifconfig`？でIPアドレスの確認ができると思います


### 本番環境でビルドして動作確認をする
本番環境でビルドして開発サーバーを立ち上げます。  
`next/link`のプリフェッチ機能などは本番ビルドしか動かないので

```
npm run build
npm run start
```

### 静的HTML書き出し(意味深)
以下のコマンドを叩くと
- すべてのページのhtml書き出し
- サイトマップ作成
が行われます。

CPU使用率が書き出し中は100%で張り付くけどしゃあない。

```
npm run deploy
```

#### 静的書き出し先

`out`フォルダに成果物が入っています。  
このフォルダを公開すればいいと思います。

### Netlify
私だけかもしれませんが、`Netlify`ではビルドできなくなってしまったので、  
もしどうやっても成功しない場合はこのリポジトリの`GitHub Actions`を参考に`GitHub Actions`でビルドしたあとに`Netlify`で書き出したファイルをホスティングするようにしてみてください。

## 環境変数
`.env`ファイルに公開先の URL などの値を入れています。  
`EnvironmentTool.ts`から値を参照できるようにしています。  

| 名前                              | 説明                                                                    |
|-----------------------------------|-------------------------------------------------------------------------|
| NEXT_PUBLIC_SITE_BASE_URL         | WebサイトのURLのドメインまで。`https://takusan.negitoro.dev/`みたいな。 |
| NEXT_PUBLIC_SITE_NAME             | サイト名です。`<title>`タグとかで使われます。                           |
| NEXT_PUBLIC_GITHUB_REPOSITORY_URL | `GitHub`のリポジトリです。記事本文ページの`GitHubで開く`で使われます。  |
| NEXT_PUBLIC_UA_TRACKING_ID        | `Google アナリティクス`の`ユニバーサルアナリティクス`の`測定ID`です。   |
| NEXT_PUBLIC_GA_TRACKING_ID        | `Google アナリティクス`の`GA4`の`測定ID`です。                          |

## ファイル構造

- .github/workflows
    - GitHub Actions にやらせる作業を書いたファイルです
    - GitHubのWeb上で編集することをおすすめします
- app
    - 画面遷移等のページ
    - AndroidのFragmentみたいな
- content
    - 記事のMarkdown とか 書き出し時に呼び出すJSONとか
- components
    - MUIには無いUI部品
- public
    - アイコン等のリソース
- src
    - components でも pages でもないTypeScriptファイルの置き場所
    - 記事読み込みクラスとか
- styles/css
    - ほとんどMUIがやってるけどちょっとだけcssを書いたので
- .env
    - 環境変数。サイトのURL など