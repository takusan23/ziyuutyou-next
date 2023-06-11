---
title: WindowsAppSDK の WinUI 3 に入門したら日本語が文字化けして出鼻をくじかれた話
created_at: 2022-11-27
tags:
- WinUI3
- WindowsAppSDK
- Windows
- .NET
- C#
---

どうもこんばんわ  
記事冒頭のゲーム感想で使うスクリーンショットを取るアプリを作ろうと思い、  
せっかくなら現代風なUIを使いたいと思い`WinUI 3`を触ったら、  
日本語が文字化けしてなかなか原因がわからなかった話です。

![Imgur](https://imgur.com/h7DbjBj.png)

# 解決方法
GitHubのIssueにもそれっぽいのがなく、ふと`VSCode`で`.xaml`開いた際に気付きました。  
**UTF-8 with BOM**の文字を！！！！！！！！

というわけで、`MainWindow.xaml`を`BOM付きの UTF-8`で保存すると文字化けを直せます！！！  
なんと最初から入っている`MainWindow.xaml`は`BOM無し UTF-8`で保存されていました！は？

名前をつけて保存を選びます

![Imgur](https://imgur.com/9AZxQFd.png)

保存先は変えずに、ドロップダウンメニューの、`エンコード付きで保存`を選択します。

![Imgur](https://imgur.com/YebTS2W.png)

あとは`BOM付き UTF-8`にすればいいです。  
`UTF-8 シグネチャ付き`ってやつを選べばいいです。

![Imgur](https://imgur.com/1oImZWV.png)

これで文字化けが直っているはずです。よかったよかった

![Imgur](https://imgur.com/xi02yQq.png)

以上です。