---
title: Android Studio で実行ボタンを押すと Unable to find Gradle tasks to build ... エラーが出るのを治す
created_at: 2024-12-04
tags:
- Android
- AndroidStudio
- Gradle
---
どうもこんばんわ。  
めちゃどうでもいいですが気になってた`SHARGE Retro 35`がセールでやすくなってたので買いました。かわいい！！！です。`Type-C`させる充電器が欲しかったんですよね。

![Imgur](https://i.imgur.com/SuJRM48.png)

充電器から外すと白く光るモードになる。そのうち消える。

# 本題
実行ボタンを押したら以下のエラーが出て実行できない。

```plaintext
Unable to find Gradle tasks to build: [:app]. Build mode: ASSEMBLE.
```

![Imgur](https://i.imgur.com/GuNH8TU.png)

これを直します。

# 環境

| key            | value                                   |
|----------------|-----------------------------------------|
| Windows        | Windows 10 Pro                          |
| Android Studio | Android Studio Ladybug 2024.2.1 Patch 3 |

# 設定を開く
![Imgur](https://i.imgur.com/k4JnV7A.png)

# Gradle の設定を開く
`Build, Execution, Deployment` → `Build Tools` → `Gradle` から、`JVM`のバージョンを`21`（`Gradle`が必要とするバージョン）のものにします。  
![Imgur](https://i.imgur.com/2DIrzdD.png)

多分`Android Studio`に最初から入っている`JVM`を選べばいいはずなので、`jdr-21 Jetbrains Runtime`みたいなのを選べばいいはず。  
![Imgur](https://i.imgur.com/xkxTCVO.png)

# もう一回ビルドしてみる
`Gradle Sync`するよう言われるので`sync`押します。  
![Imgur](https://i.imgur.com/RjHdiZ0.png)

終わったら実行ボタンを押します。これでビルドできるはず。めでたしめでたし。  
![Imgur](https://i.imgur.com/whZrfbS.png)

# なおらない
`.idea`フォルダを消してみてください。昨日ビルドできて今日出来なくなったときは大体これを消すと直る。  
消すのが怖い場合は適当に名前変更してください。

![Imgur](https://i.imgur.com/uPoYJN9.png)