## 安装 webpack

- 安装本地 webpack，全局 webpack 可能会导致版本不一致
- 需要 webpack、webpack-cli；
- webpack 属于开发依赖所以安装时添加-D 表示开发依赖，打包时会剔除 webpack 依赖

## webpack 功能

- webpack 支持 0 配置使用，但是功能支持偏弱；
- webpack 的指责之一是将代码打包成 js 模块；
- webpack 打包命令与执行流程：
  - 使用`npx webpack`执行打包命令；
  - 此时 webapck 会自动寻找`node_modules/.bin`下的`webpack.cmd`；
  - 如果当前目录下存在`node.exe`则执行`node.exe`与`webpack.js`；
  - 否则执行当前目录下的上级目录下的（也就是`node_modules`文件夹）`webpack.js`。
- 打包的意义：可以对 js 代码进行模块化等问题的兼容和转换，同时也可以对发布的代码进行压缩。

## 手动配置

根目录下创建文件：webpack.config.js

## 打包原理/机制

运行npx webpack执行打包命令

查看打包后的文件可以发现，该文件的主要结构为:

```js
(
  function(modules) {
    var installedModules = {}; // 缓存依赖
    function __webpack_require__ (moduleId) { // webpack实现的require
      if(installedModules[moduleId]) {
        return installedModules[moduleId].exports;
      }
      var module = installedModules[moduleId] = {
        i: moduleId,
        l: false, // 是否以经安装依赖
        exports: {} // 导出的对象
   		};
      modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
      module.l = true;
      return module.exports;
    }
    ... // 一些打包模式等代码
    return __webpack_require__(__webpack_require__.s = "./src/index.js");
  }
)({
   "./src/index.js": (
     function(module, exports, __webpack_require__) {
       eval("let testMode = __webpack_require__(/*! ./testMode */ \"./src/testMode.js\");\r\n\r\nconst a = 1;\r\nconst b = 2;\r\n\r\nconst c = a + b;\r\n\r\nconsole.log(\"webpack first\");\r\nconsole.log(c);\r\nconsole.log(testMode);\r\n\n\n//# sourceURL=webpack:///./src/index.js?") //
     }
   ),
   "./src/testMode.js": (
     function(module, exports) {
       eval("\r\nmodule.exports = 'test mode'\n\n//# sourceURL=webpack:///./src/testMode.js?");
     }
   )
   ... // 其他依赖
});
```

通过该结构可以发现，webpack 是以一个立即执行函数注册全部的依赖，通过递归的方式将所有的依赖注册完成后，会将导出的内容依次的返回到上层调用。

具体流程为：

- 立即执行函数注册全部依赖；
- 调用**webpack_require**()传入入口文件的 key(路径)，并返回其执行结果；
- **webpack_require**函数根据 key 找到依赖调用其文件内容（文件内容通过函数内部的 eval 执行）并传入 module, module.exports, **webpack_require**(这个参数如果当前文件有依赖时才会传入)等参数；

## html 服务器与插件

### html 服务器

该插件是开始时常用插件，可以使 html 页面以服务器的形式发布，方便调试

- 使用`yarn add webpack-dev-server -D`安装；
- 在 webpack.config.js 中添加 devServer 对象进行配置；
  - port：8080 //端口
  - progress： true //进度条
  - contentBase： './dist' //配置目录
- 使用 npx webpack-dev-server 命令启动服务器

### html 插件

该插件可以在每次打包和运行时服务器将 html 模板文件复制到输出目录下并自动引入打包后的文件，同时该插件还支持对 html 进行压缩处理，减小打包体积

- 使用`yarn add html-webpack-plugin -D`安装插件；
- 在 webpack.config.js 中引入该插件；
- 在 plugins 中注册改插件并配置；
  - template： "./public/index.html" // html 打包模板
  - filename： "index.html" // 打包后的 html 名称,
  - hash: true // 是否添加 hash 戳
  - minify: {collapseWhitespace: true} // 体积压缩配置

## plugins

plugins是一系列的webpack功能扩展的工具包，实现将一些webpack之外的功能集成到webpack中；
plugins定义在plugins属性中；
plugins一定是一个导出类；
plugins的定义格式为

```js
 plugins: [
  new HtmlWebpackPlugin({
    // 插件的配置项
    template: "./public/index.html",
    filename: "index.html",
  }),
  new MiniCssExtractPlugin({
    filename: 'index.css'
  })
],
```
plugins的调用顺序不会被注册顺序影响


## loader

loader 的作用就是解析一些本事不支持的文件类型；
loader 定义在 webpack.config.js 的 module.rules 属性中;
loader 的定义格式为

```js
module: {
  rules: [
    // 第一种对象方式定义，loader字段为注册loader，options为loader的配置对象
    {
      test: /\.css$/,
      use: [
        {
          loader: "style-loader",
          options: {
            insertAt: 'top'
          }
        },
        "css-loader"
      ]
    },
    // 第二种方式，直接在数组中添加loader的名称来注册loader
    {
      test: /\.less$/,
      use: ["style-loader", "css-loader", "less-loader"]
    }
  ];
}
```

loader的调用规则：当有多个loader时，从右向左执行，比如解析less文件需要先使用less-loader编译为css再使用css-loader转换成模块，最后用style-loader插入到html模板中

### loader的一些配置项

- include作用的文件夹
- exclude排除的文件夹



## css的兼容优化

