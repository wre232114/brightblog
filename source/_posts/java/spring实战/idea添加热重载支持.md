---
title: idea添加热重载支持
date: 2020-02-28 09:05:59
tags:
- spring-boot
- 开发工具

category:
- spring-boot
- 开发工具
---
spring-boot提供了dev-tools工具用于热重载，在vscode中直接保存就能自动热重载，但是在idea中不行，因为idea会自动保存。在idea中实现自动热重载的步骤如下：
```
1. include the spring-boot-devtools dependency
Maven
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
Gradle
dependencies {
    compile("org.springframework.boot:spring-boot-devtools")
}
2. enable “Make project automatically” in the compiler preferences for automatic restarts to work.
enter image description here

3. enable the compiler.automake.allow.when.app.running registry setting in IntelliJ. You can access the registry in IntelliJ using the shortcut Shift+Command+A, then searching for registry.
```

其中第三步需要输入registry，然后在registry中找到对应的选项。

更改完需要重载的时候执行`build->rebuild project`就可以自动更新了。