import { Alert, Button, Empty, Input, Segmented, Select, Statistic, Tooltip } from "antd";
import { AppstoreOutlined, BarsOutlined, WarningOutlined } from "@ant-design/icons";
import { TaskListView } from "./TaskListView";
import { TaskTable } from "./TaskTable";
import { statusText, taskTypeText, type DocumentTask, type TaskStatus, type TaskType } from "../data/documentTasks";
import styles from "./DocumentWorkspace.module.css";

const typeOptions = Object.entries(taskTypeText).map(([value, label]) => ({ value, label }));
const statusOptions = Object.entries(statusText).map(([value, label]) => ({ value, label }));

interface WorkspaceContentProps {
  filteredTasks: DocumentTask[];
  keyword: string;
  typeFilter: TaskType | "all";
  statusFilter: TaskStatus | "all";
  view: "table" | "list";
  isErrorVisible: boolean;
  setKeyword: (value: string) => void;
  setTypeFilter: (value: TaskType | "all") => void;
  setStatusFilter: (value: TaskStatus | "all") => void;
  setView: (value: "table" | "list") => void;
  setSelectedTask: (task: DocumentTask) => void;
  setIsErrorVisible: (value: boolean) => void;
}

export function WorkspaceContent({
  filteredTasks,
  keyword,
  typeFilter,
  statusFilter,
  view,
  isErrorVisible,
  setKeyword,
  setTypeFilter,
  setStatusFilter,
  setView,
  setSelectedTask,
  setIsErrorVisible,
}: WorkspaceContentProps) {
  const urgentCount = filteredTasks.filter((task) => task.priority === "high").length;
  const missingCount = filteredTasks.reduce((sum, task) => sum + task.missingCount, 0);
  const doneCount = filteredTasks.filter((task) => task.status === "success").length;

  return (
    <>
      {isErrorVisible && (
        <Alert
          className={styles.alert}
          type="error"
          showIcon
          closable
          message="模拟错误状态"
          description="当前为本地 demo 状态，用于检查错误提示和恢复路径。点击关闭或重置筛选即可恢复。"
          onClose={() => setIsErrorVisible(false)}
        />
      )}

      <section className={styles.metrics} aria-label="任务概览">
        <Statistic title="当前任务" value={filteredTasks.length} />
        <Statistic title="高优先级" value={urgentCount} valueStyle={{ color: urgentCount ? "#b42318" : undefined }} />
        <Statistic title="资料缺口" value={missingCount} suffix="项" />
        <Statistic title="已完成" value={doneCount} suffix={`/${filteredTasks.length || 0}`} />
      </section>

      <section className={styles.toolbar} aria-label="任务筛选">
        <Input.Search
          allowClear
          className={styles.search}
          placeholder="搜索任务、项目、行业、负责人"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <Select
          value={typeFilter}
          aria-label="按任务类型筛选"
          options={[{ value: "all", label: "全部类型" }, ...typeOptions]}
          onChange={setTypeFilter}
        />
        <Select
          value={statusFilter}
          aria-label="按任务状态筛选"
          options={[{ value: "all", label: "全部状态" }, ...statusOptions]}
          onChange={setStatusFilter}
        />
        <Segmented
          value={view}
          onChange={(value) => setView(value as "table" | "list")}
          options={[
            { value: "table", icon: <BarsOutlined />, label: "表格" },
            { value: "list", icon: <AppstoreOutlined />, label: "列表" },
          ]}
        />
        <Tooltip title="触发本地错误预览">
          <Button icon={<WarningOutlined />} onClick={() => setIsErrorVisible(true)}>
            错误状态
          </Button>
        </Tooltip>
      </section>

      {filteredTasks.length === 0 ? (
        <Empty className={styles.empty} description="没有匹配的文档任务">
          <Button
            onClick={() => {
              setKeyword("");
              setTypeFilter("all");
              setStatusFilter("all");
            }}
          >
            清空筛选
          </Button>
        </Empty>
      ) : view === "table" ? (
        <TaskTable tasks={filteredTasks} onOpenTask={setSelectedTask} />
      ) : (
        <TaskListView tasks={filteredTasks} onOpenTask={setSelectedTask} />
      )}
    </>
  );
}
