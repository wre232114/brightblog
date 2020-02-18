---
title: Vue基础：vue-class-component
date: 2019-09-03 06:50:22
tags:
- vue
- vue基础

category:
- vue
- 基础
---
vue-class-component是为Vue组件提供的注解支持，能够通过注解的方式来来声明组件以及组件的选项等。这篇文章主要学习如何使用vue-class-component，以及vue-class-component和vue2.x的使用对比。

## vue-class-component基础
vue-class-component使用的是[ECMAScript stage 1 decorators](https://github.com/wycats/javascript-decorators/blob/master/README.md)，需要在typescript中启用`--experimentalDecorators`标识。vue-cli3创建的项目下，可以直接使用tsconfig.json来配置typescript编译器。

注意：
1. `methods`可以直接作为类的方法声明
2. 计算属性可以作为类的存储器声明
3. `data`可以作为类的属性直接声明
4. `data`、`render`以及所有的Vue声明周期钩子可以直接作为类的成员方法声明，但是不能直接通过实例调用。
5. 对于所有的其他选项，将它们传给装饰器函数

示例：
```html
<template>
  <div>
    <input v-model="msg">
    <p>prop: {{propMessage}}</p>
    <p>msg: {{msg}}</p>
    <p>helloMsg: {{helloMsg}}</p>
    <p>computed msg: {{computedMsg}}</p>
    <button @click="greet">Greet</button>
  </div>
</template>

<script>
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  props: {
    propMessage: String
  }
})
export default class App extends Vue {
  // initial data
  msg = 123

  // use prop values for initial data
  helloMsg = 'Hello, ' + this.propMessage

  // lifecycle hook
  mounted () {
    this.greet()
  }

  // computed
  get computedMsg () {
    return 'computed ' + this.msg
  }

  // method
  greet () {
    alert('greeting: ' + this.msg)
  }
}
</script>
```
如上例，类的所有成员方法，将会被视为Vue2.x中`methods`中的方法，比如`greet()`；类的所有属性，将作为`data`的属性加入响应式系统，比如`mgs = 123`；类中的生命周期钩子、render、data函数也直接可以直接用类的函数声明（原先是在Vue构造函数的选项中声明）；计算属性通过`get/set`来声明。

如果不想向`@Component`传参数，可以通过@prop和@watch等来声明prop和监听属性，但是这些decorators在[vue-property-decorators](https://github.com/kaorun343/vue-property-decorator)中，需要单独引入，后文会学习这一部分的知识，请继续向下看～！

### mixin
vue-class-component提供了`mixins`帮助函数来使用mixins，通过使用mixins函数，可以指明mixins类型并且通过组件形式继承它们。例如：
```typescript
// mixin.js
import Vue from 'vue'
import Component from 'vue-class-component'

// You can declare a mixin as the same style as components.
@Component
export default class MyMixin extends Vue {
  mixinValue = 'Hello'
}
```
使用mixin：
```typescript
import Component, { mixins } from 'vue-class-component'
import MyMixin from './mixin.js'

// Use `mixins` helper function instead of `Vue`.
// `mixins` can receive any number of arguments.
@Component
export class MyComp extends mixins(MyMixin) {
  created () {
    console.log(this.mixinValue) // -> Hello
  }
}
```
> 知识回顾：mixins翻译为'混入'，以及就是一个对象将已有的选项和方法等合并进另一个对象中，在vue2.x中mixin是一个js对象，通过Vue的mixins选项传进去（mixins选项接收一个对象数组），mixin如何和被混入的对象中有属性冲突，会合并，不能合并的以被混入的优先，钩子函数会被合成一个数组，均会被调用；通过`Vue.mixin()`可以定义全局混入；通过`Vue.config.optionMergeStragegies=func(toVal,formVal)`可以自定义合并逻辑。

在typescript中mixin就是一个组件，在另一个组件中使用mixin的方式是：`extends mixins(MyMixin)`，通过mixins函数，将MyMixin组件的内容混入到声明的组件中。

### 创建自定义装饰器
可以通过创建自定义的装饰器来继承`vue-class-component`的能力。`vue-class-component`提供了`createDecorator`来创建自定义的装饰器。`createDecorator`接收一个回调函数参数作为第一个参数，回调函数哦于三个参数：
* options：Vue组件的选项对象。改变这个对象将会影响对应的组件
* key：decorator装饰器应用的属性或者方法
* parameterIndex：如果自定义装饰器用作参数，那这个选项表示第几个参数

示例：
```typescript
// decorators.js
import { createDecorator } from 'vue-class-component'

export const NoCache = createDecorator((options, key) => {
  // component options should be passed to the callback
  // and update for the options object affect the component
  options.computed[key].cache = false
})
import { NoCache } from './decorators'

@Component
class MyComp extends Vue {
  // the computed property will not be cached
  @NoCache
  get random () {
    return Math.random()
  }
}
```
> 提示：vue-property-decorator就是通过这种方式实现的，我们也可以通过这种方式实现功能更多的装饰器

### 添加自定义的钩子函数
如果使用Vue Router一类的插件，可能会希望类组件识别其提供的钩子函数；通过`Component.registerHooks`允许你注册这样的钩子：
```typescript
// class-component-hooks.js
import Component from 'vue-class-component'

// Register the router hooks with their names
Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate' // for vue-router 2.2+
])
// MyComp.js
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
class MyComp extends Vue {
  // The class component now treats beforeRouteEnter
  // and beforeRouteLeave as Vue Router hooks
  beforeRouteEnter (to, from, next) {
    console.log('beforeRouteEnter')
    next() // needs to be called to confirm the navigation
  }

  beforeRouteLeave (to, from, next) {
    console.log('beforeRouteLeave')
    next() // needs to be called to confirm the navigation
  }
}
```
可以在组件定义前调用`Component.registerHooks`方法。
> 知识回顾：Vue Router的钩子函数
>
> 钩子在Router中也称为守卫，钩子函数会在调转到页面前或者调转到页面后被调用；Vue Router中的钩子有全局前置守卫、全局解析守卫、全局后置守卫、路由独享的的守卫、组件内的守卫。`router.beforeEach`注册全局前置守卫；`router.beforeResolve`注册全局解析守卫，解析守卫在组件内守卫和异步路由组件被解析值后调用；`router.afterEach`注册全局后置钩子；在路由配置上定义`beforeEnter`定义路由独享的守卫（与path、component等同级）；在组件选项对象中添加与`template`同级的钩子函数（beforeRouterEnter、beforeRouterUpdate、beforeRouterLeave）注册组件内的守卫。

### 类属性的警示
1. property中的this值
   如果定义了一个箭头函数并赋值给类的属性，那么箭头函数中的this不能正确的被访问到。**正确的方式是直接定义一个类的方法。**

2. undefined不是响应式的
   undefined作为初始值的属性不是响应式的。**正确方式是使用null来初始化而不是undefined。**

## vue-property-decorator基础
前面提到了，除了属性，方法、钩子函数、render和data函数、计算属性以外，其他的Vue选项都通过Component注解函数的参数传过去。但是如果想对其他的选项也使用注解的方式，可以使用vue-property-component来实现；例如`@Prop`、`@Watch`等等，有以下注解：
* @Prop：@Prop(options:(PropOptions | Constructor[] | Constructor) = {})，options可以是Props的配置对象，或者类型(String，Number等)
* @PropSync：@PropSync(propName: string, options: (PropOptions | Constructor[] | Constructor) = {}) decorator，
  ```ts
  import { Vue, Component, PropSync } from 'vue-property-decorator'

  @Component
  export default class YourComponent extends Vue {
    @PropSync('name', { type: String }) syncedName!: string
  }
  ```
  等价于
  ```ts
  export default {
    props: {
      name: {
        type: String
      }
    },
    computed: {
      syncedName: {
        get() {
          return this.name
        },
        set(value) {
          this.$emit('update:name', value)
        }
      }
    }
  }
  ```
* @Model
* @Watch
* @Provide
* @Inject
* @ProvideReactive
* @InjectReactive
* @Emit：@Emit(event: string)，Emit用于方法，该方法返回值和原有参数会依次作为`this.$emit`的参数，并在被注解的方法最后调用`this.$emit`。意味着方法被调用时，会向父组件发送一个事件
* @Ref
* @Component（和vue-class-component提供的相同）

和一个函数：
* Mixins（和vue-class-component提供的mixins相同）

## 总结
vue-class-component只提供了@Component、mixins、createDecorator和Component.registerHook等方法。vue-property-decorator是对vue-class-component的补充，继承了其所有能力，并且补充了@Prop等额外的注解。当我们使用的时候，只需要import 'vue-property-decorator'。