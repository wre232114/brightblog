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

GNU make有什么用呢？我们使用gcc编译器的时候，gcc -o target source，将源文件编译成目标文件，那么如果我们有很多的c/c++文件呢？使用gcc命令就不太合适了。makefiles就是帮我们做这个事情的，它会管理我们要编译的内容，我们指定构建的依赖和构建目标，然后编写对应的构建脚本，完成之后只需要一个make命令，就可以完成构建。make会判断源文件是否被更新过，如果源文件被更新了，那么被更新的那部分会被重新编译。

[GNU Make的官方文档](https://www.gnu.org/software/make/manual/make.html#Overview)，阅读步骤：阅读每一章的前几个章节，因为前几个章节是介绍性的内容。等到具体到细节的时候，再阅读后面的内容。

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

除此之外，makefiles文件由五个元素组成：显式规则、隐式规则、变量定义、指令（例如include）和注释。
* 显示规则说明了如何重新编译一个或者更多的文件，就是target。
* 隐式规则说明了合适根据文件的名字来重新构建一类文件。例如target是main.o，那么会自动寻找和编译main.c
* 变量是将文件赋值给一个变量的一行，稍后使用变量的地方会用该文本代替（类似C中的宏替换）。
* 指令是在makefiles被解析时告诉make去做一些特殊的事情，包括：
  * 读取其他makefiles
  * 决定是否使用或者忽略makefiles的一部分（makefiles的条件指令，类似C的预编译条件指令）
  * 从多行字符串定义一个变量
* '#'开头一行，'#'所在行后面的部分都是注释，注意：
  * 没有被转义的'\'会将注释延续到下一行；这样一个'#'可以实现多行注释
  * 如果要使用符号'#'使用，`\#`
  * 变量和函数调用中不能使用注释，注释会当做纯文本传给变量和函数
  * recipe中的注释会传给shell

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

不是第一条rule或者goal指定的rule所依赖的rule时，该rule不会被执行，例如clean，只能显式使用make clean。

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

### 小结
上面是对makefiles的一个小的概括，关键包括下面几点：
1. makefiles是做什么用的？
   答：makefiles用于自动构建，通过`构建目标: 构建依赖\n 构建命令`这样的格式来自动构建程序。makefiles会根据我们编写的构建规则来处理构建关系，最后生成构建目标。不仅仅使用于c、c++语言，也适用于其他语言甚至文档。总之，makefiles是一个管理依赖关系的自动构建工具。
2. makefiles的构建过程？
   答：输入make之后，会找到第一个规则（如果是make target，则找到target对应的规则），先构建prequistes，例如上例的main.o，先去构建target为main.o的依赖。所有prequistes构建完成后，执行后面的脚本。相当于makefiles先根据我们编写的规则构建依赖树，然后自底向上执行规则的脚本，同时会检测更新确定是否要执行脚本。

### 编译脚本

recipes会被shell执行所以recipes用shell语法来编写。make不理解shell语法，它仅仅只做一点点简单的处理，然后将其将给shell执行。

make中的recipes规则：

* 以tab开头的空行不是空的，是一条空的recipes
* 在recipes中的comment不是make的comment，它会被传给shell
* 在rule中定义，以tab开头的变量不是make变量，它会被传给shell


## 编写makefiles
上面提到了makefiles包含五个部分，显式规则、隐式规则、变量、指令、注释。接下来会逐步介绍细节。

### 多行语法
makefiles使用了一种多行语法，每一个换行符都表示一条语句的结束。通过\可以将单行的内容分布在多行中，非recipe脚本中的\和其前后的空格都会被合并成单个空格。
> 指定了`.POSIX`的target的\不会被压缩。


### Makefile文件的名字
按照`GNUmakefile`、`makefiles`、`Makefile`的顺序查找。

如果make没有找到上述文件的任何一个，则会启用内置的隐式规则来决定如何构建。

通过make的-f或者--file选项可以指定自己的makefile文件。可以多次使用-f选项，指定的文件按顺序拼接。使用-f会忽略默认的makefile文件。

### 包括其他makefile文件
`include`会暂停当前文件的读取转而读取和解析指定的文件，完成后继续本文件。
```
include filename
```

例如：
```
include *.mk $(bar)
```
等价于（假定当前文件夹下有a.mk,b.mk,c.mk。bar的值是bish bash
```
include a.mk b.mk c.mk bish bash
```

如果指定的文件路径下没找到，会去--include-dir选项指定的文件夹下找，以及`/usr/local/include`、`usr/gnu/include`、`/usr/include`

> 注意：环境变量MAKEFILES用于在文件其他部分解析之前include 变量MAKEFILES指定的一系列文件。类似于include，建议显式使用include而不是MAKEFILES变量。

### 没看懂的两节
How makefiles are remade以及Overriding part of another makefile.

主要是不懂这个部分讲了什么功能，这些功能如何使用以及用于什么场景。

### make如何处理Makefile
GNU make经过两个阶段处理Makefile。第一阶段读取所有makefile，包括included的makefile。内化所有的变量和其值，以及显式和隐式规则，并且构建target和其prerequisites之间的依赖图。

第二阶段利用第一阶段构建的内部结构，决定哪些target需要构建，并且执行其脚本。

理解两阶段构建很重要，因为这涉及到变量和函数何时扩展。先说明基本概念，`扩展`指变量和函数被替换为相应的值；`immediate`指第一阶段扩展；`deffered`指第二阶段扩展。

#### 变量赋值
变量赋值的解析规则如下，注意前面提到的immediate和deffered的概念。

```
immediate = deffered
immediate ?= deffered
immediate := immediate
immediate ::= immediate
immediate += immediate or deffered
immediate != immediate
```

#### 条件指令
条件指令是immediate parsed的，在第一阶段就处理了。这意味着，自动化变量不能用于条件指令（因为自动化变量直到rule的recipe调用时才设置）。如果需要使用自动化变量，需要在recipe中使用shell语法的条件指令。

#### 规则定义
规则定义始终按照如下以下方式处理：
```
immediate: immediate; deffered
        deffered
```

target和prerequisites始终时immediate的，而recipe始终时deffered的。

### 二次扩展
**对于prerequisites**，GNU提供了额外的能力，叫做二次扩展。必须在第一个prerequisites前使用`.SECONDEXPANSION`来启用这个能力。
> 注意：二次扩展仅适用于prerequisites。

怎么用呢？通过两个$，来实现在正常扩展后的二次扩展，例如：
```
.SECONDEXPANSION
ONEVAR = onefile
TWOVAR = twofile
myfile: $(ONEVAR) $$(TWOVAR)
```
在第一次扩展以后myfile是`myfile: onefile $(TWOVAR)`，在二次扩展后，才会变成`myfile: onefile twofile`。

**这里还有其他内容，和自动化变量，显示规则、隐式规则相关，先阅读后面，回来再继续补充。**

## 编写Rule
rule的顺序不太重要，除了默认的rule——第一个rule。没有指定target的时候，默认找第一个rule。

### Rule示例
```shell
foo.o : foo.c defs.h # module for twiddling the frobs
        cc -c -g foo.c
```
构建target是foo.o，前置要求是foo.c 和defs.h。说明了两个事情：
1. 如何决定foo.o是否过期：foo.o不存在或者foo.c 和defs.h更新
2. 如何更新foo.o：执行脚本中的cc命令

### Rule 语法
```shell
targets : prerequisites
        recipe
        …
# or like this:

targets : prerequisites ; recipe
        recipe
        …
```
要点：
* targets可以是多个
* targets是文件名，可以使用通配符。变量赋值的通配符需要使用通配符函数
* recipe是tab开头的行（或者.PRECIPEPREFIX环境变量指定的）
* `$`用于变量，如果要使用`$`符号，使用`$$`。recipe决定如何更新target，它被传递给shell执行

### 一个target，多个规则
同一个target可以有多个规则，这些规则会合并成一个规则。这些规则的所有rerequisites会合并成同一个规则。

**但是一个target只能有一个recipe**。如果一个target有多个recipe，make会使用最后一个，并给出警告。

使用`::`可以让一个target拥有多个recipe。target重新构建的时候，每一个recipe都会被独立的执行。

## 在Rules中编写Recipes
Recipes包含一条或者多条shell命令，按照出现的次序依次执行。

### Recipe语法
* tab开头，或者.RECIPEPREFIX变量指定的符号开头，第一条语句可以接在prerequisites后面
* recipe中的comment不是make的comment，会传给shell
* rule上下文中的变量定义，如果以tab开头，当作shell的变量
* 条件表达式会传给shell

#### Recipe中使用变量
recipe中的变量在结束读取makefiles，确定targets过时了之后才会被扩展。

recipe中的变量和函数和makefiles中其他位置有相同的语法和语义，使用上没有区别。

### Recipe的执行
更新target时执行recipes，这些recipe将会在一个新的子shell中执行，除非指定了.ONESHELL。

## 如何使用变量
一个变量类似于C语言中的宏替换，其值是一个文本。这些值被替换到targets，prerequisites，recipes以及makefile的其他位置。（变量也叫宏）。

变量名大小写敏感。

### 变量引用基础
使用`$(var)`或者`${var}`来使用变量。var是变量名。变量可用于targets、prerequisites、recipes、大多数指令以及新的变量。变量被扩展的时候用其值替换。
```make
objects = program.o foo.o utils.o
program : $(objects)
        cc -o program $(objects)
$(objects) : defs.h
```
### 两种类型的变量
一种是使用`=`，表示递归扩展的变量；意思就是，如果扩展后的值还是一个变量，那么会继续对改变量进行扩展。递归扩展在每次扩展时都会对函数进行求值。

另一种是`:=`，表示简单扩展变量；意思就是，只会扩展一次，值就是扩展后的文本，即便该文本可能是一个变量的扩展（`$(two)`这种形式）。

还有一种`?=`，表示条件赋值；意思就是，只有变量没有定义的时候才会定义变量并赋值：
```make
FOO ?= bar
```
相当于：
```make
ifeq ($(origin FOO), undefined)
        FOO = bar #注意是=，而不是:=
endif
```
> 注意：变量赋值时会忽略前置的空格，但是后置的空格不会。当涉及到目录的时候，容易出错。例如`BINDIR = bin # bin dir`，后置空格不会被去除，那么`$(BINDIR)/file`就会变成`bin /file`，如果作为命令行参数，`bin/file`是一个选项，而`bin /file`就变成两个选项了。

### 变量的+=
分成两种情况，如果变量已经定义，那么`a += b`等价于`a := $(a) b`。

如果变量没有定义，`a += b`等价于`a = b`

### 多行变量
define是另一种定义变量的方式（还有=、:=等等）。语法：
```
define vari-name[=|+=|:=]
foo
$(bar)
endef
```
等于符号可以省略，省略默认使用=。define可以定义多行变量。多行内容的中的变量和函数会正确扩展。里面的make指令也会被正确解析。


## makefile中的条件片段
示例：
```
libs_for_gcc = -lgnu
normal_libs = 

foo: $(objects)
ifeq ($(CC), gcc)
        $(CC) -o foo $(objects) $(libs_for_gcc)
else
        $(CC) -o foo $(objects) $(normal_libs)
endif
```

### 条件指令的语法
```
ifeq(arg1, arg2)
        ...
else
        ...
endif
```
一共有下面这些条件指令：
1. `ifeq(arg1, arg2)`或者`ifeq "arg1" "arg2"
2. `ifdef varname`
3. `ifndef varname`


## 处理文本的函数
函数用于处理文本。使用一个函数称为函数调用。通过给函数传一些参数，能够得到函数的返回值。

### 函数调用语法
```
$(function arguments)
# 或者
${function arguments}
```
通过内置的call函数可以定义自己的函数。

### shell函数
shell函数将参数传给shell命令并且对命令的输出求值。make对参数的处理仅仅是将`\`替换成空格。

shell函数被扩展的时候执行命令。取决于shell函数的位置，如果在recipe中，则是第二阶段，也就是recipe执行的时候扩展。

示例：
```
files = $(shell echo *.c)
```


### 用于文本替换和分析的函数
1. $(filter pattern...,text)
   返回text中匹配模式字符串的空格隔开的单词，移除不匹配的单词。可以使用`%`作为通配符。

   示例：
   ```
   source := foo.c bar.c baz.s ugh.h
   foo: $(source)
        cc $(filter %.c %.s, $(source)) -o foo
   ```
   $(filter %.c %.s, $(source))会把source中满足%.c或者%.s的单词取出来。
2. $(patsubst pattern,replacement,text)
   找到text中使用空格分开的满足pattern的单词，并用replacement替换他们。可能含有`%`作为通配符，表示匹配单词中的任意多个字符。如果replacement中出现了`%`，那么`%`会使用text中匹配的字符串替换。
   ```
   $(patsubst %.c,%.o,foo.c bar.c)
   ```

   patsubst还有缩写形式：
   ```
   $(var.pattern=replacement)
   ```
   等价于：
   ```
   $(patsubst pattern,replacement,$(var))
   ```
3. $(sort list)
   以字符顺序排序list中的单词，移除重复单词。输出是空格隔开的单词序列。
   例如：
   ```
   $(sort foo bar lose)
   ```
   的结果为：`bar foo lose`
### 条件处理的函数
有三种提供条件扩展的函数。函数的参数不会在初始化的时候扩展，而只会在需要扩展的时候扩展。

1. $(if condition,then-part[,else-part])
   condition的前后空格都会被去掉，然后扩展。如果扩展后的结果是非空字符串，认为是true，如果是空字符串，认为是false。

   如果condition为true，那么then-part会被扩展，并将其值作为if函数的值。

   如果condition为false，那么else-part会被扩展，并将其值作为if函数的值，如果没有else-part，返回空字符串。

### 用于文件名的函数
1. $(addprefix prefix,name...)
   name是一系列文件名，用空格分割。会将prefix添加到name中的每一个文件名的前面，结果是添加后的空格隔开的字符串。
2. $(wildcard pattern...)
   pattern是一个文件名pattern，一般包含通配符。wildcard函数的结果是空格隔开的一系列匹配pattern的文件名。pattern可以是空格隔开的多个规则。
3. $(basename names...)
   取出空格隔开的文件名中的除了去掉的值。
4. $(dir names...)
   提取names中每一个name的文件夹部分，包括最后的`/`。当前目录返回`./`。结果用空格隔开。

### origin函数
origin函数说明变量的来源。语法：
```
$(origin variable)
```
注意这里的variable是变量的名字，不带`$`。

origin函数可能返回的值：
* undefined：变量未定义
* default：内置的变量
* environment：从环境中继承并提供给make的变量
* environment override：从环境中继承，但是使用-e选项改写了
* file：makefile中定义
* command line：命令行中定义
* automatic：自动

### call函数
call函数可以用于创建新的函数，可以定义一个变量，通过call给该变量传参数将该变量扩展成不同的值。

语法：
```
$(call variable,param,param,...)
```
`$(1)`，`$(2)`...用于获取param的值。`$(0)`是variable。没有最大参数个数也没有最小参数个数。但是参数为0call函数就没有作用了，和普通变量没有区别。variable是变量的名字，没有开头的`$`，可以但是可以使用变量来扩展成其他变量的名字。

参数在赋值给临时变量前求值。

### eval函数
eval函数通过变量的方式创建新的makefile结构。意思就是，通过eval可以将一个动态的字符串（可以是变量或者函数的值）作为makefile来解析。eval函数的参数会被扩展，扩展的结果用makefile语法解析。扩展的结果中可以定义make变量、target、显式和隐式的规则。

语法：
```
$(eval argument)
```
eval函数的返回值始终是一个空字符串。

例如：
```
$(foreach prog,$(PROGRAMS),$(eval $(call PROGRAM_template,$(prog))))
```

要注意到eval参数会被扩展两次，第一次作为参数扩展一次。第二次作为make的语法扩展一次。

### foreach函数
语法：
```
$(foreach var,list,text)
```
第一个参数和第二个参数将在最开始扩展。var扩展后的值是临时变量的名字。list扩展后是一个空格隔开的列表。foreach会遍历list，将其值赋给名字为var扩展后的值的变量。text会在每次遍历的时候扩展，text中一般会引用var。

foreach函数的值是text扩展后通过空格隔开的列表。

## 9.如何运行make
一个makefile说明了如何重新编译一个程序。最简单的方式就是重新编译每一个过时的文件。当不带参数执行make的时候是这样的。

但是你也许想只编译一部分文件。可能对于不用的编译器使用不同的编译器选项。通过给make传递特定的选项可以做到这些。

### 构建目标
我们前面提到了对于makefiles中的rule，默认使用第一条rule，但是我们也可以通过环境变量或者make选项来设置默认的rule。例如通过`.DEFAULT_GOAL`变量可以设置默认的rule。


## 10.使用隐式规则
隐式规则告诉编译器如果使用常用的技术，可以让你需要使用这些技术的时候不用详细的指定它们。例如将C文件编译成.o文件是一种make常用的场景，make会有相应的隐式规则来将C文件编译成.o文件，例如使用cc命令等等。通过内置的环境变量我们可以控制隐式规则如何工作，比如使用CFLAGS变量改变传给C编译器的flags。

### 隐式规则使用的变量
通过内置的一些变量可以设置隐式规则。例如设置编译器选项等等。通过makefile中给变量赋值以及make命令参数可以改变这些变量。

隐式规则使用的变量分成两类：程序的名字（例如CC）以及程序的参数（例如CFLAGS）。

编译C语言程序主要就使用下面几个：
* CC，编译器命令名
* CFLAGS，编译器选项
* LDFLAG，链接连接器选项
* LDLIBS，链接器链接的库


### 如何使用？
看一个示例：
```
foo: foo.o bar.o
        cc -o foo.o bar.o $(CFLAGS) $(LDFLAGS)
```
这里使用中我们并写没有foo.o的rule，但是make会使用隐式规则自动编译得到foo.o。

make的隐式规则会根据源文件的类型自动选择合适的规则进行处理。

如果不想为一个没有recipe的target使用隐式规则，在recipe中使用`;`。

### 定义和重定义模式规则
模式规则就是在target中有%的规则。一个模式规则可能长这样：
```c
%.o:%.c; recipe...
```
#### 自动变量
如果我们要应用模式规则中的文件名怎么办呢？通过自动变量。例如通过`$@`来使用target文件名，通过`@<`来使用源文件名。

可用的自动变量如下：
* $@：target文件名。如果是一个模式匹配的target，那么是触发rule的那一个target
* $%：target成员名，当target是一个archive成员的时候
* %<：第一个prequisites的名字。如果target从隐式规则获取recipe，那么是隐式规则添加的第一个prerequisites
* $?：所有比target新的prerequisites的名字，用空格分开。
* $^：所有prerequisites的名字，空格隔开
* $|：order-only的prerequisites，空格分开
* ...

## 参考资料
[GNU make 文档](https://www.gnu.org/software/make/manual/make.html#Overview)