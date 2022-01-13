---
title: Android Studio で小文字大文字かかわらず補充の予測を表示してもらう
created_at: 2021-01-14
---

`Shift`を押す指の負担を減らそう

## 設定を開いて
Editor > General > Code Completion へ進みます。  

開いたら、一番上にある`Match case:`のチェックを外します。

<input type="checkbox" checked>Match case:</input>

↓

<input type="checkbox">Match case:</input>

これで小文字から入力を始めても、大文字から始まる単語を予測に出してくれます。
