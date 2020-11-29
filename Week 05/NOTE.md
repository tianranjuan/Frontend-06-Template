# 11.24 proxy 与双向绑定 | proxy 的基本用法

Proxy 对象用于定义基本操作的自定义行为（如属性查找、赋值、枚举、函数调用等）。是一种通过拦截机制对被代理对象进行访问和修改的强大 api，由于被代理过的对象行为会变的不可预测，所以 winter 老师建议不要使用在业务开发中，而在开发底层库时还是可以使用的，用来增强库的能力（如 Vue3.0 就是用 proxy 重写了原来的 ObjectDefined 的数据劫持逻辑）。

Proxy 对象包含三个基本元素

**target**

被 Proxy 代理虚拟化的对象。它常被作为代理的存储后端。根据目标验证关于对象不可扩展性或不可配置属性的不变量（保持不变的语义）。

**handler**

处理器对象，可以为被代理对象设置拦截器（traps）。

**traps**

拦截器函数，提供属性访问的方法。通过多种多样的钩子对被代理对象进行灵活的自定义操作。

**handler 可配置的 traps**

1. construct: 用于拦截`new`操作符；
2. get/set: 用于拦截读写操作；
3. apply: 用于函数调用动作的拦截；
4. has: 用于拦截`in`操作符；
5. deleteProperty: 用于拦截`delete`操作符；
6. ...

一共提供了 13 种拦截器，可以查阅 MDN 的 Proxy 词条查阅

**如何使用？**

语法

```
const p = new Proxy(target, handler)
```

Hello world!

```js
let obj = {
  a: "hello",
  b: "world",
};

let objProxy = new Proxy(obj, {
  set(target, property, value, receiver) {
    console.log("我在set值时被触发 :>>");
    console.log("被代理对象 :>> ", target);
    console.log("当前操作的属性名 :>> ", property);
    console.log("新属性值 :>> ", value);
    console.log("最初被调用的对象 :>> ", receiver);
  },
});
```

**traps 的参数有什么？**

1. target: 指被代理的对象，也叫目标对象，也是我们实际想操作的那个对象；
2. property: 此次拦截时的将被设置的属性名或 Symbol；
3. value: 此次拦截时设置的新值；
4. receiver: 最初调用的对象，一般是代理后的 proxy 对象自身，但是由于存在原型链的关系，可能触发的对象并不是一个 proxy 对象而是一个原型链上存在 proxy 对象的对象，此时的操作也会触发原型链上的拦截器，所以这个值会指向真实触发了操作的那个对象的引用。

## 参考

