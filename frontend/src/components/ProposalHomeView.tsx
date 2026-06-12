import {
  AudioOutlined,
  CheckCircleFilled,
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  DislikeOutlined,
  FilePptOutlined,
  FileTextOutlined,
  LoadingOutlined,
  PaperClipOutlined,
  PlusOutlined,
  SendOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { App as AntApp, Button, Input, Tag } from "antd";
import { useState, type ReactNode } from "react";
import {
  findProposalConversationById,
  proposalHistoryConversations,
  proposalProjectGroups,
  type ProposalFormValues,
  type ProposalHistoryConversation,
  type ProposalHistoryResult,
  type ProposalHistoryStep,
  type ProposalHistoryTurn,
} from "./proposalData";
import type { ProposalPreviewItem } from "./ProposalPreviewView";
import { ProposalPreviewView } from "./ProposalPreviewView";
import type { ProposalChatMessage } from "./proposalWorkflow";
import resultStyles from "./ProposalResult.module.css";
import styles from "./ProposalPage.module.css";

interface ProposalHomeViewProps {
  generationMessages?: ProposalChatMessage[];
  generationStatus?: "streaming" | "done";
  generatedValues?: ProposalFormValues;
  composerText: string;
  previewItem: ProposalPreviewItem | null;
  isPreviewOpen: boolean;
  initialProjectId: string | null;
  initialConversationId: string | null;
  onOpenForm: () => void;
  onOpenDetail: () => void;
  onOpenAttachment: (attachment: ProposalHistoryResult["attachments"][number]) => void;
  onTogglePreview: () => void;
  onClosePreview: () => void;
  onOpenConversation: (conversation: ProposalHistoryConversation) => void;
  onStartNewConversation: () => void;
  onSubmitMessage: () => void;
  setComposerText: (value: string) => void;
}

export function ProposalHomeView({
  generationMessages = [],
  generationStatus,
  generatedValues,
  composerText,
  previewItem,
  isPreviewOpen,
  initialProjectId,
  initialConversationId,
  onOpenForm,
  onOpenDetail,
  onOpenAttachment,
  onTogglePreview,
  onClosePreview,
  onOpenConversation,
  onStartNewConversation,
  onSubmitMessage,
  setComposerText,
}: ProposalHomeViewProps) {
  const isGenerationMode = generationMessages.length > 0;

  function resolveInitialGroup() {
    if (initialProjectId) {
      const group = proposalProjectGroups.find((g) => g.projectId === initialProjectId);
      if (group) return group;
    }
    if (initialConversationId) {
      const conversation = findProposalConversationById(initialConversationId);
      if (conversation) {
        const group = proposalProjectGroups.find((g) => g.projectId === conversation.projectId);
        if (group) return group;
      }
    }
    return (
      proposalProjectGroups.find((g) => g.projectId !== "UNGROUPED") ??
      proposalProjectGroups[0] ??
      null
    );
  }

  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    const group = resolveInitialGroup();
    return group?.projectId ?? null;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    if (initialConversationId) {
      const exists = proposalHistoryConversations.some(
        (conversation) => conversation.id === initialConversationId,
      );
      if (exists) return initialConversationId;
    }
    const group = resolveInitialGroup();
    return group?.conversations[0]?.id ?? null;
  });

  const activeGroup =
    proposalProjectGroups.find((group) => group.projectId === activeProjectId) ??
    proposalProjectGroups[0] ??
    null;

  const activeConversation = activeConversationId
    ? findProposalConversationById(activeConversationId)
    : null;

  function handleSelectConversation(conversation: ProposalHistoryConversation) {
    setActiveConversationId(conversation.id);
    setActiveProjectId(conversation.projectId ?? activeProjectId);
    onOpenConversation(conversation);
  }

  function handleNewConversation() {
    setActiveConversationId(null);
    onStartNewConversation();
  }

  return (
    <section
      className={`${styles.page} ${
        previewItem ? (isPreviewOpen ? styles.pageWithPreview : styles.pageWithPreviewCollapsed) : ""
      }`}
      aria-label="定制方案生成页面"
    >
      <aside className={styles.conversationPanel} aria-label="对话">
        <div className={styles.conversationPanelHeader}>
          <Button
            className={styles.newConversationButton}
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleNewConversation}
            block
          >
            新对话
          </Button>
        </div>
        <div className={styles.conversationList}>
          {activeGroup?.conversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId;
            return (
              <button
                key={conversation.id}
                type="button"
                className={`${styles.conversationItem} ${
                  isActive ? styles.conversationItemActive : ""
                }`}
                onClick={() => handleSelectConversation(conversation)}
              >
                <span className={styles.conversationItemTitle}>{conversation.title}</span>
                <span className={styles.conversationItemMeta}>{conversation.updatedAt}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <main className={`${styles.chatPanel} ${isGenerationMode ? styles.chatPanelGenerated : ""}`}>
        {isGenerationMode ? (
          <GenerationConversation
            generationMessages={generationMessages}
            generationStatus={generationStatus}
            generatedValues={generatedValues}
            onOpenDetail={onOpenDetail}
          />
        ) : (
          <InitialConversation
            conversation={activeConversation}
            onOpenAttachment={onOpenAttachment}
            onSubmitMessage={onSubmitMessage}
            setComposerText={setComposerText}
          />
        )}

        <Composer
          composerText={composerText}
          setComposerText={setComposerText}
          isGenerationMode={isGenerationMode}
          onOpenForm={onOpenForm}
          onSubmitMessage={onSubmitMessage}
        />
      </main>

      {previewItem ? (
        <ProposalPreviewView
          item={previewItem}
          isOpen={isPreviewOpen}
          onToggle={onTogglePreview}
          onClose={onClosePreview}
        />
      ) : null}
    </section>
  );
}

