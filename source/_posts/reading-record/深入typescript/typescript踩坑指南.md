---
title: typescript踩坑指南
date: 2019-10-13 19:29:45
tags:
- typescript
- 踩坑指南

category:
- typescript
- 踩坑指南
---

## typescript中继承的属性和方法
只有public或者protected的方法可以通过super来访问，不能使用super来访问父类中的属性；