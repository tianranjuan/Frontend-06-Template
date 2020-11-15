学习笔记

# 11.11 使用 LL 算法构建 AST | 四则运算

**LL**

指"Left Left"算法，从左到右扫描，从左到右规约。

> 此处指的应该就是左结合规则。

**token**

有效的输入即使 token

**四则运算的词法定义**

1. tokenNumber：1234567890.;
2. operitoe: + - \* /;
3. whitespace: <SP>;
4. LineTerminator: <LR><CR>。

**四则运算的语法定义**

产生式定义
\<Expression\>::=\<AdditiveExpression\> + \<EOF\>

\<AdditiveExpression\> ::= \<MultiplicativeExpression\> | \<AdditiveExporession\><+>\<MultiplicativeExpression\> | \<AdditiveExporession\><->\<MultiplicativeExpression\>

\<MultiplicativeExpression\> ::= \<Number\> | \<MultiplicativeExpression\><\*>\<Number\> | \<MultiplicativeExpression\></>\<Number\>

解释

1. 乘法是最基本的表达式，同时单个数字也被看作是一个乘法表达式，即只有一项的乘法，乘法第一项可以是数字，也可以是一个乘法表达式，第二项可以是数字
2. 加法表达式是多个乘法表达式的组合，单个乘法表达式也可以被看作是一个加法表达式，即只有一个乘法表达式项的假发表达式，加法第一项可以是乘法表达式也可以是加法表达式，第二项是可以是乘法表达式
3. 表达式是最后的输出，包含了一个加法表达式和一个 EOF（End Of File 文件终止符）

