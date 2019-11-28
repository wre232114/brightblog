---
title: GCC常用选项
date: 2019-11-23 15:28:06
tags:
- 编程语言
- C语言
- GCC

category:
- 编程语言
- C语言
---
这篇文章学习GCC中的常用选项。

## -I dir
将dir目录添加到预处理过程中搜索include头文件的目录中。通过-isyatem和-idirafter可以指定`include <file>`和`include "file"`的搜索路径。

## -M
输出一个适用于make的规则，而不是输出预处理的结果。该规则描述了主要源文件的依赖关系。

## -MM
和-M类似，但是不mention在系统头文件目录中找到的头文件。不能是直接还是间接的都不会从这样的头中包含。

## -MT
改变被依赖生成发射的rule的target。-MT选项将target设置成你指定的字符串。