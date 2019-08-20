---
title: 数据库系统：sql
date: 2019-08-17 07:26:08
tags:
- 数据库
- sql语句

category:
- 数据库
- sql语句
---

《数据库系统全书》读书笔记，主要包括书中有关sql部分，主要是的第六章和第七章。这里记录了最常用的sql语法及其详细的语法规则。这一系列读书笔记作为`数据库系统原理`课程同步复习笔记，综合了课程所学和书中所述，同时尽量添加自己的个人理解。

## 查询

### sql中的简单查询
sql中最简单的查询是找出关系中满足特定条件的元组。简单查询使用三个保留字：SELECT、FORM、WHERE来表示一个SQL查询语句。
例如：
```sql
SELECT *
FROM Movie
WHERE studioName = 'Disney' AND year = 1990
# 形式
SELECT col1, col2, ...
FROM relation1, relation2,...
WHERE cond1 and/or cond2, ...
```
上面的语句从数据库的关系模式Movie中找出studioName='Disney'和year=1990的元组（就是在Movie中找出某些列满足特定条件的行），select *表示选择所有列。简单总结就是：from确定从哪些关系中查询，where确定要取的行，select确定取到的行中的哪些列。

**todo select from where的所有可能取值的总结**
```sql
select 逗号隔开的属性列表|*|属性 as 别名|常量 as 别名
from 逗号隔开的关系列表|元组变量例如Movie m|
where 布尔表达式 and/or/not 布尔表达式|is not null|a in b|
order by 属性列表
```
#### 1. sql中的投影
   
   select * 会选择满足where条件的关系中的所有的元组（行）中的所有属性（列），但是有时候我们不需要所有的列，这个时候可以使用投影，select title选择元组中和title属性，然后将其投影到结果列title上。

   如果我们希望将选择的列投影到不同的列上我们可以使用as，例如：<code>select title as name</code>，这样选择的元组中对应的title属性会被投影到结果表的name列。

   **select还可以用表达式取代属性**，例如<code>select length*0.66667 as duration</code>，这将选择的元组中的length属性乘以0.6667的结果投影到duration，这样我们在结果表中拿到的length对应的列就是计算后的结果duration。

   还可以添加常量到select中，例如：<code>select '.html' as ext</code>

#### 2. sql中的选择
   
   where后面接一个条件表达式，和c中的表达式类型，其求值结果是布尔值。

   * 值比较：使用6中常用的比较运算符：=、&lt;&gt;（不等于）、&lt;、&gt;、&lt;=和&gt;=。常量和跟在from后面的关系的属性都是可以比较的，也可以通过算术运算比如+、-、*、/来计算后比较。**通过||可以连接字符串（'foo'||'bar'='foobar'**。
   * 布尔运算：上面提到的比较的结果可以通过and,or,not来进行布尔运算

#### 3. 字符串比较
   
   当两个字符串里面的字符序列完全相同时，称两个字符串相等。sql允许固定长度和可变长的字符串。

   字符串的大小比较是比较其字典顺序，按照其逐个字母的先后比较。

   sql提供了简单的字符串模式匹配的功能：like，例如：<code>s NOT LIKE p</code>其中s是字符串，p是模式。模式的形式是字符串+特殊字符串(%表示匹配任意长度的字符串，包括0，_表示匹配任意一个字符)。当s符合模式p的时候表达式才为真。

   **sql规定单引号是字符串的开始和结束，如果要在字符串内部使用单引号，那么使用两个单引号**，例如: <code>'%''s%'=%'s%</code>。

#### 4. 日期和时间
   
   sql的实现版本通常将时间和日期作为特殊的数据类型。**日期常量是由DATE保留字+单引号+特定字符串，例如date'1948-05-14'**，时间是time'15:33:14'，时间日期是timestamp'1948-05-14 12:00:00'。**可以直接用比较运算符对时间日期进行运算**

#### 5. 空值的比较
   
   SQL允许属性的值为特殊值null。where中要考虑null空值带来的影响：

   * null和其他任何数据（包括null）算术运算+-得到的结果依然是空值
   * null和其他任何数据（包括null）比较运算=或>，结果都是unknown值。

  正确判断是否空值的方式是使用<code>x is null</code>或者<code>x is not null。</code>

