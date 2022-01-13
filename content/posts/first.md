---
title: Nuxt.jsとprocessmdでブログ作りたい。
created_at: 2020-05-30
tags:
- NuxtJS
- Markdown
- JavaScript
---
**Nuxt.js+processmd**でブログ作るよ

# 環境
| なまえ | あたい         |
|--------|----------------|
| OS     | Windows 10 Pro |
| Node   | 12.14.1        |

# Nuxt.jsプロジェクト作成

```console
npx create-nuxt-app nuxtblog
```

あとは好きな方を選んでいきます
- programming language
    - TypeScriptにしといた（けどTS書き方分かんなくて途中からJSになってる。クソ参考にならねえじゃん）
- UI framework
    - Vuetifyがマテリアルデザイン（今回はElement使ってみる）
- あとは適当に（PWA入れといた）

```console
✨  Generating Nuxt.js project in nuxtblog
? Project name nuxtblog
? Project description My cool Nuxt.js project
? Author name takusan23
? Choose programming language TypeScript     
? Choose the package manager Npm      
? Choose UI framework Element
? Choose custom server framework None (Recommended) 
? Choose the runtime for TypeScript Default
? Choose Nuxt.js modules Progressive Web App (PWA) Support
? Choose linting tools (Press <space> to select, <a> to toggle all, <i> to invert selection)
? Choose test framework None
? Choose rendering mode Single Page App
? Choose development tools (Press <space> to select, <a> to toggle all, <i> to invert selection)
```

そしたら移動して、サーバー起動させます

```console
cd nuxt blog
npm run dev
```

