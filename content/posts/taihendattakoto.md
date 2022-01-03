---
title: これ作るのに大変だったこと
created_at: 2020-06-02
tags:
- その他
- 自作ブログ
---

**[TypeScript(nuxt/content)化に伴いこの記事は古くなり、ここに書いてある内容も（ほぼ）関係なくなっています](/posts/remake_ziyuutyou)**

Hexoってすごいんだなって。  
なお完成はいつになるかわかりません。いつ出来上がるんだこれ？  
完成までに思ったことを書いていくと思う。

~~あとドメインが欲しい。買ったこと無いけどどうなんですかね？~~

[取りました](/posts/domain_katta)

## これ作るのに大変だったこと
書く。

### Vuetifyが`<code>`に色つける。

Vuetifyくんが勝手に色を付けてくれます。が、なんかいまいちなので頑張ってCSS書いて直したいんですが、  
Vuetifyくんが許してくれません。？  
しかたないので`!important`で黙らせました。    

assets/css/styles.css
```css
/* VuetifyのせいでCodeタグに勝手にCSS適用されるので強制上書き */

.v-application code {
    box-shadow: initial !important;
    border: 1px solid gray;
    border-radius: 5px !important;
    font-family: 'Koruri Regular';
    margin: 10px;
}

.v-application code, .v-application kbd {
    font-weight: initial !important;
}
```

ついでに`highlight.js`のCSS、`vs2015.css`を入れてコードにシンタックスハイライトをつけようとしたんですけど、これもうまく動かなかったので`vs2015.css`に`!important`付けて対応しました。

### CSS
CSSよくわがんね。

```css
/* ほばー */
.titleHover:hover {
    color: #5870cb;
    transition: color 0.5s;
}
```

これは記事一覧のタイトルをマウスオーバーするとジワーッと色が変わるCSSです。  

### Processmdくんが時系列順に並べてくれない

これはおま環境かもしれないけど、時系列順に並んでくれません。  
流石に時系列順にならないのはきついので、JavaScriptで時系列に並び替えるコードを書きました。sort関数あったし。

```js
// なんかしらんけど並び順が新しい順とは限らないらしい？
const sortedKeyList = Object.keys(fileMap);
sortedKeyList.sort(function(a, b) {
  const aDate = new Date(fileMap[a].created_at).getTime();
  const bDate = new Date(fileMap[b].created_at).getTime();
  if (aDate > bDate) return -1;
  if (aDate < bDate) return 1;
  return 0;
});
```

Kotlinの`sortBy{}`とは使い方が違っててちょっと迷った。

あとprocessmdくん、/posts/jsonに消した記事が残ってるんですがそれは、、

### ページネーション

追記（2020/06/27）：もしかしたらこれ書く必要ないと思う（`_id.vue`ファイルは必要だと思う）  
詳細→ [Nuxt.jsを2.13に上げた時の話](/posts/nuxt_2_13_sugoi)

次のページ、前のページを付けることを、ページネーションって言うそうですよ。  
これ付けないと記事が増えたときのスクロールがとんでもないことになる。  

記事一覧はこんな感じに静的に出してほしいので（postsに置くとタイトル被りそうなのでpageフォルダがある。）
```js
/posts/page/1
```

特に需要はなさそうですが一応必要なページ数に合わせて`posts/page`の配列を返す関数置いときますね。

```js
/** 次のページ機能をつける。そうしないと記事一覧にどばーってなってスクロール大変になる */
const generatePagenationRoutesList = () => {
  // 何ページ必要か計算する（10で割ればいいっしょ）。ただ1ページ目は最低限必要なので1足す
  const calc = Math.floor(postsJSON.sourceFileArray.length / PAGE_LIMIT) + 1
  // ページ分だけ動的ルーティングの配列出す？
  const dynamicRouterPathList = []
  // console.log(`ページ数：${calc} / 記事数：${postsJSON.sourceFileArray.length}`)
  // ページ生成。1ページ目から作るので1からスタート
  for (let i = 1; i <= calc; i++) {
    dynamicRouterPathList.push(`/posts/page/${i}`)
  }
  return dynamicRouterPathList
}

// 省略

/** 静的サイトジェネレート関数。配列(pages/とposts/)くっつける */
const generateRoutes = callback => {
  callback(null, [generatePagenationRoutesList()].flat())
}

```

これ動かすには`postsフォルダ`に`pageフォルダ`を作って中に、`_id.vue`を置いておく必要があります。

これで`posts/page/1`などが生成されるようになります（多分）

~~この記事書いてる途中でなんでこれ動いてんのかよくわからなくなったのは内緒~~←やっぱり生成できてなかったので直しました。（2020/06/03）

