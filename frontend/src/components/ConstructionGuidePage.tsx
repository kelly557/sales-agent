import {
  Button,
  App as AntApp,
  Descriptions,
  Form,
  Input,
  Modal,
  Select,
  Steps,
  Table,
  Upload,
} from "antd";
import {
  AudioOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  SendOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { ConstructionGuideResultPanel } from "./ConstructionGuideResultPanel";
import {
  guideDocumentSections,
  guideProjects,
  guideToolRows,
  initialGuideValues,
  type GuideFormValues,
} from "./constructionGuideData";
import styles from "./ConstructionGuidePage.module.css";

interface ResultViewProps {
  summary: string;
  onReset: () => void;
}

interface FormViewProps {
  currentStep: number;
  isGenerating: boolean;
  onGenerate: (values: GuideFormValues) => void;
  onChange: () => void;
}

interface HomeViewProps {
  onOpenForm: () => void;
  onSubmitMessage: () => void;
}

export function ConstructionGuidePage() {
  const { message: messageApi } = AntApp.useApp();
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedSummary, setGeneratedSummary] = useState(initialGuideValues.projectName);

  function handleGenerate(values: GuideFormValues) {
    setIsGenerating(true);
    window.setTimeout(() => {
      setIsGenerating(false);
      setIsFormOpen(false);
      setIsGenerated(true);
      setCurrentStep(2);
      setGeneratedSummary(values.projectName);
      messageApi.success(`已生成 ${values.guideType}`);
    }, 450);
  }

  function handleReset() {
    setIsGenerated(false);
    setCurrentStep(0);
  }

  if (isGenerated) {
    return <GuideResultView summary={generatedSummary} onReset={handleReset} />;
  }

  return (
    <>
      <GuideHomeView
        onOpenForm={() => setIsFormOpen(true)}
        onSubmitMessage={() => messageApi.success("建议先填写表单，系统会按参数生成指导书初稿")}
      />
      <Modal
        centered
        width="min(960px, calc(100vw - 48px))"
        title="填写施工作业参数"
        open={isFormOpen}
        onCancel={() => setIsFormOpen(false)}
        footer={null}
      >
        {isFormOpen ? (
          <GuideFormView
            currentStep={currentStep}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            onChange={() => setCurrentStep(0)}
          />
        ) : null}
      </Modal>
    </>
  );
}

function GuideHomeView({ onOpenForm, onSubmitMessage }: HomeViewProps) {
  return (
    <section className={styles.homePage} aria-label="施工作业指导书对话页面">
      <aside className={styles.projectPanel}>
        <Button className={styles.newProjectButton} type="primary">
          新建指导书
        </Button>
        <Input placeholder="搜索指导书项目" />
        <div className={styles.projectList}>
          {guideProjects.map((item) => (
            <button key={item} type="button">
              {item}
            </button>
          ))}
        </div>
      </aside>
      <main className={styles.chatPanel}>
        <div className={styles.notice}>推荐使用表单录入项目、工序、基层和安全要求，生成更完整的施工作业指导书。</div>
        <div className={styles.messageRow}>
          <div className={styles.avatar} />
          <div>
            <div className={styles.sender}>指导书助手</div>
            <div className={styles.message}>
              <p>我将根据现场条件生成可编辑的施工作业指导书初稿。建议先点击“填写表单”。</p>
              <p>1. 项目信息：项目名称、施工区域、指导书类型和计划工期。</p>
              <p>2. 作业条件：基层状态、涂装体系、材料资料和现场照片。</p>
              <p>3. 控制要求：质量验收、安全边界、停工条件和复核项。</p>
              <p>4. 生成结果：正文初稿、材料用量表、关联资料和待复核清单。</p>
            </div>
          </div>
        </div>
        <div className={styles.composerWrap}>
          <Button className={styles.formButton} type="primary" onClick={onOpenForm}>
            填写表单
          </Button>
          <div className={styles.composer}>
            <Input placeholder="例如：主楼南立面外墙翻新，旧涂层粉化，需要吊篮施工..." variant="borderless" />
            <Button type="text" icon={<FileTextOutlined />} aria-label="文档输入" />
            <Button type="text" icon={<AudioOutlined />} aria-label="语音输入" />
            <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={onSubmitMessage} aria-label="发送" />
          </div>
        </div>
      </main>
    </section>
  );
}

