# ziyuutyou-next
たくさんの自由帳 Next.js リメイク版

![Imgur](https://imgur.com/6N5X7yQ.png)

`Next.js` / `MUI` / `unified` で出来ている。

## 開発環境構築

- このリポジトリをクローンします
- クローンしたフォルダ内でターミナルを立ち上げます
- 以下を実行します
```
npm i
```
- 開発サーバーを立ち上げます
```
npm run dev
```
- (多分) `localhost:3000`をブラウザで開きます

## ファイル構造

- content
    - 記事のMarkdown とか 書き出し時に呼び出すJSONとか
- components
    - MUIには無いUI部品
- pages
    - 画面遷移等のページ
    - AndroidのFragmentみたいな
- public
    - アイコン等のリソース
- src
    - components でも pages でもないTypeScriptファイルの置き場所
    - 記事読み込みクラスとか
- styles/css
    - ほとんどMUIがやってるけどちょっとだけcssを書いたので