---
title: WPF依赖属性的注册与绑定
date: '2025年02月11日'
tags: ['代码片段', 'WPF']
summary: 本文介绍WPF依赖属性的注册与绑定方法。
---
### 说明

**依赖属性**是 WPF 中的一种特殊属性，它扩展了传统的 .NET 属性，提供了更多功能，如数据绑定、动画、样式和资源支持。依赖属性的值不存储在对象本身，而是由 WPF 属性系统管理，这使得它们能够支持继承、默认值和值优先级等特性。

### 和普通属性区别

|              | **普通属性**                             | **依赖属性**                                      |
| ------------ | ---------------------------------------- | ------------------------------------------------- |
| **存储方式** | 值直接存储在类的字段中                   | 值由 WPF 属性系统管理，存储在全局的依赖属性系统中 |
| **功能支持** | 功能有限，不支持数据绑定、动画等高级特性 | 支持数据绑定、动画、样式、资源等高级功能          |
| **值优先级** | 只有一个值来源                           | 支持多个值来源，并根据优先级决定最终值            |

### 注册

依赖属性通过 `DependencyProperty.Register` 方法注册。以下是一个简单的例子：

```c#
public class LineChart : Control
{
    public static readonly DependencyProperty ValuesProperty =
        DependencyProperty.Register(
            "Values",     // 属性名称
            typeof(ObservableCollection<double>),   // 属性类型
            typeof(LineChart), // 所属类型
            new PropertyMetadata(null, OnValuesChanged)); // 默认值，添加回调方法

    public ObservableCollection<double> Values
    {
        get { return (ObservableCollection<double>)GetValue(ValuesProperty); }
        set { SetValue(ValuesProperty, value); }
    }

    private static void OnValuesChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
       // 回调方法
       var chart = (LineChart)d;
        var newValues = (ObservableCollection<double>)e.NewValue;
        // 更新 Series 的 Values
        if (chart.Series is LineSeries<double> series)
        {
            series.Values = newValues;
        }
    }
}
```

### 绑定

```xml
<livecharts:LineChart Values="{Binding Values}"/>
```

在这个例子中`LineChart`控件的`Values` 绑定到 `DataContext` 中的 `Values`。

### 总结

-   **依赖属性**是 WPF 中用于支持高级功能的特殊属性。
-   通过 `DependencyProperty.Register` 方法注册依赖属性。
-   依赖属性支持数据绑定、动画、样式等高级功能。
-   依赖属性的值由 WPF 属性系统管理，支持多个值来源和优先级。

通过依赖属性，WPF 提供了强大的 UI 开发能力，使得开发者能够更灵活地构建复杂的用户界面。
