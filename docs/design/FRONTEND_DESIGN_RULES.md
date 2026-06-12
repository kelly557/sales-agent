# Frontend Development Design Rules

本文档定义本项目后续前端页面、原型和交互界面的默认开发法则。除非产品目标或现有代码明确要求例外，所有新增页面都应遵守这些规则。

## 1. 技术框架选型

### 默认选型

- **React + TypeScript**：用于正式功能页面、状态复杂页面、组件化页面和后续可维护代码。
- **Vite**：作为默认构建工具，优先于重型脚手架。
- **Ant Design**：作为默认业务组件库，用于表单、表格、弹窗、菜单、通知、Tabs、布局、日期选择、上传等标准后台/工具型组件。
- **CSS Modules / 原生 CSS 变量**：小到中型页面优先使用，避免过早引入复杂样式运行时。
- **Tailwind CSS**：仅用于局部布局和原型加速；不得替代 Ant Design 的标准业务组件。
- **纯 HTML/CSS/JS**：用于一次性原型、静态展示页、交互演示页、slider 调参页。

### 选型判断

- 页面只用于视觉验证或概念展示：使用单文件 HTML。
- 页面需要真实业务状态、组件复用、路由或 API 交互：使用 React + TypeScript + Ant Design。
- 页面包含表单、表格、筛选器、弹窗、抽屉、步骤条、通知、上传、日期时间选择：优先使用 Ant Design 原生组件。
- 页面需要图表：优先使用 ECharts、Recharts 或现有项目已引入的图表库。
- 页面需要 3D：使用 Three.js，不手写底层 3D 渲染。
- 页面需要复杂拖拽、画布、白板、流程图：优先使用成熟库，不从零实现核心引擎。

### 禁止事项

- 不为单个简单页面引入大型框架或新依赖。
- 不在同一功能内混用多套 UI 框架。
- 不复制粘贴一整套组件库代码来解决局部样式问题。
- 不重新手写 Ant Design 已稳定提供的基础组件。
- 不大面积覆盖 Ant Design 内部 class；需要品牌化时优先使用 theme token、CSS 变量和外层组合组件。
- 不为短期原型引入复杂状态管理；需要全局状态时优先评估 React Context、Zustand 或项目既有方案。

## 2. UX/UI 规范

### 整体风格

- 风格基线参考 [DESIGN.md](./DESIGN.md)：克制、清晰、内容优先、少装饰。
- 页面首先服务任务效率，其次才是视觉表现。
- SaaS、工具台、管理界面应保持安静、密集但有秩序，避免营销式大 hero、过度卡片化和装饰性背景。
- 品牌页、产品页、展示页可以更具视觉表达，但首屏必须明确传达对象、产品或核心价值。

### 布局规范

- 结构优先使用清晰的区域：导航、主内容、侧栏、工具栏、状态区、详情区。
- 信息密集页面优先使用表格、列表、分栏、tabs、segmented controls，而不是大量孤立卡片。
- 不把卡片嵌套在卡片里。
- 页面 section 使用全宽区域或无边框布局；卡片只用于重复项、弹窗、独立工具或明确分组。
- 固定格式控件必须设置稳定尺寸，例如棋盘、网格、工具栏按钮、计数器、缩略图、参数面板。
- 所有文本必须在桌面和移动端都不溢出、不遮挡、不压住相邻内容。

### 组件规范

- **按钮**：明确命令使用文本按钮或 icon + text；工具类操作优先使用图标按钮。
- **图标**：Ant Design 组件内优先使用 `@ant-design/icons`；产品专属或 Ant 图标缺失时可补充 lucide-react，但同一区域必须保持一致。
- **表单**：优先使用 Ant Design `Form`、`Input`、`Select`、`Checkbox`、`Radio`、`Switch`、`Slider`、`InputNumber`。
- **数据展示**：优先使用 Ant Design `Table`、`List`、`Descriptions`、`Statistic`、`Tag`、`Badge`、`Tooltip`、`Popover`。
- **反馈**：优先使用 Ant Design `message`、`notification`、`Alert`、`Modal`、`Result`、`Spin`、`Skeleton`。
- **导航**：优先使用 Ant Design `Tabs`、`Menu`、`Breadcrumb`、`Pagination`、`Steps`。
- **模式选择**：使用 Ant Design `Tabs`、`Segmented` 或 `Radio.Group`。
- **数值调节**：使用 Ant Design `Slider`、`InputNumber` 或二者组合，并显示当前值。
- **颜色选择**：使用 swatch，不只使用文本色值；如项目已安装 Ant Design 颜色选择器则优先使用。
- **危险操作**：必须有明显状态区分，并避免与主操作视觉混淆。

