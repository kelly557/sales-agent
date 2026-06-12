export type ApprovalMode = "none" | "light" | "standard";

export const approvalModeLabels: Record<ApprovalMode, string> = {
  none: "不审批",
  light: "轻量版",
  standard: "标准流程版",
};

export const approvalModeDescriptions: Record<ApprovalMode, string> = {
  none: "AI 评分后自动通过，不进入人工审批。",
  light: "AI 评分高于阈值自动通过，否则进入人工审批。",
  standard: "按方案、质量、销售等多节点流转，所有节点需人工处理。",
};

export interface ApprovalLightConfig {
  scoreThreshold: number;
  autoApproveHighScore: boolean;
  notifyChannel: "wechat" | "email" | "inbox";
}

export interface ApprovalStandardNode {
  id: string;
  name: string;
  role: string;
  description: string;
}

export interface ApprovalStandardConfig {
  nodes: ApprovalStandardNode[];
  timeoutDays: number;
}

export const defaultApprovalLightConfig: ApprovalLightConfig = {
  scoreThreshold: 80,
  autoApproveHighScore: true,
  notifyChannel: "wechat",
};

export const defaultApprovalStandardConfig: ApprovalStandardConfig = {
  nodes: [
    { id: "node-1", name: "方案工程师复核", role: "方案工程师", description: "复核体系选型、客户表达和 PPT 结构" },
    { id: "node-2", name: "质量复核", role: "质量复核", description: "复核规范条款、风险提示和验收口径" },
    { id: "node-3", name: "销售负责人确认", role: "销售负责人", description: "复核商务措辞、报价口径和交付附件" },
  ],
  timeoutDays: 3,
};
