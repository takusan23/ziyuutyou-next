---
title: .NET CoreでWPFアプリ作るぞ
created_at: 2020-06-09
tags:
- CS
- WPF
- .NETCore
---

.NET Coreってなに

# ほんだい
WPFなんてめったに触らんから未来の私がWPFやる時に見に来る記事。  
[WPFアプリ作ったので](../../posts/mousecursor_wpf/)その時に躓いたこ

# 環境
|なまえ|あたい|
|---|---|
|OS|Windows 10 Pro 2004|
|Visual Studio|Community 2019|

# .NET Coreってなに
しらない。なんかよくわからんけど使う。  
.NET Coreはクロスプラットフォームって言われてるけど、WPFに関してはWindowsに依存してるから関係ないよ

[ソース](https://docs.microsoft.com/ja-jp/windows/apps/desktop/modernize/modernize-wpf-tutorial)

# Visual Studio 2019 入れる
最新版入れましょう。最新版じゃないと`WPF App (.NET Core)`が選べないと思います。  
ちなみに私は最新版にアップデートする際、ダウンロードするファイルが3GBを超えてました。クソ長かったわ。

# プロジェクト作成
検索ボックスに`wpf`って入れれば出ます。  
`.NET Framework`じゃないほうを選びましょうね。
![Imgur](https://imgur.com/BHxIloY.png)


その後の`プロジェクト名`とかは各自決めてね。

# ぷよぐらみんぐ
久々のC#くんです。  
（多分）Androidと同じ感じで、xamlでレイアウト決めて、C#でプログラムを書いていく感じですが、ちょっと違うのね。

- Androidの`findViewById`
    - C#ではレイアウトに`Name`付けとけばC#から扱える。
    - KotlinでfindViewByIdが省略できるみたいな感じで書ける。

## レイアウト
**MainWindow.xaml**

```xml
<Window x:Class="DotNetCoreWPF.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:DotNetCoreWPF"
        mc:Ignorable="d"
        Title="MainWindow" Height="450" Width="800">
    <Grid>
        <TextBox FontSize="20" HorizontalAlignment="Center" Name="TimeTextBox" Text="" TextWrapping="Wrap" TextAlignment="Center" VerticalAlignment="Center" Height="30" Width="228"/>

    </Grid>
</Window>
```

真ん中にテキストを表示する`TextBox`を置いただけです。  

## C#
**MainWindow.cs**
上の`using`は省略してるので気をつけて
```cs
namespace DotNetCoreWPF
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();

            // タイマー初期化
            var dispatcherTimer = new DispatcherTimer();
            dispatcherTimer.Tick += new EventHandler(dispatcherTimer_Tick);
            dispatcherTimer.Interval = new TimeSpan(0, 0, 1);
            dispatcherTimer.Start();

        }

        // タイマーで毎秒ここ呼ばれる。
        private void dispatcherTimer_Tick(object sender, EventArgs e)
        {
            // 時間を表示
            TimeTextBox.Text = DateTime.Now.ToString();
        }

    }
}
```

これでデジタル時計の完成です。はっっや

![Imgur](https://imgur.com/ZmZzxBb.png)

# exeにする
`.NET Framework`時代ではどうやってexeを配布してたのかよくわかりませんが、  
`.NET Core`では**自己完結型**が使えるそうです。（.NET Frameworkじゃできない？）  
## 自己完結型 #とは
必要なもの全部を一つの`exeファイル`にできる機能。  
ちょっと前だとWindowsのフリーソフトを入れる際に、**.NET Framework のバージョンなんとか以上が必要**みたいなやつがよくありましたが、  
`.NET Core（正確には3.0から）`では.NET Core（.NET Frameworkの後継）が入っていないPCでも実行できるように、.NET Coreのランタイムやらなんやらを一つのexeにいれて環境に関係なく動くようになるらしい。  
変わりにファイルサイズが大きくなるけど。  

今回は`.NET Core ランタイム入り（.NET Core入ってないPCでも動くやつ）`と`.NET Coreのランタイム無し`の両方をやろうと思います。

## ソリューションエクスプローラー開いて
名前のところを押して**発行**を押します。

![Imgur](https://imgur.com/xjXxEdu.png)

**フォルダー**を選んで次へ

![Imgur](https://imgur.com/WBZdhUB.png)

そのまま**完了**押して良いと思います。

![Imgur](https://imgur.com/gZPdL5D.png)

そしたら後ろのVS 2019の内容が画像のように変わるので、**構成**のところの鉛筆マークを押します。

![Imgur](https://imgur.com/dGv9U3Z.png)

そしてこの先は作りたいexeファイルによって操作が変わります。

# .NET Core ランタイム入りのexeファイルを作成する

プロファイル設定で、**配置モード**を**自己完結**にします。  
それから、下の**ファイルの公開オプション**を押して、**単一ファイルの作成**にチェックを入れます。

![Imgur](https://imgur.com/ARUKDNH.png)

そしたら保存して、**発行**ボタンを押せば作成されます。
作成された`exeファイル`は`bin/Release/netcoreapp3.1/publish`の中にあると思います。

実際に起動してみたの図。これだけなのにファイルサイズでけえ。
![Imgur](https://imgur.com/hN2DDg4.png)

# .NET Core ランタイム無しのexeファイルを作成する

プロファイル設定で、**配置モード**を**フレームワーク依存**にします。  
それから、下の**ファイルの公開オプション**を押して、**単一ファイルの作成**にチェックを入れます。

![Imgur](https://imgur.com/sRKKtZN.png)

そしたら保存して、**発行**ボタンを押せば作成されます。
作成された`exeファイル`は`bin/Release/netcoreapp3.1/publish`の中にあると思います。


実際に起動してみたの図。ファイルサイズは小さい。

![Imgur](https://imgur.com/byF4X4v.png)


# おわりに
これで正解なのかはよく分かっていない。 

というかなんで`TextBox`使ったの？`TextBlock`で良かったじゃん。

一応ソースコード置いときますね→ https://github.com/takusan23/DotNetCoreWPF

あと少しずれるんだけど、画像を入れても何故かコケる問題。画像を右クリックしてプロパティ選んで、ビルドアクションをリソースにすればいいのね。時間奪われた。

# 参考にしました
ありがとうございます


https://www.telerik.com/blogs/creating-a-single-exe-application-with-net-core

https://techinfoofmicrosofttech.osscons.jp/index.php?.NET%20Core%E3%81%AE%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4

https://rksoftware.hatenablog.com/entry/2019/02/17/194701