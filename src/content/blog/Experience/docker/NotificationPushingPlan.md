---
title: 一种轻APP的通知推送方案
date: '2025年08月21日'
tags: ['经验分享']
summary: 本文介绍一种轻量、可自托管的APP通知推送方案PushDeer。
---
### 前提背景

在日常工作和生活中，我们经常需要将`设备状态`、`程序日志`、`重要提醒`等信息及时推送到手机或其他终端。

但传统的推送方案要么依赖第三方闭源服务（存在隐私和稳定性风险），要么需要安装专用 APP（增加用户操作成本）。

今天要介绍的`PushDeer`，正是一款以 `“轻量、可控、易用” `为核心的通知推送工具，尤其适合需要自主掌控推送链路的用户。

### PushDeer

`PushDeer` 是一款开源的无 APP 推送服务，同时支持轻 APP（如 APP Clip、快应用）、传统 APP（iOS/Android/Mac）以及自制硬件设备（如 ESP8266/ESP32），核心目标是让消息推送 “无需安装、简单调用、自主可控”。

其核心价值可以概括为三点：

- `易用性` 无需安装 APP，通过轻应用或快应用即可接收消息；调用方式极简，只需一个 URL 即可发送文本，无需深入阅读文档。
- `可控性` 支持自托管，避免依赖第三方服务下线风险；非商用场景免费，且不依赖微信等平台的消息接口，减少政策限制影响。
- `渐进性` 基础功能（文本推送）零门槛，通过扩展参数可支持 Markdown、图片等富文本；后期可通过 APP 补充轻应用无法覆盖的功能。

### 自定义部署

如果需要完全掌控推送服务（避免依赖官方服务），可以通过以下步骤自托管 PushDeer。
1. 环境准备
    - 服务器：推荐 Linux 系统（需支持 Docker），具备公网 IP（方便外部调用）。
    - 本地工具：安装git、docker和docker-compose。

2. 下载代码
克隆官方仓库到服务器
```bash
git clone https://github.com/easychen/pushdeer.git
cd pushdeer
```

3. 启动服务
执行以下命令启动 API 服务
```bash
docker-compose -f docker-compose.self-hosted.yml up --build -d
```
此时，访问http://公网ip:8800，可以正常显示下方二维码则表示部署成功

![访问8800端口](https://cdn.atao.cyou/Blog/blog_250821_141617.png){caption:访问8800端口, width:60%}

4. 客户端配置

在苹果商店搜索「PushDeer·自架版」或扫描上方的二维码进行安装并启动

![登录apk](https://cdn.atao.cyou/Blog/blog_250821_143221.jpg){caption:登录apk, width:20%}

API服务地址输入http://公网ip:8800, 并用苹果id进行登录

![注册](https://cdn.atao.cyou/Blog/blog_250821_143435.jpg){caption:注册, width:20%}

登陆后，没有注册就先进行注册

![注册完成](https://cdn.atao.cyou/Blog/blog_250821_143528.jpg){caption:注册完成, width:20%}

注册完成后，点击`Key`就可以看到当前设备的密钥了

5. 验证服务

使用python发送请求
```python
import requests
from typing import Optional

def pushdeer_send(text: str, desp: Optional[str] = None, type_: str = "text", key: str = "[PUSHKEY]") -> str:
    """
    发送 PushDeer 消息
    Parameters
    ----------
    text : str
        主体文字
    desp : Optional[str]
        附加描述，若为 None 则不传递此字段
    type_ : str
        消息类型，默认 "text"
    key  : str
        PushKey， 设备密钥

    Returns
    -------
    str
        PushDeer API 返回的原始文本内容。
    """
    url = "http://公网ip:8800/message/push"

    payload = {
        "text": text,
        "type": type_,
        "pushkey": key
    }
    if desp is not None:
        payload["desp"] = desp

    response = requests.post(url, data=payload)

    response.raise_for_status()
    return response.text

pushdeer_send("Hello World",key="PDU1Tn3kcl...")

```

客户端接收到消息推送

![消息推送](https://cdn.atao.cyou/Blog/blog_250821_143727.jpg){caption:消息推送, width:20%}

:::alert{type:info, title:提示}
实测,APP退出或者在锁屏界面也可以接收到推送
:::

### 相关问题

1. 容器启动失败，抛出以下报错

```bash
-> Executing /opt/docker/provision/entrypoint.d/05-permissions.sh
-> Executing /opt/docker/provision/entrypoint.d/20-apache.sh
-> Executing /opt/docker/provision/entrypoint.d/20-php-fpm.sh
-> Executing /opt/docker/provision/entrypoint.d/20-php.sh
-> Executing /opt/docker/provision/entrypoint.d/init.sh
/opt/docker/provision/entrypoint.d/init.sh: line 2: $$'\r': command not found
```

这是由于脚本文件保存时使用了 Windows 换行符(CRLF), 而不是Linux 下的换行符(LF)

[下载文件](https://taonotespace.com/download/init.sh){material-symbols:download}, 将文件拷贝到服务器的pushdeer目录下。
修改docker-compose.self-hosted.yml配置

```yml
# 其余的不变
app:
  image: pushdeer-app
  ports:
    - '8800:80'
  volumes:
    - './:/app'
    - './init.sh:/opt/docker/provision/entrypoint.d/init.sh:ro' # 挂载本地的init.sh文件
  depends_on:
    mariadb:
      condition: service_healthy
    redis:
      condition: service_healthy
  environment:
    - DB_HOST=mariadb
    - DB_PORT=3306
    - DB_USERNAME=root
    - DB_DATABASE=pushdeer
    - DB_PASSWORD=theVeryp@ssw0rd
    - GO_PUSH_IOS_TOPIC=com.pushdeer.self.ios
    - GO_PUSH_IOS_CLIP_TOPIC=com.pushdeer.self.ios.Clip
    - APP_DEBUG=false
    - MQTT_API_KEY=9LKo3
    - MQTT_ON=false
```
