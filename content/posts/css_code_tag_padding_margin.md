---
title: CSSで<code>の一行目だけ空白がある
created_at: 2021-03-28
tags:
- CSS
- HTML
---
どうもこんばんわ。

重い腰を上げて調査した。

# 本題
なんか一行目だけ空白がある

![Imgur](https://imgur.com/4aTmscW.png)

# なおす
`padding`、`margin`を`0px`にしたら直ったのでメモ  
`Vuetify`導入下のCSSが以下の例なので、`.v-application`はいらないかもしれない

```css
.v-application code {
    /* codeタグにはpaddingとmarginをかけないほうがいい？ */
    padding: 0px !important;
    margin: 0px !important;
    font-weight: initial !important;
    border-radius: 5px !important;
    font-family: 'Koruri Regular';
    font-size: initial !important;
}
```