部分css属性存在浏览器兼容问题，所以需要加上浏览器前缀来进行兼容，使用postcss-loader和autoprefixer插件可以实现自动对css属性添加前缀

```js
 module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', ,'css-loader', 'postcss-loader']
      },
    ]
  }
```
postcss-loader需要在css-loader之前进行处理，所以要添加在css-loader的后面，同时为了让postcss-loader知道使用哪个插件来进行添加前缀，需要在根目录下添加配置文件`postcss.config.js`


## css的抽离和压缩

### css的抽离

在使用style-loader时css样式会被插入到html文档的头部，这对页面的加载很不友好，所以需要提取出一个或多个的css文件以引用的方式会更好。

css的抽离使用`mini-css-extract-plugin`插件来实现，使用步骤为：

- 在plugins中注册插件，并配置filename属性
- 把style-loader替换为MiniCssExtractPlugin.loader

这样在打包的时候就会看到css文件已经从html模板中抽离出来打包为了单独的文件。

> 如果需要打包出多个css文件如css、less、sass等文件分别打包可以创建多个`mini-css-extract-plugin`插件并在对应的loader配置中替换即可。

### css的压缩

css代码在抽离后不会直接被压缩所有压缩css代码需要引入其他的插件`optimize-css-assets-webpack-plugin`

安装好后在webpack.config.js中


```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
module.exports = {
  optimization: {
    minimizer: [new OptimizeCSSAssetsPlugin({})],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'index.css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
    ],
  },
};
```

## babel的使用

babel是一个下一代 JavaScript 语法编译器，用于把高版本的语法（es6及以上）转换到低版本（es5）。

在webpack中引入babel的方式很简单，分为几个部分：

- 安装babel-loader并注册到webpack中；
- 安装@babel/core是Babel的核心包,里面存放着转换的核心api；
- 安装@babel/preset-env,多个plugins的集合，同时包含了es2015、es2016、es2017以及最新版本，是官方推荐的预设集合。

### 配置

在webpack.config.js中添加`babel-loader`

```js
module: {
  rules: [
    { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
  ]
}
```

在根目录下新建`.babelrc`文件

添加预设集合和一些特殊插件

```js
{
  "presets": ["@babel/preset-env"],
  "plugins": [
    "@babel/plugin-proposal-class-properties"
  ]
}
```

## js的优化


### @babel/plugin-transform-runtime和@babel/runtime

当使用了一些es6的语法时，由于转换成es5需要加入一些帮助代码，这些代码会在使用的地方都加入一遍造成重复，使打出来的包体积变大，安装插件`@babel/plugin-transform-runtime`和`@babel/runtime`后可以把这些帮助代码全部抽离出来在后续使用的时候通过引入的形式导入到文件中，从而减小打包的体积。

安装使用：

```js
npm install --save-dev @babel/plugin-transform-runtime

// 或

yarn add @babel/plugin-transform-runtime -D

---------------------------------

npm install --save @babel/runtime

// 或

yarn add @babel/runtime
```

`@babel/plugin-transform-runtime`为开发时依赖在打包时就将代码加入到包中，而`@babel/runtime`在运行时根据具体情况来判断如何使用加入的帮助代码。

### @babel/polyfill

polyfill是一个垫片程序，该程序通过es5模拟完整的es6+环境，因此可以安全的使用新的内置函数。

安装使用：
```js
yarn add @babel/polyfill

--------------------

// 在入口文件引入

require("@babel/polyfill");

// 或

import "@babel/polyfill"；

```

### 影响

使用`@babel/polyfill`后会导致Promise，Set和Map这些内置的插件污染全局命名空间，有时会导致引入的库或被其他人引入时发生意外的bug，在v7以后官方提供了新的替代方案来代替使用polyfill。

## polyfill的升级方案

@babel/polyfill不必再安装，转而需要依靠core-js和regenerator-runtime（详细原因请看作者的阐述），替代方案用法如下：

安装两个新的包

```js
yarn add core-js regenerator-runtime
```

在.babelrc中配置

```js
{
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs": false,
        "helpers": true,
        "regenerator": true,
        "useESModules": false
      }
    ]
  ]
}
```

然后在入口文件中导入

```js
import "core-js/stable"
import "regenerator-runtime/runtime"
```

> 打包后包体积大约会增大400k

## 全局变量的处理

当引入jQuery这些依赖时，我们希望是在window上可以获取到全局的$，这时可以使用一下几种方法来吧$暴露到全局中。

### 使用expose-loader

安装loader

```js
yarn add expose-loader
```
使用

```js
// 在入口文件中
import $ from 'expose?$!jquery'

// 或

// 在webpack.config.js文件中加入
{
  test: path.resolve('jquery'),
  loader: 'expose-loader?$'
}
```

### 使用webpack插件

这种方式是使用webpack插件在每个模块中都注入一个$

```js

// 在webpack.config.js文件中引入webpack插件
const webpack = require("webpack");

// 在plugins选项中加入
new webpack.ProvidePlugin({
  $: 'jquery'
})

```

### 通过cdn方式引入

这种方式是通过cdn的方式在html模板中加入script标签引入，这和以前的引入方式没什么区别，只有一点需要注意，当通过cdn引入的时候是不需要在通过`import $ from 'jquery'`等方式引入的，因为在这时再引入的话会导致jquery打包到生产中造成重复和包体积增大。

所以在使用cdn引入后如果一定要在通过模块的方式引入的话，可以在webpack配置中加上`externals`属性来进行忽略

