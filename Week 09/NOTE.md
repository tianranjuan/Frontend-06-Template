# HTML 解析 | HTML parse 模块的文件拆分

设计 parser 的格式：接收 HTML 文本，返回 DOM 树

# HTML 解析 | 用 FSM 实现 HTML 的分析

1. HTML 代码分析部分使用 FSM 来实现（基本上处理文本的都可以用状态机来实现）
2. 在 HTML 标准中已经给出了所有 HTML 的状态机的伪代码，只需要翻译即可[标准文档](https://html.spec.whatwg.org/)
3. Toy-Browser 只实现部分状态的精简版本

# HTML 解析 | 解析标签

区分三种标签：

1. 开始标签
2. 结束标签
3. 自封闭标签

## 解析逻辑

**data state（初始状态）**

消费下一个字符：

- 如果是"&"
  - 设置返回状态 -> "data state",切换状态 -> 字符参考状态 (character reference state)
- 如果是"<"
  - 切换状态 -> "tag open state"
- 如果是空串
  - 记录发生错误，并标记
- 如果是 EOF
  - 发射 EOF token
- 其他
  - 发射当前字符为字符类型 token

**tag open state（标签开始状态）**

消费下一个字符：

- 如果是"!"
  - 切换状态 -> 标记开始状态（ markup declaration open state）
- 如果是"/"
  - 切换状态 -> "end tag open state"
- 如果是"?"
  - 意外错误，创建注释 token...
- 如果是 ASCII 字符
  - 创建一个开始标签 token，设置为空的 tagname， reconsume -> "tag name state"
- 如果是"EOF"
  - 标签名之前的 EOF 解析错误，发射一个"<"字符和一个 EOF token
- 其他字符
  - 一个无效标记，发射一个"<"字符，并 reconsume -> data state

**end tag open state（结束标签开始状态）**
消费下一个字符：

- 如果是 ASCII 字符
  - 创建一个结束标签 token，设置为空的 tagname，reconsume -> "tag name state"
- 如果是">"
  - 缺少闭合标签名称，状态切换 -> "data state"
- 如果是 EOF
  - 标签名之前的 EOF 解析错误，发射一个"<"字符和一个 EOF token
- 其他
  - 意外错误，创建注释 token...

**tag name state（标签名状态）**
消费下一个字符：

- 如果是 tab、LF、FF、SPACE
  - 切换状态 -> 属性名前状态("before attribute name state")
- 如果是"/"
  - 切换状态 -> "self-closing start tag state"(自闭合开始标签状态)
- 如果是大写 ASCII 字符
  - 添加小写字母到当前的标签 token 中当做标签名
- 如果是">"
  - 切换状态 -> "data state", 发射当前标签的 token
- 如果是 null
  - 意外的错误
- 如果是 EOF
  - tag 解析错误
- 其他
  - 添加到当前标签的 token 中当做标签名

**self-closing start tag state(自闭合开始标签状态)**
消费下一个字符：

- 如果是">"
  - 设置 token 为自闭合标签，切换状态 -> "data state"，发射当前标签 token
- 如果是 EOF
  - tag 解析错误
- 意外的解析错误，reconsume -> "before attribute name state"

**before attribute name state(属性名前状态)**
消费下一个字符：

- 如果是 tab、LF、FF、SPACE
  - 忽略字符
- 如果是"/"、">"、EOF
  - reconsume -> "after attribute name state"
- 如果是"="
  - 创建一个新的属性 token，设置属性名为当前字符，值为空，切换状态 -> "attribute name state"
- 其他
  - 在当前标签内创建一个属性，设置属性名为当前字符，值为空，reconsume -> "attribute name state"

# HTML 解析 | 创建元素

创建元素的过程是添加一个 emit 函数用于发射 token，一个 currentToken 记录当前 token 的状态。具体计算规则在上面的标准状态机里。

# HTML 解析 | 处理属性

不全属性处理的状态机。

至此词法分析就结束了。

# HTML 解析 | 用 token 构建 DOM 树

> 暂时忽略掉文本节点

使用 stack 结构来构建树，stack 结构天然的可以包含树的结构。

逻辑：

1. 传入 token
2. 获取栈顶元素
3. 如果 token 是开始标签
   1. 创建一个 element
   2. 设置 tagName 为 token 的 tagName
   3. 遍历所有的 attribute 抄写到 element 上
   4. 设置为栈顶元素的子元素，设置父节点为栈顶元素
   5. 如果不是自封闭标签的话就入栈（自封闭标签没有子节点所以不需要参与到树的构建过程）
4. 如果 token 是结束标签
   1. 如果 token 的 tagName 与栈顶元素的 tagName 相同
      1. 则将栈顶元素出栈，此时一对匹配的标签的层级结构就构建好了
   2. 否则抛出异常 -> 标签不匹配

> 标签不匹配就报错的原因是此次学习的目标只是学习工作原理，而不是开发一个好用的浏览器，所以忽略掉了 HTML 中一些容错机制，真正的 html 的容错性实现起来比较复杂，实现方式参考标准中 DOM 树构建的章节[<sup>[1]</sup>](#refer-anchor-1)

# HTML 解析 | 将文本节点加到 DOM 树

实现文本节点逻辑和标签的匹配不太一样，由于词法分析后所有的文本都是以单个字符 token 的形式存在，所以需要对这些连续的字符 token 做一个合并操作，然后将合并后的元素当做一个整体插入到 DOM 树中。

实现逻辑：

1. 添加全局变量 currentTextNode
2. 当时开始标签或结束标签时，清空 currentTextNode
3. 当时 token 是 text 类型
   1. 如果 currentTextNode 是空则创建一个新的 currentTextNode，并添加为当前栈顶元素的子节点
   2. 否则 currentTextNode.content += token.content

**遗留问题**

在 document 以及 dom 树中会存在一些没什么意义的空白符和换行符，这些会等到具体渲染时在进行合并裁剪。

# HTML 解析总结

**解析 HTML 文本**

当接收到服务端返回的 HTML 文本后，通过 FSM 状态机对逐个字符进行词法分析，通过状态机来找到全部的合法的 token，而关于状态机的定义则可以根据 HTML 标准中给出的详细定义来进行编写。

**处理 token**

当状态机满足某一 token 条件时，会通过 emit 的方式将 token 发射出去，emit 函数会根据接收到的 token 同步的进行 DOM 树的构建。

**生成 DOM 树**

DOM 树是通过 stack 来进行构建的，当 emit 函数接收到一个 token 时会获取到栈顶元素(此时栈顶元素就是当前 token 的外层标签)在根据 token 的类型信息进行相应的处理后生成 DOM 元素，然后将 DOM 元素插入到 stack 中，如果是文本类型则会将连续的文本类型合并后当做一个 DOM 元素处理。

> 解析时的运行关系为： 首先是使用 FSM 逐个字符的解析 HTML 词法，当产生一个 token 后马上发给 emit 函数同步的生成 DOM 树，所以解析 HTML 与生成 DOM 树其实是同步发生的。

# CSS 计算 | 收集 CSS 规则

**CSS Computing**

实质上就是通过把 style 标签内的 css 样式表按照选择器规则匹配到对应的 DOM 元素上。

虽然叫做 CSS Computing 但其实发生是在 DOM 构建时。

**收集的逻辑**

> 忽略了 link 和 import 等引入外部 css 文件的方式，如果考虑这些情况代码会变得复杂的多需要考虑网络请求和异步处理的问题，所以还是保持学习原理的原则，只考虑 style 标签内的解析和收集。

> 使用 npm 包 css 来进行 css 的解析，之所以没有手写是因为 css 的解析涉及了比较多编译原理知识，太复杂，从简使用现成的库。

1. 当词法分析时遇到标签名是 style 的 token 时调用 addCSSRules 函数，传入当前 token 的中文本节点的内容`top.children[0].content`;
2. addCSSRules 调用`css.parse(cssText)`得到 css 的抽象语法树;
3. 将抽象语法树中的 rules 保存到全局变量 rules 中给后面的解析使用。

# CSS 计算 | 添加调用

css 潜规则：所有的选择器都尽量保证在发现 startTag 的阶段就能够进行匹配样式。

**计算时机**

当创建一个 DOM 元素时立即发生 CSS 计算操作

**边界设定**

1. 假设在我们分析一个元素时，所有的 CSS 规则已收集完毕；
2. 忽略遇到掉写在 body 内的 style 标签重新计算 css 样式的情况，只进行一遍计算。

# CSS 计算 | 获取父元素序列

css 匹配时是从右到左的顺序（从内向外）的，先从当前元素开始，逐级的寻找匹配父元素。

使用了 `stack.slice().reverse();`的方式来获取父元素序列，原理是每次解析到新的标签时我们都会不断的压入栈中，所以栈顶就是当前元素，而向栈底的方向上的所有元素就是当前元素的父元素队列了，这里使用了 slice 来 copy 一份原栈用于隔离防止污染，然后 reverse 将栈顶和栈底整个反转，后面应该是为了好循环去找父元素。

# CSS 计算 | 选择器与元素的匹配

实现逻辑：

1. 遍历收集到的 rules
   1. 获取到规则内的选择器列表按`" "`拆分后，反转一下保存至变量 selectorParts，这一步是为了和 elements 的顺序能对应上
   2. 检查当前元素与 selectorParts[0]是否能匹配上（此时 selectorParts[0]代表的是当前元素应该有的选择器）
      1. 如果能匹配上就则继续匹配父元素
      2. 如果不能匹配则 continue 进行下条规则的检查
   3. 匹配父元素：
      1. 定义 j 标识 selectorParts 的指针，由于已经使用过[0]来匹配当前元素了，所以从 1 开始
      2. 循环 elements 列表
         1. 如果 elements[i]能与 selectorParts[j]匹配则将`j++`
      3. 如果 j >= selectorParts.length 则代表要是已经匹配成功了
      4. 如果样式匹配成功了则进行进一步的计算

作业的实现：

1. 如果是通配符"\*"则直接 return true；
2. 如果是带有">"的子代选择器，则先按照">"拆分后，在从内向外层寻找，如果全部的父元素都匹配到了那么证明匹配成功；
3. 如果是 class 中带有多个值的情况，则先把 class 按照" "分割，然后判断 selector 是否包含在 list 中。

# CSS 计算 | 生成 computed 属性

将 rule.declarations 抄写到 element 的 computedStyle 属性中，这里产生了一个新的问题就是没有处理选择器优先级的问题，所以覆盖规则有问题，留在下一节处理。

# CSS 计算 | specificity 的计算逻辑

针对于 css 样式的覆盖优先级规则如下：

1. 使用一个四元组来标识优先级
2. [0]标识是否为 inline style 具有最高优先级
3. [1]标识是否为 id 选择器，有的话有几个，稍低于 inline style
4. [2]标识是否为 class 选择器，有的话有几个，稍低于 id 选择器
5. [3]标识是否为 tagName 选择器，有的话有几个，最低的选择器

> 也就是说四元组的左边权重要大于右边权重

针对于"!important"来说优先级最高，要高于 inline style，如果发生冲突再比较四元组

针对于优先级相同时采用就近原则，使用新的样式覆盖旧样式

全部选择器"\*"要低于 tagName 选择器

继承得来的样式优先级最低

# CSS 计算总结

1. CSS 的计算步骤基本上是与 DOM 的解析同步进行的，当发现一个 startTag 开始就基本上可以确定样式表了
2. CSS 计算时是从内到外进行查找的，所以为了方便进行计算，使用了数组反转的技巧
3. CSS 的优先级计算的核心逻辑是四元组，分别代表了[inline, id, class, tag]4 种选择器，而优先级的顺序则是从左到右，左边 > 右边
4. 当 CSS 样式匹配成功后，就可以样式到 DOM 元素上了，当冲突时通过对样式表的优先级比较就可以决定是否进行覆盖。

至此一颗相对比较完整的 DOM 树就成功的生产出来了。

- [1] [HTML 标准中的构建 DOM 树](https://html.spec.whatwg.org/multipage/parsing.html#creating-and-inserting-nodes)
