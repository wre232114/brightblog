---
title: postcss基础
date: 2019-08-12 22:58:21
tags:
- css
- css工具
- postcss

category:
- css
- css工具
---

[postcss](https://github.com/postcss/postcss)是一个用js插件改变css样式的工具。这个插件可以对css进行语法检查、转义最新的css、添加前缀、内联图片等等。postcss将css文件转成抽象语法树，并且提供了API取访问他们，这些API可以被插件使用，对css进行处理。

postcss提供了大量的插件，这些插件能够对css开发中的方方面面进行处理，最受欢迎的一些插件：[插件列表](https://github.com/postcss/postcss#plugins)。

## 使用
postcss可以通过多种方式来使用，这里只记录了两种，更多的可以去[postcss的仓库](https://github.com/postcss/postcss)看文档：
### CSS-in-JS
通过css-in-js库[astroturf](https://github.com/4Catalyzer/astroturf)来使用postcss。具体操作是在webpack.config.js中加入对css-in-js处理的loader，然后将导出的css文件用postcss处理，添加postcss.config.js配置文件：
```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'postcss-loader'],
      },
      {
        test: /\.jsx?$/,
        use: ['babel-loader', 'astroturf/loader'],
      }
    ]
  }
}

// postcss.config.js
module.exports = {
  plugins: [
    require('autofixer'),
    require('postcss-nested')
  ]
}
```

### webpack
在webpack中的使用也很简单，对输入的css文件添加postcss-loader，然后添加postcss.config.js配置文件，指定需要哪些postcss插件，并将插件require进来。
```js
//Use postcss-loader in webpack.config.js:
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            }
          },
          {
            loader: 'postcss-loader'
          }
        ]
      }
    ]
  }
}
//Then create postcss.config.js:
module.exports = {
  plugins: [
    require('precss'),
    require('autoprefixer')
  ]
}
```

### 命令行执行
如果不需要集成到现有的工具中，我们可以使用postcss提供的cli工具来对某一个文件或者某一个目录下的css文件进行处理，[post-cli](https://github.com/postcss/postcss-cli)

postcss-cli安装：
> npm i -g postcss-cli |
> npm i -D postcss-cli

常见用法：
> postcss --use autoprefixer -c options.json -o main.css css/*.css

## postcss文档核心
这里记录以下postcss文档阅读的核心要点：

### 参数
大多数的postcss执行器都接受两个参数：
* 插件数组
* 选项对象

通用选项：
* syntax：提供语法解析和字符串化的对象
* parser：特殊的语法解析器，例如scss
* stringifier：特殊的语法输出生成器，例如Midas
* map：source map选项
* from：输入文件名（大多数执行器自动设置）
* to：输出文件名（大多数执行器自动设置）

更多的信息可以参考[api文档](https://github.com/postcss/postcss/tree/master/docs)
## 思考
postcss就是一系列的插件的组合，postcss本身不提供额外的功能，只对输入的css进行语法分析，构建AST，然后提供给插件访问AST的api。这些插件输入AST，输出处理过后的css，其中最常用的就是autoprefixer插件，改插件根据browserslist配置自动为css添加前缀。

像postcss-scss等插件不会编译scss，他们只是让scss语法能够通过postcss的语法检查，postcss-scss只是将scss中的mixins、变量、@规则简单的翻译成属性，如果需要编译scss，例如在webpack中，需要安装sass-loader和node-sass，并让其在postcss-loader前执行，这样就可以同时达到预编译和自动添加后缀的效果。