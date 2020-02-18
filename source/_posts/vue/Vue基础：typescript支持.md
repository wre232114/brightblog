---
title: Vue基础：typescript支持
date: 2019-09-03 06:54:50
tags:
- vue
- vue基础

category:
- vue
- 基础
---

这篇文章介绍了如何在vue项目使用typescript。vue官方为Vue core、Vue Router、Vuex提供了相应的声明文件。Vue项目的根目录可以使用tsconfig.json来配置typescript编译器的行为，通过vue-cli3可以直接生成启用typescript的项目。最后简要介绍Vue中typescript的基本用法，可以使用基于类的API，也可以使用Vue.component或者Vue.extend。

## 推荐配置
tsconfig.json
```json
"compilerOptions": {
  "target": "es5", // 与vue的浏览器支持保持一致
  "strict": true,
  "module": "es2015",
  "moduleResolution": "node"
}
```
需要引入strict: true（或者至少noImplicitThis: true）以利用组件方法中this的类型检查，否则它始终会被看作any类型。

## 开发工具链
### 工程创建
Vue CLI 3可以使用Typescript生成新工程。创建方式：

> npm install --global @vue/cli
> vue create my-project-name

在cli中可以选择typescript，脚手架会自动生成支持typescript的项目文件

### 编辑器支持
vscode中有Vetur插件，支持vue的SFC(单文件组件)。

## 基本用法
要让TypeScript正确推断Vue组件选项中的类型，需要使用Vue.component或Vue.extend定义组件：

```typescript
import Vue from 'vue'
const Component = Vue.extend({
  // 类型推断已启用
})

const Component = {
  // 这里不会有类型推断
  // 因为typescript不能确认这是Vue组件的选项
}
```

## 基于类的Vue组件
Vue官方维护的vue-class-component装饰器来使用基于类的API，vue-class-component和vue-property-decorator在单独的文章中介绍。

```typescript
import Vue from 'vue'
import Component from 'vue-class-component'

// @Component修饰符注明了此类（MyComponent）为一个Vue组件
@Component({
  // 所有的组件选项都可以放到这里，比如components等
  template: '<button @click="onclick">Click!</button>'
}) // 注解是修饰这个MyComponent类的
export default class MyComponent extends Vue {
  // 初始数据可以直接声明为实例的属性
  message: string = 'Hello'

  // 组件方法直接声明成实例的方法
  onClick(): void {
    window.alert(this.message)
  }
}
```

### 增强类型以配合插件使用
vue插件可以扩展vue的全局/实例属性，但是这些扩充的实例属性在Vue官方的类型说明里面并没有。如果我们需要自己制作typescript插件，就需要自己来扩展类型声明。

typescript有一个特性来补充现有的类型，叫做模块补充。

例如，声明一个类型为string的实例属性$myProperty：
```typescript
// 1. 确保在声明补充的类型之前导入vue
import Vue from 'vue'

// 2. 定制一个文件，设置你想要补充的类型，在types/vue.d.ts里有Vue有构造函数类型
declare module 'vue/types/vue' {
  // 3. 声明为Vue补充的东西
  interface Vue {
    $myProperty: string
  }
}
```

在项目中包含了上述作为声明文件的代码之后（像my-property.d.ts），就可以在vue实例上使用$myProperty了。

```typescript
var vm = new Vue()
console.log(vm.$myProperty) // 将顺利通过编译
```
也可以声明额外的属性和组件选项:
```typescript
import Vue from 'vue'

declare module 'vue/types/vue' {
  // 可以使用VueConstructor接口来声明全局属性
  interface VueConstructor {
    $myGlobal: string
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    myOption?: string
  }
}
```

## 标注返回值
typescript可能在推断某个方法的类型时存在困难。因此，可能需要在render或computed里的方法上标注返回值。

返回类型一般来说在typescript中可以自动推导，例如`a(){return 1;}`，a的返回类型会被推导为`number`，当不自动推断时，需要手动：`a():number {return 1;}`
```typescript
import Vue, { VNode } from 'vue'

const Component = Vue.extend({
  data () {
    return {
      msg: 'Hello'
    }
  },
  methods: {
    // 需要标注有 `this` 参与运算的返回值类型
    greet (): string {
      return this.msg + ' world'
    }
  },
  computed: {
    // 需要标注
    greeting(): string {
      return this.greet() + '!'
    }
  },
  // `createElement` 是可推导的，但是 `render` 需要返回值类型
  render (createElement): VNode {
    return createElement('div', this.greeting)
  }
})
```
如果发现类型推导或者成员补齐不工作了，使用--noImplicitAny选项会帮助找到这些未标注的方法。