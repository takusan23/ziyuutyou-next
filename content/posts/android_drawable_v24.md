---
title: BottomNavigationViewを置いたらエラーが出た
created_at: 2020-12-12
tags:
- Android
- MaterialDesign
---

自分用メモ

## 本題
```
Error inflating class com.google.android.material.bottomnavigation.BottomNavigationView
```

Android 11 / 10 では動くが、Android 5で動かそうとしたら落ちた

`app:menu`属性を消すと実行できるようになったので、どうやらメニューが怪しい

てなわけでメニュー消したんだけど、今度は`Button`でエラーが

## 原因
`app:icon`に指定した`drawable`が`drawable-v24`フォルダに入ってた。  

使う`drawable-v24`にある`xml`をすべて`drawable`に入れたら起動するようになった。良かった。