---
title: 安装adb环境
date: '2025年01月06日'
tags: ['经验分享']
summary: 本文简要介绍了在 Windows 系统上安装和配置 ADB 工具的方法。
---
### 介绍

`adb（Android Debug Bridge）`是Android开发工具包（SDK）中的一个命令行工具，用于在计算机和Android设备之间进行通信和交互。它允许开发人员安装、调试和管理Android应用程序，以及在设备和计算机之间传输文件。

### 安装步骤

#### 1. 安装SDK

从android官方网站（[SDK 平台工具版本说明  | Android Studio  | Android Developers](https://developer.android.google.cn/tools/releases/platform-tools?hl=zh-cn)）中下载Android SDK，可以仅下载SDK中的**Platform-Tools**，Platform-Tools包含了adb与fastboot。

#### 2. 设置环境变量

为了使系统中的任意位置都能使用adb，需要对环境变量进行设置。

右键点击**此电脑**或**计算机**，选择**属性**，进入**高级系统设置**，点击**环境变量**。在系统变量栏中，找到**Path**并双击。

点击**新建**，添加**Platform-Tools**路径，如下图。

![](https://cdn.atao.cyou/Blog/blog_250116_232230.png)

保存。

打开命令提示符(cmd)，输入**adb version**，如果返回类似下面的结果，则表示配置成功。

```bash
C:\Users\qiata>adb version
Android Debug Bridge version 1.0.41
Version 35.0.2-12147458
Installed as C:\platform-tools\adb.exe
Running on Windows 10.0.22631
```
