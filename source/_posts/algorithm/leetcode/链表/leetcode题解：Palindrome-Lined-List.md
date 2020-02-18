---
title: leetcode题解：Palindrome Lined List
date: 2019-12-12 07:12:56
tags:
- 算法
- leetcode
- 链表

category:
- 算法
- leetcode
---
## 问题描述
Given a singly linked list, determine if it is a palindrome.

Example 1:
```
  Input: 1->2
  Output: false
```
Example 2:
```
  Input: 1->2->2->1
  Output: true
```
Follow up:
Could you do it in O(n) time and O(1) space?

## 问题分析
本题需要判断一个链表是不是一个回文串，回文串的性质是顺着读和倒着读是完全一样的，即$a_{i}=a_{n-i-1}$。在数组中我们只要顺着和倒着比一遍就可以了，但是在链表中，只能单向遍历，现在要解决的问题就是如何反向遍历。

在不考虑时间复杂度和空间复杂度的情况下，很容易想到下面两种方案：

方案1：找到节点$a_{i}$和$a_{n-i-1}$，比较两者，其中i<=n/2。这样的时间复杂度是$O(n^2)$，空间复杂度是`O(1)`。
方案2：利用栈反转链表，然后逐个比较，这样的时间复杂度是O(n)，空间复杂度是O(n)。

然而我们的最佳方案需要O(n)的时间复杂度，O(1)的空间复杂度，能不能进一步优化呢？答案是肯定的。在方案2中我们利用栈反转链表，那么能不能不用栈就反转链表呢？答案也是肯定的，这个题是可以改变原链表的，所以我们直接修改原链表没有问题。O(n)时间复杂度，O(1)空间复杂度的反转链表的算法如下：
1. 两个指针a,b初始都指向链表头部，移动b到b->next
2. 临时指针指向头部a，a=b，b=b->next，a->next=临时指针
3. 重复2，直到b为空

```
a  b
A->B->C->D
   a b
A<-B C->D
      a b
A<-B<-C D
         a  b
A<-B<-C<-D->NULL
```
最终方案：将链表分成左右两部分，反转右边的部分，然后逐次比较左右是否相同。
> 寻找链表的中间位置：通过两个指针遍历，一个步长为1，另一个步长为2，这样就可以找到中间位置。奇数个节点找到的是最中间的，偶数个找到的是中间靠右的。

## 代码
```c
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     struct ListNode *next;
 * };
 */
struct ListNode* findCenterNode(struct ListNode* head) {
  struct ListNode *temp1 = head, *temp2 = head;
  while(temp2 && temp2->next) {
    temp1 = temp1->next;
    temp2 = temp2->next->next;
  }
  return temp1;
}
struct ListNode* reverseLinkedList(struct ListNode* head) {
  struct ListNode *temp1 = head, *temp2 = head->next;

  temp1->next = NULL;
  while(temp2) {
    struct ListNode* temp = temp1;
    temp1 = temp2;
    temp2 = temp2->next;
    temp1->next = temp;
  }
  return temp1;
}
bool isPalindrome(struct ListNode* head){
  if(head == NULL) return true;
  struct ListNode* cNode = findCenterNode(head);
  struct ListNode* reversedNode = reverseLinkedList(cNode);
  
  struct ListNode* p1 = head, *p2 = reversedNode;

  while(p1 != cNode && p2 != NULL) {
    if(p1->val != p2->val) return false;
    p1 = p1->next;
    p2 = p2->next;
  }
  return true;
}
```