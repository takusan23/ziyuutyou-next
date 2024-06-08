---
title: 大遅刻 Manifest V3 移行メモ
created_at: 2024-06-05
tags:
- JavaScript
---
どうもこんばんわ。  

2024年06月、`Manifest V2`廃止がついに始まったらしい？  
始まってから移行するのかよって感じですが。

というわけで、今回はこの`Manifest V3`移行をやります。  

チェックリストを用意してくれているので、これにそってやってみる。

https://developer.chrome.com/docs/extensions/develop/migrate/checklist?hl=ja

# manifest.json 編

## manifest_version を 3 にする

```json
{
    "name": "URLDecodeCopy",
    "version": "1.2",
    "manifest_version": 2,
```

の`manifest_version`を`3`にします。また、審査に出す際にはバージョンも上げないといけないので、ついでに上げておくと良いかも

```json
{
    "name": "URLDecodeCopy",
    "version": "1.3",
    "manifest_version": 3,
```

## permissions と host_permissions
拡張機能の権限（クリップボードとか）と、どのサイトで動かすか（拡張機能を動かすサイトのドメインとか）が一つの`permissions`でしたが、  
`V3`では分離されました。

```json
{
    "name": "URLDecodeCopy",
    "version": "1.3",
    "manifest_version": 3,
    "description": "URLエンコードされたURLをURLデコードしてコピーします。",
    "permissions": [
        "activeTab",
        "http://*/*",
        "https://*/*",
        "contextMenus",
        "clipboardWrite"
    ],
```

分離して、こうですね。

```json
{
    "name": "URLDecodeCopy",
    "version": "1.3",
    "manifest_version": 3,
    "description": "URLエンコードされたURLをURLデコードしてコピーします。",
    "permissions": [
        "activeTab",
        "contextMenus",
        "clipboardWrite"
    ],
    "host_permissions": [
        "http://*/*",
        "https://*/*"
    ],
```

# Service Worker 移行編
`Service Worker`なので、`document`とか`window`とかの`DOM`には触れないらしい。  
`WebExtensions API`叩くコードと`DOM`触るコードが明確に分かれた？

## manifest.json を直す
`v2`がこれで、

```json
    "background": {
        "scripts": [
            "background.js"
        ]
    }
```

`V3`だとこうです。

```json
    "background": {
        "service_worker": "background.js",
        "type": "module"
    }
```

# とりあえず入れてみる
`chrome://extensions`を開いて、読み込んでみます。  
わんちゃんコード側の修正なしとかにならないかな（）（）

リロードを押して、、やっぱエラーなりますよね

![Imgur](https://imgur.com/Ydvdwh7.png)

# ダメだった
ちゃんと`V3`で動くように直します。

```plaintext
Unchecked runtime.lastError: Extensions using event pages or Service Workers must pass an id parameter to chrome.contextMenus.create
```

## 直した
`chrome.contextMenus.create`へ渡すオブジェクトに`id`キーが無いかららしい。  
https://developer.chrome.com/docs/extensions/reference/api/contextMenus?hl=ja#type-CreateProperties

別に拡張機能の中でユニークであればいいってことかな。

```diff
+ const ID_CURRENT_PAGE = "url_decode_copy_current_page"


 chrome.contextMenus.create({
+    "id": ID_CURRENT_PAGE,
```

## クリックイベントも治す
次はこれ

```plaintext
Unchecked runtime.lastError: Extensions using event pages or Service Workers cannot pass an onclick parameter to chrome.contextMenus.create. Instead, use the chrome.contextMenus.onClicked event.
```

`"onclick"`が使えなくなったらしい。  
`chrome.contextMenus.onClicked.addListener`でメニューを押したときのコールバック関数がもらえるのでこれで。  
`switch`でメニューごとに分岐します。

```js
// メニューを押した時
chrome.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case ID_CURRENT_PAGE:
            // 今のページの URL デコード
            copy(decodeURI(tab.url))
            break

        case ID_ANCHOR_TAG:
            // リンク先のページの URL デコード
            copy(decodeURI(info.linkUrl))
            break
    }
})
```

## DOM にアクセスできない
`document`を拡張機能の`Service Worker`から使おうとすると怒られます。

```plaintext
Error in event handler: ReferenceError: document is not defined at copy
```

本来はクリップボードにコピーする`ブラウザJS`の`API`があるのでそれを使うべきなのですが、  
`Chrome`の拡張機能だとその`API`使えないんですよね。  

仕方なく`execCommand('copy')`を使っているのですが、それには`DOM`操作が必要で、、、  
ちなみに`Manifest V3`でも`DOM`操作しか無いらしい。`ServiceWorker`では触れないのでコンテンツスクリプト？？とかいう奴にお願いするといいらしい。

- https://stackoverflow.com/questions/71321983/

## コンテンツスクリプト
DOM 触りたい場合（`document`とか`window`とか）はこの`JS`を経由する必要がある。

https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts

`manifest.json`に書くものだと思ってたんですけど、実行中に動的にコンテンツスクリプトを追加できるとか書いてある。  
今回はたかだかコピーしたいだけなので`manifest.json`に書きます。

`manifest.json`を開いて`content_script`の項目を足します。  

```json
    "background": {
        "service_worker": "background.js",
        "type": "module"
    },
    "content_scripts": [
        {
            "matches": [
                "<all_urls>"
            ],
            "js": [
                "content-script.js"
            ]
        }
    ]
}
```

次に`content-script.js`を`manifest.json`と同じフォルダへ追加します。  

![Imgur](https://imgur.com/zyP5gZY.png)

バックグラウンドスクリプトの`ServiceWorker`と、DOM を操作する`コンテンツスクリプト`のやり取りはこれです。  
https://developer.chrome.com/docs/extensions/develop/concepts/messaging

`ServiceWorker`→`content-script`の場合、送る側の`ServiceWorker`はこう

```js
function sendCopyEvent(copy) {
    (async () => {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
        await chrome.tabs.sendMessage(tab.id, { copyValue: copy })
    })();
}
```

受け取る側の`content-script`はこう

```js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const copyValue = request.copyValue
    copy(copyValue)
})
```

~~でも動かない。`manifest.json`に書いたよ？~~  
→`Webページ`をリロードしたら`content-script.js`が読み込まれました。お騒がせしました。

```plaintext
Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.
```

`content-script.js`、ブラウザで動くのでまあなんというか、  
`console.log`すればちゃんと`F12`のコンソールに出てきます。

# 権限を削った
`contextMenus`しか使ってないわ。  
`clipboardWrite`は`navigator.clipboard`の`API`を使うときだけらしいし、  
`activeTab`も`onClicked.addListener()`のコールバック関数使う分には特に書いてないので、使ってなさそう。

```diff
     "manifest_version": 3,
     "description": "URLエンコードされたURLをURLデコードしてコピーします。",
     "permissions": [
-        "activeTab",
-        "contextMenus",
-        "clipboardWrite"
+        "contextMenus"
     ],
     "host_permissions": [
         "http://*/*",
```

# 公開する
なんか久しぶりに開いたら赤い文字でびっくり  
プライバシーについて追加で聞かれる程度だった、とりあえず審査に出してみる。→通りました！！！

![Imgur](https://imgur.com/bvOhON3.png)

# 差分
https://github.com/takusan23/URLDecodeCopy

# おわりに
`TypeScript`じゃないので、せめてもの救い`//@ts-check`を使ってます。ありがとう。