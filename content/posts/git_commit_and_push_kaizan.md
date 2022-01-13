---
title: Gitでコミットとプッシュし終わったあとに間違いに気付いてコミットをやり直したい場合は
created_at: 2020-09-27
tags:
- Git
---

歴史改ざんです。

# 本題

- 1.コミットをする
- 2.プッシュをする
- 3.草を生やす
- 4.消し忘れてた関数があることに気付く
    - いまここ
    - 1からやり直したい！！！

# コマンドを叩きます
今回は`Git Bash`を使います。  
~~目に優しくない~~`PowerShell`だと日本語が化けちゃった。

というわけで`.git`フォルダーがあるフォルダーで右クリックして、`Git Bash Here`を選び起動しましょう。

## (ちなみに)コミットメッセージだけを変更するだけなら
プログラムの変更なしでコミットメッセージだけを変える場合は以下を叩きます。`--amend`ってのが重要？

```
git commit --amend -m コミットメッセージ
```

リモートリポジトリへプッシュをする際は以下を叩きます。

```
git push -f origin HEAD
```

動くかどうかは怪しい

# 現状のコミット
まずコミット履歴を見ましょう。
```
git log
```
叩くと以下のように表示されるはずです。

```terminal
commit b1469aa3cf2cdddb9cfd4877a52018ff17756849 (HEAD -> master)
Author: メアドは隠させてもらったよ
Date:   Sun Sep 27 02:57:26 2020 +0900

    取り消し予定

commit 30eac0d8e356bc9e28d92f34edd8727bc45ff749
Author: メアドは隠させてもらったよ
Date:   Sun Sep 27 02:47:00 2020 +0900

    コミット練習

commit ae1c9930cfb302dc7680cd6ce94c7aaa6dbe5e84
Author: メアドは隠させてもらったよ
Date:   Sun Sep 27 02:46:30 2020 +0900

    メモ追加

```

(メアドは隠させてもらいました)。

このコミットの中から、今回は一番上の`取り消し予定`ってコミットを消そうと思います。

**それと、履歴表示を終了させてターミナルに戻る場合はキーボードの`q`を押します**

# 直前のコミットを取り消す
コミットを取り消すんですが、注意したいことが

## `git reset --hard` vs `git reset --soft`
変更点をそのままにするかどうかです。
- hard
    - 変更もすべて戻す
    - せっかく書いたプログラムが水の泡になる
- soft
    - コミットだけ取り消して、変更はそのままにする
    - **コミットをやり直す場合はこっちを選ぶ**

これを踏まえて、今回は変更点はそのままコミットのみなかったことにします。

```terminal
git reset --soft HEAD^
```

変更点はそのまま、コミットだけが取り消されてるはずです。

# コミット履歴を確認してみる
以下のコマンドを叩きます

```terminal
git log
```

すると、`メモだよ`のコミットが無いことになっていますね！歴史改ざんｋｔｋｒ

```terminal
commit 30eac0d8e356bc9e28d92f34edd8727bc45ff749 (HEAD -> master)
Author: メアド隠し
Date:   Sun Sep 27 02:47:00 2020 +0900

    コミット練習

commit ae1c9930cfb302dc7680cd6ce94c7aaa6dbe5e84
Author: メアド隠し
Date:   Sun Sep 27 02:46:30 2020 +0900

    メモ追加

```

(メアドは隠させてもらったよ)


# プッシュする
以下のコマンドを叩きます

```terminal
git push -f origin HEAD
```

`-f`をつけることで**歴史改ざんを押し通す**事ができます。

# おまけ

# git reflog が長すぎてターミナルに戻れない
キーボードの`q`を押せばターミナルへ戻れます。

# 間違えて git reset --hard してしまった
つまりこれやったってことですね。
```
git reset --hard HEAD^
```

落ち着いてください！どうにかなります

## git reflog は見ている
以下のコマンドを叩きます
```
git reflog
```

すると`git log`よりも詳細な履歴が見れるはずです

```
30eac0d (HEAD -> master) HEAD@{0}: reset: moving to HEAD^
b621189 HEAD@{1}: commit: 取り消し予定
30eac0d (HEAD -> master) HEAD@{2}: reset: moving to HEAD^
b1469aa HEAD@{3}: commit: 取り消し予定
30eac0d (HEAD -> master) HEAD@{4}: reset: moving to HEAD^
8cd8de9 HEAD@{5}: commit: 取り消すコミット
30eac0d (HEAD -> master) HEAD@{6}: reset: moving to HEAD@{1}
8780022 HEAD@{7}: commit: メモだよ
30eac0d (HEAD -> master) HEAD@{8}: commit: コミット練習
ae1c993 HEAD@{9}: commit (initial): メモ追加
```

## 目的のコミットまで戻る
戻りたいコミットを探し（今回は：`b621189 HEAD@{1}: commit: 取り消し予定`）、`HEAD@{1}`の部分を控えます。

そして以下のコマンドを叩きます。
```
git reset --hard HEAD@{1}
```

`--hard`じゃないとダメみたいです

これで無事に戻ってこれるはずです。

Git難しいね

# 参考にしました
https://qiita.com/ritukiii/items/74ee3274c3f218511a0c

https://reasonable-code.com/git-push-cancel/#git_reset