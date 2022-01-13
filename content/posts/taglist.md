---
title: タグのページ作った
created_at: 2020-06-03
tags:
- その他
- NuxtJS
- 自作ブログ
- JavaScript
---

タグのページ作りました。  
**まだタグ一覧は作ってませんが**、タグが含まれている記事の一覧表示ならできるようになりました

試しにChipを押してみてね。  

**あとページネーション(二ページ目みたいなやつ)付けてないから多分大変なことになる**

## 技術的な話

`posts/tag/自作ブログ/index.html` みたいなファイルが生成されるようになりました。  

```js
/** タグが含まれている記事一覧のパス配列生成関数。 */
const generateTagPageRoutesList = () => {
  // 記事オブジェクト一覧配列を生成する。キーだけの配列にしてmapで取り出す
  const blogItems = Object.keys(postsJSON.fileMap).map(key => postsJSON.fileMap[key])
  // タグだけの配列を作る
  const allTagItems = blogItems.map(blog => blog.tags).flat()
  // 被りを消す。new Set()でいいらしい
  const tagList = [...new Set(allTagItems)]
  // パス生成。こんな感じの→ /posts/tag/自作ブログ みたいな感じに
  const pathList = tagList.map(tagName => `/posts/tag/${tagName}`)
  return pathList
}
// 省略
/** 静的サイトジェネレート関数。配列(pages/とposts/)くっつける */
const generateRoutes = callback => {
  callback(null, [generateTagPageRoutesList()].flat())
}
```

JavaScriptの配列、被りを消す方法にこんな方法があったんですね。  
```js
console.log([...new Set([1,2,1])]) // [1,2]
```

ちなみにKotlinだと`array()#distinct()`があります。超便利

以上です（？）  
久々の学校はまあまあ楽しかったです。帰り陽キャが絡んできたのが減点ポイントですね。  

あと2m確保とが無理じゃね？