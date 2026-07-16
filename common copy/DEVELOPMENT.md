# 项目开发文档（append-only 变更日志）

> 规则：禁止覆盖/重写/删除已有条目；仅追加。旧条目被推翻时加 `⚠️ [已被 YYYY-MM-DD 变更取代]`，保留原文。
> 当前状态见 STATE.md；本文件只记「发生了什么变更」。

---

## 版本历史

### [2026-07-10] - v1.0 全代码库首扫（按 公共页面开发文档 + scan.md + read-claude-md 协议）

#### 新增功能
- 完成一次端到端代码库深度扫描，覆盖三个子系统：autopage 动态页面引擎 / store+api 层 / App 入口与 utils。
- 产出「项目专属 AI 助手 Skill」（scan.md 规定的 6 段式：定位/架构/数据流/规范/坑点/命令）。
- 新建 STATE.md，固化「系统当前真实状态」快照（按模块组织）。

#### 技术实现
- 三路并行扫描（general-purpose subagent），各路返回 file:line 级事实，主循环汇总。
- 关键事实源：package.json / pages.json / manifest.json / tsconfig.json / README.md + autopage、api、store、utils 全量源码。

#### 关键发现（详见 STATE.md）
- 动态表单引擎 `pages/subPackages/autopage`：配置驱动，URL 传 `Dev_PageConfigOID`，经 `api/autopage` 的 synthesis SQL 批量查询 + `cleansData.ts` 清洗成 `CompConfig[]` 树，由 `components/index.ts` 递归渲染。
- 请求层 `api/api.js`：RSA 签名（全角＆分隔）、双 Bearer token、`code==='1000'` 字符串判定成功、token 过期 reLaunch 登录。
- 数据关系处理器 `api/DataPool.js`：主子表 Connect/Superposition 关联 + 虚拟字段聚合 + `new Function` 执行服务端配置。
- 已确认的缺陷/桩：`select.vue`/`checkbox.vue`/`grid/form/index.vue` 为桩；`view/*` 为废弃层；`table.vue:46 defineModel from '../model'` 导入断裂；`getComponent` 硬编码 OID；`publicChoicePerson` 事件契约与旧调用方不一致。

#### 待优化
- 修复 `api/autopage/index.ts:46` `getComponent` 硬编码 `Dev_PageConfigOID`（应取入参）。
- 补齐 `select.vue` / `checkbox.vue` / `grid/form/index.vue` 真正实现。
- 修复 `grid/list/table/table.vue` 对 `defineModel` 的非法 import。
- 对齐选人事件契约：新 `publicChoicePerson.vue`（`acceptDataFromChild`/`acceptDataFromOpener`）vs 调用方（`ChoicePerson`/`echoChoicePerson`）。⚠️ [已被 2026-07-11 v1.3 变更取代，详见当日记录]
- 清理死代码：`view/render.vue`、`view/layout.vue`、`view/tabs.vue`、`api/autopage/index.ts` 大段注释、`store/modules/autoPage.ts` 注释掉的 `init()`。
- 修正 store 命名/引用：`useGlobalStoreHook`（global.ts:271）引用未定义的 `store`；store id `'moudles'` 拼写错误。
- 去硬编码：`buttonEvent.ts` 表名/UUID、`list/index.vue` 的 `BillType`/`Remarks`、`cleansData.ts` 中文标题分支、`api.js:189` 上传地址、QQ 地图 key。

#### 风险
- 多处 `eval` / `new Function` 执行服务端下发的 JS（format.ts、hook.ts、DataPool.js、buttonEvent.ts、utils/index.ts）——配置即代码，属设计内但属高危面。
- RSA 公钥存储为打乱字符串（api.js:341）、签名用全角＆——重构易破坏登录。
- `window.location.origin` 在 APP/MP 端 undefined（instrumentType.js）。

---

### [2026-07-10] - v1.1 待办/待阅列表角标功能 ⚠️ [已被 2026-07-10 变更取代]

#### 新增功能
- 在列表卡片左上角添加红色三角形角标标识
- 角标仅在待办（naviId=1）和待阅（naviId=3）页面显示，已办和已阅页面不显示

#### 技术实现
- 使用 CSS clip-path 实现三角形角标，避免 border 方式的 border-radius 无效问题
- 通过 `v-if="naviId === 1 || naviId === 3"` 控制角标条件渲染
- 角标定位采用绝对定位，父容器 `.middleBox` 设置 `position: relative`

#### 改动点
- `components/index/index.vue`: 新增角标模板节点和样式

---

### [2026-07-10] - v1.2 Tab页签数量角标功能

