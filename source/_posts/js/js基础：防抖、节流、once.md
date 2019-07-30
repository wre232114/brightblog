---
title: js基础：防抖、节流、once
date: 2019-07-25 07:44:16
tags:
- js
- js基础

category:
- js
- js基础
---

```js
// 实现方式1
function once(element, event, fn) {
  element.addEventListener(event, function a() {
    fn.call(this, ...arguments)
    element.removeEventListener(event, a, false)
  }, false)
}
// 实现方式2
function once2(obj,fn) {
  let called = false;
  return function() {
    if(!called) {
      fn.call(obj, ...arguments)
      called = true
    }          
  }
}
function denounce(obj, fn, delay) {
  let timer = null;
  return function() {
    if(!timer) {
      fn.call(obj, ...arguments)
    }
    clearTimeout(timer)
    timer = setTimeout(() => {
        clearTimeout(timer)
        timer = null
        console.log(timer)
    }, delay)
  }
}
function throttle(obj, fn, delay) {
  let timer = null;
  return function() {
    if(!timer) {
      fn.call(obj, ...arguments)
      timer = setTimeout(() => {
        clearTimeout(timer)
        timer = null
      },delay)
    }
  }
}
```