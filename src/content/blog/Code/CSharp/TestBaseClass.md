---
title: C#测试基类实现
date: '2025年01月14日'
tags: ['代码片段', 'C#']
summary: 本文介绍如何通过抽象测试基类简化C#自动化测试流程，实现用例循环执行、结果统计和失败重试等功能，并附有核心代码和使用示例。
---
## 开发背景

在开发自动化测试工具时，我们经常面临对测试用例进行循环压力测试的需求。由于测试类的重复编写工作量较大，因此计划开发一个抽象基类来简化这一过程。

## 设计思路

### 测试流程

测试流程大致如下图所示:

![测试流程](https://cdn.atao.cyou/Blog/blog_250116_231604.png){caption:测试流程}

整个测试流程包含一个外层大循环（`circle`），用于控制测试的总轮次。流程开始时，先执行带有`@BeforeClass`注解的方法。随后，对每个测试用例（即带有`@Test`注解的方法）进行循环测试，每个测试用例根据其自身的循环次数（`count`）进行多次执行。在每次测试用例执行前，先调用带有`@Before`注解的方法，紧接着执行具体的测试逻辑，最后调用带有`@After`注解的方法。如此实现了测试流程的自动化和分阶段管理。

### 测试结果

通过`TestResult`存储单个测试结果的信息，包括如下内容：

| 属性名 | 说明 |
|--------|------|
| **Id** | 唯一标识 |
| **Circle** | 测试循环次数 |
| **Case** | 测试用例名称 |
| **Description** | 测试用例描述 |
| **Count** | 测试用例执行次数 |
| **Status** | 测试状态，成功/失败 |
| **Message** | 失败时的错误信息 |

## 功能实现

### 测试属性

```c#
/// <summary>[test]</summary>
[AttributeUsage(AttributeTargets.Method)]
public class TestAttribute : Attribute
{
    public int Grade { get; set; }
    public int Count { get; set; }
    public string Description { get; set; }

    public TestAttribute(int grade = int.MaxValue, int count = 1, string description = "null")
    {
        Grade = grade;
        Count = count;
        Description = description;
    }
}
```

**TestAttribute**用于标记测试方法
- `Grade`: 测试等级，数值越小优先执行
- `Count`: 测试执行次数
- `Description`: 用例描述

### 方法注释

```c#
/// <summary>[Before]</summary>
[AttributeUsage(AttributeTargets.Method)]
public class BeforeAttribute : Attribute { }
/// <summary>[BeforeClass]</summary>
[AttributeUsage(AttributeTargets.Method)]
public class BeforeClassAttribute : Attribute { }
/// <summary>[After]</summary>
[AttributeUsage(AttributeTargets.Method)]
public class AfterAttribute : Attribute { }
/// <summary>[AfterClass]</summary>
[AttributeUsage(AttributeTargets.Method)]
public class AfterClassAttribute : Attribute { }
```

- `BeforeAttribute`、`BeforeClassAttribute`、`AfterAttribute` 以及 `AfterClassAttribute`：用于标记在测试前后和测试类前后需要执行的方法。

### 测试结果

```c#
/// <summary>存储测试结果</summary>
public class TestResult
{
    public int Id { get; set; } // id
    public int Circle { get; set; } // 循环次数
    public string Case { get; set; } // 测试用例名称
    public string Description { get; set; } // 测试用例描述
    public int Count { get; set; } // 当前用例的执行次数
    public string Status { get; set; } // 测试状态，成功或失败
    public string Message { get; set; } // 失败时的错误信息
}
```

### 抽象基类

```c#
/// <summary>抽象测试类</summary>
public abstract class TestBase(int circle)
{
    private int _circle = circle; // 存储循环次数
    private List<TestResult> _testResults = [];  // 存储测试结果
    private int _successCount = 0;  // 测试成功用例数量
    private int _failCount = 0;  // 测试失败用例数量
    private TestResult _latestTestResult = new();
    public event EventHandler OnResultUpdated;  // 报告更新事件
    public event EventHandler OnTestFinished;  // 测试结束

    private bool isStop = false;
    private Dictionary<string, TestAttribute> _modifiedTestAttributes = new Dictionary<string, TestAttribute>();

    public TestResult LatestTestResult
    {
        get { return _latestTestResult; }
        set { _latestTestResult = value; }
    }

    public int SuccessCount
    {
        get { return _successCount; }
        set { _successCount = value; }
    }

    public int FailCount
    {
        get { return _failCount; }
        set { _failCount = value; }
    }

    /// <summary>运行所有测试</summary>
    public void RunTests()
    {
        // 获取当前类的所有非公共实例方法
        MethodInfo[] methods = GetType().GetMethods(BindingFlags.NonPublic | BindingFlags.Instance);
        // 查找标记有[BeforeClass]特性的方法
        MethodInfo beforeClassMethod = methods.FirstOrDefault(m => Attribute.IsDefined(m, typeof(BeforeClassAttribute)));
        // 查找标记有[AfterClass]特性的方法
        MethodInfo afterClassMethod = methods.FirstOrDefault(m => Attribute.IsDefined(m, typeof(AfterClassAttribute)));
        // 获取所有标记有[Test]特性的方法，并按Grade排序
        //var testMethods = methods
        //    .Where(m => Attribute.IsDefined(m, typeof(TestAttribute)))
        //    .Select(m => new { Method = m, Attr = m.GetCustomAttribute<TestAttribute>() })
        //    .OrderBy(t => t.Attr.Grade) // 直接按Grade排序
        //    .Select(t => t.Method)
        //    .ToArray();
        var testMethods = methods
            .Where(m => Attribute.IsDefined(m, typeof(TestAttribute)))
            .Select(m => new { Method = m, Attr = GetTestAttribute(m) })
            .OrderBy(t => t.Attr.Grade) // 直接按Grade排序
            .Select(t => t.Method)
            .ToArray();

        // 如果存在[BeforeClass]方法，则调用它
        beforeClassMethod?.Invoke(this, null);
        int id = 0;
        // 循环执行测试
        for (int circleIndex = 1; circleIndex <= _circle; circleIndex++)
        {
            if (isStop)
                break;
            // 遍历每个测试方法
            foreach (var testMethod in testMethods)
            {
                if (isStop)
                    break;
                // 获取[Test]特性实例，以获取其属性
                //var testAttr = testMethod.GetCustomAttribute<TestAttribute>();
                var testAttr = GetTestAttribute(testMethod);
                int count = testAttr.Count >= 0 ? testAttr.Count : 1;
                string description = testAttr.Description;

                // 根据[Test]特性中指定的次数执行测试
                for (int countIndex = 1; countIndex <= count; countIndex++)
                {
                    // 查找标记有[Before]特性的方法并执行
                    MethodInfo beforeMethod = methods.FirstOrDefault(m => Attribute.IsDefined(m, typeof(BeforeAttribute)));
                    beforeMethod?.Invoke(this, null);

                    TestResult result;
                    id++;
                    // 执行测试方法，并捕获结果（这里简化了，实际上应处理返回值和异常）
                    try
                    {
                        testMethod.Invoke(this, null);
                        SuccessCount++;
                        result = new TestResult {Id=id, Circle = circleIndex, Case = testMethod.Name, Description= description, Count = countIndex, Status = "Success", Message = "Success" };
                    }
                    catch (Exception ex)
                    {
                        FailCount++;
                        if(ex.InnerException != null)
                            result = new TestResult { Id = id, Circle = circleIndex, Case = testMethod.Name, Description = description, Count = countIndex, Status = "Fail", Message = ex.InnerException.Message };
                        else
                            result = new TestResult { Id = id, Circle = circleIndex, Case = testMethod.Name, Description = description, Count = countIndex, Status = "Fail", Message = ex.Message };
                    }
                    _testResults.Add(result);
                    LatestTestResult = result;
                    OnResultUpdated?.Invoke(this, EventArgs.Empty);

                    // 查找标记有[After]特性的方法并执行
                    MethodInfo afterMethod = methods.FirstOrDefault(m => Attribute.IsDefined(m, typeof(AfterAttribute)));
                    afterMethod?.Invoke(this, null);

                }
            }
        }
        // 查找标记有[AfterClass]特性的方法并执行
        afterClassMethod?.Invoke(this, null);
        OnTestFinished?.Invoke(this, EventArgs.Empty);
    }

    /// <summary>停止测试</summary>
    public void Stop()
    {
        isStop = true;
    }

    public void RunFailedTests()
    {

        // 获取当前类的所有非公共实例方法
        MethodInfo[] methods = GetType().GetMethods(BindingFlags.NonPublic | BindingFlags.Instance);
        // 查找标记有[BeforeClass]特性的方法
        MethodInfo beforeClassMethod = methods.FirstOrDefault(m => Attribute.IsDefined(m, typeof(BeforeClassAttribute)));
        // 查找标记有[AfterClass]特性的方法
        MethodInfo afterClassMethod = methods.FirstOrDefault(m => Attribute.IsDefined(m, typeof(AfterClassAttribute)));

        // 如果存在[BeforeClass]方法，则调用它
        beforeClassMethod?.Invoke(this, null);

        // 遍历所有测试结果
        for (int i = 0; i < _testResults.Count; i++)
        {
            var result = _testResults[i];
            // 检查测试结果是否失败
            if (result.Status == "Fail")
            {
                // 使用反射获取失败的测试方法
                var testMethod = GetType().GetMethod(result.Case, BindingFlags.NonPublic | BindingFlags.Instance);
                if (testMethod != null)
                {
                    // 获取测试方法的TestAttribute属性
                    //var testAttr = testMethod.GetCustomAttribute<TestAttribute>();
                    var testAttr = GetTestAttribute(testMethod);
                    int count = testAttr.Count > 0 ? testAttr.Count : 1;
                    string description = testAttr.Description;

                    // 查找标记有[Before]特性的方法并执行
                    MethodInfo beforeMethod = methods.FirstOrDefault(m => Attribute.IsDefined(m, typeof(BeforeAttribute)));
                    beforeMethod?.Invoke(this, null);

                    TestResult rerunResult;
                    try
                    {
                        testMethod.Invoke(this, null);
                        SuccessCount++;
                        FailCount--;
                        rerunResult = new TestResult { Id = result.Id, Circle = result.Circle, Case = result.Case, Description = description, Count = result.Count, Status = "Success", Message = "Success" };
                    }
                    catch (Exception ex)
                    {
                        rerunResult = new TestResult { Id = result.Id, Circle = result.Circle, Case = result.Case, Description = description, Count = result.Count, Status = "Fail", Message = ex.Message };
                    }

                    // 修改原来的失败结果而不是新增结果
                    var index = _testResults.IndexOf(result);
                    if (index != -1)
                    {
                        _testResults[index] = rerunResult;
                    }
                    else
                    {
                        _testResults.Add(rerunResult);
                    }
                    LatestTestResult = rerunResult;
                    OnResultUpdated?.Invoke(this, EventArgs.Empty);

                    // 查找标记有[After]特性的方法并执行
                    MethodInfo afterMethod = methods.FirstOrDefault(m => Attribute.IsDefined(m, typeof(AfterAttribute)));
                    afterMethod?.Invoke(this, null);
                }
            }
        }

        // 查找标记有[AfterClass]特性的方法并执行
        afterClassMethod?.Invoke(this, null);
        OnTestFinished?.Invoke(this, EventArgs.Empty);
    }

    public void PrintTestResults()
    {
        foreach (var result in _testResults)
        {
            Log.Info($"Circle: {result.Circle}, Case: {result.Case}, Description: {result.Description}, Count: {result.Count}, Status: {result.Status}, Message: {result.Message}");
        }
    }

    public List<TestResult> GetAllTestResults()
    {
        return _testResults;
    }

    public List<TestResult> GetSuccessTestResults()
    {
        List<TestResult> successTestResults = [];
        for (int i = 0; i < _testResults.Count; i++)
        {
            var result = _testResults[i];
            if (result.Status == "Success")
            {
                successTestResults.Add(result);
            }
        }
        return successTestResults;
    }

    public List<TestResult> GetFailTestResults()
    {
        List<TestResult> failTestResults = [];
        for (int i = 0; i < _testResults.Count; i++)
        {
            var result = _testResults[i];
            if (result.Status == "Fail")
            {
                failTestResults.Add(result);
            }
        }
        return failTestResults;
    }

    /// <summary>
    /// 设置指定测试用例的 Count 次数
    /// </summary>
    /// <param name="methodName">测试用例的方法名称</param>
    /// <param name="count">新的 Count 值</param>
    public void SetCaseCount(string methodName, int count)
    {
        // 获取当前类的所有非公共实例方法
        MethodInfo[] methods = GetType().GetMethods(BindingFlags.NonPublic | BindingFlags.Instance);

        // 查找指定名称的测试方法
        MethodInfo testMethod = methods.FirstOrDefault(m => m.Name == methodName) ?? throw new ArgumentException($"未找到名为 {methodName} 的测试方法。");

        // 获取测试方法的 TestAttribute
        var testAttr = testMethod.GetCustomAttribute<TestAttribute>() ?? throw new InvalidOperationException($"测试方法 {methodName} 未标记 [Test] 特性。");

        // 创建一个新的 TestAttribute 实例并修改 Count 属性
        var modifiedAttr = new TestAttribute(testAttr.Grade, count, testAttr.Description);
        _modifiedTestAttributes[methodName] = modifiedAttr;
    }

    private TestAttribute GetTestAttribute(MethodInfo method)
    {
        if (_modifiedTestAttributes.TryGetValue(method.Name, out var modifiedAttr))
        {
            return modifiedAttr;
        }
        return method.GetCustomAttribute<TestAttribute>();
    }
}
```

-   `TestBase` 是一个抽象类，接收一个 `circle` 参数，表示测试的循环次数。

-   `_testResults`包含存储测试结果成功和失败的测试用例计数，以及一个 `OnResultUpdated` 事件，用于在结果更新时触发通知。

-   `RunTests`运行所有测试

-   `Stop`停止测试。但是不会立刻停止，只有当前的测试用例结束后，才会停止

-   `RunFailedTests`运行失败的测试

-   `GetAllTestResults`获取所有测试结果

-   `GetSuccessTestResults`获取成功的测试结果

-   `GetFailTestResults`获取失败的测试结果

-   `SetCaseCount`设置指定测试用例的 Count 次数

## 使用方法

### 简单示例

```c#
public class ExampleTests : TestBase
{
    private BasicReportManager reportManager;  // 用于管理测试报告的存储和更新

    public ExampleTests(int circle=1) : base(circle)
    {
        reportManager = new BasicReportManager($"{DateFormat.Now(DateFormatType.DateTimeLink)}.db", "ExampleTest");
        OnResultUpdated += ExampleTests_OnReportUpdated;   // 订阅测试结果更新事件
    }

    private async void ExampleTests_OnReportUpdated(object sender, EventArgs e)
    {
        reportManager.InsertTestResult(LatestTestResult);
        reportManager.UpdateTestInfo(SuccessCount, FailCount);
        await Task.Delay(2000);
        reportManager.UpdateReportPage();
    }

    [BeforeClass]
    private void BeforeClass()
    {
        reportManager.TestStart();
    }
    [Before]
    private void Before()
    {
        Log.Info("before method");
    }

    [Test(grade:1, count: 50, description:"判断偶数")]
    private void TestMethod1()
    {
        Thread.Sleep(200);
        int randomNumber = new Random().Next(1, 11);
        if (randomNumber % 2 == 0)
            throw new Exception("这是一个偶数");
    }

    [Test(grade: 1, count: 50, description: "判断奇数")]
    private void TestMethod2()
    {
        Thread.Sleep(200);
        int randomNumber = new Random().Next(1, 11);
        if (randomNumber % 2 != 0)
            throw new Exception("这是一个奇数");
    }
    [After]
    private void After()
    {
        Log.Info("after method");
    }
    [AfterClass]
    private void AfterClass()
    {
        reportManager.TestEnd();
        PrintTestResults();
    }
}
```

`BasicReportManager`是一个自定义用来管理测试报告的类，可自由发挥。

### 测试执行

```c#
ExampleTests exampleTests = new();
exampleTests.RunTests();
```

### 测试结果

由`BasicReportManager`自动生成

![测试结果](https://cdn.atao.cyou/Blog/blog_250116_232430.png){caption:测试结果}