```js
externals: {
  jquery: '$'
}
```

## 图片打包

webpack中使用图片的三种方式，分别是

- 在js文件中使用
- 使用css background(url)
- 使用image标签

### 在js文件中使用

在js中使用图片时不能直接给Image对象设置路径字符串，这样的话会被识别为普通字符串而不是一个图片资源

```js
// 错误的使用方式
const img = new Image();
img.src = './tree01.png';
```

应该是通过`import/require`方式导入到文件中，在进行使用；通过`import/require`方式导入的文件会在内部生成一个新的图片并返回新图片的地址

安装使用

首先要安装file-loader来帮助实现上面的说的功能

```js
yarn add file-loader -D
```

在webpack.config.js中配置loader

```js
// 在module选项中插入
{
  test: /\.(png|jpg|gif|jpeg)$/, // 匹配以png、jpg、jpeg、gif结尾的资源
  use: 'file-loader'
},
```
在js文件中导入资源

```js
import treeImg from './tree01.png';

console.log(treeImg); // 是一个生成的新的以hash戳命名的图片 eg：c49d75b8b21e664625d3f7734a8cd8e9.png

const img = new Image();

img.src = treeImg;

document.body.appendChild(img);
```

这个时候运行npx webpack查看打包路径会发现图片已经可以打包到文件夹中。

### 使用css background(url)

同样的使用到了上面说的`file-loader`只不过是把引入图片的位置从js文件转移到了css文件中，通过css文件中使用`background-image: url('./anim8.png');`样式可以起到和导入一样的效果，webpack会把`url()`中的路径解析生成一个新的图片并输出到打包路径中。

```css
body {
  background-image: url('./anim8.png');
  /* 相当于 */
  /* background-image: url(require('./anim8.png')); */
}
```

### 使用image标签

在html页面中直接使用image标签来进行打包的话需要额外使用到另一个loader：html-withimg-loader，使用该loader可以达到和上面一样的效果。

安装使用

```js
yarn add html-withimg-loader -D
```

配置:html-withimg-loader需要搭配file-loader一起使用，在使用的时候需要把file-loader的esModule设置为flase，不然导出以后src会是`{default: 图片地址}`

```js
{
  test: /\.html$/,
  use: 'html-withimg-loader'
},
{
  test: /\.(png|jpg|gif|jpeg)$/,
  use: { loader: "file-loader", options: { esModule: false } }
},
```

### 优化一下

项目打包以后我们不想所有的图片都会发送一个http请求，而是想小图片直接以base64的形式打包到代码中，而大一些的图片才发送请求；此时我们只需要把上面的`file-loader`换成`url-loader`即可。

```js
// 安装
yarn add url-loader -D

// 配置

// {
//   test: /\.(png|jpg|gif|jpeg)$/,
//   use: { loader: "file-loader", options: { esModule: false } }
// }
// 把上面的配置替换为下面的配置

{
  test: /\.(png|jpg|gif|jpeg)$/,
  use: { 
    loader: "url-loader", 
    options: 
      { 
        esModule: false, 
        limit: 200*1024  // 按字节算，这里是200*1024=200k
      } 
    }
}
```

> 如果同样有搭配`html-withimg-loader`的需求不要忘记配置一下`esModule: false`

## 打包文件的分类

打包后的文件我们希望像开发时一样可以按照css、js、img等资源类型进行分类，所以我们需要在配置上简单配置一下。

### js输出路径

直接在output.filename选项中修改即可

```js
output: {
  // 输出配置
  filename: "js/bundle.js", // 输出的文件名
  path: path.resolve(__dirname, "dist"), // 输出的目录
},
```

### css输出路径

在抽离css的插件处配置`outputPath`即可

```js
plugins: [
  new MiniCssExtractPlugin({
    filename: "css/index.css",
  }),
]
```

### img输出路径

在`url-loader`的选项中配置`outputPath`即可

```js
module: [
  {
    test: /\.(png|jpg|gif|jpeg)$/,
    use: {
      loader: "url-loader",
      options: { esModule: false, limit: 1, outputPath: "img/" },
    },
  },
]
```

### 关于资源访问时的前缀路径

项目发布后资源如果出于cdn或服务器上的话，我们会希望在图片、css等资源访问时加上域名等前缀，此时我们只需要在webpack.config.js中配置`output.publicPath`属性即可

```js
output: {
  // 输出配置
  filename: "js/bundle.js", // 输出的文件名
  path: path.resolve(__dirname, "dist"), // 输出的目录
  publicPath: 'http://www.example.com'
},
```

此时所有的资源都会自动加上这个前缀，但是需要注意的是此时图片的路径上会少一个`/`所以添加了publicPath以后需要在img的输出路径上多加以个`/`

```js
module: [
  {
    test: /\.(png|jpg|gif|jpeg)$/,
    use: {
      loader: "url-loader",
      options: { esModule: false, limit: 1, outputPath: "/img/" },// 需要多加一个/
    },
  },
]
```

另外如果只想在图片或css等某一资源上添加前缀的话在对应的loader或插件（具体取决于使用什么做的输出文件操作）上设置publicPath就可以了

```js
// 以图片为例
module: [
  {
    test: /\.(png|jpg|gif|jpeg)$/,
    use: {
      loader: "url-loader",
      options: { 
      esModule: false, 
      limit: 1, 
      outputPath: "/img/", // 需要多加一个/
      publicPath:'http://www.example.com' },
    },
  },
]
```

