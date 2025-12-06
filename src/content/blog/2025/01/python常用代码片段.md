---
title: python常用代码片段
date: '2025年01月14日'
tags: ['代码片段', 'python']
summary: 收集常用的Python代码片段，方便快速查阅和应用。
---
### 基础类

#### 执行终端命令

```python
def subPopen(cmd: Union[str, list], shell: bool = True, encoding: str = "utf-8", errors: str = "ignore") -> str:
    """
    执行cmd命令，返回命令执行结果
    :param cmd: 命令
    :param shell: 是否使用shell
    :param encoding: 编码
    :param errors: 错误处理方式
    :return: 命令执行结果
    """
    _r = subprocess.Popen(cmd, shell=shell, stdout=subprocess.PIPE)
    return _r.stdout.read().decode(encoding, errors=errors)
```

### 网络类

#### 获取当前wifi

```python
def getCurrentWifi() -> tuple:
    """
    获取pc当前连接wifi
    return: (wifi_name, wifi_password)
    """
    wifi_name = ""
    lines = subPopen("netsh wlan show interfaces", encoding="gbk").split("\r\n")
    for line in lines:
        if "配置文件" in line and ": 配置文件" not in line:
            wifi_name = line.split(":")[-1].strip()
            break
    wifi_password = ""
    lines = subPopen(f"netsh wlan show profiles {wifi_name} key=clear", encoding="gbk").split("\r\n")
    for line in lines:
        if "关键内容" in line:
            wifi_password = line.split(":")[-1].strip()
    return wifi_name, wifi_password
```

#### 检查网络连接状态

```python
def ping(ip: str, count: int = 1, timeout: int = 100) -> bool:
    """
    检查ip是否可以ping通
    :param ip：要ping的ip地址
    :param count: 要发送的回显请求数
    :param timeout: 等待每次回复的超时时间(毫秒)
    :return: 是否连接成功
    """
    return True if "来自" in subPopen(f"ping {ip} -n {count} -w {timeout}", encoding="gbk") else False
```

#### 获取网络适配器IP

```python
def getNetworkAdapterIp() -> dict:
    """
    获取网络适配器ip
    :return: 网络适配器ip
    """
    adapter_ip = {}
    lines = subPopen("ipconfig", encoding="gbk").split("\r\n")
    adapter = ""
    for line in lines:
        if line == "":
            continue
        if "." not in line:
            adapter = line.replace(":", "")
        if "IPv4" in line or "ipv4" in line:
            ip = line.split(":")[-1].strip()
            adapter_ip[adapter] = ip
    return adapter_ip
```

### 设备类

#### 获取设备号

```python
def getDevices() -> list:
    """ 获取设备号 """
    return re.findall(r"\s(\S+)\tdevice", subPopen("adb devices"))
```

#### 是否亮屏

```python
def screenOn() -> bool:
    """ 是否亮屏 """
    return True if "true" in subPopen("adb shell dumpsys deviceidle | findstr mScreenOn") else False
```

#### 自动接听

```python
def autoAnswer(device: str, number: str, duration: int = 10) -> None:
    """
      自动接听电话
     :param device: 设备号
     :param number: 电话号码
     :param duration: 通话时长，单位秒
    """
    while True:
        if "1" in subPopen(f"adb -s {device} shell dumpsys telephony.registry|findstr mCallState"):
            time.sleep(2)
            print("来电")
            if number in subPopen(f"adb -s {device} shell dumpsys telephony.registry | findstr mCallIncomingNumber"):
                subPopen(f"adb -s {device} shell input keyevent 5")
                print("接听电话")
                time.sleep(duration)
                subPopen(f"adb -s {device} shell input keyevent 6")
                print("挂断电话")
            else:
                print("不是指定号码，忽略")
                subPopen(f"adb -s {device} shell input keyevent 6")
        time.sleep(2)
```

#### 根据手机号判断运营商

```python
def checkOperator(number: str) -> str:
    """ 根据手机号码，判断运营商 """
    # 输入验证
    if not isinstance(number, str) or len(number) != 11 or not number.isdigit():
        return "无效号码"

    prefix = number[:3]
    cmcc_prefixes = {'134', '135', '136', '137', '138', '139', '150', '151', '152', '157', '158',
                     '159', '182', '183', '184', '187', '188', '198'}
    cu_prefixes = {'130', '131', '132', '155', '156', '185', '186', '166'}
    ct_prefixes = {'133', '153', '180', '181', '189', '191', '199'}
    if prefix in cmcc_prefixes:
        return "CMCC"
    elif prefix in cu_prefixes:
        return "CU"
    elif prefix in ct_prefixes:
        return "CT"
    else:
        return "Unknown"
```

### 文件下载

[下载链接](https://www.taonotespace.com/download/common_python_snippets.py){material-symbols:download}
