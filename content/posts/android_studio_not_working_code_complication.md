---
title: Android Studio の import でクラスが見つからないのを直す
created_at: 2025-04-14
tags:
- Android Studio
---
どうもこんにちは。偽基地局って何？  
`電波API`の調査で見つけた`Android-IMSI-Catcher-Detector`プロジェクト、日本でもついに使うときが！？  
（アプリが作られるくらいには、海外では偽基地局があるらしい、、、）

# 先に結論
`Invalidate Caches...`を押して、そのまま`Invalidate and Restart`を押せばいいです。

![Imgur](https://imgur.com/w4As1p8.png)

![Imgur](https://imgur.com/IolUSJO.png)

そうすれば多分インデックスの構築から始まるはず？

![Imgur](https://imgur.com/kKz2WX9.png)

# 本題
`import android.content.Context`がエラーになってる。  
以下のスクショは関係ないクラスの`import`までエラーになってますが、`Context`が解決出来ないのはおかしな話。

![Imgur](https://imgur.com/7HCA4id.png)

コード補完もおかしなことになってるはず、2個しかないなんて無いはず。

![Imgur](https://imgur.com/FIksDRH.png)

# なおった
[先に結論](#先に結論)  
の手順のとおりです。これでなおるはず。

![Imgur](https://imgur.com/3lbgoaZ.png)

![Imgur](https://imgur.com/bRgxFvM.png)

# おわりに
別件で、`Error loading build artifacts from: .....`みたいなエラーも`Invalidate Caches...`を実行すれば直るはずです。

これ↓  

![Imgur](https://imgur.com/P20L2Mp.png)