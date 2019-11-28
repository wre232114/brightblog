---
title: centos7 下升级git
date: 2019-11-11 10:38:14
tags: git
category: git
---
## 安装所需要的依赖包
```shell
yum install curl-devel expat-devel gettext-devel openssl-devel zlib-devel 
yum install gcc perl-ExtUtils-MakeMaker
```
## 删除已有的git
```shell
yum remove -y git*
```
## 下载安装
```shell
cd /usr/src
wget https://www.kernel.org/pub/software/scm/git/git-2.7.3.tar.gz 
tar xzf git-2.7.3.tar.gz
cd git-2.7.3
make prefix=/usr/local/git all
make prefix=/usr/local/git install
# 创建软连接
cd /usr/bin
ln -s  /usr/local/git/bin/git git
```

## 检查版本
`git --version`，如果输出的版本号是2.7.3说明安装成功