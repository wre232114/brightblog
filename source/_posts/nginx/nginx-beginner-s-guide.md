---
title: nginx入门教程
date: 2019-05-24 16:05:24
categories: nginx
---

这篇教程给出了一个nginx的基本介绍以及描述了nginx可以完成的一些基本任务。这里假定读者的设备中已经安装了nginx。如果没有，请查看[安装nginx](http://nginx.org/en/docs/install.html)。这篇教程描述了怎样启动和停止eginx，以及重新读取配置文件，解释配置的结构并且说明怎样设置nginx来服务静态内容，怎样配置nginx作为代理服务器，以及怎样用FastCGI程序连接它。

nginx有一个主进程和若干工作进程。主进程的主要目的是读取和分析配置以及维护工作进程。工作进程处理真实的请求。nginx使用基于事件的模型和依赖OS的机制来高效地在工作进程中分发请求。工作进程的数量定义在配置文件中并且可以固定在一个给定的配置中或者根据可用的CPU核心来自动调整。

nginx和其模块工作的方式决定于配置文件。默认配置文件被命名为nginx.conf并且被放置在目录/usr/local/nginx/conf，/etc/nginx，或者/usr/local/etc/nginx下。

## 启动、停止以及重载配置

运行可执行文件来启动nginx。一旦nginx被启动了，它可以enginx命令使用-s参数来控制。使用下面的语法：

> nginx -s signal

signal可选的值如下：

* stop -- 快速关闭
* quit -- 优雅地关闭
* reload -- 重新读取配置文件
* reopren -- 重新打开日志文件

例如，为了在等待所有的工作进程完成当前请求后关闭nginx进程，下面的执行被执行：

> nginx -s quit    # 这条命令应该由其定nginx的相同用户来执行

在重新读取配置文件的命令被发送给nginx或者nginx重启之前，在配置文件中所作的更改不会被应用。重载配置请执行：

> nginx -s reload

一旦主进程受到了重载配置的信号，它会检查新配置文件的语法合法性并且会尝试使用新配置。如果成功应用新配置，主进程开启新的工作进程并且向老的工作进程发送信息，请求他们关闭。否则，主进程会回滚改变并且继续使用旧的配置工作。旧的工作进程，受到关闭的命令，停止接受新的连接并且继续服务当前的请求知道所有请求都被处理了。在此之后，就的工作进程退出。

也可以通过Unix tool的帮助。比如kill命令来向nginx进程发送信号。在这个样例中使用一个给定的进程ID，信号被直接发送给进程。nginx主进程的进程id被默认写在目录/usr/local/nginx/logs或者/var/run下的nginx的pid.conf下。

例如，如果主进程ID是1628，为了发送信号使得nginx优雅地退出，执行：

> kill -s QUIT 1628

为了得到所有正在运行的nginx进程列表，ps命令被使用：

> ps -ax | grep nginx

关于向nginx发送信号的更多信息，请查看[控制nginx](http://nginx.org/en/docs/control.html)

## 配置文件的结构

nginx由模块组成，在配置文件中的指令控制这些模块。指令分为简单指令和块指令。一个简单指令由名字和参数组成，名字和参数中间由空格分离，结尾使用分号（;）。一个块指令和简单指令有一样的结构，但是它使用大括号({})包括一系列的额外指令而不是使用分号。如果一个块指令可以在其中包含其他的块指令，它被称做上下文（例如：[events](http://nginx.org/en/docs/ngx_core_module.html#events)，[http](http://nginx.org/en/docs/http/ngx_http_core_module.html#http)，[server](http://nginx.org/en/docs/http/ngx_http_core_module.html#server)，[location](http://nginx.org/en/docs/http/ngx_http_core_module.html#location)）

被放在配置文件任何上下文之外的指令被当作是主上下文。events和http指令在主上下文中，server在http中，location在server中。

一行中在#后的所有符号都被认为是注释。

```
http {
    server {
         location / {
             root   html; #站点目录
             index  index.html index.htm;
         }
     }
     server {
         location /images {
         	
         }
     }
 }
```

## 服务静态内容

```
server {
    location / {
        root /data/www;
    }

    location /images/ {
        root /data;
    }
}
```

如上例，我们在访问/或者images时就能够访问到对应的静态资源。例如我们输入：

> http://localhost:8080/test.png 这会被定位到服务器上的文件：
>
> /data/www/test.png

有时候服务器出错了但是不知道是为什么，可以通过查看access log和error log来定位错误。在配置文件中指定了文件位置。

## 设置代理服务器

nginx最常用的使用场景是作为代理服务器，代理服务器是指接收请求，然后将他们转到代理服务器，然后从代理服务器收到内容然后在发送给请求的客户端。

首先，通过一个或者多个server块到nginx的配置文件中定义代理服务器：

```
server {
    listen 8080;
    root /data/up1;
    
    location / {
    
    }
}
```

这是一个简单的监听8080端口的服务器。root指令被放在了server上下文中，当location没有root指令是该指令会被使用。

使用proxy_pass指令来实现代理功能，如下：

```
server {
    location / {
    	proxy_pass http://localhost:8080;
    }
}
```

location指定的路径可以是一个正则表达式。