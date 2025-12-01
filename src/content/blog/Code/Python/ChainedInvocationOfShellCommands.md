---
title: 链式调用shell指令
date: '2025年01月14日'
tags: ['代码片段', 'python']
summary: 介绍如何用Python实现Shell命令的链式调用，包含基本方法和应用场景。
---
### 开发背景

在自动化测试和脚本化任务中，常需按步骤执行 `adb shell` 命令及处理结果。例如自动化测试时，先通过 `shell` 命令安装应用，再检查安装结果，之后进行其他操作。  

### 功能实现

```python
class ADBShell:
    def __init__(self, device: str):
        self.shell = None  # shell 进程对象
        self.device = device
        self.stdout_adb = ""
        self.stderr_adb = ""
        self.start_shell()

    def start_shell(self):
        self.stdout_adb = ""
        self.stderr_adb = ""
        self.shell = subprocess.Popen(["adb", "-s", self.device, "shell"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    def write(self, command: str):
        if self.shell.stdin.closed:  # 如果输入流已关闭，则重新启动 ADB shell 进程
            self.start_shell()
        if command[-1]!= '\n':
            command += '\n'
        self.shell.stdin.write(command.encode())
        self.shell.stdin.flush()
        return self

    def read(self):
        if self.shell.stdin:
            self.shell.stdin.flush()
            self.shell.stdin.close()
        stdout, stderr = self.shell.communicate()
        return stdout.decode(), stderr.decode()

    def write_adb(self, adb_command: str):
        full_command = ["adb", "-s", self.device] + adb_command.split()
        process = subprocess.Popen(full_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        self.stdout_adb += stdout.decode()
        self.stderr_adb += stderr.decode()
        return self

    def read_adb(self):
        return self.stdout_adb, self.stderr_adb

    def flush(self):
        self.shell.stdin.flush()
        return self

    def close(self):
        if self.shell.stdin:
            self.shell.stdin.close()
        return self

    def sleep(self, sleep_time):
        time.sleep(sleep_time)
        return self
```

### 使用示例

> 通过adb将APK安装到手机中，并获取手机中APK的信息。获取完成后，将数据导出

```python
adbShell = ADBShell("T442A02XNKH0189")
_ = (adbShell.   # 链式执行删除结果，安装APK，启动APK等操作
        write("cd /sdcard/Android/data/com.tt.appinfo/files/").
        write("rm result.txt").
        write_adb("install app-debug.apk").
        write("am start -n com.tt.appinfo/.MainActivity").
        read())
start = time.time()
while((time.time() - start) < 30):    # 等待执行结束
    stdout, stderr = adbShell.write(f"cd /sdcard/Android/data/com.tt.appinfo/files/").write("cat result.txt").read()
    if "1" in stdout:
        break
    time.sleep(1)
else:
    print("timeout")
adbShell.write_adb("pull /sdcard/Android/data/com.tt.appinfo/files/appInfo.db")   # 导出结果
print("finished")
```
