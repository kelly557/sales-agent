import type { KnowledgeFolder } from "../components/knowledgeBaseData";
import { knowledgeFolders } from "../components/knowledgeBaseData";
import type { DocumentTemplate } from "../components/templateData";
import { templates } from "../components/templateData";

export type ProjectResourceType = "knowledge" | "template" | "uploaded";

export interface ProjectUploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  owner: string;
}

export interface ProjectDeliverable {
  id: string;
  name: string;
  type: "proposal" | "guide" | "checklist";
  version: string;
  status: "draft" | "reviewing" | "ready";
  updatedAt: string;
  projectId: string;
}

export interface ProjectChatEntry {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "streaming" | "done";
}

export const projectResourcesByProject: Record<string, KnowledgeFolder[]> = {
  "PRJ-3001": knowledgeFolders.slice(0, 2),
  "PRJ-3002": knowledgeFolders.slice(1, 3),
  "PRJ-3003": knowledgeFolders.slice(0, 1),
  "PRJ-3004": knowledgeFolders.slice(0, 2),
};

export const projectTemplatesByProject: Record<string, DocumentTemplate[]> = {
  "PRJ-3001": templates.filter((item) => item.type === "proposal" || item.type === "guide").slice(0, 2),
  "PRJ-3002": templates.filter((item) => item.type === "proposal" || item.type === "checklist").slice(0, 2),
  "PRJ-3003": templates.filter((item) => item.type === "proposal" || item.type === "report").slice(0, 2),
  "PRJ-3004": templates.filter((item) => item.type === "proposal" || item.type === "guide").slice(0, 2),
};

export const projectUploadedFilesByProject: Record<string, ProjectUploadedFile[]> = {
  "PRJ-3001": [
    { id: "F-1", name: "现场勘查照片.zip", size: "18.2 MB", type: "zip", uploadedAt: "2026-05-20", owner: "周亦然" },
    { id: "F-2", name: "基层检测记录.pdf", size: "1.4 MB", type: "pdf", uploadedAt: "2026-05-22", owner: "周亦然" },
  ],
  "PRJ-3002": [
    { id: "F-3", name: "车间地坪病害照片.zip", size: "22.5 MB", type: "zip", uploadedAt: "2026-05-19", owner: "林闻" },
  ],
  "PRJ-3003": [
    { id: "F-4", name: "医院内墙现状报告.docx", size: "2.1 MB", type: "docx", uploadedAt: "2026-05-15", owner: "陈知行" },
  ],
  "PRJ-3004": [
    { id: "F-5", name: "富居现场勘查照片包.zip", size: "26.4 MB", type: "zip", uploadedAt: "2026-05-23", owner: "周亦然" },
    { id: "F-6", name: "幕墙节点检测报告.pdf", size: "3.6 MB", type: "pdf", uploadedAt: "2026-05-24", owner: "林闻" },
  ],
};

export const projectDeliverablesByProject: Record<string, ProjectDeliverable[]> = {
  "PRJ-3001": [
    { id: "D-1", name: "浦东商业综合体外墙翻新推荐书", type: "proposal", version: "V1.3", status: "reviewing", updatedAt: "2026-05-29", projectId: "PRJ-3001" },
    { id: "D-2", name: "外墙涂装施工作业指导书", type: "guide", version: "V2.0", status: "ready", updatedAt: "2026-05-28", projectId: "PRJ-3001" },
    { id: "D-3", name: "客户汇报交付清单", type: "checklist", version: "V0.8", status: "draft", updatedAt: "2026-05-26", projectId: "PRJ-3001" },
  ],
  "PRJ-3002": [
    { id: "D-4", name: "工业地坪改造方案", type: "proposal", version: "V0.9", status: "draft", updatedAt: "2026-05-26", projectId: "PRJ-3002" },
  ],
  "PRJ-3003": [
    { id: "D-5", name: "医院内墙净味方案", type: "proposal", version: "V1.0", status: "ready", updatedAt: "2026-05-18", projectId: "PRJ-3003" },
  ],
  "PRJ-3004": [
    { id: "D-6", name: "上海富居商业楼翻新推荐书", type: "proposal", version: "V1.0", status: "reviewing", updatedAt: "2026-05-30", projectId: "PRJ-3004" },
    { id: "D-7", name: "夜间施工组织方案", type: "guide", version: "V0.7", status: "draft", updatedAt: "2026-05-28", projectId: "PRJ-3004" },
  ],
};

export const projectChatSeeds: Record<string, ProjectChatEntry[]> = {
  "PRJ-3001": [
    {
      id: "C-1",
      role: "user",
      content: "基于浦东商业综合体外墙翻新项目生成推荐书 PPT",
      status: "done",
    },
    {
      id: "C-2",
      role: "assistant",
      content: "已读取项目参数、立邦外墙耐候体系 TDS 和现场勘查照片。建议先生成商务汇报型 10 页模板。",
      status: "done",
    },
  ],
  "PRJ-3002": [
    {
      id: "C-3",
      role: "user",
      content: "针对车间地坪改造生成 5-10 吨承载方案",
      status: "done",
    },
  ],
  "PRJ-3003": [],
  "PRJ-3004": [
    {
      id: "C-4",
      role: "user",
      content: "基于上海富居商业楼幕墙与基层情况生成翻新推荐书",
      status: "done",
    },
    {
      id: "C-5",
      role: "assistant",
      content: "已读取富居现场勘查照片包、幕墙节点检测报告和净味内墙体系模板，建议先生成商务汇报型 10 页方案并重点突出夜间施工组织。",
      status: "done",
    },
    {
      id: "C-6",
      role: "user",
      content: "把夜间施工组织方案与现场照片再核对一次",
      status: "done",
    },
    {
      id: "C-7",
      role: "assistant",
      content: "已对齐夜间施工组织方案 v0.7 和现场勘查照片包 v1.3，识别 2 项复核项（夜间灯光布置、邻近居民投诉预案），可在项目历史里继续追加问题。",
      status: "done",
    },
  ],
};
