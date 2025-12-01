---
title: 'markdown渲染测试'
summary: '用于测试 Markdown 渲染对各种语法的支持情况'
date: '2025年11月21日'
tags: []
---

## 1. 标题样式

:::tabs
@tab 一级标题
# 一级标题 (H1)
```md
# 一级标题 (H1)
```

@tab 二级标题
## 二级标题 (H2)
```md
## 二级标题 (H2)
```

@tab 三级标题
### 三级标题 (H3)
```md
### 三级标题 (H3)
```

@tab 四级标题
#### 四级标题 (H4)
```md
#### 四级标题 (H4)
```

@tab 五级标题
##### 五级标题 (H5)
```md
##### 五级标题 (H5)
```

@tab 六级标题
###### 六级标题 (H6)
```md
###### 六级标题 (H6)
```

:::

---

## 2. 文本样式

### 2.1 加粗
:::tabs
@tab 示例
**加粗文本**
@tab Code
```md
**加粗文本**
```
:::

### 2.2 斜体
:::tabs
@tab 示例
*斜体文本*
@tab Code
```md
*斜体文本*
```
:::

### 2.3 粗斜体
:::tabs
@tab 示例
***粗斜体文本***
@tab Code
```md
***粗斜体文本***
```
:::

### 2.4 删除线
:::tabs
@tab 示例
~~删除线文本~~
@tab Code
```md
~~删除线文本~~
```
:::

### 2.5 行内代码
:::tabs
@tab 示例
`行内代码`
@tab Code
```md
`行内代码`
```
:::

### 2.6 下划线
:::tabs
@tab 示例
<u>下划线</u>
@tab Code
```md
<u>下划线</u>
```
:::

### 2.7 高亮文本
:::tabs
@tab 示例
==高亮文本==  
@tab Code
```md
==高亮文本==  
```
:::

### 2.8 上下标
:::tabs
@tab 示例
H~2~O (下标)  
X^2^ (上标)
@tab Code
```md
H~2~O (下标)  
X^2^ (上标)
```
:::

### 2.9 按键
:::tabs
@tab 示例
<kbd>Ctrl</kbd> + <kbd>C</kbd>
@tab Code
```md
<kbd>Ctrl</kbd> + <kbd>C</kbd>
```
:::

---

## 3. 列表 (Lists)

### 3.1 无序列表

:::tabs
@tab 示例
- 布局控件 (Layout Controls)
  - Grid (网格布局)
  - StackPanel (栈式面板)
  - DockPanel (停靠面板)
- 常用控件 (Common Controls)
  - Button (按钮)
  - TextBox (文本框)
    - PasswordBox (密码框)
  - ComboBox (下拉列表)
- 数据显示 (Data Display)
  - DataGrid (数据网格)
  - ListView (列表视图)
  - TreeView (树形视图)

@tab Code
```md
- 布局控件 (Layout Controls)
  - Grid (网格布局)
  - StackPanel (栈式面板)
  - DockPanel (停靠面板)
- 常用控件 (Common Controls)
  - Button (按钮)
  - TextBox (文本框)
    - PasswordBox (密码框)
  - ComboBox (下拉列表)
- 数据显示 (Data Display)
  - DataGrid (数据网格)
  - ListView (列表视图)
  - TreeView (树形视图)
```
:::

### 3.2 有序列表

:::tabs
@tab 示例
1. UI 布局 (Layout)
2. 控件使用 (Controls)
    1. 基础控件 (Basic)
    2. 列表控件 (List)
      1. ListBox
      2. ListView
3. 数据绑定 (Data Binding)

@tab Code
```md
1. UI 布局 (Layout)
2. 控件使用 (Controls)
    1. 基础控件 (Basic)
    2. 列表控件 (List)
      1. ListBox
      2. ListView
3. 数据绑定 (Data Binding)

```
:::

### 3.3 任务列表

:::tabs
@tab 示例
- [x] 学习 XAML 基础语法
- [x] 掌握常用布局控件
- [ ] 深入理解数据绑定
  - [x] 基础绑定用法
  - [ ] MVVM 设计模式
- [ ] 自定义控件样式


@tab Code
```md
- [x] 学习 XAML 基础语法
- [x] 掌握常用布局控件
- [ ] 深入理解数据绑定
  - [x] 基础绑定用法
  - [ ] MVVM 设计模式
- [ ] 自定义控件样式
```
:::

