---
title: nginx を更新したら /etc/nginx/sites-enabled/ を読み込んでくれなくて直した
created_at: 2026-05-18
tags:
- nginx
- Ubuntu
- AWS
---
どうもこんばんわ。  
あつい！！！扇風機こわれたので扇風機かいたい

# 環境
| なまえ           | あたい                       |
|------------------|------------------------------|
| レンタルサーバー | `Amazon Lightsail`の`Ubuntu` |
| Ubuntu           | `Ubuntu 22`                  |

ちなみに`Lightsail`も円安のせいで別に安くないです！！！！！

# 今の状態
自分のサーバーと自分のブラウザの間に`Cloudflare`を挟んでいるので、`Cloudflare`の`Host`側が落ちてんぞ！画面になってる。

とりあえず`VPS`に`SSH`で入った。

`Node.js`で動いてるアプリケーションサーバーは生きてそう。`nginx`の向き先にしている`3000番`へ`curl http://localhost:3000`すると正しく帰ってきている。

となると`nginx`が悪そう。が、`sudo systemctl status nginx`すると`active`なので動いてはいる、私のサイト用設定が飛んだのか？

# 解決

https://stackoverflow.com/questions/17413526/

たぶん`/etc/nginx/sites-enabled/`にあるそれぞれのコンフィグを読み込む設定が消えてしまった？ので書き足せばよいはず。  
`vim`か何かで`/etc/nginx/nginx.conf`を開いて、

```sh
sudo vim /etc/nginx/nginx.conf
```

`http { }`の波かっこの中にこれを足す。

```conf
include /etc/nginx/sites-enabled/*;
```

（`vim` なら`i`キーで編集モードにして）たぶん最後に足せばいいんじゃね？。

```conf
http {
    # 省略...

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*; # この一行
}
```

これでターミナルに戻って（`vim`なら`Esc`キーからの`:wq`で抜けれる）、`nginx`を再起動すればよいはず。  
`systemctl`経由でも`nginx -s reload`でもどっちでも同じらしい？

```sh
sudo systemctl restart nginx
```

これで`nginx`に今ロードしているコンフィグを問い合わせると、読み込まれてほしかった`sites-enabled`のコンフィグもターミナルに表示されるようになりました。

```sh
sudo nginx -T
```

# なぜ消えたか考察する
`nginx`をインストールする手段が違ったかも。

`ubuntu`に最初から入ってる`apt`のリポジトリからインストールすると`site-enabled`もロードする一行が書いてある？  
一方、`nginx`のリポジトリを`apt`に手動で追加した場合は、もしかすると今回のように存在せず手動で追加する必要があるかもしれない。

![nginx_config_from_ubuntu_apt_repo](https://oekakityou.negitoro.dev/original/5d706369-db0a-4f99-ba9a-24c25333156e.png)

おわり。888