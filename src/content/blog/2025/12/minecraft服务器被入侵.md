---
title: minecraft服务器被入侵
date: '2025年12月07日'
tags: ['minecraft']
summary: 记录一次 Minecraft 服务器被恶意玩家入侵的经历
---

### 事情的起因

11月2号那天，一个很久没联系的大学室友突然找我，说想和他女朋友一起玩 Minecraft，问我有没有服务器。我之前的服务器早就停了，不过手头还有台闲置的华为云服务器，正好可以拿来用。

那就搞呗！我就在华为云上重新搭了个原版生存服务器，用的 fabric，加了一些生电模组，像 tweakoo 这些。

当时只开了正版验证，想着应该问题不大，就没开白名单。

刚开始一切都很顺利，我们按部就班地建了刷铁机、村民交易所、熔炉组，还搞了沼泽刷怪塔和守卫者农场，玩得挺开心的。

## 被入侵了

结果到了11月23号晚上，出事了...

:::chat
@person name:piati6666, avatar:minecraft
家被偷了
@person name:ATaoYan, avatar:minecraft
？
@person name:piati6666, avatar:minecraft
回档吧
![](https://cdn.atao.cyou/Blog/blog_251123_233931.jpg)
@person name:ATaoYan, avatar:minecraft
这几个哪来的
@person name:piati6666, avatar:minecraft
我还以为你朋友
:::

当时已经晚上11点多了，我正准备睡觉。看到这个消息人都傻了，赶紧先把服务器关了，免得被破坏得更严重。

第二天还要上班，我就让室友先上号看看情况。结果一看，存档被毁得不成样子，刷铁机、农场、仓库全都被拆了，东西也被拿光了。

![守卫者农场收集](https://cdn.atao.cyou/Blog/blog_251124_100655.png){caption: 守卫者农场收集}

![仓库](https://cdn.atao.cyou/Blog/blog_251124_100603.png){caption: 仓库}

![基地全景](https://cdn.atao.cyou/Blog/blog_251124_100511.png){caption: 基地全景}

## 处理结果

下班回家后，我第一件事就是把白名单开了。还好之前加了备份脚本，用 `!!pb back` 把存档恢复到被入侵前的状态，不然真的就白玩了。

这次也算是给我自己提了个醒：==开服务器一定要开白名单，还有备份真的很重要！不然辛辛苦苦建的东西说没就没了。==

![](https://cdn.atao.cyou/Blog/blog_251207_221634.png)

