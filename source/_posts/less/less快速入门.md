---
title: less快速入门
date: 2019-06-11 07:50:09
tags: less
category:
- css
- less
---

less是一门css预处理语言，添加了变量，mixin，函数等特性，使得css更易维护和扩展。less可以运行于node服务器或者浏览器端。

less完全支持css语法，并在此基础上进行的扩展

## 变量
变量以@开头，只能定义一次，实际上就是一个常量，例子：
```less
@nice-blue: #3242b3;
@light-blue: @nice-blue+#111;

#header {
  color: @light-blue;
}
```
## mixin
minxin其实就是将一个代码片段抽离出来，可以复用，例子：
```less
.bordered {
  border-top: 1px solid black;
  border-bottom: 1px solid black;
}
```
然后要复用这一块代码，只需要将.bordered放到另一个代码块中。
```less
#menu a {
  color: gray;
  .bordered;
}
```
这里使用class来实现mixin，也可以用id

## 嵌套规则
less允许嵌套规则，例子：
```less
#header {
  color: black;
  .navigation {
    font-size: 12px;
  }
  .logo {
    width: 300px;
  }
}
```
利用嵌套规则可以少写很多代码，同时利用嵌套规则可以得到和html类似的即结构。

类似于sass，可以使用&在嵌套中指代父选择器：
```less
.parent {
  color: black;
  &:after {
    content: "";
    display: block;
  }
}
```

## 嵌套指令和冒泡
media和keyframes这样的指令可以和选择器一样嵌套。向@media、@supports、@document这样的条件指令会冒泡到最顶层，并将顶层的选择器置于他们之间，例子：
```less
.screen-color {
  @media screen {
    color: green;
    @media (min-width: 768px) {
      color: red;
    }
  }
  @media tv {
    color: black;
  }
}
```
编译后会得到
```css
@media screen {
  .screen-color {
    color: green;
  }
}
@media screen and (min-width: 768px) {
  .screen-color {
    color: red;
  }
}
@media tv {
  .screen-color {
    color: black;
  }
}
```