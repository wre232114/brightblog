---
title: centos7下安装maven以及修改maven仓库设置
date: 2019-11-19 17:29:15
tags:
- 编程语言
- Java
- Maven

category:
- 编程语言
- java
---
默认的Maven仓库因为镜像在国外，下载是在是太慢，这篇文章介绍一下如何修改maven仓库为国内的镜像，适用于centos7。

## 安装maven
```shell
sudo yum install -y maven
```

## 配置maven仓库
输入：`whereis maven`，
可能输出：
```
/usr/maven
```

输入以下命令：
```shell
cd /usr/maven
sudo vim settings.xml
```
找到`<mirrors>`，然后输入下面的内容：
```
<mirror>  
  <id>alimaven</id>  
  <name>aliyun maven</name>  
  <url>http://maven.aliyun.com/nexus/content/groups/public/</url>  
  <mirrorOf>central</mirrorOf>          
</mirror>
```

### 单个项目配置
对于单个项目，可以在pom.xml设置：
```xml
<repositories>
  <repository>
    <id>alimaven</id>
    <name>aliyun maven</name>
    <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
  </repository>
</repositories>
```
注意`<repositories>`和`<dependencies>`同级。