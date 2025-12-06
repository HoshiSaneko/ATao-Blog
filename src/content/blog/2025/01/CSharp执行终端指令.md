---
title: C#执行终端指令
date: '2025年01月06日'
tags: ['代码片段', 'C#']
summary: 本文介绍如何用C#执行终端命令并获取输出结果，支持返回字符串和流，适用于自动化脚本和系统操作场景。
---
### 开发背景

执行终端指令，并返回结果

### 功能实现

```c#
public class NProcess
{

    /// <summary>
    /// 执行cmd命令
    /// </summary>
    /// <param name="command">cmd命令</param>
    /// <param name="useUTF8">是否使用utf-8编码</param>
    /// <returns>包含命令执行结果的Process对象</returns>
    public static Process Run(string command, bool useUTF8=true)
    {
        ProcessStartInfo startInfo = new()
        {
            FileName = "cmd.exe",
            Arguments = $"/c {command}",
            UseShellExecute = false,
            RedirectStandardOutput = true,
            CreateNoWindow = true, // 不显示cmd窗口
        };
        if (useUTF8)
        {
            startInfo.StandardOutputEncoding = Encoding.UTF8;
        }
        using Process process = new() { StartInfo = startInfo };
        process.Start();
        return process;
    }

    /// <summary>
    /// 运行指定的命令行命令，并返回命令的输出结果。
    /// </summary>
    /// <param name="command">要运行的命令行命令。</param>
    /// <param name="useUTF8">是否使用utf-8编码。</param>
    /// <returns>返回命令的输出结果。</returns>
    public static string RunReturnString(string command, bool useUTF8=true)
    {
        ProcessStartInfo startInfo = new()
        {
            FileName = "cmd.exe",
            Arguments = $"/c {command}",
            UseShellExecute = false,
            RedirectStandardOutput = true,
            CreateNoWindow = true, // 不显示cmd窗口
        };
        if (useUTF8)
            startInfo.StandardOutputEncoding = Encoding.UTF8;
        using Process process = new() { StartInfo = startInfo };
        process.Start();
        // 同步读取输出
        string result = process.StandardOutput.ReadToEnd();
        // 等待进程退出
        process.WaitForExit();
        // 返回结果
        return result;
    }

    /// <summary>
    /// 运行指定的命令行命令，并返回命令的输出流。
    /// </summary>
    /// <param name="command">要运行的命令行命令。</param>
    /// <returns>返回命令的输出流。</returns>
    public static Stream RunReturnStream(string command)
    {
        ProcessStartInfo startInfo = new()
        {
            FileName = "cmd.exe",
            Arguments = $"/c {command}",
            UseShellExecute = false,
            RedirectStandardOutput = true,
            CreateNoWindow = true, // 不显示cmd窗口
        };
        using Process process = new() { StartInfo = startInfo };
        process.Start();
        var stream = process.StandardOutput.BaseStream;
        return stream;
    }

}
```
