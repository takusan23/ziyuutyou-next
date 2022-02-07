---
title: MUIのGridを使って残りを埋めたり真ん中においたり
created_at: 2022-02-07
tags:
- TypeScript
- React.js
- Next.js
- MUI
---
どうもこんばんわ。  
Viewを目一杯広げる場合Androidだと`weight="1"`なのに、HTMLになると急に意味がわからなくなる。  
自分用メモ

# 環境

`MUI`できればいいので`Next.js`使う必要はないと思います。

| なまえ                        | あたい     |
|-------------------------------|------------|
| 言語                          | TypeScript |
| React                         | 17         |
| Next.js (多分Reactだけでいい) | 12         |
| MUI                           | 5.4.0      |

# 残りを埋める
これだけで埋めてくれます、CSS何も分からんからくっそ便利

## 横

```tsx
const Home: NextPage = () => {
  return (
    <Box>
      <Grid container >

        <Grid item xs="auto">
          <Card sx={{ backgroundColor: colors.blue[100] }}>
            <p>ここは最低限あればいいのよ</p>
          </Card>
        </Grid>

        <Grid item xs>
          <Card sx={{ backgroundColor: colors.red[100] }}>
            <p>ここは目一杯使ってほしい</p>
          </Card>
        </Grid>

        <Grid item xs="auto">
          <Card sx={{ backgroundColor: colors.blue[100] }}>
            <p>ここは最低限あればいいのよ</p>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}

export default Home
```

![Imgur](https://imgur.com/ih47IOr.png)

`xs="auto"`を付けることで必要最低限は確保してくれます。  
残りは`xs`を付けた要素が使ってくれます。

詳しくは：  

https://mui.com/components/grid/#auto-layout

## 縦

多分`height`の指定が必要だと思う

```tsx
const Home: NextPage = () => {
  return (
    <Box>
      <Grid
        container
        direction="column"
        sx={{ minHeight: "100vh" }}
      >

        <Grid item xs="auto">
          <Card sx={{ backgroundColor: colors.blue[100] }}>
            <p>ここは最低限あればいいのよ</p>
          </Card>
        </Grid>

        <Grid item xs>
          <Card sx={{
            height: "100%",
            backgroundColor: colors.yellow[100]
          }}>
            <p>ここは最低限あればいいのよ</p>
          </Card>
        </Grid>

        <Grid item xs="auto">
          <Card sx={{ backgroundColor: colors.red[100] }}>
            <p>ここは最低限あればいいのよ</p>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}

export default Home
```

![Imgur](https://imgur.com/JBSInFU.png)


# 真ん中

thx!!!  
https://stackoverflow.com/questions/50766693/how-to-center-a-component-in-mui-and-make-it-responsive

## 横

```tsx
const Home: NextPage = () => {
  return (
    <Box>
      <Grid
        container
        direction="row"
        alignContent="center"
        justifyContent="center"
        sx={{ minHeight: "100vh" }}
      >

        <Grid item xs="auto">
          <Card sx={{ backgroundColor: colors.blue[100] }}>
            <p>ここは最低限あればいいのよ</p>
          </Card>
        </Grid>

        <Grid item xs="auto">
          <Card sx={{ backgroundColor: colors.yellow[100] }}>
            <p>ここは最低限あればいいのよ</p>
          </Card>
        </Grid>

        <Grid item xs="auto">
          <Card sx={{ backgroundColor: colors.red[100] }}>
            <p>ここは最低限あればいいのよ</p>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}

export default Home
```

![Imgur](https://imgur.com/PzIUYF0.png)

## 縦

```tsx
const Home: NextPage = () => {
  return (
    <Box>
      <Grid
        container
        direction="column"
        alignContent="center"
        justifyContent="center"
        sx={{ minHeight: "100vh" }}
      >

        <Grid item xs="auto">
          <Card sx={{ backgroundColor: colors.blue[100] }}>
            <p>ここは最低限あればいいのよ</p>
          </Card>
        </Grid>

        <Grid item xs="auto">
          <Card sx={{ backgroundColor: colors.yellow[100] }}>
            <p>ここは最低限あればいいのよ</p>
          </Card>
        </Grid>

        <Grid item xs="auto">
          <Card sx={{ backgroundColor: colors.red[100] }}>
            <p>ここは最低限あればいいのよ</p>
          </Card>
        </Grid>

      </Grid>
    </Box>
  )
}

export default Home
```

![Imgur](https://imgur.com/b0aJ2Fd.png)