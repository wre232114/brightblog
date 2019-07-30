---
title: css中各种百分比的指向
date: 2019-07-14 22:11:59
tags:
- css基础
- css单位

category:
- css基础
---

在日常的开发中，我们会接触到各种各样的百分比单位，那这些百分比到底是参照于谁呢？查了一些资料，下面做一个总结：

## 相对于父元素的宽度
max-width、min-width、width、left、right、text-intent、padding、margin、grid-template-columns、grid-auto-columns、column-gap等。

这里需要注意，margin、padding是相对于父元素的宽度，也就是padding-top、padding-bottom也是相对于父元素的宽度，利用padding的这个特性我们可以将一个盒子容器撑起来，实现等宽高比盒子缩放。这个特性在实现图片自适应，同时保持宽高比的情况下非常有用。

还有一个需要注意的是，box-sizing的设置对百分比宽度是有影响的：
* width、min-width、max-width始终相对于content-box
* left、right跟随box-sizing走，如果box-sizing是border-box，那么left、right相对于的是border-box

## 相对于父容器高度
min-height、max-height、height、top、bottom、grid-template-rows、grid-auto-rows、row-gap等。

## 相对于自身宽高
border-radius、background-size、border-image-width、transform: translate()、transform-origin、zoom、clip-path等；

## 相对于主轴长度
flex-basis

## 相对于继承的font-size
font-size

## 相对于自身的font-size
line-height

## 相对于line-height
vertical-align



