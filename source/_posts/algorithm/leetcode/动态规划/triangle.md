---
title: triangle
date: 2020-05-15 09:40:56
tags:
- 算法
- leetcode
- 动态规划

category:
- 算法
- leetcode
---
## 问题描述
给定一个三角形数字矩阵，找到该矩阵从上到下的最小路径和。每一步只能找相邻的路径。例如
```
输入：
[
  [2],
  [3,4],
  [6,5,7],
  [4,1,8,3]
]

输出：
11 (2->3->5->1)
```

## 题解
这是一道典型的动态规划题，假定状态(i,j)为矩阵位置(i,j)开始到底部的最小路径和，那么状态转移方程为(i,j)=MIN((i+1,j),(i+1,j+1)), if j+1 < triangle[i+1}.length或者MIN((i+1,j-1), (i+1,j)), if j-1 >= 0。

上代码：
```js
var minimumTotal = function(triangle) {
  if (triangle.length == 0) return 0;
  if (triangle.length == 1) return triangle[0][0];
  function linearPos(i, j) {
    return ((i+1)*i)/2 + j + 1;
  }
  for (var i = triangle.length - 1;i >= 0;i--) {
    for (var j = 0;j < triangle[i].length;j++) {
      var pos = linearPos(i,j);
      if (i+1 == triangle.length) {
        dp[pos] = triangle[i][j];
      } else {
        if (j+1 < triangle[i+1].length) {
          dp[pos] = triangle[i][j]+Math.min(dp[linearPos(i+1,j), dp[linearPos(i+1,j-1)]]);
        } else if (j-1 >= 0) {
          dp[pos] = triangle[i][j]+Math.min(dp[linearPos(i+1,j-1)], dp[linearPos(i+1,j)]);
        }
      }
    }
  }
  return dp[1];
}
```
时间复杂度O(n2)，空间复杂度O(n2)，使用一维数组而不是二维数组可以减少一半的存储空间。

### 存储空间优化
上述解法是O(n2)的空间复杂度，如果可以修改原triangle数组，那么空间复杂度可以降到O(1)，triangle[i][j]直接表示状态(i,j)的最小路径和。如果不能修改triangle数组，那么空间复杂度也可以降到O(n)，其实只需要两个O(n)的一维数组就可以完成计算。例如使用两个数组dp[0]和dp[1]，dp[1]表示下一行的计算结果，dp[0]表示本行的计算结果。dp[0]计算完成后，dp[0]作为下一行，dp[1]作为本行，如此循环。