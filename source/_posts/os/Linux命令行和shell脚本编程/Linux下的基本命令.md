---
title: Linux下的基本命令
date: 2019-08-05 22:13:23
tags:
- 《Linux命令行和Shell脚本编程》
- 操作系统
- linux命令

category:
- 操作系统
- shell
---

这篇文章总结了linux下常用的命令，包括文件处理、进程处理、网络通信等等。主要基于《linux shell和脚本编程》的第三章和第四章。

## 文件系统
linux系统下提供了完整的文件操作的命令，包括新建、删除、移动、赋值、压缩文件和目录。这里我们列举一下linux文件系统下的各目录的作用，常用的文件操作命令。

### linux文件目录名称和作用
|目录|用途|
|:----:|:----:|
/|系统的根目录，所有目录都是其子目录
/bin|二进制目录，存放很多用户级的GNU工具，一些系统常用的shell命令的二进制文件会放在这里
/boot|启动目录，操作系统启动的配置文件会放在这里，这里的文件丢失或者损坏可能会导致不能开机
/dev|设备目录，计算机上挂载的设备（例如USB磁盘）都会在该目录下创建一个设备节点
/home|主目录，各非root用户的用户根目录是其子目录
/lib|库目录，存放系统和应用程序的库文件
/media|媒体目录，可移动设备的常用挂载点（没有挂载的目录时该目录是空的，磁盘挂载的时候可以可以挂载到任意目录，可移动设备挂载到这里只是常用的方式）
/mnt|挂载目录，另一个可移动设备的常用挂载点
/opt|可选目录，常用于存放第三方软件包
/proc|进程目录，存放现有硬件及当前进程的相关信息
/root|root用户的主目录
/sbin|系统二进制目录，存放许多系统GNU管理员工具
/run|运行目录，存放系统运作时的数据
/sys|系统目录，存放系统硬件信息的相关文件
/tmp|临时目录，在该目录中创建和删除临时工作文件
/usr|用户二进制目录，存放用户GNU工具和数据文件
/var|可变目录，用以存放经常变化的文件比如日志文件

### linux文件目录
linux中提供了文件链接，分为符号链接和硬链接。如果需要在系统上维护同一个文件的多分副本，除了保存多分单独的物理文件副本之外，还可以采用保存一份物理文件副本和多个虚拟副本的方法。

符号链接就是一个实实在在的文件，它指向存放在目录中的某一个地方的另一个文件

硬链接会会创建独立的虚拟文件。其中包含了原始文件的位置和信息

符号链接和硬链接的区别是，符号链接类似与windows下的快捷方式，通过一个独立的文件指向被符号链接的文件，访问链接文件就等于访问源文件，当源文件被删除后，再访问链接文件会报错。硬链接是对文件的一个虚拟拷贝，相当于多个指针指向同一个文件，删除其中一个硬链接不会影响其他的硬链接，硬链接不会创建新的文件，他们都共享同一个文件inode，本质上是同一个文件，只是创建了多个指针指向同一个文件，只要有一个文件指针在，文件就不会被删除。

文件遍历：
* cd：遍历目录，.代表当前目录，..代表父目录
* ls：输出当前目录下的文件列表，-R选项显示子目录，-F选项区分目录和文件

文件操作:
* touch：新建文件
* cp [source] [destination]：复制文件，通过-R选项可复制目录
* ln：-s选项创建符号链接，不带选项就是创建硬链接
* mv：移动或者重命名文件。mv只会影响文件名，不会影响时间戳和其他的文件属性。
* rm：删除文件，-i提示，-f强制删除，-r递归删除子目录
* vim [file]：使用vim编辑器修改文件

目录操作：
* mkdir：创建目录，要同时创建目录和子目录，需要使用-p参数
* rmdir：删除目录，但是只能删除空目录，要删除非空目录，需要使用rm -r

文件查看：
* file：查看文件类型
* cat：查看整个文件
* more：分页查看
* less：more命令的升级版
* tail：查看文件尾部
* head：查看文件头部

## 进程管理
### 探查进程——ps
ps命令能够探查进程，ps默认情况下不会输出很多信息，需要自己携带选项来获取更多的信息。例如，使用<code>ps -ef</code>来输出所有进程的详细格式。

ps只能显示某个特定时间点的信息，给出的是系统某一个时间点的进程信息片段，如果想观察进程的动态变化，ps命令就力不从心了。

### 实时检测进程——top
直接在控制台中输入top，会打印动态变化的进程信息，大概每隔一秒钟变化一次。

其中注意几个特殊的结果参数：
* %CPU：进程使用的CPU比例
* %MEM：进程使用的内存占可用内粗年的比例
* PR：优先级
* NI：进程的谦让度
* VIRT：进程占用的虚拟内存总量
* RES：进程占用的物理内存总量
* SHR：进程和其他进程共享的内存总量
* S：进程的状态（D：可中断的休眠状态，R：运行状态，S：休眠状态，T：跟踪状态或停止状态，Z：僵化状态）

### 结束进程
当进程挂起时，如果重新激活进程，如何强制关闭进程。

linux采用信号来进行通信。进程如何处理信号是由开发人员通过编程来决定的。linux有两个命令可以向运行中的进程发出进程信号。
1. kill命令
   kill命令可通过进程ID（PID）给进程发信号。常用的方式是，使用ps -ef|grep <名称>找到进程id，然后通过kill pid来发出关闭进程的信号（一个TERM信号，表示尽可能终止）


## 用户管理


## 查看系统信息
```shell
lsb_release -b
```