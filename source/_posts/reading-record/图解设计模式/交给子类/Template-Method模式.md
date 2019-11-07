---
title: Template Method模式
date: 2019-10-16 20:41:48
tags:
- 设计模式
- 交给子类
- Template Method模式

category:
- 设计模式
- 交给子类
---
在父类中定义处理流程框架，在子类中实现具体处理的模式就称为Template Method模式。这样可以将流程处理和其实现分开，举个例子，我们使用字帖来描字，无论使用什么笔来描，描出来的字形都是一样的；反过来说，使用不同颜色和种类的笔，就可以描出不同颜色的字，就算我没有钢笔，我可以用铅笔来写。在这个例子中，描字这个行为是抽象出来的模板，具体使用什么笔去描是具体的实现。模板和实现是分开的，这样就可以实现解藕的目的。

在Template Method模式中，利用的也是模板的思想，在父类或者接口中定义好处理流程，在子类中去具体实现。这样可以将流程的调用和关系和其实现解藕。在父类中只知道各个方法的调用关系，在子类中去具体实现。

## 角色
在Template Method模式中，只有两种角色，一种是抽象类，一种是具体类。

### 抽象类
抽象类定义了处理流程，具体来说就是相关接口的各方法的调用关系，不涉及接口的具体实现。

### 具体类
具体类是抽象类的实现，负责实现抽象类中定义的方法。

## 示例
```typescript

/**
 * Template Method模式示例
 */

namespace DesignPattern {
  export abstract class AbstractDisplay {
    protected abstract open(): void;
    protected abstract print(): void;
    protected abstract close(): void;
    public display(): void {
      this.open();
      for(let i = 0;i < 5;i++) {
        this.print();
      }
      this.close();
    }
  }

  export class CharDisplay extends AbstractDisplay {
    open(): void {
      console.log('#')
    }
    print(): void {
      console.log('data')
    }
    close(): void {
      console.log('#')
    }
  }

  export class StringDisplay extends AbstractDisplay {
    open(): void {
      console.log('string start')
    }
    print(): void {
      console.log('string print')
    }
    close(): void {
      console.log('string close')
    }
  }
}
function main() {
  const cd: DesignPattern.AbstractDisplay = new DesignPattern.CharDisplay();
  const sd: DesignPattern.StringDisplay = new DesignPattern.StringDisplay();
  cd.display();
  sd.display();
}
main();
```
## 思考
java中的泛型和c++中的模板其实也是一种相同的思想，泛型机制是将类型抽象出来。这样可以将处理逻辑通用化，不同的类型都可以调用这一份代码。

### 泛型可以使逻辑处理通用化
Template method也有这样的优点，假设我们有很多的类，处理流程相同，但是处理细节不同，这样我们可以将具体的流程算法提取出来作为模板。具体的处理过程实现这个模板，假定要修改现有流程，只需要改模板即可。如果没有提取抽象模板，如果有多个类，那么修改流程时，这些所有类都需要修改。**不写重复的代码，这样可以减少工作量，提高可维护性**

### 父类和子类之间的合作
在Template Method模式中，父类和子类是相互关联的，子类必须知道父类的具体实现过程。

与Strategy模式相比，Template模式用于抽象处理逻辑，而Strategy模式用于替换整个算法逻辑。

### 父类和子类的关系
从子类的角度看：
* 可以复用父类已有的方法
* 可以在父类方法的基础上定义自己的方法
* 通过重写父类方法可以改变程序的行为

从父类的角度看：
* 规定子类应该实现的抽象方法

假设我们站在父类的角度思考，我们可以提取所有通过的处理逻辑，而期待子类去实现具体内容。这样在调用的时候，只调用父类的抽象，而不关心具体的实现。

这也是抽象类的作用，抽象类不能实例化，那么不能实例化的类有什么用呢？Template Method给了我们答案，抽象类如其名，用于抽象，将其逻辑和逻辑方法的调用关系抽象出来，具体的实现交给子类。在语法层面贯彻了Template Method的思想。


## 练习题
1. java.io.InputStream使用了Template Mehod模式。找出需要java.io.InputStream的子类需要实现的方法。

答：查看java.io.InputStream的文档，发现其中只有read一个抽象方法，用于读取流中的下一个字节。InputStream中的其他方法都调用这个方法，当我们要自定义InputStream时，只需要实现read方法，其他方法的调用逻辑都写在的InputStream这个抽象类中，这就是一种Template Method模式。

2. 为什么不能用接口来实现Template Method模式呢？
答：因为接口中不包含具体的实现，而Template Method需要定义调用逻辑，需要有具体的实现方法。所以只能用抽象类实现Template Method模式。