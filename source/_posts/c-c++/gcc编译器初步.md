---
title: gcc编译器初步
date: 2019-06-11 22:16:59
tags: 
- 编程语言
- C语言
- GCC

category:
- 编程语言
- C语言
---

## gcc编译器入门
最近重新复习c/c++，操作系统等等计算机的基础知识，直接从gcc开始，这一篇文章记录gcc编译器命令行的基本使用。

## 使用gcc编译器编译第一个程序
编写一个HelloWord.c文件，于目录下运行：
> gcc HelloWorld.c -o HelloWorld.out

这将在当前目录下生成HelloWorld.out文件，运行./HelloWorld.out执行生成的可执行文件。

<i class="blog-notice">注意：在linux系统下，不以后缀区分可执行文件，和windows下不同。.out只是为了区分这是由gcc生成的文件</i>

## C语言的编译过程
如下图:
![编译过程](/img/compileprocess.jpg)

1. 预处理，生成.i文件
2. 将.i文件编译成汇编文件，生成.s文件
3. 汇编语言文件经过汇编，生成.o文件
4. 将多个.o文件链接起来生成可执行文件

接下来我们看每个步骤对应的编译选项和中间输出结果。
选项|作用
:---:|:---:
-E|预处理
-S|生成汇编文件
-c|生成.o文件
-o|指定输出的文件名
-g|生成调试信息

### 预处理—— -E选项
-E选项生成预处理的文件，预处理比如宏命令和包含文件的展开等等。参考[这里](http://c.biancheng.net/view/2375.html)，有一些其他的选项，比如如何指定其他的include目录。

我们对上面的HelloWorld.c，执行一下:
> gcc -E HelloWorld.c -o HelloWorld.i

下面截取了一些代码片段，可以看到将<span class="blog-mask">#include &lt;stdio.h&gt;</span>包含进来了，.i文件中已经包含了stdio中的代码。
```c
# 1 "HelloWorld.c"
# 1 "<built-in>"
# 1 "<command-line>"
# 31 "<command-line>"
# 1 "/usr/include/stdc-predef.h" 1 3 4
# 32 "<command-line>" 2
# 1 "HelloWorld.c"
# 1 "/usr/include/stdio.h" 1 3 4
# 27 "/usr/include/stdio.h" 3 4
# 1 "/usr/include/features.h" 1 3 4
# 375 "/usr/include/features.h" 3 4
# 1 "/usr/include/sys/cdefs.h" 1 3 4
...
```

### 生成汇编语言 -S选项
如果想把C语言变量的名称作为汇编语言语句中的注释，可以加上-fverbose-asm选项：

> gcc -S HelloWorld.i -o HelloWorld.s

HelloWorld.s
```
.file	"HelloWorld.c"
	.text
	.section	.rodata
.LC0:
	.string	"hello world!"
	.text
	.globl	main
	.type	main, @function
main:
.LFB0:
	.cfi_startproc
	pushq	%rbp
	.cfi_def_cfa_offset 16
	.cfi_offset 6, -16
	movq	%rsp, %rbp
...
```
### -c选项生成没有链接的文件
使用-c选项会为每一个.c文件生成一个.o文件，.o文件链接之后才会生成可执行文件。


### 编译链接多个文件&生成动态链接库