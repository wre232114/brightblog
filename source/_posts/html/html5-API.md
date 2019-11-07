---
title: html5 API
date: 2019-07-23 07:37:50
tags:
- html5
- html5 API

category:
- html5
- html5 API
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
Blob构造函数一共接收两个参数，第一个参数是一个数组，数组的内容可以是ArrayBuffer、ArrayBufferView、Blob、USVString，或者这些对象的任意混合。USVString会按照UTF-8处理。第二个参数是一个选项对象：
* type：Blob的MIME类型，默认是空字符串
* ending（非标准）：内容的换行字符（\n)

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

### 参考资料
* [MDN Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob)


## Web Worker
Web Worker是浏览器提供了一个多线程计算能力，能够打破js单线程的限制，开启新的线程用于计算。这里对Web Worker的创建，使用，消息通信和使用做一个介绍，并介绍如何在vue中使用worker来进行并行计算。最后给出一个实例：在vue中使用worker来进行markdown的编译，然后将编译后的结果渲染到视图中。

<pre class="tips">提示：浏览器还支持其他的多线程API，例如Service Worker、Shared Worker等等，线程间的通信使用消息机制，例如Channel messaging、BroadCast channel、web RTC等等，具体请看[浏览器的多线程支持和消息传递](#)</pre>

### 创建Web Worker
创建Web Worker的方式是使用Worker构造函数new一个实例出来：
```js
const worker = new Worker('myscript.js')
```
Worker构造函数接收两个参数，第一个是url，表示worker中执行的脚本的url，必须遵循**同源策略**，也就是脚本所在的URL必须和文档是同一种协议、域名、端口（这里的url可以使用绝对、相对、对象URL、完整url，如果是在worker中创建Worker，相对url参照的是当前worker路径而不是文档）。第二个参数是一个可选的选项对象：
* type：创建的worker的类型，可以是classic或者module，默认classic
* credentials：值可以是omit、same-origin、include。默认omit
* name：worker的独立上下文的名字

worker可能会抛出以下异常：
* SecurityError：文档不允许创建worker时抛出（例如违背了同源策略）
* NetworkError：当HTTP返回的文档类型不是text/javascript时抛出
* SyntaxError：当脚本url无法被解析时抛出

### web worker的通信
worker和主线程之间通过message进行通信，使用两个API，postMessage()方法和message事件。

在主线程发出/接收信息：
```js
const worker = new Worker('myscript.js')
worker.postMessage(['val', 'value'])
worker.onmessage = function(e) {
  // ...
}
```

在worker中发出/接收信息：
```js
postMessage(['va'])
onmessage = function(e) {
  // ...
}
```
postMessage(message, transfer)会接收两个参数，message表示传递的消息，可以是任意值。注意：这里message不是传递的引用，而是使用结构性克隆算法克隆的结果，worker中收到的结果是一份完全的拷贝。传递的过程是，先将数据克隆，然后序列化，再反序列化还原，所以这里我们传递的是什么数据结构，拿到的就是什么数据结构。

第二个参数transfer是一个数组，里面是transferable对象列表，例如TypedArray。这些对象是按照引用来传递，但是传递到worker中以后，原来的上下文中的引用就不可用了，只有在worker中可用，相当于“将整个引用传递了过去”。

<pre class="tips">注意：这个参数只是表示将哪些过渡过去，传递的信息还是要使用message参数。</pre>

在message事件中收到的是MessageEvent对象，该对象用于message事件（例如Server-Sent、WebSocket、跨文档通信、worker、channel messaging、broadcast messaging等），最常用的是data和origin/source（例如验证在跨文档通信中的来源）。该对象有下面几个只读的属性：
* data：在message事件中传递的数据，可以是任意的数据类型
* origin：代表事件源的字符串
* lastEventId：代表event的独特id
* source：代表消息发送者的message event源（可以是Window Proxy、MessagePort、或者Servcie Worker对象）
* ports：MessagePort对象数组（在channel messaging或者shared worker中使用）

### web worker的特性
#### 同源特性
只能使用同源的url作为执行的代码来源，该代码的url，可以是相对url、绝对url、对象url、完整url路径，一种常见的方式是，通过URL.createObjectURL来创建对象URL，其值是脚本字符串，这样可以不进行网络请求的前提下执行指定的代码片段。

#### 上下文特性
web worker拥有自己的独立上下文，和创建它的文档上下文毫不相关。在其特有的上下文中实现了window上下文中的很多API。

self可以访问到上下文对象，在window上下文中，self指window对象；在worker上下文中，self指worker上下文。

#### API特性
web worker用于后台执行特定的代码，不能够直接和用户界面进行交互，例如window对象、DOM API在worker中都是不能访问的，但是worker中可以使用XMLHttpRequest、Websocket、Fetch API等IO操作的API，可以使用LocalStorage等存储API，也可以使用Promise、setTimeout等异步API。

### 扩展
这里我们利用上面学到的知识，封装一个简单的web worker库，具体细节请看[vue实战：实现vue-web-worker](#)。

## 参考资料
[Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker)
[Using Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