#### 6. 布尔值unknown
   
   前面提到涉及到null的比较运算结果是unknown，那么我们布尔值的可能就有三种了：true、false、unknown。而前面又提到，布尔值可以通过AND、OR、NOT进行运算，那么这三种情况的运算结果是什么呢？

   一种方式是将true看成1，false看成0，unknown看成0.5，三者的and运算取值的最小值，例如true AND unknown值是0.5，也就是unknown。or取最大值，例如false or unknown值是unknown。not取1-v，not unknown = 1-0.5=0.5=unknown。

   综上，unknown and false = false，unknown or false = unknown，not (unknown or false) = unknown。

   但使用where查询时，只有值时true才有效，false和unknown都无效。

#### 7. 输出排序
   
   可以基于任何一个属性（或者多个）来进行排序，并将其他的属性跟在它后面进行约束。当第一属性相同时，按照第二属性排序，以此类推。

   `order by 属性列表，逗号隔开`

  
### 多个关系上的查询
**关系代数的强大在于它能够通过连接、笛卡尔积、并、交和差来组合多个关系。在SQL中也可以做相同的操作**

#### 1. SQL中的积和连接
**查询多个关系：在from后面接逗号隔开的多个关系，在select和where中可以使用任何出现在这些关系中的属性**

例如：
```sql
select name
from Movie, MovieExec
where title = 'Star Wars' and producerid = certid;
```

该语句的执行过程是：
```
|     |    |     |
|-----|-   |     |
|     | \->|-----|
|     |    |     |
```

  1. 遍历两个关系的所有元组对
  2. 找出所有满足关系的元素对，将元组对合成一个元素返回。

执行的结果是：
```
|-----||----|
|-----||----|
```

#### 2. 属性歧义
**如果两个关系中有同名属性，可以通过table1.name=table2.name这种添加表名限定的形式来实现区分，包括在select和where中都可以这么区分**

#### 3. 元组变量
可以对同一个关系进行多次查询，也就是说，对于关系R，可以`from R r1, R r2, ...`，这里的r1，r2就代表R的两个拷贝的不同元组。

例如，找出Star表中所有地址相同的star（s1.name < s2.name是为了去重）:
```sql
select s1.name, s2.name
from Star s1, Star s2
where s1.address = s2.address and s1.name < s2.name
```
*tips：这里看起来是根据address进行分组，但是其实不是，sql中的分组只能select分组的属性和其他属性的聚集操作。我们要找到同一个表中的某一项相同的不同元组，只能通过同表的多表查询来实现。*

#### 4. 多关系的解释
多关系的连接书中给了多种解释方案，比如嵌套循环——看成两个元组集合的二重循环；并行赋值——两个不同实例将可能的元组赋值给各自的元组变量，然后比较这两个元组变量；关系代数——先取笛卡尔积（笛卡尔积是《离散数学》中的概念，在我的《离散数学》复习篇博客中会涉及），然后对结果进行筛选。

这多种解释的结果是相同的，只是过程不同，结果都是将两个关系的元组进行组合，并进行筛选。上面给的解释只是组合前筛选和组合后筛选的区别。

#### 5. 查询的并、交、差
sql中的union、intersect和except分别表示并、交、查。可以直接用这三个关键字，将多个括号括起来的查询的结果组合起来。

**只能对列数相同的结果关系集合进行操作**

例如：
```sql
(select bookid, bookname from book) union (select majorid, majorname from major);
```
结果是：
```
+--------+--------------------------+
| bookid | bookname                 |
+--------+--------------------------+
| b001   | 货币银行学               |
| m2     | 信息安全                 |
| m1     | 计算机科学与技术         |
+--------+--------------------------+
```
*注意：mysql中只支持union，不支持intersect和except，需要使用group by或者not in来模拟*

### 子查询
当某个查询是另一个查询的一部分时，称为子查询。子查询可以拥有下一级的子查询。例如上例中通过两个子查询的union得到最终的查询结果。使用子查询的其他方式：
* 子查询可以返回单个常量，这个常量能在where中和另一个常量进行比较
* 子查询可以返回关系，该关系可以在where子句中以不同的方式使用（in、not in、exist、all等等）
* 像许多存储的关系一样，子查询形成的关系能够出现在FROM子句中。