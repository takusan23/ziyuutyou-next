---
title: LINE Messaging API を試す
created_at: 2021-01-09
tags:
- LINE
- NodeJS
---

始業式オンラインの予定だったのになんで中止になったの？

# LINE Messaging API
を使うことで、LINE公式アカウント(LINE Bot)を作成できます。  
一ヶ月1000通までは無料で、プッシュ通知も利用できます(つよい)。

# 今回やること
Node.jsからLINE公式アカウントと友達になっている人全員に送信するやつを作成。（ブロードキャストメッセージ）  
今回はこっち（Node.js側）からメッセージを送信できれば完成ってことで

## Messaging API 登録
(LINEのログインとか開発者登録は済ませておいて)  
ドキュメントに登録のやり方あります：https://developers.line.biz/ja/docs/messaging-api/getting-started/#using-console

https://developers.line.biz/ja/services/messaging-api/  
を開いて、`今すぐはじめよう`を選びます。

![Imgur](https://i.imgur.com/4Wm5Iu7.png)

### なんか英語なんだけど？
右下のところから日本語選べます。

![Imgur](https://i.imgur.com/MDNDRzS.png)

### プロバイダー
まあ開発者の名前とか入れておけばいいんじゃないですかね。  
[ドキュメントによると](https://developers.line.biz/ja/docs/messaging-api/getting-started/#_4-%E3%83%81%E3%83%A3%E3%83%8D%E3%83%AB%E3%82%92%E4%BD%9C%E6%88%90%E3%81%99%E3%82%8B)この項目は表示されないそうです。

![Imgur](https://i.imgur.com/T1lOCmP.png)

### チャンネル名、説明文
名前ですね。

[ドキュメントによると](https://developers.line.biz/ja/docs/messaging-api/getting-started/#_4-%E3%83%81%E3%83%A3%E3%83%8D%E3%83%AB%E3%82%92%E4%BD%9C%E6%88%90%E3%81%99%E3%82%8B)名前はユーザーに表示されるそうです。（まあ当たり前）  
説明はLINE Botを作る分には表示されない模様。

![Imgur](https://i.imgur.com/7NgoM0x.png)

### チャンネルアイコン
めんどいので飛ばします。任意ですので

### 職種
適当に

![Imgur](https://i.imgur.com/KautfJe.png)

あとはメアドとかを入力して同意すれば作成できます。

(ちなみにスクショのまんま作ると名前が予約済みでなんとかって言われて怒られる)

# 友達登録
チャンネル基本設定のとなりにある`Messaging API設定`を選ぶと、QRコードが表示されてるので、  
Googleレンズなり、LINEのQRコード読み取りなんかで友達登録をしてください。

# アクセストークンを生成する
`Messaging API設定`の一番下に、チャンネルアクセストークンってのが有るので、そこで発行してください。  
他の人に教えちゃだめなやつです。

![Imgur](https://i.imgur.com/66q8qv4.png)

# Node.jsから叩く

Node.jsの環境を揃えます。適当なフォルダを開いて、ターミナルを開き以下を実行

```
npm init -y
```

ライブラリを入れます

```
npm install @line/bot-sdk --save
```

そしたら、次のJSを書いていきましょう。`src`フォルダを作って`index.js`って名前をつけてコピペして

```js
// NodeJS用 LINE SDK
const line = require('@line/bot-sdk');

// アクセストークン
const client = new line.Client({
    channelAccessToken: '生成したアクセストークン'
})

// 全員に送信するやつ
client.broadcast(
    // 送信内容
    {
        type: 'text',
        text: 'Hello World'
    }
).then(res => console.log('Ok'))
```

最後に実行

```
node src/index.js
```

これは友達になっている人全てに送信されるやつですね。ドキュメントでは`ブロードキャストメッセージ`って言ってるやつ。

# おわりに
OSの壁を超えてプッシュ通知できるのは強いと思った