### 文案规范

- 页面文案必须直接描述当前产品、对象、业务流程或用户正在处理的具体内容。
- 不使用和产品本身无关的泛化描述、抽象管理话术或空洞效率表达。
- 不使用无法落到具体界面行为的句子，例如“跟踪生成、审查、复用和交付检查任务，优先处理缺口和复核项。”
- 标题优先写清楚用户正在看的对象，例如“工程文档工作台”“设计变更审查”“交付物检查清单”。
- 按钮文案必须对应具体动作，例如“生成文档”“打开审查”“标记已复核”“导出交付包”。
- 空状态、错误状态、加载状态必须说明当前产品语境下发生了什么，以及用户下一步能做什么。
- Demo 数据中的标题、描述、标签、状态名也必须贴近真实产品场景，不使用通用占位句。
- 不在页面中使用 `Alert`、横幅、说明卡片或段落重复解释“本页面已接入某流程/模块”“会同步到某中心”“可用于验证某能力”等功能说明。流程约束必须落在表格字段、状态、操作按钮、审批节点、规则数据或空/错/加载状态中；只有真实错误、阻塞风险、用户必须处理的异常状态才允许使用 `Alert`。

### 视觉 token

- 颜色、字号、间距、圆角、阴影应抽象为 CSS 变量或设计 token。
- React 项目中 Ant Design 主题必须通过 `ConfigProvider` 和 theme token 管理。
- 字体、字号、字重、行高必须使用统一 typography token，禁止在页面 CSS 中随意写死 `font-size`、`font-weight`、`font-family`、`line-height`。
- 全局必须定义并复用字体 token，例如 `--font-family-ui`、`--font-size-sm`、`--font-size-md`、`--font-size-title`、`--font-weight-regular`、`--font-weight-semibold`、`--line-height-body`。
- 同一页面只能使用规范内的字号层级，新增字号必须先进入全局 token，再由 harness 放行。
- 字重只允许使用规范内 token，默认正文 `regular`，强调和标题 `semibold`；不允许出现 `650`、`700` 等局部临时字重。
- 默认圆角不超过 8px，除非项目现有设计系统或特定组件需要更大圆角。
- 不使用单一色相堆满整个页面；避免页面读起来像只有一种颜色。
- 不使用装饰性渐变球、模糊光斑、无意义背景形状。
- 阴影只用于真实层级、浮层或需要前后关系的对象，不作为默认装饰。
- 字号不要随 viewport 宽度线性缩放；使用明确断点。
- letter-spacing 默认为 `0`，只有在既有设计规范明确要求时才调整。

### 交互与状态

- 每个可点击元素必须有 hover、focus-visible、active、disabled 状态。
- 键盘可访问：按钮、链接、输入、tabs、菜单必须可通过键盘操作。
- 异步操作必须有 loading、success、error 或 empty 状态。
- 表单必须有错误提示和可恢复路径。
- 重要操作完成后，界面要给出明确反馈，不只依赖控制台。

### 响应式规范

- 至少覆盖移动端、平板/窄屏、桌面三个断点。
- 移动端优先保证任务可完成，不为了保持桌面布局而压缩文字和控件。
- 触控目标最小 44px x 44px。
- 工具栏在移动端可折叠，但核心操作不能消失。

## 3. 开发文件大小和函数大小限制

### 文件大小

- 单个 React 组件文件建议不超过 **300 行**。
- 单个页面文件建议不超过 **500 行**。
- 单个纯 HTML 原型建议不超过 **900 行**；超过后必须拆分 CSS/JS 或组件。
- 单个 CSS 文件建议不超过 **600 行**。
- 单个工具函数文件建议不超过 **400 行**。

### 函数大小

- 普通函数建议不超过 **40 行**。
- React 组件主体建议不超过 **160 行**。
- 事件处理函数建议不超过 **30 行**。
- 数据转换函数建议不超过 **50 行**。
- 超过限制时应优先拆分为：
  - 子组件
  - 自定义 hook
  - 工具函数
  - 配置对象
  - 常量 token

### 复杂度限制

