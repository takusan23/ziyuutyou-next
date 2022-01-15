---
title: TypeScript+nuxt/contentでこのサイトを作り直している
created_at: 2020-07-23
tags:
- NuxtJS
- TypeScript
- 自作ブログ
---
ここの内容もNext.jsに移行したので関係なくなります。

[Next.jsで移行したメモはこちら](/posts/taihendattakoto_next_js_blog/)


# 本題
`TypeScript`+`nuxt/content`でこのブログを作り直す。  
そこで躓いたところなどを書いていこうと思う。

# nuxt/content とは
ブログを作るときに使える（というか使った）。  
`content`フォルダにマークダウンファイルを置いておけば使える。  

以下は`content/posts`フォルダの中身を取得するTypeScriptです。
```typescript
// 記事一覧を取り出す
async asyncData({ $content, params }) {
  const blogItems = await $content(`posts`)
    .sortBy("created_at", "desc") // 投稿日時順に並び替える
    .skip((parseInt(params.id) - 1) * 10) // 指定した分飛ばす。今回は表示ページから１引いて１０掛けた答え分飛ばす。（例:2ページ目の場合は(2-1)*10 = 10記事飛ばす）
    .limit(10) // 10記事取得する
    .fetch();
  return { blogItems };
},
```

これで`processmd`を使うことはなくなりました。

# Vuexってのも使った。
Vue.js（これはNuxt.jsだけど）全体で管理したい値を扱う場合は`Vuex`ってのを使うそうですよ。  
このサイトではどこで使っているかと言うとタイトルバーのタイトルを変更するときに使っています。  
今までは`document.getElementById`で無理やり変更してたのでマシになった。  

コンポーネントを超えて値を管理したいときに使うようです。

以下はタイトルを入れておくVuexストア例(`store/index.js`)。  
ここはTypeScriptではない
```js
// Vue全体で管理したい値。今回はタイトルバーのテキスト
export const state = () => ({
    barTitle: "たくさんの自由帳"
})

// Vuexの値はここで変更する。
export const mutations = {
    setBarTitle(state, title) {
        state.barTitle = title
    }
}
```
  
Vuexストアから値を取得する例。`this.$store.state.barTitle`ってのがそれ（なんかWARNが消えないけど）
```vue
<!-- タイトル -->
<v-toolbar-title v-show="!drawer" id="title" v-text="this.$store.state.barTitle" />
```

入れるのはこう。以下例
```typescript
// Vuexてやつでバーのタイトルを変更している。
this.$store.commit("setBarTitle", "記事一覧");
```

# 大変だったこと

## TypeScriptわからん問題
記事表示ページでタイトルを取得しようとして、以下のように打つと怒られます。  
解決方法がありそうな気がしますが、とりあえずは`this as any`で黙らせようと思います。  

```typescript
// エラーでちゃうからanyで。解決方法ある？
const title = (this as any).article.title;
```

## created_at vs createdAt 問題
マークダウンの先頭に、わざわざ`created_at`って書いて今すが、実は`nuxt/content`側でも`createdAt`ってのを用意してくれてました。  
ただおま環のせいかうまく行かなかったので引き続き`created_at`を書こうと思います。

あとはまた思い出したら書きたいと思います。

# よかったところ

## 更新が早い
更新が早いです。すぐに反映されます。

```
i Updated .\content/posts\remake_ziyuutyou.md                                                           @nuxt/content 20:29:55
i Updated .\content/posts\remake_ziyuutyou.md                                                           @nuxt/content 20:29:59
i Updated .\content/posts\remake_ziyuutyou.md                                                           @nuxt/content 20:30:14
```

# HTMLが書ける

<span style="color:red;box-shadow:5px">htmlが書ける</span>  
<span style="color:blue">以下のようにHTMLを書いてもちゃんと読み込んでくれます</span>

```html
<span style="color:red">HTMLを理解できる</span>
```

<span style="border: solid 2px green;padding:2px;border-radius:10px">囲い文字はこんな感じに</span>

```html
<span style="border: solid 2px skyblue;padding:2px;border-radius:10px">CSSも理解してくれる</span>
```


以上です。またなんかあれば書きます