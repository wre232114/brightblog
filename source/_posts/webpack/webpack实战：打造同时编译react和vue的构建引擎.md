---
title: webpack实战：打造同时编译react和vue的构建引擎
date: 2020-06-15 08:18:37
tags:
- Webpack
- Webpack实战
- Huaxu

category:
- Webpack
- Webpack实战
---
vue-cli-service和create-react-app都是单独针对vue或者react的初始化、开发和构建工具，现在想开发一套系统，既可以编译Vue的项目，又可以编译React的项目，提供插件化的机制控制构建过程。不同框架经过引擎后编译得到类似的静态资源结果，引擎提供多种内置的配置，例如sass等，可以通过配置项覆盖默认或者关闭默认配置或者在初始化的时候选择需要的能力和内置主题。

整个系统的构建模型如下：
