---
title: .NET Frameworkを.Net Coreへ移行する
created_at: 2020-08-13
tags:
- C#
- .NETCore
- Windows
- WinForm
---

ハナヤマタ一挙放送ニコ生でみました（おそい）。EDの入りすき  

# 本題
.NET FrameworkなWPFアプリを.NET Coreへお引越しする

# なんで？
[.NET CoreでWPFアプリ作るぞ](dotnet_wpf)で書いたけど、

- 自己完結ファイルを生成できる
    - 利用者がDotNET FrameworkやDotNET Coreを入れなくても、必要なファイル全部詰めた`exe`を生成してくれる機能。
        - サイズが大きくなりがち

というわけです。

# 移行方法
https://docs.microsoft.com/ja-jp/dotnet/core/porting/#overview-of-the-porting-process

.NET Portability Analyzer 等はめんどいので使わない方向で（よくない）

あと dotnet try-convert なんて言う移行ツールがありますがそれも使わない方針で

# 環境

|なまえ|あたい|
|--|---|
|今回使うソースコード|https://github.com/takusan23/RunCat_for_windows_nicomoba_ver|
|Visual Studio|2019 Community|


# 移行方法を確認する
## プロジェクトファイル(csproj)を開き、簡単に移行できるか判断する
[公式ドキュメント](https://docs.microsoft.com/ja-jp/nuget/resources/check-project-format)　←ここも見てね

.NET Coreではプロジェクトファイル(.csproj)の中身が簡素化されていて、全然別のことが書いてある模様。私も何に使ってるのかわからん。    

まず`ソリューションエクスプローラー`のプロジェクト名のところを右クリックして、`プロジェクトのアンロード`を押します。  
![Imgur](https://imgur.com/m90BD8l.png)

そしたらもう一回プロジェクト名のところを右クリックして、`編集 なんとか.csproj`を押します

![Imgur](https://imgur.com/nrumkVX.png)

押すと謎のXMLファイルみたいなのが開くので、`project`要素（`<Project ToolsVersion なんとか～`のところ）に、`Sdk`属性（`Sdk="なんとか"`）があれば簡単に移行できます。

以下は`Sdk属性`が無い例です。よって以降はめんどいです

![Imgur](https://imgur.com/F1fR6hP.png)


```xml
<?xml version="1.0" encoding="utf-8"?>
<Project ToolsVersion="15.0" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
```

まあ明らかに行数が多ければ疑ったほうがいいです。

### もし Sdk属性 が存在した場合は？
その場合は **新しいプロジェクトファイル(.csproj)** ってことで以下の方法が使えます。

さっき開いたファイルの中から`<TargetFramework>`で囲まれている部分を探して、その中を`netcoreapp3.1`にすればもう`.NET Core`として扱ってくれるそうです。  

`Sdk属性`がない場合は`<TargetFramework>`も無いと思います。

## .NET Coreへ
プロジェクトファイルが古いことが判明したので、おそらく

- 新しく`.NET Core`のプロジェクトを作成してプログラム、リソースを移動させる
    - 今回はこちらを取ります
- [dotnet try-convert](https://github.com/dotnet/try-convert)を使う（小規模なら有力候補）

## 空の`.NET Core`プロジェクトを作成
今回は`WinForm`ってことで`Windows Forms App (.NET Core)`を選びました。  

判別方法は、まあ`Program.cs`の`using`に`Forms`って文字があったからです。他に正規ルートがありそう。  
`WPF`と`Form`の判別ってソースコードのどこ見ればわかるんですかね（え？）。

WPFの場合は **WPF App(.NET Core)** を選べばいいと思います。

### やらなくてもいいけど
.NET Coreで作ったプロジェクト名を右クリックして、`プロジェクトファイルの編集`をおすと、すごい簡素化された`csproj`が見れると思います。こんなの

```xml
<Project Sdk="Microsoft.NET.Sdk.WindowsDesktop">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>netcoreapp3.1</TargetFramework>
    <UseWindowsForms>true</UseWindowsForms>
  </PropertyGroup>

</Project>
```

## プログラム、リソースの移動
といっても`Program.cs`を切り貼りして移行前(`.NET Framework`)と同じようにするだけですね。

## Resource
リソース（画像とか）を入れるフォルダは、何もしない状態だと生成されないので、

ソリューションエクスプローラーのプロジェクト名(`.NET Core`で作成した方)の部分を右クリックして、`プロパティ`を選びます。

![Imgur](https://imgur.com/uADCQCe.png)

プロパティが開けたら、`リソース`を押します。

![Imgur](https://imgur.com/6ZUL6Cd.png)

するとこんな画面になるので、`このプロジェクトには既定のリソース～`って書いてある部分を押します。

あとはこの画面に使う画像をドラッグアンドドロップすると画像が登録されます。  
Resourcesフォルダも生成されてることがわかりますね。

![Imgur](https://imgur.com/9qy2cK3.png)

あとはC#の方でusingを追加したら触れるようになります。

![Imgur](https://imgur.com/BLkZMVJ.png)

## ブラウザ起動できない
こうすればいいです。`.NET Core`の問題っぽい？

```cs
ProcessStartInfo psi = new ProcessStartInfo
{
    FileName = "https://github.com/takusan23/RunCat_for_windows_nicomoba_chan_ver",
    UseShellExecute = true
};
Process.Start(psi);
```

# おわりに
[自己完結exeの作り方はここ](dotnet_wpf)。これを読めばexeを生成してばらまく事ができます。

ニコモバちゃんかわいい[^1]  
![Imgur](https://imgur.com/ghhYzL3.png)

ダウンロード置いときますね。  
https://github.com/takusan23/RunCat_for_windows_nicomoba_chan_ver/releases/tag/NicomobaChanVar_1.0

このアプリはこのアプリをフォークして作った。RunCatかわいい。  
https://qiita.com/Kyome/items/47aac4979933dac12263

# 参考にしました
ありがとうございます

https://codezine.jp/article/detail/11955?p=4

https://qiita.com/tfukumori/items/37fe740ca0b81293c03f#5-%E7%A7%BB%E6%A4%8Dporting

https://docs.microsoft.com/ja-jp/dotnet/core/porting/#overview-of-the-porting-process

https://docs.microsoft.com/ja-jp/nuget/resources/check-project-format


[^1] 昔（配信アプリが別だった頃。nicocasとか無かった頃）スマホ配信で音のみになったときに「ニコモバ」ってコメントするとニコモバちゃんが走ってくれた。