> [产生式](https://baike.baidu.com/item/%E4%BA%A7%E7%94%9F%E5%BC%8F%E8%A1%A8%E7%A4%BA%E6%B3%95/9877764)的含义如果前提 P 满足，则可推出结论 Q 或执行 Q 所规定的操作。

# 11.11 使用 LL 算法构建 AST | 正则表达式

1. 定义正则，使用了捕获和或的分支特性；
2. 为每一 token 起一个别名；
3. 使用 exec 循环 match 出全部的 token。

> 正则的 exec 方法使用，当 RegExpObject 是一个全局正则表达式时，exec() 的行为就稍微复杂一些。它会在 RegExpObject 的 lastIndex 属性指定的字符处开始检索字符串 string。当 exec() 找到了与表达式相匹配的文本时，在匹配后，它将把 RegExpObject 的 lastIndex 属性设置为匹配文本的最后一个字符的下一个位置。这就是说，您可以通过反复调用 exec() 方法来遍历字符串中的所有匹配文本。当 exec() 再也找不到匹配的文本时，它将返回 null，并把 lastIndex 属性重置为 0。

# 11.11 使用 LL 算法构建 AST | LL 词法分析

**改进 tokenize**

1. 添加 lastIndex 属性，用于检测是否包含非法的字符
   1. 记录上一次的 lastIndex
   2. 记录 match 一次后的 lastIndex
   3. 两者相减应该等于 result 的长度，不相等时则包含了非法字符
2. 修改 tokenize 为 generator 函数，编程异步编程
3. 添加 token 对象存储 match 到的信息，结构包含{type,value}
4. 函数的最后返回 **EOF** 标识

**细节**

1. generator 函数执行后会返回一个可迭代的对象，使用 for...of 可以遍历返回的 iterator

# 11.15 使用 LL 算法构建 AST | LL 语法分析（一）

分析的顺序由最贴近 EOF 的开始，依次的向更高层级的递进。

```
MultiplicationExpression -> AdditiveExpression -> Expression
```

## MultiplicationExpression 分析过程

```
<MultiplicativeExpression> ::= <Number> | <MultiplicativeExpression><*><Number> | <MultiplicativeExpression></><Number>
```

根据产生式的定义可以发现有三种情况：

1. 只有 Number 的情况
2. 左边是 MultiplicativeExpression，操作符是`*`
3. 左边是 MultiplicativeExpression，操作符是`/`

所以我们在编写 MultiplicativeExpression 也只需要三个分支即可实现对应的解析。

> 分析过程中没有考虑操作符右边的值是什么，是因为在解析的过程中是包含一个从左到右依次解析的过程，也就是说其实是一个从左到右的折叠过程，从左到右，从第层级的表达式到高层级的表达式依次的折叠的过程，直到最终折叠成一个 Expression 为止；所以没有必要在分析时考虑右侧的内容是否有用（仅限于对本例的理解是这样的，对于更复杂的语法分析时是否有其他规则还有待研究）

## AdditiveExpression 分析过程

```
<AdditiveExpression> ::= <MultiplicativeExpression> | <AdditiveExporession><+><MultiplicativeExpression> | <AdditiveExporession><-><MultiplicativeExpression>
```

同样的根据产生式的定义可以发现三种情况：

1. 只有 MultiplicativeExpression 的情况
2. 左边是 AdditiveExporession，操作符是`+`
3. 左边是 AdditiveExporession，操作符是`-`

所以参照[MultiplicationExpression 分析过程](#multiplicationexpression分析过程)的方法编写同样的逻辑处理即可

**为什么在第三项前要调用一次 MultiplicationExpression？**

```js
let node = {
  type,
  operator: source[1].type,
  children: [],
};

node.children.push(source.shift());
node.children.push(source.shift());
MultiplicationExpression(source); // ？为什么是这里
node.children.push(source.shift());
source.unshift(node);

return AdditiveExpression(source);
```

在分析 AdditiveExpression 的过程中多出了一个比`MultiplicationExpression分析过程`要复杂地方就是：根据产生式的定义，操作符的右侧也就是第三项值，也是一个`MultiplicationExpression`，所以当分析时就需要保证第三项一定是一个已经经过产生式处理过的 node，所以在第三项存入到 node 中前需要对第三项进行一次 MultiplicationExpression 调用，保证其一定是一个 MultiplicationExpression 产生式。

这么写乍一看是有点摸不到头脑，怎么就在这里调用一下就变成 MultiplicationExpression 了呢，其实这里的意思就是在 debug 后可以发现顺序是这样的：

```js
// 操作前source ["AdditiveExpression", "+", "Number", "EOF"]

// shift一次后source  ["+", "Number", "EOF"]
node.children.push(source.shift());
// 再shift一次后source  ["Number", "EOF"]
node.children.push(source.shift());
// 此时传入MultiplicationExpression的source内容是： ["Number", "EOF"]，第一项已经是目标项了（AdditiveExpression中的第三项），此时经过MultiplicationExpression处理后source[0]成功转换成一个MultiplicationExpression
MultiplicationExpression(source);
// 经过MultiplicationExpression处理后 ["MultiplicationExpression", "EOF"]

node.children.push(source.shift()); // 将新产生的MultiplicationExpression添加到node中
```

## Expression 分析过程

```
<Expression>::=<AdditiveExpression> + <EOF>
```

根据产生式定义可知，Expression 的定义只有一条规则就是：

1. 加法表达式 + EOF 组合

由于规则简单所以只需要简单的判断一下 source 中前两项的类型是否正确即可。

# 总结

1. 理解了在《重学前端》中`JavaScript语法（四）：新加入的**运算符，哪里有些不一样呢？`winter 老师为什么说:"加法表达式是由乘法表达式用加号或者减号连接构成的。"一句，因为表达式是由产生式层层嵌套而来的，而每一个产生式都由自身和更低级的产生式来描述，所以一个加法表达式的展开最后其实就是老师所要表达的意思。
2. 在解析一段真正的表达式时，使用到了责任链的思想，从最高层级依次的向低层级传递数据，碰到不认识的结构就传递给其它产生式去做，直到全部都变成认识的产生式为止；
3. 解析后的 AST 为单根结构，这也是大部分 AST 处理后的标准格式；
4. 解析 AST 时只需要依次遍历所有的节点并计算即可得出最后的结果。

# 优化

1. 添加括号的支持

# 如何应用

1. 可以使用在程序中需要自定义输入算式的地方，当做一个计算器来使用
2. 可以用来进行定义简单的 DSL，即通过简单的语法定义来实现一些特定的功能，如：文字冒险游戏的剧情控制脚本

> 结合下一周内容，找时间实现一个基于 AST 的文字冒险游戏剧情控制脚本作为提高练习
