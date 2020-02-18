---
title: ucore-os-lab1：练习5、6、挑战练习
date: 2019-12-22 10:11:51
tags:
- 操作系统
- ucore

category:
- 操作系统
- ucore
---

## 练习5 函数堆栈调用

实验5需要实现函数调用堆栈，请参考ucore-os-lab的要求。

这里我们需要了解函数调用的堆栈变化原理才能完成该练习。函数调用的堆栈变化与两个寄存器相关，ESP和EBP：
* ESP是栈指针寄存器，存储了当前栈的位置
* EBP是基址指针寄存器，存储了当前函数的栈的起始位置

调用一个函数时，执行的压栈顺序如下：参数、返回地址、EBP寄存器。后面再压栈的时当前执行的函数的局部变量。
```
-------- 栈的高位地址
...
参数3
参数2
参数1
返回地址
上一层ebp  <- 当前ebp寄存器的值
局部变量
...
--------
```
> 函数调用的汇编代码其实就是多个push（参数push）和一个CALL，CALL自动将返回地址和ebp压栈，并更新ebp的值

了解了上述的基础知识以后，就可以进行练习的开发了。练习5需要输出ebp、返回地址和参数，并输出源代码的位置，如下例：
```
ebp:0x00007b28	eip:0x00100992	args:0x00010094	0x00010094	0x00007b58	0x00100096
				kern/debug/kdebug.c:305:	print_stackframe+22
ebp:0x00007b38	eip:0x00100c79	args:0x00000000	0x00000000	0x00000000	0x00007ba8
				kern/debug/kmonitor.c:125:	mon_backtrace+10
ebp:0x00007b58	eip:0x00100096	args:0x00000000	0x00007b80	0xffff0000	0x00007b84
				kern/init/init.c:48:	grade_backtrace2+33
ebp:0x00007b78	eip:0x001000bf	args:0x00000000	0xffff0000	0x00007ba4	0x00000029
				kern/init/init.c:53:	grade_backtrace1+38
ebp:0x00007b98	eip:0x001000dd	args:0x00000000	0x00100000	0xffff0000	0x0000001d
				kern/init/init.c:58:	grade_backtrace0+23
ebp:0x00007bb8	eip:0x00100102	args:0x0010353c	0x00103520	0x00001308	0x00000000
				kern/init/init.c:63:	grade_backtrace+34
ebp:0x00007be8	eip:0x00100059	args:0x00000000	0x00000000	0x00000000	0x00007c53
				kern/init/init.c:28:	kern_init+88
ebp:0x00007bf8	eip:0x00007d73	args:0xc031fcfa	0xc08ed88e	0x64e4d08e	0xfa7502a8
<unknow>:	--	0x00007d72	–
```

结合上面函数调用栈的规律，看下图：
```
-------- 栈的高位地址
    ...
 |->上上一层ebp的地址
 |  ...
 |  参数3
 |  参数2
 |  参数1           <- ebp+8
 |  返回地址         <- ebp+4，该函数调用的参数、返回地址、ebp都是4个字节
 |---上一层ebp的地址  <- 当前ebp寄存器的值是栈中的地址
    局部变量
    ...
--------
```
栈中的ebp就像一个链表，通过ebp的链接关系，我们就可以得到栈调用关系。看代码：
```c
void
print_stackframe(void) {
     /* LAB1 YOUR CODE : STEP 1 */
     /* (1) call read_ebp() to get the value of ebp. the type is (uint32_t);
      * (2) call read_eip() to get the value of eip. the type is (uint32_t);
      * (3) from 0 .. STACKFRAME_DEPTH
      *    (3.1) printf value of ebp, eip
      *    (3.2) (uint32_t)calling arguments [0..4] = the contents in address (uint32_t)ebp +2 [0..4]
      *    (3.3) cprintf("\n");
      *    (3.4) call print_debuginfo(eip-1) to print the C calling function name and line number, etc.
      *    (3.5) popup a calling stackframe
      *           NOTICE: the calling funciton's return addr eip  = ss:[ebp+4]
      *                   the calling funciton's ebp = ss:[ebp]
      */
    uint32_t ebp = read_ebp(), eip = read_eip();
    
    int j = 0;
    while(ebp && j < STACKFRAME_DEPTH) {
        cprintf("ebp:0x%08x eip:0x%08x args:",ebp, eip);
        uintptr_t ptr = ebp+8;

        for(int i = 0;i < 4;i++) {
            cprintf(" 0x%08x", *((uint32_t*)ptr+i));
        }
        cprintf("\n");
        print_debuginfo(eip-1);
        
        // 这里取的是栈中的ebp和返回地址，所以必须先取eip
        // 没有重复的原因是，read_eip中取到的eip，调用read_eip函数压了一次栈
        eip = *((uint32_t*)ebp+1);
        // ebp是一个整数，但是表示一个地址，(uint32_t*)ebp会将ebp的值作为地址解释
        // *(uint32_t*)ebp，取地址中的内容，是上一个ebp的地址
        ebp = *(uint32_t*)ebp;
    }
}
```
read_ebp和read_eip其实就是两个内联汇编函数，加载ebp和[ebp+4]（返回地址）到C变量中。因为ebp存的是地址，而eip的地址相对于ebp的值，所以必须先取eip的值，再变ebp的值。`print_debuginfo()`是一个ucore-os已经提供的函数，传入地址，得到文件名和行数，实现原理是将编译器的符号表信息通过链接器加载到内核的内存中，通过查找符号表就知道对应哪一个符号、哪一个文件、哪一行。

