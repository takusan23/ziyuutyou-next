---
title: Next.jsでブログを作った際に大変だったこと
created_at: 2022-01-04
tags:
- Next.js
- TypeScript
- 自作ブログ
---

## Nuxt.js からの移行
- URLの末尾にスラッシュを付ける
    - 知らんけどONにしておく

## remark() と rehype() 
- remark
    - Markdown処理系
- rehype
    - Html処理系

```ts
// マークダウン -> HTML
// remark がmarkdownからHTMLへ
const remarkParser = await remark()
    .use(remarkHtml)
    .process(markdownContent)
const markdownToHtml = remarkParser.toString()
// rehype でHTMLにシンタックスハイライトを付ける。remark版はな
const rehypeParser = await rehype()
    .use(rehypeHighlight)
    .process(markdownToHtml)
const attachHighlightFromHtml = rehypeParser.toString()
```

### Markdownのテーブル（表）、打ち消し線、URLの自動リンク機能は標準機能ではない！

すべて有志の拡張機能だったんですね。  
というわけで、`remark-gfm`を入れます。

```
npm i remark-gfm
```

あと表には CSS を当てないと見ずらいですね。

```css
table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    margin: 10px;
}

table tr {
    border-bottom: solid 1px #000;
}

table td {
    padding: 10px;
    text-align: center;
}
```