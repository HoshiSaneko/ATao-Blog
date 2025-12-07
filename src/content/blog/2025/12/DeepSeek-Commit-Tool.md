---
title: DeepSeek-Commit-Tool
date: '2025年12月07日'
tags: ['经验分享', '工具推荐']
summary: 介绍如何使用 DeepSeek-Commit-Tool 工具，通过 DeepSeek API 自动生成规范的 Git 提交信息，提升开发效率。
---

## 前言

在日常开发工作中，无论是 GitHub 还是公司内部的 Gerrit，我们都需要频繁提交代码。然而，每次填写 commit 信息时，总是难以用简洁明了的语言完整概括本次修改的内容。这导致提交信息要么过于简单，要么冗长且不够规范。

为了解决这个问题，我开发了一个基于 DeepSeek API 的工具，能够自动分析代码变更并生成规范的 commit 信息，大大提升了提交效率。

:::alert{type:info, title:为什么选择 DeepSeek}
选择 DeepSeek 的原因很简单——账户中还有未使用的 API 额度。DeepSeek 提供了高质量的代码理解能力，能够准确分析代码变更并生成合适的提交信息。
:::

## 下载

:::link-card{url:https://github.com/ataoyan/DeepSeek-Commit-Tool, title:DeepSeek-Commit-Tool
, description:基于 DeepSeek API 的 Git 提交信息自动生成工具}
:::

## API 配置

### 环境变量配置

为了便于全局使用，建议将 `dsc.exe` 配置到系统环境变量中。这样可以在任意目录下直接使用该工具。

### 获取 API Key

1. 访问 [DeepSeek API 管理页面](https://platform.deepseek.com/api_keys "DeepSeek API Keys")
2. 登录你的 DeepSeek 账户
3. 点击「创建新的 API Key」
4. 复制生成的 API Key（格式类似：sk-xxxxx）

### 配置 API Key

通过以下命令配置你的 API Key：

```bash
dsc.exe --api-key sk-xxxxx
```

配置完成后，工具会将 API Key 保存到本地配置文件中，后续使用无需重复配置。

## 使用

### 在 SourceTree 中集成

SourceTree 是一款流行的 Git 图形化客户端，下面介绍如何在该工具中集成 DeepSeek-Commit-Tool。

#### 步骤一：配置自定义操作

1. 打开 SourceTree
2. 依次点击 工具 → 选项 → 自定义操作 → 添加
3. 按照以下配置填写：
   - 菜单标题：`DeepSeek Commit`
   - 运行的脚本：`dsc.exe`（或完整路径）
   - 参数：`run $REPO`
4. 点击「确定」保存配置

![配置自定义操作](https://cdn.atao.cyou/Blog/blog_251207_192555.png){caption:配置自定义操作}

#### 步骤二：使用工具生成 Commit 信息

1. 在项目中添加需要提交的文件到暂存区
2. 暂存区任意位置右键，选择自定义操作 → DeepSeek Commit
3. 工具会自动分析代码变更，并生成规范的 commit 信息

![执行操作](https://cdn.atao.cyou/Blog/blog_251207_193156.png){caption:执行操作}

### 命令行使用

如果你习惯使用命令行，也可以直接在终端中运行：

```bash
# 在 Git 仓库根目录下执行
dsc.exe run
```

工具会自动读取当前仓库的变更，生成 commit 信息并显示在终端中。
