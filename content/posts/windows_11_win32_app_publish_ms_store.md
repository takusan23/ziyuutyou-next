---
title: Windows 11で生まれ変わったMicrosoft Storeに従来(WPF/Win32)のアプリを公開してみた話
created_at: 2021-10-12
tags:
- Windows11
- MicrosoftStore
- WPF
---

どうもこんばんわ。  
D.C.4 Plus Harmony ～ダ・カーポ4～ プラスハーモニー 攻略しました。ちよ子ちゃんかわいいかったです。ぜひ本校Verの制服姿を...！

![Imgur](https://imgur.com/7qdoxiM.png)

この子の個別ルート短かった気がするんだけど多分気のせいだよね。きっと時間がすぎるのが早かっただけや ~~（サブヒロインだからとか言わない）~~

![Imgur](https://imgur.com/VovF7Lj.png)

↑髪の毛おろしてるのかわいい

ちなみにこの子、`生主`なんですね。`配信者`じゃなくて`生主`って表現してる。購入決定では？  

![Imgur](https://imgur.com/eeRt9fl.png)

あとしいしい先輩ルートも良かったです。リードされてえなあ私もなあ

![Imgur](https://imgur.com/VMQ4WAU.png)

↑このボイスほんとすき

ちなみに過去作はやってないです（直接的には繋がってないって噂だったから予約した）。やってないけど過去作のCDだけ買った。  
Windowsはまともな音楽アプリ作ってくれ。

![Imgur](https://imgur.com/bfuXRTl.png)

今作の`恋するMODE`とか名曲なのでCD欲しいなと思ったんだけど、全年齢版の続編（しかもお高い豪華版）にしかついてないっぽいね？。CIRCUSだから多分続編もR18版で出るんだろうしそのときに期待してもいいんだけどそうすっかなー

# 本題
Windows 11で生まれ変わったMicrosoft StoreにWPFアプリを公開します。

## Windows 11
Windows 11おめでとうございます。  
ウィンドウの角が丸くなったり、スタートボタンが真ん中に移動したり（変更可能）、そもそもスタートメニューがシンプルになったりしました。  
個人的にはWindows 10のタイルでグループ分けしてたのでそれが使えないのはちょっと困った？（まぁ開発で使ってるPCはストレージの空きがない（それ以外は満たしてる）ので当分はWin11にしないと思う。）  

![Imgur](https://imgur.com/VllzUu6.png)

ついにタスクバーのDeskBand APIがついに廃止？になったので、BatteryBarとか使ってる方は困るかも。  
タスクバーにPC情報を表示する`zhongyang219/TrafficMonitor`ってのがあるけどあれは対応済みの模様。C++とかMFCの知識が無いので動いてる理由はわからんかった。けどあれ多分DeskBand API使ってなさそう。

ちなみにWindows 10にあった隠しテーマ`Aero Lite`、Windows 11にもありました。やっぱ閉じるボタンは赤くないとね！  

![Imgur](https://imgur.com/NIVge7P.png)

あとなんか問題になってた`TPM 2.0`が必須もなんか公式がバイパス手段を公開してるみたいですね。  
あとでやってみようかな。

## 生まれ変わった Microsoft Store
イマイチ流行らなかったMS Storeがリニューアルしました。  
これからは`UWP（MSIX形式）`の他に`Win32（MSI / EXE 形式）`が公開できます。  

# 今回作ったアプリ

- Microsoft Storeのリンク
    - Windows 11以降じゃないと開けません
    - <a href="ms-windows-store://pdp/?productid=XP8BZ1XV93S6X1">ms-windows-store://pdp/?productid=XP8BZ1XV93S6X1</a>
- winget
    - winget、Microsoft Storeのアプリもダウンロードできるっぽい？
    - これならWindows 10でもダウンロードできる
    - `winget install いたかーそる`
- ソースコード
    - https://github.com/takusan23/ItaCursor


疑似カーソルと疑似トラックパッドを追加して、タブレットでもマウス操作っぽいのができるアプリ。`WPFと.NET 5`で出来てます。  
微妙に使いにくい。  
**Windows 11から仮想トラックパッドが追加されたのでわざわざ入れる必要はないと思います。**  
おまけとして音量コントローラーとスクリーンショットボタンを追加しました。

![Imgur](https://imgur.com/FpFLBXC.png)

↑ちなみにWindowsタブレット買った。

このアプリを作ったときに大変だった話とかそもそもの仕組みなんかをそのうち書きたいと思います。

# WPFなどの従来のアプリを公開するまで
まず開発者登録が必要です。**クレカ**で19ドル払う必要があります。一回払えばいいです。  
**クレカ**じゃないとだめってMSは言ってるんですが、なんかKyash Cardで通りました。ちょっと前に`Kyash Card`限定でサブスクの支払いに使えるようになったっぽいからそれかも？  
あと今見たんですけどなんか円安ですね。  

登録が済んだら、Win32アプリを公開できるように申請をします。  
現状、Win32アプリを公開する機能は一般に開放さているわけではなくプレビュー段階です。（2021/10/12段階）  
プレビュー段階なのですが、申請をすればWin32アプリを公開する権限を貰えます。

申請が通ったら、公開できるようになります。多分インストーラーのみが登録できます（インストール不要のタブルクリックで起動するアプリは無理？）  

# 開発者登録
https://developer.microsoft.com/ja-jp/microsoft-store/register/

19ドル払います。クレカ持ってない人はどうすればいいんだろ。私の場合は`Kyash Card`が何故か通った。

![Imgur](https://imgur.com/v6hnFJt.png)

# Win32アプリの公開プレビュープログラムに申請する
こっからです。  

https://aka.ms/storepreviewwaitlist

私は 9/27 に申し込んで、10/7 に通りました。  
なんか`CrystalDiskInfo`の開発者が2ヶ月待ったとか言ってて覚悟してたけどそうでもなかった。  
https://youtu.be/0Oks2zpolGU?t=8299

質問内容ですが、そんな難しくないです。  
インストーラーをどっかインターネット上に公開して（今回はGitHubのRelease）、翻訳片手にれっつごー

- What is your Seller ID in Partner Center? 
    - https://partner.microsoft.com/ja-jp/dashboard/account/v3/organization/legalinfo#developer
    - 法的情報 -> 販売者IDの部分を入れればいいです
- What is the app name that you want to reserve and bring to Store?
    - アプリ名
- Does this app replace an existing app in Store?
    - 既に公開してるアプリを置き換えるか。置きかえないので No
- Please provide email address of the person responsible for submitting the traditional desktop app. 
    - メアド
- Choose the package type of your app.
    - インストーラーの形式。msiで
- Provide HTTPS-based URL pointing to your downloadable Windows installer binary. 
    - インストーラーを公開するURL。今回はGitHubのReleaseに置いたインストーラーのURLを入れました。
    - 例：`https://github.com/takusan23/ItaCursor/releases/download/1.0.0/ItaCursorInstaller.msi`
- A versioned URL is required at the time of submission of your application to Store. Will you be able to provide it?
    - バージョンごとのURLを用意できるか？ってこと？。今回は行けるのでYesで
- Does the above URL support unauthenticated (anonymous) download of installer binary?
    - ダウンロードに認証（制限？）をかけてない（会員限定でダウンロード！みたいなことだと思う）かどうか？
- Is your app binary signed with a certificate?
    - 署名してないのでNo
- Do you plan to provide standalone installer?
    - おそらくインストーラー単体で完結するか聞かれてます。そりゃそうだろって思うんですが、多分インターネットから追加のファイルをダウンロードしたりすることなく完結するか聞いてます。多分ね。
- Does your app support silent installation experience?
    - サイレントインストールできるか。GUIの表示無しでしれっとインストールできるかってことだと。
    - `msi`の場合は`コマンドプロンプト`を使い、`インストーラー.msi /passive`でサイレントインストールが可能なので、  
    - `App supports silent install by providing installer parameters`を選ぶ。（ただし管理者権限（UAC）を求められる）
- Does your app have any dependency on non-Microsoft drivers or NT services?
    - Micorosftが認めてないドライバーとかを使っているか。使ってないから`No`
- Let us know the reasons for above dependency on non-Microsoft drivers or NT services if applicable.
    - さっきの質問でYes答えた場合は何を使っているのか書く
- Does your install package include any bundleware? 
    - 追加のアプリが含まれているか？どゆこと？多分No
- What is the total size of your app install package binary?
    - インストーラーのサイズを答える

# 審査が通ると？
`Microsoft Store Preview program`みたいな件名のメールが来ます。  
公開ページから`EXE または MSI アプリ`が選べるようになってます。

![Imgur](https://imgur.com/IWPnvlz.png)

# Win32アプリを公開する

必要なものは

- アイコンの画像
    - 1080x1080
- スクリーンショット
    - 多分サイズは自由

## 値段と市場
アプリの値段と配布する国を決めます。  
記入が終わったら保存して次へ行きます。勝手に保存してくれるわけではない模様。

![Imgur](https://imgur.com/KrTOLMN.png)

## プロパティ
アプリのカテゴリなど

![Imgur](https://imgur.com/KiSIjHa.png)

### テスターに提供する情報
`製品の公表`と`認定の注意書き`には、アプリの動作に必要なフレームワークと、必要な条件を書く必要があります。
ちなみにスクリーンショットには**Microsoft 以外のドライバーまたは**のところにチェックが入っていますが、ドライバーに依存してないので外しました。  
このアプリはタブレット端末と、`.NET 5以上`が必要なのでそう書きました。

![Imgur](https://imgur.com/opucXfI.png)

下にも`システム要件`の項目があるのでそこでもタッチスクリーンが必要にチェック <input type="checkbox" checked="true"/> を入れておきます。

## 年齢
Google Playと似たようなことが聞かれます。

![Imgur](https://imgur.com/keQEUIU.png)

## パッケージ
ここでアプリのインストーラーを設定します。  
インストーラーの作成は前書いので参考にしてね。→[.NET 5で出来たWPFアプリを配布するインストーラーを作成する](/posts/windows_dot_net5_wpf_making_installer/)  

![Imgur](https://imgur.com/0MzXa9d.png)

### パッケージURL
インストーラーは、`Microsoft Store`にアップロードする方式ではなく、`ダウンロードリンク`を開発者が用意する形になってます。    
`Windows 11`は`64ビット`しか無いですが、アプリが`32ビット用`の場合のためか`x86`も選べます。  
`msi`のインストーラーなら、`/passive`をつけることでサイレントインストール（インストーラーGUIが出ない）が出来ます。
なので、`インストーラー パラメータ`に`/passive`を入れます

![Imgur](https://imgur.com/OvNoC3V.png)

あとなんか日本語が2つあるんだけど、よくわからん（多分英語の`en-us`と同じ流れで`ja-jp`を作ったんだと思うけどどうなんだろう）

## ストアの公開情報

![Imgur](https://imgur.com/1fz1VOj.png)

書いていきます。  
アイコンサイズは`1080 x 1080`なので気をつけてください。

![Imgur](https://imgur.com/HNUlAgR.png)

### ライセンス条項
これは...ソースコードのライセンスと同じでいいんかな。

![Imgur](https://imgur.com/sbyUcQe.png)

## ここまで終わると
公開ボタンが押せるようになります。  
というわけで公開ポチッと

![Imgur](https://imgur.com/OygFoG5.png)

あとは待つだけ。楽しみですね

![Imgur](https://imgur.com/K8fa4R7.png)

## リジェクト（却下された）
審査が通っても、リジェクトされてもメールで通知が来ます。  

- Win32アプリのインストーラーはスタンドアロン（単体）で、オフラインインストールが必須ですよ
    - 実は`.NET 5`がインストールされていない場合はインストール前に`.NET 5`のインストールを促すダイアログを出すように設定してたんだけど、規約には「**必要なファイルをダウンロードするダウンローダーであってはいけません**」と書いてあります。 
    - 仕方ないので、アプリ説明欄に「**.NET 5を予め入れておいてください**」の文章を入れることで解決しました。果たして読んでくれるのだろうか...
    - `.NET 5`には、`.NET 5のランタイムを含めたexe`を吐き出す機能があるんだけど、インストーラーのサイズが大きすぎちゃうのでちょっと無理なんだよね。確実性を求めるならこれなんだけどさ。

修正したら審査通りました。  
なんなら`.NET 5`も`Microsoft Store`で公開してほしい。てかその方が良くないですかMicrosoftさん。

審査が通ると`Congratulations! Your submission has passed all tests`ってメールが来ます。

いつの間にか検索でも見つかるようになってました。

![Imgur](https://imgur.com/HF2g8tZ.png)

# インストールボタンを押して見る
ちなみに、現状のMicrosoft Storeでは、インストール済みかどうかまでは見ていないので、インストールが終了したあと、再度ストアでアプリの詳細画面を開くとまた**インストールボタンが押せます**。こればっかりは仕方ないのかな。  

![Imgur](https://imgur.com/ES3yXhJ.png)

# なんか Microsoft Store 以外に winget からも落とせる
`winget search <アプリ名>`で検索すると見つかります。  
公開直後は見つかりませんが、これもいつの間にか見つかるようになってました。

![Imgur](https://imgur.com/Hr15yyH.png)

wingetなら`Windows 10`でも落とせます。落とせるけど**アプリ名が日本語**なので入力めんどい

![Imgur](https://imgur.com/6o6xqNK.png)

# 終わりに
ストア、流行るといいですね。  
あとAndroidアプリ動作楽しみ。