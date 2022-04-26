---
title: Node.jsのプロジェクトをGitHubで開いたら脆弱性があると言われたとき
created_at: 2022-04-27
tags:
- Node.js
- npm
---

どうもこんばんわ、自分用メモ。

# 本題
Node.jsなプロジェクトをGitHubで開いたらなんか警告が出ていたので消してみる。

```bash
We found potential security vulnerabilities in your dependencies.
Only the owner of this repository can see this message.
```

![Imgur](https://imgur.com/9yLmNje.png)

## 直し方

とりあえず `package.json` があるフォルダ内でターミナル（PowerShellとか）を開き、 `npm audit` を叩きます。  

そしたらこんなふうなメッセージが。
```bash
npm audit

=== npm audit security report ===

# Run  npm update minimist --depth 2  to resolve 1 vulnerability

  Critical        Prototype Pollution in minimist

  Package         minimist

  Dependency of   next-sitemap [dev]

  Path            next-sitemap > minimist

  More info       https://github.com/advisories/GHSA-xvch-5gv4-984h



found 1 critical severity vulnerability in 607 scanned packages
  run `npm audit fix` to fix 1 of them.

```
`Path`の部分を見ると、`next-sitemap > minimist`と書かれてますね。  
`next-sitemap`の中で使っている`minimist`ってライブラリ（モジュール）に対して脆弱性があるみたいですね。  
なんか`npm audit fix`で直せるらしいですが、今回は`npm i next-sitemap`を叩いて大本のライブラリを更新する方針で行きます。

## 大本のライブラリを更新する
はい。  
各自大本のライブラリを更新するようにしてください。

```bash
npm i next-sitemap
```

インストール出来たので、再度確認します。

```bash
npm audit

=== npm audit security report ===                        

found 0 vulnerabilities
 in 605 scanned packages
```

消えていました。  
以上です。

# GitHubへPush

GitHubへPushし、数十秒後にちゃんと消えていました。よかった

![Imgur](https://imgur.com/zAKmxGs.png)

# おわりに

よく知らんけど`package-lock.json`基本いじったら駄目だよね？