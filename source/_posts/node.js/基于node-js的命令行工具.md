---
title: 基于node.js的命令行工具
date: 2019-07-04 08:07:01
tags:
- node.js
- 命令行工具

category:
- node.js
- 命令行工具
---
<!-- webpack-dev-server、cli-service、vue相关的依赖等，可以提取到共用目录的，不放在每一个项目的package.json中，每一个项目的package.json只放与改项目相关的，特有的依赖，分模块打包，按需引入，每一个项目只加载需要的全局依赖，自定义的依赖放在自己目录下的node modules下 -->
基于node.js编写命令行工具是非常方便的，有很多现有的工具和库能够帮助我们实现。接下来我们着手编写一个自己的命令行工具。

## 依赖分析
我们首先要分析我们可以利用哪些第三方的工具。先看看其他的cli工具用了哪些工具，比如vue-cli：
```json
"dependencies": {
    "@vue/cli-shared-utils": "^4.0.0-alpha.2",
    "@vue/cli-ui": "^4.0.0-alpha.2",
    "@vue/cli-ui-addon-webpack": "^4.0.0-alpha.2",
    "@vue/cli-ui-addon-widgets": "^4.0.0-alpha.2",
    "chalk": "^2.4.1",
    "cmd-shim": "^2.0.2",
    "commander": "^2.20.0",
    "debug": "^4.1.0",
    "deepmerge": "^3.2.0",
    "didyoumean": "^1.2.1",
    "download-git-repo": "^1.0.2",
    "ejs": "^2.6.1",
    "envinfo": "^7.2.0",
    "execa": "^1.0.0",
    "fs-extra": "^7.0.1",
    "globby": "^9.2.0",
    "import-global": "^0.1.0",
    "inquirer": "^6.3.1",
    "isbinaryfile": "^4.0.0",
    "javascript-stringify": "^1.6.0",
    "js-yaml": "^3.13.1",
    "jscodeshift": "^0.6.4",
    "lodash.clonedeep": "^4.5.0",
    "lru-cache": "^5.1.1",
    "minimist": "^1.2.0",
    "recast": "^0.18.1",
    "request": "^2.87.0",
    "request-promise-native": "^1.0.7",
    "resolve": "^1.10.1",
    "semver": "^6.1.0",
    "shortid": "^2.2.11",
    "slash": "^3.0.0",
    "validate-npm-package-name": "^3.0.0",
    "vue-jscodeshift-adapter": "^2.0.2",
    "yaml-front-matter": "^3.4.1"
  }
```
查了一下各种依赖的文档，总结一下我们需要的依赖，下面列出是必须的，其他的根据需要添加：
* chalk：终端文字样式，我们在命令行中看到的各种颜色的文字可以用这个工具来实现
* commander：命令行工具包，可以帮助我们解析命令行参数，输出帮助信息等等
* Inquirer.js：交互式的命令行用户接口，主要用于和用户交互


上面的工具可以帮助我们快速的创建命令行工具，但是要让程序能够在命令行中执行，被安装到path中，我们还需要npm提供的bin字段，它能非常简单的帮我们执行命令行脚本，全局安装时，它会将命令安装到PATH中，局部安装时，它会将命令安装到.nodemodules/.bin/下面。
```json
{ "name": "my-program"
, "version": "1.2.5"
, "bin": "./path/to/program" }
```
注意：bin指定的程序需要使用第一行必须是'#!/usr/bin/env node'，否则node不会正常执行

## 模块分析
我们完成了依赖分析之后，知道了我们可以用哪些工具来开发命令行程序，接下面我们分析我们的程序模块。
