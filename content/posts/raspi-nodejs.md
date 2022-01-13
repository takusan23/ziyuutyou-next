---
title: ラズパイに最新版Node.jsを入れる
created_at: 2020-09-08
tags:
- ラズパイ
- NodeJS
---

メモ代わり

URLはバージョン次第で変わると思う（v12.xなら`https://deb.nodesource.com/setup_12.x`になる）

```terminal
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
```

↓

```terminal
sudo apt-get install -y nodejs
```

↓

```terminal
node -v
```

した結果が `v14.9.0`(狙ったバージョン) になって入ればおｋ

# おわりに
`sudo apt upgrade`←こいつ長すぎ

# 参考にしました
https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions-enterprise-linux-fedora-and-snap-packages

https://github.com/nodesource/distributions/blob/master/README.md