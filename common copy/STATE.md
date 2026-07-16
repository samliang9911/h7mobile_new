# 项目当前状态（STATE）

> 本文档描述系统当前真实状态，可自由修订。目标：始终准确，而非记录历史。
> 历史变更见 DEVELOPMENT.md。

---

## 架构总览
- **定位**：H7 综合管理系统移动端（uni-app + Vue3 `<script setup>`）。企业低代码 OA：智慧表单/流程/文档/报表/仪表盘/大屏。PC 端「参数相同」的移动镜像。
- **栈**：uni-app（多端：H5 / APP-PLUS Android&iOS / mp-weixin 等），Vue 3.5，Pinia 3 + pinia-plugin-persist-uni（已注册但无 store 配 persist），uview-plus 3（rpx 单位，easycom `u-/up-/uni-`），uni-ui，dayjs，spark-md5，JSEncrypt(RSA)，mitt，clipboard。
- **构建**：HBuilderX 工程（非 Vite/CLI）；`package.json` 无 build 脚本，靠 IDE 运行；TS 仅类型检查（noEmit），路径别名 `@/*` 及 `/api /store /pages /utils /static /components`。
- **入口**：`main.js`（createSSRApp，挂 Pinia + uview-plus + `$http_request`/`$throttle` 全局属性，`serverUrlTypeSwitch="production"`）→ `App.vue`（`onLaunch` 整体注释；仅 APP-PLUS 激活：splash + webview message 转发 + `gzhr://` 深链解析到 splash 中转页）。
- **目录约定**：
  - `pages/subPackages/autopage/` 动态表单引擎（components 模块 / control 控件 / view 废弃层）
  - `pages/subPackages/expense/` 审批页（annex 附件 / approval 审批单 / detail 明细 / flow 流程）
  - `pages/subPackages/publicform/publicChoicePerson.vue` 选人页
  - `api/autopage|expense/` 各自 `index.ts`(SQL) + `cleansData|hook|format.ts`(清洗)
  - `api/api.js` 统一请求/签名/加密；`api/DataPool.js` 数据关系处理器
  - `store/modules/{autoPage,global}.ts`；`utils/{encrypt,instrument,index.ts,...}`
  - `common/style/commonStyle.css` 4 个页面背景渐变工具类

## 模块状态

### 动态表单引擎（autopage）— 核心
- **职责**：URL 传 `Dev_PageConfigOID`（+可选 `operationOID`）→ 拉配置 → 渲染表单/表格/选择页。
- **入口**：`pages/subPackages/autopage/index.vue` `onLoad` → `get(Dev_PageConfigOID, {component, operationOID})`（`api/autopage` 默认导出）→ `Promise.all([getLayout,getComponent,getFormField,getCustomEvent,getButton,getDataApi])` → `Layout[MobileMode||'childLevel'](e,extend)` → `CompConfig[]` 树 → `<render>`（`components/index.ts`）递归渲染。
- **关键接口/契约**：
  - `components/index.ts`：函数式分发，按 `name` 取 `all={grid,form,row,column,tabs}`，命中 `useMethods` 时把 `getFieldValue/setFieldValue` 注入 `component.methods`；未命中渲染 `(name)组件不存在`。
  - `control/index.ts`：按 `type` 取 `{date,input,radio,select,checkbox,textarea,choosePage}`（注意：`chooseFrame` 未注册）。
  - 控件契约：`const data = defineModel()`（v-model modelValue）；属性经 form 的 `v-bind="item"` 透传；唯一自定义事件在 `choosePage`：`onPageOpenBefore`(开) / `onChangeBefore({data, callback})`(回填，callback=false 终止)。
  - 数据模型 `cleansData.defaultData`：`reactive(CompConfig)` + 非枚举属性 `methods/loading/api(deepFreeze)/component(deepFreeze)/request/model`；`model={[Pub_DataAPIOID]:{add:[],upd:[],del:[]}}` + 非枚举 `getModel(value)`；`reactiveWithReadListener` 用 Proxy 在 get 拦截里返回 `methods[key]`。
  - 增删行：不在表格层，在 `tabs/buttonEvent.ts` `addGrid`；**无删除实现**。
