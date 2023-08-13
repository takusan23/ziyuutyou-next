---
title: Misskey サーバーをお引越したメモ
created_at: 2023-08-13
tags:
- Misskey
- AWS
---
`v10`だからあんまり参考にならないかもしれない

# 環境

- `AWS Lightsail`
- `Cloudflare`で`SSL`化した
    - `Cloudflare`の`SSL/TLS 暗号化モード`は`フル`
        - これで`https`でアクセスできる
- オブジェクトストレージは`S3`
    - `VPS`のストレージに書き込んでいる場合はそれも引き継ぐ必要があります。

`Let's Encrypt + Certbot`でも移行後に証明書再発行で良いはず...？（`IPアドレス`ではなくドメインに対して払い出される？）

# 新しいマシンを用意
`Ubuntu 22.04`を用意しました。  
`TeraTerm`が使えない...取りあえず`PowerShell`に入ってる？`ssh`を使うことにします。  

鍵ファイルのパスとIPアドレスを直して叩けば使えるはず。

```powershell
ssh -i '鍵ファイルのパス.pem' ubuntu@000.000.000.000
```

# 移行先を構築する

メモリを増やして、`sudo apt update`と`sudo apt upgrade`して、`Misskey`のソースいれてビルドして、`nginx`して、、  
ってん感じで、`DNS`の設定の前までやっておいてください。

https://takusan.negitoro.dev/posts/misskey_ohitorisama/#dns-の設定

## MongoDB が入らない
`mongodb`を入れてる途中で...

```
sudo apt-get install gnupg
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

こんな感じに、失敗してしまいます...

```bash
The following packages have unmet dependencies:
 mongodb-org-mongos : Depends: libssl1.1 (>= 1.1.0) but it is not installable
 mongodb-org-server : Depends: libssl1.1 (>= 1.1.0) but it is not installable
 mongodb-org-shell : Depends: libssl1.1 (>= 1.1.0) but it is not installable
E: Unable to correct problems, you have held broken packages.
```

`libssl1.1`が必要なのですが、どうやら`Ubuntu 22.04`からは同梱されなくなったみたいです。  
`MongoDB`の最新版にすると治るそうですが、、、`Misskey`のバックエンドいじるのこわい（というか`DB`が何もわからない）ので、一旦`libssl`を入れる方面でいきます。

https://stackoverflow.com/questions/73656873

```bash
sudo wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb
sudo dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb
```

`amd`版（`Intel`、`AMD`系`CPU`）なので、`arm`とかの場合は読み替えてください  
これで`MongoDB`入れられるはず

```
sudo apt-get install -y mongodb-org
```

## 移行先でやること（新規で立てる際との違い）

`Misskey`のコンフィグ、`nginx`のコンフィグを元のサーバーからコピーしてきます。  
コピーは`Vim`のペーストモードが便利です（そのまま貼り付けると`#`でコメントアウトされたり、インデントされてしまう）

# MongoDB の引き継ぎ

## 移行前サーバー

`Misskey`を止めます

```bash
sudo systemctl stop misskey
```

次にルートユーザーでログインしたあと、ホームディレクトリ（`~`）にバックアップします

```bash
cd ~
mongodump -o "./dump"
```

つぎに、手元の`Windows`マシンを使い、バックアップデータを一旦`Windows`マシンへコピーします。  
もしかしたら直接転送できるかも...（お互いのサーバーの鍵ファイルないので一旦経由することにした）

`PowerShell`を開いて、`SCP`コマンドを使います

```bash
scp -i '鍵ファイルのパス.pem' -r ubuntu@000.000.000.000:Linuxの保存先 Windowsの保存先
```

以下例

```bash
scp -i 'C:\Users\takusan23\.ssh\key.pem' -r ubuntu@000.000.000.000:~/dump C:\Users\takusan23\misskey_backup\
```

## 移行後サーバー
フォルダごと移行先のサーバーへアップロードします  
また`PowerShell`を開いて、以下のコマンドを叩きます

```bash
scp -i '鍵ファイルのパス' -r Windowsの保存先 ubuntu@000.000.000.000:Linuxの保存先
```

以下例

```bash
scp -i 'C:\Users\takusan23\.ssh\key.pem' -r C:\Users\takusan23\misskey_backup\ ubuntu@18.176.65.230:~/dump
```

そしたら、リストア用コマンドを叩きます。  
移行後サーバーに`SSH`で入って、以下のコマンドを叩きます。（間違えてパス深くなっちゃった...）

`Misskey`が動いていない場合は一行目はいらないはず。

```bash
sudo systemctl stop misskey
mongorestore --drop ~/dump/dump/
```

`-drop`で既にあるデータを消した後、リストアをしてくれます。構築手順の`systemctl`のところで`misskey`を起動してしまったので、おそらくデータベースが作られてしまっていると思います。

データが復元できたか見てみます。まず以下のコマンドを叩いて

```bash
mongo
show dbs;
```

データベース一覧が表示されますが、ここで容量が`0GB`でなければ成功なはず。

```bash
> show dbs;
admin    0.000GB
config   0.000GB
local    0.000GB
misskey  0.011GB
```

`exit`を叩くと抜けれます。

# 起動する
移行後サーバーで叩きます

```bash
sudo systemctl start misskey
sudo systemctl start nginx
```

# DNS の設定を直す

移行先のサーバーへ`DNS`のレコードを向けます。

# 動作確認

どうでしょう、アクセスできましたか？？？  
一応新サーバーで見れているかの確認をするのに、移行後サーバーの`nginx`のアクセスログを見るという手があります。  
まあする必要もないでしょうが。

```bash
cat /var/log/nginx/access.log
```

携帯回線からも見れました

![Imgur](https://imgur.com/4rzqtqH.png)

# 移行前の VPS をお片付けする
金ないのでさっさと止めます。

![Imgur](https://imgur.com/qtZ8GP6.png)

以上です!!!!!!!!!

# おわりに

今回はギリギリまで（`DB`引っ越し）まで移行前のサーバーを動かす方法で行きました。  
が、多分データベース、画像とかのメディア（S3とかのオブジェクトストレージを使ってないなら）、コンフィグファイル（`misskey`と`nginx`）を`手元の Windows マシン`とかにバックアップしておいて、  
`VPS`を消す方法でも良いはずです。（最後まで残す方法だと、移行作業中は二台`VPS`を動かすことになるので、お一人様にそこまでのお金をかけられるか...）

# そのほか

## JavaScript heap out of memory
`Linux`の場合は、`npm`コマンドの先頭に以下のコマンドを入れることで、メモリ割り当てを手動で調整できます。  
単位は`MB`っぽい

```bash
NODE_OPTIONS="--max-old-space-size=2048"
```

以下例：

```bash
NODE_OPTIONS="--max-old-space-size=2048" NODE_ENV=production npm build
```