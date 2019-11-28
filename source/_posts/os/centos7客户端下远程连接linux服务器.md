---
title: centos7客户端下远程连接linux服务器
date: 2019-11-19 16:36:15
tags:
- centos7工具
- ssh
- linux远程连接

category:
- linux
- 工具
---
在windows常用putty等工具远程连接服务器，那么在linux下用什么工具呢？还有linux下如何远程连接另一台linux服务器上的myql呢？这篇文章学习这两个知识点。

最简单的就是使用ssh，输入命令：
```shell
ssh ip地址 -l 用户名
```
如果没有配置公钥，会让用户名对应的密码，密码正确就能正常登陆了。

下面介绍一下ssh工具的使用。

## ssh简介



## centos7远程连接mysql
首先要保证自己安装了mysql客户端，输入：
```shell
mysql --version
```

mysql客户端自带远程连接的功能，通过-h选项指定host，-u指定登陆的用户名：
```shell
mysql -h 39.106.12.37 -u exploit -p
```
输入密码即可远程登陆。

### 使用图形化的管理工具
那centos 7下如何使用workbench等图形化工具来管理mysql呢？

需要额外安装mysql-workbench，输入如下命令：
```shell
yum install -y mysql-workbench
```

安装完成之后，输入命令mysql-workbench启动，或者在应用程序列表中搜索workbench点击图标启动。