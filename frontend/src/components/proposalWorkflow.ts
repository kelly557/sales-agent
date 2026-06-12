import type { ProposalFormValues } from "./proposalData";

export interface ProposalChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "streaming" | "done";
}

export interface ProposalPptStatus {
  jobId: string;
  status: "running" | "done" | "error";
  stage?: string;
  progress?: number;
  error?: string;
  outputPath?: string;
  downloadUrl?: string;
  localDownloadUrl?: string;
}

export interface ProposalWorkflowChunk {
  delay: number;
  content: string;
}

export function buildProposalWorkflowChunks(values: ProposalFormValues): ProposalWorkflowChunk[] {
  return [
    {
      delay: 280,
      content: "Thinking\n正在整理项目参数、客户诉求、模板约束和交付目标。\n\n",
    },
    {
      delay: 520,
      content: `已识别项目：${values.projectName}；客户：${values.customer}；场景：${values.scenario}；输出模板：${values.template}。\n\n`,
    },
    {
      delay: 560,
      content: "Workflow\n1. 资料读取：读取项目基础信息、现场条件、推荐体系、上传附件和模板结构。\n",
    },
    {
      delay: 620,
      content: "2. 规则校验：校验基层状态、涂装体系、材料用量、施工窗口和质保表达边界。\n",
    },
    {
      delay: 620,
      content: "3. 知识引用：匹配产品 TDS、案例库、估算口径、施工限制和审批规则。\n",
    },
    {
      delay: 620,
      content: "4. PPT 生成：组织封面、项目背景、现状诊断、推荐体系、工艺流程、用量估算、风险提示和交付清单。\n",
    },
    {
      delay: 620,
      content: "5. 溯源与审批：生成页码级引用、待复核项和方案/质量/销售审批节点。\n\n",
    },
    {
      delay: 560,
      content: `Summary\n已生成《${values.projectName}》方案 PPT 初稿摘要：共 10 页，引用 4 类知识资料，识别 3 项待复核内容，适合进入详情页阅览和编辑。\n`,
    },
  ];
}
