---
title: ucore_os笔记1：GCC基础和linux命令
date: 2019-06-12 07:49:20
tags:
- 操作系统
- ucore

category:
- 操作系统
- ucore
---

## GCC的基本用法
参考这篇博客[gcc基础命令](/2019/06/11/c%7Cc++/gcc%E7%BC%96%E8%AF%91%E5%99%A8%E5%88%9D%E6%AD%A5/)

## GCC内联汇编
利用gcc提供的内联汇编的特性，我们可以在C语言程序中写汇编代码。gcc内联汇编有两种方式，一种是基本内联汇编语句，另一种是扩展内联汇编语句。

### 基本内联汇编语句
例子：
```c
// 基本内联汇编语句，这种方式直接将汇编代码，输出到生成的汇编文件中，可能会影响其他代码
  asm(".code32\n\t"
    "pushl %eax\n\t" // C语言中相邻的同类型字符串可以拼接
  "movl $0, %eax\n\t"
  "popl %eax");
```
在asm（或者__asm__，二者含义相同）中直接写汇编代码。

不同的汇编指令之间需要加换行符或者分号。

### 扩展内联汇编语句
例子：
```c
#define read_cr0() ({ \
  unsigned int __dummy; \
  __asm__( \
  "movl %%cr0,%0\n\t" \
  :"=r" (__dummy)); \
  __dummy; \
})
```
GCC扩展内联汇编的基本格式是：
```
__asm__ [__volatile__] (
  Assembler Template // 汇编模板
  : Output Operands // 输出操作数
  [ : Input Operands // 输入操作数
  [ : Clobbers ]
  ]
)
```
1. __volatile__含义是避免asm指令被删除、移动或者组合，如果不希望被gcc优化而改变位置，需要添加__volatile__关键词。还可以是inline，表示最小化asm代码
2. 接下来的是汇编模板，汇编模板就是添加了占位符的汇编语句，例如`movl %%ebp,%0`，%0,%1等表示的是汇编模板中的模板变量，通过模板变量可实现汇编语言和C语言的交互。可用的变量数取决于cpu中通用寄存器的个数。汇编变量映射先输出后输入，例%0、%1...是输出操作数部分的变量，后面才是输入操作数部分的变量。
3. 输出操作数部分规定变量如何与寄存器向结合，例如在上例中："=r"表示%0可以使用任何一个通用寄存器，并且__dummy存放在这个寄存器中，但是如果是：:"=m"(__dummy)，表示操作数存放在内存单元dummy中。
4. 输入部分和输出部分类似，但是没有“=”

gcc内联汇编的详细知识可以参考我的另一篇博客[gcc内联汇编](#)

## diff & patch
diff为linux命令，用于比较文本或文件夹差异；patch命令可以对文件或者文件夹应用修改。

例如是是实验中可能在proj_b中应用前一个实验proj_a中对文件进行的修改，可以使用如下的命令:
```bash
diff -r -u -P proj_a_original proj_a_mine > diff.patch
cd proj_b
patch -p1 -u < ../diff.patch
```
