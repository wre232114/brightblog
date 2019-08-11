---
title: vue基础：官方文档要点
date: 2019-06-18 21:12:54
tags:
- vue
- 基础要点

category:
- vue
- 基础
---
最近实习中又用到了Vue，过了一遍官方文档复习一下，感觉又有很多收获。记录一下要点。

## vue实例
每一个Vue应用都是通过用Vue函数创建一个新的Vue示例开始的：
```js
// vm代表（ViewModel）
var vm = new Vue({
  // 选项
})
```
一个Vue应用由一个通过new Vue创建的根Vue实例，以及可选的嵌套的、可复用的组件树组成。**所有的Vue组件都是Vue实例，并且接受相同的选项对象（根实例特有的选项除外）**

#### 数据与方法
Vue实例创建的时候会将选项中的**data对象的所有属性**加入到Vue的响应式系统中。*选项中data对象会被浅拷贝到Vue实例（后文用vm表示Vue实例）的_data属性上，会拦截vm和data上对应属性的访问，所以改变vm属性对应的值会影响到data，改data也会影响到vm。细节请参考另一篇博客[从Vue源码解读Vue实例的初始化过程]()*

实例被创建时传的data参数中的属性的才是响应式的，新增的属性不是。

### 实例生命周期钩子
1. Vue实例初始化过程中会调用的一些钩子函数。

2. 钩子函数不要用箭头函数，因为this的问题。

3. 在单文件组件中，模板编译会被提前。

## 模板语法
Vue.js的模板允许开发者声明式地将DOM绑定至底层Vue实例的数据。

底层模板会被编译成渲染函数。

### 插值
{% raw %}
数据绑定语法:{{}}（Mustache)，绑定的数据变化时，DOM会自动更新。
```html
<span>Message: {{ msg }} </span>
```
1. v-once指令可以一次性插值，数据改变不会更新DOM。

2. {{}}会将数据解释成文本，要插入html，使用v-html="html code"。v-html不能复合局部模板，只能是html。

3. {{}}不能作用再HTML属性上，需要用v-bind指令:
    ```html
    <div v-bind:id="dynamicId"></div>
    ```

4. {{}}支持支持完整的javascript表达式（只能是单个表达式）。
5. 插值中用到的**单个**表达式（如{{}}插值，指令参数，指令值），**这些表达式会在Vue实例的数据作用域下作为javascript被解析，意思就是说，表达式中使用的变量，会被解析成对应vm实例的属性。全局变量只能访问Math、Date等，不应该访问自定义的全局变量。**
{% endraw %}

### 指令
指令是带有v-前缀的特殊特性。指令特性的值是**单个javascript表达式（v-for是例外情况）。指令的职责是，当表达式的值改变时，将其连带影响，响应式地作用于DOM。**

1. 参数：能够接受一个参数，在指令名称后面以冒号表示，然后再接等于号表示指令特性的值。语法如下：
   ```html
   <a v-bind:href="url">...</a>
   <a v-on:click="doSomething"></a>
   ```
2. 动态参数：从2.6.0起，可以用[]括起来的javascript表达式作为一个指令的参数，下面的例子会对attributeName求值，结果作为指令的参数：
   ```html
   <a v-bind:[attributeName]="url">...</a>
   <a v-on:[eventName]="doSomething">...</a>
   ```
   约束：
   * 动态参数的求值结果期望是一个字符串，特殊结果可以是null，null可以被显性用于溢出绑定。非字符串结果会触发警告。
   * 动态参数表达式有一些语法约束，因为某些字符，例如空格和引号，放在HTML特性名里是无效的。**在html文件中使用动态参数时，如果参数表达式比较复杂，可以使用计算属性代替**

3. 修饰符：修饰符是以.指明的特殊后缀，指出一个指令应该以特殊方式绑定。例如.prevent修饰符告诉v-on指令对于触发的事件调用event.preventDefault():
   ```html
   <form v-on:submit.prevent="onSubmit">...</form>
   ```

### 缩写
v-bind和v-on提供了简写：
```html
<a :href="url"></a>
<a @click="doSomething"></a>
```


## 计算属性和侦听器

### 计算属性
在模板内可以使用任意的表达式，但是这些表达式应该只用于简单运算。**对于复杂的逻辑，应该使用计算属性**

示例：
```html
<div id="example">
  <p>Original message: "{{ message }}"</p>
  <p>Computed reversed message: {{ reversedMessage }}</p>
</div>

<script src="./vue.min.js"></script>
<script>
 var vm = new Vue({
   el: '#example',
   data: {
     message: 'Hello'
   },
   computed: {
     reversedMessage: function() {
       return this.message.split('').reverse().join('') // 先转成数组，string没有reverse方法
     }
   }
 })
</script>
```
示例中我们声明了一个计算属性reverseMessage。我们提供的函数将用作属性vm.reversedMessage的getter函数。
```js
 console.log(vm.message)
 vm.message = 'Goodbye'
 console.log(vm.reversedMessage)
 ```

 **计算属性可以像data中的属性一样直接在模板中使用。vue可以知道计算属性中所依赖的属性，并收集到其依赖，当依赖的属性发生变化的时后，计算属性会重新计算**

 #### 计算属性vs方法
 **计算属性是基于响应式依赖进行缓存的，只要依赖变化才会重新求值，方法每次调用都会进行求值**。如果不希望有缓存（仅仅只是计算而不依赖响应式属性，希望实时更新的时后），使用方法代替计算属性。

 #### 计算属性vs侦听属性
 Vue提供了一种更通用的方式来观察和响应Vue实例上的数据变动：侦听属性。**侦听属性可以观察到vm属性（只能是在data选项中定义的属性）的变化，并调用回调函数**。
 ```html
  <div id="demo">{{ fullName }}</div>
<script>
 var vm = new Vue({
   el: '#demo',
   data: {
     firstName: 'Foo',
     lastName: 'Bar',
     fullName: 'Foo Bar'
   },
   watch: {
     firstName: function(val) { // 当firstName变化时，调用该回调函数，传入新的值作为参数
       this.fullName = val + " " + this.lastName;
     },
     lastName: function(val) {
       this.fullName = this.firstName + ' ' + val;
     },
     noName: function(val) { // noName没有定义，使用回报错
       this.fullName = this.fullName + 'noName';
     }
   }
 })
 ```

 #### 计算属性的setter
 计算属性默认值有getter，不过在需要的时候可以提供一个setter：
 ```js
computed: {
     reversedMessage: {
       get: function() {
        return this.message.split('').reverse().join('') // 先转成数组，string没有reverse方法
       },
       set: function(newValue) {
         this.message = newValue;
       }
     }
   }
 ```

### 侦听器
Vue通过watch选项可以监听对应数据的变化，当vm上的实例属性变化时，调用watch选项中指定的回调函数。**当需要在数据变化时执行异步或者开销较大的操作时，这个方式时最有用的**。例如，在输入框输入值的时候，希望向服务器发送一个请求，获取动态的值，这时候就可以使用侦听器。


## Class和Style绑定
操作元素的class列表和内联样式是数据绑定的一个常见需求。因为它们都是属性，所以哦我们可以用v-bind来处理他们：只需要通过表达式计算出字符串结果。不过字符串拼接麻烦且易错。**在v-bind用于class和style时，Vue.js做了专门的增强。表达式结果的类型除了字符串以外，还可以是对象或者数组。**


### 绑定html class
#### 对象语法
动态切换class，当isActive是真时，元素添加active类：
```html
<div class="static" v-bind:class="{active: isActive, 'text-danger': hasError}"></div>
```
对象中可以有多个class，可以与普通的class共存。