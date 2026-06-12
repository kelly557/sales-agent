import { App as AntApp, Modal } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { AssistantChatView, AssistantComposer } from "./AssistantChatView";
import { AssistantHomeView } from "./AssistantHomeView";
import { ProposalFormView } from "./ProposalFormView";
import { type ProposalFormValues, type ProposalTemplate } from "./proposalData";
import { useAssistantStream, type StreamMessage as HookStreamMessage } from "./useAssistantStream";
import styles from "./AssistantPage.module.css";

export type ChatMessage = HookStreamMessage;

export interface AssistantConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface AssistantDraftConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
}

interface AssistantPageProps {
  conversations: AssistantConversation[];
  activeConversationId: string | null;
  activeConversation: AssistantConversation | null;
  onConversationChange: (conversation: AssistantDraftConversation) => void;
  onOpenConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string, nextTitle: string) => void;
  onDeleteConversation: (conversationId: string) => void;
}

export function AssistantPage({
  conversations,
  activeConversationId,
  activeConversation,
  onConversationChange,
  onOpenConversation,
  onRenameConversation,
  onDeleteConversation,
}: AssistantPageProps) {
  void conversations;
  void activeConversationId;
  void onOpenConversation;
  void onRenameConversation;
  void onDeleteConversation;
  const { message: messageApi } = AntApp.useApp();
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversationId, setConversationId] = useState<string>(() => crypto.randomUUID());
  const [conversationTitle, setConversationTitle] = useState("新项目");
  const [homeMode, setHomeMode] = useState<"home" | "solution">("home");
  const [isRequirementFormOpen, setIsRequirementFormOpen] = useState(false);
  const [isPageCountOpen, setIsPageCountOpen] = useState(false);
  const [draftProposalValues, setDraftProposalValues] = useState<ProposalFormValues | null>(null);
  void draftProposalValues;
  const conversationIdRef = useRef(conversationId);
  const conversationTitleRef = useRef(conversationTitle);
  const { streamAnswer, setActiveMessageId } = useAssistantStream(setChatMessages);

  function handleEnterSolutionMode() {
    setHomeMode("solution");
    setAssistantPrompt("");
  }

  function handleExitSolutionMode() {
    setHomeMode("home");
  }

  function handleOpenRequirementForm() {
    setDraftProposalValues(null);
    setIsRequirementFormOpen(true);
  }

  function handleProposalGenerate(values: ProposalFormValues) {
    setDraftProposalValues(values);
    setAssistantPrompt(
      `主题：${values.projectName}\n场景：${values.scenario}\n体系：${values.coatingSystem}\n模板：${values.template}\n页数：${values.language ? "中文" : ""}`,
    );
    setIsRequirementFormOpen(false);
    messageApi.success("需求表单已写入主题与方案描述，可在输入框继续补充。");
  }

  function handlePickTemplate(template: ProposalTemplate) {
    const next = `请按 ${template.name}（${template.description}）生成定制方案 PPT。`;
    setAssistantPrompt(next);
    messageApi.info(`已选择模板：${template.name}`);
  }

  function handlePickPageCount() {
    setIsPageCountOpen(true);
  }

  type PageCountOption = {
  key: string;
  label: string;
  range: string | null;
};

const PAGE_COUNT_OPTIONS: PageCountOption[] = [
  { key: "unlimited", label: "页数不限", range: null },
  { key: "1-10", label: "1-10 页", range: "1-10" },
  { key: "10-20", label: "10-20 页", range: "10-20" },
  { key: "20-30", label: "20-30 页", range: "20-30" },
  { key: "30+", label: "30 页以上", range: "30+" },
];