- 单个函数最多保留 **3 层嵌套**。
- 单个组件最多负责 **一个主职责**。
- 不在 JSX 内写复杂业务表达式；复杂逻辑先命名。
- 不把样式、数据、状态机、渲染全部堆在一个函数里。
- 重复出现 3 次以上的 UI 结构必须提取组件或配置。

### 命名规范

- 组件使用 PascalCase。
- hooks 使用 `useXxx`。
- 事件处理使用 `handleXxx`。
- 布尔值使用 `is`、`has`、`can`、`should` 前缀。
- CSS 变量使用语义命名，例如 `--color-surface`、`--space-panel`，不要使用 `--blue1`、`--size2`。

## 4. Harness Engineering 工程严肃约束

Harness engineering 是本项目的前端工程护栏体系。任何页面、demo、原型或调参页都必须能被一组固定检查验证，而不是只依赖开发者主观判断。

### Harness 目标

- 把“能打开”“能交互”“能调参”“能复现”“不抢端口”“不污染版本”变成硬性验收条件。
- 所有新增页面必须有可运行入口、demo 数据、轻量交互、调参页和验证记录。
- 所有约束优先自动化；无法自动化的部分必须有明确人工检查清单。

### 必备产物

每个新增或显著修改的前端页面必须同时交付：

- 页面入口：真实页面或 demo 页面。
- Mock 数据：本地静态 demo 数据。
- 轻量交互：至少 3 类可操作交互。
- Tuner 页面：带 slider 的实时调参 HTML。
- 验证说明：记录访问地址、检查项、已知限制。

### Harness 检查项

每次交付前必须完成以下检查：

- **运行检查**：页面可在本地打开，无白屏、无阻塞报错。
- **端口检查**：本地服务使用 2288；若端口被占用，不抢占其他应用。
- **数据检查**：无后端、无网络时 demo 数据仍能完整展示。
- **交互检查**：搜索、筛选、排序、分页、详情、编辑、状态切换等至少 3 类可用。
- **状态检查**：正常、空、加载、错误、长文本、缺失字段、多状态数据都可预览。
- **视觉检查**：桌面和移动端无文本溢出、遮挡、布局错位。
- **调参检查**：tuner 页面所有 slider 都能实时改变预览，并能复制参数 JSON。
- **文案检查**：页面文案必须贴合产品本身，不出现泛化空话。
- **字体检查**：页面 CSS 的字体、字号、字重、行高必须引用统一 typography token。
- **版本检查**：`git status` 和 `git diff` 中没有无关文件、临时代码、真实密钥或构建产物。

### 自动化优先级

项目具备条件时，应逐步加入以下脚本：

- `npm run dev`：绑定 2288 端口启动本地开发服务。
- `npm run lint`：检查 TypeScript、React、样式和基础质量问题。
- `npm run typecheck`：执行 TypeScript 类型检查。
- `npm run build`：确认生产构建可通过。
- `npm run harness`：执行项目定义的综合检查。
- `npm run preview`：在 2288 端口预览构建产物。

如果当前项目还没有这些脚本，交付说明必须写明“未配置”而不是假设已经验证。

### Harness 失败处理

- 任一必备检查失败，不得标记为完成。
- 如果失败项受外部条件限制，必须在交付说明中明确写出失败原因、影响范围和后续处理方式。
- 不允许用“暂时没问题”“应该可以”替代验证结论。
- 不允许为了通过检查删除功能、隐藏错误或移除必要状态。

### 严肃约束

- 不交付无法运行的页面。
- 不交付没有 demo 数据的空页面。
- 不交付只有静态截图感、无法轻量交互的 demo。
- 不交付没有 tuner 的新增页面。
- 不交付和产品语境无关的泛化文案。
- 不交付字体、字号、字重、行高不统一的页面。
- 不提交污染版本库的临时文件、构建产物、密钥或个人系统文件。
- 不绕过 2288 端口规范。

## 5. Demo 数据和轻量交互约束

### Demo 数据要求

