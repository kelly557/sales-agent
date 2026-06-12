import type { BadgeProps } from "antd";
import {
  priorityText,
  statusText,
  taskTypeText,
  type TaskStatus,
} from "../data/documentTasks";

export const statusColor: Record<TaskStatus, BadgeProps["status"]> = {
  pending: "default",
  processing: "processing",
  success: "success",
  failed: "error",
  archived: "default",
};

export { priorityText, statusText, taskTypeText };
