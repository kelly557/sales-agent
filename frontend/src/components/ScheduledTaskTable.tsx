import { Badge, Space, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  channelDisplayLabels,
  scheduledChannelTagColor,
  scheduledTaskStatusColor,
  scheduledTaskStatusDisplay,
  type ScheduledTask,
} from "./scheduledTaskDisplay";
import styles from "./ScheduledTasksPage.module.css";

interface ScheduledTaskTableProps {
  tasks: ScheduledTask[];
  onPause: (task: ScheduledTask) => void;
  onResume: (task: ScheduledTask) => void;
  onDelete: (task: ScheduledTask) => void;
}

export function ScheduledTaskTable({ tasks, onPause, onResume, onDelete }: ScheduledTaskTableProps) {
  const columns: ColumnsType<ScheduledTask> = [
    {
      title: "任务",
      dataIndex: "name",
      width: 220,
      render: (_value, row) => (
        <Space direction="vertical" size={2}>
          <strong>{row.name}</strong>
          <small style={{ color: "var(--color-muted)" }}>{row.project}</small>
        </Space>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 110,
      filters: Object.entries(scheduledTaskStatusDisplay).map(([value, text]) => ({ value, text })),
      onFilter: (value, record) => record.status === value,
      render: (status: ScheduledTask["status"]) => (
        <Badge status={scheduledTaskStatusColor[status]} text={scheduledTaskStatusDisplay[status]} />
      ),
    },
    {
      title: "调度",
      dataIndex: "schedule",
      width: 140,
    },
    {
      title: "渠道",
      dataIndex: "channels",
      width: 160,
      render: (channels: ScheduledTask["channels"]) => (
        <Space wrap>
          {channels.map((channel) => (
            <Tag color={scheduledChannelTagColor[channel]} key={channel}>
              {channelDisplayLabels[channel]}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "上次执行",
      dataIndex: "lastRunAt",
      width: 160,
    },
    {
      title: "下次执行",
      dataIndex: "nextRunAt",
      width: 140,
    },
    {
      title: "操作",
      width: 200,
      render: (_value, row) => (
        <Space>
          {row.status === "running" ? (
            <Tooltip title="暂停任务">
              <a onClick={() => onPause(row)}>暂停</a>
            </Tooltip>
          ) : row.status === "paused" || row.status === "error" || row.status === "queued" ? (
            <Tooltip title="恢复任务">
              <a onClick={() => onResume(row)}>恢复</a>
            </Tooltip>
          ) : null}
          <Tooltip title="删除任务">
            <a onClick={() => onDelete(row)} style={{ color: "var(--color-primary)" }}>
              删除
            </a>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={tasks}
      pagination={{ pageSize: 8, showSizeChanger: false }}
      className={styles.toolbar}
    />
  );
}
