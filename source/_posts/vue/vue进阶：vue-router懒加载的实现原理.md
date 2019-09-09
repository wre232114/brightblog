---
title: vue进阶：vue-router懒加载的实现原理
date: 2019-08-30 06:52:36
tags:
- vue
- vue进阶

category:
- vue
- vue-router
---

这篇文章主要分析vue-router懒加载的实现原理。vue-router的懒加载基于vue的异步组件和webpack的splitCode来实现。接下来首先介绍vue的异步组件和webpack的SplitCode，然后介绍vue-router中懒加载执行的底层步骤。

## vue的异步组件
有时候我们需要将应用分割成小的代码块，然后按需加载。vue为了简化异步加载的使用，提供了以工厂函数的形式注册逐渐的方式，如下：
```js

Vue.component('my-comp', function(resolve, reject) {
  // 异步操作，成功调用resolve，传入组件的选项
  setTimeout(()={
    resolve({
      template: "<div>hello world!</div>"
    })
  }, 100)
})
```
我们看到异步组件的工厂函数类似于Promise，传入resolve和reject函数。

vue官方的推荐用法是和webpack的SplitCode功能一起使用，如下:
```js

Vue.component('my-comp', function(resolve,reject){
  // 这里的组件通过ajax异步加载，在构建的时候会
  // 自动打包成多个chunk
  require('./my-async-comp', resolve)
})
// 或者
Vue.component('my-comp', () => import('./my-async-comp'))
// 或者局部注册
new Vue({
  ...
  components: {
    'my-comp': () => import('./my-async-comp')
  }
})
```

异步组件的工厂函数也可以返回一个如下的对象：
```js
const AsyncComponent = () => ({
  // 需要加载的组件 (应该是一个 `Promise` 对象)
  component: import('./MyComponent.vue'),
  // 异步组件加载时使用的组件
  loading: LoadingComponent,
  // 加载失败时使用的组件
  error: ErrorComponent,
  // 展示加载时组件的延时时间。默认值是 200 (毫秒)
  delay: 200,
  // 如果提供了超时时间且组件加载也超时了，
  // 则使用加载失败时使用的组件。默认值是：`Infinity`
  timeout: 3000
})
```

到这里我们已经了解vue的异步组件的基本使用，Vue内部提供了一种类似于Promise的机制用于组件的异步加载，在注册组件的使用允许使用工厂函数来注册，当使用异步组件的使用，会发送ajax请求来获取异步组件