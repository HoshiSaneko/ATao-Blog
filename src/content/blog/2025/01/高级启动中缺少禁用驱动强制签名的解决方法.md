---
title: 高级启动中缺少禁用驱动强制签名的解决方法
date: '2025年01月03日'
tags: ["经验分享"]
summary: 介绍了如何在 Windows 系统中禁用驱动强制签名，以便安装未签名的驱动程序。
---
### 问题背景

系统高级启动选项中，有时找不到`禁用驱动强制签名`的选项。

### 问题原因

一般来说，是由于恢复环境**WINER.wim**的丢失造成的。该镜像存在于C盘根目录的Recovery文件夹，该文件夹被删除或精简。

### 解决方法

1.  首先<kbd>Win</kbd> + <kbd>X</kbd> 打开终端管理员

2.  输入 `reagentc /info` 并回车，查看WINER.wim文件是否真的丢失

![恢复环境](https://cdn.atao.cyou/Blog/blog_250116_232532.png){caption:恢复环境}

如图所示`Windows RE位置`为空，说明文件丢失。

3.  在系统盘根目录新建名为Recovery的文件夹，然后再在Recovery文件夹内新建名为WindowsRE的文件夹。完整路径即为**C:\Recovery\WindowsRE**。

4.  从微软原版Windows ISO镜像中获取WinRE.wim映像，直接提取镜像中install.wim文件。或者也可以从没有丢失WINRE.wim镜像的电脑中拷贝一份。放在C:\Recovery\WindowsRE目录下。

5.  再次WIN+X 打开终端（管理员），输入**reagentc /setreimage /path C:\Recovery\WindowsRE** 回车，之后再输入**reagentc /enable** 回车

```bash
reagentc /setreimage /path C:\Recovery\WindowsRE
reagentc /enable
```

![启用Windows RE](https://cdn.atao.cyou/Blog/blog_250116_232659.png){caption:启用Windows RE}

操作完成后，就修复了windows的恢复环境。再进入高级启动选项中，就可以看到"禁用驱动强制签名"等选项。
