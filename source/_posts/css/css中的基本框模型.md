---
title: css中的基本框模型
date: 2019-06-15 13:52:24
tags:
- css
- css基础
category:
- css
---
## 概述
这是一篇css基础的文章，主要讲css中的各类框模型的细节，比如inline-block，table，flex，grid。这里会解答一些开发中常见的问题，例如：为什么有时候我设了外边距、内边距没有效果？

这些其实很多都是由css框模型来决定的。那么问题来了：css中的框模型不就是外边距+边框+内边距+内容吗？有什么好说的呢？

其实不然。你知道在什么时候框模型没有外边距、没有内边距吗？为什么表格设了宽度没有效果？事实上，但我们使用display指定不同的布局形式的时候，框模型会根据不同的值，有不同的行为。

同时，也会描述html和css分离的思想，例如，我们知道&lt;div&gt;是块级元素，所有的书上都会这么写，但是其实，只是&lt;div&gt;默认布局是display:block，这是由浏览器实现的默认行为。用这种思想来看待css和html，就会清晰很多。事实上，在浏览器底层，是使用dom+cssdom来构建页面的，cssdom就是由浏览器默认样式、开发者定义的样式等来构建的。html元素的几乎所有样式行为，都可以由css来定制。

当我们理解了上面的两个核心概念——不同框模型的不同行为+html与css分离的思想——之后，我们对于页面的理解/把控一定会更上一层楼。

## 举个例子

举个例子，对于表格来说，表格元素(table)和表格单元格(th,td)的框模型其实不一样，表格单元格没有外边距，表格没有内边距（当table-collapse:collapse时，设置内边距没有效果），也就是说在表格单元格设置外边距和表格上设置内边距是无效的。同时，依照html和css分离的思想，表格是display:table，表格单元格是display:table-cell，所以我们在div上使用display:table-cell，可以将div的框模型变成表格单元格，与普通的td并无区别——因为td默认就是display: table-cell。

上一张表格的框模型图：
![表格图](/img/table-layout.png)
在图中我们可以看到，右上角的user agent stylesheet表明是浏览器默认提供的样式表。

我们在设置一下table-cell的margin看看
```css
td {
  margin: 20px;
}
```
![表格单元格](/img/table-cell.png)
可以看到，表格单元格的框模型里面没有margin,只有border,padding和content。

而对于thead,tbody,tr,tfoot呢？thead,tbody,tr,tfoot只有内容和边框，没有内边距和外边距。后面会详细讲表格的细节，包括如何实现表格单元格宽度固定、单行/多行文本、利用css表格属性实现块级/非块级的水平垂直居中对齐等等。

接下来我们列举一些display属性值，来看看其框模型行为究竟是怎样的。

## display:block/inline
这是最常见的两种布局模式，html块级元素的默认布局是block，内联元素的默认布局是inline。相信大家都知道block和inline的区别——block元素单独一行，可以设置宽高；inline元素不能设置宽高，超出一行的内容会自动换行。

如果我们想让一个元素表现得像块级元素，只需设置其display:block，这样设置的元素和div元素没有任何的区别，因为div的默认样式就是display:block。去掉外在，大家都一样，穿上一样的衣服，大家也都一样，这篇文件中会始终使用这个思想（仅仅是个人的理解，不具备任何权威性，大家做个参考就好，欢迎提出批评和指正）

## display:inline-block
display:inline-block综合了两种元素的特性，表现的像内联元素，但是它可以设置宽高。

这里需要注意的是，如果我们在一个block元素中写了多个inline-block元素，而我们在源代码中将这几个元素写在了很多行中，那么页面中会多出来间隙，多出来的间隙其实是空格，只不过浏览器将换行、空格等都合并成一个空格了。

这个问题在多个不同行的内联元素中均存在。

如下面的例子：
```html
<style>
span {
  width: 50px;
  height: 40px;
  border: 1px solid gray;
  display: inline-block;
}
</style>
<div>
  <span></span>
  <span></span>
</div>
```
效果如下图：
![效果](/img/display-inline-block)

去掉空格可以将父元素的font-size设置成0，然后子元素的字体设置成对应的字体。

```css
div {
  font-size: 0;
}
span {
  font-size: 16px;
}
```
ie8及以上完全支持，在ie6、ie7中不支持，但是可以模拟，在ie6、ie7中，兼容性写法如下：
```css
span {
  display: inline-block;
  *display: inline;
  *zoom: 1;
}
```
*开头是ie特有的，inline说明元素内联显示，zoom触发布局，让其可以设置宽高。

