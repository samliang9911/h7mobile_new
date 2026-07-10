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
- 对齐选人事件契约：新 `publicChoicePerson.vue`（`acceptDataFromChild`/`acceptDataFromOpener`）vs 调用方（`ChoicePerson`/`echoChoicePerson`）。
- 清理死代码：`view/render.vue`、`view/layout.vue`、`view/tabs.vue`、`api/autopage/index.ts` 大段注释、`store/modules/autoPage.ts` 注释掉的 `init()`。
- 修正 store 命名/引用：`useGlobalStoreHook`（global.ts:271）引用未定义的 `store`；store id `'moudles'` 拼写错误。
- 去硬编码：`buttonEvent.ts` 表名/UUID、`list/index.vue` 的 `BillType`/`Remarks`、`cleansData.ts` 中文标题分支、`api.js:189` 上传地址、QQ 地图 key。

#### 风险
- 多处 `eval` / `new Function` 执行服务端下发的 JS（format.ts、hook.ts、DataPool.js、buttonEvent.ts、utils/index.ts）——配置即代码，属设计内但属高危面。
- RSA 公钥存储为打乱字符串（api.js:341）、签名用全角＆——重构易破坏登录。
- `window.location.origin` 在 APP/MP 端 undefined（instrumentType.js）。