#### 新增功能
- 在待办和待阅 Tab 页签右上角显示数量角标
- 角标数量超过99时显示"99+"

#### 技术实现
- 使用 uview-plus 的 `up-badge` 组件，添加 `overflow-count="99"` 属性实现99+效果
- 角标数据来源于 `tabsList[i].count`，由子组件 `index.vue` 的 `getData()` 更新
- 待办（tabIndex=0）和待阅（tabIndex=2）自动显示角标，已办和已阅不显示（通过后端返回的 count 值控制）

#### 改动点
- `pages/index/items.vue`: 给 `up-badge` 添加 `overflow-count` 属性
- `components/index/index.vue`: 移除之前错误添加的卡片角标

---

### [2026-07-11] - v1.3 选择页契约对齐补全（A `{data,mergeData}` + 断链修复 + echo）

#### 修改功能
- 修复 autopage 选人字段点击无效的断链：`choosePage` 控件原注册 `ChoicePerson`，子页 `publicChoicePerson` 只 emit `acceptDataFromChild` → 回调永不触发。
- 子页 `confirmSelection` 回传对齐 PC 端 A 的 `{data:[...实体], mergeData:{字段:[值数组]}}` 契约（全字段列转置）。
- 补全 `choosePage` 控件回显（echo，原整段注释未实现）。
- 兼容双发恢复 10+ 个旧调用方（popupWindows/processFlow 及拷贝），本期不迁移。

#### 改动点
- `pages/subPackages/publicform/publicChoicePerson.vue`：`confirmSelection` 改构造 `mergeData` + 双发 `acceptDataFromChild({data,mergeData})` 与 `ChoicePerson(itemsArray)`；`onLoad` 抽 `applyEcho` 并双监听 `acceptDataFromOpener`+`echoChoicePerson`。
- `pages/subPackages/autopage/control/modules/choosePage.vue`：`chooseFrame` 事件名 `ChoicePerson`→`acceptDataFromChild`；写回改消费 `mergeData`（`onChangeBefore.data` 仍透传数组兼容自定义代码）；`success` 按 OID/UOID 锚点 `emit('acceptDataFromOpener',{items})` 回显。
- `pages/subPackages/expense/approval/audit.vue`：`pickPerson` 的 `resolve(data||[])` → `resolve((data&&data.data)||data||[])`（一行，兼容数组/对象）。

#### 实现思路（决策）
- 选「混合」而非「纯新契约删旧」：旧调用方 10+ 个且含拷贝，全迁移风险高；双发零改动恢复，迁移留后续（`processFlow/index.vue` 随流程页适配一起迁）。
- `mergeData` 全字段列转置（含 type/checked），null→''，radio 不做单值特例（对齐 A）。
- echo 锚点取 `returnValueField` 中尾字段=OID/UOID 的首索引；非主键字段退化无回显（不报错）。
- `onChangeBefore.data` 保持数组透传，避免破坏 form.vue 里服务端自定义代码对 `data` 的消费。

#### 风险
- `onChangeBefore.data` 对外仍是数组（向后兼容）；内部写回由手写 reduce 改为消费 mergeData。
- 双发顺序先 `acceptDataFromChild` 后 `ChoicePerson`；无调用方同时注册两者。
- 不引入 `eval/new Function`，TS/小程序端安全。

#### 待优化
- 迁移旧调用方（popupWindows/processFlow 及拷贝）到 `{data,mergeData}` 契约后删除 `ChoicePerson`/`echoChoicePerson` 双发层。
- 核实并清理疑似死代码：`chooseFrame.vue`、`pages/choicePerson/choicePerson.vue`、`oldPopupWindows.vue`、`popupWindows copy.vue`（查 `pages.json` 路由注册）。
- 控件显示值同步：`choosePage` 展示值（defineModel）目前可能显示 OID 而非 Name，建议后续加 `displayField`。

---

### [2026-07-14] - v1.4 移动端上传 P1 渲染（独立组件 + 多分类面板 + demo）