## 多页面打包

多页面程序，顾名思义就是拥有多个入口页面并且每个页面有独立的入口文件，这是与前面的单页面模式最大的不同点。

### 准备

要打包多页面当然需要准的是多个入口文件

首先准备一个空的node项目，然后在项目中添加

- 在src文件夹下创建`home.js`、`other.js`两个入口文件， 并在里面随便写点代码（比如console）
- 在public文件夹下创建`index.html`模板
- 安装`webpack`、`webpack-cli`、`html-webpack-plugin`依赖
- 添加webpack配置文件
  
### 配置

下面我们来开始进行配置文件的编写

*第一步*

第一步肯定是编写入口文件

```js
module.exports = {
  mode: "development",
  entry: {
    home: "./src/index.js",
    other: "./src/other.js",
  },
}
```
这里入口文件的配置与单页面配置不同的是要以对象的形式进行配置，分别配置为对应的入口文件即可，其中key值会作为后面打包文件的文件名

*第二步*

第二步添加一下打包文件的输出配置

```js
module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.js",
    other: "./src/other.js",
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
}
```

然后运行一下`npx webpack`，看看效果，不出意外的会产生报错

```js
ERROR in chunk other [entry]
bundle.js
Conflict: Multiple chunks emit assets to the same filename bundle.js (chunks index and other)
```
这里报错信息告诉我们多个模块将发射为同名的文件(home和other)，这证明我们的`filename: "bundle.js"`配置的有错误，
此时打开我们输出的`bundle.js`文件会发现只有`index.js`打包成功了，这显然不是我们想要的，为了解决这个问题，需要把这里修改成根据我们打包的文件自动的生成文件名，这样就不怕文件名冲突了

```js
const path = require("path");
module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.js",
    other: "./src/other.js",
  },
  output: {
-   filename: "bundle.js",
+   filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
}
```

这里可以看到我们从`bundle.js`改成了`[name].js`，再次运行`npx webpack`，可以看到将两个文件都打包成功并成功以各自的名称进行命名

*第三步*

多页面顾名思义，肯定也是需要多个html页面来作为载体，所以这里继续使用`html-webpack-plugi`这个插件进行html和打包文件的整合和输出， 先看配置

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.js",
    other: "./src/other.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./public/index.html",
    }),
    new HtmlWebpackPlugin({
      filename: "other.html",
      template: "./public/index.html",
    }),
  ],
};
```

由于是多页面的打包，所以我们的需求肯定是输出多个html页面，但是`html-webpack-plugin`的配置中`filename`并不能写成数组、也不能像`output`属性写成`[name].html`，所以我们就通过再new一个插件的实例并分别配置页面输出来解决这个问题。

现在运行一下命令`npx webpack`，成功打包后，任意打开一个打包后的html页面，我们会发现他们把两个入口文件都引入了

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  
<script src="home.js"></script><script src="other.js"></script></body>
</html>
```

