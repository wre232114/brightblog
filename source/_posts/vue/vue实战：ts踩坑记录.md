---
title: vue实战：ts踩坑记录
date: 2019-09-06 07:37:48
tags:
- vue
- vue实战

category:
- vue
- vue实战
---

这篇文章记录了使用ts开发vue时遇到的一些问题和解决方案。内容包括如何使用ts开发vue，用到了哪些库以及在开发时遇到的一些问题。

## 踩坑记录

### @Component
@Component是vue-class-component提供的ts注解，在vue文件中必须使用@Component来将class声明成vue组件，不然成员方法中取到的this就是null。