#### 新增功能
- 移动端「附件」上传渲染层（P1），对齐 PC 端 creatpage 的 `upload/index.vue` + `file-upload.vue`，覆盖图片/视频/3D模型/通用文件 4 类（由 `config.Type` 区分）。
- 新增独立可复用组件目录 `components/upload/`：
  - `fileType.ts`：从 A 移植 `BasicTypeList`（含 model3d 18 种、cad、office）+ `getTypeList`/`getFileType`/`isImageExt`/`buildAccept`/`getFileIconUrl`（与 A 及本项目 fileView.js 逐字一致；内联以避免跨端组件 import H5-only 的 fileView.js）。
  - `upload.vue`：单分类 widget——自绘缩略图网格 + 文件类型图标/图片缩略图 + conic-gradient 圆环进度 + 删除角标 + 计数/必填；按 `config.Type` 分发 `uni.chooseImage/chooseVideo/chooseFile`；类型/大小/数量校验；图片走 `uni.previewImage`。 
  - `fileUpload.vue`：多分类面板，逐字移植 A 的 `showFileUpload`/`showFileType`/`showUploadButton`/`showDelButton`/`flowNodeReq` 显隐门控；跳过 PC 专有能力（右键菜单/二维码手机上传/el-upload 回退/OFD 解析）。
- 新增 demo 页 `pages/subPackages/uploadDemo/index.vue` + `pages.json` 注册（默认导航栏）：mock 4 类 `Pub_FileConfig` + 预置文件 + BusinessState/业务页/只读 切换器，演示显隐门控。

#### 技术实现 / 决策
- **架构**：A 的上传是**组件级「附件」面板**（非 WebControl 字段控件），故本期**不**注册进 `control/index.ts`，做成独立组件；P4 再以面板形式接进 autopage。
- **MOCK 范围**：上传进度用 `setInterval` 模拟 0→100%，**不发请求、不写 store**（遵循用户「不重做业务逻辑」）。传输/store/版本控制留 P3/P5。
- **跨端选择器归一化**：`normFile` 兼容 H5（tempFiles=File 对象、无 path → 用 tempFilePaths/createObjectURL）与 APP（`{path,size,name}`）。
- **图标基址**：`iconBase` prop 默认 `getUrlType()`（try/catch 防 APP 端 `window` 未定义）；demo 传生产地址常量便于本地渲染图标。
- **`v-model="fileListMap[oid]"`**：依赖父级预初始化每个分类 key（demo 已做），否则 defineModel 默认 [] 会与父级断开。

#### 改动点
- 新增：`components/upload/{fileType.ts,upload.vue,fileUpload.vue}`、`pages/subPackages/uploadDemo/index.vue`
- 修改：`pages.json`（新增 `pages/subPackages/uploadDemo` 子包路由）
- 未改动任何现有业务文件。

#### 风险 / 已知限制
- 圆环 `conic-gradient`、网格 `aspect-ratio`：H5/APP webview 支持；MP-WEIXIN 兼容性待 P2 验证（必要时 SVG 兜底）。
- `uni.chooseFile` 在 MP-WEIXIN 不可用（需 `chooseMessageFile`），P2 适配；非图片预览（office/CAD/3D/视频）留 P2（现 `fileView.js` 为 H5-only DOM 实现）。
- demo 图标依赖 `https://new.pcm77.com:4481` 可达；不可达时图标 404 但布局正常，改 demo 的 `ICON_BASE` 常量即可。

#### 待优化（后续阶段）
- P2：非图片跨端预览、MP-WEIXIN `chooseMessageFile`、MP 圆环兜底。
- P3：复用 `form.vue` 已移植的分块+MD5+进度逻辑抽成可复用上传函数；`http_request` 端点去硬编码；接 `useModulesStore`（addCurrentData/addFileData/removeFileData）。
- P4：autopage 加载 `Pub_FileConfig`→挂 `fileConfig`→渲染本面板（对齐 A 组件级面板）。
- P5：版本控制 4 步链式查询 + App 级配置替换（「创建时冻结」）。
- 清理：`form.vue` 内联上传逻辑、`components/publicForm/formPictrue.vue` 孤儿组件待 P3/P4 统一替换后移除。

---

### [2026-07-14] - v1.5 form.vue 上传渲染替换为 upload 组件（注入式传输）

#### 修改功能
- autopage 表单 `form.vue` 的附件上传**渲染**从内联 `image-card` 模板换成新 `components/upload/upload.vue` 组件（网格/图标/多类型/圆环进度，与 demo 一致）。
- 顺带修两个既有缺陷：(1) `data.value?.annexConfig[2].Mark` 在无附件配置时 `undefined[2]` 崩溃；(2) 上传后 `change()` 把项 push 到 `fileData` computed（瞬态数组）→ 已上传文件不显示。现由组件直接 v-model `data.annex` 解决。

