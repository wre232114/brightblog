---
title: svg基础：定位&基础图形
date: 2019-07-27 07:43:30
tags:
- html5
- svg
- svg定位

category:
- html5
- svg
---

在这篇文章中，我们检验SVG怎么样在一个绘制上下文中呈现对象的位置和大小，包括坐标系统以及'pixel'度量在可伸缩上下文中意味着什么。

## 网格
对于所有的元素，SVG使用一个坐标系统或者grid系统，和canvas中使用的相似，左上角是(0,0)，向左x增大，向下y增大。位置可以通过指定相对于原点的左上偏移来指定。这也是HTML元素默认的坐标系统形式。

**例如**
```html
<rect x="0" y="0" width="100" height="100" />
```
定义了一个从左上角开始的举行，并且左右、上下横跨100px。

## 什么是“像素(pixel)”
在大部分的基础场景中，SVG文档中的1像素对应输出设备的1像素（比如屏幕）。但是SVG中的S对应着Scalable（可伸缩的），如果SVG没有改变这个行为的可能性的话，它就不会有这个名字。非常像css种的绝对和相对的font-size。SVG定义了绝对长度单元（比如"pt"或者"cm"），称其为用户单元，它缺少单位并且只是单纯的数字。

没有进一步明确的说明，一个用户单元等与1个屏幕分辨率。为了显式地改变这个行为，在SVG中有几个途径。从svg标签开始：
> \<svg width="100" height="100">

上面的元素仅仅对应100x100 px，一个用户单元等于一个屏幕单元。
> \<svg width="200" height="200" viewBox="0 0 100 100">

整个SVG画布是200x200 px。但是viewBox属性定义了画布展示的部分。200x200的区域从用户单元(0,0)开始，并且跨度为100x100用户单元。**在这里，width=200，height=200，定义了svg的宽和高，这是不变的，那么viewBox的作用是什么呢?viewBox可以控制图形和显示区域的比例，在上例中，viewbox是(0,0)到(100,100)，那么可视区域将在200x200的区域内展示原图形中100x100的图形，相当于将svg放大了两倍。如下例：**

<svg version="1.1"
     baseProfile="full"
     width="300" height="200"
     xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 150 100">
  <rect width="100%" height="100%" fill="red" />
  <circle cx="150" cy="100" r="80" fill="green" />
  <text x="150" y="125" font-size="60" text-anchor="middle" fill="white">SVG</text>
</svg>

将用户单元转为屏幕单元的匹配称为用户坐标系统。除了缩放之外，坐标系统还可以旋转、扭曲和翻转。默认的用户坐标系统匹配一个用户像素称1个设备像素（但是，设备可能决定，设备的1个像素意味着什么。例如，一个设备像素可能对应多个物理像素，比如移动设备）。SVG文件中的用于明确w维度的长度单元，比如"in"或者"cm"，会用一种方式计算，让其在结果图片中1:1显示。


## 基本形状
### 矩形
> \<rect x="10" y="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5" />

<svg version="1.1"
     baseProfile="full"
     width="100" height="50"
     xmlns="http://www.w3.org/2000/svg">
     <rect x="10" y="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5" />
</svg>

> \<rect x="60" y="10" rx="10" ry="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5" />

<svg version="1.1"
     baseProfile="full"
     width="100" height="50"
     xmlns="http://www.w3.org/2000/svg">
     <rect x="60" y="10" rx="10" ry="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5" />
</svg>
### 圆
> \<circle cx="25" cy="75" r="20" stroke="red" fill="transparent" stroke-width="5" />

<svg version="1.1"
     baseProfile="full"
     width="100" height="100"
     xmlns="http://www.w3.org/2000/svg">
     <circle cx="25" cy="75" r="20" stroke="red" fill="transparent" stroke-width="5" />
</svg>

### 椭圆
> \<ellipse cx="75" cy="75" rx="25" cy="5" />

<svg version="1.1"
     baseProfile="full"
     width="100" height="100"
     xmlns="http://www.w3.org/2000/svg">
     <ellipse cx="75" cy="75" rx="25" cy="5" />
</svg>

### 线
> \<line x1="10" x2="50" y1="110" y2="150"/>

### 多点连线
> \<polyline points="60 110, 65 120" />

### 多边形
> \<polygon points="50 160, 55 180, 70 180"/>

### 路径
> \<path d="M20,230,Q40,205,50,230,T90,230" fill="none" stroke="blue" stroke-width="5" />

其中路径是最基础的形状，可以用路径画出其他的所有形状。
