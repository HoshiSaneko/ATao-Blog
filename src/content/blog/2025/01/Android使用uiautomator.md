---
title: Android使用uiautomator
date: '2025年01月13日'
tags: ['Android']
summary: 介绍如何在Android中使用Uiautomator进行自动化操作，包含基本用法和应用场景。
---
### 添加依赖

在build.gradle中添加**uiautomator**依赖

```bash
androidTestImplementation 'androidx.test.uiautomator:uiautomator:2.2.0'
```

![添加依赖](https://cdn.atao.cyou/Blog/blog_250116_231853.png){caption:添加依赖}

### 编写用例

需要在**androidTest**中编写用例，而不是在main中。新建一个`test`类，下面是一个打开设置的一个测试。

```java
package com.tt.demo;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.uiautomator.By;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.UiObject2;
import org.junit.Test;
import org.junit.runner.RunWith;
@RunWith(AndroidJUnit4.class)
public class test {
    static UiDevice device;
    @Test
    public void openSettings() throws InterruptedException {
        device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());
        UiObject2 settings = device.findObject(By.text("Settings"));
        if(settings!=null){
            settings.click();
            Thread.sleep(2000);
        }
    }
}
```

:::alert{type:warning, title:注意}
测试类必须有`@RunWith(AndroidJUnit4.class)`运行器装饰，测试方法也必要有`@Test`装饰
:::

### 安装APK

需要安装2个apk，一个是由main中编译出来的apk(傀儡应用)，另一个则是由androidTest编译出来的apk。可以直接通过右侧的Gradle中的install直接安装。

![安装APK](https://cdn.atao.cyou/Blog/blog_250116_232043.png){caption:安装APK}

### 运行测试

打开命令提示符，输入以下指令即可开始进行测试

```bash
adb shell am instrument -w -e class com.tt.demo.test#openSettings com.tt.demo.test/androidx.test.runner.AndroidJUnitRunner
```

[instrument参数](https://developer.android.com/tools/adb?hl=zh-cn#am){material-symbols:android}
