---
title: Factory Method模式
date: 2019-10-17 22:39:03
tags:
- 设计模式
- 交给子类

category:
- 设计模式
- 交给子类
---
在Template Method模式中，我们在父类中规定处理的流程，在子类中实现具体的处理。**如果我们将该模式用于生成实例，就变成了Factory Method模式**。用Template method 模式来构建生成实例的工厂，这就是Factory Method模式。

## 角色
Factory Method模式中，一共有四种角色，抽象工厂、抽象产品、具体工厂、具体产品。
* `抽象工厂`：`抽象工厂`中定义了构建一个产品的流程，但是并没有给出具体的实现，这是Template Method的一种体现
* `抽象产品`：`抽象产品`中定义了一个产品的所有方法定义
* `具体工厂`：`抽象工厂`的实现，具体创建什么产品由具体工厂来决定
* `具体产品`：`抽象产品`的实现，抽象产品的具体行为在具体产品中定义‘

使用抽象类的一个优势就是解藕，抽象类给出模式，而具体类给出实现。程序设计中的一个重要思想就是一段程序只解决一个问题，这样可以将不同的问题分离开，便于开发和维护，同时将单个问题的解进行组合，可以解决复杂问题。

## 示例
我们使用上面的四个角色来给出一个Factory Method模式的示例：
```typescript
/**
 * 工厂模式的示例代码
 */
namespace DesignPattern {
  export abstract class Factory {
    public create(owner: string) {
      const p:Product = this.createProduct(owner);
      this.registerProduct(p);
      return p;
    }
    protected abstract createProduct(owner: string):Product;
    protected abstract registerProduct(product: Product):void;
  }

  export abstract class Product {
    public abstract use():void;
  }

  export class IDCardFactory extends Factory {
    private owners: string[] = [];
    constructor() {
      super();
    }
    protected createProduct(owner: string) {
      return new IDCard(owner);
    }
    protected registerProduct(product: Product) {
      this.owners.push((<IDCard>product).getOwner());
    }
  }

  export class IDCard extends Product {
    owner: string;
    // 构造函数可以也可以见添加访问控制符，例如public，这样可以控制该类可以在哪些范围内可以实例化
    constructor(owner: string) {
      super();
      this.owner = owner;
    }
    public use() {
      console.log(`use ${this.owner}'s id card`);
    }
    getOwner() {
      return this.owner;
    }
  }
}


const factory = new DesignPattern.IDCardFactory();
const names = ['mike', 'jack', 'bob', 'jummy'];
// 在调用的时候，只需要调用Factory的create就能创建Product对象
// 当我们明确知道Product的类型时，可以向下转型，这样可以调用具体类型的中定义的方法
// 当我们不明确知道Product的类型时，或者不需要知道具体类型时，直接向上转型，获得Prodcut类型
names.forEach(item => {
  const p = <DesignPattern.IDCard>factory.create(item);
  p.use();
})
```

上面的示例中我们创建了抽象工厂和抽象产品，然后给出具体产品工厂IDCardFactory以及具体产品IDCard。在抽象工厂中我们定义了生成示例所要执行的一系列流程，先创建产品，再注册产品，**在这里，我们只定义产品创建要执行的流程，并没有给出实现，实现再具体类中，这就是Factory Method模式**。在Factory具体的实现中我们给出要创建怎么样的产品，在Product的具体实现中我们给出了创建的产品的具体性质（owner）。工厂和产品可以是一对一的关系，也可以是一对多的关系，据具体的场景来定。

## 练习
1. 在示例程序中添加卡号以及卡号和所有人的对应关系表。
   答：分析题目，我们脑海中第一个问题一定是：卡号加在哪呢？对应关系表加在哪呢？这需要根据我们的生活，卡号肯定是IDCard的号码，所以其一定是IDCard的属性。对应关系是卡号和其所有人构成，对应关系表一定存着所有的对应关系，肯定不可能在某一个产品示例中，我们可以存在哪呢？Product的静态属性？factory的属性？一个工厂可以要记录下自己生产过哪些实例，这个对应关系表可以存在工厂实例中。所以我们得出答案，卡号添加在IDCard类中，对应关系表添加到工厂中，在工厂中创建实例的时候，将对应关系注册进去。修改后的代码如下：
   ```typescript
    /**
    * 练习代码
    */
   namespace Practice {
     export abstract class Factory {
       public create(owner: string, cardNum: number) {
         const p:Product = this.createProduct(owner, cardNum);
         this.registerProduct(p);
         return p;
       }
       protected abstract createProduct(owner: string, cardNum: number):Product;
       protected abstract registerProduct(product: Product):void;
     }

     export abstract class Product {
       public abstract use():void;
     }

     export class IDCardFactory extends Factory {
       private owners:Map<string, number> = new Map();
       constructor() {
         super();
       }
       protected createProduct(owner: string, cardNum: number) {
         return new IDCard(owner, cardNum);
       }
       protected registerProduct(product: Product) {
         this.owners.set((<IDCard>product).getOwner(), (<IDCard>product).getCardNumber());
       }
       public cardNameMap() {
         return this.owners;
       }
     }

     export class IDCard extends Product {
       private owner: string;
       private cardNumber: number;
       // 构造函数可以也可以见添加访问控制符，例如public，这样可以控制该类可以在哪些范围内可以实例化
       constructor(owner: string, cardNum: number) {
         super();
         this.owner = owner;
         this.cardNumber = cardNum;
       }
       public use() {
         console.log(`use ${this.owner}'s id card, id card number is ${this.cardNumber}`);
       }
       getOwner() {
         return this.owner;
       }
       getCardNumber() {
         return this.cardNumber;
       }
     }
   }

   const factory_p = new Practice.IDCardFactory();
   const names_p = [['mike', 123], ['jack', 456], ['bob', 567], ['jummy', 890]];

   names_p.forEach(item => {
     const p = <DesignPattern.IDCard>factory_p.create(<string>item[0], <number>item[1]);
     p.use();
   })
   console.log(factory_p.cardNameMap());
   ```