function GenerationConversation({
  generationMessages,
  generationStatus,
  generatedValues,
  onOpenDetail,
}: {
  generationMessages: ProposalChatMessage[];
  generationStatus?: "streaming" | "done";
  generatedValues?: ProposalFormValues;
  onOpenDetail: () => void;
}) {
  return (
    <div className={resultStyles.generatedConversation}>
      {generationMessages.map((item) => (
        <article
          className={item.role === "user" ? resultStyles.resultUserMessage : resultStyles.resultAssistantMessage}
          key={item.id}
        >
          {item.role === "assistant" ? <div className={resultStyles.resultAssistantIcon}>▣</div> : null}
          <div className={resultStyles.resultMessageBody}>
            <div className={resultStyles.resultAuthor}>{item.role === "user" ? "你" : "qwen3.6-plus"}</div>
            {item.content ? (
              <div className={resultStyles.resultText}>
                {item.content.split(/\r?\n/).map((line, index) => (
                  <p key={`${item.id}-${index}`}>{line || " "}</p>
                ))}
                {item.status === "streaming" ? <span className={resultStyles.streamCursor} /> : null}
              </div>
            ) : (
              <span className={resultStyles.cursorText}>正在生成...</span>
            )}
          </div>
        </article>
      ))}
      {generationStatus === "done" && generatedValues ? (
        <div className={resultStyles.resultLinkRow}>
          <div>
            <strong>{generatedValues.projectName} PPT 初稿已生成</strong>
            <p>点击链接后进入 PPT 详情页阅览、下载和编辑。</p>
          </div>
          <Button type="link" icon={<FilePptOutlined />} onClick={onOpenDetail}>
            查看并编辑 PPT 详情页
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function InitialConversation({
  conversation,
  onOpenAttachment,
  onSubmitMessage,
  setComposerText,
}: {
  conversation: ProposalHistoryConversation | null;
  onOpenAttachment: (attachment: ProposalHistoryResult["attachments"][number]) => void;
  onSubmitMessage: () => void;
  setComposerText: (value: string) => void;
}) {
  function handleQuickAction(turn: ProposalHistoryTurn) {
    setComposerText(turn.question);
    onSubmitMessage();
  }

  if (!conversation || conversation.turns.length === 0) {
    return <div className={styles.initialConversation} />;
  }

  return (
    <div className={styles.initialConversation}>
      {conversation.turns.map((turn) => (
        <article key={turn.id} className={styles.turnCard}>
          <header className={styles.turnQuestionRow}>
            <div className={styles.turnUserAvatar}>我</div>
            <div className={styles.turnQuestionBubble}>{turn.question}</div>
          </header>

          <section className={styles.turnAssistantBlock}>
            <div className={styles.turnAssistantHead}>
              <span className={styles.turnMeta}>{conversation.updatedAt}</span>
            </div>

            <div className={styles.turnSection}>
              <h4 className={styles.turnSectionTitle}>思考过程</h4>
              <p className={styles.turnThinking}>{turn.thinking}</p>
            </div>

            <div className={styles.turnSection}>
              <h4 className={styles.turnSectionTitle}>执行步骤</h4>
              <ol className={styles.turnStepList}>
                {turn.steps.map((step, index) => (
                  <StepRow key={step.title} step={step} index={index + 1} />
                ))}
              </ol>
            </div>

            <div className={styles.turnSection}>
              <h4 className={styles.turnSectionTitle}>输出结果</h4>
              <ResultBlock turn={turn} onOpenAttachment={onOpenAttachment} />
            </div>
          </section>

          {conversation.id === "HIST-003" && turn === conversation.turns[0] ? (
            <div className={styles.quickActions}>
              <Button
                className={styles.quickActionButton}
                type="default"
                icon={<ThunderboltOutlined />}
                onClick={() => handleQuickAction(turn)}
              >
                重新生成翻新方案PPT
              </Button>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function StepRow({ step, index }: { step: ProposalHistoryStep; index: number }) {
  const statusMeta: Record<ProposalHistoryStep["status"], { text: string; color: string; icon: ReactNode }> = {
    finish: { text: "已完成", color: "success", icon: <CheckCircleFilled /> },
    process: { text: "进行中", color: "processing", icon: <LoadingOutlined /> },
    wait: { text: "待开始", color: "default", icon: <CheckOutlined /> },
  };
  const meta = statusMeta[step.status];
  return (
    <li className={styles.turnStepItem}>
      <span className={styles.turnStepIndex}>{index}</span>
      <div className={styles.turnStepBody}>
        <div className={styles.turnStepHead}>
          <span className={styles.turnStepTitle}>{step.title}</span>
          <Tag color={meta.color} icon={meta.icon} className={styles.turnStepTag}>
            {meta.text}
          </Tag>
        </div>
        <p className={styles.turnStepDetail}>{step.detail}</p>
      </div>
    </li>
  );
}

function ResultBlock({
  turn,
  onOpenAttachment,
}: {
  turn: ProposalHistoryTurn;
  onOpenAttachment: (attachment: ProposalHistoryResult["attachments"][number]) => void;
}) {
  const { message: messageApi } = AntApp.useApp();
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  function handleCopy() {
    void navigator.clipboard
      ?.writeText(turn.result.summary)
      .then(() => messageApi.success("已复制结果摘要"))
      .catch(() => messageApi.warning("复制失败，请手动选择文本"));
  }

  function handleFeedback(next: "like" | "dislike") {
    setFeedback(next);
    messageApi.success(next === "like" ? "已记录为有用反馈" : "已记录为需改进反馈");
  }

  return (
    <div className={styles.turnResult}>
      <p className={styles.turnResultSummary}>{turn.result.summary}</p>
      <ul className={styles.turnHighlightList}>
        {turn.result.highlights.map((item) => (
          <li key={item} className={styles.turnHighlightItem}>
            <span className={styles.turnHighlightDot} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {turn.result.attachments.length > 0 ? (
        <div className={styles.turnAttachmentList}>
          {turn.result.attachments.map((file) => (
            <button
              key={file.name}
              type="button"
              className={styles.turnAttachment}
              onClick={() => onOpenAttachment(file)}
            >
              <PaperClipOutlined />
              <span className={styles.turnAttachmentName}>{file.name}</span>
              <Tag color="blue" className={styles.turnAttachmentType}>
                {file.type}
              </Tag>
            </button>
          ))}
        </div>
      ) : null}
      <div className={styles.turnFeedbackRow}>
        <span className={styles.turnFeedbackLabel}>这个结果对你有帮助吗？</span>
        <div className={styles.turnFeedbackButtons}>
          <Button
            size="small"
            type={feedback === "like" ? "primary" : "default"}
            icon={<CheckOutlined />}
            onClick={() => handleFeedback("like")}
          >
            有帮助
          </Button>
          <Button
            size="small"
            type={feedback === "dislike" ? "primary" : "default"}
            danger={feedback === "dislike"}
            icon={<DislikeOutlined />}
            onClick={() => handleFeedback("dislike")}
          >
            需要改进
          </Button>
          <Button size="small" icon={<CopyOutlined />} onClick={handleCopy}>
            复制摘要
          </Button>
          <Button size="small" icon={<CloseOutlined />} aria-label="收起" />
        </div>
      </div>
    </div>
  );
}

interface ComposerProps {
  composerText: string;
  setComposerText: (value: string) => void;
  isGenerationMode: boolean;
  onOpenForm: () => void;
  onSubmitMessage: () => void;
}

function Composer({ composerText, setComposerText, isGenerationMode, onOpenForm, onSubmitMessage }: ComposerProps) {
  return (
    <div className={styles.composer}>
      <div className={styles.composerTools} aria-label="对话输入操作">
        <Button type="text" icon={<PaperClipOutlined />} aria-label="上传文件" />
        {!isGenerationMode ? (
          <Button
            type="text"
            icon={<FileTextOutlined />}
            aria-label="填写表单"
            onClick={onOpenForm}
          />
        ) : null}
        <Button type="text" icon={<AudioOutlined />} aria-label="语音输入" />
      </div>
      <Input.TextArea
        autoSize={{ minRows: 3, maxRows: 6 }}
        placeholder="输入客户需求、项目线索或销售材料任务，例如：基于上海富居商业楼资料生成翻新方案 PPT"
        value={composerText}
        variant="borderless"
        onChange={(event) => setComposerText(event.target.value)}
        onPressEnter={(event) => {
          if (event.shiftKey) return;
          event.preventDefault();
          onSubmitMessage();
        }}
      />
      <Button type="primary" icon={<SendOutlined />} onClick={onSubmitMessage}>
        发送
      </Button>
    </div>
  );
}