---
title: vue基础：vue-cli
date: 2019-07-03 21:32:13
tags:
- vue
- cli

category:
- vue
- cli
---
Vue CLI是一个用于Vue.js快速开发的完整系统，提供了：
* 通过@vue/cli提供交互式的项目脚手架
* 通过@vue/cli+@vue/cli-service-global的零配置快速原型
* 一个运行时依赖（@vue/cli-service）：
  * 可升级
  * 在webpack之上构建，有合理的默认值
  * 通过项目内的配置文件实现可配置
  * 通过插件扩展
* 大量的官方插件，集成了前端生态中最好的工具
* 可视化的用户界面创建和管理Vue.js项目

vue cli保证了各种各样的构建工具平滑地一起工作，通过合理的默认值，你可以专注于书写业务代码而不是花费数天在项目的配置上。

## 系统中的组件
Vue cli主要分成下面三个部分：
### CLI
CLI（@vue/cli）是一个全局安装的npm包，在终端中提供了vue命令。它提供了通过vue create快速搭建项目的能力，或者通过vue serve立即原型化新的idea。通过vue ui可以使用可视化的界面管理项目。

### CLI Service
@vue/cli-service是一个开发环境依赖。其安装在每一个通过@vue/cli创建的项目中。

CLI Service在webpack和webpack-dev-server之上构建。包括了：
* 加载其他CLI插件的核心服务
* 为大部分apps优化的内部webpack配置

### CLI 插件
CLI插件是提供了可选特性的npm包，比如Babel/TypeScript编译，ESLint集成，单元测试，以及端到端测试。@vue/cli-plugin-(内置插件)；@vue/vue-cli-plugin(社区插件)；

在项目中运行vue-cli-service时，它会自动解析和加载package.json中的CLI插件


## 安装
> npm install -g @vue/cli

## 基础
