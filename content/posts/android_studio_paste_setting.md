---
title : Android Studio (IDEA) で行をコピーして貼り付けると上の行に貼り付けられる
created_at: 2023-09-17
tags:
- Android Studio
- IDEA
---

メモ

# なにこれ

行をコピーして（何も選択していない状態で`Ctrl + C`すると行のコピーができる）

![Imgur](https://imgur.com/qn3CNlV.png)

今の位置に貼り付けるために`Ctrl + V`するけど...

![Imgur](https://imgur.com/BgbC7HF.png)

何故かカーソル（キャレット）の位置より上の行で貼り付けされてしまう...

![Imgur](https://imgur.com/DmuNeP3.png)  

↑カッコの中で貼り付けてほしくてカーソル（キャレット）移動させたのに...

# 直し方
`File`→`Settings...`で設定画面を開き、  
`Advanced Settings`の中にある、`When pasting a line copied with no selection`のドロップダウンメニューを`Paste at the caret position`にすることで、上の行ではなく、現在の行に貼り付けをしてくれるようになります。

![Imgur](https://imgur.com/mqCPfJa.png)

なおった！！

![Imgur](https://imgur.com/QcIkkrB.png)

# おわりに
`Ctrl + C` ← `Copy` の `C` やろなぁ  
`Ctrl + F` ← `Find` の `F` やろなぁ  
`Ctrl + V` ← `V`...ってなに？  

って思い調べてみましたが、`P`は印刷用で予約済みだから説、`C`キーの隣だから説なんかがあるらしい。はえ～