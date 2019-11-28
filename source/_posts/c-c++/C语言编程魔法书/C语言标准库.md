---
title: C语言标准库
date: 2019-11-18 09:53:33
tags:
- 编程语言
- C语言
- 《C语言编程魔法书》

category:
- 编程语言
- C语言
---
这篇文章学习C语言标准库，包括基本数据类型对应的标准库例如stdbool以及数据结构算法、线程进程、网络等等的库。综合对这些库的介绍和使用示例。

## stddef.h
定义了以下常用的宏：
* offsetof：获取结构体成员的偏移位置（字节计数）

## stdalign.h
定义了对齐常用的宏：
* alignof：_Alignof的别名，获取对象的对齐字节数，必须有括号
* alignas：_Alignas的别名，设置对象的对齐字节数，可以放在类型的前面或者后面，可以重复声明多个alignas，取最大字节数

## stdbool.h
定义了布尔值相关的宏：
* bool：_Bool的别名，是一个类型，布尔类型，值为0或1，大小占1个字节
* true：宏，值为1
* false：宏，值为0

## stdint.h
int在不同的平台下的长度可能不一样，使用stdint可获取一样长度的整数，缺点是可能会影响性能。

定义了标准长度整数相关的宏：
* int8_t
* int16_t
* int32_t
* int64_t
* uintptr_t
* intptr_t

## wchar.h
定义了宽字符wchar_t等

## uchar.h
定义了char16_t，char32_t等，表示c11新增的编码类型。


## stdlib.h
定义了malloc等
* malloc
* abort
* exit

## stdarg.h
函数不定参数获取宏等

## stdnoreturn.h
定义了noreturn，_Noreturn的别名