---
title: js基础：es6对象/数组遍历的多种方法
date: 2019-07-11 07:38:05
tags:
- js
- js基础
- js对象
- js数组

category:
- js
- js基础
---

## 对象属性的遍历
ES6一共有5种方法可以遍历对象的属性。

#### (1) for...in
for...in循环遍历对象**自身的和继承的可枚举属性**（不包含Symbol属性）。

#### (2) Object.keys(obj)
Object.keys返回一个数组，包括对象自身的（不含继承的）所有可枚举属性（不含symbol属性）

#### (3) Object.getOwnPropertyNames(obj)
Object.getOwnPropertyNames返回一个数组，包括对象自身的所有属性（不含继承，不含symbol，但是包含不可枚举属性）

#### (4) Object.getOwnPropertySymbols(obj)
Object.getOwnPropertySymbols(obj)返回一个数组，包括对象自身的所有Symbol属性

#### (5) Reflect.ownKeys(obj)
Reflect.ownKeys返回一个数组，包含对象自身的所有属性，不管是属性名、Symbol或字符串，也不管是否可枚举

以上的5种方法遍历对象的属性，都遵循同样的属性遍历的顺序：
* 首先是属性名为数值的属性
* 其次是属性名为字符串的属性，按照生成时间排序
* 最后是所有属性名为Symbol值的属性，按照生成时间排序

下面按照能不能遍历到继承的属性、能不能获取到symbol、能不能获取到可枚举属性进行分类：

#### 可遍历继承的属性
只有for...in可以遍历到可继承属性，其他的都不能遍历到继承的属性

#### 可遍历symbol属性
* Reflect.ownKeys(obj)可以获取symbol，属性（可枚举和不可枚举）
* Object.getOwnPropertySymbols

#### 可遍历不可枚举属性
* Object.getOwnPropertyNames可以获取到除Symbol外的所有属性（包括不可枚举属性）
* Reflect.ownKeys可以获取到所有属性，包括Symbol、可枚举和不可枚举属性


## 数组属性的遍历

* for循环（用length属性区边界)
* for...in
* for...of
* Array.prototype.keys ，返回包含键的一个遍历器对象，可以用for...of进行遍历
* Array.prototype.entries，返回包含键值对一个遍历器对象
* Array.prototype.values，返回一个包含值的遍历器对象
* for+Object.keys，先用Object.keys拿到所有自由属性，然后for遍历

### 判断一个对象是不是数组
假设要判断obj是不是数组实例，可以用下面的方法：
* obj instanceof Array
* Array.isArray()
* Object.prototype.String.call(obj).match(/\[object (.*)\]/)[1] === 'Array'

## 实战1：数组和对象的深度/广度优先遍历
根据我们前面提到的几种获取属性的方法，来实现不同返回的深度、广度遍历。我们根据需要，可以写出遍历包含可枚举属性的版本，也可以写出不包含可枚举属性的版本。在进行遍历的时候，我们需要判断对象的类型，判断对象的类型的多种方法和其比较请参考我的另一篇博客：js判断对象类型的多种方法和比较

#### 不包含不可枚举属性的遍历
1. 深度优先遍历
   前提是没有循环引用，如果有循环引用，会有无穷遍历的问题，可以给遍历过的每一个对象加上特殊的标记解决这个问题，上代码：
```js
function dfs(obj) {
  let type = Object.prototype.toString.call(obj).match(/\[object (.*)\]/)[1]
  if(type == 'Object' || type == 'Array') {
    for(let name of Object.keys(obj)) dfs(obj[name])
  } else {
    console.log(obj)
  }
}
```
2. 广度优先遍历
```js
function bfs(obj2) {
  let queue = []
  queue.push(obj2)
  while(!(queue.length === 0)) {
    let obj = queue.shift()
    let type = Object.prototype.toString.call(obj).match(/\[object (.*)\]/)[1]
    if(type === 'Object' || type === 'Array') {
      for(let name of Object.keys(obj)) {
        queue.push(obj[name])
      }
    } else {
      console.log(obj)
    }
  }
}
```
#### 包含不可枚举属性的遍历
与前面的代码基本相同，我们只要将Object.keys改称Object.getOwnPropertyNames就行了


## 实战2：数组和对象的深拷贝
对象通过=赋值是浅拷贝，也就是只会拷贝对该对象的引用，修改该对象会导致所有指向该对象的引用的内容改变。

有时候我们希望获得一份独立的拷贝，这时候就需要深拷贝了，js原生不支持深拷贝，我们可以利用深度优先遍历拷贝一个对象的所有属性和方法，包括不可枚举属性。

使用getOwnPropertyNames获取所有的对象属性，然后将其拷贝到一个新对象中，上代码:
```js
Object.prototype.clone = function() {
  let cloneObj = null, tempObj = null
  let thisType = Object.prototype.toString.call(this).match(/\[object (.*)\]/)[1]
  if(thisType === 'Object') cloneObj = tempObj = {}
  else if(thisType === 'Array') cloneObj = tempObj = []
  else cloneObj = this

  ;(function traverse(obj, tempObj) {
    let names = Object.getOwnPropertyNames(obj)
    for(let name of names) {
      let type = Object.prototype.toString.call(obj[name]).match(/\[object (.*)\]/)[1]
      if(type === 'Object') {
        tempObj[name] = {}
        traverse(obj[name], tempObj[name])
      } if(type === 'Array') {
        tempObj[name] = []
        traverse(obj[name], tempObj[name])
      } else {
        tempObj[name] = obj[name]
      }
    }
  }(this, tempObj));
  return cloneObj;
}
```