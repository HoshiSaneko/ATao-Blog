---
title: Maxkb加载gpt2失败
date: '2025年04月25日'
tags: ['经验分享']
summary: 本文介绍Maxkb加载gpt2失败的原因及解决方法。
---
### 问题描述

在`Maxkb`使用AI高级编排时，使用AI对话会抛出`Can’t load tokenizer for ‘gpt2’`的异常

```bash
Can't load tokenizer for 'gpt2. if you were trying to load it from "htps://huggingface.co/models, make sure you don't have a
local directory with the same name. 0therwise, make sure 'gpt2 is the correct path to a directory containing all relevant files for
a GPT2TokenizerFast tokenizer.
```

![错误日志](https://cdn.atao.cyou/Blog/blog_250425_090427.png){caption:错误日志}

### 解决方法

这是由于用于计算`token`的gpt2没有下载到本地导致的

可以通过`huggingface`进行下载

```bash
pip install -U huggingface_hub   # 安装huggingface库
huggingface-cli download --resume-download gpt2 --local-dir gpt2  # 下载gpt2
```

将下载完成后的模型放在`/opt/maxkb/app/models/tokenizer/gpt2`

修改Maxkb中查找gpt2的路径

```python
# apps\common\config\tokenizer_manage_config.py
class TokenizerManage:
    tokenizer = None

    @staticmethod
    def get_tokenizer():
        from transformers import GPT2TokenizerFast
        if TokenizerManage.tokenizer is None:
            TokenizerManage.tokenizer = GPT2TokenizerFast.from_pretrained(
                '/opt/maxkb/app/models/tokenizer/gpt2',
                cache_dir="/opt/maxkb/model/tokenizer",
                local_files_only=True,
                resume_download=False,
                force_download=False)
        return TokenizerManage.tokenizer
```