- [Proxy - MDN 词条](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

# 11.25 proxy 与双向绑定 | 模仿 reactive 实现原理（一）

这节内容比较简单，就简单记录下实践上的知识。

**最佳实践**

通过函数将 proxy 包装起来，达到复用的效果。

如果是要做一个完全代理的话，需要考虑一下全部的 hook 情况，防止发生意料外的调用。

# 11.25 proxy 与双向绑定 | 模仿 reactive 实现原理（二）

**vue3.0 中 reactive 的核心 effect**

这里涉及太多的 Vue3.0 知识，还没有完全跟进，先 mark 上，简单了解一下作用。

effect 的主要作用是负责收集依赖，更新依赖

effect 每次跟踪的对象和属性是只在当前回调函数中涉及到的，也只有在这些属性发生变化时才会触发事件，effect 不会被一个未跟踪的属性所触发。

接收两个参数

- callback
- options

在 Vue3.0 中通过 track 和 trigger 进行依赖的收集和事件分发

能够响应的类型

- 基本类型
- prototype 操作
- function
- 数组的变化
- 计算属性
- symbol

每次调用返回的都应该是一个新函数

等...

- [Vue3.0 源码分析--effect](https://vue3js.cn/reactivity/effect.html)
- [Vue3.0 源码分析--effect 单测解析](https://vue3js.cn/reactivity/effect.spec.html)
- [Vue3.0 文档--reactive 模块](https://vue3js.cn/vue-composition-api/#reactive)

# 11.25 proxy 与双向绑定 | 模仿 reactive 实现原理（三）

**思路**

callbacks 从上节课的数组改为了 map，用于多级存储对象和属性的依赖关系。

依赖的层级

```
callbacks:
  - target: 一个被监听的reactive对象作为索引
    - prop0: 对象中的某个属性
      - [callback1, callback2]: 回调队列
    - prop1: 对象中的某个属性
      - [callback1]: 回调队列

```

1. 创建一个全局的响应跟踪表 usedReactivities[]；
2. 在 effect 调用时
   1. 先调用一次 callback，此时会触发 callback 中使用到的 reactive 的 get 钩子；
   2. 在 reactive 的 get 钩子中，将 target 和 prop 作为一个二元组 push 到 usedReactivities 中；
   3. 遍历 usedReactivities
      1. 判断 callbacks 中是否已存在当前对象的依赖索引，没有则为该索引创建一个 map 对象；
      2. 判断当前 reactive 对象的依赖，是否存在当前 prop 的依赖，没有则创建一个数组到该索引中（也可以是别的数据结构，视具体场景而定，这里使用数组是因为可以支持多个 effect 对同一个属性的监听）；
      3. 将 callback 的函数体按 target-> prop 的索引顺序添加到回调队列中。
3. 在改变 reactive 值时，通过 set 钩子进行如下操作
   1. 使用 target 当做索引获取 callbacks 中对应的属性依赖关系；
   2. 使用当前的属性获取当前属性的依赖关系，获取到回调队列；
   3. 遍历并执行回调队列，触发事件。

判断是否以存在当前所以是属于防御性代码，防止多次注册。

在 set 中可以判断当前属性的新值与原始值是否相等，相等的话直接 return 可以减少不必要的触发。

# 11.29 proxy 与双向绑定 | 优化 reactive

添加 effect 对级联调用的支持

**为什么 effect 使用级联调用时不生效？**

是因为当被代理对象是级联调用的情况时，深层的属性如果是对象的话，会因为不是一 reactive 导致没有被代理，所以不会向 usedReactivities 中添加回调，所以也就不会触发。

> 此时值是会争取的修改到被代理对象只是 effect 没有触发。

所以我们需要在 get 钩子中，添加逻辑：如果获取的是对象类型，则返回其 reactive 包装后的代理对象。

**缓存 proxy 对象**

由于 reactive 返回的是一个新的 proxy 所以每次调用到都会产生新的 proxy 对象，后面在调用的时候访问的也会不是一个 proxy，产生了一个重复代理的问题，所以需要有一个全局变量来缓存所有的 proxy 对象，防止重复代理。

# 11.29 proxy 与双向绑定 | reactivity 响应式对象

**reactive + effect 函数的应用**

实质上是一个半成品的数据绑定功能，可以灵活的定制，实现一个双向绑定的功能。

在视频的示例中其实就是一个简单版的 vue 的 v-model 的实现过程，如果配合上 v-model 这样的语法糖那么和 vue 其实并无差异（效果上）

如果没有 compiler 去实现一个语法糖，那么直接使用也是一个很好用的工具，如：在使用 canvas api 的过程中使用的话就可以把图元与数据进行绑定了，这样在绘制时只需要处理数据，而图元的变化则可以根据 model 自动更新，同样的图元数据的更新也可以自动更新的 model 上，这样的话应该是可以把图元更加抽象，api 封装更简单。

# 11.29 使用 Range 实现 DOM 精确操作 | 基本拖拽

**细节**

以前在做一些简单的拖拽时总感觉不跟手，这回问题找到了。

1. 为了保证拖拽时不会因为拖拽过快或鼠标移除浏览器而导致拖拽的元素掉下去，所以 move 事件和 up 事件应该是监听在 document 上的，然后在 up 事件时，需要移除 move 和 up 的监听；
2. 为了减少 move 事件和 up 事件的触发频率和时机问题，所以 move 事件和 up 事件的监听应该在 down 事件内监听，也就是鼠标按下以后再监听 move 和 up 两个事件。

**拖拽的基本框架**

```js
let dragable = document.querySelector("#dragable");

dragable.addEventListener("mousedown", (event) => {
  let up = (event) => {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
  };
  let move = (event) => {};

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", up);
});
```

# 11.29 使用 Range 实现 DOM 精确操作 | 正常流里的拖拽

**实现思路**

1. 对元素内的文字进行遍历，并全部转换成 range 对象;
2. 移动时，不再直接移动元素的位置，而是将元素根据鼠标位置，插入到最近的 range 中。

## Range 对象

Range 接口表示一个包含节点与文本节点的一部分的文档片段

可以用 Document 对象的 Document.createRange 方法创建 Range，也可以用 Selection 对象的 getRangeAt 方法获取 Range。另外，还可以通过 Document 对象的构造函数 Range() 来得到 Range。

多用于对元素有精准操作需求的场景，如：富文本开发。

** setStart 和 setEnd**

接收两个参数，第一个参数是起始节点的节点对象，第二个参数是偏移量，偏移量有两种情况:

1. 如果起始节点时 Text、Comment、CDATASection 之一，那么偏移量代表的是从起始节点算起字符的偏移量；
2. 如果是其他类型，则代表从起始结点开始算起子节点的偏移量。

如果设置的起始位点在结束点之下（在文档中的位置），将会导致选区折叠，起始点和结束点都会被设置为指定的起始位置。

**insertNode**

新节点是插入在 the Range 起始位置。如果将新节点添加到一个文本 节点, 则该节点在插入点处被拆分，插入发生在两个文本节点之间

如果新节点是一个文档片段，则插入文档片段的子节点。

会将节点插入到当前 range 的起始节点，所以示例中的 div 可以存在于文本中的某一个位置。

**getBoundingClientRect**

MDN 上说是 Gecko 方法，是 Mozilla 独有的并不属于 W3C DOM 标准中的 Range 方法。
但是看浏览器兼容情况，应该是已经全面兼容了。

返回一个 DOMRect 对象，该对象将范围中的内容包围起来；即该对象是一个将范围内所有元素的边界矩形包围起来的矩形。

此方法可用于确定文本区域中选中的部分或光标的视窗坐标。

在 ios 下，以光标作为选区时，取到 的这些参数都是 0。

## CSSOM

CSSOM 的核心功能是提供允许脚本能访问和操作与样式有关的状态信息和过程的能力。

在 W3C 标准中，CSSOM 包含两部分：

Model：描述样式表和规则的模型部分；
View：和元素视图相关的 API 部分。

Range 中就有一些 CSSOM 扩展的一些接口。

CSSOM 提供了一些方便的接口用于创建 CSS 样式元素，创建出来的是 CSSOM 对象而非常用的字符串形式：

```js
CSS.em(3); // CSSUnitValue {value: 3, unit: "em"}
```

### CSSOM Model

同时也提供一些方法来操作样式表：

**document.styleSheets**

提供了访问全局所有的样式表的能力，返回一个只读的样式表列表，虽然不能直接操作但是可以使用 insertRule 和 removeRule 接口对其进行插入和删除操作

**window.getComputedStyle**

重要方法，用于获取经过计算后的样式，有两个参数，第一个要获取的 Element，第二个是伪元素，可选。

### CSSOM View

分成三个部分：窗口部分，滚动部分和布局部分。

常见的有：

1. window.scroll 页面滚动到指定位置
2. element.scrollTop/Left X/Y 轴上滚动的距离
3. moveTo 窗口移动到
4. window.screen 屏幕尺寸信息
5. window.devicePixelRatio 屏幕像素比
6. getBoundingClientRect() 获取元素的边界矩形

# 总结

1. CSSOM + DOM + Range
   经常使用的 scrollTop 等元素原来就是 CSSOM 的 api，它使脚本能够细粒度的控制页面中元素的精确样式，使复杂的效果成为可能，但它不是万能的还是要配合 DOM api 来进行工作才能发挥最大的作用，而精确操作 DOM 元素的方法还是要靠 Range 这个大杀器，如果能熟练运用 Range + DOM api+ CSSOM 的话应该可以实现一些很神奇的效果。

2. 拖拽
   一个 Range + CSSOM 的案例，用简单的几句代码就能实现神奇的效果，很是强大；同时解决了拖拽不跟手的疑惑，学到了再 donw 事件里监听 move 与 up 的技巧，很是受用。

3. 关于 reactive + effect
   Vue3.0 里的精华部分，可以让代码在任何地方都能以很小的代价享受到双向绑定带来的快感，同时也是一种编程思想的转变，在业务中如何最大化的利用这一特性还是值得思考的问题。

## 参考

- [Range - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/range)
- [关于 selection 和 range 的一些认识 | 知乎](https://zhuanlan.zhihu.com/p/44970200)
- [CSS Object Model - Web API 接口参考 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/CSS_Object_Model)
- [CSS 对象模型 CSSOM 是什么？ | 简书](https://www.jianshu.com/p/7c3e2493c7a7)
