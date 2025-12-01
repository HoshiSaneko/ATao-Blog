---
title: WPF实现本地化及运行时切换语言
date: '2025年06月19日'
tags: ['代码片段', 'WPF']
summary: 本文介绍如何在WPF中通过资源字典实现本地化，并支持运行时切换语言。
---
### 添加资源文件

找一个存放本地化资源文件的目录，例如`/Resources/Languages`目录下.

右键添加`资源字典`，这里简单命名为`Strings.zh-CN.xaml`.

添加需要翻译的字段

```xml
<ResourceDictionary
    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
    xmlns:system="clr-namespace:System;assembly=mscorlib">
    <!--  导航页面  -->
    <system:String x:Key="Navigation_Home">主页</system:String>
</ResourceDictionary>
```

再新建另一种语言的资源字典，例如`Strings.en-US.xaml`.

```xml
<ResourceDictionary
    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
    xmlns:system="clr-namespace:System;assembly=mscorlib">
    <!-- Navigation -->
    <system:String x:Key="Navigation_Home">Home</system:String>
</ResourceDictionary>
```

### 本地化管理

新建一个类`LanguageService`，用于管理本地化语言。

```c#
public static class LanguageService
{
    private static ResourceDictionary _currentDictionary;

    public static void ChangeLanguage(string languageCode)
    {
        // 构建资源路径 (根据实际程序集名调整)
        string path = $"pack://application:,,,/TWPFX_Gallery;component/Resources/Languages/Strings.{languageCode}.xaml";

        // 移除旧语言资源
        if (_currentDictionary != null)
        {
            Application.Current.Resources.MergedDictionaries.Remove(_currentDictionary);
        }

        // 加载新语言资源
        _currentDictionary = new ResourceDictionary { Source = new Uri(path) };
        Application.Current.Resources.MergedDictionaries.Add(_currentDictionary);
    }

    // 可选：自动检测系统语言
    public static void Initialize()
    {
        string sysLang = CultureInfo.CurrentCulture.Name;
        ChangeLanguage(sysLang == "zh-CN" ? "zh-CN" : "en-US");
    }
}
```

### XAML中使用

使用`DynamicResource`才可以支持运行时动态更新

```xml
<ui:Button Content="{DynamicResource Navigation_Home}" />
```

### C#中使用

```c#
button.Content = new DynamicResourceExtension("Navigation_Home").ProvideValue(null);
```

### 切换语言

```c#
LanguageService.ChangeLanguage("en-US");
```
