---
title: ucore-os笔记9：TSS以及机制和策略的关系
date: 2020-01-05 20:13:08
tags:
- 操作系统
- ucore

category:
- 操作系统
- ucore
---
这篇文章主要介绍硬件提供的机制与操作系统设计的策略的联系，解决类似80386提供了LDT，ucore-os为什么没有使用呢？为什么不用TSS实现多进程呢？这类问题。同时也简要介绍的TSS相关的cpu硬件知识，因为ucore-os中使用了一小部分TSS的能力。

第一部分是个人的一些思考，关于机制和策略的思考，如果只想看TSS相关的知识，直接跳到第二部分。下面进入正体：

## 机制和策略的关系
为了对CPU的使用进行抽象，操作系统进行了进程的设计，intel 80386其实在硬件层面提供了进程抽象的支持，但是ucore-os并没有使用80386处理器提供的任务切换机制进行进程的设计。TSS机制是硬件多任务机制，ucore使用的软件多任务机制。原因可能如下：
* 与硬件强相关，假如换成其他CPU架构，那进程模块的绝大部分功能都需要重写
* 有较大的限制，只能使用CPU指定的方式进行进程切换，切换使用指定的格式，不够灵活

除了多进程设计之外，还有内存管理抽象机制。我们知道每一个进程都有独立的地址空间，80386也提供了LDT来进行进程地址空间的抽象，为每一个进程分配一个LDT即可实现线性地址的抽象。但是ucore-os没有使用LDT，使用的是页表来实现进程地址的抽象。

原因其实很简单，CPU只是提供了一种机制，我们只是在CPU的机制上进行操作系统的设计，用不用CPU的功能我们说了算，只要能够利用硬件能力满足我们系统设计的需求，就没有问题。所以我们看到80386的很多机制在ucore-os中都没有使用，随着系统的扩大需求增多，我们可能需要更多的CPU能力来满足系统设计的需要。

机制和策略是操作系统原理中常常强调的东西，机制是已有的能力或者框架，策略是在一定机制下进行的设计。可以参考分页机制，提供了一种分页的能力，怎么利用分页的能力来进行地址抽象的设计就是策略。

## TSS及相关的多任务硬件机制
intel 80386在硬件层面提供了多任务的支持，与下列硬件相关：
* Task state segment（TSS）：内存中的一段区域，用于描述一个task相关的
* Task state segment descriptor：TSS描述符，放在GDT中，其中存了TSS的线性基址和DPL等信息
* Task register（TR）：TSS描述符寄存器，存放当前运行的程序的TSS的选择符
* Task gate descriptor：


### TSS
> 参考资料：[80386 MultiTask](https://css.csail.mit.edu/6.858/2014/readings/i386/c07.htm)

CPU管理一个task的信息存在一个TSS中，TSS可以被放在内存的任意区域中，通过TR找到TSS描述符，通过TSS描述符找到TSS。

TSS的内容是大部分的寄存器（通用寄存器、段寄存器、EFLAGS、EIP）、上一个任务的TSS选择符、LDT、cr3、指向0-2优先级的esp（esp0、esp1、esp2）和IO map基址。

TSS图：
![tss](/img/TSS.gif)

### TSS descriptot
TSS描述符只能放在GDT中，描述一个TSS的起始地址、大小、权限等信息，通过TR能从GDT中找到tss描述符、通过tss描述符可以找到TSS。

一个tss就对应着一个task（操作系统中称为进程），能访问TSS的程序就能导致任务切换。TSS不能读取和修改，要修改TSS只能通过TSS所在内存在进程的数据段的进程中修改。将TSS描述符加载到段寄存器中会导致一个错误。

![tssd](/img/tssdescriptor.gif)

### TR和Task Gate descriptor
task register是cpu的一个16位寄存器，和其他段寄存器类似，表示权限以及tss descriptor在GDT中的偏移。

通过ltr和str指令可以修改和存储tr的值。ltr是一条受限的指令，只能在CPU=0下执行。str则没有限制。通常在系统初始化时设置一个TR的初始值，之后TR的值通过任务切换改变。

Task Gate Descriptor（TGD）提供了一种不直接的方式访问TSS，TGD中存了TSS的选择符。TGD可以放在LDT或者IDT中。

### 任务切换
那怎么进行任务切换呢？80386提供了几种机制进行进程切换：
* 使用jmp或者call来引用一个TSS descriptor或者Task gate
* 中断向量指向IDT中的Task gate
* NT设置时使用IRET返回。NT用来处理嵌套的Iterrupt Task。ucore-os没有使用这一部分功能。

任务切换时进行的步骤如下：
* 检查权限和TSS描述符的合法性
* TR存的是当前程序的TSS选择符，从TR保存当前的寄存器、页表、LDTR等到TSS中
* 将新任务的选择符加载到TR中
* 将寄存器的值从新任务的TSS中恢复，新任务恢复到上一次保存的CS：EIP处执行

## ucore-os中的TSS
TSS一般用于硬件的多任务切换。ucore-os使用的是软件多任务处理，但是也需要TSS的支持。ucore-os总共只使用了一个TSS，用于中断、系统调用等的堆栈切换。

中断时，如果发生了特权级的切换（从用户态到内核态），就会使用TSS中的SS0和ESP0，并将原来的SS和ESP压栈。TSS中除SS0和ESP0的其他内容在ucore-os中没有作用。

在多进程设计时，每个进程运行时都可能发生中断，所以要为每个进行分配独立的中断栈。进程切换时通过设置tss.esp0来实现独立的中断堆栈。