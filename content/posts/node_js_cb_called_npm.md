---
title: npm i すると cb() never called npm
created_at: 2021-04-04
tags:
- NodeJS
---

<p style="color:red;font-size:30px">何回か npm i してたら直りました</p>

休日が終わる。社会人しんどくない？

```
timing npm Completed in 7273ms
error cb() never called!
error This is an error with npm itself. Please report this error a
error <https://npm.community>
```

# 直らなかった
- キャッシュを消す
    - `npm cache clean --force`
    - 直らない
- `node_module`を消す
    - 直らない
- `package-lock.json`を消す
    - 直らない
- Node.js再インストール
    - （確か）直らなかった
- Wi-Fiを無効にしたり有効にしたりした。再起動もしてみる
    - （確か）直らなかった

# 仕方なくレポートを開く

こんなやつ↓

```
npm-cache\_logs\2021-04-04T09_40_13_200Z-debug.log
```

で見てみると、毎回違うところでコケてるんですよね。

```
1597 http fetch GET 200 https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-4.0.0.tgz 56ms
1598 silly pacote range manifest for escape-string-regexp@^4.0.0 fetched in 60ms
1599 timing npm Completed in 16630ms
1600 error cb() never called!
1601 error This is an error with npm itself. Please report this error at:
1602 error <https://npm.community>
```

↓

```
3459 http fetch GET 200 https://registry.npmjs.org/file-uri-to-path/-/file-uri-to-path-1.0.0.tgz 44ms
3460 silly pacote version manifest for file-uri-to-path@1.0.0 fetched in 133ms
3461 timing npm Completed in 15087ms
3462 error cb() never called!
3463 error This is an error with npm itself. Please report this error at:
3464 error <https://npm.community>
```

↓

```
2712 http fetch GET 304 https://registry.npmjs.org/iferr 41ms (from cache)
2713 silly pacote range manifest for iferr@^0.1.5 fetched in 42ms
2714 timing npm Completed in 7273ms
2715 error cb() never called!
2716 error This is an error with npm itself. Please report this error at:
2717 error <https://npm.community>
```

なので、何回か`npm i`してたらなんか直ってました。なんでや