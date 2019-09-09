---
title: html5新标签/属性总结
date: 2019-07-22 08:00:01
tags:
- html5
- html5标签和属性

category:
- html5
- html5标签和属性
---

## 结构型的标签
html5新增了很多结构型的标签，这些标签没有默认样式，只设置了display:block，是块级元素，其作用主要是语义化，标签名就指示了这个标签所起的作用（除此之外，id、class都可以起到类似的作用，只要能反映标签的作用）。

主要的结构标签有：header、footer、section、article、aside、main、hgroup、figure、figurecation

结构化标签的作用：
* article：表示文档，一般有自己的头部、内容等，例如一篇博客文章，可以与header、footer等结合使用
* section：用于分块，每一个分块一般有自己的标题，article强调独立性、section强调分块
  * 不要将section用作设置样式的页面容器，那是div的工作
  * 如果article、aside、nav更符合使用条件，不要使用section元素
  * 不要为没有标题的内容区块使用section元素
* nav：导航，页面的导航或者文档的导航
* aside：页面或者文章的附属信息
## 默认有margin的元素
p、ul、figure、body、ol，menu，dir，dd

## 默认有padding的元素
ul、ol，menu，dir，button

## 默认有background的元素
mark

## 全局属性
全局属性是指在任何标签上都能使用的属性。这里所指的任何标签是任何支持该属性的标签，有些全局属性被所有的标签支持，例如id、class等，有些只能被部分支持，例如contenteditable。
### contenteditable
将元素的contenteditable属性置为true，会让该元素变成可编辑的，聚焦到该标签上时，可以编辑该标签内的内容。编辑会直接修改元素的文本，暂时没有相关的API，只能通过innerHTML/textContent获取元素的内容。回车会创建新的被编辑的元素，li会创建新的li，section会创建新的section。

### hidden
所有元素都允许使用hidden属性。该属性类似于input元素中的hidden元素。功能是通知浏览器不渲染该元素（元素为渲染前获取不到元素所处的位置），使元素处于不可见的状态，但是内容还是由浏览器创建，之后可以通过脚本取消。

### tabindex
tabindex决定了一个元素能不能获取焦点，以及是否参与到线性的键盘导航中（使用tab键进行切换）

tabindex接受整数作为它的值：
* -1，取值-1表示该元素可以被focus，但是不能被tab聚焦（元素可以使用focus()聚焦）
* 0，取值0表示tab顺序按照文档的顺序，是DOM的顺序，和元素显示的位置无关
* 正整数如1、2、3，tab会先切换到小的，再切换到大的，值一样的按照dom的顺序切换
