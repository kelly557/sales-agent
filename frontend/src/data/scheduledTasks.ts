export type ScheduledTaskStatus = "running" | "paused" | "error" | "queued";
export type ScheduledChannel = "wechat" | "email" | "inbox";

export interface ScheduledTask {
  id: string;
  name: string;
  templateName: string;
  instruction: string;
  schedule: string;
  channels: ScheduledChannel[];
  status: ScheduledTaskStatus;
  lastRunAt: string;
  nextRunAt: string;
  owner: string;
  project: string;
}

export interface ScheduledTaskHistory {
  id: string;
  taskId: string;
  taskName: string;
  startedAt: string;
  finishedAt: string;
  status: "success" | "failed" | "skipped";
  result: string;
}

export const channelLabels: Record<ScheduledChannel, string> = {
  wechat: "企业微信",
  email: "邮件",
  inbox: "站内消息",
};

export const scheduledTaskStatusLabels: Record<ScheduledTaskStatus, string> = {
  running: "运行中",
  paused: "已暂停",
  error: "执行失败",
  queued: "已排队",
};

export const scheduledHistoryStatusLabels: Record<ScheduledTaskHistory["status"], string> = {
  success: "成功",
  failed: "失败",
  skipped: "已跳过",
};

export const scheduledTasks: ScheduledTask[] = [
  {
    id: "ST-9001",
    name: "每日合规检查报告",
    templateName: "合规检查日报模板",
    instruction: "扫描近 24 小时提交的方案材料并生成合规摘要",
    schedule: "每天 09:00",
    channels: ["wechat", "inbox"],
    status: "running",
    lastRunAt: "2026-06-08 09:02",
    nextRunAt: "2026-06-09 09:00",
    owner: "陈知行",
    project: "全局",
  },
  {
    id: "ST-9002",
    name: "周报：项目交付物复核",
    templateName: "交付物周报模板",
    instruction: "汇总本周复核完成、待复核和退回的交付物",
    schedule: "每周一 08:30",
    channels: ["email"],
    status: "running",
    lastRunAt: "2026-06-08 08:30",
    nextRunAt: "2026-06-15 08:30",
    owner: "周亦然",
    project: "全局",
  },
  {
    id: "ST-9003",
    name: "上海地区雨季施工预警",
    templateName: "施工窗口预警模板",
    instruction: "拉取天气预报并提醒受影响项目的施工窗口",
    schedule: "每天 18:00",
    channels: ["wechat"],
    status: "paused",
    lastRunAt: "2026-06-05 18:00",
    nextRunAt: "—",
    owner: "林闻",
    project: "浦东商业综合体外墙翻新",
  },
  {
    id: "ST-9004",
    name: "客户回访提醒",
    templateName: "客户回访提醒模板",
    instruction: "为最近 7 天交付的项目负责人推送回访提醒",
    schedule: "每周三 10:00",
    channels: ["email", "inbox"],
    status: "error",
    lastRunAt: "2026-06-04 10:00",
    nextRunAt: "—",
    owner: "沈嘉",
    project: "医院内墙净味翻新咨询",
  },
];

export const scheduledTaskHistory: ScheduledTaskHistory[] = [
  {
    id: "H-3001",
    taskId: "ST-9001",
    taskName: "每日合规检查报告",
    startedAt: "2026-06-08 09:00",
    finishedAt: "2026-06-08 09:02",
    status: "success",
    result: "扫描 12 份方案材料，识别 2 项待复核",
  },
  {
    id: "H-3002",
    taskId: "ST-9002",
    taskName: "周报：项目交付物复核",
    startedAt: "2026-06-08 08:30",
    finishedAt: "2026-06-08 08:33",
    status: "success",
    result: "本周完成 18 项复核，3 项退回",
  },
  {
    id: "H-3003",
    taskId: "ST-9003",
    taskName: "上海地区雨季施工预警",
    startedAt: "2026-06-05 18:00",
    finishedAt: "2026-06-05 18:00",
    status: "skipped",
    result: "已暂停，跳过本次执行",
  },
  {
    id: "H-3004",
    taskId: "ST-9004",
    taskName: "客户回访提醒",
    startedAt: "2026-06-04 10:00",
    finishedAt: "2026-06-04 10:00",
    status: "failed",
    result: "邮件发送失败：收件人地址无效",
  },
];
