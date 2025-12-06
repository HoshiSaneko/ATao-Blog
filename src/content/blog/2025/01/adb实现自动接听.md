---
title: adb实现自动接听
date: '2025年01月15日'
tags: ['代码片段', 'python']
summary: 介绍如何用Python和ADB实现手机自动接听，涵盖基本原理和实现方法。
---
### 开发背景

在自动化测试工作中，常常要对测试机进行通话方面的压力测试。此时，配合机有这样的需求：它需要**自动接听**来自测试机的电话，然后在通话持续一段时间后**自动挂断**。

:::alert{type:info, title:提示}
配合机必须只对测试机拨打的通话进行自动接听，要将其他来电排除在外，不受其干扰
:::

### 相关指令

```bash
adb shell dumpsys telephony.registry # 获取当前设备的通话状态信息 
# mCallState：来电状态。0：空闲状态；1：响铃；2：通话中；
# mCallIncomingNumber：来电号码；
# mDataConnectionState：数据流量连接状态(可以用来判断是否打开数据流量) 

adb shell am start -a android.intent.action.CALL -d tel:xxx # 拨打指定电话

adb shell input keyevent 5 # 接听电话

adb shell input keyevent 6 # 挂断电话
```

### 功能实现

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