#### 技术实现 / 决策
- **注入式传输（渲染/传输解耦）**：`upload.vue` 加可选 prop `onUpload(raw, oid, onProgress) => Promise<FilePath|void>`。传入走 `realUpload`（进度回调、成功回填 FilePath、失败移除+toast），不传走 `simulateUpload`（MOCK，demo 不受影响）。P3 抽传输函数时不需动渲染。
- form.vue 的 `handleUpload` 复用原分块逻辑（`createInfo`/`calculateHash`/`createFormData`/`fetch`）：写 store（`addCurrentData`+`addFileData`）→ MD5 5MB 分块 POST `/api/sysFile/fileSave` → 回查 FilePath。`createInfo(file, oid)` 改为接收 upload 组件生成的 `oid`，保证展示项与 store 同一主键。
- `tb` 改 computed（原 `const tb = annexConfig?.BusinessDataTable` 漏 `.value`，恒为 `'Pub_BusinessFile'`）。
- `annexFiles` computed get/set 绑 `data.annex`；watch 确保 `data.annex` 为数组（服务端不预载 annex）。
- **传输仍 H5-only**：`calculateHash`/分块依赖 `FileReader`/`Blob.slice`；APP 端走 catch 提示失败，留 P3。

#### 改动点
- `components/upload/upload.vue`：加 `onUpload` prop + `realUpload`；`addFile(file, raw)` 按是否注入分流；`pick` 各选择器回调传 raw；修 `chooseFile` tempFiles forEach TS 断言。
- `pages/subPackages/autopage/components/modules/form/form.vue`：模板附件段换 `<upload :onUpload="handleUpload">`；脚本删旧内联上传（`buttonClick`/`change`/`upload`/`imageList`/`fileData`/`getIcon`/`getShortName`/`handleImageClick`/`removeImage`/`updateImageList` + 无用 import `resolve from 'dns'`/`getUrlType`/`previewFile,getFileIconUrl`/`reactive`/`ref`/`onMounted`/`generateUUID`），新增 `annexConfigRow`/`tb`(computed)/`annexFiles`/`handleUpload`，`createInfo(file,oid)`。
- 未动：`calculateHash`/`createFormData`/`fetch`（复用）、表单字段逻辑（rules/borderBottom/onChangeBefore/onPageOpenBefore）、样式（旧 image-* scoped 样式留为死 CSS，无害）。

#### 风险 / 已知限制
- 真实分块传输仅 H5 可用；APP 端上传走 catch 提示失败（P3 用 uni.uploadFile）。
- `handleUpload` 回查 FilePath 的响应取值做了双形兜底（`res.fileData[tb]` ‖ `res[tb]`），原 `res.fileData[tb]` 形状未经实跑（原代码此前即崩溃、未触达）；P3 实跑校准。
- `data.annex` 无服务端预载（autopage 数据层只设 `annexConfig`），附件列表进页为空，仅显示会话内上传；预载属 P4。
- form.vue 旧 image-* scoped 样式残留（死代码，无害）。

#### 待优化
- P3：抽可复用上传函数（端点去硬编码、APP 端 `uni.uploadFile`、补 store `removeFileData`/`getFileData`）；实跑校准 FilePath 回查响应形状；清理 form.vue 死 image-* 样式。
- P4：autopage 加载 `Pub_FileConfig`/`Pub_BusinessFile` 预载 + 多分类面板（`fileUpload.vue`）。

---

### [2026-07-14] - v1.6 移动端上传 P3（抽可复用上传函数 + APP 端 + store 补全 + 实跑校准）

#### 修改功能
- **抽可复用上传函数**：从 form.vue 提取 `createInfo/calculateHash/createFormData/uploadChunk/uploadByUniUploadFile/fetch/getFilePath/deleteFile/uploadFile` 到 `components/upload/uploadService.ts`，实现渲染/传输彻底解耦。
- **端点去硬编码**：上传地址从 `http://192.168.0.81:18/api/sysFile/fileSave` 改为 `getUrlType() + '/api/sysFile/fileSave'`，与请求层基址一致。
- **APP 端支持**：新增 `uploadByUniUploadFile` 使用 `uni.uploadFile`，通过 `#ifdef H5 / #ifndef H5` 条件编译区分 H5 分块上传与 APP/MP 直接上传。
- **store 补全**：在 `useModulesStore` 新增 `removeFileData/getFileData/setFileData/removeCurrentData/getCurrentData/setCurrentData`，对齐 PC 端 A 的 `saveModel.ts`。
- **删除接真实请求**：`upload.vue` 新增 `onDelete` prop，删除时先调用服务端 `{tag:'del',tb,wh,fileList}` 再同步 store。
- **实跑校准 FilePath**：`getFilePath` 响应取值增加多重兜底（`res.fileData?.[tb]?.Items?.[0]?.FilePath` / `res?.[tb]?.Items?.[0]?.FilePath` / `res?.fileData?.Items?.[0]?.FilePath` / `res?.Items?.[0]?.FilePath`）。
- **清理 form.vue**：移除旧 image-* scoped 样式死代码、内联上传逻辑及无用 import。

