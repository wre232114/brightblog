---
title: html实现选中、获取设置光标、复制、粘贴，并实现一个markdown编辑器
date: 2019-09-08 11:18:00
tags:
- html5
- 实战

category:
- html5
- 实战
---
这篇文章记录了如何在html中选中、复制、粘贴内容，以及如何操作可编辑区域中的光标位置，并基于这些基础知识实现了一个简单的markdown编辑器。

## 基础概念
首先我们要介绍一些要用到的基础概念和相关API的使用。

### 选中
DOM提供了与选中有关的API，主要是Selection接口和Range接口。

#### Selection
一个Selection对象表示用户选择的文本范围或者当前光标的位置。使用window.getSelection()来获取Selection对象。

和Selection相关的有三个关键的概念，分别是：anchor、focus、direction。

1. anchor
   anchor表示选择的开始，代表鼠标按下时的位置。这个位置在一次选择中是不变的。通常使用DOM节点+文本偏移来表示

2. focus
   focus表示选择的结束，代表鼠标松开时的位置或者通过键盘操作结束时的位置。通常使用DOM节点+文本偏移来表示

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
* Selection.setPosition(ndoe, offset)：同上，是collapse的别名
* Selection.collapseToStart()：销毁指定元素中的选择，并将光标定位到其range开始的位置
* Selection.collapseToEnd()：销毁指定元素中的选择，并将光标定位到range结束的位置
* Selection.extend(node, offset)：将focus移动到指定的位置，anchor不同，选择变成anchor到新的focus，不论方向
* Selection.selectAllChildren(parentNode)：丢弃之前的selection，添加指定Node的所有子节点到selection中
* Selection.addRange(range)
* Selection.setBaseExtent(anchorNode,anchorOffset,focusNode,focusOffset)：将两个节点和其之间的内容添加到选择中

注意：Selection API参数是node和offset时(extend除外)，如果node节点是文本节点，offset就是光标左边字符的数量；对于其他的节点类型，是node的偏移的**子节点的数量**。举个例子：
```html
<article contenteditable id="editor">
  <div>sfasffdgfdg</div>
  <div>光标位置</div>
</article>
```
假设调用`window.getSelection().setPosition(document.getElementById(editor), 1)`，那么光标会被设置在第二个div的开始位置。如果希望精确到文本偏移，请确保选择一个其子节点是文本节点的节点。

#### Range
Range代表document中的一部分，可以包含节点和文本节点的一部分。获取Range的方式是document.createRange()或者Selection.getRangeAt(index)

使用Selection API和Range API操作文档中的选择的过程是，选择代表用户或者API选中的文档中的一部分节点或者文本，选中的这一部分节点或者文本叫做Range，所以Selection和Range是有对应关系的，大部分情况下一个Selection对应一个Range，但是也可以对应多个Range，例如使用ctrl或者API来选择多个Range。

操作Range的常用API如下：
* Range.setStart(startNode, offset)：设置Range的开始位置。**设置一个在end后面start会导致Range崩塌(collapse)，start和end都被设置在同一点，为start的位置**
* Range.setEnd(endNode, offset)
* Range.setStartBefore(referenceNode)
* Range.setStartAfter(referenceNode)
* Range.setEndBefore(refNode)
* Range.setEndAfter(refNode)
* Range.collapse(toStart)：将Range设置为一个边界点，默认到为结束，toStart结束为开始
* Range.selectNode(node)：将node及其内容加入到Range中
* Range.selectNodeContents(node)

### 浏览器的可编辑区域
首先我们先要了解以下浏览器的可编辑元素，浏览器的可编辑元素，我们知道的可编辑元素有两种，一个是将元素设置contenteditable，另一个是textarea。contenteditable可以设置于任何元素，让其内容变成编辑的，其与textarea的区别是，textarea的内容是纯文本，contenteditable元素的内容虽然输入的是纯文本，可以但是在浏览器中复制dom（直接选中复制即可），可以用dom API插入DOM，这样可以在contenteditable中实现高亮，显示图片预览等等功能。接下来我们对两者分别介绍。

#### contenteditable
contenteditable可以将任意一个元素设置成可编辑的，这里的可编辑，当用户聚焦的时候输入的时候，输入的是纯文本，也就是输入`<span class="red">red</span>`的时候，显示的就是输入的文字。

