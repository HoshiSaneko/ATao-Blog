---
title: MCDR安装与使用
date: '2025年03月12日'
tags: ['minecraft']
summary: 本文简要介绍了MCDR的安装与使用方法。
---
### 介绍

MCDR（MCDaemon Reforged）是由[Fallen_Breath](https://github.com/MCDReforged/MCDReforged)主导维护的一个基于Python的工具，用于管理Minecraft服务器。

它通过插件系统提供丰富的功能扩展，如自动备份、玩家高亮等。

:::link-card{url:https://mcdreforged.com, title:MCDReforged, description:这是一个基于 Python 的 Minecraft 服务端控制工具, image:https://cdn.atao.cyou/Icon/mcdreforged.svg}
:::

### 原理

- MCDR通过`Popen`来启动Minecraft服务端作为子进程，进而控制服务端的输入与输出流。

- MCDR通过解析服务端的输出，来抽象为不同的事件，并将它们分派给插件以进行响应。

- 借助Minecraft的命令系统，MCDR也可以通过标准输入流发送Minecraft命令以操作Minecraft服务端。

![原理图](https://cdn.atao.cyou/Blog/blog_250312_210827.png){caption:原理图, width: 70%}

### 安装

1. 打开服务器后端，直接通过pip进行安装

```bash
pip3 install mcdreforged
```

2. 在服务端中，新建一个文件夹(例如mcdr_server)用来存放脚本，再通过init方法进行初始化

```bash
cd mcdr_server
mcdreforged init
```

此时会生成如下所示的文件夹结构

```txt
mcdr_server/
    ├─ config/
    ├─ logs/
    │   └─ MCDR.log
    ├─ plugins/
    ├─ server/
    ├─ config.yml
    └─ permission.yml
```

3. 将我们整个服务端，放到server文件夹下

```txt
mcdr_server/
    ├─ config/
    ├─ logs/
    │   └─ MCDR.log
    ├─ plugins/
    ├─ server/
++  │   ├─ ...
++  │   ├─ minecraft_server.jar
++  │   └─ server.properties
    ├─ config.yml
    └─ permission.yml
```

### 配置

通过编辑`config.yml`文件来配置 MCDR

```yml
language: zh_cn # 输出信息的语言
working_directory: server # 服务端的工作目录
start_command: java -Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -Dstderr.encoding=UTF-8 -Xms3G -Xmx7G -jar fabric-server.jar nogui
handler: vanilla_handler # 用于 原版/Carpet/Fabric服务端 无需修改
# ...
```

### 启动

输入以下命令进行启动

```bash
mcdreforged
```

- 服务端

![](https://cdn.atao.cyou/Blog/blog_250312_214316.gif)

- 客户端

![](https://cdn.atao.cyou/Blog/blog_250312_220516.gif)

### 插件

#### Here

- 安装指令

```bash
!!MCDR plugin install here
```

- 命令

`!!here`：显示玩家坐标并使其发光

- 效果

![](https://cdn.atao.cyou/Blog/blog_250312_220846.gif)

#### Prime Backup

- 安装指令

```bash
!!MCDR plugin install prime_backup
```

配置config/prime_backup文件夹下的`config.json`, 将enabled设置为true.

其他配置参考[官方文档](https://tisunion.github.io/PrimeBackup/zh/)

- 命令

`!!pb help [<指令>]`: 展示全部指令/给定指令的详细帮助

`!!pb make [<注释>]`: 创建一个备份。<注释>为可选注释

`!!pb back [<备份ID>]`: 回档至给定备份

`!!pb list [...]`: 列出备份，展示备份列表

`!!pb show [<备份ID>]`: 展示给定备份的详细信息

`!!pb rename <备份ID> <新注释>`: 修改给定备份的注释

`!!pb delete <备份ID> [<备份ID>]`: 删除给定备份。可输入多个备份ID

`!!pb confirm`: 确认当前的任务操作

`!!pb abort`: 终止当前的任务操作

更多命令可通过`!!pb help`查看

- 效果

:::video{width:95%, align:center, controls:true, caption:演示效果}
https://cdn.atao.cyou/Blog/blog_250312_222911.mp4
:::