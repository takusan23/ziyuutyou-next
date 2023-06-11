---
title: WinUI 3 で出来たアプリを配布する（インストーラー / zip を作る）
created_at: 2023-06-11
tags:
- WinUI3
- WindowsAppSDK
- Windows
- .NET
- C#
---

どうもこんばんわ。  
サブディスプレイが壊れてしまった（なんかしばらくしないと画面が付かなくなってしまった・・・）ため、仮想デスクトップを使ってみているのですが、  
**仮想デスクトップの切り替えショートカットキーが覚えられません・・・！**、なんか色々組み合わせを確かめていると正解に当たったりする。
トラックパッドの場合はなんか直感的なジェスチャーがあってまぁいいかと感じなんですけどね。    

うーんでも新しい`Xperia`欲しいしディスプレイ買う金ないです・・（てか高すぎ）  
ちなみに`Surface`をサブディスプレイとして使う方法もあるみたいですが、やっぱ遅延がなあ～～～

# 本題
というわけで仮想デスクトップの切り替えショートカットキーを押してくれるアプリを作りました。  
`Windowsキー`長押しするとすりガラスなウィンドウが出てきて、トラックパッドのように線を描くと描いた向きに切り替わります（？）

![Imgur](https://imgur.com/7XOcwZf.png)

で、今気付いたのですが、長押しだと`Windowsキー`を使うショートカットキーが**動かなくなってしまった**ので、`Win+Ctrl`長押しで起動するように直しました。  
`スクリーンショット`が取れなくなったのが一番でかい・・・

# ソースコード
https://github.com/takusan23/DesktopLine  
https://github.com/takusan23/DesktopLine/releases  

# 本題2
たまに`WinUI 3`を使いたくなる未来の私のために、**`WinUI 3`のプロジェクトを作り、インストーラーを作る**ところまでを記録にしておこうと思います。  
`UWP`みたいな`UI` ( Windows 11 のUIコンポーネント ) が使えるのですが、これは`UWP`ではない（むしろ`WPF`で`UWP`のコンポーネントが使えるイメージ）ので、  
`Windowsのアプリストア`を使わずに、`インストーラー`や`zipファイル`にして普通に配布出来ます。  
`P/Invoke`も普通にできます（`WPF`と同じだね）。`WPF`より機能はまだ無いかもだけど`WinUI 3`のデザインが（ここ最近のWindowsの中で）とてもいい（気がする）！！！

どんなコンポーネントが使えるのかというと、以下のアプリを入れて見てみてください。すりガラス（Acrylic / Mica）なんかが少し書くだけで？使えるようになっています。  
- WinUI 3 Gallery
    - https://www.microsoft.com/store/productId/9P3JFPWWDZRC


# 環境

| なまえ          | あたい                                                    |
|-----------------|-----------------------------------------------------------|
| Windows         | 10 Pro ( 11 の場合は部分的に違うかも？ )                  |
| Visual Studio   | 2022 Community                                            |
| .NET            | 6 ( 7 でもいいはずです )                                  |
| Windows App SDK | 1.2.220902.1-preview1  ( 最新版にしても問題ないはずです ) |

`Visual Studio`と`.NET 6`のインストールはやっておいてください。

# インストーラー vs zipファイル
インストーラーだと、スタートメニューとかデスクトップに自動でショートカット追加出来たり、あと`.NET`が入ってない場合はインストールさせる機能がありますね。  
zipファイルをばらまく場合は配布が楽ですね。インストーラーの機能がいらない場合はありだと思う。

# Visual Studio で Windows App SDK を使う準備をする
ごめんなさい。。。覚えてないです。  
`Visual Studio Installer`で、`.NET`のところの`Windows アプリSDK`のところにチェックマークをいれてダウンロードすればいいのかなあ。。。

![Imgur](https://imgur.com/LvLMmX1.png)

# Visual Studio 2022 で新しいプロジェクトを作る
多分、これを選べばいいと思います。

![Imgur](https://imgur.com/wpJhCk6.png)

で、保存先とかをお好みで変更したあと、一番下の`ソリューションとプロジェクトを同じディレクトリに配置する`のチェックを外しておきます。  
こうしておくことで以下のようなファイル構成で行くことが出来ます。  

- ソリューション
    - プロジェクト ( `Windows App SDK` ( WinUI 3 ) アプリケーション )
        - MainWindow.xaml
        - ...
    - プロジェクト ( インストーラー )

インストーラーは新しいプロジェクトとしてソリューションに追加する必要があるのですが（多分・・？）、チェックを入れたままだと入れる場所がないんですよね、、  

- ソリューション
    - プロジェクト ( `Windows App SDK` ( WinUI 3 ) アプリケーション )
        - MainWindow.xaml
        - プロジェクト ( インストーラー ) ← 気持ち悪いけどここに入れるしか無い？。gitとかでバージョン管理する場合は・・・

（zip で配信したい場合は逆にチェックマークを入れたほうがシンプルな構成になるかも？？）

![Imgur](https://imgur.com/5IB4MMp.png)

あとはこれで作って、実行ボタンを押せば起動できるはず

![Imgur](https://imgur.com/KEal94T.png)

# MainWindow.xaml にワナがある （文字コード変更）
`WinUI 3 Gallery`を見てもらえるとわかるのですが、最初からきれいなコンポーネントがあるんですよね。  
こんな風に少し書くだけできれいなUIが作れます。

```xml
<!-- Copyright (c) Microsoft Corporation. All rights reserved. -->
<!-- Licensed under the MIT License. See LICENSE in the project root for license information. -->

<Window
    x:Class="ExampleWinUI3.MainWindow"
    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
    xmlns:local="using:ExampleWinUI3"
    xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
    mc:Ignorable="d">


    <NavigationView x:Name="nvSample">
        <NavigationView.MenuItems>
            <NavigationViewItem Icon="Play" Content="再生" />
            <NavigationViewItem Icon="Save" Content="保存" />
            <NavigationViewItem Icon="Refresh" Content="リロード" />
            <NavigationViewItem Icon="Download" Content="ダウンロード" />
        </NavigationView.MenuItems>

        <StackPanel Orientation="Vertical" HorizontalAlignment="Center" VerticalAlignment="Center">
            <Button Padding="10" x:Name="myButton" Click="myButton_Click">Click Me</Button>
            <ProgressRing Padding="10" IsActive="True" Background="LightGray"/>
            <ToggleSwitch Padding="10" AutomationProperties.Name="simple ToggleSwitch"/>
        </StackPanel>

    </NavigationView>
</Window>
```

なんですけど、設定を変えないと日本語が文字化けしてしまいます・・・

![Imgur](https://imgur.com/FqAaL6S.png)

修正方法は前にも書いたのですが、`MainWindow.xaml`を`BOM付き UTF-8`にすれば修正可能です。  
名前をつけて保存を選んで

![Imgur](https://imgur.com/xjXabZk.png)

エンコード付きで保存を押します

![Imgur](https://imgur.com/zvD3bXm.png)

`UTF-8 シグネチャ付き`を選びます

![Imgur](https://imgur.com/dww7gDo.png)

これで治りました。やったー

![Imgur](https://imgur.com/G28D8dh.png)

# インストーラー / zipファイル を作る
配布する前まで頑張って作ってください。。  
で、ここからは配布の話を残して置こうと思います

## 参考
thx!!!!!

https://learn.microsoft.com/ja-jp/windows/apps/package-and-deploy/self-contained-deploy/deploy-self-contained-apps
https://www.ipentec.com/document/csharp-winui3-create-self-contained-executables-application

## その前に exe で配信できる形式にする
~~どうやらMSは未だに`MSIX`に強いこだわりがあるらしく？~~ デフォルトだと`exe`にできません。  
`dotnet publish`を使ったとしても、設定を変更しないと起動できない`exe`が生成されてしまいます。。困った！

```plaintext
障害バケット 1463075854298809095、種類 4
イベント名: APPCRASH
応答: 使用不可
Cab ID: 0

問題の署名:
P1: ExampleWinUI3.exe
...
```

![Imgur](https://imgur.com/MS2hqyu.png)

（`Windows`だとアプリが起動できないログが`イベントビューアー`というアプリに保存されます。）

これを治すためには、プロジェクトを押して、`プロジェクト ファイルの編集`を押します。

![Imgur](https://imgur.com/04nGhnM.png)

そしたら、以下の二行を`<PropertyGroup>`の中に足します。以下のように

```xml
<WindowsAppSDKSelfContained>true</WindowsAppSDKSelfContained>
<WindowsPackageType>None</WindowsPackageType>
```

![Imgur](https://imgur.com/JnyEk77.png)

また、これを記述したあとは、以下の`Unpackaged`の方を実行する必要があります。

![Imgur](https://imgur.com/8d1lZOc.png)

## zip で配布する
お手軽ですが、スタートメニューに自動で追加とかは出来ません。（インストーラーが必要です。）  
ソリューションを右クリックして、発行を押します。

![Imgur](https://imgur.com/vIOvS6i.png)

`x64`でいいはず。

![Imgur](https://imgur.com/krNSydi.png)

`すべての設定を表示`を押して、構成を `Release | x64`、配置モードを`フレームワーク依存`、ファイルの公開オプションを開き、`単一ファイルの作成`へチェックマークを入れるといいと思います。  
自己完結だと`.NET`が`exe`の中に入るため、`.NET`がインストールされてなくても起動できる一方、バイナリサイズがとても大きくなってしまいます。  
`単一ファイル`にチェックすることで、`WPF`の時は`exe一個`にまとめることが出来たのですが、`WindowsAppSDK`ではなんか出来ないっぽいです。。。が一応チェックを入れています。

![Imgur](https://imgur.com/vxJUHwY.png)

あとは`発行を押します`

![Imgur](https://imgur.com/x3VuimK.png)

終わったら開いてみましょう。どうですか？開けましたか！？！？！？

![Imgur](https://imgur.com/uBW8rkA.png)

わーい 🎉🎉🎉

`zip`ファイルで配布する場合は、`exe`があるフォルダを全部圧縮して、適当なところで公開すればいいと思います。  

![Imgur](https://imgur.com/6NQwLow.png)

## インストーラーで配布する
`WPF`版もあります : https://takusan.negitoro.dev/posts/windows_dot_net5_wpf_making_installer/

`Visual Studio`に拡張機能を入れます。  
https://marketplace.visualstudio.com/items?itemName=VisualStudioClient.MicrosoftVisualStudio2022InstallerProjects  

![Imgur](https://imgur.com/fyrpu84.png)

### インストーラーを作ります
ソリューションを右クリックしてプロジェクトを追加します。

![Imgur](https://imgur.com/WkmA5P8.png)

`Setup Project`を押します

![Imgur](https://imgur.com/Orx43SZ.png)

名前をよしなに変えて done

![Imgur](https://imgur.com/PHXDCzf.png)

こんな感じになるはず

![Imgur](https://imgur.com/ZKho35D.png)

### 配布設定をする
ここの手順は`zipファイル`で配布するのと同じですね。  
`WinUI 3`プロジェクトを右クリックして`発行`を押します。

![Imgur](https://imgur.com/lbXgO7x.png)

`x64`にします（最近はほとんど`x64`でいいはず）

![Imgur](https://imgur.com/HmD4hpN.png)

`すべての設定を表示`から、以下のように変更します。

- 構成
    - `Release | x64`
- 配置モード
    - `フレームワーク依存`
        - `自己完結`だと`.NET`が`.exe`の中に入るため、バイナリサイズがデカくなります。が、`.NET`を入れなくても起動できるメリットがあります。
- ファイルの構成オプション の 単一ファイルの作成
    - どっちでもいいはず？

![Imgur](https://imgur.com/eH7On5E.png)

出来たら`保存`してください。

### インストーラーに配布するファイルを設定する
参考：https://learn.microsoft.com/en-us/visualstudio/deployment/installer-projects-net-core?view=vs-2019

ソリューションエクスプローラーから、さっきつくったインストーラーを右クリックして、`File System`を開きます。

![Imgur](https://imgur.com/ZajMDN9.png)

`Application Folder`を選び、`プロジェクト出力`を押します。

![Imgur](https://imgur.com/hd4UGFL.png)

`項目の公開`、を選んで`OK`します

![Imgur](https://imgur.com/JRzkQ1W.png)

### 項目の公開と WinUI 3 の成果物を紐付ける
ソリューションエクスプローラーから、さっきつくった`項目の公開`を右クリックして`プロパティ`を押します。

![Imgur](https://imgur.com/O4IOuOp.png)

`プロパティ`の中の`PublishProperties`のドロップダウンメニューを押すと、なんか3つくらいでてくると思うので、`x64`と書いてある方を選びます。

![Imgur](https://imgur.com/xTWghXF.png)


### その他の値もセットする
ソリューションエクスプローラーで、インストーラープロジェクトをクリックし、下のプロパティから、  
`TargetPlatform`を`x64`にします。

![Imgur](https://imgur.com/Zr71CAO.png)

また、以下の値も変えておくと良いでしょう。
- ProductName
    - アプリの名前
- Another
    - 作者
- Title
    - インストーラーの名前
- Manufactor
    - 作者？

![Imgur](https://imgur.com/b9f5lva.png)

### インストーラーをつくる
やる必要があるのか知りませんが、実行ボタンの隣りにあるドロップダウンメニュー、`Release`と`x64`にしておきました。

![Imgur](https://imgur.com/mZnQnBB.png)

あとは、ソリューションエクスプローラーのインストーラープロジェクトを右クリックして、`ビルド`を押すことで開始できます。

![Imgur](https://imgur.com/rbTE2Do.png)

はい！！！

![Imgur](https://imgur.com/5ILfBZx.png)

こんな感じにインストーラーが出来ているはず  

![Imgur](https://imgur.com/qekx5gU.png)

`UAC`たまによく気付かないんだけど私だけ？

![Imgur](https://imgur.com/B16QsQt.png)

ちゃんとアンインストールもできます。

![Imgur](https://imgur.com/IQqIjOT.png)

### スタートメニューに表示させる
`File System`から、`User's Programs Menu`を押し右クリックして`新しいショートカットの作成`を押します。  

![Imgur](https://imgur.com/clwg7Je.png)

`Application Folder`から、`項目の公開`を選び`OK`します。

![Imgur](https://imgur.com/OHIRIP2.png)

名前はプロジェクトから変えることが出来ます。

![Imgur](https://imgur.com/wg5lRo8.png)

これでスタートメニューに出てくるはず

![Imgur](https://imgur.com/8cmpOjR.png)

### アイコン変更
`WPF`のときとほぼ同じですが・・・  
`GIMP`とかを使って`128x128`の`ico`ファイルを作ってください。

![Imgur](https://imgur.com/cDPEUYA.png)

`WinUI 3`のプロジェクトを右クリックして、`プロパティ`に進みます。  

![Imgur](https://imgur.com/KCKXOsQ.png)

リソースを押して、まだ作っていない場合は`作成する/開く`を押します

![Imgur](https://imgur.com/YEWbgAl.png)

そしたらここに`.ico`を投げ込みます。

![Imgur](https://imgur.com/X0gNVt9.png)

![Imgur](https://imgur.com/ZwthLDj.png)

また、ソリューションエクスプローラーから、先程追加した`ico`のプロパティを開き、`ビルドアクション`を`リソース`にします。

![Imgur](https://imgur.com/6lwQMAv.png)

#### アプリ自体のアイコン

アプリのアイコンの設定は、さっきの`WinUI 3`のプロパティのここです。

![Imgur](https://imgur.com/20ir0jH.png)

変わってるはず？

![Imgur](https://imgur.com/PKdTDUs.png)

こっちを変更するのはまた別に `C#` コードを書かないといけないそうです・・・  
参考 : https://github.com/microsoft/WindowsAppSDK/issues/1914

![Imgur](https://imgur.com/8IsyRHI.png)

#### ショートカットのアイコン
インストーラープロジェクトの`File System`より、`Application Folder`を右クリックして、`ファイル`を押します。

![Imgur](https://imgur.com/W6meUvY.png)

あとはさっき追加した`ico`を探して追加します。

![Imgur](https://imgur.com/7RNmmUA.png)

そのあと、`User's Programs Menu`より先程作ったショートカットを選び、プロパティの`Icon`にあるドロップダウンメニューをおし、`Browse...`を押します。

![Imgur](https://imgur.com/LbhjU4e.png)

でてきたら、`Application Folder`にさっき追加した`ico`があると思うので、それを選べばOKです！

![Imgur](https://imgur.com/UVG2J8a.png)

これで再度ビルドしてみて、実際にインストールするとこうなるはず！  
どうでしょう？？？？

![Imgur](https://imgur.com/FjY3IWb.png)

# おわりに
ここまでのソースコードです。  
`zip`でも`インストーラー`でも作れると思います。

https://github.com/takusan23/ExampleWinUI3Installer

と、、思ったんですけど`.pubxm`が追跡対象外だった...

![Imgur](https://imgur.com/GXxdRWt.png)

# おわりに
マウスのショートカットキー割り当て機能でよくない？？？？ってインストーラー作ってるときに思いました。

# おわりに2
`Next.js`の`App Router`移行をそろそろやりたいなと思っています。