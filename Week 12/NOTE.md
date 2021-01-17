# CSS 排版 | 盒

标签：代码中的概念，写的一定是标签；
元素：一组开始结束标签所表示的一定是元素，存在于理解层面；
盒：排版和渲染的基本单位；

**细节 1**

> DOM 树中存储的并不全是元素，还包括节点类型，节点类型包括：DTD、注释、CDATA 等，可以理解元素是特殊的节点类型。

**细节 2**

CSS 选中的是元素，盒与元素并不是一一对应的，可能是一个元素对应多个盒，盒不会无中生有，即使是伪元素也是要依附于已选中的元素产生。

**啥是一个元素对应多个盒**

inline 元素因为分行的原因就会产生多个盒，伪元素也会导致产生多个盒。

**盒模型**

包含（由内到外）：

1. content 区域
2. padding 区域
3. border 区域
4. margin 区域

box-sizing：

1. content-box： width 属性直接作用于 content 区域上，最终排版的大小公式为：content(width) + padding + border + margin;
2. border-box: width 属性作用域 border 区域上，也就是说设置的 width 是 content + padding + border 的和， 所以最终排版的大小为 width(content + padding + border) + margin;

# CSS 排版 | 正常流

**三代排版技术**

1. 正常流
2. flex
3. grid

三代排版技术中，flex 是最简单最容易理解的机制也很简单，正常流机制复杂而且排版能力也不太行。

css 排版中两个核心：盒与文字，所有的 CSS 元素都逃不出这两个东西，所以 CSS 排版实质上就是将盒与文字放置到正确的位置上。

**正常流为什么有时会不正常？**

正常流其实和我们日常书写的排版逻辑基本一致，而之所以不正常是因为早期排版设计是由当时的文字出版专家来帮忙制定的，所以其中混合了很多的专业排版知识，而这些专业的排版知识在我们普通人眼里看来就比较反直觉，也就显得正常流不太正常，而这种不正常如果出现在书本里可能就会变的熟悉起来了。

**排版规则**

1. BFC 块级格式化上下文
2. IFC 行内格式化上下文

**BFC**

包括 line-box(由文字和行内组成的行)和 block-level-box(单独占一行的块)组成，默认的排布顺序为从上到下。

**IFC**

包括文字和行内元素(inline-box)组成的，默认的排布为从左到右。

> BFC 和 IFC 在 CSS 面试时会比较常见

# CSS 排版 | 正常流的行级排布

**baseline（基线对齐）**

在排版上来说可以认为所有的文字都是基于 baseline（基线对齐）的，也就是说为了美观，所有的字都会在上缘/下缘等位置产生一条基线来进行对齐。

**text（字体、字形）**

在计算机中字是由计算机上具体的字体库定义的，而在字体库上层会有一定的公用抽象，其定义了如何确定 baseline、字的宽高、字的间距、字的实际大小等属性。

在网页中我们划取选中一个字时会发现字的周围会有一定的留白，这其实就是上面所说的字的间距所定义的，对于字的宽高则是黑色像素所占的大小，而字的实际大小其实是字的宽高（黑色像素点的大小）+ 字的间距计算得来的。

**行模型**

基础行模型：

1. text-top -> 上缘
2. baseline -> 基线
3. text-bottom -> 下缘

常规行模型排版时，文字会基于基线对齐，然后上缘不会超过 text-top，下缘不会超过 text-bottom，上缘和下缘的尺寸会根据行内最大尺寸（字号）来确定

当行高大于文字高度时，也就是行高是比 text-top/text-bottom 还要大时，会产生 line-top 和 line-bottom，在和盒模型混合排版时如果盒比较大则会撑开 line-top 和
line-bottom，产生一个偏移量，但是不会影响到 text-top 和 text-bottom。

**实验**

在实验中可以发下几个需要注意的内容：

1. baseline 是不会发生改变的
2. 行内盒的基线会根据内容发生改变，实验中在行内盒中添加换行后，基线会被定义在内容的最后一行上，此时整个行高会被撑开（line-top 被撑开）
3. 使用 vertical-align 来指定对齐方式时撑开的其实是 line-top 和 line-bottom
4. 一行内，可以指定多个行内盒的 vertical-align 为不同的对齐方式，这样会各自对作用的 line-top 或 line-bottom 起作用独自撑开，而不是某一个起作用了后其他的被忽略，
   实验中分别使用 top 和 bottom 将 line-top 和 line-bottom 分别撑开

# CSS 排版 | 正常流的块级排布

**float 的行为**

float 的计算为：

先出现在正常位置，当发现是 float 元素时，则向定义的方向去挤，直到挤到头位置，当 float 元素确定好位置后，会重新计算行盒的宽度（此时不涉及重排的问题，只是改变了宽度还没到那一步）

float 元素会影响多行，至于多少行，是根据 float 元素自身高度来决定的。

当多个 float 元素同时作用时，如果在同一方向上挤的时候撞到了另一个 float 元素就会停下来，也就是说不会重叠在一起，此时可以使用 clear 属性来寻找干净的空间。

同一行中 float 排布满了以后也是会换行的。

**clear 属性**

clear 常见翻译是清楚浮动，但是老师说的感觉更形象:寻找干净的空间。

