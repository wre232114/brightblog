---
title: ucore-os-lab2：实验准备
date: 2019-12-30 10:58:18
tags:
- 操作系统
- ucore

category:
- 操作系统
- ucore
---
经过实验1的学习和练习，我们应该能熟练掌握下面的知识：
* 操作系统的基本硬件知识：分段、中断、计算机加电后的执行过程、IO设备初始化过程（选学）
* 软件知识：函数堆栈、x86常用汇编指令、bootloader的工作原理、ELF格式、操作系统的初始化过程
* 工具知识：make、gdb、gcc、qemu、shell、c和汇编的混合编译和链接

实验2需要掌握的知识：
* 硬件：分段分页机制结合
* 软件：分段分页机制下的bootloader和操作系统的初始化过程、双向链表
* 工具：链接器生成的虚拟地址以及如何生成虚拟地址

下面的相关笔记会介绍一些相关的知识：
* ![操作系统初始化过程（启用分页）](#)
* ![ld链接器](#)
* diff和patch命令的使用


## diff和patch命令的使用
diff是linux命令用于比较文件和文件夹的差异，patch也是linux命令，可以通过patch应用diff得到的结果，将差异应用到目标文件夹中。**类似git的merge功能。**

例如：
```shell
diff	-r	-u	-P	proj_a_original	proj_a_mine	>	diff.patch
cd	proj_b
patch	-p1	-u	<	../diff.patch
```
上面的diff将proj_a_mine相对于proj_a_original的修改输出到diff.patch文件中。proj_a_original表示修改之前的文件夹，proj_a_mine表示修改之后的文件夹。

后面的patch将a文件夹的修改应用到b文件夹。例如我们在完成了实验1后，可以用diff比较我们修改的实验1和原始实验1文件夹的差异，然后将修改应用到实验2，这样就能在实验2的文件夹中使用实验1的结果了。

下面对diff和patch的参数做一个分析，diff：
* -r：递归处理子目录
* -u：在合并的上下文中输出行号
* -P：显示每一个修改的C函数

patch：
* -p1：去除文件名前面的一个component，这个用于子目录同步，例如./lab2/xxxx和当前为lab3目录下，就需要使用p2，因为差了两级目录，如果是lab2/xxx，就用p1，因为只差了一级目录（从'/'分割来看，尽管./lab2/xxx和lab2/xxx表示的路径相同）
* -u：作为一个整体的差异翻译patch文件

这里需要注意patch也需要`<`来从文件重定向输入。