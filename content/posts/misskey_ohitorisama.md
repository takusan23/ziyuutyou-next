---
title: AWS の Lightsail でお一人様 Misskey サーバーを立ててみた (v10)
created_at: 2023-08-01
tags:
- Misskey
- AWS
- Node.js
- nginx
---
どうもこんばんわ。  
ニコニコ動画版はこちらです

https://www.nicovideo.jp/watch/sm42546302

<script type="application/javascript" src="https://embed.nicovideo.jp/watch/sm42546302/script?w=640&h=360"></script><noscript><a href="https://www.nicovideo.jp/watch/sm42546302">お一人様 Misskey サーバー立ててみた</a></noscript>

# Misskey お一人様を作ってみたい！！！
いや、別にお一人様じゃなくても、ローカルタイムラインが無いインスタンスにアカウントを作れば良いのですが（`LTL は流れについて行けない...`）・・・  
いや、、なんか、、、あの、、、、`AWS`とか使ってみたかったんですよ・・・（多分値段が高く付くのでもっとちゃんと考えるべきです）

# さんこうにしました
thx!!!!!!!!!!

- https://misskey-hub.net/docs/install/manual.html
- https://github.com/mei23/memo/blob/master/misskey/Setup-Meisskey-Quick.md
- https://blog.noellabo.jp/entry/2019/08/14/8i3RHuZ1wJNDinIn
- https://seritude.com/misskey-alone-server/

# ひつようなもの
今回は**v13**ではなく**v10**を建てます。（めいすきー）  
古いので最新版を建てたい人からしたらあんまり参考にならないと思う（`https`化くらい？同じなの）

- VPS
    - AWS Lightsail を使います
    - 後述しますが、もしかしたら`国産 VPS`とか他の方が使っている`VPS`を選ぶべきかもしれません・・・もしくは`EC2`？
    - 1コアCPU / 1GB RAM / 40GB SSD にしました
- ドメイン
    - サブドメインを使います
        - `diary.negitoro.dev`
    - `Cloudflare`が使えません（後述）
- SSH クライアント
    - `Tera Term`など
    - 最悪`VPS`に付いてくるブラウザベースの`SSH クライアント`でも出来なくはないと思う・・・
- オブジェクトストレージ
    - 今回は AWS の S3
- Mastodon / Misskey のアカウント
    - 他からアクセスできるか確認用

## 構成図？

