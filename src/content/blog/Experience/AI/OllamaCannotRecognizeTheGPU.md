---
title: Ollama突然无法识别GPU问题
date: '2025年08月05日'
tags: ['经验分享']
summary: 本文介绍Ollama在Docker中无法识别GPU的原因及解决方法。
---
### 问题描述

在 Docker 容器中运行 `Ollama` 时, GPU 最初可用，但运行一段时间后会突然失效，无法被 `Ollama` 识别到。

![Ollama日志](https://cdn.atao.cyou/Blog/blog_250805_094501.png){caption:Ollama日志}

### 原因分析

Docker 默认使用 `systemd` 作为 cgroup 驱动（native.cgroupdriver=systemd），而 NVIDIA 容器运行时（nvidia-container-runtime）在某些情况下与 systemd 不兼容，导致:

**GPU 设备权限丢失**：/dev/nvidia* 设备节点在运行过程中被 systemd 动态调整，导致容器无法访问

**GPU 无法识别**：nvidia-container-runtime 无法正确挂载 GPU 设备

### 解决方案

修改 Docker 配置，使用 cgroupfs
编辑 `/etc/docker/daemon.json`（如果不存在则新建）：
```json
{
  "exec-opts": ["native.cgroupdriver=cgroupfs"]
}
```

重启 Docker 生效

```bash
sudo systemctl restart docker
```

验证是否生效

```bash
docker info | grep "Cgroup Driver"
```
如果输出是 `Cgroup Driver: cgroupfs`，说明修改成功。

### 为什么这样修改有效

| **`systemd`（默认）**                  | **`cgroupfs`（推荐）**          |
| :------------------------------------- | :------------------------------ |
| 动态调整 cgroup，可能导致 GPU 设备丢失 | 直接管理 cgroup，GPU 访问更稳定 |
| 某些 NVIDIA 容器运行时兼容性较差       | 兼容性更好，适合 GPU 容器化     |
| 在长期运行的容器中可能出现问题         | 减少 GPU 失效的概率             |
