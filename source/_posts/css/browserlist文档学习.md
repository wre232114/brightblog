---
title: browserlist文档学习
date: 2019-08-14 08:03:52
tags:
- css
- css工具
- browserslist

category:
- css
- css工具
---
browserslist用于在不同的前端工具，比如autoprefixer、stylelint、babel-preset-env间共享相同的目标浏览器和nodejs环境。使用改配置的工具如下：
* [autoprefixer](https://github.com/postcss/autoprefixer)
* [babel](https://github.com/babel/babel/tree/master/packages/babel-preset-env)
* [postcss-preset-env](https://github.com/jonathantneal/postcss-preset-env)
* [eslint-plugin-compact](https://github.com/amilajack/eslint-plugin-compat)
* [styleline-no-unsupported-browser-feature](https://github.com/ismay/stylelint-no-unsupported-browser-features)
* [postcss-normalize](https://github.com/jonathantneal/postcss-normalize)
* [obsolete-webpack-plugin](https://github.com/ElemeFE/obsolete-webpack-plugin)

所有的工具都会自动找到目标浏览器，当在package.json中添加以下字段的时候：
```json
  "browserslist": [
    "last 1 version",
    "> 1%",
    "maintained node versions",
    "not dead"
  ]

```
或者在.browserslistrc配置文件中添加：
```json
# Browsers that we support

last 1 version
> 1%
maintained node versions
not dead
```

## 最佳实践
* 当且仅当只在特定的浏览器下开发使用web app时，才会直接选择浏览器（例如：last 2 Chrome versions）。如果开发通用的web app，那么一定要考虑浏览器的多样性。
* 有默认的查询，给大多数的用户一个合理的默认配置。
* 如果改变默认的浏览器集，推荐组合last 1 version，not ，dead，以及>0.2%（或者 >1% in US）
* 不要删除你不知道的浏览器。

## 查询
browserslist从以下来源获取query：
* 在package.json中。**官方推荐这种方式**
* .browserslistrc，当前或者父目录
* browserslist配置文件，当前目录或者父目录
* BROWSERSLIST环境变量，
* 如果以上都没有，那么会应用默认的：>0.5%，last 2 versions，Firefox ESR，not dead

### 查询组合
可以使用三种方式组合查询：
* or和,代表取并集
* and取交集
* not取反

### 完整的查询清单
You can specify the browser and Node.js versions by queries (case insensitive):

* \> 5%: browsers versions selected by global usage statistics. >=, < and <= work too.
* \> 5% in US: uses USA usage statistics. It accepts two-letter country code.
* \> 5% in alt-AS: uses Asia region usage statistics. List of all region codes can be found at caniuse-lite/data/regions.
* \> 5% in my stats: uses custom usage data.
* cover 99.5%: most popular browsers that provide coverage.
* cover 99.5% in US: same as above, with two-letter country code.
* cover 99.5% in my stats: uses custom usage data.
*maintained node versions: all Node.js versions, which are still maintained by Node.js Foundation.
* node 10 and node 10.4: selects latest Node.js 10.x.x or 10.4.x release.
* current node: Node.js version used by Browserslist right now.
* extends browserslist-config-mycompany: take queries from browserslist-config-mycompany npm package.
* ie 6-8: selects an inclusive range of versions.
* Firefox > 20: versions of Firefox newer than 20. >=, < and <= work too. It also works with Node.js.
* iOS 7: the iOS browser version 7 directly.
* Firefox ESR: the latest [Firefox ESR] version.
* unreleased versions or unreleased Chrome versions: alpha and beta versions.
* last 2 major versions or last 2 iOS major versions: all minor/patch releases of last 2 major versions.
* since 2015 or last 2 years: all versions released since year 2015 (also since 2015-03 and since 2015-03-10).
* dead: browsers without official support or updates for 24 months. Right now it is IE 10, IE_Mob 10, BlackBerry 10, BlackBerry 7, Samsung 4 and OperaMobile 12.1.
* last 2 versions: the last 2 versions for each browser.
* last 2 Chrome versions: the last 2 versions of Chrome browser.
* defaults: Browserslist’s default browsers (> 0.5%, last 2 versions, Firefox ESR, not dead).
* not ie <= 8: exclude browsers selected by previous queries.


## 思考
browserslist查询的书写方式就是将上面的清单用再上面提到的三种组合方式组合起来。

其他的库和框架会根据上面提到的browserslist的来源中的查询表达式来确定支持的浏览器。所以我们使用browserslist和第三方库的时候，只需要将组合的查询写道browserslist配置中，然后第三库就会自动识别并使用满足查询的浏览器。

browserslist还提供了api、环境变量等的访问方式，等用到的时候再查文档添加。