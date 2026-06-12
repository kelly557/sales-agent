import { FileTextOutlined, InboxOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Tag, message } from "antd";
import { useRef, useState } from "react";
import {
  templateTypeLabels,
  type TemplateSourceFile,
  type TemplateType,
} from "./templateData";
import styles from "./TemplateUploadModal.module.css";

interface TemplateUploadModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (template: {
    name: string;
    type: TemplateType;
    summary: string;
    tags: string[];
    sourceFile: TemplateSourceFile;
  }) => void;
}

interface UploadFormValues {
  name: string;
  type: TemplateType;
  summary?: string;
  tags?: string;
}

function detectKind(name: string): TemplateSourceFile["kind"] | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pptx")) return "pptx";
  if (lower.endsWith(".docx")) return "docx";
  return null;
}

function defaultValues() {
  return {
    type: "proposal" as TemplateType,
  };
}

export function TemplateUploadModal({ open, onCancel, onSubmit }: TemplateUploadModalProps) {
  const [form] = Form.useForm<UploadFormValues>();
  const [file, setFile] = useState<TemplateSourceFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function reset() {
    form.resetFields();
    setFile(null);
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleAfterOpenChange(visible: boolean) {
    if (visible) {
      form.setFieldsValue(defaultValues());
      setFile(null);
    }
  }

  function handleFiles(picked: FileList | null) {
    if (!picked || picked.length === 0) return;
    const target = picked[0];
    const kind = detectKind(target.name);
    if (!kind) {
      message.error("仅支持上传 .pptx 或 .docx 模板文件");
      return;
    }
    setFile({ name: target.name, size: target.size, kind });
    if (!form.getFieldValue("name")) {
      form.setFieldValue("name", target.name.replace(/\.(pptx|docx)$/i, ""));
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  function handleFinish(values: UploadFormValues) {
    if (!file) {
      message.error("请上传模板文件");
      return;
    }
    const tags = (values.tags ?? "")
      .split(/[,，;；\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);
    onSubmit({
      name: values.name.trim(),
      type: values.type,
      summary: values.summary?.trim() ?? "",
      tags,
      sourceFile: file,
    });
    reset();
  }

  function handleCancel() {
    reset();
    onCancel();
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  return (
    <Modal
      className={styles.modal}
      closeIcon={null}
      footer={null}
      maskClosable={false}
      open={open}
      width={720}
      onCancel={handleCancel}
      afterOpenChange={handleAfterOpenChange}
    >
      <header className={styles.title}>
        <button aria-label="关闭上传模板" type="button" onClick={handleCancel}>
          ×
        </button>
        <span>上传模板</span>
      </header>

      <Form
        form={form}
        className={styles.form}
        layout="horizontal"
        labelCol={{ flex: "100px" }}
        wrapperCol={{ flex: 1 }}
        initialValues={defaultValues()}
        onFinish={handleFinish}
      >
        <div
          className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {file ? (
            <div className={styles.fileInfo}>
              <FileTextOutlined className={styles.fileIcon} />
              <div className={styles.fileMeta}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <Tag color={file.kind === "pptx" ? "orange" : "blue"}>
                {file.kind.toUpperCase()}
              </Tag>
              <Button type="link" size="small" onClick={openFilePicker}>
                重新选择
              </Button>
            </div>
          ) : (
            <div
              className={styles.dropzonePrompt}
              role="button"
              tabIndex={0}
              onClick={openFilePicker}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openFilePicker();
                }
              }}
            >
              <InboxOutlined className={styles.dropzoneIcon} />
              <span>点击或拖拽 .pptx / .docx 文件到此处</span>
              <span className={styles.dropzoneHint}>仅支持 PowerPoint 与 Word 初始模板</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx,.docx"
            className={styles.fileInput}
            onChange={(event) => handleFiles(event.target.files)}
          />
        </div>

        <Form.Item
          name="name"
          label="模板名称"
          rules={[{ required: true, message: "请输入模板名称" }]}
        >
          <Input autoFocus placeholder="例如：商务汇报型定制方案 PPT 模板" />
        </Form.Item>

        <Form.Item name="type" label="类型">
          <Select options={toOptions(templateTypeLabels)} />
        </Form.Item>

        <Form.Item name="summary" label="模板说明">
          <Input.TextArea maxLength={160} rows={3} showCount placeholder="一句话说明模板用途" />
        </Form.Item>

        <Form.Item name="tags" label="标签">
          <Input placeholder="使用空格或逗号分隔" />
        </Form.Item>

        <div className={styles.actions}>
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" htmlType="submit">
            上传模板
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

function toOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

