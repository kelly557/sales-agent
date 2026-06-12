import { Badge, Flex, Progress, Space, Tag } from "antd";
import { priorityText, statusColor, statusText, taskTypeText } from "./taskDisplay";
import type { DocumentTask } from "../data/documentTasks";
import styles from "./DocumentWorkspace.module.css";

interface TaskListViewProps {
  tasks: DocumentTask[];
  onOpenTask: (task: DocumentTask) => void;
}

export function TaskListView({ tasks, onOpenTask }: TaskListViewProps) {
  return (
    <div className={styles.taskList}>
      {tasks.map((task) => (
        <article className={styles.taskItem} key={task.id}>
          <Flex justify="space-between" gap={16} wrap="wrap">
            <button className={styles.linkButton} type="button" onClick={() => onOpenTask(task)}>
              <span>{task.title}</span>
              <small>{task.project}</small>
            </button>
            <Space wrap>
              <Badge status={statusColor[task.status]} text={statusText[task.status]} />
              <Tag>{taskTypeText[task.type]}</Tag>
              <Tag color={task.priority === "high" ? "red" : undefined}>{priorityText[task.priority]}优先级</Tag>
            </Space>
          </Flex>
          <p>{task.summary}</p>
          <Progress percent={task.progress} size="small" />
        </article>
      ))}
    </div>
  );
}
