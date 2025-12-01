---
title: C#资源释放管理
date: '2025年02月08日'
tags: ['代码片段', 'C#']
summary: 本文介绍如何通过实现IDisposable接口规范释放非托管资源，避免资源泄漏，并附C#代码示例和用法说明。
---
## 背景

在 .NET  中，`IDisposable`接口是一个非常重要的接口，它主要用于管理非托管资源的释放。非托管资源是指那些不受 .NET 垃圾回收器（GC）管理的资源，例如`文件句柄`、`数据库连接`、`网络套接字`等。

当你使用完这些资源后，需要及时释放它们以避免资源泄漏。`IDisposable`接口提供了一种标准的方式来实现资源的释放逻辑。

## 举例

### 实现接口

```c#
/// <summary>
/// YOLOv8 目标检测预测器，提供基于ONNX模型的物体检测功能
/// </summary>
public class YoloV8Predictor: IDisposable
{
    private readonly Yolo yolo;   // yolo预测器

    public YoloV8Predictor()
    {
        // 初始化预测器
    }

    public void Detect()
    {
        // ... 目标检测
    }
    private bool disposedValue;
    // 受保护的虚方法，用于释放资源
    protected virtual void Dispose(bool disposing)
    {
        if (!disposedValue)
        {
            if (disposing)
            {
                // 释放托管资源
                yolo.Dispose();
            }
            // 释放非托管资源
            disposedValue = true;
        }
    }
	// 实现 IDisposable 接口的 Dispose 方法
    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }
     // 终结器，用于在对象被垃圾回收时释放资源
    ~YoloV8Predictor()
    {
        Dispose(false);
    }
}
```

-   `Dispose` 方法调用了受保护的虚方法 `Dispose(bool disposing)`，根据 `disposedValue` 参数的值来决定是否释放托管资源。
-   提供了一个终结器 `~YoloV8Predictor()`，用于在对象被垃圾回收时释放非托管资源。

### 调用

```c#
using YoloV8Predictor yolov8 = new();  // 使用 using 语句确保资源被正确释放
yolov8.Detect();
```

## 总结

`IDisposable` 接口为管理非托管资源提供了一种标准的方式，通过实现该接口并在 `Dispose` 方法中编写释放资源的代码，可以确保资源在不再使用时被及时释放，避免资源泄漏。同时，使用 `using` 语句可以简化资源的管理，确保资源在作用域结束时自动释放。
