---
title: Jetpack Compose のプレビュー画面で動作確認する
created_at: 2021-10-27
tags:
- AndroidStudio
- JetpackCompose
---

昔あったのにいつの間にか消滅してたので復活させました。

👆指のマークのボタン、これ押すとAndroid Studioで見た目だけじゃなくてちゃんと`Modifier#clickable { }`の動作確認ができる。

![Imgur](https://imgur.com/8zMF08P.png)

ちなみに「インタラクティブ プレビュー」って言うそうですよ？

# 環境

| なまえ         | あたい                    |
|----------------|---------------------------|
| Android Studio | Android Studio Arctic Fox |

# 有効化
左上の`File`から`Settings...`を選んで、`Experimental`を押します。  
押したら`Enable interactive and animation preview tools`を有効化します。以上です。

![Imgur](https://imgur.com/a6q0PPY.png)

# 参考
https://stackoverflow.com/questions/68002376/how-to-enable-interactive-preview-button-for-jetpack-compose-ui-in-android-studi

# 終わりに
どうでもいいんだけど`Setting`と`Preference`と`Config`って何が違うん？ ~~全部設定では。~~