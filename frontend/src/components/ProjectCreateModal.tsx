import { CalendarOutlined, DownOutlined, EnvironmentOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select } from "antd";
import { useState } from "react";
import { defaultCreatedProject, type CreatedProject } from "./projectFormDefaults";
import styles from "./ProjectsPage.module.css";

interface ProjectCreateModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export function ProjectCreateModal({ open, onCancel, onSubmit }: ProjectCreateModalProps) {
  const [form] = Form.useForm<CreatedProject>();
  const [isMoreParamsOpen, setIsMoreParamsOpen] = useState(false);

  function handleAfterOpenChange(visible: boolean) {
    if (visible) {
      form.setFieldsValue(defaultCreatedProject);
      setIsMoreParamsOpen(false);
    }
  }

  return (
    <Modal
      className={styles.createModal}
      closeIcon={null}
      footer={null}
      maskClosable={false}
      onCancel={onCancel}
      open={open}
      width={980}
      afterOpenChange={handleAfterOpenChange}
    >
      <header className={styles.modalTitle}>
        <button aria-label="关闭新增项目" type="button" onClick={onCancel}>
          ×
        </button>
        <span>新增项目</span>
      </header>

      <Form form={form} className={styles.createForm} layout="horizontal" labelCol={{ flex: "120px" }} wrapperCol={{ flex: 1 }} initialValues={defaultCreatedProject} onFinish={onSubmit}>
        <Form.Item name="name" label="项目名称" rules={[{ required: true, message: "请输入项目名称" }]}>
          <Input autoFocus />
        </Form.Item>

        <div className={styles.formRow}>
          <Form.Item name="projectType" label="项目类型">
            <Input placeholder="请输出项目类型" />
          </Form.Item>
          <Form.Item name="region" label="地区">
            <Select
              placeholder="请选择区域"
              options={[
                { value: "上海市 / 静安区 / 彭浦镇", label: "上海市 / 静安区 / 彭浦镇" },
                { value: "上海市 / 浦东新区 / 张江镇", label: "上海市 / 浦东新区 / 张江镇" },
                { value: "上海市 / 黄浦区 / 南京东路街道", label: "上海市 / 黄浦区 / 南京东路街道" },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item name="projectScene" label="项目场景">
          <Input className={styles.halfControl} placeholder="请输出场景" />
        </Form.Item>

        <Form.Item name="address" label="项目地址" rules={[{ required: true, message: "请输入项目地址" }]}>
          <Input suffix={<EnvironmentOutlined />} />
        </Form.Item>

        <button className={styles.moreButton} type="button" onClick={() => setIsMoreParamsOpen((value) => !value)}>
          更多参数设置 {isMoreParamsOpen ? <UpOutlined /> : <DownOutlined />}
        </button>

        {isMoreParamsOpen && (
          <div className={styles.moreParams}>
            <Form.Item name="stage" label="项目当前阶段" rules={[{ required: true, message: "请选择项目当前阶段" }]}>
              <Select options={[{ value: "储备阶段", label: "储备阶段" }]} />
            </Form.Item>
            <Form.Item name="code" label="项目编码">
              <Input placeholder="请输入项目编码" />
            </Form.Item>
            <Form.Item name="startDate" label="项目启动日期" rules={[{ required: true, message: "请输入项目启动日期" }]}>
              <Input suffix={<CalendarOutlined />} />
            </Form.Item>
            <Form.Item name="siteOwner" label="场地业主单位">
              <Input placeholder="请输入场地业主单位" />
            </Form.Item>
            <Form.Item name="investor" label="投资单位">
              <Input placeholder="请输入投资单位" />
            </Form.Item>
            <Form.Item className={styles.remarkItem} name="remark" label="项目备注说明">
              <Input.TextArea maxLength={200} rows={5} showCount />
            </Form.Item>
          </div>
        )}

        <div className={styles.modalActions}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit">
            确定
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
