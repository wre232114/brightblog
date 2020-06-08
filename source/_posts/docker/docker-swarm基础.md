---
title: docker swarm基础
date: 2020-03-26 10:02:45
tags:
- docker
- docker swarm

category:
- docker
- docker swarm
---
Docker的基础知识在另一系列文章中，![docker基础](#)。这一篇文章主要介绍docker swarm的基础知识，包括docker swarm的基础概念，如何使用docker swarm进行集群部署。

## 概览
当前版本（19）的Docker包含了用于swarm集群的swarm模式，通过docker cli就可以创建一个swarm、发布部署到swarm、控制swarm的行为。

Swarm有如下亮点：
* **与docker engine集成的集群管理**：通过docker cli就可以创建和控制集群
* **去中心化设计**：通过docker engine了一在一台机器上部署任意类型的节点、manager或者workers。
* **声明式的服务模型**：可以在docker中利用声明式的方式为应用程序配置多种不同的服务，例如前端和后端。
* **扩容**：对于每一个服务，可以指定任意多个任务，swarm会根据配置自动添加或者减少任务
* **理想的状态调和**：例如需要10份拷贝，但是有两份挂了，swarm会自动生成两份新的拷贝
* **多主机网络**：对于服务可以指定一个覆盖网络，swarm会自动在启动或者更新的时候为网络中的容器分配地址
* **服务发现**：swarm manager为每一个服务分配独特的dns名称以及负载均衡容器。通过swarm内嵌的dns服务器可以查询swarm中运行的任意一个容器
* **负载均衡**
* **默认的安全策略**：swarm中的每一个节点强制TLS相互认证和加密，可以使用本地的证书或者CA提供的证书
* **滚动更新**：可以滚动更新节点，出错可以回滚

## swarm mode的关键概念
一个swarm由运行在swarm模式并且作为manager或worker的多个Docker主机组成，一个给定的Docker主机可以是manager、worker或者两者都是。

> docker swarm join --token SWMTKN-1-02lxm9l0xnjvb6p8a0623gw4yd41ckh53mhs4kcupqiskk63ku-4l1u2h45oh77sbg6u85rr19am 106.12.110.215:2377


## docker swarm的routing mesh策略
docker swarm的routing mesh允许用户从集群上的任意一台机器上通过服务开放的端口来访问服务，这意味这swarm上的所有服务对外开放的端口应该是不同的，例如我想启动两个mysql服务，一个用于写，一个用于读，那么这两个服务的开放端口应该不一样，例如读使用3306，而写使用3307.

参考：https://docs.docker.com/engine/swarm/ingress/

如果希望能够绕过routing mesh策略，例如两个mysql容器部署在两台机器上，想直接通过ip和端口直接定位到具体的mysql服务器，而不通过docker的routing mesh策略，那么需要将mysql容器的service的端口设置成host模式。如下：
```
docker service create --name mysql-writer -e MYSQL_ROOT_PASSWORD=B123. --publish published=3307,target=3306,mode=host --mode global --config source=my-writer.cnf,target=/etc/mysql/my.cnf mysql:5.7
```

## docker service的配置信息
当我们使用一个mysql容器的时候，有时候需要修改配置文件。但是mysql容器并没有提供vim、vi等文本编辑工具、也没有yum等命令，不能直接修改配置文件。如果直接使用`docker cp`从主机拷贝配置文件到容器，需要重启服务，重启mysql后容器也会重启，镜像的配置又会覆盖调`docker cp`的配置文件，简单来说就是这种方式也行不同。

如果是在单独的容器中使用，可以在`docker run`的时候使用`-v`参数挂载配置文件目录到指定的配置文件目录下，这样可以自定义配置文件并生效。

但是如果在swarm的service中，上述方式又行不通了，因为swarm的service是由manager启动的，并不能提供挂载的能力。那应该怎么办呢？幸好service提供了能够自定义配置文件的能力，参考[Store configuration data using Docker Configs](https://docs.docker.com/engine/swarm/configs/)。通过`docker config`创建配置文件，然后在service启动的时候通过`--config`参数将配置传给指定的容器。

## 限制service的分配
如果相让service在指定的node上执行，需要进行两部操作：
1. 为节点分配label，例如`docker node update --label-add bar=baz node-1`
2. service create的时候添加`--constraint node.labels.{name}`选项

## 创建私有的registry并在docker上运行
资料：https://docs.docker.com/registry/deploying/