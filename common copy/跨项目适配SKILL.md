---
name: cross-project-adapt
description: 把 PC 端项目 A(creatpage)的业务逻辑适配到移动端项目 B(h7mobile_new)。A=业务真相源，B=移动端落点，后端同源，走"对齐补全"策略。任何适配任务开始前先读此 Skill + STATE.md。
---

# 跨项目 PC→移动端业务适配（A creatpage → B h7mobile_new）

## 1. 两项目定位（必读）

| | 项目 A（源） | 项目 B（标） |
|---|---|---|
| 路径 | `d:\uni_app\creatpage` | `d:\uni_app\h7mobile_new` |
| 端 | PC Web | 移动端（H5 / APP-PLUS / mp-weixin） |
| 栈 | Vue3 + Vite + Pinia + TS | uni-app + Vue3 `<script setup>` + uview-plus + Pinia |
| UI | ant-design-vue / element-plus / vxe-table / gzhr-ui | up- / uni- / 原生 + hr-table |
| 构建 | Vite 多入口 | HBuilderX（**无 CLI 构建**，靠 IDE 运行） |

**后端同源**——两端打同一套 API：`/api/pubData/synthesis`（JSON 查询信封 `{json:[{tag:sel/add/upd/del, tb, field, jo, wh:{Filter,Param}, ChildAlias}]}`）、`/api/flowGet/approvalData`、`/api/flowAction/approvalHandle`；同一鉴权头 `Authorization`/`X-Authorization: Bearer` + `sign`。**A 的 API 契约可直接映射到 B。**

**A 的三个子应用**：`src/`（基础页面引擎，Card 配置驱动）、`processFlow/`（流程页，独立 SPA）、`other/`（代码/事件编辑器，非运行时页面）。
**B 的对应**：`pages/subPackages/autopage/`（基础引擎）、`pages/subPackages/expense/` + `pages/subPackages/form/processFlow/index.vue`（流程）、（编辑器无对应）。

## 2. 核心原则（红线）

- **A 是业务真相源**：业务逻辑（取数、校验、提交、流程动作、字段语义）永远以 A 行为为准；B 只换"呈现壳"。
- **用 B 的请求层**：B 的 `api/api.js` `http_request` 是真实现且多端可用；A 的 `P_Ajax`/`getSign`/`getEncrypt` 是**后端注入的全局 JS**（仓库里只有 d.ts 声明）——**禁止移植 A 的传输层**。
- **策略 = 对齐补全**（非重写）：B 已有对应骨架（autopage / expense / publicChoicePerson），保留骨架，补缺口、修契约 bug。改动小、风险低。
- **只动呈现层**：PC 宽表→移动窄列、鼠标→手势/ActionSheet/抽屉、分页→上拉加载、弹窗→`up-popup`、iframe→`uni.navigateTo`。**禁止**照搬 A 的 PC 组件与代码结构。
- **业务等价性必须自检**：适配后逐条比对 A 的业务不变量。

## 3. A→B 映射表

| 维度 | A（creatpage） | B（h7mobile_new） |
|---|---|---|
| 基础页面引擎 | `src/views/Card/` + `src/hooks/useConfig.js` + `mixins/` | `pages/subPackages/autopage/`（components/control + `cleansData.ts`） |
| 请求层 | `P_Ajax`（后端全局）/ `other/utils/axios-utils.ts` | `api/api.js` `http_request`（用这个） |
| 配置查询 | `window.queryConfig()`（后端注入） | `api/autopage/index.ts` 自实现 synthesis 查询 |
| 增删改 diff | `src/store/modules/saveModel.ts`（origin vs current） | `api/autopage/cleansData.ts` 的 `model`/`watchModel`/`diffArrays` |
| 流程页 | `processFlow/`（纯"流程壳"，**不渲染业务表单**） | `pages/subPackages/expense/`（表单+流程揉在一起，**需分清边界**） |
| 选人页 | `public/utils.js openChoosePeople` → `L_SelOrgPerson.html`（后端页） | `pages/subPackages/publicform/publicChoicePerson.vue` |
| 回填契约 | `{data:[...实体], mergeData:{字段:[值数组]}}` | 已对齐（见 §5/STATE.md） |
| 鉴权/登录态 | cookie `access-token` + localStorage | `uni.setStorageSync` |

## 4. 横切坑点（适配时必避）

