# 持续集成 | 发布前检查的相关知识

持续集成最早由客户端程序员提出，早期的客户端开发模式为：按模块独立开发->整合联调，这种模式的成本非常高，所以从节省成本的角度提出了持续集成的概念，但与前端的现在将的持续集成虽然目标相同但是在细节上有些许出入：

**daily build的差别**

客户端开发build成本高以小时为单位，大项目动辄好几个小时，所以提出了daily build的概念，即每天build一下局部代码验证编码的正确性，但是前端开发中的build成本则底很多，快的几十秒慢的几分钟，所以对于daily build的要求则降低了很多。

**BVT的差别**

客户端开发中在build成功后一些涉及UI等层面的操作上没办法用单测覆盖，所以需要由测试工程师出case来测试，成本也是很高的，而前端开发周期短很多，一般以周为单位，所以再由测试工程师来提供全部的case显然不太划算，所以在前端领域BVT也不是很重要的模块，转而是使用Lint和无头浏览器来进行基础的测试就足够了。

# 持续集成 | Git Hooks基本用法

`git hooks`存在于`/.git/hooks/*`文件夹下，默认情况下存在一些.sample的示例代码，如果需要开发时只需写一个同名无后缀的脚本即可。

[开发文档](https://www.git-scm.com/book/zh/v2/%E8%87%AA%E5%AE%9A%E4%B9%89-Git-Git-%E9%92%A9%E5%AD%90)

**使用node开发hooks**

在脚本的头部添加`#!/usr/bin/env node`指定脚本引擎即可使用nodejs开发hooks。


# 持续集成 | 使用无头浏览器检查DOM

以前用过puppeteer来当爬虫拉一下短视频的链接，现在知道了一种新的用途就是来测试ui框架的性能和自动化测试。

参考资料：

1. [puppeteer的运用](https://maizsss.github.io/2018/06/11/headlesschrome%E5%B0%81%E8%A3%85%E5%BA%93puppeteer%E7%9A%84%E8%BF%90%E7%94%A8/)
2. [自动化 Web 性能分析之 Puppeteer 爬虫实践](https://www.infoq.cn/article/ZZDG2iqhZ73elE8vIsye)