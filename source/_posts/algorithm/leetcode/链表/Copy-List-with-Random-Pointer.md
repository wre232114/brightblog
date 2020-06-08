---
title: Copy List with Random Pointer
date: 2020-05-06 20:56:31
tags:
- 算法
- leetcode
- 链表

category:
- 算法
- leetcode
---
## 问题描述
给定一个链表，给出该链表的深克隆结果。链表的结构如下：
```c
struct Node {
  int val;
  Node* next;
  Node* random;
}
```
random是指向任意链表中任意节点的指针。

## 题解
克隆一个链表很容易，直接根据next遍历链表，然后对每个节点生成一个相同的节点不就可以了。想法是这样，但是有一个问题，random怎么处理呢？random的问题又可以分为下面三问题：
1. random指向的节点在链表的什么位置？
2. 该结点是否已经被克隆过了？
3. 怎么通过位置找到克隆的节点呢？

第一个问题是，我们已经知道了源链表的random指向的节点，那么我们怎么直到克隆的random指向哪一个克隆的节点呢？答案是可以通过位置来判断，源链表指向链表中的第几个节点，克隆的链表的random也指向第几个节点。所以现在问题就变成了，已知random指向的对象，如何知道它是第几个节点。最简单粗暴的方式就是遍历链表，找到该结点，然后返回该节点的序号。这样每次找random都需要遍历依次链表，事件复杂度是O(n2)。

另一种解决方案是将节点在链表中的序号存起来，可以采用键为对象的hash表，或者在对象中增加一个属性记录序号。本解法使用javascript采用第二种方式。这样第一个问题就解决了。

第二个问题是，怎么知道random指向的对象是否被克隆了呢？一种方法是比较当前的序号和random节点的序号，如果当前的大，则random节点已经克隆了；如果小，则random节点还没有克隆。已经克隆的情况比较简单，没有克隆时怎么办呢？是先克隆，还是记录位置稍后克隆呢？如果先克隆，则要额外的结构记录和标记该位置的节点是否被克隆（例如一个标记数组），如果后克隆也要记录，当对应的节点被克隆时，设置这个节点的random指向（例如一个map）。

另一种方法是先直接克隆链表，第二次再设置random，这种实现方式的事件复杂度稍微高一点（但也是同一个量级），本解法采用这种方式。这种解法能够保证所有节点都被克隆并且不会重复克隆。采用这种解法需要解决第三个问题，第一个问题已经知道了源链表中一个节点所在的序号，第三个问题需要由序号找到已克隆的节点，采用hash表的方式可以降低事件复杂度。

代码如下：
```javascript
// function Node(val, next, random) {
//   this.val = val;
//   this.next = next;
//   this.random = random;
// }
var copyRandomList = function(head) {
  var temp = head;
  var res = null, tres = null, lastres = null;
  function init(t) {
    return {
      val: t.val,
      next: null,
      random: null
    };
  }
  var resmap = {};
  var index = 0;
  // 第一遍记录序号并克隆，同时记录序号和被克隆节点的映射
  while(temp != null) {
    if (res == null) {
      res = init(temp);
      tres = lastres = res;
    } else {
      tres = init(temp);
      lastres.next = tres;
      lastres = tres;
    }
    temp._index = index;
    resmap[index] = tres;
    index++;
    tepm = temp.next;
  }
  temp = head;
  tres = res;
  while(temp != null && tres != null) {
    var random = temp.random;
    if (random) random = resmap[random._index];
    else random = null;
    tres.random = random;
    temp = temp.next;
    tres = tres.next;
  }
}
```