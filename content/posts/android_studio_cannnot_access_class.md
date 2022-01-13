---
title: Check your module classpath for missing or conflicting dependencies を直す
created_at: 2021-03-30
tags:
- Android
- Android Studio
---
どうもこんばんわ

# 本題

```
Cannot access class 'okhttp3.ResponseBody'. Check your module classpath for missing or conflicting dependencies
```

# 直し方

左上の`File`から、`Invalidate Caches / Restart...`を押せば直った

![Imgur](https://imgur.com/jYKBHg3.png)

（関係ない話）あとどうでもいいんですけど、このサイト200を返してるし中身もあるのに `ソフト404` 判定を食らってます。はぁ～