- Demo 页面必须自带本地 mock 数据，打开即可看到接近真实业务的内容。
- Mock 数据应放在独立文件中，例如 `mock-data.ts`、`demo-data.ts`，纯 HTML 原型可在脚本区使用 `const demoData = [...]`。
- 数据字段必须贴近真实业务模型，不使用 `test1`、`foo`、`lorem` 这类无意义内容。
- 表格类 demo 至少提供 **12-30 条**数据，用于验证分页、筛选、排序和滚动。
- 卡片、列表、看板类 demo 至少提供 **8-16 条**数据，用于验证不同长度、状态和布局换行。
- 图表、统计类 demo 必须包含趋势、异常值、空值和边界值。
- Demo 数据必须覆盖正常、空状态、加载状态、错误状态、长文本、不完整数据、多状态数据。
- 所有 mock 数据默认使用静态本地数据，除非用户明确要求接入 API。
- 不得在 demo 中请求不稳定公网接口。

### 轻量交互要求

Demo 页面不只做静态展示，必须支持轻量交互，让用户可以验证页面状态和组件行为。

至少实现以下交互中的 **3 类**：

- 搜索：输入关键词后实时过滤列表、表格或卡片。
- 筛选：按状态、类型、标签、时间范围等字段过滤数据。
- 排序：按时间、名称、状态、金额、优先级等字段排序。
- 分页：表格或列表超过一屏时支持分页或加载更多。
- 选择：支持单选、多选、批量选择或当前项高亮。
- 查看详情：点击条目后打开 Modal、Drawer 或详情面板。
- 编辑演示：允许修改局部字段，并立即反映到 UI。
- 状态切换：支持切换 pending、processing、success、failed、archived 等状态。
- 新增/删除演示：允许在本地临时新增或删除一条 demo 数据。
- 视图切换：支持列表 / 卡片 / 看板 / 图表等视图切换。

### 轻量交互边界

- 交互只需要在浏览器本地生效，不要求持久化到后端。
- 可以使用 React state、URL query、本地变量或 `localStorage` 保存临时状态。
- 新增、编辑、删除必须清楚标识为 demo 行为，不能伪装成真实提交。
- 删除类交互必须有确认或可撤销反馈。
- 加载和错误状态可通过本地开关、按钮或模拟延迟触发。
- 交互逻辑必须保持可读，不能为了 demo 堆砌复杂状态机。
- 纯 HTML demo 的交互 JS 建议不超过 **250 行**；超过应拆分文件或改用 React。
- React demo 中，mock 数据、过滤排序逻辑、组件渲染应拆分，避免全部堆在页面组件里。

### Demo 验收标准

- 无后端、无网络时页面仍能完整运行。
- 首屏有真实感数据，不出现空白骨架页。
- 搜索、筛选、排序、分页、详情等交互至少 3 类可用。
- 空状态、加载状态、错误状态可以被用户触发或清楚预览。
- 长文本、缺失字段、异常状态不会撑破布局。
- 交互后 UI 状态立即更新，并有清楚反馈。

## 6. 版本控制规范

### 分支规范

- 所有功能开发必须在独立分支完成，不直接在主分支开发。
- 分支命名使用语义前缀：
  - `feature/xxx`：新增功能或页面。
  - `fix/xxx`：问题修复。
  - `refactor/xxx`：不改变行为的重构。
  - `docs/xxx`：文档更新。
  - `prototype/xxx`：原型或 demo 页面。
- 分支名称使用小写英文、数字和短横线，例如 `feature/document-dashboard`。

### 提交规范

- 提交信息使用清晰的动作描述，建议采用 Conventional Commits：
  - `feat: add document dashboard demo`
  - `fix: correct table filter state`
  - `docs: add frontend design rules`
  - `refactor: split tuner controls`
- 一个提交只做一类变更，避免把功能、重构、格式化、文档混在一起。
- 提交前必须检查变更范围，只提交与当前任务相关的文件。
- 不提交 `.DS_Store`、临时截图、构建产物、日志文件、依赖缓存。

### 页面与 Demo 的版本要求

- 新增页面时，页面文件、mock 数据、轻量交互代码、slider 调参 HTML 必须一起纳入同一功能分支。
- 修改页面视觉参数时，必须同步更新对应 tuner 页面或参数默认值。
- 修改 demo 数据结构时，必须同步检查搜索、筛选、排序、详情、状态切换等轻量交互是否仍然可用。
- 删除页面时，必须同步删除对应 demo 数据、调参页和无用资源。

### 变更检查

- 提交前至少执行：
  - 查看 `git status`，确认没有无关文件。
  - 查看 `git diff`，确认没有误改、调试代码或临时内容。
  - 能运行测试或构建时，执行项目已有的测试、lint 或 build 命令。
