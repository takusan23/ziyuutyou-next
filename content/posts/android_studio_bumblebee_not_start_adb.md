---
title: Android Studio Bumblebee にアップデートしたら ADB が起動しない（ずっと Loading Devices... ）
created_at: 2022-01-28
tags:
- AndroidStudio
---

どうもこんばんわ。  

高かったけどさくらんぼキッスが収録されてるアルバム買っちゃった

![Imgur](https://i.imgur.com/VFf1oEs.png)


# 本題
`Android Studio Bumblebee`に更新したら`ADB`が起動しない。  
**本来デバイス名が表示されているドロップダウンメニューのところ**が`Loading Devices...`のまま一向に動かない。  

ターミナルにコマンド打ち込んでもなんか受け付けない

![Imgur](https://i.imgur.com/lcOrjgc.png)

# 環境

| なまえ                     | あたい                    |
|----------------------------|---------------------------|
| Android Studio             | Android Studio Bumblebee  |
| Windows                    | 10 Pro                    |
| Android SDK Platform-Tools | 32.0.0 (記述時時点最新版) |

# 解決策

## Enable adb mDNS for wireless debugging を OFF にする

IssueTrackerの人Thx!!!  
https://issuetracker.google.com/issues/159562232

AndroidStudioの左上の`File`から`Settings...`へ進み、`Build, Execution, Deployment > Debugger`へ進み、  
`Android Debug Bridge (adb)`の項目の`Enable adb mDNS for wireless debugging`のチェックを外して、  
`Apply`を押して`OK`を押します。  

![Imgur](https://i.imgur.com/ajgSTI2.png)

最後にプロジェクトを開き直すか、AndroidStudioを再起動すると直りました！！！

**OFFでもQRコードを読み込んでワイヤレスデバッグすることができるみたい**

(電源未接続時の挙動とか、AC充電器で高速に充電しながら実機で確認したい際に便利そうだよねこれ)

![Imgur](https://i.imgur.com/kQ3WcoW.png)

## もう一度ADBコマンドを叩く

もう一回適当なADBコマンドを叩くと起動しました。私の環境だけかもしれない。

`adb devices`とか入力して叩けばいいと思います。

![Imgur](https://i.imgur.com/nIlXTWO.png)

**ちなみに別プロジェクトを開くとまたADBが起動しなくなります (？？？)**

# おわりに

Android Studio の `Device Manager`くん、これ既に開いてるとドロップダウンメニューから押しても起動しないので
Dockに留めて置けるのはいいね。  
(既に開いてるせいでドロップダウンメニューから項目選んでも無反応で困惑することがたまにある)