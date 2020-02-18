---
title: Sass快速入门
category: 
- css
- sass
---


## 1. 使用变量

### 1.1 声明变量

> $highlight-color: #F90;

* $highlight-color就是一个变量，变量的值可以是任何CSS属性值。即可以赋值给css属性的值都可以赋值给变量。
* 在规则块中定义的变量只能在规则块中使用。



### 1.2 变量引用

凡是css属性可以使用的地方，变量就可以使用：

```scss
$highlight-color: #F90;
.selected {
    border: 1px solid $highlight-color;
}
```

在声明变量时，变量值可以引用其他变量：

```scss
$highlight-color: #F90;
$highlight-border: 1px solid $highlight-color;
.selected {
	border $highlight-border;
}
```

上例说明变量的值可以是复合值。

### 1.3 一般使用中划线来分隔变量中的多个词



## 2. 嵌套CSS规则

如下例：

```scss
#content {
    article {
        h1 { color: #333; }
        p { margin-bottom: 1.4em; }
    }
    aside { background-color: #EEE; }
}
```

会使用后代选择器编译，编译后：

```css
 /* 编译后 */
#content article h1 { color: #333 }
#content article p { margin-bottom: 1.4em }
#content aside { background-color: #EEE }
```

### 2.1 父选择器的标识符&

使用&能够在嵌套选择器中指代父元素。

例如：

```scss
article a {
    color: blue;
    &:hover { color: red; }
}
```

会编译成：

```css
article a { color: blue; }
article a:hover { color: red }
```

**注意：&指代当前嵌套的选择器的父选择器，例如**

```scss
#content aside {
  color: red;
  body.ie & { color: green }
}
```

会变成:

```css
/*编译后*/
#content aside {color: red};
body.ie #content aside { color: green }
```

而不是只有aside是父元素。



### 2.2 群组选择器的嵌套

```scss
.container {
    h1, h2, h3 { margin-bottom: .8em }
}
```

会变成：

```css
.container h1, .container h2, .container h3 { margin-bottom: .8em; }
```

同理可知：

```scss
nav, aside { 
    a { color: blue; }
}
```

### 2.3 >、+、~

```css
header + p { font-size: 1.1em; }
```

+选择紧跟在header后面的p

```css
article ~ article { border-top: 1px dashed #ccc; }
```

~选择所有article元素后的同层article元素，不管他们中间有多少元素。

可以在嵌套规则中使用：

```scss
article {
    ~ article { border-top: 1px dashed #ccc }
    > section {background: #eee }
    dl > {
        dt { color: #333 }
        dd { color: #555 }
    }
    nav + & { margin-top: 0 }
}
```

### 2.4 嵌套属性

规则可以嵌套，属性也可以嵌套：

```scss
nav {
    border: {
        style: solid;
        width: 1px;
        color: #ccc;
    }
}
```

嵌套属性的规则：把属性名从中划线-的地方断开，在根属性后面添加一个冒号：，紧跟一个{}块，子属性写在{}中。

得到的结果如下：

```css
nav {
    border-style: solid;
    border-width: 1px;
    border-color: #ccc;
}
```

## 3. 导入SASS文件

* css的@import规则会在执行到@import时浏览器才会去下载。

* sass的@import规则在生成css文件时就将相关文件导入进来。**在被导入文件中定义的变量和混合器均可在导入文件中使用。**

* 可以省略文件后缀（.sass,.scss）。

### 3.1 部分sass文件

这些文件一般只用于导入到其他文件中，比如常用的组件sidebar。

* sass局部文件的文件名以下划线开头。这样，sass就不会在编译时单独编译这个文件输出css，而只把这个文件用作导入。

  > themes/_night-sky.scss => @import "themes/night-sky";



### 3.2 默认变量值

1. 反复声明一个变量，只有最后一处有效且它会覆盖前边的值。

```scss
$link-color: blue;
$link-color: red;
a {
    color: $link-color;
}
```

2. 使用!default实现默认值

   ```scss
   $fancybox-width: 400px !default;
   .fancybox {
       width: $fancybox-width;
   }
   ```

   声明后面接!default说明该值是默认值，如果还有其他的赋值，那会使用赋值，如果没有则使用默认值。



### 3.3 嵌套导入

sass运行@import命令写在css规则内（原生css不允许）。这种导入方式下，生成对应的css文件时，局部文件会被直接插入到css规则内导入它的地方。



### 3.4 原生的CSS导入

由于sass兼容原生的css，所以它也支持原生的CSS@import。在下列三种情况下会生成原生的CSS@import：

* 被导入文件的名字以.css结尾
* 被导入文件的名字是一个URL地址
* 被导入文件的名字时css的url值



## 4. 静默注释

“//” 开头的是静默注释，这种注释不会和出现在生成的css文件中。



## 5. 混合器

通过sass的混合器实现大段样式的重用。

* 混合器使用@mixin标识符定义。这个标识符给一大段样式赋予一个名字，可以通过这个名字来重用这段样式。

  ```scss
  @minin rounded-corners {
      -moz-border-radius: 5px;
      -webkit-border-radius: 5px;
      border-radius: 5px;
  }
  ```

* 通过@include来使用这个混合器：

  ```scss
  notice {
      background-color: green;
      border: 2px solid #00aa00;
      @include rounded-corners;
  }
  ```

  相当于在@include的位置将名字代表的那一段代码粘贴进来。



### 5.1 何时使用混合器

* 如果发现一直在复制粘贴某一段css代码，这时候需要混合器
* 如果能为这个混合器想出一个简短的好名字，这时往往能够构造一个合适的混合器。



### 5.2 混合器中的css规则

混合器中不仅可以包含属性，也可以包含css规则，包含选择器和选择器中的属性：

```scss
@minin no-bullets {
    list-style: none;
    li {
        list-style-image: none;
        list-style-type: none;
        margin-left: 0px;
    }
}
```



