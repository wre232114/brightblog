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
在HTML5中，提供了很多的api，例如访问文件的File API，通过使用这个api，从web页面上访问本地文件系统会变得十分简单。还有websocket、localStorage、canvas、跨文档消息传递（postMessage）、web workers、地理位置等。近期新增的还有fetch api，steam api，TypeArray，ArrayBuffer，WebGL等等。

这篇文章尽量对这些api做一个介绍和总结，如果内容太多会外链到其他的博客中。

## FileList对象和File对象
浏览器中获取本地文件的唯一方法是使用input:file或者拖放API，浏览器由于安全问题，不能直接访问本地文件系统。

通过input:file的DOM对象的files属性能够拿到当前选中文件列表（FileList对象），FileList对象的每一个属性（0、1...）值都是一个File对象，File继承自Blob对象，File对象中有文件的大小、名字、修改时间（lastModified）等等的信息。

input:file可以指定accept属性，指定可以接受的文件类型。

### Blob对象
Blob表示不变的二进制原始数组，它提供了一个slice方法，可以通过该方法访问到原始数据块。file对象也继承了这个Blob对象。

属性：
* size，blob包含的数据的字节数
* type，blob包含的数据的mime类型

方法：
* slice(start,[end])，返回一个截取特定长度的Blob对象
* stream()，将Blob转成一个ReadableSteam
* text()，将Blob转成一个stream并且完整的读取它，返回一个值为text的promise
* arrayBuffer()，将Blob转成一个stream并完整的读取它，返回一个值为arraybuffer的promise

使用实例：
```js
let obj = {
  hello: 'world'
};
let blob = new Blob([JSON.stringify(obj, null, 2)], {
  type: 'application/json'
})
let blobReader = new FileReader();
blobReader.readAsText(blob);
blobReader.onload = function() {
  console.log(this.result)
}
```
Blob还能和createObjectURL一起使用，将typearray转成url对象。和FileReader结合使用可以以不同的形式读取Blob内部的内容。

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