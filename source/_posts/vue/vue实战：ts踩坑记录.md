---
title: vue实战：ts踩坑记录
date: 2019-09-06 07:37:48
tags:
- vue
- vue实战

category:
- vue
- vue实战
---

这篇文章记录了使用ts开发vue时遇到的一些问题和解决方案。内容包括如何使用ts开发vue，用到了哪些库以及在开发时遇到的一些问题。

## 踩坑记录

### @Component
@Component是vue-class-component提供的ts注解，在vue文件中必须使用@Component来将class声明成vue组件，不然成员方法中取到的this就是null。

### @Prop传值问题
当类成员没有初始化器，并且没有显式的在constructor中初始化时，该类成员不会被定义在示例上。此时编译器会报错，但是Prop又不能初始化，初始化也会报错。两种方式解决这个问题。一个是添加编译选项`--strictPropertyInitialization`，另一个是在将成员类型加上`undefined`类型，例如：
```ts
@Prop(String) private readonly placeholder: string | undefined
```

### vue-ts的底层原理
1. vue是如何通过webpack构建的？经历了怎么样的过程？
2. vue的runtime和compiler是如何协同工作的？
3. ts.vue是如何编译成vue再编译成html、css的，中间经历了哪些过程？
4. vue router的工作原理是怎么样的？
5. vuex的工作原理是怎么样的？