虽然说打包成功了，但是都引入了全部的入口文件那直接打包到一个文件中岂不美哉，所以我们还要改一下配置

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.js",
    other: "./src/other.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./public/index.html",
      chunks: ["home"],
    }),
    new HtmlWebpackPlugin({
      filename: "other.html",
      template: "./public/index.html",
      chunks: ["other"],
    }),
  ],
};
```

这次我们给每一个页面的配置添加了一个`chunks`配置项，这是告诉插件我们当前这个html想要引入那些文件，
里面填写我们想要引入的文件名就可以了。

再次运行`npx webpack`，这次可以看到在dist文件夹下，正确的打包了两个入口文件`index.js`和`other.js`以及两个入口html`index.html`和`other.html`并且两个文件中都正确的引入了对应的入口文件。

到此为止一个多页面应用的配置和打包流程就算结束了，可以拿着打好的包丢到服务器里去浪里个浪啦~

## souce-map

source-map的出现是为了解决当我们的程序进行了打包压缩后由于代码被压缩在一行或几行的情况下无法调试错误的痛点。

source-map是一个信息文件，里面存储的是转换后与转换前的代码的对应关系，当调试工具支持source-map功能时便可以根据source-map中的信息将报错正常的显示出来。

在webpack中是通过devtool选项来进行source-map的生成以下列举几个选项：

| 选项                         | 生产环境 | 输出                                                                     |
| ---------------------------- | -------- | ------------------------------------------------------------------------ |
| eval                         | 不推荐   | 生成后的代码（如经过babel转换过后的）                                    |
| source-map                   | 可行     | 输出源代码和映射文件，可有准确的输出报错行和列                           |
| eval-source-map              | 不推荐   | 输出源代码但是不产生映射文件，是通过在打包文件内通过eval方式输出报错信息 |
| cheap-source-map             | 不推荐   | 低开销的source-map，不能定位到列                                         |
| cheap-eval-source-map        | 不推荐   | 低开销的eval-source-map，不能定位到列                                    |
| cheap-module-source-map      | 不推荐   | 输出源代码和映射文件，仅输出行信息                                       |
| cheap-module-eval-source-map | 不推荐   | 输出源代码但没有映射文件，仅输出行信息                                   |
| hidden-source-map            | 可行     | 与source-map相同，但是不会添加引用注释，不向浏览器暴露source map         |
| nosources-source-map         | 可行     | 生成的source map不会包含源码                                             |

### 其他方式

来自[官网](https://www.webpackjs.com/configuration/devtool/#devtool)上的其他配置方式

> *你可以直接使用* [SourceMapDevToolPlug](https://www.webpackjs.com/plugins/source-map-dev-tool-plugin/) */* [EvalSourceMapDevToolPlugin](https://www.webpackjs.com/plugins/eval-source-map-dev-tool-plugin/) *来替代使用* `devtool` *选项，因为它有更多的选项。切勿同时使用* `devtool` *选项和* `SourceMapDevToolPlugin`*/*`EvalSourceMapDevToolPlugin` *插件。*`devtool` *选项在内部添加过这些插件，所以你最终将应用两次插件。*


## watch

watch可以在运行了webpack打包命令后，持续的监听文件变化来重新编译打包。

### 配置

```js
module.exports = {
  ...
  watch: true,
  watchOptions: {
    aggregateTimeout: 500,
    poll: 1000,
    ignored: /node_modules/,
  }
}
```

- aggregateTimeout防抖时间，超过指定时间未修改才进行打包
- poll毫秒单位的轮询时间间隔
- ignored排除一些大的文件夹


## 其他插件

### clean-webpack-plugin

这个插件的作用是清空output.path文件夹，所以可以在打包时利用该插件先清空掉原有的dist文件夹，然后生成新的打包文件，避免出现打包文件叠加或者缓存问题。

#### 安装和使用

运行命令

```js
yarn add clean-webpack-plugin -D
```
在配置文件中配置

```js
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = {
  ...
  plugins: [
    new CleanWebpackPlugin()
  ]
}
```

### copy-webpack-plugin

这个插件的作用是将一个指定目录copy到output.path文件夹，利用这个插件我们可以在打包时把一些静态文件（如图片、音频、视频等）自动的拷贝到打包目录下。

#### 安装和使用

运行命令

```js
yarn add copy-webpack-plugin -D
```
在配置文件中配置

```js
const CopyWebpackPlugin = require("copy-webpack-plugin");
module.exports = {
  ...
  plugins: [
    new CopyWebpackPlugin([
      {
        from: './static',
        to: './static'
      }
    ])
  ]
}
```


## webpack跨域

### devServer代理
dev-server 使用了非常强大的 http-proxy-middleware 包来将请求代理到单独的后端服务器上。

#### 使用方式

```js
module.exports = {
  ...
  devServer: {
    proxy: {
      "/api": {
        target: "http://192.168.1.1:8088",
        pathRewrite: {
          "^/api": ''
        }
      }
    }
  }
}
```

这样就可以实现跨域访问后端api了。


### 前端模拟数据

同样是基于`devServer`选项来配置，不过这次用的是一个钩子——before


```js
module.exports = {
  ...
  devServer: {
    before(app){
      app.get('/api/user', function(req, res) {
        res.json({ custom: 'response' });
      });
    }
  }
}
```

这里devServer会自动传入一个app参数，这个参数就是express的实例对象，多以我们就可以在这个方法内像写后台一样写一些简单的后端代码来模拟数据。

### 前后端代码写在一起（此方法只适合nodejs服务器）

#### express版本

安装中间件`webpack-dev-middleware`

```js
// server.js

const express = require("express");
const webpack = require("webpack");
const webpackDev = require("webpack-dev-middleware");
const webpackConfig = require("./webpack.config.js");

const app = express();


const complier = webpack(webpackConfig);

app.use(webpackDev(complier));

app.get('/user', (req, res) => {
  // do something
})


app.listen(8080);
```

#### koa2版本

安装中间件`koa-webpack`

```js
// server.js

const Koa = require('koa');
const webpack = require('webpack');
const config = require('./webpack.config.js');
const koaWebpack = require('koa-webpack');

const app = new Koa();
const compiler = webpack(config);
const middleware = await koaWebpack({ compiler });
 
app.use(middleware);


app.listen(3000);
```

这样前后端就是运行在同一个服务器的状态了，所以也就不会发生跨域问题了。


## resolve

resolve选项能设置模块如何被解析。

### modules

告诉 webpack 解析模块时应该搜索的目录。

使用绝对路径，将只在给定目录中搜索。

```js
module.exports = {
  ...
  resolve: {
    modules: ["node_modules"]
  }
}
```

只在`node_modules`目录中搜索


### alias

给资源配置别名，可以是某一目录下或某一文件

```js
const path = require("path");
module.exports = {
  ...
  resolve: {
    modules: ["node_modules"],
    alias: {
      '@': path.resolve(__dirname, 'src'),// 设置src前缀为@
    }
  }
}

// 文件中使用时
import Test from '@/Test.js'

```

### mainFields

当从 npm 包中导入模块时，此选项将决定在 package.json 中使用哪个字段导入模块。

```js
module.exports = {
  ...
  resolve: {
    modules: ["node_modules"],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    mainFields: ["style", "main"] // 首先使用style字段导入模块，找不到再使用main字段导入模块
  }
}

// 文件中引用
import 'bootstrap';
```

## 定义环境变量

使用webpack的内置插件`DefinePlugin`

```js
module.exports = {
  ...
  plugins: [
    new Webpack.DefinePlugin({
      MODE: JSON.stringify("dev")
    })
  ]
}

// 文件中使用 index.js

