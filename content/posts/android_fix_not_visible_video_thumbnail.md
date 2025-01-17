---
title: Android で動画のサムネイルが出ない
created_at: 2024-12-03
tags:
- その他
---
どうもこんばんわ。今回のは開発には関係ないけど。

`Android`で動画のサムネイルが出なくなってしまった。  
`PhotoPicker`もこんな感じで真っ白に。

![Imgur](https://i.imgur.com/wWbPz2a.png)

開発には関係ないって言ったんだけど嘘で、`MediaMetadataRetriever#getFrameAtTime`の呼び出しが返ってこなくなってしまったことを思い出した。  
![Imgur](https://i.imgur.com/SaWllaD.png)

# 直った
セーフモードで再起動して戻したら直った。ただの再起動じゃだめだった気がする。気のせいかも。  
これでいいのか（？）