function GuideResultView({ summary, onReset }: ResultViewProps) {
  return (
    <section className={styles.resultPage} aria-label="施工作业指导书生成结果">
      <div className={styles.editorShell}>
        <div className={styles.toolbar} aria-label="文档编辑工具栏">
          {["撤销", "重做", "样式", "加粗", "列表", "表格", "批注"].map((item) => (
            <button key={item} type="button">
              {item}
            </button>
          ))}
        </div>
        <article className={styles.documentCanvas}>
          <h1>{summary}施工作业指导书</h1>
          {guideDocumentSections.map((section) => (
            <p key={section}>{section}</p>
          ))}
          <Table
            size="small"
            pagination={false}
            columns={[
              { title: "作业环节", dataIndex: "item" },
              { title: "材料或工具", dataIndex: "material" },
              { title: "估算用量", dataIndex: "amount" },
              { title: "控制要点", dataIndex: "note" },
            ]}
            dataSource={guideToolRows}
          />
        </article>
      </div>
      <ConstructionGuideResultPanel onReset={onReset} />
    </section>
  );
}

function GuideFormView({ currentStep, isGenerating, onGenerate, onChange }: FormViewProps) {
  const [form] = Form.useForm<GuideFormValues>();

  return (
    <section className={styles.formBody} aria-label="施工作业指导书表单">
      <div className={styles.formHeader}>
        <div>
          <h1>施工作业指导书</h1>
          <p>填写项目、工序、基层和安全要求，提交后生成可编辑的施工作业指导书初稿。</p>
        </div>
        <Steps
          className={styles.steps}
          size="small"
          current={currentStep}
          items={[{ title: "录入参数" }, { title: "资料校验" }, { title: "生成初稿" }]}
        />
      </div>

      <Form form={form} layout="vertical" initialValues={initialGuideValues} onFinish={onGenerate} onValuesChange={onChange}>
        <div className={styles.formGrid}>
          <Form.Item name="projectName" label="项目名称" rules={[{ required: true, message: "请输入项目名称" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="guideType" label="指导书类型" rules={[{ required: true, message: "请选择指导书类型" }]}>
            <Select
              options={[
                { value: "外墙涂装施工作业指导书", label: "外墙涂装施工作业指导书" },
                { value: "工业地坪施工作业指导书", label: "工业地坪施工作业指导书" },
                { value: "内墙翻新施工作业指导书", label: "内墙翻新施工作业指导书" },
              ]}
            />
          </Form.Item>
          <Form.Item name="workArea" label="施工区域" rules={[{ required: true, message: "请输入施工区域" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="coatingSystem" label="推荐涂装体系" rules={[{ required: true, message: "请输入涂装体系" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="baseCondition" label="基层条件" className={styles.fullWidth} rules={[{ required: true, message: "请输入基层条件" }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="safetyRequirement" label="安全与停工边界" className={styles.fullWidth} rules={[{ required: true, message: "请输入安全要求" }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </div>

        <div className={styles.materialPanel}>
          <Descriptions bordered size="small" column={3} items={[
            { key: "area", label: "涂装面积", children: "18,600 m2" },
            { key: "period", label: "计划工期", children: "28 天" },
            { key: "weather", label: "环境限制", children: "雨天停工" },
          ]} />
          <Upload className={styles.upload} beforeUpload={() => false} maxCount={3}>
            <Button icon={<UploadOutlined />}>上传现场照片或材料清单</Button>
          </Upload>
        </div>

        <div className={styles.formActions}>
          <Button onClick={() => form.resetFields()}>恢复示例</Button>
          <Button type="primary" htmlType="submit" loading={isGenerating} icon={<FileDoneOutlined />}>
            提交生成
          </Button>
        </div>
      </Form>
    </section>
  );
}
