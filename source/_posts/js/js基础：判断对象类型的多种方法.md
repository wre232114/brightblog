---
title: js基础：判断对象类型的多种方法
date: 2019-07-14 11:23:22
tags:
- js
- js基础
- js对象类型判断

category:
- js
- js基础
---

## 概述
js中有多种方式可以判断对象的类型，每种判断类型的方式都有自己的优缺点。这篇文章文章中我们一共总结了4种方法：
1. instanceof
2. typeof
3. Object.prototype.toString.call
4. constructor

## 1. instanceof
使用方法：<code>obj instanceof Object</code>，左操作数是对象实例，右操作数是构造函数。

instanceof关键字判断的方式如下，假定o是对象实例、c是构造函数：
**如果o继承自c.prototype，则o instanceof c的值为true。这里的继承可以是直接继承，也可以是间接继承**

也就是说，只要某一个构造函数的prototype在某一个实例原型链上，实例 instanceof 构造函数的值就为true。来个图可能比较好理解：

![原型链](https://www.brightblog.cn/img/%E5%8E%9F%E5%9E%8B%E9%93%BE.png)

因为Object.prototype和Array.prototype都在原型链上，那么数组实例，例如:
```js
let array = new Array()
array instanceof Array // true
array instanceof Object // true
```

### instanceof的缺陷
1. 多窗体中（比如嵌套了iframe），每一个窗体有独立的上下文，在一个iframe中的Array实例，在父窗口中使用instanceof Array的结果是false，因为两者上下文独立，两个Array是相互独立的。（解释一下，iframe有同源策略的限制，所以同源的iframe是可以通过dom访问到的，能够拿到iframe里面的对象，当要处理跨文档的类型判断时，instanceof就会出现问题）
   
2. 只能判断某一个实例是不是某一个构造函数的实例，不能取到具体的类型。如果我要拿到obj的类型字符串例如'object'，instanceof就无能为力了。
   
## 2.typeof
typeof是js内置的一个操作符，后面接一个对象的实例或者原始类型，例如:
```js
console.log(typeof '123') // string
console.log(typeof 123) // number
console.log(typeof false) // boolean
console.log(typeof null) //object
console.log(typeof undefined) // undefined
console.log(typeof new Array) // object
console.log(typeof (()=>'')) // function
```
typeof需要注意几个特殊点：
* typeof null，返回的是object
* typeof 函数，返回的是function
* typeof 对象实例，返回的是object，这里注意，除了函数，其他的实例应该都返回的object

typeof是内置的操作符，js不像c++，没有提供内置操作符重写的能力，所以我想让typeof [1,2,3]返回'array'可以吗？答案是不可能。

### typeof的缺陷
typeof主要为了区分对象类型和原生类型，所以只能用于判断一个变量是不是对象或者是不是字符串等。涉及到对象的具体细节，比如这个对象是哪个构造函数的实例，typeof就无能为力了。

需要注意一下typeof的特殊点：主要是null、function

## 3. Object.prototype.toString.call
js是有类型的概念的，通过Object默认的toString方法，我们可以拿到类型字符串，比如[object Array]。

但是大部分内置对象，都会重写toString方法，所以我们不能直接调用obj.toString方法，需要调用Object.prototype.toString来访问默认的toString方法。

示例:
```js
console.log(Object.prototype.toString.call(new Date)) // [object Date]
console.log(Object.prototype.toString.call(JSON)) // [object JSON]
console.log(Object.prototype.toString.call(Math)) // [object Math]
console.log(Object.prototype.toString.call(new f)) // [object Object]
console.log(Object.prototype.toString.call(f)) // [object Function]
```
我们要拿到一个对象的类型字符串，可以这么写：
```js
function type(obj) {
  return Object.prototype.toString.call(obj).match(/\[object (.*)\]/)[1]
}

```

### 缺陷
对于大部分的内置类型，我们都可以通过Object.prototype.toString获取到类型字符串。

但是我们不能通过获取到自定义构造函数的具体的类型，在上例中，我们获取new f的类型字符串，返回的是[object Object]。解决这个问题，一种方式是重写f.prototype.toString，让其返回[object f]。但是当我们的toString另有他用的时候（参考Date的toString），这种方式就行不通了，而且每个新的构造函数都要重写toString，很麻烦。

另一种方法就是使用下面的constrcutor方案。

## 4. constructor
我们知道，通过原型对象的constructor属性，可以获取到构造函数，我们能不能通过构造函数取到构造函数的名字呢？构造函数的名字也可以代表类型。

ES6里面提供了函数的name属性，我们可以通过func.name这种方式拿到函数名，例如：
```js
function f() {}
console.log(f.name) // f
```
ES5及以下怎么办呢？我们可以使用，func.toString拿到函数定义的字符串，然后从中取出函数名。示例：
```js
console.log(f.toString().match(/function(.*)\(.*/)[1].trim())
```

### constructor缺陷
有些函数是没有名字的（匿名函数）。。。。
```js
var range = function(x,y){} // 这个函数是没有名字的
```

## 5. 总结
总结一下：
* 如果只是想要判断某一个对象是不是某一个构造函数的实例，使用instanceof
* 如果希望区分内置对象和自定义对象，可以使用Object.prototype.toString.call
* 如果希望判断是不是基础类型的或者对象，或者是函数，可以使用typeof
* 如果希望得到自定义对象的具体的类型的字符串，可以使用constructor

每一种方法都有自己的特点，理解了原理之后，可以根据自己的需要，将几种方式组合起来。