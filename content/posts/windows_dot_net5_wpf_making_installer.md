---
title: .NET 5で出来たWPFアプリを配布するインストーラーを作成する
created_at: 2021-09-27
tags:
- WPF
- .NET
- C#
---
どうもこんばんわ。  
アインシュタインより愛を込めて APOLLOCRISIS 入手した。箱が二回りぐらい大きいな？  
今やってるゲーム終わらせたらやりたいです。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">アインシュタインより愛を込めて APOLLOCRISIS 入手した <a href="https://t.co/m6r8Jop7Ae">pic.twitter.com/m6r8Jop7Ae</a></p>&mdash; たくさん (@takusan__23) <a href="https://twitter.com/takusan__23/status/1442148489471819783?ref_src=twsrc%5Etfw">September 26, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

# 本題
WPFなアプリの配布用にインストーラーを作成します。  

## なぜ？
きたるWindows11の Microsoft Store でのexe(msi)(従来のソフトウェア)配信機能に備えて...  
そういえばHomeエディションではローカルアカウント作れないってま？

## ちなみに
`.NET 5`なら`単一exe`ファイルを吐き出す機能がありますので、インストーラーが必要ない場合は単一バイナリをばらまくのがいいです。

[単一exe作成](/posts/dotnet_wpf/)

# 環境

| なまえ        | あたい                                     |
|---------------|--------------------------------------------|
| Visual Studio | 2019 Community Edition                     |
| Windows       | 10 Pro                                     |
| .NET          | 5                                          |
| 拡張機能      | Microsoft Visual Studio Installer Projects |


# Microsoft Visual Studio Installer Projects
ってのを使います。Wixってのもあるらしいけどよく知らん

# 配布予定のWPFアプリを作成する
まぁ頑張って作ってくれ

# 配布予定のWPFアプリのソリューションを開く
ここにインストーラーをプロジェクトとして追加します。

# 拡張機能を入れる
こっから入れられます。  

