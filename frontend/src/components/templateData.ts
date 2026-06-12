export type TemplateType = "proposal" | "guide" | "checklist" | "report";
export type TemplateStatus = "ready" | "draft" | "reviewing";

export type TemplateSourceFile = {
  name: string;
  size: number;
  kind: "pptx" | "docx";
};

export type DocumentTemplate = {
  id: string;
  name: string;
  type: TemplateType;
  status: TemplateStatus;
  owner: string;
  updatedAt: string;
  summary: string;
  fields: string[];
  outputs: string[];
  tags: string[];
  usageCount: number;
  sourceFile?: TemplateSourceFile;
};

export const templateTypeLabels: Record<TemplateType, string> = {
  proposal: "方案模板",
  guide: "指导书模板",
  checklist: "检查清单",
  report: "报告模板",
};

export const templateStatusLabels: Record<TemplateStatus, string> = {
  ready: "可使用",
  draft: "草稿",
  reviewing: "复核中",
};

export const templates: DocumentTemplate[] = [
  {
    id: "TPL-2001",
    name: "立邦外墙涂装推荐书模板",
    type: "proposal",
    status: "ready",
    owner: "解决方案组",
    updatedAt: "2026-05-27",
    summary: "用于外墙翻新、商业综合体、园区建筑等场景的涂装体系推荐。",
    fields: ["项目名称", "建筑类型", "涂装面积", "基层状态", "性能诉求", "质保口径"],
    outputs: ["方案正文", "材料用量估算", "施工工艺", "风险提示"],
    tags: ["外墙", "推荐书", "立邦"],
    usageCount: 168,
  },
  {
    id: "TPL-2002",
    name: "外墙涂装施工作业指导书模板",
    type: "guide",
    status: "ready",
    owner: "工程服务部",
    updatedAt: "2026-05-24",
    summary: "按工序生成基层处理、底涂、面涂、成品保护和安全要求。",
    fields: ["施工区域", "基层条件", "涂装体系", "作业方法", "停工边界"],
    outputs: ["指导书正文", "工序表", "安全交底", "复核项"],
    tags: ["指导书", "工艺", "安全"],
    usageCount: 132,
    sourceFile: { name: "外墙施工作业指导书.docx", size: 482_112, kind: "docx" },
  },
  {
    id: "TPL-2003",
    name: "项目交付资料完整性检查清单",
    type: "checklist",
    status: "reviewing",
    owner: "质量管理部",
    updatedAt: "2026-05-19",
    summary: "检查现场照片、材料批次、验收记录、签字页和交付附件完整性。",
    fields: ["项目阶段", "资料目录", "责任人", "缺失项", "截止日期"],
    outputs: ["缺口清单", "责任分派", "交付状态"],
    tags: ["交付", "检查", "资料"],
    usageCount: 91,
  },
  {
    id: "TPL-2004",
    name: "工业地坪涂装方案模板",
    type: "proposal",
    status: "ready",
    owner: "工业涂料组",
    updatedAt: "2026-05-16",
    summary: "面向厂房、仓库、坡道等地坪场景，生成基层处理和体系建议。",
    fields: ["地坪用途", "基层强度", "含水率", "荷载条件", "防滑要求"],
    outputs: ["体系建议", "施工流程", "材料清单"],
    tags: ["地坪", "工业", "涂装"],
    usageCount: 84,
  },
  {
    id: "TPL-2005",
    name: "现场勘查纪要模板",
    type: "report",
    status: "draft",
    owner: "区域技术中心",
    updatedAt: "2026-05-08",
    summary: "记录现场条件、病害情况、照片编号、客户诉求和下一步动作。",
    fields: ["勘查时间", "现场联系人", "病害描述", "照片编号", "建议动作"],
    outputs: ["勘查纪要", "照片清单", "后续任务"],
    tags: ["勘查", "纪要"],
    usageCount: 47,
  },
  {
    id: "TPL-2006",
    name: "医院内墙净味施工方案模板",
    type: "proposal",
    status: "ready",
    owner: "绿色产品组",
    updatedAt: "2026-04-30",
    summary: "用于医院、学校、养老机构等低气味内墙翻新场景。",
    fields: ["建筑功能", "开放时间", "低气味要求", "耐擦洗要求", "防霉要求"],
    outputs: ["产品体系", "施工窗口", "验收标准"],
    tags: ["内墙", "净味", "医院"],
    usageCount: 63,
  },
  {
    id: "TPL-2007",
    name: "商务汇报型定制方案 PPT 模板",
    type: "proposal",
    status: "ready",
    owner: "解决方案组",
    updatedAt: "2026-06-01",
    summary: "用于客户汇报场景，包含封面、项目背景、现状诊断、推荐体系、工艺流程、用量估算、风险审批和交付清单。",
    fields: ["项目名称", "客户名称", "项目场景", "推荐体系", "知识引用", "审批节点"],
    outputs: ["可编辑 PPT", "演讲备注", "溯源页", "审批页"],
    tags: ["PPT", "商务汇报", "方案模板"],
    usageCount: 42,
    sourceFile: { name: "商务汇报方案模板.pptx", size: 1_286_400, kind: "pptx" },
  },
];