### `<v-card>`が遅い？→いつの間にか直った？
何故か知りませんが、VuetiryのCardコンポーネントがおそい。というかページ遷移がこいつのせいで遅くなる。  

せっかくの静的サイトで遅いのは辛いので直したい。（しかも記事一覧に戻った時にワンテンポ遅れるとか見てられない）

で、なぜか`<v-card>`を`<v-sheet>`に置き換えることで解決しました。  

なんで？

### 記事一覧を再読み込みした後記事を開くと404

なんかしらんけどF5するとURLの後ろに`/`が入ります。  
最後に`/`が入っていないのが前提で作っているので、最後に入ると **`../`(一個前に戻る)** がおかしな場所を指すようになります。

---追記---

**別に`../`使わなくても良いことに気付いたのでこの問題は解決しました。**  
**`to='/posts/first'`みたいな感じで別に戻る必要ありませんでした。**

---追記おわり---

というかこれは私の作り方（ファイル構成）が悪いですね、なんで戻ったりしないといけないんだ。

- pages
  - pages（固定ページ。今回は省略）
  - posts（ブログ）
    - page
      - _id.vue（記事一覧）
    - tag
      - _id.vue（タグ検索結果）
    - index.vue（本来ここに記事一覧が有るべき？）
    - _slug.vue（記事。ここに居るので一覧から来たら戻らないといけない。）


今回は`nuxt.config.js`を開き、URLの最後に`/`を入れる設定を付けました。おかげて修正が必要になりましたが。

```js
export.default {
  // 省略
  router: {
    base: '/Ziyuutyou/',
    trailingSlash: true // ←これ
  }
}
```

### `sw.js`がよくわからんけどバージョン管理対象外になってて**ホーム画面に追加**が消えてた

GitHubのリポジトリ開いて`/docs`開いたら見事にServiceWorkerだけ抜けてました。なんで？

### Hexoと違ってリアルタイムで記事の内容が反映されない

Hexoって書いてる途中でも、リロードすれば記事の内容が更新されてどんな感じに見れてるか確認できるんですけど、processmdくんデフォルトだとできないっぽい？  
`processmd`見る感じ、ファイルの中身を監視する`--watch`オプションが存在するのでそれ使えばよさそうです、  
それで適当に`package.json`の`scripts`の中に実行とprocessmdの監視オプション付きを同時に実行する様に書いたんですけど、  
**nuxt起動から先に進みません！そりゃnuxtもファイルを監視してるからそこで止まりますよね。**

それでどうすれば同時に（並列に）起動できるかって話ですが、`npm-run-all`ってのを使えば並列実行ができそうです。  
ただ、これ使っても更新できるのは記事の中身だけで記事一覧(summary.json)は更新できないっぽいです。(nuxt起動時にsummary.jsonが空っぽだぞって怒られる。どうやら一度消えるらしい？)  

でも記事の中身がリアルタイムで反映されるようになったので満足です。VSCode半分にしなくて済むし。  
参考程度の`package.json`のscript

```json
{
  "scripts": {
    "dev": "nuxt --port 11451",
    "build": "nuxt build",
    "start": "nuxt start",
    "generate": "nuxt generate",
    "markdown": "npm run post && npm run page",
    "page": "processmd contents/pages/**/*.md --stdout --outputDir contents/pages/json > contents/pages/summary.json --markdownOptions.linkify",
    "post": "processmd contents/posts/**/*.md --stdout --outputDir contents/posts/json > contents/posts/summary.json --markdownOptions.linkify",
    "pagewatch": "processmd contents/pages/**/*.md --outputDir contents/pages/json --markdownOptions.linkify --watch",
    "postwatch": "processmd contents/posts/**/*.md --outputDir contents/posts/json --markdownOptions.linkify --watch",
    "all": "npm-run-all markdown --parallel dev postwatch"
  },
}
```

`npm run all`を実行すると
- markdownファイルがJSON形式に変換される
- nuxt起動
- nuxt起動と同時にprocessmdの監視を始める
  - `--stdout`オプションは外してあるので、記事一覧は更新されない。

`--parallel`のあとに指定したスクリプトが並列で実行され、その前に書いてあるスクリプトは直列で実行されます。

ちなみにprocessmdくんがJSONファイルを書き換えるとnuxtのファイル変更監視に引っかかるので自動で更新されるようになります。すげえ

~~たまにundefinedになるけどしゃーない~~

### マークダウンに書いたURLがリンクにならない

processmdくんのオプションに`--markdownOptions.linkify`をくっつけて実行すればいいです。

