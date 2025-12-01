---
title: 华为云部署minecraft服务端
date: '2025年03月09日'
tags: ['minecraft']
summary: 利用Fabric工具链生成Minecraft可读化源码的原理与流程。
readingTime: '5 分钟阅读'
---

## 前期准备

### 1. 服务器

选用的是华为云的`Flexus云服务器X实例`

- 4核8G
- 5M带宽
- SSD存储
- 操作系统Huawei Cloud EulerOS 2.0

![服务器实例](https://cdn.atao.cyou/Blog/blog_250309_225056.png){caption:服务器实例}

### 2. 登录

通过[FinalShell](https://www.hostbuf.com/)，登录服务器后台。

![登录后台](https://cdn.atao.cyou/Blog/blog_250309_230254.png){caption:登录后台}

### 3. JDK

从[oracle官网](https://www.oracle.com/cn/java/technologies/downloads/#java21)下载jdk21

![下载jdk](https://cdn.atao.cyou/Blog/blog_250310_211000.png){caption:下载jdk}

将下载好后的压缩包，通过FinalShell上传到服务器并解压

```bash
tar -zxvf jdk-21_linux-x64_bin.tar.gz
```

下面开始配置环境变量

编辑`/etc/profile`文件以设置Java环境变量

```bash
sudo vim /etc/profile
```

在文件末尾添加以下内容

```bash
export JAVA_HOME=/root/jdk/jdk-21.0.6
export PATH=$JAVA_HOME/bin:$PATH
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
```

激活配置

```bash
source /etc/profile
```

验证安装

```bash
java -version
# 输出一下内容，则表示安装成功
# java version "21.0.6" 2025-01-21 LTS
# Java(TM) SE Runtime Environment (build 21.0.6+8-LTS-188)
# Java HotSpot(TM) 64-Bit Server VM (build 21.0.6+8-LTS-188, mixed mode, sharing)
```

### 4. Fabric

访问[fabric官网](https://fabricmc.net/use/server/){file-icons:fabric}，下载服务器核心，并上传到服务器上

![](https://cdn.atao.cyou/Blog/blog_250310_205749.png)

## 启动

### 1. 首次启动

执行以下指令，启动服务端

```bash
# 将fabric下载下来的文件重命名为fabric-server.jar，方便执行
# （-Xmx7G表示最大7GB内存，根据服务器配置调整）
java -Xmx7G -jar fabric-server.jar nogui
```

首次启动会失败，并会生成`eula.txt`文件，需要我们编辑同意协议。

```bash
sudo vim eula.txt
```

```txt
# 将eula=false修改为true
eula=true
```

### 2. 配置规则

通过修改`server.properties`来配置服务器规则

```properties
#Minecraft server properties
#Mon Mar 10 21:18:45 CST 2025

accepts-transfers=false
# 是否接受玩家转移（例如从一个服务器到另一个服务器）

allow-flight=false
# 是否允许玩家在生存模式下飞行。

allow-nether=true
# 是否启用下界维度

broadcast-console-to-ops=true
# 是否将控制台消息广播给操作员

broadcast-rcon-to-ops=true
# 是否将RCON命令输出广播给操作员

bug-report-link=
# 错误报告链接地址

difficulty=hard
# 游戏难度级别

enable-command-block=false
# 是否启用命令方块

enable-jmx-monitoring=false
# 是否启用JMX监控

enable-query=false
# 是否启用查询协议以获取服务器信息

enable-rcon=false
# 是否启用远程控制台功能

enable-status=true
# 是否启用状态请求响应

enforce-secure-profile=true
# 是否强制执行安全配置文件

enforce-whitelist=false
# 是否强制使用白名单

entity-broadcast-range-percentage=100
# 实体广播范围百分比

force-gamemode=false
# 是否强制所有玩家进入指定的游戏模式

function-permission-level=2
# 函数权限等级

gamemode=survival
# 默认游戏模式

generate-structures=true
# 是否生成结构物如村庄、要塞等

generator-settings={}
# 世界生成器设置

hardcore=false
# 是否启用硬核模式

hide-online-players=false
# 是否隐藏在线玩家列表

initial-disabled-packs=
# 初始禁用的功能包

initial-enabled-packs=vanilla
# 初始启用的功能包，默认是原版内容

level-name=world
# 保存的世界名称

level-seed=11311638121115121
# 世界的种子值

level-type=minecraft\:normal
# 世界的类型或地形风格

log-ips=true
# 是否记录IP地址
max-chained-neighbor-updates=1000000
# 最大连锁更新次数

max-players=20
# 服务器的最大玩家数量

max-tick-time=60000
# 每个tick的最大时间限制

max-world-size=29999984
# 世界大小上限

motd=A Minecraft Server
# 服务器的欢迎信息或描述

network-compression-threshold=256
# 网络压缩阈值

online-mode=true
# 是否启用在线模式验证

op-permission-level=4
# 管理员的操作权限等级

pause-when-empty-seconds=60
# 当没有玩家时暂停的时间

player-idle-timeout=0
# 玩家空闲超时时间（分钟），0表示不超时

prevent-proxy-connections=false
# 是否阻止代理连接

pvp=true
# 是否开启玩家之间的战斗

query.port=25565
# 查询端口

rate-limit=0
# 速率限制，0表示无限制

rcon.password=
# RCON密码

rcon.port=25575
# RCON端口

region-file-compression=deflate
# 区域文件压缩方式

require-resource-pack=false
# 是否要求资源包

resource-pack=
# 资源包URL

resource-pack-id=
# 资源包ID

resource-pack-prompt=
# 资源包提示信息

resource-pack-sha1=
# 资源包SHA-1哈希值

server-ip=
# 服务器绑定的IP地址

server-port=25565
# 服务器监听的端口号

simulation-distance=10
# 模拟距离

spawn-monsters=true
# 是否生成怪物

spawn-protection=16
# 出生点保护半径

sync-chunk-writes=true
# 是否同步写入区块数据

text-filtering-config=
# 是否同步写入区块数据

text-filtering-version=0
# 文本过滤版本

use-native-transport=true
# 是否使用本地传输优化

view-distance=10
# 视距范围

white-list=false
# 是否启用白名单
```

### 3. 一键运行

新建一个`start.sh`，写入启动指令

```bash
java -Xmx7G -jar fabric-server.jar nogui
```

后续只要执行`sh start.sh`

但是此时如果关掉后台，服务器就停掉了。只需通过`nohup`挂在后台即可。

```bash
nohup sh start.sh &
```

### 4. 安全组

:::alert{type:info, title:提示}
如果在游戏中，搜索不到服务器，检查一下服务器安全组策略是否允许`25565`端口 
:::
