---
title: WPF实现数据绑定
date: '2025年01月09日'
tags: ['代码片段', 'WPF']
summary: 本文介绍WPF中数据绑定的实现方法，包括INotifyPropertyChanged接口、数据上下文设置及MVVM模式应用。
---
### 前提

在 [WPF](https://learn.microsoft.com/zh-cn/dotnet/desktop/wpf/introduction-to-wpf?view=netframeworkdesktop-4.8&preserve-view=true) 中，数据绑定是一种强大的机制，用于将 UI 元素（如TextBox、Button等）与数据对象进行关联。

`INotifyPropertyChanged`接口允许数据对象在其属性值发生改变时通知 UI，从而使 UI 能够自动更新以反映最新的数据状态。

### 优势

- ​​自动更新 UI​​：当数据变化时，UI 自动刷新（无需手动调用 setText 或 update）
- ​减少样板代码:​​避免手动同步数据和控件状态
- ​支持 MVVM 模式​​：在 WPF 中，数据绑定是 MVVM（Model-View-ViewModel）的核心
- ​​数据验证 & 格式化​​：自动处理输入验证、数据转换（如日期格式化）

### ToolMainWindow中实现

1. ToolMainWindow.xaml.cs

```c#
public partial class ToolMainWindow : UserControl, INotifyPropertyChanged
{
    private int _count = 0;  // 数据源，也可以是自定义的数据模型

    public int Count
    {
        get { return _count; }
        set { _count = value; OnPropertyChanged(nameof(Count)); }  // 通知属性值已更改
    }

    public ToolMainWindow()
    {
        InitializeComponent();
        DataContext = this;  // 设置数据上下文
    }

    private void Button_Click(object sender, RoutedEventArgs e)
    {
        Count++;
    }

    public event PropertyChangedEventHandler? PropertyChanged;  // 实现接口

    protected virtual void OnPropertyChanged(string propertyName)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}
```

2. ToolMainWindow.xaml

```xml
<UserControl x:Class="demo.ToolMainWindow"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
             xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
             xmlns:local="clr-namespace:demo"
             mc:Ignorable="d"
             d:DataContext="{d:DesignInstance local:ToolMainWindow,
                                IsDesignTimeCreatable=False}"
             d:DesignHeight="450" d:DesignWidth="800">
    <StackPanel>
        <Button Content="click it!" Click="Button_Click"/>
        <TextBlock Text="{Binding Count, Mode=OneWay}"/>
    </StackPanel>
</UserControl>
```

-   实现INotifyPropertyChanged接口
-   数据上下文设置
-   数据源设置

### ToolMainWindowViewModel中实现

适用于需要多个数据模型，方便管理

1. ToolMainWindowViewModel.cs

```c#
public class ToolMainWindowViewModel : INotifyPropertyChanged
{
    private int _count = 0;  // 数据源，也可以是自定义的数据模型

    public int Count
    {
        get { return _count; }
        set { _count = value; OnPropertyChanged(nameof(Count)); }  // 通知属性值已更改
    }

    public event PropertyChangedEventHandler? PropertyChanged;  // 实现接口

    protected virtual void OnPropertyChanged(string propertyName)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}
```

2. ToolMainWindow.xaml.cs

```c#
public partial class ToolMainWindow : UserControl, INotifyPropertyChanged
{
    public ToolMainWindowViewModel ViewModel { get; set; }

    public ToolMainWindow()
    {
        ViewModel = new ToolMainWindowViewModel();
        InitializeComponent();
        DataContext = ViewModel;  // 设置数据上下文
    }

    private void Button_Click(object sender, RoutedEventArgs e)
    {
        ViewModel.Count++;
    }
}
```

3. ToolMainWindow.xaml

```xml
<UserControl x:Class="demo.ToolMainWindow"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
             xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
             xmlns:local="clr-namespace:demo"
             mc:Ignorable="d"
             d:DataContext="{d:DesignInstance local:ToolMainWindowViewModel,
                                IsDesignTimeCreatable=False}"
             d:DesignHeight="450" d:DesignWidth="800">
    <StackPanel>
        <Button Content="click it!" Click="Button_Click"/>
        <TextBlock Text="{Binding Count, Mode=OneWay}"/>
    </StackPanel>
</UserControl>
```
