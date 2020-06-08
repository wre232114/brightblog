---
title: docker基础
date: 2020-03-26 21:59:00
tags:
- docker
- docker基础

category:
- docker
- docker基础
---


## 常见问题
最后一节收录了docker在开发，运行，部署中的常见问题。

### 解决镜像下载慢的问题
默认是使用国外的源，所以可能会出现提示找不到服务器或者下载很慢的问题，该问题可以通过将源配置成国内的镜像来解决。步骤如下：
1. 修改docker的配置，进入`/etc/docker`，找到`daemon.json`文件，如果没有则新建，有则修改。
2. 在`daemon.json`中添加以下内容：
   ```
   {
    "registry-mirrors": ["https://registry.docker-cn.com","http://hub-mirror.c.163.com"]
   }   
   ```
3. 保存，重启docker服务

### 解决启动warm服务时出现verify: Detected task failure的问题
出现这个可能是容器启动失败，容器启动失败后会自动重启，所以一直停留在这个界面。容器启动失败的原因可以通过日志查看。

例如：启动mysql服务器后，出现verify: Detected task failure。此时查看日志`docker service logs mysql-reader -f`，得到输出
```
mysql-reader.1.k005669t522s@instance-3h97b0st    | 2020-03-27 00:20:11+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 5.7.29-1debian10 started.
mysql-reader.1.k005669t522s@instance-3h97b0st    | 2020-03-27 00:20:11+00:00 [Note] [Entrypoint]: Switching to dedicated user 'mysql'
mysql-reader.1.k005669t522s@instance-3h97b0st    | 2020-03-27 00:20:11+00:00 [Note] [Entrypoint]: Entrypoint script for MySQL Server 5.7.29-1debian10 started.
mysql-reader.1.k005669t522s@instance-3h97b0st    | 2020-03-27 00:20:11+00:00 [ERROR] [Entrypoint]: Database is uninitialized and password option is not specified
mysql-reader.1.k005669t522s@instance-3h97b0st    | 	You need to specify one of MYSQL_ROOT_PASSWORD, MYSQL_ALLOW_EMPTY_PASSWORD and MYSQL_RANDOM_ROOT_PASSWORD
```
看到了提示，需要明确`MYSQL_ROOT_PASSWORD, MYSQL_ALLOW_EMPTY_PASSWORD and MYSQL_RANDOM_ROOT_PASSWORD`着三个环境变量中的任何一个。**所以解决方案是，启动的时候设置环境变量，如下：**

添加-e参数：`docker service create --name mysql-reader --replicas 1 -e MYSQL_ROOT_PASSWORD=Abc123456! --constraint node.labels.name==baiduyun mysql:5.7`。

### redis自定义配置文件的问题
通过`docker config`新增配置文件，通过service，加载配置文件然后启动，注意，这里启动失败可能是配置文件有问题。

