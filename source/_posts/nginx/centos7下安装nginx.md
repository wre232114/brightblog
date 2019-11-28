---
title: centos7下安装nginx
date: 2019-11-20 16:00:03
tags:
- nginx

category:
- nginx
---
这篇文章学习如何再centos 7下安装nignx，并分析安装后nginx目录中的各配置文件及作用。

## 安装nginx
```shell
sudo yum install -y nginx
```
如果找不到，那么就是设置的repo中没有nginx，参考[官方安装教程](http://nginx.org/en/linux_packages.html)

安装完成后，输入：`nginx -v`，如果正确输出版本，则nginx安装成功。

centos 7下，nginx的配置文件默认放在`/etc/nginx`下。如果没有的话，试试下面几个目录：`/usr/local/nginx/conf`，`/etc/nginx`，或者`/usr/local/etc/nginx`下。

## 配置文件目录解析