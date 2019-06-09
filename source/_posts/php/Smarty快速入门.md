---
title: Smarty块度入门
category: php
---
# Smarty快速入门

smarty官方中文文档：<https://www.smarty.net/docs/zh_CN/what.is.smarty.tpl>



## 1. Smarty是什么？

Smarty是一个PHP的模板引擎。类似于java的jsp，javascript使用的ejs等。可以向模板文件中嵌入变量，条件控制，循环，模板继承等，帮助html文档的生成。

主要功能将显示逻辑和业务逻辑分开：

- 这意味着模板可以包含部分仅作为显示用的逻辑代码。 这些显示逻辑如：[包含](https://www.smarty.net/docs/zh_CN/language.function.include.tpl) 其他模板，[交替](https://www.smarty.net/docs/zh_CN/language.function.cycle.tpl)设置表格每行的颜色， 把变量转为 [大写](https://www.smarty.net/docs/zh_CN/language.modifier.upper.tpl)字母， [循环](https://www.smarty.net/docs/zh_CN/language.function.foreach.tpl)遍历数组并 [显示](https://www.smarty.net/docs/zh_CN/api.display.tpl)出来。
- Smarty也不是无论如何也强制分离业务和显示逻辑。毕竟Smarty 无法知道谁是谁，所以，会不会把业务逻辑放到模板也是看你怎么处理。
- 同时，如果你希望在你的模板里*没有*任何的逻辑代码，你也可以 把模板写成仅剩下文字和变量。

模板文件中可以创建自己的函数和变量修饰器。

条件判断语句会直接使用php解析，所以if后面可以是简单或者较复杂的表达式。



## 2. Smarty的基本语法

smarty的标签都是使用定界符括起来，默认是{}，但是定界符可以被改变。

**任何在定界符之外的内容都是静态的**

当Smarty读取到这些标签时（{}），会试图解析他们，并且在对应的位置输出结果。（这意味着，smarty会对标签中的逻辑进行处理，然后在标签所在的位置输出处理结果到文档中，比如输出一个变量，会把变量的值输出到文档中的对应位置）

### 2.1 注释

注释时定界符+'*'：

```php
{* 这时一个注释 *}
```

多行注释：

```php
{*****************
    注释内容
******************}
```

注释不能嵌套。

### 2.2 变量

模板变量有美元符号$开头，由字母、数组和下划线组成，类似于php的变量。变量可以引用数组索引（数字和非数字均可）、对象的属性和方法等。

配置变量放在两个井号中间（#marks#），或者使用$smarty.config使用。

```php
{$foo}        <-- 显示简单的变量 (非数组/对象)
{$foo[4]}     <-- 在0开始索引的数组中显示第五个元素
{$foo.bar}    <-- 显示"bar"下标指向的数组值，等同于PHP的$foo['bar']
{$foo.$bar}   <-- 显示以变量$bar值作为下标指向的数组值，等同于PHP的$foo[$bar]
{$foo->bar}   <-- 显示对象属性 "bar"
{$foo->bar()} <-- 显示对象成员方法"bar"的返回
{#foo#}       <-- 显示变量配置文件内的变量"foo"
{$smarty.config.foo} <-- 等同于{#foo#}
{$foo[bar]}   <-- 仅在循环的语法内可用，见{section}
{assign var=foo value='baa'}{$foo} <--  显示"baa", 见{assign}
```

### 2.3 函数

每个smarty标签都可以是显示一个变量或者调用某种类型的函数。

函数调用：

> {funcname attr1="val1" attr2="val2"}

在定界符内包含函数和其属性。

* 函数包括[内置函数](https://www.smarty.net/docs/zh_CN/language.builtin.functions.tpl) 和[自定义函数](https://www.smarty.net/docs/zh_CN/language.custom.functions.tpl) 都是用同样的语法调用。
* 内置函数是工作在Smarty **内部**的函数, 类似 [`{if}`](https://www.smarty.net/docs/zh_CN/language.function.if.tpl), [`{section}`](https://www.smarty.net/docs/zh_CN/language.function.section.tpl)和 [`{strip}`](https://www.smarty.net/docs/zh_CN/language.function.strip.tpl)等等。 它们不需要进行修改或者改变。
* 自定义函数是通过[插件](https://www.smarty.net/docs/zh_CN/plugins.tpl)定义的 **额外的**函数。 你可以任意修改自定义函数，或者创建一个新的函数。 [`{html_options}`](https://www.smarty.net/docs/zh_CN/language.function.html.options.tpl)就是一个自定义函数的例子。



### 2.4 属性

函数通过属性来定义或者修改他们的行为。属性类似于HTML中的属性。

属性使用：

```php
{include file="header.tpl"}

{include file="header.tpl" nocache}  // 等同于 nocache=true

{include file="header.tpl" attrib_name="attrib value"}

{include file=$includeFile}

{include file=#includeFile# title="My Title"}

{assign var=foo value={counter}}  // 插件结果

{assign var=foo value=substr($bar,2,5)}  // PHP函数结果

{assign var=foo value=$bar|strlen}  // 使用修饰器

{assign var=foo value=$buh+$bar|strlen}  // 复杂的表达式

{html_select_date display_days=true}

{mailto address="smarty@example.com"}
```



### 2.5 双引号中嵌入变量

- Smarty可以识别出在双引号中嵌套的 [变量](https://www.smarty.net/docs/zh_CN/language.syntax.variables.tpl)[值](https://www.smarty.net/docs/zh_CN/api.assign.tpl)，这些变量名称必须只包括 字母、数字和下划线。 参见[命名规则](http://php.net/language.variables)。
- 另外，带有其他字符的，如点号（.）或者 `$object->reference`形式的变量， 必须用``单引号``括起来。
- Smarty3中允许在双引号中嵌入Smarty的标签并运行。 如果你需要在双引号的变量上使用修饰器、插件或者PHP函数等，这是非常有用的。

```php
{func var="test $foo test"}              // 识别变量 $foo
{func var="test $foo_bar test"}          // 识别变量 $foo_bar
{func var="test `$foo[0]` test"}         // 识别变量 $foo[0]
{func var="test `$foo[bar]` test"}       // 识别变量 $foo[bar]
{func var="test $foo.bar test"}          // 识别变量 $foo (不是 $foo.bar)
{func var="test `$foo.bar` test"}        // 识别变量 $foo.bar
{func var="test `$foo.bar` test"|escape} // 引号外的修饰器!
{func var="test {$foo|escape} test"}     // 引号内的修饰器!
{func var="test {time()} test"}          // PHP函数结果
{func var="test {counter} test"}         // 插件的结果
{func var="variable foo is {if !$foo}not {/if} defined"} // Smarty区块函数
```



### 2.6 数学计算

变量值内可以直接进行数学计算

```php
{$foo+1}

{$foo*$bar}

{* 更复杂的例子 *}

{$foo->bar-$bar[1]*$baz->foo->bar()-3*7}

{if ($foo+$bar.test%$baz*134232+10+$b+10)}

{$foo|truncate:"`$fooTruncCount/$barTruncFactor-1`"}

{assign var="foo" value="`$foo+$bar`"}
```



### 2.7 避免smarty解析

1. 当{}左右两边都是空格的时候，将会被自动忽略解析。
2. 使用{literal}...{/literal}可以让块中间的内容忽略解析。

