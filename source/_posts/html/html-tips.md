---
title: html tips
date: 2019-09-08 07:50:14
tags:
- html5
- tips

category:
- html5
- tips
---
这篇文章的主要内容是记录开发中遇到的一些html小知识。

### textContent和innerTEXT的区别
1. textContent
   textContent的值取决于以下情况：
   * 如果节点是documnet、DOCTYPE或者notation，textContent返回null
   * 如果是CDATA Section、注释、处理指令或者text node，返回节点内部的文本
   * 其他节点返回所有子节点的textContent的字符串拼接

  **设置textContent会移除所有的子节点并用文本替换他们**。

   
2. innerTEXT
   innerTEXT表示节点和其后代的**渲染过**的文本内容。只会返回用户可以看到的文本内容，例如script、style以及hidden的元素不会返回内容。

textContent和innerTEXT的区别如下：
* textContent获取所有的内容，包括不可见的元素。innerTEXT只获取可见的内容。
* **textContent遇到br、div等元素不会添加换行，innerTEXT会自动添加换行**