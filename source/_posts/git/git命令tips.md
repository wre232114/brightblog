---
title: git命令tips
date: 2019-07-18 07:10:01
tags: git
category: git
---
下面对一些常用的git命令/特性做一些总结

## 分支管理相关
### 新建分支
<code>git checkout -b [branchname]</code>：该命令是下面两条命令的简写：
```bash
git branch [branchname]
git checkout [branchname]
```
如果只是新建分支而不切换过去，使用git branch [branchname]

### 删除分支
git branch -d [branchname]，如果有未提交的修改，-d选项会失败，如果要强制删除，使用-D选项

### 切换分支
git checkout [branchname]

### 合并分支
git merge [branchname]

该命令会将[branchname]合并到当前所在的分支。合并的方式有好几种，一种是快进（fast-forward），当前分支是合并的分支的上游的时候采用这种形式，如下：
```
            master      hotfix
                \           \
---commit1----commit2----commit3
```
当hotfix合并到master时，就会采用fast-forward方式进行合并。

还有一种方式是三方合并，当前分支和被合并的分支在某一个记录后分岔，如下：
```
                       master
                          \
----commit1----commit2----commit3
                  \
                  commit4----commit5
                                \
                              hotfix
                          ||
                          \/合并后

                      old-master         master
                          \                 \
----commit1----commit2----commit3--------commit6
                  \                      /
                  commit4----commit5-----
                                \
                              hotfix
```
合并时会先找到最近的共同父节点，然后进行合并，合并之后会有一个合并提交（commit6），该提交有两个父提交。

#### 分支合并时的冲突解决
在不同提交中对同一个文件的同一个部分进行了修改，合并时就会产生冲突。git会自动将有冲突的部分都保留，并用特殊的标记记录冲突的位置（HEAD<=====）。

git遇到冲突会停下来，有冲突的文件的状态是unmerged。我们需要手动修改冲突文件，解决掉冲突，然后再执行git add和git commit来将合并进行手动提交。

## git diff
git diff命令比较的是工作目录中当前文件和暂存区域快照之间的差异，也就是修改之后还没有暂存起来的变化。

也就是说，在git add .之后，我们再运行git diff，没有任何结果。如果我们希望比较暂存区和某一次commit，使用--cached选项

## git remote
1. git remote -v，查看当前项目的所有远程git仓库。
2. git remote add \<shortname\> \<url\>，添加远程仓库。shortname是对远程仓库的简写，例如设置成origin，当使用origin的时候，指向的就是对应的url，对应的仓库。
3. git fetch [remote-name]，从任意远程仓库拉取，会合并到本地仓库中，不会修改工作区里面的内容。同时会更新远程仓库的引用。如果要从服务器拉取一个新的分支下来，使用git fetch而不是git pull，因为git pull不仅会拉取分支，而且会自动merge到当前分支。除非我们明确拉取的同时进行合并，否则一律使用git fetch。

## 远程分支相关
1. git fetch [remote-name]，会设置远程分支
2. git pull会试图从远程分支拉取代码，并合并到当前分支
3. git checkout --track origin/name会试图切换到name分支，并将origin/name作为其远程分支。也可以使用git checkout -b myname origin/name，这会在本地新建一个myname分支，并将origin/name作为其远程分支。
4. git branch -u orgin/name [branchname]或者git branch --set-upstream-to=origin/name [branchname]，若branchname为空，则默认为当前分支。
5. git push origin localbranch:serverbranch，将本地的localbranch分支推送到远程的serverbranch分支，如果远程没有serverbranch分支，会自动在远程新建一个。使用-d选项可以删除远程分支。

## 服务器上的git
### 协议
git可以使用4种主要的协议来传输资料：本地协议、HTTP协议、SSH协议及git协议：
* 本地协议就是直接访问文件系统，大家在一个共享的文件系统中工作
* HTTP协议有智能HTTP协议和哑HTTP协议，智能HTTP协议运行在标准的HTTP/S端口上并且可以使用各种HTTP验证机制，用一个URL就能包含授权、加密解密等功能。哑HTTP协议就是一个HTTPweb服务，web服务器将git仓库当作普通文件来处理，设置git自带的post-update钩子就能正常工作。
* SSH协议：架设Git服务器的时候常用SSH协议作为传输协议。SSH是一个验证授权的网络协议。可以使用ssh协议的url：git clone ssh://user@server/project.git，也可以使用git clone user@server:project.git（平时看到的git@github.com:test.git）就是这么来的。
* git协议：监听一个特定的端口（9418），类似于SSH服务。但是没有授权机制，一旦开发推送，所有人都可以向项目推送数据。

### 在服务器上搭建git
1. 在开始假设Git服务器前，需要把现有仓库导出为裸仓库——即一个不包含当前工作目录的仓库。裸仓库是不包含工作区的，只有.git文件夹
   > git init --bare [directory]

2. 把裸仓库放到服务器上，通过ssh可以访问。可以有多用户推送同一个仓库，只要用户对于git所在的目录有可写的权限。
3. 只要能通过ssh链接到服务器，并且就能拉取仓库；如果ssh登陆的账户还有写权限，那么就可以向仓库推送。