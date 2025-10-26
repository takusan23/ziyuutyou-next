---
title: このサイトとほぼ同じ構成の CloudFormation ができました
created_at: 2025-10-27
tags:
- AWS
- CloudFormation
- CloudFront
- S3
- 自作ブログ
---
どうもこんにちわ。初恋マスターアップ攻略しました。マスターアップってそういうことなのか・・・？

はわちゃん！！！が一番仕事してた。かわいい

![感想](https://oekakityou.negitoro.dev/resize/52d9a9cf-d1dc-4e00-96e0-adf2b980eb22.jpg)

![感想](https://oekakityou.negitoro.dev/resize/44f609e9-830d-423c-8370-94843114a0ae.jpg)

2人は本当に、、、、？

![感想](https://oekakityou.negitoro.dev/resize/2461a677-2084-496a-b7a9-0da34fff1827.jpg)

なつかしい！！！見返したら`Android 13`とかの頃っぽい（ぱっとわからない言い方）

![感想](https://oekakityou.negitoro.dev/resize/2fae3d32-8621-4222-b9e7-67a11993166a.jpg)

、、、、、このかさんルートを最後にやるといいのかも？どっちかというと楽しみだから最後にとっておいただけなんだけど

![感想](https://oekakityou.negitoro.dev/resize/88cf934b-bf50-4dfe-9653-8a0170b7df11.jpg)  
↑ここの話好き、セーブして見返してる

![感想](https://oekakityou.negitoro.dev/resize/40ed919a-0b61-4da7-8420-f0e1e6245d34.jpg)

！！！かわいい

![感想](https://oekakityou.negitoro.dev/resize/58eb561b-d355-4a37-99b2-8e799d8ccd24.jpg)

理由が不純すぎるのすき

![感想](https://oekakityou.negitoro.dev/resize/a96dc610-a708-4198-85b2-f841ba7d949b.jpg)

ネタバレなのであれだけど、全員のルートでそれぞれある、、、、

![感想](https://oekakityou.negitoro.dev/resize/873cd789-4cb8-4121-80b0-85013e4b5d92.jpg)

![感想](https://oekakityou.negitoro.dev/resize/5dbb62ab-fc6a-4288-8b0d-087e6a5fd678.jpg)

なんでも屋のハルルカさんとしずりさんも（サブヒロインなので短い、、、）攻略できます！  
そんなに読んでいるのか、、、（ちがう）

![感想](https://oekakityou.negitoro.dev/resize/989e3a08-bc23-4ec9-bdda-f7bb793dc2e0.jpg)

![感想](https://oekakityou.negitoro.dev/resize/7a269d74-3123-4371-b1b8-e0d6fac630f2.jpg)

あとこのスクショめっちゃ使えそうじゃない？というわけで貼ります

![感想](https://oekakityou.negitoro.dev/resize/99227210-cb72-4b36-97e4-6ed59df09e06.png)

アプリ開発だからいつか使えそう！

# 本題
アプリの話では、、、、ありません！  
CloudFormation 触ってたので、忘れないうちにまとめようと思って。

このサイトを含めて`CloudFront`+`S3`の構成のサイトがいくつかあります。雑ですが構成図はこうで

![構成図](https://oekakityou.negitoro.dev/resize/959b7bc9-1392-466f-bd14-983b8a578817.png)

- このさいと
- https://webm.negitoro.dev/
- https://androidapksideloadwebapp.negitoro.dev/

構成の詳細ですが、`S3`の機能にある`静的ウェブサイト機能`は使っていません。  
代わりに`CloudFront`の`オリジンアクセスコントロール (OAC)`機能を使って、`S3`にアクセスできるようにしています。これを使うことで`S3`へアクセスできるのは`CloudFront`だけになり、直接アクセスされるのを防ぐことが出来るってわけ。  
（直接`S3`にアクセスできると`http`しか受け付けないとか！カスタムドメインで`CloudFront`つかうので！）

一方`オリジンアクセスコントロール`も万能ではなく、`URL`末尾が`/about`だけだとアクセスできなくて、`/about/index.html`と言った感じに`.html`まで書く必要があります。  
あんまり`index.html`まで書かないですよね、静的サイトホスティングサービスであれば自動的に処理してくれるし、`レンタルサーバー`の場合は`Nginx`あたりがよしなに返してくれてるので。

というわけで`CloudFront Function`です。これは`CloudFront`が処理する前に任意の`JavaScript コード`が介入できる機能で、これを使い`URL`の末尾に`/index.html`を付与します。  
これで`/about`だけでアクセスできるようになる。というわけ。

`CloudFront`に介入する方法としては`Lambda@Edge`という似たような機能がありますが、`URL`書き換えであればすぐ出来るので`CloudFront Function`で十二分だと思います。それにこれには十分すぎる無料枠があります。

まあそんな感じで`S3`と`CloudFront`と`オリジンアクセスコントロール`と`CloudFront Function`と、あとドメイン。をやる必要があります。  
説明書無しではほぼ覚えてない状態になります。

https://takusan.negitoro.dev/posts/aws_sitatic_site_hosting/

# 完成品
https://github.com/takusan23/ziyuutyou-next/blob/main/cloudformation.yaml

```yaml
Parameters:

  BucketName:
    Type: String
    Description: WebSite Output S3 Bucket Name

  OriginAccessControlDescription:
    Type: String
    Default: cloudfront-s3-oac
    Description: Origin Access Control Description

  CloudFrontComment:
    Type: String
    Default: s3-cloudfront
    Description: CloudFront memo

  CloudFrontFunctionCreateOrReuse:
    Type: String
    Default: Create
    AllowedValues:
      - Create
      - Reuse
    Description: Append index.html suffix CloudFront Function. If created some
      function, Reuse. Don't have, Create

  CloudFrontFunctionName:
    Type: String
    Default: function-add-index
    Description: CloudFront Function Name. If Reuse, created function name.

  CachePolicyCreatedOrManaged:
    Type: String
    Default: 658327ea-f89d-4fab-a63d-7e88639e58f6
    Description: Cache Policy. Default is CachingOptimized.

Conditions:

  # CloudFront Functions を作るか
  CreateCloudFrontFunction: !Equals
    - !Ref CloudFrontFunctionCreateOrReuse
    - Create

Resources:

  # Next.js の static exports した結果を入れる S3
  WebSiteBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Ref BucketName
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - BucketKeyEnabled: true
            ServerSideEncryptionByDefault:
              SSEAlgorithm: AES256
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true

  # S3 - CloudFront をつなぐバケットポリシー
  BucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref WebSiteBucket
      PolicyDocument:
        Id: PolicyForCloudFrontPrivateContent
        Version: '2008-10-17'
        Statement:
          - Sid: AllowCloudFrontServicePrincipal
            Effect: Allow
            Principal:
              Service: cloudfront.amazonaws.com
            Action: s3:GetObject
            Resource: !Sub arn:aws:s3:::${BucketName}/*
            Condition:
              StringEquals:
                AWS:SourceArn: !Sub arn:aws:cloudfront::${AWS::AccountId}:distribution/${CloudFrontDistribution}

  # S3 に入っている Web サイトを配信する CloudFront
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - Id: !GetAtt WebSiteBucket.RegionalDomainName # マネジメントコンソールで作ると DomainName と同じ文字列になってそう
            DomainName: !GetAtt WebSiteBucket.RegionalDomainName # リージョンが入ってないとアクセスできなかった
            OriginAccessControlId: !GetAtt OriginAccessControl.Id
            S3OriginConfig:
              OriginAccessIdentity: ''
        DefaultCacheBehavior:
          AllowedMethods:
            - GET
            - HEAD
          TargetOriginId: !GetAtt WebSiteBucket.RegionalDomainName # Origins Id に合わせる
          ViewerProtocolPolicy: allow-all
          FunctionAssociations:
            # CloudFront Functions を作成する場合は、CloudFrontAddIndexFunction に依存するように書いておく。これで CloudFormation は先に Function を作る順番になるはず
            - EventType: viewer-request
              FunctionARN: !If
                - CreateCloudFrontFunction
                - !GetAtt CloudFrontAddIndexFunction.FunctionMetadata.FunctionARN
                - !Sub arn:aws:cloudfront::${AWS::AccountId}:function/${CloudFrontFunctionName}
          CachePolicyId: !Ref CachePolicyCreatedOrManaged
          Compress: true
        HttpVersion: http2
        Enabled: true
        Comment: !Ref CloudFrontComment

  # S3- CloudFront をつなぐ OAC
  OriginAccessControl:
    Type: AWS::CloudFront::OriginAccessControl
    Properties:
      OriginAccessControlConfig:
        Description: !Ref OriginAccessControlDescription
        Name: !GetAtt WebSiteBucket.RegionalDomainName
        OriginAccessControlOriginType: s3
        SigningBehavior: always
        SigningProtocol: sigv4

  # CloudFront Function を作成する場合
  # index.html を付与する Function
  # https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/example_cloudfront_functions_url_rewrite_single_page_apps_section.html
  CloudFrontAddIndexFunction:
    Type: AWS::CloudFront::Function
    Condition: CreateCloudFrontFunction
    Properties:
      Name: !Ref CloudFrontFunctionName
      AutoPublish: true
      FunctionConfig:
        Comment: add index.html to url suffix
        Runtime: cloudfront-js-2.0
      FunctionCode: |
        async function handler(event) {
            var request = event.request;
            var uri = request.uri;

            // Check whether the URI is missing a file name.
            if (uri.endsWith('/')) {
                request.uri += 'index.html';
            }
            // Check whether the URI is missing a file extension.
            else if (!uri.includes('.')) {
                request.uri += '/index.html';
            }

            return request;
        }

Outputs:

  WebSiteBucket:
    Description: S3
    Value: !Ref WebSiteBucket

  CloudFrontDistribution:
    Description: CloudFront
    Value: !Ref CloudFrontDistribution

  OriginAccessControl:
    Description: CloudFront OAC
    Value: !Ref OriginAccessControl

  CloudFrontAddIndexFunction:
    Condition: CreateCloudFrontFunction
    Description: CloudFront Functions
    Value: !Ref CloudFrontAddIndexFunction
```

上記の構成が作れます。使い方は、`CloudFormation`を開いて、`Stack`を作るときに↑の`yaml`を読み込んで、パラメーターを埋めてください。

https://ap-northeast-1.console.aws.amazon.com/cloudformation/home?region=ap-northeast-1#/stacks/create

パラメーターの詳細です

| パラメーター名                  | 説明                                                                                                        |
|---------------------------------|-------------------------------------------------------------------------------------------------------------|
| BucketName                      | S3バケット名。命名規則はS3に準拠します。                                                                    |
| OriginAccessControlDescription  | `OAC`の説明。名前はバケット名の`{バケット名}.s3.{リージョン}.amazonaws.com`になります                       |
| CloudFrontComment               | `CloudFront`のコメント欄                                                                                    |
| CloudFrontFunctionCreateOrReuse | `Create`か`Reuse`。`Create`なら新規作成`/index.html`を付与する`CloudFrontFunction`がすでにある場合は`Reuse` |
| CloudFrontFunctionName          | `Create`ならこれから作る`CloudFrontFunction`の名前。`Reuse`ならすでにある`CloudFrontFunction`の名前         |
| CachePolicyCreatedOrManaged     | `CloudFront`のキャッシュポリシー。デフォルトは`キャッシュ最適化`                                            |

**カスタムドメインはやってくれないので自分でやってください！**

# CloudFormation 概要
くらうどふぉーめーしょん

`AWS`で使いたいリソース（`S3`とか`CloudFront`とか）を指示するというか、組み立て説明書みたいなのを渡すと自動で作ってくれる。

人の手でマネジメントコンソール（ブラウザ上）を使って`S3`とかを作るとやり忘れが発生するかもしれないし、上記の問題のように同じ構成で他のサイトを構築したいだけなのに、いくつかのリソースにまたがって設定が必要で少し時間がかる。

これに対処したのが`IaC`と呼ばれるもので、人の手で`S3`を作る代わりに、組み立て説明書に`S3`を作れ！！って書くわけです。  
これを`CloudFormation`に食わせると読み込んで作ってくれる。間違いも減るだろうし、繰り返し似たようなサイトを作りたくなっても`CloudFormation`の実行ボタンを押せばだいたい揃う。

## CloudFormation で間違えたら
失敗したら途中まで作ったリソース全部消して回らないといけないのか？とか思ってたけど流石にそんなこと無かった。  
`AWS`の説明だけ見ると横文字ばっかで実際に使うまで全然わからない・・・`AWS文学`来るか？

- 失敗してしまった場合は、途中まで作ったリソース（`S3`とか）は自動で削除される
- 成功しても、削除ボタンを押せば作ったリソースを全て削除できる

さっすが～

## 用語集

### テンプレート
`yaml`とかで書いた組み立て説明書です。テキストファイル

### リソース
`S3`とか`CloudFront`みたいなサービスのこと

### スタック
`CloudFormation`を実行すると、`スタック`が誕生します。`CloudFormation`の実行単位って感じですかね？  
これは今の状態（作成中・完成・失敗したためロールバック）を表示したり、作ったリソースを表示したり、テンプレートに出力（`println`的なの）があれば表示します。  
スタックを削除すると、それが作ったリソースをすべて消すことが出来ます。

`GitHub Actions`を起動すると`Job`が誕生するのと似てる。

そしてこれは起動したものの失敗してロールバックしたスタック一覧です。うわーー

![fail_stack_list](https://oekakityou.negitoro.dev/original/5889d845-d98b-4331-9371-249018d299a9.png)

スタックの詳細画面、リソースタブでは作ったリソースが表示される

![stack_detail_tab](https://oekakityou.negitoro.dev/original/80205b59-aa76-40b1-ae53-7c2e97a36a35.png)

# やってもらうこと

- 静的サイトの成果物を置く`S3 バケット`
- 配信する`CloudFront ディストリビューション`
- `S3 - CloudFront`を繋ぐ`オリジンアクセスコントロール`
- `/index.html`を付与するための`CloudFront Function`

を作れる組み立て説明書を書いてもらいます。

めちゃくちゃどうでもいいんだけど、`IKEA`の説明書にある人のキャラクターおもろい。`IKEA`の店から電話線引いてるやつ

# ながれ

- `CloudFormation`のテンプレート作る
- 実行する
- 動くまで頑張る

## テンプレートを用意
組み立て説明書です。`yaml`で書いていきます。`GitHub Actions`で予習済み...！  

`CloudFormation`のここから作れます

![template](https://oekakityou.negitoro.dev/original/57949f2f-20d5-4826-b427-40841d51335a.png)

そしたら新規作成か既存のを読み込むかが選べます

![create_or_reuse](https://oekakityou.negitoro.dev/original/7bd234a4-2222-4a6e-9e8a-ce0c6c3526ef.png)

### すでにあるテンプレートを読み込む
その場合は`S3`か`yaml`をアップロードするなりしてください。

### 新規作成
新しく作る場合は`Infrastructure Composer からビルド`を押して、`Infrastructure Composer で作成`へ進みます。

![create](https://oekakityou.negitoro.dev/original/51a96dcb-9487-43e0-b283-d9ce46d161f5.png)

そしたらこんな画面になります。ビジュアルエディター的なのがありますが、今回は`yaml`を書いていきます。  
ので`テンプレート`を選びます。なんか`VSCode`みたいな画面になれば成功です。

![yaml_editor](https://oekakityou.negitoro.dev/original/079c1453-1b3a-4fe7-aa3f-de1722aff0c4.png)

## とにもかくにも動かしてみる
とりあえず`S3`を作る`テンプレート`を書きました。詳しくはあとにして、とりあえず実行してみます。

```yaml
Parameters:

  BucketName:
    Type: String
    Description: WebSite Output S3 Bucket Name

Resources:
    
  WebSiteBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Ref BucketName
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - BucketKeyEnabled: true
            ServerSideEncryptionByDefault:
              SSEAlgorithm: AES256
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
```

### 構文チェック
ここの検証ボタンを押すと`yaml`記法があっているか確認できます。↑コピペすれば有効になるよね？

![syntax_check](https://oekakityou.negitoro.dev/original/95c8d6fc-a9f2-43b9-9dbf-4a17735b85b6.png)

### 保存する
`S3`に保存するように言われるので保存します。  
次回以降は`S3`にあるテンプレートから起動できるってわけです。

![save_to_s3](https://oekakityou.negitoro.dev/original/9d1b09d8-6be5-479f-998c-4127b0df6f8c.png)

### CloudFormation を実行する
`VSCode`みたいな画面が閉じられて、次へボタンが押せるようになるので進みます。

![next](https://oekakityou.negitoro.dev/original/c6d024a3-a157-4335-8e74-0ce93fa8d26e.png)

次に`スタック`の名前と、このテンプレートはテキストボックスがあるので埋めます。  
スタックの名前はわかりやすいのを、その下のテキストボックスは`S3`バケットの名前です。

![input](https://oekakityou.negitoro.dev/original/399fedf2-cd91-4a3c-ac16-980a6095b843.png)

その後はデフォルトのままでよいです。よくわかってない

### 出来るのを待つ
スタック一覧画面に行くので待ちます。終わると`CREATE_COMPLETE`になります。嬉しいですね！！！

![stack](https://oekakityou.negitoro.dev/original/57f184f2-88ab-400e-a92b-759e6e965880.png)

スタックを押すと詳細が右に表示されます。ここでは作成のログや、失敗してしまったときの失敗理由、あとは作ったリソース（`S3`とか）が確認できます。

![detail](https://oekakityou.negitoro.dev/original/9f226543-7b74-475a-a7d8-7d59c8f1bbd7.png)

### 削除してみる
上記の削除ボタンを押すことでスタックと、スタックに書いてあるリソースが消えます。

![delete](https://oekakityou.negitoro.dev/original/5a1a430f-0499-4994-a15e-002b38495c38.png)

マネジメントコンソールで`S3`の画面を開いても、今`CloudFormation`で作った`S3`バケットが消えていると思います。

## yaml で組み立て説明書を書いていく
今回は冒頭で紹介した、このサイトと大体同じ構成が作れる`CloudFormation`を読み解いていきます。  
[#完成品](#完成品)

### パラメーター機能
こうしき：  
https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/parameters-section-structure.html

`CloudFormation`を起動する際に、パラメーターを指定することが出来ます。  
`S3`のバケット名などを、テンプレートを書いている段階ではなく実行する直前に決定することが出来ます。  

```yaml
Parameters:

  BucketName:
    Type: String
    Description: WebSite Output S3 Bucket Name

  OriginAccessControlDescription:
    Type: String
    Default: cloudfront-s3-oac
    Description: Origin Access Control Description

  CloudFrontComment:
    Type: String
    Default: s3-cloudfront
    Description: CloudFront memo

  CloudFrontFunctionCreateOrReuse:
    Type: String
    Default: Create
    AllowedValues:
      - Create
      - Reuse
    Description: Append index.html suffix CloudFront Function. If created some function, Reuse. Don't have, Create

  CloudFrontFunctionName:
    Type: String
    Default: function-add-index
    Description: CloudFront Function Name. If Reuse, created function name.

  CachePolicyCreatedOrManaged:
    Type: String
    Default: 658327ea-f89d-4fab-a63d-7e88639e58f6
    Description: Cache Policy. Default is CachingOptimized.
```

この例では`BucketName`とか`OriginAccessControlDescription`が`ID`？になって、このあとのリソース作成などの箇所で引用できるようになります。  
この後のリソースもそうですが好きな名前をつけることが出来ます。

`Type`に`String`を入れるとテキストボックスになるし、`String`と`AllowedValues`を組み合わせるとドロップダウンメニューになります。他にも数字とかもあったと思います。

`Description`は`CloudFormation`で実際に入力するときに表示されてて、`Default`はその名のとおりです。

あとは今更ですけど`ダブルクオーテーション`的なので囲う必要はない？

#### 今回使うパラメーター解説
再掲しますがこれです

| パラメーター名                  | 説明                                                                                                        |
|---------------------------------|-------------------------------------------------------------------------------------------------------------|
| BucketName                      | S3バケット名。命名規則はS3に準拠します。                                                                    |
| OriginAccessControlDescription  | `OAC`の説明。名前はバケット名の`{バケット名}.s3.{リージョン}.amazonaws.com`になります                       |
| CloudFrontComment               | `CloudFront`のコメント欄                                                                                    |
| CloudFrontFunctionCreateOrReuse | `Create`か`Reuse`。`Create`なら新規作成`/index.html`を付与する`CloudFrontFunction`がすでにある場合は`Reuse` |
| CloudFrontFunctionName          | `Create`ならこれから作る`CloudFrontFunction`の名前。`Reuse`ならすでにある`CloudFrontFunction`の名前         |
| CachePolicyCreatedOrManaged     | `CloudFront`のキャッシュポリシー。デフォルトは`キャッシュ最適化`                                            |

### 条件分岐の定義
こうしき

- https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/conditions-section-structure.html
- https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/intrinsic-function-reference-conditions.html

```yaml
Conditions:

  # CloudFront Functions を作るか
  CreateCloudFrontFunction: !Equals
    - !Ref CloudFrontFunctionCreateOrReuse
    - Create
```

`CloudFormation`での条件分岐ですが、**あらかじめ true か false か評価して定義しておく必要がある？**  
条件分岐が必要なら`Conditions`に書いて、その後必要な箇所で使う

この例だと`CreateCloudFrontFunction`が`ID`になる。  
その後の`!Equals`は、`CloudFormation`の組み込み関数で、この後に配列が続きます。`インデックス0番目`が比較したい文字で、`インデックス1番目`が等しいのを期待する文字を入れます。  
この場合は、パラメーター`CloudFrontFunctionCreateOrReuse`を読み出して`Create`だった場合は`true`になります。

`!Ref`ってのを使ってますが、とりあえずは先述のパラメーターから値を取り出すんだな～って  
あと実際に条件分岐を使う方法も後で


#### 改行する書き方とカッコの書き方がある

```yaml
CreateCloudFrontFunction: !Equals
  - !Ref CloudFrontFunctionCreateOrReuse
  - Create
```

```yaml
CreateCloudFrontFunction:
  !Equals [!Ref CloudFrontFunctionCreateOrReuse, Create]
```

これは`yaml`の`リスト`の書き方の違いで、同じものらしい

### リソースを定義
こうしき：  
https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resources-section-structure.html

ついに`S3`や`CloudFront`を作っていきます。全部張りました。

```yaml
Resources:

  # Next.js の static exports した結果を入れる S3
  WebSiteBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Ref BucketName
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - BucketKeyEnabled: true
            ServerSideEncryptionByDefault:
              SSEAlgorithm: AES256
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true

  # S3 - CloudFront をつなぐバケットポリシー
  BucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref WebSiteBucket
      PolicyDocument:
        Id: PolicyForCloudFrontPrivateContent
        Version: '2008-10-17'
        Statement:
          - Sid: AllowCloudFrontServicePrincipal
            Effect: Allow
            Principal:
              Service: cloudfront.amazonaws.com
            Action: s3:GetObject
            Resource: !Sub arn:aws:s3:::${BucketName}/*
            Condition:
              StringEquals:
                AWS:SourceArn: !Sub arn:aws:cloudfront::${AWS::AccountId}:distribution/${CloudFrontDistribution}

  # S3 に入っている Web サイトを配信する CloudFront
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - Id: !GetAtt WebSiteBucket.RegionalDomainName # マネジメントコンソールで作ると DomainName と同じ文字列になってそう
            DomainName: !GetAtt WebSiteBucket.RegionalDomainName # リージョンが入ってないとアクセスできなかった
            OriginAccessControlId: !GetAtt OriginAccessControl.Id
            S3OriginConfig:
              OriginAccessIdentity: ''
        DefaultCacheBehavior:
          AllowedMethods:
            - GET
            - HEAD
          TargetOriginId: !GetAtt WebSiteBucket.RegionalDomainName # Origins Id に合わせる
          ViewerProtocolPolicy: allow-all
          FunctionAssociations:
            # CloudFront Functions を作成する場合は、CloudFrontAddIndexFunction に依存するように書いておく。これで CloudFormation は先に Function を作る順番になるはず
            - EventType: viewer-request
              FunctionARN: !If
                - CreateCloudFrontFunction
                - !GetAtt CloudFrontAddIndexFunction.FunctionMetadata.FunctionARN
                - !Sub arn:aws:cloudfront::${AWS::AccountId}:function/${CloudFrontFunctionName}
          CachePolicyId: !Ref CachePolicyCreatedOrManaged
          Compress: true
        HttpVersion: http2
        Enabled: true
        Comment: !Ref CloudFrontComment

  # S3- CloudFront をつなぐ OAC
  OriginAccessControl:
    Type: AWS::CloudFront::OriginAccessControl
    Properties:
      OriginAccessControlConfig:
        Description: !Ref OriginAccessControlDescription
        Name: !GetAtt WebSiteBucket.RegionalDomainName
        OriginAccessControlOriginType: s3
        SigningBehavior: always
        SigningProtocol: sigv4

  # CloudFront Function を作成する場合
  # index.html を付与する Function
  # https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/example_cloudfront_functions_url_rewrite_single_page_apps_section.html
  CloudFrontAddIndexFunction:
    Type: AWS::CloudFront::Function
    Condition: CreateCloudFrontFunction
    Properties:
      Name: !Ref CloudFrontFunctionName
      AutoPublish: true
      FunctionConfig:
        Comment: add index.html to url suffix
        Runtime: cloudfront-js-2.0
      FunctionCode: |
        async function handler(event) {
            var request = event.request;
            var uri = request.uri;

            // Check whether the URI is missing a file name.
            if (uri.endsWith('/')) {
                request.uri += 'index.html';
            }
            // Check whether the URI is missing a file extension.
            else if (!uri.includes('.')) {
                request.uri += '/index.html';
            }

            return request;
        }
```

`WebSiteBucket`や`CloudFrontDistribution`が`ID`になっています。  
その後の`Type`は、作りたい`AWS リソース`を入力します。`AWS::S3::Bucket`みたいな。`Condition`は、上で作った`!Equals`のやつの`ID`を入力することで、`true`の時だけ実行される。  
その後の`Properties`は**それぞれ必要な値が異なります。**

#### Properties に必要な値
まずは**サンプル集**を読むとどんな感じか掴みやすいと思います。

https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-snippets.html

その後に、詳しい設定をしたい場合は各自リファレンスを調べてください。  
`S3`のバケットポリシーは`JSON`を`yaml`にしたようなものだったりする？

- `S3`
  - https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-s3-bucket.html
- `CloudFront ディストリビューション`
  - https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-cloudfront-distribution.html

例えば`CloudFront ディストリビューション`で`IPv6`を有効にするなら、`IPV6Enabled`をつけろって言われてるんでつけます

```yaml
CloudFrontDistribution:
  Type: AWS::CloudFront::Distribution
  Properties:
    DistributionConfig:
      IPV6Enabled: true
```

どうでもいい話ですが`Android`アプリで`IPv6`を使うとうまく通信出来ない時があるので、`バックエンドエンジニア`（インフラ？）の皆さん、`IPv6`やるときは`Androidエンジニアチーム`に一声書けてください！！！！！  
いちおう解決方法があるので特に問題はないと思いますが...

https://takusan.negitoro.dev/posts/android_okhttp_thanks_happy_eyeballs/

#### Ref と Sub と GetAtt
`!Ref`は、パラメーターの`ID`の値を読み出したり、その他、リソースの`ID`を渡すと`S3`バケット名みたいなのが返ってくることもあります。

```yaml
BucketName: !Ref BucketName
```

`!Sub`は文字列の中にパラメーターの`ID`の値を入れたいときに使う。  
`アカウントID`みたいなのが取得できる`AWS`オブジェクトがあります。グローバル変数というか何もしなくても`AWS::`のが使えるようです。

```yaml
AWS:SourceArn: !Sub arn:aws:cloudfront::${AWS::AccountId}:distribution/${CloudFrontDistribution}
```

`GetAtt`は、作った**リソースの詳細情報**を取得したいときに利用します。  
`GetAtt`で取得可能な値もリファレンスに乗っています。リファレンスの`Return values`のセクションまでスクロールすると、取得できる値が解説されています。

![reference_getatt](https://oekakityou.negitoro.dev/original/69f3c465-5071-4c48-abf7-d208f8546673.png)

例えば`S3`のリソースで以下のように`GetAtt`すると、、、`{バケット名}.s3.{リージョン}.amazonaws.com`の文字列が取得できます。

https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-s3-bucket.html

```yaml
Name: !GetAtt WebSiteBucket.RegionalDomainName
```

`OAC`もこんな感じ

https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-cloudfront-originaccesscontrol.html

```yaml
OriginAccessControlId: !GetAtt OriginAccessControl.Id
```

#### 並列実行と依存
`GetAtt`や`!Ref`で他のリソースを参照すると、勝手にいい感じに並列の順番を決めてくれます。  
すでにリソースが作成されてないと`GetAtt`出来ないので、完成を待つ感じでしょうか？

```yaml
CloudFrontDistribution:
  Type: AWS::CloudFront::Distribution
  Properties:
    DistributionConfig:
      Origins:
        - Id: !GetAtt WebSiteBucket.RegionalDomainName # マネジメントコンソールで作ると DomainName と同じ文字列になってそう
          DomainName: !GetAtt WebSiteBucket.RegionalDomainName # リージョンが入ってないとアクセスできなかった
          OriginAccessControlId: !GetAtt OriginAccessControl.Id
          S3OriginConfig:
            OriginAccessIdentity: ''
      DefaultCacheBehavior:
        AllowedMethods:
          - GET
          - HEAD
        TargetOriginId: !GetAtt WebSiteBucket.RegionalDomainName # Origins Id に合わせる
        ViewerProtocolPolicy: allow-all
        FunctionAssociations:
          # CloudFront Functions を作成する場合は、CloudFrontAddIndexFunction に依存するように書いておく。これで CloudFormation は先に Function を作る順番になるはず
          - EventType: viewer-request
            FunctionARN: !If
              - CreateCloudFrontFunction
              - !GetAtt CloudFrontAddIndexFunction.FunctionMetadata.FunctionARN
              - !Sub arn:aws:cloudfront::${AWS::AccountId}:function/${CloudFrontFunctionName}
        CachePolicyId: !Ref CachePolicyCreatedOrManaged
        Compress: true
      HttpVersion: http2
      Enabled: true
      Comment: !Ref CloudFrontComment

CloudFrontAddIndexFunction:
  Type: AWS::CloudFront::Function
  Condition: CreateCloudFrontFunction
  Properties:
    Name: !Ref CloudFrontFunctionName
    AutoPublish: true
    FunctionConfig:
      Comment: add index.html to url suffix
      Runtime: cloudfront-js-2.0
    FunctionCode: |
      async function handler(event) {
          var request = event.request;
          var uri = request.uri;

          // Check whether the URI is missing a file name.
          if (uri.endsWith('/')) {
              request.uri += 'index.html';
          }
          // Check whether the URI is missing a file extension.
          else if (!uri.includes('.')) {
              request.uri += '/index.html';
          }

          return request;
      }
```

例えば上記だと以下のように`CloudFrontAddIndexFunction`で作る`CloudFront Fuction`の値に依存しています。  
そのため先に`CloudFrontAddIndexFunction`を作成して、その後`CloudFrontDistribution`の作成に進むって感じらしい。

```yaml
FunctionARN: !If
  - CreateCloudFrontFunction
  - !GetAtt CloudFrontAddIndexFunction.FunctionMetadata.FunctionARN
  - !Sub arn:aws:cloudfront::${AWS::AccountId}:function/${CloudFrontFunctionName}
```

こんな感じに明示的に依存を書ければ良いのですが、**そう簡単に依存するような書き方が出来ない場合もあると思います。**  
[今回使うパラメーター解説](#今回使うパラメーター解説) では、「`Create`ならこれから作る`CloudFrontFunction`の名前。`Reuse`ならすでにある`CloudFrontFunction`の名前」と書きました。  
`CloudFront Function`の**名前だけは**起動前のパラメーターの時点でわかっているので、`ARN`を文字列補間で作ることが出来るって、わかりますか？

```yaml
FunctionARN: !Sub arn:aws:cloudfront::${AWS::AccountId}:function/${CloudFrontFunctionName}
```

ただこれだと**既にある場合でしか動きません**。  
明示的に依存しているんだよ～感を出しておくと、先に依存しているリソースを作る判断ができますが、これだとただパラメーターの値を入れているだけになるので。

上記の例で試すと、`CloudFront ディストリビューション`を作るのに`CloudFront Function`の完成を待たない、多分ですが完成よりも前に`ディストリビューション`を作ってしまうので失敗してしまいます。  
先述の通り`CloudFormation`は極力並列でリソースを作るため、先に`CloudFront Function`を作ってくれれば動くかもですが、順番を守ってくれることのほうが少ないでしょう。  

なので！`DependsOn`という機能があります！！いい感じに依存してるんだな～って感づいてくれないときに使えそう。今回は気が利いてくれたので問題なかった！

https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-attribute-dependson.html

### 出力機能
こうしき：  
https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/outputs-section-structure.html

作ったリソースや、パラメーターの値を出力して、スタックの詳細画面から見ることが出来る機能があります。  
多分成功してないと何も表示されないと思います。（`ROLLBACK_COMPLETE`を見たけど何も出力されてなかった）

![stack_output_tab](https://oekakityou.negitoro.dev/original/2fd820e5-6e14-4b34-bcc6-e393a14346b0.png)

```yaml
Outputs:

  WebSiteBucket:
    Description: S3
    Value: !Ref WebSiteBucket

  CloudFrontDistribution:
    Description: CloudFront
    Value: !Ref CloudFrontDistribution

  OriginAccessControl:
    Description: CloudFront OAC
    Value: !Ref OriginAccessControl

  CloudFrontAddIndexFunction:
    Condition: CreateCloudFrontFunction
    Description: CloudFront Functions
    Value: !Ref CloudFrontAddIndexFunction
```

`WebSiteBucket`や`CloudFrontDistribution`がキーになり、`Value`が値のところに出る

## カスタムドメインは自動でやってくれません。
そういえば、カスタムドメインは自動でやってくれないので、`CloudFormation`実行中の隙に作ってください。（別にいつでも良いですが）  
私が`Route53`を使っていないせいだと思います・・・

使えれば`CloudFormation`で生成できたらしい。`Route53`は`.dev`の`TLD`がそもそも**使えない**。なのでありがとう`クラウドフレア (英語にすると空目しそうで)`

# エラー集
数日くらいかかったので怒ってます

## ROLLBACK_FAILED
`CloudFormation`で実行したけど失敗してスタックのリソースを消そうとして消せなかったエラー  
もう一回削除ボタン？を押すと強制的に削除できます？

```plaintext
このスタックの削除を再試行しますか?
このスタックを削除すると、すべてのスタックリソースが削除されます。リソースは 削除ポリシー に従って削除されます。
このスタックを削除するが、リソースを保持次のリソースの削除に失敗したため、このスタックは以前削除に失敗しています。リソースを保持することを選択した場合、それらのリソースはこの削除オペレーション中にスキップされます。
このスタック全体を強制削除このスタックを強制削除すると、削除プロセス中に削除できなかったリソースが残る可能性があります。ただし、スタック自体は正常に削除されます。
```

## 日本語が文字化けする
**雰囲気で英語を使う**

![japanese_not_working](https://oekakityou.negitoro.dev/original/a5e905dd-ebab-43bb-aa09-2ec65b0f1cff.png)

## Resource handler returned message: "Invalid request provided: AWS::CloudFront::OriginAccessControl" (RequestToken: , HandlerErrorCode: InvalidRequest)
ありがとう  
https://zenn.dev/praha/articles/1e1ed9d45f280c

`CloudFront`の`OriginAccessControl`の名前が長過ぎる

## Resource handler returned message: "Invalid request provided: Exactly one of CustomOriginConfig, VpcOriginConfig and S3OriginConfig must be specified"
ありがとう  
https://dev.classmethod.jp/articles/cloudfront_s3_oac_setup_with_cloudformation/

`CloudFront ディストリビューション`を作るときに、`S3OriginConfig`とその中に`OriginAccessIdentity`を指定する必要あり。`OriginAccessIdentity`は空文字でいいから**必要**

```yaml
CloudFrontDistribution:
  Type: AWS::CloudFront::Distribution
  Properties:
    DistributionConfig:
      Origins:
        - Id: !GetAtt WebSiteBucket.RegionalDomainName # マネジメントコンソールで作ると DomainName と同じ文字列になってそう
          DomainName: !GetAtt WebSiteBucket.RegionalDomainName # リージョンが入ってないとアクセスできなかった
          OriginAccessControlId: !GetAtt OriginAccessControl.Id
          S3OriginConfig:
            OriginAccessIdentity: '' # ここに空文字が必要
```

## Resource handler returned message: "Invalid request provided: AWS::CloudFront::Distribution: The specified cache policy does not exist. (Service: CloudFront, Status Code: 404, Request ID

わからない。

```yaml
CachePolicyId: !Sub CachePolicyCreatedOrManaged
```

を、とりあえず成功させるために直接指定するようにした。`!Ref`じゃないと成功しないのか？

```yaml
CachePolicyId: 658327ea-f89d-4fab-a63d-7e88639e58f6
```

## CloudFront にアクセスしたら Access Denied
`S3`の設定で、`Amazon S3 マネージドキーを使用したサーバー側の暗号化 (SSE-S3)`を使うようにする必要がありそう？適当にコピペした仇が

```yaml
WebSiteBucket:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: !Ref BucketName
    BucketEncryption:
      ServerSideEncryptionConfiguration:
        - BucketKeyEnabled: true
          ServerSideEncryptionByDefault:
            SSEAlgorithm: AES256 # これ
```

## Resource handler returned message: "The XML you provided was not well-formed or did not validate against our published schema
普通に`yaml`の**書き方間違ってた**

```yaml
ServerSideEncryptionConfiguration:
  - ServerSideEncryptionByDefault:
      SSEAlgorithm: AES256
  - BucketKeyEnabled: true
```

↑間違い↓正解

```yaml
ServerSideEncryptionConfiguration:
  - ServerSideEncryptionByDefault:
      SSEAlgorithm: AES256
    BucketKeyEnabled: true
```

## Resource handler returned message: "Invalid request provided: AWS::CloudFront::Function: (Service: CloudFront, Status Code: 409, Request ID

`ARN`の値間違えてる？

## Resource handler returned message: "Invalid request provided: AWS::CloudFront::Distribution: The parameter FunctionAssociationArn is invalid
`CloudFront Function`の作成で`AutoPublish: true`をつけ忘れていた？

```yaml
CloudFrontAddIndexFunction:
  Type: AWS::CloudFront::Function
  Condition: CreateCloudFrontFunction
  Properties:
    Name: !Ref CloudFrontFunctionName
    AutoPublish: true # これ
  # 以下省略...
```

## エラー画面が XML から 503 になった

```plaintext
503 ERROR
The request could not be satisfied.
The CloudFront function associated with the CloudFront distribution is invalid or could not run. We can't connect to the server for this app or website at this time. There might be too much traffic or a configuration error. Try again later, or contact the app or website owner.
If you provide content to customers through CloudFront, you can find steps to troubleshoot and help prevent this error by reviewing the CloudFront documentation.
Generated by cloudfront (CloudFront)
Request ID: ....
```

さんこう  
https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/example_cloudfront_functions_url_rewrite_single_page_apps_section.html

`CloudFront Function`のサンプルコードで`async/await`を使っているが、私はそれに気付かず`JavaScript ランタイム 1.0`を選んでしまった。  
このコードは`ランタイム2.0`限定だった。

```yaml
CloudFrontAddIndexFunction:
  Type: AWS::CloudFront::Function
  Condition: CreateCloudFrontFunction
  Properties:
    Name: !Ref CloudFrontFunctionName
    AutoPublish: true
    FunctionConfig:
      Comment: add index.html to url suffix
      Runtime: cloudfront-js-2.0 # これ
  # 以下省略
```

## やっぱり 503
`S3`の`Origins`の`ID`と`DomainName`が微妙に間違えているらしい。  
`!GetAtt WebSiteBucket.DomainName`は**間違いで**、`!GetAtt WebSiteBucket.RegionalDomainName`じゃないと**ダメっぽい**

```yaml
CloudFrontDistribution:
  Type: AWS::CloudFront::Distribution
  Properties:
    DistributionConfig:
      Origins:
        - Id: !GetAtt WebSiteBucket.RegionalDomainName # マネジメントコンソールで作ると DomainName と同じ文字列になってそう
          DomainName: !GetAtt WebSiteBucket.RegionalDomainName # リージョンが入ってないとアクセスできなかった
```

違いはこうで、リージョンの有無？

- `!GetAtt WebSiteBucket.DomainName`
  - `{バケット名}.s3.amazonaws.com`
- `!GetAtt WebSiteBucket.RegionalDomainName`
  - `{バケット名}.s3.{リージョン}.amazonaws.com`

というのも、マネジメントコンソールでマウスぽちぽちして作った`ディストリビューション`を見たんですが、どうも`リージョン`がある方が期待値っぽいんですよね。

これで見れるようになった！！！

## おわりに
数日かかった理由、↑に書いた`CloudFront`の`S3Origin`の`DomainName`のせいだと思ってる。  
`!GetAtt WebSiteBucket.DomainName`ではダメで、`RegionalDomainName`を使わないといけなかった。これに気付かなかった。

なんか検索しても`DomainName`の方ばっかりで`RegionalDomainName`なんて使って無い。じゃあなんでそっちがなんで動いているのかは不明です。  
謎。

```yaml
CloudFrontDistribution:
  Type: AWS::CloudFront::Distribution
  Properties:
    DistributionConfig:
      Origins:
        - Id: !GetAtt WebSiteBucket.RegionalDomainName # マネジメントコンソールで作ると DomainName と同じ文字列になってそう
          DomainName: !GetAtt WebSiteBucket.RegionalDomainName # リージョンが入ってないとアクセスできなかった
          OriginAccessControlId: !GetAtt OriginAccessControl.Id
          S3OriginConfig:
            OriginAccessIdentity: ''
      DefaultCacheBehavior:
        AllowedMethods:
          - GET
          - HEAD
        TargetOriginId: !GetAtt WebSiteBucket.RegionalDomainName # Origins Id に合わせる
        ViewerProtocolPolicy: allow-all
        FunctionAssociations:
          # CloudFront Functions を作成する場合は、CloudFrontAddIndexFunction に依存するように書いておく。これで CloudFormation は先に Function を作る順番になるはず
          - EventType: viewer-request
            FunctionARN: !If
              - CreateCloudFrontFunction
              - !GetAtt CloudFrontAddIndexFunction.FunctionMetadata.FunctionARN
              - !Sub arn:aws:cloudfront::${AWS::AccountId}:function/${CloudFrontFunctionName}
        CachePolicyId: !Ref CachePolicyCreatedOrManaged
        Compress: true
      HttpVersion: http2
      Enabled: true
      Comment: !Ref CloudFrontComment
```

# おわりに2
「静的(漢字変換に成功!!!)サイトなのに`AWS`使ってるからこんな難しいんだろ」というコメントがありました。  
いやーほｎ・・そうですね、そのとおりだと

じゃあなんでなんだよって話ですが、どっかで書いたような気もしなくないですがもう一回書いておくと、  
お一人様`Misskey`が`Amazon Lightsail`で動いているので、もうバックエンドが必要になったら**そっちに寄せていこう**ってことです。  
バックエンドとかインフラはさっぱりなんで、やたらめったら増やすのはあれだしもう`AWS`に寄せていこうと思った。

ちなみに`国産 VPS`と違ってパット見`Lightsail`が安く見えるのですが、円安のせいでそんなことないと思います。

# おわりに3
`Amplify`が進化しているそうなのでそっち選んでも良いかもしれませんね？  
わたしとしては`CloudFormation`書いたのでしばらく困らないと思う。

# おわりに4
`AWS`で障害があったらしいですが、基本的には`ap-northeast-1`（東京リージョン）を使っているので、特にこのサイトが見れなかった・・・事態にはなって無い、はずです。  
ご利用料金の画面がずっとエラーを返してた。くらい。