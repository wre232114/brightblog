---
title: centos7 下安装jdk
date: 2019-11-08 15:31:30
tags:
- 编程语言
- Java

category:
- 编程语言
- Java
---
首先查看是否安装了jdk，输入命令：
```shell
java -version
```
如果输出了版本号，说明安装了java。

再输入命令：
```shell
javac
```

如果没有提示错误，曾说明java已正确安装。如果没有安装java，或者值有java或者javac，请看下面。

## 仅有java命令
如果仅有java命令，那么很可能是安装了java运行环境而没有安装java开发环境。解决方案是先卸载原先安装的java。在安装新的，以java8为例。

### 查看系统中已有的java版本
```shell
yum list installed | grep java
```
可能输出如下信息：
```shell
java-1.8.0-openjdk.x86_64                 1:1.8.0.232.b09-0.el7_7    @updates   
java-1.8.0-openjdk-accessibility.x86_64   1:1.8.0.232.b09-0.el7_7    @updates   
java-1.8.0-openjdk-accessibility-debug.x86_64
java-1.8.0-openjdk-debug.x86_64           1:1.8.0.232.b09-0.el7_7    @updates   
java-1.8.0-openjdk-demo.x86_64            1:1.8.0.232.b09-0.el7_7    @updates   
java-1.8.0-openjdk-demo-debug.x86_64      1:1.8.0.232.b09-0.el7_7    @updates   
java-1.8.0-openjdk-devel.x86_64           1:1.8.0.232.b09-0.el7_7    @updates   
java-1.8.0-openjdk-devel-debug.x86_64     1:1.8.0.232.b09-0.el7_7    @updates   
java-1.8.0-openjdk-headless.x86_64        1:1.8.0.232.b09-0.el7_7    @updates   
java-1.8.0-openjdk-headless-debug.x86_64  1:1.8.0.232.b09-0.el7_7    @updates   
java-1.8.0-openjdk-javadoc.noarch         1:1.8.0.232.b09-0.el7_7    @updates   
java-1.8.0-openjdk-javadoc-debug.noarch   1:1.8.0.232.b09-0.el7_7    @updates   
java-1.8.0-openjdk-javadoc-zip.noarch     1:1.8.0.232.b09-0.el7_7    @updates   
java-1.8.0-openjdk-javadoc-zip-debug.noarch
java-1.8.0-openjdk-src.x86_64             1:1.8.0.232.b09-0.el7_7    @updates   
java-1.8.0-openjdk-src-debug.x86_64       1:1.8.0.232.b09-0.el7_7    @updates   
java-atk-wrapper.x86_64                   0.30.4-5.el7               @base      
javapackages-tools.noarch                 3.4.1-11.el7               @base      
python-javapackages.noarch                3.4.1-11.el7               @base      
tzdata-java.noarch                        2019c-1.el7                @updates  
```
### 卸载已安装的java
```shell
yum -y remove java-1.8.0-openjdk*
```
`java-1.8.0-openjdk*`是要卸载的包的名字，*是通配符，根据上面yum list的输出来具体确定哪些包。

### 安装java
```shell
yum install -y java-1.8.0-openjdk*
```
上面的命令安装java 1.8，也可以指定其他的版本。

接下来分别执行java、javac，看看输出，如果都有输出，说明java环境正确安装了。

如果没有呢，看看java环境有没有正确配置。首先yum安装的java会在/usr/lib/jvm下，找到java和javac对应的二进制文件，将其配置到path中。然后在path中添加JAVA_HOME和CLASSPATH环境变量。


## 没有java命令
直接安装java：
```shell
yum install -y java-1.8.0-openjdk*
```
在path中添加JAVA_HOME和CLASSPATH环境变量。
```shell
cd ~
vim .bashrc
# 按i，然后在最后面添加下面的内容
export JAVA_HOME="/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.232.b09-0.el7_7.x86_64/jre"
export CLASSPATH="."
```
注意java_home要根据安装的java版本来设置。
