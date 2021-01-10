# CSS 总论 | CSS 语法的研究

CSS 的语法比较零散没有类似 HTML 和 JS 标准一样的统一的文档，所以课程中找到了一个相对较全面的版本--CSS2.1 的文档 s

**CSS 2.1**

历史包袱：为了兼容早期不支持 CSS 的浏览器，CSS2.1 中可以通过变成 HTML 注释的方式让不支持 CSS 的浏览器把样式内容当做 HTML 注释处理，而不是将 CSS 文本显示在页面上。

CSS 中的总体结构大致是包括：@charset、@import、rules[@media、@page、rule(平常写的就属于这部分)]

# CSS 总论 | CSS @规则的研究

@规则大致上就相当于是内置的函数一样，可以实现一些特殊的功能。

常见的有：

1. @import 用于从其他样式表导入样式规则
2. @media 用于媒体查询功能
3. @keyframes 用于定义动画帧

# CSS 总论 | CSS 规则的结构

css 规则分为两部分，分别是：

1. 选择器部分: .cls #id tagName 等
2. 声明部分： KV 键值对， color: red;

**选择器**

目前比较新的有 level3 和 level4 两个标准，其中 level3 的标准支持度比较好，而 level4 还在制定中，没有落地。

**key**

key 的常用写法是用来声明样式属性，不过现在有了 css variables 所以 key 也出现两种含义，一种是样式属性的声明，一种是变量的声明（以--开始）。

# CSS 总论 | 收集标准

以爬虫的方式在`https://www.w3.org/TR`网站上爬取了所有 CSS 相关的标准，通过这种方式可以把零散的 CSS 的标准给收集出来。

# CSS 选择器 | 选择器语法

**简单选择器**

1. - 通用选择器，相当于没有选择器
2. div svg|a 类型选择器，选中某一类型的元素，添加竖线(|)是表示添加命名空间的意思，HTML 中的主要命名空间有三种：HTML、SVG、MathML，命名空间与@namespace 规则为配对使用
3. .cls 选择具有某一 class 属性的元素
4. #id 选择具有某一 id 属性的元素
5. [attr=value] 属性选择器，选择满足[属性=值]的元素，在=前可以添加"~"、"|"、"^"、"$"、"\*"等来按条件匹配属性，理论上是可以代替掉 id 选择器和 class 选择器的
6. :hover 伪类选择器，与 HTML 和 CSS 关系不大，多是与交互相关的
7. ::before 伪元素选择器，选中不存在元素，如果不选择那么该位置不存在伪元素，选中后才会存在

**复合选择器**

多个简单选择器链接起来就组成了复合选择器。

\*和 div 必须要写在最前面。

**复杂选择器**

1. <sp> 使用空格分割的复合选择器，用于选择某一元素下的子孙节点
2. > 父子选择器，只能选择直接的子元素，不能包含孙元素
3. ~ 兄弟选择器，可以选择与自身同级的且位于自身之后的元素
4. - 兄弟选择器，可以选择与自身同级的且位于自身后一个的元素
5. || selectors level 4 标准中的东西，用于选择 table 中的一列

> 为什么","没有算入到选择器中，因为","连接的选择器本质上是两个选择器，属于或的关系所以没有算入到上面的选择器中。

# CSS 选择器 | 选择器的优先级

优先级的计算原理：

1. 使用 4 元组的方式来计算出每一种级别选择器的总数
2. 忽略通用选择器
3. 把 4 元组视作某一进制下的数字
4. 计算 4 元组后得出的结果就是优先级排列的根据

四元组的格式：

[inline, count(id selectors), count(class selectors, attributes selectors, pseudo-classes), count(type selectors, pseudo-elements)];

其中，pseudo-classes 为伪类选择器，pseudo-elements 为伪元素选择器

举例：

```css
#id div.a#id {
  //...
}
```

四元组计算方式：[inline = 0, count(id selectors * 2), count(class selectors * 1, attributes selectors * 0, pseudo-classes * 0), count(type selectors * 1, pseudo-elements * 0)]

结果：[0, 2, 1, 1]

视四元组为 N 进制的数字，那么 N 取值够大就可以保证正确性

转换为 N 进制：0 _ N3 + 2 _ N2 + 1 \* N1 + 1;

当 N = 1000000 时 -> 结果为： 2000001000001

**为什么 N 要取值足够大呢？**

如果 N 取值过小的话会导致处于低位的选择器在数量足够多的情况会发生进位的现象，比如在 IE 早起版本中出现了 N 取值 255 导致 256 个 class selector 的优先级等于一个 id selector 的优先级。

**关于优先级的一些条条框框**

1. 计算优先级时会忽略掉\*
2. 一些类选择器具有特异功能，所以会特殊计算：
   1. :is()/:note()/:has()/:nth-child()/:nth-last-child()会被参数列表中最复杂的结构所替代，:not(em, strong#foo)会被当做"strong#foo"来处理
   2. :where()会被记做 0，此伪类选择器也是 selector level4 中的内容

# CSS 选择器 | 伪类

伪类选择器早期都是给<a>标签设计的，而随着浏览器的发展，现在大部分伪类选择器也可以给其他元素使用了。

**CSS 也能导致页面安全漏洞**

在使用伪类:visited 时，我们只能设置字体颜色的原因是：如果可以随意设置属性，那么:visited 就会影响排版，那么就可以通过 js 获取到所有的<>元素然后判断排版信息获取到全部的用户浏览记录，这对浏览器安全是不可忍的，所以为了杜绝这种类似的现象:visited 被限制为只能修改字体颜色。

**CSS 拖慢速度**

在编写玩具浏览器时对于 CSS 的计算是同步进行的，所以速度是很快的，而由于树结构伪类的出现（":empty", "nth-child()", "first-child()"等）导致了计算时机被破坏，也就是说在当前的计算结果有可能会被后面的 css 样式修改，所以就需要对这些特殊情况进行特殊 hack 处理，这种多出来的操作无疑会拖慢速度，所以对于这种复杂的伪类选择器我们应该以最简单的方式来处理，避免写的过于复杂触发太多的 hack 逻辑。

**应避免掉过于复杂的选择器**

过于复杂的选择器在浏览器层面可能会实现的比较复杂，性能也可能不会太高，所以为了性能考虑应尽量避免把选择器写的太过于复杂；同时由于HTML部分是我们自己设计编写的，所以复杂的CSS也侧面说明了HTML结构可能不是太科学，所以从代码的可读性等角度考虑也同样应该避免把选择器写的太过复杂。

# 参考资料

- [1] [CSS2.1 标准](https://www.w3.org/TR/CSS21/grammar.html#q25.0)
- [2] [阮一峰 | CSS 变量教程](http://www.ruanyifeng.com/blog/2017/05/css-variables.html)
- [3] [css-selectors-3 标准](https://www.w3.org/TR/selectors-3/)
- [4] [css-variables 标准](https://www.w3.org/TR/css-variables/)
- [5] [css-values level4 标准](https://www.w3.org/TR/css-values-4/)
- [6] [specificity-rules 标准](https://www.w3.org/TR/selectors-4/#specificity-rules)
