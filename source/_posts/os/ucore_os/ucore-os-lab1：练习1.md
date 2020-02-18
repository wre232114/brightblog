---
title: ucore-os实验1：lab1练习1
date: 2019-06-17 08:13:51
tags:
- 操作系统
- ucore

category:
- 操作系统
- ucore
---

## 练习1：理解通过make生成执行文件的过程
要求如下：
1. 操作系统镜像文件ucore.img是如何一步一步生成的？（需要详细解释Makefile中每一条相关命令和命令参数的含义，以及说明命令参数导致的结果）
2. 一个被系统认为符合规范的硬盘主引导扇区的特征是什么？

答：先分析Makefile的整体结构，整个Makefile大概分成下面几个部分（从前到后）：
* 变量定义：定义大量和编译、链接、linux命令、环境变量定义等相关的变量
* include：包含了function.mk，function.mk中定义了很多和编译相关的工具函数
* 函数定义：基于function.mk中的函数再封装了一些函数，用于生成规则并修改前面定义的变量等
* 规则生成：使用前面定义的函数生成规则，分别生成lib、kernel、bootblock、sign等的规则
* ucore.img生成：定义ucore.img生成的规则
* 通用规则定义：定义了清楚、打分、qemu调试等等规则

然后我们从make默认的入口开始——TARGETS。在makefile中有：
```
TARGETS: $(TARGETS)
.DEFAULT_GOAL: TARGETS
```
上面说明了输入make，找的是TARGETS规则，而TARGETS规则依赖的是变量TARGETS扩展后的值。

然后我们找TARGETS变量，发现TARGETS是一个全局变量，其值在function.mk中定义的函数中改变。当调用`create_target`时，就会向TARGETS后面添加内容。Makefile中对create_target包装了一层`create_target_cc`，将最后两个参数设置成CC和CFLAGS。我们看看`create_target`的实现：

```shell
# add packets and objs to target (target, #packes, #objs[, cc, flags])
define do_create_target
__temp_target__ = $(call totarget,$(1))
__temp_objs__ = $$(foreach p,$(call packetname,$(2)),$$($$(p))) $(3)
TARGETS += $$(__temp_target__)
ifneq ($(4),)
$$(__temp_target__): $$(__temp_objs__) | $$$$(dir $$$$@)
	$(V)$(4) $(5) $$^ -o $$@
else
$$(__temp_target__): $$(__temp_objs__) | $$$$(dir $$$$@)
endif
endef

# add packets and objs to target (target, #packes, #objs, cc, [, flags])
create_target = $(eval $(call do_create_target,$(1),$(2),$(3),$(4),$(5)))

create_target_host = $(call create_target,$(1),$(2),$(3),$(HOSTCC),$(HOSTCFLAGS))
```
该函数的作用就是由传进来的参数构建出一个规则。规则生成的方式是：将传进来的target参数扩展成target，packs+objs参数扩展成prerequisites。然后如果有第四个参数，添加编译的recipe，否则使用默认的。

接着我们分析用到了`create_target`的代码，看看有什么效果，例如：`$(call create_target,kernel)`。这里只传了target为kernel，那么得到的结果是：
```
TARGETS += bin/kernel
bin/kernel: | bin
```
然后我们看到代码中总共有四次使用到了`create_target`，分别是：
```
$(call create_target,kernel)
$(call create_target,bootblock)
$(call create_target_host,sign,sign)
$(call create_target,ucore.img)
```
根据上面的分析，我们得到运行结果：
```
TARGETS = bin/kernel bin/bootblock bin/sign bin/ucore.img
bin/kernel: | bin
bin/bootblock: | bin
bin/sign: __objs_sign | bin
  @gcc -g -Wall -O2 __objs_sign -o bin/sign
bin/ucore.img: | bin
```
上面的`-g -Wall -O2`分别表示输出调试信息，输出警告，采用二级代码优化。-o指定输出的文件名。

