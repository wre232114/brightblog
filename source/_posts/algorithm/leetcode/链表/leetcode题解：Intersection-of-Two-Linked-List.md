---
title: leetcode题解：Intersection of Two Linked List
date: 2019-11-30 07:34:54
tags:
- 算法
- leetcode
- 链表

category:
- 算法
- leetcode
---

## 问题
Write a program to find the node at which the intersection of two singly linked lists begins.

For example, the following two linked lists:
![example](https://assets.leetcode.com/uploads/2018/12/13/160_statement.png)

begin to intersect at node c1.

## 解析
根据题目描述，给定两个链表，我们要找出链表公共部分的起始节点。要求在O(n)时间复杂度、O(1)空间复杂度内解决。所给的链表都没有环。

有三种方法：
1. 第一种也是我们最容易想到的方法：对于每一个A的节点，遍历B，直到找到相同地址的节点。时间复杂度O(mn)，空间复杂度O(1)
2. 第二种是哈希表：直接将一个链表节点做hash，然后遍历B，如果B的节点在hash表中，则找到。时间复杂度O(m+n)，空间复杂度O(m)或O(n)
3. 第三种是双指针法：这种是最推荐的方法，时间复杂度是O(m+n)，空间复杂度O(1)，接下来我们具体分析这种方法。

## 双指针法
> 这里所说的双指针法是一种笼统的概括，具体就是用两个指针去解决问题。至于如何移动这两个指针，指针指向的初始位置在哪，在不同的题目中都不一样，有的题目是头尾两个指针，有的是两个指针指向不同的位置。

那这里的双指针怎么指呢？一个指向A一个指向B吗？那A的每一个节点和B的每一个节点都有可能是相同的，可能的情况不是有O(mn)中吗？怎么做到O(m+n)呢？

这里我们用到了一些技巧，看下图：
```
A      B    S
[1,2,3][4,5,2,3]

B        A  S
[4,5,2,3][1,2,3]
```
这里我们是要找公共的后缀，那么A和B一定在尾部有相同的部分，我们将B接在A后面，得到长度为m+n的链表；A接在B后面，也得到长度为m+n的链表。二者两个链表尾部一定有一部分是相同的（上图中的S）。

所以我们用两个指针，一个指向A，一个指向B，同时每次移动一个节点，直到两个指针的值相同。如果存在就找到了公共的，如果不存在，就说明没有公共部分。

## 代码
```c
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     struct ListNode *next;
 * };
 */
struct ListNode *getIntersectionNode(struct ListNode *headA, struct ListNode *headB) {
    struct ListNode *tha = headA;
    struct ListNode *thb = headB;
    
    int flaga = 0, flagb = 0;
    while(tha && thb) {
        if(!tha || !thb) {
            return NULL;
        }else if( tha == thb) {
            return tha;
        }
        tha = tha->next;
        thb = thb->next;
        if(!tha && !flaga) {
            flaga = 1;
            tha = headB;
        } 
        if(!thb && !flagb) {
            flagb = 1;
            thb = headA;
        }
    }
    return NULL;
}
```
## 思考
这个题目中，用枚举法是O(mn)。但是我们发现了公共后缀子串的性质——将子串拼接起来后缀相同。我们不需要枚举所有可能的情况，利用这个性质，我们只需要判断一部分情况就能得到正确的结果。