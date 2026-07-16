---
name: mobile-upload-adapt
description: 移动端「附件」上传功能的跨项目适配（A creatpage → B h7mobile_new）。上传 = 组件级附件面板（非字段控件），4 类由 Config.Type 区分，版本控制 = 创建时冻结。开始任何上传相关工作前先读此 Skill + STATE.md「上传/附件」段。
---

# 移动端上传适配（A creatpage → B h7mobile_new）

通用跨项目方法见 [[跨项目适配SKILL.md]]，本文只讲上传子系统。

## 1. 核心认知（红线）

- **上传不是字段控件**：A 的上传是**组件级「附件」面板**，由 `Form.vue` 在 `element.fileConfig.length` 时与表单字段**并列渲染**，**不走 WebControl/`control/index.ts`**。不要把 upload 注册成 control 类型——会偏离 A。
- **4 类由单字段 `Config.Type` 区分**：`image` / `video` / `model3d` / `WJ`（通用文件，含空）。Type 决定 accept 白名单、图标、预览方式。扩展名集中表 `BasicTypeList`（model3d 18 种、cad、office…）。
- **配置来源 `Pub_FileConfig`**：每行 `BusinessKey = Dev_PageComponentOID`；一个组件可有**多个分类**（多行 fileConfig）。
- **版本控制 = 创建时冻结**：`Pub_FileConfigVersion` 是配置历史快照，过滤 `CreationzTime > 主表.SYS_Created` 取「业务记录创建后发布的首版配置」，防管理员改配置追溯影响在途单据。仅流程页（`IsBusinessPage` + 主表有 `SYS_Created`）触发，4 步链式查询（A `src/utils/data.js:283-349`），结果在 `App.vue:181-191` 替换 live 配置。
- **数据模型：附件不绑表单字段值**，存 3 个并行 store：
  - 展示数组 `v-model`（`{OID,FilePath,FileName,FileType,…}`，PK = `<tb>OID`）
  - `curModules[TableName]`（DB 行元数据）
  - `fileModules[TableName]`（字节载荷 `{Id,Fp,Fn,Bs,Bf}`）
- **传输契约**：活动路径 = MD5（spark-md5）+ 5MB 分块 POST `/api/sysFile/fileSave`，FormData 字段 `id/HashId/index/count/bs/sf`；图片预览 `/api/sysFile/stream?url=`；删除 `{tag:'del',tb,wh:[oid],fileList:[{Fp:FilePath}]}`。

## 2. A→B 文件映射

| 维度 | A（creatpage） | B（h7mobile_new） |
|---|---|---|
| 上传 widget | `src/views/Card/formWidget/upload/index.vue`（活动路径，分块） | `components/upload/upload.vue`（P1 渲染，传输暂 MOCK） |
| 多分类面板 | `src/views/Card/formWidget/file-upload.vue`（门控+循环 fileConfig） | `components/upload/fileUpload.vue`（P1，门控逐字移植） |
| 类型表/图标 | `src/utils/index.js`（BasicTypeList/getTypeList/getFileType/getFileIconUrl） | `components/upload/fileType.ts`（已移植，getFileIconUrl 内联） |
| 配置加载 | `src/store/modules/global.ts:220-225`（挂 `element.fileConfig`） | **未接**（autopage 未加载 Pub_FileConfig）→ P4 |
| 版本控制查询 | `src/utils/data.js:283-349` + `src/App.vue:181-191` | **未接** → P5 |
| 模块 store | `src/store/modules/saveModel.ts`（addFileData/addCurrentData/removeFileData/getFileData…） | `store/modules/autoPage.ts` `useModulesStore`（id `'moudles'`）——**砍残版**，缺 removeFileData/getFileData/setFileData → P3 补 |
| 传输 | `P_Ajax`（后端注入全局，禁移植） | `api/api.js` `http_request`（FormData 分支端点硬编码 `192.168.0.81:18`，无进度回调）→ P3 去硬编码 |
| 已有移动上传 | — | `pages/subPackages/autopage/components/modules/form/form.vue` **已改用** `upload.vue`（v1.5，注入 `handleUpload` 复用原分块逻辑）；仅剩死 image-* 样式待清。`components/publicForm/formPictrue.vue` 孤儿 `up-upload` 待删 |
| 预览 | `src/utils/index.js` previewFile/preVideo/preModel3d/preOffice… | `pages/subPackages/expense/annex/fileView.js`（**H5-only DOM**，含 `layer`/`$`/`document`）→ P2 跨端重做 |
| demo | — | `pages/subPackages/uploadDemo/index.vue`（路由 `pages/subPackages/uploadDemo/index`） |

## 3. 当前进度

