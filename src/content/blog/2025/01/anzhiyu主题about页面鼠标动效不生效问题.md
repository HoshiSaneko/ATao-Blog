---
title: anzhiyu主题about页面鼠标动效不生效问题
date: '2025年01月16日'
tags: ['经验分享']
summary: 本文介绍anzhiyu主题about页面鼠标动效失效的原因及解决方法。
---
### 问题背景

在配置[安知鱼主题](https://github.com/anzhiyu-c/hexo-theme-anzhiyu)的关于页面时，发现**helloAbout**的动效突然不起作用了。如下图所示

![](https://cdn.atao.cyou/Blog/blog_250116_170327.gif)

### 原因分析

打开调试控制台，发现在about页面存在报错。

![控制台信息](https://cdn.atao.cyou/Blog/blog_250116_170745.png){caption:控制台信息}

通过排查发现，在`selfInfo`中的`selfInfoContentYear`我填的不是纯数字导致的。

#### 修改前

```yaml
selfInfo:
  selfInfoTips1: 生日
  selfInfoContentYear: 3 月 5 日
  selfInfoTips2: 星座
  selfInfoContent2: 双鱼座
  selfInfoTips3: 职业
  selfInfoContent3: 自动化工程师
```

#### 修改后

```yaml
selfInfo:
  selfInfoTips1: 出生
  selfInfoContentYear: 1999
  selfInfoTips2: 星座
  selfInfoContent2: 双鱼座
  selfInfoTips3: 职业
  selfInfoContent3: 自动化工程师
```

#### 恢复正常

![](https://cdn.atao.cyou/Blog/blog_250116_173812.gif)
