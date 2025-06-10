# ziyuutyou-next
たくさんの自由帳 Next.js リメイク版

[![Netlify Deploy](https://github.com/takusan23/ziyuutyou-next/actions/workflows/netlify-deploy.yml/badge.svg?branch=main)](https://github.com/takusan23/ziyuutyou-next/actions/workflows/netlify-deploy.yml)

[![AWS Deploy](https://github.com/takusan23/ziyuutyou-next/actions/workflows/aws-deploy.yml/badge.svg?branch=main)](https://github.com/takusan23/ziyuutyou-next/actions/workflows/aws-deploy.yml)

![top](https://oekakityou.negitoro.dev/original/4910cb3c-a80c-44d2-bce1-ffe30824f886.png)

![blog](https://oekakityou.negitoro.dev/original/a346866d-582b-4265-b668-525f8651c59b.png)

![codeblock-linkcard](https://oekakityou.negitoro.dev/original/164f4786-9f94-4127-abdb-cfc5bf848a14.png)

![darkmode](https://oekakityou.negitoro.dev/original/5bc8852c-2de3-4583-bbd8-c11827b8c19b.png)

`Next.js` / `Tailwind CSS` / `unified` で出来ている。

## 開発環境構築

### 必要なもの

- Node.js
    - v20.9.0 以降？
    - LTS の最新版を入れておけば良さそう
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

### 記事の書き方
マークダウンで書きます。  
`content`フォルダ内`posts`フォルダへマークダウンのファイルを作成することで、記事を作ることが出来ます。  

また、`Next.js`のキャッシュ機能を利用し、できる限り`マークダウン→HTML`の変換回数が少なくなるようになっています。  
**その影響で開発サーバーを立ち上げて記事を開いても、リロードしても反映されないことがあります。**  
その場合は **スーパーリロード（force refresh / force reload）** を試してみてください。多分キャッシュが消えるはず。

対応している記法は以下です
- CommonMark
- GitHub Flavored Markdown
    - CommonMark にはテーブル作れないので
- HTML 埋め込み
- シンタックスハイライト（shiki）

追加で以下の機能を自前で実装しています
- リンクカード
    - `[]()`の場合はカッコの文字が優先されます
    - URL を直接書いたらリンクカードになります
- `<script>`の埋め込み
- コードブロックのコピー
- 画像の遅延読み込み（`loading="lazy"`）
- 見出しに id 属性付与

#### Markdown を描画するコンポーネント
`Markdown`から`HTML`にしたあと、できる限り自分で`JSX (HTML)`を描画するようになっています。  
`<MarkdownRender/>`参照。

期待通りに動いているか確認するテストコードが存在します。  
`__test__`フォルダ参照。

`vitest` + `testing-library/react` を利用しています。  
以下のコマンドでテストコードを実行できます。

```shell
npm run test
```

### 本番環境でビルドして動作確認をする
本番環境でビルドして開発サーバーを立ち上げます。  
`next/link`のプリフェッチ機能、`Google Analytics`、`pagefind`の検索機能とかは本番ビルドしか動かないので

静的書き出しをします  
```shell
npm run deploy
```

そのあと、静的書き出し結果を指定して開発サーバーを起動します。  
```shell
npm run start
```

### 検索機能
`pagefind`を利用して、静的サイトでも全文検索が出来るようになっています（不思議！）  
検索結果の対象になるのは、`app/posts/[blog]/page.tsx`だけです。理由は`data-pagefind-body`を付けているのがそのファイルだけなので。  
他の画面も検索対象にしたい場合は`data-pagefind-body`を付けてください。

全文検索がつきましたが、もちろんこのサイトは静的サイトとして配信できます。

### 静的HTML書き出し(意味深)
`サーバーでのレンダリング（Server Side Rendering）`機能は使っていないので、  
全て`静的サイト（Static Site Generation）`として書き出せます。

以下のコマンドを叩くと
- すべてのページの html 書き出し
- OGP 画像の生成
- サイトマップとか
- pagefind のインデックス
が行われます。

CPU 使用率が書き出し中は 100% で張り付くけどしゃあない。

```
npm run deploy
```

#### 静的書き出し先

`out`フォルダに成果物が入っています。  
このフォルダを公開すればいいと思います。

## 環境変数
`.env`ファイルに公開先の URL などの値を入れています。  
`EnvironmentTool.ts`から値を参照できるようにしています。  

| 名前                  | 説明                                                                                                                  |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------|
| SITE_BASE_URL         | WebサイトのURLのドメインまで。`https://takusan.negitoro.dev/`みたいな。                                               |
| SITE_NAME             | サイト名です。`<title>`タグとかで使われます。                                                                         |
| GITHUB_REPOSITORY_URL | `GitHub`のリポジトリです。記事本文ページの`GitHubで開く`で使われます。                                                |
| GA_TRACKING_ID        | `Google アナリティクス`の`GA4`の`測定ID`です。                                                                        |
| GOOGLE_SEARCH_CONSOLE | `Google Search Console`の所有権確認のために、`HTML タグ`の`content`の値を入れてください。任意なので無くても動くはず。 |
| NO_INDEX_MODE         | 検索結果にでないように、`<meta>`タグで`noindex`を指定したい場合は true を入れる。任意です。                           |
| DISABLE_OGP_IMAGE     | OGP 画像を配信しない場合は true。`<head>`から OGP 画像の URL を消します。任意です。                                   |

## GitHub Actions
`Netlify （ビルドは GitHub Actions でやってホスティングは Netlify）`と`Amazon S3 + Amazon CloudFront`の2種類があります。  
`Netlify`の`ビルド機能`はなんかこのリポジトリだと動かなくなったので、`GitHub Actions`書きました。  

もし使わない場合は`Actions`の画面で無効にしたいワークフローを押して、`Disable workflow`を押すことで無効にできます。  

![Imgur](https://i.imgur.com/Jm1V17f.png)

### Netlify で公開する
必要なシークレットはこの2つです

| 名前               | 値                                                                            |
|--------------------|-------------------------------------------------------------------------------|
| NETLIFY_AUTH_TOKEN | `Netlify のアカウント画面` >  `Applications` > `New access token`から生成する |
| NETLIFY_SITE_ID    | `Netlify のサイト詳細画面` > `Site configuration` > `Site ID` をコピー        |

![Imgur](https://i.imgur.com/4EeM4q4.png)

詳しくは昔書いたのでそっち見てください：  
https://takusan.negitoro.dev/posts/github_actions_netlify/

### Amazon S3 + Amazon CloudFront で公開する
必要なシークレットはこの4つです。  
`OpenID Connect`を使う方法で認証するのでちょっとややこしいです。（アクセスキー使うように直してもいいんじゃない？）

| 名前                        | 値                                                    |
|-----------------------------|-------------------------------------------------------|
| AWS_CLOUDFRONT_DISTRIBUTION | `Amazon CloudFront`のディストリビューションの`ID`です |
| AWS_REGION                  | リージョン、多分東京でいいはず？ `ap-northeast-1`     |
| AWS_ROLE                    | `IAM ロール`の`ARN`の値です                           |
| AWS_S3_BACKET               | ビルド成果物を保存する`S3 バケット`の名前です         |

![Imgur](https://i.imgur.com/nAFBOTS.png)

詳しくは書いたので見てください：  
https://takusan.negitoro.dev/posts/aws_sitatic_site_hosting/

## ファイル構造

- __test__
    - `vitest` + `testing-library/react` を使ったテストです
    - 今のところマークダウンが描画されるかくらいしか見ていません
- .github/workflows
    - GitHub Actions にやらせる作業を書いたファイルです
    - GitHub の Web 上で編集することをおすすめします
- app
    - 画面遷移時のページや共通レイアウト
    - Android の Fragment みたいな
- content
    - 記事の Markdown とか書き出し時に呼び出す JSON とか
- components
    - 共通して使うコンポーネント
- public
    - アイコン等のリソース
- src
    - components でも app でもないTypeScriptファイルの置き場所
    - 記事読み込みクラスとか
- styles/css
    - Tailwind CSS でちょっと書いた、記事本文とか
- .env
    - 環境変数。サイトの URL など