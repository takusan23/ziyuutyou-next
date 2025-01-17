---
title: CloudFront と S3 で静的サイトホスティングをする
created_at: 2023-11-30
tags:
- AWS
- CloudFront
- S3
- GitHub Actions
- 自作ブログ
---

どうもこんにちは。  
コイバナ恋愛 攻略しました。めっちゃおもろかったです  
特に共通ルート面白い！！男友達とバカやってるのがいい。

![Imgur](https://i.imgur.com/A3ICcod.png)

髪下ろしてるのかわいい

![Imgur](https://i.imgur.com/iSCoiXi.png)

![Imgur](https://i.imgur.com/PIKA4gF.png)

個別みじかい！！！ただでさえ短い個別がサブカプに取られてて更に短くなってる気がする；；  
（でもサブカプの話も面白かった）

![Imgur](https://i.imgur.com/OOWE1Tm.png)

![Imgur](https://i.imgur.com/BGdW24P.png)

（ところでこの手の途中下車パターン（？）ってセーブして先に共通全部見るのがいいのかな、どうなんだろう）

![Imgur](https://i.imgur.com/5NSCFSh.png)

おすすめです！

# 本題
このブログは `Netlify` にあるわけですが、読み込みが遅い・・・  
原因は日本には`CDN`が無いらしく？（今もなはず？2020年から速度変わってない気がするんだよな）、日本からアクセスだとちょっと遅い。

# ほかを探す
個人の感想 + 昔使ったことがあるとかで今は知らない ので参考にしてはいけない。  
静的ファイルホスティングなので、`SSR`とかしたい場合知らないです

- Cloudflare Pages
    - 無料枠がすごい
    - `APEX`ドメイン使いたい場合はドメインの`CDN`を`Cloudflare DNS`にしないといけないぐらいしか欠点がなさそう感
    - 前調査したけど使いやすさは同じ感じだと思う。日本からも早いよ
        - https://takusan.negitoro.dev/posts/cloudflare_pages_next_js/
- Vercel
    - `Next.js` 作ってる会社
        - あんまり無いと思うけど`Next.js`の一部の機能（`next/image`とか）は`Vercel`か`レンタルサーバーで Node.js を動かす`のどっちかが必要だったはずで、`Netlify`のノリで`Next.js`全部の機能を使いたければこれが良さそう
            - 別に使ってないですが・・・
    - 一回だけ使ったことがある、UI が綺麗だった記憶
- Netlify
    - このサイトをホスティングしている（記述時時点）
    - 日本からのアクセスが遅い（多分今も）
    - （今もか知らない + ネット情報なのでよく分かりませんが）無料枠を超えてしまった場合は利用停止ではなく課金が勝手に始まるらしい
    - パソコンにある`index.html`が入ってるフォルダをドラッグアンドドロップすればデプロイ出来る機能とかが便利だった
        - `Cloudflare Pages`にもある（小声）
- GitHub Pages
    - 仕様がちょっとあったはず
        - 公開するフォルダの名前を`/docs`にするか、ルートに置くか
        - パブリックリポジトリじゃないといけない
    - なんかすぐ反映されないことがあった記憶
        - URL を直接変えると最新のが降ってくるとか
    - 一回使ったことあるしいいかな・・・
- Firebase Hosting
    - このためだけに`Firebase`のプロジェクト作るのアレじゃない・・・
        - すでに`FCM`とか使ってるならいいんじゃない？
    - 数年前に`CLI`経由でデプロイした気がするけど、いまも`CLI`経由しか無いんですかね？

こんなかんじ（めっちゃ個人的というか偏ってるな）  
うーん`Cloudflare Pages`かなあ

## AWS
そういえば`お一人様 Misskey`のために`AWS`の`Lightsail や S3`を使っているわけですが  
すでに`AWS`使ってるならこのサイトも`AWS`に乗せていいのでは・・！

料金もお一人様を動かす費用から見たらたいしたことないはず。。です

（後なんか`AWS`で動かしてるのなんかかっこいいじゃん）

# AWS で静的サイトホスティングするには
二択あるらしい

- Amplify を使う
- CloudFront + S3 を使う

前者の`Amplify`だと、`CI/CD`機能が標準であったりして簡単に倒していそう、  
ただ、転送量の無料枠、`CloudFront`よりも低く設定し過ぎじゃない・・・？

後者の`CloudFront + S3`を使う方法だと、2つのサービス（正確にはもうちょっとある）を使う必要がある、`CI/CD`を自前で用意する必要がある  
が、`GitHub Actions`すでにあるし、何と言っても**無料枠**も`CloudFront`のほうがあるのでこっちで！

## CloudFront + S3 も二通りある
参考にしました：https://dev.classmethod.jp/articles/s3-cloudfront-static-site-design-patterns-2022/

どっちも一長一短で、難しい

- `S3`の静的サイトホスティング機能を有効にして、`CloudFront`を経由してアクセスするようにする
    - `S3`単体だと`https`に出来ないので、`CloudFront`を噛ますようにします、他にもキャッシュしてくれるので
- `S3`の静的サイトホスティングは利用しないで、`CloudFront`からリクエストが来たら`S3`から取り出す
    - `CloudFront Functions`を利用する必要があります

![Imgur](https://i.imgur.com/vFiSanr.png)

### S3 の静的ホスティング機能を使う

![Imgur](https://i.imgur.com/j6jUZzv.png)

前者の`S3 静的サイトホスティング`の方法が簡単ですが、アクセスを`CloudFront`限定にすることが出来ません。  
`S3`の静的サイトホスティング用のURLがバレた（あるのかな・・）場合、`S3`にアクセスできてしまいます。  
（`CloudFront`を噛ますことでキャッシュを返してくれて、`S3へのアクセス料金`が安くなるのですが、`S3`に直接アクセスされると料金が安くならない！）  

### S3 の静的ホスティング機能を使わない

![Imgur](https://i.imgur.com/ILoU23a.png)

後者は`S3`からとってくるのは`CloudFront`しか出来ないので、アクセスを`CloudFront`だけに出来ます。  
一方、`S3の静的サイトホスティング`機能の一つに、**インデックスドキュメント機能**というのが存在し、これは`/`や`/about`等にアクセスが来た際に自動的に`index.html`をレスポンスとして返してくれるのですが、  
この機能は`CloudFront`にはなく、`/about`にアクセスされてしまった場合`403? 404?`になってしまいます。  
何もしない場合は`/about.html`や`/about/index.html`みたく、`index.html`までURLを書かないと正しく表示できません。  

この解決のために`CloudFront Functions`という、リクエストが来た際に`index.html`をURLに足すような`JavaScript`コードを書くことで実現出来ます。  
`JavaScript`を書くと言っても、既にサンプルがあるのでこれをコピーするだけだと思います。  
https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/example-function-add-index.html

`CloudFront Functions`は一ヶ月`200万`リクエストまでは無料で出来るので、多分この規模なら超えることはない・・・ハズ？  

でどっちを使うかなんですが、`後者`を試してみようと思います。  
直接アクセスはやっぱされたくないかなー・・・

# つくる！！

大体これとおなじ  
https://docs.aws.amazon.com/ja_jp/AmazonS3/latest/userguide/HostingWebsiteOnS3Setup.html

## ながれ

- `S3`のバケットを作る
- `S3` にファイルを置く
    - (静的サイトホスティングするファイルを置く)
- `CloudFront`のディストリビューションを作る
    - `OAC`で`S3`をオリジンとして利用できるように
- `CloudFront`でドメインと`HTTPS`化を行う
- `CloudFront Functions`を書く
- `GitHub Actions`で`git push`時に`S3`にアップロードと`CloudFront`のキャッシュクリア
- エラー時の代わりのページの設定
- ドメインの向き先を`CloudFront`にする(`CNAME`の値を`CloudFront`にして、リクエストが`CloudFront`に向くようにする)

## S3 のバケットを作る
`S3`のバケットを作ります、名前はおまかせします。  
東京リージョンでいいはずですが、`CloudFront`を経由させるので本当に金払いたくなければ安いところでいいんじゃね？知らんけど

![Imgur](https://i.imgur.com/lNokaFR.png)

その他の設定は変えずに、作ります！

## S3 にファイルを置く
が、この時点で`Next.js`の`SSG`をして公開するファイルを生成するのは面倒なので、適当に確認用の`index.html`を書いてアップロードします  
ところで`VSCode`で`!`を書いた後にエンターを押すと`html`のひな形みたいなのが出てくるんですけど、これ`VSCode`の標準機能なんですかね？

![Imgur](https://i.imgur.com/ODqYWk9.png)

![Imgur](https://i.imgur.com/7xzU4C1.png)

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>てすと</title>
</head>

<body>
    あいうえお
</body>

</html>
```

`S3`の画面へドラッグアンドドロップすればアップロード出来ます  

![Imgur](https://i.imgur.com/bg5ZKYt.png)

![Imgur](https://i.imgur.com/8GyMKpQ.png)

## CloudFront のディストリビューションを作る
さんこう：https://repost.aws/ja/knowledge-center/cloudfront-serve-static-website

`CloudFront`に移動して、`ディストリビューションを作成`を押します  

![Imgur](https://i.imgur.com/n0H8LPK.png)

オリジンはさっき作った`S3`のバケットを選びます。  
ドロップダウンメニューで選べるので入力しなくて済むはず

![Imgur](https://i.imgur.com/rNqTBCj.png)

次は`オリジンアクセス`、これは`Origin access control settings (recommended)`を選び、

![Imgur](https://i.imgur.com/lXj95Ax.png)

`コントロール設定を作成`を押して作成画面を開きます  
多分デフォルトで作成すればいいはず、説明とかはおまかせします。

![Imgur](https://i.imgur.com/LtrEgVJ.png)

この警告はディストリビューション作成後に対応するので一旦飛ばします。

![Imgur](https://i.imgur.com/g0vO4jI.png)

次は`WAF`ですが、よくわからないので無効にしておきました。

![Imgur](https://i.imgur.com/HLpM7ip.png)

これで作成を行います！

そしたら上の方に案内が出ているので、`ポリシーをコピー`して`S3 バケット～`のリンクを開きます。

![Imgur](https://i.imgur.com/uIDsZst.png)

そしたら、`バケットポリシー`の項目までスクロールして、`編集`を押します

![Imgur](https://i.imgur.com/lSd7ujJ.png)

エディターが表示されるので、さっきコピーした内容を貼り付けて`変更の保存`を押します。

そしたら`CloudFront`に戻ってきてください。アクセスできるか確認します  
`ディストリビューションドメイン名`をコピーして、後ろに`/index.html`をつけてリクエストしてみます。

![Imgur](https://i.imgur.com/pE9Kcqj.png)

どうでしょう？`index.html`が表示されましたか？

![Imgur](https://i.imgur.com/yzBH9pn.png)

ちょっとそれますが`CloudFront`から帰ってきた場合、`CloudFront`側のキャッシュが帰ってきたのか、キャッシュもなく`S3`からとってきたのかはレスポンスヘッダーから見ることが出来ます。  
一回目は`Miss from cloudfront`、二回目以降は`Hit from cloudfront`が帰ってくるはず。

```bash
C:\Users\takusan23>curl -I https://{ディストリビューションドメイン名}/index.html
HTTP/1.1 200 OK
Content-Type: text/html
Server: AmazonS3
X-Cache: Miss from cloudfront

C:\Users\takusan23>curl -I https://{ディストリビューションドメイン名}/index.html
HTTP/1.1 200 OK
Content-Type: text/html
Server: AmazonS3
X-Cache: Hit from cloudfront
```

## カスタムドメインと HTTPS 化
既に`https`ですが、カスタムドメインを設定する際に`https`周りの作業が必要なので・・  

さんこう：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html

`CloudFront`のディストリビューションを開いて、`編集`を押します。

![Imgur](https://i.imgur.com/KlyMbGu.png)

代替ドメイン名という項目があるので、`項目を追加`を押します

![Imgur](https://i.imgur.com/UY8YeEk.png)

はい

![Imgur](https://i.imgur.com/P1egbom.png)

これで`変更を保存`しようとすると、、、出来ません。

![Imgur](https://i.imgur.com/btTeJsA.png)

```plaintext
To add an alternate domain name (CNAME) to a CloudFront distribution, you must attach a trusted certificate that validates your authorization to use the domain name. For more details, see: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html#alternate-domain-names-requirements
```

`カスタム SSL 証明書 - オプション`の項目もやらないといけないようです。  
というわけでスクロールして戻って、`証明書をリクエスト`を押します

![Imgur](https://i.imgur.com/seUSf9U.png)

`AWS Certificate Manager (ACM)`が開くはず、  
`CloudFront`で使う証明書は**リージョンが**`バージニア北部`である必要があるのでちゃんと確認しましょう。

![Imgur](https://i.imgur.com/3SRt3iD.png)

`パブリック証明書をリクエスト`で`次へ`

![Imgur](https://i.imgur.com/OEjRy9J.png)

`完全修飾ドメイン名`は`https://こ↑こ↓/index.html`の部分です、`FQDN`とかかっこいい名前がついてる  
サブドメインじゃない場合はどうなんだろう・・・

![Imgur](https://i.imgur.com/IaRbDe7.png)

検証方法は`DNS`でいいはず

![Imgur](https://i.imgur.com/ckLuPwh.png)

その他の項目はそのままにして、`リクエスト`を押します

すると上の方に、追加のアクションが必要ですみたいなのが出てくるので、`証明書を表示`を押します。

![Imgur](https://i.imgur.com/PDBs3kr.png)

ちょっとスクロールすると、`ドメイン`の項目で`CNAME 名`、`CNAME 値`が表示されているはず。  
この値を使ってドメインを持っていることを証明します。

### DNS のレコードを追加する
私はドメインの`DNS`に`Cloudflare DNS`を使っています。  
が、別に特別なことはしてないので操作は大体同じだと思います。

`Cloudflare`にログインした後、ドメイン名を押して`DNS`を開いて、レコードを追加する画面を出します。  
タイプは`CNAME`にして、名前には`CNAME 名`、値には`CNAME 値`をそれぞれ入れます。  
入力の際に一番最後の`.`が消えちゃいますが特に問題なかったです。

`Cloudflare`の場合は追加で`Proxy`するか選べますが、別にユーザー公開するやつじゃないので`Proxy`するまでもないはずなのでチェックを外して`DNS Only`にします。

![Imgur](https://i.imgur.com/XItCxB1.png)

![Imgur](https://i.imgur.com/Z0i2wli.png)

あとは`AWS`側で証明が終わるまで待ちます。

![Imgur](https://i.imgur.com/wGa0Dy1.png)

終わるとこんな感じにチェックマークが付きます

![Imgur](https://i.imgur.com/gyYxHX4.png)

あとは`CloudFront`のディストリビューション設定に戻って、さっき作った証明書を設定します。  

![Imgur](https://i.imgur.com/RFmtkGx.png)

これでようやく設定が変更できました。

![Imgur](https://i.imgur.com/wTqlpd4.png)

あ、あとリージョンを元の（多分？東京）に戻しておいてね、多分戻ってると思うけど

## CloudFront Functions を書く

こうすることで、`https://takusan.negitoro.dev/index.html`みたいなURLを  
`https://takusan.negitoro.dev/`みたいに`index.html`省略してリクエストできるようにします。

↓ 以下現状

![Imgur](https://i.imgur.com/xSTpY55.png)

`CloudFront`から`関数`を選び、`関数を作成`を押します。  

![Imgur](https://i.imgur.com/oDbRcgT.png)

![Imgur](https://i.imgur.com/B9nRaN2.png)

いい感じの名前をつけます、説明はお任せ

![Imgur](https://i.imgur.com/qUbI8q0.png)

`JavaScript`のコードは以下のものを使うことにします。  
https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/example-function-add-index.html

書いたら`変更の保存`して、

![Imgur](https://i.imgur.com/yHePqVR.png)

`発行`を押します

![Imgur](https://i.imgur.com/iIT1w38.png)

そしたら`関連付けを追加`を押して

![Imgur](https://i.imgur.com/vz77Ivu.png)

埋めます。  

- ディストリビューション はさっき作った`CloudFront`を選ぶ
- イベントタイプ は`Viewer request`を選ぶ
- キャッシュビヘイビア は多分`default`？

![Imgur](https://i.imgur.com/72YY6lN.png)

`関連付けを追加`を押します。

なんか時間かかってるけど待ちます

![Imgur](https://i.imgur.com/99TDbjq.png)

成功していれば、`index.html`無しで開けるようになっているはずです！

![Imgur](https://i.imgur.com/TPxfjnN.png)

## GitHub Actions で S3 へアップロードし、CloudFront のキャッシュを消す

さんこう：https://zenn.dev/kou_pg_0131/articles/gh-actions-oidc-aws  
さんこう：https://docs.github.com/ja/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services

さて、二日目に突入しました、がんばります  
`GitHub Actions`にビルドしてもらって成果物を`S3`にアップロードして、`CloudFront`が持っているキャッシュを消す作業をしてもらいます。  

調べてみると`OpenID Connect`のほうがいいらしいので、今回はアクセスキーじゃなくてこっちを使ってみる。  
アクセスキーだと`GitHub`へ機密情報（アクセスキー）を登録しないといけないのに対し、`OpenID Connect (OIDC)`だと`GitHub`へ機密情報を渡すこと無く同様のことが出来るらしい

### AWS 側

まずは`IAM`の管理画面へ進み、`ID プロバイダ`を押して、`プロバイダを追加を押す`

![Imgur](https://i.imgur.com/UF4dhWm.png)

そしたら以下の項目を埋めます

- プロバイダのタイプ
    - 「OpenID Connect」を選ぶ
- プロバイダの URL
    - `https://token.actions.githubusercontent.com`
- 対象者
    - `sts.amazonaws.com`

![Imgur](https://i.imgur.com/gmCr9WM.png)

埋めたら`サムプリントを取得`を押します、押したらなんか出ます、、がそのままスクロールして`プロバイダを追加`を押して閉じます

![Imgur](https://i.imgur.com/urqinjn.png)

完了したら、上の方に`IAM ロール`を追加しろと出るので、追加します。  
`ロールの割り当て`を押しましょう

![Imgur](https://i.imgur.com/b445E8m.png)

`新しいロールの作成`、でいいはず

![Imgur](https://i.imgur.com/GpFnDVp.png)

ラジオボタンは`ウェブアイデンティティ`を選びます。  
以下を埋めます（各自違うはず）

- Audience
    - ドロップダウンメニューを開くと一個だけあるのでそれ
- GitHub 組織
    - GitHub の名前
- GitHub リポジトリ
    - GitHub のリポジトリ。多分必要、省略するとユーザー名が合っていれば使えるとかなんですかね？

ブランチも制限出来るらしいですがとりあえずこれで。

![Imgur](https://i.imgur.com/sIYD0Ij.png)

次は許可する権限を設定する画面です。  

![Imgur](https://i.imgur.com/9hYBnLL.png)

多分独自のポリシーを作らないといけないはず・・（読み取り権限を指定した`S3 バケット`に付与、みたいな）  
がとりあえず今回は`AmazonS3FullAccess`と`CloudFrontFullAccess`を付けました、多分指定したリソース（`S3バケット`、`CloudFront ディストリビューション`）だけにアクセスできるようにするのがお作法な気がする

![Imgur](https://i.imgur.com/sSTmOuW.png)

![Imgur](https://i.imgur.com/7ZJh5Nb.png)

そしたら次へ進み、名前と説明をいい感じに入れて`ロールを作成`を押します

![Imgur](https://i.imgur.com/JNqcEgo.png)

これで完了。次は`GitHub Actions`を書いていきます。  

### GitHub 側
さんこう：https://docs.github.com/ja/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services

まずは必要な値を`GitHub`のシークレットに登録します！  
アクセスキーは登録する必要がなくなりましたが、`S3 のバケット名`とか`CloudFrontのディストリビューション名`とかは隠さないといけないので・・・  

`GitHub`のリポジトリの設定画面から、`Secrets and variables`を押して、`Actions`を押す  
`New repository secret`を押して、追加画面を出します

![Imgur](https://i.imgur.com/ZqBwoBs.png)

![Imgur](https://i.imgur.com/dMnmNOL.png)

![Imgur](https://i.imgur.com/m2NWHX0.png)

シークレットに登録する値は以下の4つです。  
（後述する`GitHub Actions`の`yml`をまるまるコピーする場合）

| なまえ                      | あたい                                                                            |
|-----------------------------|-----------------------------------------------------------------------------------|
| AWS_ROLE                    | IAM ロールの ARN の値です。コピーしてね ![Imgur](https://i.imgur.com/VCEf3SQ.png) |
| AWS_REGION                  | リージョンです、多分東京 `ap-northeast-1` でいいはず？                            |
| AWS_S3_BACKET               | ビルド成果物を保存する`S3 バケット`の名前です                                     |
| AWS_CLOUDFRONT_DISTRIBUTION | `CloudFront`のディストリビューションIDです、ID の列に出てるやつ                   |

出来ました！

![Imgur](https://i.imgur.com/oPrmpCf.png)

次は`GitHub Actions`を書いていきます、  
`Actions`を開きます。既に一個あるので、ここから追加します

![Imgur](https://i.imgur.com/54DRJCu.png)

一個もない場合は多分こっちの画面が最初から出ると思う。  
`set up a workflow yourself`を選びます

![Imgur](https://i.imgur.com/v7ioE15.png)

そして以下のような`yml`を書きます。  
ビルド成果物のフォルダが`./out`じゃない場合は直してください。

`s3 sync --delete`を使うとローカルとS3バケットの中身が一緒になるように同期してくれるそうです！すごい  

`CloudFront`のキャッシュも消します。`/*`で一括削除です。キャッシュクリアは回数制限がありますが無料で出来ます。  
（ワイルドカードを使うと無料でできる回数制限の枠を一つだけ消費した上で、複数のファイルに対してキャッシュクリア出来るのでお得！）  
https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html#PayingForInvalidation

```yml
# ビルドして成果物を Amazon S3 にアップロードして、CloudFront のキャッシュを消す

# 名前
name: AWS Deploy

# 起動条件。pushと手動起動
on:
  push:
  workflow_dispatch:

# OpenID Connect
permissions:
  id-token: write
  contents: read

# やらせること
jobs:
  build:
    # OS
    runs-on: ubuntu-latest
    steps:

      # リポジトリをクローン
      - name: Clone repository
        uses: actions/checkout@v2

      # AWS の認証を行う
      - name: Setup aws credentials
        uses: aws-actions/configure-aws-credentials@v3
        with:
          role-to-assume: ${{ secrets.AWS_ROLE }}
          aws-region: ${{ secrets.AWS_REGION }}
      
      # Node.js インストール
      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20.9.0
      
      # 依存関係
      - name: Package install
        run: npm i
      
      # 書き出し
      - name: Build page
        run: npm run deploy
        
      # Amazon S3 のバケットにアップロード
      - name: Upload S3 backet
        run: aws s3 sync --delete ./out s3://${{ secrets.AWS_S3_BACKET }}

      # CloudFront のキャッシュを消す
      - name: Clear CloudFront cache
        run: aws cloudfront create-invalidation --distribution-id ${{ secrets.AWS_CLOUDFRONT_DISTRIBUTION }} --paths "/*"
```

さて！待ちます。  

### デプロイ結果

無事一発で通りました、逆に心配で草

![Imgur](https://i.imgur.com/G2D2W6H.png)

`S3 のバケット`もみてみましたが、ちゃんと中身あります！

![Imgur](https://i.imgur.com/Z0DS0EH.png)

開いてみましたが、めっちゃ早い気がする！いや気がするじゃなくて実際早い！！！なにこれ！！！  
`CloudFront`まじ早くない？`Next.js`ももちろん早いんだけど

## エラー時の代わりのページの設定
さんこう：https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/GeneratingCustomErrorResponses.html  

このままだと存在しない`URL`にアクセスされた際に、`/404/index.html`ではなく`AWS`側のエラー画面が出てしまいます。  
![Imgur](https://i.imgur.com/cnFFXfa.png)

というわけで、`S3`にもなかった場合は`404`ページをブラウザに返してあげるように`CloudFront`を設定します。

### ところで
この構成（`Amazon S3 + CloudFront`）で存在しないパスにアクセスすると、`404`ではなく`403`になります。  
何でかはよく知りませんが、この辺がそう？

https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html

話を戻して、エラー画面を返す方法ですが、  
`CloudFront`のディストリビューションを開いて、エラーページを開き、`カスタムエラーレスポンス`を押します。  

![Imgur](https://i.imgur.com/YG0U6Ht.png)

先述の通り、存在しない場合に`S3`側は`403`を返すので、`HTTP エラーコード`は`403`を選びます。  
`Next.js`の場合、`trailingSlash: true`の場合は`/404/index.html`、`false`の場合は多分`/404.html`で`404 画面`に飛ばせるはず。  
ステータスコードは`404`で返しておきます。

![Imgur](https://i.imgur.com/biY2mOA.png)

しばらく待ちます

![Imgur](https://i.imgur.com/tg1comJ.png)

これで、エラーページが返ってくるようになりました。  
私も勘違いしてましたが、これはリダイレクトではなく、エラー内容を`CloudFront`側で変更しているだけなので、ブラウザのアドレス欄はそのままになります。

![Imgur](https://i.imgur.com/Wd8GWFD.png)

## DNS の向き先をホスティングサービスから CloudFront に直す
まず`CloudFront`のディストリビューションを開いて`ディストリビューションドメイン名`をコピーします

![Imgur](https://i.imgur.com/N4KZ2Fb.png)

そのあと、使ってるドメインの`DNS`の管理画面で、向き先を変えます（新規サイトの場合は追加します）  
`CNAME`で、`名前`は使いたいサブドメインを入れて（`APEX`ドメインは知らない）、値にはさっきの`ディストリビューションドメイン名`を入れます

![Imgur](https://i.imgur.com/4LPwTre.png)

後は暫く待つと、サブドメインでアクセスできるようになってるはずです。  
`https`なのでちゃんと鍵マークも付いてるはず！

# おわり！！！
ながい！！！お疲れ様です・・・  
参考にした記事ありがとうございます

# ソースコード
`GitHub Actions`のワークフローだけあったところでではありますが、、一応置いておきます  
https://github.com/takusan23/ziyuutyou-next/blob/main/.github/workflows/aws-deploy.yml

## 速度
早くなってる！

CloudFront  
![Imgur](https://i.imgur.com/Aa4VZHf.png)

Netlify  
![Imgur](https://i.imgur.com/rALu0T5.png)

## お金がかかるポイント？
- `S3 - CloudFront` の間のリクエスト回数
    - 転送量は 0 だけどリクエストは課金されるはず、
    - が、`CloudFront`が間に入ってキャッシュするのでそこまでで
        - `GET`リクエストは他と比べれば高くない
- `GitHub Actions` から `S3` にアップロードする
    - PUT リクエストの回数
        - `AWS`に入ってくる通信は無料だけど、`PUT`リクエストの課金はかかってしまう
            - そこまで高くはないとは思うけど
- `CloudFront Functions`
    - `CloudFront` の転送量は`1TB`まで無料なので超過はまず無いはず
        - 動画とかあってもそんなにじゃない...
    - 一方 `CloudFront Functions` はリクエスト回数のたびに呼ばれるので、ちょっと心配かも
        - `Next.js`はページ表示に複数の`js`ファイルをリクエストするので、1ページに複数回リクエストになってしまう

くらい？

## おわりに
お金問題なければこれで行きたいかも。  
しれーっと切り替わってるかもしれない。一応戻せるようにしばらくは`Netlify`の`GitHub Actions`も動かしとこうかな。

## おわりに2
もう誰も読んでないと思うけど

![Imgur](https://i.imgur.com/m1FiXi4.png)

冒頭のゲームの話なんですけど（本題関係ない）、デフォルトのフォントが`モトヤマルベリ`で、なんかすごい懐かしい気分になった。丸い感じすき  
というのも`Android 4 ~ 5`の標準日本語フォントがモトヤマルベリだったんですよね、なんでも`AOSP`のために`Apache License`の元使えるようにしたとかなんとか  

だた、Galaxy / Xperia / arrows / AQUOS Phone あたりは独自フォントのはずなので（めっちゃ頑張ればフォントだけでおおよそのメーカーが見分けられそう）、  
`Nexus 系列（まだ Nexus の頃）`を買わないと見る機会はなかったのかもしれない？

このゲームの`readme.txt`開いたら`AOSP`のライセンス（`Apache License 2.0`）あったけどもしかしてフォントのことだったのかな。

## おわりに3 2023/12/26 追記
2023年 12月 から試しに`CloudFront`からこのブログを配信しています。特に問題は無さそう感。  

![Imgur](https://i.imgur.com/KUWiRQV.png)

```bash
C:\Users\takusan23>curl -I https://takusan.negitoro.dev/
HTTP/1.1 200 OK
Content-Type: text/html
Server: AmazonS3
X-Cache: Hit from cloudfront
```