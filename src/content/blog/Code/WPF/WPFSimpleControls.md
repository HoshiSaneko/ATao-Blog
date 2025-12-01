---
title: WPF创建简单用户控件
date: '2025年05月13日'
tags: ['代码片段', 'WPF']
summary: 介绍如何在WPF中创建和使用简单用户控件，包含依赖属性和自定义事件的实现方法。
---
## 基本概念

`用户控件(User Control)`​​是一种可重用的UI组件，通过组合现有控件来创建自定义功能模块。它本质上是一个容器，可以包含其他控件并封装其交互逻辑。

## 主要特点

- ​继承自UserControl类​​.
- ​XAML+代码后置.
- 可重用​​的独立功能单元.
- 可自定义属性、方法和事件​.

## 核心优势

1.  开发效率提升
2.  维护性增强
3.  功能解耦

## 示例

假设需要封装一个`FileSelectorBox`控件，用来实现文件选择的功能。
- 控件组成：
由一个TextBlock和一个Button组成。
- 依赖属性：
FilePath(当前选择的文件路径)
- 自定义事件：
OnFileChanged(当文件路径发生改变)

#### 创建用户控件

右键项目，选择`添加`，选择`用户控件`

![创建控件](https://cdn.atao.cyou/Blog/blog_250513_135731.png){caption:创建控件}

#### 组合现有控件

```xml
<Grid>
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*"/>
        <ColumnDefinition Width="Auto"/>
    </Grid.ColumnDefinitions>
    <TextBlock Grid.Column="0"/>
    <Button Grid.Column="1" Content="选择" Width="71"/>
</Grid>
```

#### 添加依赖属性和自定义事件

```c#
public event EventHandler OnFileChanged;

public static readonly DependencyProperty FilePathProperty =
DependencyProperty.Register(
    "FilePath",     // 属性名称
    typeof(string),   // 属性类型
    typeof(FileSelectorBox), // 所属类型
    new PropertyMetadata(null, OnValuesChanged)); // 默认值，添加回调方法

public string FilePath
{
    get { return (string)GetValue(FilePathProperty); }
    set { SetValue(FilePathProperty, value); OnFileChanged?.Invoke(this, EventArgs.Empty); }
}

private static void OnValuesChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
{
    // 回调方法
    // 外部修改依赖属性的值时，将在这里回调...
}
```

当FilePath被修改时，需要修改TextBlock的内容

```xml
<TextBlock Grid.Column="0" Text="{Binding FilePath,
          RelativeSource={RelativeSource AncestorType=UserControl}}" />
```

#### 按钮功能

当按钮点击时，需要弹出一个文件选择框来选择文件

```xml
<Button Grid.Column="1" Content="选择" Width="71" Click="Button_Click" />
```

```c#
private void Button_Click(object sender, RoutedEventArgs e)
{
    Button button = (Button)sender;
    switch(button.Content)
    {
        case "选择":
            OpenFileDialog openFileDialog = new()
            {
                Title = "选择文件",
                Filter = "All File|*.*"
            };
            openFileDialog.ShowDialog();
            FilePath = openFileDialog.FileName;
            break;
    }
}
```

#### 控件使用

```xml
<Grid>
    <local:FileSelectorBox  FilePath="{Binding ExternalFilePath, Mode=TwoWay}" OnFileChanged="FileSelectorBox_OnFileChanged"/>
</Grid>
```

```c#
public partial class ToolMainWindow : UserControl, INotifyPropertyChanged
{
    private string _externalFilePath = string.Empty;  // 数据源，也可以是自定义的数据模型

    public string ExternalFilePath
    {
        get { return _externalFilePath; }
        set { _externalFilePath = value; OnPropertyChanged(nameof(ExternalFilePath)); }  // 通知属性值已更改
    }

    public ToolMainWindow()
    {
        InitializeComponent();
        DataContext = this;  // 设置数据上下文
    }

    public event PropertyChangedEventHandler? PropertyChanged;  // 实现接口

    protected virtual void OnPropertyChanged(string propertyName)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }

    private void FileSelectorBox_OnFileChanged(object sender, EventArgs e)
    {
        Growl.Info($"ExternalFilePath发生变化:{ExternalFilePath}");
    }
}
```

![图片](https://cdn.atao.cyou/Blog/blog_250513_153823.png)

#### 资源下载

[下载链接](https://www.taonotespace.com/download/UserControlDemo.zip){material-symbols:download}