- ✅ **P1 渲染**（2026-07-14）：`components/upload/{fileType.ts,upload.vue,fileUpload.vue}` + demo 页。自绘网格/图标/缩略图/圆环进度/删除/4 类选择器/门控，**传输 MOCK**（setInterval，不发请求、不写 store）。已验证。
- ⏸ **P2 交互/跨端**（**暂缓**）：非图片跨端预览（office/CAD/3D/视频，fileView.js 现为 H5-only DOM）、MP-WEIXIN `chooseMessageFile`（`uni.chooseFile` 在 MP 不可用）、MP 圆环 `conic-gradient`/`aspect-ratio` SVG 兜底。
- 🔜 **P3 传输**：复用 `form.vue` 已移植的 `createInfo/upload/calculateHash/createFormData` 抽成可复用上传函数（端点去硬编码、加进度回调）；补 `useModulesStore` 的 `removeFileData/getFileData/setFileData`（对齐 A `saveModel.ts`）；接 store。
- 🔜 **P4 集成**：autopage 加载 `Pub_FileConfig` → 挂 `fileConfig` → 渲染本面板（对齐 A 组件级面板）；替换 `form.vue` 内联上传 + 删孤儿 `formPictrue.vue`。
- 🔜 **P5 版本控制**：4 步链式查询（`_fv_ct_/_cv_ct_/_fv_/_cv_` 别名）+ App 级配置替换（创建时冻结）。

> **已完成（v1.5）**：`form.vue` 上传渲染替换为 `upload.vue` 组件——注入式传输（`onUpload` prop，复用原分块逻辑；demo 不受影响仍 MOCK），顺手修了 `annexConfig[2]` 空值崩溃与「上传项不显示」两缺陷。传输仍 H5-only（P3 做 APP）。

## 4. Pub_FileConfig 行字段（Config）

`Pub_FileConfigOID`(PK/v-model key) · `Name`(标题) · `Type`(`image|video|model3d|WJ|''`) · `AllowTypes`(逗号扩展名，WJ 时生效) · `LimitSize`(MB，默认 100) · `QuantityLimit`(数量，1=单选) · `Required`/`RequiredTips` · `Always_Upload`(终态仍显示) · `Mark`(分类标记，同表多分类区分) · `BusinessDataTable`(默认 `Pub_BusinessFile`) · `DestinationFolder`(存储目录=Bf) · `ParseFile`(OFD 解析) · `QrCode`(扫码上传，PC) · `RightMenu`(右键菜单逗号串，PC) · `ReadOnly` · `AllowUploadNode`/`CanModifyNode`/`IsRequired_Flow`(逗号串 ActivityID 流程节点门控)。

门控函数（B `fileUpload.vue` 已移植）：`showFileUpload`/`showFileType(Config)`/`showUploadButton(Config)`/`showDelButton(Config)`/`flowNodeReq(Config)`，入参 `businessState`(1草稿/3审批中/4,5完成/100,101,102终态) + `queryW`(3=只读) + `taskID` + `activityID` + `isBusinessPage` + `bpReadOnly`。

## 5. 横切坑点

- **选择器返回结构跨端不一致**：H5 `tempFiles` = File 对象（有 name/size、**无 path**，用 `tempFilePaths` 或 `URL.createObjectURL`）；APP/MP = `{path,size,name}`。B `upload.vue` 用 `normFile` 归一化。
- **图标基址**：`iconUrl = base + getFileIconUrl(ext)`，`base = iconBase || getUrlType()`（`@/utils/instrumentType.js` 零参版，APP 端 `window` 未定义需 try/catch）。demo 用 `ICON_BASE` 常量便于本地渲染。
- **`v-model="fileListMap[oid]"`**：依赖父级预初始化每个分类 key，否则 defineModel 默认 [] 与父级断开。
- **fileView.js 是 H5-only**（DOM/jQuery/layer）：跨端组件**不要直接 import 其 previewFile/preVideo**；`getFileIconUrl` 已内联到 `fileType.ts`。
- **成功码字符串**：B `code==='1000'`（A 是数字 `1000`）；删除/上传响应判定用 B 约定。
- **store id 拼写**：`useModulesStore` 的 id 是 `'moudles'`（历史拼写错误，勿改）。
- **P_Ajax 禁移植**：A 的传输层是后端注入全局；B 一律走 `http_request`。

## 6. 工作流

每个阶段都走 [[跨项目适配SKILL.md]] §5 的 7 步（扫描 A → 探查 B → 建映射 → 定策略 → EnterPlanMode → 实现 → 维护 DEVELOPMENT/STATE）。改动前后必读 STATE.md「上传/附件」段，变更追加 DEVELOPMENT.md。
