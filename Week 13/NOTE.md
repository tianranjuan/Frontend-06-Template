# 重学 HTML | HTML 的定义：XML 与 SGML

HTML 脱胎自 XML 和 SGML，在早起可以算作是子集，HTML5 以后分离的比价彻底，不再认为自己是 SGML 的子集。

SGML 是比较早期的一个数据表述系统，内容庞大，XML 是其比较流行的子集设计，早期 HTML 被以 SGML 子集的思路设计出来，所以是支持 SGML 的 DTD，后来有过 XML 化的尝试，产生了 XHTML，由于其过于严格被社区所否定。

DTD 中重要的知识点：包含了三个实体定义，其定义了空格（&nbsp;）、大于号、小于号（lt、gt）、符号（&lambda;）等转义符；

其中 quot(双引号)、amp(&)、lt(<)、gt(>)是需要熟练掌握的转义。

> `&nbsp;`分割的词会被认为是一个完整的词，所以在排版时会造成一定的影响，如果需要显示多个空格，应该使用 css 来控制而不是直接是用`&nbsp;`来转义

# 重学 HTML | HTML 标签语义

**strong 和 em 的区别**

strong 表示在文章中很重要的意思，em 表示词的重音的意思

**ol 和 ul 是场景**

ol 表示语意上有序，即使最终的展现形式上是圆点这种基本没有顺序的形式，也应该是用 ol 来包裹，然后通过 css 改变序号的样式

ul 表示语意上无序，其内容应该都是无序的，如果需要顺序，那就应该是用 ol 了。

**常用的标签**

1. ol、ul -> 有序、无序标签
2. p -> 段落
3. hgroup -> 标签组
4. nav -> 导航
5. aside -> 不是页面的主要内容、具有独立性，是对页面的补充
6. footer -> 某一区域的非主体底部栏
7. article -> 文章元素
8. section -> 组块
9. strong -> 在文章中很重要的词
10. em -> 词的重音在哪里
11. ...

> 感觉语义化标签在开发中（VUE 栈）总是找不到使用场景，整体来看还是应该更适合使用在类似新闻网站、博客等场景中吧。

# 浏览器 API | DOM API

DOM 树中的所有内容都是单根继承自 Node 的，其中 ElementNode 类型占据日常使用的大部分。

Node 的子节点：

1. ElementNode 最常见的内容
   1. HTMLElementNode HTML 产生的节点
   2. SVGElementNode SVG 产生的节点
   3. MathMLElementNode Math ML 产生的节点
2. DocumentNode 文档根节点
3. CharacterDataNode 字符类型节点
   1. TextNode 文本节点
   2. CommentNode 注释
4. DocumentFragmentNode 文档片段
5. DocumentTypeNode 文档类型

**导航类 API**

由于所有的内容都是 Node，所以代码排版时产生的换行和空白符都会被收入到 Node 中作为一个单独的节点，这一点在 Toy Browser 中已经实现过了。

- parentNode
- childNodes
- firstChild
- lastChild
- nextSibling 下一个邻居节点
- previousSibling 上一个邻居节点

由于 Node 的特性所以使用 Node 层的 API 访问时会大概率访问到空白符合换行符等内容，访问元素变得不方便，所以产生了 Element 一系列的 API，与 Node API 基本一致

- parentElement
- children
- firstElementChild
- lastElementChild
- nextElementSibling
- previousElementSibling

**修改类 API**

- appendChild
- insertBefore
- removeChild 必须在目标元素的父元素行来移除操作
- replaceChild 也许可以节省 DOM 操作，但需要看浏览器实现

> 为什么没有 insertAfter？ 因为 insertBefore + appendChild 已经产生了 N+1 个空隙，可以把目标数据插入到任意位置了，由于最小化原则，就没有涉及多余的 API。

**高级操作**

- compareDocumentPosition 比较两个节点在 DOM 树中位置关系的函数
- contains 检查一个节点是否包含另一个节点
- isEqualNode 检查两个节点是否完全相等
- isSameNode 检查两个节点是否为同一个节点
- cloneNode 复制一个节点，传入参数为 true 时，会连同子节点一同拷贝，为深拷贝

# 浏览器 API | 事件 API

**对于事件捕获、冒泡的误解**

冒泡和捕获是浏览器的处理机制，对于加不加监听都是会发生的，只是加了监听以后可以触发响应的 hook 而已，而不是不加监听就不存在冒泡和捕获。

**addEventListener 的第三个参数**

如果是传入 boolean 类型那么会改变事件的响应机制，true:使用捕获，false:使用冒泡

如果是传入 option，那么就有三个可选值：

1. capture 与传入 Boolean 类型时一样
2. once 只响应一次，响应后会自动移除该监听，vue 中@click.once 应该就是这个原理
3. passive 设置为 true 时，表示 listener 永远不会调用 preventDefault()，默认为 false，必要时可以设置为 true 改善滚动性能。

# 浏览器 API | Range API

**DOM insert 操作的知识点**

同一个节点，不能同时出现在 DOM 树上的两个点上，即：

如果插入的节点时现有节点的引用（插入的节点时已存在 DOM 上的节点时），在进行插入操作时会先从 DOM 树上移除节点后再插入到新位置。

**Range API**

