---
title: maximum product subarray
date: 2020-05-17 09:52:12
tags:
- 算法
- leetcode
- 分治
- 动态规划

category:
- 算法
- leetcode
---
## 问题描述
给定一个整数数组nums，找到数组内有最大乘积的最大连续子数组。

例如：
```
输入：[2,3,-2,4]
输出：6
2*3 = 6
```

## 题解
这道题是典型的分治问题。类似的问题还有最大连续子数组的最大和。思路就是将数组分成左右两个部分，对左右分别求出最大值，然后求出合并之后的最大值，取三者之中的最大值。

分治问题的难点在于如何“合”，如果“分”的时间复杂度和“合”的时间复杂度均为O(n)及以下，那么分治算法的总时间复杂度为O(nlogn)。在这道题里面，积的特点是负数乘负数能够得到正数，与求和的问题不同。所以“合”的时候要注意两个要点：
1. 分成左右两部分，对左边从右到左求乘积，记录最大值和最小值；对右边从左到右求乘积，记录最大值和最小值
2. 最大积就是左右最大值最小值组合相乘的四种情况中的最大值，因为可能有“负负得正”的情况，就把可能的情况都算了一下

代码：
```js
function recursive(left, right, nums) {
  if (right - left === 1) return nums[left];

  // +1是为了统一数组项奇数个数和偶数个数的情况（不加1也可以，个人习惯），例如(4+1)/2=2，(3+1)/2=2，
  var center = Math.floor((left+right+1)/2);
  var lv = recursive(left, center, nums);
  var rv = recursive(center, right, nums);

  var min = Number.MAX_VALUE, max = Number.MIN_VALUE, prod = nums[center-1];
  for (var i = center - 2;i >= left;i--) {
    prod *= nums[i];
    if (prod > max) max = prod;
    if (prod < min) min = prod;
    if (prod === 0) break; // 0 * any = 0
  }
  var rmin = Number.MAX_VALUE, rmax = Number.MIN_VALUE, rprod = nums[center];
  for (var i = center + 1;i < right;i++) {
    prod *= nums[i];
    if (prod > max) max = prod;
    if (prod < min) min = prod;
    if (prod === 0) break; // 0 * any = 0
  }
  var tmax = min * rmin;
  if (min * rmax > tmax) tmax = min * rmax;
  if (max * rmin > tmax) tmax = max * rmin;
  if (max * rmax > tmax) tmax = max * rmax;
  return Math.max(lv, rv, tmax);
}

```

### 动态规划解法
这道题除了能使用分治之外，还可以使用动态规划来解。假定状态dp[i]表示[0...i]的最大连续子数组积的最大值，dp[i]如何和dp[i-1]或者其他已知的状态联系起来呢？这样其实不太好联系起来。

可以将状态dp[i]定义成以乘积包含nums[i]的子数组的积的最大值，那状态转移方程为`dp[i]=max(nums[i], dp[i-1]*nums[i], min[i-1]*nums[i]`，注意到还有min，因为可能存在负数的情况，所以要还要定义最小值状态。所以最终状态转移方程就是：
1. `dpmax[i]=max(nums[i], dpmax[i-1]*nums[i], dpmin[i-1]*nums[i])`
2. `dpmin[i]=min(nums[i], dpmax[i-1]*nums[i], dpmin[i-1]*nums[i])`

涵盖的情况有两种：
1. nums[i]符号和前一个结果异号，那么最大或最小值其实就是该值自身
2. 如果同号，可能是正也可能是负，都计算一下然后取最大值/最小值

代码：
```js
var maxProduct = function(nums) {
  var n = nums.length;
  var pmin = nums[0], pmax = nums[0], max = nums[0];
  var max = nums[0];
  for (var i = 0;i < n;i++) {
    var tm = pmax * nums[i], tmin = pmin * nums[i];
    pmax = Math.max(nums[i], tm, tmin);
    pmin = Math.max(nums[i], tm, tmin);
    max = Math.max(max, pmax);
  }
  return max;
}
```
因为只需要前一个状态，所以可以只前一个状态的值，而不需要一个数组了。时间复杂度O(n)，空间复杂度O(1)。神奇的是，leetcode上，执行时间比O(nlogn)的分治算法长，不知道为什么。

#### 扩展思考
那如果是求最大和，动态规划怎么解呢？`dp[i]=max(dp[i-1]+nums[i], nums[i])`