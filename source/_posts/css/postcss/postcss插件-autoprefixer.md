---
title: 'postcss插件:autoprefixer'
date: 2019-08-15 06:55:46
tags:
- css
- css工具
- autoprefixer

category:
- css
- css工具
---
autoprefixer用于css添加浏览器厂商前缀，以兼容比较老的浏览器。其数据来源是[caniuse](https://caniuse.com)。

下面看一个实例：

我们在写代码的时候不用考虑浏览器前缀的问题了，直接写成下面这样：
```css
::placeholder {
  color: gray;
}
.image {
  background-image: url(img@1x.png);
}
@media (min-resolution: 2dppx) {
  .image {
    background-image: url(img@2x.png);
  }
}
```

autoprefixer会按照当前浏览器的流行程度和属性支持来为你应用前缀（**根据browserslist的配置来决定，可以通过browserslist的配置来确定需不需要添加前缀以及为哪些浏览器添加前缀）**：
```css
::-webkit-input-placeholder {
  color: gray;
}
::-moz-placeholder {
  color: gray;
}
:-ms-input-placeholder {
  color: gray;
}
::-ms-input-placeholder {
  color: gray;
}
::placeholder {
  color: gray;
}

.image {
  background-image: url(image@1x.png);
}
@media (-webkit-min-device-pixel-ratio: 2),
       (-o-min-device-pixel-ratio: 2/1),
       (min-resolution: 2dppx) {
  .image {
    background-image: url(image@2x.png);
  }
}
```

## 使用
这里只介绍在webpack中的使用，在webpack中我们使用[postcss-loader](https://github.com/postcss/postcss-loader)，然后为postcss添加autofixer插件，使用如下：
```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  }
}

// postcss.config.js
module.exports = {
  plugins: [
    require('autofixer')
  ]
}
```
autoprefixer还提供了很多其他构建工具的使用方式，需要用的时候查查文档就可以了，这里主要弄清楚autoprefixer的规则。

## autoprefixer文档核心
这里记录了autoprefixer文档的核心要点：
### 常见问题：
1. autoprefixer会为ie添加polyfill吗？
   
   autoprefixer可以将现代grid的语法转成IE10和IE11支持的语法，但是这个polyfill不是在100%的case下工作，这也是其默认被禁用的原因。

   首先需要选项grid: autoplace或者/* autoprefixer grid: autoplace */控制注释来启用grid前缀。

   其次需要在IE中测试你的代码的每个方面

   第三，对auto placement仅有很少的支持

   第四，如果不是用auto placement特性，最佳的方法是通过grid-template或者grid-template-area。
2. autofix会添加polyfill吗？
   
   不会，autoprefixer只添加前缀。可以考虑下面的库来实现一些语法糖的功能：
   * [postcss-env](https://github.com/jonathantneal/postcss-preset-env)：预置polyfill和autoprefixer，用来写未来的css的插件
   * [Oldie](https://github.com/jonathantneal/oldie)：用来处理IE hack的postcss插件（opacity，rgba等等）
   * [postcss-flexbugs-fix](https://github.com/luisrudge/postcss-flexbugs-fixes)：修复flexbox问题的插件

3. autoprefixer为什么没有为border-radius添加前缀？
   
   开发者们经常惊讶于现在需要添加前缀的属性有多少(特别少的意思）！如果autoprefixer没有为你的属性添加前缀，检查caniuse看它是不是仍然还需要前缀

4. autoprefixer怎么处理老的有-webkit-前缀的代码？

   只能处理没有前缀的情况，autoprefixer只能将gradient，如果代码中只有-webkit-gradient，将不会添加前缀。可以使用postcss-unprefix来处理有前缀的代码，然后在将其结果传给autoprefixer。

## 禁用
### 前缀
如果你需要一个特殊的hack，只需要自己写上前缀就可以了，autoprefixer不会覆盖已有的前缀：
```css
a {
  transform: scale(0.5);
  -moz-transform: scale(0.6);
}
```

### 特性
启用特性：
* grid："autoplace"，在ie10/11下支持有限的grid布局
* supports: false，禁用@supports参数前缀
* flexbox：false，禁用flex布局属性前缀
* remove：false，阻止移除过时的前缀
  
## 控制注释
如果需要在某个位置启用或者停用autoprefixer，可以通过控制注释（control comment）来实现：
```css
.a {
  transition: 1s; /* will be prefixed */
}

.b {
  /* autoprefixer: off */
  transition: 1s; /* will not be prefixed */
}

.c {
  /* autoprefixer: ignore next */
  transition: 1s; /* will not be prefixed */
  mask: url(image.png); /* will be prefixed */
}
```
有三种类型的控制注释：
* /* autoprefixer: on|off */，在整个块中启用或者禁用autoprefixer。
* /* autoprefixer: ignore next */，禁用下一条属性选择或者@规则的参数（不包括@规则的内容）
* /* autoprefixer: autoplace|non-autoplace|off */，在整个块中控制grid布局的前缀，autoplace启用autoplacement的支持。non-autoplace，不支持autoprelacement的前缀，但是支持其他的属性。off，关闭。

## 总结思考
autoprefixer用于给css属性添加前缀，它只添加前缀，不会添加任何的polyfill，需要polyfill可以使用其他的库比如postcss-preset-env等。

autoprefixer使用browserslist配置和caniuse来决定对哪些浏览器添加哪些前缀。

autoprefixer中一个特殊的存在就是grid的处理，针对ie下grid的兼容。

通过给插件传配置参数或者通过控制注释可以对autoprefixer进行一些配置，例如是否对grid autoplacement添加支持等。
```js
// postcss配置文件, postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer')({
      grid: 'autoplace'
    })
  ]
}
```