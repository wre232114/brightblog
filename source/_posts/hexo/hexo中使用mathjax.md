---
title: hexo中使用mathjax
date: 2019-06-09 17:53:29
tags: hexo
category: hexo
---

网上给的很多使用hexo插件或者修改各种配置的教程都太过繁琐，而且在我这里不管用，所以我自己上mathjax的官网看了以下，直接使用mathjax，不搞那么多花里胡哨的东西。当然这里方式是通过dom动态实现的，以后我会尝试写个插件在服务器上处理。

当然如果你只是想要在hexo中加入mathjax，而网上找了很多方法都没用，那么这篇文章一定很适合你！

整个教程仅仅只有两步：1.下载mathjax，或者直接使用第三方的cdn；2.将mathjax的script标签添加到ejs文件中。

## 获取mathjax
接下来讨论获取mathjax的两种方式：
### 直接下载源文件
上[mathjax的官网](https://docs.mathjax.org/en/latest/installation.html#obtaining-mathjax-via-an-archive)，找到archive，然后在找到current version，点击下载。

下载解压完成后，文件夹中就已经包含了我们所要的全部信息。如何使用我们稍后再说。

### 使用cdn
```js
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/latest.js?config=TeX-MML-AM_CHTML"></script>
<script type="text/x-mathjax-config">
  MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});
</script>
```

## 添加mathjax支持
### 使用源文件方式
使用源文件方式的好处是，对应的静态资源可以放在我们自己的服务器上。

我要要做的仅仅是，将源文件解压后的所有文件拷贝到静态资源服务器下。在hexo中，我们可以放到themes/[你使用的主题]/source/js目录下，
然后在ejs文件中，比如layout.ejs，加入下面的代码:

```js
<script type="text/x-mathjax-config">
    MathJax.Hub.Config({
      extensions: ["tex2jax.js"],
      jax: ["input/TeX","output/HTML-CSS"],
      tex2jax: {inlineMath: [["$","$"],["\\(","\\)"]]}
    });
  </script>
    <%- js("js/MathJax") %>
```

也可以直接把这一段代码直接考到你需要的markdown文件中，但是这样每一个md都需要手动添加，比较麻烦。

### 使用cdn方式
使用cdn就更容易了，直接把下面的代码粘贴到layouy.ejs中就可以直接使用了：

```js
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/latest.js?config=TeX-MML-AM_CHTML"></script>
<script type="text/x-mathjax-config">
  MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});
</script>
```