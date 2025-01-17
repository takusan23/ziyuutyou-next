---
title: データプラン弱者集合。PWAでオフラインに対応させる
created_at: 2020-06-27
tags:
- JavaScript
- PWA
---

今月はあんまりモバイルデータ使ってないですね。

# 本題
PWAのキャッシュ機能でオフラインでも見れるサイトができたので書きたいと思います。  

今回は**Akashic Engine**で作ったゲームをPWAに対応させてオフラインでも遊べるようにしたいと思います。  
別にAkashic Engineじゃなくても良いですが

ちなみにこのサイトはnuxt.jsにPWA関係を任せているので特に何もせずに動いてます。


*PWA+Cacheでモバイルデータを節約するぞ*

PWAが何をするのかは各自で調べてください（え

# 今回使うサイトは
- ソースコード
    - https://github.com/takusan23/AkashicEngine-FlappyBird
- Netlifyに公開した完成品はこちら
    - https://game-akashic-bird.negitoro.dev/
    - PWAのインストールボタンが出てくるはず。

これ。前のブログのおまけで使ってたやつ[^1]

# 用意するもの
- PWA化したいサイトのソース
    - htmlとか画像とかjsとかな
- PWA化したときのアイコン
    - 192x192の大きさと512x512の大きさが必要らしいです。
- Webサーバー建てる拡張機能。別にこれ以外でも良い
    - https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=ja
- やる気。諦めないぞというお気持ち
    - PWA厳しい
- 今回はNetlifyで公開する
    - GitHub Pagesだと話が変わってくると思う。

# HTMLを用意する
もうすでにhtmlを持ってる方は良いです。  
今回私はAkashic EngineをHTML形式に書き出さないといけないので以下を実行

```console
akashic export html --bundle --magnify --minify --output export
```

`--minify`を指定して必要なファイルを極限まで減らします。

