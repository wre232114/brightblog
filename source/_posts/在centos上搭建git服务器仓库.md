# 在centos上搭建git服务器仓库

## 1. 安装git

首先查看有没有安装git，输入：

> git --version

如果没有显示“git is not a command”，则说明已经安装了git，跳过此步。

如果没有安装git，则需要安装git：

> yum install git

如果觉得这样安装的git版本太低，可以再查一下如何升级git。



## 2. 添加git用户/组

> groupadd git
>
> useradd git -g git



## 3. 创建git访问权限文件

git需要在/home/git/.ssh目录下创建authorized-keys文件来管理允许访问的客户端，并配置相关的权限：

> cd /home/git
>
> mkdir .ssh
>
> touch .ssh/authorized-keys
>
> chmod 700 .ssh
>
> chmod 600 .ssh/authorized-keys

authorized-keys用来存放允许连接的客户端的公钥，也就是说如果你想某一个客户端可以在这个仓库上pull或者push，需要将客户端的公钥复制到authorized-keys中，每一个公钥占单独的一行。



## 4. 创建git仓库

假定git仓库都放在/data/gitrepo目录下：

> mkdir /data/gitrepo
>
> cd /data/gitrepo
>
> git init --bare test.git
>
> chown -R git:git test.git

到这里我们就已经完成了创建服务器端的git仓库，如果我们要从这个仓库拉代码下来，使用：

> git clone git@ip地址/网址:/data/gitrepo/test.git



## 5. 实现免密pull或者push

这时候我们可能发现git pull或者push的时候仍然需要输入服务器的密码。如何才能实现免密传输呢？我这里先给一个解决方案，如果不行大家可以搜索“如何免密ssh登陆？”。

### 5.1 更改ssh配置

首先更改sshd的配置，这里可以配置服务器的远程登陆方式，可以有密码，公钥等的登陆方式。输入：

> sudo vim /etc/ssh/sshd_config

然后更改下列配置：

> StrictModes no
>
> RSAAuthentication yes
>
> PubkeyAuthentication yes
>
> AuthorizedKeysFile .ssh/authorized-keys

然后重启：

> service sshd restart

### 5.2 将客户端的公钥添加到git服务器的authorized-keys文件中

有两种方式

1. 使用ssh-copy-id

   > ssh-copy-id -i ~/.ssh/id_rsa.pub git@你的域名或者ip地址

2. 直接将你的客户端的公钥添加到authorized_keys文件中