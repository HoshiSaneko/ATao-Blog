---
title: 激活Typora
date: '2025年03月09日'
tags: ['经验分享']
summary: 介绍了在 Windows 系统上激活 Typora 编辑器的步骤和注意事项。
---
### 激活方法

在`Typora`的安装目录下，找到`Typora\resources\page-dist\static\js`文件夹

打开**LicenseIndex**开头的js文件，如`LicenseIndex.180dd4c7.bffb5802.chunk.js`{lang="yaml"}

```js
// # 将 e.hasActivated="true"==e.hasActivated 修改为
e.hasActivated = true;
```

以管理员身份保存后，重新打开Typora

### 激活成功

此时显示已经激活

![激活成功](https://cdn.atao.cyou/Blog/blog_250309_232354.png){caption:激活成功}