![Imgur](https://imgur.com/A4ruvgv.png)

## 一部のサーバーと繋がらない話
`Cloudflare`が使えないせいなのか、はたまた`AWS の Lightsail（VPS）`のせいなのかよく分からないのですが、  
一部のMisskeyサーバーと接続できません（知ってる限り2つくらいあります）

![Imgur](https://imgur.com/mwNyT7m.png)

おそらく相手側のサーバーが`Cloudflare`で保護されていて、なんか私側の`IP アドレス`がブラックリスト入りしているっぽいんですよね？  
こちらも`Cloudflare`で保護すれば良いのかなと思いましたが、`.dev`ドメインが対応していないんですよね。`Google Domains`終了するし頼みますよ・・・！  
というわけで`VPS`を変える以外で解決策が無いです。皆さんは他の`VPS`を使ったほうが良いかもしれません・・・  

# 立てる
動画作ってたら何やったか忘れたのでざっくり行きます  

資料です： https://github.com/mei23/memo/blob/master/misskey/Setup-Meisskey-Quick.md

## Misskey をフォークする
これはカスタマイズしない場合はスキップで良いはず。  
私はフロントエンドくらいはいじりたいなと思ったのでフォークすることにしました

![Imgur](https://imgur.com/umfOvtv.png)

## AWS のアカウントを用意する

用意してください。  
作業用の`IAMユーザー`を作ったり、2段階認証にするなり、最低限のこともやっておいたほうが良いかも。

## AWS Lightsail で VPS を借りる
`Linux`で`Ubuntu 20.04`で行きます

![Imgur](https://imgur.com/6jdbpjr.png)

![Imgur](https://imgur.com/9M5P43F.png)

## パブリック IP アドレスを固定化する
すでに固定化した状態ですが・・・  
ここから固定化が出来ます。

![Imgur](https://imgur.com/8dee2EE.png)

アタッチしている場合は追加費用はかからないそう

## HTTPS 通信で使うポートを開ける
`https`は`TCP`の`443`番を使うので、受け入れられるようにします。  
`Misskey`は`https`でないと接続できないです

![Imgur](https://imgur.com/jEAY8Et.png)

## 鍵ファイルを使ってSSHでログインする
ここから鍵ファイルをダウンロード出来ます。

![Imgur](https://imgur.com/0vT2JX4.png)

まず`Tera Term`でIPアドレスを入れて...

![Imgur](https://imgur.com/bpSOxRC.png)

`Lightsail`に表示されているユーザー名と、先ほどダウンロードした鍵ファイルのパスをそれぞれ入れます。

![Imgur](https://imgur.com/d0Ix1qv.png)

## VPS の設定
テキストエディタに`vim`を使いますが（それしか分からん）、他のエディタが好きな場合はその都度読み替えてください。

### スワップ（仮想メモリ）の設定をする
物理メモリが多い場合は多分いらないかも？  
今回みたいに物理メモリが`1GB`しかない場合は後でやる`webpack`周りでこけちゃいます  
一行ずつ打ち込んでいってください。

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

次に`vim`で以下のファイルを編集します。

```bash
sudo vim /etc/fstab
```

改行して以下の行を足します。  
`i`を押して編集モード、`Esc`で戻れます。`:wq`で保存です。

```plaintext
/swapfile none swap sw 0 0
```

最後に、以下のコマンドを叩いてスワップ領域が増えていれば成功です。

```bash
free -h
```

こんなふうな出力があるはず

```bash
              total        used        free      shared  buff/cache   available
Mem:          929Mi       450Mi        71Mi       0.0Ki       408Mi       332Mi
Swap:         2.0Gi       174Mi       1.8Gi
```

### パッケージの更新をする
`Ubuntu ( Debian 系 )`は多分`apt`なので、以下のコマンドを叩いて更新します。  
`Misskey`構築に関係なく、`Linux`マシンを貰ったらまずやらないといけないと思います。

```bash
sudo apt update
sudo apt upgrade
```

`upgrade`の方は、本当に実行するかどうか聞かれるので、`Y`を押してエンターします。

`Do you want to continue? [Y/n]` ←これ

もし、更新中にピンク色の怖い画面（多分 `want to do about modified configuration file sshd_config?` 的なメッセージ？）がでたら、矢印キーで`Keep`の方を選んでエンターすれば良いと思います。

## Misskey 構築

### Misskey 用ユーザーを作る
特に言うことはないかな

```bash
sudo adduser --disabled-password --disabled-login misskey
```

### 必要なパッケージを入れる
`Node.js`（MisskeyはバックエンドJavaScriptで出来ている）

```bash
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm i -g pnpm
```

`MongoDB`（データベース）

```bash
sudo apt-get install gnupg
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

その他、ソースコードを落としてくる`git`などを入れます

```bash
sudo apt -y install redis git build-essential nginx ssl-cert letsencrypt ffmpeg
```

### ソースコードをダウンロード（git clone）してくる
まず Misskey ユーザーに切り替えて、

```bash
sudo su - misskey
```

ソースコードをダウンロードします。今回は自分のリポジトリのをダウンロードします  
（`takusan_23-diary`と`https://github.com/takusan23/misskey`は各自変えてね）

```bash
git clone -b takusan_23-diary https://github.com/takusan23/misskey
```

クローンしたフォルダへ移動します

```bash
cd ~/misskey
```

コンフィグファイルをコピーして、自分の環境用に直します

```bash
cp .config/example.yml .config/default.yml
vim .config/default.yml
```

そしたら、`url`を直して、`mongodb`の`user`/`pass`、`redis`の`pass`をコメントアウトします。  
以下は例です。これ以降の部分はいじりません。（後でいじりますが）

```yml
# Final accessible URL seen by a user.
url: https://diary.negitoro.dev/

# Listen port
port: 3000

# Listen address (default is probably any)
# addr: '127.0.0.0'

mongodb:
  host: localhost
  port: 27017
  db: misskey
  #user: example-misskey-user
  #pass: example-misskey-pass
  #options:
  #  poolSize: 10

# Redis
redis:
  host: localhost
  port: 6379
  #family: 0 # 0=Both, 4=IPv4, 6=IPv6
  #pass: example-pass
  #prefix: example-prefix
  #db: 0
```

編集が終わったら保存してターミナルに戻ってきてください。  
ビルドをします。

スペックが低いので、しばらく時間がかかります

```bash
NODE_ENV=production pnpm i
NODE_ENV=production pnpm build
```

無事成功したら、戻ります

```bash
exit
```

## nginx の設定
Misskey ユーザーの場合は戻ってください（`exit`）  
`whoami`を叩くと今誰なのかわかります。

### コンフィグファイルをコピー
私もわかんないんですけど、多分シンボリックリンクを使うのが正解らしい・・・

```bash
sudo cp ~misskey/misskey/docs/examples/misskey.nginx /etc/nginx/sites-enabled/
sudo vim /etc/nginx/sites-enabled/misskey.nginx
```

また`vim`が開くので、`example.tld`になっている部分を自分のドメインに直します。多分二箇所ぐらいだと思う

`server_name example.tld`を`server_name diary.negitoro.dev`にする感じです（自分のドメインね！）

できたら保存してターミナルに戻ってきてください。  
`nginx`をリロードします

```bash
sudo service nginx reload
```

## Misskey 起動

### Misskey ユーザーに切り替えます

```bash
sudo su - misskey
```

### サーバーお試し起動

次に、`Misskey サーバー`が起動できるか試してみます。

```bash
pnpm start
```

多分アスキーアートみたいなのが出るはず。

起動できたら（`listen 3000 ～`）止めます  
`Ctrl + C`同時押しでターミナルに戻ってこられるはず。

そしたらまたユーザーを戻してください

```bash
exit
```

## 自動起動の設定
`Windows`のスタートアップみたいな

### コンフィグを書く
と言ってもこれは全部コピーできるやつです。

```bash
sudo cp ~misskey/misskey/docs/examples/misskey.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable misskey
sudo systemctl start misskey
sudo systemctl status misskey
```

最後のコマンドを叩くと、さっきみたいなアスキーアート（欠けてるかも）が出ているはず。  
出て無くてもログが出ていれば成功なはず。  
`INFO *  [core boot]     Welcome to Meisskey!`  
とか  
`INFO *  [core boot]     Meisskey v10.xxxxxxx`  
とか？出ていれば OK なはず

## DNS の設定
IPアドレスとサブドメインを紐付けます

### サブドメインのAレコードに VPS の IP アドレスを指定します
`IPv6`の設定が必要なのかは不明（後述する`Let's Encrypt / Certbot`は`IPv4`だけでいいはず）

`Google Domains`なら`DNS`の項目で、新しいレコードを追加します。  
`IPv4`なので`Aレコード`で、使いたいサブドメインと、`VPS`の`IPv4`アドレスを指定します。

![Imgur](https://imgur.com/cc5Ajf7.png)

こんな感じです。

![Imgur](https://imgur.com/KOd6RpP.png)

### 反映されるのを待つ
`nslookup`とかして、サブドメインから`IPアドレス`を引けるようになるまで待ちます  
なお、`Misskey`は`https`でないと接続できないらしく、まだURLを入力しても開けないはず。

## SSL の設定（https でアクセスできるようにする）
`Cloudflare`使える場合はもっといい方法があるはず

### Certbot / Let
ここから、`Nginx`と`Ubuntu 20`を選びます。  

https://certbot.eff.org/

![Imgur](https://imgur.com/i6DlDJR.png)

もし内容がおかしかったら↑が正しいです

まずは`snap`というパッケージマネージャを入れます。

```bash
sudo snap install core; sudo snap refresh core
```

いれたら、一応既に入っているかもしれないので`certbot`を消します。  
`snap`経由で入れないといけないので、`apt`とかで既に入っていれば消しちゃいます。

```bash
sudo apt remove certbot
certbot --version
```

`certbot --version`でエラーが帰ってくれば成功（`bin`に`certbot`なんて存在しねえよ！的な）

次は`snap`経由で`certbot`を入れます。

```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

そしたらついに`https`でアクセスできるように`nginx`を構成します。  
コンフィグファイルを書き換えるのですが、多分`Misskey`に影響ない状態で書き換えてくれます。

```bash
sudo certbot --nginx
```

このコマンドを叩いた後に以下のことが聞かれます
- メールアドレス
    - `SSL`証明書の更新が出来なかったら通知が来る？
        - `https`でアクセスできなくなってしまうのでメールで教えてくれるそう
- 利用規約に同意するか
- ニュースレターを希望するか（No でいいはず）
- `https`にしたいドメインの最終確認（`nginx`のコンフィグファイルからドメインを探してくれるそう）

![Imgur](https://imgur.com/ry5LjDy.png)

![Imgur](https://imgur.com/DFgIOOh.png)

キーボードぽちぽちしてたら`https`化作業終わった。神だろこれ

### 自動更新ができるか確認
どうやら自動的に自動更新の`cron ?`が設定されているらしく、自前で`cron`をスケジュールしておく必要も無いらしい。  
ただ、成功するかはわからないので、お試し更新機能を使い本当に更新できるか試します。

```bash
sudo certbot renew --dry-run
```

`--dry-run`しないと更新されてしまう（そもそも有効期限が十分残っていると更新できない）

![Imgur](https://imgur.com/J8E7lYf.png)

成功するとこんな感じになるはず。

## Misskey 開ける？
`https://ドメイン`で開けるはず。  

![Imgur](https://imgur.com/ZiolQ3B.png)

ちゃんと`https`で、鍵マークも付いています！！！！  

一番乗りでアカウントを作ると管理者ユーザーとしてマークされ（コンフィグで変更可能？）、管理画面に入れます。

![Imgur](https://imgur.com/pHi7FqG.png)

## オブジェクトストレージの設定
`Misskey`の投稿のメディアは、後からURLを変更できないため、やるなら建てた今しかない！  
デフォルトでは`VPS`のストレージに書き込まれますが、`VPS`のストレージは高いのと拡張が面倒なのでオブジェクトストレージを使うのが良いはず（容量増やし放題だけどお金もかかるよ）。

参考：  
https://docs.aws.amazon.com/ja_jp/AmazonS3/latest/userguide/HostingWebsiteOnS3Setup.html#step4-add-bucket-policy-make-content-public

### AWS の S3 を使います
ただ、これちょっと高い（なんか転送量とリクエスト回数に課金されるややこしい）ので、`S3 互換サービス`を使うのも考えたほうが良さそう。  
今回は今後のことを考え、`S3 互換サービス`に移行できるような設計にもしてみます。

というわけで`S3`のバケットを作ります。  
名前とかはよしなに...

![Imgur](https://imgur.com/9Wlwx4A.png)

下にスクロールして、パブリックアクセスの項目で外からアクセスできるようにします。  
まだバケットポリシーを書いていないのでアクセスは出来ないと思いますが...

![Imgur](https://imgur.com/ogrkowi.png)

これで作成します。

### バケットポリシー を書く
作ったバケットを開いて、`アクセス許可`に進み、`バケットポリシー`を編集します

![Imgur](https://imgur.com/6mF1MxS.png)


```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::作ったバケットの名前/*"
            ]
        }
    ]
}
```

## API でアクセスするため、キーを IAM で払い出してもらう
`S3`に`API`で操作するには、`IAM`で認可情報を作って貰う必要があります。  

### IAM ユーザーの作成

`IAM`の画面を開いて、適当にユーザーを作ります、

![Imgur](https://imgur.com/xSjT5HT.png)

次の画面で出てくる権限のところでは、`AmazonS3FullAccess`をつけておけば良さそう

![Imgur](https://imgur.com/1gRN1XG.png)

### アクセスキーを払い出してもらう

作った`IAM ユーザー`の詳細を開いて、`アクセスキー`の作成をします

![Imgur](https://imgur.com/qXAayIK.png)

`Misskey`で必要なのは一番下の`その他`の項目のやつです。

![Imgur](https://imgur.com/XRymShw.png)

2つ出てくると思います。

![Imgur](https://imgur.com/7r828eY.png)

### オブジェクトストレージの設定をコンフィグに記述する
**v13 では Web UI からオブジェクトストレージの設定ができます**  

まず`Misskey`を止めて

```bash
sudo systemctl stop misskey
```

`Misskey`ユーザーに切り替えて、コンフィグを更新します。

```bash
sudo su - misskey
cd ~/misskey
vim .config/default.yml
```

そしたら、ファイルシステムに書き込む設定をコメントアウト（`#`でコメントアウトできる）して、  
ちょっと下にあるオブジェクトストレージ用の設定を書きます。

```yml

### drive ###
#drive:
#  storage: 'fs' # ここをコメントアウトする

# OR
#drive:
#  storage: 'db'

# OR
drive:
  storage: 'minio' # ここは買えなくて良いはず
  bucket: 'xxxxxxxx' # バケット名です
  prefix: 'files' # フォルダを作るなら
  baseUrl: 'https://diary.negitoro.dev/objectstorage' # nginx のリバースプロキシする URL
  config:
    endPoint: '' # S3 の場合は空文字。S3 互換サービスなら入れる
    region: 'ap-northeast-1' # バケットのリージョン
    useSSL: true
    accessKey: 'xxxx' # IAM ユーザーのアクセスキーのアクセスキー
    secretKey: 'xxxx' # IAM ユーザーのアクセスキーのシークレットキー
    useProxy: true
    setPublicRead: false
    s3ForcePathStyle: true
```

もし、リバースプロキシしない場合（`S3`の公開URLをそのまま使う場合）は、`baseUrl`は`https://s3.ap-northeast-1.amazonaws.com/バケット名`になるはずです。  
リバースプロキシが必要かどうかは`S3`以外を使う予定があるかどうかで決まります。詳しくは ↓ で。  

`CloudFront`を経由するとか、後述する`nginx`を経由する設計の場合は`baseUrl`が変わるはず  

後はターミナルを閉じて、おまじない程度にビルドしておきました（必要かどうかは不明）

```bash
NODE_ENV=production pnpm build
exit
```

`Misskey`起動させます

```bash
sudo systemctl start misskey
```

## メディアのURLをリバースプロキシする（nginx を経由するようにする）
先述の通り`S3`以外のオブジェクトストレージに引っ越しできるように、メディアのURLでは`S3`の`外部公開用URL`を使わないようにします。  
代わりに、メディアのURLを用意して（`https://ドメイン/objectstorage/xxxxx`）、`/objectstorage`に来たリクエストはすべて`nginx`を使い`S3`のURLに向き先を変えるようにします（リバースプロキシ）

```plaintext
クライアント ( PC / スマホ 等 )

↓ リクエスト

nginx が待ち受ける

↓

もし URL が /objectstorage だったら ---> [S3 の外部公開用URLへアクセス] 
それ以外 / だったら ---> [Misskey サーバー]
```

本当（というか他のサーバーだと）はオブジェクトストレージ用のドメイン、`files.ドメイン`みたいなサブドメインを用意して、`S3 + CloudFront`とかで公開して、`CNAME`で`CloudFront`を指すようにするのが良いかもしれないです。  
（何言ってるか分からんと思うけど・・・）

### nginx のコンフィグをいじる
コンフィグファイルを編集します。

```bash
sudo vim sudo cat /etc/nginx/sites-enabled/misskey.nginx
```

そしたら、`/objectstorage`に来たリクエストは`S3`のURLへリバースプロキシするようにします。  
URL は都度買えてください。

よく知らないけど、`location /`の上に書いておけばよいのかな？  

`nginx server { } 443` の方です

```config

# Media file storage is AWS S3.
# Use nginx proxy in AWS S3 to Internet transfer.
# thats because, Cant edit media file url.
location /objectstorage {
    proxy_pass https://s3.ap-northeast-1.amazonaws.com/バケット名;
}

# Proxy to Node
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
```

![Imgur](https://imgur.com/FNcgOxb.png)

そしたら保存してターミナルに戻って、`nginx`へ適用します。

```bash
sudo systemctl restart nginx
```

### 動作確認
実際に`Misskey`のドライブにファイルを投げて、`S3`に上がっていれば成功です。  
URL が `/objectstorage`で始まっていればうまく行ってます！！！

![Imgur](https://imgur.com/1JfWkc5.png)

![Imgur](https://imgur.com/T4a1855.png)

![Imgur](https://imgur.com/QykrHbN.png)

## お疲れ様でした！！！
多分これで構築は良いはず。

あとは適当にメモを残しておきます。

### おすすめ設定？
管理画面から出来ます

- ユーザー登録の受付を停止する を ON
    - お一人様なので
- リモートのファイルをキャッシュする は OFF
    - 多分デフォルト OFF

### Misskey サーバーの 停止 開始 再起動

- 開始
    - `sudo systemctl start misskey`
- 停止
    - `sudo systemctl stop misskey`
- 再起動
    - `sudo systemctl restart misskey`

### 本体更新方法
フォークしたので本家に追従するにはまず`git rebase`とかやって更新を取り込む必要がある  
こっちに書いた

https://github.com/takusan23/misskey#変更を本番に入れる本番更新手順

### データベースのバックアップ
**データベース**を吹っ飛ばすと同じドメインでサーバーを建てられないらしい？ので、定期的にやる必要があります  

まずは`Misskey`を止めます

```bash
sudo systemctl stop misskey
```

次に、`Misskey`で利用している`mongoDB`のバックアップを取ります。  
今回はホームディレクトリにバックアップしたデータを保存するようにしました。`dump`フォルダが出来ます。  
（ホームディレクトリは `~`←チルダ で移動できます）

```bash
cd ~
mongodump -o "./dump"
```

**次に、PowerShell を開き（SSH クライアントとは別に）**以下のコマンドを叩いて手元の Windows マシンへバックアップデータを転送します。  
`scp`コマンドです。

```shell
scp -i {鍵のパス} -r {リモートのユーザー名}@{IPアドレス}:{フォルダのパス} {ローカルのWindowsマシンの保存先パス}
```

例です

```shell
scp -i C:\Users\takusan23\key.pem -r ubuntu@000.000.000.000:~/dump C:\Users\takusan23\misskey_backup\
```

これで、ユーザー名のフォルダのところにあるはず（`C:\Users\takusan23` みたいな）

後はこれを`zip`とかにして安全なところに保存しておきます（ Google Drive とか？ AWS S3 Glacier とか？ ）

### Misskey をカスタマイズしたい（VPS ではなく、手元の Windows で Misskey を構築したい）
書いた。`v10`なので`v13`だと直さないと使えない

https://github.com/takusan23/misskey#手元の開発環境構築