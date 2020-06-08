---
title: Longest Valid Parentheses
date: 2020-05-07 07:49:54
tags:
- 算法
- leetcode
- 动态规划

category:
- 算法
- leetcode
---

## 问题描述
给定一个包含"("和")"的字符串，找到最长的合法括号子串，例如：
```
输入："(()"
输出：2

输入：")()())"
输出：4
```

## 题解
这个问题需要找到一个括号串的最长合法括号子串。需要解决几个关键的问题：
1. 怎么知道一个子串是不是合法子串？
2. 怎么找到最长的子串？

### 枚举法
解决了这两个问题，那么这个问题就解决了。一个最简单的解法就是，枚举所有可能的子串，然后判断该子串是不是合法的括号子串，如果是，更新最大值。判断一个子串是不是合法可以用栈来实现，遍历子串，遇到"("就入栈，遇到")"就出栈，并判断出栈的是不是"("，不是则不合法，遍历完成后，判断以下栈是否为空，为空说明子串合法。

这种解法的事件复杂度是O(n3)，枚举子串的事件复杂度是O(n2)，因为子串需要用(i,j)来表示，枚举i和j的事件复杂度是n*n。判断子串是否合法的事件复杂度是O(n)，因为要遍历一遍子串。代码：
```js
var longestValidParentheses = function(s) {
  var i = 0, j = i + 1, len = s.length, max = 0;
  for(;i < len;i++) {
    for(j = i+1;j <= len;j++) {
      var substr = substring(i, j);
      if (isValid(substr)) {
        if (substr.length > max) max = substr.length;
      }
    }
  }
  return max;
}
function isValid(s) {
  if (s.length % 2 != 0) return false;
  var stack = [];
  for (var i = 0;i < s.length;i++) {
    var c = s.charAt(i);
    if (c == '(') stack.push(c);
    else {
      if (stack.length == 0) return false;
      var pc = stack.pop();
      if (pc != '(') return false;
    }
  }
  return stack.length == 0;
}
```

### 动态规划
枚举法可以给出正确的解，但是时间复杂度太高了，提交枚举代码后直接超时了。接下来就是想一想怎么优化了，是不是可以考虑动态规划呢，动态规划的核心是状态和状态转移方程，能不能根据已有状态来推断出下一个状态呢？这样就可以节省很多计算时间。动态规划需要解决两个问题：
1. 状态是什么，怎么定义这个状态？
2. 状态如何转移？串和子串的状态怎么联系起来？

定义状态i表示以i位置结尾的最长合法子串，d[i]表示以i结尾的合法串的最大长度，一个合法的串最后一个字符肯定是")"，如果不是则d[i]一定为0，所以只需要考虑s[i]==')'的情况。如果s[i-1]=='('，那么d[i]=d[i-2]+2；如果s[i-1]==')'，串形如"...))"，如果s[i-d[i-1]-1]=='('，那么肯定符合，因为d[i-1]如果不为0，那s[i-d[i-1]-1...i-1]这个子串是合法的，所以d[i]=d[i-1]+d[i-d[i-1]-2]+2;

初始情况，d[0]=0，如果s[0..1]="()"则d[1]=2，否则等于0。d[2]开始就可以递推了。代码如下：
```js
var longestValidParentheses = function(s) {
  var d = [0];
  if (s[0] == '(' && s[1] == ')') d[1] = 2;
  else d[1] = 0;
  var max = d[1];
  for (var i = 2;i < s.lenth;i++){
    if (s[i] == '(') d[i] = 0;
    else if (s[i-1] == '(') d[i] = d[i-2] + 2;
    else if (s[i-1] == ')' && s[i-d[i-1]-1] == '(') {
      if (i-d[i-1]-2 >= 0)
        d[i] = d[i-1] + d[i-d[i-1]-2] + 2;
      else
        d[i] = d[i-1] + 2;
    }
    if (d[i] > max) max = d[i];
  }
  return max;
} 
```

