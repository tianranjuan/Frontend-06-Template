# 11.19 字符串分析算法 | 总论

字符串分析算法

1. 字典树
   1. 大量高重复字符串的存储与分析
2. KMP
   1. 在长字符串里找模式
   2. 部分匹配，在长串里找某一个短串
3. Wildcard
   1. 带有通配符的字符串匹配模式
   2. 属于 KMP 的升级版
4. 正则
   1. 字符串通用模式匹配
5. 状态机
   1. 通用的字符串分析
6. LL LR
   1. 字符串多层级结构
   2. LL 第三周内容
   3. LR 后面会讲，比 LL 更加强大

# 11.19 字符串分析算法 | 字典树

字典树顾名思义就是一个类似于字典的树型结构，又称单词查找树，Trie 树，前缀树，是一种树形结构，是一种哈希树的变种；其核心思想是空间换时间。典型应用是用于统计，排序和保存大量的字符串（但不仅限于字符串），所以经常被搜索引擎系统用于文本词频统计。它的优点是：利用字符串的公共前缀来减少查询时间，最大限度地减少无谓的字符串比较，查询效率比哈希树高。

首先回顾一下查字典索引页的方式：每一位字母都是按照 a-z 的顺序进行排列，所以只要是前缀一样的单词就一定会在相同的区间中；

根据这个原理进行字典树逻辑的模拟规则也可以轻易得出：

1. 字典树具有多层，且每一个节点只包含一个字符；
2. 每一层的子节点不能重复
3. 从第一层开始依次代表着字符串的每一位；
4. 前缀相同的字符串在层级路径上也是相同的，即父节点是一致的；
5. 从父节点到某一节点路径上的所有字符连接起来，就是该节点对应的字符串。

有了上面的规则，下面就开始构建一个字典树

**插入逻辑**

1. 使用一个 map 当做存储的容器；
2. 遍历字符串从根节点开始将每一位都插入到 map 中；
3. 遍历完整个字符串后添加一个终止符；
4. 如果字符串已经添加过就对该字符串进行计数+1。

> 这里老师又是使用了复用变量的方式避免了递归！

**查询逻辑**

1. 从根节点开始遍历；
2. 依次向下层查找；
   1. 如果遇到了不存在节点返回 false；
   2. 如果遇到终止符，那么路径上的所有字符链接起来就是目标字符串了。

## 与 Hash Tree 的关系

可以理解为字典树是一种简化，它对于比与 Hash Tree 使用 Hash 值来进行 Key 的地址计算不同的是，使用了`直接定址法`进行 key 地址的取值，所以字典树的每一个节点都是一个`直接定址表`；由于没有使用 hash 函数（或者说是使用了线性 hash）所以节省了大量的算力运行效率也会快上一些，也省去了`hash碰撞概率`，`分辨效率`，`分辨范围`等多重考虑条件。

**直接定址法**

直接定址法是以数据元素关键字 k 本身或它的线性函数作为它的哈希地址，即：H（k）=k 或 H（k）=a×k+b ； (其中 a,b 为常数)

如：分辨数字时直接使用数字当做对应的地址。

**限定了分辨范围**

以常见的英文字典树为例，在不考虑大小写情况下其分辨范围被限定在了 node[26]，与其他 hash 函数（如质数分辨法等）相比要容易的处理的多。

**无视了 hash 碰撞**

由于分辨范围基本被限定所以处理 hash 碰撞问题基本也可以忽略掉。

**超高的分辨效率**

使用了`直接定址法`的好处就是 key 本身就是 hash 值所以，不需要进行复杂的计算就可以直接确定 key 的位置，因此分辨效率也是杠杠滴。

综上字典树就是一个通过使用特殊 hash 函数（直接定址法）从而无视掉了 hash 会遇到的`hash碰撞概率`，`分辨效率`，`分辨范围`等问题的特殊情况。

## 结合 KMP 实现 AC 自动机

在参考资料中了解到 Trie+KMP 可以可以实现 AC 自动机，AC 自动机则可以用于编译原理中