if (MODE === "dev") {
  console.log("dev");
} else {
  console.log("prod");
}
```

> 定义的值会去掉引号后传入到环境变量中，所以如果传入字符串需要用JSON.stringify转换一下，如果是boolean和number等类型则不需要转换直接写作`FLAG:'true'`、`NUM:'1'`就可以了；如果是表达式也可以和number一样直接写，这样会直接传入表达式的计算结果如：`EXPRESSION:'1+1'`的打印值为2

## 区分环境

在开发中我们往往开发环境和生产环境的配置并不相同，为了不在每次打包时都去更改配置文件（费力且容易出错）我们可以使用`webpack-merge`模块来实现自动的注入不同环境的配置。

### 安装使用

**安装模块**

```js
yarn add webpack-merge -D
```

**使用**

merge允许我们把多个配置文件合并起来使用，所以我们可以在根目录下创建`webpack.dev.js`和`webpack.prod.js`来分别配置不同环境的配置，下面以dev环境做个例子

```js
const { smart } =  require("webpack-merge")
const base = reuqire("./webpack.base.js") // 引入公用配置

module.exports = smart(base, {
  mode: 'development',
  // 其他配置
  ...
})
```

在启动时我们只需要指定不同的配置文件即可实现不同环境的切换

```js
// 生产环境
npm run dev -- --config webpack.dev.js

// 开发环境
npm run build -- --config webpack.prod.js
```


## 一些优化点

### noParse忽略无依赖大型库

noParse的作用是防止 webpack 解析那些任何与给定正则表达式相匹配的文件。忽略的文件中不应该含有 import, require, define 的调用，或任何其他导入机制。忽略大型的 library 可以提高构建性能。

**应用场景**

在引入库时，明确的知道该库不存在其他依赖且该库体积较大时，比如引入JQuery时

```js
module.exports = smart(base, {
  ...
  module: {
    noParse: /jquery|lodash/,  // 正则的方式
    noParse: function(content) { // webpack 3.0.0 写法
      return /jquery|lodash/.test(content);
    },
  }
})
```

### IgnorePlugin忽略依赖包的指定文件

IgnorePlugin是webpack的内置插件，作用是忽略掉指定依赖包下的指定文件，如moment的本地化文件。

**应用场景**

IgnorePlugin接受两个参数，分别是

- 匹配(test)资源请求路径的正则表达式；
- 匹配(test)资源上下文（目录）的正则表达式（可选）。

```js
const webpack = require('webpack');
module.exports = smart(base, {
  ...
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
})
```

### DllPlugin实现输出dll库

DllPlugin允许webpack将bundles文件进行拆分，来提升构建速度

可以把不会变动的大型库通过dll的方式打包出去，如React、Vue等依赖，然后在构建项目时就会先去dll清单中寻找相关依赖，如果找到了就不会重复打包，找不到时再进行打包操作。

**使用步骤**

- 在根目录下创建一个专门用来打包dll的配置文件，如webapck.dll.test.js；
- 在dll配置文件中使用DllPlugin来配置打包信息；
- 使用命令行传参数的方式运行dll的配置文件，单独打包；
- 在html模板和项目主webpack配置中引入dll；

**out.library**

`out.library`是将模块输出为一个可以被直接使用的包，也就是会在webpack打包后将模块赋值给一个变量，变量名即为`library`的值，默认使用`var`方式导出

```js
// out.library = 'test_dll' 时导出的模块

var test_dll =
(function(modules) { // webpackBootstrap
  ...
  return __webpack_require__(__webpack_require__.s = 0);
})({
  // 依赖模块
})
```

**DllPlugin**

webpack的内置插件，可以单独写在一个配置文件里使用。

- path：manifest json 文件的绝对路径
- name：暴露出的 DLL 的函数名要与 `out.library`相同


**DllReferencePlugin**

webpack的内置插件，应该写在项目打包时所使用的配置文件中

- manifest：DllPlugin导出的manifest文件的绝对路径

**配置示例**

```js
// webapck.dll.test.js

const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: 'development',
  entry: {
		test: ['./src/test.js'],
	},
	output: {
		path: path.join(__dirname, "dist"),
		filename: "[name].dll.js",
		library: "[name]_dll"
	},
	plugins: [
		new webpack.DllPlugin({
			path: path.join(__dirname, "dist", "[name]-manifest.json"),
			name: "[name]_dll"
		})
	]
};

// webpack.config.js

const path = require("path");
const webapck = require("webpack");
module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    ...
    new webapck.DllReferencePlugin({
      manifest: path.resolve(__dirname, 'dist', 'test-manifest.json')
    })
  ],
};

