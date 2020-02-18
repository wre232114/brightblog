---
title: leetcode题解：Merge Two Binary Trees
date: 2019-12-13 10:05:34
tags:
- 算法
- leetcode
- 二叉树

category:
- 算法
- leetcode
---
## 问题描述
Given two binary trees and imagine that when you put one of them to cover the other, some nodes of the two trees are overlapped while the others are not.

You need to merge them into a new binary tree. The merge rule is that if two nodes overlap, then sum node values up as the new value of the merged node. Otherwise, the NOT null node will be used as the node of new tree.

Example 1:
```
Input: 
	Tree 1                     Tree 2                  
          1                         2                             
         / \                       / \                            
        3   2                     1   3                        
       /                           \   \                      
      5                             4   7                  
Output: 
Merged tree:
	     3
	    / \
	   4   5
	  / \   \ 
	 5   4   7
```

Note: The merging process must start from the root nodes of both trees.

## 问题解析
这个题的要求是：给定两棵树，然后将这两棵树重叠，两个非空的重叠的节点的值相加作为新节点的值，一个空一个不空的重叠的节点，不空的直接覆盖空的。

我们很容易想到，同时深度优先遍历两颗二叉树，即两个树中每次遍历的节点在树中的位置相同。如果两个节点非空，直接相加作为新的重合节点。在遍历时，可以以一棵树为基准，例如就遍历左边的树。那如果遇到了左边子树为空，右边子树不空的情况呢？需要再遍历右边的子树吗？当然不用，直接将右边的子树拿过来就可以了。

所以遍历的时候，以其中一棵树为基准，只有两个树相同位置的节点都不为空时继续遍历。同时也不同新建一个树来存储，可以直接将结果放在基准树中。

这里可以采用前序遍历，有递归和非递归两种形式，下面分别给出代码：

递归形式：
```js
var mergeTrees = function(t1, t2) {
    return recursive(t1,t2);
};

function recursive(t1, t2) {
    if(t1 && t2) {
        t1.val = t1.val + t2.val;
        t1.left = recursive(t1.left, t2.left);
        t1.right = recursive(t1.right, t2.right);
        return t1;
    } else {
        return t1 || t2;
    }
}
```
注意递归形式中，递归处理左子树和右子树，当其中一个节点为空时，直接返回非空节点即可。

非递归形式：
```js
var mergeTrees = function(t1, t2) {
   var stack = [], h = t1 || t2,p = [];
    while(true) {
        if(t1 && t2) {
            stack.push([t1,t2]);
            t1.val = t1.val + t2.val
            p[0] = t1;
            t1 = t1.left;
            t2 = t2.left;
        } else {
            // 如果左边为空，并且有父节点，将右边相同位置的节点直接赋过来
            if(!t1 && p[0]) {
                // 需要判断处理的是父节点的左子树还是右子树
                if(stack.length && stack[stack.length-1][0] == p[0]) p[0].left = t2;
                else p[0].right = t2;
            }
            // 出栈，访问右子树
            if(stack.length) {
                p = stack.pop();
                t1 = p[0].right;t2 = p[1].right;
            } else if(!stack.length) break;
        }
    }
    return h;
};
```
注意非递归形式我们要记住父节点，同时要判断当前处理的是父节点的左子节点还是右子节点。