> Aho-Corasick Algorithm 简称简称 AC 算法，通过将模式串预处理为确定有限状态自动机，扫描文本一遍就能结束。其复杂度为 O(n)，即与模式串的数量和长度无关；与其相当的就是 Wu-Manber algorithm 了（由吳昇博士跟 UdiManber 所提出）。

## 奇怪知识增加了

Trie 原来真的像我猜想的那样可以用来当做格斗游戏的搓招判定，哇哈哈哈。

## 参考

- [1] [哈希树 HashTree 百度文库](https://wenku.baidu.com/view/16b2c7abd1f34693daef3e58.html)
- [2] [Trie 实践：一种比哈希表更快的数据结构](https://blog.csdn.net/stevenkylelee/article/details/38343985)
- [3] [哈希函数 直接定址法 除留余数法](https://www.cnblogs.com/claudia529/p/11107746.html)
- [4] [AC 算法(Aho-Corasick)](https://www.jianshu.com/p/e7f5766f3735)

# 11.22 字符串分析算法 | KMP 字符串模式匹配算法

## 渊源

KMP 是一种模式匹配算法，所谓的模式匹配就是从一个字符串（源串）里找到另一个字符串（pattern 串）

**朴素算法--暴力法**

暴力算法（BF 算法：brute force）：从原串中按位去匹配 pattern 串，复杂度是 m（原串长度） \* n（pattern 串长度）。

暴力法的 m\*n 复杂度是很慢的，所以在计算机科学家的努力研究下，诞生了 KMP 算法。

其中 KMP 是指三位发明算法的科学家：D.E. Knuth, J.H. Morris, V.R. Pratt Algorithm。

## KMP 主体逻辑

**核心思想**

在暴力法中是定义 i，j 两个指针分别对应源串和 pattern 串，两个指针同时移动，一旦出现了不匹配现象就将 pattern 串的指针重置为 0，原串指针回退到`i-j+1`位置（也就是其实顺序按顺序向右推一格 0->1->2 的意思）。

而 KMP 是由暴力法改进而来，其中心思想是利用匹配失败后的信息，尽量减少模式串与主串的匹配次数以达到快速匹配的目的，原理：

1. 设置一个回退表格，该表格由 pattern 串计算得来，记录了 pattern 串中任意一个字符前面有多少是自重复的字符数量；
2. 遍历源串和模式串，如果匹配则前进，如果不匹配时，则把模式串的下标按照回退表格回退到指定下标，再重复匹配过程，知道源串遍历完成。

要点：

1. 通过模式串的自重复特性，来回拨指针重新匹配，减少匹配次数；
2. 不会回拨源串下标.

**模式串中自重复的字符片段为什么能帮助 KMP 减少匹配次数？**

---

假设当前存在模式串："abcdabce"和源串:"abcdabcdabcex"

当与源串进行匹配时我们会一路成功而匹配到了 e 发现与源串匹配不上时，此时的情况是：

```
a b c d a b c e
√ √ √ √ √ √ √ x
a b c d a b c d a b c e x
```

我们可以肯定的知道 e 前面的字符肯定已经全部匹配上了，因为并不想重置所有的下标，那么我们需要能够回到一个我们已经知道匹配成功的位置就显得很重要，这个时候重复的子串就派上用场了

我们分析以下可以发现模式串中存在这"abcd"和"abce"两个相似的子串，这两个子串又同时具有"abc"这一公共的前缀，那么在我们 e 匹配不上的时候，如果能够回到"abcd"的位置重新匹配，那么不就节省了重复匹配 abc 的过程了么，此时的情况：

```
        a b c d a b c e
        √ √ √ ?
a b c d a b c d a b c e x
```

如何理解这种情况发生的原理呢？

其实当 e 不匹配时，通过回拨指针到 d 相当于将模式串进行了偏移，因为回拨完以后从源串的第一位到模式串的第一位之间的内容其实都相当于匹配不上或已经匹配成功的内容，这部分内容不需要重复进行匹配了，只需要比较最新的一位 d 是否与当前源串内容匹配即可。

这样源串是相当于一个不动的直尺，模式串则是一个可以移动的直尺，匹配过程中源串只会一直向前移动寻找，而模式串则灵活的调整自身相对于源串的位置与之对齐；当匹配成功时都向下移动一格，当某一位字符匹配失败时，源串保持当前状态，模式串移动自身到最近的重复子串处（也可能没有重复串，这样就是直接把第一位和源串的当前位对齐）与源串重新对齐，重新比较，并重复下去直到源串或模式串走完为止。

> 回退表格中每一个元素代表的是当前下标下模式串中对应字符的前一个字符的位置。也就是说 table[e]对应的是 pattern[e]的前一位 pattern[c]的下标即 7

---

查找资料后发现有理解上的错误：

KMP 的核心实现是一个叫做部分匹配表(Partial Match Table)的数组。

**什么是 PMT？**

首先了解一下什么是字符串的前缀和后缀

有字符串满足 A = BS，则字符串 B 就是 A 的前缀， 如"Hello"可以拆分成"H"、"He"、"Hel"、"Hell"等前缀
有字符串满足 A = SB，则字符串 B 就是 A 的后缀， 如"Hello"可以拆分成"o"、"lo"、"llo"、"ello"等后缀

其中 S 标识任意非空字符

而 PMT 正是这些前缀集和后缀集的交集中长度最长的元素，也就是最大前后缀

例: 字符串"aba"有前缀集["a", "ab"],后缀集["ba", "a"],则交集为["a"]此时"a"即为最长元素，所以字符串"aba"的 PMT 值为 1

**如何利用 PMT 来加速匹配效果？**

思路是这样的，首先对模式串进行一次自身的匹配，相当于模式串自身为源串匹配出模式字符串的最大前缀的操作

基于联系中的定义，其实就是 j 在移动的过程中一直在不断的拆解并分析出模式串在当 j 下标下的子串的前后缀集合，并与 i 下标下源串的前后缀集合的 PMT 值，也就是说在“i = 1，j = 0”时，如果此时字符都是"a",那么就是匹配上了就相当于分析出了交集:["a"]，而“i = 2，j = 1”时如果此时源串是"a"，模式串是"b",那么此时分析过后的交集串就是源串前后缀集合["a", "b"]，模式串前后缀集合["a", "a"]，前后缀交集：["a"]所以长度还是 1，利用这个原理将此次匹配的值告诉下一个元素（也就是 i+1,j+1）那么当匹配失败时，就可以依靠这个 1 找回到模式串中已匹配字符中的最大前后缀交集的位置了。

**所以为什么 j = table[j]?**

"为什么 j = table[j]"是周日晚上群里一个群友问的，当时尝试回答了一下，结果发现自己理解的好像有问题，所以赶紧查阅了一下资料，果不其然理解错了。

根据上面 PMT 的原理可以很容易的理解“j = table[j]”的意义，因为 table 是个数组所以容易当成一个普通数组理解，这是不对的，table 的数组的意义实质上一个类似状态机的东西，是用来存储 PMT 值的也叫 next 数组，他是把当前模式串子串所找到的最大前后缀元素的长度记录下来，并通过匹配成功时的逻辑来进行操作

```js
if (pattern[i] === pattern[j]) {
  ++i, ++j;
  table[i] = j;
}
```

这里首先是先++，所以当`table[i] = j`时其实已经是自增过的 i 和 j 了，其实也就是下一位的字符，然后通过把 j 也就是 PMT 值设置给下一位字符，让下一位字符有了感知上一位字符的能力：当我自身匹配失败时，寻找上一位字符在匹配成功的情况下，最大的前后缀交集元素在哪里。通过这个感知能力，就可以一步一步的找回到每一位字符再匹配成功时，从 0 到当前长度的字符串中最大的公共前后缀在哪里，并跳转回去。

**回头表格实现思路**

1. 声明一个 table 数组，长度等同于模式串
2. 声明两个指针 i,j 遍历模式串，i 是模式串指针(指针从 1 开始，不然整个串都是重复串)，j 是已重复的字符的指针;
3. 如果 pattern[i] === pattern[j];
4. 那么++i，++j 各自向前走一步，并把 table[i] = j，j即使PMT值，最大长度的前后缀交集元素;
5. 如果 pattern[i] !== pattern[j];
6. 此时两种情况
   1. 如果 j > 0；
   2. 把 j = table[j]，回到j-1时的最大长度的前后缀交集元素位置，不能直接回到0，因为可能会跳过一些中间状态的最大长度的前后缀交集元素；
   3. 否则++i 向前走一步

**匹配过程实现思路**

1. 声明两个指针 i,j 遍历源串和模式串，i 是源串指针，j 是模式串指针;
2. 如果 source[i] === pattern[j];
3. 那么++i，++j 各自向前走一步;
4. 如果 source[i] !== pattern[j];
5. 此时两种情况
   1. 如果 j > 0；
   2. 把 j = table[j]；
   3. 否则++i 向前走一步

## 整理总结

KMP 的核心思想是利用模式串中重复的子串与源串不断的对齐来减少比对次数，提高匹配效率。

**回退表格的作用**

通过记录最近的一次重复子串的下标给匹配过程提供一个相对位置给模式串，让模式串能够定位把哪个字符与原串进行对齐。

# 11.22 字符串分析算法 | Wildcard

没有找到相关的解析，目测应该是 Leetcode 上的[44. 通配符匹配](https://leetcode-cn.com/problems/wildcard-matching/)

**通配符的定义**

"?"：可以匹配任意一个字符
"\*"：可以匹配任意多的任意字符，包含了两种行为

1.  最后一"\*"可以匹配任意多的字符，应该尽可能多的匹配
2.  除最后一个"_"外的"_"，应该尽可能少的匹配

**拆解**

"ab*cd*abc\*a?d"

1. 开头的"ab"只匹配开头的字符
2. 最后"a?d"只匹配最后
3. 最后一个"\*"尽可能多的匹配
4. 中间的"*cd","*abc"则可以视为一组特定的 pattern

> 如果不添加"?"那么 Wildcard 本质上就是一个由多个"\*"分隔的多个 KMP 的组合，如果加上"?"会使 KMP 变得比较复杂，所以这里偷懒使用了正则来进行替换。
>
> 注：整段使用正则的话效率不达标，分段后使用是 ok 的

**实现思路**

1. 首先需要确定有多少个"\*"；
2. 如果没有"\*"则表明需要进行严格匹配，直接循环对比源串与模式串即可；
3. 如果有"\*"
   1. 首先比对第一个"\*"之前的子串是否与源串对应，不对应则直接返回 false；
   2. 循环处理"\*"
      1. 遍历 pattern 串找到下一个"\*"之前的全部 pattern 串；
      2. 将"?"替换成正则,如果正则没有匹配到那么 return false；
      3. 设置 lastIndex 指定开始匹配的位置；
   3. 从尾部遍历，处理尾部的情况（最后一个"\*"之后还有 pattern 的情况）

其实最后一个"*"是并没有直接去处理的，而是通过一个小技巧绕过去的，因为最后一个*是尽可能多的匹配那么只要是前面的"_"和 pattern 匹配成功，最后的 pattern 匹配成功那么最后一个"_"所匹配的内容其实就不重要了。

处理尾部的方式：通过`源串的长度 - lastIndex`求出最多还需要遍历多少个字符，然后根据这个长度进行遍历，使用 pattern 和 source 的长度减去 j 即可实现倒序的遍历。

注：由于最后只扫描一遍，所以需要先确定有多少个"\*"

# 提高训练

闲下来的时候一定要做一下

1. 实现一个 AC 自动机
2. 实现一个带有"?"机制的 KMP，替代正则
3. 使用 trie 实现一个格斗游戏搓招系统
