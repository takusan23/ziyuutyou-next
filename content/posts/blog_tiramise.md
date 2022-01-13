---
title: 記事一覧にちょっとだけ本文を乗せるようにした
created_at: 2020-11-16
tags:
- 自作ブログ
- JavaScript
---

できる限りMarkdownに変更を加えずにやりたい。

# 本題
タイトル通り。他のブログにも有るよね。あれつけたい。

### 公式ブログはどうやって実現してるか調べてみた
- https://ja.nuxtjs.org/blog
    - マークダウンのメタデータに`description`を追加して、文章の最初らへんを入れてる。
        - 新規ならいいけどすでにあるMarkdownを書き換えるのはなあ

# 試したこと
## 記事を表示する要領で作ればええやん？
`<nuxt-content>`にCSSで高さを決めればいいのではって思ってやったけど、なんか崩れちゃった。

# Markdownそのままのがほしいんだが？
`body`や`createAt`変数はあるけど、Markdownがそのまま入ってるプロパティは無い。  

以下一例。

```js
{
  slug: 'blog_tiramise',
  title: '記事一覧にちょっとだけ本文を乗せるようにした',
  created_at: '2020-11-16T00:00:00.000Z',
  tags: [ '自作ブログ', 'JavaScript' ],
  toc: [
    {
      id: '公式ブログはどうやって実現してるか調べてみた',
      depth: 3,
      text: '公式ブログはどうやって実現してるか調べてみた'
    },
    { id: '記事を表示する要領で作ればええやん？', depth: 2, text: '記事を表示する要領で作ればええやん？' }
  ],
  body: {
    type: 'root',
    children: [
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object],
      [Object], [Object], [Object]
    ]
  },
  dir: '/posts',
  path: '/posts/blog_tiramise',
  extension: '.md',
  createdAt: '2020-11-15T15:55:08.945Z',
  updatedAt: '2020-11-15T16:12:29.217Z'
}
```

ちなみに`body.children`に本文が入ってる。ただし複雑すぎて扱えたようなものではない模様。

# 発展的な機能
に`content:file:beforeInsert`ってのがあるですけど、ここでMarkdownがそのまま取得できるそうですよ！？  
さらにdocumentへプロパティを追加できたりできますよ

`nuxt.config.js`
```js
hooks: {
  /**
   * 本文を書いた際に呼ばれる。今回はここで文字数を数えている
   */
  'content:file:beforeInsert': (document) => {
    if (document.extension === '.md') {
        const text = document.text // Markdownとれる！
    }
  }
}
```

## 本文をチラ見せするプロパティ(メタデータ)を追加する
ついでに文字数のメタデータを足しましょう。チラ見せは100文字まで見せるってことで。

```js
export default {
  // 省略
  hooks: {
    /**
     * 本文を書いた際に呼ばれる。今回はここで文字数を数えている
     */
    'content:file:beforeInsert': (document) => {
      if (document.extension === '.md') {
        // 文字数を登録する
        const textCount = document.text.length
        document.text_count = textCount
        // 一覧で少しだけ記事を表示したいのでそのための
        const description = document.text.substring(0, 100)
        document.description = description
      }
    }
  }
}
```

これなにしてるかって言うと、Markdownにメタデータを動的に足してる(実際には足してないけど、JavaScriptで扱うときには追加されてる)


あとはVueで表示するだけです。

```vue
<template>
  <div>
    <v-card
      class="ma-2 pa-5"
      v-for="item in blogItems"
      outlined
      :key="item.title"
    >
      <nuxt-link :to="`/posts/${item.slug}`">
        <div class="headline mb-1 titleHover">{{ item.title }}</div>
      </nuxt-link>
      <!-- 本文チラ見せ -->
      <div>{{ item.description }} ...</div>
      <v-divider></v-divider>
      <div class="post-meta pa-2">
        <v-icon>mdi-file-upload-outline</v-icon>
        <time>{{ new Date(item.created_at).toLocaleDateString() }} 投稿</time>
        <!-- タグ -->
        <TagGroup :tags="item.tags"></TagGroup>
      </div>
    </v-card>
  </div>
</template>
```

以上です。8888

# おまけ
`nuxt/content`のコンテンツ取得で`where()`メソッドで大文字小文字を無視したい場合はこうです

詳しくは：https://docs.mongodb.com/manual/reference/operator/query/regex

```js
// データ取得
async asyncData({ $content, params }) {
  const findItem = await $content("posts")
    // 正規表現で大文字小文字を無視する。$optionsってのでiを入れると
    // https://docs.mongodb.com/manual/reference/operator/query/regex
    .where({ tags: { $regex: params.id, $options: "i" } }) // タグが含まれているかどうか。
    .sortBy("created_at", "desc") // 投稿日時順に並び替える
    .fetch();
  return { findItem };
},
```

今回はタグが含まれているかですが、`title`でも動くと思います。  
`$options:'i'`で大文字小文字を無視してくれる模様。