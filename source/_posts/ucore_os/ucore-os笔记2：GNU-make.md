---
title: ucore-os笔记2：GNU make
date: 2019-06-16 21:22:12
tags:
- 操作系统
- ucore

category:
- 操作系统
- ucore
---
c/c++程序基本都是使用GNU make来构建的，其基础是位于根目录的Makefiles文件。

GNU make有什么用呢？我们使用gcc编译器的时候，gcc -o target source，将源文件编译成目标文件，那么如果我们有很多的c/c++文件呢？使用gcc命令就不太合适了把。makefiles就是帮我们做这个事情的，它会管理我们要编译的内容，我们指定构建的依赖和构建目标，然后编写对应的构建脚本，完成之后只需要一个make命令，就可以完成构建。make会判断源文件是否被更新过，如果源文件被更新了，那么被更新的那部分会被重新编译。

## 概览
这一部分说明make的使用、makefiles的基本构成、规则、编译脚本、变量等等，先对整体有一个印象，然后我们在后面再深入一些细节。

### make的使用
如果我们在某一个目录下使用make命令，那么会自动区查找该目录下的makefiles或Makefils文件，并执行makefiles文件中的第一个规则（可以通过.MAKEFILE_GOAL变量来修改，后面会说明）。

### makefiles的基本构成
先看一个示例：
```makefiles
edit: test.c
  cc -o edit test.c
```
