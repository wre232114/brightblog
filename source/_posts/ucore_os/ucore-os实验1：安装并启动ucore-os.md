---
title: ucore-os实验1：安装并启动ucore-os
date: 2019-06-16 16:27:49
tags:
- 操作系统
- ucore-os

category:
- 操作系统
- ucore-os
---
在前面我们了解了很多的预备知识，可以先简略的过一遍基础知识，留个印象，很多东西比较抽象也记不下来，后面用到的时候再回过来看，并进一步查找资料，会有更好的学习效果。

## 安装实验环境
以下所有的安装步骤都是在centos 7下进行。其他环境下的安装请参照其他资料。

### 安装gcc、qemu
gcc是编译器，qemu是硬件模拟器，通过编译器编译生成.img文件，然后通过qumu硬件模拟器来启动编译后的操作系统。第一次实验的主要目的是：
* 了解gcc编译内核的过程
* 学习make&makeFile的使用
* 在qemu上调试内核
* 了解bootloader的代码

在centos 7中，使用yum安装：
> sudo yum install gcc gcc-c++ qemu

安装完成后在命令行输入qemu，提示无命令，这是因为默认安装的命令是qemu-system-i386，可以创建一个链接文件qemu链接到qemu-system-i386:
> sudo ln -s qemu-system-i386 qemu

提示：如果编译过程中出现错误，请尝试升级gcc编译器版本。

### 获取实验代码
在[这里](https://github.com/chyyuu/ucore_os_lab)获取代码，直接git clone下来就ok。

### 编译&调试内核
进入到clone下来的项目下的lab1目录下，执行：
> make

会生成bin文件夹，该文件夹下有.img文件。

下一步我们开始调试内核：

首先我们在qemu中启动内核，注意要使用-S -s操作来暂停cpu执行，因为我们要等待gdb调试程序的接入：
> qemu -s -S -hda ./bin/ucore.img -monitor stdio

打开另一个命令行窗口：
> target remote:1234
> break memset
> continue

这时候就会暂停在断点位置，使用next，可以继续执行内核代码。