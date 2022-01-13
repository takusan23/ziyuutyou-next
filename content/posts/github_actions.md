---
title: 初めての GitHub Actions 定期実行編
created_at: 2020-08-23
tags:
- GitHub Actions
---

(多分最後の)夏休みが終わりますね  


# 本題
コロナカレンダーできました。  

<a href="https://tokyo-covid19-calendar.netlify.app/">![Imgur](https://imgur.com/hm8jXlf.png)
</a>


URLです：https://tokyo-covid19-calendar.netlify.app/  

ソースコードです：https://github.com/takusan23/tokyo_covid19_calendar

でもこれ、データ（東京都 新型コロナウイルス陽性患者発表詳細）の更新があった際にいちいち

- GitHubへプッシュする or 手動でNetlifyのデプロイボタンを押す
    - Netlifyに設定したビルドコマンドが走る。以下
        - 1: CSVファイルをダウンロード
            - 東京都 新型コロナウイルス陽性患者発表詳細
            - https://stopcovid19.metro.tokyo.lg.jp/data/130001_tokyo_covid19_patients.csv
        - 2: CSVファイルをJSON形式へ変換するプログラムを動かす
            - https://github.com/takusan23/tokyo_covid19_calendar/blob/master/download/main.js
        - 3: データが揃ったところでNuxtの静的サイト書き出しを開始

サイトの中身を更新するには、一日一回プッシュするか、手動でデプロイボタンを押さないと行けないんですよね。（そもそも手動でデプロイボタンを押すなんてあったっけ）  
定期的に動かすにしてもずっとパソコン付けとくわけにも行かないし。  
というわけで今回は**GitHub Actions**を使ってみようと思います。

# GitHub Actions #とは
CI/CDサービス は？  
GitHubから直接コードをビルド、テスト、デプロイできるらしい

## CI/CDサービス #とは
自動でビルドしたりするサービスらしい。  
デプロイも自分でやらずに任せることができるってことかな。  
今回は定期実行させるけど、pushがあった時にデプロイ作業(`npm run generate`とか)をさせるみたいなことがやりたい場合はこれを使うらしい？

まあすごい雑に言うと **GitHubの持ってるすごいパソコンを使って自動で作業をやらせることができる** ってことだと思います。

~~というわけで、定期実行で何か成果をだしてコミット＆プッシュすれば自動草生やし機にもなれます。チートだね。~~

# はじめる

Netlifyにどうやって**ビルドしてくれ**って頼むかって言うと**WebHook**ってのを通じて行います。  

**あとGitHub Actionsがコケると毎回メールで通知してくるので気をつけてね。**

## GitHubのリポジトリのページを開いて

**Actions**を見つけてください。

![Imgur](https://imgur.com/jif7sE3.png)

開いたら、`Set up this workflow`を押してみましょう。  

![Imgur](https://imgur.com/8JrO3j1.png)

もしない場合は `set up a workflow yourself` を押せばいいと思います

![Imgur](https://imgur.com/jMFb5o8.png)

するとこんな感じのエディタが開きます。  
ここにコマンドを書いたりするわけですね。  

![Imgur](https://imgur.com/LXLmyZi.png)

# 実行ボタンを付ける
今現在（2020/08/24）、初期状態ではGitHub Actionsを実行するボタンは有りません。  
初期状態のままだと、プッシュするまで動くかどうかわからんのです。

というわけで実行ボタンを利用できるようにしましょう。  

テキストの中から、`on:`ってところを探します。

```yml
on:
    push:
      branches: [ master ]
    pull_request:
      branches: [ master ]
```

ここらへんですね。

そしたら一行`on:`の下に`workflow_dispatch:`を書き足します。こんな感じに
```yml
on:
    workflow_dispatch:
    push:
      branches: [ master ]
    pull_request:
      branches: [ master ]
```

これで手動実行が利用できるようになりました。**というか初めから付けとけ**

# 名前変更
今のままだと`blank.yml`ってなってるので、何をするのワークフローなのか名前を変えてあげましょう。  
今回は`interval_netlify_webhook.yml`とかにしておきますか

![Imgur](https://imgur.com/kiWSwTB.png)

それとは別に、ワークフローの名前ってのがあります。  
これはGitHub Actionsの方で使われる名前になります（ファイル名とは別になってる）。  

初期状態では`CI`ってなってますね。この名前はGitHub Actionsの一覧等で使われてます。  
こちらも変えておきましょう
```yml
# This is a basic workflow to help you get started with Actions

name: IntervalNetlifyWebHook
```

こういうところで使われている。まあ触ってみるのが一番早い  
![Imgur](https://imgur.com/xqivVgN.png)

# 書いていく
## `on` (トリガー)
これからワークフローを起動する条件（トリガー）を書いていきましょう。  
それで定期実行（と手動実行）は以下のように書けばいいです。

```yml
on:
    workflow_dispatch:
    schedule:
      - cron: '0 0 * * *' # 日本時間朝の9時に毎日実行
```

0 0 って書いてるのになんで9時が出てくんだよって話ですが、これタイムゾーンがUTCになってるからですね。UTCで0時は日本(JST)では9時になります。  

もし午前九時じゃやだ！って場合はこんなツールがあります：https://crontab.guru/

こんかいはこのまま行きます。

## `build`
`build:`の下にある`runs-on`は環境ですので多分そのままでいいと思います(Windowsじゃなきゃダメみたいなら調べて)

なので`steps:`から書いていきましょう。

## `steps` (中身)
ここには仕事内容を書きます。Node.jsなら`npm install`とかですかね。  
今回やりたいことはNetlifyにビルドしてくれって頼むことですね。WebHookを使います。  
なので`on:`と`steps:`以外はあんま触らないのかな。

### WebHookのURLを生成する
Netlifyのサイトの設定画面へ入って、  
`Build & Deploy`を押し、`Build hooks`まで進みます。
![Imgur](https://imgur.com/eSQp9Bu.png)

そしたら`Add build hook`をおして、適当な名前をつけて、URLを生成してもらいましょう。

できたらこうです！

```yml
# NetlifyのWebHook
  - name: Netlify WebHook
    uses: wei/curl@v1.1.1
    with:
      args: -X POST -d {} ${{ secrets.WEBHOOK_URL }}
```

## WebHook URLの保存場所
privateなリポジトリじゃない場合はGitHub Actionsの中身も見れてしまうので(WebHook URL見られるとやばい)、WebHookのURLを別の場所に隠しておきましょう。  
リポジトリの設定画面へ進んで、`Secrets`を選び、`New Secrets`を押しましょう。  
![Imgur](https://imgur.com/WZeVJAN.png)

nameに`WEBHOOK_URL`、valueにNetlifyから生成されたWebHook URLを入れます。

# すべてくっつけたコード

```yml
# GitHub Actions 上での名前

name: IntervalNetlifyWebHook

# 起動条件
on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * *' # 日本時間午前九時に毎日実行

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # This workflow contains a single job called "build"
  build:
    # The type of runner that the job will run on
    runs-on: ubuntu-latest

    # こっから書いていく
    steps:
      
    # NetlifyのWebHook
      - name: Netlify WebHook
        uses: wei/curl@v1.1.1
        with:
          args: -X POST -d {} ${{ secrets.WEBHOOK_URL }}
```

# 早速動かしてみる
`Start Commit`を押して保存しましょう。  

![Imgur](https://imgur.com/OrYpuL3.png)

できたらまた`Actions`を開いてください。名前が増えていると思います。

名前を押して`Run workflow`をおして<span style="border: solid 2px green;background-color:green;color:#fff;padding:2px;border-radius:5px"> Run workflow </span>を押しましょう

![Imgur](https://imgur.com/oY70nww.png)

# 動いたか
再読み込み？すると新しくなんかできるので押します。  
![Imgur](https://imgur.com/4HK9rXd.png)

そしたら横の`build`を選びます。  
![Imgur](https://imgur.com/Q254eH2.png)

ちゃんとできてるみたいですね！

そしてNetlifyの方でもビルドが走ってることが確認できました。

![Imgur](https://imgur.com/433LX6W.png)

これで自動で指定した時間にNetlifyのビルドをさせることができました。やったぜ  
コードはここです：[すべてくっつけたコード](#すべてくっつけたコード)

# 番外編 自動草生やし機
GitHub Actionsからコミット+プッシュしたい場合は参考にしてください。

```yml
# GitHub Actions 上での名前

name: AutoGrass

# 起動条件
on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * *' # 日本時間午前九時に毎日実行

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # This workflow contains a single job called "build"
  build:
    # The type of runner that the job will run on
    runs-on: ubuntu-latest

    # こっから書いていく
    steps:
      # リポジトリに触れるように
      - uses: actions/checkout@v2
      
      # 適当なファイルを作る
      - name: Update File
        run: node main.js
   
      # Gitの設定する
      - name: Git Setting
        run: |
          git config --global user.email "${{ secrets.MAIL }}"
          git config --global user.name "${{ secrets.USER_NAME }}"
                  
      # CommitとPushする
      - name: Commit and Push
        run: |
           git commit -m "[GitHub Actions] File Update" -a
           git pull
           git push origin master
```

GitHub Actionsで動かす`main.js`は以下
```js
/** 適当なファイルを生成するだけのNode.jsプログラム */

const fs = require('fs')
// 書き込むテキスト
const text = new Date().toLocaleString()
// 保存
fs.writeFile("text.txt", text, (err) => {
    if (err) {
        console.log("えらー")
    }
})
```

GitHubのリポジトリの設定 > Secrets > New secret で2つ追加してください。

- MAIL
    - GitHubのメアド
- USER_NAME
    - GitHubのユーザー名

ソースコード（schedule:とその下がコメントアウトされてますので気をつけて）：https://github.com/takusan23/AutoGrassAction

# おわりに
GitHub Actionsのymlファイルはブラウザからしか変更できない？VSCodeで変更してPushすると怒られるし

あと定期実行できてるかどうかは朝九時になるまでわからん。それまでのお楽しみ

二学期かぁ。早起きするのつらい