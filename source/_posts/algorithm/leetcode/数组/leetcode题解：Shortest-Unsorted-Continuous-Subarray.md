---
title: leetcode题解：Shortest Unsorted Continuous Subarray
date: 2019-12-13 18:34:09
tags:
- 算法
- leetcode
- 数组

category:
- 算法
- leetcode
---

## 问题描述
Given an integer array, you need to find one continuous subarray that if you only sort this subarray in ascending order, then the whole array will be sorted in ascending order, too.

You need to find the shortest such subarray and output its length.
```
Example 1:
Input: [2, 6, 4, 8, 10, 9, 15]
Output: 5
Explanation: You need to sort [6, 4, 8, 10, 9] in ascending order to make the whole array sorted in ascending order.
```
Note:
1. Then length of the input array is in range [1, 10,000].
2. The input array may contain duplicates, so ascending order here means <=.

## 问题分析
题目要求是：给定一个数组，找到最小的未升序排序的连续子数组，或者说，找到一个最小连续子数组，将这个子数组排序后，整个数组是升序的。

很简单的一个思路是，复制一个一模一样的数组，将复制后的数组排序，然后比较排序后的数组和排序前的数组，就看出来哪一个最小连续子数组是无序的。具体的比较方式是，逐个数组元素从前向后和从后向前比较，直到找到前面不相等的位置和后面不相等的位置，中间的子数组就是需要排序的。例如对于`[2,6,4,8,10,9,15]`有：
```
input:       [2,6,4,8,10,9,15]
sorted copy: [2,4,6,8,9,10,15]
```
一对比，前面2==2，6!=4，后面15==15，9!=10。所以最小连续无序的子数组是`[6,4,8,19,9]`。或者这样想，我将这个子数组排序后，才能让原数组有序。上代码，注意边界条件的处理：
```js
var findUnsortedSubarray = function(nums) {
    var numst = [].concat(nums);
    numst.sort(function(a,b) {
        return a - b;
    });
    var p1 = 0, p2 = nums.length-1;
    while((nums[p1] == numst[p1] || nums[p2] == numst[p2]) && p1 <= p2) {
        if(nums[p1] == numst[p1] && p1 <= p2) p1++;
        if(nums[p2] == numst[p2] && p1 <= p2) p2--;
    }
    
    return p2-p1+1;
};
```
时间复杂度O(nlogn)，空间复杂度O(n)。
> 注意：js中的Array.prototype.sort方法，接收一个参数，该参数是带有两个参数的函数；如果没有该函数，**默认按照升序排列，排序规则是将所有元素转成字符串，然后按照utf-16字符串来排序**，这样和数字排序有什么区别呢？utf-16的数字的码点不一定是有序的，而且'10'和'9'按照字符串排序'10'是小于'9'的，因为逐个字符比较，'1'<'9'。使用sort的函数参数可以自定义排序规则，该函数的两个参数分别表示比较的两个元素，这两个元素的类型和数组元素的类型相同；如果函数返回负数，表示第一个参数a的index在第二个参数b后面，如果返回0，表示两者的相对位置不变，但是仍会和其他元素一起排序；如果返回整数，表示a在b后面。

## 更好的解法
上面给出的解法时间复杂度O(nlogn)，空间复杂度O(n)。能不能给出一种时间复杂度O(n)，空间复杂度O(1)的解法呢？肯定是可以的，通过两次线形遍历，可以找出来哪一部分是无序的。

对于一个数组，我们线形遍历希望找出最前面的不满足有序的边界，再找出后面的边界，两个边界之间就是需要排序的数组。从左到右，肯定希望是升序的，如果遇到了逆序，那么该逆序对的较小元素与左边肯定存在一个连续数组需要排序；从左到右遍历，并记住遍历过的部分的最大的元素，向右遍历时右边比左边最大元素小的都是逆序。这样过一遍，我们就找到了最右边的需要排序的边界，但是左边的还不知道。同样的原理，从右向左过一遍就能找到左边的边界。

例如，对于`[2,6,4,8,10,9,15]`：
* （从左向右）初始rEdge=-1，max=2，min=15，lEdge=-1
* 遍历6，6> max，max = 6，rEdge = -1
* 遍历4，4< max，max = 6，rEdge = 2
* 遍历8，8> max，max = 8，rEdge = 2
* ...
* 遍历9，9< max，max = 10，rEdge = 5
* 遍历15，15> max，max = 15，rEdge = 5
* (从右向左)...
* 遍历2，2< min，min=2，lEdge = 1

代码：
```js
var findUnsortedSubarray = function(nums) {
    var lEdge = -1, rEdge = -1;
    var temp = nums[0];
    
    for(var i = 1;i < nums.length;i++) {
        if(temp <= nums[i]) temp = nums[i];
        else rEdge = i;
    }
    
    if(rEdge == -1) return 0;
    
    temp = nums[nums.length-1];
    for(var i = nums.length - 2;i>=0;i--) {
        if(temp >= nums[i]) temp = nums[i];
        else lEdge = i;
    }
    
    return rEdge - lEdge + 1;
};
```
时间复杂度O(n)，空间复杂度O(1)。注意相等的情形。