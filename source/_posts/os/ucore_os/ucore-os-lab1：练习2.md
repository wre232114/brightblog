---
title: ucore-os实验1：lab1练习2
date: 2019-11-30 10:10:02
tags:
- 操作系统
- ucore

category:
- 操作系统
- ucore
---
练习1我们已经学习了make的基本语法，ucore-os是如何编译生成的。这个练习我们我们来学习ucore-os是如何启动的。包括内核如何被加载到内存中，内核加载后执行了哪些操作。重点详细学习启动过程中涉及到的硬件知识。部分汇编语言细节不深究，只了解操作系统宏观一些的概念和过程，以及各部分所起到的作用。汇编细节后续有时间再深入学习。

## 练习2：使用qemu执行并调试lab1中的软件
重点是熟悉qemu和gdb的调试，进行如下练习：
1. 从CPU加电后执行的第一条指令开始，单步跟踪BIOS的执行
2. 在初始化位置0x7c00设置实地址断点，测试断点正常
3. 从0x7c00开始跟踪代码运行，将单步跟踪反汇编得到的代码于bootasm.S和bootblock.asm进行比较
4. 自己找一个bootloader或内核中的代码位置，设置断点并进行测试

### 答案
答：先对实验过程进行分析和记录，最后给出练习体的到答案

### 启动qemu并于gdb联调
首先我们学习硬件模拟器的一些命令和调试方法。通过qemu的命令行参数，可以指定模拟硬件的参数，例如硬盘、显示器等等属性信息。下面首先分析一些命令行参数信息。

Makefile中有：
```shell
qemu-mon: $(UCOREIMG)
	$(V)$(QEMU)  -no-reboot -monitor stdio -hda $< -serial null
qemu: $(UCOREIMG)
	$(V)$(QEMU) -no-reboot -parallel stdio -hda $< -serial null
qemu-nox: $(UCOREIMG)
	$(V)$(QEMU)   -no-reboot -serial mon:stdio -hda $< -nographic
TERMINAL        :=gnome-terminal
debug: $(UCOREIMG)
	$(V)$(QEMU) -S -s -parallel stdio -hda $< -serial null &
	$(V)sleep 2
	$(V)$(TERMINAL) -e "gdb -q -tui -x tools/gdbinit"
debug-nox: $(UCOREIMG)
	$(V)$(QEMU) -S -s -serial mon:stdio -hda $< -nographic &
	$(V)sleep 2
	$(V)$(TERMINAL) -e "gdb -q -x tools/gdbinit"
```
选项分析如下：
* -no-reboot：退出不重启
* -parallel stdio：将模拟器的并行端口重定向为stdio
* -hda bin/ucore.img：将bin/ucore.img作为磁盘0的硬盘镜像
* -serial null：将模拟器的串行端口重新向为null
* -monitor stdio：将显示器重定向到stdio
* -S：启动时不启动CPU，必须需要输入'c'才能让qemu继续工作
* -s：-gdb::1234的缩写，等待连接到端口1234

相关命令分析如下：
* gnome-terminal -e command：启动一个新的gnome-terminal终端，-e command表示在该终端中将command字符串作为命令执行
* gdb：运行gnu调试器，可以调试C程序
  * -q：不打印copyright信息
  * -x file：从文件中执行gdb命令
* sleep 2：延迟两秒

gdbinit中的内容如下（通过命令行输入gdb进行gdb命令模式，然后输入help file等查看命令详情）：
```shell
file bin/kernel # 表示调试bin/kernel文件，会读取文件中的符号表。该文件要使用-g选项生成才包含调试使用的信息。
target remote :1234 # 连接到目标机器或者进程
break kern_init # 在函数或者行数打断点
continue # 继续执行
```

学习上面的命令行参数，我们得到两个问题的答案：
* 如何在qemu中启动我们生成的ucore.img镜像？使用-hda命令行参数，将ucore.img作为qemu的启动硬盘。启动后qemu模拟硬件会直接开始执行，通过-S参数可以暂停执行。
* 如何实现源码级调试？通过-s参数，开放qemu的1234端口，让gdb通过target remote命令来连接qemu开发的1234端口。连接以后就可以在gdb窗口中源码级远程调试qemu。
  
> 注意：远程调试必须在gdb中手动加载可执行文件，例如`file bin/kernel`。生成可执行文件的时候必须使用-g参数添加调试信息。调试bootloader时，只能使用逐指令调试（nexti）。调试内核时才能使用逐语句调试（next），推测可能bootloader是用汇编写的。


### 实验的预备知识
这里学习一下计算机开机以后经历的过程。包括BIOS启动、BOOTLOADER执行、操作系统启动等过程。


#### 保护模式和分段机制
bootloader执行的时候，还处于实模式运行状态，此时是16位的运行状态，只能访问1MB的内存（这些都是由硬件控制的，在硬件层面提供保护）。

实模式将内存分段，代码和数据位于不同的区域（和保护模式的分段不同）。每段最大$2^{16}$字节。通过段地址*16+偏移直接访问物理地址。且不区分操作系统内存和用户程序内存。程序指针能任意改变内存中的任意地址中的内容。

保护模式启用32位运行状态，能够访问4G的线性地址空间和物理地址空间。通过分段存储机制和分页管理机制提供保护。不同的段有不同的特权优先级（硬件层面进行），访问没有优先级的内存CPU将会触发异常。

> 保护模式下有两个段表，GDT和LDT。ucore中只用了GDT。GDTR和LDTR两个48位寄存器分别存储了GDT和LDT的起始地址。

GDTR，GDTR图：
```
47              16        0
|-----基址-------|-段表长度-|
```
LDT是GDT的下一级，如果段寄存器（cs、ds、ss、es、gs、fs等）中的GDT描述符的TL位是1，则说明存在LDT中，此时会先找GDT，GDT对应项的内容时LDT的索引，然后找LDT中的对应项。LDT中的段地址+偏移地址=线性地址。

如果TI=0，则直接从GDT中找。（硬件进行的）
> 逻辑地址、线性地址、物理地址：
>
> 逻辑地址由段地址和偏移地址组成，段地址存在段寄存器中，偏移地址存在EIP中。逻辑地址也叫虚拟地址，程序中使用的是虚拟地址（指针中的只是逻辑地址中的偏移，还要加上段地址才能得到线性地址。不同程序的段地址不同，这就是硬件提供的保护机制）；段地址和偏移地址的地址表示形式就是逻辑地址。段地址+偏移地址=线性地址。线性地址在页处理机制处理后，就得到了物理地址。如果不启动分页机制，线性地址就是物理地址。

GDTR存的是GDT的起始地址和长度。GDT表的表项是64位，其中包括段基地址32位，段界限20位，各种段属性。段寄存器中存的是选择子：
```
段选择子
15          3  2   0
|----索引---|TI|RPL|
```
* 索引：表示第几个描述符（0开始），在转成地址的时候要*8（因为一个描述符8个字节）
* TI：1则表示在LDT中，0表示在GDT中
* RPL：请求优先级，0最高3最低。ucore是使用了0和3。在段选择符被加载进寄存器时就会触发特权检查，只有当前代码段以及段选择符特权均小于等于GDT中描述符中的特权位时，才允许访问，否则CPU会出现保护异常。（硬件判断）