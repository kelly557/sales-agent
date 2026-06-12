import { App as AntApp, Button, Checkbox, Drawer, Form, Input, Select, Space } from "antd";
import { useState } from "react";
import { getScheduledTemplateOptions } from "./scheduledTaskDisplay";
import styles from "./ScheduledTasksPage.module.css";

export interface ScheduledTaskFormValues {
  name: string;
  templateName: string;
  instruction: string;
  schedule: string;
  channels: Array<"wechat" | "email" | "inbox">;
  project: string;
}

interface ScheduledTaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ScheduledTaskFormValues) => void;
}

const defaultValues: ScheduledTaskFormValues = {
  name: "新定时任务",
  templateName: getScheduledTemplateOptions()[0]?.value ?? "",
  instruction: "请输入任务指令词",
  schedule: "每天 09:00",
  channels: ["inbox"],
  project: "全局",
};

export function ScheduledTaskForm({ open, onClose, onSubmit }: ScheduledTaskFormProps) {
  const { message: messageApi } = AntApp.useApp();
  const [form] = Form.useForm<ScheduledTaskFormValues>();
  const [draft, setDraft] = useState<ScheduledTaskFormValues>(defaultValues);

  function handleAfterOpenChange(visible: boolean) {
    if (visible) {
      form.setFieldsValue(defaultValues);
      setDraft(defaultValues);
    }
  }

  function handleSubmit() {
    form
      .validateFields()
      .then((values) => {
        onSubmit(values);
        messageApi.success("已创建定时任务");
        onClose();
      })
      .catch(() => {
        messageApi.warning("请补齐必填字段");
      });
  }

  return (
    <Drawer
      title="新建定时任务"
      open={open}
      width={520}
      onClose={onClose}
      destroyOnClose
      afterOpenChange={handleAfterOpenChange}
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleSubmit}>
            保存
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        className={styles.formBody}
        initialValues={defaultValues}
        onValuesChange={(_changed, allValues) => setDraft(allValues)}
      >
        <div className={styles.formGrid}>
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: "请输入任务名称" }]}
            className={styles.fullWidth}
          >
            <Input placeholder="例如：每日合规检查报告" />
          </Form.Item>
          <Form.Item
            name="templateName"
            label="从模板创建"
            rules={[{ required: true, message: "请选择模板" }]}
          >
            <Select
              placeholder="选择任务模板"
              options={getScheduledTemplateOptions()}
              showSearch
            />
          </Form.Item>
          <Form.Item
            name="schedule"
            label="执行时间"
            rules={[{ required: true, message: "请输入执行时间" }]}
          >
            <Input placeholder="例如：每天 09:00 / 每周一 08:30" />
          </Form.Item>
          <Form.Item
            name="project"
            label="作用范围"
            rules={[{ required: true, message: "请输入作用范围" }]}
            className={styles.fullWidth}
          >
            <Input placeholder="例如：全局 / 浦东商业综合体外墙翻新" />
          </Form.Item>
          <Form.Item
            name="instruction"
            label="指令词"
            rules={[{ required: true, message: "请输入指令词" }]}
            className={styles.fullWidth}
          >
            <Input.TextArea rows={3} placeholder="描述该任务执行的内容" />
          </Form.Item>
          <Form.Item
            name="channels"
            label="推送渠道"
            rules={[{ required: true, message: "请选择至少一个渠道" }]}
            className={styles.fullWidth}
          >
            <Checkbox.Group>
              <Space wrap>
                <Checkbox value="wechat">企业微信</Checkbox>
                <Checkbox value="email">邮件</Checkbox>
                <Checkbox value="inbox">站内消息</Checkbox>
              </Space>
            </Checkbox.Group>
          </Form.Item>
        </div>

        <Form.Item label="预览" className={styles.fullWidth}>
          <Input.TextArea
            rows={3}
            readOnly
            value={`${draft.name} · ${draft.schedule} · ${draft.channels.length} 个渠道`}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
}
