---
title: centos 7下安装wireshark
date: 2019-10-02 17:39:01
tags:
- 计算机网络
- wireshark

category:
- 计算机网络
- wireshark
---
wireshark是一款可以对网卡进行抓包的软件，能获取到网卡上收到的二进制数据，可以分析到达主机的网络包，分析其使用的协议，内容等等。这篇文章我们介绍如何在centos 7下安装wireshark。

## 安装
```shell
> yum install wireshark
> yum install wireshark-gnome
```

## 解决权限问题
安装完成后打开软件提示权限不允许，这时候需要将`/usr/sbin/dumpcap`添加到用户所在的组中，例如：
```shell
sudo chgrp /usr/sbin/dumpcap bright
```

执行完成后有权限访问了，但是没有接口，开启接口执行下面的命令：
```shell
setcap cap_net_raw,cap_net_admin+eip /usr/sbin/dumpcap
```