![Imgur](https://imgur.com/Rnu4RDm.png)

そしたら、これを入れます。

![Imgur](https://imgur.com/B2g8gdN.png)

# インストーラープロジェクトを追加する
ここから追加できます。

![Imgur](https://imgur.com/aLKGMS4.png)

開いたら、検索ボックスに`setup`とか入れて出てくる、`Setup Project`を選択します。  
名前とかは各自

![Imgur](https://imgur.com/E9BHzvU.png)

![Imgur](https://imgur.com/rhQkKNR.png)

この画面が開けてればおｋ

![Imgur](https://imgur.com/p8lJmcT.png)

## .NET 5 で出来たWPFアプリを配布対象にする

そのためにはまず、ソリューションエクスプローラーの、配布したいWPFアプリを選んで右クリックして、発行を押します。  

![Imgur](https://imgur.com/UgmCf4M.png)

開いたら、フォルダーに発行するようにします。

![Imgur](https://imgur.com/QAJaykP.png)

設定とかはそのままで完了を押せばいいです。

そうしたら、一応配布するexeを一つにまとめるため、`すべての設定を表示`から、ターゲットランタイムを`win-x64`へ、ファイルの公開オプションから、`単一ファイルの作成`にチェックを入れます。  
これでインストール先に置くファイルの数を減らせます。（まぁインストール先なんてどうでもいいが）

![Imgur](https://imgur.com/QLd15ZC.png)

# インストーラーで.NET 5なアプリを配布するには

参考：https://docs.microsoft.com/en-us/visualstudio/deployment/installer-projects-net-core?view=vs-2019

まずはさっきのインストーラープロジェクト作成直後の画面を出します。  
`File System`ってタブのやつですね。こっから出せます。

![Imgur](https://imgur.com/Ds6RPPp.png)

そしたら、ソリューションエクスプローラーのレンチマークを押してプロパティも開きます。  

![Imgur](https://imgur.com/oULsYpT.png)

そうしたら、`File System`の`Application Folder`を右クリックして、`Add` -> `プロジェクト出力`へ進みます。

![Imgur](https://imgur.com/Rbk7i3M.png)

そうしたら、プロジェクトのところが配布したいWPFプロジェクトになっているか確認して、`項目の公開`を選択して、構成をそのままにして、`OK`を押します。

![Imgur](https://imgur.com/HIlAKOJ.png)

## 項目の公開 の プロパティ を開きます
ソリューションエクスプローラーから、項目の公開 (ry を右クリックしてプロパティを開きます。

![Imgur](https://imgur.com/fvFI1ep.png)

そしたら、`公開するWPFプロジェクト`の、`Properties > PublishProperties > FolderProfile.pubxml`を右クリックして、完全パスをコピーします。

![Imgur](https://imgur.com/q4zscnz.png)

そうしたら、メモ帳とかに貼り付けて、`Properties/PublishProperties/...`の部分をコピーします。

![Imgur](https://imgur.com/B5fc2pV.png)

そうしたら、Visual Studioへ戻り、項目の公開のプロパティの、`PublishProfilePath`にさっきコピーした値を入れます。

![Imgur](https://imgur.com/Ted2UBZ.png)

以上です。ソリューションエクスプローラーからインストーラープロジェクトを右クリックして、`ビルド`を選択しましょう。

![Imgur](https://imgur.com/qOKgwn5.png)

これで生成できる..はず？

![Imgur](https://imgur.com/de47Xx4.png)

## 生成できない

https://stackoverflow.com/questions/339106/unrecoverable-build-error-on-any-msi-setup-project

管理者権限でコマンドプロンプトを開いて、以下のコマンドを叩いてPC再起動で治るとか？

```cmd
regsvr32 "C:\Program Files (x86)\Common Files\Microsoft Shared\MSI Tools\mergemod.dll"
regsvr32 ole32.dll
```

## targeting 'x64' is not compatible with the project's target platform 'x86'

`win-x64`を選んだ影響ですね。インストーラープロジェクトのプロパティから、`TargetPlatform`を`x64`にすればこの警告を消せます。

# インストーラーの名前とかインストール先のフォルダ名とか

インストーラープロジェクトから変更可能です。`Another`、`ProductName`、`Title`、`Manufactor`あたりを変更すればいいと思います。

![Imgur](https://imgur.com/uvnRSwV.png)

しっかりアンインストールも出来ます。

![Imgur](https://imgur.com/5p67hQ4.png)

## スタートメニューに追加
インストーラーの利点といえばこれか？

`File System`から、`User's Programs Menu`を選択して、`新しいショートカットを作成`を押します。

![Imgur](https://imgur.com/yGi6hgN.png)

そしたら、`Application Folder`を選択して、`項目の公開 (以下略`を押して`OK`を押します。

![Imgur](https://imgur.com/0I1uXxU.png)

そしたら、プロパティを選んで、`(Name)`をアプリ名に変更します。

![Imgur](https://imgur.com/Usk7A9x.png)

できたら再度ビルドします。

これでスタートに登録も出来ましたね。

![Imgur](https://imgur.com/tgdofmk.png)

以上です。

# 追記：2021/10/07 アイコンを設定する場合

`128 x 128`じゃないとだめです。ソース：https://stackoverflow.com/questions/2041291/how-to-change-windows-applicatoins-default-icon-in-setup-project

ただ、これと別に生まれ変わった`Win11`の`Microsoft Store`では`1080 x 1080`のサイズのアイコンが必要なので、`svg`で作っておくと幸せになれると思います。

![Imgur](https://imgur.com/KXDs6Ws.png)

今回は`InkScape`で作りました。`128 x 128`で`png`に書き出して、`GIMP`で`ico`形式に変更します。

## アイコンを追加
プロジェクトのプロパティから、リソースを開いて、`ico`ファイルをドラッグアンドドロップします。

![Imgur](https://imgur.com/6t2Weuj.png)

できたら、`Resources`フォルダに追加されるので、`Resources`フォルダ内にある`ico`のプロパティを開いて、`ビルドアクション`を`リソース`にします。必要かどうかはわかりませんが。

![Imgur](https://imgur.com/vGsX36c.png)

## WPFのアイコンを設定
プロジェクトのプロパティを開いて、アプリケーションを押して、`リソース`の中の`アイコン`を変更します。

![Imgur](https://imgur.com/ofWqAxV.png)

## インストーラーにアイコンを追加
インストーラープロジェクトを開いて、ここから追加できます。

![Imgur](https://imgur.com/VkyAMB5.png)

## スタートのショートカットのアイコンを設定
`User's Programs Menu`にあるショートカットのプロパティを開いて、Iconを選んで`Browse`を押します。

![Imgur](https://imgur.com/KAw566a.png)

そしたら、`Browse`を押して

![Imgur](https://imgur.com/TxgRhwN.png)

さっき追加したアイコンを選びます。

![Imgur](https://imgur.com/5X0Guhe.png)

そしたら、`Current icon`に追加されるので、選択して`OK`を押せば終了です。  
あとはビルドして完成。

## バージョンアップ？
バージョンの番号をあげます。インストーラーとWPFのアプリそれぞれ変更する必要があります。   
インストーラーの方はバージョンを変更すると`ProductCode`も生成し直すか聞かれるので生成し直します。

![Imgur](https://imgur.com/aZmk39I.png)

それから、`RemovePreviousVersions`を`True`にすると既存のバージョンをアンインストールしてくれるようになります。

# ソースコード

https://github.com/takusan23/ItaCursor

たぶん作れます。

### メモ

`.sln`をプロジェクトからソリューションのフォルダに移したい

-> 空のソリューションを作成して、既存のプロジェクトを追加することで解決