所以对于入口`TARGETS: $(TARGETS)`我们可以得到`TARGETS: bin/kernel bin/bootblock bin/sign bin/core.img`。接下来我们找kernel和bootblock等为target的规则。

对于kernel，有：
```shell
KOBJS	= $(call read_packet,kernel libs)
kernel = $(call totarget,kernel)

$(kernel): tools/kernel.ld

$(kernel): $(KOBJS)
	@echo + ld $@
	$(V)$(LD) $(LDFLAGS) -T tools/kernel.ld -o $@ $(KOBJS)
	@$(OBJDUMP) -S $@ > $(call asmfile,kernel)
	@$(OBJDUMP) -t $@ | $(SED) '1,/SYMBOL TABLE/d; s/ .* / /; /^$$/d' > $(call symfile,kernel)
```
扩展变量之后的结果是：
```shell
kernel = bin/kernel

bin/kernel: tools/kernel.ld

bin/kernel: $(__objs_kernel) $(__objs_libs)
  @echo + ld bin/kernel
  @ld -nostdlib -T tools/kernel.ld -o bin/kernel $(__objs_kernel) $(__objs_libs)
  @objdump -S bin/kernel > kernel.asm
  @objdump -t bin/kernel | sed '1,/SYBOL TABLE/d; s/ .* / /; /^$$/d' > kernel.sym
```
通过这里我们知道了kernel的编译规则（这里其实是链接），依赖于`$(__objs_kernl)`和`$(__objs_libs)`(待会儿说这个是啥)。recipe中的第一行说明当前链接的文件。第二行指定`tools/kernel.ld`脚本链接，链接`$(__objs_kernel)`和`$(__objs_lbs)`，生成bin/kernel。后面的objdump反编译bin/kernel，提取出汇编代码和符号表中的内容。

接下来我们看看这个`__objs_kernel`的内容是什么。看function.mk中，第一行就是：
```
OBJPREFIX	:= __objs_
```
然后发现于下面的几个函数有关：
```shell
packetname = $(if $(1),$(addprefix $(OBJPREFIX),$(1)),$(OBJPREFIX))

# add files to packet: (#files, cc[, flags, packet, dir])
# define定义了一个多行变量，作为一个自定义函数。$$是因为eval扩展一次，作为make语法解析的时候扩展一次
# 如果想在作为make解析的时候扩展，使用$$
define do_add_files_to_packet
__temp_packet__ := $(call packetname,$(4))
ifeq ($$(origin $$(__temp_packet__)),undefined)
$$(__temp_packet__) :=
endif
__temp_objs__ := $(call toobj,$(1),$(5))
$$(foreach f,$(1),$$(eval $$(call cc_template,$$(f),$(2),$(3),$(5))))
$$(__temp_packet__) += $$(__temp_objs__)
endef

# add objs to packet: (#objs, packet)
define do_add_objs_to_packet
# __temp_packet值为__objs_$(2)
__temp_packet__ := $(call packetname,$(2))
ifeq ($$(origin $$(__temp_packet__)),undefined)
$$(__temp_packet__) :=
endif
$$(__temp_packet__) += $(1)
endef

add_files_cc = $(call add_files,$(1),$(CC),$(CFLAGS) $(3),$(2),$(4))
```
分析代码知道，`$(__temp_packet) = __objs_$(4)`，`__temp_objs`值为`$(1)`将后缀改为`.o`的文件名。如果是`do_add_files_to_packet`则还有一个将files编译的过程。

大致知道了`__objs_xxx`是从哪设置的，接下来具体分析，从Makefile中调用的位置开始：
```shell
$(call add_files_cc,$(call listf_cc,$(LIBDIR)),libs,)
```
会得到（不是最终结果，稍微扩展了一下便于分析）：
```shell
__temp_packet = __objs_libs

obj/libs/*.d: libs/*.c | obj/libs/
  @cc -Ilibs ...

obj/libs/*.o: libs/*.c | obj/libs/
  @echo + cc $<
  @cc -I/libs ...

__objs_libs += obj/libs/*.o
```