eip实际上是返回地址，返回地址是函数调用的下一条指令的地址，所以这里参数传的是eip-1，就能定位到函数调用的指令中。

## 练习6 完善中断初始化和处理
练习6要完成下面几个目标：
1. 了解中断向量表的结构，一个表项几个字节？如何寻址中断向量表？
2. 完善kern/trap/trap.c中的idt_init
3. 完善trap函数，处理时钟中断，每100次时钟中断输出一个100tick

这一部分需要了解中断的相关知识和ucore-os对中断的实现的知识才能顺利完成，请参考[ucore-os笔记6：中断和异常](#ucore-os对中断向量表的处理)。

ucore-os提供了SETGATE宏函数，传入参数，扩展成一个门表项（可以是任务门、中断门、陷阱门、调用门，反正结构都一样），可以在代码中利用该宏。vector.S中定义了`__vectors.S`符号，其值是中断向量处理程序入口数组的起始地址。由于是全局符号，链接后能够直接在C中访问。

idt_init函数中要做的事情就是构造idt表项，并将idt的起始地址加载到IDTR中。要注意不同中断的权限不一样，例如T_SYSTEM可以在用户态（特权级为3调用），而其他的只能在特权级为0调用。还要注意向量的起始地址在`__vectors`中。看代码，注意注释中的细节：
```c
// 将__vectors[]声明为外部变量，__vectors[]在汇编文件中定义，链接后通过extern可以访问外部文件中的符号
// 这里只能将__vectors声明为数组，而不能声明为指针。如果是指针会访问到数组的第一个元素，
// 因为将vectors当作指针的地址了，指针的值就是数组的第一项了。虽然数组和指针可以相互转化，
// 但是将一个地址作为指针的地址还是作为数组的地址是不一样的
extern uintptr_t __vectors[256];

// 初始化中断向量表idt，处理程序的入口在__vectors[]中，__vectors[]的每一项是一个地址
// T_SYSCALL是trap，并且DPL是用户级3。其他的中断都是interrupt，DPL为0
for(int i = 0;i < 256;i++) {
  // cprintf("interrupt entry:0x%08x\n", __vectors[i]);
  if(i == T_SYSCALL) {
      // KERNEL_CS是内核代码段的起始地址
      SETGATE(idt[i],1,KERNEL_CS,__vectors[i],3);
  } else {
      SETGATE(idt[i],0,KERNEL_CS,__vectors[i],0);
  }
}
lidt(&idt_pd);
```

### 处理时钟中断
当中断发生时，调用链是`__vectors`中的入口地址->`__alltraps`->trap->trap_dispatch->根据中断向量号处理。

所以我们找到trap_dispatch中的时钟中断：
```c
/* trap_dispatch - dispatch based on what type of trap occurred */
static void
trap_dispatch(struct trapframe *tf) {
    char c;

    switch (tf->tf_trapno) {
    case IRQ_OFFSET + IRQ_TIMER:
        /* LAB1 YOUR CODE : STEP 3 */
        /* handle the timer interrupt */
        /* (1) After a timer interrupt, you should record this event using a global variable (increase it), such as ticks in kern/driver/clock.c
         * (2) Every TICK_NUM cycle, you can print some info using a funciton, such as print_ticks().
         * (3) Too Simple? Yes, I think so!
         */
        ticks++;
        if(ticks == 100) {
            print_ticks();
            ticks = 0;
        }
        break;
        // ...
    }
}
```
使用IRQ_OFFSET=32是因为中断向量的前32个被CPU保留了，像时钟中断等硬件中断都由系统设计者决定应该使用哪个中断，ucore-os设计将IRQ_TIMER作为自定义的第一个中断，值为0，所以IRQ_OFFSET+IRQ_TIMER=32，是第一个自定义的中断向量。

> 这里各种中断与中断控制器有关，中断控制器的设置在操作系统初始化的时候进行，请看[ucore-os的初始化过程](#)和[IO和基本硬件访问](#)。IO和计算机接口技术和计算机组成原理的知识息息相关，[ucore-os中用到的组成原理和计算机接口知识间接](#)给出大致的了解。

### 挑战练习1 添加syscall
添加一个用户态函数，当内核初始完毕从内核态切换到用户态，在用户态通过syscall获取内核中的tick值，然后再从内核态切换到用户态。调用结构如图：
```c
static	void
switch_test(void)	{
   print_cur_status();										//	print	当前	cs/ss/ds	等寄存器状态
   cprintf("+++	switch	to		user		mode	+++\n");
   switch_to_user();												//	switch	to	user	mode
   print_cur_status();
   cprintf("+++	switch	to	kernel	mode	+++\n");
   switch_to_kernel();									//	switch	to	kernel	mode
   print_cur_status();
}
```
切换函数通过中断的方式实现，再trap里面完成T_SWITCH_TO*中断。完成后执行make grade能看到分数。

#### 答：
这里我们需要弄清楚两部分的知识，一个是如何完成用户态到内核态的切换，另一个是添加一个系统调用获取tick。

添加系统的调用非常简单。就是在中断初始化时，将中断向量表的T_SYSCALL设为用户态（DPL=3，这样能够由用户态触发该中断），然后在trap_dispatch中添加T_SYSCALL的处理代码。

内核和用户态的切换通过中断调用进行，将用户到内核的中断设置成用户可访问，用户就能够通过中断切换到内核态，从中断返回时，会从栈中恢复cs、ds等等寄存器，用户态和内核态的区分实际上就是cs中的DPL的区分。只需要在中断处理程序中设置cs、ds等寄存器的值，即可实现用户态和内核态的切换。

这里需要注意，从中断返回时，如果发生了特权级的切换，会多弹出ss和esp，一定要处理这一点。例如在switch_to_user中，从内核态返回用户态，会多弹出SS和ESP，但是进入中断的时候没有发生特权级切换，所以不会压入ss和esp，这里需要手动压入（或者使用`subl $8, %%esp`预留位置，然后int后接`movl %%ebp, %%esp`恢复esp，个人不推荐这种方式，如果栈中有局部变量，这样就会出问题）。switch_to_kernel中，因为产生中断的时候是从用户态到内核态，会压入ss和esp；但是返回的时候是从内核态到内核态，所以不会弹出ss和esp，需要手动弹出。看代码：
```c
static void
lab1_switch_to_user(void) {
    //LAB1 CHALLENGE 1 : TODO
    // esp压栈两个字节，为esp和ss留出空间
    // 因为从切换到用户态，执行iret时，会从内核栈中弹出esp和ss，我们在trap.c的trap函数中，改变栈中的ss，就可以切换到用户堆栈
    // 但是最开始时内核态到内核态，cpu不会压栈esp和ss，所以需要手动压栈
    // 
    // 从中断返回的时候是从内核态返回到用户态，发生了特权级的切换，所以会弹出esp和ss
    // 但是产生中断的时候cpu不会自动压入，所以要手动压入
    asm volatile (
        "movl %%esp, %%eax;"
        "pushl %%ss;"
        "pushl %%eax;"
        "int %0;"
        // "movl %%ebp,%%esp;"
        :
        :"i"(T_SWITCH_TOU)
        :"%eax");
        // print_stackframe();
}

static void
lab1_switch_to_kernel(void) {
    //LAB1 CHALLENGE 1 :  TODO
    // 注意触发中断的时候压入了ss和esp，但是返回的时候并不会弹出，因为返回的时候没有发生特权级的切换
    // 但是这里不能直接将esp+8，因为从用户到内核态的中断使用的内核栈是一个临时栈
    // 正确的方式取出ss和esp，然后恢复到ss和esp寄存器中，也不能直接pop，因为pop会改变esp...
    asm volatile (
        "int %0;"
        "movl %%esp, %%eax;"
        "movw 4(%%eax),%%ss;"
        "movl (%%eax),%%esp;"
        :
        :"i"(T_SWITCH_TOK)
        :"%eax");
}
```

> lab1虽然启动的分段机制，但是在物理地址上并没有区分内核段和用户段，也没有区分数据段和代码段，GDT中所有段的基址都是0，limit都是4G，所以这里不需要考虑切换cs后物理寻址的问题。相同的偏移，分段处理后在lab1中会得到相同的物理地址。

### 挑战练习2 键盘实现用户模式到内核模式的切换
使用键盘完成用户模式到内核模式的切换。

#### 答：
上一个实验已经完成了用户模式到内核模式的切换，这里只需要复用上一次实验的代码就可以了。