export type ProjectStatus = "active" | "reviewing" | "done";

export type ProjectFileType = "ppt" | "excel" | "word" | "pdf" | "image";

export const projectFileTypeLabels: Record<ProjectFileType, string> = {
  ppt: "PPT",
  excel: "Excel",
  word: "Word",
  pdf: "PDF",
  image: "图片",
};

export type ProjectFile = {
  id: string;
  name: string;
  version: string;
  type: ProjectFileType;
};

export type ProjectItem = {
  id: string;
  name: string;
  customer: string;
  status: ProjectStatus;
  owner: string;
  updatedAt: string;
  summary: string;
  linkedModules: string[];
  deliverables: string[];
  missingCount: number;
  files: ProjectFile[];
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  active: "进行中",
  reviewing: "复核中",
  done: "已完成",
};

export const projects: ProjectItem[] = [
  {
    id: "PRJ-3001",
    name: "浦东商业综合体外墙翻新",
    customer: "上海浦东商业管理有限公司",
    status: "active",
    owner: "周亦然",
    updatedAt: "2026-05-29",
    summary: "围绕立邦外墙涂装推荐书、施工作业指导书和交付资料清单进行方案生成。",
    linkedModules: ["定制方案生成", "施工作业指导书", "知识库", "模版"],
    deliverables: ["现场勘查照片包", "基层检测记录", "涂装体系推荐书", "材料用量估算表", "复核项清单"],
    missingCount: 1,
    files: [
      { id: "F-1001", name: "现场勘查照片包.zip", version: "v1.2", type: "image" },
      { id: "F-1002", name: "基层检测记录表.xlsx", version: "v1.0", type: "excel" },
      { id: "F-1003", name: "涂装体系推荐书.pptx", version: "v2.1", type: "ppt" },
      { id: "F-1004", name: "材料用量估算表.xlsx", version: "v1.1", type: "excel" },
      { id: "F-1005", name: "施工交底初稿.docx", version: "v0.3", type: "word" },
    ],
  },
  {
    id: "PRJ-3002",
    name: "华南智能制造园地坪改造",
    customer: "华南智能制造园",
    status: "reviewing",
    owner: "林闻",
    updatedAt: "2026-05-26",
    summary: "用于工业地坪涂装方案、基层病害识别和施工交底材料生成。",
    linkedModules: ["定制方案生成", "施工作业指导书", "知识库"],
    deliverables: ["工业地坪涂装方案", "基层处理建议", "施工交底初稿"],
    missingCount: 4,
    files: [
      { id: "F-2001", name: "工业地坪涂装方案.pptx", version: "v1.4", type: "ppt" },
      { id: "F-2002", name: "基层病害识别报告.pdf", version: "v1.0", type: "pdf" },
      { id: "F-2003", name: "施工交底初稿.docx", version: "v0.8", type: "word" },
    ],
  },
  {
    id: "PRJ-3003",
    name: "医院内墙净味翻新咨询",
    customer: "江北康复医院",
    status: "done",
    owner: "陈知行",
    updatedAt: "2026-05-18",
    summary: "按医院内墙净味体系模板生成方案、施工窗口和验收标准。",
    linkedModules: ["定制方案生成", "模版", "知识库"],
    deliverables: ["净味体系推荐书", "施工窗口说明", "验收标准"],
    missingCount: 0,
    files: [
      { id: "F-3001", name: "净味体系推荐书.pptx", version: "v2.0", type: "ppt" },
      { id: "F-3002", name: "施工窗口说明.pdf", version: "v1.0", type: "pdf" },
      { id: "F-3003", name: "验收标准.docx", version: "v1.0", type: "word" },
    ],
  },
  {
    id: "PRJ-3004",
    name: "上海富居商业楼翻新",
    customer: "上海富居资产管理有限公司",
    status: "active",
    owner: "苏砚",
    updatedAt: "2026-06-08",
    summary: "黄浦核心商圈商业综合体外立面与公共区域翻新，融合幕墙节点、净味内墙与夜间施工窗口约束。",
    linkedModules: ["定制方案生成", "施工作业指导书", "知识库", "业务规则"],
    deliverables: ["现场勘查照片包", "幕墙节点检测报告", "净味内墙推荐书", "夜间施工组织方案", "材料用量估算表", "复核项清单"],
    missingCount: 2,
    files: [
      { id: "F-4001", name: "富居现场勘查照片包.zip", version: "v1.3", type: "image" },
      { id: "F-4002", name: "幕墙节点检测报告.pdf", version: "v1.0", type: "pdf" },
      { id: "F-4003", name: "富居净味内墙推荐书.pptx", version: "v2.2", type: "ppt" },
      { id: "F-4004", name: "夜间施工组织方案.docx", version: "v0.7", type: "word" },
      { id: "F-4005", name: "材料用量估算表.xlsx", version: "v1.2", type: "excel" },
      { id: "F-4006", name: "复核项清单.xlsx", version: "v0.4", type: "excel" },
    ],
  },
];