- **成功码**：A 用**数字** `code===1000`，B 用**字符串** `code==='1000'`；同源后端返 int32——**复用 A 逻辑时必须用 B 的字符串约定**，否则静默失败。
- **eval / new Function**：A、B 都执行服务端下发 JS（`cfg.render`/`FieldFunc`/`buttonEvent`/`Sys_DynamicCode.JSCode`）；**小程序端不支持 `new Function`**，适配需注意平台。
- **window / document**：A 是 PC Web 可用；B 在 APP/MP 端 `window` undefined，共享逻辑必须 `#ifdef H5` 条件编译。
- **签名**：`sign` = RSA(`AccessToken+'＆'+timestamp`，**全角＆ U+FF06**)，重构易破坏登录。
- **选人契约**：B 已统一到 `{data,mergeData}` + 双发兼容旧 `ChoicePerson`（详见 STATE.md「选人页」）。
- **响应归一化**：A 的 axios 链会把 key 首字母小写 + `*OID→id`（`toLowerCaseKeysFirstChar`），B 不做——字段映射时注意。

## 5. 适配工作流（每个功能都走这 7 步）

1. **扫描 A**：按 `common copy/scan.md` 6 段式深度扫 A 对应子系统（用并行 subagent，**给每个注入 B 的对应实现作对比锚点**，产出直接服务于适配）。
2. **探查 B 现状**：读 B 对应文件，搞清当前契约/缺口/bug（用 Explore subagent）。
3. **建 A→B 映射**：列「A 模块 ↔ B 文件 ↔ 业务不变量 ↔ 缺口 ↔ 动作」表。
4. **定策略**：默认「对齐补全」；重大分叉用 `AskUserQuestion` 让用户拍板（整体策略 + 起步页）。
5. **计划**：`EnterPlanMode` → Explore（探查现状）→ Plan（设计实现）→ 读关键文件验证 → 写 plan 文件 → `ExitPlanMode` 审批。
6. **实现**：按 plan 改；**编辑前用 `cat -A` 核实目标文件 tab/space 缩进**（本项目混用：publicChoicePerson 用 tab、choosePage 用 2-space、audit 用 tab）；同文件多编辑注意锚点唯一。
7. **维护文档**（read-claude-md 协议，写到 `common copy/`）：变更**追加** `DEVELOPMENT.md`，现状**修订** `STATE.md`，被推翻的旧条目加 `⚠️ [已被 YYYY-MM-DD 变更取代]`（不删原文）。

## 6. 当前进度（详见 DEVELOPMENT.md / STATE.md）

- ✅ **选择页**（v1.3, 2026-07-11）：`publicChoicePerson` 回传对齐 A 的 `{data,mergeData}` + 双发兼容；`choosePage` 控件修断链（`ChoicePerson`→`acceptDataFromChild`）+ 补 echo；`audit.vue` 一行适配。
- ⏭ **流程页**（下一步）：B 的 `expense` + `form/processFlow/index.vue` 对齐 A 的 `processFlow/`——补 **Start 模式**（`flowID` 入参 + `WF_STARFLOW`）、**12 类 `WF_*` 动作**及 payload、**Supplement**（主题/督办/知会/超期）、**StartList** 启动岗位；**分清"流程壳 vs 业务表单"边界**（A 流程页不渲染表单，B 揉在一起）。同步把 `form/processFlow/index.vue` 选人入口从兼容层迁到新契约。
- 🔜 **旧选人调用方迁移**：`popupWindows.vue` / `form/processFlow/index.vue` 及拷贝迁到 `{data,mergeData}` 后删除 `ChoicePerson`/`echoChoicePerson` 双发层。
- 🔜 **死代码核实**：`autopage/control/modules/chooseFrame.vue`、`pages/choicePerson/choicePerson.vue`、`oldPopupWindows.vue`、`popupWindows copy.vue`（查 `pages.json` 路由注册后决定是否删）。
- 🔜 **基础页面**：A 的 `src/views/Card` 引擎 → B 的 autopage，对照 `useConfig.js` 列模型/字段类型映射。

## 7. 关键文件速查

- **A 流程**：`creatpage\processFlow\{App.vue, api/index.js, store/modules/model.js, views/processFlow/index.vue}`
- **A 选择/引擎**：`creatpage\public\utils.js`（openChoosePeople/frameCallBack）、`src\hooks\{useChoose,useConfig,useBusiness,useDataApi}.js`、`src\views\Card\mixins\componentMixin.ts`、`src\store\modules\{global,saveModel}.ts`
- **A 请求**：`creatpage\other\utils\axios-utils.ts`、`types\const.ts`
- **B 流程**：`h7mobile_new\pages\subPackages\expense\` + `api\expense\{index,hook,format}.ts`
- **B 选人**：`pages\subPackages\publicform\publicChoicePerson.vue`、`pages\subPackages\autopage\control\modules\choosePage.vue`
- **B 请求/引擎**：`api\api.js`、`pages\subPackages\autopage\`、`api\autopage\cleansData.ts`
- **文档**：`common copy\{STATE.md, DEVELOPMENT.md, scan.md, SKILL.md, 跨项目适配SKILL.md}`
