---
title: マウスカーソルの速度変えるアプリ作った
created_at: 2020-06-08
tags:
- CS
- WPF
- .NETCore
---

Windowsむずくね？  
C#とWPFは良いとして、.Net Core（.Net Framework）ってなに？

# 本題
マウスカーソルの速度変えられるやつ(WPF製)作った。

![Imgur](https://i.imgur.com/gAxYowU.png)

- マウスの速度に変更
    - Windowsの設定で`5`
- タッチパッドの速度に変更
    - Windowsの設定で`10`

にするだけのアプリ！！！

# ダウンロード
https://github.com/takusan23/MouseCursorSpeedChanger/releases/tag/1.0

# 作るのに大変だったこと
を別の記事で書きたいと思います。

# なんで作ったの？
お友達から無線マウスもらった。（うれしい🥳）  
それでカーソルの速度が遅かったからWindowsの設定を変えたら、タッチパッドのときの操作が遅くなっちゃった。  
その都度変えれば良いんだけどめんどいので解決してみた。

## C#でマウスカーソルの速度が変更できるらしい。
参考：https://ez-net.jp/article/D8/VnBq1qVD/s7VwewtZmDws/

C#ほぼ書かないからわからん

```cs
/** マウスのカーソルの速度変更関係 */
public const uint SPI_GETMOUSESPEED = 0x70;
public const uint SPI_SETMOUSESPEED = 0x71;

[DllImport("User32.dll")]
static extern Boolean SystemParametersInfo(
    UInt32 uiAction,
    UInt32 uiParam,
    IntPtr pvParam,
    UInt32 fWinIni);
```

使い方はこうです。  
これはカーソルの速度を5にするコードですね。
```cs
int speed = 5;
SystemParametersInfo(SPI_SETMOUSESPEED, 0, new IntPtr(speed), 0);
```

以上です。  
話変わるけど午後登校長く寝れるから良いね。早起きしたら学校までのカウントダウンのせいで苦痛だろうけど。