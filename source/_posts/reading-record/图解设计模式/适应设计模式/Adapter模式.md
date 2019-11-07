---
title: Adapter模式
date: 2019-10-11 21:33:35
tags:
- 设计模式
- 适应设计模式
- Adapter模式

category:
- 设计模式
- 适应设计模式
---
Adapter模式用于解决现有程序无法直接使用的问题，通过进行一定的适配，就能够在**不修改源程序**的基础上，使用现有程序的功能。宏观来说，只要两个接口不一样，而且有一定的练习，就可以考虑用适配器来进行适配，以达到弥补接口差异的目的。

## 角色
适配器模式中会出现三种角色：
* 使用者：希望使用某一项功能，提出某种需求
* 适配器：将`被适配者`的能力转换，转换成需求的形式
* 被适配者：被适配的对象

## 什么时候使用Adapter模式？
### 需要复用已有的类的时候
需要复用已有的经过稳定测试的类的一些功能，希望通过一些处理复用已有的逻辑。如果要基于已有的功能添加新的功能，这种模式叫做**装饰器模式（Decorator）

### 适配新的接口
假如我们开发了新的API，现有的类需要适配新的API，现有的类一般都是经过测试的。如果直接修改现有的类，需要重新测试，而且可能会影响原有的功能，这样我们可以使用适配器模式

## 兼容老版本
我们开发了新版本，但是希望可以向下兼容老版本，可以通过适配器将老版本的API映射到新版本实现向下兼容。

## 实例
示例我们基于之前实现的Iterator模式样例来实现，假定我们现在的需求是一个需要跳跃遍历的Iterator。利用Iterator模式解藕的特性，我们可以很容易的实现一个新的`BookJumpIterator`，但是这样的话，我们需要重新写一个BookJumpIterator类，而其实现其实是和BookIerator类似的，我们就要编写一个可能费时又重复的类。**这时候适配器模式就是更好的解决方案**，我们通过一个适配器，将已有的BookIterator转换成我们想要的样子，这样工作量小，还放心不会有很多bug（因为BookIterator是经过严格测试的，即便要测试，重点测一下BookIterator就行了），岂不是很完美！

上代码：
```typescript
import { DesignPattern as Iterator } from './Iterator'

namespace DesignPattern {
  // 这个适配器模式我们基于之前实现的Iterator来实现
  // 利用适配器模式实现一个跳跃遍历的遍历器
  
  // 我们需要的接口类型如下
  export interface JumpIterator {
    hasNext(): boolean;
    jumpNext(): Iterator.Book;
  }

  // 被适配的接口类型：BookIterator

  // 适配器
  export class JumpIteratorAdapter extends Iterator.BookIterator implements JumpIterator {
    constructor(bookshelf: Iterator.BookShelf) {
      super(bookshelf);
    }
    jumpNext(): Iterator.Book {
      this.next();
      return this.next();
    }
  }
}
```
适配器模式有两种实现方式，上一种叫做`继承实现`，另一种是`委托实现`，我们看一下委托实现：
```typescript
export abstract class JumpIterator {
  public abstract hasNext(): boolean;
  public abstract jumpNext(): Iterator.Book;
}

export class JumpIteratorAdapter extends JumpIterator {
  bookiterator: Iterator.BookIterator = null;
  constructor(arr: Iterator.BookShelf) {
    super();
    this.bookiterator = new Iterator.BookIterator(arr);
  }
  public hasNext() {
    return this.bookiterator.hasNext();
  }
  public jumpNext(): Iterator.Book {
    this.bookiterator.next();
    return this.bookiterator.next();
  }
}
```
区别就是一个是通过继承获取原始类的能力，另一个是通过实例化一个原始类作为属性。

## 练习
Node.js可以通过stream.Readable和stream.Writable来获取输入输出流的能力。

我们需要一个可以读入键值对并输出到文件的接口，现在已经有一个从流中读入、写出属性的类Properties，希望写一个适配器，将该类适配成能从文件中读入、写出键值对的类FileProperties。

Properties提供的接口如下：
```typescript
interface Properties {
  // 从输入流中取出键值对
  load(in: Readable): void;
  // 向输出流中写入属性集合，header是注释文字
  store(out: Writable, header: string): void;
}
```
需求的接口如下：
```typescript
export interface FileIO {
  readFromFile(filename: string): void;
  writeToFile(filename: string): void;
  setValue(key: string, value: string): void;
  getValue(key: string): string;
}
```

答：

我们的目的是实现一个适配器，将已有的接口转换成我们需要的FileIO中的接口，通过观察，Properties提供了从流中读入输出键值对的方法，而我们想要的是给定文件名，能够从文件中读入输出键值对，我们需要做的就是，将文件名转成流，这样就可以对接上Properties的接口，正好文件流是一种非常常见的形式：
```typescript
export class FileProperty extends Properties implements FileIO {
    readFromFile(filename: string): void {
      const readable = fs.createReadStream(filename);
      this.load(readable);
    }    
    writeToFile(filename: string): void {
      const writable = fs.createWriteStream(filename);
      this.store(writable);
    }
    setValue(key: string, value: string): void {
      this.properties[key] = value;
    }
    getValue(key: string): string {
      return this.properties[key];
    }
  }
```
### 完整代码
```typescript
import { Readable, Writable } from "stream";
// Adapter模式的练习题
namespace Practice {
  export class Properties {
    protected properties = {};
    public load(readable: Readable): void {
      let data = '';
      readable.setEncoding('utf8');
      readable.on('data', (chunk) => {
        data += chunk;
      });
      readable.on('end', () => {
        let arr = data.split('\n');
        arr.forEach((item: string) => {
          let prop = item.split('=');
          this.properties[prop[0]] = this.properties[prop[1]];
        })
      })
    }
    public store(writable: Writable): void {
      let keys = Object.keys(this.properties);
      for(let key of keys) {
        writable.write(key+'='+this.properties[key]+'\n');
      }
      writable.end();
    }
  }

  export interface FileIO {
    readFromFile(filename: string): void;
    writeToFile(filename: string): void;
    setValue(key: string, value: string): void;
    getValue(key: string): string;
  }

  export class FileProperty extends Properties implements FileIO {
    readFromFile(filename: string): void {
      const readable = fs.createReadStream(filename);
      this.load(readable);
    }    
    writeToFile(filename: string): void {
      const writable = fs.createWriteStream(filename);
      this.store(writable);
    }
    setValue(key: string, value: string): void {
      this.properties[key] = value;
    }
    getValue(key: string): string {
      return this.properties[key];
    }
  }
}
```

## 思考
适配器模式更多的是弥补不同接口之间的差异，达到复用已有功能的目的，对比于Decorator（装饰器）模式，适配器模式不会增加新的功能，适配器模式只利用利用已有的能力对不同的接口进行适配，以此来达到兼容性的复用已有的组件、向下兼容等目的。

如上面的练习中的适配，需求的接口和已有的接口不一致，我们可以通过一个适配器进行适配，弥补这个差异。也如上面的示例，我们通过适配器，将已有的Iterator的能力转换，以得到新的接口。