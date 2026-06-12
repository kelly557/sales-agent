import type { BadgeProps } from "antd";
import { templates } from "./templateData";
import {
  channelLabels,
  scheduledHistoryStatusLabels,
  scheduledTaskStatusLabels,
  type ScheduledChannel,
  type ScheduledTask,
  type ScheduledTaskHistory,
  type ScheduledTaskStatus,
} from "../data/scheduledTasks";

export const scheduledTaskStatusColor: Record<ScheduledTaskStatus, BadgeProps["status"]> = {
  running: "processing",
  paused: "default",
  error: "error",
  queued: "warning",
};

export const scheduledChannelTagColor: Record<ScheduledChannel, string> = {
  wechat: "green",
  email: "blue",
  inbox: "purple",
};

export const channelDisplayLabels = channelLabels;
export const scheduledTaskStatusDisplay = scheduledTaskStatusLabels;
export const scheduledHistoryStatusDisplay = scheduledHistoryStatusLabels;

export function getScheduledTemplateOptions() {
  return templates.map((template) => ({ value: template.name, label: template.name }));
}

export type { ScheduledTask, ScheduledTaskHistory, ScheduledTaskStatus, ScheduledChannel };
