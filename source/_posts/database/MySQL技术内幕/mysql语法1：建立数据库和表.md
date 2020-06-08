---
title: mysql语法1：建立数据库和表
date: 2020-02-20 19:08:04
tags:
- 数据库
- mysql

category:
- 数据库
- mysql
---
这篇文章给出mysql中建立数据库和表的详细语法。如果不记得详细语法，在mysql客户端中可以通过`help create database`或者`help create table`来获取语法参考，如下例：
```
mysql> help create database
Name: 'CREATE DATABASE'
Description:
Syntax:
CREATE {DATABASE | SCHEMA} [IF NOT EXISTS] db_name
    [create_specification] ...

create_specification:
    [DEFAULT] CHARACTER SET [=] charset_name
  | [DEFAULT] COLLATE [=] collation_name

CREATE DATABASE creates a database with the given name. To use this
statement, you need the CREATE privilege for the database. CREATE
SCHEMA is a synonym for CREATE DATABASE.

URL: https://dev.mysql.com/doc/refman/5.7/en/create-database.html
```

## 建立数据库
语法，采用上下文无关文法表示，其中`{}`表示是必须的，`[]`表示是可选的：
```
CREATE {DATABASE | SCHEMA} [IF NOT EXISTS] db_name
    [create_specification] ...

create_specification:
    [DEFAULT] CHARACTER SET [=] charset_name
    | [DEFAULT] COLLATE [=] collation_name
```