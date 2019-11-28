---
title: centos7 下升级gcc编译器
date: 2019-11-11 10:20:21
tags:
- 编程语言
- C语言
- GCC

category:
- 编程语言
- C语言
---
只支持64位程序。

```shell
yum -y install centos-release-scl
yum -y install devtoolset-8-gcc devtoolset-8-gcc-c++ devtoolset-8-binutils
```
高版本gcc不是默认开启的，如果只想在当前命令行中使用，输入：
```shell
scl enable devtooset-8 bash
```

如果想永久开启，以管理员权限执行：
```shell
echo "source /opt/rh/devtoolset-8/enable" >>/etc/profile
echo "source /etc/profile" >>~/.bashrc
```