- **约束**：WebControl 名经 `parseFormConfig` 归一（`normalInput→input`、`dateSelector→date`、`oneNodeSelector→select`、`radioSelector→radio`、`checkBoxSelector→checkbox`、`compTextarea→textarea`；`chooseFrame/pickPeople→choosePage`）。
- **缺陷（现状）**：
  - `view/render.vue|layout.vue|tabs.vue` 为废弃层，`index.vue` 不引用。
  - `select.vue`/`checkbox.vue`/`grid/form/index.vue` 为桩（`<view>select</view>` 等）。
  - `grid/list/table/table.vue:46` 非法 `import { defineModel } from '../model'`。
  - `getComponent`(`api/autopage/index.ts:46`) 硬编码 OID，忽略入参。
  - `store/modules/autoPage.ts` 默认导出 store 的 `init()` 整体注释（无操作）。

### 请求层（api/api.js）
- **职责**：统一 `http_request` 封装 + RSA 签名 + 登录 + token 轮换。
- **关键接口**：`http_request(proxy,json_data,str_url,prosperity,lose,isthrottle)`、`request(post=[{}])`（synthesis 通用入口）、`logins`、`getEncrypt`、`getSign`、`isTokenExpired`、`throttle`、`navigateTo`（atob 路径）。
- **约束**：
  - 基址 `getUrlType()`=`uni.getStorageSync('serverUrl')||window.location.origin`（后者仅 H5）。
  - 默认端点 `serverUrl+'/api/pubData/synthesis'`；登录 `/api/sysAuth/login`。
  - 头：`sign`=RSA(`AccessToken+'＆'+timestamp`，**全角＆**)、`Authorization: Bearer <Access-Token>`、`X-Authorization: Bearer <X-Access-Token>`。
  - 响应信封 `{code,msg,data}`，**字符串** `code==='1000'` 成功；`401/2010-2014/2220` 判过期 → 清缓存 reLaunch `/pages/login/login`。
  - FormData 走原生 XHR 到硬编码 `http://192.168.0.81:18/api/sysFile/fileSave`。
  - 公钥打乱存储 `getKey()`(api.js:344) 还原；登录名/密码 RSA 加密存 `UCML_UserName/UCML_UserPassword`。

### 数据关系处理器（api/DataPool.js）
- **职责**：取数后的主子表关联/虚拟字段/自定义列加工（非缓存、非去重）。
- **关键接口**：工厂导出 `Main`；组件类 `DefaultModule`(主)/`Grid`/`DataDetail`/`Echarts`。
- **约束**：`Relation`：空/0=主表（>1 主表报错）；`1`=父子(Connect/Superposition 已实现, RowtoColumn/Tree 未实现)；`2`=执行者。虚拟字段 `Max/Min/Avg/Sum/First/LineWrapping`。自定义列 `new Function('e', FieldFunc)`（**eval 面**）。

### 状态管理（store）
- **stores**：
  - `usePageStore(id)` id=`'autoPage-'+id`（init 已注释）
  - `useGlobalStoreHook` id=`'globalParams'`（`IsBusinessPage/refList/Dev_PageComponent/Pub_DataAPI/tableNameMap`）——与 global.ts 同名函数冲突
  - `useModulesStore` id=`'moudles'`(拼写错误) `modules/curModules/model/fileModules`，供 form 上传跟踪
  - `useGlobalStore` id=`'global'`（页面配置运行态：`Dev_PageConfig/Dev_PageComponent/Pub_DataAPI/Dev_PageField/Dev_PageBotton/Sys_FieldInfo/.../flowList/BusinessState/BPReadOnly`）
- **约束**：登录态**不在 Pinia**，在 `uni.setStorageSync`（`Access-Token/X-Access-Token/AccessToken/UserOID/...`）。`global.ts:271 useGlobalStoreHook` 引用未定义 `store`（调用即报错）。

