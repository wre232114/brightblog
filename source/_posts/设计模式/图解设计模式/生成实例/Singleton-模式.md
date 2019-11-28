---
title: Singleton 模式
date: 2019-10-21 21:49:50
tags:
- 设计模式
- 生成实例

category:
- 设计模式
- 生成实例
---
在我们的程序中，我们可能只希望某一个类始终只有一个实例，例如可视化程序中的一个窗口，或者表示程序设置的类。Singleton模式（单例模式）要达到下面两个目的：
* 确保任何情况下都只生成一个实例
* 在程序上体现出来“只存在一个实例”

## 角色
单例模式中只有一个角色，就是只有一个实例的类，该类是一个具体类，有一个静态方法getInstance用于获取该类的实例。

## 实例
```typescript
/**
 * 单例模式实例代码
 */
namespace DesignPattern {
  export class Singleton {
    private static singleton: Singleton = null;
    private constructor() {
      console.log('生成了一个实例');
    }
    public static getInstance(): Singleton {
      if(Singleton.singleton === null) {
        Singleton.singleton = new Singleton();
      }
      return Singleton.singleton;
    }
  }
}

DesignPattern.Singleton.getInstance();
DesignPattern.Singleton.getInstance();
DesignPattern.Singleton.getInstance();
DesignPattern.Singleton.getInstance();
```
在上例中，只有一个类，类只有静态属性，构造函数是private，这样可以保证不能在类的外部通过new实例化。只能通过`getInstance`来获取实例