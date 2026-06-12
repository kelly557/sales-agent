export type RuleStatus = "active" | "reviewing" | "draft";

export type RuleScene =
  | "commercial-exterior"
  | "hospital-interior"
  | "industrial-floor"
  | "office-refresh";

export const ruleSceneLabels: Record<RuleScene, string> = {
  "commercial-exterior": "商业楼涂料换新",
  "hospital-interior": "医院内墙净味",
  "industrial-floor": "工业地坪改造",
  "office-refresh": "办公空间刷新",
};

export type RuleKind = "form" | "audit";

export const ruleKindLabels: Record<RuleKind, string> = {
  form: "表单规则",
  audit: "审核规则",
};

export type RuleFormFieldKey =
  | "projectName"
  | "customer"
  | "location"
  | "scenario"
  | "buildingArea"
  | "coatingArea"
  | "storeyCount"
  | "existingCoating"
  | "baseCondition"
  | "demand"
  | "coatingSystem"
  | "colorScheme"
  | "constructionWindow"
  | "vocStandard"
  | "budget";

export interface RuleFormField {
  key: RuleFormFieldKey;
  label: string;
  type: "text" | "select";
  required: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface AuditCheckItem {
  id: string;
  name: string;
  description: string;
  severity: "high" | "medium" | "low";
  enabled: boolean;
}

export interface AuditRuleConfig {
  triggerStage: string;
  reviewers: string[];
  checks: AuditCheckItem[];
  autoPassWhenClean: boolean;
}

interface RuleBase {
  id: string;
  name: string;
  scene: RuleScene;
  status: RuleStatus;
  owner: string;
  updatedAt: string;
  summary: string;
  linkedProjectCount: number;
}

export interface FormBusinessRule extends RuleBase {
  kind: "form";
  config: {
    fields: RuleFormField[];
    values: Partial<Record<string, string>>;
  };
}

export interface AuditBusinessRule extends RuleBase {
  kind: "audit";
  config: AuditRuleConfig;
}

export type BusinessRule = FormBusinessRule | AuditBusinessRule;

export const ruleStatusLabels: Record<RuleStatus, string> = {
  active: "已启用",
  reviewing: "复核中",
  draft: "草稿",
};

export const auditSeverityLabels: Record<AuditCheckItem["severity"], string> = {
  high: "高",
  medium: "中",
  low: "低",
};

export const commercialPaintRenewalFields: RuleFormField[] = [
  { key: "projectName", label: "项目名称", type: "text", required: true, fullWidth: true },
  { key: "customer", label: "客户名称", type: "text", required: true },
  { key: "location", label: "项目位置", type: "text", required: true },
  {
    key: "scenario",
    label: "项目场景",
    type: "select",
    required: true,
    options: [
      { value: "商业综合体外墙翻新", label: "商业综合体外墙翻新" },
      { value: "写字楼外立面翻新", label: "写字楼外立面翻新" },
      { value: "商场公共区域翻新", label: "商场公共区域翻新" },
      { value: "酒店外立面翻新", label: "酒店外立面翻新" },
    ],
  },
  { key: "buildingArea", label: "建筑面积", type: "text", required: false, placeholder: "如 32,800 m²" },
  { key: "coatingArea", label: "涂装面积", type: "text", required: true, placeholder: "如 18,600 m²" },
  {
    key: "storeyCount",
    label: "楼层",
    type: "select",
    required: true,
    options: [
      { value: "5 层以下", label: "5 层以下" },
      { value: "5-15 层", label: "5-15 层" },
      { value: "15-30 层", label: "15-30 层" },
      { value: "30 层以上", label: "30 层以上" },
    ],
  },
  {
    key: "existingCoating",
    label: "现有涂层情况",
    type: "select",
    required: true,
    options: [
      { value: "完好,无需处理", label: "完好,无需处理" },
      { value: "轻微粉化", label: "轻微粉化" },
      { value: "局部开裂、脱落", label: "局部开裂、脱落" },
      { value: "大面积粉化、需铲除", label: "大面积粉化、需铲除" },
    ],
  },
  { key: "baseCondition", label: "基层情况", type: "text", required: true, fullWidth: true },
  { key: "demand", label: "客户诉求与交付目标", type: "text", required: true, fullWidth: true },
  { key: "coatingSystem", label: "推荐体系", type: "text", required: false, fullWidth: true },
  {
    key: "colorScheme",
    label: "色彩方案",
    type: "select",
    required: false,
    options: [
      { value: "沿用现有色卡", label: "沿用现有色卡" },
      { value: "重新设计主辅色", label: "重新设计主辅色" },
      { value: "需业主确认色卡", label: "需业主确认色卡" },
    ],
  },
  {
    key: "constructionWindow",
    label: "施工窗口",
    type: "select",
    required: false,
    options: [
      { value: "白天连续施工", label: "白天连续施工" },
      { value: "夜间施工", label: "夜间施工" },
      { value: "分段错峰施工", label: "分段错峰施工" },
    ],
  },
  {
    key: "vocStandard",
    label: "环保等级",
    type: "select",
    required: false,
    options: [
      { value: "GB 18582 国标", label: "GB 18582 国标" },
      { value: "GB/T 18883 优级", label: "GB/T 18883 优级" },
      { value: "法国 A+", label: "法国 A+" },
      { value: "德国 TÜV", label: "德国 TÜV" },
    ],
  },
  { key: "budget", label: "预算区间", type: "text", required: false, placeholder: "如 280-320 万元" },
];

export const commercialPaintRenewalDefaults: Partial<Record<string, string>> = {
  projectName: "上海富居商业楼翻新",
  customer: "上海富居资产管理有限公司",
  location: "上海市黄浦区",
  scenario: "商业综合体外墙翻新",
  buildingArea: "32,800 m²",
  coatingArea: "18,600 m²",
  storeyCount: "5-15 层",
  existingCoating: "局部开裂、脱落",
  baseCondition: "旧涂层局部粉化、开裂,混凝土基层为主,局部保温层需复核粘结强度。",
  demand: "耐候、抗污、低气味,需形成可向业主汇报的技术方案 PPT,夜间施工窗口避免影响营业。",
  coatingSystem: "抗碱封闭底漆 + 高耐候外墙面漆,两遍面涂。",
  colorScheme: "重新设计主辅色",
  constructionWindow: "夜间施工",
  vocStandard: "GB/T 18883 优级",
  budget: "280-320 万元",
};

export function buildFieldKey(label: string, taken: Set<string>): string {
  const base = label
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, "")
    .slice(0, 32) || "field";
  let candidate = base;
  let suffix = 1;
  while (taken.has(candidate)) {
    suffix += 1;
    candidate = `${base}_${suffix}`;
  }
  return candidate;
}