```json
{
  "scripts": {
    "post": "processmd contents/posts/**/*.md --stdout --outputDir contents/posts/json > contents/posts/summary.json --markdownOptions.linkify"
  }
}
```

### ~~しれっと~~Netlifyにお引越ししたりした。

GitHubPagesより良いのかはしらんけどお試しで引っ越してみた。これ勝手にメアド公開したりしないよな？  
[Netlify へデプロイするには？](https://ja.nuxtjs.org/faq/netlify-deployment/)ってのが有るのでそれに沿ってやればできると思います。

じゃあなんで**大変だったこと**に書いてんだよって話ですが、っぱコケるんですね。

<iframe src="https://best-friends.chat/@takusan_23/104330325427830329/embed" class="mastodon-embed" style="max-width: 100%; border: 0; height:200px" width="400" allowfullscreen="allowfullscreen"></iframe><script src="https://best-friends.chat/embed.js" async="async"></script>

あーJSだからしゃーないのかなーなんて思ってとりあえず検索すると、`Chromeのバージョン的に対応していない`とか出てきたのでワンちゃんNode.jsくんのバージョンがおかしいのではないかと考えました。  

NetlifyにNode.jsのバージョンを指定する方法ですが、検索したらありました。 [参考元](https://qiita.com/n0bisuke/items/8bddad87610b01c90003)

`.nvmrc`というファイルを置いて、中にNode.jsのバージョンを書くだけで解決しました。

`v12.14.1`

これだけ。これで成功しました。

ちなみサイト作成時のステップ３で、ビルドコマンドに`npm run generate`、ディレクトリを`docs(GitHubPagesの名残)`すれば、コミット+プッシュ時に勝手に`npm run genreate`して公開してくれます。らく

### 実は静的サイト書き出しできてなかった
これは別に記事に書いた→ [Nuxtの静的サイトジェネレートはモードをuniversalにしよう](/posts/nuxt_universal)

読みたくない方向け→`nuxt.config.js`の`mode:`を`universal`にすればHTMLに書き出してくれます。  
`spa`だとHTMLのbody見てもscriptタグが何個か有るだけで、内容はJS実行されるまで表示されませんでした。  
`universal`ならHTMLに書き出してくれるのでJS切っても見れます。

### (本当かわからんけど)開発時(localhost)の時は別のタブで開けない？

記事を別のタブで開くと永遠に読み込んでたりするんだけどもしかして別のタブで開くことできない？

## 特に大変じゃなかったこと

### PWA

PWAってめんどいんですよ。アイコン画像を用意するのがね！！！。  
192x192だったり512x512だったりいっぱい要求してくるんですけど、  
`@nuxt/pwa`は指定がない場合、`static/icon.png`を使ってくれるので、512x512のpngを置いておくだけで終わりました。PWA RTA行けそう（は？）  

一応`nuxt.config.js`の`manifest`置いておきますね。

```js
/** 
 * PWA manifest.json
 */
manifest: {
  name: 'たくさんの自由帳',
  title: 'たくさんの自由帳',
  'og:title': 'たくさんの自由帳',
  lang: 'ja',
  theme_color: '#8c9eff',
  background_color: '#5870cb',
  display: 'standalone',
}
```

### ダークモード

Vuetifyなら  
```js
$vuetify.theme.dark = true
```  
で終わります。Vuetifyすげー

ダークモード切り替えスイッチの例置いときますね。

```js
<!-- ダークモードスイッチ -->
<v-switch
  class="text-center ma-2"
  :append-icon="`${$vuetify.theme.dark ? 'mdi-weather-night' : 'mdi-weather-sunny'}`"
  v-model="$vuetify.theme.dark"
  label="テーマ切り替え"
></v-switch>
```

三項演算子使うの初めてかもしれない（まずKotlinにはないし）  

ところで$←これなに？

### 端末がダークモードかどうか

以下のJSでダークモードかどうかを監視して、Vuetifyのモードを変更するようにできます。  
[参考：StackOverflow](https://stackoverflow.com/questions/56393880/how-do-i-detect-dark-mode-using-javascript)

```js
window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", e => {
        const isDeviceDarkModeEnabled = e.matches;
        // Vuetify切り替える
        this.$vuetify.theme.dark = isDeviceDarkModeEnabled
      });
```

**StackOverflow**先生の回答では`e.matches`に`darkかlight`が入ってるっぽいんですが、私のChromeくんでは`trueかfalse`でした。先生の回答ちょっと古かったのかな。

~~まあダークモードなんてあんま使わないんですけどね（は？）~~

## おわりに
学校始まるわ。早起きつっら  
あと画像貼る方法確立してない。imgur使うか？