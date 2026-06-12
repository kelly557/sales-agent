import { App as AntApp, Button, Empty, Input, Space, Table, Tabs, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import {
  scheduledHistoryStatusLabels,
  type ScheduledTask,
  type ScheduledTaskHistory,
} from "../data/scheduledTasks";
import { ScheduledTaskForm, type ScheduledTaskFormValues } from "./ScheduledTaskForm";
import { ScheduledTaskTable } from "./ScheduledTaskTable";
import styles from "./ScheduledTasksPage.module.css";

const TASK_STORAGE_KEY = "doctech:scheduled-tasks";

function loadInitialTasks(seed: ScheduledTask[]): ScheduledTask[] {
  try {
    const raw = localStorage.getItem(TASK_STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as ScheduledTask[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seed;
  } catch {
    return seed;
  }
}

function persistTasks(tasks: ScheduledTask[]) {
  try {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* storage quota or private mode; safe to ignore for demo */
  }
}

interface ScheduledTasksPageProps {
  initialTasks: ScheduledTask[];
  history: ScheduledTaskHistory[];
}

export function ScheduledTasksPage({ initialTasks, history }: ScheduledTasksPageProps) {
  const { message: messageApi } = AntApp.useApp();
  const [keyword, setKeyword] = useState("");
  const [tasks, setTasks] = useState<ScheduledTask[]>(() => loadInitialTasks(initialTasks));
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) =>
        `${task.name} ${task.project} ${task.owner}`.toLowerCase().includes(keyword.trim().toLowerCase()),
      )
      .sort((a, b) => b.lastRunAt.localeCompare(a.lastRunAt));
  }, [keyword, tasks]);

  function handleCreate(values: ScheduledTaskFormValues) {
    const created: ScheduledTask = {
      id: `ST-${Date.now()}`,
      name: values.name,
      templateName: values.templateName,
      instruction: values.instruction,
      schedule: values.schedule,
      channels: values.channels,
      status: "queued",
      lastRunAt: "—",
      nextRunAt: values.schedule,
      owner: "当前用户",
      project: values.project,
    };
    const next = [created, ...tasks];
    setTasks(next);
    persistTasks(next);
  }

  function updateStatus(task: ScheduledTask, status: ScheduledTask["status"]) {
    const next = tasks.map((item) => (item.id === task.id ? { ...item, status } : item));
    setTasks(next);
    persistTasks(next);
  }

  function handleDelete(task: ScheduledTask) {
    const next = tasks.filter((item) => item.id !== task.id);
    setTasks(next);
    persistTasks(next);
    messageApi.success(`已删除任务：${task.name}`);
  }

  const historyColumns: ColumnsType<ScheduledTaskHistory> = [
    { title: "任务", dataIndex: "taskName", width: 240 },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (status: ScheduledTaskHistory["status"]) => {
        const color = status === "success" ? "success" : status === "failed" ? "error" : "default";
        return <Tag color={color}>{scheduledHistoryStatusLabels[status]}</Tag>;
      },
    },
    { title: "开始时间", dataIndex: "startedAt", width: 170 },
    { title: "结束时间", dataIndex: "finishedAt", width: 170 },
    { title: "结果摘要", dataIndex: "result" },
  ];

  return (
    <section className={styles.page} aria-label="定时任务页面">
      <header className={styles.header}>
        <div>
          <h1>定时任务</h1>
          <p>按模板创建定时任务，指定指令词、执行时间和推送渠道，结果可在执行历史中查看。</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsFormOpen(true)}>
          新建定时任务
        </Button>
      </header>

      <Tabs
        defaultActiveKey="list"
        items={[
          {
            key: "list",
            label: "任务列表",
            children: (
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <div className={styles.toolbar}>
                  <Input.Search
                    className={styles.search}
                    allowClear
                    placeholder="搜索任务名称、项目或负责人"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                  />
                </div>
                {filteredTasks.length === 0 ? (
                  <Empty description="没有匹配的定时任务">
                    <Button onClick={() => setKeyword("")}>清空搜索</Button>
                  </Empty>
                ) : (
                  <ScheduledTaskTable
                    tasks={filteredTasks}
                    onPause={(task) => updateStatus(task, "paused")}
                    onResume={(task) => updateStatus(task, "running")}
                    onDelete={handleDelete}
                  />
                )}
              </Space>
            ),
          },
          {
            key: "history",
            label: "执行历史",
            children: (
              <div className={styles.historyPanel}>
                <h2>最近执行</h2>
                <Table
                  rowKey="id"
                  size="middle"
                  pagination={{ pageSize: 8, showSizeChanger: false }}
                  dataSource={history}
                  columns={historyColumns}
                />
              </div>
            ),
          },
        ]}
      />

      <ScheduledTaskForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreate}
      />
    </section>
  );
}
