import { App as AntApp, Modal } from "antd";
import { useEffect, useRef, useState } from "react";
import {
  initialProposalValues,
  type ProposalFormValues,
  type ProposalHistoryConversation,
} from "./proposalData";
import { ProposalFormView } from "./ProposalFormView";
import { ProposalHomeView } from "./ProposalHomeView";
import type { ProposalPreviewItem } from "./ProposalPreviewView";
import { ProposalResultView } from "./ProposalResultView";
import {
  buildProposalWorkflowChunks,
  type ProposalChatMessage,
} from "./proposalWorkflow";

type ProposalView = "home" | "generation" | "detail";

interface ProposalPageProps {
  initialProjectId?: string | null;
  initialConversationId?: string | null;
}

export function ProposalPage({
  initialProjectId,
  initialConversationId,
}: ProposalPageProps = {}) {
  const { message: messageApi } = AntApp.useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeView, setActiveView] = useState<ProposalView>("home");
  const [generationStatus, setGenerationStatus] = useState<"streaming" | "done">("done");
  const [generationMessages, setGenerationMessages] = useState<ProposalChatMessage[]>([]);
  const [generatedValues, setGeneratedValues] = useState<ProposalFormValues>(initialProposalValues);
  const [composerText, setComposerText] = useState("");
  const [previewItem, setPreviewItem] = useState<ProposalPreviewItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const activeAssistantMessageId = useRef<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  function handleGenerate(values: ProposalFormValues) {
    setIsGenerating(true);
    window.setTimeout(() => {
      const assistantMessageId = crypto.randomUUID();
      setIsGenerating(false);
      setIsFormOpen(false);
      setActiveView("generation");
      setGenerationStatus("streaming");
      setGeneratedValues(values);
      activeAssistantMessageId.current = assistantMessageId;
      setGenerationMessages([
        {
          id: crypto.randomUUID(),
          role: "user",
          content: `提交生成 PPT：${values.projectName}`,
        },
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          status: "streaming",
        },
      ]);
      void streamProposalWorkflow(values, assistantMessageId);
    }, 650);
  }

  function handleReset() {
    activeAssistantMessageId.current = null;
    setGenerationMessages([]);
    setGenerationStatus("done");
    setActiveView("home");
  }

  function handleStartNewConversation() {
    activeAssistantMessageId.current = null;
    setGenerationMessages([]);
    setGenerationStatus("done");
    setActiveView("home");
    setComposerText("");
    setPreviewItem(null);
    setIsPreviewOpen(false);
  }

  function handleOpenConversation(conversation: ProposalHistoryConversation) {
    void conversation;
    activeAssistantMessageId.current = null;
    setGenerationMessages([]);
    setGenerationStatus("done");
    setActiveView("home");
    setComposerText("");
  }

  function handleOpenAttachment(item: ProposalPreviewItem) {
    setPreviewItem(item);
    setIsPreviewOpen(true);
  }

  function handleTogglePreview() {
    setIsPreviewOpen((open) => !open);
  }

  function handleClosePreview() {
    setIsPreviewOpen(false);
  }

  function handleSubmitMessage() {
    const prompt = composerText.trim();
    if (!prompt) {
      messageApi.warning("请输入要追加的问题");
      return;
    }
    if (activeView !== "generation") {
      messageApi.success("建议先填写项目参数，系统会按查询、规则、知识和审批流程生成 PPT 初稿");
      return;
    }
    setGenerationMessages((messages) => [
      ...messages,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
      },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `已收到追加问题：${prompt}\n\n我会基于当前 PPT 初稿、workflow 过程和已识别的待复核项继续补充，建议在 PPT 详情页中同步检查对应页面内容。`,
        status: "done",
      },
    ]);
    setComposerText("");
  }

  async function streamProposalWorkflow(values: ProposalFormValues, assistantMessageId: string) {
    const chunks = buildProposalWorkflowChunks(values);
    for (const chunk of chunks) {
      await new Promise((resolve) => window.setTimeout(resolve, chunk.delay));
      if (!isMounted.current || activeAssistantMessageId.current !== assistantMessageId) {
        return;
      }
      setGenerationMessages((messages) =>
        messages.map((item) =>
          item.id === assistantMessageId ? { ...item, content: item.content + chunk.content } : item,
        ),
      );
    }
    if (!isMounted.current || activeAssistantMessageId.current !== assistantMessageId) {
      return;
    }
    setGenerationStatus("done");
    setGenerationMessages((messages) =>
      messages.map((item) => (item.id === assistantMessageId ? { ...item, status: "done" } : item)),
    );
    activeAssistantMessageId.current = null;
    messageApi.success(`${values.projectName} PPT 生成流程已完成`);
  }

  if (activeView === "detail") {
    return <ProposalResultView summary={generatedValues.projectName} values={generatedValues} onReset={handleReset} />;
  }

  return (
    <>
      <ProposalHomeView
        generationMessages={activeView === "generation" ? generationMessages : undefined}
        generationStatus={activeView === "generation" ? generationStatus : undefined}
        generatedValues={activeView === "generation" ? generatedValues : undefined}
        composerText={composerText}
        previewItem={previewItem}
        isPreviewOpen={isPreviewOpen}
        initialProjectId={initialProjectId ?? null}
        initialConversationId={initialConversationId ?? null}
        onOpenForm={() => setIsFormOpen(true)}
        onOpenDetail={() => setActiveView("detail")}
        onOpenAttachment={handleOpenAttachment}
        onTogglePreview={handleTogglePreview}
        onClosePreview={handleClosePreview}
        onOpenConversation={handleOpenConversation}
        onStartNewConversation={handleStartNewConversation}
        onSubmitMessage={handleSubmitMessage}
        setComposerText={setComposerText}
      />
      <Modal
        centered
        width="min(1080px, calc(100vw - 48px))"
        open={isFormOpen}
        title="项目参数录入"
        onCancel={() => setIsFormOpen(false)}
        footer={null}
      >
        {isFormOpen ? <ProposalFormView isGenerating={isGenerating} onGenerate={handleGenerate} /> : null}
      </Modal>
    </>
  );
}