### 选人页（publicChoicePerson）
- **职责**：人员/单位/部门/岗位多选（radio/checkbox/fcheck）。
- **关键接口**：`onLoad(Type,Choose)`；批次查 `Sys_User/Sys_Organize/Sys_Post`；`confirmSelection` 双发回传——新契约 `{data:[...实体], mergeData:{字段:[值数组]}}` via `acceptDataFromChild` + 兼容旧契约纯数组 via `ChoicePerson`；回显双监听 `acceptDataFromOpener` + `echoChoicePerson`（复用同一 handler）；`navigateBack`。
- **契约基线**：对齐 PC 端 A 的 `{data, mergeData}`（全字段列转置，null→`''`，radio 不做单值特例）。`choosePage` 控件注册子页 `acceptDataFromChild`、消费 `mergeData[returnValueField[i].split('.').pop()].join(',')` 写回 `formData[storedValueField[i]]`、`success` 按 OID/UOID 锚点 `emit('acceptDataFromOpener',{items})` 回显；`onChangeBefore` 的 `data` 仍透传数组给自定义代码。`audit.vue` 取 `(data&&data.data)||data` 兼容。
- **兼容层（待迁移后移除）**：`ChoicePerson`/`echoChoicePerson` 双发仅供旧调用方（`popupWindows.vue`、`form/processFlow/index.vue` 及拷贝）零改动恢复；本期未迁移这些调用方。

### 审批页（expense）— 次要子系统
- **职责**：审批单/附件/流程/明细 4 页签。
- **关键接口**：`api/expense/index.ts` getApproval/getAnnex/getFlow/getDetail/commitAudit/saveFlow；`hook.ts` `NodeIdea`(流程链)/`Data`(单条静态缓存)；`format.ts` `formatValue`/`M_calculate`(自实现四则运算，避浮点)。
- **约束**：`eval('('+cfg.render+')')` 执行服务端渲染表达式；`getDetailSingle` 共享模块级 `let detail`。

### 上传 / 附件（components/upload）— P3 传输就绪；form.vue 已接入（注入式传输 + APP 端支持）
- **职责**：移动端「附件」上传的渲染与交互外壳，对齐 PC 端 creatpage（**组件级附件面板，非 WebControl 字段控件**）。支持图片/视频/3D模型/通用文件 4 类（`config.Type` 区分）。**渲染与传输彻底解耦（注入式）**。
- **关键接口**：
  - `components/upload/upload.vue`：单分类 widget。Props `config`(Pub_FileConfig 行)/`showUploadButton`/`showDelButton`/`readonly`/`iconBase`/`onUpload?`/`onDelete?`；`defineModel<any[]>` 绑定展示文件数组（`{OID,FilePath,FileName,FileType}`）。按 Type 分发 `uni.chooseImage/chooseVideo/chooseFile`；图片走 `uni.previewImage`。传 `onUpload` 走真实传输，传 `onDelete` 走真实删除请求，不传走 MOCK。
  - `components/upload/uploadService.ts`：可复用上传函数层（纯函数，不依赖组件上下文）。导出 `uploadFile`(主入口)、`createInfo`、`calculateHash`、`createFormData`、`uploadChunk`(H5)、`uploadByUniUploadFile`(APP)、`fetch`、`getFilePath`、`deleteFile`。端点通过 `getUrlType()` 动态获取，不再硬编码。
  - `components/upload/fileUpload.vue`：多分类面板（demo 用；autopage 单分类暂直用 `upload.vue`）。移植 A 的 `showFileUpload`/`showFileType`/`showUploadButton`/`showDelButton`/`flowNodeReq`。
  - `components/upload/fileType.ts`：`BasicTypeList`/`getTypeList`/`getFileType`/`isImageExt`/`buildAccept`/`getFileIconUrl`（内联，避免 import H5-only 的 fileView.js）。
  - demo：`pages/subPackages/uploadDemo/index.vue`（路由 `pages/subPackages/uploadDemo/index`，默认导航栏，MOCK 传输）。
  - autopage 接入：`pages/subPackages/autopage/components/modules/form/form.vue` 模板用 `<upload :onUpload="handleUpload" :onDelete="handleDelete">`；`handleUpload` 调用 `uploadService.uploadFile`；`handleDelete` 调用 `uploadService.deleteFile` + store 同步。