![Imgur](https://i.imgur.com/fsdnyw3.png)

# Markdownファイルの保存場所を作る

nuxtblogフォルダ(componentsとかassetsとかnode_moduleがあるフォルダ)に  
**contentsフォルダ**を作り、その中に  
**postsフォルダ**を作り、その中に  
**markdownフォルダ**を作成します。

こんな感じに

![Imgur](https://i.imgur.com/9MkedEP.png)

後は**Markdownフォルダ**にMarkdownファイルを置いていきます。  

今回は適当にこんなMarkdownファイル（名前：first.md）を入れます。

```markdown
---
title: Nuxt.jsの練習
created_at: 2020-05-31
tags:
- JavaScript
---
# Hello World

```

# Markdownファイルの情報をJSONに変換するprocessmd

## processmd入れます


```console
npm install --save-dev processmd
```

## コマンド長いのでpackage.jsonに書き足します

```json
{
  "name": "nuxtblog",
  "version": "1.0.0",
  "description": "My cool Nuxt.js project",
  "author": "takusan23",
  "private": true,
  "scripts": {
    "dev": "nuxt",
    "build": "nuxt build",
    "start": "nuxt start",
    "generate": "nuxt generate",
    "md": "processmd contents/posts/**/*.md --stdout --outputDir contents/posts/json > contents/posts/summary.json"
  },
  "dependencies": {
    "nuxt": "^2.0.0",
    "element-ui": "^2.4.11",
    "@nuxtjs/pwa": "^3.0.0-0"
  },
  "devDependencies": {
    "@nuxt/typescript-build": "^0.6.0",
    "processmd": "^4.5.0"
  }
}
```

scriptsの中にmdの一行書き足せばおｋ
```json
"md": "processmd contents/posts/**/*.md --stdout --outputDir contents/posts/json > contents/posts/summary.json"
```

あとはターミナルで以下叩きます。  
この作業は記事を追加したら毎回叩く必要があります。
```console
npm run md
```

叩くとcontents/postsにjsonってフォルダが出来てると思います。あとsummary.jsonも

# Nuxt.jsで記事一覧用意する

こっからはコピペです。いくぞおおおおお  
**pages/index.vue**を開いて以下のJSをどーん
```vue
<template>
  <div class="container">
    <div>
      <el-card class="box-card" v-for="item in blogItems" :key="item">
        <nuxt-link class="text item" :to="`posts/${item.fileName}`">{{ item.title }}</nuxt-link>
      </el-card>
    </div>
  </div>
</template>

<script lang="js">
import Vue from 'vue'
import { fileMap } from "../contents/posts/summary.json";

export default {
  data: () => {
    return {
      blogItems: []
    };
  },
  created() {
    // キーを取り出す
    Object.keys(fileMap).forEach(title => {
      // 記事一個ずつ取る
      const blog = fileMap[title];
      // 名前
      const name = blog.sourceBase.replace(".md", "");
      blog.fileName = name;
      this.blogItems.push(blog);
    });
  }
};
</script>
```

ここではタイトルしか出てませんが、日付とかタグとかも出せると思います。

![Imgur](https://i.imgur.com/LJF3l5H.png)

> localhost:4545は別に気にしないでいいです。だた調子が悪かったのでポート番号を変えただけです。（nuxt --port 4545で変えられる）

# 記事一覧ページを作る

## 動的ルーティング # とは
よくわからんけど静的サイトジェネレートに必要。  
というわけで**nuxt.config.js**開いてね

参考：https://jmblog.jp/posts/2018-01-18/build-a-blog-with-nuxtjs-and-markdown-2/
参考：https://isoppp.com/note/2018-05-16/3-nuxt-firebase-blog-markdown/

開いたらJS書き足していきます。

```js
const { sourceFileArray } = require('./contents/posts/summary.json');

/** パス生成 */
const sourceFileNameToUrl = filepath => {
  const name = filepath.replace('contents/posts/markdown/', '').replace('.md', '')
  return `/posts/${name}`
}

const generateDynamicRoutes = callback => {
  const routes = sourceFileArray.map(sourceFileName => {
    return sourceFileNameToUrl(sourceFileName);
  });
  callback(null, routes);
};

export default {
// 省略
  generate: {
    routes: generateDynamicRoutes
  },
}
```

sourceFileNameToUrl()関数は`posts/${ファイル名}`の文字列を返す関数です。

こうすることでURLが`posts/{タイトル}`になるはずです。  
ですがこれだけではまだ生成できません。

生成するには、  
**pagesフォルダ**に**posts**フォルダを作成して、  
その中に **_slug.vue** ファイルを作成します。

![Imgur](https://imgur.com/DSJ9WSc.png)

## _slug.vueの中身
**_slug.vue**は記事の表示に使います。  

```vue
<template>
  <div class="container">
    <div>
      <el-card class="box-card">
        <div>{{(new Date(created_at).toLocaleDateString())}} 投稿</div>
        <div v-html="bodyHtml"></div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { sourceFileArray } from "../../contents/posts/summary.json";

export default {
  // 記事があるかどうか。JSONのsourceFileArrayの配列に含まれているか確認している。
  validate({ params }) {
    return sourceFileArray.includes(
      `contents/posts/markdown/${params.slug}.md`
    );
  },
  // 各記事のJSONファイルを読み込んでる。
  asyncData({ params }) {
    return Object.assign(
      {},
      require(`~/contents/posts/json/${params.slug}.json`),
      { params }
    );
  },
  mounted() {
    // DOM生成後
  },
  // さあ？
  head() {
    const title = `${this.title}`;
    const url = `posts/${this.params.slug}/`;
    return {
      title: title,
      meta: [
        { hid: "og:url", property: "og:url", content: url },
        { hid: "og:title", property: "og:title", content: title }
      ],
      link: [{ rel: "canonical", href: url }]
    };
  }
};
</script>
```

記事一覧から選んだ時にちゃんとMarkdownの中身が表示されていれば動いてます。

![Imgur](https://i.imgur.com/qbUf0P4.png)

# おまけ 静的サイトジェネレートしてみる

以下の一行をターミナルに入れます

```console
npm run generate
```

これで静的サイトが生成されました。後はこれをGitHubPagesに上げるなりすればいいと思います。  
今回は**Web Server for Chrome**が入ってたのでそれ使って見てみます。  

`npm run generate`の出力先は**dist**になってるのでそれを指定してWeb鯖立てます。

![Imgur](https://i.imgur.com/O6uBFod.png)

以上です。  
一応/posts/first/にアクセスした後にF5（再読み込み）をかけても404にならないことを確認できたところで終わろうと思います。

![Imgur](https://i.imgur.com/74quEU3.png)

PWAも入れてあるので試せる。

# おまけ
GitHub Pages使う場合は、nuxt.config.jsをこんな感じにすればいいと思います。

```js
export default {
// 省略
  router: {
    base: '/リポジトリ名/'
  },
  generate: {
    routes: generateDynamicRoutes,
    dir: 'docs',
  },
}
```

# おわりに
**nuxt.config.js**の`mode: 'spa'`ってSPAであってるの？
静的サイトジェネレートの時は書いてなかったんだけど？

ソースコード：https://github.com/takusan23/NuxtBlog