> 动态规划解题要点：动态规划最重要的是状态的定义和状态转移方程，同一个问题可能有多种状态定义方式和多种状态转移方程都能得到正确的结果。解动态规划问题，最重要的是先找到状态，这个题中，状态的第一思路可能是(i,j)代表始末位置为(i,j)的子串的最大合法子串的长度，但是这个状态就不好递推了。或者是(i,j)代表以始末位置为(i,j)的子串是否合法，如果合法值就为该子串的长度，否则为0。如果(i,j)合法，则`'('+(i,j)+')'`也合法，但是还有一种情形就不好判断了，例如`()()`，模式为`xx`（x表示合法子串），因为无法知道相邻的子串的是否合法以及最大多少合法。所以这种状态设计方案没有解决`最大`的问题，而且用(i,j)来标识状态求解的时间复杂度为O(n2)。那能不能用一维的状态来表示呢？例如i表示以i结尾的最大合法子串的长度，那这样就知道以i结尾的串是否合法，并可以解决形如`xx`的问题。**当遇到动态规划问题的时候可以按照1维到2维这样状态定义顺序来设计状态和状态转移。**

### 栈
可以考虑用栈来解决这个问题，且时间复杂度为O(n)，空间复杂度为O(n)。栈可以判断一个子串是不是合法的，可以从头到尾遍历一遍字符串，遍及每一个字符的时候都使用栈判断当前是否合法，栈长度为0时更新一下最大值。遍历的时候如果遇到非法的，清空栈，从非法字符开始重新计数。因为如果一个部分是非法的，那么所有包含该部分（完全包含或者有交集）的串都是非法的。代码如下：
```js
var longestValidParentheses = function(s) {
  var stack = [], max = 0, tcount = 0;
  for (var i = 0; i < s.length; i++) {
    if (s[i] == '(') stack.push(i);
    else {
      if (stack.length == 0) tcount = 0;
      else {
        stack.pop();
        tcount += 2;
        if (stack.length == 0) max = tcount;
      }
    }
  }
  var tlength = s.length;
  while (stack.length > 0) {
    var lastlp = stack.pop();
    tcount = tlength - lastlp - 1;
    tlength = lastlp;
    if (tcount > max) max = tcount;
  }
  return max;
}
```
这里栈的思想类似于俄罗斯方块消去的思想，遇到匹配的"()"就会被消去，当遇到'('入栈，遇到')'出栈，出栈相当于消去。子串消去的时候有三种情况：
1. 到i结尾的子串的结尾字符s[i]==')'，且刚好消去(stack.length == 1)，此时肯定有满足的子串，判断子串的长度并更新最大值
2. 到i结尾的子串的结尾字符s[i]==')'，且栈已经为空(stack.length == 0)，包含s[i]的串肯定不是合法串，清空计数。
3. 到i结尾的子串的结尾字符s[i]=='('，入栈s[i]。遍历一遍字符完成消去之后，栈中如果还剩下了'(’，则这些'('之间被消去的空洞就是合法的子串，比较这些子串的长度并更新最大值。

### 两次遍历
上一部分的消去思想起始可以进一步总结，消去之后，剩下的子串只可能有三种情况，1.全是'('，2.全是')'，3.前面是若干')'后面是若干'('。

假定从左到右遍历字符串，遇到'('计数+1，遇到')'计数减1，减到0的时候更新一下最大值。多于的')'直接跳过，肯定不合法。这样就不需要栈了，只需要两个变量——一个记录消去计数、一个记录当前合法子串的起始位置。这样可以解决2、3中')'的问题，但是多于的'('没法判断，例如`(((())`这种情况。解决方案也很简单，对称的思想，从右向左再遍历一遍，将规则反一下，然后更新最大值。代码如下：

```js
var longestValidParentheses = function(s) {
  var count = 0, start = -1, i = 0, max = 0;
  function traverse(tcondif, tincf, tlenf, c) {
    for(;tcondif(i);tincf()) {
      if (s[i] == c) {
        count++;
        if (start == -1) start = i;
      } else {
        count--;
        if (count == 0) {
          // var len = i - start + 1;
          var len = tlenf(i);
          if (len > max) max = len;
        } else if (count < 0) {
          start = -1;
          count = 0;
        }
      }
    }
  }
  traverse(i=>i<s.length,()=>i++,i=>i-start+1,'(');
  count = 0, start = -1, i = s.length - 1;
  traverse(i=>i>=0,()=>i--,i=>start-i+1,')');
  return max;
}
```