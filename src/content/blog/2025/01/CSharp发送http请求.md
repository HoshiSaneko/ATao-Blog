---
title: C#发送http请求
date: '2025年01月06日'
tags: ['代码片段', 'C#']
summary: 本文介绍如何用C#简单封装HTTP请求，包括GET、POST方法及网络连通性检测，附核心代码实现。
---
### 开发背景

对http请求进行简单封装

### 功能实现

```c#
public class Requests
{
    /// <summary>
    /// 异步发送GET请求并返回响应内容。
    /// </summary>
    /// <param name="url">请求的URL。</param>
    /// <param name="timeout">请求的超时时间（秒），默认为10秒。</param>
    /// <return>响应内容</return>
    public static async Task<string> Get(string url, int timeout=10)
    {
        try
        {
            using HttpClient client = new();
            client.Timeout = TimeSpan.FromSeconds(timeout);
            // 发送GET请求
            HttpResponseMessage response = await client.GetAsync(url);
            // 确保请求成功
            response.EnsureSuccessStatusCode();
            // 读取响应内容
            string responseBody = await response.Content.ReadAsStringAsync();
            return responseBody;
        }
        catch (HttpRequestException ex)
        {
            //Log.Error($"HTTP request failed: {ex.Message}");
            return ex.Message;
            //throw new HTTPError($"HTTP request failed: {ex.Message}");
        }
        catch (HTTPTimeoutError ex)
        {
            //Log.Error($"HTTP request timeout: {ex.Message}");
            return ex.Message;
            //throw new HTTPTimeoutError($"HTTP request timeout: {ex.Message}");
        }
    }

    /// <summary>
    /// 异步发送POST请求并返回响应内容。
    /// </summary>
    /// <param name="url">请求的URL。</param>
    /// <param name="content">请求的内容。</param>
    /// <param name="timeout">请求的超时时间（秒），默认为60秒。</param>
    /// <return>响应内容</return>
    public static async Task<string> PostAsync(string url, string content, int timeout=60)
    {
        // 创建HttpClient实例
        using HttpClient client = new();
        client.Timeout = TimeSpan.FromSeconds(timeout);
        // 设置请求的内容类型
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        // 创建HttpContent对象
        StringContent stringContent = new(content, Encoding.UTF8, "application/json");
        try
        {
            // 发送POST请求
            HttpResponseMessage response = await client.PostAsync(url, stringContent);
            // 确保请求成功
            response.EnsureSuccessStatusCode();
            // 读取响应内容
            string responseBody = await response.Content.ReadAsStringAsync();
            return responseBody;
        }
        catch (HttpRequestException ex)
        {
            //Log.Error($"HTTP request failed: {ex.Message}");
            return ex.Message;
            //throw new HTTPError($"HTTP request failed: {ex.Message}");
        }
        catch (HTTPTimeoutError ex)
        {
            //Log.Error($"HTTP request timeout: {ex.Message}");
            return ex.Message;
            //throw new HTTPTimeoutError($"HTTP request timeout: {ex.Message}");
        }
    }

    /// <summary>
    /// 同步发送POST请求并返回响应内容。
    /// </summary>
    /// <param name="url">请求的URL。</param>
    /// <param name="content">请求的内容。</param>
    /// <param name="timeout">请求的超时时间（秒），默认为60秒。</param>
    /// <return>响应内容</return>
    public static string Post(string url, string content, int timeout = 60)
    {
        // 创建HttpClient实例
        using HttpClient client = new();
        client.Timeout = TimeSpan.FromSeconds(timeout);
        // 设置请求的内容类型
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        // 创建HttpContent对象
        StringContent stringContent = new(content, Encoding.UTF8, "application/json");
        try
        {
            // 发送POST请求
            HttpResponseMessage response = client.PostAsync(url, stringContent).Result;
            // 确保请求成功
            response.EnsureSuccessStatusCode();
            // 读取响应内容
            string responseBody = response.Content.ReadAsStringAsync().Result;
            return responseBody;
        }
        catch (HttpRequestException ex)
        {
            //Log.Error($"HTTP request failed: {ex.Message}");
            return ex.Message;
            //throw new HTTPError($"HTTP request failed: {ex.Message}");
        }
        catch (HTTPTimeoutError ex)
        {
            //Log.Error($"HTTP request timeout: {ex.Message}");
            return ex.Message;
            //throw new HTTPTimeoutError($"HTTP request timeout: {ex.Message}");
        }
    }

    /// <summary>
    /// 尝试对指定的URL进行Ping操作，检查网络连接是否可达。
    /// </summary>
    /// <param name="url">要Ping的目标URL或IP地址。</param>
    /// <returns>如果Ping成功（即没有超时），则返回true；如果Ping超时或失败，则返回false。</returns>
    public static bool Ping(string url)
    {
        return !NProcess.RunReturnString($"ping {url} -n 1 -w 100", false).Contains("请求超时");
    }
}
```
