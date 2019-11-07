---
title: 浏览器中的权限和Permission API
date: 2019-09-19 07:53:58
tags:
- html5
- html5 API
- html Permission API

category:
- html5
- html5 API
---

浏览器提供各种各样的能力，如访问摄像头，访问地理位置，访问剪切板，Notification等等，许多API都是需要用户授权才能使用的。但是以前的API授权方式不具有一致性，每个API都有自己的不一样的授权方式。目前处于Working Draft的Permission标准就是用于解决这个问题的，Chrome 60+，firefox 46+支持。

Permission API用于解决浏览器的授权方式一致性问题，通过Permission API可以对所有的授权提供一直的授权申请、授权状态查询。

## 使用Permission API
通过navigator.permissions.query来申请和获取权限状态。query方法的只接收一个参数，该参数是一个对象，该对象可能包含三个属性：
* name：申请的权限的名字，可能是  "geolocation",
  "notifications",
  "push",
  "midi",
  "camera",
  "microphone",
  "speaker",
  "device-info",
  "background-fetch",
  "background-sync",
  "bluetooth",
  "persistent-storage",
  "ambient-light-sensor",
  "accelerometer",
  "gyroscope",
  "magnetometer",
  "clipboard",
  "display"
* userVisibleOnly：仅用于push
* sysex：仅用于midi

query方法返回一个promise，该promise resolve一个PermissionStatus对象，该对象的state或status属性代表当前授权的信息，可能的值是：
* granted
* prompt
* denied

该对象的change事件当state改变时触发。

## 参考资料
[MDN Permission API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
[w3c Permission](https://w3c.github.io/permissions/#request-permission-to-use)