---
title: MySql Workbench 生成表关系图
date: 2019-11-28 10:59:19
tags:
- 数据库
- mysql

category:
- 数据库
- mysql
---
这篇文章学习如何在mysql workbench上，根据已有的表生成关系图。当刚刚上手一个数据库的时候，如果能有该数据库的关系图的话，能够更好更快的掌握数据库各部分的功能及其相互关系。

## 反向工程已有数据库
要从一个已有的数据库创建数据库表的关系图，我们需要使用反向工程来创建一个model，具体操作是：
### 选择database -> Reverse Engineer
然后会出现要连接数据库的界面，选好需要连接的数据库，点next。

在下一个界面选择需要反向工程的数据库，选好后点next

然后点excute。之后一直点next，直到生成了model。

此时就会得到想要的图了，如果没有，点生成的model的界面中的EER Diagram。

中间有一些选项以及model、diagram之间的关系没有深入分析，以后用到的时候补充

## 参考资料
[How to create ER diagram for existing MySQL database with MySQL Workbench](https://dataedo.com/kb/tools/mysql-workbench/create-database-diagram)

[How to reverse engineer a database with MySQL Workbench](https://dataedo.com/kb/tools/mysql-workbench/how-to-reverse-engineer-database)