---
title: unique path II
date: 2020-05-09 21:35:06
tags:
- 算法
- leetcode
- 动态规划

category:
- 算法
- leetcode
---
## 问题描述
给定一个二维格子矩阵，一个机器人初始位于最左上角，每次只能向右或者向下移动一个格子，格子有两种，有障碍物的和没有障碍物的，没有障碍物的可以走。求机器人的最大路线数。

例如：
```
输入:
[
  [0,0,0],
  [0,1,0],
  [0,0,0]
]
输出：
2

因为中间的1挡住了，从左上角到右下角只有两种可能的走法，先右再下或者先下再右。
```

## 题解
动态规划，设状态(i,j)为到达位置(i,j)的最大路径数，状态转移方程为(i,j) = (i,j-1)+(i-1,j)，因为只有从左边和上面能到(i,j)。注意处理一下边界条件，代码如下：
```js
function aa(obstacleGrid) {
  if (obstacleGrid.length == 0 || obstacleGrid[0].length == 0) return 0;
  var dp = [];
  for (var i = 0; i < obstacleGrid.length; i++) dp[i] = [];
  dp[0][0] = 1;
  for (var i = 0; i < obstacleGrid.length; i++) {
    var column = obstacleGrid[i];
    for (var j = 0; j < column.length; j++) {
      if (!dp[i][j]) dp[i][j] = 0;
      if (!obstacleGrid[i][j]) {
        if (i - 1 >= 0) dp[i][j] += dp[i - 1][j];
        if (j - 1 >= 0) dp[i][j] += dp[i][j - 1];
      }
    }
  }
  return dp[obstacleGrid.length - 1][obstacleGrid[0].length - 1];
}
```