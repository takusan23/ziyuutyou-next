---
title: このサイトについて
created_at: 2022-01-04
---

`JetpackCompose`に似てる`React`やってみたいなーって感じで`Next.js`で書き直しています。正月休み短いってば

いやマジで`JetpackCompose`やん`React`。**CSSがダルい**以外で差があんまりない。

```kotlin
@Composable
fun ExpandedText() {
    var isExpanded by remember { mutableStateOf(false) }

    Column {
        Text(text = "Hello")
        if (isExpanded) {
            Text(text = "World")
        }
        Button(
            onClick = { isExpanded = !isExpanded }
        ) { Text(text = "Open!") }
    }
}
```

```tsx
const ExpandedText = () => {
    const [isExpanded, setExpanded] = useState(false)

    return (
        <>
            <p>Hello</p>
            {
                isExpanded && <p>World</p>
            }
            <Button onClick={()=> setExpanded(!isExpanded)}>
                Open!
            </Button>
        </p>
    )
}

export default ExpandedText
```

# このサイトについて
普段はAndroidの記事を書いています。  
**Next.js**の静的書き出し機能(SSG)を使ってこのサイトは出来ています。

前のブログ(`Nuxt.js`)のソースコード→ https://github.com/takusan23/ziyuutyou  
前の前のブログ(`Hexo`)→ https://takusan23.github.io/Bibouroku/

# プライバシーポリシー

Google Analyticsを置いてます。これは私がこのサイトを見てくれた人が何人いるか等を見たいために置きました。
Google Analyticsはデータの収集でCookieを利用しています。
データ収集は匿名で行われており、個人がわかるような値は収集していません。
Cookieを無効化することでGoogle Analyticsの収集を拒否することができます。
詳しくはここへ→ https://policies.google.com/technologies/partner-sites?hl=ja

# 利用している技術 / ライセンス
thx!!!

- react
    - MIT
    - https://github.com/facebook/react/blob/main/LICENSE
- react-dom
    - MIT
    - https://github.com/facebook/react/blob/main/LICENSE
- next
    - MIT
    - https://github.com/vercel/next.js/blob/canary/license.md
- next-pwa
    - MIT
    - https://github.com/shadowwalker/next-pwa/blob/master/LICENSE
- @mui/icons-material
    - MIT
    - https://github.com/mui-org/material-ui/blob/master/LICENSE
- @mui/material
    - MIT
    - https://github.com/mui-org/material-ui/blob/master/LICENSE
- @emotion/react
    - MIT
    - https://github.com/emotion-js/emotion/blob/main/packages/react/LICENSE
- @emotion/styled
    - MIT
    - https://github.com/emotion-js/emotion/blob/main/packages/styled/LICENSE
- gray-matter
    - MIT
    - https://github.com/jonschlinkert/gray-matter/blob/master/LICENSE
- highlight.js
    - BSD-3-Clause License
    - https://github.com/highlightjs/highlight.js/blob/main/LICENSE
- rehype-stringify
    - MIT License
    - https://github.com/rehypejs/rehype/blob/main/license
- rehype-highlight
    - MIT License
    - https://github.com/rehypejs/rehype-highlight/blob/main/license
- rehype-raw
    - MIT License
    - https://github.com/rehypejs/rehype-raw/blob/main/license
- remark-gfm
    - MIT License
    - https://github.com/remarkjs/remark-gfm/blob/main/license
- remark-parse
    - MIT License
    - https://github.com/remarkjs/remark/blob/main/license
- remark-rehype
    - MIT License
    - https://github.com/remarkjs/remark-rehype/blob/main/license
- unified
    - MIT License
    - https://github.com/unifiedjs/unified/blob/main/license
- @types/react
    - MIT
    - https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/LICENSE
- babel-plugin-inline-react-svg
    - MIT License
    - https://github.com/airbnb/babel-plugin-inline-react-svg/blob/master/LICENSE
- next-sitemap
    - MIT License
    - https://github.com/iamvishnusankar/next-sitemap/blob/master/LICENSE
- typescript
    - Apache License 2.0
    - https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt
 - Koruri Regular
    - Apache License 2.0
    - https://github.com/Koruri/Koruri/blob/master/LICENSE