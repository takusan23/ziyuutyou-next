---
title: Next.js 16.3 にした
created_at: 2026-08-25
tags:
- TypeScript
- Next.js
---
別に大した話ではない、、

https://github.com/takusan23/ziyuutyou-next/commit/6423ce56daba416af632a888bcaf650ac5e452fc#diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519

# Next.js 16.3 にしたら Route Handlers 経由の OGP 画像が作れなかった
そもそも当時は`Next.js`公式の方法では`OGP 画像`が作れなくて、`Route Handlers`の`route.tsx`に`OGP 画像`を生成させる技が`静的モード Next.js`でよく使われていた？  
が、`Next.js 16.3`にしたら失敗するようになってしまった。

![リネームした](https://oekakityou.negitoro.dev/original/0783e299-9cb7-4f0d-a650-56f80a63b597.png)

とりあえず`Route Handlers`の名前を`opengraph-image.png`から`opengraph-image.PNG`に**名前変更した。**  
というのも、`.png`のままだと`generateStaticParams()`で一ミリも返していない謎の動的パスが渡されて、そんなもの想定してないせいで後続の処理が落ちてしまった。

```plaintext
▲ Next.js 16.3.0 (Turbopack)
- Environments: .env
✓ Running next.config.ts took 69ms
- Experiments (use with caution):
  ✓ scrollRestoration

  Creating an optimized production build ...
✓ Compiled successfully in 6.3s
✓ Finished TypeScript in 1032ms    
✓ Collecting page data using 5 workers in 2.4s    
Error occurred prerendering page "/posts/-/opengraph-image.png". Read more: https://nextjs.org/docs/messages/prerender-error
Error: ENOENT: no such file or directory, open 'C:\Users\takusan23\Desktop\Dev\NextJs\ziyuutyou-next\content\posts\-.md'
    at async l2.parse (src\MarkdownParser.ts:51:33)
    at async l4.getCache (src\NextJsCacheStore.ts:20:24)
    at async l5.parseMarkdown (src\ContentFolderManager.ts:252:30)
    at async u (app\posts\[blog]\opengraph-image.png\route.tsx:26:26)
  49 |     static async parse(filePath: string, baseUrl: string = '/posts') {
  50 |         // マークダウン読み出す
> 51 |         const rawMarkdownText = await fs.readFile(filePath, { encoding: 'utf-8' })
     |                                 ^
  52 |         const fileName = path.parse(filePath).name
  53 |         // メタデータ
  54 |         const matterResult = matter(rawMarkdownText) {
  errno: -4058,
  code: 'ENOENT',
  syscall: 'open',
  path: 'C:\\Users\\takusan23\\Desktop\\Dev\\NextJs\\ziyuutyou-next\\content\\posts\\-.md'
}
Export encountered an error on /posts/[blog]/opengraph-image.png/route: /posts/-/opengraph-image.png, exiting the build.
⨯ Next.js build worker exited with code: 1 and signal: null
```

ちょっと考えて`opengraph-image.png`は`Next.js`内部で予約されてるのかなと思い`.PNG`で大文字にしたら直った。  
そもそもこの`Route Handler`を使った`OGP 画像生成`は自分で`<meta>`を書かないといけないので、なんならルート名を`ogp.png`とかにして`<meta>`に入れてもよかった。

```plaintext
▲ Next.js 16.3.0 (Turbopack)
- Environments: .env
✓ Running next.config.ts took 78ms
- Experiments (use with caution):
  ✓ scrollRestoration

  Creating an optimized production build ...
✓ Compiled successfully in 6.7s
✓ Finished TypeScript in 1015ms    
✓ Collecting page data using 5 workers in 2.3s    
Failed to set Next.js data cache for https://takusan.negitoro.dev/posts/amairo_kotlin_coroutines_suspend/, items over 2MB can not be cached (3020018 bytes)
✓ Generating static pages using 5 workers (22/22) in 17.9s
✓ Finalizing page optimization in 693ms    

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /icon.png
├   /pages/[page]
│ ├ ● /pages/about
│ ├ ● /pages/akari_droid_privacy_policy
│ ├ ● /pages/and_aica_roid_privacy_policy
│ └ ● [+2 more paths]
├   /posts/[blog]
│ ├ ● /posts/amairo_kotlin_coroutines_flow
│ └ ● /posts/amairo_kotlin_coroutines_suspend
├   /posts/[blog]/opengraph-image.PNG
│ ├ ● /posts/amairo_kotlin_coroutines_flow/opengraph-image.PNG
│ └ ● /posts/amairo_kotlin_coroutines_suspend/opengraph-image.PNG
├   /posts/page/[page]
│ └ ● /posts/page/1
├   /posts/tag/[tag]/[page]
│ ├ ● /posts/tag/Android/1
│ ├ ● /posts/tag/Kotlin/1
│ ├ ● /posts/tag/KotlinCoroutines/1
│ └ ● /posts/tag/KotlinCoroutines解説/1
├ ○ /posts/tag/all_tags
├ ○ /search
└ ○ /sitemap.xml


○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses generateStaticParams)
```

## Route Handlers を使わない公式の OGP 画像生成にすれば？
https://github.com/vercel/next.js/issues/82177

`Next.js`が`opengraph-image.tsx`で生成した画像のパス、末尾に`.png`って付かない。  
付かないせいで一部の静的サイトホスティングサービスではうまく取得できないことがある。

かくいう私も`Amazon CloudFront`の`CloudFront Functions`を使って、パス末尾に`html`が付いていない場合は`.html`を付与してからオリジン（`Amazon S3`）に取りに行く処理があるため、  
拡張子がないファイルだと無条件で`.html`になってしまい都合が悪い！！  

・・・まあ`CloudFront Functions`に相当する処理を自分たちで書ける場合はまだマシというか、静的サイトホスティングによっては静的なので何も介入できない場合が多い。

何もできない環境もあることを考えるとやっぱり`Route Handlers`で作らせる方が健全に見える、、、

# @11ty/gray-matter も更新した
更新したら`日付`が`Date`ではなく`string`を返すようになった？ので自分で`Date`にする必要がありそうでした。

```diff
  const rawMarkdownText = await fs.readFile(filePath, { encoding: 'utf-8' })
  // メタデータ
  const matterResult = matter(rawMarkdownText)
  // yyyy-mm-dd 形式、多分パース出来るはず
- const date = matterResult.data['created_at'] as Date
+ const date = new Date(matterResult.data['created_at'])
```

# おわりに
いい加減`unstable_cache`（名前によらず安定して動いてた）から`Cache Components`に乗り換えなければと思った。

# おわりに2
https://nextjs.org/blog/next-16-3#built-in-glob-imports

ついに`ホットリロード`付きで`Markdown`を読み込む機能が搭載されたっぽい！？