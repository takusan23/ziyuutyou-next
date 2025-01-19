---
title: Play Console の本人確認をした
created_at: 2025-01-20
tags:
- Android
- PlayConsole
---
どうもこんばんわ。  

開発するための`Android Studio`が`Windows / macOS / Linux`向けに用意されてて良いとか、  
`Jetpack Compose`のおかげで`xml / Kotlin`を行き来することが無くなって良いとか、  
サイドローディングが簡単（メリット、、でいいよね）なのでストアに出すまでもないようなアプリだって作れて良いとか、  
いろいろ`Android`開発の良いところを言っても、`Play ストア`で本名開示されるんでしょって反撃されたら終わり。

# 本題
これです。  
個人アカウントなので法人の場合は他のほうが参考になるかと思います。

![Imgur](https://i.imgur.com/TIvXU3N.png)

# 項目を埋める

手順が書かれています。

![Imgur](https://i.imgur.com/1RytgKV.png)

個人アカウントです

![Imgur](https://i.imgur.com/PG9VZT9.png)

無料アプリしか作ってないのになんかお支払いプロファイルとやらを作らないといけない  
と思ったら`Google Play`の支払い情報が勝手に認識されていた。

![Imgur](https://i.imgur.com/y79pg1Y.png)

名前隠したけど今更か、、、

なんか住所が正しくなかったそうでちゃんと入れろって言われた。  
次に進めると住所を入力するフォームが出てくる  

![Imgur](https://i.imgur.com/cPVjVT9.png)

![Imgur](https://i.imgur.com/Vmk8yAS.png)

埋めたので保存

![Imgur](https://i.imgur.com/Uq4BA3t.png)

書いたら校正されたｗ  
全角数字じゃないとだめか。

![Imgur](https://i.imgur.com/0bOqFrB.png)

チェックを付けると次のステップに進めます

![Imgur](https://i.imgur.com/obE9Hff.png)

次は`ウェブサイト`を持っているか。  
持ってたら何なのだろうか、、？。`Search Console`や`GA4`と照らし合わせて認証でもするのでしょうか？唐突すぎて何もわからない。

![Imgur](https://i.imgur.com/x1y1NyO.png)

入れてみる。

![Imgur](https://i.imgur.com/0BRQAvI.png)

次は連絡手段。これは`Play ストア`に公開されず、`Google`が連絡手段として使うらしい。

![Imgur](https://i.imgur.com/wvhrJmu.png)

埋める必要のある項目はこちらです。

![Imgur](https://i.imgur.com/9uO3VxH.png)

電話番号は国際電話の形で登録する必要があります。  
今更言うまでもないでしょうが、日本の国番号は`+81`で、電話番号の頭につければ良いです。また、国番号をつけた場合、電話番号の最初の`0`を省略して書きます。

`070-xxxx-yyyy`の場合`+8170xxxxyyyy`にすればよいです。

メアド、電話番号共に認証しないと先に進めません。

![Imgur](https://i.imgur.com/AFgCzCz.png)

メアド、自分の`Google アカウント`を使う場合は勝手にアカウント経由で認証されます。  

![Imgur](https://i.imgur.com/JqplDOa.png)

電話番号もやります。`SMS`でいいか。  
`SMS`の場合は`Google Play Console の確認コードは～`って感じでショートメールが来ます。

![Imgur](https://i.imgur.com/nwW2wVu,png)

![Imgur](https://i.imgur.com/63gS1zI.png)

次は`Play ストア`でユーザーに公開されるメアド。  
ずっと前からアプリの個別連絡先としては公開されてたけどアカウント自体はなかったのか。（？）

![Imgur](https://i.imgur.com/UhJqwaf.png)

ちなみに`Google アカウント`以外のメアドを使った場合は認証コードを送ってくれるそう。

![Imgur](https://i.imgur.com/vEEmZqg.png)

こんなの

![Imgur](https://i.imgur.com/gL5gWy4.png)

確認画面です。`Play ストア`からアプリをダウンロードするユーザーは以下の情報を見ることが出来ますよって。  
無料アプリの配布の場合は本名が、有料アプリとかアプリ内課金があると追加で住所が出るそう（？）

![Imgur](https://i.imgur.com/wkqjpjs.png)

保存を押してみる

![Imgur](https://i.imgur.com/CwRNw7w.png)

ボールが`Google`持ち、、かと思ったらすぐに次のステップが来ました。

![Imgur](https://i.imgur.com/9bmb68j.png)

# 本人確認

![Imgur](https://i.imgur.com/4byaC1n.png)

また、メールでも来ます。

![Imgur](https://i.imgur.com/9hMoqVS.png)

本人確認に必要なものは以下で、２つ必要らしい。  
が、運転免許証は両方の要件を満たしてそうなので、２つとも運転免許証で通したいと思います。てかそれぐらいしかない。

![Imgur](https://i.imgur.com/nxT5OEA.png)

１つ目の本人確認で使えるのは以下の4つだけらしい。

![Imgur](https://i.imgur.com/oGuK6cF.png)

![Imgur](https://i.imgur.com/VS3XcPz.png)

別にスキャナーでスキャンしろとまでは言われてないのでそのままカメラで撮影した。

次に進めると、2つ目の確認が。  
住所と、どれで証明するかです。まあ運転免許証で。  
さっきアップロードした画像と同じものをアップロードした。

![Imgur](https://imgur.com/KdSiwR5.png)

後は`Google`のボールです。

![Imgur](https://i.imgur.com/TxOmNEH,png)

![Imgur](https://i.imgur.com/rHNraMI.png)

個人の場合しか分からないけど、そんなに難しくはない。

# 通った
その日のうちに通ってる気がする？

![Imgur](https://i.imgur.com/REPbqeM.png)

# ウェブサイトを持っていると何かあるのか
https://support.google.com/googleplay/android-developer/answer/13205715

どうやら`Search Console`を通して認証をするらしい。  
が、今のところ個人アカウントでは省略可の扱いなので、`ウェブサイトを持っていない`でやり過ごせばいいと思います。

![Imgur](https://i.imgur.com/sYJlWUX.png)

数年前に`Search Console`にサイトを登録したのでボタンが押せるはずです。個人アカウントだけど押してみます。  
はい。`Search Console`も`Play Console`も`Google アカウント`が一緒なので特に何事もなく終わりました。

![Imgur](https://imgur.com/piUtgSo.png)

ちなみに`Search Console`に登録するサイト、別に真面目にサーバーとかを用意したサイトである必要はなくて（このサイトだって静的サイト）  

![Imgur](https://imgur.com/r6OqAe8.png)

- `index.html`をいい感じに書いて
- 静的サイトをホスティングしてくれるサービス（`Cloudflare Pages / Netlify / GitHub Pages / Firebase Hosting`）で`HTML`を配信して
    - 無料枠に収まると思う
- `Search Console`の所有権の確認

をすれば良いはず。数年前に登録してその時の記事を発掘した。  
当時は`Google Domains`経由で確認できたんだけどサ終してしまったから多分役に立たない。  
https://takusan.negitoro.dev/posts/search_console/

# おわり
お疲れ様でした。ﾉｼ