export function createEmptyField(taken: Set<string>): RuleFormField {
  const key = buildFieldKey(`字段${taken.size + 1}`, taken);
  return {
    key,
    label: `字段${taken.size + 1}`,
    type: "text",
    required: false,
    placeholder: "",
  };
}

export const auditTriggerStageOptions: Array<{ value: string; label: string }> = [
  { value: "提交需求表单后", label: "提交需求表单后" },
  { value: "方案 PPT 初稿生成后", label: "方案 PPT 初稿生成后" },
  { value: "施工作业指导书生成后", label: "施工作业指导书生成后" },
  { value: "材料用量估算完成后", label: "材料用量估算完成后" },
];

export const defaultCommercialAuditChecks: AuditCheckItem[] = [
  {
    id: "check-coating-system",
    name: "涂装体系合规性",
    description: "核查推荐体系是否包含底漆与两遍面漆,推荐品牌是否在白名单内。",
    severity: "high",
    enabled: true,
  },
  {
    id: "check-voc",
    name: "环保等级匹配",
    description: "VOC 等级需与项目场景要求一致,医院类项目最低 GB/T 18883 优级。",
    severity: "high",
    enabled: true,
  },
  {
    id: "check-construction-window",
    name: "施工窗口冲突",
    description: "夜间施工项目需附夜间施工组织方案与噪声控制说明。",
    severity: "medium",
    enabled: true,
  },
  {
    id: "check-budget",
    name: "预算区间合理性",
    description: "预算与涂装面积偏差超过 30% 时提示复核。",
    severity: "low",
    enabled: false,
  },
];

export const businessRules: BusinessRule[] = [
  {
    id: "RULE-2001",
    name: "商业楼涂料换新需求表单规则",
    kind: "form",
    scene: "commercial-exterior",
    status: "active",
    owner: "苏砚",
    updatedAt: "2026-06-08",
    summary: "面向商业综合体外墙翻新场景的需求表单模板,覆盖涂装面积、基层情况、施工窗口与交付目标。",
    linkedProjectCount: 3,
    config: {
      fields: commercialPaintRenewalFields,
      values: commercialPaintRenewalDefaults,
    },
  },
  {
    id: "RULE-2002",
    name: "医院内墙净味体系需求表单规则",
    kind: "form",
    scene: "hospital-interior",
    status: "reviewing",
    owner: "陈知行",
    updatedAt: "2026-05-26",
    summary: "围绕医院内墙净味体系、施工窗口和验收标准的参数模板。",
    linkedProjectCount: 2,
    config: {
      fields: commercialPaintRenewalFields,
      values: {},
    },
  },
  {
    id: "RULE-2003",
    name: "工业地坪改造需求表单规则",
    kind: "form",
    scene: "industrial-floor",
    status: "draft",
    owner: "林闻",
    updatedAt: "2026-05-12",
    summary: "工业地坪涂装、基层病害识别与施工交底参数模板。",
    linkedProjectCount: 1,
    config: {
      fields: commercialPaintRenewalFields,
      values: {},
    },
  },
  {
    id: "RULE-3001",
    name: "商业楼涂装方案审核规则",
    kind: "audit",
    scene: "commercial-exterior",
    status: "active",
    owner: "苏砚",
    updatedAt: "2026-06-10",
    summary: "方案 PPT 初稿生成后自动触发,核查涂装体系、VOC 等级与施工窗口匹配度。",
    linkedProjectCount: 2,
    config: {
      triggerStage: "方案 PPT 初稿生成后",
      reviewers: ["产品负责人", "技术复核人"],
      checks: defaultCommercialAuditChecks,
      autoPassWhenClean: true,
    },
  },
  {
    id: "RULE-3002",
    name: "医院净味方案审核规则",
    kind: "audit",
    scene: "hospital-interior",
    status: "draft",
    owner: "陈知行",
    updatedAt: "2026-06-04",
    summary: "针对医院场景的合规性审核,VOC 等级与施工窗口为强制项。",
    linkedProjectCount: 1,
    config: {
      triggerStage: "方案 PPT 初稿生成后",
      reviewers: ["合规负责人"],
      checks: [
        {
          id: "check-hospital-voc",
          name: "医院 VOC 强制项",
          description: "医院类项目必须达到 GB/T 18883 优级或更高级别。",
          severity: "high",
          enabled: true,
        },
        {
          id: "check-hospital-window",
          name: "医院施工窗口",
          description: "需避开门诊高峰,提供错峰施工安排。",
          severity: "medium",
          enabled: true,
        },
      ],
      autoPassWhenClean: false,
    },
  },
];

export function findCommercialPaintRenewalField(key: RuleFormFieldKey): RuleFormField | undefined {
  return commercialPaintRenewalFields.find((field) => field.key === key);
}