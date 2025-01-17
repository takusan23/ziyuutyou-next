---
title: CloudFront が使えないので AWS サポートセンターにお願いしてきた
created_at: 2023-07-31
tags:
- AWS
---

どうもこんにちは  

`AWS`の`CloudFront`（と `CloudShell`）が使えないため、サポートセンターに問い合わせてみたメモです。

![Imgur](https://i.imgur.com/nEYlRmL.png)

```plaintext
Your account must be verified before you can add new CloudFront resources. To verify your account, please contact AWS Support (https://console.aws.amazon.com/support/home#/ ) and include this error message.
```


![Imgur](https://i.imgur.com/t6oJtaq.png)

# サポートケースをオープンする
ここから。無料だとアカウントと支払いくらいしか問い合わせできない・・・

![Imgur](https://i.imgur.com/NifY8ya.png)

内容を書きます

![Imgur](https://i.imgur.com/Sh82E1t.png)

おまじない程度にスクショも貼ってみる

![Imgur](https://i.imgur.com/B4AbKTw.png)

あとは送信して待つ

![Imgur](https://i.imgur.com/UmaJoDS.png)

# 返信が来る
アカウントの利用状況から利用上限を定めているとのこと。  
また、`CloudShell`の利用予定のリージョンも聞かれた。

# 使えるようになった
Freeプランだったので数日かかりましたが、無事利用制限が解除されました。良かった良かった

![Imgur](https://i.imgur.com/NSgTiV7.png)

`CloudFront`が使えるようになりました！！！  

![Imgur](https://i.imgur.com/APyhK5U.png)

`CloudShell`も使えるようになりました。  
`cal`コマンドでカレンダーを開いてみました。  

もし手元に`cal コマンド`叩ける環境があれば、`cal 9 1752`をターミナルに入力して見てみてください。  
多分一週間以上欠けたカレンダーが出てくるはず。

![Imgur](https://i.imgur.com/vNgsSQA.png)

詳しくは： https://ja.wikipedia.org/wiki/Cal_(UNIX)#仕様

以上です。