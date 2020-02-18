---
title: centos 下安装mysql
date: 2019-05-24 22:34:33
tags:
- 数据库
- mysql

category:
- 数据库
- mysql
---
## 安装client
> yum install mysql

这会安装client，这时如果输入mysql，会显示：
> ERROR 2002 (HY000): Can't connect to local MySQL server through socket '/var/lib/mysql/mysql.sock' (2)

查了一下，发现并没有/var/lib/mysql/mysql.sock这个文件，可能是并没有安装mysql-server。

接下来我们我们安装server

## 安装server
> yum install mysql-community-server

安装完成后，启动mysql。

> service mysqld start

完成安装。

## mysql client连接远程数据库
> mysql -h 远程地址 -u root -p

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