## display:table/inline-table
table和inline-table的区别是，table占单独的一行，而inline-table是内联的，这两者的表格特性都完全相同。inline-table可以用于内联元素的垂直距中对齐。

在前面的示例中我们已经对表格进行了一些介绍，这里稍微总结一下：
* 在表格设置了border-collapse: collapse时，table元素设置padding无效
* th、th没有margin，只有padding
* thead、tfoot、tbody、tr只有border，没有padding、margin

接下来我们更加深入表格，这里我分出来下面几个特性：
* 表格能否设置宽高
* 表格宽高是否根据内容自动扩张
* 表格内容换行/不换行
* 表格内容对齐

### 表格设置宽高

使用width: VALUE，就可以设置表格的宽。这里需要注意的是，使用<code>table-layout:auto</code>，表格的宽度会随内容的扩展而扩展，不管是否设置了宽高（这时候的宽高相当于min-width、min-height）；使用<code>table-layout:fixed; width:VALUE</code>可以限定表格的宽高，需要注意的是，如果给子元素设置了固定宽高，且子元素的宽度之和大于父元素设置的宽度，那么表格依然会扩展自己的宽度来适应子元素的宽度。

### 表格宽高根据内容自动扩展
当table-layout为auto时，表格的宽高会根据内容来自动扩展，即便我们设置了宽高，当内容的宽度大于表格宽度，表格宽度依然会自动扩展，宽度为width的单元格将不显示；

当table-layout为fixed时，需要指定table的width，然后再设置表格单元格的width。这时候表格的宽度就是固定的。但是仍然要注意：
* 所有单元格的内容宽度之和大于表格宽度，表格依然会扩展自己的宽度
* 所有单元格都设置了宽度，且宽度之和小于表格宽度，那么按照单元格的宽度之比将表格宽度分给单元格。例如：
  ```html
  <style>
    table {
      table-layout: fixed;
      width: 500px;
    }
    td {
      width: 200px;
    }
    td:first-child {
      width: 100px;
    }
  </style>
    <table>
      <tr>
        <td>111</td>
        <td>bright</td>
      </tr>
    </table>
  ```
  那么两个单元格会按照1:2的比例来分这500px。
* 当只设置了其中某一个或者某几个表格的宽度时，剩下的单元格会平分剩下的空间
* 高度会始终适应内容的高度，设置height的效果始终只相当于min-height

### 表格换行/不换行

但表格内的内容是文本时，我们可以利用white-space和word-break属性来控制文本的换行，当没有限定表格单元格的宽度的时候，宽度是根据内容来自适应的，会首先尽量填满表格的空间而不会换行。

### 表格内容对齐
可以很方便的利用表格进行垂直居中对齐。
* 块级元素垂直居中对齐：
  ```html
  <style>
    .table {
      width: 400px;
      height: 400px;
      display: table;
    }
    .table-cell {
      width: 100px;
      height: 100px;
      display: table-cell;
      vertical-align: middle;
    }
    .content {
      width: 50px;
      height: 50px;
      margin: 0 auto;
      font-size: 14px;
    }
  </style>
  <div class="table">
    <div class="table-cell">
      <div class="content"></div>
    </div>
  </div>
  ```
  效果如下：
  <div style="display:table">
    <div style="display:table-cell;width: 100px;height: 100px; border:1px solid gray; vertical-align: middle;">
      <div style="width:50px;height:50px;border:1px solid gray;margin: 0 auto"></div>
    </div>
  </div>
* 内联元素和块级类似，块级元素水平居中使用margin:0 auto;，内联元素使用text-align: center;垂直居中使用

## 总结

接下来对上面提到的一些框模型进行总结，如下表：
框模型|特有的css属性|有无内边距|有无外边距|能否设置宽高|备注
:---:|:---:|:---:|:---:|:---:|:---:
block|/|有|有|可以|利用width可以设置宽度，width:100%可以拉伸，width:auto内容自适应
inline|/|有|有|不能|一个块级元素中有多个内联元素，这些内联元素在代码中不在同一行，那么页面中会被插入空格，解决方案看下面
inline-block|/|有|有|可以|多行的inline/inline-block会被插入空格，使用font-size可以解决