- **约束 / 现状**：
  - **跨端传输**：H5 走 MD5 + 5MB 分块 + XHR 上传；APP/MP 走 `uni.uploadFile` 整文件上传（`#ifdef H5 / #ifndef H5` 条件编译）。demo 默认 MOCK（无 `onUpload`）。
  - form.vue 既有缺陷已修：`annexConfig[2]` 空值崩溃（改 `annexConfigRow` computed + `?.`）、上传项不显示（原 push 到 computed 瞬态数组，现 v-model `data.annex`）。
  - `data.annex` 无服务端预载（autopage 数据层只设 `annexConfig`）；附件列表进页为空，仅显示会话内上传。预载属 P4。
  - 未接 autopage 多分类：`control/index.ts` 未注册上传类型（A 上传非字段控件）；多分类面板 P4 接入。
  - 复用 `generateUUID`(`@/utils`)、`deepClone`(`@/utils/index.ts`)、`http_request`(`@/api/api.js`)、`useModulesStore`。
- **store 补全**：`useModulesStore`(id=`'moudles'`) 新增 `removeFileData/getFileData/setFileData/removeCurrentData/getCurrentData/setCurrentData`，对齐 PC 端 A 的 `saveModel.ts`。
- **待办**：P4 autopage 加载 `Pub_FileConfig`/`Pub_BusinessFile` 预载 + 多分类面板（`fileUpload.vue`）；P5 版本控制「创建时冻结」。
- **待清理**：`components/publicForm/formPictrue.vue` 孤儿 `up-upload` 组件。

## 关键约束与设计决策
- **配置即代码**：服务端 DB 存 JS（`Sys_DynamicCode.JSCode`、`FieldFunc`、`cfg.render`、`config.title`）→ 前端 `new Function/eval` 执行。这是低代码平台的核心，也是最大注入面。
- **事件总线**：`utils/instrument/event.js` = mitt（`on/off/emit/clear`，无 once）；另用 `uni.$on/$emit`（`showloginLoading`）；选人走 `EventChannel`（非 mitt）。
- **安全区/导航栏**：`utils/systemInfo_navBarHeight.js` 模块加载时 `getSystemInfoSync` 一次；`getStatusBar_Height/getTitleBar_Height/getNavigateBar_Height`；MP 用胶囊按钮矩形，H5/APP 标题栏常量 50。
- **深链**：`gzhr://pages/...`（APP）与 H5 `splash?redirect=<base64>`（中转页 `pages/Guide/splash.vue`）；`redirect` 必须 base64。
- **平台条件编译**：`#ifdef H5 / APP-PLUS / MP-WEIXIN`（App.vue、login.vue）。
- **零单测**：`package.json scripts.test` 为占位；无测试目录。

### 事项列表组件（components/index/index.vue）
- **职责**：展示待办/已办/待阅/已阅列表卡片，支持下拉刷新和上拉加载
- **关键接口**：`goShowInfoOn(item)` 点击跳转、`getData()` 请求数据、`setTitleCategory/item` 等格式化函数
- **约束**：`naviId` 由 `tabIndex + 1` 计算，1=待办、2=已办、3=待阅、4=已阅
- **数据更新**：`getData()` 请求成功后更新父组件传入的 `tabsList[0].count`（待办总数）和 `tabsList[2].count`（待阅总数）

### Tab导航组件（pages/index/items.vue）
- **职责**：展示四个Tab页签（待办/已办/待阅/已阅），管理滑动切换
- **角标功能**：使用 `up-badge` 组件在Tab右上角显示数量角标，超过99显示"99+"
- **数据来源**：角标数据来自 `tabsList[i].count`，由子组件 `index.vue` 更新
