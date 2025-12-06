---
title: 生成minecraft源码
date: '2025年02月20日'
tags: ['minecraft']
summary: 本文简要介绍了利用Fabric工具链生成Minecraft可读化源码的原理与流程。
---
### 说明

**Minecraft的官方源码始终未公开**，其Java版客户端通过**混淆技术**对类名、方法名进行随机化处理（如a()、b()等无意义命名）。而通过Fabric生成的源码本质是：

- 反编译产物：基于Mojang发布的JAR包，使用CFR反编译器生成
- 社区映射：通过Yarn项目（社区维护的映射表）将混淆名称转为语义化命名（如method_1234→calculateBlockDamage）
- 受限结构：仅包含游戏运行时核心逻辑（如net.minecraft.block包），不包含渲染引擎等闭源模块

### 注意事项

- 生成的源码**不可二次分发**（违反Mojang EULA第2节）
- 生成的源码与Minecraft版本**严格绑定**（如1.20.1生成的类无法直接用于1.21开发）
- 禁止直接修改生成的源码（修改无效，需通过Mixin或API注入）

### 环境准备

1. 安装[JDK 17+](https://adoptium.net/temurin/releases/){hugeicons:java}
2. 安装[IntelliJ IDEA](https://www.jetbrains.com/idea/download/?section=windows){devicon:intellij}
3. 安装插件Minecraft Development（自动配置Fabric）

### 生成步骤

1. 下载[fabric模组模板](https://fabricmc.net/develop/template/)
2. 修改Gradle配置

```groovy
# settings.gradle 添加镜像源
repositories {
    maven { url 'https://maven.aliyun.com/nexus/content/groups/public' }
    maven { url 'https://repository.hanbings.io/proxy' }
}
```
3. 执行生成命令
``` bash
# 控制台运行
./gradlew genSources
```

### 验证生成结果

在IDEA中的`外部库`中可以查看到`net.minecraft:minecraft-<版本>@merged-named`
展开net.minecraft包查看反编译后的Yarn映射源码

![源码映射](https://cdn.atao.cyou/Blog/blog_250220_230534.png){caption:源码映射}
