---
title: centos下安装mysql5.7
date: 2019-08-10 08:05:55
tags:
- 数据库
- mysql

category:
- 数据库
- mysql
---

## 安装mysql
这篇文章记录了下centos7下安装mysql5.7的详细过程。

centos7下默认的仓库是没有mysql的安装包的，所以我们首先要添加mysql官方的仓库，执行如下命令：

> wget -i -c http://dev.mysql.com/get/mysql57-community-release-el7-10.noarch.rpm

安装这个包:
> rpm -i mysql57-community-release-el7-10.noarch.rpm

然后执行下面的命令安装mysql server：
> yum -y install mysql-community-server

等待命令执行完成。

## 配置mysql
安装完mysql后，mysql默认是不会启动的，所以我们在控制台输入mysql命令，会报错。接下来我们手动启动mysql服务，并添加到开机自启动。

启动mysql服务：
> systemctl start mysqld.service

然后执行：
> systemctl status mysqld.service

如果看到输出中提示mysql server处于running中，说明mysql启动成功。mysql启动后会有一个默认的密码，我们要找出这个默认的密码，输入：
> grep "password" /var/log/mysqld.log

结果如图：
![默认密码](/img/mysql默认密码.png)

