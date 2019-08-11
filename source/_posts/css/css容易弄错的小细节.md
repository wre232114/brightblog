---
title: css容易弄错的小细节
date: 2019-07-24 07:23:47
tags:
- css
- css基础

category:
- css
- css基础
---

有很多容易被我们忽略的小细节，所以理所当然的认为的错误的细节，这里做一个汇总，遇到了就到这里添加。

## 多类选择器
在class属性中我们可以指定多个class，例如：
```html
<style>
.red {
  color: red;
}
.blue {
  color: blue;
}
</style>
<div class="red blue">color</div>
<div class="blue red">color</div>
```

这里我们需要注意的是：**多个class的顺序是无关紧要的，在上例中"red blue"="blue red"**。

那上例中的颜色到底是什么样的呢？首先可以确定是，两个div的文字颜色是一样的，因为"red blue"="blue red"。

这里就涉及到css选择器的权重机制，权重由高到低：
* !important === 10000
* style属性，内联选择器 === 1000
* id选择器 === 100
* 类、伪类、属性选择器 === 10
* 标签、伪元素选择器 === 1
* *，>，+，～ === 0

那么权重相同时如何处理呢？这时候就由css声明的顺序决定了。因为blue声明在red的后面，所以上面两个div的颜色都是blue。

同时注意，style标签可以视为放在所有属性表的最后面，如果style和link指定的样式选择器中有权重相同，同时指定了同一个css属性比如color，那么style标签优先。