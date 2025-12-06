---
title: 配置用户环境变量
date: '2025年01月14日'
tags: ['代码片段', 'C#', 'python']
summary: 本文介绍如何在Windows系统下自动添加用户环境变量PATH，支持C#和Python实现，避免重复添加并检查管理员权限，适用于自动化部署和软件安装场景。
---
### 开发背景

在 Windows 系统应用开发与部署中，环境变量 `PATH` 对查找可执行文件和库文件很重要。手动添加新路径到 `PATH` 繁琐易错，在多用户环境下还会影响系统稳定性。

因此，开发了一个自动化函数用于向用户级 `PATH` 添加新路径。因修改需管理员权限，该函数会检查权限，同时避免重复添加，以提高效率和系统可维护性、可扩展性，方便软件安装更新等操作。

### 功能实现

:::alert{type:info, title:提示}
此项操作需要`管理员`权限
:::

#### C#实现

```c#
private bool AddUserEnvironmentVariable(string targetPath)
{
    WindowsIdentity identity = WindowsIdentity.GetCurrent();
    WindowsPrincipal principal = new(identity);
    if(!principal.IsInRole(WindowsBuiltInRole.Administrator))  // 必须要有管理员权限
        return false;
    // 获取当前用户的环境变量PATH
    string currentPath = Environment.GetEnvironmentVariable("PATH", EnvironmentVariableTarget.User);
    // 检查新路径是否已经存在，以避免重复
    if (!currentPath.Contains(targetPath))
    {
        // 将新路径添加到当前路径
        string updatedPath = currentPath + ";" + targetPath;
        // 设置更新后的环境变量
        Environment.SetEnvironmentVariable("PATH", updatedPath, EnvironmentVariableTarget.User);
        return true;
    }
    return false;
}
```

#### python实现

```python
def add_user_environment_variable(target_path):
    try:
        is_admin = os.getuid() == 0
    except AttributeError:
        import ctypes
        is_admin = ctypes.windll.shell32.IsUserAnAdmin()!= 0
    if not is_admin:
        return False
    path_key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,
                                    r"Environment",
                                    0, winreg.KEY_ALL_ACCESS)  # 获取当前环境变量
    # 获取当前的 Path 环境变量的值
    current_value, type_ = winreg.QueryValueEx(path_key, "Path")
    # 检查新路径是否已经存在，以避免重复
    if target_path not in current_value.split(os.pathsep):
        # 将新路径添加到当前路径，使用 os.pathsep 作为分隔符
        updated_value = current_value + os.pathsep + target_path
        # 设置更新后的环境变量
        winreg.SetValueEx(path_key, "Path", 0, winreg.REG_EXPAND_SZ, updated_value)
        return True
    return False
```
