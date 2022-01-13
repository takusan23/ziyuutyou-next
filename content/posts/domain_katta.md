---
title: Google Domainsでドメイン買ったからNetlifyで使う
created_at: 2020-06-15
tags:
- Netlify
- 自作ブログ
---

どうもこんばんわ。  
ニコ生で桜Trick一挙見ました。にやにや止まらんかった。一話から勢いすごかった。

# 本題
ドメインを買いました。  
三日前ぐらいからドメイン名どうするか考えてたのですが、特に思いつかなかったので好きなお寿司の名前(ねぎとろ)にしました。

# ドメイン取得
[Google Domains](https://domains.google/intl/ja_jp/)です。  
`.dev`ドメイン（かっこいいって理由）を取りました。維持に一年1400円かかるそうです。  
一瞬高く見えましたが、ニコ動のプレ垢は一ヶ月550円なのでそんなことなかった。  

**Kyashで払えました。** 三井住友銀行アプリUSBデバッグ有効だと起動しないから履歴見るのめんどいんだわ。[^1]

## 買い方（いる？）
1:ほしいの選ぶ。  
![Imgur](https://imgur.com/SkLuylR.png)

スイッチとかはそのままにして次へ

2:自分の情報入れる。  
![Imgur](https://imgur.com/TLrH5Gb.png)

Whoisって言うドメイン所有者を検索できる機能があるそうですが、ここに入力した情報は表示されないそうです。てかそうじゃないと困る

3:支払い  
![Imgur](https://imgur.com/r18xLqi.png)

~~消費税怖い~~

## Whoisどうなってんの？
果たして私の情報はどの様に保護されたのか。  

Google Domainsのナビゲーションドロワーにある、**登録の設定**押して、**公開連絡先情報**にある、**連絡先情報**に情報が書いてあるそうです。  

開くと、こんな感じに（どこまで写して良いのかわからんから適当に抜粋）なってました。

```console
Registrar: Google LLC
Registry Registrant ID: REDACTED FOR PRIVACY
Registrant Name: Contact Privacy Inc. なんとか～
Registry Admin ID: REDACTED FOR PRIVACY
Registry Tech ID: REDACTED FOR PRIVACY
```

多分大丈夫だと思います

# Netlifyで使う

まずNetlifyで管理画面？を開いて、カスタムドメインを設定する画面を開きます（スクショしそこねた）

そしたらこんな感じに買ったドメインを入れて（今回はサブドメインにした）  

![Imgur](https://imgur.com/xqMeXJO.png)

DNSがなんとかって出るので押すと、この画面が出ると思います。  
この値は使うのでChrome二窓しましょう。  
![Imgur](https://imgur.com/Whn3UvK.png)

そしたら、**Google Domains**のナビゲーションドロワーにある**DNS**を押して、一番下に有る（編集時現在）**カスタム リソースレコード**にスクショのように情報を入れます（入力する内容は人それぞれ違いますからね！）。

![Imgur](https://imgur.com/mg8hT6S.png)

以上です。後は待つだけです。私は一時間しない間位に買ったドメインでNetlifyのページを開くことができました。わーい

ちなみにドメインでひらけるようになった頃にはSSLの設定（Let's Encrypt？）も自動でやってくれました。あざす

# Google Analytics 直す
を開いて、**管理**を押して、**プロパティ設定**選んで、**デフォルトのURL**を直してあげます。`https://`はドロップダウンメニューにすでにあるので、`https://`抜いたURLを書きましょう。

![Imgur](https://imgur.com/ILmGn11.png)

~~まあAnalytics置いたところで検索エンジンに乗らない(なんで？)ので意味ない~~

# おわりに
Google Domainsで購入する際に`営利目的もしくは商用利用で利用する場合のみ利用できる`みたいなことが書いてあったんだけど大丈夫かな（？）  
![Imgur](https://imgur.com/RtQKKEj.png)

# 参考にしました
ありがとうございます

https://hardworkers.dev/blog/google-domains-setting-netlify/

https://blog.a-1.dev/post/2019-04-05-migrate-domain/

[^1]:Logcatに見られたら困る内容流してるんか？