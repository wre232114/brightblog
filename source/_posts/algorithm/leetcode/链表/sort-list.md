---
title: sort list
date: 2019-11-06 11:50:18
tags:
- 算法
- leetcode
- 链表
category:
- 算法
- leetcode
---

## 问题
给定一个数组，在O(nlogn)的时间复杂度和常量空间复杂度内对该链表排序。

```
Example 1:

Input: 4->2->1->3
Output: 1->2->3->4
Example 2:

Input: -1->5->3->4->0
Output: -1->0->3->4->5
```
## 思路
要在O(nlogn)的时间复杂度内排序，我们可以考虑使用分治算法。核心问题就是如何分合，链表不像数组那样好取到数组中的任何一个元素。但是我们可以通过遍历链表来取到中间元素和最后一个元素，通过改变遍历的速率。

分治算法的通用伪代码如下：
```
devide_conquer(list):
  [left, middle, right] = partition(list)
  divide_conquer(left, middle)
  divide_conquer(middle, right)
  merge(left, middle, right)
```
大致的思想就是：分->计算左右->合。其中我们要保证分、合的最大时间复杂度为O(n)，这样才能保证整体的时间复杂度是O(nlogn)。

## 实现
先上代码，然后再分析：
```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var sortList = function(head) {
  if (head == null || head.next == null) return head;
  else {
    var p = partition(head);
    var h1 = sortList(p[0]);
    var h2 = sortList(p[1]);
    return merge(h1, h2);
  }
};

function partition(head) {
  var slower = head,
    faster = head.next;
  while (faster !== null) {
    faster = faster.next;
    if (faster) {
      faster = faster.next;
      slower = slower.next;
    }
  }
  var next = slower.next;
  slower.next = null;
  return [head, next];
}

function merge(h1, h2) {
  var h = null,
    ht = null;
  while (h1 || h2) {
    var t;
    if (!h2) {
      t = h1;
      h1 = h1.next;
    } else if (!h1) {
      t = h2;
      h2 = h2.next;
    } else {
      if (h1.val >= h2.val) {
        t = h2;
        h2 = h2.next;
      } else {
        t = h1;
        h1 = h1.next;
      }
    }
    if (!h) {
      h = ht = t;
    } else {
      ht.next = t;
      ht = t;
    }
  }
  return h;
}
```
可以看到我们的算法严格遵循了上面的伪代码公式，但是我们要注意的有三点：
* partition和merge的时间复杂度必须在O(n)之内
* partition采用了“不同步长”的思想，通过两个指针，一个步长为1，一个步长为2，来找到中间位置的节点，需要主要的是边界条件，步长为二的从第二个节点开始，这样才能保证步长为1的节点在中间位置。
* merge和归并算法的merge完全相同，注意while(h1 || h2)
* 注意边界条件，当递归到只有一个节点时，结束递归