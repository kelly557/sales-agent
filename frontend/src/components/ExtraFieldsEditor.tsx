import { DeleteOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { App as AntApp, Button, Input, InputNumber, Radio, Space, Tag } from "antd";
import { useState } from "react";

export interface ExtraField {
  id: string;
  name: string;
  type: "text" | "number";
  value: string;
}

interface ExtraFieldsEditorProps {
  fields: ExtraField[];
  onChange: (fields: ExtraField[]) => void;
}

export function ExtraFieldsEditor({ fields, onChange }: ExtraFieldsEditorProps) {
  const { message: messageApi } = AntApp.useApp();
  const [draftType, setDraftType] = useState<"text" | "number">("text");
  const [draftName, setDraftName] = useState("");
  const [draftValue, setDraftValue] = useState("");

  function addField() {
    const name = draftName.trim();
    if (!name) {
      messageApi.warning("请输入字段名称");
      return;
    }
    if (fields.some((field) => field.name === name)) {
      messageApi.warning("字段名称重复");
      return;
    }
    onChange([
      ...fields,
      { id: crypto.randomUUID(), name, type: draftType, value: draftValue },
    ]);
    setDraftName("");
    setDraftValue("");
  }

  function updateField(id: string, value: string) {
    onChange(fields.map((field) => (field.id === id ? { ...field, value } : field)));
  }

  function removeField(id: string) {
    onChange(fields.filter((field) => field.id !== id));
  }

  function saveAsTemplate() {
    try {
      const serialized = JSON.stringify(fields);
      localStorage.setItem("doctech:proposal-field-templates", serialized);
      messageApi.success("已保存当前字段为本地模板");
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "保存失败");
    }
  }

  return (
    <div>
      <Space wrap>
        {fields.length === 0 ? (
          <Tag color="default">尚未添加自定义字段</Tag>
        ) : (
          fields.map((field) => (
            <Space.Compact key={field.id}>
              <Tag color="blue" style={{ margin: 0, borderRadius: "6px 0 0 6px" }}>
                {field.name}
              </Tag>
              {field.type === "number" ? (
                <InputNumber
                  value={Number(field.value) || 0}
                  onChange={(value) => updateField(field.id, String(value ?? ""))}
                  style={{ width: 140 }}
                />
              ) : (
                <Input
                  value={field.value}
                  onChange={(event) => updateField(field.id, event.target.value)}
                  style={{ width: 200 }}
                />
              )}
              <Button icon={<DeleteOutlined />} onClick={() => removeField(field.id)} aria-label={`删除字段 ${field.name}`} />
            </Space.Compact>
          ))
        )}
      </Space>

      <Space.Compact style={{ marginTop: 12, display: "flex" }}>
        <Input
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          placeholder="字段名称"
          style={{ width: 160 }}
        />
        <Radio.Group
          value={draftType}
          onChange={(event) => setDraftType(event.target.value)}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="text">文本</Radio.Button>
          <Radio.Button value="number">数字</Radio.Button>
        </Radio.Group>
        <Input
          value={draftValue}
          onChange={(event) => setDraftValue(event.target.value)}
          placeholder="默认值"
          style={{ width: 160 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={addField}>
          添加字段
        </Button>
        <Button icon={<SaveOutlined />} onClick={saveAsTemplate}>
          另存为字段模板
        </Button>
      </Space.Compact>
    </div>
  );
}
