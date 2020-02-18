---
title: ucore-os笔记4：qemu和gdb调试
date: 2019-12-03 09:41:03
tags:
- 操作系统
- ucore

category:
- 操作系统
- ucore
---
本篇笔记我们学习qemu和gdb调试，这是调试操作系统内核代码必备的技能。

qemu是通用开源的硬件模拟器，可以模拟完整计算机系统，包括多种CPU架构（x86、x86_61、MIPS、ARM等）、系统总线（PCI、ISA桥等）、VGA显示、PS/2键鼠、PCI和ISA网络适配器、串行端口、USB。这里我们不详细讨论所有的相关知识，只学习我们目前使用到的这一部分。

gdb是gnu调试工具，可以调试编译后的程序。我们在编译操作系统时，要使用GCC的-g选项生成调试信息才能使用gdb调试。gdb提供了单步调试，指令单步调试，调用栈显示等等功能。

## qemu基础知识
通过qemu命令就可以启动qemu模拟器，通过qemu命令的参数可以指令模拟的硬件的参数，例如指定硬盘、串行端口、CPU核心数等等。一个基础示例如下：
```shell
qemu -S -s -parallel stdio -hda bin/ucore.img -serial null &
```
该命令会启动一个PC系统模拟器，并指定了其并行端口、串行端口、和硬盘镜像。模拟器会模拟一台计算机的启动过程，从硬盘镜像中加载BIOS和bootloader，然后将控制权交给bootloader。

部分命令行参数说明：
* -no-reboot：退出不重启
* -parallel stdio：将模拟器的并行端口重定向为stdio。stdio是unix系统下的标准输入输出，标准输入一般指键盘输入，标准输出和程序执行的进程相关，从shell启动的程序输出到控制台
* -hda bin/ucore.img：将bin/ucore.img作为磁盘0的硬盘镜像。模拟PC启动的时候会从该镜像加载bootloader和操作系统
* -serial null：将模拟器的串行端口重新向为null
* -monitor stdio：将显示器重定向到stdio
* -S：启动时不启动CPU，必须需要输入'c'才能让qemu继续工作
* -s：-gdb::1234的缩写，等待连接到端口1234。通过-s选项启动远程调试功能，gdb连接到1234端口就可以实现gdb调试qemu中执行的操作系统。

## gdb基础知识
gdb是gnu调试器，通过gdb可以调试gcc通过-g选项生成的可执行文件。

gdb的使用很简单，在命令行输入gdb即可进入gdb命令行。-q表示不输出copyright信息。
```shell
[bright@localhost ~]$ gdb -q
(gdb) 
```
在gdb命令行中输入help，可查看可使用的gdb命令：
```shell
(gdb) help
List of classes of commands:

aliases -- Aliases of other commands
breakpoints -- Making program stop at certain points
data -- Examining data
files -- Specifying and examining files
internals -- Maintenance commands
obscure -- Obscure features
running -- Running the program
stack -- Examining the stack
status -- Status inquiries
support -- Support facilities
tracepoints -- Tracing of program execution without stopping the program
user-defined -- User-defined commands

Type "help" followed by a class name for a list of commands in that class.
Type "help all" for the list of all commands.
Type "help" followed by command name for full documentation.
Type "apropos word" to search for commands related to "word".
Command name abbreviations are allowed if unambiguous.
(gdb) 
```
我们看到通过gdb可以设置断点、查看数据、指定文件、查看堆栈、调试源程序等等。当我们要使用某一个功能时，可以通过help来查看，例如我想看调试相关的命令，输入`help running`，就会有很多调试相关的命令。要锻炼自己看工具说明文档的能力，授人以鱼不如授人以渔。

下面是一些常用命令的总结：
* run：启动调试程序
* break breakpoint：打断点，breakpoint可以是地址或者符号名或者文件名加行号
* continue：执行到下一个断点
* next：执行下一条语句，调过函数。这个是C代码级的调试，调试汇编的使用需要使用nexti或者stepi。（例如调试bootloader的时候就要用nexti或者stepi）
* nexti：执行下一条指令
* step：执行下一条语句，进入函数。
* stepi
* file filename：加载filename文件中的调试信息。这一个指令在执行远程调试的时候必须有，因为远程调试不会加载调试的符号表，需要手动加载。
* target remote address：远程调试address，利用这个功能来调试qemu中的操作系统。

## qemu和gdb实现操作系统源码级调试
实现源码级调试我们要用到上面提供的两个功能，一个是开启qemu的远程调试端口，另一个是用gdb远程连接qemu的调试端口。

所以我们要做的是，在启动qemu的时候通过-s选项启动:1234端口，通过-S暂停执行（等待gdb连接后在继续执行）:
```shell
qemu -S -s -parallel stdio -hda bin/ucore.img -serial null &
```

然后在gdb中加载符号表、远程连接、设置断点等：
```
file bin/kernel
target remote :1234
break *0x7c00
continue
```

接下来我们在gdb中就可以输入调试命令来调试操作系统内核了。有下面两点要注意：
* 如果是调试bootloader，可以切换到8086调试实模式代码：`set arch i8086`
* 调试汇编代码要使用stepi或者nexti