---
title: 2020年まとめ
created_at: 2020-12-31
tags:
- 年末
---

冬休み短くね？

# たちみどろいど
2020年12月31日 17時48分 現在、releaseブランチ（ストアにリリースしたコード、masterは開発ブランチ）の情報です。

## 行数
`Intelij IDEA`のプラグイン、[Statistic](https://plugins.jetbrains.com/plugin/4509-statistic)で計測しました。

import含め **29,991行**

importなし **20,294行**

importなしの状態でレポート用紙(一枚34行)換算すると：**596枚**ぐらい？（20294/34）

### コメント文の行数
多分これのせいで余計にカウントされてる。というわけでコメントの行数を見ていこう。

コメント **6,669行**

レポート用紙(一枚34行)で換算すると：**196枚**ぐらい？(6669/34)

### コミット回数

ターミナルで叩くと出てくると思います。

```
$ git rev-list --count HEAD --since="Jan 01 2020" --before="Dec 31 2020"
```

参考：https://stackoverflow.com/questions/36079884/count-git-commits-per-period

**552**コミットでした。(コロナで休校長かったしまあ？)  

## その他

- Qiita消して自作ブログ(Nuxt.js)に乗り換えた
    - でもなんか検索にのらないことが多い

- コロナカレンダー作りました
    - https://tokyo-covid19-calendar.netlify.app/
    - Netlify + GitHub Actions + Nuxt  製です。
    - https://github.com/takusan23/tokyo_covid19_calendar

んじゃ紅白見てくるわ