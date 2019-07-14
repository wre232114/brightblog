---
title: package.json详解
date: 2019-07-04 06:45:56
tags:
- node.js
- npm

category:
- node.js
- npm
---

package.json是nodejs的包管理工具npm的配置文件，package.json文件的内容必须是json格式，而不是一个javascript对象。这篇文章详解package.json里面的所有配置属性。

## 创建package.json文件
> npm init

执行上面的命令会出现命令行交互问卷，让你逐个填入各个字段的值。也可以使用下面的命令，使用默认的package.json文件
> npm init --yes

## 定制package.json问卷（！命令行工具常用）
如果你希望创建多个package.json文件，定制自己的init问题和域，生成定制的package.json文件，使用下面的步骤：
1. 在home目录添加.npminit.js文件
2. 如果要添加自定义的问题，使用
   >  module.exports = prompt("what's your favorite flavor of ice cream, buddy?", "I LIKE THEM ALL");
3. 如果要添加自定义的域，使用：
   ```js
   module.exports = {
    customField: 'Example custom field',
    otherCustomField: 'This example field is really cool'
   }
   ```

## package.json中的字段
### 必须的name和version字段
name是npm包的名字，install的时候使用的是name，version是包的版本，这两者是必须的。

### 默认package.json中的全部字段
* name: 当前目录/项目的名字
* version: 版本号，always 1.0.0
* description: info from the README, or an empty string ""
* main: 包的入口，always index.js
* scripts: npm run命令的脚本，by default creates an empty test script
* keywords: 关键词，empty
* author: 作者，empty
* license: ISC
* bugs: information from the current directory, if present
* homepage: information from the current directory, if present

## package.json中的所有字段
没有特殊说明的字段取值都是字符串
字段名|描述|备注
:---:|:---:|:---:
name|项目名称|小于等于214个字符，不要和node核心模块重名，不要使用node或者js
version|项目版本|使用语义化版本，和name一起决定某一个包的特定版本
description|项目描述|
keywords|关键字|
homepage|项目主页|一个url链接
bugs|报告bug的url或者email|可以是github的issue
license|授权协议|选择的开源协议名称
author|作者|值可以是一个对象，这个对象包含name、url、email
contributors|贡献者|一个数组，包含多个作者的信息
**files**|包含的文件|可以是文件、目录或者glob（*\*/\*,    \*），默认是\*（包含所有文件），当你的包作为依赖时，这个属性决定哪些文件被安装
**main**|项目的入口文件|直接的说，就是其他的用户require你的包的时候，加载哪一个文件，例如require('foo')，那么加载的是foo项目下main字段指定的文件
browser|用于浏览器端???|???不太懂有什么用
**bin**|将npm包作为可执行的命令行程序|bin字段可以填入一个对象{'name':'path'}或者字符串'./example/program.js'，只有一个字符串的时候命令行程序的名字和项目的name一致；有多个可执行的命令时，使用对象语法。
man|使用man命令查看文档时的文档|可以是一个文件或者数组文件。