function handleSelectPageCount(option: PageCountOption) {
    const segment = option.range ? `${option.range} 页` : "页数不限";
    setAssistantPrompt((current) => `${current}${current ? "\n" : ""}页数：商务汇报型 ${segment}`);
    setIsPageCountOpen(false);
    messageApi.success(`已选择：${option.label}`);
  }

  const hasMessages = chatMessages.length > 0;
  const latestError = useMemo(
    () => [...chatMessages].reverse().find((item) => item.status === "error"),
    [chatMessages],
  );

  function handleNewChat() {
    setActiveMessageId(null);
    setAssistantPrompt("");
    setChatMessages([]);
    setIsChatOpen(false);
    setIsSubmitting(false);
    setHomeMode("home");
    setIsRequirementFormOpen(false);
    setIsPageCountOpen(false);
    const nextConversationId = crypto.randomUUID();
    setConversationId(nextConversationId);
    setConversationTitle("新项目");
    conversationIdRef.current = nextConversationId;
    conversationTitleRef.current = "新项目";
  }

  useEffect(() => {
    window.addEventListener("doctech:new-assistant-chat", handleNewChat);
    return () => window.removeEventListener("doctech:new-assistant-chat", handleNewChat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!activeConversation) return;
    setConversationId(activeConversation.id);
    setConversationTitle(activeConversation.title);
    conversationIdRef.current = activeConversation.id;
    conversationTitleRef.current = activeConversation.title;
    setChatMessages(activeConversation.messages);
    setIsChatOpen(true);
    setAssistantPrompt("");
  }, [activeConversation]);
  useEffect(() => {
    if (chatMessages.length === 0) return;
    onConversationChange({ id: conversationId, title: conversationTitle, messages: chatMessages });
  }, [chatMessages, conversationId, conversationTitle, onConversationChange]);

  async function handleAssistantSubmit() {
    const prompt = assistantPrompt.trim();
    if (!prompt) {
      messageApi.warning("请输入要交给 AI 助手处理的工程文档任务");
      return;
    }
    const { userMessage, assistantMessage, nextMessages, nextTitle } = prepareSubmitState(prompt);
    setActiveMessageId(assistantMessage.id);
    conversationTitleRef.current = nextTitle;
    setConversationTitle(nextTitle);
    setIsChatOpen(true);
    setIsSubmitting(true);
    setAssistantPrompt("");
    setChatMessages(nextMessages);
    try {
      await streamAnswer([...chatMessages, userMessage], assistantMessage.id);
      setChatMessages((messages) =>
        messages.map((item) =>
          item.id === assistantMessage.id ? { ...item, status: "done" as const } : item,
        ),
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "AI 助手连接失败";
      messageApi.error(errorMessage);
      markAssistantError(assistantMessage.id, errorMessage);
    } finally {
      setActiveMessageId(null);
      setIsSubmitting(false);
    }
  }

  function prepareSubmitState(prompt: string) {
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: prompt };
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      status: "streaming",
    };
    const nextMessages = [...chatMessages, userMessage, assistantMessage];
    const nextTitle = chatMessages.length === 0 ? summarizeQuestion(prompt) : conversationTitle;
    return { userMessage, assistantMessage, nextMessages, nextTitle };
  }

  function markAssistantError(messageId: string, errorMessage: string) {
    setChatMessages((messages) =>
      messages.map((item) =>
        item.id === messageId
          ? { ...item, content: `调用失败：${errorMessage}`, status: "error" as const }
          : item,
      ),
    );
  }

  return (
    <div className={styles.assistantLayout}>
      <div className={styles.assistantMain}>
        {isChatOpen || hasMessages ? (
          <AssistantChatView
            title={conversationTitle}
            messages={chatMessages}
            latestError={latestError}
            composerSlot={
              <AssistantComposer
                prompt={assistantPrompt}
                isSubmitting={isSubmitting}
                onPromptChange={setAssistantPrompt}
                onSubmit={() => void handleAssistantSubmit()}
                className="chat-mode"
              />
            }
          />
        ) : (
          <AssistantHomeView
            prompt={assistantPrompt}
            isSubmitting={isSubmitting}
            mode={homeMode}
            onPromptChange={setAssistantPrompt}
            onSubmit={() => void handleAssistantSubmit()}
            onPickQuickTask={() => handleEnterSolutionMode()}
            onUploadClick={() => {
              messageApi.info("上传文件功能正在接入，预计下个版本上线。");
            }}
            onRemoveSolutionMode={handleExitSolutionMode}
            onOpenRequirementForm={handleOpenRequirementForm}
            onPickTemplate={handlePickTemplate}
            onPickPageCount={handlePickPageCount}
          />
        )}

        <Modal
          open={isRequirementFormOpen}
          title="定制方案 PPT 需求表单"
          footer={null}
          width="min(960px, calc(100vw - 48px))"
          onCancel={() => setIsRequirementFormOpen(false)}
          destroyOnClose
        >
          <ProposalFormView isGenerating={false} onGenerate={handleProposalGenerate} />
        </Modal>

        <Modal
          open={isPageCountOpen}
          title="选择方案页数"
          footer={null}
          width="min(360px, calc(100vw - 48px))"
          onCancel={() => setIsPageCountOpen(false)}
          destroyOnClose
        >
          <div className={styles.pageCountList} aria-label="页数选项">
            {PAGE_COUNT_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={styles.pageCountRow}
                onClick={() => handleSelectPageCount(option)}
              >
                <span className={styles.pageCountLabel}>{option.label}</span>
                <CheckOutlined className={styles.pageCountCheck} />
              </button>
            ))}
          </div>
        </Modal>
      </div>
    </div>
  );
}

function summarizeQuestion(question: string) {
  const normalized = question
    .replace(/[，。！？、,.!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const stripped = normalized.replace(/^(请|帮我|帮忙|我要|我想|查询|生成|检查|整理|计算)\s*/u, "");
  return (stripped || normalized || "新项目").slice(0, 18);
}
