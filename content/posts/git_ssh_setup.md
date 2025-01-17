---
title: GitHubへSSHで入れるようにする
created_at: 2021-11-02
tags:
- GitHub
- Git
---
どうもこんばんわ。  
特に書くことがなかった。

# 本題
GitHubへSSHで入るまでやります。  
いつの間にかパスワード使えなくなったみたいなので。

## 設定したら何ができるの
GitHubへ`push`とかプライベートリポジトリの`clone`とか。  
GitHubにログインしないといけない系のやつ。

## Android Studio じゃ聞かれない問題
この優秀IDE（HDD接続の種類じゃない）たちはGitHubのアクセストークンを使ってるので。

# 環境
| なまえ     | あたい         |
|------------|----------------|
| OS         | Windows 10 Pro |
| ターミナル | Git Bash       |


# 公式

https://docs.github.com/ja/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent

https://docs.github.com/ja/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account

# SSHのキーを作成する

## 保存するフォルダを作成する

`C:\Users\<ユーザー名>`に`.ssh`フォルダがあればいいのですが、ない場合は作ります。  

![Imgur](https://i.imgur.com/b6e2Gdl.png)

`.ssh`を開いて、その中で右クリックをして、`Git Bash Here`を押して開きます。  
ちなみになんかファイルがありますが気にしないでください。

![Imgur](https://i.imgur.com/sd4iPRw.png)

## SSHキーを作成

Git Bashに以下を打ち込みます。  
`ssh-keygen -t ed25519`だけでもいいらしいですが公式はGitHubで使ってるメアドを入れてたので私も入れた

```terminal
ssh-keygen -t ed25519 -C "GitHubで使ってるメアド"
```

入力してEnterを叩くと、3回聞かれます。  

- Enter a file in which to save the key
    - 保存先ここなのでそのままEnter
- Enter passphrase
    - パスワード。パスワードを入れたほうがいいらしい。空でもいいのでEnter
- Enter same passphrase again
    - 空にしたのでEnter

これでさっきのフォルダに2つのファイルが出来ているはずです。  
`.pub`の方をGitHubへ教えてあげることでSSHで入れるようになります。

![Imgur](https://i.imgur.com/6bQnNan.png)

Git Bashはまだ使うので開いておいてください。

# GitHubの設定を開く

ここです。  

![Imgur](https://i.imgur.com/Txpfhgu.png)

開いたら、横のメニューの`SSH and GPG keys`を押します。押したらSSH keysの隣りにある、`New SSH key`を選びます。

![Imgur](https://i.imgur.com/fLgHxK3.png)

こんな画面になるはずなので、項目を埋めていきます。

![Imgur](https://i.imgur.com/atWouU8.png)

- Title
    - 名前です。今使ってるパソコンの名前とか入れておけばいいでしょう（Windows とか）
- Key
    - さっきのGit Bashを使います。消しちゃった場合は`.ssh`フォルダを開いてまたGit Bashで開けばいいです。
    - 以下のコマンドを打ちます。
        - `clip < ~/.ssh/id_ed25519.pub`

これでクリップボードに公開鍵の中身がコピーされました。  
あとはこれを`GitHub`の`Key`に貼り付けて、`Add SSH key`を押して保存します。

# 疎通確認

以下のコマンドをGit Bash打ちます。  
GitHub Enterprise の場合は`git@github.com`の部分を各自変えてください。

```
ssh -T git@github.com
```

GitHubのユーザー名以外は同じ文字列が返ってくるはずです。お疲れさまでした。

```
Hi takusan23! You've successfully authenticated, but GitHub does not provide shell access.
```

秘密鍵なんですが、`.ssh`フォルダから移動せず、名前も変更してない場合は自動で探してくれます。

これで自分のプライベートリポジトリもクローンできるようになったはず？

以上です。お疲れさまでした。