```

### 多线程打包Happypack

Happypack一个三方插件，用来开启多线程进行打包


**使用方式**

修改`module.rules`中需要多线程打包的文件，把`loader`修改为`happypack`的`loader`并通过`?id=`的方式设置`id`,创建一个`Happypack`插件的实例，并配置`id`和`loader`（把原来的loader配置复制过来就可以了）

首先安装插件

```js
yarn add happypack -D
```

在配置中修改配置

```js
// webpack.config.js
const path = require("path");
const Happypack = require("happypack");
module.exports = {
  ...
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['Happypack/loader?id=js'],
      },
    ],
  },
  plugins: [
    ...
    new Happypack({
      id: 'js',
      use: [
        'babel-loader'
      ]
    })
  ],
};
```

**happypack参数**

- id: String 用唯一的标识符 id 来代表当前的 Happypack 是用来处理一类特定的文件.
- loaders: Array 用法和 webpack Loader 配置中一样.
- threads: Number 代表开启几个子进程去处理这一类型的文件，默认是3个，类型必须是整数。
- verbose: Boolean 是否允许 HappyPack 输出日志，默认是 true。
- threadPool: HappyThreadPool 代表共享进程池，即多个 HappyPack 实例都使用同一个共享进程池中的子进程去处理任务，以防止资源占用过多。
- verboseWhenProfiling: Boolean 开启webpack --profile ,仍然希望HappyPack产生输出。
- debug: Boolean 启用debug 用于故障排查。默认 false。


### webpack自带的优化策略

#### tree-shaking

`tree-shaking`策略会在生产环境下裁剪掉当前代码中多余的引入，如导出库中导出多个函数但是我们只用到了一个，在打包后webpack会自动的裁减掉多余的函数来减小包的体积。

`tree-shaking`只会对生产环境且使用`import`方式导入的代码生效，对`require`语法不生效。

#### scope-hosting

`scope-hosting`策略会在生产环境下对当前代码进行分析并进行优化合并

```js
let a = 1;
let b = 2;
let d = 3;
let d = a + b + c;

console.log(d);

// scope-hosting后会优化掉前面a,b,c，d的声明，直接打印计算结果
console.log(6)
```

### 多页面打包公共代码抽离

打包多页面时，我们会想着将多出引用的文件进行抽离，当后续文件进行访问时可以快速的使用缓存来提升效率，那么就可以使用`optimization.splitChunks`来进行配置。

> 在`webpack4`中`CommonsChunkPlugin`插件被移除，代替方案是使用`optimization.splitChunks`来进行配置。

```js
const path = require("path");
module.exports = {
  mode: "production",
  entry: {
    index: "./src/index.js",
    other: "./src/other.js",
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          // 公用部分抽离
          minSize: 0, 
          minChunks: 2, 
          chunks: "initial",
        },
        vendor: {
          // 第三方库抽离
          test: /node_modules/,
          priority: 1, 
          minSize: 0, 
          minChunks: 2, 
          chunks: "initial", 
        },
      },
    },
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  ...
};
```

**配置项**

- cacheGroups缓存组
  - test 匹配路径的正则表达式
  - priority 执行权重，越大越先执行
- chunks表示哪些代码需要优化，有三个可选值：initial(初始块)、async(按需加载块)、all(全部块)，默认为async
- minSize表示在压缩前的最小模块大小，默认为30000
- minChunks表示引用多少次才进行优化
- name拆分出来块的名字，默认由块名和hash值自动生成


### 懒加载

webpack的懒加载方式，使用es6草案中的import函数即可。


### 热加载

热加载能让我们在修改代码后由webpack自动的把项目重启并运行，省去了人工的繁琐操作。

```js
const webapck = require("webpack");
module.exports = {
  ...
  devServer: {
    hot: true // 开启热更新
  },
  plugins: [
    new webapck.HotModuleReplacementPlugin(), // 开启热更新
    new webapck.NamedModulesPlugin() // 打印更新的文件
  ]
  ...
}

```

配置好以后，现在更改文件后保存会发现webpack重新编译了代码，并且页面会强制刷新。


#### HotModuleReplacementPlugin热更新替换插件

不要使用在生产环境

**属性**
- multiStep (boolean)：设置为 true 时，插件会分成两步构建文件。首先编译热加载 chunks，之后再编译剩余的通常的资源。
- fullBuildTimeout (number)：当 multiStep 启用时，表示两步构建之间的延时。
- requestTimeout (number)：下载 manifest 的延时（webpack 3.0.0 后的版本支持）。
  
> 这些选项属于实验性内容，因此以后可能会被弃用。就如同上文所说的那样，这些选项通常情况下都是没有必要设置的，仅仅是设置一下 new webpack.HotModuleReplacementPlugin() 在大部分情况下就足够了。

#### NamedModulesPlugin

当开启 HMR 的时候使用该插件会显示模块的相对路径，建议用于开发环境。


## tapable

Tapable是一个用于事件发布订阅执行的插件架构

### 具体内容需要查阅文档


### Sync簇

主要方法：

- tap 注册钩子
- call 按顺序同步执行钩子
- 
#### SyncHook

最基本的同步的钩子事件流

**使用示例**

```js
const { SyncHook } = require("tapable");

class Lesson {
  constructor() {
    this.hooks = {
      arch: new SyncHook(["name"]),
    };
  }

  tap() {
    this.hooks.arch.tap("vue", (name) => {
      console.log("vue :>> ", name);
    });
    this.hooks.arch.tap("node", (name) => {
      console.log("node :>> ", name);
    });
  }

  start() {
    this.hooks.arch.call("yut");
  }
}

const lesson = new Lesson();

lesson.tap();

lesson.start();

// 输出:
// vue :>>  yut
// node :>>  yut
```

**模拟实现**

```js
class SyncHook {
  constructor(args) {
    this.tasks = [];
  }

  tap(name, task) {
    this.tasks.push(task);
  }

  call(...args) {
    this.tasks.forEach((task) => task(...args));
  }
}

const hook = new SyncHook(["name"]);

hook.tap("node", (name) => {
  console.log("node :>> ", name);
});
hook.tap("vue", (name) => {
  console.log("vue :>> ", name);
});

hook.call("yuht");
```

#### SyncBailHook

带有熔断机制的同步钩子事件流，当其中一个钩子执行返回非undefined时，则中断后续钩子的执行

**使用示例**

```js
const { SyncBailHook } = require("tapable");

