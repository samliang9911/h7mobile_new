
## 安装依赖
```
npm install
npm install spark-md5
```

## 运行项目

```
数据线连接手机  运行项目
```
最新版移动端项目

uni-app 新的改造项目


# 审批单目前进度
```
优化（可选）：
1.在选人页面添加一个取消按钮，点击取消直接返回父页面，数据不进行保存
2.选人页面搜索优化，在搜索时将已选内容进行优先显示
待完善：
点击抽屉以外的地方数据会丢失
执行带有刷新功能的操作时数据会清空（未确认是否执行成功）
待办：
当前在做附件显示
流程组件
旧式明细页面未定义一页显示几张表
```


## 目录结构



| 模块                            | 路径                                                | 说明           |
| ------------------------------- | --------------------------------------------------- | -------------- |
| 选人                            | pages\subPackages\publicform\publicChoicePerson.vue | 和pc端参数相同 |
| [审批页面](#审批页面)           | pages\subPackages\expense\index.vue                 |                |
| [动态表单(autopage)](#动态表单) | pages\subPackages\autopage\index.vue                | 和pc端参数相同 |



### 审批页面

动态表单的sql函数都在下**api\expense**文件夹内

| 文件名   | 说明                                    |
| -------- | --------------------------------------- |
| index.ts | 审批单、附件、流程、明细等sql都封装在此 |
| hook.ts  | 把sql查询出的数据格式化成前端数据       |

审批页面有4个页签，分别是审批单、附件、流程、明细

在**pages\subPackages\expense**文件夹下，对应annex、approval、detail、flow目录

| 模块     | 说明   |
| -------- | ------ |
| annex    | 附件   |
| approval | 审批单 |
| detail   | 明细   |
| flow     | 流程   |





### 动态表单

动态表单的sql函数都在下**api\autopage**文件夹内

| 文件名        | 说明                              |
| ------------- | --------------------------------- |
| index.ts      | 布局、组件、按钮等sql都封装在此   |
| cleansData.ts | 把sql查询出的数据格式化成前端数据 |
| indexTypes.ts | 类型声明文件                      |



在模块在pages\subPackages\autopage文件夹下，autopage文件夹下共有3个小模块，分别是：

| 模块       | 说明                                            |
| ---------- | ----------------------------------------------- |
| components | 页面内的组件都在此【tabs、grid、form等】        |
| control    | 页面内的控件都在此【input、select、checkbox等】 |
| view       | 页面内的布局都在此                              |



## 外部唤醒应用

#### 网页唤醒手机app

###### 例子：

```html
<a href="gzhr://pages/index/items?a=1">打开指定路径</a>
```

###### 说明：

```js
"gzhr://" + "pages/index/items【app内指定页面的路径】"
两部分，第一部分是固定的，第二部分是指定路径
```



##### 实现逻辑代码

###### 路径：

```
/App.vue
```

###### 代码：

```js
onShow(()=>{
  const url = (plus.runtime.arguments||'').replace(/gzhr:\//,'')
  if(url){
    plus.runtime.arguments = ''
    uni.navigateTo({
			url:"/pages/Guide/splash?redirect="+btoa(url).replace(/\+/g, '-').replace(/\//g, '_')
		})
  }
})
```



#### 网页唤醒网页

##### 注意：

唤醒网页需跳中转页，中转页路径：

```
pages\Guide\splash.vue
```



##### 例子：

```html
<a href="http://192.168.0.71:801/H7/index.html/#/pages/Guide/splash?redirect=唤醒页面路径">
    打开指定路径
</a>
```

##### 说明：

```
http://192.168.0.71:801/H7/index.html/#/pages/Guide/splash?redirect=唤醒页面路径

1、【http://192.168.0.71:801/H7/index.html】是移动端网页路径

2、【/#/pages/Guide/splash】是固定的

3、【?redirect=唤醒页面路径】参数redirect的值是一个路径

```

###### redirect参数说明

**路径必须经过base64转义！**

例子：

```js
const path = btoa('pages/index/items?a=1').replace(/\+/g, '-').replace(/\//g, '_')
const url = 'http://192.168.0.71:801/H7/index.html#/pages/Guide/splash?redirect='+path

window.open(url)
```

