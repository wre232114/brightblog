---
title: tslint基础知识
date: 2019-09-01 22:24:54
tags:
- typescript
- tslint基础

category:
- js
- typescript
---
tslint是一个可扩展的静态分析工具，它检查typescript的可读性、可维护性以及功能性错误。

## 安装CLI
> npm install tslint typescript --save-dev
> npm install tslint typescript -g

typescript和tslint是同级的依赖，需要同时安装。

### CLI的使用
请确保在linter前typescript源文件被正确编译。

使用：tslint [options] [file ...]

Options:
```
-v, --version                          output the version number
-c, --config [config]                  configuration file
-e, --exclude <exclude>                exclude globs from path expansion
--fix                                  fixes linting errors for select rules (this may overwrite linted files)
--force                                return status code 0 even if there are lint errors
-i, --init                             generate a tslint.json config file in the current working directory
-o, --out [out]                        output file
--outputAbsolutePaths                  whether or not outputted file paths are absolute
--print-config                         print resolved configuration for a file
-r, --rules-dir [rules-dir]            rules directory
-s, --formatters-dir [formatters-dir]  formatters directory
-t, --format [format]                  output format (prose, json, stylish, verbose, pmd, msbuild, checkstyle, vso, fileslist, codeFrame)
-q, --quiet                            hide non "error" severity linting errors from output
--test                                 test that tslint produces the correct output for the specified directory
-p, --project [project]                tsconfig.json file
--type-check                           (deprecated) check for type errors before linting the project
-h, --help                             output usage information
```

比较常用的选项有：
* -c, --config, 指定tslint.json配置文件（这个文件是扩展json文件，可以写注释）
* --fix，自动修复问题，会修改源文件
* -i, --init，初始化一个tslint.json文件
* -p, --project，指定tsconfig.json文件

使用示例：
> tslint --fixed -p tsconfig.json

tslint会从被检查的文件的目录下赵tslint.json文件，一直向父目录查找。


### 退出状态码
CLI可能以如下的状态码退出：
* 0: 成功通过检查（可能有warning）
* 1: 不合法的命令行参数或者组合
* 2: 有1个或者的更多的规则以error的严重程度检查失败

## tslint配置
```typescript
{
  // 值是内置配置预设的名字，表示使用内置的预设配置，比如tslint:recommand
  extends?: string| srting[],
  // 自定义规则的路径，使用nodejs的模块解析规则
  rulesDirectory?: string | string[],
  // 规则名字和其配置的匹配
  // 1. 应用于.ts和.tsx
  // 2. 每一条规则于一个对象关联
  //    2.1 options: 规则的取值
  //    2.2 severity: 严重程度，default,error,warning,off
  rules?: { [name: string]: RuleSetting },
  // 和rules的规则格式相同，适用于.js和.jsx文件
  // 当值为true时，使用rules相同的配置
  jsRules?: any|boolean,
  defaultSeverity?: "error"|"warning"|"off",
  // exclude: 一个模式的数组，满足模式的数组不会被检查
  // format: string，默认的lint格式
  linterOptions?: { exclude?: string[] }
}
```
tslint配置文件示例:
```json
{
    "extends": "tslint:recommended",
    "rulesDirectory": ["path/to/custom/rules/directory/", "another/path/"],
    "rules": {
        "max-line-length": {
            "options": [120]
        },
        "new-parens": true,
        "no-arg": true,
        "no-bitwise": true,
        "no-conditional-assignment": true,
        "no-consecutive-blank-lines": false,
        "no-console": {
            "severity": "warning",
            "options": ["debug", "info", "log", "time", "timeEnd", "trace"]
        }
    },
    "jsRules": {
        "max-line-length": {
            "options": [120]
        }
    }
}
```

### 配置预置(preset)
* tslint:recommanded，稳定的typescript编程推荐的规则集合
* tslint:latest，继承自recommanded，但是会随着tslint的版本发布而更新，可能会导致前面的检查通过了，但是更新后不通过的情况
* tslint:all，以严格模式打开所有的规则。


## 规则flags
可以通过一些flags来控制tslint的开启和关闭等行为。
### 源文件中的注释
可以通过源文件中的注释来控制该文件中的部分tslint的规则的开启和关闭。

* /* tslint:disable */：在当前文件的剩余部分禁用tslint
* /* tslint:enable */：在当前文件的剩余部分启用tslint
* /* tslint:disable:rule1 rule2... */：在剩余文件中禁用指定的规则
* // tslint:disable-next-line
* // tslint:disable-next-line:rule1 rule2...

示例代码：
```js
function validRange (range: any) {
   return range.min <= range.middle && range.middle <= range.max;
}

/* tslint:disable:object-literal-sort-keys */
const range = {
   min: 5,
   middle: 10,    // TSLint will *not* warn about unsorted keys here
   max: 20
};
/* tslint:enable:object-literal-sort-keys */

const point = {
   x: 3,
   z: 5,          // TSLint will warn about unsorted keys here
   y: 4,
}

console.log(validRange(range));
```