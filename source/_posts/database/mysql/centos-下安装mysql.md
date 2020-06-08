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

安装完成后，启动mysql。**如果提示没有找不到安装包，说明默认的git仓库中没有mysql-community-server这个软件包，解决方案有两个，第一个是直接去mysql官网下载安装包，然后用`yum localinstall`来按照；第二个是添加有mysql-community-server的仓库；第三种是参考官方网站上的安装教程，官方给出了包含安装仓库和密钥的rpm包。下面给出官方示例：**

1. 下载仓库rpm：`wget https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm`
2. 本地安装rpm：`yum localinstall mysql80-community-release-el7-3.noarch.rpm`
3. 安装mymsql-server：`yum install -y mysql-community-server`

【官方教程地址】(https://dev.mysql.com/doc/refman/8.0/en/linux-installation-yum-repo.html)

保存后重新执行`yum install mysql-community-server`就可以了。

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

### 修改默认密码
使用默认密码登陆mysql：
> mysql -u root -p
> # 输入默认密码

然后必须修改默认密码才能进行操作，修改默认密码输入如下指令：
> alter user 'root'@'localhost' identified by '密码';