---

## 4. 引用

:::tabs
@tab 示例
> 这是一个标准引用块
>
> > 这是一个嵌套的引用块
>
> 回到第一层引用


@tab Code
```md
> 这是一个标准引用块
>
> > 这是一个嵌套的引用块
>
> 回到第一层引用
```
:::

---

## 5. 代码块

### 5.1 短代码块

:::tabs
@tab 示例
```python
def greet(name):
    """这是一个简单的 Python 函数"""
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("World"))
``` 
:::

### 5.2 长代码块

:::tabs
@tab 示例
```python
import asyncio
import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Optional
from enum import Enum, auto

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OrderStatus(Enum):
    PENDING = auto()
    PROCESSING = auto()
    COMPLETED = auto()
    FAILED = auto()

@dataclass
class OrderItem:
    product_id: int
    quantity: int
    price: float

@dataclass
class Order:
    id: int
    status: OrderStatus
    items: List[OrderItem]
    total_amount: float
    discount: float = 0.0
    updated_at: Optional[datetime] = None

class OrderService:
    def __init__(self, repository):
        self.repository = repository

    async def process_order(self, order_id: int) -> dict:
        try:
            logger.info(f"Starting to process order {order_id}")

            # 获取订单
            order = await self.repository.get_by_id(order_id)
            if not order:
                return {"success": False, "error": "Order not found"}

            # 验证状态
            if order.status != OrderStatus.PENDING:
                return {
                    "success": False, 
                    "error": f"Order {order_id} is not in pending state"
                }

            # 模拟复杂业务逻辑
            await self._calculate_discount(order)
            await self._check_inventory(order.items)

            # 更新订单
            order.status = OrderStatus.PROCESSING
            order.updated_at = datetime.now(timezone.utc)
            
            await self.repository.update(order)

            logger.info(f"Order {order_id} processed successfully")
            return {"success": True, "data": order}

        except Exception as e:
            logger.error(f"Error processing order {order_id}: {str(e)}")
            return {"success": False, "error": str(e)}

    async def _calculate_discount(self, order: Order):
        """异步计算折扣"""
        await asyncio.sleep(0.1)  # 模拟IO延迟
        if order.total_amount > 1000:
            order.discount = order.total_amount * 0.1
            logger.info(f"Applied discount: {order.discount}")

    async def _check_inventory(self, items: List[OrderItem]):
        """检查库存"""
        for item in items:
            if item.quantity <= 0:
                raise ValueError(f"Invalid quantity for item {item.product_id}")
        await asyncio.sleep(0.05)

# 模拟调用
async def main():
    class MockRepo:
        async def get_by_id(self, oid):
            return Order(oid, OrderStatus.PENDING, [OrderItem(1, 2, 100.0)], 1200.0)
        async def update(self, order):
            print(f"DB Update: Order {order.id} status -> {order.status}")

    service = OrderService(MockRepo())
    result = await service.process_order(1001)
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
``` 
:::

---

## 6. 链接

