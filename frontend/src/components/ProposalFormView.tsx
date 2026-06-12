import { FilePptOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Form, Select, Space, Steps, Upload } from "antd";
import { useMemo, useState } from "react";
import {
  defaultProposalSchemaId,
  findProposalSchema,
  proposalFormSchemas,
  type ProposalFormField,
} from "../data/proposalFormSchema";
import { initialProposalValues, type ProposalFormValues } from "./proposalData";
import { DynamicField } from "./DynamicField";
import { ExtraFieldsEditor, type ExtraField } from "./ExtraFieldsEditor";
import styles from "./ProposalForm.module.css";

interface ProposalFormViewProps {
  isGenerating: boolean;
  onGenerate: (values: ProposalFormValues) => void;
}

export function ProposalFormView({ isGenerating, onGenerate }: ProposalFormViewProps) {
  const [form] = Form.useForm<ProposalFormValues>();
  const [schemaId, setSchemaId] = useState<string>(defaultProposalSchemaId);
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);

  const schema = useMemo(() => findProposalSchema(schemaId), [schemaId]);

  function handleSubmit() {
    form.validateFields().then((baseValues) => {
      const extraValues: Record<string, string> = {};
      extraFields.forEach((field) => {
        extraValues[field.name] = field.value;
      });
      onGenerate({ ...baseValues, ...extraValues } as ProposalFormValues);
    });
  }

  function handleSchemaChange(nextId: string) {
    setSchemaId(nextId);
  }

  function handleAddExtra() {
    setExtraFields((current) => [
      ...current,
      { id: crypto.randomUUID(), name: `字段${current.length + 1}`, type: "text", value: "" },
    ]);
  }

  return (
    <section className={styles.formPanel} aria-label="方案 PPT 参数表单">
      <div className={styles.formHeader}>
        <div>
          <h1>定制方案 PPT</h1>
          <p>填写项目、客户诉求、模板和资料，提交后生成方案 PPT 初稿与审批材料。</p>
        </div>
        <Steps
          className={styles.steps}
          size="small"
          current={isGenerating ? 2 : 0}
          items={[{ title: "录入参数" }, { title: "资料校验" }, { title: "生成 PPT" }]}
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialProposalValues}
        onFinish={handleSubmit}
      >
        <div className={styles.formGrid}>
          <Form.Item label="项目类型" className={styles.fullWidth}>
            <Space wrap>
              <Select
                value={schemaId}
                onChange={handleSchemaChange}
                options={proposalFormSchemas.map((schemaOption) => ({
                  value: schemaOption.id,
                  label: schemaOption.label,
                }))}
                style={{ minWidth: 220 }}
              />
              <span className={styles.formHint}>{schema.description}</span>
            </Space>
          </Form.Item>
          {schema.fields.map((field: ProposalFormField) => (
            <DynamicField key={field.key} field={field} />
          ))}
        </div>

        <div className={styles.formGrid}>
          <Form.Item label="自定义拓展字段" className={styles.fullWidth}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={handleAddExtra}
                style={{ alignSelf: "flex-start" }}
              >
                新增拓展字段
              </Button>
              <ExtraFieldsEditor fields={extraFields} onChange={setExtraFields} />
            </Space>
          </Form.Item>
        </div>

        <div className={styles.uploadPanel}>
          <Upload className={styles.upload} beforeUpload={() => false} maxCount={5}>
            <Button icon={<UploadOutlined />}>上传现场照片、检测报告或模板 PPT</Button>
          </Upload>
        </div>

        <div className={styles.formActions}>
          <Button onClick={() => form.resetFields()}>恢复示例</Button>
          <Button type="primary" htmlType="submit" loading={isGenerating} icon={<FilePptOutlined />}>
            提交生成 PPT
          </Button>
        </div>
      </Form>
    </section>
  );
}
