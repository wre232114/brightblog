---
title: ucore-os笔记2：GNU make
date: 2019-06-16 21:22:12
tags:
- 操作系统
- ucore

category:
- 操作系统
- ucore
---
c/c++程序基本都是使用GNU make来构建的，其基础是位于根目录的Makefiles文件。

GNU make有什么用呢？我们使用gcc编译器的时候，gcc -o target source，将源文件编译成目标文件，那么如果我们有很多的c/c++文件呢？使用gcc命令就不太合适了把。makefiles就是帮我们做这个事情的，它会管理我们要编译的内容，我们指定构建的依赖和构建目标，然后编写对应的构建脚本，完成之后只需要一个make命令，就可以完成构建。make会判断源文件是否被更新过，如果源文件被更新了，那么被更新的那部分会被重新编译。

## 概览
这一部分说明make的使用、makefiles的基本构成、规则、编译脚本、变量等等，先对整体有一个印象，然后我们在后面再深入一些细节。

### make的使用
如果我们在某一个目录下使用make命令，那么会自动区查找该目录下的makefiles或Makefils文件，并执行makefiles文件中的第一个规则（可以通过.MAKEFILE_GOAL变量来修改，后面会说明）。

### makefiles的基本构成
先看一个示例：
```makefiles
edit: test.c
  cc -o edit test.c
.PHONY:clean
clean:
	rm -r -f ./bin/
```

makefile由三个部分组成: target、prerequisites、recipes，对应到上面的实例中就是，edit是target，test.c是prerequisites、下面的脚本是recipes（每一条语句占一行，前面必须有一个tab）。target可以只是命令，而不生成某个输出文件，比如上面的clean。

```
target: prerequisites
	...
```

除此之外，makefiles由五个元素构成：显式规则、隐式规则、变量定义、指令（例如include）和注释。

include可以导入其他的文件，这个过程时阻塞的，导入其他文件的过程会暂停当前makefiles的解析。

### make的运行规则

当prerequistes被更新时，target会被重新编译。prerequisite有可能也是其他rule的输出，这时候会先更新prerequisites再更新target。make会检测到target所依赖的文件的文件，执行必要的重新编译（未改变的那些不重新编译），在make内部会根据prerequisites来生成依赖图，依据依赖图来决定哪些部分需要重新编译。例如：

```
edit : main.o kbd.o command.o display.o \
       insert.o search.o files.o utils.o
        cc -o edit main.o kbd.o command.o display.o \
                   insert.o search.o files.o utils.o

main.o : main.c defs.h
        cc -c main.c
kbd.o : kbd.c defs.h command.h
        cc -c kbd.c
command.o : command.c defs.h command.h
        cc -c command.c
display.o : display.c defs.h buffer.h
        cc -c display.c
insert.o : insert.c defs.h buffer.h
        cc -c insert.c
search.o : search.c defs.h buffer.h
        cc -c search.c
files.o : files.c defs.h buffer.h command.h
        cc -c files.c
utils.o : utils.c defs.h
        cc -c utils.c
clean :
        rm edit main.o kbd.o command.o display.o \
           insert.o search.o files.o utils.o
```

edit依赖于.o文件，每一个.o文件又依赖于对应的.c和.h文件，当执行make的时候，会根据.c文件判断那些.o文件是要重新生成的并重新生成.o文件，然后再生成edit可执行文件。

不是第一条rule或者goal指定的rule所以依赖的rule时，该rule不会被执行，例如clean，只能显式使用make clean。

### 定义变量

```
objects = main.o kbd.o command.o display.o \
          insert.o search.o files.o utils.o
```

上面的格式就可以定义变量，可以使用=(递归查找变量的值，意味着可以多层引用变量)，:=(最多只查找一层的变量值，多于的直接当文本处理)，还有其他的定义方式，见变量。

### make推断规则

make有一个隐式的规则：.o文件会自动去找其名字对应的.c文件执行cc命令。也就是说我们可以仅指定.o文件的依赖，不用每条都写对应的cc语句，在prerequisies中也可以不写.c文件，如下：

```
objects = main.o kbd.o command.o display.o \
          insert.o search.o files.o utils.o

edit : $(objects)
        cc -o edit $(objects)

main.o : defs.h
kbd.o : defs.h command.h
command.o : defs.h command.h
display.o : defs.h buffer.h
insert.o : defs.h buffer.h
search.o : defs.h buffer.h
files.o : defs.h buffer.h command.h
utils.o : defs.h

.PHONY : clean
clean :
        rm edit $(objects)
```

### 编译脚本

recipes会被shell执行所以recipes用shell语法来编写。make不理解hell语法，它仅仅只做一点点简单的处理，然后将其将给shell执行。

make中的recipes规则：

* 以tab开头的空行不是空的，是一条空的recipes
* 在recipes中的comment不是make的comment，它会被传给shell
* 在rule中定义，以tab开头的变量不是make变量，它会被传给shell