这下我们知道`__objs_libs`的来源及其值了。可以理解了整个项目的构建过程：
1. 从`TARGET: $(TARGETS)`作为入口的rule
2. TARGETS的值通过`create_target`函数改变，最后的结果是`TARGETS: bin/kernel bin/bootblock bin/sign bin/ucore.img`。targets总共有四个依赖
3. 四个依赖分别扩展成：
   * `bin/kernel: __objs_kernel __objs_libs`：`__objs_kernel`和`__objs_libs`分别是kernel和libs文件夹下c文件编译后得到的.o文件。生成.o文件的规则通过`add_files_cc`添加。
   * `bin/bootblock: obj/boot/*.o | bin/sign`：其中，obj/boot/*.o，通过`$(foreach f,$(bootfiles),$(call cc_compile,$(f),$(CC),$(CFLAGS) -Os -nostdinc))`生成规则。注意`bin/bootblock`的recipe中只是生成了obj/bootblock.out，在脚本中执行了bin/sign，sign将obj/bootblock.out作为输入，输出了bin/bootblock
   * `bin/sign`：`$(call add_files_host,tools/sign.c,sign,sign)`生成如何生成.o文件的规则。`$(call create_target_host,sign,sign)`生成`bin/sign: __objs_sign | bin`这里的`__objs_sign`也是在前面add_files_host的时候设置，其值是sign依赖的.o文件
   * `bin/ucore.img`：到了最关键的ucore.img的生成了，规则是：`$(UCOREIMG): $(kernel) $(bootblock)`依赖于上面的kernel和bootblock的结果。其recipe脚本为dd命令，拷贝一个文件并转换格式到目标文件。有三条dd命令，第一条是`$(V)dd if=/dev/zero of=$@ count=10000`拷贝仅仅10000个block。后面两条使用相同的形式将bootblock拷贝到第一个块，kernel拷贝到后面的块，生成了ucore.img

再次总结一下，ucore.img的编译过程是：
1. 分别设置bin/kernel、bin/sign、bin/bootblock、bin/ucore.img四个文件的规则。kernel和sign的prerequisites都被设置成临时变量__objs_xxx。生成过程就是就__objs_xxx表示的.o文件链接成可执行文件。
2. 临时变量__objs_xxx和全局变量TARGETS在add_files、add_target等工具函数中设置和改变；add_files函数还有从.c到.o文件的编译规则。
3. bootblock只生成obj/bootblock.out，在bin/sign脚本执行下才会生成bin/bootblock。所以在bootblock的依赖中添加了bin/target作为前置依赖，保证先生成bin/target。
4. 当kernel和bootblock都生成好了以后在生成ucore.img。ucore.img其实只是将bootblock放在了第一个block，kernel放在了后面的block

接下来我们分析编译和链接中的选项的意义。包括从.c到.o以及.o链接成结果中使用的选项。首先是gcc：
```shell
CFLAGS	:= -march=i686 -fno-builtin -fno-PIC -Wall -ggdb -m32 -gstabs -nostdinc $(DEFS)

CFLAGS	+= $(shell $(CC) -fno-stack-protector -E -x c /dev/null >/dev/null 2>&1 && echo -fno-stack-protector)
```
* -march=i686：生成对应i686指令集的机器码
* -fno-builtin：不使用内置函数，除非是使用__builtin_开头的函数
* -fno-PIC：**跟硬件有关，暂时没有找到其用处**
* -Wall：输出警告信息
* -ggdb：产生用于gdb的调试信息
* -m32：生成32位环境下的代码，此时int和long都视为32bit
* -gstabs：使用stabs格式产生调试信息，不需要GDB扩展
* -nostdinc：不在系统目录中查找header文件，只有-I等指令指定的目录被搜索（**在操作系统开发中不使用标准库，而自己编写适应目标处理器架构的标准库，此时需要这个指令，将对标准库的搜索重定向到自定义的目录**）
* -fno-stacl-protector：-fstack-protector的作用是生成额外的代码用于buffer溢出检查。no的意思应该是不生成额外检查的代码。
* -I添加头文件检索目录

然后是ld：
```shell
LDFLAGS	:= -m $(shell $(LD) -V | grep elf_i386 2>/dev/null | head -n 1) # 结果是elf_i386
LDFLAGS	+= -nostdlib

$(V)$(LD) $(LDFLAGS) -T tools/kernel.ld -o $@ $(KOBJS)

$(V)$(LD) $(LDFLAGS) -N -e start -Ttext 0x7C00 $^ -o $(call toobj,bootblock)
```
* -m elf_i386：仿真仿真链接器
* -nostdlib：链接的时候仅仅只搜索命令行指定的目录（因为操作系统不使用标准库）
* -T：使用链接脚本，指定的链接脚本将替换默认的链接脚本
* -N：将代码段和数据段设置成可读和可写的。同时不将数据段按页对齐，同时仅用共享库的链接。
* -e start：将start这个明确的符号作为程序开始执行的入口，而不是使用默认的入口。如果没有名字位start的符号，将会视图将entry翻译成数字，并作为入口地址。
* -Ttext：将`.bss`、`.data`、`.text`放到指定的绝对地址，例如0x7C00

ucore-os的Makefile还是比较复杂的，定义了很多自定义函数，层层嵌套。而且在没有接触过make等相关gcc编译工具的基础上，更加困难了。但是通过产看make、gcc、ld等工具的文档，一边分析，一边学习。通过一周的努力，终于弄清楚了ucore-os内核和bootloader的编译链接并生成img文件的过程。里程碑！

第二问：
分析构建bootblock的sign.c源码：
```c
#include <stdio.h>
#include <errno.h>
#include <string.h>
#include <sys/stat.h>

int
main(int argc, char *argv[]) {
    struct stat st;
    if (argc != 3) {
        fprintf(stderr, "Usage: <input filename> <output filename>\n");
        return -1;
    }
    if (stat(argv[1], &st) != 0) {
        fprintf(stderr, "Error opening file '%s': %s\n", argv[1], strerror(errno));
        return -1;
    }
    printf("'%s' size: %lld bytes\n", argv[1], (long long)st.st_size);
    if (st.st_size > 510) {
        fprintf(stderr, "%lld >> 510!!\n", (long long)st.st_size);
        return -1;
    }
    char buf[512];
    memset(buf, 0, sizeof(buf));
    FILE *ifp = fopen(argv[1], "rb");
    int size = fread(buf, 1, st.st_size, ifp);
    if (size != st.st_size) {
        fprintf(stderr, "read '%s' error, size is %d.\n", argv[1], size);
        return -1;
    }
    fclose(ifp);
    buf[510] = 0x55;
    buf[511] = 0xAA;
    FILE *ofp = fopen(argv[2], "wb+");
    size = fwrite(buf, 1, 512, ofp);
    if (size != 512) {
        fprintf(stderr, "write '%s' error, size is %d.\n", argv[2], size);
        return -1;
    }
    fclose(ofp);
    printf("build 512 bytes boot sector: '%s' success!\n", argv[2]);
    return 0;
}
```
sign.c从main接收两个参数，一个是输入文件名argv[1]，另一个是输出文件名argv[2]。首先从获取argv[1]文件的文件信息，通过struct stat获得。然后输出argv[1]的大小并进行判断。如果size > 510则过大，报错退出。然后从读出argv[1]中的内容，并判断读出的内容的大小是不是和stat中st_size属性值一致。如果不是，报错退出。再把前512个字节中的最后两个字节设置成0x55和0xAA。然后把这512个字节写入到argv[2]。

从上面的流程可以看出，规则是：
1. 总大小为512字节
2. 最后两个字节空出来填充0x55和0xAA，bootloader的内容必须小于510字节。
