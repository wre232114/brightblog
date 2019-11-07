---
title: DOM：基础
date: 2019-09-22 17:05:04
tags:
- html5
- dom
- dom基础

category:
- html5
- dom
---

这篇文章主要介绍dom的基础知识，基于最新的[DOM标准](https://dom.spec.whatwg.org/)，和历史dom标准：[DOM 4/3/2/1](https://www.w3.org/TR/?tag=dom&status=rec)，包括dom的层级结构、dom事件、dom的遍历、dom层级中的接口和API等。

## dom简介
dom是Document Object Model的简写，就是xml或者html这种树形结构的文档以一种层级对象的形式表现出来。

例如：
```html
<html>
  <head>
    <title>hello world</title>
  </head>
  <body>
    <p>welcome to the frontend world!</p>
  </body>
</html>
```
用dom表示就是：
```
                  Document
                     |
                    html
                  /     \
    head:HTMLHeadElement  HTMLBodyElement
                /                 \
      title:HTMLTileElement     p:HTMLPElement
               /                     \
       "...":TextNode           "...":TextNode
```
这里我们注意到有Document、Element、Node等等一系列接口，接下来我们终点关注接口的继承关系和接口中重要的API。

## WHATWG和W3C
我们观察到DOM标准来自两个官网：WHATWG和W3C，那么WHATWG和W3C上的内容有什么区别呢？接下来我们从下面几个方向来取WHATWG和W3C做一个比较

### WHATWG和W3C的组成
WHATWG的全称是The Web Hypertext Application Technology Working Group(web超文本应用技术工作组)，WHATWG是一个由对web标准和测试的人组成的社区。由Apple、Mozilla、Opera在2004年创建。

W3C的全称是The World Wide Web Consortium，由W3C会员、员工和社区共同贡献。

### WHATWG和W3C标准
WHATWG和W3C是两个不同的标准组织，都致力于web标准的开发。但是WHATWG主要工作内容是HTML、HTML API、encode、DOM这些，与html文档内容及其操作相关，不包括css等。W3C的工作内容涉及到web的方方面面，web性能、css、可访问性等等。

WHATWG中的标准叫living stardard，表示不断维护的html标准，其内容浓缩了多个历史W3C标准以及最新的标准。

W3C标准按照版本号来区分标准版本，每一个历史标准都有版本号。

### 总结
WAHTWG主要是由浏览器厂商发起的标准工作组，主要工作内容是HTML文档方向标准的开发。

W3C是由W3C会员和世界各地的社区成员、学术组织工作维护的web标准，其标准内容涉及到web的方方面面。

## DOM标准的历史
这里的DOM标准主要基于W3C DOM标准

## DOM中的空白和回车的处理
在DOM中，回车和空白都会被解析成文本节点。例如，一些文本序列是这样的：
```html
<!DOCTYPE html>
<html>\n\t<head>\n\t\t<title>空白测试</title>\n</head>\n</html>
```
会被处理成如下的结构，请看[DOM结构在线演示](http://software.hixie.ch/utilities/js/live-dom-viewer/):
```
-Doctype
-HTML
--HEAD
---:text
---TITLE
----空白测试
---:text
----
```
我们可以知道html源文档中的空白和换行，在DOM中都会变成文本节点。在块级元素之间，这些文档节点在显示上没有区别，只是我们用Node的遍历API遍历时，会取到Text节点。

**行内元素源文档之间的空白和换行和被合并成一个空格**，这也是我们在使用inline-block时会出现额外的空格的原因。解决方案一个是设置父元素的font-size=0，子元素为正常的font-size；另一个是压缩文档去掉标签之间的空格。**第二个种方法是解决这个问题的最佳反感，尤其是在生产环境下，可以借助各种工程化工具来压缩html文档去掉额外的空格**

## DOM中的继承
继承在DOM中是非常重要的，每一个DOM对象都有其实现的接口，该接口可能继承了其他的接口，这些接口中定义的API和属性可以操纵和控制DOM元素。

我们这一节的主要目的是弄清楚DOM的继承关系，以及继承链上有哪些接口，这些接口有些什么属性和方法。

### 继承链
下面我们以a标签为例，弄清楚其继承链，包括继承链上接口信息：
```
EventTarget---->Node---->Element---->HTMLElement---->HTMLAnchorElement
```
我们可以看到a标签的DOM实例是HTMLAnchorElement的实现，其继承链上有HTMLElement、Element、Node、EventTarget，我们只要知道了其实例和继承的接口上有哪些实例和方法，就知道了该如何操作该DOM对象。

### EventTarget接口
EventTarget接口提供了监听和触发事件的方法，能够监听事件的接口比如Element、Document、XMLHttpRequest等等。

接口中只提供了以下方法：
* addEventListener(type, listener, [useCapture/options])：useCapture该函数一个useCapture从ie9+开始开始支持（默认是false，即冒泡阶段调用），options底版本浏览器不支持，options是一个对象，参数属性如下：
  * capture：布尔值，true表示捕获，默认是false
  * once：布尔值，true表示只执行一次，默认是false
  * passive：布尔值，true表示监听器永远不会调用preventDefault()，默认是false
  * **this的处理：事件处理函数的this指向当前的EventTarget（哪个元素绑定的事件就指向哪一个元素）。箭头函数没有自己的this。如果使用bind绑定this，那么获取到的this就是bind绑定的this（只有new绑定的this优先级比bind高）。关于addEventListener的详细请看[EventTarget.addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)**
* removeEventListener
* dispatchEvent

### Node接口
我们先看Node接口，其属性和方法如下。

先来属性：
* nodeType：节点类型，可能的值是1-12，对应关系如下：
  * 1：Node.ELEMENT_NODE，元素比如`<p>`、`<div>`
  * 3：Node.TEXT_NODE，文本节点，是Element或Attribute的子节点
  * 4：Node.CDATA_SECTION_NODE，例如<!CDATA[[ ... ]]>
  * 7：Node.PROCESSING_INSTRUCTION_NODE，XML文档的ProcessingInstruction，例如`<?xml-stylesheet ...?>`
  * 8：Node.COMMENT_NODE
  * 9：Node.DOCUMENT
  * 10：Node.DOCUMENT_TYPE，例如`<!DOCTYPE html>`
  * 11：Node.DOCUMENT_FRAGMENT_NODE
  * 最新的标准中就这些，其他还有ENTITY、NOTATION等都已经在DOM4中被废除了，**ATTRIBUTE没有被废除但是不属于Node了**。具体需要的时候查[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType)
* nodeName：节点名称，对于不同的节点类型会返回不同的值
  * Element.nodeName：返回元素的名称，**大写**
  * Attr.nodeName：属性的名称，**小写**
  * Text.nodeName：返回#text
  * CDATASection.nodeName：返回#cdata-section
  * ProcessingInstruction.nodeName：目标的名称
  * Comment.nodeName：#comment
  * Document.nodeName：#document，例如document.nodeName的值就是"#document"
  * DocumentType.nodeName：文档的类型，例如html，document会有两个子节点，一个是doctyoe，另一个是html根结点。取document.documentElement取到的就是html根结点
  * DocumentFragment.nodeName：返回#document fragment
* nodeValue：从字面意思上看，nodeValue就是Node的值，但是事实上，nodeValue只对少量的DOM对象有效，主要是值是文本的节点，其他的均返回null
  * Attr.nodeValue，字符串形式的属性值
  * Text.nodeValue，字符串形式的节点内容
  * CDATASection.nodeValue，字符串形式的节点内容
  * ProcessingInstruction.nodeValue，同上
  * Comment.nodeValue，字符串形式的注释文本
  * 其他的都返回null
* parentNode：引用父节点
* childNodes：引用子节点，返回的是NodeList对象，这是一个类似于数组的对象，内容是Node列表，可能包含Element、Text、Comment等
* firstChild
* lastChild
* previouSibling，如果是同辈第一个节点，那么值为null
* nextSibling，如果是同辈最后一个节点，那么值为null
* ownerDocument：引用document/window.document
* textContent：文本，textContent的值取决于以下情况：
  * 如果node是document、DOCTYPE或者notation(xml)，返回null
  * 如果node是CDATA、COMMENT、TEXT，textContent返回节点的值（文本）
  * 对于其他的类型，返回每一个子节点的textContent，不包括comment和processing instruction。如果没有子节点也没有内容，返回空字符串

再来方法：
* parent.appendChild(child)：将child插入到parent的最后面。如果child是一个对DOM中元素的引用，那么会将其**移动到新的位置**。如果需要克隆，而不是移动，需要使用cloneNode先克隆节点，然后再使用appendChild
* cloneNode([deep])：复制一个节点，可选参数deep是一个布尔值，当deep=true的时候，会复制其所有子节点，默认为false。cloneNode会复制所有的属性和内联的事件处理器。**但是不会复制addEventListener挂载的事件处理器，也不会复制后来添加的事件处理器（例如：dom.onclick=）。canvas绘制的图像也不会被复制。被复制的节点游离于dom外**
* node1.compareDocumentPosition(node2)：比较两个节点的位置关系。IE9+。
* node1.contains(node2)：判断一个节点是不是另一个节点的子节点。IE9+。
* node.hasChildNodes()
* parent.insertBefore(newNode, referenceNode)，再parent下插入到参考节点的前面。如果是对文档中已有的节点进行操作那么是移动。如果需要复制使用cloneNode(true)。如果refNode是null，插入到最后面
* node.isEqualNode(otherNode)
* node.normalise()：将node的子树格式化，格式化的子树中没有空的文本节点以及没有相邻的文本节点。
* parent.removeChild(child)
* parent.replaceChild(newChild, oldChild)

> <h3 id="difference-between-textContent-innerText">textContent和innerText的区别</h3>
> 1. textContent获取所有的文本内容，包括style和script标签,但是innerText只返回人类可读的内容
> 2. textContent获取每一个节点的文本内容，包括隐藏的元素。innerText获取使用的css以后的文本，**innerText会触发回流**
> 3. 使用textContent只会当作文本处理，不会有xss攻击的可能

## 参考资料
- [DOM Living Standard](https://dom.spec.whatwg.org/)
- [W3C DOM](https://www.w3.org/TR/?tag=dom&status=rec)
- 《Javascript DOM高级程序设计》