---
title: Tailwind CSS で作り直そうとしている
created_at: 2023-09-03
tags:
- 自作ブログ
- TailwindCSS
- Next.js
---

どうもこんばんわ。  
最近ずっとこれ聞いてる  

![Imgur](https://i.imgur.com/2MaMBpB.png)

*「偶然」で片付けたくない 運命にしたい*

ゲームやってないけどCDだけ買った。！！！

![Imgur](https://i.imgur.com/9DUoKCH.png)

# 本題
`Material-UI`をやめて、`Tailwind CSS`にしようと思います...

![Imgur](https://i.imgur.com/ZgnivHu.png)

![Imgur](https://i.imgur.com/MSVr7MU.png)

![Imgur](https://i.imgur.com/mcZbOGN.png)

![Imgur](https://i.imgur.com/9iXlLFM.png)

最近の`Android`というか、`Material 3`というかを真似てみました。  
角を結構丸くしたり、リストとか。

## 移行前
移行前の`main ブランチ`のコードを`material_ui`ブランチに切ってあります。  
https://github.com/takusan23/ziyuutyou-next/tree/material_ui

引き続き参照可能です。

# Tailwind CSS
賛否両論。わたしはすき、  
というか`Webフロント`よく知らないので、`Next.js`に入ってるやつ（いつの間にか選択できるようになったらしい）を大人しく使う。  

```tsx
/** RoundedCornerBox へ渡すデータ */
type RoundedCornerBoxProps = {
    /** どれだけ丸くするか */
    rounded?: 'small' | 'medium' | 'large'
    /** Tailwind CSS のクラス名 */
    className?: string
    /** 子要素 */
    children: ReactNode
}

/** 角丸なBox */
export default function RoundedCornerBox({ className, rounded, children }: RoundedCornerBoxProps) {
    // 変数埋め込みとかは使えない
    // https://tailwindcss.com/docs/content-configuration#class-detection-in-depth
    const colorOrDefault = className ?? 'bg-container-primary-light dark:bg-container-primary-dark'
    let roundedClassName: string
    switch (rounded ?? 'small') {
        case 'small':
            roundedClassName = 'rounded-md'
            break
        case 'medium':
            roundedClassName = 'rounded-xl'
            break
        case 'large':
            roundedClassName = 'rounded-3xl'
            break
    }

    return (
        <div className={`${roundedClassName} ${colorOrDefault}`}>
            {children}
        </div>
    )
}
```

# なんで
時代は`RSC ( React Server Components )`に突入したらしい。ブラウザ側で実行される`JavaScript`を減らす時代がやってきた！！！  
理由ですが...

- `CSS`絶対書きたくないから`Material-UI`入れたんだけど、`Tailwind CSS`が結構良さそうだった
    - これなら書きたい
        - なんか`.css`書きたくないし...
        - `scoped`な`css`とか`vue ?`にあった気がするけどあんまり使いこなせなかった...（私のせい
    - よく使うやつがすぐ使える`flex-row`/`flex-col`とか
        - 角を丸くするとか
        - `px-`/`py-`とか便利
            - `space-x-2 `これも
    - コンポーネントごとに区切ってるのでそんなに`class`長くてもそこまで、、、って感じな気がする
- ダークモードや、レスポンシブデザイン、テーマ機能がある
    - 現状使っているので必要
    - この辺も`CSS`をそのまま書くのは、、、うーんやりたくないかなあ
- 賛否両論あるけど特に困ってない！！！
    - （代替案を使ったこと無いので）

以上です。  
あと、`Tailwind CSS`関係なく、ブログ（静的サイト）なので、リッチな UI より読み込みが早いほうが良いかなあってのもあります。  
（`ゼロランタイム CSS`とかいうやつ）

ただ、ここで`RSC`や`Tailwind CSS`に**賭けて良い**のかは分からない、、、`Webフロントエンド`ってなんか流行の移り変わりが早すぎる。  

ちなみに`App Router`で動く`Material-UI`のサポートは入ったらしい。これでひたすら`"use client"`しなくても済むのかな？  
https://github.com/mui/material-ui/releases/tag/v5.14.0

あとは、移行したときに良いなと思ったこととかをつらつらと...

# 良かった点

## サーバーコンポーネント、クライアントコンポーネント どっちでも書ける
（最終的には`CSS`が吐き出される？）のが良さそう  
`クライアントコンポーネント`しか無いなら他のスタイリングを選んだほうがいいのか・・・も？  
ただ、ぶっちゃけ`サーバーコンポーネント`もよくわからない、、、けど面白そうだし試している

## リセット CSS
https://tailwindcss.com/docs/preflight

これ、`h1`、`h2`、、の大きさはすべて同じ大きさに揃えられます。  
`ul`や`p`に`margin`がデフォルトでかかっていません。  
`aタグ`の色もかかってません！！！  

`aタグ`だけはリセットされないようにするため、なんか初期値に戻せ！みたいな`CSS`を書きました。  
大人しくスタイリングしても良かったかもしれない。

```css
/* Tailwind CSS で aタグ の色が消えてしまったので、もとに戻す */
a {
    color: revert;
    text-decoration: revert;
}
```
## VSCode に Tailwind CSS 拡張機能を入れよう
これです  
https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss

快適すぎて草、クラス名の補充や、自前で定義したプライマリカラーとかの色まで見れるの強すぎやろ

![Imgur](https://i.imgur.com/ZOB8AxT.png)

最終的な`CSS`も見れる。すごい

## peer-checked が便利
マテリアルコンポーネントにもある`Switch()`を作ろうと思います。  
スイッチを押したらつまみ（`Thumb`）を右側へ移動するための`JavaScript`を書こうと思ってたんですけど、これ`JS`なしで再現できるんですね！！

以下が該当のコードですが、チェック状態を保持しておくための`<input>`をユーザーに見えない形で置いておきます。  
`<label>`で囲っているので、囲っている`<div>`や`<span>`を押したときにも、`<input>`にチェックが入ります（上記の通り見えませんが）  

で、ここからです。  
`<input>`の後の要素のクラス名に`peer-checked:`を先頭につけると、その`<input>`にチェックが付いたかどうかでスタイルを切り替えることが出来ます。  
この方法を使い、チェックがついてないときは左へ`justify-start`、`<input>`にチェックが入ったら右へ`peer-checked:justify-end`することが出来ます。`CSS`だけで完結！！！

```tsx
export default function DarkmodeSwitch() {
    const [isDarkmode, setDarkmode] = useState(false)

    return (
        <label className="flex flex-row items-center select-none cursor-pointer p-2">
            {/* peer をつけておくと、チェック true / false 時にそれぞれ指定する CSS をセットできる（ JS で動的に className を変化させる必要がない ） */}
            <input
                className="sr-only peer"
                type="checkbox"
                checked={isDarkmode}
                onChange={(ev) => setDarkmode(ev.target.checked)} />
            <span className="text-content-text-light dark:text-content-text-dark flex grow">
                ダークモード
            </span>
            {/* チェックが付いたら左に寄せる、丸を大きくする（peer-checked:justify-end） */}
            <div className="h-8 w-14 flex flex-row items-center rounded-full border-content-primary-light dark:border-content-primary-dark border-2 p-1.5 peer-checked:p-0.5 justify-start peer-checked:justify-end">
                <div className="h-full aspect-square bg-content-primary-light dark:bg-content-primary-dark rounded-full" />
            </div>
        </label>
    )
}
```

いや、公式の説明のがわかりやすかったわ、`JS`なしで表示・非表示を切り替えてる  
https://tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-sibling-state

# つまずく点

## 動的な値はできない
つまり、こういう文字列に変数を埋め込むとかは出来ないです。

```tsx
const isEnable = true
const width = isEnable ? 100 : 50
const className = `w-${width}`

return (<div className={className}/>)
```

もし、状態によって切り替えたい場合は、完全なクラス名としてソースコードに記述する必要があります。

```tsx
const isEnable = true
const className = isEnable ? "w-100" : "w-50"

return (<div className={className}/>)
```

というのも、`Tailwind CSS`は文字列を探して`CSS`を生成する、結構シンプルな仕組みで動いているらしい？ので、文字列として存在しないといけないんですよね。
https://tailwindcss.com/docs/content-configuration#class-detection-in-depth

動的な値は取れないので、あらかじめいくつかパターンを用意しておく必要があるわけですね。

```tsx
let roundedClassName: string
switch (rounded ?? 'small') {
    case 'small':
        roundedClassName = 'rounded-md'
        break
    case 'medium':
        roundedClassName = 'rounded-xl'
        break
    case 'large':
        roundedClassName = 'rounded-3xl'
        break
}
```
（`Kotlin`の`when`というか式ほしい...このためだけに`let`にするのなんか負けた感あってくやしい）

## Material-UIみたいに Ripple Effect みたいなのはなくなっちゃった
押してる！！！感はなくなっちゃった

## アイコン
マテリアルアイコンは自分で`svg`を持ってくる必要があります、もしくは`npm`からよしなにライブラリを入れるかです。

# そのほか

## Mastodon / Misskey シェアボタン を置いた

`Twitter`の代わりに`Mastodon / Misskey`でシェアできるボタンを置きました。  
`TweetDeck`なくなってから`Twitter`あんまり見なくなっちゃった、、、  

![Imgur](https://i.imgur.com/UAZIBg8.png)

![Imgur](https://i.imgur.com/XSabwQI.png)

![Imgur](https://i.imgur.com/uKDj4hr.png)

`Misskey`も`Mastodon`も以下のような`URL`でそれぞれのインスタンスの共有画面を出せるので、それを使っています。  

`https://{serverName}/share?text={シェアしたい文字}`

`TypeScript / JavaScript`でやる場合はこんな感じです多分

```ts
// インスタンス名
const serverName = 'diary.negitoro.dev'
// シェアしたい文字
const shareText = encodeURIComponent('シェアしたい文字')
// 新しいタブで開く
const shareUrl = `https://${serverName}/share?text=${shareText}`
window.open(shareUrl, '__blank')
```

`Nuxt.js`のときは置いてたんですが、、、、`Next.js`に移行した際に`Twitter`に置き換えちゃったんですよね。  
`Twitter`改悪により`Mastodon / Misskey シェア`再実装です

![Imgur](https://i.imgur.com/YXwrVJt.png)

![Imgur](https://i.imgur.com/cAh2Ntz.png)

（奇跡的に`Nuxt.js`のときのビルド成果物が残ってたので起動してみた）

# 本番に投入する

きたきた

![Imgur](https://i.imgur.com/A5v58C4.png)

今回も差分大きいというか影響大きいので`Pull Request`作ってみました。  

https://github.com/takusan23/ziyuutyou-next/pull/2

差分ですが、`npm install`した時とかに自動で更新される`package-lock.json`とかも差分に入ってしまったので、私が書き足したのはそこまでではないと思う・・・

![Imgur](https://i.imgur.com/Gx7fnFn.png)

まーじします！うおおおお！

![Imgur](https://i.imgur.com/dvWOWHn.png)

`GitHub Actions`が終わるのを見守ります

![Imgur](https://i.imgur.com/G8nI44X.png)


## Material-UI → Tailwind CSS
ま、まぁ、、あんまり`Material-UI`のコンポーネント使ってたわけじゃないので、もっといろんなコンポーネントを使ってればもっと増えてたのかも

### Material-UI
```plaintext
Route (app)                                   Size     First Load JS
┌ ○ /                                         4.96 kB         124 kB
├ ○ /_not-found                               0 B                0 B
├ ○ /favicon.ico                              0 B                0 B
├ ○ /icon.png                                 0 B                0 B
├ ● /pages/[page]                             1.36 kB         112 kB
├   └ /pages/about
├ ● /posts/[blog]                             5 kB            124 kB
├   ├ /posts/akashic_engine_pwa_cache
├   ├ /posts/android11_devicecontrol
├   ├ /posts/android11_release_devicecontrol
├   └ [+135 more paths]
├ ● /posts/page/[page]                        4.28 kB         120 kB
├   ├ /posts/page/1
├   ├ /posts/page/2
├   ├ /posts/page/3
├   └ [+11 more paths]
├ ● /posts/tag/[tag]                          2.46 kB         119 kB
├   ├ /posts/tag/Android
├   ├ /posts/tag/Kotlin
├   ├ /posts/tag/JetpackCompose
├   └ [+96 more paths]
├ ○ /posts/tag/all_tags                       616 B           117 kB
└ ○ /sitemap.xml                              0 B                0 B
+ First Load JS shared by all                 96.2 kB
  ├ chunks/681-35cd67eb9c939efc.js            18.5 kB
  ├ chunks/698-43273f17e9c681c8.js            25.2 kB
  ├ chunks/bce60fc1-0593c640cdea54db.js       50.5 kB
  ├ chunks/main-app-67d9599d5de0ee24.js       213 B
  └ chunks/webpack-47c91c3dea7cfcb6.js        1.73 kB
```

### Tailwind CSS
```plaintext
Route (app)                                   Size     First Load JS
┌ ○ /                                         3.57 kB        87.2 kB
├ ○ /_not-found                               0 B                0 B
├ ○ /favicon.ico                              0 B                0 B
├ ○ /icon.png                                 0 B                0 B
├ ● /pages/[page]                             3.44 kB          87 kB
├   └ /pages/about
├ ● /posts/[blog]                             3.44 kB          87 kB
├   ├ /posts/akashic_engine_pwa_cache
├   ├ /posts/android11_devicecontrol
├   ├ /posts/android11_release_devicecontrol
├   └ [+135 more paths]
├ ● /posts/page/[page]                        764 B          84.4 kB
├   ├ /posts/page/1
├   ├ /posts/page/2
├   ├ /posts/page/3
├   └ [+11 more paths]
├ ● /posts/tag/[tag]                          764 B          84.4 kB
├   ├ /posts/tag/Android
├   ├ /posts/tag/Kotlin
├   ├ /posts/tag/JetpackCompose
├   └ [+96 more paths]
├ ○ /posts/tag/all_tags                       624 B          84.2 kB
├ ○ /search                                   3.26 kB        86.9 kB
└ ○ /sitemap.xml                              0 B                0 B
+ First Load JS shared by all                 77.8 kB
  ├ chunks/698-0d5add4b5e93c16b.js            25.2 kB
  ├ chunks/bce60fc1-33201d061f5d18d8.js       50.5 kB
  ├ chunks/main-app-67d9599d5de0ee24.js       213 B
  └ chunks/webpack-6989dea18b00da7b.js        1.8 kB
```

# おわりに
`Netlify`だと日本からのアクセスが遅いので、つぎはホスティングサービスを移行したい・・！  