---
title: svg基础
date: 2019-07-26 06:50:30
tags:
- html5
- svg
- svg基础

category:
- html5
- svg
---

Scalable Vector Graphics(SVG)是一种基于XML的标记语言，用于描述基于二维的向量图形。SVG对于如何用text文本来描述图形是非常重要的。

SVG是一个基于文本的开放Web标准。其被设计为与其他的web标准共同工作比如CSS、DOM和SMIL。

SVG图片和其相关的行为被定义在XML文本文件中，这意味着它可以被搜索、索引、脚本化和压缩

## 简介
SVG是一种XML语言，和XHTML类似，可以被用于绘制向量图形。它可以被用于创建一张图片，这张图片由明确所有必须的线以及形状获得，通过修改已经存在的图片获得，或者将两者结合。图片和它的组件可以被转换、相互组合或者过滤以完全改变其外观。

SVG是一个在1999年就已经提出来的标准。

### 基本成分
HTML提供了元素用于定义headers、paragraphs、tables等等。以相同的形式，SVG提供了元素用于圆、矩形、以及简单和复杂的曲线。一个简单的SVG文档仅仅由<code>\<svg\></code>根元素以及其他一些基本形状一起组成。除此之外还有一个\<g\>元素，用于组织其他基本形状。

从这里开始，SVG图片可以变得任意的复杂。SVG支持渐变、旋转、filter效果、动画、以及和javascript的交互等等。但是所有的这些额外的语言的特性依赖于这一小串元素用于定义图形区域。

### 开始之前
有很多绘制引用可以使用比如Inkscape，但是这里我们使用最基本的XML和文本编辑器。这样是为了理解SVG的内部，自己写下标记语言是最好的学习方法。

不是所有的SVG图片在任何应用中看起来都一样，因为他们可能支持不同的SVG标准，或者与其一同工作的其他标准比如css、javascript不同，这些都会导致表现不一致。

SVG被所有的现代浏览器支持以及一小部分老的浏览器。

如果你对XML不熟悉，下面的两条准则一定要牢记于心：
* SVG元素和属性应该注意大小写，因为XML是大小写敏感的（不像HTML）
* SVG的属性应该放在双引号中，即使是数字

SVG是一个巨大的标准，这里只概括了其基础。一旦你熟悉了SVG，你应该阅读元素参考和接口参考获取更多的信息。

### SVG的风味
自从2003年成为recommendation，最常用的SVG版本是1.1，它在1.0的基础上构建，但是增加了更多模块。2008年推出了1.2

## 一个简单的实例
```html
<svg version="1.1"
     baseProfile="full"
     width="300" height="200"
     xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="red" />
  <circle cx="150" cy="100" r="80" fill="green" />
  <text x="150" y="125" font-size="60" text-anchor="middle" fill="white">SVG></text>
</svg>
```
新建一个文本文件，后缀改为svg，然后将上面的代码拷贝进去，在任意浏览器中打开，我们就能看到svg绘制出来的图形，如下：

<svg version="1.1"
     baseProfile="full"
     width="300" height="200"
     xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="red" />
  <circle cx="150" cy="100" r="80" fill="green" />
  <text x="150" y="125" font-size="60" text-anchor="middle" fill="white">SVG</text>
</svg>

渲染的步骤如下：
1. 从svg根元素开始：
   * 一个doctype声明，如上例
   * 在SVG2之前，为了识别SVG的版本以及为了多种验证方式，version和baseProfile属性必须一直被使用。version和baseProfile都在SVG2中被废弃了。
   * 作为XML的方言，SVG必须绑定正确的命名空间（在xmlns属性中）

2. 通过绘制一个背景被设置为红色的覆盖整个区域的矩形\<rect/>
3. 一个半径为80的圆，左边偏移150，上面偏移100实现居中，填充为绿色。
4. 绘制文本"SVG"，每一个内部的字符都是被填充为白色。文本通过设置一个锚点来定位到我们想要的位置。上例中是middle，在实现水平和垂直的居中。

### SVG 文件的基本属性
* 第一个需要注意的重要的事情是元素渲染的顺序。SVG文件的全局合法规则是，后一个元素渲染在前一个元素的上面。SVG文件中越向下的元素可见。
* web上的SVG文件可以在浏览器中被直接显示或者嵌入到HTML文件中，通过下面几个方法：
  * 如果HTML是XHTML并且通过application/xhtml+xml类型传输，SVG可以年被直接嵌入到XML源文件中
  * 如果HTML是HTML5，并且浏览器是一个支持HTML5的浏览器，SVG可以被直接嵌入。但是，也许会有必须的语法改变来适应HTML5标准。
  * SVG文件可以被引用为一个element元素：
    ```html
    <object data="image.svg" type="image/svg+xml">
    ```
  * iframe也可以被使用:
    ```html
    <iframe src="image.svg"></iframe>
    ```
  * img标签理论上也能使用，可能有兼容性问题。
  * 最后SVG可以通过javascript被动态创建并且注入到HTML DOM中。使用这样的替换技术我们可以在不能常规处理SVG的浏览器中实现SVG。

### SVG文件类型
SVG文件有两种风格。普通的SVG文件包含SVG标记的简单文本文件。这些文件的推荐的文件名称后缀是".svg"(都小写)

因为可能存在的巨大的SVG文件（比如地图应用），SVG标准也支持GZIP压缩的SVG文件。推荐的文件扩展名是".svgz"。可能会有兼容性的问题，对浏览器和服务器两端都有，一般浏览器只能解析从服务器获取的gzip压缩的svg文件，而不能从本地读取。

### Webserver上的配置
SVG的MIME类型是：
> Content-Type: image/svg+xml
> Vary: Accept-Encoding

对于gzip压缩的svg文件：
> Content-Type: image/svg+xml
> Content-Encoding: gzip
> Vary: Accept-Encoding

服务器返回的HTTP头的错误配置是SVG文件加载失败的常见原因。