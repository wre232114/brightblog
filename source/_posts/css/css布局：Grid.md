---
title: css布局：Grid
date: 2019-08-13 07:44:13
tags:
- css
- css基础
- css布局

category:
- css
- css基础
---
参考资料：[mdn css grid](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Grids)

css grid布局是一个web上二维布局系统，它可以让你把内容放置在数行和数列中，而且可以通过一系列的特性，实现复杂的布局。

## 什么是Grid布局？
一个grid只是简单的行和列的集合，grid创建了一种模式我们可以在一行上放置我们设计的元素。

一个grid通常有三种元素，rows、columns、gutters（行列之间的间隙）。
![示意图](https://mdn.mozillademos.org/files/13899/grid.png)

## 在css中创建grid
这里首先会介绍Grid布局的基本特性，然后探索如何在自己的项目中引入基本的grid布局。

### 定义一个grid
使用display:grid来定义一个grid布局容器。类似与flex布局，这会将当前容器切换到grid布局系统，并且容器的所有直接子元素都会变成grid items。
```css
.container {
  display: grid;
}
```
但是不像flex布局，grid默认是一列，所以看起来只设置的display: grid看起来并且没有什么区别。

接下来我们在grid中设置多列：
```css

.container {
  display: grid;
  grid-template-columns: 200px 200px 200px;
}
```
然后看起来就像下面这样：
{%raw%}
<style>
.mycontainer {
  display: grid;
  grid-template-columns: 200px 200px 200px;
}
.mycontainer div {
  background: lightseagreen;
  border: 2px solid seagreen;
  border-radius: 5px;
}
</style>
<div class="mycontainer">
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
  <div>5</div>
  <div>6</div>
  <div>7</div>
</div>
{%endraw%}

### 通过fr实现弹性的grid
除了使用长度和百分比来创建grid之外，我们还可以使用fr来弹性设置grid rows和grid columns。1fr代表代表grid容器的一份可用空间。

改变上面的代码：
```css
.mycontainer {
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 20px;
}
```
{%raw%}
<style>
.mycontainer1 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 20px;
}
.mycontainer1 div {
  background: lightseagreen;
  border: 2px solid seagreen;
  border-radius: 5px;
}
</style>
<div class="mycontainer1">
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
  <div>5</div>
  <div>6</div>
  <div>7</div>
</div>
{%endraw%}

我们看到三列平分了每一行的可用空间。如果我们将第一列改称2fr，那么每一行的可用空间总共分成4份，第一列占2份（和flex一样）。可以使用grid-column-gap、grid-row-gap设置列和行之间的间距，或者grid-gap同时设置行和列的间距。gap支持长度和百分比，**但是不支持fr单位**。最新的标准变成了gap属性，为了统一多列布局和grid布局的gap，所以最保险的做法是同时使用grid-gap和gap属性。
