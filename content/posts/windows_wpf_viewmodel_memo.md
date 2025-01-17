---
title: WPFのViewModelのメモ
created_at: 2021-09-17
tags:
- WPF
- C#
- MVVM
---
どうもこんにちわ。  
D.C.4 PH攻略してますが曲がいいですね。OP曲のCDはよ  

# 本題
WPFでViewModelを使ったときにハマったメモ。  
Windows 11のアプリストアではexeが提出できるようになるらしいですよ？(なお開発者登録にクレカが必要)  
**Windows 11 tmp 2.0 bypass で検索検索ぅ**

# 環境

| なまえ | あたい |
|--------|--------|
| .NET   | 5      |

## ViewからViewModelへ。ボタン押したときの処理をViewModelでする場合

ViewModel、レイアウトは以下のようにします。

```xml
<Window x:Class="WPFViewModel.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:WPFViewModel"
        mc:Ignorable="d"
        Title="MainWindow" Height="450" Width="800">

    <Window.DataContext>
        <local:MainWindowViewModel/>
    </Window.DataContext>

    <StackPanel Orientation="Vertical" HorizontalAlignment="Center" VerticalAlignment="Center">
        <Button>Googleを開く</Button>
    </StackPanel>
</Window>
```

```cs
namespace WPFViewModel
{
    class MainWindowViewModel
    {


    }
}
```

ボタン押したときの処理をViewModelに書く場合はまず、  
`ICommand`を実装したクラスを用意する必要があります。ViewModel内のメソッドを直接指定みたいなことは出来ない模様。  
`ICommand`の中に処理を書いてしまうと、他で使えなくなってしまうので、押したときに呼ばれる処理（関数）をクラス作成時のコンストラクタに取ります。  

```cs
using System;
using System.Windows.Input;

namespace WPFViewModel
{
    class ViewModelButtonClick : ICommand
    {
        public event EventHandler CanExecuteChanged;

        private Action _click;

        public ViewModelButtonClick(Action click)
        {
            _click = click;
        }

        public bool CanExecute(object parameter)
        {
            return true;
        }

        public void Execute(object parameter)
        {
            _click();
        }
    }
}
```

そしたら、ViewModel、レイアウトを書きます。`{ get; }`を書き忘れないようにしてください。

```cs
using System.Diagnostics;

namespace WPFViewModel
{
    class MainWindowViewModel
    {

        /// <summary>
        /// ボタンを押したとき
        /// </summary>
        public ViewModelButtonClick OpenGoogle { get; } = new ViewModelButtonClick(() =>
        {
            // 押したときに呼ばれる
            ProcessStartInfo psi = new ProcessStartInfo
              {
                  FileName = "https://google.com",
                  UseShellExecute = true
              };
              Process.Start(psi);
        });

    }
}
```

```xml
<Window x:Class="WPFViewModel.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:WPFViewModel"
        mc:Ignorable="d"
        Title="MainWindow" Height="450" Width="800">

    <Window.DataContext>
        <local:MainWindowViewModel/>
    </Window.DataContext>

    <StackPanel Orientation="Vertical" HorizontalAlignment="Center" VerticalAlignment="Center">
        <Button Command="{Binding OpenGoogle}">Googleを開く</Button>
    </StackPanel>
</Window>
```

これで実行すると、Googleがブラウザで開くと思います。

# ViewModelからViewへ。値の変更を通知する場合
AndroidのLiveData的な。  

レイアウト、ViewModelは以下のように

```xml
<Window x:Class="WPFViewModel.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:WPFViewModel"
        mc:Ignorable="d"
        Title="MainWindow" Height="450" Width="800">

    <Window.DataContext>
        <local:MainWindowViewModel/>
    </Window.DataContext>

    <StackPanel Orientation="Vertical" HorizontalAlignment="Center" VerticalAlignment="Center">
        <TextBlock Text="" TextAlignment="Center" />
        <Button Command="">カウントアップ</Button>
    </StackPanel>
</Window>
```

```cs
namespace WPFViewModel
{
    class MainWindowViewModel
    {

        
    }
}
```

これもまず`InotifyProrertyChanged`を実装したクラスを作成します。  
`<T>`ってのはジェネリクスってやつで、`<>`の中に入れるべき型をインスタンス生成時に決定する機能です（？？？）  
`<string>`と書いてしまうと、今度数値を扱うときに別にクラスを作成しないといけないですよね？。それを回避する機能です。まぁコピペして使えばいいと思うよ。

```cs
namespace WPFViewModel
{
    class ViewModelValueChanged<T> : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler PropertyChanged;
        private void RaisePropertyChanged([CallerMemberName] string propertyName = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));

        private T _value;

        public T value
        {
            get => _value;
            set
            {
                _value = value;
                RaisePropertyChanged();
                RaisePropertyChanged(nameof(_value));
            }
        }

        public ViewModelValueChanged(T value)
        {
            _value = value;
        }

    }
}
```

それから、ボタンを押したときの処理をViewModelに書きたいので、`ICommand`を実装したクラスを用意します。これはさっきのを使いまわします。

できたらViewModel、レイアウトは以下のように。

```cs
namespace WPFViewModel
{
    class MainWindowViewModel
    {

        /// <summary>
        /// カウンター
        /// </summary>
        public ViewModelValueChanged<int> Count { get; } = new ViewModelValueChanged<int>(0);

        /// <summary>
        /// カウントアップボタンを押したとき
        /// </summary>
        public ViewModelButtonClick Countup { get; }

        public MainWindowViewModel()
        {
            Countup = new ViewModelButtonClick(() =>
            {
                Count.value++;
            });
        }

    }
}
```

```xml
<Window x:Class="WPFViewModel.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        xmlns:local="clr-namespace:WPFViewModel"
        mc:Ignorable="d"
        Title="MainWindow" Height="450" Width="800">

    <Window.DataContext>
        <local:MainWindowViewModel/>
    </Window.DataContext>

    <StackPanel Orientation="Vertical" HorizontalAlignment="Center" VerticalAlignment="Center">
        <TextBlock Text="{Binding Count.value ,UpdateSourceTrigger=PropertyChanged}" TextAlignment="Center" />
        <Button Command="{Binding Countup}">カウントアップ</Button>
    </StackPanel>
</Window>
```

以上です。

![Imgur](https://i.imgur.com/1ybF5lI.png)

# おわりに
ソースコード置いておきます。  

https://github.com/takusan23/WPFViewModel