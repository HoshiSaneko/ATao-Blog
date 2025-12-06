---
title: adb相关功能封装
date: '2025年01月28日'
tags: ['代码片段', 'C#']
summary: 介绍如何实现区域截图功能，包含基本方法和应用场景。
---
### 开发背景

在 Android 自动化测试体系中，ADB（Android Debug Bridge） 作为连接 PC 与移动设备的关键纽带，发挥着不可或缺的作用。

在实际操作中，我们需频繁调用各类 ADB 命令，但每一次调用都涉及`指令发送`、`结果回传`以及`结果解析处理`等一系列繁杂流程。

为简化操作流程、提升测试效率，我对常用的 ADB 指令进行了系统性封装。

### 功能实现

```c#
public partial class ADB
{
    private readonly string? _serial;
    private int _width = -1;
    private int _height = -1;

    /// <summary>
    /// 获取所有已连接的设备ID列表。
    /// </summary>
    /// <returns>包含所有已连接设备ID的列表。</returns>
    public static List<string> Devices()
    {
        List<string> deviceIds = [];
        MatchCollection matches = PackageNameRegex().Matches(NProcess.RunReturnString("adb devices"));
        // 提取所有匹配的设备ID
        foreach (Match match in matches)
        {
            deviceIds.Add(match.Groups[1].Value);
        }
        return deviceIds;
    }

    /// <summary>
    /// 构造函数
    /// </summary>
    /// <param name="serial">设备序列号，如果未指定，则使用第一个已连接的设备,若没有设备，则抛出InvalidOperationException异常</param>
    public ADB(string serial = "")
    {
        if (string.IsNullOrEmpty(serial))
        {
            List<string> devices = Devices();
            if (devices.Count > 0)
            {
                _serial = devices[0]; // 如果有设备连接，则使用第一个设备
            }
            else
            {
                throw new InvalidOperationException("no devices/emulators found");
            }
        }
        else
        {
            _serial = serial;
        }
        WindowsSize(out _width, out _height);
    }

    /// <summary>
    /// 获取当前实例所关联的设备序列号。
    /// </summary>
    /// <returns>当前实例所关联的设备序列号。</returns>
    public string? Serial()
    {
        return _serial;
    }

    /// <summary>
    /// 执行Shell命令。
    /// </summary>
    /// <param name="cmd">要在设备上执行的Shell命令。</param>
    /// <returns>返回命令执行的结果字符串。</returns>
    public string Shell(string cmd)
    {
        return NProcess.RunReturnString($"adb -s {_serial} shell {cmd}");
    }

    /// <summary>
    /// 获取当前Windows窗口的尺寸。
    /// </summary>
    /// <param name="width">输出参数，用于存储窗口的宽度。</param>
    /// <param name="height">输出参数，用于存储窗口的高度。</param>
    public void WindowsSize(out int width, out int height)
    {
        width = -1;
        height = -1;
        string r = Shell("wm size");

        // 使用正则表达式提取数字
        var regex = WindowsSizeRegex();
        var match = regex.Match(r);

        if (match.Success)
        {
            width = Convert.ToInt32(match.Groups[1].Value);
            height = Convert.ToInt32(match.Groups[2].Value);
        }
    }

    /// <summary>
    /// 将相对坐标转换为绝对坐标。
    /// </summary>
    /// <param name="x">相对X坐标。</param>
    /// <param name="y">相对Y坐标。</param>
    /// <param name="absX">输出参数，用于存储转换后的绝对X坐标。</param>
    /// <param name="absY">输出参数，用于存储转换后的绝对Y坐标。</param>
    public void Rel2Abs(double x, double y, out double absX, out double absY)
    {
        absX = x < 1 ? x * _width : x;
        absY = y < 1 ? y * _height : y;
        // 保留两位小数
        absX = Math.Round(absX, 2);
        absY = Math.Round(absY, 2);
    }

    /// <summary>
    /// 将文件推送到指定设备上。
    /// </summary>
    /// <param name="src">资源路径。</param>
    /// <param name="dst">目标路径。</param>
    /// <returns>如果推送成功,则返回true;否则返回false</returns>
    public bool Push(string src, string dst)
    {
        Log.Info($"Push: {src} => {_serial}:{dst}");
        return NProcess.RunReturnString($"adb -s {_serial} push {src} {dst}").Contains("file pushed");
    }

    /// <summary>
    /// 将设备上的文件拉取到本地。
    /// </summary>
    /// <param name="src">资源路径。</param>
    /// <param name="dst">目标路径。</param>
    /// <returns>如果拉取成功,则返回true;否则返回false</returns>
    public bool Pull(string src, string dst = "")
    {
        return NProcess.RunReturnString($"adb -s {_serial} pull {src} {dst}").Contains("file pulled");
    }

    /// <summary>
    /// 安装APK
    /// </summary>
    /// <param name="apkPath">APK文件的路径。这是要安装到设备上的APK文件的本地路径。</param>
    /// <param name="isReplace">如果为true，则允许替换已存在的应用。</param>
    /// <param name="isDemotion">如果为true，则允许降级安装（即安装旧版本的应用）。</param>
    /// <param name="isGrant">如果为true，则在安装过程中自动授予所有运行时权限。</param>
    /// <returns>如果APK文件成功安装到设备，则返回true；否则返回false。</returns>
    public bool Install(string apkPath, bool isReplace = true, bool isDemotion = false, bool isGrant = false)
    {
        string r = isReplace ? "-r" : "";
        string d = isDemotion ? "-d" : "";
        string g = isGrant ? "-g" : "";
        string command = $"adb -s {_serial} install {r} {d} {g} \"{apkPath}\"";
        return NProcess.RunReturnString(command).Contains("Success");
    }

    /// <summary>
    /// 卸载APK
    /// </summary>
    /// <param name="package">应用程序的包名</param>
    /// <returns>如果应用程序成功卸载，则返回true；否则返回false。</returns>
    public bool Uninstall(string package)
    {
        return NProcess.RunReturnString($"adb -s {_serial} uninstall {package}").Contains("Success");
    }

    /// <summary>
    /// 获取当前应用程序的包名和活动名
    /// </summary>
    /// <returns>包含包名和活动名的元组。如果无法获取，则包名或活动名可能为空字符串。</returns>
    public (string, string) AppCurrent()
    {
        string package = string.Empty, activity = string.Empty;
        string mCurrentFocus = Shell($"dumpsys activity activities|findstr \"mCurrentFocus\"");
        // 匹配包名的正则表达式
        Match packageNameMatch = Regex.Match(mCurrentFocus, @"(?<=u0\s)[^\s/]+");
        if (packageNameMatch.Success)
        {
            package = packageNameMatch.Value;
        }
        // 匹配活动名的正则表达式（假设它紧跟在包名之后，由斜杠分隔）
        Match activityNameMatch = Regex.Match(mCurrentFocus, @"(?<=/)[^\s}]+");
        if (activityNameMatch.Success)
        {
            activity = activityNameMatch.Value;
        }
        return (package, activity);
    }

    /// <summary>
    /// 启动指定的应用
    /// </summary>
    /// <param name="package">要启动的应用包名</param>
    /// <param name="activity">可选。要启动的具体活动名（完整类名），如果为空则尝试启动应用的主活动</param>
    /// <param name="useMonkey">是否使用Monkey工具启动应用。默认不使用</param>
    /// <param name="isWait">是否在启动后等待应用响应。默认不等待</param>
    /// <param name="waitTimeout">等待超时时间（秒），仅当isWait为true时有效。默认为30秒</param>
    public void AppStart(string package, string activity = "", bool useMonkey = false, bool isWait = false, int waitTimeout = 30)
    {
        if (useMonkey)
        {
            Shell($"monkey -p {package} -c android.intent.category.LAUNCHER 1");
        }
        else
        {
            if (string.IsNullOrEmpty(activity))
            {
                Shell($"am start -n {package}");
            }
            else
            {
                Shell($"am start -n {package}/{activity}");
            }
        }
        if (!isWait)
        {
            return;
        }
        double current = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        while (DateTimeOffset.UtcNow.ToUnixTimeSeconds() - current < waitTimeout)
        {
            if (AppCurrent().Item1 == package)
            {
                return;
            }
        }
    }

    /// <summary>
    /// 停止指定的应用或当前前台应用
    /// </summary>
    /// <param name="package">要停止的应用的包名。如果为空或null，则停止当前前台应用。</param>
    public void AppStop(string package = "")
    {
        string stopPackage = string.IsNullOrEmpty(package) ? AppCurrent().Item1 : package;
        Shell($"am force-stop {stopPackage}");
    }

    /// <summary>
    /// 清除应用的数据和缓存
    /// </summary>
    /// <param name="package">要清除的应用的包名。如果为空或null，则清除当前前台应用</param>
    public void AppClear(string package = "")
    {
        string stopPackage = string.IsNullOrEmpty(package) ? AppCurrent().Item1 : package;
        Shell($"pm clear {stopPackage}");
    }

    /// <summary>
    /// 获取当前设备的转发端口。如果已存在转发端口，则返回该端口；否则，随机分配一个端口并进行转发。
    /// </summary>
    /// <returns>返回设备的转发端口号，如果未找到或分配失败，则返回"-1"。</returns>
    public string GetForwardPort()
    {
        // 获取已经存在的转发端口
        string forwardList = NProcess.RunReturnString($"adb forward --list");
        Match match = Regex.Match(forwardList, @$"{_serial} tcp:(\d+) tcp:9008");
        if (match.Success)
        {
            return match.Groups[1].Value;
        }
        // 未找到转发端口，随机一个端口
        Random random = new();
        string port = random.Next(1000, 10000).ToString();
        NProcess.RunReturnString($"adb -s {_serial} forward tcp:{port} tcp:9008");
        // 再检查一遍
        forwardList = NProcess.RunReturnString($"adb forward --list");
        match = Regex.Match(forwardList, @$"{_serial} tcp:(\d+) tcp:9008");
        if (match.Success)
        {
            return match.Groups[1].Value;
        }
        return "-1";
    }

    /// <summary>
    /// 检查指定文件是否存在。
    /// </summary>
    /// <param name="file">要检查的文件路径。</param>
    /// <returns>如果文件存在，则返回true；否则返回false。</returns>
    public bool FileExists(string file)
    {
        return !String.IsNullOrEmpty(Shell($"find {file} -type f"));
    }

    /// <summary>
    /// 删除指定的文件或目录。
    /// </summary>
    /// <param name="file">要删除的文件或目录路径。</param>
    public void FileRemove(string file)
    {
        Shell($"rm -rf {file}");
    }

    /// <summary>
    /// 获取设备的WiFi状态
    /// </summary>
    /// <returns>如果WiFi已开启，则返回true；否则返回false</returns>
    public bool GetWifiState()
    {
        return Shell("settings get global wifi_on").Contains('1');
    }

    /// <summary>
    /// 获取设备的蓝牙状态
    /// </summary>
    /// <returns>如果蓝牙已开启，则返回true；否则返回false</returns>
    public bool GetBluetoothState()
    {
        return Shell("settings get global bluetooth_on").Contains('1');
    }

    /// <summary>
    /// 获取设备的飞行模式状态
    /// </summary>
    /// <returns>如果飞行模式已开启，则返回true；否则返回false</returns>
    public bool GetAirplaneState()
    {
        return Shell($"settings get global airplane_mode_on").Contains('1');
    }

    /// <summary>
    /// 获取设备的锁屏时间
    /// </summary>
    /// <returns>设置的锁屏时间，单位ms</returns>
    public string GetScreenOffTimeout()
    {
        return Shell($"settings get system screen_off_timeout");
    }

    /// <summary>
    /// 设置设备的锁屏时间
    /// </summary>
    /// <param name="timeout">锁屏时间超时时间，单位ms</param>
    public void SetScreenOffTimeout(int timeout)
    {
        Shell($"settings put system screen_off_timeout {timeout}");
    }

    /// <summary>
    /// 捕获指定设备的屏幕截图，并将其保存到指定的文件路径。
    /// </summary>
    /// <param name="savePath">屏幕截图文件的保存路径。如果未指定，则默认为"screencap.png"。</param>
    public void ScreenCap(string savePath = "screencap.png")
    {
        Stream stream = NProcess.RunReturnStream($"adb -s {_serial} shell screencap -p");
        List<byte> data = ReadStreamAndConvertCRLF(stream);
        if (data.Count == 0)
        {
            Log.Error($"{_serial} screencap failed!");
            return;
        }
        using BinaryWriter writer = new(File.Open(savePath, FileMode.Create));
        writer.Write(data.ToArray());
    }

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

    [GeneratedRegex(@"\s(\S+)\tdevice")]
    private static partial Regex PackageNameRegex();

    [GeneratedRegex(@"(\d+)\s*x\s*(\d+)")]
    private static partial Regex WindowsSizeRegex();
}
```

