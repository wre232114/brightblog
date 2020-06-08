---
title: unique binary search trees ii
date: 2020-05-12 08:35:30
tags:
- 算法
- leetcode
- 二叉树
- 动态规划

category:
- 算法
- leetcode
---
## 问题描述
给一个整数n，生成所有包含值1...n的可能的独特的BST。
例如：
```
输入：3
输出：
[
  [1,null,3,2],
  [3,2,null,1],
  ...
]

解释：
1       3
 \     /
  3   2      ...
 /   /
2   1
```

## 题解
### 递归
最容易想到的方法当然是递归了，对于1...n中的每一个值i，都有可能是树根。
如果i是树根，那么[0...i-1]的结果集构成左子树，[i+1...n]的结果集构成右子树，左右子树结果集两两组合就是最终结果。

整体思路是这样，最开始要求的是[1,n]这个这个范围的所有可能BST，然后遍及[1,n]中的每一个值i，将i作为根结点。
比小的肯定是i的左子树中的节点。
递归处理[1,i-1]作为左子树的结果集（返回一个数组），递归处理[i+1,n]作为右子树的结果集（返回一个数组），
然后将这两个结果集两两组合作为i的左子树和右子树。代码如下：

```js
var generateTrees = function(n) {
  return generate(1, n);
};
function generate(left, right) {
  if (left > right) return [];
  var res = [];
  for (var i = left;i <= right;i++) {
    var ln = generate(left, i-1);
    var rn = generate(i+1, right);
    if (rn.length==0&&ln.length==0) {
      res.push({val:i,left:null,right:null});
    } else if (rn.length==0) {
      for (var l = 0;l < ln.length;l++) {
        res.push({val:i,left:ln[l],right:null});
      }
    } else if (ln.length == 0) {
      for (var r = 0;r < rn.length;r++) {
        res.push({val:i,left:null,right:rn[r]});
      }
    } else {
      for (var l = 0;l < ln.length;l++) {
        for (var r = 0;r < rn.length;r++) {
          res.push({val:i,left:ln[l],right:rn[r]});
        }
      }
    }
  }
  return res;
}
```

### 结果缓存
上面的递归算法是不是可以进一步优化呢？观察到(left,right)之间的结果是一个固定的结果，也就是(1,3)这个范围限定了，那么其结果集也限定了。
但是再上面的递归算法中，其实存在重复计算，考虑5会求3，6也会求3，这样就重复求了两次。将(1,3)的结果缓存了，就不需要重复求了。

改造一下代码：
```js
function generate(left, right, cache) {
  if (left > right) return [];
  if (cache[left][right]) return cache[left][right];
  var res = [];
  for (var i = left; i <= right; i++) {
    var ln = generate(left, i - 1, cache);
    var rn = generate(i + 1, right, cache);
    // ...
  }
  cache[left][right] = res;
  return res;
}
```

## 动态规划
将(left,len)状态定义为[left,left+len-1]的BST数组，那么`(left,len+1)=(left,i-1)*i*(i+1,len+left-i)`，其中i为[left,left+len-1]
中的任意元素（结果求和），`*`表示结果组合。

代码如下：
```js
// 结构和generate类似，只不过改成循环，注意边界条件判断，今天时间有限就不写代码了
```