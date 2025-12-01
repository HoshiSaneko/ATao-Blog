---
title: 企业微信每日提醒机器人
date: '2025年09月09日'
tags: ['经验分享']
summary: 本文介绍如何使用企业微信提醒机器人，实现定时发送消息。
---
### 需求背景

需要定时发送消息到企业微信群，实现每日提醒功能。

### 实现方法                

1. 在企业微信中的群聊，添加机器人

![添加机器人](https://cdn.atao.cyou/Blog/blog_250909_110204.png){caption:添加机器人, width:60%}

2. 获取机器人的Webhook地址  

![获取Webhook地址](https://cdn.atao.cyou/Blog/blog_250909_110608.png){caption:获取Webhook地址}

3. 打开并登录[腾讯轻联](https://ipaas.cloud.tencent.com/){simple-icons:icloud}

4. 左侧导航栏中，点击`新建流程`

5. 触发组件中选择`定时启动`, 执行流程中添加`企业微信群机器人`  

![设置流程](https://cdn.atao.cyou/Blog/blog_250909_111709.png){caption:设置流程, width:60%}

6. 设置定时启动的触发条件

7. 设置机器人发送的消息内容

8. 保存并上线流程