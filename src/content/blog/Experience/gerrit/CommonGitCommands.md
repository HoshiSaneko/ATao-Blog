---
title: 常用Git指令
date: '2025年07月21日'
tags: ['经验分享']
summary: 本文整理了常用Git指令及操作技巧。
---
### 一、Git基础配置

```bash
# 设置全局用户名和邮箱（每次提交都会记录这些信息）
git config --global user.name "你的名字"
git config --global user.email "你的邮箱@example.com"

# 查看所有配置信息
git config --list
```

:::alert{type:info, title:提示}
这些配置通常只需要设置一次，它们会被保存在用户目录下的.gitconfig文件中
:::

### 二、仓库操作基础

#### 1. 创建与克隆仓库

```bash
# 在当前目录初始化一个新的Git仓库
git init

# 克隆远程仓库到本地
git clone <仓库URL>

# 克隆特定分支
git clone -b <分支名> <仓库URL>
```

#### 2. 远程仓库管理

```bash
# 查看已配置的远程仓库
git remote -v

# 添加新的远程仓库
git remote add <远程名称> <仓库URL>

# 修改远程仓库地址
git remote set-url <远程名称> <新URL>

# 删除远程仓库
git remote remove <远程名称>
```

::alert
`origin`一般是在克隆(Clone)仓库时自动创建的默认远程仓库别名
::

### 三、日常开发工作流

#### 1. 状态查看与文件操作

```bash
# 查看当前仓库状态（推荐频繁使用）
git status

# 查看工作区和暂存区的具体更改
git diff

# 查看已暂存文件的更改
git diff --cached
```

#### 2. 提交更改

```bash
# 添加文件到暂存区
git add <文件名>       # 添加特定文件
git add .              # 添加所有更改的文件

# 提交更改并添加描述信息
git commit -m "有意义的提交信息"

# 修改最后一次提交（未推送前）
git commit --amend
```

常见 Git Commit 关键字及含义
| 关键字    | 用途示例                     | 说明                                                                 |
|-----------|-----------------------------|----------------------------------------------------------------------|
| `feat`    | feat: add user login      | 新增功能（Feature），通常对应 semver 的 MINOR 版本更新。              |
| `fix`     | fix: button click bug     | 修复 Bug，通常对应 semver 的 PATCH 版本更新。                        |
| `docs`    | docs: update README       | 文档更新（如 README、注释等）。                                      |
| `style`   | style: format code        | 代码样式调整（如空格、缩进、分号等），不改变逻辑。                    |
| `refactor`| refactor: simplify logic  | 代码重构（既非新增功能，也非修复 Bug）。                              |
| `perf`    | perf: optimize rendering  | 性能优化（Performance）。                                            |
| `test`    | test: add unit test       | 测试相关（新增或修改测试代码）。                                      |
| `chore`   | chore: update deps        | 杂项任务（如构建配置、依赖更新等）。                                  |
| `build`   | build: upgrade webpack    | 构建系统或工具链变更（如 Webpack、Babel 等）。                        |
| `ci`      | ci: fix GitHub Actions    | CI/CD 配置变更（如 GitHub Actions、Jenkins）。                        |
| `revert`  | revert: remove feature X  | 回滚之前的提交。                                                     |
| `merge`   | merge: branch A into main | 合并分支（通常由 Git 自动生成，手动提交时应避免使用）。                |

#### 3. 分支管理

```bash
# 查看本地分支
git branch

# 查看所有分支（包括远程）
git branch -a

# 创建新分支
git branch <分支名>

# 切换分支
git checkout <分支名>

# 创建并切换到新分支（推荐方式）
git checkout -b <分支名>

# 删除分支
git branch -d <分支名>      # 安全删除（已合并的分支）
git branch -D <分支名>      # 强制删除（未合并的分支）

# 重命名分支
git branch -m <旧分支名> <新分支名>
```

### 四、同步与协作

#### 1. 拉取与推送

```bash
# 拉取远程仓库的最新更改（只获取不合并）
git fetch origin

# 推送当前分支到远程的Gerrit代码审查系统
git push origin HEAD:refs/for/<分支名>

# 推送当前提交作为标签到远程仓库
git push origin HEAD:refs/tags/<标签名>

# 标准推送方式
git push

# 推送新分支到远程
git push -u origin <分支名>

# 强制推送（慎用，可能覆盖他人工作）
git push -f

```

::alert{type="warning"}
强制推送会覆盖远程历史，只应在你完全确定的情况下使用，特别是在团队协作中要避免随意使用
::

##### 2. 合并与变基

```bash
# 合并指定分支到当前分支
git merge <分支名>

# 变基当前分支到指定分支（使历史更线性）
git rebase <分支名>
```

- 合并(merge)会创建一个新的合并提交，保留完整的历史
- 变基(rebase)会重写提交历史，使分支看起来像是直接基于目标分支开发的

### 五、查看历史记录

```bash
# 查看完整的提交历史
git log

# 简洁版提交历史
git log --oneline

# 查看特定文件的修改历史
git blame <文件名>
```

### 六、标签管理

```bash
# 创建轻量级标签
git tag <标签名>

# 创建带注释的标签
git tag -a <标签名> -m "标签说明"

# 查看所有标签
git tag

# 推送标签到远程
git push origin --tags

# 删除本地标签
git tag -d <标签名>

# 删除远程标签
git push origin :refs/tags/<标签名>
```

### 七、常用小技巧

#### 7.1 强制重置到远程分支状态

```bash
git fetch origin
git reset --hard origin/<分支名>
```
