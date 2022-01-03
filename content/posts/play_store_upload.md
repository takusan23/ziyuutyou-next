---
title: PlayStoreへアプリを公開する
created_at: 2020-11-07
tags:
- Android
- PlayConsole
---
神様になった日の幼馴染かわいい。んだけど忙しいから見る時間がない。

# 本題
PlayConsoleを使い、PlayStoreへアプリを公開する方法を書きます。  

# <span style="color:red">取り返しのつかないことまとめ</span>
とそのまえに、取り返しのつかないことを書いておきます。覚えてる範囲で
- 公開するとアプリケーションIDの変更ができない
    - 他と被らないようにドメインを使う例が多いけど別に**被らなければ何でもいいと思う**
- aab生成時(apkもそう)に使うKeyStoreってやつ（署名鍵）、あれをなくすと公開できなくなる。
    - アップロード時の本人確認でこの署名鍵で署名されたかどうかで使ってるそう。
    - でもなんか Google Play App Signing ってやつを使っていれば署名鍵を再度登録してもらえるとか 
        - Google先生と要相談
- **KeyStore作成時に書いたCertificateは見ようと思えば見れる**
    - **本名**とか**住所**を入れる欄があるけど、入れるとまずい可能性がある
    - 見られたくなければ空白にできるのでそれでいい
- 一度公開すると消せない
    - いやインターネットである以上避けれんやろｗｗｗって話ではある
        - Twitterならツイ消しで一応消すことは出来ますが、Playストアに関しては少し違います。
        - **Playストアからアプリを消した際の挙動**
            - 一度もアプリを入れたことのないユーザー
                - **URLから直接開いても見つけることが出来ない**
            - 一度インストールしたことがあるユーザー
                - **URLから直接開けばインストールできる**
                - このせいで完全に消すことが出来ない。
    - なんか知らんうちにapkがよくわからんところで配信される
        - なんかめっちゃあやしい

# PlayConsoleを利用できるようにする
25ドル払ってください。確かKyashで払えた気がします。  
私が払った時は2863円でした。今調べたら2583円らしいです。大統領選のせい？か知りませんが円高になってますね。

# 署名鍵を作成する - Android Studioでの作業
メニューバーのここです。

