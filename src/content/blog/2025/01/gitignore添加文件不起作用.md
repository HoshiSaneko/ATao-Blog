---
title: gitignore添加文件不起作用
date: '2025年01月15日'
tags: ['经验分享']
summary: 本文介绍.gitignore文件添加后不生效的原因及解决方法。
---
### 问题描述

通过git进行版本管理时，可以通过`.gitignore`文件来配置哪些文件或目录应该被忽略，不纳入版本控制系统的管理范围。但是有时在`.gitignore`文件中添加对应目录或文件后，在Sourcetree的未暂存文件中仍能看到。

### 可能原因

可能在之前已经将该目录或文件添加到了 Git 的暂存区或已经进行了版本控制，所以 `.gitignore` 的规则对这些文件暂时不起作用。

### 解决方法

通过以下命令清除已经添加到暂存区的目录或文件。

```powershell
git rm -r --cached EEITest/app/build
```

:::alert{type:warning, title:警告}
**EEITest/app/build**只是举例
:::
