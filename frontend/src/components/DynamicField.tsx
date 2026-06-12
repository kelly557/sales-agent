import { Input, InputNumber, Select } from "antd";
import { Form } from "antd";
import type { ProposalFormField } from "../data/proposalFormSchema";
import styles from "./ProposalForm.module.css";

interface DynamicFieldProps {
  field: ProposalFormField;
}

export function DynamicField({ field }: DynamicFieldProps) {
  const rules = field.required ? [{ required: true, message: `请输入${field.label}` }] : undefined;
  const className = field.fullWidth ? styles.fullWidth : undefined;

  return (
    <Form.Item key={field.key} name={field.key} label={field.label} rules={rules} className={className}>
      {renderFieldInput(field)}
    </Form.Item>
  );
}

function renderFieldInput(field: ProposalFormField) {
  if (field.type === "select" && field.options) {
    return <Select placeholder={field.placeholder ?? `请选择${field.label}`} options={field.options} />;
  }
  if (field.type === "number") {
    return <InputNumber placeholder={field.placeholder ?? `请输入${field.label}`} style={{ width: "100%" }} />;
  }
  const isLongText = field.fullWidth === true && field.label.length > 4;
  if (isLongText) {
    return <Input.TextArea rows={3} placeholder={field.placeholder ?? `请输入${field.label}`} />;
  }
  return <Input placeholder={field.placeholder ?? `请输入${field.label}`} />;
}