![Imgur](https://imgur.com/SbJfYuR.png)

そしたら、aabの方を選んでください。  

![Imgur](https://imgur.com/AdgEBP6.png)

## 署名鍵があれば
KeyStore作成時に設定した値
- Key store password
- Key alias
- Key password
を入れて、

![Imgur](https://imgur.com/9Ax3dPK.png)

<span style="padding:2px;border-radius:5px;background:dodgerblue;color:white;">Next</span>を押して次へ進みます。

## 署名鍵が無い時は作成
<span style="border: solid 1px gray;padding:2px;border-radius:5px">Create new...</span>を押してください。

![Imgur](https://imgur.com/k67IYmO.png)

こんな画面が出るので、項目を埋めていきましょう。

![Imgur](https://imgur.com/d8FPCip.png)

必須項目は以下です。

| 名前                | 詳細                                                                                              |
|---------------------|---------------------------------------------------------------------------------------------------|
| Key store path      | 署名鍵の保存先です。プロジェクトに入れるとGitHubへ公開されちゃいそうな気がするので気をつけて。    |
| Password            | パスワード。6文字以上                                                                             |
| Confirm             | もう一回パスワード入力                                                                            |
|                     |                                                                                                   |
| Key                 |                                                                                                   |
| Alias               | 署名鍵の名前？                                                                                    |
| Password            | さっき作成したパスワードでも特にエラーは出なかったけど、Androidは違うパスワードを推奨してるっぽい |
| Confirm             | もう一回パスワード入力                                                                            |
| Validity            | 25年以上                                                                                          |
|                     |                                                                                                   |
| Certificate         | 注意：見ようと思えば以下の項目は見ることが出来ます。                                              |
| First and Last Name | 鍵の所有者情報。これだけ必須項目                                                                  |

忘れると二回目以降公開できなくなるので十分気をつけましょう。

![Imgur](https://imgur.com/gX7vYDI.png)

入力できたら、OKを押しましょう。なんか<span style="color:red">推奨していません</span>みたいなメッセージが出るけど、そのまま閉じればおｋです。

<span style="padding:2px;border-radius:5px;background:dodgerblue;color:white;">Next</span>を押して次へ進みます。

![Imgur](https://imgur.com/9Ax3dPK.png)

最後、releaseを選択して、<span style="padding:2px;border-radius:5px;background:dodgerblue;color:white;">Finish</span>を押して.aabを生成します。

![Imgur](https://imgur.com/UPqzNgi.png)

これでaabファイルを用意できました。次はブラウザでの作業です。

# PlayConsoleへ登録
UIが変わりましたね（）

## アプリを作成
を押します。

![Imgur](https://imgur.com/4MVCOH6.png)

そしたら項目を埋めていきましょう。

![Imgur](https://imgur.com/CodMVOr.png)

## 米国輸出法 #とは
よく知らないけど、  
**Google Play Storeはアメリカにあってアプリを入れること それは アメリカから日本へアプリを輸出している 事と同じ！**  
と解釈されるらしく、違反していないことにチェックを入れる必要があります。  

英語：https://www.bis.doc.gov/index.php/policy-guidance/encryption


<details>
<summary>（多分）読む必要がないので折りたたんでおく</summary>

<h3>こっから合ってるかわからん</h3>
法律わからん上に英語なので詰んでる。専門家とかじゃなく、ただの学生だからそれでもよければ。

で、米国輸出法ってのはどうやら暗号化技術についての話らしく、  
インターネットを扱う場合はHTTPSがもれなく暗号化技術に当たる。

<h3>EARのサイトを見てみる</h3>
有志?の日本語版をお借りして見ていきましょう。

https://www009.web.fc2.com/cipher5/Encryption_0.htm

**EARの対象とならない暗号品目**を開いてみる

https://www009.web.fc2.com/cipher5/notEAR.htm

<p style="border: solid 1px red;">
・　例えば、スマートフォン又はコンピュータ用に作成されたアプリであって、マスマーケット基準（カテゴリー5 パート2の注3で規定される基準）を満たすもののうち、無料で入手可能とされるものは、"一般に入手できる"とみなされます。 この場合、あなたは、自己番号分類報告要件を伴う5D992.cとしての自己番号分類（又はBISへの番号分類請求の提出）により、740.17 (b)(1)又は(b)(3)に基づくマスマーケット要求事項を最初に一度だけ順守しなければなりません。 その後、当該品目が一般に入手可能とされた場合（例えば、無料のダウンロード）、それ以降はEARの対象でないとみなされます。
</p>

例あるやんけ！  
第5編注3に記載を見てみる
https://www009.web.fc2.com/EAR_J/J774-5-2.pdf#Note3

<p style="border: solid 1px red">
・鍵長が 64 ビット超の対称アルゴリズム<br>
・鍵長が 768 ビット超の非対称アルゴリズム<br>
・鍵長が 128 ビット超の楕円暗号アルゴリズム<br>
これらに該当する場合は、<span style="color:red">番号分類請求又は自己番号分類報告</span>を提出しないといけない
</p>

何のことだかさっぱりですが、HTTPSは該当する模様。よって年次自己分類報告書を提出する必要がある模様。初耳（）

参考ページ
- https://docs.microsoft.com/ja-jp/windows/uwp/security/export-restrictions-on-cryptography
- https://support.google.com/googleplay/android-developer/answer/113770?hl=ja
- https://www.bis.doc.gov/index.php/policy-guidance/encryption/1-encryption-items-not-subject-to-the-ear
- http://tmurakam.hatenablog.com/?page=1318328575

</details>
<br>

**iOSのAppStoreではHTTPS使ってんなら「年次自己分類報告書」書けよな**って言われてるらしいので、  
AndroidでもHTTPSを利用したなら書かないといけないっぽいです。やべーそんなこと一回もやったこと無いぞ

提出方法の有志？日本語版はこちらに：https://www009.web.fc2.com/cipher5/Howto_file_selfClassify.htm

詳しくは各自調べてください。

とりあえずチェックをいれてアプリを作成しましょう(今回のアプリではインターネット使ってない)

![Imgur](https://imgur.com/9XNAAk7.png)

# 初期設定

~~前のUIだと入力が終わるとナビゲーションドロワーにチェックマークがついたんだけど新UIには引き継がれなかったか~~昔の話は置いておいて手順を踏んでいきましょう。

![Imgur](https://imgur.com/McE3Wxk.png)

## ストアの設定
で、PlayStoreで公開されるメアドを入力する必要があるので、公開されてもいいメアドを用意しておきましょう。

## メインのストアの掲載情報
Playストアに表示する情報ですね。ここに売り文句を書いていきましょう。  

アイコンの画像ですが、`Android Studio`でアイコンを設定した際に、`src/main/ic_launcher-playstore.png`に生成されてると思うのでそれを使えばいいと思います。  
もしアイコンを描く際、角を丸くする加工はPlayストアでやってくれるので四角い画像で作成しましょう。  

### フィーチャー グラフィック
はどこで使ってるのかよくわかりません。少し前のPlayストアならTwitterのヘッダーみたいに表示されてた気がしますが、いつの間にかなくなってたので私は適当に作って入れてます。

![Imgur](https://imgur.com/et7Q7WJ.png)

### スクリーンショット
私はAndroid StudioのAndroidエミュレータを使ってます。  
端末には**Pixel 2**を使ってます。Pixel 3 XL だとなんかサイズが合わなくてアップロード弾かれた。

そういえばGoogleフォトの無料無制限アップロードがなくなるそうですね。SDカードの時代復活？

あと7インチタブレット、10インチタブレット用のスクリーンショットを要求されてるように見えますが、最低限スマホ用のスクショがあれば通ります。

# アプリ公開
早速製品版として公開しましょう！。ナビゲーションドロワーの中から製品版を探して選んでください。

![Imgur](https://imgur.com/7NQDgPs.png)

<span style="padding:2px;border-radius:5px;background:dodgerblue;color:white;">新しいリリースを作成</span>をえらんでaabをアップロードする画面へ進みます。  

## Google Play アプリ署名

<span style="padding:2px;border-radius:5px;background:dodgerblue;color:white;">次へ</span>を選んでこの機能を有効にしましょう。  
- aab形式でアプリを提出する際はこれを有効にしておく必要がある模様。
- **一番最初に作ったKeyStoreとは別物で、こっち(Google Play アプリ署名)に関してはこれ以降触ることはないです**
    - 開発者がaabをアップロードする際の本人確認として使うのが、`一番最初に作ったKeyStore`。
    - ユーザーがアプリの更新の際に開発元が同じかどうかの証明に使うのが、`Google Play アプリ署名`。
        - Googleが管理するので私達は気にする必要なし
    - aab提出時に使う署名とアプリをダウンロードする際の署名がそれぞれ違うので、万が一`KeyStore`を紛失してもGoogle先生と相談すればリセットしてもらえるし、既存ユーザーはそのままアップデートを受け取れる。
    - (多分こんな感じだと思う)

![Imgur](https://imgur.com/jTJaRTX.png)

そしたら、**App Bundle と APK**の欄に`app-release.aab`をドラッグアンドドロップさせます。

![Imgur](https://imgur.com/MBEp94q.png)


### もしバージョンアップ(二回目以降の提出)させる場合は
`app`フォルダ内にある`build.gradle`を開き、

```gradle
defaultConfig {
    applicationId "io.github.takusan23.countdownwidgetlist"
    minSdkVersion 21
    targetSdkVersion 30
    versionCode 1
    versionName "1.0"
    testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
}
```

この中の
- `versionCode`
    - 提出の度に1足す（インクリメント）しないとだめです。
- `versionName`(一応)
    - `1.0.1` みたいな感じのバージョンはここで指定します。

この2つを書き換えておきましょう


### リリースノート
更新内容ですね。最初のバージョンなのでとりあえず初回版とか書いておけばいいと思います。

![Imgur](https://imgur.com/cV2PKiJ.png)

できたら 保存 → リリースのレビュー を押します。

![Imgur](https://imgur.com/xmZcl8M.png)

なんか設定忘れてたっぽいので設定しましょう。

# 国/地域
製品版の中にあります。

![Imgur](https://imgur.com/Au6CsEq.png)

`国 / 地域を追加`を押して、一覧の中の一番上に有る`国 / 地域`にチェックを入れることですべての国で使えるようになります。多分大丈夫だと思います。(実は他の国でアプリが公開できなくなった事がある)

これでアプリの公開ができるようになったはずです。


<span style="padding:2px;border-radius:5px;background:dodgerblue;color:white;">製品版として公開を開始</span>を押して出てきたダイアログの<span style="padding:2px;border-radius:5px;background:dodgerblue;color:white;">公開</span>を押すことで審査が始まります。  
スマホに`PlayConsole`アプリを入れておくことで公開された際にプッシュ通知が行きますよーいくいく。

![Imgur](https://imgur.com/6lr58tu.png)

あとは公開されるのを待つだけです。たのしみ～  

# 追記
2020年11月14日の19時33分に公開されたとPlayConsoleアプリが通知を飛ばしてきました。