- 前端页面变更必须打开页面做一次人工检查。
- 涉及响应式布局时，至少检查移动端和桌面端两个宽度。
- 涉及 slider 调参页时，必须确认所有 slider 都能实时改变预览。

### 禁止事项

- 不使用 `git reset --hard`、强制 checkout、强制删除分支等破坏性操作，除非明确确认。
- 不覆盖他人或用户已有的未提交改动。
- 不把无关格式化混入功能提交。
- 不提交真实密钥、token、账号、客户数据或隐私数据。
- 不把 demo mock 数据伪装成真实生产数据。

## 7. 本地开发服务端口规范

### 默认端口

- 本项目本地前端开发服务默认使用 **2288** 端口。
- Vite、React dev server、静态预览服务都应优先配置为 `http://localhost:2288`。
- 文档、README、交付说明中的访问地址统一写为 `http://localhost:2288`。

### 端口使用规则

- 启动服务前必须检查 2288 是否已被占用。
- 如果 2288 已被本项目当前服务占用，可以复用。
- 如果 2288 被其他应用占用，不得强行杀进程或抢占端口，除非明确确认。
- 临时改用其他端口时，必须在交付说明中明确写出实际端口。
- 不使用 Vite 自动递增端口作为默认行为；应显式指定端口，避免无感切到 2289、2290 等端口。

### 推荐配置

Vite 项目应在 `vite.config.ts` 中显式配置：

```ts
export default defineConfig({
  server: {
    port: 2288,
    strictPort: true
  },
  preview: {
    port: 2288,
    strictPort: true
  }
});
```

纯静态 HTML 需要本地服务时，优先使用：

```bash
npx serve . -l 2288
```

或使用项目已有脚本，但必须绑定 2288。

## 8. 每个页面必须生成可交互 slider 调参 HTML

### 交付要求

每次生成或显著修改一个前端页面时，必须同时提供一个可交互 HTML 调参页面，用于实时预览和微调视觉参数。

命名建议：

- 原页面：`feature-name.html`
- 调参页：`feature-name-tuner.html`

React 项目中可放在：

- `public/tuners/feature-name-tuner.html`
- 或项目约定的 preview/tuner 目录

### 调参页必须包含

- 页面实时预览区域。
- 右侧或底部控制面板。
- 至少 6 个 slider 参数。
- 每个 slider 显示参数名、当前值、单位。
- 拖动 slider 时必须实时更新预览，不需要刷新页面。
- 支持一键复制当前参数 JSON。
- 支持恢复默认值。
- 参数通过 CSS 变量或 JS state 驱动，不能只是假控件。

### 默认可调参数

每个调参页至少包含以下参数中的 6 个：

- 页面最大宽度 `--page-max-width`
- 区块垂直间距 `--section-padding`
- 栅格间距 `--grid-gap`
- 卡片内边距 `--card-padding`
- 圆角 `--radius`
- 标题字号 `--heading-size`
- 正文字号 `--body-size`
- 行高 `--line-height`
- 阴影强度 `--shadow-strength`
- 边框透明度 `--border-alpha`
- 背景明度或色相
- 图片尺寸或预览缩放

