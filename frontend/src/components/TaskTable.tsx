import { Badge, Progress, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { statusColor, statusText, taskTypeText } from "./taskDisplay";
import { type DocumentTask, type TaskStatus, type TaskType } from "../data/documentTasks";
import styles from "./DocumentWorkspace.module.css";

const typeFilters = Object.entries(taskTypeText).map(([value, text]) => ({ value, text }));
const statusFilters = Object.entries(statusText).map(([value, text]) => ({ value, text }));

interface TaskTableProps {
  tasks: DocumentTask[];
  onOpenTask: (task: DocumentTask) => void;
}

export function TaskTable({ tasks, onOpenTask }: TaskTableProps) {
  const columns: ColumnsType<DocumentTask> = [
    {
      title: "任务",
      dataIndex: "title",
      sorter: (a, b) => a.title.localeCompare(b.title, "zh-CN"),
      render: (_, task) => (
        <button className={styles.linkButton} type="button" onClick={() => onOpenTask(task)}>
          <span>{task.title}</span>
          <small>{task.project}</small>
        </button>
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      width: 112,
      render: (type: TaskType) => <Tag>{taskTypeText[type]}</Tag>,
      filters: typeFilters,
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 112,
      render: (status: TaskStatus) => <Badge status={statusColor[status]} text={statusText[status]} />,
      filters: statusFilters,
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "进度",
      dataIndex: "progress",
      width: 160,
      sorter: (a, b) => a.progress - b.progress,
      render: (progress: number) => <Progress percent={progress} size="small" />,
    },
    {
      title: "缺口",
      dataIndex: "missingCount",
      width: 88,
      sorter: (a, b) => a.missingCount - b.missingCount,
      render: (count: number) => (count > 0 ? <Tag color="error">{count} 项</Tag> : <Tag>无</Tag>),
    },
    {
      title: "更新",
      dataIndex: "updatedAt",
      width: 150,
      sorter: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={tasks}
      pagination={{ pageSize: 8, showSizeChanger: false }}
      scroll={{ x: 860 }}
    />
  );
}
