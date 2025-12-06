---
title: 51单片机接收AT指令功能实现
date: '2025年01月03日'
tags: ['代码片段']
summary: 简要介绍51单片机如何通过串口接收和解析AT指令，实现字符串命令的识别与功能控制，并提供相关代码实现思路
---
### 开发背景

51单片机需要接收电脑端发送的指令，来控制继电器的通断，从而控制连接电脑端的USB数据线的通断。

指令配置如下

```bash
AT+USB=1  // 连接usb
AT+USB=0  // 断开usb
```

### 功能实现

具体代码如下

```c
#include <reg52.h>
#include <string.h>

#define uchar unsigned char
#define uint unsigned int

uint dataCount;       // 数据计数器
uint receiveStatus;   // 接收状态：-1未开始，0错误，1开始
uchar receiveStr[10]; // 接收字符串缓冲区
// 函数声明
uint checkReceiveStatus();
void send_str_com(unsigned char *sendStr);

// 初始化串口及相关寄存器
void init()
{
    TMOD = 0x20; // 定时器1工作方式2（8位自动重装）
    PCON = 0x80; // 使能波特率倍增
    TH1 = 0xFD;  // 设置波特率为9600（根据晶振频率调整）
    TL1 = 0xFD;
    TR1 = 1; // 启动定时器1
    REN = 1; // 使能串口接收
    SM0 = 0; // 串口工作方式1（8位UART）
    SM1 = 1;
    EA = 1; // 使能全局中断
    ES = 1; // 使能串口中断
}

void main()
{
    init(); // 初始化串口
    send_str_com("init ok!");
    receiveStatus = -1; // 重置接收状态
    while (1)
    {
        if (checkReceiveStatus() == 1)
        {                             // 如果接收到完整数据
            send_str_com(receiveStr); // 回显接收到的数据

            // 根据接收到的指令执行相应操作
            if (0 == strncmp(receiveStr, "AT+USB=1", 8))
            {
                send_str_com("connect usb");
                P1 = 0xff;
            }
            else if (0 == strncmp(receiveStr, "AT+USB=0", 8))
            {
                send_str_com("break usb");
                P1 = 0x00;
            }
            else
            {
                receiveStatus = -1;        // 重置接收状态
                memset(receiveStr, 0, 10); // 清空接收缓冲区
            }
        }
    }
}

// 串口中断服务程序
void ser() interrupt 4 using 3
{
    if (RI)
    {           // 如果接收到数据
        RI = 0; // 清除接收中断标志
        if (receiveStatus == -1)
        { // 接收第一个数据
            if (SBUF != 'A')
            { // 如果不是AT指令开头报错
                receiveStatus = 0;
                dataCount = 0;
            }
            else
            {
                receiveStatus = 1; // 开始接收
                dataCount = 0;
                memset(receiveStr, 0, sizeof(receiveStr[10])); // 数据清空
                receiveStr[dataCount] = SBUF;                  // 存储第一个字符
                dataCount++;
            }
        }
        else if (receiveStatus == 1)
        { // 正在接收
            if (dataCount > 10)
            {
                receiveStatus = 0;
                dataCount = 0;
            }
            else
            {
                receiveStr[dataCount] = SBUF;
                dataCount++;
            }
        }
    }
}

uint checkReceiveStatus()
{ // 检查接收状态
    if (receiveStatus == 0)
    {
        send_str_com("RECEIVE ERROR");
        receiveStatus = -1;
        return 0;
    }
    if ((dataCount > 1) && (receiveStatus == 1))
    { // 如果接收到完整的一行数据
        if ((receiveStr[dataCount - 2] == 0X0D) && (receiveStr[dataCount - 1] == 0X0A))
        {
            receiveStatus = -1; // 重置接收状态
            return 1;           // 表示接收到完整数据
        }
    }
    return 0;
}

void send_str_com(unsigned char *sendStr) // 发送字符串
{
    uchar i;
    for (i = 0; sendStr[i] != '\0'; i++)
    {
        SBUF = sendStr[i];
        while (TI == 0)
            ;
        TI = 0;
    }
}
```
