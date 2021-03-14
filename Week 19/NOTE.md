# 实现一个线上 Web 服务 | 初始化 server

使用的是刚好打折活动买的腾讯云的服务器，系统为 Centos 7.5。

**在服务器上安装 node14.x 环境**

第一步：

安装 curl 并且请求 node14.x 的安装脚本

```shell
sudo yum -y install curl
curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -
```

第二步：

使用 yum 安装 nodejs

```shell
sudo yum install -y nodejs
```

该命令将同时安装节点.js 14.x 和 npm。安装的版本可通过以下命令进行检查：

```shell
$ node -v
```

第三步：

顺手安装 yarn

```shell
curl -sL https://dl.yarnpkg.com/rpm/yarn.repo | sudo tee /etc/yum.repos.d/yarn.repo
sudo yum install -y yarn
```

# 实现一个线上 Web 服务 | 利用 Express，编写服务器（一）

## 使用 express 搭建一个静态服务器

**使用 express-generator 快速创建项目**

通过应用生成器工具 express-generator 可以快速创建一个应用的骨架。

使用命令：

```shell
$ npx express-generator
```

对于较老的 Node 版本：

```shell
$ npm install -g express-generator
$ express
```

**目录**

通过生成器创建的应用一般都有如下目录结构：

```
├── app.js // 依赖配置
├── bin // 网络配置和入口文件
│   └── www
├── package.json
├── public  // 静态文件夹
│   ├── images
│   ├── javascripts
│   └── stylesheets
│       └── style.css
├── routes  // 路由
│   ├── index.js
│   └── users.js
└── views // 文件模板
    ├── error.pug
    ├── index.pug
    └── layout.pug

```

使用命令启动，访问 3000 端口即可：

```shell
$ npm start
```

**此次实验的改造**

模拟纯前后端分离的状态，仅发布 html 静态文件所以使用`public`目录来发布静态文件。

删除掉了`app.js`中关于路由的配置代码。

# 实现一个线上 Web 服务 | 利用 Express，编写服务器（二）

## 上传到服务器

使用 scp 命令上传也可以或者使用 shell 链接工具传也可以。

使用 scp 命令

```shell
scp -r [-P port] ./* name@ip:path
```

# 实现一个发布系统 | 简单了解 Node.js 的流

使用 HTTP 来携带大文件时，可以使用流式的思想来加快传输速度。

**nodejs 中的流**

可使用`fs`模块下的 createReadStream 来读取一个文件流，然后将读出的`chunk`写到`request`中，当文件读取完毕后再调用`request.end()`。

代码：

```js
...
file.on("data", (chunk) => {
  console.log("chunk :>> ", chunk.toString());
  request.write(chunk);
});

file.on("close", (chunk) => {
  request.end(chunk);
});
```

**流式传输的 HTTP 请求设置**

应使用`POST`方式、配置请求头的`Content-Type`为`application/octet-stream`

```js
...
const request = http.request(
  {
    hostname: "127.0.0.1",
    port: 8082,
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
    }
  },
  (response) => {
    console.log("response :>> ", response);
  }
);
...
```

**服务端读取流**

在服务端时的 request 则作为只读流存在，监听`data`来获取 chunk，当`end`事件被触发时则代表数据已经发送完毕了。

```js
...
http.createServer(function(request, response) {
  request.on("data", chunk => {
    console.log('chunk.toString() :>> ', chunk.toString());
  })
  request.on("end", () => {
    response.end("Success");
  })
}).listen(8082);
...
```

# 实现一个发布系统 | 实现多文件发布

**主要思路**

1. 在上传工具中以压缩文件的方式来进行传输，而不是单个文件分别发送
2. 在上传服务端中则把代码解压到对应的文件夹下

**设计到的包**

1. 服务端中会用到`unzipper`用于解压文件
2. 工具中会用到`archiver`用于压缩文件

> 目前是一个覆盖式的发布，所以如果删除文件或文件夹后会导致有多余的文件，根据实际情况添加逻辑即可。


**pipe api怎么理解**

pipe这个api的作用是将两个流链接起来，个人觉得是一个比较高级的语法糖，它把两个流的管道链接起来减少了流操作时需要考虑的大量的边界情况。

参考：[Nodejs Stream pipe 的使用与实现原理分析](https://zhuanlan.zhihu.com/p/136333515);


# 实现一个发布系统 | 用GitHub oAuth做一个登录实例

![发布系统鉴权时序图](./github%20oAuth%20发布系统鉴权时序图.jpg)