import { AudioOutlined, CloseOutlined, PlusOutlined, SendOutlined, SolutionOutlined } from "@ant-design/icons";
import { Button, Dropdown, Input, Space } from "antd";
import { proposalTemplates, type ProposalTemplate } from "./proposalData";
import styles from "./AssistantPage.module.css";

type Mode = "home" | "solution";

interface AssistantHomeViewProps {
  prompt: string;
  isSubmitting: boolean;
  mode: Mode;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  onPickQuickTask: (task: "solution") => void;
  onUploadClick: () => void;
  onRemoveSolutionMode: () => void;
  onOpenRequirementForm: () => void;
  onPickTemplate: (template: ProposalTemplate) => void;
  onPickPageCount: () => void;
}

export function AssistantHomeView({
  prompt,
  isSubmitting,
  mode,
  onPromptChange,
  onSubmit,
  onPickQuickTask,
  onUploadClick,
  onRemoveSolutionMode,
  onOpenRequirementForm,
  onPickTemplate,
  onPickPageCount,
}: AssistantHomeViewProps) {
  const isSolutionMode = mode === "solution";

  return (
    <section className={styles.welcomePage} aria-label="AI 销售助手首页">
      <div className={styles.welcomeHeader}>
        <div className={styles.welcomeLogo} aria-hidden="true">
          <SolutionOutlined />
        </div>
        <h1 className={styles.welcomeGreeting}>你好，我是您的专业销售助手</h1>
      </div>

      <div className={styles.welcomeComposer}>
        <Input.TextArea
          className={styles.welcomeInput}
          autoSize={{ minRows: 3, maxRows: 8 }}
          placeholder={isSolutionMode ? "请输出主题并填写需求表单" : "向我提问或者点击任务"}
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          onPressEnter={(event) => {
            if (event.shiftKey) return;
            event.preventDefault();
            onSubmit();
          }}
        />

        <div className={styles.welcomeComposerBar}>
          <div className={styles.quickTasks} aria-label="快捷任务">
            <Button
              type="text"
              className={styles.quickTaskAdd}
              icon={<PlusOutlined />}
              aria-label="上传文件"
              onClick={onUploadClick}
            />

            {isSolutionMode ? (
              <>
                <Button
                  type="text"
                  className={`${styles.quickTask} ${styles.quickTaskActive}`}
                  icon={<SolutionOutlined />}
                  onClick={onRemoveSolutionMode}
                >
                  <Space size={4} align="center">
                    <span>解决方案PPT</span>
                    <CloseOutlined className={styles.quickTaskClose} />
                  </Space>
                </Button>
                <Button
                  type="text"
                  className={styles.quickTask}
                  onClick={onOpenRequirementForm}
                >
                  需求表单
                </Button>
                <Button
                  type="text"
                  className={styles.quickTask}
                  onClick={onPickPageCount}
                >
                  页数
                </Button>
              </>
            ) : (
              <Button
                type="text"
                className={styles.quickTask}
                icon={<SolutionOutlined />}
                onClick={() => onPickQuickTask("solution")}
              >
                解决方案PPT
              </Button>
            )}

            <Dropdown
              trigger={["click"]}
              placement="topRight"
              menu={{
                items: [
                  { key: "construction", label: "施工作业指导书", disabled: true },
                  { key: "promotion", label: "产品推广文件", disabled: true },
                  { key: "engineering", label: "工程计算", disabled: true },
                  { key: "review", label: "智能审查", disabled: true },
                ],
              }}
            >
              <Button type="text" className={styles.quickTask}>
                更多
              </Button>
            </Dropdown>
          </div>

          <div className={styles.composerActions}>
            {isSolutionMode ? (
              <Button type="primary" className={styles.composerSendText} onClick={onSubmit} loading={isSubmitting}>
                发送
              </Button>
            ) : (
              <>
                <Button
                  type="text"
                  shape="circle"
                  icon={<AudioOutlined />}
                  aria-label="语音输入"
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<SendOutlined />}
                  loading={isSubmitting}
                  onClick={onSubmit}
                  aria-label="发送"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {isSolutionMode ? (
        <div className={styles.templateSuggestions} aria-label="方案模版推荐">
          {proposalTemplates.map((template) => (
            <Button
              key={template.id}
              type="text"
              className={`${styles.templateTag} ${template.recommended ? styles.templateTagRecommended : ""}`}
              onClick={() => onPickTemplate(template)}
            >
              {template.name}
            </Button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
