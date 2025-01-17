---
title: Cloudflare Pages と Next.js（静的書き出し）
created_at: 2023-05-04
tags:
- CloudflarePages
- Next.js
---
どうもこんばんわ。  
目次のところの見た目を若干変えてみました（色変えただけ）

# 本題
どうやら`Netlify`と違って、日本に`CDN`があるらしく、（日本からも）読み込みが早いらしい。  
このブログは`Netlify`にあるわけですが（記述時時点）、もし良さそうなら移行しても良いかも？

# 適当に Next.js でサイトを作る
作りました。  
カラーコードのRGBをぞれぞれ取り出して、明るさを掛け算(0.0~1.0)することで簡易的にちょっと暗い色と明るい色を出すことができるサイトです。  
カラーコード 明るさ とかで調べたらこれが一番早そうだったので...  

https://github.com/takusan23/color-code-brightness

![Imgur](https://i.imgur.com/ye0JoqI.png)

# アカウントを作る

はい。言語設定から日本語が選べます。

![Imgur](https://i.imgur.com/byJ4gRk.png)

アカウントを作るとすぐにダッシュボードみたいな画面が開きます。

![Imgur](https://i.imgur.com/oRe7you.png)

# Pages を押す

新しいプロジェクトを押すとこんなのが出る

![Imgur](https://i.imgur.com/dzKHIwM.png)

今回は`GitHub`にある`Next.js`プロジェクトをホスティングしようと思います。  
他にもローカルで開発した`index.html / index.css / index.js`をアップロードして公開する方法もあります。お手軽ですね  

![Imgur](https://i.imgur.com/NcfzvRF.png)

`Next.js`を選んだらいい感じにビルドコマンドとかが埋まりました。楽だね

![Imgur](https://i.imgur.com/KsTCiKf.png)

ビルドが始まりました！こんな感じ  

![Imgur](https://i.imgur.com/SUvq8G1.png)

そしたらなんかコケた

## SyntaxError: Unexpected token '?'
`Node.js`のバージョンが足りない？合ってないらしいので、合わせます。  

https://developers.cloudflare.com/pages/platform/language-support-and-tools/

環境変数に入れる方法と、`.nvmrc`をリポジトリに置く方法（`package.json`と同じフォルダに入れる）がありますが、とりあえず後者でいきます。  

手元の開発環境で`node -v`したら`v18.13.0`だったのでそうしました。

![Imgur](https://i.imgur.com/AZriRlV.png)

これでコミットしてプッシュすると自動でビルドが試行されるはずです。無事ホスティングに成功しました。

![Imgur](https://i.imgur.com/EOn6lS1.png)

# 確かに早い気がする
`Netlify`でも同じサイトをホスティングしてみたけど、ちょっとだけ`Cloudflare Pages`のほうが読み込み早い気がする。  
良さそう！！！

![Imgur](https://i.imgur.com/233hxD5.png)

`PageSpeed Insights`（何使えばいいか知らないのでとりあえず）で測ってみましたが、やっぱ`Cloudflare`のほうが`Speed Index`の数値が良いですね。  

![Imgur](https://i.imgur.com/N1q0Cnz.png)

# GitHub Actions からホスティングできるか確認
別に`Cloudflare Pages`のビルド機能で十分なのですが、`GitHub Actions`を使ってたのを辞めるのは寂しいので（？？？）（なんか動いてたほうがおもろい←？？？）  

https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/#use-github-actions

## ちょうどいい action があった

こちらを使わせてもらいましょう。thx!

https://github.com/cloudflare/pages-action

## 必要な環境変数を用意する
GitHub Actions で使う機密情報を作りに行きます。  
多分2ついる

### CLOUDFLARE_API_TOKEN
アカウントページ？を開いた後、APIトークンから作成できます。

![Imgur](https://i.imgur.com/WLLj5k1.png)

多分これで良いはず。トークンは一度しか表示されないのでメモ帳とかにすぐにメモしておきましょう。

![Imgur](https://i.imgur.com/Ysdgaec.png)

### CLOUDFLARE_ACCOUNT_ID
ダッシュボードにログインしたときの、ドメインから後のURLについている(`dash.cloudflare.com/` から)値のことらしい。ドキュメントみるとなんか複雑なこと書いてあるけど  
（↓ちょうど塗りつぶしたところ）

![Imgur](https://i.imgur.com/RPXxh9i.png)

### GitHub に登録
ここからできます。  
`New repositroy secret`で追加することが出来ます。

![Imgur](https://i.imgur.com/B6bR67y.png)

## GitHub Actions を作る

そのまえに、自動デプロイを止めておきます

![Imgur](https://i.imgur.com/2VjGfKF.png)

そしたら以下のような`yaml`を書きます。  
`projectName`（Cloudflare Pages 上での名前）と`directory`（出力先のパス）は皆さんのプロジェクトごとに合わせて直してください。

```yaml
# GitHub Actions から Cloudflare Pages へ公開

# 名前
name: Publish Cloudflare Pages

# 起動条件。pushと手動起動
on:
  push:
  workflow_dispatch:

# やらせること
jobs:
  build:
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
        run: npx next build && npx next export 

      # 公開
      - name: Publish to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: color-code-brightness
          directory: out
```

あとは push すれば動くはずです。以下のように

![Imgur](https://i.imgur.com/gwuOamY.png)

# ドメイン
`Apexドメイン（サブドメイン以外）`を使う場合は`Cloudflare DNS ???`とか言うやつに登録しないといけないらしい。  
レジストラではなく、ネームサーバーが変わるだけなのでそこまで大変じゃなさそうな気はする。（何もわからない）  

今回はサブドメインを使ってみます。サブドメインの場合はネームサーバーの変更は必要ないらしいです。

![Imgur](https://i.imgur.com/t1ERNHe.png)

こんな感じにドメインを入力して

![Imgur](https://i.imgur.com/2pmxydu.png)

自分の DNS プロバイダー を選べば良さそうです。

![Imgur](https://i.imgur.com/UMYADH0.png)

私は `Google Domains` を使っているので、 DNS の設定を開き、`Cloudflare Pages`の指示通りに入力します。

![Imgur](https://i.imgur.com/Tcur1YT.png)

ボタンを押した、多分これで待ってれば完了するはず。楽ですね

![Imgur](https://i.imgur.com/ClLG1Fx.png)

歯磨きから戻ってきたら開けるようになってました！ちゃんと https です！

![Imgur](https://i.imgur.com/cqhSn0D.png)

# 終わりに
よさそう！！！  
全然関係ないけど `GitHub Actions` 失敗したらメールで教えてくれるのね。