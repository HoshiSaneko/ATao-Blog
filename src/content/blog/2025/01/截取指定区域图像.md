---
title: 截取指定区域图像
date: '2025年01月28日'
tags: ['代码片段', 'C#']
summary: 介绍如何实现区域截图功能，包含基本方法和应用场景。
---
### 开发背景

一般来说，我们可以通过`adb shell screencap`指令来截取android设备中的图像，但是获取到的是完整的图像。当我们需要进行图像识别的操作时，需要获取指定区域的图像来进行对比。

### 功能实现

#### C#实现

部分代码如下

```c#
/// <summary>
/// 对指定设备进行屏幕截图并裁剪指定区域，然后将裁剪后的图像保存到指定路径。
/// </summary>
/// <param name="x">裁剪区域左上角的x坐标。</param>
/// <param name="y">裁剪区域左上角的y坐标。</param>
/// <param name="width">裁剪区域的宽度。</param>
/// <param name="height">裁剪区域的高度。</param>
/// <param name="savePath">裁剪后图像的保存路径，默认值为"screencap.png"。</param>
public void ScreenCapAndCrop(int x, int y, int width, int height, string savePath = "screencap.png")
{
    Stream stream = NProcess.RunReturnStream($"adb -s {_serial} shell screencap -p");
    List<byte> data = ReadStreamAndConvertCRLF(stream);
    if (data.Count == 0)
    {
        Log.Error($"{_serial} screencap failed!");
        return;
    }
    // 将字节列表转换为字节数组
    byte[] imageData = [.. data];

    // 使用字节数组创建一个图像对象
    using MemoryStream ms = new(imageData);
    using Bitmap bitmap = new(ms);
    // 创建裁剪区域
    Rectangle cropRect = new(x, y, width, height);

    // 裁剪图像
    using Bitmap croppedImage = bitmap.Clone(cropRect, bitmap.PixelFormat);
    // 保存裁剪后的图像
    croppedImage.Save(savePath, ImageFormat.Png);
}

/// <summary>
/// 从给定的流中读取数据，并处理回车符（CR）和换行符（LF），将CRLF转换为LF
/// </summary>
/// <param name="stream">要从中读取数据的流</param>
/// <returns>处理后的字节列表，其中CRLF被转换为LF</returns>
private static List<byte> ReadStreamAndConvertCRLF(Stream stream)
{
    ArgumentNullException.ThrowIfNull(stream);

    List<byte> data = [];
    byte[] buffer = new byte[1024];
    int read;
    bool isCR = false;
    do
    {
        byte[] buf = new byte[1024];
        read = stream.Read(buf, 0, buf.Length);

        for (int i = 0; i < read; i++) //convert CRLF to LF
        {
            if (isCR && buf[i] == 0x0A)
            {
                isCR = false;
                data.RemoveAt(data.Count - 1);
                data.Add(buf[i]);
                continue;
            }
            isCR = buf[i] == 0x0D;
            data.Add(buf[i]);
        }
    }
    while (read > 0);
    return data;
}
```

- `_serial`为设备号，通过adb devices获取，具体代码就不列举了。

#### python实现

```python
import subprocess
from PIL import Image
import io

def get_screenshot_and_crop(x, y, width, height, output_path="screencap.png"):
    process = subprocess.Popen(
        ['adb', 'shell', 'screencap', '-p'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    stdout, stderr = process.communicate()

    # 处理 Windows 系统中的换行符问题
    if b'\r\n' in stdout:
        stdout = stdout.replace(b'\r\n', b'\n')

    # 将二进制数据转换为图像并裁剪
    image = Image.open(io.BytesIO(stdout))
    cropped_image = image.crop((x, y, x + width, y + height))
    # 保存裁剪后的图像
    cropped_image.save(output_path)
```
