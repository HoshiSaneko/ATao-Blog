---
title: 本地部署vllm
date: '2025年08月26日'
tags: ['经验分享']
summary: 使用Docker部署vLLM大语言模型推理服务。
---
### 介绍

`vLLM` 是一个专为大规模语言模型（LLM）推理和服务而设计的高性能库。

它的核心优势在于其创新的 PagedAttention 算法，该算法解决了传统服务方式中内存管理的瓶颈，从而带来了两大核心优势：

- `极高的吞吐量`：在相同硬件条件下，vLLM 可以同时处理更多用户的请求，显著降低了服务成本。

- `高效的内存利用`：极大地减少了模型运行所需的显存，使得在消费级GPU上运行大模型成为可能，或者可以在单卡上运行更大的模型。

简单来说，如果你需要将像 Deepseek、Qwen3 等这类大模型部署成可对外服务的 API，vLLM 通常是性能和易用性的最佳选择之一。

### 部署

使用 Docker 部署是最简单、最干净的方式，它能避免复杂的环境依赖问题。

#### 前提条件

- 确保你的机器已安装 `Docker` 和 `NVIDIA Docker Toolkit`（如果你使用 NVIDIA GPU）。

- 拥有足够的 GPU 显存（例如，运行 7B 模型建议至少 16GB 显存）。

#### 部署步骤

1. 预先下载模型到宿主机

首先，在你的服务器或本地机器上，创建一个专门的目录来存放模型，然后使用 huggingface-hub 官方工具下载模型。[huggingface](https://huggingface.co/){pixel:huggingface}

```bash
# 1. 安装模型下载工具
pip install huggingface-hub

# 2. 创建模型存储目录（建议选择一个空间大的磁盘）
mkdir -p /data/models

# 3. 下载你所需的模型（这里以 Qwen 为例）
huggingface-cli download Qwen/Qwen3-8B-AWQ --local-dir /data/models/Qwen3-8B-AWQ

# 或者也可以通过git进行拉取
# git clone https://huggingface.co/Qwen/Qwen3-8B-AWQ
```

:::alert{type:info, title:提示}
你需要将 Qwen/Qwen3-8B-AWQ 替换为你实际想部署的模型ID，将 /data/models/Qwen/Qwen3-8B-AWQ 替换为你计划使用的路径。
:::

2. 编写 Docker Compose 配置文件

创建一個名为 docker-compose.yml 的文件，内容如下。这个配置几乎可以直接使用，你只需要修改 volumes 项中的模型路径即可。

```yml
version: '3.8'

services:
  vllm-openai:
    image: vllm/vllm-openai:latest
    container_name: Qwen3-8B-AWQ # 给你的容器起个名字
    ports:
      - '8000:8000' # 将宿主机的8000端口映射到容器内
    volumes:
      # 关键步骤：将宿主机上下载好的模型目录挂载到容器内
      - /data/models/Qwen3-8B:/app/model
    environment:
      - LC_ALL=C.UTF-8 # 设置容器内部语言环境，避免编码问题
      - HF_HUB_OFFLINE=1 # 强制使用离线模式，避免运行时检查网络
      - TRANSFORMERS_OFFLINE=1 # 强制Transformers库使用离线模式
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all # 使用所有可用的GPU
              capabilities: [gpu] # 声明需要NVIDIA GPU能力
    # 传递给vLLM服务的启动命令,参数分别为
    # --model 指定容器内的模型路径
    # --gpu-memory-utilizatio GPU内存使用率，根据需求调整
    # --dtype 选择数据类型
    # --tensor-parallel-size tensor并行数
    # --port 容器内服务监听端口
    # --api-key 密钥
    # --trust-remote-code 对于Qwen等模型，需要此参数
    command: >
      --model /app/model
      --gpu-memory-utilization 0.9
      --dtype auto
      --tensor-parallel-size 1
      --port 8000
      --api-key 123123
      --trust-remote-code
```

3. 启动服务
在包含 docker-compose.yml 文件的目录下，执行以下命令即可启动所有服务。

```bash
docker compose up -d # -d 参数代表在后台运行
```

4. 验证服务
服务启动后，使用 curl 命令测试接口是否正常工作。使用在 --api-key 参数中设置的密钥。

``` bash
curl -H "Authorization: Bearer 123123" http://localhost:8000/v1/models
```

如果返回了包含模型信息的 JSON 数据，恭喜，部署成功！

```json
{

  "object": "list",
  "data": [{
    "id": "/app/model",
    "object": "model",
    "created": 1756171599,
    "owned_by": "vllm",
    "root": "/app/model",
    "parent": null,
    "max_model_len": 40960,
    "permission": [{
      "id": "modelperm-e234d316935c4aae9fbe1b5cefe3e96c",
      "object": "model_permission",
      "created": 1756171599,
      "allow_create_engine": false,
      "allow_sampling": true,
      "allow_logprobs": true,
      "allow_search_indices": false,
      "allow_view": true,
      "allow_fine_tuning": false,
      "organization": "*",
      "group": null,
      "is_blocking": false,
    },],
  },],
}
```
