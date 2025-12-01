---
title: WPF错误的依赖属性仍然运行问题
date: '2025年05月14日'
tags: ['经验分享']
summary: 本文简要说明了 WPF 中依赖属性声明错误的常见原因及解决方法。
---
### 前提

在 WPF 开发中，依赖属性（DependencyProperty）是一项核心技术，它让属性具有数据绑定、样式继承等强大功能。

但在实际编码过程中，开发者可能会遇到一些 “奇怪” 的现象：

> 即便代码写法不符合常规认知，程序依然能正常运行。

本文将通过一个实际案例，深入剖析这种异常现象背后的原理，帮助大家更好地理解 WPF 依赖属性系统。

### 问题代码复现

以下是一段定义`FileSelectorBox`用户控件依赖属性的代码：

```c#
public partial class FileSelectorBox : UserControl
{

    public static readonly DependencyProperty PropertyAProperty =
    DependencyProperty.Register(
        "PropertyA",     // 属性名称
        typeof(bool),   // 属性类型
        typeof(FileSelectorBox), // 所属类型
        new PropertyMetadata(false, OnValuesChanged)); // 默认值，添加回调方法

    public bool PropertyA
    {
        get { return (bool)GetValue(PropertyAProperty); }
        set { SetValue(PropertyAProperty, value);  }
    }

    public static readonly DependencyProperty PropertyBProperty =
    DependencyProperty.Register(
        "PropertyB",     // 属性名称
        typeof(bool),   // 属性类型
        typeof(FileSelectorBox), // 所属类型
        new PropertyMetadata(false, OnValuesChanged)); // 默认值，添加回调方法

    public bool PropertyB
    {
        get { return (bool)GetValue(PropertyAProperty); }
        set { SetValue(PropertyAProperty, value); }
    }

    // ....
}
```

乍一看，`PropertyB`属性的get和set方法中，调用GetValue和SetValue时使用的是`PropertyAProperty`，而不是正确的`PropertyBProperty`。

按照常理，这样的代码应该会导致属性值错乱。但实际运行时却没有立即暴露出问题，这是为什么呢？

### 现象背后的原理

#### 依赖属性系统的底层机制

WPF 依赖属性系统的底层存储由`DependencyObject`类维护，通过`DependencyProperty`对象作为唯一标识（如PropertyAProperty和PropertyBProperty）来访问和存储属性值。系统在操作属性时，直接通过这些`DependencyProperty`键进行查找和修改，与 CLR 属性包装器的名称和实现细节并无直接关联。

#### XAML 解析的特性

当我们在 XAML 中设置属性，例如<FileSelectorBox PropertyB="True" />，XAML 解析器会直接调用SetValue(PropertyBProperty, true)，它绕过了 CLR 属性包装器，直接操作底层的依赖属性存储。因此，即使 CLR 属性包装器中的get和set方法存在错误引用，XAML 解析器依然能正确设置PropertyBProperty的值。

#### 代码访问的矛盾

虽然 XAML 解析能正确设置属性值，但当在 C# 代码中直接访问PropertyB属性时，问题就会暴露出来。例如：

```c#
FileSelectorBox fileSelectorBox = new();
fileSelectorBox.PropertyB = true; // 实际修改的是PropertyAProperty的值
bool value = fileSelectorBox.PropertyB; // 实际获取的是PropertyAProperty的值
```

这种不一致的行为，会导致属性值的读写混乱，尤其在复杂的业务逻辑和数据绑定场景中，可能引发难以排查的 Bug。

### 总结

WPF 的依赖属性系统实际上有两层结构：

- 底层存储：由DependencyObject类内部维护的哈希表，通过DependencyProperty键访问（例如PropertyBProperty）

- 上层接口：为了让依赖属性能够像普通属性一样被 C# 代码使用，需要提供一个 CLR 属性包装器

xaml直接访问的依赖属性的底层存储，因此绕过了上层的CLR包装器。在开发过程中，我们必须确保 CLR 属性包装器正确地映射到对应的 DependencyProperty，以避免潜在的错误。