### 方法介绍

| 方法名 | 功能描述 |
|--------|---------|
| **Device** | 获取android设备列表 |
| **Shell** | 执行Shell命令 |
| **WindowsSize** | 获取当前Windows窗口的尺寸 |
| **Rel2Abs** | 将相对坐标转化为绝对坐标 |
| **Push** | 将文件推送到指定设备上 |
| **Pull** | 将设备上的文件拉取到本地 |
| **Install** | 安装APK |
| **Uninstall** | 卸载APK |
| **AppCurrent** | 获取当前应用程序的包名和活动名 |
| **AppStart** | 启动指定的应用 |
| **AppStop** | 停止指定的应用或当前前台应用 |
| **AppClear** | 清除应用的数据和缓存 |
| **GetForwardPort** | 获取当前设备的转发端口 |
| **FileExists** | 检查指定文件是否存在 |
| **FileRemove** | 删除指定的文件或目录 |
| **GetWifiState** | 获取设备的WiFi状态 |
| **GetBluetoothState** | 获取设备的蓝牙状态 |
| **GetAirplaneState** | 获取设备的飞行模式状态 |
| **GetScreenOffTimeout** | 获取设备的锁屏时间 |
| **SetScreenOffTimeout** | 设置设备的锁屏时间 |
| **ScreenCap** | 屏幕截图 |
| **ScreenCapAndCrop** | 区域截屏 |
