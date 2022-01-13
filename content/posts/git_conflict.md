---
title: Gitでコンフリクトしたから直す（Android Studio）
created_at: 2021-03-16
tags:
- Git
---

スーツ高いね

# 本題
- しれっと仕様変更が入る  
- アプリが動かなくなる
- いったんリリース用のブランチに切り替える
    - 開発中はまだリリースできないのでリリース時までいったんタイムスリップ
- 修正する
- リリースする
- 開発用ブランチにリリース用ブランチの内容を反映させる
    - (masterブランチに切り替えて) git merge release
- 競合（コンフリクト）を起こす
- <p style="color:red">↑今ここ</p>

# Android Studio で直す
`git merge release`（releaseはブランチ名）を実行してコンフリクトを起こすとこうなります

```
Auto-merging app/src/main/res/values/strings.xml
CONFLICT (content): Merge conflict in app/src/main/res/values/strings.xml
Auto-merging app/src/main/res/values-ja/strings.xml
CONFLICT (content): Merge conflict in app/src/main/res/values-ja/strings.xml
```

*反映しようと思ったら同じところが編集されていて動けなくなってるGitのメッセージ*

このままでは実行できないので直しに行きます。

ちなみにAndroid Studioでは赤く表示されます

![Imgur](https://imgur.com/5rx8pRF.png)

該当のファイルを開いて（もしかしたら何でもいいかもしれない）、右クリック→Git→`Resolve Conflicts...`を選びます。

![Imgur](https://imgur.com/IRe64dn.png)

そしたらこんな感じになるので、どっちを取るか、もしくはマージするか選びます。  
今回は両方取るマージを押しますが、プログラムによっては`}`とか終了タグが足りなくなったりするかもしれないので気をつけて。

![Imgur](https://imgur.com/R7N8v0k.png)

するとこんな感じになる。真ん中がマージ結果。左が今のブランチ、右が取り込んだブランチになってます。

![Imgur](https://imgur.com/qYE2nLl.png)

まずは今のブランチの内容を結果へ取り込みます。`>>`ってところを押せば取り込めます。

![Imgur](https://imgur.com/ras2mpG.png)

これで結果へ取り込めました。

![Imgur](https://imgur.com/XXUHBAc.png)

次は、取り込んだブランチ先の変更も取り込みます。  
右側のところにある`└└`みたいなところを押します。

![Imgur](https://imgur.com/Nd9wqFn.png)

これで両方を取り込む事ができました。  
`Apply`を押して閉じましょう。

![Imgur](https://imgur.com/LICxKod.png)

他のファイルも同じ手順で直して行きましょう。（直せれば）