当设置了 clear 属性后，float 元素在挤的过程中撞到了另一个 float 元素时，不会就此停下来，而是会调整自身的纵向位置，尝试寻找一块可以容下自身的干净的区域，然后跑到该位置后停下下来

在 clear 寻找干净空间的过程中，只会调整一次，而不会先向下，然后再向上，然后找到紧凑的排布。

**margin 折叠**

> 只有正常流中的 BFC 才会产生 margin 折叠， flex、grid 是不会产生的。这种情况只会发生在同一个 BFC 中，多个 BFC 间不会互相影响。

margin 折叠是指当 BFC 中从上到下的元素中同时具有 margin 时，并不会简单的将两个 margin 值相加，而是会折叠覆盖，只保留最大的 margin 值的行为。

为什么会产生折叠呢？

这是因为在排版行业中，margin 实质上指的并不是当前块要与另一个块要保持多少距离，而是当前块内容的周围要至少有多少的留白，所以按照这个思路走下来的话折叠是很自然的事情。

说明：

块 A 设置 margin-bottom:20px，其意思为块 B 内容的下方要留白 20ox

块 B 设置 margin-top:10px，其意思为块 B 内容的上方要留白 10px

当两个块在 BFC 中排版时，取最大值 20px，此时折叠后留白了 20px，既满足了块 A 要求的下方留白 20px，也满足了块 B 要求的上方留白 10px，所以折叠就这么产生了。

# CSS 排版 | BFC 合并

**block**

1. block container 块容器 以 BFC 去约束子元素的
2. block-level box 块级盒子 被 BFC 所约束的
3. block box 块盒子 块容器+块级盒子 即被 BFC 所约束又能以 BFC 约束别的块的

**block container**

1. block
2. inline-block
3. table-cell
4. flex item
5. grid cell
6. table-caption

**block-level box**

display:

1. block
2. flex
3. table
4. grid

**BFC 产生条件**

1. 浮动元素，浮动元素内会是一个正常流，会产生 BFC
2. 绝对定位元素，绝对定位元素内会是一个正常流，会产生 BFC
3. block container 并且不是 block box 的， block container 内会是一个正常流，会产生 BFC
4. block box 并且 overflow != visible 的内会是一个正常流，会产生 BFC

默认情况下，内部能容纳正常流的盒子都会创建 BFC

特殊情况下：例外都是 BFC 并且 overflow = visible，不能产生 BFC，会发生 BFC 合并

**BFC 合并**

1.BFC 合并与 float

正常情况下如果是独立的 BFC 遇到 float 元素，那么内容会根据 BFC 当做一个整体与 float 进行排版，
如果是 overflow = visible 时，内容则不会被 BFC 约束，会与 BFC 独立的计算与 float 的排版关系

# CSS 动画与绘制 | 动画

**Animation**

两个要点： @keyframes 和 animation

1. @keyframes 定义动画
2. animation 使用动画

在控制台观察是不会发现属性的改变的，但是用 computed 来获取属性则会发现属性是发生变化的。

**animation 属性**

1. animation-name 动画名
2. animation-duration 动画时长
3. animation-timing-function 动画的缓动曲线
4. animation-delay 动画开始前的延时
5. animation-iteration-count 动画播放次数
6. animation-direction 动画的播放方向

**@keyframes 定义**

1. 可以使用 form-to 来定义过程
2. 可以使用百分比来定义过程

可以在每一个关键帧中使用 transition 来定义不同的缓动曲线，而在 animation 中定义的话则是整个动画级别的。

**transition 属性**

1. property 要变换的属性
2. duration 变换持续时长
3. timing-function 缓动曲线名
4. delay 延迟

缓动曲线是基于三次贝塞尔曲线得来的，其计算有使用到牛顿积分法。

开发中能用到三次贝塞尔抛物线曲线的场景：

1. iphone 中的动画
2. 弹簧回弹等

**关键词**

1. 三次贝塞尔曲线
2. 牛顿积分法
3. 贝塞尔拟合能力

# CSS 动画与绘制 | 颜色

**HSL 的应用意义**

HSL 分别表示颜色的：

1. H：色相
2. S：纯度
3. L：亮度

当希望改变主题色时而不改变最终的设计效果，这样可以在保留透明，亮度，过渡关系等前提下，改变主题色，非常的方便。
而使用 RGB 时可能因为颜色间的关系导致 rgb 值并不相同，而设置大量的独立变量来控制，加大了开发难度。

# CSS 动画与绘制 | 绘制

1. 几何图形的绘制
   1. border
   2. box-shadow
   3. border-radius
2. 文字的绘制
   1. font
   2. text-decoration
3. 位图
   1. background-image

绘制时一般会依赖一个图形库来输出，手机上是 skia，win 上的 GDI 等，在底层基本就都是使用 shader 来进行绘制了。

> 对于使用 border 等原生属性去拼图形的操作，推荐替换为 data uri，因为拼图形的操作效果不好，性能也不好。

# 参考

- [1] [CSS Spec: block-level box, block container box and block box](https://stackoverflow.com/questions/30883857/css-spec-block-level-box-block-container-box-and-block-box)
- [2] [CSS 中的 BFC 详解](https://www.cnblogs.com/chen-cong/p/7862832.html)
