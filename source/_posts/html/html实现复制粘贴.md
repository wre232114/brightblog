---
title: html实现复制粘贴
date: 2019-09-08 11:18:00
tags:
- html5
- 实战

category:
- html5
- 实战
---
这篇文章记录了如何在html中选中、复制、粘贴内容，以及如何操作可编辑区域中的光标位置。

## 基础概念
首先我们要介绍一些要用到的基础概念和相关API的使用。

### 选中
DOM提供了与选中有关的API，主要是Selection接口和Range接口。

#### Selection
一个Selection对象表示用户选择的文本范围或者当前光标的位置。使用window.getSelection()来获取Selection对象。

和Selection相关的有三个关键的概念，分别是：anchor、focus、direction。

1. anchor
   anchor表示选择的开始，代表鼠标按下时的位置。这个位置在一次选择中是不变的。

2. focus
   focus表示选择的结束，代表鼠标松开时的位置或者通过键盘操作结束时的位置。

3. direction
   选择的方向，选择文本的时候可以从左向右选择，也可以从右向左选择。

anchor/focus和开始位置和结束位置（Range中的概念）不同，anchor可以在focus的前面，也可以在focus的后面，根据direction来确定。

**Selection不仅仅可以选择文本，还可以选择多个节点**，与此相关的概念是，anchorNode和focusNode，anchorNode表示anchor位置的节点，即按下鼠标时的节点；同理focusNode表示松开鼠标时的节点。

下面是使用Selection时的一些tips:
* 调用Selection.toString()会返回选择中包含的文本
* 一个Selection可以包含多个Range
* 调用Selection API时的表现
  * 一个编辑宿主获取焦点，如果上一次选择在其外面
  * 如果Selection API被调用，导致编辑宿主中创建一个新的Selection
  * 焦点移动到编辑宿主

使用下面的API可以创建/修改selection：
* Selection.collapse(node, offset)：销毁指定的元素中的选择，并将光标定位到offset的位置
* Selection.collapseToStart()：销毁指定元素中的选择，并将光标定位到其range开始的位置
* Selection.collapseToEnd()：销毁指定元素中的选择，并将光标定位到range结束的位置
* Selection.extend(node, offset)：将focus移动到指定的位置，anchor不同，选择变成anchor到新的focus，不论方向
* Selection.selectAllChildren(parentNode)：丢弃之前的selection，添加指定Node的所有子节点到selection中
* Selection.addRange(range)
* Selection.setBaseExtent(anchorNode,anchorOffset,focusNode,focusOffset)：将两个节点和其之间的内容添加到选择中

API参数是node和offset时，如果node节点是文本节点，offset就是字符串的数量；对于其他的节点类型，是从node开始的子节点的数目。


#### Range
Range代表document中的一部分，可以包含节点和文本节点的一部分。

使用Selection API和Range API操作文档中的选择的过程是，选择代表用户或者API选中的文档中的一部分节点或者文本，选中的这一部分节点或者文本叫做Range，所以Selection和Range是有对应关系的，大部分情况下一个Selection对应一个Range，但是也可以对应多个Range，例如使用ctrl或者API来选择多个Range。

操作Range的常用API如下：
* Range.setStart(startNode, offset)：设置Range的开始位置。**设置一个在end后面start会导致Range崩塌(collapse)，start和end都被设置在同一点，为start的位置**
* Range.setEnd(endNode, offset)
* Range.setStartBefore(referenceNode)
* Range.setStartAfter(referenceNode)
* Range.setEndBefore(refNode)
* Range.setEndAfter(refNode)
* Range.collapse
* Range.selectNode(node)：将node及其内容加入到Range中
* Range.selectNodeContents(node)

