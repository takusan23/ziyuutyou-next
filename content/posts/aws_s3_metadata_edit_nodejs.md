---
title: S3 にある写真に後から Content-Type を付与したい
created_at: 2025-06-27
tags:
- AWS
- S3
- Node.js
---
どうもこんばんわ。  

`AWS`ってことで`Amazon`のはなしでも、  
手持ちのイヤホンの電池が本当に持たなくなってしまったので、買ってみた、`Echo Buds`。  
セールで半額！、この値段でノイズキャンセリングいいじゃんって。

数日しか経ってないけど感想！
- フィット感はちょっと落ちそう感、いや、落ちそう感はあるけど落ちたこと無い
    - スポーツ用のあれをつけるべき?
- ノイキャンは値段考えたらすごいほうだと思う、流石にハイエンドと比べるのは
- 片耳外すと音楽が止まってしまう？
- 一回タップでノイズキャンセリング切り替え出来ると嬉しい！！
    - 長押しの反応が鈍い！！

# 本題
`S3`の画像を`CloudFront`で配信しているわけですが、  
ブラウザの`画像を新しいタブで開く`を押すと何故かダウンロードウィンドウになってしまう。

![ダイアログ](https://oekakityou.negitoro.dev/original/4adb2a28-c04d-446c-9111-ac13e4fa1d73.png)

画像を開いてくれるんじゃないの。。。？  
デカく見たいよね？

# 原因
英語の`MDN`に書いてありました。  
https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types#important_mime_types_for_web_developers

どうやら`Content-Type`のデフォルトがバイナリデータとして扱われ（まあそうか）、  
バイナリの場合ブラウザはダウンロードのダイアログを出すだけをするらしい。

たとえ中身が画像だとしても、そのたとえすらもしない。出すだけ。

# S3 は Content-Type つけてくれないの？
いいえ、ブラウザからアップロードする場合や、`CLI`の場合はついてそう。

![CLI](https://oekakityou.negitoro.dev/original/8379a0d8-d1cb-471f-940f-b2e02e483c97.png)

一方、`CDK`を使う場合は明示的に`Content-Type`を指定しないと、バイナリデータのくくりになってしまうそうです。

![AltText](https://oekakityou.negitoro.dev/original/1273e6b5-f663-4b38-8298-c673ee077146.png)

# 全部に Content-Type をつけていく
というわけで、今回は**既に**`S3`にある写真に対して、`Content-Type`を付与していこうというという記事です。  
`metadata directive replace`とかで検索すればいっぱい出てくると思います。

# 環境
`Kotlin/JVM`で書こうって思ったんだけど、直近まで`Next.js`書いてたしで、  
この程度なら`esbuild`で`TypeScript`をトランスパイルして`Node.js`で実行でいいか、て。

| なまえ  | あたい     |
|---------|------------|
| 言語    | TypeScript |
| Node.js | v20.9.0    |

# AWS アクセスキーを取得
`Node.js`から読者さんの`AWS S3`を操作できるように、`API`につけるアクセスキーを払い出してもらいます。  
省略しますが、`IAM ユーザー`作成→`S3 の権限付与`→`アクセスキーを発行`の流れになると思います。

アクセスキー、シークレットアクセスキーが入手できたら完了です。  
（ぜったい秘密に！！）

# TypeScript プロジェクトを揃えていく
多分`typescript`も入れないといけない気がするが、もうそこまでしたくないので、、、  
適当にフォルダを作って、`esbuild`と、`CDK`を入れます。

```shell
npm init -y
npm install --save-exact --save-dev esbuild
npm i @aws-sdk/client-s3
```

検索の上の方ででてくる`aws-sdk`は`V2`で、これはメンテナンスモードなので、  
ちゃんと`V3`の方を入れましょう。

できたら、`package.json`に`esbuild`のトランスパイル+`Node.js`で実行、をやってくれるコマンドを書きます。  
`"start": `の一行ですね。これで`esbuild`が`TS`を`JS`に変換してくれて、出来たのを`Node.js`で実行。

```json
{
  "name": "aws-s3-metadata-edit",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "esbuild index.ts --bundle --outfile=out.js && node out.js"
  },
```

# index.ts
全部張ります。  

`BUCKET_NAME`には、メタデータを変更したいファイルが入っている`S3 Bucket`の名前、  
`ACCESS_KEY_ID`にはアクセスキーの値を、  
`SECRET_ACCESS_KEY`にはシークレットアクセスキーの値を入れてください。  
リージョンも東京以外を選んでいる場合は直してください。

やっていることは、`S3 Bucket`の中身一覧を取得し、  
`for`で回し各`Key`を得ます。あとは`CopyObjectCommand`で上書きしていく感じです。`MetadataDirective`ですね。  

`Content-Type`、今回は拡張子から取得していますが、拡張子すら無くなってしまった場合は、  
バイナリデータから`MIME-Type`を推測する何かが必要になりそう。マジックナンバーってやつかな。

```ts
import {
    S3Client,
    ListObjectsV2Command,
    CopyObjectCommand
} from "@aws-sdk/client-s3"


// ここは各自変更してください
const BUCKET_NAME = ""
const ACCESS_KEY_ID = ""
const SECRET_ACCESS_KEY = ""
// ここまで

async function main() {

    // 認証
    const s3Client = new S3Client({
        region: 'ap-northeast-1',
        credentials: {
            accessKeyId: ACCESS_KEY_ID,
            secretAccessKey: SECRET_ACCESS_KEY
        }
    })

    // 取得
    const response = await s3Client.send(
        new ListObjectsV2Command({ Bucket: BUCKET_NAME })
    )

    // 成功してれば
    if (response.Contents) {
        for (const obj of response.Contents) {

            // 今回は拡張子を入れているので、それから Content-Type を探す
            let mimeType = 'application/octet-stream'
            switch (obj.Key?.split('.')[1]) {
                case "jpg":
                    mimeType = 'image/jpeg'
                    break
                case "png":
                    mimeType = 'image/png'
                    break
            }

            // 実行
            await s3Client.send(
                new CopyObjectCommand({
                    Bucket: BUCKET_NAME,
                    CopySource: `${BUCKET_NAME}/${obj.Key}`,
                    Key: obj.Key,
                    ContentType: mimeType, // これ！！
                    MetadataDirective: 'REPLACE'
                })
            )

            console.log(`完了 ${obj.Key}`)
        }
    }
}

main() // エントリーポイントを呼び出す
```

変数埋めたら、以下のコマンドを叩く。 
これで、各ファイルに対して上書きでメタデータが付与されているはずです。

![たーみなる](https://oekakityou.negitoro.dev/original/45a911d2-5c03-4e21-ad56-05a8f3bb3a57.png)

# 完成
できた！

![画像です](https://oekakityou.negitoro.dev/original/2c0cb701-1546-4ff9-aadf-1cb17bd310ac.png)

# そーすこーど
どーぞー

https://github.com/takusan23/aws-s3-metadata-edit

# おわりに
今回のコード、上書きする順番はバラバラなので、一覧表示とかしていると壊れるかも。