// 脚本文件，控制头部选中的样式切换，目录下拉的当前选中，分类、归档查看更多。

// 页面头部的tab切换效果，首先获得当前的url，解析url，得到path，根据path来判断当前在哪个位置
var path = window.location.pathname;
var category = /categories/, archive = /archives/;
var tabs = document.getElementById('header').getElementsByTagName('li')
if(category.test(path)) {
  tabs[2].getElementsByTagName('a')[0].className = 'active';
}
if(archive.test(path)) {
  tabs[1].getElementsByTagName('a')[0].className = 'active';
}
if(path == '/') {
  tabs[0].getElementsByTagName('a')[0].className = 'active';
}