class Lesson {
  constructor() {
    this.hooks = {
      arch: new SyncBailHook(["name"]),
    };
  }

  tap() {
    this.hooks.arch.tap("vue", (name) => {
      console.log("vue :>> ", name);
      return "stop"
    });
    this.hooks.arch.tap("node", (name) => {
      console.log("node :>> ", name);
    });
  }

  start() {
    this.hooks.arch.call("yut");
  }
}

const lesson = new Lesson();

lesson.tap();

lesson.start();
```

**模拟实现**

```js
class SyncBailHook {
  constructor(args) {
    this.tasks = [];
  }

  tap(name, task) {
    this.tasks.push(task);
  }

  call(...args) {
    let ret, index = 0, len = this.tasks.length
    do {
      ret = this.tasks[index++](...args);
    } while (ret === undefined && index < len);
  }
}

const hook = new SyncBailHook(["name"]);

hook.tap("node", (name) => {
  console.log("node :>> ", name);
  return "stop"
});
hook.tap("vue", (name) => {
  console.log("vue :>> ", name);
});

hook.call("yuht");

// 输出:
// node :>>  yut
```

#### SyncWaterfallHook

瀑布流模式的同步钩子事件流，可以传递参数到下一个钩子中，调用call是传入的参数不会传入到后续钩子中

**使用示例**

```js
const { SyncWaterfallHook } = require("tapable");

class Lesson {
  constructor() {
    this.hooks = {
      arch: new SyncWaterfallHook(["name"]),
    };
  }

  tap() {
    this.hooks.arch.tap("vue", (name) => {
      console.log("vue :>> ", name);
      return "params"
    });
    this.hooks.arch.tap("node", (data) => {
      console.log("node :>> ", data);
    });
  }

  start() {
    this.hooks.arch.call("yut");
  }
}

const lesson = new Lesson();

lesson.tap();

lesson.start();

// 输出：
// node :>>  yuht
// vue :>>  params
```

**模拟实现**

```js
class SyncWaterfallHook {
  constructor(args) {
    this.tasks = [];
  }

  tap(name, task) {
    this.tasks.push(task);
  }

  call(...args) {
    const [first, ...other] = this.tasks;
    let ret;
    ret = first(...args);
    other.reduce((a, b) => {
      return b(a);
    }, ret);
  }
}

const hook = new SyncWaterfallHook(["name"]);

hook.tap("node", (name) => {
  console.log("node :>> ", name);
  return "params";
});
hook.tap("vue", (data) => {
  console.log("vue :>> ", data);
});

hook.call("yuht");
```

#### SyncLoopHook

能够实现重复调用某一函数的同步钩子事件流

**使用示例**

```js
const { SyncLoopHook } = require("tapable");

class Lesson {
  constructor() {
    this.index = 0;
    this.hooks = {
      arch: new SyncLoopHook(["name"]),
    };
  }

  tap() {
    this.hooks.arch.tap("vue", (name) => {
      console.log("vue :>> ", name);
      return ++this.index === 3 ? undefined : "loop"
    });
    this.hooks.arch.tap("node", (data) => {
      console.log("node :>> ", data);
    });
  }

  start() {
    this.hooks.arch.call("yut");
  }
}

const lesson = new Lesson();

lesson.tap();

lesson.start();

// 输出：
// node :>>  yuht
// node :>>  yuht
// node :>>  yuht
// vue :>>  yuht
```

**模拟实现**

```js
class SyncLoopHook {
  constructor(args) {
    this.tasks = [];
  }

  tap(name, task) {
    this.tasks.push(task);
  }

  call(...args) {
    this.tasks.forEach((task) => {
      let ret;
      do {
        ret = task(...args);
      } while (ret != undefined);
    });
  }
}

const hook = new SyncLoopHook(["name"]);
let loopNums = 0;
hook.tap("node", (name) => {
  console.log("node :>> ", name);
  return ++loopNums === 3 ? undefined : "loop";
});
hook.tap("vue", (data) => {
  console.log("vue :>> ", data);
});

hook.call("yuht");
```

### Async簇

#### AsyncParralleHook

并行异步钩子，有`回调函数模式`和`promise模式`两种调用模式。

**回调函数模式**
在注册钩子时使用tapAsync，此时会多传入一个回到函数，当钩子执行完毕时需要调用该回调。
在启动时调用callAsync，此时需要传入一个回调函数，此回调函数在所有钩子执行完毕后被调用。





**promise模式**
在注册钩子是使用tapPromise，返回一个promise对象。
在启动时调用promise，返回一个promise对象，当所有钩子执行成功后该promise进入完成状态。



#### AsyncParallelBailHook

带有熔断的异步钩子，当任意一个钩子返回值非undefined的值时就不会调用最终的回调钩子。



### webpack原理分析

- 首先需要创建一个compiler工具类来进行编译模块
  - 需要传入config来加载文件并进行解析
  - 主要函数包括：
    - 构造函数
      - entryId 用于存入口文件
      - modules 用于存放所有的模块依赖
      - entry 用于存放入口文件
      - config 缓存配置
    - run() 用来启动编译函数
    - buildModule() 用来创建依赖关系
    - emitFile() 发射打包后的文件
    - parse() 解析模块内容并返回源码和依赖关系
- AST的应用
  - babylon
  - @babel/types
  - @babel/traverse
  - @babel/generator