### 调参页结构模板

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Feature Tuner</title>
    <style>
      :root {
        --page-max-width: 1120px;
        --section-padding: 64px;
        --grid-gap: 24px;
        --card-padding: 24px;
        --radius: 8px;
        --heading-size: 40px;
        --body-size: 16px;
        --line-height: 1.55;
        --shadow-strength: 0.12;
      }

      body {
        margin: 0;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #f5f5f7;
        color: #1d1d1f;
      }

      .workspace {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 320px;
        min-height: 100vh;
      }

      .preview {
        padding: 32px;
        overflow: auto;
      }

      .page {
        max-width: var(--page-max-width);
        margin: 0 auto;
        padding: var(--section-padding);
        background: #ffffff;
        border-radius: var(--radius);
        box-shadow: 0 24px 80px rgba(0, 0, 0, var(--shadow-strength));
      }

      .page h1 {
        margin: 0 0 16px;
        font-size: var(--heading-size);
        line-height: 1.1;
      }

      .page p {
        font-size: var(--body-size);
        line-height: var(--line-height);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--grid-gap);
        margin-top: 32px;
      }

      .card {
        padding: var(--card-padding);
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: var(--radius);
      }

      .controls {
        border-left: 1px solid rgba(0, 0, 0, 0.1);
        background: #ffffff;
        padding: 20px;
        overflow: auto;
      }

      .control {
        display: grid;
        gap: 8px;
        margin-bottom: 18px;
      }

      .control label {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 13px;
      }

      button {
        min-height: 40px;
        border: 0;
        border-radius: 8px;
        background: #0066cc;
        color: #ffffff;
        cursor: pointer;
      }

      pre {
        white-space: pre-wrap;
        word-break: break-word;
        padding: 12px;
        background: #f5f5f7;
        border-radius: 8px;
        font-size: 12px;
      }

      @media (max-width: 860px) {
        .workspace {
          grid-template-columns: 1fr;
        }

        .controls {
          border-left: 0;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main class="workspace">
      <section class="preview" aria-label="页面实时预览">
        <div class="page">
          <h1>页面标题</h1>
          <p>这里放入真实页面的核心布局预览。拖动右侧滑杆时，预览区域必须实时响应。</p>
          <div class="grid">
            <article class="card">模块 A</article>
            <article class="card">模块 B</article>
            <article class="card">模块 C</article>
          </div>
        </div>
      </section>

      <aside class="controls" aria-label="视觉参数调节">
        <h2>参数微调</h2>
        <div id="controls"></div>
        <button id="copy" type="button">复制参数 JSON</button>
        <button id="reset" type="button">恢复默认</button>
        <pre id="output"></pre>
      </aside>
    </main>

    <script>
      const params = [
        { key: "--page-max-width", label: "页面最大宽度", value: 1120, min: 720, max: 1440, unit: "px" },
        { key: "--section-padding", label: "区块垂直间距", value: 64, min: 24, max: 120, unit: "px" },
        { key: "--grid-gap", label: "栅格间距", value: 24, min: 8, max: 56, unit: "px" },
        { key: "--card-padding", label: "卡片内边距", value: 24, min: 12, max: 48, unit: "px" },
        { key: "--radius", label: "圆角", value: 8, min: 0, max: 28, unit: "px" },
        { key: "--heading-size", label: "标题字号", value: 40, min: 24, max: 72, unit: "px" },
        { key: "--body-size", label: "正文字号", value: 16, min: 13, max: 22, unit: "px" },
        { key: "--line-height", label: "行高", value: 1.55, min: 1.1, max: 2, step: 0.01, unit: "" },
        { key: "--shadow-strength", label: "阴影强度", value: 0.12, min: 0, max: 0.35, step: 0.01, unit: "" }
      ];

      const defaults = structuredClone(params);
      const controls = document.querySelector("#controls");
      const output = document.querySelector("#output");

      function applyParam(param) {
        document.documentElement.style.setProperty(param.key, `${param.value}${param.unit}`);
      }

      function renderOutput() {
        const values = Object.fromEntries(params.map((param) => [param.key, `${param.value}${param.unit}`]));
        output.textContent = JSON.stringify(values, null, 2);
      }

      function renderControls() {
        controls.innerHTML = "";
        params.forEach((param, index) => {
          const row = document.createElement("div");
          row.className = "control";
          row.innerHTML = `
            <label>
              <span>${param.label}</span>
              <strong data-value>${param.value}${param.unit}</strong>
            </label>
            <input
              type="range"
              min="${param.min}"
              max="${param.max}"
              step="${param.step || 1}"
              value="${param.value}"
              aria-label="${param.label}"
            />
          `;

          const input = row.querySelector("input");
          const value = row.querySelector("[data-value]");
          input.addEventListener("input", (event) => {
            params[index].value = Number(event.target.value);
            value.textContent = `${params[index].value}${params[index].unit}`;
            applyParam(params[index]);
            renderOutput();
          });

          controls.appendChild(row);
          applyParam(param);
        });
        renderOutput();
      }

      document.querySelector("#copy").addEventListener("click", async () => {
        await navigator.clipboard.writeText(output.textContent);
      });

      document.querySelector("#reset").addEventListener("click", () => {
        defaults.forEach((item, index) => {
          params[index] = { ...item };
        });
        renderControls();
      });

      renderControls();
    </script>
  </body>
</html>
```

### 验收标准

- 打开调参页后，无需构建即可运行。
- 拖动每个 slider，预览区必须立即变化。
- 参数 JSON 与当前预览一致。
- 移动端下控制面板不能遮挡预览内容。
- 调参页中的预览必须接近真实页面结构，不能只放一个空白方块。
