---
title: Wildcard Matching
date: 2020-05-09 10:43:42
tags:
- 算法
- leetcode
- 动态规划

category:
- 算法
- leetcode
---
## 问题描述
通配符模式匹配问题，给定一个字符串s和模式字符串p，判断s是否匹配p。其中s由s-z之间的任意小写字符组成，p由s-z之间的任意小写字符以及*和？组成。

*表示匹配任意长度的字符串，长度为0；?表示匹配长度为1的字符串。

例如:
```
输入: s="aa" p="a"
输出: false

输入: s="ba" p="?a"
输入: true

输入: s="aa" p="*"
输出: true
```

## 题解
看到通配符匹配的问题第一反应肯定是用有限状态机来解决，由通配符表达式生成有限状态机。将输入字符串和有限状态机去比对，看是否符合。

但在这个问题中，比较简单，不需要有限状态机那么复杂的判断方式，首先可以考虑用动态规划解，然后再考虑其他的算法。

### 动态规划解法
首先尝试将(i,j)定义为串s[0...i]和p[0...j]是否匹配，那么状态转移方程为`(i+1, j) = p[j]=='*' && (i,j)`，`(i,j+1)=p[j+1]=='*' && (i,j)`，`(i+1,j+1) = s[i+1]==p[j+1] || p[j+1]=='*' || p[j+1]=='?'`。状态初始状态(0,0)的值=`s[0]==p[0] || p[0]==? || p[0]==*`，边界条件，p.length == 0, s.length==0, false;代码如下：

```js
function judge(s, p) {
  if (p.length == 0 && s.length == 0) return true;
  else if(p.length == 0) return false;
  if (s.length == 0) {
    for (var i = 0;i < p.length;i++) {
      if (p[i] != '*') return false;
    }
    return true;
  }
  var status = []
  for (var i = 0; i < s.length; i++) status[i] = [];
  status[0][0] = (s[0] == p[0]) || (p[0] == '?') || (p[0] == '*');
  var matched = status[0][0] && (p[0]!='*');
  for (var j = 1; j < p.length; j++) {
    var c1 = (p[j] == '*') && status[0][j - 1];
    var c2 = ((s[0] == p[j])||(p[j]=='?')) && status[0][j-1]&&!matched;
    if (c2 && !matched) matched = true;
    status[0][j] = c1 || c2;
  }
  for (var i = 1; i < s.length; i++) status[i][0] = (p[0] == '*');
  for (var i = 1; i < s.length; i++) {
    for (var j = 1; j < p.length; j++) {
      var c1 = status[i][j - 1] && (p[j] == '*');
      var c2 = status[i - 1][j] && (p[j] == '*');
      var c3 = status[i - 1][j - 1] && ((s[i] == p[j]) || (p[j] == '*') || (p[j] == '?'));
      status[i][j] = c1 || c2 || c3;
    }
  }
  return status[s.length - 1][p.length - 1];
}
```
上面给的递推方程是思路，实际上都是用减法的方程，由i-1推出i这种形式，代码中也是这样处理的。注意边界，status[0][j]和status[i][0]这个边界条件要计算好。尤其是计算status[0][j]，这里引入了matched来表示s[0]是否被匹配过了，因为使用递推的方式没有办法解决类似`s='a'`，`p='*?*?'`这样的问题。

该算法的时间复杂度是O(n2)。

### 贪心+回溯算法
*尽可能多的匹配，例如`*a*a`和`aaaa`，会先找到最后一个a，发现模式还剩`*a`没有匹配，回溯上一个a，匹配，发现匹配失败，再回溯一个a，知道匹配成功。这样的时间复杂度最差情况下是O(n!)，可以通过优化一下判断条件来优化时间。