---
title: ucore-os笔记4：bios和bootloader的启动过程
date: 2019-12-03 11:20:50
tags:
- 操作系统
- ucore

category:
- 操作系统
- ucore
---
这篇笔记学习BIOS和bootloader的执行过程，将详细分析机器加电后执行的第一条指令到操作系统的第一行代码中间经历的过程。

## BOIS的启动过程
计算机开机后并不是直接启动操作系统，而是先要执行一小部分初始化软件。在80386体系结构下由BIOS和BOOTLOADER组成。BOIS是存储在主板上ROM中的一个小程序，承担了最基础的输入输出功能（电脑没装系统时，我们也可以进入BOIS，BOIS中可以看到计算机的硬件信息，设置启动盘等等，其包括了对硬件最最基本的访问能力）。

计算机加电后，将BIOS加载内存中开始执行。会从一条特定的地址开始执行，该指令调转到BIOS程序的起始地址执行。BIOS会检测硬件并进行初始化，然后会选择一个启动设备。然后将该设备的第一个扇区（512字节）加载到内存的特定地址（0x7c00）。然后将控制权转交给0x7c00地址处的程序开始执行。

简单来说，当我们按下电脑的开机键后，CPU会进行如下的处理：
1. BIOS被加载到内存中
2. CPU的第一条指令是调转到BIOS程序的第一条指令（1、2步都是硬件预先设计好的）
3. 开始执行BIOS，BIOS会初始化显示器、检测计算机总线上连接的所有硬件；一切正常后将启动盘的第一个扇区（512个字节）加载到内存的0x7c00处，然后调转到0x7c00执行。所以我们的bootloader会放在磁盘的第一个扇区，大小小于512字节，BIOS执行完了就会执行bootloader的指令。
4. bootloader执行，切换执行模式，加载操作系统内核，将控制权交给操作系统。
5. 操作系统初始化

> BIOS初始化是硬件自动的。启动的时候，硬件会将BIOS映射到高位内存地址中，以保证向下兼容8086的启动模式。

## bootloader的启动过程
BIOS读取硬件扇区到0x7c00的内存中，并调转到0x7c00执行。所以bootloader被放在0x7c00的位置开始执行。（**所以在makefile中链接bootblock的时候，将代码段地址设置成0x7c00。目前不懂这里链接指定的地址有什么用？后面学会了回来该**）

bootloader的主要工作是：
* 切换到保护模式，启用分段机制
* 读取ELF执行文件格式ucore操作系统到内存中
* 显示字符串信息
* 把控制权交给ucore操作系统

