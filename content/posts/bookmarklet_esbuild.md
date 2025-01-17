---
title: ブックマークレットを esbuild で作る
created_at: 2024-05-07
tags:
- esbuild
- TypeScript
---
どうもこんばんわ。  
恋にはあまえが必要です ～もっとあまえるだけミニファンディスク、恋にはあまえが必要です ～もっとあまえてもらうだけミニファンディスク 攻略しました。  

みじかい！！！もっと見たかった  
一番最後が HOOK って感じがしてとてもよかった！！！

![Imgur](https://i.imgur.com/LAkBHj7.png)

![Imgur](https://i.imgur.com/2yIE0Zm.png)

![Imgur](https://i.imgur.com/KLbZRJu.png)

おさげだ！！

![Imgur](https://i.imgur.com/bJeLENp.png)

イベントCGが気になって結局両方買ってしまった。。。

![Imgur](https://i.imgur.com/lCP47z5.png)

# 本題
世の中には`ブックマークレット`と呼ばれてるものがあります。  
これは何かというと、ブラウザのブックマークの仲間で、普通はブックマークといえば`URL`を保存するものですが、任意の`JavaScript`コードを保存することが出来ます。  
ブックマークを押したら`URL`が開きますが、ブックマークレットは押したら中にある`JavaScript`のコードが実行できます。

ブラウザ拡張機能のしょぼい版。しかし！スマホのブラウザ（`Android Chrome`）では拡張機能動かない一方で、ブックマークレットは動くので何かと便利かも。  
ぱっと思いついたのでも

- 全画面表示にするブックマークレット（`requestFullscreen`呼ぶだけ）とか
- 動画をループ再生させるブックマークレット（`<video>`の`loop`を`true`にするだけ）
- `QRコード`を表示するブックマークレット

とかあるので、色々面白いことがスマホのブラウザでもできそう。そうスマホのブラウザでもね！

# 例
例えばコレが全画面表示にするブックマークレット。  
`javascript:`から始まってて、かつスコープを汚さないよう即時関数の中に入ってますね。

```js
javascript:(function(){ document.documentElement.requestFullscreen() })();
```

てなわけで、この中に好きな`JavaScript`を書けば良さそうですね。  

```js
javascript:(function(){ /* ここに好きなのを書けばいい */ })();
```

# モダンな技術を使いたい
さて本題。  
本当に全画面表示にするだけなら1行ですが、  
今日の`JavaScript`での`Web`開発では`npm`からライブラリを入れるだの、`TypeScript`で書くのが当たり前で、`JavaScript`をつらつらと書いていくのは時代に合わないって？  

なんなら`npm`でライブラリを入れて`TypeScript`でブックマークレットが書きたいだって？  

というわけで今回は、`esbuild`でブックマークレットを作る話です。  
これで`npm i`できるし、`TypeScript`で書けます。最終的には`JavaScript`になって、**ブックマークレットとして登録**できるようにしてみます。

## esbuild
バンドラー。  
らしいけどよくわからない、今回は`npm i`したライブラリを一つの`JavaScript`にまとめて、かつ`TypeScript`で書けるようにしたいだけ。  

どうやら`esbuild`、何もしてなくても一つの`JavaScript`として吐き出すので（よくわからない）、一つになるならブックマークレットにもってこいじゃんってなった。  
https://esbuild.github.io/getting-started/#your-first-bundle

# つくる
今回は`QRコード`を表示するブックマークレットでも作ってみますか。  
`npm`からライブラリを入れて`QRコード`を作ることにします。

# 環境
`Node.js`入ってて`esbuild`動けば何でもいいんじゃない？

| key              | value   |
|------------------|---------|
| Windows          | 10 Pro  |
| テキストエディタ | VSCode  |
| Node.js          | v20.9.0 |

## 適当にフォルダを作る
適当にフォルダを作り、ターミナルを開いて、`npm init`します。

![Imgur](https://i.imgur.com/yoaeuc1.png)

## esbuild を入れる
以下を叩く

```shell
npm install --save-exact --save-dev esbuild
```

## main.ts を用意する
`main.ts`ファイルを置きます。  
中身はとりあえず、全画面表示にするコードでも。`TypeScript`要素なし！

```ts
document.documentElement.requestFullscreen()
```

![Imgur](https://i.imgur.com/slEIPI0.png)

## ブックマークレットとして登録できるようにビルドコマンドを書く
前述の通り、以下のように`javascript:`を付けたりしないとブックマークレットとして登録できないので、そうなるように調整します。

```js
javascript:(function(){ /* esbuild さん、ここにコード出して！ */ })();
```

`package.json`を開き、`build`コマンドを追加します。以下のように。。  
`scripts`の中ですね

```json
{
  "name": "qrcode-esbuild-bookmarklet",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "esbuild main.ts --bundle --minify --outfile=bookmarklet.js --banner:js=javascript: --format=iife"
  },
```

### コマンドの解説

- `esbuild main.ts`
    - `main.ts`を`JavaScript`にしてねって
    - `--bundle`
        - 必要なライブラリ（`node_modules`の中身）も、これから吐き出す`JavaScript`に混ぜてねって
        - ブックマークレットは一つの`JavaScript`にする必要があり、**node_modules がブラックホールで～**とか言ってる場合ではない
            - https://esbuild.github.io/getting-started/#your-first-bundle
    - `--minify`
        - 小さくしてくれる
        - ミニファイに関して面白い話があった： https://esbuild.github.io/faq/#minified-newlines
    - `--outfile=bookmarklet.js`
        - 出力先です
        - 複数の`TypeScript`のファイルにまたがってようと一つになるはず
    - `--banner:js=javascript:`
        - https://esbuild.github.io/api/#banner
        - これは、吐き出す`JavaScript`の先頭に好きな文字を埋め込めるオプションです
        - これを使い、ブックマークレット先頭の`javascript:`を付与するようにしています
    - `--format=iife`
        - https://esbuild.github.io/api/#format-iife
        - これを使うと、即時関数の中に吐き出した`JavaScript`が出てくるようになります
            - `(()=>{ /*こ↑こ↓*/ })();`

いや、、、なんかね、もっと苦戦するもんだと思ってたんだけど、オプション何個か指定するだけで終わったわ。すごすぎる`esbuild`

# とりあえず吐き出してみる
以下のコマンドを叩いてみます

```shell
npm run build
```

![Imgur](https://i.imgur.com/NfbjAeB.png)

出来ました、とっても速いですね。

![Imgur](https://i.imgur.com/SuSxTkj.png)

# 追加してみる
`Chrome`なら`ブックマークとリスト > ブックマーク マネージャ`、`Firefox`なら`ブックマーク > ブックマークを管理`で開く画面で新しいブックマークが登録できるはず。  
アドレス欄の☆を押して登録するから新規登録どこだか分かんなかった。

![Imgur](https://i.imgur.com/AaqZpfL.png)

![Imgur](https://i.imgur.com/3cOsNcs.png)

名前は適当に、`URL`の欄にはさっき出てきた`bookmarklet.js`の中身を貼り付けます。改行があると思いますが気にせずコピーして貼り付けてオッケーなはず。  

![Imgur](https://i.imgur.com/qCNMlCM.png)

# 早速使ってみる
押します・・！

![Imgur](https://i.imgur.com/P53eVim.png)

おお～

![Imgur](https://i.imgur.com/LLp1APV.png)

ちなみに同期されれば他のスマホからでも使えるんじゃないでしょうか！？

# ライブラリも入れて完璧にしてみる
今回はこちらのライブラリを借りて、`QRコード`を作ってみます。ありざいす  

https://www.npmjs.com/package/qrcode

```shell
npm install --save qrcode
npm i --save-dev @types/qrcode
```

## QR コードを画面に出すブックマークレット（TypeScript）
ライブラリのおかげでほとんど何もしてないですね、、

```ts
import QRCode from "qrcode"

// QRコードを描画する Canvas を用意
const qrCodeCanvas = document.createElement('canvas')

// 真ん中に出す
// https://stackoverflow.com/questions/2005954/
qrCodeCanvas.style.position = 'fixed'
qrCodeCanvas.style.top = '50%'
qrCodeCanvas.style.left = '50%'
qrCodeCanvas.style.transform = 'translate(-50%, -50%)'
// z-index は一番上に出てきてほしいので、あんまり良くないかもだけど
qrCodeCanvas.style.zIndex = 'calc(infinity)'

// 追加する
document.body.appendChild(qrCodeCanvas)

// クリックで消したい
qrCodeCanvas.onclick = () => {
    document.body.removeChild(qrCodeCanvas)
}

// QRコードを生成する
QRCode.toCanvas(qrCodeCanvas, location.href, (error) => {
    if (error) {
        alert('QRコードの生成に失敗しました')
    }
})
```

これを`npm run build`して、`bookmarklet.js`をブックマークレットとして登録すれば・・・  
動きました！やった～

![Imgur](https://i.imgur.com/oXBhPiL.png)

ちゃんとライブラリも`bookmarklet.js`の中に同梱されてそうですね。（動いているのを見る限り）  
これで今日のフロントエンド開発の経験をブックマークレット開発でも活かせるようになりました。  
めでたしめでたし

# ソースコード
煮るなり焼くなり

https://github.com/takusan23/qrcode-esbuild-bookmarklet

# Q.スマホじゃ動かないんですけど
ブックマーク一覧から選ぼうとすると失敗します。  
アドレス欄からブックマークレットの名前を入力して、出てきたブックマークレットを選ぶことで起動できます。

![Imgur](https://i.imgur.com/4MaIB3l.png)

![Imgur](https://i.imgur.com/jATQaxI.png)

# おわりに
もっと苦戦するはずだったんだけど`esbuild`とライブラリが全部やってくれました。