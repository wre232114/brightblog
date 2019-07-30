---
title: html5 API
date: 2019-07-23 07:37:50
tags:
- html5
- html5 API

category:
- html5
- html API
---
在HTML5中，提供了一个访问文件操作的文件API，通过使用这个api，从web页面上访问本地文件系统会变得十分简单。

## FileList对象和File对象
浏览器中获取本地文件的唯一方法是使用input:file或者拖放，浏览器由于安全问题，不能直接访问本地文件系统。

通过input:file的DOM对象的files属性能够拿到当前选中文件列表（FileList对象），FileList对象的每一个属性（0、1...）值都是一个File对象，File对象中有文件的大小、名字、修改时间（lastModified）等等的信息。

input:file可以指定accept属性，指定可以接受的文件类型。

### Blob对象
Blob表示二进制原始数组，它提供了一个slice方法，可以通过该方法访问到原始数据块。file对象也继承了这个Blob对象。

slice取的是一个子Blob对象。

### FileReader接口
FileReader主要用来把文件读入内存。

FileReader的主要api有：
* readAsBinaryString(file)
* readAsDataURL(file)
* readAsText(file)
* readAsArrayBuffer(file)
* abort()

文件读取的结果都存在FileReader实例化后的对象中，主要属性有：
* result
* readyState

监听FileReader对象事件，可以知道FileReader当前的读取状态，主要事件有：
* onabort
* onerror
* onloadstart
* onprogress
* onload
* onloadend

**事件参数都是Event对象，注意：读取的数据不在Event对象中，在FileReader对象中，我们在回调函数中可以通过this.result拿到读取的结果或者通过reader.result**