接下来我们详细分析下面两个部分：
* 如何切换到保护模式？（如果不了解什么是保护模式，请先阅读[实模式与保护模式](#)）
* 如何读取ELF执行文件格式？（如果不了解elf文件格式，请先阅读[elf文件结构](#)）

### 如何从实模式切换到保护模式
从实模式切换到保护模式要经历两个步骤：
1. 开启a20 gate
2. 启用80386的分段机制实现保护

下面分别说明这两个部分：
1. 开启a20 gate
8086处理器是16位的，只能以实模式运行，最大只能访问1MB内存。但是通过segment:offset的形式，可以得到高于1MB的地址。在这种情况下，8086会将高于1MB的地址“回卷”（只取前20位，溢出的部分舍弃），变成低于1MB的地址。一些8086的软件用到了这样的特性。在80386中，最大内存是4GB，超过1MB就不会“回卷”了，这样就不向下兼容了。所以有了A20 gate（A0-A19是20根地址线），A20 gate默认是不启用的，这样实模式下就只能访问1MB的内存，**保证向下兼容**。

**因为a20 gate只是控制第21根地址的开启和关闭**。在80386下（大于1MB的内存），如果开启了a20 gate：
* 实模式下就可以访问`ffff0+0ffff=10ffef=1088KB`的内存，超出的64KB也能访问；
* 保护模式下能够访问完整的4G内存

如果没有开启a20 gate：
* 实模式下只能访问1MB的内存
* 保护模式下，**a20始终位0**，那么只能访问奇数兆的内存0-1M，2-3M...


计算机开机以后是以实模式运行，我们的操作系统是面向32位CPU设计的，所以在bootloader中要启用全部的32根地址线。从实模式切换到保护模式的第一步就是开启a20 gate。

a20 gate的开启和关闭使用**通过键盘控制器8042来控制**的（需要通过一种方式来控制a20的开启和关闭，工程师们为了**节省硬件设计成本**将其集成到了键盘控制器中，a20 gate和键盘没有关系），所以我们需要通过io指令向键盘控制器8042发出控制命令，启用a20。bootasm.S中相关代码如下：
```s
seta20.1:
    inb $0x64, %al                                  # Wait for not busy(8042 input buffer empty).
    testb $0x2, %al
    jnz seta20.1

    movb $0xd1, %al                                 # 0xd1 -> port 0x64
    outb %al, $0x64                                 # 0xd1 means: write data to 8042's P2 port

seta20.2:
    inb $0x64, %al                                  # Wait for not busy(8042 input buffer empty).
    testb $0x2, %al
    jnz seta20.2

    movb $0xdf, %al                                 # 0xdf -> port 0x60
    outb %al, $0x60 
```
![8042键盘控制器](/img/8042键盘控制器.png)
8042对外暴露了两个端口：0x60和0x64，下面是对8042的简单介绍：
* 键盘控制器的端口是0x60-0x6f，但是只使用了0x60和0x64两个端口。通过这两个端口给键盘控制器发送命令或者读取状态
* 8042有两个寄存器，一个是状态寄存器，保存了控制器当前的状态信息（键盘使用启用，buffer中是否有数据等），另一个是控制寄存器。状态寄存器各位信息如下：
    | bit  | meaning  |
    |---|---|
    |0 |output	register	(60h)	中有数据|
    |1 |input	register	(60h/64h)	有数据|
    |2 |系统标志(上电复位后被置为0)|
    |3 |data	in	input	register	is	command	(1)	or	data	(0)|
    |4 |1=keyboard	enabled,	0=keyboard	disabled	(via	switch)|
    |5 |1=transmit	timeout	(data	transmit	not	complete|)
    |6 |1=receive	timeout	(data	transmit	not	complete)|
    |7 |1=even	parity	rec'd,	0=odd	parity	rec'd	(should	be	odd)|

* 0x64端口用于写入命令，读取状态信息。0x60用于写入和读取数据。在0x64端口状态信息；写0x64端口写入命令。
* 8042有两个内部端口（上图中有），这两个内部端口在内部电路中使用，程序员不可见，但是通过向0x64端口写入特定的命令可以改变这两个端口的数据。我们本次要改的a20控制就在内部输出端口的p21，这个信号控制a20的开启和关闭。

设置键盘控制器的步骤是：
1. 等待8042的输入缓存为空。等待上一条IO命令结束，结束后会清空标识寄存器。因为CPU的速度远快于IO设备的速度，所以一定要加这个判断。
2. 向0x64写入设置内部输出端口的命令
3. 等待输入缓存为空
4. 向0x60写入要设置的值

在代码中，`inb $0x64,%al`和`testb 0x2,%al`用于判断键盘控制器的输入缓存是否为空。0x2=00000010，对照上面状态寄存器的第二位，1表示input register中有数据，当有数据时，重复，直到没有数据为止。

然后向0x64写入命令0xd1，表示写内部输出端口，然后写入0xdf(11011111)，将p21置高电平，其他的位可以不管，是键盘控制器细节相关的，我们这里只了解一下就可以了。

> 计算机接口技术课程的相关知识：一个IO设备控制器一般会占用多个端口，分别是状态端口、数据端口、控制端口，一般都是通过控制端口输入控制字，控制字可以设置要对IO控制器进行的操作，如读取IO设备状态、向设备写入数据等等；控制寄存器用于写入IO设备控制器的操作命令，通过改变控制寄存器的相关位，就可以改变控制器的工作模式，例如从写数据切换到读数据。通过地址总线或者IO总线来寻址到特定设备端口，通过数据总线向控制器端口写入或者读取数据，通过控制总线发出一些特定的控制信号。一般来说IO操作的步骤是：
> 
> 1.向IO设备控制器的控制端口写入控制字
> 2.根据控制字的设置向数据端口写入或者从数据端口读取数据
> 
> Intel 80386相关知识：通过out指令寻址的IO设备使用的是IO地址空间，该地址空间和内存地址空间独立。

2. 开启分段机制进入保护模式
> 这里需要了解保护模式的知识（请学习[GDT与保护模式](#)）

先看bootasm.S中的相关代码：
```s
    lgdt gdtdesc
    movl %cr0, %eax
    orl $CR0_PE_ON, %eax
    movl %eax, %cr0

    # Jump to next instruction, but in 32-bit code segment.
    # Switches processor into 32-bit mode.
    ljmp $PROT_MODE_CSEG, $protcseg

.code32                                             # Assemble for 32-bit mode
protcseg:
    # Set up the protected-mode data segment registers
    movw $PROT_MODE_DSEG, %ax                       # Our data segment selector
    movw %ax, %ds                                   # -> DS: Data Segment
    movw %ax, %es                                   # -> ES: Extra Segment
    movw %ax, %fs                                   # -> FS
    movw %ax, %gs                                   # -> GS
    movw %ax, %ss                                   # -> SS: Stack Segment
```
80386及之后的CPU提供了保护模式，主要通过GDTR寄存器和GDT（全局描述符表）来实现。GDTR中存了GDT的入口地址。第一步我们将GDT的地址加载到GDTR寄存器中，使用`lgdt gdtdesc`从内存中加载GDT的大小和地址到GDTR寄存器中。注意这个时候cr0寄存器中的PE位没有打开，所以CPU还没有启用分段机制，所以此时的内存访问就不涉及到分段的问题。

接下来设置cr0中的PE位，开启了CPU的保护模式。这时候就要设置段寄存器的值了，因为接下来的内存访问就会从GDT中取找对应的段了。所以接下来通过ljmp设置CS寄存器的值，因为CS寄存器的值只能通过调转指令间接设置。然后通过mov指令设置其他段寄存器的值。这样我们就开启了CPU的保护模式。


### 如何加载操作系统
前面提到了操作系统的加载由bootloader来实现，bootloader是放在硬盘第一个扇区、大小小于512字节的一段程序，bootloader主要做了两部分的工作，一个是`从实模式切换到保护模式`，另一个是`加载操作系统到ram中并移交控制权`。前面我们讨论了如何从实模式切换到保护模式，这里如何加载操作系统。

要理解如何加载操作系统，需要直到两方面的知识，第一个是操作系统的格式细节，这里我们使用的操作系统是ELF格式；另一个如何访问硬盘。下面我们先分别介绍这两方面的知识，因为只有直到ELF文件的格式之后，才能直到如何去读取操作系统并运行。

#### ELF文件格式介绍
ELF(Executable	and	linking	format)文件格式是Linux系统下的一种常用目标文件(object file)格
式，有三种主要类型:
* 用于执行的可执行文件(executable file),用于提供程序的进程映像,加载的内存执行。
这也是本实验的OS文件类型。
* 用于连接的可重定位文件(relocatable file),可与其它目标文件一起创建可执行文件和共
享目标文件。
* 共享目标文件(shared object file),连接器可将它与其它可重定位文件和共享目标文件连接
成其它的目标文件,动态连接器又可将它与可执行文件和其它共享目标文件结合起来创
建一个进程映像。

> 参考资料：![ELF_format](http://www.skyfree.org/linux/references/ELF_Format.pdf)
这里只介绍第一种，也就是可执行文件的格式。

[elf-overview](/img/elf-overview.png)

可以看到ELF文件最开始的部分是ELF header，header包含了elf文件的所有信息，包括程序的每一部分大小、位置等等。对于可执行文件，其次最重要的就是`program header table(pht)`，pht包含了如何创建一个进程映像的信息，可执行文件必须含有pht。pht并不一定就紧跟在header后面，除了elf header以外的其他部分的顺序是不确定的。

##### ELF header
```c
struct elfhdr {
    uint32_t e_magic;     // must equal ELF_MAGIC
    uint8_t e_elf[12];
    uint16_t e_type;      // 1=relocatable, 2=executable, 3=shared object, 4=core image
    uint16_t e_machine;   // 3=x86, 4=68K, etc.
    uint32_t e_version;   // file version, always 1
    uint32_t e_entry;     // entry point if executable
    uint32_t e_phoff;     // file position of program header or 0，程序头表在文件中的字节偏移。
    uint32_t e_shoff;     // file position of section header or 0
    uint32_t e_flags;     // architecture-specific flags, usually 0
    uint16_t e_ehsize;    // size of this elf header
    uint16_t e_phentsize; // size of an entry in program header
    uint16_t e_phnum;     // number of entries in program header or 0，程序头表的项数。
    uint16_t e_shentsize; // size of an entry in section header
    uint16_t e_shnum;     // number of entries in section header or 0
    uint16_t e_shstrndx;  // section number that contains section name strings
};
```
elf header的前16个字节用于标识一个elf文件，前四个字节是magic number，表示这个文件是一个elf文件，后面的12个字节表示elf文件类别，平台等等，这里没有用到，所以我们用`uchar elf[12]`表示了。其他重要的有entry——程序入口的虚拟地址、program header和phnum。

对于可执行文件其次最重要的是program header，program header是一个特定结构的数组，数组中的每一个元素代表一个section。结构如下：
```c
struct proghdr {
    uint32_t p_type;   // loadable code or data, dynamic linking info,etc.
    uint32_t p_offset; // file offset of segment
    uint32_t p_va;     // virtual address to map segment
    uint32_t p_pa;     // physical address, not used
    uint32_t p_filesz; // size of segment in file
    uint32_t p_memsz;  // size of segment in memory (bigger if contains bss）
    uint32_t p_flags;  // read/write/execute bits
    uint32_t p_align;  // required alignment, invariably hardware page size
};
```
包含section的偏移，虚拟地址、物理地址、大小等等信息。ucore-os的加载将会利用这些信息，将每一个段加载到指定的内存地址中。

> elf其他格式的解析，会结合操作系统程序的链接、加载一起学习，请看[操作系统程序的链接、加载](#)

#### 硬盘访问概述
当前硬盘数据是储存到硬盘扇区中,一个扇区大小为512字节。读一个扇区的流程(可参看
boot/bootmain.c中的readsect函数实现)大致如下:
1.	 等待磁盘准备好
2.	 发出读取扇区的命令
3.	 等待磁盘准备好
4.	 把磁盘扇区数据读到指定内存

硬盘访问的具体细节，我们在其他的文章中学习，因为涉及到计算机接口、计算机组成原理等的知识，请看[x86下的IO访问详解](#)

#### 操作系统加载
前面我们了解了基础知识，接下来分析操作系统的加载过程，首先分析代码中：
```c
static void
readseg(uintptr_t va, uint32_t count, uint32_t offset) {
    uintptr_t end_va = va + count;

    // round down to sector boundary
    va -= offset % SECTSIZE;

    // translate from bytes to sectors; kernel starts at sector 1
    uint32_t secno = (offset / SECTSIZE) + 1;

    // If this is too slow, we could read lots of sectors at a time.
    // We'd write more to memory than asked, but it doesn't matter --
    // we load in increasing order.
    for (; va < end_va; va += SECTSIZE, secno ++) {
        readsect((void *)va, secno);
    }
}

// read the 1st page off disk
// 读取磁盘的第一页到内存中的ELFHRD（0x10000）位置，1页是4K，8个扇区。
// ELF可执行文件的ELF头在最开始的位置，这里将头读出来，然后根据头中的信息去读程序信息
readseg((uintptr_t)ELFHDR, SECTSIZE * 8, 0);

// is this a valid ELF?
if (ELFHDR->e_magic != ELF_MAGIC) {
    goto bad;
}

struct proghdr *ph, *eph;

// load each program segment (ignores ph flags)
// ph是程序头段的开始地址
ph = (struct proghdr *)((uintptr_t)ELFHDR + ELFHDR->e_phoff);
// eph是程序头段的结束地址（指针+数字的值是：指针值+数据类型大小*数字）
eph = ph + ELFHDR->e_phnum;
for (; ph < eph; ph ++) {
    // 这里p_offset按照扇区对齐去读
    readseg(ph->p_va & 0xFFFFFF, ph->p_memsz, ph->p_offset);
}

// call the entry point from the ELF header
// note: does not return
// 将ELF文件读入之后，到elf程序的开始地址执行
((void (*)(void))(ELFHDR->e_entry & 0xFFFFFF))();
```
最开始直接将硬盘的第一页读取到设定的内核起始位置0x10000，注意这个是从第二个扇区开始读，因为第一个扇区是bootloader，所以有`offset / SECSIZE + 1`。读取的第一页中可能也包含了其他的段，但是这里我们只关心elf header，其他的段后段会再读，读的时候可能会覆盖本次读的段，这些都没有问题。事实上我们也可以按照扇区大小和header的大小向上取整读若干个扇区，但是这里为了方便就直接读一页了。

硬盘读取是一次读取一个扇区，所以我们的硬盘访问分为两个方面：

第一个是按照段来解析，从program header中读取每一个段的虚拟地址、大小和偏移，虚拟地址是加载到内存中的地址，虚拟地址+大小就能确定这个段的范围；这里要注意偏移是指段在文件中的偏移位置，不一定按照扇区对齐了，而读取硬盘却是按照一个一个扇区读取的，所以我们要按照扇区来对齐进行读取，`offset / SECSIZE + 1`就是扇区号（从1开始，因为0是bootloader），而且这里将硬盘中的内容加载到**连续的内存中**，offset向下取整了，所以其映射到内存位置也要向下调整，所以有`va -= offset % SECSIZE`。

第二个是按照扇区来读，前面我们已经得到了段的范围和偏移，由偏移可以确定起始扇区，范围可以确定扇区的个数。先按照扇区对齐，然后逐个读入扇区到内存中，就将对应的段加载到了内存中。

最后调用`((void (*)(void))(ELFHDR->e_entry & 0xFFFFFF))()`，将入口地址作为一个没有返回值没有参数的函数指针调用，就将控制权交给了操作系统，后面执行的就是操作系统内核代码了。