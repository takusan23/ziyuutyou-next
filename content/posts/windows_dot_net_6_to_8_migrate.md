---
title: .NET 6 から 8 に移行する
created_at: 2024-10-05
tags:
- .NET
---
どうもこんばんわ。  
`Windows サンドボックス`にファイルをコピーしたくて、どうすれば良いのかなって調べたら、ファイルをコピーしてサンドボックスで貼り付ければいいらしい。  
https://www.reddit.com/r/Windows10/comments/bwcgrd/how_do_i_move_files_between_windows_and_windows/

![Imgur](https://imgur.com/PBLNVIJ.png)

たしかに、別にテキスト以外も送れたのか・・・

# 本題
`.NET 6`の`LTS`がついに終わってしまうらしい。ので、今回は次の`LTS`である`.NET 8`にします。  
今も使ってる`Windows`で動くアプリが`.NET 6`時代のままなので、アップデートしていきます。

# 環境
自作アプリは`Windows App SDK`でできたアプリと、`WinForm`のアプリになります。それらを上げます

| なまえ        | あたい                         |
|---------------|--------------------------------|
| Windows       | 10 Pro                         |
| Visual Studio | Community 2022 Version 17.11.4 |

# バックアップをとっとく
`git`を使ってバージョン管理してるならすぐ戻せますが、もし使ってない場合はバックアップしといたほうが良いです。

# .NET8 にする
`.NET アップグレード アシスタント`を入れる？

https://learn.microsoft.com/ja-jp/dotnet/core/porting/upgrade-assistant-install#install-the-visual-studio-extension

![Imgur](https://imgur.com/jlWDvOO.png)

ダウンロードします

![Imgur](https://imgur.com/rR8YUmG.png)

パッケージがダウンロードできるので、Visual Studio へインストールします。  
もしかしたら`Visual Studio`の拡張から直接入れられたかも知れない。

![Imgur](https://imgur.com/xcMOXtz.png)

ダブルクリックするとなんか始まる

![Imgur](https://imgur.com/pFbGsUZ.png)

`Visual Studio`起動中だと進まないので閉じます

![Imgur](https://imgur.com/Wbag8dr.png)

![Imgur](https://imgur.com/iHSh8uB.png)

# アップグレードアシスタントを起動してみた
さっきと同じようにアップグレードを押すとこんな画面に。  
`.NET バージョン`の方を選ぶ

![Imgur](https://imgur.com/LDaEMlS.png)

`.NET 8`を選んで次へ。  

![Imgur](https://imgur.com/QvTlhsy.png)

よくわかんないし、最悪戻せるのでこのまま`アップグレードの選択`を押します

![Imgur](https://imgur.com/qvbkj6D.png)

はじまりました。と思ったらほとんどスキップで終わった。

![Imgur](https://imgur.com/AvkbbmR.png)

差分を`git`で見てみたけど、`<TargetFramework>`が変わったくらい？

![Imgur](https://imgur.com/nLN6sM7.png)

# ライブラリ更新もしておく
ソリューションから、プロジェクト選んで、`Nugetパッケージの管理`を押して、更新があれば更新しておきます。  

![Imgur](https://imgur.com/7kenjbY.png)

![Imgur](https://imgur.com/11M4mzM.png)

# .NET 8 にあげたのに 6 を使っているから互換性がないと言われた
いやさっき`.NET 8`にしたんですけど、なんでまだ`6`使ってると思われてるの？

![Imgur](https://imgur.com/3VxVSLd.png)

というわけで色々見てみた感じ、どうやらまだ設定しないとダメらしい？  
まずはプロパティを開きます

![Imgur](https://imgur.com/deout2C.png)

つぎに、上げたはずの`ターゲットフレームワーク`を`.NET 8`にします。**、、、、む、押しても戻ってしまいます**  

![Imgur](https://imgur.com/0kOHZyd.png)

# PublishProfiles の TargetFramework が 6 のままだった
もしプロジェクト内に`Properties`があって、その中に`PublishProfiles`がある場合、その傘下にあるファイルの`.NET`バージョンも変更する必要があります。  

![Imgur](https://imgur.com/wvoIPt7.png)

多分値は、アップグレードアシスタントの値と同じものを入れておけば良さそう。

```xml
<?xml version="1.0" encoding="utf-8"?>
<!--
https://go.microsoft.com/fwlink/?LinkID=208121.
-->
<Project ToolsVersion="4.0" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <PropertyGroup>
    <PublishProtocol>FileSystem</PublishProtocol>
    <Platform>x64</Platform>
    <RuntimeIdentifier>win10-x64</RuntimeIdentifier>
    <PublishDir>bin\\\win10-x64\publish\win10-x64\</PublishDir>
    <SelfContained>false</SelfContained>
    <PublishSingleFile>true</PublishSingleFile>
    <PublishReadyToRun Condition="'$(Configuration)' == 'Debug'">False</PublishReadyToRun>
    <Configuration>Release</Configuration>
    <TargetFramework>net8.0-windows10.0.19041.0</TargetFramework>
    <!-- 
    See https://github.com/microsoft/CsWinRT/issues/373
    <PublishTrimmed>True</PublishTrimmed>
    -->
  </PropertyGroup>
</Project>
```

これで晴れて`.NET 8`に更新することができました。

![Imgur](https://imgur.com/nCj8dHo.png)

# 実行できない
ありがとうございます：https://zenn.dev/shinta0806/articles/dotnet8-netsdk1083

```plaintext
指定された RuntimeIdentifier、'win10-x64' が認識されません。 詳細については、「 https://aka.ms/netsdk1083 」を参照してください。
```

リンク先は https://learn.microsoft.com/ja-jp/dotnet/core/compatibility/sdk/8.0/rid-graph  
どうやら、`win10-x64`となっている部分を、`win-x64`にしろってことらしい。

プロジェクトをダブルクリックすると、`xml`が開くはずで、その中から`<RuntimeIdentifiers>`の行を探します。

![Imgur](https://imgur.com/wnAkTWH.png)

わたしの場合はこうなってて、これをまずは以下のようにします。`win10`を`win`だけにする。

```xml
<RuntimeIdentifiers>win10-x86;win10-x64;win10-arm64</RuntimeIdentifiers>
```

```xml
<RuntimeIdentifiers>win-x86;win-x64;win-arm64</RuntimeIdentifiers>
```

つぎに、`Properties`の`PublishProfiles`にあるファイルにも`<RuntimeIdentifiers>`があるので、同様に`win10`を`win`だけにしていきます。

![Imgur](https://imgur.com/izU8lzM.png)

`Properties\PublishProfiles\win10-arm64.pubxml`  
```xml
<RuntimeIdentifier>win-arm64</RuntimeIdentifier>
```

`Properties\PublishProfiles\win10-x64.pubxml`  
```xml
<RuntimeIdentifier>win-x64</RuntimeIdentifier>
```

`Properties\PublishProfiles\win10-x86.pubxml`  
```xml
<RuntimeIdentifier>win-x86</RuntimeIdentifier>
```

# まだ実行できない
`.NET 8`にしたけどまだダメなのかな。。。

```plaintext
This version of the Windows App SDK requires Microsoft.Windows.SDK.NET.Ref 10.0.19041.38 or later.
    Please update to .NET SDK 6.0.134, 6.0.426, 8.0.109, 8.0.305 or 8.0.402 (or later).
    Or add a temporary Microsoft.Windows.SDK.NET.Ref reference which can be added with:
        <PropertyGroup>
            <WindowsSdkPackageVersion>10.0.19041.38</WindowsSdkPackageVersion>
        </PropertyGroup>
```

というか私以外も引っかかってるのこれ？  
https://github.com/microsoft/WindowsAppSDK/issues/4698

とりあえず`PropertyGroup`に一行書き足せって書いてあるので書き足してみる。一番最後の`WindowsSdkPackageVersion`ってやつ。

```xml
<PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net8.0-windows10.0.19041.0</TargetFramework>
    <TargetPlatformMinVersion>10.0.17763.0</TargetPlatformMinVersion>
    <RootNamespace>DesktopLine</RootNamespace>
    <ApplicationManifest>app.manifest</ApplicationManifest>
    <Platforms>x86;x64;arm64</Platforms>
    <RuntimeIdentifiers>win-x86;win-x64;win-arm64</RuntimeIdentifiers>
    <PublishProfile>win10-$(Platform).pubxml</PublishProfile>
    <UseWinUI>true</UseWinUI>
    <EnableMsixTooling>true</EnableMsixTooling>
    <ApplicationIcon>Resources\desktop_line_icon.ico</ApplicationIcon>
    <WindowsAppSDKSelfContained>true</WindowsAppSDKSelfContained>
    <WindowsPackageType>None</WindowsPackageType>
    <WindowsSdkPackageVersion>10.0.19041.38</WindowsSdkPackageVersion>
</PropertyGroup>
```

# うごいた！
やったぜ

![Imgur](https://imgur.com/GaeWp2j.png)

# 発行できるかも試す
`zip`に`Windows App SDK`吐き出せるか試します。プロジェクトを右クリックで発行を押します。  

![Imgur](https://imgur.com/dL9n7jg.png)

一回も押したことがない場合は違う画面が開くと思う？。既存のプロジェクトなのでそのまま`発行`を押します。  
![Imgur](https://imgur.com/t6ANOKy.png)

成功したぽい！！  

![Imgur](https://imgur.com/EnLrkgl.png)

おおお  
ちゃんと起動できた。

![Imgur](https://imgur.com/SE7xt3y.png)

# WinForm は？
多分`<TargetFramework>`が`net8`になるだけ？  
該当部分抜き出し。

```xml
<PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net8.0-windows</TargetFramework>
    <UseWindowsForms>true</UseWindowsForms>
</PropertyGroup>
```

# おわりに
直したリポジトリ

- https://github.com/takusan23/RunCat_for_windows_nicomoba_chan_ver
- https://github.com/takusan23/MuteButton
- https://github.com/takusan23/DesktopLine