### 6.1 普通链接
:::tabs
@tab 示例
[bilibili](https://www.bilibili.com/)  

@tab Code
```md
[bilibili](https://www.bilibili.com/)  
```
:::

### 6.2 带tooltip的链接
:::tabs
@tab 示例
[bilibili](https://markdown.com.cn "哔哩哔哩 (゜-゜)つロ 干杯~-bilibili")  

@tab Code
```md
[bilibili](https://markdown.com.cn "哔哩哔哩 (゜-゜)つロ 干杯~-bilibili")  
```
:::

### 6.3 带图标的链接
:::tabs
@tab 示例
[bilibili](https://markdown.com.cn){fa6-brands:bilibili}   

@tab Code
```md
[bilibili](https://markdown.com.cn){fa6-brands:bilibili}  
图标库：
1. https://yesicon.app/  
2. https://lucide.dev/icons/
```
:::

---

## 7. 图片

:::tabs
@tab 示例
![alt text](https://cdn.atao.cyou/Web/Avatar.png){align:left, width:10%, caption:示例图片}

@tab Code
```md
![alt text](https://cdn.atao.cyou/Web/Avatar.png){align:left, width:10%, caption:示例图片}
```
:::

---

## 8. 表格

:::tabs
@tab 示例
| 控件名称 | 类别 | 常用属性 | 说明 |
| :--- | :---: | :--- | :--- |
| Button | 交互 | `Content`, `Click` | 最基础的按钮控件 |
| TextBox | 输入 | `Text`, `IsReadOnly` | 单行或多行文本输入框 |
| Grid | 布局 | `RowDefinitions`, `ColumnDefinitions` | 强大的网格布局容器 |
| ListView | 数据 | `ItemsSource`, `ItemTemplate` | 用于展示数据集合的列表 |
| CheckBox | 选择 | `IsChecked`, `Content` | 复选框，支持三态 |

:::

---

## 9. 提示

### 9.1 info

:::tabs
@tab 示例
:::alert{type:info, title:提示}
这是一条信息提示   
:::
@tab Code
```md
:::alert{type:info, title:提示}
这是一条信息提示   
:::
```
:::

### 9.2 success

:::tabs
@tab 示例
:::alert{type:success, title:成功}
操作成功完成   
:::
@tab Code
```md
:::alert{type:success, title:成功}
操作成功完成 
:::
```
:::

### 9.3 warning

:::tabs
@tab 示例
:::alert{type:warning, title:警告}
请注意这个警告
:::
@tab Code
```md
:::alert{type:warning, title:警告}
请注意这个警告
:::
```
:::

### 9.4 error

:::tabs
@tab 示例
:::alert{type:error, title:错误}
发生了一个错误
:::
@tab Code
```md
:::alert{type:error, title:错误}
发生了一个错误
:::
```
:::

---

## 10. 视频

:::tabs
@tab 示例
:::video{width:95%, align:center, controls:true, caption:示例视频}
https://cdn.atao.cyou/Blog/blog_250312_222911.mp4
:::
@tab Code
```md
:::video{width:95%, align:center, controls:true, caption:示例视频}
https://cdn.atao.cyou/Blog/blog_250312_222911.mp4
:::
```
:::

---

## 11. 图表

### 11.1 折线图

:::tabs
@tab 示例
:::chart
{
  "title": {
    "text": "一周访问量趋势"
  },
  "tooltip": {
    "trigger": "axis"
  },
  "legend": {
    "data": ["访问量", "页面浏览量"]
  },
  "grid": {
    "left": "3%",
    "right": "4%",
    "bottom": "15%",
    "containLabel": true
  },
  "xAxis": {
    "type": "category",
    "boundaryGap": false,
    "data": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
  },
  "yAxis": {
    "type": "value"
  },
  "series": [
    {
      "name": "访问量",
      "type": "line",
      "stack": "Total",
      "data": [120, 132, 101, 134, 90, 230, 210]
    },
    {
      "name": "页面浏览量",
      "type": "line",
      "stack": "Total",
      "data": [220, 182, 191, 234, 290, 330, 310]
    }
  ]
}
:::

@tab Code
```md
:::chart
{
  "title": {
    "text": "一周访问量趋势"
  },
  "tooltip": {
    "trigger": "axis"
  },
  "legend": {
    "data": ["访问量", "页面浏览量"]
  },
  "grid": {
    "left": "3%",
    "right": "4%",
    "bottom": "15%",
    "containLabel": true
  },
  "xAxis": {
    "type": "category",
    "boundaryGap": false,
    "data": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
  },
  "yAxis": {
    "type": "value"
  },
  "series": [
    {
      "name": "访问量",
      "type": "line",
      "stack": "Total",
      "data": [120, 132, 101, 134, 90, 230, 210]
    },
    {
      "name": "页面浏览量",
      "type": "line",
      "stack": "Total",
      "data": [220, 182, 191, 234, 290, 330, 310]
    }
  ]
}
:::
```
:::

### 11.2 柱状图

:::tabs
@tab 示例
:::chart
{
  "title": {
    "text": "月度发文与评论"
  },
  "tooltip": {
    "trigger": "axis",
    "axisPointer": {
      "type": "shadow"
    }
  },
  "legend": {
    "data": ["文章发布", "评论数量"]
  },
  "grid": {
    "left": "3%",
    "right": "4%",
    "bottom": "15%",
    "containLabel": true
  },
  "xAxis": {
    "type": "category",
    "data": ["一月", "二月", "三月", "四月", "五月", "六月"]
  },
  "yAxis": {
    "type": "value"
  },
  "series": [
    {
      "name": "文章发布",
      "type": "bar",
      "data": [4, 6, 3, 8, 5, 7]
    },
    {
      "name": "评论数量",
      "type": "bar",
      "data": [12, 25, 18, 42, 30, 35]
    }
  ]
}
:::

@tab Code
```md
:::chart
{
  "title": {
    "text": "月度发文与评论"
  },
  "tooltip": {
    "trigger": "axis",
    "axisPointer": {
      "type": "shadow"
    }
  },
  "legend": {
    "data": ["文章发布", "评论数量"]
  },
  "grid": {
    "left": "3%",
    "right": "4%",
    "bottom": "15%",
    "containLabel": true
  },
  "xAxis": {
    "type": "category",
    "data": ["一月", "二月", "三月", "四月", "五月", "六月"]
  },
  "yAxis": {
    "type": "value"
  },
  "series": [
    {
      "name": "文章发布",
      "type": "bar",
      "data": [4, 6, 3, 8, 5, 7]
    },
    {
      "name": "评论数量",
      "type": "bar",
      "data": [12, 25, 18, 42, 30, 35]
    }
  ]
}
:::
```
:::

### 11.3 饼图

:::tabs
@tab 示例
:::chart
{
  "title": {
    "text": "博客内容分类",
    "left": "center"
  },
  "tooltip": {
    "trigger": "item"
  },
  "legend": {
    "orient": "vertical",
    "left": "left"
  },
  "series": [
    {
      "name": "文章数量",
      "type": "pie",
      "radius": "50%",
      "data": [
        { "value": 35, "name": "技术分享" },
        { "value": 20, "name": "生活随笔" },
        { "value": 15, "name": "阅读感悟" },
        { "value": 10, "name": "旅行游记" },
        { "value": 5, "name": "其他" }
      ],
      "emphasis": {
        "itemStyle": {
          "shadowBlur": 10,
          "shadowOffsetX": 0,
          "shadowColor": "rgba(0, 0, 0, 0.5)"
        }
      }
    }
  ]
}
:::

@tab Code
```md
:::chart
{
  "title": {
    "text": "博客内容分类",
    "left": "center"
  },
  "tooltip": {
    "trigger": "item"
  },
  "legend": {
    "orient": "vertical",
    "left": "left"
  },
  "series": [
    {
      "name": "文章数量",
      "type": "pie",
      "radius": "50%",
      "data": [
        { "value": 35, "name": "技术分享" },
        { "value": 20, "name": "生活随笔" },
        { "value": 15, "name": "阅读感悟" },
        { "value": 10, "name": "旅行游记" },
        { "value": 5, "name": "其他" }
      ],
      "emphasis": {
        "itemStyle": {
          "shadowBlur": 10,
          "shadowOffsetX": 0,
          "shadowColor": "rgba(0, 0, 0, 0.5)"
        }
      }
    }
  ]
}
:::
```
:::

### 11.4 雷达图

:::tabs
@tab 示例
:::chart
{
  "title": {
    "text": "博客运营指标"
  },
  "radar": {
    "indicator": [
      { "name": "SEO优化", "max": 100 },
      { "name": "内容质量", "max": 100 },
      { "name": "更新频率", "max": 100 },
      { "name": "用户互动", "max": 100 },
      { "name": "网站速度", "max": 100 },
      { "name": "社交分享", "max": 100 }
    ]
  },
  "series": [
    {
      "name": "各项指标评分",
      "type": "radar",
      "data": [
        {
          "value": [85, 90, 75, 60, 95, 70],
          "name": "当前状态"
        },
        {
          "value": [95, 95, 90, 85, 98, 90],
          "name": "目标状态"
        }
      ]
    }
  ]
}
:::

@tab Code
```md
:::chart
{
  "title": {
    "text": "博客运营指标"
  },
  "radar": {
    "indicator": [
      { "name": "SEO优化", "max": 100 },
      { "name": "内容质量", "max": 100 },
      { "name": "更新频率", "max": 100 },
      { "name": "用户互动", "max": 100 },
      { "name": "网站速度", "max": 100 },
      { "name": "社交分享", "max": 100 }
    ]
  },
  "series": [
    {
      "name": "各项指标评分",
      "type": "radar",
      "data": [
        {
          "value": [85, 90, 75, 60, 95, 70],
          "name": "当前状态"
        },
        {
          "value": [95, 95, 90, 85, 98, 90],
          "name": "目标状态"
        }
      ]
    }
  ]
}
:::
```
:::

---
