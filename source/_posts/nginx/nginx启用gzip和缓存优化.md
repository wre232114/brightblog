---
title: nginx启用gzip和缓存优化
date: 2019-06-09 17:07:24
categories: nginx
---

这篇文章给出了如何在nginx中配置gzip和开启缓存，利用缓存对网站进行优化。gzip压缩能将文件压缩到原大小的30%。

## 开启nginx中开启gzip

直接上配置文件片段：
```
http {
  gzip on; # 开启gzip压缩
  gzip_min_length 1k; # 使用gzip的最小文件大小
  gzip_buffers 4 16k; # gzip缓存
  gzip_comp_level 2; # gzip压缩级别，1-10，数字越大效果越好压缩时间越长
  gzip_types text/plain application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png application/javascript; # 压缩的类型，可以添加
  gzip_disable "MSIE [1-6]\.";

  server {
    location / {}
  }
}
```

## 开启缓存

```
location ~* \.(?:jpg|jpeg|png|gif|ico|css|js)$ {
  root /data;
  expires 60s;
}
```