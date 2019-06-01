---
title: centos 下安装mysql
date: 2019-05-24 22:34:33
tags:
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

前提是远程数据库要开启允许远程连接，如何开启请百度。