但是当我们从其他html页面中选中一部分然后复制时，可以直接将这一部分DOM复制过来，可以包括图片和样式。复制DOM：
![HTMLSelection](/img/2019-09-14-HTML-Selection.png)
在contenteditable中复制结束后（图中自己使用contenteditable和Selection API写的markdown编辑器，详见）：
![HTMLSelection](/img/2019-09-14-HTML-Selectin-copy.png)

也可以直接用DOM API来操作DOM，例如设置颜色、背景、插入图片，表格等等。在发散思考一下，是不是利用这些特性，一个可编辑的富文本编辑器的雏形就出来了？可以在可编辑区域中插入表格，设置字体颜色，插入图片预览，最重要的是，可以直接复制这些内容！

需要注意的是，我们在contenteditable区域中输入换行的时候，被编辑的元素中会插入一个DIV(或者是li等，取决于父元素)，而不是用\n表示。当我们想要获取到contentediable元素中的换行时，需要使用innerTEXT而不是textContent，关于innerTEXT和textContent的区别请看我的另一篇文章：[innerTEXT和textContent的区别](http://brightblog.cn/)。

而且当使用Selection API时，contenteditable也会比textarea复杂，因为contenteditable元素可能有很多子元素，在设置光标的位置的时候可能会遇到麻烦，请继续阅读下文的实现部分——实现一个markdown编辑器。

#### textarea
textarea是文本输入区域，其内容区域的所有内容都是文本。不能实现contenteditable元素中对dom操作的那么多功能。其优点是兼容性好，比较简单。

在textarea中获取光标/选中的位置十分方便，直接使用textarea DOM(HTMLTextAreaElement接口）的selectionStart、selectionEnd、selectionDirection来获取，当selectionStart===selectionEnd时，表示光标的位置，获取到的是，光标在textarea中偏移的字符的数量。选择的方向可以是从前到后，也可以是从后到前，由selectionDirection给出，值是"forward"或者"backward"。

提示：css规范并没有规定textarea的基线在哪里，不同浏览器对textarea的实现不同，其基线是不一致的，使用vertical-align: middle得不到一直的结果，并且其结果是不可预测的。

### 复制粘贴
在浏览器中有两种和系统剪切板进行交互的方式：Document.execCommand以及现代异步的ClipBoard API。

使用document.execCommand来实现复制粘贴可以兼容到IE 9，ClipBoard API是最新的标准，用于取代document.execCommand，chrome 66以后才支持。接下来我们来看看两种实现复制粘贴的方式。

#### document.execCommand
使用copy、cut、paste三个命令来实现复制粘贴：
* document.execCommand('copy')，将当前选中的内容替换系统剪切板的当前内容
* document.execCommand('paste')，将系统剪切板中的内容复制到光标位置
* document.execCommand('cut')，将当前选中的内容替换系统剪切板的当前内容，并移除原有内容

当**直接在事件处理器中执行命令时没有权限问题**，但是如果要直接使用execCommand时，不同的浏览器会有不同的行为，在某些浏览器中可能会报错（没有复制权限），需要申请权限，关于权限API请看我的另一篇博客[浏览器中的权限和Permission API](#)

#### ClipBoard API
使用navigator.clipBoard可以访问clipboard API，clipboard API是最新的标准，所有的API都是基于Promise的异步API。

提供了以下API：
* read()：从剪切板请求任意的数据，例如图片，返回一个Promise。Promise resolve的是一个DataTransfer对象。
* readText()：从剪切板请求文本。Pormise resolve的是一个DOMString文本。
* write()：向剪切板写入任意的数据，返回Promise，Promise resolve表示写入完成
* writeText()：向剪切板写入文本
* 
```js
navigator.clipboard.readText().then(str => {
  console.log(str)
})
```

clipboard API的优势是其是最新支持的标准，能够直接操作剪切板，向剪切板插入任意数据。

劣势是兼容性差，必须要Permission。

#### 参考资料
[MDN Interact with the clipboard](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard)

## 实战
这里我们使用上面提到的API，来实现一个简单版的markdown编辑器，主要功能是，在光标位置插入指定的内容，并重置光标位置。

* Selection和Range API用于设置光标位置，选中指定的区域。Range代表一个区域，API的主要作用是设置区域的开始和结束，Selection代表选中，可以包含多个区域，API的主要作用是设置range，操作选中的区域（销毁选中、选中指定的区域），设置光标。
* execCommand和ClipBoard API用于复制粘贴。选中->复制：可以复制到剪切板，设置光标->粘贴，可以在光标位置粘贴。
* contenteditable元素中插入的是dom，可以通过操作DOM来实现各种内容（多行、图片等）的插入。

