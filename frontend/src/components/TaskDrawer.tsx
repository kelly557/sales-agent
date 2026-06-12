import { Button, Descriptions, Drawer, Space, message } from "antd";
import type { DocumentTask } from "../data/documentTasks";
import styles from "./DocumentWorkspace.module.css";

interface TaskDrawerProps {
  selectedTask: DocumentTask | null;
  onClose: () => void;
}

export function TaskDrawer({ selectedTask, onClose }: TaskDrawerProps) {
  function handleDemoAction(task: DocumentTask) {
    message.success(`已生成 ${task.id} 的本地演示结果`);
  }

  return (
    <Drawer
      title={selectedTask?.title}
      open={Boolean(selectedTask)}
      width={520}
      onClose={onClose}
      extra={
        selectedTask ? (
          <Button type="primary" onClick={() => handleDemoAction(selectedTask)}>
            生成演示结果
          </Button>
        ) : null
      }
    >
      {selectedTask && (
        <Space direction="vertical" size={18} className={styles.drawerBody}>
          <p>{selectedTask.summary}</p>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="项目">{selectedTask.project}</Descriptions.Item>
            <Descriptions.Item label="行业">{selectedTask.industry}</Descriptions.Item>
            <Descriptions.Item label="负责人">{selectedTask.owner}</Descriptions.Item>
            <Descriptions.Item label="截止日期">{selectedTask.dueDate}</Descriptions.Item>
            <Descriptions.Item label="证据来源">{selectedTask.evidenceCount} 个</Descriptions.Item>
            <Descriptions.Item label="待补资料">{selectedTask.missingCount} 项</Descriptions.Item>
          </Descriptions>
        </Space>
      )}
    </Drawer>
  );
}
