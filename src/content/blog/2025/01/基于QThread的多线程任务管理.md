---
title: 基于QThread的多线程任务管理
date: '2025年01月14日'
tags: ['代码片段', 'python']
summary: 介绍如何用Python实现多线程任务管理，包含基本原理和代码示例。
---
### 开发背景

在开发一个 `PyQt` 应用程序时，我们经常需要执行一些耗时的操作，例如`文件读写`、`网络请求`、`复杂的数据处理`或`长时间的计算`。如果这些操作在主线程中执行，会导致用户界面（UI）冻结，用户无法与应用程序进行交互，影响用户体验。为了解决这个问题，我们需要将这些耗时操作放在单独的线程中执行。

然而，直接使用多线程会带来一些复杂性，例如线程的`创建`、`管理`、`信号`和`槽机制`的使用，以及在多线程环境下处理异常和结果的传递等。为了简化这些操作，因此开发了 `Task`和 `TaskManager` 类。

### 功能实现

```python
from PyQt5.QtCore import QThread, pyqtSignal

class Task(QThread):
    """
    Task class to run a task in a separate thread.
    """
    success_signal = pyqtSignal(object)
    fail_signal = pyqtSignal(Exception)
    finished_signal = pyqtSignal()

    def __init__(self, func, *args):
        super().__init__()
        self.func = func
        self.args = args

    def run(self):
        try:
            r = self.func(*self.args)
            self.success_signal.emit(r)
        except Exception as e:
            self.fail_signal.emit(e)
        self.finished_signal.emit()

    def onSuccess(self, func):
        self.success_signal.connect(func)
        return self

    def onFail(self, func):
        self.fail_signal.connect(func)
        return self

    def onFinished(self, func):
        self.finished_signal.connect(func)
        return self

class TaskManager:
    """
    TaskManager class to manage multiple tasks.
    """
    _instance = None
    _tasks = {}

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def create_task(cls, func, *args, **kwargs):
        if "label" in kwargs:
            label = kwargs["label"]
        else:
            label = "null"
        task = Task(func, *args)
        if label not in cls._tasks:
            cls._tasks[label] = [task]
        else:
            cls._tasks[label].append(task)
        return task

    @classmethod
    def run_task(cls, task: Task):
        task.start()
        task.onFinished(lambda: cls.remove_task(task))
        return task

    @classmethod
    def run_tasks(cls, tasks: list):
        for task in tasks:
            if isinstance(task, Task):
                cls.run_task(task)

    @classmethod
    def remove_task(cls, task: Task):
        for key, value in cls._tasks.items():
            if task in value:
                value.remove(task)
                if len(value) == 0:
                    cls._tasks.pop(key)
                break

    @classmethod
    def is_idle(cls, label: str = "null"):
        return label not in cls._tasks

    @classmethod
    def is_all_idle(cls):
        return len(cls._tasks) == 0
```

### 方法解释

-   **线程执行**：`Task` 类继承自 `QThread`，用于将函数封装在独立线程中执行。通过 `start()` 方法在后台运行耗时操作，避免阻塞主线程。

-   **信号机制**：使用 PyQt 的 `pyqtSignal` 机制，`Task` 类定义了三个信号：
    - success_signal：任务成功完成时触发
    - fail_signal：任务执行异常时触发
    - finished_signal：任务完成时触发（无论成功或失败）

-   **回调函数连接**：通过 `onSuccess`、`onFail` 和 `onFinished` 方法连接回调函数，实现任务成功时更新 UI、失败时显示错误、完成时执行清理等操作。

-   **任务生命周期管理**：
    - create_task：创建任务并添加到 `_tasks` 字典
    - run_task：启动单个任务，完成后自动移除
    - run_tasks：同时运行多个任务
    - remove_task：移除已完成的任务，避免内存泄漏
    - is_idle / is_all_idle：检查任务是否处于空闲状态

### 使用示例

```python
def getDeviceInfo():
    # 一些耗时操作...
    return "模拟设备数据"

task = TaskManager.create_task(getDeviceInfo).onSuccess(lambda deviceInfo: print(deviceInfo)).onFail(lambda e: print(e)).onFinished(lambda: print("任务结束"))
TaskManager.run_task(task)
```
