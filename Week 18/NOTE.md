# 单元测试工具 | Mocha(二)

Mocha 最初也是为 node.js 环境开发的，所以默认是不支持 ES6 module API 的，可以使用 babel 来进行处理，涉及 re 到的包：

```
  "@babel/core": "^7.13.8",
  "@babel/register": "^7.13.8"
```

mocha 引入@babel 支持：

1. 写一个 babel 的配置文件
2. 使用 mocha 的--require api 来指定"@babel/register（"mocha --require @babel/register"），这里注意要使用本地的 mocha 也就是安装到项目上

**把冗长的命令行写到 package.json 中**

在 package.json 中的脚本配置中，会默认的吧`./node_moudles/.bin/`目录添加到命令前面，所以可以这么配置：

```js
// 在命令行中输入的版本，调用本地mocha
./node_modules/.bin/mocha --require @babel/register

// 等效的，写在scripte中，可以省去`./node_moudles/.bin/`
"test": "mocha --require @babel/register"

```

# 单元测试工具 | code coverage

code coverage(代码覆盖率)是测试时的一个重要指标，指源码中被测试代码的比例和程度，可以很好的反映出工程的质量，同时也可以根据分析测试用例来查找出一些设计盲点和无效代码。

**使用 istanbul/nyc 统计 code coverage**

安装：

```js
npm install --save-dev nyc
```

同样的 nyc 也是默认只支持 nodejs 模式，所以为了能够测试 es6 的代码，需要和 babel 配合互相安装插件：

```js
npm i babel-plugin-istanbul @istanbuljs/nyc-config-babel --save-dev
```

在.babelrc 中添加配置：

```js
{
    "plugins": ["istanbul"]
}
```

在.nycrc 中添加配置：

```js
{
    "extends": "@istanbuljs/nyc-config-babel"
}
```

运行 nyc:

在 package.json 中直接配置脚本：

```js
{
  "scripts": {
    "test": "mocha --require @babel/register",
    "coverage": "nyc mocha"
  }
}
```

接下来在开发中：

1. 如果开发业务代码，则运行test脚本，可以查看代码是否有bug
2. 如果编写测试用例，则云清coverage脚本，可以查看测试用例是否覆盖了全部的业务逻辑


> 更多关于code coverage的讨论可以参考[AlloyTeam：伊斯坦布尔测试覆盖率的实现原理](http://www.alloyteam.com/2019/07/13481/)


# 工具链学习总结

**为什么使用工具链技术**

工具链可以把日常中重复的，繁琐的配置等体力工作自动化，大大的解放生产力，同时也避免了手动配置产生的各种问题。

**关于单元测试框架**  

从前对于单元测试不太理解，总觉得有点浪费时间，但是经过了对于`parse-html.js`的单测后，发现单测确实有其意义，确实的发现了一些在开发时想不到的一些bug，以后应当注意对复杂逻辑的业务、组件代码进行单元测试才是。
