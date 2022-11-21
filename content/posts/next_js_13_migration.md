---
title: Next.js 13 にした (しただけ)
created_at: 2022-11-20
tags:
- Next.js
- React.js
- Node.js
- TypeScript
---
アップデートするだけして`pagesディレクトリ`のまま使う。

# 本題
`Next.js`を`13`へアップデートします

```
npm i next@latest react@latest react-dom@latest
```

アップデートしました

```
+ react@18.2.0
+ react-dom@18.2.0
+ next@13.0.4
added 2 packages from 1 contributor, updated 9 packages and audited 679 packages in 29.044s
```

なんか脆弱性があると言われたので、`npm audit`でライブラリを特定したのち、

```
npm i next-pwa@latest
```

を実行しました。

```
+ next-pwa@5.6.0
added 1 package from 1 contributor, removed 2 packages, updated 124 packages and audited 678 packages in 47.296s
```

はい！動かなくなりました！

![Imgur](https://imgur.com/j6iRaTB.png)

# ついでに Material UI のアップデート

```
npm install @mui/material @emotion/react @emotion/styled
```

アップデートできました

```
+ @mui/material@5.10.14
+ @emotion/styled@11.10.5
+ @emotion/react@11.10.5
added 23 packages from 8 contributors, removed 4 packages, updated 36 packages and audited 697 packages in 34.223s
```

しかし動かず...ぐぬぬ

# 原因は next/link の子要素を aタグ でくくってたから
どうやら`Next.js 13`から子要素を`a`にする必要がなくなった模様。なので`MUI`の`component="a"`を消せばいいらしい。

```tsx
/** ナビゲーション一覧コンポーネント */
const NavigationLink = () => {
    return (
        <Box>
            <List>
                {
                    // mapでElementを返す
                    linkList.map(linkData => (
                        <Link href={linkData.link} passHref key={linkData.link}>
                            <ListItemButton component="a">
                                <ListItemIcon>{linkData.icon}</ListItemIcon>
                                <ListItemText primary={linkData.title} />
                            </ListItemButton>
                        </Link>
                    ))
                }
            </List>
        </Box>
    )
}
```

消したらレイアウトがダサくなったので、`aタグ`の下の線と色を消すような`CSS`をセットします。`CSS`ガチでどこにかけば反映されるのかわからん；；

```tsx
/** ナビゲーション一覧コンポーネント */
const NavigationLink = () => {
    return (
        <Box>
            <List>
                {
                    // mapでElementを返す
                    linkList.map(linkData => (
                        <Link
                            style={{
                                textDecoration: 'none',
                                color: 'inherit'
                            }}
                            href={linkData.link}
                            key={linkData.link}
                        >
                            <ListItemButton>
                                <ListItemIcon>{linkData.icon}</ListItemIcon>
                                <ListItemText primary={linkData.title} />
                            </ListItemButton>
                        </Link>
                    ))
                }
            </List>
        </Box>
    )
}
```

以下のように`<a>`でくくってた部分も以下のように置き換えられます。

```tsx
<Link passHref href={props.blogItem.link}>
    <a style={{ color: theme.palette.primary.main, fontSize: 25 }} >
        {props.blogItem.title}
    </a>
</Link>
```

↓

```tsx
<Link
    style={{
        color: theme.palette.primary.main,
        fontSize: 25
    }}
    href={props.blogItem.link}
>
    {props.blogItem.title}
</Link>
```

`<Chip>`の場合は`clickable`属性をつけるとマウスポインタもいい感じに出来ます

```tsx
<Link
    style={{
        textDecoration: 'none',
        color: 'inherit'
    }}
    href={`/posts/tag/${data.name}/`}
    key={data.name}
>
    <Chip
        sx={{
            marginRight: 1,
            marginTop: 1
        }}
        clickable
        color="primary"
        icon={<LocalOfferOutlined />}
        label={`${data.name} - ${data.count} 件`}
    />
</Link>
```

おわり。  
`appディレクトリ`はなんか難しそう...だし`Netlify`で動くか分からんので様子見します ( ˘ω˘)ｽﾔｧ