これでHTMLを用意できました。  
![Imgur](https://i.imgur.com/f4QhGBO.png)

**あとは生成されたHTMLファイルの`<title>`を書き換えて名前を変えましょう**

# ServiceWorker
~~Hello, Worker~~  

## sw.jsを置く
index.htmlのあるところに`sw.js`を作成します。  
中身はとりあえず空のままでいいです。

## iconsフォルダを置く
`sw.js`と同じ感じで同じ場所に`icons`フォルダを作成します。  
中には、`192x192`の大きさのアイコン画像と`512x512`の大きさのアイコン画像を入れます。  
名前はそれぞれ以下のようにします。
- `icon_192.png`
- `icon_512.png`

## manifest.jsonを置く
`sw.js`と同じ感じで同じ場所に`manifest.json`を作成します。  
そして以下の内容を入れます

```json
{
    "name": "Akashic Engine Flappy Bird",
    "short_name": "Akashic Bird",
    "icons": [
        {
            "src": "/icons/icon_192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/icons/icon_512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    "start_url": "/index.html",
    "display": "standalone",
    "background_color": "#FFFFFF",
    "theme_color": "#FFFFFF"
}
```

最低限、
- `name`
    - なまえ
- `short_name`
    - アプリ一覧で表示される名前

を書き換えればいいと思います。

## ServiceWorker登録
`index.html`を開きます。  
開いたら、head内に以下のように書きます。  
よくわからない場合は`<title>`の下辺りに書いておけばいいと思います。

```html
<!-- ウェブアプリマニフェストの読み込み -->
<link rel="manifest" href="manifest.json">
<!-- さーびすわーかー -->
<script>
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("sw.js")
            .then(() => console.log("registered service worker!"));
    }
</script>
```

# ここまででできたファイル
`image`フォルダ以外はみんなあるよね？  
![Imgur](https://i.imgur.com/ffmuHM6.png)

# sw.jsを書く
sw.js白紙だとインストールのためのバナー（ホーム画面に {アプリ名} を追加）すら出ない模様。  

## キャッシュしなければいけないファイルを並べる
ここでファイル名を間違えるとキャッシュ取得諦めるのでちゃんと書きましょう。先生が生徒の名前間違えないようにするみたいな感じで

```js
// キャッシュしないといけないファイルを列挙する。間違えないように
const CACHE_LIST = [
    "/icons/icon_192.png",
    "/icons/icon_512.png",
    "/image/play.png",
    "/image/result.png",
    "/image/title.png",
    "/image/tori.png",
    "index.html",
    "manifest.json",
    "/"
]
```

## キャッシュに付ける名前
多分識別に使うと思います。同じ名前だったら取得しない、名前が変わっていたら再度取り直すみたいな感じだと思います。  

キャッシュ取得し直したい場合はここの値を変えることで再度取り直してくれます。

```js
// バージョンの名前。識別に使う
const VERSION_NAME = 'bird_20200627' // ここの値が変わるとキャッシュを再登録するっぽい？
```

## `install` イベント
コピペで行けると思います。
```js
// インストール時に
self.addEventListener('install', event => {
    console.log('インストールするぞ')
    event.waitUntil(
        caches.open(VERSION_NAME).then(cache => {
            return cache.addAll(CACHE_LIST) // キャッシュ登録
        }).catch(err => { console.log(err) }) // えらー
    )
})
```

## リクエスト横取り
インターネットに画像リクエストしよー  
↓  
ServiceWorkerが検知  
↓  
キャッシュがあればキャッシュを返す

これを書きます。

```js
// リクエストを横取りする
self.addEventListener('fetch', event => {
    // キャッシュの内容に置き換える
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
})
```

## 古いキャッシュを消す
**キャッシュに付ける名前**の項目で、キャッシュを再度取り直してくれますなど言いましたが、これ勝手には消してくれないので消してくれるコードです。

```js
// 古いキャッシュを消す。
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return cacheName !== VERSION_NAME;
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});
```

# ここまでのsw.js

```js
// キャッシュしないといけないファイルを列挙する。間違えないように
const CACHE_LIST = [
    "/icons/icon_192.png",
    "/icons/icon_512.png",
    "/image/play.png",
    "/image/result.png",
    "/image/title.png",
    "/image/tori.png",
    "index.html",
    "manifest.json",
    "/"
]

// バージョンの名前。識別に使う
const VERSION_NAME = 'bird_20200627' // ここの値が変わるとキャッシュを再登録するっぽい？

// インストール時に
self.addEventListener('install', event => {
    console.log('インストールするぞ')
    event.waitUntil(
        caches.open(VERSION_NAME).then(cache => {
            return cache.addAll(CACHE_LIST) // キャッシュ登録
        }).catch(err => { console.log(err) }) // えらー
    )
})

// リクエストを横取りする
self.addEventListener('fetch', event => {
    // キャッシュの内容に置き換える
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
})

// 古いキャッシュを消す。
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return cacheName !== VERSION_NAME;
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});
```

# Web Server for Chrome を開いて
`CHOOSE FOLDER`を押して、`index.html`のあるフォルダを指定します。  
そしたら`Web Server`のスイッチを押して起動させます。 

起動できたら、`http://127.0.0.1`から始まるURLが`Web Server URL(s)`の下に表示されるので押します。するとWebページが表示されるようになるんですね～

そしたらWebページを開いた状態で`F12`おして`Application`タブを押します。

その中から`Cache Storage`を探して、キャッシュが取得できてるか確認しましょう。

![Imgur](https://i.imgur.com/PWEuyxl.png)

このように登録されていれば完成です。おめ！

ちなみに：本当なら`index.html`をブラウザで開くだけで見れるわけですが、Service Workerを動かすためにはURLが `https`で始まるか`localhost（127.0.0.1）`で始まる必要があるようです。  
だから**Web Server for Chrome**を利用する必要があったのですね。

# 本当にオフラインで動くの？

`Service Worker`を押して、`Offline`にチャックを入れます。  
入れた後に再読み込みしても表示されている場合は動いてます。

![Imgur](https://i.imgur.com/Bjjxnvm.png)

# Netlifyで公開
もう一回タイトル見てください。データプラン弱者がなんとかとか書いてあります。そうスマホで見れないと意味がないんですよ。

というわけでNetlifyで公開します。  
アカウントは各自作成してください。この記事に辿り着くってことはそれなりの知識があるはずです。  

## Netlify Drop
なんか`index.html`なんかが入ったフォルダをブラウザに投げるだけで公開できるらしい。

というわけで`index.html sw.js manifest.json`もろもろ入ってるフォルダをNetlifyのサイトに投げましょう。この方法ならGitHubを経由すること無く公開できます。

![Imgur](https://i.imgur.com/wCFDJiW.png)

## Site Settings > Change site name からURLを変更
`https:// {自由に決められる} .netlify.app`の自由に決められるの部分なら、自由に変更可能です。

![Imgur](https://i.imgur.com/911F4E7.png)

自分の持ってるドメインを設定する場合は前に書きました→ [Google Domainsでドメイン買った](/posts/domain_katta)

以上です。  
今回できたサイトはこちら。→ https://game-akashic-bird.negitoro.dev/
# おわりに
ところで今の所通信制限かかったことは無いと思われ

![Imgur](https://i.imgur.com/q8X1FOT.png)

# 参考にしました
https://qiita.com/masanarih0ri/items/0845f312cff5c8d0ec60  
https://www.simicart.com/blog/pwa-offline/  

[^1]:Nuxt.jsでHTML貼るのってどうすりゃいいんだ？