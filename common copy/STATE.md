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
- **关键接口**：`onLoad(Type,Choose)`；批次查 `Sys_User/Sys_Organize/Sys_Post`；`getOpenerEventChannel().on('acceptDataFromOpener')` 回显；`confirmSelection` → `eventChannel.emit('acceptDataFromChild', result)` + `navigateBack`。
- **约束（现状坑）**：新页面事件名 `acceptDataFromChild/acceptDataFromOpener`，与现有调用方（`popupWindows.vue`/`chooseFrame.vue` 的 `ChoicePerson/echoChoicePerson`）**不兼容**。

### 审批页（expense）— 次要子系统
- **职责**：审批单/附件/流程/明细 4 页签。
- **关键接口**：`api/expense/index.ts` getApproval/getAnnex/getFlow/getDetail/commitAudit/saveFlow；`hook.ts` `NodeIdea`(流程链)/`Data`(单条静态缓存)；`format.ts` `formatValue`/`M_calculate`(自实现四则运算，避浮点)。
- **约束**：`eval('('+cfg.render+')')` 执行服务端渲染表达式；`getDetailSingle` 共享模块级 `let detail`。

## 关键约束与设计决策
- **配置即代码**：服务端 DB 存 JS（`Sys_DynamicCode.JSCode`、`FieldFunc`、`cfg.render`、`config.title`）→ 前端 `new Function/eval` 执行。这是低代码平台的核心，也是最大注入面。
- **事件总线**：`utils/instrument/event.js` = mitt（`on/off/emit/clear`，无 once）；另用 `uni.$on/$emit`（`showloginLoading`）；选人走 `EventChannel`（非 mitt）。
- **安全区/导航栏**：`utils/systemInfo_navBarHeight.js` 模块加载时 `getSystemInfoSync` 一次；`getStatusBar_Height/getTitleBar_Height/getNavigateBar_Height`；MP 用胶囊按钮矩形，H5/APP 标题栏常量 50。
- **深链**：`gzhr://pages/...`（APP）与 H5 `splash?redirect=<base64>`（中转页 `pages/Guide/splash.vue`）；`redirect` 必须 base64。
- **平台条件编译**：`#ifdef H5 / APP-PLUS / MP-WEIXIN`（App.vue、login.vue）。
- **零单测**：`package.json scripts.test` 为占位；无测试目录。