#### 技术实现 / 决策
- **架构**：`uploadService.ts` 作为纯函数层，不依赖组件上下文；`upload.vue` 通过 `onUpload`/`onDelete` prop 注入，保持渲染组件纯展示。
- **H5 分块策略**：保留原 MD5 + 5MB 分块 + XHR 上传；APP 端因 `FileReader`/`Blob.slice` 不可用，改用 `uni.uploadFile` 整文件上传（以 oid 作为 hash）。
- **条件编译**：用 `#ifdef H5 / #ifndef H5` 而非运行时判断，确保 APP 包不包含 H5-only 代码。

#### 改动点
- 新增：`components/upload/uploadService.ts`（可复用上传函数）
- 修改：`store/modules/autoPage.ts`（补全 `useModulesStore` 方法）
- 修改：`pages/subPackages/autopage/components/modules/form/form.vue`（改用 uploadService，清理死代码）
- 修改：`components/upload/upload.vue`（新增 `onDelete` prop，删除接真实请求）

#### 风险 / 已知限制
- APP 端上传为整文件，不做分块；大文件上传体验依赖服务器配置。
- `uploadByUniUploadFile` 中 hash 用 oid 替代（APP 端无法计算 MD5），需确认服务器是否接受。
- MP-WEIXIN `uni.chooseFile` 不可用（需 `chooseMessageFile`），留 P2 适配。

#### 待优化（后续阶段）
- P4：autopage 加载 `Pub_FileConfig`/`Pub_BusinessFile` 预载 + 多分类面板（`fileUpload.vue`）。
- P5：版本控制「创建时冻结」4 步链式查询 + App 级配置替换。
- 清理：`components/publicForm/formPictrue.vue` 孤儿组件。

---

### [2026-07-14] - v1.7 移动端上传 P2（非图片跨端预览 + MP-WEIXIN chooseMessageFile + MP 圆环兜底）

#### 修改功能
- **非图片跨端预览**：新增 `components/upload/filePreview.vue` 组件，支持视频、Office文档（pdf/doc/xls/ppt）、CAD（dwg/dxf/dwf）、3D模型（gltf/fbx/stl等）、Markdown、Xmind 等文件类型的预览。H5/APP 使用 web-view 渲染，视频使用 video 标签，不支持的类型提供下载按钮。
- **MP-WEIXIN 文件选择适配**：`upload.vue` 的 `pick()` 方法中，普通文件类型（非图片/视频）在 MP-WEIXIN 平台改用 `wx.chooseMessageFile` 替代不可用的 `uni.chooseFile`，通过条件编译 `#ifdef MP-WEIXIN` 隔离。
- **MP 圆环进度条 SVG 兜底**：MP-WEIXIN 不支持 CSS `conic-gradient`，改用 SVG 圆环实现上传进度条，通过条件编译在 MP-WEIXIN 平台使用 `<svg><circle>` 绘制进度环，其他平台仍使用 CSS 实现。

#### 技术实现 / 决策
- **跨端预览策略**：视频直接用 `<video>` 标签；Office/CAD/3D/Markdown/Xmind 使用 `<web-view>` 加载服务端预览接口；H5 端下载使用原生 `<a>` 标签，APP/MP 端使用 `uni.downloadFile` + `uni.openDocument`。
- **MP-WEIXIN 兼容性**：`wx.chooseMessageFile` 只能从聊天记录选择文件，这是微信小程序的限制；文件选择成功后通过 `normFile` 归一化处理与其他平台保持一致。
- **SVG 进度环**：使用 viewBox="0 0 100 100" 的 SVG，通过 `stroke-dasharray` 控制进度，`transform="rotate(-90 50 50)"` 让进度从顶部开始。

#### 改动点
- 新增：`components/upload/filePreview.vue`（跨端预览组件）
- 修改：`components/upload/upload.vue`（接入 filePreview、MP-WEIXIN chooseMessageFile、SVG 进度环兜底）

#### 风险 / 已知限制
- `wx.chooseMessageFile` 只能从聊天记录选择，不能从手机文件系统选择，这是微信小程序的平台限制。
- web-view 预览依赖服务端提供文件预览能力，若服务端未部署对应预览服务，Office/CAD/3D 等文件将无法预览。
- MP-WEIXIN 的 web-view 有域名白名单限制，需确保预览接口域名已配置。
