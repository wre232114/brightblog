---
title: ucore-os笔记8：汇编指令总结
date: 2019-12-26 10:40:10
tags:
- 操作系统
- ucore

category:
- 操作系统
- ucore
---
这篇文章总结了ucore-os中使用的汇编语言伪指令，便于更好的理解ucore-os的源码。

## 汇编程序中的伪指令
汇编程序中伪指令以 “.”开头，例如.section，.globl等。下面是linux内核源码中常见的集中常见指令：

### .ascii
  语法： .ascii “string”...
  .ascii表示另个或多个（用逗号隔开）字符串，并把每个字符串（结尾不自动加'\0'字符）中的字符放在连续的地址单元。另一个与.ascii类型的是.asciz，z代表'\0'，即每个字符串结尾自动加一个'\0'字符
### .fill
语法：.fill repeat,size,value
其中，repeat，size和value都是常量表达式。.fill和含义是反复拷贝size个字节，重复repeat次。repeat可以大于或者等于0。size也可以大于或者等于0，但不能超过8，超过8也只取8。size个字节的内容讲被填充为value的值，如果size的大小大于value的储存所需要的容量，则将高位用0来填充，例如，如果value的大小位4个字节，size为8，那么高4位的内容被填充为0，低4位内容置为value。
size和value为可选项。如果第二个逗号和value值不存在，则假定value为0.如果第一个逗号和size不存在，则假定size为1.
### .globl
语法：.globl symbol
.globl使得链接程序(ld)能够看到symbol。如果你的局部程序中定义了symbol，那么，与这个局部程序连接的其他局部程序也能存取symbol，例如：
某个.S 文件的源程序中某一段为如下
```s
.data
.globl number
.set number 10
```
而与该文件属于同一个文件夹的另一.S 文件的某一段代码为
```s
.text
movl $number %eax
```
在前一个文件中定义的.globl变量number在后一个文件中可以被引用。
## .rept .endr
语法：.rept count
		…...
		.endr
把rept与.endr之间的行重复count次，例如：
.rept 3
.long 0
.endr
相当于：
.long 0
.long 0
.long 0
在这里， .rept 指令比较容易和.fill 指令混淆，它们的区别是.rept 是将.rept 与.endr 之间的指令重复 3 次，而.fill 则是单纯的重复填充数据。
### .space
语法：.space size,fill
这个指令保留size个字节的空间，每个字节的值位fill。size和fill都是常量表达式。如果逗号和fill被省略，则假定fill为0.
### .byte
语法：.byre expressions
预留一个字节，并将这个字节的内容赋值为expression，如果是用逗号隔开的多个expression，则为预留多个这样的字节，并将他们的内容依次赋值。
### .word
语法：.word expressions
预留两个字节，并将这两个字节的内容赋值为expression，如果是用逗号隔开的多个expression，则为预留多个这样的2个字节，并将他们的内容依次赋值。
### .long
语法：.long expressions
预留4个字节，并将这4个字节的内容赋值为expression，如果是用逗号隔开的多个expression，则为预留多个这样的4个字节，并将他们的内容依次赋值。
### .set
设定常数，就好像C程序中的#define作用一样，例如：.set mark, 0x10，这样在接下来的程序中就可以用诸如movl $mark, eam这样的指令来引用mark。
cli指令、sti指令
cli将IF置0，屏蔽掉“可屏蔽中断”，当可屏蔽中断到来时CPU不响应，继续执行原指令。
而sti相反，sti将IF置1，允许“可屏蔽中断”，中断到来转而处理中断。
cld指令、std指令
清除方向标志，在字符串的比较、赋值、读取等一系列和rep连用的操作中，di或si是可以自动递减的，而不需要人来加减它的值，cld即告诉程序si、di向前移动。
同样，std指令告诉程序si、di向后移动。

### `#include <文件>`
导入另一个汇编文件，不同汇编器指令不同，例如MASM下是include 文件。
在这次内核实验中导入的指令是#include<inc/mmu.h>
inb、outb、inw、outw
CPU和IO端口进行通讯的指令。b表示一个字节，w表示一个字。例如：inb     $0x64,%al，outb    %al,$0x64
### test指令
语法：test %eax, %ebx
test属于逻辑运算指令。功能：执行BIT与BIT之间的逻辑运算，将两个操作数做与运算，仅修改标志位，不回送结果。接下来可以根据标志位进行条件跳转，如jz、jnz等。
.code16 .code32
这两个指令告诉汇编器接下来的指令是按照16位处理还是32位处理。例如，如果设置成.code32那么接下来的地址处理等都会按照32位进行。

### ljmp指令
语法：ljmp 段选择子，段内偏移
ljmp是linux下AT&T格式的汇编指令。表示长跳转。

### leave指令
语法： leave
在16位汇编下相当于:
mov bp,sp
pop bp
在32位汇编下相当于:
mov ebp,esp
pop ebp

### ret指令
pop eip，从栈中弹出返回地址并赋值给eip。