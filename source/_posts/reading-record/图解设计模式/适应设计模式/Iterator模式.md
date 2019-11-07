---
title: Iterator模式
date: 2019-10-09 20:23:15
tags:
- 设计模式
- 适应设计模式
- Iterator模式

category:
- 设计模式
- 适应设计模式
---

Iterator模式也翻译成“迭代器模式”，主要作用是对某一个集合的逐个遍历进行抽象。例如，我们常常写：
```js
for (let i = 0;i < arr.length;i++) {
  console.log(arr[i])
}
```

在上例中我们对arr进行了遍历，该示例是对数据进行从前到后的遍历，通过递增的i来实现逐个遍历元素。

而Iterator模式就是对上述形式的抽象，我们提取出上述的遍历行为，而不关心其具体的遍历行为，具体的遍历行为交给具体的实现去完成。

> 设计模式是比较抽象的层面，更加注重的是程序中出现的角色和其相互关系，示例是用来对某一个具体情况来做演示，我们应该首先理解设计模式中的相关角色及其关系，然后了解其使用的场景，最后在根据具体的示例来加深理解和记忆

## 示例
```typescript
// 迭代器模式示例文件，相关的类都在这个文件中

namespace DesignPattern {
  // 将数据集抽象成一个集合
  export interface Aggregate {
    iterator(): Iterator<any>;
  }

  // 将遍历行为抽象成遍历器
  export interface Iterator<T> {
    hasNext(): boolean;
    next(): T;
  }

  // 集合的具体实现，在Iterator模式中并不关心集合内部如何存储数据
  // 只需要实现集合的基本操作：从集合中取数据，向集合中插入数据。将这些接口暴露给遍历器
  // 就可以不关心集合到底如何存数据，如何取数据，这些都是集合内部的事情，达到了解藕的目的
  // 将对集合的具体遍历行为交给遍历器
  export class BookShelf implements Aggregate {
    private bookArr: Book[] = [];
    private len: number = 0;

    constructor(bookArr: Book[]) {
      this.bookArr = bookArr;
    }
    iterator(): Iterator<any> {
      return new BookIterator(this);
    }
    getBookAt(index: number) {
      return this.bookArr[index];
    }
    length() {
      return this.len;
    }
  }

  // 遍历器的具体实现，在Iterator模式中并不关心遍历器如何遍历数据
  // 只需要实现的next、hasnext方法
  // 如何遍历是Iterator内部的事情
  export class BookIterator implements Iterator<Book> {
    private bookshelf: BookShelf = null;
    private index: number = 0;
    constructor(bookshelf: BookShelf) {
      this.bookshelf = bookshelf;
    }
    next(): Book {
      return this.bookshelf.getBookAt(this.index++)
    }
    hasNext(): boolean {
      return this.index < this.bookshelf.length();
    }
  }

  export class Book {
    bookName: string;
    price: number;
    constructor(bookName: string, price: number) {
      this.bookName = bookName;
      this.price = price;
    }
  }
}

// 接下来我们希望对集合进行遍历
// 这样我们就完成了解藕，每个角色只做自己的事情
// 如果想将集合实现从数组改称链表，只要再实现一个新的链表集合，其他的均不需要改动
function main() {
  let arr: DesignPattern.Book[] = [];
  for(var i = 0;i < 10;i++) {
    arr.push(new DesignPattern.Book('name'+i, i+100));
  }
  let bookshelf = new DesignPattern.BookShelf(arr);
  let iterator = bookshelf.iterator();

  while(iterator.hasNext()) {
    console.log(iterator.next());
  }
}
```

## 角色
在Iterator模式中我们出现了以下角色：
* 抽象集合：提供生成遍历器的抽象方法`iterator`
* 抽象遍历器：提供了遍历器必须的抽象方法`hasNext`，`next`
* 集合实现：实现了抽象集合，提供集合的具体实现，包括生成遍历器实例，集合操作等
* 遍历器实现：实现了如何具体的去遍历集合
* 访问者（main方法）：遍历集合

在上面的实现中，遍历器和集合是相互关联的，遍历器知道如何访问集合内部的元素，这样我们才能使用遍历器去访问集合。当修改了集合的实现时，如果暴露给遍历器的API改变了，那么遍历器的实现也要改变。一般不同的集合会有自己的遍历器实现。但是由于我们还有`抽象接口`这一层，事实上我们可以仅仅返回抽象接口，从而完全将对集合遍历这一行为抽象行为。

简单的讲，对访问者而言，其只要调用集合的`iterator`方法，取得Iterator实例，然后用Iterator实例的`next`方法去遍历就行了，其他细节一概不关心。

## 思考
为什么要有这么多角色呢？直接遍历集合不就可以吗？声明这么多角色的目的主要是解藕，如果直接遍历集合，那么集合和其遍历是耦合的。如果我们要修改集合的底层实现，那么其遍历行为也要改变。

一个集合类在一个项目中肯定不只一次使用，那么每一处对集合的遍历都要进行修改。我们将遍历行为抽象出来，遍历就只和遍历器打交道。即便集合修改了导致要修改其对应的遍历器的实现，也最多只需要修改两处。

而且遍历器的行为不一定是从前向后遍历，可以是任意一种遍历形式。我们只需要使用上面的思想进行抽象，可以实现任意独立的不耦合的遍历行为。

同时我们还看到，一个角色只进行独立的工作，这样可以减轻耦合，减小维护成本。