Range 接口表示一个包含节点与文本节点的一部分的文档片段。

**定位方法**

1. Range.setStart() / Range.setEnd() 直接设置起点/终点
2. Range.setStartBefore() / Range.setStartAfter() 以其它节点为基准，设置 Range 的起点。
3. Range.setEndBefore() / Range.setEndAfter() 以其它节点为基准，设置 Range 的终点。
4. Range.selectNode() 使 Range 包含某个节点及其内容。
5. Range.selectNodeContents() 使 Range 包含某个节点的内容。
6. Range.collapse() 将 Range 折叠至其端点（boundary points，起止点，指起点或终点，下同）之一。

**编辑方法**

1. Range.cloneContents() 返回一个包含 range 中所有节点的克隆的文档片段
2. Range.deleteContents() 从 DOM 中删除 range 中的节点
3. Range.extractContents() 从 DOM 树中摘除一段节点并返回该段节点的文档片段，摘除后页面上会触发重排，页面表现为该段文档已删除。
4. Range.insertNode() 在 range 的起点处插入一个节点
5. Range.surroundContents() 将 Range 的内容移动到一个新的节点中。

**文档片段(DocumentFragment)**

是一种仅存在于内存中的类似缓冲区的 DOM 文档对象，被设计为一种没有父节点且与 DOM 文档具有一样特性的结构，类似离屏内容，不是真正 DOM 的一部分，操作时不会影响页面上 DOM 的重排，只有在与其合并时触发一次，具有良好的性能表现。

在应用中通过 Range API 和 Fragment 可以很好的对 DOM 树进行精准且高效的操作，所以这两个 API 的组合也是主要的应用场景也基本都在富文本编辑器和 Web IDE 上,以及 DOM 操作的性能优化上。

# 浏览器 API | CSSOM

在浏览器 API 中 DOM API 可以认为是对 HTML 文档的抽象描述。而 CSSOM 则是对 CSS 的一个抽象描述。

CSSOM 的 API 基本都是需要借助 DOM API 来进行操作。

通过`document.styleSheets`就可以访问到页面中全部的样式表。

**编辑 API**

1. document.styleSheets[0].cssRules 获取样式表中的样式规则
2. document.styleSheets[0].insertRule("p {}", 0) 在第几个规则处插入一段 CSS 代码
3. document.styleSheets[0].removeRule(0) 删除第几个规则

**Rule 相关规则**

1. CSSStyleRule
2. CSSCharsetRule
3. CSSConditionRule
4. CSSKeyframeRule
5. CSSMediaRule
6. ...

可以看到与 CSS Rule 基本是一一对应的关系，使用这些 API 可以访问到响应的 CSS 规则。

**window.getComputedStyle**

可以获取到元素计算后的尺寸信息，包括伪元素的样式信息。

**CSSOM 的好处**

1. 可以实现批量修改
2. 可以访问伪元素等 DOM API 无法访问的内容
3. 可以访问到计算后的元素尺寸信息

# 浏览器 API | CSSOM View

View 相关的 API 与 CSS 规则并是对应关系，而是与浏览器渲染视口的对应关系 API。

View 可以获取到渲染视口的宽度高度，浏览器的实际宽高，设备物理像素等属性。

window.screen.availHeight/avaliWidth 表示的是可用空间，这个属性可能会与实际宽高不一样，原因是在安卓机如果具有屏下的虚拟按键时，会占用一部分宽高，这时的实际宽高就与屏幕的宽高对不上了，而这个属性就是获取此时实际宽高的 API。

**window 中与屏幕相关的比较重要的 API**

1. window.innerHeight/innerWidth
2. window.devicePixelRatio

**window.open**

CSSOM 对 window.open 进行了扩展，使其可以接受第三个参数，指定新窗口在屏幕上的位置和大小，通过也扩展了一些其他操作，如果窗口是自己创建的那么可以进行的操作有：

1. moveTo(x,y)
2. moveBy(x,y)
3. resizeTo(x,y)
4. resizeBy(x,y)

**layout 相关**

1. getClientRects() 获取到元素所有的盒子
2. getBoundingClientRect() 获取到边界上的盒

由于一个元素可能会生成多个盒子所以有第一个 API 用来获取元素所产生的全部的盒子

当只想获得包裹在最外层大小的盒子的时候就用第二个 API 来获取

**好处**

可以方便的获取到页面渲染后的位置和尺寸信息，进而屏蔽掉通过 js+css 属性进行的复杂计算。

# 浏览器 API | 其它 API

**Web 的标准化组织有哪些？**

1. khronos -> web GL/open GL
2. ECMA -> ECMAScript
3. WHATWG -> HTML
4. W3C -> web audio

其中 W3C 还区分为 CG（社区组）、WG（工作组）、IG（兴趣组）,只有 WG 的标准会一定出现在 W3C 官网上，而 CG 和 IG 的标准或约束文件则不会出现在 W3C 官网上，而是在 github 上。

# 参考

- [1] [Node.compareDocumentPosition | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/compareDocumentPosition)
- [2] [EventTarget.addEventListener | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener)
- [3] [Node.insertBefore | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/insertBefore)
- [4] [Range | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Range)
- [5] [DocumentFragment | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/DocumentFragment)
